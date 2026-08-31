/* =========================================================
   TEMPLATE (HTML saja) — Jurnal Kas Lain-Lain (Kas/Bank >
   Master & Setting > Jurnal Kas Lain-Lain, key
   page:'jurnalKasLain'). Semua fungsi di file ini HANYA menyusun
   & mengembalikan markup HTML (string), TIDAK ada logic/DOM-
   binding/data mutation di sini. Logic-nya ada di file sebelah:
   jurnal-kas-lain.js

   Sesuai 2 screenshot MASERP yang dikirim user: "Daftar Jurnal
   Kas Lain - Lain" (list: Kode Jurnal link biru -> form Ubah /
   Nama Jurnal / Akun Kas / Bank / Akun Lawan + Ubah/Hapus,
   tombol +Tambah) dan form "+ Buat Jurnal Kas" (judul header
   PERSIS screenshot, beda dari label menu): Nama Jurnal + Mata
   Uang readonly (mengikuti akun Kas/Bank terpilih), lalu 3 baris
   picker — Akun Kas / Bank (dari DATA.kasBank, master menu
   Kas/Bank), Akun Kas / Bank Giro Mundur (opsional, akun GL),
   Lawan Akun Kas (akun GL, biasanya akun beban/pendapatan) —
   masing-masing kode readonly + tombol cari + tombol hapus,
   nama tampil di kolom kanan (reuse styling jp-akun-table punya
   Jurnal Pembelian). Footer: Duplikat (teal) + Simpan + Batalkan.
   Master ini template jurnal utk Transaksi Kas non utang/piutang
   (beban telepon/listrik/admin bank, pendapatan jasa giro, dst).
   Data sample dipetakan ke DATA.kasBank & DATA.akunGL DBM (data
   screenshot milik instalasi lain/SDL, 287 baris — cukup 7 baris
   representatif di mockup). */

function tplJurnalKasLainListPage(){
  return `
    <div class="breadcrumb">Home / Kas/Bank / <b>Jurnal Kas Lain-Lain</b></div>
    <div class="card">
      <div class="card-header dark-header"><h3>${icon('alertTriangle',15)} Daftar Jurnal Kas Lain - Lain</h3><button class="btn-primary" id="btnJklAdd">${icon('plus',14)} Tambah</button></div>
      <div class="table-toolbar">
        <select id="jklPageSize"><option selected>10</option><option>25</option><option>50</option></select>
        <input type="text" id="jklSearch" placeholder="Pencarian Global">
      </div>
      <div class="table-wrap"><table>
        <thead><tr>
          <th style="width:110px;">Kode Jurnal</th>
          <th>Nama Jurnal</th>
          <th style="width:240px;">Akun Kas / Bank</th>
          <th style="width:240px;">Akun Lawan</th>
          <th style="width:70px;">Ubah</th>
          <th style="width:70px;">Hapus</th>
        </tr></thead>
        <tbody id="jklTbody"></tbody>
      </table></div>
      <div class="table-footer"><div class="pager"><button>First</button><button>Previous</button><button class="active">1</button><button>Next</button><button>Last</button></div><div id="jklTotal"></div></div>
    </div>`;
}

function jklKasBankLabel(kode){
  const kb = DATA.kasBank.find(x => x.kode === kode);
  return kb ? `${kb.nama} ${kb.mataUang||''}`.trim() : '';
}
function jklAkunNama(kode){
  if(!kode) return '';
  const a = DATA.akunGL.find(x => x.kode === kode);
  return a ? a.nama : '';
}

function tplJklRows(rows){
  if(!rows.length) return `<tr><td colspan="6" style="color:var(--text-light);">Tidak ada Jurnal Kas yang cocok dengan pencarian.</td></tr>`;
  return rows.map((r,i)=>`
    <tr>
      <td><button class="link-pick" data-edit-link="${i}">${r.kode}</button></td>
      <td>${r.nama}</td>
      <td>${jklKasBankLabel(r.akunKasBank)}</td>
      <td>${jklAkunNama(r.akunLawan)}</td>
      <td><button class="icon-btn edit" data-edit="${i}" title="Ubah">${icon('edit',15)}</button></td>
      <td><button class="icon-btn del" data-del="${i}" title="Hapus">${icon('trash',15)}</button></td>
    </tr>`).join('');
}

/* Baris picker form — reuse styling jp-akun-table (Jurnal Pembelian). */
function tplJklPickerRow(label, key, kode, nama, placeholder){
  return `
    <tr>
      <td class="jp-label">${label}</td>
      <td class="jp-input">
        <div class="input-with-btn">
          <input type="text" id="fJkl_${key}" value="${kode||''}" placeholder="${placeholder}" readonly>
          <button type="button" class="icon-btn edit" data-jkl-search="${key}" title="Cari">${icon('search',14)}</button>
          <button type="button" class="icon-btn del" data-jkl-clear="${key}" title="Hapus">${icon('trash',14)}</button>
        </div>
      </td>
      <td class="jp-nama" id="fJklNama_${key}">${nama||''}</td>
    </tr>`;
}

function tplJurnalKasLainForm(mode, row){
  const isEdit = mode === 'edit';
  const kb = DATA.kasBank.find(x => x.kode === row.akunKasBank);
  return `
    <div class="breadcrumb">Home / Jurnal Kas Lain-Lain / <b>${isEdit ? 'Ubah' : 'Tambah'}</b></div>
    <div class="card">
      <div class="card-header dark-header">
        <h3>${icon('plus',15)} Buat Jurnal Kas</h3>
        <button class="btn-danger" id="btnJklTutorial">${icon('card',14)} Tutorial</button>
      </div>
      <div class="card-body">
        <table class="field-table">
          <tr>
            <td class="flabel" style="width:220px;">Nama Jurnal</td>
            <td style="width:280px;"><input type="text" id="fJklNama" value="${row.nama||''}" placeholder="Contoh: Beban Telepon"></td>
            <td class="flabel" style="width:140px;">Mata Uang</td>
            <td><input type="text" id="fJklMataUang" value="${kb ? (kb.mataUang||'IDR') : 'IDR'}" disabled></td>
          </tr>
        </table>
        <table class="jp-akun-table">
          ${tplJklPickerRow('Akun Kas / Bank', 'akunKasBank', row.akunKasBank, jklKasBankLabel(row.akunKasBank), 'Pilih Kas / Bank')}
          ${tplJklPickerRow('Akun Kas / Bank Giro Mundur', 'akunGiroMundur', row.akunGiroMundur, jklAkunNama(row.akunGiroMundur), 'Pilih Akun G.L. / Bank')}
          ${tplJklPickerRow('Lawan Akun Kas', 'akunLawan', row.akunLawan, jklAkunNama(row.akunLawan), 'Pilih Akun G.L.')}
        </table>
        <div class="form-page-actions">
          <button class="btn-teal" id="jklDuplikat" type="button">Duplikat</button>
          <button class="btn-primary" id="jklSimpan">Simpan</button>
          <a href="#" id="jklBatalkan" class="link-add" style="margin-top:0;">Batalkan</a>
        </div>
      </div>
    </div>`;
}

/* Picker Kas/Bank — sumber DATA.kasBank (master menu Kas/Bank). */
function tplJklKasBankPicker(list){
  return `
    <div class="modal-box" style="max-width:680px;">
      <div class="modal-header"><span>Pilih Kas / Bank</span><span class="close" id="modalClose">&times;</span></div>
      <div class="modal-body">
        <input type="text" id="jklKasBankPickerSearch" placeholder="Cari kode / nama kas-bank..." style="width:100%;border:1px solid var(--border);border-radius:6px;padding:8px 10px;font-size:12.8px;margin-bottom:12px;">
        <div class="table-wrap" style="max-height:360px;overflow:auto;">
          <table>
            <thead><tr><th>Kode</th><th>Nama</th><th>Entitas</th><th>Crc</th><th></th></tr></thead>
            <tbody id="jklKasBankPickerBody">${tplJklKasBankPickerRows(list)}</tbody>
          </table>
        </div>
      </div>
      <div class="modal-footer"><button class="btn-secondary" id="modalCancel">Tutup</button></div>
    </div>`;
}

function tplJklKasBankPickerRows(list){
  if(!list.length) return `<tr><td colspan="5" style="color:var(--text-light);">Tidak ada kas/bank ditemukan</td></tr>`;
  return list.map(k=>`
    <tr><td>${k.kode}</td><td>${k.nama}</td><td>${k.masterBank||''}</td><td>${k.mataUang||''}</td><td><button class="btn-pick" data-pick-kasbank="${k.kode}">Pilih</button></td></tr>`).join('');
}

/* Picker Akun GL — salinan lokal pola modul jurnal lain. */
function tplJklAkunPicker(list, key){
  return `
    <div class="modal-box" style="max-width:640px;">
      <div class="modal-header"><span>Pilih Akun GL</span><span class="close" id="modalClose">&times;</span></div>
      <div class="modal-body">
        <input type="text" id="jklAkunPickerSearch" placeholder="Cari kode / nama akun..." style="width:100%;border:1px solid var(--border);border-radius:6px;padding:8px 10px;font-size:12.8px;margin-bottom:12px;">
        <div class="table-wrap" style="max-height:360px;overflow:auto;">
          <table>
            <thead><tr><th>Kode</th><th>Nama Akun</th><th>Kat.</th><th></th></tr></thead>
            <tbody id="jklAkunPickerBody">${tplJklAkunPickerRows(list, key)}</tbody>
          </table>
        </div>
      </div>
      <div class="modal-footer"><button class="btn-secondary" id="modalCancel">Tutup</button></div>
    </div>`;
}

function tplJklAkunPickerRows(list, key){
  if(!list.length) return `<tr><td colspan="4" style="color:var(--text-light);">Tidak ada akun ditemukan</td></tr>`;
  return list.map(a=>`
    <tr><td>${a.kode}</td><td>${a.nama}</td><td>${a.kategori}</td><td><button class="btn-pick" data-pick-akun="${a.kode}" data-pick-key="${key}">Pilih</button></td></tr>`).join('');
}

function tplJklDeleteConfirm(row){
  return `
    <div class="modal-box">
      <div class="modal-header"><span>Hapus Jurnal Kas Lain-Lain</span><span class="close" id="modalClose">&times;</span></div>
      <div class="modal-body"><p>Yakin ingin menghapus jurnal kas <b>${row.kode}</b> — ${row.nama}?</p></div>
      <div class="modal-footer">
        <button class="btn-secondary" id="modalCancel">Batal</button>
        <button class="btn-danger" id="modalDelete">Hapus</button>
      </div>
    </div>`;
}

function tplJklInfoModal(title,text){
  return `
    <div class="modal-box">
      <div class="modal-header"><span>${title}</span><span class="close" id="modalClose">&times;</span></div>
      <div class="modal-body"><p>${text}</p></div>
      <div class="modal-footer"><button class="btn-primary" id="modalOk">Mengerti</button></div>
    </div>`;
}
