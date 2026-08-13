/* =========================================================
   TEMPLATE (HTML saja) — Jurnal Pembelian (Supplier & Pembelian
   > Master & Setting). Semua fungsi di file ini HANYA menyusun
   & mengembalikan markup HTML (string), TIDAK ada logic/DOM-
   binding/data mutation di sini. Logic-nya ada di file sebelah:
   jurnal-pembelian.js

   Sesuai 2 screenshot MASERP yang dikirim user: "Daftar Jurnal
   Pembelian" (list, dengan toggle switch Konsinyasi?/Non Aktif?)
   dan "Jurnal Pembelian" (form Tambah/Ubah, full page — banyak
   field akun GL, jadi ikut pola Master Supplier: full page bukan
   modal). Tiap field akun (Akun Utang, Akun PPN, dst) adalah
   input readonly + tombol cari (kaca pembesar) yang membuka
   modal picker dari DATA.akunGL — sama pola dengan "Akun GL Utang"
   di form Master Supplier, hanya sekarang picker-nya sungguhan
   (dulu masih dekoratif karena modul Akun GL belum ada).
========================================================= */

/* Daftar semua field akun di form, dikelompokkan sesuai 3 section
   di screenshot. Dipakai bersama oleh template (render baris) dan
   logic (wiring event cari/hapus + validasi/simpan). */
const JP_AKUN_GROUPS = [
  { title: null, fields: [
    { key:'akunUtang', label:'Akun Utang' },
    { key:'akunKreditSementara', label:'Akun Kredit Sementara' },
    { key:'akunBudgetDiskon', label:'Akun Budget Diskon' },
    { key:'akunPPN', label:'Akun PPN' },
    { key:'akunOngkosKirim', label:'Akun Ongkos Kirim' },
    { key:'akunLabaSelisihKurs', label:'Akun Laba Selisih Kurs' },
    { key:'akunRugiSelisihKurs', label:'Akun Rugi Selisih Kurs' },
    { key:'akunSelisihDebitKredit', label:'Akun Selisih Debit Kredit' },
    { key:'akunUangMuka', label:'Akun Uang Muka' },
  ]},
  { title: 'Akun Untuk Transaksi Retur', fields: [
    { key:'akunReturUtang', label:'Akun Retur Utang' },
    { key:'akunReturPajak', label:'Akun Retur Pajak' },
  ]},
  { title: 'Akun Untuk Transaksi Generate Konsinyasi', fields: [
    { key:'akunHppKonsinyasi', label:'Akun HPP Konsinyasi' },
    { key:'akunBiayaPemakaian', label:'Akun Biaya Pemakaian' },
    { key:'akunDiskonPrincipal', label:'Akun Diskon Principal' },
    { key:'akunHutangRK', label:'Akun Hutang R/K' },
    { key:'akunPiutangRK', label:'Akun Piutang R/K' },
    { key:'akunHutangBelumDifaktur', label:'Akun Hutang Belum Difaktur' },
  ]},
];
const JP_CABANG_LIST = ['Head Office','Surabaya','Bandung','Medan','Makassar','Semarang','Tangerang','Sidoarjo'];

function jpAkunNama(kode){
  if(!kode) return '';
  const a = DATA.akunGL.find(x=>x.kode===kode);
  return a ? a.nama : '';
}

function tplJurnalPembelianListPage(){
  return `
    <div class="breadcrumb">Home / <b>Jurnal Pembelian</b></div>
    <div class="card">
      <div class="card-header dark-header">
        <h3>${icon('file',15)} Daftar Jurnal Pembelian</h3>
        <div class="toolbar-actions">
          <button class="btn-teal" id="btnJpAddKas">${icon('plus',14)} Jurnal Kas</button>
          <button class="btn-primary" id="btnJpAddKredit">${icon('plus',14)} Jurnal Kredit</button>
          <button class="btn-danger" id="btnJpTutorial">${icon('card',14)} Tutorial</button>
        </div>
      </div>
      <div class="table-toolbar">
        <select><option selected>10</option><option>25</option><option>50</option></select>
        <input type="text" placeholder="Pencarian Global">
      </div>
      <div class="table-wrap"><table>
        <thead><tr>
          <th>Kode Jurnal</th>
          <th>Nama Jurnal</th>
          <th>Mata Uang</th>
          <th>Konsinyasi ?</th>
          <th>Non Aktif ?</th>
          <th>Ubah</th>
          <th>Hapus</th>
        </tr></thead>
        <tbody id="jpTbody"></tbody>
      </table></div>
      <div class="table-footer"><div class="pager"><button>First</button><button>Previous</button><button class="active">1</button><button>Next</button><button>Last</button></div><div id="jpTotal"></div></div>
    </div>`;
}

function tplJpRows(rows){
  return rows.map((r,i)=>`
    <tr>
      <td>${r.kode}</td>
      <td>${r.nama}</td>
      <td>${r.mataUang||''}</td>
      <td>
        <label class="toggle-switch">
          <input type="checkbox" data-toggle="konsinyasi" data-idx="${i}" ${r.konsinyasi?'checked':''}>
          <span class="toggle-slider"></span>
        </label>
      </td>
      <td>
        <label class="toggle-switch">
          <input type="checkbox" data-toggle="nonAktif" data-idx="${i}" ${r.nonAktif?'checked':''}>
          <span class="toggle-slider"></span>
        </label>
      </td>
      <td><button class="icon-btn edit" data-edit="${i}" title="Ubah">${icon('edit',15)}</button></td>
      <td><button class="icon-btn del" data-del="${i}" title="Hapus">${icon('trash',15)}</button></td>
    </tr>`).join('');
}

function tplJpAkunRow(f, row){
  const kode = row[f.key] || '';
  const nama = jpAkunNama(kode);
  return `
    <tr>
      <td class="jp-label">${f.label}</td>
      <td class="jp-input">
        <div class="input-with-btn">
          <input type="text" id="fJp_${f.key}" value="${kode}" placeholder="Pilih Akun" readonly>
          <button type="button" class="icon-btn edit" data-akun-search="${f.key}" title="Cari Akun">${icon('search',14)}</button>
          <button type="button" class="icon-btn del" data-akun-clear="${f.key}" title="Hapus">${icon('trash',14)}</button>
        </div>
      </td>
      <td class="jp-nama" id="fJpNama_${f.key}">${nama}</td>
    </tr>`;
}

function tplJurnalPembelianForm(mode, row){
  const isEdit = mode === 'edit';
  return `
    <div class="breadcrumb">Home / Jurnal Pembelian / <b>${isEdit ? 'Ubah' : 'Tambah'}</b></div>
    ${isEdit ? `<div class="alert-warning">Jurnal tidak dapat diubah jika sudah digunakan, harap mengisi akun jurnal yang dibutuhkan</div>` : ''}
    <div class="card">
      <div class="card-header dark-header"><h3>${icon('plus',15)} Jurnal Pembelian</h3></div>
      <div class="card-body">
        <table class="field-table">
          <tr>
            <td class="flabel">Nama Jurnal</td>
            <td><input type="text" id="fJpNama" value="${row.nama||''}" placeholder="Contoh: JURNAL PEMBELIAN TUNAI (IDR)"></td>
            <td class="flabel">Mata Uang</td>
            <td><input type="text" value="${row.mataUang||''}" placeholder="Kode mata uang mengikuti akun kas/bank (VALAS)" disabled></td>
          </tr>
          <tr>
            <td class="flabel">Cabang</td>
            <td colspan="3">
              <select id="fJpCabang">${JP_CABANG_LIST.map(c=>`<option ${row.cabang===c?'selected':''}>${c}</option>`).join('')}</select>
            </td>
          </tr>
        </table>

        <p style="font-size:12.8px;color:var(--text-light);margin-bottom:16px;">Catatan: Akun Kas IDR digunakan pada saat pembayaran utang. Supplier/Anda minta untuk dibayar dengan Rupiah saja, akan diambil dari akun GL Rupiah itu.</p>

        <table class="jp-akun-table">
          ${JP_AKUN_GROUPS[0].fields.map(f=>tplJpAkunRow(f,row)).join('')}
        </table>

        <div class="jp-section-title">${JP_AKUN_GROUPS[1].title}</div>
        <table class="jp-akun-table">
          ${JP_AKUN_GROUPS[1].fields.map(f=>tplJpAkunRow(f,row)).join('')}
        </table>

        <div class="jp-section-title">${JP_AKUN_GROUPS[2].title}</div>
        <table class="jp-akun-table">
          ${JP_AKUN_GROUPS[2].fields.map(f=>tplJpAkunRow(f,row)).join('')}
        </table>

        <div class="form-page-actions">
          <a href="#" id="jpBatalkan" class="link-add" style="margin-right:auto;">Batalkan</a>
          <button class="btn-primary" id="jpDuplikat" style="background:#5a86cf;">Duplikat</button>
          <button class="btn-primary" id="jpSimpan">Simpan</button>
        </div>
      </div>
    </div>`;
}

function tplJpAkunPicker(list, fieldKey){
  return `
    <div class="modal-box" style="max-width:640px;">
      <div class="modal-header"><span>Pilih Akun GL</span><span class="close" id="modalClose">&times;</span></div>
      <div class="modal-body">
        <input type="text" id="jpAkunPickerSearch" placeholder="Cari kode / nama akun..." style="width:100%;border:1px solid var(--border);border-radius:6px;padding:8px 10px;font-size:12.8px;margin-bottom:12px;">
        <div class="table-wrap" style="max-height:360px;overflow:auto;">
          <table>
            <thead><tr><th>Kode</th><th>Nama Akun</th><th>Kat.</th><th></th></tr></thead>
            <tbody id="jpAkunPickerBody">${tplJpAkunPickerRows(list, fieldKey)}</tbody>
          </table>
        </div>
      </div>
      <div class="modal-footer">
        <button class="btn-secondary" id="modalCancel">Tutup</button>
      </div>
    </div>`;
}

function tplJpAkunPickerRows(list, fieldKey){
  if(!list.length) return `<tr><td colspan="4" style="color:var(--text-light);">Tidak ada akun ditemukan</td></tr>`;
  return list.map(a=>`
    <tr>
      <td>${a.kode}</td>
      <td>${a.nama}</td>
      <td>${a.kategori}</td>
      <td><button class="btn-pick" data-pick-akun="${a.kode}" data-pick-field="${fieldKey}">Pilih</button></td>
    </tr>`).join('');
}

function tplJpDeleteConfirm(row){
  return `
    <div class="modal-box">
      <div class="modal-header"><span>Hapus Jurnal Pembelian</span><span class="close" id="modalClose">&times;</span></div>
      <div class="modal-body"><p>Yakin ingin menghapus jurnal <b>${row.nama}</b>?</p></div>
      <div class="modal-footer">
        <button class="btn-secondary" id="modalCancel">Batal</button>
        <button class="btn-danger" id="modalDelete">Hapus</button>
      </div>
    </div>`;
}

function tplJpInfoModal(title,text){
  return `
    <div class="modal-box">
      <div class="modal-header"><span>${title}</span><span class="close" id="modalClose">&times;</span></div>
      <div class="modal-body"><p>${text}</p></div>
      <div class="modal-footer">
        <button class="btn-primary" id="modalOk">Mengerti</button>
      </div>
    </div>`;
}
