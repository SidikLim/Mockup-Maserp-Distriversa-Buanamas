/* =========================================================
   TEMPLATE (HTML saja) — Master Currency (Kas/Bank > Master &
   Setting > Currency). Semua fungsi di file ini HANYA menyusun &
   mengembalikan markup HTML (string), TIDAK ada logic/DOM-binding/
   data mutation di sini. Logic-nya ada di file sebelah: currency.js

   Sesuai 3 screenshot MASERP yang dikirim user 2026-08-28:
   - "Daftar Mata Uang": list kolom Mata Uang/Nama Mata Uang/
     Keterangan/Ubah/Hapus + tombol header "Impor Periode Kurs"
     (teal), "+ Tambah" (biru), "Tutorial" (merah), Total Record: 4.
   - "Ubah Mata Uang" tab "Rincian Transaksi": header form (Kode
     Mata Uang readonly/Nama Mata Uang/Keterangan/checkbox Non
     Aktif ?) + panel dark "Periode Kurs" berisi grid baris kurs
     (Kurs Target select/Tanggal Awal+Akhir dgn tombol kalender/
     Kurs Std/Kurs Pajak rata kanan/Hapus) + link "+Tambah Periode
     Kurs" + Simpan/Batalkan.
   - "Ubah Mata Uang" tab "Jurnal Mata Uang": panel dark "Setting
     Account Jurnal Selisih Kurs" berisi tabel Keterangan/Akun GL
     (input readonly + tombol kaca pembesar)/Nama Akun GL — 6 baris
     tetap (Akun Piutang/Utang/UM Pembelian/UM Penjualan/Laba/Rugi
     Selisih Kurs).
   Pola tab memakai .inv-tabs (disalin dari Cabang/Invoice), pola
   picker Akun GL adalah SALINAN LOKAL tplJpAkunPicker (Jurnal
   Pembelian — modul lazy-load lain yang urutan muatnya tidak boleh
   diandalkan), pola baris akun memakai .jp-akun-table yang sudah
   ada di style.css. Tombol kalender di kolom tanggal dekoratif
   (input teks dd/mm/yyyy langsung diketik — konsisten field
   tanggal modul lain di mockup ini yang juga plain text). */

const CRC_JURNAL_FIELDS = [
  { key:'akunPiutang', label:'Akun Piutang' },
  { key:'akunUtang', label:'Akun Utang' },
  { key:'akunUMPembelian', label:'Akun UM Pembelian' },
  { key:'akunUMPenjualan', label:'Akun UM Penjualan' },
  { key:'akunLabaSelisihKurs', label:'Akun Laba Selisih Kurs' },
  { key:'akunRugiSelisihKurs', label:'Akun Rugi Selisih Kurs' },
];

function crcAkunNama(kode){
  if(!kode) return '';
  const a = DATA.akunGL.find(x => x.kode === kode);
  return a ? a.nama : '';
}

function crcFmtKurs(n){
  return Number(n || 0).toLocaleString('id-ID', {minimumFractionDigits:2, maximumFractionDigits:2});
}

function tplCurrencyListPage(){
  return `
    <div class="breadcrumb">Home / Kas/Bank / <b>Currency</b></div>
    <div class="card">
      <div class="card-header dark-header">
        <h3>${icon('dollar',15)} Daftar Mata Uang</h3>
        <div class="toolbar-actions">
          <button class="btn-teal" id="btnCrcImpor">${icon('save',14)} Impor Periode Kurs</button>
          <button class="btn-primary" id="btnCrcAdd">${icon('plus',14)} Tambah</button>
          <button class="btn-danger" id="btnCrcTutorial">${icon('card',14)} Tutorial</button>
        </div>
      </div>
      <div class="table-toolbar">
        <select><option selected>10</option><option>25</option><option>50</option></select>
        <input type="text" id="crcSearch" placeholder="Pencarian Global">
      </div>
      <div class="table-wrap"><table>
        <thead><tr>
          <th style="width:110px;">Mata Uang</th>
          <th style="width:240px;">Nama Mata Uang</th>
          <th>Keterangan</th>
          <th style="width:60px;">Ubah</th>
          <th style="width:64px;">Hapus</th>
        </tr></thead>
        <tbody id="crcTbody"></tbody>
      </table></div>
      <div class="table-footer"><div class="pager"><button>First</button><button>Previous</button><button class="active">1</button><button>Next</button><button>Last</button></div><div id="crcTotal"></div></div>
    </div>`;
}

function tplCrcRows(rows){
  if(!rows.length){
    return `<tr><td colspan="5" style="color:var(--text-light);padding:14px;">Tidak ada mata uang yang cocok dengan pencarian.</td></tr>`;
  }
  return rows.map(r => `
    <tr>
      <td><a href="javascript:void(0)" class="crc-kode-link" data-edit-kode="${r.kode}" style="color:var(--blue);font-weight:600;text-decoration:none;">${r.kode}</a></td>
      <td>${r.nama || ''}</td>
      <td>${r.keterangan || ''}</td>
      <td><button class="icon-btn edit" data-edit-kode="${r.kode}" title="Ubah">${icon('edit',15)}</button></td>
      <td><button class="icon-btn del" data-del-kode="${r.kode}" title="Hapus">${icon('trash',15)}</button></td>
    </tr>`).join('');
}

/* 1 baris grid Periode Kurs — semua input membawa data-kurs-idx utk
   di-wire currency.js (nilai disimpan ke state saat berubah). */
function tplCrcKursRow(k, i, kodeSendiri){
  const targetList = DATA.currencies.map(c => c.kode).filter(kd => kd !== kodeSendiri);
  return `
    <tr>
      <td style="width:26px;"></td>
      <td style="width:90px;">
        <select data-kurs-field="kursTarget" data-kurs-idx="${i}">
          ${targetList.map(kd => `<option ${k.kursTarget === kd ? 'selected' : ''}>${kd}</option>`).join('')}
        </select>
      </td>
      <td>
        <div class="input-with-btn">
          <input type="text" value="${k.tglAwal || ''}" placeholder="dd/mm/yyyy" data-kurs-field="tglAwal" data-kurs-idx="${i}">
          <button type="button" class="icon-btn edit" data-kurs-cal="${i}" title="Kalender">${icon('calendar',14)}</button>
        </div>
      </td>
      <td>
        <div class="input-with-btn">
          <input type="text" value="${k.tglAkhir || ''}" placeholder="dd/mm/yyyy" data-kurs-field="tglAkhir" data-kurs-idx="${i}">
          <button type="button" class="icon-btn edit" data-kurs-cal="${i}" title="Kalender">${icon('calendar',14)}</button>
        </div>
      </td>
      <td><input type="text" value="${crcFmtKurs(k.kursStd)}" style="text-align:right;" data-kurs-field="kursStd" data-kurs-idx="${i}"></td>
      <td><input type="text" value="${crcFmtKurs(k.kursPajak)}" style="text-align:right;" data-kurs-field="kursPajak" data-kurs-idx="${i}"></td>
      <td style="width:56px;text-align:center;"><button type="button" class="icon-btn del" data-kurs-del="${i}" title="Hapus">${icon('trash',14)}</button></td>
    </tr>`;
}

function tplCrcKursPanel(row){
  return `
    <div class="card" style="margin-top:14px;">
      <div class="card-header dark-header"><h3>${icon('alertTriangle',14)} Periode Kurs</h3></div>
      <div class="table-wrap">
        <table class="jp-akun-table" style="margin-bottom:0;">
          <thead><tr>
            <th style="width:26px;"></th>
            <th style="width:90px;text-align:left;padding:9px 14px;">Kurs Target</th>
            <th style="text-align:left;padding:9px 14px;">Tanggal Awal</th>
            <th style="text-align:left;padding:9px 14px;">Tanggal Akhir</th>
            <th style="text-align:right;padding:9px 14px;">Kurs Std</th>
            <th style="text-align:right;padding:9px 14px;">Kurs Pajak</th>
            <th style="width:56px;text-align:left;padding:9px 14px;">Hapus</th>
          </tr></thead>
          <tbody id="crcKursBody">${row.periodeKurs.map((k,i) => tplCrcKursRow(k, i, row.kode)).join('')}</tbody>
        </table>
        <a href="javascript:void(0)" class="link-add" id="crcKursAdd" style="margin:10px 14px 14px;">${icon('plus',13)}Tambah Periode Kurs</a>
      </div>
    </div>`;
}

function tplCrcJurnalRow(f, row){
  const kode = (row.jurnal || {})[f.key] || '';
  return `
    <tr>
      <td class="jp-label">${f.label}</td>
      <td class="jp-input">
        <div class="input-with-btn">
          <input type="text" id="fCrc_${f.key}" value="${kode}" placeholder="Pilih Akun" readonly>
          <button type="button" class="icon-btn edit" data-akun-search="${f.key}" title="Cari Akun">${icon('search',14)}</button>
        </div>
      </td>
      <td class="jp-nama" id="fCrcNama_${f.key}">${crcAkunNama(kode)}</td>
    </tr>`;
}

function tplCrcJurnalPanel(row){
  return `
    <div class="card" style="margin-top:14px;">
      <div class="card-header dark-header"><h3>${icon('alertTriangle',14)} Setting Account Jurnal Selisih Kurs</h3></div>
      <div class="card-body">
        <table class="jp-akun-table" style="margin-bottom:0;">
          <thead><tr>
            <th style="text-align:left;padding:9px 14px;width:230px;">Keterangan</th>
            <th style="text-align:left;padding:9px 14px;width:220px;">Akun GL</th>
            <th style="text-align:left;padding:9px 14px;">Nama Akun GL</th>
          </tr></thead>
          <tbody>${CRC_JURNAL_FIELDS.map(f => tplCrcJurnalRow(f, row)).join('')}</tbody>
        </table>
      </div>
    </div>`;
}

function tplCurrencyForm(mode, row){
  const isAdd = mode === 'add';
  return `
    <div class="breadcrumb">Home / Kas/Bank / Currency / <b>${isAdd ? 'Tambah' : 'Ubah'}</b></div>
    <div class="card">
      <div class="card-header dark-header">
        <h3>${icon(isAdd ? 'plus' : 'edit',15)} ${isAdd ? 'Tambah' : 'Ubah'} Mata Uang</h3>
        <button class="btn-danger" id="btnCrcFormTutorial" type="button">${icon('card',14)} Tutorial</button>
      </div>
      <div class="card-body">
        <div class="form-grid">
          <div class="form-group">
            <label>Kode Mata Uang</label>
            <input type="text" id="fCrcKode" value="${row.kode || ''}" maxlength="5" placeholder="Contoh: USD" ${isAdd ? '' : 'disabled'}>
          </div>
          <div class="form-group">
            <label>Nama Mata Uang</label>
            <input type="text" id="fCrcNama" value="${row.nama || ''}" placeholder="Contoh: American Dollar">
          </div>
          <div class="form-group">
            <label>Keterangan</label>
            <input type="text" id="fCrcKeterangan" value="${row.keterangan || ''}" placeholder="Keterangan">
          </div>
          <div class="form-group">
            <label>&nbsp;</label>
            <div class="checkbox-row" style="margin:6px 0 0;">
              <label for="fCrcNonAktif" style="font-weight:600;">Non Aktif ?</label>
              <input type="checkbox" id="fCrcNonAktif" ${row.nonAktif ? 'checked' : ''} style="width:18px;height:18px;">
            </div>
          </div>
        </div>

        <div class="inv-tabs" style="margin-top:8px;">
          <button type="button" class="inv-tab-btn active" data-crc-tab="kurs">Rincian Transaksi</button>
          <button type="button" class="inv-tab-btn" data-crc-tab="jurnal">Jurnal Mata Uang</button>
        </div>

        <div id="crcTabPanel-kurs">${tplCrcKursPanel(row)}</div>
        <div id="crcTabPanel-jurnal" style="display:none;">${tplCrcJurnalPanel(row)}</div>

        <div class="form-page-actions">
          <a href="#" id="crcCancel">Batalkan</a>
          <button class="btn-primary" id="crcSave">Simpan</button>
        </div>
      </div>
    </div>`;
}

/* SALINAN LOKAL pola picker Akun GL Jurnal Pembelian (tplJpAkunPicker)
   — id elemen dibedakan (crc...) supaya tidak bentrok. */
function tplCrcAkunPicker(list, fieldKey){
  return `
    <div class="modal-box" style="max-width:640px;">
      <div class="modal-header"><span>Pilih Akun GL</span><span class="close" id="modalClose">&times;</span></div>
      <div class="modal-body">
        <input type="text" id="crcAkunPickerSearch" placeholder="Cari kode / nama akun..." style="width:100%;border:1px solid var(--border);border-radius:6px;padding:8px 10px;font-size:12.8px;margin-bottom:12px;">
        <div class="table-wrap" style="max-height:360px;overflow:auto;">
          <table>
            <thead><tr><th>Kode</th><th>Nama Akun</th><th>Kat.</th><th></th></tr></thead>
            <tbody id="crcAkunPickerBody">${tplCrcAkunPickerRows(list, fieldKey)}</tbody>
          </table>
        </div>
      </div>
      <div class="modal-footer">
        <button class="btn-secondary" id="modalCancel">Tutup</button>
      </div>
    </div>`;
}

function tplCrcAkunPickerRows(list, fieldKey){
  if(!list.length) return `<tr><td colspan="4" style="color:var(--text-light);">Tidak ada akun ditemukan</td></tr>`;
  return list.map(a => `
    <tr>
      <td>${a.kode}</td>
      <td>${a.nama}</td>
      <td>${a.kategori}</td>
      <td><button class="btn-pick" data-pick-akun="${a.kode}" data-pick-field="${fieldKey}">Pilih</button></td>
    </tr>`).join('');
}

function tplCrcDeleteConfirm(row){
  return `
    <div class="modal-box">
      <div class="modal-header"><span>Hapus Mata Uang</span><span class="close" id="modalClose">&times;</span></div>
      <div class="modal-body"><p>Yakin ingin menghapus mata uang <b>${row.kode}</b> — ${row.nama || ''}?</p></div>
      <div class="modal-footer">
        <button class="btn-secondary" id="modalCancel">Batal</button>
        <button class="btn-danger" id="modalDelete">Hapus</button>
      </div>
    </div>`;
}

function tplCrcInfoModal(title, text){
  return `
    <div class="modal-box">
      <div class="modal-header"><span>${title}</span><span class="close" id="modalClose">&times;</span></div>
      <div class="modal-body"><p>${text}</p></div>
      <div class="modal-footer">
        <button class="btn-primary" id="modalCancel">Tutup</button>
      </div>
    </div>`;
}
