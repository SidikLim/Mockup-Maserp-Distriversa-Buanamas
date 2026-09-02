/* =========================================================
   TEMPLATE (HTML saja) — Alasan Retur (Customer & Penjualan >
   Master & Setting > Alasan Retur, page:'alasanRetur'). Semua
   fungsi di file ini HANYA menyusun & mengembalikan markup HTML
   (string), TIDAK ada logic/DOM-binding di sini. Logic-nya ada
   di file sebelah: alasan-retur.js
   NB: closeModal() dipakai bersama, didefinisikan di core.js.

   Dibangun 2026-09-02 sesuai 2 screenshot MASERP yang dikirim
   user: list "Alasan Retur" (kolom Type [link biru, sortable]/
   Alasan/Ubah/Hapus, page-size default "100", Pencarian Global,
   tombol "+Tambah", Total Record: 30 — SELURUH 30 baris asli
   DIPERTAHANKAN APA ADANYA karena ini daftar kode alasan retur
   generik proses bisnis distribusi FMCG, bukan data rahasia
   instalasi lain, persis precedent Report Center/Alasan Belum
   Tertagih) dan form full-page "Alasan" (breadcrumb + dark-header
   ikon pensil "Alasan", TANPA tombol Tutorial — beda dari Jurnal
   A.R./Komisi Sales yang punya tombol Tutorial merah, field
   "Alasan Tipe" & "Alasan" saja, footer Simpan + Batalkan).

   BEDA STRUKTUR dari Alasan Belum Tertagih (yang juga "Type +
   Nama" tapi Type-nya UNIK per baris & auto-generate kode
   sekuensial "BT01".."BT20" + pakai MODAL): di sini kolom "Type"
   BUKAN kode unik & BUKAN auto-generate — screenshot list
   menunjukkan banyak baris berbagi Type yang SAMA (mis.
   "Kesalahan CS" muncul 2x, "Koreksi Faktur" 5x) — Type di sini
   adalah KATEGORI/GROUPING bebas-teks yang dipilih ATAU DIBUAT
   BARU lewat field "Alasan Tipe" di form (hint di screenshot:
   "Tekan tab apabila untuk menambah baru" — pola combobox
   gaya select2/chosen "pilih existing ATAU ketik baru").
   Direplikasi di mockup ini pakai `<input list>` + `<datalist>`
   HTML native (bukan library JS baru) yang opsinya dihasilkan
   DINAMIS dari seluruh nilai `tipe` unik yang sudah ada di
   `DATA.alasanRetur` (rtaTipeOptions()) — begitu user mengetik
   Tipe baru & Simpan, Tipe itu otomatis muncul jadi opsi di
   datalist pengajuan berikutnya (tanpa perlu tabel master Tipe
   terpisah, sesuai screenshot yang juga tidak menunjukkan menu
   "Master Tipe Alasan Retur" terpisah).

   Form ini FULL PAGE (bukan modal) — disimpulkan dari gaya
   footer "Simpan" (`.btn-primary`) + "Batalkan" (`.link-add`,
   teks biru polos, BUKAN tombol abu-abu ".btn-secondary Batal"
   yang dipakai modal-modal CRUD sederhana lain di mockup ini) —
   pola footer ini PERSIS sama seperti form full-page Jurnal A.R./
   Komisi Sales, bukan pola modal Satuan/Badan Usaha/Alasan Belum
   Tertagih.

   Data 30 baris ditranskrip PERSIS urutan & isi screenshot list
   (yang sudah berurutan alfabetis per Type) — 19 nilai Type unik
   dipakai sebagai isi awal datalist.
========================================================= */

function rtaTipeOptions(){
  const set = new Set(DATA.alasanRetur.map(r => r.tipe));
  return Array.from(set).sort((a,b) => a.localeCompare(b, 'id'));
}

function tplRtaListPage(){
  return `
    <div class="breadcrumb">Home / <b>Alasan Retur</b></div>
    <div class="card">
      <div class="card-header dark-header">
        <h3>${icon('alertTriangle',15)} Alasan Retur</h3>
        <button class="btn-primary" id="btnRtaAdd">${icon('plus',14)} Tambah</button>
      </div>
      <div class="table-toolbar">
        <select id="rtaPageSize"><option>10</option><option>25</option><option>50</option><option selected>100</option></select>
        <input type="text" id="rtaSearch" placeholder="Pencarian Global">
      </div>
      <div class="table-wrap"><table>
        <thead><tr>
          <th>${tplRtaSortHeader('Type','tipe')}</th>
          <th>Alasan</th>
          <th style="width:70px;">Ubah</th>
          <th style="width:70px;">Hapus</th>
        </tr></thead>
        <tbody id="rtaTbody"></tbody>
      </table></div>
      <div class="table-footer"><div class="pager" id="rtaPager"></div><div id="rtaTotal"></div></div>
    </div>`;
}

function tplRtaSortHeader(label, field){
  return `<span class="rta-sort-header" data-rta-sort="${field}" style="cursor:pointer;display:inline-flex;align-items:center;gap:4px;">${label}<span id="rtaSortIcon_${field}" style="color:var(--text-light);font-size:11px;">&#8693;</span></span>`;
}

function tplRtaRows(rows, page, pageSize){
  if(!rows.length) return `<tr><td colspan="4" style="color:var(--text-light);">Tidak ada data Alasan Retur</td></tr>`;
  const start = (page-1)*pageSize;
  return rows.slice(start, start+pageSize).map((r) => {
    const idx = DATA.alasanRetur.indexOf(r);
    return `
    <tr>
      <td><a href="#" class="row-link" data-edit="${idx}" style="color:var(--blue);font-weight:600;">${r.tipe}</a></td>
      <td>${r.alasan || ''}</td>
      <td><button class="icon-btn edit" data-edit="${idx}" title="Ubah">${icon('edit',15)}</button></td>
      <td><button class="icon-btn del" data-del="${idx}" title="Hapus">${icon('trash',15)}</button></td>
    </tr>`;
  }).join('');
}

function tplRtaPager(page, totalPages){
  if(totalPages <= 1) return '';
  const windowSize = 7;
  let start = Math.max(1, page - Math.floor(windowSize/2));
  let end = Math.min(totalPages, start + windowSize - 1);
  start = Math.max(1, end - windowSize + 1);
  let nums = '';
  for(let p = start; p <= end; p++){
    nums += `<button class="${p===page?'active':''}" data-rtapage="${p}">${p}</button>`;
  }
  return `
    <button data-rtapage="1" ${page<=1?'disabled':''}>First</button>
    <button data-rtapage="${Math.max(1,page-1)}" ${page<=1?'disabled':''}>Previous</button>
    ${nums}
    <button data-rtapage="${Math.min(totalPages,page+1)}" ${page>=totalPages?'disabled':''}>Next</button>
    <button data-rtapage="${totalPages}" ${page>=totalPages?'disabled':''}>Last</button>`;
}

function tplRtaForm(mode, row){
  const isEdit = mode === 'edit';
  return `
    <div class="breadcrumb">Home / Alasan Retur / <b>${isEdit ? 'Ubah' : 'Tambah'}</b></div>
    <div class="card">
      <div class="card-header dark-header">
        <h3>${icon('edit',15)} Alasan</h3>
      </div>
      <div class="card-body">
        <div class="form-group" style="max-width:420px;">
          <label>Alasan Tipe</label>
          <input type="text" id="fRtaTipe" list="rtaTipeList" value="${row.tipe||''}" placeholder="PILIH TIPE" style="text-transform:none;">
          <datalist id="rtaTipeList">
            ${rtaTipeOptions().map(t=>`<option value="${t}">`).join('')}
          </datalist>
          <div style="color:var(--text-light);font-size:11px;margin-top:5px;">Tekan tab apabila untuk menambah baru</div>
          <div class="form-error" id="fRtaTipeErr">Alasan Tipe wajib diisi</div>
        </div>
        <div class="form-group" style="max-width:420px;">
          <label>Alasan</label>
          <input type="text" id="fRtaAlasan" value="${row.alasan||''}" placeholder="Alasan">
          <div class="form-error" id="fRtaAlasanErr">Alasan wajib diisi</div>
        </div>
        <div class="form-page-actions">
          <button class="btn-primary" id="rtaSimpan">Simpan</button>
          <a href="#" id="rtaBatalkan" class="link-add" style="margin-top:0;">Batalkan</a>
        </div>
      </div>
    </div>`;
}

function tplRtaDeleteConfirm(row){
  return `
    <div class="modal-box">
      <div class="modal-header"><span>Hapus Alasan Retur</span><span class="close" id="modalClose">&times;</span></div>
      <div class="modal-body"><p>Yakin ingin menghapus alasan retur <b>${row.tipe}</b> — ${row.alasan||''}?</p></div>
      <div class="modal-footer">
        <button class="btn-secondary" id="modalCancel">Batal</button>
        <button class="btn-danger" id="modalDelete">Hapus</button>
      </div>
    </div>`;
}
