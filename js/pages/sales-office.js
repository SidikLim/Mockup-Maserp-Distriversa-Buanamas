/* =========================================================
   LOGIC (JS saja) — Master Sales Office (menu Customer & Penjualan >
   Master & Setting > Sales Office, page 'salesOffice'). Dimuat otomatis
   (lazy-load) oleh core.js saat menu ini pertama kali diklik — lihat
   PAGE_MODULES di js/core.js. Markup HTML-nya ada di file sebelah:
   sales-office.template.js (tplMasterSofListPage/tplSofRows/tplSofPager/
   tplSofForm/tplSofDeleteConfirm/sofAreaListText, plus SOF_ASCM_LIST).
   NB: closeModal() dipakai bersama, didefinisikan di core.js.

   Pola CRUD SEDERHANA (cuma 4 field: Kode/Nama/ASCM/Status, TIDAK ADA
   sub-grid — field "Area" di list murni HASIL TURUNAN read-only dari
   DATA.area, TIDAK diedit dari form ini sama sekali, lihat komentar
   besar di sales-office.template.js) + list dgn page-size + Pencarian
   Global + pager standar, semua SUNGGUHAN FUNGSIONAL (pola sama seperti
   Master User/Group User).
========================================================= */

let sofState = { page:1, search:'' };

function renderSalesOfficePage(){
  renderSofList();
}

function renderSofList(){
  content.innerHTML = tplMasterSofListPage();
  sofState = { page:1, search:'' };
  document.getElementById('btnSofAdd').onclick = () => openSofForm('add');
  document.getElementById('sofPageSize').onchange = () => { sofState.page = 1; renderSofTable(); };
  document.getElementById('sofSearch').oninput = (e) => {
    sofState.search = e.target.value.trim().toLowerCase();
    sofState.page = 1;
    renderSofTable();
  };
  renderSofTable();
}

function sofPageSize(){
  const sel = document.getElementById('sofPageSize');
  return sel ? parseInt(sel.value, 10) : SOF_PAGE_SIZE_DEFAULT;
}

function sofFiltered(){
  if (!sofState.search) return DATA.salesOffice;
  const q = sofState.search;
  return DATA.salesOffice.filter(r =>
    r.kode.toLowerCase().includes(q) ||
    r.nama.toLowerCase().includes(q) ||
    r.ascm.toLowerCase().includes(q));
}

function renderSofTable(){
  const perPage = sofPageSize();
  const filtered = sofFiltered();
  const totalFiltered = filtered.length;
  const totalPages = Math.max(1, Math.ceil(totalFiltered/perPage));
  if (sofState.page > totalPages) sofState.page = totalPages;
  if (sofState.page < 1) sofState.page = 1;
  const startIdx = (sofState.page-1) * perPage;
  const pageRows = filtered.slice(startIdx, startIdx+perPage);

  document.getElementById('sofTbody').innerHTML = tplSofRows(pageRows);
  // Label SENGAJA "Total:" bukan "Total Record:" — persis quirk screenshot
  // "Daftar Sales Office" (beda dari semua modul lain), lihat komentar di
  // sales-office.template.js.
  document.getElementById('sofTotal').textContent = `Total: ${totalFiltered}`;
  document.getElementById('sofPagerWrap').innerHTML = tplSofPager(sofState.page, totalPages);

  document.getElementById('sofTbody').querySelectorAll('[data-edit]').forEach(b => b.onclick = () => openSofForm('edit', +b.dataset.edit));
  document.getElementById('sofTbody').querySelectorAll('[data-del]').forEach(b => b.onclick = () => openSofDeleteConfirm(+b.dataset.del));
  wireSofPagerEvents(totalPages);
}

function wireSofPagerEvents(totalPages){
  const wrap = document.getElementById('sofPagerWrap');
  const goTo = (p) => { sofState.page = Math.min(Math.max(1,p), totalPages); renderSofTable(); };
  wrap.querySelector('[data-sof-first]').onclick = () => goTo(1);
  wrap.querySelector('[data-sof-prev]').onclick = () => goTo(sofState.page-1);
  wrap.querySelector('[data-sof-next]').onclick = () => goTo(sofState.page+1);
  wrap.querySelector('[data-sof-last]').onclick = () => goTo(totalPages);
  wrap.querySelectorAll('[data-sof-page]').forEach(b => b.onclick = () => goTo(+b.dataset.sofPage));
}

function sofNextKode(){
  // Format "SF00".."SF04" sudah dipakai 5 baris existing (angka 2-digit
  // zero-padded, dimulai dari 00) — kode baru lanjut angka berikutnya
  // yang belum dipakai, TIDAK direset ke "-BARU-N" seperti modul lain
  // (Rayon/Wilayah/Group User) karena screenshot menunjukkan pola
  // sequential rapi mirip Kode Bank (Kas/Bank), bukan pola random/ad-hoc.
  let n = 0;
  while (DATA.salesOffice.some(r => r.kode === `SF${String(n).padStart(2,'0')}`)) n++;
  return `SF${String(n).padStart(2,'0')}`;
}

function sofEmptyRow(){
  return { kode: sofNextKode(), nama:'', ascm: SOF_ASCM_LIST[0], status:'Aktif' };
}

function openSofForm(mode, idx){
  const row = mode==='add' ? sofEmptyRow() : JSON.parse(JSON.stringify(DATA.salesOffice[idx]));
  content.innerHTML = tplSofForm(mode, row);
  document.getElementById('sofSave').onclick = () => sofSave(mode, idx, row);
  document.getElementById('sofCancel').onclick = () => renderSofList();
}

function sofSave(mode, idx, row){
  // Nama/ASCM/Status TIDAK punya oninput handler yang menulis langsung ke
  // `row` — nilai terbaru dari DOM HARUS dibaca eksplisit di sini dulu,
  // sama seperti pola rySave()/wlSave()/guSave()/usrSave() di modul lain.
  row.nama = document.getElementById('fSofNama').value.trim();
  row.ascm = document.getElementById('fSofAscm').value;
  row.status = document.querySelector('input[name="fSofStatus"]:checked').value;

  if (!row.nama){ alert('Nama wajib diisi.'); return; }
  if (mode === 'add'){
    DATA.salesOffice.push(row);
  } else {
    DATA.salesOffice[idx] = row;
  }
  renderSofList();
}

function openSofDeleteConfirm(idx){
  closeModal();
  const row = DATA.salesOffice[idx];
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.innerHTML = tplSofDeleteConfirm(row);
  document.body.appendChild(overlay);
  document.getElementById('modalClose').onclick = closeModal;
  document.getElementById('modalCancel').onclick = closeModal;
  overlay.onclick = (e) => { if(e.target === overlay) closeModal(); };
  document.getElementById('modalDelete').onclick = () => {
    DATA.salesOffice.splice(idx, 1);
    closeModal();
    renderSofTable();
  };
}
