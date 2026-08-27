/* =========================================================
   TEMPLATE (HTML saja) — Satuan (Persediaan Barang > Master &
   Setting > Satuan, page:'satuan'). Semua fungsi di file ini
   HANYA menyusun & mengembalikan markup HTML (string), TIDAK
   ada logic/DOM-binding di sini. Logic-nya ada di file sebelah:
   satuan.js
   NB: closeModal() dipakai bersama, didefinisikan di core.js.

   Sebelumnya placeholder murni. Dibangun 2026-08-27 sesuai
   screenshot MASERP "Daftar Satuan" yang dikirim user (Total
   Record: 15, kolom Kode Satuan/Nama Satuan dengan ikon sort di
   kedua header, page-size 10 default + Pencarian Global, pager
   First/Previous/1/2/Next/Last, tombol "+Tambah"/Ubah/Hapus).
   CRUD sederhana pola Group Produk/Zat Kandungan Aktif (kode
   MANUAL — bukan auto-generate, karena kode aslinya singkatan
   bermakna seperti "BOX"/"BTL"/"PCS", bukan nomor urut — wajib
   unik, readonly di mode Ubah) + sort kolom & pager windowed
   SUNGGUHAN fungsional (pola sama Zat Kandungan Aktif/Group
   Produk/Kategori Reordering Sheet dkk).

   DATA: 10 baris PALING ATAS persis screenshot (AMP/BKS/BOX/
   BTL/KRT/M/MBX/PAC/PCH/PCS — satuan generik universal ERP,
   bukan data rahasia perusahaan demo lain, aman dipakai apa
   adanya, status sama seperti nama laporan Report Center/nama
   zat aktif Zat Kandungan Aktif), + 5 baris tambahan (DUS/KRG/
   KLG/LSN/RIM) supaya Total Record 15 sekaligus SENGAJA
   mencakup 5 nilai `satuan` yang SUDAH DIPAKAI di seluruh
   `DATA.items`/`satuanDetail` sejak awal mockup ini (Dus/
   Karung/Kaleng/Botol/Pcs) — lihat komentar lengkap di atas
   array `DATA.satuan` di js/data.js untuk penjelasan kenapa 2
   Nama Satuan (BTL/PCS) sedikit disesuaikan casing-nya dari
   screenshot demi konsistensi dengan data yang sudah ada.

   PENTING — konsumen lintas-modul: field ini dikonsumsi oleh
   Master Barang (Persediaan Barang > Master & Setting >
   Inventory, page:'items', file persediaan-barang.template.js/
   .js) — kolom "Satuan" pada tabel "Jenis Satuan dan Harga" di
   form Barang SEKARANG jadi dropdown ke-sini (`psbSatuanOptions()`
   di persediaan-barang.template.js), bukan input teks bebas
   lagi, lihat komentar di file itu.
========================================================= */

function tplSatPage(){
  return `
    <div class="breadcrumb">Home / <b>Satuan</b></div>
    <div class="card">
      <div class="card-header dark-header">
        <h3>${icon('box',15)} Daftar Satuan</h3>
        <button class="btn-primary" id="btnSatAdd">${icon('plus',14)} Tambah</button>
      </div>
      <div class="table-toolbar">
        <select id="satPageSize"><option selected>10</option><option>25</option><option>50</option></select>
        <input type="text" id="satSearch" placeholder="Pencarian Global">
      </div>
      <div class="table-wrap"><table>
        <thead><tr>
          <th>${tplSatSortHeader('Kode Satuan','kode')}</th>
          <th>${tplSatSortHeader('Nama Satuan','nama')}</th>
          <th style="width:70px;">Ubah</th>
          <th style="width:70px;">Hapus</th>
        </tr></thead>
        <tbody id="satTbody"></tbody>
      </table></div>
      <div class="table-footer"><div class="pager" id="satPager"></div><div id="satTotal"></div></div>
    </div>`;
}

function tplSatSortHeader(label, field){
  return `<span class="sat-sort-header" data-sat-sort="${field}" style="cursor:pointer;display:inline-flex;align-items:center;gap:4px;">${label}<span id="satSortIcon_${field}" style="color:var(--text-light);font-size:11px;">&#8693;</span></span>`;
}

function tplSatRows(rows, page, pageSize){
  if(!rows.length) return `<tr><td colspan="4" style="color:var(--text-light);">Tidak ada data Satuan</td></tr>`;
  const start = (page-1)*pageSize;
  return rows.slice(start, start+pageSize).map((r) => {
    const idx = DATA.satuan.indexOf(r);
    return `
    <tr>
      <td><a href="#" class="row-link" data-edit="${idx}" style="color:var(--blue);font-weight:600;">${r.kode}</a></td>
      <td>${r.nama || 'Non'}</td>
      <td><button class="icon-btn edit" data-edit="${idx}" title="Ubah">${icon('edit',15)}</button></td>
      <td><button class="icon-btn del" data-del="${idx}" title="Hapus">${icon('trash',15)}</button></td>
    </tr>`;
  }).join('');
}

function tplSatPager(page, totalPages){
  if(totalPages <= 1) return '';
  const windowSize = 7;
  let start = Math.max(1, page - Math.floor(windowSize/2));
  let end = Math.min(totalPages, start + windowSize - 1);
  start = Math.max(1, end - windowSize + 1);
  let nums = '';
  for(let p = start; p <= end; p++){
    nums += `<button class="${p===page?'active':''}" data-satpage="${p}">${p}</button>`;
  }
  return `
    <button data-satpage="1" ${page<=1?'disabled':''}>First</button>
    <button data-satpage="${Math.max(1,page-1)}" ${page<=1?'disabled':''}>Previous</button>
    ${nums}
    <button data-satpage="${Math.min(totalPages,page+1)}" ${page>=totalPages?'disabled':''}>Next</button>
    <button data-satpage="${totalPages}" ${page>=totalPages?'disabled':''}>Last</button>`;
}

function tplSatModal(mode, row){
  return `
    <div class="modal-box">
      <div class="modal-header"><span>${mode==='edit'?'Ubah Satuan':'Tambah Satuan'}</span><span class="close" id="modalClose">&times;</span></div>
      <div class="modal-body">
        <div class="form-group">
          <label>Kode Satuan</label>
          <input type="text" id="fSatKode" value="${row.kode}" ${mode==='edit'?'readonly style="background:#f2f3f6;color:var(--text-light);"':'placeholder="Contoh: DUS"'}>
          <div class="form-error" id="fSatKodeErr">Kode Satuan wajib diisi</div>
        </div>
        <div class="form-group">
          <label>Nama Satuan</label>
          <input type="text" id="fSatNama" value="${row.nama||''}" placeholder="Contoh: Dus">
          <div class="form-error" id="fSatNamaErr">Nama Satuan wajib diisi</div>
        </div>
      </div>
      <div class="modal-footer">
        <button class="btn-secondary" id="modalCancel">Batal</button>
        <button class="btn-primary" id="modalSave">Simpan</button>
      </div>
    </div>`;
}

function tplSatDeleteConfirm(row){
  return `
    <div class="modal-box">
      <div class="modal-header"><span>Hapus Satuan</span><span class="close" id="modalClose">&times;</span></div>
      <div class="modal-body"><p>Yakin ingin menghapus Satuan <b>${row.kode}</b> — ${row.nama||'Non'}?</p></div>
      <div class="modal-footer">
        <button class="btn-secondary" id="modalCancel">Batal</button>
        <button class="btn-danger" id="modalDelete">Hapus</button>
      </div>
    </div>`;
}
