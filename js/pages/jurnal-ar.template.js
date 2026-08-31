/* =========================================================
   TEMPLATE (HTML saja) — Jurnal A.R. (Customer & Penjualan >
   Master & Setting). Semua fungsi di file ini HANYA menyusun
   & mengembalikan markup HTML (string), TIDAK ada logic/DOM-
   binding/data mutation di sini. Logic-nya ada di file sebelah:
   jurnal-ar.js

   Sesuai 2 screenshot MASERP yang dikirim user: "Daftar Jurnal
   A.R." (list: Kode Jurnal link biru yang membuka form Ubah,
   Nama Jurnal, Ubah/Hapus, tombol +Tambah, 7 baris sample) dan
   form "Jurnal A.R." (full page: Nama Jurnal + checkbox "Jurnal
   Ar SSP?" + 3 baris akun — Akun Debit, Akun Kredit, Akun PPN:
   (Khusus Saldo Awal U.M.) — masing-masing input readonly +
   tombol cari + tombol hapus, nama akun tampil di kolom kanan;
   tombol Tutorial merah; footer Simpan + Batalkan). Ini KEMBARAN
   modul Jurnal A.P. (jurnal-ap.*) untuk sisi piutang — bedanya
   cuma 1 field ekstra: checkbox "Jurnal Ar SSP?" (menandai jurnal
   yang dipakai transaksi Penerimaan SSP — nyambung dgn modul
   Transaksi A.R. SSP yang sudah ada). Kode akun screenshot
   (210701 PPN Keluaran / 110501 Piutang Usaha IDR, skema
   instalasi lain) dipetakan ke chart of account 7-digit DBM.
========================================================= */

/* Daftar field akun di form Jurnal A.R. — dipakai bersama oleh
   template (render baris) dan logic (wiring event cari/hapus). */
const JAR_AKUN_FIELDS = [
  { key:'akunDebit', label:'Akun Debit' },
  { key:'akunKredit', label:'Akun Kredit' },
  { key:'akunPPN', label:'Akun PPN: (Khusus Saldo Awal U.M.)' },
];

function jarAkunNama(kode){
  if(!kode) return '';
  const a = DATA.akunGL.find(x=>x.kode===kode);
  return a ? a.nama : '';
}

function tplJurnalARListPage(){
  return `
    <div class="breadcrumb">Home / <b>Jurnal A.R.</b></div>
    <div class="card">
      <div class="card-header dark-header"><h3>${icon('alertTriangle',15)} Daftar Jurnal A.R.</h3><button class="btn-primary" id="btnAddJar">${icon('plus',14)} Tambah</button></div>
      <div class="table-toolbar">
        <select><option selected>10</option><option>25</option><option>50</option></select>
        <input type="text" placeholder="Pencarian Global">
      </div>
      <div class="table-wrap"><table>
        <thead><tr><th>Kode Jurnal</th><th>Nama Jurnal</th><th>Ubah</th><th>Hapus</th></tr></thead>
        <tbody id="jarTbody"></tbody>
      </table></div>
      <div class="table-footer"><div class="pager"><button>First</button><button>Previous</button><button class="active">1</button><button>Next</button><button>Last</button></div><div id="jarTotal"></div></div>
    </div>`;
}

function tplJarRows(rows){
  if(!rows.length) return `<tr><td colspan="4" style="color:var(--text-light);">Belum ada jurnal A.R.</td></tr>`;
  return rows.map((r,i)=>`
    <tr>
      <td><button class="link-pick" data-edit-link="${i}">${r.kode}</button></td>
      <td>${r.nama}</td>
      <td><button class="icon-btn edit" data-edit="${i}" title="Ubah">${icon('edit',15)}</button></td>
      <td><button class="icon-btn del" data-del="${i}" title="Hapus">${icon('trash',15)}</button></td>
    </tr>`).join('');
}

function tplJarAkunRow(f, row){
  const kode = row[f.key] || '';
  const nama = jarAkunNama(kode);
  return `
    <tr>
      <td class="jp-label">${f.label}</td>
      <td class="jp-input">
        <div class="input-with-btn">
          <input type="text" id="fJar_${f.key}" value="${kode}" placeholder="Pilih Akun" readonly>
          <button type="button" class="icon-btn edit" data-akun-search="${f.key}" title="Cari Akun">${icon('search',14)}</button>
          <button type="button" class="icon-btn del" data-akun-clear="${f.key}" title="Hapus">${icon('trash',14)}</button>
        </div>
      </td>
      <td class="jp-nama" id="fJarNama_${f.key}">${nama}</td>
    </tr>`;
}

function tplJurnalARForm(mode, row){
  const isEdit = mode === 'edit';
  return `
    <div class="breadcrumb">Home / Jurnal A.R. / <b>${isEdit ? 'Ubah' : 'Tambah'}</b></div>
    <div class="card">
      <div class="card-header dark-header">
        <h3>${icon('plus',15)} Jurnal A.R.</h3>
        <button class="btn-danger" id="btnJarTutorial">${icon('card',14)} Tutorial</button>
      </div>
      <div class="card-body">
        <table class="field-table">
          <tr>
            <td class="flabel">Nama Jurnal</td>
            <td><input type="text" id="fJarNama" value="${row.nama||''}" placeholder="Contoh: PENERIMAAN SSP PPN" style="max-width:420px;"></td>
          </tr>
          <tr>
            <td class="flabel">Jurnal Ar SSP?</td>
            <td><input type="checkbox" id="fJarArSsp" ${row.arSsp?'checked':''}></td>
          </tr>
        </table>
        <table class="jp-akun-table">
          ${JAR_AKUN_FIELDS.map(f=>tplJarAkunRow(f,row)).join('')}
        </table>
        <div class="form-page-actions">
          <button class="btn-primary" id="jarSimpan">Simpan</button>
          <a href="#" id="jarBatalkan" class="link-add" style="margin-top:0;">Batalkan</a>
        </div>
      </div>
    </div>`;
}

function tplJarAkunPicker(list, fieldKey){
  return `
    <div class="modal-box" style="max-width:640px;">
      <div class="modal-header"><span>Pilih Akun GL</span><span class="close" id="modalClose">&times;</span></div>
      <div class="modal-body">
        <input type="text" id="jarAkunPickerSearch" placeholder="Cari kode / nama akun..." style="width:100%;border:1px solid var(--border);border-radius:6px;padding:8px 10px;font-size:12.8px;margin-bottom:12px;">
        <div class="table-wrap" style="max-height:360px;overflow:auto;">
          <table>
            <thead><tr><th>Kode</th><th>Nama Akun</th><th>Kat.</th><th></th></tr></thead>
            <tbody id="jarAkunPickerBody">${tplJarAkunPickerRows(list, fieldKey)}</tbody>
          </table>
        </div>
      </div>
      <div class="modal-footer">
        <button class="btn-secondary" id="modalCancel">Tutup</button>
      </div>
    </div>`;
}

function tplJarAkunPickerRows(list, fieldKey){
  if(!list.length) return `<tr><td colspan="4" style="color:var(--text-light);">Tidak ada akun ditemukan</td></tr>`;
  return list.map(a=>`
    <tr>
      <td>${a.kode}</td>
      <td>${a.nama}</td>
      <td>${a.kategori}</td>
      <td><button class="btn-pick" data-pick-akun="${a.kode}" data-pick-field="${fieldKey}">Pilih</button></td>
    </tr>`).join('');
}

function tplJarDeleteConfirm(row){
  return `
    <div class="modal-box">
      <div class="modal-header"><span>Hapus Jurnal A.R.</span><span class="close" id="modalClose">&times;</span></div>
      <div class="modal-body"><p>Yakin ingin menghapus jurnal A.R. <b>${row.kode}</b> — ${row.nama}?</p></div>
      <div class="modal-footer">
        <button class="btn-secondary" id="modalCancel">Batal</button>
        <button class="btn-danger" id="modalDelete">Hapus</button>
      </div>
    </div>`;
}

function tplJarInfoModal(title,text){
  return `
    <div class="modal-box">
      <div class="modal-header"><span>${title}</span><span class="close" id="modalClose">&times;</span></div>
      <div class="modal-body"><p>${text}</p></div>
      <div class="modal-footer">
        <button class="btn-primary" id="modalOk">Mengerti</button>
      </div>
    </div>`;
}
