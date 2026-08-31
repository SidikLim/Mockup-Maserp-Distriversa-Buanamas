/* =========================================================
   LOGIC (JS saja) — Retur Penjualan (Customer & Penjualan >
   Daftar Transaksi). Dimuat otomatis (lazy-load) oleh core.js
   saat menu ini pertama kali diklik — lihat PAGE_MODULES di
   js/core.js. Markup HTML-nya ada di file sebelah:
   retur-penjualan.template.js (lihat catatan desain lengkap di
   headernya, termasuk pemetaan 2 cetakan PDF & contoh jurnal).
   NB: closeModal() dipakai bersama, didefinisikan di core.js.

   Alur inti:
   1) Pilih No. Faktur Jual (openRpjFakturPicker, sumber
      DATA.invoices) -> rpjApplyFaktur() mengisi Customer/
      Principal/Salesman/Gudang/Alamat + tabel item (harga jual
      dari master DATA.items, batch dari item invoice); ATAU
      pilih Customer saja tanpa faktur (retur cash, No Faktur
      kosong seperti baris pertama screenshot) lalu barang diisi
      lewat faktur; tombol hapus di field faktur mengosongkan.
   2) Kalkulasi item: totalDisc = Disc.Principal% +
      Disc.Distributor%; Diskon1 = HargaJual x Qty x totalDisc /
      100; Jumlah = HargaJual x Qty - Diskon1. Total dokumen pola
      Pembelian BPB (DPP/Diskon1-2/PPN mode/Ongkos Angkut).
   3) Tab Rincian Jurnal Akun — "Buat Jurnal" membangun (lihat
      pemetaan di header template): Retur Penjualan 4110002(D,
      bruto) + PPN Keluaran 2120002(D) + Persediaan 1130001(D,
      HPP = qty x harga master) = Piutang Usaha 1120001(K, grand
      total) + Sales Item Discount (Distributor) 4110005(K,
      diskon) + HPP 5110001(K, HPP). Baris tetap bisa diedit
      manual, divalidasi balance saat Simpan.
   4) CETAKAN: openRpjCetakFaktur (tombol Cetak di list & "Cetak
      dan Simpan" di form) menampilkan replika faktur "Retur
      Penjualan" (dgn Terbilang); openRpjCetakBapbr (tombol Lihat
      BAPBR) menampilkan replika "BUKTI PENERIMAAN BARANG RETUR
      (BPBR) DARI PELANGGAN".
   Dokumen retur FINAL: tidak ada Ubah (banner kuning di form
   Lihat), hanya Lihat/Cetak/Hapus — persis kebijakan screenshot.
========================================================= */
function renderReturPenjualanPage(){
  renderRpjList();
}

var rpjState = { search:'' };

function renderRpjList(){
  rpjState = { search:'' };
  content.innerHTML = tplReturPenjualanListPage();
  document.getElementById('btnRpjAdd').onclick = () => openRpjForm('add');
  document.getElementById('rpjSearch').oninput = (e) => { rpjState.search = e.target.value; renderRpjTable(); };
  renderRpjTable();
}

function rpjFilteredRows(){
  const q = rpjState.search.trim().toLowerCase();
  if(!q) return DATA.returPenjualan || [];
  return (DATA.returPenjualan || []).filter(r =>
    r.no.toLowerCase().includes(q) ||
    (r.customer || '').toLowerCase().includes(q) ||
    (r.noFakturJual || '').toLowerCase().includes(q) ||
    (r.tipeTransaksi || '').toLowerCase().includes(q));
}

function renderRpjTable(){
  const rows = rpjFilteredRows();
  const tbody = document.getElementById('rpjTbody');
  tbody.innerHTML = tplRpjRows(rows);
  document.getElementById('rpjTotal').textContent = `Total Record: ${rows.length}`;
  const idxOf = (r) => DATA.returPenjualan.indexOf(r);
  tbody.querySelectorAll('[data-view-link]').forEach(b => b.onclick = () => openRpjForm('view', idxOf(rows[+b.dataset.viewLink])));
  tbody.querySelectorAll('[data-view]').forEach(b => b.onclick = () => openRpjForm('view', idxOf(rows[+b.dataset.view])));
  tbody.querySelectorAll('[data-attach]').forEach(b => b.onclick = () => {
    const r = rows[+b.dataset.attach];
    openRpjInfo('Attach', `Lampiran file (foto barang retur, nota, dsb.) untuk <b>${r.no}</b> akan tersedia di sini.`);
  });
  tbody.querySelectorAll('[data-bapbr]').forEach(b => b.onclick = () => openRpjCetakBapbr(rows[+b.dataset.bapbr]));
  tbody.querySelectorAll('[data-print]').forEach(b => b.onclick = () => openRpjCetakFaktur(rows[+b.dataset.print]));
  tbody.querySelectorAll('[data-del]').forEach(b => b.onclick = () => openRpjDeleteConfirm(idxOf(rows[+b.dataset.del])));
}

/* No. Faktur Retur format screenshot "26/RS-HO/03/00001" =
   26/RS-{kode cabang}/{MM}/{urut 5 digit per cabang} — bulan sample
   DBM memakai 08 (Agustus 2026). */
function rpjGenerateNo(cabang){
  const kode = RPJ_CABANG_CODE[cabang] || 'XXX';
  const seq = (DATA.returPenjualan || []).filter(r => r.cabang === cabang).length + 1;
  return `26/RS-${kode}/08/${String(seq).padStart(5,'0')}`;
}

function rpjGenerateNoFakturPajak(){
  return 'RET0426' + String(Math.floor(10000000000 + Math.random()*89999999999));
}

/* ===== kalkulasi item & total ===== */
function rpjRecalcItem(item){
  item.totalDisc = (+item.discPrincipal || 0) + (+item.discDistributor || 0);
  item.diskon1 = Math.round((+item.hargaJual || 0) * (+item.qty || 0) * item.totalDisc) / 100;
  item.jumlah = Math.round(((+item.hargaJual || 0) * (+item.qty || 0) - item.diskon1) * 100) / 100;
}

function rpjRecalcTotals(row){
  row.bruto = Math.round(row.items.reduce((s,it) => s + (+it.hargaJual||0) * (+it.qty||0), 0) * 100) / 100;
  row.dpp = Math.round(row.items.reduce((s,it) => s + (+it.jumlah || 0), 0) * 100) / 100;
  row.diskon1Amount = Math.round(row.dpp * (+row.diskon1 || 0)) / 100;
  row.diskon2Amount = Math.round(row.dpp * (+row.diskon2 || 0)) / 100;
  const dppNet = row.dpp - row.diskon1Amount - row.diskon2Amount;
  row.ppnAmount = (row.ppnMode === 'eksklusif') ? Math.round(dppNet * 11) / 100 : 0;
  row.pajak11 = (row.ppnMode === 'eksklusif' || row.ppnMode === 'inklusif') ? 'PPN11' : '';
  row.jumlahTotal = Math.round((dppNet + row.ppnAmount + (+row.ongkosAngkut || 0)) * 100) / 100;
  row.sisaJumlah = row.jumlahTotal;
}

function rpjJurnalTotals(row){
  const list = row.jurnalAkun || [];
  const debit = Math.round(list.reduce((s,e) => s + (+e.debit||0), 0) * 100) / 100;
  const kredit = Math.round(list.reduce((s,e) => s + (+e.kredit||0), 0) * 100) / 100;
  return { debit, kredit, selisih: Math.round((debit - kredit) * 100) / 100 };
}

/* HPP barang retur = qty x harga master barang (DATA.items,
   fallback harga jual item). */
function rpjHpp(row){
  return Math.round((row.items||[]).reduce((s,it) => {
    const master = DATA.items.find(x => x.kode === it.kode);
    return s + (+it.qty || 0) * (master ? (+master.harga || 0) : (+it.hargaJual || 0));
  }, 0) * 100) / 100;
}

function rpjBuildJurnal(row){
  rpjRecalcTotals(row);
  const diskon = Math.round((row.bruto - row.dpp + row.diskon1Amount + row.diskon2Amount) * 100) / 100;
  const hpp = rpjHpp(row);
  const ket = row.alasanText || '';
  const rows = [];
  if(row.bruto > 0.004) rows.push({ kodeAkun:'4110002', namaAkun: rpjAkunNama('4110002')||'Retur Penjualan', keterangan: ket, debit: row.bruto, kredit: 0 });
  if(row.jumlahTotal > 0.004) rows.push({ kodeAkun:'1120001', namaAkun: rpjAkunNama('1120001')||'Piutang Usaha', keterangan: ket, debit: 0, kredit: row.jumlahTotal });
  if(diskon > 0.004) rows.push({ kodeAkun:'4110005', namaAkun: rpjAkunNama('4110005')||'Sales Item Discount (Distributor)', keterangan: ket, debit: 0, kredit: diskon });
  if(row.ppnAmount > 0.004) rows.push({ kodeAkun:'2120002', namaAkun: rpjAkunNama('2120002')||'PPN Keluaran', keterangan: ket, debit: row.ppnAmount, kredit: 0 });
  if(hpp > 0.004 && !row.returAdministrasi){
    rows.push({ kodeAkun:'1130001', namaAkun: rpjAkunNama('1130001')||'Persediaan Barang Dagang', keterangan: ket, debit: hpp, kredit: 0 });
    rows.push({ kodeAkun:'5110001', namaAkun: rpjAkunNama('5110001')||'HPP Barang Dagang', keterangan: ket, debit: 0, kredit: hpp });
  }
  // Penyeimbang pembulatan/ongkos angkut (jarang terpakai di data mockup)
  const totals = { d: rows.reduce((s,r)=>s+r.debit,0), k: rows.reduce((s,r)=>s+r.kredit,0) };
  const selisih = Math.round((totals.d - totals.k) * 100) / 100;
  if(Math.abs(selisih) > 0.004) rows.push({ kodeAkun:'6510003', namaAkun: rpjAkunNama('6510003')||'Selisih Pembulatan / Pembayaran', keterangan: ket, debit: selisih < 0 ? -selisih : 0, kredit: selisih > 0 ? selisih : 0 });
  row.jurnalAkun = rows;
}

/* Mengisi form + item dari 1 Sales Invoice terpilih (DATA.invoices) —
   harga jual dari master DATA.items (invoice mockup tidak menyimpan
   harga per item), batch dari item invoice. */
function rpjApplyFaktur(row, inv){
  row.noFakturJual = inv.no;
  row.customer = inv.customerNama || '';
  row.customerKode = inv.customerKode || '';
  row.cabang = inv.cabang || row.cabang;
  row.alamatPengiriman = inv.customerAlamat || '';
  row.principal = inv.principalNama || '';
  const g = DATA.gudang.find(x => `(${x.kode}) ${x.nama}` === inv.gudang);
  if(g) row.gudangKode = g.kode;
  row.items = (inv.items || []).map(it => {
    const master = DATA.items.find(x => x.kode === it.kode);
    const item = {
      kode: it.kode, nama: it.nama, um: it.satuan || '',
      qty: it.qtyKirim != null ? it.qtyKirim : (it.qtyPesan || 0), qtySisa: 0,
      hargaJual: master ? (+master.harga || 0) : 0,
      discPrincipal: 0, discDistributor: 3, totalDisc: 0, diskon1: 0, jumlah: 0,
      batches: [{ no: it.batch || '', qty: it.qtyKirim != null ? it.qtyKirim : (it.qtyPesan || 0), ed: it.ed || '' }],
    };
    rpjRecalcItem(item);
    return item;
  });
}

function rpjBuildEmptyRow(){
  const cabang0 = RPJ_CABANG_LIST[0];
  const defaultGudang = DATA.gudang.find(g => g.default) || DATA.gudang[0];
  return {
    no: rpjGenerateNo(cabang0), cabang: cabang0, status:'Approved', tipeTransaksi:'Retur Penjualan Cash',
    inventoryTransaction:'', tglRetur:'31/08/2026 10:00:00', tglJthTempo:'31/08/2026',
    customer:'', customerKode:'', noFakturJual:'', syaratBayar: RPJ_SYARAT_BAYAR_LIST[0],
    jurnal: DATA.jurnalPenjualan.length ? DATA.jurnalPenjualan[0].nama : '',
    principal:'', tipeLayanan:'Pilih', returAdministrasi:false,
    gudangKode: defaultGudang ? defaultGudang.kode : '', gudangAlokasi:false,
    salesman: DATA.salesman.length ? DATA.salesman[0].nama : '', alamatPengiriman:'',
    items: [], jurnalAkun: [],
    ppnMode:'eksklusif', tglFakturPajak:'31/08/2026', kodePajak: RPJ_KODE_PAJAK_LIST[0], noFakturPajak: rpjGenerateNoFakturPajak(),
    diskon1:0, diskon1Amount:0, diskon2:0, diskon2Amount:0, bruto:0, dpp:0,
    pajak11:'PPN11', ppnAmount:0, ongkosAngkut:0, jumlahTotal:0, sisaJumlah:0,
    alasanTipe:'Lain-lain', alasanSub:'', alasanText:'',
  };
}

function openRpjForm(mode, idx){
  const src = mode === 'add' ? rpjBuildEmptyRow() : DATA.returPenjualan[idx];
  const row = {
    ...src,
    items: (src.items||[]).map(it => ({...it, batches:(it.batches||[]).map(b=>({...b}))})),
    jurnalAkun: (src.jurnalAkun||[]).map(e => ({...e})),
  };
  // Dokumen tersimpan dgn jurnal kosong -> susun otomatis utk tampilan Lihat
  if(mode === 'view' && !row.jurnalAkun.length && row.items.length) rpjBuildJurnal(row);
  content.innerHTML = tplRpjForm(mode, row);
  wireRpjForm(mode, idx, row);
}

/* ===== refresh DOM ===== */
function refreshRpjItemsDOM(row, isView){
  document.getElementById('rpjItemsBody').innerHTML = tplRpjItemRows(row.items, isView);
  document.getElementById('rpjItemsEmptyHint').style.display = row.items.length ? 'none' : '';
  wireRpjItemEvents(row);
  rpjRecalcTotals(row);
  refreshRpjTotalsDOM(row);
}

function refreshRpjTotalsDOM(row){
  const set = (id, val) => { const el = document.getElementById(id); if(el) el.value = val; };
  set('fRpjDiskon1Amount', rpjNum2(row.diskon1Amount));
  set('fRpjDiskon2Amount', rpjNum2(row.diskon2Amount));
  set('fRpjDpp', rpjNum2(row.dpp));
  set('fRpjPajak11', row.pajak11);
  set('fRpjPpnAmount', rpjNum2(row.ppnAmount));
  set('fRpjJumlahTotal', rpjNum2(row.jumlahTotal));
  set('fRpjSisaJumlah', rpjNum2(row.sisaJumlah));
}

function refreshRpjItemRowDOM(idx, item){
  const t = document.querySelector(`[data-rpj-totaldisc="${idx}"]`);
  const d = document.querySelector(`[data-rpj-diskon1="${idx}"]`);
  const j = document.querySelector(`[data-rpj-jumlah="${idx}"]`);
  if(t) t.value = item.totalDisc;
  if(d) d.value = rpjNum2(item.diskon1);
  if(j) j.value = rpjNum2(item.jumlah);
}

function refreshRpjJurnalContent(row, isView){
  const el = document.getElementById('rpjTabJurnalContent');
  if(!el) return;
  const visible = el.style.display !== 'none';
  el.innerHTML = tplRpjJurnalContent(row, isView);
  el.style.display = visible ? '' : 'none';
  wireRpjJurnalEvents(row, isView);
}

function refreshRpjJurnalSelisih(row){
  const el = document.getElementById('rpjJurnalSelisih');
  if(!el) return;
  const totals = rpjJurnalTotals(row);
  el.value = rpjNum2(totals.selisih);
  el.style.color = Math.abs(totals.selisih) > 0.004 ? 'var(--red)' : 'var(--text)';
}

function wireRpjItemEvents(row){
  (row.items||[]).forEach((it, idx) => {
    const info = document.querySelector(`[data-rpj-item-info="${idx}"]`);
    if(info) info.onclick = () => openRpjInfo('Barang Yang Diretur', `Barang mengikuti isi Sales Invoice <b>${row.noFakturJual||'-'}</b> — Kode/Nama/U/M terkunci; yang bisa diubah: Qty, Disc. Principal, dan Disc. Distributor.`);
    const hinfo = document.querySelector(`[data-rpj-harga-info="${idx}"]`);
    if(hinfo) hinfo.onclick = () => openRpjInfo('Harga Jual', 'Harga Jual mengikuti harga master barang / DPL yang berlaku. Pencarian price list akan tersedia di sini.');
    const binfo = document.querySelector(`[data-rpj-batch-info="${idx}"]`);
    if(binfo) binfo.onclick = () => openRpjInfo('Multi Batch Number', 'Pencarian batch dari kartu stok akan tersedia di sini — di mockup ini no. batch/qty/ED bisa langsung diketik di baris batch di bawah kolom ini.');
    const recalc = () => {
      rpjRecalcItem(it);
      refreshRpjItemRowDOM(idx, it);
      rpjRecalcTotals(row);
      refreshRpjTotalsDOM(row);
    };
    const qty = document.querySelector(`[data-rpj-qty="${idx}"]`);
    if(qty) qty.onchange = (e) => {
      it.qty = +e.target.value || 0;
      if(it.batches && it.batches[0]){ it.batches[0].qty = it.qty; const bq = document.querySelector(`[data-rpj-batch-qty="${idx}-0"]`); if(bq) bq.value = it.qty; }
      recalc();
    };
    const dp = document.querySelector(`[data-rpj-discp="${idx}"]`);
    if(dp) dp.onchange = (e) => { it.discPrincipal = +e.target.value || 0; recalc(); };
    const dd = document.querySelector(`[data-rpj-discd="${idx}"]`);
    if(dd) dd.onchange = (e) => { it.discDistributor = +e.target.value || 0; recalc(); };
    (it.batches||[]).forEach((b, bi) => {
      const bn = document.querySelector(`[data-rpj-batch-no="${idx}-${bi}"]`);
      if(bn) bn.onchange = (e) => { b.no = e.target.value; };
      const bq = document.querySelector(`[data-rpj-batch-qty="${idx}-${bi}"]`);
      if(bq) bq.onchange = (e) => { b.qty = +e.target.value || 0; };
      const be = document.querySelector(`[data-rpj-batch-ed="${idx}-${bi}"]`);
      if(be) be.onchange = (e) => { b.ed = e.target.value; };
    });
  });
}

function wireRpjJurnalEvents(row, isView){
  const btnBuat = document.getElementById('rpjBuatJurnal');
  if(btnBuat) btnBuat.onclick = () => {
    if(!row.items.length){ openRpjInfo('Validasi', 'Pilih Sales Invoice dan pastikan ada barang yang diretur terlebih dahulu.'); return; }
    rpjBuildJurnal(row);
    refreshRpjJurnalContent(row, isView);
  };
  const addRow = document.getElementById('rpjJurnalAddRow');
  if(addRow) addRow.onclick = () => {
    row.jurnalAkun.push({ kodeAkun:'', namaAkun:'', keterangan:'', debit:0, kredit:0 });
    refreshRpjJurnalContent(row, isView);
  };
  if(isView) return;
  (row.jurnalAkun||[]).forEach((entry, idx) => {
    const ket = document.querySelector(`[data-rpj-jurnal-ket="${idx}"]`);
    if(ket) ket.onchange = () => { entry.keterangan = ket.value; };
    const deb = document.querySelector(`[data-rpj-jurnal-debit="${idx}"]`);
    if(deb) deb.onchange = () => { entry.debit = +deb.value || 0; refreshRpjJurnalSelisih(row); };
    const kre = document.querySelector(`[data-rpj-jurnal-kredit="${idx}"]`);
    if(kre) kre.onchange = () => { entry.kredit = +kre.value || 0; refreshRpjJurnalSelisih(row); };
    const del = document.querySelector(`[data-rpj-jurnal-del="${idx}"]`);
    if(del) del.onclick = () => { row.jurnalAkun.splice(idx,1); refreshRpjJurnalContent(row, isView); };
    const search = document.querySelector(`[data-rpj-jurnal-akun-search="${idx}"]`);
    if(search) search.onclick = () => openRpjAkunPicker(idx, row);
  });
}

function wireRpjForm(mode, idx, row){
  const isAdd = mode === 'add';
  const isView = mode === 'view';

  const tabBarangBtn = document.getElementById('rpjTabBarangBtn');
  const tabJurnalBtn = document.getElementById('rpjTabJurnalBtn');
  const barangContent = document.getElementById('rpjTabBarangContent');
  const jurnalContent = document.getElementById('rpjTabJurnalContent');
  tabBarangBtn.onclick = () => {
    tabBarangBtn.classList.add('active'); tabJurnalBtn.classList.remove('active');
    barangContent.style.display = ''; jurnalContent.style.display = 'none';
  };
  tabJurnalBtn.onclick = () => {
    tabJurnalBtn.classList.add('active'); tabBarangBtn.classList.remove('active');
    refreshRpjJurnalContent(row, isView);
    jurnalContent.style.display = ''; barangContent.style.display = 'none';
  };

  document.getElementById('btnRpjTutorial').onclick = () => openRpjInfo('Tutorial', 'Video tutorial pengisian Retur Penjualan akan tersedia di sini.');
  document.getElementById('rpjBatalkan').onclick = (e) => { e.preventDefault(); renderRpjList(); };

  wireRpjItemEvents(row);
  wireRpjJurnalEvents(row, isView);

  if(isView) return;

  const cabangSel = document.getElementById('fRpjCabang');
  const applyNo = () => {
    row.no = rpjGenerateNo(row.cabang);
    document.getElementById('fRpjNo').value = row.no;
  };
  if(isAdd){
    cabangSel.onchange = () => { row.cabang = cabangSel.value; applyNo(); };
    document.getElementById('rpjRefreshNo').onclick = applyNo;
  }

  document.getElementById('rpjInvTrxSearch').onclick = () => openRpjInfo('Inventory Transaction', 'Pencarian Inventory Transaction (Transaksi Persediaan) akan tersedia di sini — opsional, dipakai kalau barang retur sudah dicatat masuk lewat transaksi persediaan.');
  document.getElementById('rpjInvTrxClear').onclick = () => { row.inventoryTransaction = ''; };
  document.getElementById('rpjCustomerSearch').onclick = () => openRpjCustomerPicker(row);
  document.getElementById('rpjFakturSearch').onclick = () => openRpjFakturPicker(row, isAdd);
  document.getElementById('rpjFakturClear').onclick = () => {
    row.noFakturJual = ''; row.principal = ''; row.items = []; row.jurnalAkun = [];
    document.getElementById('fRpjNoFakturJual').value = '';
    document.getElementById('fRpjPrincipal').value = '';
    refreshRpjItemsDOM(row, false);
    refreshRpjJurnalContent(row, false);
  };

  document.getElementById('fRpjSyaratBayar').onchange = (e) => { row.syaratBayar = e.target.value; };
  document.getElementById('fRpjTglRetur').onchange = (e) => {
    row.tglRetur = e.target.value;
    row.tglJthTempo = (e.target.value || '').split(' ')[0];
    document.getElementById('fRpjTglJthTempo').value = row.tglJthTempo;
  };
  document.getElementById('fRpjTglJthTempo').onchange = (e) => { row.tglJthTempo = e.target.value; };
  document.getElementById('fRpjJurnal').onchange = (e) => { row.jurnal = e.target.value; };
  document.getElementById('fRpjTipeLayanan').onchange = (e) => { row.tipeLayanan = e.target.value; };
  document.getElementById('fRpjReturAdm').onchange = (e) => { row.returAdministrasi = e.target.checked; };
  document.getElementById('fRpjGudang').onchange = (e) => { row.gudangKode = e.target.value; };
  document.getElementById('fRpjGudangAlokasi').onchange = (e) => { row.gudangAlokasi = e.target.checked; };
  document.getElementById('fRpjSalesman').onchange = (e) => { row.salesman = e.target.value; };
  document.getElementById('fRpjAlamat').onchange = (e) => { row.alamatPengiriman = e.target.value; };
  document.getElementById('fRpjTglFakturPajak').onchange = (e) => { row.tglFakturPajak = e.target.value; };
  document.getElementById('fRpjKodePajak').onchange = (e) => { row.kodePajak = e.target.value; };
  document.getElementById('fRpjAlasanTipe').onchange = (e) => { row.alasanTipe = e.target.value; };
  document.getElementById('fRpjAlasanSub').onchange = (e) => { row.alasanSub = e.target.value; };
  document.getElementById('fRpjAlasanText').onchange = (e) => { row.alasanText = e.target.value; };

  document.getElementById('rpjTambahItem').onclick = (e) => {
    e.preventDefault();
    openRpjInfo('Tambah Item Baru', 'Barang yang diretur mengikuti isi Sales Invoice yang dipilih — menambah barang di luar faktur itu tidak diizinkan di mockup ini. Pilih faktur lain kalau barangnya beda dokumen.');
  };
  document.getElementById('rpjPajakInfo').onclick = () => openRpjInfo('Kode Pajak', `Kode pajak mengikuti mode PPN di panel "Informasi PPN" (saat ini: ${row.pajak11 || 'tidak ada'}).`);

  document.querySelectorAll('input[name="rpjPpnMode"]').forEach(r => r.onchange = (e) => {
    row.ppnMode = e.target.value;
    rpjRecalcTotals(row); refreshRpjTotalsDOM(row);
  });
  ['fRpjDiskon1','fRpjDiskon2','fRpjOngkosAngkut'].forEach(id => {
    document.getElementById(id).onchange = (e) => {
      const key = { fRpjDiskon1:'diskon1', fRpjDiskon2:'diskon2', fRpjOngkosAngkut:'ongkosAngkut' }[id];
      row[key] = +e.target.value || 0;
      rpjRecalcTotals(row); refreshRpjTotalsDOM(row);
    };
  });

  document.getElementById('rpjPerbaharuiKurs').onclick = () => openRpjInfo('Perbaharui Kurs', 'Mata Uang dokumen ini IDR, Kurs selalu 1. Pembaruan kurs otomatis berlaku untuk dokumen bermata uang asing.');
  document.getElementById('rpjSimpan').onclick = () => rpjSave(row, false);
  document.getElementById('rpjCetakSimpan').onclick = () => rpjSave(row, true);
}

function rpjSave(row, withPrint){
  if(!row.customer){ openRpjInfo('Validasi', 'Customer wajib dipilih.'); return; }
  const adaQty = row.items.some(it => (+it.qty||0) > 0);
  if(!adaQty){ openRpjInfo('Validasi', 'Isi minimal 1 barang yang diretur (pilih Sales Invoice terlebih dahulu).'); return; }
  rpjRecalcTotals(row);
  if(!row.jurnalAkun.length){
    rpjBuildJurnal(row);
  } else {
    const totals = rpjJurnalTotals(row);
    if(Math.abs(totals.selisih) > 0.004){
      openRpjInfo('Validasi', `Rincian Jurnal Akun belum balance — Jumlah Debit - Kredit = <b>${rpjNum2(totals.selisih)}</b>. Klik "Buat Jurnal" untuk menyusun ulang otomatis, atau samakan Debit dan Kredit dulu.`);
      return;
    }
  }
  row.tipeTransaksi = row.syaratBayar === 'Jadikan Nota Kredit' ? 'Retur Penjualan Cash' : 'Retur Penjualan Kredit';
  DATA.returPenjualan.unshift(row);
  renderRpjList();
  if(withPrint) openRpjCetakFaktur(row);
}

/* ===== CETAKAN ===== */
function openRpjCetakFaktur(row){
  closeModal();
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.innerHTML = tplRpjCetakFaktur(row);
  document.body.appendChild(overlay);
  document.getElementById('modalClose').onclick = closeModal;
  document.getElementById('modalCancel').onclick = closeModal;
  overlay.onclick = (e) => { if(e.target === overlay) closeModal(); };
}

function openRpjCetakBapbr(row){
  closeModal();
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.innerHTML = tplRpjCetakBapbr(row);
  document.body.appendChild(overlay);
  document.getElementById('modalClose').onclick = closeModal;
  document.getElementById('modalCancel').onclick = closeModal;
  overlay.onclick = (e) => { if(e.target === overlay) closeModal(); };
}

/* ===== pickers ===== */
function openRpjCustomerPicker(row){
  closeModal();
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.innerHTML = tplRpjCustomerPicker(DATA.customers);
  document.body.appendChild(overlay);
  document.getElementById('modalClose').onclick = closeModal;
  document.getElementById('modalCancel').onclick = closeModal;
  overlay.onclick = (e) => { if(e.target === overlay) closeModal(); };
  const wireRows = () => {
    overlay.querySelectorAll('[data-pick-customer]').forEach(btn => btn.onclick = () => {
      const c = DATA.customers.find(x => x.kode === btn.dataset.pickCustomer);
      row.customer = c.nama;
      row.customerKode = c.kode;
      row.alamatPengiriman = row.alamatPengiriman || c.alamat || '';
      document.getElementById('fRpjCustomer').value = c.nama.toUpperCase();
      document.getElementById('fRpjKodeLama').textContent = 'Kode Lama Customer ' + c.kode;
      document.getElementById('fRpjAlamat').value = row.alamatPengiriman;
      closeModal();
    });
  };
  wireRows();
  document.getElementById('rpjCustomerPickerSearch').oninput = (e) => {
    const q = e.target.value.trim().toLowerCase();
    const filtered = DATA.customers.filter(c => c.kode.toLowerCase().includes(q) || c.nama.toLowerCase().includes(q));
    document.getElementById('rpjCustomerPickerBody').innerHTML = tplRpjCustomerPickerRows(filtered);
    wireRows();
  };
}

function openRpjFakturPicker(row, isAdd){
  closeModal();
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.innerHTML = tplRpjFakturPicker(DATA.invoices);
  document.body.appendChild(overlay);
  document.getElementById('modalClose').onclick = closeModal;
  document.getElementById('modalCancel').onclick = closeModal;
  overlay.onclick = (e) => { if(e.target === overlay) closeModal(); };
  const wireRows = () => {
    overlay.querySelectorAll('[data-pick-faktur]').forEach(btn => btn.onclick = () => {
      const inv = DATA.invoices.find(f => f.no === btn.dataset.pickFaktur);
      if(!inv) return;
      rpjApplyFaktur(row, inv);
      if(isAdd){ row.no = rpjGenerateNo(row.cabang); document.getElementById('fRpjNo').value = row.no; }
      document.getElementById('fRpjNoFakturJual').value = row.noFakturJual;
      document.getElementById('fRpjCabang').value = row.cabang;
      document.getElementById('fRpjCustomer').value = (row.customer||'').toUpperCase();
      document.getElementById('fRpjKodeLama').textContent = row.customerKode ? 'Kode Lama Customer ' + row.customerKode : '';
      document.getElementById('fRpjPrincipal').value = row.principal;
      document.getElementById('fRpjGudang').value = row.gudangKode;
      document.getElementById('fRpjAlamat').value = row.alamatPengiriman;
      refreshRpjItemsDOM(row, false);
      row.jurnalAkun = [];
      refreshRpjJurnalContent(row, false);
      closeModal();
    });
  };
  wireRows();
  document.getElementById('rpjFakturPickerSearch').oninput = (e) => {
    const q = e.target.value.trim().toLowerCase();
    const filtered = DATA.invoices.filter(f => f.no.toLowerCase().includes(q) || (f.customerNama||'').toLowerCase().includes(q));
    document.getElementById('rpjFakturPickerBody').innerHTML = tplRpjFakturPickerRows(filtered);
    wireRows();
  };
}

function openRpjAkunPicker(idx, row){
  closeModal();
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.innerHTML = tplRpjAkunPicker(DATA.akunGL);
  document.body.appendChild(overlay);
  document.getElementById('modalClose').onclick = closeModal;
  document.getElementById('modalCancel').onclick = closeModal;
  overlay.onclick = (e) => { if(e.target === overlay) closeModal(); };
  const wireRows = () => {
    overlay.querySelectorAll('[data-rpj-pick-akun]').forEach(btn => btn.onclick = () => {
      const kode = btn.dataset.rpjPickAkun;
      row.jurnalAkun[idx].kodeAkun = kode;
      row.jurnalAkun[idx].namaAkun = rpjAkunNama(kode);
      document.querySelector(`[data-rpj-jurnal-kode="${idx}"]`).value = kode;
      document.querySelector(`[data-rpj-jurnal-nama="${idx}"]`).value = rpjAkunNama(kode);
      closeModal();
    });
  };
  wireRows();
  document.getElementById('rpjAkunPickerSearch').oninput = (e) => {
    const q = e.target.value.trim().toLowerCase();
    const filtered = DATA.akunGL.filter(a => a.kode.toLowerCase().includes(q) || a.nama.toLowerCase().includes(q));
    document.getElementById('rpjAkunPickerBody').innerHTML = tplRpjAkunPickerRows(filtered);
    wireRows();
  };
}

function openRpjDeleteConfirm(idx){
  closeModal();
  const row = DATA.returPenjualan[idx];
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.innerHTML = tplRpjDeleteConfirm(row);
  document.body.appendChild(overlay);
  document.getElementById('modalClose').onclick = closeModal;
  document.getElementById('modalCancel').onclick = closeModal;
  overlay.onclick = (e) => { if(e.target === overlay) closeModal(); };
  document.getElementById('modalDelete').onclick = () => {
    DATA.returPenjualan.splice(idx, 1);
    closeModal();
    renderRpjTable();
  };
}

function openRpjInfo(title, text){
  closeModal();
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.innerHTML = tplRpjInfoModal(title, text);
  document.body.appendChild(overlay);
  document.getElementById('modalClose').onclick = closeModal;
  document.getElementById('modalOk').onclick = closeModal;
  overlay.onclick = (e) => { if(e.target === overlay) closeModal(); };
}
