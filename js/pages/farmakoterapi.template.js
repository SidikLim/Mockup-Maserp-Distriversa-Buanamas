/* =========================================================
   TEMPLATE (HTML saja) — Farmakoterapi (Persediaan Barang >
   Master & Setting > Farmakoterapi, page:'farmakoterapi').
   Semua fungsi di file ini HANYA menyusun & mengembalikan
   markup HTML (string), TIDAK ada logic/DOM-binding di sini.
   Logic-nya ada di file sebelah: farmakoterapi.js
   NB: closeModal() dipakai bersama, didefinisikan di core.js.

   Sebelumnya placeholder murni. Dibangun 2026-08-21 sesuai
   screenshot MASERP "Master Farmakoterapi" (Total Record: 80,
   kolom Kode/Nama Farmakoterapi dengan ikon sort di kedua
   header, Ubah/Hapus, page-size 10 default + Pencarian Global,
   pager First/Previous/1..7/Next/Last). Pola HTML/CRUD/pager/
   sort di file ini SENGAJA disalin persis dari menu tetangga
   "Zat Kandungan Aktif" (zat-kandungan-aktif.template.js) yang
   dibangun sebelumnya di sesi yang sama — lihat catatan
   keputusan data & pager windowed lengkap di sana; tidak
   diulang di sini supaya tidak duplikatif. Ringkasnya: field
   khas farmasi, nama kelas terapi adalah terminologi
   farmakologi standar (bukan data rahasia perusahaan demo
   lain), dibangun apa adanya sesuai keputusan user yang sama
   yang berlaku utk seluruh grup field farmasi ini (Zat
   Kandungan Aktif/Farmakoterapi/Sub-Farmakoterapi/Bentuk
   Sediaan). Detail data lihat komentar di js/data.js.

   BEDA dari Zat Kandungan Aktif: TIDAK ada downsize volume —
   Total Record: 80 pada screenshot asli sudah wajar untuk
   dipertahankan utuh (lihat js/data.js). 80÷10=8 halaman.
========================================================= */

function tplFrkPage(){
  return `
    <div class="breadcrumb">Home / <b>Farmakoterapi</b></div>
    <div class="card">
      <div class="card-header dark-header">
        <h3>${icon('box',15)} Master Farmakoterapi</h3>
        <button class="btn-primary" id="btnFrkAdd">${icon('plus',14)} Tambah</button>
      </div>
      <div class="table-toolbar">
        <select id="frkPageSize"><option selected>10</option><option>25</option><option>50</option></select>
        <input type="text" id="frkSearch" placeholder="Pencarian Global">
      </div>
      <div class="table-wrap"><table>
        <thead><tr>
          <th>${tplFrkSortHeader('Kode Farmakoterapi','kode')}</th>
          <th>${tplFrkSortHeader('Nama Farmakoterapi','nama')}</th>
          <th style="width:70px;">Ubah</th>
          <th style="width:70px;">Hapus</th>
        </tr></thead>
        <tbody id="frkTbody"></tbody>
      </table></div>
      <div class="table-footer"><div class="pager" id="frkPager"></div><div id="frkTotal"></div></div>
    </div>`;
}

function tplFrkSortHeader(label, field){
  return `<span class="frk-sort-header" data-frk-sort="${field}" style="cursor:pointer;display:inline-flex;align-items:center;gap:4px;">${label}<span id="frkSortIcon_${field}" style="color:var(--text-light);font-size:11px;">&#8693;</span></span>`;
}

function tplFrkRows(rows, page, pageSize){
  if(!rows.length) return `<tr><td colspan="4" style="color:var(--text-light);">Tidak ada data Farmakoterapi</td></tr>`;
  const start = (page-1)*pageSize;
  return rows.slice(start, start+pageSize).map((r) => {
    const idx = DATA.farmakoterapi.indexOf(r);
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
function tplFrkPager(page, totalPages){
  if(totalPages <= 1) return '';
  const windowSize = 7;
  let start = Math.max(1, page - Math.floor(windowSize/2));
  let end = Math.min(totalPages, start + windowSize - 1);
  start = Math.max(1, end - windowSize + 1);
  let nums = '';
  for(let p = start; p <= end; p++){
    nums += `<button class="${p===page?'active':''}" data-frkpage="${p}">${p}</button>`;
  }
  return `
    <button data-frkpage="1" ${page<=1?'disabled':''}>First</button>
    <button data-frkpage="${Math.max(1,page-1)}" ${page<=1?'disabled':''}>Previous</button>
    ${nums}
    <button data-frkpage="${Math.min(totalPages,page+1)}" ${page>=totalPages?'disabled':''}>Next</button>
    <button data-frkpage="${totalPages}" ${page>=totalPages?'disabled':''}>Last</button>`;
}

function tplFrkModal(mode, row){
  return `
    <div class="modal-box">
      <div class="modal-header"><span>${mode==='edit'?'Ubah Farmakoterapi':'Tambah Farmakoterapi'}</span><span class="close" id="modalClose">&times;</span></div>
      <div class="modal-body">
        <div class="form-group">
          <label>Kode Farmakoterapi</label>
          <input type="text" id="fFrkKode" value="${row.kode}" readonly style="background:#f2f3f6;color:var(--text-light);">
        </div>
        <div class="form-group">
          <label>Nama Farmakoterapi</label>
          <input type="text" id="fFrkNama" value="${row.nama||''}" placeholder="Contoh: Antibiotik">
          <div class="form-error" id="fFrkNamaErr">Nama Farmakoterapi wajib diisi</div>
        </div>
      </div>
      <div class="modal-footer">
        <button class="btn-secondary" id="modalCancel">Batal</button>
        <button class="btn-primary" id="modalSave">Simpan</button>
      </div>
    </div>`;
}

function tplFrkDeleteConfirm(row){
  return `
    <div class="modal-box">
      <div class="modal-header"><span>Hapus Farmakoterapi</span><span class="close" id="modalClose">&times;</span></div>
      <div class="modal-body"><p>Yakin ingin menghapus Farmakoterapi <b>${row.kode}</b> — ${row.nama||'Non'}?</p></div>
      <div class="modal-footer">
        <button class="btn-secondary" id="modalCancel">Batal</button>
        <button class="btn-danger" id="modalDelete">Hapus</button>
      </div>
    </div>`;
}
