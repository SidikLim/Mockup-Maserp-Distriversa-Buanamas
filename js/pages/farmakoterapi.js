/* =========================================================
   LOGIC (JS saja) — Farmakoterapi (Persediaan Barang > Master
   & Setting > Farmakoterapi, page:'farmakoterapi'). Dimuat
   otomatis (lazy-load) oleh core.js saat menu ini pertama kali
   diklik — lihat PAGE_MODULES di js/core.js. Markup HTML-nya
   ada di file sebelah: farmakoterapi.template.js.
   NB: closeModal() dipakai bersama, didefinisikan di core.js.

   Pola CRUD + pencarian/pagination/sort SAMA persis dengan Zat
   Kandungan Aktif (zat-kandungan-aktif.js) — lihat catatan
   lengkap di sana, tidak diulang di sini.
========================================================= */

let frkState = { page:1, search:'', sortField:'kode', sortDir:'asc' };

function renderFarmakoterapiPage(){
  content.innerHTML = tplFrkPage();
  frkState = { page:1, search:'', sortField:'kode', sortDir:'asc' };
  document.getElementById('btnFrkAdd').onclick = () => openFrkModal('add');
  document.getElementById('frkPageSize').onchange = () => { frkState.page = 1; renderFrkTable(); };
  document.getElementById('frkSearch').oninput = (e) => {
    frkState.search = e.target.value.trim().toLowerCase();
    frkState.page = 1;
    renderFrkTable();
  };
  document.querySelectorAll('[data-frk-sort]').forEach(el => el.onclick = () => {
    const field = el.dataset.frkSort;
    if(frkState.sortField === field){
      frkState.sortDir = frkState.sortDir === 'asc' ? 'desc' : 'asc';
    } else {
      frkState.sortField = field;
      frkState.sortDir = 'asc';
    }
    frkState.page = 1;
    renderFrkTable();
  });
  renderFrkTable();
}

function frkPageSize(){
  const sel = document.getElementById('frkPageSize');
  return sel ? parseInt(sel.value, 10) : 10;
}

function frkFilteredSortedRows(){
  const q = frkState.search;
  let rows = !q ? DATA.farmakoterapi.slice() : DATA.farmakoterapi.filter(r =>
    (r.kode||'').toLowerCase().includes(q) || (r.nama||'').toLowerCase().includes(q));
  const field = frkState.sortField;
  const dir = frkState.sortDir === 'desc' ? -1 : 1;
  rows.sort((a,b) => (a[field]||'').localeCompare(b[field]||'', 'id') * dir);
  return rows;
}

function renderFrkTable(){
  const perPage = frkPageSize();
  const filtered = frkFilteredSortedRows();
  const totalPages = Math.max(1, Math.ceil(filtered.length/perPage));
  if(frkState.page > totalPages) frkState.page = totalPages;
  if(frkState.page < 1) frkState.page = 1;

  document.getElementById('frkTbody').innerHTML = tplFrkRows(filtered, frkState.page, perPage);
  document.getElementById('frkTotal').textContent = `Total Record: ${filtered.length}`;
  document.getElementById('frkPager').innerHTML = tplFrkPager(frkState.page, totalPages);

  ['kode','nama'].forEach(f => {
    const el = document.getElementById(`frkSortIcon_${f}`);
    if(!el) return;
    if(frkState.sortField === f){
      el.innerHTML = frkState.sortDir === 'asc' ? '&#8593;' : '&#8595;';
      el.style.color = 'var(--blue)';
    } else {
      el.innerHTML = '&#8693;';
      el.style.color = 'var(--text-light)';
    }
  });

  const tbody = document.getElementById('frkTbody');
  tbody.querySelectorAll('[data-edit]').forEach(b => b.onclick = (e) => { e.preventDefault(); openFrkModal('edit', +b.dataset.edit); });
  tbody.querySelectorAll('[data-del]').forEach(b => b.onclick = () => openFrkDeleteConfirm(+b.dataset.del));

  const pager = document.getElementById('frkPager');
  pager.querySelectorAll('[data-frkpage]').forEach(b => b.onclick = () => { frkState.page = +b.dataset.frkpage; renderFrkTable(); });
}

function frkNextKode(){
  const nums = DATA.farmakoterapi
    .map(r => /^FRK(\d{5})$/i.exec(r.kode))
    .filter(Boolean)
    .map(m => parseInt(m[1], 10));
  const next = nums.length ? Math.max(...nums) + 1 : 0;
  return 'FRK' + String(next).padStart(5, '0');
}

function openFrkModal(mode, idx){
  closeModal();
  const row = mode === 'edit' ? DATA.farmakoterapi[idx] : { kode: frkNextKode(), nama: '' };
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.innerHTML = tplFrkModal(mode, row);
  document.body.appendChild(overlay);
  document.getElementById('modalClose').onclick = closeModal;
  document.getElementById('modalCancel').onclick = closeModal;
  overlay.onclick = (e) => { if(e.target === overlay) closeModal(); };
  document.getElementById('modalSave').onclick = () => {
    const nama = document.getElementById('fFrkNama').value.trim();
    if(!nama){ document.getElementById('fFrkNamaErr').style.display = 'block'; return; }
    if(mode === 'add'){
      DATA.farmakoterapi.push({ kode: row.kode, nama });
    } else {
      DATA.farmakoterapi[idx].nama = nama;
    }
    closeModal();
    renderFrkTable();
  };
}

function openFrkDeleteConfirm(idx){
  closeModal();
  const row = DATA.farmakoterapi[idx];
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.innerHTML = tplFrkDeleteConfirm(row);
  document.body.appendChild(overlay);
  document.getElementById('modalClose').onclick = closeModal;
  document.getElementById('modalCancel').onclick = closeModal;
  overlay.onclick = (e) => { if(e.target === overlay) closeModal(); };
  document.getElementById('modalDelete').onclick = () => {
    DATA.farmakoterapi.splice(idx, 1);
    closeModal();
    renderFrkTable();
  };
}
