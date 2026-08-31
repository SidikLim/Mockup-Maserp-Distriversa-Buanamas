/* =========================================================
   TEMPLATE (HTML saja) — Uang Muka Supplier (Supplier &
   Pembelian > Daftar Transaksi > Uang Muka Supplier, key
   page:'uangMukaSupplier'). Semua fungsi di file ini HANYA
   menyusun & mengembalikan markup HTML (string) atau helper
   murni, TIDAK ada DOM-binding/data mutation di sini. Logic-nya
   ada di file sebelah: uang-muka-supplier.js

   Sesuai 2 screenshot MASERP yang dikirim user:
   1) List "Uang Muka Supplier 2" (judul header PERSIS screenshot,
      angka "2" quirk versi layar MASERP asli — label menu tetap
      "Uang Muka Supplier"): chip periode + Tambah; kolom No. Uang
      Muka (link biru -> Lihat) / Tgl. Uang Muka / Supplier /
      Jumlah / Keterangan + aksi Lihat Invoice / Cetak Invoice
      (keduanya membuka preview invoice uang muka) / Ubah / Hapus.
   2) Form "+ Uang Muka Supplier 2": heading kiri + Cabang;
      Supplier (picker) + No. PO (picker DATA.purchaseOrder —
      barang PO jadi baris Rincian Transaksi); No. Otomatis
      "UMS01" (dekoratif) + No. Transaksi "26/UMS-HO/08/00001"
      readonly + Keterangan (placeholder "contoh: di transfer via
      bank BCA"); Tgl. Trn. / Syarat Bayar (COD/CBD/Kredit) /
      Tgl. Jth. Tempo / Jurnal (dropdown master Jurnal Pembelian).
      Tab "Rincian Transaksi": Keterangan (nama barang PO, readonly)
      / Qty / Jumlah / Hapus. Panel "Informasi PPN" (4 radio +
      kotak: Tgl. Faktur Pajak, checkbox "Tidak Isi No. Faktur
      Pajak", No. Otomatis PPN (checkbox + dropdown + input 16
      digit + refresh), No. KMK, Tgl. KMK) + panel "Rincian
      Transaksi": Supplier Mata Uang/Kurs, Subtotal, DP Tertagih,
      "Dp ditagih" % (EDITABLE — nilai DP = Subtotal x %), DPP,
      Pajak 11% (PPN11) + nilai PPN, Pph Dipotong (dropdown +
      picker, opsional), Jumlah. Tab "Rincian Jurnal Akun" pola
      Buat Jurnal + tabel editable: Uang Muka Pembelian 1140001(D,
      DPP) + PPN Masukan 1140002(D) = Hutang Usaha 2110001(K,
      Jumlah) — tagihan uang muka ke supplier.
   Footer: Cetak dan Simpan / Simpan / Batalkan. No. format
   "26/UMS-{kode cabang}/{MM}/{urut}" (sample DBM memakai 08).
   Aritmetika: Subtotal = total Jumlah baris rincian (dari PO);
   DP ditagih = Subtotal x %; DPP = DP ditagih; PPN = 11% DPP
   (mode Eksklusif); PPh = persen dipotong x DPP (mengurangi);
   Jumlah = DPP + PPN - PPh. */

const UMS_CABANG_LIST = ['Head Office','Surabaya','Bandung','Medan','Makassar','Semarang','Tangerang','Sidoarjo'];
const UMS_CABANG_CODE = {'Head Office':'HO','Surabaya':'SBY','Bandung':'BDG','Medan':'MDN','Makassar':'MKS','Semarang':'SMG','Tangerang':'TGR','Sidoarjo':'SDA'};
const UMS_SYARAT_BAYAR_LIST = ['COD','CBD','Kredit 14 Hari','Kredit 30 Hari'];
const UMS_PPH_LIST = [
  {kode:'PPH 22 (0.3)', persen:0.3},
  {kode:'PPH 23 (2)', persen:2},
];

function umsNum2(n){ return Number(n||0).toLocaleString('id-ID', {minimumFractionDigits:2, maximumFractionDigits:2}); }
function umsAkunNama(kode){ const a = DATA.akunGL.find(x => x.kode === kode); return a ? a.nama : ''; }

/* =====================================================================
   LIST PAGE — "Uang Muka Supplier 2"
===================================================================== */
function tplUangMukaSupplierListPage(){
  return `
    <div class="breadcrumb">Home / Supplier &amp; Pembelian / <b>Uang Muka Supplier</b></div>
    <div class="card">
      <div class="card-header dark-header">
        <h3>${icon('alertTriangle',15)} Uang Muka Supplier 2</h3>
        <div class="toolbar-actions">
          <select class="chip-btn" id="umsFilterBulan"><option>Agustus 2026</option><option>Juli 2026</option></select>
          <button class="btn-primary" id="btnUmsAdd">${icon('plus',14)} Tambah</button>
        </div>
      </div>
      <div class="table-toolbar">
        <select id="umsPageSize"><option selected>10</option><option>25</option><option>50</option></select>
        <input type="text" id="umsSearch" placeholder="Pencarian Global">
      </div>
      <div class="table-wrap"><table>
        <thead><tr>
          <th style="width:180px;">No. Uang Muka</th>
          <th style="width:120px;">Tgl. Uang Muka</th>
          <th>Supplier</th>
          <th class="text-right" style="width:140px;">Jumlah</th>
          <th style="width:180px;">Keterangan</th>
          <th style="width:80px;">Lihat Invoice</th>
          <th style="width:80px;">Cetak Invoice</th>
          <th style="width:64px;">Ubah</th>
          <th style="width:64px;">Hapus</th>
        </tr></thead>
        <tbody id="umsTbody"></tbody>
      </table></div>
      <div class="table-footer"><div class="pager"><button>First</button><button>Previous</button><button class="active">1</button><button>Next</button><button>Last</button></div><div id="umsTotal"></div></div>
    </div>`;
}

function tplUmsRows(rows){
  if(!rows.length) return `<tr><td colspan="9" style="color:var(--text-light);padding:14px;">Tidak ada Uang Muka Supplier yang cocok dengan pencarian.</td></tr>`;
  return rows.map((r,i)=>`
    <tr>
      <td><button class="link-pick" data-view-link="${i}">${r.no}</button></td>
      <td>${r.tgl||''}</td>
      <td>${(r.supplier||'').toUpperCase()}</td>
      <td class="text-right">${umsNum2(r.jumlahTotal)}</td>
      <td style="max-width:200px;"><div style="white-space:nowrap;overflow:hidden;text-overflow:ellipsis;" title="${r.keterangan||''}">${r.keterangan||''}</div></td>
      <td><button class="icon-btn view" data-invoice="${i}" title="Lihat Invoice">${icon('eye',15)}</button></td>
      <td><button class="icon-btn view" data-print="${i}" title="Cetak Invoice">${icon('printer',15)}</button></td>
      <td><button class="icon-btn edit" data-edit="${i}" title="Ubah">${icon('edit',15)}</button></td>
      <td><button class="icon-btn del" data-del="${i}" title="Hapus">${icon('trash',15)}</button></td>
    </tr>`).join('');
}

/* =====================================================================
   FORM (full page)
===================================================================== */
function tplUmsForm(mode, row){
  const isAdd = mode === 'add';
  const isView = mode === 'view';
  const dis = isView ? 'disabled' : '';
  return `
    <div class="breadcrumb">Home / Uang Muka Supplier / <b>${isAdd ? 'Tambah' : (isView ? 'Lihat' : 'Ubah')}</b></div>
    <div class="card">
      <div class="card-header dark-header">
        <h3>${icon('plus',15)} Uang Muka Supplier 2</h3>
        <button class="btn-danger" id="btnUmsTutorial">${icon('card',14)} Tutorial</button>
      </div>
      <div class="card-body">
        <div class="form-grid-3" style="grid-template-columns:repeat(3,1fr);align-items:end;">
          <h2 style="font-size:20px;font-weight:700;color:var(--navy);margin:0 0 10px;padding-bottom:10px;border-bottom:1px solid var(--border);">Uang Muka Supplier</h2>
          <div class="form-group">
            <label>Cabang</label>
            <select id="fUmsCabang" ${(!isAdd)?'disabled':dis}>${UMS_CABANG_LIST.map(c=>`<option ${row.cabang===c?'selected':''}>${c}</option>`).join('')}</select>
          </div>
          <div class="form-group"></div>
        </div>

        <div class="form-grid-3" style="grid-template-columns:repeat(3,1fr);">
          <div class="form-group">
            <label>Supplier</label>
            <div class="input-with-btn">
              <input type="text" id="fUmsSupplier" value="${(row.supplier||'').toUpperCase()}" placeholder="Pilih Supplier" readonly>
              ${!isView ? `<button type="button" class="icon-btn edit" id="umsSupplierSearch" title="Cari Supplier">${icon('search',13)}</button>` : ''}
            </div>
          </div>
          <div class="form-group">
            <label>No. PO</label>
            <div class="input-with-btn">
              <input type="text" id="fUmsNoPO" value="${row.noPO||''}" placeholder="Pilih Purchase Order" readonly>
              ${!isView ? `<button type="button" class="icon-btn edit" id="umsPoSearch" title="Cari Purchase Order">${icon('search',13)}</button>` : ''}
            </div>
          </div>
          <div class="form-group"></div>
        </div>

        <div class="form-grid-3" style="grid-template-columns:repeat(3,1fr);">
          <div class="form-group" style="max-width:220px;">
            <label>No. Otomatis</label>
            <select disabled><option>UMS01</option></select>
          </div>
          <div class="form-group">
            <label>No. Transaksi</label>
            <div class="input-with-btn">
              <input type="text" id="fUmsNo" value="${row.no||''}" readonly>
              ${isAdd ? `<button type="button" class="icon-btn edit" id="umsRefreshNo" title="Generate Ulang Nomor">${icon('refreshCw',13)}</button>` : ''}
            </div>
          </div>
          <div class="form-group">
            <label>Keterangan</label>
            <textarea id="fUmsKeterangan" class="po-textarea" rows="3" placeholder="contoh: di transfer via bank BCA" ${dis}>${row.keterangan||''}</textarea>
          </div>
        </div>

        <div class="form-grid-3" style="grid-template-columns:repeat(4,1fr);">
          <div class="form-group">
            <label>Tgl. Trn.</label>
            <div class="input-with-btn">
              <input type="text" id="fUmsTgl" value="${row.tgl||''}" ${dis}>
              <span class="icon-btn edit" style="pointer-events:none;">${icon('calendar',13)}</span>
            </div>
          </div>
          <div class="form-group">
            <label>Syarat Bayar</label>
            <select id="fUmsSyaratBayar" ${dis}>${UMS_SYARAT_BAYAR_LIST.map(s=>`<option ${row.syaratBayar===s?'selected':''}>${s}</option>`).join('')}</select>
          </div>
          <div class="form-group">
            <label>Tgl. Jth. Tempo</label>
            <div class="input-with-btn">
              <input type="text" id="fUmsTglJthTempo" value="${row.tglJthTempo||''}" ${dis}>
              <span class="icon-btn edit" style="pointer-events:none;">${icon('calendar',13)}</span>
            </div>
          </div>
          <div class="form-group">
            <label>Jurnal</label>
            <select id="fUmsJurnal" ${dis}><option value=""></option>${DATA.jurnalPembelian.map(j=>`<option ${row.jurnal===j.nama?'selected':''}>${j.nama}</option>`).join('')}</select>
          </div>
        </div>

        <div class="inv-tabs">
          <button type="button" class="inv-tab-btn active" id="umsTabRincianBtn">Rincian Transaksi</button>
          <button type="button" class="inv-tab-btn" id="umsTabJurnalBtn">Rincian Jurnal Akun</button>
        </div>

        <div id="umsTabRincianContent">${tplUmsRincianTab(row, isView)}</div>
        <div id="umsTabJurnalContent" style="display:none;">${tplUmsJurnalContent(row, isView)}</div>
      </div>
      <div class="card-footer" style="display:flex;gap:10px;justify-content:flex-end;align-items:center;padding:14px 20px;border-top:1px solid var(--border);">
        ${!isView ? `
          <button type="button" class="btn-teal" id="umsCetakSimpan">Cetak dan Simpan</button>
          <button type="button" class="btn-primary" id="umsSimpan">Simpan</button>` : ''}
        <a href="#" id="umsBatalkan" class="link-add" style="margin-top:0;">${isView?'Tutup':'Batalkan'}</a>
      </div>
    </div>`;
}

/* ===== Tab 1 — Rincian Transaksi + panel PPN & DP ===== */
function tplUmsRincianTab(row, isView){
  return `
    <div class="table-wrap" style="margin:10px 0 0;">
      <table class="po-item-table">
        <thead><tr>
          <th>Keterangan</th>
          <th class="text-right" style="width:100px;">Qty</th>
          <th class="text-right" style="width:150px;">Jumlah</th>
          <th style="width:60px;">Hapus</th>
        </tr></thead>
        <tbody id="umsItemsBody">${tplUmsItemRows(row.items, isView)}</tbody>
      </table>
    </div>
    <div id="umsItemsEmptyHint" style="font-size:11.5px;color:var(--text-light);margin-top:6px;${(row.items&&row.items.length)?'display:none;':''}">Belum ada rincian — pilih No. PO terlebih dahulu, barang PO itu akan tampil di sini.</div>

    <div class="form-grid" style="margin-top:24px;">
      <div>
        <div class="form-section">Informasi PPN</div>
        <div class="radio-group">
          <label><input type="radio" name="umsPpnMode" value="tidak" ${row.ppnMode==='tidak'?'checked':''} ${isView?'disabled':''}> Tidak ada PPN</label>
          <label><input type="radio" name="umsPpnMode" value="tidakDipungut" ${row.ppnMode==='tidakDipungut'?'checked':''} ${isView?'disabled':''}> PPN Tidak Dipungut Pajak</label>
          <label><input type="radio" name="umsPpnMode" value="inklusif" ${row.ppnMode==='inklusif'?'checked':''} ${isView?'disabled':''}> PPN Inklusif</label>
          <label><input type="radio" name="umsPpnMode" value="eksklusif" ${row.ppnMode==='eksklusif'?'checked':''} ${isView?'disabled':''}> PPN Eksklusif (+11%)</label>
        </div>
        <table class="field-table po-rincian-table" style="margin-top:10px;">
          <tr><td class="flabel">Tgl. Faktur Pajak</td><td colspan="3">
            <div class="input-with-btn">
              <input type="text" id="fUmsTglFakturPajak" value="${row.tglFakturPajak||''}" ${isView?'disabled':''}>
              <span class="icon-btn edit" style="pointer-events:none;">${icon('calendar',13)}</span>
            </div>
            <label style="display:flex;align-items:center;gap:6px;font-size:12px;margin-top:6px;"><input type="checkbox" id="fUmsTanpaFakturPajak" ${row.tanpaFakturPajak?'checked':''} ${isView?'disabled':''} style="width:auto;"> Tidak Isi No. Faktur Pajak</label>
          </td></tr>
          <tr><td class="flabel">No. Otomatis PPN</td><td colspan="3">
            <div style="display:flex;gap:8px;align-items:center;">
              <input type="checkbox" ${isView?'disabled':''} style="width:auto;">
              <select style="flex:1;" ${isView?'disabled':''}><option>--Silahkan Pilih--</option></select>
            </div>
            <div class="input-with-btn" style="margin-top:6px;">
              <input type="text" id="fUmsNoFakturPajak" value="${row.noFakturPajak||'0000000000000000'}" readonly>
              <button type="button" class="icon-btn edit" id="umsRefreshFp" title="Generate No. Faktur Pajak">${icon('refreshCw',13)}</button>
            </div>
          </td></tr>
          <tr><td class="flabel">No. KMK</td><td colspan="3"><input type="text" id="fUmsNoKmk" value="${row.noKmk||''}" ${isView?'disabled':''}></td></tr>
          <tr><td class="flabel">Tgl. KMK</td><td colspan="3"><input type="text" id="fUmsTglKmk" value="${row.tglKmk||''}" ${isView?'disabled':''}></td></tr>
        </table>
      </div>
      <div>
        <div class="form-section">Rincian Transaksi</div>
        <table class="field-table po-rincian-table">
          <tr><td class="flabel">Supplier Mata Uang</td><td><input type="text" value="IDR" disabled></td><td class="flabel">Kurs</td><td><input type="text" value="${umsNum2(1)}" disabled></td></tr>
          <tr><td class="flabel">Subtotal</td><td colspan="3"><input type="text" id="fUmsSubtotal" value="${umsNum2(row.subtotal||0)}" disabled style="text-align:right;"></td></tr>
          <tr><td class="flabel">DP Tertagih</td><td colspan="3"><input type="text" id="fUmsDpTertagih" value="${row.dpTertagih ? umsNum2(row.dpTertagih) : ''}" disabled style="text-align:right;"></td></tr>
          <tr><td class="flabel">Dp ditagih</td><td><input type="number" min="0" max="100" id="fUmsDpPersen" value="${row.dpPersen!=null?row.dpPersen:100}" ${isView?'disabled':''}> %</td><td></td><td><input type="text" id="fUmsDpAmount" value="${umsNum2(row.dpAmount||0)}" disabled style="text-align:right;"></td></tr>
          <tr><td class="flabel">DPP</td><td colspan="3"><input type="text" id="fUmsDpp" value="${umsNum2(row.dpp||0)}" disabled style="text-align:right;"></td></tr>
          <tr><td class="flabel">Pajak 11 %</td><td>
              <div class="input-with-btn">
                <input type="text" id="fUmsPajak11" value="${row.pajak11||''}" readonly>
                ${!isView ? `<button type="button" class="icon-btn edit" id="umsPajakInfo" title="Cari Kode Pajak">${icon('search',13)}</button>` : ''}
              </div>
            </td><td></td><td><input type="text" id="fUmsPpnAmount" value="${umsNum2(row.ppnAmount||0)}" disabled style="text-align:right;"></td></tr>
          <tr><td class="flabel">Pph Dipotong</td><td>
              <div class="input-with-btn">
                <input type="text" id="fUmsPphKode" value="${row.pphKode||''}" placeholder="Pilih Pph" readonly>
                ${!isView ? `<button type="button" class="icon-btn edit" id="umsPphSearch" title="Cari PPh">${icon('search',13)}</button>
                <button type="button" class="icon-btn del" id="umsPphClear" title="Hapus PPh">${icon('trash',13)}</button>` : ''}
              </div>
            </td><td style="font-size:11.5px;color:var(--text-light);white-space:nowrap;">${row.pphKode ? (row.pphPersen + ' %') : '0 %'}</td><td><input type="text" id="fUmsPphAmount" value="${umsNum2(row.pphAmount||0)}" disabled style="text-align:right;"></td></tr>
          <tr><td class="flabel">Jumlah</td><td colspan="3"><input type="text" id="fUmsJumlahTotal" value="${umsNum2(row.jumlahTotal||0)}" disabled style="text-align:right;font-weight:700;font-size:14px;"></td></tr>
        </table>
      </div>
    </div>`;
}

function tplUmsItemRows(items, isView){
  if(!items || !items.length) return `<tr><td colspan="4" style="color:var(--text-light);">Belum ada rincian.</td></tr>`;
  return items.map((it,idx)=>`
    <tr>
      <td><input type="text" value="${it.keterangan||''}" readonly></td>
      <td style="width:100px;"><input type="text" value="${it.qty||0}" readonly style="text-align:right;"></td>
      <td style="width:150px;"><input type="text" value="${umsNum2(it.jumlah||0)}" readonly style="text-align:right;"></td>
      <td style="width:60px;">${!isView ? `<button type="button" class="icon-btn del" data-ums-del="${idx}" title="Hapus Baris">${icon('trash',14)}</button>` : ''}</td>
    </tr>`).join('');
}

/* ===== Tab 2 — Rincian Jurnal Akun (Buat Jurnal + tabel editable) ===== */
function tplUmsJurnalContent(row, isView){
  const totals = umsJurnalTotals(row);
  const selisihColor = Math.abs(totals.selisih) > 0.004 ? 'var(--red)' : 'var(--text)';
  return `
    ${!isView ? `<div style="display:flex;justify-content:center;margin:14px 0;">
      <button type="button" class="btn-secondary" id="umsBuatJurnal">${icon('refreshCw',13)} Buat Jurnal</button>
    </div>` : '<div style="margin-top:14px;"></div>'}
    <div class="card-header dark-header" style="border-radius:6px;">
      <h3>${icon('settings',14)} Rincian Jurnal Akun</h3>
      ${!isView ? `<button type="button" class="btn-primary" id="umsJurnalAddRow">${icon('plus',13)} Tambah</button>` : ''}
    </div>
    <div class="table-wrap" style="margin:6px 0 0;">
      <table class="po-item-table">
        <thead><tr>
          <th>Kode Akun</th><th>Nama Akun</th><th>Keterangan</th><th class="text-right">Jumlah Debit</th><th class="text-right">Jumlah Kredit</th><th>Hapus</th>
        </tr></thead>
        <tbody id="umsJurnalBody">${tplUmsJurnalRows(row.jurnalAkun, isView)}</tbody>
      </table>
    </div>
    <div style="max-width:280px;margin:16px 0 0 auto;">
      <div style="font-size:12.5px;font-weight:600;color:var(--text);margin-bottom:4px;">Jumlah Debit - Kredit</div>
      <input type="text" id="umsJurnalSelisih" value="${umsNum2(totals.selisih)}" readonly style="text-align:right;font-weight:700;color:${selisihColor};">
    </div>`;
}

function tplUmsJurnalRows(list, isView){
  if(!list || !list.length) return `<tr><td colspan="6" style="color:var(--text-light);">Belum ada rincian jurnal — klik "Buat Jurnal".</td></tr>`;
  return list.map((entry,idx)=>{
    if(isView){
      return `
      <tr>
        <td style="min-width:110px;"><input type="text" value="${entry.kodeAkun||''}" readonly></td>
        <td style="min-width:180px;"><input type="text" value="${entry.namaAkun||''}" readonly></td>
        <td style="min-width:160px;"><input type="text" value="${entry.keterangan||''}" readonly></td>
        <td style="width:150px;"><input type="text" value="${umsNum2(entry.debit||0)}" readonly style="text-align:right;"></td>
        <td style="width:150px;"><input type="text" value="${umsNum2(entry.kredit||0)}" readonly style="text-align:right;"></td>
        <td style="width:50px;"></td>
      </tr>`;
    }
    return `
    <tr data-ums-jurnal-row="${idx}">
      <td style="min-width:110px;">
        <div class="input-with-btn">
          <input type="text" data-ums-jurnal-kode="${idx}" value="${entry.kodeAkun||''}" readonly>
          <button type="button" class="icon-btn edit" data-ums-jurnal-akun-search="${idx}" title="Cari Akun GL">${icon('search',12)}</button>
        </div>
      </td>
      <td style="min-width:180px;"><input type="text" data-ums-jurnal-nama="${idx}" value="${entry.namaAkun||''}" readonly></td>
      <td style="min-width:160px;"><input type="text" data-ums-jurnal-ket="${idx}" value="${entry.keterangan||''}"></td>
      <td style="width:150px;"><input type="number" step="0.01" min="0" data-ums-jurnal-debit="${idx}" value="${entry.debit||0}" style="text-align:right;"></td>
      <td style="width:150px;"><input type="number" step="0.01" min="0" data-ums-jurnal-kredit="${idx}" value="${entry.kredit||0}" style="text-align:right;"></td>
      <td style="width:50px;"><button type="button" class="icon-btn del" data-ums-jurnal-del="${idx}" title="Hapus Baris">${icon('trash',14)}</button></td>
    </tr>`;
  }).join('');
}

/* Cetakan/preview "Invoice Uang Muka" — dipakai tombol Lihat Invoice
   & Cetak Invoice di list (kop DBM, pola ringkas dari cetakan Retur
   Penjualan). */
function tplUmsInvoiceModal(row){
  const ho = DATA.cabangMaster[0] || {};
  const td = 'padding:3px 6px;font-size:11.5px;';
  const itemRows = (row.items||[]).map((it,i)=>`
    <tr>
      <td style="${td}text-align:center;">${i+1}</td>
      <td style="${td}">${it.keterangan}</td>
      <td style="${td}text-align:right;">${umsNum2(it.qty)}</td>
      <td style="${td}text-align:right;">${umsNum2(it.jumlah)}</td>
    </tr>`).join('');
  return `
    <div class="modal-box" style="max-width:860px;width:96vw;">
      <div class="modal-header"><span>${icon('printer',15)} Invoice Uang Muka — ${row.no}</span><span class="close" id="modalClose">&times;</span></div>
      <div class="modal-body" style="max-height:72vh;overflow:auto;">
        <div style="background:#fff;border:1px solid var(--border);padding:22px 26px;font-family:Arial,Helvetica,sans-serif;color:#111;">
          <div style="display:flex;gap:14px;align-items:flex-start;">
            <div style="width:64px;height:64px;border-radius:10px;background:var(--navy);color:#fff;display:flex;align-items:center;justify-content:center;font-weight:800;font-size:20px;">DBM</div>
            <div>
              <div style="font-weight:800;font-size:14px;">${(ho.namaPerusahaan||'PT Distriversa Buanamas').toUpperCase()}</div>
              <div style="font-size:11.5px;">${ho.alamat||''}, ${ho.kota||''} — Tlp: ${ho.telepon||''}</div>
            </div>
          </div>
          <div style="text-align:center;font-weight:800;font-size:15px;margin:12px 0;">Invoice Uang Muka Supplier</div>
          <table style="border:none;font-size:11.5px;"><tbody>
            <tr><td style="${td}">No. Uang Muka</td><td style="${td}">: ${row.no}</td><td style="${td}padding-left:40px;">Supplier</td><td style="${td}">: ${(row.supplier||'').toUpperCase()}</td></tr>
            <tr><td style="${td}">Tgl. Trn.</td><td style="${td}">: ${row.tgl||''}</td><td style="${td}padding-left:40px;">No. PO</td><td style="${td}">: ${row.noPO||'-'}</td></tr>
            <tr><td style="${td}">Tgl. Jth. Tempo</td><td style="${td}">: ${row.tglJthTempo||''}</td><td style="${td}padding-left:40px;">Syarat Bayar</td><td style="${td}">: ${row.syaratBayar||''}</td></tr>
          </tbody></table>
          <table style="width:100%;border-collapse:collapse;margin-top:10px;">
            <thead><tr style="border-top:2px solid #111;border-bottom:2px solid #111;">
              <th style="${td}width:34px;">No.</th><th style="${td}text-align:left;">Keterangan</th><th style="${td}text-align:right;">Qty</th><th style="${td}text-align:right;">Jumlah</th>
            </tr></thead>
            <tbody>${itemRows}</tbody>
          </table>
          <div style="border-top:2px solid #111;margin-top:30px;"></div>
          <div style="display:flex;justify-content:flex-end;margin-top:8px;">
            <table style="border:none;min-width:280px;font-size:11.5px;"><tbody>
              <tr><td style="${td}">Subtotal :</td><td style="${td}text-align:right;">${umsNum2(row.subtotal)}</td></tr>
              <tr><td style="${td}">DP ditagih (${row.dpPersen!=null?row.dpPersen:100}%) / DPP :</td><td style="${td}text-align:right;">${umsNum2(row.dpp)}</td></tr>
              <tr><td style="${td}">PPN :</td><td style="${td}text-align:right;">${umsNum2(row.ppnAmount)}</td></tr>
              ${row.pphAmount ? `<tr><td style="${td}">PPh Dipotong :</td><td style="${td}text-align:right;">(${umsNum2(row.pphAmount)})</td></tr>` : ''}
              <tr style="border-top:2px solid #111;"><td style="${td}font-weight:800;">Jumlah :</td><td style="${td}text-align:right;font-weight:800;">${umsNum2(row.jumlahTotal)}</td></tr>
            </tbody></table>
          </div>
        </div>
      </div>
      <div class="modal-footer"><button class="btn-secondary" id="modalCancel">Tutup</button></div>
    </div>`;
}

/* Picker Supplier / PO / PPh / Akun GL — salinan lokal pola modul lain. */
function tplUmsSupplierPicker(list){
  return `
    <div class="modal-box" style="max-width:640px;">
      <div class="modal-header"><span>Pilih Supplier</span><span class="close" id="modalClose">&times;</span></div>
      <div class="modal-body">
        <input type="text" id="umsSupplierPickerSearch" placeholder="Cari kode / nama supplier..." style="width:100%;border:1px solid var(--border);border-radius:6px;padding:8px 10px;font-size:12.8px;margin-bottom:12px;">
        <div class="table-wrap" style="max-height:360px;overflow:auto;">
          <table>
            <thead><tr><th>Kode</th><th>Nama Supplier</th><th></th></tr></thead>
            <tbody id="umsSupplierPickerBody">${tplUmsSupplierPickerRows(list)}</tbody>
          </table>
        </div>
      </div>
      <div class="modal-footer"><button class="btn-secondary" id="modalCancel">Tutup</button></div>
    </div>`;
}

function tplUmsSupplierPickerRows(list){
  if(!list.length) return `<tr><td colspan="3" style="color:var(--text-light);">Tidak ada supplier ditemukan</td></tr>`;
  return list.map(s=>`
    <tr><td>${s.kode}</td><td>${s.nama}</td><td><button class="btn-pick" data-pick-supplier="${s.nama}">Pilih</button></td></tr>`).join('');
}

function tplUmsPoPicker(list){
  return `
    <div class="modal-box" style="max-width:760px;">
      <div class="modal-header"><span>Pilih Purchase Order</span><span class="close" id="modalClose">&times;</span></div>
      <div class="modal-body">
        <input type="text" id="umsPoPickerSearch" placeholder="Cari no. PO / supplier..." style="width:100%;border:1px solid var(--border);border-radius:6px;padding:8px 10px;font-size:12.8px;margin-bottom:12px;">
        <div class="table-wrap" style="max-height:340px;overflow:auto;">
          <table>
            <thead><tr><th>No. PO</th><th>Tgl. PO</th><th>Supplier</th><th>Cabang</th><th></th></tr></thead>
            <tbody id="umsPoPickerBody">${tplUmsPoPickerRows(list)}</tbody>
          </table>
        </div>
      </div>
      <div class="modal-footer"><button class="btn-secondary" id="modalCancel">Tutup</button></div>
    </div>`;
}

function tplUmsPoPickerRows(list){
  if(!list.length) return `<tr><td colspan="5" style="color:var(--text-light);">Tidak ada PO ditemukan</td></tr>`;
  return list.map(p=>`
    <tr><td>${p.no}</td><td>${p.tglPO||''}</td><td>${p.supplier||''}</td><td>${p.cabang||''}</td><td><button class="btn-pick" data-pick-po="${p.no}">Pilih</button></td></tr>`).join('');
}

function tplUmsPphPicker(list){
  return `
    <div class="modal-box" style="max-width:400px;">
      <div class="modal-header"><span>Pilih PPh</span><span class="close" id="modalClose">&times;</span></div>
      <div class="modal-body">
        <div class="table-wrap"><table>
          <thead><tr><th>Kode PPh</th><th>Persen</th><th></th></tr></thead>
          <tbody>${list.map(p=>`<tr><td>${p.kode}</td><td>${p.persen}%</td><td><button class="btn-pick" data-pick-pph="${p.kode}" data-pick-persen="${p.persen}">Pilih</button></td></tr>`).join('')}</tbody>
        </table></div>
      </div>
      <div class="modal-footer"><button class="btn-secondary" id="modalCancel">Tutup</button></div>
    </div>`;
}

function tplUmsAkunPicker(list){
  return `
    <div class="modal-box" style="max-width:640px;">
      <div class="modal-header"><span>Pilih Akun GL</span><span class="close" id="modalClose">&times;</span></div>
      <div class="modal-body">
        <input type="text" id="umsAkunPickerSearch" placeholder="Cari kode / nama akun..." style="width:100%;border:1px solid var(--border);border-radius:6px;padding:8px 10px;font-size:12.8px;margin-bottom:12px;">
        <div class="table-wrap" style="max-height:360px;overflow:auto;">
          <table>
            <thead><tr><th>Kode</th><th>Nama Akun</th><th>Kat.</th><th></th></tr></thead>
            <tbody id="umsAkunPickerBody">${tplUmsAkunPickerRows(list)}</tbody>
          </table>
        </div>
      </div>
      <div class="modal-footer"><button class="btn-secondary" id="modalCancel">Tutup</button></div>
    </div>`;
}

function tplUmsAkunPickerRows(list){
  if(!list.length) return `<tr><td colspan="4" style="color:var(--text-light);">Tidak ada akun ditemukan</td></tr>`;
  return list.map(a=>`
    <tr><td>${a.kode}</td><td>${a.nama}</td><td>${a.kategori}</td><td><button class="btn-pick" data-ums-pick-akun="${a.kode}">Pilih</button></td></tr>`).join('');
}

function tplUmsDeleteConfirm(row){
  return `
    <div class="modal-box">
      <div class="modal-header"><span>Hapus Uang Muka Supplier</span><span class="close" id="modalClose">&times;</span></div>
      <div class="modal-body"><p>Yakin ingin menghapus Uang Muka <b>${row.no}</b> — ${(row.supplier||'').toUpperCase()} (${umsNum2(row.jumlahTotal)})?</p></div>
      <div class="modal-footer">
        <button class="btn-secondary" id="modalCancel">Batal</button>
        <button class="btn-danger" id="modalDelete">Hapus</button>
      </div>
    </div>`;
}

function tplUmsInfoModal(title,text){
  return `
    <div class="modal-box">
      <div class="modal-header"><span>${title}</span><span class="close" id="modalClose">&times;</span></div>
      <div class="modal-body"><p>${text}</p></div>
      <div class="modal-footer"><button class="btn-primary" id="modalOk">Mengerti</button></div>
    </div>`;
}
