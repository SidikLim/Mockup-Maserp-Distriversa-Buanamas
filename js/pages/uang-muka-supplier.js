/* =========================================================
   LOGIC (JS saja) — Uang Muka Supplier (Supplier & Pembelian >
   Daftar Transaksi). Dimuat otomatis (lazy-load) oleh core.js
   saat menu ini pertama kali diklik — lihat PAGE_MODULES di
   js/core.js. Markup HTML-nya ada di file sebelah:
   uang-muka-supplier.template.js (catatan desain di headernya).
   NB: closeModal() dipakai bersama, didefinisikan di core.js.

   Alur inti:
   - Tambah -> pilih Supplier ATAU langsung pilih No. PO (picker
     DATA.purchaseOrder): barang PO menjadi baris Rincian
     Transaksi (Keterangan = nama barang, Qty, Jumlah), supplier
     & cabang ikut PO, nomor transaksi di-generate ulang per
     cabang PO: 26/UMS-{kode}/08/{urut 5 digit}.
   - Aritmetika (lihat header template): Subtotal = Σ jumlah
     baris; DP ditagih = Subtotal x % (persen EDITABLE, default
     100); DPP = DP ditagih; PPN = 11% DPP saat mode Eksklusif
     (PPN11); PPh = persen dipotong x DPP; Jumlah = DPP + PPN -
     PPh. Semua di-recalc live (umsRecalc) saat % / mode PPN /
     PPh / baris rincian berubah.
   - "Buat Jurnal" (tab Rincian Jurnal Akun): D 1140001 Uang Muka
     Pembelian (DPP) + D 1140002 PPN Masukan (PPN) lawan
     K 2110001 Hutang Usaha (Jumlah) + K akun PPh (1140003) bila
     PPh dipotong — seimbang karena DPP+PPN = Jumlah+PPh. Jurnal
     manual boleh diedit; Simpan menolak jurnal tidak balance.
   - Lihat Invoice / Cetak Invoice di list & "Cetak dan Simpan"
     di form membuka preview invoice (tplUmsInvoiceModal).
   Data: DATA.uangMukaSupplier. */

var umsSearchQ = '';

function renderUangMukaSupplierPage(){
  umsSearchQ = '';
  renderUmsList();
}

function renderUmsList(){
  content.innerHTML = tplUangMukaSupplierListPage();
  document.getElementById('btnUmsAdd').onclick = () => openUmsForm('add', null);
  document.getElementById('umsSearch').oninput = (e) => { umsSearchQ = e.target.value; renderUmsTable(); };
  renderUmsTable();
}

function umsFilteredRows(){
  const q = umsSearchQ.trim().toLowerCase();
  return (DATA.uangMukaSupplier || []).filter(r => {
    if(!q) return true;
    return r.no.toLowerCase().includes(q) ||
      (r.supplier||'').toLowerCase().includes(q) ||
      (r.keterangan||'').toLowerCase().includes(q) ||
      (r.noPO||'').toLowerCase().includes(q);
  });
}

function renderUmsTable(){
  const rows = umsFilteredRows();
  const tbody = document.getElementById('umsTbody');
  tbody.innerHTML = tplUmsRows(rows);
  document.getElementById('umsTotal').textContent = `Total Record: ${rows.length}`;
  const idxOf = (r) => DATA.uangMukaSupplier.indexOf(r);
  tbody.querySelectorAll('[data-view-link]').forEach(b => b.onclick = () => openUmsForm('view', idxOf(rows[+b.dataset.viewLink])));
  tbody.querySelectorAll('[data-invoice]').forEach(b => b.onclick = () => openUmsInvoice(rows[+b.dataset.invoice]));
  tbody.querySelectorAll('[data-print]').forEach(b => b.onclick = () => openUmsInvoice(rows[+b.dataset.print]));
  tbody.querySelectorAll('[data-edit]').forEach(b => b.onclick = () => openUmsForm('edit', idxOf(rows[+b.dataset.edit])));
  tbody.querySelectorAll('[data-del]').forEach(b => b.onclick = () => openUmsDelete(idxOf(rows[+b.dataset.del])));
}

/* Nomor otomatis per cabang: 26/UMS-HO/08/00001, 00002, ... */
function umsGenerateNo(cabang){
  const kode = UMS_CABANG_CODE[cabang] || 'HO';
  const prefix = `26/UMS-${kode}/08/`;
  let max = 0;
  (DATA.uangMukaSupplier || []).forEach(r => {
    if(r.no && r.no.startsWith(prefix)){
      const n = parseInt(r.no.slice(prefix.length), 10);
      if(!isNaN(n) && n > max) max = n;
    }
  });
  return prefix + String(max + 1).padStart(5, '0');
}

function umsGenerateNoFp(){
  let s = '010' + String(Math.floor(Math.random() * 1e13)).padStart(13, '0');
  return s.slice(0, 16);
}

/* Recalc seluruh angka panel Rincian dari state `row` + tulis ke DOM. */
function umsRecalc(row){
  row.subtotal = (row.items || []).reduce((a, it) => a + Number(it.jumlah || 0), 0);
  const persen = Number(row.dpPersen != null ? row.dpPersen : 100);
  row.dpAmount = row.subtotal * persen / 100;
  row.dpp = row.dpAmount;
  if(row.ppnMode === 'eksklusif'){
    row.pajak11 = 'PPN11';
    row.ppnAmount = row.dpp * 0.11;
  } else if(row.ppnMode === 'inklusif'){
    row.pajak11 = 'PPN11';
    row.dpp = row.dpAmount * 100 / 111;
    row.ppnAmount = row.dpAmount - row.dpp;
  } else {
    row.pajak11 = '';
    row.ppnAmount = 0;
  }
  row.pphAmount = row.pphKode ? (row.dpp * Number(row.pphPersen || 0) / 100) : 0;
  row.jumlahTotal = row.dpp + row.ppnAmount - row.pphAmount;

  const set = (id, v) => { const el = document.getElementById(id); if(el) el.value = v; };
  set('fUmsSubtotal', umsNum2(row.subtotal));
  set('fUmsDpAmount', umsNum2(row.dpAmount));
  set('fUmsDpp', umsNum2(row.dpp));
  set('fUmsPajak11', row.pajak11);
  set('fUmsPpnAmount', umsNum2(row.ppnAmount));
  set('fUmsPphAmount', umsNum2(row.pphAmount));
  set('fUmsJumlahTotal', umsNum2(row.jumlahTotal));
}

function umsJurnalTotals(row){
  let d = 0, k = 0;
  (row.jurnalAkun || []).forEach(e => { d += Number(e.debit || 0); k += Number(e.kredit || 0); });
  return { debit: d, kredit: k, selisih: d - k };
}

/* Jurnal otomatis tagihan uang muka ke supplier. */
function umsBuildJurnal(row){
  const ket = `Uang Muka ${row.noPO || row.no}`;
  const list = [
    { kodeAkun:'1140001', namaAkun: umsAkunNama('1140001'), keterangan: ket, debit: row.dpp, kredit: 0 },
  ];
  if(row.ppnAmount > 0.004){
    list.push({ kodeAkun:'1140002', namaAkun: umsAkunNama('1140002'), keterangan: ket, debit: row.ppnAmount, kredit: 0 });
  }
  list.push({ kodeAkun:'2110001', namaAkun: umsAkunNama('2110001'), keterangan: ket, debit: 0, kredit: row.jumlahTotal });
  if(row.pphAmount > 0.004){
    list.push({ kodeAkun:'1140003', namaAkun: umsAkunNama('1140003'), keterangan: `PPh dipotong ${row.pphKode}`, debit: 0, kredit: row.pphAmount });
  }
  return list;
}

/* =====================================================================
   FORM add / edit / view
===================================================================== */
function openUmsForm(mode, idx){
  const src = idx != null ? DATA.uangMukaSupplier[idx] : null;
  const row = src ? JSON.parse(JSON.stringify(src)) : {
    no: umsGenerateNo('Head Office'), tgl: '31/08/2026', cabang: 'Head Office',
    supplier: '', noPO: '', keterangan: '', syaratBayar: 'Kredit 30 Hari',
    tglJthTempo: '30/09/2026', jurnal: (DATA.jurnalPembelian[0] || {}).nama || '',
    ppnMode: 'eksklusif', tglFakturPajak: '31/08/2026', tanpaFakturPajak: false,
    noFakturPajak: '0000000000000000', noKmk: '', tglKmk: '',
    dpPersen: 100, pphKode: '', pphPersen: 0,
    items: [], jurnalAkun: [],
    subtotal: 0, dpAmount: 0, dpp: 0, pajak11: 'PPN11', ppnAmount: 0, pphAmount: 0, jumlahTotal: 0, dpTertagih: 0,
  };
  const isView = mode === 'view';
  content.innerHTML = tplUmsForm(mode, row);

  const back = () => renderUmsList();
  document.getElementById('umsBatalkan').onclick = (e) => { e.preventDefault(); back(); };
  document.getElementById('btnUmsTutorial').onclick = () => openUmsInfo('Tutorial', 'Video tutorial Uang Muka Supplier tersedia di portal MASERP (mockup).');

  // Tabs
  const tabR = document.getElementById('umsTabRincianBtn');
  const tabJ = document.getElementById('umsTabJurnalBtn');
  const contR = document.getElementById('umsTabRincianContent');
  const contJ = document.getElementById('umsTabJurnalContent');
  tabR.onclick = () => { tabR.classList.add('active'); tabJ.classList.remove('active'); contR.style.display = ''; contJ.style.display = 'none'; };
  tabJ.onclick = () => { tabJ.classList.add('active'); tabR.classList.remove('active'); contJ.style.display = ''; contR.style.display = 'none'; };

  wireUmsRincianTab(row, isView);
  wireUmsJurnalTab(row, isView);
  if(isView) return;

  // Header fields
  document.getElementById('fUmsCabang').onchange = (e) => {
    row.cabang = e.target.value;
    if(mode === 'add'){ row.no = umsGenerateNo(row.cabang); document.getElementById('fUmsNo').value = row.no; }
  };
  const refreshNoBtn = document.getElementById('umsRefreshNo');
  if(refreshNoBtn) refreshNoBtn.onclick = () => { row.no = umsGenerateNo(row.cabang); document.getElementById('fUmsNo').value = row.no; };

  document.getElementById('umsSupplierSearch').onclick = () => openUmsSupplierPicker((nama) => {
    row.supplier = nama;
    document.getElementById('fUmsSupplier').value = nama.toUpperCase();
  });

  document.getElementById('umsPoSearch').onclick = () => openUmsPoPicker((po) => {
    row.noPO = po.no;
    row.supplier = po.supplier || row.supplier;
    row.cabang = po.cabang || row.cabang;
    row.items = (po.items || []).map(it => ({ keterangan: it.nama, qty: it.qty, jumlah: it.jumlah }));
    document.getElementById('fUmsNoPO').value = row.noPO;
    document.getElementById('fUmsSupplier').value = (row.supplier || '').toUpperCase();
    const selCabang = document.getElementById('fUmsCabang');
    selCabang.value = row.cabang;
    if(mode === 'add'){ row.no = umsGenerateNo(row.cabang); document.getElementById('fUmsNo').value = row.no; }
    renderUmsItems(row, isView);
    umsRecalc(row);
  });

  // Simpan / Cetak dan Simpan
  const doSave = () => umsSave(mode, idx, row);
  document.getElementById('umsSimpan').onclick = () => { if(doSave()) back(); };
  document.getElementById('umsCetakSimpan').onclick = () => {
    if(doSave()){ back(); openUmsInvoice(row); }
  };
}

/* ----- Tab Rincian Transaksi ----- */
function renderUmsItems(row, isView){
  document.getElementById('umsItemsBody').innerHTML = tplUmsItemRows(row.items, isView);
  const hint = document.getElementById('umsItemsEmptyHint');
  if(hint) hint.style.display = (row.items && row.items.length) ? 'none' : '';
  if(isView) return;
  document.querySelectorAll('[data-ums-del]').forEach(b => b.onclick = () => {
    row.items.splice(+b.dataset.umsDel, 1);
    renderUmsItems(row, isView);
    umsRecalc(row);
  });
}

function wireUmsRincianTab(row, isView){
  renderUmsItems(row, isView);
  if(isView) return;

  document.querySelectorAll('input[name="umsPpnMode"]').forEach(r => r.onchange = () => {
    row.ppnMode = r.value;
    umsRecalc(row);
  });
  document.getElementById('fUmsDpPersen').oninput = (e) => {
    let v = Number(e.target.value);
    if(isNaN(v) || v < 0) v = 0;
    if(v > 100) v = 100;
    row.dpPersen = v;
    umsRecalc(row);
  };
  document.getElementById('fUmsTanpaFakturPajak').onchange = (e) => { row.tanpaFakturPajak = e.target.checked; };
  document.getElementById('umsRefreshFp').onclick = () => {
    row.noFakturPajak = umsGenerateNoFp();
    document.getElementById('fUmsNoFakturPajak').value = row.noFakturPajak;
  };
  document.getElementById('umsPajakInfo').onclick = () => openUmsInfo('Kode Pajak', 'Kode pajak PPN11 (11%) dipakai otomatis saat mode PPN Eksklusif / Inklusif.');
  document.getElementById('umsPphSearch').onclick = () => openUmsPphPicker((p) => {
    row.pphKode = p.kode; row.pphPersen = p.persen;
    document.getElementById('fUmsPphKode').value = p.kode;
    umsRecalc(row);
  });
  document.getElementById('umsPphClear').onclick = () => {
    row.pphKode = ''; row.pphPersen = 0;
    document.getElementById('fUmsPphKode').value = '';
    umsRecalc(row);
  };
}

/* ----- Tab Rincian Jurnal Akun ----- */
function wireUmsJurnalTab(row, isView){
  const cont = document.getElementById('umsTabJurnalContent');
  cont.innerHTML = tplUmsJurnalContent(row, isView);
  if(isView) return;

  const rerender = () => wireUmsJurnalTab(row, isView);
  const refreshSelisih = () => {
    const t = umsJurnalTotals(row);
    const el = document.getElementById('umsJurnalSelisih');
    el.value = umsNum2(t.selisih);
    el.style.color = Math.abs(t.selisih) > 0.004 ? 'var(--red)' : 'var(--text)';
  };

  document.getElementById('umsBuatJurnal').onclick = () => {
    umsRecalc(row);
    row.jurnalAkun = umsBuildJurnal(row);
    rerender();
  };
  document.getElementById('umsJurnalAddRow').onclick = () => {
    row.jurnalAkun = row.jurnalAkun || [];
    row.jurnalAkun.push({ kodeAkun:'', namaAkun:'', keterangan:'', debit:0, kredit:0 });
    rerender();
  };
  cont.querySelectorAll('[data-ums-jurnal-del]').forEach(b => b.onclick = () => {
    row.jurnalAkun.splice(+b.dataset.umsJurnalDel, 1);
    rerender();
  });
  cont.querySelectorAll('[data-ums-jurnal-akun-search]').forEach(b => b.onclick = () => {
    const i = +b.dataset.umsJurnalAkunSearch;
    openUmsAkunPicker((akun) => {
      row.jurnalAkun[i].kodeAkun = akun.kode;
      row.jurnalAkun[i].namaAkun = akun.nama;
      cont.querySelector(`[data-ums-jurnal-kode="${i}"]`).value = akun.kode;
      cont.querySelector(`[data-ums-jurnal-nama="${i}"]`).value = akun.nama;
    });
  });
  cont.querySelectorAll('[data-ums-jurnal-ket]').forEach(inp => inp.oninput = () => {
    row.jurnalAkun[+inp.dataset.umsJurnalKet].keterangan = inp.value;
  });
  cont.querySelectorAll('[data-ums-jurnal-debit]').forEach(inp => inp.oninput = () => {
    row.jurnalAkun[+inp.dataset.umsJurnalDebit].debit = Number(inp.value) || 0;
    refreshSelisih();
  });
  cont.querySelectorAll('[data-ums-jurnal-kredit]').forEach(inp => inp.oninput = () => {
    row.jurnalAkun[+inp.dataset.umsJurnalKredit].kredit = Number(inp.value) || 0;
    refreshSelisih();
  });
}

/* ----- Simpan + validasi ----- */
function umsSave(mode, idx, row){
  row.tgl = document.getElementById('fUmsTgl').value.trim();
  row.keterangan = document.getElementById('fUmsKeterangan').value;
  row.syaratBayar = document.getElementById('fUmsSyaratBayar').value;
  row.tglJthTempo = document.getElementById('fUmsTglJthTempo').value.trim();
  row.jurnal = document.getElementById('fUmsJurnal').value;
  row.tglFakturPajak = document.getElementById('fUmsTglFakturPajak').value.trim();
  row.noKmk = document.getElementById('fUmsNoKmk').value.trim();
  row.tglKmk = document.getElementById('fUmsTglKmk').value.trim();
  umsRecalc(row);

  if(!row.supplier){ openUmsInfo('Validasi', 'Supplier wajib dipilih.'); return false; }
  if(!row.tgl){ openUmsInfo('Validasi', 'Tgl. Trn. wajib diisi.'); return false; }
  if(!row.items || !row.items.length){ openUmsInfo('Validasi', 'Rincian transaksi masih kosong — pilih No. PO terlebih dahulu.'); return false; }
  if(row.jurnalAkun && row.jurnalAkun.length){
    const t = umsJurnalTotals(row);
    if(Math.abs(t.selisih) > 0.004){
      openUmsInfo('Jurnal Tidak Balance', `Total Debit (${umsNum2(t.debit)}) tidak sama dengan Total Kredit (${umsNum2(t.kredit)}). Selisih: ${umsNum2(t.selisih)}.`);
      return false;
    }
  }

  DATA.uangMukaSupplier = DATA.uangMukaSupplier || [];
  if(mode === 'add') DATA.uangMukaSupplier.unshift(row);
  else DATA.uangMukaSupplier[idx] = row;
  return true;
}

/* =====================================================================
   Modals: invoice, hapus, pickers, info
===================================================================== */
function umsOverlay(html){
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

function openUmsInvoice(row){
  umsOverlay(tplUmsInvoiceModal(row));
}

function openUmsDelete(idx){
  const row = DATA.uangMukaSupplier[idx];
  umsOverlay(tplUmsDeleteConfirm(row));
  document.getElementById('modalDelete').onclick = () => {
    DATA.uangMukaSupplier.splice(idx, 1);
    closeModal();
    renderUmsTable();
  };
}

function openUmsInfo(title, text){
  umsOverlay(tplUmsInfoModal(title, text));
  document.getElementById('modalOk').onclick = closeModal;
}

function openUmsSupplierPicker(onPick){
  const overlay = umsOverlay(tplUmsSupplierPicker(DATA.suppliers));
  const wire = () => overlay.querySelectorAll('[data-pick-supplier]').forEach(b => b.onclick = () => {
    onPick(b.dataset.pickSupplier);
    closeModal();
  });
  wire();
  document.getElementById('umsSupplierPickerSearch').oninput = (e) => {
    const q = e.target.value.trim().toLowerCase();
    const list = DATA.suppliers.filter(s => !q || s.kode.toLowerCase().includes(q) || s.nama.toLowerCase().includes(q));
    document.getElementById('umsSupplierPickerBody').innerHTML = tplUmsSupplierPickerRows(list);
    wire();
  };
}

function openUmsPoPicker(onPick){
  const overlay = umsOverlay(tplUmsPoPicker(DATA.purchaseOrder));
  const wire = () => overlay.querySelectorAll('[data-pick-po]').forEach(b => b.onclick = () => {
    const po = DATA.purchaseOrder.find(p => p.no === b.dataset.pickPo);
    if(po) onPick(po);
    closeModal();
  });
  wire();
  document.getElementById('umsPoPickerSearch').oninput = (e) => {
    const q = e.target.value.trim().toLowerCase();
    const list = DATA.purchaseOrder.filter(p => !q || p.no.toLowerCase().includes(q) || (p.supplier||'').toLowerCase().includes(q));
    document.getElementById('umsPoPickerBody').innerHTML = tplUmsPoPickerRows(list);
    wire();
  };
}

function openUmsPphPicker(onPick){
  const overlay = umsOverlay(tplUmsPphPicker(UMS_PPH_LIST));
  overlay.querySelectorAll('[data-pick-pph]').forEach(b => b.onclick = () => {
    onPick({ kode: b.dataset.pickPph, persen: Number(b.dataset.pickPersen) });
    closeModal();
  });
}

function openUmsAkunPicker(onPick){
  const overlay = umsOverlay(tplUmsAkunPicker(DATA.akunGL));
  const wire = () => overlay.querySelectorAll('[data-ums-pick-akun]').forEach(b => b.onclick = () => {
    const akun = DATA.akunGL.find(a => a.kode === b.dataset.umsPickAkun);
    if(akun) onPick(akun);
    closeModal();
  });
  wire();
  document.getElementById('umsAkunPickerSearch').oninput = (e) => {
    const q = e.target.value.trim().toLowerCase();
    const list = DATA.akunGL.filter(a => !q || a.kode.includes(q) || a.nama.toLowerCase().includes(q));
    document.getElementById('umsAkunPickerBody').innerHTML = tplUmsAkunPickerRows(list);
    wire();
  };
}
