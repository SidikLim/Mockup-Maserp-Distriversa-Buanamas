/* =========================================================
   TEMPLATE (HTML saja) — Purchase Order (Supplier & Pembelian >
   Daftar Transaksi). Semua fungsi di file ini HANYA menyusun &
   mengembalikan markup HTML (string), TIDAK ada logic/DOM-binding
   di sini. Logic-nya ada di file sebelah: purchase-order.js

   Sesuai 2 screenshot MASERP yang dikirim user: "Daftar Purchase
   Order" (list, dengan tombol "Cetakan ke-N" di bawah No. PO) dan
   "Purchase Order" (form Tambah/Ubah — field sangat banyak: 3 baris
   grid atas, tabel rincian barang dengan banyak kolom kalkulasi,
   plus panel "Informasi PPN" & "Rincian Transaksi" di bawah). Form
   dibuat FULL PAGE (bukan modal), pola sama seperti Master Supplier/
   Jurnal Pembelian/Stock Request.

   Kode barang & nama Supplier di data sample DIGANTI ke milik DBM
   sendiri (lihat catatan di DATA.purchaseOrder, js/data.js) karena
   screenshot aslinya dari demo perusahaan farmasi lain.
========================================================= */

const PO_CABANG_LIST = ['Head Office','Surabaya','Bandung','Medan','Makassar','Semarang','Tangerang','Sidoarjo'];
const PO_TYPE_LIST = ['Persediaan','Aktiva Tetap','Jasa'];
const PO_SHIP_VIA_LIST = ['Ekspedisi','Diambil Sendiri','Dikirim Supplier'];
const PO_SYARAT_BAYAR_LIST = ['CBD','Kredit 14 Hari','Kredit 30 Hari','Kredit 45 Hari','Kredit 60 Hari'];
const PO_GUDANG_LIST = ['Gudang Utama-HO','Gudang Surabaya','Gudang Bandung','Gudang Medan','Gudang Makassar','Gudang Semarang','Gudang Tangerang','Gudang Sidoarjo'];
const PO_PPH_LIST = [
  {kode:'PPH 22 (0.3)', persen:0.3},
  {kode:'PPH 23 (2)', persen:2},
  {kode:'PPH 4(2) (2.5)', persen:2.5},
];
const PO_ALAMAT_BY_CABANG = {
  'Head Office':'Jl. Raya Industri No. 10, Kawasan Pergudangan Cakung, Jakarta Timur',
  'Surabaya':'Jl. Raya Rungkut Industri No. 10, Surabaya',
  'Bandung':'Jl. Ir. H. Juanda No. 88, Bandung',
  'Medan':'Jl. Gatot Subroto No. 33, Medan',
  'Makassar':'Jl. Boulevard No. 12, Makassar',
  'Semarang':'Jl. Pemuda No. 45, Semarang',
  'Tangerang':'Jl. Daan Mogot Km. 15, Tangerang',
  'Sidoarjo':'Jl. Raya Sidoarjo No. 1, Sidoarjo',
};

function tplPurchaseOrderListPage(){
  return `
    <div class="breadcrumb">Home / <b>Purchase Order</b></div>
    <div class="card">
      <div class="card-header dark-header">
        <h3>${icon('cart',15)} Daftar Purchase Order</h3>
        <div class="toolbar-actions">
          <button class="chip-btn" id="btnPoStatusFilter">All ${icon('chevronDown',13)}</button>
          <button class="chip-btn" id="btnPoPeriod">Agustus 2026 ${icon('chevronDown',13)}</button>
          <button class="btn-primary" id="btnPoAdd">${icon('plus',14)} Tambah</button>
        </div>
      </div>
      <div class="table-toolbar">
        <select id="poPageSize"><option selected>10</option><option>25</option><option>50</option></select>
        <input type="text" id="poSearch" placeholder="Pencarian Global">
      </div>
      <div class="table-wrap"><table>
        <thead><tr>
          <th>No. PO</th>
          <th>No. PR</th>
          <th>Tgl. PO</th>
          <th>Supplier</th>
          <th>Keterangan</th>
          <th class="text-right">Jumlah Akhir</th>
          <th>Status</th>
          <th>Lihat</th>
          <th>Ubah</th>
          <th>Hapus</th>
        </tr></thead>
        <tbody id="poTbody"></tbody>
      </table></div>
      <div class="table-footer"><div class="pager"><button>First</button><button>Previous</button><button class="active">1</button><button>Next</button><button>Last</button></div><div id="poTotal"></div></div>
    </div>`;
}

function tplPoRows(rows){
  if(!rows.length) return `<tr><td colspan="10" style="color:var(--text-light);">Tidak ada data Purchase Order</td></tr>`;
  return rows.map((r,i)=>`
    <tr>
      <td>
        ${r.no}
        ${r.cetakanKe>0 ? `<div><button class="cetak-btn" data-cetak="${i}">Cetakan ke-${r.cetakanKe}</button></div>` : ''}
      </td>
      <td>${r.noPR||''}</td>
      <td>${r.tglPO||''}</td>
      <td>${r.supplier||''}</td>
      <td>${r.keterangan||''}</td>
      <td class="text-right">${num(r.jumlahTotal)}</td>
      <td>${r.status}</td>
      <td><button class="icon-btn view" data-view="${i}" title="Lihat">${icon('eye',15)}</button></td>
      <td><button class="icon-btn edit" data-edit="${i}" title="Ubah">${icon('edit',15)}</button></td>
      <td><button class="icon-btn del" data-del="${i}" title="Hapus">${icon('trash',15)}</button></td>
    </tr>`).join('');
}

function tplPoItemRow(item, idx, dis){
  return `
    <tr data-po-item-row="${idx}">
      <td style="text-align:center;"><input type="checkbox" data-po-pph="${idx}" ${item.pph?'checked':''} ${dis}></td>
      <td style="min-width:130px;">
        <div class="input-with-btn">
          <input type="text" data-po-kode="${idx}" value="${item.kode||''}" placeholder="Kode" readonly>
          ${!dis ? `<button type="button" class="icon-btn edit" data-po-item-search="${idx}" title="Cari Barang">${icon('search',13)}</button>` : ''}
        </div>
      </td>
      <td style="min-width:200px;"><textarea data-po-nama="${idx}" rows="1" ${dis}>${item.nama||''}</textarea></td>
      <td style="width:80px;"><input type="number" min="0" data-po-qty="${idx}" value="${item.qty||0}" ${dis}></td>
      <td style="width:80px;">${item.um||''}</td>
      <td style="width:110px;"><input type="number" min="0" data-po-harga="${idx}" value="${item.hargaBeli||0}" ${dis}></td>
      <td style="width:90px;"><input type="number" min="0" data-po-fee="${idx}" value="${item.feeDistribusi||0}" ${dis}></td>
      <td style="width:90px;"><input type="number" min="0" data-po-budget="${idx}" value="${item.budgetDiskon||0}" ${dis}></td>
      <td style="width:90px;"><input type="number" data-po-totaldisc="${idx}" value="${item.totalDisc||0}" disabled></td>
      <td style="width:120px;"><input type="text" data-po-discbarang="${idx}" value="${num(item.discBarang||0)}" disabled></td>
      <td style="width:140px;"><input type="text" data-po-jumlah="${idx}" value="${num(item.jumlah||0)}" disabled></td>
      <td style="width:34px;">${!dis ? `<button type="button" class="icon-btn del" data-po-item-del="${idx}" title="Hapus Baris">${icon('trash',13)}</button>` : ''}</td>
    </tr>`;
}

function tplPoForm(mode, row){
  const isAdd = mode === 'add';
  const isView = mode === 'view';
  const dis = isView ? 'disabled' : '';
  const titleAction = isAdd ? 'Tambah' : (isView ? 'Lihat' : 'Ubah');
  const headerIcon = isAdd ? 'plus' : (isView ? 'eye' : 'edit');
  return `
    <div class="breadcrumb">Home / Purchase Order / <b>${titleAction}</b></div>
    <div class="card">
      <div class="card-header dark-header">
        <h3>${icon(headerIcon,15)} Purchase Order</h3>
        <button class="btn-danger" id="btnPoTutorial" type="button">${icon('card',14)} Tutorial</button>
      </div>
      <div class="card-body">
        <div class="po-grid-3">
          <div class="form-group">
            <label>Cabang</label>
            <select id="fPoCabang" ${(isView||!isAdd)?'disabled':''}>${PO_CABANG_LIST.map(c=>`<option ${row.cabang===c?'selected':''}>${c}</option>`).join('')}</select>
          </div>
          <div class="form-group">
            <label>Cabang Target</label>
            <input type="text" id="fPoCabangTarget" value="${row.cabangTarget||''}" disabled>
          </div>
          <div class="form-group">
            <label>Type PO</label>
            <select id="fPoTypePO" ${dis}>${PO_TYPE_LIST.map(t=>`<option ${row.typePO===t?'selected':''}>${t}</option>`).join('')}</select>
          </div>
        </div>

        <div class="po-grid-3">
          <div class="form-group">
            <label>No. Stock Request (Opsional)</label>
            <div class="input-with-btn">
              <input type="text" id="fPoNoSr" value="${row.noStockRequest||''}" placeholder="Pilih Stock Request" readonly>
              ${!isView ? `<button type="button" class="icon-btn edit" id="poSrSearch" title="Cari Stock Request">${icon('search',13)}</button>
              <button type="button" class="icon-btn del" id="poSrClear" title="Hapus">${icon('trash',13)}</button>` : ''}
            </div>
          </div>
          <div class="form-group">
            <label>Upload File</label>
            ${!isView ? `<button type="button" class="btn-secondary" id="poUploadBtn" style="margin-bottom:6px;">${icon('file',13)} Upload File</button>` : ''}
            <div class="upload-box">${row.fob ? '' : 'Belum ada file diunggah.'}</div>
          </div>
          <div class="form-group">
            <label>FOB</label>
            <input type="text" id="fPoFob" value="${row.fob||''}" placeholder="FOB" ${dis}>
          </div>
        </div>

        <div class="po-grid-3">
          <div class="form-group">
            <label>Supplier</label>
            <div class="input-with-btn">
              <input type="text" id="fPoSupplier" value="${row.supplier||''}" placeholder="Pilih Supplier" readonly>
              ${!isView ? `<button type="button" class="icon-btn edit" id="poSupplierSearch" title="Cari Supplier">${icon('search',13)}</button>` : ''}
            </div>
          </div>
          <div class="form-group">
            <label>No. Ref</label>
            <input type="text" id="fPoNoRef" value="${row.noStockRequest||''}" ${dis}>
          </div>
          <div class="form-group">
            <label>Ship Via (*)</label>
            <div style="display:flex;gap:14px;align-items:center;">
              <select id="fPoShipVia" ${dis} style="flex:1;">${PO_SHIP_VIA_LIST.map(s=>`<option ${row.shipVia===s?'selected':''}>${s}</option>`).join('')}</select>
              <label style="display:flex;align-items:center;gap:6px;font-size:12.5px;font-weight:400;white-space:nowrap;"><input type="checkbox" id="fPoCito" ${row.cito?'checked':''} ${dis} style="width:auto;">Cito?</label>
            </div>
          </div>
        </div>

        <div class="po-grid-3">
          <div class="form-group">
            <label>No. Otomatis</label>
            <div class="input-with-btn">
              <select id="fPoNoOtomatis" ${dis} style="max-width:90px;"><option>${row.noOtomatis||'PO001'}</option></select>
              <input type="text" id="fPoNo" value="${row.no||''}" placeholder="Otomatis" readonly>
              ${isAdd ? `<button type="button" class="icon-btn edit" id="poRefreshNo" title="Generate Nomor">${icon('refreshCw',13)}</button>` : ''}
            </div>
          </div>
          <div class="form-group">
            <label>Tgl. PO</label>
            <div class="input-with-btn">
              <input type="text" id="fPoTgl" value="${row.tglPO||''}" ${dis}>
              <span class="icon-btn edit" style="pointer-events:none;">${icon('calendar',13)}</span>
            </div>
          </div>
          <div class="form-group">
            <label>Estimated Time Delivery (ETD)</label>
            <div class="input-with-btn">
              <input type="text" id="fPoEtd" value="${row.etd||''}" ${dis}>
              <span class="icon-btn edit" style="pointer-events:none;">${icon('calendar',13)}</span>
            </div>
          </div>
        </div>

        <div class="po-grid-3">
          <div class="form-group">
            <label>No. S.O. Indent</label>
            <div class="input-with-btn">
              <input type="text" id="fPoSoIndent" value="${row.noSoIndent||''}" placeholder="No. S.O." readonly>
              ${!isView ? `<button type="button" class="icon-btn edit" id="poSoIndentInfo" title="Cari S.O. Indent">${icon('search',13)}</button>` : ''}
            </div>
          </div>
          <div class="form-group">
            <label>Syarat Bayar</label>
            <select id="fPoSyaratBayar" ${dis}>${PO_SYARAT_BAYAR_LIST.map(s=>`<option ${row.syaratBayar===s?'selected':''}>${s}</option>`).join('')}</select>
          </div>
          <div class="form-group"></div>
        </div>

        <div class="po-grid-3">
          <div class="form-group">
            <label>Gudang</label>
            <select id="fPoGudang" ${dis}>${PO_GUDANG_LIST.map(g=>`<option ${row.gudang===g?'selected':''}>${g}</option>`).join('')}</select>
          </div>
          <div class="form-group">
            <label>Gudang Target</label>
            <select id="fPoGudangTarget" ${dis}>${PO_GUDANG_LIST.map(g=>`<option ${row.gudangTarget===g?'selected':''}>${g}</option>`).join('')}</select>
          </div>
          <div class="form-group">
            <label>Alamat Pengiriman</label>
            <textarea id="fPoAlamat" class="po-textarea" rows="3" ${dis}>${row.alamatPengiriman||''}</textarea>
          </div>
        </div>

        <div class="po-grid-3">
          <div class="form-group" style="grid-column:1 / span 2;">
            <label>Jurnal yang dipakai BPB</label>
            <div style="font-size:11px;color:var(--red);margin-bottom:4px;">Pilih jurnal setelah anda memasukkan syarat bayar terdahulu</div>
            <select id="fPoJurnalBPB" ${dis}>${DATA.jurnalPembelian.map(j=>`<option ${row.jurnalBPB===j.nama?'selected':''}>${j.nama}</option>`).join('')}</select>
          </div>
          <div class="form-group"></div>
        </div>

        <div class="table-wrap" style="margin:6px 0 6px;">
          <table class="po-item-table">
            <thead><tr>
              <th>Pph</th>
              <th>Kode Barang</th>
              <th>Nama Barang</th>
              <th>Qty</th>
              <th>U/M</th>
              <th class="text-right">Harga Beli</th>
              <th class="text-right">Fee Distribusi(%)</th>
              <th class="text-right">Budget Diskon(%)</th>
              <th class="text-right">Total Disc(%)</th>
              <th class="text-right">Disc/Barang</th>
              <th class="text-right">Jumlah</th>
              <th></th>
            </tr></thead>
            <tbody id="poItemsBody">${row.items.map((it,idx)=>tplPoItemRow(it,idx,dis)).join('')}</tbody>
          </table>
        </div>
        ${!isView ? `<a href="#" id="poAddItem" class="link-add">${icon('plus',13)} Tambah Item Baru</a>` : ''}

        <div class="form-grid" style="margin-top:22px;">
          <div>
            <div class="form-section">Informasi PPN</div>
            <div class="radio-group">
              <label><input type="radio" name="poPpnMode" value="tidak" ${row.ppnMode==='tidak'?'checked':''} ${dis}> Tidak ada PPN</label>
              <label><input type="radio" name="poPpnMode" value="tidakDipungut" ${row.ppnMode==='tidakDipungut'?'checked':''} ${dis}> PPN Tidak Dipungut Pajak</label>
              <label><input type="radio" name="poPpnMode" value="inklusif" ${row.ppnMode==='inklusif'?'checked':''} ${dis}> PPN Inklusif</label>
              <label><input type="radio" name="poPpnMode" value="eksklusif" ${row.ppnMode==='eksklusif'?'checked':''} ${dis}> PPN Eksklusif (+11%)</label>
            </div>
          </div>
          <div>
            <div class="form-section">Rincian Transaksi</div>
            <table class="field-table po-rincian-table">
              <tr><td class="flabel">Mata Uang</td><td><input type="text" id="fPoMataUang" value="${row.mataUang||'IDR'}" disabled></td><td class="flabel">Kurs</td><td><input type="number" id="fPoKurs" value="${row.kurs||1}" ${dis}></td></tr>
              <tr><td class="flabel">Diskon 1</td><td><input type="number" id="fPoDiskon1" value="${row.diskon1||0}" ${dis}> %</td><td></td><td><input type="text" id="fPoDiskon1Amount" value="${num(row.diskon1Amount||0)}" disabled></td></tr>
              <tr><td class="flabel">Diskon 2</td><td><input type="number" id="fPoDiskon2" value="${row.diskon2||0}" ${dis}> %</td><td></td><td><input type="text" id="fPoDiskon2Amount" value="${num(row.diskon2Amount||0)}" disabled></td></tr>
              <tr><td class="flabel">DPP</td><td colspan="3"><input type="text" id="fPoDpp" value="${num(row.dpp||0)}" disabled></td></tr>
              <tr><td class="flabel">Pajak 11%</td><td>
                  <div class="input-with-btn">
                    <input type="text" id="fPoPajak11" value="${row.pajak11||''}" readonly>
                    ${!isView ? `<button type="button" class="icon-btn edit" id="poPajakInfo" title="Cari Kode Pajak">${icon('search',13)}</button>` : ''}
                  </div>
                </td><td></td><td><input type="text" id="fPoPpnAmount" value="${num(row.ppnAmount||0)}" disabled></td></tr>
              <tr><td class="flabel">PPh Dipungut</td><td>
                  <div class="input-with-btn">
                    <input type="text" id="fPoPphKode" value="${row.pphKode||''}" placeholder="Tidak ada" readonly>
                    ${!isView ? `<button type="button" class="icon-btn edit" id="poPphSearch" title="Cari PPh">${icon('search',13)}</button>
                    <button type="button" class="icon-btn del" id="poPphClear" title="Hapus">${icon('trash',13)}</button>` : ''}
                  </div>
                </td><td style="font-size:11.5px;color:var(--text-light);white-space:nowrap;">${row.pphKode? (row.pphPersen+'%') : ''}</td><td><input type="text" id="fPoPphAmount" value="${num(row.pphAmount||0)}" disabled></td></tr>
              <tr><td class="flabel">Ongkos Angkut</td><td colspan="3"><input type="number" id="fPoOngkosAngkut" value="${row.ongkosAngkut||0}" ${dis}></td></tr>
              <tr><td class="flabel">Jumlah</td><td colspan="3"><input type="text" id="fPoJumlahTotal" value="${num(row.jumlahTotal||0)}" disabled style="font-weight:700;"></td></tr>
            </table>
          </div>
        </div>

        <div class="form-page-actions">
          ${isView
            ? `<a href="#" id="poTutup" class="link-add" style="margin-right:auto;">&larr; Kembali ke Daftar</a>`
            : `<a href="#" id="poBatalkan" class="link-add" style="margin-right:auto;">Batalkan</a>
               ${!isAdd ? `<button class="btn-teal" id="poPerbaharuiKurs" type="button">Perbaharui Kurs</button>
               <button class="btn-teal" id="poCetak" type="button">${icon('printer',13)} Cetak</button>` : ''}
               <button class="btn-primary" id="poSimpan">Simpan</button>`}
        </div>
      </div>
    </div>`;
}

/* tplPoItemPicker()/tplPoItemPickerRows() DIHAPUS sejak 2026-08-12
   lanjutan lagi — digantikan popup "Daftar Persediaan" bersama
   (openPersediaanPicker()/tplPersediaanPickerModal() di js/core.js),
   dipanggil langsung dari openPoItemPicker() di purchase-order.js. */

function tplPoSupplierPicker(list){
  return `
    <div class="modal-box" style="max-width:560px;">
      <div class="modal-header"><span>Pilih Supplier</span><span class="close" id="modalClose">&times;</span></div>
      <div class="modal-body">
        <div class="table-wrap" style="max-height:340px;overflow:auto;"><table>
          <thead><tr><th>Kode</th><th>Nama Supplier</th><th></th></tr></thead>
          <tbody>${list.map(s=>`<tr><td>${s.kode}</td><td>${s.nama}</td><td><button class="btn-pick" data-pick-supplier="${s.nama}">Pilih</button></td></tr>`).join('')}</tbody>
        </table></div>
      </div>
      <div class="modal-footer"><button class="btn-secondary" id="modalCancel">Tutup</button></div>
    </div>`;
}

function tplPoSrPicker(list){
  return `
    <div class="modal-box" style="max-width:560px;">
      <div class="modal-header"><span>Pilih Stock Request</span><span class="close" id="modalClose">&times;</span></div>
      <div class="modal-body">
        <div class="table-wrap" style="max-height:340px;overflow:auto;"><table>
          <thead><tr><th>No. Request</th><th>Cabang</th><th>Keterangan</th><th></th></tr></thead>
          <tbody>${list.length ? list.map(s=>`<tr><td>${s.no}</td><td>${s.cabangRequest}</td><td>${s.keterangan||''}</td><td><button class="btn-pick" data-pick-sr="${s.no}">Pilih</button></td></tr>`).join('') : `<tr><td colspan="4" style="color:var(--text-light);">Tidak ada Stock Request</td></tr>`}</tbody>
        </table></div>
      </div>
      <div class="modal-footer"><button class="btn-secondary" id="modalCancel">Tutup</button></div>
    </div>`;
}

function tplPoPphPicker(list){
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

function tplPoDeleteConfirm(row){
  return `
    <div class="modal-box">
      <div class="modal-header"><span>Hapus Purchase Order</span><span class="close" id="modalClose">&times;</span></div>
      <div class="modal-body"><p>Yakin ingin menghapus Purchase Order <b>${row.no}</b>?</p></div>
      <div class="modal-footer">
        <button class="btn-secondary" id="modalCancel">Batal</button>
        <button class="btn-danger" id="modalDelete">Hapus</button>
      </div>
    </div>`;
}

function tplPoCetakModal(row){
  return `
    <div class="modal-box">
      <div class="modal-header"><span>Cetak Purchase Order</span><span class="close" id="modalClose">&times;</span></div>
      <div class="modal-body"><p>Cetak dokumen PO <b>${row.no}</b> — akan menjadi cetakan ke-${(row.cetakanKe||0)+1}. Preview cetak (PDF) akan tersedia di sini.</p></div>
      <div class="modal-footer">
        <button class="btn-secondary" id="modalCancel">Batal</button>
        <button class="btn-primary" id="modalCetak">Cetak</button>
      </div>
    </div>`;
}

function tplPoInfoModal(title,text){
  return `
    <div class="modal-box">
      <div class="modal-header"><span>${title}</span><span class="close" id="modalClose">&times;</span></div>
      <div class="modal-body"><p>${text}</p></div>
      <div class="modal-footer">
        <button class="btn-primary" id="modalOk">Mengerti</button>
      </div>
    </div>`;
}
