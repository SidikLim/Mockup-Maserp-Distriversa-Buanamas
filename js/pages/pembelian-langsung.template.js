/* =========================================================
   TEMPLATE (HTML saja) — Pembelian Langsung (Supplier &
   Pembelian > Daftar Transaksi > Pembelian Langsung, key
   page:'pembelianLangsung'). Semua fungsi di file ini HANYA
   menyusun & mengembalikan markup HTML (string) atau helper
   murni, TIDAK ada DOM-binding/data mutation di sini. Logic-nya
   ada di file sebelah: pembelian-langsung.js

   Sesuai 3 screenshot MASERP yang dikirim user:
   1) List "Daftar Pembelian Langsung": chip periode (FUNGSIONAL,
      default Agustus 2026) + Tambah; kolom No. Faktur (link ->
      Lihat) / Tgl. Faktur / Supplier / Tipe Transaksi (Pembelian
      Kredit / Pembelian Tunai, dari Syarat Bayar) / Nilai Faktur /
      Pembayaran + aksi Lihat / Ubah / Hapus — tombol Hapus
      NONAKTIF (pudar) bila Pembayaran > 0, persis screenshot.
   2) Form "+ Pembelian Langsung": heading kiri + Cabang; Supplier
      (picker) + Supplier No. Faktur (kanan); No. Otomatis "PU001"
      + No. Faktur "26/PU/{kode cabang}/08/{urut}" + refresh +
      Tgl. Faktur + Syarat Bayar + Tgl. Jth. Tempo; Gudang (hint
      "Pilih gudang yang akan digunakan", "Non Stock {cabang}" +
      gudang cabang) + Jurnal (hint "Pilih jurnal setelah anda
      memilih syarat bayar terdahulu", master Jurnal Pembelian) +
      Alamat Pengiriman; checkbox Penerimaan Konsinyasi.
      Tab "Rincian Transaksi" (baris disorot oranye persis
      screenshot, scroll horizontal): No. / Kode Barang (picker,
      opsional — jasa boleh kosong) / Nama Barang (textarea
      EDITABLE) / Multi Batch Number (tombol +) / Qty / Satuan /
      Harga Beli / Fee Distribusi(%) / Budget Diskon(%) / Total
      Disc(%) / Disc per Barang / Jumlah / Hapus + link "+Tambah
      Item Baru" & "+Import Barang" (mockup).
      Tab "Rincian Jurnal Akun": radio Jurnal Otomatis / Jurnal
      Manual + tombol Buat Jurnal; section gelap + Tambah; tabel
      Kode Akun (picker) / Nama Akun / Keterangan / Debit / Kredit
      / Hapus + "Jumlah Debit - Kredit". Otomatis: D beban (gudang
      Non Stock -> 5210002 Biaya Transportasi & Logistik; gudang
      stock -> 1130001 Persediaan) + D 1140002 PPN Masukan lawan
      K 2110001 Hutang Usaha (Kredit) / 1100002 Kas Besar (Tunai)
      + K 1140003 bila PPh dipotong.
      Bawah (selalu tampil): Informasi PPN (4 radio, default Tidak
      ada PPN persis screenshot) + panel Rincian Transaksi (Mata
      Uang/Kurs, Diskon 1 & 2 %+nilai, DPP) + Uang Muka (Oldest /
      Pilih Uang Muka, Sisa U.Muka dari Uang Muka Supplier
      supplier tsb, Pakai) + Pajak % (Pilih Ppn) + Pph Dipotong
      (picker+hapus) + Ongkos Angkut + Jumlah + Sisa Jumlah +
      Keterangan. Footer: Perbaharui Kurs / Cetak / Simpan /
      Batalkan. Data: DATA.pembelianLangsung. */

const PL_CABANG_LIST = ['Head Office','Surabaya','Bandung','Medan','Makassar','Semarang','Tangerang','Sidoarjo'];
const PL_CABANG_CODE = {'Head Office':'HO','Surabaya':'SBY','Bandung':'BDG','Medan':'MDN','Makassar':'MKS','Semarang':'SMG','Tangerang':'TGR','Sidoarjo':'SDA'};
const PL_SYARAT_BAYAR_LIST = ['COD','CBD','Kredit 14 Hari','Kredit 30 Hari','Kredit 45 Hari','Kredit 60 Hari'];
const PL_SATUAN_LIST = ['UNIT','Pcs','Dus','Karung','Box','Pack'];
const PL_PPH_LIST = [
  {kode:'PPH 22 (0.3)', persen:0.3},
  {kode:'PPH 23 (2)', persen:2},
];
const PL_BULAN_LIST = [
  {label:'Agustus 2026', mm:'08', yy:'2026'},
  {label:'Juli 2026', mm:'07', yy:'2026'},
  {label:'Semua Periode', mm:'', yy:''},
];

function plNum2(n){ return Number(n||0).toLocaleString('id-ID', {minimumFractionDigits:2, maximumFractionDigits:2}); }
function plAkunNama(kode){ const a = DATA.akunGL.find(x => x.kode === kode); return a ? a.nama : ''; }
function plTipeTransaksi(row){ return (row.syaratBayar||'').indexOf('Kredit') === 0 ? 'Pembelian Kredit' : 'Pembelian Tunai'; }

/* =====================================================================
   LIST PAGE — "Daftar Pembelian Langsung"
===================================================================== */
function tplPembelianLangsungListPage(bulan){
  return `
    <div class="breadcrumb">Home / Supplier &amp; Pembelian / <b>Pembelian Langsung</b></div>
    <div class="card">
      <div class="card-header dark-header">
        <h3>${icon('alertTriangle',15)} Daftar Pembelian Langsung</h3>
        <div class="toolbar-actions">
          <select class="chip-btn" id="plFilterBulan">${PL_BULAN_LIST.map(b=>`<option value="${b.mm}|${b.yy}" ${bulan===b.mm+'|'+b.yy?'selected':''}>${b.label}</option>`).join('')}</select>
          <button class="btn-primary" id="btnPlAdd">${icon('plus',14)} Tambah</button>
        </div>
      </div>
      <div class="table-toolbar">
        <select id="plPageSize"><option selected>10</option><option>25</option><option>50</option></select>
        <input type="text" id="plSearch" placeholder="Pencarian Global">
      </div>
      <div class="table-wrap"><table>
        <thead><tr>
          <th style="width:170px;">No. Faktur</th>
          <th style="width:100px;">Tgl. Faktur</th>
          <th>Supplier</th>
          <th style="width:140px;">Tipe Transaksi</th>
          <th class="text-right" style="width:130px;">Nilai Faktur</th>
          <th class="text-right" style="width:120px;">Pembayaran</th>
          <th style="width:60px;">Lihat</th>
          <th style="width:60px;">Ubah</th>
          <th style="width:64px;">Hapus</th>
        </tr></thead>
        <tbody id="plTbody"></tbody>
      </table></div>
      <div class="table-footer"><div class="pager"><button>First</button><button>Previous</button><button class="active">1</button><button>Next</button><button>Last</button></div><div id="plTotal"></div></div>
    </div>`;
}

function tplPlRows(rows){
  if(!rows.length) return `<tr><td colspan="9" style="color:var(--text-light);padding:14px;">Tidak ada Pembelian Langsung pada periode / pencarian ini.</td></tr>`;
  return rows.map((r,i)=>{
    const lunas = Number(r.pembayaran||0) > 0;
    return `
    <tr>
      <td><button class="link-pick" data-view-link="${i}">${r.no}</button></td>
      <td>${r.tglFaktur||''}</td>
      <td>${(r.supplier||'').toUpperCase()}</td>
      <td>${plTipeTransaksi(r)}</td>
      <td class="text-right">${plNum2(r.jumlahTotal)}</td>
      <td class="text-right">${plNum2(r.pembayaran)}</td>
      <td><button class="icon-btn view" data-pl-view="${i}" title="Lihat">${icon('eye',15)}</button></td>
      <td><button class="icon-btn edit" data-pl-edit="${i}" title="Ubah">${icon('edit',15)}</button></td>
      <td><button class="icon-btn del" data-pl-del="${i}" title="${lunas?'Tidak bisa dihapus — sudah ada pembayaran':'Hapus'}" ${lunas?'disabled style="opacity:.45;cursor:not-allowed;"':''}>${icon('trash',15)}</button></td>
    </tr>`;
  }).join('');
}

/* =====================================================================
   FORM (full page) — "+ Pembelian Langsung"
===================================================================== */
function tplPlGudangOptions(cabang, selected){
  const opts = ['Non Stock ' + cabang].concat(DATA.gudang.filter(g=>g.cabang===cabang).map(g=>g.nama));
  if(selected && !opts.includes(selected)) opts.unshift(selected);
  return opts.map(o=>`<option ${o===selected?'selected':''}>${o}</option>`).join('');
}

function tplPlForm(mode, row){
  const isAdd = mode === 'add';
  const isView = mode === 'view';
  const dis = isView ? 'disabled' : '';
  return `
    <div class="breadcrumb">Home / Pembelian Langsung / <b>${isAdd ? 'Tambah' : (isView ? 'Lihat' : 'Ubah')}</b></div>
    <div class="card">
      <div class="card-header dark-header">
        <h3>${icon('plus',15)} Pembelian Langsung</h3>
        <button class="btn-danger" id="btnPlTutorial">${icon('card',14)} Tutorial</button>
      </div>
      <div class="card-body">
        <div class="form-grid-3" style="grid-template-columns:1.2fr 1.2fr 1fr;align-items:end;">
          <h2 style="font-size:20px;font-weight:700;color:var(--navy);margin:0 0 10px;padding-bottom:10px;border-bottom:1px solid var(--border);">Pembelian Langsung</h2>
          <div class="form-group">
            <label>Cabang</label>
            <select id="fPlCabang" ${(!isAdd)?'disabled':dis}>${PL_CABANG_LIST.map(c=>`<option ${row.cabang===c?'selected':''}>${c}</option>`).join('')}</select>
          </div>
          <div class="form-group"></div>
        </div>

        <div class="form-grid-3" style="grid-template-columns:1.2fr 1.2fr 1fr;">
          <div class="form-group">
            <label>Supplier</label>
            <div class="input-with-btn">
              <input type="text" id="fPlSupplier" value="${(row.supplier||'').toUpperCase()}" placeholder="Pilih Supplier" readonly>
              ${!isView ? `<button type="button" class="icon-btn edit" id="plSupplierSearch" title="Cari Supplier">${icon('search',13)}</button>` : ''}
            </div>
          </div>
          <div class="form-group"></div>
          <div class="form-group">
            <label>Supplier No. Faktur</label>
            <input type="text" id="fPlSupplierNoFaktur" value="${row.supplierNoFaktur||''}" ${dis}>
          </div>
        </div>

        <div class="form-grid-3" style="grid-template-columns:120px 1.2fr 1fr 1fr 1fr;">
          <div class="form-group">
            <label>No. Otomatis</label>
            <select disabled><option>PU001</option></select>
          </div>
          <div class="form-group">
            <label>No. Faktur</label>
            <div class="input-with-btn">
              <input type="text" id="fPlNo" value="${row.no||''}" readonly>
              ${isAdd ? `<button type="button" class="icon-btn edit" id="plRefreshNo" title="Generate Ulang Nomor">${icon('refreshCw',13)}</button>` : ''}
            </div>
          </div>
          <div class="form-group">
            <label>Tgl. Faktur</label>
            <div class="input-with-btn">
              <input type="text" id="fPlTglFaktur" value="${row.tglFaktur||''}" ${dis}>
              <span class="icon-btn edit" style="pointer-events:none;">${icon('calendar',13)}</span>
            </div>
          </div>
          <div class="form-group">
            <label>Syarat Bayar</label>
            <select id="fPlSyaratBayar" ${dis}>${PL_SYARAT_BAYAR_LIST.map(s=>`<option ${row.syaratBayar===s?'selected':''}>${s}</option>`).join('')}</select>
          </div>
          <div class="form-group">
            <label>Tgl. Jth. Tempo</label>
            <div class="input-with-btn">
              <input type="text" id="fPlTglJthTempo" value="${row.tglJthTempo||''}" ${dis}>
              <span class="icon-btn edit" style="pointer-events:none;">${icon('calendar',13)}</span>
            </div>
          </div>
        </div>

        <div class="form-grid-3" style="grid-template-columns:1.2fr 1.2fr 1fr;">
          <div class="form-group">
            <label>Gudang</label>
            <div style="font-size:11px;color:var(--text-light);margin:2px 0 4px;">Pilih gudang yang akan digunakan</div>
            <select id="fPlGudang" ${dis}>${tplPlGudangOptions(row.cabang||'Head Office', row.gudang)}</select>
          </div>
          <div class="form-group">
            <label>Jurnal</label>
            <div style="font-size:11px;color:var(--text-light);margin:2px 0 4px;">Pilih jurnal setelah anda memilih syarat bayar terdahulu</div>
            <select id="fPlJurnal" ${dis}><option value=""></option>${DATA.jurnalPembelian.map(j=>`<option ${row.jurnal===j.nama?'selected':''}>${j.nama}</option>`).join('')}</select>
          </div>
          <div class="form-group">
            <label>Alamat Pengiriman</label>
            <textarea id="fPlAlamat" class="po-textarea" rows="3" ${dis}>${row.alamatPengiriman||''}</textarea>
          </div>
        </div>

        <label style="display:flex;align-items:center;gap:8px;font-size:12.8px;margin:8px 0 14px;">
          <input type="checkbox" id="fPlKonsinyasi" ${row.penerimaanKonsinyasi?'checked':''} ${dis} style="width:auto;"> Penerimaan Konsinyasi
        </label>

        <div class="inv-tabs">
          <button type="button" class="inv-tab-btn active" id="plTabRincianBtn">Rincian Transaksi</button>
          <button type="button" class="inv-tab-btn" id="plTabJurnalBtn">Rincian Jurnal Akun</button>
        </div>

        <div id="plTabRincianContent">${tplPlRincianTab(row, isView)}</div>
        <div id="plTabJurnalContent" style="display:none;">${tplPlJurnalContent(row, isView)}</div>

        ${tplPlBottomPanel(row, isView)}
      </div>
      <div class="card-footer" style="display:flex;gap:10px;justify-content:flex-end;align-items:center;padding:14px 20px;border-top:1px solid var(--border);">
        ${!isView ? `
          <button type="button" class="btn-teal" id="plPerbaharuiKurs">Perbaharui Kurs</button>
          <button type="button" class="btn-teal" id="plCetak">${icon('printer',13)} Cetak</button>
          <button type="button" class="btn-primary" id="plSimpan">Simpan</button>` : ''}
        <a href="#" id="plBatalkan" class="link-add" style="margin-top:0;">${isView?'Tutup':'Batalkan'}</a>
      </div>
    </div>`;
}

/* ===== Tab 1 — Rincian Transaksi (tabel barang, scroll horizontal) ===== */
function tplPlRincianTab(row, isView){
  return `
    <div class="table-wrap" style="margin:10px 0 0;overflow-x:auto;">
      <table class="po-item-table" style="min-width:1280px;">
        <thead><tr>
          <th style="width:40px;">No.</th>
          <th style="width:140px;">Kode Barang</th>
          <th style="min-width:220px;">Nama Barang</th>
          <th style="width:90px;">Multi Batch Number</th>
          <th class="text-right" style="width:80px;">Qty</th>
          <th style="width:100px;">Satuan</th>
          <th class="text-right" style="width:120px;">Harga Beli</th>
          <th class="text-right" style="width:100px;">Fee Distribusi(%)</th>
          <th class="text-right" style="width:100px;">Budget Diskon(%)</th>
          <th class="text-right" style="width:90px;">Total Disc(%)</th>
          <th class="text-right" style="width:110px;">Disc/Barang</th>
          <th class="text-right" style="width:130px;">Jumlah</th>
          <th style="width:56px;">Hapus</th>
        </tr></thead>
        <tbody id="plItemsBody">${tplPlItemRows(row.items, isView)}</tbody>
      </table>
    </div>
    ${!isView ? `
      <a href="#" class="link-add" id="plAddItem">${icon('plus',13)}Tambah Item Baru</a><br>
      <a href="#" class="link-add" id="plImportBarang" style="margin-top:4px;">${icon('plus',13)}Import Barang</a>` : ''}`;
}

function tplPlItemRows(items, isView){
  if(!items || !items.length) return `<tr><td colspan="13" style="color:var(--text-light);">Belum ada rincian — klik "+Tambah Item Baru".</td></tr>`;
  const bg = 'background:#fdf0e3;';
  return items.map((it,idx)=>`
    <tr>
      <td style="text-align:center;${bg}">${idx+1}</td>
      <td style="${bg}">
        <div class="input-with-btn">
          <input type="text" data-pl-kode="${idx}" value="${it.kode||''}" readonly>
          ${!isView ? `<button type="button" class="icon-btn edit" data-pl-item-search="${idx}" title="Cari Barang">${icon('search',12)}</button>` : ''}
        </div>
      </td>
      <td style="${bg}"><textarea data-pl-nama="${idx}" class="po-textarea" rows="2" ${isView?'disabled':''}>${it.nama||''}</textarea></td>
      <td style="text-align:center;${bg}">${!isView ? `<button type="button" class="btn-primary" data-pl-batch="${idx}" style="padding:4px 10px;font-size:12px;" title="Multi Batch Number">+</button>` : `<span style="font-size:11.5px;">${it.batch||'-'}</span>`}</td>
      <td style="${bg}"><input type="number" min="0" data-pl-qty="${idx}" value="${it.qty!=null?it.qty:1}" ${isView?'disabled':''} style="text-align:right;"></td>
      <td style="${bg}"><select data-pl-satuan="${idx}" ${isView?'disabled':''}>${PL_SATUAN_LIST.map(u=>`<option ${it.satuan===u?'selected':''}>${u}</option>`).join('')}</select></td>
      <td style="${bg}"><input type="number" min="0" data-pl-harga="${idx}" value="${it.hargaBeli||0}" ${isView?'disabled':''} style="text-align:right;"></td>
      <td style="${bg}"><input type="number" min="0" data-pl-fee="${idx}" value="${it.feeDistribusi||0}" ${isView?'disabled':''} style="text-align:right;"></td>
      <td style="${bg}"><input type="number" min="0" data-pl-budget="${idx}" value="${it.budgetDiskon||0}" ${isView?'disabled':''} style="text-align:right;"></td>
      <td style="${bg}"><input type="text" data-pl-totaldisc="${idx}" value="${it.totalDisc||0}" readonly style="text-align:right;"></td>
      <td style="${bg}"><input type="text" data-pl-discbarang="${idx}" value="${plNum2(it.discBarang||0)}" readonly style="text-align:right;"></td>
      <td style="${bg}"><input type="text" data-pl-jumlah="${idx}" value="${plNum2(it.jumlah||0)}" readonly style="text-align:right;"></td>
      <td style="text-align:center;${bg}">${!isView ? `<button type="button" class="icon-btn del" data-pl-item-del="${idx}" title="Hapus Baris">${icon('trash',14)}</button>` : ''}</td>
    </tr>`).join('');
}

/* ===== Tab 2 — Rincian Jurnal Akun (Otomatis / Manual) ===== */
function tplPlJurnalContent(row, isView){
  const totals = plJurnalTotals(row);
  const selisihColor = Math.abs(totals.selisih) > 0.004 ? 'var(--red)' : 'var(--text)';
  const manual = row.jurnalMode === 'manual';
  return `
    ${!isView ? `
    <div style="display:flex;align-items:center;justify-content:space-between;margin:14px 0;flex-wrap:wrap;gap:10px;">
      <div class="radio-inline" style="display:flex;gap:18px;">
        <label style="display:flex;align-items:center;gap:6px;font-size:12.8px;"><input type="radio" name="plJurnalMode" value="otomatis" ${!manual?'checked':''} style="width:auto;"> Jurnal Otomatis</label>
        <label style="display:flex;align-items:center;gap:6px;font-size:12.8px;"><input type="radio" name="plJurnalMode" value="manual" ${manual?'checked':''} style="width:auto;"> Jurnal Manual</label>
      </div>
      <button type="button" class="btn-secondary" id="plBuatJurnal">${icon('refreshCw',13)} Buat Jurnal</button>
    </div>` : '<div style="margin-top:14px;"></div>'}
    <div class="card-header dark-header" style="border-radius:6px;">
      <h3>${icon('settings',14)} Rincian Jurnal Akun</h3>
      ${(!isView && manual) ? `<button type="button" class="btn-primary" id="plJurnalAddRow">${icon('plus',13)} Tambah</button>` : ''}
    </div>
    <div class="table-wrap" style="margin:6px 0 0;">
      <table class="po-item-table">
        <thead><tr>
          <th>Kode Akun</th><th>Nama Akun</th><th>Keterangan</th><th class="text-right">Jumlah Debit</th><th class="text-right">Jumlah Kredit</th><th>Hapus</th>
        </tr></thead>
        <tbody id="plJurnalBody">${tplPlJurnalRows(row.jurnalAkun, isView || !manual)}</tbody>
      </table>
    </div>
    <div style="max-width:280px;margin:16px 0 0 auto;">
      <div style="font-size:12.5px;font-weight:600;color:var(--text);margin-bottom:4px;">Jumlah Debit - Kredit</div>
      <input type="text" id="plJurnalSelisih" value="${plNum2(totals.selisih)}" readonly style="text-align:right;font-weight:700;color:${selisihColor};">
    </div>`;
}

function tplPlJurnalRows(list, readonly){
  if(!list || !list.length) return `<tr><td colspan="6" style="color:var(--text-light);">Belum ada rincian jurnal — klik "Buat Jurnal".</td></tr>`;
  return list.map((entry,idx)=>{
    if(readonly){
      return `
      <tr>
        <td style="min-width:110px;"><input type="text" value="${entry.kodeAkun||''}" readonly></td>
        <td style="min-width:180px;"><input type="text" value="${entry.namaAkun||''}" readonly></td>
        <td style="min-width:160px;"><input type="text" value="${entry.keterangan||''}" readonly></td>
        <td style="width:150px;"><input type="text" value="${plNum2(entry.debit||0)}" readonly style="text-align:right;"></td>
        <td style="width:150px;"><input type="text" value="${plNum2(entry.kredit||0)}" readonly style="text-align:right;"></td>
        <td style="width:50px;"></td>
      </tr>`;
    }
    return `
    <tr data-pl-jurnal-row="${idx}">
      <td style="min-width:110px;">
        <div class="input-with-btn">
          <input type="text" data-pl-jurnal-kode="${idx}" value="${entry.kodeAkun||''}" readonly>
          <button type="button" class="icon-btn edit" data-pl-jurnal-akun-search="${idx}" title="Cari Akun GL">${icon('search',12)}</button>
        </div>
      </td>
      <td style="min-width:180px;"><input type="text" data-pl-jurnal-nama="${idx}" value="${entry.namaAkun||''}" readonly></td>
      <td style="min-width:160px;"><input type="text" data-pl-jurnal-ket="${idx}" value="${entry.keterangan||''}"></td>
      <td style="width:150px;"><input type="number" step="0.01" min="0" data-pl-jurnal-debit="${idx}" value="${entry.debit||0}" style="text-align:right;"></td>
      <td style="width:150px;"><input type="number" step="0.01" min="0" data-pl-jurnal-kredit="${idx}" value="${entry.kredit||0}" style="text-align:right;"></td>
      <td style="width:50px;"><button type="button" class="icon-btn del" data-pl-jurnal-del="${idx}" title="Hapus Baris">${icon('trash',14)}</button></td>
    </tr>`;
  }).join('');
}

/* ===== Panel bawah — Informasi PPN + Rincian Transaksi + Uang Muka ===== */
function tplPlBottomPanel(row, isView){
  const dis = isView ? 'disabled' : '';
  return `
    <div class="form-grid" style="margin-top:26px;">
      <div>
        <div class="form-section">Informasi PPN</div>
        <div class="radio-group">
          <label><input type="radio" name="plPpnMode" value="tidak" ${row.ppnMode==='tidak'?'checked':''} ${dis}> Tidak ada PPN</label>
          <label><input type="radio" name="plPpnMode" value="tidakDipungut" ${row.ppnMode==='tidakDipungut'?'checked':''} ${dis}> PPN Tidak Dipungut Pajak</label>
          <label><input type="radio" name="plPpnMode" value="inklusif" ${row.ppnMode==='inklusif'?'checked':''} ${dis}> PPN Inklusif</label>
          <label><input type="radio" name="plPpnMode" value="eksklusif" ${row.ppnMode==='eksklusif'?'checked':''} ${dis}> PPN Eksklusif (+11%)</label>
        </div>
        <div class="form-group" style="margin-top:26px;max-width:420px;">
          <label>Keterangan</label>
          <textarea id="fPlKeterangan" class="po-textarea" rows="3" ${dis}>${row.keterangan||''}</textarea>
        </div>
      </div>
      <div>
        <div class="form-section">Rincian Transaksi</div>
        <table class="field-table po-rincian-table">
          <tr><td class="flabel">Mata Uang</td><td><input type="text" value="IDR" disabled></td><td class="flabel">Kurs</td><td><input type="text" value="${plNum2(row.kurs||1)}" disabled style="text-align:right;"></td></tr>
          <tr><td class="flabel">Diskon 1</td><td><input type="number" min="0" max="100" id="fPlDiskon1" value="${row.diskon1||0}" ${dis} style="text-align:right;"> %</td><td></td><td><input type="text" id="fPlDiskon1Amount" value="${plNum2(row.diskon1Amount||0)}" disabled style="text-align:right;"></td></tr>
          <tr><td class="flabel">Diskon 2</td><td><input type="number" min="0" max="100" id="fPlDiskon2" value="${row.diskon2||0}" ${dis} style="text-align:right;"> %</td><td></td><td><input type="text" id="fPlDiskon2Amount" value="${plNum2(row.diskon2Amount||0)}" disabled style="text-align:right;"></td></tr>
          <tr><td class="flabel">DPP</td><td colspan="3"><input type="text" id="fPlDpp" value="${plNum2(row.dpp||0)}" disabled style="text-align:right;"></td></tr>
        </table>

        <div class="form-section" style="margin-top:18px;">Uang Muka</div>
        <table class="field-table po-rincian-table">
          <tr><td class="flabel">Tipe Uang Muka</td><td colspan="3">
            <div style="display:flex;gap:18px;">
              <label style="display:flex;align-items:center;gap:6px;font-size:12.5px;"><input type="radio" name="plUmTipe" value="Oldest" ${row.uangMukaTipe!=='Pilih'?'checked':''} ${dis} style="width:auto;"> Oldest</label>
              <label style="display:flex;align-items:center;gap:6px;font-size:12.5px;"><input type="radio" name="plUmTipe" value="Pilih" ${row.uangMukaTipe==='Pilih'?'checked':''} ${dis} style="width:auto;"> Pilih Uang Muka</label>
            </div>
          </td></tr>
          <tr><td class="flabel">Sisa U.Muka</td><td><input type="text" id="fPlSisaUm" value="${plNum2(row.sisaUangMuka||0)}" disabled style="text-align:right;"></td><td class="flabel">Pakai:</td><td><input type="number" min="0" id="fPlUmPakai" value="${row.uangMukaPakai||0}" ${dis} style="text-align:right;"></td></tr>
        </table>

        <table class="field-table po-rincian-table" style="margin-top:14px;">
          <tr><td class="flabel">Pajak <span id="plPajakPersenLabel">${row.ppnMode==='eksklusif'||row.ppnMode==='inklusif'?'11':'0'}</span> %</td><td>
              <div class="input-with-btn">
                <input type="text" id="fPlPajakKode" value="${row.pajak11||''}" placeholder="Pilih Ppn" readonly>
                ${!isView ? `<button type="button" class="icon-btn edit" id="plPajakInfo" title="Pilih PPN">${icon('search',13)}</button>` : ''}
              </div>
            </td><td></td><td><input type="text" id="fPlPpnAmount" value="${plNum2(row.ppnAmount||0)}" disabled style="text-align:right;"></td></tr>
          <tr><td class="flabel"><select disabled style="font-size:11.5px;"><option>Pph Dipotong</option></select></td><td>
              <div class="input-with-btn">
                <input type="text" id="fPlPphKode" value="${row.pphKode||''}" placeholder="Pilih Pph" readonly>
                ${!isView ? `<button type="button" class="icon-btn edit" id="plPphSearch" title="Cari PPh">${icon('search',13)}</button>
                <button type="button" class="icon-btn del" id="plPphClear" title="Hapus PPh">${icon('trash',13)}</button>` : ''}
              </div>
            </td><td style="font-size:11.5px;color:var(--text-light);white-space:nowrap;"><span id="plPphPersenLabel">${row.pphKode ? row.pphPersen : 0}</span> %</td><td><input type="text" id="fPlPphAmount" value="${plNum2(row.pphAmount||0)}" disabled style="text-align:right;"></td></tr>
          <tr><td class="flabel">Ongkos Angkut</td><td colspan="3"><input type="number" min="0" id="fPlOngkosAngkut" value="${row.ongkosAngkut||0}" ${dis} style="text-align:right;"></td></tr>
          <tr><td class="flabel">Jumlah</td><td colspan="3"><input type="text" id="fPlJumlah" value="${plNum2(row.jumlahTotal||0)}" disabled style="text-align:right;font-weight:700;"></td></tr>
          <tr><td class="flabel">Sisa Jumlah</td><td colspan="3"><input type="text" id="fPlSisaJumlah" value="${plNum2(row.sisaJumlah||0)}" disabled style="text-align:right;font-weight:700;"></td></tr>
        </table>
      </div>
    </div>`;
}

/* Cetakan/preview Faktur Pembelian Langsung — kop DBM. */
function tplPlPrintModal(row){
  const ho = DATA.cabangMaster[0] || {};
  const td = 'padding:4px 6px;font-size:11.5px;';
  const itemRows = (row.items||[]).map((it,i)=>`
    <tr>
      <td style="${td}text-align:center;">${i+1}</td>
      <td style="${td}">${it.kode||'-'}</td>
      <td style="${td}white-space:pre-line;">${it.nama||''}</td>
      <td style="${td}text-align:right;">${Number(it.qty||0).toLocaleString('id-ID')}</td>
      <td style="${td}text-align:center;">${it.satuan||''}</td>
      <td style="${td}text-align:right;">${plNum2(it.hargaBeli)}</td>
      <td style="${td}text-align:right;">${plNum2(it.discBarang)}</td>
      <td style="${td}text-align:right;">${plNum2(it.jumlah)}</td>
    </tr>`).join('');
  return `
    <div class="modal-box" style="max-width:920px;width:96vw;">
      <div class="modal-header"><span>${icon('printer',15)} Cetak Pembelian Langsung — ${row.no}</span><span class="close" id="modalClose">&times;</span></div>
      <div class="modal-body" style="max-height:72vh;overflow:auto;">
        <div style="background:#fff;border:1px solid var(--border);padding:22px 26px;font-family:Arial,Helvetica,sans-serif;color:#111;">
          <div style="display:flex;gap:14px;align-items:flex-start;">
            <div style="width:64px;height:64px;border-radius:10px;background:var(--navy);color:#fff;display:flex;align-items:center;justify-content:center;font-weight:800;font-size:20px;">DBM</div>
            <div>
              <div style="font-weight:800;font-size:14px;">${(ho.namaPerusahaan||'PT Distriversa Buanamas').toUpperCase()}</div>
              <div style="font-size:11.5px;">${ho.alamat||''}, ${ho.kota||''} — Tlp: ${ho.telepon||''}</div>
            </div>
          </div>
          <div style="text-align:center;font-weight:800;font-size:15px;margin:12px 0;text-decoration:underline;">FAKTUR PEMBELIAN LANGSUNG</div>
          <table style="border:none;font-size:11.5px;"><tbody>
            <tr><td style="${td}">No. Faktur</td><td style="${td}">: ${row.no}</td><td style="${td}padding-left:40px;">Supplier</td><td style="${td}">: ${(row.supplier||'').toUpperCase()}</td></tr>
            <tr><td style="${td}">Tgl. Faktur</td><td style="${td}">: ${row.tglFaktur||''}</td><td style="${td}padding-left:40px;">Supplier No. Faktur</td><td style="${td}">: ${row.supplierNoFaktur||'-'}</td></tr>
            <tr><td style="${td}">Syarat Bayar</td><td style="${td}">: ${row.syaratBayar||''} (${plTipeTransaksi(row)})</td><td style="${td}padding-left:40px;">Tgl. Jth. Tempo</td><td style="${td}">: ${row.tglJthTempo||''}</td></tr>
            <tr><td style="${td}">Keterangan</td><td style="${td}" colspan="3">: ${row.keterangan||''}</td></tr>
          </tbody></table>
          <table style="width:100%;border-collapse:collapse;margin-top:10px;">
            <thead><tr style="border-top:2px solid #111;border-bottom:2px solid #111;">
              <th style="${td}width:34px;">No.</th><th style="${td}text-align:left;">Kode</th><th style="${td}text-align:left;">Nama Barang</th><th style="${td}text-align:right;">Qty</th><th style="${td}">Satuan</th><th style="${td}text-align:right;">Harga Beli</th><th style="${td}text-align:right;">Disc</th><th style="${td}text-align:right;">Jumlah</th>
            </tr></thead>
            <tbody>${itemRows}</tbody>
          </table>
          <div style="border-top:2px solid #111;"></div>
          <div style="display:flex;justify-content:flex-end;margin-top:8px;">
            <table style="border:none;min-width:300px;font-size:11.5px;"><tbody>
              <tr><td style="${td}">DPP :</td><td style="${td}text-align:right;">${plNum2(row.dpp)}</td></tr>
              <tr><td style="${td}">PPN :</td><td style="${td}text-align:right;">${plNum2(row.ppnAmount)}</td></tr>
              ${row.pphAmount ? `<tr><td style="${td}">PPh Dipotong :</td><td style="${td}text-align:right;">(${plNum2(row.pphAmount)})</td></tr>` : ''}
              ${row.ongkosAngkut ? `<tr><td style="${td}">Ongkos Angkut :</td><td style="${td}text-align:right;">${plNum2(row.ongkosAngkut)}</td></tr>` : ''}
              <tr style="border-top:2px solid #111;"><td style="${td}font-weight:800;">Jumlah :</td><td style="${td}text-align:right;font-weight:800;">${plNum2(row.jumlahTotal)}</td></tr>
              ${Number(row.uangMukaPakai||0) ? `<tr><td style="${td}">Uang Muka Dipakai :</td><td style="${td}text-align:right;">(${plNum2(row.uangMukaPakai)})</td></tr>` : ''}
              <tr><td style="${td}">Sisa Jumlah :</td><td style="${td}text-align:right;">${plNum2(row.sisaJumlah)}</td></tr>
            </tbody></table>
          </div>
        </div>
      </div>
      <div class="modal-footer"><button class="btn-secondary" id="modalCancel">Tutup</button></div>
    </div>`;
}

/* Pickers & modal kecil — salinan lokal pola modul lain. */
function tplPlSupplierPicker(list){
  return `
    <div class="modal-box" style="max-width:640px;">
      <div class="modal-header"><span>Pilih Supplier</span><span class="close" id="modalClose">&times;</span></div>
      <div class="modal-body">
        <input type="text" id="plSupplierPickerSearch" placeholder="Cari kode / nama supplier..." style="width:100%;border:1px solid var(--border);border-radius:6px;padding:8px 10px;font-size:12.8px;margin-bottom:12px;">
        <div class="table-wrap" style="max-height:360px;overflow:auto;">
          <table>
            <thead><tr><th>Kode</th><th>Nama Supplier</th><th></th></tr></thead>
            <tbody id="plSupplierPickerBody">${tplPlSupplierPickerRows(list)}</tbody>
          </table>
        </div>
      </div>
      <div class="modal-footer"><button class="btn-secondary" id="modalCancel">Tutup</button></div>
    </div>`;
}

function tplPlSupplierPickerRows(list){
  if(!list.length) return `<tr><td colspan="3" style="color:var(--text-light);">Tidak ada supplier ditemukan</td></tr>`;
  return list.map(s=>`
    <tr><td>${s.kode}</td><td>${s.nama}</td><td><button class="btn-pick" data-pl-pick-supplier="${s.nama}">Pilih</button></td></tr>`).join('');
}

function tplPlItemPicker(list){
  return `
    <div class="modal-box" style="max-width:720px;">
      <div class="modal-header"><span>Pilih Barang</span><span class="close" id="modalClose">&times;</span></div>
      <div class="modal-body">
        <input type="text" id="plItemPickerSearch" placeholder="Cari kode / nama barang..." style="width:100%;border:1px solid var(--border);border-radius:6px;padding:8px 10px;font-size:12.8px;margin-bottom:12px;">
        <div class="table-wrap" style="max-height:360px;overflow:auto;">
          <table>
            <thead><tr><th>Kode</th><th>Nama Barang</th><th>Satuan</th><th class="text-right">Harga</th><th></th></tr></thead>
            <tbody id="plItemPickerBody">${tplPlItemPickerRows(list)}</tbody>
          </table>
        </div>
      </div>
      <div class="modal-footer"><button class="btn-secondary" id="modalCancel">Tutup</button></div>
    </div>`;
}

function tplPlItemPickerRows(list){
  if(!list.length) return `<tr><td colspan="5" style="color:var(--text-light);">Tidak ada barang ditemukan</td></tr>`;
  return list.map(b=>`
    <tr><td>${b.kode}</td><td>${b.nama}</td><td>${b.satuan||''}</td><td class="text-right">${Number(b.harga||0).toLocaleString('id-ID')}</td><td><button class="btn-pick" data-pl-pick-item="${b.kode}">Pilih</button></td></tr>`).join('');
}

function tplPlPphPicker(list){
  return `
    <div class="modal-box" style="max-width:400px;">
      <div class="modal-header"><span>Pilih PPh</span><span class="close" id="modalClose">&times;</span></div>
      <div class="modal-body">
        <div class="table-wrap"><table>
          <thead><tr><th>Kode PPh</th><th>Persen</th><th></th></tr></thead>
          <tbody>${list.map(p=>`<tr><td>${p.kode}</td><td>${p.persen}%</td><td><button class="btn-pick" data-pl-pick-pph="${p.kode}" data-pl-pick-persen="${p.persen}">Pilih</button></td></tr>`).join('')}</tbody>
        </table></div>
      </div>
      <div class="modal-footer"><button class="btn-secondary" id="modalCancel">Tutup</button></div>
    </div>`;
}

function tplPlAkunPicker(list){
  return `
    <div class="modal-box" style="max-width:640px;">
      <div class="modal-header"><span>Pilih Akun GL</span><span class="close" id="modalClose">&times;</span></div>
      <div class="modal-body">
        <input type="text" id="plAkunPickerSearch" placeholder="Cari kode / nama akun..." style="width:100%;border:1px solid var(--border);border-radius:6px;padding:8px 10px;font-size:12.8px;margin-bottom:12px;">
        <div class="table-wrap" style="max-height:360px;overflow:auto;">
          <table>
            <thead><tr><th>Kode</th><th>Nama Akun</th><th>Kat.</th><th></th></tr></thead>
            <tbody id="plAkunPickerBody">${tplPlAkunPickerRows(list)}</tbody>
          </table>
        </div>
      </div>
      <div class="modal-footer"><button class="btn-secondary" id="modalCancel">Tutup</button></div>
    </div>`;
}

function tplPlAkunPickerRows(list){
  if(!list.length) return `<tr><td colspan="4" style="color:var(--text-light);">Tidak ada akun ditemukan</td></tr>`;
  return list.map(a=>`
    <tr><td>${a.kode}</td><td>${a.nama}</td><td>${a.kategori}</td><td><button class="btn-pick" data-pl-pick-akun="${a.kode}">Pilih</button></td></tr>`).join('');
}

/* Modal input Multi Batch Number per baris barang. */
function tplPlBatchModal(item){
  return `
    <div class="modal-box" style="max-width:420px;">
      <div class="modal-header"><span>Multi Batch Number — ${item.kode||item.nama||''}</span><span class="close" id="modalClose">&times;</span></div>
      <div class="modal-body">
        <div class="form-group">
          <label>Batch Number</label>
          <input type="text" id="fPlBatchInput" value="${item.batch||''}" placeholder="contoh: MB-2608-001">
        </div>
        <div style="font-size:11.5px;color:var(--text-light);margin-top:6px;">Mockup — pada aplikasi asli bisa lebih dari satu batch per baris.</div>
      </div>
      <div class="modal-footer">
        <button class="btn-secondary" id="modalCancel">Batal</button>
        <button class="btn-primary" id="plBatchOk">Simpan</button>
      </div>
    </div>`;
}

function tplPlDeleteConfirm(row){
  return `
    <div class="modal-box">
      <div class="modal-header"><span>Hapus Pembelian Langsung</span><span class="close" id="modalClose">&times;</span></div>
      <div class="modal-body"><p>Yakin ingin menghapus Faktur <b>${row.no}</b> — ${(row.supplier||'').toUpperCase()} (${plNum2(row.jumlahTotal)})?</p></div>
      <div class="modal-footer">
        <button class="btn-secondary" id="modalCancel">Batal</button>
        <button class="btn-danger" id="modalDelete">Hapus</button>
      </div>
    </div>`;
}

function tplPlInfoModal(title,text){
  return `
    <div class="modal-box">
      <div class="modal-header"><span>${title}</span><span class="close" id="modalClose">&times;</span></div>
      <div class="modal-body"><p>${text}</p></div>
      <div class="modal-footer"><button class="btn-primary" id="modalOk">Mengerti</button></div>
    </div>`;
}
