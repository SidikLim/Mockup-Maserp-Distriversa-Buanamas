/* =========================================================
   TEMPLATE (HTML saja) — Master Sales Office (menu Customer & Penjualan >
   Master & Setting > Sales Office, page:'salesOffice' — SEBELUMNYA
   placeholder murni `{label:'Sales Office', page:'placeholder', title:
   'Sales Office'}` di js/menu.js). Semua fungsi di file ini HANYA
   menyusun & mengembalikan markup HTML (string), TIDAK ada logic/DOM-
   binding/data mutation — logic-nya ada di file sebelah: sales-office.js.

   Sesuai 2 screenshot MASERP yang dikirim user 2026-08-18: "Daftar Sales
   Office" (list: dark header + tombol "+Tambah" SAJA — TIDAK ADA tombol
   "Tutorial" di sini, beda dari kebanyakan modul lain, direproduksi APA
   ADANYA sesuai screenshot; toolbar page-size(10)+Pencarian Global; kolom
   Kode Sales Office/Nama Sales Office/ASCM/Area/Status/Ubah/Hapus, 4 dari
   5 header py ikon sort kecil dekoratif; pager standar; label total
   SENGAJA "Total: 5" BUKAN "Total Record: 5" seperti modul lain — quirk
   direproduksi apa adanya, bukan salah ketik) dan "Sales Office" (form
   Ubah: ikon pensil di header [beda dari ikon lain yg dipakai modul lain],
   Kode readonly abu-abu, Nama, ASCM dropdown, Status radio Aktif/Non-
   Aktif, tombol Simpan [biru] + Batalkan [TEKS POLOS biru tanpa border,
   class baru `.btn-link-plain` — beda dari .btn-outline bordered yang
   dipakai modul lain]).

   **PENTING — field "Area" di kolom list BUKAN field yang diedit di form
   ini** (form Ubah screenshot TIDAK punya field Area sama sekali): kolom
   Area di list adalah HASIL TURUNAN/read-only, mengumpulkan semua baris
   DATA.area yang field `salesOffice`-nya menunjuk ke Sales Office ini
   (arah keterkaitan KEBALIKAN dari Master Wilayah — di sana Wilayah yang
   MEMILIH Sales Office-nya lewat picker, bukan sebaliknya). Lihat
   sofAreaListText() di sales-office.js.

   Form pakai pola FULL PAGE (sama seperti Master Rayon/Wilayah/Group
   User/Master User).
========================================================= */

/* ASCM (Area Sales & Channel Manager?) — daftar LOKAL 3 nama PERSIS dari
   screenshot list (EDI YUWONO muncul 2x, ALDESGA DAVINO 2x, FIRMAN HIDAYAT
   1x — disimpan sebagai list unik 3 nama, bukan 5 karena 2 nama dipakai
   berulang di baris berbeda). */
const SOF_ASCM_LIST = ['EDI YUWONO', 'ALDESGA DAVINO', 'FIRMAN HIDAYAT'];

const SOF_PAGE_SIZE_DEFAULT = 10;

function tplMasterSofListPage(){
  return `
    <div class="breadcrumb">Home / <b>Sales Office</b></div>
    <div class="card">
      <div class="card-header dark-header">
        <h3>${icon('folder',15)} Daftar Sales Office</h3>
        <div class="toolbar-actions">
          <button class="btn-primary" id="btnSofAdd">${icon('plus',14)} Tambah</button>
        </div>
      </div>
      <div class="table-toolbar" style="justify-content:flex-end;">
        <select id="sofPageSize"><option selected>10</option><option>25</option><option>50</option></select>
        <input type="text" id="sofSearch" placeholder="Pencarian Global">
      </div>
      <div class="table-wrap"><table>
        <thead><tr>
          <th>Kode Sales Office<span class="th-sort">&#8597;</span></th>
          <th>Nama Sales Office<span class="th-sort">&#8597;</span></th>
          <th>ASCM<span class="th-sort">&#8597;</span></th>
          <th>Area</th>
          <th>Status<span class="th-sort">&#8597;</span></th>
          <th>Ubah</th>
          <th>Hapus</th>
        </tr></thead>
        <tbody id="sofTbody"></tbody>
      </table></div>
      <div class="table-footer"><div class="pager" id="sofPagerWrap"></div><div id="sofTotal"></div></div>
    </div>`;
}

function tplSofRows(rows){
  if(!rows.length) return `<tr><td colspan="7" style="color:var(--text-light);">Tidak Ada Data</td></tr>`;
  return rows.map(r=>{
    const i = DATA.salesOffice.indexOf(r);
    return `
    <tr>
      <td><b style="color:var(--blue);cursor:pointer;" data-edit="${i}">${r.kode}</b></td>
      <td>${r.nama}</td>
      <td>${r.ascm}</td>
      <td>${sofAreaListText(r.kode)}</td>
      <td><span class="status-pill ${r.status==='Aktif'?'status-paid':'status-overdue'}">${r.status}</span></td>
      <td><button class="icon-btn edit" data-edit="${i}">${icon('edit',14)}</button></td>
      <td><button class="icon-btn del" data-del="${i}">${icon('trash',14)}</button></td>
    </tr>`;
  }).join('');
}

function sofAreaListText(kode){
  const linked = DATA.area.filter(a => a.salesOffice === kode);
  if(!linked.length) return '';
  return linked.map(a => `(${a.kode}) ${a.nama}`).join(', ');
}

function tplSofPager(page, totalPages){
  let nums = '';
  for(let p = 1; p <= totalPages; p++){
    nums += `<button class="${p===page?'active':''}" data-sof-page="${p}">${p}</button>`;
  }
  return `
    <button data-sof-first ${page<=1?'disabled':''}>First</button>
    <button data-sof-prev ${page<=1?'disabled':''}>Previous</button>
    ${nums}
    <button data-sof-next ${page>=totalPages?'disabled':''}>Next</button>
    <button data-sof-last ${page>=totalPages?'disabled':''}>Last</button>`;
}

function tplSofForm(mode, row){
  const title = 'Sales Office';
  return `
    <div class="breadcrumb">Home / Sales Office / <b>${mode==='add'?'+ '+title:title}</b></div>
    <div class="card">
      <div class="card-header dark-header"><h3>${icon('edit',14)} ${title}</h3></div>
      <div class="card-body">
        <div class="form-grid">
          <div class="form-group">
            <label>Kode</label>
            <input type="text" id="fSofKode" value="${row.kode}" readonly style="background:#f2f3f6;color:var(--text-light);">
          </div>
          <div class="form-group">
            <label>Nama</label>
            <input type="text" id="fSofNama" value="${row.nama}">
          </div>
          <div class="form-group">
            <label>ASCM</label>
            <select id="fSofAscm">${SOF_ASCM_LIST.map(a=>`<option ${a===row.ascm?'selected':''}>${a}</option>`).join('')}</select>
          </div>
          <div class="form-group">
            <label>Status</label>
            <div class="radio-inline">
              <label><input type="radio" name="fSofStatus" value="Aktif" ${row.status!=='Non-Aktif'?'checked':''}> Aktif</label>
              <label><input type="radio" name="fSofStatus" value="Non-Aktif" ${row.status==='Non-Aktif'?'checked':''}> Non-Aktif</label>
            </div>
          </div>
        </div>

        <div class="form-page-actions">
          <button class="btn-primary" id="sofSave">${icon('check',14)} Simpan</button>
          <button class="btn-link-plain" id="sofCancel">Batalkan</button>
        </div>
      </div>
    </div>`;
}

function tplSofDeleteConfirm(row){
  return `
    <div class="modal-box">
      <div class="modal-header"><span>Hapus Sales Office</span><span class="close" id="modalClose">&times;</span></div>
      <div class="modal-body"><p>Yakin ingin menghapus sales office <b>${row.kode}</b> — ${row.nama}?</p></div>
      <div class="modal-footer">
        <button class="btn-secondary" id="modalCancel">Batal</button>
        <button class="btn-danger" id="modalDelete">Hapus</button>
      </div>
    </div>`;
}
