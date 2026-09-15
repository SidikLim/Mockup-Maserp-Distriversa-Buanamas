/* =========================================================
   TEMPLATE (HTML saja) — Penjualan Langsung (Customer & Penjualan >
   Daftar Transaksi > Penjualan Langsung, page:'penjualanLangsung' —
   SEBELUMNYA placeholder murni `{label:'Penjualan Langsung',
   page:'placeholder'}` di js/menu.js). Semua fungsi di file ini
   HANYA menyusun & mengembalikan markup HTML (string), TIDAK ada
   logic/DOM-binding/data mutation — logic-nya ada di file sebelah:
   penjualan-langsung.js. Data: DATA.penjualanLangsung (lihat komentar
   desain lengkap + semua keputusan substitusi data di atas array
   tsb, js/data.js).

   KONSEP MODUL — mirror-sisi-Penjualan dari Pembelian Langsung
   (js/pages/pembelian-langsung.*, dibaca ulang & dipakai sbg acuan
   struktur langsung): dokumen BERDIRI SENDIRI, tidak di-chain dari
   Sales Order/Picking List/Invoice manapun — Faktur & Surat Jalan
   dibuat LANGSUNG dalam 1 dokumen ini (field "Surat Jalan" otomatis
   ikut nilai "No. Faktur" saat No. Faktur di-generate ulang, lihat
   pjlOnRefreshNo() di .js).

   Sesuai 2 screenshot MASERP yang dikirim user (2026-09-15):
   1) "+ Penjualan Langsung" (form Tambah): baris Scanner Type /
      Cabang / Proyek; Customer (picker) + baris info kredit merah/
      abu-abu (Batas Kredit / Piutang / Sisa Kredit / Kode Lama
      Customer — lihat pjlCreditInfoHTML()); checkbox "Order
      Pengganti Retur Administasi"; Tipe Layanan + Principal
      (picker, sumber DATA.suppliers); S.Office | Area; No. Faktur
      (+refresh) / Tgl. Faktur / Tgl. Jth. Tempo / Syarat Bayar;
      Gudang / Salesman (picker) / Jurnal; P.O. Customer / Tanggal
      batas Retur / Driver (picker) / Kernet (picker) / Pick Up
      Type; Alamat Pengiriman. Tab "Rincian Transaksi"/"Rincian
      Jurnal Akun" + toolbar (kolom/Refresh DPL/Auto Fill Quantity
      SI — SEMUA DEKORATIF, lihat catatan di DATA.penjualanLangsung);
      Special Disc Global; tabel item (Pph/Ppn checkbox — flag
      dekoratif, Kode/Nama Barang bebas, Special Disc picker
      dekoratif, Multi Batch Number, Qty/U.M/HNA/HNA1+Inklusif,
      Disc Principal/Distributor/Total/Disc Barang1/Jumlah);
      Informasi PPN (4 radio + subfields Mata Uang/Kurs Pajak/
      Tgl. Faktur Pajak/Kode Pajak/No Faktur Pajak); panel Rincian
      Transaksi (Mata Uang/Kurs/Diskon1&2/DPP); Uang Muka; Pajak
      11% + Pph Dipotong (picker+hapus) + Ongkos Angkut + Jumlah +
      Sisa Jumlah; Surat Jalan; Keterangan. Footer: Perbaharui
      Kurs/Cetak/Simpan/Batalkan + Duplikat (header) + Tutorial
      (header, merah).
   2) "Daftar Penjualan Langsung": chip periode (default Juli 2026,
      FUNGSIONAL sama pola PL_BULAN_LIST) + Tambah; kolom No.
      Transaksi (link->Lihat)/Tgl. Faktur/Customer/Tipe Transaksi/
      Jumlah Akhir/P.O. Customer + aksi Attach/Kwitansi/Cetak/Ubah/
      Hapus. Attach & Kwitansi DEKORATIF (modal info, pola sama
      persis "Upload File" dekoratif di sales-quotation.js) — Cetak
      FUNGSIONAL (preview kop DBM, pola tplPlPrintModal). Hapus
      nonaktif bila Pembayaran > 0 (persis pola Pembelian Langsung). */

const PJL_CABANG_LIST = ['Head Office','Surabaya','Bandung','Medan','Makassar','Semarang','Tangerang','Sidoarjo'];
const PJL_CABANG_CODE = {'Head Office':'HO','Surabaya':'SBY','Bandung':'BDG','Medan':'MDN','Makassar':'MKS','Semarang':'SMG','Tangerang':'TGR','Sidoarjo':'SDA'};
const PJL_SYARAT_BAYAR_LIST = ['CBD','Kredit 14 Hari','Kredit 30 Hari','Kredit 45 Hari','Kredit 60 Hari'];
const PJL_SATUAN_LIST = ['UNIT','Pcs','Dus','Karung','Box','Pack'];
const PJL_PPH_LIST = [
  {kode:'PPH 22 (0.3)', persen:0.3},
  {kode:'PPH 23 (2)', persen:2},
  {kode:'PPH 4(2) (2.5)', persen:2.5},
];
const PJL_PPN_LIST = ['Tidak ada PPN','PPN Tidak Dipungut Pajak','PPN Inklusif','PPN Eksklusif(+11%)'];
const PJL_SALESMAN_LIST = ['OFFICE','Andi Wijaya','Budi Santoso','Dedi Kurniawan','Eka Putri','Fajar Nugroho','M. Reza Wijaya'];
const PJL_SCANNER_LIST = ['Barcode','QR Code'];
/* "Special Disc" (Global & per-baris item) — TIDAK ada modul master
   apapun di codebase (sudah dicek nihil), picker DEKORATIF dari
   daftar dummy tetap, pola sama seperti SO_SP_DUMMY_LIST/
   SO_DSC_DUMMY_LIST di Sales Order — tidak mempengaruhi kalkulasi. */
const PJL_SPECIAL_DISC_LIST = ['-Special Disc-','PricingByDate','PricingByVolume','PricingByCustomerGroup'];
const PJL_UANG_MUKA_LIST = ['Tertua','Pilih uang muka'];
const PJL_BULAN_LIST = [
  {label:'Agustus 2026', mm:'08', yy:'2026'},
  {label:'Juli 2026', mm:'07', yy:'2026'},
  {label:'Semua Periode', mm:'', yy:''},
];

function pjlNum2(n){ return Number(n||0).toLocaleString('id-ID', {minimumFractionDigits:2, maximumFractionDigits:2}); }
function pjlTipeTransaksi(row){ return (row.syaratBayar||'').indexOf('Kredit') === 0 ? 'Penjualan Kredit' : 'Penjualan Tunai'; }
function pjlCustomer(kode){ return DATA.customers.find(c => c.kode === kode); }
function pjlSupplier(kode){ return DATA.suppliers.find(s => s.kode === kode); }

/* Baris info kredit customer (Batas Kredit/Piutang/Sisa Kredit/Kode
   Lama Customer) — komponen BARU (tidak ada preseden identik di
   modul lain, lihat catatan di DATA.penjualanLangsung), merah hanya
   kalau Sisa Kredit < 0 (over-limit), selain itu abu-abu netral. */
function pjlCreditInfoHTML(customerKode){
  const c = pjlCustomer(customerKode);
  if(!c) return '';
  const sisaKredit = Number(c.limit||0) - Number(c.piutang||0);
  const color = sisaKredit < 0 ? 'var(--red)' : 'var(--text-light)';
  return `<div style="font-size:11.5px;color:${color};margin:4px 0 10px;">
    Batas Kredit ${pjlNum2(c.limit)}; Piutang ${pjlNum2(c.piutang)}; Sisa Kredit ${pjlNum2(sisaKredit)}; Kode Lama Customer ${c.noRef||'-'};
  </div>`;
}

function pjlSalesOfficeOptions(selected){
  return DATA.salesOffice.map(s=>`<option value="${s.kode}" ${selected===s.kode?'selected':''}>${s.nama}</option>`).join('');
}
function pjlAreaOptions(salesOfficeKode, selected){
  const opts = DATA.area.filter(a => a.salesOffice === salesOfficeKode);
  if(!opts.length) return `<option value="">-</option>`;
  return opts.map(a=>`<option value="${a.kode}" ${selected===a.kode?'selected':''}>${a.nama}</option>`).join('');
}
function pjlGudangOptions(cabang, selected){
  const opts = ['Non Stock ' + cabang].concat(DATA.gudang.filter(g=>g.cabang===cabang).map(g=>g.nama));
  if(selected && !opts.includes(selected)) opts.unshift(selected);
  return opts.map(o=>`<option ${o===selected?'selected':''}>${o}</option>`).join('');
}

/* =====================================================================
   LIST PAGE — "Daftar Penjualan Langsung"
===================================================================== */
function tplPenjualanLangsungListPage(bulan){
  return `
    <div class="breadcrumb">Home / Customer &amp; Penjualan / <b>Penjualan Langsung</b></div>
    <div class="card">
      <div class="card-header dark-header">
        <h3>${icon('list',15)} Daftar Penjualan Langsung</h3>
        <div class="toolbar-actions">
          <select class="chip-btn" id="pjlFilterBulan">${PJL_BULAN_LIST.map(b=>`<option value="${b.mm}|${b.yy}" ${bulan===b.mm+'|'+b.yy?'selected':''}>${b.label}</option>`).join('')}</select>
          <button class="btn-primary" id="btnPjlAdd">${icon('plus',14)} Tambah</button>
        </div>
      </div>
      <div class="table-toolbar">
        <select id="pjlPageSize"><option selected>10</option><option>25</option><option>50</option></select>
        <input type="text" id="pjlSearch" placeholder="Pencarian Global">
      </div>
      <div class="table-wrap"><table>
        <thead><tr>
          <th style="width:150px;">No. Transaksi<span class="th-sort">&#8597;</span></th>
          <th style="width:100px;">Tgl. Faktur<span class="th-sort">&#8597;</span></th>
          <th>Customer<span class="th-sort">&#8597;</span></th>
          <th style="width:140px;">Tipe Transaksi<span class="th-sort">&#8597;</span></th>
          <th class="text-right" style="width:150px;">Jumlah Akhir<span class="th-sort">&#8597;</span></th>
          <th style="width:130px;">P.O. Customer<span class="th-sort">&#8597;</span></th>
          <th style="width:56px;">Attach</th>
          <th style="width:56px;">Kwitansi</th>
          <th style="width:56px;">Cetak</th>
          <th style="width:56px;">Ubah</th>
          <th style="width:56px;">Hapus</th>
        </tr></thead>
        <tbody id="pjlTbody"></tbody>
      </table></div>
      <div class="table-footer"><div class="pager"><button>First</button><button>Previous</button><button class="active">1</button><button>Next</button><button>Last</button></div><div id="pjlTotal"></div></div>
    </div>`;
}

function tplPjlRows(rows){
  if(!rows.length) return `<tr><td colspan="11" style="color:var(--text-light);padding:14px;">Tidak ada Penjualan Langsung pada periode / pencarian ini.</td></tr>`;
  return rows.map((r,i)=>{
    const lunas = Number(r.pembayaran||0) > 0;
    return `
    <tr>
      <td><button class="link-pick" data-view-link="${i}">${r.no}</button></td>
      <td>${r.tglFaktur||''}</td>
      <td>${(r.customerNama||'').toUpperCase()}<br><span style="font-size:11px;color:var(--text-light);">${r.alamatPengiriman||''}</span></td>
      <td>${pjlTipeTransaksi(r)}</td>
      <td class="text-right">${pjlNum2(r.jumlahAkhir)}</td>
      <td>${r.poCustomer||''}</td>
      <td><button class="icon-btn print" data-pjl-attach="${i}" title="Attach">${icon('file',14)}</button></td>
      <td><button class="icon-btn print" data-pjl-kwitansi="${i}" title="Kwitansi">${icon('cash',14)}</button></td>
      <td><button class="icon-btn edit" data-pjl-cetak="${i}" title="Cetak">${icon('printer',14)}</button></td>
      <td><button class="icon-btn edit" data-pjl-edit="${i}" title="Ubah">${icon('edit',15)}</button></td>
      <td><button class="icon-btn del" data-pjl-del="${i}" title="${lunas?'Tidak bisa dihapus — sudah ada pembayaran':'Hapus'}" ${lunas?'disabled style="opacity:.45;cursor:not-allowed;"':''}>${icon('trash',15)}</button></td>
    </tr>`;
  }).join('');
}

/* =====================================================================
   FORM (full page) — "+ Penjualan Langsung"
===================================================================== */
function tplPjlForm(mode, row){
  const isAdd = mode === 'add';
  const isView = mode === 'view';
  const dis = isView ? 'disabled' : '';
  return `
    <div class="breadcrumb">Home / Penjualan Langsung / <b>${isAdd ? 'Tambah' : (isView ? 'Lihat' : 'Ubah')}</b></div>
    <div class="card">
      <div class="card-header dark-header">
        <h3>${icon('plus',15)} Penjualan Langsung</h3>
        <div class="toolbar-actions">
          ${!isView ? `<button class="btn-teal" id="btnPjlDuplikat" type="button">Duplikat</button>` : ''}
          <button class="btn-danger" id="btnPjlTutorial">${icon('card',14)} Tutorial</button>
        </div>
      </div>
      <div class="card-body">
        <div class="form-grid-3" style="grid-template-columns:1fr 1fr 1fr;">
          <div class="form-group">
            <label>Scanner Type</label>
            <select id="fPjlScanner" ${dis}>${PJL_SCANNER_LIST.map(s=>`<option ${row.scannerType===s?'selected':''}>${s}</option>`).join('')}</select>
          </div>
          <div class="form-group">
            <label>Cabang</label>
            <select id="fPjlCabang" ${(!isAdd)?'disabled':dis}>${PJL_CABANG_LIST.map(c=>`<option ${row.cabang===c?'selected':''}>${c}</option>`).join('')}</select>
          </div>
          <div class="form-group">
            <label>Proyek</label>
            <input type="text" id="fPjlProyek" value="${row.proyek||''}" ${dis}>
          </div>
        </div>

        <div class="form-grid-3" style="grid-template-columns:1fr;">
          <div class="form-group">
            <label>Customer</label>
            <div class="input-with-btn">
              <input type="text" id="fPjlCustomer" value="${(row.customerNama||'').toUpperCase()}" placeholder="Pilih Customer" readonly>
              ${!isView ? `<button type="button" class="icon-btn edit" id="pjlCustomerSearch" title="Cari Customer">${icon('search',13)}</button>` : ''}
            </div>
            <div id="pjlCreditInfo">${pjlCreditInfoHTML(row.customerKode)}</div>
          </div>
        </div>

        <label style="display:flex;align-items:center;gap:8px;font-size:12.8px;margin:0 0 14px;">
          <input type="checkbox" id="fPjlOrderPengganti" ${row.orderPenggantiRetur?'checked':''} ${dis} style="width:auto;"> Order Pengganti Retur Administasi
        </label>

        <div class="form-grid-3" style="grid-template-columns:1fr 1fr;">
          <div class="form-group">
            <label>Tipe Layanan</label>
            <select id="fPjlTipeLayanan" ${dis}><option value="">Pilih</option>${DATA.layananList.map(l=>`<option ${row.tipeLayanan===l?'selected':''}>${l}</option>`).join('')}</select>
          </div>
          <div class="form-group">
            <label>Principal</label>
            <div class="input-with-btn">
              <input type="text" id="fPjlPrincipal" value="${(row.principalNama||'').toUpperCase()}" placeholder="Pilih Principal" readonly>
              ${!isView ? `<button type="button" class="icon-btn edit" id="pjlPrincipalSearch" title="Cari Principal">${icon('search',13)}</button>` : ''}
            </div>
          </div>
        </div>

        <div class="form-grid-3" style="grid-template-columns:1fr 1fr;">
          <div class="form-group">
            <label>S.Office</label>
            <select id="fPjlSalesOffice" ${dis}>${pjlSalesOfficeOptions(row.salesOffice)}</select>
          </div>
          <div class="form-group">
            <label>Area</label>
            <select id="fPjlArea" ${dis}>${pjlAreaOptions(row.salesOffice, row.area)}</select>
          </div>
        </div>

        <div class="form-grid-3" style="grid-template-columns:1.2fr 1fr 1fr 1fr;">
          <div class="form-group">
            <label>No. Faktur</label>
            <div class="input-with-btn">
              <input type="text" id="fPjlNo" value="${row.no||''}" readonly>
              ${isAdd ? `<button type="button" class="icon-btn edit" id="pjlRefreshNo" title="Generate Ulang Nomor">${icon('refreshCw',13)}</button>` : ''}
            </div>
          </div>
          <div class="form-group">
            <label>Tgl. Faktur</label>
            <div class="input-with-btn">
              <input type="text" id="fPjlTglFaktur" value="${row.tglFaktur||''}" ${dis}>
              <span class="icon-btn edit" style="pointer-events:none;">${icon('calendar',13)}</span>
            </div>
          </div>
          <div class="form-group">
            <label>Tgl. Jth. Tempo</label>
            <div class="input-with-btn">
              <input type="text" id="fPjlTglJthTempo" value="${row.tglJatuhTempo||''}" ${dis}>
              <span class="icon-btn edit" style="pointer-events:none;">${icon('calendar',13)}</span>
            </div>
          </div>
          <div class="form-group">
            <label>Syarat Bayar</label>
            <select id="fPjlSyaratBayar" ${dis}>${PJL_SYARAT_BAYAR_LIST.map(s=>`<option ${row.syaratBayar===s?'selected':''}>${s}</option>`).join('')}</select>
          </div>
        </div>

        <div class="form-grid-3" style="grid-template-columns:1fr 1fr 1fr;">
          <div class="form-group">
            <label>Gudang</label>
            <select id="fPjlGudang" ${dis}>${pjlGudangOptions(row.cabang||'Head Office', row.gudang)}</select>
          </div>
          <div class="form-group">
            <label>Salesman</label>
            <select id="fPjlSalesman" ${dis}>${PJL_SALESMAN_LIST.map(s=>`<option ${row.salesman===s?'selected':''}>${s}</option>`).join('')}</select>
          </div>
          <div class="form-group">
            <label>Jurnal</label>
            <select id="fPjlJurnal" ${dis}><option value=""></option>${DATA.jurnalPenjualan.map(j=>`<option ${row.jurnal===j.nama?'selected':''}>${j.nama}</option>`).join('')}</select>
          </div>
        </div>

        <div class="form-grid-3" style="grid-template-columns:1fr 1fr 1fr 1fr 1fr;">
          <div class="form-group">
            <label>P.O. Customer</label>
            <input type="text" id="fPjlPoCustomer" value="${row.poCustomer||''}" ${dis}>
          </div>
          <div class="form-group">
            <label>Tanggal batas Retur</label>
            <input type="text" id="fPjlTglBatasRetur" value="${row.tglBatasRetur||''}" ${dis}>
          </div>
          <div class="form-group">
            <label>Driver</label>
            <select id="fPjlDriver" ${dis}><option value=""></option>${DATA.driverList.map(d=>`<option ${row.driver===d?'selected':''}>${d}</option>`).join('')}</select>
          </div>
          <div class="form-group">
            <label>Kernet</label>
            <select id="fPjlKernet" ${dis}><option value=""></option>${DATA.kernetList.map(k=>`<option ${row.kernet===k?'selected':''}>${k}</option>`).join('')}</select>
          </div>
          <div class="form-group">
            <label>Pick Up Type</label>
            <input type="text" id="fPjlPickUpType" value="${row.pickUpType||''}" ${dis}>
          </div>
        </div>

        <div class="form-grid-3" style="grid-template-columns:220px 1fr;">
          <div class="form-group">
            <label>Alamat Pengiriman</label>
            <select id="fPjlAlamatTipe" ${dis}><option ${row.alamatPengirimanTipe==='Alamat Customer'?'selected':''}>Alamat Customer</option><option ${row.alamatPengirimanTipe==='Alamat Lain'?'selected':''}>Alamat Lain</option></select>
          </div>
          <div class="form-group">
            <label>&nbsp;</label>
            <textarea id="fPjlAlamat" class="po-textarea" rows="3" ${dis}>${row.alamatPengiriman||''}</textarea>
          </div>
        </div>

        <div class="inv-tabs">
          <button type="button" class="inv-tab-btn active" id="pjlTabRincianBtn">Rincian Transaksi</button>
          <button type="button" class="inv-tab-btn" id="pjlTabJurnalBtn">Rincian Jurnal Akun</button>
        </div>

        <div id="pjlTabRincianContent">${tplPjlRincianTab(row, isView)}</div>
        <div id="pjlTabJurnalContent" style="display:none;">${tplPjlJurnalContent(row, isView)}</div>

        ${tplPjlBottomPanel(row, isView)}
      </div>
      <div class="card-footer" style="display:flex;gap:10px;justify-content:flex-end;align-items:center;padding:14px 20px;border-top:1px solid var(--border);">
        ${!isView ? `
          <button type="button" class="btn-teal" id="pjlPerbaharuiKurs">Perbaharui Kurs</button>
          <button type="button" class="btn-teal" id="pjlCetak">${icon('printer',13)} Cetak</button>
          <button type="button" class="btn-primary" id="pjlSimpan">Simpan</button>` : ''}
        <a href="#" id="pjlBatalkan" class="link-add" style="margin-top:0;">${isView?'Tutup':'Batalkan'}</a>
      </div>
    </div>`;
}

/* ===== Tab 1 — Rincian Transaksi (toolbar + tabel item, scroll horizontal) ===== */
function tplPjlRincianTab(row, isView){
  return `
    <div style="display:flex;align-items:center;justify-content:space-between;margin:14px 0 6px;flex-wrap:wrap;gap:10px;">
      <div class="form-group" style="max-width:260px;margin:0;">
        <label>Special Disc Global</label>
        <select id="fPjlSpecialDiscGlobal" ${isView?'disabled':''}>${PJL_SPECIAL_DISC_LIST.map(s=>`<option ${row.specialDiscGlobal===s?'selected':''}>${s}</option>`).join('')}</select>
      </div>
      ${!isView ? `
      <div style="display:flex;gap:8px;">
        <button type="button" class="icon-btn edit" id="pjlColumnsBtn" title="Pilih Kolom">${icon('settings',14)}</button>
        <button type="button" class="btn-secondary" id="pjlRefreshDpl">${icon('search',13)} Refresh DPL</button>
        <button type="button" class="btn-secondary" id="pjlAutoFillQty">Auto Fill Quantity SI</button>
      </div>` : ''}
    </div>
    <div class="table-wrap" style="margin:10px 0 0;overflow-x:auto;">
      <table class="po-item-table" style="min-width:1560px;">
        <thead><tr>
          <th style="width:40px;">No.</th>
          <th style="width:44px;">Pph</th>
          <th style="width:44px;">Ppn</th>
          <th style="width:120px;">Kode Barang</th>
          <th style="min-width:200px;">Nama Barang</th>
          <th style="width:140px;">Special Disc</th>
          <th style="width:90px;">Multi Batch Number</th>
          <th class="text-right" style="width:70px;">Qty</th>
          <th style="width:80px;">U/M</th>
          <th class="text-right" style="width:110px;">HNA</th>
          <th class="text-right" style="width:130px;">HNA1</th>
          <th class="text-right" style="width:90px;">Disc Principal(%)</th>
          <th class="text-right" style="width:100px;">Disc Distributor(%)</th>
          <th class="text-right" style="width:90px;">Total Disc(%)</th>
          <th class="text-right" style="width:110px;">Disc/Barang1</th>
          <th class="text-right" style="width:140px;">Jumlah</th>
          <th style="width:56px;">Hapus</th>
        </tr></thead>
        <tbody id="pjlItemsBody">${tplPjlItemRows(row.items, isView)}</tbody>
      </table>
    </div>
    ${!isView ? `<a href="#" class="link-add" id="pjlAddItem">${icon('plus',13)}Tambah Item Baru</a>` : ''}`;
}

function tplPjlItemRows(items, isView){
  if(!items || !items.length) return `<tr><td colspan="17" style="color:var(--text-light);">Belum ada rincian — klik "+Tambah Item Baru".</td></tr>`;
  return items.map((it,idx)=>`
    <tr>
      <td style="text-align:center;">${idx+1}</td>
      <td style="text-align:center;"><input type="checkbox" data-pjl-pph="${idx}" ${it.pphChecked?'checked':''} ${isView?'disabled':''}></td>
      <td style="text-align:center;"><input type="checkbox" data-pjl-ppn="${idx}" ${it.ppnChecked?'checked':''} ${isView?'disabled':''}></td>
      <td>
        <div class="input-with-btn">
          <input type="text" data-pjl-kode="${idx}" value="${it.kode||''}" ${isView?'disabled':''}>
        </div>
      </td>
      <td><textarea data-pjl-nama="${idx}" class="po-textarea" rows="2" ${isView?'disabled':''}>${it.nama||''}</textarea></td>
      <td><select data-pjl-specialdisc="${idx}" ${isView?'disabled':''}>${PJL_SPECIAL_DISC_LIST.map(s=>`<option ${it.specialDisc===s?'selected':''}>${s}</option>`).join('')}</select></td>
      <td style="text-align:center;">${!isView ? `<button type="button" class="btn-primary" data-pjl-batch="${idx}" style="padding:4px 10px;font-size:12px;" title="Multi Batch Number">+</button>` : `<span style="font-size:11.5px;">${it.batch||'-'}</span>`}</td>
      <td><input type="number" min="0" data-pjl-qty="${idx}" value="${it.qty!=null?it.qty:1}" ${isView?'disabled':''} style="text-align:right;"></td>
      <td><select data-pjl-um="${idx}" ${isView?'disabled':''}>${PJL_SATUAN_LIST.map(u=>`<option ${it.um===u?'selected':''}>${u}</option>`).join('')}</select></td>
      <td><input type="number" min="0" data-pjl-hna="${idx}" value="${it.hna||0}" ${isView?'disabled':''} style="text-align:right;"></td>
      <td>
        <input type="number" min="0" data-pjl-hna1="${idx}" value="${it.hna1||0}" ${isView?'disabled':''} style="text-align:right;">
        <label style="display:flex;align-items:center;gap:4px;font-size:10.5px;color:var(--text-light);white-space:nowrap;"><input type="checkbox" data-pjl-hna1inklusif="${idx}" ${it.hna1Inklusif?'checked':''} ${isView?'disabled':''} style="width:auto;"> Inklusif</label>
      </td>
      <td><input type="number" min="0" data-pjl-discprincipal="${idx}" value="${it.discPrincipal||0}" ${isView?'disabled':''} style="text-align:right;"></td>
      <td><input type="number" min="0" data-pjl-discdistributor="${idx}" value="${it.discDistributor||0}" ${isView?'disabled':''} style="text-align:right;"></td>
      <td><input type="text" data-pjl-totaldisc="${idx}" value="${it.totalDisc||0}" readonly style="text-align:right;"></td>
      <td><input type="text" data-pjl-discbarang="${idx}" value="${pjlNum2(it.discBarang||0)}" readonly style="text-align:right;"></td>
      <td><input type="text" data-pjl-jumlah="${idx}" value="${pjlNum2(it.jumlah||0)}" readonly style="text-align:right;"></td>
      <td style="text-align:center;">${!isView ? `<button type="button" class="icon-btn del" data-pjl-item-del="${idx}" title="Hapus Baris">${icon('trash',14)}</button>` : ''}</td>
    </tr>`).join('');
}

/* ===== Tab 2 — Rincian Jurnal Akun (Otomatis / Manual) — pola sama
   persis Pembelian Langsung, akun GL sisi Penjualan (Piutang/PPN
   Keluaran/dsb dari DATA.jurnalPenjualan). ===== */
function tplPjlJurnalContent(row, isView){
  const totals = pjlJurnalTotals(row);
  const selisihColor = Math.abs(totals.selisih) > 0.004 ? 'var(--red)' : 'var(--text)';
  const manual = row.jurnalMode === 'manual';
  return `
    ${!isView ? `
    <div style="display:flex;align-items:center;justify-content:space-between;margin:14px 0;flex-wrap:wrap;gap:10px;">
      <div class="radio-inline" style="display:flex;gap:18px;">
        <label style="display:flex;align-items:center;gap:6px;font-size:12.8px;"><input type="radio" name="pjlJurnalMode" value="otomatis" ${!manual?'checked':''} style="width:auto;"> Jurnal Otomatis</label>
        <label style="display:flex;align-items:center;gap:6px;font-size:12.8px;"><input type="radio" name="pjlJurnalMode" value="manual" ${manual?'checked':''} style="width:auto;"> Jurnal Manual</label>
      </div>
      <button type="button" class="btn-secondary" id="pjlBuatJurnal">${icon('refreshCw',13)} Buat Jurnal</button>
    </div>` : '<div style="margin-top:14px;"></div>'}
    <div class="card-header dark-header" style="border-radius:6px;">
      <h3>${icon('settings',14)} Rincian Jurnal Akun</h3>
      ${(!isView && manual) ? `<button type="button" class="btn-primary" id="pjlJurnalAddRow">${icon('plus',13)} Tambah</button>` : ''}
    </div>
    <div class="table-wrap" style="margin:6px 0 0;">
      <table class="po-item-table">
        <thead><tr>
          <th>Kode Akun</th><th>Nama Akun</th><th>Keterangan</th><th class="text-right">Jumlah Debit</th><th class="text-right">Jumlah Kredit</th><th>Hapus</th>
        </tr></thead>
        <tbody id="pjlJurnalBody">${tplPjlJurnalRows(row.jurnalAkun, isView || !manual)}</tbody>
      </table>
    </div>
    <div style="max-width:280px;margin:16px 0 0 auto;">
      <div style="font-size:12.5px;font-weight:600;color:var(--text);margin-bottom:4px;">Jumlah Debit - Kredit</div>
      <input type="text" id="pjlJurnalSelisih" value="${pjlNum2(totals.selisih)}" readonly style="text-align:right;font-weight:700;color:${selisihColor};">
    </div>`;
}

function tplPjlJurnalRows(list, readonly){
  if(!list || !list.length) return `<tr><td colspan="6" style="color:var(--text-light);">Belum ada rincian jurnal — klik "Buat Jurnal".</td></tr>`;
  return list.map((entry,idx)=>{
    if(readonly){
      return `
      <tr>
        <td style="min-width:110px;"><input type="text" value="${entry.kodeAkun||''}" readonly></td>
        <td style="min-width:180px;"><input type="text" value="${entry.namaAkun||''}" readonly></td>
        <td style="min-width:160px;"><input type="text" value="${entry.keterangan||''}" readonly></td>
        <td style="width:150px;"><input type="text" value="${pjlNum2(entry.debit||0)}" readonly style="text-align:right;"></td>
        <td style="width:150px;"><input type="text" value="${pjlNum2(entry.kredit||0)}" readonly style="text-align:right;"></td>
        <td style="width:50px;"></td>
      </tr>`;
    }
    return `
    <tr data-pjl-jurnal-row="${idx}">
      <td style="min-width:110px;">
        <div class="input-with-btn">
          <input type="text" data-pjl-jurnal-kode="${idx}" value="${entry.kodeAkun||''}" readonly>
          <button type="button" class="icon-btn edit" data-pjl-jurnal-akun-search="${idx}" title="Cari Akun GL">${icon('search',12)}</button>
        </div>
      </td>
      <td style="min-width:180px;"><input type="text" data-pjl-jurnal-nama="${idx}" value="${entry.namaAkun||''}" readonly></td>
      <td style="min-width:160px;"><input type="text" data-pjl-jurnal-ket="${idx}" value="${entry.keterangan||''}"></td>
      <td style="width:150px;"><input type="number" step="0.01" min="0" data-pjl-jurnal-debit="${idx}" value="${entry.debit||0}" style="text-align:right;"></td>
      <td style="width:150px;"><input type="number" step="0.01" min="0" data-pjl-jurnal-kredit="${idx}" value="${entry.kredit||0}" style="text-align:right;"></td>
      <td style="width:50px;"><button type="button" class="icon-btn del" data-pjl-jurnal-del="${idx}" title="Hapus Baris">${icon('trash',14)}</button></td>
    </tr>`;
  }).join('');
}

/* ===== Panel bawah — Informasi PPN + Rincian Transaksi + Uang Muka
   + Pajak/Pph/Ongkos/Jumlah + Surat Jalan + Keterangan ===== */
function tplPjlBottomPanel(row, isView){
  const dis = isView ? 'disabled' : '';
  const showSub = (row.tipePpn === 'PPN Inklusif' || row.tipePpn === 'PPN Eksklusif(+11%)');
  return `
    <div class="form-grid" style="margin-top:26px;">
      <div>
        <div class="form-section">Informasi PPN</div>
        <div class="radio-group">
          ${PJL_PPN_LIST.map(p=>`<label><input type="radio" name="pjlPpnMode" value="${p}" ${row.tipePpn===p?'checked':''} ${dis}> ${p}</label>`).join('')}
        </div>
        <div id="pjlPpnSubfields" style="margin-top:14px;${showSub?'':'display:none;'}">
          <table class="field-table po-rincian-table">
            <tr><td class="flabel">Mata Uang</td><td><input type="text" id="fPjlMataUangPajak" value="${row.mataUangPajak||'Rupiah (IDR)'}" disabled></td></tr>
            <tr><td class="flabel">Kurs Pajak</td><td><input type="text" id="fPjlKursPajak" value="${pjlNum2(row.kursPajak||1)}" ${dis} style="text-align:right;"></td></tr>
            <tr><td class="flabel">Tgl. Faktur Pajak</td><td><input type="text" id="fPjlTglFakturPajak" value="${row.tglFakturPajak||''}" ${dis}></td></tr>
            <tr><td class="flabel">Kode Pajak</td><td><select id="fPjlKodePajak" ${dis}>${DATA.kodePajakList.map(k=>`<option ${row.kodePajak===k?'selected':''}>${k}</option>`).join('')}</select></td></tr>
            <tr><td class="flabel">No Faktur Pajak</td><td><input type="text" id="fPjlNoFakturPajak" value="${row.noFakturPajak||''}" ${dis}></td></tr>
          </table>
        </div>
        <div class="form-group" style="margin-top:18px;max-width:420px;">
          <label>Keterangan</label>
          <textarea id="fPjlKeterangan" class="po-textarea" rows="3" ${dis}>${row.keterangan||''}</textarea>
        </div>
      </div>
      <div>
        <div class="form-section">Rincian Transaksi</div>
        <table class="field-table po-rincian-table">
          <tr><td class="flabel">Mata Uang</td><td><input type="text" value="IDR" disabled></td><td class="flabel">Kurs</td><td><input type="text" value="${pjlNum2(row.kurs||1)}" disabled style="text-align:right;"></td></tr>
          <tr><td class="flabel">Diskon 1</td><td><input type="number" min="0" max="100" id="fPjlDiskon1" value="${row.diskon1||0}" ${dis} style="text-align:right;"> %</td><td></td><td><input type="text" id="fPjlDiskon1Amount" value="${pjlNum2(row.diskon1Amount||0)}" disabled style="text-align:right;"></td></tr>
          <tr><td class="flabel">Diskon 2</td><td><input type="number" min="0" max="100" id="fPjlDiskon2" value="${row.diskon2||0}" ${dis} style="text-align:right;"> %</td><td></td><td><input type="text" id="fPjlDiskon2Amount" value="${pjlNum2(row.diskon2Amount||0)}" disabled style="text-align:right;"></td></tr>
          <tr><td class="flabel">DPP</td><td colspan="3"><input type="text" id="fPjlDpp" value="${pjlNum2(row.dpp||0)}" disabled style="text-align:right;"></td></tr>
        </table>

        <div class="form-section" style="margin-top:18px;">Uang Muka</div>
        <table class="field-table po-rincian-table">
          <tr><td class="flabel">Tipe Uang Muka</td><td colspan="3">
            <div style="display:flex;gap:18px;">
              ${PJL_UANG_MUKA_LIST.map(u=>`<label style="display:flex;align-items:center;gap:6px;font-size:12.5px;"><input type="radio" name="pjlUmTipe" value="${u}" ${row.uangMukaTipe===u?'checked':''} ${dis} style="width:auto;"> ${u}</label>`).join('')}
            </div>
          </td></tr>
          <tr><td class="flabel">Sisa U.Muka</td><td><input type="text" id="fPjlSisaUm" value="${pjlNum2(row.sisaUangMuka||0)}" disabled style="text-align:right;"></td><td class="flabel">Pakai:</td><td><input type="number" min="0" id="fPjlUmPakai" value="${row.uangMukaPakai||0}" ${dis} style="text-align:right;"></td></tr>
        </table>

        <table class="field-table po-rincian-table" style="margin-top:14px;">
          <tr><td class="flabel">Pajak <span id="pjlPajakPersenLabel">${showSub?'11':'0'}</span> %</td><td>
              <div class="input-with-btn">
                <input type="text" id="fPjlPajakKode" value="${row.pajak11||''}" placeholder="Pilih Ppn" readonly>
                ${!isView ? `<button type="button" class="icon-btn edit" id="pjlPajakInfo" title="Pilih PPN">${icon('search',13)}</button>` : ''}
              </div>
            </td><td></td><td><input type="text" id="fPjlPpnAmount" value="${pjlNum2(row.ppn||0)}" disabled style="text-align:right;"></td></tr>
          <tr><td class="flabel">Pph Dipoton</td><td>
              <div class="input-with-btn">
                <input type="text" id="fPjlPphKode" value="${row.pphKode||''}" placeholder="Tidak ada" readonly>
                ${!isView ? `<button type="button" class="icon-btn edit" id="pjlPphSearch" title="Cari PPh">${icon('search',13)}</button>
                <button type="button" class="icon-btn del" id="pjlPphClear" title="Hapus PPh">${icon('trash',13)}</button>` : ''}
              </div>
            </td><td style="font-size:11.5px;color:var(--text-light);white-space:nowrap;"><span id="pjlPphPersenLabel">${row.pphKode ? row.pphPersen : 0}</span> %</td><td><input type="text" id="fPjlPphAmount" value="${pjlNum2(row.pphAmount||0)}" disabled style="text-align:right;"></td></tr>
          <tr><td class="flabel">Ongkos Angkut</td><td colspan="3"><input type="number" min="0" id="fPjlOngkosAngkut" value="${row.ongkosAngkut||0}" ${dis} style="text-align:right;"></td></tr>
          <tr><td class="flabel">Jumlah</td><td colspan="3"><input type="text" id="fPjlJumlah" value="${pjlNum2(row.jumlahAkhir||0)}" disabled style="text-align:right;font-weight:700;"></td></tr>
          <tr><td class="flabel">Sisa Jumlah</td><td colspan="3"><input type="text" id="fPjlSisaJumlah" value="${pjlNum2(row.sisaJumlah||0)}" disabled style="text-align:right;font-weight:700;"></td></tr>
        </table>

        <div class="form-group" style="margin-top:18px;">
          <label>Surat Jalan</label>
          <input type="text" id="fPjlSuratJalan" value="${row.suratJalan||''}" disabled>
        </div>
      </div>
    </div>`;
}

/* Cetakan/preview Faktur Penjualan Langsung — kop DBM (pola sama
   persis tplPlPrintModal Pembelian Langsung, sisi Penjualan). */
function tplPjlPrintModal(row){
  const ho = DATA.cabangMaster[0] || {};
  const td = 'padding:4px 6px;font-size:11.5px;';
  const itemRows = (row.items||[]).map((it,i)=>`
    <tr>
      <td style="${td}text-align:center;">${i+1}</td>
      <td style="${td}">${it.kode||'-'}</td>
      <td style="${td}white-space:pre-line;">${it.nama||''}</td>
      <td style="${td}text-align:right;">${Number(it.qty||0).toLocaleString('id-ID')}</td>
      <td style="${td}text-align:center;">${it.um||''}</td>
      <td style="${td}text-align:right;">${pjlNum2(it.hna1)}</td>
      <td style="${td}text-align:right;">${pjlNum2(it.discBarang)}</td>
      <td style="${td}text-align:right;">${pjlNum2(it.jumlah)}</td>
    </tr>`).join('');
  return `
    <div class="modal-box" style="max-width:920px;width:96vw;">
      <div class="modal-header"><span>${icon('printer',15)} Cetak Penjualan Langsung — ${row.no}</span><span class="close" id="modalClose">&times;</span></div>
      <div class="modal-body" style="max-height:72vh;overflow:auto;">
        <div style="background:#fff;border:1px solid var(--border);padding:22px 26px;font-family:Arial,Helvetica,sans-serif;color:#111;">
          <div style="display:flex;gap:14px;align-items:flex-start;">
            <div style="width:64px;height:64px;border-radius:10px;background:var(--navy);color:#fff;display:flex;align-items:center;justify-content:center;font-weight:800;font-size:20px;">DBM</div>
            <div>
              <div style="font-weight:800;font-size:14px;">${(ho.namaPerusahaan||'PT Distriversa Buanamas').toUpperCase()}</div>
              <div style="font-size:11.5px;">${ho.alamat||''}, ${ho.kota||''} — Tlp: ${ho.telepon||''}</div>
            </div>
          </div>
          <div style="text-align:center;font-weight:800;font-size:15px;margin:12px 0;text-decoration:underline;">FAKTUR PENJUALAN LANGSUNG</div>
          <table style="border:none;font-size:11.5px;"><tbody>
            <tr><td style="${td}">No. Faktur</td><td style="${td}">: ${row.no}</td><td style="${td}padding-left:40px;">Customer</td><td style="${td}">: ${(row.customerNama||'').toUpperCase()}</td></tr>
            <tr><td style="${td}">Tgl. Faktur</td><td style="${td}">: ${row.tglFaktur||''}</td><td style="${td}padding-left:40px;">Surat Jalan</td><td style="${td}">: ${row.suratJalan||'-'}</td></tr>
            <tr><td style="${td}">Syarat Bayar</td><td style="${td}">: ${row.syaratBayar||''} (${pjlTipeTransaksi(row)})</td><td style="${td}padding-left:40px;">Tgl. Jth. Tempo</td><td style="${td}">: ${row.tglJatuhTempo||''}</td></tr>
            <tr><td style="${td}">Keterangan</td><td style="${td}" colspan="3">: ${row.keterangan||''}</td></tr>
          </tbody></table>
          <table style="width:100%;border-collapse:collapse;margin-top:10px;">
            <thead><tr style="border-top:2px solid #111;border-bottom:2px solid #111;">
              <th style="${td}width:34px;">No.</th><th style="${td}text-align:left;">Kode</th><th style="${td}text-align:left;">Nama Barang</th><th style="${td}text-align:right;">Qty</th><th style="${td}">U/M</th><th style="${td}text-align:right;">HNA1</th><th style="${td}text-align:right;">Disc</th><th style="${td}text-align:right;">Jumlah</th>
            </tr></thead>
            <tbody>${itemRows}</tbody>
          </table>
          <div style="border-top:2px solid #111;"></div>
          <div style="display:flex;justify-content:flex-end;margin-top:8px;">
            <table style="border:none;min-width:300px;font-size:11.5px;"><tbody>
              <tr><td style="${td}">DPP :</td><td style="${td}text-align:right;">${pjlNum2(row.dpp)}</td></tr>
              <tr><td style="${td}">PPN :</td><td style="${td}text-align:right;">${pjlNum2(row.ppn)}</td></tr>
              ${row.pphAmount ? `<tr><td style="${td}">PPh Dipotong :</td><td style="${td}text-align:right;">(${pjlNum2(row.pphAmount)})</td></tr>` : ''}
              ${row.ongkosAngkut ? `<tr><td style="${td}">Ongkos Angkut :</td><td style="${td}text-align:right;">${pjlNum2(row.ongkosAngkut)}</td></tr>` : ''}
              <tr style="border-top:2px solid #111;"><td style="${td}font-weight:800;">Jumlah :</td><td style="${td}text-align:right;font-weight:800;">${pjlNum2(row.jumlahAkhir)}</td></tr>
              ${Number(row.uangMukaPakai||0) ? `<tr><td style="${td}">Uang Muka Dipakai :</td><td style="${td}text-align:right;">(${pjlNum2(row.uangMukaPakai)})</td></tr>` : ''}
              <tr><td style="${td}">Sisa Jumlah :</td><td style="${td}text-align:right;">${pjlNum2(row.sisaJumlah)}</td></tr>
            </tbody></table>
          </div>
        </div>
      </div>
      <div class="modal-footer"><button class="btn-secondary" id="modalCancel">Tutup</button></div>
    </div>`;
}

/* Pickers & modal kecil. */
function tplPjlCustomerPicker(list){
  return `
    <div class="modal-box" style="max-width:640px;">
      <div class="modal-header"><span>Pilih Customer</span><span class="close" id="modalClose">&times;</span></div>
      <div class="modal-body">
        <input type="text" id="pjlCustomerPickerSearch" placeholder="Cari kode / nama customer..." style="width:100%;border:1px solid var(--border);border-radius:6px;padding:8px 10px;font-size:12.8px;margin-bottom:12px;">
        <div class="table-wrap" style="max-height:360px;overflow:auto;">
          <table>
            <thead><tr><th>Kode</th><th>Nama Customer</th><th>Kota</th><th></th></tr></thead>
            <tbody id="pjlCustomerPickerBody">${tplPjlCustomerPickerRows(list)}</tbody>
          </table>
        </div>
      </div>
      <div class="modal-footer"><button class="btn-secondary" id="modalCancel">Tutup</button></div>
    </div>`;
}
function tplPjlCustomerPickerRows(list){
  if(!list.length) return `<tr><td colspan="4" style="color:var(--text-light);">Tidak ada customer ditemukan</td></tr>`;
  return list.map(c=>`
    <tr><td>${c.kode}</td><td>${c.nama}</td><td>${c.kota||''}</td><td><button class="btn-pick" data-pjl-pick-customer="${c.kode}">Pilih</button></td></tr>`).join('');
}

function tplPjlPrincipalPicker(list){
  return `
    <div class="modal-box" style="max-width:640px;">
      <div class="modal-header"><span>Pilih Principal</span><span class="close" id="modalClose">&times;</span></div>
      <div class="modal-body">
        <input type="text" id="pjlPrincipalPickerSearch" placeholder="Cari kode / nama principal..." style="width:100%;border:1px solid var(--border);border-radius:6px;padding:8px 10px;font-size:12.8px;margin-bottom:12px;">
        <div class="table-wrap" style="max-height:360px;overflow:auto;">
          <table>
            <thead><tr><th>Kode</th><th>Nama Principal</th><th></th></tr></thead>
            <tbody id="pjlPrincipalPickerBody">${tplPjlPrincipalPickerRows(list)}</tbody>
          </table>
        </div>
      </div>
      <div class="modal-footer"><button class="btn-secondary" id="modalCancel">Tutup</button></div>
    </div>`;
}
function tplPjlPrincipalPickerRows(list){
  if(!list.length) return `<tr><td colspan="3" style="color:var(--text-light);">Tidak ada principal ditemukan</td></tr>`;
  return list.map(s=>`
    <tr><td>${s.kode}</td><td>${s.nama}</td><td><button class="btn-pick" data-pjl-pick-principal="${s.kode}">Pilih</button></td></tr>`).join('');
}

function tplPjlPphPicker(list){
  return `
    <div class="modal-box" style="max-width:400px;">
      <div class="modal-header"><span>Pilih PPh</span><span class="close" id="modalClose">&times;</span></div>
      <div class="modal-body">
        <div class="table-wrap"><table>
          <thead><tr><th>Kode PPh</th><th>Persen</th><th></th></tr></thead>
          <tbody>${list.map(p=>`<tr><td>${p.kode}</td><td>${p.persen}%</td><td><button class="btn-pick" data-pjl-pick-pph="${p.kode}" data-pjl-pick-persen="${p.persen}">Pilih</button></td></tr>`).join('')}</tbody>
        </table></div>
      </div>
      <div class="modal-footer"><button class="btn-secondary" id="modalCancel">Tutup</button></div>
    </div>`;
}

function tplPjlAkunPicker(list){
  return `
    <div class="modal-box" style="max-width:640px;">
      <div class="modal-header"><span>Pilih Akun GL</span><span class="close" id="modalClose">&times;</span></div>
      <div class="modal-body">
        <input type="text" id="pjlAkunPickerSearch" placeholder="Cari kode / nama akun..." style="width:100%;border:1px solid var(--border);border-radius:6px;padding:8px 10px;font-size:12.8px;margin-bottom:12px;">
        <div class="table-wrap" style="max-height:360px;overflow:auto;">
          <table>
            <thead><tr><th>Kode</th><th>Nama Akun</th><th>Kat.</th><th></th></tr></thead>
            <tbody id="pjlAkunPickerBody">${tplPjlAkunPickerRows(list)}</tbody>
          </table>
        </div>
      </div>
      <div class="modal-footer"><button class="btn-secondary" id="modalCancel">Tutup</button></div>
    </div>`;
}
function tplPjlAkunPickerRows(list){
  if(!list.length) return `<tr><td colspan="4" style="color:var(--text-light);">Tidak ada akun ditemukan</td></tr>`;
  return list.map(a=>`
    <tr><td>${a.kode}</td><td>${a.nama}</td><td>${a.kategori}</td><td><button class="btn-pick" data-pjl-pick-akun="${a.kode}">Pilih</button></td></tr>`).join('');
}

/* Modal input Multi Batch Number per baris barang — pola sama persis
   tplPlBatchModal Pembelian Langsung (1 string per item, mockup). */
function tplPjlBatchModal(item){
  return `
    <div class="modal-box" style="max-width:420px;">
      <div class="modal-header"><span>Multi Batch Number — ${item.kode||item.nama||''}</span><span class="close" id="modalClose">&times;</span></div>
      <div class="modal-body">
        <div class="form-group">
          <label>Batch Number</label>
          <input type="text" id="fPjlBatchInput" value="${item.batch||''}" placeholder="contoh: MB-2607-001">
        </div>
        <div style="font-size:11.5px;color:var(--text-light);margin-top:6px;">Mockup — pada aplikasi asli bisa lebih dari satu batch per baris.</div>
      </div>
      <div class="modal-footer">
        <button class="btn-secondary" id="modalCancel">Batal</button>
        <button class="btn-primary" id="pjlBatchOk">Simpan</button>
      </div>
    </div>`;
}

function tplPjlDeleteConfirm(row){
  return `
    <div class="modal-box">
      <div class="modal-header"><span>Hapus Penjualan Langsung</span><span class="close" id="modalClose">&times;</span></div>
      <div class="modal-body"><p>Yakin ingin menghapus Faktur <b>${row.no}</b> — ${(row.customerNama||'').toUpperCase()} (${pjlNum2(row.jumlahAkhir)})?</p></div>
      <div class="modal-footer">
        <button class="btn-secondary" id="modalCancel">Batal</button>
        <button class="btn-danger" id="modalDelete">Hapus</button>
      </div>
    </div>`;
}

function tplPjlInfoModal(title,text){
  return `
    <div class="modal-box">
      <div class="modal-header"><span>${title}</span><span class="close" id="modalClose">&times;</span></div>
      <div class="modal-body"><p>${text}</p></div>
      <div class="modal-footer"><button class="btn-primary" id="modalOk">Mengerti</button></div>
    </div>`;
}
