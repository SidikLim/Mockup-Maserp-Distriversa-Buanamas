/* =========================================================
   TEMPLATE (HTML saja) — Master Area/Wilayah (menu Lain-lain > Wilayah,
   page:'masterWilayah', menggantikan entry placeholder lama — lihat
   js/menu.js & catatan besar di atas DATA.area di js/data.js). Semua
   fungsi di file ini HANYA menyusun & mengembalikan markup HTML
   (string), TIDAK ada logic/DOM-binding/data mutation — logic-nya ada
   di file sebelah: master-wilayah.js.

   Sesuai screenshot MASERP yang dikirim user 2026-08-18: "Area" (list:
   dark header + tombol "+Tambah" & "Tutorial", toolbar page-size +
   Pencarian Global, kolom Kode Area/Nama Area/Supervisor/Ubah/Hapus,
   pager standar, "Total Record: 9") dan "Wilayah" (form Ubah: Kode
   Wilayah readonly abu-abu, Nama Wilayah, Default checkbox+label
   "Tidak", Supervisor dropdown, Gudang dropdown, Invoicing dropdown,
   Sales Office input+tombol search, Status radio Aktif/Non-Aktif) +
   sub-card nested "Rayon" (daftar dropdown Rayon YANG SUDAH ADA di
   DATA.rayon — pola BEDA dari sub-grid Kecamatan di Master Rayon yang
   bikin entitas baru: di sini cuma MENAUTKAN rayon existing, jadi tiap
   baris cukup 1 <select> + tombol Hapus, TANPA pager [screenshot tidak
   menunjukkan pager pada sub-grid ini, wajar karena jumlah rayon per
   wilayah kecil]).

   Form pakai pola FULL PAGE (sama seperti Master Customer/Master
   Supplier/Master Rayon).
========================================================= */

/* Cabang/S.Office — copy verbatim dari GDG_CABANG_LIST (js/pages/
   gudang.template.js) / SQ_SOFFICE_LIST (js/pages/sales-quotation.
   template.js) supaya konsisten lintas modul, tanpa bergantung ke file
   lain yang di-lazy-load terpisah (urutan lazy-load antar modul tidak
   dijamin). Dipakai bersama utk dropdown Gudang & Invoicing, dan pool
   pilihan modal "Pilih Sales Office". */
const WL_CABANG_LIST = ['Head Office','Surabaya','Bandung','Tangerang','Medan','Makassar','Semarang','Sidoarjo'];

/* Supervisor — daftar LOKAL khusus modul ini, PERSIS 4 nama yang
   tampak di screenshot list Area (ILHAM YUSDIANSYAH/BABAY SUHAEMI/
   ANTONIOUS SURYO WINARNO/PERA LESMANA). BABAY SUHAEMI SENGAJA sama
   persis dgn salesman Rayon "BANTEN 1" (RY_SALESMAN_LIST di
   master-rayon.template.js) — org yang sama bisa merangkap Supervisor
   Area sekaligus Salesman Rayon, tidak digabung jadi 1 constant supaya
   2 modul ini tetap independen (tidak saling bergantung urutan
   lazy-load). */
const WL_SUPERVISOR_LIST = ['ILHAM YUSDIANSYAH','BABAY SUHAEMI','ANTONIOUS SURYO WINARNO','PERA LESMANA'];

function tplMasterWilayahListPage(){
  return `
    <div class="breadcrumb">Home / <b>Area</b></div>
    <div class="card">
      <div class="card-header dark-header">
        <h3>${icon('folder',15)} Area</h3>
        <div class="toolbar-actions">
          <button class="btn-primary" id="btnWlAdd">${icon('plus',14)} Tambah</button>
          <button class="btn-danger" id="btnWlTutorial">${icon('eye',14)} Tutorial</button>
        </div>
      </div>
      <div class="table-toolbar" style="justify-content:flex-end;">
        <select id="wlPageSize"><option selected>10</option><option>25</option><option>50</option></select>
        <input type="text" id="wlSearch" placeholder="Pencarian Global">
      </div>
      <div class="table-wrap"><table>
        <thead><tr>
          <th>Kode Area</th>
          <th>Nama Area</th>
          <th>Supervisor</th>
          <th>Ubah</th>
          <th>Hapus</th>
        </tr></thead>
        <tbody id="wlTbody"></tbody>
      </table></div>
      <div class="table-footer"><div class="pager"><button>First</button><button>Previous</button><button class="active">1</button><button>Next</button><button>Last</button></div><div id="wlTotal"></div></div>
    </div>`;
}

function tplWlRows(rows){
  if(!rows.length) return `<tr><td colspan="5" style="color:var(--text-light);">Tidak Ada Data</td></tr>`;
  return rows.map(r=>{
    const i = DATA.area.indexOf(r);
    return `
    <tr>
      <td><b style="color:var(--blue);cursor:pointer;" data-edit="${i}">${r.kode}</b></td>
      <td>${r.nama}</td>
      <td>${r.supervisor}</td>
      <td><button class="icon-btn edit" data-edit="${i}">${icon('edit',14)}</button></td>
      <td><button class="icon-btn del" data-del="${i}">${icon('trash',14)}</button></td>
    </tr>`;
  }).join('');
}

function tplWilayahForm(mode, row){
  const title = mode==='add' ? '+ Wilayah' : 'Wilayah';
  return `
    <div class="breadcrumb">Home / Area / <b>${title}</b></div>
    <div class="card">
      <div class="card-header dark-header"><h3>${icon('folder',15)} ${title}</h3></div>
      <div class="card-body">
        <div class="form-grid">
          <div class="form-group">
            <label>Kode Wilayah</label>
            <input type="text" id="fWlKode" value="${row.kode}" readonly style="background:#f2f3f6;color:var(--text-light);">
          </div>
          <div class="form-group">
            <label>Gudang</label>
            <select id="fWlGudang">${WL_CABANG_LIST.map(c=>`<option ${c===row.gudang?'selected':''}>${c}</option>`).join('')}</select>
          </div>
          <div class="form-group">
            <label>Nama Wilayah</label>
            <input type="text" id="fWlNama" value="${row.nama}">
          </div>
          <div class="form-group">
            <label>Invoicing</label>
            <select id="fWlInvoicing">${WL_CABANG_LIST.map(c=>`<option ${c===row.invoicing?'selected':''}>${c}</option>`).join('')}</select>
          </div>
          <div class="form-group">
            <label>Default</label>
            <label class="checkbox-row" style="margin-top:8px;">
              <input type="checkbox" id="fWlDefault" ${row.isDefault?'checked':''}> <span id="fWlDefaultLabel">${row.isDefault?'Ya':'Tidak'}</span>
            </label>
          </div>
          <div class="form-group">
            <label>Sales Office</label>
            <div class="input-with-btn">
              <input type="text" id="fWlSalesOffice" value="${wlSofficeNama(row.salesOffice)}" readonly style="background:#f2f3f6;">
              <button class="icon-btn view" id="btnWlSofficeSearch" title="Pilih Sales Office">${icon('search',14)}</button>
            </div>
          </div>
          <div class="form-group">
            <label>Supervisor</label>
            <select id="fWlSupervisor">${WL_SUPERVISOR_LIST.map(s=>`<option ${s===row.supervisor?'selected':''}>${s}</option>`).join('')}</select>
          </div>
          <div class="form-group">
            <label>Status</label>
            <div class="radio-inline">
              <label><input type="radio" name="fWlStatus" value="Aktif" ${row.status!=='Non-Aktif'?'checked':''}> Aktif</label>
              <label><input type="radio" name="fWlStatus" value="Non-Aktif" ${row.status==='Non-Aktif'?'checked':''}> Non-Aktif</label>
            </div>
          </div>
        </div>

        <div class="form-section" style="margin-top:6px;">
          <div class="card" style="box-shadow:none;border:1px solid var(--border);">
            <div class="card-header dark-header"><h3>${icon('list',14)} Rayon</h3></div>
            <div class="table-wrap"><table>
              <thead><tr><th>Rayon</th><th style="width:70px;">Hapus</th></tr></thead>
              <tbody id="wlRayonTbody">${tplWlRayonRows(row.rayonKode)}</tbody>
            </table></div>
            <div style="padding:10px 18px;"><a href="#" class="link-add" id="btnWlRayonAdd">${icon('plus',13)} Tambah Rayon</a></div>
          </div>
        </div>

        <div class="form-page-actions">
          <button class="btn-primary" id="wlSave">${icon('check',14)} Simpan</button>
          <button class="btn-outline" id="wlCancel">Batalkan</button>
        </div>
      </div>
    </div>`;
}

function tplWlRayonRows(rayonKode){
  if(!rayonKode.length) return `<tr><td colspan="2" style="color:var(--text-light);">Belum ada Rayon ditautkan</td></tr>`;
  return rayonKode.map((kode, i)=>`
    <tr>
      <td>
        <select data-rayon-idx="${i}">
          ${DATA.rayon.map(r=>`<option value="${r.kode}" ${r.kode===kode?'selected':''}>${r.nama}</option>`).join('')}
        </select>
      </td>
      <td><button class="icon-btn del" data-rayon-del="${i}">${icon('trash',14)}</button></td>
    </tr>`).join('');
}

/* UPDATE 2026-08-18 (lanjutan): picker ini SEMULA menampilkan WL_CABANG_LIST
   dekoratif (8 cabang, karena modul Sales Office sungguhan belum ada).
   Setelah modul Master Sales Office dibangun (js/pages/sales-office.*,
   DATA.salesOffice 5 baris SF00-SF04), picker ini diganti menampilkan
   DATA.salesOffice SUNGGUHAN — referential integrity nyata, bukan lagi
   nama cabang bebas. Lihat wlSofficeNama() & komentar "UPDATE 2026-08-18
   (lanjutan)" di atas DATA.salesOffice (js/data.js). */
function wlSofficeNama(kode){
  if(!kode) return '';
  const s = DATA.salesOffice.find(s=>s.kode===kode);
  return s ? `${s.kode} - ${s.nama}` : kode;
}

function tplWlSofficePickerModal(){
  return `
    <div class="modal-box" style="max-width:420px;">
      <div class="modal-header"><span>Pilih Sales Office</span><span class="close" id="modalClose">&times;</span></div>
      <div class="modal-body">
        <div class="table-wrap"><table><tbody>
          ${DATA.salesOffice.map(s=>`<tr><td>${s.kode}</td><td>${s.nama}</td><td style="text-align:right;"><button class="btn-pick" data-pick-soffice="${s.kode}">Pilih</button></td></tr>`).join('')}
        </tbody></table></div>
      </div>
      <div class="modal-footer"><button class="btn-secondary" id="modalCancel">Tutup</button></div>
    </div>`;
}

function tplWlDeleteConfirm(row){
  return `
    <div class="modal-box">
      <div class="modal-header"><span>Hapus Area</span><span class="close" id="modalClose">&times;</span></div>
      <div class="modal-body"><p>Yakin ingin menghapus area <b>${row.kode}</b> — ${row.nama}?</p></div>
      <div class="modal-footer">
        <button class="btn-secondary" id="modalCancel">Batal</button>
        <button class="btn-danger" id="modalDelete">Hapus</button>
      </div>
    </div>`;
}
