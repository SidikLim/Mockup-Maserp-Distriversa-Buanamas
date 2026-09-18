/* =========================================================
   LOGIC (JS saja) — Master Collector (Customer & Penjualan >
   Master & Setting > Collector, page:'masterCollector'). Dimuat
   otomatis (lazy-load) oleh core.js saat menu ini pertama kali
   diklik — lihat PAGE_MODULES di js/core.js. Markup HTML-nya ada
   di file sebelah: master-collector.template.js.
   NB: closeModal() dipakai bersama, didefinisikan di core.js.

   Pola CRUD + pencarian/pagination/sort SAMA dengan Badan Usaha
   (badan-usaha.js): kode diketik manual saat Tambah (di-uppercase,
   wajib, unik — bukan auto-generate), default page-size 10. BEDA:
   ada 2 field tambahan (Area = bebas teks, Aktif = checkbox) —
   lihat catatan keputusan desain di header master-collector.template.js
   utk alasannya (dipakai sbg salah satu sumber picker "Salesman/
   Collector" di Daftar Tagih Piutang, lihat tagihan-piutang.js).
========================================================= */

let colState = { page:1, search:'', sortField:'kode', sortDir:'asc' };

function renderMasterCollectorPage(){
  content.innerHTML = tplColListPage();
  colState = { page:1, search:'', sortField:'kode', sortDir:'asc' };
  document.getElementById('btnColAdd').onclick = () => openColModal('add');
  document.getElementById('colPageSize').onchange = () => { colState.page = 1; renderColTable(); };
  document.getElementById('colSearch').oninput = (e) => {
    colState.search = e.target.value.trim().toLowerCase();
    colState.page = 1;
    renderColTable();
  };
  document.querySelectorAll('[data-col-sort]').forEach(el => el.onclick = () => {
    const field = el.dataset.colSort;
    if(colState.sortField === field){
      colState.sortDir = colState.sortDir === 'asc' ? 'desc' : 'asc';
    } else {
      colState.sortField = field;
      colState.sortDir = 'asc';
    }
    colState.page = 1;
    renderColTable();
  });
  renderColTable();
}

function colPageSize(){
  const sel = document.getElementById('colPageSize');
  return sel ? parseInt(sel.value, 10) : 10;
}

function colFilteredSortedRows(){
  const q = colState.search;
  let rows = !q ? DATA.collector.slice() : DATA.collector.filter(r =>
    (r.kode||'').toLowerCase().includes(q) || (r.nama||'').toLowerCase().includes(q) || (r.area||'').toLowerCase().includes(q));
  const field = colState.sortField;
  const dir = colState.sortDir === 'desc' ? -1 : 1;
  rows.sort((a,b) => (a[field]||'').localeCompare(b[field]||'', 'id') * dir);
  return rows;
}

function renderColTable(){
  const perPage = colPageSize();
  const filtered = colFilteredSortedRows();
  const totalPages = Math.max(1, Math.ceil(filtered.length/perPage));
  if(colState.page > totalPages) colState.page = totalPages;
  if(colState.page < 1) colState.page = 1;

  document.getElementById('colTbody').innerHTML = tplColRows(filtered, colState.page, perPage);
  document.getElementById('colTotal').textContent = `Total Record: ${filtered.length}`;
  document.getElementById('colPager').innerHTML = tplColPager(colState.page, totalPages);

  ['kode','nama'].forEach(f => {
    const el = document.getElementById(`colSortIcon_${f}`);
    if(!el) return;
    if(colState.sortField === f){
      el.innerHTML = colState.sortDir === 'asc' ? '&#8593;' : '&#8595;';
      el.style.color = 'var(--blue)';
    } else {
      el.innerHTML = '&#8693;';
      el.style.color = 'var(--text-light)';
    }
  });

  const tbody = document.getElementById('colTbody');
  tbody.querySelectorAll('[data-edit]').forEach(b => b.onclick = (e) => { e.preventDefault(); openColModal('edit', +b.dataset.edit); });
  tbody.querySelectorAll('[data-del]').forEach(b => b.onclick = () => openColDeleteConfirm(+b.dataset.del));

  const pager = document.getElementById('colPager');
  pager.querySelectorAll('[data-colpage]').forEach(b => b.onclick = () => { colState.page = +b.dataset.colpage; renderColTable(); });
}

function openColModal(mode, idx){
  closeModal();
  const row = mode === 'edit' ? DATA.collector[idx] : { kode:'', nama:'', area:'', aktif:true };
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.innerHTML = tplColModal(mode, row);
  document.body.appendChild(overlay);
  document.getElementById('modalClose').onclick = closeModal;
  document.getElementById('modalCancel').onclick = closeModal;
  overlay.onclick = (e) => { if(e.target === overlay) closeModal(); };
  document.getElementById('modalSave').onclick = () => {
    const kodeEl = document.getElementById('fColKode');
    const kode = kodeEl.value.trim().toUpperCase();
    const nama = document.getElementById('fColNama').value.trim();
    const area = document.getElementById('fColArea').value.trim();
    const aktif = document.getElementById('fColAktif').checked;
    const kodeErr = document.getElementById('fColKodeErr');
    const namaErr = document.getElementById('fColNamaErr');
    kodeErr.style.display = 'none';
    namaErr.style.display = 'none';
    let ok = true;
    if(mode === 'add'){
      if(!kode){
        kodeErr.textContent = 'Kode Collector wajib diisi';
        kodeErr.style.display = 'block'; ok = false;
      } else if(DATA.collector.some(r => (r.kode||'').toUpperCase() === kode)){
        kodeErr.textContent = `Kode Collector "${kode}" sudah terdaftar`;
        kodeErr.style.display = 'block'; ok = false;
      }
    }
    if(!nama){ namaErr.style.display = 'block'; ok = false; }
    if(!ok) return;
    if(mode === 'add'){
      DATA.collector.push({ kode, nama, area, aktif });
    } else {
      DATA.collector[idx].nama = nama;
      DATA.collector[idx].area = area;
      DATA.collector[idx].aktif = aktif;
    }
    closeModal();
    renderColTable();
  };
}

function openColDeleteConfirm(idx){
  closeModal();
  const row = DATA.collector[idx];
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.innerHTML = tplColDeleteConfirm(row);
  document.body.appendChild(overlay);
  document.getElementById('modalClose').onclick = closeModal;
  document.getElementById('modalCancel').onclick = closeModal;
  overlay.onclick = (e) => { if(e.target === overlay) closeModal(); };
  document.getElementById('modalDelete').onclick = () => {
    DATA.collector.splice(idx, 1);
    closeModal();
    renderColTable();
  };
}
