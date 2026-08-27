/* =========================================================
   TEMPLATE (HTML saja) — Master Stock Opname (Persediaan Barang >
   Daftar Transaksi > Master Stock Opname, page:'masterStockOpname').
   Logic-nya ada di file sebelah: master-stock-opname.js

   Sebelumnya placeholder murni. Dibangun 2026-08-27 sesuai 4
   screenshot MASERP yang dikirim user ("Master Stock Opname List",
   form "Master Stock Opname" dengan tabel rincian barang lebar,
   modal "Daftar Fisik Inventory" yang dibuka dari tombol header
   "Laporan Pembantu Stock Opname") + 1 PDF contoh "CEK FISIK
   INVENTORY" (dokumen kosong utk dibawa fisik ke gudang, per
   Gudang > per Kategori, kolom Hasil Hitung kosong utk diisi
   tangan). PERMINTAAN EKSPLISIT user: form Tambah ditambah 2 filter
   BARU sebelum tombol "Generate" — Filter Gudang (opsi mengikuti
   Cabang yang dipilih, dari DATA.gudang) & Filter Item Barang
   (opsional, reuse openPersediaanPicker() shared) — supaya barang
   yang bisa di-stock-opname-kan benar2 dibatasi oleh kedua filter
   itu (BUKAN dekoratif). Filter Gudang ini TIDAK ADA secara eksplisit
   di screenshot form aslinya (screenshot cuma punya Cabang), jadi
   field ini murni tambahan atas permintaan user, ditempatkan
   persis sebelum tombol Generate — pola sama seperti "Filter
   Persediaan Barang" di Reordering Sheet.

   SUMBER DATA rincian barang: "Generate" membaca DATA.persediaan
   (BUKAN DATA.items) — difilter kodeGudang (WAJIB, dari Filter
   Gudang) + kodeBarang (opsional, dari Filter Item Barang) — kolom
   Sistem = qtyPhysical, HNA = harga jual barang (DATA.items[].harga),
   Qty Counted diinisialisasi = Sistem (persis kondisi screenshot,
   semua Selisih 0 sebelum benar2 dihitung ulang fisik), Selisih &
   Total (=Selisih x HNA) dihitung LIVE (computed, bukan disimpan)
   setiap Qty Counted diubah — pola sama seperti banyak field
   computed lain di mockup ini (Nilai Susut Fixed Asset, dst.).

   Batch Number & Exp Date SENGAJA selalu "-" — mockup ini (katalog
   FMCG kering DBM) tidak memodelkan data batch/tanggal kadaluarsa
   per lot di level DATA.persediaan/DATA.items (beda dari PDF contoh
   yang datanya dari instalasi farmasi lain yang genuinely melacak
   batch per infus/obat) — konsisten precedent field2 lain yang
   SELALU "-" krn tidak ada sumber datanya (Kemasan di cetak Invoice,
   Dimensi di Reordering Sheet).

   Tombol "Laporan Pembantu Stock Opname" (header list) membuka modal
   "Daftar Fisik Inventory" (Gudang/Kode Kategori/Inventory/Stock
   Per-Tanggal/checkbox "Cetak Transaksi Bernilai Nol") -> Show
   Report / Show Report Pdf SAMA2 membuka tab cetak dokumen KOSONG
   "CEK FISIK INVENTORY" (kolom Hasil Hitung kosong, utk dibawa fisik
   ke gudang SEBELUM data-nya dientri ke form Master Stock Opname di
   atas) — dikelompokkan per Gudang lalu per Kategori, pola window.open
   +document.write persis fitur cetak Invoice/FA-08/dst. */

const MSO_CABANG_LIST = ['Head Office','Surabaya','Bandung','Tangerang','Medan','Makassar','Semarang','Sidoarjo'];
const MSO_CABANG_CODE = {'Head Office':'HO','Surabaya':'SBY','Bandung':'BDG','Tangerang':'TGR','Medan':'MDN','Makassar':'MKS','Semarang':'SMG','Sidoarjo':'SDA'};

function tplMsoListPage(){
  return `
    <div class="breadcrumb">Home / <b>Master Stock Opname</b></div>
    <div class="card">
      <div class="card-header dark-header">
        <h3>${icon('clipboard',15)} Master Stock Opname List</h3>
        <div class="toolbar-actions">
          <button class="btn-teal" id="btnMsoLaporanBantu">Laporan Pembantu Stock Opname</button>
          <select id="msoPeriodeChip" style="max-width:150px;">
            <option>Juni 2026</option><option>Juli 2026</option><option selected>Agustus 2026</option>
          </select>
          <button class="btn-primary" id="btnMsoAdd">${icon('plus',14)} Tambah</button>
        </div>
      </div>
      <div class="table-toolbar">
        <select id="msoPageSize"><option selected>10</option><option>25</option><option>50</option></select>
        <input type="text" id="msoSearch" placeholder="Pencarian Global">
      </div>
      <div class="table-wrap"><table>
        <thead><tr>
          <th>No. Bukti</th>
          <th>Tgl Transaksi</th>
          <th>Periode</th>
          <th>Keterangan</th>
          <th>Lihat</th>
          <th>Cetak</th>
          <th>Ubah</th>
          <th>Hapus</th>
        </tr></thead>
        <tbody id="msoTbody"></tbody>
      </table></div>
      <div class="table-footer"><div class="pager" id="msoPager"></div><div id="msoTotal"></div></div>
    </div>`;
}

function tplMsoRows(rows, page, pageSize){
  if(!rows.length) return `<tr><td colspan="8" style="color:var(--text-light);">Tidak ada data Master Stock Opname</td></tr>`;
  const start = (page-1)*pageSize;
  return rows.slice(start, start+pageSize).map((r) => {
    const idx = DATA.masterStockOpname.indexOf(r);
    return `
    <tr>
      <td><a href="#" class="row-link" data-view="${idx}">${r.no}</a></td>
      <td>${(r.tglTransaksi||'').split(' ')[0]||''}</td>
      <td>${r.periodeAwal||''} - ${r.periodeAkhir||''}</td>
      <td>${r.keterangan||''}</td>
      <td><button class="icon-btn view" data-view="${idx}" title="Lihat">${icon('eye',15)}</button></td>
      <td><button class="icon-btn print" data-print="${idx}" title="Cetak">${icon('printer',15)}</button></td>
      <td><button class="icon-btn edit" data-edit="${idx}" title="Ubah">${icon('edit',15)}</button></td>
      <td><button class="icon-btn del" data-del="${idx}" title="Hapus">${icon('trash',15)}</button></td>
    </tr>`;
  }).join('');
}

function tplMsoPager(page, totalPages){
  if(totalPages <= 1) return '';
  let btns = `<button data-msopage="1">First</button><button data-msopage="${Math.max(1,page-1)}">Previous</button>`;
  for(let p=1;p<=totalPages;p++){ btns += `<button data-msopage="${p}" class="${p===page?'active':''}">${p}</button>`; }
  btns += `<button data-msopage="${Math.min(totalPages,page+1)}">Next</button><button data-msopage="${totalPages}">Last</button>`;
  return btns;
}

/* Pager windowed (maks. 7 nomor tampil), pola sama tplZkaPager()/
   tplGuPager() — dipakai utk tabel rincian barang, karena screenshot
   MASERP asli menampilkan gaya pager ini persis di sana (First
   Previous 1 2 3 4 5 6 7 Next Last). */
function tplMsoItemPager(page, totalPages){
  if(totalPages <= 1) return '';
  const windowSize = 7;
  let startP = Math.max(1, page - Math.floor(windowSize/2));
  let endP = Math.min(totalPages, startP + windowSize - 1);
  startP = Math.max(1, endP - windowSize + 1);
  let btns = `<button data-msoitempage="1">First</button><button data-msoitempage="${Math.max(1,page-1)}">Previous</button>`;
  for(let p=startP;p<=endP;p++){ btns += `<button data-msoitempage="${p}" class="${p===page?'active':''}">${p}</button>`; }
  btns += `<button data-msoitempage="${Math.min(totalPages,page+1)}">Next</button><button data-msoitempage="${totalPages}">Last</button>`;
  return btns;
}

function tplMsoItemRow(it, ii, dis){
  const selisih = (it.qtyCounted||0) - (it.sistem||0);
  const total = selisih * (it.hna||0);
  const selisihColor = selisih > 0 ? 'var(--teal)' : (selisih < 0 ? 'var(--red)' : 'inherit');
  return `
    <tr style="${it.verified?'background:#f2fbf6;':''}">
      <td>${ii+1}${it.verified?` <span title="Sudah diverifikasi" style="color:var(--teal);">${icon('check',12)}</span>`:''}</td>
      <td>${it.kodeGudang}</td>
      <td>${it.kode}</td>
      <td>${it.nama}</td>
      <td>${it.batch||'-'}</td>
      <td>${it.exp||'-'}</td>
      <td><input type="number" min="0" step="1" data-mso-qty="${ii}" value="${it.qtyCounted}" ${dis} style="width:85px;"></td>
      <td><input type="text" data-mso-ketarea="${ii}" value="${it.ketArea||''}" ${dis} style="width:90px;" placeholder="Area"></td>
      <td style="text-align:right;">${num(it.sistem)}</td>
      <td style="text-align:right;color:${selisihColor};font-weight:${selisih!==0?'700':'400'};">${num(selisih)}</td>
      <td style="text-align:right;">${num(it.hna)}</td>
      <td style="text-align:right;color:${selisihColor};font-weight:${selisih!==0?'700':'400'};">${num(total)}</td>
      ${dis ? '' : `
      <td><button type="button" class="icon-btn edit" data-mso-verif="${ii}" title="Verifikasi Hasil Hitung">${icon('edit',14)}</button></td>
      <td><button type="button" class="icon-btn del" data-mso-hapus="${ii}" title="Hapus dari Stock Opname">${icon('trash',14)}</button></td>`}
    </tr>`;
}

function tplMsoItemsTable(items, page, pageSize, dis){
  const totalPages = Math.max(1, Math.ceil(items.length/pageSize));
  const p = Math.min(page, totalPages);
  const start = (p-1)*pageSize;
  const pageItems = items.slice(start, start+pageSize);
  const grandTotal = items.reduce((s,it) => s + (((it.qtyCounted||0)-(it.sistem||0)) * (it.hna||0)), 0);
  return `
    <table class="mso-item-table">
      <thead>
        <tr>
          <th rowspan="2">No.</th>
          <th rowspan="2">Gudang</th>
          <th colspan="2">Produk</th>
          <th rowspan="2">Batch<br>Number</th>
          <th rowspan="2">Exp Date</th>
          <th colspan="4">Qty</th>
          <th rowspan="2">HNA</th>
          <th rowspan="2">Total</th>
          ${dis ? '' : `<th colspan="2">Verifikasi</th>`}
        </tr>
        <tr>
          <th>Kode</th><th>Nama</th>
          <th>Qty. Counted</th><th>Ket. Area</th><th>Sistem</th><th>Selisih</th>
        </tr>
      </thead>
      <tbody id="msoItemsBody">
        ${pageItems.length ? pageItems.map((it,ii)=>tplMsoItemRow(it,start+ii,dis)).join('') : `<tr><td colspan="13" style="color:var(--text-light);padding:14px;">Belum ada barang — pilih Filter Gudang lalu klik "Generate".</td></tr>`}
      </tbody>
      ${items.length ? `<tfoot><tr>
        <td colspan="10" style="text-align:right;font-weight:700;">Total Selisih (Rp)</td>
        <td style="text-align:right;font-weight:700;color:${grandTotal<0?'var(--red)':(grandTotal>0?'var(--teal)':'inherit')};">${num(grandTotal)}</td>
        ${dis?'':'<td colspan="2"></td>'}
      </tr></tfoot>` : ''}
    </table>
    <div class="table-footer"><div class="pager" id="msoItemPager">${tplMsoItemPager(p, totalPages)}</div><div>Total: ${items.length}</div></div>`;
}

function tplMsoForm(mode, row){
  const isAdd = mode === 'add';
  const isView = mode === 'view';
  const dis = isView ? 'disabled' : '';
  const titleAction = isAdd ? '+ Master Stock Opname' : (isView ? 'Lihat Master Stock Opname' : 'Ubah Master Stock Opname');
  return `
    <div class="breadcrumb">Home / Master Stock Opname / <b>${isAdd?'Tambah':(isView?'Lihat':'Ubah')}</b></div>
    <div class="card">
      <div class="card-header dark-header"><h3>${icon('clipboard',15)} ${titleAction}</h3></div>
      <div class="card-body">
        <div class="form-grid">
          <div class="form-group">
            <label>Cabang</label>
            <select id="fMsoCabang" ${(!isAdd)?'disabled':''}>
              ${MSO_CABANG_LIST.map(c=>`<option ${row.cabang===c?'selected':''}>${c}</option>`).join('')}
            </select>
          </div>
          <div class="form-group">
            <label>No. Bukti</label>
            <input type="text" id="fMsoNo" value="${row.no||''}" placeholder="Otomatis" readonly>
          </div>
        </div>
        <div class="form-grid">
          <div class="form-group">
            <label>Tgl. Transaksi (Stock per Tgl)</label>
            <div class="input-with-btn">
              <input type="text" id="fMsoTglTransaksi" value="${row.tglTransaksi||''}" ${dis}>
              <span class="icon-btn edit" style="pointer-events:none;">${icon('calendar',14)}</span>
            </div>
          </div>
          <div class="form-group">
            <label>Periode</label>
            <div class="field-pair">
              <input type="text" id="fMsoPeriodeAwal" value="${row.periodeAwal||''}" ${dis}>
              <span style="align-self:center;color:var(--text-light);">-</span>
              <input type="text" id="fMsoPeriodeAkhir" value="${row.periodeAkhir||''}" ${dis}>
            </div>
          </div>
        </div>
        <div class="form-group">
          <label>Keterangan</label>
          <input type="text" id="fMsoKeterangan" value="${row.keterangan||''}" placeholder="Keterangan" ${dis}>
        </div>

        ${!isView ? `
        <div class="form-grid">
          <div class="form-group">
            <label>Filter Gudang</label>
            <select id="fMsoGudang">
              <option value="">- Pilih Gudang -</option>
              ${msoGudangOptionsForCabang(row.cabang, row.filterGudangKode)}
            </select>
          </div>
          <div class="form-group">
            <label>Filter Item Barang</label>
            <div class="input-with-btn">
              <input type="text" id="fMsoItem" value="${row.filterItemNama||''}" placeholder="Semua barang di gudang terpilih (kosongkan utk semua)" readonly>
              <button type="button" class="icon-btn edit" id="msoItemSearch" title="Cari Barang">${icon('search',14)}</button>
              ${row.filterItemKode ? `<button type="button" class="icon-btn del" id="msoItemClear" title="Hapus Filter">${icon('trash',14)}</button>` : ''}
            </div>
          </div>
        </div>
        <div style="margin-bottom:16px;">
          <button class="btn-primary" id="msoGenerate">Generate</button>
        </div>` : ''}

        <div class="table-wrap" style="overflow-x:auto;">
          <div id="msoItemsWrap">${tplMsoItemsTable(row.items, 1, 10, isView)}</div>
        </div>

        <div class="form-page-actions">
          ${isView
            ? `<a href="#" id="msoTutup" class="link-add" style="margin-right:auto;">&larr; Kembali ke Daftar</a>`
            : `<a href="#" id="msoBatalkan" class="link-add" style="margin-right:auto;">Batalkan</a>
               <button class="btn-primary" id="msoSimpan">Simpan</button>`}
        </div>
      </div>
    </div>`;
}

/* Opsi <option> Gudang yang mengikuti Cabang terpilih (dari
   DATA.gudang, difilter g.cabang===cabang) — INI FIELD BARU yang
   diminta user, tidak ada di screenshot asli. */
function msoGudangOptionsForCabang(cabang, selectedKode){
  return DATA.gudang.filter(g => g.cabang === cabang)
    .map(g => `<option value="${g.kode}" ${g.kode===selectedKode?'selected':''}>${g.kode} - ${g.nama}</option>`).join('');
}

function tplMsoDeleteConfirm(row){
  return `
    <div class="modal-box">
      <div class="modal-header"><span>Hapus Master Stock Opname</span><span class="close" id="modalClose">&times;</span></div>
      <div class="modal-body"><p>Yakin ingin menghapus Master Stock Opname <b>${row.no}</b>?</p></div>
      <div class="modal-footer">
        <button class="btn-secondary" id="modalCancel">Batal</button>
        <button class="btn-danger" id="modalDelete">Hapus</button>
      </div>
    </div>`;
}

function tplMsoItemDeleteConfirm(it){
  return `
    <div class="modal-box">
      <div class="modal-header"><span>Hapus Barang dari Stock Opname</span><span class="close" id="modalClose">&times;</span></div>
      <div class="modal-body"><p>Yakin ingin menghapus barang <b>${it.kode} - ${it.nama}</b> dari daftar stock opname ini?</p></div>
      <div class="modal-footer">
        <button class="btn-secondary" id="modalCancel">Batal</button>
        <button class="btn-danger" id="modalDelete">Hapus</button>
      </div>
    </div>`;
}

function tplMsoVerifModal(it, ii){
  return `
    <div class="modal-box" style="max-width:420px;">
      <div class="modal-header"><span>Verifikasi Hasil Hitung</span><span class="close" id="modalClose">&times;</span></div>
      <div class="modal-body">
        <p style="margin-top:0;"><b>${it.kode}</b> - ${it.nama} <span style="color:var(--text-light);">(${it.kodeGudang})</span></p>
        <div class="form-group">
          <label>Qty. Counted</label>
          <input type="number" min="0" step="1" id="mvQty" value="${it.qtyCounted}">
        </div>
        <div class="form-group">
          <label>Ket. Area</label>
          <input type="text" id="mvKetArea" value="${it.ketArea||''}" placeholder="Area">
        </div>
      </div>
      <div class="modal-footer">
        <button class="btn-secondary" id="modalCancel">Batal</button>
        <button class="btn-primary" id="modalVerifSave">Simpan &amp; Tandai Terverifikasi</button>
      </div>
    </div>`;
}

function tplMsoInfoModal(title, text){
  return `
    <div class="modal-box">
      <div class="modal-header"><span>${title}</span><span class="close" id="modalClose">&times;</span></div>
      <div class="modal-body"><p>${text}</p></div>
      <div class="modal-footer"><button class="btn-primary" id="modalOk">Mengerti</button></div>
    </div>`;
}

/* Modal "Daftar Fisik Inventory" (dibuka dari tombol header list
   "Laporan Pembantu Stock Opname") — sesuai screenshot MASERP: Gudang
   (picker)/Kode Kategori (select)/Inventory (picker)/Stock Per-Tanggal
   (tanggal)/checkbox "Cetak Transaksi Bernilai Nol"/tombol Close-Show
   Report-Show Report Pdf. */
function tplMsoLaporanBantuModal(f){
  return `
    <div class="modal-box" style="max-width:480px;">
      <div class="modal-header"><span>${icon('box',15)} Daftar Fisik Inventory</span><span class="close" id="modalClose">&times;</span></div>
      <div class="modal-body">
        <div class="form-group">
          <label>Gudang</label>
          <div class="input-with-btn">
            <input type="text" id="mlbGudang" value="${f.gudangNama||''}" placeholder="Cari gudang" readonly>
            <button type="button" class="icon-btn edit" id="mlbGudangSearch" title="Cari Gudang">${icon('search',14)}</button>
          </div>
        </div>
        <div class="form-group">
          <label>Kode Kategori</label>
          <select id="mlbKategori">
            <option value="">Pilih Kategori...</option>
            ${DATA.kategoriBarang.map(k=>`<option value="${k.kode}" ${f.kategoriKode===k.kode?'selected':''}>${k.nama}</option>`).join('')}
          </select>
        </div>
        <div class="form-group">
          <label>Inventory</label>
          <div class="input-with-btn">
            <input type="text" id="mlbItem" value="${f.itemNama||''}" placeholder="Cari barang" readonly>
            <button type="button" class="icon-btn edit" id="mlbItemSearch" title="Cari Barang">${icon('search',14)}</button>
          </div>
        </div>
        <div class="form-group">
          <label>Stock Per-Tanggal</label>
          <div class="input-with-btn">
            <input type="text" id="mlbTanggal" value="${f.tanggal||''}">
            <span class="icon-btn edit" style="pointer-events:none;">${icon('calendar',14)}</span>
          </div>
        </div>
        <div class="checkbox-row">
          <label><input type="checkbox" id="mlbBernilaiNol" ${f.bernilaiNol?'checked':''}> Cetak Transaksi Bernilai Nol</label>
        </div>
      </div>
      <div class="modal-footer">
        <button class="btn-secondary" id="mlbClose">Close</button>
        <button class="btn-primary" id="mlbShowReport">Show Report</button>
        <button class="btn-primary" id="mlbShowReportPdf">Show Report Pdf</button>
      </div>
    </div>`;
}

function tplMsoSimplePicker(title, rows){
  return `
    <div class="modal-box" style="max-width:460px;">
      <div class="modal-header"><span>${title}</span><span class="close" id="modalClose">&times;</span></div>
      <div class="modal-body" style="max-height:360px;overflow-y:auto;">
        <table><tbody>
          ${rows.length ? rows.map(r=>`<tr class="mso-pick-row" data-kode="${r.kode}" data-label="${r.label}" style="cursor:pointer;"><td style="padding:8px 10px;border-bottom:1px solid var(--border);">${r.label}</td></tr>`).join('') : `<tr><td style="color:var(--text-light);padding:10px;">Tidak ada data.</td></tr>`}
        </tbody></table>
      </div>
      <div class="modal-footer"><button class="btn-secondary" id="modalCancel">Tutup</button></div>
    </div>`;
}

/* Dokumen cetak "CEK FISIK INVENTORY" — KOSONG (kolom Hasil Hitung
   selalu kosong, ini form fisik utk dibawa ke gudang, BUKAN hasil
   Master Stock Opname yang sudah dientri — lihat tplMsoResultDoc()
   utk yang itu), dikelompokkan per Gudang lalu per Kategori, persis
   struktur PDF contoh "Contoh Cek Fisik Inventory.pdf" yang dikirim
   user (minus kolom Batch Number/Exp Date yang selalu "-" di mockup
   ini, lihat catatan header file ini). */
function tplMsoCekFisikDoc(tanggal, groups){
  const groupsHtml = !groups.length
    ? `<p style="text-align:center;color:#777;">Tidak ada data Persediaan yang cocok dengan filter ini.</p>`
    : groups.map(g => `
      <p style="font-weight:700;margin:14px 0 2px;">Nama Gudang:&nbsp;&nbsp;${g.namaGudang}</p>
      ${g.kategoris.map(k => `
        <table>
          <thead>
            <tr><th style="width:34px;">No.</th><th>Kode Item</th><th>Nama Barang</th><th style="width:60px;">Satuan</th><th>Batch Number</th><th>Exp date</th><th style="width:110px;">Hasil Hitung</th></tr>
          </thead>
          <tbody>
            <tr><td colspan="7" style="font-weight:700;background:#f5f5f5;">Kategori:&nbsp;&nbsp;${k.namaKategori}</td></tr>
            ${k.rows.map((r,i) => `<tr><td style="text-align:center;">${i+1}</td><td>${r.kodeBarang}</td><td>${r.namaBarang}</td><td>${r.satuan}</td><td>-</td><td>-</td><td></td></tr>`).join('')}
          </tbody>
        </table>`).join('')}`).join('');
  return `<!DOCTYPE html>
<html><head><meta charset="utf-8"><title>Cek Fisik Inventory</title>
<style>
  body{font-family:Arial, Helvetica, sans-serif;font-size:11px;color:#111;margin:20px;}
  .mso-doc-toolbar{margin-bottom:10px;}
  .mso-doc-toolbar button{padding:7px 16px;border:none;border-radius:5px;font-size:12.5px;font-weight:600;cursor:pointer;margin-right:8px;}
  .mso-doc-toolbar .btn-print{background:#4472c4;color:#fff;}
  .mso-doc-toolbar .btn-close{background:#eef1f7;color:#333;}
  h1{font-size:15px;text-align:center;margin:2px 0;}
  .sub{font-size:11px;text-align:center;margin:0 0 12px;}
  table{width:100%;border-collapse:collapse;margin-bottom:8px;}
  th,td{border:1px solid #999;padding:3px 6px;font-size:10.5px;}
  thead th{background:#f0f0f0;text-align:left;font-weight:700;}
  @media print{ .mso-doc-toolbar{display:none;} body{margin:0;} }
</style></head>
<body>
  <div class="mso-doc-toolbar">
    <button class="btn-print" onclick="window.print()">Cetak</button>
    <button class="btn-close" onclick="window.close()">Tutup</button>
  </div>
  <div style="text-align:right;font-size:11px;">${(new Date()).toLocaleDateString?'':''}</div>
  <h1>PT Distriversa Buanamas</h1>
  <div class="sub" style="font-weight:700;font-size:13px;">CEK FISIK INVENTORY</div>
  <div class="sub">Stock Per Tanggal : ${tanggal}</div>
  ${groupsHtml}
</body></html>`;
}

/* Dokumen cetak hasil Master Stock Opname yang SUDAH dientri (tombol
   Cetak di list) — beda dari tplMsoCekFisikDoc() di atas yang isinya
   kosong/blank form. Ini menampilkan Qty Counted/Sistem/Selisih/Total
   yang sudah tersimpan di baris DATA.masterStockOpname. */
function tplMsoResultDoc(row){
  const fmt = n => Number(n||0).toLocaleString('id-ID');
  const grandTotal = row.items.reduce((s,it) => s + (((it.qtyCounted||0)-(it.sistem||0)) * (it.hna||0)), 0);
  const bodyRows = !row.items.length
    ? `<tr><td colspan="9" style="text-align:center;color:#777;padding:14px;">Tidak ada barang.</td></tr>`
    : row.items.map((it,i) => {
      const selisih = (it.qtyCounted||0) - (it.sistem||0);
      const total = selisih * (it.hna||0);
      return `<tr>
        <td style="text-align:center;">${i+1}</td>
        <td>${it.kodeGudang}</td>
        <td>${it.kode}</td>
        <td>${it.nama}</td>
        <td style="text-align:right;">${fmt(it.sistem)}</td>
        <td style="text-align:right;">${fmt(it.qtyCounted)}</td>
        <td style="text-align:right;">${fmt(selisih)}</td>
        <td style="text-align:right;">${fmt(it.hna)}</td>
        <td style="text-align:right;">${fmt(total)}</td>
      </tr>`;
    }).join('');
  return `<!DOCTYPE html>
<html><head><meta charset="utf-8"><title>Master Stock Opname ${row.no}</title>
<style>
  body{font-family:Arial, Helvetica, sans-serif;font-size:11px;color:#111;margin:20px;}
  .mso-doc-toolbar{margin-bottom:10px;}
  .mso-doc-toolbar button{padding:7px 16px;border:none;border-radius:5px;font-size:12.5px;font-weight:600;cursor:pointer;margin-right:8px;}
  .mso-doc-toolbar .btn-print{background:#4472c4;color:#fff;}
  .mso-doc-toolbar .btn-close{background:#eef1f7;color:#333;}
  h1{font-size:15px;text-align:center;margin:2px 0;}
  .sub{font-size:11px;text-align:center;margin:0 0 4px;}
  table{width:100%;border-collapse:collapse;}
  th,td{border:1px solid #999;padding:3px 6px;font-size:10.5px;}
  thead th{background:#f0f0f0;text-align:left;font-weight:700;}
  tfoot td{font-weight:700;background:#f7f7f7;}
  @media print{ .mso-doc-toolbar{display:none;} body{margin:0;} }
</style></head>
<body>
  <div class="mso-doc-toolbar">
    <button class="btn-print" onclick="window.print()">Cetak</button>
    <button class="btn-close" onclick="window.close()">Tutup</button>
  </div>
  <h1>PT Distriversa Buanamas</h1>
  <div class="sub" style="font-weight:700;font-size:13px;">MASTER STOCK OPNAME</div>
  <div class="sub">No. Bukti: ${row.no} &nbsp;|&nbsp; Periode: ${row.periodeAwal} - ${row.periodeAkhir}</div>
  <div class="sub">${row.keterangan||''}</div>
  <table>
    <thead><tr><th>No.</th><th>Gudang</th><th>Kode</th><th>Nama Barang</th><th>Sistem</th><th>Qty Counted</th><th>Selisih</th><th>HNA</th><th>Total</th></tr></thead>
    <tbody>${bodyRows}</tbody>
    <tfoot><tr><td colspan="8" style="text-align:right;">Total Selisih (Rp)</td><td style="text-align:right;">${fmt(grandTotal)}</td></tr></tfoot>
  </table>
</body></html>`;
}
