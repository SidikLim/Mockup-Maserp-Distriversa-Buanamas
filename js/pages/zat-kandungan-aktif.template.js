/* =========================================================
   TEMPLATE (HTML saja) — Zat Kandungan Aktif (Persediaan
   Barang > Master & Setting > Zat Kandungan Aktif,
   page:'zatKandunganAktif'). Semua fungsi di file ini HANYA
   menyusun & mengembalikan markup HTML (string), TIDAK ada
   logic/DOM-binding di sini. Logic-nya ada di file sebelah:
   zat-kandungan-aktif.js

   Sebelumnya placeholder murni. Dibangun 2026-08-21 sesuai
   screenshot MASERP "Daftar Zat Kandungan Aktif" (list Total
   Record: 324, kolom Kode/Nama Zat Kandungan Aktif dengan ikon
   sort di kedua header, Ubah/Hapus, page-size 10 default +
   Pencarian Global, pager First/Previous/1..7/Next/Last).

   KEPUTUSAN DATA (dikonfirmasi user): field ini & 3 tetangganya
   di sidebar (Farmakoterapi/Sub-Farmakoterapi/Bentuk Sediaan,
   masih placeholder) adalah field KHAS distributor farmasi/
   kesehatan — beda dari katalog FMCG (sembako) yang sudah
   dibangun untuk DBM sejauh ini. User memilih dibangun APA
   ADANYA: nama zat aktif (INN/generik obat) adalah referensi
   standar industri farmasi, BUKAN data rahasia milik perusahaan
   demo lain — aman dipakai persis seperti screenshot, sama
   status-nya dengan "Nama/Keterangan/Permission Code" report
   generik di Report Center (2026-08-21) yang juga dipertahankan
   apa adanya karena bukan data customer/supplier sensitif.

   VOLUME diturunkan dari 324 baris (screenshot asli) ke 60
   baris — mengikuti precedent downsize-volume Master Rayon/
   Price List By Province/Cetakan Transaksi (Report Center):
   10 baris PALING ATAS PERSIS sesuai screenshot (termasuk 2
   kode non-standar ANTASIDADOENSLF & COTRIM400-80 — kuirk data
   asli, kode lama sebelum skema penomoran KZA00000 dst.
   diberlakukan, direproduksi apa adanya bukan salah ketik),
   50 baris sisanya nama generik/INN obat umum lain (bukan
   replikasi 314 baris sungguhan dari screenshot yang resolusinya
   tidak bisa dipastikan akurat), tetap genuinely cukup untuk
   mendemokan pagination multi-halaman sungguhan (60÷10=6 hal.).

   PAGER WINDOWED — pola BARU, belum pernah dipakai modul lain:
   `tplZkaPager()` hanya menampilkan JENDELA maks. 7 nomor
   halaman (bukan SELURUH nomor seperti `tplUsrPager()` Master
   User, yang cocok utk dataset kecil ~10 halaman) — perlu karena
   60 baris @ page-size 10 = 6 halaman, TAPI kalau page-size
   diperkecil sistem tetap harus tampil rapi; persis meniru
   tampilan pager "1 2 3 4 5 6 7" di screenshot.

   SORT kolom Kode & Nama SUNGGUHAN fungsional (klik header/ikon
   men-toggle asc/desc) — beda dari kebanyakan modul list lain di
   mockup ini yang headernya polos tanpa sort (Gudang/Akun GL/
   Master Supplier dst., didokumentasikan sengaja disederhanakan)
   — di sini dibuat nyata karena screenshot MASERP menampilkan
   ikon sort eksplisit di kedua header & datanya memang lumayan
   banyak (60 baris) sehingga sort ada gunanya.
========================================================= */

function tplZkaPage(){
  return `
    <div class="breadcrumb">Home / <b>Zat Kandungan Aktif</b></div>
    <div class="card">
      <div class="card-header dark-header">
        <h3>${icon('box',15)} Daftar Zat Kandungan Aktif</h3>
        <button class="btn-primary" id="btnZkaAdd">${icon('plus',14)} Tambah</button>
      </div>
      <div class="table-toolbar">
        <select id="zkaPageSize"><option selected>10</option><option>25</option><option>50</option></select>
        <input type="text" id="zkaSearch" placeholder="Pencarian Global">
      </div>
      <div class="table-wrap"><table>
        <thead><tr>
          <th>${tplZkaSortHeader('Kode Zat Kandungan Aktif','kode')}</th>
          <th>${tplZkaSortHeader('Nama Zat Kandungan Aktif','nama')}</th>
          <th style="width:70px;">Ubah</th>
          <th style="width:70px;">Hapus</th>
        </tr></thead>
        <tbody id="zkaTbody"></tbody>
      </table></div>
      <div class="table-footer"><div class="pager" id="zkaPager"></div><div id="zkaTotal"></div></div>
    </div>`;
}

function tplZkaSortHeader(label, field){
  return `<span class="zka-sort-header" data-zka-sort="${field}" style="cursor:pointer;display:inline-flex;align-items:center;gap:4px;">${label}<span id="zkaSortIcon_${field}" style="color:var(--text-light);font-size:11px;">&#8693;</span></span>`;
}

function tplZkaRows(rows, page, pageSize){
  if(!rows.length) return `<tr><td colspan="4" style="color:var(--text-light);">Tidak ada data Zat Kandungan Aktif</td></tr>`;
  const start = (page-1)*pageSize;
  return rows.slice(start, start+pageSize).map((r) => {
    const idx = DATA.zatKandunganAktif.indexOf(r);
    return `
    <tr>
      <td><a href="#" class="row-link" data-edit="${idx}" style="color:var(--blue);font-weight:600;">${r.kode}</a></td>
      <td>${r.nama || 'Non'}</td>
      <td><button class="icon-btn edit" data-edit="${idx}" title="Ubah">${icon('edit',15)}</button></td>
      <td><button class="icon-btn del" data-del="${idx}" title="Hapus">${icon('trash',15)}</button></td>
    </tr>`;
  }).join('');
}

/* Pager windowed maks. 7 nomor halaman, plus First/Previous/Next/
   Last — lihat catatan header di atas kenapa ini pola baru. */
function tplZkaPager(page, totalPages){
  if(totalPages <= 1) return '';
  const windowSize = 7;
  let start = Math.max(1, page - Math.floor(windowSize/2));
  let end = Math.min(totalPages, start + windowSize - 1);
  start = Math.max(1, end - windowSize + 1);
  let nums = '';
  for(let p = start; p <= end; p++){
    nums += `<button class="${p===page?'active':''}" data-zkapage="${p}">${p}</button>`;
  }
  return `
    <button data-zkapage="1" ${page<=1?'disabled':''}>First</button>
    <button data-zkapage="${Math.max(1,page-1)}" ${page<=1?'disabled':''}>Previous</button>
    ${nums}
    <button data-zkapage="${Math.min(totalPages,page+1)}" ${page>=totalPages?'disabled':''}>Next</button>
    <button data-zkapage="${totalPages}" ${page>=totalPages?'disabled':''}>Last</button>`;
}

function tplZkaModal(mode, row){
  return `
    <div class="modal-box">
      <div class="modal-header"><span>${mode==='edit'?'Ubah Zat Kandungan Aktif':'Tambah Zat Kandungan Aktif'}</span><span class="close" id="modalClose">&times;</span></div>
      <div class="modal-body">
        <div class="form-group">
          <label>Kode Zat Kandungan Aktif</label>
          <input type="text" id="fZkaKode" value="${row.kode}" readonly style="background:#f2f3f6;color:var(--text-light);">
        </div>
        <div class="form-group">
          <label>Nama Zat Kandungan Aktif</label>
          <input type="text" id="fZkaNama" value="${row.nama||''}" placeholder="Contoh: Paracetamol">
          <div class="form-error" id="fZkaNamaErr">Nama Zat Kandungan Aktif wajib diisi</div>
        </div>
      </div>
      <div class="modal-footer">
        <button class="btn-secondary" id="modalCancel">Batal</button>
        <button class="btn-primary" id="modalSave">Simpan</button>
      </div>
    </div>`;
}

function tplZkaDeleteConfirm(row){
  return `
    <div class="modal-box">
      <div class="modal-header"><span>Hapus Zat Kandungan Aktif</span><span class="close" id="modalClose">&times;</span></div>
      <div class="modal-body"><p>Yakin ingin menghapus Zat Kandungan Aktif <b>${row.kode}</b> — ${row.nama||'Non'}?</p></div>
      <div class="modal-footer">
        <button class="btn-secondary" id="modalCancel">Batal</button>
        <button class="btn-danger" id="modalDelete">Hapus</button>
      </div>
    </div>`;
}
