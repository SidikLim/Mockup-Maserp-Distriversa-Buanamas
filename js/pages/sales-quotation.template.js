/* =========================================================
   TEMPLATE (HTML saja) — Sales Quotation (Customer & Penjualan >
   Daftar Transaksi). Semua fungsi di file ini HANYA menyusun &
   mengembalikan markup HTML (string), TIDAK ada logic/DOM-binding
   di sini. Logic-nya ada di file sebelah: sales-quotation.js

   Modul ini adalah TAHAP PALING AWAL dari rantai transaksi Customer &
   Penjualan (Sales Quotation → Sales Order → Picking List → Invoice →
   Penjualan Via S.J.) — dibangun mengikuti pola Sales Order (form full
   page, kalkulasi reaktif per baris + total dokumen) karena field &
   tabel rincian barangnya juga sangat banyak.

   Field yang sengaja disederhanakan dari 2 screenshot MASERP yang
   dikirim user (list "Sales Quotation" kosong "Tidak Ada Data" + form
   "+ Sales Quotation"), didokumentasikan di sini supaya jelas mana
   interpretasi vs mana yang 1:1 dari screenshot:
   - "SO / Area", "Layanan" (+ Gudang) digabung jadi 1 label dengan 2
     dropdown berdampingan (`.field-pair`) — persis tampilan screenshot.
   - "Rayon" (Kode/Nama/District) & "GROUP / ID" (2x Kode) ditampilkan
     sebagai kotak readonly abu-abu yang OTOMATIS terisi begitu Customer
     dipilih (lihat SQ_RAYON_BY_KOTA & sqGroupIdForCustomer() di
     sales-quotation.js) — data rayon per-kota & pemetaan Group/ID tidak
     ada modul master sungguhan di mockup ini, jadi diturunkan dari kota
     Customer (dekoratif tapi reaktif, bukan didekorasi statis 0).
   - Teks kecil "Kode Lama : ;" di bawah GROUP/ID direproduksi APA
     ADANYA dari screenshot (termasuk titik-koma kosongnya) — quirk asli
     aplikasi MASERP, bukan salah ketik di mockup ini.
   - "TOP / CPPR" — TOP diasumsikan Syarat Bayar (reuse DATA.syaratBayarList),
     2 field CPPR di sebelahnya bersifat dekoratif (tidak ada modul CPPR
     nyata di mockup), default kosong/0, bisa diisi manual.
   - Panel "Belum Jatuh Tempo/Jatuh Tempo", "Credit Limit/Sisa Credit
     Limit", "Dominasi Limit/Sisa Dominasi Limit" — REAKTIF begitu
     Customer dipilih (lihat sqRecalcCustomerFinance/
     sqRefreshCustomerFinanceDOM di sales-quotation.js), mengikuti pola
     CL/Piutang/Sisa CL di Sales Order. Belum Jatuh Tempo/Jatuh Tempo
     diturunkan dari `piutang` Customer (70%/30%, dekoratif — tidak ada
     rincian umur piutang per invoice di mockup ini). Dominasi Limit
     diturunkan 20% dari `limit` Customer (dekoratif, istilah "Dominasi
     Limit" tidak punya definisi baku di mockup ini — diasumsikan sejenis
     limit tambahan per-principal/kategori, Sisa = penuh karena belum ada
     pemakaian tercatat).
   - Toolbar tabel item "Refresh DPL" (dekoratif, membuka modal info) +
     "Pecah Faktur @ ... KG" (dekoratif, input bebas) + "Dimensi ... M3"
     (readonly, selalu 0 — tidak ada data berat/dimensi per barang di
     DATA.items mockup ini).
   - Strip total dokumen (HNA1 x Qty/Potongan/DPP/Type PPN/PPN/Biaya
     Kirim/Jumlah Tagihan) TAMPIL DUA KALI di screenshot asli (atas & bawah
     tabel item) — diinterpretasikan sebagai header row + footer row yang
     sama (pola UI umum "sticky summary" saat scroll tabel panjang).
     Diimplementasikan sebagai 1 SUMBER DATA (baris bawah, field Type PPN
     & Biaya Kirim yang benar-benar bisa diubah user) + 1 CERMIN read-only
     di atas tabel yang otomatis ikut ter-update — supaya tidak ada 2
     sumber kebenaran yang bisa saling berbeda.
   - Tabel item punya kolom HNA (harga dasar dari master barang, readonly)
     TERPISAH dari HNA1 (harga net yang bisa dinegosiasikan/diedit sales
     saat membuat quotation) — beda dari Sales Order yang cuma punya 1
     kolom HNA1. Formula: Disc/Barang = HNA1 × Discount% ÷ 100 (per unit);
     Jumlah = (HNA1 − Disc/Barang) × Qty — pola sama seperti Disc per
     Barang di Faktur Penjualan Via S.J.
========================================================= */

const SQ_TS_LIST = ['Baru','Diproses','Jadi SO','Batal'];
const SQ_SOFFICE_LIST = ['Head Office','Surabaya','Bandung','Medan','Makassar','Semarang','Tangerang','Sidoarjo'];
/* Gudang per Cabang — copy verbatim dari PKL_GUDANG_LIST/PKL_GUDANG_BY_CABANG
   (js/pages/picking-list.template.js) supaya konsisten kode gudang lintas
   modul, TANPA bergantung ke file lain yang di-lazy-load terpisah (module
   ini bisa dimuat sebelum/sesudah Picking List, urutan lazy-load tidak
   dijamin, jadi konstanta di-duplikasi di sini — pola sama seperti Gudang/
   Invoice yang juga meng-copy verbatim konstanta ini). */
const SQ_GUDANG_LIST = [
  '(00-GUU) Gudang Utama-HO','(01-GUU) Gudang Utama-SBY','(02-GUU) Gudang Utama-BDG',
  '(03-GUU) Gudang Utama-TGR','(04-GUU) Gudang Utama-MDN','(05-GUU) Gudang Utama-MKS',
  '(06-GUU) Gudang Utama-SMG','(07-GUU) Gudang Utama-SDA',
];
const SQ_GUDANG_BY_CABANG = {
  'Head Office':'(00-GUU) Gudang Utama-HO','Surabaya':'(01-GUU) Gudang Utama-SBY','Bandung':'(02-GUU) Gudang Utama-BDG',
  'Tangerang':'(03-GUU) Gudang Utama-TGR','Medan':'(04-GUU) Gudang Utama-MDN','Makassar':'(05-GUU) Gudang Utama-MKS',
  'Semarang':'(06-GUU) Gudang Utama-SMG','Sidoarjo':'(07-GUU) Gudang Utama-SDA',
};
const SQ_TYPE_PPN_LIST = ['Eksklusif','Inklusif','Non PKP'];

/* Rayon per kota Customer — tidak ada modul master Rayon detail (Kode/
   Nama/District) di mockup ini, jadi diturunkan dari kota Customer yang
   dipilih. Kota yang tidak match apa pun (di luar 6 kota ini) akan
   menampilkan field kosong, bukan error. */
const SQ_RAYON_BY_KOTA = {
  'Jakarta': {kode:'RY-JKT01', nama:'Rayon Jakarta Pusat', district:'Jakarta Pusat'},
  'Surabaya': {kode:'RY-SBY01', nama:'Rayon Surabaya Kota', district:'Surabaya'},
  'Bandung': {kode:'RY-BDG01', nama:'Rayon Bandung Kota', district:'Bandung'},
  'Medan': {kode:'RY-MDN01', nama:'Rayon Medan Kota', district:'Medan'},
  'Makassar': {kode:'RY-MKS01', nama:'Rayon Makassar Kota', district:'Makassar'},
  'Semarang': {kode:'RY-SMG01', nama:'Rayon Semarang Kota', district:'Semarang'},
};

/* Daftar dummy dekoratif untuk picker No. SP/No. DSC — sama pola seperti
   SO_SP_DUMMY_LIST/SO_DSC_DUMMY_LIST di Sales Order (tidak ada modul
   master Surat Pesanan/DSC sungguhan di mockup ini). */
const SQ_SP_DUMMY_LIST = [
  {no:'SP/HO/08/00014', tgl:'12/08/2026', ket:'Rencana Surat Pesanan Toko Sumber Rejeki'},
  {no:'SP/SBY/08/00008', tgl:'12/08/2026', ket:'Rencana Surat Pesanan UD Makmur Jaya'},
  {no:'SP/MKS/08/00003', tgl:'11/08/2026', ket:'Rencana Surat Pesanan UD Sinar Harapan'},
];
const SQ_DSC_DUMMY_LIST = [
  {no:'DSC/SBY/08/00001', tgl:'08/08/2026', ket:'Discount Slip Customer UD Makmur Jaya'},
  {no:'DSC/BDG/08/00001', tgl:'10/08/2026', ket:'Discount Slip Customer CV Berkah Abadi'},
];

function tplSalesQuotationListPage(){
  return `
    <div class="breadcrumb">Home / <b>Sales Quotation</b></div>
    <div class="card">
      <div class="card-header dark-header">
        <h3>${icon('invoice',15)} Sales Quotation</h3>
        <div class="toolbar-actions">
          <button class="chip-btn" id="btnSqStatusFilter">Pending ${icon('chevronDown',13)}</button>
          <button class="chip-btn" id="btnSqPeriod">Agustus 2026 ${icon('chevronDown',13)}</button>
          <button class="btn-primary" id="btnSqAdd">${icon('plus',14)} Tambah</button>
        </div>
      </div>
      <div class="table-toolbar">
        <select id="sqPageSize"><option selected>10</option><option>25</option><option>50</option></select>
        <input type="text" id="sqSearch" placeholder="Pencarian Global">
      </div>
      <div class="table-wrap"><table>
        <thead><tr>
          <th>No. SQ</th>
          <th>Customer</th>
          <th>Area</th>
          <th>No. SP</th>
          <th>TS</th>
          <th>Status</th>
          <th>Lihat</th>
          <th>Ubah</th>
          <th>Hapus</th>
        </tr></thead>
        <tbody id="sqTbody"></tbody>
      </table></div>
      <div class="table-footer"><div class="pager"><button>First</button><button>Previous</button><button class="active">1</button><button>Next</button><button>Last</button></div><div id="sqTotal"></div></div>
    </div>`;
}

/* Status ditampilkan sebagai teks berwarna, reuse .st-open/.st-closed
   (Stock Request) + inline kuning utk Pending — pola identik
   tplSoApprovalText() di Sales Order. */
function tplSqStatusText(status){
  if(status === 'Approved') return `<span class="st-open">${status}</span>`;
  if(status === 'Rejected') return `<span class="st-closed">${status}</span>`;
  return `<span style="color:var(--yellow);font-weight:700;">${status}</span>`;
}

function tplSqRows(rows){
  if(!rows.length) return `<tr><td colspan="9" style="color:var(--text-light);">Tidak Ada Data</td></tr>`;
  return rows.map((r,i)=>`
    <tr>
      <td>${r.no}</td>
      <td>${r.customer||''}</td>
      <td>${r.area||''}</td>
      <td>${r.noSP||''}</td>
      <td>${r.ts||''}</td>
      <td>${tplSqStatusText(r.status)}</td>
      <td><button class="icon-btn view" data-view="${i}" title="Lihat">${icon('eye',15)}</button></td>
      <td><button class="icon-btn edit" data-edit="${i}" title="Ubah">${icon('edit',15)}</button></td>
      <td><button class="icon-btn del" data-del="${i}" title="Hapus">${icon('trash',15)}</button></td>
    </tr>`).join('');
}

function tplSqItemRow(item, idx, dis){
  return `
    <tr data-sq-item-row="${idx}">
      <td style="width:34px;text-align:center;color:var(--text-light);">${idx+1}</td>
      <td style="min-width:130px;">
        <div class="input-with-btn">
          <input type="text" data-sq-kode="${idx}" value="${item.kode||''}" placeholder="Kode" readonly>
          ${!dis ? `<button type="button" class="icon-btn edit" data-sq-item-search="${idx}" title="Cari Barang">${icon('search',13)}</button>` : ''}
        </div>
      </td>
      <td style="min-width:170px;"><input type="text" data-sq-nama="${idx}" value="${item.nama||''}" readonly></td>
      <td style="width:60px;">${item.um||''}</td>
      <td style="width:70px;"><input type="number" min="0" data-sq-qty="${idx}" value="${item.qty||0}" ${dis}></td>
      <td style="width:100px;"><input type="text" data-sq-hna="${idx}" value="${num(item.hna||0)}" disabled></td>
      <td style="width:110px;"><input type="number" min="0" data-sq-hna1="${idx}" value="${item.hna1||0}" ${dis}></td>
      <td style="width:90px;"><input type="number" min="0" max="100" step="0.1" data-sq-disc="${idx}" value="${item.discPercent||0}" ${dis}></td>
      <td style="width:110px;"><input type="text" data-sq-discbarang="${idx}" value="${num(item.discBarang||0)}" disabled></td>
      <td style="width:130px;"><input type="text" data-sq-jumlah="${idx}" value="${num(item.jumlah||0)}" disabled></td>
      <td style="width:34px;">${!dis ? `<button type="button" class="icon-btn del" data-sq-item-del="${idx}" title="Hapus Baris">${icon('trash',13)}</button>` : ''}</td>
    </tr>`;
}

/* Strip total dokumen — dipakai 2x (cermin read-only di atas tabel,
   sumber data reaktif di bawah tabel), lihat catatan panjang di atas
   file ini. `editable` membedakan apakah Type PPN & Biaya Kirim boleh
   diubah user (bottom) atau cuma tampilan (top). */
function tplSqSummaryRow(row, suffix, editable, dis){
  const canEdit = editable && !dis;
  return `
    <table class="po-item-table" style="margin:10px 0;">
      <thead><tr>
        <th class="text-right">HNA1 &times; Qty</th>
        <th class="text-right">Potongan</th>
        <th class="text-right">DPP</th>
        <th>Type PPN</th>
        <th class="text-right">PPN</th>
        <th class="text-right">Biaya Kirim</th>
        <th class="text-right">Jumlah Tagihan</th>
      </tr></thead>
      <tbody><tr>
        <td><input type="text" id="fSqHnaXqty${suffix}" value="${num(row.totalHnaXqty||0)}" disabled></td>
        <td><input type="text" id="fSqPotongan${suffix}" value="${num(row.totalPotongan||0)}" disabled></td>
        <td><input type="text" id="fSqDpp${suffix}" value="${num(row.totalDpp||0)}" disabled></td>
        <td><select id="fSqTypePpn${suffix}" ${canEdit?'':'disabled'}>${SQ_TYPE_PPN_LIST.map(t=>`<option ${row.typePpn===t?'selected':''}>${t}</option>`).join('')}</select></td>
        <td><input type="text" id="fSqPpn${suffix}" value="${num(row.totalPpn||0)}" disabled></td>
        <td><input type="number" min="0" id="fSqBiayaKirim${suffix}" value="${row.biayaKirim||0}" ${canEdit?'':'disabled'}></td>
        <td><input type="text" id="fSqJumlah${suffix}" value="${num(row.jumlahAkhir||0)}" disabled style="font-weight:700;"></td>
      </tr></tbody>
    </table>`;
}

function tplSqForm(mode, row){
  const isAdd = mode === 'add';
  const isView = mode === 'view';
  const dis = isView ? 'disabled' : '';
  const titleAction = isAdd ? 'Tambah' : (isView ? 'Lihat' : 'Ubah');
  const headerIcon = isAdd ? 'plus' : (isView ? 'eye' : 'edit');
  return `
    <div class="breadcrumb">Home / Sales Quotation / <b>${titleAction}</b></div>
    <div class="card">
      <div class="card-header dark-header">
        <h3>${icon(headerIcon,15)} ${isAdd ? '+ Sales Quotation' : (isView ? 'Lihat Sales Quotation' : 'Ubah Sales Quotation')}</h3>
        <button class="btn-primary" id="sqActivityLog">${icon('list',13)} Activity Log</button>
      </div>
      <div class="card-body">

        <div class="po-grid-3">
          <div class="form-group">
            <label>SO / Area</label>
            <div class="field-pair">
              <select id="fSqSOffice" ${dis}>${SQ_SOFFICE_LIST.map(c=>`<option value="${c}" ${row.sOffice===c?'selected':''}>${c.toUpperCase()} (DC)</option>`).join('')}</select>
              <select id="fSqArea" ${dis}><option value="">Pilih</option>${DATA.wilayah.map(w=>`<option ${row.area===w?'selected':''}>${w}</option>`).join('')}</select>
            </div>
          </div>
          <div class="form-group">
            <label>Layanan</label>
            <div class="field-pair">
              <select id="fSqLayanan" ${dis}>${DATA.layananList.map(l=>`<option ${row.layanan===l?'selected':''}>${l}</option>`).join('')}</select>
              <select id="fSqGudang" ${dis}>${SQ_GUDANG_LIST.map(g=>`<option ${row.gudang===g?'selected':''}>${g}</option>`).join('')}</select>
            </div>
          </div>
          <div class="form-group">
            <label>Order Via</label>
            <select id="fSqOrderVia" ${dis}><option value="">--Pilih Order Via--</option>${DATA.orderViaList.map(o=>`<option ${row.orderVia===o?'selected':''}>${o}</option>`).join('')}</select>
          </div>
        </div>

        <div class="po-grid-3">
          <div class="form-group">
            <label>Customer</label>
            <div class="input-with-btn">
              <input type="text" id="fSqCustomer" value="${row.customer||''}" placeholder="Nama" readonly>
              ${!isView ? `<button type="button" class="icon-btn edit" id="sqCustomerSearch" title="Cari Customer">${icon('search',13)}</button>` : ''}
            </div>
          </div>
          <div class="form-group">
            <label>Alamat Pengiriman</label>
            <textarea id="fSqAlamat" class="po-textarea" rows="3" ${dis}>${row.alamat||''}</textarea>
          </div>
          <div class="form-group">
            <label>Rayon</label>
            <div style="display:flex;flex-direction:column;gap:6px;">
              <input type="text" id="fSqRayonKode" value="${row.rayonKode||''}" placeholder="Kode" readonly>
              <input type="text" id="fSqRayonNama" value="${row.rayonNama||''}" placeholder="Nama" readonly>
              <input type="text" id="fSqRayonDistrict" value="${row.rayonDistrict||''}" placeholder="District" readonly>
            </div>
          </div>
        </div>

        <div class="po-grid-3">
          <div class="form-group">
            <label>GROUP / ID</label>
            <div class="field-pair">
              <input type="text" id="fSqGroupKode" value="${row.groupKode||''}" placeholder="Kode" readonly>
              <input type="text" id="fSqIdKode" value="${row.idKode||''}" placeholder="Kode" readonly>
            </div>
            <div style="font-size:11.5px;color:var(--blue);margin-top:4px;">Kode Lama : ;</div>
          </div>
          <div class="form-group">
            <label>TOP / CPPR</label>
            <div class="field-pair">
              <select id="fSqTop" ${dis}><option value="">Pilih</option>${DATA.syaratBayarList.map(t=>`<option ${row.top===t?'selected':''}>${t}</option>`).join('')}</select>
              <input type="number" id="fSqCppr1" value="${row.cppr1||0}" ${dis}>
              <input type="number" id="fSqCppr2" value="${row.cppr2||0}" ${dis}>
            </div>
          </div>
          <div class="form-group"></div>
        </div>

        <div class="po-grid-3">
          <div class="form-group">
            <label>Principal</label>
            <div class="input-with-btn">
              <input type="text" id="fSqPrincipal" value="${row.principalNama||''}" placeholder="Pilih Principal" readonly>
              ${!isView ? `<button type="button" class="icon-btn edit" id="sqPrincipalSearch" title="Cari Principal">${icon('search',13)}</button>` : ''}
            </div>
          </div>
          <div class="form-group">
            <label>No. SP</label>
            <div class="input-with-btn">
              <input type="text" id="fSqNoSP" value="${row.noSP||''}" placeholder="Pilih Surat Pesanan" readonly>
              ${!isView ? `<button type="button" class="icon-btn edit" id="sqSpSearch" title="Cari Surat Pesanan">${icon('search',13)}</button>` : ''}
            </div>
          </div>
          <div class="form-group">
            <label>Pending</label>
            <div style="display:flex;gap:18px;padding-top:8px;">
              <label style="display:flex;align-items:center;gap:5px;font-weight:400;font-size:13px;"><input type="checkbox" id="fSqPendingDsc" ${row.pendingDsc?'checked':''} ${dis} style="width:auto;"> DSC</label>
              <label style="display:flex;align-items:center;gap:5px;font-weight:400;font-size:13px;"><input type="checkbox" id="fSqPendingDom" ${row.pendingDom?'checked':''} ${dis} style="width:auto;"> DOM</label>
              <label style="display:flex;align-items:center;gap:5px;font-weight:400;font-size:13px;"><input type="checkbox" id="fSqPendingGit" ${row.pendingGit?'checked':''} ${dis} style="width:auto;"> GIT</label>
            </div>
          </div>
        </div>

        <div class="po-grid-3">
          <div class="form-group">
            <label>No SQ</label>
            <div class="input-with-btn">
              <input type="text" id="fSqNo" value="${row.no||''}" placeholder="Otomatis" readonly>
              ${isAdd ? `<button type="button" class="icon-btn edit" id="sqRefreshNo" title="Generate Nomor">${icon('refreshCw',13)}</button>` : ''}
            </div>
          </div>
          <div class="form-group">
            <label>Tgl. SP</label>
            <div class="input-with-btn">
              <input type="text" id="fSqTglSP" value="${row.tglSP||''}" ${dis}>
              <button type="button" class="icon-btn edit" title="Kalender" ${dis}>${icon('calendar',13)}</button>
            </div>
          </div>
          <div class="form-group">
            <label>No DSC</label>
            <div class="input-with-btn">
              <input type="text" id="fSqNoDSC" value="${row.noDSC||''}" placeholder="Pilih Diskon Proposal Form" readonly>
              ${!isView ? `<button type="button" class="icon-btn edit" id="sqDscSearch" title="Cari DSC">${icon('search',13)}</button>` : ''}
            </div>
          </div>
        </div>

        <div class="po-grid-3">
          <div class="form-group">
            <label>Tgl SQ</label>
            <div class="input-with-btn">
              <input type="text" id="fSqTglSQ" value="${row.tglSQ||''}" ${dis}>
              <button type="button" class="icon-btn edit" title="Kalender" ${dis}>${icon('calendar',13)}</button>
            </div>
          </div>
          <div class="form-group">
            <label>Tanggal Kirim</label>
            <div class="input-with-btn">
              <input type="text" id="fSqTglKirim" value="${row.tglKirim||''}" ${dis}>
              <button type="button" class="icon-btn edit" title="Kalender" ${dis}>${icon('calendar',13)}</button>
            </div>
          </div>
          <div class="form-group">
            <label>Catatan SP</label>
            <textarea id="fSqCatatanSp" class="po-textarea" rows="2" ${dis}>${row.catatanSp||''}</textarea>
          </div>
        </div>

        <div style="display:flex;gap:28px;flex-wrap:wrap;margin:12px 0;">
          <div class="checkbox-row" style="margin:0;"><input type="checkbox" id="fSqCito" ${row.cito?'checked':''} ${dis}><label for="fSqCito" style="color:#d9433c;font-weight:700;">CITO</label></div>
          <div class="checkbox-row" style="margin:0;"><input type="checkbox" id="fSqSpAsli" ${row.spAsli?'checked':''} ${dis}><label for="fSqSpAsli">SP Asli</label></div>
          <div class="checkbox-row" style="margin:0;"><input type="checkbox" id="fSqSkEd" ${row.skEd?'checked':''} ${dis}><label for="fSqSkEd">SK ED</label></div>
        </div>

        <div class="form-group" style="max-width:340px;">
          <label>Upload File</label>
          ${!isView ? `<button type="button" class="btn-secondary" id="sqUploadBtn" style="margin-bottom:6px;">${icon('file',13)} Upload File</button>` : ''}
          <div class="upload-box">Belum ada file diunggah.</div>
        </div>

        <div class="po-grid-3">
          <div class="form-group">
            <label>Belum Jatuh Tempo</label>
            <input type="text" id="fSqBelumJT" value="${num(row.belumJatuhTempo||0)}" disabled>
          </div>
          <div class="form-group">
            <label>Credit Limit</label>
            <input type="text" id="fSqCreditLimit" value="${num(row.creditLimit||0)}" disabled>
          </div>
          <div class="form-group">
            <label>Dominasi Limit</label>
            <input type="text" id="fSqDominasiLimit" value="${num(row.dominasiLimit||0)}" disabled>
          </div>
        </div>
        <div class="po-grid-3">
          <div class="form-group">
            <label>Jatuh Tempo</label>
            <input type="text" id="fSqJatuhTempo" value="${num(row.jatuhTempo||0)}" disabled>
          </div>
          <div class="form-group">
            <label>Sisa Credit Limit</label>
            <input type="text" id="fSqSisaCreditLimit" value="${num(row.sisaCreditLimit||0)}" disabled>
          </div>
          <div class="form-group">
            <label>Sisa Dominasi Limit</label>
            <input type="text" id="fSqSisaDominasiLimit" value="${num(row.sisaDominasiLimit||0)}" disabled>
          </div>
        </div>

        <div class="form-group">
          <label>Keterangan</label>
          <textarea id="fSqKeterangan" class="po-textarea" rows="2" ${dis}>${row.keterangan||''}</textarea>
        </div>

        <div class="card-header dark-header" style="border-radius:6px;margin:18px 0 14px;flex-wrap:wrap;gap:10px;">
          <h3>${icon('clipboard',14)} Rincian Barang</h3>
          <div class="toolbar-actions">
            <button class="btn-secondary" id="sqColumnsBtn" title="Pilih Kolom">${icon('grid',13)} ${icon('chevronDown',12)}</button>
            ${!isView ? `<button class="btn-primary" id="sqRefreshDpl">${icon('search',13)} Refresh DPL</button>` : ''}
            <label style="display:flex;align-items:center;gap:6px;font-size:12px;color:#fff;">Pecah Faktur @
              <input type="number" min="0" id="fSqPecahFaktur" value="${row.pecahFakturAt||0}" ${dis} style="width:80px;border-radius:5px;border:1px solid var(--border);padding:5px 8px;">
              KG
            </label>
            <label style="display:flex;align-items:center;gap:6px;font-size:12px;color:#fff;">Dimensi
              <input type="text" value="${num(row.dimensiM3||0)}" disabled style="width:80px;border-radius:5px;border:1px solid var(--border);padding:5px 8px;">
              M3
            </label>
          </div>
        </div>

        ${tplSqSummaryRow(row, 'Top', false, dis)}

        <div class="table-wrap" style="margin:6px 0 6px;">
          <table class="po-item-table">
            <thead><tr>
              <th>No</th>
              <th>Kode</th>
              <th>Nama</th>
              <th>U/M</th>
              <th>Qty</th>
              <th class="text-right">HNA</th>
              <th class="text-right">HNA1</th>
              <th class="text-right">Discount %</th>
              <th class="text-right">Disc/Barang 1</th>
              <th class="text-right">Jumlah</th>
              <th></th>
            </tr></thead>
            <tbody id="sqItemsBody">${row.items.map((it,idx)=>tplSqItemRow(it,idx,dis)).join('')}</tbody>
          </table>
        </div>
        ${!isView ? `<a href="#" id="sqAddItem" class="link-add">${icon('plus',13)} Tambah Item Baru</a>` : ''}

        ${tplSqSummaryRow(row, 'Bot', true, dis)}

        <div style="font-size:11.8px;color:var(--text-light);margin-top:6px;line-height:1.7;">
          ${row.tglInput ? `Tgl. Input : ${row.tglInput}  User Entry : ${row.userInput||''}<br>` : ''}
          ${row.tglEdit ? `Tgl Edit : ${row.tglEdit}  User Edit : ${row.userEdit||''}` : ''}
        </div>

        <div class="form-page-actions">
          ${isView
            ? `<a href="#" id="sqTutup" class="link-add" style="margin-right:auto;">&larr; Kembali ke Daftar</a>`
            : `<a href="#" id="sqBatalkan" class="link-add" style="margin-right:auto;">Batalkan</a>
               <button class="btn-primary" id="sqSimpan">Simpan</button>`}
        </div>
      </div>
    </div>`;
}

function tplSqDeleteConfirm(row){
  return `
    <div class="modal-box">
      <div class="modal-header"><span>Hapus Sales Quotation</span><span class="close" id="modalClose">&times;</span></div>
      <div class="modal-body"><p>Yakin ingin menghapus Sales Quotation <b>${row.no}</b>?</p></div>
      <div class="modal-footer">
        <button class="btn-secondary" id="modalCancel">Batal</button>
        <button class="btn-danger" id="modalDelete">Hapus</button>
      </div>
    </div>`;
}

function tplSqInfoModal(title,text){
  return `
    <div class="modal-box">
      <div class="modal-header"><span>${title}</span><span class="close" id="modalClose">&times;</span></div>
      <div class="modal-body"><p>${text}</p></div>
      <div class="modal-footer">
        <button class="btn-primary" id="modalOk">Mengerti</button>
      </div>
    </div>`;
}

function tplSqCustomerPicker(list){
  return `
    <div class="modal-box" style="max-width:560px;">
      <div class="modal-header"><span>Pilih Customer</span><span class="close" id="modalClose">&times;</span></div>
      <div class="modal-body">
        <div class="table-wrap" style="max-height:340px;overflow:auto;"><table>
          <thead><tr><th>Kode</th><th>Nama Customer</th><th>Kota</th><th></th></tr></thead>
          <tbody>${list.map(c=>`<tr><td>${c.kode}</td><td>${c.nama}</td><td>${c.kota}</td><td><button class="btn-pick" data-pick-customer="${c.kode}">Pilih</button></td></tr>`).join('')}</tbody>
        </table></div>
      </div>
      <div class="modal-footer"><button class="btn-secondary" id="modalCancel">Tutup</button></div>
    </div>`;
}

function tplSqPrincipalPicker(list){
  return `
    <div class="modal-box" style="max-width:560px;">
      <div class="modal-header"><span>Pilih Principal</span><span class="close" id="modalClose">&times;</span></div>
      <div class="modal-body">
        <div class="table-wrap" style="max-height:340px;overflow:auto;"><table>
          <thead><tr><th>Kode</th><th>Nama Principal</th><th></th></tr></thead>
          <tbody>${list.map(s=>`<tr><td>${s.kode}</td><td>${s.nama}</td><td><button class="btn-pick" data-pick-principal="${s.kode}">Pilih</button></td></tr>`).join('')}</tbody>
        </table></div>
      </div>
      <div class="modal-footer"><button class="btn-secondary" id="modalCancel">Tutup</button></div>
    </div>`;
}

/* Picker dekoratif bersama utk No. SP/No. DSC — sama pola
   tplSoDecorativePicker() di Sales Order. */
function tplSqDecorativePicker(title, list, pickAttr){
  return `
    <div class="modal-box" style="max-width:520px;">
      <div class="modal-header"><span>${title}</span><span class="close" id="modalClose">&times;</span></div>
      <div class="modal-body">
        <div class="table-wrap"><table>
          <thead><tr><th>No.</th><th>Tanggal</th><th>Keterangan</th><th></th></tr></thead>
          <tbody>${list.length ? list.map(d=>`<tr><td>${d.no}</td><td>${d.tgl}</td><td>${d.ket}</td><td><button class="btn-pick" data-${pickAttr}="${d.no}">Pilih</button></td></tr>`).join('') : `<tr><td colspan="4" style="color:var(--text-light);">Tidak ada data</td></tr>`}</tbody>
        </table></div>
      </div>
      <div class="modal-footer"><button class="btn-secondary" id="modalCancel">Tutup</button></div>
    </div>`;
}
