/* =========================================================
   TEMPLATE (HTML saja) — Master User (menu User Security > Master User,
   page:'users' — SEBELUMNYA renderer generik lewat objek `pages` di
   js/core.js dengan field lama nama/username/role/status; entry generik
   itu DIHAPUS [lihat js/core.js], diganti modul CRUD PENUH ini). Semua
   fungsi di file ini HANYA menyusun & mengembalikan markup HTML (string),
   TIDAK ada logic/DOM-binding/data mutation — logic-nya ada di file
   sebelah: master-user.js.

   Sesuai 2 screenshot MASERP yang dikirim user 2026-08-18: "Daftar User
   Profile" (list: dark header + tombol "+Add" & "Tutorial" merah, toolbar
   page-size(10 default)+Pencarian Global, kolom Username/Name/User Role/
   Cabang/Edit/Delete, pager STANDAR [First/Previous/nomor halaman/Next/
   Last, SEKARANG FUNGSIONAL SUNGGUHAN — beda dari kebanyakan modul lain
   yang pager standarnya dekoratif], "Total Record: 93") dan "User Form"
   (Tambah: User Name, Nama, Email [+teks validasi merah PERMANEN "Email
   diperlukan untuk fitur chat support..." — quirk direproduksi APA ADANYA
   dari screenshot], Level Pemakai dropdown, Password Terdahulu, New
   Password, "Pilih Akses Ke Perusahaan" [dekoratif, single-company],
   Cabang picker, Salesman dropdown, Rayon picker, Area picker, Sales
   Office picker, Signature upload 200x100+Hapus, sub-grid "Perusahaan |
   Bank | Hapus" + "+Tambah Item Baru", Simpan/Cancel).

   Form pakai pola FULL PAGE (sama seperti Master Rayon/Wilayah/Group User).
========================================================= */

/* Daftar Level Pemakai — LOKAL khusus modul ini (BUKAN reference ke
   DATA.groupUser yang kode-nya beda screenshot/beda hari — lihat komentar
   besar di atas DATA.users di js/data.js kenapa keduanya sengaja
   dipisah). Kode PERSIS 3 yang tampak di screenshot list (SLS/ADM/IKS-HO)
   + kode tambahan yang dipakai 83 baris sample lain yang disusun sendiri. */
const USR_ROLE_LIST = [
  {kode:'ADM', nama:'Administrator'},
  {kode:'SLS', nama:'Sales'},
  {kode:'CSH', nama:'Kasir'},
  {kode:'GDG', nama:'Gudang'},
  {kode:'FIN', nama:'Finance'},
  {kode:'PJK', nama:'Pajak'},
  {kode:'PUR', nama:'Purchasing'},
  {kode:'MGR', nama:'Manager'},
  {kode:'DRV', nama:'Driver'},
  {kode:'ADG', nama:'Admin Gudang'},
  {kode:'IKS-HO', nama:'Instalasi Kesehatan HO'},
];

/* 8 cabang + kode, SAMA PERSIS mapping GDG_CABANG_LIST/GDG_CABANG_CODE di
   gudang.template.js (00=Head Office s.d. 07=Sidoarjo) — kode cabang ini
   dipakai APA ADANYA di kolom "Cabang" list & field "Pilih Cabang" form,
   konsisten dgn 3 kode yg tampak di screenshot (00/02/03). Cabang boleh
   kosong (blank) khusus role ADM (akses lintas cabang, sesuai screenshot
   admin/admin2/admin3). */
const USR_CABANG_LIST = [
  {kode:'00', nama:'Head Office'}, {kode:'01', nama:'Surabaya'}, {kode:'02', nama:'Bandung'},
  {kode:'03', nama:'Tangerang'}, {kode:'04', nama:'Medan'}, {kode:'05', nama:'Makassar'},
  {kode:'06', nama:'Semarang'}, {kode:'07', nama:'Sidoarjo'},
];

const USR_SOFFICE_LIST = ['Head Office','Surabaya','Bandung','Tangerang','Medan','Makassar','Semarang','Sidoarjo'];

const USR_PAGE_SIZE_DEFAULT = 10;

function tplMasterUserListPage(){
  return `
    <div class="breadcrumb">Home / <b>Master User</b></div>
    <div class="card">
      <div class="card-header dark-header">
        <h3>${icon('users',15)} Daftar User Profile</h3>
        <div class="toolbar-actions">
          <button class="btn-primary" id="btnUsrAdd">${icon('plus',14)} Add</button>
          <button class="btn-danger" id="btnUsrTutorial">${icon('eye',14)} Tutorial</button>
        </div>
      </div>
      <div class="table-toolbar" style="justify-content:flex-end;">
        <select id="usrPageSize"><option selected>10</option><option>25</option><option>50</option></select>
        <input type="text" id="usrSearch" placeholder="Pencarian Global">
      </div>
      <div class="table-wrap"><table>
        <thead><tr>
          <th>Username</th>
          <th>Name</th>
          <th>User Role</th>
          <th>Cabang</th>
          <th>Edit</th>
          <th>Delete</th>
        </tr></thead>
        <tbody id="usrTbody"></tbody>
      </table></div>
      <div class="table-footer"><div id="usrPagerWrap"></div><div id="usrTotal"></div></div>
    </div>`;
}

function tplUsrRows(rows){
  if(!rows.length) return `<tr><td colspan="6" style="color:var(--text-light);">Tidak Ada Data</td></tr>`;
  return rows.map(r=>{
    const i = DATA.users.indexOf(r);
    return `
    <tr>
      <td><b style="color:var(--blue);cursor:pointer;" data-edit="${i}">${r.username}</b></td>
      <td>${r.nama}</td>
      <td>${r.role}</td>
      <td>${r.cabangKode||''}</td>
      <td><button class="icon-btn edit" data-edit="${i}">${icon('edit',14)}</button></td>
      <td><button class="icon-btn del" data-del="${i}">${icon('trash',14)}</button></td>
    </tr>`;
  }).join('');
}

/* Pager list utama Master User — pager STANDAR (First/Previous/nomor
   halaman/Next/Last, gaya sama seperti `.pager` dekoratif dipakai modul
   lain), TAPI di sini genuinely FUNGSIONAL (mengikuti pola
   tplPersediaanPager() di core.js) karena 93 baris data & page-size
   beneran perlu dipaginasi, bukan cuma ilustrasi statis. */
function tplUsrPager(page, totalPages){
  let nums = '';
  for(let p = 1; p <= totalPages; p++){
    nums += `<button class="${p===page?'active':''}" data-usr-page="${p}">${p}</button>`;
  }
  return `<div class="pager">
    <button data-usr-first ${page<=1?'disabled':''}>First</button>
    <button data-usr-prev ${page<=1?'disabled':''}>Previous</button>
    ${nums}
    <button data-usr-next ${page>=totalPages?'disabled':''}>Next</button>
    <button data-usr-last ${page>=totalPages?'disabled':''}>Last</button>
  </div>`;
}

function tplMasterUserForm(mode, row){
  const title = mode==='add' ? '+ User Form' : 'User Form';
  return `
    <div class="breadcrumb">Home / Master User / <b>${title}</b></div>
    <div class="card">
      <div class="card-header dark-header"><h3>${icon('users',15)} ${title}</h3></div>
      <div class="card-body">
        <div class="form-grid">
          <div class="form-group">
            <label>User Name</label>
            <input type="text" id="fUsrUsername" value="${row.username}" ${mode==='edit'?'readonly style="background:#f2f3f6;color:var(--text-light);"':''}>
          </div>
          <div class="form-group">
            <label>Cabang</label>
            <div class="input-with-btn">
              <input type="text" id="fUsrCabangDisplay" value="${usrCabangNama(row.cabangKode)}" readonly style="background:#f2f3f6;">
              <button type="button" class="icon-btn view" id="btnUsrCabangSearch" title="Pilih Cabang">${icon('search',14)}</button>
            </div>
          </div>
          <div class="form-group">
            <label>Nama</label>
            <input type="text" id="fUsrNama" value="${row.nama}">
          </div>
          <div class="form-group">
            <label>Salesman</label>
            <select id="fUsrSalesman">
              <option value="" ${!row.salesman?'selected':''}>--Cari Salesman--</option>
              ${DATA.salesman.map(s=>`<option value="${s.nama}" ${s.nama===row.salesman?'selected':''}>${s.nama}</option>`).join('')}
            </select>
          </div>
          <div class="form-group" style="grid-column:1/-1;">
            <label>Email</label>
            <input type="email" id="fUsrEmail" value="${row.email||''}">
            <div style="color:var(--red);font-size:11.5px;margin-top:4px;">Email diperlukan untuk fitur chat support dan harap menggunakan alamat email yang valid !</div>
          </div>
          <div class="form-group">
            <label>Rayon</label>
            <div class="input-with-btn">
              <input type="text" id="fUsrRayonDisplay" value="${usrRayonNama(row.rayonKode)}" readonly style="background:#f2f3f6;">
              <button type="button" class="icon-btn view" id="btnUsrRayonSearch" title="Pilih Rayon">${icon('search',14)}</button>
            </div>
          </div>
          <div class="form-group">
            <label>&nbsp;</label>
          </div>
          <div class="form-group">
            <label>Area</label>
            <div class="input-with-btn">
              <input type="text" id="fUsrAreaDisplay" value="${usrAreaNama(row.areaKode)}" readonly style="background:#f2f3f6;">
              <button type="button" class="icon-btn view" id="btnUsrAreaSearch" title="Cari Area">${icon('search',14)}</button>
            </div>
          </div>
          <div class="form-group">
            <label>Level Pemakai</label>
            <select id="fUsrRole">${USR_ROLE_LIST.map(r=>`<option value="${r.kode}" ${r.kode===row.role?'selected':''}>${r.nama}</option>`).join('')}</select>
          </div>
          <div class="form-group">
            <label>Sales Office</label>
            <div class="input-with-btn">
              <input type="text" id="fUsrSofficeDisplay" value="${row.salesOffice||''}" readonly style="background:#f2f3f6;">
              <button type="button" class="icon-btn view" id="btnUsrSofficeSearch" title="Pilih Sales Office">${icon('search',14)}</button>
            </div>
          </div>
          <div class="form-group">
            <label>Password Terdahulu</label>
            <input type="password" id="fUsrPassOld" placeholder="Password Terdahulu">
          </div>
          <div class="form-group">
            <label>New Password</label>
            <input type="password" id="fUsrPassNew" placeholder="Password">
          </div>
          <div class="form-group" style="grid-column:1/-1;">
            <label>Pilih Akses Ke Perusahaan</label>
            <div class="input-with-btn">
              <input type="text" id="fUsrPerusahaanAkses" value="PT Distriversa Buanamas" readonly style="background:#f2f3f6;">
              <button type="button" class="icon-btn view" id="btnUsrAksesInfo" title="Pilih Perusahaan">${icon('search',14)}</button>
            </div>
          </div>
          <div class="form-group">
            <label>Signature</label>
            <div class="upload-box" id="fUsrSignatureBox" style="width:200px;height:100px;display:flex;align-items:center;justify-content:center;text-align:center;">${row.signature ? 'Signature Tersimpan' : '200 x 100'}</div>
            <div style="display:flex;gap:8px;margin-top:8px;">
              <button type="button" class="btn-teal" id="btnUsrSignatureUpload">${icon('plus',13)} Upload</button>
              <button type="button" class="btn-danger" id="btnUsrSignatureHapus">${icon('trash',13)} Hapus</button>
            </div>
          </div>
        </div>

        <div class="form-section" style="margin-top:6px;">
          <div class="table-wrap"><table>
            <thead><tr><th>Perusahaan</th><th>Bank</th><th style="width:70px;">Hapus</th></tr></thead>
            <tbody id="usrPbTbody">${tplUsrPbRows(row.perusahaanBank)}</tbody>
          </table></div>
          <div style="padding:10px 18px;"><a href="#" class="link-add" id="btnUsrPbAdd">${icon('plus',13)} Tambah Item Baru</a></div>
        </div>

        <div class="form-page-actions">
          <button class="btn-primary" id="usrSave">${icon('check',14)} Simpan</button>
          <button class="btn-outline" id="usrCancel">Cancel</button>
        </div>
      </div>
    </div>`;
}

function tplUsrPbRows(list){
  if(!list.length) return `<tr><td colspan="3" style="color:var(--text-light);">Belum ada item</td></tr>`;
  return list.map((p, i)=>`
    <tr>
      <td><input type="text" data-pb-perusahaan="${i}" value="${p.perusahaan||''}"></td>
      <td><select data-pb-bank="${i}">
        <option value="" ${!p.bank?'selected':''}>--Pilih Bank--</option>
        ${DATA.masterBankList.map(b=>`<option value="${b}" ${b===p.bank?'selected':''}>${b}</option>`).join('')}
      </select></td>
      <td><button class="icon-btn del" data-pb-del="${i}">${icon('trash',14)}</button></td>
    </tr>`).join('');
}

function usrCabangNama(kode){
  if(!kode) return '';
  const c = USR_CABANG_LIST.find(c=>c.kode===kode);
  return c ? `${c.kode} - ${c.nama}` : kode;
}
function usrRayonNama(kode){
  if(!kode) return '';
  const r = DATA.rayon.find(r=>r.kode===kode);
  return r ? r.nama : kode;
}
function usrAreaNama(kode){
  if(!kode) return '';
  const a = DATA.area.find(a=>a.kode===kode);
  return a ? a.nama : kode;
}

function tplUsrCabangPickerModal(){
  return `
    <div class="modal-box" style="max-width:360px;">
      <div class="modal-header"><span>Pilih Cabang</span><span class="close" id="modalClose">&times;</span></div>
      <div class="modal-body">
        <div class="table-wrap"><table><tbody>
          ${USR_CABANG_LIST.map(c=>`<tr><td>${c.kode}</td><td>${c.nama}</td><td style="text-align:right;"><button class="btn-pick" data-pick-cabang="${c.kode}">Pilih</button></td></tr>`).join('')}
        </tbody></table></div>
      </div>
      <div class="modal-footer"><button class="btn-secondary" id="modalCancel">Tutup</button></div>
    </div>`;
}

function tplUsrRayonPickerModal(){
  return `
    <div class="modal-box" style="max-width:420px;">
      <div class="modal-header"><span>Pilih Rayon</span><span class="close" id="modalClose">&times;</span></div>
      <div class="modal-body">
        <input type="text" id="usrRayonPickerSearch" placeholder="Cari kode/nama rayon..." style="width:100%;border:1px solid var(--border);border-radius:6px;padding:8px 10px;font-size:12.8px;margin-bottom:12px;">
        <div class="table-wrap" style="max-height:320px;overflow:auto;">
          <table><tbody id="usrRayonPickerBody">${tplUsrRayonPickerRows(DATA.rayon)}</tbody></table>
        </div>
      </div>
      <div class="modal-footer"><button class="btn-secondary" id="modalCancel">Tutup</button></div>
    </div>`;
}
function tplUsrRayonPickerRows(list){
  if(!list.length) return `<tr><td style="color:var(--text-light);">Tidak ditemukan</td></tr>`;
  return list.map(r=>`<tr><td>${r.kode}</td><td>${r.nama}</td><td style="text-align:right;"><button class="btn-pick" data-pick-rayon="${r.kode}">Pilih</button></td></tr>`).join('');
}

function tplUsrAreaPickerModal(){
  return `
    <div class="modal-box" style="max-width:420px;">
      <div class="modal-header"><span>Cari Area</span><span class="close" id="modalClose">&times;</span></div>
      <div class="modal-body">
        <div class="table-wrap" style="max-height:320px;overflow:auto;">
          <table><tbody>
            ${DATA.area.map(a=>`<tr><td>${a.kode}</td><td>${a.nama}</td><td style="text-align:right;"><button class="btn-pick" data-pick-area="${a.kode}">Pilih</button></td></tr>`).join('')}
          </tbody></table>
        </div>
      </div>
      <div class="modal-footer"><button class="btn-secondary" id="modalCancel">Tutup</button></div>
    </div>`;
}

function tplUsrSofficePickerModal(){
  return `
    <div class="modal-box" style="max-width:360px;">
      <div class="modal-header"><span>Pilih Sales Office</span><span class="close" id="modalClose">&times;</span></div>
      <div class="modal-body">
        <div class="table-wrap"><table><tbody>
          ${USR_SOFFICE_LIST.map(c=>`<tr><td>${c.toUpperCase()}</td><td style="text-align:right;"><button class="btn-pick" data-pick-soffice="${c.toUpperCase()}">Pilih</button></td></tr>`).join('')}
        </tbody></table>
      </div>
      <div class="modal-footer"><button class="btn-secondary" id="modalCancel">Tutup</button></div>
    </div>`;
}

function tplUsrAksesInfoModal(){
  return `
    <div class="modal-box" style="max-width:400px;">
      <div class="modal-header"><span>Pilih Perusahaan</span><span class="close" id="modalClose2">&times;</span></div>
      <div class="modal-body"><p>Mockup ini hanya mencakup 1 perusahaan (PT Distriversa Buanamas), jadi akses selalu ke perusahaan ini. Fitur multi-perusahaan di luar cakupan mockup.</p></div>
      <div class="modal-footer"><button class="btn-secondary" id="modalCancel2">Tutup</button></div>
    </div>`;
}

function tplUsrDeleteConfirm(row){
  return `
    <div class="modal-box">
      <div class="modal-header"><span>Hapus User</span><span class="close" id="modalClose">&times;</span></div>
      <div class="modal-body"><p>Yakin ingin menghapus user <b>${row.username}</b> — ${row.nama}?</p></div>
      <div class="modal-footer">
        <button class="btn-secondary" id="modalCancel">Batal</button>
        <button class="btn-danger" id="modalDelete">Hapus</button>
      </div>
    </div>`;
}
