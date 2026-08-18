/* =========================================================
   TEMPLATE (HTML saja) — Group User (menu User Security > Group User,
   page:'groupUser', bagian dari perbaikan submenu User Security — lihat
   js/menu.js & catatan besar di atas DATA.groupUser di js/data.js). Semua
   fungsi di file ini HANYA menyusun & mengembalikan markup HTML (string),
   TIDAK ada logic/DOM-binding/data mutation — logic-nya ada di file
   sebelah: group-user.js.

   Sesuai 3 screenshot MASERP yang dikirim user 2026-08-18: "Daftar Group
   Hak Akses" (list: dark header + tombol "+Add MNGR"/"+Add PURCH"/
   "+Add SALES"/"+Add" + tombol merah "Tutorial", toolbar page-size(20)+
   Pencarian Global, kolom User Role Code/Name/Description/Gudang/
   Administrator?/Edit/Delete, pager BARU gaya "First < [halaman] to Y Of
   Total > Last" — SAMA PERSIS gaya tplRyKecPager() di master-rayon.
   template.js, di sini dipakai ulang sebagai pager LIST UTAMA — lihat
   tplGuPager() di bawah & komentar .ry-kec-pager di css/style.css,
   "Total Record: 60") dan "Master User Role" (form Ubah: Kode User Role
   readonly abu-abu, Name, Keterangan, field "Pilih Gudang" input+tombol
   search yang buka modal checklist multi-pilih ke DATA.gudang, tombol
   "Duplicate Hak Akses dari Jabatan Lain" yang buka modal pilih role lain,
   checkbox "Is Administrator", Simpan/Cancel).

   Form pakai pola FULL PAGE (sama seperti Master Rayon/Master Wilayah).
========================================================= */

function tplGroupUserListPage(){
  return `
    <div class="breadcrumb">Home / <b>Group User</b></div>
    <div class="card">
      <div class="card-header dark-header">
        <h3>${icon('shield',15)} Daftar Group Hak Akses</h3>
        <div class="toolbar-actions">
          <button class="btn-primary" id="btnGuAddMngr">${icon('plus',13)} Add MNGR</button>
          <button class="btn-primary" id="btnGuAddPurch">${icon('plus',13)} Add PURCH</button>
          <button class="btn-primary" id="btnGuAddSales">${icon('plus',13)} Add SALES</button>
          <button class="btn-primary" id="btnGuAdd">${icon('plus',13)} Add</button>
          <button class="btn-danger" id="btnGuTutorial">${icon('eye',14)} Tutorial</button>
        </div>
      </div>
      <div class="table-toolbar" style="justify-content:flex-end;">
        <select id="guPageSize"><option>10</option><option selected>20</option><option>50</option></select>
        <input type="text" id="guSearch" placeholder="Pencarian Global">
      </div>
      <div class="table-wrap"><table>
        <thead><tr>
          <th>User Role Code</th>
          <th>Name</th>
          <th>Description</th>
          <th>Gudang</th>
          <th>Administrator?</th>
          <th>Edit</th>
          <th>Delete</th>
        </tr></thead>
        <tbody id="guTbody"></tbody>
      </table></div>
      <div class="table-footer" id="guPagerWrap"></div>
    </div>`;
}

function tplGuRows(rows){
  if(!rows.length) return `<tr><td colspan="7" style="color:var(--text-light);">Tidak Ada Data</td></tr>`;
  return rows.map(r=>{
    const i = DATA.groupUser.indexOf(r);
    return `
    <tr>
      <td><b style="color:var(--blue);cursor:pointer;" data-edit="${i}">${r.kode}</b></td>
      <td>${r.nama}</td>
      <td>${r.keterangan||''}</td>
      <td>${r.gudangKode.join(';')}</td>
      <td>${r.isAdmin ? `<span class="status-pill status-paid">Ya</span>` : `<span class="status-pill status-open">Tidak</span>`}</td>
      <td><button class="icon-btn edit" data-edit="${i}">${icon('edit',14)}</button></td>
      <td><button class="icon-btn del" data-del="${i}">${icon('trash',14)}</button></td>
    </tr>`;
  }).join('');
}

/* Pager list UTAMA Group User — reuse gaya "First < [halaman] to Y Of
   Total > Last" dari tplRyKecPager() (master-rayon.template.js), class
   CSS sama (.ry-kec-pager, lihat style.css). Sengaja fungsi terpisah
   (bukan panggil tplRyKecPager langsung) supaya group-user.template.js
   tetap independen dari lazy-load master-rayon.template.js. */
function tplGuPager(page, perPage, total){
  const lastPage = Math.max(1, Math.ceil(total/perPage));
  const end = total===0 ? 0 : Math.min(page*perPage, total);
  return `
    <div class="ry-kec-pager">
      <button id="guFirst" ${page<=1?'disabled':''}>First</button>
      <button id="guPrev" ${page<=1?'disabled':''}>&lt;</button>
      <input type="text" id="guPageInput" value="${page}">
      <span>to ${end} Of ${total}</span>
      <button id="guNext" ${page>=lastPage?'disabled':''}>&gt;</button>
      <button id="guLast" ${page>=lastPage?'disabled':''}>Last</button>
    </div>`;
}

function tplGroupUserForm(mode, row){
  const title = mode==='add' ? '+ Master User Role' : 'Master User Role';
  return `
    <div class="breadcrumb">Home / Group User / <b>${title}</b></div>
    <div class="card">
      <div class="card-header dark-header"><h3>${icon('shield',15)} ${title}</h3></div>
      <div class="card-body">
        <div class="form-grid">
          <div class="form-group">
            <label>Kode User Role</label>
            <input type="text" id="fGuKode" value="${row.kode}" readonly style="background:#f2f3f6;color:var(--text-light);">
          </div>
          <div class="form-group">
            <label>Name</label>
            <input type="text" id="fGuNama" value="${row.nama}">
          </div>
          <div class="form-group" style="grid-column:1/-1;">
            <label>Keterangan</label>
            <textarea id="fGuKeterangan" class="po-textarea" rows="2">${row.keterangan||''}</textarea>
          </div>
          <div class="form-group">
            <label>Pilih Gudang</label>
            <div class="input-with-btn">
              <input type="text" id="fGuGudang" value="${row.gudangKode.join(';')}" readonly style="background:#f2f3f6;">
              <button type="button" class="icon-btn view" id="btnGuGudangSearch" title="Pilih Gudang">${icon('search',14)}</button>
            </div>
          </div>
          <div class="form-group">
            <label>&nbsp;</label>
            <button type="button" class="btn-outline" id="btnGuDuplicate" style="width:100%;">${icon('refreshCw',14)} Duplicate Hak Akses dari Jabatan Lain</button>
          </div>
          <div class="form-group">
            <label>Is Administrator</label>
            <label class="checkbox-row" style="margin-top:8px;">
              <input type="checkbox" id="fGuAdmin" ${row.isAdmin?'checked':''}> <span id="fGuAdminLabel">${row.isAdmin?'Ya':'Tidak'}</span>
            </label>
          </div>
        </div>

        <div class="form-page-actions">
          <button class="btn-primary" id="guSave">${icon('check',14)} Simpan</button>
          <button class="btn-outline" id="guCancel">Cancel</button>
        </div>
      </div>
    </div>`;
}

/* Modal "Pilih Gudang" — MULTI-select (checklist), beda dari picker
   single-pick lain di app ini (mis. Sales Office/Kecamatan yang langsung
   close saat 1 opsi diklik). Di sini butuh tombol "Terapkan" eksplisit
   karena user bisa centang/uncentang banyak gudang sekaligus sebelum
   commit ke row.gudangKode. */
function tplGuGudangPickerModal(selected){
  return `
    <div class="modal-box" style="max-width:480px;">
      <div class="modal-header"><span>Pilih Gudang</span><span class="close" id="modalClose">&times;</span></div>
      <div class="modal-body">
        <div class="table-wrap" style="max-height:360px;overflow:auto;">
          <table><tbody id="guGudangPickerBody">${tplGuGudangPickerRows(selected)}</tbody></table>
        </div>
      </div>
      <div class="modal-footer">
        <button class="btn-secondary" id="modalCancel">Batal</button>
        <button class="btn-primary" id="guGudangApply">Terapkan</button>
      </div>
    </div>`;
}

function tplGuGudangPickerRows(selected){
  return DATA.gudang.map(g=>`
    <tr>
      <td style="width:30px;"><input type="checkbox" data-gudang-chk="${g.kode}" ${selected.includes(g.kode)?'checked':''} style="width:auto;"></td>
      <td>${g.kode}</td>
      <td>${g.nama}</td>
    </tr>`).join('');
}

function tplGuDuplicatePickerModal(currentKode){
  return `
    <div class="modal-box" style="max-width:520px;">
      <div class="modal-header"><span>Duplicate Hak Akses dari Jabatan Lain</span><span class="close" id="modalClose">&times;</span></div>
      <div class="modal-body">
        <input type="text" id="guDupSearch" placeholder="Cari kode/nama role..." style="width:100%;border:1px solid var(--border);border-radius:6px;padding:8px 10px;font-size:12.8px;margin-bottom:12px;">
        <div class="table-wrap" style="max-height:320px;overflow:auto;">
          <table><tbody id="guDupBody">${tplGuDuplicatePickerRows(DATA.groupUser, currentKode)}</tbody></table>
        </div>
      </div>
      <div class="modal-footer"><button class="btn-secondary" id="modalCancel">Tutup</button></div>
    </div>`;
}

function tplGuDuplicatePickerRows(list, currentKode){
  const rows = list.filter(r=>r.kode!==currentKode);
  if(!rows.length) return `<tr><td style="color:var(--text-light);">Tidak ditemukan</td></tr>`;
  return rows.map(r=>`
    <tr>
      <td>${r.kode}</td>
      <td>${r.nama}</td>
      <td style="text-align:right;"><button class="btn-pick" data-pick-dup="${r.kode}">Pilih</button></td>
    </tr>`).join('');
}

function tplGuDeleteConfirm(row){
  return `
    <div class="modal-box">
      <div class="modal-header"><span>Hapus Group User</span><span class="close" id="modalClose">&times;</span></div>
      <div class="modal-body"><p>Yakin ingin menghapus role <b>${row.kode}</b> — ${row.nama}?</p></div>
      <div class="modal-footer">
        <button class="btn-secondary" id="modalCancel">Batal</button>
        <button class="btn-danger" id="modalDelete">Hapus</button>
      </div>
    </div>`;
}
