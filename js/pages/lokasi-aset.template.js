/* =========================================================
   TEMPLATE (HTML saja) — Daftar Lokasi Aset (Aktiva Tetap >
   Master & Setting > Lokasi, page:'lokasiAset'). Semua fungsi
   di file ini HANYA menyusun & mengembalikan markup HTML
   (string), TIDAK ada logic/DOM-binding di sini. Logic-nya ada
   di file sebelah: lokasi-aset.js
   NB: closeModal() dipakai bersama, didefinisikan di core.js.

   Sebelumnya tidak ada menunya sama sekali. Dibangun 2026-08-26
   sesuai screenshot MASERP "Daftar Lokasi Aset" (+Tambah, kolom
   Kode Lokasi/Nama Lokasi/Ubah/Hapus). 4 baris PERSIS screenshot
   (kode "00"/"02"/"03"/"04" — lompat dari "01", quirk data asli
   direproduksi apa adanya). Kode dientri MANUAL, wajib unik,
   readonly di mode Ubah — pola sama Master Divisi/Kategori
   Reordering Sheet. Dipakai sbg referensi field "Lokasi Aset" di
   form Master Fixed Asset (lihat js/pages/fixed-asset.*).
========================================================= */

function tplLokAsetPage(){
  return `
    <div class="breadcrumb">Home / <b>Daftar Lokasi Aset</b></div>
    <div class="card">
      <div class="card-header dark-header"><h3>${icon('building',15)} Daftar Lokasi Aset</h3><button class="btn-primary" id="btnLokAsetAdd">${icon('plus',14)} Tambah</button></div>
      <div class="table-toolbar">
        <select id="lokAsetPageSize"><option selected>20</option><option>50</option><option>100</option></select>
        <input type="text" id="lokAsetSearch" placeholder="Pencarian Global">
      </div>
      <div class="table-wrap"><table>
        <thead><tr><th>Kode Lokasi</th><th>Nama Lokasi</th><th style="width:70px;">Ubah</th><th style="width:70px;">Hapus</th></tr></thead>
        <tbody id="lokAsetTbody"></tbody>
      </table></div>
      <div class="table-footer"><div class="pager"><button>First</button><button>Previous</button><button class="active">1</button><button>Next</button><button>Last</button></div><div id="lokAsetTotal"></div></div>
    </div>`;
}

function tplLokAsetRows(rows){
  if(!rows.length) return `<tr><td colspan="4" style="color:var(--text-light);text-align:center;">Tidak Ada Data</td></tr>`;
  return rows.map((r) => {
    const idx = DATA.lokasiAset.indexOf(r);
    return `
    <tr>
      <td><a href="#" class="row-link" data-edit="${idx}" style="color:var(--blue);font-weight:600;">${r.kode}</a></td>
      <td>${r.nama || 'None'}</td>
      <td><button class="icon-btn edit" data-edit="${idx}" title="Ubah">${icon('edit',15)}</button></td>
      <td><button class="icon-btn del" data-del="${idx}" title="Hapus">${icon('trash',15)}</button></td>
    </tr>`;
  }).join('');
}

function tplLokAsetModal(mode, row){
  return `
    <div class="modal-box">
      <div class="modal-header"><span>${mode==='edit'?'Ubah Lokasi Aset':'Tambah Lokasi Aset'}</span><span class="close" id="modalClose">&times;</span></div>
      <div class="modal-body">
        <div class="form-group">
          <label>Kode Lokasi</label>
          <input type="text" id="fLokAsetKode" value="${row.kode}" ${mode==='edit'?'readonly style="background:#f2f3f6;color:var(--text-light);"':'placeholder="Contoh: 05"'}>
          <div class="form-error" id="fLokAsetKodeErr">Kode Lokasi wajib diisi</div>
        </div>
        <div class="form-group">
          <label>Nama Lokasi</label>
          <input type="text" id="fLokAsetNama" value="${row.nama||''}" placeholder="Contoh: Surabaya">
          <div class="form-error" id="fLokAsetNamaErr">Nama Lokasi wajib diisi</div>
        </div>
      </div>
      <div class="modal-footer">
        <button class="btn-secondary" id="modalCancel">Batal</button>
        <button class="btn-primary" id="modalSave">Simpan</button>
      </div>
    </div>`;
}

function tplLokAsetDeleteConfirm(row){
  return `
    <div class="modal-box">
      <div class="modal-header"><span>Hapus Lokasi Aset</span><span class="close" id="modalClose">&times;</span></div>
      <div class="modal-body"><p>Yakin ingin menghapus lokasi aset <b>${row.kode}</b> — ${row.nama||'None'}?</p></div>
      <div class="modal-footer">
        <button class="btn-secondary" id="modalCancel">Batal</button>
        <button class="btn-danger" id="modalDelete">Hapus</button>
      </div>
    </div>`;
}
