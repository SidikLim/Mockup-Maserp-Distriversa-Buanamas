/* =========================================================
   TEMPLATE (HTML saja) — Tutup Pending SO (Customer & Penjualan >
   Daftar Transaksi > Tutup Pending SO, key page:'tutupPendingSO').
   Semua fungsi di file ini HANYA menyusun & mengembalikan markup
   HTML (string), TIDAK ada logic/DOM-binding/data mutation di
   sini. Logic-nya ada di file sebelah: tutup-pending-so.js

   Sesuai screenshot MASERP "+ Tutup Pending S.O." yang dikirim
   user — KEMBARAN modul Tutup Pending PO (tutup-pending-po.*)
   untuk sisi Sales Order, dengan beda-beda ini:
   - Dropdown filter status di header punya 5 pilihan: All /
     Pending / In Progress / Close / Sent (di PO hanya 4, tanpa
     Sent).
   - Tabel bertambah kolom "P.O. Cust." (nomor PO milik customer —
     diambil dari field noSP DATA.salesOrders) di antara Jumlah
     Akhir dan Status.
   - Kolom Status menampilkan "Terkirim" (label Indonesia untuk
     status internal 'Sent' — dropdown filternya sendiri tetap
     berbahasa Inggris persis screenshot). Status kirim ini
     TERPISAH dari status tutup: baris yang DITUTUP tetap
     menampilkan status kirimnya, tapi kolom Keterangan diganti
     teks "No. SO ini sudah ditutup" dan tombolnya jadi
     "Buka Order" teal — persis pola baris-baris di screenshot.
   - Page size default 20 (screenshot), PO default 10.

   Data list diambil LIVE dari DATA.salesOrders DBM (14 baris SO
   Agustus 2026 yang sudah ada) lewat 2 field BARU per baris:
   `tutupSo` (boolean — sudah ditutup atau belum; 2 baris BDG
   di-seed true supaya kedua bentuk tombol langsung terlihat) dan
   `tutupSoPrevKet` (menyimpan keterangan asli supaya Buka Order
   bisa mengembalikannya). Link No. S.O. membuka modal ringkasan
   SO read-only (bukan navigasi ke form Sales Order penuh — modul
   SO adalah lazy-load terpisah yang urutan muatnya tidak boleh
   diandalkan, alasan sama dgn Tutup Pending PO). */

const TPS_STATUS_LABEL = { 'Sent':'Terkirim', 'Pending':'Pending', 'In Progress':'In Progress' };

function tpsStatusKirim(r){ return r.tutupSoStatusKirim || 'Sent'; }

function tplTpsListPage(){
  const months = ['Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember'];
  const selStyle = 'background:var(--blue-light);color:#fff;border:none;border-radius:6px;padding:8px 10px;font-size:12.5px;font-weight:600;cursor:pointer;';
  return `
    <div class="breadcrumb">Home / Customer &amp; Penjualan / <b>Tutup Pending SO</b></div>
    <div class="card">
      <div class="card-header dark-header">
        <h3>${icon('plus',15)} Tutup Pending S.O.</h3>
        <div class="toolbar-actions">
          <select id="tpsFilterStatus" style="${selStyle}">
            <option value="">All</option>
            <option>Pending</option>
            <option>In Progress</option>
            <option>Close</option>
            <option>Sent</option>
          </select>
          <select id="tpsFilterBulan" style="${selStyle}">
            ${months.map((m, i) => {
              const ym = '2026' + String(i + 1).padStart(2, '0');
              return `<option value="${ym}"${ym === '202608' ? ' selected' : ''}>${m} 2026</option>`;
            }).join('')}
          </select>
          <button class="btn-danger" id="btnTpsTutorial">${icon('card',14)} Tutorial</button>
        </div>
      </div>
      <div class="table-toolbar">
        <select><option>10</option><option selected>20</option><option>50</option></select>
        <input type="text" id="tpsSearch" placeholder="Pencarian Global">
      </div>
      <div class="table-wrap"><table>
        <thead><tr>
          <th style="width:150px;">No. S.O.</th>
          <th style="width:90px;">Tgl. S.O.</th>
          <th style="width:190px;">Customer</th>
          <th>Keterangan</th>
          <th class="text-right" style="width:120px;">Jumlah Akhir</th>
          <th style="width:180px;">P.O. Cust.</th>
          <th style="width:96px;">Status</th>
          <th style="width:110px;">Tutup / Buka</th>
        </tr></thead>
        <tbody id="tpsTbody"></tbody>
      </table></div>
      <div class="table-footer"><div class="pager"><button>First</button><button>Previous</button><button class="active">1</button><button>Next</button><button>Last</button></div><div id="tpsTotal"></div></div>
    </div>`;
}

function tplTpsRows(rows){
  const fmt2 = n => Number(n || 0).toLocaleString('id-ID', {minimumFractionDigits:2, maximumFractionDigits:2});
  if(!rows.length){
    return `<tr><td colspan="8" style="color:var(--text-light);padding:14px;">Tidak ada SO yang cocok dengan filter/pencarian.</td></tr>`;
  }
  return rows.map(r => {
    const isClose = !!r.tutupSo;
    const status = tpsStatusKirim(r);
    return `
    <tr>
      <td><a href="javascript:void(0)" data-tps-view="${r.no}" style="color:var(--blue);font-weight:600;text-decoration:none;">${r.no}</a></td>
      <td>${r.tglSO || ''}</td>
      <td>${(r.customer || '').toUpperCase()}</td>
      <td>${isClose ? 'No. SO ini sudah ditutup' : (r.keterangan || '')}</td>
      <td class="text-right">${fmt2(r.jumlahAkhir)}</td>
      <td>${r.noSP || ''}</td>
      <td>${TPS_STATUS_LABEL[status] || status}</td>
      <td>
        ${isClose
          ? `<button class="btn-teal" data-tps-toggle="${r.no}" style="padding:7px 12px;font-size:12px;">Buka Order</button>`
          : `<button class="btn-primary" data-tps-toggle="${r.no}" style="padding:7px 12px;font-size:12px;">Tutup Order</button>`}
      </td>
    </tr>`;
  }).join('');
}

function tplTpsConfirmModal(row, willClose){
  return `
    <div class="modal-box" style="max-width:460px;">
      <div class="modal-header"><span>${willClose ? 'Tutup Order' : 'Buka Order'}</span><span class="close" id="modalClose">&times;</span></div>
      <div class="modal-body">
        <p>Yakin ingin ${willClose ? 'menutup' : 'membuka kembali'} SO <b>${row.no}</b> — ${(row.customer || '').toUpperCase()}?</p>
        <p style="color:var(--text-light);font-size:12.5px;margin-top:8px;">
          ${willClose
            ? 'SO yang ditutup tidak lagi menunggu pengiriman/faktur (sisa qty yang belum terkirim dibatalkan) dan hilang dari daftar SO pending.'
            : 'SO yang dibuka kembali akan menunggu pengiriman/faktur lagi dan keterangan aslinya dikembalikan.'}
        </p>
      </div>
      <div class="modal-footer">
        <button class="btn-secondary" id="modalCancel">Batal</button>
        <button class="${willClose ? 'btn-danger' : 'btn-primary'}" id="tpsConfirmBtn">${willClose ? 'Tutup Order' : 'Buka Order'}</button>
      </div>
    </div>`;
}

/* Modal ringkasan SO read-only utk link No. S.O. — bukan form Sales
   Order penuh (lihat catatan di header file). */
function tplTpsDetailModal(row){
  const fmt2 = n => Number(n || 0).toLocaleString('id-ID', {minimumFractionDigits:2, maximumFractionDigits:2});
  const itemRows = (row.items || []).map((it, i) => `
    <tr>
      <td style="text-align:center;">${i + 1}</td>
      <td>${it.kode}</td>
      <td>${it.nama}</td>
      <td style="text-align:right;">${num(it.qty)} ${it.um || ''}</td>
      <td style="text-align:right;">${fmt2((it.dpp || 0) + (it.ppn || 0))}</td>
    </tr>`).join('');
  return `
    <div class="modal-box" style="max-width:620px;">
      <div class="modal-header"><span>Sales Order ${row.no}</span><span class="close" id="modalClose">&times;</span></div>
      <div class="modal-body">
        <table class="field-table" style="margin-bottom:12px;">
          <tr><td class="flabel">No. S.O.</td><td>${row.no}</td><td class="flabel">Tgl. S.O.</td><td>${row.tglSO || ''}</td></tr>
          <tr><td class="flabel">Customer</td><td>${(row.customer || '').toUpperCase()}</td><td class="flabel">P.O. Cust.</td><td>${row.noSP || ''}</td></tr>
          <tr><td class="flabel">Status</td><td>${row.tutupSo ? 'Close' : (TPS_STATUS_LABEL[tpsStatusKirim(row)] || tpsStatusKirim(row))}</td><td class="flabel">Approval</td><td>${row.statusApproval || ''}</td></tr>
          <tr><td class="flabel">Keterangan</td><td colspan="3">${row.tutupSo ? 'No. SO ini sudah ditutup' : (row.keterangan || '')}</td></tr>
        </table>
        <table>
          <thead><tr><th style="width:36px;">No.</th><th>Kode</th><th>Nama Barang</th><th class="text-right">Qty</th><th class="text-right">Jumlah</th></tr></thead>
          <tbody>${itemRows}</tbody>
          <tfoot><tr>
            <td colspan="4" style="text-align:right;font-weight:700;">Jumlah Akhir (termasuk pajak &amp; biaya kirim) :</td>
            <td style="text-align:right;font-weight:700;">${fmt2(row.jumlahAkhir)}</td>
          </tr></tfoot>
        </table>
        <p style="color:var(--text-light);font-size:12px;margin-top:10px;">Detail lengkap SO dapat dilihat di menu Customer &amp; Penjualan &gt; Daftar Transaksi &gt; Sales Order.</p>
      </div>
      <div class="modal-footer">
        <button class="btn-secondary" id="modalCancel">Tutup</button>
      </div>
    </div>`;
}

function tplTpsInfoModal(title, text){
  return `
    <div class="modal-box">
      <div class="modal-header"><span>${title}</span><span class="close" id="modalClose">&times;</span></div>
      <div class="modal-body"><p>${text}</p></div>
      <div class="modal-footer">
        <button class="btn-primary" id="modalCancel">Tutup</button>
      </div>
    </div>`;
}
