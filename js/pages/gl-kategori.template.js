/* =========================================================
   TEMPLATE (HTML saja) — GL Kategori (General Ledger > Master & Setting)
   Semua fungsi di file ini HANYA menyusun & mengembalikan
   markup HTML (string), TIDAK ada logic/DOM-binding/data
   mutation di sini. Logic-nya ada di file sebelah:
   gl-kategori.js

   Sesuai contoh screenshot "Daftar General Ledger Kategori"
   MASERP yang dikirim user: daftar kategori GL BERSIFAT TETAP
   (dipakai sistem untuk menyusun Neraca & Laba Rugi otomatis)
   — hanya bisa di-Ubah (rentang nomor & nama), TIDAK ada
   Tambah/Hapus baris, dan tabelnya tanpa toolbar pencarian/
   pager (persis seperti contoh gambar).
========================================================= */
function tplGlKategoriPage(){
  return `
    <div class="breadcrumb">Home / General Ledger / <b>GL Kategori</b></div>
    <div class="card">
      <div class="card-header dark-header">
        <h3>${icon('book',15)} Daftar General Ledger Kategori</h3>
        <button class="btn-secondary" id="btnGlKategoriHelp">? Help</button>
      </div>
      <div class="table-wrap"><table>
        <thead><tr>
          <th>Kode Kategori</th>
          <th>Nama Kategori</th>
          <th>No. Awal</th>
          <th>Nama GL</th>
          <th>No. Akhir</th>
          <th>Nama GL</th>
          <th>Ubah</th>
        </tr></thead>
        <tbody id="glKategoriTbody"></tbody>
      </table></div>
    </div>`;
}

function tplGlKategoriRows(rows){
  return rows.map((r,i)=>`
    <tr>
      <td><b style="color:var(--blue)">${r.kode}</b></td>
      <td style="color:#a0522d">${r.nama}</td>
      <td>${r.noAwal}</td>
      <td style="color:var(--blue)">${r.glAwal}</td>
      <td>${r.noAkhir}</td>
      <td style="color:var(--blue)">${r.glAkhir}</td>
      <td><button class="icon-btn edit" data-edit="${i}" title="Ubah">${icon('edit',15)}</button></td>
    </tr>`).join('');
}

function tplGlKategoriModal(row){
  return `
    <div class="modal-box">
      <div class="modal-header"><span>Ubah GL Kategori</span><span class="close" id="modalClose">&times;</span></div>
      <div class="modal-body">
        <div class="form-group">
          <label>Kode Kategori</label>
          <input type="text" id="fKode" value="${row.kode}" disabled>
        </div>
        <div class="form-group">
          <label>Nama Kategori</label>
          <input type="text" id="fNama" value="${row.nama}">
        </div>
        <div class="form-group">
          <label>No. Awal</label>
          <input type="text" id="fNoAwal" value="${row.noAwal}">
        </div>
        <div class="form-group">
          <label>Nama GL (No. Awal)</label>
          <input type="text" id="fGlAwal" value="${row.glAwal}">
        </div>
        <div class="form-group">
          <label>No. Akhir</label>
          <input type="text" id="fNoAkhir" value="${row.noAkhir}">
        </div>
        <div class="form-group">
          <label>Nama GL (No. Akhir)</label>
          <input type="text" id="fGlAkhir" value="${row.glAkhir}">
        </div>
      </div>
      <div class="modal-footer">
        <button class="btn-secondary" id="modalCancel">Batal</button>
        <button class="btn-primary" id="modalSave">Simpan</button>
      </div>
    </div>`;
}

function tplGlKategoriHelpModal(){
  return `
    <div class="modal-box">
      <div class="modal-header"><span>Bantuan — GL Kategori</span><span class="close" id="modalClose">&times;</span></div>
      <div class="modal-body">
        <p>Kategori GL mengelompokkan rentang nomor akun (<b>No. Awal</b> s/d <b>No. Akhir</b>) ke dalam kategori laporan keuangan (Aktiva, Hutang, Modal, Penjualan, dst). Kategori ini dipakai sistem untuk menyusun Neraca &amp; Laba Rugi secara otomatis.</p>
        <p>Klik ikon <b>Ubah</b> pada baris kategori untuk mengubah nama kategori atau rentang nomor GL-nya. Kode Kategori sendiri sudah tetap (fixed) dan tidak bisa diubah.</p>
      </div>
      <div class="modal-footer">
        <button class="btn-primary" id="modalOk">Mengerti</button>
      </div>
    </div>`;
}
