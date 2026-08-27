/* =========================================================
   LOGIC (JS saja) — Satuan (Persediaan Barang > Master &
   Setting > Satuan, page:'satuan'). Dimuat otomatis (lazy-load)
   oleh core.js saat menu ini pertama kali diklik — lihat
   PAGE_MODULES di js/core.js. Markup HTML-nya ada di file
   sebelah: satuan.template.js.
   NB: closeModal() dipakai bersama, didefinisikan di core.js.

   Pola CRUD sederhana pola Group Produk/Zat Kandungan Aktif:
   kode MANUAL (bukan auto-generate), wajib unik, readonly di
   mode Ubah, + sort kolom & pager windowed sungguhan fungsional
   — lihat catatan lengkap di satuan.template.js.
========================================================= */

let satState = { page:1, search:'', sortField:'kode', sortDir:'asc' };

function renderSatuanPage(){
  content.innerHTML = tplSatPage();
  satState = { page:1, search:'', sortField:'kode', sortDir:'asc' };
  document.getElementById('btnSatAdd').onclick = () => openSatModal('add');
  document.getElementById('satPageSize').onchange = () => { satState.page = 1; renderSatTable(); };
  document.getElementById('satSearch').oninput = (e) => {
    satState.search = e.target.value.trim().toLowerCase();
    satState.page = 1;
    renderSatTable();
  };
  document.querySelectorAll('[data-sat-sort]').forEach(el => el.onclick = () => {
    const field = el.dataset.satSort;
    if(satState.sortField === field){
      satState.sortDir = satState.sortDir === 'asc' ? 'desc' : 'asc';
    } else {
      satState.sortField = field;
      satState.sortDir = 'asc';
    }
    satState.page = 1;
    renderSatTable();
  });
  renderSatTable();
}

function satPageSize(){
  const sel = document.getElementById('satPageSize');
  return sel ? parseInt(sel.value, 10) : 10;
}

function satFilteredSortedRows(){
  const q = satState.search;
  let rows = !q ? DATA.satuan.slice() : DATA.satuan.filter(r =>
    (r.kode||'').toLowerCase().includes(q) || (r.nama||'').toLowerCase().includes(q));
  const field = satState.sortField;
  const dir = satState.sortDir === 'desc' ? -1 : 1;
  rows.sort((a,b) => (a[field]||'').localeCompare(b[field]||'', 'id') * dir);
  return rows;
}

function renderSatTable(){
  const perPage = satPageSize();
  const filtered = satFilteredSortedRows();
  const totalPages = Math.max(1, Math.ceil(filtered.length/perPage));
  if(satState.page > totalPages) satState.page = totalPages;
  if(satState.page < 1) satState.page = 1;

  document.getElementById('satTbody').innerHTML = tplSatRows(filtered, satState.page, perPage);
  document.getElementById('satTotal').textContent = `Total Record: ${filtered.length}`;
  document.getElementById('satPager').innerHTML = tplSatPager(satState.page, totalPages);

  ['kode','nama'].forEach(f => {
    const el = document.getElementById(`satSortIcon_${f}`);
    if(!el) return;
    if(satState.sortField === f){
      el.innerHTML = satState.sortDir === 'asc' ? '&#8593;' : '&#8595;';
      el.style.color = 'var(--blue)';
    } else {
      el.innerHTML = '&#8693;';
      el.style.color = 'var(--text-light)';
    }
  });

  const tbody = document.getElementById('satTbody');
  tbody.querySelectorAll('[data-edit]').forEach(b => b.onclick = (e) => { e.preventDefault(); openSatModal('edit', +b.dataset.edit); });
  tbody.querySelectorAll('[data-del]').forEach(b => b.onclick = () => openSatDeleteConfirm(+b.dataset.del));

  const pager = document.getElementById('satPager');
  pager.querySelectorAll('[data-satpage]').forEach(b => b.onclick = () => { satState.page = +b.dataset.satpage; renderSatTable(); });
}

function openSatModal(mode, idx){
  closeModal();
  const row = mode === 'edit' ? DATA.satuan[idx] : { kode: '', nama: '' };
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.innerHTML = tplSatModal(mode, row);
  document.body.appendChild(overlay);
  document.getElementById('modalClose').onclick = closeModal;
  document.getElementById('modalCancel').onclick = closeModal;
  overlay.onclick = (e) => { if(e.target === overlay) closeModal(); };
  document.getElementById('modalSave').onclick = () => {
    const kode = document.getElementById('fSatKode').value.trim().toUpperCase();
    const nama = document.getElementById('fSatNama').value.trim();
    let ok = true;
    if(!kode){ document.getElementById('fSatKodeErr').textContent = 'Kode Satuan wajib diisi'; document.getElementById('fSatKodeErr').style.display = 'block'; ok = false; }
    else if(mode === 'add' && DATA.satuan.some(r => r.kode.toUpperCase() === kode)){
      document.getElementById('fSatKodeErr').textContent = 'Kode sudah dipakai, gunakan kode lain'; document.getElementById('fSatKodeErr').style.display = 'block'; ok = false;
    } else {
      document.getElementById('fSatKodeErr').style.display = 'none';
    }
    if(!nama){ document.getElementById('fSatNamaErr').style.display = 'block'; ok = false; } else { document.getElementById('fSatNamaErr').style.display = 'none'; }
    if(!ok) return;
    if(mode === 'add'){
      DATA.satuan.push({ kode, nama });
    } else {
      DATA.satuan[idx].nama = nama;
    }
    closeModal();
    renderSatTable();
  };
}

function openSatDeleteConfirm(idx){
  closeModal();
  const row = DATA.satuan[idx];
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.innerHTML = tplSatDeleteConfirm(row);
  document.body.appendChild(overlay);
  document.getElementById('modalClose').onclick = closeModal;
  document.getElementById('modalCancel').onclick = closeModal;
  overlay.onclick = (e) => { if(e.target === overlay) closeModal(); };
  document.getElementById('modalDelete').onclick = () => {
    DATA.satuan.splice(idx, 1);
    closeModal();
    renderSatTable();
  };
}
