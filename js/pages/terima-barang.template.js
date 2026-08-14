/* =========================================================
   TEMPLATE (HTML saja) — Bukti Terima Barang / BPB (Supplier &
   Pembelian > Daftar Transaksi > Terima Barang). Semua fungsi di
   file ini HANYA menyusun & mengembalikan markup HTML (string),
   TIDAK ada logic/DOM-binding di sini. Logic-nya ada di file
   sebelah: terima-barang.js

   Sesuai 2 screenshot MASERP yang dikirim user: "Daftar Bukti
   Penerimaan Barang" (list — kolom No. BPB berwarna biru dengan
   pill status "Approved" di bawahnya, No. PO, Tgl. Terima,
   Supplier, No SJ Supplier, Keterangan, lalu aksi Attach/Lihat/
   Cetak/Ubah/Hapus) dan "Bukti Terima Barang" (form Tambah/Ubah —
   header dark-header + tombol merah "Tutorial", field Cabang/
   Cabang Target/No. PO/FOB/No. Otomatis+No. BPB/Tgl. PO/Tgl. SJK/
   Supplier/No. S.J. Supplier/Alamat Pengiriman/Tgl. Kedatangan,
   tab "Rincian Transaksi"/"Rincian Jurnal Akun", tabel rincian
   barang dengan kolom Multi Batch Number & Barcode, link "+Tambah
   Additional Item", lalu Keterangan/Kurs).

   KONTEKS RANTAI TRANSAKSI: modul ini adalah TAHAP KE-2 dari
   rantai Supplier & Pembelian (Purchase Order → **Terima Barang**
   → Faktur Pembelian → Pelunasan Utang, sesuai diagram alur di
   Main Dashboard) — BPB dibuat dengan memilih No. PO yang statusnya
   "Pending Receive" dari `DATA.purchaseOrder` (rantai maju "master
   data yang saling nyambung", sama pola seperti Picking List
   nge-refer Sales Order & Faktur Penjualan Via S.J. nge-refer S.J./
   Sales Order). Barang & Supplier ikut terisi otomatis dari PO yang
   dipilih (lihat `tbApplyPO()` di terima-barang.js), field lain
   (Tgl. SJK/No SJ Supplier/Tgl Kedatangan/Kurs/Keterangan) diisi
   manual oleh user karena memang informasi baru yang muncul saat
   barang benar² tiba (tidak ada di PO).

   CATATAN DESAIN — field yang tidak jelas dari screenshot:
   - "Tgl. SJK" diinterpretasikan sebagai tanggal Surat Jalan Kirim
     dari SUPPLIER (tanggal dokumen pengiriman dibuat) — BEDA dari
     "Tgl. Kedatangan" (tanggal barang fisik tiba di gudang tujuan),
     karena dua tanggal ini realistis bisa berbeda kalau ada
     keterlambatan pengiriman. Kedua field pakai pola input+ikon
     kalender dekoratif yang sama seperti field tanggal di modul lain.
   - Status "Approved" pada tiap baris list DITERAPKAN TETAP/statis
     untuk semua baris (tidak ada alur approval bertingkat di mockup
     ini) — begitu BPB disimpan langsung dianggap Approved, konsisten
     dengan simplifikasi status di modul-modul lain (mis. Purchase
     Order langsung "Pending Receive" tanpa approval P.O. terpisah).
   - Kolom "Multi Batch Number" — BEDA dari Batch Number di Picking
     List (yang MEMILIH dari lot stok yang SUDAH ada di
     `DATA.batchStock`): di BPB, Batch Number adalah lot BARU yang
     baru dibuat saat menerima barang (belum ada di stok manapun),
     jadi inputnya manual (kode batch + tanggal expired diketik user,
     BUKAN dipilih dari daftar stok) dan bisa lebih dari 1 baris per
     barang (tombol "+" menambah baris alokasi batch baru) — bisa
     kejadian nyata kalau 1 PO item datang dalam beberapa lot/batch
     produksi berbeda dari supplier yang sama.
   - "+Tambah Additional Item" — barang TAMBAHAN yang diterima di
     luar yang tercantum di PO (misal bonus/sample dari supplier).
     Baris additional item ini punya Kode Barang yang bisa DICARI
     (lewat `openPersediaanPicker()` bersama) sedangkan baris item
     dari PO Kode/Nama/Qty Pesan-nya READONLY (mengikuti apa yang
     sudah dipesan di PO) — pembeda ini disimpan lewat flag
     `item.fromPO` per baris.
   - "Batas Qty Terima" = qtyPesan dikurangi total yang sudah pernah
     diterima lewat BPB SEBELUMNYA untuk PO-item yang sama. Karena
     mockup ini tidak melacak riwayat penerimaan parsial lintas-BPB,
     disederhanakan jadi SELALU = qtyPesan saat No. PO baru dipilih
     (menganggap ini penerimaan pertama) — dipakai sebagai batas atas
     validasi Qty Terima saat Simpan (tidak boleh lebih besar).
   - Barcode per barang TIDAK ADA di `DATA.items`, jadi dibuat kode
     dekoratif deterministik dari Kode Barang lewat `tplTbBarcode()`
     di bawah (bukan field acak, supaya konsisten kalau barang yang
     sama muncul di BPB lain).
========================================================= */

const TB_CABANG_LIST = ['Head Office','Surabaya','Bandung','Medan','Makassar','Semarang','Tangerang','Sidoarjo'];
const TB_CABANG_CODE = {'Head Office':'HO','Surabaya':'SBY','Bandung':'BDG','Medan':'MDN','Makassar':'MKS','Semarang':'SMG','Tangerang':'TGR','Sidoarjo':'SDA'};

/* Barcode dekoratif deterministik dari Kode Barang (format mirip EAN,
   supaya tampilannya masuk akal tapi tidak perlu field baru di
   DATA.items — lihat catatan desain di atas). */
function tplTbBarcode(kode){
  const n = ((kode||'').match(/\d+/) || ['0'])[0].padStart(4,'0');
  return `899${n}100${n}`;
}

function tplTerimaBarangListPage(){
  return `
    <div class="breadcrumb">Home / <b>Terima Barang</b></div>
    <div class="card">
      <div class="card-header dark-header">
        <h3>${icon('truck',15)} Daftar Bukti Penerimaan Barang</h3>
        <div class="toolbar-actions">
          <select class="chip-btn" id="tbFilterAll"><option>All</option></select>
          <select class="chip-btn" id="tbFilterPeriod"><option>Agustus 2026</option></select>
          <button class="btn-primary" id="btnTbAdd">${icon('plus',14)} Tambah</button>
        </div>
      </div>
      <div class="table-toolbar">
        <select id="tbPageSize"><option selected>10</option><option>25</option><option>50</option></select>
        <input type="text" id="tbSearch" placeholder="Pencarian Global">
      </div>
      <div class="table-wrap"><table>
        <thead><tr>
          <th>No. BPB</th>
          <th>No. PO</th>
          <th>Tgl. Terima</th>
          <th>Supplier</th>
          <th>No SJ Supplier</th>
          <th>Keterangan</th>
          <th>Attach</th>
          <th>Lihat</th>
          <th>Cetak</th>
          <th>Ubah</th>
          <th>Hapus</th>
        </tr></thead>
        <tbody id="tbTbody"></tbody>
      </table></div>
      <div class="table-footer"><div class="pager"><button>First</button><button>Previous</button><button class="active">1</button><button>Next</button><button>Last</button></div><div id="tbTotal"></div></div>
    </div>`;
}

function tplTbRows(rows){
  if(!rows.length) return `<tr><td colspan="11" style="color:var(--text-light);">Tidak Ada Data</td></tr>`;
  return rows.map((r,i)=>`
    <tr>
      <td><b style="color:var(--blue);">${r.no}</b><br><span class="status-pill status-paid" style="margin-top:3px;">${r.status||'Approved'}</span></td>
      <td>${r.noPO||''}</td>
      <td>${r.tglKedatangan||''}</td>
      <td>${r.supplier||''}</td>
      <td>${r.noSJSupplier||''}</td>
      <td>${r.keterangan||''}</td>
      <td><button class="icon-btn print" data-attach="${i}" title="Attach">${icon('file',15)}</button></td>
      <td><button class="icon-btn view" data-view="${i}" title="Lihat">${icon('eye',15)}</button></td>
      <td><button class="icon-btn print" data-cetak="${i}" title="Cetak">${icon('printer',15)}</button></td>
      <td><button class="icon-btn edit" data-edit="${i}" title="Ubah">${icon('edit',15)}</button></td>
      <td><button class="icon-btn del" data-del="${i}" title="Hapus">${icon('trash',15)}</button></td>
    </tr>`).join('');
}

/* Baris alokasi Multi Batch Number untuk 1 item — beda dari
   tplPklBatchAllocRows (Picking List): di sini kode batch & tanggal
   expired adalah INPUT MANUAL (batch baru dibuat saat terima),
   bukan hasil pilih dari daftar stok. Tombol "+" (di tplTbItemRow)
   menambah baris baru, ikon trash menghapus baris. */
function tplTbBatchAllocRows(item, idx, dis){
  if(!item.batches || !item.batches.length) return `<div style="font-size:11px;color:var(--text-light);margin-top:4px;">Belum ada batch diisi</div>`;
  return item.batches.map((b,bi)=>`
    <div style="display:flex;gap:6px;align-items:center;font-size:11.5px;padding:3px 0;border-bottom:1px dashed var(--border);">
      <input type="text" placeholder="No. Batch" value="${b.batch||''}" data-tb-batch-kode="${idx}:${bi}" style="flex:1;min-width:70px;" ${dis}>
      <input type="number" min="0" placeholder="Qty" value="${b.qty||0}" data-tb-batch-qty="${idx}:${bi}" style="width:60px;" ${dis}>
      <input type="text" placeholder="Exp." value="${b.exp||''}" data-tb-batch-exp="${idx}:${bi}" style="width:80px;" ${dis}>
      ${!dis ? `<span class="icon-btn del" style="width:20px;height:20px;cursor:pointer;" data-tb-batch-del="${idx}:${bi}" title="Hapus">${icon('trash',11)}</span>` : ''}
    </div>`).join('');
}

/* Baris tabel rincian barang: No/Kode Barang/Nama Barang/Multi Batch
   Number (+button)/Barcode/Satuan/Qty Pesan/Qty Terima/Batas Qty
   Terima. Item dari PO (`item.fromPO`) → Kode/Nama/Qty Pesan/Batas
   readonly; Additional Item (`!item.fromPO`) → Kode Barang bisa
   dicari (openPersediaanPicker), Qty Pesan & Batas tampil "-". */
function tplTbItemRow(item, idx, dis){
  const fromPO = item.fromPO !== false;
  return `
    <tr data-tb-item-row="${idx}">
      <td style="width:30px;">${idx+1}</td>
      <td style="min-width:110px;">
        ${fromPO
          ? `<input type="text" value="${item.kode||''}" disabled>`
          : `<div class="input-with-btn">
               <input type="text" data-tb-kode="${idx}" value="${item.kode||''}" placeholder="Kode" readonly>
               ${!dis ? `<button type="button" class="icon-btn edit" data-tb-item-search="${idx}" title="Cari Barang">${icon('search',13)}</button>` : ''}
             </div>`}
      </td>
      <td style="min-width:170px;">${item.nama||''}</td>
      <td style="min-width:230px;">
        <div style="display:flex;align-items:center;gap:6px;">
          <span style="font-size:11.5px;color:var(--text-light);flex:1;">Batch</span>
          ${!dis ? `<button type="button" class="icon-btn edit" data-tb-batch-add="${idx}" title="Tambah Batch" style="width:20px;height:20px;">${icon('plus',11)}</button>` : ''}
        </div>
        <div id="tbBatchList${idx}">${tplTbBatchAllocRows(item, idx, dis)}</div>
      </td>
      <td style="width:120px;"><input type="text" value="${item.barcode||tplTbBarcode(item.kode)}" disabled></td>
      <td style="width:70px;">${item.satuan||''}</td>
      <td style="width:80px;"><input type="text" value="${fromPO ? num(item.qtyPesan||0) : '-'}" disabled></td>
      <td style="width:90px;"><input type="number" min="0" data-tb-qtyterima="${idx}" value="${item.qtyTerima||0}" ${dis}></td>
      <td style="width:90px;"><input type="text" value="${fromPO ? num(item.batasQtyTerima||0) : '-'}" disabled></td>
      <td style="width:34px;">${(!dis && !fromPO) ? `<button type="button" class="icon-btn del" data-tb-item-del="${idx}" title="Hapus Baris">${icon('trash',13)}</button>` : ''}</td>
    </tr>`;
}

function tplTbJurnalPlaceholder(){
  return `
    <div class="placeholder-box" style="padding:36px 20px;">
      <div class="pico">${icon('book',36)}</div>
      <h3 style="font-size:14px;font-weight:700;color:#5b6178;">Rincian Jurnal Akun</h3>
      <p>Preview jurnal akun (debit Persediaan / kredit Hutang Sementara) hasil posting Bukti Terima Barang ini akan tersedia di sini pada versi lengkap.</p>
    </div>`;
}

function tplTbForm(mode, row){
  const isAdd = mode === 'add';
  const isView = mode === 'view';
  const dis = isView ? 'disabled' : '';
  const titleAction = isAdd ? 'Tambah' : (isView ? 'Lihat' : 'Ubah');
  const headerIcon = isAdd ? 'plus' : (isView ? 'eye' : 'edit');
  return `
    <div class="breadcrumb">Home / Terima Barang / <b>${titleAction}</b></div>
    <div class="card">
      <div class="card-header dark-header">
        <h3>${icon(headerIcon,15)} ${isAdd?'+ Bukti Terima Barang':'Bukti Terima Barang'}</h3>
        ${!isView ? `<button class="btn-danger" id="btnTbTutorial" type="button">${icon('card',14)} Tutorial</button>` : ''}
      </div>
      <div class="card-body">

        <div class="po-grid-3">
          <div class="form-group">
            <label>Cabang</label>
            <select id="fTbCabang" ${(isView||!isAdd)?'disabled':''}>${TB_CABANG_LIST.map(c=>`<option ${row.cabang===c?'selected':''}>${c}</option>`).join('')}</select>
          </div>
          <div class="form-group">
            <label>Cabang Target</label>
            <select id="fTbCabangTarget" ${dis}>${TB_CABANG_LIST.map(c=>`<option ${row.cabangTarget===c?'selected':''}>${c}</option>`).join('')}</select>
          </div>
          <div class="form-group">
            <label>No. PO</label>
            <div class="input-with-btn">
              <input type="text" id="fTbNoPO" value="${row.noPO||''}" placeholder="Pilih Purchase Order" readonly>
              ${!isView ? `<button type="button" class="icon-btn edit" id="tbPoSearch" title="Cari Purchase Order">${icon('search',13)}</button>` : ''}
            </div>
          </div>
        </div>

        <div class="po-grid-3">
          <div class="form-group">
            <label>FOB</label>
            <input type="text" id="fTbFob" value="${row.fob||''}" placeholder="FOB" ${dis}>
          </div>
          <div class="form-group">
            <label>No. Otomatis</label>
            <div class="input-with-btn">
              <select id="fTbNoOtomatis" ${dis} style="max-width:90px;"><option>${row.noOtomatis||'BPB001'}</option></select>
              <input type="text" id="fTbNo" value="${row.no||''}" placeholder="Otomatis" readonly>
              ${isAdd ? `<button type="button" class="icon-btn edit" id="tbRefreshNo" title="Generate Nomor">${icon('refreshCw',13)}</button>` : ''}
            </div>
          </div>
          <div class="form-group">
            <label>Tgl. PO</label>
            <input type="text" id="fTbTglPO" value="${row.tglPO||''}" disabled>
          </div>
        </div>

        <div class="po-grid-3">
          <div class="form-group">
            <label>Tgl. SJK</label>
            <div class="input-with-btn">
              <input type="text" id="fTbTglSjk" value="${row.tglSJK||''}" ${dis}>
              <span class="icon-btn edit" style="pointer-events:none;">${icon('calendar',13)}</span>
            </div>
          </div>
          <div class="form-group">
            <label>Supplier</label>
            <input type="text" id="fTbSupplier" value="${row.supplier||''}" placeholder="Terisi otomatis dari No. PO" disabled>
          </div>
          <div class="form-group">
            <label>No. S.J. Supplier</label>
            <input type="text" id="fTbNoSjSupplier" value="${row.noSJSupplier||''}" placeholder="No. Surat Jalan Supplier" ${dis}>
          </div>
        </div>

        <div class="po-grid-3">
          <div class="form-group" style="grid-column:1 / span 2;">
            <label>Alamat Pengiriman</label>
            <textarea id="fTbAlamat" class="po-textarea" rows="2" ${dis}>${row.alamatPengiriman||''}</textarea>
          </div>
          <div class="form-group">
            <label>Tgl. Kedatangan</label>
            <div class="input-with-btn">
              <input type="text" id="fTbTglKedatangan" value="${row.tglKedatangan||''}" ${dis}>
              <span class="icon-btn edit" style="pointer-events:none;">${icon('calendar',13)}</span>
            </div>
          </div>
        </div>

        <div class="inv-tabs">
          <button type="button" class="inv-tab-btn active" id="tbTabDetailBtn">Rincian Transaksi</button>
          <button type="button" class="inv-tab-btn" id="tbTabJurnalBtn">Rincian Jurnal Akun</button>
        </div>

        <div id="tbTabDetailContent">
          <div class="table-wrap" style="margin:10px 0 6px;">
            <table class="po-item-table">
              <thead><tr>
                <th>No</th>
                <th>Kode Barang</th>
                <th>Nama Barang</th>
                <th>Multi Batch Number</th>
                <th>Barcode</th>
                <th>Satuan</th>
                <th>Qty. Pesan</th>
                <th>Qty. Terima</th>
                <th>Batas Qty. Terima</th>
                <th></th>
              </tr></thead>
              <tbody id="tbItemsBody">${row.items.map((it,idx)=>tplTbItemRow(it,idx,dis)).join('')}</tbody>
            </table>
          </div>
          <div id="tbItemsEmptyHint" style="font-size:11.5px;color:var(--text-light);margin-top:6px;${row.items.length?'display:none;':''}">Belum ada barang — pilih No. PO terlebih dahulu.</div>
          ${!isView ? `<a href="#" id="tbAddItem" class="link-add">${icon('plus',13)} Tambah Additional Item</a>` : ''}
        </div>
        <div id="tbTabJurnalContent" style="display:none;">${tplTbJurnalPlaceholder()}</div>

        <table class="field-table" style="margin-top:18px;max-width:640px;">
          <tr>
            <td class="flabel">Keterangan</td>
            <td><textarea id="fTbKeterangan" class="po-textarea" rows="2" ${dis}>${row.keterangan||''}</textarea></td>
          </tr>
          <tr>
            <td class="flabel">Kurs</td>
            <td><input type="number" id="fTbKurs" value="${row.kurs||1}" ${dis}></td>
          </tr>
        </table>

        <div style="font-size:11.8px;color:var(--text-light);margin-top:18px;line-height:1.7;">
          ${row.tglInput ? `Tgl. Input : ${row.tglInput}  User Entry : ${row.userInput||''}<br>` : ''}
          ${row.tglEdit ? `Tgl Edit : ${row.tglEdit}  User Edit : ${row.userEdit||''}` : ''}
        </div>

        <div class="form-page-actions">
          ${isView
            ? `<a href="#" id="tbTutup" class="link-add" style="margin-right:auto;">&larr; Kembali ke Daftar</a>`
            : `<a href="#" id="tbBatalkan" class="link-add" style="margin-right:auto;">Batalkan</a>
               ${!isAdd ? `<button class="btn-teal" id="tbCetak" type="button">${icon('printer',13)} Cetak</button>` : ''}
               <button class="btn-primary" id="tbSimpan">Simpan</button>`}
        </div>
      </div>
    </div>`;
}

function tplTbDeleteConfirm(row){
  return `
    <div class="modal-box">
      <div class="modal-header"><span>Hapus Bukti Terima Barang</span><span class="close" id="modalClose">&times;</span></div>
      <div class="modal-body"><p>Yakin ingin menghapus Bukti Terima Barang <b>${row.no}</b>?</p></div>
      <div class="modal-footer">
        <button class="btn-secondary" id="modalCancel">Batal</button>
        <button class="btn-danger" id="modalDelete">Hapus</button>
      </div>
    </div>`;
}

function tplTbInfoModal(title,text){
  return `
    <div class="modal-box">
      <div class="modal-header"><span>${title}</span><span class="close" id="modalClose">&times;</span></div>
      <div class="modal-body"><p>${text}</p></div>
      <div class="modal-footer"><button class="btn-primary" id="modalOk">OK</button></div>
    </div>`;
}

/* Popup "Pilih Purchase Order" — pola modal-list sederhana (sama
   seperti tplFktInvoicePicker di Faktur Penjualan Via S.J.), BUKAN
   popup dengan search+pagination sungguhan seperti Daftar Persediaan
   (konsisten: hanya popup Daftar Persediaan yang punya pagination
   nyata di mockup ini). Hanya menampilkan PO berstatus "Pending
   Receive" (yang belum/masih bisa diterima barangnya). */
function tplTbPoPicker(list){
  return `
    <div class="modal-box" style="max-width:680px;">
      <div class="modal-header"><span>Pilih Purchase Order</span><span class="close" id="modalClose">&times;</span></div>
      <div class="modal-body">
        <div class="table-wrap" style="max-height:340px;overflow:auto;"><table>
          <thead><tr><th>No. PO</th><th>Tgl. PO</th><th>Supplier</th><th>Keterangan</th><th></th></tr></thead>
          <tbody>${list.length ? list.map(po=>`<tr><td>${po.no}</td><td>${po.tglPO||''}</td><td>${po.supplier||''}</td><td>${po.keterangan||''}</td><td><button class="btn-pick" data-pick-po="${po.no}">Pilih</button></td></tr>`).join('') : `<tr><td colspan="5" style="color:var(--text-light);">Tidak ada Purchase Order Pending Receive</td></tr>`}</tbody>
        </table></div>
      </div>
      <div class="modal-footer"><button class="btn-secondary" id="modalCancel">Tutup</button></div>
    </div>`;
}
