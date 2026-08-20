/* =========================================================
   TEMPLATE (HTML saja) — Jurnal Penjualan (Customer & Penjualan
   > Master & Setting). Semua fungsi di file ini HANYA menyusun
   & mengembalikan markup HTML (string), TIDAK ada logic/DOM-
   binding/data mutation di sini. Logic-nya ada di file sebelah:
   jurnal-penjualan.js

   Sesuai 2 screenshot MASERP yang dikirim user: "Daftar Jurnal
   Penjualan" (list, dengan toggle switch Active?) dan "Jurnal
   Penjualan" (form Ubah, full page — banyak field akun GL, jadi
   ikut pola Jurnal Pembelian: full page bukan modal). Modul ini
   sengaja dibuat semirip mungkin dengan Jurnal Pembelian (reuse
   class CSS .field-table/.jp-akun-table/.jp-section-title/
   .alert-warning/.toggle-switch/.btn-teal apa adanya, TIDAK
   membuat CSS baru) karena strukturnya memang identik — bedanya
   cuma: (1) tidak ada field Cabang & paragraf catatan, (2) hanya
   2 section field akun (bukan 3, tidak ada section Konsinyasi),
   (3) kolom togglenya cuma 1 ("Active?", bukan Konsinyasi?+Non
   Aktif? seperti Jurnal Pembelian).
========================================================= */

/* Daftar semua field akun di form, dikelompokkan sesuai 2 section
   di screenshot. Dipakai bersama oleh template (render baris) dan
   logic (wiring event cari/hapus + validasi/simpan). */
const JJ_AKUN_GROUPS = [
  { title: null, fields: [
    { key:'akunPiutang', label:'Akun Piutang' },
    { key:'akunDiskonPrincipal', label:'Akun Diskon Principal' },
    { key:'akunPersediaanIntransit', label:'Akun Persediaan Intransit' },
    { key:'akunDiskonDistributor', label:'Akun Diskon Distributor' },
    { key:'akunDiskonSelisihHna', label:'Akun Diskon Selisih HNA & HNA1' },
    { key:'akunDiskonVoucher', label:'Akun Diskon Voucher' },
    { key:'akunPPN', label:'Akun PPN' },
    { key:'akunOngkosKirim', label:'Akun Ongkos Kirim' },
    { key:'akunLabaSelisihKurs', label:'Akun Laba Selisih Kurs' },
    { key:'akunRugiSelisihKurs', label:'Akun Rugi Selisih Kurs' },
    { key:'akunSelisihDebitKredit', label:'Akun Selisih Debit Kredit' },
    { key:'akunUangMuka', label:'Akun Uang Muka' },
    { key:'reward', label:'Reward' },
  ]},
  { title: 'Akun Untuk Transaksi Retur', fields: [
    { key:'akunReturKredit', label:'Akun Retur Kredit' },
    { key:'akunReturPajak', label:'Akun Retur Pajak' },
  ]},
  /* Section baru 2026-08-20 — akun default utk PPN/PPH yang ditanggung
     customer (dipungut) saat Pelunasan Piutang. Dipakai NYATA oleh
     modul Penerimaan Piutang (ppBuildJurnalLines() di penerimaan-
     piutang.js membaca DATA.jurnalPenjualan[0].akunARSSPPPN dst, dgn
     fallback ke konstanta lokal kalau kosong) — lihat catatan besar di
     js/pages/penerimaan-piutang.template.js utk penjelasan lengkap &
     contoh jurnal dari user. */
  { title: 'Akun Untuk Pelunasan Piutang (PPN/PPH Ditanggung Customer)', fields: [
    { key:'akunARSSPPPN', label:'Akun AR SSP PPN' },
    { key:'akunARSSPPPH', label:'Akun AR SSP PPH' },
    { key:'akunPPNPemungut', label:'Akun PPn Pemungut' },
    { key:'akunUangMukaPPH22', label:'Akun Uang Muka PPH 22' },
  ]},
];

function jjAkunNama(kode){
  if(!kode) return '';
  const a = DATA.akunGL.find(x=>x.kode===kode);
  return a ? a.nama : '';
}

function tplJurnalPenjualanListPage(){
  return `
    <div class="breadcrumb">Home / <b>Jurnal Penjualan</b></div>
    <div class="card">
      <div class="card-header dark-header">
        <h3>${icon('invoice',15)} Daftar Jurnal Penjualan</h3>
        <div class="toolbar-actions">
          <button class="btn-teal" id="btnJjAddKas">${icon('plus',14)} Jurnal Kas</button>
          <button class="btn-primary" id="btnJjAddKredit">${icon('plus',14)} Jurnal Kredit</button>
          <button class="btn-danger" id="btnJjTutorial">${icon('card',14)} Tutorial</button>
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
          <th>Active?</th>
          <th>Ubah</th>
          <th>Hapus</th>
        </tr></thead>
        <tbody id="jjTbody"></tbody>
      </table></div>
      <div class="table-footer"><div class="pager"><button>First</button><button>Previous</button><button class="active">1</button><button>Next</button><button>Last</button></div><div id="jjTotal"></div></div>
    </div>`;
}

function tplJjRows(rows){
  return rows.map((r,i)=>`
    <tr>
      <td>${r.kode}</td>
      <td>${r.nama}</td>
      <td>${r.mataUang||''}</td>
      <td>
        <label class="toggle-switch">
          <input type="checkbox" data-toggle="active" data-idx="${i}" ${r.active?'checked':''}>
          <span class="toggle-slider"></span>
        </label>
      </td>
      <td><button class="icon-btn edit" data-edit="${i}" title="Ubah">${icon('edit',15)}</button></td>
      <td><button class="icon-btn del" data-del="${i}" title="Hapus">${icon('trash',15)}</button></td>
    </tr>`).join('');
}

function tplJjAkunRow(f, row){
  const kode = row[f.key] || '';
  const nama = jjAkunNama(kode);
  return `
    <tr>
      <td class="jp-label">${f.label}</td>
      <td class="jp-input">
        <div class="input-with-btn">
          <input type="text" id="fJj_${f.key}" value="${kode}" placeholder="Pilih Akun" readonly>
          <button type="button" class="icon-btn edit" data-akun-search="${f.key}" title="Cari Akun">${icon('search',14)}</button>
          <button type="button" class="icon-btn del" data-akun-clear="${f.key}" title="Hapus">${icon('trash',14)}</button>
        </div>
      </td>
      <td class="jp-nama" id="fJjNama_${f.key}">${nama}</td>
    </tr>`;
}

function tplJurnalPenjualanForm(mode, row){
  const isEdit = mode === 'edit';
  return `
    <div class="breadcrumb">Home / Jurnal Penjualan / <b>${isEdit ? 'Ubah' : 'Tambah'}</b></div>
    ${isEdit ? `<div class="alert-warning">Jurnal tidak dapat diubah jika sudah digunakan, harap mengisi akun jurnal yang dibutuhkan</div>` : ''}
    <div class="card">
      <div class="card-header dark-header"><h3>${icon('plus',15)} Jurnal Penjualan</h3></div>
      <div class="card-body">
        <table class="field-table">
          <tr>
            <td class="flabel">Nama Jurnal</td>
            <td><input type="text" id="fJjNama" value="${row.nama||''}" placeholder="Contoh: JURNAL PENJUALAN TUNAI (IDR)"></td>
            <td class="flabel">Mata Uang</td>
            <td><input type="text" value="${row.mataUang||''}" placeholder="Mata Uang" disabled></td>
          </tr>
        </table>

        <table class="jp-akun-table">
          ${JJ_AKUN_GROUPS[0].fields.map(f=>tplJjAkunRow(f,row)).join('')}
        </table>

        <div class="jp-section-title">${JJ_AKUN_GROUPS[1].title}</div>
        <table class="jp-akun-table">
          ${JJ_AKUN_GROUPS[1].fields.map(f=>tplJjAkunRow(f,row)).join('')}
        </table>

        <div class="jp-section-title">${JJ_AKUN_GROUPS[2].title}</div>
        <table class="jp-akun-table">
          ${JJ_AKUN_GROUPS[2].fields.map(f=>tplJjAkunRow(f,row)).join('')}
        </table>

        <div class="form-page-actions">
          <a href="#" id="jjBatalkan" class="link-add" style="margin-right:auto;">Batalkan</a>
          <button class="btn-primary" id="jjDuplikat" style="background:#5a86cf;">Duplikat</button>
          <button class="btn-primary" id="jjSimpan">Simpan</button>
        </div>
      </div>
    </div>`;
}

function tplJjAkunPicker(list, fieldKey){
  return `
    <div class="modal-box" style="max-width:640px;">
      <div class="modal-header"><span>Pilih Akun GL</span><span class="close" id="modalClose">&times;</span></div>
      <div class="modal-body">
        <input type="text" id="jjAkunPickerSearch" placeholder="Cari kode / nama akun..." style="width:100%;border:1px solid var(--border);border-radius:6px;padding:8px 10px;font-size:12.8px;margin-bottom:12px;">
        <div class="table-wrap" style="max-height:360px;overflow:auto;">
          <table>
            <thead><tr><th>Kode</th><th>Nama Akun</th><th>Kat.</th><th></th></tr></thead>
            <tbody id="jjAkunPickerBody">${tplJjAkunPickerRows(list, fieldKey)}</tbody>
          </table>
        </div>
      </div>
      <div class="modal-footer">
        <button class="btn-secondary" id="modalCancel">Tutup</button>
      </div>
    </div>`;
}

function tplJjAkunPickerRows(list, fieldKey){
  if(!list.length) return `<tr><td colspan="4" style="color:var(--text-light);">Tidak ada akun ditemukan</td></tr>`;
  return list.map(a=>`
    <tr>
      <td>${a.kode}</td>
      <td>${a.nama}</td>
      <td>${a.kategori}</td>
      <td><button class="btn-pick" data-pick-akun="${a.kode}" data-pick-field="${fieldKey}">Pilih</button></td>
    </tr>`).join('');
}

function tplJjDeleteConfirm(row){
  return `
    <div class="modal-box">
      <div class="modal-header"><span>Hapus Jurnal Penjualan</span><span class="close" id="modalClose">&times;</span></div>
      <div class="modal-body"><p>Yakin ingin menghapus jurnal <b>${row.nama}</b>?</p></div>
      <div class="modal-footer">
        <button class="btn-secondary" id="modalCancel">Batal</button>
        <button class="btn-danger" id="modalDelete">Hapus</button>
      </div>
    </div>`;
}

function tplJjInfoModal(title,text){
  return `
    <div class="modal-box">
      <div class="modal-header"><span>${title}</span><span class="close" id="modalClose">&times;</span></div>
      <div class="modal-body"><p>${text}</p></div>
      <div class="modal-footer">
        <button class="btn-primary" id="modalOk">Mengerti</button>
      </div>
    </div>`;
}
