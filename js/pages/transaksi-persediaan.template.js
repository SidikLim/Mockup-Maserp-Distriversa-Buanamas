/* =========================================================
   TEMPLATE (HTML saja) — Transaksi Persediaan (Persediaan Barang >
   Daftar Transaksi > Transaksi Persediaan, page:'transaksiPersediaan').
   Sebelumnya placeholder murni. Dibangun 2026-08-24 sesuai 6 screenshot
   MASERP yang dikirim user: list "Daftar Transaksi Persediaan" + 5
   varian form "Transaksi Persediaan" tergantung field "Tipe Transaksi"
   (Transfer Produk Bonus / Transfer Stock / Pengeluaran / Pemasukkan /
   Transfer Out terkunci-dari-BPB/Terima Barang).

   Field "Tipe Transaksi" adalah DRIVER form (persis pola Promotion
   Category / Dominasi Tipe) — field mana yang tampil di header & kolom
   tabel item berubah total tergantung pilihan ini. Lihat tpVisibility()
   di bawah untuk matrix lengkap. Pola skeleton kartu/header/tab/tombol
   disalin dari Terima Barang (dark-header + tombol merah "Tutorial",
   .po-grid-3, .inv-tabs/.inv-tab-btn, .field-table Keterangan/Input By,
   .form-page-actions) — bukan didesain baru, karena struktur modul ini
   memang paling mirip Terima Barang (form transaksi persediaan + multi
   batch number input manual).

   Gudang Sumber/Target SENGAJA memakai `DATA.gudang` SUNGGUHAN (bukan
   list lokal dekoratif seperti SR_GUDANG_LIST di Stock Request) —
   screenshot acuan modul ini menampilkan kode gudang yang PERSIS cocok
   dengan `DATA.gudang` (00-GUU Head Office, 03-GUU Tangerang, dst).

   Kolom "Multi Batch Number" mereuse pola INPUT MANUAL dari Terima
   Barang (`tplTbBatchAllocRows`) — disalin lokal sebagai
   `tplTpBatchAllocRows` (bukan reference cross-file, lazy-load antar
   modul tidak terjamin urutannya, pola yang sama seperti banyak
   salinan lokal lain di mockup ini).
========================================================= */

const TP_TIPE_LIST = ['Transfer In','Transfer Out','Transfer Stock','Transfer Produk Bonus','Pengeluaran','Pemasukkan'];
const TP_TIPE_PREFIX = {'Transfer In':'IN','Transfer Out':'OUT','Transfer Stock':'TSS','Transfer Produk Bonus':'TPB','Pengeluaran':'WRO','Pemasukkan':'PMA'};
const TP_CABANG_LIST = ['Head Office','Surabaya','Bandung','Medan','Makassar','Semarang','Tangerang','Sidoarjo'];
const TP_CABANG_CODE = {'Head Office':'HO','Surabaya':'SBY','Bandung':'BDG','Medan':'MDN','Makassar':'MKS','Semarang':'SMG','Tangerang':'TGR','Sidoarjo':'SDA'};
const TP_STATUS_PENGELUARAN_LIST = ['-- Pilih Status --','Barang Rusak / Reject','Kadaluarsa (ED)','Sample / Testing Internal','Lainnya'];

/* Matrix visibilitas field per Tipe Transaksi. */
function tpVisibility(tipe){
  return {
    showStockRequestRow: tipe==='Transfer In' || tipe==='Transfer Out',
    showGudangTransit: tipe==='Transfer Out',
    showGudangTarget: tipe!=='Pengeluaran' && tipe!=='Pemasukkan',
    showRetur: tipe==='Transfer Out',
    showStatusPengeluaran: tipe==='Pengeluaran',
    showTargetBarangCol: tipe==='Transfer Produk Bonus',
    showHargaJumlahCol: tipe==='Pemasukkan',
    showNoRequestCol: (tipe==='Transfer In' || tipe==='Transfer Out'),
  };
}

function tpGudangOptions(selected){
  return DATA.gudang.filter(g=>g.default).map(g=>{
    const val = `(${g.kode}) ${g.nama}`;
    return `<option value="${val}" ${selected===val?'selected':''}>${val}</option>`;
  }).join('');
}

function tpJurnalAuto(tipe, cabang){
  const kode = TP_CABANG_CODE[cabang] || 'HO';
  if(tipe==='Pengeluaran') return `JURNAL PENGELUARAN (${kode})`;
  if(tipe==='Pemasukkan') return `JURNAL PEMASUKAN (${kode})`;
  return '';
}

function tpGudangKodeOnly(val){
  const m = /^\(([^)]+)\)/.exec(val||'');
  return m ? m[1] : (val||'');
}

/* =========================================================
   LIST
========================================================= */
function tplTransaksiPersediaanListPage(){
  return `
    <div class="breadcrumb">Home / <b>Transaksi Persediaan</b></div>
    <div class="card">
      <div class="card-header dark-header">
        <h3>${icon('box',15)} Daftar Transaksi Persediaan</h3>
        <div class="toolbar-actions">
          <button class="btn-teal" id="tpFilterTipeBtn">Semua ${icon('chevronDown',12)}</button>
          <button class="btn-teal" id="tpPeriodBtn">Agustus 2026 ${icon('chevronDown',12)}</button>
          <button class="btn-primary" id="btnTpAdd">${icon('plus',14)} Tambah</button>
        </div>
      </div>
      <div class="table-toolbar">
        <select id="tpPageSize"><option selected>10</option><option>20</option><option>50</option></select>
        <input type="text" id="tpSearch" placeholder="Pencarian Global">
      </div>
      <div class="table-wrap"><table>
        <thead><tr>
          <th>No. Transaksi</th>
          <th>No Referensi</th>
          <th>Stock Request</th>
          <th>Delivery Request Cabang</th>
          <th>Gudang</th>
          <th>Gudang Target</th>
          <th>Tipe Transaksi</th>
          <th>Tgl. Trn.</th>
          <th>Keterangan</th>
          <th>Ubah</th>
          <th>Hapus</th>
          <th>Lihat</th>
          <th>Cetak</th>
        </tr></thead>
        <tbody id="tpTbody"></tbody>
      </table></div>
      <div class="table-footer"><div class="pager" id="tpPager"></div><div id="tpTotal"></div></div>
    </div>`;
}

function tplTpRows(rows){
  if(!rows.length) return `<tr><td colspan="13" style="color:var(--text-light);">Tidak Ada Data</td></tr>`;
  return rows.map(r=>`
    <tr>
      <td><b style="color:var(--blue);cursor:pointer;" data-tp-open="${r._idx}">${r.no}</b><br>
        ${r.approved!==false ? `<span class="status-pill status-paid">Approved</span>` : ''}
      </td>
      <td>${r.noReferensi||''}</td>
      <td>${r.stockRequest||''}</td>
      <td>${r.deliveryRequestCabang||''}</td>
      <td>${tpGudangKodeOnly(r.gudangSumber)}</td>
      <td>${tpGudangKodeOnly(r.gudangTarget)}</td>
      <td>${r.tipeTransaksi}</td>
      <td>${r.tglTrn}</td>
      <td style="max-width:220px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;" title="${(r.keterangan||'').replace(/"/g,'&quot;')}">${r.keterangan||''}</td>
      <td><button class="icon-btn edit" data-tp-edit="${r._idx}" title="Ubah">${icon('edit',15)}</button></td>
      <td><button class="icon-btn del" data-tp-del="${r._idx}" title="Hapus">${icon('trash',15)}</button></td>
      <td><button class="icon-btn view" data-tp-view="${r._idx}" title="Lihat">${icon('eye',15)}</button></td>
      <td><button class="icon-btn print" data-tp-print="${r._idx}" title="Cetak">${icon('printer',15)}</button></td>
    </tr>`).join('');
}

function tplTpPager(page, totalPages){
  const btn = (label,p,dis,active)=>`<button class="${active?'active':''}" data-tp-page="${p}" ${dis?'disabled':''}>${label}</button>`;
  let out = btn('First',1,page===1) + btn('Previous',Math.max(1,page-1),page===1);
  for(let p=1;p<=totalPages;p++) out += btn(String(p),p,false,p===page);
  out += btn('Next',Math.min(totalPages,page+1),page===totalPages) + btn('Last',totalPages,page===totalPages);
  return out;
}

/* =========================================================
   FORM
========================================================= */
function tplTpForm(mode, row){
  const isAdd = mode==='add';
  const isView = mode==='view';
  const locked = !!row.locked;
  const dis = (isView || locked) ? 'disabled' : '';
  const v = tpVisibility(row.tipeTransaksi);
  const titleAction = isAdd ? 'Tambah' : (isView ? 'Lihat' : 'Ubah');
  const headerIcon = isAdd ? 'plus' : (isView ? 'eye' : 'edit');
  return `
    <div class="breadcrumb">Home / Transaksi Persediaan / <b>${titleAction}</b></div>
    ${locked ? `<div class="alert-warning">TUTUP: Transaksi ini dari bpb / terima dr, Perubahan tidak diperbolehkan.</div>` : ''}
    <div class="card">
      <div class="card-header dark-header">
        <h3>${icon(headerIcon,15)} ${isAdd?'+ Transaksi Persediaan':'Transaksi Persediaan'}</h3>
        ${(!isView && !locked) ? `<button class="btn-danger" id="btnTpTutorial" type="button">${icon('card',14)} Tutorial</button>` : ''}
      </div>
      <div class="card-body">

        <div class="po-grid-3">
          <div class="form-group">
            <label>Cabang</label>
            <select id="fTpCabang" ${(isView||!isAdd)?'disabled':''}>${TP_CABANG_LIST.map(c=>`<option ${row.cabang===c?'selected':''}>${c}</option>`).join('')}</select>
          </div>
          <div class="form-group">
            <label>No. Transaksi</label>
            <div class="input-with-btn">
              <input type="text" id="fTpNo" value="${row.no||''}" readonly>
              ${!dis ? `<button type="button" class="icon-btn edit" id="tpRegenBtn" title="Generate Ulang">${icon('refreshCw',13)}</button>` : ''}
            </div>
          </div>
          <div class="form-group">
            <label>Tgl. Trn.</label>
            <div class="input-with-btn">
              <input type="text" id="fTpTglTrn" value="${row.tglTrn||''}" ${dis}>
              <span class="icon-btn edit" style="pointer-events:none;">${icon('calendar',13)}</span>
            </div>
          </div>
        </div>

        ${v.showStockRequestRow ? `
        <div class="po-grid-3">
          <div class="form-group">
            <label>No. Stock Request (Opsional)</label>
            <div class="input-with-btn">
              <input type="text" id="fTpStockRequest" value="${row.stockRequest||''}" placeholder="Stock Request" readonly>
              ${!dis ? `<button type="button" class="icon-btn edit" id="tpSrPickBtn" title="Cari Stock Request">${icon('search',13)}</button>
              <button type="button" class="icon-btn del" id="tpSrClearBtn" title="Hapus">${icon('trash',13)}</button>` : ''}
            </div>
          </div>
          <div class="form-group">
            <label>Delivery Request Cabang</label>
            <input type="text" value="${row.deliveryRequestCabang||''}" placeholder="Delivery Request Cabang" disabled>
          </div>
          <div class="form-group">
            <label>No.SJ Supplier</label>
            <input type="text" id="fTpNoSjSupplier" value="${row.noSjSupplier||''}" placeholder="No.SJ Supplier" ${dis}>
          </div>
        </div>` : ''}

        <div class="po-grid-3">
          <div class="form-group">
            <label>Tipe Transaksi</label>
            <select id="fTpTipe" ${dis}>${TP_TIPE_LIST.map(t=>`<option ${row.tipeTransaksi===t?'selected':''}>${t}</option>`).join('')}</select>
          </div>
          <div class="form-group">
            <label>Jurnal</label>
            <input type="text" value="${row.jurnal||''}" placeholder="Jurnal" disabled>
          </div>
          <div class="form-group">
            ${v.showStatusPengeluaran ? `
              <label>Status Pengeluaran</label>
              <select id="fTpStatusPengeluaran" ${dis}>${TP_STATUS_PENGELUARAN_LIST.map(s=>`<option ${row.statusPengeluaran===s?'selected':''}>${s}</option>`).join('')}</select>
            ` : v.showRetur ? `
              <label>&nbsp;</label>
              <label class="checkbox-row"><input type="checkbox" id="fTpRetur" ${row.retur?'checked':''} ${dis}> Retur</label>
            ` : ''}
          </div>
        </div>

        <div class="po-grid-3">
          <div class="form-group">
            <label>Gudang Sumber</label>
            <select id="fTpGudangSumber" ${dis}>${tpGudangOptions(row.gudangSumber)}</select>
          </div>
          <div class="form-group">
            ${v.showGudangTransit ? `<label>Gudang Transit</label><input type="text" value="IN TRANSIT" disabled>` : ''}
          </div>
          <div class="form-group">
            ${v.showGudangTarget ? `<label>Gudang Target</label><select id="fTpGudangTarget" ${dis}>${tpGudangOptions(row.gudangTarget)}</select>` : ''}
          </div>
        </div>

        <div class="inv-tabs">
          <button type="button" class="inv-tab-btn active" id="tpTabItemsBtn">Rincian Transaksi Persediaan</button>
          <button type="button" class="inv-tab-btn" id="tpTabJurnalBtn">Rincian Jurnal Akun</button>
        </div>

        <div id="tpTabItemsContent">${tplTpItemsPanel(mode,row)}</div>
        <div id="tpTabJurnalContent" style="display:none;">${tplTpJurnalPanel(row)}</div>

        <table class="field-table" style="margin-top:18px;">
          <tr>
            <td class="flabel">Keterangan</td>
            <td><input type="text" id="fTpKeterangan" value="${row.keterangan||''}" ${dis}></td>
          </tr>
          <tr>
            <td class="flabel">Input By</td>
            <td><input type="text" value="${row.userInput||''}" disabled></td>
          </tr>
          ${v.showHargaJumlahCol ? `
          <tr>
            <td class="flabel">Jumlah Transaksi</td>
            <td><input type="text" value="${num(tpTotalJumlah(row))}" disabled></td>
          </tr>` : ''}
        </table>

        <div class="form-page-actions">
          ${isView
            ? `<a href="#" id="tpTutupView" class="link-add" style="margin-right:auto;">&larr; Kembali ke Daftar</a>`
            : `<a href="#" id="tpBatalkan" class="link-add" style="margin-right:auto;">Batalkan</a>
               ${!locked ? `<button class="btn-teal" id="tpCetakSimpan" type="button">Cetak dan Simpan</button>
               <button class="btn-primary" id="tpSimpan">Simpan</button>` : ''}`}
        </div>
      </div>
    </div>`;
}

function tpTotalJumlah(row){
  return (row.items||[]).reduce((s,it)=>s + (Number(it.jumlah)||0), 0);
}

function tplTpItemsPanel(mode, row){
  const dis = (mode==='view' || row.locked) ? 'disabled' : '';
  const v = tpVisibility(row.tipeTransaksi);
  return `
    <div class="table-wrap" style="margin:10px 0 6px;">
      <table class="po-item-table">
        <thead><tr>
          ${v.showNoRequestCol && row.stockRequest ? `<th>No. Request</th><th>Item Request</th>` : ''}
          <th>Kode Barang</th>
          <th>Nama Barang</th>
          <th>Keterangan</th>
          ${v.showTargetBarangCol ? `<th>Kode Barang Target</th><th>Nama Barang Target</th>` : ''}
          <th>Qty</th>
          <th>U/M</th>
          <th>Multi Batch Number</th>
          ${v.showHargaJumlahCol ? `<th>Harga</th><th>Jumlah</th>` : ''}
          <th>Hapus</th>
        </tr></thead>
        <tbody id="tpItemsBody">${tplTpItemRows(mode,row)}</tbody>
      </table>
    </div>
    ${dis ? '' : `<a href="#" id="tpAddItemRow" class="link-add">${icon('plus',13)} Tambah</a>`}`;
}

function tplTpItemRows(mode, row){
  const dis = (mode==='view' || row.locked) ? 'disabled' : '';
  const v = tpVisibility(row.tipeTransaksi);
  const items = row.items||[];
  const colspan = 4 + (v.showNoRequestCol && row.stockRequest ? 2 : 0) + (v.showTargetBarangCol ? 2 : 0) + (v.showHargaJumlahCol ? 2 : 0);
  if(!items.length) return `<tr><td colspan="${colspan}" style="text-align:center;color:var(--text-light);">Belum ada barang</td></tr>`;
  return items.map((it,idx)=>`
    <tr data-tp-item-row="${idx}">
      ${v.showNoRequestCol && row.stockRequest ? `<td>${it.noRequest||row.stockRequest}</td><td>${it.itemRequest||it.nama}</td>` : ''}
      <td style="min-width:110px;">
        <div class="input-with-btn">
          <input type="text" data-tp-kode="${idx}" value="${it.kode||''}" readonly>
          ${!dis ? `<button type="button" class="icon-btn edit" data-tp-item-search="${idx}" title="Cari Barang">${icon('search',13)}</button>` : ''}
        </div>
      </td>
      <td style="min-width:160px;">${it.nama||''}</td>
      <td style="min-width:130px;"><input type="text" data-tp-ket="${idx}" value="${it.ket||''}" ${dis}></td>
      ${v.showTargetBarangCol ? `
      <td style="min-width:110px;">
        <div class="input-with-btn">
          <input type="text" data-tp-kodetarget="${idx}" value="${it.kodeTarget||''}" readonly>
          ${!dis ? `<button type="button" class="icon-btn edit" data-tp-target-search="${idx}" title="Cari Barang Target">${icon('search',13)}</button>` : ''}
        </div>
      </td>
      <td style="min-width:160px;">${it.namaTarget||''}</td>` : ''}
      <td style="width:90px;"><input type="number" min="0" data-tp-qty="${idx}" value="${it.qty||0}" ${dis}></td>
      <td style="width:70px;">${it.um||''}</td>
      <td style="min-width:200px;">
        <div style="display:flex;align-items:center;gap:6px;">
          <span style="font-size:11.5px;color:var(--text-light);flex:1;">Batch</span>
          ${!dis ? `<button type="button" class="icon-btn edit" data-tp-batch-add="${idx}" title="Tambah Batch" style="width:20px;height:20px;">${icon('plus',11)}</button>` : ''}
        </div>
        <div id="tpBatchList${idx}">${tplTpBatchAllocRows(it, idx, dis)}</div>
      </td>
      ${v.showHargaJumlahCol ? `
      <td style="width:100px;"><input type="number" min="0" data-tp-harga="${idx}" value="${it.harga||0}" ${dis}></td>
      <td style="width:120px;"><input type="text" value="${num(it.jumlah||0)}" disabled></td>` : ''}
      <td style="width:34px;">${!dis ? `<button type="button" class="icon-btn del" data-tp-item-del="${idx}" title="Hapus Baris">${icon('trash',13)}</button>` : ''}</td>
    </tr>`).join('');
}

/* Alokasi Multi Batch Number — salinan lokal dari
   tplTbBatchAllocRows() milik Terima Barang (input manual kode
   batch+qty+exp, bisa >1 baris per barang lewat tombol "+"). */
function tplTpBatchAllocRows(item, idx, dis){
  if(!item.batches || !item.batches.length) return `<div style="font-size:11px;color:var(--text-light);margin-top:4px;">Belum ada batch diisi</div>`;
  return item.batches.map((b,bi)=>`
    <div style="display:flex;gap:6px;align-items:center;font-size:11.5px;padding:3px 0;border-bottom:1px dashed var(--border);">
      <input type="text" placeholder="No. Batch" value="${b.batch||''}" data-tp-batch-kode="${idx}:${bi}" style="flex:1;min-width:70px;" ${dis}>
      <input type="number" min="0" placeholder="Qty" value="${b.qty||0}" data-tp-batch-qty="${idx}:${bi}" style="width:60px;" ${dis}>
      <input type="text" placeholder="Exp." value="${b.exp||''}" data-tp-batch-exp="${idx}:${bi}" style="width:80px;" ${dis}>
      ${!dis ? `<span class="icon-btn del" style="width:20px;height:20px;cursor:pointer;" data-tp-batch-del="${idx}:${bi}" title="Hapus">${icon('trash',11)}</span>` : ''}
    </div>`).join('');
}

/* Tab "Rincian Jurnal Akun" — informasional/readonly, 2 baris auto
   dari tpJurnalLines() (lihat transaksi-persediaan.js), reuse akun
   Persediaan Barang Dagang Jakarta (1130001) & Persediaan Barang
   Intransit (1130002) yang sudah ada di DATA.akunGL (akun yang sama
   dipakai auto-jurnal tab "Rincian Jurnal Akun" Invoice). */
function tplTpJurnalPanel(row){
  const lines = tpJurnalLines(row);
  return `
    <div class="table-wrap" style="margin:10px 0 6px;">
      <table>
        <thead><tr><th>Kode Akun</th><th>Nama Akun</th><th>Keterangan</th><th>Jumlah Debit</th><th>Jumlah Kredit</th></tr></thead>
        <tbody>
          ${lines.map(l=>`<tr><td>${l.kodeAkun}</td><td>${l.namaAkun}</td><td>${l.keterangan}</td><td>${num(l.debit)}</td><td>${num(l.kredit)}</td></tr>`).join('')}
        </tbody>
      </table>
    </div>`;
}

/* Picker "Pilih Stock Request" (Transfer In/Out) — hanya menampilkan
   Stock Request milik cabang yang sama & belum ditransfer
   (!transferOutDibuat), konsisten dengan makna field itu di fitur
   Notifikasi topbar (NOTIF_SOURCES, js/core.js, 2026-08-24). */
function tplTpSrPickerModal(rows){
  return `
    <div class="modal-box" style="max-width:640px;">
      <div class="modal-header">Pilih Stock Request<span class="close" id="modalClose">&times;</span></div>
      <div class="modal-body">
        <div class="table-wrap">
        <table>
          <thead><tr><th>No. Stock Request</th><th>Cabang</th><th>Tgl. Request</th><th>Keterangan</th></tr></thead>
          <tbody>
            ${rows.length ? rows.map((r,i)=>`<tr style="cursor:pointer;" data-tp-sr-pick="${i}"><td style="color:var(--blue);">${r.no}</td><td>${r.cabangRequest}</td><td>${r.tglRequest}</td><td>${r.keterangan||''}</td></tr>`).join('') : `<tr><td colspan="4" style="text-align:center;color:var(--text-light);">Tidak ada Stock Request yang belum ditransfer</td></tr>`}
          </tbody>
        </table>
        </div>
      </div>
    </div>`;
}

function tplTpDeleteConfirm(no){
  return `
    <div class="modal-box" style="max-width:420px;">
      <div class="modal-header">Konfirmasi Hapus<span class="close" id="modalClose">&times;</span></div>
      <div class="modal-body">
        <p>Hapus transaksi <b>${no}</b>?</p>
        <div class="form-page-actions">
          <button class="btn-danger" id="modalDelete">Hapus</button>
          <a href="#" id="modalClose2" class="link-add">Batal</a>
        </div>
      </div>
    </div>`;
}

function tplTpInfoModal(title, msg){
  return `
    <div class="modal-box" style="max-width:440px;">
      <div class="modal-header">${title}<span class="close" id="modalClose">&times;</span></div>
      <div class="modal-body"><p>${msg}</p></div>
    </div>`;
}
