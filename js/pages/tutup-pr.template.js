/* =========================================================
   TEMPLATE (HTML saja) — Tutup PR (Supplier & Pembelian >
   Daftar Transaksi > Tutup PR, key page:'tutupPR'). Semua fungsi
   di file ini HANYA menyusun & mengembalikan markup HTML
   (string), TIDAK ada DOM-binding/data mutation di sini.
   Logic-nya ada di file sebelah: tutup-pr.js

   Sesuai screenshot MASERP yang dikirim user:
   List "+ Tutup PR" + tombol Tutorial merah; TANPA chip periode
   (semua PR lintas bulan/tahun tampil — persis screenshot berisi
   25/PR-HO/04/00002 s.d. 26/PR-HO/08/00002, Total Record: 9);
   kolom No. Permintaan (link biru -> detail PR) / Keterangan
   ("No PR ini masih terbuka" / "No. PR ini sudah ditutup") /
   Tutup-Buka: tombol "Tutup Request" (biru) utk PR terbuka,
   "Buka Request" (teal) utk PR yang sudah ditutup — klik
   men-toggle flag r.tutupPr dan baris langsung berganti tombol.
   Data: DATA.permintaanPembelian (BERSAMA menu Permintaan
   Pembelian — flag tutupPr). */

function tplTutupPRListPage(){
  return `
    <div class="breadcrumb">Home / Supplier &amp; Pembelian / <b>Tutup PR</b></div>
    <div class="card">
      <div class="card-header dark-header">
        <h3>${icon('plus',15)} Tutup PR</h3>
        <button class="btn-danger" id="btnTprTutorial">${icon('card',14)} Tutorial</button>
      </div>
      <div class="table-toolbar">
        <select id="tprPageSize"><option selected>10</option><option>25</option><option>50</option></select>
        <input type="text" id="tprSearch" placeholder="Pencarian Global">
      </div>
      <div class="table-wrap"><table>
        <thead><tr>
          <th style="width:220px;">No. Permintaan</th>
          <th>Keterangan</th>
          <th style="width:160px;">Tutup / Buka</th>
        </tr></thead>
        <tbody id="tprTbody"></tbody>
      </table></div>
      <div class="table-footer"><div class="pager"><button>First</button><button>Previous</button><button class="active">1</button><button>Next</button><button>Last</button></div><div id="tprTotal"></div></div>
    </div>`;
}

function tplTprRows(rows){
  if(!rows.length) return `<tr><td colspan="3" style="color:var(--text-light);padding:14px;">Tidak ada PR yang cocok dengan pencarian.</td></tr>`;
  return rows.map((r,i)=>`
    <tr>
      <td><button class="link-pick" data-tpr-view="${i}">${r.no}</button></td>
      <td>${r.tutupPr ? 'No. PR ini sudah ditutup' : 'No PR ini masih terbuka'}</td>
      <td>
        ${r.tutupPr
          ? `<button class="btn-teal" data-tpr-toggle="${i}" style="padding:6px 14px;font-size:12px;">Buka Request</button>`
          : `<button class="btn-primary" data-tpr-toggle="${i}" style="padding:6px 14px;font-size:12px;">Tutup Request</button>`}
      </td>
    </tr>`).join('');
}

/* Detail PR (modal) — link No. Permintaan; salinan lokal ringkas
   (tidak memakai form modul Permintaan Pembelian karena urutan
   lazy-load antar modul tidak dijamin). */
function tplTprDetailModal(row){
  const itemRows = (row.items||[]).map((it,i)=>`
    <tr>
      <td>${i+1}</td><td>${it.kode||''}</td><td style="white-space:pre-line;">${it.nama||''}</td>
      <td class="text-right">${Number(it.qty||0).toLocaleString('id-ID')}</td><td>${it.um||''}</td>
      <td class="text-right">${Number(it.hargaBeli||0).toLocaleString('id-ID')}</td><td>${it.tglPerlu||''}</td>
    </tr>`).join('');
  return `
    <div class="modal-box" style="max-width:820px;width:96vw;">
      <div class="modal-header"><span>${icon('eye',15)} Permintaan Pembelian — ${row.no}</span><span class="close" id="modalClose">&times;</span></div>
      <div class="modal-body" style="max-height:70vh;overflow:auto;">
        <table class="field-table">
          <tr><td class="flabel" style="width:150px;">No. Permintaan</td><td>${row.no}</td><td class="flabel" style="width:130px;">Tgl. Permintaan</td><td>${row.tgl||''}</td></tr>
          <tr><td class="flabel">Cabang</td><td>${row.cabang||''}</td><td class="flabel">Gudang</td><td>${row.gudang||''}</td></tr>
          <tr><td class="flabel">Keterangan</td><td colspan="3">${row.keterangan||''}</td></tr>
          <tr><td class="flabel">Status</td><td colspan="3">${row.tutupPr ? 'No. PR ini sudah ditutup' : 'No PR ini masih terbuka'} — ${row.dipakaiPO ? 'sudah dipakai di P.O.' : 'belum dipakai di P.O.'}</td></tr>
        </table>
        <div class="table-wrap" style="margin-top:12px;"><table>
          <thead><tr><th style="width:34px;">No.</th><th>Kode</th><th>Nama Barang</th><th class="text-right">Qty</th><th>U/M</th><th class="text-right">Harga Beli</th><th>Tgl Perlu</th></tr></thead>
          <tbody>${itemRows || '<tr><td colspan="7" style="color:var(--text-light);">Tidak ada rincian.</td></tr>'}</tbody>
        </table></div>
      </div>
      <div class="modal-footer"><button class="btn-secondary" id="modalCancel">Tutup</button></div>
    </div>`;
}

function tplTprInfoModal(title,text){
  return `
    <div class="modal-box">
      <div class="modal-header"><span>${title}</span><span class="close" id="modalClose">&times;</span></div>
      <div class="modal-body"><p>${text}</p></div>
      <div class="modal-footer"><button class="btn-primary" id="modalOk">Mengerti</button></div>
    </div>`;
}
