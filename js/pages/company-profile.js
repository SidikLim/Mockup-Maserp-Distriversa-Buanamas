/* =========================================================
   LOGIC (JS saja) — Profil Perusahaan
   Dimuat otomatis (lazy-load) oleh core.js saat menu ini
   pertama kali diklik — lihat PAGE_MODULES di js/core.js.
   Markup HTML-nya ada di file sebelah: company-profile.template.js
   (fungsi tplCompanyProfile()).
========================================================= */
function renderCompanyProfile(){
  content.innerHTML=tplCompanyProfile();
}
