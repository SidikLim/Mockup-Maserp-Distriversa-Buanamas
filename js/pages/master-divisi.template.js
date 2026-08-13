/* =========================================================
   TEMPLATE (HTML saja) — Master Divisi (Lain-lain)
   Semua fungsi di file ini HANYA menyusun & mengembalikan
   markup HTML (string), TIDAK ada logic/DOM-binding/data
   mutation di sini. Logic-nya ada di file sebelah:
   master-divisi.js
========================================================= */
function tplDivisiPage(){
  return `
    <div class="breadcrumb">Home / <b>Master Divisi</b></div>
    <div class="card">
      <div class="card-header dark-header"><h3>${icon('building',15)} Daftar Divisi</h3><button class="btn-primary" id="btnAddDivisi">${icon('grid',14)} Tambah</button></div>
      <div class="table-toolbar">
        <select><option>10</option><option selected>20</option><option>50</option></select>
        <input type="text" placeholder="Pencarian Global">
      </div>
      <div class="table-wrap"><table>
        <thead><tr><th>Kode Divisi</th><th>Nama Divisi</th><th>Ubah</th><th>Hapus</th></tr></thead>
        <tbody id="divisiTbody"></tbody>
      </table></div>
      <div class="table-footer"><div class="pager"><button>First</button><button>Previous</button><button class="active">1</button><button>Next</button><button>Last</button></div><div id="divisiTotal"></div></div>
    </div>`;
}

function tplDivisiRows(rows){
  return rows.map((r,i)=>`
    <tr>
      <td>${r.kode}</td>
      <td>${r.nama || 'None'}</td>
      <td><button class="icon-btn edit" data-edit="${i}" title="Ubah">${icon('edit',15)}</button></td>
      <td><button class="icon-btn del" data-del="${i}" title="Hapus">${icon('trash',15)}</button></td>
    </tr>`).join('');
}

function tplDivisiModal(mode, row){
  return `
    <div class="modal-box">
      <div class="modal-header"><span>${mode==='edit'?'Ubah Divisi':'Tambah Divisi'}</span><span class="close" id="modalClose">&times;</span></div>
      <div class="modal-body">
        <div class="form-group">
          <label>Kode Divisi</label>
          <input type="text" id="fKode" value="${row.kode}" placeholder="Contoh: DVS600">
          <div class="form-error" id="fKodeErr">Kode Divisi wajib diisi</div>
        </div>
        <div class="form-group">
          <label>Nama Divisi</label>
          <input type="text" id="fNama" value="${row.nama||''}" placeholder="Contoh: Business Development">
        </div>
      </div>
      <div class="modal-footer">
        <button class="btn-secondary" id="modalCancel">Batal</button>
        <button class="btn-primary" id="modalSave">Simpan</button>
      </div>
    </div>`;
}

function tplDivisiDeleteConfirm(row){
  return `
    <div class="modal-box">
      <div class="modal-header"><span>Hapus Divisi</span><span class="close" id="modalClose">&times;</span></div>
      <div class="modal-body"><p>Yakin ingin menghapus divisi <b>${row.kode}</b> — ${row.nama||'None'}?</p></div>
      <div class="modal-footer">
        <button class="btn-secondary" id="modalCancel">Batal</button>
        <button class="btn-danger" id="modalDelete">Hapus</button>
      </div>
    </div>`;
}
