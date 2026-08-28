/* =========================================================
   TEMPLATE (HTML saja) — Jurnal Pelunasan Utang/Piutang (Kas/Bank
   > Master & Setting). Semua fungsi di file ini HANYA menyusun &
   mengembalikan markup HTML (string), TIDAK ada logic/DOM-binding/
   data mutation di sini. Logic-nya ada di file sebelah:
   jurnal-pelunasan-up.js

   Sesuai 2 screenshot MASERP yang dikirim user 2026-08-28:
   - "Daftar Jurnal Kas Utang dan Piutang": list kolom Kode Jurnal/
     Keterangan/Ubah/Hapus + tombol "+ Tambah", pencarian global,
     select jumlah baris.
   - "+ Buat Jurnal Kas": form full page — baris teratas Nama Jurnal
     (input) + Mata Uang (readonly), lalu 15 baris field akun GL
     (Akun Kas s/d Akun Uang Muka PPH 22) masing-masing input
     readonly + tombol kaca pembesar + tombol hapus + nama akun di
     kolom kanan, footer Simpan/Batalkan/DUPLICATE + tombol merah
     Tutorial di header.
   Pola form & baris akun mengikuti persis Jurnal Pembelian
   (field-table + .jp-akun-table + picker Akun GL dari DATA.akunGL)
   — picker-nya SALINAN LOKAL tplJpAkunPicker (modul lazy-load lain
   yang urutan muatnya tidak boleh diandalkan), id elemen dibedakan
   (jkup...). Sumber datanya DATA.jurnalKasUtangPiutang (BARU
   2026-08-28, lihat komentar besar di js/data.js). */

const JKUP_AKUN_FIELDS = [
  { key:'akunKas', label:'Akun Kas' },
  { key:'akunUtang', label:'Akun Utang' },
  { key:'akunUtangGiroMundur', label:'Akun Utang Giro Mundur' },
  { key:'akunPiutang', label:'Akun Piutang' },
  { key:'akunPiutangGiroMundur', label:'Akun Piutang Giro Mundur' },
  { key:'akunLabaSelisihKurs', label:'Akun Laba Selisih Kurs' },
  { key:'akunRugiSelisihKurs', label:'Akun Rugi Selisih Kurs' },
  { key:'akunBiayaLain', label:'Akun Biaya Lain - Lain' },
  { key:'akunPendapatanLain', label:'Akun Pendapatan Lain - Lain' },
  { key:'akunUangMukaPembelian', label:'Akun Uang Muka Pembelian' },
  { key:'akunUangMukaPenjualan', label:'Akun Uang Muka Penjualan' },
  { key:'akunARSSPPPN', label:'Akun AR SSP PPN' },
  { key:'akunARSSPPPH', label:'Akun AR SSP PPH' },
  { key:'akunPPNPemungut', label:'Akun PPn Pemungut' },
  { key:'akunUangMukaPPH22', label:'Akun Uang Muka PPH 22' },
];

function jkupAkunNama(kode){
  if(!kode) return '';
  const a = DATA.akunGL.find(x => x.kode === kode);
  return a ? a.nama : '';
}

function tplJkupListPage(){
  return `
    <div class="breadcrumb">Home / Kas/Bank / <b>Jurnal Pelunasan Utang/Piutang</b></div>
    <div class="card">
      <div class="card-header dark-header">
        <h3>${icon('alertTriangle',15)} Daftar Jurnal Kas Utang dan Piutang</h3>
        <button class="btn-primary" id="btnJkupAdd">${icon('plus',14)} Tambah</button>
      </div>
      <div class="table-toolbar">
        <select><option selected>10</option><option>25</option><option>50</option></select>
        <input type="text" id="jkupSearch" placeholder="Pencarian Global">
      </div>
      <div class="table-wrap"><table>
        <thead><tr>
          <th style="width:130px;">Kode Jurnal</th>
          <th>Keterangan</th>
          <th style="width:60px;">Ubah</th>
          <th style="width:64px;">Hapus</th>
        </tr></thead>
        <tbody id="jkupTbody"></tbody>
      </table></div>
      <div class="table-footer"><div class="pager"><button>First</button><button>Previous</button><button class="active">1</button><button>Next</button><button>Last</button></div><div id="jkupTotal"></div></div>
    </div>`;
}

function tplJkupRows(rows){
  if(!rows.length){
    return `<tr><td colspan="4" style="color:var(--text-light);padding:14px;">Tidak ada jurnal yang cocok dengan pencarian.</td></tr>`;
  }
  return rows.map(r => `
    <tr>
      <td><a href="javascript:void(0)" data-edit-kode="${r.kode}" style="color:var(--blue);font-weight:600;text-decoration:none;">${r.kode}</a></td>
      <td>${r.nama || ''}</td>
      <td><button class="icon-btn edit" data-edit-kode="${r.kode}" title="Ubah">${icon('edit',15)}</button></td>
      <td><button class="icon-btn del" data-del-kode="${r.kode}" title="Hapus">${icon('trash',15)}</button></td>
    </tr>`).join('');
}

function tplJkupAkunRow(f, row){
  const kode = row[f.key] || '';
  return `
    <tr>
      <td class="jp-label">${f.label}</td>
      <td class="jp-input">
        <div class="input-with-btn">
          <input type="text" id="fJkup_${f.key}" value="${kode}" placeholder="Pilih Akun" readonly>
          <button type="button" class="icon-btn edit" data-akun-search="${f.key}" title="Cari Akun">${icon('search',14)}</button>
          <button type="button" class="icon-btn del" data-akun-clear="${f.key}" title="Hapus">${icon('trash',14)}</button>
        </div>
      </td>
      <td class="jp-nama" id="fJkupNama_${f.key}">${jkupAkunNama(kode)}</td>
    </tr>`;
}

function tplJkupForm(mode, row){
  const isAdd = mode === 'add';
  return `
    <div class="breadcrumb">Home / Kas/Bank / Jurnal Pelunasan Utang/Piutang / <b>${isAdd ? 'Tambah' : 'Ubah'}</b></div>
    <div class="card">
      <div class="card-header dark-header">
        <h3>${icon(isAdd ? 'plus' : 'edit',15)} ${isAdd ? 'Buat' : 'Ubah'} Jurnal Kas</h3>
        <button class="btn-danger" id="btnJkupTutorial" type="button">${icon('card',14)} Tutorial</button>
      </div>
      <div class="card-body">
        <table class="field-table">
          <tr>
            <td class="flabel">Nama Jurnal</td>
            <td><input type="text" id="fJkupNama" value="${row.nama || ''}" placeholder="Contoh: Bank BCA HO 0123456789"></td>
            <td class="flabel">Mata Uang</td>
            <td><input type="text" value="${row.mataUang || 'IDR'}" disabled></td>
          </tr>
        </table>

        <table class="jp-akun-table">
          ${JKUP_AKUN_FIELDS.map(f => tplJkupAkunRow(f, row)).join('')}
        </table>

        <div class="form-page-actions">
          <a href="#" id="jkupCancel" class="link-add" style="margin-right:auto;">Batalkan</a>
          <button class="btn-primary" id="jkupSave">Simpan</button>
          <button class="btn-primary" id="jkupDuplicate" style="background:#5a86cf;">DUPLICATE</button>
        </div>
      </div>
    </div>`;
}

/* SALINAN LOKAL pola picker Akun GL Jurnal Pembelian (tplJpAkunPicker). */
function tplJkupAkunPicker(list, fieldKey){
  return `
    <div class="modal-box" style="max-width:640px;">
      <div class="modal-header"><span>Pilih Akun GL</span><span class="close" id="modalClose">&times;</span></div>
      <div class="modal-body">
        <input type="text" id="jkupAkunPickerSearch" placeholder="Cari kode / nama akun..." style="width:100%;border:1px solid var(--border);border-radius:6px;padding:8px 10px;font-size:12.8px;margin-bottom:12px;">
        <div class="table-wrap" style="max-height:360px;overflow:auto;">
          <table>
            <thead><tr><th>Kode</th><th>Nama Akun</th><th>Kat.</th><th></th></tr></thead>
            <tbody id="jkupAkunPickerBody">${tplJkupAkunPickerRows(list, fieldKey)}</tbody>
          </table>
        </div>
      </div>
      <div class="modal-footer">
        <button class="btn-secondary" id="modalCancel">Tutup</button>
      </div>
    </div>`;
}

function tplJkupAkunPickerRows(list, fieldKey){
  if(!list.length) return `<tr><td colspan="4" style="color:var(--text-light);">Tidak ada akun ditemukan</td></tr>`;
  return list.map(a => `
    <tr>
      <td>${a.kode}</td>
      <td>${a.nama}</td>
      <td>${a.kategori}</td>
      <td><button class="btn-pick" data-pick-akun="${a.kode}" data-pick-field="${fieldKey}">Pilih</button></td>
    </tr>`).join('');
}

function tplJkupDeleteConfirm(row){
  return `
    <div class="modal-box">
      <div class="modal-header"><span>Hapus Jurnal Kas</span><span class="close" id="modalClose">&times;</span></div>
      <div class="modal-body"><p>Yakin ingin menghapus jurnal <b>${row.kode}</b> — ${row.nama || ''}?</p></div>
      <div class="modal-footer">
        <button class="btn-secondary" id="modalCancel">Batal</button>
        <button class="btn-danger" id="modalDelete">Hapus</button>
      </div>
    </div>`;
}

function tplJkupInfoModal(title, text){
  return `
    <div class="modal-box">
      <div class="modal-header"><span>${title}</span><span class="close" id="modalClose">&times;</span></div>
      <div class="modal-body"><p>${text}</p></div>
      <div class="modal-footer">
        <button class="btn-primary" id="modalCancel">Tutup</button>
      </div>
    </div>`;
}
