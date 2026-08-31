/* =========================================================
   TEMPLATE (HTML saja) — Jurnal A.P. (Supplier & Pembelian >
   Master & Setting). Semua fungsi di file ini HANYA menyusun
   & mengembalikan markup HTML (string), TIDAK ada logic/DOM-
   binding/data mutation di sini. Logic-nya ada di file sebelah:
   jurnal-ap.js

   Sesuai 2 screenshot MASERP yang dikirim user: "Daftar Jurnal
   A.P." (list: Kode Jurnal sebagai link biru yang membuka form
   Ubah, Nama Jurnal, Ubah/Hapus, tombol +Tambah) dan form
   "Jurnal AP" (full page: Nama Jurnal + 3 baris akun — Akun
   Debit, Akun Kredit, Akun PPN(Khusus Saldo U.M.) — masing-
   masing input readonly + tombol cari kaca pembesar + tombol
   hapus, nama akun tampil di kolom kanannya; tombol Tutorial
   merah di header; footer Simpan + Batalkan). Pola & styling
   baris akun (jp-akun-table/jp-label/jp-input/jp-nama) reuse
   persis dari modul Jurnal Pembelian, hanya field-nya jauh
   lebih sedikit (3 akun vs 21). Picker akun me-list DATA.akunGL.
   Kode akun di data sample dipetakan ke chart of account 7-digit
   DBM di DATA.akunGL (screenshot memakai skema kode instalasi
   lain: 101110012 Bank BCA OPS / 620010420 Pph 23).
========================================================= */

/* Daftar field akun di form Jurnal A.P. — dipakai bersama oleh
   template (render baris) dan logic (wiring event cari/hapus). */
const JAP_AKUN_FIELDS = [
  { key:'akunDebit', label:'Akun Debit' },
  { key:'akunKredit', label:'Akun Kredit' },
  { key:'akunPPN', label:'Akun PPN(Khusus Saldo U.M.)' },
];

function japAkunNama(kode){
  if(!kode) return '';
  const a = DATA.akunGL.find(x=>x.kode===kode);
  return a ? a.nama : '';
}

function tplJurnalAPListPage(){
  return `
    <div class="breadcrumb">Home / <b>Jurnal A.P.</b></div>
    <div class="card">
      <div class="card-header dark-header"><h3>${icon('alertTriangle',15)} Daftar Jurnal A.P.</h3><button class="btn-primary" id="btnAddJap">${icon('plus',14)} Tambah</button></div>
      <div class="table-toolbar">
        <select><option selected>10</option><option>25</option><option>50</option></select>
        <input type="text" placeholder="Pencarian Global">
      </div>
      <div class="table-wrap"><table>
        <thead><tr><th>Kode Jurnal</th><th>Nama Jurnal</th><th>Ubah</th><th>Hapus</th></tr></thead>
        <tbody id="japTbody"></tbody>
      </table></div>
      <div class="table-footer"><div class="pager"><button>First</button><button>Previous</button><button class="active">1</button><button>Next</button><button>Last</button></div><div id="japTotal"></div></div>
    </div>`;
}

function tplJapRows(rows){
  if(!rows.length) return `<tr><td colspan="4" style="color:var(--text-light);">Belum ada jurnal A.P.</td></tr>`;
  return rows.map((r,i)=>`
    <tr>
      <td><button class="link-pick" data-edit-link="${i}">${r.kode}</button></td>
      <td>${r.nama}</td>
      <td><button class="icon-btn edit" data-edit="${i}" title="Ubah">${icon('edit',15)}</button></td>
      <td><button class="icon-btn del" data-del="${i}" title="Hapus">${icon('trash',15)}</button></td>
    </tr>`).join('');
}

function tplJapAkunRow(f, row){
  const kode = row[f.key] || '';
  const nama = japAkunNama(kode);
  return `
    <tr>
      <td class="jp-label">${f.label}</td>
      <td class="jp-input">
        <div class="input-with-btn">
          <input type="text" id="fJap_${f.key}" value="${kode}" placeholder="Pilih Akun" readonly>
          <button type="button" class="icon-btn edit" data-akun-search="${f.key}" title="Cari Akun">${icon('search',14)}</button>
          <button type="button" class="icon-btn del" data-akun-clear="${f.key}" title="Hapus">${icon('trash',14)}</button>
        </div>
      </td>
      <td class="jp-nama" id="fJapNama_${f.key}">${nama}</td>
    </tr>`;
}

function tplJurnalAPForm(mode, row){
  const isEdit = mode === 'edit';
  return `
    <div class="breadcrumb">Home / Jurnal A.P. / <b>${isEdit ? 'Ubah' : 'Tambah'}</b></div>
    <div class="card">
      <div class="card-header dark-header">
        <h3>${icon('plus',15)} Jurnal AP</h3>
        <button class="btn-danger" id="btnJapTutorial">${icon('card',14)} Tutorial</button>
      </div>
      <div class="card-body">
        <table class="field-table">
          <tr>
            <td class="flabel">Nama Jurnal</td>
            <td><input type="text" id="fJapNama" value="${row.nama||''}" placeholder="Contoh: Pph 23"></td>
          </tr>
        </table>
        <table class="jp-akun-table">
          ${JAP_AKUN_FIELDS.map(f=>tplJapAkunRow(f,row)).join('')}
        </table>
        <div class="form-page-actions">
          <button class="btn-primary" id="japSimpan">Simpan</button>
          <a href="#" id="japBatalkan" class="link-add" style="margin-top:0;">Batalkan</a>
        </div>
      </div>
    </div>`;
}

function tplJapAkunPicker(list, fieldKey){
  return `
    <div class="modal-box" style="max-width:640px;">
      <div class="modal-header"><span>Pilih Akun GL</span><span class="close" id="modalClose">&times;</span></div>
      <div class="modal-body">
        <input type="text" id="japAkunPickerSearch" placeholder="Cari kode / nama akun..." style="width:100%;border:1px solid var(--border);border-radius:6px;padding:8px 10px;font-size:12.8px;margin-bottom:12px;">
        <div class="table-wrap" style="max-height:360px;overflow:auto;">
          <table>
            <thead><tr><th>Kode</th><th>Nama Akun</th><th>Kat.</th><th></th></tr></thead>
            <tbody id="japAkunPickerBody">${tplJapAkunPickerRows(list, fieldKey)}</tbody>
          </table>
        </div>
      </div>
      <div class="modal-footer">
        <button class="btn-secondary" id="modalCancel">Tutup</button>
      </div>
    </div>`;
}

function tplJapAkunPickerRows(list, fieldKey){
  if(!list.length) return `<tr><td colspan="4" style="color:var(--text-light);">Tidak ada akun ditemukan</td></tr>`;
  return list.map(a=>`
    <tr>
      <td>${a.kode}</td>
      <td>${a.nama}</td>
      <td>${a.kategori}</td>
      <td><button class="btn-pick" data-pick-akun="${a.kode}" data-pick-field="${fieldKey}">Pilih</button></td>
    </tr>`).join('');
}

function tplJapDeleteConfirm(row){
  return `
    <div class="modal-box">
      <div class="modal-header"><span>Hapus Jurnal A.P.</span><span class="close" id="modalClose">&times;</span></div>
      <div class="modal-body"><p>Yakin ingin menghapus jurnal A.P. <b>${row.kode}</b> — ${row.nama}?</p></div>
      <div class="modal-footer">
        <button class="btn-secondary" id="modalCancel">Batal</button>
        <button class="btn-danger" id="modalDelete">Hapus</button>
      </div>
    </div>`;
}

function tplJapInfoModal(title,text){
  return `
    <div class="modal-box">
      <div class="modal-header"><span>${title}</span><span class="close" id="modalClose">&times;</span></div>
      <div class="modal-body"><p>${text}</p></div>
      <div class="modal-footer">
        <button class="btn-primary" id="modalOk">Mengerti</button>
      </div>
    </div>`;
}
