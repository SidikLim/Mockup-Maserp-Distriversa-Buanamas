/* =========================================================
   LOGIC (JS saja) — Pembelian Melalui BPB (Supplier & Pembelian >
   Daftar Transaksi). Dimuat otomatis (lazy-load) oleh core.js saat
   menu ini pertama kali diklik — lihat PAGE_MODULES di js/core.js.
   Markup HTML-nya ada di file sebelah: pembelian-bpb.template.js
   (tplPembelianBPBListPage/tplPbbRows/tplPbbForm/tplPbbItemRow/dst,
   plus konstanta PBB_CABANG_LIST/PBB_SYARAT_BAYAR_LIST/PBB_PPH_LIST
   yang dipakai bersama di sini).
   NB: closeModal() dipakai bersama, didefinisikan di core.js.

   Kalkulasi tabel item & panel PPN/PPh/Ongkos Angkut/Jumlah PERSIS
   pola poRecalcItem()/poRecalcTotals() di Purchase Order (lihat
   catatan desain lengkap di header pembelian-bpb.template.js),
   ditambah field Uang Muka (Sisa Jumlah = Jumlah − Pakai) yang
   pola-nya dicontek dari Faktur Penjualan Via S.J.
========================================================= */

function renderPembelianBPBPage(){
  renderPbbList();
}

function renderPbbList(){
  content.innerHTML = tplPembelianBPBListPage();
  document.getElementById('btnPbbAdd').onclick = () => openPbbForm('add');
  document.getElementById('pbbFilterPeriod').onchange = () => {};
  renderPbbTable();
}

function renderPbbTable(){
  const tbody = document.getElementById('pbbTbody');
  const total = document.getElementById('pbbTotal');
  tbody.innerHTML = tplPbbRows(DATA.pembelianBPB);
  total.textContent = `Total Record: ${DATA.pembelianBPB.length}`;
  tbody.querySelectorAll('[data-view]').forEach(b => b.onclick = () => openPbbForm('view', +b.dataset.view));
  tbody.querySelectorAll('[data-edit]').forEach(b => b.onclick = () => openPbbForm('edit', +b.dataset.edit));
  tbody.querySelectorAll('[data-del]').forEach(b => b.onclick = () => openPbbDeleteConfirm(+b.dataset.del));
}

function pbbGenerateNumber(cabang){
  const kode = PBB_CABANG_CODE[cabang] || 'XXX';
  const seq = DATA.pembelianBPB.filter(r => r.cabang === cabang).length + 1;
  return `26/PU/${kode}/08/${String(seq).padStart(5,'0')}`;
}

function pbbRecalcItem(item){
  item.totalDisc = (+item.feeDistribusi || 0) + (+item.budgetDiskon || 0);
  item.discBarang = Math.round((+item.hargaBeli || 0) * (+item.qty || 0) * item.totalDisc / 100);
  item.jumlah = Math.round((+item.hargaBeli || 0) * (+item.qty || 0) - item.discBarang);
}

function pbbRecalcTotals(row){
  row.dpp = row.items.reduce((s,it) => s + (+it.jumlah || 0), 0);
  row.diskon1Amount = Math.round(row.dpp * (+row.diskon1 || 0) / 100);
  row.diskon2Amount = Math.round(row.dpp * (+row.diskon2 || 0) / 100);
  row.ppnAmount = (row.ppnMode === 'eksklusif') ? Math.round(row.dpp * 0.11) : 0;
  row.pajak11 = (row.ppnMode === 'eksklusif' || row.ppnMode === 'inklusif') ? 'PPN11' : '';
  row.pphAmount = row.pphAktif ? Math.round(row.dpp * (+row.pphPersen || 0) / 100) : 0;
  row.jumlahTotal = Math.round(row.dpp - row.diskon1Amount - row.diskon2Amount + row.ppnAmount - row.pphAmount + (+row.ongkosAngkut || 0));
  row.sisaJumlah = row.jumlahTotal - (+row.uangMukaPakai || 0);
}

function pbbRefreshTotalsDOM(row){
  document.getElementById('fPbbDpp').value = num(row.dpp);
  document.getElementById('fPbbDiskon1Amount').value = num(row.diskon1Amount);
  document.getElementById('fPbbDiskon2Amount').value = num(row.diskon2Amount);
  document.getElementById('fPbbPajak11').value = row.pajak11;
  document.getElementById('fPbbPpnAmount').value = num(row.ppnAmount);
  document.getElementById('fPbbPphAmount').value = num(row.pphAmount);
  document.getElementById('fPbbJumlahTotal').value = num(row.jumlahTotal);
  document.getElementById('fPbbSisaJumlah').value = num(row.sisaJumlah);
}

function pbbRefreshItemRowDOM(idx, item){
  const totalDiscEl = document.querySelector(`[data-pbb-totaldisc="${idx}"]`);
  const discBarangEl = document.querySelector(`[data-pbb-discbarang="${idx}"]`);
  const jumlahEl = document.querySelector(`[data-pbb-jumlah="${idx}"]`);
  if(totalDiscEl) totalDiscEl.value = item.totalDisc;
  if(discBarangEl) discBarangEl.value = num(item.discBarang);
  if(jumlahEl) jumlahEl.value = num(item.jumlah);
}

/* Mengisi header form + tabel item dari 1 baris DATA.terimaBarang
   terpilih (bukan DATA.purchaseOrder langsung — lihat catatan
   desain di header pembelian-bpb.template.js). Harga Beli item
   diambil dari master DATA.items (bukan dari BPB, yang memang
   tidak menyimpan harga). */
function pbbApplyBpb(row, bpb){
  row.noBPB = bpb.no;
  row.noPO = bpb.noPO;
  row.supplier = bpb.supplier;
  row.cabang = bpb.cabang || row.cabang;
  row.alamatPengiriman = bpb.alamatPengiriman || '';
  row.keterangan = `${row.noFakturPajak||''} ; SJK ${bpb.noSJSupplier||''} ; ${bpb.no}`;
  row.items = (bpb.items || []).map(it => {
    const master = DATA.items.find(x => x.kode === it.kode);
    const item = {
      kode: it.kode, nama: it.nama, qty: it.qtyTerima || 0, um: it.satuan || '',
      hargaBeli: master ? master.harga : 0, feeDistribusi: 0, budgetDiskon: 0,
      totalDisc: 0, discBarang: 0, jumlah: 0, pph: false, ppn: true,
    };
    pbbRecalcItem(item);
    return item;
  });
}

function pbbSyncFormAfterPickBpb(row, isAdd){
  document.getElementById('fPbbNoBPB').value = row.noBPB || '';
  const supplierMaster = DATA.suppliers.find(s => s.nama === row.supplier);
  document.getElementById('fPbbSupplierInfo').textContent = row.supplier ? `${row.supplier}${supplierMaster && supplierMaster.alamat ? ', '+supplierMaster.alamat : ''}` : '';
  document.getElementById('fPbbAlamat').value = row.alamatPengiriman || '';
  document.getElementById('fPbbKeterangan').value = row.keterangan || '';
  const cabangEl = document.getElementById('fPbbCabang');
  if(isAdd && row.cabang && cabangEl && cabangEl.value !== row.cabang){
    cabangEl.value = row.cabang;
    row.no = pbbGenerateNumber(row.cabang);
    document.getElementById('fPbbNo').value = row.no;
  }
  rerenderPbbItemsTable(row);
}

function openPbbForm(mode, idx){
  let row;
  if(mode === 'add'){
    row = {
      no: null, noBPB: '', noPO: '', noReturPB: '', supplier: '', keterangan: '',
      cabang: PBB_CABANG_LIST[0], noOtomatis: 'PU001',
      tglFaktur: '13/08/2026', syaratBayar: PBB_SYARAT_BAYAR_LIST[0], tglJatuhTempo: '',
      supplierNoFaktur: '', jurnal: DATA.jurnalPembelian[0].nama, alamatPengiriman: '',
      items: [], ppnMode: 'eksklusif', mataUang: 'IDR', tglFakturPajak: '13/08/2026', noFakturPajak: '',
      kurs: 1, diskon1: 0, diskon1Amount: 0, diskon2: 0, diskon2Amount: 0, dpp: 0, pajak11: 'PPN11', ppnAmount: 0,
      pphAktif: false, pphKode: '', pphPersen: 0, pphAmount: 0, ongkosAngkut: 0, jumlahTotal: 0,
      uangMukaTipe: PBB_UANG_MUKA_LIST[0], sisaUangMuka: 0, uangMukaPakai: 0, sisaJumlah: 0,
      pembayaran: 0, tglInput: '', userInput: '', tglEdit: '', userEdit: '',
    };
    row.tglJatuhTempo = pbbJatuhTempo(row.tglFaktur, row.syaratBayar);
    row.no = pbbGenerateNumber(row.cabang);
  } else {
    const src = DATA.pembelianBPB[idx];
    row = { ...src, items: src.items.map(it => ({ ...it })) };
  }

  content.innerHTML = tplPbbForm(mode, row);
  wirePbbTabs();

  if(mode === 'view'){
    document.getElementById('pbbTutup').onclick = (e) => { e.preventDefault(); renderPbbList(); };
    return;
  }

  const isAdd = mode === 'add';
  const btnTutorial = document.getElementById('btnPbbTutorial');
  if(btnTutorial) btnTutorial.onclick = () => openPbbInfo('Tutorial', 'Video tutorial pengisian Pembelian Melalui BPB akan tersedia di sini.');

  if(isAdd){
    document.getElementById('fPbbCabang').onchange = (e) => {
      row.cabang = e.target.value;
      row.no = pbbGenerateNumber(row.cabang);
      document.getElementById('fPbbNo').value = row.no;
    };
    document.getElementById('pbbRefreshNo').onclick = () => {
      row.no = pbbGenerateNumber(document.getElementById('fPbbCabang').value);
      document.getElementById('fPbbNo').value = row.no;
    };
  }

  document.getElementById('pbbBpbSearch').onclick = () => openPbbBpbPicker(row, isAdd);

  const recomputeJatuhTempo = () => {
    row.tglFaktur = document.getElementById('fPbbTglFaktur').value;
    row.syaratBayar = document.getElementById('fPbbSyaratBayar').value;
    row.tglJatuhTempo = pbbJatuhTempo(row.tglFaktur, row.syaratBayar);
    document.getElementById('fPbbTglJthTempo').value = row.tglJatuhTempo;
  };
  document.getElementById('fPbbTglFaktur').onchange = recomputeJatuhTempo;
  document.getElementById('fPbbSyaratBayar').onchange = recomputeJatuhTempo;
  document.getElementById('fPbbSupplierNoFaktur').onchange = (e) => { row.supplierNoFaktur = e.target.value; };
  document.getElementById('fPbbJurnal').onchange = (e) => { row.jurnal = e.target.value; };
  document.getElementById('fPbbAlamat').onchange = (e) => { row.alamatPengiriman = e.target.value; };
  document.getElementById('fPbbKeterangan').onchange = (e) => { row.keterangan = e.target.value; };
  document.getElementById('fPbbMataUang').onchange = (e) => { row.mataUang = e.target.value; };
  document.getElementById('fPbbTglFakturPajak').onchange = (e) => { row.tglFakturPajak = e.target.value; };
  document.getElementById('fPbbNoFakturPajak').onchange = (e) => { row.noFakturPajak = e.target.value; };

  document.getElementById('pbbPajakInfo').onclick = () => openPbbInfo('Kode Pajak', `Kode pajak yang dipakai mengikuti mode PPN yang dipilih di panel "Informasi PPN" (saat ini: ${row.pajak11 || 'tidak ada'}).`);
  document.getElementById('pbbPphSearch').onclick = () => openPbbPphPicker(row);
  document.getElementById('pbbPphClear').onclick = () => {
    row.pphAktif = false; row.pphKode = ''; row.pphPersen = 0;
    document.getElementById('fPbbPphKode').value = '';
    pbbRecalcTotals(row);
    pbbRefreshTotalsDOM(row);
  };

  document.querySelectorAll('input[name="pbbPpnMode"]').forEach(r => r.onchange = (e) => {
    row.ppnMode = e.target.value;
    pbbRecalcTotals(row);
    pbbRefreshTotalsDOM(row);
  });
  document.querySelectorAll('input[name="pbbUangMukaTipe"]').forEach(r => r.onchange = (e) => { row.uangMukaTipe = e.target.value; });

  ['fPbbKurs','fPbbDiskon1','fPbbDiskon2','fPbbOngkosAngkut','fPbbUangMukaPakai'].forEach(id => {
    document.getElementById(id).onchange = (e) => {
      const key = { fPbbKurs:'kurs', fPbbDiskon1:'diskon1', fPbbDiskon2:'diskon2', fPbbOngkosAngkut:'ongkosAngkut', fPbbUangMukaPakai:'uangMukaPakai' }[id];
      row[key] = +e.target.value || 0;
      pbbRecalcTotals(row);
      pbbRefreshTotalsDOM(row);
    };
  });

  wirePbbItemEvents(row);

  document.getElementById('pbbBatalkan').onclick = (e) => { e.preventDefault(); renderPbbList(); };
  if(!isAdd){
    document.getElementById('pbbPerbaharuiKurs').onclick = () => openPbbInfo('Perbaharui Kurs', `Mata Uang Faktur ini ${row.mataUang}, Kurs ${row.mataUang==='IDR'?'selalu 1':num(row.kurs)}. Pembaruan kurs otomatis berlaku untuk Faktur dengan mata uang asing.`);
    document.getElementById('pbbCetak').onclick = () => openPbbInfo('Cetak Pembelian Melalui BPB', `Preview PDF Faktur <b>${row.no}</b> akan tersedia di sini.`);
  }

  document.getElementById('pbbSimpan').onclick = () => {
    if(!row.noBPB){ pbbValidationError('Purchase Order / BPB wajib dipilih'); return; }
    if(!row.items.length){ pbbValidationError('Tidak ada barang untuk difakturkan'); return; }

    row.tglFaktur = document.getElementById('fPbbTglFaktur').value;
    row.syaratBayar = document.getElementById('fPbbSyaratBayar').value;
    row.tglJatuhTempo = pbbJatuhTempo(row.tglFaktur, row.syaratBayar);
    row.supplierNoFaktur = document.getElementById('fPbbSupplierNoFaktur').value;
    row.jurnal = document.getElementById('fPbbJurnal').value;
    row.alamatPengiriman = document.getElementById('fPbbAlamat').value;
    row.keterangan = document.getElementById('fPbbKeterangan').value;
    row.mataUang = document.getElementById('fPbbMataUang').value;
    row.tglFakturPajak = document.getElementById('fPbbTglFakturPajak').value;
    row.noFakturPajak = document.getElementById('fPbbNoFakturPajak').value;
    pbbRecalcTotals(row);

    if(isAdd){
      row.cabang = document.getElementById('fPbbCabang').value;
      row.no = pbbGenerateNumber(row.cabang);
      row.tglInput = row.tglFaktur + ' ' + new Date().toTimeString().slice(0,8);
      row.userInput = 'sidik';
      DATA.pembelianBPB.push(row);
    } else {
      row.tglEdit = row.tglFaktur + ' ' + new Date().toTimeString().slice(0,8);
      row.userEdit = 'sidik';
      DATA.pembelianBPB[idx] = row;
    }
    renderPbbList();
  };
}

/* Tab switcher "Rincian Transaksi" / "Rincian Jurnal Akun" — pola
   sama seperti wireInvTabs()/wireTbTabs() di Invoice/Terima Barang. */
function wirePbbTabs(){
  const btnDetail = document.getElementById('pbbTabDetailBtn');
  const btnJurnal = document.getElementById('pbbTabJurnalBtn');
  const contentDetail = document.getElementById('pbbTabDetailContent');
  const contentJurnal = document.getElementById('pbbTabJurnalContent');
  btnDetail.onclick = () => {
    btnDetail.classList.add('active'); btnJurnal.classList.remove('active');
    contentDetail.style.display = ''; contentJurnal.style.display = 'none';
  };
  btnJurnal.onclick = () => {
    btnJurnal.classList.add('active'); btnDetail.classList.remove('active');
    contentJurnal.style.display = ''; contentDetail.style.display = 'none';
  };
}

function rerenderPbbItemsTable(row){
  const dis = '';
  document.getElementById('pbbItemsBody').innerHTML = row.items.map((it,idx)=>tplPbbItemRow(it,idx,dis)).join('');
  document.getElementById('pbbItemsEmptyHint').style.display = row.items.length ? 'none' : '';
  wirePbbItemEvents(row);
  pbbRecalcTotals(row);
  pbbRefreshTotalsDOM(row);
}

function wirePbbItemEvents(row){
  row.items.forEach((item, idx) => {
    const pphCb = document.querySelector(`[data-pbb-pph="${idx}"]`);
    const ppnCb = document.querySelector(`[data-pbb-ppn="${idx}"]`);
    const hargaEl = document.querySelector(`[data-pbb-harga="${idx}"]`);
    const feeEl = document.querySelector(`[data-pbb-fee="${idx}"]`);
    const budgetEl = document.querySelector(`[data-pbb-budget="${idx}"]`);

    if(pphCb) pphCb.onchange = (e) => { item.pph = e.target.checked; };
    if(ppnCb) ppnCb.onchange = (e) => { item.ppn = e.target.checked; };
    if(hargaEl) hargaEl.onchange = (e) => {
      item.hargaBeli = +e.target.value || 0;
      pbbRecalcItem(item);
      pbbRefreshItemRowDOM(idx, item);
      pbbRecalcTotals(row);
      pbbRefreshTotalsDOM(row);
    };
    if(feeEl) feeEl.onchange = (e) => {
      item.feeDistribusi = +e.target.value || 0;
      pbbRecalcItem(item);
      pbbRefreshItemRowDOM(idx, item);
      pbbRecalcTotals(row);
      pbbRefreshTotalsDOM(row);
    };
    if(budgetEl) budgetEl.onchange = (e) => {
      item.budgetDiskon = +e.target.value || 0;
      pbbRecalcItem(item);
      pbbRefreshItemRowDOM(idx, item);
      pbbRecalcTotals(row);
      pbbRefreshTotalsDOM(row);
    };
  });
}

function pbbValidationError(text){
  openPbbInfo('Validasi', text);
}

/* Popup "Pilih Purchase Order / BPB" — sumbernya DATA.terimaBarang,
   dikeluarkan yang sudah pernah dipakai bikin Faktur (match
   DATA.pembelianBPB[].noBPB), supaya tidak dobel tagih. Pilih 1
   baris -> pbbApplyBpb() -> sinkron form + tabel item. */
function openPbbBpbPicker(row, isAdd){
  closeModal();
  const usedBpb = new Set(DATA.pembelianBPB.filter((_,i) => !(!isAdd && DATA.pembelianBPB[i] === row)).map(p => p.noBPB));
  const list = DATA.terimaBarang.filter(b => !usedBpb.has(b.no) || b.no === row.noBPB);
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.innerHTML = tplPbbBpbPicker(list);
  document.body.appendChild(overlay);
  document.getElementById('modalClose').onclick = closeModal;
  document.getElementById('modalCancel').onclick = closeModal;
  overlay.onclick = (e) => { if(e.target === overlay) closeModal(); };
  overlay.querySelectorAll('[data-pick-bpb]').forEach(btn => btn.onclick = () => {
    const bpb = DATA.terimaBarang.find(b => b.no === btn.dataset.pickBpb);
    if(!bpb) return;
    pbbApplyBpb(row, bpb);
    document.getElementById('fPbbNoPO').value = row.noPO;
    pbbSyncFormAfterPickBpb(row, isAdd);
    closeModal();
  });
}

function openPbbPphPicker(row){
  closeModal();
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.innerHTML = tplPbbPphPicker(PBB_PPH_LIST);
  document.body.appendChild(overlay);
  document.getElementById('modalClose').onclick = closeModal;
  document.getElementById('modalCancel').onclick = closeModal;
  overlay.onclick = (e) => { if(e.target === overlay) closeModal(); };
  overlay.querySelectorAll('[data-pick-pph]').forEach(btn => btn.onclick = () => {
    row.pphAktif = true;
    row.pphKode = btn.dataset.pickPph;
    row.pphPersen = +btn.dataset.pickPersen;
    document.getElementById('fPbbPphKode').value = row.pphKode;
    pbbRecalcTotals(row);
    pbbRefreshTotalsDOM(row);
    closeModal();
  });
}

function openPbbDeleteConfirm(idx){
  closeModal();
  const row = DATA.pembelianBPB[idx];
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.innerHTML = tplPbbDeleteConfirm(row);
  document.body.appendChild(overlay);
  document.getElementById('modalClose').onclick = closeModal;
  document.getElementById('modalCancel').onclick = closeModal;
  overlay.onclick = (e) => { if(e.target === overlay) closeModal(); };
  document.getElementById('modalDelete').onclick = () => {
    DATA.pembelianBPB.splice(idx, 1);
    closeModal();
    renderPbbList();
  };
}

function openPbbInfo(title, text){
  closeModal();
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.innerHTML = tplPbbInfoModal(title, text);
  document.body.appendChild(overlay);
  document.getElementById('modalClose').onclick = closeModal;
  document.getElementById('modalOk').onclick = closeModal;
  overlay.onclick = (e) => { if(e.target === overlay) closeModal(); };
}
