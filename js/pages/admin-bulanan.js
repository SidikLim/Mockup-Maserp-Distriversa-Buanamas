/* =========================================================
   LOGIC (JS saja) — Administrasi Bulanan (menu Pengaturan > Administrasi
   Bulanan, page 'adminBulanan'). Dimuat otomatis (lazy-load) oleh core.js
   saat menu ini pertama kali diklik — lihat PAGE_MODULES di js/core.js.
   Markup HTML-nya ada di file sebelah: admin-bulanan.template.js
   (tplAdminBulananPage/tplAbRows).

   TIDAK ADA CRUD/data-mutation di modul ini — tombol "Process" per baris
   HANYA menampilkan `confirm()` "Apakah Anda yakin ingin melakukan Proses
   [Nama]?" lalu BERHENTI, tanpa reaksi apa pun baik user klik OK maupun
   Cancel (sesuai instruksi eksplisit user: proses generate jurnal/kunci
   transaksi/dst. butuh logic backend sungguhan di luar cakupan mockup).
========================================================= */

function renderAdminBulananPage(){
  content.innerHTML = tplAdminBulananPage();
  document.getElementById('btnAbTutorial').onclick = () => alert('Tutorial video akan tersedia di sini. (Contoh tampilan mockup)');
  content.querySelectorAll('[data-ab-process]').forEach(btn => {
    btn.onclick = () => {
      const row = DATA.adminBulanan[+btn.dataset.abProcess];
      confirm(`Apakah Anda yakin ingin melakukan Proses ${row.nama}?`);
      // Sengaja tidak ada aksi lanjutan apa pun (baik OK maupun Cancel) —
      // lihat catatan besar di admin-bulanan.template.js.
    };
  });
}
