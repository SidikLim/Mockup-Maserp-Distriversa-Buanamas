/* =========================================================
   LOGIC (JS saja) — Transaksi Persediaan (Persediaan Barang >
   Daftar Transaksi). Dimuat otomatis (lazy-load) oleh core.js saat
   menu ini pertama kali diklik — lihat PAGE_MODULES di js/core.js.
   Markup HTML-nya ada di file sebelah: transaksi-persediaan.template.js
   (tplTransaksiPersediaanListPage/tplTpRows/tplTpForm/dst, plus
   konstanta TP_TIPE_LIST/TP_CABANG_LIST/tpVisibility() yang dipakai
   bersama di sini). NB: closeModal() & openPersediaanPicker() dipakai
   bersama, didefinisikan di core.js.

   Field "Tipe Transaksi" adalah DRIVER form (persis pola Promotion
   Category/Dominasi Tipe): ganti dropdown ini → header field yang
   sudah diisi disinkron dulu dari DOM (tpSyncFormFromDOM, pola sama
   domSyncHeaderFromDOM Dominasi) sebelum badan form di-render ulang
   total (renderTpFormBody), supaya nilai umum tidak hilang.
========================================================= */

let tpState = { page:1, pageSize:10, search:'', filterTipe:'Semua' };

function renderTransaksiPersediaanPage(){
  renderTpList();
}

function renderTpList(){
  content.innerHTML = tplTransaksiPersediaanListPage();
  document.getElementById('btnTpAdd').onclick = () => openTpForm('add');
  document.getElementById('tpFilterTipeBtn').onclick = () => openTpFilterTipeMenu();
  document.getElementById('tpPeriodBtn').onclick = () => openTpInfo('Filter Periode', 'Menampilkan transaksi untuk periode Agustus 2026. Pemilihan periode lain akan tersedia pada versi lengkap.');
  document.getElementById('tpPageSize').onchange = (e) => { tpState.pageSize = +e.target.value; tpState.page = 1; renderTpTable(); };
  document.getElementById('tpSearch').oninput = (e) => { tpState.search = e.target.value; tpState.page = 1; renderTpTable(); };
  renderTpTable();
}

function tpFilteredRows(){
  const q = tpState.search.trim().toLowerCase();
  return DATA.transaksiPersediaan
    .map((r,i)=>({...r, _idx:i}))
    .filter(r => tpState.filterTipe==='Semua' || r.tipeTransaksi===tpState.filterTipe)
    .filter(r => !q || [r.no,r.noReferensi,r.stockRequest,r.keterangan,r.tipeTransaksi].join(' ').toLowerCase().includes(q))
    .sort((a,b)=> (b.tglTrnSort||0) - (a.tglTrnSort||0));
}

function renderTpTable(){
  const all = tpFilteredRows();
  const totalPages = Math.max(1, Math.ceil(all.length / tpState.pageSize));
  if(tpState.page > totalPages) tpState.page = totalPages;
  const start = (tpState.page-1) * tpState.pageSize;
  const pageRows = all.slice(start, start+tpState.pageSize);
  document.getElementById('tpTbody').innerHTML = tplTpRows(pageRows);
  document.getElementById('tpPager').innerHTML = tplTpPager(tpState.page, totalPages);
  document.getElementById('tpTotal').textContent = `Total Record: ${all.length}`;
  document.querySelectorAll('#tpPager [data-tp-page]').forEach(b => b.onclick = () => { tpState.page = +b.dataset.tpPage; renderTpTable(); });
  document.querySelectorAll('[data-tp-open],[data-tp-edit]').forEach(b => b.onclick = () => openTpForm('edit', +(b.dataset.tpOpen ?? b.dataset.tpEdit)));
  document.querySelectorAll('[data-tp-view]').forEach(b => b.onclick = () => openTpForm('view', +b.dataset.tpView));
  document.querySelectorAll('[data-tp-print]').forEach(b => b.onclick = () => openTpInfo('Cetak Transaksi Persediaan', `Preview cetak dokumen <b>${DATA.transaksiPersediaan[+b.dataset.tpPrint].no}</b> (PDF) akan tersedia di sini.`));
  document.querySelectorAll('[data-tp-del]').forEach(b => b.onclick = () => openTpDeleteConfirm(+b.dataset.tpDel));
}

function openTpFilterTipeMenu(){
  closeModal();
  const opts = ['Semua', ...TP_TIPE_LIST];
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.innerHTML = `
    <div class="modal-box" style="max-width:340px;">
      <div class="modal-header">Filter Tipe Transaksi<span class="close" id="modalClose">&times;</span></div>
      <div class="modal-body">
        ${opts.map(o=>`<div style="padding:8px 4px;cursor:pointer;font-size:13px;${o===tpState.filterTipe?'font-weight:700;color:var(--blue);':''}" data-tp-filter-pick="${o}">${o}</div>`).join('')}
      </div>
    </div>`;
  document.body.appendChild(overlay);
  document.getElementById('modalClose').onclick = closeModal;
  overlay.onclick = (e) => { if(e.target===overlay) closeModal(); };
  overlay.querySelectorAll('[data-tp-filter-pick]').forEach(d => d.onclick = () => {
    tpState.filterTipe = d.dataset.tpFilterPick; tpState.page = 1; closeModal(); renderTpTable();
  });
}

/* Format: <tipe-prefix>-<KODECABANG> — 26/OUT-HO/08/00001,
   26/TSS-HO/08/00011, 26/TPB-HO/08/00001, 26/WRO-HO/08/00003,
   26/PMA-HO/08/00001 (persis contoh di 4 screenshot form acuan). */
function tpGenerateNumber(tipe, cabang){
  const prefix = TP_TIPE_PREFIX[tipe] || 'TRX';
  const kode = TP_CABANG_CODE[cabang] || 'HO';
  const seq = DATA.transaksiPersediaan.filter(r => r.tipeTransaksi===tipe && r.cabang===cabang).length + 1;
  return `26/${prefix}-${kode}/08/${String(seq).padStart(5,'0')}`;
}

function tpEmptyRow(){
  const cabang = TP_CABANG_LIST[0];
  const gudangHO = `(${DATA.gudang[0].kode}) ${DATA.gudang[0].nama}`;
  return {
    cabang, no:'', noReferensi:'', stockRequest:'', deliveryRequestCabang:'', noSjSupplier:'',
    tglTrn:'24/08/2026', tipeTransaksi:'Transfer Stock', statusPengeluaran:TP_STATUS_PENGELUARAN_LIST[0],
    gudangSumber:gudangHO, gudangTarget:gudangHO, retur:false, jurnal:'', keterangan:'',
    userInput:'sidik', locked:false, approved:true, cetakanKe:0, items:[],
  };
}

function tpEmptyItem(){
  return { noRequest:'', itemRequest:'', kode:'', nama:'', ket:'', kodeTarget:'', namaTarget:'', qty:0, um:'', harga:0, jumlah:0, batches:[] };
}

function tpRecalcItem(it){
  it.jumlah = (Number(it.harga)||0) * (Number(it.qty)||0);
}

function openTpForm(mode, idx){
  const row = mode==='add' ? tpEmptyRow() : {...DATA.transaksiPersediaan[idx]};
  if(mode==='add') row.no = tpGenerateNumber(row.tipeTransaksi, row.cabang);
  row._idx = idx;
  renderTpFormFull(mode, row);
}

function renderTpFormFull(mode, row){
  content.innerHTML = tplTpForm(mode, row);
  wireTpTabs();
  document.getElementById('tpBatalkan') && (document.getElementById('tpBatalkan').onclick = (e) => { e.preventDefault(); renderTpList(); });
  document.getElementById('tpTutupView') && (document.getElementById('tpTutupView').onclick = (e) => { e.preventDefault(); renderTpList(); });
  if(mode==='view' || row.locked){
    return; // semua field sudah disabled lewat template, tidak ada handler edit lagi
  }
  const btnTutorial = document.getElementById('btnTpTutorial');
  if(btnTutorial) btnTutorial.onclick = () => openTpInfo('Tutorial', 'Video tutorial pengisian Transaksi Persediaan akan tersedia di sini.');

  document.getElementById('fTpCabang').onchange = (e) => {
    row.cabang = e.target.value;
    if(mode==='add') { row.no = tpGenerateNumber(row.tipeTransaksi, row.cabang); document.getElementById('fTpNo').value = row.no; }
  };
  document.getElementById('tpRegenBtn') && (document.getElementById('tpRegenBtn').onclick = () => {
    row.no = tpGenerateNumber(row.tipeTransaksi, row.cabang);
    document.getElementById('fTpNo').value = row.no;
  });
  document.getElementById('fTpTglTrn').onchange = (e) => row.tglTrn = e.target.value;
  document.getElementById('fTpKeterangan').onchange = (e) => row.keterangan = e.target.value;

  document.getElementById('fTpTipe').onchange = (e) => {
    tpSyncFormFromDOM(row, mode);
    row.tipeTransaksi = e.target.value;
    row.no = tpGenerateNumber(row.tipeTransaksi, row.cabang);
    row.jurnal = tpJurnalAuto(row.tipeTransaksi, row.cabang);
    if(row.tipeTransaksi!=='Transfer In' && row.tipeTransaksi!=='Transfer Out'){ row.stockRequest=''; }
    renderTpFormFull(mode, row);
  };

  wireTpStockRequestRow(row, mode);
  wireTpGudangFields(row, mode);
  wireTpItemsPanel(row, mode);

  document.getElementById('tpSimpan').onclick = () => tpSave(row, mode, false);
  document.getElementById('tpCetakSimpan') && (document.getElementById('tpCetakSimpan').onclick = () => tpSave(row, mode, true));
}

function tpSyncFormFromDOM(row, mode){
  const g = (id) => document.getElementById(id);
  if(g('fTpKeterangan')) row.keterangan = g('fTpKeterangan').value;
  if(g('fTpTglTrn')) row.tglTrn = g('fTpTglTrn').value;
  if(g('fTpNoSjSupplier')) row.noSjSupplier = g('fTpNoSjSupplier').value;
  if(g('fTpGudangSumber')) row.gudangSumber = g('fTpGudangSumber').value;
  if(g('fTpGudangTarget')) row.gudangTarget = g('fTpGudangTarget').value;
  if(g('fTpRetur')) row.retur = g('fTpRetur').checked;
  if(g('fTpStatusPengeluaran')) row.statusPengeluaran = g('fTpStatusPengeluaran').value;
}

function wireTpStockRequestRow(row, mode){
  const btnPick = document.getElementById('tpSrPickBtn');
  const btnClear = document.getElementById('tpSrClearBtn');
  const noSj = document.getElementById('fTpNoSjSupplier');
  if(noSj) noSj.onchange = (e) => row.noSjSupplier = e.target.value;
  if(btnPick) btnPick.onclick = () => openTpSrPicker(row, mode);
  if(btnClear) btnClear.onclick = () => {
    row.stockRequest = ''; row.items = row.items.filter(it=>!it.noRequest);
    renderTpFormFull(mode, row);
  };
}

function openTpSrPicker(row, mode){
  closeModal();
  const rows = DATA.stockRequest.filter(r => r.cabangRequest===row.cabang && !r.transferOutDibuat);
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.innerHTML = tplTpSrPickerModal(rows);
  document.body.appendChild(overlay);
  document.getElementById('modalClose').onclick = closeModal;
  overlay.onclick = (e) => { if(e.target===overlay) closeModal(); };
  overlay.querySelectorAll('[data-tp-sr-pick]').forEach(tr => tr.onclick = () => {
    tpApplyStockRequest(row, rows[+tr.dataset.tpSrPick]);
    closeModal();
    renderTpFormFull(mode, row);
  });
}

function tpApplyStockRequest(row, sr){
  row.stockRequest = sr.no;
  const gudangHO = `(${DATA.gudang[0].kode}) ${DATA.gudang[0].nama}`;
  const gTarget = DATA.gudang.find(g => g.default && g.cabang===sr.cabangRequest);
  row.gudangSumber = gudangHO;
  row.gudangTarget = gTarget ? `(${gTarget.kode}) ${gTarget.nama}` : gudangHO;
  row.items = sr.items.map(it => ({
    noRequest: sr.no, itemRequest: it.nama, kode: it.kode, nama: it.nama, ket:'',
    kodeTarget:'', namaTarget:'', qty: it.qty, um: it.um, harga:0, jumlah:0, batches:[],
  }));
}

function wireTpGudangFields(row, mode){
  const gs = document.getElementById('fTpGudangSumber');
  const gt = document.getElementById('fTpGudangTarget');
  const ret = document.getElementById('fTpRetur');
  const stp = document.getElementById('fTpStatusPengeluaran');
  if(gs) gs.onchange = (e) => row.gudangSumber = e.target.value;
  if(gt) gt.onchange = (e) => row.gudangTarget = e.target.value;
  if(ret) ret.onchange = (e) => row.retur = e.target.checked;
  if(stp) stp.onchange = (e) => row.statusPengeluaran = e.target.value;
}

function wireTpTabs(){
  const btnItems = document.getElementById('tpTabItemsBtn');
  const btnJurnal = document.getElementById('tpTabJurnalBtn');
  const contentItems = document.getElementById('tpTabItemsContent');
  const contentJurnal = document.getElementById('tpTabJurnalContent');
  btnItems.onclick = () => {
    btnItems.classList.add('active'); btnJurnal.classList.remove('active');
    contentItems.style.display=''; contentJurnal.style.display='none';
  };
  btnJurnal.onclick = () => {
    btnJurnal.classList.add('active'); btnItems.classList.remove('active');
    contentJurnal.style.display=''; contentItems.style.display='none';
  };
}

/* Rincian Jurnal Akun — 2 baris auto per Tipe Transaksi, reuse akun
   Persediaan Barang Dagang Jakarta (1130001)/Persediaan Barang
   Intransit (1130002) yang sudah ada di DATA.akunGL (sama akun yang
   dipakai auto-jurnal Invoice). Informasional/readonly saja — mockup
   ini tidak memvalidasi balance jurnal transaksi persediaan. */
function tpJurnalLines(row){
  const nilai = tpTotalJumlah(row) || 0;
  const dagang = { kodeAkun:'1130001', namaAkun:'Persediaan Barang Dagang Jakarta' };
  const intransit = { kodeAkun:'1130002', namaAkun:'Persediaan Barang Intransit' };
  const ket = row.no || '(belum disimpan)';
  switch(row.tipeTransaksi){
    case 'Transfer Out':
      return [
        {...intransit, keterangan:ket, debit: nilai||0, kredit:0},
        {...dagang, keterangan:ket, debit:0, kredit: nilai||0},
      ];
    case 'Transfer In':
      return [
        {...dagang, keterangan:ket, debit: nilai||0, kredit:0},
        {...intransit, keterangan:ket, debit:0, kredit: nilai||0},
      ];
    case 'Pemasukkan':
      return [
        {...dagang, keterangan:ket, debit: tpTotalJumlah(row), kredit:0},
        {kodeAkun:'6510003', namaAkun:'Selisih Debit Kredit', keterangan:ket, debit:0, kredit: tpTotalJumlah(row)},
      ];
    case 'Pengeluaran':
      return [
        {kodeAkun:'6510003', namaAkun:'Selisih Debit Kredit', keterangan:ket, debit:0, kredit:0},
        {...dagang, keterangan:ket, debit:0, kredit:0},
      ];
    default:
      return [
        {...dagang, keterangan:ket, debit:0, kredit:0},
        {...dagang, keterangan:ket, debit:0, kredit:0},
      ];
  }
}

/* =========================================================
   TABEL ITEM
========================================================= */
function wireTpItemsPanel(row, mode){
  wireTpItemRows(row, mode);
  const addBtn = document.getElementById('tpAddItemRow');
  if(addBtn) addBtn.onclick = (e) => {
    e.preventDefault();
    row.items.push(tpEmptyItem());
    refreshTpItemsPanel(row, mode);
  };
}

function refreshTpItemsPanel(row, mode){
  document.getElementById('tpTabItemsContent').innerHTML = tplTpItemsPanel(mode, row);
  wireTpItemsPanel(row, mode);
  refreshTpJurnalPanel(row);
  const jt = document.getElementById('fTpJumlahTransaksi');
  // (Jumlah Transaksi field, kalau ada, sudah ikut ter-render ulang lewat field-table di luar panel item —
  // di-refresh lewat renderTpFormFull kalau perlu; untuk update ringan cukup lewat items panel saja.)
}

function refreshTpJurnalPanel(row){
  const el = document.getElementById('tpTabJurnalContent');
  if(el) el.innerHTML = tplTpJurnalPanel(row);
}

function wireTpItemRows(row, mode){
  const dis = mode==='view' || row.locked;
  if(dis) return;
  const v = tpVisibility(row.tipeTransaksi);
  document.querySelectorAll('[data-tp-ket]').forEach(inp => inp.onchange = (e) => { row.items[+inp.dataset.tpKet].ket = e.target.value; });
  document.querySelectorAll('[data-tp-qty]').forEach(inp => inp.onchange = (e) => {
    const it = row.items[+inp.dataset.tpQty];
    it.qty = +e.target.value || 0;
    if(v.showHargaJumlahCol){ tpRecalcItem(it); refreshTpItemsPanel(row, mode); }
  });
  document.querySelectorAll('[data-tp-harga]').forEach(inp => inp.onchange = (e) => {
    const it = row.items[+inp.dataset.tpHarga];
    it.harga = +e.target.value || 0;
    tpRecalcItem(it);
    refreshTpItemsPanel(row, mode);
  });
  document.querySelectorAll('[data-tp-item-search]').forEach(b => b.onclick = () => {
    const idx = +b.dataset.tpItemSearch;
    openPersediaanPicker(row.cabang, (p) => {
      const it = row.items[idx];
      it.kode = p.kodeBarang; it.nama = p.namaBarang; it.um = p.satuan;
      const master = DATA.items.find(m=>m.kode===p.kodeBarang);
      if(v.showHargaJumlahCol){ it.harga = master ? master.harga : 0; tpRecalcItem(it); }
      closeModal();
      refreshTpItemsPanel(row, mode);
    });
  });
  document.querySelectorAll('[data-tp-target-search]').forEach(b => b.onclick = () => {
    const idx = +b.dataset.tpTargetSearch;
    openPersediaanPicker(row.cabang, (p) => {
      const it = row.items[idx];
      it.kodeTarget = p.kodeBarang; it.namaTarget = p.namaBarang;
      closeModal();
      refreshTpItemsPanel(row, mode);
    });
  });
  document.querySelectorAll('[data-tp-item-del]').forEach(b => b.onclick = () => {
    row.items.splice(+b.dataset.tpItemDel, 1);
    refreshTpItemsPanel(row, mode);
  });
  document.querySelectorAll('[data-tp-batch-add]').forEach(b => b.onclick = () => {
    const idx = +b.dataset.tpBatchAdd;
    row.items[idx].batches = row.items[idx].batches || [];
    row.items[idx].batches.push({batch:'', qty:0, exp:''});
    document.getElementById(`tpBatchList${idx}`).innerHTML = tplTpBatchAllocRows(row.items[idx], idx, '');
    wireTpBatchRowEvents(row, mode);
  });
  wireTpBatchRowEvents(row, mode);
}

function wireTpBatchRowEvents(row, mode){
  document.querySelectorAll('[data-tp-batch-kode]').forEach(inp => inp.onchange = (e) => {
    const [idx,bi] = inp.dataset.tpBatchKode.split(':').map(Number);
    row.items[idx].batches[bi].batch = e.target.value;
  });
  document.querySelectorAll('[data-tp-batch-qty]').forEach(inp => inp.onchange = (e) => {
    const [idx,bi] = inp.dataset.tpBatchQty.split(':').map(Number);
    row.items[idx].batches[bi].qty = +e.target.value || 0;
  });
  document.querySelectorAll('[data-tp-batch-exp]').forEach(inp => inp.onchange = (e) => {
    const [idx,bi] = inp.dataset.tpBatchExp.split(':').map(Number);
    row.items[idx].batches[bi].exp = e.target.value;
  });
  document.querySelectorAll('[data-tp-batch-del]').forEach(b => b.onclick = () => {
    const [idx,bi] = b.dataset.tpBatchDel.split(':').map(Number);
    row.items[idx].batches.splice(bi,1);
    document.getElementById(`tpBatchList${idx}`).innerHTML = tplTpBatchAllocRows(row.items[idx], idx, '');
    wireTpBatchRowEvents(row, mode);
  });
}

/* =========================================================
   SIMPAN / HAPUS
========================================================= */
function tpSave(row, mode, alsoPrint){
  tpSyncFormFromDOM(row, mode);
  row.jurnal = tpJurnalAuto(row.tipeTransaksi, row.cabang);
  if(!row.items.length){ openTpInfo('Validasi', 'Isi minimal 1 baris barang sebelum menyimpan.'); return; }
  const idx = row._idx;
  const saved = {...row};
  delete saved._idx;
  if(mode==='add'){ DATA.transaksiPersediaan.unshift(saved); }
  else { DATA.transaksiPersediaan[idx] = saved; }
  if(alsoPrint) openTpInfo('Cetak dan Simpan', `Transaksi <b>${saved.no}</b> berhasil disimpan. Preview cetak (PDF) akan tersedia di sini.`);
  renderTpList();
}

function openTpDeleteConfirm(idx){
  closeModal();
  const row = DATA.transaksiPersediaan[idx];
  if(row.locked){ openTpInfo('Tidak Bisa Dihapus', `Transaksi <b>${row.no}</b> terkunci (berasal dari BPB/Terima Barang), tidak bisa dihapus.`); return; }
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.innerHTML = tplTpDeleteConfirm(row.no);
  document.body.appendChild(overlay);
  document.getElementById('modalClose').onclick = closeModal;
  document.getElementById('modalClose2').onclick = (e) => { e.preventDefault(); closeModal(); };
  overlay.onclick = (e) => { if(e.target===overlay) closeModal(); };
  document.getElementById('modalDelete').onclick = () => {
    DATA.transaksiPersediaan.splice(idx,1);
    closeModal();
    renderTpList();
  };
}

function openTpInfo(title, msg){
  closeModal();
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.innerHTML = tplTpInfoModal(title, msg);
  document.body.appendChild(overlay);
  document.getElementById('modalClose').onclick = closeModal;
  overlay.onclick = (e) => { if(e.target===overlay) closeModal(); };
}
