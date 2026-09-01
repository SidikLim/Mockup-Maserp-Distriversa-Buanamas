/* =========================================================
   TEMPLATE (HTML saja) — Alasan Belum Tertagih (Lain-lain >
   Alasan Belum Tertagih, page:'alasanBelumTertagih').
   Semua fungsi di file ini HANYA menyusun & mengembalikan
   markup HTML (string), TIDAK ada logic/DOM-binding di sini.
   Logic-nya ada di file sebelah: alasan-belum-tertagih.js
   NB: closeModal() dipakai bersama, didefinisikan di core.js.

   Sebelumnya placeholder murni. Dibangun 2026-09-01 sesuai
   screenshot MASERP SDL "List Alasan Belum Tertagih" (Total
   Record: 20, kolom Reason Code / Reason Name dgn ikon sort —
   label kolom BAHASA INGGRIS persis screenshot, page-size
   default 1000 (opsi 10/25/50/1000) + Pencarian Global, pager
   First/Previous/1/Next/Last, tombol +Tambah). 20 baris
   BT01-BT20 dipertahankan APA ADANYA (teks alasan generik
   proses penagihan, bukan data rahasia instalasi lain). Pola
   HTML/CRUD/pager windowed/sort disalin dari Badan Usaha.

   BEDA dari Badan Usaha: Reason Code AUTO-GENERATE "BT{2
   digit}" berurutan saat Tambah (readonly — pola kode
   sekuensial di screenshot), readonly juga saat Ubah. */

function tplAbtPage(){
  return `
    <div class="breadcrumb">Home / <b>Alasan Belum Tertagih</b></div>
    <div class="card">
      <div class="card-header dark-header">
        <h3>${icon('alertTriangle',15)} List Alasan Belum Tertagih</h3>
        <button class="btn-primary" id="btnAbtAdd">${icon('plus',14)}Tambah</button>
      </div>
      <div class="table-toolbar">
        <select id="abtPageSize"><option>10</option><option>25</option><option>50</option><option selected>1000</option></select>
        <input type="text" id="abtSearch" placeholder="Pencarian Global">
      </div>
      <div class="table-wrap"><table>
        <thead><tr>
          <th>${tplAbtSortHeader('Reason Code','kode')}</th>
          <th>${tplAbtSortHeader('Reason Name','nama')}</th>
          <th style="width:70px;">Ubah</th>
          <th style="width:70px;">Hapus</th>
        </tr></thead>
        <tbody id="abtTbody"></tbody>
      </table></div>
      <div class="table-footer"><div class="pager" id="abtPager"></div><div id="abtTotal"></div></div>
    </div>`;
}

function tplAbtSortHeader(label, field){
  return `<span data-abt-sort="${field}" style="cursor:pointer;display:inline-flex;align-items:center;gap:4px;">${label}<span id="abtSortIcon_${field}" style="color:var(--text-light);font-size:11px;">&#8693;</span></span>`;
}

function tplAbtRows(rows, page, pageSize){
  if(!rows.length) return `<tr><td colspan="4" style="color:var(--text-light);">Tidak ada data Alasan Belum Tertagih</td></tr>`;
  const start = (page-1)*pageSize;
  return rows.slice(start, start+pageSize).map((r) => {
    const idx = DATA.alasanBelumTertagih.indexOf(r);
    return `
    <tr>
      <td><a href="#" class="row-link" data-edit="${idx}" style="color:var(--blue);font-weight:600;">${r.kode}</a></td>
      <td>${r.nama || '-'}</td>
      <td><button class="icon-btn edit" data-edit="${idx}" title="Ubah">${icon('edit',15)}</button></td>
      <td><button class="icon-btn del" data-del="${idx}" title="Hapus">${icon('trash',15)}</button></td>
    </tr>`;
  }).join('');
}

/* Pager windowed maks. 7 nomor halaman — pola sama Badan Usaha. */
function tplAbtPager(page, totalPages){
  if(totalPages <= 1) return `
    <button disabled>First</button>
    <button disabled>Previous</button>
    <button class="active">1</button>
    <button disabled>Next</button>
    <button disabled>Last</button>`;
  const windowSize = 7;
  let start = Math.max(1, page - Math.floor(windowSize/2));
  let end = Math.min(totalPages, start + windowSize - 1);
  start = Math.max(1, end - windowSize + 1);
  let nums = '';
  for(let p = start; p <= end; p++){
    nums += `<button class="${p===page?'active':''}" data-abtpage="${p}">${p}</button>`;
  }
  return `
    <button data-abtpage="1" ${page<=1?'disabled':''}>First</button>
    <button data-abtpage="${Math.max(1,page-1)}" ${page<=1?'disabled':''}>Previous</button>
    ${nums}
    <button data-abtpage="${Math.min(totalPages,page+1)}" ${page>=totalPages?'disabled':''}>Next</button>
    <button data-abtpage="${totalPages}" ${page>=totalPages?'disabled':''}>Last</button>`;
}

function tplAbtModal(mode, row){
  return `
    <div class="modal-box">
      <div class="modal-header"><span>${mode==='edit'?'Ubah Alasan Belum Tertagih':'Tambah Alasan Belum Tertagih'}</span><span class="close" id="modalClose">&times;</span></div>
      <div class="modal-body">
        <div class="form-group">
          <label>Reason Code</label>
          <input type="text" id="fAbtKode" value="${row.kode}" readonly style="background:#f2f3f6;color:var(--text-light);">
        </div>
        <div class="form-group">
          <label>Reason Name</label>
          <input type="text" id="fAbtNama" value="${row.nama||''}" placeholder="Contoh: Janji transfer">
          <div class="form-error" id="fAbtNamaErr">Reason Name wajib diisi</div>
        </div>
      </div>
      <div class="modal-footer">
        <button class="btn-secondary" id="modalCancel">Batal</button>
        <button class="btn-primary" id="modalSave">Simpan</button>
      </div>
    </div>`;
}

function tplAbtDeleteConfirm(row){
  return `
    <div class="modal-box">
      <div class="modal-header"><span>Hapus Alasan Belum Tertagih</span><span class="close" id="modalClose">&times;</span></div>
      <div class="modal-body"><p>Yakin ingin menghapus Alasan <b>${row.kode}</b> — ${row.nama||'-'}?</p></div>
      <div class="modal-footer">
        <button class="btn-secondary" id="modalCancel">Batal</button>
        <button class="btn-danger" id="modalDelete">Hapus</button>
      </div>
    </div>`;
}
