/* =========================================================
   TEMPLATE (HTML saja) — Permintaan Pembelian / PR (Supplier &
   Pembelian > Daftar Transaksi > Permintaan Pembelian, key
   page:'permintaanPembelian'). Semua fungsi di file ini HANYA
   menyusun & mengembalikan markup HTML (string) atau helper
   murni, TIDAK ada DOM-binding/data mutation di sini. Logic-nya
   ada di file sebelah: permintaan-pembelian.js

   Sesuai 2 screenshot MASERP yang dikirim user:
   1) List "Daftar Permintaan Pembelian": chip periode (FUNGSIONAL
      — filter bulan Tgl. Permintaan; default Agustus 2026 persis
      screenshot Total Record: 2) + Tambah; kolom No. Permintaan
      (link biru -> Lihat) / Approved By / Tgl. Permintaan /
      Keterangan / Status ("Pending (PR belum dipakai di P.O.)" /
      "Sudah dipakai di P.O.") + aksi Lihat / Cetak (preview
      cetakan PR) / Ubah / Hapus.
   2) Form "Transaksi Permintaan Pembelian": No. Otomatis "PR001"
      (dekoratif) + No. Permintaan "26/PR-HO/08/00001" readonly +
      refresh + Tgl. Permintaan + Cabang; Keterangan textarea;
      Gudang (dropdown "Non Stock {cabang}" + gudang cabang itu).
      Section gelap "Rincian Permintaan Pembelian": Kode Barang
      (picker DATA.items) / Nama Barang (textarea, EDITABLE —
      spesifikasi bebas persis screenshot Forklift) / Qty / U/M
      (dropdown) / Harga Beli / Tgl Perlu / Hapus + link
      "+Tambah Item Baru". Footer: Duplicate (kuning — menyimpan
      SALINAN PR dengan nomor baru) / Cetak dan Simpan / Simpan /
      Batalkan.
   No. format "26/PR-{kode cabang}/{MM}/{urut 5 digit}".
   Data: DATA.permintaanPembelian (dipakai juga menu Tutup PR —
   flag r.tutupPr). Status dari flag r.dipakaiPO. */

const PRQ_CABANG_LIST = ['Head Office','Surabaya','Bandung','Medan','Makassar','Semarang','Tangerang','Sidoarjo'];
const PRQ_CABANG_CODE = {'Head Office':'HO','Surabaya':'SBY','Bandung':'BDG','Medan':'MDN','Makassar':'MKS','Semarang':'SMG','Tangerang':'TGR','Sidoarjo':'SDA'};
const PRQ_UM_LIST = ['UNIT','Pcs','Dus','Karung','Box','Lusin','Pack'];
const PRQ_BULAN_LIST = [
  {label:'Agustus 2026', mm:'08', yy:'2026'},
  {label:'Juli 2026', mm:'07', yy:'2026'},
  {label:'Semua Periode', mm:'', yy:''},
];

function prqNum(n){ return Number(n||0).toLocaleString('id-ID'); }

function prqStatusText(r){
  return r.dipakaiPO ? 'Sudah dipakai di P.O.' : 'Pending (PR belum dipakai di P.O.)';
}

/* =====================================================================
   LIST PAGE — "Daftar Permintaan Pembelian"
===================================================================== */
function tplPermintaanPembelianListPage(bulan){
  return `
    <div class="breadcrumb">Home / Supplier &amp; Pembelian / <b>Permintaan Pembelian</b></div>
    <div class="card">
      <div class="card-header dark-header">
        <h3>${icon('alertTriangle',15)} Daftar Permintaan Pembelian</h3>
        <div class="toolbar-actions">
          <select class="chip-btn" id="prqFilterBulan">${PRQ_BULAN_LIST.map(b=>`<option value="${b.mm}|${b.yy}" ${bulan===b.mm+'|'+b.yy?'selected':''}>${b.label}</option>`).join('')}</select>
          <button class="btn-primary" id="btnPrqAdd">${icon('plus',14)} Tambah</button>
        </div>
      </div>
      <div class="table-toolbar">
        <select id="prqPageSize"><option selected>10</option><option>25</option><option>50</option></select>
        <input type="text" id="prqSearch" placeholder="Pencarian Global">
      </div>
      <div class="table-wrap"><table>
        <thead><tr>
          <th style="width:130px;">No. Permintaan</th>
          <th style="width:100px;">Approved By</th>
          <th style="width:110px;">Tgl. Permintaan</th>
          <th>Keterangan</th>
          <th style="width:160px;">Status</th>
          <th style="width:60px;">Lihat</th>
          <th style="width:60px;">Cetak</th>
          <th style="width:60px;">Ubah</th>
          <th style="width:64px;">Hapus</th>
        </tr></thead>
        <tbody id="prqTbody"></tbody>
      </table></div>
      <div class="table-footer"><div class="pager"><button>First</button><button>Previous</button><button class="active">1</button><button>Next</button><button>Last</button></div><div id="prqTotal"></div></div>
    </div>`;
}

function tplPrqRows(rows){
  if(!rows.length) return `<tr><td colspan="9" style="color:var(--text-light);padding:14px;">Tidak ada Permintaan Pembelian pada periode / pencarian ini.</td></tr>`;
  return rows.map((r,i)=>`
    <tr>
      <td><button class="link-pick" data-view-link="${i}">${r.no}</button></td>
      <td>${r.approvedBy||''}</td>
      <td>${r.tgl||''}</td>
      <td style="max-width:420px;white-space:pre-line;word-break:break-word;">${r.keterangan||''}</td>
      <td>${prqStatusText(r)}</td>
      <td><button class="icon-btn view" data-prq-view="${i}" title="Lihat">${icon('eye',15)}</button></td>
      <td><button class="icon-btn view" data-prq-print="${i}" title="Cetak">${icon('printer',15)}</button></td>
      <td><button class="icon-btn edit" data-prq-edit="${i}" title="Ubah">${icon('edit',15)}</button></td>
      <td><button class="icon-btn del" data-prq-del="${i}" title="Hapus">${icon('trash',15)}</button></td>
    </tr>`).join('');
}

/* =====================================================================
   FORM — "Transaksi Permintaan Pembelian"
===================================================================== */
function tplPrqGudangOptions(cabang, selected){
  const opts = ['Non Stock ' + cabang].concat(DATA.gudang.filter(g=>g.cabang===cabang).map(g=>g.nama));
  if(selected && !opts.includes(selected)) opts.unshift(selected);
  return opts.map(o=>`<option ${o===selected?'selected':''}>${o}</option>`).join('');
}

function tplPrqForm(mode, row){
  const isAdd = mode === 'add';
  const isView = mode === 'view';
  const dis = isView ? 'disabled' : '';
  return `
    <div class="breadcrumb">Home / Permintaan Pembelian / <b>${isAdd ? 'Tambah' : (isView ? 'Lihat' : 'Ubah')}</b></div>
    <div class="card">
      <div class="card-header dark-header">
        <h3>${icon('edit',15)} Transaksi Permintaan Pembelian</h3>
        <button class="btn-danger" id="btnPrqTutorial">${icon('card',14)} Tutorial</button>
      </div>
      <div class="card-body">
        <div class="form-grid-3" style="grid-template-columns:180px 1.6fr 1fr 1fr;">
          <div class="form-group">
            <label>No. Otomatis</label>
            <select disabled><option>PR001</option></select>
          </div>
          <div class="form-group">
            <label>No. Permintaan</label>
            <div class="input-with-btn">
              <input type="text" id="fPrqNo" value="${row.no||''}" readonly>
              ${isAdd ? `<button type="button" class="icon-btn edit" id="prqRefreshNo" title="Generate Ulang Nomor">${icon('refreshCw',13)}</button>` : ''}
            </div>
          </div>
          <div class="form-group">
            <label>Tgl. Permintaan</label>
            <div class="input-with-btn">
              <input type="text" id="fPrqTgl" value="${row.tgl||''}" ${dis}>
              <span class="icon-btn edit" style="pointer-events:none;">${icon('calendar',13)}</span>
            </div>
          </div>
          <div class="form-group">
            <label>Cabang</label>
            <select id="fPrqCabang" ${(!isAdd)?'disabled':dis}>${PRQ_CABANG_LIST.map(c=>`<option ${row.cabang===c?'selected':''}>${c}</option>`).join('')}</select>
          </div>
        </div>

        <div class="form-grid-3" style="grid-template-columns:180px 1.6fr 2fr;">
          <div class="form-group"></div>
          <div class="form-group">
            <label>Keterangan</label>
            <textarea id="fPrqKeterangan" class="po-textarea" rows="4" ${dis}>${row.keterangan||''}</textarea>
          </div>
          <div class="form-group"></div>
        </div>

        <div class="form-grid-3" style="grid-template-columns:280px 1fr;">
          <div class="form-group">
            <label>Gudang</label>
            <select id="fPrqGudang" ${dis}>${tplPrqGudangOptions(row.cabang||'Head Office', row.gudang)}</select>
          </div>
          <div class="form-group"></div>
        </div>

        <div class="card-header dark-header" style="border-radius:6px;margin-top:14px;">
          <h3>${icon('edit',14)} Rincian Permintaan Pembelian</h3>
        </div>
        <div class="table-wrap" style="margin-top:0;">
          <table class="po-item-table">
            <thead><tr>
              <th style="width:170px;">Kode Barang</th>
              <th>Nama Barang</th>
              <th class="text-right" style="width:110px;">Qty</th>
              <th style="width:130px;">U/M</th>
              <th class="text-right" style="width:120px;">Harga Beli</th>
              <th style="width:140px;">Tgl Perlu</th>
              <th style="width:60px;">Hapus</th>
            </tr></thead>
            <tbody id="prqItemsBody">${tplPrqItemRows(row.items, isView)}</tbody>
          </table>
        </div>
        ${!isView ? `<a href="#" class="link-add" id="prqAddItem">${icon('plus',13)}Tambah Item Baru</a>` : ''}
      </div>
      <div class="card-footer" style="display:flex;gap:10px;justify-content:flex-end;align-items:center;padding:14px 20px;border-top:1px solid var(--border);">
        ${!isView ? `
          <button type="button" class="btn-secondary" id="prqDuplicate" style="background:#d4a017;border-color:#d4a017;color:#fff;">Duplicate</button>
          <button type="button" class="btn-teal" id="prqCetakSimpan">Cetak dan Simpan</button>
          <button type="button" class="btn-primary" id="prqSimpan">Simpan</button>` : ''}
        <a href="#" id="prqBatalkan" class="link-add" style="margin-top:0;">${isView?'Tutup':'Batalkan'}</a>
      </div>
    </div>`;
}

function tplPrqItemRows(items, isView){
  if(!items || !items.length) return `<tr><td colspan="7" style="color:var(--text-light);">Belum ada rincian — klik "+Tambah Item Baru".</td></tr>`;
  return items.map((it,idx)=>`
    <tr>
      <td>
        <div class="input-with-btn">
          <input type="text" data-prq-kode="${idx}" value="${it.kode||''}" readonly>
          ${!isView ? `<button type="button" class="icon-btn edit" data-prq-item-search="${idx}" title="Cari Barang">${icon('search',12)}</button>` : ''}
        </div>
      </td>
      <td><textarea data-prq-nama="${idx}" class="po-textarea" rows="2" ${isView?'disabled':''}>${it.nama||''}</textarea></td>
      <td style="width:110px;"><input type="number" min="0" data-prq-qty="${idx}" value="${it.qty!=null?it.qty:1}" ${isView?'disabled':''} style="text-align:right;"></td>
      <td style="width:130px;"><select data-prq-um="${idx}" ${isView?'disabled':''}>${PRQ_UM_LIST.map(u=>`<option ${it.um===u?'selected':''}>${u}</option>`).join('')}</select></td>
      <td style="width:120px;"><input type="number" min="0" data-prq-harga="${idx}" value="${it.hargaBeli||0}" ${isView?'disabled':''} style="text-align:right;"></td>
      <td style="width:140px;">
        <div class="input-with-btn">
          <input type="text" data-prq-tglperlu="${idx}" value="${it.tglPerlu||''}" ${isView?'disabled':''}>
          <span class="icon-btn edit" style="pointer-events:none;">${icon('calendar',12)}</span>
        </div>
      </td>
      <td style="width:60px;">${!isView ? `<button type="button" class="icon-btn del" data-prq-item-del="${idx}" title="Hapus Baris">${icon('trash',14)}</button>` : ''}</td>
    </tr>`).join('');
}

/* Cetakan/preview PR — kop DBM (DATA.cabangMaster[0]). */
function tplPrqPrintModal(row){
  const ho = DATA.cabangMaster[0] || {};
  const td = 'padding:4px 6px;font-size:11.5px;';
  const itemRows = (row.items||[]).map((it,i)=>`
    <tr>
      <td style="${td}text-align:center;">${i+1}</td>
      <td style="${td}">${it.kode||''}</td>
      <td style="${td}white-space:pre-line;">${it.nama||''}</td>
      <td style="${td}text-align:right;">${prqNum(it.qty)}</td>
      <td style="${td}text-align:center;">${it.um||''}</td>
      <td style="${td}text-align:right;">${prqNum(it.hargaBeli)}</td>
      <td style="${td}text-align:center;">${it.tglPerlu||''}</td>
    </tr>`).join('');
  return `
    <div class="modal-box" style="max-width:900px;width:96vw;">
      <div class="modal-header"><span>${icon('printer',15)} Cetak Permintaan Pembelian — ${row.no}</span><span class="close" id="modalClose">&times;</span></div>
      <div class="modal-body" style="max-height:72vh;overflow:auto;">
        <div style="background:#fff;border:1px solid var(--border);padding:22px 26px;font-family:Arial,Helvetica,sans-serif;color:#111;">
          <div style="display:flex;gap:14px;align-items:flex-start;">
            <div style="width:64px;height:64px;border-radius:10px;background:var(--navy);color:#fff;display:flex;align-items:center;justify-content:center;font-weight:800;font-size:20px;">DBM</div>
            <div>
              <div style="font-weight:800;font-size:14px;">${(ho.namaPerusahaan||'PT Distriversa Buanamas').toUpperCase()}</div>
              <div style="font-size:11.5px;">${ho.alamat||''}, ${ho.kota||''} — Tlp: ${ho.telepon||''}</div>
            </div>
          </div>
          <div style="text-align:center;font-weight:800;font-size:15px;margin:12px 0;text-decoration:underline;">PERMINTAAN PEMBELIAN (PURCHASE REQUEST)</div>
          <table style="border:none;font-size:11.5px;"><tbody>
            <tr><td style="${td}">No. Permintaan</td><td style="${td}">: ${row.no}</td><td style="${td}padding-left:40px;">Cabang</td><td style="${td}">: ${row.cabang||''}</td></tr>
            <tr><td style="${td}">Tgl. Permintaan</td><td style="${td}">: ${row.tgl||''}</td><td style="${td}padding-left:40px;">Gudang</td><td style="${td}">: ${row.gudang||''}</td></tr>
            <tr><td style="${td}">Keterangan</td><td style="${td}" colspan="3">: ${row.keterangan||''}</td></tr>
          </tbody></table>
          <table style="width:100%;border-collapse:collapse;margin-top:10px;">
            <thead><tr style="border-top:2px solid #111;border-bottom:2px solid #111;">
              <th style="${td}width:34px;">No.</th><th style="${td}text-align:left;">Kode Barang</th><th style="${td}text-align:left;">Nama Barang</th><th style="${td}text-align:right;">Qty</th><th style="${td}">U/M</th><th style="${td}text-align:right;">Harga Beli</th><th style="${td}">Tgl Perlu</th>
            </tr></thead>
            <tbody>${itemRows}</tbody>
          </table>
          <div style="border-top:2px solid #111;"></div>
          <div style="display:flex;justify-content:space-between;margin-top:34px;text-align:center;font-size:11.5px;">
            <div style="width:180px;">Dibuat Oleh,<div style="margin-top:56px;border-top:1px solid #111;">( ${row.userInput||'sidik'} )</div></div>
            <div style="width:180px;">Disetujui Oleh,<div style="margin-top:56px;border-top:1px solid #111;">( ${row.approvedBy||'.....................'} )</div></div>
            <div style="width:180px;">Bagian Pembelian,<div style="margin-top:56px;border-top:1px solid #111;">( ..................... )</div></div>
          </div>
        </div>
      </div>
      <div class="modal-footer"><button class="btn-secondary" id="modalCancel">Tutup</button></div>
    </div>`;
}

/* Picker Barang — salinan lokal pola modul lain (DATA.items). */
function tplPrqItemPicker(list){
  return `
    <div class="modal-box" style="max-width:720px;">
      <div class="modal-header"><span>Pilih Barang</span><span class="close" id="modalClose">&times;</span></div>
      <div class="modal-body">
        <input type="text" id="prqItemPickerSearch" placeholder="Cari kode / nama barang..." style="width:100%;border:1px solid var(--border);border-radius:6px;padding:8px 10px;font-size:12.8px;margin-bottom:12px;">
        <div class="table-wrap" style="max-height:360px;overflow:auto;">
          <table>
            <thead><tr><th>Kode</th><th>Nama Barang</th><th>Satuan</th><th class="text-right">Harga</th><th></th></tr></thead>
            <tbody id="prqItemPickerBody">${tplPrqItemPickerRows(list)}</tbody>
          </table>
        </div>
      </div>
      <div class="modal-footer"><button class="btn-secondary" id="modalCancel">Tutup</button></div>
    </div>`;
}

function tplPrqItemPickerRows(list){
  if(!list.length) return `<tr><td colspan="5" style="color:var(--text-light);">Tidak ada barang ditemukan</td></tr>`;
  return list.map(b=>`
    <tr><td>${b.kode}</td><td>${b.nama}</td><td>${b.satuan||''}</td><td class="text-right">${prqNum(b.harga)}</td><td><button class="btn-pick" data-prq-pick-item="${b.kode}">Pilih</button></td></tr>`).join('');
}

function tplPrqDeleteConfirm(row){
  return `
    <div class="modal-box">
      <div class="modal-header"><span>Hapus Permintaan Pembelian</span><span class="close" id="modalClose">&times;</span></div>
      <div class="modal-body"><p>Yakin ingin menghapus Permintaan Pembelian <b>${row.no}</b>?</p></div>
      <div class="modal-footer">
        <button class="btn-secondary" id="modalCancel">Batal</button>
        <button class="btn-danger" id="modalDelete">Hapus</button>
      </div>
    </div>`;
}

function tplPrqInfoModal(title,text){
  return `
    <div class="modal-box">
      <div class="modal-header"><span>${title}</span><span class="close" id="modalClose">&times;</span></div>
      <div class="modal-body"><p>${text}</p></div>
      <div class="modal-footer"><button class="btn-primary" id="modalOk">Mengerti</button></div>
    </div>`;
}
