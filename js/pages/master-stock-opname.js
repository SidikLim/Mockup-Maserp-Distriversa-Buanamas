/* =========================================================
   LOGIC (JS saja) — Master Stock Opname (Persediaan Barang >
   Daftar Transaksi > Master Stock Opname, page:'masterStockOpname').
   Dimuat otomatis (lazy-load) oleh core.js saat menu ini pertama
   kali diklik — lihat PAGE_MODULES di js/core.js. Markup HTML-nya
   ada di file sebelah: master-stock-opname.template.js (baca
   komentar header di sana dulu utk konteks lengkap keputusan desain).
   NB: closeModal() & openPersediaanPicker() dipakai bersama,
   didefinisikan di core.js.
========================================================= */

let msoListState = { page:1, search:'' };
let msoItemPage = 1;

function renderMasterStockOpnamePage(){
  renderMsoList();
}

function renderMsoList(){
  content.innerHTML = tplMsoListPage();
  msoListState = { page:1, search:'' };
  document.getElementById('btnMsoAdd').onclick = () => openMsoForm('add');
  document.getElementById('btnMsoLaporanBantu').onclick = () => openMsoLaporanBantu();
  document.getElementById('msoPageSize').onchange = () => { msoListState.page = 1; renderMsoTable(); };
  document.getElementById('msoSearch').oninput = (e) => {
    msoListState.search = e.target.value.trim().toLowerCase();
    msoListState.page = 1;
    renderMsoTable();
  };
  renderMsoTable();
}

function msoPageSize(){
  const sel = document.getElementById('msoPageSize');
  return sel ? parseInt(sel.value, 10) : 10;
}

function msoFilteredRows(){
  const q = msoListState.search;
  if(!q) return DATA.masterStockOpname;
  return DATA.masterStockOpname.filter(r =>
    (r.no||'').toLowerCase().includes(q) ||
    (r.keterangan||'').toLowerCase().includes(q) ||
    (r.cabang||'').toLowerCase().includes(q));
}

function renderMsoTable(){
  const perPage = msoPageSize();
  const filtered = msoFilteredRows();
  const totalPages = Math.max(1, Math.ceil(filtered.length/perPage));
  if(msoListState.page > totalPages) msoListState.page = totalPages;
  if(msoListState.page < 1) msoListState.page = 1;

  document.getElementById('msoTbody').innerHTML = tplMsoRows(filtered, msoListState.page, perPage);
  document.getElementById('msoTotal').textContent = `Total: ${filtered.length}`;
  document.getElementById('msoPager').innerHTML = tplMsoPager(msoListState.page, totalPages);

  const tbody = document.getElementById('msoTbody');
  tbody.querySelectorAll('[data-view]').forEach(b => b.onclick = () => openMsoForm('view', +b.dataset.view));
  tbody.querySelectorAll('[data-edit]').forEach(b => b.onclick = () => openMsoForm('edit', +b.dataset.edit));
  tbody.querySelectorAll('[data-del]').forEach(b => b.onclick = () => openMsoDeleteConfirm(+b.dataset.del));
  tbody.querySelectorAll('[data-print]').forEach(b => b.onclick = () => openMsoPrintResult(+b.dataset.print));

  const pager = document.getElementById('msoPager');
  pager.querySelectorAll('[data-msopage]').forEach(b => b.onclick = () => { msoListState.page = +b.dataset.msopage; renderMsoTable(); });
}

function msoGenerateNumber(cabang){
  const kode = MSO_CABANG_CODE[cabang] || 'XXX';
  const seq = DATA.masterStockOpname.filter(r => r.cabang === cabang).length + 1;
  return `26/MSO/${kode}/08/${String(seq).padStart(5,'0')}`;
}

function msoEmptyRow(){
  const cabang = MSO_CABANG_LIST[0];
  return {
    no: msoGenerateNumber(cabang), cabang,
    tglTransaksi: '27/08/2026 00:00:00', periodeAwal: '27/08/2026', periodeAkhir: '27/08/2026',
    keterangan: '', filterGudangKode: '', filterGudangNama: '', filterItemKode: '', filterItemNama: '',
    items: [], userEntry: 'sidik',
  };
}

function openMsoForm(mode, idx){
  let row;
  if(mode === 'add'){
    row = msoEmptyRow();
  } else {
    const src = DATA.masterStockOpname[idx];
    row = { ...src, items: src.items.map(it => ({ ...it })) };
  }
  msoItemPage = 1;

  content.innerHTML = tplMsoForm(mode, row);

  if(mode === 'view'){
    document.getElementById('msoTutup').onclick = (e) => { e.preventDefault(); renderMsoList(); };
    return;
  }

  msoWireItemInputs(row, false);

  if(mode === 'add'){
    document.getElementById('fMsoCabang').onchange = (e) => {
      row.cabang = e.target.value;
      row.no = msoGenerateNumber(row.cabang);
      document.getElementById('fMsoNo').value = row.no;
      row.filterGudangKode = ''; row.filterGudangNama = '';
      document.getElementById('fMsoGudang').innerHTML = `<option value="">- Pilih Gudang -</option>${msoGudangOptionsForCabang(row.cabang, '')}`;
    };
  }

  document.getElementById('fMsoGudang').onchange = (e) => {
    const g = DATA.gudang.find(x => x.kode === e.target.value);
    row.filterGudangKode = g ? g.kode : '';
    row.filterGudangNama = g ? g.nama : '';
    // ganti Gudang membuat filter Item Barang yang sudah dipilih (kalau ada, dari gudang lain) tidak relevan lagi
    row.filterItemKode = ''; row.filterItemNama = '';
    document.getElementById('fMsoItem').value = '';
  };

  document.getElementById('msoItemSearch').onclick = () => {
    if(!row.filterGudangKode){
      openMsoInfo('Pilih Gudang Dulu', 'Pilih Filter Gudang terlebih dahulu sebelum mencari barang, supaya daftar barang yang tampil sudah sesuai gudang yang dipilih.');
      return;
    }
    openPersediaanPicker(row.cabang, (p) => {
      if(p.kodeGudang !== row.filterGudangKode){
        openMsoInfo('Barang Tidak Sesuai Gudang', `Barang <b>${p.namaBarang}</b> tercatat di gudang <b>${p.namaGudang}</b>, bukan di gudang yang sedang difilter (<b>${row.filterGudangNama}</b>). Pilih barang lain, atau ganti Filter Gudang dulu.`);
        return;
      }
      row.filterItemKode = p.kodeBarang;
      row.filterItemNama = p.namaBarang;
      document.getElementById('fMsoItem').value = p.namaBarang;
      msoRerenderItemFilterRow(row);
    });
  };
  const clearBtn = document.getElementById('msoItemClear');
  if(clearBtn) clearBtn.onclick = () => {
    row.filterItemKode = ''; row.filterItemNama = '';
    msoRerenderItemFilterRow(row);
  };

  document.getElementById('msoGenerate').onclick = () => msoGenerate(row);

  document.getElementById('msoBatalkan').onclick = (e) => { e.preventDefault(); renderMsoList(); };

  document.getElementById('msoSimpan').onclick = () => {
    if(!row.items.length){
      openMsoInfo('Validasi', 'Klik "Generate" terlebih dahulu (setelah memilih Filter Gudang) supaya Master Stock Opname memiliki minimal 1 barang.');
      return;
    }
    row.keterangan = document.getElementById('fMsoKeterangan').value;
    row.tglTransaksi = document.getElementById('fMsoTglTransaksi').value;
    row.periodeAwal = document.getElementById('fMsoPeriodeAwal').value;
    row.periodeAkhir = document.getElementById('fMsoPeriodeAkhir').value;

    if(mode === 'add'){
      row.cabang = document.getElementById('fMsoCabang').value;
      row.no = msoGenerateNumber(row.cabang);
      row.userEntry = 'sidik';
      DATA.masterStockOpname.push(row);
    } else {
      DATA.masterStockOpname[idx] = row;
    }
    renderMsoList();
  };
}

/* Cuma re-render baris "Filter Item Barang" (input value + tombol
   Hapus filter) tanpa menyentuh field lain di form, supaya tombol
   Hapus filter langsung muncul/hilang begitu filter diisi/dikosongkan. */
function msoRerenderItemFilterRow(row){
  document.getElementById('fMsoItem').value = row.filterItemNama || '';
  const wrap = document.getElementById('fMsoItem').closest('.input-with-btn');
  const oldClear = document.getElementById('msoItemClear');
  if(row.filterItemKode && !oldClear){
    const btn = document.createElement('button');
    btn.type = 'button'; btn.className = 'icon-btn del'; btn.id = 'msoItemClear'; btn.title = 'Hapus Filter';
    btn.innerHTML = icon('trash',14);
    btn.onclick = () => { row.filterItemKode=''; row.filterItemNama=''; msoRerenderItemFilterRow(row); };
    wrap.appendChild(btn);
  } else if(!row.filterItemKode && oldClear){
    oldClear.remove();
  }
}

/* "Generate" — BENAR2 membaca DATA.persediaan (bukan dekoratif):
   disaring kodeGudang (WAJIB, dari Filter Gudang) + kodeBarang
   (opsional, dari Filter Item Barang). Barang yang SUDAH ada di
   row.items sebelumnya (dicocokkan lewat kode) TETAP mempertahankan
   Qty Counted/Ket. Area/status verified yang sudah diisi user, hanya
   Sistem/HNA yang di-refresh ke nilai TERKINI — pola sama persis
   rosGenerateBarang() di Reordering Sheet. */
function msoGenerate(row){
  if(!row.filterGudangKode){
    openMsoInfo('Filter Gudang Wajib Diisi', 'Pilih Filter Gudang terlebih dahulu sebelum Generate, supaya barang yang di-generate benar-benar sesuai gudang yang akan di-stock-opname-kan.');
    return;
  }
  const matches = DATA.persediaan.filter(p =>
    p.kodeGudang === row.filterGudangKode &&
    (!row.filterItemKode || p.kodeBarang === row.filterItemKode));

  if(!matches.length){
    openMsoInfo('Tidak Ada Barang', 'Tidak ada barang di Persediaan yang cocok dengan Filter Gudang/Filter Item Barang yang dipilih. Rincian barang sebelumnya tidak diubah.');
    return;
  }

  const existingByKode = {};
  row.items.forEach(it => { existingByKode[it.kode] = it; });
  const itemsMaster = {};
  DATA.items.forEach(it => { itemsMaster[it.kode] = it; });

  row.items = matches.map(p => {
    const prev = existingByKode[p.kodeBarang];
    const hna = (itemsMaster[p.kodeBarang] && itemsMaster[p.kodeBarang].harga) || 0;
    if(prev){
      return { ...prev, nama: p.namaBarang, kodeGudang: p.kodeGudang, sistem: p.qtyPhysical, hna };
    }
    return {
      kodeGudang: p.kodeGudang, kode: p.kodeBarang, nama: p.namaBarang,
      batch: '-', exp: '-', ketArea: '', sistem: p.qtyPhysical, qtyCounted: p.qtyPhysical, hna, verified: false,
    };
  });

  msoItemPage = 1;
  msoRefreshItemsWrap(row, false);
}

function msoWireItemInputs(row, dis){
  if(dis) return;
  const wrap = document.getElementById('msoItemsWrap');
  wrap.querySelectorAll('[data-mso-qty]').forEach(inp => inp.onchange = () => {
    const ii = +inp.dataset.msoQty;
    row.items[ii].qtyCounted = +inp.value || 0;
    row.items[ii].verified = false;
    msoRefreshItemsWrap(row, false);
  });
  wrap.querySelectorAll('[data-mso-ketarea]').forEach(inp => inp.onchange = () => {
    const ii = +inp.dataset.msoKetarea;
    row.items[ii].ketArea = inp.value;
  });
  wrap.querySelectorAll('[data-mso-verif]').forEach(btn => btn.onclick = () => openMsoVerifModal(row, +btn.dataset.msoVerif));
  wrap.querySelectorAll('[data-mso-hapus]').forEach(btn => btn.onclick = () => openMsoItemDeleteConfirm(row, +btn.dataset.msoHapus));

  const pagerWrap = document.getElementById('msoItemPager');
  if(pagerWrap) pagerWrap.querySelectorAll('[data-msoitempage]').forEach(b => b.onclick = () => {
    msoItemPage = +b.dataset.msoitempage;
    msoRefreshItemsWrap(row, false);
  });
}

function msoRefreshItemsWrap(row, dis){
  document.getElementById('msoItemsWrap').innerHTML = tplMsoItemsTable(row.items, msoItemPage, 10, dis);
  msoWireItemInputs(row, dis);
}

function openMsoVerifModal(row, ii){
  closeModal();
  const it = row.items[ii];
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.innerHTML = tplMsoVerifModal(it, ii);
  document.body.appendChild(overlay);
  document.getElementById('modalClose').onclick = closeModal;
  document.getElementById('modalCancel').onclick = closeModal;
  overlay.onclick = (e) => { if(e.target === overlay) closeModal(); };
  document.getElementById('modalVerifSave').onclick = () => {
    it.qtyCounted = +document.getElementById('mvQty').value || 0;
    it.ketArea = document.getElementById('mvKetArea').value;
    it.verified = true;
    closeModal();
    msoRefreshItemsWrap(row, false);
  };
}

function openMsoItemDeleteConfirm(row, ii){
  closeModal();
  const it = row.items[ii];
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.innerHTML = tplMsoItemDeleteConfirm(it);
  document.body.appendChild(overlay);
  document.getElementById('modalClose').onclick = closeModal;
  document.getElementById('modalCancel').onclick = closeModal;
  overlay.onclick = (e) => { if(e.target === overlay) closeModal(); };
  document.getElementById('modalDelete').onclick = () => {
    row.items.splice(ii, 1);
    closeModal();
    msoRefreshItemsWrap(row, false);
  };
}

function openMsoDeleteConfirm(idx){
  closeModal();
  const row = DATA.masterStockOpname[idx];
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.innerHTML = tplMsoDeleteConfirm(row);
  document.body.appendChild(overlay);
  document.getElementById('modalClose').onclick = closeModal;
  document.getElementById('modalCancel').onclick = closeModal;
  overlay.onclick = (e) => { if(e.target === overlay) closeModal(); };
  document.getElementById('modalDelete').onclick = () => {
    DATA.masterStockOpname.splice(idx, 1);
    closeModal();
    renderMsoTable();
  };
}

function openMsoInfo(title, text){
  closeModal();
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.innerHTML = tplMsoInfoModal(title, text);
  document.body.appendChild(overlay);
  document.getElementById('modalClose').onclick = closeModal;
  document.getElementById('modalOk').onclick = closeModal;
  overlay.onclick = (e) => { if(e.target === overlay) closeModal(); };
}

function openMsoPrintResult(idx){
  const row = DATA.masterStockOpname[idx];
  const html = tplMsoResultDoc(row);
  const win = window.open('', '_blank');
  win.document.write(html);
  win.document.close();
}

/* =========================================================
   "Laporan Pembantu Stock Opname" — modal "Daftar Fisik Inventory"
   dibuka dari tombol header list. Show Report / Show Report Pdf
   SAMA2 membuka tab cetak dokumen KOSONG "Cek Fisik Inventory"
   (kolom Hasil Hitung selalu kosong, form fisik utk dibawa ke
   gudang) — lihat tplMsoCekFisikDoc().
========================================================= */
let msoLaporanFilter = { gudangKode:'', gudangNama:'', kategoriKode:'', itemKode:'', itemNama:'', tanggal:'27/08/2026', bernilaiNol:false };

function openMsoLaporanBantu(){
  closeModal();
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.innerHTML = tplMsoLaporanBantuModal(msoLaporanFilter);
  document.body.appendChild(overlay);
  document.getElementById('modalClose').onclick = closeModal;
  document.getElementById('mlbClose').onclick = closeModal;
  overlay.onclick = (e) => { if(e.target === overlay) closeModal(); };

  document.getElementById('mlbGudangSearch').onclick = () => {
    closeModal();
    const rows = DATA.gudang.map(g => ({ kode:g.kode, label:`${g.kode} - ${g.nama} (${g.cabang})` }));
    const pickerOverlay = document.createElement('div');
    pickerOverlay.className = 'modal-overlay';
    pickerOverlay.innerHTML = tplMsoSimplePicker('Pilih Gudang', rows);
    document.body.appendChild(pickerOverlay);
    document.getElementById('modalClose').onclick = () => { pickerOverlay.remove(); openMsoLaporanBantu(); };
    document.getElementById('modalCancel').onclick = () => { pickerOverlay.remove(); openMsoLaporanBantu(); };
    pickerOverlay.onclick = (e) => { if(e.target === pickerOverlay){ pickerOverlay.remove(); openMsoLaporanBantu(); } };
    pickerOverlay.querySelectorAll('.mso-pick-row').forEach(tr => tr.onclick = () => {
      const g = DATA.gudang.find(x => x.kode === tr.dataset.kode);
      msoLaporanFilter.gudangKode = g.kode; msoLaporanFilter.gudangNama = `${g.kode} - ${g.nama} (${g.cabang})`;
      pickerOverlay.remove();
      openMsoLaporanBantu();
    });
  };

  document.getElementById('mlbItemSearch').onclick = () => {
    closeModal();
    const rows = DATA.items.map(it => ({ kode:it.kode, label:`${it.kode} - ${it.nama}` }));
    const pickerOverlay = document.createElement('div');
    pickerOverlay.className = 'modal-overlay';
    pickerOverlay.innerHTML = tplMsoSimplePicker('Pilih Inventory', rows);
    document.body.appendChild(pickerOverlay);
    document.getElementById('modalClose').onclick = () => { pickerOverlay.remove(); openMsoLaporanBantu(); };
    document.getElementById('modalCancel').onclick = () => { pickerOverlay.remove(); openMsoLaporanBantu(); };
    pickerOverlay.onclick = (e) => { if(e.target === pickerOverlay){ pickerOverlay.remove(); openMsoLaporanBantu(); } };
    pickerOverlay.querySelectorAll('.mso-pick-row').forEach(tr => tr.onclick = () => {
      msoLaporanFilter.itemKode = tr.dataset.kode; msoLaporanFilter.itemNama = tr.dataset.label;
      pickerOverlay.remove();
      openMsoLaporanBantu();
    });
  };

  const showReport = () => {
    msoLaporanFilter.kategoriKode = document.getElementById('mlbKategori').value;
    msoLaporanFilter.tanggal = document.getElementById('mlbTanggal').value;
    msoLaporanFilter.bernilaiNol = document.getElementById('mlbBernilaiNol').checked;
    const rows = DATA.persediaan.filter(p =>
      (!msoLaporanFilter.gudangKode || p.kodeGudang === msoLaporanFilter.gudangKode) &&
      (!msoLaporanFilter.kategoriKode || p.kodeKategori === msoLaporanFilter.kategoriKode) &&
      (!msoLaporanFilter.itemKode || p.kodeBarang === msoLaporanFilter.itemKode) &&
      (msoLaporanFilter.bernilaiNol || p.qtyPhysical > 0));

    const byGudang = {};
    rows.forEach(p => {
      if(!byGudang[p.namaGudang]) byGudang[p.namaGudang] = {};
      const kk = p.kodeKategori;
      if(!byGudang[p.namaGudang][kk]) byGudang[p.namaGudang][kk] = [];
      byGudang[p.namaGudang][kk].push(p);
    });
    const groups = Object.keys(byGudang).sort().map(namaGudang => ({
      namaGudang,
      kategoris: Object.keys(byGudang[namaGudang]).sort().map(kk => {
        const kb = DATA.kategoriBarang.find(x => x.kode === kk);
        return { namaKategori: kb ? kb.nama : kk, rows: byGudang[namaGudang][kk] };
      }),
    }));

    const html = tplMsoCekFisikDoc(msoLaporanFilter.tanggal, groups);
    const win = window.open('', '_blank');
    win.document.write(html);
    win.document.close();
  };
  document.getElementById('mlbShowReport').onclick = showReport;
  document.getElementById('mlbShowReportPdf').onclick = showReport;
}
