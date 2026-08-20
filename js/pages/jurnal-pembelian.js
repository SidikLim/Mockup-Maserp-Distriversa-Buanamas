/* =========================================================
   LOGIC (JS saja) — Jurnal Pembelian (Supplier & Pembelian >
   Master & Setting). Dimuat otomatis (lazy-load) oleh core.js
   saat menu ini pertama kali diklik — lihat PAGE_MODULES di
   js/core.js. Markup HTML-nya ada di file sebelah:
   jurnal-pembelian.template.js (tplJurnalPembelianListPage/
   tplJpRows/tplJurnalPembelianForm/tplJpAkunPicker/dst, plus
   konstanta JP_AKUN_GROUPS yang dipakai bersama di sini).
   NB: closeModal() dipakai bersama, didefinisikan di core.js.

   Pola CRUD: list + form FULL PAGE (bukan modal, karena field
   akun sangat banyak — 17 field akun total di 3 section), sama
   seperti Master Supplier. Tiap field akun pakai picker modal
   yang me-list DATA.akunGL (menu Akun GL yang sudah dibuat
   sebelumnya) — begitu "Pilih" diklik, kode+nama akun otomatis
   terisi di baris terkait, pola sama seperti picker Wilayah/
   Pusat Bisnis di Master Supplier.
========================================================= */
function renderJurnalPembelianPage(){
  renderJpList();
}

function renderJpList(){
  content.innerHTML = tplJurnalPembelianListPage();
  document.getElementById('btnJpAddKas').onclick = () => openJpForm('add', 'Kas');
  document.getElementById('btnJpAddKredit').onclick = () => openJpForm('add', 'Kredit');
  document.getElementById('btnJpTutorial').onclick = () => openJpInfo('Tutorial', 'Video tutorial pengisian Jurnal Pembelian akan tersedia di sini.');
  renderJpTable();
}

function renderJpTable(){
  const tbody = document.getElementById('jpTbody');
  const total = document.getElementById('jpTotal');
  tbody.innerHTML = tplJpRows(DATA.jurnalPembelian);
  total.textContent = `Total Record: ${DATA.jurnalPembelian.length}`;
  tbody.querySelectorAll('[data-edit]').forEach(b => b.onclick = () => openJpForm('edit', null, +b.dataset.edit));
  tbody.querySelectorAll('[data-del]').forEach(b => b.onclick = () => openJpDeleteConfirm(+b.dataset.del));
  tbody.querySelectorAll('[data-toggle]').forEach(cb => cb.onchange = () => {
    const idx = +cb.dataset.idx;
    DATA.jurnalPembelian[idx][cb.dataset.toggle] = cb.checked;
  });
}

function openJpForm(mode, tipeJurnal, idx){
  const row = mode === 'edit'
    ? { ...DATA.jurnalPembelian[idx] }
    : { kode: null, nama:'', tipeJurnal: tipeJurnal||'Kredit', mataUang:'', cabang:'Head Office', konsinyasi:false, nonAktif:false,
        akunUtang:'', akunKreditSementara:'', akunBudgetDiskon:'', akunPPN:'', akunOngkosKirim:'', akunLabaSelisihKurs:'', akunRugiSelisihKurs:'', akunSelisihDebitKredit:'', akunUangMuka:'',
        akunReturUtang:'', akunReturPajak:'',
        akunHppKonsinyasi:'', akunBiayaPemakaian:'', akunDiskonPrincipal:'', akunHutangRK:'', akunPiutangRK:'', akunHutangBelumDifaktur:'',
        akunARSSPPPN:'', akunARSSPPPH:'', akunPPNPemungut:'', akunUangMukaPPH22:'' };

  content.innerHTML = tplJurnalPembelianForm(mode, row);

  const allFields = JP_AKUN_GROUPS.flatMap(g => g.fields);
  allFields.forEach(f => {
    content.querySelector(`[data-akun-search="${f.key}"]`).onclick = () => openJpAkunPicker(f.key, row);
    content.querySelector(`[data-akun-clear="${f.key}"]`).onclick = () => {
      row[f.key] = '';
      document.getElementById(`fJp_${f.key}`).value = '';
      document.getElementById(`fJpNama_${f.key}`).textContent = '';
    };
  });

  document.getElementById('jpBatalkan').onclick = (e) => { e.preventDefault(); renderJpList(); };
  document.getElementById('jpDuplikat').onclick = () => {
    const dup = { ...row, kode: null, nama: row.nama + ' (Copy)' };
    DATA.jurnalPembelian.push({ ...dup, kode: nextJpKode() });
    renderJpList();
  };
  document.getElementById('jpSimpan').onclick = () => {
    const nama = document.getElementById('fJpNama').value.trim();
    if(!nama){ jpValidationError('Nama Jurnal wajib diisi'); return; }
    row.nama = nama;
    row.cabang = document.getElementById('fJpCabang').value;
    if(mode === 'add'){
      row.kode = nextJpKode();
      DATA.jurnalPembelian.push(row);
    } else {
      DATA.jurnalPembelian[idx] = row;
    }
    renderJpList();
  };
}

function nextJpKode(){
  return DATA.jurnalPembelian.length ? Math.max(...DATA.jurnalPembelian.map(r=>r.kode)) + 1 : 1;
}

/* Pengganti alert() bawaan browser untuk validasi sederhana —
   pakai modal info custom yang sudah ada, konsisten dengan
   kebijakan "hindari alert/confirm/prompt bawaan browser". */
function jpValidationError(text){
  openJpInfo('Validasi', text);
}

function openJpAkunPicker(fieldKey, row){
  closeModal();
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.innerHTML = tplJpAkunPicker(DATA.akunGL, fieldKey);
  document.body.appendChild(overlay);
  document.getElementById('modalClose').onclick = closeModal;
  document.getElementById('modalCancel').onclick = closeModal;
  overlay.onclick = (e) => { if(e.target === overlay) closeModal(); };

  const wireRows = () => {
    overlay.querySelectorAll('[data-pick-akun]').forEach(btn => btn.onclick = () => {
      const kode = btn.dataset.pickAkun;
      row[fieldKey] = kode;
      document.getElementById(`fJp_${fieldKey}`).value = kode;
      document.getElementById(`fJpNama_${fieldKey}`).textContent = jpAkunNama(kode);
      closeModal();
    });
  };
  wireRows();

  document.getElementById('jpAkunPickerSearch').oninput = (e) => {
    const q = e.target.value.trim().toLowerCase();
    const filtered = DATA.akunGL.filter(a => a.kode.toLowerCase().includes(q) || a.nama.toLowerCase().includes(q));
    document.getElementById('jpAkunPickerBody').innerHTML = tplJpAkunPickerRows(filtered, fieldKey);
    wireRows();
  };
}

function openJpDeleteConfirm(idx){
  closeModal();
  const row = DATA.jurnalPembelian[idx];
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.innerHTML = tplJpDeleteConfirm(row);
  document.body.appendChild(overlay);
  document.getElementById('modalClose').onclick = closeModal;
  document.getElementById('modalCancel').onclick = closeModal;
  overlay.onclick = (e) => { if(e.target === overlay) closeModal(); };
  document.getElementById('modalDelete').onclick = () => {
    DATA.jurnalPembelian.splice(idx, 1);
    closeModal();
    renderJpTable();
  };
}

function openJpInfo(title, text){
  closeModal();
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.innerHTML = tplJpInfoModal(title, text);
  document.body.appendChild(overlay);
  document.getElementById('modalClose').onclick = closeModal;
  document.getElementById('modalOk').onclick = closeModal;
  overlay.onclick = (e) => { if(e.target === overlay) closeModal(); };
}
