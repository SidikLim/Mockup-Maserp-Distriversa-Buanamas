/* =========================================================
   TEMPLATE (HTML saja) — Daftar Laporan / Report Center
   Logic-nya ada di file sebelah: reports.js

   Diganti total 2026-08-21 (lihat catatan proyek): sebelumnya
   halaman ini hanya grid kartu dekoratif dari DATA.reports
   (array string polos). Sekarang menjadi renderer GENERIK
   "Report Center" (persis gaya screenshot MASERP: tabel
   No./Report/Keterangan/Permission Code/Print/Edit Report/
   Reset Report, dikelompokkan per header kategori) yang dipakai
   BERSAMA oleh 10 submenu "Daftar Laporan" (Cetakan Transaksi/
   Account Receivable/Penjualan/Account Payable/Purchasing/
   Persediaan Barang/Kas-Bank/General Ledger/Aktiva Tetap/Cabang)
   — lihat js/pages/reports.js untuk wrapper render per kategori
   & js/data.js (DATA.reportCenters) untuk isi datanya.

   PENTING: file ini (dan reports.js pasangannya) dimuat lewat
   lazy-load PAGE_MODULES untuk 10 KEY MENU BERBEDA yang semuanya
   menunjuk ke srcs yang SAMA (lihat js/core.js) — supaya file
   fisiknya tidak perlu digandakan 10x. Konsekuensinya: file ini
   bisa saja di-inject sebagai <script> lebih dari sekali dalam
   satu sesi (tiap kali kategori report BARU pertama kali diklik).
   Karena itu SELURUH kode top-level di file ini (di sini maupun
   di reports.js) WAJIB hanya berupa `function` declaration —
   TIDAK BOLEH ada `const`/`let` di top-level, karena re-deklarasi
   const/let lewat <script> tag terpisah akan melempar
   SyntaxError "Identifier sudah dideklarasikan". `function`
   declaration aman didekralasikan ulang berkali-kali.
========================================================= */
function tplReportCenterPage(title, groups){
  return `
    <div class="breadcrumb">Home / <b>Daftar Laporan</b> / <b>${title}</b></div>
    <div class="page-head">
      <h2>${icon('chart',18)} Report Center ${title}</h2>
    </div>
    <div class="card">
      <div class="table-toolbar">
        <input type="text" id="rcSearch" placeholder="search ...">
      </div>
      <div class="table-wrap">
        <table class="rc-table">
          <thead><tr>
            <th style="width:44px;">No.</th>
            <th style="width:210px;">Report</th>
            <th>Keterangan</th>
            <th style="width:160px;">Permission Code</th>
            <th style="width:54px;">Print</th>
            <th style="width:70px;">Edit<br>Report</th>
            <th style="width:74px;">Reset<br>Report</th>
          </tr></thead>
          <tbody id="rcBody">${tplRcRows(groups)}</tbody>
        </table>
      </div>
    </div>`;
}

function tplRcRows(groups){
  if(!groups || !groups.length){
    return `<tr><td colspan="7" style="color:var(--text-light);padding:16px;">Tidak ada laporan yang cocok dengan pencarian.</td></tr>`;
  }
  return groups.map(g => `
    ${g.name ? `<tr class="rc-group-row"><td colspan="7">${g.name}</td></tr>` : ''}
    ${g.rows.map(r => {
      /* 2026-08-21 (lanjutan): baris yang perm-code-nya punya handler
         nyata (lihat rcReportHandlerFor() di reports.js — sejauh ini
         cuma FA-08 Lap SSP Belum Diterima) ditampilkan sebagai LINK
         biru yang bisa diklik (persis "Kode Rayon" di Master Rayon),
         beda dari ~200+ baris lain yang tetap teks polos apa adanya. */
      const handled = !!rcReportHandlerFor(r.perm);
      const nameCell = handled
        ? `<a href="javascript:void(0)" class="rc-report-link" data-rc-report="${r.perm}">${r.report}</a>`
        : r.report;
      return `
      <tr${handled ? ' class="rc-report-handled"' : ''}>
        <td>${r.no}</td>
        <td>${nameCell}</td>
        <td class="rc-ket">${r.ket||''}</td>
        <td>${r.perm||''}</td>
        <td><button type="button" class="rc-icon-btn rc-print" data-rc-action="print" data-rc-report="${r.perm||''}" title="Print">${icon('printer',14)}</button></td>
        <td><button type="button" class="rc-icon-btn rc-edit" data-rc-action="edit" title="Edit Report">${icon('edit',14)}</button></td>
        <td><button type="button" class="rc-icon-btn rc-reset" data-rc-action="reset" title="Reset Report">${icon('refreshCw',14)}</button></td>
      </tr>`;
    }).join('')}
  `).join('');
}

function tplReportCenterInfoModal(msg){
  return `
    <div class="modal-box" style="max-width:440px;">
      <div class="modal-header"><span>Informasi</span><span class="close" id="rcModalClose">&times;</span></div>
      <div class="modal-body"><p>${msg}</p></div>
      <div class="modal-footer"><button class="btn-secondary" id="rcModalCancel">Tutup</button></div>
    </div>`;
}

/* =========================================================
   2026-08-21 (lanjutan) — Report SUNGGUHAN pertama di Report
   Center: "FA-08 Lap SSP Belum Diterima" (Account Receivable),
   dibangun sesuai screenshot filter "+ Laporan Daftar SSP yang
   belum diterima" (Cabang/Area/Rayon/Customer/Sortir Bulan-
   Tanggal/Periode/Close/Show Report/Show Report Pdf) + contoh
   PDF "List Piutang SSP belum di Terima" yang dikirim user.
   Sesuai instruksi user, hanya laporan INI yang dibangun sampai
   output sungguhan — 200+ baris Report Center lain TETAP hanya
   daftar (tombol dekoratif), lihat rcReportHandlerFor() di
   reports.js. Datanya diambil LIVE dari DATA.penerimaanPiutang
   (field potonganPpn/potonganPph/sudahTerimaSspPpn/Pph yang
   sudah ada sejak fitur PPN/PPH SSP 2026-08-20) — BUKAN 213 baris
   data rumah-sakit sungguhan dari PDF contoh (itu data instalasi
   MASERP lain, tidak etis/relevan direplikasi ke mockup DBM ini),
   jadi jumlah barisnya jauh lebih sedikit (mengikuti data DBM
   yang memang ada) — konsisten precedent downsize-volume modul
   lain (Master Rayon/Price List By Province/Cetakan Transaksi). */
function tplRcFieldWithBtn(label, id, placeholder){
  return `
    <div class="form-group">
      <label>${label}</label>
      <div class="input-with-btn">
        <input type="text" id="${id}" placeholder="${placeholder}" readonly>
        <button type="button" class="btn-pick" data-rc-pick="${id}">${icon('search',14)}</button>
      </div>
    </div>`;
}

function tplRcSspFilterModal(){
  const todayPeriodeAwal = '01/08/2026', todayPeriodeAkhir = '31/08/2026';
  return `
    <div class="modal-box" style="max-width:520px;">
      <div class="modal-header"><span>+ Laporan Daftar SSP yang belum diterima</span><span class="close" id="rcSspFilterClose">&times;</span></div>
      <div class="modal-body">
        ${tplRcFieldWithBtn('Cabang', 'rcfCabang', 'Pilih Cabang')}
        ${tplRcFieldWithBtn('Area', 'rcfArea', 'Pilih Area')}
        ${tplRcFieldWithBtn('Rayon', 'rcfRayon', 'Pilih Rayon')}
        ${tplRcFieldWithBtn('Customer', 'rcfCustomer', 'Pilih Customer')}
        <div class="form-group">
          <label>Sortir Bulan / Tanggal</label>
          <div class="radio-inline">
            <label><input type="radio" name="rcfSortir" value="month"> Month</label>
            <label><input type="radio" name="rcfSortir" value="date" checked> Date</label>
          </div>
        </div>
        <div class="form-group">
          <label>Periode</label>
          <div class="field-pair">
            <input type="text" id="rcfPeriodeAwal" value="${todayPeriodeAwal}">
            <span style="align-self:center;color:var(--text-light);">S/D</span>
            <input type="text" id="rcfPeriodeAkhir" value="${todayPeriodeAkhir}">
          </div>
        </div>
      </div>
      <div class="modal-footer">
        <button class="btn-secondary" id="rcSspFilterCancel">Close</button>
        <button class="btn-primary" id="rcSspShowReport">Show Report</button>
        <button class="btn-primary" id="rcSspShowReportPdf">Show Report Pdf</button>
      </div>
    </div>`;
}

function tplRcFilterPickerModal(title, rows){
  return `
    <div class="modal-box" style="max-width:420px;">
      <div class="modal-header"><span>${title}</span><span class="close" id="rcPickClose">&times;</span></div>
      <div class="modal-body" style="max-height:360px;overflow-y:auto;">
        <table>
          <tbody id="rcPickRows">${tplRcFilterPickerRows(rows)}</tbody>
        </table>
      </div>
      <div class="modal-footer"><button class="btn-secondary" id="rcPickCancel">Tutup</button></div>
    </div>`;
}

function tplRcFilterPickerRows(rows){
  if(!rows || !rows.length){
    return `<tr><td style="color:var(--text-light);padding:10px;">Tidak ada data.</td></tr>`;
  }
  return rows.map(r => `<tr class="rc-pick-row" data-kode="${r.kode}" data-label="${r.label}" style="cursor:pointer;"><td style="padding:8px 10px;border-bottom:1px solid var(--border);">${r.label}</td></tr>`).join('');
}

function tplRcSspReportDoc(periodeAkhir, rows, totals, printedBy, printedAt){
  const fmt2 = n => Number(n||0).toLocaleString('id-ID', {minimumFractionDigits:2, maximumFractionDigits:2});
  const bodyRows = !rows.length
    ? `<tr><td colspan="12" style="text-align:center;color:#777;padding:14px;">Tidak ada data SSP yang belum diterima untuk filter ini.</td></tr>`
    : rows.map((r,i) => `
      <tr>
        <td style="text-align:center;">${i+1}</td>
        <td>${r.kode}</td>
        <td>${r.nama}</td>
        <td>${r.badanUsaha||''}</td>
        <td>${r.tglFaktur||''}</td>
        <td>${r.noFaktur||''}</td>
        <td style="text-align:right;">${fmt2(r.dpp)}</td>
        <td>${r.tglBayar||''}</td>
        <td style="text-align:right;">${r.ppnOutstanding ? fmt2(r.ppn) : ''}</td>
        <td>${r.ppnOutstanding ? (r.noNtpnPpn||'') : ''}</td>
        <td>${r.ppnOutstanding ? (r.tglNtpnPpn||'') : ''}</td>
        <td style="text-align:right;">${r.pphOutstanding ? fmt2(r.pph) : ''}</td>
        <td>${r.pphOutstanding ? (r.noNtpnPph||'') : ''}</td>
        <td>${r.pphOutstanding ? (r.tglNtpnPph||'') : ''}</td>
      </tr>`).join('');
  return `<!DOCTYPE html>
<html><head><meta charset="utf-8"><title>List Piutang SSP belum di Terima</title>
<style>
  body{font-family:Arial, Helvetica, sans-serif;font-size:11px;color:#111;margin:20px;}
  .rc-doc-toolbar{margin-bottom:10px;}
  .rc-doc-toolbar button{padding:7px 16px;border:none;border-radius:5px;font-size:12.5px;font-weight:600;cursor:pointer;margin-right:8px;}
  .rc-doc-toolbar .btn-print{background:#4472c4;color:#fff;}
  .rc-doc-toolbar .btn-close{background:#eef1f7;color:#333;}
  h1{font-size:14px;text-align:center;margin:2px 0;}
  .sub{font-size:11px;text-align:center;margin:0 0 12px;}
  table{width:100%;border-collapse:collapse;}
  th,td{border:1px solid #999;padding:3px 5px;font-size:10.2px;}
  thead th{background:#f0f0f0;text-align:center;font-weight:700;}
  tfoot td{font-weight:700;background:#f7f7f7;}
  .rc-doc-sign{margin-top:26px;font-size:11px;}
  @media print{ .rc-doc-toolbar{display:none;} body{margin:0;} }
</style></head>
<body>
  <div class="rc-doc-toolbar">
    <button class="btn-print" onclick="window.print()">Cetak</button>
    <button class="btn-close" onclick="window.close()">Tutup</button>
  </div>
  <h1>List Piutang SSP belum di Terima</h1>
  <div class="sub">Periode: ${periodeAkhir}</div>
  <table>
    <thead>
      <tr>
        <th rowspan="2">No.</th>
        <th colspan="5">Konsumen</th>
        <th colspan="2">DPP</th>
        <th colspan="3">PPN</th>
        <th colspan="3">PPh ps 22</th>
      </tr>
      <tr>
        <th>Kode</th><th>Nama</th><th>Badan Usaha</th><th>Tgl. Faktur</th><th>No. Faktur</th>
        <th>Nominal</th><th>Tgl. Bayar</th>
        <th>Nominal</th><th>NTPN</th><th>Tgl NTPN</th>
        <th>Nominal</th><th>NTPN</th><th>Tgl NTPN</th>
      </tr>
    </thead>
    <tbody>${bodyRows}</tbody>
    <tfoot>
      <tr>
        <td colspan="6" style="text-align:right;">Grand Total</td>
        <td style="text-align:right;">${fmt2(totals.dpp)}</td>
        <td></td>
        <td style="text-align:right;">${fmt2(totals.ppn)}</td>
        <td colspan="2"></td>
        <td style="text-align:right;">${fmt2(totals.pph)}</td>
        <td colspan="2"></td>
      </tr>
    </tfoot>
  </table>
  <div class="rc-doc-sign">${printedBy}<br>${printedAt}</div>
</body></html>`;
}

/* =========================================================
   2026-08-26 — Report SUNGGUHAN kedua di Report Center:
   "Laporan Daftar Transaksi Barang Bonus" (Penjualan > grup BONUS,
   permission code PrintTransactionInventoryBonus), dibangun sesuai
   screenshot filter "+ Laporan Penjualan Barang Bonus" (Inventory/
   Customer/Cabang/Lokasi Gudang/Periode dari-S/D/Close/Show Report/
   Show Report Pdf) + 1 contoh PDF "LAPORAN PENJUALAN BARANG BONUS"
   (No./No. Faktur/Tgl. Faktur/Customer/Kode Barang/Nama Barang/Qty +
   Grand Total) yang dikirim user. Mengikuti precedent FA-08 di atas:
   data customer/barang pada PDF contoh (rumah sakit "MITRA KELUARGA
   TEGAL", barang infus) adalah data instalasi MASERP lain — TIDAK
   direplikasi, diganti data yang genuinely diambil LIVE dari
   DATA.invoices (field baru `bonus:true` per baris item, lihat catatan
   besar di atas DATA.invoices di js/data.js — 2 baris Invoice BARU yang
   di-CHAIN ke 2 Promotion nyata yang sudah ada sejak 2026-08-11).
   Beda dari filter FA-08 (Cabang/Area/Rayon/Customer semua lewat picker
   modal), field "Lokasi Gudang" di sini SENGAJA dibuat dropdown
   `<select>` polos (bukan picker+tombol kaca pembesar) meniru persis
   screenshot acuan yang tidak menampilkan tombol pencarian di field
   itu (beda dari 3 field lain yang jelas ada tombolnya). */
function tplRcBonusUniqueGudang(){
  const seen = {}; const out = [];
  (DATA.invoices || []).forEach(inv => { if(inv.gudang && !seen[inv.gudang]){ seen[inv.gudang] = true; out.push(inv.gudang); } });
  return out;
}

function tplRcBonusFilterModal(){
  const todayPeriodeAwal = '01/08/2026', todayPeriodeAkhir = '31/08/2026';
  const gudangList = tplRcBonusUniqueGudang();
  return `
    <div class="modal-box" style="max-width:480px;">
      <div class="modal-header"><span>+ Laporan Penjualan Barang Bonus</span><span class="close" id="rcBonusFilterClose">&times;</span></div>
      <div class="modal-body">
        ${tplRcFieldWithBtn('Inventory', 'rcbInventory', 'Cari barang')}
        ${tplRcFieldWithBtn('Customer', 'rcbCustomer', 'Pilih Customer')}
        ${tplRcFieldWithBtn('Cabang', 'rcbCabang', 'Pilih Cabang')}
        <div class="form-group">
          <label>Lokasi Gudang</label>
          <select id="rcbGudang">
            <option value="">Pilih Gudang...</option>
            ${gudangList.map(g => `<option value="${g}">${g}</option>`).join('')}
          </select>
        </div>
        <div class="form-group">
          <label>Periode</label>
          <div class="field-pair">
            <input type="text" id="rcbPeriodeAwal" value="${todayPeriodeAwal}">
            <span style="align-self:center;color:var(--text-light);">S/D</span>
            <input type="text" id="rcbPeriodeAkhir" value="${todayPeriodeAkhir}">
          </div>
        </div>
      </div>
      <div class="modal-footer">
        <button class="btn-secondary" id="rcBonusFilterCancel">Close</button>
        <button class="btn-primary" id="rcBonusShowReport">Show Report</button>
        <button class="btn-primary" id="rcBonusShowReportPdf">Show Report Pdf</button>
      </div>
    </div>`;
}

/* Dokumen cetak — layout meniru contoh PDF "LAPORAN PENJUALAN BARANG
   BONUS" (header nama perusahaan + "1/1" pojok kanan, baris Telp/Fax,
   judul digarisbawahi, tabel 7 kolom, baris Grand Total, tanda tangan).
   Nama perusahaan/telp DISALIN LOKAL dari pola INV_PRINT_COMPANY
   (invoice.template.js, modul lazy-load lain yang lazy-load-nya tidak
   terjamin urutan muatnya) sebagai fungsi (bukan const) mengikuti
   aturan top-level file ini. Fax tidak diisi (kosong) — screenshot
   acuan sendiri menunjukkan "Telp : / Fax :" kosong, DBM juga belum
   punya nomor fax terdokumentasi di modul manapun di mockup ini. */
/* 2026-08-26 (lanjutan) — filter modal "+ Print Laporan Produk Bonus"
   (Laporan Transfer Produk Bonus, Persediaan Barang) sesuai screenshot
   acuan: Gudang/Inventory/No. Bukti (3 picker via tplRcFieldWithBtn,
   sama pola bonus penjualan di atas) + radio Sortir Bulan/Tanggal +
   dropdown Pilih Bulan (default "Agustus 2026", value YYYYMM dipakai
   rcTpbBuildRows() di reports.js). Lihat komentar besar di reports.js
   (dekat rcTpbBuildRows) untuk penjelasan lengkap keputusan data. */
function tplRcTpbFilterModal(){
  const months = rcTpbMonthList();
  const defaultYm = '202608';
  return `
    <div class="modal-box" style="max-width:480px;">
      <div class="modal-header"><span>+ Print Laporan Produk Bonus</span><span class="close" id="rcTpbFilterClose">&times;</span></div>
      <div class="modal-body">
        ${tplRcFieldWithBtn('Gudang', 'rctGudang', 'Cari gudang')}
        ${tplRcFieldWithBtn('Inventory', 'rctInventory', 'Cari barang')}
        ${tplRcFieldWithBtn('No. Bukti', 'rctNoBukti', 'Pilih No. Bukti')}
        <div class="form-group">
          <label>Sortir Bulan / Tanggal</label>
          <div class="radio-inline">
            <label><input type="radio" name="rctSortir" value="month" checked> Month</label>
            <label><input type="radio" name="rctSortir" value="date"> Date</label>
          </div>
        </div>
        <div class="form-group">
          <label>Pilih Bulan</label>
          <select id="rctBulan">
            ${months.map((m,i) => {
              const ym = '2026' + String(i+1).padStart(2,'0');
              return `<option value="${ym}"${ym===defaultYm?' selected':''}>${m} 2026</option>`;
            }).join('')}
          </select>
        </div>
      </div>
      <div class="modal-footer">
        <button class="btn-secondary" id="rcTpbFilterCancel">Close</button>
        <button class="btn-primary" id="rcTpbShowReport">Show Report</button>
        <button class="btn-primary" id="rcTpbShowReportPdf">Show Report Pdf</button>
      </div>
    </div>`;
}

/* Dokumen cetak — layout meniru contoh PDF "Laporan Barang Bonus"
   PERSIS (termasuk TIDAK adanya header nama perusahaan/logo — beda
   dari tplRcBonusReportDoc() di atas yang punya letterhead SDL/DBM;
   PDF acuan laporan ini murni "Tgl : dd/mm/yyyy" pojok kiri atas +
   judul ditengah + baris Periode, tanpa letterhead, jadi diikuti apa
   adanya, bukan kelalaian). 11 kolom sesuai PDF: No./No Bukti/Tanggal/
   Kode Barang Sumber/Nama Barang Sumber/Kode Barang Target/Nama Barang
   Target/Qty/Satuan/Harga Pokok/Jumlah. */
function tplRcTpbReportDoc(periodeAwal, periodeAkhir, rows, grandTotal, printedAt){
  const bodyRows = !rows.length
    ? `<tr><td colspan="11" style="text-align:center;color:#777;padding:14px;">Tidak ada transaksi Transfer Produk Bonus untuk filter ini.</td></tr>`
    : rows.map((r,i) => `
      <tr>
        <td style="text-align:center;">${i+1}</td>
        <td>${r.noBukti}</td>
        <td>${r.tanggal}</td>
        <td>${r.kodeSumber}</td>
        <td>${r.namaSumber}</td>
        <td>${r.kodeTarget}</td>
        <td>${r.namaTarget}</td>
        <td style="text-align:center;">${num(r.qty)}</td>
        <td>${r.satuan}</td>
        <td style="text-align:right;">${rp(r.hargaPokok)}</td>
        <td style="text-align:right;">${rp(r.jumlah)}</td>
      </tr>`).join('');
  return `<!DOCTYPE html>
<html><head><meta charset="utf-8"><title>Laporan Barang Bonus</title>
<style>
  body{font-family:Arial, Helvetica, sans-serif;font-size:11px;color:#111;margin:20px;}
  .rc-doc-toolbar{margin-bottom:10px;}
  .rc-doc-toolbar button{padding:7px 16px;border:none;border-radius:5px;font-size:12.5px;font-weight:600;cursor:pointer;margin-right:8px;}
  .rc-doc-toolbar .btn-print{background:#4472c4;color:#fff;}
  .rc-doc-toolbar .btn-close{background:#eef1f7;color:#333;}
  .rc-doc-tgl{font-size:10.5px;color:#333;}
  h1{font-size:13.5px;text-align:center;margin:2px 0 2px;}
  .rc-doc-periode{font-size:10.5px;text-align:center;margin-bottom:10px;}
  table{width:100%;border-collapse:collapse;}
  th,td{border:1px solid #999;padding:3px 6px;font-size:10.5px;}
  thead th{background:#f0f0f0;text-align:center;font-weight:700;}
  tfoot td{font-weight:700;background:#f7f7f7;}
  @media print{ .rc-doc-toolbar{display:none;} body{margin:0;} }
</style></head>
<body>
  <div class="rc-doc-toolbar">
    <button class="btn-print" onclick="window.print()">Cetak</button>
    <button class="btn-close" onclick="window.close()">Tutup</button>
  </div>
  <div class="rc-doc-tgl">Tgl : ${printedAt}</div>
  <h1>Laporan Barang Bonus</h1>
  <div class="rc-doc-periode">Periode: ${periodeAwal || ''} s/d ${periodeAkhir || ''}</div>
  <table>
    <thead><tr>
      <th style="width:28px;">No.</th>
      <th>No Bukti</th>
      <th style="width:66px;">Tanggal</th>
      <th>Kode Barang Sumber</th>
      <th>Nama Barang Sumber</th>
      <th>Kode Barang Target</th>
      <th>Nama Barang Target</th>
      <th style="width:48px;">Qty</th>
      <th style="width:52px;">Satuan</th>
      <th style="width:76px;">Harga Pokok</th>
      <th style="width:86px;">Jumlah</th>
    </tr></thead>
    <tbody>${bodyRows}</tbody>
    <tfoot><tr>
      <td colspan="10" style="text-align:right;">Grand Total :</td>
      <td style="text-align:right;">${rp(grandTotal)}</td>
    </tr></tfoot>
  </table>
</body></html>`;
}

function tplRcBonusCompany(){
  return { nama: 'PT Distriversa Buanamas', telp: '(021) 555-8899', fax: '' };
}

function tplRcBonusReportDoc(periodeAwal, periodeAkhir, rows, grandTotalQty, printedBy, printedAt){
  const co = tplRcBonusCompany();
  const bodyRows = !rows.length
    ? `<tr><td colspan="7" style="text-align:center;color:#777;padding:14px;">Tidak ada transaksi barang bonus untuk filter ini.</td></tr>`
    : rows.map((r,i) => `
      <tr>
        <td style="text-align:center;">${i+1}</td>
        <td>${r.noFaktur}</td>
        <td>${r.tglFaktur}</td>
        <td>${r.customerNama}</td>
        <td>${r.kodeBarang}</td>
        <td>${r.namaBarang}</td>
        <td style="text-align:center;">${num(r.qty)}</td>
      </tr>`).join('');
  return `<!DOCTYPE html>
<html><head><meta charset="utf-8"><title>Laporan Penjualan Barang Bonus</title>
<style>
  body{font-family:Arial, Helvetica, sans-serif;font-size:11px;color:#111;margin:20px;}
  .rc-doc-toolbar{margin-bottom:10px;}
  .rc-doc-toolbar button{padding:7px 16px;border:none;border-radius:5px;font-size:12.5px;font-weight:600;cursor:pointer;margin-right:8px;}
  .rc-doc-toolbar .btn-print{background:#4472c4;color:#fff;}
  .rc-doc-toolbar .btn-close{background:#eef1f7;color:#333;}
  .rc-doc-head{display:flex;justify-content:space-between;align-items:baseline;}
  .rc-doc-company{font-weight:700;font-size:13.5px;}
  .rc-doc-page{font-size:11px;color:#333;}
  .rc-doc-contact{font-size:10.5px;color:#333;margin:8px 0 10px;}
  h1{font-size:13.5px;text-align:center;margin:4px 0 12px;text-decoration:underline;}
  .rc-doc-periode{font-size:10.5px;margin-bottom:6px;}
  table{width:100%;border-collapse:collapse;}
  th,td{border:1px solid #999;padding:3px 6px;font-size:10.5px;}
  thead th{background:#f0f0f0;text-align:center;font-weight:700;}
  tfoot td{font-weight:700;background:#f7f7f7;}
  .rc-doc-sign{margin-top:26px;font-size:11px;}
  @media print{ .rc-doc-toolbar{display:none;} body{margin:0;} }
</style></head>
<body>
  <div class="rc-doc-toolbar">
    <button class="btn-print" onclick="window.print()">Cetak</button>
    <button class="btn-close" onclick="window.close()">Tutup</button>
  </div>
  <div class="rc-doc-head">
    <div class="rc-doc-company">${co.nama}</div>
    <div class="rc-doc-page">1/1</div>
  </div>
  <div class="rc-doc-contact">Telp : ${co.telp} &nbsp;/&nbsp; Fax : ${co.fax || '-'}</div>
  <h1>LAPORAN PENJUALAN BARANG BONUS</h1>
  <div class="rc-doc-periode">Periode: ${periodeAwal} s/d ${periodeAkhir}</div>
  <table>
    <thead><tr>
      <th style="width:32px;">No.</th>
      <th>No. Faktur</th>
      <th style="width:76px;">Tgl. Faktur</th>
      <th>Customer</th>
      <th style="width:90px;">Kode Barang</th>
      <th>Nama Barang</th>
      <th style="width:56px;">Qty</th>
    </tr></thead>
    <tbody>${bodyRows}</tbody>
    <tfoot><tr>
      <td colspan="6" style="text-align:right;">Grand Total :</td>
      <td style="text-align:center;">${num(grandTotalQty)}</td>
    </tr></tfoot>
  </table>
  <div class="rc-doc-sign">${printedBy}<br>${printedAt}</div>
</body></html>`;
}

/* =========================================================
   2026-08-28 — filter modal "+ Laporan Umur Piutang Customer"
   (FA-10 Lap Umur Piutang, Account Receivable) sesuai screenshot
   acuan: Pilih Mata Uang & Cabang sebagai <select> polos (screenshot
   tidak menampilkan tombol kaca pembesar di 2 field itu — precedent
   "Lokasi Gudang" filter Bonus), Customer Group/Customer/Salesman/
   Area/Rayon sebagai picker tplRcFieldWithBtn, Interval angka
   (default 30, FUNGSIONAL: lebar bucket umur), Periode Transaksi
   default 01/03/2025 S/D 31/08/2026 (persis screenshot; rentang
   panjang supaya faktur historis DATA.arFakturHistoris ikut),
   Batas Tanggal default hari ini, keterangan rumus, dan checkbox
   Show Total Salesman.
   MODIFIKASI DBM (permintaan user 2026-08-28): blok "View Report"
   BARU — radio pilihan dasar perhitungan umur "Tanggal Faktur"
   (default, = perilaku contoh PDF) / "Tanggal Jatuh Tempo".
   Keterangan rumus (id rcuFormulaNote) di-update live oleh
   openRcUmurFilter() saat radio dipindah. Logic-nya di
   reports.js (openRcUmurFilter dst.). */
function tplRcUmurMataUangList(){
  return rcUniqueVals((DATA.customers || []).map(c => c.mataUang || 'IDR'));
}

function tplRcUmurCabangList(){
  const all = (DATA.customers || []).map(c => c.cabang)
    .concat((DATA.invoices || []).map(i => i.cabang))
    .concat((DATA.arFakturHistoris || []).map(h => h.cabang));
  return rcUniqueVals(all);
}

function tplRcUmurFormulaNote(basis){
  if(basis === 'jthTempo'){
    return `Umur Piutang = (Batas Tanggal - Tanggal Jatuh Tempo)<br>Telat = (Batas Tanggal - Tanggal Jatuh Tempo)<br><span style="color:var(--text-light);">Faktur yang belum jatuh tempo masuk kolom "Belum Jth Tempo".</span>`;
  }
  return `Umur Piutang = (Batas Tanggal - Tanggal Transaksi)<br>Telat = (Batas Tanggal - Tanggal Jatuh Tempo)`;
}

function tplRcUmurFilterModal(){
  const mataUangList = tplRcUmurMataUangList();
  const cabangList = tplRcUmurCabangList();
  return `
    <div class="modal-box" style="max-width:520px;">
      <div class="modal-header"><span>+ Laporan Umur Piutang Customer</span><span class="close" id="rcUmurFilterClose">&times;</span></div>
      <div class="modal-body">
        <div class="form-group">
          <label>Pilih Mata Uang</label>
          <select id="rcuMataUang">
            <option value="">Pilih Mata Uang</option>
            ${mataUangList.map(m => `<option value="${m}">${m}</option>`).join('')}
          </select>
        </div>
        ${tplRcFieldWithBtn('Customer Group', 'rcuGroup', 'Customer Group')}
        ${tplRcFieldWithBtn('Customer', 'rcuCustomer', 'Pilih Customer')}
        <div class="form-group">
          <label>Interval</label>
          <input type="number" id="rcuInterval" value="30" min="1" max="999">
        </div>
        ${tplRcFieldWithBtn('Salesman', 'rcuSalesman', 'Cari Salesman')}
        <div class="form-group">
          <label>Cabang</label>
          <select id="rcuCabang">
            <option value="">Pilih Cabang...</option>
            ${cabangList.map(c => `<option value="${c}">${c}</option>`).join('')}
          </select>
        </div>
        ${tplRcFieldWithBtn('Area', 'rcuArea', 'Wilayah')}
        ${tplRcFieldWithBtn('Rayon', 'rcuRayon', 'Pilih Rayon')}
        <div class="form-group">
          <label>Periode Transaksi</label>
          <div class="field-pair">
            <input type="text" id="rcuPeriodeAwal" value="01/03/2025">
            <span style="align-self:center;color:var(--text-light);">S/D</span>
            <input type="text" id="rcuPeriodeAkhir" value="31/08/2026">
          </div>
        </div>
        <div class="form-group">
          <label>Batas Tanggal</label>
          <input type="text" id="rcuBatasTanggal" value="${rcTodayLabel()}">
        </div>
        <div class="form-group">
          <label>View Report &mdash; Umur Berdasarkan</label>
          <div class="radio-inline">
            <label><input type="radio" name="rcuBasis" value="jthTempo"> Tanggal Jatuh Tempo</label>
            <label><input type="radio" name="rcuBasis" value="faktur" checked> Tanggal Faktur</label>
          </div>
        </div>
        <div class="form-group">
          <div id="rcuFormulaNote" style="font-size:12.5px;line-height:1.6;">${tplRcUmurFormulaNote('faktur')}</div>
        </div>
        <div class="form-group">
          <label>Show Total Salesman</label>
          <input type="checkbox" id="rcuShowTotalSalesman" style="width:auto;">
        </div>
      </div>
      <div class="modal-footer">
        <button class="btn-secondary" id="rcUmurFilterCancel">Close</button>
        <button class="btn-primary" id="rcuShowReport">Show Report</button>
        <button class="btn-primary" id="rcuShowReportPdf">Show Report Pdf</button>
      </div>
    </div>`;
}

/* Dokumen cetak — layout meniru contoh PDF "Laporan Perincian Umur
   Piutang" (Tgl Print kiri atas + halaman kanan atas, nama perusahaan
   + judul + "Per tanggal :" + "Tgl Umur Piutang:" di tengah, tabel
   13 kolom dgn grup Currency > Departemen > Customer + Subtotal
   Customer/Departemen/Currency). Ditambah 1 baris keterangan "Umur
   Piutang Berdasarkan : ..." (modifikasi DBM) dan — khusus mode
   Tanggal Jatuh Tempo — kolom bucket ekstra "Belum Jth Tempo" di
   depan "1 - N Hari". Departemen ditulis tetap "00" (data mockup DBM
   tidak punya dimensi departemen — simplifikasi terdokumentasi). */
function tplRcUmurReportDoc(filter, basis, interval, rows, showTotalSalesman, printedBy, printedAt){
  const fmt2 = n => Number(n || 0).toLocaleString('id-ID', {minimumFractionDigits:2, maximumFractionDigits:2});
  const buckets = rcuBuckets(interval);
  const hasBelum = basis === 'jthTempo';
  const nCols = 7 + (hasBelum ? 1 : 0) + buckets.length + 1;
  const basisLabel = hasBelum ? 'Tanggal Jatuh Tempo' : 'Tanggal Faktur';

  function rowBuckets(r){
    const vals = new Array(buckets.length).fill(0);
    let belum = 0;
    if(r.jlhTransaksi > 0){
      const age = hasBelum ? r.telat : r.umurFaktur;
      if(hasBelum && age <= 0){ belum = r.jlhTransaksi; }
      else { vals[rcuBucketIndex(age, buckets)] = r.jlhTransaksi; }
    }
    return {belum: belum, vals: vals};
  }

  function sumInto(acc, r){
    const b = rowBuckets(r);
    acc.jlh += r.jlhTransaksi || 0;
    acc.belum += b.belum;
    b.vals.forEach((v, i) => { acc.vals[i] += v; });
    acc.ssp += r.ssp || 0;
    return acc;
  }
  function newAcc(){ return {jlh:0, belum:0, vals:new Array(buckets.length).fill(0), ssp:0}; }

  function tdsBucket(belum, vals, ssp){
    return (hasBelum ? `<td style="text-align:right;">${fmt2(belum)}</td>` : '')
      + vals.map(v => `<td style="text-align:right;">${fmt2(v)}</td>`).join('')
      + `<td style="text-align:right;">${fmt2(ssp)}</td>`;
  }
  function subtotalRow(label, acc){
    return `
      <tr class="rcu-subtotal">
        <td colspan="4" style="text-align:right;font-weight:700;">${label}</td>
        <td style="text-align:right;font-weight:700;">${fmt2(acc.jlh)}</td>
        <td colspan="2"></td>
        ${tdsBucket(acc.belum, acc.vals, acc.ssp)}
      </tr>`;
  }

  /* Grup per customer (rows sudah diurutkan rcuBuildRows()). */
  let body = '';
  const currencyAcc = newAcc();
  const salesmanTotals = {};
  if(!rows.length){
    body = `<tr><td colspan="${nCols}" style="text-align:center;color:#777;padding:14px;">Tidak ada piutang outstanding untuk filter ini.</td></tr>`;
  } else {
    let i = 0;
    while(i < rows.length){
      const kode = rows[i].customerKode;
      const nama = rows[i].customerNama;
      const custAcc = newAcc();
      body += `<tr class="rcu-cust-row"><td colspan="${nCols}" style="font-weight:700;">${kode} - ${String(nama).toUpperCase()}</td></tr>`;
      let no = 1;
      while(i < rows.length && rows[i].customerKode === kode){
        const r = rows[i];
        sumInto(custAcc, r);
        sumInto(currencyAcc, r);
        if(r.salesman){ salesmanTotals[r.salesman] = (salesmanTotals[r.salesman] || 0) + (r.jlhTransaksi || 0); }
        const b = rowBuckets(r);
        const lewat = r.telat > 0 ? (r.telat + ' hari') : 'Blm';
        const umur = hasBelum ? (r.telat > 0 ? r.telat : 'Blm') : r.umurFaktur;
        body += `
          <tr>
            <td style="text-align:center;">${no++}</td>
            <td>${r.noFaktur}</td>
            <td>${r.tglTrn}</td>
            <td>${r.tglJtmp}</td>
            <td style="text-align:right;">${fmt2(r.jlhTransaksi)}</td>
            <td style="text-align:center;">${lewat}</td>
            <td style="text-align:center;">${umur}</td>
            ${tdsBucket(b.belum, b.vals, r.ssp)}
          </tr>`;
        i++;
      }
      body += subtotalRow(`Subtotal Customer ${kode} :`, custAcc);
    }
    body += subtotalRow('Subtotal Departemen 00 :', currencyAcc);
    body += subtotalRow('Subtotal Currency IDR :', currencyAcc);
  }

  const salesmanBlock = showTotalSalesman ? `
    <h2 style="font-size:12px;margin:18px 0 6px;">Total per Salesman</h2>
    <table style="width:auto;min-width:320px;">
      <thead><tr><th>Salesman</th><th style="width:130px;">Total Piutang</th></tr></thead>
      <tbody>
        ${Object.keys(salesmanTotals).sort().map(s => `
          <tr><td>${s}</td><td style="text-align:right;">${fmt2(salesmanTotals[s])}</td></tr>`).join('') || `<tr><td colspan="2" style="color:#777;">Tidak ada data.</td></tr>`}
      </tbody>
      <tfoot><tr><td style="text-align:right;font-weight:700;">Grand Total :</td><td style="text-align:right;font-weight:700;">${fmt2(Object.keys(salesmanTotals).reduce((t,s)=>t+salesmanTotals[s],0))}</td></tr></tfoot>
    </table>` : '';

  return `<!DOCTYPE html>
<html><head><meta charset="utf-8"><title>Laporan Perincian Umur Piutang</title>
<style>
  body{font-family:Arial, Helvetica, sans-serif;font-size:11px;color:#111;margin:20px;}
  .rc-doc-toolbar{margin-bottom:10px;}
  .rc-doc-toolbar button{padding:7px 16px;border:none;border-radius:5px;font-size:12.5px;font-weight:600;cursor:pointer;margin-right:8px;}
  .rc-doc-toolbar .btn-print{background:#4472c4;color:#fff;}
  .rc-doc-toolbar .btn-close{background:#eef1f7;color:#333;}
  .rc-doc-head{display:flex;justify-content:space-between;font-size:10.5px;color:#333;}
  .rc-doc-company{font-weight:700;font-size:13.5px;text-align:center;margin-top:2px;}
  h1{font-size:14px;text-align:center;margin:2px 0;}
  .sub{font-size:11px;text-align:center;margin:0;font-weight:700;}
  .sub-basis{font-size:10.5px;text-align:center;margin:2px 0 10px;}
  table{width:100%;border-collapse:collapse;}
  th,td{border-bottom:1px solid #bbb;padding:3px 4px;font-size:10px;}
  thead th{border-top:2px solid #333;border-bottom:2px solid #333;background:#fff;text-align:center;font-weight:700;}
  .rcu-cust-row td{border-bottom:none;padding-top:7px;}
  .rcu-subtotal td{border-top:1px solid #333;border-bottom:2px solid #333;background:#fafafa;}
  @media print{ .rc-doc-toolbar{display:none;} body{margin:0;} }
</style></head>
<body>
  <div class="rc-doc-toolbar">
    <button class="btn-print" onclick="window.print()">Cetak</button>
    <button class="btn-close" onclick="window.close()">Tutup</button>
  </div>
  <div class="rc-doc-head"><span>Tgl Print: ${printedAt}</span><span>1/1</span></div>
  <div class="rc-doc-company">PT Distriversa Buanamas</div>
  <h1>Laporan Perincian Umur Piutang</h1>
  <div class="sub">Per tanggal : ${filter.periodeAkhir || printedAt}</div>
  <div class="sub">Tgl Umur Piutang: ${filter.batasTanggal}</div>
  <div class="sub-basis">Umur Piutang Berdasarkan : <b>${basisLabel}</b></div>
  <table>
    <thead><tr>
      <th style="width:26px;">No.</th>
      <th style="width:130px;">No. Faktur</th>
      <th style="width:64px;">Tgl. Trn</th>
      <th style="width:64px;">Tgl. Jtmp</th>
      <th style="width:82px;">Jlh. Transaksi</th>
      <th style="width:56px;">Lewat Jth<br>Tmp</th>
      <th style="width:40px;">Umur</th>
      ${hasBelum ? '<th style="width:78px;">Belum Jth<br>Tempo</th>' : ''}
      ${buckets.map(b => `<th style="width:78px;">${b.label}</th>`).join('')}
      <th style="width:72px;">SSP</th>
    </tr></thead>
    <tbody>
      <tr><td colspan="${nCols}" style="font-weight:700;border-bottom:none;">Currency : IDR</td></tr>
      <tr><td colspan="${nCols}" style="font-weight:700;border-bottom:none;">Departemen : 00</td></tr>
      ${body}
    </tbody>
  </table>
  ${salesmanBlock}
  <div style="margin-top:26px;font-size:11px;">${printedBy}<br>${printedAt}</div>
</body></html>`;
}
