/* =========================================================
   TEMPLATE (HTML saja) — Master Status Opname (Customer &
   Penjualan > Master & Setting > Status Opname, page:
   'masterStatusOpname', ditempatkan di menu.js PERSIS di bawah
   "Alasan Retur", sebelum header "Daftar Transaksi"). Semua fungsi
   di file ini HANYA menyusun & mengembalikan markup HTML (string),
   TIDAK ada logic/DOM-binding/data mutation di sini. Logic-nya ada
   di file sebelah: master-status-opname.js
   NB: closeModal() dipakai bersama, didefinisikan di core.js.

   Dibuat 2026-09-18 atas permintaan user LEWAT TEKS (BUKAN dari
   screenshot MASERP): "Transaksi Stock Opname Faktur, Retur & Surat
   jalan. Status Opname saat ini ada pemilihan static ingin ada
   masternya saja, agar bisa ditambah" — sebelumnya "Status Opname"
   di modul Opname Faktur, Retur & S.J. (page:'opnameDokumen') adalah
   array string HARDCODE `OPD_STATUS_LIST` (3 nilai tetap: "Ditemukan
   / Sesuai", "Blank (Belum Diketemukan)", "Selisih / Tidak Sesuai")
   yang tidak bisa ditambah tanpa edit kode. Master baru ini
   menggantikan sumbernya jadi `DATA.statusOpname` (live, bisa
   ditambah/diubah/dinonaktifkan lewat menu ini) — lihat perubahan
   detail di opname-dokumen.template.js/.js (fungsi baru
   `opdStatusList()`/`opdStatusOptions()` menggantikan seluruh
   pemakaian `OPD_STATUS_LIST` lama).

   CATATAN KEPUTUSAN DESAIN (karena tidak ada screenshot acuan):
   1. Pola CRUD modal sederhana (Kode diketik manual, di-uppercase,
      wajib & unik; Tambah/Ubah pakai modal, bukan full-page) DISALIN
      PERSIS dari Master Collector/Badan Usaha — modul master paling
      mirip di mockup ini.
   2. HANYA "Kode" + "Nama Status" + checklist "Aktif" — TIDAK ada
      field tambahan seperti "Area" di Master Collector, karena
      Status Opname murni label pilihan, tidak butuh atribut lain.
   3. Field "Aktif" (`row.aktif`, boolean, default TERCENTANG saat
      Tambah) — HANYA status Aktif yang muncul sbg pilihan BARU di
      dropdown "Status Opname" pada form Opname Faktur, Retur & S.J.
      (pola sama Master Collector: hanya Collector aktif yang bisa
      dipilih di Daftar Tagih Piutang). Status yang SUDAH terlanjur
      dipakai di dokumen opname lama tetap ditampilkan apa adanya
      walau kemudian dinonaktifkan (tidak ada auto-remove retroaktif)
      — lihat `opdStatusOptions()` di opname-dokumen.template.js,
      pola fallback yang sama dengan `psbSatuanOptions()`.
   4. 4 baris data sample (STO01-STO04) di DATA.statusOpname (js/
      data.js): 3 baris pertama PERSIS 3 nilai lama (supaya sample
      data DATA.opnameDokumen yang sudah memakai teks-teks itu tetap
      konsisten), + 1 baris tambahan (STO04 "Rusak / Tidak Terpakai")
      SENGAJA `aktif:false` untuk mendemokan checklist Aktif & filter
      picker — TIDAK dipakai di sample data transaksi manapun.
   5. Kolom ringkasan & 2 laporan cetak pivot-per-status di modul
      Opname Faktur, Retur & S.J. (list "Ditemukan/Blank/Selisih",
      Summary By Salesman By Status, Rekapitulasi) SEBELUMNYA
      hardcode 3 kolom tetap — ikut digeneralisasi mengikuti JUMLAH
      status AKTIF apa adanya (bukan lagi hardcode 3), supaya status
      baru yang ditambah lewat master ini otomatis muncul di
      seluruh laporan tanpa edit kode lagi. Detail lengkap ada di
      header opname-dokumen.template.js.
========================================================= */

function tplSopListPage(){
  return `
    <div class="breadcrumb">Home / <b>Status Opname</b></div>
    <div class="card">
      <div class="card-header dark-header">
        <h3>${icon('check',15)} Daftar Status Opname</h3>
        <button class="btn-primary" id="btnSopAdd">${icon('plus',14)} Tambah</button>
      </div>
      <div class="table-toolbar">
        <select id="sopPageSize"><option selected>10</option><option>25</option><option>50</option></select>
        <input type="text" id="sopSearch" placeholder="Pencarian Global">
      </div>
      <div class="table-wrap"><table>
        <thead><tr>
          <th>${tplSopSortHeader('Kode Status','kode')}</th>
          <th>${tplSopSortHeader('Nama Status','nama')}</th>
          <th style="width:100px;">Status</th>
          <th style="width:70px;">Ubah</th>
          <th style="width:70px;">Hapus</th>
        </tr></thead>
        <tbody id="sopTbody"></tbody>
      </table></div>
      <div class="table-footer"><div class="pager" id="sopPager"></div><div id="sopTotal"></div></div>
    </div>`;
}

function tplSopSortHeader(label, field){
  return `<span class="sop-sort-header" data-sop-sort="${field}" style="cursor:pointer;display:inline-flex;align-items:center;gap:4px;">${label}<span id="sopSortIcon_${field}" style="color:var(--text-light);font-size:11px;">&#8693;</span></span>`;
}

function tplSopRows(rows, page, pageSize){
  if(!rows.length) return `<tr><td colspan="5" style="color:var(--text-light);">Tidak ada data Status Opname</td></tr>`;
  const start = (page-1)*pageSize;
  return rows.slice(start, start+pageSize).map((r) => {
    const idx = DATA.statusOpname.indexOf(r);
    const aktif = r.aktif !== false;
    return `
    <tr>
      <td><a href="#" class="row-link" data-edit="${idx}" style="color:var(--blue);font-weight:600;">${r.kode}</a></td>
      <td>${r.nama || '-'}</td>
      <td><span class="status-pill ${aktif?'status-paid':'status-overdue'}">${aktif?'Aktif':'Non Aktif'}</span></td>
      <td><button class="icon-btn edit" data-edit="${idx}" title="Ubah">${icon('edit',15)}</button></td>
      <td><button class="icon-btn del" data-del="${idx}" title="Hapus">${icon('trash',15)}</button></td>
    </tr>`;
  }).join('');
}

/* Pager windowed maks. 7 nomor halaman — pola sama Master Collector/
   Badan Usaha. */
function tplSopPager(page, totalPages){
  if(totalPages <= 1) return '';
  const windowSize = 7;
  let start = Math.max(1, page - Math.floor(windowSize/2));
  let end = Math.min(totalPages, start + windowSize - 1);
  start = Math.max(1, end - windowSize + 1);
  let nums = '';
  for(let p = start; p <= end; p++){
    nums += `<button class="${p===page?'active':''}" data-soppage="${p}">${p}</button>`;
  }
  return `
    <button data-soppage="1" ${page<=1?'disabled':''}>First</button>
    <button data-soppage="${Math.max(1,page-1)}" ${page<=1?'disabled':''}>Previous</button>
    ${nums}
    <button data-soppage="${Math.min(totalPages,page+1)}" ${page>=totalPages?'disabled':''}>Next</button>
    <button data-soppage="${totalPages}" ${page>=totalPages?'disabled':''}>Last</button>`;
}

function tplSopModal(mode, row){
  const isEdit = mode === 'edit';
  return `
    <div class="modal-box">
      <div class="modal-header"><span>${isEdit?'Ubah Status Opname':'Tambah Status Opname'}</span><span class="close" id="modalClose">&times;</span></div>
      <div class="modal-body">
        <div class="form-group">
          <label>Kode Status</label>
          <input type="text" id="fSopKode" value="${row.kode||''}" maxlength="10" ${isEdit?'readonly style="background:#f2f3f6;color:var(--text-light);"':'placeholder="Contoh: STO05" style="text-transform:uppercase;"'}>
          <div class="form-error" id="fSopKodeErr">Kode Status wajib diisi</div>
        </div>
        <div class="form-group">
          <label>Nama Status</label>
          <input type="text" id="fSopNama" value="${row.nama||''}" placeholder="Contoh: Ditemukan / Sesuai">
          <div class="form-error" id="fSopNamaErr">Nama Status wajib diisi</div>
        </div>
        <div class="form-group">
          <label style="display:flex;align-items:center;gap:6px;font-weight:400;">
            <input type="checkbox" id="fSopAktif" ${row.aktif!==false?'checked':''} style="width:auto;"> Aktif
          </label>
        </div>
      </div>
      <div class="modal-footer">
        <button class="btn-secondary" id="modalCancel">Batal</button>
        <button class="btn-primary" id="modalSave">Simpan</button>
      </div>
    </div>`;
}

function tplSopDeleteConfirm(row){
  return `
    <div class="modal-box">
      <div class="modal-header"><span>Hapus Status Opname</span><span class="close" id="modalClose">&times;</span></div>
      <div class="modal-body"><p>Yakin ingin menghapus Status Opname <b>${row.kode}</b> — ${row.nama||'-'}?</p></div>
      <div class="modal-footer">
        <button class="btn-secondary" id="modalCancel">Batal</button>
        <button class="btn-danger" id="modalDelete">Hapus</button>
      </div>
    </div>`;
}
