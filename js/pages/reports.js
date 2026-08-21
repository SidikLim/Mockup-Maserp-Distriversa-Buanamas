/* =========================================================
   LOGIC (JS saja) — Daftar Laporan / Report Center
   Dimuat otomatis (lazy-load) oleh core.js saat salah satu dari
   10 submenu "Daftar Laporan" pertama kali diklik — lihat
   PAGE_MODULES di js/core.js (semua 10 key menunjuk ke srcs yang
   SAMA: file ini + reports.template.js). Markup HTML-nya ada di
   file sebelah: reports.template.js.

   PENTING (lihat juga catatan di reports.template.js): karena
   file ini bisa di-inject sebagai <script> lebih dari sekali
   (satu kali per kategori report BARU yang pertama diklik),
   SELURUH state top-level WAJIB pakai `var` (bukan `const`/`let`)
   supaya re-deklarasi lewat <script> tag terpisah tidak
   menyebabkan SyntaxError. Semua fungsi di sini murni
   `function` declaration (aman didekralasikan ulang).
========================================================= */
var rcState = { groups: [], search: '' };

function renderReportCenterPage(catKey){
  const cfg = (DATA.reportCenters || {})[catKey];
  if(!cfg){
    content.innerHTML = tplReportCenterPage('Daftar Laporan', []);
    return;
  }
  rcState = { groups: cfg.groups, search: '' };
  content.innerHTML = tplReportCenterPage(cfg.title, cfg.groups);
  wireReportCenterEvents();
}

function rcFilteredGroups(){
  const q = rcState.search.trim().toLowerCase();
  if(!q) return rcState.groups;
  return rcState.groups
    .map(g => ({
      name: g.name,
      rows: g.rows.filter(r =>
        r.report.toLowerCase().includes(q) ||
        (r.ket||'').toLowerCase().includes(q) ||
        (r.perm||'').toLowerCase().includes(q))
    }))
    .filter(g => g.rows.length);
}

function wireReportCenterEvents(){
  const searchEl = document.getElementById('rcSearch');
  if(searchEl){
    searchEl.oninput = (e) => {
      rcState.search = e.target.value;
      document.getElementById('rcBody').innerHTML = tplRcRows(rcFilteredGroups());
      wireRcRowActions();
    };
  }
  wireRcRowActions();
}

function wireRcRowActions(){
  document.querySelectorAll('.rc-report-link').forEach(a => {
    a.onclick = () => {
      const handler = rcReportHandlerFor(a.dataset.rcReport);
      if(handler === 'sspBelumDiterima'){ openRcSspFilter(); }
    };
  });
  document.querySelectorAll('[data-rc-action]').forEach(btn => {
    btn.onclick = () => {
      const action = btn.dataset.rcAction;
      if(action === 'print'){
        const handler = rcReportHandlerFor(btn.dataset.rcReport);
        if(handler === 'sspBelumDiterima'){ openRcSspFilter(); return; }
      }
      const msg = action === 'print'
        ? 'Preview/cetak laporan ini akan tersedia setelah format report-nya dirancang — mockup ini baru mencakup daftar laporannya.'
        : action === 'edit'
        ? 'Fitur Edit Report (report designer untuk mengubah layout laporan) belum tersedia di mockup ini.'
        : 'Reset Report akan mengembalikan layout laporan ini ke format bawaan sistem.';
      openReportCenterInfo(msg);
    };
  });
}

/* 2026-08-21 (lanjutan) — peta perm-code -> handler laporan
   SUNGGUHAN. Sejauh ini cuma 1 entry (FA-08). Baris lain yang
   perm-code-nya tidak ada di sini tetap murni dekoratif seperti
   semula (lihat tplRcRows() di reports.template.js). */
function rcReportHandlerFor(perm){
  if(perm === 'PrintReportSspListNotReceived') return 'sspBelumDiterima';
  return null;
}

function openReportCenterInfo(msg){
  closeModal();
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.innerHTML = tplReportCenterInfoModal(msg);
  document.body.appendChild(overlay);
  document.getElementById('rcModalClose').onclick = () => overlay.remove();
  document.getElementById('rcModalCancel').onclick = () => overlay.remove();
  overlay.onclick = (e) => { if(e.target === overlay) overlay.remove(); };
}

/* =========================================================
   2026-08-21 (lanjutan) — "FA-08 Lap SSP Belum Diterima": laporan
   PERTAMA di Report Center yang dibangun sampai output sungguhan
   (filter modal + dokumen cetak), sesuai screenshot filter +
   contoh PDF "List Piutang SSP belum di Terima" yang dikirim
   user. Datanya diambil LIVE dari DATA.penerimaanPiutang (field
   potonganPpn/potonganPph/sudahTerimaSspPpn/Pph, fitur PPN/PPH
   SSP 2026-08-20) — BUKAN 213 baris data rumah-sakit sungguhan
   dari PDF contoh (itu data instalasi MASERP lain). rcSspFakturTax()
   di bawah adalah SALINAN LOKAL formula ppFakturTax() (Penerimaan
   Piutang, modul lazy-load lain yang tidak boleh diandalkan
   urutan muatnya) — DPP=Pembayaran÷1,11, PPN=Pembayaran−DPP,
   PPh=DPP×%KodePPH, persis formula yang sudah diverifikasi cocok
   dengan contoh screenshot user 2026-08-20. */
function openRcSspFilter(){
  closeModal();
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.innerHTML = tplRcSspFilterModal();
  document.body.appendChild(overlay);
  document.getElementById('rcSspFilterClose').onclick = () => overlay.remove();
  document.getElementById('rcSspFilterCancel').onclick = () => overlay.remove();
  overlay.onclick = (e) => { if(e.target === overlay) overlay.remove(); };
  overlay.querySelectorAll('[data-rc-pick]').forEach(btn => {
    btn.onclick = () => openRcFilterPicker(btn.dataset.rcPick);
  });
  document.getElementById('rcSspShowReport').onclick = () => openRcSspReportFromFilter(overlay);
  document.getElementById('rcSspShowReportPdf').onclick = () => openRcSspReportFromFilter(overlay);
}

function rcUniqueVals(arr){
  const seen = {}; const out = [];
  arr.forEach(v => { if(v && !seen[v]){ seen[v] = true; out.push(v); } });
  return out;
}

function rcSspFieldOptions(targetId){
  if(targetId === 'rcfCabang'){
    return rcUniqueVals(DATA.customers.map(c => c.cabang)).map(v => ({kode:v, label:v}));
  }
  if(targetId === 'rcfArea'){
    return rcUniqueVals(DATA.customers.map(c => c.area)).map(v => ({kode:v, label:v}));
  }
  if(targetId === 'rcfRayon'){
    const seen = {}; const out = [];
    DATA.customers.forEach(c => { if(c.rayonKode && !seen[c.rayonKode]){ seen[c.rayonKode] = true; out.push({kode:c.rayonKode, label:c.rayonNama || c.rayonKode}); } });
    return out;
  }
  if(targetId === 'rcfCustomer'){
    return DATA.customers.map(c => ({kode:c.kode, label:c.kode + ' - ' + c.nama}));
  }
  return [];
}

function openRcFilterPicker(targetId){
  const titles = {rcfCabang:'Pilih Cabang', rcfArea:'Pilih Area', rcfRayon:'Pilih Rayon', rcfCustomer:'Pilih Customer'};
  const rows = rcSspFieldOptions(targetId);
  const picker = document.createElement('div');
  picker.className = 'modal-overlay';
  picker.innerHTML = tplRcFilterPickerModal(titles[targetId] || 'Pilih', rows);
  document.body.appendChild(picker);
  document.getElementById('rcPickClose').onclick = () => picker.remove();
  document.getElementById('rcPickCancel').onclick = () => picker.remove();
  picker.onclick = (e) => { if(e.target === picker) picker.remove(); };
  picker.querySelectorAll('.rc-pick-row').forEach(row => {
    row.onclick = () => {
      const input = document.getElementById(targetId);
      if(input){ input.value = row.dataset.label; input.dataset.kode = row.dataset.kode; }
      picker.remove();
    };
  });
}

function rcSspFakturTax(pembayaran){
  const dpp = (pembayaran || 0) / 1.11;
  const ppn = (pembayaran || 0) - dpp;
  return {dpp, ppn};
}

function rcSspPphRate(pphKode){
  if(!pphKode) return 0;
  if(pphKode.indexOf('1.5') !== -1) return 0.015;
  if(pphKode.indexOf('2.5') !== -1) return 0.025;
  if(pphKode.indexOf('PPH 23') !== -1 || pphKode.indexOf('2%') !== -1) return 0.02;
  return 0;
}

function rcSspParseDMY(s){
  if(!s) return null;
  const parts = s.split('/');
  if(parts.length !== 3) return null;
  const d = new Date(Number(parts[2]), Number(parts[1]) - 1, Number(parts[0]));
  return isNaN(d.getTime()) ? null : d;
}

function rcSspInPeriode(tglStr, awalStr, akhirStr){
  const d = rcSspParseDMY(tglStr);
  if(!d) return true;
  const awal = rcSspParseDMY(awalStr);
  const akhir = rcSspParseDMY(akhirStr);
  if(awal && d < awal) return false;
  if(akhir && d > akhir) return false;
  return true;
}

function rcSspBuildRows(filter){
  const out = [];
  (DATA.penerimaanPiutang || []).forEach(pp => {
    if(filter.cabang && pp.cabang !== filter.cabang) return;
    const cust = (DATA.customers || []).find(c => c.kode === pp.customerKode) || {};
    if(filter.area && cust.area !== filter.area) return;
    if(filter.rayon && cust.rayonKode !== filter.rayon) return;
    if(filter.customer && pp.customerKode !== filter.customer) return;
    (pp.fakturs || []).forEach(f => {
      const ppnOutstanding = !!(f.potonganPpn && !f.sudahTerimaSspPpn);
      const pphOutstanding = !!(f.potonganPph && !f.sudahTerimaSspPph);
      if(!ppnOutstanding && !pphOutstanding) return;
      if(!rcSspInPeriode(f.tglFaktur, filter.periodeAwal, filter.periodeAkhir)) return;
      const tax = rcSspFakturTax(f.pembayaran);
      out.push({
        kode: cust.kode || pp.customerKode,
        nama: cust.nama || pp.customerNama,
        badanUsaha: cust.badanUsaha || '',
        tglFaktur: f.tglFaktur || '',
        noFaktur: f.no || '',
        dpp: tax.dpp,
        tglBayar: pp.tgl || '',
        ppn: tax.ppn, ppnOutstanding: ppnOutstanding,
        noNtpnPpn: f.noNtpnPpnAda ? f.noNtpnPpn : '',
        tglNtpnPpn: f.tglNtpnPpn || '',
        pph: tax.dpp * rcSspPphRate(f.pphKode), pphOutstanding: pphOutstanding,
        noNtpnPph: f.noNtpnPphAda ? f.noNtpnPph : '',
        tglNtpnPph: f.tglNtpnPph || ''
      });
    });
  });
  return out;
}

function rcTodayLabel(){
  const d = new Date();
  return String(d.getDate()).padStart(2,'0') + '/' + String(d.getMonth()+1).padStart(2,'0') + '/' + d.getFullYear();
}

function openRcSspReportFromFilter(overlay){
  const cabangEl = document.getElementById('rcfCabang');
  const areaEl = document.getElementById('rcfArea');
  const rayonEl = document.getElementById('rcfRayon');
  const customerEl = document.getElementById('rcfCustomer');
  const filter = {
    cabang: (cabangEl && cabangEl.dataset.kode) || '',
    area: (areaEl && areaEl.dataset.kode) || '',
    rayon: (rayonEl && rayonEl.dataset.kode) || '',
    customer: (customerEl && customerEl.dataset.kode) || '',
    periodeAwal: document.getElementById('rcfPeriodeAwal').value,
    periodeAkhir: document.getElementById('rcfPeriodeAkhir').value
  };
  const rows = rcSspBuildRows(filter);
  const totals = rows.reduce((acc, r) => {
    acc.dpp += r.dpp || 0;
    acc.ppn += r.ppnOutstanding ? (r.ppn || 0) : 0;
    acc.pph += r.pphOutstanding ? (r.pph || 0) : 0;
    return acc;
  }, {dpp:0, ppn:0, pph:0});
  const html = tplRcSspReportDoc(filter.periodeAkhir || rcTodayLabel(), rows, totals, 'Sidik', rcTodayLabel());
  const win = window.open('', '_blank');
  win.document.write(html);
  win.document.close();
  if(overlay) overlay.remove();
}

/* Wrapper render per kategori — 1 fungsi per key PAGE_MODULES,
   supaya core.js cukup panggil window[mod.fn]() seperti biasa. */
function renderReportCabang(){ renderReportCenterPage('cabang'); }
function renderReportAktivaTetap(){ renderReportCenterPage('aktivaTetap'); }
function renderReportAP(){ renderReportCenterPage('ap'); }
function renderReportAR(){ renderReportCenterPage('ar'); }
function renderReportPurchasing(){ renderReportCenterPage('purchasing'); }
function renderReportKasBank(){ renderReportCenterPage('kasBank'); }
function renderReportGL(){ renderReportCenterPage('gl'); }
function renderReportPersediaan(){ renderReportCenterPage('persediaan'); }
function renderReportPenjualan(){ renderReportCenterPage('penjualan'); }
function renderReportCetakanTransaksi(){ renderReportCenterPage('cetakanTransaksi'); }
