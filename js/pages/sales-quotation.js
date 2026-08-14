/* =========================================================
   LOGIC (JS saja) — Sales Quotation (Customer & Penjualan > Daftar
   Transaksi). Dimuat otomatis (lazy-load) oleh core.js saat menu ini
   pertama kali diklik — lihat PAGE_MODULES di js/core.js. Markup
   HTML-nya ada di file sebelah: sales-quotation.template.js.
   NB: closeModal() & openPersediaanPicker() dipakai bersama,
   didefinisikan di core.js.

   Pola CRUD: list + form FULL PAGE (sama seperti Sales Order/Purchase
   Order), dengan kalkulasi reaktif per baris item (HNA1 x Qty/Disc per
   Barang/Jumlah) DAN total dokumen (HNA1xQty/Potongan/DPP/PPN/Biaya
   Kirim/Jumlah Tagihan) — mengikuti persis pola pisah hitung-murni
   (sqRecalcItem/sqRecalcTotals, TIDAK sentuh DOM) vs update-tampilan
   (sqRefreshItemRowDOM/sqRefreshTotalsDOM) dari Purchase Order/Sales
   Order. Field finansial Customer (Credit Limit/Sisa Credit Limit/
   Belum Jatuh Tempo/Jatuh Tempo/Dominasi Limit/Sisa Dominasi Limit)
   & Rayon/Group/ID juga reaktif: langsung terisi ulang begitu Customer
   dipilih lewat picker (lihat sqApplyCustomer()).
========================================================= */

function renderSalesQuotationPage(){
  renderSqList();
}

function renderSqList(){
  content.innerHTML = tplSalesQuotationListPage();
  document.getElementById('btnSqAdd').onclick = () => openSqForm('add');
  document.getElementById('btnSqStatusFilter').onclick = () => openSqInfo('Filter Status', 'Menampilkan semua Status (Pending/Approved/Rejected). Filter per status akan tersedia pada versi lengkap.');
  document.getElementById('btnSqPeriod').onclick = () => openSqInfo('Filter Periode', 'Menampilkan Sales Quotation untuk periode Agustus 2026. Pemilihan periode lain akan tersedia pada versi lengkap.');
  renderSqTable();
}

function renderSqTable(){
  const tbody = document.getElementById('sqTbody');
  const total = document.getElementById('sqTotal');
  tbody.innerHTML = tplSqRows(DATA.salesQuotation);
  total.textContent = `Total Record: ${DATA.salesQuotation.length}`;
  tbody.querySelectorAll('[data-view]').forEach(b => b.onclick = () => openSqForm('view', +b.dataset.view));
  tbody.querySelectorAll('[data-edit]').forEach(b => b.onclick = () => openSqForm('edit', +b.dataset.edit));
  tbody.querySelectorAll('[data-del]').forEach(b => b.onclick = () => openSqDeleteConfirm(+b.dataset.del));
}

/* Format "26/SQ-0000000001" — nomor urut global 10 digit, TIDAK per-
   cabang (beda dari No. SO/No. PKL/No.IVC yang menyisipkan kode cabang)
   — persis format di screenshot MASERP yang dikirim user. */
function sqGenerateNumber(){
  const seq = DATA.salesQuotation.length + 1;
  return `26/SQ-${String(seq).padStart(10,'0')}`;
}

function sqBuildEmptyItem(){
  return { kode:'', nama:'', qty:1, um:'', hna:0, hna1:0, discPercent:0, discBarang:0, hnaXqty:0, jumlah:0 };
}

/* Kalkulasi murni 1 baris item — TIDAK menyentuh DOM. Disc/Barang
   dihitung PER UNIT (bukan total), sama pola Disc per Barang di Faktur
   Penjualan Via S.J.: Disc/Barang = HNA1 x Discount% / 100. Jumlah =
   (HNA1 - Disc/Barang) x Qty. */
function sqRecalcItem(item){
  item.hnaXqty = Math.round((+item.hna1 || 0) * (+item.qty || 0));
  item.discBarang = Math.round((+item.hna1 || 0) * (+item.discPercent || 0) / 100);
  item.jumlah = Math.max(0, Math.round(((+item.hna1 || 0) - item.discBarang) * (+item.qty || 0)));
}

function sqRefreshItemRowDOM(idx, item){
  const hnaXqtyEl = document.querySelector(`[data-sq-hnaxqty="${idx}"]`);
  const discBarangEl = document.querySelector(`[data-sq-discbarang="${idx}"]`);
  const jumlahEl = document.querySelector(`[data-sq-jumlah="${idx}"]`);
  if(discBarangEl) discBarangEl.value = num(item.discBarang);
  if(jumlahEl) jumlahEl.value = num(item.jumlah);
  if(hnaXqtyEl) hnaXqtyEl.value = num(item.hnaXqty);
}

/* Total dokumen — Potongan = total nilai diskon (Disc/Barang x Qty)
   dijumlah semua baris; DPP = total HNA1xQty - Potongan (= total
   Jumlah semua baris). PPN hanya dihitung sungguhan utk mode
   'Eksklusif' (11% dari DPP) — mode 'Inklusif'/'Non PKP' disederhanakan
   jadi 0, pola simplifikasi sama seperti ppnMode Purchase Order/typePpn
   Sales Order. Biaya Kirim diinput manual di level dokumen (bukan per
   baris, beda dari Sales Order). */
function sqRecalcTotals(row){
  row.totalHnaXqty = row.items.reduce((s,it) => s + (+it.hnaXqty || 0), 0);
  row.totalPotongan = row.items.reduce((s,it) => s + (it.discBarang || 0) * (+it.qty || 0), 0);
  row.totalDpp = Math.max(0, row.totalHnaXqty - row.totalPotongan);
  row.totalPpn = (row.typePpn === 'Eksklusif') ? Math.round(row.totalDpp * 0.11) : 0;
  row.jumlahAkhir = row.totalDpp + row.totalPpn + (+row.biayaKirim || 0);
}

function sqRefreshTotalsDOM(row){
  ['Top','Bot'].forEach(sfx => {
    const hnaXqtyEl = document.getElementById(`fSqHnaXqty${sfx}`);
    const potonganEl = document.getElementById(`fSqPotongan${sfx}`);
    const dppEl = document.getElementById(`fSqDpp${sfx}`);
    const ppnEl = document.getElementById(`fSqPpn${sfx}`);
    const jumlahEl = document.getElementById(`fSqJumlah${sfx}`);
    const typePpnEl = document.getElementById(`fSqTypePpn${sfx}`);
    const biayaKirimEl = document.getElementById(`fSqBiayaKirim${sfx}`);
    if(hnaXqtyEl) hnaXqtyEl.value = num(row.totalHnaXqty);
    if(potonganEl) potonganEl.value = num(row.totalPotongan);
    if(dppEl) dppEl.value = num(row.totalDpp);
    if(ppnEl) ppnEl.value = num(row.totalPpn);
    if(jumlahEl) jumlahEl.value = num(row.jumlahAkhir);
    if(typePpnEl) typePpnEl.value = row.typePpn;
    if(biayaKirimEl) biayaKirimEl.value = row.biayaKirim;
  });
}

/* Field finansial + Rayon/GROUP-ID — semuanya diturunkan dari Customer
   yang dipilih (lihat catatan lengkap di sales-quotation.template.js).
   `custIdx` (index di DATA.customers) dipakai utk pemetaan GROUP
   deterministik ke DATA.customerGroup. */
function sqApplyCustomer(row, customer, custIdx){
  row.customer = customer.nama;
  row.area = customer.kota;
  row.alamat = customer.alamat || '';
  const rayon = SQ_RAYON_BY_KOTA[customer.kota] || {kode:'', nama:'', district:''};
  row.rayonKode = rayon.kode; row.rayonNama = rayon.nama; row.rayonDistrict = rayon.district;
  row.idKode = customer.kode;
  row.groupKode = (DATA.customerGroup && DATA.customerGroup.length) ? DATA.customerGroup[custIdx % DATA.customerGroup.length].kode : '';
  row.creditLimit = +customer.limit || 0;
  row.sisaCreditLimit = row.creditLimit - (+customer.piutang || 0);
  row.belumJatuhTempo = Math.round((+customer.piutang || 0) * 0.7);
  row.jatuhTempo = (+customer.piutang || 0) - row.belumJatuhTempo;
  row.dominasiLimit = Math.round(row.creditLimit * 0.2);
  row.sisaDominasiLimit = row.dominasiLimit;
}

function sqRefreshCustomerFinanceDOM(row){
  document.getElementById('fSqRayonKode').value = row.rayonKode||'';
  document.getElementById('fSqRayonNama').value = row.rayonNama||'';
  document.getElementById('fSqRayonDistrict').value = row.rayonDistrict||'';
  document.getElementById('fSqGroupKode').value = row.groupKode||'';
  document.getElementById('fSqIdKode').value = row.idKode||'';
  document.getElementById('fSqCreditLimit').value = num(row.creditLimit);
  document.getElementById('fSqSisaCreditLimit').value = num(row.sisaCreditLimit);
  document.getElementById('fSqBelumJT').value = num(row.belumJatuhTempo);
  document.getElementById('fSqJatuhTempo').value = num(row.jatuhTempo);
  document.getElementById('fSqDominasiLimit').value = num(row.dominasiLimit);
  document.getElementById('fSqSisaDominasiLimit').value = num(row.sisaDominasiLimit);
}

function openSqForm(mode, idx){
  let row;
  if(mode === 'add'){
    const today = '13/08/2026';
    row = {
      no: null, noSP:'', noDSC:'', customer:'', area:'', ts:'Baru', status:'Pending',
      sOffice: SQ_SOFFICE_LIST[0], layanan: DATA.layananList[0], gudang: SQ_GUDANG_BY_CABANG[SQ_SOFFICE_LIST[0]], orderVia:'',
      alamat:'', rayonKode:'', rayonNama:'', rayonDistrict:'', groupKode:'', idKode:'',
      top:'', cppr1:0, cppr2:0, principalKode:'', principalNama:'',
      pendingDsc:false, pendingDom:false, pendingGit:false,
      tglSP:today, tglSQ:today, tglKirim:today, catatanSp:'',
      cito:false, spAsli:false, skEd:false,
      creditLimit:0, sisaCreditLimit:0, belumJatuhTempo:0, jatuhTempo:0, dominasiLimit:0, sisaDominasiLimit:0,
      keterangan:'', pecahFakturAt:0, dimensiM3:0,
      typePpn: SQ_TYPE_PPN_LIST[0], biayaKirim:0,
      items:[sqBuildEmptyItem()], totalHnaXqty:0, totalPotongan:0, totalDpp:0, totalPpn:0, jumlahAkhir:0,
      tglInput:'', userInput:'', tglEdit:'', userEdit:'',
    };
    row.no = sqGenerateNumber();
  } else {
    const src = DATA.salesQuotation[idx];
    row = { ...src, items: src.items.map(it => ({ ...it })) };
  }

  content.innerHTML = tplSqForm(mode, row);
  document.getElementById('sqActivityLog').onclick = () => openSqInfo('Activity Log', 'Riwayat perubahan dokumen Sales Quotation ini akan ditampilkan di sini.');

  if(mode === 'view'){
    document.getElementById('sqTutup').onclick = (e) => { e.preventDefault(); renderSqList(); };
    return;
  }

  const isAdd = mode === 'add';

  document.getElementById('fSqSOffice').onchange = (e) => {
    row.sOffice = e.target.value;
    const gdg = SQ_GUDANG_BY_CABANG[row.sOffice];
    if(gdg){ row.gudang = gdg; document.getElementById('fSqGudang').value = gdg; }
  };

  if(isAdd){
    document.getElementById('sqRefreshNo').onclick = () => {
      row.no = sqGenerateNumber();
      document.getElementById('fSqNo').value = row.no;
    };
  }

  document.getElementById('sqCustomerSearch').onclick = () => openSqCustomerPicker(row);
  document.getElementById('sqPrincipalSearch').onclick = () => openSqPrincipalPicker(row);
  document.getElementById('sqSpSearch').onclick = () => openSqDecorativePicker('Pilih Surat Pesanan', SQ_SP_DUMMY_LIST, 'pick-sp', (v) => {
    row.noSP = v;
    document.getElementById('fSqNoSP').value = v;
  });
  document.getElementById('sqDscSearch').onclick = () => openSqDecorativePicker('Pilih DSC', SQ_DSC_DUMMY_LIST, 'pick-dsc', (v) => {
    row.noDSC = v;
    document.getElementById('fSqNoDSC').value = v;
  });
  document.getElementById('sqUploadBtn').onclick = () => openSqInfo('Upload File', 'Fitur upload lampiran file Sales Quotation akan tersedia di sini.');
  document.getElementById('sqColumnsBtn').onclick = () => openSqInfo('Pilih Kolom', 'Pengaturan kolom tabel Rincian Barang yang ditampilkan/disembunyikan akan tersedia pada versi lengkap.');
  const refreshDplBtn = document.getElementById('sqRefreshDpl');
  if(refreshDplBtn) refreshDplBtn.onclick = () => openSqInfo('Refresh DPL', 'Menyinkronkan ulang Daftar Price List (HNA/HNA1 terbaru) dari master barang akan tersedia pada versi lengkap.');

  const typePpnBotEl = document.getElementById('fSqTypePpnBot');
  const biayaKirimBotEl = document.getElementById('fSqBiayaKirimBot');
  typePpnBotEl.onchange = () => { row.typePpn = typePpnBotEl.value; sqRecalcTotals(row); sqRefreshTotalsDOM(row); };
  biayaKirimBotEl.onchange = () => { row.biayaKirim = +biayaKirimBotEl.value || 0; sqRecalcTotals(row); sqRefreshTotalsDOM(row); };

  wireSqItemEvents(row);
  document.getElementById('sqAddItem').onclick = (e) => {
    e.preventDefault();
    row.items.push(sqBuildEmptyItem());
    rerenderSqItemsTable(row);
  };

  document.getElementById('sqBatalkan').onclick = (e) => { e.preventDefault(); renderSqList(); };

  document.getElementById('sqSimpan').onclick = () => {
    const customer = document.getElementById('fSqCustomer').value.trim();
    if(!customer){ sqValidationError('Customer wajib dipilih'); return; }
    const validItems = row.items.filter(it => it.kode && (+it.qty) > 0);
    if(!validItems.length){ sqValidationError('Minimal 1 baris barang dengan Kode Barang dan Qty lebih dari 0'); return; }

    row.customer = customer;
    row.sOffice = document.getElementById('fSqSOffice').value;
    row.area = document.getElementById('fSqArea').value || row.area;
    row.layanan = document.getElementById('fSqLayanan').value;
    row.gudang = document.getElementById('fSqGudang').value;
    row.orderVia = document.getElementById('fSqOrderVia').value;
    row.alamat = document.getElementById('fSqAlamat').value;
    row.top = document.getElementById('fSqTop').value;
    row.cppr1 = +document.getElementById('fSqCppr1').value || 0;
    row.cppr2 = +document.getElementById('fSqCppr2').value || 0;
    row.pendingDsc = document.getElementById('fSqPendingDsc').checked;
    row.pendingDom = document.getElementById('fSqPendingDom').checked;
    row.pendingGit = document.getElementById('fSqPendingGit').checked;
    row.tglSP = document.getElementById('fSqTglSP').value;
    row.tglSQ = document.getElementById('fSqTglSQ').value;
    row.tglKirim = document.getElementById('fSqTglKirim').value;
    row.catatanSp = document.getElementById('fSqCatatanSp').value;
    row.cito = document.getElementById('fSqCito').checked;
    row.spAsli = document.getElementById('fSqSpAsli').checked;
    row.skEd = document.getElementById('fSqSkEd').checked;
    row.keterangan = document.getElementById('fSqKeterangan').value;
    row.pecahFakturAt = +document.getElementById('fSqPecahFaktur').value || 0;
    row.items = validItems;
    sqRecalcTotals(row);

    if(isAdd){
      row.no = sqGenerateNumber();
      row.tglInput = row.tglSQ + ' ' + new Date().toTimeString().slice(0,8);
      row.userInput = 'sidik';
      DATA.salesQuotation.push(row);
    } else {
      row.tglEdit = row.tglSQ + ' ' + new Date().toTimeString().slice(0,8);
      row.userEdit = 'sidik';
      DATA.salesQuotation[idx] = row;
    }
    renderSqList();
  };
}

function rerenderSqItemsTable(row){
  document.getElementById('sqItemsBody').innerHTML = row.items.map((it,idx)=>tplSqItemRow(it,idx,'')).join('');
  wireSqItemEvents(row);
  sqRecalcTotals(row);
  sqRefreshTotalsDOM(row);
}

function wireSqItemEvents(row){
  row.items.forEach((item, idx) => {
    const searchBtn = document.querySelector(`[data-sq-item-search="${idx}"]`);
    const delBtn = document.querySelector(`[data-sq-item-del="${idx}"]`);
    const qtyEl = document.querySelector(`[data-sq-qty="${idx}"]`);
    const hna1El = document.querySelector(`[data-sq-hna1="${idx}"]`);
    const discEl = document.querySelector(`[data-sq-disc="${idx}"]`);

    if(searchBtn) searchBtn.onclick = () => openSqItemPicker(idx, row);
    if(delBtn) delBtn.onclick = () => {
      if(row.items.length <= 1){ sqValidationError('Minimal harus ada 1 baris barang'); return; }
      row.items.splice(idx, 1);
      rerenderSqItemsTable(row);
    };

    const recalcRow = () => {
      item.qty = qtyEl ? (+qtyEl.value || 0) : item.qty;
      item.hna1 = hna1El ? (+hna1El.value || 0) : item.hna1;
      item.discPercent = discEl ? (+discEl.value || 0) : item.discPercent;
      sqRecalcItem(item);
      sqRefreshItemRowDOM(idx, item);
      sqRecalcTotals(row);
      sqRefreshTotalsDOM(row);
    };
    [qtyEl, hna1El, discEl].forEach(el => { if(el) el.onchange = recalcRow; });
  });
}

function sqValidationError(text){
  openSqInfo('Validasi', text);
}

function openSqItemPicker(idx, row){
  // Popup "Daftar Persediaan" bersama (openPersediaanPicker, di js/core.js)
  // — filter otomatis ke Gudang Utama milik row.sOffice SQ ini, sama pola
  // openSoItemPicker()/openPoItemPicker().
  openPersediaanPicker(row.sOffice, (persed) => {
    const it = DATA.items.find(x => x.kode === persed.kodeBarang);
    const target = row.items[idx];
    target.kode = persed.kodeBarang; target.nama = persed.namaBarang; target.um = persed.satuan;
    target.hna = it ? it.harga : 0; target.hna1 = it ? it.harga : 0;
    sqRecalcItem(target);
    rerenderSqItemsTable(row);
  });
}

function openSqCustomerPicker(row){
  closeModal();
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.innerHTML = tplSqCustomerPicker(DATA.customers);
  document.body.appendChild(overlay);
  document.getElementById('modalClose').onclick = closeModal;
  document.getElementById('modalCancel').onclick = closeModal;
  overlay.onclick = (e) => { if(e.target === overlay) closeModal(); };
  overlay.querySelectorAll('[data-pick-customer]').forEach(btn => btn.onclick = () => {
    const custIdx = DATA.customers.findIndex(x => x.kode === btn.dataset.pickCustomer);
    const c = DATA.customers[custIdx];
    sqApplyCustomer(row, c, custIdx);
    document.getElementById('fSqCustomer').value = row.customer;
    document.getElementById('fSqAlamat').value = row.alamat;
    sqRefreshCustomerFinanceDOM(row);
    closeModal();
  });
}

function openSqPrincipalPicker(row){
  closeModal();
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.innerHTML = tplSqPrincipalPicker(DATA.suppliers);
  document.body.appendChild(overlay);
  document.getElementById('modalClose').onclick = closeModal;
  document.getElementById('modalCancel').onclick = closeModal;
  overlay.onclick = (e) => { if(e.target === overlay) closeModal(); };
  overlay.querySelectorAll('[data-pick-principal]').forEach(btn => btn.onclick = () => {
    const s = DATA.suppliers.find(x => x.kode === btn.dataset.pickPrincipal);
    row.principalKode = s.kode;
    row.principalNama = s.nama;
    document.getElementById('fSqPrincipal').value = s.nama;
    closeModal();
  });
}

function openSqDecorativePicker(title, list, datasetKey, onPick){
  closeModal();
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.innerHTML = tplSqDecorativePicker(title, list, datasetKey);
  document.body.appendChild(overlay);
  document.getElementById('modalClose').onclick = closeModal;
  document.getElementById('modalCancel').onclick = closeModal;
  overlay.onclick = (e) => { if(e.target === overlay) closeModal(); };
  overlay.querySelectorAll(`[data-${datasetKey}]`).forEach(btn => btn.onclick = () => {
    onPick(btn.getAttribute(`data-${datasetKey}`));
    closeModal();
  });
}

function openSqDeleteConfirm(idx){
  closeModal();
  const row = DATA.salesQuotation[idx];
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.innerHTML = tplSqDeleteConfirm(row);
  document.body.appendChild(overlay);
  document.getElementById('modalClose').onclick = closeModal;
  document.getElementById('modalCancel').onclick = closeModal;
  overlay.onclick = (e) => { if(e.target === overlay) closeModal(); };
  document.getElementById('modalDelete').onclick = () => {
    DATA.salesQuotation.splice(idx, 1);
    closeModal();
    renderSqTable();
  };
}

function openSqInfo(title, text){
  closeModal();
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.innerHTML = tplSqInfoModal(title, text);
  document.body.appendChild(overlay);
  document.getElementById('modalClose').onclick = closeModal;
  document.getElementById('modalOk').onclick = closeModal;
  overlay.onclick = (e) => { if(e.target === overlay) closeModal(); };
}
