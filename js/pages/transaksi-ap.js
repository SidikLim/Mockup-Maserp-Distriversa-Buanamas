/* =========================================================
   LOGIC (JS saja) — Transaksi A.P. (Supplier & Pembelian >
   Daftar Transaksi > Transaksi A.P.). Dimuat otomatis (lazy-load)
   oleh core.js saat menu ini pertama kali diklik — lihat
   PAGE_MODULES di js/core.js. Markup HTML-nya ada di file
   sebelah: transaksi-ap.template.js (lihat catatan desain
   lengkap di headernya). NB: closeModal() dipakai bersama,
   didefinisikan di core.js.

   Alur inti (mengikuti 3 screenshot MASERP):
   1) Header form: pilih Cabang (menentukan No. Otomatis "AP{kode}"
      & No. Transaksi "AP/{kode}/{YYMM}{urut}"), pilih Supplier
      (modal picker), pilih Jurnal dari master Jurnal A.P.
      (DATA.jurnalAP — modul yang dibuat sebelumnya).
   2) Tab "Rincian Transaksi A.P.": baris rincian (Tipe Transaksi/
      Tgl. Jth. Tempo/Crc/Kurs/Nominal) ditambah manual lewat
      tombol +Tambah; total Nominal = field Jumlah (reaktif).
   3) Tab "Rincian Jurnal Akun": mode Otomatis membangun jurnal
      dari master Jurnal A.P. terpilih — akunDebit(D) =
      akunKredit(K) senilai Jumlah (tapBuildJurnalOtomatis(),
      dipanggil ulang tiap rincian/jurnal berubah selama mode
      masih otomatis, pola sama dgn Pelunasan Utang); mode Manual
      membebaskan baris di-edit/tambah/hapus + picker Akun GL +
      dropdown Cost Center, dengan validasi Debit=Kredit saat
      Simpan.
   4) Simpan/Cetak dan Simpan: dokumen baru di-unshift() ke
      DATA.transaksiAP; Cetak & Cetak G.L. di list berupa modal
      info placeholder (belum ada contoh cetakan dari user, pola
      sama dgn Cetak di Pelunasan Utang).
========================================================= */
function renderTransaksiApPage(){
  renderTapList();
}

function renderTapList(){
  content.innerHTML = tplTransaksiApListPage();
  document.getElementById('btnTapAdd').onclick = () => openTapForm('add');
  renderTapTable();
}

function renderTapTable(){
  const tbody = document.getElementById('tapTbody');
  const total = document.getElementById('tapTotal');
  tbody.innerHTML = tplTapRows(DATA.transaksiAP);
  total.textContent = `Total Record: ${DATA.transaksiAP.length}`;
  tbody.querySelectorAll('[data-edit]').forEach(b => b.onclick = () => openTapForm('edit', +b.dataset.edit));
  tbody.querySelectorAll('[data-view]').forEach(b => b.onclick = () => openTapForm('view', +b.dataset.view));
  tbody.querySelectorAll('[data-print]').forEach(b => b.onclick = () => {
    const r = DATA.transaksiAP[+b.dataset.print];
    openTapInfo('Cetak Transaksi A.P.', `Preview PDF Transaksi A.P. <b>${r.no}</b> akan tersedia di sini.`);
  });
  tbody.querySelectorAll('[data-print-gl]').forEach(b => b.onclick = () => {
    const r = DATA.transaksiAP[+b.dataset.printGl];
    openTapInfo('Cetak G.L. Transaksi A.P.', `Preview cetakan jurnal G.L. untuk <b>${r.no}</b> akan tersedia di sini.`);
  });
  tbody.querySelectorAll('[data-del]').forEach(b => b.onclick = () => openTapDeleteConfirm(+b.dataset.del));
}

/* No. Transaksi format screenshot: "AP/HO/260800001" =
   AP/{kode cabang}/{YY}{MM}{urut 5 digit}. */
function tapGenerateNo(cabang){
  const kode = TAP_CABANG_CODE[cabang] || 'XXX';
  const seq = DATA.transaksiAP.filter(r => r.cabang === cabang).length + 1;
  return `AP/${kode}/2608${String(seq).padStart(5,'0')}`;
}

function tapRecalcJumlah(row){
  return Math.round((row.rincian||[]).reduce((s,it) => s + (+it.nominal||0), 0) * 100) / 100;
}

function tapJurnalTotals(row){
  const list = row.jurnalAkun || [];
  const debit = Math.round(list.reduce((s,e) => s + (+e.debit||0), 0) * 100) / 100;
  const kredit = Math.round(list.reduce((s,e) => s + (+e.kredit||0), 0) * 100) / 100;
  return { debit, kredit, selisih: Math.round((debit - kredit) * 100) / 100 };
}

/* Jurnal Otomatis: dibangun dari master Jurnal A.P. terpilih
   (DATA.jurnalAP) — akunDebit(D) = akunKredit(K) senilai total
   rincian. Baris akunPPN (Khusus Saldo U.M.) hanya ikut kalau
   diisi di masternya (nilai 0, sekadar menampilkan akunnya —
   perhitungan PPN uang muka di luar cakupan mockup). */
function tapBuildJurnalOtomatis(row){
  const jumlah = tapRecalcJumlah(row);
  const j = DATA.jurnalAP.find(x => x.kode === +row.jurnalKode || x.kode === row.jurnalKode);
  if(!j || !(jumlah > 0)){ row.jurnalAkun = []; return; }
  const ket = row.supplierNama || j.nama;
  row.jurnalAkun = [
    { kodeAkun: j.akunDebit, costCenter:'', namaAkun: tapAkunNama(j.akunDebit), keterangan: ket, debit: jumlah, kredit: 0 },
    { kodeAkun: j.akunKredit, costCenter:'', namaAkun: tapAkunNama(j.akunKredit), keterangan: ket, debit: 0, kredit: jumlah },
  ];
  if(j.akunPPN){
    row.jurnalAkun.push({ kodeAkun: j.akunPPN, costCenter:'', namaAkun: tapAkunNama(j.akunPPN), keterangan: ket, debit: 0, kredit: 0 });
  }
}

function tapBuildEmptyRow(){
  const cabang0 = TAP_CABANG_LIST[0];
  const no = tapGenerateNo(cabang0);
  return { no, noFaktur: no, cabang: cabang0, tgl: '31/08/2026', supplierKode:'', supplierNama:'',
    jurnalKode:'', keterangan:'', noFakturSupplier:'', rincian: [], jurnalMode:'otomatis', jurnalAkun: [], jumlah: 0 };
}

function openTapForm(mode, idx){
  const src = mode === 'add' ? tapBuildEmptyRow() : DATA.transaksiAP[idx];
  const row = {
    ...src,
    rincian: (src.rincian||[]).map(it => ({...it})),
    jurnalAkun: (src.jurnalAkun||[]).map(e => ({...e})),
  };
  content.innerHTML = tplTapForm(mode, row);
  wireTapForm(mode, idx, row);
}

/* ===== refresh DOM per bagian (tanpa re-render seluruh form) ===== */
function refreshTapRincianDOM(row, isView){
  document.getElementById('tapRincianBody').innerHTML = tplTapRincianRows(row.rincian, isView);
  wireTapRincianRows(row);
  refreshTapJumlahDOM(row);
  if(row.jurnalMode === 'otomatis'){ tapBuildJurnalOtomatis(row); refreshTapJurnalContent(row, isView); }
}

function refreshTapJumlahDOM(row){
  const el = document.getElementById('tapJumlah');
  if(el) el.value = tapNum2(tapRecalcJumlah(row));
}

function refreshTapJurnalContent(row, isView){
  const el = document.getElementById('tapTabJurnalContent');
  if(!el) return;
  const visible = el.style.display !== 'none';
  el.innerHTML = tplTapJurnalContent(row, isView);
  el.style.display = visible ? '' : 'none';
  wireTapJurnalEvents(row, isView);
}

function refreshTapJurnalSelisih(row){
  const el = document.getElementById('tapJurnalSelisih');
  if(!el) return;
  const totals = tapJurnalTotals(row);
  el.value = tapNum2(totals.selisih);
  el.style.color = Math.abs(totals.selisih) > 0.004 ? 'var(--red)' : 'var(--text)';
}

function wireTapRincianRows(row){
  (row.rincian||[]).forEach((it, idx) => {
    const tipe = document.querySelector(`[data-tap-rincian-tipe="${idx}"]`);
    if(tipe) tipe.onchange = () => { it.tipe = tipe.value; };
    const tempo = document.querySelector(`[data-tap-rincian-tempo="${idx}"]`);
    if(tempo) tempo.onchange = () => { it.tglJthTempo = tempo.value; };
    const nominal = document.querySelector(`[data-tap-rincian-nominal="${idx}"]`);
    if(nominal) nominal.onchange = () => {
      it.nominal = +nominal.value || 0;
      refreshTapJumlahDOM(row);
      if(row.jurnalMode === 'otomatis'){ tapBuildJurnalOtomatis(row); refreshTapJurnalContent(row, false); }
    };
    const del = document.querySelector(`[data-tap-rincian-del="${idx}"]`);
    if(del) del.onclick = () => { row.rincian.splice(idx,1); refreshTapRincianDOM(row, false); };
  });
}

function wireTapJurnalEvents(row, isView){
  const btnOto = document.getElementById('tapJurnalOtomatis');
  const btnManual = document.getElementById('tapJurnalManual');
  if(btnOto) btnOto.onchange = () => {
    row.jurnalMode = 'otomatis';
    tapBuildJurnalOtomatis(row);
    refreshTapJurnalContent(row, isView);
  };
  if(btnManual) btnManual.onchange = () => {
    row.jurnalMode = 'manual';
    refreshTapJurnalContent(row, isView);
  };

  const btnBuat = document.getElementById('tapBuatJurnal');
  if(btnBuat) btnBuat.onclick = () => {
    if(!row.jurnalKode){ openTapInfo('Validasi', 'Pilih <b>Jurnal</b> terlebih dahulu di bagian atas form (dari master Jurnal A.P.).'); return; }
    tapBuildJurnalOtomatis(row);
    refreshTapJurnalContent(row, isView);
  };

  const addRow = document.getElementById('tapJurnalAddRow');
  if(addRow) addRow.onclick = () => {
    row.jurnalAkun.push({ kodeAkun:'', costCenter:'', namaAkun:'', keterangan: row.supplierNama||'', debit:0, kredit:0 });
    refreshTapJurnalContent(row, isView);
  };

  if(isView || row.jurnalMode !== 'manual') return;
  (row.jurnalAkun||[]).forEach((entry, idx) => {
    const cc = document.querySelector(`[data-tap-jurnal-cc="${idx}"]`);
    if(cc) cc.onchange = () => { entry.costCenter = cc.value; };
    const ket = document.querySelector(`[data-tap-jurnal-ket="${idx}"]`);
    if(ket) ket.onchange = () => { entry.keterangan = ket.value; };
    const deb = document.querySelector(`[data-tap-jurnal-debit="${idx}"]`);
    if(deb) deb.onchange = () => { entry.debit = +deb.value || 0; refreshTapJurnalSelisih(row); };
    const kre = document.querySelector(`[data-tap-jurnal-kredit="${idx}"]`);
    if(kre) kre.onchange = () => { entry.kredit = +kre.value || 0; refreshTapJurnalSelisih(row); };
    const del = document.querySelector(`[data-tap-jurnal-del="${idx}"]`);
    if(del) del.onclick = () => { row.jurnalAkun.splice(idx,1); refreshTapJurnalContent(row, isView); };
    const search = document.querySelector(`[data-tap-jurnal-akun-search="${idx}"]`);
    if(search) search.onclick = () => openTapAkunPicker(idx, row);
  });
}

function wireTapForm(mode, idx, row){
  const isAdd = mode === 'add';
  const isView = mode === 'view';

  // Tab switching
  const tabRincianBtn = document.getElementById('tapTabRincianBtn');
  const tabJurnalBtn = document.getElementById('tapTabJurnalBtn');
  const rincianContent = document.getElementById('tapTabRincianContent');
  const jurnalContent = document.getElementById('tapTabJurnalContent');
  tabRincianBtn.onclick = () => {
    tabRincianBtn.classList.add('active'); tabJurnalBtn.classList.remove('active');
    rincianContent.style.display = ''; jurnalContent.style.display = 'none';
  };
  tabJurnalBtn.onclick = () => {
    tabJurnalBtn.classList.add('active'); tabRincianBtn.classList.remove('active');
    if(!isView && row.jurnalMode === 'otomatis') tapBuildJurnalOtomatis(row);
    refreshTapJurnalContent(row, isView);
    jurnalContent.style.display = ''; rincianContent.style.display = 'none';
  };

  document.getElementById('btnTapTutorial').onclick = () => openTapInfo('Tutorial', 'Video tutorial pengisian Transaksi A.P. akan tersedia di sini.');
  document.getElementById('tapBatalkan').onclick = (e) => { e.preventDefault(); renderTapList(); };

  wireTapRincianRows(row);
  wireTapJurnalEvents(row, isView);

  if(isView) return;

  // Cabang <-> No. Otomatis saling sinkron, keduanya me-regenerate nomor
  const cabangSel = document.getElementById('fTapCabang');
  const noOtoSel = document.getElementById('fTapNoOtomatis');
  const applyNo = () => {
    row.no = tapGenerateNo(row.cabang);
    row.noFaktur = row.no;
    document.getElementById('fTapNo').value = row.no;
    document.getElementById('fTapNoFaktur').value = row.noFaktur;
  };
  if(isAdd){
    cabangSel.onchange = () => { row.cabang = cabangSel.value; noOtoSel.value = TAP_CABANG_CODE[row.cabang]; applyNo(); };
    noOtoSel.onchange = () => {
      const cabang = TAP_CABANG_LIST.find(c => TAP_CABANG_CODE[c] === noOtoSel.value) || TAP_CABANG_LIST[0];
      row.cabang = cabang; cabangSel.value = cabang; applyNo();
    };
    document.getElementById('tapRefreshNo').onclick = applyNo;
  }

  document.getElementById('fTapTgl').oninput = (e) => { row.tgl = e.target.value; };
  document.getElementById('fTapKeterangan').oninput = (e) => { row.keterangan = e.target.value; };
  document.getElementById('fTapNoFakturSupplier').oninput = (e) => { row.noFakturSupplier = e.target.value; };
  document.getElementById('tapSupplierSearch').onclick = () => openTapSupplierPicker(row);
  document.getElementById('tapNoFakturSearch').onclick = () =>
    openTapInfo('No. Faktur', 'No. Faktur mengikuti No. Transaksi secara otomatis. Pencarian faktur lain akan tersedia di sini.');

  document.getElementById('fTapJurnal').onchange = (e) => {
    row.jurnalKode = e.target.value ? +e.target.value : '';
    if(row.jurnalMode === 'otomatis'){ tapBuildJurnalOtomatis(row); refreshTapJurnalContent(row, isView); }
  };

  document.getElementById('tapRincianAdd').onclick = () => {
    row.rincian.push({ tipe: TAP_TIPE_TRANSAKSI_LIST[0], tglJthTempo: row.tgl || '', crc:'IDR', kurs:1, nominal:0 });
    refreshTapRincianDOM(row, false);
  };

  document.getElementById('tapSimpan').onclick = () => tapSave(mode, idx, row, false);
  document.getElementById('tapCetakSimpan').onclick = () => tapSave(mode, idx, row, true);
}

function tapSave(mode, idx, row, withPrint){
  if(!row.supplierNama){ openTapInfo('Validasi', 'Supplier wajib dipilih.'); return; }
  if(!row.jurnalKode){ openTapInfo('Validasi', 'Jurnal wajib dipilih (dari master Jurnal A.P.).'); return; }
  const jumlah = tapRecalcJumlah(row);
  if(!(jumlah > 0)){ openTapInfo('Validasi', 'Isi minimal 1 baris Rincian Transaksi A.P. dengan Nominal lebih dari 0.'); return; }
  if(row.jurnalMode === 'otomatis'){
    tapBuildJurnalOtomatis(row);
  } else {
    const totals = tapJurnalTotals(row);
    if(Math.abs(totals.selisih) > 0.004){
      openTapInfo('Validasi', `Rincian Jurnal Akun belum balance — Jumlah Debit - Kredit = <b>${tapNum2(totals.selisih)}</b>. Samakan total Debit dan Kredit terlebih dahulu.`);
      return;
    }
  }
  row.jumlah = jumlah;
  if(!row.keterangan){
    const j = DATA.jurnalAP.find(x => x.kode === +row.jurnalKode);
    row.keterangan = `${j ? j.nama : 'Transaksi A.P.'} - ${row.supplierNama}`;
  }
  if(mode === 'add'){ DATA.transaksiAP.unshift(row); }
  else { DATA.transaksiAP[idx] = row; }
  if(withPrint){
    openTapInfo('Cetak Transaksi A.P.', `Preview PDF Transaksi A.P. <b>${row.no}</b> akan tersedia di sini. Data sudah tersimpan.`);
  }
  renderTapList();
}

function openTapSupplierPicker(row){
  closeModal();
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.innerHTML = tplTapSupplierPicker(DATA.suppliers);
  document.body.appendChild(overlay);
  document.getElementById('modalClose').onclick = closeModal;
  document.getElementById('modalCancel').onclick = closeModal;
  overlay.onclick = (e) => { if(e.target === overlay) closeModal(); };

  const wireRows = () => {
    overlay.querySelectorAll('[data-pick-supplier]').forEach(btn => btn.onclick = () => {
      const s = DATA.suppliers.find(x => x.kode === btn.dataset.pickSupplier);
      row.supplierKode = s.kode;
      row.supplierNama = s.nama;
      document.getElementById('fTapSupplier').value = s.nama;
      if(row.jurnalMode === 'otomatis'){ tapBuildJurnalOtomatis(row); refreshTapJurnalContent(row, false); }
      closeModal();
    });
  };
  wireRows();

  document.getElementById('tapSupplierPickerSearch').oninput = (e) => {
    const q = e.target.value.trim().toLowerCase();
    const filtered = DATA.suppliers.filter(s => s.kode.toLowerCase().includes(q) || s.nama.toLowerCase().includes(q));
    document.getElementById('tapSupplierPickerBody').innerHTML = tplTapSupplierPickerRows(filtered);
    wireRows();
  };
}

function openTapAkunPicker(idx, row){
  closeModal();
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.innerHTML = tplTapAkunPicker(DATA.akunGL);
  document.body.appendChild(overlay);
  document.getElementById('modalClose').onclick = closeModal;
  document.getElementById('modalCancel').onclick = closeModal;
  overlay.onclick = (e) => { if(e.target === overlay) closeModal(); };

  const wireRows = () => {
    overlay.querySelectorAll('[data-tap-pick-akun]').forEach(btn => btn.onclick = () => {
      const kode = btn.dataset.tapPickAkun;
      row.jurnalAkun[idx].kodeAkun = kode;
      row.jurnalAkun[idx].namaAkun = tapAkunNama(kode);
      document.querySelector(`[data-tap-jurnal-kode="${idx}"]`).value = kode;
      document.querySelector(`[data-tap-jurnal-nama="${idx}"]`).value = tapAkunNama(kode);
      closeModal();
    });
  };
  wireRows();

  document.getElementById('tapAkunPickerSearch').oninput = (e) => {
    const q = e.target.value.trim().toLowerCase();
    const filtered = DATA.akunGL.filter(a => a.kode.toLowerCase().includes(q) || a.nama.toLowerCase().includes(q));
    document.getElementById('tapAkunPickerBody').innerHTML = tplTapAkunPickerRows(filtered);
    wireRows();
  };
}

function openTapDeleteConfirm(idx){
  closeModal();
  const row = DATA.transaksiAP[idx];
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.innerHTML = tplTapDeleteConfirm(row);
  document.body.appendChild(overlay);
  document.getElementById('modalClose').onclick = closeModal;
  document.getElementById('modalCancel').onclick = closeModal;
  overlay.onclick = (e) => { if(e.target === overlay) closeModal(); };
  document.getElementById('modalDelete').onclick = () => {
    DATA.transaksiAP.splice(idx, 1);
    closeModal();
    renderTapTable();
  };
}

function openTapInfo(title, text){
  closeModal();
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.innerHTML = tplTapInfoModal(title, text);
  document.body.appendChild(overlay);
  document.getElementById('modalClose').onclick = closeModal;
  document.getElementById('modalOk').onclick = closeModal;
  overlay.onclick = (e) => { if(e.target === overlay) closeModal(); };
}
