/* =========================================================
   TEMPLATE (HTML saja) — Reordering Sheet (Persediaan Barang >
   Daftar Transaksi > Reordering Sheet, page:'reorderingSheet').
   Logic-nya ada di file sebelah: reordering-sheet.js

   Sebelumnya placeholder murni. Dibangun 2026-08-21 sesuai 2
   screenshot MASERP yang dikirim user: "Reordering Sheet List"
   (list, tombol header "Setting Alpha"/"Setting Faktorial"/
   "+Tambah", kolom Stock Request yang bisa terisi link ke Stock
   Request nyata) dan "+ Reordering Sheet" (form Tambah, dengan
   filter Principal/Pusat Bisnis/Kategori/Persediaan Barang lalu
   tombol "Generate Barang" mengisi tabel rincian barang yang
   sangat lebar — History Sales 6 Bulan/Alpha/Faktorial/Average/
   Forecast/dst.).

   SUMBER DATA rincian barang — 2 KATEGORI, dibedakan tegas:
   (1) REAL & bisa diverifikasi silang lewat modul lain: kolom
   "On Hand"/"Qty. BoPo"/"Available" diambil LANGSUNG dari
   DATA.persediaan (BUKAN DATA.items) — array yang sudah berisi
   stok PER CABANG (qtyPhysical/qtyBoPo/qtyAvailable/kodeKategori/
   satuan, dipakai juga oleh picker openPersediaanPicker() di
   core.js). Filter "Kat. Reordering Sheet" & "Persediaan Barang"
   BENAR-BENAR menyaring DATA.persediaan (kodeKategori/kodeBarang),
   jadi hasil "Generate Barang" selalu konsisten dengan modul
   Persediaan yang sebenarnya.
   (2) ILUSTRATIF/simplifikasi, TIDAK ada modul sumbernya di mockup
   ini (History Sales 6 bulan, Sales Agt, Outstanding DR, Qty BoSo,
   Qty Picking List) — mockup ini tidak punya modul riwayat
   penjualan bulanan per barang, jadi angka2 ini diisi wajar/masuk
   akal untuk mendemokan alur & rule Reordering Sheet (termasuk
   rule highlight merah Forecast vs Average di bawah), TAPI tidak
   bisa & tidak dimaksudkan untuk dicocokkan ke modul lain manapun
   — didokumentasikan eksplisit sebagai simplifikasi, bukan bug.
   Alpha/Faktorial demikian juga (nilai dari tombol "Setting
   Alpha"/"Setting Faktorial" yang didekorasikan/belum ada modul
   settingnya). Max Stock default 0 kalau ROS belum dianalisa user
   (tidak ada field ini di master Inventory/Persediaan) —
   konsekuensinya Should Reorder & saran Reorder ikut 0, persis
   kondisi baris sample di screenshot asli (On Hand 1.860 tapi
   Should Reorder 0 karena Max Stock belum diisi); baris yang SUDAH
   dianalisa (misal yang sudah dibuatkan Stock Request) diisi Max
   Stock/Forecast/Reorder yang wajar.

   RANTAI dengan modul Stock Request (sudah ada sejak awal):
   sebelumnya field "No. Reordering Sheet" di form Stock Request
   memakai SR_REORDERING_SHEET_LIST dekoratif (karena modul ini
   belum ada) — SEKARANG diganti nge-refer DATA.reorderingSheet
   sungguhan (lihat js/pages/stock-request.template.js/.js,
   rantai mundur seperti precedent Sales Order->Sales Quotation).
   Tombol "Buat Stock Request" di list bawah ini men-generate 1
   baris DATA.stockRequest BARU sungguhan (bukan dekoratif) dari
   rincian barang Reordering Sheet yang bersangkutan.
========================================================= */

const ROS_CABANG_LIST = ['Head Office','Surabaya','Bandung','Tangerang','Medan','Makassar','Semarang','Sidoarjo'];
const ROS_CABANG_CODE = {'Head Office':'HO','Surabaya':'SBY','Bandung':'BDG','Tangerang':'TGR','Medan':'MDN','Makassar':'MKS','Semarang':'SMG','Sidoarjo':'SDA'};
const ROS_TIPE_LIST = ['Reordering Sheet Reguler','Reordering Sheet Konsinyasi'];
const ROS_METODE_LIST = ['XP','FIFO','Manual'];
const ROS_PERIODE_LIST = ['Juni 2026','Juli 2026','Agustus 2026'];
const ROS_HIST_MONTHS = ['Feb','Mar','Apr','Mei','Jun','Jul'];

function tplReorderingSheetListPage(){
  return `
    <div class="breadcrumb">Home / <b>Reordering Sheet</b></div>
    <div class="card">
      <div class="card-header dark-header">
        <h3>${icon('alertTriangle',15)} Reordering Sheet List</h3>
        <div class="toolbar-actions">
          <button class="btn-teal" id="btnRosSettingAlpha">Setting Alpha</button>
          <button class="btn-teal" id="btnRosSettingFaktorial">Setting Faktorial</button>
          <button class="btn-primary" id="btnRosAdd">${icon('plus',14)} Tambah</button>
        </div>
      </div>
      <div class="table-toolbar">
        <select id="rosPageSize"><option selected>10</option><option>25</option><option>50</option></select>
        <input type="text" id="rosSearch" placeholder="Pencarian Global">
      </div>
      <div class="table-wrap"><table>
        <thead><tr>
          <th>No. Transaksi</th>
          <th>Tgl.</th>
          <th>Cabang</th>
          <th>Tgl. Input</th>
          <th>User Entry</th>
          <th>Stock Request</th>
          <th>Lihat</th>
          <th>Cetak</th>
          <th>Ubah</th>
          <th>Hapus</th>
          <th>Buat Stock<br>Request</th>
        </tr></thead>
        <tbody id="rosTbody"></tbody>
      </table></div>
      <div class="table-footer"><div class="pager" id="rosPager"></div><div id="rosTotal"></div></div>
    </div>`;
}

function tplRosRows(rows, page, pageSize){
  if(!rows.length) return `<tr><td colspan="11" style="color:var(--text-light);">Tidak ada data Reordering Sheet</td></tr>`;
  const start = (page-1)*pageSize;
  return rows.slice(start, start+pageSize).map((r) => {
    const idx = DATA.reorderingSheet.indexOf(r);
    const locked = !!r.stockRequest;
    return `
    <tr>
      <td><a href="#" class="row-link" data-view="${idx}">${r.no}</a></td>
      <td>${r.tglRos||''}</td>
      <td>${r.cabang||''}</td>
      <td>${r.tglInput||''}</td>
      <td>${r.userEntry||''}</td>
      <td>${r.stockRequest ? `<span style="color:var(--blue);font-weight:600;">${r.stockRequest}</span>` : ''}</td>
      <td><button class="icon-btn view" data-view="${idx}" title="Lihat">${icon('eye',15)}</button></td>
      <td><button class="icon-btn print" data-print="${idx}" title="Cetak">${icon('printer',15)}</button></td>
      <td><button class="icon-btn edit" data-edit="${idx}" ${locked?'disabled style="opacity:.45;cursor:not-allowed;"':''} title="Ubah">${icon('edit',15)}</button></td>
      <td><button class="icon-btn del" data-del="${idx}" ${locked?'disabled style="opacity:.45;cursor:not-allowed;"':''} title="Hapus">${icon('trash',15)}</button></td>
      <td><button class="icon-btn edit" data-buat-sr="${idx}" title="Buat Stock Request">${icon('save',15)}</button></td>
    </tr>`;
  }).join('');
}

function tplRosPager(page, totalPages){
  if(totalPages <= 1) return '';
  let btns = `<button data-rospage="1">First</button><button data-rospage="${Math.max(1,page-1)}">Previous</button>`;
  for(let p=1;p<=totalPages;p++){ btns += `<button data-rospage="${p}" class="${p===page?'active':''}">${p}</button>`; }
  btns += `<button data-rospage="${Math.min(totalPages,page+1)}">Next</button><button data-rospage="${totalPages}">Last</button>`;
  return btns;
}

function tplRosItemRow(it, ii, dis){
  const forecastBad = it.average > 0 && Math.abs(it.forecast - it.average) > it.average * 0.25;
  return `
    <tr>
      <td>${ii+1}</td>
      <td>${it.kode}</td>
      <td>${it.nama}</td>
      ${it.hist.map(v=>`<td style="text-align:right;">${num(v)}</td>`).join('')}
      <td style="text-align:right;">${it.alpha}</td>
      <td style="text-align:right;">${it.faktorial}</td>
      <td style="text-align:right;">${num(it.average)}</td>
      <td><input type="number" min="0" step="1" data-ros-forecast="${ii}" value="${it.forecast}" ${dis} style="width:70px;${forecastBad?'border-color:var(--red);color:var(--red);background:#fff2f2;':''}"></td>
      <td><input type="text" data-ros-ket="${ii}" value="${it.keteranganItem||''}" ${dis} style="width:90px;"></td>
      <td style="text-align:right;">${num(it.salesAgt)}</td>
      <td style="text-align:right;">${num(it.onHand)}</td>
      <td style="text-align:right;">${num(it.qtyBoPo)}</td>
      <td style="text-align:right;">${num(it.outstandingDR)}</td>
      <td style="text-align:right;">${num(it.qtyBoSo)}</td>
      <td style="text-align:right;">${num(it.qtyPickingList)}</td>
      <td style="text-align:right;">${num(it.available)}</td>
      <td><input type="number" min="0" step="1" data-ros-maxstock="${ii}" value="${it.maxStock}" ${dis} style="width:70px;"></td>
      <td style="text-align:right;">${num(it.shouldReorder)}</td>
      <td style="text-align:right;">${num(it.qtyKelipatanOrder)}</td>
      <td style="text-align:right;">${num(it.konversiKarton)}</td>
      <td><input type="number" min="0" step="1" data-ros-reorder="${ii}" value="${it.reorder}" ${dis} style="width:80px;"></td>
      <td style="text-align:center;">${it.pareto||''}</td>
    </tr>`;
}

function tplRosItemsTable(items, dis){
  return `
    <table class="ros-item-table">
      <thead>
        <tr>
          <th rowspan="2">No</th><th rowspan="2">Kode</th><th rowspan="2">Nama</th>
          <th colspan="6">History Sales Area 6 Bulan Terakhir</th>
          <th rowspan="2">Alpha</th><th rowspan="2">Faktorial</th><th rowspan="2">Average</th>
          <th rowspan="2">Forecast</th><th rowspan="2">Keterangan</th>
          <th rowspan="2">Sales Agt</th><th rowspan="2">On Hand</th><th rowspan="2">Qty. BoPo</th>
          <th rowspan="2">Outstanding<br>DR</th><th rowspan="2">Qty. BoSo</th><th rowspan="2">Qty. Picking<br>List</th>
          <th rowspan="2">Available</th><th rowspan="2">Max<br>Stock</th><th rowspan="2">Should<br>Reorder</th>
          <th rowspan="2">Qty Kelipatan<br>Order</th><th rowspan="2">Konversi isi<br>dalam Karton</th>
          <th rowspan="2">Reorder</th><th rowspan="2">Pareto<br>Sales</th>
        </tr>
        <tr>${ROS_HIST_MONTHS.map(m=>`<th>${m}</th>`).join('')}</tr>
      </thead>
      <tbody id="rosItemsBody">
        ${items.length ? items.map((it,ii)=>tplRosItemRow(it,ii,dis)).join('') : `<tr><td colspan="24" style="color:var(--text-light);padding:14px;">Belum ada barang — klik "Generate Barang" setelah mengisi filter di atas.</td></tr>`}
      </tbody>
    </table>`;
}

function tplReorderingSheetForm(mode, row, items){
  const isAdd = mode === 'add';
  const isView = mode === 'view';
  const dis = isView ? 'disabled' : '';
  const titleAction = isAdd ? '+ Reordering Sheet' : (isView ? 'Lihat Reordering Sheet' : 'Ubah Reordering Sheet');
  return `
    <div class="breadcrumb">Home / Reordering Sheet / <b>${isAdd?'Tambah':(isView?'Lihat':'Ubah')}</b></div>
    ${row.stockRequest ? `<div class="alert-warning">Reordering Sheet ini sudah dibuatkan Stock Request <b>${row.stockRequest}</b> — tidak bisa diubah lagi.</div>` : ''}
    <div class="card">
      <div class="card-header dark-header"><h3>${icon('alertTriangle',15)} ${titleAction}</h3></div>
      <div class="card-body">
        <div class="form-grid">
          <div class="form-group">
            <label>No.Reordering Sheet</label>
            <div class="input-with-btn">
              <input type="text" id="fRosNo" value="${row.no||''}" placeholder="Otomatis" readonly>
              ${isAdd ? `<button type="button" class="icon-btn edit" id="rosRefreshNo" title="Generate Nomor">${icon('refreshCw',14)}</button>` : ''}
            </div>
          </div>
          <div class="form-group">
            <label>Tipe Reordering Sheet</label>
            <select id="fRosTipe" ${dis}>
              ${ROS_TIPE_LIST.map(t=>`<option ${row.tipe===t?'selected':''}>${t}</option>`).join('')}
            </select>
            <div style="font-size:11.5px;color:var(--text-light);margin-top:6px;">
              Tgl. Input : ${row.tglInput||'-'}<br>User Entry : ${row.userEntry||'-'}
            </div>
          </div>
        </div>
        <div class="form-grid">
          <div class="form-group">
            <label>Tgl.Reordering Sheet</label>
            <div class="input-with-btn">
              <input type="text" id="fRosTgl" value="${row.tglRos||''}" ${dis}>
              <span class="icon-btn edit" style="pointer-events:none;">${icon('calendar',14)}</span>
            </div>
          </div>
          <div class="form-group">
            <label>Periode</label>
            <select id="fRosPeriode" ${dis}>
              ${ROS_PERIODE_LIST.map(p=>`<option ${row.periode===p?'selected':''}>${p}</option>`).join('')}
            </select>
          </div>
        </div>
        <div class="form-grid">
          <div class="form-group">
            <label>Cabang</label>
            <select id="fRosCabang" ${(!isAdd)?'disabled':''}>
              ${ROS_CABANG_LIST.map(c=>`<option ${row.cabang===c?'selected':''}>${c}</option>`).join('')}
            </select>
          </div>
          <div class="form-group">
            <label>Metode</label>
            <select id="fRosMetode" ${dis}>
              ${ROS_METODE_LIST.map(m=>`<option ${row.metode===m?'selected':''}>${m}</option>`).join('')}
            </select>
          </div>
        </div>
        <div class="form-group">
          <label>Keterangan</label>
          <textarea id="fRosKeterangan" placeholder="Keterangan" rows="2" ${dis}>${row.keterangan||''}</textarea>
        </div>

        ${!isView ? `
        <div class="form-grid">
          <div class="form-group">
            <label>Filter Principal</label>
            <div class="input-with-btn">
              <input type="text" id="fRosPrincipal" value="${row.filterPrincipal||''}" placeholder="Pilih Principal" readonly>
              <button type="button" class="icon-btn edit" id="rosPrincipalSearch" title="Cari Principal">${icon('search',14)}</button>
            </div>
          </div>
          <div class="form-group"></div>
        </div>
        <div class="form-grid">
          <div class="form-group">
            <label>Filter Pusat Bisnis</label>
            <div class="input-with-btn">
              <input type="text" id="fRosPusatBisnis" value="${row.filterPusatBisnis||''}" placeholder="Pilih Pusat Bisnis..." readonly>
              <button type="button" class="icon-btn edit" id="rosPusatBisnisSearch" title="Cari Pusat Bisnis">${icon('search',14)}</button>
            </div>
          </div>
          <div class="form-group">
            <label>Filter Kat. Reordering Sheet</label>
            <div class="input-with-btn">
              <input type="text" id="fRosKategori" value="${row.filterKategoriNama||''}" placeholder="Pilih Kategori..." readonly>
              <button type="button" class="icon-btn edit" id="rosKategoriSearch" title="Cari Kategori">${icon('search',14)}</button>
            </div>
          </div>
        </div>
        <div class="form-grid">
          <div class="form-group">
            <label>Filter Persediaan Barang</label>
            <div class="input-with-btn">
              <input type="text" id="fRosPersediaan" value="${row.filterPersediaanNama||''}" placeholder="Semua barang (kosongkan utk semua)" readonly>
              <button type="button" class="icon-btn edit" id="rosPersediaanSearch" title="Cari Barang">${icon('search',14)}</button>
            </div>
          </div>
          <div class="form-group"></div>
        </div>
        <div style="display:flex;gap:10px;margin-bottom:16px;">
          <button class="btn-primary" id="rosGenerateBarang">Generate Barang</button>
          <button class="btn-teal" id="rosExportImport">Export / Import Data Detail</button>
        </div>` : ''}

        <div style="font-size:12px;font-weight:700;margin-bottom:8px;">Note: Apabila berwarna merah, maka qty forecast lebih kecil atau lebih besar dari 25% dari nilai average</div>

        <div class="table-toolbar">
          <select id="rosItemPageSize"><option selected>10</option><option>25</option><option>50</option></select>
          <input type="text" id="rosItemSearch" placeholder="Pencarian Global">
        </div>
        <div class="table-wrap" style="overflow-x:auto;">
          <div id="rosItemsWrap">${tplRosItemsTable(items, dis)}</div>
        </div>

        <div class="form-page-actions">
          ${isView
            ? `<a href="#" id="rosTutup" class="link-add" style="margin-right:auto;">&larr; Kembali ke Daftar</a>`
            : `<a href="#" id="rosBatalkan" class="link-add" style="margin-right:auto;">Batalkan</a>
               <button class="btn-primary" id="rosSimpan">Simpan</button>`}
        </div>
      </div>
    </div>`;
}

function tplRosDeleteConfirm(row){
  return `
    <div class="modal-box">
      <div class="modal-header"><span>Hapus Reordering Sheet</span><span class="close" id="modalClose">&times;</span></div>
      <div class="modal-body"><p>Yakin ingin menghapus Reordering Sheet <b>${row.no}</b>?</p></div>
      <div class="modal-footer">
        <button class="btn-secondary" id="modalCancel">Batal</button>
        <button class="btn-danger" id="modalDelete">Hapus</button>
      </div>
    </div>`;
}

function tplRosBuatSrConfirm(row, itemCount){
  return `
    <div class="modal-box">
      <div class="modal-header"><span>Buat Stock Request</span><span class="close" id="modalClose">&times;</span></div>
      <div class="modal-body">
        <p>Buat 1 Stock Request baru dari Reordering Sheet <b>${row.no}</b> (${itemCount} barang dengan kolom Reorder &gt; 0)?</p>
        <p style="color:var(--text-light);font-size:12px;">Setelah dibuat, Reordering Sheet ini tidak bisa diubah/dihapus lagi (Ubah &amp; Hapus akan terkunci).</p>
      </div>
      <div class="modal-footer">
        <button class="btn-secondary" id="modalCancel">Batal</button>
        <button class="btn-primary" id="modalBuatSr">Buat Stock Request</button>
      </div>
    </div>`;
}

function tplRosInfoModal(title, text){
  return `
    <div class="modal-box">
      <div class="modal-header"><span>${title}</span><span class="close" id="modalClose">&times;</span></div>
      <div class="modal-body"><p>${text}</p></div>
      <div class="modal-footer"><button class="btn-primary" id="modalOk">Mengerti</button></div>
    </div>`;
}

function tplRosSimplePicker(title, rows){
  return `
    <div class="modal-box" style="max-width:460px;">
      <div class="modal-header"><span>${title}</span><span class="close" id="modalClose">&times;</span></div>
      <div class="modal-body" style="max-height:360px;overflow-y:auto;">
        <table><tbody>
          ${rows.length ? rows.map(r=>`<tr class="ros-pick-row" data-kode="${r.kode}" data-label="${r.label}" style="cursor:pointer;"><td style="padding:8px 10px;border-bottom:1px solid var(--border);">${r.label}</td></tr>`).join('') : `<tr><td style="color:var(--text-light);padding:10px;">Tidak ada data.</td></tr>`}
        </tbody></table>
      </div>
      <div class="modal-footer"><button class="btn-secondary" id="modalCancel">Tutup</button></div>
    </div>`;
}
