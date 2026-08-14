/* =========================================================
   LOGIC (JS saja) — Bukti Terima Barang / BPB (Supplier &
   Pembelian > Daftar Transaksi). Dimuat otomatis (lazy-load) oleh
   core.js saat menu ini pertama kali diklik — lihat PAGE_MODULES
   di js/core.js. Markup HTML-nya ada di file sebelah:
   terima-barang.template.js (tplTerimaBarangListPage/tplTbRows/
   tplTbForm/tplTbItemRow/dst, plus konstanta TB_CABANG_LIST/
   TB_CABANG_CODE yang dipakai bersama di sini).
   NB: closeModal() & openPersediaanPicker() dipakai bersama,
   didefinisikan di core.js.

   Pola CRUD: list + form FULL PAGE (sama seperti Purchase Order/
   Invoice), TIDAK ADA kalkulasi finansial (BPB hanya mencatat
   kuantitas fisik yang diterima, bukan harga — harga/nilai baru
   muncul di tahap Faktur Pembelian, tahap berikutnya di rantai
   transaksi ini yang belum dibangun). Field header & barang diisi
   otomatis begitu No. PO dipilih lewat `tbApplyPO()`, lihat catatan
   desain lengkap di komentar header terima-barang.template.js.
========================================================= */

function renderTerimaBarangPage(){
  renderTbList();
}

function renderTbList(){
  content.innerHTML = tplTerimaBarangListPage();
  document.getElementById('btnTbAdd').onclick = () => openTbForm('add');
  document.getElementById('tbFilterAll').onchange = () => {};
  document.getElementById('tbFilterPeriod').onchange = () => {};
  renderTbTable();
}

function renderTbTable(){
  const tbody = document.getElementById('tbTbody');
  const total = document.getElementById('tbTotal');
  tbody.innerHTML = tplTbRows(DATA.terimaBarang);
  total.textContent = `Total Record: ${DATA.terimaBarang.length}`;
  tbody.querySelectorAll('[data-attach]').forEach(b => b.onclick = () => openTbInfo('Attach', `Lampiran dokumen untuk Bukti Terima Barang <b>${DATA.terimaBarang[+b.dataset.attach].no}</b> akan tersedia di sini pada versi lengkap.`));
  tbody.querySelectorAll('[data-view]').forEach(b => b.onclick = () => openTbForm('view', +b.dataset.view));
  tbody.querySelectorAll('[data-cetak]').forEach(b => b.onclick = () => openTbInfo('Cetak Bukti Terima Barang', `Preview PDF Bukti Terima Barang <b>${DATA.terimaBarang[+b.dataset.cetak].no}</b> akan tersedia di sini.`));
  tbody.querySelectorAll('[data-edit]').forEach(b => b.onclick = () => openTbForm('edit', +b.dataset.edit));
  tbody.querySelectorAll('[data-del]').forEach(b => b.onclick = () => openTbDeleteConfirm(+b.dataset.del));
}

function tbGenerateNumber(cabang){
  const kode = TB_CABANG_CODE[cabang] || 'XXX';
  const seq = DATA.terimaBarang.filter(r => r.cabang === cabang).length + 1;
  return `26/BPB/${kode}/08/${String(seq).padStart(5,'0')}`;
}

function tbBuildAdditionalItem(){
  return { kode:'', nama:'', satuan:'', barcode:'', qtyPesan:0, qtyTerima:0, batasQtyTerima:0, batches:[], fromPO:false };
}

/* Mengisi header form + tabel item dari 1 baris DATA.purchaseOrder
   terpilih. Item PO (`fromPO:true`) di-lock Kode/Nama/Qty Pesan/
   Batas; Qty Terima DEFAULT = Qty Pesan (asumsi penerimaan penuh,
   user bisa turunkan kalau partial). Lihat catatan desain lengkap
   di header terima-barang.template.js. */
function tbApplyPO(row, po){
  row.noPO = po.no;
  row.cabang = po.cabang || row.cabang;
  row.cabangTarget = po.cabangTarget || po.cabang || row.cabangTarget;
  row.fob = po.fob || '';
  row.tglPO = po.tglPO || '';
  row.supplier = po.supplier || '';
  row.alamatPengiriman = po.alamatPengiriman || '';
  row.keterangan = po.keterangan || '';
  const additional = row.items.filter(it => !it.fromPO);
  const fromPoItems = (po.items || []).map(it => ({
    kode: it.kode, nama: it.nama, satuan: it.um || it.satuan || '',
    barcode: tplTbBarcode(it.kode), qtyPesan: it.qty || 0,
    qtyTerima: it.qty || 0, batasQtyTerima: it.qty || 0,
    batches: [], fromPO: true,
  }));
  row.items = [...fromPoItems, ...additional];
}

function tbSyncFormAfterPickPO(row, isAdd){
  document.getElementById('fTbFob').value = row.fob || '';
  document.getElementById('fTbTglPO').value = row.tglPO || '';
  document.getElementById('fTbSupplier').value = row.supplier || '';
  document.getElementById('fTbAlamat').value = row.alamatPengiriman || '';
  const cabangEl = document.getElementById('fTbCabang');
  const cabangTargetEl = document.getElementById('fTbCabangTarget');
  if(isAdd && row.cabang && cabangEl && cabangEl.value !== row.cabang){
    cabangEl.value = row.cabang;
    row.no = tbGenerateNumber(row.cabang);
    document.getElementById('fTbNo').value = row.no;
  }
  if(cabangTargetEl && row.cabangTarget) cabangTargetEl.value = row.cabangTarget;
  rerenderTbItemsTable(row);
}

function openTbForm(mode, idx){
  let row;
  if(mode === 'add'){
    row = {
      no: null, noPO: '', tglKedatangan: '07/08/2026', supplier: '', noSJSupplier: '', keterangan: '', status: 'Approved',
      cabang: TB_CABANG_LIST[0], cabangTarget: TB_CABANG_LIST[0], fob: '', noOtomatis: 'BPB001',
      tglPO: '', tglSJK: '07/08/2026', alamatPengiriman: '', kurs: 1, items: [],
      tglInput: '', userInput: '', tglEdit: '', userEdit: '',
    };
    row.no = tbGenerateNumber(row.cabang);
  } else {
    const src = DATA.terimaBarang[idx];
    row = { ...src, items: src.items.map(it => ({ ...it, batches: (it.batches||[]).map(b=>({...b})) })) };
  }

  content.innerHTML = tplTbForm(mode, row);
  wireTbTabs();

  if(mode === 'view'){
    document.getElementById('tbTutup').onclick = (e) => { e.preventDefault(); renderTbList(); };
    return;
  }

  const isAdd = mode === 'add';
  const btnTutorial = document.getElementById('btnTbTutorial');
  if(btnTutorial) btnTutorial.onclick = () => openTbInfo('Tutorial', 'Video tutorial pengisian Bukti Terima Barang akan tersedia di sini.');

  if(isAdd){
    document.getElementById('fTbCabang').onchange = (e) => {
      row.cabang = e.target.value;
      row.no = tbGenerateNumber(row.cabang);
      document.getElementById('fTbNo').value = row.no;
    };
    document.getElementById('tbRefreshNo').onclick = () => {
      row.no = tbGenerateNumber(document.getElementById('fTbCabang').value);
      document.getElementById('fTbNo').value = row.no;
    };
  }

  document.getElementById('tbPoSearch').onclick = () => openTbPoPicker(row, isAdd);
  document.getElementById('fTbCabangTarget').onchange = (e) => { row.cabangTarget = e.target.value; };
  document.getElementById('fTbNoSjSupplier').onchange = (e) => { row.noSJSupplier = e.target.value; };
  document.getElementById('fTbTglSjk').onchange = (e) => { row.tglSJK = e.target.value; };
  document.getElementById('fTbTglKedatangan').onchange = (e) => { row.tglKedatangan = e.target.value; };
  document.getElementById('fTbAlamat').onchange = (e) => { row.alamatPengiriman = e.target.value; };
  document.getElementById('fTbKeterangan').onchange = (e) => { row.keterangan = e.target.value; };
  document.getElementById('fTbKurs').onchange = (e) => { row.kurs = +e.target.value || 1; };

  wireTbItemEvents(row);
  document.getElementById('tbAddItem').onclick = (e) => {
    e.preventDefault();
    row.items.push(tbBuildAdditionalItem());
    rerenderTbItemsTable(row);
  };

  document.getElementById('tbBatalkan').onclick = (e) => { e.preventDefault(); renderTbList(); };
  if(!isAdd){
    document.getElementById('tbCetak').onclick = () => openTbInfo('Cetak Bukti Terima Barang', `Preview PDF Bukti Terima Barang <b>${row.no}</b> akan tersedia di sini.`);
  }

  document.getElementById('tbSimpan').onclick = () => {
    if(!row.noPO){ tbValidationError('No. PO wajib dipilih'); return; }
    const validItems = row.items.filter(it => it.kode);
    if(!validItems.length){ tbValidationError('Minimal 1 baris barang'); return; }
    for(const it of validItems){
      if(it.fromPO && (+it.qtyTerima) > (+it.batasQtyTerima)){
        tbValidationError(`Qty. Terima barang <b>${it.kode}</b> (${num(it.qtyTerima)}) tidak boleh melebihi Batas Qty. Terima (${num(it.batasQtyTerima)})`);
        return;
      }
    }

    row.cabangTarget = document.getElementById('fTbCabangTarget').value;
    row.fob = document.getElementById('fTbFob').value;
    row.noSJSupplier = document.getElementById('fTbNoSjSupplier').value;
    row.tglSJK = document.getElementById('fTbTglSjk').value;
    row.tglKedatangan = document.getElementById('fTbTglKedatangan').value;
    row.alamatPengiriman = document.getElementById('fTbAlamat').value;
    row.keterangan = document.getElementById('fTbKeterangan').value;
    row.kurs = +document.getElementById('fTbKurs').value || 1;
    row.status = 'Approved';
    row.items = validItems;

    if(isAdd){
      row.cabang = document.getElementById('fTbCabang').value;
      row.no = tbGenerateNumber(row.cabang);
      row.tglInput = row.tglKedatangan + ' ' + new Date().toTimeString().slice(0,8);
      row.userInput = 'sidik';
      DATA.terimaBarang.push(row);
    } else {
      row.tglEdit = row.tglKedatangan + ' ' + new Date().toTimeString().slice(0,8);
      row.userEdit = 'sidik';
      DATA.terimaBarang[idx] = row;
    }
    renderTbList();
  };
}

/* Tab switcher "Rincian Transaksi" / "Rincian Jurnal Akun" — pola
   sama seperti wireInvTabs() di Invoice (2 tombol toggle .active +
   toggle visibility 2 div konten). */
function wireTbTabs(){
  const btnDetail = document.getElementById('tbTabDetailBtn');
  const btnJurnal = document.getElementById('tbTabJurnalBtn');
  const contentDetail = document.getElementById('tbTabDetailContent');
  const contentJurnal = document.getElementById('tbTabJurnalContent');
  btnDetail.onclick = () => {
    btnDetail.classList.add('active'); btnJurnal.classList.remove('active');
    contentDetail.style.display = ''; contentJurnal.style.display = 'none';
  };
  btnJurnal.onclick = () => {
    btnJurnal.classList.add('active'); btnDetail.classList.remove('active');
    contentJurnal.style.display = ''; contentDetail.style.display = 'none';
  };
}

function rerenderTbItemsTable(row){
  const dis = '';
  document.getElementById('tbItemsBody').innerHTML = row.items.map((it,idx)=>tplTbItemRow(it,idx,dis)).join('');
  document.getElementById('tbItemsEmptyHint').style.display = row.items.length ? 'none' : '';
  wireTbItemEvents(row);
}

function wireTbItemEvents(row){
  row.items.forEach((item, idx) => {
    const searchBtn = document.querySelector(`[data-tb-item-search="${idx}"]`);
    const delBtn = document.querySelector(`[data-tb-item-del="${idx}"]`);
    const qtyTerimaEl = document.querySelector(`[data-tb-qtyterima="${idx}"]`);
    const batchAddBtn = document.querySelector(`[data-tb-batch-add="${idx}"]`);

    if(searchBtn) searchBtn.onclick = () => openTbItemPicker(idx, row);
    if(delBtn) delBtn.onclick = () => {
      row.items.splice(idx, 1);
      rerenderTbItemsTable(row);
    };
    if(qtyTerimaEl) qtyTerimaEl.onchange = (e) => { item.qtyTerima = +e.target.value || 0; };
    if(batchAddBtn) batchAddBtn.onclick = () => {
      item.batches = item.batches || [];
      item.batches.push({ batch:'', qty:0, exp:'' });
      document.getElementById(`tbBatchList${idx}`).innerHTML = tplTbBatchAllocRows(item, idx, '');
      wireTbBatchRowEvents(row, idx);
    };
    wireTbBatchRowEvents(row, idx);
  });
}

function wireTbBatchRowEvents(row, idx){
  const item = row.items[idx];
  if(!item || !item.batches) return;
  item.batches.forEach((b, bi) => {
    const kodeEl = document.querySelector(`[data-tb-batch-kode="${idx}:${bi}"]`);
    const qtyEl = document.querySelector(`[data-tb-batch-qty="${idx}:${bi}"]`);
    const expEl = document.querySelector(`[data-tb-batch-exp="${idx}:${bi}"]`);
    const delEl = document.querySelector(`[data-tb-batch-del="${idx}:${bi}"]`);
    if(kodeEl) kodeEl.onchange = (e) => { b.batch = e.target.value; };
    if(qtyEl) qtyEl.onchange = (e) => { b.qty = +e.target.value || 0; };
    if(expEl) expEl.onchange = (e) => { b.exp = e.target.value; };
    if(delEl) delEl.onclick = () => {
      item.batches.splice(bi, 1);
      document.getElementById(`tbBatchList${idx}`).innerHTML = tplTbBatchAllocRows(item, idx, '');
      wireTbBatchRowEvents(row, idx);
    };
  });
}

function tbValidationError(text){
  openTbInfo('Validasi', text);
}

/* Item picker untuk Additional Item — reuse popup "Daftar
   Persediaan" bersama (openPersediaanPicker, di js/core.js), sama
   pola Purchase Order/Sales Order/Picking List/dst. Item dari PO
   TIDAK lewat sini (Kode/Nama-nya locked, lihat tplTbItemRow). */
function openTbItemPicker(idx, row){
  openPersediaanPicker(row.cabang, (persed) => {
    const it = DATA.items.find(x => x.kode === persed.kodeBarang);
    const target = row.items[idx];
    target.kode = persed.kodeBarang;
    target.nama = it ? it.nama : (persed.namaBarang || '');
    target.satuan = it ? it.satuan : '';
    target.barcode = tplTbBarcode(target.kode);
    rerenderTbItemsTable(row);
  });
}

/* Popup "Pilih Purchase Order" — hanya menampilkan PO status
   "Pending Receive". Pilih 1 baris → tbApplyPO() → sinkron form +
   tabel item lewat tbSyncFormAfterPickPO(). */
function openTbPoPicker(row, isAdd){
  closeModal();
  const list = DATA.purchaseOrder.filter(po => po.status === 'Pending Receive');
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.innerHTML = tplTbPoPicker(list);
  document.body.appendChild(overlay);
  document.getElementById('modalClose').onclick = closeModal;
  document.getElementById('modalCancel').onclick = closeModal;
  overlay.onclick = (e) => { if(e.target === overlay) closeModal(); };
  overlay.querySelectorAll('[data-pick-po]').forEach(btn => btn.onclick = () => {
    const po = DATA.purchaseOrder.find(p => p.no === btn.dataset.pickPo);
    if(!po) return;
    tbApplyPO(row, po);
    document.getElementById('fTbNoPO').value = row.noPO;
    tbSyncFormAfterPickPO(row, isAdd);
    closeModal();
  });
}

function openTbDeleteConfirm(idx){
  closeModal();
  const row = DATA.terimaBarang[idx];
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.innerHTML = tplTbDeleteConfirm(row);
  document.body.appendChild(overlay);
  document.getElementById('modalClose').onclick = closeModal;
  document.getElementById('modalCancel').onclick = closeModal;
  overlay.onclick = (e) => { if(e.target === overlay) closeModal(); };
  document.getElementById('modalDelete').onclick = () => {
    DATA.terimaBarang.splice(idx, 1);
    closeModal();
    renderTbList();
  };
}

function openTbInfo(title, text){
  closeModal();
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.innerHTML = tplTbInfoModal(title, text);
  document.body.appendChild(overlay);
  document.getElementById('modalClose').onclick = closeModal;
  document.getElementById('modalOk').onclick = closeModal;
  overlay.onclick = (e) => { if(e.target === overlay) closeModal(); };
}
