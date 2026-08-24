/* =========================================================
   LOGIC (JS saja) — Persediaan Barang / Master Item (menu Persediaan
   Barang > Master & Setting > Inventory, page:'items'). Dimuat
   otomatis (lazy-load) oleh core.js saat menu ini pertama kali
   diklik — lihat PAGE_MODULES di js/core.js. Markup HTML-nya ada di
   file sebelah: persediaan-barang.template.js.
   NB: closeModal() dipakai bersama, didefinisikan di core.js.

   Menggantikan renderer generik lama `pages.items` (kolom
   kode/nama/kategori/satuan/stok/harga saja, read-only, tanpa
   Tambah/Ubah/Hapus) — lihat catatan besar di js/core.js bagian
   PAGE_MODULES & di atas DATA.items di js/data.js.
========================================================= */

let psbState = { showNegatif:false, showInactive:false, gudangFilter:'00-GUU;01-GUU;02-GUU', search:'' };

function renderPersediaanBarangPage(){
  renderPsbList();
}

function renderPsbList(){
  content.innerHTML = tplPersediaanListPage(psbState);
  document.getElementById('btnPsbAdd').onclick = () => openPsbForm('add');
  document.getElementById('btnPsbImport').onclick = () => alert('Import barang dari file Excel/CSV akan tersedia di sini. (Contoh tampilan mockup)');
  document.getElementById('psbShowNegatif').onchange = (e) => { psbState.showNegatif = e.target.checked; renderPsbTable(); };
  document.getElementById('psbShowInactive').onchange = (e) => { psbState.showInactive = e.target.checked; renderPsbTable(); };
  document.getElementById('psbGudangFilter').oninput = (e) => { psbState.gudangFilter = e.target.value; renderPsbTable(); };
  document.getElementById('psbSearch').oninput = (e) => { psbState.search = e.target.value; renderPsbTable(); };
  renderPsbTable();
}

function psbGudangList(){
  const codes = psbState.gudangFilter.split(';').map(s=>s.trim()).filter(Boolean);
  const seen = new Set();
  const out = [];
  codes.forEach(c => {
    if(seen.has(c)) return;
    const g = DATA.gudang.find(x=>x.kode===c);
    if(g){ out.push(g); seen.add(c); }
  });
  return out;
}

function psbFilteredRows(){
  let rows = psbState.showInactive ? DATA.items : DATA.items.filter(r => r.statusBarang !== 'Non Aktif');
  if(!psbState.showNegatif) rows = rows.filter(r => (r.stok??0) >= 0);
  const q = psbState.search.trim().toLowerCase();
  if(q) rows = rows.filter(r => r.kode.toLowerCase().includes(q) || r.nama.toLowerCase().includes(q));
  return rows;
}

function renderPsbTable(){
  const rows = psbFilteredRows();
  const gudangList = psbGudangList();
  document.getElementById('psbTableWrap').innerHTML = tplPsbTable(rows, gudangList);
  document.getElementById('psbTotal').textContent = `Total Record: ${rows.length}`;
  document.querySelectorAll('#psbTableWrap [data-edit]').forEach(b => b.onclick = () => openPsbForm('edit', +b.dataset.edit));
  document.querySelectorAll('#psbTableWrap [data-del]').forEach(b => b.onclick = () => openPsbDeleteConfirm(+b.dataset.del));
}

function psbNextKode(){
  const nums = DATA.items
    .map(r => /^BRG-(\d+)$/.exec(r.kode))
    .filter(Boolean)
    .map(m => parseInt(m[1], 10));
  const next = nums.length ? Math.max(...nums) + 1 : 1;
  return 'BRG-' + String(next).padStart(3, '0');
}

function psbEmptyRow(){
  return {
    kode: psbNextKode(), nama:'', kategori:'', kategoriKode:'', satuan:'Pcs', stok:0, harga:0,
    gambarProduk:'', kodeBarangPajak:'', kodeAlkes:'', namaAlkes:'', kodeItemFarma:'', namaItemFarma:'', kodeItemPrincipal:'',
    tipeUkuran:'', tipeBarang:'Inventory Stock (FG)', kelas:'', katReorderingSheetKode:'', farmaKode:'', subFarmaKode:'', bentukSediaanKode:'',
    konversiSatuanDasar:1, kekuatanSediaan:'', namaJenisObat:'', memo:'', nie:'', tglEfektif:'', tglExpired:'',
    tipePenyimpanan:'Suhu Ruang (15-30°C)', qtyKelipatanOrder:1, hsCode:'',
    tampilkanMinimumMargin:false, sembunyikanNamaBarang:false, holdPembelian:false, holdPenjualan:false, holdTransaksiInventory:false, barangBonus:false,
    statusBarang:'Aktif', zatKandunganAktif:[], groupProduk:[],
    beratProduk:{isiDalamKarton:0, berat:0, panjang:0, lebar:0, tinggi:0},
    feeDistribusi:[], budgetDiskon:[], supplier:[],
    konsinyasiIn:false, divisi:'None',
    hargaBeliPerTanggal:[], hargaJualPerTanggal:[],
    satuanDetail:{dasar:{barcode:'',satuan:'Pcs',satuanPajak:'',konversi:1}, um2:{barcode:'',satuan:'',satuanPajak:'',konversi:0}, um3:{barcode:'',satuan:'',satuanPajak:'',konversi:0}, um4:{barcode:'',satuan:'',satuanPajak:'',konversi:0}},
    hargaSpecialSupplier:[], hargaSpecialCustomer:[], salesPriceByQuantity:[],
    lokasiGudang:[],
  };
}

function openPsbForm(mode, idx){
  const row = mode === 'edit' ? JSON.parse(JSON.stringify(DATA.items[idx])) : psbEmptyRow();
  content.innerHTML = tplPersediaanForm(mode, row);

  document.getElementById('btnPsbUpload').onclick = () => alert('Upload gambar produk akan tersedia di sini. (Contoh tampilan mockup)');
  document.getElementById('btnPsbKategoriAdd').onclick = () => alert('Tambah Kategori Barang baru dapat dilakukan di modul Master Kategori Barang. (Contoh tampilan mockup)');
  document.getElementById('btnPsbHsSearch').onclick = () => alert('Pencarian Kode HS Bea Cukai akan tersedia di sini. (Contoh tampilan mockup)');

  wirePsbBeratProduk(row);
  wirePsbZatTab(row);
  wirePsbGrpTab(row);
  wirePsbLokTab(row);
  wirePsbFeeTab(row);
  wirePsbBudTab(row);
  wirePsbSupTab(row);
  wirePsbHargaTab(row, 'hargaBeliPerTanggal', 'Hb');
  wirePsbHargaTab(row, 'hargaJualPerTanggal', 'Hj');
  wirePsbSatuanTab(row);
  wirePsbTabsHssHsc();
  wirePsbHssTab(row);
  wirePsbHscTab(row);
  wirePsbSpqTab(row);

  document.getElementById('psbSave').onclick = () => psbSave(mode, idx, row);
  document.getElementById('psbCancel').onclick = () => renderPsbList();
}

/* ===== Berat Produk (Volume dihitung live) ===== */
function wirePsbBeratProduk(row){
  const ids = [['fPsbIsiDalamKarton','isiDalamKarton'],['fPsbBerat','berat'],['fPsbPanjang','panjang'],['fPsbLebar','lebar'],['fPsbTinggi','tinggi']];
  ids.forEach(([id,key]) => {
    document.getElementById(id).oninput = (e) => {
      row.beratProduk[key] = Number(e.target.value)||0;
      document.getElementById('fPsbVolume').value = psbVolume(row.beratProduk);
    };
  });
}

/* ===== Zat Kandungan Aktif (tautan) ===== */
function wirePsbZatTab(row){
  wirePsbZatRows(row);
  document.getElementById('btnPsbZatAdd').onclick = (e) => {
    e.preventDefault();
    const used = new Set(row.zatKandunganAktif);
    const next = DATA.zatKandunganAktif.find(z => !used.has(z.kode)) || DATA.zatKandunganAktif[0];
    row.zatKandunganAktif.push(next.kode);
    renderPsbZatSection(row);
  };
}
function renderPsbZatSection(row){
  document.getElementById('psbZatTbody').innerHTML = tplPsbZatRows(row.zatKandunganAktif);
  wirePsbZatRows(row);
}
function wirePsbZatRows(row){
  const tbody = document.getElementById('psbZatTbody');
  tbody.querySelectorAll('[data-zat-idx]').forEach(sel => {
    sel.onchange = (e) => { row.zatKandunganAktif[+e.target.dataset.zatIdx] = e.target.value; };
  });
  tbody.querySelectorAll('[data-zat-del]').forEach(btn => {
    btn.onclick = () => { row.zatKandunganAktif.splice(+btn.dataset.zatDel, 1); renderPsbZatSection(row); };
  });
}

/* ===== Group Produk (tautan) ===== */
function wirePsbGrpTab(row){
  wirePsbGrpRows(row);
  document.getElementById('btnPsbGrpAdd').onclick = (e) => {
    e.preventDefault();
    const used = new Set(row.groupProduk);
    const next = DATA.groupProduk.find(g => !used.has(g.kode)) || DATA.groupProduk[0];
    row.groupProduk.push(next.kode);
    renderPsbGrpSection(row);
  };
}
function renderPsbGrpSection(row){
  document.getElementById('psbGrpTbody').innerHTML = tplPsbGrpRows(row.groupProduk);
  wirePsbGrpRows(row);
}
function wirePsbGrpRows(row){
  const tbody = document.getElementById('psbGrpTbody');
  tbody.querySelectorAll('[data-grp-idx]').forEach(sel => {
    sel.onchange = (e) => { row.groupProduk[+e.target.dataset.grpIdx] = e.target.value; };
  });
  tbody.querySelectorAll('[data-grp-del]').forEach(btn => {
    btn.onclick = () => { row.groupProduk.splice(+btn.dataset.grpDel, 1); renderPsbGrpSection(row); };
  });
}

/* ===== Lokasi Gudang (tautan + Stock/Qty Min/Max, +Tambah Semua Gudang) ===== */
function wirePsbLokTab(row){
  wirePsbLokRows(row);
  document.getElementById('btnPsbLokAdd').onclick = (e) => {
    e.preventDefault();
    const used = new Set(row.lokasiGudang.map(r=>r.gudangKode));
    const next = DATA.gudang.find(g => !used.has(g.kode)) || DATA.gudang[0];
    row.lokasiGudang.push({ gudangKode: next.kode, stock:0, qtyMin:0, qtyMax:0 });
    renderPsbLokSection(row);
  };
  document.getElementById('btnPsbLokAddAll').onclick = () => {
    const used = new Set(row.lokasiGudang.map(r=>r.gudangKode));
    DATA.gudang.forEach(g => { if(!used.has(g.kode)) row.lokasiGudang.push({ gudangKode: g.kode, stock:0, qtyMin:0, qtyMax:0 }); });
    renderPsbLokSection(row);
  };
}
function renderPsbLokSection(row){
  document.getElementById('psbLokTbody').innerHTML = tplPsbLokRows(row.lokasiGudang);
  wirePsbLokRows(row);
}
function wirePsbLokRows(row){
  const tbody = document.getElementById('psbLokTbody');
  tbody.querySelectorAll('[data-lok-gudang]').forEach(sel => {
    sel.onchange = (e) => { row.lokasiGudang[+e.target.dataset.lokGudang].gudangKode = e.target.value; };
  });
  tbody.querySelectorAll('[data-lok-stock]').forEach(inp => {
    inp.oninput = (e) => { row.lokasiGudang[+e.target.dataset.lokStock].stock = Number(e.target.value)||0; };
  });
  tbody.querySelectorAll('[data-lok-min]').forEach(inp => {
    inp.oninput = (e) => { row.lokasiGudang[+e.target.dataset.lokMin].qtyMin = Number(e.target.value)||0; };
  });
  tbody.querySelectorAll('[data-lok-max]').forEach(inp => {
    inp.oninput = (e) => { row.lokasiGudang[+e.target.dataset.lokMax].qtyMax = Number(e.target.value)||0; };
  });
  tbody.querySelectorAll('[data-lok-del]').forEach(btn => {
    btn.onclick = () => { row.lokasiGudang.splice(+btn.dataset.lokDel, 1); renderPsbLokSection(row); };
  });
}

/* ===== Fee Distribusi (entitas baru) ===== */
function wirePsbFeeTab(row){
  wirePsbFeeRows(row);
  document.getElementById('btnPsbFeeAdd').onclick = (e) => { e.preventDefault(); row.feeDistribusi.push({nama:'', nilai:0}); renderPsbFeeSection(row); };
}
function renderPsbFeeSection(row){ document.getElementById('psbFeeTbody').innerHTML = tplPsbFeeRows(row.feeDistribusi); wirePsbFeeRows(row); }
function wirePsbFeeRows(row){
  const tbody = document.getElementById('psbFeeTbody');
  tbody.querySelectorAll('[data-fee-nama]').forEach(inp => { inp.oninput = (e) => { row.feeDistribusi[+e.target.dataset.feeNama].nama = e.target.value; }; });
  tbody.querySelectorAll('[data-fee-nilai]').forEach(inp => { inp.oninput = (e) => { row.feeDistribusi[+e.target.dataset.feeNilai].nilai = Number(e.target.value)||0; }; });
  tbody.querySelectorAll('[data-fee-del]').forEach(btn => { btn.onclick = () => { row.feeDistribusi.splice(+btn.dataset.feeDel, 1); renderPsbFeeSection(row); }; });
}

/* ===== Budget Diskon (entitas baru) ===== */
function wirePsbBudTab(row){
  wirePsbBudRows(row);
  document.getElementById('btnPsbBudAdd').onclick = (e) => { e.preventDefault(); row.budgetDiskon.push({nama:'', nilai:0}); renderPsbBudSection(row); };
}
function renderPsbBudSection(row){ document.getElementById('psbBudTbody').innerHTML = tplPsbBudRows(row.budgetDiskon); wirePsbBudRows(row); }
function wirePsbBudRows(row){
  const tbody = document.getElementById('psbBudTbody');
  tbody.querySelectorAll('[data-bud-nama]').forEach(inp => { inp.oninput = (e) => { row.budgetDiskon[+e.target.dataset.budNama].nama = e.target.value; }; });
  tbody.querySelectorAll('[data-bud-nilai]').forEach(inp => { inp.oninput = (e) => { row.budgetDiskon[+e.target.dataset.budNilai].nilai = Number(e.target.value)||0; }; });
  tbody.querySelectorAll('[data-bud-del]').forEach(btn => { btn.onclick = () => { row.budgetDiskon.splice(+btn.dataset.budDel, 1); renderPsbBudSection(row); }; });
}

/* ===== Supplier (tautan + search picker + checkboxes) ===== */
function wirePsbSupTab(row){
  wirePsbSupRows(row);
  document.getElementById('btnPsbSupAdd').onclick = (e) => {
    e.preventDefault();
    const used = new Set(row.supplier.map(r=>r.kodeSupplier));
    const next = DATA.suppliers.find(s => !used.has(s.kode)) || DATA.suppliers[0];
    row.supplier.push({ kodeSupplier: next.kode, namaSupplier: next.nama, pusatBisnis:'Generik', untukPembelian:true, lapPenjualan:true });
    renderPsbSupSection(row);
  };
}
function renderPsbSupSection(row){ document.getElementById('psbSupTbody').innerHTML = tplPsbSupRows(row.supplier); wirePsbSupRows(row); }
function wirePsbSupRows(row){
  const tbody = document.getElementById('psbSupTbody');
  tbody.querySelectorAll('[data-sup-search]').forEach(btn => { btn.onclick = () => openPsbSupplierPicker(row, +btn.dataset.supSearch); });
  tbody.querySelectorAll('[data-sup-pb]').forEach(sel => {
    sel.onchange = (e) => {
      const bc = DATA.businessCentre.find(b=>b.kode===e.target.value);
      row.supplier[+e.target.dataset.supPb].pusatBisnis = bc ? bc.nama : '';
    };
  });
  tbody.querySelectorAll('[data-sup-beli]').forEach(chk => { chk.onchange = (e) => { row.supplier[+e.target.dataset.supBeli].untukPembelian = e.target.checked; }; });
  tbody.querySelectorAll('[data-sup-jual]').forEach(chk => { chk.onchange = (e) => { row.supplier[+e.target.dataset.supJual].lapPenjualan = e.target.checked; }; });
  tbody.querySelectorAll('[data-sup-del]').forEach(btn => { btn.onclick = () => { row.supplier.splice(+btn.dataset.supDel, 1); renderPsbSupSection(row); }; });
}
function openPsbSupplierPicker(row, rowIdx){
  closeModal();
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.innerHTML = tplPsbSupplierPicker(DATA.suppliers);
  document.body.appendChild(overlay);
  document.getElementById('modalClose').onclick = closeModal;
  document.getElementById('modalCancel').onclick = closeModal;
  overlay.onclick = (e) => { if(e.target === overlay) closeModal(); };
  const wireRows = () => {
    overlay.querySelectorAll('[data-sup-pick]').forEach(btn => btn.onclick = () => {
      const s = DATA.suppliers.find(x=>x.kode===btn.dataset.supPick);
      row.supplier[rowIdx].kodeSupplier = s.kode;
      row.supplier[rowIdx].namaSupplier = s.nama;
      renderPsbSupSection(row);
      closeModal();
    });
  };
  wireRows();
  document.getElementById('psbSupPickerSearch').oninput = (e) => {
    const q = e.target.value.trim().toLowerCase();
    const filtered = DATA.suppliers.filter(s => s.kode.toLowerCase().includes(q) || s.nama.toLowerCase().includes(q));
    document.getElementById('psbSupPickerBody').innerHTML = tplPsbSupplierPickerRows(filtered);
    wireRows();
  };
}

/* ===== Harga Beli/Jual Per Tanggal (entitas baru, dipakai 2x via prefix) ===== */
function wirePsbHargaTab(row, key, prefix){
  const p = prefix.toLowerCase();
  const wire = () => {
    const tbody = document.getElementById(`psb${prefix}Tbody`);
    tbody.querySelectorAll(`[data-${p}-awal]`).forEach(inp => { inp.oninput = (e) => { row[key][+e.target.dataset[`${p}Awal`]].tglAwal = e.target.value; }; });
    tbody.querySelectorAll(`[data-${p}-akhir]`).forEach(inp => { inp.oninput = (e) => { row[key][+e.target.dataset[`${p}Akhir`]].tglAkhir = e.target.value; }; });
    tbody.querySelectorAll(`[data-${p}-harga]`).forEach(inp => { inp.oninput = (e) => { row[key][+e.target.dataset[`${p}Harga`]].harga = Number(e.target.value)||0; }; });
    tbody.querySelectorAll(`[data-${p}-del]`).forEach(btn => { btn.onclick = () => { row[key].splice(+btn.dataset[`${p}Del`], 1); render(); }; });
  };
  const render = () => { document.getElementById(`psb${prefix}Tbody`).innerHTML = tplPsbHargaRows(row[key], prefix); wire(); };
  wire();
  document.getElementById(`btnPsb${prefix}Add`).onclick = (e) => { e.preventDefault(); row[key].push({tglAwal:'', tglAkhir:'', harga:0}); render(); };
}

/* ===== Jenis Satuan dan Harga (fixed 4 baris) ===== */
function wirePsbSatuanTab(row){
  document.querySelectorAll('[data-sat-barcode]').forEach(inp => { inp.oninput = (e) => { row.satuanDetail[e.target.dataset.satBarcode].barcode = e.target.value; }; });
  document.querySelectorAll('[data-sat-satuan]').forEach(inp => { inp.oninput = (e) => { row.satuanDetail[e.target.dataset.satSatuan].satuan = e.target.value; }; });
  document.querySelectorAll('[data-sat-pajak]').forEach(inp => { inp.oninput = (e) => { row.satuanDetail[e.target.dataset.satPajak].satuanPajak = e.target.value; }; });
  document.querySelectorAll('[data-sat-konversi]').forEach(inp => { inp.oninput = (e) => { row.satuanDetail[e.target.dataset.satKonversi].konversi = Number(e.target.value)||0; }; });
}

/* ===== Tab kecil Harga Special Supplier/Customer ===== */
function wirePsbTabsHssHsc(){
  document.getElementById('psbTabHssBtn').onclick = () => {
    document.getElementById('psbTabHssBtn').classList.add('active');
    document.getElementById('psbTabHscBtn').classList.remove('active');
    document.getElementById('psbTabHssContent').style.display = '';
    document.getElementById('psbTabHscContent').style.display = 'none';
  };
  document.getElementById('psbTabHscBtn').onclick = () => {
    document.getElementById('psbTabHscBtn').classList.add('active');
    document.getElementById('psbTabHssBtn').classList.remove('active');
    document.getElementById('psbTabHscContent').style.display = '';
    document.getElementById('psbTabHssContent').style.display = 'none';
  };
}
function wirePsbHssTab(row){
  wirePsbHssRows(row);
  document.getElementById('btnPsbHssAdd').onclick = (e) => {
    e.preventDefault();
    const used = new Set(row.hargaSpecialSupplier.map(r=>r.kodeSupplier));
    const next = DATA.suppliers.find(s => !used.has(s.kode)) || DATA.suppliers[0];
    row.hargaSpecialSupplier.push({ kodeSupplier: next.kode, harga:0 });
    renderPsbHssSection(row);
  };
}
function renderPsbHssSection(row){ document.getElementById('psbHssTbody').innerHTML = tplPsbHssRows(row.hargaSpecialSupplier); wirePsbHssRows(row); }
function wirePsbHssRows(row){
  const tbody = document.getElementById('psbHssTbody');
  tbody.querySelectorAll('[data-hss-supplier]').forEach(sel => { sel.onchange = (e) => { row.hargaSpecialSupplier[+e.target.dataset.hssSupplier].kodeSupplier = e.target.value; }; });
  tbody.querySelectorAll('[data-hss-harga]').forEach(inp => { inp.oninput = (e) => { row.hargaSpecialSupplier[+e.target.dataset.hssHarga].harga = Number(e.target.value)||0; }; });
  tbody.querySelectorAll('[data-hss-del]').forEach(btn => { btn.onclick = () => { row.hargaSpecialSupplier.splice(+btn.dataset.hssDel, 1); renderPsbHssSection(row); }; });
}
function wirePsbHscTab(row){
  wirePsbHscRows(row);
  document.getElementById('btnPsbHscAdd').onclick = (e) => {
    e.preventDefault();
    const used = new Set(row.hargaSpecialCustomer.map(r=>r.kodeCustomer));
    const next = DATA.customers.find(c => !used.has(c.kode)) || DATA.customers[0];
    row.hargaSpecialCustomer.push({ kodeCustomer: next.kode, harga:0 });
    renderPsbHscSection(row);
  };
}
function renderPsbHscSection(row){ document.getElementById('psbHscTbody').innerHTML = tplPsbHscRows(row.hargaSpecialCustomer); wirePsbHscRows(row); }
function wirePsbHscRows(row){
  const tbody = document.getElementById('psbHscTbody');
  tbody.querySelectorAll('[data-hsc-customer]').forEach(sel => { sel.onchange = (e) => { row.hargaSpecialCustomer[+e.target.dataset.hscCustomer].kodeCustomer = e.target.value; }; });
  tbody.querySelectorAll('[data-hsc-harga]').forEach(inp => { inp.oninput = (e) => { row.hargaSpecialCustomer[+e.target.dataset.hscHarga].harga = Number(e.target.value)||0; }; });
  tbody.querySelectorAll('[data-hsc-del]').forEach(btn => { btn.onclick = () => { row.hargaSpecialCustomer.splice(+btn.dataset.hscDel, 1); renderPsbHscSection(row); }; });
}

/* ===== Sales Price By Quantity (entitas baru) ===== */
function wirePsbSpqTab(row){
  wirePsbSpqRows(row);
  document.getElementById('btnPsbSpqAdd').onclick = (e) => { e.preventDefault(); row.salesPriceByQuantity.push({qtyMin:0, qtyMax:0, harga:0}); renderPsbSpqSection(row); };
}
function renderPsbSpqSection(row){ document.getElementById('psbSpqTbody').innerHTML = tplPsbSpqRows(row.salesPriceByQuantity); wirePsbSpqRows(row); }
function wirePsbSpqRows(row){
  const tbody = document.getElementById('psbSpqTbody');
  tbody.querySelectorAll('[data-spq-min]').forEach(inp => { inp.oninput = (e) => { row.salesPriceByQuantity[+e.target.dataset.spqMin].qtyMin = Number(e.target.value)||0; }; });
  tbody.querySelectorAll('[data-spq-max]').forEach(inp => { inp.oninput = (e) => { row.salesPriceByQuantity[+e.target.dataset.spqMax].qtyMax = Number(e.target.value)||0; }; });
  tbody.querySelectorAll('[data-spq-harga]').forEach(inp => { inp.oninput = (e) => { row.salesPriceByQuantity[+e.target.dataset.spqHarga].harga = Number(e.target.value)||0; }; });
  tbody.querySelectorAll('[data-spq-del]').forEach(btn => { btn.onclick = () => { row.salesPriceByQuantity.splice(+btn.dataset.spqDel, 1); renderPsbSpqSection(row); }; });
}

/* ===== Simpan ===== */
function psbSave(mode, idx, row){
  const nama = document.getElementById('fPsbNama').value.trim();
  if(!nama){ document.getElementById('fPsbNamaErr').style.display='block'; return; }

  row.nama = nama;
  row.kodeBarangPajak = document.getElementById('fPsbKodeBarangPajak').value;
  row.kodeAlkes = document.getElementById('fPsbKodeAlkes').value;
  row.namaAlkes = document.getElementById('fPsbNamaAlkes').value;
  row.kodeItemFarma = document.getElementById('fPsbKodeItemFarma').value;
  row.namaItemFarma = document.getElementById('fPsbNamaItemFarma').value;
  row.kodeItemPrincipal = document.getElementById('fPsbKodeItemPrincipal').value;
  row.tipeUkuran = document.getElementById('fPsbTipeUkuran').value;
  row.tipeBarang = document.getElementById('fPsbTipeBarang').value;
  row.kelas = document.getElementById('fPsbKelas').value;

  const katKode = document.getElementById('fPsbKategoriKode').value;
  row.kategoriKode = katKode;
  const kat = DATA.kategoriBarang.find(k=>k.kode===katKode);
  row.kategori = kat ? kat.nama : '';

  row.katReorderingSheetKode = document.getElementById('fPsbKatReorderingSheet').value;
  row.farmaKode = document.getElementById('fPsbFarma').value;
  row.subFarmaKode = document.getElementById('fPsbSubFarma').value;
  row.bentukSediaanKode = document.getElementById('fPsbBentukSediaan').value;
  row.konversiSatuanDasar = Number(document.getElementById('fPsbKonversiSatuanDasar').value)||1;
  row.kekuatanSediaan = document.getElementById('fPsbKekuatanSediaan').value;
  row.namaJenisObat = document.getElementById('fPsbNamaJenisObat').value;
  row.nie = document.getElementById('fPsbNie').value;
  row.tglEfektif = document.getElementById('fPsbTglEfektif').value;
  row.tglExpired = document.getElementById('fPsbTglExpired').value;
  row.tipePenyimpanan = document.getElementById('fPsbTipePenyimpanan').value;
  row.qtyKelipatanOrder = Number(document.getElementById('fPsbQtyKelipatanOrder').value)||1;
  row.hsCode = document.getElementById('fPsbHsCode').value;
  row.memo = document.getElementById('fPsbMemo').value;

  row.tampilkanMinimumMargin = document.getElementById('fPsbMinMargin').checked;
  row.sembunyikanNamaBarang = document.getElementById('fPsbSembunyikanNama').checked;
  row.holdPembelian = document.getElementById('fPsbHoldPembelian').checked;
  row.holdPenjualan = document.getElementById('fPsbHoldPenjualan').checked;
  row.holdTransaksiInventory = document.getElementById('fPsbHoldTransaksiInv').checked;
  row.barangBonus = document.getElementById('fPsbBarangBonus').checked;
  row.statusBarang = document.querySelector('input[name="fPsbStatus"]:checked').value;

  row.divisi = document.getElementById('fPsbDivisi').value;
  row.konsinyasiIn = document.getElementById('fPsbKonsinyasiIn').checked;

  // Satuan Dasar disinkronkan ke field lama `satuan` (dipakai luas modul lain)
  if(row.satuanDetail.dasar.satuan) row.satuan = row.satuanDetail.dasar.satuan;

  // Total stok (field lama `stok`) = jumlah Stock semua baris Lokasi Gudang,
  // konsisten dgn cara DATA.persediaan menghasilkan total per barang.
  if(row.lokasiGudang.length) row.stok = row.lokasiGudang.reduce((s,r)=>s+(Number(r.stock)||0), 0);

  if(mode === 'add'){
    DATA.items.push(row);
  } else {
    DATA.items[idx] = row;
  }
  renderPsbList();
}

function openPsbDeleteConfirm(idx){
  closeModal();
  const row = DATA.items[idx];
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.innerHTML = tplPsbDeleteConfirm(row);
  document.body.appendChild(overlay);
  document.getElementById('modalClose').onclick = closeModal;
  document.getElementById('modalCancel').onclick = closeModal;
  overlay.onclick = (e) => { if(e.target === overlay) closeModal(); };
  document.getElementById('modalDelete').onclick = () => {
    DATA.items.splice(idx, 1);
    closeModal();
    renderPsbTable();
  };
}
