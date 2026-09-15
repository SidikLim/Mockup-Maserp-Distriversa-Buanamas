/* =========================================================
   LOGIC (JS saja) — Penjualan Langsung (Customer & Penjualan >
   Daftar Transaksi). Dimuat otomatis (lazy-load) oleh core.js saat
   menu ini pertama kali diklik — lihat PAGE_MODULES di js/core.js.
   Markup HTML-nya ada di file sebelah: penjualan-langsung.template.js
   (catatan desain lengkap + semua keputusan substitusi data ada di
   headernya & di atas DATA.penjualanLangsung, js/data.js). NB:
   closeModal() dipakai bersama (core.js).

   Alur inti (mirror-sisi-Penjualan dari pembelian-langsung.js):
   - Dokumen BERDIRI SENDIRI (tidak di-chain dari S.O./Picking
     List/Invoice) — Faktur & Surat Jalan dibuat langsung 1 dokumen
     (Surat Jalan otomatis ikut No. Faktur, lihat pjlOnRefreshNo()).
   - Aritmetika per baris ITEM (persis fktRecalcItem, HNA1 sbg basis
     — checkbox "Inklusif" murni flag tampilan, TIDAK mengubah
     hitungan, lihat catatan di template): Total Disc% = Disc
     Principal% + Disc Distributor%; Disc/Barang1 = HNA1 x
     TotalDisc%; Jumlah = (HNA1 - Disc/Barang1) x Qty.
   - Total dokumen (persis fktRecalcTotals TAPI SENGAJA TANPA
     Math.round — lihat catatan presisi desimal di atas
     DATA.penjualanLangsung): subtotal -> Diskon1%/Diskon2%
     berjenjang -> DPP -> PPN 11% (hanya jika Eksklusif; Inklusif
     cuma set kode pajak, tanpa nominal PPN tambahan, sama seperti
     Faktur Penjualan Via S.J.) -> dikurangi PPh Dipotong -> +
     Ongkos Angkut = Jumlah (Akhir); Sisa Jumlah = Jumlah - Uang
     Muka Dipakai - Pembayaran.
   - Sisa U.Muka otomatis dari total Uang Muka Customer
     (DATA.uangMukaCustomer) milik customer terpilih; "Pakai"
     divalidasi <= sisa (pola sama plSisaUangMuka Pembelian
     Langsung, sisi Customer).
   - Jurnal Otomatis (radio): Buat Jurnal -> D Piutang Usaha (net
     stlh PPh) + D PPh Dibayar Dimuka (bila ada) lawan K Penjualan
     Barang Dagang (4110001) + K PPN Keluaran (bila ada) — SENGAJA
     TIDAK melibatkan Uang Muka Dipakai (persis simplifikasi yg
     sama di plBuildJurnal Pembelian Langsung, yg jg tidak
     melibatkan Uang Muka Supplier di jurnal otomatisnya). Jurnal
     Manual: baris editable + Tambah; Simpan menolak jurnal tidak
     balance.
   - Tipe Transaksi list = "Penjualan Kredit"/"Penjualan Tunai" dari
     Syarat Bayar; Hapus di list NONAKTIF bila Pembayaran > 0.
   - Cetak -> preview faktur kop DBM; Perbaharui Kurs -> modal info
     (mockup); Refresh DPL & Auto Fill Quantity SI -> modal info
     (DEKORATIF, dokumen berdiri sendiri tanpa DPL/S.O. sumber —
     lihat catatan di template); Attach & Kwitansi (kolom list) ->
     modal info (DEKORATIF, pola sama "Upload File" dekoratif di
     sales-quotation.js); tombol + Multi Batch -> modal input batch;
     Duplikat (header form) -> menggandakan dokumen jadi draft baru
     ("add" dgn No. Faktur baru, dari mode manapun). Data:
     DATA.penjualanLangsung. */

var pjlState = { bulan:'07|2026', search:'' };

function renderPenjualanLangsungPage(){
  pjlState = { bulan:'07|2026', search:'' };
  renderPjlList();
}

function renderPjlList(){
  content.innerHTML = tplPenjualanLangsungListPage(pjlState.bulan);
  document.getElementById('btnPjlAdd').onclick = () => openPjlForm('add', null);
  document.getElementById('pjlFilterBulan').onchange = (e) => { pjlState.bulan = e.target.value; renderPjlTable(); };
  document.getElementById('pjlSearch').oninput = (e) => { pjlState.search = e.target.value; renderPjlTable(); };
  renderPjlTable();
}

function pjlFilteredRows(){
  const q = pjlState.search.trim().toLowerCase();
  const parts = pjlState.bulan.split('|');
  const mm = parts[0], yy = parts[1];
  return (DATA.penjualanLangsung || []).filter(r => {
    if(mm && !(r.tglFaktur||'').includes('/' + mm + '/' + yy)) return false;
    if(q && !(
      r.no.toLowerCase().includes(q) ||
      (r.customerNama||'').toLowerCase().includes(q) ||
      pjlTipeTransaksi(r).toLowerCase().includes(q) ||
      (r.poCustomer||'').toLowerCase().includes(q) ||
      (r.keterangan||'').toLowerCase().includes(q))) return false;
    return true;
  });
}

function renderPjlTable(){
  const rows = pjlFilteredRows();
  const tbody = document.getElementById('pjlTbody');
  tbody.innerHTML = tplPjlRows(rows);
  document.getElementById('pjlTotal').textContent = `Total Record: ${rows.length}`;
  const idxOf = (r) => DATA.penjualanLangsung.indexOf(r);
  tbody.querySelectorAll('[data-view-link]').forEach(b => b.onclick = () => openPjlForm('view', idxOf(rows[+b.dataset.viewLink])));
  tbody.querySelectorAll('[data-pjl-edit]').forEach(b => b.onclick = () => openPjlForm('edit', idxOf(rows[+b.dataset.pjlEdit])));
  tbody.querySelectorAll('[data-pjl-del]').forEach(b => {
    if(b.disabled) return;
    b.onclick = () => openPjlDelete(idxOf(rows[+b.dataset.pjlDel]));
  });
  tbody.querySelectorAll('[data-pjl-attach]').forEach(b => b.onclick = () => openPjlInfo('Attach', 'Fitur upload lampiran file Penjualan Langsung akan tersedia di sini pada versi lengkap.'));
  tbody.querySelectorAll('[data-pjl-kwitansi]').forEach(b => b.onclick = () => openPjlInfo('Kwitansi', 'Cetak Kwitansi terpisah dari dokumen ini akan tersedia pada versi lengkap.'));
  tbody.querySelectorAll('[data-pjl-cetak]').forEach(b => b.onclick = () => openPjlPrint(DATA.penjualanLangsung[idxOf(rows[+b.dataset.pjlCetak])]));
}

/* Nomor otomatis per cabang: 26/DSI/{kode}/07/{urut}. */
function pjlGenerateNo(cabang){
  const kode = PJL_CABANG_CODE[cabang] || 'HO';
  const prefix = `26/DSI/${kode}/07/`;
  let max = 0;
  (DATA.penjualanLangsung || []).forEach(r => {
    if(r.no && r.no.startsWith(prefix)){
      const n = parseInt(r.no.slice(prefix.length), 10);
      if(!isNaN(n) && n > max) max = n;
    }
  });
  return prefix + String(max + 1).padStart(5, '0');
}

function pjlAkunNama(kode){ const a = DATA.akunGL.find(x => x.kode === kode); return a ? a.nama : ''; }

/* Sisa uang muka customer terpilih (total Uang Muka Customer). */
function pjlSisaUangMuka(customerNama){
  if(!customerNama) return 0;
  return (DATA.uangMukaCustomer || [])
    .filter(u => (u.customer||'').toLowerCase() === customerNama.toLowerCase())
    .reduce((a,u) => a + Number(u.jumlahTotal||0), 0);
}

function pjlJurnalTotals(row){
  let d = 0, k = 0;
  (row.jurnalAkun || []).forEach(e => { d += Number(e.debit || 0); k += Number(e.kredit || 0); });
  return { debit: d, kredit: k, selisih: d - k };
}

/* ===== Aritmetika (SENGAJA TANPA Math.round — lihat catatan
   presisi desimal di atas DATA.penjualanLangsung). ===== */
function pjlRecalcItem(it){
  it.totalDisc = Number(it.discPrincipal||0) + Number(it.discDistributor||0);
  it.discBarang = Number(it.hna1||0) * it.totalDisc / 100;
  it.jumlah = (Number(it.hna1||0) - it.discBarang) * Number(it.qty||0);
}

function pjlRecalc(row){
  (row.items || []).forEach(pjlRecalcItem);
  const subtotal = (row.items || []).reduce((a,it) => a + Number(it.jumlah||0), 0);
  const d1 = Number(row.diskon1||0);
  row.diskon1Amount = subtotal * d1 / 100;
  const sisaSetelahD1 = subtotal - row.diskon1Amount;
  const d2 = Number(row.diskon2||0);
  row.diskon2Amount = sisaSetelahD1 * d2 / 100;
  row.dpp = sisaSetelahD1 - row.diskon2Amount;
  row.pajak11 = (row.tipePpn === 'PPN Inklusif' || row.tipePpn === 'PPN Eksklusif(+11%)') ? 'PPN11' : '';
  row.ppn = (row.tipePpn === 'PPN Eksklusif(+11%)') ? (row.dpp * 0.11) : 0;
  row.pphAmount = row.pphKode ? (row.dpp * Number(row.pphPersen||0) / 100) : 0;
  row.jumlahAkhir = row.dpp + row.ppn - row.pphAmount + Number(row.ongkosAngkut||0);
  row.sisaUangMuka = pjlSisaUangMuka(row.customerNama);
  if(Number(row.uangMukaPakai||0) > row.sisaUangMuka) row.uangMukaPakai = row.sisaUangMuka;
  row.sisaJumlah = row.jumlahAkhir - Number(row.uangMukaPakai||0) - Number(row.pembayaran||0);

  const set = (id, v) => { const el = document.getElementById(id); if(el) el.value = v; };
  set('fPjlDiskon1Amount', pjlNum2(row.diskon1Amount));
  set('fPjlDiskon2Amount', pjlNum2(row.diskon2Amount));
  set('fPjlDpp', pjlNum2(row.dpp));
  set('fPjlPajakKode', row.pajak11);
  set('fPjlPpnAmount', pjlNum2(row.ppn));
  set('fPjlPphAmount', pjlNum2(row.pphAmount));
  set('fPjlSisaUm', pjlNum2(row.sisaUangMuka));
  set('fPjlJumlah', pjlNum2(row.jumlahAkhir));
  set('fPjlSisaJumlah', pjlNum2(row.sisaJumlah));
  const lbl = document.getElementById('pjlPajakPersenLabel');
  if(lbl) lbl.textContent = (row.tipePpn==='PPN Inklusif'||row.tipePpn==='PPN Eksklusif(+11%)') ? '11' : '0';
  const plbl = document.getElementById('pjlPphPersenLabel');
  if(plbl) plbl.textContent = row.pphKode ? row.pphPersen : 0;
  const subEl = document.getElementById('pjlPpnSubfields');
  if(subEl) subEl.style.display = (row.tipePpn === 'PPN Inklusif' || row.tipePpn === 'PPN Eksklusif(+11%)') ? '' : 'none';
  // Refresh kolom hitung baris barang tanpa render ulang (fokus aman)
  (row.items || []).forEach((it, idx) => {
    const g = (sel) => document.querySelector(`[data-pjl-${sel}="${idx}"]`);
    const t = g('totaldisc'); if(t) t.value = it.totalDisc;
    const dsc = g('discbarang'); if(dsc) dsc.value = pjlNum2(it.discBarang);
    const j = g('jumlah'); if(j) j.value = pjlNum2(it.jumlah);
  });
}

/* Jurnal otomatis — lihat catatan skema di header file ini. */
function pjlBuildJurnal(row){
  const ket = row.keterangan || row.no;
  const j = (DATA.jurnalPenjualan && DATA.jurnalPenjualan[0]) || {};
  const akunPiutang = j.akunPiutang || '1120001';
  const akunPPN = j.akunPPN || '2120002';
  const akunPphAsset = j.akunARSSPPPH || '1120004';
  const akunPenjualan = '4110001';
  const list = [
    { kodeAkun: akunPiutang, namaAkun: pjlAkunNama(akunPiutang), keterangan: ket, debit: row.dpp + row.ppn - row.pphAmount + Number(row.ongkosAngkut||0), kredit: 0 },
  ];
  if(row.pphAmount > 0.004){
    list.push({ kodeAkun: akunPphAsset, namaAkun: pjlAkunNama(akunPphAsset), keterangan: `PPh dipotong ${row.pphKode}`, debit: row.pphAmount, kredit: 0 });
  }
  list.push({ kodeAkun: akunPenjualan, namaAkun: pjlAkunNama(akunPenjualan), keterangan: ket, debit: 0, kredit: row.dpp + Number(row.ongkosAngkut||0) });
  if(row.ppn > 0.004){
    list.push({ kodeAkun: akunPPN, namaAkun: pjlAkunNama(akunPPN), keterangan: ket, debit: 0, kredit: row.ppn });
  }
  return list;
}

/* =====================================================================
   FORM add / edit / view
===================================================================== */
function pjlEmptyRow(){
  return {
    no: pjlGenerateNo('Head Office'), scannerType:'Barcode', cabang:'Head Office', proyek:'',
    salesOffice: (DATA.salesOffice[0]||{}).kode || '', area:'',
    customerKode:'', customerNama:'', orderPenggantiRetur:false, tipeLayanan:'',
    principalKode:'', principalNama:'',
    tglFaktur:'31/07/2026', tglJatuhTempo:'28/09/2026', syaratBayar:'Kredit 60 Hari',
    gudang:'Non Stock Head Office', salesman:'OFFICE', jurnal:'JURNAL PENJUALAN KREDIT (IDR)',
    poCustomer:'', tglBatasRetur:'', driver:'', kernet:'', pickUpType:'',
    alamatPengirimanTipe:'Alamat Customer', alamatPengiriman:'',
    specialDiscGlobal:'-Special Disc-',
    items: [{ kode:'', nama:'', pphChecked:false, ppnChecked:false, specialDisc:'-Special Disc-', batch:'0', qty:1, um:'UNIT', hna:0, hna1:0, hna1Inklusif:false, discPrincipal:0, discDistributor:0, totalDisc:0, discBarang:0, jumlah:0 }],
    tipePpn:'Tidak ada PPN', mataUangPajak:'Rupiah (IDR)', kursPajak:1,
    tglFakturPajak:'31/07/2026', kodePajak: DATA.kodePajakList[1] || '', noFakturPajak:'',
    diskon1:0, diskon1Amount:0, diskon2:0, diskon2Amount:0, kurs:1,
    dpp:0, pajak11:'', ppn:0, uangMukaTipe:'Tertua', sisaUangMuka:0, uangMukaPakai:0,
    pphKode:'', pphPersen:0, pphAmount:0, ongkosAngkut:0, jumlahAkhir:0, sisaJumlah:0,
    suratJalan:'', keterangan:'', tipeTransaksi:'Penjualan Kredit', pembayaran:0,
    jurnalMode:'otomatis', jurnalAkun:[], userInput:'sidik',
  };
}

function openPjlForm(mode, idx, presetRow){
  const src = idx != null ? DATA.penjualanLangsung[idx] : null;
  const row = presetRow || (src ? JSON.parse(JSON.stringify(src)) : pjlEmptyRow());
  const isView = mode === 'view';
  content.innerHTML = tplPjlForm(mode, row);

  const back = () => renderPjlList();
  document.getElementById('pjlBatalkan').onclick = (e) => { e.preventDefault(); back(); };
  document.getElementById('btnPjlTutorial').onclick = () => openPjlInfo('Tutorial', 'Video tutorial Penjualan Langsung tersedia di portal MASERP (mockup).');
  const dupBtn = document.getElementById('btnPjlDuplikat');
  if(dupBtn) dupBtn.onclick = () => {
    const dup = JSON.parse(JSON.stringify(row));
    dup.no = pjlGenerateNo(dup.cabang || 'Head Office');
    dup.suratJalan = dup.no;
    dup.pembayaran = 0;
    openPjlForm('add', null, dup);
  };

  // Tabs
  const tabR = document.getElementById('pjlTabRincianBtn');
  const tabJ = document.getElementById('pjlTabJurnalBtn');
  const contR = document.getElementById('pjlTabRincianContent');
  const contJ = document.getElementById('pjlTabJurnalContent');
  tabR.onclick = () => { tabR.classList.add('active'); tabJ.classList.remove('active'); contR.style.display = ''; contJ.style.display = 'none'; };
  tabJ.onclick = () => { tabJ.classList.add('active'); tabR.classList.remove('active'); contJ.style.display = ''; contR.style.display = 'none'; };

  wirePjlItems(row, isView);
  wirePjlJurnalTab(row, isView);
  wirePjlBottomPanel(row, isView);
  if(isView) return;

  const refreshNoBtn = document.getElementById('pjlRefreshNo');
  if(refreshNoBtn) refreshNoBtn.onclick = () => {
    row.no = pjlGenerateNo(row.cabang);
    row.suratJalan = row.no;
    document.getElementById('fPjlNo').value = row.no;
    document.getElementById('fPjlSuratJalan').value = row.suratJalan;
  };

  document.getElementById('fPjlScanner').onchange = (e) => { row.scannerType = e.target.value; };
  document.getElementById('fPjlCabang').onchange = (e) => {
    row.cabang = e.target.value;
    row.gudang = 'Non Stock ' + row.cabang;
    document.getElementById('fPjlGudang').innerHTML = pjlGudangOptions(row.cabang, row.gudang);
    if(mode === 'add'){
      row.no = pjlGenerateNo(row.cabang);
      row.suratJalan = row.no;
      document.getElementById('fPjlNo').value = row.no;
      document.getElementById('fPjlSuratJalan').value = row.suratJalan;
    }
  };
  document.getElementById('fPjlProyek').oninput = (e) => { row.proyek = e.target.value; };

  document.getElementById('pjlCustomerSearch').onclick = () => openPjlCustomerPicker((c) => {
    row.customerKode = c.kode;
    row.customerNama = c.nama;
    document.getElementById('fPjlCustomer').value = c.nama.toUpperCase();
    document.getElementById('pjlCreditInfo').innerHTML = pjlCreditInfoHTML(c.kode);
    if(row.alamatPengirimanTipe !== 'Alamat Lain'){
      row.alamatPengiriman = c.alamat || '';
      document.getElementById('fPjlAlamat').value = row.alamatPengiriman;
    }
    pjlRecalc(row); // refresh Sisa U.Muka customer tsb
  });

  document.getElementById('fPjlOrderPengganti').onchange = (e) => { row.orderPenggantiRetur = e.target.checked; };
  document.getElementById('fPjlTipeLayanan').onchange = (e) => { row.tipeLayanan = e.target.value; };

  document.getElementById('pjlPrincipalSearch').onclick = () => openPjlPrincipalPicker((s) => {
    row.principalKode = s.kode;
    row.principalNama = s.nama;
    document.getElementById('fPjlPrincipal').value = s.nama.toUpperCase();
  });

  document.getElementById('fPjlSalesOffice').onchange = (e) => {
    row.salesOffice = e.target.value;
    row.area = '';
    document.getElementById('fPjlArea').innerHTML = pjlAreaOptions(row.salesOffice, '');
  };
  document.getElementById('fPjlArea').onchange = (e) => { row.area = e.target.value; };

  document.getElementById('fPjlTglFaktur').oninput = (e) => { row.tglFaktur = e.target.value.trim(); };
  document.getElementById('fPjlTglJthTempo').oninput = (e) => { row.tglJatuhTempo = e.target.value.trim(); };
  document.getElementById('fPjlSyaratBayar').onchange = (e) => { row.syaratBayar = e.target.value; };
  document.getElementById('fPjlGudang').onchange = (e) => { row.gudang = e.target.value; };
  document.getElementById('fPjlSalesman').onchange = (e) => { row.salesman = e.target.value; };
  document.getElementById('fPjlJurnal').onchange = (e) => { row.jurnal = e.target.value; };
  document.getElementById('fPjlPoCustomer').oninput = (e) => { row.poCustomer = e.target.value; };
  document.getElementById('fPjlTglBatasRetur').oninput = (e) => { row.tglBatasRetur = e.target.value; };
  document.getElementById('fPjlDriver').onchange = (e) => { row.driver = e.target.value; };
  document.getElementById('fPjlKernet').onchange = (e) => { row.kernet = e.target.value; };
  document.getElementById('fPjlPickUpType').oninput = (e) => { row.pickUpType = e.target.value; };
  document.getElementById('fPjlAlamatTipe').onchange = (e) => {
    row.alamatPengirimanTipe = e.target.value;
    if(e.target.value === 'Alamat Customer'){
      const c = pjlCustomer(row.customerKode);
      row.alamatPengiriman = c ? (c.alamat||'') : '';
      document.getElementById('fPjlAlamat').value = row.alamatPengiriman;
    }
  };
  document.getElementById('fPjlAlamat').oninput = (e) => { row.alamatPengiriman = e.target.value; };

  document.getElementById('fPjlSpecialDiscGlobal').onchange = (e) => { row.specialDiscGlobal = e.target.value; };
  document.getElementById('pjlColumnsBtn').onclick = () => openPjlInfo('Pilih Kolom', 'Pengaturan kolom tabel Rincian Transaksi yang ditampilkan/disembunyikan akan tersedia pada versi lengkap.');
  document.getElementById('pjlRefreshDpl').onclick = () => openPjlInfo('Refresh DPL', 'Menyinkronkan ulang Daftar Price List (HNA/HNA1 terbaru) dari master barang akan tersedia pada versi lengkap.');
  document.getElementById('pjlAutoFillQty').onclick = () => openPjlInfo('Auto Fill Quantity SI', 'Dokumen Penjualan Langsung berdiri sendiri (tanpa Sales Order/DPL asal) sehingga tidak ada sumber Qty untuk diisi otomatis pada mockup ini.');

  document.getElementById('pjlAddItem').onclick = (e) => {
    e.preventDefault();
    pjlReadItems(row);
    row.items.push({ kode:'', nama:'', pphChecked:false, ppnChecked:false, specialDisc:'-Special Disc-', batch:'0', qty:1, um:'UNIT', hna:0, hna1:0, hna1Inklusif:false, discPrincipal:0, discDistributor:0, totalDisc:0, discBarang:0, jumlah:0 });
    wirePjlItems(row, isView);
    pjlRecalc(row);
  };

  document.getElementById('pjlPerbaharuiKurs').onclick = () => openPjlInfo('Perbaharui Kurs', 'Kurs IDR = 1,00 (mata uang lokal, tidak perlu diperbaharui).');
  document.getElementById('pjlCetak').onclick = () => { pjlReadForm(row); pjlRecalc(row); openPjlPrint(row); };
  document.getElementById('pjlSimpan').onclick = () => { if(pjlSave(mode, idx, row)) back(); };
}

/* Baca nilai baris barang dari DOM ke state. */
function pjlReadItems(row){
  row.items.forEach((it, idx) => {
    const g = (sel) => document.querySelector(`[data-pjl-${sel}="${idx}"]`);
    const kode = g('kode'); if(kode) it.kode = kode.value;
    const nama = g('nama'); if(nama) it.nama = nama.value;
    const specialDisc = g('specialdisc'); if(specialDisc) it.specialDisc = specialDisc.value;
    const qty = g('qty'); if(qty) it.qty = Number(qty.value) || 0;
    const um = g('um'); if(um) it.um = um.value;
    const hna = g('hna'); if(hna) it.hna = Number(hna.value) || 0;
    const hna1 = g('hna1'); if(hna1) it.hna1 = Number(hna1.value) || 0;
    const hna1Inklusif = g('hna1inklusif'); if(hna1Inklusif) it.hna1Inklusif = hna1Inklusif.checked;
    const dp = g('discprincipal'); if(dp) it.discPrincipal = Number(dp.value) || 0;
    const dd = g('discdistributor'); if(dd) it.discDistributor = Number(dd.value) || 0;
  });
}

function wirePjlItems(row, isView){
  document.getElementById('pjlItemsBody').innerHTML = tplPjlItemRows(row.items, isView);
  if(isView) return;
  const onEdit = () => { pjlReadItems(row); pjlRecalc(row); };
  ['qty','hna','hna1','discprincipal','discdistributor'].forEach(sel => {
    document.querySelectorAll(`[data-pjl-${sel}]`).forEach(inp => inp.oninput = onEdit);
  });
  document.querySelectorAll('[data-pjl-hna1inklusif]').forEach(cb => cb.onchange = onEdit);
  document.querySelectorAll('[data-pjl-kode]').forEach(inp => inp.oninput = () => { row.items[+inp.dataset.pjlKode].kode = inp.value; });
  document.querySelectorAll('[data-pjl-nama]').forEach(inp => inp.oninput = () => { row.items[+inp.dataset.pjlNama].nama = inp.value; });
  document.querySelectorAll('[data-pjl-um]').forEach(sel => sel.onchange = () => { row.items[+sel.dataset.pjlUm].um = sel.value; });
  document.querySelectorAll('[data-pjl-specialdisc]').forEach(sel => sel.onchange = () => { row.items[+sel.dataset.pjlSpecialdisc].specialDisc = sel.value; });
  document.querySelectorAll('[data-pjl-pph]').forEach(cb => cb.onchange = () => { row.items[+cb.dataset.pjlPph].pphChecked = cb.checked; });
  document.querySelectorAll('[data-pjl-ppn]').forEach(cb => cb.onchange = () => { row.items[+cb.dataset.pjlPpn].ppnChecked = cb.checked; });
  document.querySelectorAll('[data-pjl-item-del]').forEach(b => b.onclick = () => {
    pjlReadItems(row);
    row.items.splice(+b.dataset.pjlItemDel, 1);
    wirePjlItems(row, isView);
    pjlRecalc(row);
  });
  document.querySelectorAll('[data-pjl-batch]').forEach(b => b.onclick = () => {
    const i = +b.dataset.pjlBatch;
    pjlReadItems(row);
    openPjlBatch(row.items[i]);
  });
}

/* ----- Panel bawah: PPN, diskon, uang muka, pph, ongkos ----- */
function wirePjlBottomPanel(row, isView){
  if(isView) return;
  document.querySelectorAll('input[name="pjlPpnMode"]').forEach(r => r.onchange = () => { row.tipePpn = r.value; pjlRecalc(row); });
  document.querySelectorAll('input[name="pjlUmTipe"]').forEach(r => r.onchange = () => { row.uangMukaTipe = r.value; });
  document.getElementById('fPjlKursPajak').oninput = (e) => { row.kursPajak = Number(e.target.value) || 1; };
  document.getElementById('fPjlTglFakturPajak').oninput = (e) => { row.tglFakturPajak = e.target.value; };
  document.getElementById('fPjlKodePajak').onchange = (e) => { row.kodePajak = e.target.value; };
  document.getElementById('fPjlNoFakturPajak').oninput = (e) => { row.noFakturPajak = e.target.value; };
  document.getElementById('fPjlKeterangan').oninput = (e) => { row.keterangan = e.target.value; };
  document.getElementById('fPjlDiskon1').oninput = (e) => { row.diskon1 = Number(e.target.value) || 0; pjlRecalc(row); };
  document.getElementById('fPjlDiskon2').oninput = (e) => { row.diskon2 = Number(e.target.value) || 0; pjlRecalc(row); };
  document.getElementById('fPjlUmPakai').oninput = (e) => {
    let v = Number(e.target.value) || 0;
    const sisa = pjlSisaUangMuka(row.customerNama);
    if(v > sisa){ v = sisa; e.target.value = v; }
    row.uangMukaPakai = v;
    pjlRecalc(row);
  };
  document.getElementById('fPjlOngkosAngkut').oninput = (e) => { row.ongkosAngkut = Number(e.target.value) || 0; pjlRecalc(row); };
  document.getElementById('pjlPajakInfo').onclick = () => openPjlInfo('Kode Pajak', 'Kode pajak PPN11 (11%) dipakai otomatis saat mode PPN Inklusif / Eksklusif dipilih di Informasi PPN.');
  document.getElementById('pjlPphSearch').onclick = () => openPjlPphPicker((p) => {
    row.pphKode = p.kode; row.pphPersen = p.persen;
    document.getElementById('fPjlPphKode').value = p.kode;
    pjlRecalc(row);
  });
  document.getElementById('pjlPphClear').onclick = () => {
    row.pphKode = ''; row.pphPersen = 0;
    document.getElementById('fPjlPphKode').value = '';
    pjlRecalc(row);
  };
}

/* ----- Tab Rincian Jurnal Akun ----- */
function wirePjlJurnalTab(row, isView){
  const cont = document.getElementById('pjlTabJurnalContent');
  cont.innerHTML = tplPjlJurnalContent(row, isView);
  if(isView) return;

  const rerender = () => wirePjlJurnalTab(row, isView);
  const refreshSelisih = () => {
    const t = pjlJurnalTotals(row);
    const el = document.getElementById('pjlJurnalSelisih');
    el.value = pjlNum2(t.selisih);
    el.style.color = Math.abs(t.selisih) > 0.004 ? 'var(--red)' : 'var(--text)';
  };

  cont.querySelectorAll('input[name="pjlJurnalMode"]').forEach(r => r.onchange = () => {
    row.jurnalMode = r.value;
    rerender();
  });
  document.getElementById('pjlBuatJurnal').onclick = () => {
    pjlReadItems(row);
    pjlRecalc(row);
    if(row.dpp <= 0){ openPjlInfo('Buat Jurnal', 'Isi rincian transaksi terlebih dahulu di tab Rincian Transaksi.'); return; }
    row.jurnalAkun = pjlBuildJurnal(row);
    rerender();
  };
  const addBtn = document.getElementById('pjlJurnalAddRow');
  if(addBtn) addBtn.onclick = () => {
    row.jurnalAkun = row.jurnalAkun || [];
    row.jurnalAkun.push({ kodeAkun:'', namaAkun:'', keterangan:'', debit:0, kredit:0 });
    rerender();
  };
  cont.querySelectorAll('[data-pjl-jurnal-del]').forEach(b => b.onclick = () => {
    row.jurnalAkun.splice(+b.dataset.pjlJurnalDel, 1);
    rerender();
  });
  cont.querySelectorAll('[data-pjl-jurnal-akun-search]').forEach(b => b.onclick = () => {
    const i = +b.dataset.pjlJurnalAkunSearch;
    openPjlAkunPicker((akun) => {
      row.jurnalAkun[i].kodeAkun = akun.kode;
      row.jurnalAkun[i].namaAkun = akun.nama;
      cont.querySelector(`[data-pjl-jurnal-kode="${i}"]`).value = akun.kode;
      cont.querySelector(`[data-pjl-jurnal-nama="${i}"]`).value = akun.nama;
    });
  });
  cont.querySelectorAll('[data-pjl-jurnal-ket]').forEach(inp => inp.oninput = () => {
    row.jurnalAkun[+inp.dataset.pjlJurnalKet].keterangan = inp.value;
  });
  cont.querySelectorAll('[data-pjl-jurnal-debit]').forEach(inp => inp.oninput = () => {
    row.jurnalAkun[+inp.dataset.pjlJurnalDebit].debit = Number(inp.value) || 0;
    refreshSelisih();
  });
  cont.querySelectorAll('[data-pjl-jurnal-kredit]').forEach(inp => inp.oninput = () => {
    row.jurnalAkun[+inp.dataset.pjlJurnalKredit].kredit = Number(inp.value) || 0;
    refreshSelisih();
  });
}

/* Baca field form header/bawah ke state. */
function pjlReadForm(row){
  row.tglFaktur = document.getElementById('fPjlTglFaktur').value.trim();
  row.tglJatuhTempo = document.getElementById('fPjlTglJthTempo').value.trim();
  row.syaratBayar = document.getElementById('fPjlSyaratBayar').value;
  row.gudang = document.getElementById('fPjlGudang').value;
  row.jurnal = document.getElementById('fPjlJurnal').value;
  row.alamatPengiriman = document.getElementById('fPjlAlamat').value;
  row.keterangan = document.getElementById('fPjlKeterangan').value;
  row.poCustomer = document.getElementById('fPjlPoCustomer').value.trim();
  pjlReadItems(row);
  row.items = row.items.filter(it => (it.nama||'').trim() || (it.kode||'').trim());
}

/* ----- Simpan + validasi ----- */
function pjlSave(mode, idx, row){
  pjlReadForm(row);
  pjlRecalc(row);

  if(!row.customerKode){ openPjlInfo('Validasi', 'Customer wajib dipilih.'); return false; }
  if(!row.tglFaktur){ openPjlInfo('Validasi', 'Tgl. Faktur wajib diisi.'); return false; }
  if(!row.items.length){ openPjlInfo('Validasi', 'Rincian transaksi minimal 1 barang / jasa.'); return false; }
  if(row.jurnalAkun && row.jurnalAkun.length){
    const t = pjlJurnalTotals(row);
    if(Math.abs(t.selisih) > 0.004){
      openPjlInfo('Jurnal Tidak Balance', `Total Debit (${pjlNum2(t.debit)}) tidak sama dengan Total Kredit (${pjlNum2(t.kredit)}). Selisih: ${pjlNum2(t.selisih)}.`);
      return false;
    }
  }

  row.tipeTransaksi = pjlTipeTransaksi(row);
  DATA.penjualanLangsung = DATA.penjualanLangsung || [];
  if(mode === 'add') DATA.penjualanLangsung.unshift(row);
  else DATA.penjualanLangsung[idx] = row;
  return true;
}

/* =====================================================================
   Modals
===================================================================== */
function pjlOverlay(html){
  closeModal();
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.innerHTML = html;
  document.body.appendChild(overlay);
  document.getElementById('modalClose').onclick = closeModal;
  const cancel = document.getElementById('modalCancel');
  if(cancel) cancel.onclick = closeModal;
  overlay.onclick = (e) => { if(e.target === overlay) closeModal(); };
  return overlay;
}

function openPjlPrint(row){ pjlOverlay(tplPjlPrintModal(row)); }

function openPjlBatch(item){
  pjlOverlay(tplPjlBatchModal(item));
  document.getElementById('pjlBatchOk').onclick = () => {
    item.batch = document.getElementById('fPjlBatchInput').value.trim();
    closeModal();
  };
}

function openPjlDelete(idx){
  const row = DATA.penjualanLangsung[idx];
  pjlOverlay(tplPjlDeleteConfirm(row));
  document.getElementById('modalDelete').onclick = () => {
    DATA.penjualanLangsung.splice(idx, 1);
    closeModal();
    renderPjlTable();
  };
}

function openPjlInfo(title, text){
  pjlOverlay(tplPjlInfoModal(title, text));
  document.getElementById('modalOk').onclick = closeModal;
}

function openPjlCustomerPicker(onPick){
  const overlay = pjlOverlay(tplPjlCustomerPicker(DATA.customers));
  const wire = () => overlay.querySelectorAll('[data-pjl-pick-customer]').forEach(b => b.onclick = () => {
    const cust = DATA.customers.find(x => x.kode === b.dataset.pjlPickCustomer);
    closeModal();
    if(cust) onPick(cust);
  });
  wire();
  document.getElementById('pjlCustomerPickerSearch').oninput = (e) => {
    const q = e.target.value.trim().toLowerCase();
    const list = DATA.customers.filter(c => !q || c.kode.toLowerCase().includes(q) || c.nama.toLowerCase().includes(q));
    document.getElementById('pjlCustomerPickerBody').innerHTML = tplPjlCustomerPickerRows(list);
    wire();
  };
}

function openPjlPrincipalPicker(onPick){
  const overlay = pjlOverlay(tplPjlPrincipalPicker(DATA.suppliers));
  const wire = () => overlay.querySelectorAll('[data-pjl-pick-principal]').forEach(b => b.onclick = () => {
    const s = pjlSupplier(b.dataset.pjlPickPrincipal);
    closeModal();
    if(s) onPick(s);
  });
  wire();
  document.getElementById('pjlPrincipalPickerSearch').oninput = (e) => {
    const q = e.target.value.trim().toLowerCase();
    const list = DATA.suppliers.filter(s => !q || s.kode.toLowerCase().includes(q) || s.nama.toLowerCase().includes(q));
    document.getElementById('pjlPrincipalPickerBody').innerHTML = tplPjlPrincipalPickerRows(list);
    wire();
  };
}

function openPjlPphPicker(onPick){
  const overlay = pjlOverlay(tplPjlPphPicker(PJL_PPH_LIST));
  overlay.querySelectorAll('[data-pjl-pick-pph]').forEach(b => b.onclick = () => {
    closeModal();
    onPick({ kode: b.dataset.pjlPickPph, persen: Number(b.dataset.pjlPickPersen) });
  });
}

function openPjlAkunPicker(onPick){
  const overlay = pjlOverlay(tplPjlAkunPicker(DATA.akunGL));
  const wire = () => overlay.querySelectorAll('[data-pjl-pick-akun]').forEach(b => b.onclick = () => {
    const akun = DATA.akunGL.find(a => a.kode === b.dataset.pjlPickAkun);
    closeModal();
    if(akun) onPick(akun);
  });
  wire();
  document.getElementById('pjlAkunPickerSearch').oninput = (e) => {
    const q = e.target.value.trim().toLowerCase();
    const list = DATA.akunGL.filter(a => !q || a.kode.includes(q) || a.nama.toLowerCase().includes(q));
    document.getElementById('pjlAkunPickerBody').innerHTML = tplPjlAkunPickerRows(list);
    wire();
  };
}
