/* =========================================================
   LOGIC (JS saja) — Opname Faktur, Retur & Surat Jalan (Customer &
   Penjualan > Daftar Transaksi, page:'opnameDokumen' — menu BARU
   2026-08-28, dari dokumen spesifikasi user "Aplikasi Web Opname
   Faktur, Retur & Surat Jalan"). Dimuat lazy-load oleh core.js —
   lihat PAGE_MODULES. Markup di file sebelah:
   opname-dokumen.template.js (berikut catatan desain lengkap &
   pemetaan spec -> fitur). NB: closeModal() dari core.js.

   Alur sesuai spec 3.A: (1) pilih menu -> (2) atur cakupan dokumen +
   metode (Menyeluruh / Random By Salesman-Collector-Inkaso) ->
   Generate Daftar Dokumen menarik dokumen dari data live ->
   (3) petugas menginput Status Opname per dokumen (default
   "Ditemukan / Sesuai", diubah utk yang Blank/Selisih) -> (4) Review
   & cetak 3 laporan (Rincian per Status / Summary By Salesman By
   Status / Rekapitulasi). Modul B (Konfirmasi Outlet, spec 3.B):
   tombol di header list -> pilih outlet -> Direct Print form berisi
   dokumen Outstanding outlet itu. */

var opdSearchQ = '';

function renderOpnameDokumenPage(){
  renderOpdList();
}

function opdFilteredRows(){
  const q = opdSearchQ.trim().toLowerCase();
  if(!q) return DATA.opnameDokumen;
  return DATA.opnameDokumen.filter(r =>
    r.no.toLowerCase().includes(q) ||
    (r.petugas||'').toLowerCase().includes(q) ||
    (r.keterangan||'').toLowerCase().includes(q) ||
    opdMetodeLabel(r).toLowerCase().includes(q));
}

function renderOpdList(){
  opdSearchQ = '';
  content.innerHTML = tplOpnameDokumenListPage();
  document.getElementById('btnOpdAdd').onclick = () => openOpdForm('add');
  document.getElementById('btnOpdTutorial').onclick = () => openOpdInfo('Tutorial', 'Video tutorial Opname Faktur, Retur & Surat Jalan akan tersedia di sini.');
  document.getElementById('btnOpdKonfirmasiOutlet').onclick = () => openOpdPilihOutlet();
  document.getElementById('opdSearch').oninput = (e) => { opdSearchQ = e.target.value; renderOpdTable(); };
  renderOpdTable();
}

function renderOpdTable(){
  const rows = opdFilteredRows();
  document.getElementById('opdTbody').innerHTML = tplOpdRows(rows);
  document.getElementById('opdTotal').textContent = `Total Record: ${rows.length}`;
  const idxOf = el => DATA.opnameDokumen.indexOf(rows[+el.dataset.view ?? 0]);
  content.querySelectorAll('[data-view]').forEach(el => el.onclick = () => openOpdForm('view', DATA.opnameDokumen.indexOf(rows[+el.dataset.view])));
  content.querySelectorAll('[data-edit]').forEach(el => el.onclick = () => openOpdForm('edit', DATA.opnameDokumen.indexOf(rows[+el.dataset.edit])));
  content.querySelectorAll('[data-del]').forEach(el => el.onclick = () => openOpdDeleteConfirm(DATA.opnameDokumen.indexOf(rows[+el.dataset.del])));
}

function opdGenerateNo(cabang){
  const kode = OPD_CABANG_CODE[cabang] || 'HO';
  const seq = DATA.opnameDokumen.length + 1;
  return `26/OPD/${kode}/08/${String(seq).padStart(5,'0')}`;
}

function opdTodayLabel(){
  const d = new Date();
  return String(d.getDate()).padStart(2,'0') + '/' + String(d.getMonth()+1).padStart(2,'0') + '/' + d.getFullYear();
}

/* ===== Penugasan Collector/Inkaso per customer — deterministik dari
   urutan customer di master (belum ada modul master penugasan
   collector/inkaso di mockup ini; simplifikasi terdokumentasi di
   header template). ===== */
function opdCollectorOf(customerKode){
  const i = DATA.customers.findIndex(c => c.kode === customerKode);
  return DATA.collectorList[(i < 0 ? 0 : i) % DATA.collectorList.length];
}
function opdInkasoOf(customerKode){
  const i = DATA.customers.findIndex(c => c.kode === customerKode);
  return DATA.inkasoList[(i < 0 ? 0 : i) % DATA.inkasoList.length];
}
function opdSalesmanOf(customerKode){
  const c = DATA.customers.find(x => x.kode === customerKode);
  return c ? (c.salesman || '') : '';
}

/* Lolos filter cabang + metode By Filter (Salesman/Collector/Inkaso)? */
function opdLolosFilter(customerKode, cabangDok, row){
  if(row.cabang && row.cabang !== 'Semua Cabang' && cabangDok !== row.cabang) return false;
  if(row.metode !== 'By Filter' || !row.filterNilai) return true;
  if(row.filterBasis === 'Salesman') return opdSalesmanOf(customerKode) === row.filterNilai;
  if(row.filterBasis === 'Collector') return opdCollectorOf(customerKode) === row.filterNilai;
  if(row.filterBasis === 'Inkaso') return opdInkasoOf(customerKode) === row.filterNilai;
  return true;
}

/* Generate Daftar Dokumen (spec 3.A langkah 2-3): tarik dokumen dari
   data live sesuai cakupan + filter; status awal semua baris
   "Ditemukan / Sesuai" (petugas tinggal mengubah yang bermasalah). */
function opdGenerateItems(row){
  const out = [];
  if(row.cakupan.faktur){
    DATA.invoices.forEach(inv => {
      if(!opdLolosFilter(inv.customerKode, inv.cabang, row)) return;
      out.push({jenis:'Faktur', no:inv.no, tgl:inv.tgl, customerNama:inv.customerNama,
        salesman:opdSalesmanOf(inv.customerKode), nilai:+inv.jumlah||0,
        statusOpname:OPD_STATUS_LIST[0], ket:''});
    });
  }
  if(row.cakupan.retur){
    (DATA.returPenjualanDocs||[]).forEach(rj => {
      if(!opdLolosFilter(rj.customerKode, rj.cabang, row)) return;
      out.push({jenis:'Retur', no:rj.no, tgl:rj.tgl, customerNama:rj.customerNama,
        salesman:opdSalesmanOf(rj.customerKode), nilai:+rj.nilai||0,
        statusOpname:OPD_STATUS_LIST[0], ket:''});
    });
  }
  if(row.cakupan.suratJalan){
    DATA.invoices.forEach(inv => {
      if(!inv.noSJ) return;
      if(!opdLolosFilter(inv.customerKode, inv.cabang, row)) return;
      out.push({jenis:'Surat Jalan', no:inv.noSJ, tgl:inv.tgl, customerNama:inv.customerNama,
        salesman:opdSalesmanOf(inv.customerKode), nilai:+inv.jumlah||0,
        statusOpname:OPD_STATUS_LIST[0], ket:''});
    });
  }
  return out;
}

function opdBuildEmptyRow(){
  return {
    no: opdGenerateNo('Semua Cabang'), tgl: opdTodayLabel(), cabang: 'Semua Cabang',
    tipePetugas: OPD_TIPE_PETUGAS[0], petugas: '',
    metode: 'Menyeluruh', filterBasis: 'Salesman', filterNilai: '',
    cakupan: {faktur:true, retur:true, suratJalan:true},
    keterangan: '', status: 'Draft', items: [],
    userEntry: '', tglInput: '',
  };
}

function opdFilterNilaiOptions(basis){
  if(basis === 'Salesman'){
    const seen = {}; const out = [];
    DATA.customers.forEach(c => { if(c.salesman && !seen[c.salesman]){ seen[c.salesman]=true; out.push(c.salesman); } });
    return out;
  }
  if(basis === 'Collector') return DATA.collectorList.slice();
  if(basis === 'Inkaso') return DATA.inkasoList.slice();
  return [];
}

function openOpdForm(mode, idx){
  const isAdd = mode === 'add';
  const isView = mode === 'view';
  let row;
  if(isAdd){
    row = opdBuildEmptyRow();
  } else {
    const src = DATA.opnameDokumen[idx];
    row = { ...src, cakupan: { ...src.cakupan }, items: (src.items||[]).map(it => ({...it})) };
  }

  content.innerHTML = tplOpdForm(mode, row);
  refreshOpdFilterNilai(row, isView);
  wireOpdItems(row, isView);

  document.getElementById('btnOpdCetakRincian').onclick = () => {
    const st = document.getElementById('fOpdCetakStatus').value;
    opdOpenDoc(tplOpdDocRincian(row, st, opdTodayLabel()));
  };
  document.getElementById('btnOpdCetakSummary').onclick = () => opdOpenDoc(tplOpdDocSummary(row, opdTodayLabel()));
  document.getElementById('btnOpdCetakRekap').onclick = () => opdOpenDoc(tplOpdDocRekap(row, opdTodayLabel()));

  if(isView){
    document.getElementById('opdTutup').onclick = (e) => { e.preventDefault(); renderOpdList(); };
    return;
  }

  if(isAdd){
    document.getElementById('opdRefreshNo').onclick = () => {
      row.no = opdGenerateNo(document.getElementById('fOpdCabang').value);
      document.getElementById('fOpdNo').value = row.no;
    };
  }

  document.getElementById('fOpdTgl').oninput = (e) => { row.tgl = e.target.value; };
  document.getElementById('fOpdCabang').onchange = (e) => { row.cabang = e.target.value; };
  document.getElementById('fOpdStatus').onchange = (e) => { row.status = e.target.value; };
  document.getElementById('fOpdTipePetugas').onchange = (e) => { row.tipePetugas = e.target.value; };
  document.getElementById('fOpdPetugas').oninput = (e) => { row.petugas = e.target.value; };
  document.getElementById('fOpdKeterangan').oninput = (e) => { row.keterangan = e.target.value; };
  document.getElementById('fOpdCakFaktur').onchange = (e) => { row.cakupan.faktur = e.target.checked; };
  document.getElementById('fOpdCakRetur').onchange = (e) => { row.cakupan.retur = e.target.checked; };
  document.getElementById('fOpdCakSJ').onchange = (e) => { row.cakupan.suratJalan = e.target.checked; };

  document.querySelectorAll('input[name="fOpdMetode"]').forEach(r => r.onchange = (e) => {
    row.metode = e.target.value;
    document.getElementById('opdFilterWrap').style.display = row.metode === 'By Filter' ? 'flex' : 'none';
  });
  document.getElementById('fOpdFilterBasis').onchange = (e) => {
    row.filterBasis = e.target.value;
    row.filterNilai = '';
    refreshOpdFilterNilai(row, false);
  };
  document.getElementById('fOpdFilterNilai').onchange = (e) => { row.filterNilai = e.target.value; };

  document.getElementById('btnOpdGenerate').onclick = () => {
    if(!row.cakupan.faktur && !row.cakupan.retur && !row.cakupan.suratJalan){
      opdValidationError('Pilih minimal 1 Cakupan Dokumen (Faktur / Retur / Surat Jalan).'); return;
    }
    if(row.metode === 'By Filter' && !row.filterNilai){
      opdValidationError(`Pilih Nilai Filter ${row.filterBasis} terlebih dahulu untuk metode Random / By Filter.`); return;
    }
    row.items = opdGenerateItems(row);
    refreshOpdItemsDOM(row, false);
  };

  document.getElementById('opdBatalkan').onclick = (e) => { e.preventDefault(); renderOpdList(); };
  document.getElementById('opdSimpan').onclick = () => {
    if(!row.petugas.trim()){ opdValidationError('Nama Petugas wajib diisi.'); return; }
    if(!row.items.length){ opdValidationError('Daftar dokumen masih kosong — klik Generate Daftar Dokumen terlebih dahulu.'); return; }
    if(isAdd){
      row.userEntry = 'sidik';
      row.tglInput = row.tgl + ' ' + new Date().toTimeString().slice(0,8);
      DATA.opnameDokumen.unshift(row);
    } else {
      DATA.opnameDokumen[idx] = row;
    }
    renderOpdList();
  };
}

function refreshOpdFilterNilai(row, isView){
  const sel = document.getElementById('fOpdFilterNilai');
  if(!sel) return;
  const opts = opdFilterNilaiOptions(row.filterBasis);
  sel.innerHTML = `<option value="">Pilih ${row.filterBasis}...</option>` +
    opts.map(o => `<option ${row.filterNilai===o?'selected':''}>${o}</option>`).join('');
  if(isView) sel.disabled = true;
}

function refreshOpdItemsDOM(row, isView){
  document.getElementById('opdItemsBody').innerHTML = tplOpdItemRows(row.items, isView);
  document.getElementById('opdRingkasan').innerHTML = tplOpdRingkasan(row.items);
  wireOpdItems(row, isView);
}

function wireOpdItems(row, isView){
  if(isView) return;
  document.querySelectorAll('[data-opd-status]').forEach(sel => sel.onchange = (e) => {
    row.items[+sel.dataset.opdStatus].statusOpname = e.target.value;
    document.getElementById('opdRingkasan').innerHTML = tplOpdRingkasan(row.items);
  });
  document.querySelectorAll('[data-opd-ket]').forEach(inp => inp.oninput = (e) => {
    row.items[+inp.dataset.opdKet].ket = e.target.value;
  });
}

function opdOpenDoc(html){
  const win = window.open('', '_blank');
  win.document.write(html);
  win.document.close();
}

/* ===== MODUL B — Form Konfirmasi Outlet (Direct Print, spec 3.B):
   pilih outlet -> tarik dokumen Outstanding live -> buka dokumen
   cetak. Faktur outstanding = DATA.invoices posted & sisa > 0 (sumber
   yang sama dgn Penerimaan Piutang); Retur outstanding = DATA.
   returPenjualanDocs status 'Outstanding'; S.J. outstanding = SJ
   milik faktur yang masih outstanding. Tgl. Jth. Tempo dihitung dari
   syaratBayar faktur (salinan pola ppJatuhTempo, modul lazy-load
   lain). ===== */
function opdJatuhTempo(tglStr, syaratBayar){
  const p = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(tglStr||'');
  if(!p) return tglStr || '';
  const d = new Date(+p[3], +p[2]-1, +p[1]);
  const m = /(\d+)/.exec(syaratBayar || '');
  d.setDate(d.getDate() + (m ? +m[1] : 0));
  return String(d.getDate()).padStart(2,'0') + '/' + String(d.getMonth()+1).padStart(2,'0') + '/' + d.getFullYear();
}

function openOpdPilihOutlet(){
  closeModal();
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.innerHTML = tplOpdPilihOutletModal(DATA.customers);
  document.body.appendChild(overlay);
  document.getElementById('modalClose').onclick = closeModal;
  document.getElementById('modalCancel').onclick = closeModal;
  overlay.onclick = (e) => { if(e.target === overlay) closeModal(); };
  overlay.querySelectorAll('[data-opd-outlet]').forEach(btn => btn.onclick = () => {
    const cust = DATA.customers.find(c => c.kode === btn.dataset.opdOutlet);
    const fakturs = DATA.invoices
      .filter(inv => inv.posted && inv.customerKode === cust.kode && (inv.jumlah - (inv.dibayar||0)) > 0.004)
      .map(inv => ({no:inv.no, tgl:inv.tgl, tglJthTempo:opdJatuhTempo(inv.tgl, inv.syaratBayar), sisa:Math.round((inv.jumlah-(inv.dibayar||0))*100)/100}));
    const returs = (DATA.returPenjualanDocs||[]).filter(rj => rj.customerKode === cust.kode && rj.status === 'Outstanding');
    const sjs = DATA.invoices
      .filter(inv => inv.customerKode === cust.kode && inv.noSJ && (inv.jumlah - (inv.dibayar||0)) > 0.004)
      .map(inv => ({noSJ:inv.noSJ, tgl:inv.tgl, noFaktur:inv.no, nilai:+inv.jumlah||0}));
    closeModal();
    opdOpenDoc(tplOpdDocKonfirmasiOutlet(cust, fakturs, returs, sjs, opdTodayLabel()));
  });
}

function openOpdDeleteConfirm(idx){
  closeModal();
  const row = DATA.opnameDokumen[idx];
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.innerHTML = tplOpdDeleteConfirm(row);
  document.body.appendChild(overlay);
  document.getElementById('modalClose').onclick = closeModal;
  document.getElementById('modalCancel').onclick = closeModal;
  overlay.onclick = (e) => { if(e.target === overlay) closeModal(); };
  document.getElementById('modalDelete').onclick = () => {
    DATA.opnameDokumen.splice(idx, 1);
    closeModal();
    renderOpdTable();
  };
}

function openOpdInfo(title, text){
  closeModal();
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.innerHTML = tplOpdInfoModal(title, text);
  document.body.appendChild(overlay);
  document.getElementById('modalClose').onclick = closeModal;
  document.getElementById('modalCancel').onclick = closeModal;
  overlay.onclick = (e) => { if(e.target === overlay) closeModal(); };
}

function opdValidationError(text){
  openOpdInfo('Validasi', text);
}
