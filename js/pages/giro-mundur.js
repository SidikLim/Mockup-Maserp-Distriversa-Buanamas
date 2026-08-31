/* =========================================================
   LOGIC (JS saja) — Daftar Giro Mundur (Kas/Bank > Daftar
   Transaksi). Dimuat otomatis (lazy-load) oleh core.js saat menu
   ini pertama kali diklik — lihat PAGE_MODULES di js/core.js.
   Markup HTML-nya ada di file sebelah: giro-mundur.template.js
   (lihat catatan desain lengkap di headernya).
   NB: closeModal() dipakai bersama, didefinisikan di core.js.

   Alur inti (persis permintaan user):
   - Tombol CAIR di baris list -> membuka halaman "Cairkan Giro"
     (openGmAction('cair', ...)): Tgl. Efektif default tgl jatuh
     tempo, Keterangan prefilled, section Pilihan Jurnal berisi
     Debit/Credit otomatis sesuai tipe giro (lihat gmJurnalFor).
     Klik "Cairkan" -> status giro jadi 'Cair', kembali ke list.
   - Tombol TOLAK -> membuka halaman "Batalkan Giro"
     (openGmAction('tolak', ...)); klik "Batalkan Giro" -> status
     jadi 'Sudah Ditolak'.
   Filter status header FUNGSIONAL: list hanya menampilkan giro
   berstatus terpilih (default Belum Cair, persis screenshot),
   jadi giro yang dicairkan/ditolak "hilang" dari tab Belum Cair
   dan muncul di tab Cair / Sudah Ditolak. Tombol aksi hanya
   tampil di tab Belum Cair. Data: DATA.giroMundur. */

var gmState = { status:'Belum Cair', search:'' };

function renderGiroMundurPage(){
  gmState = { status:'Belum Cair', search:'' };
  renderGmList();
}

function renderGmList(){
  content.innerHTML = tplGiroMundurListPage(gmState.status);
  document.getElementById('gmFilterStatus').onchange = (e) => { gmState.status = e.target.value; renderGmTable(); };
  document.getElementById('gmSearch').oninput = (e) => { gmState.search = e.target.value; renderGmTable(); };
  renderGmTable();
}

function gmFilteredRows(){
  const q = gmState.search.trim().toLowerCase();
  return (DATA.giroMundur || []).filter(r => {
    if(r.status !== gmState.status) return false;
    if(q && !(
      r.noGiro.toLowerCase().includes(q) ||
      (r.noTransaksi || '').toLowerCase().includes(q) ||
      (r.nama || '').toLowerCase().includes(q) ||
      gmBankLabel(r.bankKode).toLowerCase().includes(q))) return false;
    return true;
  });
}

function renderGmTable(){
  const rows = gmFilteredRows();
  const tbody = document.getElementById('gmTbody');
  tbody.innerHTML = tplGmRows(rows, gmState.status);
  document.getElementById('gmTotal').textContent = `Total Record: ${rows.length}`;
  const idxOf = (r) => DATA.giroMundur.indexOf(r);
  tbody.querySelectorAll('[data-gm-view]').forEach(b => b.onclick = () => openGmDetail(rows[+b.dataset.gmView]));
  tbody.querySelectorAll('[data-gm-cair]').forEach(b => b.onclick = () => openGmAction('cair', idxOf(rows[+b.dataset.gmCair])));
  tbody.querySelectorAll('[data-gm-tolak]').forEach(b => b.onclick = () => openGmAction('tolak', idxOf(rows[+b.dataset.gmTolak])));
}

/* Debit/Credit otomatis section "Pilihan Jurnal" — lihat pemetaan
   lengkap di header giro-mundur.template.js. `bankKode` opsional
   (dipakai saat user mengganti dropdown Kode Jurnal). */
function gmJurnalFor(mode, row, bankKode){
  const akunBank = gmBankAkunGL(bankKode || row.bankKode);
  const terima = row.tipe === 'Terima Giro';
  if(mode === 'cair'){
    return terima
      ? { debit: akunBank, kredit: '1120005' }   // D bank, K Piutang Usaha - Giro Mundur
      : { debit: '2110004', kredit: akunBank };  // D Hutang Usaha Giro Mundur, K bank
  }
  return terima
    ? { debit: '1120001', kredit: '1120005' }    // batal: kembali jadi Piutang Usaha
    : { debit: '2110004', kredit: '2110001' };   // batal: kembali jadi Hutang Usaha
}

function openGmAction(mode, idx){
  const row = DATA.giroMundur[idx];
  content.innerHTML = tplGmActionForm(mode, row);

  const kodeJurnalSel = document.getElementById('fGmKodeJurnal');
  const refreshJurnal = () => {
    const jurnal = gmJurnalFor(mode, row, kodeJurnalSel.value);
    document.getElementById('fGmDebit').value = jurnal.debit;
    document.getElementById('fGmDebitNama').textContent = gmAkunNama(jurnal.debit);
    document.getElementById('fGmCredit').value = jurnal.kredit;
    document.getElementById('fGmCreditNama').textContent = gmAkunNama(jurnal.kredit);
  };
  kodeJurnalSel.onchange = refreshJurnal;

  document.getElementById('gmBatalkan').onclick = () => renderGmList();
  document.getElementById('gmAksi').onclick = () => {
    const tglEfektif = document.getElementById('fGmTglEfektif').value.trim();
    if(!tglEfektif){ openGmInfo('Validasi', 'Tgl. Efektif wajib diisi.'); return; }
    row.tglEfektif = tglEfektif;
    row.keterangan = document.getElementById('fGmKeterangan').value;
    row.status = mode === 'cair' ? 'Cair' : 'Sudah Ditolak';
    // Setelah aksi, list kembali ke tab status barunya supaya user
    // langsung melihat giro tadi berpindah tab.
    gmState.status = row.status;
    renderGmList();
  };
}

function openGmDetail(row){
  closeModal();
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.innerHTML = tplGmDetailModal(row);
  document.body.appendChild(overlay);
  document.getElementById('modalClose').onclick = closeModal;
  document.getElementById('modalCancel').onclick = closeModal;
  overlay.onclick = (e) => { if(e.target === overlay) closeModal(); };
}

function openGmInfo(title, text){
  closeModal();
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.innerHTML = tplGmInfoModal(title, text);
  document.body.appendChild(overlay);
  document.getElementById('modalClose').onclick = closeModal;
  document.getElementById('modalOk').onclick = closeModal;
  overlay.onclick = (e) => { if(e.target === overlay) closeModal(); };
}
