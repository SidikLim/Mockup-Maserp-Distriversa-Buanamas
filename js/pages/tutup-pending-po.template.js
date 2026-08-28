/* =========================================================
   TEMPLATE (HTML saja) — Tutup Pending PO (Supplier & Pembelian >
   Daftar Transaksi). Semua fungsi di file ini HANYA menyusun &
   mengembalikan markup HTML (string), TIDAK ada logic/DOM-binding/
   data mutation di sini. Logic-nya ada di file sebelah:
   tutup-pending-po.js

   Sesuai screenshot MASERP "+ Tutup Pending PO" yang dikirim user
   2026-08-28: list full page dgn header dark berisi 2 dropdown filter
   kecil warna teal (status "All" & bulan "Agustus 2026") + tombol
   merah Tutorial; toolbar select jumlah baris + Pencarian Global;
   tabel No. PO (link biru)/Tgl. PO/Supplier/Keterangan/Jumlah Akhir
   (rata kanan, format id-ID 2 desimal)/Status (teks Pending -
   In Progress - Close)/kolom "Tutup / Buka" berisi tombol per baris:
   "Tutup Order" (biru) utk PO yang belum Close, "Buka Order" (teal)
   utk PO yang sudah Close.

   Data list pada screenshot (PT SATORIA ANEKA INDUSTRI dst.) adalah
   data instalasi MASERP lain (SDL) — TIDAK direplikasi; list di sini
   diambil LIVE dari DATA.purchaseOrder DBM (11 baris PO Agustus 2026
   yang sudah ada) lewat field BARU `tutupPoStatus` — lihat komentar
   besar di atas DATA.purchaseOrder di js/data.js. Link No. PO membuka
   modal ringkasan PO read-only (mockup ini tidak menavigasi ke form
   Purchase Order penuh — modul PO adalah lazy-load terpisah yang
   urutan muatnya tidak boleh diandalkan). */

function tplTppListPage(){
  const months = ['Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember'];
  const selStyle = 'background:var(--blue-light);color:#fff;border:none;border-radius:6px;padding:8px 10px;font-size:12.5px;font-weight:600;cursor:pointer;';
  return `
    <div class="breadcrumb">Home / Supplier &amp; Pembelian / <b>Tutup Pending PO</b></div>
    <div class="card">
      <div class="card-header dark-header">
        <h3>${icon('plus',15)} Tutup Pending PO</h3>
        <div class="toolbar-actions">
          <select id="tppFilterStatus" style="${selStyle}">
            <option value="">All</option>
            <option>Pending</option>
            <option>In Progress</option>
            <option>Close</option>
          </select>
          <select id="tppFilterBulan" style="${selStyle}">
            ${months.map((m, i) => {
              const ym = '2026' + String(i + 1).padStart(2, '0');
              return `<option value="${ym}"${ym === '202608' ? ' selected' : ''}>${m} 2026</option>`;
            }).join('')}
          </select>
          <button class="btn-danger" id="btnTppTutorial">${icon('card',14)} Tutorial</button>
        </div>
      </div>
      <div class="table-toolbar">
        <select><option selected>10</option><option>25</option><option>50</option></select>
        <input type="text" id="tppSearch" placeholder="Pencarian Global">
      </div>
      <div class="table-wrap"><table>
        <thead><tr>
          <th style="width:150px;">No. PO</th>
          <th style="width:90px;">Tgl. PO</th>
          <th style="width:210px;">Supplier</th>
          <th>Keterangan</th>
          <th class="text-right" style="width:120px;">Jumlah Akhir</th>
          <th style="width:96px;">Status</th>
          <th style="width:110px;">Tutup / Buka</th>
        </tr></thead>
        <tbody id="tppTbody"></tbody>
      </table></div>
      <div class="table-footer"><div class="pager"><button>First</button><button>Previous</button><button class="active">1</button><button>Next</button><button>Last</button></div><div id="tppTotal"></div></div>
    </div>`;
}

function tplTppRows(rows){
  const fmt2 = n => Number(n || 0).toLocaleString('id-ID', {minimumFractionDigits:2, maximumFractionDigits:2});
  if(!rows.length){
    return `<tr><td colspan="7" style="color:var(--text-light);padding:14px;">Tidak ada PO yang cocok dengan filter/pencarian.</td></tr>`;
  }
  return rows.map(r => {
    const isClose = r.tutupPoStatus === 'Close';
    return `
    <tr>
      <td><a href="javascript:void(0)" data-tpp-view="${r.no}" style="color:var(--blue);font-weight:600;text-decoration:none;">${r.no}</a></td>
      <td>${r.tglPO || ''}</td>
      <td>${r.supplier || ''}</td>
      <td>${r.keterangan || ''}</td>
      <td class="text-right">${fmt2(r.jumlahTotal)}</td>
      <td>${r.tutupPoStatus || 'Pending'}</td>
      <td>
        ${isClose
          ? `<button class="btn-teal" data-tpp-toggle="${r.no}" style="padding:7px 12px;font-size:12px;">Buka Order</button>`
          : `<button class="btn-primary" data-tpp-toggle="${r.no}" style="padding:7px 12px;font-size:12px;">Tutup Order</button>`}
      </td>
    </tr>`;
  }).join('');
}

function tplTppConfirmModal(row, willClose){
  return `
    <div class="modal-box" style="max-width:460px;">
      <div class="modal-header"><span>${willClose ? 'Tutup Order' : 'Buka Order'}</span><span class="close" id="modalClose">&times;</span></div>
      <div class="modal-body">
        <p>Yakin ingin ${willClose ? 'menutup' : 'membuka kembali'} PO <b>${row.no}</b> — ${row.supplier || ''}?</p>
        <p style="color:var(--text-light);font-size:12.5px;margin-top:8px;">
          ${willClose
            ? 'PO yang ditutup tidak lagi menunggu penerimaan barang (sisa qty yang belum diterima dibatalkan) dan hilang dari daftar PO pending.'
            : 'PO yang dibuka kembali akan berstatus Pending dan menunggu penerimaan barang lagi.'}
        </p>
      </div>
      <div class="modal-footer">
        <button class="btn-secondary" id="modalCancel">Batal</button>
        <button class="${willClose ? 'btn-danger' : 'btn-primary'}" id="tppConfirmBtn">${willClose ? 'Tutup Order' : 'Buka Order'}</button>
      </div>
    </div>`;
}

/* Modal ringkasan PO read-only utk link No. PO — bukan form Purchase
   Order penuh (lihat catatan di header file). */
function tplTppDetailModal(row){
  const fmt2 = n => Number(n || 0).toLocaleString('id-ID', {minimumFractionDigits:2, maximumFractionDigits:2});
  const itemRows = (row.items || []).map((it, i) => `
    <tr>
      <td style="text-align:center;">${i + 1}</td>
      <td>${it.kode}</td>
      <td>${it.nama}</td>
      <td style="text-align:right;">${num(it.qty)} ${it.um || ''}</td>
      <td style="text-align:right;">${fmt2(it.jumlah)}</td>
    </tr>`).join('');
  return `
    <div class="modal-box" style="max-width:620px;">
      <div class="modal-header"><span>Purchase Order ${row.no}</span><span class="close" id="modalClose">&times;</span></div>
      <div class="modal-body">
        <table class="field-table" style="margin-bottom:12px;">
          <tr><td class="flabel">No. PO</td><td>${row.no}</td><td class="flabel">Tgl. PO</td><td>${row.tglPO || ''}</td></tr>
          <tr><td class="flabel">Supplier</td><td>${row.supplier || ''}</td><td class="flabel">Status</td><td>${row.tutupPoStatus || 'Pending'}</td></tr>
          <tr><td class="flabel">Keterangan</td><td colspan="3">${row.keterangan || ''}</td></tr>
        </table>
        <table>
          <thead><tr><th style="width:36px;">No.</th><th>Kode</th><th>Nama Barang</th><th class="text-right">Qty</th><th class="text-right">Jumlah</th></tr></thead>
          <tbody>${itemRows}</tbody>
          <tfoot><tr>
            <td colspan="4" style="text-align:right;font-weight:700;">Jumlah Akhir (termasuk pajak) :</td>
            <td style="text-align:right;font-weight:700;">${fmt2(row.jumlahTotal)}</td>
          </tr></tfoot>
        </table>
        <p style="color:var(--text-light);font-size:12px;margin-top:10px;">Detail lengkap PO dapat dilihat di menu Supplier &amp; Pembelian &gt; Daftar Transaksi &gt; Purchase Order.</p>
      </div>
      <div class="modal-footer">
        <button class="btn-secondary" id="modalCancel">Tutup</button>
      </div>
    </div>`;
}

function tplTppInfoModal(title, text){
  return `
    <div class="modal-box">
      <div class="modal-header"><span>${title}</span><span class="close" id="modalClose">&times;</span></div>
      <div class="modal-body"><p>${text}</p></div>
      <div class="modal-footer">
        <button class="btn-primary" id="modalCancel">Tutup</button>
      </div>
    </div>`;
}
