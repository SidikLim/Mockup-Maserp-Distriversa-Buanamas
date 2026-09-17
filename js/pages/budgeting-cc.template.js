/* =========================================================
   TEMPLATE (HTML saja) — Budgeting Cost Center (General Ledger >
   Master & Setting > Budgeting Cc., page:'budgetingCc', menggantikan
   entry placeholder lama — lihat js/menu.js). Semua fungsi di file
   ini HANYA menyusun & mengembalikan markup HTML (string) atau
   helper murni, TIDAK ada DOM-binding/mutation. Logic-nya di file
   sebelah: budgeting-cc.js.
   NB: closeModal() dipakai bersama, didefinisikan di core.js.

   Dibangun 2026-09-17 sesuai screenshot MASERP "Daftar Budgeting
   Cost Center" yang dikirim user: dark header + tombol Simpan (biru)
   + Tutorial (merah); 2 field filter di atas tabel — Cabang & Cost
   Center, KEDUANYA dipilih lewat picker input+tombol cari (bukan
   <select>, persis gaya field Customer di Sales Order/Akun di Jurnal
   Kas Lain-Lain) — BEDA dari modul Budgeting biasa (page:'budgeting',
   tanpa Cabang/Cost Center, langsung me-list SEMUA akun GL company-
   wide). Cost Center di-scope oleh Cabang yang dipilih
   (DATA.cabangMaster[].costCenterKode — pola cascading sama seperti
   Filter Gudang-by-Cabang di Master Stock Opname), direset tiap
   Cabang diganti — lihat budgeting-cc.js.

   Toolbar tabel: tombol "+Tambah Akun Baru" (menambah 1 baris kosong
   ke draft) + page-size dropdown + Pencarian Global. Tabel: Kode GL
   (baris baru/belum pilih akun -> picker "Pilih Akun" input+tombol
   cari; sudah dipilih -> teks kode biasa, tidak bisa diganti lagi —
   hapus baris & tambah ulang kalau salah pilih, simplifikasi sengaja
   karena baris ini eksplisit ditambahkan manual, beda dari Budgeting
   biasa yang me-list otomatis) / Nama GL (computed live dari
   DATA.akunGL by kode, TIDAK disimpan sebagai field statis) /
   Keterangan (teks bebas per baris) / 12 kolom nominal budget
   JANUARI-DESEMBER / Hapus baris. Tabel scroll horizontal
   (.table-wrap), pager windowed, Total Record = jumlah baris akun
   yang sudah ditambahkan utk kombinasi Cabang+Cost Center terpilih.

   Nilai diedit ke DRAFT dulu (bccDraft, array baris utk kombinasi
   Cabang+CostCenter yang sedang dibuka) supaya awet pindah halaman;
   tombol Simpan menulis draft ke DATA.budgetingCc["kodeCabang|kodeCC"]
   + modal info. Baris yang belum sempat dipilih akunnya dibuang
   otomatis saat Simpan. Data sample: Head Office (00) + CC001 Direksi
   & Corporate Office, 2 akun biaya (Gaji, Listrik & Air) — lihat
   DATA.budgetingCc di js/data.js. */

const BCC_BULAN = ['Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember'];

function tplBccPage(){
  return `
    <div class="breadcrumb">Home / General Ledger / <b>Budgeting Cost Center</b></div>
    <div class="card">
      <div class="card-header dark-header">
        <h3>${icon('alertTriangle',15)} Daftar Budgeting Cost Center</h3>
        <div class="toolbar-actions">
          <button class="btn-primary" id="btnBccSimpan">${icon('save',13)} Simpan</button>
          <button class="btn-danger" id="btnBccTutorial">${icon('card',13)} Tutorial</button>
        </div>
      </div>
      <div style="padding:14px 14px 0;">
        <div class="form-grid">
          <div class="form-group">
            <label>Cabang</label>
            <div class="input-with-btn">
              <input type="text" id="fBccCabang" value="" placeholder="Pilih Cabang" readonly>
              <button type="button" class="icon-btn edit" id="bccCabangSearch" title="Cari Cabang">${icon('search',13)}</button>
            </div>
          </div>
          <div class="form-group">
            <label>Cost Center</label>
            <div class="input-with-btn">
              <input type="text" id="fBccCostCenter" value="" placeholder="Pilih Cost Center" readonly>
              <button type="button" class="icon-btn edit" id="bccCostCenterSearch" title="Cari Cost Center">${icon('search',13)}</button>
            </div>
          </div>
        </div>
      </div>
      <div class="table-toolbar">
        <button class="btn-primary" id="btnBccAddAkun">${icon('plus',13)} Tambah Akun Baru</button>
        <select id="bccPageSize"><option selected>10</option><option>20</option><option>50</option><option>100</option></select>
        <input type="text" id="bccSearch" placeholder="Pencarian Global">
      </div>
      <div class="table-wrap" style="margin:0 14px 0;overflow-x:auto;">
        <table style="min-width:${580 + 12*128 + 64}px;">
          <thead><tr>
            <th style="min-width:180px;">Kode GL</th>
            <th style="min-width:200px;">Nama GL</th>
            <th style="min-width:200px;">Keterangan</th>
            ${BCC_BULAN.map(b=>`<th class="text-right" style="min-width:120px;">${b}</th>`).join('')}
            <th style="width:64px;">Hapus</th>
          </tr></thead>
          <tbody id="bccTbody"></tbody>
        </table>
      </div>
      <div class="table-footer" style="padding:12px 14px;"><div class="pager" id="bccPager"></div><div id="bccTotal"></div></div>
    </div>`;
}

/* `indexedRows` = array {row, idx} — idx adalah index ASLI di bccDraft
   (dibutuhkan supaya wiring input/tombol di baris tetap kena baris yang
   benar walau tabel sedang difilter/di-paginasi — lihat
   bccFilteredIndexedRows() di budgeting-cc.js). */
function tplBccRows(indexedRows){
  if(!indexedRows.length) return `<tr><td colspan="${3 + BCC_BULAN.length + 1}" style="color:var(--text-light);padding:14px;text-align:center;font-weight:600;">Tidak Ada Data</td></tr>`;
  return indexedRows.map(({row, idx}) => {
    const akun = row.kode ? (DATA.akunGL||[]).find(a => a.kode === row.kode) : null;
    const kodeCell = row.kode
      ? `<b>${row.kode}</b>`
      : `<div class="input-with-btn"><input type="text" value="" placeholder="Pilih Akun" readonly><button type="button" class="icon-btn edit" data-bcc-pick="${idx}" title="Cari Akun">${icon('search',13)}</button></div>`;
    const bulan = row.bulan || [];
    return `
    <tr>
      <td>${kodeCell}</td>
      <td>${akun ? akun.nama : ''}</td>
      <td><input type="text" data-bcc-ket="${idx}" value="${row.keterangan||''}" placeholder="Keterangan" style="min-width:190px;"></td>
      ${BCC_BULAN.map((b,mi)=>`<td><input type="number" step="0.01" min="0" data-bcc-val="${idx}|${mi}" value="${bulan[mi]!=null && bulan[mi]!=='' ? bulan[mi] : ''}" style="text-align:right;min-width:106px;"></td>`).join('')}
      <td style="text-align:center;"><button type="button" class="icon-btn del" data-bcc-del="${idx}" title="Hapus Baris">${icon('trash',15)}</button></td>
    </tr>`;
  }).join('');
}

function tplBccPager(page, totalPages){
  if(totalPages <= 1) return `
    <button disabled>First</button><button disabled>Previous</button><button class="active">1</button><button disabled>Next</button><button disabled>Last</button>`;
  const windowSize = 7;
  let start = Math.max(1, page - Math.floor(windowSize/2));
  let end = Math.min(totalPages, start + windowSize - 1);
  start = Math.max(1, end - windowSize + 1);
  let nums = '';
  for(let p = start; p <= end; p++){
    nums += `<button class="${p===page?'active':''}" data-bccpage="${p}">${p}</button>`;
  }
  return `
    <button data-bccpage="1" ${page<=1?'disabled':''}>First</button>
    <button data-bccpage="${Math.max(1,page-1)}" ${page<=1?'disabled':''}>Previous</button>
    ${nums}
    <button data-bccpage="${Math.min(totalPages,page+1)}" ${page>=totalPages?'disabled':''}>Next</button>
    <button data-bccpage="${totalPages}" ${page>=totalPages?'disabled':''}>Last</button>`;
}

function tplBccCabangPicker(list){
  return `
    <div class="modal-box" style="max-width:560px;">
      <div class="modal-header"><span>Pilih Cabang</span><span class="close" id="modalClose">&times;</span></div>
      <div class="modal-body">
        <div class="table-wrap" style="max-height:340px;overflow:auto;"><table>
          <thead><tr><th>Kode</th><th>Nama Cabang</th><th>Kota</th><th></th></tr></thead>
          <tbody>${list.map(c=>`<tr><td>${c.kode}</td><td>${c.nama}</td><td>${c.kota||''}</td><td><button class="btn-pick" data-pick-cabang="${c.kode}">Pilih</button></td></tr>`).join('')}</tbody>
        </table></div>
      </div>
      <div class="modal-footer"><button class="btn-secondary" id="modalCancel">Tutup</button></div>
    </div>`;
}

function tplBccCostCenterPicker(list){
  return `
    <div class="modal-box" style="max-width:600px;">
      <div class="modal-header"><span>Pilih Cost Center</span><span class="close" id="modalClose">&times;</span></div>
      <div class="modal-body">
        <div class="table-wrap" style="max-height:340px;overflow:auto;">
          ${list.length ? `<table>
          <thead><tr><th>Kode</th><th>Nama Cost Center</th><th>Keterangan</th><th></th></tr></thead>
          <tbody>${list.map(c=>`<tr><td>${c.kode}</td><td>${c.nama}</td><td>${c.keterangan||''}</td><td><button class="btn-pick" data-pick-cc="${c.kode}">Pilih</button></td></tr>`).join('')}</tbody>
        </table>` : `<p style="color:var(--text-light);">Cabang ini belum punya Cost Center di master.</p>`}
        </div>
      </div>
      <div class="modal-footer"><button class="btn-secondary" id="modalCancel">Tutup</button></div>
    </div>`;
}

/* Picker Akun GL — salinan lokal pola yang sudah ada di modul jurnal
   (mis. tplJklAkunPicker di jurnal-kas-lain.template.js): search box +
   tabel Kode/Nama/Kategori. Hanya akun jenis 'Detail' yang ditampilkan
   (akun 'Header' tidak bisa dibudget), pola sama tplBgtPage/
   bgtFilteredSortedRows() di budgeting.js. */
function tplBccAkunPicker(list, rowIdx){
  return `
    <div class="modal-box" style="max-width:640px;">
      <div class="modal-header"><span>Pilih Akun GL</span><span class="close" id="modalClose">&times;</span></div>
      <div class="modal-body">
        <input type="text" id="bccAkunPickerSearch" placeholder="Cari kode / nama akun..." style="width:100%;border:1px solid var(--border);border-radius:6px;padding:8px 10px;font-size:12.8px;margin-bottom:12px;">
        <div class="table-wrap" style="max-height:360px;overflow:auto;">
          <table>
            <thead><tr><th>Kode</th><th>Nama Akun</th><th>Kat.</th><th></th></tr></thead>
            <tbody id="bccAkunPickerBody">${tplBccAkunPickerRows(list, rowIdx)}</tbody>
          </table>
        </div>
      </div>
      <div class="modal-footer"><button class="btn-secondary" id="modalCancel">Tutup</button></div>
    </div>`;
}

function tplBccAkunPickerRows(list, rowIdx){
  if(!list.length) return `<tr><td colspan="4" style="color:var(--text-light);">Tidak ada akun ditemukan</td></tr>`;
  return list.map(a=>`
    <tr><td>${a.kode}</td><td>${a.nama}</td><td>${a.kategori}</td><td><button class="btn-pick" data-pick-akun="${a.kode}" data-pick-row="${rowIdx}">Pilih</button></td></tr>`).join('');
}

function tplBccInfoModal(title, text){
  return `
    <div class="modal-box">
      <div class="modal-header"><span>${title}</span><span class="close" id="modalClose">&times;</span></div>
      <div class="modal-body"><p>${text}</p></div>
      <div class="modal-footer"><button class="btn-primary" id="modalOk">Mengerti</button></div>
    </div>`;
}

function tplBccDeleteConfirm(row, akun){
  const label = akun ? `${akun.kode} — ${akun.nama}` : 'baris ini';
  return `
    <div class="modal-box">
      <div class="modal-header"><span>Hapus Baris Budget</span><span class="close" id="modalClose">&times;</span></div>
      <div class="modal-body"><p>Yakin ingin menghapus baris budget akun <b>${label}</b>?</p></div>
      <div class="modal-footer">
        <button class="btn-secondary" id="modalCancel">Batal</button>
        <button class="btn-danger" id="modalDelete">Hapus</button>
      </div>
    </div>`;
}
