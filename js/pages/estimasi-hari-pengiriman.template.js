/* =========================================================
   TEMPLATE (HTML saja) — Estimasi Hari Pengiriman (Supplier &
   Pembelian > Master & Setting). Semua fungsi di file ini HANYA
   menyusun & mengembalikan markup HTML (string), TIDAK ada
   logic/DOM-binding/data mutation di sini. Logic-nya ada di
   file sebelah: estimasi-hari-pengiriman.js

   Sesuai 2 screenshot MASERP yang dikirim user: "Daftar Estimasi
   Hari Pengiriman" (list: Supplier / Cabang Target / Hari +
   Ubah/Hapus, tombol +Tambah) dan form "Estimasi Hari Pengiriman"
   (full page: Supplier readonly + tombol cari kaca pembesar,
   Cabang Target dropdown, Hari angka; footer Simpan + Batalkan).
   Field Supplier memakai modal picker dari DATA.suppliers (pola
   sama dengan picker Supplier di Purchase Order, ditambah kotak
   pencarian seperti picker Akun GL di Jurnal Pembelian). Pilihan
   Cabang Target diambil dari DATA.cabangMaster (menu Cabang)
   supaya menaut ke master cabang sungguhan, bukan daftar teks
   lepas. Nama supplier di data sample memakai supplier DBM
   sendiri (DATA.suppliers), bukan nama farmasi di screenshot.
========================================================= */
function tplEstimasiHariPengirimanListPage(){
  return `
    <div class="breadcrumb">Home / <b>Estimasi Hari Pengiriman</b></div>
    <div class="card">
      <div class="card-header dark-header"><h3>${icon('alertTriangle',15)} Daftar Estimasi Hari Pengiriman</h3><button class="btn-primary" id="btnAddEhp">${icon('plus',14)} Tambah</button></div>
      <div class="table-toolbar">
        <select><option selected>10</option><option>25</option><option>50</option></select>
        <input type="text" placeholder="Pencarian Global">
      </div>
      <div class="table-wrap"><table>
        <thead><tr><th>Supplier</th><th>Cabang Target</th><th>Hari</th><th>Ubah</th><th>Hapus</th></tr></thead>
        <tbody id="ehpTbody"></tbody>
      </table></div>
      <div class="table-footer"><div class="pager"><button>First</button><button>Previous</button><button class="active">1</button><button>Next</button><button>Last</button></div><div id="ehpTotal"></div></div>
    </div>`;
}

function tplEhpRows(rows){
  if(!rows.length) return `<tr><td colspan="5" style="color:var(--text-light);">Belum ada data estimasi hari pengiriman</td></tr>`;
  return rows.map((r,i)=>`
    <tr>
      <td>${r.supplier}</td>
      <td>${r.cabangTarget}</td>
      <td>${r.hari}</td>
      <td><button class="icon-btn edit" data-edit="${i}" title="Ubah">${icon('edit',15)}</button></td>
      <td><button class="icon-btn del" data-del="${i}" title="Hapus">${icon('trash',15)}</button></td>
    </tr>`).join('');
}

function tplEstimasiHariPengirimanForm(mode, row){
  const isEdit = mode === 'edit';
  const cabangList = DATA.cabangMaster.map(c=>c.nama);
  return `
    <div class="breadcrumb">Home / Estimasi Hari Pengiriman / <b>${isEdit ? 'Ubah' : 'Tambah'}</b></div>
    <div class="card">
      <div class="card-header dark-header"><h3>${icon('edit',15)} Estimasi Hari Pengiriman</h3></div>
      <div class="card-body">
        <table class="field-table" style="max-width:760px;">
          <tr>
            <td class="flabel">Supplier</td>
            <td>
              <div class="input-with-btn">
                <input type="text" id="fEhpSupplier" value="${row.supplier||''}" placeholder="Pilih Supplier" readonly>
                <button type="button" class="icon-btn edit" id="ehpSupplierSearch" title="Cari Supplier">${icon('search',14)}</button>
              </div>
            </td>
          </tr>
          <tr>
            <td class="flabel">Cabang Target</td>
            <td><select id="fEhpCabang">${cabangList.map(c=>`<option ${row.cabangTarget===c?'selected':''}>${c}</option>`).join('')}</select></td>
          </tr>
          <tr>
            <td class="flabel">Hari</td>
            <td><input type="number" id="fEhpHari" value="${row.hari??''}" min="0" placeholder="0" style="text-align:right;"></td>
          </tr>
        </table>
        <div class="form-page-actions">
          <button class="btn-primary" id="ehpSimpan">Simpan</button>
          <a href="#" id="ehpBatalkan" class="link-add" style="margin-top:0;">Batalkan</a>
        </div>
      </div>
    </div>`;
}

function tplEhpSupplierPicker(list){
  return `
    <div class="modal-box" style="max-width:640px;">
      <div class="modal-header"><span>Pilih Supplier</span><span class="close" id="modalClose">&times;</span></div>
      <div class="modal-body">
        <input type="text" id="ehpSupplierPickerSearch" placeholder="Cari kode / nama supplier..." style="width:100%;border:1px solid var(--border);border-radius:6px;padding:8px 10px;font-size:12.8px;margin-bottom:12px;">
        <div class="table-wrap" style="max-height:360px;overflow:auto;">
          <table>
            <thead><tr><th>Kode</th><th>Nama Supplier</th><th></th></tr></thead>
            <tbody id="ehpSupplierPickerBody">${tplEhpSupplierPickerRows(list)}</tbody>
          </table>
        </div>
      </div>
      <div class="modal-footer">
        <button class="btn-secondary" id="modalCancel">Tutup</button>
      </div>
    </div>`;
}

function tplEhpSupplierPickerRows(list){
  if(!list.length) return `<tr><td colspan="3" style="color:var(--text-light);">Tidak ada supplier ditemukan</td></tr>`;
  return list.map(s=>`
    <tr>
      <td>${s.kode}</td>
      <td>${s.nama}</td>
      <td><button class="btn-pick" data-pick-supplier="${s.nama}">Pilih</button></td>
    </tr>`).join('');
}

function tplEhpDeleteConfirm(row){
  return `
    <div class="modal-box">
      <div class="modal-header"><span>Hapus Estimasi Hari Pengiriman</span><span class="close" id="modalClose">&times;</span></div>
      <div class="modal-body"><p>Yakin ingin menghapus estimasi hari pengiriman <b>${row.supplier}</b> &rarr; cabang <b>${row.cabangTarget}</b> (${row.hari} hari)?</p></div>
      <div class="modal-footer">
        <button class="btn-secondary" id="modalCancel">Batal</button>
        <button class="btn-danger" id="modalDelete">Hapus</button>
      </div>
    </div>`;
}

function tplEhpInfoModal(title,text){
  return `
    <div class="modal-box">
      <div class="modal-header"><span>${title}</span><span class="close" id="modalClose">&times;</span></div>
      <div class="modal-body"><p>${text}</p></div>
      <div class="modal-footer">
        <button class="btn-primary" id="modalOk">Mengerti</button>
      </div>
    </div>`;
}
