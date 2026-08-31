/* =========================================================
   LOGIC (JS saja) — Transaksi A.R. (Customer & Penjualan >
   Daftar Transaksi > Transaksi A.R.). Dimuat otomatis (lazy-load)
   oleh core.js saat menu ini pertama kali diklik — lihat
   PAGE_MODULES di js/core.js. Markup HTML-nya ada di file
   sebelah: transaksi-ar.template.js (lihat catatan desain
   lengkap di headernya — KEMBARAN Transaksi A.P. untuk sisi
   piutang beserta daftar bedanya).
   NB: closeModal() dipakai bersama, didefinisikan di core.js.

   Alur inti:
   1) Header: Cabang menyetir No. Transaksi "26/ARS/{kode}/08/
      {urut}" (tarGenerateNo); Customer lewat picker
      DATA.customers; No. Faktur lewat picker DATA.invoices
      (Faktur Penjualan — memilih faktur ikut mengisi Customer
      kalau belum dipilih); Jurnal dari master Jurnal A.R.
      (DATA.jurnalAR — modul yang baru dibuat).
   2) Tab "Rincian Transaksi A.R.": baris rincian dengan Jumlah
      BOLEH NEGATIF (Nota Kredit — semua dokumen sample
      screenshot minus); total Jumlah reaktif.
   3) Tab "Rincian Jurnal Akun": mode Otomatis membangun jurnal
      dari master Jurnal A.R. terpilih — akunDebit(D) =
      akunKredit(K) senilai NILAI ABSOLUT total (nota kredit
      minus tetap menghasilkan jurnal positif dua sisi, seperti
      contoh screenshot PPN Keluaran(D) = Piutang SSP PPN(K));
      mode Manual bebas edit + picker Akun GL, validasi balance
      saat Simpan. TANPA kolom Cost Center (beda dari A.P.).
   4) Simpan/Cetak dan Simpan -> unshift ke DATA.transaksiAR;
      Cetak/CetakG.L. modal info placeholder.
========================================================= */
function renderTransaksiArPage(){
  renderTarList();
}

function renderTarList(){
  content.innerHTML = tplTransaksiArListPage();
  document.getElementById('btnTarAdd').onclick = () => openTarForm('add');
  renderTarTable();
}

function renderTarTable(){
  const tbody = document.getElementById('tarTbody');
  const total = document.getElementById('tarTotal');
  tbody.innerHTML = tplTarRows(DATA.transaksiAR);
  total.textContent = `Total Record: ${DATA.transaksiAR.length}`;
  tbody.querySelectorAll('[data-edit]').forEach(b => b.onclick = () => openTarForm('edit', +b.dataset.edit));
  tbody.querySelectorAll('[data-view]').forEach(b => b.onclick = () => openTarForm('view', +b.dataset.view));
  tbody.querySelectorAll('[data-view-link]').forEach(b => b.onclick = () => openTarForm('view', +b.dataset.viewLink));
  tbody.querySelectorAll('[data-print]').forEach(b => b.onclick = () => {
    const r = DATA.transaksiAR[+b.dataset.print];
    openTarInfo('Cetak Transaksi A.R.', `Preview PDF Transaksi A.R. <b>${r.no}</b> akan tersedia di sini.`);
  });
  tbody.querySelectorAll('[data-print-gl]').forEach(b => b.onclick = () => {
    const r = DATA.transaksiAR[+b.dataset.printGl];
    openTarInfo('Cetak G.L. Transaksi A.R.', `Preview cetakan jurnal G.L. untuk <b>${r.no}</b> akan tersedia di sini.`);
  });
  tbody.querySelectorAll('[data-del]').forEach(b => b.onclick = () => openTarDeleteConfirm(+b.dataset.del));
}

/* No. Transaksi format screenshot: "26/ARS/HO/08/00113" =
   26/ARS/{kode cabang}/08/{urut 5 digit per cabang}. */
function tarGenerateNo(cabang){
  const kode = TAR_CABANG_CODE[cabang] || 'XXX';
  const seq = DATA.transaksiAR.filter(r => r.cabang === cabang).length + 1;
  return `26/ARS/${kode}/08/${String(seq).padStart(5,'0')}`;
}

function tarRecalcJumlah(row){
  return Math.round((row.rincian||[]).reduce((s,it) => s + (+it.jumlah||0), 0) * 100) / 100;
}

function tarJurnalTotals(row){
  const list = row.jurnalAkun || [];
  const debit = Math.round(list.reduce((s,e) => s + (+e.debit||0), 0) * 100) / 100;
  const kredit = Math.round(list.reduce((s,e) => s + (+e.kredit||0), 0) * 100) / 100;
  return { debit, kredit, selisih: Math.round((debit - kredit) * 100) / 100 };
}

/* Jurnal Otomatis dari master Jurnal A.R. terpilih — dua sisi memakai
   NILAI ABSOLUT total rincian (nota kredit minus tetap menghasilkan
   jurnal positif, lihat catatan header). Baris akunPPN (khusus saldo
   awal U.M.) ikut tampil bernilai 0 hanya kalau diisi di masternya. */
function tarBuildJurnalOtomatis(row){
  const jumlahAbs = Math.abs(tarRecalcJumlah(row));
  const j = DATA.jurnalAR.find(x => x.kode === +row.jurnalKode || x.kode === row.jurnalKode);
  if(!j || !(jumlahAbs > 0)){ row.jurnalAkun = []; return; }
  const ket = row.keterangan || row.customerNama || j.nama;
  row.jurnalAkun = [
    { kodeAkun: j.akunDebit, namaAkun: tarAkunNama(j.akunDebit), keterangan: ket, debit: jumlahAbs, kredit: 0 },
    { kodeAkun: j.akunKredit, namaAkun: tarAkunNama(j.akunKredit), keterangan: ket, debit: 0, kredit: jumlahAbs },
  ];
  if(j.akunPPN){
    row.jurnalAkun.push({ kodeAkun: j.akunPPN, namaAkun: tarAkunNama(j.akunPPN), keterangan: ket, debit: 0, kredit: 0 });
  }
}

function tarBuildEmptyRow(){
  const cabang0 = TAR_CABANG_LIST[0];
  return { no: tarGenerateNo(cabang0), cabang: cabang0, tgl: '31/08/2026',
    customerKode:'', customerNama:'', noFaktur:'', jurnalKode:'', keterangan:'',
    rincian: [], jurnalMode:'otomatis', jurnalAkun: [], jumlah: 0 };
}

function openTarForm(mode, idx){
  const src = mode === 'add' ? tarBuildEmptyRow() : DATA.transaksiAR[idx];
  const row = {
    ...src,
    rincian: (src.rincian||[]).map(it => ({...it})),
    jurnalAkun: (src.jurnalAkun||[]).map(e => ({...e})),
  };
  content.innerHTML = tplTarForm(mode, row);
  wireTarForm(mode, idx, row);
}

/* ===== refresh DOM per bagian ===== */
function refreshTarRincianDOM(row, isView){
  document.getElementById('tarRincianBody').innerHTML = tplTarRincianRows(row.rincian, isView);
  wireTarRincianRows(row);
  refreshTarJumlahDOM(row);
  if(row.jurnalMode === 'otomatis'){ tarBuildJurnalOtomatis(row); refreshTarJurnalContent(row, isView); }
}

function refreshTarJumlahDOM(row){
  const el = document.getElementById('tarJumlah');
  if(el) el.value = tarNum2(tarRecalcJumlah(row));
}

function refreshTarJurnalContent(row, isView){
  const el = document.getElementById('tarTabJurnalContent');
  if(!el) return;
  const visible = el.style.display !== 'none';
  el.innerHTML = tplTarJurnalContent(row, isView);
  el.style.display = visible ? '' : 'none';
  wireTarJurnalEvents(row, isView);
}

function refreshTarJurnalSelisih(row){
  const el = document.getElementById('tarJurnalSelisih');
  if(!el) return;
  const totals = tarJurnalTotals(row);
  el.value = tarNum2(totals.selisih);
  el.style.color = Math.abs(totals.selisih) > 0.004 ? 'var(--red)' : 'var(--text)';
}

function wireTarRincianRows(row){
  (row.rincian||[]).forEach((it, idx) => {
    const tipe = document.querySelector(`[data-tar-rincian-tipe="${idx}"]`);
    if(tipe) tipe.onchange = () => { it.tipe = tipe.value; };
    const tempo = document.querySelector(`[data-tar-rincian-tempo="${idx}"]`);
    if(tempo) tempo.onchange = () => { it.tglJthTempo = tempo.value; };
    const jumlah = document.querySelector(`[data-tar-rincian-jumlah="${idx}"]`);
    if(jumlah) jumlah.onchange = () => {
      it.jumlah = +jumlah.value || 0;
      refreshTarJumlahDOM(row);
      if(row.jurnalMode === 'otomatis'){ tarBuildJurnalOtomatis(row); refreshTarJurnalContent(row, false); }
    };
    const del = document.querySelector(`[data-tar-rincian-del="${idx}"]`);
    if(del) del.onclick = () => { row.rincian.splice(idx,1); refreshTarRincianDOM(row, false); };
  });
}

function wireTarJurnalEvents(row, isView){
  const btnOto = document.getElementById('tarJurnalOtomatis');
  const btnManual = document.getElementById('tarJurnalManual');
  if(btnOto) btnOto.onchange = () => {
    row.jurnalMode = 'otomatis';
    tarBuildJurnalOtomatis(row);
    refreshTarJurnalContent(row, isView);
  };
  if(btnManual) btnManual.onchange = () => {
    row.jurnalMode = 'manual';
    refreshTarJurnalContent(row, isView);
  };

  const btnBuat = document.getElementById('tarBuatJurnal');
  if(btnBuat) btnBuat.onclick = () => {
    if(!row.jurnalKode){ openTarInfo('Validasi', 'Pilih <b>Jurnal</b> terlebih dahulu di bagian atas form (dari master Jurnal A.R.).'); return; }
    tarBuildJurnalOtomatis(row);
    refreshTarJurnalContent(row, isView);
  };

  const addRow = document.getElementById('tarJurnalAddRow');
  if(addRow) addRow.onclick = () => {
    row.jurnalAkun.push({ kodeAkun:'', namaAkun:'', keterangan: row.customerNama||'', debit:0, kredit:0 });
    refreshTarJurnalContent(row, isView);
  };

  if(isView || row.jurnalMode !== 'manual') return;
  (row.jurnalAkun||[]).forEach((entry, idx) => {
    const ket = document.querySelector(`[data-tar-jurnal-ket="${idx}"]`);
    if(ket) ket.onchange = () => { entry.keterangan = ket.value; };
    const deb = document.querySelector(`[data-tar-jurnal-debit="${idx}"]`);
    if(deb) deb.onchange = () => { entry.debit = +deb.value || 0; refreshTarJurnalSelisih(row); };
    const kre = document.querySelector(`[data-tar-jurnal-kredit="${idx}"]`);
    if(kre) kre.onchange = () => { entry.kredit = +kre.value || 0; refreshTarJurnalSelisih(row); };
    const del = document.querySelector(`[data-tar-jurnal-del="${idx}"]`);
    if(del) del.onclick = () => { row.jurnalAkun.splice(idx,1); refreshTarJurnalContent(row, isView); };
    const search = document.querySelector(`[data-tar-jurnal-akun-search="${idx}"]`);
    if(search) search.onclick = () => openTarAkunPicker(idx, row);
  });
}

function wireTarForm(mode, idx, row){
  const isAdd = mode === 'add';
  const isView = mode === 'view';

  const tabRincianBtn = document.getElementById('tarTabRincianBtn');
  const tabJurnalBtn = document.getElementById('tarTabJurnalBtn');
  const rincianContent = document.getElementById('tarTabRincianContent');
  const jurnalContent = document.getElementById('tarTabJurnalContent');
  tabRincianBtn.onclick = () => {
    tabRincianBtn.classList.add('active'); tabJurnalBtn.classList.remove('active');
    rincianContent.style.display = ''; jurnalContent.style.display = 'none';
  };
  tabJurnalBtn.onclick = () => {
    tabJurnalBtn.classList.add('active'); tabRincianBtn.classList.remove('active');
    if(!isView && row.jurnalMode === 'otomatis') tarBuildJurnalOtomatis(row);
    refreshTarJurnalContent(row, isView);
    jurnalContent.style.display = ''; rincianContent.style.display = 'none';
  };

  document.getElementById('btnTarTutorial').onclick = () => openTarInfo('Tutorial', 'Video tutorial pengisian Transaksi A.R. akan tersedia di sini.');
  document.getElementById('tarBatalkan').onclick = (e) => { e.preventDefault(); renderTarList(); };

  wireTarRincianRows(row);
  wireTarJurnalEvents(row, isView);

  if(isView) return;

  const cabangSel = document.getElementById('fTarCabang');
  const applyNo = () => {
    row.no = tarGenerateNo(row.cabang);
    document.getElementById('fTarNo').value = row.no;
  };
  if(isAdd){
    cabangSel.onchange = () => { row.cabang = cabangSel.value; applyNo(); };
    document.getElementById('tarRefreshNo').onclick = applyNo;
  }

  document.getElementById('fTarTgl').oninput = (e) => { row.tgl = e.target.value; };
  document.getElementById('fTarKeterangan').oninput = (e) => { row.keterangan = e.target.value; };
  document.getElementById('tarCustomerSearch').onclick = () => openTarCustomerPicker(row);
  document.getElementById('tarNoFakturSearch').onclick = () => openTarFakturPicker(row);

  document.getElementById('fTarJurnal').onchange = (e) => {
    row.jurnalKode = e.target.value ? +e.target.value : '';
    if(row.jurnalMode === 'otomatis'){ tarBuildJurnalOtomatis(row); refreshTarJurnalContent(row, isView); }
  };

  document.getElementById('tarRincianAdd').onclick = () => {
    row.rincian.push({ tipe: TAR_TIPE_TRANSAKSI_LIST[0], tglJthTempo: row.tgl || '', crc:'IDR', kurs:1, jumlah:0 });
    refreshTarRincianDOM(row, false);
  };

  document.getElementById('tarSimpan').onclick = () => tarSave(mode, idx, row, false);
  document.getElementById('tarCetakSimpan').onclick = () => tarSave(mode, idx, row, true);
}

function tarSave(mode, idx, row, withPrint){
  if(!row.customerNama){ openTarInfo('Validasi', 'Customer wajib dipilih.'); return; }
  if(!row.jurnalKode){ openTarInfo('Validasi', 'Jurnal wajib dipilih (dari master Jurnal A.R.).'); return; }
  const jumlah = tarRecalcJumlah(row);
  const adaRincian = (row.rincian||[]).some(it => Math.abs(+it.jumlah||0) > 0);
  if(!adaRincian){ openTarInfo('Validasi', 'Isi minimal 1 baris Rincian Transaksi A.R. dengan Jumlah tidak nol (boleh negatif untuk Nota Kredit).'); return; }
  if(row.jurnalMode === 'otomatis'){
    tarBuildJurnalOtomatis(row);
  } else {
    const totals = tarJurnalTotals(row);
    if(Math.abs(totals.selisih) > 0.004){
      openTarInfo('Validasi', `Rincian Jurnal Akun belum balance — Jumlah Debit - Kredit = <b>${tarNum2(totals.selisih)}</b>. Samakan total Debit dan Kredit terlebih dahulu.`);
      return;
    }
  }
  row.jumlah = jumlah;
  if(!row.keterangan){
    const j = DATA.jurnalAR.find(x => x.kode === +row.jurnalKode);
    row.keterangan = `${j ? j.nama : 'Transaksi A.R.'} - ${(row.customerNama||'').toUpperCase()}${row.noFaktur ? ' - ' + row.noFaktur : ''}`;
  }
  if(mode === 'add'){ DATA.transaksiAR.unshift(row); }
  else { DATA.transaksiAR[idx] = row; }
  if(withPrint){
    openTarInfo('Cetak Transaksi A.R.', `Preview PDF Transaksi A.R. <b>${row.no}</b> akan tersedia di sini. Data sudah tersimpan.`);
  }
  renderTarList();
}

function openTarCustomerPicker(row){
  closeModal();
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.innerHTML = tplTarCustomerPicker(DATA.customers);
  document.body.appendChild(overlay);
  document.getElementById('modalClose').onclick = closeModal;
  document.getElementById('modalCancel').onclick = closeModal;
  overlay.onclick = (e) => { if(e.target === overlay) closeModal(); };

  const wireRows = () => {
    overlay.querySelectorAll('[data-pick-customer]').forEach(btn => btn.onclick = () => {
      const c = DATA.customers.find(x => x.kode === btn.dataset.pickCustomer);
      row.customerKode = c.kode;
      row.customerNama = c.nama;
      document.getElementById('fTarCustomer').value = c.nama;
      if(row.jurnalMode === 'otomatis'){ tarBuildJurnalOtomatis(row); refreshTarJurnalContent(row, false); }
      closeModal();
    });
  };
  wireRows();

  document.getElementById('tarCustomerPickerSearch').oninput = (e) => {
    const q = e.target.value.trim().toLowerCase();
    const filtered = DATA.customers.filter(c => c.kode.toLowerCase().includes(q) || c.nama.toLowerCase().includes(q));
    document.getElementById('tarCustomerPickerBody').innerHTML = tplTarCustomerPickerRows(filtered);
    wireRows();
  };
}

function openTarFakturPicker(row){
  closeModal();
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.innerHTML = tplTarFakturPicker(DATA.invoices);
  document.body.appendChild(overlay);
  document.getElementById('modalClose').onclick = closeModal;
  document.getElementById('modalCancel').onclick = closeModal;
  overlay.onclick = (e) => { if(e.target === overlay) closeModal(); };

  const wireRows = () => {
    overlay.querySelectorAll('[data-pick-faktur]').forEach(btn => btn.onclick = () => {
      const f = DATA.invoices.find(x => x.no === btn.dataset.pickFaktur);
      if(!f) return;
      row.noFaktur = f.no;
      document.getElementById('fTarNoFaktur').value = f.no;
      if(!row.customerNama && f.customerNama){
        row.customerKode = f.customerKode || '';
        row.customerNama = f.customerNama;
        document.getElementById('fTarCustomer').value = f.customerNama;
      }
      closeModal();
    });
  };
  wireRows();

  document.getElementById('tarFakturPickerSearch').oninput = (e) => {
    const q = e.target.value.trim().toLowerCase();
    const filtered = DATA.invoices.filter(f => f.no.toLowerCase().includes(q) || (f.customerNama||'').toLowerCase().includes(q));
    document.getElementById('tarFakturPickerBody').innerHTML = tplTarFakturPickerRows(filtered);
    wireRows();
  };
}

function openTarAkunPicker(idx, row){
  closeModal();
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.innerHTML = tplTarAkunPicker(DATA.akunGL);
  document.body.appendChild(overlay);
  document.getElementById('modalClose').onclick = closeModal;
  document.getElementById('modalCancel').onclick = closeModal;
  overlay.onclick = (e) => { if(e.target === overlay) closeModal(); };

  const wireRows = () => {
    overlay.querySelectorAll('[data-tar-pick-akun]').forEach(btn => btn.onclick = () => {
      const kode = btn.dataset.tarPickAkun;
      row.jurnalAkun[idx].kodeAkun = kode;
      row.jurnalAkun[idx].namaAkun = tarAkunNama(kode);
      document.querySelector(`[data-tar-jurnal-kode="${idx}"]`).value = kode;
      document.querySelector(`[data-tar-jurnal-nama="${idx}"]`).value = tarAkunNama(kode);
      closeModal();
    });
  };
  wireRows();

  document.getElementById('tarAkunPickerSearch').oninput = (e) => {
    const q = e.target.value.trim().toLowerCase();
    const filtered = DATA.akunGL.filter(a => a.kode.toLowerCase().includes(q) || a.nama.toLowerCase().includes(q));
    document.getElementById('tarAkunPickerBody').innerHTML = tplTarAkunPickerRows(filtered);
    wireRows();
  };
}

function openTarDeleteConfirm(idx){
  closeModal();
  const row = DATA.transaksiAR[idx];
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.innerHTML = tplTarDeleteConfirm(row);
  document.body.appendChild(overlay);
  document.getElementById('modalClose').onclick = closeModal;
  document.getElementById('modalCancel').onclick = closeModal;
  overlay.onclick = (e) => { if(e.target === overlay) closeModal(); };
  document.getElementById('modalDelete').onclick = () => {
    DATA.transaksiAR.splice(idx, 1);
    closeModal();
    renderTarTable();
  };
}

function openTarInfo(title, text){
  closeModal();
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.innerHTML = tplTarInfoModal(title, text);
  document.body.appendChild(overlay);
  document.getElementById('modalClose').onclick = closeModal;
  document.getElementById('modalOk').onclick = closeModal;
  overlay.onclick = (e) => { if(e.target === overlay) closeModal(); };
}
