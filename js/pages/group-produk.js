/* =========================================================
   LOGIC (JS saja) — Group Produk (Persediaan Barang > Master &
   Setting > Group Produk, page:'groupProduk'). Dimuat otomatis
   (lazy-load) oleh core.js saat menu ini pertama kali diklik —
   lihat PAGE_MODULES di js/core.js. Markup HTML-nya ada di file
   sebelah: group-produk.template.js.
   NB: closeModal() dipakai bersama, didefinisikan di core.js.

   Pola CRUD sederhana pola Master Divisi (kode manual, wajib
   unik, readonly di mode Ubah) + sort kolom, sama seperti
   Kategori Reordering Sheet.
========================================================= */

let grpState = { page:1, search:'', sortField:'kode', sortDir:'asc' };

function renderGroupProdukPage(){
  content.innerHTML = tplGrpPage();
  grpState = { page:1, search:'', sortField:'kode', sortDir:'asc' };
  document.getElementById('btnGrpAdd').onclick = () => openGrpModal('add');
  document.getElementById('grpPageSize').onchange = () => { grpState.page = 1; renderGrpTable(); };
  document.getElementById('grpSearch').oninput = (e) => {
    grpState.search = e.target.value.trim().toLowerCase();
    grpState.page = 1;
    renderGrpTable();
  };
  document.querySelectorAll('[data-grp-sort]').forEach(el => el.onclick = () => {
    const field = el.dataset.grpSort;
    if(grpState.sortField === field){
      grpState.sortDir = grpState.sortDir === 'asc' ? 'desc' : 'asc';
    } else {
      grpState.sortField = field;
      grpState.sortDir = 'asc';
    }
    grpState.page = 1;
    renderGrpTable();
  });
  renderGrpTable();
}

function grpPageSize(){
  const sel = document.getElementById('grpPageSize');
  return sel ? parseInt(sel.value, 10) : 10;
}

function grpFilteredSortedRows(){
  const q = grpState.search;
  let rows = !q ? DATA.groupProduk.slice() : DATA.groupProduk.filter(r =>
    (r.kode||'').toLowerCase().includes(q) || (r.nama||'').toLowerCase().includes(q) || (r.keterangan||'').toLowerCase().includes(q));
  const field = grpState.sortField;
  const dir = grpState.sortDir === 'desc' ? -1 : 1;
  rows.sort((a,b) => (a[field]||'').localeCompare(b[field]||'', 'id') * dir);
  return rows;
}

function renderGrpTable(){
  const perPage = grpPageSize();
  const filtered = grpFilteredSortedRows();
  const totalPages = Math.max(1, Math.ceil(filtered.length/perPage));
  if(grpState.page > totalPages) grpState.page = totalPages;
  if(grpState.page < 1) grpState.page = 1;

  document.getElementById('grpTbody').innerHTML = tplGrpRows(filtered, grpState.page, perPage);
  document.getElementById('grpTotal').textContent = `Total Record: ${filtered.length}`;
  document.getElementById('grpPager').innerHTML = tplGrpPager(grpState.page, totalPages);

  ['kode','nama'].forEach(f => {
    const el = document.getElementById(`grpSortIcon_${f}`);
    if(!el) return;
    if(grpState.sortField === f){
      el.innerHTML = grpState.sortDir === 'asc' ? '&#8593;' : '&#8595;';
      el.style.color = 'var(--blue)';
    } else {
      el.innerHTML = '&#8693;';
      el.style.color = 'var(--text-light)';
    }
  });

  const tbody = document.getElementById('grpTbody');
  tbody.querySelectorAll('[data-edit]').forEach(b => b.onclick = (e) => { e.preventDefault(); openGrpModal('edit', +b.dataset.edit); });
  tbody.querySelectorAll('[data-del]').forEach(b => b.onclick = () => openGrpDeleteConfirm(+b.dataset.del));

  const pager = document.getElementById('grpPager');
  pager.querySelectorAll('[data-grppage]').forEach(b => b.onclick = () => { grpState.page = +b.dataset.grppage; renderGrpTable(); });
}

function openGrpModal(mode, idx){
  closeModal();
  const row = mode === 'edit' ? DATA.groupProduk[idx] : { kode: '', nama: '', keterangan: '' };
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.innerHTML = tplGrpModal(mode, row);
  document.body.appendChild(overlay);
  document.getElementById('modalClose').onclick = closeModal;
  document.getElementById('modalCancel').onclick = closeModal;
  overlay.onclick = (e) => { if(e.target === overlay) closeModal(); };
  document.getElementById('modalSave').onclick = () => {
    const kode = document.getElementById('fGrpKode').value.trim().toUpperCase();
    const nama = document.getElementById('fGrpNama').value.trim();
    const keterangan = document.getElementById('fGrpKeterangan').value.trim();
    let ok = true;
    if(!kode){ document.getElementById('fGrpKodeErr').textContent = 'Kode Group Produk wajib diisi'; document.getElementById('fGrpKodeErr').style.display = 'block'; ok = false; }
    else if(mode === 'add' && DATA.groupProduk.some(r => r.kode.toUpperCase() === kode)){
      document.getElementById('fGrpKodeErr').textContent = 'Kode sudah dipakai, gunakan kode lain'; document.getElementById('fGrpKodeErr').style.display = 'block'; ok = false;
    } else {
      document.getElementById('fGrpKodeErr').style.display = 'none';
    }
    if(!nama){ document.getElementById('fGrpNamaErr').style.display = 'block'; ok = false; } else { document.getElementById('fGrpNamaErr').style.display = 'none'; }
    if(!ok) return;
    if(mode === 'add'){
      DATA.groupProduk.push({ kode, nama, keterangan });
    } else {
      DATA.groupProduk[idx].nama = nama;
      DATA.groupProduk[idx].keterangan = keterangan;
    }
    closeModal();
    renderGrpTable();
  };
}

function openGrpDeleteConfirm(idx){
  closeModal();
  const row = DATA.groupProduk[idx];
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.innerHTML = tplGrpDeleteConfirm(row);
  document.body.appendChild(overlay);
  document.getElementById('modalClose').onclick = closeModal;
  document.getElementById('modalCancel').onclick = closeModal;
  overlay.onclick = (e) => { if(e.target === overlay) closeModal(); };
  document.getElementById('modalDelete').onclick = () => {
    DATA.groupProduk.splice(idx, 1);
    closeModal();
    renderGrpTable();
  };
}
