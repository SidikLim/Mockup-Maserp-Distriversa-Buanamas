/* =========================================================
   LOGIC (JS saja) — Dashboard Utama
   Dimuat otomatis (lazy-load) oleh core.js saat menu ini
   pertama kali diklik — lihat PAGE_MODULES di js/core.js.
   Markup HTML-nya ada di file sebelah: dashboard-main.template.js
   (fungsi tplMainDashboard()).
========================================================= */
function renderMainDashboard(){
  content.innerHTML=tplMainDashboard();
}
