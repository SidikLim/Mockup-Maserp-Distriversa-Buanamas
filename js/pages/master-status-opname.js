/* =========================================================
   LOGIC (JS saja) — Master Status Opname (Customer & Penjualan >
   Master & Setting > Status Opname, page:'masterStatusOpname').
   Dimuat otomatis (lazy-load) oleh core.js saat menu ini pertama
   kali diklik — lihat PAGE_MODULES di js/core.js. Markup HTML-nya
   ada di file sebelah: master-status-opname.template.js.
   NB: closeModal() dipakai bersama, didefinisikan di core.js.

   Pola CRUD + pencarian/pagination/sort SAMA dengan Master Collector
   (master-collector.js)/Badan Usaha: kode diketik manual saat Tambah
   (di-uppercase, wajib, unik — bukan auto-generate), default
   page-size 10, checklist Aktif. Lihat catatan keputusan desain di
   header master-status-opname.template.js utk alasan lengkap
   dibangunnya master ini (menggantikan OPD_STATUS_LIST hardcode di
   opname-dokumen.template.js/.js — lihat opdStatusList()/
   opdStatusOptions() di sana).
========================================================= */

let sopState = { page:1, search:'', sortField:'kode', sortDir:'asc' };

function renderMasterStatusOpnamePage(){
  content.innerHTML = tplSopListPage();
  sopState = { page:1, search:'', sortField:'kode', sortDir:'asc' };
  document.getElementById('btnSopAdd').onclick = () => openSopModal('add');
  document.getElementById('sopPageSize').onchange = () => { sopState.page = 1; renderSopTable(); };
  document.getElementById('sopSearch').oninput = (e) => {
    sopState.search = e.target.value.trim().toLowerCase();
    sopState.page = 1;
    renderSopTable();
  };
  document.querySelectorAll('[data-sop-sort]').forEach(el => el.onclick = () => {
    const field = el.dataset.sopSort;
    if(sopState.sortField === field){
      sopState.sortDir = sopState.sortDir === 'asc' ? 'desc' : 'asc';
    } else {
      sopState.sortField = field;
      sopState.sortDir = 'asc';
    }
    sopState.page = 1;
    renderSopTable();
  });
  renderSopTable();
}

function sopPageSize(){
  const sel = document.getElementById('sopPageSize');
  return sel ? parseInt(sel.value, 10) : 10;
}

function sopFilteredSortedRows(){
  const q = sopState.search;
  let rows = !q ? DATA.statusOpname.slice() : DATA.statusOpname.filter(r =>
    (r.kode||'').toLowerCase().includes(q) || (r.nama||'').toLowerCase().includes(q));
  const field = sopState.sortField;
  const dir = sopState.sortDir === 'desc' ? -1 : 1;
  rows.sort((a,b) => (a[field]||'').localeCompare(b[field]||'', 'id') * dir);
  return rows;
}

function renderSopTable(){
  const perPage = sopPageSize();
  const filtered = sopFilteredSortedRows();
  const totalPages = Math.max(1, Math.ceil(filtered.length/perPage));
  if(sopState.page > totalPages) sopState.page = totalPages;
  if(sopState.page < 1) sopState.page = 1;

  document.getElementById('sopTbody').innerHTML = tplSopRows(filtered, sopState.page, perPage);
  document.getElementById('sopTotal').textContent = `Total Record: ${filtered.length}`;
  document.getElementById('sopPager').innerHTML = tplSopPager(sopState.page, totalPages);

  ['kode','nama'].forEach(f => {
    const el = document.getElementById(`sopSortIcon_${f}`);
    if(!el) return;
    if(sopState.sortField === f){
      el.innerHTML = sopState.sortDir === 'asc' ? '&#8593;' : '&#8595;';
      el.style.color = 'var(--blue)';
    } else {
      el.innerHTML = '&#8693;';
      el.style.color = 'var(--text-light)';
    }
  });

  const tbody = document.getElementById('sopTbody');
  tbody.querySelectorAll('[data-edit]').forEach(b => b.onclick = (e) => { e.preventDefault(); openSopModal('edit', +b.dataset.edit); });
  tbody.querySelectorAll('[data-del]').forEach(b => b.onclick = () => openSopDeleteConfirm(+b.dataset.del));

  const pager = document.getElementById('sopPager');
  pager.querySelectorAll('[data-soppage]').forEach(b => b.onclick = () => { sopState.page = +b.dataset.soppage; renderSopTable(); });
}

function openSopModal(mode, idx){
  closeModal();
  const row = mode === 'edit' ? DATA.statusOpname[idx] : { kode:'', nama:'', aktif:true };
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.innerHTML = tplSopModal(mode, row);
  document.body.appendChild(overlay);
  document.getElementById('modalClose').onclick = closeModal;
  document.getElementById('modalCancel').onclick = closeModal;
  overlay.onclick = (e) => { if(e.target === overlay) closeModal(); };
  document.getElementById('modalSave').onclick = () => {
    const kodeEl = document.getElementById('fSopKode');
    const kode = kodeEl.value.trim().toUpperCase();
    const nama = document.getElementById('fSopNama').value.trim();
    const aktif = document.getElementById('fSopAktif').checked;
    const kodeErr = document.getElementById('fSopKodeErr');
    const namaErr = document.getElementById('fSopNamaErr');
    kodeErr.style.display = 'none';
    namaErr.style.display = 'none';
    let ok = true;
    if(mode === 'add'){
      if(!kode){
        kodeErr.textContent = 'Kode Status wajib diisi';
        kodeErr.style.display = 'block'; ok = false;
      } else if(DATA.statusOpname.some(r => (r.kode||'').toUpperCase() === kode)){
        kodeErr.textContent = `Kode Status "${kode}" sudah terdaftar`;
        kodeErr.style.display = 'block'; ok = false;
      }
    }
    if(!nama){ namaErr.style.display = 'block'; ok = false; }
    if(!ok) return;
    if(mode === 'add'){
      DATA.statusOpname.push({ kode, nama, aktif });
    } else {
      DATA.statusOpname[idx].nama = nama;
      DATA.statusOpname[idx].aktif = aktif;
    }
    closeModal();
    renderSopTable();
  };
}

function openSopDeleteConfirm(idx){
  closeModal();
  const row = DATA.statusOpname[idx];
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.innerHTML = tplSopDeleteConfirm(row);
  document.body.appendChild(overlay);
  document.getElementById('modalClose').onclick = closeModal;
  document.getElementById('modalCancel').onclick = closeModal;
  overlay.onclick = (e) => { if(e.target === overlay) closeModal(); };
  document.getElementById('modalDelete').onclick = () => {
    DATA.statusOpname.splice(idx, 1);
    closeModal();
    renderSopTable();
  };
}
