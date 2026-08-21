/* =========================================================
   LOGIC (JS saja) — Zat Kandungan Aktif (Persediaan Barang >
   Master & Setting > Zat Kandungan Aktif, page:'zatKandunganAktif').
   Dimuat otomatis (lazy-load) oleh core.js saat menu ini pertama
   kali diklik — lihat PAGE_MODULES di js/core.js. Markup HTML-nya
   ada di file sebelah: zat-kandungan-aktif.template.js.
   NB: closeModal() dipakai bersama, didefinisikan di core.js.

   Pola CRUD: list + modal Tambah/Ubah sederhana (2 field, sama
   pola Master Divisi) TAPI dengan pencarian/pagination/sort yang
   SUNGGUHAN fungsional (60 baris data, cukup untuk didemokan
   nyata) — lihat catatan lengkap di zat-kandungan-aktif.template.js.
========================================================= */

let zkaState = { page:1, search:'', sortField:'kode', sortDir:'asc' };

function renderZatKandunganAktifPage(){
  content.innerHTML = tplZkaPage();
  zkaState = { page:1, search:'', sortField:'kode', sortDir:'asc' };
  document.getElementById('btnZkaAdd').onclick = () => openZkaModal('add');
  document.getElementById('zkaPageSize').onchange = () => { zkaState.page = 1; renderZkaTable(); };
  document.getElementById('zkaSearch').oninput = (e) => {
    zkaState.search = e.target.value.trim().toLowerCase();
    zkaState.page = 1;
    renderZkaTable();
  };
  document.querySelectorAll('[data-zka-sort]').forEach(el => el.onclick = () => {
    const field = el.dataset.zkaSort;
    if(zkaState.sortField === field){
      zkaState.sortDir = zkaState.sortDir === 'asc' ? 'desc' : 'asc';
    } else {
      zkaState.sortField = field;
      zkaState.sortDir = 'asc';
    }
    zkaState.page = 1;
    renderZkaTable();
  });
  renderZkaTable();
}

function zkaPageSize(){
  const sel = document.getElementById('zkaPageSize');
  return sel ? parseInt(sel.value, 10) : 10;
}

function zkaFilteredSortedRows(){
  const q = zkaState.search;
  let rows = !q ? DATA.zatKandunganAktif.slice() : DATA.zatKandunganAktif.filter(r =>
    (r.kode||'').toLowerCase().includes(q) || (r.nama||'').toLowerCase().includes(q));
  const field = zkaState.sortField;
  const dir = zkaState.sortDir === 'desc' ? -1 : 1;
  rows.sort((a,b) => (a[field]||'').localeCompare(b[field]||'', 'id') * dir);
  return rows;
}

function renderZkaTable(){
  const perPage = zkaPageSize();
  const filtered = zkaFilteredSortedRows();
  const totalPages = Math.max(1, Math.ceil(filtered.length/perPage));
  if(zkaState.page > totalPages) zkaState.page = totalPages;
  if(zkaState.page < 1) zkaState.page = 1;

  document.getElementById('zkaTbody').innerHTML = tplZkaRows(filtered, zkaState.page, perPage);
  document.getElementById('zkaTotal').textContent = `Total Record: ${filtered.length}`;
  document.getElementById('zkaPager').innerHTML = tplZkaPager(zkaState.page, totalPages);

  ['kode','nama'].forEach(f => {
    const el = document.getElementById(`zkaSortIcon_${f}`);
    if(!el) return;
    if(zkaState.sortField === f){
      el.innerHTML = zkaState.sortDir === 'asc' ? '&#8593;' : '&#8595;';
      el.style.color = 'var(--blue)';
    } else {
      el.innerHTML = '&#8693;';
      el.style.color = 'var(--text-light)';
    }
  });

  const tbody = document.getElementById('zkaTbody');
  tbody.querySelectorAll('[data-edit]').forEach(b => b.onclick = (e) => { e.preventDefault(); openZkaModal('edit', +b.dataset.edit); });
  tbody.querySelectorAll('[data-del]').forEach(b => b.onclick = () => openZkaDeleteConfirm(+b.dataset.del));

  const pager = document.getElementById('zkaPager');
  pager.querySelectorAll('[data-zkapage]').forEach(b => b.onclick = () => { zkaState.page = +b.dataset.zkapage; renderZkaTable(); });
}

function zkaNextKode(){
  const nums = DATA.zatKandunganAktif
    .map(r => /^KZA(\d{5})$/i.exec(r.kode))
    .filter(Boolean)
    .map(m => parseInt(m[1], 10));
  const next = nums.length ? Math.max(...nums) + 1 : 0;
  return 'KZA' + String(next).padStart(5, '0');
}

function openZkaModal(mode, idx){
  closeModal();
  const row = mode === 'edit' ? DATA.zatKandunganAktif[idx] : { kode: zkaNextKode(), nama: '' };
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.innerHTML = tplZkaModal(mode, row);
  document.body.appendChild(overlay);
  document.getElementById('modalClose').onclick = closeModal;
  document.getElementById('modalCancel').onclick = closeModal;
  overlay.onclick = (e) => { if(e.target === overlay) closeModal(); };
  document.getElementById('modalSave').onclick = () => {
    const nama = document.getElementById('fZkaNama').value.trim();
    if(!nama){ document.getElementById('fZkaNamaErr').style.display = 'block'; return; }
    if(mode === 'add'){
      DATA.zatKandunganAktif.push({ kode: row.kode, nama });
    } else {
      DATA.zatKandunganAktif[idx].nama = nama;
    }
    closeModal();
    renderZkaTable();
  };
}

function openZkaDeleteConfirm(idx){
  closeModal();
  const row = DATA.zatKandunganAktif[idx];
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.innerHTML = tplZkaDeleteConfirm(row);
  document.body.appendChild(overlay);
  document.getElementById('modalClose').onclick = closeModal;
  document.getElementById('modalCancel').onclick = closeModal;
  overlay.onclick = (e) => { if(e.target === overlay) closeModal(); };
  document.getElementById('modalDelete').onclick = () => {
    DATA.zatKandunganAktif.splice(idx, 1);
    closeModal();
    renderZkaTable();
  };
}
