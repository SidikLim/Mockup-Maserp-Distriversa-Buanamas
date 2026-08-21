/* =========================================================
   LOGIC (JS saja) — Sub-Farmakoterapi (Persediaan Barang >
   Master & Setting > Sub-Farmakoterapi, page:'subFarmakoterapi').
   Dimuat otomatis (lazy-load) oleh core.js saat menu ini
   pertama kali diklik — lihat PAGE_MODULES di js/core.js.
   Markup HTML-nya ada di file sebelah: sub-farmakoterapi.template.js.
   NB: closeModal() dipakai bersama, didefinisikan di core.js.

   Pola CRUD + pencarian/pagination/sort SAMA persis dengan Zat
   Kandungan Aktif/Farmakoterapi — lihat catatan lengkap di
   zat-kandungan-aktif.js. Beda: default page-size 20 (bukan 10)
   — lihat sfkPageSize().
========================================================= */

let sfkState = { page:1, search:'', sortField:'kode', sortDir:'asc' };

function renderSubFarmakoterapiPage(){
  content.innerHTML = tplSfkPage();
  sfkState = { page:1, search:'', sortField:'kode', sortDir:'asc' };
  document.getElementById('btnSfkAdd').onclick = () => openSfkModal('add');
  document.getElementById('sfkPageSize').onchange = () => { sfkState.page = 1; renderSfkTable(); };
  document.getElementById('sfkSearch').oninput = (e) => {
    sfkState.search = e.target.value.trim().toLowerCase();
    sfkState.page = 1;
    renderSfkTable();
  };
  document.querySelectorAll('[data-sfk-sort]').forEach(el => el.onclick = () => {
    const field = el.dataset.sfkSort;
    if(sfkState.sortField === field){
      sfkState.sortDir = sfkState.sortDir === 'asc' ? 'desc' : 'asc';
    } else {
      sfkState.sortField = field;
      sfkState.sortDir = 'asc';
    }
    sfkState.page = 1;
    renderSfkTable();
  });
  renderSfkTable();
}

function sfkPageSize(){
  const sel = document.getElementById('sfkPageSize');
  return sel ? parseInt(sel.value, 10) : 20;
}

function sfkFilteredSortedRows(){
  const q = sfkState.search;
  let rows = !q ? DATA.subFarmakoterapi.slice() : DATA.subFarmakoterapi.filter(r =>
    (r.kode||'').toLowerCase().includes(q) || (r.nama||'').toLowerCase().includes(q));
  const field = sfkState.sortField;
  const dir = sfkState.sortDir === 'desc' ? -1 : 1;
  rows.sort((a,b) => (a[field]||'').localeCompare(b[field]||'', 'id') * dir);
  return rows;
}

function renderSfkTable(){
  const perPage = sfkPageSize();
  const filtered = sfkFilteredSortedRows();
  const totalPages = Math.max(1, Math.ceil(filtered.length/perPage));
  if(sfkState.page > totalPages) sfkState.page = totalPages;
  if(sfkState.page < 1) sfkState.page = 1;

  document.getElementById('sfkTbody').innerHTML = tplSfkRows(filtered, sfkState.page, perPage);
  document.getElementById('sfkTotal').textContent = `Total Record: ${filtered.length}`;
  document.getElementById('sfkPager').innerHTML = tplSfkPager(sfkState.page, totalPages);

  ['kode','nama'].forEach(f => {
    const el = document.getElementById(`sfkSortIcon_${f}`);
    if(!el) return;
    if(sfkState.sortField === f){
      el.innerHTML = sfkState.sortDir === 'asc' ? '&#8593;' : '&#8595;';
      el.style.color = 'var(--blue)';
    } else {
      el.innerHTML = '&#8693;';
      el.style.color = 'var(--text-light)';
    }
  });

  const tbody = document.getElementById('sfkTbody');
  tbody.querySelectorAll('[data-edit]').forEach(b => b.onclick = (e) => { e.preventDefault(); openSfkModal('edit', +b.dataset.edit); });
  tbody.querySelectorAll('[data-del]').forEach(b => b.onclick = () => openSfkDeleteConfirm(+b.dataset.del));

  const pager = document.getElementById('sfkPager');
  pager.querySelectorAll('[data-sfkpage]').forEach(b => b.onclick = () => { sfkState.page = +b.dataset.sfkpage; renderSfkTable(); });
}

function sfkNextKode(){
  const nums = DATA.subFarmakoterapi
    .map(r => /^SFK(\d{5})$/i.exec(r.kode))
    .filter(Boolean)
    .map(m => parseInt(m[1], 10));
  const next = nums.length ? Math.max(...nums) + 1 : 0;
  return 'SFK' + String(next).padStart(5, '0');
}

function openSfkModal(mode, idx){
  closeModal();
  const row = mode === 'edit' ? DATA.subFarmakoterapi[idx] : { kode: sfkNextKode(), nama: '' };
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.innerHTML = tplSfkModal(mode, row);
  document.body.appendChild(overlay);
  document.getElementById('modalClose').onclick = closeModal;
  document.getElementById('modalCancel').onclick = closeModal;
  overlay.onclick = (e) => { if(e.target === overlay) closeModal(); };
  document.getElementById('modalSave').onclick = () => {
    const nama = document.getElementById('fSfkNama').value.trim();
    if(!nama){ document.getElementById('fSfkNamaErr').style.display = 'block'; return; }
    if(mode === 'add'){
      DATA.subFarmakoterapi.push({ kode: row.kode, nama });
    } else {
      DATA.subFarmakoterapi[idx].nama = nama;
    }
    closeModal();
    renderSfkTable();
  };
}

function openSfkDeleteConfirm(idx){
  closeModal();
  const row = DATA.subFarmakoterapi[idx];
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.innerHTML = tplSfkDeleteConfirm(row);
  document.body.appendChild(overlay);
  document.getElementById('modalClose').onclick = closeModal;
  document.getElementById('modalCancel').onclick = closeModal;
  overlay.onclick = (e) => { if(e.target === overlay) closeModal(); };
  document.getElementById('modalDelete').onclick = () => {
    DATA.subFarmakoterapi.splice(idx, 1);
    closeModal();
    renderSfkTable();
  };
}
