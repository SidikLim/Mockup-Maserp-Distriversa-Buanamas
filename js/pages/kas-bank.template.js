/* =========================================================
   TEMPLATE (HTML saja) — Master Kas/Bank (Kas/Bank > Master &
   Setting > Kas/Bank). Semua fungsi di file ini HANYA menyusun &
   mengembalikan markup HTML (string), TIDAK ada logic/DOM-binding/
   data mutation di sini. Logic-nya ada di file sebelah: kas-bank.js

   Sesuai 2 screenshot MASERP yang dikirim user 2026-08-12: "Daftar
   Bank" (list, kolom Kode Bank/Nama Bank/Saldo/Jenis Mata Uang/
   Telepon/No Rek./Tipe/Ubah/Hapus, Total Record: 29) dan "Master
   Bank" (form Tambah, full page, header dark + tombol merah
   "Tutorial" — pola sama seperti Gudang/Jurnal Pembelian/Picking
   List, BUKAN modal).

   NB: tidak ada pola "sort-arrow icon di header kolom" yang benar-
   benar ada di codebase ini (Akun GL & Master Supplier list dicek
   ulang — headernya polos, tanpa ikon sort) jadi header tabel di
   bawah ini SENGAJA dibuat polos juga, konsisten dengan Gudang/
   Akun GL/Master Supplier, bukan lupa menambahkan ikon.
========================================================= */

function tplKasBankListPage(){
  return `
    <div class="breadcrumb">Home / <b>Kas/Bank</b></div>
    <div class="card">
      <div class="card-header dark-header">
        <h3>${icon('wallet',15)} Daftar Bank</h3>
        <button class="btn-primary" id="btnKbkAdd">${icon('plus',14)} Tambah</button>
      </div>
      <div class="table-toolbar">
        <select><option selected>5</option><option>10</option><option>25</option><option>50</option></select>
        <input type="text" placeholder="Pencarian Global">
      </div>
      <div class="table-wrap"><table>
        <thead><tr>
          <th>Kode Bank</th>
          <th>Nama Bank</th>
          <th class="text-right">Saldo</th>
          <th>Jenis Mata Uang</th>
          <th>Telepon</th>
          <th>No Rek.</th>
          <th>Tipe</th>
          <th>Ubah</th>
          <th>Hapus</th>
        </tr></thead>
        <tbody id="kbkTbody"></tbody>
      </table></div>
      <div class="table-footer"><div class="pager"><button>First</button><button>Previous</button><button class="active">1</button><button>Next</button><button>Last</button></div><div id="kbkTotal"></div></div>
    </div>`;
}

function tplKbkRows(rows){
  return rows.map((r,i)=>`
    <tr>
      <td><span style="color:var(--blue);font-weight:600;">${r.kode}</span></td>
      <td>${r.nama||''}</td>
      <td class="text-right">${Number(r.saldo||0).toLocaleString('id-ID',{minimumFractionDigits:2,maximumFractionDigits:2})}</td>
      <td>${r.mataUang||''}</td>
      <td>${r.telepon||''}</td>
      <td>${r.noRekening||''}</td>
      <td>${r.tipeRekening||''}</td>
      <td><button class="icon-btn edit" data-edit="${i}" title="Ubah">${icon('edit',15)}</button></td>
      <td><button class="icon-btn del" data-del="${i}" title="Hapus">${icon('trash',15)}</button></td>
    </tr>`).join('');
}

function tplKasBankForm(mode, row){
  const isAdd = mode === 'add';
  return `
    <div class="breadcrumb">Home / Kas/Bank / <b>${isAdd?'Tambah':'Ubah'}</b></div>
    <div class="card">
      <div class="card-header dark-header">
        <h3>${icon(isAdd?'plus':'edit',15)} Master Bank</h3>
        <button class="btn-danger" id="btnKbkTutorial" type="button">${icon('card',14)} Tutorial</button>
      </div>
      <div class="card-body">
        <div class="form-section">${icon('wallet',15)} Informasi Bank</div>
        <div class="form-grid">
          <div class="form-group">
            <label>Kode Bank</label>
            <div class="input-with-btn">
              <input type="text" id="fKbkKode" value="${row.kode||''}" disabled>
              <button type="button" class="icon-btn edit" id="btnKbkKodeSearch" title="Kode Bank">${icon('search',14)}</button>
            </div>
          </div>
          <div class="form-group">
            <label>Master Bank</label>
            <select id="fKbkMasterBank">${DATA.masterBankList.map(m=>`<option ${row.masterBank===m?'selected':''}>${m}</option>`).join('')}</select>
          </div>
          <div class="form-group">
            <label>Nama Bank</label>
            <input type="text" id="fKbkNama" value="${row.nama||''}" placeholder="Contoh: Kas Kecil HO">
            <div class="form-error" id="fKbkNamaErr">Nama Bank wajib diisi</div>
          </div>
          <div class="form-group">
            <label>Mata Uang</label>
            <select id="fKbkMataUang">
              <option ${row.mataUang==='IDR'||!row.mataUang?'selected':''}>IDR</option>
              <option ${row.mataUang==='USD'?'selected':''}>USD</option>
            </select>
          </div>
          <div class="form-group">
            <label>Telepon</label>
            <input type="text" id="fKbkTelepon" value="${row.telepon||''}">
          </div>
          <div class="form-group">
            <label>Kontak Person</label>
            <input type="text" id="fKbkKontakPerson" value="${row.kontakPerson||''}">
          </div>
          <div class="form-group">
            <label>No. Rekening</label>
            <input type="text" id="fKbkNoRekening" value="${row.noRekening||''}">
          </div>
          <div class="form-group">
            <label>Tipe Rekening</label>
            <select id="fKbkTipeRekening">
              <option ${row.tipeRekening==='Kas'||!row.tipeRekening?'selected':''}>Kas</option>
              <option ${row.tipeRekening==='Bank'?'selected':''}>Bank</option>
            </select>
          </div>
        </div>
        <div class="form-group">
          <label>Alamat</label>
          <textarea id="fKbkAlamat" rows="2">${row.alamat||''}</textarea>
        </div>

        <div class="checkbox-row"><input type="checkbox" id="fKbkNonAktif" ${row.nonAktif?'checked':''}><label for="fKbkNonAktif">Bank tidak aktif</label></div>
        <div class="checkbox-row"><input type="checkbox" id="fKbkSmartlink" ${row.smartlink?'checked':''}><label for="fKbkSmartlink">Aktifkan Integration Smartlink</label></div>
      </div>
      <div class="form-page-actions">
        <a href="#" id="kbkCancel">Batalkan</a>
        <button class="btn-primary" id="kbkSave">Simpan</button>
      </div>
    </div>`;
}

function tplKbkDeleteConfirm(row){
  return `
    <div class="modal-box">
      <div class="modal-header"><span>Hapus Bank</span><span class="close" id="modalClose">&times;</span></div>
      <div class="modal-body"><p>Yakin ingin menghapus bank <b>${row.kode}</b> — ${row.nama||''}?</p></div>
      <div class="modal-footer">
        <button class="btn-secondary" id="modalCancel">Batal</button>
        <button class="btn-danger" id="modalDelete">Hapus</button>
      </div>
    </div>`;
}

function tplKbkInfoModal(title, text){
  return `
    <div class="modal-box">
      <div class="modal-header"><span>${title}</span><span class="close" id="modalClose">&times;</span></div>
      <div class="modal-body"><p>${text}</p></div>
      <div class="modal-footer">
        <button class="btn-primary" id="modalCancel">Tutup</button>
      </div>
    </div>`;
}
