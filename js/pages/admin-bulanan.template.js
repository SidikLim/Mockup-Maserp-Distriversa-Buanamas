/* =========================================================
   TEMPLATE (HTML saja) — Administrasi Bulanan (menu Pengaturan >
   Administrasi Bulanan, page:'adminBulanan' — SEBELUMNYA submenu ini
   bahkan tidak ada di js/menu.js, lihat komentar besar di atas
   DATA.adminBulanan di js/data.js). Semua fungsi di file ini HANYA
   menyusun & mengembalikan markup HTML (string), TIDAK ada logic/DOM-
   binding/data mutation — logic-nya ada di file sebelah: admin-bulanan.js.

   Sesuai screenshot MASERP yang dikirim user 2026-08-18: halaman UTILITY
   sederhana (BUKAN CRUD — tidak ada +Tambah/Ubah/Hapus/pager/pencarian
   sama sekali). Header TERANG (pakai `.card-header` BIASA, BUKAN
   `.dark-header` seperti hampir semua modul lain di app ini — beda gaya
   khusus utk halaman "Pengaturan" jenis ini) dengan ikon+judul warna biru
   + tombol merah "Tutorial" di kanan. Tabel statis kolom No/Nama/
   Keterangan/(kosong, isinya tombol "Process" per baris).
========================================================= */

function tplAdminBulananPage(){
  return `
    <div class="breadcrumb">Home / <b>Administrasi Bulanan</b></div>
    <div class="card">
      <div class="card-header">
        <h3 style="color:var(--blue);">${icon('wrench',15)} Administrasi Bulanan</h3>
        <button class="btn-danger" id="btnAbTutorial">${icon('eye',14)} Tutorial</button>
      </div>
      <div class="table-wrap"><table style="table-layout:fixed;">
        <thead><tr>
          <th style="width:40px;">No</th>
          <th style="width:200px;">Nama</th>
          <th style="white-space:normal;">Keterangan</th>
          <th style="width:110px;"></th>
        </tr></thead>
        <tbody>${tplAbRows(DATA.adminBulanan)}</tbody>
      </table></div>
    </div>`;
}

function tplAbRows(rows){
  // Catatan: kolom Keterangan sengaja diberi `white-space:normal;word-break:break-word;`
  // (override dari default global `tbody td{white-space:nowrap}` di style.css) supaya
  // teks panjang ikut wrap ke baris berikutnya, bukan memaksa tabel melebar ke luar
  // .table-wrap (temuan dari review visual: tanpa override ini tabel jadi ~1518px vs
  // container ~965px). Kolom lain (No/Nama/tombol) tetap nowrap bawaan, cukup pendek.
  return rows.map((r,i)=>`
    <tr>
      <td>${i+1}</td>
      <td style="white-space:normal;">${r.nama}</td>
      <td style="white-space:normal;word-break:break-word;">${r.keterangan}</td>
      <td><button class="btn-primary" data-ab-process="${i}">Process</button></td>
    </tr>`).join('');
}
