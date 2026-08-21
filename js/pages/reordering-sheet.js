/* =========================================================
   LOGIC (JS saja) — Reordering Sheet (Persediaan Barang > Daftar
   Transaksi > Reordering Sheet, page:'reorderingSheet'). Dimuat
   otomatis (lazy-load) oleh core.js saat menu ini pertama kali
   diklik — lihat PAGE_MODULES di js/core.js. Markup HTML-nya ada
   di file sebelah: reordering-sheet.template.js.
   NB: closeModal() & openPersediaanPicker() dipakai bersama,
   didefinisikan di core.js.

   Pola CRUD: list (page-size + Pencarian Global SUNGGUHAN + pager
   standar fungsional, mengikuti pola Master User) + form FULL PAGE
   dengan tabel rincian barang. "Generate Barang" BENAR2 membaca
   DATA.persediaan (difilter Cabang + Kat. Reordering Sheet +
   Persediaan Barang), mempertahankan kolom analisa (Forecast/Max
   Stock/Reorder/dst.) barang yang sudah ada sebelumnya, sekaligus
   me-refresh On Hand/Qty. BoPo/Available ke nilai TERKINI. "Buat
   Stock Request" adalah aksi SUNGGUHAN (bukan dekoratif): membuat 1
   baris baru DATA.stockRequest sungguhan dari barang yang kolom
   Reorder-nya > 0, lalu mengunci Ubah/Hapus baris Reordering Sheet
   ybs — rantai mundur ke modul Stock Request (lihat catatan di
   stock-request.template.js/.js, field "No. Reordering Sheet" di
   sana sekarang menunjuk ke DATA.reorderingSheet sungguhan).
========================================================= */

/* Peta Cabang -> kode singkat, SALINAN LOKAL dari SR_CABANG_CODE
   (stock-request.template.js) — TIDAK boleh direferensikan cross-
   file karena lazy-load antar modul tidak terjamin urutannya (lihat
   catatan proyek, pola sama seperti rcSspFakturTax()). Dipakai untuk
   generate No. Reordering Sheet MAUPUN No. Stock Request baru. */
const ROS_CABANG_CODE_LOCAL = {'Head Office':'HO','Surabaya':'SBY','Bandung':'BDG','Tangerang':'TGR','Medan':'MDN','Makassar':'MKS','Semarang':'SMG','Sidoarjo':'SDA'};
/* Peta Cabang -> label Gudang, SALINAN LOKAL dari SR_GUDANG_LIST
   (stock-request.template.js), untuk kebutuhan yang sama di atas. */
const ROS_GUDANG_BY_CABANG = {
  'Head Office':'(00-GUU) Gudang Utama-HO',
  'Surabaya':'(01-GSB) Gudang Surabaya',
  'Bandung':'(02-GBD) Gudang Bandung',
  'Medan':'(03-GMD) Gudang Medan',
  'Makassar':'(04-GMK) Gudang Makassar',
  'Semarang':'(05-GSM) Gudang Semarang',
  'Tangerang':'(06-GTG) Gudang Tangerang',
  'Sidoarjo':'(07-GSD) Gudang Sidoarjo',
};

let rosListState = { page:1, search:'' };

function renderReorderingSheetPage(){
  renderRosList();
}

function renderRosList(){
  content.innerHTML = tplReorderingSheetListPage();
  rosListState = { page:1, search:'' };
  document.getElementById('btnRosAdd').onclick = () => openRosForm('add');
  document.getElementById('btnRosSettingAlpha').onclick = () => openRosInfo('Setting Alpha', 'Pengaturan nilai Alpha (bobot perhitungan forecast) per kategori/barang akan tersedia di sini. (Contoh tampilan mockup)');
  document.getElementById('btnRosSettingFaktorial').onclick = () => openRosInfo('Setting Faktorial', 'Pengaturan nilai Faktorial (musiman/hari kerja) per periode akan tersedia di sini. (Contoh tampilan mockup)');
  document.getElementById('rosPageSize').onchange = () => { rosListState.page = 1; renderRosTable(); };
  document.getElementById('rosSearch').oninput = (e) => {
    rosListState.search = e.target.value.trim().toLowerCase();
    rosListState.page = 1;
    renderRosTable();
  };
  renderRosTable();
}

function rosPageSize(){
  const sel = document.getElementById('rosPageSize');
  return sel ? parseInt(sel.value, 10) : 10;
}

function rosFilteredRows(){
  const q = rosListState.search;
  if(!q) return DATA.reorderingSheet;
  return DATA.reorderingSheet.filter(r =>
    (r.no||'').toLowerCase().includes(q) ||
    (r.cabang||'').toLowerCase().includes(q) ||
    (r.userEntry||'').toLowerCase().includes(q) ||
    (r.stockRequest||'').toLowerCase().includes(q));
}

function renderRosTable(){
  const perPage = rosPageSize();
  const filtered = rosFilteredRows();
  const totalPages = Math.max(1, Math.ceil(filtered.length/perPage));
  if(rosListState.page > totalPages) rosListState.page = totalPages;
  if(rosListState.page < 1) rosListState.page = 1;

  document.getElementById('rosTbody').innerHTML = tplRosRows(filtered, rosListState.page, perPage);
  document.getElementById('rosTotal').textContent = `Total Record: ${filtered.length}`;
  document.getElementById('rosPager').innerHTML = tplRosPager(rosListState.page, totalPages);

  const tbody = document.getElementById('rosTbody');
  tbody.querySelectorAll('[data-view]').forEach(b => b.onclick = () => openRosForm('view', +b.dataset.view));
  tbody.querySelectorAll('[data-edit]').forEach(b => b.onclick = () => { if(!b.disabled) openRosForm('edit', +b.dataset.edit); });
  tbody.querySelectorAll('[data-del]').forEach(b => b.onclick = () => { if(!b.disabled) openRosDeleteConfirm(+b.dataset.del); });
  tbody.querySelectorAll('[data-print]').forEach(b => b.onclick = () => openRosInfo('Cetak Reordering Sheet', `Preview cetak dokumen Reordering Sheet <b>${DATA.reorderingSheet[+b.dataset.print].no}</b> (PDF) akan tersedia di sini. (Contoh tampilan mockup)`));
  tbody.querySelectorAll('[data-buat-sr]').forEach(b => b.onclick = () => openRosBuatStockRequestConfirm(+b.dataset.buatSr));

  const pager = document.getElementById('rosPager');
  pager.querySelectorAll('[data-rospage]').forEach(b => b.onclick = () => { rosListState.page = +b.dataset.rospage; renderRosTable(); });
}

function rosGenerateNumber(cabang){
  const kode = ROS_CABANG_CODE_LOCAL[cabang] || 'XXX';
  const seq = DATA.reorderingSheet.filter(r => r.cabang === cabang).length + 1;
  return `26/ROS/${kode}/08/${String(seq).padStart(5,'0')}`;
}

function rosEmptyRow(){
  const row = {
    no: null, tipe: ROS_TIPE_LIST[0], tglRos: '21/08/2026', periode: ROS_PERIODE_LIST[ROS_PERIODE_LIST.length-1],
    cabang: ROS_CABANG_LIST[0], metode: ROS_METODE_LIST[0], keterangan: '',
    filterPrincipal: '', filterPusatBisnis: '', filterKategoriKode: '', filterKategoriNama: '',
    filterPersediaanKode: '', filterPersediaanNama: '',
    items: [], tglInput: '', userEntry: 'sidik', stockRequest: '',
  };
  row.no = rosGenerateNumber(row.cabang);
  return row;
}

function openRosForm(mode, idx){
  let row;
  if(mode === 'add'){
    row = rosEmptyRow();
  } else {
    const src = DATA.reorderingSheet[idx];
    row = { ...src, items: src.items.map(it => ({ ...it })) };
  }

  content.innerHTML = tplReorderingSheetForm(mode, row, row.items);
  rosWireItemSearch();

  if(mode === 'view'){
    document.getElementById('rosTutup').onclick = (e) => { e.preventDefault(); renderRosList(); };
    rosWireItemInputs(row, true);
    return;
  }

  rosWireItemInputs(row, false);

  if(mode === 'add'){
    document.getElementById('fRosCabang').onchange = (e) => {
      row.cabang = e.target.value;
      row.no = rosGenerateNumber(row.cabang);
      document.getElementById('fRosNo').value = row.no;
    };
    document.getElementById('rosRefreshNo').onclick = () => {
      row.no = rosGenerateNumber(document.getElementById('fRosCabang').value);
      document.getElementById('fRosNo').value = row.no;
    };
  }

  document.getElementById('rosPrincipalSearch').onclick = () => openRosPrincipalPicker(row);
  document.getElementById('rosPusatBisnisSearch').onclick = () => openRosPusatBisnisPicker(row);
  document.getElementById('rosKategoriSearch').onclick = () => openRosKategoriPicker(row);
  document.getElementById('rosPersediaanSearch').onclick = () => openRosPersediaanPicker(row);
  document.getElementById('rosGenerateBarang').onclick = () => rosGenerateBarang(row);
  document.getElementById('rosExportImport').onclick = () => openRosInfo('Export / Import Data Detail', 'Export rincian barang ke Excel & import kembali setelah diedit offline akan tersedia di sini. (Contoh tampilan mockup)');

  document.getElementById('rosBatalkan').onclick = (e) => { e.preventDefault(); renderRosList(); };

  document.getElementById('rosSimpan').onclick = () => {
    if(!row.items.length){
      openRosInfo('Validasi', 'Klik "Generate Barang" terlebih dahulu supaya Reordering Sheet memiliki minimal 1 barang.');
      return;
    }
    row.tipe = document.getElementById('fRosTipe').value;
    row.tglRos = document.getElementById('fRosTgl').value;
    row.periode = document.getElementById('fRosPeriode').value;
    row.metode = document.getElementById('fRosMetode').value;
    row.keterangan = document.getElementById('fRosKeterangan').value;

    if(mode === 'add'){
      row.cabang = document.getElementById('fRosCabang').value;
      row.no = rosGenerateNumber(row.cabang);
      row.tglInput = row.tglRos + ' ' + new Date().toTimeString().slice(0,8);
      row.userEntry = 'sidik';
      DATA.reorderingSheet.push(row);
    } else {
      DATA.reorderingSheet[idx] = row;
    }
    renderRosList();
  };
}

/* Wiring input Forecast/Keterangan/Max Stock/Reorder per baris barang
   (pakai `onchange`, bukan `oninput`, supaya tidak kehilangan fokus
   input akibat re-render tiap ketikan — pola sama seperti wireSrItemInputs
   di stock-request.js). `dis` = true kalau mode Lihat (semua disabled,
   tidak perlu wiring apa pun). */
function rosWireItemInputs(row, dis){
  if(dis) return;
  const wrap = document.getElementById('rosItemsWrap');
  wrap.querySelectorAll('[data-ros-forecast]').forEach(inp => inp.onchange = () => {
    const ii = +inp.dataset.rosForecast;
    row.items[ii].forecast = +inp.value || 0;
    rosRefreshItemsWrap(row, false);
  });
  wrap.querySelectorAll('[data-ros-ket]').forEach(inp => inp.onchange = () => {
    const ii = +inp.dataset.rosKet;
    row.items[ii].keteranganItem = inp.value;
  });
  wrap.querySelectorAll('[data-ros-maxstock]').forEach(inp => inp.onchange = () => {
    const ii = +inp.dataset.rosMaxstock;
    const it = row.items[ii];
    it.maxStock = +inp.value || 0;
    it.shouldReorder = Math.max(0, it.maxStock - it.available);
    it.reorder = it.qtyKelipatanOrder > 0 ? Math.floor(it.shouldReorder / it.qtyKelipatanOrder) * it.qtyKelipatanOrder : it.shouldReorder;
    rosRefreshItemsWrap(row, false);
  });
  wrap.querySelectorAll('[data-ros-reorder]').forEach(inp => inp.onchange = () => {
    const ii = +inp.dataset.rosReorder;
    row.items[ii].reorder = +inp.value || 0;
  });
}

/* Render ulang HANYA tabel rincian barang (bukan seluruh form) supaya
   perubahan Max Stock/Forecast langsung tercermin di kolom Should
   Reorder/Reorder/highlight merah tanpa mengganggu field header lain. */
function rosRefreshItemsWrap(row, dis){
  document.getElementById('rosItemsWrap').innerHTML = tplRosItemsTable(row.items, dis);
  rosWireItemInputs(row, dis);
  rosApplyItemSearch();
}

/* Pencarian "Pencarian Global" pada tabel rincian barang — SUNGGUHAN
   (menyembunyikan baris <tr> yang tidak match Kode/Nama lewat CSS,
   bukan slice ulang array) supaya atribut data-ros-* (index asli di
   row.items) tetap valid, tidak perlu reindex. Dropdown page-size di
   toolbar ini SENGAJA dekoratif (jumlah barang per Reordering Sheet
   biasanya sedikit, tidak perlu paginasi sungguhan — pola dekoratif
   yang sama dipakai dropdown "Global Search" di openPersediaanPicker). */
function rosWireItemSearch(){
  const inp = document.getElementById('rosItemSearch');
  if(inp) inp.oninput = () => rosApplyItemSearch();
}
function rosApplyItemSearch(){
  const inp = document.getElementById('rosItemSearch');
  const q = inp ? inp.value.trim().toLowerCase() : '';
  document.querySelectorAll('#rosItemsBody tr').forEach(tr => {
    if(!q){ tr.style.display = ''; return; }
    tr.style.display = tr.textContent.toLowerCase().includes(q) ? '' : 'none';
  });
}

/* "Generate Barang" — BENAR2 membaca DATA.persediaan (bukan dekoratif):
   disaring Cabang (wajib) + Kat. Reordering Sheet (opsional, kode di
   row.filterKategoriKode) + Persediaan Barang (opsional, 1 kode
   spesifik di row.filterPersediaanKode). Barang yang SUDAH ada di
   row.items sebelumnya (dicocokkan lewat kode) TETAP mempertahankan
   kolom analisa (Forecast/Keterangan/Max Stock/Reorder/dst.), hanya
   On Hand/Qty. BoPo/Available yang di-refresh ke nilai TERKINI dari
   DATA.persediaan. Barang baru (belum pernah ada) mendapat kolom
   analisa default 0/kosong. */
function rosGenerateBarang(row){
  const matches = DATA.persediaan.filter(p =>
    p.cabang === row.cabang &&
    (!row.filterKategoriKode || p.kodeKategori === row.filterKategoriKode) &&
    (!row.filterPersediaanKode || p.kodeBarang === row.filterPersediaanKode));

  if(!matches.length){
    openRosInfo('Tidak Ada Barang', 'Tidak ada barang di Persediaan yang cocok dengan Cabang/Filter Kat. Reordering Sheet/Filter Persediaan Barang yang dipilih. Rincian barang sebelumnya tidak diubah.');
    return;
  }

  const existingByKode = {};
  row.items.forEach(it => { existingByKode[it.kode] = it; });

  row.items = matches.map(p => {
    const prev = existingByKode[p.kodeBarang];
    if(prev){
      return { ...prev, nama: p.namaBarang, onHand: p.qtyPhysical, qtyBoPo: p.qtyBoPo, available: p.qtyAvailable };
    }
    return {
      kode: p.kodeBarang, nama: p.namaBarang, hist:[0,0,0,0,0,0], alpha:0, faktorial:0, average:0, forecast:0,
      keteranganItem:'', salesAgt:0, onHand:p.qtyPhysical, qtyBoPo:p.qtyBoPo, outstandingDR:0, qtyBoSo:0, qtyPickingList:0,
      available:p.qtyAvailable, maxStock:0, shouldReorder:0, qtyKelipatanOrder:0, konversiKarton:1, reorder:0, pareto:'',
    };
  });

  rosRefreshItemsWrap(row, false);
}

function openRosPrincipalPicker(row){
  closeModal();
  const rows = DATA.suppliers.map(s => ({ kode:s.kode, label:s.nama }));
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.innerHTML = tplRosSimplePicker('Pilih Principal', rows);
  document.body.appendChild(overlay);
  document.getElementById('modalClose').onclick = closeModal;
  document.getElementById('modalCancel').onclick = closeModal;
  overlay.onclick = (e) => { if(e.target === overlay) closeModal(); };
  overlay.querySelectorAll('.ros-pick-row').forEach(tr => tr.onclick = () => {
    row.filterPrincipal = tr.dataset.label;
    document.getElementById('fRosPrincipal').value = row.filterPrincipal;
    closeModal();
  });
}

function openRosPusatBisnisPicker(row){
  closeModal();
  const rows = DATA.businessCentre.map(b => ({ kode:b.kode, label:b.nama }));
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.innerHTML = tplRosSimplePicker('Pilih Pusat Bisnis', rows);
  document.body.appendChild(overlay);
  document.getElementById('modalClose').onclick = closeModal;
  document.getElementById('modalCancel').onclick = closeModal;
  overlay.onclick = (e) => { if(e.target === overlay) closeModal(); };
  overlay.querySelectorAll('.ros-pick-row').forEach(tr => tr.onclick = () => {
    row.filterPusatBisnis = tr.dataset.label;
    document.getElementById('fRosPusatBisnis').value = row.filterPusatBisnis;
    closeModal();
  });
}

/* Filter Kat. Reordering Sheet — HANYA menampilkan kategori yang
   benar2 muncul di DATA.persediaan (CATSMB/CATBHB/dst.), supaya tidak
   menampilkan kategori beban/non-stok (CATNTR/CATPBB/dst.) yang tidak
   akan pernah cocok dengan barang persediaan mana pun. */
function openRosKategoriPicker(row){
  closeModal();
  const stockKodes = [...new Set(DATA.persediaan.map(p => p.kodeKategori))];
  const rows = DATA.kategoriBarang.filter(k => stockKodes.includes(k.kode)).map(k => ({ kode:k.kode, label:k.nama }));
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.innerHTML = tplRosSimplePicker('Pilih Kat. Reordering Sheet', rows);
  document.body.appendChild(overlay);
  document.getElementById('modalClose').onclick = closeModal;
  document.getElementById('modalCancel').onclick = closeModal;
  overlay.onclick = (e) => { if(e.target === overlay) closeModal(); };
  overlay.querySelectorAll('.ros-pick-row').forEach(tr => tr.onclick = () => {
    row.filterKategoriKode = tr.dataset.kode;
    row.filterKategoriNama = tr.dataset.label;
    document.getElementById('fRosKategori').value = row.filterKategoriNama;
    closeModal();
  });
}

/* Filter Persediaan Barang — REUSE penuh picker DAFTAR PERSEDIAAN
   yang sudah ada & dipakai lintas-modul (openPersediaanPicker() di
   core.js), bukan bikin picker baru, supaya paginasi/pencarian yang
   sudah sungguhan di sana ikut terpakai di sini. */
function openRosPersediaanPicker(row){
  openPersediaanPicker(row.cabang, (p) => {
    row.filterPersediaanKode = p.kodeBarang;
    row.filterPersediaanNama = p.namaBarang;
    document.getElementById('fRosPersediaan').value = p.namaBarang;
  });
}

function openRosDeleteConfirm(idx){
  closeModal();
  const row = DATA.reorderingSheet[idx];
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.innerHTML = tplRosDeleteConfirm(row);
  document.body.appendChild(overlay);
  document.getElementById('modalClose').onclick = closeModal;
  document.getElementById('modalCancel').onclick = closeModal;
  overlay.onclick = (e) => { if(e.target === overlay) closeModal(); };
  document.getElementById('modalDelete').onclick = () => {
    DATA.reorderingSheet.splice(idx, 1);
    closeModal();
    renderRosTable();
  };
}

function openRosInfo(title, text){
  closeModal();
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.innerHTML = tplRosInfoModal(title, text);
  document.body.appendChild(overlay);
  document.getElementById('modalClose').onclick = closeModal;
  document.getElementById('modalOk').onclick = closeModal;
  overlay.onclick = (e) => { if(e.target === overlay) closeModal(); };
}

/* "Buat Stock Request" — konfirmasi dulu sebelum aksi SUNGGUHAN
   (bukan dekoratif) di bawah (openRosBuatStockRequest). */
function openRosBuatStockRequestConfirm(idx){
  const row = DATA.reorderingSheet[idx];
  if(row.stockRequest){
    openRosInfo('Sudah Ada Stock Request', `Reordering Sheet <b>${row.no}</b> sudah memiliki Stock Request <b>${row.stockRequest}</b> — tidak bisa dibuat lagi.`);
    return;
  }
  const itemCount = row.items.filter(it => it.reorder > 0).length;
  if(!itemCount){
    openRosInfo('Belum Bisa Membuat Stock Request', 'Tidak ada barang dengan kolom Reorder lebih dari 0 pada Reordering Sheet ini. Buka menu Ubah, isi Max Stock/Reorder pada rincian barang, lalu coba lagi.');
    return;
  }
  closeModal();
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.innerHTML = tplRosBuatSrConfirm(row, itemCount);
  document.body.appendChild(overlay);
  document.getElementById('modalClose').onclick = closeModal;
  document.getElementById('modalCancel').onclick = closeModal;
  overlay.onclick = (e) => { if(e.target === overlay) closeModal(); };
  document.getElementById('modalBuatSr').onclick = () => {
    closeModal();
    openRosBuatStockRequest(idx);
  };
}

/* Aksi SUNGGUHAN: bikin 1 baris DATA.stockRequest baru dari barang
   Reordering Sheet ini yang kolom Reorder-nya > 0, lalu kunci Ubah/
   Hapus baris ini (row.stockRequest diisi). Rantai mundur ke modul
   Stock Request — lihat catatan di stock-request.template.js/.js. */
function openRosBuatStockRequest(idx){
  const row = DATA.reorderingSheet[idx];
  const srItems = row.items.filter(it => it.reorder > 0).map(it => {
    const pRow = DATA.persediaan.find(p => p.cabang === row.cabang && p.kodeBarang === it.kode);
    return {
      kode: it.kode, nama: it.nama, kategori: row.filterKategoriNama || 'Lainnya',
      qtyReordering: it.reorder, pilih: true, qty: it.reorder, um: pRow ? pRow.satuan : 'Pcs',
    };
  });

  const kode = ROS_CABANG_CODE_LOCAL[row.cabang] || 'XXX';
  const seq = DATA.stockRequest.filter(r => r.cabangRequest === row.cabang).length + 1;
  const srNo = `26/SR/${kode}/08/${String(seq).padStart(5,'0')}`;
  const jam = new Date().toTimeString().slice(0,8);

  const newSr = {
    no: srNo, noPO: '', tglRequest: '21/08/2026', userEntry: 'sidik', reorderingSheet: row.no,
    tipeTransaksi: 'Transfer Out', keterangan: `Dari Reordering Sheet ${row.no}`, status: 'OPEN', closedManually: false,
    cabangRequest: row.cabang, supplier: row.filterPrincipal || '',
    gudangSumber: '(00-GUU) Gudang Utama-HO', gudangTarget: ROS_GUDANG_BY_CABANG[row.cabang] || '(00-GUU) Gudang Utama-HO',
    edBulan: 0, usedInPO: false, items: srItems,
    tglInput: `21/08/2026 ${jam}`, userInput: 'sidik', tglEdit: '', userEdit: '',
  };
  DATA.stockRequest.push(newSr);
  row.stockRequest = srNo;

  openRosInfo('Stock Request Dibuat', `Stock Request <b>${srNo}</b> berhasil dibuat dari Reordering Sheet <b>${row.no}</b> (${srItems.length} barang). Reordering Sheet ini sekarang terkunci — Ubah &amp; Hapus tidak bisa dipakai lagi.`);
  renderRosTable();
}
