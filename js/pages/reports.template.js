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
