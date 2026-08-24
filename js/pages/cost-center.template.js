/* =========================================================
   TEMPLATE (HTML saja) — Master Cost Center (menu General Ledger >
   Master & Setting > Cost Center, page:'costCenter', menggantikan
   entry placeholder lama — lihat js/menu.js & catatan besar di atas
   DATA.costCenter di js/data.js). Semua fungsi di file ini HANYA
   menyusun & mengembalikan markup HTML (string), TIDAK ada logic/
   DOM-binding/data mutation — logic-nya ada di file sebelah:
   cost-center.js.

   Sesuai screenshot MASERP "Daftar Cost Center": list sederhana CRUD
   (dark header + "+Tambah", toolbar page-size + Pencarian Global,
   kolom Kode Cost Center/Nama Cost Center/Keterangan MASING-MASING
   dengan ikon sort, page-size default "1000" [beda dari kebanyakan
   modul lain yang default 10/20 — cost center jumlahnya sedikit &
   jarang bertambah, wajar defaultnya besar]).

   Sort kolom adalah pola BARU di mockup ini (belum ada modul lain yang
   punya kolom bisa di-sort) — diimplementasikan sederhana: klik header
   toggle asc/desc, ikon panah berubah arah sesuai state aktif (lihat
   ccSortIcon() & wiring-nya di cost-center.js).
========================================================= */

function tplCostCenterPage(){
  return `
    <div class="breadcrumb">Home / <b>Cost Center</b></div>
    <div class="card">
      <div class="card-header dark-header"><h3>${icon('folder',15)} Daftar Cost Center</h3><button class="btn-primary" id="btnCcAdd">${icon('plus',14)} Tambah</button></div>
      <div class="table-toolbar">
        <select id="ccPageSize"><option>10</option><option>20</option><option>50</option><option>100</option><option selected>1000</option></select>
        <input type="text" id="ccSearch" placeholder="Pencarian Global">
      </div>
      <div class="table-wrap"><table>
        <thead><tr>
          <th class="ccsort-th" data-sort-col="kode">Kode Cost Center ${ccSortIcon('kode')}</th>
          <th class="ccsort-th" data-sort-col="nama">Nama Cost Center ${ccSortIcon('nama')}</th>
          <th class="ccsort-th" data-sort-col="keterangan">Keterangan ${ccSortIcon('keterangan')}</th>
          <th>Ubah</th>
          <th>Hapus</th>
        </tr></thead>
        <tbody id="ccTbody"></tbody>
      </table></div>
      <div class="table-footer"><div class="pager"><button>First</button><button>Previous</button><button class="active">1</button><button>Next</button><button>Last</button></div><div id="ccTotal"></div></div>
    </div>`;
}

/* Ikon panah sort — abu-abu netral kalau kolom ybs bukan yang aktif
   di-sort, biru + arah sesuai `ccSortState.dir` kalau sedang aktif.
   `ccSortState` didefinisikan di cost-center.js (state lokal modul
   ini, di-reset setiap kali halaman list dibuka). */
function ccSortIcon(col){
  const active = typeof ccSortState !== 'undefined' && ccSortState.col === col;
  const dir = active ? ccSortState.dir : 'asc';
  const color = active ? 'var(--blue)' : '#b7bcc7';
  return `<span class="ccsort-icon" style="color:${color};">${dir==='asc' ? '&#9650;' : '&#9660;'}</span>`;
}

function tplCcRows(rows){
  if(!rows.length) return `<tr><td colspan="5" style="color:var(--text-light);">Tidak Ada Data</td></tr>`;
  return rows.map(r=>{
    const i = DATA.costCenter.indexOf(r);
    return `
    <tr>
      <td><b style="color:var(--blue);cursor:pointer;" data-edit="${i}">${r.kode}</b></td>
      <td>${r.nama}</td>
      <td>${r.keterangan||''}</td>
      <td><button class="icon-btn edit" data-edit="${i}" title="Ubah">${icon('edit',15)}</button></td>
      <td><button class="icon-btn del" data-del="${i}" title="Hapus">${icon('trash',15)}</button></td>
    </tr>`;
  }).join('');
}

function tplCcModal(mode, row){
  return `
    <div class="modal-box" style="max-width:520px;">
      <div class="modal-header"><span>${mode==='edit'?'Ubah Cost Center':'Tambah Cost Center'}</span><span class="close" id="modalClose">&times;</span></div>
      <div class="modal-body">
        <div class="form-group">
          <label>Kode Cost Center</label>
          <input type="text" id="fCcKode" value="${row.kode}" placeholder="Contoh: CC019" ${mode==='edit'?'disabled':''}>
          <div class="form-error" id="fCcKodeErr">Kode Cost Center wajib diisi</div>
        </div>
        <div class="form-group">
          <label>Nama Cost Center</label>
          <input type="text" id="fCcNama" value="${row.nama||''}" placeholder="Contoh: Gudang Cabang Baru">
        </div>
        <div class="form-group">
          <label>Keterangan</label>
          <input type="text" id="fCcKeterangan" value="${row.keterangan||''}" placeholder="Contoh: Cost Center Operasional Gudang - Cabang Baru">
        </div>
      </div>
      <div class="modal-footer">
        <button class="btn-secondary" id="modalCancel">Batal</button>
        <button class="btn-primary" id="modalSave">Simpan</button>
      </div>
    </div>`;
}

function tplCcDeleteConfirm(row){
  return `
    <div class="modal-box">
      <div class="modal-header"><span>Hapus Cost Center</span><span class="close" id="modalClose">&times;</span></div>
      <div class="modal-body"><p>Yakin ingin menghapus cost center <b>${row.kode}</b> — ${row.nama}?</p></div>
      <div class="modal-footer">
        <button class="btn-secondary" id="modalCancel">Batal</button>
        <button class="btn-danger" id="modalDelete">Hapus</button>
      </div>
    </div>`;
}
