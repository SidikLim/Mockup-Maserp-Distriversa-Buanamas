/* =========================================================
   TEMPLATE (HTML saja) — Grup Customer (Customer & Penjualan >
   Master & Setting). Semua fungsi di file ini HANYA menyusun &
   mengembalikan markup HTML (string), TIDAK ada logic/DOM-
   binding/data mutation di sini. Logic-nya ada di file sebelah:
   customer-group.js

   Sesuai 2 screenshot MASERP yang dikirim user 2026-08-11: "Grup
   Customer" (list) dan "Grup Customer" (form Ubah ACS/Apotek
   Chain Store, full page). CRUD PENUH. Bagian paling khas dari
   modul ini: 6 checkbox "Legalitas ..." di atas, dan tiap kali
   sebuah checkbox dicentang, sebuah section sub-grid "Syarat
   Customer Grup" terkait langsung muncul di bawahnya (live,
   tanpa perlu Simpan dulu) — reuse pola sub-grid relasi dari
   Business Centre/Master Supplier/Kategori Barang, tapi kali ini
   ada 6 sub-grid berbeda yang show/hide dinamis berdasar state
   checkbox. Section "Badan Usaha" di bagian paling bawah SELALU
   tampil (tidak digerbang checkbox apa pun).
========================================================= */

/* Mata Uang dropdown di form — dipakai apa adanya (IDR/USD), sama
   seperti dropdown Mata Uang di form Master Supplier. */
const CG_MATA_UANG_LIST = ['IDR','USD'];

/* Konfigurasi 6 section "Legalitas ..." — dipakai bersama oleh template
   (render checkbox & section) dan logic (wiring show/hide + sub-grid). */
const CG_LEGALITAS_SECTIONS = [
  { key:'legalitasOutlet', label:'Legalitas Outlet', rowsKey:'outletSyarat' },
  { key:'legalitasPenanggungJawab', label:'Legalitas Penanggung Jawab', rowsKey:'pjSyarat' },
  { key:'legalitasAsisten1', label:'Legalitas Asisten / Pendamping Penanggung Jawab 1', rowsKey:'asisten1Syarat' },
  { key:'legalitasAsisten2', label:'Legalitas Asisten / Pendamping Penanggung Jawab 2', rowsKey:'asisten2Syarat' },
  { key:'legalitasAsisten3', label:'Legalitas Asisten / Pendamping Penanggung Jawab 3', rowsKey:'asisten3Syarat' },
  { key:'legalitasPemilik', label:'Legalitas Pemilik / Pimpinan', rowsKey:'pemilikSyarat' },
];

function tplCustomerGroupListPage(){
  return `
    <div class="breadcrumb">Home / <b>Grup Customer</b></div>
    <div class="card">
      <div class="card-header dark-header">
        <h3>${icon('users',15)} Grup Customer</h3>
        <div class="toolbar-actions">
          <button class="btn-warning" id="btnCgGenerate">${icon('refreshCw',14)} Generate Customer Group ke Customer Type</button>
          <button class="btn-primary" id="btnCgAdd">${icon('plus',14)} Tambah</button>
        </div>
      </div>
      <div class="table-toolbar">
        <select><option selected>10</option><option>25</option><option>50</option></select>
        <input type="text" placeholder="Pencarian Global">
      </div>
      <div class="table-wrap"><table>
        <thead><tr>
          <th>Kode Grup Customer</th>
          <th>Nama Grup Customer</th>
          <th class="text-right">Diskon #1</th>
          <th class="text-right">Diskon #2</th>
          <th>Ubah</th>
          <th>Hapus</th>
        </tr></thead>
        <tbody id="cgTbody"></tbody>
      </table></div>
      <div class="table-footer"><div class="pager"><button>First</button><button>Previous</button><button class="active">1</button><button>Next</button><button>Last</button></div><div id="cgTotal"></div></div>
    </div>`;
}

function tplCgRows(rows){
  return rows.map((r,i)=>`
    <tr>
      <td>${r.kode}</td>
      <td>${r.nama || 'None'}</td>
      <td class="text-right">${Number(r.diskon1||0).toLocaleString('id-ID',{minimumFractionDigits:2,maximumFractionDigits:2})}%</td>
      <td class="text-right">${Number(r.diskon2||0).toLocaleString('id-ID',{minimumFractionDigits:2,maximumFractionDigits:2})}%</td>
      <td><button class="icon-btn edit" data-edit="${i}" title="Ubah">${icon('edit',15)}</button></td>
      <td><button class="icon-btn del" data-del="${i}" title="Hapus">${icon('trash',15)}</button></td>
    </tr>`).join('');
}

function tplCgSyaratRows(rowsKey, rows){
  return `
    <div class="table-wrap"><table>
      <thead><tr><th style="width:50px;">No.</th><th>Kode</th><th>Nama</th><th></th></tr></thead>
      <tbody>
        ${rows.length ? rows.map((d,i)=>`
          <tr>
            <td>${i+1}</td>
            <td><div class="input-with-btn"><input type="text" value="${d.kode||''}" readonly><button type="button" class="icon-btn edit" data-cg-search="${rowsKey}:${i}" title="Cari Syarat Customer Grup">${icon('search',14)}</button></div></td>
            <td><input type="text" value="${d.nama||'None'}" readonly></td>
            <td><button class="icon-btn del" data-cg-rm="${rowsKey}:${i}" title="Hapus baris">${icon('trash',14)}</button></td>
          </tr>`).join('') : '<tr><td colspan="4" style="color:var(--text-light);">Belum ada syarat customer grup ditambahkan</td></tr>'}
      </tbody>
    </table></div>
    <a href="#" data-cg-add="${rowsKey}" class="link-add">${icon('plus',13)} Tambah Syarat Customer Grup</a>`;
}

function tplCgLegalitasSection(sec, rows){
  return `
    <div class="form-section">${sec.label} :</div>
    <div data-cg-section="${sec.rowsKey}">${tplCgSyaratRows(sec.rowsKey, rows)}</div>`;
}

function tplCgLegalitasSectionsWrap(row){
  const visible = CG_LEGALITAS_SECTIONS.filter(sec => row[sec.key]);
  return visible.map(sec => tplCgLegalitasSection(sec, row[sec.rowsKey] || [])).join('');
}

function tplCgSyaratPicker(list, rowsKey, idx){
  return `
    <div class="modal-box">
      <div class="modal-header"><span>Pilih Syarat Customer Grup</span><span class="close" id="pickerClose">&times;</span></div>
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

function tplCgBuRows(rows){
  return `
    <div class="table-wrap"><table>
      <thead><tr><th>Kode</th><th>Nama</th><th></th></tr></thead>
      <tbody>
        ${rows.length ? rows.map((d,i)=>`
          <tr>
            <td><div class="input-with-btn"><input type="text" value="${d.kode||''}" readonly><button type="button" class="icon-btn edit" data-cg-bu-search="${i}" title="Cari Badan Usaha">${icon('search',14)}</button></div></td>
            <td><input type="text" value="${d.nama||'None'}" readonly></td>
            <td><button class="icon-btn del" data-cg-bu-rm="${i}" title="Hapus baris">${icon('trash',14)}</button></td>
          </tr>`).join('') : '<tr><td colspan="3" style="color:var(--text-light);">Belum ada badan usaha ditambahkan</td></tr>'}
      </tbody>
    </table></div>`;
}

function tplCgBuPicker(list){
  return `
    <div class="modal-box">
      <div class="modal-header"><span>Pilih Badan Usaha</span><span class="close" id="pickerClose">&times;</span></div>
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

function tplCustomerGroupForm(mode, row){
  const isEdit = mode === 'edit';
  return `
    <div class="breadcrumb">Home / Grup Customer / <b>${isEdit ? 'Ubah' : 'Tambah'}</b></div>
    <div class="card">
      <div class="card-header dark-header">
        <h3>${icon(isEdit ? 'edit' : 'plus', 15)} ${isEdit ? 'Ubah' : 'Tambah'} Grup Customer</h3>
        <button class="btn-danger" id="btnCgTutorial">${icon('card',14)} Tutorial</button>
      </div>
      <div class="card-body">
        <h3 style="color:var(--navy);font-size:14px;font-weight:700;padding-bottom:10px;border-bottom:1px solid var(--border);margin-bottom:18px;">Informasi Grup Customer</h3>

        <div class="form-group">
          <label>Kode Grup Customer</label>
          <input type="text" id="fCgKode" value="${row.kode||''}" placeholder="Contoh: ACS" ${isEdit ? 'disabled' : ''}>
        </div>
        <div class="form-group">
          <label>Nama Grup Customer</label>
          <input type="text" id="fCgNama" value="${row.nama||''}" placeholder="Contoh: APOTEK CHAIN STORE">
        </div>
        <div class="form-group">
          <label>Mata Uang</label>
          <select id="fCgMataUang">${CG_MATA_UANG_LIST.map(m=>`<option ${row.mataUang===m?'selected':''}>${m}</option>`).join('')}</select>
        </div>
        <div class="form-group">
          <label>Alamat</label>
          <textarea id="fCgAlamat" rows="2" placeholder="Alamat">${row.alamat||''}</textarea>
        </div>
        <div class="form-group">
          <label>Telepon</label>
          <input type="text" id="fCgTelepon" value="${row.telepon||''}" placeholder="Contoh: (021) 645 66 33">
        </div>
        <div class="form-group">
          <label>Fax</label>
          <input type="text" id="fCgFax" value="${row.fax||''}" placeholder="No. Fax">
        </div>
        <div class="form-group">
          <label>Kontak Person</label>
          <input type="text" id="fCgKontakPerson" value="${row.kontakPerson||''}">
        </div>
        <div class="form-group">
          <label>Default Min batas kredit</label>
          <input type="text" id="fCgMinBatasKredit" value="${Number(row.minBatasKredit||0).toLocaleString('id-ID',{minimumFractionDigits:2,maximumFractionDigits:2})}" style="text-align:right;">
        </div>

        <div class="checkbox-row"><input type="checkbox" id="fCgDominasi" ${row.dominasi?'checked':''}><label for="fCgDominasi">Harus menggunakan Dominasi</label></div>
        ${CG_LEGALITAS_SECTIONS.map(sec=>`
        <div class="checkbox-row"><input type="checkbox" id="fCg_${sec.key}" data-cg-legalitas-toggle ${row[sec.key]?'checked':''}><label for="fCg_${sec.key}">${sec.label}</label></div>`).join('')}

        <div id="cgLegalitasSectionsWrap">${tplCgLegalitasSectionsWrap(row)}</div>

        <div class="form-section">${icon('folder',15)} Badan Usaha</div>
        <div id="cgBuWrap"></div>
        <a href="#" id="cgBuAddRow" class="link-add">${icon('plus',13)} Tambah Badan Usaha</a>

        <div class="form-page-actions">
          <button class="btn-secondary" id="cgCancel">Batalkan</button>
          <button class="btn-primary" id="cgSave">Simpan</button>
        </div>
      </div>
    </div>`;
}

function tplCgDeleteConfirm(row){
  return `
    <div class="modal-box">
      <div class="modal-header"><span>Hapus Grup Customer</span><span class="close" id="modalClose">&times;</span></div>
      <div class="modal-body"><p>Yakin ingin menghapus grup customer <b>${row.kode}</b> — ${row.nama||'None'}?</p></div>
      <div class="modal-footer">
        <button class="btn-secondary" id="modalCancel">Batal</button>
        <button class="btn-danger" id="modalDelete">Hapus</button>
      </div>
    </div>`;
}

function tplCgInfoModal(title,text){
  return `
    <div class="modal-box">
      <div class="modal-header"><span>${title}</span><span class="close" id="modalClose">&times;</span></div>
      <div class="modal-body"><p>${text}</p></div>
      <div class="modal-footer">
        <button class="btn-primary" id="modalOk">Mengerti</button>
      </div>
    </div>`;
}
