/* =========================================================
   TEMPLATE (HTML saja) — Setting Claim Principal (Customer &
   Penjualan > Master & Setting > Setting Claim Principal, page:
   'settingClaimPrincipal'). Semua fungsi di file ini HANYA menyusun
   & mengembalikan markup HTML (string). Logic-nya ada di file
   sebelah: setting-claim-principal.js

   Dibuat 2026-09-30 dari dokumen spesifikasi Modul Claim (BUKAN dari
   screenshot MASERP). Satu baris per principal: email approval To/CC
   (penerima email Pengajuan Claim Principal, cadangan = email di
   Master Supplier), jalur pemulihan default (keputusan: Nota Debit AP),
   dan batas hari respon (lewat batas ini pengajuan ditandai Terlambat
   di Monitoring Claim + tombol Kirim Pengingat). Setting "boleh nota
   kredit sebelum ACC" SENGAJA TIDAK ADA — keputusan: tidak boleh.
   Pola CRUD modal sama Master Collector (master-collector.*).
   NB: closeModal(), openClaimSupplierPicker(), CLAIM_JALUR_LIST ada di
   core.js (helper bersama Modul Claim).
========================================================= */

function tplScpListPage(){
  return `
    <div class="breadcrumb">Home / Customer &amp; Penjualan / <b>Setting Claim Principal</b></div>
    <div class="card">
      <div class="card-header dark-header">
        <h3>${icon('settings',15)} Setting Claim Principal</h3>
        <button class="btn-primary" id="btnScpAdd">${icon('plus',14)} Tambah</button>
      </div>
      <div class="table-toolbar">
        <select id="scpPageSize"><option selected>10</option><option>25</option><option>50</option></select>
        <input type="text" id="scpSearch" placeholder="Pencarian Global">
      </div>
      <div class="table-wrap"><table>
        <thead><tr>
          <th style="width:90px;">Kode</th>
          <th>Principal</th>
          <th>Email Approval (To)</th>
          <th>CC</th>
          <th style="width:150px;">Jalur Pemulihan Default</th>
          <th class="text-right" style="width:120px;">Batas Hari Respon</th>
          <th style="width:100px;">Status</th>
          <th style="width:60px;">Ubah</th>
          <th style="width:60px;">Hapus</th>
        </tr></thead>
        <tbody id="scpTbody"></tbody>
      </table></div>
      <div class="table-footer"><div></div><div id="scpTotal"></div></div>
    </div>`;
}

function tplScpRows(rows){
  if(!rows.length) return `<tr><td colspan="9" style="color:var(--text-light);">Tidak ada Setting Claim Principal</td></tr>`;
  return rows.map(r => {
    const idx = DATA.settingClaimPrincipal.indexOf(r);
    return `
    <tr>
      <td><a href="#" data-edit="${idx}" style="color:var(--blue);font-weight:600;">${r.principalKode}</a></td>
      <td>${r.principalNama}</td>
      <td>${r.emailTo||'-'}</td>
      <td>${r.emailCc||'-'}</td>
      <td>${r.jalurDefault}</td>
      <td class="text-right">${r.batasHariRespon} hari</td>
      <td><span class="status-pill ${r.aktif?'status-paid':'status-overdue'}">${r.aktif?'Aktif':'Non Aktif'}</span></td>
      <td><button class="icon-btn edit" data-edit="${idx}" title="Ubah">${icon('edit',15)}</button></td>
      <td><button class="icon-btn del" data-del="${idx}" title="Hapus">${icon('trash',15)}</button></td>
    </tr>`;
  }).join('');
}

function tplScpModal(mode, row){
  const isEdit = mode === 'edit';
  return `
    <div class="modal-box" style="max-width:560px;">
      <div class="modal-header"><span>${isEdit?'Ubah':'Tambah'} Setting Claim Principal</span><span class="close" id="modalClose">&times;</span></div>
      <div class="modal-body">
        <div class="form-group">
          <label>Principal</label>
          <div class="input-with-btn">
            <input type="text" id="fScpPrincipal" value="${row.principalKode ? row.principalKode+' - '+row.principalNama : ''}" placeholder="Pilih Principal" readonly>
            ${!isEdit ? `<button type="button" class="icon-btn edit" id="scpPrincipalSearch" title="Cari Principal">${icon('search',13)}</button>` : ''}
          </div>
          <div class="form-error" id="fScpPrincipalErr">Principal wajib dipilih</div>
        </div>
        <div class="form-group">
          <label>Email Approval (To)</label>
          <input type="email" id="fScpEmailTo" value="${row.emailTo||''}" placeholder="contoh: claim@principal.co.id">
          <div class="form-error" id="fScpEmailErr">Email approval wajib diisi</div>
        </div>
        <div class="form-group">
          <label>Email CC</label>
          <input type="text" id="fScpEmailCc" value="${row.emailCc||''}" placeholder="Pisahkan dengan koma bila lebih dari satu">
        </div>
        <div class="form-grid" style="gap:12px;">
          <div class="form-group">
            <label>Jalur Pemulihan Default</label>
            <select id="fScpJalur">${CLAIM_JALUR_LIST.map(j=>`<option ${row.jalurDefault===j?'selected':''}>${j}</option>`).join('')}</select>
          </div>
          <div class="form-group">
            <label>Batas Hari Respon</label>
            <input type="number" min="1" id="fScpBatas" value="${row.batasHariRespon||14}">
          </div>
        </div>
        <div class="form-group">
          <label style="display:flex;align-items:center;gap:8px;"><input type="checkbox" id="fScpAktif" ${row.aktif!==false?'checked':''} style="width:auto;"> Aktif</label>
        </div>
        <div style="font-size:11.8px;color:var(--text-light);line-height:1.5;">Pengajuan yang belum dijawab principal lewat batas hari respon ditandai <b>Terlambat</b> di Monitoring Claim. Nota kredit ke customer selalu menunggu ACC principal.</div>
      </div>
      <div class="modal-footer">
        <button class="btn-secondary" id="modalCancel">Batal</button>
        <button class="btn-primary" id="modalSave">Simpan</button>
      </div>
    </div>`;
}

function tplScpDeleteConfirm(row, dipakai){
  return `
    <div class="modal-box">
      <div class="modal-header"><span>Hapus Setting Claim Principal</span><span class="close" id="modalClose">&times;</span></div>
      <div class="modal-body">
        ${dipakai
          ? `<p>Setting <b>${row.principalNama}</b> tidak bisa dihapus karena masih dipakai ${dipakai} Pengajuan Claim. Nonaktifkan saja lewat Ubah.</p>`
          : `<p>Yakin ingin menghapus setting claim untuk <b>${row.principalNama}</b>?</p>`}
      </div>
      <div class="modal-footer">
        <button class="btn-secondary" id="modalCancel">${dipakai?'Tutup':'Batal'}</button>
        ${dipakai?'':'<button class="btn-danger" id="modalDelete">Hapus</button>'}
      </div>
    </div>`;
}
