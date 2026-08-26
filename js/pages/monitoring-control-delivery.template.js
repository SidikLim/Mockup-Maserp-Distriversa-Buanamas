/* =========================================================
   TEMPLATE (HTML saja) — Monitoring Control Delivery (Customer
   & Penjualan > Daftar Transaksi > Monitoring Control Delivery,
   page:'monitoringControlDelivery'). Semua fungsi di file ini
   HANYA menyusun & mengembalikan markup HTML (string), TIDAK
   ada logic/DOM-binding/data mutation di sini. Logic-nya ada
   di file sebelah: monitoring-control-delivery.js

   Menggantikan menu "Tracking Status" (sebelumnya placeholder
   murni sejak awal `js/menu.js`) sesuai 5 screenshot MASERP yang
   dikirim user 2026-08-26: list "Monitoring Control Delivery
   List" (toolbar page-size+Global Search+dropdown status "All"+
   chip periode dekoratif, kolom No Invoice/No Picking List/No.
   S.O./Tgl. S.J./Customer/Status/History/Update Status, pager
   windowed, Total Record besar [1218 di instalasi Sidik sendiri]),
   modal "History Monitoring Control Delivery" (tabel Tanggal/
   Username/Status/Keterangan, beberapa baris berlabel "Print"),
   dropdown aksi 2-opsi pada tombol "Diterima Customer" (opsi
   "Diterima Customer"/"Sudah Tukar Faktur / Pemberkasan"), modal
   "Diterima Customer" (radio Diterima/Ditolak Full/Ditolak
   Sebagian + Nama Penerima + Keterangan), dan dropdown filter
   status "All" (daftar 8 status alur pengiriman + All).

   TIDAK ADA data/array baru — modul ini murni "lapisan monitoring"
   di atas `DATA.invoices` yang SUDAH ADA (No Invoice/No Picking
   List/No. S.O./Tgl. S.J./Customer diambil langsung dari field
   `no`/`noPL`/`noSO`/`tgl`/`customerNama` yang sudah ada sejak
   modul Invoice dibangun) — HANYA field baru `mcdHistory` (array
   riwayat status pengiriman) ditambahkan ke tiap baris
   `DATA.invoices` (lihat komentar besar di `js/data.js`). Status
   "saat ini" tiap baris TIDAK disimpan terpisah — selalu computed
   dari entri TERAKHIR `row.mcdHistory` (mcdCurrentStatus() di
   monitoring-control-delivery.js), pola sama "computed bukan
   disimpan" yang sudah dipakai banyak modul lain di mockup ini.

   Downsize volume: "Total Record: 1218" di screenshot asli TIDAK
   direplikasi — modul ini menampilkan SELURUH baris `DATA.invoices`
   yang sudah ada (10 baris saat ini), konsisten precedent
   downsize-volume banyak modul lain (Master Rayon, Price List By
   Province, dst.) DITAMBAH prinsip "reuse data existing, jangan
   duplikasi array baru" yang sudah dipakai laporan-laporan Report
   Center (FA-08/Bonus Penjualan/Transfer Produk Bonus).

   Alur status (8 tahap, urutan sesuai dropdown filter "All" di
   screenshot): Create Invoice -> Print Invoice -> Serah Terima ke
   Tim Pengantar (G) [langsung dari Gudang cabang, rute "Direct"]
   -> Diterima Sales Office (SO) -> Serah Terima ke Tim Pengantar
   (SO) [rute relay lewat Sales Office cabang lain dulu] -> Diterima
   Customer -> Faktur -> Sudah Tukar Faktur / Pemberkasan. TIDAK
   SEMUA baris melewati SEMUA 8 tahap secara linear — screenshot
   History (baris BDG contoh) menunjukkan rute "Direct" bisa
   melompat dari "Serah Terima ke Tim Pengantar (G)" tanpa tahap
   SO sama sekali, konsisten precedent itu direproduksi di sample
   data ini (lihat js/data.js: sebagian baris rute Direct, sebagian
   rute lewat SO, berdasarkan field `shipVia`/`driver` yang SUDAH
   ADA di baris Invoice masing-masing). Tahap "Faktur" HANYA
   di-seed pada baris yang `posted:true` (mencerminkan status
   Invoice yang sudah benar-benar diposting di modul Invoice
   sendiri) — TIDAK ada logic otomatis di modul ini yang menambah
   tahap "Faktur" secara reaktif kalau status `posted` Invoice
   diubah belakangan (simplifikasi, didokumentasikan eksplisit:
   MCD di mockup ini adalah snapshot riwayat, bukan live-binding
   ke status Invoice).

   2 aksi interaktif SUNGGUHAN (lewat dropdown tombol "Diterima
   Customer"): (1) "Diterima Customer" — modal radio Diterima/
   Ditolak Full/Ditolak Sebagian + Nama Penerima + Keterangan,
   menambah 1 entri baru ke `row.mcdHistory` sesuai pilihan radio;
   (2) "Sudah Tukar Faktur / Pemberkasan" — modal konfirmasi
   sederhana (Keterangan opsional), menambah entri final. KEDUA
   aksi ini SELALU tersedia utk baris manapun (tidak divalidasi
   terhadap urutan tahap yang "seharusnya" — simplifikasi yang
   sama filosofinya dengan banyak aksi dekoratif/semi-fungsional
   lain di mockup ini, supaya demo tidak terkunci oleh state
   tertentu). Tombol refresh (ikon kuning) di sebelah tombol
   Update Status bersifat DEKORATIF (info modal) — tidak ada
   fungsi nyata yang jelas dari screenshot untuk tombol ini.

   Dropdown status filter "All" & dropdown aksi "Diterima
   Customer" DIIMPLEMENTASI sebagai menu kecil `position:fixed`
   (dihitung dari getBoundingClientRect() tombol pemicu, di-
   append ke `document.body`, ditutup lewat listener klik-di-
   luar) — BUKAN modal `.modal-overlay` penuh (yang menggelapkan
   seluruh layar) karena screenshot menunjukkan menu kecil yang
   TIDAK menggelapkan layar. Ini pola BARU (belum ada modul lain
   yang butuh dropdown kecil non-modal seperti ini, beda dari
   `.notif-dropdown` topbar yang di-append sebagai child tombolnya
   sendiri) — dipakai `position:fixed` supaya aman dari potensi
   ke-clip oleh `.table-wrap{overflow-x:auto}` pada tabel list. */

const MCD_STATUSES = [
  'Create Invoice',
  'Print Invoice',
  'Serah Terima ke Tim Pengantar (G)',
  'Diterima Sales Office (SO)',
  'Serah Terima ke Tim Pengantar (SO)',
  'Diterima Customer',
  'Faktur',
  'Sudah Tukar Faktur / Pemberkasan',
];

function tplMcdListPage(){
  return `
    <div class="breadcrumb">Home / <b>Monitoring Control Delivery</b></div>
    <div class="card">
      <div class="card-header dark-header">
        <h3>${icon('truck',15)} Monitoring Control Delivery List</h3>
        <div class="toolbar-actions">
          <button class="chip-btn" id="btnMcdStatusFilter">All ${icon('chevronDown',12)}</button>
          <button class="chip-btn" id="btnMcdPeriode">Agustus 2026 ${icon('chevronDown',12)}</button>
        </div>
      </div>
      <div class="table-toolbar">
        <select id="mcdPageSize"><option selected>10</option><option>20</option><option>50</option></select>
        <input type="text" id="mcdSearch" placeholder="Global Search">
      </div>
      <div class="table-wrap"><table>
        <thead><tr>
          <th>No Invoice</th>
          <th>No Picking List</th>
          <th>No. S.O.</th>
          <th>Tgl. S.J.</th>
          <th>Customer</th>
          <th>Status</th>
          <th style="width:70px;">History</th>
          <th style="width:210px;">Update Status</th>
        </tr></thead>
        <tbody id="mcdTbody"></tbody>
      </table></div>
      <div class="table-footer"><div class="pager" id="mcdPager"></div><div id="mcdTotal"></div></div>
    </div>`;
}

function tplMcdRows(rows){
  if(!rows.length) return `<tr><td colspan="8" style="color:var(--text-light);text-align:center;">Tidak Ada Data</td></tr>`;
  return rows.map((r)=>{
    const idx = DATA.invoices.indexOf(r);
    const status = mcdCurrentStatus(r);
    return `
    <tr>
      <td><a href="#" class="row-link" data-mcd-open="${idx}" style="color:var(--blue);font-weight:600;">${r.no}</a></td>
      <td>${r.noPL||'-'}</td>
      <td>${r.noSO||'-'}</td>
      <td>${r.tgl||'-'}</td>
      <td>${r.customerNama||'-'}</td>
      <td>${status}</td>
      <td><button class="icon-btn view" data-mcd-history="${idx}" title="History">${icon('eye',15)}</button></td>
      <td>
        <div class="mcd-action-wrap">
          <button class="btn-mcd-teal" data-mcd-action="${idx}" type="button">Diterima Customer ${icon('chevronDown',11)}</button>
          <button class="icon-btn refresh" data-mcd-refresh="${idx}" type="button" title="Refresh">${icon('refreshCw',13)}</button>
        </div>
      </td>
    </tr>`;
  }).join('');
}

/* Pager windowed (maks. 7 nomor halaman) — SALINAN LOKAL dari pola
   tplZkaPager() (Zat Kandungan Aktif, 2026-08-21), bukan reference
   cross-file karena lazy-load antar modul tidak terjamin urutannya. */
function tplMcdPager(page, totalPages){
  const windowSize = 7;
  let start = Math.max(1, page - Math.floor(windowSize/2));
  let end = Math.min(totalPages, start + windowSize - 1);
  start = Math.max(1, end - windowSize + 1);
  let nums = '';
  for(let p=start; p<=end; p++){
    nums += `<button data-mcdpage="${p}" class="${p===page?'active':''}">${p}</button>`;
  }
  return `
    <button data-mcdpage="1" ${page<=1?'disabled':''}>First</button>
    <button data-mcdpage="${Math.max(1,page-1)}" ${page<=1?'disabled':''}>Previous</button>
    ${nums}
    <button data-mcdpage="${Math.min(totalPages,page+1)}" ${page>=totalPages?'disabled':''}>Next</button>
    <button data-mcdpage="${totalPages}" ${page>=totalPages?'disabled':''}>Last</button>`;
}

/* Menu kecil (dropdown non-modal) — dipakai utk filter status "All"
   maupun dropdown aksi "Diterima Customer". `items` = [{label,value}]. */
function tplMcdMiniMenu(items, dataAttr){
  return `
    <div class="mcd-menu">
      ${items.map(it=>`<button type="button" data-${dataAttr}="${it.value}">${it.label}</button>`).join('')}
    </div>`;
}

function tplMcdHistoryModal(row){
  const rows = row.mcdHistory||[];
  return `
    <div class="modal-box" style="max-width:720px;">
      <div class="modal-header"><span>History Monitoring Control Delivery</span><span class="close" id="modalClose">&times;</span></div>
      <div class="modal-body">
        <div class="table-wrap"><table>
          <thead><tr><th style="width:150px;">Tanggal</th><th style="width:120px;">Username</th><th>Status</th><th>Keterangan</th></tr></thead>
          <tbody>
            ${rows.map(h=>`
              <tr>
                <td>${h.tanggal}</td>
                <td>${h.username}</td>
                <td>${h.status}${h.printBadge?` <span class="tag-chip" data-mcd-print="1" style="cursor:pointer;">${icon('printer',11)} Print</span>`:''}</td>
                <td>${(h.keterangan||'').split('\\n').join('<br>')}</td>
              </tr>`).join('')}
          </tbody>
        </table></div>
      </div>
      <div class="modal-footer"><button class="btn-secondary" id="modalCancel">Tutup</button></div>
    </div>`;
}

function tplMcdDiterimaModal(row, idx){
  return `
    <div class="modal-box" style="max-width:460px;">
      <div class="modal-header"><span>Diterima Customer</span><span class="close" id="modalClose">&times;</span></div>
      <div class="modal-body">
        <div class="form-group">
          <label>Diterima Customer</label>
          <div class="radio-inline">
            <label><input type="radio" name="mcdDiterimaOpt" value="Diterima" checked> Diterima</label>
            <label><input type="radio" name="mcdDiterimaOpt" value="Ditolak Full"> Ditolak Full</label>
            <label><input type="radio" name="mcdDiterimaOpt" value="Ditolak Sebagian"> Ditolak Sebagian</label>
          </div>
        </div>
        <div class="form-group">
          <label>Nama Penerima:</label>
          <input type="text" id="fMcdNamaPenerima" placeholder="Masukan Nama Penerima">
        </div>
        <div class="form-group">
          <label>Keterangan:</label>
          <textarea id="fMcdKeterangan" class="po-textarea" rows="3" placeholder="Masukan keterangan"></textarea>
        </div>
        <div class="form-error" id="fMcdErr"></div>
      </div>
      <div class="modal-footer">
        <button class="btn-primary" id="modalSave">Simpan</button>
        <button class="btn-secondary" id="modalCancel">Batalkan</button>
      </div>
    </div>`;
}

function tplMcdTukarFakturModal(row, idx){
  return `
    <div class="modal-box" style="max-width:460px;">
      <div class="modal-header"><span>Sudah Tukar Faktur / Pemberkasan</span><span class="close" id="modalClose">&times;</span></div>
      <div class="modal-body">
        <p>Tandai transaksi <b>${row.no}</b> sudah tukar faktur / selesai pemberkasan?</p>
        <div class="form-group">
          <label>Keterangan:</label>
          <textarea id="fMcdTukarKeterangan" class="po-textarea" rows="3" placeholder="Keterangan (opsional)"></textarea>
        </div>
      </div>
      <div class="modal-footer">
        <button class="btn-primary" id="modalSave">Simpan</button>
        <button class="btn-secondary" id="modalCancel">Batalkan</button>
      </div>
    </div>`;
}

function tplMcdInfoModal(title, text){
  return `
    <div class="modal-box">
      <div class="modal-header"><span>${title}</span><span class="close" id="modalClose">&times;</span></div>
      <div class="modal-body"><p>${text}</p></div>
      <div class="modal-footer"><button class="btn-primary" id="modalOk">Tutup</button></div>
    </div>`;
}
