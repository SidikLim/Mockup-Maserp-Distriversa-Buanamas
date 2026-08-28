/* =========================================================
   TEMPLATE (HTML saja) — Faktur Penjualan Via S.J. (Customer &
   Penjualan > Daftar Transaksi > Penjualan Via S.J., key
   page:'fakturPenjualanSJ'). Semua fungsi di file ini HANYA
   menyusun & mengembalikan markup HTML (string) atau konstanta/
   helper murni, TIDAK ada DOM-binding di sini. Logic-nya ada di
   file sebelah: faktur-penjualan-sj.js

   Faktur Penjualan Via S.J. adalah TAHAP LANJUTAN dari Invoice
   (lihat komentar panjang di atas DATA.fakturPenjualanSJ &
   DATA.invoices, js/data.js): setiap baris di-chain 1:1 ke 1 baris
   DATA.invoices ("Dari S.J." = invoices[i].noSJ, "Dari Sales Order"
   = invoices[i].noSO). Sebelumnya menu ini cuma placeholder generik
   (`page:'placeholder'` di js/menu.js) — sekarang CRUD PENUH dengan
   form FULL PAGE, pola paling mirip Invoice (dual-picker ke 1 fungsi
   apply bersama, tab switcher .inv-tabs/.inv-tab-btn) DIGABUNG
   dengan pola tabel-item-reaktif + panel PPN/Pph Purchase Order
   (poRecalcItem/poRefreshItemRowDOM/PO_PPH_LIST-style picker) —
   lihat js/pages/invoice.* & js/pages/purchase-order.* sebagai
   acuan idiom yang ditiru persis di sini dengan prefix FKT_/fkt.

   PERBEDAAN DARI Invoice: sumber picker "Dari Sales Order" MAUPUN
   "Dari S.J." di sini SAMA-SAMA DATA.invoices (bukan DATA.salesOrders/
   DATA.pickingList terpisah) — karena tiap baris Invoice sudah
   membawa noSO+noSJ+Customer+Principal+item sekaligus, jadi 1 sumber
   data sudah cukup untuk mengisi seluruh field turunan lewat 1 fungsi
   bersama fktApplyInvoice() (persis pola invApplyPickingList(), cuma
   sumbernya diganti). Field baru yang belum ada di modul manapun
   sebelumnya: Kernet (picker sederhana atas DATA.kernetList, pola
   identik Driver), dan panel "Uang Muka" (radio Tertua/Pilih uang
   muka + Sisa U.Muka/Pakai, TANPA ledger uang muka sungguhan di
   mockup ini — Sisa U.Muka statis dari data, Pakai murni angka bebas
   yang ikut dikurangkan ke Sisa Jumlah).
========================================================= */

/* 8 cabang yang SAMA dengan Invoice/Picking List/Purchase Order/dst
   (urutan sesuai spesifikasi modul ini, kode sama). */
const FKT_CABANG_LIST = ['Head Office','Surabaya','Bandung','Tangerang','Medan','Makassar','Semarang','Sidoarjo'];
const FKT_CABANG_CODE = {'Head Office':'HO','Surabaya':'SBY','Bandung':'BDG','Tangerang':'TGR','Medan':'MDN','Makassar':'MKS','Semarang':'SMG','Sidoarjo':'SDA'};

/* Disalin verbatim dari INV_SYARAT_BAYAR_LIST (invoice.template.js). */
const FKT_SYARAT_BAYAR_LIST = ['CBD','Kredit 14 Hari','Kredit 30 Hari','Kredit 45 Hari','Kredit 60 Hari'];

/* Value radio PPN dibuat SAMA PERSIS dengan string yang sudah dipakai
   di field row.tipePpn pada DATA.fakturPenjualanSJ ("PPN Eksklusif(+11%)"
   dkk) — supaya tidak perlu lapisan mapping value<->label terpisah,
   row.tipePpn langsung menyimpan salah satu string di list ini. */
const FKT_PPN_LIST = ['Tidak ada PPN','PPN Tidak Dipungut Pajak','PPN Inklusif','PPN Eksklusif(+11%)'];

/* Disalin persis dari PO_PPH_LIST (purchase-order.template.js), cuma
   nama konstanta diberi prefix FKT_ — 3 kode PPh yang sama dipakai
   ulang (Dipotong, bukan Dipungut seperti di PO, tapi daftar kode &
   persennya identik sesuai instruksi). */
const FKT_PPH_LIST = [
  {kode:'PPH 22 (0.3)', persen:0.3},
  {kode:'PPH 23 (2)', persen:2},
  {kode:'PPH 4(2) (2.5)', persen:2.5},
];

const FKT_UANG_MUKA_LIST = ['Tertua','Pilih uang muka'];
const FKT_ALAMAT_TIPE_LIST = ['Alamat Customer'];

/* ===== Helper murni tanggal (belum ada helper generik serupa di
   modul lain — dibuat lokal di sini, dipakai bersama oleh template &
   logic). Format tanggal di seluruh mockup ini selalu string "DD/MM/YYYY". ===== */
function fktParseTglID(str){
  if(!str) return null;
  const parts = String(str).split('/');
  if(parts.length !== 3) return null;
  const d = +parts[0], m = +parts[1], y = +parts[2];
  if(!d || !m || !y) return null;
  return new Date(y, m - 1, d);
}
function fktFormatTglID(date){
  const d = String(date.getDate()).padStart(2, '0');
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const y = date.getFullYear();
  return `${d}/${m}/${y}`;
}
/* Tgl. Jth. Tempo = Tgl. Faktur + N hari kredit dari Syarat Bayar
   ("Kredit N Hari" -> +N hari; "CBD" -> 0 hari/hari yang sama) —
   dipakai form Tambah tiap kali Tgl. Faktur atau Syarat Bayar
   berubah (lihat komentar DATA.fakturPenjualanSJ di js/data.js,
   angka N-hari ini yang dipakai menghitung manual seluruh 8 baris
   sample lewat Node sekali supaya konsisten dengan helper ini). */
function fktJatuhTempo(tglFaktur, syaratBayar){
  const dt = fktParseTglID(tglFaktur);
  if(!dt) return '';
  const match = /Kredit\s+(\d+)\s+Hari/i.exec(syaratBayar || '');
  const hari = match ? (+match[1]) : 0;
  dt.setDate(dt.getDate() + hari);
  return fktFormatTglID(dt);
}

function tplFakturPenjualanSJListPage(){
  return `
    <div class="breadcrumb">Home / <b>Penjualan Via S.J.</b></div>
    <div class="card">
      <div class="card-header dark-header">
        <h3>${icon('invoice',15)} Daftar Faktur Penjualan Via S.J.</h3>
        <div class="toolbar-actions">
          <select class="chip-btn" id="fktFilterAll"><option>All</option></select>
          <select class="chip-btn" id="fktFilterPeriod"><option>Agustus 2026</option></select>
          <button class="btn-primary" id="btnFktAdd">${icon('plus',14)} Tambah</button>
        </div>
      </div>
      <div class="table-toolbar">
        <select id="fktPageSize"><option selected>10</option><option>25</option><option>50</option></select>
        <input type="text" id="fktSearch" placeholder="Pencarian Global">
      </div>
      <div class="table-wrap"><table>
        <thead><tr>
          <th>No. Faktur</th>
          <th>No. Packing</th>
          <th>No. S.J.</th>
          <th>No. S.O.</th>
          <th>Tgl. Faktur</th>
          <th>Customer</th>
          <th>Tipe Transaksi</th>
          <th class="text-right">Jumlah Akhir</th>
          <th>P.O. Customer</th>
          <th>Attach</th>
          <th>Kwitansi</th>
          <th>Lihat</th>
          <th>Cetak</th>
          <th>Ubah</th>
          <th>Hapus</th>
        </tr></thead>
        <tbody id="fktTbody"></tbody>
      </table></div>
      <div class="table-footer"><div class="pager"><button>First</button><button>Previous</button><button class="active">1</button><button>Next</button><button>Last</button></div><div id="fktTotal"></div></div>
    </div>`;
}

function tplFktRows(rows){
  if(!rows.length) return `<tr><td colspan="15" style="color:var(--text-light);">Tidak ada data Faktur Penjualan Via S.J.</td></tr>`;
  return rows.map((r,i)=>`
    <tr>
      <td><b style="color:var(--blue);">${r.no}</b><br><span style="font-size:11px;color:var(--text-light);">${r.tglInput||''}</span></td>
      <td>${r.noPacking || '-'}</td>
      <td>${r.dariSJ || ''}</td>
      <td>${r.dariSO || ''}</td>
      <td>${r.tglFaktur || ''}</td>
      <td><b>${r.customerNama || ''}</b><br><span style="font-size:11px;color:var(--text-light);">${r.customerKode || ''}</span></td>
      <td>${r.tipeTransaksi || ''}</td>
      <td class="text-right">${num(r.jumlahAkhir||0)}</td>
      <td>${r.poCustomer || ''}</td>
      <td><button class="icon-btn print" data-attach="${i}" title="Attach">${icon('file',15)}</button></td>
      <td><button class="icon-btn print" data-kwitansi="${i}" title="Kwitansi">${icon('cash',15)}</button></td>
      <td><button class="icon-btn view" data-view="${i}" title="Lihat">${icon('eye',15)}</button></td>
      <td><button class="icon-btn print" data-cetak="${i}" title="Cetak">${icon('printer',15)}</button></td>
      <td><button class="icon-btn edit" data-edit="${i}" title="Ubah">${icon('edit',15)}</button></td>
      <td><button class="icon-btn del" data-del="${i}" title="Hapus">${icon('trash',15)}</button></td>
    </tr>`).join('');
}

/* ===== Baris tabel item — reaktif (Qty Physical/Disc Principal%/Disc
   Distributor% memicu fktRecalcItem()+fktRefreshItemRowDOM(), pola
   sama seperti poRecalcItem()/poRefreshItemRowDOM() di Purchase
   Order). Drag-handle di kolom pertama DEKORATIF murni (belum ada
   modul manapun di mockup ini yang re-order baris item sungguhan —
   sama seperti PO/SO), begitu juga Kode Promosi (teks tampilan saja,
   BUKAN picker interaktif — lihat catatan di atas DATA.fakturPenjualanSJ:
   cuma 1 dari 8 baris sample yang benar-benar match promo). ===== */
function tplFktItemRow(item, idx, dis){
  return `
    <tr data-fkt-item-row="${idx}">
      <td style="width:24px;text-align:center;color:var(--text-light);cursor:grab;" title="Urutan (dekoratif)">&#8942;&#8942;</td>
      <td style="text-align:center;"><input type="checkbox" data-fkt-ppn="${idx}" ${item.ppnChecked?'checked':''} ${dis}></td>
      <td style="min-width:120px;">
        <div class="input-with-btn">
          <input type="text" data-fkt-kode="${idx}" value="${item.kode||''}" placeholder="Kode" readonly>
          ${!dis ? `<button type="button" class="icon-btn edit" data-fkt-item-search="${idx}" title="Cari Barang">${icon('search',13)}</button>` : ''}
        </div>
      </td>
      <td style="min-width:170px;"><input type="text" data-fkt-nama="${idx}" value="${item.nama||''}" disabled></td>
      <td style="min-width:140px;"><input type="text" data-fkt-keterangan="${idx}" value="${item.keterangan||''}" ${dis}></td>
      <td style="width:90px;"><input type="number" min="0" data-fkt-qty="${idx}" value="${item.qtyPhysical||0}" ${dis}></td>
      <td style="width:70px;"><input type="text" data-fkt-um="${idx}" value="${item.um||''}" disabled></td>
      <td style="width:100px;"><input type="text" data-fkt-hna="${idx}" value="${num(item.hna||0)}" disabled></td>
      <td style="width:100px;"><input type="text" data-fkt-hna1="${idx}" value="${num(item.hna1||0)}" disabled></td>
      <td style="width:90px;"><input type="number" min="0" data-fkt-discp="${idx}" value="${item.discPrincipal||0}" ${dis}></td>
      <td style="width:90px;"><input type="number" min="0" data-fkt-discd="${idx}" value="${item.discDistributor||0}" ${dis}></td>
      <td style="width:90px;"><input type="number" data-fkt-totaldisc="${idx}" value="${item.totalDisc||0}" disabled></td>
      <td style="width:110px;"><input type="text" data-fkt-discbarang="${idx}" value="${num(item.discBarang||0)}" disabled></td>
      <td style="width:130px;"><input type="text" data-fkt-jumlah="${idx}" value="${num(item.jumlah||0)}" disabled></td>
      <td style="min-width:130px;"><input type="text" data-fkt-promosi="${idx}" value="${item.kodePromosi||''}" disabled></td>
      <td style="width:34px;">${!dis ? `<button type="button" class="icon-btn del" data-fkt-item-del="${idx}" title="Hapus Baris">${icon('trash',13)}</button>` : ''}</td>
    </tr>`;
}

function tplFktJurnalPlaceholder(){
  return `
    <div class="placeholder-box" style="padding:36px 20px;">
      <div class="pico">${icon('book',36)}</div>
      <h3 style="font-size:14px;font-weight:700;color:#5b6178;">Rincian Jurnal Akun</h3>
      <p>Preview jurnal akun (debit/kredit) hasil posting Faktur Penjualan Via S.J. ini akan tersedia di sini pada versi lengkap.</p>
    </div>`;
}

function tplFktForm(mode, row){
  const isAdd = mode === 'add';
  const isView = mode === 'view';
  const isEdit = !isAdd && !isView;
  const dis = isView ? 'disabled' : '';
  const titleAction = isAdd ? 'Tambah' : (isView ? 'Lihat' : 'Ubah');
  const headerIcon = isAdd ? 'plus' : (isView ? 'eye' : 'edit');
  const ppnShowSub = (row.tipePpn === 'PPN Inklusif' || row.tipePpn === 'PPN Eksklusif(+11%)');
  return `
    <div class="breadcrumb">Home / Penjualan Via S.J. / <b>${titleAction}</b></div>
    <div class="card">
      <div class="card-header dark-header">
        <h3>${icon(headerIcon,15)} ${isAdd?'+ Penjualan Via S.J.':'Penjualan Via S.J.'}</h3>
        ${!isView ? `<button class="btn-danger" id="btnFktTutorial" type="button">${icon('card',14)} Tutorial</button>` : ''}
      </div>
      <div class="card-body">

        <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:16px;">
          <table class="field-table">
            <tr>
              <td class="flabel">Cabang</td>
              <td><select id="fFktCabang" ${(isView||!isAdd)?'disabled':''}>${FKT_CABANG_LIST.map(c=>`<option ${row.cabang===c?'selected':''}>${c}</option>`).join('')}</select></td>
            </tr>
            <tr>
              <td class="flabel">No. Faktur</td>
              <td><input type="text" id="fFktNoFaktur" value="${row.no||''}" disabled></td>
            </tr>
            <tr>
              <td class="flabel">Tgl. Faktur</td>
              <td>
                <div class="input-with-btn">
                  <input type="text" id="fFktTglFaktur" value="${row.tglFaktur||''}" ${dis}>
                  <span class="icon-btn edit" style="pointer-events:none;">${icon('calendar',13)}</span>
                </div>
              </td>
            </tr>
            <tr>
              <td class="flabel">Syarat Bayar</td>
              <td><select id="fFktSyaratBayar" ${dis}>${FKT_SYARAT_BAYAR_LIST.map(s=>`<option ${row.syaratBayar===s?'selected':''}>${s}</option>`).join('')}</select></td>
            </tr>
            <tr>
              <td class="flabel">Tgl. Jth. Tempo</td>
              <td><input type="text" id="fFktTglJthTempo" value="${row.tglJatuhTempo||''}" disabled></td>
            </tr>
            <tr>
              <td class="flabel">Dari Sales Order</td>
              <td>
                <div class="input-with-btn">
                  <input type="text" id="fFktDariSO" value="${row.dariSO||''}" placeholder="Pilih Sales Order" readonly>
                  ${!isView ? `<button type="button" class="icon-btn edit" id="fktSoSearch" title="Cari Sales Order">${icon('search',13)}</button>` : ''}
                </div>
                <div id="fFktAlamatPreview" style="font-size:11px;color:var(--text-light);margin-top:4px;">${row.customerAlamat||''}</div>
              </td>
            </tr>
            <tr>
              <td class="flabel">Dari S.J.</td>
              <td>
                <div class="input-with-btn">
                  <input type="text" id="fFktDariSJ" value="${row.dariSJ||''}" placeholder="Pilih S.J." readonly>
                  ${!isView ? `<button type="button" class="icon-btn edit" id="fktSjSearch" title="Cari S.J.">${icon('search',13)}</button>` : ''}
                </div>
              </td>
            </tr>
            <tr>
              <td class="flabel">No DSC</td>
              <td><input type="text" id="fFktNoDSC" value="${row.noDSC||''}" disabled></td>
            </tr>
            <tr>
              <td class="flabel">Principal</td>
              <td><input type="text" id="fFktPrincipal" value="${row.principalNama||''}" disabled></td>
            </tr>
            <tr>
              <td class="flabel">No. Retur Sj</td>
              <td><input type="text" id="fFktNoReturSj" value="${row.noReturSJ||''}" disabled></td>
            </tr>
            <tr>
              <td class="flabel">No. Packing</td>
              <td><input type="text" id="fFktNoPacking" value="${row.noPacking||''}" disabled></td>
            </tr>
          </table>

          <table class="field-table">
            <tr>
              <td class="flabel">No SP</td>
              <td><input type="text" id="fFktNoSP" value="${row.noSP||''}" disabled></td>
            </tr>
            <tr>
              <td class="flabel">Tgl SP</td>
              <td><input type="text" id="fFktTglSP" value="${row.tglSP||''}" disabled></td>
            </tr>
            <tr>
              <td class="flabel">Jurnal</td>
              <td><select id="fFktJurnal" ${dis}>${DATA.jurnalPenjualan.map(j=>`<option ${row.jurnal===j.nama?'selected':''}>${j.nama}</option>`).join('')}</select></td>
            </tr>
            <tr>
              <td class="flabel">Salesman</td>
              <td>
                <div class="input-with-btn">
                  <input type="text" id="fFktSalesman" value="${row.salesman||''}" placeholder="Pilih Salesman" readonly>
                  ${!isView ? `<button type="button" class="icon-btn edit" id="fktSalesmanSearch" title="Cari Salesman">${icon('search',13)}</button>` : ''}
                </div>
              </td>
            </tr>
            <tr>
              <td class="flabel">P.O. Customer</td>
              <td><input type="text" id="fFktPoCustomer" value="${row.poCustomer||''}" placeholder="No. P.O. Customer" ${dis}></td>
            </tr>
            <tr>
              <td class="flabel">Driver</td>
              <td>
                <div class="input-with-btn">
                  <input type="text" id="fFktDriver" value="${row.driver||''}" placeholder="Pilih Driver" readonly>
                  ${!isView ? `<button type="button" class="icon-btn edit" id="fktDriverSearch" title="Cari Driver">${icon('search',13)}</button>` : ''}
                </div>
              </td>
            </tr>
            <tr>
              <td class="flabel">Kernet</td>
              <td>
                <div class="input-with-btn">
                  <input type="text" id="fFktKernet" value="${row.kernet||''}" placeholder="Pilih Kernet" readonly>
                  ${!isView ? `<button type="button" class="icon-btn edit" id="fktKernetSearch" title="Cari Kernet">${icon('search',13)}</button>` : ''}
                </div>
              </td>
            </tr>
          </table>

          <table class="field-table">
            <tr>
              <td class="flabel">Alamat Pengiriman</td>
              <td>
                <select id="fFktAlamatTipe" style="display:block;width:100%;" ${dis}>${FKT_ALAMAT_TIPE_LIST.map(a=>`<option ${row.alamatPengirimanTipe===a?'selected':''}>${a}</option>`).join('')}</select>
                <textarea id="fFktAlamatPengiriman" class="po-textarea" rows="2" style="display:block;width:100%;margin-top:6px;" ${dis}>${row.alamatPengiriman||''}</textarea>
              </td>
            </tr>
            <tr>
              <td class="flabel">Tanggal batas Retur</td>
              <td>
                <div class="input-with-btn">
                  <input type="text" id="fFktTglBatasRetur" value="${row.tglBatasRetur||''}" placeholder="dd/mm/yyyy" ${dis}>
                  <span class="icon-btn edit" style="pointer-events:none;">${icon('calendar',13)}</span>
                </div>
              </td>
            </tr>
            <tr>
              <td class="flabel">Tipe Layanan</td>
              <td><select id="fFktTipeLayanan" ${dis}>${DATA.layananList.map(l=>`<option ${row.tipeLayanan===l?'selected':''}>${l}</option>`).join('')}</select></td>
            </tr>
          </table>
        </div>

        <div class="inv-tabs">
          <button type="button" class="inv-tab-btn active" id="fktTabTransaksiBtn">Rincian Transaksi</button>
          <button type="button" class="inv-tab-btn" id="fktTabJurnalBtn">Rincian Jurnal Akun</button>
        </div>

        <div id="fktTabTransaksiContent">
          <div class="card-header dark-header" style="border-radius:6px;margin:0 0 14px;">
            <h3>${icon('clipboard',14)} Rincian Barang</h3>
          </div>
          <div class="table-wrap" style="margin:6px 0 6px;">
            <table class="po-item-table">
              <thead><tr>
                <th></th>
                <th>Ppn</th>
                <th>Kode Barang</th>
                <th>Nama Barang</th>
                <th>Keterangan</th>
                <th>Qty Physical</th>
                <th>U/M</th>
                <th class="text-right">HNA</th>
                <th class="text-right">HNA1</th>
                <th class="text-right">Disc Principal%</th>
                <th class="text-right">Disc Distributor%</th>
                <th class="text-right">Total Disc%</th>
                <th class="text-right">Disc/Barang</th>
                <th class="text-right">Jumlah</th>
                <th>Kode Promosi</th>
                <th></th>
              </tr></thead>
              <tbody id="fktItemsBody">${row.items.map((it,idx)=>tplFktItemRow(it,idx,dis)).join('')}</tbody>
            </table>
          </div>
          ${!isView ? `<a href="#" id="fktAddItem" class="link-add">${icon('plus',13)} Tambah Item Baru</a>` : ''}
          <div id="fktItemsEmptyHint" style="font-size:11.5px;color:var(--text-light);margin-top:6px;${row.items.length?'display:none;':''}">Belum ada barang — pilih Dari Sales Order atau Dari S.J. terlebih dahulu, atau tambah baris manual.</div>

          <div class="form-grid" style="margin-top:22px;">
            <div>
              <div class="form-section">Informasi PPN</div>
              <div class="radio-group">
                ${FKT_PPN_LIST.map(p=>`<label><input type="radio" name="fktPpnMode" value="${p}" ${row.tipePpn===p?'checked':''} ${dis}> ${p}</label>`).join('')}
              </div>
              <div id="fktPpnSubfields" style="margin-top:14px;${ppnShowSub?'':'display:none;'}">
                <table class="field-table">
                  <tr><td class="flabel">Mata Uang</td><td><input type="text" id="fFktMataUangPajak" value="${row.mataUang||'Rupiah (IDR)'}" disabled></td></tr>
                  <tr><td class="flabel">Kurs Pajak</td><td><input type="number" id="fFktKursPajak" value="${row.kursPajak||0}" ${dis}></td></tr>
                  <tr><td class="flabel">Tgl. Faktur Pajak</td><td><input type="text" id="fFktTglFakturPajak" value="${row.tglFakturPajak||''}" ${dis}></td></tr>
                  <tr><td class="flabel">Kode Pajak</td><td><select id="fFktKodePajak" ${dis}>${DATA.kodePajakList.map(k=>`<option ${row.kodePajak===k?'selected':''}>${k}</option>`).join('')}</select></td></tr>
                  <tr><td class="flabel">No Faktur Pajak</td><td><input type="text" id="fFktNoFakturPajak" value="${row.noFakturPajak||''}" disabled></td></tr>
                </table>
              </div>
            </div>
            <div>
              <div class="form-section">Rincian Transaksi</div>
              <table class="field-table po-rincian-table">
                <tr><td class="flabel">Mata Uang</td><td><input type="text" id="fFktMataUang" value="${row.mataUang||'Rupiah (IDR)'}" disabled></td><td class="flabel">Kurs</td><td><input type="text" id="fFktKurs" value="${Number(row.kurs||1).toFixed(2)}" disabled></td></tr>
                <!-- 2026-08-28 — Diskon Global 1 & 2 di-upgrade: nilai bisa
                     %/nominal (select unit) dan dihitung BERTINGKAT (Diskon
                     Global 2 dari sisa setelah Diskon Global 1) — lihat
                     fktRecalcTotals() di faktur-penjualan-sj.js. -->
                <tr><td class="flabel">Diskon Global 1</td><td>
                    <div style="display:flex;gap:6px;">
                      <input type="number" min="0" id="fFktDiskon1" value="${row.diskon1||0}" ${dis} style="width:110px;flex:0 0 auto;">
                      <select id="fFktDiskon1Unit" style="width:auto;" ${dis}>
                        <option value="%" ${row.diskon1Unit!=='Rp'?'selected':''}>%</option>
                        <option value="Rp" ${row.diskon1Unit==='Rp'?'selected':''}>Rp</option>
                      </select>
                    </div>
                  </td><td></td><td><input type="text" id="fFktDiskon1Rp" value="${num(row.diskon1Amount||0)}" disabled></td></tr>
                <tr><td class="flabel">Diskon Global 2 <span style="font-weight:400;font-size:10.5px;color:var(--text-light);">(dari sisa setelah DG1)</span></td><td>
                    <div style="display:flex;gap:6px;">
                      <input type="number" min="0" id="fFktDiskon2" value="${row.diskon2||0}" ${dis} style="width:110px;flex:0 0 auto;">
                      <select id="fFktDiskon2Unit" style="width:auto;" ${dis}>
                        <option value="%" ${row.diskon2Unit!=='Rp'?'selected':''}>%</option>
                        <option value="Rp" ${row.diskon2Unit==='Rp'?'selected':''}>Rp</option>
                      </select>
                    </div>
                  </td><td></td><td><input type="text" id="fFktDiskon2Rp" value="${num(row.diskon2Amount||0)}" disabled></td></tr>
                <tr><td class="flabel">DPP</td><td colspan="3"><input type="text" id="fFktDpp" value="${num(row.dpp||0)}" disabled></td></tr>
                <tr><td class="flabel">Pajak 11%</td><td><input type="text" id="fFktPajak11" value="${row.pajak11||''}" disabled></td><td></td><td><input type="text" id="fFktPpnAmount" value="${num(row.ppn||0)}" disabled></td></tr>
                <tr><td class="flabel">Pph Dipotong</td><td>
                    <div class="input-with-btn">
                      <input type="text" id="fFktPphKode" value="${row.pphKode||''}" placeholder="Tidak ada" readonly>
                      ${!isView ? `<button type="button" class="icon-btn edit" id="fktPphSearch" title="Cari PPh">${icon('search',13)}</button>
                      <button type="button" class="icon-btn del" id="fktPphClear" title="Hapus">${icon('trash',13)}</button>` : ''}
                    </div>
                  </td><td style="font-size:11.5px;color:var(--text-light);white-space:nowrap;">${row.pphKode? (row.pphPersen+'%') : ''}</td><td><input type="text" id="fFktPphAmount" value="${num(row.pphAmount||0)}" disabled></td></tr>
                <tr><td class="flabel">Ongkos Angkut</td><td colspan="3"><input type="number" id="fFktOngkosAngkut" value="${row.ongkosAngkut||0}" ${dis}></td></tr>
                <tr><td class="flabel">Jumlah</td><td colspan="3"><input type="text" id="fFktJumlahAkhir" value="${num(row.jumlahAkhir||0)}" disabled style="font-weight:700;font-size:14px;"></td></tr>
                <tr><td class="flabel">Sisa Jumlah</td><td colspan="3"><input type="text" id="fFktSisaJumlah" value="${num(row.sisaJumlah||0)}" disabled></td></tr>
              </table>
            </div>
          </div>

          <div class="form-section">Uang Muka</div>
          <div class="radio-group">
            ${FKT_UANG_MUKA_LIST.map(u=>`<label><input type="radio" name="fktUangMukaTipe" value="${u}" ${row.uangMukaTipe===u?'checked':''} ${dis}> ${u}</label>`).join('')}
          </div>
          <table class="field-table" style="max-width:420px;margin-top:12px;">
            <tr><td class="flabel">Sisa U.Muka</td><td><input type="text" id="fFktSisaUangMuka" value="${num(row.sisaUangMuka||0)}" disabled></td></tr>
            <tr><td class="flabel">Pakai</td><td><input type="number" id="fFktUangMukaPakai" value="${row.uangMukaPakai||0}" ${dis}></td></tr>
          </table>
        </div>
        <div id="fktTabJurnalContent" style="display:none;">${tplFktJurnalPlaceholder()}</div>

        <table class="field-table" style="margin-top:18px;">
          <tr>
            <td class="flabel">Keterangan</td>
            <td><textarea id="fFktKeterangan" class="po-textarea" rows="2" ${dis}>${row.keterangan||''}</textarea></td>
          </tr>
        </table>

        <div style="font-size:11.8px;color:var(--text-light);margin-top:8px;line-height:1.7;">
          ${row.tglInput ? `Tgl. Input : ${row.tglInput}  User Entry : ${row.userInput||''}<br>` : ''}
          ${row.tglEdit ? `Tgl Edit : ${row.tglEdit}  User Edit : ${row.userEdit||''}` : ''}
        </div>

        <div class="form-page-actions">
          ${isView
            ? `<a href="#" id="fktTutup" class="link-add" style="margin-right:auto;">&larr; Kembali ke Daftar</a>`
            : `<a href="#" id="fktBatalkan" class="link-add" style="margin-right:auto;">Batalkan</a>
               ${isEdit ? `<button class="btn-teal" id="fktPerbaharuiKurs" type="button">Perbaharui Kurs</button>
               <button class="btn-teal" id="fktCetak" type="button">${icon('printer',13)} Cetak</button>` : ''}
               <button class="btn-primary" id="fktSimpan">Simpan</button>`}
        </div>
      </div>
    </div>`;
}

function tplFktDeleteConfirm(row){
  return `
    <div class="modal-box">
      <div class="modal-header"><span>Hapus Faktur Penjualan Via S.J.</span><span class="close" id="modalClose">&times;</span></div>
      <div class="modal-body"><p>Yakin ingin menghapus Faktur Penjualan Via S.J. <b>${row.no}</b>?</p></div>
      <div class="modal-footer">
        <button class="btn-secondary" id="modalCancel">Batal</button>
        <button class="btn-danger" id="modalDelete">Hapus</button>
      </div>
    </div>`;
}

function tplFktInfoModal(title,text){
  return `
    <div class="modal-box">
      <div class="modal-header"><span>${title}</span><span class="close" id="modalClose">&times;</span></div>
      <div class="modal-body"><p>${text}</p></div>
      <div class="modal-footer">
        <button class="btn-primary" id="modalOk">Mengerti</button>
      </div>
    </div>`;
}

/* Picker "Dari Sales Order" / "Dari S.J." — DUA-DUANYA atas
   DATA.invoices (lihat catatan header file ini), dibedakan cuma
   lewat judul modal & kolom yang ditonjolkan. Isi persis sama,
   dipakai ulang lewat 1 fungsi template. */
function tplFktInvoicePicker(list, title){
  return `
    <div class="modal-box" style="max-width:640px;">
      <div class="modal-header"><span>${title}</span><span class="close" id="modalClose">&times;</span></div>
      <div class="modal-body">
        <div class="table-wrap" style="max-height:340px;overflow:auto;"><table>
          <thead><tr><th>No. S.O.</th><th>No. S.J.</th><th>Customer</th><th>Cabang</th><th></th></tr></thead>
          <tbody>${list.length ? list.map(inv=>`<tr><td>${inv.noSO||''}</td><td>${inv.noSJ||''}</td><td>${inv.customerNama||''}</td><td>${inv.cabang||''}</td><td><button class="btn-pick" data-pick-inv="${inv.no}">Pilih</button></td></tr>`).join('') : `<tr><td colspan="5" style="color:var(--text-light);">Tidak ada Invoice</td></tr>`}</tbody>
        </table></div>
      </div>
      <div class="modal-footer"><button class="btn-secondary" id="modalCancel">Tutup</button></div>
    </div>`;
}

function tplFktSalesmanPicker(list){
  return `
    <div class="modal-box" style="max-width:420px;">
      <div class="modal-header"><span>Pilih Salesman</span><span class="close" id="modalClose">&times;</span></div>
      <div class="modal-body">
        <div class="table-wrap" style="max-height:340px;overflow:auto;"><table>
          <thead><tr><th>Nama Salesman</th><th>Area</th><th></th></tr></thead>
          <tbody>${list.map(s=>`<tr><td>${s.nama}</td><td>${s.area||''}</td><td><button class="btn-pick" data-pick-salesman="${s.nama}">Pilih</button></td></tr>`).join('')}</tbody>
        </table></div>
      </div>
      <div class="modal-footer"><button class="btn-secondary" id="modalCancel">Tutup</button></div>
    </div>`;
}

function tplFktDriverPicker(list){
  return `
    <div class="modal-box" style="max-width:420px;">
      <div class="modal-header"><span>Pilih Driver</span><span class="close" id="modalClose">&times;</span></div>
      <div class="modal-body">
        <div class="table-wrap" style="max-height:340px;overflow:auto;"><table>
          <thead><tr><th>Driver</th><th></th></tr></thead>
          <tbody>${list.map(d=>`<tr><td>${d}</td><td><button class="btn-pick" data-pick-driver="${d}">Pilih</button></td></tr>`).join('')}</tbody>
        </table></div>
      </div>
      <div class="modal-footer"><button class="btn-secondary" id="modalCancel">Tutup</button></div>
    </div>`;
}

/* Picker Kernet — pola IDENTIK Driver, sumbernya DATA.kernetList
   (BARU, lihat js/data.js), belum ada modul Master Kernet tersendiri. */
function tplFktKernetPicker(list){
  return `
    <div class="modal-box" style="max-width:420px;">
      <div class="modal-header"><span>Pilih Kernet</span><span class="close" id="modalClose">&times;</span></div>
      <div class="modal-body">
        <div class="table-wrap" style="max-height:340px;overflow:auto;"><table>
          <thead><tr><th>Kernet</th><th></th></tr></thead>
          <tbody>${list.map(k=>`<tr><td>${k}</td><td><button class="btn-pick" data-pick-kernet="${k}">Pilih</button></td></tr>`).join('')}</tbody>
        </table></div>
      </div>
      <div class="modal-footer"><button class="btn-secondary" id="modalCancel">Tutup</button></div>
    </div>`;
}

/* tplFktItemPicker()/tplFktItemPickerRows() DIHAPUS sejak 2026-08-12
   lanjutan lagi — digantikan popup "Daftar Persediaan" bersama
   (openPersediaanPicker()/tplPersediaanPickerModal() di js/core.js),
   dipanggil langsung dari openFktItemPicker() di faktur-penjualan-sj.js. */

function tplFktPphPicker(list){
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
