/* =========================================================
   TEMPLATE (HTML saja) — Supplier Group (Supplier & Pembelian)
   Semua fungsi di file ini HANYA menyusun & mengembalikan
   markup HTML (string), TIDAK ada logic/DOM-binding/data
   mutation di sini. Logic-nya ada di file sebelah:
   supplier-group.js
========================================================= */
function tplSupplierGroupPage(){
  return `
    <div class="breadcrumb">Home / <b>Supplier Group</b></div>
    <div class="card">
      <div class="card-header dark-header"><h3>${icon('building',15)} List Supplier Group</h3><button class="btn-primary" id="btnAddSg">${icon('grid',14)} Tambah</button></div>
      <div class="table-toolbar">
        <select><option selected>10</option><option>20</option><option>50</option></select>
        <input type="text" placeholder="Pencarian Global">
      </div>
      <div class="table-wrap"><table>
        <thead><tr><th>Kode Group</th><th>Nama Group</th><th class="text-right">Diskon #1</th><th class="text-right">Diskon #2</th><th>Ubah</th><th>Hapus</th></tr></thead>
        <tbody id="sgTbody"></tbody>
      </table></div>
      <div class="table-footer"><div class="pager"><button>First</button><button>Previous</button><button class="active">1</button><button>Next</button><button>Last</button></div><div id="sgTotal"></div></div>
    </div>`;
}

function tplSgRows(rows){
  return rows.map((r,i)=>`
    <tr>
      <td>${r.kode}</td>
      <td>${r.nama || 'None'}</td>
      <td class="text-right">${Number(r.diskon1||0).toLocaleString('id-ID',{minimumFractionDigits:2,maximumFractionDigits:2})}%</td>
      <td class="text-right">${Number(r.diskon2||0).toLocaleString('id-ID',{minimumFractionDigits:2,maximumFractionDigits:2})}%</td>
      <td><button class="icon-btn edit" data-edit="${i}" title="Ubah">${icon('edit',15)}</button></td>
      <td><button class="icon-btn del" data-del="${i}" title="Hapus">${icon('trash',15)}</button></td>
    </tr>`).join('');
}

function tplSgModal(mode, row){
  return `
    <div class="modal-box">
      <div class="modal-header"><span>${mode==='edit'?'Ubah Supplier Group':'Tambah Supplier Group'}</span><span class="close" id="modalClose">&times;</span></div>
      <div class="modal-body">
        <div class="form-group">
          <label>Kode Group</label>
          <input type="text" id="fSgKode" value="${row.kode}" placeholder="Contoh: VND003" ${mode==='edit'?'disabled':''}>
          <div class="form-error" id="fSgKodeErr">Kode Group wajib diisi</div>
        </div>
        <div class="form-group">
          <label>Nama Group</label>
          <input type="text" id="fSgNama" value="${row.nama||''}" placeholder="Contoh: RETAILER">
        </div>
        <div class="form-group">
          <label>Diskon #1 (%)</label>
          <input type="text" id="fSgDisc1" value="${Number(row.diskon1||0).toLocaleString('id-ID',{minimumFractionDigits:2,maximumFractionDigits:2})}" style="text-align:right;">
        </div>
        <div class="form-group">
          <label>Diskon #2 (%)</label>
          <input type="text" id="fSgDisc2" value="${Number(row.diskon2||0).toLocaleString('id-ID',{minimumFractionDigits:2,maximumFractionDigits:2})}" style="text-align:right;">
        </div>
      </div>
      <div class="modal-footer">
        <button class="btn-secondary" id="modalCancel">Batal</button>
        <button class="btn-primary" id="modalSave">Simpan</button>
      </div>
    </div>`;
}

function tplSgDeleteConfirm(row){
  return `
    <div class="modal-box">
      <div class="modal-header"><span>Hapus Supplier Group</span><span class="close" id="modalClose">&times;</span></div>
      <div class="modal-body"><p>Yakin ingin menghapus supplier group <b>${row.kode}</b> — ${row.nama||'None'}?</p></div>
      <div class="modal-footer">
        <button class="btn-secondary" id="modalCancel">Batal</button>
        <button class="btn-danger" id="modalDelete">Hapus</button>
      </div>
    </div>`;
}
