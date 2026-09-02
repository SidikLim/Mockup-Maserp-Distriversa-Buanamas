/* =========================================================
   TEMPLATE (HTML saja) — History Credit Limit Customer
   (Customer & Penjualan > Master & Setting > History Credit
   Limit, page:'historyCreditLimit'). Semua fungsi di file ini
   HANYA menyusun & mengembalikan markup HTML (string), TIDAK
   ada logic/DOM-binding di sini. Logic-nya ada di file sebelah:
   history-credit-limit.js
   NB: closeModal() dipakai bersama, didefinisikan di core.js.

   Dibangun 2026-09-02. Sebelumnya placeholder murni. TIDAK ADA
   screenshot MASERP untuk halaman History Credit Limit itu
   sendiri — screenshot yang dikirim user ("Pengajuan Credit
   Limit Customer": kolom Kode/Nama/Alamat Customer, Piutang
   Sekarang, Piutang Giro, Uang Muka Sekarang, lalu 2 grup kolom
   Credit Limit & Dominasi Limit masing² [Limit Sekarang |
   Pengajuan Limit] dengan tombol lihat/simpan teal) HANYA
   menunjukkan LETAK menu ini di sidebar (item "History Credit
   Limit" ada di lingkaran hitam, TEPAT DI BAWAH "Customer"), 1
   baris di atas "Grup Customer" — bukan isi halamannya sendiri.
   User mengonfirmasi (lewat AskUserQuestion) untuk lanjut
   dibangun dengan desain standar berdasar pola history/log yang
   sudah mapan di mockup ini, bukan menunggu screenshot asli.

   Desain: ini KEMBARAN pola "log perubahan" seperti Transaksi
   Persediaan/Master Stock Opname — read-only (TIDAK ADA Tambah/
   Ubah/Hapus, karena ini jejak audit historis, bukan master data
   yang diedit langsung) — menampilkan 1 baris per EVENT
   pengajuan/perubahan Credit Limit ATAU Dominasi Limit per
   customer (kode/nama, tanggal, jenis, limit lama→baru, siapa
   yang mengajukan/menyetujui, status Disetujui/Pending/Ditolak),
   dengan gaya visual (dark-header, table-toolbar page-size+
   Pencarian Global, header kolom sortable dgn ikon ↕/↑/↓, pager
   windowed First/Previous/1..Next/Last, Total Record) PERSIS
   pola Satuan/Zat Kandungan Aktif dkk — supaya tetap konsisten
   dgn seluruh mockup ini walau tidak ada screenshot spesifik.
   Ditambahkan pula 2 filter (Status & Jenis Limit) sebagai
   <select> fungsional di table-toolbar — pola sama filter
   tambahan yang sudah ada di modul log lain (mis. Master Stock
   Opname/Transaksi Persediaan), supaya user bisa menyaring
   riwayat per status/jenis limit.

   Kolom "Lihat" (ikon mata, .icon-btn.view) membuka modal detail
   1 baris (tplHclDetailModal) yang menampilkan Selisih (Limit
   Baru − Limit Lama, computed reaktif diwarnai teal/merah — pola
   sama Master Stock Opname) + Keterangan lengkap (supaya kolom
   tabel utama tidak terlalu lebar untuk teks keterangan panjang).

   DATA `DATA.historyCreditLimit` (16 baris, lihat komentar di
   js/data.js): mencakup 10 customer existing DBM (`DATA.customers`),
   baris "Disetujui" TERAKHIR tiap customer per jenis limit SENGAJA
   disamakan persis dengan nilai `limit`/`dominasiLimit` yang
   SUDAH ADA di `DATA.customers` (satu sumber kebenaran yang sama
   dipakai modul lain, bukan angka independen) — konsisten
   precedent Master Stock Opname (`sistem` diambil dari
   `DATA.persediaan`). 2 baris SENGAJA berstatus "Pending" (belum
   memengaruhi limit berjalan) & 1 baris "Ditolak" (permintaan
   yang tidak disetujui) supaya ketiga status bisa didemokan.
   Nama staf pengaju/penyetuju (Diajukan Oleh/Disetujui Oleh)
   diambil dari `DATA.users` yang SUDAH ADA dengan role FIN
   (finance, pengaju) & MGR (manager, penyetuju) — bukan nama
   fiktif baru, konsisten dgn precedent modul lain yang mereuse
   `DATA.users`.
========================================================= */

const HCL_STATUS_LIST = ['Disetujui','Pending','Ditolak'];
const HCL_JENIS_LIST = ['Credit Limit','Dominasi Limit'];

function hclStatusPillClass(status){
  if(status === 'Disetujui') return 'status-paid';
  if(status === 'Ditolak') return 'status-overdue';
  return 'status-open';
}

function tplHclPage(){
  return `
    <div class="breadcrumb">Home / <b>History Credit Limit</b></div>
    <div class="card">
      <div class="card-header dark-header">
        <h3>${icon('clipboard',15)} Riwayat Credit Limit Customer</h3>
      </div>
      <div class="table-toolbar">
        <select id="hclPageSize"><option selected>10</option><option>25</option><option>50</option></select>
        <input type="text" id="hclSearch" placeholder="Pencarian Global (Kode / Nama Customer)">
        <select id="hclFilterJenis">
          <option value="">Semua Jenis Limit</option>
          ${HCL_JENIS_LIST.map(j=>`<option value="${j}">${j}</option>`).join('')}
        </select>
        <select id="hclFilterStatus">
          <option value="">Semua Status</option>
          ${HCL_STATUS_LIST.map(s=>`<option value="${s}">${s}</option>`).join('')}
        </select>
      </div>
      <div class="table-wrap"><table>
        <thead><tr>
          <th style="width:44px;">No.</th>
          <th>${tplHclSortHeader('Kode Customer','customerKode')}</th>
          <th>${tplHclSortHeader('Nama Customer','customerNama')}</th>
          <th>${tplHclSortHeader('Tanggal','tanggal')}</th>
          <th>Jenis</th>
          <th>Limit Lama</th>
          <th>Limit Baru</th>
          <th>Diajukan Oleh</th>
          <th>Disetujui Oleh</th>
          <th>${tplHclSortHeader('Status','status')}</th>
          <th style="width:60px;">Lihat</th>
        </tr></thead>
        <tbody id="hclTbody"></tbody>
      </table></div>
      <div class="table-footer"><div class="pager" id="hclPager"></div><div id="hclTotal"></div></div>
    </div>`;
}

function tplHclSortHeader(label, field){
  return `<span class="hcl-sort-header" data-hcl-sort="${field}" style="cursor:pointer;display:inline-flex;align-items:center;gap:4px;">${label}<span id="hclSortIcon_${field}" style="color:var(--text-light);font-size:11px;">&#8693;</span></span>`;
}

function tplHclRows(rows, page, pageSize){
  if(!rows.length) return `<tr><td colspan="11" style="color:var(--text-light);">Tidak ada riwayat Credit Limit ditemukan</td></tr>`;
  const start = (page-1)*pageSize;
  return rows.slice(start, start+pageSize).map((r,i) => {
    const idx = DATA.historyCreditLimit.indexOf(r);
    return `
    <tr>
      <td>${start+i+1}</td>
      <td>${r.customerKode}</td>
      <td>${r.customerNama}</td>
      <td>${r.tanggal}</td>
      <td>${r.jenis}</td>
      <td>${rp(r.limitLama)}</td>
      <td>${rp(r.limitBaru)}</td>
      <td>${r.diajukanOleh || '-'}</td>
      <td>${r.disetujuiOleh || '-'}</td>
      <td><span class="status-pill ${hclStatusPillClass(r.status)}">${r.status}</span></td>
      <td><button class="icon-btn view" data-view="${idx}" title="Lihat Detail">${icon('eye',15)}</button></td>
    </tr>`;
  }).join('');
}

function tplHclPager(page, totalPages){
  if(totalPages <= 1) return '';
  const windowSize = 7;
  let start = Math.max(1, page - Math.floor(windowSize/2));
  let end = Math.min(totalPages, start + windowSize - 1);
  start = Math.max(1, end - windowSize + 1);
  let nums = '';
  for(let p = start; p <= end; p++){
    nums += `<button class="${p===page?'active':''}" data-hclpage="${p}">${p}</button>`;
  }
  return `
    <button data-hclpage="1" ${page<=1?'disabled':''}>First</button>
    <button data-hclpage="${Math.max(1,page-1)}" ${page<=1?'disabled':''}>Previous</button>
    ${nums}
    <button data-hclpage="${Math.min(totalPages,page+1)}" ${page>=totalPages?'disabled':''}>Next</button>
    <button data-hclpage="${totalPages}" ${page>=totalPages?'disabled':''}>Last</button>`;
}

function tplHclDetailModal(row){
  const selisih = row.limitBaru - row.limitLama;
  const selisihColor = selisih < 0 ? 'var(--red)' : 'var(--teal)';
  return `
    <div class="modal-box">
      <div class="modal-header"><span>Detail Riwayat Credit Limit</span><span class="close" id="modalClose">&times;</span></div>
      <div class="modal-body">
        <table class="field-table">
          <tr><td class="flabel">Kode Customer</td><td>${row.customerKode}</td></tr>
          <tr><td class="flabel">Nama Customer</td><td>${row.customerNama}</td></tr>
          <tr><td class="flabel">Tanggal</td><td>${row.tanggal}</td></tr>
          <tr><td class="flabel">Jenis Perubahan</td><td>${row.jenis}</td></tr>
          <tr><td class="flabel">Limit Lama</td><td>${rp(row.limitLama)}</td></tr>
          <tr><td class="flabel">Limit Baru</td><td>${rp(row.limitBaru)}</td></tr>
          <tr><td class="flabel">Selisih</td><td style="color:${selisihColor};font-weight:600;">${selisih>=0?'+':''}${rp(selisih)}</td></tr>
          <tr><td class="flabel">Diajukan Oleh</td><td>${row.diajukanOleh || '-'}</td></tr>
          <tr><td class="flabel">Disetujui Oleh</td><td>${row.disetujuiOleh || '-'}</td></tr>
          <tr><td class="flabel">Status</td><td><span class="status-pill ${hclStatusPillClass(row.status)}">${row.status}</span></td></tr>
          <tr><td class="flabel">Keterangan</td><td>${row.keterangan || '-'}</td></tr>
        </table>
      </div>
      <div class="modal-footer">
        <button class="btn-secondary" id="modalCancel">Tutup</button>
      </div>
    </div>`;
}
