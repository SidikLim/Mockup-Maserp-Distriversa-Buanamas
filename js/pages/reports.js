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
      else if(handler === 'bonusTransaksi'){ openRcBonusFilter(); }
      else if(handler === 'transferProdukBonus'){ openRcTpbFilter(); }
      else if(handler === 'umurPiutang'){ openRcUmurFilter(); }
    };
  });
  document.querySelectorAll('[data-rc-action]').forEach(btn => {
    btn.onclick = () => {
      const action = btn.dataset.rcAction;
      if(action === 'print'){
        const handler = rcReportHandlerFor(btn.dataset.rcReport);
        if(handler === 'sspBelumDiterima'){ openRcSspFilter(); return; }
        if(handler === 'bonusTransaksi'){ openRcBonusFilter(); return; }
        if(handler === 'transferProdukBonus'){ openRcTpbFilter(); return; }
        if(handler === 'umurPiutang'){ openRcUmurFilter(); return; }
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
   SUNGGUHAN. 2026-08-26: entry ke-2 ditambahkan (Laporan Daftar
   Transaksi Barang Bonus). 2026-08-26 (lanjutan): entry ke-3
   ditambahkan (Laporan Transfer Produk Bonus, Persediaan Barang).
   Baris lain yang perm-code-nya tidak ada di sini tetap murni
   dekoratif seperti semula (lihat tplRcRows() di reports.template.js). */
function rcReportHandlerFor(perm){
  if(perm === 'PrintReportSspListNotReceived') return 'sspBelumDiterima';
  if(perm === 'PrintTransactionInventoryBonus') return 'bonusTransaksi';
  if(perm === 'PrintLaporanTransferProdukBonus') return 'transferProdukBonus';
  if(perm === 'PrintReceivabledDueDate') return 'umurPiutang';
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

/* =========================================================
   2026-08-26 — "Laporan Daftar Transaksi Barang Bonus" (Penjualan >
   grup BONUS, permission code PrintTransactionInventoryBonus): report
   SUNGGUHAN ke-2 di Report Center setelah FA-08 di atas, sesuai
   screenshot filter "+ Laporan Penjualan Barang Bonus" + 1 contoh PDF
   "LAPORAN PENJUALAN BARANG BONUS" yang dikirim user. Datanya diambil
   LIVE dari DATA.invoices (field baru `it.bonus` per baris item — lihat
   catatan besar di atas DATA.invoices, js/data.js) — BUKAN data rumah
   sakit/barang infus dari PDF contoh (itu data instalasi MASERP lain).
   rcBonusFieldOptions()/openRcBonusPicker() adalah SALINAN LOKAL pola
   rcSspFieldOptions()/openRcFilterPicker() di atas (bukan reuse
   langsung) supaya field id ('rcbXxx') & sumber datanya (termasuk
   Inventory ke DATA.items, belum pernah dipakai filter Report Center
   manapun) tidak bercampur dengan filter FA-08. rcSspParseDMY()/
   rcSspInPeriode()/rcUniqueVals()/rcTodayLabel() DI ATAS di-reuse
   langsung (bukan disalin) karena murni generik/tidak spesifik SSP,
   dan berada di FILE YANG SAMA (bukan cross-file lazy-load lain). */
function rcBonusFieldOptions(targetId){
  if(targetId === 'rcbInventory'){
    return (DATA.items || []).map(b => ({kode:b.kode, label:b.kode + ' - ' + b.nama}));
  }
  if(targetId === 'rcbCustomer'){
    return (DATA.customers || []).map(c => ({kode:c.kode, label:c.kode + ' - ' + c.nama}));
  }
  if(targetId === 'rcbCabang'){
    return rcUniqueVals((DATA.customers || []).map(c => c.cabang)).map(v => ({kode:v, label:v}));
  }
  return [];
}

function openRcBonusPicker(targetId){
  const titles = {rcbInventory:'Cari Barang', rcbCustomer:'Pilih Customer', rcbCabang:'Pilih Cabang'};
  const rows = rcBonusFieldOptions(targetId);
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

function openRcBonusFilter(){
  closeModal();
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.innerHTML = tplRcBonusFilterModal();
  document.body.appendChild(overlay);
  document.getElementById('rcBonusFilterClose').onclick = () => overlay.remove();
  document.getElementById('rcBonusFilterCancel').onclick = () => overlay.remove();
  overlay.onclick = (e) => { if(e.target === overlay) overlay.remove(); };
  overlay.querySelectorAll('[data-rc-pick]').forEach(btn => {
    btn.onclick = () => openRcBonusPicker(btn.dataset.rcPick);
  });
  document.getElementById('rcBonusShowReport').onclick = () => openRcBonusReportFromFilter(overlay);
  document.getElementById('rcBonusShowReportPdf').onclick = () => openRcBonusReportFromFilter(overlay);
}

/* Baris laporan = 1 baris per (Invoice, item bertanda bonus:true) yang
   lolos filter Inventory (kode barang)/Customer/Cabang/Lokasi Gudang/
   Periode (Tgl. Faktur = row.tgl Invoice). */
function rcBonusBuildRows(filter){
  const out = [];
  (DATA.invoices || []).forEach(inv => {
    if(filter.cabang && inv.cabang !== filter.cabang) return;
    if(filter.customer && inv.customerKode !== filter.customer) return;
    if(filter.gudang && inv.gudang !== filter.gudang) return;
    if(!rcSspInPeriode(inv.tgl, filter.periodeAwal, filter.periodeAkhir)) return;
    (inv.items || []).forEach(it => {
      if(!it.bonus) return;
      if(filter.inventory && it.kode !== filter.inventory) return;
      out.push({
        noFaktur: inv.no,
        tglFaktur: inv.tgl,
        customerNama: inv.customerNama,
        kodeBarang: it.kode,
        namaBarang: it.nama,
        qty: +it.qtyKirim || 0
      });
    });
  });
  return out;
}

function openRcBonusReportFromFilter(overlay){
  const invEl = document.getElementById('rcbInventory');
  const custEl = document.getElementById('rcbCustomer');
  const cabangEl = document.getElementById('rcbCabang');
  const gudangEl = document.getElementById('rcbGudang');
  const filter = {
    inventory: (invEl && invEl.dataset.kode) || '',
    customer: (custEl && custEl.dataset.kode) || '',
    cabang: (cabangEl && cabangEl.dataset.kode) || '',
    gudang: (gudangEl && gudangEl.value) || '',
    periodeAwal: document.getElementById('rcbPeriodeAwal').value,
    periodeAkhir: document.getElementById('rcbPeriodeAkhir').value
  };
  const rows = rcBonusBuildRows(filter);
  const grandTotalQty = rows.reduce((sum, r) => sum + (r.qty || 0), 0);
  const html = tplRcBonusReportDoc(filter.periodeAwal || rcTodayLabel(), filter.periodeAkhir || rcTodayLabel(), rows, grandTotalQty, 'Sidik', rcTodayLabel());
  const win = window.open('', '_blank');
  win.document.write(html);
  win.document.close();
  if(overlay) overlay.remove();
}

/* =========================================================
   2026-08-26 (lanjutan) — "Laporan Transfer Produk Bonus"
   (Persediaan Barang > grup LAPORAN TRANSAKSI INVENTORY, permission
   code PrintLaporanTransferProdukBonus): report SUNGGUHAN ke-3 di
   Report Center, sesuai screenshot filter "+ Print Laporan Produk
   Bonus" (Gudang/Inventory/No. Bukti/radio Sortir Bulan-Tanggal +
   dropdown Pilih Bulan) + 1 contoh PDF "Laporan Barang Bonus" (kosong
   — 0 baris, "-" placeholder — export live dari instalasi MASERP
   Sidik sendiri yang saat itu memang belum punya transaksi jenis ini
   di rentang tanggal yang di-generate, BUKAN berarti kolomnya salah).
   Datanya diambil LIVE dari DATA.transaksiPersediaan yang SUDAH ADA
   (modul "Transaksi Persediaan", dibangun sesi lain sebelum sesi ini —
   lihat komentar besar di atas array itu di js/data.js) — baris dengan
   tipeTransaksi==='Transfer Produk Bonus' (2 baris sample:
   26/TPB-HO/08/00001 Mie Instan Indomie Goreng -> Kopi Kapal Api,
   26/TPB-HO/08/00002 Gula Pasir Gulaku -> Teh Celup Sariwangi, keduanya
   Head Office Agustus 2026) — BUKAN data baru yang diciptakan khusus
   untuk laporan ini. "Harga Pokok" per baris diambil dari
   DATA.items[kodeSumber].hargaBeliPerTanggal[0].harga (harga beli/cost
   basis, satu-satunya field cost yang ada di master barang mockup ini
   — DATA.transaksiPersediaan sendiri menyimpan harga:0/jumlah:0 utk
   baris TPB karena transfer internal ini tidak dicatat berharga di
   modulnya sendiri), Jumlah = Qty x Harga Pokok (dihitung di sini,
   bukan field siap pakai). Radio "Sortir Bulan / Tanggal" DIBUAT
   FUNGSIONAL untuk pilihan "Month" (beda dari radio dekoratif di
   filter FA-08/Bonus Penjualan) karena screenshot acuan MEMANG hanya
   menunjukkan varian Month (dropdown "Pilih Bulan" terisi "Agustus
   2026") — opsi "Date" dibiarkan dekoratif/tidak switch UI (tidak ada
   varian Date di screenshot untuk direplikasi), didokumentasikan
   sebagai simplifikasi yang sama seperti radio Sortir Bulan/Tanggal
   FA-08. rcTpbFieldOptions()/openRcTpbPicker() SALINAN LOKAL pola
   rcBonusFieldOptions()/openRcBonusPicker() di atas (id field & sumber
   data beda: Gudang ke DATA.gudang, No. Bukti ke No Bukti TPB yang
   ada, bukan disatukan supaya tidak bercampur). rcTodayLabel()/
   rcUniqueVals() di atas di-reuse langsung (generik, file yang sama). */
function rcTpbMonthList(){
  return ['Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember'];
}

function rcTpbFieldOptions(targetId){
  if(targetId === 'rctGudang'){
    return (DATA.gudang || []).map(g => ({kode:g.kode, label:'(' + g.kode + ') ' + g.nama}));
  }
  if(targetId === 'rctInventory'){
    return (DATA.items || []).map(b => ({kode:b.kode, label:b.kode + ' - ' + b.nama}));
  }
  if(targetId === 'rctNoBukti'){
    return (DATA.transaksiPersediaan || [])
      .filter(t => t.tipeTransaksi === 'Transfer Produk Bonus')
      .map(t => ({kode:t.no, label:t.no}));
  }
  return [];
}

function openRcTpbPicker(targetId){
  const titles = {rctGudang:'Cari Gudang', rctInventory:'Cari Barang', rctNoBukti:'Pilih No. Bukti'};
  const rows = rcTpbFieldOptions(targetId);
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

function openRcTpbFilter(){
  closeModal();
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.innerHTML = tplRcTpbFilterModal();
  document.body.appendChild(overlay);
  document.getElementById('rcTpbFilterClose').onclick = () => overlay.remove();
  document.getElementById('rcTpbFilterCancel').onclick = () => overlay.remove();
  overlay.onclick = (e) => { if(e.target === overlay) overlay.remove(); };
  overlay.querySelectorAll('[data-rc-pick]').forEach(btn => {
    btn.onclick = () => openRcTpbPicker(btn.dataset.rcPick);
  });
  document.getElementById('rcTpbShowReport').onclick = () => openRcTpbReportFromFilter(overlay);
  document.getElementById('rcTpbShowReportPdf').onclick = () => openRcTpbReportFromFilter(overlay);
}

function rcTpbHargaPokok(kode){
  const item = (DATA.items || []).find(x => x.kode === kode);
  if(!item || !item.hargaBeliPerTanggal || !item.hargaBeliPerTanggal.length) return 0;
  return +item.hargaBeliPerTanggal[0].harga || 0;
}

/* Baris laporan = 1 baris per (Transaksi Persediaan bertipe "Transfer
   Produk Bonus", item) yang lolos filter Gudang (gudangSumber)/
   Inventory (kode ATAU kodeTarget)/No. Bukti/Bulan (via tglTrnSort). */
function rcTpbBuildRows(filter){
  const out = [];
  (DATA.transaksiPersediaan || []).forEach(t => {
    if(t.tipeTransaksi !== 'Transfer Produk Bonus') return;
    if(filter.gudang && t.gudangSumber.indexOf('(' + filter.gudang + ')') !== 0) return;
    if(filter.noBukti && t.no !== filter.noBukti) return;
    if(filter.bulan && String(t.tglTrnSort).slice(0,6) !== filter.bulan) return;
    (t.items || []).forEach(it => {
      if(filter.inventory && it.kode !== filter.inventory && it.kodeTarget !== filter.inventory) return;
      const hpp = rcTpbHargaPokok(it.kode);
      out.push({
        noBukti: t.no,
        tanggal: t.tglTrn,
        kodeSumber: it.kode,
        namaSumber: it.nama,
        kodeTarget: it.kodeTarget || '-',
        namaTarget: it.namaTarget || '-',
        qty: +it.qty || 0,
        satuan: it.um || '',
        hargaPokok: hpp,
        jumlah: (+it.qty || 0) * hpp
      });
    });
  });
  return out;
}

function openRcTpbReportFromFilter(overlay){
  const gudangEl = document.getElementById('rctGudang');
  const invEl = document.getElementById('rctInventory');
  const noBuktiEl = document.getElementById('rctNoBukti');
  const bulanEl = document.getElementById('rctBulan');
  const bulanVal = bulanEl ? bulanEl.value : '';
  const filter = {
    gudang: (gudangEl && gudangEl.dataset.kode) || '',
    inventory: (invEl && invEl.dataset.kode) || '',
    noBukti: (noBuktiEl && noBuktiEl.dataset.kode) || '',
    bulan: bulanVal
  };
  const rows = rcTpbBuildRows(filter);
  const grandTotal = rows.reduce((sum, r) => sum + (r.jumlah || 0), 0);
  let periodeAwal = '', periodeAkhir = '';
  if(bulanVal && bulanVal.length === 6){
    const year = +bulanVal.slice(0,4), month = +bulanVal.slice(4,6);
    const lastDay = new Date(year, month, 0).getDate();
    periodeAwal = '01/' + String(month).padStart(2,'0') + '/' + year;
    periodeAkhir = String(lastDay).padStart(2,'0') + '/' + String(month).padStart(2,'0') + '/' + year;
  }
  const html = tplRcTpbReportDoc(periodeAwal, periodeAkhir, rows, grandTotal, rcTodayLabel());
  const win = window.open('', '_blank');
  win.document.write(html);
  win.document.close();
  if(overlay) overlay.remove();
}

/* =========================================================
   2026-08-28 — "FA-10 Lap Umur Piutang" (Account Receivable >
   grup FINANCE, permission code PrintReceivabledDueDate): report
   SUNGGUHAN ke-4 di Report Center, sesuai screenshot filter
   "+ Laporan Umur Piutang Customer" (Pilih Mata Uang/Customer
   Group/Customer/Interval 30/Salesman/Cabang/Area/Rayon/Periode
   Transaksi 01/03/2025 S/D 31/08/2026/Batas Tanggal/keterangan
   rumus/Show Total Salesman/Close/Show Report/Show Report Pdf)
   + contoh PDF "Laporan Perincian Umur Piutang" 91 halaman yang
   dikirim user (header Tgl Print + nama perusahaan + Per tanggal
   + Tgl Umur Piutang; kolom No./No. Faktur/Tgl. Trn/Tgl. Jtmp/
   Jlh. Transaksi/Lewat Jth Tmp/Umur/1-30/31-60/61-90/91-120/
   >120 Hari/SSP; grup Currency > Departemen > Customer dgn
   Subtotal Customer/Departemen/Currency). Data customer rumah
   sakit di PDF contoh adalah instalasi MASERP lain (SDL) — TIDAK
   direplikasi, mengikuti precedent FA-08/Bonus.

   MODIFIKASI DBM YANG DIMINTA USER (2026-08-28): opsi "View
   Report" BARU di filter — perhitungan UMUR (dasar penentuan
   bucket kolom umur) bisa dipilih "Tanggal Faktur" (default,
   persis perilaku contoh PDF: Umur = Batas Tanggal - Tanggal
   Transaksi) atau "Tanggal Jatuh Tempo" (Umur = Batas Tanggal -
   Tanggal Jatuh Tempo). Pada mode Tanggal Jatuh Tempo, faktur
   yang BELUM jatuh tempo tidak punya umur keterlambatan — kolom
   bucket tambahan "Belum Jth Tempo" disisipkan sebelum "1-30
   Hari" khusus mode itu (kolom & baris subtotal ikut menyesuaikan;
   dokumen juga mencetak baris keterangan "Umur Piutang
   Berdasarkan : ..." di bawah "Tgl Umur Piutang" supaya jelas
   mode mana yang sedang dicetak).

   SUMBER DATA (semua LIVE, bukan salinan PDF contoh):
   1. DATA.invoices — outstanding = jumlah - (dibayar||0) per
      batas tanggal (faktur lunas otomatis hilang); Tgl. Jtmp
      dihitung dari syaratBayar faktur ('Kredit N Hari' -> +N
      hari, 'CBD'/tanpa angka -> = tgl faktur).
   2. DATA.arFakturHistoris (BARU, lihat komentar besar di
      js/data.js) — rincian per-faktur saldo piutang historis yang
      rekonsil PERSIS dengan field `piutang` DATA.customers,
      supaya bucket 31-60/61-90/91-120/>120 benar-benar terisi.
   3. DATA.penerimaanPiutang — faktur yang piutangnya sudah lunas
      tapi SSP PPN/PPH-nya belum diterima muncul sebagai baris
      Jlh. Transaksi 0,00 dengan nilai di kolom SSP (persis pola
      baris SSP di PDF contoh, mis. C000201), nominalnya dihitung
      rcSspFakturTax()/rcSspPphRate() yang SAMA dengan FA-08.
   Interval (default 30) FUNGSIONAL: lebar bucket mengikuti input
   (1-N, N+1-2N, ... , >4N). "Show Total Salesman" FUNGSIONAL:
   menambah blok "Total per Salesman" di bawah tabel. Field Mata
   Uang & Cabang dibuat <select> polos (bukan picker kaca
   pembesar) meniru screenshot acuan yang tidak menampilkan tombol
   pencarian di kedua field itu — precedent field "Lokasi Gudang"
   filter Bonus. Grup "Departemen : 00" ditulis tetap (data DBM
   mockup tidak punya dimensi departemen; PDF contoh menampilkan
   departemen per customer — disederhanakan 1 departemen 00,
   didokumentasikan sebagai simplifikasi). rcSspParseDMY()/
   rcUniqueVals()/rcTodayLabel()/tplRcFieldWithBtn() di atas
   di-reuse langsung (generik, file yang sama). */
function rcuFieldOptions(targetId){
  if(targetId === 'rcuGroup'){
    return rcUniqueVals((DATA.customers || []).map(c => c.groupCustomer)).map(v => ({kode:v, label:v}));
  }
  if(targetId === 'rcuCustomer'){
    return (DATA.customers || []).map(c => ({kode:c.kode, label:c.kode + ' - ' + c.nama}));
  }
  if(targetId === 'rcuSalesman'){
    return rcUniqueVals((DATA.customers || []).map(c => c.salesman)).map(v => ({kode:v, label:v}));
  }
  if(targetId === 'rcuArea'){
    return rcUniqueVals((DATA.customers || []).map(c => c.area)).map(v => ({kode:v, label:v}));
  }
  if(targetId === 'rcuRayon'){
    const seen = {}; const out = [];
    (DATA.customers || []).forEach(c => { if(c.rayonKode && !seen[c.rayonKode]){ seen[c.rayonKode] = true; out.push({kode:c.rayonKode, label:c.rayonNama || c.rayonKode}); } });
    return out;
  }
  return [];
}

function openRcUmurPicker(targetId){
  const titles = {rcuGroup:'Pilih Customer Group', rcuCustomer:'Pilih Customer', rcuSalesman:'Cari Salesman', rcuArea:'Pilih Area', rcuRayon:'Pilih Rayon'};
  const rows = rcuFieldOptions(targetId);
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

function openRcUmurFilter(){
  closeModal();
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.innerHTML = tplRcUmurFilterModal();
  document.body.appendChild(overlay);
  document.getElementById('rcUmurFilterClose').onclick = () => overlay.remove();
  document.getElementById('rcUmurFilterCancel').onclick = () => overlay.remove();
  overlay.onclick = (e) => { if(e.target === overlay) overlay.remove(); };
  overlay.querySelectorAll('[data-rc-pick]').forEach(btn => {
    btn.onclick = () => openRcUmurPicker(btn.dataset.rcPick);
  });
  /* Keterangan rumus di bawah Batas Tanggal ikut berubah saat radio
     "View Report" (modifikasi DBM) dipindah, supaya user langsung
     melihat konsekuensi pilihannya sebelum menekan Show Report. */
  overlay.querySelectorAll('input[name="rcuBasis"]').forEach(r => {
    r.onchange = () => {
      const note = document.getElementById('rcuFormulaNote');
      if(note) note.innerHTML = tplRcUmurFormulaNote(rcuSelectedBasis());
    };
  });
  document.getElementById('rcuShowReport').onclick = () => openRcUmurReportFromFilter(overlay);
  document.getElementById('rcuShowReportPdf').onclick = () => openRcUmurReportFromFilter(overlay);
}

function rcuSelectedBasis(){
  const el = document.querySelector('input[name="rcuBasis"]:checked');
  return el ? el.value : 'faktur';
}

/* 'Kredit 30 Hari' -> 30; 'CBD'/'Tunai'/kosong -> 0 (jatuh tempo =
   tanggal faktur, konsisten sifat cash-before-delivery). */
function rcuTermDays(syarat){
  const m = /(\d+)/.exec(syarat || '');
  return m ? Number(m[1]) : 0;
}

function rcuFmtDMY(d){
  return String(d.getDate()).padStart(2,'0') + '/' + String(d.getMonth()+1).padStart(2,'0') + '/' + d.getFullYear();
}

function rcuAddDays(dmyStr, days){
  const d = rcSspParseDMY(dmyStr);
  if(!d) return dmyStr;
  d.setDate(d.getDate() + days);
  return rcuFmtDMY(d);
}

function rcuDaysDiff(fromDmy, toDmy){
  const a = rcSspParseDMY(fromDmy), b = rcSspParseDMY(toDmy);
  if(!a || !b) return 0;
  return Math.round((b.getTime() - a.getTime()) / 86400000);
}

function rcuInterval(){
  const el = document.getElementById('rcuInterval');
  const n = el ? parseInt(el.value, 10) : 30;
  return (n > 0 && n <= 999) ? n : 30;
}

/* 5 bucket umur, lebar mengikuti Interval (default 30 -> 1-30/31-60/
   61-90/91-120/>120 persis PDF contoh). */
function rcuBuckets(interval){
  return [
    {label:'1 - ' + interval + ' Hari', min:1, max:interval},
    {label:(interval+1) + ' - ' + (2*interval) + ' Hari', min:interval+1, max:2*interval},
    {label:(2*interval+1) + ' - ' + (3*interval) + ' Hari', min:2*interval+1, max:3*interval},
    {label:(3*interval+1) + ' - ' + (4*interval) + ' Hari', min:3*interval+1, max:4*interval},
    {label:'>' + (4*interval) + ' Hari', min:4*interval+1, max:Infinity},
  ];
}

function rcuBucketIndex(age, buckets){
  for(let i = 0; i < buckets.length; i++){
    if(age >= buckets[i].min && age <= buckets[i].max) return i;
  }
  return age > 0 ? buckets.length - 1 : 0;
}

/* Kumpulkan SEMUA baris kandidat (live invoice + historis + SSP
   outstanding), lalu saring dengan filter modal. 1 baris = 1 faktur. */
function rcuBuildRows(filter){
  const out = [];
  const custOf = kode => (DATA.customers || []).find(c => c.kode === kode) || {};
  function pushRow(customerKode, cabang, noFaktur, tglTrn, tglJtmp, jlhTransaksi, ssp){
    const cust = custOf(customerKode);
    if(filter.mataUang && (cust.mataUang || 'IDR') !== filter.mataUang) return;
    if(filter.group && cust.groupCustomer !== filter.group) return;
    if(filter.customer && customerKode !== filter.customer) return;
    if(filter.salesman && cust.salesman !== filter.salesman) return;
    if(filter.cabang && cabang !== filter.cabang) return;
    if(filter.area && cust.area !== filter.area) return;
    if(filter.rayon && cust.rayonKode !== filter.rayon) return;
    if(!rcSspInPeriode(tglTrn, filter.periodeAwal, filter.periodeAkhir)) return;
    const umurFaktur = rcuDaysDiff(tglTrn, filter.batasTanggal);
    const telat = rcuDaysDiff(tglJtmp, filter.batasTanggal);
    out.push({
      customerKode: customerKode,
      customerNama: cust.nama || customerKode,
      salesman: cust.salesman || '',
      noFaktur: noFaktur, tglTrn: tglTrn, tglJtmp: tglJtmp,
      jlhTransaksi: jlhTransaksi, ssp: ssp,
      umurFaktur: umurFaktur, telat: telat
    });
  }
  /* 1. Outstanding live dari modul Invoice. */
  (DATA.invoices || []).forEach(inv => {
    const sisa = (inv.jumlah || 0) - (inv.dibayar || 0);
    if(sisa <= 0) return;
    pushRow(inv.customerKode, inv.cabang, inv.no, inv.tgl, rcuAddDays(inv.tgl, rcuTermDays(inv.syaratBayar)), sisa, 0);
  });
  /* 2. Saldo historis per faktur (lihat komentar DATA.arFakturHistoris). */
  (DATA.arFakturHistoris || []).forEach(h => {
    pushRow(h.customerKode, h.cabang, h.noFaktur, h.tglFaktur, h.tglJthTempo, h.sisa, 0);
  });
  /* 3. Faktur lunas yang SSP-nya masih outstanding (pola baris
     "Jlh. Transaksi 0,00 + kolom SSP terisi" di PDF contoh). */
  (DATA.penerimaanPiutang || []).forEach(pp => {
    (pp.fakturs || []).forEach(f => {
      const ppnOut = !!(f.potonganPpn && !f.sudahTerimaSspPpn);
      const pphOut = !!(f.potonganPph && !f.sudahTerimaSspPph);
      if(!ppnOut && !pphOut) return;
      const tax = rcSspFakturTax(f.pembayaran);
      const ssp = (ppnOut ? tax.ppn : 0) + (pphOut ? tax.dpp * rcSspPphRate(f.pphKode) : 0);
      pushRow(pp.customerKode, f.cabang || pp.cabang, f.no, f.tglFaktur, f.tglJthTempo, 0, ssp);
    });
  });
  /* Urut per customer (kode), lalu per tanggal transaksi naik —
     mengikuti urutan baris di PDF contoh. */
  out.sort((a, b) => a.customerKode === b.customerKode
    ? (rcSspParseDMY(a.tglTrn) - rcSspParseDMY(b.tglTrn))
    : (a.customerKode < b.customerKode ? -1 : 1));
  return out;
}

function openRcUmurReportFromFilter(overlay){
  const val = id => { const el = document.getElementById(id); return el ? el.value : ''; };
  const kode = id => { const el = document.getElementById(id); return (el && el.dataset.kode) || ''; };
  const filter = {
    mataUang: val('rcuMataUang'),
    group: kode('rcuGroup'),
    customer: kode('rcuCustomer'),
    salesman: kode('rcuSalesman'),
    cabang: val('rcuCabang'),
    area: kode('rcuArea'),
    rayon: kode('rcuRayon'),
    periodeAwal: val('rcuPeriodeAwal'),
    periodeAkhir: val('rcuPeriodeAkhir'),
    batasTanggal: val('rcuBatasTanggal') || rcTodayLabel()
  };
  const basis = rcuSelectedBasis();
  const interval = rcuInterval();
  const showTotalSalesman = !!(document.getElementById('rcuShowTotalSalesman') || {}).checked;
  const rows = rcuBuildRows(filter);
  const html = tplRcUmurReportDoc(filter, basis, interval, rows, showTotalSalesman, 'Sidik', rcTodayLabel());
  const win = window.open('', '_blank');
  win.document.write(html);
  win.document.close();
  if(overlay) overlay.remove();
}
