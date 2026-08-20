/* =========================================================
   LOGIC (JS saja) — Jurnal Penjualan (Customer & Penjualan >
   Master & Setting). Dimuat otomatis (lazy-load) oleh core.js
   saat menu ini pertama kali diklik — lihat PAGE_MODULES di
   js/core.js. Markup HTML-nya ada di file sebelah:
   jurnal-penjualan.template.js (tplJurnalPenjualanListPage/
   tplJjRows/tplJurnalPenjualanForm/tplJjAkunPicker/dst, plus
   konstanta JJ_AKUN_GROUPS yang dipakai bersama di sini).
   NB: closeModal() dipakai bersama, didefinisikan di core.js.

   Pola CRUD + picker akun GL sungguhan ini nyontek PERSIS dari
   Jurnal Pembelian (jurnal-pembelian.js) — hanya beda jumlah
   section field akun (2 vs 3) dan field toggle di list (1
   "Active?" vs 2 "Konsinyasi?"/"Non Aktif?"), field Cabang &
   paragraf catatan di form juga tidak ada di sini (tidak ada di
   screenshot Jurnal Penjualan yang dikirim user).
========================================================= */
function renderJurnalPenjualanPage(){
  renderJjList();
}

function renderJjList(){
  content.innerHTML = tplJurnalPenjualanListPage();
  document.getElementById('btnJjAddKas').onclick = () => openJjForm('add', 'Kas');
  document.getElementById('btnJjAddKredit').onclick = () => openJjForm('add', 'Kredit');
  document.getElementById('btnJjTutorial').onclick = () => openJjInfo('Tutorial', 'Video tutorial pengisian Jurnal Penjualan akan tersedia di sini.');
  renderJjTable();
}

function renderJjTable(){
  const tbody = document.getElementById('jjTbody');
  const total = document.getElementById('jjTotal');
  tbody.innerHTML = tplJjRows(DATA.jurnalPenjualan);
  total.textContent = `Total Record: ${DATA.jurnalPenjualan.length}`;
  tbody.querySelectorAll('[data-edit]').forEach(b => b.onclick = () => openJjForm('edit', null, +b.dataset.edit));
  tbody.querySelectorAll('[data-del]').forEach(b => b.onclick = () => openJjDeleteConfirm(+b.dataset.del));
  tbody.querySelectorAll('[data-toggle]').forEach(cb => cb.onchange = () => {
    const idx = +cb.dataset.idx;
    DATA.jurnalPenjualan[idx][cb.dataset.toggle] = cb.checked;
  });
}

function openJjForm(mode, tipeJurnal, idx){
  const row = mode === 'edit'
    ? { ...DATA.jurnalPenjualan[idx] }
    : { kode: null, nama:'', tipeJurnal: tipeJurnal||'Kredit', mataUang:'', active:true,
        akunPiutang:'', akunDiskonPrincipal:'', akunPersediaanIntransit:'', akunDiskonDistributor:'', akunDiskonSelisihHna:'', akunDiskonVoucher:'', akunPPN:'', akunOngkosKirim:'', akunLabaSelisihKurs:'', akunRugiSelisihKurs:'', akunSelisihDebitKredit:'', akunUangMuka:'', reward:'',
        akunReturKredit:'', akunReturPajak:'',
        akunARSSPPPN:'', akunARSSPPPH:'', akunPPNPemungut:'', akunUangMukaPPH22:'' };

  content.innerHTML = tplJurnalPenjualanForm(mode, row);

  const allFields = JJ_AKUN_GROUPS.flatMap(g => g.fields);
  allFields.forEach(f => {
    content.querySelector(`[data-akun-search="${f.key}"]`).onclick = () => openJjAkunPicker(f.key, row);
    content.querySelector(`[data-akun-clear="${f.key}"]`).onclick = () => {
      row[f.key] = '';
      document.getElementById(`fJj_${f.key}`).value = '';
      document.getElementById(`fJjNama_${f.key}`).textContent = '';
    };
  });

  document.getElementById('jjBatalkan').onclick = (e) => { e.preventDefault(); renderJjList(); };
  document.getElementById('jjDuplikat').onclick = () => {
    const dup = { ...row, kode: null, nama: row.nama + ' (Copy)' };
    DATA.jurnalPenjualan.push({ ...dup, kode: nextJjKode() });
    renderJjList();
  };
  document.getElementById('jjSimpan').onclick = () => {
    const nama = document.getElementById('fJjNama').value.trim();
    if(!nama){ jjValidationError('Nama Jurnal wajib diisi'); return; }
    row.nama = nama;
    if(mode === 'add'){
      row.kode = nextJjKode();
      DATA.jurnalPenjualan.push(row);
    } else {
      DATA.jurnalPenjualan[idx] = row;
    }
    renderJjList();
  };
}

function nextJjKode(){
  return DATA.jurnalPenjualan.length ? Math.max(...DATA.jurnalPenjualan.map(r=>r.kode)) + 1 : 1;
}

/* Pengganti alert() bawaan browser untuk validasi sederhana —
   pakai modal info custom yang sudah ada, konsisten dengan
   kebijakan "hindari alert/confirm/prompt bawaan browser". */
function jjValidationError(text){
  openJjInfo('Validasi', text);
}

function openJjAkunPicker(fieldKey, row){
  closeModal();
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.innerHTML = tplJjAkunPicker(DATA.akunGL, fieldKey);
  document.body.appendChild(overlay);
  document.getElementById('modalClose').onclick = closeModal;
  document.getElementById('modalCancel').onclick = closeModal;
  overlay.onclick = (e) => { if(e.target === overlay) closeModal(); };

  const wireRows = () => {
    overlay.querySelectorAll('[data-pick-akun]').forEach(btn => btn.onclick = () => {
      const kode = btn.dataset.pickAkun;
      row[fieldKey] = kode;
      document.getElementById(`fJj_${fieldKey}`).value = kode;
      document.getElementById(`fJjNama_${fieldKey}`).textContent = jjAkunNama(kode);
      closeModal();
    });
  };
  wireRows();

  document.getElementById('jjAkunPickerSearch').oninput = (e) => {
    const q = e.target.value.trim().toLowerCase();
    const filtered = DATA.akunGL.filter(a => a.kode.toLowerCase().includes(q) || a.nama.toLowerCase().includes(q));
    document.getElementById('jjAkunPickerBody').innerHTML = tplJjAkunPickerRows(filtered, fieldKey);
    wireRows();
  };
}

function openJjDeleteConfirm(idx){
  closeModal();
  const row = DATA.jurnalPenjualan[idx];
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.innerHTML = tplJjDeleteConfirm(row);
  document.body.appendChild(overlay);
  document.getElementById('modalClose').onclick = closeModal;
  document.getElementById('modalCancel').onclick = closeModal;
  overlay.onclick = (e) => { if(e.target === overlay) closeModal(); };
  document.getElementById('modalDelete').onclick = () => {
    DATA.jurnalPenjualan.splice(idx, 1);
    closeModal();
    renderJjTable();
  };
}

function openJjInfo(title, text){
  closeModal();
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.innerHTML = tplJjInfoModal(title, text);
  document.body.appendChild(overlay);
  document.getElementById('modalClose').onclick = closeModal;
  document.getElementById('modalOk').onclick = closeModal;
  overlay.onclick = (e) => { if(e.target === overlay) closeModal(); };
}
