/* =========================================================
   TEMPLATE (HTML saja) — Sales Order (Customer & Penjualan >
   Daftar Transaksi). Semua fungsi di file ini HANYA menyusun &
   mengembalikan markup HTML (string), TIDAK ada logic/DOM-binding
   di sini. Logic-nya ada di file sebelah: sales-order.js

   Modul ini dibangun mengikuti pola Purchase Order (form full page,
   kalkulasi reaktif) & Stock Request (mode Lihat read-only, banner
   peringatan) — lihat js/pages/purchase-order.* & js/pages/
   stock-request.*. Field & tabel item SANGAT banyak sehingga form
   dibuat FULL PAGE (bukan modal), sama seperti kedua modul tersebut.

   Beberapa field pada form ini tidak punya modul master tersendiri
   di mockup (No. SP/Surat Pesanan, No. DSC), jadi picker-nya bersifat
   DEKORATIF (daftar dummy kecil, bukan nge-refer ke modul nyata) —
   pola yang sama seperti field "No. S.O. Indent" di Purchase Order.

   Picker "No. SQ" SEJAK 2026-08-13 sudah nge-refer ke modul Sales
   Quotation yang nyata (DATA.salesQuotation, lihat js/pages/
   sales-quotation.*) — melanjutkan rantai "master data yang saling
   nyambung" mundur satu langkah (Sales Quotation → Sales Order),
   menggantikan SO_SQ_DUMMY_LIST lama yang sudah DIHAPUS. Daftarnya
   dibangun on-the-fly di openSoDecorativePicker() call-site (lihat
   sales-order.js), BUKAN konstanta statis di sini lagi.
========================================================= */

const SO_TS_LIST = ['Baru','Diproses','Dikirim','Selesai'];
const SO_APPROVAL_LIST = ['Pending','Approved','Rejected'];
const SO_CABANG_CODE = {'Head Office':'HO','Surabaya':'SBY','Bandung':'BDG','Medan':'MDN','Makassar':'MKS','Semarang':'SMG','Tangerang':'TGR','Sidoarjo':'SDA'};

/* Daftar dummy dekoratif untuk picker No. SP / No. DSC — tidak ada
   modul Surat Pesanan/DSC yang nyata di mockup ini (masih 'placeholder'
   di sidebar), jadi datanya sekadar contoh. */
const SO_SP_DUMMY_LIST = [
  {no:'SP/HO/08/00013', tgl:'08/08/2026', ket:'Surat Pesanan Toko Sumber Rejeki'},
  {no:'SP/SBY/08/00007', tgl:'08/08/2026', ket:'Surat Pesanan UD Makmur Jaya'},
  {no:'SP/BDG/08/00005', tgl:'09/08/2026', ket:'Surat Pesanan CV Berkah Abadi'},
];
const SO_DSC_DUMMY_LIST = [
  {no:'DSC/SBY/08/00001', tgl:'08/08/2026', ket:'Discount Slip Customer UD Makmur Jaya'},
  {no:'DSC/BDG/08/00001', tgl:'10/08/2026', ket:'Discount Slip Customer CV Berkah Abadi'},
];

function tplSalesOrderListPage(){
  return `
    <div class="breadcrumb">Home / <b>Sales Order</b></div>
    <div class="card">
      <div class="card-header dark-header">
        <h3>${icon('invoice',15)} Daftar Sales Order</h3>
        <div class="toolbar-actions">
          <button class="chip-btn" id="btnSoStatusFilter">All ${icon('chevronDown',13)}</button>
          <button class="chip-btn" id="btnSoPeriod">Agustus 2026 ${icon('chevronDown',13)}</button>
          <button class="btn-primary" id="btnSoAdd">${icon('plus',14)} Tambah</button>
        </div>
      </div>
      <div class="table-toolbar">
        <select id="soPageSize"><option selected>10</option><option>25</option><option>50</option></select>
        <input type="text" id="soSearch" placeholder="Pencarian Global">
      </div>
      <div class="table-wrap"><table>
        <thead><tr>
          <th>No. SO</th>
          <th>No. SP</th>
          <th>Customer</th>
          <th>Wilayah</th>
          <th>TS</th>
          <th>Status Approval</th>
          <th>Lihat</th>
          <th>Ubah</th>
          <th>Hapus</th>
        </tr></thead>
        <tbody id="soTbody"></tbody>
      </table></div>
      <div class="table-footer"><div class="pager"><button>First</button><button>Previous</button><button class="active">1</button><button>Next</button><button>Last</button></div><div id="soTotal"></div></div>
    </div>`;
}

/* Status Approval ditampilkan sebagai teks berwarna, mengikuti pola
   .st-open/.st-closed di Stock Request (Approved=hijau reuse .st-open,
   Rejected=merah reuse .st-closed). "Pending" butuh warna ke-3 —
   dipakai inline style kuning (var(--yellow)) alih-alih menambah class
   CSS baru, supaya tidak nambah CSS untuk 1 kondisi saja. */
function tplSoApprovalText(status){
  if(status === 'Approved') return `<span class="st-open">${status}</span>`;
  if(status === 'Rejected') return `<span class="st-closed">${status}</span>`;
  return `<span style="color:var(--yellow);font-weight:700;">${status}</span>`;
}

function tplSoRows(rows){
  if(!rows.length) return `<tr><td colspan="9" style="color:var(--text-light);">Tidak ada data Sales Order</td></tr>`;
  return rows.map((r,i)=>`
    <tr>
      <td>${r.no}</td>
      <td>${r.noSP||''}</td>
      <td>${r.customer||''}</td>
      <td>${r.wilayah||''}</td>
      <td>${r.ts||''}</td>
      <td>${tplSoApprovalText(r.statusApproval)}</td>
      <td><button class="icon-btn view" data-view="${i}" title="Lihat">${icon('eye',15)}</button></td>
      <td><button class="icon-btn edit" data-edit="${i}" title="Ubah">${icon('edit',15)}</button></td>
      <td><button class="icon-btn del" data-del="${i}" title="Hapus">${icon('trash',15)}</button></td>
    </tr>`).join('');
}

/* Tabel item 2-tingkat: tiap barang punya 1 baris ringkasan (kalkulasi
   harga/diskon/pajak) + 1 baris detail langsung di bawahnya (No. Batch
   & Tgl. Kadaluarsa — dipilih sebagai interpretasi paling realistis utk
   detail per-item pengiriman FMCG bertanggal kadaluarsa, karena detail
   asli di screenshot MASERP tidak tersedia). Baris detail dibedakan
   secara visual lewat background lebih terang (inline style, bukan
   class baru) supaya terlihat seperti mini panel di bawah baris utama. */
function tplSoItemRow(item, idx, dis){
  return `
    <tr data-so-item-row="${idx}">
      <td style="min-width:130px;">
        <div class="input-with-btn">
          <input type="text" data-so-kode="${idx}" value="${item.kode||''}" placeholder="Kode" readonly>
          ${!dis ? `<button type="button" class="icon-btn edit" data-so-item-search="${idx}" title="Cari Barang">${icon('search',13)}</button>` : ''}
        </div>
      </td>
      <td style="min-width:180px;"><textarea data-so-nama="${idx}" rows="1" ${dis}>${item.nama||''}</textarea></td>
      <td style="width:70px;"><input type="number" min="0" data-so-qty="${idx}" value="${item.qty||0}" ${dis}></td>
      <td style="width:60px;">${item.um||''}</td>
      <td style="width:110px;"><input type="number" min="0" data-so-hna1="${idx}" value="${item.hna1||0}" ${dis}></td>
      <td style="width:130px;"><input type="text" data-so-hnaxqty="${idx}" value="${num(item.hnaXqty||0)}" disabled></td>
      <td style="width:100px;"><input type="number" min="0" data-so-potongan="${idx}" value="${item.potongan||0}" ${dis}></td>
      <td style="width:130px;"><input type="text" data-so-dpp="${idx}" value="${num(item.dpp||0)}" disabled></td>
      <td style="width:110px;">
        <select data-so-typeppn="${idx}" ${dis}>${DATA.typePpnList.map(t=>`<option ${item.typePpn===t?'selected':''}>${t}</option>`).join('')}</select>
      </td>
      <td style="width:120px;"><input type="text" data-so-ppn="${idx}" value="${num(item.ppn||0)}" disabled></td>
      <td style="width:110px;"><input type="number" min="0" data-so-biayakirim="${idx}" value="${item.biayaKirim||0}" ${dis}></td>
      <td style="width:34px;">${!dis ? `<button type="button" class="icon-btn del" data-so-item-del="${idx}" title="Hapus Baris">${icon('trash',13)}</button>` : ''}</td>
    </tr>
    <tr class="so-detail-row" data-so-detail-row="${idx}">
      <td colspan="12" style="background:#f7f8fb;padding:8px 14px;">
        <div style="display:flex;gap:22px;align-items:center;flex-wrap:wrap;font-size:12px;">
          <span style="color:var(--text-light);font-weight:600;">Detail Barang &darr;</span>
          <label style="display:flex;align-items:center;gap:6px;">No. Batch
            <input type="text" data-so-batch="${idx}" value="${item.noBatch||''}" ${dis} style="width:140px;border:1px solid var(--border);border-radius:5px;padding:5px 8px;font-size:12px;">
          </label>
          <label style="display:flex;align-items:center;gap:6px;">Tgl. Kadaluarsa
            <input type="text" data-so-ed="${idx}" value="${item.tglKadaluarsa||''}" placeholder="yyyy-mm-dd" ${dis} style="width:120px;border:1px solid var(--border);border-radius:5px;padding:5px 8px;font-size:12px;">
          </label>
        </div>
      </td>
    </tr>`;
}

function tplSoForm(mode, row){
  const isAdd = mode === 'add';
  const isView = mode === 'view';
  const dis = isView ? 'disabled' : '';
  const titleAction = isAdd ? 'Tambah' : (isView ? 'Lihat' : 'Ubah');
  const headerIcon = isAdd ? 'plus' : (isView ? 'eye' : 'edit');
  /* Banner PENDING: ditampilkan di mode Ubah/Lihat SELAMA statusApproval
     masih 'Pending' (belum diputuskan Approved/Rejected). Disembunyikan
     di mode Tambah (belum ada status approval sama sekali) dan otomatis
     hilang begitu statusApproval berubah jadi Approved/Rejected. */
  const showPendingBanner = !isAdd && row.statusApproval === 'Pending';
  return `
    <div class="breadcrumb">Home / Sales Order / <b>${titleAction}</b></div>
    ${showPendingBanner ? `<div class="alert-warning">Sales Order ini masih berstatus <b>Pending</b> — menunggu Approval sebelum dapat diproses lebih lanjut.</div>` : ''}
    <div class="card">
      <div class="card-header dark-header">
        <h3>${icon(headerIcon,15)} Sales Order</h3>
      </div>
      <div class="card-body">

        <div class="form-grid-3">
          <div class="form-group">
            <label>S. Office</label>
            <select id="fSoSOffice" ${(isView||!isAdd)?'disabled':''}>${DATA.outletList.map(c=>`<option ${row.sOffice===c?'selected':''}>${c}</option>`).join('')}</select>
          </div>
          <div class="form-group">
            <label>Area</label>
            <select id="fSoArea" ${dis}>${DATA.wilayah.map(w=>`<option ${row.area===w?'selected':''}>${w}</option>`).join('')}</select>
          </div>
          <div class="form-group">
            <label>Layanan</label>
            <select id="fSoLayanan" ${dis}>${DATA.layananList.map(l=>`<option ${row.layanan===l?'selected':''}>${l}</option>`).join('')}</select>
          </div>
          <div class="form-group">
            <label>Order Via</label>
            <select id="fSoOrderVia" ${dis}>${DATA.orderViaList.map(o=>`<option ${row.orderVia===o?'selected':''}>${o}</option>`).join('')}</select>
          </div>
        </div>

        <div class="po-grid-3">
          <div class="form-group">
            <label>Customer</label>
            <div class="input-with-btn">
              <input type="text" id="fSoCustomer" value="${row.customer||''}" placeholder="Pilih Customer" readonly>
              ${!isView ? `<button type="button" class="icon-btn edit" id="soCustomerSearch" title="Cari Customer">${icon('search',13)}</button>` : ''}
            </div>
          </div>
          <div class="form-group">
            <label>Alamat</label>
            <textarea id="fSoAlamat" class="po-textarea" rows="2" ${dis}>${row.alamat||''}</textarea>
          </div>
          <div class="form-group">
            <label>Rayon</label>
            <select id="fSoRayon" ${dis}>${DATA.rayonList.map(r=>`<option ${row.rayon===r?'selected':''}>${r}</option>`).join('')}</select>
          </div>
        </div>

        <div class="po-grid-3">
          <div class="form-group">
            <label>Principal</label>
            <div class="input-with-btn">
              <input type="text" id="fSoPrincipal" value="${row.principalNama||''}" placeholder="Pilih Supplier" readonly>
              ${!isView ? `<button type="button" class="icon-btn edit" id="soPrincipalSearch" title="Cari Principal">${icon('search',13)}</button>` : ''}
            </div>
          </div>
          <div class="form-group">
            <label>No. SO</label>
            <div class="input-with-btn">
              <input type="text" id="fSoNo" value="${row.no||''}" placeholder="Otomatis" readonly>
              ${isAdd ? `<button type="button" class="icon-btn edit" id="soRefreshNo" title="Generate Nomor">${icon('refreshCw',13)}</button>` : ''}
            </div>
          </div>
          <div class="form-group"></div>
        </div>

        <div class="po-grid-3">
          <div class="form-group">
            <label>No. SQ (Sales Quotation)</label>
            <div class="input-with-btn">
              <input type="text" id="fSoNoSQ" value="${row.noSQ||''}" placeholder="Pilih Sales Quotation" readonly>
              ${!isView ? `<button type="button" class="icon-btn edit" id="soSqSearch" title="Cari Sales Quotation">${icon('search',13)}</button>` : ''}
            </div>
          </div>
          <div class="form-group">
            <label>No. SP (Surat Pesanan)</label>
            <div class="input-with-btn">
              <input type="text" id="fSoNoSP" value="${row.noSP||''}" placeholder="Pilih Surat Pesanan" readonly>
              ${!isView ? `<button type="button" class="icon-btn edit" id="soSpSearch" title="Cari Surat Pesanan">${icon('search',13)}</button>` : ''}
            </div>
          </div>
          <div class="form-group">
            <label>No. DSC</label>
            <div class="input-with-btn">
              <input type="text" id="fSoNoDSC" value="${row.noDSC||''}" placeholder="Pilih DSC" readonly>
              ${!isView ? `<button type="button" class="icon-btn edit" id="soDscSearch" title="Cari DSC">${icon('search',13)}</button>` : ''}
            </div>
          </div>
        </div>

        <div style="display:flex;gap:28px;flex-wrap:wrap;margin:12px 0;">
          <div class="checkbox-row" style="margin:0;"><input type="checkbox" id="fSoCito" ${row.cito?'checked':''} ${dis}><label for="fSoCito">CITO</label></div>
          <div class="checkbox-row" style="margin:0;"><input type="checkbox" id="fSoSpAsli" ${row.spAsli?'checked':''} ${dis}><label for="fSoSpAsli">SP Asli</label></div>
          <div class="checkbox-row" style="margin:0;"><input type="checkbox" id="fSoSkEd" ${row.skEd?'checked':''} ${dis}><label for="fSoSkEd">SK ED</label></div>
        </div>

        <div class="form-group" style="max-width:340px;">
          <label>Upload File</label>
          ${!isView ? `<button type="button" class="btn-secondary" id="soUploadBtn" style="margin-bottom:6px;">${icon('file',13)} Upload File</button>` : ''}
          <div class="upload-box">Belum ada file diunggah.</div>
        </div>

        <div class="po-grid-3">
          <div class="form-group">
            <label>CL (Credit Limit)</label>
            <input type="text" id="fSoCl" value="${num(row.cl||0)}" disabled>
          </div>
          <div class="form-group">
            <label>Piutang</label>
            <input type="text" id="fSoPiutang" value="${num(row.piutang||0)}" disabled>
          </div>
          <div class="form-group">
            <label>Sisa CL</label>
            <input type="text" id="fSoSisaCl" value="${num(row.sisaCl||0)}" disabled>
          </div>
        </div>

        <div class="checkbox-row"><input type="checkbox" id="fSoKonsinyasi" ${row.konsinyasi?'checked':''} ${dis}><label for="fSoKonsinyasi">Konsinyasi</label></div>

        <div class="form-group">
          <label>Keterangan</label>
          <textarea id="fSoKeterangan" class="po-textarea" rows="2" ${dis}>${row.keterangan||''}</textarea>
        </div>

        <div class="checkbox-row"><input type="checkbox" id="fSoIsGuarantee" ${row.isGuarantee?'checked':''} ${dis}><label for="fSoIsGuarantee">Is Guarantee</label></div>

        <div class="po-grid-3">
          <div class="form-group">
            <div class="checkbox-row" style="margin:0;"><input type="checkbox" id="fSoPecahFaktur" ${row.pecahFaktur?'checked':''} ${dis}><label for="fSoPecahFaktur">Pecah Faktur</label></div>
          </div>
          <div class="form-group">
            <label>Basis Perhitungan Ongkos Kirim</label>
            <!-- Interpretasi: toggle ini menentukan basis perhitungan biaya
                 kirim/pengiriman barang (per berat / per dimensi volumetrik),
                 pola umum di ekspedisi logistik FMCG. Semantik asli di
                 screenshot MASERP tidak tersedia, jadi ini interpretasi
                 paling masuk akal — bukan mempengaruhi kalkulasi lain di
                 mockup ini (Biaya Kirim tetap diinput manual per baris). -->
            <div class="radio-inline">
              <label><input type="radio" name="fSoUkuranBasis" value="KG" ${row.ukuranBasis!=='Dimensi'?'checked':''} ${dis}> KG</label>
              <label><input type="radio" name="fSoUkuranBasis" value="Dimensi" ${row.ukuranBasis==='Dimensi'?'checked':''} ${dis}> Dimensi</label>
            </div>
          </div>
          <div class="form-group"></div>
        </div>

        <div class="card-header dark-header" style="border-radius:6px;margin:18px 0 14px;"><h3>${icon('clipboard',14)} Rincian Barang</h3></div>

        <div class="table-wrap" style="margin:6px 0 6px;">
          <table class="po-item-table">
            <thead><tr>
              <th>Kode Barang</th>
              <th>Nama Barang</th>
              <th>Qty</th>
              <th>U/M</th>
              <th class="text-right">HNA1</th>
              <th class="text-right">HNA1 &times; Qty</th>
              <th class="text-right">Potongan</th>
              <th class="text-right">DPP</th>
              <th>Type PPN</th>
              <th class="text-right">PPN</th>
              <th class="text-right">Biaya Kirim</th>
              <th></th>
            </tr></thead>
            <tbody id="soItemsBody">${row.items.map((it,idx)=>tplSoItemRow(it,idx,dis)).join('')}</tbody>
          </table>
        </div>
        ${!isView ? `<a href="#" id="soAddItem" class="link-add">${icon('plus',13)} Tambah Item Baru</a>` : ''}

        <table class="field-table po-rincian-table" style="margin-top:22px;max-width:460px;">
          <tr><td class="flabel">Total DPP</td><td><input type="text" id="fSoTotalDpp" value="${num(row.totalDpp||0)}" disabled></td></tr>
          <tr><td class="flabel">Total PPN</td><td><input type="text" id="fSoTotalPpn" value="${num(row.totalPpn||0)}" disabled></td></tr>
          <tr><td class="flabel">Total Biaya Kirim</td><td><input type="text" id="fSoTotalBiayaKirim" value="${num(row.totalBiayaKirim||0)}" disabled></td></tr>
          <tr><td class="flabel">Jumlah Akhir</td><td><input type="text" id="fSoJumlahAkhir" value="${num(row.jumlahAkhir||0)}" disabled style="font-weight:700;"></td></tr>
        </table>

        <div style="font-size:11.8px;color:var(--text-light);margin-top:6px;line-height:1.7;">
          ${row.tglInput ? `Tgl. Input : ${row.tglInput}  User Entry : ${row.userInput||''}<br>` : ''}
          ${row.tglEdit ? `Tgl Edit : ${row.tglEdit}  User Edit : ${row.userEdit||''}` : ''}
        </div>

        <div class="form-page-actions">
          ${isView
            ? `<a href="#" id="soTutup" class="link-add" style="margin-right:auto;">&larr; Kembali ke Daftar</a>`
            : `<a href="#" id="soBatalkan" class="link-add" style="margin-right:auto;">Batalkan</a>
               <button class="btn-primary" id="soSimpan">Simpan</button>`}
        </div>
      </div>
    </div>`;
}

function tplSoDeleteConfirm(row){
  return `
    <div class="modal-box">
      <div class="modal-header"><span>Hapus Sales Order</span><span class="close" id="modalClose">&times;</span></div>
      <div class="modal-body"><p>Yakin ingin menghapus Sales Order <b>${row.no}</b>?</p></div>
      <div class="modal-footer">
        <button class="btn-secondary" id="modalCancel">Batal</button>
        <button class="btn-danger" id="modalDelete">Hapus</button>
      </div>
    </div>`;
}

function tplSoInfoModal(title,text){
  return `
    <div class="modal-box">
      <div class="modal-header"><span>${title}</span><span class="close" id="modalClose">&times;</span></div>
      <div class="modal-body"><p>${text}</p></div>
      <div class="modal-footer">
        <button class="btn-primary" id="modalOk">Mengerti</button>
      </div>
    </div>`;
}

function tplSoCustomerPicker(list){
  return `
    <div class="modal-box" style="max-width:560px;">
      <div class="modal-header"><span>Pilih Customer</span><span class="close" id="modalClose">&times;</span></div>
      <div class="modal-body">
        <div class="table-wrap" style="max-height:340px;overflow:auto;"><table>
          <thead><tr><th>Kode</th><th>Nama Customer</th><th>Kota</th><th></th></tr></thead>
          <tbody>${list.map(c=>`<tr><td>${c.kode}</td><td>${c.nama}</td><td>${c.kota}</td><td><button class="btn-pick" data-pick-customer="${c.kode}">Pilih</button></td></tr>`).join('')}</tbody>
        </table></div>
      </div>
      <div class="modal-footer"><button class="btn-secondary" id="modalCancel">Tutup</button></div>
    </div>`;
}

function tplSoPrincipalPicker(list){
  return `
    <div class="modal-box" style="max-width:560px;">
      <div class="modal-header"><span>Pilih Principal</span><span class="close" id="modalClose">&times;</span></div>
      <div class="modal-body">
        <div class="table-wrap" style="max-height:340px;overflow:auto;"><table>
          <thead><tr><th>Kode</th><th>Nama Principal</th><th></th></tr></thead>
          <tbody>${list.map(s=>`<tr><td>${s.kode}</td><td>${s.nama}</td><td><button class="btn-pick" data-pick-principal="${s.kode}">Pilih</button></td></tr>`).join('')}</tbody>
        </table></div>
      </div>
      <div class="modal-footer"><button class="btn-secondary" id="modalCancel">Tutup</button></div>
    </div>`;
}

/* Picker dekoratif utk No. SQ/No. SP/No. DSC — 1 template dipakai
   bersama untuk ketiganya (beda judul & field target saja), karena
   ketiganya sama-sama tidak punya modul master nyata di mockup ini. */
function tplSoDecorativePicker(title, list, pickAttr){
  return `
    <div class="modal-box" style="max-width:520px;">
      <div class="modal-header"><span>${title}</span><span class="close" id="modalClose">&times;</span></div>
      <div class="modal-body">
        <div class="table-wrap"><table>
          <thead><tr><th>No.</th><th>Tanggal</th><th>Keterangan</th><th></th></tr></thead>
          <tbody>${list.length ? list.map(d=>`<tr><td>${d.no}</td><td>${d.tgl}</td><td>${d.ket}</td><td><button class="btn-pick" data-${pickAttr}="${d.no}">Pilih</button></td></tr>`).join('') : `<tr><td colspan="4" style="color:var(--text-light);">Tidak ada data</td></tr>`}</tbody>
        </table></div>
      </div>
      <div class="modal-footer"><button class="btn-secondary" id="modalCancel">Tutup</button></div>
    </div>`;
}

/* tplSoItemPicker()/tplSoItemPickerRows() DIHAPUS sejak 2026-08-12
   lanjutan lagi — digantikan popup "Daftar Persediaan" bersama
   (openPersediaanPicker()/tplPersediaanPickerModal() di js/core.js),
   dipanggil langsung dari openSoItemPicker() di sales-order.js. */
