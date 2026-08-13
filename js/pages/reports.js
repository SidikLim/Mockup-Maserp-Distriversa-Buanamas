/* =========================================================
   LOGIC (JS saja) — Daftar Laporan
   Dimuat otomatis (lazy-load) oleh core.js saat menu ini
   pertama kali diklik — lihat PAGE_MODULES di js/core.js.
   Markup HTML-nya ada di file sebelah: reports.template.js
   (fungsi tplReports()).
========================================================= */
function renderReports(){
  content.innerHTML=tplReports();
}
