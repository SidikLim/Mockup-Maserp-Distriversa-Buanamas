/* =========================================================
   TEMPLATE (HTML saja) — Daftar Laporan
   Logic-nya ada di file sebelah: reports.js
========================================================= */
function tplReports(){
  return `
    <div class="breadcrumb">Home / <b>Daftar Laporan</b></div>
    <div class="page-head"><h2>Daftar Laporan</h2></div>
    <div class="card"><div class="card-body">
      <div class="report-list">
        ${DATA.reports.map(r=>`<div class="report-item"><div class="ric">${icon('chart',19)}</div><div class="rtitle">${r}</div></div>`).join('')}
      </div>
    </div></div>`;
}
