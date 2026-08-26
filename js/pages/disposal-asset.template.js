/* =========================================================
   TEMPLATE (HTML saja) — Disposal Asset (Aktiva Tetap > Daftar
   Transaksi > Disposal Asset, page:'disposalAsset'). Semua
   fungsi di file ini HANYA menyusun & mengembalikan markup HTML
   (string), TIDAK ada logic/DOM-binding/data mutation di sini.
   Logic-nya ada di file sebelah: disposal-asset.js

   Sesuai 2 screenshot MASERP 2026-08-26: list "Daftar Disposal
   Asset" (Total Record: 0 di instalasi Sidik sendiri — belum
   ada transaksi disposal tercatat di sana, kolom No.Transaksi/
   Tanggal Transaksi/Keterangan/Total Akm. Penyusutan/Total
   Harga Perolehan/Edit/Delete, toolbar page-size 10 + "Global
   Search", header chip "Agustus 2026" + "+Tambah", pager First/
   Previous/Next/Last TANPA nomor halaman — direproduksi apa
   adanya) & form "+Disposal Fixed Asset" (Auto Number "DIS01"/
   No. Transaksi+refresh/Tgl. Transaksi/Cabang, tab "Detail
   Transaksi"/"Account Journal Details" [label CAMPURAN
   Indonesia+Inggris PERSIS screenshot, quirk direproduksi apa
   adanya — BEDA dari tab Revaluasi Asset yang keduanya
   Indonesia], card "Fixed Asset Item" + tombol "+Add", tabel
   Kode Aset/Nama Aset/Jurnal/Akumulasi Penyusutan/Harga
   Perolehan/hapus, Memo, Total Akumulasi Penyusutan/Total Harga
   Perolehan, footer "Simpan"/"Cancel" [juga campuran Indonesia/
   Inggris persis screenshot]).

   DIS_CABANG_LIST/DIS_CABANG_CODE — SALINAN LOKAL 8-cabang +
   kode alfabetis 3-huruf standar app ini utk No. Transaksi (pola
   sama SR_CABANG_CODE/PO_CABANG_CODE/dst — BEDA dari
   FA_CABANG_CODE milik Master Fixed Asset yang numerik 2-digit,
   dipakai utk Kode Aset bukan No. Transaksi dokumen).

   Kolom "Akumulasi Penyusutan"/"Harga Perolehan" per baris item
   TIDAK disimpan — selalu computed LIVE dari DATA.aktivaTetap +
   Tgl. Transaksi transaksi ini (lihat disHitungSusut() di file
   sebelah), konsisten pola "computed bukan disimpan" Nilai Susut/
   Masa Susut di Master Fixed Asset. */

const DIS_CABANG_LIST = ['Head Office','Surabaya','Bandung','Tangerang','Medan','Makassar','Semarang','Sidoarjo'];
const DIS_CABANG_CODE = {'Head Office':'HO','Surabaya':'SBY','Bandung':'BDG','Tangerang':'TGR','Medan':'MDN','Makassar':'MKS','Semarang':'SMG','Sidoarjo':'SDA'};

function tplDisListPage(){
  return `
    <div class="breadcrumb">Home / <b>Daftar Disposal Asset</b></div>
    <div class="card">
      <div class="card-header dark-header">
        <h3>${icon('alertTriangle',15)} Daftar Disposal Asset</h3>
        <div class="toolbar-actions">
          <button class="chip-btn" id="btnDisPeriode">Agustus 2026 ${icon('chevronDown',12)}</button>
          <button class="btn-primary" id="btnDisAdd">${icon('plus',14)} Tambah</button>
        </div>
      </div>
      <div class="table-toolbar">
        <select id="disPageSize"><option selected>10</option><option>25</option><option>50</option></select>
        <input type="text" id="disSearch" placeholder="Global Search">
      </div>
      <div class="table-wrap"><table>
        <thead><tr>
          <th>No.Transaksi</th>
          <th>Tanggal Transaksi</th>
          <th>Keterangan</th>
          <th class="text-right">Total Akm. Penyusutan</th>
          <th class="text-right">Total Harga Perolehan</th>
          <th style="width:70px;">Edit</th>
          <th style="width:70px;">Delete</th>
        </tr></thead>
        <tbody id="disTbody"></tbody>
      </table></div>
      <div class="table-footer"><div class="pager" id="disPager"></div><div id="disTotal"></div></div>
    </div>`;
}

function tplDisRows(rows){
  if(!rows.length) return `<tr><td colspan="7" style="color:var(--text-light);text-align:center;">Tidak Ada Data</td></tr>`;
  return rows.map((r) => {
    const idx = DATA.disposalAsset.indexOf(r);
    const t = disRowTotals(r);
    return `
    <tr>
      <td><a href="#" class="row-link" data-edit="${idx}" style="color:var(--blue);font-weight:600;">${r.noTransaksi}</a></td>
      <td>${r.tglTransaksi}</td>
      <td>${r.keterangan||'-'}</td>
      <td class="text-right">${disNum2(t.akm)}</td>
      <td class="text-right">${disNum2(t.hargaPerolehan)}</td>
      <td><button class="icon-btn edit" data-edit="${idx}" title="Edit">${icon('edit',15)}</button></td>
      <td><button class="icon-btn del" data-del="${idx}" title="Delete">${icon('trash',15)}</button></td>
    </tr>`;
  }).join('');
}

function tplDisPager(page, totalPages){
  return `
    <button data-dispage="1" ${page<=1?'disabled':''}>First</button>
    <button data-dispage="${Math.max(1,page-1)}" ${page<=1?'disabled':''}>Previous</button>
    <button data-dispage="${Math.min(totalPages,page+1)}" ${page>=totalPages?'disabled':''}>Next</button>
    <button data-dispage="${totalPages}" ${page>=totalPages?'disabled':''}>Last</button>`;
}

/* ---------- Form "Disposal Fixed Asset" ---------- */
function tplDisItemRow(item, idx, tglTransaksi){
  const asset = disAssetOf(item.kode);
  const calc = disHitungSusut(asset, tglTransaksi);
  const jurnalOptions = DATA.jurnalFixedAsset.filter(j => j.tipe === 'Disposal');
  return `
    <tr data-disitem="${idx}">
      <td>
        <div class="input-with-btn">
          <input type="text" value="${item.kode||''}" readonly placeholder="Cari kode aset...">
          <button class="icon-btn edit" data-disaset-pick="${idx}" type="button">${icon('search',14)}</button>
        </div>
      </td>
      <td>${asset ? asset.nama : ''}</td>
      <td>
        <select data-disjurnal="${idx}">
          <option value="" ${!item.jurnalKode?'selected':''}>--- Pilih Jurnal ---</option>
          ${jurnalOptions.map(j=>`<option value="${j.kode}" ${item.jurnalKode===j.kode?'selected':''}>${j.keterangan}</option>`).join('')}
        </select>
      </td>
      <td class="text-right">${disNum2(calc.akm)}</td>
      <td class="text-right">${asset?disNum2(asset.hargaBeli):'0,00'}</td>
      <td><button class="icon-btn del" data-disitem-del="${idx}" type="button" title="Hapus">${icon('trash',15)}</button></td>
    </tr>`;
}

function tplDisItemsTable(row){
  const items = (row.items && row.items.length) ? row.items : [{kode:'',jurnalKode:''}];
  return `
    <div class="card" style="margin-top:0;box-shadow:none;border:1px solid var(--border);">
      <div class="card-header dark-header" style="padding:10px 16px;">
        <h3 style="font-size:13px;">${icon('alertTriangle',14)} Fixed Asset Item</h3>
        <button class="btn-primary" id="btnDisItemAdd" type="button">${icon('plus',13)} Add</button>
      </div>
      <div class="table-wrap"><table class="po-item-table">
        <thead><tr>
          <th>Kode Aset</th><th>Nama Aset</th><th>Jurnal</th>
          <th class="text-right">Akumulasi Penyusutan</th>
          <th class="text-right">Harga Perolehan</th>
          <th></th>
        </tr></thead>
        <tbody id="disItemsBody">${items.map((it,i)=>tplDisItemRow(it,i,row.tglTransaksi)).join('')}</tbody>
      </table></div>
    </div>`;
}

function tplDisDetailTab(row){
  const totals = disRowTotals(row);
  return `
    ${tplDisItemsTable(row)}
    <div class="grid-2" style="gap:24px;margin-top:18px;align-items:start;">
      <div class="form-group">
        <label>Memo</label>
        <textarea id="fDisMemo" class="po-textarea" rows="4">${row.keterangan||''}</textarea>
      </div>
      <div>
        <div class="form-group"><label>Total Akumulasi Penyusutan:</label>
          <input type="text" value="${disNum2(totals.akm)}" readonly style="text-align:right;background:#f4f6fb;color:var(--text-light);"></div>
        <div class="form-group"><label>Total Harga Perolehan:</label>
          <input type="text" value="${disNum2(totals.hargaPerolehan)}" readonly style="text-align:right;background:#f4f6fb;color:var(--text-light);"></div>
      </div>
    </div>`;
}

function tplDisJurnalTab(row){
  const lines = disBuildJurnalLines(row);
  if(!lines.length){
    return `<p style="color:var(--text-light);padding:20px 0;">Pilih Jurnal pada baris Fixed Asset Item terlebih dahulu untuk menampilkan rincian jurnal akun.</p>`;
  }
  const totalDebit = lines.reduce((s,l)=>s+l.debit,0);
  const totalKredit = lines.reduce((s,l)=>s+l.kredit,0);
  const selisih = Math.abs(totalDebit-totalKredit);
  return `
    <div class="table-wrap"><table class="po-item-table">
      <thead><tr><th>Kode Akun</th><th>Nama Akun</th><th>Keterangan</th><th class="text-right">Jumlah Debit</th><th class="text-right">Jumlah Kredit</th></tr></thead>
      <tbody>
        ${lines.map(l=>`<tr><td>${l.akun||'-'}</td><td>${disAkunNamaOf(l.akun)}</td><td>${l.ket}</td><td class="text-right">${disNum2(l.debit)}</td><td class="text-right">${disNum2(l.kredit)}</td></tr>`).join('')}
      </tbody>
      <tfoot><tr style="font-weight:700;">
        <td colspan="3" class="text-right">Jumlah Debit - Kredit</td>
        <td class="text-right">${disNum2(totalDebit)}</td>
        <td class="text-right" style="${selisih>0.5?'color:var(--red);':''}">${disNum2(totalKredit)}</td>
      </tr></tfoot>
    </table></div>`;
}

function tplDisForm(mode, row){
  const isEdit = mode === 'edit';
  return `
    <div class="breadcrumb">Home / Daftar Disposal Asset / <b>${isEdit?'Ubah':'Tambah'}</b></div>
    <div class="card">
      <div class="card-header dark-header">
        <h3>${icon(isEdit?'edit':'plus',15)} Disposal Fixed Asset</h3>
      </div>
      <div class="card-body">
        <h2 style="font-size:19px;font-weight:600;color:var(--navy);margin:0 0 16px;padding-bottom:14px;border-bottom:1px solid var(--border);">Disposal Asset</h2>
        <div class="grid-2" style="gap:20px;">
          <div class="form-group">
            <label>Auto Number</label>
            <select id="fDisAutoNumber" disabled><option selected>DIS01</option></select>
          </div>
          <div class="form-group">
            <label>No. Transaksi</label>
            <div class="input-with-btn">
              <input type="text" id="fDisNoTransaksi" value="${row.noTransaksi||''}" readonly>
              <button class="icon-btn edit" id="btnDisRefreshNo" type="button">${icon('refreshCw',14)}</button>
            </div>
          </div>
          <div class="form-group">
            <label>Tgl. Transaksi</label>
            <div class="input-with-btn"><input type="text" id="fDisTglTransaksi" value="${row.tglTransaksi||''}" placeholder="dd/mm/yyyy"><button class="icon-btn edit" type="button">${icon('calendar',14)}</button></div>
          </div>
          <div class="form-group">
            <label>Cabang</label>
            <select id="fDisCabang">${DIS_CABANG_LIST.map(c=>`<option ${row.cabang===c?'selected':''}>${c}</option>`).join('')}</select>
          </div>
        </div>
        <div class="inv-tabs">
          <button type="button" class="inv-tab-btn active" id="disTabDetailBtn">Detail Transaksi</button>
          <button type="button" class="inv-tab-btn" id="disTabJurnalBtn">Account Journal Details</button>
        </div>
        <div id="disTabDetailContent">${tplDisDetailTab(row)}</div>
        <div id="disTabJurnalContent" style="display:none;">${tplDisJurnalTab(row)}</div>
        <div class="form-error" id="fDisErr"></div>
        <div class="form-page-actions">
          <button class="btn-secondary" id="btnDisCancel">Cancel</button>
          <button class="btn-primary" id="btnDisSave">Simpan</button>
        </div>
      </div>
    </div>`;
}

/* Picker "Pilih Fixed Asset" — hanya menampilkan aset yang belum
   di-disposal (`!a.disposalNo`) & belum dipakai baris item lain
   di transaksi yang sedang diedit. */
function tplDisAsetPicker(list){
  if(!list.length) return `
    <div class="modal-box" style="max-width:560px;">
      <div class="modal-header"><span>Pilih Fixed Asset</span><span class="close" id="pickerClose">&times;</span></div>
      <div class="modal-body"><p style="color:var(--text-light);">Tidak ada aset yang bisa dipilih (semua aset sudah di-disposal atau sudah dipakai baris lain).</p></div>
      <div class="modal-footer"><button class="btn-secondary" id="pickerCancel">Tutup</button></div>
    </div>`;
  return `
    <div class="modal-box" style="max-width:640px;">
      <div class="modal-header"><span>Pilih Fixed Asset</span><span class="close" id="pickerClose">&times;</span></div>
      <div class="modal-body">
        <input type="text" id="disAsetPickerSearch" placeholder="Cari kode / nama aset..." style="width:100%;border:1px solid var(--border);border-radius:6px;padding:8px 10px;font-size:12.8px;margin-bottom:12px;">
        <div class="table-wrap" style="max-height:360px;overflow:auto;">
          <table>
            <thead><tr><th>Kode Aset</th><th>Nama Aset</th><th>Cabang</th><th></th></tr></thead>
            <tbody id="disAsetPickerBody">${tplDisAsetPickerRows(list)}</tbody>
          </table>
        </div>
      </div>
      <div class="modal-footer"><button class="btn-secondary" id="pickerCancel">Tutup</button></div>
    </div>`;
}

function tplDisAsetPickerRows(list){
  if(!list.length) return `<tr><td colspan="4" style="color:var(--text-light);">Tidak ada aset ditemukan</td></tr>`;
  return list.map(a=>`
    <tr>
      <td>${a.kode}</td>
      <td>${a.nama}</td>
      <td>${a.cabang}</td>
      <td><button class="btn-pick" data-pick-aset="${a.kode}">Pilih</button></td>
    </tr>`).join('');
}

function tplDisDeleteConfirm(row){
  return `
    <div class="modal-box">
      <div class="modal-header"><span>Hapus Disposal Asset</span><span class="close" id="modalClose">&times;</span></div>
      <div class="modal-body"><p>Yakin ingin menghapus transaksi <b>${row.noTransaksi}</b>? Aset yang sudah di-disposal lewat transaksi ini akan dikembalikan menjadi tersedia lagi (bisa dipilih di transaksi Disposal baru).</p></div>
      <div class="modal-footer">
        <button class="btn-secondary" id="modalCancel">Batal</button>
        <button class="btn-danger" id="modalDelete">Hapus</button>
      </div>
    </div>`;
}

function tplDisInfoModal(title, text){
  return `
    <div class="modal-box">
      <div class="modal-header"><span>${title}</span><span class="close" id="modalClose">&times;</span></div>
      <div class="modal-body"><p>${text}</p></div>
      <div class="modal-footer"><button class="btn-primary" id="modalOk">Tutup</button></div>
    </div>`;
}
