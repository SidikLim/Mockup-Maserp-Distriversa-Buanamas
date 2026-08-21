/* =========================================================
   LOGIC (JS saja) — Daftar Kategory Reordering Sheet
   (Persediaan Barang > Master & Setting > Daftar Kategory
   Reordering Sheet, page:'kategoriReorderingSheet'). Dimuat
   otomatis (lazy-load) oleh core.js saat menu ini pertama kali
   diklik — lihat PAGE_MODULES di js/core.js. Markup HTML-nya
   ada di file sebelah: kategori-reordering-sheet.template.js.
   NB: closeModal() dipakai bersama, didefinisikan di core.js.

   Pola CRUD + sort SAMA seperti Zat Kandungan Aktif, TAPI kode
   dientri MANUAL (bukan auto-generate) — lihat validasi
   `fKrsKodeErr` (wajib isi + wajib unik) di `openKrsModal()`.
========================================================= */

let krsState = { page:1, search:'', sortField:'kode', sortDir:'asc' };

function renderKategoriReorderingSheetPage(){
  content.innerHTML = tplKrsPage();
  krsState = { page:1, search:'', sortField:'kode', sortDir:'asc' };
  document.getElementById('btnKrsAdd').onclick = () => openKrsModal('add');
  document.getElementById('krsPageSize').onchange = () => { krsState.page = 1; renderKrsTable(); };
  document.getElementById('krsSearch').oninput = (e) => {
    krsState.search = e.target.value.trim().toLowerCase();
    krsState.page = 1;
    renderKrsTable();
  };
  document.querySelectorAll('[data-krs-sort]').forEach(el => el.onclick = () => {
    const field = el.dataset.krsSort;
    if(krsState.sortField === field){
      krsState.sortDir = krsState.sortDir === 'asc' ? 'desc' : 'asc';
    } else {
      krsState.sortField = field;
      krsState.sortDir = 'asc';
    }
    krsState.page = 1;
    renderKrsTable();
  });
  renderKrsTable();
}

function krsPageSize(){
  const sel = document.getElementById('krsPageSize');
  return sel ? parseInt(sel.value, 10) : 10;
}

function krsFilteredSortedRows(){
  const q = krsState.search;
  let rows = !q ? DATA.kategoriReorderingSheet.slice() : DATA.kategoriReorderingSheet.filter(r =>
    (r.kode||'').toLowerCase().includes(q) || (r.nama||'').toLowerCase().includes(q) || (r.grupPenjualan||'').toLowerCase().includes(q));
  const field = krsState.sortField;
  const dir = krsState.sortDir === 'desc' ? -1 : 1;
  rows.sort((a,b) => (a[field]||'').localeCompare(b[field]||'', 'id') * dir);
  return rows;
}

function renderKrsTable(){
  const perPage = krsPageSize();
  const filtered = krsFilteredSortedRows();
  const totalPages = Math.max(1, Math.ceil(filtered.length/perPage));
  if(krsState.page > totalPages) krsState.page = totalPages;
  if(krsState.page < 1) krsState.page = 1;

  document.getElementById('krsTbody').innerHTML = tplKrsRows(filtered, krsState.page, perPage);
  document.getElementById('krsTotal').textContent = `Total Record: ${filtered.length}`;
  document.getElementById('krsPager').innerHTML = tplKrsPager(krsState.page, totalPages);

  ['kode','nama'].forEach(f => {
    const el = document.getElementById(`krsSortIcon_${f}`);
    if(!el) return;
    if(krsState.sortField === f){
      el.innerHTML = krsState.sortDir === 'asc' ? '&#8593;' : '&#8595;';
      el.style.color = 'var(--blue)';
    } else {
      el.innerHTML = '&#8693;';
      el.style.color = 'var(--text-light)';
    }
  });

  const tbody = document.getElementById('krsTbody');
  tbody.querySelectorAll('[data-edit]').forEach(b => b.onclick = (e) => { e.preventDefault(); openKrsModal('edit', +b.dataset.edit); });
  tbody.querySelectorAll('[data-del]').forEach(b => b.onclick = () => openKrsDeleteConfirm(+b.dataset.del));

  const pager = document.getElementById('krsPager');
  pager.querySelectorAll('[data-krspage]').forEach(b => b.onclick = () => { krsState.page = +b.dataset.krspage; renderKrsTable(); });
}

function openKrsModal(mode, idx){
  closeModal();
  const row = mode === 'edit' ? DATA.kategoriReorderingSheet[idx] : { kode: '', nama: '', grupPenjualan: '' };
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.innerHTML = tplKrsModal(mode, row);
  document.body.appendChild(overlay);
  document.getElementById('modalClose').onclick = closeModal;
  document.getElementById('modalCancel').onclick = closeModal;
  overlay.onclick = (e) => { if(e.target === overlay) closeModal(); };
  document.getElementById('modalSave').onclick = () => {
    const kode = document.getElementById('fKrsKode').value.trim().toUpperCase();
    const nama = document.getElementById('fKrsNama').value.trim();
    const grupPenjualan = document.getElementById('fKrsGrup').value.trim();
    let ok = true;
    if(!kode){ document.getElementById('fKrsKodeErr').textContent = 'Kode Kategori Reordering Sheet wajib diisi'; document.getElementById('fKrsKodeErr').style.display = 'block'; ok = false; }
    else if(mode === 'add' && DATA.kategoriReorderingSheet.some(r => r.kode.toUpperCase() === kode)){
      document.getElementById('fKrsKodeErr').textContent = 'Kode sudah dipakai, gunakan kode lain'; document.getElementById('fKrsKodeErr').style.display = 'block'; ok = false;
    } else {
      document.getElementById('fKrsKodeErr').style.display = 'none';
    }
    if(!nama){ document.getElementById('fKrsNamaErr').style.display = 'block'; ok = false; } else { document.getElementById('fKrsNamaErr').style.display = 'none'; }
    if(!ok) return;
    if(mode === 'add'){
      DATA.kategoriReorderingSheet.push({ kode, nama, grupPenjualan });
    } else {
      DATA.kategoriReorderingSheet[idx].nama = nama;
      DATA.kategoriReorderingSheet[idx].grupPenjualan = grupPenjualan;
    }
    closeModal();
    renderKrsTable();
  };
}

function openKrsDeleteConfirm(idx){
  closeModal();
  const row = DATA.kategoriReorderingSheet[idx];
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.innerHTML = tplKrsDeleteConfirm(row);
  document.body.appendChild(overlay);
  document.getElementById('modalClose').onclick = closeModal;
  document.getElementById('modalCancel').onclick = closeModal;
  overlay.onclick = (e) => { if(e.target === overlay) closeModal(); };
  document.getElementById('modalDelete').onclick = () => {
    DATA.kategoriReorderingSheet.splice(idx, 1);
    closeModal();
    renderKrsTable();
  };
}
