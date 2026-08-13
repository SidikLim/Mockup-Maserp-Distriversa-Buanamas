/* =========================================================
   TEMPLATE (HTML saja) — Master Supplier (Supplier & Pembelian)
   Semua fungsi di file ini HANYA menyusun & mengembalikan
   markup HTML (string), TIDAK ada logic/DOM-binding/data
   mutation di sini. Logic-nya ada di file sebelah:
   master-supplier.js
========================================================= */
function tplMasterSupplierList(){
  return `
    <div class="breadcrumb">Home / <b>Supplier</b></div>
    <div class="page-head">
      <h2>Daftar Supplier</h2>
      <div class="toolbar-actions">
        <button class="btn-outline" id="btnGeneratePpn">${icon('settings',14)} Generate Default Type PPN</button>
        <button class="btn-outline" id="btnUangMuka">${icon('plus',14)} Uang Muka</button>
        <button class="btn-primary" id="btnAddSupplier">${icon('plus',14)} Tambah</button>
        <button class="btn-outline" id="btnImporSupplier">${icon('file',14)} Impor Supplier</button>
      </div>
    </div>
    <div class="card">
      <div class="table-toolbar">
        <select><option>10</option><option selected>20</option><option>50</option><option>100</option></select>
        <input type="text" placeholder="Pencarian Global" id="msSearch">
      </div>
      <div class="table-wrap"><table>
        <thead><tr><th>Kode Supplier</th><th>Supplier</th><th>Crc</th><th>Alamat</th><th class="text-right">Uang Muka</th><th class="text-right">Saldo Utang</th><th>Ubah</th><th>Hapus</th></tr></thead>
        <tbody id="msTbody"></tbody>
      </table></div>
      <div class="table-footer"><div class="pager"><button>First</button><button>Previous</button><button class="active">1</button><button>Next</button><button>Last</button></div><div id="msTotal"></div></div>
    </div>`;
}

function tplMsRows(rows){
  return rows.map((r,i)=>`
    <tr>
      <td>${r.kode}</td>
      <td>${r.nama}</td>
      <td>${r.crc||'IDR'}</td>
      <td>${r.alamat||''}</td>
      <td class="text-right">${Number(r.uangMuka||0).toLocaleString('id-ID',{minimumFractionDigits:2,maximumFractionDigits:2})}</td>
      <td class="text-right">${Number(r.saldoUtang||0).toLocaleString('id-ID',{minimumFractionDigits:2,maximumFractionDigits:2})}</td>
      <td><button class="icon-btn edit" data-edit="${i}" title="Ubah">${icon('edit',15)}</button></td>
      <td><button class="icon-btn del" data-del="${i}" title="Hapus">${icon('trash',15)}</button></td>
    </tr>`).join('');
}

function tplSupplierForm(mode, row){
  const isEdit = mode==='edit';
  return `
    <div class="breadcrumb">Home / Supplier / <b>${isEdit?'Ubah Supplier':'Tambah Supplier'}</b></div>
    <div class="page-head"><h2>${isEdit?'Ubah Supplier':'Tambah Supplier'}</h2></div>
    <div class="card"><div class="card-body">

      <div class="form-grid">
        <div class="form-group">
          <label>Kode Supplier</label>
          <div class="field-pair">
            <select id="fKodePrefix" ${isEdit?'disabled':''}>
              <option value="">-</option>
              <option>VN01</option><option>VN02</option><option>VN03</option>
            </select>
            <input type="text" id="fKodeNum" value="${row.kode||''}" placeholder="Contoh: 1003" ${isEdit?'disabled':''}>
          </div>
          <div class="form-error" id="fKodeErr">Kode Supplier wajib diisi</div>
        </div>
        <div class="form-group">
          <label>Nama Supplier</label>
          <input type="text" id="fNama" value="${row.nama||''}" placeholder="Contoh: PT Sumber Pangan Nusantara">
          <div class="form-error" id="fNamaErr">Nama Supplier wajib diisi</div>
        </div>

        <div class="form-group">
          <label>Kode Supplier Farma</label>
          <input type="text" id="fKodeFarma" value="${row.kodeFarma||''}">
        </div>
        <div class="form-group">
          <label>Nama Supplier Farma</label>
          <input type="text" id="fNamaFarma" value="${row.namaFarma||''}">
        </div>

        <div class="form-group">
          <label>Kode Supplier Alkes</label>
          <input type="text" id="fKodeAlkes" value="${row.kodeAlkes||''}">
        </div>
        <div class="form-group">
          <label>Nama Supplier Alkes</label>
          <input type="text" id="fNamaAlkes" value="${row.namaAlkes||''}">
        </div>

        <div class="form-group">
          <label>Mata Uang</label>
          <select id="fMataUang">
            <option ${row.mataUang==='IDR'||!row.mataUang?'selected':''}>IDR</option>
            <option ${row.mataUang==='USD'?'selected':''}>USD</option>
          </select>
        </div>
        <div class="form-group">
          <label>Wilayah</label>
          <div class="input-with-btn">
            <input type="text" id="fWilayah" value="${row.wilayah||''}" readonly>
            <button type="button" class="icon-btn edit" id="btnWilayahSearch" title="Cari Wilayah">${icon('search',14)}</button>
            <button type="button" class="icon-btn edit" id="btnWilayahAdd" title="Tambah Wilayah Baru" style="background:var(--green);">${icon('plus',14)}</button>
          </div>
        </div>

        <div class="form-group">
          <label>Supplier Group</label>
          <select id="fSupplierGroup">
            ${DATA.supplierGroup.map(g=>`<option value="${g.kode}" ${row.supplierGroup===g.kode?'selected':''}>${g.kode} - ${g.nama}</option>`).join('')}
          </select>
        </div>
        <div class="form-group">
          <label>Telepon</label>
          <input type="text" id="fTelp" value="${row.telp||''}">
        </div>

        <div class="form-group">
          <label>Fax</label>
          <input type="text" id="fFax" value="${row.fax||''}">
        </div>
        <div class="form-group">
          <label>Alamat Email</label>
          <input type="email" id="fEmail" value="${row.email||''}">
        </div>

        <div class="form-group">
          <label>Kontak Person</label>
          <input type="text" id="fKontak" value="${row.kontak||''}">
        </div>
        <div class="form-group">
          <label>Status Supplier</label>
          <div class="radio-inline">
            <label><input type="radio" name="fStatus" value="Aktif" ${row.status!=='Non Aktif'?'checked':''}> Aktif</label>
            <label><input type="radio" name="fStatus" value="Non Aktif" ${row.status==='Non Aktif'?'checked':''}> Non-Aktif</label>
          </div>
        </div>

        <div class="form-group">
          <label>Syarat Bayar</label>
          <div class="input-with-btn">
            <select id="fSyaratBayar">
              ${DATA.syaratBayarList.map(s=>`<option ${row.syaratBayar===s?'selected':''}>${s}</option>`).join('')}
            </select>
            <button type="button" class="icon-btn edit" id="btnSyaratAdd" title="Tambah Syarat Bayar">${icon('plus',14)}</button>
          </div>
        </div>
        <div class="form-group">
          <label>NPWP</label>
          <input type="text" id="fNpwp" value="${row.npwp||''}">
        </div>

        <div class="form-group">
          <label>Batas Kredit</label>
          <input type="text" id="fBatasKredit" value="${Number(row.batasKredit||0).toLocaleString('id-ID')}" style="text-align:right;">
        </div>
        <div class="form-group">
          <label>Kode Pos</label>
          <input type="text" id="fKodePos" value="${row.kodePos||''}">
        </div>

        <div class="form-group">
          <label>Provinsi</label>
          <select id="fProvinsi">
            <option value="">-</option>
            ${DATA.provinsiList.map(p=>`<option ${row.provinsi===p?'selected':''}>${p}</option>`).join('')}
          </select>
        </div>
        <div class="form-group">
          <label>Kabupaten / Kota</label>
          <input type="text" id="fKabupaten" value="${row.kabupaten||''}">
        </div>

        <div class="form-group">
          <label>Kecamatan</label>
          <input type="text" id="fKecamatan" value="${row.kecamatan||''}">
        </div>
        <div class="form-group">
          <label>Kelurahan</label>
          <input type="text" id="fKelurahan" value="${row.kelurahan||''}">
        </div>

        <div class="form-group">
          <label>Type PPN</label>
          <select id="fTypePpn">
            ${DATA.typePpnList.map(t=>`<option ${row.typePpn===t?'selected':''}>${t}</option>`).join('')}
          </select>
        </div>
        <div class="form-group">
          <label>Type PPH</label>
          <select id="fTypePph">
            ${DATA.typePphList.map(t=>`<option ${row.typePph===t?'selected':''}>${t}</option>`).join('')}
          </select>
        </div>
      </div>

      <div class="form-group">
        <label>Alamat</label>
        <textarea id="fAlamat" rows="2">${row.alamat||''}</textarea>
      </div>

      <div class="checkbox-row"><input type="checkbox" id="fIntegration" ${row.integration?'checked':''}><label for="fIntegration">Integration</label></div>
      <div class="checkbox-row"><input type="checkbox" id="fIntegrationFreeStock" ${row.integrationFreeStock?'checked':''}><label for="fIntegrationFreeStock">Integration Free Stock</label></div>

      <div class="form-section">${icon('building',15)} Pusat Bisnis Supplier</div>
      <div id="msPbWrap"></div>
      <a href="#" id="msPbAddRow" class="link-add">${icon('plus',13)} Tambah Bisnis Baru</a>

      <div class="form-section">${icon('bank',15)} Akun GL Utang</div>
      <div class="input-with-btn" style="max-width:420px;">
        <input type="text" id="fAkunGl" value="${row.akunGlUtang||''}" readonly>
        <button type="button" class="icon-btn edit" id="btnAkunGlSearch" title="Cari Akun GL">${icon('search',14)}</button>
      </div>

      <div class="form-page-actions">
        <button class="btn-secondary" id="msCancel">Batalkan</button>
        <button class="btn-primary" id="msSave">Simpan</button>
      </div>
    </div></div>`;
}

function tplMsPbRows(rows){
  return `
    <div class="table-wrap"><table>
      <thead><tr><th>Kode Pusat Bisnis</th><th>Nama Pusat Bisnis</th><th></th></tr></thead>
      <tbody>
        ${rows.length ? rows.map((d,i)=>`
          <tr>
            <td><div class="input-with-btn"><input type="text" value="${d.kode||''}" readonly><button type="button" class="icon-btn edit" data-pb-search="${i}" title="Cari Pusat Bisnis">${icon('search',14)}</button></div></td>
            <td><input type="text" value="${d.nama||'None'}" readonly></td>
            <td><button class="icon-btn del" data-pb-rm="${i}" title="Hapus baris">${icon('trash',14)}</button></td>
          </tr>`).join('') : '<tr><td colspan="3" style="color:var(--text-light);">Belum ada pusat bisnis ditambahkan</td></tr>'}
      </tbody>
    </table></div>`;
}

function tplMsPbPicker(list){
  return `
    <div class="modal-box">
      <div class="modal-header"><span>Pilih Pusat Bisnis</span><span class="close" id="pickerClose">&times;</span></div>
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

function tplMsWilayahPicker(list){
  return `
    <div class="modal-box">
      <div class="modal-header"><span>Pilih Wilayah</span><span class="close" id="pickerClose">&times;</span></div>
      <div class="modal-body">
        <div class="table-wrap"><table>
          <thead><tr><th>Wilayah</th><th></th></tr></thead>
          <tbody>
            ${list.map(w=>`<tr><td>${w}</td><td><button class="btn-secondary btn-pick" data-pick="${w}">Pilih</button></td></tr>`).join('')}
          </tbody>
        </table></div>
      </div>
      <div class="modal-footer"><button class="btn-secondary" id="pickerCancel">Tutup</button></div>
    </div>`;
}

function tplMsWilayahAddModal(){
  return `
    <div class="modal-box">
      <div class="modal-header"><span>Tambah Wilayah Baru</span><span class="close" id="modalClose">&times;</span></div>
      <div class="modal-body">
        <div class="form-group">
          <label>Nama Wilayah</label>
          <input type="text" id="fNewWilayah" placeholder="Contoh: Bogor">
        </div>
      </div>
      <div class="modal-footer">
        <button class="btn-secondary" id="modalCancel">Batal</button>
        <button class="btn-primary" id="modalSave">Simpan</button>
      </div>
    </div>`;
}

function tplMsSyaratAddModal(){
  return `
    <div class="modal-box">
      <div class="modal-header"><span>Tambah Syarat Bayar Baru</span><span class="close" id="modalClose">&times;</span></div>
      <div class="modal-body">
        <div class="form-group">
          <label>Syarat Bayar</label>
          <input type="text" id="fNewSyarat" placeholder="Contoh: N60">
        </div>
      </div>
      <div class="modal-footer">
        <button class="btn-secondary" id="modalCancel">Batal</button>
        <button class="btn-primary" id="modalSave">Simpan</button>
      </div>
    </div>`;
}

function tplMsInfoModal(title, text){
  return `
    <div class="modal-box">
      <div class="modal-header"><span>${title}</span><span class="close" id="modalClose">&times;</span></div>
      <div class="modal-body"><p>${text}</p></div>
      <div class="modal-footer"><button class="btn-primary" id="modalCancel">Tutup</button></div>
    </div>`;
}

function tplMsDeleteConfirm(row){
  return `
    <div class="modal-box">
      <div class="modal-header"><span>Hapus Supplier</span><span class="close" id="modalClose">&times;</span></div>
      <div class="modal-body"><p>Yakin ingin menghapus supplier <b>${row.kode}</b> — ${row.nama||'None'}?</p></div>
      <div class="modal-footer">
        <button class="btn-secondary" id="modalCancel">Batal</button>
        <button class="btn-danger" id="modalDelete">Hapus</button>
      </div>
    </div>`;
}
