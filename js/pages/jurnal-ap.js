/* =========================================================
   LOGIC (JS saja) — Jurnal A.P. (Supplier & Pembelian >
   Master & Setting). Dimuat otomatis (lazy-load) oleh core.js
   saat menu ini pertama kali diklik — lihat PAGE_MODULES di
   js/core.js. Markup HTML-nya ada di file sebelah:
   jurnal-ap.template.js (tplJurnalAPListPage/tplJapRows/
   tplJurnalAPForm/tplJapAkunPicker/dst, plus konstanta
   JAP_AKUN_FIELDS yang dipakai bersama di sini).
   NB: closeModal() dipakai bersama, didefinisikan di core.js.

   Pola CRUD: list + form FULL PAGE, versi ringkas dari modul
   Jurnal Pembelian (hanya 3 field akun: Debit/Kredit/PPN Khusus
   Saldo U.M.). Kode Jurnal di list adalah link biru yang membuka
   form Ubah — sama seperti screenshot MASERP. Kode di-generate
   berurutan (1, 2, 3, ...) oleh nextJapKode(), tidak diketik user.
   Data: DATA.jurnalAP (lihat js/data.js).
========================================================= */
function renderJurnalAPPage(){
  renderJapList();
}

function renderJapList(){
  content.innerHTML = tplJurnalAPListPage();
  document.getElementById('btnAddJap').onclick = () => openJapForm('add');
  renderJapTable();
}

function renderJapTable(){
  const tbody = document.getElementById('japTbody');
  const total = document.getElementById('japTotal');
  tbody.innerHTML = tplJapRows(DATA.jurnalAP);
  total.textContent = `Total Record: ${DATA.jurnalAP.length}`;
  tbody.querySelectorAll('[data-edit]').forEach(b => b.onclick = () => openJapForm('edit', +b.dataset.edit));
  tbody.querySelectorAll('[data-edit-link]').forEach(b => b.onclick = () => openJapForm('edit', +b.dataset.editLink));
  tbody.querySelectorAll('[data-del]').forEach(b => b.onclick = () => openJapDeleteConfirm(+b.dataset.del));
}

function openJapForm(mode, idx){
  const row = mode === 'edit'
    ? { ...DATA.jurnalAP[idx] }
    : { kode: null, nama:'', akunDebit:'', akunKredit:'', akunPPN:'' };

  content.innerHTML = tplJurnalAPForm(mode, row);

  JAP_AKUN_FIELDS.forEach(f => {
    content.querySelector(`[data-akun-search="${f.key}"]`).onclick = () => openJapAkunPicker(f.key, row);
    content.querySelector(`[data-akun-clear="${f.key}"]`).onclick = () => {
      row[f.key] = '';
      document.getElementById(`fJap_${f.key}`).value = '';
      document.getElementById(`fJapNama_${f.key}`).textContent = '';
    };
  });

  document.getElementById('btnJapTutorial').onclick = () => openJapInfo('Tutorial', 'Video tutorial pengisian Jurnal A.P. akan tersedia di sini.');
  document.getElementById('japBatalkan').onclick = (e) => { e.preventDefault(); renderJapList(); };
  document.getElementById('japSimpan').onclick = () => {
    const nama = document.getElementById('fJapNama').value.trim();
    if(!nama){ japValidationError('Nama Jurnal wajib diisi'); return; }
    if(!row.akunDebit){ japValidationError('Akun Debit wajib dipilih'); return; }
    if(!row.akunKredit){ japValidationError('Akun Kredit wajib dipilih'); return; }
    row.nama = nama;
    if(mode === 'add'){
      row.kode = nextJapKode();
      DATA.jurnalAP.push(row);
    } else {
      DATA.jurnalAP[idx] = row;
    }
    renderJapList();
  };
}

function nextJapKode(){
  return DATA.jurnalAP.length ? Math.max(...DATA.jurnalAP.map(r=>r.kode)) + 1 : 1;
}

/* Pengganti alert() bawaan browser untuk validasi sederhana —
   pakai modal info custom, konsisten dengan kebijakan
   "hindari alert/confirm/prompt bawaan browser". */
function japValidationError(text){
  openJapInfo('Validasi', text);
}

function openJapAkunPicker(fieldKey, row){
  closeModal();
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.innerHTML = tplJapAkunPicker(DATA.akunGL, fieldKey);
  document.body.appendChild(overlay);
  document.getElementById('modalClose').onclick = closeModal;
  document.getElementById('modalCancel').onclick = closeModal;
  overlay.onclick = (e) => { if(e.target === overlay) closeModal(); };

  const wireRows = () => {
    overlay.querySelectorAll('[data-pick-akun]').forEach(btn => btn.onclick = () => {
      const kode = btn.dataset.pickAkun;
      row[fieldKey] = kode;
      document.getElementById(`fJap_${fieldKey}`).value = kode;
      document.getElementById(`fJapNama_${fieldKey}`).textContent = japAkunNama(kode);
      closeModal();
    });
  };
  wireRows();

  document.getElementById('japAkunPickerSearch').oninput = (e) => {
    const q = e.target.value.trim().toLowerCase();
    const filtered = DATA.akunGL.filter(a => a.kode.toLowerCase().includes(q) || a.nama.toLowerCase().includes(q));
    document.getElementById('japAkunPickerBody').innerHTML = tplJapAkunPickerRows(filtered, fieldKey);
    wireRows();
  };
}

function openJapDeleteConfirm(idx){
  closeModal();
  const row = DATA.jurnalAP[idx];
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.innerHTML = tplJapDeleteConfirm(row);
  document.body.appendChild(overlay);
  document.getElementById('modalClose').onclick = closeModal;
  document.getElementById('modalCancel').onclick = closeModal;
  overlay.onclick = (e) => { if(e.target === overlay) closeModal(); };
  document.getElementById('modalDelete').onclick = () => {
    DATA.jurnalAP.splice(idx, 1);
    closeModal();
    renderJapTable();
  };
}

function openJapInfo(title, text){
  closeModal();
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.innerHTML = tplJapInfoModal(title, text);
  document.body.appendChild(overlay);
  document.getElementById('modalClose').onclick = closeModal;
  document.getElementById('modalOk').onclick = closeModal;
  overlay.onclick = (e) => { if(e.target === overlay) closeModal(); };
}
