/* =========================================================
   TEMPLATE (HTML saja) — Master Cabang (menu General Ledger > Master
   & Setting > Cabang, page:'cabang', menggantikan entry placeholder
   lama — lihat js/menu.js & catatan besar di atas DATA.cabangMaster
   di js/data.js utk penjelasan lengkap adaptasi per-tab). Semua
   fungsi di file ini HANYA menyusun & mengembalikan markup HTML
   (string), TIDAK ada logic/DOM-binding/data mutation — logic-nya ada
   di file sebelah: cabang.js.

   List "Daftar Cabang": dark header + tombol "+ Cabang" & "Update
   Cabang ke Master Customer" (DEKORATIF — lihat cbSyncCustomer() di
   cabang.js) + "Tutorial", toolbar page-size + Pencarian Global,
   kolom Kode/Nama Cabang/Kota/Telepon/Status/Ubah/Hapus.

   Form "+ Cabang": pola FULL PAGE (sama seperti Master Wilayah/Master
   Rayon) — header field-table (Kode Cabang/Nama Perusahaan [fixed,
   lihat catatan di data.js]/Nama Cabang/Alamat/Kota/Provinsi/Kode
   Pos/Telepon/Fax/Email/NPWP Cabang/Tanggal Berdiri/Status), lalu 6
   tab (.inv-tabs, pola disalin dari Transaksi Persediaan/Invoice):
   Cost Center / Rincian Jurnal Akun / Wilayah Sales / Penanggung
   Jawab / Informasi Izin Cabang / Jurnal R/K.
========================================================= */

const CB_JABATAN_LIST = ['Kepala Cabang','Supply Chain Manager','Finance Manager','Sales Manager','Warehouse Supervisor'];

function tplCabangListPage(){
  return `
    <div class="breadcrumb">Home / <b>Cabang</b></div>
    <div class="card">
      <div class="card-header dark-header">
        <h3>${icon('building',15)} Daftar Cabang</h3>
        <div class="toolbar-actions">
          <button class="btn-primary" id="btnCbAdd">${icon('plus',14)} Cabang</button>
          <button class="btn-outline" id="btnCbSyncCustomer">${icon('refreshCw',14)} Update Cabang ke Master Customer</button>
          <button class="btn-danger" id="btnCbTutorial">${icon('eye',14)} Tutorial</button>
        </div>
      </div>
      <div class="table-toolbar">
        <select id="cbPageSize"><option>10</option><option selected>20</option><option>50</option></select>
        <input type="text" id="cbSearch" placeholder="Pencarian Global">
      </div>
      <div class="table-wrap"><table>
        <thead><tr>
          <th>Kode Cabang</th><th>Nama Cabang</th><th>Kota</th><th>Telepon</th><th>Status</th><th>Ubah</th><th>Hapus</th>
        </tr></thead>
        <tbody id="cbTbody"></tbody>
      </table></div>
      <div class="table-footer"><div class="pager"><button>First</button><button>Previous</button><button class="active">1</button><button>Next</button><button>Last</button></div><div id="cbTotal"></div></div>
    </div>`;
}

function tplCbRows(rows){
  if(!rows.length) return `<tr><td colspan="7" style="color:var(--text-light);">Tidak Ada Data</td></tr>`;
  return rows.map(r=>{
    const i = DATA.cabangMaster.indexOf(r);
    return `
    <tr>
      <td><b style="color:var(--blue);cursor:pointer;" data-edit="${i}">${r.kode}</b></td>
      <td>${r.nama}</td>
      <td>${r.kota}</td>
      <td>${r.telepon}</td>
      <td><span style="font-weight:600;color:${r.status==='Aktif'?'#1a9e5c':'var(--text-light)'};">${r.status}</span></td>
      <td><button class="icon-btn edit" data-edit="${i}" title="Ubah">${icon('edit',15)}</button></td>
      <td><button class="icon-btn del" data-del="${i}" title="Hapus">${icon('trash',15)}</button></td>
    </tr>`;
  }).join('');
}

function tplCabangForm(mode, row){
  const title = mode === 'add' ? '+ Cabang' : 'Cabang';
  return `
    <div class="breadcrumb">Home / Cabang / <b>${title}</b></div>
    <div class="card">
      <div class="card-header dark-header"><h3>${icon('building',15)} ${title}</h3></div>
      <div class="card-body">
        <table class="field-table">
          <tr>
            <td class="flabel">Kode Cabang</td>
            <td><input type="text" value="${row.kode}" readonly style="background:#f2f3f6;color:var(--text-light);"></td>
            <td class="flabel">Nama Perusahaan</td>
            <td><input type="text" value="${row.namaPerusahaan}" disabled></td>
          </tr>
          <tr>
            <td class="flabel">Nama Cabang</td>
            <td><input type="text" id="fCbNama" value="${row.nama||''}" placeholder="Contoh: Cirebon"></td>
            <td class="flabel">Status</td>
            <td>
              <div class="radio-inline">
                <label><input type="radio" name="fCbStatus" value="Aktif" ${row.status!=='Non-Aktif'?'checked':''}> Aktif</label>
                <label><input type="radio" name="fCbStatus" value="Non-Aktif" ${row.status==='Non-Aktif'?'checked':''}> Non-Aktif</label>
              </div>
            </td>
          </tr>
          <tr>
            <td class="flabel">Alamat</td>
            <td colspan="3"><input type="text" id="fCbAlamat" value="${row.alamat||''}"></td>
          </tr>
          <tr>
            <td class="flabel">Kota</td>
            <td><input type="text" id="fCbKota" value="${row.kota||''}"></td>
            <td class="flabel">Provinsi</td>
            <td><select id="fCbProvinsi">${DATA.provinsiList.map(p=>`<option ${p===row.provinsi?'selected':''}>${p}</option>`).join('')}</select></td>
          </tr>
          <tr>
            <td class="flabel">Kode Pos</td>
            <td><input type="text" id="fCbKodePos" value="${row.kodePos||''}"></td>
            <td class="flabel">Tanggal Berdiri</td>
            <td><input type="text" id="fCbTglBerdiri" value="${row.tanggalBerdiri||''}" placeholder="DD/MM/YYYY"></td>
          </tr>
          <tr>
            <td class="flabel">Telepon</td>
            <td><input type="text" id="fCbTelepon" value="${row.telepon||''}"></td>
            <td class="flabel">Fax</td>
            <td><input type="text" id="fCbFax" value="${row.fax||''}"></td>
          </tr>
          <tr>
            <td class="flabel">Email</td>
            <td><input type="text" id="fCbEmail" value="${row.email||''}"></td>
            <td class="flabel">NPWP Cabang</td>
            <td><input type="text" id="fCbNpwp" value="${row.npwp||''}"></td>
          </tr>
        </table>

        <div class="inv-tabs">
          <button type="button" class="inv-tab-btn active" data-cb-tab="cc">Cost Center</button>
          <button type="button" class="inv-tab-btn" data-cb-tab="jurnal">Rincian Jurnal Akun</button>
          <button type="button" class="inv-tab-btn" data-cb-tab="wilayah">Wilayah Sales</button>
          <button type="button" class="inv-tab-btn" data-cb-tab="pj">Penanggung Jawab</button>
          <button type="button" class="inv-tab-btn" data-cb-tab="izin">Informasi Izin Cabang</button>
          <button type="button" class="inv-tab-btn" data-cb-tab="rk">Jurnal R/K</button>
        </div>

        <div id="cbTabPanel-cc">${tplCbCostCenterPanel(row)}</div>
        <div id="cbTabPanel-jurnal" style="display:none;">${tplCbJurnalPanel(row)}</div>
        <div id="cbTabPanel-wilayah" style="display:none;">${tplCbWilayahPanel(row)}</div>
        <div id="cbTabPanel-pj" style="display:none;">${tplCbPjPanel(row)}</div>
        <div id="cbTabPanel-izin" style="display:none;">${tplCbIzinPanel(row)}</div>
        <div id="cbTabPanel-rk" style="display:none;">${tplCbRkPanel(row)}</div>

        <div class="form-page-actions">
          <button class="btn-primary" id="cbSave">${icon('check',14)} Simpan</button>
          <button class="btn-outline" id="cbCancel">Batalkan</button>
        </div>
      </div>
    </div>`;
}

/* ===== Tab 1: Cost Center — pola TAUTAN (sama seperti Rayon di
   Master Wilayah): tiap baris cuma 1 <select> menaut ke DATA.costCenter
   YANG SUDAH ADA, bukan bikin Cost Center baru. ===== */
function tplCbCostCenterPanel(row){
  return `
    <div class="card" style="box-shadow:none;border:1px solid var(--border);">
      <div class="card-header dark-header"><h3>${icon('folder',14)} Cost Center Tertaut</h3></div>
      <div class="table-wrap"><table>
        <thead><tr><th>Cost Center</th><th style="width:70px;">Hapus</th></tr></thead>
        <tbody id="cbCcTbody">${tplCbCcRows(row.costCenterKode)}</tbody>
      </table></div>
      <div style="padding:10px 18px;"><a href="#" class="link-add" id="btnCbCcAdd">${icon('plus',13)} Tambah Cost Center</a></div>
    </div>`;
}

function tplCbCcRows(costCenterKode){
  if(!costCenterKode.length) return `<tr><td colspan="2" style="color:var(--text-light);">Belum ada Cost Center ditautkan</td></tr>`;
  return costCenterKode.map((kode,i)=>`
    <tr>
      <td>
        <select data-cc-idx="${i}">
          ${DATA.costCenter.map(c=>`<option value="${c.kode}" ${c.kode===kode?'selected':''}>${c.kode} - ${c.nama}</option>`).join('')}
        </select>
      </td>
      <td><button class="icon-btn del" data-cc-del="${i}">${icon('trash',14)}</button></td>
    </tr>`).join('');
}

/* ===== Tab 2: Rincian Jurnal Akun — akun picker (pola disalin lokal
   dari tplJpAkunRow/tplJpAkunPicker di jurnal-pembelian.template.js)
   + tombol "Generate Account" yang men-generate ulang ke-4 akun
   dengan default akun HO (lihat cbGenerateAccount() di cabang.js). ===== */
const CB_AKUN_FIELDS = [
  {key:'akunKas', label:'Akun Kas'},
  {key:'akunPiutang', label:'Akun Piutang Usaha'},
  {key:'akunPersediaan', label:'Akun Persediaan Barang Dagang'},
  {key:'akunHutang', label:'Akun Hutang Usaha'},
];

function cbAkunNama(kode){
  const a = DATA.akunGL.find(a=>a.kode===kode);
  return a ? a.nama : '';
}

function tplCbAkunRow(f, row){
  const kode = row.akunJurnal[f.key] || '';
  return `
    <tr>
      <td class="jp-label">${f.label}</td>
      <td class="jp-input">
        <div class="input-with-btn">
          <input type="text" id="fCbAkun_${f.key}" value="${kode}" placeholder="Pilih Akun" readonly>
          <button type="button" class="icon-btn edit" data-cb-akun-search="${f.key}" title="Cari Akun">${icon('search',14)}</button>
          <button type="button" class="icon-btn del" data-cb-akun-clear="${f.key}" title="Hapus">${icon('trash',14)}</button>
        </div>
      </td>
      <td class="jp-nama" id="fCbAkunNama_${f.key}">${cbAkunNama(kode)}</td>
    </tr>`;
}

function tplCbJurnalPanel(row){
  return `
    <div class="card" style="box-shadow:none;border:1px solid var(--border);padding:16px 18px;">
      <div style="display:flex;justify-content:flex-end;margin-bottom:10px;">
        <button class="btn-primary" id="btnCbGenerateAccount" style="background:#5a86cf;">${icon('refreshCw',14)} Generate Account</button>
      </div>
      <table class="jp-akun-table">
        ${CB_AKUN_FIELDS.map(f=>tplCbAkunRow(f,row)).join('')}
      </table>
    </div>`;
}

function tplCbAkunPicker(list, fieldKey, target){
  return `
    <div class="modal-box" style="max-width:640px;">
      <div class="modal-header"><span>Pilih Akun GL</span><span class="close" id="modalClose">&times;</span></div>
      <div class="modal-body">
        <input type="text" id="cbAkunPickerSearch" placeholder="Cari kode / nama akun..." style="width:100%;border:1px solid var(--border);border-radius:6px;padding:8px 10px;font-size:12.8px;margin-bottom:12px;">
        <div class="table-wrap" style="max-height:360px;overflow:auto;">
          <table>
            <thead><tr><th>Kode</th><th>Nama Akun</th><th>Kat.</th><th></th></tr></thead>
            <tbody id="cbAkunPickerBody">${tplCbAkunPickerRows(list, fieldKey, target)}</tbody>
          </table>
        </div>
      </div>
      <div class="modal-footer"><button class="btn-secondary" id="modalCancel">Tutup</button></div>
    </div>`;
}

function tplCbAkunPickerRows(list, fieldKey, target){
  if(!list.length) return `<tr><td colspan="4" style="color:var(--text-light);">Tidak ada akun ditemukan</td></tr>`;
  return list.map(a=>`
    <tr>
      <td>${a.kode}</td>
      <td>${a.nama}</td>
      <td>${a.kategori}</td>
      <td><button class="btn-pick" data-cb-pick-akun="${a.kode}" data-cb-pick-field="${fieldKey}" data-cb-pick-target="${target}">Pilih</button></td>
    </tr>`).join('');
}

/* ===== Tab 3: Wilayah Sales — pola TAUTAN sama seperti Cost Center,
   menaut ke DATA.area (kolomnya menampilkan kode + nama area). ===== */
function tplCbWilayahPanel(row){
  return `
    <div class="card" style="box-shadow:none;border:1px solid var(--border);">
      <div class="card-header dark-header"><h3>${icon('target',14)} Wilayah Sales Tertaut</h3></div>
      <div class="table-wrap"><table>
        <thead><tr><th>Wilayah / Area</th><th style="width:70px;">Hapus</th></tr></thead>
        <tbody id="cbWlTbody">${tplCbWlRows(row.wilayahKode)}</tbody>
      </table></div>
      <div style="padding:10px 18px;"><a href="#" class="link-add" id="btnCbWlAdd">${icon('plus',13)} Tambah Wilayah</a></div>
    </div>`;
}

function tplCbWlRows(wilayahKode){
  if(!wilayahKode.length) return `<tr><td colspan="2" style="color:var(--text-light);">Belum ada Wilayah/Area ditautkan</td></tr>`;
  return wilayahKode.map((kode,i)=>`
    <tr>
      <td>
        <select data-wl-idx="${i}">
          ${DATA.area.map(a=>`<option value="${a.kode}" ${a.kode===kode?'selected':''}>${a.kode} - ${a.nama}</option>`).join('')}
        </select>
      </td>
      <td><button class="icon-btn del" data-wl-del="${i}">${icon('trash',14)}</button></td>
    </tr>`).join('');
}

/* ===== Tab 4: Penanggung Jawab — pola ENTITAS BARU (sama seperti
   Kecamatan di Master Rayon): tiap baris {nama, jabatan, kategoriBarang[]}
   diedit langsung inline (bukan tautan ke data lain). Kategori Barang
   per baris pakai tag-chip multi-select (pola disalin lokal dari
   tplPklPickerTags di picking-list.template.js), menaut ke KODE ASLI
   DATA.kategoriBarang (bukan tag demo farmasi). ===== */
function tplCbPjPanel(row){
  return `
    <div class="card" style="box-shadow:none;border:1px solid var(--border);">
      <div class="card-header dark-header"><h3>${icon('users',14)} Penanggung Jawab Cabang</h3></div>
      <div class="table-wrap"><table>
        <thead><tr><th style="width:22%;">Nama</th><th style="width:20%;">Jabatan</th><th>Kategori Barang</th><th style="width:60px;">Hapus</th></tr></thead>
        <tbody id="cbPjTbody">${tplCbPjRows(row.penanggungJawab)}</tbody>
      </table></div>
      <div style="padding:10px 18px;"><a href="#" class="link-add" id="btnCbPjAdd">${icon('plus',13)} Tambah Penanggung Jawab</a></div>
    </div>`;
}

function tplCbPjRows(list){
  if(!list.length) return `<tr><td colspan="4" style="color:var(--text-light);">Belum ada Penanggung Jawab ditambahkan</td></tr>`;
  return list.map((p,i)=>`
    <tr>
      <td><input type="text" data-pj-nama="${i}" value="${p.nama||''}" placeholder="Nama Penanggung Jawab"></td>
      <td><select data-pj-jabatan="${i}">${CB_JABATAN_LIST.map(j=>`<option ${j===p.jabatan?'selected':''}>${j}</option>`).join('')}</select></td>
      <td>
        <div class="tag-box" id="cbPjKatBox_${i}">${tplCbPjKatTags(p.kategoriBarang, i)}</div>
        <a href="#" class="link-add" data-pj-kat-add="${i}" style="margin-top:4px;display:inline-block;">${icon('plus',12)} Tambah</a>
      </td>
      <td><button class="icon-btn del" data-pj-del="${i}" title="Hapus">${icon('trash',14)}</button></td>
    </tr>`).join('');
}

function tplCbPjKatTags(kategoriBarang, i){
  if(!kategoriBarang || !kategoriBarang.length) return `<span style="font-size:11.5px;color:var(--text-light);">Belum ada kategori dipilih</span>`;
  return kategoriBarang.map((kode,ki)=>{
    const k = DATA.kategoriBarang.find(k=>k.kode===kode);
    return `<span class="tag-chip">${k?k.nama:kode}<span class="rm" data-pj-kat-rm="${i}:${ki}">&times;</span></span>`;
  }).join('');
}

function tplCbPjKatPickerModal(list, already, rowIdx){
  return `
    <div class="modal-box" style="max-width:420px;">
      <div class="modal-header"><span>Tambah Kategori Barang</span><span class="close" id="modalClose">&times;</span></div>
      <div class="modal-body">
        <div class="table-wrap"><table>
          <thead><tr><th>Kategori Barang</th><th></th></tr></thead>
          <tbody>${list.map(k=>`<tr><td>${k.nama}</td><td>${already.includes(k.kode)?'<span style="font-size:11px;color:var(--text-light);">Sudah dipilih</span>':`<button class="btn-pick" data-pj-kat-pick="${k.kode}" data-pj-kat-row="${rowIdx}">Pilih</button>`}</td></tr>`).join('')}</tbody>
        </table></div>
      </div>
      <div class="modal-footer"><button class="btn-secondary" id="modalCancel">Tutup</button></div>
    </div>`;
}

/* ===== Tab 5: Informasi Izin Cabang — field lisensi FMCG distributor
   (NIB/SIUP/TDG) MENGGANTI field lisensi farmasi asli (No. Izin PBF/
   DAK/Apoteker) karena tidak relevan utk distributor sembako — lihat
   catatan lengkap di atas DATA.cabangMaster (js/data.js). ===== */
function tplCbIzinPanel(row){
  const iz = row.izinCabang;
  return `
    <div class="card" style="box-shadow:none;border:1px solid var(--border);padding:0;">
      <div class="card-header dark-header"><h3>${icon('shield',14)} Informasi Izin Cabang</h3></div>
      <table class="field-table" style="margin:0;border:none;">
        <tr>
          <td class="flabel">No. NIB</td>
          <td><input type="text" id="fCbNib" value="${iz.noNib||''}"></td>
          <td class="flabel">Tanggal NIB</td>
          <td><input type="text" id="fCbTglNib" value="${iz.tglNib||''}" placeholder="DD/MM/YYYY"></td>
        </tr>
        <tr>
          <td class="flabel">No. SIUP</td>
          <td><input type="text" id="fCbSiup" value="${iz.noSiup||''}"></td>
          <td class="flabel">Tanggal SIUP</td>
          <td><input type="text" id="fCbTglSiup" value="${iz.tglSiup||''}" placeholder="DD/MM/YYYY"></td>
        </tr>
        <tr>
          <td class="flabel">No. TDG (Tanda Daftar Gudang)</td>
          <td><input type="text" id="fCbTdg" value="${iz.noTdg||''}"></td>
          <td class="flabel">Tanggal TDG</td>
          <td><input type="text" id="fCbTglTdg" value="${iz.tglTdg||''}" placeholder="DD/MM/YYYY"></td>
        </tr>
        <tr>
          <td class="flabel">Berlaku Sampai</td>
          <td><input type="text" id="fCbBerlakuSampai" value="${iz.berlakuSampai||''}" placeholder="DD/MM/YYYY"></td>
          <td class="flabel">Status Perizinan</td>
          <td>
            <select id="fCbStatusPerizinan">
              ${['Aktif','Dalam Proses','Non-Aktif'].map(s=>`<option ${s===iz.statusPerizinan?'selected':''}>${s}</option>`).join('')}
            </select>
          </td>
        </tr>
      </table>
    </div>`;
}

/* ===== Tab 6: Jurnal R/K — 2 akun picker (pola sama seperti Rincian
   Jurnal Akun), default menaut ke akun R/K yang SUDAH ADA persis di
   DATA.akunGL (1120002 Piutang R/K Cabang & 2110003 Hutang R/K
   Cabang). ===== */
const CB_RK_FIELDS = [
  {key:'akunPiutangRK', label:'Akun Piutang R/K Cabang'},
  {key:'akunHutangRK', label:'Akun Hutang R/K Cabang'},
];

function tplCbRkAkunRow(f, row){
  const kode = row.jurnalRK[f.key] || '';
  return `
    <tr>
      <td class="jp-label">${f.label}</td>
      <td class="jp-input">
        <div class="input-with-btn">
          <input type="text" id="fCbRk_${f.key}" value="${kode}" placeholder="Pilih Akun" readonly>
          <button type="button" class="icon-btn edit" data-cb-akun-search="${f.key}" title="Cari Akun">${icon('search',14)}</button>
          <button type="button" class="icon-btn del" data-cb-akun-clear="${f.key}" title="Hapus">${icon('trash',14)}</button>
        </div>
      </td>
      <td class="jp-nama" id="fCbRkNama_${f.key}">${cbAkunNama(kode)}</td>
    </tr>`;
}

function tplCbRkPanel(row){
  return `
    <div class="card" style="box-shadow:none;border:1px solid var(--border);padding:16px 18px;">
      <table class="jp-akun-table">
        ${CB_RK_FIELDS.map(f=>tplCbRkAkunRow(f,row)).join('')}
      </table>
    </div>`;
}

function tplCbDeleteConfirm(row){
  return `
    <div class="modal-box">
      <div class="modal-header"><span>Hapus Cabang</span><span class="close" id="modalClose">&times;</span></div>
      <div class="modal-body"><p>Yakin ingin menghapus cabang <b>${row.kode}</b> — ${row.nama}?</p></div>
      <div class="modal-footer">
        <button class="btn-secondary" id="modalCancel">Batal</button>
        <button class="btn-danger" id="modalDelete">Hapus</button>
      </div>
    </div>`;
}

/* Modal informasi dekoratif "Update Cabang ke Master Customer" —
   sesuai pola "process button tanpa efek nyata" di Administrasi
   Bulanan (adminBulanan.js), TAPI pakai modal custom (bukan native
   confirm()) supaya konsisten dgn kebijakan umum mockup ini "hindari
   alert/confirm/prompt bawaan browser" (lihat komentar jpValidationError
   di jurnal-pembelian.js). Tombol ini di MASERP asli mensinkronkan data
   cabang ke Master Customer (tiap cabang punya 1 baris customer
   internal utk transaksi antar-cabang) — di luar cakupan mockup utk
   benar-benar memutasi DATA.customers, jadi cukup ditampilkan sebagai
   simulasi informatif. */
function tplCbSyncCustomerModal(){
  return `
    <div class="modal-box">
      <div class="modal-header"><span>Update Cabang ke Master Customer</span><span class="close" id="modalClose">&times;</span></div>
      <div class="modal-body"><p>Proses ini akan menyinkronkan ${DATA.cabangMaster.length} data Cabang menjadi baris Customer internal (utk transaksi antar-cabang/R-K) di Master Customer. (Contoh tampilan mockup — proses sinkronisasi sungguhan membutuhkan logic backend di luar cakupan mockup ini.)</p></div>
      <div class="modal-footer">
        <button class="btn-primary" id="modalOk">Mengerti</button>
      </div>
    </div>`;
}
