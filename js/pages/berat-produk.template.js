/* =========================================================
   TEMPLATE (HTML saja) — Master Berat Produk (Persediaan Barang
   > Master & Setting > Berat Produk, key page:'beratProduk').
   Semua fungsi di file ini HANYA menyusun & mengembalikan markup
   HTML (string) atau helper murni, TIDAK ada DOM-binding/data
   mutation di sini. Logic-nya ada di file sebelah:
   berat-produk.js

   Sesuai 2 screenshot MASERP yang dikirim user:
   1) List "Master Berat Produk": tombol Tambah + "Import Master
      Berat Produk" (teal, modal upload mockup); TANPA chip
      periode; kolom Kode Barang (link -> form Ubah) / Nama
      Barang / Konversi / Berat dalam Kg / Volume m3 / Ubah /
      Hapus. NB kolom "Volume m3" pada layar asli menampilkan
      nilai P x L x T dalam cm3 (mis. 8804.336 utk barang yang di
      form volumenya 0,0088 m3) — quirk MASERP asli, DIREPLIKASI
      apa adanya.
   2) Form "+ Berat Produk" (layout label kiri ala field-table):
      Kode Barang (picker DATA.items, readonly + search) -> Nama
      Barang otomatis (readonly); Konversi isi dalam Box; Berat
      (suffix "Kg"); Panjang / Lebar / Tinggi (suffix "cm",
      desimal diperbolehkan — layar asli malah menolak desimal di
      Tinggi karena step=1, quirk itu TIDAK direplikasi);
      Volume (readonly, suffix "m3") = P x L x T / 1.000.000,
      recalc LIVE. Footer: Simpan / Batalkan.
   Data: DATA.beratProduk (satu baris per kode barang — barang
   yang sudah punya berat tidak muncul lagi di picker Tambah). */

function mbpNum(n, dec){
  return Number(n||0).toLocaleString('id-ID', {minimumFractionDigits:dec!=null?dec:0, maximumFractionDigits:dec!=null?dec:4});
}
/* Nilai kolom "Volume m3" list = P x L x T (cm3), quirk layar asli. */
function mbpVolCm3(r){ return Number(r.panjang||0) * Number(r.lebar||0) * Number(r.tinggi||0); }
function mbpVolM3(r){ return mbpVolCm3(r) / 1000000; }
function mbpNamaBarang(kode){ const b = DATA.items.find(x => x.kode === kode); return b ? b.nama : ''; }

/* =====================================================================
   LIST PAGE — "Master Berat Produk"
===================================================================== */
function tplBeratProdukListPage(){
  return `
    <div class="breadcrumb">Home / Persediaan Barang / <b>Berat Produk</b></div>
    <div class="card">
      <div class="card-header dark-header">
        <h3>${icon('box',15)} Master Berat Produk</h3>
        <div class="toolbar-actions">
          <button class="btn-primary" id="btnMbpAdd">${icon('plus',14)} Tambah</button>
          <button class="btn-teal" id="btnMbpImport">${icon('refreshCw',14)} Import Master Berat Produk</button>
        </div>
      </div>
      <div class="table-toolbar">
        <select id="mbpPageSize"><option selected>10</option><option>25</option><option>50</option></select>
        <input type="text" id="mbpSearch" placeholder="Pencarian Global">
      </div>
      <div class="table-wrap"><table>
        <thead><tr>
          <th style="width:140px;">Kode Barang</th>
          <th>Nama Barang</th>
          <th style="width:110px;">Konversi</th>
          <th style="width:140px;">Berat dalam Kg</th>
          <th style="width:180px;">Volume m3</th>
          <th style="width:60px;">Ubah</th>
          <th style="width:64px;">Hapus</th>
        </tr></thead>
        <tbody id="mbpTbody"></tbody>
      </table></div>
      <div class="table-footer"><div class="pager"><button>First</button><button>Previous</button><button class="active">1</button><button>Next</button><button>Last</button></div><div id="mbpTotal"></div></div>
    </div>`;
}

function tplMbpRows(rows){
  if(!rows.length) return `<tr><td colspan="7" style="color:var(--text-light);padding:14px;">Belum ada data berat produk — klik Tambah.</td></tr>`;
  return rows.map((r,i)=>`
    <tr>
      <td><button class="link-pick" data-mbp-link="${i}">${r.kode}</button></td>
      <td>${mbpNamaBarang(r.kode)}</td>
      <td>${mbpNum(r.konversi)}</td>
      <td>${mbpNum(r.berat, null)}</td>
      <td>${mbpVolCm3(r).toLocaleString('id-ID', {maximumFractionDigits:4})}</td>
      <td><button class="icon-btn edit" data-mbp-edit="${i}" title="Ubah">${icon('edit',15)}</button></td>
      <td><button class="icon-btn del" data-mbp-del="${i}" title="Hapus">${icon('trash',15)}</button></td>
    </tr>`).join('');
}

/* =====================================================================
   FORM (full page) — "+ Berat Produk"
===================================================================== */
function tplMbpForm(mode, row){
  const isAdd = mode === 'add';
  const suffix = (txt) => `<span style="display:inline-flex;align-items:center;padding:0 10px;border:1px solid var(--border);border-left:none;border-radius:0 6px 6px 0;background:var(--bg);font-size:12.5px;color:var(--text-light);">${txt}</span>`;
  const numInput = (id, val, unit, dis) => `
    <div style="display:flex;max-width:240px;">
      <input type="number" step="0.01" min="0" id="${id}" value="${val!=null?val:''}" ${dis?'disabled':''} style="text-align:right;border-radius:6px 0 0 6px;flex:1;">
      ${suffix(unit)}
    </div>`;
  return `
    <div class="breadcrumb">Home / Berat Produk / <b>${isAdd ? 'Tambah' : 'Ubah'}</b></div>
    <div class="card">
      <div class="card-header dark-header">
        <h3>${icon('plus',15)} Berat Produk</h3>
      </div>
      <div class="card-body">
        <table class="field-table" style="max-width:1100px;">
          <tr><td class="flabel" style="width:170px;">Kode Barang</td><td>
            <div class="input-with-btn" style="max-width:760px;">
              <input type="text" id="fMbpKode" value="${row.kode||''}" placeholder="Pilih Barang" readonly>
              ${isAdd ? `<button type="button" class="icon-btn edit" id="mbpItemSearch" title="Cari Barang">${icon('search',13)}</button>` : ''}
            </div>
          </td></tr>
          <tr><td class="flabel">Nama Barang</td><td><input type="text" id="fMbpNama" value="${mbpNamaBarang(row.kode)||''}" disabled style="max-width:760px;"></td></tr>
          <tr><td class="flabel">Konversi isi dalam Box</td><td><input type="number" min="0" id="fMbpKonversi" value="${row.konversi!=null?row.konversi:1}" style="max-width:240px;text-align:right;"></td></tr>
          <tr><td class="flabel">Berat</td><td>${numInput('fMbpBerat', row.berat, 'Kg')}</td></tr>
          <tr><td class="flabel">Panjang</td><td>
            <div style="display:flex;gap:26px;flex-wrap:wrap;align-items:center;">
              ${numInput('fMbpPanjang', row.panjang, 'cm')}
              <span style="font-size:12.5px;color:var(--text);font-weight:600;">Lebar</span>
              ${numInput('fMbpLebar', row.lebar, 'cm')}
              <span style="font-size:12.5px;color:var(--text);font-weight:600;">Tinggi</span>
              ${numInput('fMbpTinggi', row.tinggi, 'cm')}
            </div>
          </td></tr>
          <tr><td class="flabel">Volume</td><td>
            <div style="display:flex;max-width:240px;">
              <input type="text" id="fMbpVolume" value="${mbpVolM3(row).toLocaleString('id-ID',{minimumFractionDigits:4, maximumFractionDigits:4})}" disabled style="text-align:right;border-radius:6px 0 0 6px;flex:1;">
              ${suffix('m3')}
            </div>
          </td></tr>
        </table>
      </div>
      <div class="card-footer" style="display:flex;gap:10px;justify-content:flex-end;align-items:center;padding:14px 20px;border-top:1px solid var(--border);">
        <button type="button" class="btn-primary" id="mbpSimpan">Simpan</button>
        <a href="#" id="mbpBatalkan" class="link-add" style="margin-top:0;">Batalkan</a>
      </div>
    </div>`;
}

/* Modal Import Master Berat Produk — mockup upload. */
function tplMbpImportModal(){
  return `
    <div class="modal-box" style="max-width:520px;">
      <div class="modal-header"><span>${icon('refreshCw',15)} Import Master Berat Produk</span><span class="close" id="modalClose">&times;</span></div>
      <div class="modal-body">
        <p style="margin-bottom:10px;">Upload file Excel master berat produk (kolom: Kode Barang, Konversi, Berat Kg, Panjang, Lebar, Tinggi).</p>
        <div style="border:2px dashed var(--border);border-radius:8px;padding:26px;text-align:center;color:var(--text-light);font-size:12.5px;">
          ${icon('file',26)}<br>Tarik file ke sini atau klik untuk memilih file.<br><span style="font-size:11.5px;">(Mockup — pada aplikasi asli akan membuka dialog upload + template unduhan.)</span>
        </div>
      </div>
      <div class="modal-footer">
        <button class="btn-secondary" id="modalCancel">Batal</button>
        <button class="btn-primary" id="mbpImportOk">Import</button>
      </div>
    </div>`;
}

/* Picker Barang — hanya barang yang BELUM punya data berat. */
function tplMbpItemPicker(list){
  return `
    <div class="modal-box" style="max-width:720px;">
      <div class="modal-header"><span>Pilih Barang</span><span class="close" id="modalClose">&times;</span></div>
      <div class="modal-body">
        <input type="text" id="mbpItemPickerSearch" placeholder="Cari kode / nama barang..." style="width:100%;border:1px solid var(--border);border-radius:6px;padding:8px 10px;font-size:12.8px;margin-bottom:12px;">
        <div class="table-wrap" style="max-height:360px;overflow:auto;">
          <table>
            <thead><tr><th>Kode</th><th>Nama Barang</th><th>Satuan</th><th></th></tr></thead>
            <tbody id="mbpItemPickerBody">${tplMbpItemPickerRows(list)}</tbody>
          </table>
        </div>
      </div>
      <div class="modal-footer"><button class="btn-secondary" id="modalCancel">Tutup</button></div>
    </div>`;
}

function tplMbpItemPickerRows(list){
  if(!list.length) return `<tr><td colspan="4" style="color:var(--text-light);">Semua barang sudah memiliki data berat produk.</td></tr>`;
  return list.map(b=>`
    <tr><td>${b.kode}</td><td>${b.nama}</td><td>${b.satuan||''}</td><td><button class="btn-pick" data-mbp-pick-item="${b.kode}">Pilih</button></td></tr>`).join('');
}

function tplMbpDeleteConfirm(row){
  return `
    <div class="modal-box">
      <div class="modal-header"><span>Hapus Berat Produk</span><span class="close" id="modalClose">&times;</span></div>
      <div class="modal-body"><p>Yakin ingin menghapus data berat produk <b>${row.kode}</b> — ${mbpNamaBarang(row.kode)}?</p></div>
      <div class="modal-footer">
        <button class="btn-secondary" id="modalCancel">Batal</button>
        <button class="btn-danger" id="modalDelete">Hapus</button>
      </div>
    </div>`;
}

function tplMbpInfoModal(title,text){
  return `
    <div class="modal-box">
      <div class="modal-header"><span>${title}</span><span class="close" id="modalClose">&times;</span></div>
      <div class="modal-body"><p>${text}</p></div>
      <div class="modal-footer"><button class="btn-primary" id="modalOk">Mengerti</button></div>
    </div>`;
}
