/* =========================================================
   LOGIC (JS saja) — Stock Opname (Persediaan Barang > Daftar
   Transaksi > Stock Opname, page:'stockOpname'). Dimuat otomatis
   (lazy-load) oleh core.js saat menu ini pertama kali diklik — lihat
   PAGE_MODULES di js/core.js. Markup HTML-nya ada di file sebelah:
   stock-opname.template.js (baca komentar header di sana dulu utk
   konteks lengkap keputusan desain & hubungan dgn Master Stock Opname).
   NB: closeModal() & openPersediaanPicker() dipakai bersama,
   didefinisikan di core.js.
========================================================= */

let opnListState = { page:1, search:'' };
let opnItemPage = 1;

function renderStockOpnamePage(){
  renderOpnList();
}

function renderOpnList(){
  content.innerHTML = tplOpnListPage();
  opnListState = { page:1, search:'' };
  document.getElementById('btnOpnAdd').onclick = () => openOpnForm('add');
  document.getElementById('opnPageSize').onchange = () => { opnListState.page = 1; renderOpnTable(); };
  document.getElementById('opnSearch').oninput = (e) => {
    opnListState.search = e.target.value.trim().toLowerCase();
    opnListState.page = 1;
    renderOpnTable();
  };
  renderOpnTable();
}

function opnPageSize(){
  const sel = document.getElementById('opnPageSize');
  return sel ? parseInt(sel.value, 10) : 10;
}

function opnFilteredRows(){
  const q = opnListState.search;
  if(!q) return DATA.stockOpname;
  return DATA.stockOpname.filter(r =>
    (r.no||'').toLowerCase().includes(q) ||
    (r.keterangan||'').toLowerCase().includes(q) ||
    (r.cabang||'').toLowerCase().includes(q) ||
    (r.masterStockOpnameNo||'').toLowerCase().includes(q));
}

function renderOpnTable(){
  const perPage = opnPageSize();
  const filtered = opnFilteredRows();
  const totalPages = Math.max(1, Math.ceil(filtered.length/perPage));
  if(opnListState.page > totalPages) opnListState.page = totalPages;
  if(opnListState.page < 1) opnListState.page = 1;

  document.getElementById('opnTbody').innerHTML = tplOpnRows(filtered, opnListState.page, perPage);
  document.getElementById('opnTotal').textContent = `Total: ${filtered.length}`;
  document.getElementById('opnPager').innerHTML = tplOpnPager(opnListState.page, totalPages);

  const tbody = document.getElementById('opnTbody');
  tbody.querySelectorAll('[data-edit]').forEach(b => b.onclick = (e) => { e.preventDefault(); openOpnForm('edit', +b.dataset.edit); });
  tbody.querySelectorAll('[data-del]').forEach(b => b.onclick = () => openOpnDeleteConfirm(+b.dataset.del));

  const pager = document.getElementById('opnPager');
  pager.querySelectorAll('[data-opnpage]').forEach(b => b.onclick = () => { opnListState.page = +b.dataset.opnpage; renderOpnTable(); });
}

function opnGenerateNumber(cabang){
  const kode = OPN_CABANG_CODE[cabang] || 'XXX';
  const seq = DATA.stockOpname.filter(r => r.cabang === cabang).length + 1;
  return `26/OPN-${kode}/08/${String(seq).padStart(5,'0')}`;
}

function opnEmptyRow(){
  const cabang = OPN_CABANG_LIST[0];
  return {
    no: opnGenerateNumber(cabang), cabang,
    tglTransaksi: '27/08/2026 00:00:00', masterStockOpnameNo: '',
    gudangKode: '', gudangNama: '', keterangan: '',
    items: [], userEntry: 'sidik',
  };
}

function openOpnForm(mode, idx){
  let row;
  if(mode === 'add'){
    row = opnEmptyRow();
  } else {
    const src = DATA.stockOpname[idx];
    row = { ...src, items: src.items.map(it => ({ ...it })) };
  }
  opnItemPage = 1;

  content.innerHTML = tplOpnForm(mode, row);

  if(mode === 'add'){
    document.getElementById('fOpnCabang').onchange = (e) => {
      row.cabang = e.target.value;
      row.no = opnGenerateNumber(row.cabang);
      document.getElementById('fOpnNo').value = row.no;
      row.masterStockOpnameNo = '';
      row.gudangKode = ''; row.gudangNama = '';
      document.getElementById('fOpnMso').innerHTML = `<option value="">- Pilih Master Stock Opname -</option>${opnMsoOptionsForCabang(row.cabang, '')}`;
      document.getElementById('fOpnGudang').innerHTML = `<option value="">- Pilih Gudang -</option>${opnGudangOptionsForCabang(row.cabang, '')}`;
    };
    document.getElementById('opnRefreshNo').onclick = () => {
      row.no = opnGenerateNumber(row.cabang);
      document.getElementById('fOpnNo').value = row.no;
    };
  }

  document.getElementById('fOpnMso').onchange = (e) => {
    row.masterStockOpnameNo = e.target.value;
    const mso = DATA.masterStockOpname.find(m => m.no === row.masterStockOpnameNo);
    if(mso){
      row.gudangKode = mso.filterGudangKode || '';
      row.gudangNama = mso.filterGudangNama || '';
      if(!document.getElementById('fOpnKeterangan').value) {
        row.keterangan = mso.keterangan || '';
        document.getElementById('fOpnKeterangan').value = row.keterangan;
      }
      document.getElementById('fOpnGudang').innerHTML = `<option value="">- Pilih Gudang -</option>${opnGudangOptionsForCabang(row.cabang, row.gudangKode)}`;
    }
  };

  document.getElementById('fOpnGudang').onchange = (e) => {
    const g = DATA.gudang.find(x => x.kode === e.target.value);
    row.gudangKode = g ? g.kode : '';
    row.gudangNama = g ? g.nama : '';
  };

  document.getElementById('opnGenerate').onclick = () => opnGenerate(row);

  opnWireItemInputs(row);

  document.getElementById('opnBatalkan').onclick = (e) => { e.preventDefault(); renderOpnList(); };

  document.getElementById('opnSimpan').onclick = () => {
    if(!row.items.length){
      openOpnInfo('Validasi', 'Klik "Generate" terlebih dahulu (setelah memilih Master Stock Opname), atau tambahkan minimal 1 barang lewat "+Tambah Item", sebelum menyimpan.');
      return;
    }
    if(row.items.some(it => !it.kode)){
      openOpnInfo('Validasi', 'Ada baris Rincian yang belum diisi Kode Barang-nya. Lengkapi atau hapus baris tersebut dulu.');
      return;
    }
    row.keterangan = document.getElementById('fOpnKeterangan').value;
    row.tglTransaksi = document.getElementById('fOpnTglTransaksi').value;

    if(mode === 'add'){
      row.cabang = document.getElementById('fOpnCabang').value;
      row.no = opnGenerateNumber(row.cabang);
      row.userEntry = 'sidik';
      DATA.stockOpname.push(row);
    } else {
      DATA.stockOpname[idx] = row;
    }
    renderOpnList();
  };
}

/* "Generate" — mengambil daftar barang dari Master Stock Opname yang
   dipilih (row.masterStockOpnameNo) lalu mengisi Rincian 1 baris per
   barang. Qty Batch DIINISIALISASI = Qty Counted barang itu di MSO
   (titik awal yang masuk akal utk 1 batch — user bisa split jadi
   beberapa batch lewat "+Tambah Batch Number"). Barang yang SUDAH ada
   di row.items sebelumnya (dicocokkan lewat kode) TETAP mempertahankan
   Batch Number/Qty Batch/Tgl. Expired yang sudah diisi user — pola
   sama merge-preserve msoGenerate()/rosGenerateBarang(). */
function opnGenerate(row){
  if(!row.masterStockOpnameNo){
    openOpnInfo('Master Stock Opname Wajib Dipilih', 'Pilih dokumen Master Stock Opname terlebih dahulu sebelum Generate, supaya barang yang di-generate benar-benar sesuai hasil hitung yang sudah ada.');
    return;
  }
  const mso = DATA.masterStockOpname.find(m => m.no === row.masterStockOpnameNo);
  if(!mso || !mso.items.length){
    openOpnInfo('Tidak Ada Barang', 'Master Stock Opname yang dipilih tidak memiliki barang. Rincian sebelumnya tidak diubah.');
    return;
  }

  const existingByKode = {};
  row.items.forEach(it => { if(!existingByKode[it.kode]) existingByKode[it.kode] = it; });

  row.items = mso.items.map(it => {
    const prev = existingByKode[it.kode];
    if(prev) return { ...prev, nama: it.nama };
    return { kode: it.kode, nama: it.nama, batch: '', qtyBatch: it.qtyCounted||0, exp: '' };
  });

  opnItemPage = 1;
  opnRefreshItemsWrap(row);
  showOpnGeneratedBanner();
}

function showOpnGeneratedBanner(){
  if(document.getElementById('opnGeneratedBanner')) return;
  const body = document.querySelector('.card-body');
  if(!body) return;
  const div = document.createElement('div');
  div.className = 'alert-warning';
  div.id = 'opnGeneratedBanner';
  div.textContent = 'Master Stock Opname sudah digenerate';
  body.insertBefore(div, body.firstChild);
}

function opnWireItemInputs(row){
  const wrap = document.getElementById('opnItemsWrap');
  wrap.querySelectorAll('[data-opn-batch]').forEach(inp => inp.onchange = () => {
    row.items[+inp.dataset.opnBatch].batch = inp.value;
  });
  wrap.querySelectorAll('[data-opn-qtybatch]').forEach(inp => inp.onchange = () => {
    row.items[+inp.dataset.opnQtybatch].qtyBatch = +inp.value || 0;
  });
  wrap.querySelectorAll('[data-opn-exp]').forEach(inp => inp.onchange = () => {
    row.items[+inp.dataset.opnExp].exp = inp.value;
  });
  wrap.querySelectorAll('[data-opn-kodesearch]').forEach(btn => btn.onclick = () => {
    const ii = +btn.dataset.opnKodesearch;
    if(!row.gudangKode){
      openOpnInfo('Pilih Gudang Dulu', 'Pilih Gudang terlebih dahulu sebelum mencari barang, supaya daftar barang yang tampil sudah sesuai gudang yang dipilih.');
      return;
    }
    openPersediaanPicker(row.cabang, (p) => {
      if(p.kodeGudang !== row.gudangKode){
        openOpnInfo('Barang Tidak Sesuai Gudang', `Barang <b>${p.namaBarang}</b> tercatat di gudang <b>${p.namaGudang}</b>, bukan di gudang yang sedang dipilih (<b>${row.gudangNama}</b>). Pilih barang lain, atau ganti Gudang dulu.`);
        return;
      }
      row.items[ii].kode = p.kodeBarang;
      row.items[ii].nama = p.namaBarang;
      opnRefreshItemsWrap(row);
    });
  });
  wrap.querySelectorAll('[data-opn-hapus]').forEach(btn => btn.onclick = () => {
    row.items.splice(+btn.dataset.opnHapus, 1);
    opnRefreshItemsWrap(row);
  });

  const pagerWrap = document.getElementById('opnItemPager');
  if(pagerWrap) pagerWrap.querySelectorAll('[data-opnitempage]').forEach(b => b.onclick = () => {
    opnItemPage = +b.dataset.opnitempage;
    opnRefreshItemsWrap(row);
  });

  const addItemLink = document.getElementById('opnAddItem');
  if(addItemLink) addItemLink.onclick = (e) => {
    e.preventDefault();
    row.items.push({ kode:'', nama:'', batch:'', qtyBatch:0, exp:'' });
    opnItemPage = Math.max(1, Math.ceil(row.items.length/10));
    opnRefreshItemsWrap(row);
  };
  const addBatchLink = document.getElementById('opnAddBatch');
  if(addBatchLink) addBatchLink.onclick = (e) => {
    e.preventDefault();
    if(!row.items.length){
      openOpnInfo('Belum Ada Barang', 'Tambahkan minimal 1 barang dulu (lewat "Generate" atau "+Tambah Item") sebelum menambah Batch Number baru.');
      return;
    }
    const last = row.items[row.items.length-1];
    row.items.push({ kode:last.kode, nama:last.nama, batch:'', qtyBatch:0, exp:'' });
    opnItemPage = Math.max(1, Math.ceil(row.items.length/10));
    opnRefreshItemsWrap(row);
  };
}

function opnRefreshItemsWrap(row){
  document.getElementById('opnItemsWrap').innerHTML = tplOpnItemsTable(row.items, opnItemPage, 10);
  opnWireItemInputs(row);
}

function openOpnDeleteConfirm(idx){
  closeModal();
  const row = DATA.stockOpname[idx];
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.innerHTML = tplOpnDeleteConfirm(row);
  document.body.appendChild(overlay);
  document.getElementById('modalClose').onclick = closeModal;
  document.getElementById('modalCancel').onclick = closeModal;
  overlay.onclick = (e) => { if(e.target === overlay) closeModal(); };
  document.getElementById('modalDelete').onclick = () => {
    DATA.stockOpname.splice(idx, 1);
    closeModal();
    renderOpnTable();
  };
}

function openOpnInfo(title, text){
  closeModal();
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.innerHTML = tplOpnInfoModal(title, text);
  document.body.appendChild(overlay);
  document.getElementById('modalClose').onclick = closeModal;
  document.getElementById('modalOk').onclick = closeModal;
  overlay.onclick = (e) => { if(e.target === overlay) closeModal(); };
}
