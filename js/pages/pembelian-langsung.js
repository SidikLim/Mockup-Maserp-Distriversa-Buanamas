/* =========================================================
   LOGIC (JS saja) — Pembelian Langsung (Supplier & Pembelian >
   Daftar Transaksi). Dimuat otomatis (lazy-load) oleh core.js
   saat menu ini pertama kali diklik — lihat PAGE_MODULES di
   js/core.js. Markup HTML-nya ada di file sebelah:
   pembelian-langsung.template.js (catatan desain lengkap di
   headernya). NB: closeModal() dipakai bersama (core.js).

   Alur inti:
   - Pembelian tanpa PO/BPB: supplier + rincian barang/jasa bebas
     (Kode Barang opsional — jasa boleh kosong, Nama Barang
     textarea bebas persis screenshot "Raynaldy Kent & Sarah
     Aulia / CGK - SUB").
   - Aritmetika per baris: Total Disc% = Fee Distribusi% + Budget
     Diskon%; Disc/Barang = Qty x Harga x TotalDisc%; Jumlah =
     Qty x Harga - Disc/Barang. Panel bawah: bruto - Diskon1% -
     Diskon2% (berjenjang) = DPP; PPN inklusif/eksklusif 11%;
     PPh dipotong mengurangi; Jumlah = DPP + PPN - PPh + Ongkos
     Angkut; Sisa Jumlah = Jumlah - Uang Muka Pakai - Pembayaran.
     Semua recalc live (plRecalc).
   - Sisa U.Muka otomatis dari total Uang Muka Supplier
     (DATA.uangMukaSupplier) milik supplier terpilih; "Pakai"
     divalidasi <= sisa.
   - Jurnal Otomatis (radio): Buat Jurnal membuat D beban 5210002
     (gudang Non Stock) / 1130001 Persediaan (gudang stock) +
     D 1140002 PPN Masukan lawan K 2110001 Hutang Usaha (Kredit) /
     1100002 Kas Besar (Tunai) + K 1140003 bila PPh; baris
     readonly. Jurnal Manual: baris editable + Tambah; Simpan
     menolak jurnal tidak balance.
   - Tipe Transaksi list = "Pembelian Kredit"/"Pembelian Tunai"
     dari Syarat Bayar; Hapus di list NONAKTIF bila Pembayaran>0.
   - Cetak -> preview faktur kop DBM; Perbaharui Kurs & Import
     Barang -> modal info (mockup); tombol + Multi Batch -> modal
     input batch. Data: DATA.pembelianLangsung. */

var plState = { bulan:'08|2026', search:'' };

function renderPembelianLangsungPage(){
  plState = { bulan:'08|2026', search:'' };
  renderPlList();
}

function renderPlList(){
  content.innerHTML = tplPembelianLangsungListPage(plState.bulan);
  document.getElementById('btnPlAdd').onclick = () => openPlForm('add', null);
  document.getElementById('plFilterBulan').onchange = (e) => { plState.bulan = e.target.value; renderPlTable(); };
  document.getElementById('plSearch').oninput = (e) => { plState.search = e.target.value; renderPlTable(); };
  renderPlTable();
}

function plFilteredRows(){
  const q = plState.search.trim().toLowerCase();
  const parts = plState.bulan.split('|');
  const mm = parts[0], yy = parts[1];
  return (DATA.pembelianLangsung || []).filter(r => {
    if(mm && !(r.tglFaktur||'').includes('/' + mm + '/' + yy)) return false;
    if(q && !(
      r.no.toLowerCase().includes(q) ||
      (r.supplier||'').toLowerCase().includes(q) ||
      plTipeTransaksi(r).toLowerCase().includes(q) ||
      (r.keterangan||'').toLowerCase().includes(q))) return false;
    return true;
  });
}

function renderPlTable(){
  const rows = plFilteredRows();
  const tbody = document.getElementById('plTbody');
  tbody.innerHTML = tplPlRows(rows);
  document.getElementById('plTotal').textContent = `Total Record: ${rows.length}`;
  const idxOf = (r) => DATA.pembelianLangsung.indexOf(r);
  tbody.querySelectorAll('[data-view-link]').forEach(b => b.onclick = () => openPlForm('view', idxOf(rows[+b.dataset.viewLink])));
  tbody.querySelectorAll('[data-pl-view]').forEach(b => b.onclick = () => openPlForm('view', idxOf(rows[+b.dataset.plView])));
  tbody.querySelectorAll('[data-pl-edit]').forEach(b => b.onclick = () => openPlForm('edit', idxOf(rows[+b.dataset.plEdit])));
  tbody.querySelectorAll('[data-pl-del]').forEach(b => {
    if(b.disabled) return;
    b.onclick = () => openPlDelete(idxOf(rows[+b.dataset.plDel]));
  });
}

/* Nomor otomatis per cabang: 26/PU/{kode}/08/{urut} — ikut menghitung
   nomor PU yang sudah dipakai faktur Pembelian Melalui BPB supaya
   tidak bentrok. */
function plGenerateNo(cabang){
  const kode = PL_CABANG_CODE[cabang] || 'HO';
  const prefix = `26/PU/${kode}/08/`;
  let max = 0;
  const scan = (arr) => (arr || []).forEach(r => {
    if(r.no && r.no.startsWith(prefix)){
      const n = parseInt(r.no.slice(prefix.length), 10);
      if(!isNaN(n) && n > max) max = n;
    }
  });
  scan(DATA.pembelianLangsung);
  scan(DATA.pembelianBPB);
  return prefix + String(max + 1).padStart(5, '0');
}

/* Sisa uang muka supplier terpilih (total Uang Muka Supplier). */
function plSisaUangMuka(supplier){
  if(!supplier) return 0;
  return (DATA.uangMukaSupplier || [])
    .filter(u => (u.supplier||'').toLowerCase() === supplier.toLowerCase())
    .reduce((a,u) => a + Number(u.jumlahTotal||0), 0);
}

function plJurnalTotals(row){
  let d = 0, k = 0;
  (row.jurnalAkun || []).forEach(e => { d += Number(e.debit || 0); k += Number(e.kredit || 0); });
  return { debit: d, kredit: k, selisih: d - k };
}

/* ===== Aritmetika ===== */
function plRecalcItem(it){
  it.totalDisc = Number(it.feeDistribusi||0) + Number(it.budgetDiskon||0);
  const bruto = Number(it.qty||0) * Number(it.hargaBeli||0);
  it.discBarang = bruto * it.totalDisc / 100;
  it.jumlah = bruto - it.discBarang;
}

function plRecalc(row){
  (row.items || []).forEach(plRecalcItem);
  const bruto = (row.items || []).reduce((a,it) => a + Number(it.jumlah||0), 0);
  row.diskon1Amount = bruto * Number(row.diskon1||0) / 100;
  const after1 = bruto - row.diskon1Amount;
  row.diskon2Amount = after1 * Number(row.diskon2||0) / 100;
  let base = after1 - row.diskon2Amount;
  if(row.ppnMode === 'eksklusif'){
    row.pajak11 = 'PPN11';
    row.dpp = base;
    row.ppnAmount = base * 0.11;
  } else if(row.ppnMode === 'inklusif'){
    row.pajak11 = 'PPN11';
    row.dpp = base * 100 / 111;
    row.ppnAmount = base - row.dpp;
  } else {
    row.pajak11 = '';
    row.dpp = base;
    row.ppnAmount = 0;
  }
  row.pphAmount = row.pphKode ? (row.dpp * Number(row.pphPersen||0) / 100) : 0;
  row.jumlahTotal = row.dpp + row.ppnAmount - row.pphAmount + Number(row.ongkosAngkut||0);
  row.sisaUangMuka = plSisaUangMuka(row.supplier);
  if(Number(row.uangMukaPakai||0) > row.sisaUangMuka) row.uangMukaPakai = row.sisaUangMuka;
  row.sisaJumlah = row.jumlahTotal - Number(row.uangMukaPakai||0) - Number(row.pembayaran||0);

  const set = (id, v) => { const el = document.getElementById(id); if(el) el.value = v; };
  set('fPlDiskon1Amount', plNum2(row.diskon1Amount));
  set('fPlDiskon2Amount', plNum2(row.diskon2Amount));
  set('fPlDpp', plNum2(row.dpp));
  set('fPlPajakKode', row.pajak11);
  set('fPlPpnAmount', plNum2(row.ppnAmount));
  set('fPlPphAmount', plNum2(row.pphAmount));
  set('fPlSisaUm', plNum2(row.sisaUangMuka));
  set('fPlJumlah', plNum2(row.jumlahTotal));
  set('fPlSisaJumlah', plNum2(row.sisaJumlah));
  const lbl = document.getElementById('plPajakPersenLabel');
  if(lbl) lbl.textContent = (row.ppnMode==='eksklusif'||row.ppnMode==='inklusif') ? '11' : '0';
  const plbl = document.getElementById('plPphPersenLabel');
  if(plbl) plbl.textContent = row.pphKode ? row.pphPersen : 0;
  // Refresh kolom hitung baris barang tanpa render ulang (fokus aman)
  (row.items || []).forEach((it, idx) => {
    const g = (sel) => document.querySelector(`[data-pl-${sel}="${idx}"]`);
    const t = g('totaldisc'); if(t) t.value = it.totalDisc;
    const dsc = g('discbarang'); if(dsc) dsc.value = plNum2(it.discBarang);
    const j = g('jumlah'); if(j) j.value = plNum2(it.jumlah);
  });
}

/* Jurnal otomatis. */
function plBuildJurnal(row){
  const ket = row.supplierNoFaktur || row.keterangan || row.no;
  const nonStock = (row.gudang||'').indexOf('Non Stock') === 0;
  const akunBeban = nonStock ? '5210002' : '1130001';
  const kredit = plTipeTransaksi(row) === 'Pembelian Kredit' ? '2110001' : '1100002';
  const list = [
    { kodeAkun: akunBeban, namaAkun: plAkunNama(akunBeban), keterangan: ket, debit: row.dpp + Number(row.ongkosAngkut||0), kredit: 0 },
  ];
  if(row.ppnAmount > 0.004){
    list.push({ kodeAkun:'1140002', namaAkun: plAkunNama('1140002'), keterangan: ket, debit: row.ppnAmount, kredit: 0 });
  }
  list.push({ kodeAkun: kredit, namaAkun: plAkunNama(kredit), keterangan: ket, debit: 0, kredit: row.jumlahTotal });
  if(row.pphAmount > 0.004){
    list.push({ kodeAkun:'1140003', namaAkun: plAkunNama('1140003'), keterangan: `PPh dipotong ${row.pphKode}`, debit: 0, kredit: row.pphAmount });
  }
  return list;
}

/* =====================================================================
   FORM add / edit / view
===================================================================== */
function openPlForm(mode, idx){
  const src = idx != null ? DATA.pembelianLangsung[idx] : null;
  const row = src ? JSON.parse(JSON.stringify(src)) : {
    no: plGenerateNo('Head Office'), cabang: 'Head Office',
    supplier: '', supplierNoFaktur: '', tglFaktur: '31/08/2026',
    syaratBayar: 'Kredit 14 Hari', tglJthTempo: '14/09/2026',
    gudang: 'Non Stock Head Office', jurnal: 'JURNAL PEMBELIAN KREDIT (IDR)',
    alamatPengiriman: '', penerimaanKonsinyasi: false, keterangan: '',
    kurs: 1, ppnMode: 'tidak', diskon1: 0, diskon1Amount: 0, diskon2: 0, diskon2Amount: 0,
    dpp: 0, pajak11: '', ppnAmount: 0, pphKode: '', pphPersen: 0, pphAmount: 0,
    ongkosAngkut: 0, jumlahTotal: 0, sisaJumlah: 0, pembayaran: 0,
    uangMukaTipe: 'Oldest', sisaUangMuka: 0, uangMukaPakai: 0,
    jurnalMode: 'otomatis',
    items: [{ kode:'', nama:'', batch:'', qty:1, satuan:'UNIT', hargaBeli:0, feeDistribusi:0, budgetDiskon:0, totalDisc:0, discBarang:0, jumlah:0 }],
    jurnalAkun: [], userInput: 'sidik',
  };
  const isView = mode === 'view';
  content.innerHTML = tplPlForm(mode, row);

  const back = () => renderPlList();
  document.getElementById('plBatalkan').onclick = (e) => { e.preventDefault(); back(); };
  document.getElementById('btnPlTutorial').onclick = () => openPlInfo('Tutorial', 'Video tutorial Pembelian Langsung tersedia di portal MASERP (mockup).');

  // Tabs
  const tabR = document.getElementById('plTabRincianBtn');
  const tabJ = document.getElementById('plTabJurnalBtn');
  const contR = document.getElementById('plTabRincianContent');
  const contJ = document.getElementById('plTabJurnalContent');
  tabR.onclick = () => { tabR.classList.add('active'); tabJ.classList.remove('active'); contR.style.display = ''; contJ.style.display = 'none'; };
  tabJ.onclick = () => { tabJ.classList.add('active'); tabR.classList.remove('active'); contJ.style.display = ''; contR.style.display = 'none'; };

  wirePlItems(row, isView);
  wirePlJurnalTab(row, isView);
  wirePlBottomPanel(row, isView);
  if(isView) return;

  const refreshNoBtn = document.getElementById('plRefreshNo');
  if(refreshNoBtn) refreshNoBtn.onclick = () => { row.no = plGenerateNo(row.cabang); document.getElementById('fPlNo').value = row.no; };

  document.getElementById('fPlCabang').onchange = (e) => {
    row.cabang = e.target.value;
    row.gudang = 'Non Stock ' + row.cabang;
    document.getElementById('fPlGudang').innerHTML = tplPlGudangOptions(row.cabang, row.gudang);
    if(mode === 'add'){ row.no = plGenerateNo(row.cabang); document.getElementById('fPlNo').value = row.no; }
  };
  document.getElementById('fPlGudang').onchange = (e) => { row.gudang = e.target.value; };
  document.getElementById('fPlSyaratBayar').onchange = (e) => { row.syaratBayar = e.target.value; };
  document.getElementById('fPlKonsinyasi').onchange = (e) => { row.penerimaanKonsinyasi = e.target.checked; };

  document.getElementById('plSupplierSearch').onclick = () => openPlSupplierPicker((nama) => {
    row.supplier = nama;
    document.getElementById('fPlSupplier').value = nama.toUpperCase();
    plRecalc(row); // refresh Sisa U.Muka supplier tsb
  });

  document.getElementById('plAddItem').onclick = (e) => {
    e.preventDefault();
    plReadItems(row);
    row.items.push({ kode:'', nama:'', batch:'', qty:1, satuan:'UNIT', hargaBeli:0, feeDistribusi:0, budgetDiskon:0, totalDisc:0, discBarang:0, jumlah:0 });
    wirePlItems(row, isView);
    plRecalc(row);
  };
  document.getElementById('plImportBarang').onclick = (e) => {
    e.preventDefault();
    openPlInfo('Import Barang', 'Import barang dari file Excel (mockup) — pada aplikasi asli akan membuka dialog upload.');
  };

  document.getElementById('plPerbaharuiKurs').onclick = () => openPlInfo('Perbaharui Kurs', 'Kurs IDR = 1,00 (mata uang lokal, tidak perlu diperbaharui).');
  document.getElementById('plCetak').onclick = () => { plReadForm(row); plRecalc(row); openPlPrint(row); };
  document.getElementById('plSimpan').onclick = () => { if(plSave(mode, idx, row)) back(); };
}

/* Baca nilai baris barang dari DOM ke state. */
function plReadItems(row){
  row.items.forEach((it, idx) => {
    const g = (sel) => document.querySelector(`[data-pl-${sel}="${idx}"]`);
    const nama = g('nama'); if(nama) it.nama = nama.value;
    const qty = g('qty'); if(qty) it.qty = Number(qty.value) || 0;
    const sat = g('satuan'); if(sat) it.satuan = sat.value;
    const harga = g('harga'); if(harga) it.hargaBeli = Number(harga.value) || 0;
    const fee = g('fee'); if(fee) it.feeDistribusi = Number(fee.value) || 0;
    const bud = g('budget'); if(bud) it.budgetDiskon = Number(bud.value) || 0;
  });
}

function wirePlItems(row, isView){
  document.getElementById('plItemsBody').innerHTML = tplPlItemRows(row.items, isView);
  if(isView) return;
  const onEdit = () => { plReadItems(row); plRecalc(row); };
  ['qty','harga','fee','budget'].forEach(sel => {
    document.querySelectorAll(`[data-pl-${sel}]`).forEach(inp => inp.oninput = onEdit);
  });
  document.querySelectorAll('[data-pl-nama]').forEach(inp => inp.oninput = () => { row.items[+inp.dataset.plNama].nama = inp.value; });
  document.querySelectorAll('[data-pl-satuan]').forEach(sel => sel.onchange = () => { row.items[+sel.dataset.plSatuan].satuan = sel.value; });
  document.querySelectorAll('[data-pl-item-del]').forEach(b => b.onclick = () => {
    plReadItems(row);
    row.items.splice(+b.dataset.plItemDel, 1);
    wirePlItems(row, isView);
    plRecalc(row);
  });
  document.querySelectorAll('[data-pl-item-search]').forEach(b => b.onclick = () => {
    const i = +b.dataset.plItemSearch;
    openPlItemPicker((barang) => {
      plReadItems(row);
      row.items[i].kode = barang.kode;
      row.items[i].nama = barang.nama;
      row.items[i].hargaBeli = barang.harga || 0;
      if(PL_SATUAN_LIST.includes(barang.satuan)) row.items[i].satuan = barang.satuan;
      wirePlItems(row, isView);
      plRecalc(row);
    });
  });
  document.querySelectorAll('[data-pl-batch]').forEach(b => b.onclick = () => {
    const i = +b.dataset.plBatch;
    plReadItems(row);
    openPlBatch(row.items[i]);
  });
}

/* ----- Panel bawah: PPN, diskon, uang muka, pph, ongkos ----- */
function wirePlBottomPanel(row, isView){
  if(isView) return;
  document.querySelectorAll('input[name="plPpnMode"]').forEach(r => r.onchange = () => { row.ppnMode = r.value; plRecalc(row); });
  document.querySelectorAll('input[name="plUmTipe"]').forEach(r => r.onchange = () => { row.uangMukaTipe = r.value; });
  document.getElementById('fPlDiskon1').oninput = (e) => { row.diskon1 = Number(e.target.value) || 0; plRecalc(row); };
  document.getElementById('fPlDiskon2').oninput = (e) => { row.diskon2 = Number(e.target.value) || 0; plRecalc(row); };
  document.getElementById('fPlUmPakai').oninput = (e) => {
    let v = Number(e.target.value) || 0;
    const sisa = plSisaUangMuka(row.supplier);
    if(v > sisa){ v = sisa; e.target.value = v; }
    row.uangMukaPakai = v;
    plRecalc(row);
  };
  document.getElementById('fPlOngkosAngkut').oninput = (e) => { row.ongkosAngkut = Number(e.target.value) || 0; plRecalc(row); };
  document.getElementById('plPajakInfo').onclick = () => openPlInfo('Kode Pajak', 'Kode pajak PPN11 (11%) dipakai otomatis saat mode PPN Inklusif / Eksklusif dipilih di Informasi PPN.');
  document.getElementById('plPphSearch').onclick = () => openPlPphPicker((p) => {
    row.pphKode = p.kode; row.pphPersen = p.persen;
    document.getElementById('fPlPphKode').value = p.kode;
    plRecalc(row);
  });
  document.getElementById('plPphClear').onclick = () => {
    row.pphKode = ''; row.pphPersen = 0;
    document.getElementById('fPlPphKode').value = '';
    plRecalc(row);
  };
}

/* ----- Tab Rincian Jurnal Akun ----- */
function wirePlJurnalTab(row, isView){
  const cont = document.getElementById('plTabJurnalContent');
  cont.innerHTML = tplPlJurnalContent(row, isView);
  if(isView) return;

  const rerender = () => wirePlJurnalTab(row, isView);
  const refreshSelisih = () => {
    const t = plJurnalTotals(row);
    const el = document.getElementById('plJurnalSelisih');
    el.value = plNum2(t.selisih);
    el.style.color = Math.abs(t.selisih) > 0.004 ? 'var(--red)' : 'var(--text)';
  };

  cont.querySelectorAll('input[name="plJurnalMode"]').forEach(r => r.onchange = () => {
    row.jurnalMode = r.value;
    rerender();
  });
  document.getElementById('plBuatJurnal').onclick = () => {
    plReadItems(row);
    plRecalc(row);
    if(row.dpp <= 0){ openPlInfo('Buat Jurnal', 'Isi rincian barang terlebih dahulu di tab Rincian Transaksi.'); return; }
    row.jurnalAkun = plBuildJurnal(row);
    rerender();
  };
  const addBtn = document.getElementById('plJurnalAddRow');
  if(addBtn) addBtn.onclick = () => {
    row.jurnalAkun = row.jurnalAkun || [];
    row.jurnalAkun.push({ kodeAkun:'', namaAkun:'', keterangan:'', debit:0, kredit:0 });
    rerender();
  };
  cont.querySelectorAll('[data-pl-jurnal-del]').forEach(b => b.onclick = () => {
    row.jurnalAkun.splice(+b.dataset.plJurnalDel, 1);
    rerender();
  });
  cont.querySelectorAll('[data-pl-jurnal-akun-search]').forEach(b => b.onclick = () => {
    const i = +b.dataset.plJurnalAkunSearch;
    openPlAkunPicker((akun) => {
      row.jurnalAkun[i].kodeAkun = akun.kode;
      row.jurnalAkun[i].namaAkun = akun.nama;
      cont.querySelector(`[data-pl-jurnal-kode="${i}"]`).value = akun.kode;
      cont.querySelector(`[data-pl-jurnal-nama="${i}"]`).value = akun.nama;
    });
  });
  cont.querySelectorAll('[data-pl-jurnal-ket]').forEach(inp => inp.oninput = () => {
    row.jurnalAkun[+inp.dataset.plJurnalKet].keterangan = inp.value;
  });
  cont.querySelectorAll('[data-pl-jurnal-debit]').forEach(inp => inp.oninput = () => {
    row.jurnalAkun[+inp.dataset.plJurnalDebit].debit = Number(inp.value) || 0;
    refreshSelisih();
  });
  cont.querySelectorAll('[data-pl-jurnal-kredit]').forEach(inp => inp.oninput = () => {
    row.jurnalAkun[+inp.dataset.plJurnalKredit].kredit = Number(inp.value) || 0;
    refreshSelisih();
  });
}

/* Baca field form header/bawah ke state. */
function plReadForm(row){
  row.supplierNoFaktur = document.getElementById('fPlSupplierNoFaktur').value.trim();
  row.tglFaktur = document.getElementById('fPlTglFaktur').value.trim();
  row.syaratBayar = document.getElementById('fPlSyaratBayar').value;
  row.tglJthTempo = document.getElementById('fPlTglJthTempo').value.trim();
  row.gudang = document.getElementById('fPlGudang').value;
  row.jurnal = document.getElementById('fPlJurnal').value;
  row.alamatPengiriman = document.getElementById('fPlAlamat').value;
  row.keterangan = document.getElementById('fPlKeterangan').value;
  plReadItems(row);
  row.items = row.items.filter(it => (it.nama||'').trim() || (it.kode||'').trim());
}

/* ----- Simpan + validasi ----- */
function plSave(mode, idx, row){
  plReadForm(row);
  plRecalc(row);

  if(!row.supplier){ openPlInfo('Validasi', 'Supplier wajib dipilih.'); return false; }
  if(!row.tglFaktur){ openPlInfo('Validasi', 'Tgl. Faktur wajib diisi.'); return false; }
  if(!row.items.length){ openPlInfo('Validasi', 'Rincian transaksi minimal 1 barang / jasa.'); return false; }
  if(row.jurnalAkun && row.jurnalAkun.length){
    const t = plJurnalTotals(row);
    if(Math.abs(t.selisih) > 0.004){
      openPlInfo('Jurnal Tidak Balance', `Total Debit (${plNum2(t.debit)}) tidak sama dengan Total Kredit (${plNum2(t.kredit)}). Selisih: ${plNum2(t.selisih)}.`);
      return false;
    }
  }

  DATA.pembelianLangsung = DATA.pembelianLangsung || [];
  if(mode === 'add') DATA.pembelianLangsung.unshift(row);
  else DATA.pembelianLangsung[idx] = row;
  return true;
}

/* =====================================================================
   Modals
===================================================================== */
function plOverlay(html){
  closeModal();
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.innerHTML = html;
  document.body.appendChild(overlay);
  document.getElementById('modalClose').onclick = closeModal;
  const cancel = document.getElementById('modalCancel');
  if(cancel) cancel.onclick = closeModal;
  overlay.onclick = (e) => { if(e.target === overlay) closeModal(); };
  return overlay;
}

function openPlPrint(row){ plOverlay(tplPlPrintModal(row)); }

function openPlBatch(item){
  plOverlay(tplPlBatchModal(item));
  document.getElementById('plBatchOk').onclick = () => {
    item.batch = document.getElementById('fPlBatchInput').value.trim();
    closeModal();
  };
}

function openPlDelete(idx){
  const row = DATA.pembelianLangsung[idx];
  plOverlay(tplPlDeleteConfirm(row));
  document.getElementById('modalDelete').onclick = () => {
    DATA.pembelianLangsung.splice(idx, 1);
    closeModal();
    renderPlTable();
  };
}

function openPlInfo(title, text){
  plOverlay(tplPlInfoModal(title, text));
  document.getElementById('modalOk').onclick = closeModal;
}

function openPlSupplierPicker(onPick){
  const overlay = plOverlay(tplPlSupplierPicker(DATA.suppliers));
  const wire = () => overlay.querySelectorAll('[data-pl-pick-supplier]').forEach(b => b.onclick = () => {
    closeModal();
    onPick(b.dataset.plPickSupplier);
  });
  wire();
  document.getElementById('plSupplierPickerSearch').oninput = (e) => {
    const q = e.target.value.trim().toLowerCase();
    const list = DATA.suppliers.filter(s => !q || s.kode.toLowerCase().includes(q) || s.nama.toLowerCase().includes(q));
    document.getElementById('plSupplierPickerBody').innerHTML = tplPlSupplierPickerRows(list);
    wire();
  };
}

function openPlItemPicker(onPick){
  const overlay = plOverlay(tplPlItemPicker(DATA.items));
  const wire = () => overlay.querySelectorAll('[data-pl-pick-item]').forEach(b => b.onclick = () => {
    const barang = DATA.items.find(x => x.kode === b.dataset.plPickItem);
    closeModal();
    if(barang) onPick(barang);
  });
  wire();
  document.getElementById('plItemPickerSearch').oninput = (e) => {
    const q = e.target.value.trim().toLowerCase();
    const list = DATA.items.filter(x => !q || x.kode.toLowerCase().includes(q) || x.nama.toLowerCase().includes(q));
    document.getElementById('plItemPickerBody').innerHTML = tplPlItemPickerRows(list);
    wire();
  };
}

function openPlPphPicker(onPick){
  const overlay = plOverlay(tplPlPphPicker(PL_PPH_LIST));
  overlay.querySelectorAll('[data-pl-pick-pph]').forEach(b => b.onclick = () => {
    closeModal();
    onPick({ kode: b.dataset.plPickPph, persen: Number(b.dataset.plPickPersen) });
  });
}

function openPlAkunPicker(onPick){
  const overlay = plOverlay(tplPlAkunPicker(DATA.akunGL));
  const wire = () => overlay.querySelectorAll('[data-pl-pick-akun]').forEach(b => b.onclick = () => {
    const akun = DATA.akunGL.find(a => a.kode === b.dataset.plPickAkun);
    closeModal();
    if(akun) onPick(akun);
  });
  wire();
  document.getElementById('plAkunPickerSearch').oninput = (e) => {
    const q = e.target.value.trim().toLowerCase();
    const list = DATA.akunGL.filter(a => !q || a.kode.includes(q) || a.nama.toLowerCase().includes(q));
    document.getElementById('plAkunPickerBody').innerHTML = tplPlAkunPickerRows(list);
    wire();
  };
}
