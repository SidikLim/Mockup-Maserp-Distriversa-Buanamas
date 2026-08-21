/* =========================================================
   TEMPLATE (HTML saja) — Daftar Kategory Reordering Sheet
   (Persediaan Barang > Master & Setting > Daftar Kategory
   Reordering Sheet, page:'kategoriReorderingSheet'). Semua
   fungsi di file ini HANYA menyusun & mengembalikan markup
   HTML (string), TIDAK ada logic/DOM-binding di sini. Logic-nya
   ada di file sebelah: kategori-reordering-sheet.js
   NB: closeModal() dipakai bersama, didefinisikan di core.js.

   Sebelumnya placeholder murni. Dibangun 2026-08-21 sesuai
   screenshot MASERP "Daftar Kategory Reordering Sheet" (Total
   Record: 7, kolom Kode/Nama Kategori Reordering Sheet dengan
   ikon sort di kedua header + Grup Penjualan, Ubah/Hapus).
   Field ini KHAS regulasi distribusi farmasi (ALKES/BBS/NON/
   ODP/OOT/PRE/PSI = kategori pengawasan BPOM, BUKAN kategori
   produk FMCG biasa) — mengikuti keputusan user yang sama
   (dikonfirmasi via AskUserQuestion sebelumnya untuk Zat
   Kandungan Aktif dkk.): dibangun apa adanya karena ini
   singkatan regulasi standar industri, bukan data rahasia
   perusahaan demo lain. TIDAK terhubung ke filter "Kat.
   Reordering Sheet" di modul Reordering Sheet (yang sudah
   fungsional nyata memakai kategori FMCG dari `DATA.persediaan`)
   — lihat komentar lengkap di atas array `DATA.kategoriReorderingSheet`
   di js/data.js. Kode dientri MANUAL (bukan auto-generate
   sequential — kode aslinya singkatan bermakna seperti ALKES/
   PSI, bukan nomor urut), readonly di mode Ubah — pola sama
   Supplier Group/Master Divisi.
========================================================= */

function tplKrsPage(){
  return `
    <div class="breadcrumb">Home / <b>Daftar Kategory Reordering Sheet</b></div>
    <div class="card">
      <div class="card-header dark-header">
        <h3>${icon('box',15)} Daftar Kategory Reordering Sheet</h3>
        <button class="btn-primary" id="btnKrsAdd">${icon('plus',14)} Tambah</button>
      </div>
      <div class="table-toolbar">
        <select id="krsPageSize"><option selected>10</option><option>25</option><option>50</option></select>
        <input type="text" id="krsSearch" placeholder="Pencarian Global">
      </div>
      <div class="table-wrap"><table>
        <thead><tr>
          <th>${tplKrsSortHeader('Kode Kategori Reordering Sheet','kode')}</th>
          <th>${tplKrsSortHeader('Nama Kategori Reordering Sheet','nama')}</th>
          <th>Grup Penjualan</th>
          <th style="width:70px;">Ubah</th>
          <th style="width:70px;">Hapus</th>
        </tr></thead>
        <tbody id="krsTbody"></tbody>
      </table></div>
      <div class="table-footer"><div class="pager" id="krsPager"></div><div id="krsTotal"></div></div>
    </div>`;
}

function tplKrsSortHeader(label, field){
  return `<span class="krs-sort-header" data-krs-sort="${field}" style="cursor:pointer;display:inline-flex;align-items:center;gap:4px;">${label}<span id="krsSortIcon_${field}" style="color:var(--text-light);font-size:11px;">&#8693;</span></span>`;
}

function tplKrsRows(rows, page, pageSize){
  if(!rows.length) return `<tr><td colspan="5" style="color:var(--text-light);">Tidak ada data Kategori Reordering Sheet</td></tr>`;
  const start = (page-1)*pageSize;
  return rows.slice(start, start+pageSize).map((r) => {
    const idx = DATA.kategoriReorderingSheet.indexOf(r);
    return `
    <tr>
      <td><a href="#" class="row-link" data-edit="${idx}" style="color:var(--blue);font-weight:600;">${r.kode}</a></td>
      <td>${r.nama || 'Non'}</td>
      <td>${r.grupPenjualan || ''}</td>
      <td><button class="icon-btn edit" data-edit="${idx}" title="Ubah">${icon('edit',15)}</button></td>
      <td><button class="icon-btn del" data-del="${idx}" title="Hapus">${icon('trash',15)}</button></td>
    </tr>`;
  }).join('');
}

function tplKrsPager(page, totalPages){
  if(totalPages <= 1) return '';
  const windowSize = 7;
  let start = Math.max(1, page - Math.floor(windowSize/2));
  let end = Math.min(totalPages, start + windowSize - 1);
  start = Math.max(1, end - windowSize + 1);
  let nums = '';
  for(let p = start; p <= end; p++){
    nums += `<button class="${p===page?'active':''}" data-krspage="${p}">${p}</button>`;
  }
  return `
    <button data-krspage="1" ${page<=1?'disabled':''}>First</button>
    <button data-krspage="${Math.max(1,page-1)}" ${page<=1?'disabled':''}>Previous</button>
    ${nums}
    <button data-krspage="${Math.min(totalPages,page+1)}" ${page>=totalPages?'disabled':''}>Next</button>
    <button data-krspage="${totalPages}" ${page>=totalPages?'disabled':''}>Last</button>`;
}

function tplKrsModal(mode, row){
  return `
    <div class="modal-box">
      <div class="modal-header"><span>${mode==='edit'?'Ubah Kategori Reordering Sheet':'Tambah Kategori Reordering Sheet'}</span><span class="close" id="modalClose">&times;</span></div>
      <div class="modal-body">
        <div class="form-group">
          <label>Kode Kategori Reordering Sheet</label>
          <input type="text" id="fKrsKode" value="${row.kode}" ${mode==='edit'?'readonly style="background:#f2f3f6;color:var(--text-light);"':'placeholder="Contoh: OTC"'}>
          <div class="form-error" id="fKrsKodeErr">Kode Kategori Reordering Sheet wajib diisi</div>
        </div>
        <div class="form-group">
          <label>Nama Kategori Reordering Sheet</label>
          <input type="text" id="fKrsNama" value="${row.nama||''}" placeholder="Contoh: OBAT BEBAS TERBATAS">
          <div class="form-error" id="fKrsNamaErr">Nama Kategori Reordering Sheet wajib diisi</div>
        </div>
        <div class="form-group">
          <label>Grup Penjualan</label>
          <input type="text" id="fKrsGrup" value="${row.grupPenjualan||''}" placeholder="Contoh: GROUP OTC">
        </div>
      </div>
      <div class="modal-footer">
        <button class="btn-secondary" id="modalCancel">Batal</button>
        <button class="btn-primary" id="modalSave">Simpan</button>
      </div>
    </div>`;
}

function tplKrsDeleteConfirm(row){
  return `
    <div class="modal-box">
      <div class="modal-header"><span>Hapus Kategori Reordering Sheet</span><span class="close" id="modalClose">&times;</span></div>
      <div class="modal-body"><p>Yakin ingin menghapus Kategori Reordering Sheet <b>${row.kode}</b> — ${row.nama||'Non'}?</p></div>
      <div class="modal-footer">
        <button class="btn-secondary" id="modalCancel">Batal</button>
        <button class="btn-danger" id="modalDelete">Hapus</button>
      </div>
    </div>`;
}
