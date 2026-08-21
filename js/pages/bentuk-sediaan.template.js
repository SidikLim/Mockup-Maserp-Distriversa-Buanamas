/* =========================================================
   TEMPLATE (HTML saja) — Bentuk Sediaan (Persediaan Barang >
   Master & Setting > Bentuk Sediaan, page:'bentukSediaan').
   Semua fungsi di file ini HANYA menyusun & mengembalikan
   markup HTML (string), TIDAK ada logic/DOM-binding di sini.
   Logic-nya ada di file sebelah: bentuk-sediaan.js
   NB: closeModal() dipakai bersama, didefinisikan di core.js.

   Sebelumnya placeholder murni. Dibangun 2026-08-21 sesuai
   screenshot MASERP "Daftar Bentuk Sediaan" (Total Record: 80,
   kolom Kode/Nama Bentuk Sediaan dengan ikon sort di kedua
   header, page-size 25 default + Pencarian Global, pager
   First/Previous/1-4/Next/Last). Field KEEMPAT & TERAKHIR dari
   grup field khas farmasi yang keputusan datanya (dibangun apa
   adanya, terminologi universal industri) sudah dikonfirmasi
   user sebelumnya via `AskUserQuestion` — lihat komentar
   lengkap di zat-kandungan-aktif.template.js & di atas array
   `DATA.zatKandunganAktif`/`DATA.bentukSediaan` di js/data.js,
   tidak diulang di sini. Pola HTML/CRUD/pager windowed/sort
   disalin persis dari Zat Kandungan Aktif.

   BEDA dari Zat Kandungan Aktif: TIDAK ada downsize volume (80
   baris dipertahankan utuh, sama seperti Farmakoterapi/Sub-
   Farmakoterapi); Kode 3-digit `SED000`-`SED079` (bukan 5-digit
   `KZA#####`); page-size default 25 (opsi dropdown 10/25/50).
========================================================= */

function tplSedPage(){
  return `
    <div class="breadcrumb">Home / <b>Bentuk Sediaan</b></div>
    <div class="card">
      <div class="card-header dark-header">
        <h3>${icon('box',15)} Daftar Bentuk Sediaan</h3>
        <button class="btn-primary" id="btnSedAdd">${icon('plus',14)} Tambah</button>
      </div>
      <div class="table-toolbar">
        <select id="sedPageSize"><option>10</option><option selected>25</option><option>50</option></select>
        <input type="text" id="sedSearch" placeholder="Pencarian Global">
      </div>
      <div class="table-wrap"><table>
        <thead><tr>
          <th>${tplSedSortHeader('Kode Bentuk Sediaan','kode')}</th>
          <th>${tplSedSortHeader('Nama Bentuk Sediaan','nama')}</th>
          <th style="width:70px;">Ubah</th>
          <th style="width:70px;">Hapus</th>
        </tr></thead>
        <tbody id="sedTbody"></tbody>
      </table></div>
      <div class="table-footer"><div class="pager" id="sedPager"></div><div id="sedTotal"></div></div>
    </div>`;
}

function tplSedSortHeader(label, field){
  return `<span class="sed-sort-header" data-sed-sort="${field}" style="cursor:pointer;display:inline-flex;align-items:center;gap:4px;">${label}<span id="sedSortIcon_${field}" style="color:var(--text-light);font-size:11px;">&#8693;</span></span>`;
}

function tplSedRows(rows, page, pageSize){
  if(!rows.length) return `<tr><td colspan="4" style="color:var(--text-light);">Tidak ada data Bentuk Sediaan</td></tr>`;
  const start = (page-1)*pageSize;
  return rows.slice(start, start+pageSize).map((r) => {
    const idx = DATA.bentukSediaan.indexOf(r);
    return `
    <tr>
      <td><a href="#" class="row-link" data-edit="${idx}" style="color:var(--blue);font-weight:600;">${r.kode}</a></td>
      <td>${r.nama || 'Non'}</td>
      <td><button class="icon-btn edit" data-edit="${idx}" title="Ubah">${icon('edit',15)}</button></td>
      <td><button class="icon-btn del" data-del="${idx}" title="Hapus">${icon('trash',15)}</button></td>
    </tr>`;
  }).join('');
}

/* Pager windowed maks. 7 nomor halaman — pola sama Zat Kandungan
   Aktif (redundan untuk 4 halaman tapi dibiarkan generik). */
function tplSedPager(page, totalPages){
  if(totalPages <= 1) return '';
  const windowSize = 7;
  let start = Math.max(1, page - Math.floor(windowSize/2));
  let end = Math.min(totalPages, start + windowSize - 1);
  start = Math.max(1, end - windowSize + 1);
  let nums = '';
  for(let p = start; p <= end; p++){
    nums += `<button class="${p===page?'active':''}" data-sedpage="${p}">${p}</button>`;
  }
  return `
    <button data-sedpage="1" ${page<=1?'disabled':''}>First</button>
    <button data-sedpage="${Math.max(1,page-1)}" ${page<=1?'disabled':''}>Previous</button>
    ${nums}
    <button data-sedpage="${Math.min(totalPages,page+1)}" ${page>=totalPages?'disabled':''}>Next</button>
    <button data-sedpage="${totalPages}" ${page>=totalPages?'disabled':''}>Last</button>`;
}

function tplSedModal(mode, row){
  return `
    <div class="modal-box">
      <div class="modal-header"><span>${mode==='edit'?'Ubah Bentuk Sediaan':'Tambah Bentuk Sediaan'}</span><span class="close" id="modalClose">&times;</span></div>
      <div class="modal-body">
        <div class="form-group">
          <label>Kode Bentuk Sediaan</label>
          <input type="text" id="fSedKode" value="${row.kode}" readonly style="background:#f2f3f6;color:var(--text-light);">
        </div>
        <div class="form-group">
          <label>Nama Bentuk Sediaan</label>
          <input type="text" id="fSedNama" value="${row.nama||''}" placeholder="Contoh: Tablet">
          <div class="form-error" id="fSedNamaErr">Nama Bentuk Sediaan wajib diisi</div>
        </div>
      </div>
      <div class="modal-footer">
        <button class="btn-secondary" id="modalCancel">Batal</button>
        <button class="btn-primary" id="modalSave">Simpan</button>
      </div>
    </div>`;
}

function tplSedDeleteConfirm(row){
  return `
    <div class="modal-box">
      <div class="modal-header"><span>Hapus Bentuk Sediaan</span><span class="close" id="modalClose">&times;</span></div>
      <div class="modal-body"><p>Yakin ingin menghapus Bentuk Sediaan <b>${row.kode}</b> — ${row.nama||'Non'}?</p></div>
      <div class="modal-footer">
        <button class="btn-secondary" id="modalCancel">Batal</button>
        <button class="btn-danger" id="modalDelete">Hapus</button>
      </div>
    </div>`;
}
