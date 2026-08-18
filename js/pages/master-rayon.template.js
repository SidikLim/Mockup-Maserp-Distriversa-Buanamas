/* =========================================================
   TEMPLATE (HTML saja) — Master Rayon (menu Lain-lain > Rayon,
   page:'masterRayon', menggantikan entry placeholder lama — lihat
   js/menu.js & catatan besar di atas DATA.rayon di js/data.js). Semua
   fungsi di file ini HANYA menyusun & mengembalikan markup HTML
   (string), TIDAK ada logic/DOM-binding/data mutation — logic-nya ada
   di file sebelah: master-rayon.js.

   Sesuai 3 screenshot MASERP yang dikirim user 2026-08-18: "Daftar
   Rayon" (list sederhana: dark header + tombol "+Tambah", toolbar
   page-size + Pencarian Global, kolom Kode Rayon/Nama Rayon/Salesman/
   Ubah/Hapus, pager standar, "Total Record: 35") dan "Rayon" (form
   Ubah: Kode Rayon readonly abu-abu, Nama Rayon, Salesman dropdown,
   checkbox Default + label status "Ya"/"Tidak") + sub-card nested
   "Kecamatan" (toolbar Pencarian Global + page-size, tabel kolom
   Kecamatan [input + tombol icon search]/"Luar Kota?"[checkbox]/Hapus,
   link "+ Tambah Kecamatan", lalu pager BARU yang BEDA dari pager
   standar di semua modul lain: "First < [kotak nomor halaman] to Y
   Of Total > Last" — lihat tplRyKecPager()).

   Form pakai pola FULL PAGE (bukan modal) sama seperti Master Customer/
   Master Supplier, supaya konsisten. Sub-grid Kecamatan genuinely
   PAGINATED (lihat komentar di js/data.js soal skala data yang
   disederhanakan dari 117 jadi lebih kecil, tapi mekanisme pager-nya
   tetap fungsional nyata).
========================================================= */

/* 10 nama salesman PERSIS dari screenshot "Daftar Rayon"/"Rayon" — daftar
   LOKAL khusus modul ini (BUKAN DATA.salesman yang 7 baris & sudah
   dipakai chart Dashboard Sales), supaya tidak mengubah data yang
   sudah dipakai modul lain. */
const RY_SALESMAN_LIST = [
  'BABAY SUHAEMI','ARI ARIH GINTING SUKA','SYAEFUL ANWAR','ANDRI MUHAMMAD','ISDI DWI JATMIKO',
  'SYARIFUDIN','ONI BAHTIAR','ALBERTUS SUBANDONO','ONY GALIH PURWO SAPUTRO','AGUS PURNOMO',
];

/* Pool nama kecamatan gaya Banten (~60 nama) dipakai men-generate isi
   DATA.rayon[].kecamatan (lihat js/data.js) DAN sebagai daftar pilihan
   pada modal "Pilih Kecamatan" (tombol icon search per baris / "+ Tambah
   Kecamatan"). 10 nama pertama PERSIS sesuai screenshot BANTEN 1. */
const RY_KEC_POOL = [
  'Angsana','Anyar','Balaraja','Bandung','Banjar','Banjarsari','Baros','Bayah','Binuang','Bojonegara',
  'Cikande','Cikeusal','Cikupa','Cileles','Cimanggu','Cinangka','Cipanas','Cipeundeuy','Cipocok Jaya','Ciruas',
  'Curug','Gunung Kaler','Jawilan','Jayanti','Kaduhejo','Kibin','Kopo','Kragilan','Kresek','Kronjo',
  'Kutamekar','Labuan','Legok','Mancak','Mekarbaru','Menes','Munjul','Padarincang','Pagedangan','Pamarayan',
  'Panggarangan','Panimbang','Petir','Pontang','Pulomerak','Rangkasbitung','Sajira','Saketi','Sepatan','Serang',
  'Sindangresmi','Sobang','Solear','Sukamulya','Tanara','Tenjo','Tigaraksa','Tirtayasa','Tunjung Teja','Waringinkurung',
  'Warunggunung','Cadasari',
];

const RY_KEC_PAGE_SIZE = 10;

function tplMasterRayonListPage(){
  return `
    <div class="breadcrumb">Home / <b>Rayon</b></div>
    <div class="card">
      <div class="card-header dark-header">
        <h3>${icon('truck',15)} Daftar Rayon</h3>
        <div class="toolbar-actions">
          <button class="btn-primary" id="btnRyAdd">${icon('plus',14)} Tambah</button>
        </div>
      </div>
      <div class="table-toolbar" style="justify-content:flex-end;">
        <select id="ryPageSize"><option selected>10</option><option>25</option><option>50</option></select>
        <input type="text" id="rySearch" placeholder="Pencarian Global">
      </div>
      <div class="table-wrap"><table>
        <thead><tr>
          <th>Kode Rayon</th>
          <th>Nama Rayon</th>
          <th>Salesman</th>
          <th>Ubah</th>
          <th>Hapus</th>
        </tr></thead>
        <tbody id="ryTbody"></tbody>
      </table></div>
      <div class="table-footer"><div class="pager"><button>First</button><button>Previous</button><button class="active">1</button><button>2</button><button>3</button><button>4</button><button>Next</button><button>Last</button></div><div id="ryTotal"></div></div>
    </div>`;
}

function tplRyRows(rows){
  if(!rows.length) return `<tr><td colspan="5" style="color:var(--text-light);">Tidak Ada Data</td></tr>`;
  return rows.map(r=>{
    const i = DATA.rayon.indexOf(r);
    return `
    <tr>
      <td><b style="color:var(--blue);cursor:pointer;" data-edit="${i}">${r.kode}</b></td>
      <td>${r.nama}</td>
      <td>${r.salesman}</td>
      <td><button class="icon-btn edit" data-edit="${i}">${icon('edit',14)}</button></td>
      <td><button class="icon-btn del" data-del="${i}">${icon('trash',14)}</button></td>
    </tr>`;
  }).join('');
}

function tplRayonForm(mode, row){
  const title = mode==='add' ? '+ Rayon' : 'Rayon';
  return `
    <div class="breadcrumb">Home / Rayon / <b>${title}</b></div>
    <div class="card">
      <div class="card-header dark-header"><h3>${icon('truck',15)} ${title}</h3></div>
      <div class="card-body">
        <div class="form-grid">
          <div class="form-group">
            <label>Kode Rayon</label>
            <input type="text" id="fRyKode" value="${row.kode}" readonly style="background:#f2f3f6;color:var(--text-light);">
          </div>
          <div class="form-group">
            <label>Nama Rayon</label>
            <input type="text" id="fRyNama" value="${row.nama}">
          </div>
          <div class="form-group">
            <label>Salesman</label>
            <select id="fRySalesman">${RY_SALESMAN_LIST.map(s=>`<option ${s===row.salesman?'selected':''}>${s}</option>`).join('')}</select>
          </div>
          <div class="form-group">
            <label>Default</label>
            <label class="checkbox-row" style="margin-top:8px;">
              <input type="checkbox" id="fRyDefault" ${row.isDefault?'checked':''}> <span id="fRyDefaultLabel">${row.isDefault?'Ya':'Tidak'}</span>
            </label>
          </div>
        </div>

        <div class="form-section" style="margin-top:6px;">
          <div class="card" style="box-shadow:none;border:1px solid var(--border);">
            <div class="card-header dark-header"><h3>${icon('list',14)} Kecamatan</h3></div>
            <div class="table-toolbar" style="justify-content:space-between;">
              <select id="ryKecPageSize"><option selected>10</option><option>25</option><option>50</option></select>
              <input type="text" id="ryKecSearch" placeholder="Pencarian Global">
            </div>
            <div class="table-wrap"><table>
              <thead><tr>
                <th style="width:55%;">Kecamatan</th>
                <th>Luar Kota?</th>
                <th>Hapus</th>
              </tr></thead>
              <tbody id="ryKecTbody"></tbody>
            </table></div>
            <div style="padding:10px 18px;"><a href="#" class="link-add" id="btnRyKecAdd">${icon('plus',13)} Tambah Kecamatan</a></div>
            <div class="table-footer" id="ryKecPagerWrap"></div>
          </div>
        </div>

        <div class="form-page-actions">
          <button class="btn-primary" id="rySave">${icon('check',14)} Simpan</button>
          <button class="btn-outline" id="ryCancel">Batalkan</button>
        </div>
      </div>
    </div>`;
}

function tplRyKecRows(items, absOffset){
  if(!items.length) return `<tr><td colspan="3" style="color:var(--text-light);">Tidak Ada Data</td></tr>`;
  return items.map((k, i)=>{
    const idx = absOffset + i;
    return `
    <tr>
      <td>
        <div class="input-with-btn">
          <input type="text" data-kec-nama="${idx}" value="${k.nama}">
          <button class="icon-btn view" data-kec-search="${idx}" title="Pilih Kecamatan">${icon('search',13)}</button>
        </div>
      </td>
      <td><input type="checkbox" data-kec-luar="${idx}" ${k.luarKota?'checked':''} style="width:auto;"></td>
      <td><button class="icon-btn del" data-kec-del="${idx}">${icon('trash',14)}</button></td>
    </tr>`;
  }).join('');
}

/* Pager BARU khusus sub-grid Kecamatan: "First < [kotak nomor halaman]
   to Y Of Total > Last" — beda gaya dari .pager standar (lihat komentar
   di css/style.css .ry-kec-pager). FUNGSIONAL: kotak nomor halaman bisa
   diketik+Enter utk lompat halaman, tombol < > maju/mundur 1 halaman. */
function tplRyKecPager(page, perPage, total){
  const lastPage = Math.max(1, Math.ceil(total/perPage));
  const start = total===0 ? 0 : (page-1)*perPage + 1;
  const end = Math.min(page*perPage, total);
  return `
    <div class="ry-kec-pager">
      <button id="ryKecFirst" ${page<=1?'disabled':''}>First</button>
      <button id="ryKecPrev" ${page<=1?'disabled':''}>&lt;</button>
      <input type="text" id="ryKecPageInput" value="${page}">
      <span>to ${end} Of ${total}</span>
      <button id="ryKecNext" ${page>=lastPage?'disabled':''}>&gt;</button>
      <button id="ryKecLast" ${page>=lastPage?'disabled':''}>Last</button>
    </div>`;
}

function tplRyKecPickerModal(){
  return `
    <div class="modal-box" style="max-width:420px;">
      <div class="modal-header"><span>Pilih Kecamatan</span><span class="close" id="modalClose">&times;</span></div>
      <div class="modal-body">
        <input type="text" id="ryKecPickerSearch" placeholder="Cari nama kecamatan..." style="width:100%;border:1px solid var(--border);border-radius:6px;padding:8px 10px;font-size:12.8px;margin-bottom:12px;">
        <div class="table-wrap" style="max-height:320px;overflow:auto;">
          <table><tbody id="ryKecPickerBody">${tplRyKecPickerRows(RY_KEC_POOL)}</tbody></table>
        </div>
      </div>
      <div class="modal-footer"><button class="btn-secondary" id="modalCancel">Tutup</button></div>
    </div>`;
}

function tplRyKecPickerRows(list){
  if(!list.length) return `<tr><td style="color:var(--text-light);">Tidak ditemukan</td></tr>`;
  return list.map(nm=>`<tr><td>${nm}</td><td style="text-align:right;"><button class="btn-pick" data-pick-kec="${nm}">Pilih</button></td></tr>`).join('');
}

function tplRyDeleteConfirm(row){
  return `
    <div class="modal-box">
      <div class="modal-header"><span>Hapus Rayon</span><span class="close" id="modalClose">&times;</span></div>
      <div class="modal-body"><p>Yakin ingin menghapus rayon <b>${row.kode}</b> — ${row.nama}?</p></div>
      <div class="modal-footer">
        <button class="btn-secondary" id="modalCancel">Batal</button>
        <button class="btn-danger" id="modalDelete">Hapus</button>
      </div>
    </div>`;
}
