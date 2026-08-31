/* =========================================================
   TEMPLATE (HTML saja) — Tutup Sales Quotation (Customer &
   Penjualan > Daftar Transaksi > Tutup Sales Quotation, key
   page:'tutupSalesQuotation'). Semua fungsi di file ini HANYA
   menyusun & mengembalikan markup HTML (string) atau helper
   murni, TIDAK ada DOM-binding/data mutation di sini. Logic-nya
   ada di file sebelah: tutup-sales-quotation.js

   Sesuai screenshot MASERP yang dikirim user: halaman list
   berjudul "Sales Quotation" (judul header PERSIS screenshot,
   beda dari label menu "Tutup Sales Quotation" — pola judul-list
   ≠ label-menu yang sama seperti Pelunasan Utang/"Daftar
   Pembayaran Utang"), page size default 5, dengan sel-sel
   BERTUMPUK (multi-baris) khas layar ini:
   - Kolom No. SQ: nomor (link biru -> modal ringkasan), tgl+jam
     input format pendek "dd/mm/yy hh:mm", nilai "Rp. {jumlah}".
   - Kolom Customer: NAMA (kapital), baris kode "{ID} & {Group}",
     alamat, lalu kota/area.
   - Kolom Status: status approval, "[Belum SO]"/"[Sudah SO]"
     (diturunkan dari field ts — 'Jadi SO' berarti sudah), lalu
     user input dokumen.
   - Kolom "Closed Manually": toggle switch FUNGSIONAL per baris
     (field baru sqClosedManually — pola sama persis dgn toggle
     "Closed Manually" di modul Stock Request), menandai SQ yang
     ditutup manual tanpa menunggu jadi SO.
   Data diambil LIVE dari DATA.salesQuotation DBM (8 baris sample
   yang sudah ada — data screenshot milik instalasi lain/SDL,
   tidak direplikasi). Pencarian Global fungsional. */

function tsqNum(n){ return Number(n||0).toLocaleString('id-ID'); }

/* '07/08/2026 09:12:00' -> '07/08/26 09:12' (format pendek kolom
   No. SQ di screenshot). */
function tsqShortDT(tglInput){
  const [tgl, jam] = (tglInput || '').split(' ');
  const p = (tgl || '').split('/');
  const tglPendek = p.length === 3 ? `${p[0]}/${p[1]}/${p[2].slice(-2)}` : (tgl || '');
  return `${tglPendek}${jam ? ' ' + jam.slice(0,5) : ''}`;
}

function tplTutupSalesQuotationPage(){
  return `
    <div class="breadcrumb">Home / Customer &amp; Penjualan / <b>Tutup Sales Quotation</b></div>
    <div class="card">
      <div class="card-header dark-header">
        <h3>${icon('alertTriangle',15)} Sales Quotation</h3>
      </div>
      <div class="table-toolbar">
        <select id="tsqPageSize"><option selected>5</option><option>10</option><option>25</option></select>
        <input type="text" id="tsqSearch" placeholder="Pencarian Global">
      </div>
      <div class="table-wrap"><table>
        <thead><tr>
          <th style="width:150px;">No. SQ</th>
          <th>Customer</th>
          <th style="width:100px;">Area</th>
          <th style="width:230px;">No. SP</th>
          <th style="width:60px;">TS</th>
          <th style="width:130px;">Status</th>
          <th style="width:120px;">Closed Manually</th>
        </tr></thead>
        <tbody id="tsqTbody"></tbody>
      </table></div>
      <div class="table-footer"><div class="pager"><button>First</button><button>Previous</button><button class="active">1</button><button>Next</button><button>Last</button></div><div id="tsqTotal"></div></div>
    </div>`;
}

function tplTsqRows(rows){
  if(!rows.length) return `<tr><td colspan="7" style="color:var(--text-light);padding:14px;">Tidak ada Sales Quotation yang cocok dengan pencarian.</td></tr>`;
  return rows.map(r => `
    <tr>
      <td style="vertical-align:top;">
        <a href="javascript:void(0)" data-tsq-view="${r.no}" style="color:var(--blue);font-weight:600;text-decoration:none;">${r.no}</a><br>
        <span style="font-size:11.8px;">${tsqShortDT(r.tglInput)}</span><br>
        <span style="font-size:11.8px;">Rp. ${tsqNum(r.jumlahAkhir)}</span>
      </td>
      <td style="vertical-align:top;">
        <b>${(r.customer||'').toUpperCase()}</b><br>
        <span style="font-size:11.8px;">${r.idKode||''}${r.groupKode ? ' &amp; ' + r.groupKode : ''}</span><br>
        <span style="font-size:11.8px;">${(r.alamat||'').toUpperCase()}</span><br>
        <span style="font-size:11.8px;">${r.rayonDistrict||''}${r.area ? ', ' + r.area : ''}</span>
      </td>
      <td style="vertical-align:top;">${r.area||''}</td>
      <td style="vertical-align:top;">
        ${r.noSP||''}${r.noSP && r.tglSP ? `<br><span style="font-size:11.8px;">${r.tglSP}</span>` : ''}
      </td>
      <td style="vertical-align:top;">${r.ts||''}</td>
      <td style="vertical-align:top;">
        ${r.status||''}<br>
        <span style="font-size:11.8px;">[${r.ts === 'Jadi SO' ? 'Sudah SO' : 'Belum SO'}]</span><br>
        <span style="font-size:11.8px;">${r.userInput||''}</span>
      </td>
      <td style="vertical-align:top;text-align:center;">
        <label class="toggle-switch">
          <input type="checkbox" data-tsq-toggle="${r.no}" ${r.sqClosedManually?'checked':''}>
          <span class="toggle-slider"></span>
        </label>
      </td>
    </tr>`).join('');
}

/* Modal ringkasan SQ read-only utk link No. SQ — bukan navigasi ke
   form Sales Quotation penuh (modul SQ adalah lazy-load terpisah
   yang urutan muatnya tidak boleh diandalkan — alasan sama dgn
   Tutup Pending PO/SO). */
function tplTsqDetailModal(row){
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
      <div class="modal-header"><span>Sales Quotation ${row.no}</span><span class="close" id="modalClose">&times;</span></div>
      <div class="modal-body">
        <table class="field-table" style="margin-bottom:12px;">
          <tr><td class="flabel">No. SQ</td><td>${row.no}</td><td class="flabel">Tgl. SQ</td><td>${row.tglSQ || ''}</td></tr>
          <tr><td class="flabel">Customer</td><td>${(row.customer||'').toUpperCase()}</td><td class="flabel">Area</td><td>${row.area || ''}</td></tr>
          <tr><td class="flabel">No. SP</td><td>${row.noSP || '-'}</td><td class="flabel">Status</td><td>${row.status || ''} [${row.ts === 'Jadi SO' ? 'Sudah SO' : 'Belum SO'}]${row.sqClosedManually ? ' — Closed Manually' : ''}</td></tr>
          <tr><td class="flabel">Keterangan</td><td colspan="3">${row.keterangan || ''}</td></tr>
        </table>
        <table>
          <thead><tr><th style="width:36px;">No.</th><th>Kode</th><th>Nama Barang</th><th class="text-right">Qty</th><th class="text-right">Jumlah</th></tr></thead>
          <tbody>${itemRows}</tbody>
          <tfoot><tr>
            <td colspan="4" style="text-align:right;font-weight:700;">Jumlah Tagihan (termasuk pajak &amp; biaya kirim) :</td>
            <td style="text-align:right;font-weight:700;">${fmt2(row.jumlahAkhir)}</td>
          </tr></tfoot>
        </table>
        <p style="color:var(--text-light);font-size:12px;margin-top:10px;">Detail lengkap SQ dapat dilihat di menu Customer &amp; Penjualan &gt; Daftar Transaksi &gt; Sales Quotation.</p>
      </div>
      <div class="modal-footer">
        <button class="btn-secondary" id="modalCancel">Tutup</button>
      </div>
    </div>`;
}
