/* =========================================================
   TEMPLATE (HTML saja) — Business Centre (Lain-lain)
   Semua fungsi di file ini HANYA menyusun & mengembalikan
   markup HTML (string), TIDAK ada logic/DOM-binding/data
   mutation di sini. Logic-nya ada di file sebelah:
   business-centre.js
========================================================= */
function tplBusinessCentrePage(){
  return `
    <div class="breadcrumb">Home / <b>Business Centre</b></div>
    <div class="card">
      <div class="card-header dark-header"><h3>${icon('building',15)} List Business Centre</h3><button class="btn-primary" id="btnAddBc">${icon('grid',14)} Tambah</button></div>
      <div class="table-toolbar">
        <select><option selected>10</option><option>20</option><option>50</option></select>
        <input type="text" placeholder="Pencarian Global">
      </div>
      <div class="table-wrap"><table>
        <thead><tr><th>Business Centre Code</th><th>Business Centre Name</th><th class="text-right">Nilai DPP Minimum Order</th><th>Ubah</th><th>Hapus</th></tr></thead>
        <tbody id="bcTbody"></tbody>
      </table></div>
      <div class="table-footer"><div class="pager"><button>First</button><button>Previous</button><button class="active">1</button><button>Next</button><button>Last</button></div><div id="bcTotal"></div></div>
    </div>`;
}

function tplBcRows(rows){
  return rows.map((r,i)=>`
    <tr>
      <td>${r.kode}</td>
      <td>${r.nama || 'None'}</td>
      <td class="text-right">${Number(r.dpp||0).toLocaleString('id-ID',{minimumFractionDigits:2,maximumFractionDigits:2})}</td>
      <td><button class="icon-btn edit" data-edit="${i}" title="Ubah">${icon('edit',15)}</button></td>
      <td><button class="icon-btn del" data-del="${i}" title="Hapus">${icon('trash',15)}</button></td>
    </tr>`).join('');
}

function tplBcModal(mode, row){
  return `
    <div class="modal-box" style="max-width:560px;">
      <div class="modal-header"><span>${mode==='edit'?'Ubah Business Centre':'Tambah Business Centre'}</span><span class="close" id="modalClose">&times;</span></div>
      <div class="modal-body">
        <div class="form-group">
          <label>Kode Business Centre</label>
          <input type="text" id="fBcKode" value="${row.kode}" placeholder="Contoh: BSC200" ${mode==='edit'?'disabled':''}>
          <div class="form-error" id="fBcKodeErr">Kode Business Centre wajib diisi</div>
        </div>
        <div class="form-group">
          <label>Nama Business Centre</label>
          <input type="text" id="fBcNama" value="${row.nama||''}" placeholder="Contoh: Consumer Food">
        </div>
        <div class="form-group">
          <label>Nilai DPP Minimum Order</label>
          <input type="text" id="fBcDpp" value="${Number(row.dpp||0).toLocaleString('id-ID',{minimumFractionDigits:2,maximumFractionDigits:2})}" style="text-align:right;">
        </div>
        <div class="form-group">
          <label>Kode Divisi &amp; Nama Divisi</label>
          <div id="bcDivisiWrap"></div>
          <a href="#" id="bcAddRow" class="link-add">${icon('plus',13)} Tambah</a>
        </div>
      </div>
      <div class="modal-footer">
        <button class="btn-secondary" id="modalCancel">Batalkan</button>
        <button class="btn-primary" id="modalSave">Simpan</button>
      </div>
    </div>`;
}

function tplBcDivisiRows(rows){
  return `
    <div class="table-wrap"><table>
      <thead><tr><th>Kode Divisi</th><th>Nama Divisi</th><th></th></tr></thead>
      <tbody>
        ${rows.length ? rows.map((d,i)=>`
          <tr>
            <td><div style="display:flex;gap:6px;"><input type="text" data-bc-kode="${i}" value="${d.kode||''}" readonly><button class="icon-btn edit" data-bc-search="${i}" title="Cari Divisi">${icon('search',14)}</button></div></td>
            <td><input type="text" data-bc-nama="${i}" value="${d.nama||'None'}" readonly></td>
            <td><button class="icon-btn del" data-bc-rm="${i}" title="Hapus baris">${icon('trash',14)}</button></td>
          </tr>`).join('') : '<tr><td colspan="3" style="color:var(--text-light);">Belum ada divisi ditambahkan</td></tr>'}
      </tbody>
    </table></div>`;
}

function tplBcDivisiPicker(divisiList){
  return `
    <div class="modal-box">
      <div class="modal-header"><span>Pilih Divisi</span><span class="close" id="pickerClose">&times;</span></div>
      <div class="modal-body">
        <div class="table-wrap"><table>
          <thead><tr><th>Kode Divisi</th><th>Nama Divisi</th><th></th></tr></thead>
          <tbody>
            ${divisiList.map(d=>`<tr><td>${d.kode}</td><td>${d.nama||'None'}</td><td><button class="btn-secondary btn-pick" data-pick="${d.kode}">Pilih</button></td></tr>`).join('')}
          </tbody>
        </table></div>
      </div>
      <div class="modal-footer"><button class="btn-secondary" id="pickerCancel">Tutup</button></div>
    </div>`;
}

function tplBcDeleteConfirm(row){
  return `
    <div class="modal-box">
      <div class="modal-header"><span>Hapus Business Centre</span><span class="close" id="modalClose">&times;</span></div>
      <div class="modal-body"><p>Yakin ingin menghapus business centre <b>${row.kode}</b> — ${row.nama||'None'}?</p></div>
      <div class="modal-footer">
        <button class="btn-secondary" id="modalCancel">Batal</button>
        <button class="btn-danger" id="modalDelete">Hapus</button>
      </div>
    </div>`;
}
