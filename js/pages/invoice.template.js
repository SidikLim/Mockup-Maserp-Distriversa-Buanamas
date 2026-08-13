/* =========================================================
   TEMPLATE (HTML saja) — Invoice (Customer & Penjualan > Daftar
   Transaksi > Invoice, key page:'invoices'). Semua fungsi di file
   ini HANYA menyusun & mengembalikan markup HTML (string) atau
   helper murni (lookup 1 baris data / angka kecil), TIDAK ada
   DOM-binding di sini. Logic-nya ada di file sebelah: invoice.js

   Invoice adalah langkah BERIKUTNYA dalam rantai fulfillment
   Sales Order -> Picking List -> Invoice (lihat js/pages/
   sales-order.* & js/pages/picking-list.* — pola split template/
   logic, modal, & konvensi penamaan konstanta PKL_* ditiru persis
   di sini sebagai INV_*).

   Sebelumnya page:'invoices' cuma pemetaan generik read-only
   ({title,cols,rows} di objek `pages` dalam renderPage(), js/core.js,
   dengan 10 baris dummy {no,tgl,customer,jumlah,status} tanpa
   hubungan ke modul lain) — SUDAH DIHAPUS, digantikan modul CRUD
   sungguhan ini yang datanya benar-benar chained dari DATA.pickingList/
   DATA.salesOrders/DATA.customers (lihat komentar DATA.invoices di
   js/data.js untuk penjelasan lengkap derivasi tiap baris sample).

   2 screenshot MASERP yang dikirim user ("Invoices" list dengan kolom
   No Invoice/No SP/Customer/Area/No PL/No. SO (+ "@Rp." jumlah)/TS/
   Cetak(split-button)/Ubah/Hapus/Posting, dan form "+ Invoice" 3-kolom)
   dijadikan acuan LAYOUT saja — semua angka contoh di screenshot
   (nomor dokumen, nama customer, nilai Rupiah) berasal dari demo
   farmasi yang TIDAK ADA hubungannya dengan PT Distriversa Buanamas,
   jadi SEMUA diganti data DBM sendiri, termasuk "Gudang" yang di
   screenshot menampilkan teks "MIKA Group" (sisa demo perusahaan lain)
   — di mockup ini gudang SELALU salah satu dari INV_GUDANG_BY_CABANG
   (persis sama dengan PKL_GUDANG_BY_CABANG di Picking List).
========================================================= */

/* Sama persis dengan PKL_CABANG_LIST/PKL_CABANG_CODE di
   picking-list.template.js (8 cabang yang sama, kode yang sama). */
const INV_CABANG_LIST = ['Head Office','Surabaya','Bandung','Medan','Makassar','Semarang','Tangerang','Sidoarjo'];
const INV_CABANG_CODE = {'Head Office':'HO','Surabaya':'SBY','Bandung':'BDG','Medan':'MDN','Makassar':'MKS','Semarang':'SMG','Tangerang':'TGR','Sidoarjo':'SDA'};

/* Disalin VERBATIM dari PKL_GUDANG_BY_CABANG (picking-list.template.js)
   — SENGAJA bukan daftar gudang baru, supaya konsisten dengan modul
   upstream-nya (1 Cabang selalu = 1 Gudang Utama yang sama di seluruh
   mockup ini). Tangerang tetap dapat kode "03-GUU" sesuai konvensi yang
   sama seperti Picking List. */
const INV_GUDANG_LIST = [
  '(00-GUU) Gudang Utama-HO',
  '(01-GUU) Gudang Utama-SBY',
  '(02-GUU) Gudang Utama-BDG',
  '(03-GUU) Gudang Utama-TGR',
  '(04-GUU) Gudang Utama-MDN',
  '(05-GUU) Gudang Utama-MKS',
  '(06-GUU) Gudang Utama-SMG',
  '(07-GUU) Gudang Utama-SDA',
];
const INV_GUDANG_BY_CABANG = {
  'Head Office':'(00-GUU) Gudang Utama-HO',
  'Surabaya':'(01-GUU) Gudang Utama-SBY',
  'Bandung':'(02-GUU) Gudang Utama-BDG',
  'Tangerang':'(03-GUU) Gudang Utama-TGR',
  'Medan':'(04-GUU) Gudang Utama-MDN',
  'Makassar':'(05-GUU) Gudang Utama-MKS',
  'Semarang':'(06-GUU) Gudang Utama-SMG',
  'Sidoarjo':'(07-GUU) Gudang Utama-SDA',
};
const INV_SYARAT_BAYAR_LIST = ['CBD','Kredit 14 Hari','Kredit 30 Hari','Kredit 45 Hari','Kredit 60 Hari'];
const INV_SHIP_VIA_LIST = ['Driver','Ekspedisi','Diambil Sendiri','Dikirim Supplier'];

/* ===== Helper murni (lookup 1 baris) — dipakai bersama oleh invoice.js,
   TIDAK menyentuh DOM. ===== */
function invFindSO(no){ return DATA.salesOrders.find(s => s.no === no); }
function invFindPL(no){ return DATA.pickingList.find(p => p.no === no); }

function tplInvoiceListPage(){
  return `
    <div class="breadcrumb">Home / <b>Invoice</b></div>
    <div class="card">
      <div class="card-header dark-header">
        <h3>${icon('invoice',15)} Invoices</h3>
        <div class="toolbar-actions">
          <button class="chip-btn" id="btnInvPickingReq" style="background:var(--teal);">Picking Requested</button>
          <button class="chip-btn" id="btnInvTsFilter">${icon('search',12)} TS</button>
          <select class="chip-btn" id="invStatusFilter"><option>All</option><option>Create Invoice</option><option>Invoice Selesai</option></select>
          <select class="chip-btn" id="invPeriodFilter"><option>Agustus 2026</option></select>
          <button class="btn-primary" id="btnInvAdd">${icon('plus',14)} Tambah</button>
        </div>
      </div>
      <div class="table-toolbar">
        <select id="invPageSize"><option selected>10</option><option>25</option><option>50</option></select>
        <input type="text" id="invSearch" placeholder="Pencarian Global">
      </div>
      <div class="table-wrap"><table>
        <thead><tr>
          <th>No Invoice</th>
          <th>No SP</th>
          <th>Customer</th>
          <th>Area</th>
          <th>No PL</th>
          <th>No. SO</th>
          <th>TS</th>
          <th>Cetak</th>
          <th>Ubah</th>
          <th>Hapus</th>
          <th>Posting</th>
        </tr></thead>
        <tbody id="invTbody"></tbody>
      </table></div>
      <div class="table-footer"><div class="pager"><button>First</button><button>Previous</button><button class="active">1</button><button>Next</button><button>Last</button></div><div id="invTotal"></div></div>
    </div>`;
}

function tplInvRows(rows){
  if(!rows.length) return `<tr><td colspan="11" style="color:var(--text-light);">Tidak ada data Invoice</td></tr>`;
  return rows.map((r,i)=>{
    const dis = r.posted ? 'disabled' : '';
    const disStyle = r.posted ? 'opacity:.4;pointer-events:none;' : '';
    return `
    <tr>
      <td><b style="color:var(--blue);">${r.no}</b><br><span style="font-size:11px;color:var(--text-light);">${r.tglBuat||''}</span></td>
      <td>${r.noSP||''}</td>
      <td><b>${r.customerNama||''}</b><br><span style="font-size:11px;color:var(--text-light);">${r.customerKode||''} &amp;</span><br><span style="font-size:11.5px;color:var(--text-light);">${r.customerAlamat||''}</span></td>
      <td>${r.area||''}</td>
      <td><b>${r.noPL||''}</b><br><span style="font-size:11px;color:var(--text-light);">${r.tglBuat||''}</span></td>
      <td><b>${r.noSO||''}</b><br><span style="font-size:11px;color:var(--text-light);">${r.tglSP||''}</span><br><span style="font-size:11px;color:var(--text-light);">@Rp.${num(r.jumlah||0)}</span></td>
      <td>${r.ts||''}</td>
      <td>
        <div style="display:inline-flex;gap:2px;">
          <button class="icon-btn print" data-print="${i}" title="Cetak" ${dis} style="${disStyle}">${icon('printer',15)}</button>
          <button class="icon-btn print" data-print-menu="${i}" title="Pilihan Cetak" ${dis} style="width:18px;${disStyle}">${icon('chevronDown',12)}</button>
        </div>
      </td>
      <td><button class="icon-btn edit" data-edit="${i}" title="Ubah" ${dis} style="${disStyle}">${icon('edit',15)}</button></td>
      <td><button class="icon-btn del" data-del="${i}" title="Hapus" ${dis} style="${disStyle}">${icon('trash',15)}</button></td>
      <td><button class="icon-btn edit" data-posting="${i}" title="Posting ke General Ledger" ${dis} style="${disStyle}">${icon('check',15)}</button></td>
    </tr>`;
  }).join('');
}

/* Dropdown kecil "Pilihan Cetak" — dipicu tombol chevron di sebelah
   tombol Cetak (bukan <select> asli, tapi modal kecil dengan 2 opsi
   dekoratif, konsisten dengan kebijakan "tanpa alert()/confirm() bawaan
   browser" mockup ini). */
function tplInvCetakDropdown(row){
  return `
    <div class="modal-box" style="max-width:340px;">
      <div class="modal-header"><span>Pilihan Cetak</span><span class="close" id="modalClose">&times;</span></div>
      <div class="modal-body">
        <div style="display:flex;flex-direction:column;gap:8px;">
          <button class="btn-secondary" id="invCetakInvoice" style="text-align:left;">${icon('printer',13)} Cetak Invoice</button>
          <button class="btn-secondary" id="invCetakSJ" style="text-align:left;">${icon('printer',13)} Cetak Surat Jalan</button>
        </div>
      </div>
      <div class="modal-footer"><button class="btn-secondary" id="modalCancel">Tutup</button></div>
    </div>`;
}

/* ===== Baris tabel "Produk" (tab Detail Transaksi) — read-only kecuali
   Qty Kirim, seluruhnya diturunkan dari Picking List yang dipilih
   (lihat invApplyPickingList() di invoice.js). Tidak ada tombol
   tambah/hapus baris (berbeda dari Picking List/Purchase Order) karena
   daftar barang di sini murni salinan dari 1 Picking List sumber. ===== */
function tplInvItemRow(item, idx){
  return `
    <tr data-inv-item-row="${idx}">
      <td style="width:32px;">${idx+1}</td>
      <td style="min-width:100px;">${item.kode||''}</td>
      <td style="min-width:170px;">${item.nama||''}</td>
      <td style="width:70px;">${item.satuan||''}</td>
      <td style="width:90px;"><input type="number" data-inv-qtypesan="${idx}" value="${item.qtyPesan||0}" disabled></td>
      <td style="width:100px;"><input type="number" min="0" data-inv-qtykirim="${idx}" value="${item.qtyKirim||0}"></td>
      <td style="width:130px;"><input type="text" data-inv-batch="${idx}" value="${item.batch||''}" disabled></td>
      <td style="width:100px;"><input type="text" data-inv-ed="${idx}" value="${item.ed||''}" disabled></td>
    </tr>`;
}

/* Tab "Rincian Jurnal Akun" — TIDAK ADA screenshot untuk isi tab ini,
   jadi sengaja dibuat placeholder dekoratif murni (mengikuti pola
   renderPlaceholder() di core.js) alih-alih mengarang nomor akun GL/
   baris debit-kredit yang tidak bisa diverifikasi dari sumber mana pun. */
function tplInvJurnalPlaceholder(){
  return `
    <div class="placeholder-box" style="padding:36px 20px;">
      <div class="pico">${icon('book',36)}</div>
      <h3 style="font-size:14px;font-weight:700;color:#5b6178;">Rincian Jurnal Akun</h3>
      <p>Preview jurnal akun (debit/kredit) hasil posting Invoice ini akan tersedia di sini pada versi lengkap.</p>
    </div>`;
}

function tplInvForm(mode, row){
  const isAdd = mode === 'add';
  const titleAction = isAdd ? 'Tambah' : 'Ubah';
  const headerIcon = isAdd ? 'plus' : 'edit';
  return `
    <div class="breadcrumb">Home / Invoice / <b>${titleAction}</b></div>
    <div class="card">
      <div class="card-header dark-header">
        <h3>${icon(headerIcon,15)} ${isAdd?'+ Invoice':'Invoice'}</h3>
      </div>
      <div class="card-body">
        <h2 style="font-size:15px;font-weight:700;color:var(--navy);margin-bottom:14px;">INVOICE</h2>

        <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:16px;">
          <table class="field-table">
            <tr>
              <td class="flabel">Cabang</td>
              <td><select id="fInvCabang" ${!isAdd?'disabled':''}>${INV_CABANG_LIST.map(c=>`<option ${row.cabang===c?'selected':''}>${c}</option>`).join('')}</select></td>
            </tr>
            <tr>
              <td class="flabel">No. IVC</td>
              <td><input type="text" id="fInvNoIVC" value="${row.no||''}" readonly></td>
            </tr>
            <tr>
              <td class="flabel">No. SJ</td>
              <td>
                <div class="input-with-btn">
                  <input type="text" id="fInvNoSJ" value="${row.noSJ||''}" readonly>
                  ${isAdd ? `<button type="button" class="icon-btn edit" id="invRefreshNo" title="Generate Ulang Nomor">${icon('refreshCw',13)}</button>` : ''}
                </div>
              </td>
            </tr>
            <tr>
              <td class="flabel">Tgl</td>
              <td>
                <div class="input-with-btn">
                  <input type="text" id="fInvTgl" value="${row.tgl||''}" readonly>
                  <span class="icon-btn edit" style="pointer-events:none;">${icon('calendar',13)}</span>
                </div>
              </td>
            </tr>
            <tr>
              <td class="flabel">No SO</td>
              <td>
                <div class="input-with-btn">
                  <input type="text" id="fInvNoSO" value="${row.noSO||''}" placeholder="Pilih Sales Order" readonly>
                  <button type="button" class="icon-btn edit" id="invSoSearch" title="Cari Sales Order">${icon('search',13)}</button>
                </div>
              </td>
            </tr>
            <tr>
              <td class="flabel">No PL</td>
              <td>
                <div class="input-with-btn">
                  <input type="text" id="fInvNoPL" value="${row.noPL||''}" placeholder="Pilih Picking List" readonly>
                  <button type="button" class="icon-btn edit" id="invPlSearch" title="Cari Picking List">${icon('search',13)}</button>
                </div>
              </td>
            </tr>
            <tr>
              <td class="flabel">Principal</td>
              <td><input type="text" id="fInvPrincipal" value="${row.principalNama||''}" readonly></td>
            </tr>
            <tr>
              <td class="flabel">No DSC</td>
              <td><input type="text" id="fInvNoDSC" value="${row.noDSC||''}" placeholder="Diskon" readonly></td>
            </tr>
            <tr>
              <td class="flabel">No DOM</td>
              <td><input type="text" id="fInvNoDOM" value="" placeholder="Dominasi Konsumen" readonly></td>
            </tr>
          </table>

          <table class="field-table">
            <tr>
              <td class="flabel">Gudang</td>
              <td><select id="fInvGudang">${INV_GUDANG_LIST.map(g=>`<option ${row.gudang===g?'selected':''}>${g}</option>`).join('')}</select></td>
            </tr>
            <tr>
              <td class="flabel">Customer</td>
              <td>
                <input type="text" id="fInvCustomerNama" value="${row.customerNama||''}" readonly>
                <div style="font-size:11px;color:var(--text-light);margin-top:4px;">${row.customerKode||''}</div>
                <div style="font-size:11px;color:var(--text-light);margin-top:2px;">Kode Lama : </div>
              </td>
            </tr>
            <tr>
              <td class="flabel">Syarat Bayar</td>
              <td><select id="fInvSyaratBayar">${INV_SYARAT_BAYAR_LIST.map(s=>`<option ${row.syaratBayar===s?'selected':''}>${s}</option>`).join('')}</select></td>
            </tr>
            <tr>
              <td class="flabel">No SP</td>
              <td><input type="text" id="fInvNoSP" value="${row.noSP||''}" readonly></td>
            </tr>
            <tr>
              <td class="flabel">Tgl SP</td>
              <td><input type="text" id="fInvTglSP" value="${row.tglSP||''}" readonly></td>
            </tr>
            <tr>
              <td class="flabel">SP Asli</td>
              <td><div class="checkbox-row" style="margin:0;"><input type="checkbox" id="fInvSpAsli" ${row.spAsli?'checked':''}><label for="fInvSpAsli">SP Asli</label></div></td>
            </tr>
            <tr>
              <td class="flabel">SK ED</td>
              <td><div class="checkbox-row" style="margin:0;"><input type="checkbox" id="fInvSkEd" ${row.skEd?'checked':''}><label for="fInvSkEd">SK ED</label></div></td>
            </tr>
            <tr>
              <td class="flabel">CITO</td>
              <td>
                <div style="display:flex;align-items:center;gap:10px;">
                  <div class="checkbox-row" style="margin:0;"><input type="checkbox" id="fInvCito" ${row.cito?'checked':''}><label for="fInvCito">CITO</label></div>
                  <input type="text" id="fInvCitoTgl" value="${row.citoTgl||row.tgl||''}" readonly style="max-width:110px;">
                </div>
              </td>
            </tr>
          </table>

          <table class="field-table">
            <tr>
              <td class="flabel">Tipe Layanan</td>
              <td><select id="fInvLayanan">${DATA.layananList.map(l=>`<option ${row.layanan===l?'selected':''}>${l}</option>`).join('')}</select></td>
            </tr>
            <tr>
              <td class="flabel">Alamat Pengiriman</td>
              <td><textarea id="fInvAlamatKirim" class="po-textarea" rows="2">${row.alamatPengiriman||''}</textarea></td>
            </tr>
            <tr>
              <td class="flabel">Ship Via</td>
              <td><select id="fInvShipVia">${INV_SHIP_VIA_LIST.map(s=>`<option ${row.shipVia===s?'selected':''}>${s}</option>`).join('')}</select></td>
            </tr>
            <tr>
              <td class="flabel">No Resi</td>
              <td><input type="text" id="fInvNoResi" value="${row.noResi||''}" placeholder="No. Resi (opsional)"></td>
            </tr>
            <tr>
              <td class="flabel">Driver</td>
              <td>
                <div class="input-with-btn">
                  <input type="text" id="fInvDriver" value="${row.driver||''}" placeholder="Pilih Driver" readonly>
                  <button type="button" class="icon-btn edit" id="invDriverSearch" title="Cari Driver">${icon('search',13)}</button>
                </div>
              </td>
            </tr>
          </table>
        </div>

        <table class="field-table" style="margin-top:4px;">
          <tr>
            <td class="flabel">Keterangan</td>
            <td><textarea id="fInvKeterangan" class="po-textarea" rows="2">${row.keterangan||''}</textarea></td>
          </tr>
        </table>

        <div class="inv-tabs">
          <button type="button" class="inv-tab-btn active" id="invTabDetailBtn">Detail Transaksi</button>
          <button type="button" class="inv-tab-btn" id="invTabJurnalBtn">Rincian Jurnal Akun</button>
        </div>

        <div id="invTabDetailContent">
          <div class="card-header dark-header" style="border-radius:6px;margin:0 0 14px;">
            <h3>${icon('clipboard',14)} Produk</h3>
          </div>
          <div class="table-wrap" style="margin:6px 0 6px;">
            <table class="po-item-table">
              <thead><tr>
                <th>No</th>
                <th>Kode Barang</th>
                <th>Nama Barang</th>
                <th>Satuan</th>
                <th>Qty Pesan</th>
                <th>Qty Kirim</th>
                <th>Batch</th>
                <th>ED</th>
              </tr></thead>
              <tbody id="invItemsBody">${row.items.map((it,idx)=>tplInvItemRow(it,idx)).join('')}</tbody>
            </table>
          </div>
          <div id="invItemsEmptyHint" style="font-size:11.5px;color:var(--text-light);margin-top:6px;${row.items.length?'display:none;':''}">Belum ada barang — pilih No SO atau No PL terlebih dahulu.</div>
        </div>
        <div id="invTabJurnalContent" style="display:none;">${tplInvJurnalPlaceholder()}</div>

        <div style="font-size:11.8px;color:var(--text-light);margin-top:18px;line-height:1.7;">
          ${row.tglInput ? `Tgl. Input : ${row.tglInput}  User Entry : ${row.userInput||''}<br>` : ''}
          ${row.tglEdit ? `Tgl Edit : ${row.tglEdit}  User Edit : ${row.userEdit||''}` : ''}
        </div>

        <div class="form-page-actions">
          <a href="#" id="invBatalkan" class="link-add" style="margin-right:auto;">Batalkan</a>
          ${!isAdd ? `<button type="button" class="btn-teal" id="invCetak">${icon('printer',13)} Cetak</button>` : ''}
          <button class="btn-primary" id="invSimpan">Simpan</button>
        </div>
      </div>
    </div>`;
}

function tplInvDeleteConfirm(row){
  return `
    <div class="modal-box">
      <div class="modal-header"><span>Hapus Invoice</span><span class="close" id="modalClose">&times;</span></div>
      <div class="modal-body"><p>Yakin ingin menghapus Invoice <b>${row.no}</b>?</p></div>
      <div class="modal-footer">
        <button class="btn-secondary" id="modalCancel">Batal</button>
        <button class="btn-danger" id="modalDelete">Hapus</button>
      </div>
    </div>`;
}

function tplInvInfoModal(title,text){
  return `
    <div class="modal-box">
      <div class="modal-header"><span>${title}</span><span class="close" id="modalClose">&times;</span></div>
      <div class="modal-body"><p>${text}</p></div>
      <div class="modal-footer">
        <button class="btn-primary" id="modalOk">Mengerti</button>
      </div>
    </div>`;
}

/* Modal konfirmasi Posting — TRANSISI SATU ARAH (berbeda dari
   Checked/Terkirim di Picking List yang reversible lewat tombol
   trash "Batalkan Terkirim"): begitu posted:true, TIDAK ADA cara
   membatalkannya lagi dari UI ini, sesuai teks peringatan di modal. */
function tplInvPostingConfirm(row){
  return `
    <div class="modal-box">
      <div class="modal-header"><span>Posting Invoice</span><span class="close" id="modalClose">&times;</span></div>
      <div class="modal-body"><p>Posting Invoice <b>${row.no}</b> ini ke General Ledger? Setelah di-posting, invoice tidak dapat diubah atau dihapus lagi.</p></div>
      <div class="modal-footer">
        <button class="btn-secondary" id="modalCancel">Batal</button>
        <button class="btn-primary" id="modalConfirm">Ya, Posting</button>
      </div>
    </div>`;
}

function tplInvSoPicker(list){
  return `
    <div class="modal-box" style="max-width:620px;">
      <div class="modal-header"><span>Pilih Sales Order</span><span class="close" id="modalClose">&times;</span></div>
      <div class="modal-body">
        <div class="table-wrap" style="max-height:340px;overflow:auto;"><table>
          <thead><tr><th>No. SO</th><th>Customer</th><th>Wilayah</th><th></th></tr></thead>
          <tbody>${list.length ? list.map(s=>`<tr><td>${s.no}</td><td>${s.customer||''}</td><td>${s.wilayah||''}</td><td><button class="btn-pick" data-pick-so="${s.no}">Pilih</button></td></tr>`).join('') : `<tr><td colspan="4" style="color:var(--text-light);">Tidak ada Sales Order</td></tr>`}</tbody>
        </table></div>
      </div>
      <div class="modal-footer"><button class="btn-secondary" id="modalCancel">Tutup</button></div>
    </div>`;
}

function tplInvPlPicker(list){
  return `
    <div class="modal-box" style="max-width:640px;">
      <div class="modal-header"><span>Pilih Picking List</span><span class="close" id="modalClose">&times;</span></div>
      <div class="modal-body">
        <div class="table-wrap" style="max-height:340px;overflow:auto;"><table>
          <thead><tr><th>No. PL</th><th>Customer</th><th>No. SO</th><th></th></tr></thead>
          <tbody>${list.length ? list.map(p=>`<tr><td>${p.no}</td><td>${p.customerNama||''}</td><td>${p.noSO||''}</td><td><button class="btn-pick" data-pick-pl="${p.no}">Pilih</button></td></tr>`).join('') : `<tr><td colspan="4" style="color:var(--text-light);">Tidak ada Picking List</td></tr>`}</tbody>
        </table></div>
      </div>
      <div class="modal-footer"><button class="btn-secondary" id="modalCancel">Tutup</button></div>
    </div>`;
}

function tplInvDriverPicker(list){
  return `
    <div class="modal-box" style="max-width:420px;">
      <div class="modal-header"><span>Pilih Driver</span><span class="close" id="modalClose">&times;</span></div>
      <div class="modal-body">
        <div class="table-wrap" style="max-height:340px;overflow:auto;"><table>
          <thead><tr><th>Driver</th><th></th></tr></thead>
          <tbody>${list.map(d=>`<tr><td>${d}</td><td><button class="btn-pick" data-pick-driver="${d}">Pilih</button></td></tr>`).join('')}</tbody>
        </table></div>
      </div>
      <div class="modal-footer"><button class="btn-secondary" id="modalCancel">Tutup</button></div>
    </div>`;
}
