/* =========================================================
   TEMPLATE (HTML saja) — Rumus Komisi Salesman (Customer &
   Penjualan > Master & Setting > Rumus Komisi Salesman, page:
   'rumusKomisiSalesman'). Semua fungsi di file ini HANYA
   menyusun & mengembalikan markup HTML (string), TIDAK ada
   logic/DOM-binding di sini. Logic-nya ada di file sebelah:
   rumus-komisi-salesman.js
   NB: closeModal() dipakai bersama, didefinisikan di core.js.

   Dibangun 2026-09-02 sesuai 2 screenshot MASERP yang dikirim
   user: list "Daftar Rencana Komisi Salesman" (kolom Kode Komisi/
   Keterangan dengan ikon sort di kedua header, page-size 10
   default + Pencarian Global, tombol "+Tambah", Ubah/Hapus per
   baris, pager First/Previous/Next/Last — screenshot menampilkan
   0 baris/"Tidak Ada Data" karena instalasi aslinya memang belum
   diisi, TAPI mockup ini SENGAJA diisi 3 baris sample supaya
   fiturnya bisa didemokan, bukan direplikasi persis kondisi
   kosongnya) dan form "Komisi Sales" (header Kode Komisi +
   Keterangan sejajar, lalu tabel 5 baris tetap "Tingkat 1..5"
   masing² dengan Jumlah Minimum/Jumlah Maksimum/Persen, footer
   Simpan + Batalkan, tombol Tutorial merah).

   Field Kode Komisi MANUAL (bukan auto-generate — screenshot form
   menampilkan input kosong polos tanpa pola nomor urut), wajib
   unik, readonly di mode Ubah — pola sama Satuan/Group Produk.
   5 baris Tingkat FIXED (bukan array dinamis yang bisa
   ditambah/dikurangi — screenshot form selalu menampilkan tepat
   5 baris tanpa tombol tambah/hapus baris).

   Jumlah Minimum/Maksimum/Persen ditampilkan format Indonesia 2
   desimal ("10.000.000,00") via rksNum2()/rksParseNum() (helper
   lokal kecil, konsisten pola "salinan lokal" mockup ini — bukan
   reuse rp()/num() yang sudah ada karena keduanya tanpa desimal).
   Kolom Persen diberi suffix "%" visual (span absolute di dalam
   wrapper position:relative) — TIDAK ADA CSS baru untuk ini,
   cukup inline style, konsisten pola beberapa field kecil lain
   di mockup ini (mis. .jp-input inline width override).

   Tabel Tingkat 1-5 di form SENGAJA dibangun dari baris <tr><td>
   polos (BUKAN <thead><th>) supaya tidak kena style global
   `thead th{background:navy;color:#fff}` — screenshot form
   menampilkan header tabel abu-abu terang (bukan navy gelap
   seperti header tabel list biasa), jadi header barisnya dibuat
   manual pakai <td> berlatar `#f7f8fb` (warna sama `.field-table
   td.flabel`) — pola yang sama seperti `.jp-akun-table`/
   `.field-table` yang juga tidak memakai <thead>/<th>.
========================================================= */

const RKS_TINGKAT_LABELS = ['Tingkat 1','Tingkat 2','Tingkat 3','Tingkat 4','Tingkat 5'];

function rksNum2(n){
  return Number(n||0).toLocaleString('id-ID', {minimumFractionDigits:2, maximumFractionDigits:2});
}

function rksParseNum(str){
  if(str === undefined || str === null || str === '') return 0;
  const cleaned = String(str).trim().replace(/\./g,'').replace(',', '.').replace(/[^0-9.\-]/g,'');
  const n = parseFloat(cleaned);
  return isNaN(n) ? 0 : n;
}

function tplRksListPage(){
  return `
    <div class="breadcrumb">Home / <b>Rumus Komisi Salesman</b></div>
    <div class="card">
      <div class="card-header dark-header">
        <h3>${icon('percent',15)} Daftar Rencana Komisi Salesman</h3>
        <button class="btn-primary" id="btnRksAdd">${icon('plus',14)} Tambah</button>
      </div>
      <div class="table-toolbar">
        <select id="rksPageSize"><option selected>10</option><option>25</option><option>50</option></select>
        <input type="text" id="rksSearch" placeholder="Pencarian Global">
      </div>
      <div class="table-wrap"><table>
        <thead><tr>
          <th>${tplRksSortHeader('Kode Komisi','kode')}</th>
          <th>${tplRksSortHeader('Keterangan','keterangan')}</th>
          <th style="width:70px;">Ubah</th>
          <th style="width:70px;">Hapus</th>
        </tr></thead>
        <tbody id="rksTbody"></tbody>
      </table></div>
      <div class="table-footer"><div class="pager" id="rksPager"></div><div id="rksTotal"></div></div>
    </div>`;
}

function tplRksSortHeader(label, field){
  return `<span class="rks-sort-header" data-rks-sort="${field}" style="cursor:pointer;display:inline-flex;align-items:center;gap:4px;">${label}<span id="rksSortIcon_${field}" style="color:var(--text-light);font-size:11px;">&#8693;</span></span>`;
}

function tplRksRows(rows, page, pageSize){
  if(!rows.length) return `<tr><td colspan="4" style="color:var(--text-light);">Tidak Ada Data</td></tr>`;
  const start = (page-1)*pageSize;
  return rows.slice(start, start+pageSize).map((r) => {
    const idx = DATA.rumusKomisiSalesman.indexOf(r);
    return `
    <tr>
      <td><a href="#" class="row-link" data-edit="${idx}" style="color:var(--blue);font-weight:600;">${r.kode}</a></td>
      <td>${r.keterangan || ''}</td>
      <td><button class="icon-btn edit" data-edit="${idx}" title="Ubah">${icon('edit',15)}</button></td>
      <td><button class="icon-btn del" data-del="${idx}" title="Hapus">${icon('trash',15)}</button></td>
    </tr>`;
  }).join('');
}

function tplRksPager(page, totalPages){
  if(totalPages <= 1) return '';
  const windowSize = 7;
  let start = Math.max(1, page - Math.floor(windowSize/2));
  let end = Math.min(totalPages, start + windowSize - 1);
  start = Math.max(1, end - windowSize + 1);
  let nums = '';
  for(let p = start; p <= end; p++){
    nums += `<button class="${p===page?'active':''}" data-rkspage="${p}">${p}</button>`;
  }
  return `
    <button data-rkspage="1" ${page<=1?'disabled':''}>First</button>
    <button data-rkspage="${Math.max(1,page-1)}" ${page<=1?'disabled':''}>Previous</button>
    ${nums}
    <button data-rkspage="${Math.min(totalPages,page+1)}" ${page>=totalPages?'disabled':''}>Next</button>
    <button data-rkspage="${totalPages}" ${page>=totalPages?'disabled':''}>Last</button>`;
}

function tplRksTingkatHeaderRow(){
  return `
    <tr>
      <td style="background:#f7f8fb;border-bottom:1px solid var(--border);width:110px;"></td>
      <td style="background:#f7f8fb;font-weight:600;color:var(--text);padding:10px 14px;border-bottom:1px solid var(--border);">Jumlah Minimum</td>
      <td style="background:#f7f8fb;font-weight:600;color:var(--text);padding:10px 14px;border-bottom:1px solid var(--border);">Jumlah Maksimum</td>
      <td style="background:#f7f8fb;font-weight:600;color:var(--text);padding:10px 14px;border-bottom:1px solid var(--border);width:120px;">Persen</td>
    </tr>`;
}

function tplRksTingkatRow(t, idx){
  return `
    <tr>
      <td style="font-weight:600;color:var(--text);padding:10px 14px;border-bottom:1px solid var(--border);">${RKS_TINGKAT_LABELS[idx]}</td>
      <td style="padding:8px 14px;border-bottom:1px solid var(--border);">
        <input type="text" id="fRksMin_${idx}" value="${rksNum2(t.min)}" style="width:100%;text-align:right;border:1px solid var(--border);border-radius:6px;padding:8px 10px;font-size:12.8px;font-family:inherit;">
      </td>
      <td style="padding:8px 14px;border-bottom:1px solid var(--border);">
        <input type="text" id="fRksMax_${idx}" value="${rksNum2(t.max)}" style="width:100%;text-align:right;border:1px solid var(--border);border-radius:6px;padding:8px 10px;font-size:12.8px;font-family:inherit;">
      </td>
      <td style="padding:8px 14px;border-bottom:1px solid var(--border);">
        <div style="position:relative;">
          <input type="text" id="fRksPersen_${idx}" value="${rksNum2(t.persen)}" style="width:100%;text-align:right;border:1px solid var(--border);border-radius:6px;padding:8px 22px 8px 10px;font-size:12.8px;font-family:inherit;">
          <span style="position:absolute;right:8px;top:50%;transform:translateY(-50%);color:var(--text-light);font-size:11px;">%</span>
        </div>
      </td>
    </tr>`;
}

function tplRksForm(mode, row){
  const isEdit = mode === 'edit';
  return `
    <div class="breadcrumb">Home / Rumus Komisi Salesman / <b>${isEdit ? 'Ubah' : 'Tambah'}</b></div>
    <div class="card">
      <div class="card-header dark-header">
        <h3>${icon('percent',15)} Komisi Sales</h3>
        <button class="btn-danger" id="btnRksTutorial">${icon('card',14)} Tutorial</button>
      </div>
      <div class="card-body">
        <div class="field-pair" style="margin-bottom:4px;">
          <div class="form-group">
            <label>Kode Komisi</label>
            <input type="text" id="fRksKode" value="${row.kode||''}" placeholder="Kode Komisi" ${isEdit?'readonly style="background:#f4f6fb;color:var(--text-light);"':''}>
            <div class="form-error" id="fRksKodeErr">Kode Komisi wajib diisi</div>
          </div>
          <div class="form-group">
            <label>Keterangan</label>
            <input type="text" id="fRksKeterangan" value="${row.keterangan||''}" placeholder="Keterangan">
            <div class="form-error" id="fRksKeteranganErr">Keterangan wajib diisi</div>
          </div>
        </div>
        <table style="width:100%;border-collapse:collapse;margin-bottom:16px;border:1px solid var(--border);">
          ${tplRksTingkatHeaderRow()}
          ${row.tingkat.map((t,i)=>tplRksTingkatRow(t,i)).join('')}
        </table>
        <div class="form-page-actions">
          <button class="btn-primary" id="rksSimpan">Simpan</button>
          <a href="#" id="rksBatalkan" class="link-add" style="margin-top:0;">Batalkan</a>
        </div>
      </div>
    </div>`;
}

function tplRksDeleteConfirm(row){
  return `
    <div class="modal-box">
      <div class="modal-header"><span>Hapus Rumus Komisi Salesman</span><span class="close" id="modalClose">&times;</span></div>
      <div class="modal-body"><p>Yakin ingin menghapus rumus komisi <b>${row.kode}</b> — ${row.keterangan||''}?</p></div>
      <div class="modal-footer">
        <button class="btn-secondary" id="modalCancel">Batal</button>
        <button class="btn-danger" id="modalDelete">Hapus</button>
      </div>
    </div>`;
}

function tplRksInfoModal(title, text){
  return `
    <div class="modal-box">
      <div class="modal-header"><span>${title}</span><span class="close" id="modalClose">&times;</span></div>
      <div class="modal-body"><p>${text}</p></div>
      <div class="modal-footer">
        <button class="btn-primary" id="modalOk">Mengerti</button>
      </div>
    </div>`;
}
