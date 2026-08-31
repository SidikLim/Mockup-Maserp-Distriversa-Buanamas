/* =========================================================
   LOGIC (JS saja) — Pembelian dari PO (Supplier & Pembelian >
   Daftar Transaksi). Dimuat otomatis (lazy-load) oleh core.js
   saat menu ini pertama kali diklik — lihat PAGE_MODULES di
   js/core.js. Markup HTML-nya ada di file sebelah:
   pembelian-po.template.js (catatan desain lengkap di headernya).
   NB: closeModal() dipakai bersama, didefinisikan di core.js.

   Alur inti:
   - Faktur pembelian DARI Purchase Order: pilih PO (picker
     DATA.purchaseOrder) -> Cabang, Supplier, Syarat Bayar,
     Gudang, Jurnal (jurnalBPB PO), Alamat Pengiriman, mode PPN,
     PPh & barang terisi otomatis. Per baris: Qty. Pesan readonly
     dari PO, Qty EDITABLE (qty difakturkan, default = Qty Pesan,
     di-clamp <= Qty Pesan), Qty. Belum Terima = Qty Pesan - Qty
     (LIVE). Harga/fee/diskon boleh disesuaikan dari nilai PO.
   - Aritmetika = pola Pembelian Langsung (ppoRecalc): TotalDisc%
     = fee + budget; Disc/Barang = Qty x Harga x TotalDisc%;
     bruto - Diskon1% - Diskon2% berjenjang = DPP; PPN 11%
     inklusif/eksklusif; PPh dipotong; + Ongkos Angkut = Jumlah;
     Sisa Jumlah = Jumlah - Uang Muka Pakai - Pembayaran. Sisa
     U.Muka otomatis dari Uang Muka Supplier milik supplier PO
     (termasuk yang dibuat dari PO yang sama).
   - Jurnal Otomatis/Manual (radio): otomatis D 1130001
     Persediaan (DPP + ongkos) + D 1140002 PPN Masukan lawan
     K 2110001 Hutang Usaha (Kredit) / 1100002 Kas Besar (Tunai)
     + K 1140003 bila PPh; manual editable + Tambah; Simpan
     menolak jurnal tidak balance.
   - List: Hapus NONAKTIF bila Pembayaran > 0. No. faktur
     26/PU/{kode}/08/{urut} — generator ikut menghitung PU milik
     Pembelian Melalui BPB & Pembelian Langsung agar tidak
     bentrok. Data: DATA.pembelianPO. */

var ppoState = { bulan:'08|2026', search:'' };

function renderPembelianPOPage(){
  ppoState = { bulan:'08|2026', search:'' };
  renderPpoList();
}

function renderPpoList(){
  content.innerHTML = tplPembelianPOListPage(ppoState.bulan);
  document.getElementById('btnPpoAdd').onclick = () => openPpoForm('add', null);
  document.getElementById('ppoFilterBulan').onchange = (e) => { ppoState.bulan = e.target.value; renderPpoTable(); };
  document.getElementById('ppoSearch').oninput = (e) => { ppoState.search = e.target.value; renderPpoTable(); };
  renderPpoTable();
}

function ppoFilteredRows(){
  const q = ppoState.search.trim().toLowerCase();
  const parts = ppoState.bulan.split('|');
  const mm = parts[0], yy = parts[1];
  return (DATA.pembelianPO || []).filter(r => {
    if(mm && !(r.tglFaktur||'').includes('/' + mm + '/' + yy)) return false;
    if(q && !(
      r.no.toLowerCase().includes(q) ||
      (r.noPO||'').toLowerCase().includes(q) ||
      (r.supplier||'').toLowerCase().includes(q) ||
      ppoTipeTransaksi(r).toLowerCase().includes(q) ||
      (r.keterangan||'').toLowerCase().includes(q))) return false;
    return true;
  });
}

function renderPpoTable(){
  const rows = ppoFilteredRows();
  const tbody = document.getElementById('ppoTbody');
  tbody.innerHTML = tplPpoRows(rows);
  document.getElementById('ppoTotal').textContent = `Total Record: ${rows.length}`;
  const idxOf = (r) => DATA.pembelianPO.indexOf(r);
  tbody.querySelectorAll('[data-view-link]').forEach(b => b.onclick = () => openPpoForm('view', idxOf(rows[+b.dataset.viewLink])));
  tbody.querySelectorAll('[data-ppo-view]').forEach(b => b.onclick = () => openPpoForm('view', idxOf(rows[+b.dataset.ppoView])));
  tbody.querySelectorAll('[data-ppo-edit]').forEach(b => b.onclick = () => openPpoForm('edit', idxOf(rows[+b.dataset.ppoEdit])));
  tbody.querySelectorAll('[data-ppo-del]').forEach(b => {
    if(b.disabled) return;
    b.onclick = () => openPpoDelete(idxOf(rows[+b.dataset.ppoDel]));
  });
}

/* Nomor otomatis per cabang: 26/PU/{kode}/08/{urut} — ikut menghitung
   PU milik Pembelian Melalui BPB & Pembelian Langsung. */
function ppoGenerateNo(cabang){
  const kode = PPO_CABANG_CODE[cabang] || 'HO';
  const prefix = `26/PU/${kode}/08/`;
  let max = 0;
  const scan = (arr) => (arr || []).forEach(r => {
    if(r.no && r.no.startsWith(prefix)){
      const n = parseInt(r.no.slice(prefix.length), 10);
      if(!isNaN(n) && n > max) max = n;
    }
  });
  scan(DATA.pembelianPO);
  scan(DATA.pembelianLangsung);
  scan(DATA.pembelianBPB);
  return prefix + String(max + 1).padStart(5, '0');
}

function ppoSisaUangMuka(supplier){
  if(!supplier) return 0;
  return (DATA.uangMukaSupplier || [])
    .filter(u => (u.supplier||'').toLowerCase() === supplier.toLowerCase())
    .reduce((a,u) => a + Number(u.jumlahTotal||0), 0);
}

function ppoJurnalTotals(row){
  let d = 0, k = 0;
  (row.jurnalAkun || []).forEach(e => { d += Number(e.debit || 0); k += Number(e.kredit || 0); });
  return { debit: d, kredit: k, selisih: d - k };
}

/* ===== Aritmetika (pola Pembelian Langsung) ===== */
function ppoRecalcItem(it){
  it.totalDisc = Number(it.feeDistribusi||0) + Number(it.budgetDiskon||0);
  const bruto = Number(it.qty||0) * Number(it.hargaBeli||0);
  it.discBarang = bruto * it.totalDisc / 100;
  it.jumlah = bruto - it.discBarang;
}

function ppoRecalc(row){
  (row.items || []).forEach(ppoRecalcItem);
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
  row.sisaUangMuka = ppoSisaUangMuka(row.supplier);
  if(Number(row.uangMukaPakai||0) > row.sisaUangMuka) row.uangMukaPakai = row.sisaUangMuka;
  row.sisaJumlah = row.jumlahTotal - Number(row.uangMukaPakai||0) - Number(row.pembayaran||0);

  const set = (id, v) => { const el = document.getElementById(id); if(el) el.value = v; };
  set('fPpoDiskon1Amount', ppoNum2(row.diskon1Amount));
  set('fPpoDiskon2Amount', ppoNum2(row.diskon2Amount));
  set('fPpoDpp', ppoNum2(row.dpp));
  set('fPpoPajakKode', row.pajak11);
  set('fPpoPpnAmount', ppoNum2(row.ppnAmount));
  set('fPpoPphAmount', ppoNum2(row.pphAmount));
  set('fPpoSisaUm', ppoNum2(row.sisaUangMuka));
  set('fPpoJumlah', ppoNum2(row.jumlahTotal));
  set('fPpoSisaJumlah', ppoNum2(row.sisaJumlah));
  const lbl = document.getElementById('ppoPajakPersenLabel');
  if(lbl) lbl.textContent = (row.ppnMode==='eksklusif'||row.ppnMode==='inklusif') ? '11' : '0';
  const plbl = document.getElementById('ppoPphPersenLabel');
  if(plbl) plbl.textContent = row.pphKode ? row.pphPersen : 0;
  (row.items || []).forEach((it, idx) => {
    const g = (sel) => document.querySelector(`[data-ppo-${sel}="${idx}"]`);
    const t = g('totaldisc'); if(t) t.value = it.totalDisc;
    const dsc = g('discbarang'); if(dsc) dsc.value = ppoNum2(it.discBarang);
    const j = g('jumlah'); if(j) j.value = ppoNum2(it.jumlah);
    const belum = g('belum'); if(belum) belum.value = Math.max(0, Number(it.qtyPesan||0) - Number(it.qty||0)).toLocaleString('id-ID');
  });
}

/* Jurnal otomatis — barang PO = persediaan. */
function ppoBuildJurnal(row){
  const ket = row.noPO || row.supplierNoFaktur || row.no;
  const kredit = ppoTipeTransaksi(row) === 'Pembelian Kredit' ? '2110001' : '1100002';
  const list = [
    { kodeAkun:'1130001', namaAkun: ppoAkunNama('1130001'), keterangan: ket, debit: row.dpp + Number(row.ongkosAngkut||0), kredit: 0 },
  ];
  if(row.ppnAmount > 0.004){
    list.push({ kodeAkun:'1140002', namaAkun: ppoAkunNama('1140002'), keterangan: ket, debit: row.ppnAmount, kredit: 0 });
  }
  list.push({ kodeAkun: kredit, namaAkun: ppoAkunNama(kredit), keterangan: ket, debit: 0, kredit: row.jumlahTotal });
  if(row.pphAmount > 0.004){
    list.push({ kodeAkun:'1140003', namaAkun: ppoAkunNama('1140003'), keterangan: `PPh dipotong ${row.pphKode}`, debit: 0, kredit: row.pphAmount });
  }
  return list;
}

/* =====================================================================
   FORM add / edit / view
===================================================================== */
function openPpoForm(mode, idx){
  const src = idx != null ? DATA.pembelianPO[idx] : null;
  const row = src ? JSON.parse(JSON.stringify(src)) : {
    no: ppoGenerateNo('Head Office'), cabang: 'Head Office', noPO: '',
    supplier: '', supplierNoFaktur: '', tglFaktur: '31/08/2026',
    syaratBayar: '', tglJthTempo: '31/08/2026',
    gudang: 'Gudang Utama-HO', jurnal: '',
    alamatPengiriman: (DATA.cabangMaster[0]||{}).alamat ? `${DATA.cabangMaster[0].alamat}, ${DATA.cabangMaster[0].kota||''}` : '',
    keterangan: '', kurs: 1, ppnMode: 'tidak',
    diskon1: 0, diskon1Amount: 0, diskon2: 0, diskon2Amount: 0,
    dpp: 0, pajak11: '', ppnAmount: 0, pphKode: '', pphPersen: 0, pphAmount: 0,
    ongkosAngkut: 0, jumlahTotal: 0, sisaJumlah: 0, pembayaran: 0,
    uangMukaTipe: 'Oldest', sisaUangMuka: 0, uangMukaPakai: 0,
    jurnalMode: 'otomatis', items: [], jurnalAkun: [], userInput: 'sidik',
  };
  const isView = mode === 'view';
  content.innerHTML = tplPpoForm(mode, row);

  const back = () => renderPpoList();
  document.getElementById('ppoBatalkan').onclick = (e) => { e.preventDefault(); back(); };
  document.getElementById('btnPpoTutorial').onclick = () => openPpoInfo('Tutorial', 'Video tutorial Pembelian dari PO tersedia di portal MASERP (mockup).');

  // Tabs
  const tabR = document.getElementById('ppoTabRincianBtn');
  const tabJ = document.getElementById('ppoTabJurnalBtn');
  const contR = document.getElementById('ppoTabRincianContent');
  const contJ = document.getElementById('ppoTabJurnalContent');
  tabR.onclick = () => { tabR.classList.add('active'); tabJ.classList.remove('active'); contR.style.display = ''; contJ.style.display = 'none'; };
  tabJ.onclick = () => { tabJ.classList.add('active'); tabR.classList.remove('active'); contJ.style.display = ''; contR.style.display = 'none'; };

  wirePpoItems(row, isView);
  wirePpoJurnalTab(row, isView);
  wirePpoBottomPanel(row, isView);
  if(isView) return;

  const refreshNoBtn = document.getElementById('ppoRefreshNo');
  if(refreshNoBtn) refreshNoBtn.onclick = () => { row.no = ppoGenerateNo(row.cabang); document.getElementById('fPpoNo').value = row.no; };

  document.getElementById('fPpoSyaratBayar').onchange = (e) => { row.syaratBayar = e.target.value; };

  document.getElementById('ppoPoSearch').onclick = () => openPpoPoPicker((po) => ppoApplyPo(row, po, mode, isView));

  document.getElementById('ppoPerbaharuiKurs').onclick = () => openPpoInfo('Perbaharui Kurs', 'Kurs IDR = 1,00 (mata uang lokal, tidak perlu diperbaharui).');
  document.getElementById('ppoCetak').onclick = () => { ppoReadForm(row); ppoRecalc(row); openPpoPrint(row); };
  document.getElementById('ppoSimpan').onclick = () => { if(ppoSave(mode, idx, row)) back(); };
}

/* Terapkan PO terpilih ke form. */
function ppoApplyPo(row, po, mode, isView){
  row.noPO = po.no;
  row.cabang = po.cabang || row.cabang;
  row.supplier = po.supplier || '';
  row.syaratBayar = po.syaratBayar || '';
  row.tglJthTempo = po.etd || row.tglJthTempo;
  row.gudang = po.gudang || row.gudang;
  row.jurnal = po.jurnalBPB || '';
  row.alamatPengiriman = po.alamatPengiriman || row.alamatPengiriman;
  row.ppnMode = po.ppnMode || 'tidak';
  row.pphKode = po.pphAktif ? (po.pphKode || '') : '';
  row.pphPersen = po.pphAktif ? (po.pphPersen || 0) : 0;
  row.items = (po.items || []).map(it => ({
    kode: it.kode, nama: it.nama, batch: '',
    qtyPesan: it.qty || 0, qty: it.qty || 0,
    satuan: it.um || '', hargaBeli: it.hargaBeli || 0,
    feeDistribusi: it.feeDistribusi || 0, budgetDiskon: it.budgetDiskon || 0,
    totalDisc: 0, discBarang: 0, jumlah: 0,
  }));
  document.getElementById('fPpoNoPO').value = row.noPO;
  document.getElementById('fPpoCabang').value = row.cabang;
  document.getElementById('fPpoSupplier').value = (row.supplier||'').toUpperCase();
  document.getElementById('fPpoSyaratBayar').value = row.syaratBayar;
  document.getElementById('fPpoTglJthTempo').value = row.tglJthTempo;
  document.getElementById('fPpoGudang').innerHTML = `<option>${row.gudang}</option>`;
  document.getElementById('fPpoJurnal').value = row.jurnal;
  document.getElementById('fPpoAlamat').value = row.alamatPengiriman;
  const ppnRadio = document.querySelector(`input[name="ppoPpnMode"][value="${row.ppnMode}"]`);
  if(ppnRadio) ppnRadio.checked = true;
  document.getElementById('fPpoPphKode').value = row.pphKode;
  if(mode === 'add'){ row.no = ppoGenerateNo(row.cabang); document.getElementById('fPpoNo').value = row.no; }
  wirePpoItems(row, isView);
  ppoRecalc(row);
}

/* Baca nilai baris barang dari DOM ke state. */
function ppoReadItems(row){
  row.items.forEach((it, idx) => {
    const g = (sel) => document.querySelector(`[data-ppo-${sel}="${idx}"]`);
    const qty = g('qty'); if(qty) it.qty = Number(qty.value) || 0;
    const harga = g('harga'); if(harga) it.hargaBeli = Number(harga.value) || 0;
    const fee = g('fee'); if(fee) it.feeDistribusi = Number(fee.value) || 0;
    const bud = g('budget'); if(bud) it.budgetDiskon = Number(bud.value) || 0;
  });
}

function wirePpoItems(row, isView){
  document.getElementById('ppoItemsBody').innerHTML = tplPpoItemRows(row.items, isView);
  const hint = document.getElementById('ppoItemsEmptyHint');
  if(hint) hint.style.display = (row.items && row.items.length) ? 'none' : '';
  if(isView) return;
  document.querySelectorAll('[data-ppo-qty]').forEach(inp => inp.oninput = () => {
    const i = +inp.dataset.ppoQty;
    let v = Number(inp.value) || 0;
    const max = Number(row.items[i].qtyPesan || 0);
    if(v < 0) v = 0;
    if(v > max){ v = max; inp.value = v; }
    row.items[i].qty = v;
    ppoRecalc(row);
  });
  ['harga','fee','budget'].forEach(sel => {
    document.querySelectorAll(`[data-ppo-${sel}]`).forEach(inp => inp.oninput = () => { ppoReadItems(row); ppoRecalc(row); });
  });
  document.querySelectorAll('[data-ppo-batch]').forEach(b => b.onclick = () => {
    openPpoBatch(row.items[+b.dataset.ppoBatch]);
  });
}

/* ----- Panel bawah ----- */
function wirePpoBottomPanel(row, isView){
  if(isView) return;
  document.querySelectorAll('input[name="ppoPpnMode"]').forEach(r => r.onchange = () => { row.ppnMode = r.value; ppoRecalc(row); });
  document.querySelectorAll('input[name="ppoUmTipe"]').forEach(r => r.onchange = () => { row.uangMukaTipe = r.value; });
  document.getElementById('fPpoDiskon1').oninput = (e) => { row.diskon1 = Number(e.target.value) || 0; ppoRecalc(row); };
  document.getElementById('fPpoDiskon2').oninput = (e) => { row.diskon2 = Number(e.target.value) || 0; ppoRecalc(row); };
  document.getElementById('fPpoUmPakai').oninput = (e) => {
    let v = Number(e.target.value) || 0;
    const sisa = ppoSisaUangMuka(row.supplier);
    if(v > sisa){ v = sisa; e.target.value = v; }
    row.uangMukaPakai = v;
    ppoRecalc(row);
  };
  document.getElementById('fPpoOngkosAngkut').oninput = (e) => { row.ongkosAngkut = Number(e.target.value) || 0; ppoRecalc(row); };
  document.getElementById('ppoPajakInfo').onclick = () => openPpoInfo('Kode Pajak', 'Kode pajak PPN11 (11%) dipakai otomatis saat mode PPN Inklusif / Eksklusif dipilih di Informasi PPN.');
  document.getElementById('ppoPphSearch').onclick = () => openPpoPphPicker((p) => {
    row.pphKode = p.kode; row.pphPersen = p.persen;
    document.getElementById('fPpoPphKode').value = p.kode;
    ppoRecalc(row);
  });
  document.getElementById('ppoPphClear').onclick = () => {
    row.pphKode = ''; row.pphPersen = 0;
    document.getElementById('fPpoPphKode').value = '';
    ppoRecalc(row);
  };
}

/* ----- Tab Rincian Jurnal Akun ----- */
function wirePpoJurnalTab(row, isView){
  const cont = document.getElementById('ppoTabJurnalContent');
  cont.innerHTML = tplPpoJurnalContent(row, isView);
  if(isView) return;

  const rerender = () => wirePpoJurnalTab(row, isView);
  const refreshSelisih = () => {
    const t = ppoJurnalTotals(row);
    const el = document.getElementById('ppoJurnalSelisih');
    el.value = ppoNum2(t.selisih);
    el.style.color = Math.abs(t.selisih) > 0.004 ? 'var(--red)' : 'var(--text)';
  };

  cont.querySelectorAll('input[name="ppoJurnalMode"]').forEach(r => r.onchange = () => {
    row.jurnalMode = r.value;
    rerender();
  });
  document.getElementById('ppoBuatJurnal').onclick = () => {
    ppoReadItems(row);
    ppoRecalc(row);
    if(row.dpp <= 0){ openPpoInfo('Buat Jurnal', 'Pilih Purchase Order dan isi Qty terlebih dahulu di tab Rincian Transaksi.'); return; }
    row.jurnalAkun = ppoBuildJurnal(row);
    rerender();
  };
  const addBtn = document.getElementById('ppoJurnalAddRow');
  if(addBtn) addBtn.onclick = () => {
    row.jurnalAkun = row.jurnalAkun || [];
    row.jurnalAkun.push({ kodeAkun:'', namaAkun:'', keterangan:'', debit:0, kredit:0 });
    rerender();
  };
  cont.querySelectorAll('[data-ppo-jurnal-del]').forEach(b => b.onclick = () => {
    row.jurnalAkun.splice(+b.dataset.ppoJurnalDel, 1);
    rerender();
  });
  cont.querySelectorAll('[data-ppo-jurnal-akun-search]').forEach(b => b.onclick = () => {
    const i = +b.dataset.ppoJurnalAkunSearch;
    openPpoAkunPicker((akun) => {
      row.jurnalAkun[i].kodeAkun = akun.kode;
      row.jurnalAkun[i].namaAkun = akun.nama;
      cont.querySelector(`[data-ppo-jurnal-kode="${i}"]`).value = akun.kode;
      cont.querySelector(`[data-ppo-jurnal-nama="${i}"]`).value = akun.nama;
    });
  });
  cont.querySelectorAll('[data-ppo-jurnal-ket]').forEach(inp => inp.oninput = () => {
    row.jurnalAkun[+inp.dataset.ppoJurnalKet].keterangan = inp.value;
  });
  cont.querySelectorAll('[data-ppo-jurnal-debit]').forEach(inp => inp.oninput = () => {
    row.jurnalAkun[+inp.dataset.ppoJurnalDebit].debit = Number(inp.value) || 0;
    refreshSelisih();
  });
  cont.querySelectorAll('[data-ppo-jurnal-kredit]').forEach(inp => inp.oninput = () => {
    row.jurnalAkun[+inp.dataset.ppoJurnalKredit].kredit = Number(inp.value) || 0;
    refreshSelisih();
  });
}

/* Baca field form header/bawah ke state. */
function ppoReadForm(row){
  row.supplierNoFaktur = document.getElementById('fPpoSupplierNoFaktur').value.trim();
  row.tglFaktur = document.getElementById('fPpoTglFaktur').value.trim();
  row.syaratBayar = document.getElementById('fPpoSyaratBayar').value;
  row.tglJthTempo = document.getElementById('fPpoTglJthTempo').value.trim();
  row.jurnal = document.getElementById('fPpoJurnal').value;
  row.alamatPengiriman = document.getElementById('fPpoAlamat').value;
  row.keterangan = document.getElementById('fPpoKeterangan').value;
  ppoReadItems(row);
}

/* ----- Simpan + validasi ----- */
function ppoSave(mode, idx, row){
  ppoReadForm(row);
  ppoRecalc(row);

  if(!row.noPO){ openPpoInfo('Validasi', 'Pilih Purchase Order terlebih dahulu.'); return false; }
  if(!row.tglFaktur){ openPpoInfo('Validasi', 'Tgl. Faktur wajib diisi.'); return false; }
  const totalQty = (row.items || []).reduce((a,it) => a + Number(it.qty||0), 0);
  if(totalQty <= 0){ openPpoInfo('Validasi', 'Isi Qty (jumlah yang difakturkan) minimal 1 barang.'); return false; }
  if(row.jurnalAkun && row.jurnalAkun.length){
    const t = ppoJurnalTotals(row);
    if(Math.abs(t.selisih) > 0.004){
      openPpoInfo('Jurnal Tidak Balance', `Total Debit (${ppoNum2(t.debit)}) tidak sama dengan Total Kredit (${ppoNum2(t.kredit)}). Selisih: ${ppoNum2(t.selisih)}.`);
      return false;
    }
  }

  DATA.pembelianPO = DATA.pembelianPO || [];
  if(mode === 'add') DATA.pembelianPO.unshift(row);
  else DATA.pembelianPO[idx] = row;
  return true;
}

/* =====================================================================
   Modals
===================================================================== */
function ppoOverlay(html){
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

function openPpoPrint(row){ ppoOverlay(tplPpoPrintModal(row)); }

function openPpoBatch(item){
  ppoOverlay(tplPpoBatchModal(item));
  document.getElementById('ppoBatchOk').onclick = () => {
    item.batch = document.getElementById('fPpoBatchInput').value.trim();
    closeModal();
  };
}

function openPpoDelete(idx){
  const row = DATA.pembelianPO[idx];
  ppoOverlay(tplPpoDeleteConfirm(row));
  document.getElementById('modalDelete').onclick = () => {
    DATA.pembelianPO.splice(idx, 1);
    closeModal();
    renderPpoTable();
  };
}

function openPpoInfo(title, text){
  ppoOverlay(tplPpoInfoModal(title, text));
  document.getElementById('modalOk').onclick = closeModal;
}

function openPpoPoPicker(onPick){
  const overlay = ppoOverlay(tplPpoPoPicker(DATA.purchaseOrder));
  const wire = () => overlay.querySelectorAll('[data-ppo-pick-po]').forEach(b => b.onclick = () => {
    const po = DATA.purchaseOrder.find(p => p.no === b.dataset.ppoPickPo);
    closeModal();
    if(po) onPick(po);
  });
  wire();
  document.getElementById('ppoPoPickerSearch').oninput = (e) => {
    const q = e.target.value.trim().toLowerCase();
    const list = DATA.purchaseOrder.filter(p => !q || p.no.toLowerCase().includes(q) || (p.supplier||'').toLowerCase().includes(q));
    document.getElementById('ppoPoPickerBody').innerHTML = tplPpoPoPickerRows(list);
    wire();
  };
}

function openPpoPphPicker(onPick){
  const overlay = ppoOverlay(tplPpoPphPicker(PPO_PPH_LIST));
  overlay.querySelectorAll('[data-ppo-pick-pph]').forEach(b => b.onclick = () => {
    closeModal();
    onPick({ kode: b.dataset.ppoPickPph, persen: Number(b.dataset.ppoPickPersen) });
  });
}

function openPpoAkunPicker(onPick){
  const overlay = ppoOverlay(tplPpoAkunPicker(DATA.akunGL));
  const wire = () => overlay.querySelectorAll('[data-ppo-pick-akun]').forEach(b => b.onclick = () => {
    const akun = DATA.akunGL.find(a => a.kode === b.dataset.ppoPickAkun);
    closeModal();
    if(akun) onPick(akun);
  });
  wire();
  document.getElementById('ppoAkunPickerSearch').oninput = (e) => {
    const q = e.target.value.trim().toLowerCase();
    const list = DATA.akunGL.filter(a => !q || a.kode.includes(q) || a.nama.toLowerCase().includes(q));
    document.getElementById('ppoAkunPickerBody').innerHTML = tplPpoAkunPickerRows(list);
    wire();
  };
}
