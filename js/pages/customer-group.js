/* =========================================================
   LOGIC (JS saja) — Grup Customer (Customer & Penjualan > Master
   & Setting). Dimuat otomatis (lazy-load) oleh core.js saat menu
   ini pertama kali diklik — lihat PAGE_MODULES di js/core.js.
   Markup HTML-nya ada di file sebelah: customer-group.template.js
   (tplCustomerGroupListPage/tplCgRows/tplCustomerGroupForm/
   tplCgLegalitasSectionsWrap/tplCgSyaratPicker/tplCgBuPicker/dst,
   plus konstanta CG_LEGALITAS_SECTIONS/CG_MATA_UANG_LIST yang
   dipakai bersama di sini).
   NB: closeModal() dipakai bersama, didefinisikan di core.js.

   Pola CRUD: list + form FULL PAGE (bukan modal, karena field
   sangat banyak — 6 checkbox Legalitas dinamis + sub-grid Badan
   Usaha), sama seperti Master Supplier/Kategori Barang. Bagian
   PALING KHAS modul ini: 6 checkbox "Legalitas ..." yang begitu
   dicentang langsung MEMUNCULKAN sub-grid terkait di bawahnya
   (live, tanpa Simpan dulu) — state tiap sub-grid disimpan di
   `cgLegalitasRows` (object, key = rowsKey dari CG_LEGALITAS_SECTIONS),
   dan direnderkan ulang oleh `renderCgLegalitasSections(row)` setiap
   kali sebuah checkbox berubah ATAU sebuah baris sub-grid
   ditambah/dihapus/diisi — fungsi ini membaca status checkbox
   LANGSUNG dari DOM (bukan dari `row`), jadi checkbox tidak perlu
   ikut di-render ulang.
========================================================= */
let cgLegalitasRows = {};
let cgBuRows = [];

function renderCustomerGroupPage(){
  renderCgList();
}

function renderCgList(){
  content.innerHTML = tplCustomerGroupListPage();
  document.getElementById('btnCgAdd').onclick = () => openCgForm('add');
  document.getElementById('btnCgGenerate').onclick = () => openCgInfo('Generate Customer Group ke Customer Type', 'Fitur generate otomatis Customer Group ke Customer Type akan tersedia di modul "Tipe Customer".');
  renderCgTable();
}

function renderCgTable(){
  const tbody = document.getElementById('cgTbody');
  const total = document.getElementById('cgTotal');
  tbody.innerHTML = tplCgRows(DATA.customerGroup);
  total.textContent = `Total Record: ${DATA.customerGroup.length}`;
  tbody.querySelectorAll('[data-edit]').forEach(b => b.onclick = () => openCgForm('edit', +b.dataset.edit));
  tbody.querySelectorAll('[data-del]').forEach(b => b.onclick = () => openCgDeleteConfirm(+b.dataset.del));
}

function cgEmptyRow(){
  const row = { kode:'', nama:'', diskon1:0, diskon2:0, mataUang:'IDR', alamat:'', telepon:'', fax:'', kontakPerson:'', minBatasKredit:0, dominasi:false, badanUsaha:[] };
  CG_LEGALITAS_SECTIONS.forEach(sec => { row[sec.key] = false; row[sec.rowsKey] = []; });
  return row;
}

function openCgForm(mode, idx){
  const row = mode === 'edit'
    ? { ...DATA.customerGroup[idx], badanUsaha: (DATA.customerGroup[idx].badanUsaha||[]).map(b=>({...b})) }
    : cgEmptyRow();

  cgLegalitasRows = {};
  CG_LEGALITAS_SECTIONS.forEach(sec => { cgLegalitasRows[sec.rowsKey] = (row[sec.rowsKey]||[]).map(s=>({...s})); });
  cgBuRows = (row.badanUsaha||[]).map(b=>({...b}));

  content.innerHTML = tplCustomerGroupForm(mode, row);
  renderCgLegalitasSections(row);
  renderCgBuRows();

  document.getElementById('btnCgTutorial').onclick = () => openCgInfo('Tutorial', 'Video tutorial pengisian Grup Customer akan tersedia di sini.');

  CG_LEGALITAS_SECTIONS.forEach(sec => {
    document.getElementById(`fCg_${sec.key}`).onchange = () => renderCgLegalitasSections(row);
  });

  document.getElementById('cgBuAddRow').onclick = (e) => { e.preventDefault(); cgBuRows.push({kode:'',nama:''}); renderCgBuRows(); };

  document.getElementById('cgCancel').onclick = () => renderCgList();
  document.getElementById('cgSave').onclick = () => {
    const kode = document.getElementById('fCgKode').value.trim();
    const nama = document.getElementById('fCgNama').value.trim();
    if(!kode || !nama){ cgValidationError('Kode Grup Customer dan Nama Grup Customer wajib diisi'); return; }
    row.kode = kode;
    row.nama = nama;
    row.mataUang = document.getElementById('fCgMataUang').value;
    row.alamat = document.getElementById('fCgAlamat').value.trim();
    row.telepon = document.getElementById('fCgTelepon').value.trim();
    row.fax = document.getElementById('fCgFax').value.trim();
    row.kontakPerson = document.getElementById('fCgKontakPerson').value.trim();
    const kreditRaw = document.getElementById('fCgMinBatasKredit').value.trim().replace(/\./g,'').replace(',', '.');
    row.minBatasKredit = parseFloat(kreditRaw) || 0;
    row.dominasi = document.getElementById('fCgDominasi').checked;
    CG_LEGALITAS_SECTIONS.forEach(sec => {
      row[sec.key] = document.getElementById(`fCg_${sec.key}`).checked;
      row[sec.rowsKey] = cgLegalitasRows[sec.rowsKey].filter(s => s.kode);
    });
    row.badanUsaha = cgBuRows.filter(b => b.kode);
    if(mode === 'add'){
      DATA.customerGroup.push(row);
    } else {
      DATA.customerGroup[idx] = row;
    }
    renderCgList();
  };
}

/* Render ulang wrap sub-grid Legalitas berdasar status checkbox SAAT INI
   (dibaca langsung dari DOM) — checkbox sendiri tidak ikut di-render ulang
   di sini, jadi checked state-nya tetap terjaga. */
function renderCgLegalitasSections(row){
  const wrap = document.getElementById('cgLegalitasSectionsWrap');
  if(!wrap) return;
  const visible = CG_LEGALITAS_SECTIONS.filter(sec => document.getElementById(`fCg_${sec.key}`)?.checked);
  wrap.innerHTML = visible.map(sec => tplCgLegalitasSection(sec, cgLegalitasRows[sec.rowsKey] || [])).join('');

  wrap.querySelectorAll('[data-cg-add]').forEach(a => a.onclick = (e) => {
    e.preventDefault();
    const rowsKey = a.dataset.cgAdd;
    cgLegalitasRows[rowsKey].push({kode:'',nama:''});
    renderCgLegalitasSections(row);
  });
  wrap.querySelectorAll('[data-cg-search]').forEach(b => b.onclick = () => {
    const [rowsKey, idx] = b.dataset.cgSearch.split(':');
    openCgSyaratPicker(rowsKey, +idx, row);
  });
  wrap.querySelectorAll('[data-cg-rm]').forEach(b => b.onclick = () => {
    const [rowsKey, idx] = b.dataset.cgRm.split(':');
    cgLegalitasRows[rowsKey].splice(+idx, 1);
    renderCgLegalitasSections(row);
  });
}

function openCgSyaratPicker(rowsKey, idx, row){
  closeModal();
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.innerHTML = tplCgSyaratPicker(DATA.syaratCustomerGrup, rowsKey, idx);
  document.body.appendChild(overlay);
  document.getElementById('pickerClose').onclick = closeModal;
  document.getElementById('pickerCancel').onclick = closeModal;
  overlay.onclick = (e) => { if(e.target === overlay) closeModal(); };
  overlay.querySelectorAll('[data-pick]').forEach(b => b.onclick = () => {
    const s = DATA.syaratCustomerGrup.find(x => x.kode === b.dataset.pick);
    cgLegalitasRows[rowsKey][idx] = { kode:s.kode, nama:s.nama };
    closeModal();
    renderCgLegalitasSections(row);
  });
}

function renderCgBuRows(){
  const wrap = document.getElementById('cgBuWrap');
  if(!wrap) return;
  wrap.innerHTML = tplCgBuRows(cgBuRows);
  wrap.querySelectorAll('[data-cg-bu-search]').forEach(b => b.onclick = () => openCgBuPicker(+b.dataset.cgBuSearch));
  wrap.querySelectorAll('[data-cg-bu-rm]').forEach(b => b.onclick = () => { cgBuRows.splice(+b.dataset.cgBuRm, 1); renderCgBuRows(); });
}

function openCgBuPicker(rowIdx){
  closeModal();
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.innerHTML = tplCgBuPicker(DATA.badanUsahaList);
  document.body.appendChild(overlay);
  document.getElementById('pickerClose').onclick = closeModal;
  document.getElementById('pickerCancel').onclick = closeModal;
  overlay.onclick = (e) => { if(e.target === overlay) closeModal(); };
  overlay.querySelectorAll('[data-pick]').forEach(b => b.onclick = () => {
    const bu = DATA.badanUsahaList.find(x => x.kode === b.dataset.pick);
    cgBuRows[rowIdx] = { kode:bu.kode, nama:bu.nama };
    closeModal();
    renderCgBuRows();
  });
}

/* Pengganti alert() bawaan browser untuk validasi sederhana — pakai modal
   info custom, konsisten dengan kebijakan "hindari alert/confirm/prompt
   bawaan browser" di seluruh mockup ini. */
function cgValidationError(text){
  openCgInfo('Validasi', text);
}

function openCgDeleteConfirm(idx){
  closeModal();
  const row = DATA.customerGroup[idx];
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.innerHTML = tplCgDeleteConfirm(row);
  document.body.appendChild(overlay);
  document.getElementById('modalClose').onclick = closeModal;
  document.getElementById('modalCancel').onclick = closeModal;
  overlay.onclick = (e) => { if(e.target === overlay) closeModal(); };
  document.getElementById('modalDelete').onclick = () => {
    DATA.customerGroup.splice(idx, 1);
    closeModal();
    renderCgTable();
  };
}

function openCgInfo(title, text){
  closeModal();
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.innerHTML = tplCgInfoModal(title, text);
  document.body.appendChild(overlay);
  document.getElementById('modalClose').onclick = closeModal;
  document.getElementById('modalOk').onclick = closeModal;
  overlay.onclick = (e) => { if(e.target === overlay) closeModal(); };
}
