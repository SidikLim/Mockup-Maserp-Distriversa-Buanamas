/* =========================================================
   TEMPLATE (HTML saja) — Retur Pembelian (Supplier & Pembelian >
   Daftar Transaksi > Retur Pembelian, key page:'returPembelian' —
   menu TERPISAH dari "Retur PB" yang masih placeholder). Semua
   fungsi di file ini HANYA menyusun & mengembalikan markup HTML
   (string) atau helper murni, TIDAK ada DOM-binding di sini.
   Logic-nya ada di file sebelah: retur-pembelian.js

   Sesuai 3 screenshot MASERP yang dikirim user:
   1) "Daftar Retur Pembelian": filter chip periode "Agustus 2026" +
      tombol +Tambah; kolom No. Retur (link biru -> Lihat) / Tgl.
      Retur / Supplier / Tipe Transaksi + aksi Lihat/Cetak/Hapus —
      TANPA kolom Ubah (dokumen retur dianggap final begitu
      disimpan, pola sama dgn Transaksi A.R. SSP yang juga tanpa
      Ubah).
   2) Form full page tab "Barang Yang Diretur": heading kiri +
      Cabang; No. Otomatis / No. Faktur (+refresh) / Supplier
      (readonly+cari) / Syarat Bayar ("Jadikan Nota Debit"); Tgl.
      Faktur / Tgl. Jth. Tempo / No. Faktur Pembelian (readonly +
      tombol hapus merah) / Jurnal ke kas/bank ini (dropdown
      DATA.jurnalPembelian); Gudang (dropdown DATA.gudang, format
      "(kode) nama") / Alamat Pengiriman / Supplier No. Faktur.
      Tabel item: Pph/Ppn/Kode Barang/Nama Barang/Multi Batch
      Number (input jumlah batch + subrow no. batch, qty, ED)/Qty/
      U/M/Harga Beli/Fee Distribusi(%)/Budget Diskon(%)/Total
      Disc%/Diskon/Jumlah, link "+Tambah Item Baru". Panel
      "Informasi PPN" (radio Tidak ada PPN/PPN Inklusif/PPN
      Eksklusif (+11%), Mata Uang, Tgl./No. Faktur Pajak) + panel
      "Rincian Transaksi" (Kurs, Diskon 1/2, DPP, Pajak 11% PPN11,
      PPH 22 (0.3) + tombol hapus, Jumlah, Sisa Total). Footer:
      Perbaharui Kurs / Cetak dan Simpan / Simpan / Batalkan.
   3) Form tab "Rincian Jurnal Akun": tombol "Buat Jurnal" di
      tengah, tabel dark-header + tombol Add: Kode Akun (+cari)/
      Nama Akun/Keterangan/Jumlah Debit/Jumlah Kredit/Hapus +
      "Jumlah Debit - Kredit". Contoh jurnal screenshot: Hutang
      Usaha(D) = Persediaan(K) + PPN Masukan(K) + Selisih
      Pembulatan(K) — dipetakan ke akun 7-digit DBM: 2110001(D),
      1130001(K), 1140002(K), 6510003(K penyeimbang, hanya muncul
      kalau ada sisa pembulatan).

   KONTEKS RANTAI TRANSAKSI: retur menunjuk 1 Faktur Pembelian
   (DATA.pembelianBPB) lewat picker "No. Faktur Pembelian" — barang
   yang bisa diretur mengikuti isi faktur itu (Kode/Nama/U/M/Harga
   terkunci dari faktur; Qty retur yang diedit user, divalidasi
   tidak melebihi qty faktur). Tombol cari di field Supplier
   membuka picker faktur yang SAMA (supplier ikut terisi dari
   faktur terpilih) — di MASERP asli supplier dipilih dulu baru
   fakturnya difilter, di mockup disederhanakan 1 langkah. Data
   batch (Multi Batch Number) disintesis saat faktur dipilih
   (faktur di mockup tidak menyimpan batch) — no. batch/qty/ED bisa
   diedit bebas, dekoratif terhadap kalkulasi. No. Retur format
   screenshot "26/RP-HO/08/00002" = 26/RP-{kode cabang}/08/{urut}.
   Kalkulasi item & total = pola pbbRecalcItem()/pbbRecalcTotals()
   (Pembelian Melalui BPB), prefix diganti rp.
========================================================= */

const RP_CABANG_LIST = ['Head Office','Surabaya','Bandung','Medan','Makassar','Semarang','Tangerang','Sidoarjo'];
const RP_CABANG_CODE = {'Head Office':'HO','Surabaya':'SBY','Bandung':'BDG','Medan':'MDN','Makassar':'MKS','Semarang':'SMG','Tangerang':'TGR','Sidoarjo':'SDA'};
const RP_SYARAT_BAYAR_LIST = ['Jadikan Nota Debit','Potong Hutang','Kembali Dana (Kas/Bank)'];
/* Salinan lokal pola PBB_PPH_LIST — bukan reference cross-file
   karena lazy-load antar modul tidak terjamin urutannya. */
const RP_PPH_LIST = [
  {kode:'PPH 22 (0.3)', persen:0.3},
  {kode:'PPH 22 (1.5)', persen:1.5},
  {kode:'PPH 23 (2)', persen:2},
];

function rpNum2(n){ return Number(n||0).toLocaleString('id-ID', {minimumFractionDigits:2, maximumFractionDigits:2}); }
function rpAkunNama(kode){ const a = DATA.akunGL.find(x => x.kode === kode); return a ? a.nama : ''; }

/* =====================================================================
   LIST PAGE — "Daftar Retur Pembelian"
===================================================================== */
function tplReturPembelianListPage(){
  return `
    <div class="breadcrumb">Home / <b>Retur Pembelian</b></div>
    <div class="card">
      <div class="card-header dark-header">
        <h3>${icon('alertTriangle',15)} Daftar Retur Pembelian</h3>
        <div class="toolbar-actions">
          <select class="chip-btn" id="rpFilterPeriod"><option>Agustus 2026</option><option>Juli 2026</option></select>
          <button class="btn-primary" id="btnRpAdd">${icon('plus',14)} Tambah</button>
        </div>
      </div>
      <div class="table-toolbar">
        <select id="rpPageSize"><option selected>10</option><option>25</option><option>50</option></select>
        <input type="text" id="rpSearch" placeholder="Pencarian Global">
      </div>
      <div class="table-wrap"><table>
        <thead><tr>
          <th>No. Retur</th>
          <th>Tgl. Retur</th>
          <th>Supplier</th>
          <th>Tipe Transaksi</th>
          <th>Lihat</th>
          <th>Cetak</th>
          <th>Hapus</th>
        </tr></thead>
        <tbody id="rpTbody"></tbody>
      </table></div>
      <div class="table-footer"><div class="pager"><button>First</button><button>Previous</button><button class="active">1</button><button>Next</button><button>Last</button></div><div id="rpTotal"></div></div>
    </div>`;
}

function tplRpRows(rows){
  if(!rows.length) return `<tr><td colspan="7" style="text-align:center;font-weight:700;">Tidak Ada Data</td></tr>`;
  return rows.map((r,i)=>`
    <tr>
      <td><button class="link-pick" data-view-link="${i}">${r.no}</button></td>
      <td>${r.tglFaktur||''}</td>
      <td>${r.supplier||''}</td>
      <td>${r.tipeTransaksi||''}</td>
      <td><button class="icon-btn view" data-view="${i}" title="Lihat">${icon('eye',15)}</button></td>
      <td><button class="icon-btn print" data-print="${i}" title="Cetak">${icon('printer',15)}</button></td>
      <td><button class="icon-btn del" data-del="${i}" title="Hapus">${icon('trash',15)}</button></td>
    </tr>`).join('');
}

/* =====================================================================
   FORM (full page) — header + tab Barang Yang Diretur / Rincian
   Jurnal Akun + Informasi PPN + Rincian Transaksi
===================================================================== */
function tplRpForm(mode, row){
  const isAdd = mode === 'add';
  const isView = mode === 'view';
  const dis = isView ? 'disabled' : '';
  const titleAction = isAdd ? 'Tambah' : 'Lihat';
  return `
    <div class="breadcrumb">Home / Retur Pembelian / <b>${titleAction}</b></div>
    <div class="card">
      <div class="card-header dark-header">
        <h3>${icon('plus',15)} Retur Pembelian</h3>
        <button class="btn-danger" id="btnRpTutorial">${icon('card',14)} Tutorial</button>
      </div>
      <div class="card-body">
        <div style="display:flex;align-items:flex-start;justify-content:space-between;gap:16px;flex-wrap:wrap;">
          <h2 style="font-size:20px;font-weight:700;color:var(--navy);margin:0;padding-bottom:10px;border-bottom:1px solid var(--border);min-width:260px;">Retur Pembelian</h2>
          <div class="form-group" style="max-width:260px;min-width:200px;margin-bottom:0;">
            <label>Cabang</label>
            <select id="fRpCabang" ${(!isAdd)?'disabled':dis}>${RP_CABANG_LIST.map(c=>`<option ${row.cabang===c?'selected':''}>${c}</option>`).join('')}</select>
          </div>
          <div style="min-width:200px;"></div>
        </div>

        <div class="form-grid-3" style="margin-top:18px;grid-template-columns:repeat(4,1fr);">
          <div class="form-group">
            <label>No. Otomatis</label>
            <select id="fRpNoOtomatis" ${(!isAdd)?'disabled':dis}>${RP_CABANG_LIST.map(c=>`<option value="${RP_CABANG_CODE[c]}" ${row.cabang===c?'selected':''}>RP${RP_CABANG_CODE[c]}</option>`).join('')}</select>
          </div>
          <div class="form-group">
            <label>No. Faktur</label>
            <div class="input-with-btn">
              <input type="text" id="fRpNo" value="${row.no||''}" readonly>
              ${isAdd ? `<button type="button" class="icon-btn edit" id="rpRefreshNo" title="Generate Ulang Nomor">${icon('refreshCw',13)}</button>` : ''}
            </div>
          </div>
          <div class="form-group">
            <label>Supplier</label>
            <div class="input-with-btn">
              <input type="text" id="fRpSupplier" value="${row.supplier||''}" placeholder="Pilih dari Faktur Pembelian" readonly>
              ${!isView ? `<button type="button" class="icon-btn edit" id="rpSupplierSearch" title="Cari Faktur Pembelian">${icon('search',13)}</button>` : ''}
            </div>
          </div>
          <div class="form-group">
            <label>Syarat Bayar</label>
            <select id="fRpSyaratBayar" ${dis}>${RP_SYARAT_BAYAR_LIST.map(s=>`<option ${row.syaratBayar===s?'selected':''}>${s}</option>`).join('')}</select>
          </div>
        </div>

        <div class="form-grid-3" style="grid-template-columns:repeat(4,1fr);">
          <div class="form-group">
            <label>Tgl. Faktur</label>
            <div class="input-with-btn">
              <input type="text" id="fRpTglFaktur" value="${row.tglFaktur||''}" ${dis}>
              <span class="icon-btn edit" style="pointer-events:none;">${icon('calendar',13)}</span>
            </div>
          </div>
          <div class="form-group">
            <label>Tgl. Jth. Tempo</label>
            <input type="text" id="fRpTglJthTempo" value="${row.tglJthTempo||''}" ${dis}>
          </div>
          <div class="form-group">
            <label>No. Faktur Pembelian</label>
            <div class="input-with-btn">
              <input type="text" id="fRpNoFakturPembelian" value="${row.noFakturPembelian||''}" placeholder="Pilih Faktur" readonly>
              ${!isView ? `<button type="button" class="icon-btn del" id="rpFakturClear" title="Hapus Faktur Terpilih">${icon('trash',13)}</button>` : ''}
            </div>
          </div>
          <div class="form-group">
            <label>Jurnal ke kas/bank ini</label>
            <select id="fRpJurnal" ${dis}>${DATA.jurnalPembelian.map(j=>`<option ${row.jurnal===j.nama?'selected':''}>${j.nama}</option>`).join('')}</select>
          </div>
        </div>

        <div class="form-grid-3" style="grid-template-columns:repeat(4,1fr);">
          <div class="form-group">
            <label>Gudang</label>
            <select id="fRpGudang" ${dis}>${DATA.gudang.map(g=>`<option value="${g.kode}" ${row.gudangKode===g.kode?'selected':''}>(${g.kode}) ${g.nama}</option>`).join('')}</select>
          </div>
          <div class="form-group" style="grid-column:2 / span 2;">
            <label>Alamat Pengiriman</label>
            <textarea id="fRpAlamat" class="po-textarea" rows="3" ${dis}>${row.alamatPengiriman||''}</textarea>
          </div>
          <div class="form-group">
            <label>Supplier No. Faktur</label>
            <input type="text" id="fRpSupplierNoFaktur" value="${row.supplierNoFaktur||''}" readonly>
          </div>
        </div>

        <div class="inv-tabs">
          <button type="button" class="inv-tab-btn active" id="rpTabBarangBtn">Barang Yang Diretur</button>
          <button type="button" class="inv-tab-btn" id="rpTabJurnalBtn">Rincian Jurnal Akun</button>
        </div>

        <div id="rpTabBarangContent">${tplRpBarangTab(row, isView)}</div>
        <div id="rpTabJurnalContent" style="display:none;">${tplRpJurnalContent(row, isView)}</div>

        <div class="form-grid" style="margin-top:26px;">
          <div>
            <div class="form-section">Informasi PPN</div>
            <div class="radio-group">
              <label><input type="radio" name="rpPpnMode" value="tidak" ${row.ppnMode==='tidak'?'checked':''} ${dis}> Tidak ada PPN</label>
              <label><input type="radio" name="rpPpnMode" value="inklusif" ${row.ppnMode==='inklusif'?'checked':''} ${dis}> PPN Inklusif</label>
              <label><input type="radio" name="rpPpnMode" value="eksklusif" ${row.ppnMode==='eksklusif'?'checked':''} ${dis}> PPN Eksklusif (+11%)</label>
            </div>
            <table class="field-table po-rincian-table" style="margin-top:10px;">
              <tr><td class="flabel">Mata Uang</td><td colspan="3"><select id="fRpMataUang" ${dis}><option ${row.mataUang==='IDR'?'selected':''}>Rupiah (IDR)</option><option ${row.mataUang==='USD'?'selected':''}>USD</option></select></td></tr>
              <tr><td class="flabel">Tgl. Faktur Pajak</td><td colspan="3"><input type="text" id="fRpTglFakturPajak" value="${row.tglFakturPajak||''}" ${dis}></td></tr>
              <tr><td class="flabel">No. Faktur Pajak</td><td colspan="3"><input type="text" id="fRpNoFakturPajak" value="${row.noFakturPajak||''}" ${dis}></td></tr>
            </table>
          </div>
          <div>
            <div class="form-section">Rincian Transaksi</div>
            <table class="field-table po-rincian-table">
              <tr><td class="flabel">Mata Uang</td><td><input type="text" value="${row.mataUang||'IDR'}" disabled></td><td class="flabel">Kurs</td><td><input type="text" id="fRpKurs" value="${rpNum2(row.kurs||1)}" disabled></td></tr>
              <tr><td class="flabel">Diskon 1</td><td><input type="number" id="fRpDiskon1" value="${row.diskon1||0}" ${dis}> %</td><td></td><td><input type="text" id="fRpDiskon1Amount" value="${rpNum2(row.diskon1Amount||0)}" disabled></td></tr>
              <tr><td class="flabel">Diskon 2</td><td><input type="number" id="fRpDiskon2" value="${row.diskon2||0}" ${dis}> %</td><td></td><td><input type="text" id="fRpDiskon2Amount" value="${rpNum2(row.diskon2Amount||0)}" disabled></td></tr>
              <tr><td class="flabel">DPP</td><td colspan="3"><input type="text" id="fRpDpp" value="${rpNum2(row.dpp||0)}" disabled></td></tr>
              <tr><td class="flabel">Pajak 11 %</td><td>
                  <div class="input-with-btn">
                    <input type="text" id="fRpPajak11" value="${row.pajak11||''}" readonly>
                    ${!isView ? `<button type="button" class="icon-btn edit" id="rpPajakInfo" title="Cari Kode Pajak">${icon('search',13)}</button>` : ''}
                  </div>
                </td><td class="flabel" style="background:none;">PPN</td><td><input type="text" id="fRpPpnAmount" value="${rpNum2(row.ppnAmount||0)}" disabled></td></tr>
              <tr><td class="flabel">PPh</td><td>
                  <div class="input-with-btn">
                    <input type="text" id="fRpPphKode" value="${row.pphKode||''}" placeholder="Tidak ada" readonly>
                    ${!isView ? `<button type="button" class="icon-btn edit" id="rpPphSearch" title="Cari PPh">${icon('search',13)}</button>` : ''}
                  </div>
                </td><td style="font-size:11.5px;color:var(--text-light);white-space:nowrap;">${row.pphKode? (row.pphPersen+' %') : ''}</td><td>
                  <div class="input-with-btn">
                    <input type="text" id="fRpPphAmount" value="${rpNum2(row.pphAmount||0)}" disabled>
                    ${!isView ? `<button type="button" class="icon-btn del" id="rpPphClear" title="Hapus PPh">${icon('trash',13)}</button>` : ''}
                  </div>
                </td></tr>
              <tr><td class="flabel">Jumlah</td><td colspan="3"><input type="text" id="fRpJumlahTotal" value="${rpNum2(row.jumlahTotal||0)}" disabled style="font-weight:700;font-size:14px;"></td></tr>
              <tr><td class="flabel">Sisa Total</td><td colspan="3"><input type="text" id="fRpSisaTotal" value="${rpNum2(row.sisaTotal||0)}" disabled></td></tr>
            </table>
          </div>
        </div>

        <table class="field-table" style="margin-top:16px;">
          <tr><td class="flabel">Keterangan</td><td><textarea id="fRpKeterangan" class="po-textarea" rows="2" ${dis}>${row.keterangan||''}</textarea></td></tr>
        </table>
      </div>
      <div class="card-footer" style="display:flex;gap:10px;justify-content:flex-end;align-items:center;padding:14px 20px;border-top:1px solid var(--border);">
        ${!isView ? `
          <button type="button" class="btn-teal" id="rpPerbaharuiKurs" style="background:#4dbd9e;">Perbaharui Kurs</button>
          <button type="button" class="btn-teal" id="rpCetakSimpan">Cetak dan Simpan</button>
          <button type="button" class="btn-primary" id="rpSimpan">Simpan</button>` : ''}
        <a href="#" id="rpBatalkan" class="link-add" style="margin-top:0;">${isView?'Tutup':'Batalkan'}</a>
      </div>
    </div>`;
}

/* ===== Tab 1 — Barang Yang Diretur ===== */
function tplRpBarangTab(row, isView){
  return `
    <div class="table-wrap" style="margin:10px 0 6px;">
      <table class="po-item-table">
        <thead><tr>
          <th>Pph</th>
          <th>Ppn</th>
          <th>Kode Barang</th>
          <th>Nama Barang</th>
          <th>Multi Batch Number</th>
          <th class="text-right">Qty</th>
          <th>U/M</th>
          <th class="text-right">Harga Beli</th>
          <th class="text-right">Fee Distribusi(%)</th>
          <th class="text-right">Budget Diskon(%)</th>
          <th class="text-right">Total Disc%</th>
          <th class="text-right">Diskon</th>
          <th class="text-right">Jumlah</th>
        </tr></thead>
        <tbody id="rpItemsBody">${tplRpItemRows(row.items, isView)}</tbody>
      </table>
    </div>
    <a href="#" id="rpTambahItem" class="link-add" style="${isView?'display:none;':''}">${icon('plus',12)} Tambah Item Baru</a>
    <div id="rpItemsEmptyHint" style="font-size:11.5px;color:var(--text-light);margin-top:6px;${(row.items&&row.items.length)?'display:none;':''}">Belum ada barang — pilih Faktur Pembelian terlebih dahulu (tombol cari di field Supplier), barang faktur itu akan tampil di sini untuk diretur.</div>`;
}

function tplRpItemRows(items, isView){
  if(!items || !items.length) return `<tr><td colspan="13" style="color:var(--text-light);">Belum ada barang yang diretur.</td></tr>`;
  const dis = isView ? 'disabled' : '';
  return items.map((it,idx)=>`
    <tr data-rp-item-row="${idx}">
      <td style="text-align:center;"><input type="checkbox" data-rp-pph="${idx}" ${it.pph?'checked':''} ${dis}></td>
      <td style="text-align:center;"><input type="checkbox" data-rp-ppn="${idx}" ${it.ppn?'checked':''} ${dis}></td>
      <td style="min-width:110px;">
        <div class="input-with-btn">
          <input type="text" value="${it.kode||''}" disabled>
          ${!isView ? `<button type="button" class="icon-btn edit" data-rp-item-info="${idx}" title="Info Barang">${icon('search',12)}</button>` : ''}
        </div>
      </td>
      <td style="min-width:190px;"><textarea rows="2" disabled>${it.nama||''}</textarea></td>
      <td style="min-width:230px;">
        <div class="input-with-btn">
          <input type="text" value="${(it.batches||[]).length}" disabled style="text-align:right;">
          ${!isView ? `<button type="button" class="icon-btn edit" data-rp-batch-info="${idx}" title="Cari Batch">${icon('search',12)}</button>` : ''}
        </div>
        ${(it.batches||[]).map((b,bi)=>`
          <div style="display:flex;gap:4px;margin-top:4px;">
            <input type="text" data-rp-batch-no="${idx}-${bi}" value="${b.no||''}" style="width:45%;" ${dis}>
            <input type="text" data-rp-batch-qty="${idx}-${bi}" value="${b.qty||0}" style="width:25%;text-align:right;" ${dis}>
            <input type="text" data-rp-batch-ed="${idx}-${bi}" value="${b.ed||''}" style="width:30%;" ${dis}>
          </div>`).join('')}
      </td>
      <td style="width:90px;"><input type="number" min="0" data-rp-qty="${idx}" value="${it.qty||0}" style="text-align:right;" ${dis}></td>
      <td style="width:80px;"><select data-rp-um="${idx}" disabled><option>${it.um||''}</option></select></td>
      <td style="width:110px;"><input type="text" value="${rpNum2(it.hargaBeli||0)}" disabled style="text-align:right;"></td>
      <td style="width:90px;"><input type="number" min="0" data-rp-fee="${idx}" value="${it.feeDistribusi||0}" style="text-align:right;" ${dis}></td>
      <td style="width:90px;"><input type="number" min="0" data-rp-budget="${idx}" value="${it.budgetDiskon||0}" style="text-align:right;" ${dis}></td>
      <td style="width:90px;"><input type="text" data-rp-totaldisc="${idx}" value="${it.totalDisc||0}" disabled style="text-align:right;"></td>
      <td style="width:110px;"><input type="text" data-rp-diskon="${idx}" value="${rpNum2(it.diskon||0)}" disabled style="text-align:right;"></td>
      <td style="width:130px;"><input type="text" data-rp-jumlah="${idx}" value="${rpNum2(it.jumlah||0)}" disabled style="text-align:right;"></td>
    </tr>`).join('');
}

/* ===== Tab 2 — Rincian Jurnal Akun (tombol "Buat Jurnal" di tengah,
   tabel selalu editable ala manual — sesuai screenshot yang semua
   barisnya punya picker akun & tombol hapus) ===== */
function tplRpJurnalContent(row, isView){
  const totals = rpJurnalTotals(row);
  const selisihColor = Math.abs(totals.selisih) > 0.004 ? 'var(--red)' : 'var(--text)';
  return `
    ${!isView ? `<div style="display:flex;justify-content:center;margin:14px 0;">
      <button type="button" class="btn-secondary" id="rpBuatJurnal">${icon('refreshCw',13)} Buat Jurnal</button>
    </div>` : '<div style="margin-top:14px;"></div>'}
    <div class="card-header dark-header" style="border-radius:6px;">
      <h3>${icon('settings',14)} Rincian Jurnal Akun</h3>
      ${!isView ? `<button type="button" class="btn-primary" id="rpJurnalAddRow">${icon('plus',13)} Add</button>` : ''}
    </div>
    <div class="table-wrap" style="margin:6px 0 0;">
      <table class="po-item-table">
        <thead><tr>
          <th>Kode Akun</th><th>Nama Akun</th><th>Keterangan</th><th class="text-right">Jumlah Debit</th><th class="text-right">Jumlah Kredit</th><th>Hapus</th>
        </tr></thead>
        <tbody id="rpJurnalBody">${tplRpJurnalRows(row.jurnalAkun, isView)}</tbody>
      </table>
    </div>
    <div style="max-width:280px;margin:16px 0 0 auto;">
      <div style="font-size:12.5px;font-weight:600;color:var(--text);margin-bottom:4px;">Jumlah Debit - Kredit</div>
      <input type="text" id="rpJurnalSelisih" value="${rpNum2(totals.selisih)}" readonly style="text-align:right;font-weight:700;color:${selisihColor};">
    </div>`;
}

function tplRpJurnalRows(list, isView){
  if(!list || !list.length) return `<tr><td colspan="6" style="color:var(--text-light);">Belum ada rincian jurnal — klik "Buat Jurnal".</td></tr>`;
  return list.map((entry,idx)=>{
    if(isView){
      return `
      <tr>
        <td style="min-width:110px;"><input type="text" value="${entry.kodeAkun||''}" readonly></td>
        <td style="min-width:180px;"><input type="text" value="${entry.namaAkun||''}" readonly></td>
        <td style="min-width:180px;"><input type="text" value="${entry.keterangan||''}" readonly></td>
        <td style="width:150px;"><input type="text" value="${rpNum2(entry.debit||0)}" readonly style="text-align:right;"></td>
        <td style="width:150px;"><input type="text" value="${rpNum2(entry.kredit||0)}" readonly style="text-align:right;"></td>
        <td style="width:50px;"></td>
      </tr>`;
    }
    return `
    <tr data-rp-jurnal-row="${idx}">
      <td style="min-width:110px;">
        <div class="input-with-btn">
          <input type="text" data-rp-jurnal-kode="${idx}" value="${entry.kodeAkun||''}" readonly>
          <button type="button" class="icon-btn edit" data-rp-jurnal-akun-search="${idx}" title="Cari Akun GL">${icon('search',12)}</button>
        </div>
      </td>
      <td style="min-width:180px;"><input type="text" data-rp-jurnal-nama="${idx}" value="${entry.namaAkun||''}" readonly></td>
      <td style="min-width:180px;"><input type="text" data-rp-jurnal-ket="${idx}" value="${entry.keterangan||''}"></td>
      <td style="width:150px;"><input type="number" step="0.01" min="0" data-rp-jurnal-debit="${idx}" value="${entry.debit||0}" style="text-align:right;"></td>
      <td style="width:150px;"><input type="number" step="0.01" min="0" data-rp-jurnal-kredit="${idx}" value="${entry.kredit||0}" style="text-align:right;"></td>
      <td style="width:50px;"><button type="button" class="icon-btn del" data-rp-jurnal-del="${idx}" title="Hapus Baris">${icon('trash',14)}</button></td>
    </tr>`;
  }).join('');
}

/* Picker "Pilih Faktur Pembelian" — sumber DATA.pembelianBPB. Dibuka
   dari tombol cari di field Supplier MAUPUN alur normal (lihat catatan
   KONTEKS RANTAI TRANSAKSI di header file). */
function tplRpFakturPicker(list){
  return `
    <div class="modal-box" style="max-width:760px;">
      <div class="modal-header"><span>Pilih Faktur Pembelian</span><span class="close" id="modalClose">&times;</span></div>
      <div class="modal-body">
        <div class="table-wrap" style="max-height:340px;overflow:auto;"><table>
          <thead><tr><th>No. Faktur</th><th>Tgl. Faktur</th><th>Supplier</th><th class="text-right">Nilai Faktur</th><th></th></tr></thead>
          <tbody>${list.length ? list.map(f=>`<tr><td>${f.no}</td><td>${f.tglFaktur||''}</td><td>${f.supplier||''}</td><td class="text-right">${num(f.jumlahTotal||0)}</td><td><button class="btn-pick" data-pick-faktur="${f.no}">Pilih</button></td></tr>`).join('') : `<tr><td colspan="5" style="color:var(--text-light);">Tidak ada Faktur Pembelian</td></tr>`}</tbody>
        </table></div>
      </div>
      <div class="modal-footer"><button class="btn-secondary" id="modalCancel">Tutup</button></div>
    </div>`;
}

function tplRpPphPicker(list){
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

/* Picker Akun GL utk baris jurnal — salinan lokal pola tplPuAkunPicker
   (Pelunasan Utang). */
function tplRpAkunPicker(list){
  return `
    <div class="modal-box" style="max-width:640px;">
      <div class="modal-header"><span>Pilih Akun GL</span><span class="close" id="modalClose">&times;</span></div>
      <div class="modal-body">
        <input type="text" id="rpAkunPickerSearch" placeholder="Cari kode / nama akun..." style="width:100%;border:1px solid var(--border);border-radius:6px;padding:8px 10px;font-size:12.8px;margin-bottom:12px;">
        <div class="table-wrap" style="max-height:360px;overflow:auto;">
          <table>
            <thead><tr><th>Kode</th><th>Nama Akun</th><th>Kat.</th><th></th></tr></thead>
            <tbody id="rpAkunPickerBody">${tplRpAkunPickerRows(list)}</tbody>
          </table>
        </div>
      </div>
      <div class="modal-footer"><button class="btn-secondary" id="modalCancel">Tutup</button></div>
    </div>`;
}

function tplRpAkunPickerRows(list){
  if(!list.length) return `<tr><td colspan="4" style="color:var(--text-light);">Tidak ada akun ditemukan</td></tr>`;
  return list.map(a=>`
    <tr>
      <td>${a.kode}</td>
      <td>${a.nama}</td>
      <td>${a.kategori}</td>
      <td><button class="btn-pick" data-rp-pick-akun="${a.kode}">Pilih</button></td>
    </tr>`).join('');
}

function tplRpDeleteConfirm(row){
  return `
    <div class="modal-box">
      <div class="modal-header"><span>Hapus Retur Pembelian</span><span class="close" id="modalClose">&times;</span></div>
      <div class="modal-body"><p>Yakin ingin menghapus Retur Pembelian <b>${row.no}</b> — ${row.supplier||''}?</p></div>
      <div class="modal-footer">
        <button class="btn-secondary" id="modalCancel">Batal</button>
        <button class="btn-danger" id="modalDelete">Hapus</button>
      </div>
    </div>`;
}

function tplRpInfoModal(title,text){
  return `
    <div class="modal-box">
      <div class="modal-header"><span>${title}</span><span class="close" id="modalClose">&times;</span></div>
      <div class="modal-body"><p>${text}</p></div>
      <div class="modal-footer"><button class="btn-primary" id="modalOk">Mengerti</button></div>
    </div>`;
}
