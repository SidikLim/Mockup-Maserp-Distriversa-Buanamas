/* =========================================================
   LOGIC (JS saja) — Dashboard Supplier & Pembelian
   Dimuat otomatis (lazy-load) oleh core.js saat menu ini
   pertama kali diklik — lihat PAGE_MODULES di js/core.js.
   Markup HTML-nya ada di file sebelah: dashboard-supplier.template.js
   (fungsi tplSupplierDashboard()).
========================================================= */
function renderSupplierDashboard(){
  content.innerHTML=tplSupplierDashboard();

  content.querySelectorAll('[data-nav]').forEach(q=>{
    q.onclick=()=>navigate(q.dataset.nav, q.dataset.title || q.querySelector('.flow-label')?.textContent.trim());
  });
}
