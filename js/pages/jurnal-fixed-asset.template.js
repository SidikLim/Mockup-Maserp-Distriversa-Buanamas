/* =========================================================
   TEMPLATE (HTML saja) — Daftar Jurnal Fixed Asset (Aktiva
   Tetap > Master & Setting > Jurnal Aktiva Tetap, page:
   'jurnalFixedAsset'). Semua fungsi di file ini HANYA menyusun
   & mengembalikan markup HTML (string), TIDAK ada logic/DOM-
   binding di sini. Logic-nya ada di file sebelah:
   jurnal-fixed-asset.js. NB: closeModal() dipakai bersama,
   didefinisikan di core.js.

   Sebelumnya tidak ada menunya sama sekali. Dibangun 2026-08-26
   sesuai screenshot MASERP "Daftar Jurnal Fixed Asset" (toolbar
   6 tombol +Jurnal Saldo Awal/+Jurnal Pembelian/+Jurnal Penjualan/
   +Jurnal Biaya/+Jurnal Disposal/+Jurnal Revaluasi, kolom Kode
   Jurnal/Keterangan Jurnal/Edit/Delete). 13 baris PERSIS
   screenshot (lihat komentar besar di atas DATA.jurnalFixedAsset
   di js/data.js utk detail kode yang lompat 1-4 lalu 9-17).

   Screenshot HANYA menunjukkan list (tidak ada screenshot form
   Tambah/Ubah) — modal Tambah/Ubah di bawah ini disusun sendiri
   (asumsi desain, didokumentasikan): Golongan Aktiva (select dari
   daftar nama golongan yang sudah dipakai baris existing + Bangunan/
   Software/Mesin Peralatan Gudang), Keterangan (auto-tersusun
   "Jurnal {Golongan} ({Tipe})" tapi tetap bisa diedit manual), 2
   picker Kode G.L. Debit/Kredit ke DATA.akunGL (SALINAN LOKAL pola
   tplJpAkunPicker() Jurnal Pembelian). Tipe mengikuti tombol toolbar
   mana yang diklik (readonly, ditampilkan sbg badge di header modal). */

const JFA_GOLONGAN_LIST = ['Gedung','Perabotan Kantor','Mesin Peralatan','Kendaraan Bermotor','Kendaraan','Peralatan IT','Peralatan Kantor','Bangunan','Software'];

function tplJfaPage(){
  return `
    <div class="breadcrumb">Home / <b>Daftar Jurnal Fixed Asset</b></div>
    <div class="card">
      <div class="card-header dark-header">
        <h3>${icon('book',15)} Daftar Jurnal Fixed Asset</h3>
        <div class="toolbar-actions">
          <button class="btn-outline" data-jfa-tipe="Saldo Awal">${icon('plus',13)} Jurnal Saldo Awal</button>
          <button class="btn-outline" data-jfa-tipe="Pembelian Kredit">${icon('plus',13)} Jurnal Pembelian</button>
          <button class="btn-outline" data-jfa-tipe="Penjualan">${icon('plus',13)} Jurnal Penjualan</button>
          <button class="btn-outline" data-jfa-tipe="Biaya">${icon('plus',13)} Jurnal Biaya</button>
          <button class="btn-outline" data-jfa-tipe="Disposal">${icon('plus',13)} Jurnal Disposal</button>
          <button class="btn-outline" data-jfa-tipe="Revaluasi">${icon('plus',13)} Jurnal Revaluasi</button>
        </div>
      </div>
      <div class="table-toolbar">
        <select id="jfaPageSize"><option>10</option><option selected>20</option><option>50</option></select>
        <input type="text" id="jfaSearch" placeholder="Global Search">
      </div>
      <div class="table-wrap"><table>
        <thead><tr><th>Kode Jurnal</th><th>Keterangan Jurnal</th><th style="width:70px;">Edit</th><th style="width:70px;">Delete</th></tr></thead>
        <tbody id="jfaTbody"></tbody>
      </table></div>
      <div class="table-footer"><div class="pager"><button>First</button><button>Previous</button><button class="active">1</button><button>Next</button><button>Last</button></div><div id="jfaTotal"></div></div>
    </div>`;
}

function tplJfaRows(rows){
  if(!rows.length) return `<tr><td colspan="4" style="color:var(--text-light);text-align:center;">Tidak Ada Data</td></tr>`;
  return rows.map((r) => {
    const idx = DATA.jurnalFixedAsset.indexOf(r);
    return `
    <tr>
      <td>${r.kode}</td>
      <td>${r.keterangan}</td>
      <td><button class="icon-btn edit" data-edit="${idx}" title="Edit">${icon('edit',15)}</button></td>
      <td><button class="icon-btn del" data-del="${idx}" title="Delete">${icon('trash',15)}</button></td>
    </tr>`;
  }).join('');
}

function tplJfaModal(mode, row, tipe){
  const isEdit = mode === 'edit';
  return `
    <div class="modal-box" style="max-width:560px;">
      <div class="modal-header"><span>${isEdit?'Ubah':'Tambah'} Jurnal Fixed Asset <span class="chip" style="margin-left:8px;">${tipe}</span></span><span class="close" id="modalClose">&times;</span></div>
      <div class="modal-body">
        <div class="form-group">
          <label>Golongan Aktiva</label>
          <select id="fJfaGolongan">${JFA_GOLONGAN_LIST.map(g=>`<option ${row.golongan===g?'selected':''}>${g}</option>`).join('')}</select>
        </div>
        <div class="form-group">
          <label>Keterangan Jurnal</label>
          <input type="text" id="fJfaKeterangan" value="${row.keterangan||''}">
          <div class="form-error" id="fJfaKeteranganErr">Keterangan Jurnal wajib diisi</div>
        </div>
        <div class="form-group">
          <label>Kode G.L. Debit</label>
          <div class="input-with-btn">
            <input type="text" id="fJfaGlDebit" value="${row.glDebit?row.glDebit+' - '+(jfaAkunNamaOf(row.glDebit)||''):''}" readonly placeholder="Cari akun...">
            <button class="icon-btn edit" id="fJfaGlDebitBtn" title="Cari Akun">${icon('search',14)}</button>
          </div>
        </div>
        <div class="form-group">
          <label>Kode G.L. Kredit</label>
          <div class="input-with-btn">
            <input type="text" id="fJfaGlKredit" value="${row.glKredit?row.glKredit+' - '+(jfaAkunNamaOf(row.glKredit)||''):''}" readonly placeholder="Cari akun...">
            <button class="icon-btn edit" id="fJfaGlKreditBtn" title="Cari Akun">${icon('search',14)}</button>
          </div>
        </div>
      </div>
      <div class="modal-footer">
        <button class="btn-secondary" id="modalCancel">Batal</button>
        <button class="btn-primary" id="modalSave">Simpan</button>
      </div>
    </div>`;
}

function tplJfaDeleteConfirm(row){
  return `
    <div class="modal-box">
      <div class="modal-header"><span>Hapus Jurnal Fixed Asset</span><span class="close" id="modalClose">&times;</span></div>
      <div class="modal-body"><p>Yakin ingin menghapus jurnal <b>${row.kode}</b> — ${row.keterangan}?</p></div>
      <div class="modal-footer">
        <button class="btn-secondary" id="modalCancel">Batal</button>
        <button class="btn-danger" id="modalDelete">Hapus</button>
      </div>
    </div>`;
}

/* Picker Akun GL — SALINAN LOKAL dari pola tplJpAkunPicker()
   (jurnal-pembelian.template.js), bukan referensi cross-file. */
function tplJfaAkunPicker(list, target){
  return `
    <div class="modal-box" style="max-width:640px;">
      <div class="modal-header"><span>Pilih Akun GL</span><span class="close" id="pickerClose">&times;</span></div>
      <div class="modal-body">
        <input type="text" id="jfaAkunPickerSearch" placeholder="Cari kode / nama akun..." style="width:100%;border:1px solid var(--border);border-radius:6px;padding:8px 10px;font-size:12.8px;margin-bottom:12px;">
        <div class="table-wrap" style="max-height:360px;overflow:auto;">
          <table>
            <thead><tr><th>Kode</th><th>Nama Akun</th><th></th></tr></thead>
            <tbody id="jfaAkunPickerBody">${tplJfaAkunPickerRows(list, target)}</tbody>
          </table>
        </div>
      </div>
      <div class="modal-footer"><button class="btn-secondary" id="pickerCancel">Tutup</button></div>
    </div>`;
}

function tplJfaAkunPickerRows(list, target){
  if(!list.length) return `<tr><td colspan="3" style="color:var(--text-light);">Tidak ada akun ditemukan</td></tr>`;
  return list.map(a=>`
    <tr>
      <td>${a.kode}</td>
      <td>${a.nama}</td>
      <td><button class="btn-pick" data-pick-akun="${a.kode}" data-target="${target}">Pilih</button></td>
    </tr>`).join('');
}
