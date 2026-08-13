/* =========================================================
   TEMPLATE (HTML saja) — Kategori Barang (Persediaan Barang >
   Master & Setting). Semua fungsi di file ini HANYA menyusun &
   mengembalikan markup HTML (string), TIDAK ada logic/DOM-
   binding/data mutation di sini. Logic-nya ada di file sebelah:
   kategori-barang.js

   Sesuai 2 screenshot MASERP yang dikirim user 2026-08-11: "Daftar
   Kategori Barang" (list) dan "Kategori Barang" (form Tambah/Ubah,
   full page — field-nya cukup banyak: Kategori Induk, sub-grid
   Grup Customer, dan 17 field Akun GL, jadi ikut pola Master
   Supplier/Jurnal Pembelian: full page bukan modal). Field akun
   pakai picker modal dari DATA.akunGL dengan live search, reuse
   PERSIS pola tplJpAkunPicker/openJpAkunPicker di Jurnal Pembelian
   (class CSS .jp-akun-table/.jp-label/.jp-input/.jp-nama dipakai
   ulang apa adanya, TIDAK ada CSS baru untuk bagian ini). Sub-grid
   Grup Customer reuse pola sub-grid relasi "Pusat Bisnis Supplier"
   di Master Supplier / "Kode Divisi" di Business Centre, sekarang
   relasinya ke DATA.customerGroup (baru, lihat js/data.js).
========================================================= */

/* 17 field akun, TANPA dikelompokkan per section (beda dari Jurnal
   Pembelian/Penjualan yang punya sub-judul) — persis screenshot yang
   menampilkannya sebagai satu daftar panjang berurutan. */
const KB_AKUN_FIELDS = [
  { key:'akunDiskonPembelian', label:'Akun Diskon Pembelian' },
  { key:'akunPembelianJasa', label:'Akun Pembelian Jasa' },
  { key:'akunDiskonPembelianJasa', label:'Akun Diskon Pembelian Jasa' },
  { key:'akunPenjualan', label:'Akun Penjualan' },
  { key:'akunDiskonPrincipal', label:'Akun Diskon Principal' },
  { key:'akunDiskonDistributor', label:'Akun Diskon Distributor' },
  { key:'akunDiskonSelisihHna', label:'Akun Diskon Selisih HNA & HNA1' },
  { key:'akunPenjualanJasa', label:'Akun Penjualan Jasa' },
  { key:'akunDiskonPenjualanJasa', label:'Akun Diskon Penjualan Jasa' },
  { key:'akunSalesRefund', label:'Akun Sales Refund' },
  { key:'akunReturDiskonPrincipal', label:'Akun Retur Diskon Principal' },
  { key:'akunReturDiskonDistributor', label:'Akun Retur Diskon Distributor' },
  { key:'akunStokPersediaan', label:'Akun Stok Persediaan' },
  { key:'akunHpp', label:'Akun HPP' },
  { key:'akunHppRetur', label:'Akun HPP Retur' },
  { key:'akunPersediaanReject', label:'Akun Persediaan Reject' },
  { key:'akunPersediaanIntransit', label:'Akun Persediaan Intransit' },
];

function kbAkunNama(kode){
  if(!kode) return '';
  const a = DATA.akunGL.find(x=>x.kode===kode);
  return a ? a.nama : '';
}

function tplKategoriBarangListPage(){
  return `
    <div class="breadcrumb">Home / <b>Kategori Barang</b></div>
    <div class="card">
      <div class="card-header dark-header">
        <h3>${icon('box',15)} Daftar Kategori Barang</h3>
        <button class="btn-primary" id="btnKbAdd">${icon('plus',14)} Tambah</button>
      </div>
      <div class="table-toolbar">
        <select><option selected>10</option><option>25</option><option>50</option></select>
        <input type="text" placeholder="Pencarian Global">
      </div>
      <div class="table-wrap"><table>
        <thead><tr>
          <th>Kode Kategori</th>
          <th>Nama Kategori</th>
          <th>Keterangan</th>
          <th>Ubah</th>
          <th>Hapus</th>
        </tr></thead>
        <tbody id="kbTbody"></tbody>
      </table></div>
      <div class="table-footer"><div class="pager"><button>First</button><button>Previous</button><button class="active">1</button><button>Next</button><button>Last</button></div><div id="kbTotal"></div></div>
    </div>`;
}

function tplKbRows(rows){
  return rows.map((r,i)=>`
    <tr>
      <td>${r.kode}</td>
      <td>${r.nama}</td>
      <td>${r.keterangan||''}</td>
      <td><button class="icon-btn edit" data-edit="${i}" title="Ubah">${icon('edit',15)}</button></td>
      <td><button class="icon-btn del" data-del="${i}" title="Hapus">${icon('trash',15)}</button></td>
    </tr>`).join('');
}

function tplKbGrupRows(rows){
  return `
    <div class="table-wrap"><table>
      <thead><tr><th>Kode Customer Group</th><th>Nama Customer Group</th><th></th></tr></thead>
      <tbody>
        ${rows.length ? rows.map((d,i)=>`
          <tr>
            <td><div class="input-with-btn"><input type="text" value="${d.kode||''}" readonly><button type="button" class="icon-btn edit" data-kbg-search="${i}" title="Cari Customer Group">${icon('search',14)}</button></div></td>
            <td><input type="text" value="${d.nama||'None'}" readonly></td>
            <td><button class="icon-btn del" data-kbg-rm="${i}" title="Hapus baris">${icon('trash',14)}</button></td>
          </tr>`).join('') : '<tr><td colspan="3" style="color:var(--text-light);">Belum ada customer group ditambahkan</td></tr>'}
      </tbody>
    </table></div>`;
}

function tplKbGrupPicker(list){
  return `
    <div class="modal-box">
      <div class="modal-header"><span>Pilih Customer Group</span><span class="close" id="pickerClose">&times;</span></div>
      <div class="modal-body">
        <div class="table-wrap"><table>
          <thead><tr><th>Kode</th><th>Nama</th><th></th></tr></thead>
          <tbody>
            ${list.map(d=>`<tr><td>${d.kode}</td><td>${d.nama||'None'}</td><td><button class="btn-secondary btn-pick" data-pick="${d.kode}">Pilih</button></td></tr>`).join('')}
          </tbody>
        </table></div>
      </div>
      <div class="modal-footer"><button class="btn-secondary" id="pickerCancel">Tutup</button></div>
    </div>`;
}

function tplKbAkunRow(f, row){
  const kode = row[f.key] || '';
  const nama = kbAkunNama(kode);
  return `
    <tr>
      <td class="jp-label">${f.label}</td>
      <td class="jp-input">
        <div class="input-with-btn">
          <input type="text" id="fKb_${f.key}" value="${kode}" placeholder="Pilih Akun" readonly>
          <button type="button" class="icon-btn edit" data-akun-search="${f.key}" title="Cari Akun">${icon('search',14)}</button>
          <button type="button" class="icon-btn del" data-akun-clear="${f.key}" title="Hapus">${icon('trash',14)}</button>
        </div>
      </td>
      <td class="jp-nama" id="fKbNama_${f.key}">${nama}</td>
    </tr>`;
}

function tplKategoriBarangForm(mode, row){
  const isEdit = mode === 'edit';
  return `
    <div class="breadcrumb">Home / Kategori Barang / <b>${isEdit ? 'Ubah' : 'Tambah'}</b></div>
    <div class="card">
      <div class="card-header dark-header">
        <h3>${icon(isEdit ? 'edit' : 'plus', 15)} ${isEdit ? 'Ubah' : 'Tambah'} Kategori Barang</h3>
        <button class="btn-danger" id="btnKbTutorial">${icon('card',14)} Tutorial</button>
      </div>
      <div class="card-body">
        <table class="field-table">
          <tr>
            <td class="flabel">Kode Kategori</td>
            <td><input type="text" id="fKbKode" value="${row.kode||''}" placeholder="Contoh: CATSMB" ${isEdit ? 'disabled' : ''}></td>
          </tr>
          <tr>
            <td class="flabel">Nama Kategori</td>
            <td><input type="text" id="fKbNama" value="${row.nama||''}" placeholder="Contoh: Sembako"></td>
          </tr>
          <tr>
            <td class="flabel">Keterangan</td>
            <td><input type="text" id="fKbKeterangan" value="${row.keterangan||''}" placeholder="Contoh: Product Category"></td>
          </tr>
          <tr>
            <td class="flabel">Kategori Induk</td>
            <td>
              <div class="field-pair">
                <select id="fKbIndukKategori" style="flex:1;">
                  <option value="">-</option>
                  ${DATA.kategoriIndukList.map(k=>`<option ${row.kategoriInduk===k?'selected':''}>${k}</option>`).join('')}
                </select>
                <button type="button" class="icon-btn del" id="btnKbIndukClear" title="Hapus">${icon('trash',14)}</button>
              </div>
            </td>
          </tr>
        </table>

        <div class="form-section">${icon('users',15)} Grup Customer</div>
        <div id="kbGrupWrap"></div>
        <a href="#" id="kbGrupAddRow" class="link-add">${icon('plus',13)} Tambah</a>

        <table class="jp-akun-table" style="margin-top:22px;">
          ${KB_AKUN_FIELDS.map(f=>tplKbAkunRow(f,row)).join('')}
        </table>

        <div class="form-page-actions">
          <button class="btn-secondary" id="kbCancel">Batalkan</button>
          <button class="btn-primary" id="kbSave">Simpan</button>
        </div>
      </div>
    </div>`;
}

function tplKbAkunPicker(list, fieldKey){
  return `
    <div class="modal-box" style="max-width:640px;">
      <div class="modal-header"><span>Pilih Akun GL</span><span class="close" id="modalClose">&times;</span></div>
      <div class="modal-body">
        <input type="text" id="kbAkunPickerSearch" placeholder="Cari kode / nama akun..." style="width:100%;border:1px solid var(--border);border-radius:6px;padding:8px 10px;font-size:12.8px;margin-bottom:12px;">
        <div class="table-wrap" style="max-height:360px;overflow:auto;">
          <table>
            <thead><tr><th>Kode</th><th>Nama Akun</th><th>Kat.</th><th></th></tr></thead>
            <tbody id="kbAkunPickerBody">${tplKbAkunPickerRows(list, fieldKey)}</tbody>
          </table>
        </div>
      </div>
      <div class="modal-footer">
        <button class="btn-secondary" id="modalCancel">Tutup</button>
      </div>
    </div>`;
}

function tplKbAkunPickerRows(list, fieldKey){
  if(!list.length) return `<tr><td colspan="4" style="color:var(--text-light);">Tidak ada akun ditemukan</td></tr>`;
  return list.map(a=>`
    <tr>
      <td>${a.kode}</td>
      <td>${a.nama}</td>
      <td>${a.kategori}</td>
      <td><button class="btn-pick" data-pick-akun="${a.kode}" data-pick-field="${fieldKey}">Pilih</button></td>
    </tr>`).join('');
}

function tplKbDeleteConfirm(row){
  return `
    <div class="modal-box">
      <div class="modal-header"><span>Hapus Kategori Barang</span><span class="close" id="modalClose">&times;</span></div>
      <div class="modal-body"><p>Yakin ingin menghapus kategori <b>${row.kode}</b> — ${row.nama}?</p></div>
      <div class="modal-footer">
        <button class="btn-secondary" id="modalCancel">Batal</button>
        <button class="btn-danger" id="modalDelete">Hapus</button>
      </div>
    </div>`;
}

function tplKbInfoModal(title,text){
  return `
    <div class="modal-box">
      <div class="modal-header"><span>${title}</span><span class="close" id="modalClose">&times;</span></div>
      <div class="modal-body"><p>${text}</p></div>
      <div class="modal-footer">
        <button class="btn-primary" id="modalOk">Mengerti</button>
      </div>
    </div>`;
}
