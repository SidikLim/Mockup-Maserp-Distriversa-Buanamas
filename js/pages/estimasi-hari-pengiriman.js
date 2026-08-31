/* =========================================================
   LOGIC (JS saja) — Estimasi Hari Pengiriman (Supplier &
   Pembelian > Master & Setting). Dimuat otomatis (lazy-load)
   oleh core.js saat menu ini pertama kali diklik — lihat
   PAGE_MODULES di js/core.js. Markup HTML-nya ada di file
   sebelah: estimasi-hari-pengiriman.template.js
   (tplEstimasiHariPengirimanListPage/tplEhpRows/
   tplEstimasiHariPengirimanForm/tplEhpSupplierPicker/dst).
   NB: closeModal() dipakai bersama, didefinisikan di core.js.

   Pola CRUD: list + form FULL PAGE (bukan modal) mengikuti
   screenshot MASERP — walau field-nya cuma 3, screenshot acuan
   memang menampilkan form sebagai halaman penuh dengan footer
   Simpan/Batalkan, sama seperti Jurnal Pembelian. Validasi:
   Supplier wajib dipilih, Hari harus > 0, dan kombinasi
   Supplier + Cabang Target tidak boleh dobel (1 supplier hanya
   punya 1 estimasi per cabang — baris list screenshot memang
   1 baris per kombinasi supplier x cabang).
   Data: DATA.estimasiHariPengiriman (lihat js/data.js).
========================================================= */
function renderEstimasiHariPengirimanPage(){
  renderEhpList();
}

function renderEhpList(){
  content.innerHTML = tplEstimasiHariPengirimanListPage();
  document.getElementById('btnAddEhp').onclick = () => openEhpForm('add');
  renderEhpTable();
}

function renderEhpTable(){
  const tbody = document.getElementById('ehpTbody');
  const total = document.getElementById('ehpTotal');
  tbody.innerHTML = tplEhpRows(DATA.estimasiHariPengiriman);
  total.textContent = `Total Record: ${DATA.estimasiHariPengiriman.length}`;
  tbody.querySelectorAll('[data-edit]').forEach(b => b.onclick = () => openEhpForm('edit', +b.dataset.edit));
  tbody.querySelectorAll('[data-del]').forEach(b => b.onclick = () => openEhpDeleteConfirm(+b.dataset.del));
}

function openEhpForm(mode, idx){
  const row = mode === 'edit'
    ? { ...DATA.estimasiHariPengiriman[idx] }
    : { supplier:'', cabangTarget: DATA.cabangMaster.length ? DATA.cabangMaster[0].nama : '', hari:'' };

  content.innerHTML = tplEstimasiHariPengirimanForm(mode, row);

  document.getElementById('ehpSupplierSearch').onclick = () => openEhpSupplierPicker(row);
  document.getElementById('ehpBatalkan').onclick = (e) => { e.preventDefault(); renderEhpList(); };
  document.getElementById('ehpSimpan').onclick = () => {
    const supplier = document.getElementById('fEhpSupplier').value.trim();
    const cabangTarget = document.getElementById('fEhpCabang').value;
    const hari = parseInt(document.getElementById('fEhpHari').value, 10);
    if(!supplier){ ehpValidationError('Supplier wajib dipilih'); return; }
    if(!Number.isFinite(hari) || hari <= 0){ ehpValidationError('Hari harus diisi angka lebih dari 0'); return; }
    const dobel = DATA.estimasiHariPengiriman.some((r,i) =>
      r.supplier === supplier && r.cabangTarget === cabangTarget && !(mode === 'edit' && i === idx));
    if(dobel){ ehpValidationError(`Estimasi untuk supplier <b>${supplier}</b> ke cabang <b>${cabangTarget}</b> sudah ada. Ubah baris yang sudah ada, jangan buat dobel.`); return; }
    row.supplier = supplier;
    row.cabangTarget = cabangTarget;
    row.hari = hari;
    if(mode === 'add'){ DATA.estimasiHariPengiriman.push(row); }
    else { DATA.estimasiHariPengiriman[idx] = row; }
    renderEhpList();
  };
}

/* Pengganti alert() bawaan browser untuk validasi sederhana —
   pakai modal info custom, konsisten dengan kebijakan
   "hindari alert/confirm/prompt bawaan browser". */
function ehpValidationError(text){
  openEhpInfo('Validasi', text);
}

function openEhpSupplierPicker(row){
  closeModal();
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.innerHTML = tplEhpSupplierPicker(DATA.suppliers);
  document.body.appendChild(overlay);
  document.getElementById('modalClose').onclick = closeModal;
  document.getElementById('modalCancel').onclick = closeModal;
  overlay.onclick = (e) => { if(e.target === overlay) closeModal(); };

  const wireRows = () => {
    overlay.querySelectorAll('[data-pick-supplier]').forEach(btn => btn.onclick = () => {
      row.supplier = btn.dataset.pickSupplier;
      document.getElementById('fEhpSupplier').value = row.supplier;
      closeModal();
    });
  };
  wireRows();

  document.getElementById('ehpSupplierPickerSearch').oninput = (e) => {
    const q = e.target.value.trim().toLowerCase();
    const filtered = DATA.suppliers.filter(s => s.kode.toLowerCase().includes(q) || s.nama.toLowerCase().includes(q));
    document.getElementById('ehpSupplierPickerBody').innerHTML = tplEhpSupplierPickerRows(filtered);
    wireRows();
  };
}

function openEhpDeleteConfirm(idx){
  closeModal();
  const row = DATA.estimasiHariPengiriman[idx];
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.innerHTML = tplEhpDeleteConfirm(row);
  document.body.appendChild(overlay);
  document.getElementById('modalClose').onclick = closeModal;
  document.getElementById('modalCancel').onclick = closeModal;
  overlay.onclick = (e) => { if(e.target === overlay) closeModal(); };
  document.getElementById('modalDelete').onclick = () => {
    DATA.estimasiHariPengiriman.splice(idx, 1);
    closeModal();
    renderEhpTable();
  };
}

function openEhpInfo(title, text){
  closeModal();
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.innerHTML = tplEhpInfoModal(title, text);
  document.body.appendChild(overlay);
  document.getElementById('modalClose').onclick = closeModal;
  document.getElementById('modalOk').onclick = closeModal;
  overlay.onclick = (e) => { if(e.target === overlay) closeModal(); };
}
