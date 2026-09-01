/* =========================================================
   TEMPLATE (HTML saja) — Daftar Perusahaan (Profil Perusahaan
   > Daftar Perusahaan, page:'daftarPerusahaan'). Semua fungsi
   di file ini HANYA menyusun & mengembalikan markup HTML
   (string), TIDAK ada logic/DOM-binding di sini. Logic-nya di
   file sebelah: daftar-perusahaan.js
   NB: closeModal() dipakai bersama, didefinisikan di core.js.

   Dibangun 2026-09-01 sesuai screenshot MASERP SDL "Daftar
   Perusahaan" saat menu Profil Perusahaan dipecah jadi 2 sub
   menu (Detail Perusahaan = halaman companyProfile lama +
   Daftar Perusahaan = modul ini): dark header + tombol
   +Tambah (biru) + Tutorial (merah), toolbar page-size 10 +
   Pencarian Global, kolom Nama Perusahaan / Kode Data /
   Tanggal Mulai Pakai / Generasi Data (semua sort) + Hapus,
   pager First/Previous/1/Next/Last, Total Record: 1. Baris
   sample SDL (SDL/SDL/01/03/2025/002) dipetakan ke DBM
   (DBM/DBM/01/03/2025/002). Tambah = modal form 4 field
   (Kode Data uppercase & unik); TIDAK ada tombol Ubah
   (sesuai screenshot — hanya Hapus). */

function tplDprPage(){
  return `
    <div class="breadcrumb">Home / Profil Perusahaan / <b>Daftar Perusahaan</b></div>
    <div class="card">
      <div class="card-header dark-header">
        <h3>${icon('alertTriangle',15)} Daftar Perusahaan</h3>
        <div class="toolbar-actions">
          <button class="btn-primary" id="btnDprAdd">${icon('plus',14)}Tambah</button>
          <button class="btn-danger" id="btnDprTutorial">${icon('card',14)} Tutorial</button>
        </div>
      </div>
      <div class="table-toolbar">
        <select id="dprPageSize"><option selected>10</option><option>25</option><option>50</option></select>
        <input type="text" id="dprSearch" placeholder="Pencarian Global">
      </div>
      <div class="table-wrap"><table>
        <thead><tr>
          <th style="text-align:center;">${tplDprSortHeader('Nama Perusahaan','nama')}</th>
          <th style="text-align:center;">${tplDprSortHeader('Kode Data','kode')}</th>
          <th style="text-align:center;">${tplDprSortHeader('Tanggal Mulai Pakai','tglMulai')}</th>
          <th style="text-align:center;">${tplDprSortHeader('Generasi Data','generasi')}</th>
          <th style="width:70px;">Hapus</th>
        </tr></thead>
        <tbody id="dprTbody"></tbody>
      </table></div>
      <div class="table-footer"><div class="pager" id="dprPager"><button disabled>First</button><button disabled>Previous</button><button class="active">1</button><button disabled>Next</button><button disabled>Last</button></div><div id="dprTotal"></div></div>
    </div>`;
}

function tplDprSortHeader(label, field){
  return `<span data-dpr-sort="${field}" style="cursor:pointer;display:inline-flex;align-items:center;gap:4px;">${label}<span id="dprSortIcon_${field}" style="color:var(--text-light);font-size:11px;">&#8693;</span></span>`;
}

function tplDprRows(rows){
  if(!rows.length) return `<tr><td colspan="5" style="color:var(--text-light);padding:14px;text-align:center;font-weight:600;">Tidak Ada Data</td></tr>`;
  return rows.map((r) => {
    const idx = DATA.daftarPerusahaan.indexOf(r);
    return `
    <tr>
      <td>${r.nama}</td>
      <td>${r.kode}</td>
      <td>${r.tglMulai||''}</td>
      <td>${r.generasi||''}</td>
      <td><button class="icon-btn del" data-dpr-del="${idx}" title="Hapus">${icon('trash',15)}</button></td>
    </tr>`;
  }).join('');
}

function tplDprModal(row){
  return `
    <div class="modal-box">
      <div class="modal-header"><span>Tambah Perusahaan</span><span class="close" id="modalClose">&times;</span></div>
      <div class="modal-body">
        <div class="form-group">
          <label>Nama Perusahaan</label>
          <input type="text" id="fDprNama" value="${row.nama||''}" placeholder="Contoh: DBM">
          <div class="form-error" id="fDprNamaErr">Nama Perusahaan wajib diisi</div>
        </div>
        <div class="form-group">
          <label>Kode Data</label>
          <input type="text" id="fDprKode" value="${row.kode||''}" maxlength="10" placeholder="Contoh: DBM" style="text-transform:uppercase;">
          <div class="form-error" id="fDprKodeErr">Kode Data wajib diisi</div>
        </div>
        <div class="form-group">
          <label>Tanggal Mulai Pakai</label>
          <div class="input-with-btn">
            <input type="text" id="fDprTgl" value="${row.tglMulai||'01/09/2026'}">
            <span class="icon-btn edit" style="pointer-events:none;">${icon('calendar',13)}</span>
          </div>
          <div class="form-error" id="fDprTglErr">Tanggal Mulai Pakai wajib diisi</div>
        </div>
        <div class="form-group">
          <label>Generasi Data</label>
          <input type="text" id="fDprGenerasi" value="${row.generasi||''}" maxlength="6" placeholder="Contoh: 002">
          <div class="form-error" id="fDprGenerasiErr">Generasi Data wajib diisi</div>
        </div>
      </div>
      <div class="modal-footer">
        <button class="btn-secondary" id="modalCancel">Batal</button>
        <button class="btn-primary" id="modalSave">Simpan</button>
      </div>
    </div>`;
}

function tplDprDeleteConfirm(row){
  return `
    <div class="modal-box">
      <div class="modal-header"><span>Hapus Perusahaan</span><span class="close" id="modalClose">&times;</span></div>
      <div class="modal-body"><p>Yakin ingin menghapus perusahaan <b>${row.nama}</b> (Kode Data: ${row.kode}, Generasi: ${row.generasi||'-'})?</p></div>
      <div class="modal-footer">
        <button class="btn-secondary" id="modalCancel">Batal</button>
        <button class="btn-danger" id="modalDelete">Hapus</button>
      </div>
    </div>`;
}

function tplDprInfoModal(title,text){
  return `
    <div class="modal-box">
      <div class="modal-header"><span>${title}</span><span class="close" id="modalClose">&times;</span></div>
      <div class="modal-body"><p>${text}</p></div>
      <div class="modal-footer"><button class="btn-primary" id="modalOk">Mengerti</button></div>
    </div>`;
}
