/* =========================================================
   TEMPLATE (HTML saja) — Sub-Farmakoterapi (Persediaan Barang
   > Master & Setting > Sub-Farmakoterapi, page:'subFarmakoterapi').
   Semua fungsi di file ini HANYA menyusun & mengembalikan
   markup HTML (string), TIDAK ada logic/DOM-binding di sini.
   Logic-nya ada di file sebelah: sub-farmakoterapi.js
   NB: closeModal() dipakai bersama, didefinisikan di core.js.

   Sebelumnya placeholder murni. Dibangun 2026-08-21 sesuai 2
   screenshot MASERP "Master Sub-Farmakoterapi" (Total Record:
   150, page-size 20 default + Pencarian Global, pager
   First/Previous/1..7/Next/Last). Pola HTML/CRUD/pager/sort
   disalin dari Zat Kandungan Aktif & Farmakoterapi (menu
   tetangga yang dibangun lebih dulu di sesi yang sama) — lihat
   catatan keputusan data lengkap di zat-kandungan-aktif.template.js
   & js/data.js, tidak diulang di sini.

   CATATAN PERBAIKAN vs screenshot: header kolom ASLI di
   screenshot MASERP tertulis "Kode Zat Kandungan Aktif"/"Nama
   Zat Kandungan Aktif" — ini bug label copy-paste di sistem
   asli (data di dalamnya jelas Sub-Farmakoterapi berkode SFK).
   Di mockup ini header DIPERBAIKI jadi "Kode/Nama
   Sub-Farmakoterapi" karena ini typo UI, bukan bagian dari data
   yang perlu direproduksi apa adanya (beda kasus dgn kode
   legacy ANTASIDADOENSLF/COTRIM400-80 di Zat Kandungan Aktif
   yang memang datanya, bukan label).

   BEDA lain dari Zat Kandungan Aktif/Farmakoterapi: page-size
   default 20 (bukan 10), opsi dropdown 10/20/50 — sesuai nilai
   "20" yang aktif di screenshot. TIDAK ada downsize volume:
   Total Record: 150 dipertahankan utuh (150÷20=8 halaman,
   window pager tampil "1..7"+Next di halaman 1 — persis
   screenshot).
========================================================= */

function tplSfkPage(){
  return `
    <div class="breadcrumb">Home / <b>Sub-Farmakoterapi</b></div>
    <div class="card">
      <div class="card-header dark-header">
        <h3>${icon('box',15)} Master Sub-Farmakoterapi</h3>
        <button class="btn-primary" id="btnSfkAdd">${icon('plus',14)} Tambah</button>
      </div>
      <div class="table-toolbar">
        <select id="sfkPageSize"><option>10</option><option selected>20</option><option>50</option></select>
        <input type="text" id="sfkSearch" placeholder="Pencarian Global">
      </div>
      <div class="table-wrap"><table>
        <thead><tr>
          <th>${tplSfkSortHeader('Kode Sub-Farmakoterapi','kode')}</th>
          <th>${tplSfkSortHeader('Nama Sub-Farmakoterapi','nama')}</th>
          <th style="width:70px;">Ubah</th>
          <th style="width:70px;">Hapus</th>
        </tr></thead>
        <tbody id="sfkTbody"></tbody>
      </table></div>
      <div class="table-footer"><div class="pager" id="sfkPager"></div><div id="sfkTotal"></div></div>
    </div>`;
}

function tplSfkSortHeader(label, field){
  return `<span class="sfk-sort-header" data-sfk-sort="${field}" style="cursor:pointer;display:inline-flex;align-items:center;gap:4px;">${label}<span id="sfkSortIcon_${field}" style="color:var(--text-light);font-size:11px;">&#8693;</span></span>`;
}

function tplSfkRows(rows, page, pageSize){
  if(!rows.length) return `<tr><td colspan="4" style="color:var(--text-light);">Tidak ada data Sub-Farmakoterapi</td></tr>`;
  const start = (page-1)*pageSize;
  return rows.slice(start, start+pageSize).map((r) => {
    const idx = DATA.subFarmakoterapi.indexOf(r);
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
   Last — pola sama seperti Zat Kandungan Aktif (tplZkaPager()). */
function tplSfkPager(page, totalPages){
  if(totalPages <= 1) return '';
  const windowSize = 7;
  let start = Math.max(1, page - Math.floor(windowSize/2));
  let end = Math.min(totalPages, start + windowSize - 1);
  start = Math.max(1, end - windowSize + 1);
  let nums = '';
  for(let p = start; p <= end; p++){
    nums += `<button class="${p===page?'active':''}" data-sfkpage="${p}">${p}</button>`;
  }
  return `
    <button data-sfkpage="1" ${page<=1?'disabled':''}>First</button>
    <button data-sfkpage="${Math.max(1,page-1)}" ${page<=1?'disabled':''}>Previous</button>
    ${nums}
    <button data-sfkpage="${Math.min(totalPages,page+1)}" ${page>=totalPages?'disabled':''}>Next</button>
    <button data-sfkpage="${totalPages}" ${page>=totalPages?'disabled':''}>Last</button>`;
}

function tplSfkModal(mode, row){
  return `
    <div class="modal-box">
      <div class="modal-header"><span>${mode==='edit'?'Ubah Sub-Farmakoterapi':'Tambah Sub-Farmakoterapi'}</span><span class="close" id="modalClose">&times;</span></div>
      <div class="modal-body">
        <div class="form-group">
          <label>Kode Sub-Farmakoterapi</label>
          <input type="text" id="fSfkKode" value="${row.kode}" readonly style="background:#f2f3f6;color:var(--text-light);">
        </div>
        <div class="form-group">
          <label>Nama Sub-Farmakoterapi</label>
          <input type="text" id="fSfkNama" value="${row.nama||''}" placeholder="Contoh: Antagonis Reseptor H2">
          <div class="form-error" id="fSfkNamaErr">Nama Sub-Farmakoterapi wajib diisi</div>
        </div>
      </div>
      <div class="modal-footer">
        <button class="btn-secondary" id="modalCancel">Batal</button>
        <button class="btn-primary" id="modalSave">Simpan</button>
      </div>
    </div>`;
}

function tplSfkDeleteConfirm(row){
  return `
    <div class="modal-box">
      <div class="modal-header"><span>Hapus Sub-Farmakoterapi</span><span class="close" id="modalClose">&times;</span></div>
      <div class="modal-body"><p>Yakin ingin menghapus Sub-Farmakoterapi <b>${row.kode}</b> — ${row.nama||'Non'}?</p></div>
      <div class="modal-footer">
        <button class="btn-secondary" id="modalCancel">Batal</button>
        <button class="btn-danger" id="modalDelete">Hapus</button>
      </div>
    </div>`;
}
