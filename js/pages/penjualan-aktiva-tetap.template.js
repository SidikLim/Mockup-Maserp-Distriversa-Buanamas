/* =========================================================
   TEMPLATE (HTML saja) — Penjualan Aktiva Tetap / "Penjualan
   Fixed Asset" (Aktiva Tetap > Daftar Transaksi > Penjualan
   Aktiva Tetap, key page:'penjualanAktivaTetap'). Semua fungsi
   di file ini HANYA menyusun & mengembalikan markup HTML
   (string) atau helper murni, TIDAK ada DOM-binding/mutation.
   Logic-nya di file sebelah: penjualan-aktiva-tetap.js
   NB: closeModal() dipakai bersama, didefinisikan di core.js.

   Sesuai 2 screenshot MASERP SDL yang dikirim user 2026-09-01
   (data dipetakan ke master DBM: customer CUST-xxx, aset
   DATA.aktivaTetap, jurnal DATA.jurnalFixedAsset, salesman
   DATA.salesman, akun 7-digit DBM):
   1) List "Daftar Penjualan Fixed Asset": chip "Semua"
      (FUNGSIONAL: Semua/September 2026/Agustus 2026) + Add;
      kolom No.Transaksi / Tanggal Transaksi / Customer / Type
      Transaksi / Grand Total (semua sort) + aksi Edit / Delete
      / Lihat (form view) / Print (cetakan invoice modal).
      Screenshot SDL kosong — mockup DBM diberi 2 sample
      September 2026. Type Transaksi = Tunai|Kredit (dari
      Syarat Bayar).
   2) Form "+ Penjualan Fixed Asset": Customer (picker,
      mengisi Alamat Pengirim + Sisa U. Muka dari master) +
      Cabang; Auto Number "FAS01" (dekoratif) + No. Transaksi
      "26/FAS/HO/09/00001" readonly + refresh; Tgl. Transaksi /
      Syarat Bayar / Tgl. Jth. Tmp. (disabled, ikut Tgl) /
      Salesman (dropdown DATA.salesman) / Alamat Pengirim.
      Tab "Detail Transaksi": panel gelap "Fixed Asset Item" +
      Add — kolom Kode Aset (picker DATA.aktivaTetap) / Nama
      Aset / Jurnal (dropdown DATA.jurnalFixedAsset) / Harga
      Jual / Disc(%) / Discount / Total / hapus. Panel
      "Informasi PPN" 3 radio (Tidak ada PPN / PPN Inklusif /
      PPN Eksklusif (+{p}%)) + panel "Rincian Transaksi":
      Mata Uang IDR / Kurs 1,00; Diskon 1 % & Diskon 2 %
      (BERJENJANG: D2 dihitung setelah D1); DPP; Sisa U. Muka
      (readonly, uangMuka customer) + Pakai (editable, di-clamp
      <= min(sisa UM, Total)); "Pajak {p} %" + picker Pilih Ppn
      (PPN11); Total; Sisa Total = Total - Pakai. Memo.
      Tab "Account Journal Details": pola Buat Jurnal + tabel
      editable (D 1120001 Piutang Usaha (Sisa Total) + D
      2140001 Uang Muka Penjualan (Pakai) lawan K akun aset per
      item (glKredit jurnal item, fallback 1510003 Kendaraan,
      proporsional DPP, sisa pembulatan ke baris terakhir) +
      K 2120002 PPN Keluaran). Simpan menolak jurnal tak
      balance (modal info).
   Footer: Simpan / Cancel. No. format "26/FAS/{kode cabang}/
   09/{urut 5 digit}" per cabang. */

const FAS_CABANG_LIST = ['','Head Office','Surabaya','Bandung','Medan','Makassar','Semarang','Tangerang','Sidoarjo'];
const FAS_CABANG_CODE = {'Head Office':'HO','Surabaya':'SBY','Bandung':'BDG','Medan':'MDN','Makassar':'MKS','Semarang':'SMG','Tangerang':'TGR','Sidoarjo':'SDA'};
const FAS_SYARAT_BAYAR_LIST = ['','COD','CBD','Kredit 14 Hari','Kredit 30 Hari'];
const FAS_PPN_LIST = [ {kode:'PPN11', persen:11} ];
const FAS_BULAN_LIST = [
  {label:'Semua', mm:''},
  {label:'September 2026', mm:'09'},
  {label:'Agustus 2026', mm:'08'},
];

function fasNum2(n){ return Number(n||0).toLocaleString('id-ID', {minimumFractionDigits:2, maximumFractionDigits:2}); }
function fasAkunNama(kode){ const a = DATA.akunGL.find(x => x.kode === kode); return a ? a.nama : ''; }

/* =====================================================================
   LIST PAGE — "Daftar Penjualan Fixed Asset"
===================================================================== */
function tplFasListPage(bulan){
  return `
    <div class="breadcrumb">Home / Aktiva Tetap / <b>Penjualan Aktiva Tetap</b></div>
    <div class="card">
      <div class="card-header dark-header">
        <h3>${icon('alertTriangle',15)} Daftar Penjualan Fixed Asset</h3>
        <div class="toolbar-actions">
          <select class="chip-btn" id="fasFilterBulan">${FAS_BULAN_LIST.map(b=>`<option value="${b.mm}" ${bulan===b.mm?'selected':''}>${b.label}</option>`).join('')}</select>
          <button class="btn-primary" id="btnFasAdd">${icon('plus',14)} Add</button>
        </div>
      </div>
      <div class="table-toolbar">
        <select id="fasPageSize"><option selected>10</option><option>25</option><option>50</option></select>
        <input type="text" id="fasSearch" placeholder="Global Search">
      </div>
      <div class="table-wrap"><table>
        <thead><tr>
          <th>${tplFasSortHeader('No.Transaksi','no')}</th>
          <th style="width:130px;">${tplFasSortHeader('Tanggal Transaksi','tgl')}</th>
          <th>${tplFasSortHeader('Customer','customer')}</th>
          <th style="width:130px;">${tplFasSortHeader('Type Transaksi','tipeTransaksi')}</th>
          <th class="text-right" style="width:140px;">${tplFasSortHeader('Grand Total','grandTotal')}</th>
          <th style="width:60px;">Edit</th>
          <th style="width:66px;">Delete</th>
          <th style="width:60px;">Lihat</th>
          <th style="width:60px;">Print</th>
        </tr></thead>
        <tbody id="fasTbody"></tbody>
      </table></div>
      <div class="table-footer"><div class="pager" id="fasPager"><button>First</button><button>Previous</button><button>Next</button><button>Last</button></div><div id="fasTotal"></div></div>
    </div>`;
}

function tplFasSortHeader(label, field){
  return `<span data-fas-sort="${field}" style="cursor:pointer;display:inline-flex;align-items:center;gap:4px;">${label}<span id="fasSortIcon_${field}" style="color:var(--text-light);font-size:11px;">&#8693;</span></span>`;
}

function tplFasRows(rows){
  if(!rows.length) return `<tr><td colspan="9" style="color:var(--text-light);padding:14px;text-align:center;font-weight:600;">Tidak Ada Data</td></tr>`;
  return rows.map((r) => {
    const idx = DATA.penjualanFixedAsset.indexOf(r);
    return `
    <tr>
      <td><a href="javascript:void(0)" data-fas-view="${idx}" style="color:var(--blue);font-weight:600;text-decoration:none;">${r.no}</a></td>
      <td>${r.tgl||''}</td>
      <td>${(r.customer||'').toUpperCase()}</td>
      <td>${r.tipeTransaksi||''}</td>
      <td class="text-right">${fasNum2(r.total)}</td>
      <td><button class="icon-btn edit" data-fas-edit="${idx}" title="Edit">${icon('edit',15)}</button></td>
      <td><button class="icon-btn del" data-fas-del="${idx}" title="Delete">${icon('trash',15)}</button></td>
      <td><button class="icon-btn view" data-fas-view="${idx}" title="Lihat">${icon('eye',15)}</button></td>
      <td><button class="icon-btn view" data-fas-print="${idx}" title="Print">${icon('printer',15)}</button></td>
    </tr>`;
  }).join('');
}

/* =====================================================================
   FORM (full page)
===================================================================== */
function tplFasForm(mode, row){
  const isAdd = mode === 'add';
  const isView = mode === 'view';
  const dis = isView ? 'disabled' : '';
  return `
    <div class="breadcrumb">Home / Penjualan Aktiva Tetap / <b>${isAdd?'Tambah':(isView?'Lihat':'Ubah')}</b></div>
    <div class="card">
      <div class="card-header dark-header">
        <h3>${icon('plus',15)} Penjualan Fixed Asset</h3>
        <button class="btn-danger" id="btnFasTutorial">${icon('card',14)} Tutorial</button>
      </div>
      <div class="card-body">
        <div class="form-grid-3" style="grid-template-columns:repeat(3,1fr);align-items:end;">
          <h2 style="font-size:20px;font-weight:700;color:var(--navy);margin:0 0 10px;padding-bottom:10px;border-bottom:1px solid var(--border);">Penjualan Fixed Asset</h2>
          <div class="form-group"></div>
          <div class="form-group"></div>
        </div>
        <div class="form-grid-3" style="grid-template-columns:repeat(3,1fr);">
          <div class="form-group">
            <label>Customer</label>
            <div class="input-with-btn">
              <input type="text" id="fFasCustomer" value="${(row.customer||'').toUpperCase()}" placeholder="Pilih Customer" readonly>
              ${!isView ? `<button type="button" class="icon-btn edit" id="fasCustomerSearch" title="Cari Customer">${icon('search',13)}</button>` : ''}
            </div>
          </div>
          <div class="form-group">
            <label>Cabang</label>
            <select id="fFasCabang" ${dis}>${FAS_CABANG_LIST.map(c=>`<option ${row.cabang===c?'selected':''}>${c}</option>`).join('')}</select>
          </div>
          <div class="form-group"></div>
        </div>
        <div class="form-grid-3" style="grid-template-columns:repeat(6,1fr);">
          <div class="form-group">
            <label>Auto Number</label>
            <select disabled><option>FAS01</option></select>
          </div>
          <div class="form-group">
            <label>No. Transaksi</label>
            <div class="input-with-btn">
              <input type="text" id="fFasNo" value="${row.no||''}" readonly>
              ${isAdd ? `<button type="button" class="icon-btn edit" id="fasRefreshNo" title="Generate Ulang Nomor">${icon('refreshCw',13)}</button>` : ''}
            </div>
          </div>
          <div class="form-group">
            <label>Tgl. Transaksi</label>
            <div class="input-with-btn">
              <input type="text" id="fFasTgl" value="${row.tgl||''}" ${dis}>
              <span class="icon-btn edit" style="pointer-events:none;">${icon('calendar',13)}</span>
            </div>
          </div>
          <div class="form-group">
            <label>Syarat Bayar</label>
            <select id="fFasSyaratBayar" ${dis}>${FAS_SYARAT_BAYAR_LIST.map(sb=>`<option ${row.syaratBayar===sb?'selected':''}>${sb}</option>`).join('')}</select>
          </div>
          <div class="form-group">
            <label>Tgl. Jth. Tmp.</label>
            <input type="text" id="fFasTglJthTmp" value="${row.tglJthTmp||row.tgl||''}" disabled style="background:#f2f3f6;">
          </div>
          <div class="form-group">
            <label>Salesman</label>
            <select id="fFasSalesman" ${dis}>${DATA.salesman.map(sm=>`<option ${row.salesman===sm.nama?'selected':''}>${sm.nama}</option>`).join('')}</select>
          </div>
        </div>
        <div class="form-grid-3" style="grid-template-columns:2fr 1fr;">
          <div class="form-group"></div>
          <div class="form-group">
            <label>Alamat Pengirim</label>
            <textarea id="fFasAlamat" class="po-textarea" rows="3" ${dis}>${row.alamatPengirim||''}</textarea>
          </div>
        </div>

        <div class="inv-tabs">
          <button type="button" class="inv-tab-btn active" id="fasTabDetailBtn">Detail Transaksi</button>
          <button type="button" class="inv-tab-btn" id="fasTabJurnalBtn">Account Journal Details</button>
        </div>

        <div id="fasTabDetailContent">${tplFasDetailTab(row, isView)}</div>
        <div id="fasTabJurnalContent" style="display:none;">${tplFasJurnalContent(row, isView)}</div>

        <div class="form-group" style="max-width:640px;margin-top:18px;">
          <label>Memo</label>
          <textarea id="fFasMemo" class="po-textarea" rows="3" ${dis}>${row.memo||''}</textarea>
        </div>
      </div>
      <div class="card-footer" style="display:flex;gap:10px;justify-content:flex-end;align-items:center;padding:14px 20px;border-top:1px solid var(--border);">
        ${!isView ? `<button type="button" class="btn-primary" id="fasSimpan">Simpan</button>` : ''}
        <a href="#" id="fasBatalkan" class="link-add" style="margin-top:0;">${isView?'Tutup':'Cancel'}</a>
      </div>
    </div>`;
}

/* ===== Tab 1 — Detail Transaksi ===== */
function tplFasDetailTab(row, isView){
  const p = Number(row.ppnPersen || 0);
  return `
    <div class="card-header dark-header" style="border-radius:6px;margin-top:10px;">
      <h3>${icon('alertTriangle',14)} Fixed Asset Item</h3>
      ${!isView ? `<button type="button" class="btn-primary" id="fasItemAdd">${icon('plus',13)} Add</button>` : ''}
    </div>
    <div class="table-wrap" style="margin:6px 0 0;">
      <table class="po-item-table">
        <thead><tr>
          <th style="width:180px;">Kode Aset</th>
          <th>Nama Aset</th>
          <th style="width:220px;">Jurnal</th>
          <th class="text-right" style="width:130px;">Harga Jual</th>
          <th class="text-right" style="width:90px;">Disc(%)</th>
          <th class="text-right" style="width:120px;">Discount</th>
          <th class="text-right" style="width:130px;">Total</th>
          <th style="width:50px;"></th>
        </tr></thead>
        <tbody id="fasItemsBody">${tplFasItemRows(row.items, isView)}</tbody>
      </table>
    </div>

    <div class="form-grid" style="margin-top:24px;">
      <div>
        <div class="form-section">Informasi PPN</div>
        <div class="radio-group" style="display:flex;gap:18px;flex-wrap:wrap;">
          <label><input type="radio" name="fasPpnMode" value="tidak" ${row.ppnMode==='tidak'?'checked':''} ${isView?'disabled':''}> Tidak ada PPN</label>
          <label><input type="radio" name="fasPpnMode" value="inklusif" ${row.ppnMode==='inklusif'?'checked':''} ${isView?'disabled':''}> PPN Inklusif</label>
          <label><input type="radio" name="fasPpnMode" value="eksklusif" ${row.ppnMode==='eksklusif'?'checked':''} ${isView?'disabled':''}> PPN Eksklusif (+<span id="fasPpnPersenRadio">${p}</span>%)</label>
        </div>
      </div>
      <div>
        <div class="form-section">Rincian Transaksi</div>
        <table class="field-table po-rincian-table">
          <tr><td class="flabel">Mata Uang</td><td><input type="text" value="IDR" disabled></td><td class="flabel">Kurs</td><td><input type="text" value="${fasNum2(1)}" disabled style="text-align:right;"></td></tr>
          <tr><td class="flabel">Diskon 1</td><td><input type="number" min="0" max="100" id="fFasDiskon1" value="${row.diskon1!=null?row.diskon1:0}" ${isView?'disabled':''}> %</td><td></td><td><input type="text" id="fFasDiskon1Amt" value="${fasNum2(row.diskon1Amt||0)}" disabled style="text-align:right;"></td></tr>
          <tr><td class="flabel">Diskon 2</td><td><input type="number" min="0" max="100" id="fFasDiskon2" value="${row.diskon2!=null?row.diskon2:0}" ${isView?'disabled':''}> %</td><td></td><td><input type="text" id="fFasDiskon2Amt" value="${fasNum2(row.diskon2Amt||0)}" disabled style="text-align:right;"></td></tr>
          <tr><td class="flabel">DPP</td><td colspan="3"><input type="text" id="fFasDpp" value="${fasNum2(row.dpp||0)}" disabled style="text-align:right;"></td></tr>
          <tr><td class="flabel">Sisa U. Muka</td><td><input type="text" id="fFasSisaUm" value="${fasNum2(row.sisaUangMuka||0)}" disabled style="text-align:right;"></td><td class="flabel">Pakai:</td><td><input type="number" step="0.01" min="0" id="fFasPakai" value="${row.pakaiUangMuka||0}" ${isView?'disabled':''} style="text-align:right;"></td></tr>
          <tr><td class="flabel">Pajak <span id="fasPpnPersenLabel">${p}</span> %</td><td>
              <div class="input-with-btn">
                <input type="text" id="fFasPpnKode" value="${row.ppnKode||''}" placeholder="Pilih Ppn" readonly>
                ${!isView ? `<button type="button" class="icon-btn edit" id="fasPpnSearch" title="Cari Kode PPN">${icon('search',13)}</button>
                <button type="button" class="icon-btn del" id="fasPpnClear" title="Hapus PPN">${icon('trash',13)}</button>` : ''}
              </div>
            </td><td></td><td><input type="text" id="fFasPpnAmount" value="${fasNum2(row.ppnAmount||0)}" disabled style="text-align:right;"></td></tr>
          <tr><td class="flabel">Total</td><td colspan="3"><input type="text" id="fFasTotal" value="${fasNum2(row.total||0)}" disabled style="text-align:right;font-weight:700;font-size:14px;"></td></tr>
          <tr><td class="flabel">Sisa Total</td><td colspan="3"><input type="text" id="fFasSisaTotal" value="${fasNum2(row.sisaTotal||0)}" disabled style="text-align:right;"></td></tr>
        </table>
      </div>
    </div>`;
}

function tplFasItemRows(items, isView){
  if(!items || !items.length) return `<tr><td colspan="8" style="color:var(--text-light);">Belum ada Fixed Asset Item — klik "Add".</td></tr>`;
  return items.map((it,idx)=>`
    <tr>
      <td>
        <div class="input-with-btn">
          <input type="text" data-fas-item-kode="${idx}" value="${it.kodeAset||''}" readonly style="background:#f2f3f6;">
          ${!isView ? `<button type="button" class="icon-btn edit" data-fas-item-pick="${idx}" title="Cari Aset">${icon('search',12)}</button>` : ''}
        </div>
      </td>
      <td><input type="text" data-fas-item-nama="${idx}" value="${it.namaAset||''}" readonly></td>
      <td><select data-fas-item-jurnal="${idx}" ${isView?'disabled':''}><option value=""></option>${DATA.jurnalFixedAsset.map(j=>`<option ${it.jurnal===j.keterangan?'selected':''}>${j.keterangan}</option>`).join('')}</select></td>
      <td><input type="number" step="0.01" min="0" data-fas-item-harga="${idx}" value="${it.hargaJual||0}" ${isView?'readonly':''} style="text-align:right;"></td>
      <td><input type="number" step="0.01" min="0" max="100" data-fas-item-disc="${idx}" value="${it.discPersen||0}" ${isView?'readonly':''} style="text-align:right;"></td>
      <td class="text-right"><span data-fas-item-discamt="${idx}">${fasNum2((it.hargaJual||0)*(it.discPersen||0)/100)}</span></td>
      <td class="text-right"><span data-fas-item-total="${idx}">${fasNum2((it.hargaJual||0)*(1-(it.discPersen||0)/100))}</span></td>
      <td style="text-align:center;">${!isView ? `<button type="button" class="icon-btn del" data-fas-item-del="${idx}" title="Hapus Baris">${icon('trash',14)}</button>` : ''}</td>
    </tr>`).join('');
}

/* ===== Tab 2 — Account Journal Details ===== */
function tplFasJurnalContent(row, isView){
  const totals = fasJurnalTotals(row);
  const selisihColor = Math.abs(totals.selisih) > 0.004 ? 'var(--red)' : 'var(--text)';
  return `
    ${!isView ? `<div style="display:flex;justify-content:center;margin:14px 0;">
      <button type="button" class="btn-secondary" id="fasBuatJurnal">${icon('refreshCw',13)} Buat Jurnal</button>
    </div>` : '<div style="margin-top:14px;"></div>'}
    <div class="card-header dark-header" style="border-radius:6px;">
      <h3>${icon('settings',14)} Account Journal Details</h3>
      ${!isView ? `<button type="button" class="btn-primary" id="fasJurnalAddRow">${icon('plus',13)} Tambah</button>` : ''}
    </div>
    <div class="table-wrap" style="margin:6px 0 0;">
      <table class="po-item-table">
        <thead><tr>
          <th>Kode Akun</th><th>Nama Akun</th><th>Keterangan</th><th class="text-right">Jumlah Debit</th><th class="text-right">Jumlah Kredit</th><th>Hapus</th>
        </tr></thead>
        <tbody id="fasJurnalBody">${tplFasJurnalRows(row.jurnalAkun, isView)}</tbody>
      </table>
    </div>
    <div style="max-width:280px;margin:16px 0 0 auto;">
      <div style="font-size:12.5px;font-weight:600;color:var(--text);margin-bottom:4px;">Jumlah Debit - Kredit</div>
      <input type="text" id="fasJurnalSelisih" value="${fasNum2(totals.selisih)}" readonly style="text-align:right;font-weight:700;color:${selisihColor};">
    </div>`;
}

function tplFasJurnalRows(list, isView){
  if(!list || !list.length) return `<tr><td colspan="6" style="color:var(--text-light);">Belum ada rincian jurnal — klik "Buat Jurnal".</td></tr>`;
  return list.map((entry,idx)=>{
    if(isView){
      return `
      <tr>
        <td style="min-width:110px;"><input type="text" value="${entry.kodeAkun||''}" readonly></td>
        <td style="min-width:180px;"><input type="text" value="${entry.namaAkun||''}" readonly></td>
        <td style="min-width:160px;"><input type="text" value="${entry.keterangan||''}" readonly></td>
        <td style="width:150px;"><input type="text" value="${fasNum2(entry.debit||0)}" readonly style="text-align:right;"></td>
        <td style="width:150px;"><input type="text" value="${fasNum2(entry.kredit||0)}" readonly style="text-align:right;"></td>
        <td style="width:50px;"></td>
      </tr>`;
    }
    return `
    <tr>
      <td style="min-width:110px;">
        <div class="input-with-btn">
          <input type="text" data-fas-jurnal-kode="${idx}" value="${entry.kodeAkun||''}" readonly>
          <button type="button" class="icon-btn edit" data-fas-jurnal-akun-search="${idx}" title="Cari Akun GL">${icon('search',12)}</button>
        </div>
      </td>
      <td style="min-width:180px;"><input type="text" data-fas-jurnal-nama="${idx}" value="${entry.namaAkun||''}" readonly></td>
      <td style="min-width:160px;"><input type="text" data-fas-jurnal-ket="${idx}" value="${entry.keterangan||''}"></td>
      <td style="width:150px;"><input type="number" step="0.01" min="0" data-fas-jurnal-debit="${idx}" value="${entry.debit||0}" style="text-align:right;"></td>
      <td style="width:150px;"><input type="number" step="0.01" min="0" data-fas-jurnal-kredit="${idx}" value="${entry.kredit||0}" style="text-align:right;"></td>
      <td style="width:50px;"><button type="button" class="icon-btn del" data-fas-jurnal-del="${idx}" title="Hapus Baris">${icon('trash',14)}</button></td>
    </tr>`;
  }).join('');
}

/* Cetakan/preview invoice Penjualan Fixed Asset — tombol Print di list. */
function tplFasInvoiceModal(row){
  const ho = DATA.cabangMaster[0] || {};
  const td = 'padding:3px 6px;font-size:11.5px;';
  const itemRows = (row.items||[]).map((it,i)=>`
    <tr>
      <td style="${td}text-align:center;">${i+1}</td>
      <td style="${td}">${it.kodeAset}</td>
      <td style="${td}">${it.namaAset}</td>
      <td style="${td}text-align:right;">${fasNum2(it.hargaJual)}</td>
      <td style="${td}text-align:right;">${fasNum2((it.hargaJual||0)*(it.discPersen||0)/100)}</td>
      <td style="${td}text-align:right;">${fasNum2((it.hargaJual||0)*(1-(it.discPersen||0)/100))}</td>
    </tr>`).join('');
  return `
    <div class="modal-box" style="max-width:860px;width:96vw;">
      <div class="modal-header"><span>${icon('printer',15)} Penjualan Fixed Asset — ${row.no}</span><span class="close" id="modalClose">&times;</span></div>
      <div class="modal-body" style="max-height:72vh;overflow:auto;">
        <div style="background:#fff;border:1px solid var(--border);padding:22px 26px;font-family:Arial,Helvetica,sans-serif;color:#111;">
          <div style="display:flex;gap:14px;align-items:flex-start;">
            <div style="width:64px;height:64px;border-radius:10px;background:var(--navy);color:#fff;display:flex;align-items:center;justify-content:center;font-weight:800;font-size:20px;">DBM</div>
            <div>
              <div style="font-weight:800;font-size:14px;">${(ho.namaPerusahaan||'PT Distriversa Buanamas').toUpperCase()}</div>
              <div style="font-size:11.5px;">${ho.alamat||''}, ${ho.kota||''} — Tlp: ${ho.telepon||''}</div>
            </div>
          </div>
          <div style="text-align:center;font-weight:800;font-size:15px;margin:12px 0;">Invoice Penjualan Fixed Asset</div>
          <table style="border:none;font-size:11.5px;"><tbody>
            <tr><td style="${td}">No. Transaksi</td><td style="${td}">: ${row.no}</td><td style="${td}padding-left:40px;">Customer</td><td style="${td}">: ${(row.customer||'').toUpperCase()}</td></tr>
            <tr><td style="${td}">Tgl. Transaksi</td><td style="${td}">: ${row.tgl||''}</td><td style="${td}padding-left:40px;">Syarat Bayar</td><td style="${td}">: ${row.syaratBayar||'-'}</td></tr>
            <tr><td style="${td}">Salesman</td><td style="${td}">: ${row.salesman||'-'}</td><td style="${td}padding-left:40px;">Cabang</td><td style="${td}">: ${row.cabang||''}</td></tr>
          </tbody></table>
          <table style="width:100%;border-collapse:collapse;margin-top:10px;">
            <thead><tr style="border-top:2px solid #111;border-bottom:2px solid #111;">
              <th style="${td}width:34px;">No.</th><th style="${td}text-align:left;">Kode Aset</th><th style="${td}text-align:left;">Nama Aset</th><th style="${td}text-align:right;">Harga Jual</th><th style="${td}text-align:right;">Discount</th><th style="${td}text-align:right;">Total</th>
            </tr></thead>
            <tbody>${itemRows}</tbody>
          </table>
          <div style="border-top:2px solid #111;margin-top:30px;"></div>
          <div style="display:flex;justify-content:flex-end;margin-top:8px;">
            <table style="border:none;min-width:280px;font-size:11.5px;"><tbody>
              <tr><td style="${td}">DPP :</td><td style="${td}text-align:right;">${fasNum2(row.dpp)}</td></tr>
              <tr><td style="${td}">PPN :</td><td style="${td}text-align:right;">${fasNum2(row.ppnAmount)}</td></tr>
              ${row.pakaiUangMuka ? `<tr><td style="${td}">Uang Muka Dipakai :</td><td style="${td}text-align:right;">(${fasNum2(row.pakaiUangMuka)})</td></tr>` : ''}
              <tr style="border-top:2px solid #111;"><td style="${td}font-weight:800;">Grand Total :</td><td style="${td}text-align:right;font-weight:800;">${fasNum2(row.total)}</td></tr>
            </tbody></table>
          </div>
        </div>
      </div>
      <div class="modal-footer"><button class="btn-secondary" id="modalCancel">Tutup</button></div>
    </div>`;
}

/* Picker Customer / Aset / PPN / Akun GL — salinan lokal. */
function tplFasCustomerPicker(list){
  return `
    <div class="modal-box" style="max-width:640px;">
      <div class="modal-header"><span>Pilih Customer</span><span class="close" id="modalClose">&times;</span></div>
      <div class="modal-body">
        <input type="text" id="fasCustomerPickerSearch" placeholder="Cari kode / nama customer..." style="width:100%;border:1px solid var(--border);border-radius:6px;padding:8px 10px;font-size:12.8px;margin-bottom:12px;">
        <div class="table-wrap" style="max-height:360px;overflow:auto;">
          <table>
            <thead><tr><th>Kode</th><th>Nama Customer</th><th></th></tr></thead>
            <tbody id="fasCustomerPickerBody">${tplFasCustomerPickerRows(list)}</tbody>
          </table>
        </div>
      </div>
      <div class="modal-footer"><button class="btn-secondary" id="modalCancel">Tutup</button></div>
    </div>`;
}

function tplFasCustomerPickerRows(list){
  if(!list.length) return `<tr><td colspan="3" style="color:var(--text-light);">Tidak ada customer ditemukan</td></tr>`;
  return list.map(c=>`
    <tr><td>${c.kode}</td><td>${c.nama}</td><td><button class="btn-pick" data-pick-customer="${c.kode}">Pilih</button></td></tr>`).join('');
}

function tplFasAsetPicker(list){
  return `
    <div class="modal-box" style="max-width:720px;">
      <div class="modal-header"><span>Pilih Fixed Asset</span><span class="close" id="modalClose">&times;</span></div>
      <div class="modal-body">
        <input type="text" id="fasAsetPickerSearch" placeholder="Cari kode / nama aset..." style="width:100%;border:1px solid var(--border);border-radius:6px;padding:8px 10px;font-size:12.8px;margin-bottom:12px;">
        <div class="table-wrap" style="max-height:340px;overflow:auto;">
          <table>
            <thead><tr><th>Kode</th><th>Nama Aset</th><th>Cabang</th><th class="text-right">Harga Beli</th><th></th></tr></thead>
            <tbody id="fasAsetPickerBody">${tplFasAsetPickerRows(list)}</tbody>
          </table>
        </div>
      </div>
      <div class="modal-footer"><button class="btn-secondary" id="modalCancel">Tutup</button></div>
    </div>`;
}

function tplFasAsetPickerRows(list){
  if(!list.length) return `<tr><td colspan="5" style="color:var(--text-light);">Tidak ada aset ditemukan</td></tr>`;
  return list.map(a=>`
    <tr><td>${a.kode}</td><td>${a.nama}</td><td>${a.cabang||''}</td><td class="text-right">${fasNum2(a.hargaBeli||0)}</td><td><button class="btn-pick" data-pick-aset="${a.kode}">Pilih</button></td></tr>`).join('');
}

function tplFasPpnPicker(list){
  return `
    <div class="modal-box" style="max-width:400px;">
      <div class="modal-header"><span>Pilih PPN</span><span class="close" id="modalClose">&times;</span></div>
      <div class="modal-body">
        <div class="table-wrap"><table>
          <thead><tr><th>Kode PPN</th><th>Persen</th><th></th></tr></thead>
          <tbody>${list.map(p=>`<tr><td>${p.kode}</td><td>${p.persen}%</td><td><button class="btn-pick" data-pick-ppn="${p.kode}" data-pick-persen="${p.persen}">Pilih</button></td></tr>`).join('')}</tbody>
        </table></div>
      </div>
      <div class="modal-footer"><button class="btn-secondary" id="modalCancel">Tutup</button></div>
    </div>`;
}

function tplFasAkunPicker(list){
  return `
    <div class="modal-box" style="max-width:640px;">
      <div class="modal-header"><span>Pilih Akun GL</span><span class="close" id="modalClose">&times;</span></div>
      <div class="modal-body">
        <input type="text" id="fasAkunPickerSearch" placeholder="Cari kode / nama akun..." style="width:100%;border:1px solid var(--border);border-radius:6px;padding:8px 10px;font-size:12.8px;margin-bottom:12px;">
        <div class="table-wrap" style="max-height:360px;overflow:auto;">
          <table>
            <thead><tr><th>Kode</th><th>Nama Akun</th><th>Kat.</th><th></th></tr></thead>
            <tbody id="fasAkunPickerBody">${tplFasAkunPickerRows(list)}</tbody>
          </table>
        </div>
      </div>
      <div class="modal-footer"><button class="btn-secondary" id="modalCancel">Tutup</button></div>
    </div>`;
}

function tplFasAkunPickerRows(list){
  if(!list.length) return `<tr><td colspan="4" style="color:var(--text-light);">Tidak ada akun ditemukan</td></tr>`;
  return list.map(a=>`
    <tr><td>${a.kode}</td><td>${a.nama}</td><td>${a.kategori}</td><td><button class="btn-pick" data-fas-pick-akun="${a.kode}">Pilih</button></td></tr>`).join('');
}

function tplFasDeleteConfirm(row){
  return `
    <div class="modal-box">
      <div class="modal-header"><span>Hapus Penjualan Fixed Asset</span><span class="close" id="modalClose">&times;</span></div>
      <div class="modal-body"><p>Yakin ingin menghapus transaksi <b>${row.no}</b> — ${(row.customer||'').toUpperCase()} (${fasNum2(row.total)})?</p></div>
      <div class="modal-footer">
        <button class="btn-secondary" id="modalCancel">Batal</button>
        <button class="btn-danger" id="modalDelete">Hapus</button>
      </div>
    </div>`;
}

function tplFasInfoModal(title,text){
  return `
    <div class="modal-box">
      <div class="modal-header"><span>${title}</span><span class="close" id="modalClose">&times;</span></div>
      <div class="modal-body"><p>${text}</p></div>
      <div class="modal-footer"><button class="btn-primary" id="modalOk">Mengerti</button></div>
    </div>`;
}
