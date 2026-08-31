/* =========================================================
   TEMPLATE (HTML saja) — Master Bank (Kas/Bank > Master &
   Setting > Master Bank, key page:'masterBank'). Semua fungsi
   di file ini HANYA menyusun & mengembalikan markup HTML
   (string), TIDAK ada logic/DOM-binding/data mutation di sini.
   Logic-nya ada di file sebelah: master-bank.js

   Sesuai 2 screenshot MASERP yang dikirim user: "Daftar Master
   Bank" (list: Kode Master Bank / Nama Master Bank / VA +
   Ubah/Hapus, page size default 20, tombol +Tambah) dan form
   "+ Master Bank" full page dengan section "Informasi Bank"
   berisi 3 field: Kode Master Bank (readonly, auto B01/B02/...),
   Nama Master Bank, VA (nomor Virtual Account); footer Simpan +
   Batalkan. Master ini menyimpan identitas rekening VA per
   cabang/entitas (dipakai penagihan customer) — beda dari menu
   Kas/Bank yang menyimpan akun kas & bank GL. Nama di data
   sample memakai PT Distriversa Buanamas per cabang (data
   screenshot milik instalasi lain/SDL, tidak direplikasi —
   nomor VA-nya dipertahankan sebagai contoh).
========================================================= */
function tplMasterBankListPage(){
  return `
    <div class="breadcrumb">Home / Kas/Bank / <b>Master Bank</b></div>
    <div class="card">
      <div class="card-header dark-header"><h3>${icon('bank',15)} Daftar Master Bank</h3><button class="btn-primary" id="btnMbkAdd">${icon('plus',14)} Tambah</button></div>
      <div class="table-toolbar">
        <select id="mbkPageSize"><option>10</option><option selected>20</option><option>50</option></select>
        <input type="text" id="mbkSearch" placeholder="Pencarian Global">
      </div>
      <div class="table-wrap"><table>
        <thead><tr><th style="width:220px;">Kode Master Bank</th><th>Nama Master Bank</th><th style="width:220px;">VA</th><th style="width:70px;">Ubah</th><th style="width:70px;">Hapus</th></tr></thead>
        <tbody id="mbkTbody"></tbody>
      </table></div>
      <div class="table-footer"><div class="pager"><button>First</button><button>Previous</button><button class="active">1</button><button>Next</button><button>Last</button></div><div id="mbkTotal"></div></div>
    </div>`;
}

function tplMbkRows(rows){
  if(!rows.length) return `<tr><td colspan="5" style="color:var(--text-light);">Tidak ada Master Bank yang cocok dengan pencarian.</td></tr>`;
  return rows.map((r,i)=>`
    <tr>
      <td>${r.kode}</td>
      <td>${(r.nama||'').toUpperCase()}</td>
      <td>${r.va||''}</td>
      <td><button class="icon-btn edit" data-edit="${i}" title="Ubah">${icon('edit',15)}</button></td>
      <td><button class="icon-btn del" data-del="${i}" title="Hapus">${icon('trash',15)}</button></td>
    </tr>`).join('');
}

function tplMasterBankForm(mode, row){
  const isEdit = mode === 'edit';
  return `
    <div class="breadcrumb">Home / Master Bank / <b>${isEdit ? 'Ubah' : 'Tambah'}</b></div>
    <div class="card">
      <div class="card-header dark-header"><h3>${icon('plus',15)} Master Bank</h3></div>
      <div class="card-body">
        <div class="form-section">Informasi Bank</div>
        <table class="field-table" style="max-width:760px;">
          <tr>
            <td class="flabel">Kode Master Bank</td>
            <td><input type="text" id="fMbkKode" value="${row.kode||''}" readonly></td>
          </tr>
          <tr>
            <td class="flabel">Nama Master Bank</td>
            <td><input type="text" id="fMbkNama" value="${row.nama||''}" placeholder="Contoh: PT DISTRIVERSA BUANAMAS SURABAYA"></td>
          </tr>
          <tr>
            <td class="flabel">VA</td>
            <td><input type="text" id="fMbkVa" value="${row.va||''}" placeholder="Nomor Virtual Account"></td>
          </tr>
        </table>
      </div>
      <div class="card-footer" style="display:flex;gap:10px;justify-content:flex-end;align-items:center;padding:14px 20px;border-top:1px solid var(--border);">
        <button type="button" class="btn-primary" id="mbkSimpan">Simpan</button>
        <a href="#" id="mbkBatalkan" class="link-add" style="margin-top:0;">Batalkan</a>
      </div>
    </div>`;
}

function tplMbkDeleteConfirm(row){
  return `
    <div class="modal-box">
      <div class="modal-header"><span>Hapus Master Bank</span><span class="close" id="modalClose">&times;</span></div>
      <div class="modal-body"><p>Yakin ingin menghapus Master Bank <b>${row.kode}</b> — ${(row.nama||'').toUpperCase()} (VA ${row.va||'-'})?</p></div>
      <div class="modal-footer">
        <button class="btn-secondary" id="modalCancel">Batal</button>
        <button class="btn-danger" id="modalDelete">Hapus</button>
      </div>
    </div>`;
}

function tplMbkInfoModal(title,text){
  return `
    <div class="modal-box">
      <div class="modal-header"><span>${title}</span><span class="close" id="modalClose">&times;</span></div>
      <div class="modal-body"><p>${text}</p></div>
      <div class="modal-footer"><button class="btn-primary" id="modalOk">Mengerti</button></div>
    </div>`;
}
