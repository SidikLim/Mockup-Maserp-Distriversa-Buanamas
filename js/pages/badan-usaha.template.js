/* =========================================================
   TEMPLATE (HTML saja) — Badan Usaha (Customer & Penjualan >
   Master & Setting > Badan Usaha, page:'badanUsaha').
   Semua fungsi di file ini HANYA menyusun & mengembalikan
   markup HTML (string), TIDAK ada logic/DOM-binding di sini.
   Logic-nya ada di file sebelah: badan-usaha.js
   NB: closeModal() dipakai bersama, didefinisikan di core.js.

   Sebelumnya placeholder murni. Dibangun 2026-09-01 sesuai
   screenshot MASERP "Badan Usaha" (Total Record: 40, kolom
   Kode/Nama Badan Usaha dgn ikon sort, page-size DEFAULT 10
   (beda dari Bentuk Sediaan yang default 25) + Pencarian
   Global, pager First/Previous/1-4/Next/Last). Pola HTML/
   CRUD/pager windowed/sort disalin dari Bentuk Sediaan.

   BEDA dari Bentuk Sediaan: Kode Badan Usaha DIKETIK MANUAL
   oleh user saat Tambah (bukan auto-generate — di screenshot
   kodenya bebas: APT, BDN, BUMN, DAK, GFK, dst.), di-uppercase
   otomatis, wajib & harus unik; saat Ubah kode readonly.
   Data 40 baris di DATA.badanUsaha (js/data.js) — 10 baris
   pertama persis screenshot, sisanya dipetakan ke dunia
   distribusi farmasi DBM (kode PRO/UD/PT/CV yang sudah dipakai
   field badanUsaha di master Customer ikut disediakan).
========================================================= */

function tplBuPage(){
  return `
    <div class="breadcrumb">Home / <b>Badan Usaha</b></div>
    <div class="card">
      <div class="card-header dark-header">
        <h3>${icon('users',15)} Badan Usaha</h3>
        <button class="btn-primary" id="btnBuAdd">${icon('plus',14)} Tambah</button>
      </div>
      <div class="table-toolbar">
        <select id="buPageSize"><option selected>10</option><option>25</option><option>50</option></select>
        <input type="text" id="buSearch" placeholder="Pencarian Global">
      </div>
      <div class="table-wrap"><table>
        <thead><tr>
          <th>${tplBuSortHeader('Kode Badan Usaha','kode')}</th>
          <th>${tplBuSortHeader('Nama Badan Usaha','nama')}</th>
          <th style="width:70px;">Ubah</th>
          <th style="width:70px;">Hapus</th>
        </tr></thead>
        <tbody id="buTbody"></tbody>
      </table></div>
      <div class="table-footer"><div class="pager" id="buPager"></div><div id="buTotal"></div></div>
    </div>`;
}

function tplBuSortHeader(label, field){
  return `<span class="bu-sort-header" data-bu-sort="${field}" style="cursor:pointer;display:inline-flex;align-items:center;gap:4px;">${label}<span id="buSortIcon_${field}" style="color:var(--text-light);font-size:11px;">&#8693;</span></span>`;
}

function tplBuRows(rows, page, pageSize){
  if(!rows.length) return `<tr><td colspan="4" style="color:var(--text-light);">Tidak ada data Badan Usaha</td></tr>`;
  const start = (page-1)*pageSize;
  return rows.slice(start, start+pageSize).map((r) => {
    const idx = DATA.badanUsaha.indexOf(r);
    return `
    <tr>
      <td><a href="#" class="row-link" data-edit="${idx}" style="color:var(--blue);font-weight:600;">${r.kode}</a></td>
      <td>${r.nama || '-'}</td>
      <td><button class="icon-btn edit" data-edit="${idx}" title="Ubah">${icon('edit',15)}</button></td>
      <td><button class="icon-btn del" data-del="${idx}" title="Hapus">${icon('trash',15)}</button></td>
    </tr>`;
  }).join('');
}

/* Pager windowed maks. 7 nomor halaman — pola sama Bentuk
   Sediaan (40 baris / 10 per halaman = 4 halaman, muat penuh). */
function tplBuPager(page, totalPages){
  if(totalPages <= 1) return '';
  const windowSize = 7;
  let start = Math.max(1, page - Math.floor(windowSize/2));
  let end = Math.min(totalPages, start + windowSize - 1);
  start = Math.max(1, end - windowSize + 1);
  let nums = '';
  for(let p = start; p <= end; p++){
    nums += `<button class="${p===page?'active':''}" data-bupage="${p}">${p}</button>`;
  }
  return `
    <button data-bupage="1" ${page<=1?'disabled':''}>First</button>
    <button data-bupage="${Math.max(1,page-1)}" ${page<=1?'disabled':''}>Previous</button>
    ${nums}
    <button data-bupage="${Math.min(totalPages,page+1)}" ${page>=totalPages?'disabled':''}>Next</button>
    <button data-bupage="${totalPages}" ${page>=totalPages?'disabled':''}>Last</button>`;
}

function tplBuModal(mode, row){
  const isEdit = mode === 'edit';
  return `
    <div class="modal-box">
      <div class="modal-header"><span>${isEdit?'Ubah Badan Usaha':'Tambah Badan Usaha'}</span><span class="close" id="modalClose">&times;</span></div>
      <div class="modal-body">
        <div class="form-group">
          <label>Kode Badan Usaha</label>
          <input type="text" id="fBuKode" value="${row.kode}" maxlength="10" ${isEdit?'readonly style="background:#f2f3f6;color:var(--text-light);"':'placeholder="Contoh: APT" style="text-transform:uppercase;"'}>
          <div class="form-error" id="fBuKodeErr">Kode Badan Usaha wajib diisi</div>
        </div>
        <div class="form-group">
          <label>Nama Badan Usaha</label>
          <input type="text" id="fBuNama" value="${row.nama||''}" placeholder="Contoh: APOTEK">
          <div class="form-error" id="fBuNamaErr">Nama Badan Usaha wajib diisi</div>
        </div>
      </div>
      <div class="modal-footer">
        <button class="btn-secondary" id="modalCancel">Batal</button>
        <button class="btn-primary" id="modalSave">Simpan</button>
      </div>
    </div>`;
}

function tplBuDeleteConfirm(row){
  return `
    <div class="modal-box">
      <div class="modal-header"><span>Hapus Badan Usaha</span><span class="close" id="modalClose">&times;</span></div>
      <div class="modal-body"><p>Yakin ingin menghapus Badan Usaha <b>${row.kode}</b> — ${row.nama||'-'}?</p></div>
      <div class="modal-footer">
        <button class="btn-secondary" id="modalCancel">Batal</button>
        <button class="btn-danger" id="modalDelete">Hapus</button>
      </div>
    </div>`;
}
