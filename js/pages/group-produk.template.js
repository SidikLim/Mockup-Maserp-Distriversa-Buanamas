/* =========================================================
   TEMPLATE (HTML saja) — Group Produk (Persediaan Barang >
   Master & Setting > Group Produk, page:'groupProduk'). Semua
   fungsi di file ini HANYA menyusun & mengembalikan markup
   HTML (string), TIDAK ada logic/DOM-binding di sini. Logic-nya
   ada di file sebelah: group-produk.js
   NB: closeModal() dipakai bersama, didefinisikan di core.js.

   Sebelumnya placeholder murni. Dibangun 2026-08-21 sesuai
   screenshot MASERP "Daftar Group Produk" (Total Record: 1,
   kolom Kode/Nama Group Produk dengan ikon sort + Keterangan,
   Ubah/Hapus). CRUD sederhana pola Master Divisi (3 field,
   tanpa sub-grid/kalkulasi). Baris contoh di screenshot asli
   ("DANPAC"/"DANPAC GROUP PRODUCT") terlihat seperti kode
   internal spesifik instalasi demo lain (bukan istilah generik
   seperti nama zat aktif/kelas terapi), jadi DIGANTI dengan
   contoh relevan bisnis DBM (sembako/FMCG) — lihat komentar
   lengkap di atas array `DATA.groupProduk` di js/data.js. Kode
   dientri MANUAL (bukan auto-generate), readonly di mode Ubah.
========================================================= */

function tplGrpPage(){
  return `
    <div class="breadcrumb">Home / <b>Group Produk</b></div>
    <div class="card">
      <div class="card-header dark-header">
        <h3>${icon('box',15)} Daftar Group Produk</h3>
        <button class="btn-primary" id="btnGrpAdd">${icon('plus',14)} Tambah</button>
      </div>
      <div class="table-toolbar">
        <select id="grpPageSize"><option selected>10</option><option>25</option><option>50</option></select>
        <input type="text" id="grpSearch" placeholder="Pencarian Global">
      </div>
      <div class="table-wrap"><table>
        <thead><tr>
          <th>${tplGrpSortHeader('Kode Group Produk','kode')}</th>
          <th>${tplGrpSortHeader('Nama Group Produk','nama')}</th>
          <th>Keterangan</th>
          <th style="width:70px;">Ubah</th>
          <th style="width:70px;">Hapus</th>
        </tr></thead>
        <tbody id="grpTbody"></tbody>
      </table></div>
      <div class="table-footer"><div class="pager" id="grpPager"></div><div id="grpTotal"></div></div>
    </div>`;
}

function tplGrpSortHeader(label, field){
  return `<span class="grp-sort-header" data-grp-sort="${field}" style="cursor:pointer;display:inline-flex;align-items:center;gap:4px;">${label}<span id="grpSortIcon_${field}" style="color:var(--text-light);font-size:11px;">&#8693;</span></span>`;
}

function tplGrpRows(rows, page, pageSize){
  if(!rows.length) return `<tr><td colspan="5" style="color:var(--text-light);">Tidak ada data Group Produk</td></tr>`;
  const start = (page-1)*pageSize;
  return rows.slice(start, start+pageSize).map((r) => {
    const idx = DATA.groupProduk.indexOf(r);
    return `
    <tr>
      <td><a href="#" class="row-link" data-edit="${idx}" style="color:var(--blue);font-weight:600;">${r.kode}</a></td>
      <td>${r.nama || 'Non'}</td>
      <td>${r.keterangan || ''}</td>
      <td><button class="icon-btn edit" data-edit="${idx}" title="Ubah">${icon('edit',15)}</button></td>
      <td><button class="icon-btn del" data-del="${idx}" title="Hapus">${icon('trash',15)}</button></td>
    </tr>`;
  }).join('');
}

function tplGrpPager(page, totalPages){
  if(totalPages <= 1) return '';
  const windowSize = 7;
  let start = Math.max(1, page - Math.floor(windowSize/2));
  let end = Math.min(totalPages, start + windowSize - 1);
  start = Math.max(1, end - windowSize + 1);
  let nums = '';
  for(let p = start; p <= end; p++){
    nums += `<button class="${p===page?'active':''}" data-grppage="${p}">${p}</button>`;
  }
  return `
    <button data-grppage="1" ${page<=1?'disabled':''}>First</button>
    <button data-grppage="${Math.max(1,page-1)}" ${page<=1?'disabled':''}>Previous</button>
    ${nums}
    <button data-grppage="${Math.min(totalPages,page+1)}" ${page>=totalPages?'disabled':''}>Next</button>
    <button data-grppage="${totalPages}" ${page>=totalPages?'disabled':''}>Last</button>`;
}

function tplGrpModal(mode, row){
  return `
    <div class="modal-box">
      <div class="modal-header"><span>${mode==='edit'?'Ubah Group Produk':'Tambah Group Produk'}</span><span class="close" id="modalClose">&times;</span></div>
      <div class="modal-body">
        <div class="form-group">
          <label>Kode Group Produk</label>
          <input type="text" id="fGrpKode" value="${row.kode}" ${mode==='edit'?'readonly style="background:#f2f3f6;color:var(--text-light);"':'placeholder="Contoh: SMBK02"'}>
          <div class="form-error" id="fGrpKodeErr">Kode Group Produk wajib diisi</div>
        </div>
        <div class="form-group">
          <label>Nama Group Produk</label>
          <input type="text" id="fGrpNama" value="${row.nama||''}" placeholder="Contoh: KELOMPOK PRODUK MINUMAN">
          <div class="form-error" id="fGrpNamaErr">Nama Group Produk wajib diisi</div>
        </div>
        <div class="form-group">
          <label>Keterangan</label>
          <textarea id="fGrpKeterangan" rows="2" placeholder="Keterangan (opsional)">${row.keterangan||''}</textarea>
        </div>
      </div>
      <div class="modal-footer">
        <button class="btn-secondary" id="modalCancel">Batal</button>
        <button class="btn-primary" id="modalSave">Simpan</button>
      </div>
    </div>`;
}

function tplGrpDeleteConfirm(row){
  return `
    <div class="modal-box">
      <div class="modal-header"><span>Hapus Group Produk</span><span class="close" id="modalClose">&times;</span></div>
      <div class="modal-body"><p>Yakin ingin menghapus Group Produk <b>${row.kode}</b> — ${row.nama||'Non'}?</p></div>
      <div class="modal-footer">
        <button class="btn-secondary" id="modalCancel">Batal</button>
        <button class="btn-danger" id="modalDelete">Hapus</button>
      </div>
    </div>`;
}
