/* =========================================================
   TEMPLATE (HTML saja) — Stock Request (Persediaan Barang >
   Daftar Transaksi). Semua fungsi di file ini HANYA menyusun &
   mengembalikan markup HTML (string), TIDAK ada logic/DOM-binding
   di sini. Logic-nya ada di file sebelah: stock-request.js

   Sesuai 2 screenshot MASERP yang dikirim user: "Stock Request
   List" (list, dengan toggle switch Closed Manually + kolom aksi
   Lihat/Cetak/Ubah/Hapus) dan "Stock Request" (form Tambah/Ubah,
   full page — ada tabel rincian barang yang dikelompokkan per
   Group/kategori, tiap grup bisa dibuka/tutup). Pola CRUD full
   page sama seperti Jurnal Pembelian & Master Supplier.

   Kode barang & nama Supplier di data sample DIGANTI ke milik DBM
   sendiri (lihat catatan di DATA.stockRequest, js/data.js) karena
   screenshot aslinya dari demo perusahaan farmasi lain.
========================================================= */

const SR_CABANG_LIST = ['Head Office','Surabaya','Bandung','Medan','Makassar','Semarang','Tangerang','Sidoarjo'];
const SR_CABANG_CODE = {'Head Office':'HO','Surabaya':'SBY','Bandung':'BDG','Medan':'MDN','Makassar':'MKS','Semarang':'SMG','Tangerang':'TGR','Sidoarjo':'SDA'};
const SR_GUDANG_LIST = [
  '(00-GUU) Gudang Utama-HO',
  '(01-GSB) Gudang Surabaya',
  '(02-GBD) Gudang Bandung',
  '(03-GMD) Gudang Medan',
  '(04-GMK) Gudang Makassar',
  '(05-GSM) Gudang Semarang',
  '(06-GTG) Gudang Tangerang',
  '(07-GSD) Gudang Sidoarjo',
];
const SR_ED_OPTIONS = [0,1,2,3,6,12];

/* Kelompokkan array items (dari row.items / DATA.items) berdasarkan
   field kategori, sambil menjaga urutan kemunculan pertama kali. */
function srGroupItemsByKategori(items){
  const order = [];
  const map = {};
  items.forEach(it=>{
    const k = it.kategori || 'Lainnya';
    if(!map[k]){ map[k] = []; order.push(k); }
    map[k].push(it);
  });
  return order.map(k=>({kategori:k, items:map[k]}));
}

function tplStockRequestListPage(){
  return `
    <div class="breadcrumb">Home / <b>Stock Request</b></div>
    <div class="card">
      <div class="card-header dark-header">
        <h3>${icon('box',15)} Stock Request List</h3>
        <div class="toolbar-actions">
          <button class="chip-btn" id="btnSrPeriod">Agustus 2026 ${icon('chevronDown',13)}</button>
          <button class="btn-primary" id="btnSrAdd">${icon('plus',14)} Tambah</button>
        </div>
      </div>
      <div class="table-toolbar">
        <select id="srPageSize"><option selected>10</option><option>25</option><option>50</option></select>
        <input type="text" id="srSearch" placeholder="Pencarian Global">
      </div>
      <div class="table-wrap"><table>
        <thead><tr>
          <th>No. Request</th>
          <th>No. PO</th>
          <th>Tgl. Request</th>
          <th>User Entry</th>
          <th>Reordering Sheet</th>
          <th>Tipe Transaksi</th>
          <th>Keterangan</th>
          <th>Status</th>
          <th>Closed Manually</th>
          <th>Lihat</th>
          <th>Cetak</th>
          <th>Ubah</th>
          <th>Hapus</th>
        </tr></thead>
        <tbody id="srTbody"></tbody>
      </table></div>
      <div class="table-footer"><div class="pager"><button>First</button><button>Previous</button><button class="active">1</button><button>Next</button><button>Last</button></div><div id="srTotal"></div></div>
    </div>`;
}

function tplSrRows(rows){
  if(!rows.length) return `<tr><td colspan="13" style="color:var(--text-light);">Tidak ada data Stock Request</td></tr>`;
  return rows.map((r,i)=>`
    <tr>
      <td>${r.no}</td>
      <td>${r.noPO||''}</td>
      <td>${r.tglRequest||''}</td>
      <td>${r.userEntry||''}</td>
      <td>${r.reorderingSheet||''}</td>
      <td>${r.tipeTransaksi||''}</td>
      <td>${r.keterangan||''}</td>
      <td><span class="${r.status==='OPEN'?'st-open':'st-closed'}">${r.status}</span></td>
      <td>
        <label class="toggle-switch">
          <input type="checkbox" data-toggle="closedManually" data-idx="${i}" ${r.closedManually?'checked':''}>
          <span class="toggle-slider"></span>
        </label>
      </td>
      <td><button class="icon-btn view" data-view="${i}" title="Lihat">${icon('eye',15)}</button></td>
      <td><button class="icon-btn print" data-print="${i}" title="Cetak">${icon('printer',15)}</button></td>
      <td><button class="icon-btn edit" data-edit="${i}" title="Ubah">${icon('edit',15)}</button></td>
      <td><button class="icon-btn del" data-del="${i}" title="Hapus">${icon('trash',15)}</button></td>
    </tr>`).join('');
}

function tplSrGroupBlock(group, gi, disabled){
  const allChecked = group.items.every(it=>it.pilih);
  return `
    <div class="sr-group-block">
      <div class="sr-group-bar open" data-group-toggle="${gi}">
        <span>Group : ${group.kategori}</span>
        <span class="chev">${icon('chevronDown',16)}</span>
      </div>
      <div class="sr-group-body open" id="srGroupBody${gi}">
        <table class="sr-detail-table">
          <thead><tr>
            <th>Kode Barang</th>
            <th>Nama Barang</th>
            <th>Qty Reordering</th>
            <th><input type="checkbox" data-group-check-all="${gi}" ${allChecked?'checked':''} ${disabled?'disabled':''}> Pilih</th>
            <th>Qty</th>
            <th>U/M</th>
          </tr></thead>
          <tbody>
            ${group.items.map((it,ii)=>`
              <tr>
                <td>${it.kode}</td>
                <td>${it.nama}</td>
                <td>${num(it.qtyReordering)}</td>
                <td><input type="checkbox" data-sr-pilih="${gi}:${ii}" ${it.pilih?'checked':''} ${disabled?'disabled':''}></td>
                <td><input type="number" min="0" data-sr-qty="${gi}:${ii}" value="${it.qty}" ${(!it.pilih||disabled)?'disabled':''}></td>
                <td>${it.um}</td>
              </tr>`).join('')}
          </tbody>
        </table>
      </div>
    </div>`;
}

function tplStockRequestForm(mode, row, groups){
  const isAdd = mode === 'add';
  const isView = mode === 'view';
  const dis = isView ? 'disabled' : '';
  const titleAction = isAdd ? 'Tambah' : (isView ? 'Lihat' : 'Ubah');
  const headerIcon = isAdd ? 'plus' : (isView ? 'eye' : 'edit');
  return `
    <div class="breadcrumb">Home / Stock Request / <b>${titleAction}</b></div>
    ${row.usedInPO ? `<div class="alert-warning">Stock Request ini sudah digunakan di PO</div>` : ''}
    <div class="card">
      <div class="card-header dark-header">
        <h3>${icon(headerIcon,15)} Stock Request</h3>
        <div style="display:flex;align-items:center;gap:10px;color:#fff;font-size:12.8px;font-weight:600;">
          Cabang Request
          <select id="fSrCabang" ${(isView||!isAdd)?'disabled':''} style="min-width:150px;">
            ${SR_CABANG_LIST.map(c=>`<option ${row.cabangRequest===c?'selected':''}>${c}</option>`).join('')}
          </select>
        </div>
      </div>
      <div class="card-body">
        <table class="field-table">
          <tr>
            <td class="flabel">No. Request</td>
            <td>
              <div class="input-with-btn">
                <input type="text" id="fSrNo" value="${row.no||''}" placeholder="Otomatis" readonly>
                ${isAdd ? `<button type="button" class="icon-btn edit" id="srRefreshNo" title="Generate Nomor">${icon('refreshCw',14)}</button>` : ''}
              </div>
            </td>
            <td class="flabel">No. Reordering Sheet</td>
            <td>
              <div class="input-with-btn">
                <input type="text" id="fSrRos" value="${row.reorderingSheet||''}" placeholder="Pilih Reordering Sheet" readonly>
                ${!isView ? `<button type="button" class="icon-btn edit" id="srRosSearch" title="Cari Reordering Sheet">${icon('search',14)}</button>` : ''}
              </div>
            </td>
          </tr>
          <tr>
            <td class="flabel">Supplier</td>
            <td>
              <select id="fSrSupplier" ${dis}>
                <option value="">-- Pilih Supplier --</option>
                ${DATA.suppliers.map(s=>`<option ${row.supplier===s.nama?'selected':''}>${s.nama}</option>`).join('')}
              </select>
            </td>
            <td class="flabel">Tgl. Request</td>
            <td>
              <div class="input-with-btn">
                <input type="text" id="fSrTgl" value="${row.tglRequest||''}" ${dis}>
                <span class="icon-btn edit" style="pointer-events:none;">${icon('calendar',14)}</span>
              </div>
            </td>
          </tr>
          <tr>
            <td class="flabel">Gudang Sumber</td>
            <td>
              <select id="fSrGudangSumber" ${dis}>
                ${SR_GUDANG_LIST.map(g=>`<option ${row.gudangSumber===g?'selected':''}>${g}</option>`).join('')}
              </select>
            </td>
            <td class="flabel">Gudang Target</td>
            <td>
              <select id="fSrGudangTarget" ${dis}>
                ${SR_GUDANG_LIST.map(g=>`<option ${row.gudangTarget===g?'selected':''}>${g}</option>`).join('')}
              </select>
            </td>
          </tr>
          <tr>
            <td class="flabel">ED (Bulan)</td>
            <td>
              <div class="input-with-btn">
                <input type="number" id="fSrEd" min="0" value="${row.edBulan||0}" ${dis} style="max-width:120px;">
                ${!isView ? `<button type="button" class="icon-btn edit" id="srEdSearch" title="Pilih ED (Bulan)">${icon('search',14)}</button>` : ''}
              </div>
            </td>
            <td class="flabel"></td>
            <td></td>
          </tr>
        </table>

        <div class="card-header dark-header" style="border-radius:6px;margin-bottom:14px;"><h3>${icon('clipboard',14)} Rincian Stock Request</h3></div>

        <div id="srGroupsWrap">
          ${groups.map((g,gi)=>tplSrGroupBlock(g,gi,isView)).join('')}
        </div>

        <table class="field-table" style="margin-top:4px;">
          <tr>
            <td class="flabel">Keterangan</td>
            <td><input type="text" id="fSrKeterangan" value="${row.keterangan||''}" ${dis}></td>
          </tr>
        </table>

        <div style="font-size:11.8px;color:var(--text-light);margin-top:6px;line-height:1.7;">
          ${row.tglInput ? `Tgl. Input : ${row.tglInput}  User Entry : ${row.userInput||''}<br>` : ''}
          ${row.tglEdit ? `Tgl Edit : ${row.tglEdit}  User Edit : ${row.userEdit||''}` : ''}
        </div>

        <div class="form-page-actions">
          ${isView
            ? `<a href="#" id="srTutup" class="link-add" style="margin-right:auto;">&larr; Kembali ke Daftar</a>`
            : `<a href="#" id="srBatalkan" class="link-add" style="margin-right:auto;">Batalkan</a>
               <button class="btn-primary" id="srSimpan">Simpan</button>`}
        </div>
      </div>
    </div>`;
}

function tplSrDeleteConfirm(row){
  return `
    <div class="modal-box">
      <div class="modal-header"><span>Hapus Stock Request</span><span class="close" id="modalClose">&times;</span></div>
      <div class="modal-body"><p>Yakin ingin menghapus Stock Request <b>${row.no}</b>?</p></div>
      <div class="modal-footer">
        <button class="btn-secondary" id="modalCancel">Batal</button>
        <button class="btn-danger" id="modalDelete">Hapus</button>
      </div>
    </div>`;
}

function tplSrInfoModal(title,text){
  return `
    <div class="modal-box">
      <div class="modal-header"><span>${title}</span><span class="close" id="modalClose">&times;</span></div>
      <div class="modal-body"><p>${text}</p></div>
      <div class="modal-footer">
        <button class="btn-primary" id="modalOk">Mengerti</button>
      </div>
    </div>`;
}

/* Sejak modul Reordering Sheet dibangun (2026-08-21), picker ini
   menyaring DATA.reorderingSheet SUNGGUHAN (bukan dummy lagi) — lihat
   openSrRosPicker() di stock-request.js. Reordering Sheet yang sudah
   punya Stock Request lain (r.stockRequest terisi & bukan punya baris
   Stock Request yang sedang diedit ini) TETAP ditampilkan (dipilih ulang
   akan menimpa referensi lama, sama seperti pola picker No.SQ/No.SP di
   modul lain) — mockup ini tidak menegakkan validasi 1:1 yang ketat. */
function tplSrRosPicker(list){
  return `
    <div class="modal-box" style="max-width:560px;">
      <div class="modal-header"><span>Pilih Reordering Sheet</span><span class="close" id="modalClose">&times;</span></div>
      <div class="modal-body">
        <div class="table-wrap"><table>
          <thead><tr><th>No. Reordering Sheet</th><th>Cabang</th><th>Tanggal</th><th></th></tr></thead>
          <tbody>
            ${list.length ? list.map(r=>`
              <tr>
                <td>${r.no}</td>
                <td>${r.cabang}</td>
                <td>${r.tglRos}</td>
                <td><button class="btn-pick" data-pick-ros="${r.no}">Pilih</button></td>
              </tr>`).join('') : `<tr><td colspan="4" style="color:var(--text-light);">Tidak ada data Reordering Sheet</td></tr>`}
          </tbody>
        </table></div>
      </div>
      <div class="modal-footer">
        <button class="btn-secondary" id="modalCancel">Tutup</button>
      </div>
    </div>`;
}

function tplSrEdPicker(options){
  return `
    <div class="modal-box" style="max-width:360px;">
      <div class="modal-header"><span>Pilih ED (Bulan)</span><span class="close" id="modalClose">&times;</span></div>
      <div class="modal-body">
        <p style="margin-bottom:10px;">Ambang batas sisa masa kadaluarsa barang (dalam bulan) yang akan ditampilkan di rincian Stock Request.</p>
        <div style="display:flex;gap:8px;flex-wrap:wrap;">
          ${options.map(v=>`<button class="btn-pick" data-pick-ed="${v}" style="padding:7px 14px;">${v} bln</button>`).join('')}
        </div>
      </div>
      <div class="modal-footer">
        <button class="btn-secondary" id="modalCancel">Tutup</button>
      </div>
    </div>`;
}
