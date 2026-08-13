/* =========================================================
   LOGIC (JS saja) — Picking List (Customer & Penjualan, page
   key 'pickingList'). Dimuat otomatis (lazy-load) oleh core.js
   saat menu ini pertama kali diklik — lihat PAGE_MODULES di
   js/core.js. Markup HTML-nya ada di file sebelah:
   picking-list.template.js (tplPickingListPage/tplPklRows/
   tplPklForm/dst, plus konstanta PKL_CABANG_LIST/PKL_GUDANG_LIST/
   PKL_GUDANG_BY_CABANG/PKL_AREA_BY_CABANG/PKL_PREFIX_LIST yang
   dipakai bersama di sini).
   NB: closeModal() dipakai bersama, didefinisikan di core.js.

   Pola CRUD: list + form FULL PAGE (sama seperti Stock Request/
   Purchase Order/Sales Order), dengan fitur khusus:
   - Aksi "Checked" di list: dual-state (icon check teal kalau
     status masih 'Waiting Request Packing' -> modal konfirmasi
     yang memajukan status ke 'Terkirim'; icon trash merah kalau
     status sudah 'Terkirim' -> modal konfirmasi yang mengembalikan
     ke 'Waiting Request Packing') — TIDAK pakai confirm() bawaan
     browser, konsisten dengan seluruh mockup ini.
   - Picker "No. S.O." mengisi BANYAK field sekaligus (Customer,
     Area, Cabang, Gudang, dan seluruh baris item) — pola yang sama
     seperti openPoSrPicker() di Purchase Order.
   - Tabel item reaktif: Qty Picking -> helper "Ready: N" & Qty Sisa
     (lihat pklRecalcItem()/pklRefreshItemRowDOM(), pola pisah
     hitung-murni/update-DOM PERSIS seperti poRecalcItem()/
     poRefreshItemRowDOM() di Purchase Order), plus alokasi Batch
     Number per baris (sub-list kecil di dalam sel, bisa
     tambah/hapus baris alokasi lewat picker "Pilih Batch").
   - Field "Picker" adalah TAG INPUT multi-value (array of string) —
     komponen UI baru di mockup ini, lihat tplPklPickerTags() &
     renderPklPickerTags() di bawah.

   RUMUS Ready & Qty Sisa (keputusan desain, didokumentasikan
   karena tidak bisa direkonsiliasi langsung dari 1 angka di
   screenshot — lihat juga komentar di DATA.batchStock, js/data.js):
   - Ready (helper teks di bawah input Qty Picking, TIDAK disimpan
     ke item.qtySisa) = SUM(qtyTersedia semua lot barang itu di
     DATA.batchStock) − SUM(qty yang SUDAH dialokasikan di baris
     item ini, item.batches[].qty). Direkalkulasi tiap kali batch
     ditambah/dihapus MAUPUN tiap kali Qty Picking berubah (walau
     Qty Picking sendiri tidak memengaruhi rumus Ready secara
     langsung — tetap dipanggil ulang dari handler yang sama demi
     kesederhanaan, sesuai instruksi).
   - Qty Sisa (item.qtySisa, kolom readonly) = untuk BATCH PERTAMA
     yang dialokasikan (item.batches[0], kalau ada): qtyTersedia
     lot itu (dicari balik di DATA.batchStock) dikurangi qty yang
     dialokasikan di batch pertama itu. Kalau belum ada batch
     dialokasikan sama sekali, qtySisa = 0. Ini interpretasi
     "sisa saldo lot itu setelah picking baris ini" — dipilih karena
     ini satu-satunya pembacaan yang bisa dibuat self-consistent dan
     mencerminkan perilaku WMS riil (Qty Sisa = stok lot yg tersisa
     di gudang setelah sebagian diambil untuk PL ini), sekaligus jadi
     satu-satunya cara supaya baris contoh index 0 (BRG-001/BRG-002)
     menghasilkan PERSIS Qty Sisa 20 & 80 seperti di screenshot.
========================================================= */

function renderPickingListPage(){
  renderPklList();
}

function renderPklList(){
  content.innerHTML = tplPickingListPage();
  document.getElementById('btnPklAdd').onclick = () => openPklForm('add');
  document.getElementById('pklStatusFilter').onchange = () => openPklInfo('Filter Status', 'Menampilkan semua status Picking List. Filter per status akan tersedia pada versi lengkap.');
  document.getElementById('pklPeriodFilter').onchange = () => openPklInfo('Filter Periode', 'Menampilkan Picking List untuk periode Agustus 2026. Pemilihan periode lain akan tersedia pada versi lengkap.');
  renderPklTable();
}

function renderPklTable(){
  const tbody = document.getElementById('pklTbody');
  const total = document.getElementById('pklTotal');
  tbody.innerHTML = tplPklRows(DATA.pickingList);
  // NB: screenshot asli menampilkan "Total Record: 500" (angka contoh/
  // dekoratif dari demo). Mockup ini SENGAJA memakai DATA.pickingList.length
  // yang sesungguhnya (9), konsisten dengan seluruh modul CRUD lain di
  // mockup ini yang semuanya menghitung Total Record dari panjang array
  // data asli, bukan angka statis.
  total.textContent = `Total Record: ${DATA.pickingList.length}`;
  tbody.querySelectorAll('[data-print]').forEach(b => b.onclick = () => openPklInfo('Cetak Picking List', `Preview PDF Picking List <b>${DATA.pickingList[+b.dataset.print].no}</b> akan tersedia di sini.`));
  tbody.querySelectorAll('[data-checked]').forEach(b => b.onclick = () => openPklCheckedConfirm(+b.dataset.checked));
  tbody.querySelectorAll('[data-revert]').forEach(b => b.onclick = () => openPklRevertConfirm(+b.dataset.revert));
  tbody.querySelectorAll('[data-edit]').forEach(b => b.onclick = () => openPklForm('edit', +b.dataset.edit));
  tbody.querySelectorAll('[data-del]').forEach(b => b.onclick = () => openPklDeleteConfirm(+b.dataset.del));
}

function pklGenerateNumber(cabang){
  const kode = PKL_CABANG_CODE[cabang] || 'XXX';
  const seq = DATA.pickingList.filter(r => r.cabang === cabang).length + 1;
  return `26/PKL/${kode}/08/${String(seq).padStart(5,'0')}`;
}

function pklBuildEmptyItem(){
  return { kode:'', nama:'', satuan:'', qtyOrder:0, qtyPicking:0, batches:[], qtySisa:0 };
}

/* ===== Kalkulasi reaktif per-baris (lihat penjelasan rumus lengkap di
   komentar header file ini) ===== */
function pklItemReady(item){
  const lots = DATA.batchStock[item.kode] || [];
  const totalTersedia = lots.reduce((s,l) => s + (+l.qtyTersedia || 0), 0);
  const totalAlokasi = (item.batches || []).reduce((s,b) => s + (+b.qty || 0), 0);
  return totalTersedia - totalAlokasi;
}

function pklRecalcItem(item){
  if(item.batches && item.batches.length){
    const first = item.batches[0];
    const lots = DATA.batchStock[item.kode] || [];
    const lot = lots.find(l => l.kode === first.kode);
    item.qtySisa = lot ? (lot.qtyTersedia - (+first.qty || 0)) : 0;
  } else {
    item.qtySisa = 0;
  }
}

function pklRefreshItemRowDOM(idx, item){
  const readyEl = document.getElementById(`pklReady${idx}`);
  if(readyEl) readyEl.textContent = `Ready: ${num(pklItemReady(item))}`;
  const sisaEl = document.querySelector(`[data-pkl-qtysisa="${idx}"]`);
  if(sisaEl) sisaEl.value = num(item.qtySisa || 0);
  const batchListEl = document.getElementById(`pklBatchList${idx}`);
  if(batchListEl) batchListEl.innerHTML = tplPklBatchAllocRows(item, idx, '');
  wirePklBatchDelButtons(idx, item);
}

/* Item yang datang dari picker "No. S.O." bawa 1 batch DEFAULT (dari
   noBatch/tglKadaluarsa yang tersimpan di baris item SO itu) dengan
   qty:0 & flag autoQty:true — flag ini bikin qty-nya OTOMATIS ikut
   nilai Qty Picking (lewat fungsi ini) SAMPAI user menambah/menghapus
   batch secara manual lewat picker "Pilih Batch" (begitu itu terjadi,
   item.batches berubah panjang/isi dan syarat "length===1 && autoQty"
   di bawah ini otomatis tidak terpenuhi lagi, jadi auto-sync berhenti
   dengan sendirinya, tanpa perlu flag tambahan untuk "matikan auto").
   Kode batch bawaan SO (noBatch) belum tentu ada di DATA.batchStock
   (lot itu independen/tidak selalu match), jadi qtySisa untuk kasus ini
   bisa jadi 0 kalau lot-nya tidak ditemukan — keterbatasan yang
   didokumentasikan, bukan bug: fokus utama rumus Qty Sisa yang presisi
   ada di baris sample yang memang dirancang manual (index 0). */
function pklSyncAutoBatchQty(item){
  if(item.batches && item.batches.length === 1 && item.batches[0].autoQty){
    item.batches[0].qty = +item.qtyPicking || 0;
  }
}

function openPklForm(mode, idx){
  let row;
  if(mode === 'add'){
    const cabang0 = PKL_CABANG_LIST[0];
    row = {
      no: null, prefix: PKL_PREFIX_LIST[0], tglBuat: '', cabang: cabang0,
      gudang: PKL_GUDANG_BY_CABANG[cabang0], area: PKL_AREA_BY_CABANG[cabang0] || '',
      customerKode:'', customerNama:'', customerAlamat:'',
      noSO:'', noSOKeterangan:'', tglSO:'',
      tglPicking:'11/08/2026', status:'Waiting Request Packing',
      picker:[], pickerChecker: DATA.pickerList[0], keterangan:'',
      items:[], tglInput:'', userInput:'', tglEdit:'', userEdit:'',
    };
    row.no = pklGenerateNumber(row.cabang);
  } else {
    const src = DATA.pickingList[idx];
    row = { ...src, picker: [...(src.picker||[])], items: src.items.map(it => ({ ...it, batches: (it.batches||[]).map(b => ({ ...b })) })) };
  }

  content.innerHTML = tplPklForm(mode, row);
  const isAdd = mode === 'add';

  document.getElementById('btnPklTutorial').onclick = () => openPklInfo('Tutorial', 'Video tutorial pengisian Picking List akan tersedia di sini.');

  if(isAdd){
    document.getElementById('fPklCabang').onchange = (e) => {
      row.cabang = e.target.value;
      row.area = PKL_AREA_BY_CABANG[row.cabang] || '';
      row.gudang = PKL_GUDANG_BY_CABANG[row.cabang] || PKL_GUDANG_LIST[0];
      row.no = pklGenerateNumber(row.cabang);
      document.getElementById('fPklArea').value = row.area;
      document.getElementById('fPklGudang').value = row.gudang;
      document.getElementById('fPklNo').value = row.no;
    };
    document.getElementById('pklRefreshNo').onclick = () => {
      row.no = pklGenerateNumber(document.getElementById('fPklCabang').value);
      document.getElementById('fPklNo').value = row.no;
    };
  }

  document.getElementById('pklSoSearch').onclick = () => openPklSoPicker(row);
  document.getElementById('pklAddPicker').onclick = (e) => { e.preventDefault(); openPklPickerAddModal(row); };
  renderPklPickerTags(row);

  wirePklItemEvents(row);
  document.getElementById('pklAddItem').onclick = (e) => {
    e.preventDefault();
    row.items.push(pklBuildEmptyItem());
    rerenderPklItemsTable(row);
  };

  document.getElementById('pklAutoFillQty').onclick = () => {
    row.items.forEach((item, idx2) => {
      item.qtyPicking = item.qtyOrder;
      pklSyncAutoBatchQty(item);
      pklRecalcItem(item);
      const qtyPickingEl = document.querySelector(`[data-pkl-qtypicking="${idx2}"]`);
      if(qtyPickingEl) qtyPickingEl.value = item.qtyPicking;
      pklRefreshItemRowDOM(idx2, item);
    });
  };

  document.getElementById('pklBatalkan').onclick = (e) => { e.preventDefault(); renderPklList(); };

  document.getElementById('pklSimpan').onclick = () => {
    if(!document.getElementById('fPklNoSO').value.trim()){ pklValidationError('No. S.O. wajib dipilih terlebih dahulu'); return; }

    row.cabang = document.getElementById('fPklCabang').value;
    row.gudang = document.getElementById('fPklGudang').value;
    row.prefix = document.getElementById('fPklPrefix').value;
    row.tglPicking = document.getElementById('fPklTgl').value;
    row.pickerChecker = document.getElementById('fPklPickerChecker').value;
    row.keterangan = document.getElementById('fPklKeterangan').value;

    if(isAdd){
      row.no = pklGenerateNumber(row.cabang);
      row.tglBuat = row.tglPicking + ' ' + new Date().toTimeString().slice(0,5);
      row.tglInput = row.tglBuat;
      row.userInput = 'sidik';
      DATA.pickingList.push(row);
    } else {
      row.tglEdit = row.tglPicking + ' ' + new Date().toTimeString().slice(0,5);
      row.userEdit = 'sidik';
      DATA.pickingList[idx] = row;
    }
    renderPklList();
  };
}

/* ===== Tag input "Picker" ===== */
function renderPklPickerTags(row){
  const box = document.getElementById('fPklPickerBox');
  if(!box) return;
  box.innerHTML = tplPklPickerTags(row.picker, false);
  box.querySelectorAll('[data-rm-picker]').forEach(btn => btn.onclick = () => {
    row.picker.splice(+btn.dataset.rmPicker, 1);
    renderPklPickerTags(row);
  });
}

function openPklPickerAddModal(row){
  closeModal();
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.innerHTML = tplPklPickerAddModal(DATA.pickerList, row.picker);
  document.body.appendChild(overlay);
  document.getElementById('modalClose').onclick = closeModal;
  document.getElementById('modalCancel').onclick = closeModal;
  overlay.onclick = (e) => { if(e.target === overlay) closeModal(); };
  overlay.querySelectorAll('[data-pick-picker]').forEach(btn => btn.onclick = () => {
    const name = btn.dataset.pickPicker;
    if(!row.picker.includes(name)) row.picker.push(name);
    renderPklPickerTags(row);
    closeModal();
  });
}

/* ===== Tabel item: wiring & rerender ===== */
function rerenderPklItemsTable(row){
  document.getElementById('pklItemsBody').innerHTML = row.items.map((it,idx) => tplPklItemRow(it,idx,'')).join('');
  wirePklItemEvents(row);
}

function wirePklBatchDelButtons(idx, item){
  document.querySelectorAll(`[data-pkl-batch-del^="${idx}:"]`).forEach(btn => {
    btn.onclick = () => {
      const bi = +btn.dataset.pklBatchDel.split(':')[1];
      item.batches.splice(bi, 1);
      pklRecalcItem(item);
      pklRefreshItemRowDOM(idx, item);
    };
  });
}

function wirePklItemEvents(row){
  row.items.forEach((item, idx) => {
    const searchBtn = document.querySelector(`[data-pkl-item-search="${idx}"]`);
    const delBtn = document.querySelector(`[data-pkl-item-del="${idx}"]`);
    const qtyPickingEl = document.querySelector(`[data-pkl-qtypicking="${idx}"]`);
    const batchSearchBtn = document.querySelector(`[data-pkl-batch-search="${idx}"]`);

    if(searchBtn) searchBtn.onclick = () => openPklItemPicker(idx, row);
    if(delBtn) delBtn.onclick = () => {
      if(row.items.length <= 1){ pklValidationError('Minimal harus ada 1 baris barang'); return; }
      row.items.splice(idx, 1);
      rerenderPklItemsTable(row);
    };
    if(batchSearchBtn) batchSearchBtn.onclick = () => openPklBatchPicker(idx, row);
    if(qtyPickingEl) qtyPickingEl.onchange = () => {
      item.qtyPicking = +qtyPickingEl.value || 0;
      pklSyncAutoBatchQty(item);
      pklRecalcItem(item);
      pklRefreshItemRowDOM(idx, item);
    };

    wirePklBatchDelButtons(idx, item);
  });
}

function pklValidationError(text){
  openPklInfo('Validasi', text);
}

function openPklItemPicker(idx, row){
  // Popup "Daftar Persediaan" bersama (openPersediaanPicker, di js/core.js)
  // menggantikan tplPklItemPicker lama sejak 2026-08-12 lanjutan lagi —
  // filter otomatis ke Gudang Utama milik row.cabang Picking List ini.
  openPersediaanPicker(row.cabang, (persed) => {
    const target = row.items[idx];
    target.kode = persed.kodeBarang; target.nama = persed.namaBarang; target.satuan = persed.satuan;
    target.batches = [];
    target.qtySisa = 0;
    rerenderPklItemsTable(row);
  });
}

function openPklBatchPicker(idx, row){
  closeModal();
  const item = row.items[idx];
  const lots = DATA.batchStock[item.kode] || [];
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.innerHTML = tplPklBatchPicker(lots, idx);
  document.body.appendChild(overlay);
  document.getElementById('modalClose').onclick = closeModal;
  document.getElementById('modalCancel').onclick = closeModal;
  overlay.onclick = (e) => { if(e.target === overlay) closeModal(); };
  overlay.querySelectorAll('[data-pick-batch]').forEach(btn => btn.onclick = () => {
    const lot = lots.find(l => l.kode === btn.dataset.pickBatch);
    if(!lot) return;
    const sudahDialokasikan = (item.batches || []).reduce((s,b) => s + (+b.qty || 0), 0);
    const sisaDibutuhkan = Math.max(0, (+item.qtyPicking || 0) - sudahDialokasikan);
    const qty = Math.min(sisaDibutuhkan, lot.qtyTersedia);
    if(!item.batches) item.batches = [];
    item.batches.push({ kode: lot.kode, qty: qty, tglExpired: lot.tglExpired });
    pklRecalcItem(item);
    pklRefreshItemRowDOM(idx, item);
    closeModal();
  });
}

/* Picker "No. S.O." — mengisi BANYAK field sekaligus: Customer (lookup
   ke DATA.customers lewat nama SO), Area & Gudang (lewat mapping per
   Cabang), Cabang itu sendiri (diset LANGSUNG ke row.sOffice SO karena
   nilai string-nya sudah sama persis dengan PKL_CABANG_LIST), dan
   seluruh baris item (dibangun dari so.items[], dengan batch DEFAULT
   dari noBatch/tglKadaluarsa yang tersimpan di tiap baris item SO itu,
   qty:0 sampai Qty Picking diisi/Auto Fill diklik — lihat
   pklSyncAutoBatchQty()). */
function openPklSoPicker(row){
  closeModal();
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.innerHTML = tplPklSoPicker(DATA.salesOrders);
  document.body.appendChild(overlay);
  document.getElementById('modalClose').onclick = closeModal;
  document.getElementById('modalCancel').onclick = closeModal;
  overlay.onclick = (e) => { if(e.target === overlay) closeModal(); };
  overlay.querySelectorAll('[data-pick-so]').forEach(btn => btn.onclick = () => {
    const so = DATA.salesOrders.find(s => s.no === btn.dataset.pickSo);
    if(!so) return;

    row.noSO = so.no;
    row.noSOKeterangan = so.keterangan || '';
    const cust = DATA.customers.find(c => c.nama === so.customer);
    if(cust){ row.customerKode = cust.kode; row.customerNama = cust.nama; row.customerAlamat = cust.alamat || ''; }
    else { row.customerKode = ''; row.customerNama = so.customer || ''; row.customerAlamat = so.alamat || ''; }

    row.cabang = so.sOffice;
    row.area = PKL_AREA_BY_CABANG[row.cabang] || '';
    row.gudang = PKL_GUDANG_BY_CABANG[row.cabang] || PKL_GUDANG_LIST[0];
    row.items = so.items.map(it => ({
      kode: it.kode, nama: it.nama, satuan: it.um, qtyOrder: it.qty, qtyPicking: 0, qtySisa: 0,
      batches: it.noBatch ? [{ kode: it.noBatch, qty: 0, tglExpired: it.tglKadaluarsa || '', autoQty: true }] : [],
    }));

    document.getElementById('fPklNoSO').value = row.noSO;
    document.getElementById('fPklKeteranganSO').value = row.noSOKeterangan;
    const cabangEl = document.getElementById('fPklCabang');
    if(cabangEl && !cabangEl.disabled) cabangEl.value = row.cabang;
    document.getElementById('fPklArea').value = row.area;
    document.getElementById('fPklGudang').value = row.gudang;
    rerenderPklItemsTable(row);
    closeModal();
  });
}

function openPklDeleteConfirm(idx){
  closeModal();
  const row = DATA.pickingList[idx];
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.innerHTML = tplPklDeleteConfirm(row);
  document.body.appendChild(overlay);
  document.getElementById('modalClose').onclick = closeModal;
  document.getElementById('modalCancel').onclick = closeModal;
  overlay.onclick = (e) => { if(e.target === overlay) closeModal(); };
  document.getElementById('modalDelete').onclick = () => {
    DATA.pickingList.splice(idx, 1);
    closeModal();
    renderPklTable();
  };
}

function openPklCheckedConfirm(idx){
  closeModal();
  const row = DATA.pickingList[idx];
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.innerHTML = tplPklConfirmModal('Checked', `Tandai Picking List <b>${row.no}</b> ini sebagai Checked dan lanjutkan ke status Terkirim?`, 'Ya, Checked');
  document.body.appendChild(overlay);
  document.getElementById('modalClose').onclick = closeModal;
  document.getElementById('modalCancel').onclick = closeModal;
  overlay.onclick = (e) => { if(e.target === overlay) closeModal(); };
  document.getElementById('modalConfirm').onclick = () => {
    row.status = 'Terkirim';
    row.tglEdit = new Date().toLocaleDateString('id-ID') + ' ' + new Date().toTimeString().slice(0,5);
    row.userEdit = 'sidik';
    closeModal();
    renderPklTable();
  };
}

function openPklRevertConfirm(idx){
  closeModal();
  const row = DATA.pickingList[idx];
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.innerHTML = tplPklConfirmModal('Batalkan Status Terkirim', `Batalkan status Terkirim dan kembalikan Picking List <b>${row.no}</b> ini ke Waiting Request Packing?`, 'Ya, Batalkan');
  document.body.appendChild(overlay);
  document.getElementById('modalClose').onclick = closeModal;
  document.getElementById('modalCancel').onclick = closeModal;
  overlay.onclick = (e) => { if(e.target === overlay) closeModal(); };
  document.getElementById('modalConfirm').onclick = () => {
    row.status = 'Waiting Request Packing';
    closeModal();
    renderPklTable();
  };
}

function openPklInfo(title, text){
  closeModal();
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.innerHTML = tplPklInfoModal(title, text);
  document.body.appendChild(overlay);
  document.getElementById('modalClose').onclick = closeModal;
  document.getElementById('modalOk').onclick = closeModal;
  overlay.onclick = (e) => { if(e.target === overlay) closeModal(); };
}
