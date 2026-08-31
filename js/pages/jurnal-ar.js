/* =========================================================
   LOGIC (JS saja) — Jurnal A.R. (Customer & Penjualan >
   Master & Setting). Dimuat otomatis (lazy-load) oleh core.js
   saat menu ini pertama kali diklik — lihat PAGE_MODULES di
   js/core.js. Markup HTML-nya ada di file sebelah:
   jurnal-ar.template.js (tplJurnalARListPage/tplJarRows/
   tplJurnalARForm/tplJarAkunPicker/dst, plus konstanta
   JAR_AKUN_FIELDS yang dipakai bersama di sini).
   NB: closeModal() dipakai bersama, didefinisikan di core.js.

   KEMBARAN modul Jurnal A.P. (jurnal-ap.js) untuk sisi piutang —
   pola CRUD sama persis (list + form full page, kode berurutan
   di-generate nextJarKode(), link biru Kode Jurnal membuka form
   Ubah), ditambah 1 field checkbox "Jurnal Ar SSP?" (flag arSsp,
   menandai jurnal yang dipakai transaksi Penerimaan SSP — lihat
   modul Transaksi A.R. SSP / penerimaan-ssp.*).
   Data: DATA.jurnalAR (lihat js/data.js).
========================================================= */
function renderJurnalARPage(){
  renderJarList();
}

function renderJarList(){
  content.innerHTML = tplJurnalARListPage();
  document.getElementById('btnAddJar').onclick = () => openJarForm('add');
  renderJarTable();
}

function renderJarTable(){
  const tbody = document.getElementById('jarTbody');
  const total = document.getElementById('jarTotal');
  tbody.innerHTML = tplJarRows(DATA.jurnalAR);
  total.textContent = `Total Record: ${DATA.jurnalAR.length}`;
  tbody.querySelectorAll('[data-edit]').forEach(b => b.onclick = () => openJarForm('edit', +b.dataset.edit));
  tbody.querySelectorAll('[data-edit-link]').forEach(b => b.onclick = () => openJarForm('edit', +b.dataset.editLink));
  tbody.querySelectorAll('[data-del]').forEach(b => b.onclick = () => openJarDeleteConfirm(+b.dataset.del));
}

function openJarForm(mode, idx){
  const row = mode === 'edit'
    ? { ...DATA.jurnalAR[idx] }
    : { kode: null, nama:'', arSsp:false, akunDebit:'', akunKredit:'', akunPPN:'' };

  content.innerHTML = tplJurnalARForm(mode, row);

  JAR_AKUN_FIELDS.forEach(f => {
    content.querySelector(`[data-akun-search="${f.key}"]`).onclick = () => openJarAkunPicker(f.key, row);
    content.querySelector(`[data-akun-clear="${f.key}"]`).onclick = () => {
      row[f.key] = '';
      document.getElementById(`fJar_${f.key}`).value = '';
      document.getElementById(`fJarNama_${f.key}`).textContent = '';
    };
  });

  document.getElementById('fJarArSsp').onchange = (e) => { row.arSsp = e.target.checked; };
  document.getElementById('btnJarTutorial').onclick = () => openJarInfo('Tutorial', 'Video tutorial pengisian Jurnal A.R. akan tersedia di sini.');
  document.getElementById('jarBatalkan').onclick = (e) => { e.preventDefault(); renderJarList(); };
  document.getElementById('jarSimpan').onclick = () => {
    const nama = document.getElementById('fJarNama').value.trim();
    if(!nama){ jarValidationError('Nama Jurnal wajib diisi'); return; }
    if(!row.akunDebit){ jarValidationError('Akun Debit wajib dipilih'); return; }
    if(!row.akunKredit){ jarValidationError('Akun Kredit wajib dipilih'); return; }
    row.nama = nama;
    if(mode === 'add'){
      row.kode = nextJarKode();
      DATA.jurnalAR.push(row);
    } else {
      DATA.jurnalAR[idx] = row;
    }
    renderJarList();
  };
}

function nextJarKode(){
  return DATA.jurnalAR.length ? Math.max(...DATA.jurnalAR.map(r=>r.kode)) + 1 : 1;
}

/* Pengganti alert() bawaan browser untuk validasi sederhana —
   pakai modal info custom, konsisten dengan kebijakan
   "hindari alert/confirm/prompt bawaan browser". */
function jarValidationError(text){
  openJarInfo('Validasi', text);
}

function openJarAkunPicker(fieldKey, row){
  closeModal();
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.innerHTML = tplJarAkunPicker(DATA.akunGL, fieldKey);
  document.body.appendChild(overlay);
  document.getElementById('modalClose').onclick = closeModal;
  document.getElementById('modalCancel').onclick = closeModal;
  overlay.onclick = (e) => { if(e.target === overlay) closeModal(); };

  const wireRows = () => {
    overlay.querySelectorAll('[data-pick-akun]').forEach(btn => btn.onclick = () => {
      const kode = btn.dataset.pickAkun;
      row[fieldKey] = kode;
      document.getElementById(`fJar_${fieldKey}`).value = kode;
      document.getElementById(`fJarNama_${fieldKey}`).textContent = jarAkunNama(kode);
      closeModal();
    });
  };
  wireRows();

  document.getElementById('jarAkunPickerSearch').oninput = (e) => {
    const q = e.target.value.trim().toLowerCase();
    const filtered = DATA.akunGL.filter(a => a.kode.toLowerCase().includes(q) || a.nama.toLowerCase().includes(q));
    document.getElementById('jarAkunPickerBody').innerHTML = tplJarAkunPickerRows(filtered, fieldKey);
    wireRows();
  };
}

function openJarDeleteConfirm(idx){
  closeModal();
  const row = DATA.jurnalAR[idx];
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.innerHTML = tplJarDeleteConfirm(row);
  document.body.appendChild(overlay);
  document.getElementById('modalClose').onclick = closeModal;
  document.getElementById('modalCancel').onclick = closeModal;
  overlay.onclick = (e) => { if(e.target === overlay) closeModal(); };
  document.getElementById('modalDelete').onclick = () => {
    DATA.jurnalAR.splice(idx, 1);
    closeModal();
    renderJarTable();
  };
}

function openJarInfo(title, text){
  closeModal();
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.innerHTML = tplJarInfoModal(title, text);
  document.body.appendChild(overlay);
  document.getElementById('modalClose').onclick = closeModal;
  document.getElementById('modalOk').onclick = closeModal;
  overlay.onclick = (e) => { if(e.target === overlay) closeModal(); };
}
