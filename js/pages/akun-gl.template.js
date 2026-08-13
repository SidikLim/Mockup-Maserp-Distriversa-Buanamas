/* =========================================================
   TEMPLATE (HTML saja) — Akun GL (General Ledger > Master & Setting)
   Semua fungsi di file ini HANYA menyusun & mengembalikan
   markup HTML (string), TIDAK ada logic/DOM-binding/data
   mutation di sini. Logic-nya ada di file sebelah:
   akun-gl.js

   Sesuai contoh screenshot "Daftar General Ledger" (Chart of
   Accounts) MASERP yang dikirim user: daftar Akun GL punya CRUD
   penuh (Tambah/Ubah/Hapus), beda dari GL Kategori yang cuma bisa
   Ubah. Baris "Header" (kelompok akun, misal AKTIVA LANCAR) tampil
   dengan latar biru muda + tebal untuk membedakan dari baris
   "Detail" (akun sungguhan), meniru gaya grid legacy MASERP.
========================================================= */
function tplAkunGLPage(){
  return `
    <div class="breadcrumb">Home / General Ledger / <b>Akun GL</b></div>
    <div class="card">
      <div class="card-header dark-header">
        <h3>${icon('book',15)} Daftar General Ledger</h3>
        <div class="toolbar-actions">
          <button class="btn-outline" id="btnAkGenerate">${icon('settings',14)} Generate Ak.</button>
          <button class="btn-outline" id="btnAkImport">${icon('file',14)} Import</button>
          <button class="btn-outline" id="btnAkImportNS">${icon('file',14)} Import Neraca Saldo</button>
          <button class="btn-outline" id="btnAkCopy">${icon('plus',14)} Copy</button>
          <button class="btn-primary" id="btnAkAdd">${icon('grid',14)} Tambah</button>
        </div>
      </div>
      <div class="table-toolbar">
        <select><option selected>25</option><option>50</option><option>100</option></select>
        <input type="text" placeholder="Pencarian Global">
      </div>
      <div class="table-wrap"><table>
        <thead><tr>
          <th>Kode Ak.</th>
          <th>Nama Ak.</th>
          <th>Kat.</th>
          <th>Tipe</th>
          <th>Jenis</th>
          <th class="text-right">Saldo Awal</th>
          <th class="text-right">Debet</th>
          <th class="text-right">Kredit</th>
          <th class="text-right">Saldo Akhir</th>
          <th>Ubah</th>
          <th>Hapus</th>
        </tr></thead>
        <tbody id="akGlTbody"></tbody>
      </table></div>
      <div class="table-footer"><div class="pager"><button>First</button><button>Previous</button><button class="active">1</button><button>Next</button><button>Last</button></div><div id="akGlTotal"></div></div>
    </div>`;
}

function tplAkGlRows(rows){
  return rows.map((r,i)=>{
    const isHeader = r.jenis === 'Header';
    return `
    <tr class="${isHeader ? 'gl-account-header' : ''}">
      <td>${r.kode}</td>
      <td>${r.nama}</td>
      <td>${r.kategori}</td>
      <td>${r.tipe}</td>
      <td>${r.jenis}</td>
      <td class="text-right">${num(r.saldoAwal)}</td>
      <td class="text-right">${num(r.debet)}</td>
      <td class="text-right">${num(r.kredit)}</td>
      <td class="text-right">${num(r.saldoAkhir)}</td>
      <td><button class="icon-btn edit" data-edit="${i}" title="Ubah">${icon('edit',15)}</button></td>
      <td><button class="icon-btn del" data-del="${i}" title="Hapus">${icon('trash',15)}</button></td>
    </tr>`;
  }).join('');
}

function tplAkGlKategoriOptions(selected){
  return DATA.glKategori.map(k=>`<option value="${k.kode}" ${k.kode===selected?'selected':''}>${k.kode} — ${k.nama}</option>`).join('');
}

function tplAkGlModal(mode, row){
  return `
    <div class="modal-box" style="max-width:480px;">
      <div class="modal-header"><span>${mode==='edit'?'Ubah Akun GL':'Tambah Akun GL'}</span><span class="close" id="modalClose">&times;</span></div>
      <div class="modal-body">
        <div class="form-group">
          <label>Kode Akun</label>
          <input type="text" id="fAkKode" value="${row.kode}" placeholder="Contoh: 5210006" ${mode==='edit'?'disabled':''}>
          <div class="form-error" id="fAkKodeErr">Kode Akun wajib diisi</div>
        </div>
        <div class="form-group">
          <label>Nama Akun</label>
          <input type="text" id="fAkNama" value="${row.nama||''}" placeholder="Contoh: Biaya Perjalanan Dinas">
          <div class="form-error" id="fAkNamaErr">Nama Akun wajib diisi</div>
        </div>
        <div class="form-grid">
          <div class="form-group">
            <label>Kategori</label>
            <select id="fAkKategori">${tplAkGlKategoriOptions(row.kategori)}</select>
          </div>
          <div class="form-group">
            <label>Tipe</label>
            <select id="fAkTipe">
              <option value="D" ${row.tipe==='D'?'selected':''}>D — Debet</option>
              <option value="K" ${row.tipe==='K'?'selected':''}>K — Kredit</option>
            </select>
          </div>
          <div class="form-group">
            <label>Jenis</label>
            <select id="fAkJenis">
              <option value="Header" ${row.jenis==='Header'?'selected':''}>Header</option>
              <option value="Detail" ${row.jenis==='Detail'?'selected':''}>Detail</option>
            </select>
          </div>
          <div class="form-group">
            <label>Saldo Awal</label>
            <input type="text" id="fAkSaldoAwal" value="${num(row.saldoAwal||0)}" style="text-align:right;">
          </div>
          <div class="form-group">
            <label>Debet</label>
            <input type="text" id="fAkDebet" value="${num(row.debet||0)}" style="text-align:right;">
          </div>
          <div class="form-group">
            <label>Kredit</label>
            <input type="text" id="fAkKredit" value="${num(row.kredit||0)}" style="text-align:right;">
          </div>
        </div>
      </div>
      <div class="modal-footer">
        <button class="btn-secondary" id="modalCancel">Batal</button>
        <button class="btn-primary" id="modalSave">Simpan</button>
      </div>
    </div>`;
}

function tplAkGlDeleteConfirm(row){
  return `
    <div class="modal-box">
      <div class="modal-header"><span>Hapus Akun GL</span><span class="close" id="modalClose">&times;</span></div>
      <div class="modal-body"><p>Yakin ingin menghapus akun <b>${row.kode}</b> — ${row.nama}?</p></div>
      <div class="modal-footer">
        <button class="btn-secondary" id="modalCancel">Batal</button>
        <button class="btn-danger" id="modalDelete">Hapus</button>
      </div>
    </div>`;
}

function tplAkGlInfoModal(title, text){
  return `
    <div class="modal-box">
      <div class="modal-header"><span>${title}</span><span class="close" id="modalClose">&times;</span></div>
      <div class="modal-body"><p>${text}</p></div>
      <div class="modal-footer">
        <button class="btn-primary" id="modalOk">Mengerti</button>
      </div>
    </div>`;
}
