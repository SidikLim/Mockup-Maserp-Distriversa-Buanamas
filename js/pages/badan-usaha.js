/* =========================================================
   LOGIC (JS saja) — Badan Usaha (Customer & Penjualan >
   Master & Setting > Badan Usaha, page:'badanUsaha'). Dimuat
   otomatis (lazy-load) oleh core.js saat menu ini pertama kali
   diklik — lihat PAGE_MODULES di js/core.js. Markup HTML-nya
   ada di file sebelah: badan-usaha.template.js.
   NB: closeModal() dipakai bersama, didefinisikan di core.js.

   Pola CRUD + pencarian/pagination/sort SAMA dengan Bentuk
   Sediaan (bentuk-sediaan.js). BEDA: kode diketik manual saat
   Tambah (di-uppercase, wajib, unik — bukan auto-generate) &
   default page-size 10 (lihat buPageSize() + tplBuPage()).
========================================================= */

let buState = { page:1, search:'', sortField:'kode', sortDir:'asc' };

function renderBadanUsahaPage(){
  content.innerHTML = tplBuPage();
  buState = { page:1, search:'', sortField:'kode', sortDir:'asc' };
  document.getElementById('btnBuAdd').onclick = () => openBuModal('add');
  document.getElementById('buPageSize').onchange = () => { buState.page = 1; renderBuTable(); };
  document.getElementById('buSearch').oninput = (e) => {
    buState.search = e.target.value.trim().toLowerCase();
    buState.page = 1;
    renderBuTable();
  };
  document.querySelectorAll('[data-bu-sort]').forEach(el => el.onclick = () => {
    const field = el.dataset.buSort;
    if(buState.sortField === field){
      buState.sortDir = buState.sortDir === 'asc' ? 'desc' : 'asc';
    } else {
      buState.sortField = field;
      buState.sortDir = 'asc';
    }
    buState.page = 1;
    renderBuTable();
  });
  renderBuTable();
}

function buPageSize(){
  const sel = document.getElementById('buPageSize');
  return sel ? parseInt(sel.value, 10) : 10;
}

function buFilteredSortedRows(){
  const q = buState.search;
  let rows = !q ? DATA.badanUsaha.slice() : DATA.badanUsaha.filter(r =>
    (r.kode||'').toLowerCase().includes(q) || (r.nama||'').toLowerCase().includes(q));
  const field = buState.sortField;
  const dir = buState.sortDir === 'desc' ? -1 : 1;
  rows.sort((a,b) => (a[field]||'').localeCompare(b[field]||'', 'id') * dir);
  return rows;
}

function renderBuTable(){
  const perPage = buPageSize();
  const filtered = buFilteredSortedRows();
  const totalPages = Math.max(1, Math.ceil(filtered.length/perPage));
  if(buState.page > totalPages) buState.page = totalPages;
  if(buState.page < 1) buState.page = 1;

  document.getElementById('buTbody').innerHTML = tplBuRows(filtered, buState.page, perPage);
  document.getElementById('buTotal').textContent = `Total Record: ${filtered.length}`;
  document.getElementById('buPager').innerHTML = tplBuPager(buState.page, totalPages);

  ['kode','nama'].forEach(f => {
    const el = document.getElementById(`buSortIcon_${f}`);
    if(!el) return;
    if(buState.sortField === f){
      el.innerHTML = buState.sortDir === 'asc' ? '&#8593;' : '&#8595;';
      el.style.color = 'var(--blue)';
    } else {
      el.innerHTML = '&#8693;';
      el.style.color = 'var(--text-light)';
    }
  });

  const tbody = document.getElementById('buTbody');
  tbody.querySelectorAll('[data-edit]').forEach(b => b.onclick = (e) => { e.preventDefault(); openBuModal('edit', +b.dataset.edit); });
  tbody.querySelectorAll('[data-del]').forEach(b => b.onclick = () => openBuDeleteConfirm(+b.dataset.del));

  const pager = document.getElementById('buPager');
  pager.querySelectorAll('[data-bupage]').forEach(b => b.onclick = () => { buState.page = +b.dataset.bupage; renderBuTable(); });
}

function openBuModal(mode, idx){
  closeModal();
  const row = mode === 'edit' ? DATA.badanUsaha[idx] : { kode:'', nama:'' };
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.innerHTML = tplBuModal(mode, row);
  document.body.appendChild(overlay);
  document.getElementById('modalClose').onclick = closeModal;
  document.getElementById('modalCancel').onclick = closeModal;
  overlay.onclick = (e) => { if(e.target === overlay) closeModal(); };
  document.getElementById('modalSave').onclick = () => {
    const kodeEl = document.getElementById('fBuKode');
    const kode = kodeEl.value.trim().toUpperCase();
    const nama = document.getElementById('fBuNama').value.trim();
    const kodeErr = document.getElementById('fBuKodeErr');
    const namaErr = document.getElementById('fBuNamaErr');
    kodeErr.style.display = 'none';
    namaErr.style.display = 'none';
    let ok = true;
    if(mode === 'add'){
      if(!kode){
        kodeErr.textContent = 'Kode Badan Usaha wajib diisi';
        kodeErr.style.display = 'block'; ok = false;
      } else if(DATA.badanUsaha.some(r => (r.kode||'').toUpperCase() === kode)){
        kodeErr.textContent = `Kode Badan Usaha "${kode}" sudah terdaftar`;
        kodeErr.style.display = 'block'; ok = false;
      }
    }
    if(!nama){ namaErr.style.display = 'block'; ok = false; }
    if(!ok) return;
    if(mode === 'add'){
      DATA.badanUsaha.push({ kode, nama });
    } else {
      DATA.badanUsaha[idx].nama = nama;
    }
    closeModal();
    renderBuTable();
  };
}

function openBuDeleteConfirm(idx){
  closeModal();
  const row = DATA.badanUsaha[idx];
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.innerHTML = tplBuDeleteConfirm(row);
  document.body.appendChild(overlay);
  document.getElementById('modalClose').onclick = closeModal;
  document.getElementById('modalCancel').onclick = closeModal;
  overlay.onclick = (e) => { if(e.target === overlay) closeModal(); };
  document.getElementById('modalDelete').onclick = () => {
    DATA.badanUsaha.splice(idx, 1);
    closeModal();
    renderBuTable();
  };
}
