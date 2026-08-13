/* =========================================================
   LOGIC (JS saja) — Purchase Order (Supplier & Pembelian >
   Daftar Transaksi). Dimuat otomatis (lazy-load) oleh core.js
   saat menu ini pertama kali diklik — lihat PAGE_MODULES di
   js/core.js. Markup HTML-nya ada di file sebelah:
   purchase-order.template.js (tplPurchaseOrderListPage/tplPoRows/
   tplPoForm/dst, plus konstanta PO_CABANG_LIST/PO_GUDANG_LIST/dst
   yang dipakai bersama di sini).
   NB: closeModal() dipakai bersama, didefinisikan di core.js.

   Pola CRUD: list + form FULL PAGE (sama seperti Jurnal Pembelian/
   Stock Request), dengan tambahan: tabel rincian barang yang
   kolom-kolom kalkulasinya (Total Disc%, Disc/Barang, Jumlah) dan
   panel "Rincian Transaksi" (DPP/PPN/PPh/Jumlah) re-kalkulasi
   otomatis tiap kali Qty/Harga Beli/Fee/Budget Diskon/Diskon 1-2/
   Ongkos Angkut/PPh/mode PPN berubah — mirip kalkulator, bukan
   cuma tampilan statis.
========================================================= */
const PO_CABANG_CODE = {'Head Office':'HO','Surabaya':'SBY','Bandung':'BDG','Medan':'MDN','Makassar':'MKS','Semarang':'SMG','Tangerang':'TGR','Sidoarjo':'SDA'};
const PO_GUDANG_TO_CABANG = {
  'Gudang Utama-HO':'Head Office','Gudang Surabaya':'Surabaya','Gudang Bandung':'Bandung','Gudang Medan':'Medan',
  'Gudang Makassar':'Makassar','Gudang Semarang':'Semarang','Gudang Tangerang':'Tangerang','Gudang Sidoarjo':'Sidoarjo',
};

function renderPurchaseOrderPage(){
  renderPoList();
}

function renderPoList(){
  content.innerHTML = tplPurchaseOrderListPage();
  document.getElementById('btnPoAdd').onclick = () => openPoForm('add');
  document.getElementById('btnPoStatusFilter').onclick = () => openPoInfo('Filter Status', 'Menampilkan semua status Purchase Order. Filter per status (Pending Receive/Received/Cancelled) akan tersedia pada versi lengkap.');
  document.getElementById('btnPoPeriod').onclick = () => openPoInfo('Filter Periode', 'Menampilkan Purchase Order untuk periode Agustus 2026. Pemilihan periode lain akan tersedia pada versi lengkap.');
  renderPoTable();
}

function renderPoTable(){
  const tbody = document.getElementById('poTbody');
  const total = document.getElementById('poTotal');
  tbody.innerHTML = tplPoRows(DATA.purchaseOrder);
  total.textContent = `Total Record: ${DATA.purchaseOrder.length}`;
  tbody.querySelectorAll('[data-view]').forEach(b => b.onclick = () => openPoForm('view', +b.dataset.view));
  tbody.querySelectorAll('[data-edit]').forEach(b => b.onclick = () => openPoForm('edit', +b.dataset.edit));
  tbody.querySelectorAll('[data-del]').forEach(b => b.onclick = () => openPoDeleteConfirm(+b.dataset.del));
  tbody.querySelectorAll('[data-cetak]').forEach(b => b.onclick = () => openPoCetak(+b.dataset.cetak));
}

function poGenerateNumber(cabang){
  const kode = PO_CABANG_CODE[cabang] || 'XXX';
  const seq = DATA.purchaseOrder.filter(r => r.cabang === cabang).length + 1;
  return `26/PO/${kode}/08/${String(seq).padStart(5,'0')}`;
}

function poBuildEmptyItem(){
  return { kode:'', nama:'', qty:1, um:'', hargaBeli:0, feeDistribusi:0, budgetDiskon:0, totalDisc:0, discBarang:0, jumlah:0, pph:true };
}

function poRecalcItem(item){
  item.totalDisc = (+item.feeDistribusi || 0) + (+item.budgetDiskon || 0);
  item.discBarang = Math.round((+item.hargaBeli || 0) * (+item.qty || 0) * item.totalDisc / 100);
  item.jumlah = Math.round((+item.hargaBeli || 0) * (+item.qty || 0) - item.discBarang);
}

/* Rekalkulasi total DPP/Diskon/PPN/PPh/Jumlah Akhir. Mode PPN
   "Tidak ada PPN"/"PPN Tidak Dipungut Pajak" disederhanakan jadi
   ppnAmount=0 (tanpa ekstraksi PPN-inklusif dari harga) — simplifikasi
   wajar untuk mockup, konsisten dengan penyederhanaan field cascading
   region di form Master Supplier. */
function poRecalcTotals(row){
  row.dpp = row.items.reduce((s,it) => s + (+it.jumlah || 0), 0);
  row.diskon1Amount = Math.round(row.dpp * (+row.diskon1 || 0) / 100);
  row.diskon2Amount = Math.round(row.dpp * (+row.diskon2 || 0) / 100);
  row.ppnAmount = (row.ppnMode === 'eksklusif') ? Math.round(row.dpp * 0.11) : 0;
  row.pajak11 = (row.ppnMode === 'eksklusif' || row.ppnMode === 'inklusif') ? 'PPN11' : '';
  row.pphAmount = row.pphAktif ? Math.round(row.dpp * (+row.pphPersen || 0) / 100) : 0;
  row.jumlahTotal = Math.round(row.dpp - row.diskon1Amount - row.diskon2Amount + row.ppnAmount - row.pphAmount + (+row.ongkosAngkut || 0));
}

function poRefreshTotalsDOM(row){
  document.getElementById('fPoDpp').value = num(row.dpp);
  document.getElementById('fPoDiskon1Amount').value = num(row.diskon1Amount);
  document.getElementById('fPoDiskon2Amount').value = num(row.diskon2Amount);
  document.getElementById('fPoPajak11').value = row.pajak11;
  document.getElementById('fPoPpnAmount').value = num(row.ppnAmount);
  document.getElementById('fPoPphAmount').value = num(row.pphAmount);
  document.getElementById('fPoJumlahTotal').value = num(row.jumlahTotal);
}

function poRefreshItemRowDOM(idx, item){
  const totalDiscEl = document.querySelector(`[data-po-totaldisc="${idx}"]`);
  const discBarangEl = document.querySelector(`[data-po-discbarang="${idx}"]`);
  const jumlahEl = document.querySelector(`[data-po-jumlah="${idx}"]`);
  if(totalDiscEl) totalDiscEl.value = item.totalDisc;
  if(discBarangEl) discBarangEl.value = num(item.discBarang);
  if(jumlahEl) jumlahEl.value = num(item.jumlah);
}

function openPoForm(mode, idx){
  let row;
  if(mode === 'add'){
    row = {
      no: null, noPR: '', tglPO: '07/08/2026', supplier: '', keterangan: '', status: 'Pending Receive', cetakanKe: 0,
      cabang: PO_CABANG_LIST[0], cabangTarget: PO_CABANG_LIST[0], typePO: PO_TYPE_LIST[0], noStockRequest: '', fob: '', shipVia: PO_SHIP_VIA_LIST[0], cito: false,
      noOtomatis: 'PO001', etd: '07/08/2026', noSoIndent: '', syaratBayar: PO_SYARAT_BAYAR_LIST[0], gudang: PO_GUDANG_LIST[0], gudangTarget: PO_GUDANG_LIST[0],
      jurnalBPB: DATA.jurnalPembelian[0].nama, alamatPengiriman: PO_ALAMAT_BY_CABANG[PO_CABANG_LIST[0]] || '',
      items: [poBuildEmptyItem()], ppnMode: 'eksklusif', mataUang: 'IDR', kurs: 1, diskon1: 0, diskon1Amount: 0, diskon2: 0, diskon2Amount: 0,
      dpp: 0, pajak11: 'PPN11', ppnAmount: 0, pphAktif: false, pphKode: '', pphPersen: 0, pphAmount: 0, ongkosAngkut: 0, jumlahTotal: 0,
      tglInput: '', userInput: '', tglEdit: '', userEdit: '',
    };
    row.no = poGenerateNumber(row.cabang);
  } else {
    const src = DATA.purchaseOrder[idx];
    row = { ...src, items: src.items.map(it => ({ ...it })) };
  }

  content.innerHTML = tplPoForm(mode, row);

  if(mode === 'view'){
    document.getElementById('poTutup').onclick = (e) => { e.preventDefault(); renderPoList(); };
    return;
  }

  const isAdd = mode === 'add';

  if(isAdd){
    document.getElementById('fPoCabang').onchange = (e) => {
      row.cabang = e.target.value;
      row.cabangTarget = row.cabang;
      document.getElementById('fPoCabangTarget').value = row.cabangTarget;
      row.no = poGenerateNumber(row.cabang);
      document.getElementById('fPoNo').value = row.no;
    };
    document.getElementById('poRefreshNo').onclick = () => {
      row.no = poGenerateNumber(document.getElementById('fPoCabang').value);
      document.getElementById('fPoNo').value = row.no;
    };
  }

  document.getElementById('poSrSearch').onclick = () => openPoSrPicker(row);
  document.getElementById('poSrClear').onclick = () => {
    row.noStockRequest = '';
    document.getElementById('fPoNoSr').value = '';
  };
  document.getElementById('poUploadBtn').onclick = () => openPoInfo('Upload File', 'Fitur upload lampiran file Purchase Order akan tersedia di sini.');
  document.getElementById('fPoGudangTarget').onchange = (e) => {
    row.gudangTarget = e.target.value;
    const cabangTujuan = PO_GUDANG_TO_CABANG[row.gudangTarget];
    if(cabangTujuan && PO_ALAMAT_BY_CABANG[cabangTujuan]){
      row.alamatPengiriman = PO_ALAMAT_BY_CABANG[cabangTujuan];
      document.getElementById('fPoAlamat').value = row.alamatPengiriman;
    }
  };
  document.getElementById('poSupplierSearch').onclick = () => openPoSupplierPicker(row);
  document.getElementById('poSoIndentInfo').onclick = () => openPoInfo('S.O. Indent', 'Pencarian Sales Order Indent akan tersedia setelah modul Sales Order Indent dibuat.');
  document.getElementById('poPajakInfo').onclick = () => openPoInfo('Kode Pajak', `Kode pajak yang dipakai mengikuti mode PPN yang dipilih di panel "Informasi PPN" (saat ini: ${row.pajak11 || 'tidak ada'}).`);
  document.getElementById('poPphSearch').onclick = () => openPoPphPicker(row);
  document.getElementById('poPphClear').onclick = () => {
    row.pphAktif = false; row.pphKode = ''; row.pphPersen = 0;
    document.getElementById('fPoPphKode').value = '';
    poRecalcTotals(row);
    poRefreshTotalsDOM(row);
  };

  document.querySelectorAll('input[name="poPpnMode"]').forEach(r => r.onchange = (e) => {
    row.ppnMode = e.target.value;
    poRecalcTotals(row);
    poRefreshTotalsDOM(row);
  });

  ['fPoKurs','fPoDiskon1','fPoDiskon2','fPoOngkosAngkut'].forEach(id => {
    document.getElementById(id).onchange = (e) => {
      const key = { fPoKurs:'kurs', fPoDiskon1:'diskon1', fPoDiskon2:'diskon2', fPoOngkosAngkut:'ongkosAngkut' }[id];
      row[key] = +e.target.value || 0;
      poRecalcTotals(row);
      poRefreshTotalsDOM(row);
    };
  });

  wirePoItemEvents(row);
  document.getElementById('poAddItem').onclick = (e) => {
    e.preventDefault();
    row.items.push(poBuildEmptyItem());
    rerenderPoItemsTable(row);
  };

  document.getElementById('poBatalkan').onclick = (e) => { e.preventDefault(); renderPoList(); };
  if(!isAdd){
    document.getElementById('poPerbaharuiKurs').onclick = () => openPoInfo('Perbaharui Kurs', 'Mata Uang PO ini IDR, Kurs selalu 1. Pembaruan kurs otomatis berlaku untuk PO dengan mata uang asing (USD, dst).');
    document.getElementById('poCetak').onclick = () => openPoCetak(idx, row);
  }

  document.getElementById('poSimpan').onclick = () => {
    const supplier = document.getElementById('fPoSupplier').value.trim();
    if(!supplier){ poValidationError('Supplier wajib dipilih'); return; }
    const validItems = row.items.filter(it => it.kode && (+it.qty) > 0);
    if(!validItems.length){ poValidationError('Minimal 1 baris barang dengan Kode Barang dan Qty lebih dari 0'); return; }

    row.supplier = supplier;
    row.cabangTarget = document.getElementById('fPoCabangTarget').value;
    row.typePO = document.getElementById('fPoTypePO').value;
    row.fob = document.getElementById('fPoFob').value;
    row.shipVia = document.getElementById('fPoShipVia').value;
    row.cito = document.getElementById('fPoCito').checked;
    row.tglPO = document.getElementById('fPoTgl').value;
    row.etd = document.getElementById('fPoEtd').value;
    row.syaratBayar = document.getElementById('fPoSyaratBayar').value;
    row.gudang = document.getElementById('fPoGudang').value;
    row.gudangTarget = document.getElementById('fPoGudangTarget').value;
    row.alamatPengiriman = document.getElementById('fPoAlamat').value;
    row.jurnalBPB = document.getElementById('fPoJurnalBPB').value;
    row.items = validItems;
    row.keterangan = row.noStockRequest ? `${row.noStockRequest} - ${row.keterangan || row.supplier}` : (row.keterangan || '');
    poRecalcTotals(row);

    if(isAdd){
      row.cabang = document.getElementById('fPoCabang').value;
      row.no = poGenerateNumber(row.cabang);
      row.tglInput = row.tglPO + ' ' + new Date().toTimeString().slice(0,8);
      row.userInput = 'sidik';
      DATA.purchaseOrder.push(row);
    } else {
      row.tglEdit = row.tglPO + ' ' + new Date().toTimeString().slice(0,8);
      row.userEdit = 'sidik';
      DATA.purchaseOrder[idx] = row;
    }
    renderPoList();
  };
}

function rerenderPoItemsTable(row){
  const dis = '';
  document.getElementById('poItemsBody').innerHTML = row.items.map((it,idx)=>tplPoItemRow(it,idx,dis)).join('');
  wirePoItemEvents(row);
  poRecalcTotals(row);
  poRefreshTotalsDOM(row);
}

function wirePoItemEvents(row){
  row.items.forEach((item, idx) => {
    const kodeInput = document.querySelector(`[data-po-kode="${idx}"]`);
    const searchBtn = document.querySelector(`[data-po-item-search="${idx}"]`);
    const delBtn = document.querySelector(`[data-po-item-del="${idx}"]`);
    const pphCb = document.querySelector(`[data-po-pph="${idx}"]`);
    const namaEl = document.querySelector(`[data-po-nama="${idx}"]`);
    const qtyEl = document.querySelector(`[data-po-qty="${idx}"]`);
    const hargaEl = document.querySelector(`[data-po-harga="${idx}"]`);
    const feeEl = document.querySelector(`[data-po-fee="${idx}"]`);
    const budgetEl = document.querySelector(`[data-po-budget="${idx}"]`);

    if(searchBtn) searchBtn.onclick = () => openPoItemPicker(idx, row);
    if(delBtn) delBtn.onclick = () => {
      if(row.items.length <= 1){ poValidationError('Minimal harus ada 1 baris barang'); return; }
      row.items.splice(idx, 1);
      rerenderPoItemsTable(row);
    };
    if(pphCb) pphCb.onchange = () => { item.pph = pphCb.checked; };
    if(namaEl) namaEl.onchange = () => { item.nama = namaEl.value; };
    [qtyEl, hargaEl, feeEl, budgetEl].forEach(el => {
      if(!el) return;
      el.onchange = () => {
        item.qty = qtyEl ? (+qtyEl.value || 0) : item.qty;
        item.hargaBeli = hargaEl ? (+hargaEl.value || 0) : item.hargaBeli;
        item.feeDistribusi = feeEl ? (+feeEl.value || 0) : item.feeDistribusi;
        item.budgetDiskon = budgetEl ? (+budgetEl.value || 0) : item.budgetDiskon;
        poRecalcItem(item);
        poRefreshItemRowDOM(idx, item);
        poRecalcTotals(row);
        poRefreshTotalsDOM(row);
      };
    });
  });
}

function poValidationError(text){
  openPoInfo('Validasi', text);
}

function openPoItemPicker(idx, row){
  // Popup "Daftar Persediaan" bersama (openPersediaanPicker, di js/core.js)
  // menggantikan tplPoItemPicker lama sejak 2026-08-12 lanjutan lagi —
  // filter otomatis ke Gudang Utama milik row.cabang PO ini.
  openPersediaanPicker(row.cabang, (persed) => {
    const it = DATA.items.find(x => x.kode === persed.kodeBarang);
    const target = row.items[idx];
    target.kode = persed.kodeBarang; target.nama = persed.namaBarang;
    target.hargaBeli = it ? it.harga : 0; target.um = persed.satuan;
    poRecalcItem(target);
    rerenderPoItemsTable(row);
  });
}

function openPoSupplierPicker(row){
  closeModal();
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.innerHTML = tplPoSupplierPicker(DATA.suppliers);
  document.body.appendChild(overlay);
  document.getElementById('modalClose').onclick = closeModal;
  document.getElementById('modalCancel').onclick = closeModal;
  overlay.onclick = (e) => { if(e.target === overlay) closeModal(); };
  overlay.querySelectorAll('[data-pick-supplier]').forEach(btn => btn.onclick = () => {
    row.supplier = btn.dataset.pickSupplier;
    document.getElementById('fPoSupplier').value = row.supplier;
    closeModal();
  });
}

function openPoSrPicker(row){
  closeModal();
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.innerHTML = tplPoSrPicker(DATA.stockRequest);
  document.body.appendChild(overlay);
  document.getElementById('modalClose').onclick = closeModal;
  document.getElementById('modalCancel').onclick = closeModal;
  overlay.onclick = (e) => { if(e.target === overlay) closeModal(); };
  overlay.querySelectorAll('[data-pick-sr]').forEach(btn => btn.onclick = () => {
    row.noStockRequest = btn.dataset.pickSr;
    document.getElementById('fPoNoSr').value = row.noStockRequest;
    document.getElementById('fPoNoRef').value = row.noStockRequest;
    closeModal();
  });
}

function openPoPphPicker(row){
  closeModal();
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.innerHTML = tplPoPphPicker(PO_PPH_LIST);
  document.body.appendChild(overlay);
  document.getElementById('modalClose').onclick = closeModal;
  document.getElementById('modalCancel').onclick = closeModal;
  overlay.onclick = (e) => { if(e.target === overlay) closeModal(); };
  overlay.querySelectorAll('[data-pick-pph]').forEach(btn => btn.onclick = () => {
    row.pphAktif = true;
    row.pphKode = btn.dataset.pickPph;
    row.pphPersen = +btn.dataset.pickPersen;
    document.getElementById('fPoPphKode').value = row.pphKode;
    poRecalcTotals(row);
    poRefreshTotalsDOM(row);
    closeModal();
  });
}

function openPoDeleteConfirm(idx){
  closeModal();
  const row = DATA.purchaseOrder[idx];
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.innerHTML = tplPoDeleteConfirm(row);
  document.body.appendChild(overlay);
  document.getElementById('modalClose').onclick = closeModal;
  document.getElementById('modalCancel').onclick = closeModal;
  overlay.onclick = (e) => { if(e.target === overlay) closeModal(); };
  document.getElementById('modalDelete').onclick = () => {
    DATA.purchaseOrder.splice(idx, 1);
    closeModal();
    renderPoTable();
  };
}

function openPoCetak(idx, liveRow){
  closeModal();
  const row = liveRow || DATA.purchaseOrder[idx];
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.innerHTML = tplPoCetakModal(row);
  document.body.appendChild(overlay);
  document.getElementById('modalClose').onclick = closeModal;
  document.getElementById('modalCancel').onclick = closeModal;
  overlay.onclick = (e) => { if(e.target === overlay) closeModal(); };
  document.getElementById('modalCetak').onclick = () => {
    DATA.purchaseOrder[idx].cetakanKe = (DATA.purchaseOrder[idx].cetakanKe || 0) + 1;
    if(liveRow) liveRow.cetakanKe = DATA.purchaseOrder[idx].cetakanKe;
    closeModal();
    if(document.getElementById('poTbody')) renderPoTable();
  };
}

function openPoInfo(title, text){
  closeModal();
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.innerHTML = tplPoInfoModal(title, text);
  document.body.appendChild(overlay);
  document.getElementById('modalClose').onclick = closeModal;
  document.getElementById('modalOk').onclick = closeModal;
  overlay.onclick = (e) => { if(e.target === overlay) closeModal(); };
}
