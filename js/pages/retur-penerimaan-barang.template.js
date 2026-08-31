/* =========================================================
   TEMPLATE (HTML saja) — Retur Penerimaan Barang / Retur PB
   (Supplier & Pembelian > Daftar Transaksi > Retur PB, key
   page:'returPB'). Semua fungsi di file ini HANYA menyusun &
   mengembalikan markup HTML (string) atau helper murni, TIDAK
   ada DOM-binding/data mutation di sini. Logic-nya ada di file
   sebelah: retur-penerimaan-barang.js

   Sesuai 3 screenshot MASERP yang dikirim user:
   1) List "Daftar Retur Penerimaan Barang": DUA chip filter di
      header — status tagihan (All / Ada Tagihan / Belum Ditagih,
      persis screenshot dropdown) + periode (Semua / Agustus
      2026 / Juli 2026) + Tambah; kolom No. RPB (link -> Lihat) /
      No. BPB / No. PO / Tgl. Retur / Supplier + aksi Attach
      (lampiran, mockup) / Lihat / Cetak / Ubah / Hapus.
      (Screenshot list kosong "Tidak Ada Data" — diberi 2 baris
      sample supaya list, filter & form Lihat langsung terisi.)
   2) Form "+ Retur Penerimaan Barang": heading kiri; No. BPB
      (picker DATA.pembelianBPB "--Pilih No. BPB--") + Cabang;
      No. PO (picker "--Pilih Purchase Order yang mau
      diterima--"); No. Otomatis "RPB001" (dekoratif) + No. RPB
      "26/RPB-0000000001" (urut GLOBAL 10 digit, BUKAN per
      cabang — persis screenshot) + refresh; Tgl. PO (readonly,
      ikut BPB/PO) + Tgl. Pengembalian + Supplier (readonly);
      No. S.J. Supplier + Alamat Pengiriman textarea; checkbox
      "Penerimaan Konsinyasi". Tab "Rincian Transaksi": No. /
      Kode Barang / Nama Barang / Multi Batch Number / Barcode /
      Satuan / Qty Retur (EDITABLE) / Qty. Terima (readonly dari
      BPB) — barang terisi otomatis saat pilih BPB. Di bawah tab:
      Keterangan textarea + Kurs. Tab "Rincian Jurnal Akun" pola
      Buat Jurnal: D 2110001 Hutang Usaha (total retur + PPN)
      lawan K 1130001 Persediaan (nilai barang) + K 1140002 PPN
      Masukan (11% bila BPB PPN eksklusif) — retur mengurangi
      hutang ke supplier. Footer: Simpan / Cetak (teal) /
      Batalkan. Data: DATA.returPenerimaanBarang. */

const RPB_CABANG_LIST = ['Head Office','Surabaya','Bandung','Medan','Makassar','Semarang','Tangerang','Sidoarjo'];
const RPB_BULAN_LIST = [
  {label:'Semua', mm:'', yy:''},
  {label:'Agustus 2026', mm:'08', yy:'2026'},
  {label:'Juli 2026', mm:'07', yy:'2026'},
];
const RPB_TAGIHAN_LIST = ['All','Ada Tagihan','Belum Ditagih'];

function rpbNum2(n){ return Number(n||0).toLocaleString('id-ID', {minimumFractionDigits:2, maximumFractionDigits:2}); }
function rpbAkunNama(kode){ const a = DATA.akunGL.find(x => x.kode === kode); return a ? a.nama : ''; }

/* =====================================================================
   LIST PAGE — "Daftar Retur Penerimaan Barang"
===================================================================== */
function tplReturPBListPage(state){
  return `
    <div class="breadcrumb">Home / Supplier &amp; Pembelian / <b>Retur PB</b></div>
    <div class="card">
      <div class="card-header dark-header">
        <h3>${icon('alertTriangle',15)} Daftar Retur Penerimaan Barang</h3>
        <div class="toolbar-actions">
          <select class="chip-btn" id="rpbFilterTagihan">${RPB_TAGIHAN_LIST.map(t=>`<option ${state.tagihan===t?'selected':''}>${t}</option>`).join('')}</select>
          <select class="chip-btn" id="rpbFilterBulan">${RPB_BULAN_LIST.map(b=>`<option value="${b.mm}|${b.yy}" ${state.bulan===b.mm+'|'+b.yy?'selected':''}>${b.label}</option>`).join('')}</select>
          <button class="btn-primary" id="btnRpbAdd">${icon('plus',14)} Tambah</button>
        </div>
      </div>
      <div class="table-toolbar">
        <select id="rpbPageSize"><option selected>10</option><option>25</option><option>50</option></select>
        <input type="text" id="rpbSearch" placeholder="Pencarian Global">
      </div>
      <div class="table-wrap"><table>
        <thead><tr>
          <th style="width:170px;">No. RPB</th>
          <th style="width:170px;">No. BPB</th>
          <th style="width:170px;">No. PO</th>
          <th style="width:100px;">Tgl. Retur</th>
          <th>Supplier</th>
          <th style="width:60px;">Attach</th>
          <th style="width:60px;">Lihat</th>
          <th style="width:60px;">Cetak</th>
          <th style="width:60px;">Ubah</th>
          <th style="width:64px;">Hapus</th>
        </tr></thead>
        <tbody id="rpbTbody"></tbody>
      </table></div>
      <div class="table-footer"><div class="pager"><button>First</button><button>Previous</button><button class="active">1</button><button>Next</button><button>Last</button></div><div id="rpbTotal"></div></div>
    </div>`;
}

function tplRpbRows(rows){
  if(!rows.length) return `<tr><td colspan="10" style="text-align:center;font-weight:700;padding:14px;">Tidak Ada Data</td></tr>`;
  return rows.map((r,i)=>`
    <tr>
      <td><button class="link-pick" data-view-link="${i}">${r.no}</button></td>
      <td>${r.noBPB||''}</td>
      <td>${r.noPO||''}</td>
      <td>${r.tglRetur||''}</td>
      <td>${r.supplier||''}</td>
      <td><button class="icon-btn view" data-rpb-attach="${i}" title="Lampiran">${icon('file',15)}</button></td>
      <td><button class="icon-btn view" data-rpb-view="${i}" title="Lihat">${icon('eye',15)}</button></td>
      <td><button class="icon-btn view" data-rpb-print="${i}" title="Cetak">${icon('printer',15)}</button></td>
      <td><button class="icon-btn edit" data-rpb-edit="${i}" title="Ubah">${icon('edit',15)}</button></td>
      <td><button class="icon-btn del" data-rpb-del="${i}" title="Hapus">${icon('trash',15)}</button></td>
    </tr>`).join('');
}

/* =====================================================================
   FORM (full page) — "+ Retur Penerimaan Barang"
===================================================================== */
function tplRpbForm(mode, row){
  const isAdd = mode === 'add';
  const isView = mode === 'view';
  const dis = isView ? 'disabled' : '';
  return `
    <div class="breadcrumb">Home / Retur PB / <b>${isAdd ? 'Tambah' : (isView ? 'Lihat' : 'Ubah')}</b></div>
    <div class="card">
      <div class="card-header dark-header">
        <h3>${icon('plus',15)} Retur Penerimaan Barang</h3>
      </div>
      <div class="card-body">
        <div class="form-grid-3" style="grid-template-columns:1.4fr 1fr 1.2fr;align-items:end;">
          <h2 style="font-size:20px;font-weight:700;color:var(--navy);margin:0 0 10px;padding-bottom:10px;border-bottom:1px solid var(--border);">Retur Penerimaan Barang</h2>
          <div class="form-group">
            <label>No. BPB</label>
            <div class="input-with-btn">
              <input type="text" id="fRpbNoBPB" value="${row.noBPB||''}" placeholder="--Pilih No. BPB--" readonly>
              ${!isView ? `<button type="button" class="icon-btn edit" id="rpbBpbSearch" title="Cari BPB">${icon('search',13)}</button>` : ''}
            </div>
          </div>
          <div class="form-group">
            <label>Cabang</label>
            <select id="fRpbCabang" ${dis}>${RPB_CABANG_LIST.map(c=>`<option ${row.cabang===c?'selected':''}>${c}</option>`).join('')}</select>
          </div>
        </div>

        <div class="form-grid-3" style="grid-template-columns:1.4fr 1fr 1.2fr;">
          <div class="form-group">
            <label>No. PO</label>
            <div class="input-with-btn">
              <input type="text" id="fRpbNoPO" value="${row.noPO||''}" placeholder="--Pilih Purchase Order yang mau diterima--" readonly>
              ${!isView ? `<button type="button" class="icon-btn edit" id="rpbPoSearch" title="Cari Purchase Order">${icon('search',13)}</button>` : ''}
            </div>
          </div>
          <div class="form-group"></div>
          <div class="form-group"></div>
        </div>

        <div class="form-grid-3" style="grid-template-columns:150px 1.3fr 1fr 1fr 1.2fr;">
          <div class="form-group">
            <label>No. Otomatis</label>
            <select disabled><option>RPB001</option></select>
          </div>
          <div class="form-group">
            <label>No. RPB</label>
            <div class="input-with-btn">
              <input type="text" id="fRpbNo" value="${row.no||''}" readonly>
              ${isAdd ? `<button type="button" class="icon-btn edit" id="rpbRefreshNo" title="Generate Ulang Nomor">${icon('refreshCw',13)}</button>` : ''}
            </div>
          </div>
          <div class="form-group">
            <label>Tgl. PO</label>
            <input type="text" id="fRpbTglPO" value="${row.tglPO||''}" disabled>
          </div>
          <div class="form-group">
            <label>Tgl. Pengembalian</label>
            <div class="input-with-btn">
              <input type="text" id="fRpbTglRetur" value="${row.tglRetur||''}" ${dis}>
              <span class="icon-btn edit" style="pointer-events:none;">${icon('calendar',13)}</span>
            </div>
          </div>
          <div class="form-group">
            <label>Supplier</label>
            <input type="text" id="fRpbSupplier" value="${row.supplier||''}" disabled>
          </div>
        </div>

        <div class="form-grid-3" style="grid-template-columns:1.4fr 1fr 1.2fr;">
          <div class="form-group">
            <label>No. S.J. Supplier</label>
            <input type="text" id="fRpbNoSJ" value="${row.noSJSupplier||''}" ${dis}>
          </div>
          <div class="form-group"></div>
          <div class="form-group">
            <label>Alamat Pengiriman</label>
            <textarea id="fRpbAlamat" class="po-textarea" rows="4" ${dis}>${row.alamatPengiriman||''}</textarea>
          </div>
        </div>

        <label style="display:flex;align-items:center;gap:8px;font-size:12.8px;margin:8px 0 14px;">
          <input type="checkbox" id="fRpbKonsinyasi" ${row.penerimaanKonsinyasi?'checked':''} ${dis} style="width:auto;"> Penerimaan Konsinyasi
        </label>

        <div class="inv-tabs">
          <button type="button" class="inv-tab-btn active" id="rpbTabRincianBtn">Rincian Transaksi</button>
          <button type="button" class="inv-tab-btn" id="rpbTabJurnalBtn">Rincian Jurnal Akun</button>
        </div>

        <div id="rpbTabRincianContent">${tplRpbRincianTab(row, isView)}</div>
        <div id="rpbTabJurnalContent" style="display:none;">${tplRpbJurnalContent(row, isView)}</div>
      </div>
      <div class="card-footer" style="display:flex;gap:10px;justify-content:flex-end;align-items:center;padding:14px 20px;border-top:1px solid var(--border);">
        ${!isView ? `
          <button type="button" class="btn-primary" id="rpbSimpan">Simpan</button>
          <button type="button" class="btn-teal" id="rpbCetak">${icon('printer',13)} Cetak</button>` : ''}
        <a href="#" id="rpbBatalkan" class="link-add" style="margin-top:0;">${isView?'Tutup':'Batalkan'}</a>
      </div>
    </div>`;
}

/* ===== Tab 1 — Rincian Transaksi + Keterangan & Kurs ===== */
function tplRpbRincianTab(row, isView){
  return `
    <div class="table-wrap" style="margin:10px 0 0;">
      <table class="po-item-table">
        <thead><tr>
          <th style="width:44px;">No.</th>
          <th style="width:120px;">Kode Barang</th>
          <th>Nama Barang</th>
          <th style="width:150px;">Multi Batch Number</th>
          <th style="width:120px;">Barcode</th>
          <th style="width:100px;">Satuan</th>
          <th class="text-right" style="width:110px;">Qty Retur</th>
          <th class="text-right" style="width:110px;">Qty. Terima</th>
        </tr></thead>
        <tbody id="rpbItemsBody">${tplRpbItemRows(row.items, isView)}</tbody>
      </table>
    </div>
    <div id="rpbItemsEmptyHint" style="font-size:11.5px;color:var(--text-light);margin-top:6px;${(row.items&&row.items.length)?'display:none;':''}">Belum ada rincian — pilih No. BPB terlebih dahulu, barang penerimaan akan tampil di sini.</div>

    <div class="form-grid-3" style="grid-template-columns:1.4fr 1.6fr;margin-top:18px;">
      <div>
        <div class="form-group">
          <label>Keterangan</label>
          <textarea id="fRpbKeterangan" class="po-textarea" rows="3" ${isView?'disabled':''}>${row.keterangan||''}</textarea>
        </div>
        <div class="form-group" style="margin-top:10px;">
          <label>Kurs</label>
          <input type="text" id="fRpbKurs" value="${row.kurs!=null?row.kurs:1}" ${isView?'disabled':''}>
        </div>
      </div>
      <div></div>
    </div>`;
}

function tplRpbItemRows(items, isView){
  if(!items || !items.length) return '';
  return items.map((it,idx)=>`
    <tr>
      <td style="text-align:center;">${idx+1}</td>
      <td><input type="text" value="${it.kode||''}" readonly></td>
      <td><input type="text" value="${it.nama||''}" readonly></td>
      <td><input type="text" data-rpb-batch="${idx}" value="${it.batch||''}" ${isView?'disabled':''}></td>
      <td><input type="text" data-rpb-barcode="${idx}" value="${it.barcode||''}" ${isView?'disabled':''}></td>
      <td><input type="text" value="${it.satuan||''}" readonly></td>
      <td style="width:110px;"><input type="number" min="0" max="${it.qtyTerima||0}" data-rpb-qtyretur="${idx}" value="${it.qtyRetur||0}" ${isView?'disabled':''} style="text-align:right;"></td>
      <td style="width:110px;"><input type="text" value="${Number(it.qtyTerima||0).toLocaleString('id-ID')}" readonly style="text-align:right;"></td>
    </tr>`).join('');
}

/* ===== Tab 2 — Rincian Jurnal Akun ===== */
function tplRpbJurnalContent(row, isView){
  const totals = rpbJurnalTotals(row);
  const selisihColor = Math.abs(totals.selisih) > 0.004 ? 'var(--red)' : 'var(--text)';
  return `
    ${!isView ? `<div style="display:flex;justify-content:center;margin:14px 0;">
      <button type="button" class="btn-secondary" id="rpbBuatJurnal">${icon('refreshCw',13)} Buat Jurnal</button>
    </div>` : '<div style="margin-top:14px;"></div>'}
    <div class="card-header dark-header" style="border-radius:6px;">
      <h3>${icon('settings',14)} Rincian Jurnal Akun</h3>
      ${!isView ? `<button type="button" class="btn-primary" id="rpbJurnalAddRow">${icon('plus',13)} Tambah</button>` : ''}
    </div>
    <div class="table-wrap" style="margin:6px 0 0;">
      <table class="po-item-table">
        <thead><tr>
          <th>Kode Akun</th><th>Nama Akun</th><th>Keterangan</th><th class="text-right">Jumlah Debit</th><th class="text-right">Jumlah Kredit</th><th>Hapus</th>
        </tr></thead>
        <tbody id="rpbJurnalBody">${tplRpbJurnalRows(row.jurnalAkun, isView)}</tbody>
      </table>
    </div>
    <div style="max-width:280px;margin:16px 0 0 auto;">
      <div style="font-size:12.5px;font-weight:600;color:var(--text);margin-bottom:4px;">Jumlah Debit - Kredit</div>
      <input type="text" id="rpbJurnalSelisih" value="${rpbNum2(totals.selisih)}" readonly style="text-align:right;font-weight:700;color:${selisihColor};">
    </div>`;
}

function tplRpbJurnalRows(list, isView){
  if(!list || !list.length) return `<tr><td colspan="6" style="color:var(--text-light);">Belum ada rincian jurnal — klik "Buat Jurnal".</td></tr>`;
  return list.map((entry,idx)=>{
    if(isView){
      return `
      <tr>
        <td style="min-width:110px;"><input type="text" value="${entry.kodeAkun||''}" readonly></td>
        <td style="min-width:180px;"><input type="text" value="${entry.namaAkun||''}" readonly></td>
        <td style="min-width:160px;"><input type="text" value="${entry.keterangan||''}" readonly></td>
        <td style="width:150px;"><input type="text" value="${rpbNum2(entry.debit||0)}" readonly style="text-align:right;"></td>
        <td style="width:150px;"><input type="text" value="${rpbNum2(entry.kredit||0)}" readonly style="text-align:right;"></td>
        <td style="width:50px;"></td>
      </tr>`;
    }
    return `
    <tr data-rpb-jurnal-row="${idx}">
      <td style="min-width:110px;">
        <div class="input-with-btn">
          <input type="text" data-rpb-jurnal-kode="${idx}" value="${entry.kodeAkun||''}" readonly>
          <button type="button" class="icon-btn edit" data-rpb-jurnal-akun-search="${idx}" title="Cari Akun GL">${icon('search',12)}</button>
        </div>
      </td>
      <td style="min-width:180px;"><input type="text" data-rpb-jurnal-nama="${idx}" value="${entry.namaAkun||''}" readonly></td>
      <td style="min-width:160px;"><input type="text" data-rpb-jurnal-ket="${idx}" value="${entry.keterangan||''}"></td>
      <td style="width:150px;"><input type="number" step="0.01" min="0" data-rpb-jurnal-debit="${idx}" value="${entry.debit||0}" style="text-align:right;"></td>
      <td style="width:150px;"><input type="number" step="0.01" min="0" data-rpb-jurnal-kredit="${idx}" value="${entry.kredit||0}" style="text-align:right;"></td>
      <td style="width:50px;"><button type="button" class="icon-btn del" data-rpb-jurnal-del="${idx}" title="Hapus Baris">${icon('trash',14)}</button></td>
    </tr>`;
  }).join('');
}

/* Cetakan/preview Retur Penerimaan Barang — kop DBM. */
function tplRpbPrintModal(row){
  const ho = DATA.cabangMaster[0] || {};
  const td = 'padding:4px 6px;font-size:11.5px;';
  const rows = (row.items||[]).filter(it => Number(it.qtyRetur||0) > 0);
  const list = rows.length ? rows : (row.items||[]);
  const itemRows = list.map((it,i)=>`
    <tr>
      <td style="${td}text-align:center;">${i+1}</td>
      <td style="${td}">${it.kode||''}</td>
      <td style="${td}">${it.nama||''}</td>
      <td style="${td}">${it.batch||'-'}</td>
      <td style="${td}text-align:center;">${it.satuan||''}</td>
      <td style="${td}text-align:right;">${Number(it.qtyRetur||0).toLocaleString('id-ID')}</td>
      <td style="${td}text-align:right;">${Number(it.qtyTerima||0).toLocaleString('id-ID')}</td>
    </tr>`).join('');
  return `
    <div class="modal-box" style="max-width:900px;width:96vw;">
      <div class="modal-header"><span>${icon('printer',15)} Cetak Retur Penerimaan Barang — ${row.no}</span><span class="close" id="modalClose">&times;</span></div>
      <div class="modal-body" style="max-height:72vh;overflow:auto;">
        <div style="background:#fff;border:1px solid var(--border);padding:22px 26px;font-family:Arial,Helvetica,sans-serif;color:#111;">
          <div style="display:flex;gap:14px;align-items:flex-start;">
            <div style="width:64px;height:64px;border-radius:10px;background:var(--navy);color:#fff;display:flex;align-items:center;justify-content:center;font-weight:800;font-size:20px;">DBM</div>
            <div>
              <div style="font-weight:800;font-size:14px;">${(ho.namaPerusahaan||'PT Distriversa Buanamas').toUpperCase()}</div>
              <div style="font-size:11.5px;">${ho.alamat||''}, ${ho.kota||''} — Tlp: ${ho.telepon||''}</div>
            </div>
          </div>
          <div style="text-align:center;font-weight:800;font-size:15px;margin:12px 0;text-decoration:underline;">RETUR PENERIMAAN BARANG</div>
          <table style="border:none;font-size:11.5px;"><tbody>
            <tr><td style="${td}">No. RPB</td><td style="${td}">: ${row.no}</td><td style="${td}padding-left:40px;">Supplier</td><td style="${td}">: ${row.supplier||''}</td></tr>
            <tr><td style="${td}">No. BPB</td><td style="${td}">: ${row.noBPB||'-'}</td><td style="${td}padding-left:40px;">No. PO</td><td style="${td}">: ${row.noPO||'-'}</td></tr>
            <tr><td style="${td}">Tgl. Pengembalian</td><td style="${td}">: ${row.tglRetur||''}</td><td style="${td}padding-left:40px;">No. S.J. Supplier</td><td style="${td}">: ${row.noSJSupplier||'-'}</td></tr>
            <tr><td style="${td}">Keterangan</td><td style="${td}" colspan="3">: ${row.keterangan||''}</td></tr>
          </tbody></table>
          <table style="width:100%;border-collapse:collapse;margin-top:10px;">
            <thead><tr style="border-top:2px solid #111;border-bottom:2px solid #111;">
              <th style="${td}width:34px;">No.</th><th style="${td}text-align:left;">Kode</th><th style="${td}text-align:left;">Nama Barang</th><th style="${td}text-align:left;">Batch</th><th style="${td}">Satuan</th><th style="${td}text-align:right;">Qty Retur</th><th style="${td}text-align:right;">Qty Terima</th>
            </tr></thead>
            <tbody>${itemRows}</tbody>
          </table>
          <div style="border-top:2px solid #111;"></div>
          <div style="display:flex;justify-content:space-between;margin-top:34px;text-align:center;font-size:11.5px;">
            <div style="width:180px;">Dibuat Oleh,<div style="margin-top:56px;border-top:1px solid #111;">( ${row.userInput||'sidik'} )</div></div>
            <div style="width:180px;">Bagian Gudang,<div style="margin-top:56px;border-top:1px solid #111;">( ..................... )</div></div>
            <div style="width:180px;">Supplier / Ekspedisi,<div style="margin-top:56px;border-top:1px solid #111;">( ..................... )</div></div>
          </div>
        </div>
      </div>
      <div class="modal-footer"><button class="btn-secondary" id="modalCancel">Tutup</button></div>
    </div>`;
}

/* Picker BPB / PO / Akun GL — salinan lokal pola modul lain. */
function tplRpbBpbPicker(list){
  return `
    <div class="modal-box" style="max-width:780px;">
      <div class="modal-header"><span>Pilih No. BPB</span><span class="close" id="modalClose">&times;</span></div>
      <div class="modal-body">
        <input type="text" id="rpbBpbPickerSearch" placeholder="Cari no. BPB / no. PO / supplier..." style="width:100%;border:1px solid var(--border);border-radius:6px;padding:8px 10px;font-size:12.8px;margin-bottom:12px;">
        <div class="table-wrap" style="max-height:340px;overflow:auto;">
          <table>
            <thead><tr><th>No. BPB</th><th>No. PO</th><th>Tgl.</th><th>Supplier</th><th></th></tr></thead>
            <tbody id="rpbBpbPickerBody">${tplRpbBpbPickerRows(list)}</tbody>
          </table>
        </div>
      </div>
      <div class="modal-footer"><button class="btn-secondary" id="modalCancel">Tutup</button></div>
    </div>`;
}

function tplRpbBpbPickerRows(list){
  if(!list.length) return `<tr><td colspan="5" style="color:var(--text-light);">Tidak ada BPB ditemukan</td></tr>`;
  return list.map(b=>`
    <tr><td>${b.noBPB}</td><td>${b.noPO||''}</td><td>${b.tglFaktur||''}</td><td>${b.supplier||''}</td><td><button class="btn-pick" data-rpb-pick-bpb="${b.noBPB}">Pilih</button></td></tr>`).join('');
}

function tplRpbPoPicker(list){
  return `
    <div class="modal-box" style="max-width:760px;">
      <div class="modal-header"><span>Pilih Purchase Order</span><span class="close" id="modalClose">&times;</span></div>
      <div class="modal-body">
        <input type="text" id="rpbPoPickerSearch" placeholder="Cari no. PO / supplier..." style="width:100%;border:1px solid var(--border);border-radius:6px;padding:8px 10px;font-size:12.8px;margin-bottom:12px;">
        <div class="table-wrap" style="max-height:340px;overflow:auto;">
          <table>
            <thead><tr><th>No. PO</th><th>Tgl. PO</th><th>Supplier</th><th>Cabang</th><th></th></tr></thead>
            <tbody id="rpbPoPickerBody">${tplRpbPoPickerRows(list)}</tbody>
          </table>
        </div>
      </div>
      <div class="modal-footer"><button class="btn-secondary" id="modalCancel">Tutup</button></div>
    </div>`;
}

function tplRpbPoPickerRows(list){
  if(!list.length) return `<tr><td colspan="5" style="color:var(--text-light);">Tidak ada PO ditemukan</td></tr>`;
  return list.map(p=>`
    <tr><td>${p.no}</td><td>${p.tglPO||''}</td><td>${p.supplier||''}</td><td>${p.cabang||''}</td><td><button class="btn-pick" data-rpb-pick-po="${p.no}">Pilih</button></td></tr>`).join('');
}

function tplRpbAkunPicker(list){
  return `
    <div class="modal-box" style="max-width:640px;">
      <div class="modal-header"><span>Pilih Akun GL</span><span class="close" id="modalClose">&times;</span></div>
      <div class="modal-body">
        <input type="text" id="rpbAkunPickerSearch" placeholder="Cari kode / nama akun..." style="width:100%;border:1px solid var(--border);border-radius:6px;padding:8px 10px;font-size:12.8px;margin-bottom:12px;">
        <div class="table-wrap" style="max-height:360px;overflow:auto;">
          <table>
            <thead><tr><th>Kode</th><th>Nama Akun</th><th>Kat.</th><th></th></tr></thead>
            <tbody id="rpbAkunPickerBody">${tplRpbAkunPickerRows(list)}</tbody>
          </table>
        </div>
      </div>
      <div class="modal-footer"><button class="btn-secondary" id="modalCancel">Tutup</button></div>
    </div>`;
}

function tplRpbAkunPickerRows(list){
  if(!list.length) return `<tr><td colspan="4" style="color:var(--text-light);">Tidak ada akun ditemukan</td></tr>`;
  return list.map(a=>`
    <tr><td>${a.kode}</td><td>${a.nama}</td><td>${a.kategori}</td><td><button class="btn-pick" data-rpb-pick-akun="${a.kode}">Pilih</button></td></tr>`).join('');
}

/* Modal lampiran (kolom Attach) — mockup. */
function tplRpbAttachModal(row){
  return `
    <div class="modal-box" style="max-width:480px;">
      <div class="modal-header"><span>${icon('file',15)} Lampiran — ${row.no}</span><span class="close" id="modalClose">&times;</span></div>
      <div class="modal-body">
        <p style="margin-bottom:10px;">Lampiran dokumen retur (foto barang, surat jalan, berita acara).</p>
        <div style="border:2px dashed var(--border);border-radius:8px;padding:26px;text-align:center;color:var(--text-light);font-size:12.5px;">
          ${icon('file',26)}<br>Belum ada file dilampirkan.<br><span style="font-size:11.5px;">(Mockup — klik untuk memilih file pada aplikasi asli.)</span>
        </div>
      </div>
      <div class="modal-footer"><button class="btn-secondary" id="modalCancel">Tutup</button></div>
    </div>`;
}

function tplRpbDeleteConfirm(row){
  return `
    <div class="modal-box">
      <div class="modal-header"><span>Hapus Retur Penerimaan Barang</span><span class="close" id="modalClose">&times;</span></div>
      <div class="modal-body"><p>Yakin ingin menghapus Retur <b>${row.no}</b> — ${row.supplier||''} (BPB ${row.noBPB||'-'})?</p></div>
      <div class="modal-footer">
        <button class="btn-secondary" id="modalCancel">Batal</button>
        <button class="btn-danger" id="modalDelete">Hapus</button>
      </div>
    </div>`;
}

function tplRpbInfoModal(title,text){
  return `
    <div class="modal-box">
      <div class="modal-header"><span>${title}</span><span class="close" id="modalClose">&times;</span></div>
      <div class="modal-body"><p>${text}</p></div>
      <div class="modal-footer"><button class="btn-primary" id="modalOk">Mengerti</button></div>
    </div>`;
}
