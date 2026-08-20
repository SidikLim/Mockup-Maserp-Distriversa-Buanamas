/* =========================================================
   TEMPLATE (HTML saja) — Dominasi (Customer & Penjualan >
   Master & Setting). Semua fungsi di file ini HANYA menyusun &
   mengembalikan markup HTML (string), TIDAK ada logic/DOM-
   binding/data mutation di sini. Logic-nya ada di file sebelah:
   dominasi.js

   Sesuai 5 screenshot MASERP yang dikirim user: 1 list "Daftar
   Dominasi" (tombol teal "Setting Claim Dominasi" di kanan atas
   header + kolom No Dominasi/Tanggal/Type/Customer/No SP/Nilai/
   Status), 1 sub-halaman "Dominasi Claim Setting" (list terpisah
   Tgl. Efektif + Claim Persen, dibuka dari tombol di atas — BUKAN
   menu sidebar tersendiri), dan 2 varian form "Dominasi Setting"
   yang field-nya BEDA tergantung field "Tipe" (Regular vs Fix) —
   sama persis pola DRIVER "Promotion Category" di modul Promotion:
   begitu Tipe diganti, bagian bawah form (setelah blok BC/Div/
   Principal) di-render ulang total lewat tplDominasiFormBody().

   - Tipe **Regular**: baris terakhir berisi Nominal Max (input
     manual) + Jumlah Pakai (input, mewakili nilai guarantee yang
     sudah terpakai) + Status (Active/Non Active). TIDAK ada tabel
     rincian barang.
   - Tipe **Fix**: baris terakhir HANYA Nominal Max (READONLY,
     auto-dijumlah dari kolom Jumlah tabel rincian barang di
     bawahnya — persis contoh screenshot dimana 616.012 + 4.455.000
     + 5.044.900 = 10.115.912 sama persis dengan Nominal Max yang
     ditampilkan) + Status, TANPA Jumlah Pakai — diganti tabel
     rincian barang (Kode Barang/Nama Barang/Qty/Satuan/HNA/HNA1/
     Discount Principal/Discount Distributor/Jumlah) yang bisa
     ditambah/dihapus barisnya. Formula per baris: Jumlah = HNA1 ×
     (1 − Discount Principal% − Discount Distributor%) × Qty — pola
     sama seperti Discount Category di Promotion yang juga
     mengurangi 2 diskon persen sekaligus dari 1 harga dasar.

   Field "No. Guarantee" adalah nomor Dominasi itu sendiri (sama
   dengan "No Dominasi" di list) — auto-generate readonly begitu
   Tambah, format beda per Tipe (lihat domGenerateNumber() di
   dominasi.js): "B-DM320260800XX" untuk Regular, "B-DM060FIX26080
   0XX" untuk Fix — meniru 2 contoh nomor di screenshot form.
   "Customer" & "Principal" masing-masing punya kode referensi kecil
   abu-abu di bawah input (mis. "A000023823"/"HOVDR102IDR" di
   screenshot) — di mockup ini kode itu murni dekoratif (customerRef/
   principalRef di DATA.dominasi), TIDAK dipakai modul lain. "BC" &
   "Div" ditampilkan sebagai KODE saja (bukan nama) persis screenshot,
   sebagai dropdown ke DATA.businessCentre/DATA.divisi yang sudah ada.

   Picker Customer/Principal & picker Barang (khusus tabel Fix)
   DISALIN LOKAL dari pola tplPromCustomerPicker/tplPromSupplierPicker/
   tplPromGroupOrItemPicker (Promotion) — bukan direferensi cross-file
   karena lazy-load antar modul tidak terjamin urutannya (pola sama
   seperti salinan lokal picker Akun GL di Master Customer/Kategori
   Barang/Pembelian BPB).

   Data customer/principal di sample DIGANTI ke milik DBM sendiri
   (DATA.customers/DATA.suppliers) — screenshot asli menampilkan nama
   dokter/apotek/instansi dari demo distributor farmasi lain, bukan
   data PT Distriversa Buanamas (lihat catatan di DATA.dominasi,
   js/data.js).
========================================================= */

/* ---------- Helper tampilan ---------- */
function tplDomTypeText(tipe){
  return tipe === 'Fix' ? 'FIX' : 'REG';
}

/* "Status" di kolom list (Ready/Terpakai) BEDA dari field "Status"
   di form (Active/Non Active) — kolom list ini murni menandai apakah
   nilai guarantee-nya sudah dipakai/dialokasikan ke transaksi
   (`row.dipakai`), bukan status aktif/non-aktif settingnya sendiri. */
function tplDomStatusText(dipakai){
  return dipakai
    ? `<span style="color:var(--blue-light);font-weight:700;">Terpakai</span>`
    : `<span class="st-open">Ready</span>`;
}

/* ---------- LIST "Daftar Dominasi" ---------- */
function tplDominasiListPage(){
  return `
    <div class="breadcrumb">Home / <b>Dominasi</b></div>
    <div class="card">
      <div class="card-header dark-header">
        <h3>${icon('shield',15)} Daftar Dominasi</h3>
        <div class="toolbar-actions">
          <button class="btn-teal" id="btnDomClaimSetting">${icon('percent',14)} Setting Claim Dominasi</button>
          <button class="btn-primary" id="btnDomAdd">${icon('plus',14)} Tambah</button>
        </div>
      </div>
      <div class="table-toolbar">
        <select id="domPageSize"><option selected>10</option><option>25</option><option>50</option></select>
        <input type="text" id="domSearch" placeholder="Pencarian Global">
      </div>
      <div class="table-wrap"><table>
        <thead><tr>
          <th>No Dominasi</th>
          <th>Tanggal</th>
          <th>Type</th>
          <th>Customer</th>
          <th>No SP</th>
          <th>Nilai</th>
          <th>Status</th>
          <th>Ubah</th>
          <th>Hapus</th>
        </tr></thead>
        <tbody id="domTbody"></tbody>
      </table></div>
      <div class="table-footer"><div class="pager"><button>First</button><button>Previous</button><button class="active">1</button><button>Next</button><button>Last</button></div><div id="domTotal"></div></div>
    </div>`;
}

function tplDomRows(rows){
  if(!rows.length) return `<tr><td colspan="9" style="color:var(--text-light);">Tidak ada data Dominasi</td></tr>`;
  return rows.map((r,i)=>`
    <tr>
      <td><a href="#" class="dom-no-link" data-edit="${i}" style="color:var(--blue);font-weight:600;text-decoration:underline;">${r.no}</a></td>
      <td>${r.tanggal}</td>
      <td>${tplDomTypeText(r.tipe)}</td>
      <td>${r.customerNama}</td>
      <td>${r.noSpGuarantee||'-'}</td>
      <td class="text-right">${num(r.nominalMax||0)}</td>
      <td>${tplDomStatusText(r.dipakai)}</td>
      <td><button class="icon-btn edit" data-edit="${i}" title="Ubah">${icon('edit',15)}</button></td>
      <td><button class="icon-btn del" data-del="${i}" title="Hapus">${icon('trash',15)}</button></td>
    </tr>`).join('');
}

/* ---------- Form "Dominasi Setting" — header umum ke-2 varian ---------- */
function tplDominasiHeaderFields(mode, row){
  const isEdit = mode === 'edit';
  return `
    <div class="po-grid-3">
      <div class="form-group">
        <label>Customer</label>
        <div class="input-with-btn">
          <input type="text" id="fDomCustomer" value="${row.customerNama||''}" placeholder="Pilih Customer" readonly>
          <button type="button" class="icon-btn edit" id="domCustomerSearch" title="Cari Customer">${icon('search',13)}</button>
        </div>
        <div id="fDomCustomerRef" style="font-size:11px;color:var(--text-light);margin-top:4px;">${row.customerRef||''}</div>
      </div>
      <div class="form-group">
        <label>No. Sp Guarantee</label>
        <input type="text" id="fDomNoSpGuarantee" value="${row.noSpGuarantee||''}">
      </div>
      <div class="form-group">
        <label>No. Guarantee</label>
        <div class="input-with-btn">
          <input type="text" id="fDomNoGuarantee" value="${row.no||''}" disabled>
          ${!isEdit ? `<button type="button" class="icon-btn edit" id="domRefreshNo" title="Generate Nomor">${icon('refreshCw',13)}</button>` : ''}
        </div>
      </div>
    </div>
    <div class="po-grid-3">
      <div class="form-group">
        <label>Tipe</label>
        <select id="fDomTipe">
          <option value="Regular" ${row.tipe==='Regular'?'selected':''}>Regular</option>
          <option value="Fix" ${row.tipe==='Fix'?'selected':''}>Fix</option>
        </select>
      </div>
      <div class="form-group">
        <label>Tenor</label>
        <input type="number" id="fDomTenor" value="${row.tenor||0}">
      </div>
      <div class="form-group">
        <label>Tanggal</label>
        <div class="input-with-btn"><input type="text" id="fDomTanggal" value="${row.tanggal||''}"><span class="icon-btn edit" style="pointer-events:none;">${icon('calendar',13)}</span></div>
      </div>
    </div>
    <div class="po-grid-3">
      <div class="form-group">
        <label>BC</label>
        <select id="fDomBc">
          ${DATA.businessCentre.map(b=>`<option value="${b.kode}" ${row.bcKode===b.kode?'selected':''}>${b.kode}</option>`).join('')}
        </select>
      </div>
      <div class="form-group">
        <label>Div</label>
        <select id="fDomDiv">
          ${DATA.divisi.map(d=>`<option value="${d.kode}" ${row.divKode===d.kode?'selected':''}>${d.kode}</option>`).join('')}
        </select>
      </div>
      <div class="form-group">
        <label>Principal</label>
        <div class="input-with-btn">
          <input type="text" id="fDomPrincipal" value="${row.principalNama||''}" placeholder="Pilih Supplier" readonly>
          <button type="button" class="icon-btn edit" id="domPrincipalSearch" title="Cari Supplier">${icon('search',13)}</button>
        </div>
        <div id="fDomPrincipalRef" style="font-size:11px;color:var(--text-light);margin-top:4px;">${row.principalRef||''}</div>
      </div>
    </div>`;
}

function tplDomStatusOptions(sel){
  return `
    <option value="Active" ${sel==='Active'?'selected':''}>Active</option>
    <option value="Non Active" ${sel==='Non Active'?'selected':''}>Non Active</option>`;
}

/* ---------- Varian REGULAR ---------- */
function tplDominasiRegularBody(mode, row){
  return `
    <div class="po-grid-3">
      <div class="form-group">
        <label>Nominal Max</label>
        <input type="number" id="fDomNominalMax" value="${row.nominalMax||0}">
      </div>
      <div class="form-group">
        <label>Jumlah Pakai</label>
        <input type="number" id="fDomJumlahPakai" value="${row.jumlahPakai||0}">
      </div>
      <div class="form-group">
        <label>Status</label>
        <select id="fDomStatus">${tplDomStatusOptions(row.statusAktif||'Active')}</select>
      </div>
    </div>`;
}

/* ---------- Varian FIX — tabel rincian barang ---------- */
function tplDomItemRow(item, idx){
  return `
    <tr data-dom-item-row="${idx}">
      <td style="min-width:120px;">
        <div class="input-with-btn">
          <input type="text" data-dom-kode="${idx}" value="${item.kode||''}" placeholder="Kode" readonly>
          <button type="button" class="icon-btn edit" data-dom-item-search="${idx}" title="Cari Barang">${icon('search',13)}</button>
        </div>
      </td>
      <td style="min-width:190px;"><input type="text" data-dom-nama="${idx}" value="${item.nama||''}" readonly></td>
      <td style="width:70px;"><input type="number" min="0" data-dom-qty="${idx}" value="${item.qty||0}"></td>
      <td style="width:80px;"><input type="text" data-dom-satuan="${idx}" value="${item.satuan||''}"></td>
      <td style="width:100px;"><input type="number" min="0" data-dom-hna="${idx}" value="${item.hna||0}"></td>
      <td style="width:100px;"><input type="number" min="0" data-dom-hna1="${idx}" value="${item.hna1||0}"></td>
      <td style="width:90px;"><input type="number" min="0" step="0.01" data-dom-discp="${idx}" value="${item.discPrincipal||0}"></td>
      <td style="width:90px;"><input type="number" min="0" step="0.01" data-dom-discd="${idx}" value="${item.discDistributor||0}"></td>
      <td class="text-right" style="width:110px;" data-dom-jumlah-cell="${idx}">${num(item.jumlah||0)}</td>
      <td style="width:34px;"><button type="button" class="icon-btn del" data-dom-item-del="${idx}" title="Hapus Baris">${icon('trash',13)}</button></td>
    </tr>`;
}

function tplDomItemsTable(items){
  return `
    <div class="table-wrap"><table class="po-item-table">
      <thead><tr>
        <th>Kode Barang</th><th>Nama Barang</th><th>Qty</th><th>Satuan</th>
        <th class="text-right">HNA</th><th class="text-right">HNA1</th>
        <th class="text-right">Discount Principal</th><th class="text-right">Discount Distributor</th>
        <th class="text-right">Jumlah</th><th></th>
      </tr></thead>
      <tbody id="domItemsBody">${items.map((it,idx)=>tplDomItemRow(it,idx)).join('')}</tbody>
    </table></div>`;
}

function tplDominasiFixBody(mode, row){
  return `
    <div class="po-grid-3">
      <div class="form-group">
        <label>Nominal Max</label>
        <input type="text" id="fDomNominalMax" value="${num(row.nominalMax||0)}" disabled>
      </div>
      <div class="form-group">
        <label>Status</label>
        <select id="fDomStatus">${tplDomStatusOptions(row.statusAktif||'Active')}</select>
      </div>
      <div></div>
    </div>
    <div class="form-section">${icon('box',15)} Rincian Barang</div>
    <div id="domItemsWrap">${tplDomItemsTable(row.items||[])}</div>
    <a href="#" id="domAddItem" class="link-add">${icon('plus',13)} Tambah Barang</a>`;
}

function tplDominasiFormBody(mode, row){
  return row.tipe === 'Fix' ? tplDominasiFixBody(mode, row) : tplDominasiRegularBody(mode, row);
}

function tplDomFooter(){
  return `
    <div class="form-page-actions">
      <button class="btn-secondary" id="domCancel">Batalkan</button>
      <button class="btn-primary" id="domSave">Simpan</button>
    </div>`;
}

function tplDominasiForm(mode, row){
  const isEdit = mode === 'edit';
  return `
    <div class="breadcrumb">Home / Dominasi / <b>${isEdit ? 'Ubah' : 'Tambah'}</b></div>
    <div class="card">
      <div class="card-header dark-header">
        <h3>${icon(isEdit ? 'edit' : 'plus', 15)} ${isEdit ? 'Ubah' : 'Tambah'} Dominasi</h3>
      </div>
      <div class="card-body">
        <h3 style="color:var(--navy);font-size:14px;font-weight:700;padding-bottom:10px;border-bottom:1px solid var(--border);margin-bottom:18px;">Dominasi Setting</h3>
        ${tplDominasiHeaderFields(mode, row)}
        <div id="domFormBody">${tplDominasiFormBody(mode, row)}</div>
        ${tplDomFooter()}
      </div>
    </div>`;
}

/* ---------- Sub-halaman "Dominasi Claim Setting" ---------- */
function tplDomClaimListPage(){
  return `
    <div class="breadcrumb">Home / Dominasi / <b>Claim Setting</b></div>
    <div class="card">
      <div class="card-header dark-header">
        <h3>${icon('percent',15)} Dominasi Claim Setting</h3>
        <div class="toolbar-actions">
          <button class="btn-secondary" id="btnDomClaimBack">&larr; Kembali</button>
          <button class="btn-primary" id="btnDomClaimAdd">${icon('plus',14)} Tambah</button>
        </div>
      </div>
      <div class="table-toolbar">
        <select id="domClaimPageSize"><option selected>10</option><option>25</option><option>50</option></select>
        <input type="text" id="domClaimSearch" placeholder="Pencarian Global">
      </div>
      <div class="table-wrap"><table>
        <thead><tr><th>Tgl. Efektif</th><th class="text-right">Claim Persen</th><th>Ubah</th><th>Hapus</th></tr></thead>
        <tbody id="domClaimTbody"></tbody>
      </table></div>
      <div class="table-footer"><div class="pager"><button>First</button><button>Previous</button><button class="active">1</button><button>Next</button><button>Last</button></div><div id="domClaimTotal"></div></div>
    </div>`;
}

function tplDomClaimRows(rows){
  if(!rows.length) return `<tr><td colspan="4" style="color:var(--text-light);">Tidak ada data</td></tr>`;
  return rows.map((r,i)=>`
    <tr>
      <td>${r.tglEfektif}</td>
      <td class="text-right">${r.claimPersen}</td>
      <td><button class="icon-btn edit" data-claim-edit="${i}" title="Ubah">${icon('edit',15)}</button></td>
      <td><button class="icon-btn del" data-claim-del="${i}" title="Hapus">${icon('trash',15)}</button></td>
    </tr>`).join('');
}

/* Nilai "Claim Persen" DITULIS APA ADANYA seperti screenshot (mis.
   "0.75" bertitik, bukan "0,75" berkoma) — beda dari konvensi format
   angka Indonesia (num()/rp()) yang dipakai di seluruh mockup lain,
   tapi sengaja direproduksi persis sesuai contoh MASERP asli. */
function tplDomClaimModal(mode, row){
  return `
    <div class="modal-box">
      <div class="modal-header"><span>${mode==='edit'?'Ubah':'Tambah'} Dominasi Claim Setting</span><span class="close" id="modalClose">&times;</span></div>
      <div class="modal-body">
        <div class="form-group">
          <label>Tgl. Efektif</label>
          <div class="input-with-btn"><input type="text" id="fClaimTglEfektif" value="${row.tglEfektif||''}"><span class="icon-btn edit" style="pointer-events:none;">${icon('calendar',13)}</span></div>
        </div>
        <div class="form-group">
          <label>Claim Persen</label>
          <input type="number" step="0.01" id="fClaimPersen" value="${row.claimPersen!=null?row.claimPersen:0}">
        </div>
      </div>
      <div class="modal-footer">
        <button class="btn-secondary" id="modalCancel">Batal</button>
        <button class="btn-primary" id="modalSave">Simpan</button>
      </div>
    </div>`;
}

function tplDomClaimDeleteConfirm(row){
  return `
    <div class="modal-box">
      <div class="modal-header"><span>Hapus Dominasi Claim Setting</span><span class="close" id="modalClose">&times;</span></div>
      <div class="modal-body"><p>Yakin ingin menghapus setting claim efektif <b>${row.tglEfektif}</b> (${row.claimPersen})?</p></div>
      <div class="modal-footer">
        <button class="btn-secondary" id="modalCancel">Batal</button>
        <button class="btn-danger" id="modalDelete">Hapus</button>
      </div>
    </div>`;
}

/* ---------- Pickers (DISALIN LOKAL dari pola Promotion, lihat
   catatan header di atas — bukan reference cross-file). ---------- */
function tplDomSimplePicker(title, list){
  return `
    <div class="modal-box" style="max-width:560px;">
      <div class="modal-header"><span>${title}</span><span class="close" id="pickerClose">&times;</span></div>
      <div class="modal-body">
        <div class="table-wrap" style="max-height:340px;overflow:auto;"><table>
          <thead><tr><th>Kode</th><th>Nama</th><th></th></tr></thead>
          <tbody>${list.map(d=>`<tr><td>${d.kode}</td><td>${d.nama}</td><td><button class="btn-pick" data-pick="${d.kode}">Pilih</button></td></tr>`).join('')}</tbody>
        </table></div>
      </div>
      <div class="modal-footer"><button class="btn-secondary" id="pickerCancel">Tutup</button></div>
    </div>`;
}

function tplDomItemPickerRows(list){
  if(!list.length) return `<tr><td colspan="4" style="color:var(--text-light);">Tidak ada barang ditemukan</td></tr>`;
  return list.map(d=>`<tr><td>${d.kode}</td><td>${d.nama}</td><td>${d.satuan}</td><td><button class="btn-pick" data-pick-item="${d.kode}">Pilih</button></td></tr>`).join('');
}

function tplDomItemPicker(list){
  return `
    <div class="modal-box" style="max-width:560px;">
      <div class="modal-header"><span>Pilih Barang</span><span class="close" id="modalClose">&times;</span></div>
      <div class="modal-body">
        <input type="text" id="domItemPickerSearch" placeholder="Cari kode / nama barang..." style="width:100%;border:1px solid var(--border);border-radius:6px;padding:8px 10px;font-size:12.8px;margin-bottom:12px;">
        <div class="table-wrap" style="max-height:340px;overflow:auto;"><table>
          <thead><tr><th>Kode</th><th>Nama</th><th>Satuan</th><th></th></tr></thead>
          <tbody id="domItemPickerBody">${tplDomItemPickerRows(list)}</tbody>
        </table></div>
      </div>
      <div class="modal-footer"><button class="btn-secondary" id="modalCancel">Tutup</button></div>
    </div>`;
}

function tplDomDeleteConfirm(row){
  return `
    <div class="modal-box">
      <div class="modal-header"><span>Hapus Dominasi</span><span class="close" id="modalClose">&times;</span></div>
      <div class="modal-body"><p>Yakin ingin menghapus dominasi <b>${row.no}</b> — ${row.customerNama}?</p></div>
      <div class="modal-footer">
        <button class="btn-secondary" id="modalCancel">Batal</button>
        <button class="btn-danger" id="modalDelete">Hapus</button>
      </div>
    </div>`;
}

function tplDomValidationModal(text){
  return `
    <div class="modal-box">
      <div class="modal-header"><span>Validasi</span><span class="close" id="modalClose">&times;</span></div>
      <div class="modal-body"><p>${text}</p></div>
      <div class="modal-footer"><button class="btn-primary" id="modalOk">Mengerti</button></div>
    </div>`;
}
