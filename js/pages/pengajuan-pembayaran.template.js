/* =========================================================
   TEMPLATE (HTML saja) — Pengajuan Pembayaran (Supplier &
   Pembelian > Daftar Transaksi > Pengajuan Pembayaran, key
   page:'pengajuanPembayaran'). Semua fungsi di file ini HANYA
   menyusun & mengembalikan markup HTML (string) atau helper
   murni, TIDAK ada DOM-binding/data mutation di sini. Logic-nya
   ada di file sebelah: pengajuan-pembayaran.js

   Sesuai 2 screenshot MASERP yang dikirim user:
   1) List "Daftar Pengajuan Pembayaran": chip periode "Semua"
      (FUNGSIONAL) + Tambah; kolom No. Transaksi (link -> Lihat) /
      Supplier / Tgl. Trn. / Jumlah + aksi Lihat / Cetak / Ubah /
      Hapus. Screenshot kosong — 2 baris sample DBM.
   2) Form "+ Pengajuan Pembayaran" + Tutorial: Supplier (picker)
      + Tgl. Trn.; No. Otomatis "PY{kode cabang}" (dropdown
      FUNGSIONAL memilih cabang counter) + No. Transaksi
      "PYR/{kode}/2608{urut}" + refresh + Keterangan. Section
      gelap "Rincian Pengajuan Pembayaran": tabel [checkbox] /
      No. Faktur / Tgl. Faktur / Tgl. Jth. Tempo / Kurs /
      Reminder / Pembayaran — begitu Supplier dipilih, SEMUA
      faktur outstanding supplier tsb (gabungan Pembelian Melalui
      BPB + Pembelian Langsung + Pembelian dari PO yang sisa
      tagihannya > 0) tampil di sini; centang faktur yang
      diajukan, kolom Pembayaran editable (default = sisa faktur,
      di-clamp <= sisa) + Reminder tanggal bebas. "Jumlah" bawah =
      total Pembayaran baris yang dicentang (LIVE). Footer: Cetak
      (preview pengajuan kop DBM) / Simpan / Batalkan.
   Data: DATA.pengajuanPembayaran. */

const PJP_CABANG_CODE = {'Head Office':'HO','Surabaya':'SBY','Bandung':'BDG','Medan':'MDN','Makassar':'MKS','Semarang':'SMG','Tangerang':'TGR','Sidoarjo':'SDA'};
const PJP_BULAN_LIST = [
  {label:'Semua', mm:'', yy:''},
  {label:'Agustus 2026', mm:'08', yy:'2026'},
  {label:'Juli 2026', mm:'07', yy:'2026'},
];

function pjpNum2(n){ return Number(n||0).toLocaleString('id-ID', {minimumFractionDigits:2, maximumFractionDigits:2}); }

/* =====================================================================
   LIST PAGE — "Daftar Pengajuan Pembayaran"
===================================================================== */
function tplPengajuanPembayaranListPage(bulan){
  return `
    <div class="breadcrumb">Home / Supplier &amp; Pembelian / <b>Pengajuan Pembayaran</b></div>
    <div class="card">
      <div class="card-header dark-header">
        <h3>${icon('alertTriangle',15)} Daftar Pengajuan Pembayaran</h3>
        <div class="toolbar-actions">
          <select class="chip-btn" id="pjpFilterBulan">${PJP_BULAN_LIST.map(b=>`<option value="${b.mm}|${b.yy}" ${bulan===b.mm+'|'+b.yy?'selected':''}>${b.label}</option>`).join('')}</select>
          <button class="btn-primary" id="btnPjpAdd">${icon('plus',14)} Tambah</button>
        </div>
      </div>
      <div class="table-toolbar">
        <select id="pjpPageSize"><option selected>10</option><option>25</option><option>50</option></select>
        <input type="text" id="pjpSearch" placeholder="Pencarian Global">
      </div>
      <div class="table-wrap"><table>
        <thead><tr>
          <th style="width:180px;">No. Transaksi</th>
          <th>Supplier</th>
          <th style="width:120px;">Tgl. Trn.</th>
          <th class="text-right" style="width:150px;">Jumlah</th>
          <th style="width:60px;">Lihat</th>
          <th style="width:60px;">Cetak</th>
          <th style="width:60px;">Ubah</th>
          <th style="width:64px;">Hapus</th>
        </tr></thead>
        <tbody id="pjpTbody"></tbody>
      </table></div>
      <div class="table-footer"><div class="pager"><button>First</button><button>Previous</button><button class="active">1</button><button>Next</button><button>Last</button></div><div id="pjpTotal"></div></div>
    </div>`;
}

function tplPjpRows(rows){
  if(!rows.length) return `<tr><td colspan="8" style="text-align:center;font-weight:700;padding:14px;">Tidak Ada Data</td></tr>`;
  return rows.map((r,i)=>`
    <tr>
      <td><button class="link-pick" data-view-link="${i}">${r.no}</button></td>
      <td>${(r.supplier||'').toUpperCase()}</td>
      <td>${r.tgl||''}</td>
      <td class="text-right">${pjpNum2(r.jumlah)}</td>
      <td><button class="icon-btn view" data-pjp-view="${i}" title="Lihat">${icon('eye',15)}</button></td>
      <td><button class="icon-btn view" data-pjp-print="${i}" title="Cetak">${icon('printer',15)}</button></td>
      <td><button class="icon-btn edit" data-pjp-edit="${i}" title="Ubah">${icon('edit',15)}</button></td>
      <td><button class="icon-btn del" data-pjp-del="${i}" title="Hapus">${icon('trash',15)}</button></td>
    </tr>`).join('');
}

/* =====================================================================
   FORM (full page) — "+ Pengajuan Pembayaran"
===================================================================== */
function tplPjpForm(mode, row){
  const isAdd = mode === 'add';
  const isView = mode === 'view';
  const dis = isView ? 'disabled' : '';
  return `
    <div class="breadcrumb">Home / Pengajuan Pembayaran / <b>${isAdd ? 'Tambah' : (isView ? 'Lihat' : 'Ubah')}</b></div>
    <div class="card">
      <div class="card-header dark-header">
        <h3>${icon('plus',15)} Pengajuan Pembayaran</h3>
        <button class="btn-danger" id="btnPjpTutorial">${icon('card',14)} Tutorial</button>
      </div>
      <div class="card-body">
        <h2 style="font-size:20px;font-weight:700;color:var(--navy);margin:0 0 16px;padding-bottom:10px;border-bottom:1px solid var(--border);max-width:420px;">Pengajuan Pembayaran</h2>

        <div class="form-grid-3" style="grid-template-columns:1.3fr 1fr 1.2fr;">
          <div class="form-group">
            <label>Supplier</label>
            <div class="input-with-btn">
              <input type="text" id="fPjpSupplier" value="${(row.supplier||'').toUpperCase()}" placeholder="Pilih Supplier" readonly>
              ${!isView ? `<button type="button" class="icon-btn edit" id="pjpSupplierSearch" title="Cari Supplier">${icon('search',13)}</button>` : ''}
            </div>
          </div>
          <div class="form-group">
            <label>Tgl. Trn.</label>
            <div class="input-with-btn">
              <input type="text" id="fPjpTgl" value="${row.tgl||''}" ${dis}>
              <span class="icon-btn edit" style="pointer-events:none;">${icon('calendar',13)}</span>
            </div>
          </div>
          <div class="form-group"></div>
        </div>

        <div class="form-grid-3" style="grid-template-columns:150px 1.3fr 1.2fr;">
          <div class="form-group">
            <label>No. Otomatis</label>
            <select id="fPjpNoOtomatis" ${(!isAdd)?'disabled':dis}>${Object.entries(PJP_CABANG_CODE).map(([cab,kode])=>`<option value="${kode}" ${row.kodeCabang===kode?'selected':''}>PY${kode}</option>`).join('')}</select>
          </div>
          <div class="form-group">
            <label>No. Transaksi</label>
            <div class="input-with-btn">
              <input type="text" id="fPjpNo" value="${row.no||''}" readonly>
              ${isAdd ? `<button type="button" class="icon-btn edit" id="pjpRefreshNo" title="Generate Ulang Nomor">${icon('refreshCw',13)}</button>` : ''}
            </div>
          </div>
          <div class="form-group">
            <label>Keterangan</label>
            <textarea id="fPjpKeterangan" class="po-textarea" rows="3" ${dis}>${row.keterangan||''}</textarea>
          </div>
        </div>

        <div class="card-header dark-header" style="border-radius:6px;margin-top:14px;">
          <h3>${icon('alertTriangle',14)} Rincian Pengajuan Pembayaran</h3>
        </div>
        <div class="table-wrap" style="margin-top:0;">
          <table class="po-item-table">
            <thead><tr>
              <th style="width:40px;"></th>
              <th style="width:180px;">No. Faktur</th>
              <th style="width:110px;">Tgl. Faktur</th>
              <th style="width:120px;">Tgl. Jth. Tempo</th>
              <th class="text-right" style="width:90px;">Kurs</th>
              <th style="width:150px;">Reminder</th>
              <th class="text-right" style="width:160px;">Pembayaran</th>
            </tr></thead>
            <tbody id="pjpFakturBody">${tplPjpFakturRows(row.fakturs, isView)}</tbody>
          </table>
        </div>
        <div id="pjpFakturEmptyHint" style="font-size:11.5px;color:var(--text-light);margin-top:6px;${(row.fakturs&&row.fakturs.length)?'display:none;':''}">Pilih Supplier terlebih dahulu — faktur pembelian yang masih outstanding milik supplier tersebut akan tampil di sini.</div>

        <div style="max-width:420px;margin:20px 0 0 auto;">
          <div style="font-size:12.5px;font-weight:600;color:var(--text);margin-bottom:4px;">Jumlah</div>
          <input type="text" id="fPjpJumlah" value="${pjpNum2(row.jumlah||0)}" readonly style="text-align:right;font-weight:700;font-size:14px;">
        </div>
      </div>
      <div class="card-footer" style="display:flex;gap:10px;justify-content:flex-end;align-items:center;padding:14px 20px;border-top:1px solid var(--border);">
        ${!isView ? `
          <button type="button" class="btn-teal" id="pjpCetak">${icon('printer',13)} Cetak</button>
          <button type="button" class="btn-primary" id="pjpSimpan">Simpan</button>` : ''}
        <a href="#" id="pjpBatalkan" class="link-add" style="margin-top:0;">${isView?'Tutup':'Batalkan'}</a>
      </div>
    </div>`;
}

/* Baris faktur outstanding: checkbox pilih + Reminder + Pembayaran editable. */
function tplPjpFakturRows(fakturs, isView){
  if(!fakturs || !fakturs.length) return '';
  return fakturs.map((f,idx)=>`
    <tr>
      <td style="text-align:center;"><input type="checkbox" data-pjp-check="${idx}" ${f.dipilih?'checked':''} ${isView?'disabled':''} style="width:auto;"></td>
      <td><input type="text" value="${f.noFaktur}" readonly></td>
      <td><input type="text" value="${f.tglFaktur||''}" readonly></td>
      <td><input type="text" value="${f.tglJthTempo||''}" readonly></td>
      <td><input type="text" value="${pjpNum2(f.kurs||1)}" readonly style="text-align:right;"></td>
      <td>
        <div class="input-with-btn">
          <input type="text" data-pjp-reminder="${idx}" value="${f.reminder||''}" placeholder="dd/mm/yyyy" ${isView?'disabled':''}>
          <span class="icon-btn edit" style="pointer-events:none;">${icon('calendar',12)}</span>
        </div>
      </td>
      <td><input type="number" min="0" max="${f.sisa||0}" data-pjp-bayar="${idx}" value="${f.pembayaran||0}" ${isView?'disabled':''} style="text-align:right;" title="Sisa faktur: ${pjpNum2(f.sisa)}"></td>
    </tr>`).join('');
}

/* Cetakan/preview Pengajuan Pembayaran — kop DBM. */
function tplPjpPrintModal(row){
  const ho = DATA.cabangMaster[0] || {};
  const td = 'padding:4px 6px;font-size:11.5px;';
  const rows = (row.fakturs||[]).filter(f => f.dipilih);
  const itemRows = rows.map((f,i)=>`
    <tr>
      <td style="${td}text-align:center;">${i+1}</td>
      <td style="${td}">${f.noFaktur}</td>
      <td style="${td}text-align:center;">${f.tglFaktur||''}</td>
      <td style="${td}text-align:center;">${f.tglJthTempo||''}</td>
      <td style="${td}text-align:center;">${f.reminder||'-'}</td>
      <td style="${td}text-align:right;">${pjpNum2(f.pembayaran)}</td>
    </tr>`).join('');
  return `
    <div class="modal-box" style="max-width:860px;width:96vw;">
      <div class="modal-header"><span>${icon('printer',15)} Cetak Pengajuan Pembayaran — ${row.no}</span><span class="close" id="modalClose">&times;</span></div>
      <div class="modal-body" style="max-height:72vh;overflow:auto;">
        <div style="background:#fff;border:1px solid var(--border);padding:22px 26px;font-family:Arial,Helvetica,sans-serif;color:#111;">
          <div style="display:flex;gap:14px;align-items:flex-start;">
            <div style="width:64px;height:64px;border-radius:10px;background:var(--navy);color:#fff;display:flex;align-items:center;justify-content:center;font-weight:800;font-size:20px;">DBM</div>
            <div>
              <div style="font-weight:800;font-size:14px;">${(ho.namaPerusahaan||'PT Distriversa Buanamas').toUpperCase()}</div>
              <div style="font-size:11.5px;">${ho.alamat||''}, ${ho.kota||''} — Tlp: ${ho.telepon||''}</div>
            </div>
          </div>
          <div style="text-align:center;font-weight:800;font-size:15px;margin:12px 0;text-decoration:underline;">PENGAJUAN PEMBAYARAN</div>
          <table style="border:none;font-size:11.5px;"><tbody>
            <tr><td style="${td}">No. Transaksi</td><td style="${td}">: ${row.no}</td><td style="${td}padding-left:40px;">Supplier</td><td style="${td}">: ${(row.supplier||'').toUpperCase()}</td></tr>
            <tr><td style="${td}">Tgl. Trn.</td><td style="${td}">: ${row.tgl||''}</td><td style="${td}padding-left:40px;">Keterangan</td><td style="${td}">: ${row.keterangan||'-'}</td></tr>
          </tbody></table>
          <table style="width:100%;border-collapse:collapse;margin-top:10px;">
            <thead><tr style="border-top:2px solid #111;border-bottom:2px solid #111;">
              <th style="${td}width:34px;">No.</th><th style="${td}text-align:left;">No. Faktur</th><th style="${td}">Tgl. Faktur</th><th style="${td}">Tgl. Jth. Tempo</th><th style="${td}">Reminder</th><th style="${td}text-align:right;">Pembayaran</th>
            </tr></thead>
            <tbody>${itemRows || `<tr><td colspan="6" style="${td}color:#888;">Belum ada faktur dicentang.</td></tr>`}</tbody>
          </table>
          <div style="border-top:2px solid #111;"></div>
          <div style="display:flex;justify-content:flex-end;margin-top:8px;">
            <table style="border:none;min-width:280px;font-size:11.5px;"><tbody>
              <tr><td style="${td}font-weight:800;">Jumlah :</td><td style="${td}text-align:right;font-weight:800;">${pjpNum2(row.jumlah)}</td></tr>
            </tbody></table>
          </div>
          <div style="display:flex;justify-content:space-between;margin-top:34px;text-align:center;font-size:11.5px;">
            <div style="width:180px;">Diajukan Oleh,<div style="margin-top:56px;border-top:1px solid #111;">( ${row.userInput||'sidik'} )</div></div>
            <div style="width:180px;">Disetujui Oleh,<div style="margin-top:56px;border-top:1px solid #111;">( ..................... )</div></div>
            <div style="width:180px;">Finance,<div style="margin-top:56px;border-top:1px solid #111;">( ..................... )</div></div>
          </div>
        </div>
      </div>
      <div class="modal-footer"><button class="btn-secondary" id="modalCancel">Tutup</button></div>
    </div>`;
}

/* Picker Supplier — salinan lokal pola modul lain. */
function tplPjpSupplierPicker(list){
  return `
    <div class="modal-box" style="max-width:640px;">
      <div class="modal-header"><span>Pilih Supplier</span><span class="close" id="modalClose">&times;</span></div>
      <div class="modal-body">
        <input type="text" id="pjpSupplierPickerSearch" placeholder="Cari kode / nama supplier..." style="width:100%;border:1px solid var(--border);border-radius:6px;padding:8px 10px;font-size:12.8px;margin-bottom:12px;">
        <div class="table-wrap" style="max-height:360px;overflow:auto;">
          <table>
            <thead><tr><th>Kode</th><th>Nama Supplier</th><th></th></tr></thead>
            <tbody id="pjpSupplierPickerBody">${tplPjpSupplierPickerRows(list)}</tbody>
          </table>
        </div>
      </div>
      <div class="modal-footer"><button class="btn-secondary" id="modalCancel">Tutup</button></div>
    </div>`;
}

function tplPjpSupplierPickerRows(list){
  if(!list.length) return `<tr><td colspan="3" style="color:var(--text-light);">Tidak ada supplier ditemukan</td></tr>`;
  return list.map(s=>`
    <tr><td>${s.kode}</td><td>${s.nama}</td><td><button class="btn-pick" data-pjp-pick-supplier="${s.nama}">Pilih</button></td></tr>`).join('');
}

function tplPjpDeleteConfirm(row){
  return `
    <div class="modal-box">
      <div class="modal-header"><span>Hapus Pengajuan Pembayaran</span><span class="close" id="modalClose">&times;</span></div>
      <div class="modal-body"><p>Yakin ingin menghapus Pengajuan <b>${row.no}</b> — ${(row.supplier||'').toUpperCase()} (${pjpNum2(row.jumlah)})?</p></div>
      <div class="modal-footer">
        <button class="btn-secondary" id="modalCancel">Batal</button>
        <button class="btn-danger" id="modalDelete">Hapus</button>
      </div>
    </div>`;
}

function tplPjpInfoModal(title,text){
  return `
    <div class="modal-box">
      <div class="modal-header"><span>${title}</span><span class="close" id="modalClose">&times;</span></div>
      <div class="modal-body"><p>${text}</p></div>
      <div class="modal-footer"><button class="btn-primary" id="modalOk">Mengerti</button></div>
    </div>`;
}
