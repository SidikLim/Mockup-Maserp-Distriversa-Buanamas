/* =========================================================
   TEMPLATE (HTML saja) — Biaya Asset / "Biaya Fixed Asset"
   (Aktiva Tetap > Daftar Transaksi > Biaya Asset, key
   page:'biayaAsset'). Semua fungsi di file ini HANYA menyusun
   & mengembalikan markup HTML (string) atau helper murni,
   TIDAK ada DOM-binding/mutation. Logic-nya di file sebelah:
   biaya-asset.js
   NB: closeModal() dipakai bersama, didefinisikan di core.js.

   Sesuai 2 screenshot MASERP SDL yang dikirim user 2026-09-01
   (data dipetakan ke master DBM: supplier DATA.suppliers, aset
   DATA.aktivaTetap, jurnal DATA.jurnalFixedAsset — dua entry
   tipe "Biaya" DITAMBAHKAN ke master utk keperluan modul ini,
   lihat komentar di atas DATA.jurnalFixedAsset):
   1) List "Daftar Biaya Fixed Asset": chip periode "September
      2026" (FUNGSIONAL September/Agustus) + Add; kolom
      No.Transaksi / Tanggal Transaksi / Type Transaksi /
      Supplier / Grand Total (semua sort) + aksi Edit / Delete.
      Screenshot SDL kosong — mockup DBM diberi 2 sample
      September 2026 (Type Transaksi: Perbaikan / Maintenance).
   2) Form "+ Biaya Fixed Asset": Supplier (picker); Auto
      Number "FAC01" (dekoratif) + No. Transaksi GLOBAL
      "26/FAC-0000000001" readonly + refresh; Tgl. Transaksi /
      Syarat Bayar (default CBD.) / Tgl. Jth. Tmp. (disabled,
      ikut Tgl). Tab "Detail Transaksi": panel gelap "Fixed
      Asset Item" + Add — kolom Kode Aset (picker) / Nama Aset
      / Keterangan (editable) / Jurnal (dropdown master Jurnal
      Aktiva Tetap) / Jumlah (editable) / hapus; Total = Σ
      Jumlah x Kurs Vendor. Panel "Currency Supplier": Mata
      Uang Vendor (readonly, IDR setelah pilih supplier) +
      Kurs Vendor (EDITABLE, default 1,00). Memo.
      Tab "Account Journal Details": pola Buat Jurnal + tabel
      editable (D akun biaya per item — glDebit jurnal item,
      fallback 5210006 — lawan K 2110001 Hutang Usaha total).
      Simpan menolak jurnal tak balance (modal info).
   Footer: Simpan / Cancel. No. format GLOBAL
   "26/FAC-{urut 10 digit}" (bukan per cabang). */

const FAC_SYARAT_BAYAR_LIST = ['CBD.','COD','Kredit 14 Hari','Kredit 30 Hari'];
const FAC_TIPE_LIST = ['Perbaikan','Maintenance','Sparepart','Lain-lain'];

function facNum2(n){ return Number(n||0).toLocaleString('id-ID', {minimumFractionDigits:2, maximumFractionDigits:2}); }
function facAkunNama(kode){ const a = DATA.akunGL.find(x => x.kode === kode); return a ? a.nama : ''; }

/* =====================================================================
   LIST PAGE — "Daftar Biaya Fixed Asset"
===================================================================== */
function tplFacListPage(bulan){
  return `
    <div class="breadcrumb">Home / Aktiva Tetap / <b>Biaya Asset</b></div>
    <div class="card">
      <div class="card-header dark-header">
        <h3>${icon('alertTriangle',15)} Daftar Biaya Fixed Asset</h3>
        <div class="toolbar-actions">
          <select class="chip-btn" id="facFilterBulan"><option value="09" ${bulan==='09'?'selected':''}>September 2026</option><option value="08" ${bulan==='08'?'selected':''}>Agustus 2026</option></select>
          <button class="btn-primary" id="btnFacAdd">${icon('plus',14)} Add</button>
        </div>
      </div>
      <div class="table-toolbar">
        <select id="facPageSize"><option selected>10</option><option>25</option><option>50</option></select>
        <input type="text" id="facSearch" placeholder="Global Search">
      </div>
      <div class="table-wrap"><table>
        <thead><tr>
          <th>${tplFacSortHeader('No.Transaksi','no')}</th>
          <th style="width:140px;">${tplFacSortHeader('Tanggal Transaksi','tgl')}</th>
          <th style="width:140px;">${tplFacSortHeader('Type Transaksi','tipeTransaksi')}</th>
          <th>${tplFacSortHeader('Supplier','supplier')}</th>
          <th class="text-right" style="width:140px;">${tplFacSortHeader('Grand Total','grandTotal')}</th>
          <th style="width:60px;">Edit</th>
          <th style="width:66px;">Delete</th>
        </tr></thead>
        <tbody id="facTbody"></tbody>
      </table></div>
      <div class="table-footer"><div class="pager"><button>First</button><button>Previous</button><button>Next</button><button>Last</button></div><div id="facTotal"></div></div>
    </div>`;
}

function tplFacSortHeader(label, field){
  return `<span data-fac-sort="${field}" style="cursor:pointer;display:inline-flex;align-items:center;gap:4px;">${label}<span id="facSortIcon_${field}" style="color:var(--text-light);font-size:11px;">&#8693;</span></span>`;
}

function tplFacRows(rows){
  if(!rows.length) return `<tr><td colspan="7" style="color:var(--text-light);padding:14px;text-align:center;font-weight:600;">Tidak Ada Data</td></tr>`;
  return rows.map((r) => {
    const idx = DATA.biayaFixedAsset.indexOf(r);
    return `
    <tr>
      <td><a href="javascript:void(0)" data-fac-edit="${idx}" style="color:var(--blue);font-weight:600;text-decoration:none;">${r.no}</a></td>
      <td>${r.tgl||''}</td>
      <td>${r.tipeTransaksi||''}</td>
      <td>${(r.supplier||'').toUpperCase()}</td>
      <td class="text-right">${facNum2(facGrandTotal(r))}</td>
      <td><button class="icon-btn edit" data-fac-edit="${idx}" title="Edit">${icon('edit',15)}</button></td>
      <td><button class="icon-btn del" data-fac-del="${idx}" title="Delete">${icon('trash',15)}</button></td>
    </tr>`;
  }).join('');
}

function facGrandTotal(r){
  const kurs = Number(r.kursVendor || 1);
  return (r.items || []).reduce((a, it) => a + Number(it.jumlah || 0), 0) * kurs;
}

/* =====================================================================
   FORM (full page)
===================================================================== */
function tplFacForm(mode, row){
  const isAdd = mode === 'add';
  return `
    <div class="breadcrumb">Home / Biaya Asset / <b>${isAdd?'Tambah':'Ubah'}</b></div>
    <div class="card">
      <div class="card-header dark-header">
        <h3>${icon('plus',15)} Biaya Fixed Asset</h3>
        <button class="btn-danger" id="btnFacTutorial">${icon('card',14)} Tutorial</button>
      </div>
      <div class="card-body">
        <div class="form-grid-3" style="grid-template-columns:repeat(3,1fr);align-items:end;">
          <h2 style="font-size:20px;font-weight:700;color:var(--navy);margin:0 0 10px;padding-bottom:10px;border-bottom:1px solid var(--border);">Biaya Fixed Asset</h2>
          <div class="form-group"></div>
          <div class="form-group"></div>
        </div>
        <div class="form-grid-3" style="grid-template-columns:repeat(3,1fr);">
          <div class="form-group">
            <label>Supplier</label>
            <div class="input-with-btn">
              <input type="text" id="fFacSupplier" value="${(row.supplier||'').toUpperCase()}" placeholder="Pilih Supplier" readonly>
              <button type="button" class="icon-btn edit" id="facSupplierSearch" title="Cari Supplier">${icon('search',13)}</button>
            </div>
          </div>
          <div class="form-group">
            <label>Type Transaksi</label>
            <select id="fFacTipe">${FAC_TIPE_LIST.map(t=>`<option ${row.tipeTransaksi===t?'selected':''}>${t}</option>`).join('')}</select>
          </div>
          <div class="form-group"></div>
        </div>
        <div class="form-grid-3" style="grid-template-columns:repeat(5,1fr);">
          <div class="form-group">
            <label>Auto Number</label>
            <select disabled><option>FAC01</option></select>
          </div>
          <div class="form-group">
            <label>No. Transaksi</label>
            <div class="input-with-btn">
              <input type="text" id="fFacNo" value="${row.no||''}" readonly>
              ${isAdd ? `<button type="button" class="icon-btn edit" id="facRefreshNo" title="Generate Ulang Nomor">${icon('refreshCw',13)}</button>` : ''}
            </div>
          </div>
          <div class="form-group">
            <label>Tgl. Transaksi</label>
            <div class="input-with-btn">
              <input type="text" id="fFacTgl" value="${row.tgl||''}">
              <span class="icon-btn edit" style="pointer-events:none;">${icon('calendar',13)}</span>
            </div>
          </div>
          <div class="form-group">
            <label>Syarat Bayar</label>
            <select id="fFacSyaratBayar">${FAC_SYARAT_BAYAR_LIST.map(sb=>`<option ${row.syaratBayar===sb?'selected':''}>${sb}</option>`).join('')}</select>
          </div>
          <div class="form-group">
            <label>Tgl. Jth. Tmp.</label>
            <input type="text" id="fFacTglJthTmp" value="${row.tglJthTmp||row.tgl||''}" disabled style="background:#f2f3f6;">
          </div>
        </div>

        <div class="inv-tabs">
          <button type="button" class="inv-tab-btn active" id="facTabDetailBtn">Detail Transaksi</button>
          <button type="button" class="inv-tab-btn" id="facTabJurnalBtn">Account Journal Details</button>
        </div>

        <div id="facTabDetailContent">
          <div class="card-header dark-header" style="border-radius:6px;margin-top:10px;">
            <h3>${icon('alertTriangle',14)} Fixed Asset Item</h3>
            <button type="button" class="btn-primary" id="facItemAdd">${icon('plus',13)} Add</button>
          </div>
          <div class="table-wrap" style="margin:6px 0 0;">
            <table class="po-item-table">
              <thead><tr>
                <th style="width:190px;">Kode Aset</th>
                <th style="width:220px;">Nama Aset</th>
                <th>Keterangan</th>
                <th style="width:230px;">Jurnal</th>
                <th class="text-right" style="width:140px;">Jumlah</th>
                <th style="width:50px;"></th>
              </tr></thead>
              <tbody id="facItemsBody">${tplFacItemRows(row.items)}</tbody>
            </table>
          </div>
          <div style="display:flex;justify-content:flex-end;align-items:center;gap:10px;margin-top:14px;">
            <span style="font-size:12.5px;font-weight:600;">Total</span>
            <input type="text" id="fFacTotal" value="${facNum2(facGrandTotal(row))}" disabled style="max-width:260px;text-align:right;font-weight:700;">
          </div>

          <div class="form-section" style="margin-top:20px;">Currency Supplier</div>
          <table class="field-table po-rincian-table" style="max-width:620px;">
            <tr>
              <td class="flabel">Mata Uang Vendor</td><td><input type="text" id="fFacMataUang" value="${row.mataUangVendor||''}" disabled style="background:#f2f3f6;"></td>
              <td class="flabel">Kurs Vendor</td><td><input type="number" step="0.01" min="0" id="fFacKurs" value="${row.kursVendor!=null?row.kursVendor:1}" style="text-align:right;"></td>
            </tr>
          </table>

          <div class="form-group" style="max-width:640px;margin-top:16px;">
            <label>Memo</label>
            <textarea id="fFacMemo" class="po-textarea" rows="3">${row.memo||''}</textarea>
          </div>
        </div>
        <div id="facTabJurnalContent" style="display:none;">${tplFacJurnalContent(row)}</div>
      </div>
      <div class="card-footer" style="display:flex;gap:10px;justify-content:flex-end;align-items:center;padding:14px 20px;border-top:1px solid var(--border);">
        <button type="button" class="btn-primary" id="facSimpan">Simpan</button>
        <a href="#" id="facBatalkan" class="link-add" style="margin-top:0;">Cancel</a>
      </div>
    </div>`;
}

function tplFacItemRows(items){
  if(!items || !items.length) return `<tr><td colspan="6" style="color:var(--text-light);">Belum ada Fixed Asset Item — klik "Add".</td></tr>`;
  return items.map((it,idx)=>`
    <tr>
      <td>
        <div class="input-with-btn">
          <input type="text" data-fac-item-kode="${idx}" value="${it.kodeAset||''}" readonly style="background:#f2f3f6;">
          <button type="button" class="icon-btn edit" data-fac-item-pick="${idx}" title="Cari Aset">${icon('search',12)}</button>
        </div>
      </td>
      <td><input type="text" data-fac-item-nama="${idx}" value="${it.namaAset||''}" readonly></td>
      <td><input type="text" data-fac-item-ket="${idx}" value="${it.keterangan||''}" placeholder="mis. Service besar + ganti oli"></td>
      <td><select data-fac-item-jurnal="${idx}"><option value=""></option>${DATA.jurnalFixedAsset.map(j=>`<option ${it.jurnal===j.keterangan?'selected':''}>${j.keterangan}</option>`).join('')}</select></td>
      <td><input type="number" step="0.01" min="0" data-fac-item-jumlah="${idx}" value="${it.jumlah||0}" style="text-align:right;"></td>
      <td style="text-align:center;"><button type="button" class="icon-btn del" data-fac-item-del="${idx}" title="Hapus Baris">${icon('trash',14)}</button></td>
    </tr>`).join('');
}

/* ===== Tab 2 — Account Journal Details ===== */
function tplFacJurnalContent(row){
  const totals = facJurnalTotals(row);
  const selisihColor = Math.abs(totals.selisih) > 0.004 ? 'var(--red)' : 'var(--text)';
  return `
    <div style="display:flex;justify-content:center;margin:14px 0;">
      <button type="button" class="btn-secondary" id="facBuatJurnal">${icon('refreshCw',13)} Buat Jurnal</button>
    </div>
    <div class="card-header dark-header" style="border-radius:6px;">
      <h3>${icon('settings',14)} Account Journal Details</h3>
      <button type="button" class="btn-primary" id="facJurnalAddRow">${icon('plus',13)} Tambah</button>
    </div>
    <div class="table-wrap" style="margin:6px 0 0;">
      <table class="po-item-table">
        <thead><tr>
          <th>Kode Akun</th><th>Nama Akun</th><th>Keterangan</th><th class="text-right">Jumlah Debit</th><th class="text-right">Jumlah Kredit</th><th>Hapus</th>
        </tr></thead>
        <tbody id="facJurnalBody">${tplFacJurnalRows(row.jurnalAkun)}</tbody>
      </table>
    </div>
    <div style="max-width:280px;margin:16px 0 0 auto;">
      <div style="font-size:12.5px;font-weight:600;color:var(--text);margin-bottom:4px;">Jumlah Debit - Kredit</div>
      <input type="text" id="facJurnalSelisih" value="${facNum2(totals.selisih)}" readonly style="text-align:right;font-weight:700;color:${selisihColor};">
    </div>`;
}

function tplFacJurnalRows(list){
  if(!list || !list.length) return `<tr><td colspan="6" style="color:var(--text-light);">Belum ada rincian jurnal — klik "Buat Jurnal".</td></tr>`;
  return list.map((entry,idx)=>`
    <tr>
      <td style="min-width:110px;">
        <div class="input-with-btn">
          <input type="text" data-fac-jurnal-kode="${idx}" value="${entry.kodeAkun||''}" readonly>
          <button type="button" class="icon-btn edit" data-fac-jurnal-akun-search="${idx}" title="Cari Akun GL">${icon('search',12)}</button>
        </div>
      </td>
      <td style="min-width:180px;"><input type="text" data-fac-jurnal-nama="${idx}" value="${entry.namaAkun||''}" readonly></td>
      <td style="min-width:160px;"><input type="text" data-fac-jurnal-ket="${idx}" value="${entry.keterangan||''}"></td>
      <td style="width:150px;"><input type="number" step="0.01" min="0" data-fac-jurnal-debit="${idx}" value="${entry.debit||0}" style="text-align:right;"></td>
      <td style="width:150px;"><input type="number" step="0.01" min="0" data-fac-jurnal-kredit="${idx}" value="${entry.kredit||0}" style="text-align:right;"></td>
      <td style="width:50px;"><button type="button" class="icon-btn del" data-fac-jurnal-del="${idx}" title="Hapus Baris">${icon('trash',14)}</button></td>
    </tr>`).join('');
}

/* Picker Supplier / Aset / Akun GL — salinan lokal. */
function tplFacSupplierPicker(list){
  return `
    <div class="modal-box" style="max-width:640px;">
      <div class="modal-header"><span>Pilih Supplier</span><span class="close" id="modalClose">&times;</span></div>
      <div class="modal-body">
        <input type="text" id="facSupplierPickerSearch" placeholder="Cari kode / nama supplier..." style="width:100%;border:1px solid var(--border);border-radius:6px;padding:8px 10px;font-size:12.8px;margin-bottom:12px;">
        <div class="table-wrap" style="max-height:360px;overflow:auto;">
          <table>
            <thead><tr><th>Kode</th><th>Nama Supplier</th><th></th></tr></thead>
            <tbody id="facSupplierPickerBody">${tplFacSupplierPickerRows(list)}</tbody>
          </table>
        </div>
      </div>
      <div class="modal-footer"><button class="btn-secondary" id="modalCancel">Tutup</button></div>
    </div>`;
}

function tplFacSupplierPickerRows(list){
  if(!list.length) return `<tr><td colspan="3" style="color:var(--text-light);">Tidak ada supplier ditemukan</td></tr>`;
  return list.map(s=>`
    <tr><td>${s.kode}</td><td>${s.nama}</td><td><button class="btn-pick" data-pick-supplier="${s.kode}">Pilih</button></td></tr>`).join('');
}

function tplFacAsetPicker(list){
  return `
    <div class="modal-box" style="max-width:720px;">
      <div class="modal-header"><span>Pilih Fixed Asset</span><span class="close" id="modalClose">&times;</span></div>
      <div class="modal-body">
        <input type="text" id="facAsetPickerSearch" placeholder="Cari kode / nama aset..." style="width:100%;border:1px solid var(--border);border-radius:6px;padding:8px 10px;font-size:12.8px;margin-bottom:12px;">
        <div class="table-wrap" style="max-height:340px;overflow:auto;">
          <table>
            <thead><tr><th>Kode</th><th>Nama Aset</th><th>Cabang</th><th></th></tr></thead>
            <tbody id="facAsetPickerBody">${tplFacAsetPickerRows(list)}</tbody>
          </table>
        </div>
      </div>
      <div class="modal-footer"><button class="btn-secondary" id="modalCancel">Tutup</button></div>
    </div>`;
}

function tplFacAsetPickerRows(list){
  if(!list.length) return `<tr><td colspan="4" style="color:var(--text-light);">Tidak ada aset ditemukan</td></tr>`;
  return list.map(a=>`
    <tr><td>${a.kode}</td><td>${a.nama}</td><td>${a.cabang||''}</td><td><button class="btn-pick" data-pick-aset="${a.kode}">Pilih</button></td></tr>`).join('');
}

function tplFacAkunPicker(list){
  return `
    <div class="modal-box" style="max-width:640px;">
      <div class="modal-header"><span>Pilih Akun GL</span><span class="close" id="modalClose">&times;</span></div>
      <div class="modal-body">
        <input type="text" id="facAkunPickerSearch" placeholder="Cari kode / nama akun..." style="width:100%;border:1px solid var(--border);border-radius:6px;padding:8px 10px;font-size:12.8px;margin-bottom:12px;">
        <div class="table-wrap" style="max-height:360px;overflow:auto;">
          <table>
            <thead><tr><th>Kode</th><th>Nama Akun</th><th>Kat.</th><th></th></tr></thead>
            <tbody id="facAkunPickerBody">${tplFacAkunPickerRows(list)}</tbody>
          </table>
        </div>
      </div>
      <div class="modal-footer"><button class="btn-secondary" id="modalCancel">Tutup</button></div>
    </div>`;
}

function tplFacAkunPickerRows(list){
  if(!list.length) return `<tr><td colspan="4" style="color:var(--text-light);">Tidak ada akun ditemukan</td></tr>`;
  return list.map(a=>`
    <tr><td>${a.kode}</td><td>${a.nama}</td><td>${a.kategori}</td><td><button class="btn-pick" data-fac-pick-akun="${a.kode}">Pilih</button></td></tr>`).join('');
}

function tplFacDeleteConfirm(row){
  return `
    <div class="modal-box">
      <div class="modal-header"><span>Hapus Biaya Fixed Asset</span><span class="close" id="modalClose">&times;</span></div>
      <div class="modal-body"><p>Yakin ingin menghapus transaksi <b>${row.no}</b> — ${(row.supplier||'').toUpperCase()} (${facNum2(facGrandTotal(row))})?</p></div>
      <div class="modal-footer">
        <button class="btn-secondary" id="modalCancel">Batal</button>
        <button class="btn-danger" id="modalDelete">Hapus</button>
      </div>
    </div>`;
}

function tplFacInfoModal(title,text){
  return `
    <div class="modal-box">
      <div class="modal-header"><span>${title}</span><span class="close" id="modalClose">&times;</span></div>
      <div class="modal-body"><p>${text}</p></div>
      <div class="modal-footer"><button class="btn-primary" id="modalOk">Mengerti</button></div>
    </div>`;
}
