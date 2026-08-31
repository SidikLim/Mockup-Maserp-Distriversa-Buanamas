/* =========================================================
   LOGIC (JS saja) — Retur Pembelian (Supplier & Pembelian >
   Daftar Transaksi > Retur Pembelian). Dimuat otomatis
   (lazy-load) oleh core.js saat menu ini pertama kali diklik —
   lihat PAGE_MODULES di js/core.js. Markup HTML-nya ada di file
   sebelah: retur-pembelian.template.js (lihat catatan desain
   lengkap di headernya, termasuk konteks rantai transaksi &
   pemetaan contoh jurnal dari screenshot).
   NB: closeModal() dipakai bersama, didefinisikan di core.js.

   Alur inti:
   1) Pilih Faktur Pembelian (openRpFakturPicker — dibuka dari
      tombol cari di field Supplier) -> rpApplyFaktur() mengisi
      Supplier/alamat/Supplier No. Faktur/Jurnal/Keterangan +
      tabel item dari faktur itu (Kode/Nama/U/M/Harga terkunci,
      Qty retur default = qty faktur & bisa dikurangi, batch
      disintesis — lihat catatan header template).
   2) Edit Qty/Fee/Budget per baris -> rpRecalcItem/rpRecalcTotals
      reaktif (pola pbbRecalcItem/pbbRecalcTotals, ditambah
      validasi Qty retur tidak melebihi qty faktur).
   3) Tab "Rincian Jurnal Akun": klik "Buat Jurnal" ->
      rpBuildJurnal() membangun Hutang Usaha(D) = Persediaan(K) +
      PPN Masukan(K) [- PPh] + Selisih Pembulatan(K penyeimbang,
      hanya kalau ada sisa) — baris tetap bisa diedit manual
      (tabel selalu editable, sesuai screenshot), divalidasi
      balance saat Simpan.
   4) Simpan/Cetak dan Simpan -> dokumen di-unshift() ke
      DATA.returPembelian; No. Retur juga DITULIS BALIK ke field
      noReturPB milik faktur sumbernya (DATA.pembelianBPB), jadi
      form Pembelian Melalui BPB (field "No. Retur PB" yang selama
      ini selalu kosong) ikut menampilkan nomor retur ini. Hapus
      mengosongkan lagi noReturPB itu.
   Dokumen retur final: list hanya Lihat/Cetak/Hapus, tanpa Ubah.
========================================================= */
function renderReturPembelianPage(){
  renderRpList();
}

function renderRpList(){
  content.innerHTML = tplReturPembelianListPage();
  document.getElementById('btnRpAdd').onclick = () => openRpForm('add');
  renderRpTable();
}

function renderRpTable(){
  const tbody = document.getElementById('rpTbody');
  const total = document.getElementById('rpTotal');
  tbody.innerHTML = tplRpRows(DATA.returPembelian);
  total.textContent = `Total Record: ${DATA.returPembelian.length}`;
  tbody.querySelectorAll('[data-view]').forEach(b => b.onclick = () => openRpForm('view', +b.dataset.view));
  tbody.querySelectorAll('[data-view-link]').forEach(b => b.onclick = () => openRpForm('view', +b.dataset.viewLink));
  tbody.querySelectorAll('[data-print]').forEach(b => b.onclick = () => {
    const r = DATA.returPembelian[+b.dataset.print];
    openRpInfo('Cetak Retur Pembelian', `Preview PDF Retur Pembelian <b>${r.no}</b> akan tersedia di sini.`);
  });
  tbody.querySelectorAll('[data-del]').forEach(b => b.onclick = () => openRpDeleteConfirm(+b.dataset.del));
}

/* No. Retur format screenshot: "26/RP-HO/08/00002" =
   26/RP-{kode cabang}/08/{urut 5 digit per cabang}. */
function rpGenerateNo(cabang){
  const kode = RP_CABANG_CODE[cabang] || 'XXX';
  const seq = DATA.returPembelian.filter(r => r.cabang === cabang).length + 1;
  return `26/RP-${kode}/08/${String(seq).padStart(5,'0')}`;
}

/* ===== kalkulasi item & total — pola pbbRecalcItem/pbbRecalcTotals ===== */
function rpRecalcItem(item){
  item.totalDisc = (+item.feeDistribusi || 0) + (+item.budgetDiskon || 0);
  item.diskon = Math.round((+item.hargaBeli || 0) * (+item.qty || 0) * item.totalDisc) / 100;
  item.jumlah = Math.round(((+item.hargaBeli || 0) * (+item.qty || 0) - item.diskon) * 100) / 100;
}

function rpRecalcTotals(row){
  row.dpp = Math.round(row.items.reduce((s,it) => s + (+it.jumlah || 0), 0) * 100) / 100;
  row.diskon1Amount = Math.round(row.dpp * (+row.diskon1 || 0)) / 100;
  row.diskon2Amount = Math.round(row.dpp * (+row.diskon2 || 0)) / 100;
  const dppNet = row.dpp - row.diskon1Amount - row.diskon2Amount;
  row.ppnAmount = (row.ppnMode === 'eksklusif') ? Math.round(dppNet * 11) / 100 : 0;
  row.pajak11 = (row.ppnMode === 'eksklusif' || row.ppnMode === 'inklusif') ? 'PPN11' : '';
  row.pphAmount = row.pphKode ? Math.round(dppNet * (+row.pphPersen || 0) * 100) / 10000 : 0;
  row.jumlahTotal = Math.round((dppNet + row.ppnAmount - row.pphAmount) * 100) / 100;
  row.sisaTotal = row.jumlahTotal;
}

function rpJurnalTotals(row){
  const list = row.jurnalAkun || [];
  const debit = Math.round(list.reduce((s,e) => s + (+e.debit||0), 0) * 100) / 100;
  const kredit = Math.round(list.reduce((s,e) => s + (+e.kredit||0), 0) * 100) / 100;
  return { debit, kredit, selisih: Math.round((debit - kredit) * 100) / 100 };
}

/* Jurnal retur (lihat pemetaan contoh screenshot di header template):
   Hutang Usaha 2110001 (D, sebesar Jumlah) = Persediaan 1130001 (K,
   DPP setelah diskon) + PPN Masukan 1140002 (K) [- PPh mengurangi
   Hutang] + Selisih Pembulatan 6510003 (K penyeimbang, hanya muncul
   kalau ada sisa). */
function rpBuildJurnal(row){
  rpRecalcTotals(row);
  const ket = row.keterangan || `RETUR PEMBELIAN ${row.noFakturPembelian||''} ${(row.supplier||'').toUpperCase()}`;
  const dppNet = Math.round((row.dpp - row.diskon1Amount - row.diskon2Amount) * 100) / 100;
  const rows = [];
  if(row.jumlahTotal > 0.004) rows.push({ kodeAkun:'2110001', namaAkun: rpAkunNama('2110001')||'Hutang Usaha', keterangan: ket, debit: row.jumlahTotal, kredit: 0 });
  if(dppNet > 0.004) rows.push({ kodeAkun:'1130001', namaAkun: rpAkunNama('1130001')||'Persediaan Barang Dagang', keterangan: ket, debit: 0, kredit: dppNet });
  if(row.ppnAmount > 0.004) rows.push({ kodeAkun:'1140002', namaAkun: rpAkunNama('1140002')||'PPN Masukan', keterangan: ket, debit: 0, kredit: row.ppnAmount });
  const selisih = Math.round((row.jumlahTotal - dppNet - row.ppnAmount) * 100) / 100;
  if(Math.abs(selisih) > 0.004) rows.push({ kodeAkun:'6510003', namaAkun: rpAkunNama('6510003')||'Selisih Pembulatan / Pembayaran', keterangan: ket, debit: selisih < 0 ? -selisih : 0, kredit: selisih > 0 ? selisih : 0 });
  row.jurnalAkun = rows;
}

/* Mengisi form dari 1 Faktur Pembelian terpilih. Batch disintesis
   dari kode barang + qty faktur (faktur tidak menyimpan batch —
   lihat catatan header template). */
function rpApplyFaktur(row, faktur){
  row.noFakturPembelian = faktur.no;
  row.supplier = faktur.supplier;
  row.supplierNoFaktur = faktur.supplierNoFaktur || '';
  row.jurnal = faktur.jurnal || row.jurnal;
  row.alamatPengiriman = faktur.alamatPengiriman || '';
  row.mataUang = 'IDR';
  row.keterangan = `RETUR PEMBELIAN ATAS ${faktur.no} (${(faktur.supplier||'').toUpperCase()})`;
  row.items = (faktur.items || []).map((it, i) => {
    const item = {
      kode: it.kode, nama: it.nama, um: it.um || '',
      qty: it.qty || 0, qtyFaktur: it.qty || 0,
      hargaBeli: it.hargaBeli || 0, feeDistribusi: it.feeDistribusi || 0, budgetDiskon: it.budgetDiskon || 0,
      totalDisc: 0, diskon: 0, jumlah: 0, pph: !!it.pph, ppn: it.ppn !== false,
      batches: [{ no: `B${String(it.kode||'').replace(/\D/g,'').slice(-4).padStart(4,'0')}G0${i+1}`, qty: it.qty || 0, ed: '16/07/2028' }],
    };
    rpRecalcItem(item);
    return item;
  });
}

function rpBuildEmptyRow(){
  const cabang0 = RP_CABANG_LIST[0];
  const defaultGudang = DATA.gudang.find(g => g.default) || DATA.gudang[0];
  return {
    no: rpGenerateNo(cabang0), cabang: cabang0, tipeTransaksi: '',
    tglFaktur: '31/08/2026', tglJthTempo: '31/08/2026',
    supplier: '', noFakturPembelian: '', supplierNoFaktur: '',
    syaratBayar: RP_SYARAT_BAYAR_LIST[0], jurnal: DATA.jurnalPembelian.length ? DATA.jurnalPembelian[0].nama : '',
    gudangKode: defaultGudang ? defaultGudang.kode : '', alamatPengiriman: '',
    items: [], ppnMode: 'eksklusif', mataUang: 'IDR', tglFakturPajak: '31/08/2026', noFakturPajak: '',
    kurs: 1, diskon1: 0, diskon1Amount: 0, diskon2: 0, diskon2Amount: 0, dpp: 0,
    pajak11: 'PPN11', ppnAmount: 0, pphKode: '', pphPersen: 0, pphAmount: 0,
    jumlahTotal: 0, sisaTotal: 0, keterangan: '', jurnalAkun: [],
  };
}

function openRpForm(mode, idx){
  const src = mode === 'add' ? rpBuildEmptyRow() : DATA.returPembelian[idx];
  const row = {
    ...src,
    items: (src.items||[]).map(it => ({...it, batches:(it.batches||[]).map(b=>({...b}))})),
    jurnalAkun: (src.jurnalAkun||[]).map(e => ({...e})),
  };
  content.innerHTML = tplRpForm(mode, row);
  wireRpForm(mode, idx, row);
}

/* ===== refresh DOM per bagian ===== */
function refreshRpItemsDOM(row, isView){
  document.getElementById('rpItemsBody').innerHTML = tplRpItemRows(row.items, isView);
  document.getElementById('rpItemsEmptyHint').style.display = row.items.length ? 'none' : '';
  wireRpItemEvents(row);
  rpRecalcTotals(row);
  refreshRpTotalsDOM(row);
}

function refreshRpTotalsDOM(row){
  const set = (id, val) => { const el = document.getElementById(id); if(el) el.value = val; };
  set('fRpDiskon1Amount', rpNum2(row.diskon1Amount));
  set('fRpDiskon2Amount', rpNum2(row.diskon2Amount));
  set('fRpDpp', rpNum2(row.dpp));
  set('fRpPajak11', row.pajak11);
  set('fRpPpnAmount', rpNum2(row.ppnAmount));
  set('fRpPphKode', row.pphKode);
  set('fRpPphAmount', rpNum2(row.pphAmount));
  set('fRpJumlahTotal', rpNum2(row.jumlahTotal));
  set('fRpSisaTotal', rpNum2(row.sisaTotal));
}

function refreshRpItemRowDOM(idx, item){
  const totalDiscEl = document.querySelector(`[data-rp-totaldisc="${idx}"]`);
  const diskonEl = document.querySelector(`[data-rp-diskon="${idx}"]`);
  const jumlahEl = document.querySelector(`[data-rp-jumlah="${idx}"]`);
  if(totalDiscEl) totalDiscEl.value = item.totalDisc;
  if(diskonEl) diskonEl.value = rpNum2(item.diskon);
  if(jumlahEl) jumlahEl.value = rpNum2(item.jumlah);
}

function refreshRpJurnalContent(row, isView){
  const el = document.getElementById('rpTabJurnalContent');
  if(!el) return;
  const visible = el.style.display !== 'none';
  el.innerHTML = tplRpJurnalContent(row, isView);
  el.style.display = visible ? '' : 'none';
  wireRpJurnalEvents(row, isView);
}

function refreshRpJurnalSelisih(row){
  const el = document.getElementById('rpJurnalSelisih');
  if(!el) return;
  const totals = rpJurnalTotals(row);
  el.value = rpNum2(totals.selisih);
  el.style.color = Math.abs(totals.selisih) > 0.004 ? 'var(--red)' : 'var(--text)';
}

function wireRpItemEvents(row){
  row.items.forEach((item, idx) => {
    const pphCb = document.querySelector(`[data-rp-pph="${idx}"]`);
    if(pphCb) pphCb.onchange = (e) => { item.pph = e.target.checked; };
    const ppnCb = document.querySelector(`[data-rp-ppn="${idx}"]`);
    if(ppnCb) ppnCb.onchange = (e) => { item.ppn = e.target.checked; };
    const itemInfo = document.querySelector(`[data-rp-item-info="${idx}"]`);
    if(itemInfo) itemInfo.onclick = () => openRpInfo('Barang Yang Diretur', `Barang mengikuti isi Faktur Pembelian <b>${row.noFakturPembelian||'-'}</b> — Kode/Nama/U/M/Harga terkunci dari faktur, yang bisa diubah adalah Qty retur (maksimal qty faktur), Fee Distribusi, dan Budget Diskon.`);
    const batchInfo = document.querySelector(`[data-rp-batch-info="${idx}"]`);
    if(batchInfo) batchInfo.onclick = () => openRpInfo('Multi Batch Number', 'Pencarian batch dari kartu stok akan tersedia di sini — di mockup ini no. batch/qty/ED bisa langsung diketik di baris batch di bawah kolom ini.');
    const qtyEl = document.querySelector(`[data-rp-qty="${idx}"]`);
    if(qtyEl) qtyEl.onchange = (e) => {
      let q = +e.target.value || 0;
      if(item.qtyFaktur && q > item.qtyFaktur){
        openRpInfo('Validasi', `Qty retur (${q}) tidak boleh melebihi qty faktur (${item.qtyFaktur}).`);
        q = item.qtyFaktur;
        e.target.value = q;
      }
      item.qty = q;
      if(item.batches && item.batches[0]) item.batches[0].qty = q;
      const bq = document.querySelector(`[data-rp-batch-qty="${idx}-0"]`);
      if(bq) bq.value = q;
      rpRecalcItem(item);
      refreshRpItemRowDOM(idx, item);
      rpRecalcTotals(row);
      refreshRpTotalsDOM(row);
    };
    const feeEl = document.querySelector(`[data-rp-fee="${idx}"]`);
    if(feeEl) feeEl.onchange = (e) => {
      item.feeDistribusi = +e.target.value || 0;
      rpRecalcItem(item); refreshRpItemRowDOM(idx, item);
      rpRecalcTotals(row); refreshRpTotalsDOM(row);
    };
    const budgetEl = document.querySelector(`[data-rp-budget="${idx}"]`);
    if(budgetEl) budgetEl.onchange = (e) => {
      item.budgetDiskon = +e.target.value || 0;
      rpRecalcItem(item); refreshRpItemRowDOM(idx, item);
      rpRecalcTotals(row); refreshRpTotalsDOM(row);
    };
    (item.batches||[]).forEach((b, bi) => {
      const bn = document.querySelector(`[data-rp-batch-no="${idx}-${bi}"]`);
      if(bn) bn.onchange = (e) => { b.no = e.target.value; };
      const bq = document.querySelector(`[data-rp-batch-qty="${idx}-${bi}"]`);
      if(bq) bq.onchange = (e) => { b.qty = +e.target.value || 0; };
      const be = document.querySelector(`[data-rp-batch-ed="${idx}-${bi}"]`);
      if(be) be.onchange = (e) => { b.ed = e.target.value; };
    });
  });
}

function wireRpJurnalEvents(row, isView){
  const btnBuat = document.getElementById('rpBuatJurnal');
  if(btnBuat) btnBuat.onclick = () => {
    if(!row.items.length){ openRpInfo('Validasi', 'Pilih Faktur Pembelian dan pastikan ada barang yang diretur terlebih dahulu.'); return; }
    rpBuildJurnal(row);
    refreshRpJurnalContent(row, isView);
  };
  const addRow = document.getElementById('rpJurnalAddRow');
  if(addRow) addRow.onclick = () => {
    row.jurnalAkun.push({ kodeAkun:'', namaAkun:'', keterangan: row.keterangan||'', debit:0, kredit:0 });
    refreshRpJurnalContent(row, isView);
  };
  if(isView) return;
  (row.jurnalAkun||[]).forEach((entry, idx) => {
    const ket = document.querySelector(`[data-rp-jurnal-ket="${idx}"]`);
    if(ket) ket.onchange = () => { entry.keterangan = ket.value; };
    const deb = document.querySelector(`[data-rp-jurnal-debit="${idx}"]`);
    if(deb) deb.onchange = () => { entry.debit = +deb.value || 0; refreshRpJurnalSelisih(row); };
    const kre = document.querySelector(`[data-rp-jurnal-kredit="${idx}"]`);
    if(kre) kre.onchange = () => { entry.kredit = +kre.value || 0; refreshRpJurnalSelisih(row); };
    const del = document.querySelector(`[data-rp-jurnal-del="${idx}"]`);
    if(del) del.onclick = () => { row.jurnalAkun.splice(idx,1); refreshRpJurnalContent(row, isView); };
    const search = document.querySelector(`[data-rp-jurnal-akun-search="${idx}"]`);
    if(search) search.onclick = () => openRpAkunPicker(idx, row);
  });
}

function wireRpForm(mode, idx, row){
  const isAdd = mode === 'add';
  const isView = mode === 'view';

  const tabBarangBtn = document.getElementById('rpTabBarangBtn');
  const tabJurnalBtn = document.getElementById('rpTabJurnalBtn');
  const barangContent = document.getElementById('rpTabBarangContent');
  const jurnalContent = document.getElementById('rpTabJurnalContent');
  tabBarangBtn.onclick = () => {
    tabBarangBtn.classList.add('active'); tabJurnalBtn.classList.remove('active');
    barangContent.style.display = ''; jurnalContent.style.display = 'none';
  };
  tabJurnalBtn.onclick = () => {
    tabJurnalBtn.classList.add('active'); tabBarangBtn.classList.remove('active');
    jurnalContent.style.display = ''; barangContent.style.display = 'none';
  };

  document.getElementById('btnRpTutorial').onclick = () => openRpInfo('Tutorial', 'Video tutorial pengisian Retur Pembelian akan tersedia di sini.');
  document.getElementById('rpBatalkan').onclick = (e) => { e.preventDefault(); renderRpList(); };

  wireRpItemEvents(row);
  wireRpJurnalEvents(row, isView);

  if(isView) return;

  const cabangSel = document.getElementById('fRpCabang');
  const noOtoSel = document.getElementById('fRpNoOtomatis');
  const applyNo = () => {
    row.no = rpGenerateNo(row.cabang);
    document.getElementById('fRpNo').value = row.no;
  };
  if(isAdd){
    cabangSel.onchange = () => { row.cabang = cabangSel.value; noOtoSel.value = RP_CABANG_CODE[row.cabang]; applyNo(); };
    noOtoSel.onchange = () => {
      const cabang = RP_CABANG_LIST.find(c => RP_CABANG_CODE[c] === noOtoSel.value) || RP_CABANG_LIST[0];
      row.cabang = cabang; cabangSel.value = cabang; applyNo();
    };
    document.getElementById('rpRefreshNo').onclick = applyNo;
  }

  document.getElementById('fRpTglFaktur').onchange = (e) => {
    row.tglFaktur = e.target.value;
    row.tglJthTempo = e.target.value; // Nota Debit: jatuh tempo = tgl retur
    document.getElementById('fRpTglJthTempo').value = row.tglJthTempo;
  };
  document.getElementById('fRpTglJthTempo').onchange = (e) => { row.tglJthTempo = e.target.value; };
  document.getElementById('fRpSyaratBayar').onchange = (e) => { row.syaratBayar = e.target.value; };
  document.getElementById('fRpJurnal').onchange = (e) => { row.jurnal = e.target.value; };
  document.getElementById('fRpGudang').onchange = (e) => { row.gudangKode = e.target.value; };
  document.getElementById('fRpAlamat').onchange = (e) => { row.alamatPengiriman = e.target.value; };
  document.getElementById('fRpKeterangan').onchange = (e) => { row.keterangan = e.target.value; };
  document.getElementById('fRpMataUang').onchange = () => {};
  document.getElementById('fRpTglFakturPajak').onchange = (e) => { row.tglFakturPajak = e.target.value; };
  document.getElementById('fRpNoFakturPajak').onchange = (e) => { row.noFakturPajak = e.target.value; };

  document.getElementById('rpSupplierSearch').onclick = () => openRpFakturPicker(row);
  document.getElementById('rpFakturClear').onclick = () => {
    row.noFakturPembelian = ''; row.supplier = ''; row.supplierNoFaktur = '';
    row.items = []; row.jurnalAkun = [];
    document.getElementById('fRpNoFakturPembelian').value = '';
    document.getElementById('fRpSupplier').value = '';
    document.getElementById('fRpSupplierNoFaktur').value = '';
    refreshRpItemsDOM(row, false);
    refreshRpJurnalContent(row, false);
  };

  document.getElementById('rpTambahItem').onclick = (e) => {
    e.preventDefault();
    openRpInfo('Tambah Item Baru', 'Barang yang diretur mengikuti isi Faktur Pembelian yang dipilih — menambah barang di luar faktur itu tidak diizinkan. Pilih faktur lain kalau barangnya beda dokumen.');
  };

  document.getElementById('rpPajakInfo').onclick = () => openRpInfo('Kode Pajak', `Kode pajak mengikuti mode PPN di panel "Informasi PPN" (saat ini: ${row.pajak11 || 'tidak ada'}).`);
  document.getElementById('rpPphSearch').onclick = () => openRpPphPicker(row);
  document.getElementById('rpPphClear').onclick = () => {
    row.pphKode = ''; row.pphPersen = 0;
    rpRecalcTotals(row); refreshRpTotalsDOM(row);
  };

  document.querySelectorAll('input[name="rpPpnMode"]').forEach(r => r.onchange = (e) => {
    row.ppnMode = e.target.value;
    rpRecalcTotals(row); refreshRpTotalsDOM(row);
  });
  ['fRpDiskon1','fRpDiskon2'].forEach(id => {
    document.getElementById(id).onchange = (e) => {
      row[id === 'fRpDiskon1' ? 'diskon1' : 'diskon2'] = +e.target.value || 0;
      rpRecalcTotals(row); refreshRpTotalsDOM(row);
    };
  });

  document.getElementById('rpPerbaharuiKurs').onclick = () => openRpInfo('Perbaharui Kurs', `Mata Uang dokumen ini ${row.mataUang}, Kurs selalu 1. Pembaruan kurs otomatis berlaku untuk dokumen bermata uang asing.`);
  document.getElementById('rpSimpan').onclick = () => rpSave(row, false);
  document.getElementById('rpCetakSimpan').onclick = () => rpSave(row, true);
}

function rpSave(row, withPrint){
  if(!row.noFakturPembelian){ openRpInfo('Validasi', 'Faktur Pembelian wajib dipilih (tombol cari di field Supplier).'); return; }
  const adaQty = row.items.some(it => (+it.qty||0) > 0);
  if(!adaQty){ openRpInfo('Validasi', 'Isi Qty retur minimal 1 barang.'); return; }
  rpRecalcTotals(row);
  if(!row.jurnalAkun.length){
    rpBuildJurnal(row);
  } else {
    const totals = rpJurnalTotals(row);
    if(Math.abs(totals.selisih) > 0.004){
      openRpInfo('Validasi', `Rincian Jurnal Akun belum balance — Jumlah Debit - Kredit = <b>${rpNum2(totals.selisih)}</b>. Klik "Buat Jurnal" untuk menyusun ulang otomatis, atau samakan Debit dan Kredit dulu.`);
      return;
    }
  }
  if(!row.keterangan) row.keterangan = `RETUR PEMBELIAN ATAS ${row.noFakturPembelian} (${(row.supplier||'').toUpperCase()})`;
  row.tipeTransaksi = row.syaratBayar === 'Jadikan Nota Debit' ? 'Nota Debit' : '';

  DATA.returPembelian.unshift(row);
  // Tulis balik No. Retur ke faktur sumber (field noReturPB di
  // Pembelian Melalui BPB) — lihat catatan alur di header file.
  const faktur = DATA.pembelianBPB.find(f => f.no === row.noFakturPembelian);
  if(faktur) faktur.noReturPB = row.no;

  if(withPrint){
    openRpInfo('Cetak Retur Pembelian', `Preview PDF Retur Pembelian <b>${row.no}</b> akan tersedia di sini. Data sudah tersimpan.`);
  }
  renderRpList();
}

function openRpFakturPicker(row){
  closeModal();
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.innerHTML = tplRpFakturPicker(DATA.pembelianBPB);
  document.body.appendChild(overlay);
  document.getElementById('modalClose').onclick = closeModal;
  document.getElementById('modalCancel').onclick = closeModal;
  overlay.onclick = (e) => { if(e.target === overlay) closeModal(); };
  overlay.querySelectorAll('[data-pick-faktur]').forEach(btn => btn.onclick = () => {
    const faktur = DATA.pembelianBPB.find(f => f.no === btn.dataset.pickFaktur);
    if(!faktur) return;
    rpApplyFaktur(row, faktur);
    document.getElementById('fRpNoFakturPembelian').value = row.noFakturPembelian;
    document.getElementById('fRpSupplier').value = row.supplier;
    document.getElementById('fRpSupplierNoFaktur').value = row.supplierNoFaktur;
    document.getElementById('fRpJurnal').value = row.jurnal;
    document.getElementById('fRpAlamat').value = row.alamatPengiriman;
    document.getElementById('fRpKeterangan').value = row.keterangan;
    refreshRpItemsDOM(row, false);
    row.jurnalAkun = [];
    refreshRpJurnalContent(row, false);
    closeModal();
  });
}

function openRpPphPicker(row){
  closeModal();
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.innerHTML = tplRpPphPicker(RP_PPH_LIST);
  document.body.appendChild(overlay);
  document.getElementById('modalClose').onclick = closeModal;
  document.getElementById('modalCancel').onclick = closeModal;
  overlay.onclick = (e) => { if(e.target === overlay) closeModal(); };
  overlay.querySelectorAll('[data-pick-pph]').forEach(btn => btn.onclick = () => {
    row.pphKode = btn.dataset.pickPph;
    row.pphPersen = +btn.dataset.pickPersen;
    rpRecalcTotals(row);
    refreshRpTotalsDOM(row);
    closeModal();
  });
}

function openRpAkunPicker(idx, row){
  closeModal();
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.innerHTML = tplRpAkunPicker(DATA.akunGL);
  document.body.appendChild(overlay);
  document.getElementById('modalClose').onclick = closeModal;
  document.getElementById('modalCancel').onclick = closeModal;
  overlay.onclick = (e) => { if(e.target === overlay) closeModal(); };

  const wireRows = () => {
    overlay.querySelectorAll('[data-rp-pick-akun]').forEach(btn => btn.onclick = () => {
      const kode = btn.dataset.rpPickAkun;
      row.jurnalAkun[idx].kodeAkun = kode;
      row.jurnalAkun[idx].namaAkun = rpAkunNama(kode);
      document.querySelector(`[data-rp-jurnal-kode="${idx}"]`).value = kode;
      document.querySelector(`[data-rp-jurnal-nama="${idx}"]`).value = rpAkunNama(kode);
      closeModal();
    });
  };
  wireRows();

  document.getElementById('rpAkunPickerSearch').oninput = (e) => {
    const q = e.target.value.trim().toLowerCase();
    const filtered = DATA.akunGL.filter(a => a.kode.toLowerCase().includes(q) || a.nama.toLowerCase().includes(q));
    document.getElementById('rpAkunPickerBody').innerHTML = tplRpAkunPickerRows(filtered);
    wireRows();
  };
}

function openRpDeleteConfirm(idx){
  closeModal();
  const row = DATA.returPembelian[idx];
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.innerHTML = tplRpDeleteConfirm(row);
  document.body.appendChild(overlay);
  document.getElementById('modalClose').onclick = closeModal;
  document.getElementById('modalCancel').onclick = closeModal;
  overlay.onclick = (e) => { if(e.target === overlay) closeModal(); };
  document.getElementById('modalDelete').onclick = () => {
    // Kosongkan lagi noReturPB pada faktur sumber (kebalikan rpSave).
    const faktur = DATA.pembelianBPB.find(f => f.no === row.noFakturPembelian);
    if(faktur && faktur.noReturPB === row.no) faktur.noReturPB = '';
    DATA.returPembelian.splice(idx, 1);
    closeModal();
    renderRpTable();
  };
}

function openRpInfo(title, text){
  closeModal();
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.innerHTML = tplRpInfoModal(title, text);
  document.body.appendChild(overlay);
  document.getElementById('modalClose').onclick = closeModal;
  document.getElementById('modalOk').onclick = closeModal;
  overlay.onclick = (e) => { if(e.target === overlay) closeModal(); };
}
