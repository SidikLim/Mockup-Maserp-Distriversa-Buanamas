/* =========================================================
   TEMPLATE (HTML saja) — Pembelian dari PO (Supplier &
   Pembelian > Daftar Transaksi > Pembelian dari PO, key
   page:'pembelianPO'). Semua fungsi di file ini HANYA menyusun
   & mengembalikan markup HTML (string) atau helper murni, TIDAK
   ada DOM-binding/data mutation di sini. Logic-nya ada di file
   sebelah: pembelian-po.js

   Sesuai 2 screenshot MASERP yang dikirim user:
   1) List "Daftar Pembelian dari PO": chip periode (FUNGSIONAL,
      default Agustus 2026) + Tambah; kolom No. Faktur (link ->
      Lihat) / No. PO / Tgl. Faktur / Supplier / Tipe Transaksi /
      Nilai Faktur / Pembayaran + Lihat / Ubah / Hapus (Hapus
      NONAKTIF bila Pembayaran > 0, pola sama Pembelian
      Langsung). Screenshot list kosong — 2 baris sample DBM.
   2) Form "+ Pembelian dari PO": heading kiri + Cabang (disabled,
      IKUT PO); "Dari Purchase Order" (picker DATA.purchaseOrder
      "--Pilih PO--") + Supplier (disabled, ikut PO) + Supplier
      No. Faktur; No. Otomatis "PU001" + No. Faktur
      "26/PU/{kode}/08/{urut}" + refresh + Tgl. Faktur + Syarat
      Bayar (ikut PO) + Tgl. Jth. Tempo; Gudang (hint "Gudang
      dipilih dari transaksi purchase order", disabled ikut PO) +
      Jurnal (hint "Pilih jurnal setelah anda memilih syarat bayar
      terdahulu") + Alamat Pengiriman (ikut PO). Tab "Rincian
      Transaksi" (scroll horizontal): No. / Kode Barang / Nama
      Barang / Multi Batch Number (+) / Qty. Pesan (readonly dari
      PO) / Qty (EDITABLE — qty difakturkan, divalidasi <= Qty
      Pesan) / Qty. Belum Terima (readonly = Qty Pesan - Qty) /
      Satuan / Harga Beli / Fee Distribusi(%) / Budget Diskon(%) /
      Total Disc(%) / Disc per Barang / Jumlah. Tab "Rincian
      Jurnal Akun" pola Jurnal Otomatis/Manual + Buat Jurnal
      (D 1130001 Persediaan + D 1140002 PPN Masukan lawan
      K 2110001 Hutang Usaha / 1100002 Kas Besar + K 1140003 bila
      PPh — barang PO = persediaan). Panel bawah & footer PERSIS
      pola Pembelian Langsung (Informasi PPN, Diskon 1/2, DPP,
      Uang Muka Oldest/Pilih + Sisa + Pakai, Pajak %, Pph
      Dipotong, Ongkos Angkut, Jumlah, Sisa Jumlah, Keterangan;
      Perbaharui Kurs / Cetak / Simpan / Batalkan).
   Data: DATA.pembelianPO. */

const PPO_CABANG_LIST = ['Head Office','Surabaya','Bandung','Medan','Makassar','Semarang','Tangerang','Sidoarjo'];
const PPO_CABANG_CODE = {'Head Office':'HO','Surabaya':'SBY','Bandung':'BDG','Medan':'MDN','Makassar':'MKS','Semarang':'SMG','Tangerang':'TGR','Sidoarjo':'SDA'};
const PPO_SYARAT_BAYAR_LIST = ['COD','CBD','Kredit 14 Hari','Kredit 30 Hari','Kredit 45 Hari','Kredit 60 Hari'];
const PPO_SATUAN_LIST = ['UNIT','Pcs','Dus','Karung','Box','Pack'];
const PPO_PPH_LIST = [
  {kode:'PPH 22 (0.3)', persen:0.3},
  {kode:'PPH 23 (2)', persen:2},
];
const PPO_BULAN_LIST = [
  {label:'Agustus 2026', mm:'08', yy:'2026'},
  {label:'Juli 2026', mm:'07', yy:'2026'},
  {label:'Semua Periode', mm:'', yy:''},
];

function ppoNum2(n){ return Number(n||0).toLocaleString('id-ID', {minimumFractionDigits:2, maximumFractionDigits:2}); }
function ppoAkunNama(kode){ const a = DATA.akunGL.find(x => x.kode === kode); return a ? a.nama : ''; }
function ppoTipeTransaksi(row){ return (row.syaratBayar||'').indexOf('Kredit') === 0 ? 'Pembelian Kredit' : 'Pembelian Tunai'; }

/* =====================================================================
   LIST PAGE — "Daftar Pembelian dari PO"
===================================================================== */
function tplPembelianPOListPage(bulan){
  return `
    <div class="breadcrumb">Home / Supplier &amp; Pembelian / <b>Pembelian dari PO</b></div>
    <div class="card">
      <div class="card-header dark-header">
        <h3>${icon('alertTriangle',15)} Daftar Pembelian dari PO</h3>
        <div class="toolbar-actions">
          <select class="chip-btn" id="ppoFilterBulan">${PPO_BULAN_LIST.map(b=>`<option value="${b.mm}|${b.yy}" ${bulan===b.mm+'|'+b.yy?'selected':''}>${b.label}</option>`).join('')}</select>
          <button class="btn-primary" id="btnPpoAdd">${icon('plus',14)} Tambah</button>
        </div>
      </div>
      <div class="table-toolbar">
        <select id="ppoPageSize"><option selected>10</option><option>25</option><option>50</option></select>
        <input type="text" id="ppoSearch" placeholder="Pencarian Global">
      </div>
      <div class="table-wrap"><table>
        <thead><tr>
          <th style="width:160px;">No. Faktur</th>
          <th style="width:160px;">No. PO</th>
          <th style="width:100px;">Tgl. Faktur</th>
          <th>Supplier</th>
          <th style="width:130px;">Tipe Transaksi</th>
          <th class="text-right" style="width:125px;">Nilai Faktur</th>
          <th class="text-right" style="width:115px;">Pembayaran</th>
          <th style="width:60px;">Lihat</th>
          <th style="width:60px;">Ubah</th>
          <th style="width:64px;">Hapus</th>
        </tr></thead>
        <tbody id="ppoTbody"></tbody>
      </table></div>
      <div class="table-footer"><div class="pager"><button>First</button><button>Previous</button><button class="active">1</button><button>Next</button><button>Last</button></div><div id="ppoTotal"></div></div>
    </div>`;
}

function tplPpoRows(rows){
  if(!rows.length) return `<tr><td colspan="10" style="text-align:center;font-weight:700;padding:14px;">Tidak Ada Data</td></tr>`;
  return rows.map((r,i)=>{
    const lunas = Number(r.pembayaran||0) > 0;
    return `
    <tr>
      <td><button class="link-pick" data-view-link="${i}">${r.no}</button></td>
      <td>${r.noPO||''}</td>
      <td>${r.tglFaktur||''}</td>
      <td>${(r.supplier||'').toUpperCase()}</td>
      <td>${ppoTipeTransaksi(r)}</td>
      <td class="text-right">${ppoNum2(r.jumlahTotal)}</td>
      <td class="text-right">${ppoNum2(r.pembayaran)}</td>
      <td><button class="icon-btn view" data-ppo-view="${i}" title="Lihat">${icon('eye',15)}</button></td>
      <td><button class="icon-btn edit" data-ppo-edit="${i}" title="Ubah">${icon('edit',15)}</button></td>
      <td><button class="icon-btn del" data-ppo-del="${i}" title="${lunas?'Tidak bisa dihapus — sudah ada pembayaran':'Hapus'}" ${lunas?'disabled style="opacity:.45;cursor:not-allowed;"':''}>${icon('trash',15)}</button></td>
    </tr>`;
  }).join('');
}

/* =====================================================================
   FORM (full page) — "+ Pembelian dari PO"
===================================================================== */
function tplPpoForm(mode, row){
  const isAdd = mode === 'add';
  const isView = mode === 'view';
  const dis = isView ? 'disabled' : '';
  return `
    <div class="breadcrumb">Home / Pembelian dari PO / <b>${isAdd ? 'Tambah' : (isView ? 'Lihat' : 'Ubah')}</b></div>
    <div class="card">
      <div class="card-header dark-header">
        <h3>${icon('plus',15)} Pembelian dari PO</h3>
        <button class="btn-danger" id="btnPpoTutorial">${icon('card',14)} Tutorial</button>
      </div>
      <div class="card-body">
        <div class="form-grid-3" style="grid-template-columns:1.2fr 1.2fr 1fr;align-items:end;">
          <h2 style="font-size:20px;font-weight:700;color:var(--navy);margin:0 0 10px;padding-bottom:10px;border-bottom:1px solid var(--border);">Pembelian dari PO</h2>
          <div class="form-group">
            <label>Cabang</label>
            <select id="fPpoCabang" disabled>${PPO_CABANG_LIST.map(c=>`<option ${row.cabang===c?'selected':''}>${c}</option>`).join('')}</select>
          </div>
          <div class="form-group"></div>
        </div>

        <div class="form-grid-3" style="grid-template-columns:1.2fr 1.2fr 1fr;">
          <div class="form-group">
            <label>Dari Purchase Order</label>
            <div class="input-with-btn">
              <input type="text" id="fPpoNoPO" value="${row.noPO||''}" placeholder="--Pilih PO--" readonly>
              ${!isView ? `<button type="button" class="icon-btn edit" id="ppoPoSearch" title="Cari Purchase Order">${icon('search',13)}</button>` : ''}
            </div>
          </div>
          <div class="form-group"></div>
          <div class="form-group">
            <label>Supplier No. Faktur</label>
            <input type="text" id="fPpoSupplierNoFaktur" value="${row.supplierNoFaktur||''}" ${dis}>
          </div>
        </div>

        <div class="form-grid-3" style="grid-template-columns:1.2fr 1.2fr 1fr;">
          <div class="form-group">
            <label>Supplier</label>
            <div class="input-with-btn">
              <input type="text" id="fPpoSupplier" value="${(row.supplier||'').toUpperCase()}" placeholder="Pilih Supplier" disabled>
              <span class="icon-btn edit" style="pointer-events:none;opacity:.5;">${icon('search',13)}</span>
            </div>
          </div>
          <div class="form-group"></div>
          <div class="form-group"></div>
        </div>

        <div class="form-grid-3" style="grid-template-columns:120px 1.2fr 1fr 1fr 1fr;">
          <div class="form-group">
            <label>No. Otomatis</label>
            <select disabled><option>PU001</option></select>
          </div>
          <div class="form-group">
            <label>No. Faktur</label>
            <div class="input-with-btn">
              <input type="text" id="fPpoNo" value="${row.no||''}" readonly>
              ${isAdd ? `<button type="button" class="icon-btn edit" id="ppoRefreshNo" title="Generate Ulang Nomor">${icon('refreshCw',13)}</button>` : ''}
            </div>
          </div>
          <div class="form-group">
            <label>Tgl. Faktur</label>
            <div class="input-with-btn">
              <input type="text" id="fPpoTglFaktur" value="${row.tglFaktur||''}" ${dis}>
              <span class="icon-btn edit" style="pointer-events:none;">${icon('calendar',13)}</span>
            </div>
          </div>
          <div class="form-group">
            <label>Syarat Bayar</label>
            <select id="fPpoSyaratBayar" ${dis}><option value=""></option>${PPO_SYARAT_BAYAR_LIST.map(s=>`<option ${row.syaratBayar===s?'selected':''}>${s}</option>`).join('')}</select>
          </div>
          <div class="form-group">
            <label>Tgl. Jth. Tempo</label>
            <div class="input-with-btn">
              <input type="text" id="fPpoTglJthTempo" value="${row.tglJthTempo||''}" ${dis}>
              <span class="icon-btn edit" style="pointer-events:none;">${icon('calendar',13)}</span>
            </div>
          </div>
        </div>

        <div class="form-grid-3" style="grid-template-columns:1.2fr 1.2fr 1fr;">
          <div class="form-group">
            <label>Gudang</label>
            <div style="font-size:11px;color:var(--text-light);margin:2px 0 4px;">Gudang dipilih dari transaksi purchase order</div>
            <select id="fPpoGudang" disabled><option>${row.gudang||''}</option></select>
          </div>
          <div class="form-group">
            <label>Jurnal</label>
            <div style="font-size:11px;color:var(--text-light);margin:2px 0 4px;">Pilih jurnal setelah anda memilih syarat bayar terdahulu</div>
            <select id="fPpoJurnal" ${dis}><option value=""></option>${DATA.jurnalPembelian.map(j=>`<option ${row.jurnal===j.nama?'selected':''}>${j.nama}</option>`).join('')}</select>
          </div>
          <div class="form-group">
            <label>Alamat Pengiriman</label>
            <textarea id="fPpoAlamat" class="po-textarea" rows="3" ${dis}>${row.alamatPengiriman||''}</textarea>
          </div>
        </div>

        <div class="inv-tabs" style="margin-top:8px;">
          <button type="button" class="inv-tab-btn active" id="ppoTabRincianBtn">Rincian Transaksi</button>
          <button type="button" class="inv-tab-btn" id="ppoTabJurnalBtn">Rincian Jurnal Akun</button>
        </div>

        <div id="ppoTabRincianContent">${tplPpoRincianTab(row, isView)}</div>
        <div id="ppoTabJurnalContent" style="display:none;">${tplPpoJurnalContent(row, isView)}</div>

        ${tplPpoBottomPanel(row, isView)}
      </div>
      <div class="card-footer" style="display:flex;gap:10px;justify-content:flex-end;align-items:center;padding:14px 20px;border-top:1px solid var(--border);">
        ${!isView ? `
          <button type="button" class="btn-teal" id="ppoPerbaharuiKurs">Perbaharui Kurs</button>
          <button type="button" class="btn-teal" id="ppoCetak">${icon('printer',13)} Cetak</button>
          <button type="button" class="btn-primary" id="ppoSimpan">Simpan</button>` : ''}
        <a href="#" id="ppoBatalkan" class="link-add" style="margin-top:0;">${isView?'Tutup':'Batalkan'}</a>
      </div>
    </div>`;
}

/* ===== Tab 1 — Rincian Transaksi (barang PO, scroll horizontal) ===== */
function tplPpoRincianTab(row, isView){
  return `
    <div class="table-wrap" style="margin:10px 0 0;overflow-x:auto;">
      <table class="po-item-table" style="min-width:1420px;">
        <thead><tr>
          <th style="width:40px;">No.</th>
          <th style="width:130px;">Kode Barang</th>
          <th style="min-width:200px;">Nama Barang</th>
          <th style="width:88px;">Multi Batch Number</th>
          <th class="text-right" style="width:85px;">Qty. Pesan</th>
          <th class="text-right" style="width:85px;">Qty</th>
          <th class="text-right" style="width:95px;">Qty. Belum Terima</th>
          <th style="width:95px;">Satuan</th>
          <th class="text-right" style="width:115px;">Harga Beli</th>
          <th class="text-right" style="width:95px;">Fee Distribusi(%)</th>
          <th class="text-right" style="width:95px;">Budget Diskon(%)</th>
          <th class="text-right" style="width:85px;">Total Disc(%)</th>
          <th class="text-right" style="width:105px;">Disc/Barang</th>
          <th class="text-right" style="width:125px;">Jumlah</th>
        </tr></thead>
        <tbody id="ppoItemsBody">${tplPpoItemRows(row.items, isView)}</tbody>
      </table>
    </div>
    <div id="ppoItemsEmptyHint" style="font-size:11.5px;color:var(--text-light);margin-top:6px;${(row.items&&row.items.length)?'display:none;':''}">Belum ada rincian — pilih Purchase Order terlebih dahulu, barang PO akan tampil di sini.</div>`;
}

function tplPpoItemRows(items, isView){
  if(!items || !items.length) return '';
  const bg = 'background:#fdf0e3;';
  return items.map((it,idx)=>{
    const belum = Math.max(0, Number(it.qtyPesan||0) - Number(it.qty||0));
    return `
    <tr>
      <td style="text-align:center;${bg}">${idx+1}</td>
      <td style="${bg}"><input type="text" value="${it.kode||''}" readonly></td>
      <td style="${bg}"><textarea class="po-textarea" rows="2" disabled>${it.nama||''}</textarea></td>
      <td style="text-align:center;${bg}">${!isView ? `<button type="button" class="btn-primary" data-ppo-batch="${idx}" style="padding:4px 10px;font-size:12px;" title="Multi Batch Number">+</button>` : `<span style="font-size:11.5px;">${it.batch||'-'}</span>`}</td>
      <td style="${bg}"><input type="text" value="${Number(it.qtyPesan||0).toLocaleString('id-ID')}" readonly style="text-align:right;"></td>
      <td style="${bg}"><input type="number" min="0" max="${it.qtyPesan||0}" data-ppo-qty="${idx}" value="${it.qty!=null?it.qty:0}" ${isView?'disabled':''} style="text-align:right;"></td>
      <td style="${bg}"><input type="text" data-ppo-belum="${idx}" value="${belum.toLocaleString('id-ID')}" readonly style="text-align:right;"></td>
      <td style="${bg}"><input type="text" value="${it.satuan||''}" readonly></td>
      <td style="${bg}"><input type="number" min="0" data-ppo-harga="${idx}" value="${it.hargaBeli||0}" ${isView?'disabled':''} style="text-align:right;"></td>
      <td style="${bg}"><input type="number" min="0" data-ppo-fee="${idx}" value="${it.feeDistribusi||0}" ${isView?'disabled':''} style="text-align:right;"></td>
      <td style="${bg}"><input type="number" min="0" data-ppo-budget="${idx}" value="${it.budgetDiskon||0}" ${isView?'disabled':''} style="text-align:right;"></td>
      <td style="${bg}"><input type="text" data-ppo-totaldisc="${idx}" value="${it.totalDisc||0}" readonly style="text-align:right;"></td>
      <td style="${bg}"><input type="text" data-ppo-discbarang="${idx}" value="${ppoNum2(it.discBarang||0)}" readonly style="text-align:right;"></td>
      <td style="${bg}"><input type="text" data-ppo-jumlah="${idx}" value="${ppoNum2(it.jumlah||0)}" readonly style="text-align:right;"></td>
    </tr>`;
  }).join('');
}

/* ===== Tab 2 — Rincian Jurnal Akun (Otomatis / Manual) ===== */
function tplPpoJurnalContent(row, isView){
  const totals = ppoJurnalTotals(row);
  const selisihColor = Math.abs(totals.selisih) > 0.004 ? 'var(--red)' : 'var(--text)';
  const manual = row.jurnalMode === 'manual';
  return `
    ${!isView ? `
    <div style="display:flex;align-items:center;justify-content:space-between;margin:14px 0;flex-wrap:wrap;gap:10px;">
      <div class="radio-inline" style="display:flex;gap:18px;">
        <label style="display:flex;align-items:center;gap:6px;font-size:12.8px;"><input type="radio" name="ppoJurnalMode" value="otomatis" ${!manual?'checked':''} style="width:auto;"> Jurnal Otomatis</label>
        <label style="display:flex;align-items:center;gap:6px;font-size:12.8px;"><input type="radio" name="ppoJurnalMode" value="manual" ${manual?'checked':''} style="width:auto;"> Jurnal Manual</label>
      </div>
      <button type="button" class="btn-secondary" id="ppoBuatJurnal">${icon('refreshCw',13)} Buat Jurnal</button>
    </div>` : '<div style="margin-top:14px;"></div>'}
    <div class="card-header dark-header" style="border-radius:6px;">
      <h3>${icon('settings',14)} Rincian Jurnal Akun</h3>
      ${(!isView && manual) ? `<button type="button" class="btn-primary" id="ppoJurnalAddRow">${icon('plus',13)} Tambah</button>` : ''}
    </div>
    <div class="table-wrap" style="margin:6px 0 0;">
      <table class="po-item-table">
        <thead><tr>
          <th>Kode Akun</th><th>Nama Akun</th><th>Keterangan</th><th class="text-right">Jumlah Debit</th><th class="text-right">Jumlah Kredit</th><th>Hapus</th>
        </tr></thead>
        <tbody id="ppoJurnalBody">${tplPpoJurnalRows(row.jurnalAkun, isView || !manual)}</tbody>
      </table>
    </div>
    <div style="max-width:280px;margin:16px 0 0 auto;">
      <div style="font-size:12.5px;font-weight:600;color:var(--text);margin-bottom:4px;">Jumlah Debit - Kredit</div>
      <input type="text" id="ppoJurnalSelisih" value="${ppoNum2(totals.selisih)}" readonly style="text-align:right;font-weight:700;color:${selisihColor};">
    </div>`;
}

function tplPpoJurnalRows(list, readonly){
  if(!list || !list.length) return `<tr><td colspan="6" style="color:var(--text-light);">Belum ada rincian jurnal — klik "Buat Jurnal".</td></tr>`;
  return list.map((entry,idx)=>{
    if(readonly){
      return `
      <tr>
        <td style="min-width:110px;"><input type="text" value="${entry.kodeAkun||''}" readonly></td>
        <td style="min-width:180px;"><input type="text" value="${entry.namaAkun||''}" readonly></td>
        <td style="min-width:160px;"><input type="text" value="${entry.keterangan||''}" readonly></td>
        <td style="width:150px;"><input type="text" value="${ppoNum2(entry.debit||0)}" readonly style="text-align:right;"></td>
        <td style="width:150px;"><input type="text" value="${ppoNum2(entry.kredit||0)}" readonly style="text-align:right;"></td>
        <td style="width:50px;"></td>
      </tr>`;
    }
    return `
    <tr data-ppo-jurnal-row="${idx}">
      <td style="min-width:110px;">
        <div class="input-with-btn">
          <input type="text" data-ppo-jurnal-kode="${idx}" value="${entry.kodeAkun||''}" readonly>
          <button type="button" class="icon-btn edit" data-ppo-jurnal-akun-search="${idx}" title="Cari Akun GL">${icon('search',12)}</button>
        </div>
      </td>
      <td style="min-width:180px;"><input type="text" data-ppo-jurnal-nama="${idx}" value="${entry.namaAkun||''}" readonly></td>
      <td style="min-width:160px;"><input type="text" data-ppo-jurnal-ket="${idx}" value="${entry.keterangan||''}"></td>
      <td style="width:150px;"><input type="number" step="0.01" min="0" data-ppo-jurnal-debit="${idx}" value="${entry.debit||0}" style="text-align:right;"></td>
      <td style="width:150px;"><input type="number" step="0.01" min="0" data-ppo-jurnal-kredit="${idx}" value="${entry.kredit||0}" style="text-align:right;"></td>
      <td style="width:50px;"><button type="button" class="icon-btn del" data-ppo-jurnal-del="${idx}" title="Hapus Baris">${icon('trash',14)}</button></td>
    </tr>`;
  }).join('');
}

/* ===== Panel bawah — Informasi PPN + Rincian Transaksi + Uang Muka ===== */
function tplPpoBottomPanel(row, isView){
  const dis = isView ? 'disabled' : '';
  return `
    <div class="form-grid" style="margin-top:26px;">
      <div>
        <div class="form-section">Informasi PPN</div>
        <div class="radio-group">
          <label><input type="radio" name="ppoPpnMode" value="tidak" ${row.ppnMode==='tidak'?'checked':''} ${dis}> Tidak ada PPN</label>
          <label><input type="radio" name="ppoPpnMode" value="tidakDipungut" ${row.ppnMode==='tidakDipungut'?'checked':''} ${dis}> PPN Tidak Dipungut Pajak</label>
          <label><input type="radio" name="ppoPpnMode" value="inklusif" ${row.ppnMode==='inklusif'?'checked':''} ${dis}> PPN Inklusif</label>
          <label><input type="radio" name="ppoPpnMode" value="eksklusif" ${row.ppnMode==='eksklusif'?'checked':''} ${dis}> PPN Eksklusif (+11%)</label>
        </div>
        <div class="form-group" style="margin-top:26px;max-width:420px;">
          <label>Keterangan</label>
          <textarea id="fPpoKeterangan" class="po-textarea" rows="3" ${dis}>${row.keterangan||''}</textarea>
        </div>
      </div>
      <div>
        <div class="form-section">Rincian Transaksi</div>
        <table class="field-table po-rincian-table">
          <tr><td class="flabel">Mata Uang</td><td><input type="text" value="IDR" disabled></td><td class="flabel">Kurs</td><td><input type="text" value="${ppoNum2(row.kurs||1)}" disabled style="text-align:right;"></td></tr>
          <tr><td class="flabel">Diskon 1</td><td><input type="number" min="0" max="100" id="fPpoDiskon1" value="${row.diskon1||0}" ${dis} style="text-align:right;"> %</td><td></td><td><input type="text" id="fPpoDiskon1Amount" value="${ppoNum2(row.diskon1Amount||0)}" disabled style="text-align:right;"></td></tr>
          <tr><td class="flabel">Diskon 2</td><td><input type="number" min="0" max="100" id="fPpoDiskon2" value="${row.diskon2||0}" ${dis} style="text-align:right;"> %</td><td></td><td><input type="text" id="fPpoDiskon2Amount" value="${ppoNum2(row.diskon2Amount||0)}" disabled style="text-align:right;"></td></tr>
          <tr><td class="flabel">DPP</td><td colspan="3"><input type="text" id="fPpoDpp" value="${ppoNum2(row.dpp||0)}" disabled style="text-align:right;"></td></tr>
        </table>

        <div class="form-section" style="margin-top:18px;">Uang Muka</div>
        <table class="field-table po-rincian-table">
          <tr><td class="flabel">Tipe Uang Muka</td><td colspan="3">
            <div style="display:flex;gap:18px;">
              <label style="display:flex;align-items:center;gap:6px;font-size:12.5px;"><input type="radio" name="ppoUmTipe" value="Oldest" ${row.uangMukaTipe!=='Pilih'?'checked':''} ${dis} style="width:auto;"> Oldest</label>
              <label style="display:flex;align-items:center;gap:6px;font-size:12.5px;"><input type="radio" name="ppoUmTipe" value="Pilih" ${row.uangMukaTipe==='Pilih'?'checked':''} ${dis} style="width:auto;"> Pilih Uang Muka</label>
            </div>
          </td></tr>
          <tr><td class="flabel">Sisa U.Muka</td><td><input type="text" id="fPpoSisaUm" value="${ppoNum2(row.sisaUangMuka||0)}" disabled style="text-align:right;"></td><td class="flabel">Pakai:</td><td><input type="number" min="0" id="fPpoUmPakai" value="${row.uangMukaPakai||0}" ${dis} style="text-align:right;"></td></tr>
        </table>

        <table class="field-table po-rincian-table" style="margin-top:14px;">
          <tr><td class="flabel">Pajak <span id="ppoPajakPersenLabel">${row.ppnMode==='eksklusif'||row.ppnMode==='inklusif'?'11':'0'}</span> %</td><td>
              <div class="input-with-btn">
                <input type="text" id="fPpoPajakKode" value="${row.pajak11||''}" placeholder="Pilih Ppn" readonly>
                ${!isView ? `<button type="button" class="icon-btn edit" id="ppoPajakInfo" title="Pilih PPN">${icon('search',13)}</button>` : ''}
              </div>
            </td><td></td><td><input type="text" id="fPpoPpnAmount" value="${ppoNum2(row.ppnAmount||0)}" disabled style="text-align:right;"></td></tr>
          <tr><td class="flabel"><select disabled style="font-size:11.5px;"><option>Pph Dipotong</option></select></td><td>
              <div class="input-with-btn">
                <input type="text" id="fPpoPphKode" value="${row.pphKode||''}" placeholder="Pilih Pph" readonly>
                ${!isView ? `<button type="button" class="icon-btn edit" id="ppoPphSearch" title="Cari PPh">${icon('search',13)}</button>
                <button type="button" class="icon-btn del" id="ppoPphClear" title="Hapus PPh">${icon('trash',13)}</button>` : ''}
              </div>
            </td><td style="font-size:11.5px;color:var(--text-light);white-space:nowrap;"><span id="ppoPphPersenLabel">${row.pphKode ? row.pphPersen : 0}</span> %</td><td><input type="text" id="fPpoPphAmount" value="${ppoNum2(row.pphAmount||0)}" disabled style="text-align:right;"></td></tr>
          <tr><td class="flabel">Ongkos Angkut</td><td colspan="3"><input type="number" min="0" id="fPpoOngkosAngkut" value="${row.ongkosAngkut||0}" ${dis} style="text-align:right;"></td></tr>
          <tr><td class="flabel">Jumlah</td><td colspan="3"><input type="text" id="fPpoJumlah" value="${ppoNum2(row.jumlahTotal||0)}" disabled style="text-align:right;font-weight:700;"></td></tr>
          <tr><td class="flabel">Sisa Jumlah</td><td colspan="3"><input type="text" id="fPpoSisaJumlah" value="${ppoNum2(row.sisaJumlah||0)}" disabled style="text-align:right;font-weight:700;"></td></tr>
        </table>
      </div>
    </div>`;
}

/* Cetakan/preview Faktur Pembelian dari PO — kop DBM. */
function tplPpoPrintModal(row){
  const ho = DATA.cabangMaster[0] || {};
  const td = 'padding:4px 6px;font-size:11.5px;';
  const itemRows = (row.items||[]).filter(it => Number(it.qty||0) > 0).map((it,i)=>`
    <tr>
      <td style="${td}text-align:center;">${i+1}</td>
      <td style="${td}">${it.kode||'-'}</td>
      <td style="${td}white-space:pre-line;">${it.nama||''}</td>
      <td style="${td}text-align:right;">${Number(it.qty||0).toLocaleString('id-ID')}</td>
      <td style="${td}text-align:center;">${it.satuan||''}</td>
      <td style="${td}text-align:right;">${ppoNum2(it.hargaBeli)}</td>
      <td style="${td}text-align:right;">${ppoNum2(it.discBarang)}</td>
      <td style="${td}text-align:right;">${ppoNum2(it.jumlah)}</td>
    </tr>`).join('');
  return `
    <div class="modal-box" style="max-width:920px;width:96vw;">
      <div class="modal-header"><span>${icon('printer',15)} Cetak Pembelian dari PO — ${row.no}</span><span class="close" id="modalClose">&times;</span></div>
      <div class="modal-body" style="max-height:72vh;overflow:auto;">
        <div style="background:#fff;border:1px solid var(--border);padding:22px 26px;font-family:Arial,Helvetica,sans-serif;color:#111;">
          <div style="display:flex;gap:14px;align-items:flex-start;">
            <div style="width:64px;height:64px;border-radius:10px;background:var(--navy);color:#fff;display:flex;align-items:center;justify-content:center;font-weight:800;font-size:20px;">DBM</div>
            <div>
              <div style="font-weight:800;font-size:14px;">${(ho.namaPerusahaan||'PT Distriversa Buanamas').toUpperCase()}</div>
              <div style="font-size:11.5px;">${ho.alamat||''}, ${ho.kota||''} — Tlp: ${ho.telepon||''}</div>
            </div>
          </div>
          <div style="text-align:center;font-weight:800;font-size:15px;margin:12px 0;text-decoration:underline;">FAKTUR PEMBELIAN DARI PO</div>
          <table style="border:none;font-size:11.5px;"><tbody>
            <tr><td style="${td}">No. Faktur</td><td style="${td}">: ${row.no}</td><td style="${td}padding-left:40px;">Supplier</td><td style="${td}">: ${(row.supplier||'').toUpperCase()}</td></tr>
            <tr><td style="${td}">No. PO</td><td style="${td}">: ${row.noPO||'-'}</td><td style="${td}padding-left:40px;">Supplier No. Faktur</td><td style="${td}">: ${row.supplierNoFaktur||'-'}</td></tr>
            <tr><td style="${td}">Tgl. Faktur</td><td style="${td}">: ${row.tglFaktur||''}</td><td style="${td}padding-left:40px;">Syarat Bayar</td><td style="${td}">: ${row.syaratBayar||''} (${ppoTipeTransaksi(row)})</td></tr>
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
              <tr><td style="${td}">DPP :</td><td style="${td}text-align:right;">${ppoNum2(row.dpp)}</td></tr>
              <tr><td style="${td}">PPN :</td><td style="${td}text-align:right;">${ppoNum2(row.ppnAmount)}</td></tr>
              ${row.pphAmount ? `<tr><td style="${td}">PPh Dipotong :</td><td style="${td}text-align:right;">(${ppoNum2(row.pphAmount)})</td></tr>` : ''}
              ${row.ongkosAngkut ? `<tr><td style="${td}">Ongkos Angkut :</td><td style="${td}text-align:right;">${ppoNum2(row.ongkosAngkut)}</td></tr>` : ''}
              <tr style="border-top:2px solid #111;"><td style="${td}font-weight:800;">Jumlah :</td><td style="${td}text-align:right;font-weight:800;">${ppoNum2(row.jumlahTotal)}</td></tr>
              ${Number(row.uangMukaPakai||0) ? `<tr><td style="${td}">Uang Muka Dipakai :</td><td style="${td}text-align:right;">(${ppoNum2(row.uangMukaPakai)})</td></tr>` : ''}
              <tr><td style="${td}">Sisa Jumlah :</td><td style="${td}text-align:right;">${ppoNum2(row.sisaJumlah)}</td></tr>
            </tbody></table>
          </div>
        </div>
      </div>
      <div class="modal-footer"><button class="btn-secondary" id="modalCancel">Tutup</button></div>
    </div>`;
}

/* Picker PO / PPh / Akun GL + modal batch — salinan lokal pola modul lain. */
function tplPpoPoPicker(list){
  return `
    <div class="modal-box" style="max-width:820px;">
      <div class="modal-header"><span>Pilih Purchase Order</span><span class="close" id="modalClose">&times;</span></div>
      <div class="modal-body">
        <input type="text" id="ppoPoPickerSearch" placeholder="Cari no. PO / supplier..." style="width:100%;border:1px solid var(--border);border-radius:6px;padding:8px 10px;font-size:12.8px;margin-bottom:12px;">
        <div class="table-wrap" style="max-height:340px;overflow:auto;">
          <table>
            <thead><tr><th>No. PO</th><th>Tgl. PO</th><th>Supplier</th><th>Cabang</th><th>Status</th><th></th></tr></thead>
            <tbody id="ppoPoPickerBody">${tplPpoPoPickerRows(list)}</tbody>
          </table>
        </div>
      </div>
      <div class="modal-footer"><button class="btn-secondary" id="modalCancel">Tutup</button></div>
    </div>`;
}

function tplPpoPoPickerRows(list){
  if(!list.length) return `<tr><td colspan="6" style="color:var(--text-light);">Tidak ada PO ditemukan</td></tr>`;
  return list.map(p=>`
    <tr><td>${p.no}</td><td>${p.tglPO||''}</td><td>${p.supplier||''}</td><td>${p.cabang||''}</td><td>${p.status||''}</td><td><button class="btn-pick" data-ppo-pick-po="${p.no}">Pilih</button></td></tr>`).join('');
}

function tplPpoPphPicker(list){
  return `
    <div class="modal-box" style="max-width:400px;">
      <div class="modal-header"><span>Pilih PPh</span><span class="close" id="modalClose">&times;</span></div>
      <div class="modal-body">
        <div class="table-wrap"><table>
          <thead><tr><th>Kode PPh</th><th>Persen</th><th></th></tr></thead>
          <tbody>${list.map(p=>`<tr><td>${p.kode}</td><td>${p.persen}%</td><td><button class="btn-pick" data-ppo-pick-pph="${p.kode}" data-ppo-pick-persen="${p.persen}">Pilih</button></td></tr>`).join('')}</tbody>
        </table></div>
      </div>
      <div class="modal-footer"><button class="btn-secondary" id="modalCancel">Tutup</button></div>
    </div>`;
}

function tplPpoAkunPicker(list){
  return `
    <div class="modal-box" style="max-width:640px;">
      <div class="modal-header"><span>Pilih Akun GL</span><span class="close" id="modalClose">&times;</span></div>
      <div class="modal-body">
        <input type="text" id="ppoAkunPickerSearch" placeholder="Cari kode / nama akun..." style="width:100%;border:1px solid var(--border);border-radius:6px;padding:8px 10px;font-size:12.8px;margin-bottom:12px;">
        <div class="table-wrap" style="max-height:360px;overflow:auto;">
          <table>
            <thead><tr><th>Kode</th><th>Nama Akun</th><th>Kat.</th><th></th></tr></thead>
            <tbody id="ppoAkunPickerBody">${tplPpoAkunPickerRows(list)}</tbody>
          </table>
        </div>
      </div>
      <div class="modal-footer"><button class="btn-secondary" id="modalCancel">Tutup</button></div>
    </div>`;
}

function tplPpoAkunPickerRows(list){
  if(!list.length) return `<tr><td colspan="4" style="color:var(--text-light);">Tidak ada akun ditemukan</td></tr>`;
  return list.map(a=>`
    <tr><td>${a.kode}</td><td>${a.nama}</td><td>${a.kategori}</td><td><button class="btn-pick" data-ppo-pick-akun="${a.kode}">Pilih</button></td></tr>`).join('');
}

function tplPpoBatchModal(item){
  return `
    <div class="modal-box" style="max-width:420px;">
      <div class="modal-header"><span>Multi Batch Number — ${item.kode||item.nama||''}</span><span class="close" id="modalClose">&times;</span></div>
      <div class="modal-body">
        <div class="form-group">
          <label>Batch Number</label>
          <input type="text" id="fPpoBatchInput" value="${item.batch||''}" placeholder="contoh: MB-2608-001">
        </div>
        <div style="font-size:11.5px;color:var(--text-light);margin-top:6px;">Mockup — pada aplikasi asli bisa lebih dari satu batch per baris.</div>
      </div>
      <div class="modal-footer">
        <button class="btn-secondary" id="modalCancel">Batal</button>
        <button class="btn-primary" id="ppoBatchOk">Simpan</button>
      </div>
    </div>`;
}

function tplPpoDeleteConfirm(row){
  return `
    <div class="modal-box">
      <div class="modal-header"><span>Hapus Pembelian dari PO</span><span class="close" id="modalClose">&times;</span></div>
      <div class="modal-body"><p>Yakin ingin menghapus Faktur <b>${row.no}</b> — ${(row.supplier||'').toUpperCase()} (PO ${row.noPO||'-'}, ${ppoNum2(row.jumlahTotal)})?</p></div>
      <div class="modal-footer">
        <button class="btn-secondary" id="modalCancel">Batal</button>
        <button class="btn-danger" id="modalDelete">Hapus</button>
      </div>
    </div>`;
}

function tplPpoInfoModal(title,text){
  return `
    <div class="modal-box">
      <div class="modal-header"><span>${title}</span><span class="close" id="modalClose">&times;</span></div>
      <div class="modal-body"><p>${text}</p></div>
      <div class="modal-footer"><button class="btn-primary" id="modalOk">Mengerti</button></div>
    </div>`;
}
