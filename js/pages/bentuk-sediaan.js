/* =========================================================
   LOGIC (JS saja) — Bentuk Sediaan (Persediaan Barang > Master
   & Setting > Bentuk Sediaan, page:'bentukSediaan'). Dimuat
   otomatis (lazy-load) oleh core.js saat menu ini pertama kali
   diklik — lihat PAGE_MODULES di js/core.js. Markup HTML-nya
   ada di file sebelah: bentuk-sediaan.template.js.
   NB: closeModal() dipakai bersama, didefinisikan di core.js.

   Pola CRUD + pencarian/pagination/sort SAMA persis dengan Zat
   Kandungan Aktif (zat-kandungan-aktif.js) — lihat catatan
   lengkap di sana. Beda: kode 3-digit (`SED000` dst., bukan
   5-digit) & default page-size 25 (lihat sedPageSize()).
========================================================= */

let sedState = { page:1, search:'', sortField:'kode', sortDir:'asc' };

function renderBentukSediaanPage(){
  content.innerHTML = tplSedPage();
  sedState = { page:1, search:'', sortField:'kode', sortDir:'asc' };
  document.getElementById('btnSedAdd').onclick = () => openSedModal('add');
  document.getElementById('sedPageSize').onchange = () => { sedState.page = 1; renderSedTable(); };
  document.getElementById('sedSearch').oninput = (e) => {
    sedState.search = e.target.value.trim().toLowerCase();
    sedState.page = 1;
    renderSedTable();
  };
  document.querySelectorAll('[data-sed-sort]').forEach(el => el.onclick = () => {
    const field = el.dataset.sedSort;
    if(sedState.sortField === field){
      sedState.sortDir = sedState.sortDir === 'asc' ? 'desc' : 'asc';
    } else {
      sedState.sortField = field;
      sedState.sortDir = 'asc';
    }
    sedState.page = 1;
    renderSedTable();
  });
  renderSedTable();
}

function sedPageSize(){
  const sel = document.getElementById('sedPageSize');
  return sel ? parseInt(sel.value, 10) : 25;
}

function sedFilteredSortedRows(){
  const q = sedState.search;
  let rows = !q ? DATA.bentukSediaan.slice() : DATA.bentukSediaan.filter(r =>
    (r.kode||'').toLowerCase().includes(q) || (r.nama||'').toLowerCase().includes(q));
  const field = sedState.sortField;
  const dir = sedState.sortDir === 'desc' ? -1 : 1;
  rows.sort((a,b) => (a[field]||'').localeCompare(b[field]||'', 'id') * dir);
  return rows;
}

function renderSedTable(){
  const perPage = sedPageSize();
  const filtered = sedFilteredSortedRows();
  const totalPages = Math.max(1, Math.ceil(filtered.length/perPage));
  if(sedState.page > totalPages) sedState.page = totalPages;
  if(sedState.page < 1) sedState.page = 1;

  document.getElementById('sedTbody').innerHTML = tplSedRows(filtered, sedState.page, perPage);
  document.getElementById('sedTotal').textContent = `Total Record: ${filtered.length}`;
  document.getElementById('sedPager').innerHTML = tplSedPager(sedState.page, totalPages);

  ['kode','nama'].forEach(f => {
    const el = document.getElementById(`sedSortIcon_${f}`);
    if(!el) return;
    if(sedState.sortField === f){
      el.innerHTML = sedState.sortDir === 'asc' ? '&#8593;' : '&#8595;';
      el.style.color = 'var(--blue)';
    } else {
      el.innerHTML = '&#8693;';
      el.style.color = 'var(--text-light)';
    }
  });

  const tbody = document.getElementById('sedTbody');
  tbody.querySelectorAll('[data-edit]').forEach(b => b.onclick = (e) => { e.preventDefault(); openSedModal('edit', +b.dataset.edit); });
  tbody.querySelectorAll('[data-del]').forEach(b => b.onclick = () => openSedDeleteConfirm(+b.dataset.del));

  const pager = document.getElementById('sedPager');
  pager.querySelectorAll('[data-sedpage]').forEach(b => b.onclick = () => { sedState.page = +b.dataset.sedpage; renderSedTable(); });
}

function sedNextKode(){
  const nums = DATA.bentukSediaan
    .map(r => /^SED(\d{3})$/i.exec(r.kode))
    .filter(Boolean)
    .map(m => parseInt(m[1], 10));
  const next = nums.length ? Math.max(...nums) + 1 : 0;
  return 'SED' + String(next).padStart(3, '0');
}

function openSedModal(mode, idx){
  closeModal();
  const row = mode === 'edit' ? DATA.bentukSediaan[idx] : { kode: sedNextKode(), nama: '' };
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.innerHTML = tplSedModal(mode, row);
  document.body.appendChild(overlay);
  document.getElementById('modalClose').onclick = closeModal;
  document.getElementById('modalCancel').onclick = closeModal;
  overlay.onclick = (e) => { if(e.target === overlay) closeModal(); };
  document.getElementById('modalSave').onclick = () => {
    const nama = document.getElementById('fSedNama').value.trim();
    if(!nama){ document.getElementById('fSedNamaErr').style.display = 'block'; return; }
    if(mode === 'add'){
      DATA.bentukSediaan.push({ kode: row.kode, nama });
    } else {
      DATA.bentukSediaan[idx].nama = nama;
    }
    closeModal();
    renderSedTable();
  };
}

function openSedDeleteConfirm(idx){
  closeModal();
  const row = DATA.bentukSediaan[idx];
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.innerHTML = tplSedDeleteConfirm(row);
  document.body.appendChild(overlay);
  document.getElementById('modalClose').onclick = closeModal;
  document.getElementById('modalCancel').onclick = closeModal;
  overlay.onclick = (e) => { if(e.target === overlay) closeModal(); };
  document.getElementById('modalDelete').onclick = () => {
    DATA.bentukSediaan.splice(idx, 1);
    closeModal();
    renderSedTable();
  };
}
