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
