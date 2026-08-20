/* =========================================================
   TEMPLATE (HTML saja) — Price List By Province (Persediaan
   Barang > Master & Setting). Semua fungsi di file ini HANYA
   menyusun & mengembalikan markup HTML (string), TIDAK ada
   logic/DOM-binding/data mutation di sini. Logic-nya ada di file
   sebelah: price-list-province.js

   Sesuai 3 screenshot MASERP yang dikirim user: list "Price List
   By Province" (dark header + chip periode "Agustus 2026" +
   tombol "+Tambah"/"Impor Price List"/"Ekspor ke Excel", kolom No.
   Transaksi/Tgl. Efektif/Keterangan/Province/Lihat/Ubah/Hapus) dan
   form "+ Price List" full page (No. Otomatis + No. Transaksi +
   Tgl. Efektif + Keterangan + picker Provincies, lalu section
   "Daftar Inventory" — tabel SEMUA barang dengan 4 kolom "Harga
   Jual 1-4" masing2 Satuan/Lama/Baru + kotak %-header di atas
   tiap kolom Harga Jual).

   PENYEDERHANAAN PENTING (lihat juga komentar di atas
   DATA.priceListProvince di js/data.js): screenshot asli
   menampilkan katalog ~690 barang farmasi dengan 2 satuan aktif
   per barang (BTL=Harga Jual 1, KRT=Harga Jual 2). Mockup ini
   reuse DATA.items apa adanya (10 barang, 1 satuan per barang,
   data DBM sendiri) — jadi HANYA kolom Harga Jual 1 yang aktif
   (Satuan/Lama/Baru terisi), kolom Harga Jual 2-4 tetap dirender
   strukturnya (4 kolom persis screenshot) tapi SELALU kosong/
   nonaktif karena tidak ada data satuan ke-2/3/4 di DATA.items.
   "Total Record"/"Total" pada mockup ini karena itu menampilkan
   angka SEBENARNYA (10), BUKAN 690 seperti screenshot asli — demi
   konsistensi data, bukan salah ketik.

   Kotak %-header di atas kolom Harga Jual 1 (tplPlzTierHeaderCell)
   begitu diisi & di-blur/Enter langsung menghitung ulang SELURUH
   baris yang sedang tampil: Baru = Lama x (1 + %/100), dibulatkan
   ke rupiah penuh (lihat plzApplyPercent() di price-list-province.
   js) — field Baru per baris tetap bisa di-override manual sesudah
   itu. Kolom "Kode Kategori" dipetakan dari DATA.kategoriBarang
   (dicocokkan lewat nama kategori, karena DATA.items.kategori
   menyimpan NAMA bukan kode — lihat kategoriKodeOf() di file
   logic). "All Category" & "Pencarian Global" pada grid Daftar
   Inventory SUNGGUHAN fungsional (filter kategori & kode/nama
   barang); page-size dropdown & pager bawah tabel tetap dekoratif
   (konsisten dengan mayoritas list lain di mockup ini — dataset
   di sini terlalu kecil untuk pagination sungguhan).

   Field "No. Otomatis" (dropdown Ya/Tidak) mengontrol apakah "No.
   Transaksi" auto-generate readonly (`plzGenerateNumber()`, format
   "PLP/MM/YYYY/NNNN") atau bisa diketik manual — asumsi desain
   karena screenshot cuma menampilkan dropdown kosong tanpa label
   visible, dipilih pola serupa toggle lain di app ini (bukan
   diambil dari screenshot langsung). "Provincies" pakai picker
   modal lokal (tplPlzProvincePicker) ke DATA.provinsiList (8
   provinsi yang sudah ada, dipakai bersama Sales Quotation/Master
   Customer/Master Wilayah), BUKAN array baru.
========================================================= */

const PLZ_PAGE_SIZE_OPTS = [10, 20, 50];

function tplPlzListPage(){
  return `
    <div class="breadcrumb">Home / <b>Price List By Province</b></div>
    <div class="card">
      <div class="card-header dark-header">
        <h3>${icon('dollar',15)} Price List By Province</h3>
        <div class="toolbar-actions">
          <button class="chip-btn" id="btnPlzPeriod">Agustus 2026 ${icon('chevronDown',13)}</button>
          <button class="btn-primary" id="btnPlzAdd">${icon('plus',14)} Tambah</button>
          <button class="btn-outline" id="btnPlzImpor">${icon('file',14)} Impor Price List</button>
          <button class="btn-outline" id="btnPlzEkspor">${icon('file',14)} Ekspor ke Excel</button>
        </div>
      </div>
      <div class="table-toolbar">
        <select id="plzPageSize"><option selected>20</option><option>50</option><option>100</option></select>
        <input type="text" id="plzSearch" placeholder="Pencarian Global">
      </div>
      <div class="table-wrap"><table>
        <thead><tr>
          <th>No. Transaksi</th>
          <th>Tgl. Efektif</th>
          <th>Keterangan</th>
          <th>Province</th>
          <th>Lihat</th>
          <th>Ubah</th>
          <th>Hapus</th>
        </tr></thead>
        <tbody id="plzTbody"></tbody>
      </table></div>
      <div class="table-footer"><div class="pager"><button>First</button><button>Previous</button><button class="active">1</button><button>Next</button><button>Last</button></div><div id="plzTotal"></div></div>
    </div>`;
}

function tplPlzRows(rows){
  if(!rows.length) return `<tr><td colspan="7" style="color:var(--text-light);text-align:center;">Tidak Ada Data</td></tr>`;
  return rows.map((r,i)=>`
    <tr>
      <td>${r.noTransaksi}</td>
      <td>${r.tglEfektif}</td>
      <td>${r.keterangan||'-'}</td>
      <td>${r.province}</td>
      <td><button class="icon-btn view" data-view="${i}" title="Lihat">${icon('eye',15)}</button></td>
      <td><button class="icon-btn edit" data-edit="${i}" title="Ubah">${icon('edit',15)}</button></td>
      <td><button class="icon-btn del" data-del="${i}" title="Hapus">${icon('trash',15)}</button></td>
    </tr>`).join('');
}

/* ---------- Form "+ Price List" ---------- */
function tplPlzHeaderFields(mode, row){
  const isView = mode === 'view';
  const dis = isView ? 'disabled' : '';
  return `
    <div class="po-grid-3">
      <div class="form-group">
        <label>No. Otomatis</label>
        <select id="plzAutoNo" ${dis}>
          <option value="ya" ${row.autoNo!=='tidak'?'selected':''}>Ya</option>
          <option value="tidak" ${row.autoNo==='tidak'?'selected':''}>Tidak</option>
        </select>
      </div>
      <div class="form-group">
        <label>No. Transaksi</label>
        <div class="input-with-btn">
          <input type="text" id="plzNoTransaksi" value="${row.noTransaksi||''}" placeholder="No. Transaksi" ${row.autoNo!=='tidak'?'readonly':''} ${dis}>
          <button class="icon-btn edit" id="plzRefreshNo" title="Generate Ulang" ${dis}>${icon('refreshCw',14)}</button>
        </div>
      </div>
      <div class="form-group">
        <label>Tgl. Efektif</label>
        <div class="input-with-btn">
          <input type="text" id="plzTglEfektif" value="${row.tglEfektif||''}" placeholder="dd/mm/yyyy" ${dis}>
          <button class="icon-btn edit" id="plzTglBtn" title="Pilih Tanggal" ${dis}>${icon('calendar',14)}</button>
        </div>
      </div>
    </div>
    <div class="po-grid-3">
      <div class="form-group" style="grid-column:span 2;">
        <label>Keterangan</label>
        <textarea id="plzKeterangan" class="po-textarea" ${dis}>${row.keterangan||''}</textarea>
      </div>
      <div class="form-group">
        <label>Provincies</label>
        <div class="input-with-btn">
          <input type="text" id="plzProvince" value="${row.province||''}" placeholder="Cari Province" readonly>
          <button class="icon-btn edit" id="plzProvinceBtn" title="Cari Province" ${dis}>${icon('search',14)}</button>
        </div>
      </div>
    </div>`;
}

function tplPlzTierHead(tierIdx, dis){
  return `
    <th colspan="3" style="text-align:center;">
      Harga Jual ${tierIdx}<br>
      <input type="number" class="plz-pct" data-tier="${tierIdx}" value="0.00" style="width:64px;display:inline-block;margin-top:4px;" ${dis}> %
    </th>`;
}

function tplPlzInventoryTable(rows, categoryOptions, selectedCategory, dis){
  dis = dis || '';
  return `
    <h3 style="color:var(--navy);font-size:14px;font-weight:700;padding-bottom:10px;border-bottom:1px solid var(--border);margin:22px 0 14px;">Daftar Inventory</h3>
    <div class="table-toolbar">
      <select id="plzCategoryFilter">
        <option value="" ${!selectedCategory?'selected':''}>All Category</option>
        ${categoryOptions.map(c=>`<option value="${c.kode}" ${selectedCategory===c.kode?'selected':''}>${c.nama}</option>`).join('')}
      </select>
      <select id="plzInvPageSize">${PLZ_PAGE_SIZE_OPTS.map(n=>`<option ${n===10?'selected':''}>${n}</option>`).join('')}</select>
      <input type="text" id="plzInvSearch" placeholder="Pencarian Global">
    </div>
    <div class="table-wrap"><table class="po-item-table plz-price-table">
      <thead>
        <tr>
          <th rowspan="2">Kode Kategori</th>
          <th rowspan="2">Kode Barang</th>
          <th rowspan="2">Nama Barang</th>
          ${tplPlzTierHead(1, dis)}
          ${tplPlzTierHead(2, 'disabled')}
          ${tplPlzTierHead(3, 'disabled')}
          ${tplPlzTierHead(4, 'disabled')}
        </tr>
        <tr>
          <th>Satuan</th><th>Lama</th><th>Baru</th>
          <th>Satuan</th><th>Lama</th><th>Baru</th>
          <th>Satuan</th><th>Lama</th><th>Baru</th>
          <th>Satuan</th><th>Lama</th><th>Baru</th>
        </tr>
      </thead>
      <tbody id="plzInvTbody">${tplPlzInventoryRows(rows, dis)}</tbody>
    </table></div>
    <div class="table-footer"><div class="pager"><button>First</button><button>Previous</button><button class="active">1</button><button>2</button><button>3</button><button>Next</button><button>Last</button></div><div id="plzInvTotal">Total: ${rows.length}</div></div>`;
}

function tplPlzInventoryRows(rows, dis){
  dis = dis || '';
  if(!rows.length) return `<tr><td colspan="15" style="color:var(--text-light);text-align:center;">Tidak ada barang ditemukan</td></tr>`;
  return rows.map(r=>`
    <tr>
      <td>${r.kategoriKode}</td>
      <td>${r.kode}</td>
      <td>${r.nama}</td>
      <td>${r.satuan}</td>
      <td class="text-right">${num(r.hargaLama1)}</td>
      <td><input type="number" class="plz-baru" data-kode="${r.kode}" data-tier="1" value="${r.hargaBaru1||''}" ${dis}></td>
      <td></td><td class="text-right">${num(0)}</td><td><input type="number" disabled></td>
      <td></td><td class="text-right">${num(0)}</td><td><input type="number" disabled></td>
      <td></td><td class="text-right">${num(0)}</td><td><input type="number" disabled></td>
    </tr>`).join('');
}

function tplPlzFooter(){
  return `
    <div class="form-page-actions">
      <button class="btn-secondary" id="plzCancel">Batalkan</button>
      <button class="btn-primary" id="plzSave">Simpan</button>
    </div>`;
}

function tplPlzViewFooter(){
  return `
    <div class="form-page-actions">
      <button class="btn-secondary" id="plzBack">&larr; Kembali</button>
    </div>`;
}

function tplPlzForm(mode, row, invRows, categoryOptions, selectedCategory){
  const isEdit = mode === 'edit';
  const isView = mode === 'view';
  const title = isView ? 'Price List' : (isEdit ? 'Price List' : '+ Price List');
  return `
    <div class="breadcrumb">Home / Price List By Province / <b>${isView?'Lihat':(isEdit?'Ubah':'Tambah')}</b></div>
    <div class="card">
      <div class="card-header dark-header">
        <h3>${icon(isEdit||isView?'edit':'plus', 15)} ${title}</h3>
      </div>
      <div class="card-body">
        ${tplPlzHeaderFields(mode, row)}
        ${tplPlzInventoryTable(invRows, categoryOptions, selectedCategory, isView ? 'disabled' : '')}
        ${isView ? tplPlzViewFooter() : tplPlzFooter()}
      </div>
    </div>`;
}

/* ---------- Picker "Provincies" (disalin lokal, pola sama tplDomSimplePicker
   di Dominasi — bukan direferensi cross-file karena lazy-load antar
   modul tidak terjamin urutannya) ---------- */
function tplPlzProvincePicker(list){
  return `
    <div class="modal-box" style="max-width:420px;">
      <div class="modal-header"><span>Cari Province</span><span class="close" id="pickerClose">&times;</span></div>
      <div class="modal-body">
        <div class="table-wrap" style="max-height:340px;overflow:auto;"><table>
          <thead><tr><th>Province</th><th></th></tr></thead>
          <tbody>${list.map(p=>`<tr><td>${p}</td><td><button class="btn-pick" data-pick="${p}">Pilih</button></td></tr>`).join('')}</tbody>
        </table></div>
      </div>
      <div class="modal-footer"><button class="btn-secondary" id="pickerCancel">Tutup</button></div>
    </div>`;
}

function tplPlzDeleteConfirm(row){
  return `
    <div class="modal-box">
      <div class="modal-header"><span>Hapus Price List</span><span class="close" id="modalClose">&times;</span></div>
      <div class="modal-body"><p>Yakin ingin menghapus price list <b>${row.noTransaksi}</b> — ${row.province}?</p></div>
      <div class="modal-footer">
        <button class="btn-secondary" id="modalCancel">Batal</button>
        <button class="btn-danger" id="modalConfirmDel">Hapus</button>
      </div>
    </div>`;
}

function tplPlzInfoModal(title, text){
  return `
    <div class="modal-box">
      <div class="modal-header"><span>${title}</span><span class="close" id="modalClose">&times;</span></div>
      <div class="modal-body"><p>${text}</p></div>
      <div class="modal-footer"><button class="btn-primary" id="modalOk">Tutup</button></div>
    </div>`;
}
