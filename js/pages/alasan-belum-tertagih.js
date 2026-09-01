/* =========================================================
   LOGIC (JS saja) — Alasan Belum Tertagih (Lain-lain >
   Alasan Belum Tertagih, page:'alasanBelumTertagih'). Dimuat
   otomatis (lazy-load) oleh core.js saat menu ini pertama kali
   diklik — lihat PAGE_MODULES di js/core.js. Markup HTML-nya
   ada di file sebelah: alasan-belum-tertagih.template.js.
   NB: closeModal() dipakai bersama, didefinisikan di core.js.

   Pola CRUD + pencarian/pagination/sort SAMA dengan Badan
   Usaha (badan-usaha.js). BEDA: Reason Code AUTO-GENERATE
   BT{2 digit} berurutan (abtNextKode) & default page-size
   1000 sesuai screenshot (lihat abtPageSize()). */

let abtState = { page:1, search:'', sortField:'kode', sortDir:'asc' };

function renderAlasanBelumTertagihPage(){
  content.innerHTML = tplAbtPage();
  abtState = { page:1, search:'', sortField:'kode', sortDir:'asc' };
  document.getElementById('btnAbtAdd').onclick = () => openAbtModal('add');
  document.getElementById('abtPageSize').onchange = () => { abtState.page = 1; renderAbtTable(); };
  document.getElementById('abtSearch').oninput = (e) => {
    abtState.search = e.target.value.trim().toLowerCase();
    abtState.page = 1;
    renderAbtTable();
  };
  document.querySelectorAll('[data-abt-sort]').forEach(el => el.onclick = () => {
    const field = el.dataset.abtSort;
    if(abtState.sortField === field){
      abtState.sortDir = abtState.sortDir === 'asc' ? 'desc' : 'asc';
    } else {
      abtState.sortField = field;
      abtState.sortDir = 'asc';
    }
    abtState.page = 1;
    renderAbtTable();
  });
  renderAbtTable();
}

function abtPageSize(){
  const sel = document.getElementById('abtPageSize');
  return sel ? parseInt(sel.value, 10) : 1000;
}

function abtFilteredSortedRows(){
  const q = abtState.search;
  let rows = !q ? DATA.alasanBelumTertagih.slice() : DATA.alasanBelumTertagih.filter(r =>
    (r.kode||'').toLowerCase().includes(q) || (r.nama||'').toLowerCase().includes(q));
  const field = abtState.sortField;
  const dir = abtState.sortDir === 'desc' ? -1 : 1;
  rows.sort((a,b) => (a[field]||'').localeCompare(b[field]||'', 'id') * dir);
  return rows;
}

function renderAbtTable(){
  const perPage = abtPageSize();
  const filtered = abtFilteredSortedRows();
  const totalPages = Math.max(1, Math.ceil(filtered.length/perPage));
  if(abtState.page > totalPages) abtState.page = totalPages;
  if(abtState.page < 1) abtState.page = 1;

  document.getElementById('abtTbody').innerHTML = tplAbtRows(filtered, abtState.page, perPage);
  document.getElementById('abtTotal').textContent = `Total Record: ${filtered.length}`;
  document.getElementById('abtPager').innerHTML = tplAbtPager(abtState.page, totalPages);

  ['kode','nama'].forEach(f => {
    const el = document.getElementById(`abtSortIcon_${f}`);
    if(!el) return;
    if(abtState.sortField === f){
      el.innerHTML = abtState.sortDir === 'asc' ? '&#8593;' : '&#8595;';
      el.style.color = 'var(--blue)';
    } else {
      el.innerHTML = '&#8693;';
      el.style.color = 'var(--text-light)';
    }
  });

  const tbody = document.getElementById('abtTbody');
  tbody.querySelectorAll('[data-edit]').forEach(b => b.onclick = (e) => { e.preventDefault(); openAbtModal('edit', +b.dataset.edit); });
  tbody.querySelectorAll('[data-del]').forEach(b => b.onclick = () => openAbtDeleteConfirm(+b.dataset.del));

  const pager = document.getElementById('abtPager');
  pager.querySelectorAll('[data-abtpage]').forEach(b => b.onclick = () => { abtState.page = +b.dataset.abtpage; renderAbtTable(); });
}

function abtNextKode(){
  const nums = DATA.alasanBelumTertagih
    .map(r => /^BT(\d{2,})$/i.exec(r.kode))
    .filter(Boolean)
    .map(m => parseInt(m[1], 10));
  const next = nums.length ? Math.max(...nums) + 1 : 1;
  return 'BT' + String(next).padStart(2, '0');
}

function openAbtModal(mode, idx){
  closeModal();
  const row = mode === 'edit' ? DATA.alasanBelumTertagih[idx] : { kode: abtNextKode(), nama: '' };
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.innerHTML = tplAbtModal(mode, row);
  document.body.appendChild(overlay);
  document.getElementById('modalClose').onclick = closeModal;
  document.getElementById('modalCancel').onclick = closeModal;
  overlay.onclick = (e) => { if(e.target === overlay) closeModal(); };
  document.getElementById('modalSave').onclick = () => {
    const nama = document.getElementById('fAbtNama').value.trim();
    if(!nama){ document.getElementById('fAbtNamaErr').style.display = 'block'; return; }
    if(mode === 'add'){
      DATA.alasanBelumTertagih.push({ kode: row.kode, nama });
    } else {
      DATA.alasanBelumTertagih[idx].nama = nama;
    }
    closeModal();
    renderAbtTable();
  };
}

function openAbtDeleteConfirm(idx){
  closeModal();
  const row = DATA.alasanBelumTertagih[idx];
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.innerHTML = tplAbtDeleteConfirm(row);
  document.body.appendChild(overlay);
  document.getElementById('modalClose').onclick = closeModal;
  document.getElementById('modalCancel').onclick = closeModal;
  overlay.onclick = (e) => { if(e.target === overlay) closeModal(); };
  document.getElementById('modalDelete').onclick = () => {
    DATA.alasanBelumTertagih.splice(idx, 1);
    closeModal();
    renderAbtTable();
  };
}
