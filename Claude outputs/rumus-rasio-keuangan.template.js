/* =========================================================
   TEMPLATE (HTML saja) — Rumus Rasio Keuangan (General Ledger >
   Master & Setting > Rumus Rasio Keuangan, page:
   'rumusRasioKeuangan'). Semua fungsi di file ini HANYA menyusun
   & mengembalikan markup HTML (string), TIDAK ada logic/DOM-
   binding di sini. Logic-nya ada di file sebelah:
   rumus-rasio-keuangan.js
   NB: closeModal() dipakai bersama, didefinisikan di core.js.

   Dibangun 2026-09-17 sesuai 2 screenshot MASERP yang dikirim
   user: list "Daftar Rasio" (header gelap, tombol "+Add",
   dropdown page-size default 10, kotak cari placeholder "Global
   Search", kolom "No." / "Nama Ratio" (sort) / "Type Ratio"
   (sort) / "Edit" / "Delete", pager First/Previous/Next/Last —
   SEMUA label ini SENGAJA disalin persis dalam bahasa Inggris
   dari screenshot walau sebagian besar modul lain di mockup ini
   pakai label Indonesia; screenshot menampilkan 0 baris/"Tidak
   Ada Data"/"Total Record: 0" karena instalasi asli memang belum
   diisi, TAPI mockup ini SENGAJA diisi 3 baris sample (Current
   Ratio, Debt to Equity Ratio, Gross Profit Margin — lihat
   DATA.rumusRasioKeuangan di js/data.js) supaya fiturnya bisa
   didemokan, bukan direplikasi persis kondisi kosongnya — pola
   yang sama persis seperti precedent Rumus Komisi Salesman) dan
   form "+ Ratio" (header gelap TANPA tombol tambahan lain — beda
   dari Rumus Komisi Salesman yang punya tombol Tutorial merah;
   field Nama Ratio, Tipe Ratio (dropdown), Rumus Ratio (dengan 2
   teks bantuan persis dari screenshot), Target Ratio (%), lalu
   tabel dinamis Kode/Nama/Akun/Hapus yang bisa ditambah/dikurangi
   bebas lewat "+Tambah Item Baru", footer Simpan (biru) + Cancel
   (link, bahasa Inggris persis screenshot)).

   CATATAN KEPUTUSAN DESAIN (tidak semuanya tampak eksplisit di
   screenshot, didokumentasikan supaya jelas ini pilihan sadar):

   1) RRK_TIPE_LIST (opsi dropdown Tipe Ratio) — screenshot HANYA
      menunjukkan nilai default terpilih "Current Ratio", tidak
      pernah membuka dropdown-nya. Daftar 11 nama rasio keuangan
      standar di bawah adalah ASUMSI supaya dropdown-nya tidak
      kosong/hanya 1 opsi.

   2) Field "Rumus Ratio" HANYA disimpan sebagai teks bebas
      (string, format bebas asal pakai titik koma sesuai 2 teks
      bantuan di screenshot) — mockup ini TIDAK mem-parsing atau
      menghitung nilai rasio sungguhan dari rumus ini terhadap
      saldo GL asli (modul ini adalah MASTER/setup, bukan modul
      laporan) — pola yang sama seperti Rumus Komisi Salesman yang
      juga cuma menyimpan rate/rumus, tidak menghitung terhadap
      transaksi sungguhan.

   3) Kode di tabel item (variabel formula, mis. "ca"/"cl")
      divalidasi LANGSUNG saat mengetik — karakter selain huruf
      dibuang otomatis (lihat rrkSanitizeKode() di file .js) —
      sesuai teks bantuan screenshot "Wajib menggunakan huruf!
      Tidak boleh angka dan tanda baca." Huruf TIDAK dipaksa
      kapital (beda dari Kode Satuan di modul Satuan).

   4) Akun picker (kolom "Akun" di tabel item) SENGAJA menampilkan
      akun 'Header' MAUPUN 'Detail' dari DATA.akunGL — beda dari
      picker Akun GL di Budgeting Cc yang HANYA menampilkan
      'Detail' (karena budget dialokasikan ke akun transaksi).
      Variabel rumus rasio (mis. "Total Aktiva Lancar") jauh lebih
      alami dipetakan ke akun Header/rollup kategori (mis.
      1100000 AKTIVA LANCAR) daripada ke 1 baris Detail sembarang
      — jadi kedua jenis akun sengaja ditampilkan di picker ini.

   5) Field "Nama" di tabel item TETAP kolom teks bebas terpisah
      (BUKAN computed/readonly dari Akun yang dipilih) — persis
      tata letak screenshot yang menaruh Nama sebagai input polos
      di kolom sendiri, terpisah dari picker Akun. Untuk kenyamanan,
      begitu Akun dipilih & field Nama masih kosong, Nama akan
      diisi otomatis dari nama akun terpilih (TAPI tetap bisa
      diubah bebas sesudahnya, tidak pernah ditimpa paksa).
========================================================= */

const RRK_TIPE_LIST = [
  'Current Ratio',
  'Quick Ratio (Acid Test Ratio)',
  'Cash Ratio',
  'Debt to Asset Ratio',
  'Debt to Equity Ratio',
  'Gross Profit Margin',
  'Net Profit Margin',
  'Return on Assets (ROA)',
  'Return on Equity (ROE)',
  'Inventory Turnover Ratio',
  'Receivable Turnover Ratio',
];

function tplRrkListPage(){
  return `
    <div class="breadcrumb">Home / <b>Rumus Rasio Keuangan</b></div>
    <div class="card">
      <div class="card-header dark-header">
        <h3>${icon('percent',15)} Daftar Rasio</h3>
        <button class="btn-primary" id="btnRrkAdd">${icon('plus',14)} Add</button>
      </div>
      <div class="table-toolbar">
        <select id="rrkPageSize"><option selected>10</option><option>25</option><option>50</option></select>
        <input type="text" id="rrkSearch" placeholder="Global Search">
      </div>
      <div class="table-wrap"><table>
        <thead><tr>
          <th style="width:60px;">No.</th>
          <th>${tplRrkSortHeader('Nama Ratio','namaRatio')}</th>
          <th>${tplRrkSortHeader('Type Ratio','tipeRatio')}</th>
          <th style="width:70px;">Edit</th>
          <th style="width:70px;">Delete</th>
        </tr></thead>
        <tbody id="rrkTbody"></tbody>
      </table></div>
      <div class="table-footer"><div class="pager" id="rrkPager"></div><div id="rrkTotal"></div></div>
    </div>`;
}

function tplRrkSortHeader(label, field){
  return `<span class="rrk-sort-header" data-rrk-sort="${field}" style="cursor:pointer;display:inline-flex;align-items:center;gap:4px;">${label}<span id="rrkSortIcon_${field}" style="color:var(--text-light);font-size:11px;">&#8693;</span></span>`;
}

function tplRrkRows(rows, page, pageSize){
  if(!rows.length) return `<tr><td colspan="5" style="color:var(--text-light);">Tidak Ada Data</td></tr>`;
  const start = (page-1)*pageSize;
  return rows.slice(start, start+pageSize).map((r, i) => {
    const idx = DATA.rumusRasioKeuangan.indexOf(r);
    return `
    <tr>
      <td>${start+i+1}</td>
      <td><a href="#" class="row-link" data-edit="${idx}" style="color:var(--blue);font-weight:600;">${r.namaRatio}</a></td>
      <td>${r.tipeRatio || ''}</td>
      <td><button class="icon-btn edit" data-edit="${idx}" title="Edit">${icon('edit',15)}</button></td>
      <td><button class="icon-btn del" data-del="${idx}" title="Delete">${icon('trash',15)}</button></td>
    </tr>`;
  }).join('');
}

function tplRrkPager(page, totalPages){
  if(totalPages <= 1) return '';
  const windowSize = 7;
  let start = Math.max(1, page - Math.floor(windowSize/2));
  let end = Math.min(totalPages, start + windowSize - 1);
  start = Math.max(1, end - windowSize + 1);
  let nums = '';
  for(let p = start; p <= end; p++){
    nums += `<button class="${p===page?'active':''}" data-rrkpage="${p}">${p}</button>`;
  }
  return `
    <button data-rrkpage="1" ${page<=1?'disabled':''}>First</button>
    <button data-rrkpage="${Math.max(1,page-1)}" ${page<=1?'disabled':''}>Previous</button>
    ${nums}
    <button data-rrkpage="${Math.min(totalPages,page+1)}" ${page>=totalPages?'disabled':''}>Next</button>
    <button data-rrkpage="${totalPages}" ${page>=totalPages?'disabled':''}>Last</button>`;
}

function tplRrkTipeOptions(selected){
  return RRK_TIPE_LIST.map(t=>`<option value="${t}" ${t===selected?'selected':''}>${t}</option>`).join('');
}

function rrkAkunLabel(kode){
  if(!kode) return '';
  const a = (DATA.akunGL||[]).find(x=>x.kode===kode);
  return a ? `${a.kode} - ${a.nama}` : kode;
}

function tplRrkForm(mode, draft){
  const isEdit = mode === 'edit';
  return `
    <div class="breadcrumb">Home / Rumus Rasio Keuangan / <b>${isEdit ? 'Ubah' : 'Tambah'}</b></div>
    <div class="card">
      <div class="card-header dark-header">
        <h3>${icon('percent',15)} + Ratio</h3>
      </div>
      <div class="card-body">
        <div class="form-group">
          <label>Nama Ratio</label>
          <input type="text" id="fRrkNamaRatio" value="${draft.namaRatio||''}" placeholder="Nama Ratio">
          <div class="form-error" id="fRrkNamaRatioErr">Nama Ratio wajib diisi</div>
        </div>
        <div class="form-group">
          <label>Tipe Ratio</label>
          <select id="fRrkTipeRatio">${tplRrkTipeOptions(draft.tipeRatio)}</select>
        </div>
        <div class="form-group">
          <label>Rumus Ratio</label>
          <input type="text" id="fRrkRumus" value="${draft.rumus||''}" placeholder="ca; /; cl;">
          <div class="form-error" id="fRrkRumusErr">Rumus Ratio wajib diisi</div>
          <div style="font-size:11.5px;color:var(--text-light);margin-top:4px;">Contoh Rumus : ca; /; cl;</div>
          <div style="font-size:11.5px;color:var(--red);margin-top:2px;">Wajib menggunakan titik koma (;) setelah menginput kode atau operator rumus !</div>
        </div>
        <div class="form-group" style="max-width:220px;">
          <label>Target Ratio (%)</label>
          <div style="position:relative;">
            <input type="text" id="fRrkTarget" value="${draft.target||0}" style="width:100%;text-align:right;padding-right:26px;border:1px solid var(--border);border-radius:6px;">
            <span style="position:absolute;right:10px;top:50%;transform:translateY(-50%);color:var(--text-light);font-size:11px;">%</span>
          </div>
        </div>
        <table class="field-table" style="width:100%;border-collapse:collapse;margin:16px 0 6px;border:1px solid var(--border);">
          <tbody>
            <tr>
              <td class="flabel" style="width:50px;">No</td>
              <td class="flabel">Kode</td>
              <td class="flabel">Nama</td>
              <td class="flabel">Akun</td>
              <td class="flabel" style="width:70px;">Hapus</td>
            </tr>
          </tbody>
          <tbody id="rrkItemsBody"></tbody>
        </table>
        <a href="#" id="rrkAddItem" class="link-add">${icon('plus',13)} Tambah Item Baru</a>
        <div class="form-page-actions" style="margin-top:18px;">
          <button class="btn-primary" id="rrkSimpan">Simpan</button>
          <a href="#" id="rrkCancel" class="link-add" style="margin-top:0;">Cancel</a>
        </div>
      </div>
    </div>`;
}

function tplRrkItemRows(items){
  if(!items.length) return `<tr><td colspan="5" style="color:var(--text-light);padding:10px 14px;">Belum ada item.</td></tr>`;
  return items.map((it, i) => `
    <tr>
      <td style="padding:8px 14px;border-bottom:1px solid var(--border);">${i+1}</td>
      <td style="padding:8px 14px;border-bottom:1px solid var(--border);">
        <input type="text" data-rrk-kode="${i}" value="${it.kode||''}" placeholder="Kode" style="width:100%;border:1px solid var(--border);border-radius:6px;padding:8px 10px;font-size:12.8px;font-family:inherit;">
        <div style="font-size:10.5px;color:var(--text-light);margin-top:3px;">Wajib menggunakan huruf! Tidak boleh angka dan tanda baca.</div>
      </td>
      <td style="padding:8px 14px;border-bottom:1px solid var(--border);">
        <input type="text" data-rrk-nama="${i}" value="${it.nama||''}" style="width:100%;border:1px solid var(--border);border-radius:6px;padding:8px 10px;font-size:12.8px;font-family:inherit;">
      </td>
      <td style="padding:8px 14px;border-bottom:1px solid var(--border);">
        <div class="input-with-btn">
          <input type="text" readonly value="${rrkAkunLabel(it.akunKode)}" placeholder="Pilih Account">
          <button type="button" class="icon-btn edit" data-rrk-pick="${i}" title="Pilih Account">${icon('search',13)}</button>
        </div>
      </td>
      <td style="padding:8px 14px;border-bottom:1px solid var(--border);">
        <button class="icon-btn del" data-rrk-delitem="${i}" title="Hapus">${icon('trash',15)}</button>
      </td>
    </tr>`).join('');
}

function tplRrkAkunPicker(list){
  return `
    <div class="modal-box" style="max-width:640px;">
      <div class="modal-header"><span>Pilih Account</span><span class="close" id="modalClose">&times;</span></div>
      <div class="modal-body">
        <div class="table-toolbar">
          <input type="text" id="rrkAkunPickerSearch" placeholder="Cari Kode / Nama Akun">
        </div>
        <div class="table-wrap" style="max-height:360px;overflow:auto;">
          <table>
            <thead><tr><th>Kode</th><th>Nama</th><th>Jenis</th></tr></thead>
            <tbody id="rrkAkunPickerBody">${tplRrkAkunPickerRows(list)}</tbody>
          </table>
        </div>
      </div>
      <div class="modal-footer">
        <button class="btn-secondary" id="modalCancel">Batal</button>
      </div>
    </div>`;
}

function tplRrkAkunPickerRows(list){
  if(!list.length) return `<tr><td colspan="3" style="color:var(--text-light);">Akun tidak ditemukan</td></tr>`;
  return list.map(a => `
    <tr class="${a.jenis==='Header' ? 'gl-account-header' : ''}">
      <td><button class="link-pick" data-pick-akun="${a.kode}">${a.kode}</button></td>
      <td><button class="link-pick" data-pick-akun="${a.kode}">${a.nama}</button></td>
      <td>${a.jenis}</td>
    </tr>`).join('');
}

function tplRrkDeleteConfirm(row){
  return `
    <div class="modal-box">
      <div class="modal-header"><span>Hapus Rasio</span><span class="close" id="modalClose">&times;</span></div>
      <div class="modal-body"><p>Yakin ingin menghapus rasio <b>${row.namaRatio}</b> — ${row.tipeRatio||''}?</p></div>
      <div class="modal-footer">
        <button class="btn-secondary" id="modalCancel">Batal</button>
        <button class="btn-danger" id="modalDelete">Hapus</button>
      </div>
    </div>`;
}

function tplRrkInfoModal(title, text){
  return `
    <div class="modal-box">
      <div class="modal-header"><span>${title}</span><span class="close" id="modalClose">&times;</span></div>
      <div class="modal-body"><p>${text}</p></div>
      <div class="modal-footer">
        <button class="btn-primary" id="modalOk">Mengerti</button>
      </div>
    </div>`;
}
