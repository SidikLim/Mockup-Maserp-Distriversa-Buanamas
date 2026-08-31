/* =========================================================
   LOGIC (JS saja) — Retur Penerimaan Barang / Retur PB
   (Supplier & Pembelian > Daftar Transaksi). Dimuat otomatis
   (lazy-load) oleh core.js saat menu ini pertama kali diklik —
   lihat PAGE_MODULES di js/core.js. Markup HTML-nya ada di file
   sebelah: retur-penerimaan-barang.template.js (catatan desain
   lengkap di headernya).
   NB: closeModal() dipakai bersama, didefinisikan di core.js.

   Alur inti:
   - Dua chip filter header FUNGSIONAL: status tagihan (All / Ada
     Tagihan / Belum Ditagih — flag r.adaTagihan) + periode bulan
     (Semua / Agustus 2026 / Juli 2026, dari Tgl. Retur).
   - Tambah -> pilih No. BPB (picker DATA.pembelianBPB): No. PO,
     Tgl. PO, Supplier, Alamat Pengiriman & barang penerimaan
     terisi otomatis (Qty. Terima = qty BPB, readonly); user
     mengisi Qty Retur per baris (divalidasi <= Qty Terima).
     Picker No. PO alternatif mengisi dari DATA.purchaseOrder.
   - No. RPB urut GLOBAL: 26/RPB-0000000001 (bukan per cabang,
     persis screenshot) + tombol refresh.
   - "Buat Jurnal": nilai retur = Σ qtyRetur x hargaBeli barang
     BPB; D 2110001 Hutang Usaha (nilai + PPN) lawan K 1130001
     Persediaan (nilai) + K 1140002 PPN Masukan (11% bila BPB
     bermode PPN eksklusif). Jurnal manual bisa diedit; Simpan
     menolak jurnal tidak balance.
   - Attach di list -> modal lampiran (mockup); Cetak -> preview
     cetakan RPB kop DBM dengan kolom tanda tangan.
   Data: DATA.returPenerimaanBarang. */

var rpbState = { tagihan:'All', bulan:'|', search:'' };

function renderReturPBPage(){
  rpbState = { tagihan:'All', bulan:'|', search:'' };
  renderRpbList();
}

function renderRpbList(){
  content.innerHTML = tplReturPBListPage(rpbState);
  document.getElementById('btnRpbAdd').onclick = () => openRpbForm('add', null);
  document.getElementById('rpbFilterTagihan').onchange = (e) => { rpbState.tagihan = e.target.value; renderRpbTable(); };
  document.getElementById('rpbFilterBulan').onchange = (e) => { rpbState.bulan = e.target.value; renderRpbTable(); };
  document.getElementById('rpbSearch').oninput = (e) => { rpbState.search = e.target.value; renderRpbTable(); };
  renderRpbTable();
}

function rpbFilteredRows(){
  const q = rpbState.search.trim().toLowerCase();
  const parts = rpbState.bulan.split('|');
  const mm = parts[0], yy = parts[1];
  return (DATA.returPenerimaanBarang || []).filter(r => {
    if(rpbState.tagihan === 'Ada Tagihan' && !r.adaTagihan) return false;
    if(rpbState.tagihan === 'Belum Ditagih' && r.adaTagihan) return false;
    if(mm && !(r.tglRetur||'').includes('/' + mm + '/' + yy)) return false;
    if(q && !(
      r.no.toLowerCase().includes(q) ||
      (r.noBPB||'').toLowerCase().includes(q) ||
      (r.noPO||'').toLowerCase().includes(q) ||
      (r.supplier||'').toLowerCase().includes(q) ||
      (r.keterangan||'').toLowerCase().includes(q))) return false;
    return true;
  });
}

function renderRpbTable(){
  const rows = rpbFilteredRows();
  const tbody = document.getElementById('rpbTbody');
  tbody.innerHTML = tplRpbRows(rows);
  document.getElementById('rpbTotal').textContent = `Total Record: ${rows.length}`;
  const idxOf = (r) => DATA.returPenerimaanBarang.indexOf(r);
  tbody.querySelectorAll('[data-view-link]').forEach(b => b.onclick = () => openRpbForm('view', idxOf(rows[+b.dataset.viewLink])));
  tbody.querySelectorAll('[data-rpb-view]').forEach(b => b.onclick = () => openRpbForm('view', idxOf(rows[+b.dataset.rpbView])));
  tbody.querySelectorAll('[data-rpb-attach]').forEach(b => b.onclick = () => openRpbAttach(rows[+b.dataset.rpbAttach]));
  tbody.querySelectorAll('[data-rpb-print]').forEach(b => b.onclick = () => openRpbPrint(rows[+b.dataset.rpbPrint]));
  tbody.querySelectorAll('[data-rpb-edit]').forEach(b => b.onclick = () => openRpbForm('edit', idxOf(rows[+b.dataset.rpbEdit])));
  tbody.querySelectorAll('[data-rpb-del]').forEach(b => b.onclick = () => openRpbDelete(idxOf(rows[+b.dataset.rpbDel])));
}

/* Nomor otomatis GLOBAL (bukan per cabang): 26/RPB-0000000001, ... */
function rpbGenerateNo(){
  const prefix = '26/RPB-';
  let max = 0;
  (DATA.returPenerimaanBarang || []).forEach(r => {
    if(r.no && r.no.startsWith(prefix)){
      const n = parseInt(r.no.slice(prefix.length), 10);
      if(!isNaN(n) && n > max) max = n;
    }
  });
  return prefix + String(max + 1).padStart(10, '0');
}

function rpbJurnalTotals(row){
  let d = 0, k = 0;
  (row.jurnalAkun || []).forEach(e => { d += Number(e.debit || 0); k += Number(e.kredit || 0); });
  return { debit: d, kredit: k, selisih: d - k };
}

/* Nilai retur dari qtyRetur x hargaBeli barang BPB. */
function rpbHitungNilai(row){
  let nilai = 0;
  (row.items || []).forEach(it => { nilai += Number(it.qtyRetur || 0) * Number(it.hargaBeli || 0); });
  const ppn = row.ppnMode === 'eksklusif' ? nilai * 0.11 : 0;
  return { nilai: nilai, ppn: ppn, total: nilai + ppn };
}

function rpbBuildJurnal(row){
  const v = rpbHitungNilai(row);
  const ket = `Retur PB ${row.noBPB || row.no}`;
  const list = [
    { kodeAkun:'2110001', namaAkun: rpbAkunNama('2110001'), keterangan: ket, debit: v.total, kredit: 0 },
    { kodeAkun:'1130001', namaAkun: rpbAkunNama('1130001'), keterangan: ket, debit: 0, kredit: v.nilai },
  ];
  if(v.ppn > 0.004){
    list.push({ kodeAkun:'1140002', namaAkun: rpbAkunNama('1140002'), keterangan: ket, debit: 0, kredit: v.ppn });
  }
  return list;
}

/* =====================================================================
   FORM add / edit / view
===================================================================== */
function openRpbForm(mode, idx){
  const src = idx != null ? DATA.returPenerimaanBarang[idx] : null;
  const row = src ? JSON.parse(JSON.stringify(src)) : {
    no: rpbGenerateNo(), noBPB: '', noPO: '', tglPO: '31/08/2026', tglRetur: '31/08/2026',
    cabang: 'Head Office', supplier: '', noSJSupplier: '', alamatPengiriman: '',
    penerimaanKonsinyasi: false, keterangan: '', kurs: 1, ppnMode: 'eksklusif',
    adaTagihan: false, items: [], jurnalAkun: [],
    userInput: 'sidik',
  };
  const isView = mode === 'view';
  content.innerHTML = tplRpbForm(mode, row);

  const back = () => renderRpbList();
  document.getElementById('rpbBatalkan').onclick = (e) => { e.preventDefault(); back(); };

  // Tabs
  const tabR = document.getElementById('rpbTabRincianBtn');
  const tabJ = document.getElementById('rpbTabJurnalBtn');
  const contR = document.getElementById('rpbTabRincianContent');
  const contJ = document.getElementById('rpbTabJurnalContent');
  tabR.onclick = () => { tabR.classList.add('active'); tabJ.classList.remove('active'); contR.style.display = ''; contJ.style.display = 'none'; };
  tabJ.onclick = () => { tabJ.classList.add('active'); tabR.classList.remove('active'); contJ.style.display = ''; contR.style.display = 'none'; };

  wireRpbItems(row, isView);
  wireRpbJurnalTab(row, isView);
  if(isView) return;

  const refreshNoBtn = document.getElementById('rpbRefreshNo');
  if(refreshNoBtn) refreshNoBtn.onclick = () => { row.no = rpbGenerateNo(); document.getElementById('fRpbNo').value = row.no; };

  document.getElementById('fRpbCabang').onchange = (e) => { row.cabang = e.target.value; };
  document.getElementById('fRpbKonsinyasi').onchange = (e) => { row.penerimaanKonsinyasi = e.target.checked; };

  document.getElementById('rpbBpbSearch').onclick = () => openRpbBpbPicker((bpb) => rpbApplyBpb(row, bpb, isView));
  document.getElementById('rpbPoSearch').onclick = () => openRpbPoPicker((po) => rpbApplyPo(row, po, isView));

  document.getElementById('rpbSimpan').onclick = () => { if(rpbSave(mode, idx, row)) back(); };
  document.getElementById('rpbCetak').onclick = () => {
    rpbReadForm(row);
    openRpbPrint(row);
  };
}

/* Terapkan BPB terpilih ke form: header + barang (Qty Terima). */
function rpbApplyBpb(row, bpb, isView){
  row.noBPB = bpb.noBPB;
  row.noPO = bpb.noPO || '';
  row.tglPO = bpb.tglFaktur || row.tglPO;
  row.supplier = bpb.supplier || '';
  row.cabang = bpb.cabang || row.cabang;
  row.alamatPengiriman = bpb.alamatPengiriman || '';
  row.ppnMode = bpb.ppnMode || 'eksklusif';
  row.items = (bpb.items || []).map(it => ({
    kode: it.kode, nama: it.nama, batch: it.batch || '', barcode: it.barcode || '',
    satuan: it.um || it.satuan || '', qtyRetur: 0, qtyTerima: it.qty || 0, hargaBeli: it.hargaBeli || 0,
  }));
  document.getElementById('fRpbNoBPB').value = row.noBPB;
  document.getElementById('fRpbNoPO').value = row.noPO;
  document.getElementById('fRpbTglPO').value = row.tglPO;
  document.getElementById('fRpbSupplier').value = row.supplier;
  document.getElementById('fRpbAlamat').value = row.alamatPengiriman;
  document.getElementById('fRpbCabang').value = row.cabang;
  wireRpbItems(row, isView);
}

/* Terapkan PO terpilih (alternatif tanpa BPB). */
function rpbApplyPo(row, po, isView){
  row.noPO = po.no;
  row.tglPO = po.tglPO || row.tglPO;
  row.supplier = po.supplier || '';
  row.cabang = po.cabang || row.cabang;
  row.alamatPengiriman = po.alamatPengiriman || row.alamatPengiriman;
  row.ppnMode = po.ppnMode || 'eksklusif';
  row.items = (po.items || []).map(it => ({
    kode: it.kode, nama: it.nama, batch: '', barcode: '',
    satuan: it.um || '', qtyRetur: 0, qtyTerima: it.qty || 0, hargaBeli: it.hargaBeli || 0,
  }));
  document.getElementById('fRpbNoPO').value = row.noPO;
  document.getElementById('fRpbTglPO').value = row.tglPO;
  document.getElementById('fRpbSupplier').value = row.supplier;
  document.getElementById('fRpbAlamat').value = row.alamatPengiriman;
  document.getElementById('fRpbCabang').value = row.cabang;
  wireRpbItems(row, isView);
}

function wireRpbItems(row, isView){
  document.getElementById('rpbItemsBody').innerHTML = tplRpbItemRows(row.items, isView);
  const hint = document.getElementById('rpbItemsEmptyHint');
  if(hint) hint.style.display = (row.items && row.items.length) ? 'none' : '';
  if(isView) return;
  document.querySelectorAll('[data-rpb-qtyretur]').forEach(inp => inp.oninput = () => {
    const i = +inp.dataset.rpbQtyretur;
    let v = Number(inp.value) || 0;
    const max = Number(row.items[i].qtyTerima || 0);
    if(v < 0) v = 0;
    if(v > max){ v = max; inp.value = v; }
    row.items[i].qtyRetur = v;
  });
  document.querySelectorAll('[data-rpb-batch]').forEach(inp => inp.oninput = () => { row.items[+inp.dataset.rpbBatch].batch = inp.value; });
  document.querySelectorAll('[data-rpb-barcode]').forEach(inp => inp.oninput = () => { row.items[+inp.dataset.rpbBarcode].barcode = inp.value; });
}

/* ----- Tab Rincian Jurnal Akun ----- */
function wireRpbJurnalTab(row, isView){
  const cont = document.getElementById('rpbTabJurnalContent');
  cont.innerHTML = tplRpbJurnalContent(row, isView);
  if(isView) return;

  const rerender = () => wireRpbJurnalTab(row, isView);
  const refreshSelisih = () => {
    const t = rpbJurnalTotals(row);
    const el = document.getElementById('rpbJurnalSelisih');
    el.value = rpbNum2(t.selisih);
    el.style.color = Math.abs(t.selisih) > 0.004 ? 'var(--red)' : 'var(--text)';
  };

  document.getElementById('rpbBuatJurnal').onclick = () => {
    const v = rpbHitungNilai(row);
    if(v.nilai <= 0){ openRpbInfo('Buat Jurnal', 'Isi Qty Retur terlebih dahulu di tab Rincian Transaksi.'); return; }
    row.jurnalAkun = rpbBuildJurnal(row);
    rerender();
  };
  document.getElementById('rpbJurnalAddRow').onclick = () => {
    row.jurnalAkun = row.jurnalAkun || [];
    row.jurnalAkun.push({ kodeAkun:'', namaAkun:'', keterangan:'', debit:0, kredit:0 });
    rerender();
  };
  cont.querySelectorAll('[data-rpb-jurnal-del]').forEach(b => b.onclick = () => {
    row.jurnalAkun.splice(+b.dataset.rpbJurnalDel, 1);
    rerender();
  });
  cont.querySelectorAll('[data-rpb-jurnal-akun-search]').forEach(b => b.onclick = () => {
    const i = +b.dataset.rpbJurnalAkunSearch;
    openRpbAkunPicker((akun) => {
      row.jurnalAkun[i].kodeAkun = akun.kode;
      row.jurnalAkun[i].namaAkun = akun.nama;
      cont.querySelector(`[data-rpb-jurnal-kode="${i}"]`).value = akun.kode;
      cont.querySelector(`[data-rpb-jurnal-nama="${i}"]`).value = akun.nama;
    });
  });
  cont.querySelectorAll('[data-rpb-jurnal-ket]').forEach(inp => inp.oninput = () => {
    row.jurnalAkun[+inp.dataset.rpbJurnalKet].keterangan = inp.value;
  });
  cont.querySelectorAll('[data-rpb-jurnal-debit]').forEach(inp => inp.oninput = () => {
    row.jurnalAkun[+inp.dataset.rpbJurnalDebit].debit = Number(inp.value) || 0;
    refreshSelisih();
  });
  cont.querySelectorAll('[data-rpb-jurnal-kredit]').forEach(inp => inp.oninput = () => {
    row.jurnalAkun[+inp.dataset.rpbJurnalKredit].kredit = Number(inp.value) || 0;
    refreshSelisih();
  });
}

/* Baca field form ke state (dipakai Simpan & Cetak). */
function rpbReadForm(row){
  row.tglRetur = document.getElementById('fRpbTglRetur').value.trim();
  row.noSJSupplier = document.getElementById('fRpbNoSJ').value.trim();
  row.alamatPengiriman = document.getElementById('fRpbAlamat').value;
  row.keterangan = document.getElementById('fRpbKeterangan').value;
  row.kurs = Number(document.getElementById('fRpbKurs').value) || 1;
}

/* ----- Simpan + validasi ----- */
function rpbSave(mode, idx, row){
  rpbReadForm(row);

  if(!row.noBPB && !row.noPO){ openRpbInfo('Validasi', 'Pilih No. BPB (atau No. PO) terlebih dahulu.'); return false; }
  if(!row.tglRetur){ openRpbInfo('Validasi', 'Tgl. Pengembalian wajib diisi.'); return false; }
  const totalRetur = (row.items || []).reduce((a, it) => a + Number(it.qtyRetur || 0), 0);
  if(totalRetur <= 0){ openRpbInfo('Validasi', 'Isi Qty Retur minimal 1 barang.'); return false; }
  if(row.jurnalAkun && row.jurnalAkun.length){
    const t = rpbJurnalTotals(row);
    if(Math.abs(t.selisih) > 0.004){
      openRpbInfo('Jurnal Tidak Balance', `Total Debit (${rpbNum2(t.debit)}) tidak sama dengan Total Kredit (${rpbNum2(t.kredit)}). Selisih: ${rpbNum2(t.selisih)}.`);
      return false;
    }
  }

  DATA.returPenerimaanBarang = DATA.returPenerimaanBarang || [];
  if(mode === 'add') DATA.returPenerimaanBarang.unshift(row);
  else DATA.returPenerimaanBarang[idx] = row;
  return true;
}

/* =====================================================================
   Modals
===================================================================== */
function rpbOverlay(html){
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

function openRpbPrint(row){ rpbOverlay(tplRpbPrintModal(row)); }
function openRpbAttach(row){ rpbOverlay(tplRpbAttachModal(row)); }

function openRpbDelete(idx){
  const row = DATA.returPenerimaanBarang[idx];
  rpbOverlay(tplRpbDeleteConfirm(row));
  document.getElementById('modalDelete').onclick = () => {
    DATA.returPenerimaanBarang.splice(idx, 1);
    closeModal();
    renderRpbTable();
  };
}

function openRpbInfo(title, text){
  rpbOverlay(tplRpbInfoModal(title, text));
  document.getElementById('modalOk').onclick = closeModal;
}

function openRpbBpbPicker(onPick){
  const overlay = rpbOverlay(tplRpbBpbPicker(DATA.pembelianBPB));
  const wire = () => overlay.querySelectorAll('[data-rpb-pick-bpb]').forEach(b => b.onclick = () => {
    const bpb = DATA.pembelianBPB.find(x => x.noBPB === b.dataset.rpbPickBpb);
    closeModal();
    if(bpb) onPick(bpb);
  });
  wire();
  document.getElementById('rpbBpbPickerSearch').oninput = (e) => {
    const q = e.target.value.trim().toLowerCase();
    const list = DATA.pembelianBPB.filter(x => !q || (x.noBPB||'').toLowerCase().includes(q) || (x.noPO||'').toLowerCase().includes(q) || (x.supplier||'').toLowerCase().includes(q));
    document.getElementById('rpbBpbPickerBody').innerHTML = tplRpbBpbPickerRows(list);
    wire();
  };
}

function openRpbPoPicker(onPick){
  const overlay = rpbOverlay(tplRpbPoPicker(DATA.purchaseOrder));
  const wire = () => overlay.querySelectorAll('[data-rpb-pick-po]').forEach(b => b.onclick = () => {
    const po = DATA.purchaseOrder.find(p => p.no === b.dataset.rpbPickPo);
    closeModal();
    if(po) onPick(po);
  });
  wire();
  document.getElementById('rpbPoPickerSearch').oninput = (e) => {
    const q = e.target.value.trim().toLowerCase();
    const list = DATA.purchaseOrder.filter(p => !q || p.no.toLowerCase().includes(q) || (p.supplier||'').toLowerCase().includes(q));
    document.getElementById('rpbPoPickerBody').innerHTML = tplRpbPoPickerRows(list);
    wire();
  };
}

function openRpbAkunPicker(onPick){
  const overlay = rpbOverlay(tplRpbAkunPicker(DATA.akunGL));
  const wire = () => overlay.querySelectorAll('[data-rpb-pick-akun]').forEach(b => b.onclick = () => {
    const akun = DATA.akunGL.find(a => a.kode === b.dataset.rpbPickAkun);
    closeModal();
    if(akun) onPick(akun);
  });
  wire();
  document.getElementById('rpbAkunPickerSearch').oninput = (e) => {
    const q = e.target.value.trim().toLowerCase();
    const list = DATA.akunGL.filter(a => !q || a.kode.includes(q) || a.nama.toLowerCase().includes(q));
    document.getElementById('rpbAkunPickerBody').innerHTML = tplRpbAkunPickerRows(list);
    wire();
  };
}
