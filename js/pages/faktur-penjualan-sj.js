/* =========================================================
   LOGIC (JS saja) — Faktur Penjualan Via S.J. (Customer &
   Penjualan > Daftar Transaksi > Penjualan Via S.J., page key
   'fakturPenjualanSJ'). Dimuat otomatis (lazy-load) oleh core.js
   saat menu ini pertama kali diklik — lihat PAGE_MODULES di
   js/core.js. Markup HTML-nya ada di file sebelah:
   faktur-penjualan-sj.template.js (tplFakturPenjualanSJListPage/
   tplFktRows/tplFktForm/dst, plus konstanta FKT_CABANG_LIST/
   FKT_SYARAT_BAYAR_LIST/FKT_PPN_LIST/FKT_PPH_LIST & helper murni
   fktJatuhTempo() yang dipakai bersama di sini).
   NB: closeModal() dipakai bersama, didefinisikan di core.js.

   RANTAI DATA (inti desain modul ini, lihat komentar panjang di atas
   DATA.fakturPenjualanSJ, js/data.js): 2 field bisa jadi titik masuk
   picker di form, "Dari Sales Order" dan "Dari S.J.", KEDUANYA atas
   sumber yang SAMA (DATA.invoices — beda dari Invoice yang sumber
   dual-picker-nya 2 array berbeda, DATA.salesOrders & DATA.pickingList,
   karena di sana logic-nya memang perlu resolve SO->PL berjenjang).
   Di sini 1 baris DATA.invoices sudah membawa noSO+noSJ+Customer+
   Principal+item sekaligus, jadi cukup 1 fungsi apply bersama
   fktApplyInvoice() (pola sama seperti invApplyPickingList()) yang
   dipanggil dari KEDUA handler "Pilih" picker.
========================================================= */

function renderFakturPenjualanSJPage(){
  renderFktList();
}

function renderFktList(){
  content.innerHTML = tplFakturPenjualanSJListPage();
  document.getElementById('btnFktAdd').onclick = () => openFktForm('add');
  document.getElementById('fktFilterAll').onchange = () => openFktInfo('Filter Status', 'Menampilkan semua status Faktur Penjualan Via S.J. Filter per status akan tersedia pada versi lengkap.');
  document.getElementById('fktFilterPeriod').onchange = () => openFktInfo('Filter Periode', 'Menampilkan Faktur Penjualan Via S.J. untuk periode Agustus 2026. Pemilihan periode lain akan tersedia pada versi lengkap.');
  renderFktTable();
}

function renderFktTable(){
  const tbody = document.getElementById('fktTbody');
  const total = document.getElementById('fktTotal');
  tbody.innerHTML = tplFktRows(DATA.fakturPenjualanSJ);
  // NB: mengikuti konvensi seluruh modul CRUD lain di mockup ini — Total
  // Record SELALU dihitung dari panjang array data asli (8), BUKAN angka
  // dekoratif yang jauh lebih besar seperti di screenshot contoh.
  total.textContent = `Total Record: ${DATA.fakturPenjualanSJ.length}`;
  tbody.querySelectorAll('[data-attach]').forEach(b => b.onclick = () => openFktInfo('Attach', `Lampiran dokumen untuk Faktur <b>${DATA.fakturPenjualanSJ[+b.dataset.attach].no}</b> akan tersedia di sini pada versi lengkap.`));
  tbody.querySelectorAll('[data-kwitansi]').forEach(b => b.onclick = () => openFktInfo('Kwitansi', `Preview PDF Kwitansi untuk Faktur <b>${DATA.fakturPenjualanSJ[+b.dataset.kwitansi].no}</b> akan tersedia di sini.`));
  tbody.querySelectorAll('[data-view]').forEach(b => b.onclick = () => openFktForm('view', +b.dataset.view));
  tbody.querySelectorAll('[data-cetak]').forEach(b => b.onclick = () => openFktInfo('Cetak Faktur Penjualan Via S.J.', `Preview PDF Faktur <b>${DATA.fakturPenjualanSJ[+b.dataset.cetak].no}</b> akan tersedia di sini.`));
  tbody.querySelectorAll('[data-edit]').forEach(b => b.onclick = () => openFktForm('edit', +b.dataset.edit));
  tbody.querySelectorAll('[data-del]').forEach(b => b.onclick = () => openFktDeleteConfirm(+b.dataset.del));
}

/* No. Faktur auto-generate — format "26/SI/<KODE>/08/<seq>", offset 50
   dipakai supaya nomor baru terlihat "melanjutkan" seri seq besar yang
   sudah dipakai di 8 baris sample (095-182, lihat komentar di
   js/data.js), murni dekoratif/kosmetik, tidak divalidasi unik. */
function fktGenerateNumber(cabang){
  const kode = FKT_CABANG_CODE[cabang] || 'XXX';
  const seq = 50 + DATA.fakturPenjualanSJ.filter(r => r.cabang === cabang).length + 1;
  return `26/SI/${kode}/08/${String(seq).padStart(5, '0')}`;
}

function fktBuildEmptyRow(){
  const cabang0 = FKT_CABANG_LIST[0];
  const tglFaktur0 = '12/08/2026';
  const syaratBayar0 = FKT_SYARAT_BAYAR_LIST[0];
  return {
    no: fktGenerateNumber(cabang0), cabang: cabang0,
    tglFaktur: tglFaktur0, tglJatuhTempo: fktJatuhTempo(tglFaktur0, syaratBayar0), syaratBayar: syaratBayar0,
    customerKode:'', customerNama:'', customerAlamat:'',
    noDSC:'', principalKode:'', principalNama:'', noReturSJ:'', noPacking:'',
    dariSO:'', dariSJ:'', noSP:'', tglSP:'',
    jurnal: DATA.jurnalPenjualan[0].nama, salesman:'', poCustomer:'', driver:'', kernet:'',
    alamatPengirimanTipe: FKT_ALAMAT_TIPE_LIST[0], alamatPengiriman:'',
    tglBatasRetur:'', tipeLayanan: DATA.layananList[0],
    items:[],
    tipePpn: FKT_PPN_LIST[3], mataUang:'Rupiah (IDR)', kursPajak:0, tglFakturPajak:'', kodePajak: DATA.kodePajakList[0], noFakturPajak:'',
    diskon1:0, diskon1Amount:0, diskon2:0, diskon2Amount:0, kurs:1, dpp:0, pajak11:'PPN11',
    uangMukaTipe: FKT_UANG_MUKA_LIST[0], sisaUangMuka:0, uangMukaPakai:0,
    pphAktif:false, pphKode:'', pphPersen:0, pphAmount:0,
    ongkosAngkut:0, ppn:0, jumlahAkhir:0, sisaJumlah:0,
    keterangan:'', tipeTransaksi: syaratBayar0==='CBD' ? 'Penjualan Tunai' : 'Penjualan Kredit',
    tglInput:'', userInput:'', tglEdit:'', userEdit:'',
  };
}

function fktBuildEmptyItem(){
  return { kode:'', nama:'', keterangan:'', qtyPhysical:1, um:'', hna:0, hna1:0, discPrincipal:0, discDistributor:0, totalDisc:0, discBarang:0, jumlah:0, kodePromosi:'', ppnChecked:true };
}

/* Kalkulasi murni 1 baris item — TIDAK menyentuh DOM (pola identik
   poRecalcItem() di Purchase Order). Disc/Barang = HNA1 x Total Disc%
   (NOMINAL PER-UNIT, bukan total), Jumlah = (HNA1 - Disc/Barang) x Qty
   Physical — sesuai rumus yang didokumentasikan di atas
   DATA.fakturPenjualanSJ, js/data.js. */
function fktRecalcItem(item){
  item.totalDisc = (+item.discPrincipal || 0) + (+item.discDistributor || 0);
  item.discBarang = Math.round((+item.hna1 || 0) * item.totalDisc / 100);
  item.jumlah = Math.round(((+item.hna1 || 0) - item.discBarang) * (+item.qtyPhysical || 0));
}

function fktRefreshItemRowDOM(idx, item){
  const totalDiscEl = document.querySelector(`[data-fkt-totaldisc="${idx}"]`);
  const discBarangEl = document.querySelector(`[data-fkt-discbarang="${idx}"]`);
  const jumlahEl = document.querySelector(`[data-fkt-jumlah="${idx}"]`);
  if(totalDiscEl) totalDiscEl.value = item.totalDisc;
  if(discBarangEl) discBarangEl.value = num(item.discBarang);
  if(jumlahEl) jumlahEl.value = num(item.jumlah);
}

/* Rekalkulasi total dokumen (DPP/Diskon/PPN/PPh/Uang Muka/Jumlah
   Akhir/Sisa Jumlah) — pola pisah hitung-murni/update-DOM yang sama
   seperti poRecalcTotals()/poRefreshTotalsDOM() di Purchase Order.
   Asumsi: row.diskon1/diskon2/ongkosAngkut/uangMukaPakai/tipePpn/
   pphAktif/pphPersen SUDAH di-update ke `row` oleh handler pemanggil
   SEBELUM fungsi ini dipanggil (bukan dibaca ulang dari DOM di sini). */
function fktRecalcTotals(row){
  const subtotal = row.items.reduce((s, it) => s + (+it.jumlah || 0), 0);
  row.diskon1Amount = Math.round(subtotal * (+row.diskon1 || 0) / 100);
  row.diskon2Amount = Math.round(subtotal * (+row.diskon2 || 0) / 100);
  row.dpp = subtotal - row.diskon1Amount - row.diskon2Amount;
  row.pajak11 = (row.tipePpn === 'PPN Inklusif' || row.tipePpn === 'PPN Eksklusif(+11%)') ? 'PPN11' : '';
  row.ppn = (row.tipePpn === 'PPN Eksklusif(+11%)') ? Math.round(row.dpp * 0.11) : 0;
  row.pphAmount = row.pphAktif ? Math.round(row.dpp * (+row.pphPersen || 0) / 100) : 0;
  row.jumlahAkhir = Math.round(row.dpp + row.ppn - row.pphAmount + (+row.ongkosAngkut || 0));
  row.sisaJumlah = row.jumlahAkhir - (+row.uangMukaPakai || 0);
}

function fktRefreshTotalsDOM(row){
  document.getElementById('fFktDiskon1Rp').value = num(row.diskon1Amount);
  document.getElementById('fFktDiskon2Rp').value = num(row.diskon2Amount);
  document.getElementById('fFktDpp').value = num(row.dpp);
  document.getElementById('fFktPajak11').value = row.pajak11;
  document.getElementById('fFktPpnAmount').value = num(row.ppn);
  document.getElementById('fFktPphAmount').value = num(row.pphAmount);
  document.getElementById('fFktJumlahAkhir').value = num(row.jumlahAkhir);
  document.getElementById('fFktSisaJumlah').value = num(row.sisaJumlah);
}

function fktTogglePpnSubfields(mode){
  const el = document.getElementById('fktPpnSubfields');
  if(!el) return;
  el.style.display = (mode === 'PPN Inklusif' || mode === 'PPN Eksklusif(+11%)') ? '' : 'none';
}

/* ===== Helper bersama "terapkan 1 Invoice" — dipanggil dari
   openFktSoPicker() MAUPUN openFktSjPicker() (lihat komentar header
   file ini). Driver HANYA dibawa kalau shipVia Invoice sumbernya
   'Driver' (kalau Ekspedisi/Diambil Sendiri/Dikirim Supplier, Driver
   dikosongkan) — sesuai catatan desain di atas DATA.fakturPenjualanSJ.
   Kernet TIDAK ada sumbernya di DATA.invoices (field baru, belum ada
   di modul manapun sebelum ini) sehingga TIDAK disentuh di sini —
   dibiarkan seperti isi row saat ini, dipilih manual lewat picker
   Kernet sendiri. ===== */
function fktApplyInvoice(row, invRow){
  row.dariSO = invRow.noSO || '';
  row.dariSJ = invRow.noSJ || '';
  row.customerKode = invRow.customerKode || '';
  row.customerNama = invRow.customerNama || '';
  row.customerAlamat = invRow.customerAlamat || '';
  row.noSP = invRow.noSP || '';
  row.tglSP = invRow.tglSP || '';
  row.noDSC = invRow.noDSC || '';
  row.principalKode = invRow.principalKode || '';
  row.principalNama = invRow.principalNama || '';
  row.syaratBayar = invRow.syaratBayar || row.syaratBayar || FKT_SYARAT_BAYAR_LIST[0];
  row.alamatPengiriman = invRow.alamatPengiriman || invRow.customerAlamat || '';
  row.tipeLayanan = invRow.layanan || row.tipeLayanan || DATA.layananList[0];
  row.driver = (invRow.shipVia === 'Driver') ? (invRow.driver || '') : '';
  row.cabang = invRow.cabang || row.cabang;
  row.tipeTransaksi = (row.syaratBayar === 'CBD') ? 'Penjualan Tunai' : 'Penjualan Kredit';
  row.items = (invRow.items || []).map(it => fktBuildItemFromInvoiceItem(it));
  row.items.forEach(fktRecalcItem);
}

/* Barang di tabel Invoice sumber ({kode,nama,satuan,qtyPesan,qtyKirim,
   batch,ed}) dikonversi jadi baris item Faktur — HNA/HNA1 diambil dari
   DATA.items[].harga (barang yang kode-nya tidak ketemu dianggap 0),
   Qty Physical awal = Qty Kirim Invoice-nya, Disc Principal/Distributor
   default 0 (baru dihitung sungguhan kalau memang match DATA.promotion,
   lihat catatan di js/data.js — untuk hasil PILIH INTERAKTIF di form ini
   disederhanakan jadi 0/user isi manual, BUKAN mengulang lookup promosi
   otomatis, konsisten dengan Kode Promosi yang murni tampilan). */
function fktBuildItemFromInvoiceItem(it){
  const master = DATA.items.find(x => x.kode === it.kode);
  const harga = master ? (+master.harga || 0) : 0;
  return {
    kode: it.kode, nama: it.nama, keterangan:'', qtyPhysical: it.qtyKirim || 0, um: it.satuan || '',
    hna: harga, hna1: harga, discPrincipal:0, discDistributor:0, totalDisc:0, discBarang:0, jumlah:0,
    kodePromosi:'', ppnChecked:true,
  };
}

function openFktForm(mode, idx){
  let row;
  const isAdd = mode === 'add';
  const isView = mode === 'view';
  if(isAdd){
    row = fktBuildEmptyRow();
  } else {
    const src = DATA.fakturPenjualanSJ[idx];
    row = { ...src, items: src.items.map(it => ({ ...it })) };
  }

  // Rekalkulasi sekali sebelum render — supaya field turunan yang
  // TIDAK disimpan mentah di DATA.fakturPenjualanSJ (mis. `pajak11`,
  // yang cuma ada di hasil poRecalcTotals-style, bukan field asli di
  // js/data.js) tetap benar begitu form dibuka, baik mode Tambah,
  // Ubah, MAUPUN Lihat (bukan cuma reaktif setelah interaksi user).
  row.items.forEach(fktRecalcItem);
  fktRecalcTotals(row);

  content.innerHTML = tplFktForm(mode, row);

  if(isView){
    document.getElementById('fktTutup').onclick = (e) => { e.preventDefault(); renderFktList(); };
    return;
  }

  const isEdit = !isAdd;
  const btnTutorial = document.getElementById('btnFktTutorial');
  if(btnTutorial) btnTutorial.onclick = () => openFktInfo('Tutorial', 'Video tutorial pengisian Faktur Penjualan Via S.J. akan tersedia di sini.');

  if(isAdd){
    document.getElementById('fFktCabang').onchange = (e) => {
      row.cabang = e.target.value;
      row.no = fktGenerateNumber(row.cabang);
      document.getElementById('fFktNoFaktur').value = row.no;
    };
  }

  const recomputeJatuhTempo = () => {
    row.tglFaktur = document.getElementById('fFktTglFaktur').value;
    row.syaratBayar = document.getElementById('fFktSyaratBayar').value;
    row.tglJatuhTempo = fktJatuhTempo(row.tglFaktur, row.syaratBayar);
    document.getElementById('fFktTglJthTempo').value = row.tglJatuhTempo;
    row.tipeTransaksi = (row.syaratBayar === 'CBD') ? 'Penjualan Tunai' : 'Penjualan Kredit';
  };
  // Tgl. Jth. Tempo dihitung otomatis (fktJatuhTempo()) tiap kali Tgl.
  // Faktur atau Syarat Bayar berubah, di mode Tambah (lihat spesifikasi
  // modul ini) — tetap diwire juga di mode Ubah karena tidak berbahaya
  // & tetap berguna kalau user mengoreksi Tgl. Faktur/Syarat Bayar.
  document.getElementById('fFktTglFaktur').onchange = recomputeJatuhTempo;
  document.getElementById('fFktSyaratBayar').onchange = recomputeJatuhTempo;

  document.getElementById('fktSoSearch').onclick = () => openFktInvoicePicker(row, isAdd, 'Pilih Sales Order');
  document.getElementById('fktSjSearch').onclick = () => openFktInvoicePicker(row, isAdd, 'Pilih S.J.');
  document.getElementById('fktSalesmanSearch').onclick = () => openFktSalesmanPicker(row);
  document.getElementById('fktDriverSearch').onclick = () => openFktDriverPicker(row);
  document.getElementById('fktKernetSearch').onclick = () => openFktKernetPicker(row);

  wireFktTabs();
  wireFktItemEvents(row);
  document.getElementById('fktAddItem').onclick = (e) => {
    e.preventDefault();
    row.items.push(fktBuildEmptyItem());
    rerenderFktItemsTable(row);
  };

  document.querySelectorAll('input[name="fktPpnMode"]').forEach(r => r.onchange = (e) => {
    row.tipePpn = e.target.value;
    fktTogglePpnSubfields(row.tipePpn);
    fktRecalcTotals(row);
    fktRefreshTotalsDOM(row);
  });
  document.querySelectorAll('input[name="fktUangMukaTipe"]').forEach(r => r.onchange = (e) => { row.uangMukaTipe = e.target.value; });

  ['fFktDiskon1','fFktDiskon2','fFktOngkosAngkut','fFktUangMukaPakai'].forEach(id => {
    document.getElementById(id).onchange = (e) => {
      const key = { fFktDiskon1:'diskon1', fFktDiskon2:'diskon2', fFktOngkosAngkut:'ongkosAngkut', fFktUangMukaPakai:'uangMukaPakai' }[id];
      row[key] = +e.target.value || 0;
      fktRecalcTotals(row);
      fktRefreshTotalsDOM(row);
    };
  });
  // Kurs Pajak/Tgl. Faktur Pajak/Kode Pajak — dekoratif (tidak
  // memengaruhi kalkulasi PPN, sama seperti Kurs di Purchase Order),
  // cuma disimpan ke `row` supaya tidak hilang saat Simpan.
  document.getElementById('fFktKursPajak').onchange = (e) => { row.kursPajak = +e.target.value || 0; };
  document.getElementById('fFktTglFakturPajak').onchange = (e) => { row.tglFakturPajak = e.target.value; };
  document.getElementById('fFktKodePajak').onchange = (e) => { row.kodePajak = e.target.value; };

  document.getElementById('fktPphSearch').onclick = () => openFktPphPicker(row);
  document.getElementById('fktPphClear').onclick = () => {
    row.pphAktif = false; row.pphKode = ''; row.pphPersen = 0;
    document.getElementById('fFktPphKode').value = '';
    fktRecalcTotals(row);
    fktRefreshTotalsDOM(row);
  };

  document.getElementById('fktBatalkan').onclick = (e) => { e.preventDefault(); renderFktList(); };
  if(isEdit){
    document.getElementById('fktPerbaharuiKurs').onclick = () => openFktInfo('Perbaharui Kurs', 'Mata Uang Faktur ini IDR, Kurs selalu 1. Pembaruan kurs otomatis berlaku untuk Faktur dengan mata uang asing (USD, dst).');
    document.getElementById('fktCetak').onclick = () => openFktInfo('Cetak Faktur Penjualan Via S.J.', `Preview PDF Faktur <b>${row.no}</b> akan tersedia di sini.`);
  }

  document.getElementById('fktSimpan').onclick = () => {
    const validItems = row.items.filter(it => it.kode && (+it.qtyPhysical) > 0);
    if(!validItems.length){ fktValidationError('Minimal 1 baris barang dengan Kode Barang dan Qty Physical lebih dari 0'); return; }
    row.items = validItems;

    row.tglFaktur = document.getElementById('fFktTglFaktur').value;
    row.syaratBayar = document.getElementById('fFktSyaratBayar').value;
    row.tglJatuhTempo = document.getElementById('fFktTglJthTempo').value;
    row.jurnal = document.getElementById('fFktJurnal').value;
    row.salesman = document.getElementById('fFktSalesman').value;
    row.poCustomer = document.getElementById('fFktPoCustomer').value;
    row.driver = document.getElementById('fFktDriver').value;
    row.kernet = document.getElementById('fFktKernet').value;
    row.alamatPengirimanTipe = document.getElementById('fFktAlamatTipe').value;
    row.alamatPengiriman = document.getElementById('fFktAlamatPengiriman').value;
    row.tglBatasRetur = document.getElementById('fFktTglBatasRetur').value;
    row.tipeLayanan = document.getElementById('fFktTipeLayanan').value;
    row.keterangan = document.getElementById('fFktKeterangan').value;
    row.diskon1 = +document.getElementById('fFktDiskon1').value || 0;
    row.diskon2 = +document.getElementById('fFktDiskon2').value || 0;
    row.ongkosAngkut = +document.getElementById('fFktOngkosAngkut').value || 0;
    row.uangMukaPakai = +document.getElementById('fFktUangMukaPakai').value || 0;
    row.kursPajak = +document.getElementById('fFktKursPajak').value || 0;
    row.tglFakturPajak = document.getElementById('fFktTglFakturPajak').value;
    row.kodePajak = document.getElementById('fFktKodePajak').value;
    row.tipeTransaksi = (row.syaratBayar === 'CBD') ? 'Penjualan Tunai' : 'Penjualan Kredit';
    if(isAdd) row.cabang = document.getElementById('fFktCabang').value;

    fktRecalcTotals(row);

    if(isAdd){
      row.no = fktGenerateNumber(row.cabang);
      row.tglInput = row.tglFaktur + ' ' + new Date().toTimeString().slice(0,5);
      row.userInput = 'sidik';
      DATA.fakturPenjualanSJ.push(row);
    } else {
      row.tglEdit = row.tglFaktur + ' ' + new Date().toTimeString().slice(0,5);
      row.userEdit = 'sidik';
      DATA.fakturPenjualanSJ[idx] = row;
    }
    renderFktList();
  };
}

/* ===== Tab switcher "Rincian Transaksi" / "Rincian Jurnal Akun" —
   reuse class .inv-tabs/.inv-tab-btn dari Invoice verbatim, logic
   toggle identik wireInvTabs(). ===== */
function wireFktTabs(){
  const btnTransaksi = document.getElementById('fktTabTransaksiBtn');
  const btnJurnal = document.getElementById('fktTabJurnalBtn');
  const contentTransaksi = document.getElementById('fktTabTransaksiContent');
  const contentJurnal = document.getElementById('fktTabJurnalContent');
  btnTransaksi.onclick = () => {
    btnTransaksi.classList.add('active'); btnJurnal.classList.remove('active');
    contentTransaksi.style.display = ''; contentJurnal.style.display = 'none';
  };
  btnJurnal.onclick = () => {
    btnJurnal.classList.add('active'); btnTransaksi.classList.remove('active');
    contentJurnal.style.display = ''; contentTransaksi.style.display = 'none';
  };
}

function wireFktItemEvents(row){
  row.items.forEach((item, idx) => {
    const ppnCb = document.querySelector(`[data-fkt-ppn="${idx}"]`);
    const searchBtn = document.querySelector(`[data-fkt-item-search="${idx}"]`);
    const delBtn = document.querySelector(`[data-fkt-item-del="${idx}"]`);
    const keteranganEl = document.querySelector(`[data-fkt-keterangan="${idx}"]`);
    const qtyEl = document.querySelector(`[data-fkt-qty="${idx}"]`);
    const discpEl = document.querySelector(`[data-fkt-discp="${idx}"]`);
    const discdEl = document.querySelector(`[data-fkt-discd="${idx}"]`);

    if(ppnCb) ppnCb.onchange = () => { item.ppnChecked = ppnCb.checked; };
    if(searchBtn) searchBtn.onclick = () => openFktItemPicker(idx, row);
    if(delBtn) delBtn.onclick = () => {
      if(row.items.length <= 1){ fktValidationError('Minimal harus ada 1 baris barang'); return; }
      row.items.splice(idx, 1);
      rerenderFktItemsTable(row);
    };
    if(keteranganEl) keteranganEl.onchange = () => { item.keterangan = keteranganEl.value; };
    [qtyEl, discpEl, discdEl].forEach(el => {
      if(!el) return;
      el.onchange = () => {
        item.qtyPhysical = qtyEl ? (+qtyEl.value || 0) : item.qtyPhysical;
        item.discPrincipal = discpEl ? (+discpEl.value || 0) : item.discPrincipal;
        item.discDistributor = discdEl ? (+discdEl.value || 0) : item.discDistributor;
        fktRecalcItem(item);
        fktRefreshItemRowDOM(idx, item);
        fktRecalcTotals(row);
        fktRefreshTotalsDOM(row);
      };
    });
  });
}

function rerenderFktItemsTable(row){
  document.getElementById('fktItemsBody').innerHTML = row.items.map((it,idx) => tplFktItemRow(it,idx,'')).join('');
  wireFktItemEvents(row);
  const hint = document.getElementById('fktItemsEmptyHint');
  if(hint) hint.style.display = row.items.length ? 'none' : '';
  fktRecalcTotals(row);
  fktRefreshTotalsDOM(row);
}

function fktValidationError(text){
  openFktInfo('Validasi', text);
}

/* Sinkronkan seluruh input form yang berubah gara-gara picker "Dari
   Sales Order"/"Dari S.J." (dipanggil dari handler "Pilih" picker,
   SETELAH fktApplyInvoice() dipanggil) — pola sama seperti
   invSyncFormAfterPick() di Invoice. Kalau Cabang ikut berubah (mode
   Tambah, field Cabang belum disabled) DAN cabang hasil pick beda
   dari yang sedang tampil, No. Faktur ikut di-generate ULANG supaya
   kode cabang di nomor dokumen selalu konsisten dengan Cabang yang
   benar-benar terpakai. */
function fktSyncFormAfterPick(row, isAdd){
  document.getElementById('fFktDariSO').value = row.dariSO || '';
  document.getElementById('fFktDariSJ').value = row.dariSJ || '';
  document.getElementById('fFktAlamatPreview').textContent = row.customerAlamat || '';
  document.getElementById('fFktNoDSC').value = row.noDSC || '';
  document.getElementById('fFktPrincipal').value = row.principalNama || '';
  document.getElementById('fFktNoSP').value = row.noSP || '';
  document.getElementById('fFktTglSP').value = row.tglSP || '';
  document.getElementById('fFktSyaratBayar').value = row.syaratBayar;
  document.getElementById('fFktTipeLayanan').value = row.tipeLayanan;
  document.getElementById('fFktAlamatPengiriman').value = row.alamatPengiriman || '';
  document.getElementById('fFktDriver').value = row.driver || '';

  row.tglFaktur = document.getElementById('fFktTglFaktur').value;
  row.tglJatuhTempo = fktJatuhTempo(row.tglFaktur, row.syaratBayar);
  document.getElementById('fFktTglJthTempo').value = row.tglJatuhTempo;

  const cabangEl = document.getElementById('fFktCabang');
  if(isAdd && cabangEl && row.cabang && cabangEl.value !== row.cabang){
    cabangEl.value = row.cabang;
    row.no = fktGenerateNumber(row.cabang);
    document.getElementById('fFktNoFaktur').value = row.no;
  }

  rerenderFktItemsTable(row);
}

/* Picker "Dari Sales Order" / "Dari S.J." — DUA-DUANYA atas
   DATA.invoices, keduanya bermuara ke fktApplyInvoice() (lihat
   komentar header file ini). */
function openFktInvoicePicker(row, isAdd, title){
  closeModal();
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.innerHTML = tplFktInvoicePicker(DATA.invoices, title);
  document.body.appendChild(overlay);
  document.getElementById('modalClose').onclick = closeModal;
  document.getElementById('modalCancel').onclick = closeModal;
  overlay.onclick = (e) => { if(e.target === overlay) closeModal(); };
  overlay.querySelectorAll('[data-pick-inv]').forEach(btn => btn.onclick = () => {
    const invRow = DATA.invoices.find(i => i.no === btn.dataset.pickInv);
    if(!invRow) return;
    fktApplyInvoice(row, invRow);
    fktSyncFormAfterPick(row, isAdd);
    closeModal();
  });
}

function openFktSalesmanPicker(row){
  closeModal();
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.innerHTML = tplFktSalesmanPicker(DATA.salesman);
  document.body.appendChild(overlay);
  document.getElementById('modalClose').onclick = closeModal;
  document.getElementById('modalCancel').onclick = closeModal;
  overlay.onclick = (e) => { if(e.target === overlay) closeModal(); };
  overlay.querySelectorAll('[data-pick-salesman]').forEach(btn => btn.onclick = () => {
    row.salesman = btn.dataset.pickSalesman;
    document.getElementById('fFktSalesman').value = row.salesman;
    closeModal();
  });
}

function openFktDriverPicker(row){
  closeModal();
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.innerHTML = tplFktDriverPicker(DATA.driverList);
  document.body.appendChild(overlay);
  document.getElementById('modalClose').onclick = closeModal;
  document.getElementById('modalCancel').onclick = closeModal;
  overlay.onclick = (e) => { if(e.target === overlay) closeModal(); };
  overlay.querySelectorAll('[data-pick-driver]').forEach(btn => btn.onclick = () => {
    row.driver = btn.dataset.pickDriver;
    document.getElementById('fFktDriver').value = row.driver;
    closeModal();
  });
}

function openFktKernetPicker(row){
  closeModal();
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.innerHTML = tplFktKernetPicker(DATA.kernetList);
  document.body.appendChild(overlay);
  document.getElementById('modalClose').onclick = closeModal;
  document.getElementById('modalCancel').onclick = closeModal;
  overlay.onclick = (e) => { if(e.target === overlay) closeModal(); };
  overlay.querySelectorAll('[data-pick-kernet]').forEach(btn => btn.onclick = () => {
    row.kernet = btn.dataset.pickKernet;
    document.getElementById('fFktKernet').value = row.kernet;
    closeModal();
  });
}

function openFktItemPicker(idx, row){
  // Popup "Daftar Persediaan" bersama (openPersediaanPicker, di js/core.js)
  // menggantikan tplFktItemPicker lama sejak 2026-08-12 lanjutan lagi —
  // filter otomatis ke Gudang Utama milik row.cabang Faktur ini.
  openPersediaanPicker(row.cabang, (persed) => {
    const it = DATA.items.find(x => x.kode === persed.kodeBarang);
    const target = row.items[idx];
    target.kode = persed.kodeBarang; target.nama = persed.namaBarang; target.um = persed.satuan;
    target.hna = it ? it.harga : 0; target.hna1 = it ? it.harga : 0;
    fktRecalcItem(target);
    rerenderFktItemsTable(row);
  });
}

function openFktPphPicker(row){
  closeModal();
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.innerHTML = tplFktPphPicker(FKT_PPH_LIST);
  document.body.appendChild(overlay);
  document.getElementById('modalClose').onclick = closeModal;
  document.getElementById('modalCancel').onclick = closeModal;
  overlay.onclick = (e) => { if(e.target === overlay) closeModal(); };
  overlay.querySelectorAll('[data-pick-pph]').forEach(btn => btn.onclick = () => {
    row.pphAktif = true;
    row.pphKode = btn.dataset.pickPph;
    row.pphPersen = +btn.dataset.pickPersen;
    document.getElementById('fFktPphKode').value = row.pphKode;
    fktRecalcTotals(row);
    fktRefreshTotalsDOM(row);
    closeModal();
  });
}

function openFktDeleteConfirm(idx){
  closeModal();
  const row = DATA.fakturPenjualanSJ[idx];
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.innerHTML = tplFktDeleteConfirm(row);
  document.body.appendChild(overlay);
  document.getElementById('modalClose').onclick = closeModal;
  document.getElementById('modalCancel').onclick = closeModal;
  overlay.onclick = (e) => { if(e.target === overlay) closeModal(); };
  document.getElementById('modalDelete').onclick = () => {
    DATA.fakturPenjualanSJ.splice(idx, 1);
    closeModal();
    renderFktTable();
  };
}

function openFktInfo(title, text){
  closeModal();
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.innerHTML = tplFktInfoModal(title, text);
  document.body.appendChild(overlay);
  document.getElementById('modalClose').onclick = closeModal;
  document.getElementById('modalOk').onclick = closeModal;
  overlay.onclick = (e) => { if(e.target === overlay) closeModal(); };
}
