/* =========================================================
   TEMPLATE (HTML saja) — Invoice (Customer & Penjualan > Daftar
   Transaksi > Invoice, key page:'invoices'). Semua fungsi di file
   ini HANYA menyusun & mengembalikan markup HTML (string) atau
   helper murni (lookup 1 baris data / angka kecil), TIDAK ada
   DOM-binding di sini. Logic-nya ada di file sebelah: invoice.js

   Invoice adalah langkah BERIKUTNYA dalam rantai fulfillment
   Sales Order -> Picking List -> Invoice (lihat js/pages/
   sales-order.* & js/pages/picking-list.* — pola split template/
   logic, modal, & konvensi penamaan konstanta PKL_* ditiru persis
   di sini sebagai INV_*).

   Sebelumnya page:'invoices' cuma pemetaan generik read-only
   ({title,cols,rows} di objek `pages` dalam renderPage(), js/core.js,
   dengan 10 baris dummy {no,tgl,customer,jumlah,status} tanpa
   hubungan ke modul lain) — SUDAH DIHAPUS, digantikan modul CRUD
   sungguhan ini yang datanya benar-benar chained dari DATA.pickingList/
   DATA.salesOrders/DATA.customers (lihat komentar DATA.invoices di
   js/data.js untuk penjelasan lengkap derivasi tiap baris sample).

   2 screenshot MASERP yang dikirim user ("Invoices" list dengan kolom
   No Invoice/No SP/Customer/Area/No PL/No. SO (+ "@Rp." jumlah)/TS/
   Cetak(split-button)/Ubah/Hapus/Posting, dan form "+ Invoice" 3-kolom)
   dijadikan acuan LAYOUT saja — semua angka contoh di screenshot
   (nomor dokumen, nama customer, nilai Rupiah) berasal dari demo
   farmasi yang TIDAK ADA hubungannya dengan PT Distriversa Buanamas,
   jadi SEMUA diganti data DBM sendiri, termasuk "Gudang" yang di
   screenshot menampilkan teks "MIKA Group" (sisa demo perusahaan lain)
   — di mockup ini gudang SELALU salah satu dari INV_GUDANG_BY_CABANG
   (persis sama dengan PKL_GUDANG_BY_CABANG di Picking List).
========================================================= */

/* Sama persis dengan PKL_CABANG_LIST/PKL_CABANG_CODE di
   picking-list.template.js (8 cabang yang sama, kode yang sama). */
const INV_CABANG_LIST = ['Head Office','Surabaya','Bandung','Medan','Makassar','Semarang','Tangerang','Sidoarjo'];
const INV_CABANG_CODE = {'Head Office':'HO','Surabaya':'SBY','Bandung':'BDG','Medan':'MDN','Makassar':'MKS','Semarang':'SMG','Tangerang':'TGR','Sidoarjo':'SDA'};

/* Disalin VERBATIM dari PKL_GUDANG_BY_CABANG (picking-list.template.js)
   — SENGAJA bukan daftar gudang baru, supaya konsisten dengan modul
   upstream-nya (1 Cabang selalu = 1 Gudang Utama yang sama di seluruh
   mockup ini). Tangerang tetap dapat kode "03-GUU" sesuai konvensi yang
   sama seperti Picking List. */
const INV_GUDANG_LIST = [
  '(00-GUU) Gudang Utama-HO',
  '(01-GUU) Gudang Utama-SBY',
  '(02-GUU) Gudang Utama-BDG',
  '(03-GUU) Gudang Utama-TGR',
  '(04-GUU) Gudang Utama-MDN',
  '(05-GUU) Gudang Utama-MKS',
  '(06-GUU) Gudang Utama-SMG',
  '(07-GUU) Gudang Utama-SDA',
];
const INV_GUDANG_BY_CABANG = {
  'Head Office':'(00-GUU) Gudang Utama-HO',
  'Surabaya':'(01-GUU) Gudang Utama-SBY',
  'Bandung':'(02-GUU) Gudang Utama-BDG',
  'Tangerang':'(03-GUU) Gudang Utama-TGR',
  'Medan':'(04-GUU) Gudang Utama-MDN',
  'Makassar':'(05-GUU) Gudang Utama-MKS',
  'Semarang':'(06-GUU) Gudang Utama-SMG',
  'Sidoarjo':'(07-GUU) Gudang Utama-SDA',
};
const INV_SYARAT_BAYAR_LIST = ['CBD','Kredit 14 Hari','Kredit 30 Hari','Kredit 45 Hari','Kredit 60 Hari'];
const INV_SHIP_VIA_LIST = ['Driver','Ekspedisi','Diambil Sendiri','Dikirim Supplier'];

/* ===== Helper murni (lookup 1 baris) — dipakai bersama oleh invoice.js,
   TIDAK menyentuh DOM. ===== */
function invFindSO(no){ return DATA.salesOrders.find(s => s.no === no); }
function invFindPL(no){ return DATA.pickingList.find(p => p.no === no); }

function tplInvoiceListPage(){
  return `
    <div class="breadcrumb">Home / <b>Invoice</b></div>
    <div class="card">
      <div class="card-header dark-header">
        <h3>${icon('invoice',15)} Invoices</h3>
        <div class="toolbar-actions">
          <button class="chip-btn" id="btnInvPickingReq" style="background:var(--teal);">Picking Requested</button>
          <button class="chip-btn" id="btnInvTsFilter">${icon('search',12)} TS</button>
          <select class="chip-btn" id="invStatusFilter"><option>All</option><option>Create Invoice</option><option>Invoice Selesai</option></select>
          <select class="chip-btn" id="invPeriodFilter"><option>Agustus 2026</option></select>
          <button class="btn-primary" id="btnInvAdd">${icon('plus',14)} Tambah</button>
        </div>
      </div>
      <div class="table-toolbar">
        <select id="invPageSize"><option selected>10</option><option>25</option><option>50</option></select>
        <input type="text" id="invSearch" placeholder="Pencarian Global">
      </div>
      <div class="table-wrap"><table>
        <thead><tr>
          <th>No Invoice</th>
          <th>No SP</th>
          <th>Customer</th>
          <th>Area</th>
          <th>No PL</th>
          <th>No. SO</th>
          <th>TS</th>
          <th>Cetak</th>
          <th>Ubah</th>
          <th>Hapus</th>
          <th>Posting</th>
        </tr></thead>
        <tbody id="invTbody"></tbody>
      </table></div>
      <div class="table-footer"><div class="pager"><button>First</button><button>Previous</button><button class="active">1</button><button>Next</button><button>Last</button></div><div id="invTotal"></div></div>
    </div>`;
}

function tplInvRows(rows){
  if(!rows.length) return `<tr><td colspan="11" style="color:var(--text-light);">Tidak ada data Invoice</td></tr>`;
  return rows.map((r,i)=>{
    const dis = r.posted ? 'disabled' : '';
    const disStyle = r.posted ? 'opacity:.4;pointer-events:none;' : '';
    return `
    <tr>
      <td><b style="color:var(--blue);">${r.no}</b><br><span style="font-size:11px;color:var(--text-light);">${r.tglBuat||''}</span></td>
      <td>${r.noSP||''}</td>
      <td><b>${r.customerNama||''}</b><br><span style="font-size:11px;color:var(--text-light);">${r.customerKode||''} &amp;</span><br><span style="font-size:11.5px;color:var(--text-light);">${r.customerAlamat||''}</span></td>
      <td>${r.area||''}</td>
      <td><b>${r.noPL||''}</b><br><span style="font-size:11px;color:var(--text-light);">${r.tglBuat||''}</span></td>
      <td><b>${r.noSO||''}</b><br><span style="font-size:11px;color:var(--text-light);">${r.tglSP||''}</span><br><span style="font-size:11px;color:var(--text-light);">@Rp.${num(r.jumlah||0)}</span></td>
      <td>${r.ts||''}</td>
      <td>
        <div style="display:inline-flex;gap:2px;">
          <button class="icon-btn print" data-print="${i}" title="Cetak" ${dis} style="${disStyle}">${icon('printer',15)}</button>
          <button class="icon-btn print" data-print-menu="${i}" title="Pilihan Cetak" ${dis} style="width:18px;${disStyle}">${icon('chevronDown',12)}</button>
        </div>
      </td>
      <td><button class="icon-btn edit" data-edit="${i}" title="Ubah" ${dis} style="${disStyle}">${icon('edit',15)}</button></td>
      <td><button class="icon-btn del" data-del="${i}" title="Hapus" ${dis} style="${disStyle}">${icon('trash',15)}</button></td>
      <td><button class="icon-btn edit" data-posting="${i}" title="Posting ke General Ledger" ${dis} style="${disStyle}">${icon('check',15)}</button></td>
    </tr>`;
  }).join('');
}

/* Dropdown kecil "Pilihan Cetak" — dipicu tombol chevron di sebelah
   tombol Cetak (bukan <select> asli, tapi modal kecil dengan opsi
   dekoratif, konsisten dengan kebijakan "tanpa alert()/confirm() bawaan
   browser" mockup ini).

   2026-08-19 (lanjutan lagi): "Cetak Invoice" (dulu 1 tombol dekoratif)
   DIPECAH jadi 2 opsi sungguhan — "Half Page" dan "Full Page" — sesuai
   2 contoh cetakan PDF Invoice yang dikirim user (lihat catatan desain
   lengkap di header tplInvPrintDoc() di bawah). "Cetak Surat Jalan"
   TETAP dekoratif (belum ada contoh cetakan Surat Jalan yang dikirim,
   di luar cakupan permintaan kali ini). */
function tplInvCetakDropdown(row){
  return `
    <div class="modal-box" style="max-width:340px;">
      <div class="modal-header"><span>Pilihan Cetak</span><span class="close" id="modalClose">&times;</span></div>
      <div class="modal-body">
        <div style="display:flex;flex-direction:column;gap:8px;">
          <button class="btn-secondary" id="invCetakHalf" style="text-align:left;">${icon('printer',13)} Cetak Invoice - Half Page</button>
          <button class="btn-secondary" id="invCetakFull" style="text-align:left;">${icon('printer',13)} Cetak Invoice - Full Page</button>
          <button class="btn-secondary" id="invCetakSJ" style="text-align:left;">${icon('printer',13)} Cetak Surat Jalan</button>
        </div>
      </div>
      <div class="modal-footer"><button class="btn-secondary" id="modalCancel">Tutup</button></div>
    </div>`;
}

/* ===== Baris tabel "Produk" (tab Detail Transaksi) — read-only kecuali
   Qty Kirim, seluruhnya diturunkan dari Picking List yang dipilih
   (lihat invApplyPickingList() di invoice.js). Tidak ada tombol
   tambah/hapus baris (berbeda dari Picking List/Purchase Order) karena
   daftar barang di sini murni salinan dari 1 Picking List sumber. ===== */
function tplInvItemRow(item, idx){
  return `
    <tr data-inv-item-row="${idx}">
      <td style="width:32px;">${idx+1}</td>
      <td style="min-width:100px;">${item.kode||''}</td>
      <td style="min-width:170px;">${item.nama||''}</td>
      <td style="width:70px;">${item.satuan||''}</td>
      <td style="width:90px;"><input type="number" data-inv-qtypesan="${idx}" value="${item.qtyPesan||0}" disabled></td>
      <td style="width:100px;"><input type="number" min="0" data-inv-qtykirim="${idx}" value="${item.qtyKirim||0}"></td>
      <td style="width:130px;"><input type="text" data-inv-batch="${idx}" value="${item.batch||''}" disabled></td>
      <td style="width:100px;"><input type="text" data-inv-ed="${idx}" value="${item.ed||''}" disabled></td>
    </tr>`;
}

/* Tab "Rincian Jurnal Akun" — 2026-08-19: sebelumnya placeholder
   dekoratif murni (tidak ada screenshot isi tab ini saat modul Invoice
   pertama dibangun). User lalu mengirim screenshot MASERP sungguhan
   untuk tab ini (radio Jurnal Otomatis/Jurnal Manual, tombol "Buat
   Jurnal", tabel Kode Akun/Nama Akun/Keterangan/Jumlah Debit/Jumlah
   Kredit, ringkasan "Jumlah Debit - Kredit"), jadi diganti implementasi
   sungguhan berikut ini.

   Model data baru di setiap baris DATA.invoices: `jurnalMode` ('otomatis'
   default / 'manual') dan `jurnalAkun` (array {kodeAkun,namaAkun,
   keterangan,debit,kredit}).

   Kode akun contoh di screenshot asli (110901 "Persediaan Barang",
   110902 "Persediaan Barang Intransit") adalah skema 6-digit demo
   farmasi lain, TIDAK dipakai apa adanya — dipetakan ke akun 7-digit
   DBM yang SUDAH ADA di DATA.akunGL (1130001 "Persediaan Barang Dagang
   Jakarta" utk sisi Kredit, 1130002 "Persediaan Barang Intransit" utk
   sisi Debit — 1130002 ini kebetulan sudah dipakai juga oleh
   `akunPersediaanIntransit` di DATA.jurnalPenjualan), pola penyesuaian
   yang sama seperti Jurnal Pembelian/Jurnal Penjualan/Stock Request.
   Semantik entri ini: begitu Invoice/Surat Jalan dibuat, barang
   dipindah dari Persediaan Barang (kredit, berkurang) ke Persediaan
   Barang Intransit (debit, barang dalam perjalanan ke Customer) sebesar
   `row.jumlah` — makanya "Jumlah Debit - Kredit" hasil mode Otomatis
   SELALU 0 (2 baris itu memang saling menyeimbangkan by construction).

   Mode "Jurnal Manual" membuka tabel jadi editable (Kode Akun dicari
   lewat picker `tplInvAkunPicker()` — SALINAN LOKAL dari pola
   `tplJpAkunPicker()` Jurnal Pembelian, bukan referensi cross-file
   karena lazy-load antar modul tidak terjamin urutannya — Keterangan/
   Jumlah Debit/Jumlah Kredit input bebas, + tombol tambah/hapus baris)
   sehingga "Jumlah Debit - Kredit" bisa saja tidak 0 kalau user membuat
   entri manual yang tidak balance — ditampilkan merah sebagai
   penanda visual (bukan validasi wajib-balance, mockup ini tidak
   memblokir Simpan hanya karena jurnal manual belum seimbang). */
function invNum2(n){ return Number(n||0).toLocaleString('id-ID', {minimumFractionDigits:2, maximumFractionDigits:2}); }
function invAkunNama(kode){ const a = DATA.akunGL.find(x => x.kode === kode); return a ? a.nama : ''; }
function invJurnalTotals(row){
  const list = row.jurnalAkun || [];
  const debit = list.reduce((s,r)=>s+(+r.debit||0),0);
  const kredit = list.reduce((s,r)=>s+(+r.kredit||0),0);
  return { debit, kredit, selisih: debit - kredit };
}

function tplInvJurnalRow(entry, idx, isManual){
  if(isManual){
    return `
    <tr data-jurnal-row="${idx}">
      <td style="min-width:120px;">
        <div class="input-with-btn">
          <input type="text" data-jurnal-kode="${idx}" value="${entry.kodeAkun||''}" readonly>
          <button type="button" class="icon-btn edit" data-jurnal-akun-search="${idx}" title="Cari Akun GL">${icon('search',12)}</button>
        </div>
      </td>
      <td style="min-width:180px;"><input type="text" data-jurnal-nama="${idx}" value="${entry.namaAkun||''}" readonly></td>
      <td style="min-width:170px;"><input type="text" data-jurnal-ket="${idx}" value="${entry.keterangan||''}"></td>
      <td style="width:140px;"><input type="number" step="0.01" min="0" data-jurnal-debit="${idx}" value="${entry.debit||0}"></td>
      <td style="width:140px;"><input type="number" step="0.01" min="0" data-jurnal-kredit="${idx}" value="${entry.kredit||0}"></td>
      <td style="width:36px;"><button type="button" class="icon-btn del" data-jurnal-del="${idx}" title="Hapus Baris">${icon('trash',14)}</button></td>
    </tr>`;
  }
  return `
    <tr>
      <td style="min-width:120px;"><input type="text" value="${entry.kodeAkun||''}" readonly></td>
      <td style="min-width:180px;"><input type="text" value="${entry.namaAkun||''}" readonly></td>
      <td style="min-width:170px;"><input type="text" value="${entry.keterangan||''}" readonly></td>
      <td style="width:140px;"><input type="text" value="${invNum2(entry.debit||0)}" readonly style="text-align:right;"></td>
      <td style="width:140px;"><input type="text" value="${invNum2(entry.kredit||0)}" readonly style="text-align:right;"></td>
    </tr>`;
}

function tplInvJurnalRows(list, isManual){
  if(!list || !list.length) return `<tr><td colspan="${isManual?6:5}" style="color:var(--text-light);">Belum ada rincian jurnal — klik "Buat Jurnal".</td></tr>`;
  return list.map((entry,idx) => tplInvJurnalRow(entry, idx, isManual)).join('');
}

function tplInvJurnalContent(row){
  const isManual = row.jurnalMode === 'manual';
  const totals = invJurnalTotals(row);
  const selisihColor = Math.abs(totals.selisih) > 0.004 ? 'var(--red)' : 'var(--text)';
  return `
    <div style="display:flex;align-items:center;justify-content:space-between;gap:12px;margin:2px 0 14px;flex-wrap:wrap;">
      <div class="radio-inline" style="padding-top:0;">
        <label><input type="radio" name="invJurnalMode" id="invJurnalOtomatis" value="otomatis" ${!isManual?'checked':''}> Jurnal Otomatis</label>
        <label><input type="radio" name="invJurnalMode" id="invJurnalManual" value="manual" ${isManual?'checked':''}> Jurnal Manual</label>
      </div>
      <button type="button" class="btn-teal" id="invBuatJurnal">${icon('refreshCw',13)} Buat Jurnal</button>
    </div>
    <div class="table-wrap">
      <table class="po-item-table">
        <thead><tr>
          <th>Kode Akun</th><th>Nama Akun</th><th>Keterangan</th><th>Jumlah Debit</th><th>Jumlah Kredit</th>${isManual?'<th></th>':''}
        </tr></thead>
        <tbody id="invJurnalBody">${tplInvJurnalRows(row.jurnalAkun, isManual)}</tbody>
      </table>
    </div>
    ${isManual ? `<a href="#" id="invJurnalAddRow" class="link-add">${icon('plus',12)} Tambah Baris Jurnal</a>` : ''}
    <div style="max-width:260px;margin:16px 0 0 auto;">
      <div style="font-size:12.5px;font-weight:600;color:var(--text);margin-bottom:4px;">Jumlah Debit - Kredit</div>
      <input type="text" id="invJurnalSelisih" value="${invNum2(totals.selisih)}" readonly style="text-align:right;font-weight:700;color:${selisihColor};">
    </div>`;
}

/* Picker Akun GL untuk tabel Rincian Jurnal Akun (mode Manual) —
   SALINAN LOKAL dari pola tplJpAkunPicker()/tplJpAkunPickerRows()
   (jurnal-pembelian.template.js), diidentifikasi lewat data-row-idx
   (index baris di row.jurnalAkun) bukan fieldKey seperti Jurnal
   Pembelian, karena di sini akunnya per-baris tabel bukan per-field
   form. */
function tplInvAkunPicker(list){
  return `
    <div class="modal-box" style="max-width:640px;">
      <div class="modal-header"><span>Pilih Akun GL</span><span class="close" id="modalClose">&times;</span></div>
      <div class="modal-body">
        <input type="text" id="invAkunPickerSearch" placeholder="Cari kode / nama akun..." style="width:100%;border:1px solid var(--border);border-radius:6px;padding:8px 10px;font-size:12.8px;margin-bottom:12px;">
        <div class="table-wrap" style="max-height:360px;overflow:auto;">
          <table>
            <thead><tr><th>Kode</th><th>Nama Akun</th><th>Kat.</th><th></th></tr></thead>
            <tbody id="invAkunPickerBody">${tplInvAkunPickerRows(list)}</tbody>
          </table>
        </div>
      </div>
      <div class="modal-footer"><button class="btn-secondary" id="modalCancel">Tutup</button></div>
    </div>`;
}

function tplInvAkunPickerRows(list){
  if(!list.length) return `<tr><td colspan="4" style="color:var(--text-light);">Tidak ada akun ditemukan</td></tr>`;
  return list.map(a=>`
    <tr>
      <td>${a.kode}</td>
      <td>${a.nama}</td>
      <td>${a.kategori}</td>
      <td><button class="btn-pick" data-pick-akun="${a.kode}">Pilih</button></td>
    </tr>`).join('');
}

function tplInvForm(mode, row){
  const isAdd = mode === 'add';
  const titleAction = isAdd ? 'Tambah' : 'Ubah';
  const headerIcon = isAdd ? 'plus' : 'edit';
  return `
    <div class="breadcrumb">Home / Invoice / <b>${titleAction}</b></div>
    <div class="card">
      <div class="card-header dark-header">
        <h3>${icon(headerIcon,15)} ${isAdd?'+ Invoice':'Invoice'}</h3>
      </div>
      <div class="card-body">
        <h2 style="font-size:15px;font-weight:700;color:var(--navy);margin-bottom:14px;">INVOICE</h2>

        <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:16px;">
          <table class="field-table">
            <tr>
              <td class="flabel">Cabang</td>
              <td><select id="fInvCabang" ${!isAdd?'disabled':''}>${INV_CABANG_LIST.map(c=>`<option ${row.cabang===c?'selected':''}>${c}</option>`).join('')}</select></td>
            </tr>
            <tr>
              <td class="flabel">No. IVC</td>
              <td><input type="text" id="fInvNoIVC" value="${row.no||''}" readonly></td>
            </tr>
            <tr>
              <td class="flabel">No. SJ</td>
              <td>
                <div class="input-with-btn">
                  <input type="text" id="fInvNoSJ" value="${row.noSJ||''}" readonly>
                  ${isAdd ? `<button type="button" class="icon-btn edit" id="invRefreshNo" title="Generate Ulang Nomor">${icon('refreshCw',13)}</button>` : ''}
                </div>
              </td>
            </tr>
            <tr>
              <td class="flabel">Tgl</td>
              <td>
                <div class="input-with-btn">
                  <input type="text" id="fInvTgl" value="${row.tgl||''}" readonly>
                  <span class="icon-btn edit" style="pointer-events:none;">${icon('calendar',13)}</span>
                </div>
              </td>
            </tr>
            <tr>
              <td class="flabel">No SO</td>
              <td>
                <div class="input-with-btn">
                  <input type="text" id="fInvNoSO" value="${row.noSO||''}" placeholder="Pilih Sales Order" readonly>
                  <button type="button" class="icon-btn edit" id="invSoSearch" title="Cari Sales Order">${icon('search',13)}</button>
                </div>
              </td>
            </tr>
            <tr>
              <td class="flabel">No PL</td>
              <td>
                <div class="input-with-btn">
                  <input type="text" id="fInvNoPL" value="${row.noPL||''}" placeholder="Pilih Picking List" readonly>
                  <button type="button" class="icon-btn edit" id="invPlSearch" title="Cari Picking List">${icon('search',13)}</button>
                </div>
              </td>
            </tr>
            <tr>
              <td class="flabel">Principal</td>
              <td><input type="text" id="fInvPrincipal" value="${row.principalNama||''}" readonly></td>
            </tr>
            <tr>
              <td class="flabel">No DSC</td>
              <td><input type="text" id="fInvNoDSC" value="${row.noDSC||''}" placeholder="Diskon" readonly></td>
            </tr>
            <tr>
              <td class="flabel">No DOM</td>
              <td><input type="text" id="fInvNoDOM" value="" placeholder="Dominasi Konsumen" readonly></td>
            </tr>
          </table>

          <table class="field-table">
            <tr>
              <td class="flabel">Gudang</td>
              <td><select id="fInvGudang">${INV_GUDANG_LIST.map(g=>`<option ${row.gudang===g?'selected':''}>${g}</option>`).join('')}</select></td>
            </tr>
            <tr>
              <td class="flabel">Customer</td>
              <td>
                <input type="text" id="fInvCustomerNama" value="${row.customerNama||''}" readonly>
                <div style="font-size:11px;color:var(--text-light);margin-top:4px;">${row.customerKode||''}</div>
                <div style="font-size:11px;color:var(--text-light);margin-top:2px;">Kode Lama : </div>
              </td>
            </tr>
            <tr>
              <td class="flabel">Syarat Bayar</td>
              <td><select id="fInvSyaratBayar">${INV_SYARAT_BAYAR_LIST.map(s=>`<option ${row.syaratBayar===s?'selected':''}>${s}</option>`).join('')}</select></td>
            </tr>
            <tr>
              <td class="flabel">No SP</td>
              <td><input type="text" id="fInvNoSP" value="${row.noSP||''}" readonly></td>
            </tr>
            <tr>
              <td class="flabel">Tgl SP</td>
              <td><input type="text" id="fInvTglSP" value="${row.tglSP||''}" readonly></td>
            </tr>
            <tr>
              <td class="flabel">SP Asli</td>
              <td><div class="checkbox-row" style="margin:0;"><input type="checkbox" id="fInvSpAsli" ${row.spAsli?'checked':''}><label for="fInvSpAsli">SP Asli</label></div></td>
            </tr>
            <tr>
              <td class="flabel">SK ED</td>
              <td><div class="checkbox-row" style="margin:0;"><input type="checkbox" id="fInvSkEd" ${row.skEd?'checked':''}><label for="fInvSkEd">SK ED</label></div></td>
            </tr>
            <tr>
              <td class="flabel">CITO</td>
              <td>
                <div style="display:flex;align-items:center;gap:10px;">
                  <div class="checkbox-row" style="margin:0;"><input type="checkbox" id="fInvCito" ${row.cito?'checked':''}><label for="fInvCito">CITO</label></div>
                  <input type="text" id="fInvCitoTgl" value="${row.citoTgl||row.tgl||''}" readonly style="max-width:110px;">
                </div>
              </td>
            </tr>
          </table>

          <table class="field-table">
            <tr>
              <td class="flabel">Tipe Layanan</td>
              <td><select id="fInvLayanan">${DATA.layananList.map(l=>`<option ${row.layanan===l?'selected':''}>${l}</option>`).join('')}</select></td>
            </tr>
            <tr>
              <td class="flabel">Alamat Pengiriman</td>
              <td><textarea id="fInvAlamatKirim" class="po-textarea" rows="2">${row.alamatPengiriman||''}</textarea></td>
            </tr>
            <tr>
              <td class="flabel">Ship Via</td>
              <td><select id="fInvShipVia">${INV_SHIP_VIA_LIST.map(s=>`<option ${row.shipVia===s?'selected':''}>${s}</option>`).join('')}</select></td>
            </tr>
            <tr>
              <td class="flabel">No Resi</td>
              <td><input type="text" id="fInvNoResi" value="${row.noResi||''}" placeholder="No. Resi (opsional)"></td>
            </tr>
            <tr>
              <td class="flabel">Driver</td>
              <td>
                <div class="input-with-btn">
                  <input type="text" id="fInvDriver" value="${row.driver||''}" placeholder="Pilih Driver" readonly>
                  <button type="button" class="icon-btn edit" id="invDriverSearch" title="Cari Driver">${icon('search',13)}</button>
                </div>
              </td>
            </tr>
          </table>
        </div>

        <table class="field-table" style="margin-top:4px;">
          <tr>
            <td class="flabel">Keterangan</td>
            <td><textarea id="fInvKeterangan" class="po-textarea" rows="2">${row.keterangan||''}</textarea></td>
          </tr>
        </table>

        <div class="inv-tabs">
          <button type="button" class="inv-tab-btn active" id="invTabDetailBtn">Detail Transaksi</button>
          <button type="button" class="inv-tab-btn" id="invTabJurnalBtn">Rincian Jurnal Akun</button>
        </div>

        <div id="invTabDetailContent">
          <div class="card-header dark-header" style="border-radius:6px;margin:0 0 14px;">
            <h3>${icon('clipboard',14)} Produk</h3>
          </div>
          <div class="table-wrap" style="margin:6px 0 6px;">
            <table class="po-item-table">
              <thead><tr>
                <th>No</th>
                <th>Kode Barang</th>
                <th>Nama Barang</th>
                <th>Satuan</th>
                <th>Qty Pesan</th>
                <th>Qty Kirim</th>
                <th>Batch</th>
                <th>ED</th>
              </tr></thead>
              <tbody id="invItemsBody">${row.items.map((it,idx)=>tplInvItemRow(it,idx)).join('')}</tbody>
            </table>
          </div>
          <div id="invItemsEmptyHint" style="font-size:11.5px;color:var(--text-light);margin-top:6px;${row.items.length?'display:none;':''}">Belum ada barang — pilih No SO atau No PL terlebih dahulu.</div>
        </div>
        <div id="invTabJurnalContent" style="display:none;">${tplInvJurnalContent(row)}</div>

        <div style="font-size:11.8px;color:var(--text-light);margin-top:18px;line-height:1.7;">
          ${row.tglInput ? `Tgl. Input : ${row.tglInput}  User Entry : ${row.userInput||''}<br>` : ''}
          ${row.tglEdit ? `Tgl Edit : ${row.tglEdit}  User Edit : ${row.userEdit||''}` : ''}
        </div>

        <div class="form-page-actions">
          <a href="#" id="invBatalkan" class="link-add" style="margin-right:auto;">Batalkan</a>
          ${!isAdd ? `<button type="button" class="btn-teal" id="invCetak">${icon('printer',13)} Cetak</button>` : ''}
          <button class="btn-primary" id="invSimpan">Simpan</button>
        </div>
      </div>
    </div>`;
}

function tplInvDeleteConfirm(row){
  return `
    <div class="modal-box">
      <div class="modal-header"><span>Hapus Invoice</span><span class="close" id="modalClose">&times;</span></div>
      <div class="modal-body"><p>Yakin ingin menghapus Invoice <b>${row.no}</b>?</p></div>
      <div class="modal-footer">
        <button class="btn-secondary" id="modalCancel">Batal</button>
        <button class="btn-danger" id="modalDelete">Hapus</button>
      </div>
    </div>`;
}

function tplInvInfoModal(title,text){
  return `
    <div class="modal-box">
      <div class="modal-header"><span>${title}</span><span class="close" id="modalClose">&times;</span></div>
      <div class="modal-body"><p>${text}</p></div>
      <div class="modal-footer">
        <button class="btn-primary" id="modalOk">Mengerti</button>
      </div>
    </div>`;
}

/* Modal konfirmasi Posting — TRANSISI SATU ARAH (berbeda dari
   Checked/Terkirim di Picking List yang reversible lewat tombol
   trash "Batalkan Terkirim"): begitu posted:true, TIDAK ADA cara
   membatalkannya lagi dari UI ini, sesuai teks peringatan di modal. */
function tplInvPostingConfirm(row){
  return `
    <div class="modal-box">
      <div class="modal-header"><span>Posting Invoice</span><span class="close" id="modalClose">&times;</span></div>
      <div class="modal-body"><p>Posting Invoice <b>${row.no}</b> ini ke General Ledger? Setelah di-posting, invoice tidak dapat diubah atau dihapus lagi.</p></div>
      <div class="modal-footer">
        <button class="btn-secondary" id="modalCancel">Batal</button>
        <button class="btn-primary" id="modalConfirm">Ya, Posting</button>
      </div>
    </div>`;
}

function tplInvSoPicker(list){
  return `
    <div class="modal-box" style="max-width:620px;">
      <div class="modal-header"><span>Pilih Sales Order</span><span class="close" id="modalClose">&times;</span></div>
      <div class="modal-body">
        <div class="table-wrap" style="max-height:340px;overflow:auto;"><table>
          <thead><tr><th>No. SO</th><th>Customer</th><th>Wilayah</th><th></th></tr></thead>
          <tbody>${list.length ? list.map(s=>`<tr><td>${s.no}</td><td>${s.customer||''}</td><td>${s.wilayah||''}</td><td><button class="btn-pick" data-pick-so="${s.no}">Pilih</button></td></tr>`).join('') : `<tr><td colspan="4" style="color:var(--text-light);">Tidak ada Sales Order</td></tr>`}</tbody>
        </table></div>
      </div>
      <div class="modal-footer"><button class="btn-secondary" id="modalCancel">Tutup</button></div>
    </div>`;
}

function tplInvPlPicker(list){
  return `
    <div class="modal-box" style="max-width:640px;">
      <div class="modal-header"><span>Pilih Picking List</span><span class="close" id="modalClose">&times;</span></div>
      <div class="modal-body">
        <div class="table-wrap" style="max-height:340px;overflow:auto;"><table>
          <thead><tr><th>No. PL</th><th>Customer</th><th>No. SO</th><th></th></tr></thead>
          <tbody>${list.length ? list.map(p=>`<tr><td>${p.no}</td><td>${p.customerNama||''}</td><td>${p.noSO||''}</td><td><button class="btn-pick" data-pick-pl="${p.no}">Pilih</button></td></tr>`).join('') : `<tr><td colspan="4" style="color:var(--text-light);">Tidak ada Picking List</td></tr>`}</tbody>
        </table></div>
      </div>
      <div class="modal-footer"><button class="btn-secondary" id="modalCancel">Tutup</button></div>
    </div>`;
}

function tplInvDriverPicker(list){
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

/* =========================================================
   CETAK INVOICE — Half Page & Full Page (2026-08-19, lanjutan lagi)

   User mengirim 2 contoh PDF cetakan Invoice MASERP sungguhan ("Invoice
   Setengah Halaman" & "Invoice Full Page") dan minta menu List Transaksi
   Invoice dilengkapi fitur cetak beneran dengan 2 pilihan format ini —
   BEDA dari semua tombol "Cetak" lain di mockup ini sejauh ini (Purchase
   Order/Kas-Bank/dst.) yang SEMUANYA masih dekoratif ("Preview PDF akan
   tersedia di sini"). Ini fitur cetak PERTAMA di seluruh mockup yang
   benar-benar merender dokumen cetak nyata, bukan modal info kosong.

   PENDEKATAN: window.open('', '_blank') + document.write() sebuah
   dokumen HTML BERDIRI SENDIRI (doctype+head+<style> inline sendiri,
   SENGAJA TIDAK bergantung ke css/style.css utama supaya tab baru tetap
   tampil benar walau dibuka dari versi combined single-file maupun versi
   multi-file) — pola print-preview standar untuk aplikasi client-side
   tanpa server/PDF-generator sungguhan. Tab baru punya toolbar kecil
   (tombol "Cetak" -> window.print(), "Tutup" -> window.close()) yang
   disembunyikan lewat @media print supaya tidak ikut kecetak.

   PERBEDAAN dari 2 PDF acuan (disesuaikan untuk PT Distriversa Buanamas,
   distributor sembako/FMCG umum — BUKAN farmasi seperti perusahaan demo
   di PDF asli "PT. Satoria Distribusi Lestari"):
   - Logo "SDL" + nama perusahaan diganti badge biru "DBM" + "PT
     Distriversa Buanamas", NPWP & alamat disalin dari Profil Perusahaan
     (company-profile.template.js) supaya konsisten satu sumber data
     identitas perusahaan di seluruh mockup (lihat INV_PRINT_COMPANY).
   - Baris "Izin PBF"/"Izin DAK"/CDOB/CDAK (lisensi distribusi farmasi)
     DIHAPUS — tidak relevan untuk distributor sembako umum — diganti
     baris kontak umum (Alamat & Telepon perusahaan).
   - Tanda tangan "apt. Sakdiyah, S.Farm" + nomor SIPA (apoteker
     penanggung jawab, wajib khusus PBF farmasi) DIHAPUS, diganti label
     generik "Finance & Accounting" tanpa nama pribadi tertentu.
   - "Pembayaran Ditujukan" memakai data bank DBM sungguhan yang sudah
     ada (DATA.kasBank kode '110107' — Bank BCA HO), bukan VA dikarang.
   - "Salesman" & NPWP Customer diambil dari DATA.customers (field
     `salesman`/`npwp` yang sudah ada sejak modul Master Customer),
     "Tgl Order" dipetakan ke `row.tglSP` (tanggal Surat Pesanan dibuat,
     realistis sebagai "tanggal order" karena mendahului Tanggal Invoice).
   - Kolom "Batch & ED" & "%Disc" tetap ditampilkan (sesuai layout PDF)
     tapi %Disc SELALU 0 — model data DATA.invoices tidak menyimpan
     diskon per baris barang (beda dari Sales Order/Sales Quotation yang
     memang punya field Discount%) — disederhanakan, didokumentasikan di
     sini, bukan bug. Kolom "Kemasan" (Kg/Dimensi/Koli/Lbr) SELALU "-"
     karena DATA.items tidak menyimpan berat/dimensi per barang (precedent
     sama seperti field Dimensi di modul Price List By Province).
   - Formula Total/Potongan/DPP/Dpp Lain/PPN/Jumlah Tagihan DITURUNKAN
     PERSIS dari angka di kedua PDF acuan (diverifikasi manual): DPP =
     Total - Potongan; **Dpp Lain = DPP x 11/12; PPN = Dpp Lain x 12%**
     (skema "DPP Nilai Lain" pajak Indonesia — efeknya sama dengan PPN
     11% langsung dari DPP, tapi dihitung 2 tahap persis seperti contoh
     PDF: 787.329,70 x 11/12 = 721.718,89, x 12% = 86.606,27); Jumlah
     Tagihan = DPP + PPN + Biaya Kirim (angka speler dari PDF acuan
     [787.329,70+86.606,27=873.935,97] cocok persis dengan hasil formula
     ini). PPH SELALU 0 (mockup ini tidak memodelkan PPh di Invoice).
   - Beda Half Page vs Full Page (PERSIS mengikuti 2 PDF acuan): (1) Half
     Page menampilkan TOP sebagai teks penuh ("Kredit 45 Hari"), Full
     Page menampilkan kode singkat ("D45") — `invPrintTopCode()`; (2)
     Full Page saja yang punya kotak "Keterangan" (textarea kosong/isi
     row.keterangan) sebelum tabel total; (3) Full Page saja punya kolom
     "PPH" di tabel total; (4) Full Page diberi spacer kosong lebih besar
     supaya mengisi 1 halaman A4 penuh (persis PDF acuan yang menampilkan
     banyak whitespace), Half Page dibuat ringkas/rapat.
   - "Cetakan ke-N" (ditampilkan sebagai "Cetakan ke-N" di pojok kanan
     bawah dokumen, meniru "Reprint ke 1" di PDF asli) memakai pola
     PERSIS `cetakanKe` di Purchase Order (openPoCetak()) — counter di
     DATA.invoices[idx] SELALU ikut bertambah, baik dicetak dari tombol
     printer di LIST maupun dari tombol "Cetak" di dalam FORM Ubah (lihat
     openInvPrintWindow() di invoice.js). ========================================================= */

const INV_PRINT_COMPANY = {
  // Disalin dari company-profile.template.js (tplCompanyProfile()) —
  // SENGAJA disalin bukan direferensi cross-file, supaya invoice.template.js
  // tetap independen dari lazy-load company-profile.template.js (lazy-load
  // antar modul tidak terjamin urutannya, konvensi yang sama seperti semua
  // "salinan lokal" lain di mockup ini).
  nama: 'PT Distriversa Buanamas',
  npwp: '01.234.567.8-901.000',
  alamat: 'Jl. Raya Industri No. 88, Jakarta Utara, DKI Jakarta',
  telp: '(021) 555-8899',
};

const INV_PRINT_BULAN = ['Jan','Feb','Mar','Apr','Mei','Jun','Jul','Agu','Sep','Okt','Nov','Des'];

/* Bank tujuan pembayaran — pakai 1 rekening DBM sungguhan yang sudah ada
   di DATA.kasBank (kode '110107', Bank BCA HO) supaya konsisten dengan
   modul Kas/Bank, bukan nomor VA yang dikarang baru. */
function invPrintBank(){
  return DATA.kasBank.find(b => b.kode === '110107') || { nama:'Bank BCA HO', noRekening:'' };
}

function invPrintFormatTgl(dstr){
  if(!dstr) return '';
  const parts = dstr.split('/').map(Number);
  const d = parts[0], m = parts[1], y = parts[2];
  if(!d || !m || !y) return dstr;
  return `${d} ${INV_PRINT_BULAN[m-1]} ${y}`;
}

function invPrintFormatEd(ed){
  if(!ed) return '';
  const parts = ed.split('-');
  if(parts.length < 2) return ed;
  return `${parts[0]}/${parts[1]}`;
}

/* Ambil jumlah hari kredit dari teks Syarat Bayar (mis. "Kredit 45
   Hari" -> 45). "CBD" (Cash Before Delivery) atau teks tanpa angka
   dianggap 0 hari (jatuh tempo = tanggal Invoice sendiri). */
function invPrintTopDays(syaratBayar){
  const m = /(\d+)/.exec(syaratBayar || '');
  return m ? (+m[1]) : 0;
}

/* Full Page menampilkan TOP sebagai kode singkat ("D45") persis PDF
   acuan — Half Page tetap menampilkan teks penuh (row.syaratBayar apa
   adanya), lihat tplInvPrintDoc(). */
function invPrintTopCode(syaratBayar){
  const days = invPrintTopDays(syaratBayar);
  return days > 0 ? ('D' + days) : (syaratBayar || '');
}

function invPrintJthTempo(tglStr, syaratBayar){
  if(!tglStr) return '';
  const parts = tglStr.split('/').map(Number);
  const d = parts[0], m = parts[1], y = parts[2];
  if(!d || !m || !y) return '';
  const dt = new Date(y, m-1, d);
  dt.setDate(dt.getDate() + invPrintTopDays(syaratBayar));
  return `${dt.getDate()} ${INV_PRINT_BULAN[dt.getMonth()]} ${dt.getFullYear()}`;
}

function invPrintRound2(n){ return Math.round((+n||0) * 100) / 100; }

/* Baris tabel barang utk dokumen cetak — Harga Satuan dari master
   DATA.items (sama sumbernya seperti invRecalcJumlah()), %Disc SELALU 0
   (lihat catatan besar di atas soal kenapa). */
function invPrintItems(row){
  return (row.items || []).map((it, i) => {
    const master = DATA.items.find(x => x.kode === it.kode);
    const harga = master ? (+master.harga || 0) : 0;
    const qty = +it.qtyKirim || 0;
    const disc = 0;
    const jumlahHarga = invPrintRound2(harga * qty * (1 - disc/100));
    const batchEd = [it.batch || '', invPrintFormatEd(it.ed)].filter(Boolean).join(' - ');
    return { no: i+1, kode: it.kode, nama: it.nama, batchEd, qty, uom: it.satuan || '', harga, disc, jumlahHarga };
  });
}

/* Formula total — lihat catatan besar di atas (DPP Lain = DPP x 11/12,
   PPN = DPP Lain x 12%) diturunkan & diverifikasi dari angka di kedua
   PDF acuan. */
function invPrintTotals(items){
  const total = invPrintRound2(items.reduce((s,it) => s + it.jumlahHarga, 0));
  const potongan = 0;
  const dpp = invPrintRound2(total - potongan);
  const dppLain = invPrintRound2(dpp * 11/12);
  const ppn = invPrintRound2(dppLain * 0.12);
  const pph = 0;
  const biayaKirim = 0;
  const jumlahTagihan = invPrintRound2(dpp + ppn + biayaKirim);
  return { total, potongan, dpp, dppLain, ppn, pph, biayaKirim, jumlahTagihan };
}

/* ===== Terbilang (angka -> teks Rupiah), belum pernah ada di modul
   manapun sebelumnya di mockup ini — dibutuhkan persis oleh baris
   "Terbilang :" di kedua PDF acuan. Diverifikasi cocok 100% dengan
   contoh di PDF: 873.935,97 -> "Delapan Ratus Tujuh Puluh Tiga Ribu
   Sembilan Ratus Tiga Puluh Lima Rupiah koma Sembilan Puluh Tujuh". ===== */
const INV_TERBILANG_SATUAN = ['','satu','dua','tiga','empat','lima','enam','tujuh','delapan','sembilan','sepuluh','sebelas'];
function terbilangAngka(n){
  n = Math.floor(n);
  if(n < 0) return ('minus ' + terbilangAngka(-n)).trim();
  if(n < 12) return INV_TERBILANG_SATUAN[n];
  if(n < 20) return (terbilangAngka(n-10) + ' belas').trim();
  if(n < 100) return (terbilangAngka(Math.floor(n/10)) + ' puluh ' + (n%10!==0 ? terbilangAngka(n%10) : '')).trim();
  if(n < 200) return ('seratus ' + (n-100!==0 ? terbilangAngka(n-100) : '')).trim();
  if(n < 1000) return (terbilangAngka(Math.floor(n/100)) + ' ratus ' + (n%100!==0 ? terbilangAngka(n%100) : '')).trim();
  if(n < 2000) return ('seribu ' + (n-1000!==0 ? terbilangAngka(n-1000) : '')).trim();
  if(n < 1000000) return (terbilangAngka(Math.floor(n/1000)) + ' ribu ' + (n%1000!==0 ? terbilangAngka(n%1000) : '')).trim();
  if(n < 1000000000) return (terbilangAngka(Math.floor(n/1000000)) + ' juta ' + (n%1000000!==0 ? terbilangAngka(n%1000000) : '')).trim();
  if(n < 1000000000000) return (terbilangAngka(Math.floor(n/1000000000)) + ' milyar ' + (n%1000000000!==0 ? terbilangAngka(n%1000000000) : '')).trim();
  return String(n);
}
function invPrintTitleCase(str){
  return str.split(' ').filter(Boolean).map(w => w === 'koma' ? w : (w.charAt(0).toUpperCase() + w.slice(1))).join(' ');
}
function terbilangRupiah(value){
  const v = Math.max(0, +value || 0);
  const intPart = Math.floor(v);
  const cents = Math.round((v - intPart) * 100);
  let words = (intPart === 0 ? 'nol' : terbilangAngka(intPart)) + ' rupiah';
  if(cents > 0) words += ' koma ' + terbilangAngka(cents);
  return invPrintTitleCase(words);
}

/* Dokumen cetak lengkap (doctype+head+body BERDIRI SENDIRI) — lihat
   catatan desain besar di atas untuk penjelasan lengkap setiap
   penyesuaian. mode: 'half' | 'full'. */
function tplInvPrintDoc(row, mode){
  const isFull = mode === 'full';
  const customer = DATA.customers.find(c => c.kode === row.customerKode);
  const salesman = customer ? (customer.salesman || '') : '';
  const npwpCustomer = customer ? (customer.npwp || '-') : '-';
  const bank = invPrintBank();
  const items = invPrintItems(row);
  const totals = invPrintTotals(items);
  const cetakanKe = row.cetakanKe || 1;

  const itemRows = items.length ? items.map(it => `
    <tr>
      <td class="c">${it.no}</td>
      <td>${it.kode}</td>
      <td>${it.nama}</td>
      <td>${it.batchEd || '-'}</td>
      <td class="r">${num(it.qty)}</td>
      <td class="c">${it.uom}</td>
      <td class="r">${invNum2(it.harga)}</td>
      <td class="r">${invNum2(it.disc)}</td>
      <td class="r">${invNum2(it.jumlahHarga)}</td>
    </tr>`).join('') : `<tr><td colspan="9" class="c" style="color:#8a90a3;">Tidak ada barang</td></tr>`;

  return `<!DOCTYPE html>
<html lang="id">
<head>
<meta charset="UTF-8">
<title>${isFull ? 'Invoice Full Page' : 'Invoice Half Page'} - ${row.no}</title>
<style>
  * { box-sizing:border-box; }
  body { font-family:Arial, Helvetica, sans-serif; font-size:${isFull?'11.5px':'10.5px'}; color:#33384a; margin:0; padding:0; background:#e9ebf1; }
  .print-toolbar { position:sticky; top:0; background:#33384a; padding:10px 16px; display:flex; gap:10px; justify-content:flex-end; z-index:9; }
  .print-toolbar button { padding:7px 16px; border:none; border-radius:5px; font-size:12.5px; cursor:pointer; font-weight:600; }
  .print-toolbar .btn-print { background:#17c3c3; color:#fff; }
  .print-toolbar .btn-close { background:#e3e6ee; color:#33384a; }
  .page { max-width:800px; margin:18px auto ${isFull?'60px':'18px'}; background:#fff; padding:22px 26px; box-shadow:0 1px 6px rgba(0,0,0,.15); }
  table { border-collapse:collapse; width:100%; }
  .c { text-align:center; } .r { text-align:right; }
  .hdr-table td { vertical-align:top; padding:4px 8px; border:1px solid #33384a; }
  .hdr-title-cell { text-align:center; font-weight:700; font-size:13px; }
  .logo-row { display:flex; align-items:center; gap:10px; }
  .logo-badge { width:40px; height:40px; border-radius:8px; background:#4472c4; color:#fff; display:flex; align-items:center; justify-content:center; font-weight:700; font-size:13px; flex:none; }
  .company-name { font-weight:700; font-size:13px; }
  .company-npwp { font-size:10.5px; }
  .company-contact { font-size:10px; color:#8a90a3; margin:3px 0 8px; }
  .info-table td { border:1px solid #33384a; padding:6px 8px; vertical-align:top; width:33.33%; }
  .info-label { font-weight:700; margin-bottom:2px; }
  .item-table { margin-top:10px; }
  .item-table th, .item-table td { border:1px solid #33384a; padding:4px 6px; }
  .item-table th { background:#eef1f8; font-size:${isFull?'11px':'10px'}; }
  .keterangan-box { margin-top:14px; }
  .keterangan-box .ket-line { border:1px solid #33384a; min-height:60px; padding:6px 8px; margin-top:4px; }
  .filler { min-height:${isFull?'230px':'6px'}; }
  .totals-table { margin-top:10px; }
  .totals-table th, .totals-table td { border:1px solid #33384a; padding:5px 6px; font-size:${isFull?'11px':'10px'}; }
  .totals-table th { background:#eef1f8; }
  .terbilang { margin-top:8px; font-size:${isFull?'11px':'10px'}; }
  .sign-table { margin-top:14px; }
  .sign-table td { border:none; vertical-align:top; padding:8px 6px 0 0; }
  .sign-space { height:50px; }
  .sign-role { color:#8a90a3; font-size:10px; }
  .perhatian { font-size:9.5px; line-height:1.5; }
  .kemasan-table td { border:1px solid #33384a; padding:3px 6px; font-size:10px; }
  .hal, .reprint { font-size:10px; text-align:right; margin-top:4px; }
  @media print {
    body { background:#fff; }
    .print-toolbar { display:none; }
    .page { box-shadow:none; margin:0; max-width:none; }
  }
</style>
</head>
<body>
  <div class="print-toolbar">
    <button class="btn-print" onclick="window.print()">${'Cetak'}</button>
    <button class="btn-close" onclick="window.close()">Tutup</button>
  </div>
  <div class="page">

    <table class="hdr-table">
      <tr>
        <td rowspan="2" style="width:55%;">
          <div class="logo-row">
            <div class="logo-badge">DBM</div>
            <div>
              <div class="company-name">${INV_PRINT_COMPANY.nama}</div>
              <div class="company-npwp">NPWP : ${INV_PRINT_COMPANY.npwp}</div>
            </div>
          </div>
        </td>
        <td class="hdr-title-cell">INVOICE</td>
      </tr>
      <tr>
        <td>
          <div style="display:flex;justify-content:space-between;gap:10px;">
            <b>${row.no}</b><span>Tanggal : ${invPrintFormatTgl(row.tgl)}</span>
          </div>
        </td>
      </tr>
    </table>
    <div class="company-contact">Alamat : ${INV_PRINT_COMPANY.alamat} &nbsp;|&nbsp; Telp : ${INV_PRINT_COMPANY.telp}</div>

    <table class="info-table">
      <tr>
        <td>
          No. SP : ${row.noSP || '-'}<br>
          Tgl Order : ${invPrintFormatTgl(row.tglSP) || '-'}<br>
          Salesman : ${salesman || '-'}<br>
          No. SO : ${row.noSO || '-'}<br>
          TOP : ${isFull ? invPrintTopCode(row.syaratBayar) : (row.syaratBayar||'')}<br>
          Jth Tempo : ${invPrintJthTempo(row.tgl, row.syaratBayar)}<br>
          Pembayaran Ditujukan:<br>
          ${INV_PRINT_COMPANY.nama}<br>
          ${bank.nama} : ${bank.noRekening || '-'}
        </td>
        <td>
          <div class="info-label">Kepada Yth.</div>
          <b>${row.customerNama || ''}</b><br>
          ${row.customerAlamat || ''}<br>
          Kode Pelanggan: ${row.customerKode || ''}<br>
          NPWP : ${npwpCustomer}
        </td>
        <td>
          <div class="info-label">Alamat Pengiriman:</div>
          ${row.alamatPengiriman || row.customerAlamat || ''}
        </td>
      </tr>
    </table>

    <table class="item-table">
      <thead><tr>
        <th>No.</th><th>Kode Barang</th><th>Nama Barang</th><th>Batch &amp; ED</th><th>Qty</th><th>UoM</th><th>Harga Satuan</th><th>%Disc</th><th>Jumlah Harga</th>
      </tr></thead>
      <tbody>${itemRows}</tbody>
    </table>

    ${isFull ? `
    <div class="keterangan-box">
      <b>Keterangan :</b>
      <div class="ket-line">${row.keterangan || '-'}</div>
    </div>` : ''}

    <div class="filler"></div>

    <table class="totals-table">
      <thead><tr>
        <th>Total</th><th>Potongan</th><th>DPP</th><th>Dpp Lain</th><th>PPN</th>${isFull ? '<th>PPH</th>' : ''}<th>Biaya Kirim</th><th>Jumlah Tagihan</th>
      </tr></thead>
      <tbody><tr>
        <td class="r">${invNum2(totals.total)}</td>
        <td class="r">${invNum2(totals.potongan)}</td>
        <td class="r">${invNum2(totals.dpp)}</td>
        <td class="r">${invNum2(totals.dppLain)}</td>
        <td class="r">${invNum2(totals.ppn)}</td>
        ${isFull ? `<td class="r">${invNum2(totals.pph)}</td>` : ''}
        <td class="r">${invNum2(totals.biayaKirim)}</td>
        <td class="r">${invNum2(totals.jumlahTagihan)}</td>
      </tr></tbody>
    </table>

    <div class="terbilang">Terbilang : ${terbilangRupiah(totals.jumlahTagihan)}</div>

    <table class="sign-table">
      <tr>
        <td style="width:22%;">
          Hormat Kami,
          <div class="sign-space"></div>
          ( _____________________ )<br>
          <span class="sign-role">Finance &amp; Accounting</span>
        </td>
        <td style="width:16%;">
          Penerima<br>Tgl &amp; Jam,
          <div class="sign-space"></div>
        </td>
        <td>
          <div class="perhatian">
            <b>Perhatian;</b><br>
            1. Barang yang telah diterima dengan baik tidak dapat dikembalikan atau ditukar dengan barang lain.<br>
            2. Invoice ASLI berlaku sebagai kwitansi<br>
            3. Tidak menerima pembayaran tunai<br>
            4. Pembayaran dengan Cheque atau Giro harus ada atas nama ${INV_PRINT_COMPANY.nama} dan dianggap lunas setelah diuangkan
          </div>
        </td>
        <td style="width:16%;">
          <table class="kemasan-table">
            <tr><td>Kg</td><td class="r">-</td></tr>
            <tr><td>Dimensi</td><td class="r">-</td></tr>
            <tr><td>Koli</td><td class="r">-</td></tr>
            <tr><td>Lbr</td><td class="r">-</td></tr>
          </table>
          <div class="hal">Hal 1/1</div>
          <div class="reprint">Cetakan ke-${cetakanKe}</div>
        </td>
      </tr>
    </table>

  </div>
</body>
</html>`;
}
