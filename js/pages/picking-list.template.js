/* =========================================================
   TEMPLATE (HTML saja) — Picking List (Customer & Penjualan >
   alur fulfillment penjualan, terdaftar di js/menu.js dengan key
   page:'pickingList'). Semua fungsi di file ini HANYA menyusun &
   mengembalikan markup HTML (string) atau helper murni yang
   mengembalikan angka/teks kecil, TIDAK ada DOM-binding di sini.
   Logic-nya ada di file sebelah: picking-list.js

   Sesuai 2 screenshot MASERP yang dikirim user: "Picking List"
   (list, dengan kolom No.PL/Customer/Area/No.SO 2-baris per sel,
   Status teks berwarna, dan 4 kolom aksi Cetak/Checked/Ubah/Hapus)
   dan "Picking List" (form Tambah/Ubah, full page — field Cabang/
   No.S.O./No Picking List/Tgl di kolom kiri, Area/Gudang/Picker/
   Picker & Checker di kolom kanan, lalu tabel rincian barang
   dengan Qty Order/Qty Picking reaktif + alokasi Batch Number per
   baris). Pola CRUD full page sama seperti Stock Request/Purchase
   Order/Sales Order — lihat file-file itu untuk konvensi split
   template/logic, modal, & kalkulasi reaktif.

   Sebelumnya page:'pickingList' cuma pemetaan generik read-only
   ({title,cols,rows} di objek `pages` dalam renderPage(), js/core.js)
   — sudah DIHAPUS, digantikan modul CRUD sungguhan ini.
========================================================= */

const PKL_CABANG_LIST = ['Head Office','Surabaya','Bandung','Medan','Makassar','Semarang','Tangerang','Sidoarjo'];
const PKL_CABANG_CODE = {'Head Office':'HO','Surabaya':'SBY','Bandung':'BDG','Medan':'MDN','Makassar':'MKS','Semarang':'SMG','Tangerang':'TGR','Sidoarjo':'SDA'};

/* Daftar Gudang per Cabang — urutan kode SENGAJA BUKAN mengikuti urutan
   PKL_CABANG_LIST (HO/SBY/BDG/MDN/MKS/SMG/TGR/SDA), melainkan urutan
   HO/SBY/BDG/TGR/MDN/MKS/SMG/SDA — supaya Tangerang persis dapat kode
   "03-GUU" sesuai contoh screenshot (No Picking List 26/PKL/TGR/08/00168,
   Gudang "(03-GUU) Gudang Utama-TGR"). PKL_GUDANG_LIST dipakai untuk
   opsi <select> (urutan yang sama persis), PKL_GUDANG_BY_CABANG untuk
   auto-pilih default per Cabang. */
const PKL_GUDANG_LIST = [
  '(00-GUU) Gudang Utama-HO',
  '(01-GUU) Gudang Utama-SBY',
  '(02-GUU) Gudang Utama-BDG',
  '(03-GUU) Gudang Utama-TGR',
  '(04-GUU) Gudang Utama-MDN',
  '(05-GUU) Gudang Utama-MKS',
  '(06-GUU) Gudang Utama-SMG',
  '(07-GUU) Gudang Utama-SDA',
];
const PKL_GUDANG_BY_CABANG = {
  'Head Office':'(00-GUU) Gudang Utama-HO',
  'Surabaya':'(01-GUU) Gudang Utama-SBY',
  'Bandung':'(02-GUU) Gudang Utama-BDG',
  'Tangerang':'(03-GUU) Gudang Utama-TGR',
  'Medan':'(04-GUU) Gudang Utama-MDN',
  'Makassar':'(05-GUU) Gudang Utama-MKS',
  'Semarang':'(06-GUU) Gudang Utama-SMG',
  'Sidoarjo':'(07-GUU) Gudang Utama-SDA',
};
const PKL_AREA_BY_CABANG = {
  'Head Office':'JABODETABEK BANTEN', 'Tangerang':'JABODETABEK BANTEN',
  'Surabaya':'JAWA TIMUR', 'Sidoarjo':'JAWA TIMUR',
  'Bandung':'JAWA BARAT', 'Medan':'SUMATERA UTARA',
  'Makassar':'SULAWESI SELATAN', 'Semarang':'JAWA TENGAH',
};
/* Dropdown prefix "No Picking List" — dekoratif (mengikuti pola prefix
   Kode Supplier di Master Supplier), nomor yang benar-benar dipakai tetap
   di-generate lewat pklGenerateNumber() di picking-list.js. */
const PKL_PREFIX_LIST = ['PKL01','PKL02'];

function tplPickingListPage(){
  return `
    <div class="breadcrumb">Home / <b>Picking List</b></div>
    <div class="card">
      <div class="card-header dark-header">
        <h3>${icon('truck',15)} Picking List</h3>
        <div class="toolbar-actions">
          <select class="chip-btn" id="pklStatusFilter">
            <option>All</option>
            <option>Waiting Request Packing</option>
            <option>Terkirim</option>
          </select>
          <select class="chip-btn" id="pklPeriodFilter"><option>Agustus 2026</option></select>
          <button class="btn-primary" id="btnPklAdd">${icon('plus',14)} Tambah</button>
        </div>
      </div>
      <div class="table-toolbar">
        <select id="pklPageSize"><option selected>10</option><option>25</option><option>50</option></select>
        <input type="text" id="pklSearch" placeholder="Pencarian Global">
      </div>
      <div class="table-wrap"><table>
        <thead><tr>
          <th>No. PL</th>
          <th>Customer</th>
          <th>Area</th>
          <th>No. SO</th>
          <th>Status</th>
          <th>Cetak</th>
          <th>Checked</th>
          <th>Ubah</th>
          <th>Hapus</th>
        </tr></thead>
        <tbody id="pklTbody"></tbody>
      </table></div>
      <div class="table-footer"><div class="pager"><button>First</button><button>Previous</button><button class="active">1</button><button>Next</button><button>Last</button></div><div id="pklTotal"></div></div>
    </div>`;
}

/* Status ditampilkan sebagai teks berwarna (bukan pill), mengikuti pola
   .st-open/.st-closed di Stock Request. Pemilihan warna (keputusan
   desain, screenshot asli tidak bisa dipastikan warnanya persis):
   - "Waiting Request Packing" -> teal (reuse var(--teal), warna aksen
     yang sudah dipakai di .icon-btn.print/.chip-btn) — merepresentasikan
     "masih dalam antrian/proses", bukan warning/error.
   - "Terkirim" -> hijau (reuse .st-open) — status akhir yang sukses,
     konsisten dengan konvensi warna hijau=selesai/aktif/paid di seluruh
     mockup ini (fmtCell 'selesai'/'paid'/'aktif' -> hijau). */
function tplPklStatusText(status){
  if(status === 'Terkirim') return `<span class="st-open">${status}</span>`;
  return `<span style="color:var(--teal);font-weight:700;">${status}</span>`;
}

function tplPklCheckedBtn(row, i){
  if(row.status === 'Waiting Request Packing'){
    return `<button class="icon-btn check" data-checked="${i}" title="Checked">${icon('check',15)}</button>`;
  }
  return `<button class="icon-btn del" data-revert="${i}" title="Batalkan Terkirim">${icon('trash',15)}</button>`;
}

function tplPklRows(rows){
  if(!rows.length) return `<tr><td colspan="9" style="color:var(--text-light);">Tidak ada data Picking List</td></tr>`;
  return rows.map((r,i)=>`
    <tr>
      <td><b style="color:var(--blue);">${r.no}</b><br><span style="font-size:11px;color:var(--text-light);">${r.tglBuat||''}</span></td>
      <td><b>${r.customerNama||''}</b><br><span style="font-size:11px;color:var(--text-light);">${r.customerKode||''} &amp;</span><br><span style="font-size:11.5px;color:var(--text-light);">${r.customerAlamat||''}</span></td>
      <td>${r.area||''}</td>
      <td><b>${r.noSO||''}</b><br><span style="font-size:11px;color:var(--text-light);">${r.tglSO||''}</span></td>
      <td>${tplPklStatusText(r.status)}</td>
      <td><button class="icon-btn print" data-print="${i}" title="Cetak">${icon('printer',15)}</button></td>
      <td>${tplPklCheckedBtn(r, i)}</td>
      <td><button class="icon-btn edit" data-edit="${i}" title="Ubah">${icon('edit',15)}</button></td>
      <td><button class="icon-btn del" data-del="${i}" title="Hapus">${icon('trash',15)}</button></td>
    </tr>`).join('');
}

/* Tag chip "Picker" (multi-value). Tombol hapus (x) per chip disembunyikan
   kalau `readonly` true (dipakai kalau ke depan modul ini butuh mode
   Lihat — saat ini tidak dipakai karena list Picking List tidak punya
   aksi Lihat, cuma Cetak/Checked/Ubah/Hapus, sesuai spesifikasi). */
function tplPklPickerTags(picker, readonly){
  if(!picker || !picker.length) return `<span style="font-size:11.5px;color:var(--text-light);">Belum ada Picker dipilih</span>`;
  return picker.map((name,i)=>`<span class="tag-chip">${name}${!readonly?`<span class="rm" data-rm-picker="${i}">&times;</span>`:''}</span>`).join('');
}

/* Baris alokasi Batch yang sudah dipilih untuk 1 item (ditampilkan di
   bawah kotak cari Batch dalam sel "Batch Number"). */
function tplPklBatchAllocRows(item, idx, dis){
  if(!item.batches || !item.batches.length) return `<div style="font-size:11px;color:var(--text-light);margin-top:4px;">Belum ada batch dipilih</div>`;
  return item.batches.map((b,bi)=>`
    <div style="display:flex;gap:8px;align-items:center;font-size:11.5px;padding:3px 0;border-bottom:1px dashed var(--border);">
      <span style="flex:1;">${b.kode}</span>
      <span style="width:46px;text-align:right;">${num(b.qty||0)}</span>
      <span style="width:88px;">${b.tglExpired||''}</span>
      ${!dis ? `<span class="icon-btn del" style="width:20px;height:20px;cursor:pointer;" data-pkl-batch-del="${idx}:${bi}" title="Hapus">${icon('trash',11)}</span>` : ''}
    </div>`).join('');
}

/* Baris tabel "Produk" — No/Kode Barang/Nama Barang/Satuan/Qty Order/
   Qty Picking (+ helper "Ready: N")/Batch Number (+ mini-list alokasi)/
   Qty Sisa. `pklItemReady()` dipanggil dari sini (didefinisikan di
   picking-list.js, logic murni) — aman karena fungsi ini baru benar-benar
   DIPANGGIL saat render (setelah kedua file, template & logic, selesai
   dimuat), bukan saat file ini di-parse. */
function tplPklItemRow(item, idx, dis){
  return `
    <tr data-pkl-item-row="${idx}">
      <td style="width:32px;">${idx+1}</td>
      <td style="min-width:110px;">
        <div class="input-with-btn">
          <input type="text" data-pkl-kode="${idx}" value="${item.kode||''}" placeholder="Kode" readonly>
          ${!dis ? `<button type="button" class="icon-btn edit" data-pkl-item-search="${idx}" title="Cari Barang">${icon('search',13)}</button>` : ''}
        </div>
      </td>
      <td style="min-width:170px;">${item.nama||''}</td>
      <td style="width:70px;">${item.satuan||''}</td>
      <td style="width:80px;"><input type="number" data-pkl-qtyorder="${idx}" value="${item.qtyOrder||0}" disabled></td>
      <td style="width:110px;">
        <input type="number" min="0" data-pkl-qtypicking="${idx}" value="${item.qtyPicking||0}" ${dis}>
        <div style="font-size:11px;color:var(--text-light);margin-top:3px;" id="pklReady${idx}">Ready: ${num(pklItemReady(item))}</div>
      </td>
      <td style="min-width:220px;">
        <div class="input-with-btn">
          <input type="text" placeholder="Cari batch..." readonly>
          ${!dis ? `<button type="button" class="icon-btn edit" data-pkl-batch-search="${idx}" title="Pilih Batch">${icon('search',12)}</button>` : ''}
        </div>
        <div id="pklBatchList${idx}">${tplPklBatchAllocRows(item, idx, dis)}</div>
      </td>
      <td style="width:90px;"><input type="text" data-pkl-qtysisa="${idx}" value="${num(item.qtySisa||0)}" disabled></td>
      <td style="width:34px;">${!dis ? `<button type="button" class="icon-btn del" data-pkl-item-del="${idx}" title="Hapus Baris">${icon('trash',13)}</button>` : ''}</td>
    </tr>`;
}

function tplPklForm(mode, row){
  const isAdd = mode === 'add';
  const dis = '';
  const titleAction = isAdd ? 'Tambah' : 'Ubah';
  const headerIcon = isAdd ? 'plus' : 'edit';
  return `
    <div class="breadcrumb">Home / Picking List / <b>${titleAction}</b></div>
    <div class="card">
      <div class="card-header dark-header">
        <h3>${icon(headerIcon,15)} Picking List</h3>
        <button class="btn-danger" id="btnPklTutorial" type="button">${icon('card',14)} Tutorial</button>
      </div>
      <div class="card-body">
        <h2 style="font-size:15px;font-weight:700;color:var(--navy);margin-bottom:14px;">PICKING LIST</h2>

        <table class="field-table">
          <tr>
            <td class="flabel">Cabang</td>
            <td><select id="fPklCabang" ${(!isAdd)?'disabled':''}>${PKL_CABANG_LIST.map(c=>`<option ${row.cabang===c?'selected':''}>${c}</option>`).join('')}</select></td>
            <td class="flabel">Area</td>
            <td><input type="text" id="fPklArea" value="${row.area||''}" readonly></td>
          </tr>
          <tr>
            <td class="flabel">No. S.O.</td>
            <td>
              <div class="input-with-btn">
                <input type="text" id="fPklNoSO" value="${row.noSO||''}" placeholder="Pilih Sales Order" readonly>
                <button type="button" class="icon-btn edit" id="pklSoSearch" title="Cari Sales Order">${icon('search',13)}</button>
              </div>
            </td>
            <td class="flabel">Gudang</td>
            <td><select id="fPklGudang">${PKL_GUDANG_LIST.map(g=>`<option ${row.gudang===g?'selected':''}>${g}</option>`).join('')}</select></td>
          </tr>
          <tr>
            <td class="flabel">No Picking List</td>
            <td>
              <div class="field-pair">
                <select id="fPklPrefix" ${!isAdd?'disabled':''}>${PKL_PREFIX_LIST.map(p=>`<option ${row.prefix===p?'selected':''}>${p}</option>`).join('')}</select>
                <div class="input-with-btn" style="flex:1;">
                  <input type="text" id="fPklNo" value="${row.no||''}" placeholder="Otomatis" readonly>
                  ${isAdd ? `<button type="button" class="icon-btn edit" id="pklRefreshNo" title="Generate Nomor">${icon('refreshCw',14)}</button>` : ''}
                </div>
              </div>
            </td>
            <td class="flabel">Picker</td>
            <td>
              <div class="tag-box" id="fPklPickerBox">${tplPklPickerTags(row.picker, false)}</div>
              <a href="#" id="pklAddPicker" class="link-add">${icon('plus',13)} Tambah Picker</a>
            </td>
          </tr>
          <tr>
            <td class="flabel">Tgl Picking List</td>
            <td>
              <div class="input-with-btn">
                <input type="text" id="fPklTgl" value="${row.tglPicking||''}">
                <span class="icon-btn edit" style="pointer-events:none;">${icon('calendar',14)}</span>
              </div>
            </td>
            <td class="flabel">Picker &amp; Checker</td>
            <td><select id="fPklPickerChecker">${DATA.pickerList.map(n=>`<option ${row.pickerChecker===n?'selected':''}>${n}</option>`).join('')}</select></td>
          </tr>
        </table>

        <table class="field-table" style="margin-top:4px;">
          <tr>
            <td class="flabel">Keterangan</td>
            <td><textarea id="fPklKeterangan" class="po-textarea" rows="2">${row.keterangan||''}</textarea></td>
          </tr>
        </table>

        <div class="card-header dark-header" style="border-radius:6px;margin:18px 0 14px;">
          <h3>${icon('clipboard',14)} Produk</h3>
          <button type="button" class="chip-btn" id="pklAutoFillQty">Auto Fill Quantity Picking</button>
        </div>

        <div class="table-wrap" style="margin:6px 0 6px;">
          <table class="po-item-table">
            <thead><tr>
              <th>No</th>
              <th>Kode Barang</th>
              <th>Nama Barang</th>
              <th>Satuan</th>
              <th>Qty Order</th>
              <th>Qty Picking</th>
              <th>Batch Number</th>
              <th>Qty Sisa</th>
              <th></th>
            </tr></thead>
            <tbody id="pklItemsBody">${row.items.map((it,idx)=>tplPklItemRow(it,idx,dis)).join('')}</tbody>
          </table>
        </div>
        <a href="#" id="pklAddItem" class="link-add">${icon('plus',13)} Tambah Item Baru</a>

        <div class="form-group" style="margin-top:18px;max-width:640px;">
          <label>Keterangan SO</label>
          <textarea id="fPklKeteranganSO" class="po-textarea" rows="2" disabled>${row.noSOKeterangan||''}</textarea>
        </div>

        <div style="font-size:11.8px;color:var(--text-light);margin-top:6px;line-height:1.7;">
          ${row.tglInput ? `Tgl. Input : ${row.tglInput}  User Entry : ${row.userInput||''}<br>` : ''}
          ${row.tglEdit ? `Tgl Edit : ${row.tglEdit}  User Edit : ${row.userEdit||''}` : ''}
        </div>

        <div class="form-page-actions">
          <a href="#" id="pklBatalkan" class="link-add" style="margin-right:auto;">Batalkan</a>
          <button class="btn-primary" id="pklSimpan">Simpan</button>
        </div>
      </div>
    </div>`;
}

function tplPklDeleteConfirm(row){
  return `
    <div class="modal-box">
      <div class="modal-header"><span>Hapus Picking List</span><span class="close" id="modalClose">&times;</span></div>
      <div class="modal-body"><p>Yakin ingin menghapus Picking List <b>${row.no}</b>?</p></div>
      <div class="modal-footer">
        <button class="btn-secondary" id="modalCancel">Batal</button>
        <button class="btn-danger" id="modalDelete">Hapus</button>
      </div>
    </div>`;
}

function tplPklInfoModal(title,text){
  return `
    <div class="modal-box">
      <div class="modal-header"><span>${title}</span><span class="close" id="modalClose">&times;</span></div>
      <div class="modal-body"><p>${text}</p></div>
      <div class="modal-footer">
        <button class="btn-primary" id="modalOk">Mengerti</button>
      </div>
    </div>`;
}

/* Modal konfirmasi generik dipakai untuk aksi "Checked" (Waiting ->
   Terkirim) & pembatalannya (Terkirim -> Waiting) di list — BUKAN
   alert()/confirm() bawaan browser, konsisten dengan kebijakan mockup
   ini. */
function tplPklConfirmModal(title, text, confirmLabel){
  return `
    <div class="modal-box">
      <div class="modal-header"><span>${title}</span><span class="close" id="modalClose">&times;</span></div>
      <div class="modal-body"><p>${text}</p></div>
      <div class="modal-footer">
        <button class="btn-secondary" id="modalCancel">Batal</button>
        <button class="btn-primary" id="modalConfirm">${confirmLabel}</button>
      </div>
    </div>`;
}

function tplPklSoPicker(list){
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

/* tplPklItemPicker() DIHAPUS sejak 2026-08-12 lanjutan lagi —
   digantikan popup "Daftar Persediaan" bersama
   (openPersediaanPicker()/tplPersediaanPickerModal() di js/core.js),
   dipanggil langsung dari openPklItemPicker() di picking-list.js. */

function tplPklBatchPicker(lots, idx){
  return `
    <div class="modal-box" style="max-width:520px;">
      <div class="modal-header"><span>Pilih Batch</span><span class="close" id="modalClose">&times;</span></div>
      <div class="modal-body">
        <div class="table-wrap" style="max-height:340px;overflow:auto;"><table>
          <thead><tr><th>Kode Batch</th><th>Qty Tersedia</th><th>Tgl. Kadaluarsa</th><th></th></tr></thead>
          <tbody>${lots.length ? lots.map(l=>`<tr><td>${l.kode}</td><td>${num(l.qtyTersedia)}</td><td>${l.tglExpired}</td><td><button class="btn-pick" data-pick-batch="${l.kode}" data-pick-idx="${idx}">Pilih</button></td></tr>`).join('') : `<tr><td colspan="4" style="color:var(--text-light);">Tidak ada batch tersedia untuk barang ini</td></tr>`}</tbody>
        </table></div>
      </div>
      <div class="modal-footer"><button class="btn-secondary" id="modalCancel">Tutup</button></div>
    </div>`;
}

/* Modal "Tambah Picker" — list nama dari DATA.pickerList, nama yang
   sudah ada di `already` (row.picker) ditandai "Sudah dipilih" (bukan
   tombol Pilih lagi) supaya tidak dobel. */
function tplPklPickerAddModal(list, already){
  return `
    <div class="modal-box" style="max-width:420px;">
      <div class="modal-header"><span>Tambah Picker</span><span class="close" id="modalClose">&times;</span></div>
      <div class="modal-body">
        <div class="table-wrap"><table>
          <thead><tr><th>Nama</th><th></th></tr></thead>
          <tbody>${list.map(n=>`<tr><td>${n}</td><td>${already.includes(n)?'<span style="font-size:11px;color:var(--text-light);">Sudah dipilih</span>':`<button class="btn-pick" data-pick-picker="${n}">Pilih</button>`}</td></tr>`).join('')}</tbody>
        </table></div>
      </div>
      <div class="modal-footer"><button class="btn-secondary" id="modalCancel">Tutup</button></div>
    </div>`;
}
