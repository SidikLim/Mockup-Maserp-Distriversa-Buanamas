/* =========================================================
   TEMPLATE (HTML saja) — Pembelian Aktiva Tetap (Aktiva Tetap >
   Daftar Transaksi > Pembelian Aktiva Tetap, key
   page:'pembelianAktivaTetap'). Semua fungsi di file ini HANYA
   menyusun & mengembalikan markup HTML (string) atau helper
   murni, TIDAK ada DOM-binding/data mutation di sini. Logic-nya
   ada di file sebelah: pembelian-aktiva-tetap.js

   Sesuai 2 screenshot MASERP yang dikirim user:
   1) "Daftar Pembelian Aktiva Tetap": chip filter "Semua" +
      tombol +Tambah; kolom No. Transaksi / Tgl. Trn. / Supplier /
      Tipe Transaksi / Jumlah Akhir + aksi Ubah / Hapus / Lihat /
      Cetak (screenshot kosong "Tidak Ada Data" — di mockup diberi
      2 baris sample supaya list & form Lihat langsung ada isinya).
   2) Form "+ Pembelian Aktiva Tetap": Supplier (picker) + Cabang;
      Auto Number "FA001" (dekoratif) / No. Transaksi
      "26/FAB/HO/08/00001" (+refresh) / Tgl. Trn. / Syarat Bayar
      (CBD. / Kredit N Hari -> Tgl. Jth. Tempo otomatis) / Kirim
      (textarea). Tab "Rincian Transaksi" berisi tabel "Rincian
      Aktiva Tetap" (+Tambah): Kode Aset (picker master Fixed
      Asset — boleh juga dikosongkan utk aset baru), Nama Aset,
      Jurnal (dropdown master Jurnal Aktiva Tetap /
      DATA.jurnalFixedAsset), Harga Beli, Disc(%), Diskon, Jumlah,
      Hapus. Panel "Informasi PPN" (3 radio) + "Rincian Transaksi"
      (Mata Uang/Kurs/Diskon 1-2/DPP) + "Uang Muka" (Oldest/Pilih,
      Sisa U.Muka, Pakai) + Pajak (picker PPN) + Jumlah/Sisa
      Jumlah + Keterangan. Tab "Rincian Jurnal Akun" pola Buat
      Jurnal + tabel editable (tanpa Cost Center): tiap baris aset
      di-debit ke akun golongannya (glDebit master Jurnal Aktiva
      Tetap, fallback peta golongan -> akun 1510xxx), PPN Masukan
      1140002(D), lawannya Hutang Usaha 2110001(K) utk Kredit atau
      Kas Besar 1100002(K) utk CBD/tunai.
   Footer: Cetak dan Simpan / Simpan / Batalkan. Tipe Transaksi di
   list diturunkan dari Syarat Bayar (CBD. -> "Beli Tunai", lainnya
   "Beli Kredit"). No. format "26/FAB/{kode cabang}/08/{urut}". */

const PAT_CABANG_LIST = ['Head Office','Surabaya','Bandung','Medan','Makassar','Semarang','Tangerang','Sidoarjo'];
const PAT_CABANG_CODE = {'Head Office':'HO','Surabaya':'SBY','Bandung':'BDG','Medan':'MDN','Makassar':'MKS','Semarang':'SMG','Tangerang':'TGR','Sidoarjo':'SDA'};
const PAT_SYARAT_BAYAR_LIST = ['CBD.','Kredit 14 Hari','Kredit 30 Hari','Kredit 45 Hari'];
/* Fallback akun debit per golongan aktiva (dipakai kalau glDebit
   master Jurnal Aktiva Tetap kosong). */
const PAT_GOLONGAN_AKUN = {
  'Gedung':'1510002', 'Bangunan':'1510002',
  'Kendaraan Bermotor':'1510003',
  'Perabotan Kantor':'1510004', 'Mesin Peralatan':'1510004',
};

function patNum2(n){ return Number(n||0).toLocaleString('id-ID', {minimumFractionDigits:2, maximumFractionDigits:2}); }
function patAkunNama(kode){ const a = DATA.akunGL.find(x => x.kode === kode); return a ? a.nama : ''; }

function patParseTglID(str){
  const p = String(str||'').split('/');
  if(p.length !== 3) return null;
  return new Date(+p[2], +p[1]-1, +p[0]);
}
function patFormatTglID(d){
  return `${String(d.getDate()).padStart(2,'0')}/${String(d.getMonth()+1).padStart(2,'0')}/${d.getFullYear()}`;
}
function patJatuhTempo(tgl, syarat){
  const d = patParseTglID(tgl);
  if(!d) return '';
  const m = /Kredit\s+(\d+)\s+Hari/i.exec(syarat||'');
  d.setDate(d.getDate() + (m ? +m[1] : 0));
  return patFormatTglID(d);
}

/* =====================================================================
   LIST PAGE — "Daftar Pembelian Aktiva Tetap"
===================================================================== */
function tplPembelianAktivaTetapListPage(){
  return `
    <div class="breadcrumb">Home / Aktiva Tetap / <b>Pembelian Aktiva Tetap</b></div>
    <div class="card">
      <div class="card-header dark-header">
        <h3>${icon('alertTriangle',15)} Daftar Pembelian Aktiva Tetap</h3>
        <div class="toolbar-actions">
          <select class="chip-btn" id="patFilter"><option>Semua</option><option>Beli Tunai</option><option>Beli Kredit</option></select>
          <button class="btn-primary" id="btnPatAdd">${icon('plus',14)} Tambah</button>
        </div>
      </div>
      <div class="table-toolbar">
        <select id="patPageSize"><option selected>10</option><option>25</option><option>50</option></select>
        <input type="text" id="patSearch" placeholder="Pencarian Global">
      </div>
      <div class="table-wrap"><table>
        <thead><tr>
          <th style="width:170px;">No. Transaksi</th>
          <th style="width:100px;">Tgl. Trn.</th>
          <th>Supplier</th>
          <th style="width:130px;">Tipe Transaksi</th>
          <th class="text-right" style="width:140px;">Jumlah Akhir</th>
          <th style="width:70px;">Ubah</th>
          <th style="width:70px;">Hapus</th>
          <th style="width:70px;">Lihat</th>
          <th style="width:70px;">Cetak</th>
        </tr></thead>
        <tbody id="patTbody"></tbody>
      </table></div>
      <div class="table-footer"><div class="pager"><button>First</button><button>Previous</button><button class="active">1</button><button>Next</button><button>Last</button></div><div id="patTotal"></div></div>
    </div>`;
}

function tplPatRows(rows){
  if(!rows.length) return `<tr><td colspan="9" style="text-align:center;font-weight:700;">Tidak Ada Data</td></tr>`;
  return rows.map((r,i)=>`
    <tr>
      <td><button class="link-pick" data-view-link="${i}">${r.no}</button></td>
      <td>${r.tgl||''}</td>
      <td>${r.supplier||''}</td>
      <td>${r.tipeTransaksi||''}</td>
      <td class="text-right">${patNum2(r.jumlahTotal)}</td>
      <td><button class="icon-btn edit" data-edit="${i}" title="Ubah">${icon('edit',15)}</button></td>
      <td><button class="icon-btn del" data-del="${i}" title="Hapus">${icon('trash',15)}</button></td>
      <td><button class="icon-btn view" data-view="${i}" title="Lihat">${icon('eye',15)}</button></td>
      <td><button class="icon-btn print" data-print="${i}" title="Cetak">${icon('printer',15)}</button></td>
    </tr>`).join('');
}

/* =====================================================================
   FORM (full page)
===================================================================== */
function tplPatForm(mode, row){
  const isAdd = mode === 'add';
  const isView = mode === 'view';
  const dis = isView ? 'disabled' : '';
  const titleAction = isAdd ? 'Tambah' : (isView ? 'Lihat' : 'Ubah');
  return `
    <div class="breadcrumb">Home / Pembelian Aktiva Tetap / <b>${titleAction}</b></div>
    <div class="card">
      <div class="card-header dark-header">
        <h3>${icon('plus',15)} Pembelian Aktiva Tetap</h3>
        <button class="btn-danger" id="btnPatTutorial">${icon('card',14)} Tutorial</button>
      </div>
      <div class="card-body">
        <h2 style="font-size:20px;font-weight:700;color:var(--navy);margin:0 0 16px;padding-bottom:10px;border-bottom:1px solid var(--border);max-width:340px;">Pembelian Aktiva Tetap</h2>

        <div class="form-grid-3" style="grid-template-columns:repeat(3,1fr);">
          <div class="form-group">
            <label>Supplier</label>
            <div class="input-with-btn">
              <input type="text" id="fPatSupplier" value="${row.supplier||''}" placeholder="Pilih Supplier" readonly>
              ${!isView ? `<button type="button" class="icon-btn edit" id="patSupplierSearch" title="Cari Supplier">${icon('search',13)}</button>` : ''}
            </div>
          </div>
          <div class="form-group">
            <label>Cabang</label>
            <select id="fPatCabang" ${(!isAdd)?'disabled':dis}>${PAT_CABANG_LIST.map(c=>`<option ${row.cabang===c?'selected':''}>${c}</option>`).join('')}</select>
          </div>
          <div class="form-group"></div>
        </div>

        <div class="form-grid-3" style="grid-template-columns:repeat(5,1fr);">
          <div class="form-group">
            <label>Auto Number</label>
            <select id="fPatAutoNumber" disabled><option>FA001</option></select>
          </div>
          <div class="form-group">
            <label>No. Transaksi</label>
            <div class="input-with-btn">
              <input type="text" id="fPatNo" value="${row.no||''}" readonly>
              ${isAdd ? `<button type="button" class="icon-btn edit" id="patRefreshNo" title="Generate Ulang Nomor">${icon('refreshCw',13)}</button>` : ''}
            </div>
          </div>
          <div class="form-group">
            <label>Tgl. Trn.</label>
            <div class="input-with-btn">
              <input type="text" id="fPatTgl" value="${row.tgl||''}" ${dis}>
              <span class="icon-btn edit" style="pointer-events:none;">${icon('calendar',13)}</span>
            </div>
          </div>
          <div class="form-group">
            <label>Syarat Bayar</label>
            <select id="fPatSyaratBayar" ${dis}>${PAT_SYARAT_BAYAR_LIST.map(s=>`<option ${row.syaratBayar===s?'selected':''}>${s}</option>`).join('')}</select>
          </div>
          <div class="form-group">
            <label>Tgl. Jth. Tempo</label>
            <input type="text" id="fPatTglJthTempo" value="${row.tglJthTempo||''}" disabled>
          </div>
        </div>

        <div class="form-grid-3" style="grid-template-columns:repeat(3,1fr);">
          <div class="form-group" style="grid-column:3;">
            <label>Kirim</label>
            <textarea id="fPatKirim" class="po-textarea" rows="3" ${dis}>${row.kirim||''}</textarea>
          </div>
        </div>

        <div class="inv-tabs">
          <button type="button" class="inv-tab-btn active" id="patTabRincianBtn">Rincian Transaksi</button>
          <button type="button" class="inv-tab-btn" id="patTabJurnalBtn">Rincian Jurnal Akun</button>
        </div>

        <div id="patTabRincianContent">${tplPatRincianTab(row, isView)}</div>
        <div id="patTabJurnalContent" style="display:none;">${tplPatJurnalContent(row, isView)}</div>
      </div>
      <div class="card-footer" style="display:flex;gap:10px;justify-content:flex-end;align-items:center;padding:14px 20px;border-top:1px solid var(--border);">
        ${!isView ? `
          <button type="button" class="btn-teal" id="patCetakSimpan">Cetak dan Simpan</button>
          <button type="button" class="btn-primary" id="patSimpan">Simpan</button>` : ''}
        <a href="#" id="patBatalkan" class="link-add" style="margin-top:0;">${isView?'Tutup':'Batalkan'}</a>
      </div>
    </div>`;
}

/* ===== Tab 1 — Rincian Transaksi (tabel Rincian Aktiva Tetap +
   panel PPN / Rincian Transaksi / Uang Muka + Keterangan) ===== */
function tplPatRincianTab(row, isView){
  return `
    <div class="card-header dark-header" style="border-radius:6px;">
      <h3>${icon('alertTriangle',14)} Rincian Aktiva Tetap</h3>
      ${!isView ? `<button type="button" class="btn-primary" id="patRincianAdd">${icon('plus',13)} Tambah</button>` : ''}
    </div>
    <div class="table-wrap" style="margin:6px 0 0;">
      <table class="po-item-table">
        <thead><tr>
          <th>Kode Aset</th>
          <th>Nama Aset</th>
          <th>Jurnal</th>
          <th class="text-right">Harga Beli</th>
          <th class="text-right">Disc(%)</th>
          <th class="text-right">Diskon</th>
          <th class="text-right">Jumlah</th>
          <th>Hapus</th>
        </tr></thead>
        <tbody id="patItemsBody">${tplPatItemRows(row.items, isView)}</tbody>
      </table>
    </div>

    <div class="form-grid" style="margin-top:24px;">
      <div>
        <div class="form-section">Informasi PPN</div>
        <div class="radio-group">
          <label><input type="radio" name="patPpnMode" value="tidak" ${row.ppnMode==='tidak'?'checked':''} ${isView?'disabled':''}> Tidak ada PPN</label>
          <label><input type="radio" name="patPpnMode" value="inklusif" ${row.ppnMode==='inklusif'?'checked':''} ${isView?'disabled':''}> PPN Inklusif</label>
          <label><input type="radio" name="patPpnMode" value="eksklusif" ${row.ppnMode==='eksklusif'?'checked':''} ${isView?'disabled':''}> PPN Eksklusif (+11%)</label>
        </div>
        <div class="form-group" style="margin-top:20px;max-width:520px;">
          <label>Keterangan</label>
          <textarea id="fPatKeterangan" class="po-textarea" rows="3" ${isView?'disabled':''}>${row.keterangan||''}</textarea>
        </div>
      </div>
      <div>
        <div class="form-section">Rincian Transaksi</div>
        <table class="field-table po-rincian-table">
          <tr><td class="flabel">Mata Uang</td><td><input type="text" value="IDR" disabled></td><td class="flabel">Kurs</td><td><input type="text" value="${patNum2(1)}" disabled></td></tr>
          <tr><td class="flabel">Diskon 1</td><td><input type="number" id="fPatDiskon1" value="${row.diskon1||0}" ${isView?'disabled':''}> %</td><td></td><td><input type="text" id="fPatDiskon1Amount" value="${patNum2(row.diskon1Amount||0)}" disabled></td></tr>
          <tr><td class="flabel">Diskon 2</td><td><input type="number" id="fPatDiskon2" value="${row.diskon2||0}" ${isView?'disabled':''}> %</td><td></td><td><input type="text" id="fPatDiskon2Amount" value="${patNum2(row.diskon2Amount||0)}" disabled></td></tr>
          <tr><td class="flabel">DPP</td><td colspan="3"><input type="text" id="fPatDpp" value="${patNum2(row.dpp||0)}" disabled></td></tr>
        </table>

        <div class="form-section" style="margin-top:16px;">Uang Muka</div>
        <table class="field-table po-rincian-table">
          <tr><td class="flabel">Tipe Uang Muka</td><td colspan="3">
            <div class="radio-inline" style="padding-top:0;">
              <label><input type="radio" name="patUangMukaTipe" value="Oldest" ${row.uangMukaTipe!=='Pilih Uang Muka'?'checked':''} ${isView?'disabled':''}> Oldest</label>
              <label><input type="radio" name="patUangMukaTipe" value="Pilih Uang Muka" ${row.uangMukaTipe==='Pilih Uang Muka'?'checked':''} ${isView?'disabled':''}> Pilih Uang Muka</label>
            </div>
          </td></tr>
          <tr><td class="flabel">Sisa U.Muka</td><td><input type="text" value="${patNum2(row.sisaUangMuka||0)}" disabled></td><td class="flabel">Pakai:</td><td><input type="number" id="fPatUangMukaPakai" value="${row.uangMukaPakai||0}" ${isView?'disabled':''}></td></tr>
          <tr><td class="flabel">Pajak ${row.ppnMode==='eksklusif'?'11':'0'} %</td><td>
              <div class="input-with-btn">
                <input type="text" id="fPatPajak" value="${row.pajak11||''}" placeholder="Pilih Ppn" readonly>
                ${!isView ? `<button type="button" class="icon-btn edit" id="patPajakInfo" title="Cari Kode Pajak">${icon('search',13)}</button>` : ''}
              </div>
            </td><td></td><td><input type="text" id="fPatPpnAmount" value="${patNum2(row.ppnAmount||0)}" disabled></td></tr>
          <tr><td class="flabel">Jumlah</td><td colspan="3"><input type="text" id="fPatJumlahTotal" value="${patNum2(row.jumlahTotal||0)}" disabled style="font-weight:700;font-size:14px;"></td></tr>
          <tr><td class="flabel">Sisa Jumlah</td><td colspan="3"><input type="text" id="fPatSisaJumlah" value="${patNum2(row.sisaJumlah||0)}" disabled></td></tr>
        </table>
      </div>
    </div>`;
}

function tplPatItemRows(items, isView){
  if(!items || !items.length) return `<tr><td colspan="8" style="color:var(--text-light);">Belum ada rincian — klik "+ Tambah" untuk menambah baris aset.</td></tr>`;
  const dis = isView ? 'disabled' : '';
  return items.map((it,idx)=>`
    <tr>
      <td style="min-width:160px;">
        <div class="input-with-btn">
          <input type="text" data-pat-kode="${idx}" value="${it.kodeAset||''}" placeholder="(aset baru)" readonly>
          ${!isView ? `<button type="button" class="icon-btn edit" data-pat-aset-search="${idx}" title="Cari Aset">${icon('search',12)}</button>` : ''}
        </div>
      </td>
      <td style="min-width:200px;"><input type="text" data-pat-nama="${idx}" value="${it.namaAset||''}" ${dis}></td>
      <td style="min-width:220px;">
        <select data-pat-jurnal="${idx}" ${dis}>
          <option value=""></option>
          ${DATA.jurnalFixedAsset.map(j=>`<option value="${j.kode}" ${it.jurnalKode===j.kode?'selected':''}>${j.keterangan}</option>`).join('')}
        </select>
      </td>
      <td style="width:140px;"><input type="number" min="0" data-pat-harga="${idx}" value="${it.hargaBeli||0}" style="text-align:right;" ${dis}></td>
      <td style="width:90px;"><input type="number" min="0" data-pat-disc="${idx}" value="${it.disc||0}" style="text-align:right;" ${dis}></td>
      <td style="width:120px;"><input type="text" data-pat-diskon="${idx}" value="${patNum2(it.diskon||0)}" disabled style="text-align:right;"></td>
      <td style="width:140px;"><input type="text" data-pat-jumlah="${idx}" value="${patNum2(it.jumlah||0)}" disabled style="text-align:right;"></td>
      <td style="width:60px;">${!isView ? `<button type="button" class="icon-btn del" data-pat-del="${idx}" title="Hapus Baris">${icon('trash',14)}</button>` : ''}</td>
    </tr>`).join('');
}

/* ===== Tab 2 — Rincian Jurnal Akun (Buat Jurnal + tabel editable,
   tanpa Cost Center — pola Retur Pembelian) ===== */
function tplPatJurnalContent(row, isView){
  const totals = patJurnalTotals(row);
  const selisihColor = Math.abs(totals.selisih) > 0.004 ? 'var(--red)' : 'var(--text)';
  return `
    ${!isView ? `<div style="display:flex;justify-content:center;margin:14px 0;">
      <button type="button" class="btn-secondary" id="patBuatJurnal">${icon('refreshCw',13)} Buat Jurnal</button>
    </div>` : '<div style="margin-top:14px;"></div>'}
    <div class="card-header dark-header" style="border-radius:6px;">
      <h3>${icon('settings',14)} Rincian Jurnal Akun</h3>
      ${!isView ? `<button type="button" class="btn-primary" id="patJurnalAddRow">${icon('plus',13)} Tambah</button>` : ''}
    </div>
    <div class="table-wrap" style="margin:6px 0 0;">
      <table class="po-item-table">
        <thead><tr>
          <th>Kode Akun</th><th>Nama Akun</th><th>Keterangan</th><th class="text-right">Jumlah Debit</th><th class="text-right">Jumlah Kredit</th><th>Hapus</th>
        </tr></thead>
        <tbody id="patJurnalBody">${tplPatJurnalRows(row.jurnalAkun, isView)}</tbody>
      </table>
    </div>
    <div style="max-width:280px;margin:16px 0 0 auto;">
      <div style="font-size:12.5px;font-weight:600;color:var(--text);margin-bottom:4px;">Jumlah Debit - Kredit</div>
      <input type="text" id="patJurnalSelisih" value="${patNum2(totals.selisih)}" readonly style="text-align:right;font-weight:700;color:${selisihColor};">
    </div>`;
}

function tplPatJurnalRows(list, isView){
  if(!list || !list.length) return `<tr><td colspan="6" style="color:var(--text-light);">Belum ada rincian jurnal — klik "Buat Jurnal".</td></tr>`;
  return list.map((entry,idx)=>{
    if(isView){
      return `
      <tr>
        <td style="min-width:110px;"><input type="text" value="${entry.kodeAkun||''}" readonly></td>
        <td style="min-width:180px;"><input type="text" value="${entry.namaAkun||''}" readonly></td>
        <td style="min-width:160px;"><input type="text" value="${entry.keterangan||''}" readonly></td>
        <td style="width:150px;"><input type="text" value="${patNum2(entry.debit||0)}" readonly style="text-align:right;"></td>
        <td style="width:150px;"><input type="text" value="${patNum2(entry.kredit||0)}" readonly style="text-align:right;"></td>
        <td style="width:50px;"></td>
      </tr>`;
    }
    return `
    <tr data-pat-jurnal-row="${idx}">
      <td style="min-width:110px;">
        <div class="input-with-btn">
          <input type="text" data-pat-jurnal-kode="${idx}" value="${entry.kodeAkun||''}" readonly>
          <button type="button" class="icon-btn edit" data-pat-jurnal-akun-search="${idx}" title="Cari Akun GL">${icon('search',12)}</button>
        </div>
      </td>
      <td style="min-width:180px;"><input type="text" data-pat-jurnal-nama="${idx}" value="${entry.namaAkun||''}" readonly></td>
      <td style="min-width:160px;"><input type="text" data-pat-jurnal-ket="${idx}" value="${entry.keterangan||''}"></td>
      <td style="width:150px;"><input type="number" step="0.01" min="0" data-pat-jurnal-debit="${idx}" value="${entry.debit||0}" style="text-align:right;"></td>
      <td style="width:150px;"><input type="number" step="0.01" min="0" data-pat-jurnal-kredit="${idx}" value="${entry.kredit||0}" style="text-align:right;"></td>
      <td style="width:50px;"><button type="button" class="icon-btn del" data-pat-jurnal-del="${idx}" title="Hapus Baris">${icon('trash',14)}</button></td>
    </tr>`;
  }).join('');
}

/* Picker Supplier / Aset / PPN / Akun GL — salinan lokal pola modul
   transaksi lain. */
function tplPatSupplierPicker(list){
  return `
    <div class="modal-box" style="max-width:640px;">
      <div class="modal-header"><span>Pilih Supplier</span><span class="close" id="modalClose">&times;</span></div>
      <div class="modal-body">
        <input type="text" id="patSupplierPickerSearch" placeholder="Cari kode / nama supplier..." style="width:100%;border:1px solid var(--border);border-radius:6px;padding:8px 10px;font-size:12.8px;margin-bottom:12px;">
        <div class="table-wrap" style="max-height:360px;overflow:auto;">
          <table>
            <thead><tr><th>Kode</th><th>Nama Supplier</th><th></th></tr></thead>
            <tbody id="patSupplierPickerBody">${tplPatSupplierPickerRows(list)}</tbody>
          </table>
        </div>
      </div>
      <div class="modal-footer"><button class="btn-secondary" id="modalCancel">Tutup</button></div>
    </div>`;
}

function tplPatSupplierPickerRows(list){
  if(!list.length) return `<tr><td colspan="3" style="color:var(--text-light);">Tidak ada supplier ditemukan</td></tr>`;
  return list.map(s=>`
    <tr><td>${s.kode}</td><td>${s.nama}</td><td><button class="btn-pick" data-pick-supplier="${s.nama}">Pilih</button></td></tr>`).join('');
}

function tplPatAsetPicker(list, idx){
  return `
    <div class="modal-box" style="max-width:720px;">
      <div class="modal-header"><span>Pilih Aset (Master Fixed Asset)</span><span class="close" id="modalClose">&times;</span></div>
      <div class="modal-body">
        <input type="text" id="patAsetPickerSearch" placeholder="Cari kode / nama aset..." style="width:100%;border:1px solid var(--border);border-radius:6px;padding:8px 10px;font-size:12.8px;margin-bottom:12px;">
        <div class="table-wrap" style="max-height:340px;overflow:auto;">
          <table>
            <thead><tr><th>Kode</th><th>Nama Aset</th><th>Golongan</th><th class="text-right">Harga Beli</th><th></th></tr></thead>
            <tbody id="patAsetPickerBody">${tplPatAsetPickerRows(list, idx)}</tbody>
          </table>
        </div>
        <p style="color:var(--text-light);font-size:11.8px;margin-top:8px;">Aset yang belum ada di master boleh diketik langsung di kolom Nama Aset (Kode Aset dibiarkan "(aset baru)" — pendaftarannya ke master Fixed Asset dilakukan setelah pembelian ini disimpan).</p>
      </div>
      <div class="modal-footer"><button class="btn-secondary" id="modalCancel">Tutup</button></div>
    </div>`;
}

function tplPatAsetPickerRows(list, idx){
  if(!list.length) return `<tr><td colspan="5" style="color:var(--text-light);">Tidak ada aset ditemukan</td></tr>`;
  return list.map(a=>`
    <tr>
      <td>${a.kode}</td><td>${a.nama}</td><td>${a.aturanKode||a.kelompokAktiva||''}</td>
      <td class="text-right">${patNum2(a.hargaBeli)}</td>
      <td><button class="btn-pick" data-pick-aset="${a.kode}" data-pick-idx="${idx}">Pilih</button></td>
    </tr>`).join('');
}

function tplPatPpnPicker(){
  return `
    <div class="modal-box" style="max-width:400px;">
      <div class="modal-header"><span>Pilih Ppn</span><span class="close" id="modalClose">&times;</span></div>
      <div class="modal-body">
        <div class="table-wrap"><table>
          <thead><tr><th>Kode</th><th>Persen</th><th></th></tr></thead>
          <tbody><tr><td>PPN11</td><td>11%</td><td><button class="btn-pick" id="patPickPpn11">Pilih</button></td></tr></tbody>
        </table></div>
        <p style="color:var(--text-light);font-size:11.8px;margin-top:8px;">Memilih PPN11 otomatis mengubah mode PPN dokumen menjadi Eksklusif (+11%).</p>
      </div>
      <div class="modal-footer"><button class="btn-secondary" id="modalCancel">Tutup</button></div>
    </div>`;
}

function tplPatAkunPicker(list){
  return `
    <div class="modal-box" style="max-width:640px;">
      <div class="modal-header"><span>Pilih Akun GL</span><span class="close" id="modalClose">&times;</span></div>
      <div class="modal-body">
        <input type="text" id="patAkunPickerSearch" placeholder="Cari kode / nama akun..." style="width:100%;border:1px solid var(--border);border-radius:6px;padding:8px 10px;font-size:12.8px;margin-bottom:12px;">
        <div class="table-wrap" style="max-height:360px;overflow:auto;">
          <table>
            <thead><tr><th>Kode</th><th>Nama Akun</th><th>Kat.</th><th></th></tr></thead>
            <tbody id="patAkunPickerBody">${tplPatAkunPickerRows(list)}</tbody>
          </table>
        </div>
      </div>
      <div class="modal-footer"><button class="btn-secondary" id="modalCancel">Tutup</button></div>
    </div>`;
}

function tplPatAkunPickerRows(list){
  if(!list.length) return `<tr><td colspan="4" style="color:var(--text-light);">Tidak ada akun ditemukan</td></tr>`;
  return list.map(a=>`
    <tr><td>${a.kode}</td><td>${a.nama}</td><td>${a.kategori}</td><td><button class="btn-pick" data-pat-pick-akun="${a.kode}">Pilih</button></td></tr>`).join('');
}

function tplPatDeleteConfirm(row){
  return `
    <div class="modal-box">
      <div class="modal-header"><span>Hapus Pembelian Aktiva Tetap</span><span class="close" id="modalClose">&times;</span></div>
      <div class="modal-body"><p>Yakin ingin menghapus transaksi <b>${row.no}</b> — ${row.supplier||''} (${patNum2(row.jumlahTotal)})?</p></div>
      <div class="modal-footer">
        <button class="btn-secondary" id="modalCancel">Batal</button>
        <button class="btn-danger" id="modalDelete">Hapus</button>
      </div>
    </div>`;
}

function tplPatInfoModal(title,text){
  return `
    <div class="modal-box">
      <div class="modal-header"><span>${title}</span><span class="close" id="modalClose">&times;</span></div>
      <div class="modal-body"><p>${text}</p></div>
      <div class="modal-footer"><button class="btn-primary" id="modalOk">Mengerti</button></div>
    </div>`;
}
