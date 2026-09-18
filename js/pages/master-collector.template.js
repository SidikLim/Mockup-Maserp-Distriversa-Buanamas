/* =========================================================
   TEMPLATE (HTML saja) — Master Collector (Customer & Penjualan >
   Master & Setting > Collector, page:'masterCollector', ditempatkan
   di menu.js PERSIS di bawah "Salesman"). Semua fungsi di file ini
   HANYA menyusun & mengembalikan markup HTML (string), TIDAK ada
   logic/DOM-binding/data mutation di sini. Logic-nya ada di file
   sebelah: master-collector.js
   NB: closeModal() dipakai bersama, didefinisikan di core.js.

   Dibuat 2026-09-18 atas permintaan user LEWAT TEKS (BUKAN dari
   screenshot MASERP): "Tambahkan menu master collector, dengan
   posisi menu di bawah menu master salesman, dan sertakan field
   Checklist Aktif, lalu pada menu transaksi Daftar Tagih Piutang,
   pada saat memilih salesman, dapat juga memilih collector, jadi
   dibagian captionnya bisa ditambahkan opsi pemilihan mau salesman
   atau collector".

   CATATAN KEPUTUSAN DESAIN (karena tidak ada screenshot acuan):
   1. Pola CRUD modal sederhana (Kode diketik manual, di-uppercase,
      wajib & unik; Tambah/Ubah pakai modal, bukan full-page) DISALIN
      PERSIS dari Badan Usaha/Cost Center — modul master paling mirip
      di mockup ini yang juga cuma "Kode + Nama" inti.
   2. Field "Area" ditambahkan (di luar permintaan literal user) karena
      Collector akan jadi salah satu SUMBER picker "Salesman/Collector"
      di form Daftar Tagih Piutang (lihat js/pages/tagihan-piutang.*),
      dan picker itu sudah lama menampilkan kolom Nama+Area (awalnya
      dari OFFICE + DATA.salesman yang punya field `area`). Supaya
      kolom Area tetap terisi rapi saat sumbernya Collector, master
      ini ikut punya field Area (bebas teks, opsional, boleh dikosongi).
   3. Field "Checklist Aktif" (`row.aktif`, boolean, default TERCENTANG
      saat Tambah) — SESUAI PERMINTAAN USER PERSIS. Ditampilkan di form
      sebagai checkbox polos (pola sama seperti checkbox "Aktif" di
      Master Gudang/"Kuota Aktif" Promotion), dan di kolom list sebagai
      status-pill Aktif (hijau)/Non Aktif (merah) — pola pill yang sama
      dipakai Sales Office & fmtCell() generik.
   4. HANYA collector `aktif===true` yang muncul di picker Daftar Tagih
      Piutang saat tipe "Collector" dipilih (baris "OFFICE" tetap selalu
      tampil sebagai baris built-in pertama, tidak tunduk checklist ini)
      — lihat openDtpKolektorPicker() di tagihan-piutang.js.
   5 sample data (COL01-COL05) ada di DATA.collector (js/data.js), 1 di
   antaranya (COL05) SENGAJA `aktif:false` untuk demo pill merah & filter
   picker.
========================================================= */

function tplColListPage(){
  return `
    <div class="breadcrumb">Home / <b>Collector</b></div>
    <div class="card">
      <div class="card-header dark-header">
        <h3>${icon('users',15)} Daftar Collector</h3>
        <button class="btn-primary" id="btnColAdd">${icon('plus',14)} Tambah</button>
      </div>
      <div class="table-toolbar">
        <select id="colPageSize"><option selected>10</option><option>25</option><option>50</option></select>
        <input type="text" id="colSearch" placeholder="Pencarian Global">
      </div>
      <div class="table-wrap"><table>
        <thead><tr>
          <th>${tplColSortHeader('Kode Collector','kode')}</th>
          <th>${tplColSortHeader('Nama Collector','nama')}</th>
          <th>Area</th>
          <th style="width:100px;">Status</th>
          <th style="width:70px;">Ubah</th>
          <th style="width:70px;">Hapus</th>
        </tr></thead>
        <tbody id="colTbody"></tbody>
      </table></div>
      <div class="table-footer"><div class="pager" id="colPager"></div><div id="colTotal"></div></div>
    </div>`;
}

function tplColSortHeader(label, field){
  return `<span class="col-sort-header" data-col-sort="${field}" style="cursor:pointer;display:inline-flex;align-items:center;gap:4px;">${label}<span id="colSortIcon_${field}" style="color:var(--text-light);font-size:11px;">&#8693;</span></span>`;
}

function tplColRows(rows, page, pageSize){
  if(!rows.length) return `<tr><td colspan="6" style="color:var(--text-light);">Tidak ada data Collector</td></tr>`;
  const start = (page-1)*pageSize;
  return rows.slice(start, start+pageSize).map((r) => {
    const idx = DATA.collector.indexOf(r);
    const aktif = r.aktif !== false;
    return `
    <tr>
      <td><a href="#" class="row-link" data-edit="${idx}" style="color:var(--blue);font-weight:600;">${r.kode}</a></td>
      <td>${r.nama || '-'}</td>
      <td>${r.area || '-'}</td>
      <td><span class="status-pill ${aktif?'status-paid':'status-overdue'}">${aktif?'Aktif':'Non Aktif'}</span></td>
      <td><button class="icon-btn edit" data-edit="${idx}" title="Ubah">${icon('edit',15)}</button></td>
      <td><button class="icon-btn del" data-del="${idx}" title="Hapus">${icon('trash',15)}</button></td>
    </tr>`;
  }).join('');
}

/* Pager windowed maks. 7 nomor halaman — pola sama Badan Usaha/Bentuk
   Sediaan. */
function tplColPager(page, totalPages){
  if(totalPages <= 1) return '';
  const windowSize = 7;
  let start = Math.max(1, page - Math.floor(windowSize/2));
  let end = Math.min(totalPages, start + windowSize - 1);
  start = Math.max(1, end - windowSize + 1);
  let nums = '';
  for(let p = start; p <= end; p++){
    nums += `<button class="${p===page?'active':''}" data-colpage="${p}">${p}</button>`;
  }
  return `
    <button data-colpage="1" ${page<=1?'disabled':''}>First</button>
    <button data-colpage="${Math.max(1,page-1)}" ${page<=1?'disabled':''}>Previous</button>
    ${nums}
    <button data-colpage="${Math.min(totalPages,page+1)}" ${page>=totalPages?'disabled':''}>Next</button>
    <button data-colpage="${totalPages}" ${page>=totalPages?'disabled':''}>Last</button>`;
}

function tplColModal(mode, row){
  const isEdit = mode === 'edit';
  return `
    <div class="modal-box">
      <div class="modal-header"><span>${isEdit?'Ubah Collector':'Tambah Collector'}</span><span class="close" id="modalClose">&times;</span></div>
      <div class="modal-body">
        <div class="form-group">
          <label>Kode Collector</label>
          <input type="text" id="fColKode" value="${row.kode||''}" maxlength="10" ${isEdit?'readonly style="background:#f2f3f6;color:var(--text-light);"':'placeholder="Contoh: COL06" style="text-transform:uppercase;"'}>
          <div class="form-error" id="fColKodeErr">Kode Collector wajib diisi</div>
        </div>
        <div class="form-group">
          <label>Nama Collector</label>
          <input type="text" id="fColNama" value="${row.nama||''}" placeholder="Nama Collector">
          <div class="form-error" id="fColNamaErr">Nama Collector wajib diisi</div>
        </div>
        <div class="form-group">
          <label>Area</label>
          <input type="text" id="fColArea" value="${row.area||''}" placeholder="Contoh: Jakarta">
        </div>
        <div class="form-group">
          <label style="display:flex;align-items:center;gap:6px;font-weight:400;">
            <input type="checkbox" id="fColAktif" ${row.aktif!==false?'checked':''} style="width:auto;"> Aktif
          </label>
        </div>
      </div>
      <div class="modal-footer">
        <button class="btn-secondary" id="modalCancel">Batal</button>
        <button class="btn-primary" id="modalSave">Simpan</button>
      </div>
    </div>`;
}

function tplColDeleteConfirm(row){
  return `
    <div class="modal-box">
      <div class="modal-header"><span>Hapus Collector</span><span class="close" id="modalClose">&times;</span></div>
      <div class="modal-body"><p>Yakin ingin menghapus Collector <b>${row.kode}</b> — ${row.nama||'-'}?</p></div>
      <div class="modal-footer">
        <button class="btn-secondary" id="modalCancel">Batal</button>
        <button class="btn-danger" id="modalDelete">Hapus</button>
      </div>
    </div>`;
}
