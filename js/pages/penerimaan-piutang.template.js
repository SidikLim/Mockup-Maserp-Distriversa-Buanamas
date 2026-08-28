/* =========================================================
   TEMPLATE (HTML saja) — Penerimaan Piutang (Customer & Penjualan >
   Daftar Transaksi > Penerimaan Piutang, key page:'penerimaanPiutang').
   Semua fungsi di file ini HANYA menyusun & mengembalikan markup HTML
   (string) atau helper murni, TIDAK ada DOM-binding di sini. Logic-nya
   ada di file sebelah: penerimaan-piutang.js

   2 screenshot MASERP yang dikirim user ("+ Penerimaan Piutang" — form
   dengan tabel 1 baris Akun Bank/Nama Bank/Kurs/dst + tab "Lunasi
   Beberapa Faktur"/"Rincian Jurnal Akun", dan "Daftar Penerimaan
   Piutang" — list 7 kolom + Lihat/Cetak/Ubah/Hapus) dijadikan acuan
   LAYOUT. Semua data contoh di screenshot (No. Transaksi, nama customer
   "HERMINA BOGOR" dkk — rumah sakit/apotek, demo perusahaan FARMASI
   yang tidak ada hubungannya dengan DBM) DIGANTI total dengan customer
   DBM sendiri (DATA.customers yang sudah ada — Toko Sumber Rejeki dkk,
   FMCG/sembako, bukan RS/apotek).

   Sebelumnya page:'penerimaanPiutang' cuma pemetaan generik read-only
   ({title,cols,rows} di objek `pages` dalam renderPage(), js/core.js,
   4 baris dummy {no,tgl,customer,jumlah,metode} tanpa hubungan ke
   modul lain) — SUDAH DIHAPUS, digantikan modul CRUD sungguhan ini
   yang BENAR-BENAR chained ke DATA.invoices: hanya Invoice yang sudah
   di-Posting (posted:true, lihat openInvPostingConfirm() di invoice.js)
   DAN masih ada sisa piutang (jumlah - dibayar > 0) untuk Customer yang
   dipilih yang muncul di tab "Lunasi Beberapa Faktur" — persis proses
   AR (Account Receivable) sungguhan: invoice yang belum di-posting ke
   GL belum bisa ditagih. Field `dibayar` (baru) ditambahkan ke tiap
   baris DATA.invoices (default 0, additive — field lain tidak disentuh)
   supaya modul ini bisa menandai berapa yang sudah dibayar per invoice
   tanpa mengubah struktur invoice yang sudah ada.

   Penomoran No. Transaksi: screenshot aslinya "26/CL-TGR/08/00101"
   (tanda hubung antara "CL" & kode cabang) — TIDAK konsisten dengan
   konvensi penomoran app ini yang SELALU pakai garis miring penuh
   (26/SI/TGR/08/00001 Invoice, 26/PKL/... Picking List, 26/PO/...
   Purchase Order, dst — lihat INV_CABANG_LIST/invGenerateNumbers() di
   invoice.js). Dinormalisasi jadi "26/CL/{KodeCabang}/08/{urut}" ("CL"
   = Collection) supaya konsisten dgn modul lain, PP_CABANG_LIST/
   PP_CABANG_CODE di bawah adalah SALINAN LOKAL dari INV_CABANG_LIST/
   INV_CABANG_CODE (bukan reference lintas modul — lihat catatan "local
   copy" yang sama di semua modul transaksi lain, karena urutan lazy-
   load antar modul tidak terjamin).

   Format angka uang di MODUL INI SENGAJA TANPA prefix "Rp" (beda dari
   rp() global di data.js yang selalu pakai "Rp ") — persis meniru 2
   screenshot yang dikirim user: setiap kotak/kolom angka (Jumlah Bank,
   Setelah Konversi Kurs, Total Pembayaran, Jumlah Piutang, Reminder,
   Pembayaran, kolom "Jumlah" di list) selalu tampil polos 2 desimal
   ("2.620.948,00") tanpa "Rp". Helper lokal ppNum2() di bawah (salinan
   pola invNum2() di invoice.template.js) sengaja dipakai di SELURUH
   modul ini, BUKAN rp()/num() global — supaya tidak disalahartikan jadi
   bug inkonsistensi di kemudian hari, catatan ini sengaja ditulis
   panjang.

   Kurs/Kurs Target: seluruh mockup ini IDR-only (belum ada engine multi-
   currency sungguhan), jadi Kurs & Kurs Target tetap field dekoratif
   ("1,00", tetap bisa diketik ulang tapi tidak mempengaruhi apa pun
   selain dipakai sebagai pengali di ppRecalcTotals() — karena utk IDR
   nilainya selalu 1 hasilnya sama saja).

   "Badan Usaha" & "No. Penagihan Piutang": dekoratif, belum ada master
   data sungguhan di mockup ini untuk keduanya. "Badan Usaha" jadi input
   teks kosong biasa (opsional). "No. Penagihan Piutang" pakai pola
   SALINAN "picker dekoratif dengan dataset kosong" milik Sales Order
   (tplSoDecorativePicker/No.SQ-No.SP-No.DSC) — di sini jadi
   tplPpDecorativePicker(), dataset SELALU kosong (tidak ada modul
   "Penagihan Piutang" terpisah di mockup ini) sehingga modalnya selalu
   menampilkan "Tidak ada data" + tombol Tutup saja.

   Kolom "Jurnal" di baris tabel Akun Bank SENGAJA auto-terisi read-only
   dari Akun Bank yang dipilih (kode + nama), BUKAN picker Akun GL
   terpisah — karena begitu Akun Bank dipilih, akun GL Kas/Bank yang
   didebit otomatis sudah jelas, picker kedua hanya akan duplikatif.

   Tab "Rincian Jurnal Akun" di sini SENGAJA versi SEDERHANA (cuma mode
   Otomatis, tanpa toggle Manual seperti Jurnal Invoice) — 2 baris tetap:
   Debit [Akun Bank terpilih] / Kredit "Piutang Usaha" (1120001), re-
   kalkulasi reaktif dari Total Pembayaran (mirror persis kebalikan dari
   jurnal Invoice: Invoice men-debit Piutang Usaha saat penjualan, modul
   ini meng-kredit-nya saat piutang itu dilunasi). Mode Manual tidak
   dibuatkan di sini karena TIDAK ADA screenshot rincian tab ini yang
   dikirim user (2 screenshot yang ada cuma menampilkan tab "Lunasi
   Beberapa Faktur") — style tab (.inv-tabs/.inv-tab-btn) & tabel
   (.po-item-table) tetap DI-REUSE dari CSS global (css/style.css, bukan
   fungsi JS Invoice) supaya visualnya tetap konsisten satu app.

   Hapus (Hapus button di list): MENGEMBALIKAN `dibayar` yang sudah
   dikurangkan ke tiap Invoice yang direferensikan row.fakturs[].invoiceNo
   (kalau ada) sebelum baris Penerimaan Piutang itu sendiri dihapus —
   supaya pembukuan AR tetap konsisten (beda dari Invoice yang cukup
   splice tanpa reversal, karena hapus 1 Invoice tidak mempengaruhi
   baris lain).

   Cetak (dropdown list & tombol "Cetak dan Simpan" di form) SENGAJA
   dekoratif di modul ini (buka modal info) — fitur cetak sungguhan yang
   dibangun sesi ini scope-nya khusus modul Invoice (2 contoh PDF Half
   Page/Full Page yang dikirim user), belum ada contoh cetakan
   Penerimaan Piutang yang dikirim.

   8 baris sample DATA.penerimaanPiutang (lihat js/data.js): 2 baris
   PERTAMA benar-benar chained ke DATA.invoices sungguhan (Toko Sumber
   Rejeki 26/SI/HO/08/00001 lunas penuh; Toko Family Mart Jaya
   26/SI/HO/08/00002 lunas sebagian, sisa 200.000 masih outstanding) —
   membuktikan mekanisme `dibayar` ini nyata, bukan sekadar teks
   dekoratif. 6 baris sisanya historis/dekoratif saja (nomor transaksi
   Juli, tidak terhubung ke DATA.invoices yang cuma berisi Agustus) —
   pola yang sama seperti baris historis di modul lain (1 baris "hidup"
   untuk pembuktian ujung-ke-ujung, sisanya ilustrasi). UD Makmur Jaya
   punya Invoice 26/SI/SBY/08/00001 (posted, 880.000, dibayar:0) yang
   SENGAJA dibiarkan belum lunas — pilih customer ini saat mencoba
   "+ Tambah" untuk melihat baris itu muncul nyata di tab Lunasi
   Beberapa Faktur.

   ===== PPN/PPH Ditanggung Customer (fitur baru 2026-08-20) =====
   Sesuai screenshot MASERP tambahan yang dikirim user (form Penerimaan
   Piutang dgn box "Ada potongan Ppn?"/"Ada potongan Pph?" di bawah 1
   baris faktur) + spesifikasi teks lengkap: kadang PPN dan/atau PPH atas
   1 faktur DITANGGUNG/DIPUNGUT LANGSUNG oleh Customer (customer sbg
   Wajib Pungut) — artinya perusahaan TIDAK menerima cash sebesar nilai
   pajak itu, tapi tetap mengakui piutang itu LUNAS penuh (nilai pajak
   dipindah jadi tagihan/receivable terpisah ke Customer berupa bukti
   Surat Setoran Pajak/SSP yang menyusul kemudian).

   Per BARIS FAKTUR (bukan per dokumen) ditambah field baru: potonganPpn/
   potonganPph (checkbox gate, tampilkan sub-panel kalau true),
   sudahTerimaSspPpn/sudahTerimaSspPph (checkbox — SSP sudah diterima
   SAAT pelunasan ini juga, vs menyusul), pphKode (dari PP_PPH_LIST,
   default 'PPH 22 (1.5%)'), noNtpnPpnAda/noNtpnPpn/tglNtpnPpn &
   noNtpnPphAda/noNtpnPph/tglNtpnPph (checkbox+teks+tanggal dekoratif,
   no. bukti setor pajak, tanpa validasi format).

   Nominal AR SSP PPN/PPH DIHITUNG (bukan diketik manual), lihat
   ppFakturTax() di penerimaan-piutang.js: DPP = Pembayaran / 1,11 (2
   desimal), PPN = Pembayaran - DPP, PPH = DPP x %KodePPH — sama dgn
   formula "DPP Nilai Lain" fitur cetak Invoice (DPP x 11/12 x 12% ==
   DPP x 11%, ditulis 1 langkah karena tak perlu tampil 2-tahap di
   sini), diverifikasi cocok 100% dgn screenshot (Pembayaran 100.703.640
   -> DPP 90.724.000, PPN 9.979.640, PPH 1,5% 1.360.860). Basis dihitung
   dari pembayaran (bukan reminder) supaya proporsional kalau faktur
   dibayar sebagian.

   Jumlah Bank (cash yang benar-benar diterima) dikurangi potongan pajak
   per faktur yang dicentang potonganPpn/potonganPph (ppRecalcTotals()).
   Jumlah Piutang TETAP nilai gross (piutang dianggap lunas penuh walau
   sebagian "dibayar" dlm bentuk pajak yang dipungut, bukan cash).

   Jurnal (tab Rincian Jurnal Akun) jadi DINAMIS (ppBuildJurnalLines()):
   baris Bank(D)/Piutang Usaha(K) tetap selalu ada (Bank=net cash,
   Piutang=gross); kalau ada faktur dgn potongan tapi BELUM terima SSP
   -> tambah baris Debit "Akun AR SSP PPN/PPH"; kalau SUDAH terima SSP
   -> langsung Debit "Akun PPn Pemungut"/"Akun Uang Muka PPH 22" (skip
   AR SSP). Kedua kondisi SELALU balance ke jumlahPiutang gross di kedua
   sisi — dicek manual dgn contoh user (Piutang 11.100.000, PPN
   1.100.000, PPH 150.000, Bank 9.850.000): baik belum-terima maupun
   sudah-terima sama2 9.850.000+1.100.000+150.000=11.100.000. CATATAN
   KOREKSI: teks asli user menulis "PPn Pemungut(K)"/"Uang Muka PPH
   22(K)" utk skenario sudah-terima — itu TIDAK balance (12.350.000 vs
   9.850.000). Setelah dicek ulang itu salah ketik — seharusnya (D)
   bukan (K) supaya Debit Bank+PPnPemungut+UMPPH22 = Kredit Piutang,
   sama polanya dgn skenario belum-terima, cuma akun Debit-nya beda.
   Diperbaiki jadi (D) di implementasi ini.

   4 akun baru (AR SSP PPN 1120003, AR SSP PPH 1120004, PPN Pemungut
   2120003, Uang Muka PPH 22 1140003 — lihat DATA.akunGL) DIBACA dari
   DATA.jurnalPenjualan[0] (field akunARSSPPPN/akunARSSPPPH/
   akunPPNPemungut/akunUangMukaPPH22, section baru di master Jurnal
   Penjualan) dgn fallback ke kode di atas kalau kosong — beda dari akun
   Bank/Piutang Usaha yang tetap hardcoded lokal, supaya field "tambah
   akun di master jurnal" yang diminta user benar2 terpakai.

   Menu baru "Transaksi A.R. SSP" (Customer & Penjualan > Daftar
   Transaksi, sebelumnya placeholder — lihat js/pages/penerimaan-ssp.*)
   dipakai saat bukti SSP PPN/PPH yang tadinya belum diterima akhirnya
   diterima dari Customer — modul itu men-flip sudahTerimaSspPpn/Pph
   jadi true & membuat 1 baris histori "Nota Kredit"
   (DATA.penerimaanSsp) dgn jurnal PPn Pemungut(D)/Uang Muka PPH22(D)/
   AR SSP PPN(K)/AR SSP PPH(K).
========================================================= */

const PP_CABANG_LIST = ['Head Office','Surabaya','Bandung','Medan','Makassar','Semarang','Tangerang','Sidoarjo'];
const PP_CABANG_CODE = {'Head Office':'HO','Surabaya':'SBY','Bandung':'BDG','Medan':'MDN','Makassar':'MKS','Semarang':'SMG','Tangerang':'TGR','Sidoarjo':'SDA'};
const PP_TIPE_TRANSAKSI_LIST = ['Terima Kas','Terima Giro','Terima Cek'];

/* Daftar Kode PPH utk field "Pilih Kode PPH" (fitur PPN/PPH ditanggung
   customer, 2026-08-20 — lihat catatan besar di bawah). BUKAN reference
   ke PO_PPH_LIST/PBB_PPH_LIST (Purchase Order/Pembelian BPB) — daftar
   & tarif di sana untuk konteks PEMBELIAN (PPh 22 0.3% atas pembelian
   barang tertentu), beda konteks dengan PPh yang dipotong Customer saat
   membayar Piutang (umumnya PPh 22 1,5% utk penjualan ke Wajib Pungut).
   Kode ditulis PERSIS format screenshot user ("PPH 22 (1.5%)", dengan
   tanda %, beda gaya penulisan dari "PPH 22 (0.3)" milik PO). */
const PP_PPH_LIST = [
  {kode:'PPH 22 (1.5%)', persen:1.5},
  {kode:'PPH 23 (2%)', persen:2},
  {kode:'PPH 4(2) (2.5%)', persen:2.5},
];

function ppNum2(n){ return Number(n||0).toLocaleString('id-ID', {minimumFractionDigits:2, maximumFractionDigits:2}); }

/* =====================================================================
   LIST PAGE
===================================================================== */
function tplPenerimaanPiutangListPage(){
  return `
    <div class="breadcrumb">Home / <b>Penerimaan Piutang</b></div>
    <div class="card">
      <div class="card-header dark-header">
        <h3>${icon('wallet',15)} Daftar Penerimaan Piutang</h3>
        <div class="toolbar-actions">
          <select class="chip-btn" id="ppPeriodFilter"><option>Agustus 2026</option></select>
          <button class="btn-primary" id="btnPpAdd">${icon('plus',14)} Tambah</button>
        </div>
      </div>
      <div class="table-toolbar">
        <select id="ppPageSize"><option selected>10</option><option>25</option><option>50</option></select>
        <input type="text" id="ppSearch" placeholder="Pencarian Global">
      </div>
      <div class="table-wrap"><table>
        <thead><tr>
          <th>No. Transaksi</th>
          <th>No. Faktur</th>
          <th>Customer</th>
          <th>No. Penagihan Piutang</th>
          <th>Tgl. Trn.</th>
          <th>Keterangan</th>
          <th>Jumlah</th>
          <th>Lihat</th>
          <th>Cetak</th>
          <th>Ubah</th>
          <th>Hapus</th>
        </tr></thead>
        <tbody id="ppTbody"></tbody>
      </table></div>
      <div class="table-footer"><div class="pager"><button>First</button><button>Previous</button><button class="active">1</button><button>Next</button><button>Last</button></div><div id="ppTotal"></div></div>
    </div>`;
}

function tplPpRows(rows){
  if(!rows.length) return `<tr><td colspan="11" style="color:var(--text-light);">Tidak ada data Penerimaan Piutang</td></tr>`;
  return rows.map((r,i)=>{
    const fakturLabel = (r.fakturs && r.fakturs.length)
      ? r.fakturs[0].no + (r.fakturs.length>1 ? ` <span style="color:var(--text-light);">(+${r.fakturs.length-1} lainnya)</span>` : '')
      : '';
    return `
    <tr>
      <td><b style="color:var(--blue);">${r.no}</b></td>
      <td>${fakturLabel}</td>
      <td>${r.customerNama||''}</td>
      <td>${r.noPenagihanPiutang||''}</td>
      <td>${r.tgl||''}</td>
      <td style="max-width:220px;">
        <div style="white-space:nowrap;overflow:hidden;text-overflow:ellipsis;" title="${r.keterangan||''}">${r.keterangan||''}</div>
        <span class="status-pill status-paid">${r.status||'Approved'}</span>
      </td>
      <td class="text-right" style="white-space:nowrap;">${ppNum2(r.totalPembayaran)}</td>
      <td>
        <div style="display:inline-flex;gap:2px;">
          <button class="icon-btn view" data-view="${i}" title="Lihat">${icon('eye',15)}</button>
          <button class="icon-btn view" data-view-menu="${i}" title="Pilihan Lihat" style="width:18px;">${icon('chevronDown',12)}</button>
        </div>
      </td>
      <td>
        <div style="display:inline-flex;gap:2px;">
          <button class="icon-btn print" data-print="${i}" title="Cetak">${icon('printer',15)}</button>
          <button class="icon-btn print" data-print-menu="${i}" title="Pilihan Cetak" style="width:18px;">${icon('chevronDown',12)}</button>
        </div>
      </td>
      <td><button class="icon-btn edit" data-edit="${i}" title="Ubah">${icon('edit',15)}</button></td>
      <td><button class="icon-btn del" data-del="${i}" title="Hapus">${icon('trash',15)}</button></td>
    </tr>`;
  }).join('');
}

/* =====================================================================
   FORM (full page, sama pola dgn Invoice/Sales Order/Purchase Order)
===================================================================== */
function tplPpForm(mode, row){
  const isAdd = mode === 'add';
  const isView = mode === 'view';
  const dis = isView ? 'disabled' : '';
  const titleAction = isAdd ? 'Tambah' : (isView ? 'Lihat' : 'Ubah');
  const headerIcon = isAdd ? 'plus' : (isView ? 'eye' : 'edit');
  const totals = ppRecalcTotals(row);
  return `
    <div class="breadcrumb">Home / Penerimaan Piutang / <b>${titleAction}</b></div>
    <div class="card">
      <div class="card-header dark-header">
        <h3>${icon(headerIcon,15)} ${isAdd?'+ Penerimaan Piutang':'Penerimaan Piutang'}</h3>
      </div>
      <div class="card-body">
        <div style="display:flex;align-items:flex-start;justify-content:space-between;gap:16px;flex-wrap:wrap;">
          <h2 style="font-size:20px;font-weight:700;color:var(--navy);margin:0;">Penerimaan Piutang</h2>
          <div class="form-group" style="max-width:220px;min-width:180px;margin-bottom:0;">
            <label>Cabang</label>
            <select id="fPpCabang" ${(!isAdd)?'disabled':dis}>${PP_CABANG_LIST.map(c=>`<option ${row.cabang===c?'selected':''}>${c}</option>`).join('')}</select>
          </div>
        </div>

        <div class="form-grid-3" style="margin-top:18px;grid-template-columns:repeat(5,1fr);">
          <div class="form-group">
            <label>No. Transaksi</label>
            <div class="input-with-btn">
              <input type="text" id="fPpNo" value="${row.no||''}" readonly>
              ${isAdd ? `<button type="button" class="icon-btn edit" id="ppRefreshNo" title="Generate Ulang Nomor">${icon('refreshCw',13)}</button>` : ''}
            </div>
          </div>
          <div class="form-group">
            <label>Tgl. Trn.</label>
            <div class="input-with-btn">
              <input type="text" id="fPpTgl" value="${row.tgl||''}" ${dis}>
              <span class="icon-btn edit" style="pointer-events:none;">${icon('calendar',13)}</span>
            </div>
          </div>
          <div class="form-group">
            <label>${row.holding ? 'Dari Customer Pusat (Holding)' : 'Dari Customer'}</label>
            <div class="input-with-btn">
              <input type="text" id="fPpCustomer" value="${row.customerNama||''}" placeholder="${row.holding ? 'Pilih Customer Pusat' : 'Pilih Customer'}" readonly>
              ${!isView ? `<button type="button" class="icon-btn edit" id="ppCustomerSearch" title="${row.holding ? 'Cari Customer Pusat (Holding)' : 'Cari Customer'}">${icon('search',13)}</button>` : ''}
            </div>
            <!-- 2026-08-28 — MODIFIKASI DBM: Pelunasan Piutang Terpusat
                 (Holding). Saat dicentang, picker customer berganti ke
                 daftar customer PUSAT dan tabel Lunasi Beberapa Faktur
                 menampilkan faktur outstanding SEMUA cabang di bawahnya
                 sekaligus (multi-customer, kolom "Customer" muncul). -->
            <label style="display:flex;align-items:center;gap:6px;font-size:11.8px;color:var(--text);cursor:pointer;margin-top:6px;font-weight:400;">
              <input type="checkbox" id="fPpHolding" ${row.holding?'checked':''} ${dis} style="width:auto;">
              Pelunasan Terpusat (Holding) ?
            </label>
          </div>
          <div class="form-group">
            <label>Badan Usaha</label>
            <input type="text" id="fPpBadanUsaha" value="${row.badanUsaha||''}" placeholder="Badan Usaha" ${dis}>
          </div>
          <div class="form-group">
            <label>Penagihan Piutang</label>
            <div class="input-with-btn">
              <input type="text" id="fPpPenagihan" value="${row.noPenagihanPiutang||''}" placeholder="Penagihan Piutang" readonly>
              ${!isView ? `<button type="button" class="icon-btn edit" id="ppPenagihanSearch" title="Cari Penagihan Piutang">${icon('search',13)}</button>` : ''}
            </div>
          </div>
        </div>

        <div class="card-header dark-header" style="border-radius:6px;margin:18px 0 0;">
          <h3>${icon('bank',14)} Rekening Penerima</h3>
        </div>
        <div class="table-wrap" style="margin:6px 0 6px;">
          <table class="po-item-table">
            <thead><tr>
              <th>Akun Bank</th>
              <th>Nama Bank</th>
              <th>Kurs</th>
              <th>Kurs Target (IDR)</th>
              <th>Tipe Transaksi</th>
              <th>Cair?</th>
              <th>No. Giro</th>
              <th>Bank Sumber</th>
              <th>Tgl. Jth. Tempo</th>
              <th>Jurnal</th>
              <th>Keterangan</th>
            </tr></thead>
            <tbody id="ppBankRowBody">${tplPpBankRow(row, isView)}</tbody>
          </table>
        </div>

        <div style="display:flex;justify-content:flex-end;margin:14px 0 0;">
          <div style="max-width:280px;width:100%;">
            <div class="form-group">
              <label>Jumlah Bank</label>
              <input type="text" id="ppJumlahBank" value="${ppNum2(totals.jumlahBank)}" readonly style="text-align:right;font-weight:700;">
            </div>
            <div class="form-group">
              <label>Setelah Konversi Kurs</label>
              <input type="text" id="ppSetelahKonversi" value="${ppNum2(totals.setelahKonversi)}" readonly style="text-align:right;">
            </div>
            <div class="form-group">
              <label>Total Pembayaran Setelah Dikurangi Potongan</label>
              <input type="text" id="ppTotalPembayaran" value="${ppNum2(totals.totalPembayaran)}" readonly style="text-align:right;font-weight:700;color:var(--blue);">
            </div>
          </div>
        </div>

        <div class="inv-tabs">
          <button type="button" class="inv-tab-btn active" id="ppTabFakturBtn">Lunasi Beberapa Faktur</button>
          <button type="button" class="inv-tab-btn" id="ppTabJurnalBtn">Rincian Jurnal Akun</button>
        </div>

        <div id="ppTabFakturContent">${tplPpFakturTab(row, isView, totals)}</div>
        <div id="ppTabJurnalContent" style="display:none;">${tplPpJurnalContent(row, totals)}</div>

        <div style="font-size:11.8px;color:var(--text-light);margin-top:18px;line-height:1.7;">
          <label style="display:flex;align-items:flex-start;gap:8px;cursor:pointer;">
            <input type="checkbox" id="fPpTidakSama" ${row.jumlahTidakSama?'checked':''} style="width:auto;margin-top:2px;" ${dis}>
            <span>Jumlah penerimaan tidak sama dengan piutang dapat disimpan?</span>
          </label>
        </div>
      </div>
      <div class="card-footer" style="display:flex;gap:10px;justify-content:flex-end;padding:14px 20px;border-top:1px solid var(--border);">
        ${!isView ? `
          <button type="button" class="btn-teal" id="ppCetakSimpan">Cetak dan Simpan</button>
          <button type="button" class="btn-primary" id="ppSimpan">Simpan</button>
        ` : ''}
        <button type="button" class="btn-secondary" id="ppBatalkan">${isView?'Tutup':'Batalkan'}</button>
      </div>
    </div>`;
}

function tplPpBankRow(row, isView){
  const dis = isView ? 'disabled' : '';
  const bank = ppFindKasBank(row.akunBankKode);
  const cairForced = row.tipeTransaksi === 'Terima Kas';
  return `
    <tr>
      <td style="min-width:110px;">
        <div class="input-with-btn">
          <input type="text" id="fPpAkunBank" value="${row.akunBankKode||''}" readonly>
          ${!isView ? `<button type="button" class="icon-btn edit" id="ppAkunBankSearch" title="Cari Akun Bank">${icon('search',13)}</button>` : ''}
        </div>
      </td>
      <td style="min-width:150px;"><input type="text" id="fPpNamaBank" value="${bank?bank.nama:''}" readonly></td>
      <td style="width:90px;"><select id="fPpKurs" disabled><option>IDR</option></select></td>
      <td style="width:110px;"><input type="text" id="fPpKursTarget" value="${ppNum2(row.kursTarget!=null?row.kursTarget:1)}" ${dis}></td>
      <td style="min-width:130px;">
        <select id="fPpTipeTransaksi" ${dis}>${PP_TIPE_TRANSAKSI_LIST.map(t=>`<option ${row.tipeTransaksi===t?'selected':''}>${t}</option>`).join('')}</select>
      </td>
      <td style="width:60px;text-align:center;"><input type="checkbox" id="fPpCair" ${row.cair?'checked':''} ${(cairForced||isView)?'disabled':''}></td>
      <td style="width:110px;"><input type="text" id="fPpNoGiro" value="${row.noGiro||''}" ${dis}></td>
      <td style="width:110px;"><input type="text" id="fPpBankSumber" value="${row.bankSumber||''}" ${dis}></td>
      <td style="width:120px;"><input type="text" id="fPpTglJthTempo" value="${row.tglJthTempoBank||''}" ${dis}></td>
      <td style="min-width:140px;"><input type="text" id="fPpJurnal" value="${bank?(bank.kode+' - '+bank.nama):''}" readonly></td>
      <td style="min-width:200px;"><input type="text" id="fPpBankKeterangan" value="${row.keterangan||''}" readonly></td>
    </tr>`;
}

function tplPpFakturTab(row, isView, totals){
  return `
    <div class="table-toolbar">
      <select id="ppFakturPageSize"><option selected>10</option><option>25</option><option>50</option></select>
      <input type="text" id="ppFakturSearch" placeholder="Pencarian Global">
    </div>
    <div class="table-wrap">
      <table class="po-item-table">
        <thead><tr>
          <th>Bayar</th>
          <th>No. Faktur</th>
          ${row.holding ? '<th>Customer</th>' : ''}
          <th>Cabang</th>
          <th>Tipe Transaksi</th>
          <th>Tgl. Faktur</th>
          <th>Tgl. Jth. Tempo</th>
          <th>Mata Uang</th>
          <th>Kurs</th>
          <th>Reminder</th>
          <th>Pembayaran</th>
        </tr></thead>
        <tbody id="ppFakturBody">${tplPpFakturRows(row.fakturs, isView, row.holding)}</tbody>
      </table>
    </div>
    <div id="ppFakturEmptyHint" style="font-size:11.5px;color:var(--text-light);margin-top:6px;${(row.fakturs&&row.fakturs.length)?'display:none;':''}">${row.holding
      ? 'Belum ada faktur yang dipilih — pilih Customer Pusat (Holding) terlebih dahulu, faktur yang belum lunas &amp; sudah di-posting dari SEMUA cabang di bawahnya akan tampil di sini sekaligus.'
      : 'Belum ada faktur yang dipilih — pilih Customer terlebih dahulu, faktur yang belum lunas &amp; sudah di-posting akan tampil di sini.'}</div>

    <div style="display:flex;justify-content:flex-end;margin-top:14px;">
      <div style="max-width:280px;width:100%;">
        <div class="form-group">
          <label>Jumlah Piutang</label>
          <input type="text" id="ppJumlahPiutang" value="${ppNum2(totals.jumlahPiutang)}" readonly style="text-align:right;font-weight:700;">
        </div>
      </div>
    </div>

    <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-top:10px;">
      <table class="field-table">
        <tr><td class="flabel">Keterangan Uang Muka</td><td><textarea id="fPpKetUangMuka" class="po-textarea" rows="2" ${isView?'disabled':''}>${row.keteranganUangMuka||''}</textarea></td></tr>
      </table>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;">
        <div class="form-group">
          <label>Kurs</label>
          <input type="text" id="fPpKursUangMuka" value="${ppNum2(row.kursUangMuka!=null?row.kursUangMuka:1)}" ${isView?'disabled':''}>
        </div>
        <div class="form-group">
          <label>Jadikan Uang Muka</label>
          <input type="text" id="fPpJadikanUangMuka" value="${ppNum2(row.jadikanUangMuka||0)}" ${isView?'disabled':''}>
        </div>
      </div>
    </div>

    <table class="field-table" style="margin-top:4px;">
      <tr><td class="flabel">Keterangan</td><td><textarea id="fPpKeterangan" class="po-textarea" rows="2" ${isView?'disabled':''}>${row.keterangan||''}</textarea></td></tr>
    </table>`;
}

/* Param `holding` (2026-08-28, fitur Pelunasan Piutang Terpusat):
   true = tabel dapat kolom tambahan "Customer" setelah No. Faktur
   (fakturnya lintas customer — semua cabang di bawah 1 pusat), dan
   colspan baris kosong/detail ikut jadi 11. Mode biasa (false/
   undefined, termasuk baris lama yang tersimpan tanpa field holding)
   tampil PERSIS seperti sebelumnya. */
function tplPpFakturRows(fakturs, isView, holding){
  const nCols = holding ? 11 : 10;
  if(!fakturs || !fakturs.length) return `<tr><td colspan="${nCols}" style="color:var(--text-light);">Belum ada faktur — pilih ${holding?'Customer Pusat (Holding)':'Customer'} terlebih dahulu.</td></tr>`;
  return fakturs.map((f,idx)=>`
    <tr data-pp-faktur-row="${idx}">
      <td style="text-align:center;width:50px;"><input type="checkbox" data-pp-bayar="${idx}" ${f.checked?'checked':''} ${isView?'disabled':''}></td>
      <td>${f.no}</td>
      ${holding ? `<td>${f.customerNama||''}</td>` : ''}
      <td>${f.cabang||''}</td>
      <td>${f.tipeTransaksi||'Jual Kredit'}</td>
      <td>${f.tglFaktur||''}</td>
      <td>${f.tglJthTempo||''}</td>
      <td>${f.mataUang||'IDR'}</td>
      <td>${ppNum2(f.kurs!=null?f.kurs:1)}</td>
      <td class="text-right">${ppNum2(f.reminder)}</td>
      <td style="width:130px;"><input type="text" data-pp-pembayaran="${idx}" value="${ppNum2(f.pembayaran)}" style="text-align:right;" ${(!f.checked||isView)?'disabled':''}></td>
    </tr>` + (f.checked ? tplPpFakturDetailRow(f, idx, isView, nCols) : '')).join('');
}

/* Panel "Ada potongan Ppn?/Pph?" per baris faktur yang dicentang Bayar
   (fitur baru 2026-08-20, lihat catatan besar di header file ini).
   HANYA dirender kalau f.checked (faktur yang tidak sedang dilunasi
   tidak perlu diatur potongan pajaknya). colspan=10 sama seperti baris
   utamanya (10 kolom header tabel Lunasi Beberapa Faktur). */
function tplPpFakturDetailRow(f, idx, isView, nCols){
  const dis = isView ? 'disabled' : '';
  const net = ppFakturNetPembayaran(f);
  return `
    <tr data-pp-detail-row="${idx}">
      <td colspan="${nCols || 10}" style="background:#f8fafc;padding:12px 16px;border-top:none;">
        <div style="display:flex;gap:24px;flex-wrap:wrap;align-items:center;">
          <label style="display:flex;align-items:center;gap:6px;font-size:12px;cursor:pointer;">
            <input type="checkbox" data-pp-potongan-ppn="${idx}" ${f.potonganPpn?'checked':''} ${dis}> Ada potongan Ppn?
          </label>
          <label style="display:flex;align-items:center;gap:6px;font-size:12px;cursor:pointer;">
            <input type="checkbox" data-pp-potongan-pph="${idx}" ${f.potonganPph?'checked':''} ${dis}> Ada potongan Pph?
          </label>
          <div class="form-group" style="max-width:230px;min-width:200px;margin-bottom:0;">
            <label>Pembayaran Setelah Dikurangi Potongan</label>
            <input type="text" value="${ppNum2(net)}" readonly style="text-align:right;">
          </div>
        </div>
        ${f.potonganPpn ? tplPpSspBlock(f, idx, 'Ppn', 'PPN', isView) : ''}
        ${f.potonganPph ? tplPpSspBlock(f, idx, 'Pph', 'PPH', isView) : ''}
      </td>
    </tr>`;
}

/* Sub-panel "Sudah Terima SSP PPN?/PPH?" — dipakai 2x (suffix 'Ppn'/
   'Pph', dipakai jadi bagian id data-attribute; label 'PPN'/'PPH' dipakai
   utk teks tampilan). Field Kode PPH hanya muncul di varian PPH. */
function tplPpSspBlock(f, idx, suffix, label, isView){
  const dis = isView ? 'disabled' : '';
  const tax = ppFakturTax(f);
  const nominal = suffix === 'Ppn' ? tax.ppn : tax.pph;
  const sudahTerima = suffix === 'Ppn' ? f.sudahTerimaSspPpn : f.sudahTerimaSspPph;
  const ntpnAda = suffix === 'Ppn' ? f.noNtpnPpnAda : f.noNtpnPphAda;
  const noNtpn = suffix === 'Ppn' ? f.noNtpnPpn : f.noNtpnPph;
  const tglNtpn = suffix === 'Ppn' ? f.tglNtpnPpn : f.tglNtpnPph;
  const judul = label === 'PPN' ? 'Sudah Terima Surat Setoran Pajak (SSP) PPN?' : 'Sudah Terima SSP PPH?';
  return `
    <div style="display:flex;gap:20px;flex-wrap:wrap;align-items:flex-end;margin-top:10px;padding-top:10px;border-top:1px dashed var(--border);">
      <label style="display:flex;align-items:center;gap:6px;font-size:12px;cursor:pointer;min-width:230px;">
        <input type="checkbox" data-pp-ssp-terima-${suffix.toLowerCase()}="${idx}" ${sudahTerima?'checked':''} ${dis}>
        <b>${judul}</b>
      </label>
      ${label === 'PPH' ? `
      <div class="form-group" style="max-width:160px;margin-bottom:0;">
        <label>Pilih Kode PPH</label>
        <select data-pp-pph-kode="${idx}" ${dis}>${PP_PPH_LIST.map(p=>`<option value="${p.kode}" ${f.pphKode===p.kode?'selected':''}>${p.kode}</option>`).join('')}</select>
      </div>` : ''}
      <div class="form-group" style="max-width:170px;margin-bottom:0;">
        <label>Nominal AR SSP ${label}</label>
        <input type="text" value="${ppNum2(nominal)}" readonly style="text-align:right;">
      </div>
      <div class="form-group" style="max-width:170px;margin-bottom:0;">
        <label style="display:flex;align-items:center;gap:4px;">
          <input type="checkbox" data-pp-ntpn-${suffix.toLowerCase()}-ada="${idx}" ${ntpnAda?'checked':''} ${dis}> No. NTPN ${label}
        </label>
        <input type="text" data-pp-ntpn-${suffix.toLowerCase()}="${idx}" value="${noNtpn||''}" placeholder="No. NTPN" ${(!ntpnAda||isView)?'disabled':''}>
      </div>
      <div class="form-group" style="max-width:140px;margin-bottom:0;">
        <label>Tgl. Trn.</label>
        <div class="input-with-btn">
          <input type="text" data-pp-tgl-${suffix.toLowerCase()}="${idx}" value="${tglNtpn||''}" ${dis}>
          <span class="icon-btn edit" style="pointer-events:none;">${icon('calendar',13)}</span>
        </div>
      </div>
    </div>`;
}

/* Tab "Rincian Jurnal Akun" — baris tetap Bank(D)/Piutang Usaha(K) +
   baris DINAMIS dari ppBuildJurnalLines() (js/pages/penerimaan-
   piutang.js) kalau ada faktur dgn potongan PPN/PPH — lihat catatan
   desain lengkap di header file ini. Tetap HANYA read-only (tidak ada
   mode Manual seperti Jurnal Invoice). */
function tplPpJurnalContent(row, totals){
  const lines = ppBuildJurnalLines(row, totals);
  const totalDebit = lines.reduce((s,l)=>s+l.debit,0);
  const totalKredit = lines.reduce((s,l)=>s+l.kredit,0);
  return `
    <div class="table-wrap">
      <table class="po-item-table">
        <thead><tr><th>Kode Akun</th><th>Nama Akun</th><th>Keterangan</th><th>Jumlah Debit</th><th>Jumlah Kredit</th></tr></thead>
        <tbody>
          ${lines.map(l=>`
          <tr>
            <td>${l.kode}</td>
            <td>${l.nama}</td>
            <td>${l.ket}</td>
            <td class="text-right">${ppNum2(l.debit)}</td>
            <td class="text-right">${ppNum2(l.kredit)}</td>
          </tr>`).join('')}
          <tr style="font-weight:700;border-top:2px solid var(--border);">
            <td colspan="3" class="text-right">Jumlah Debit - Kredit</td>
            <td class="text-right">${ppNum2(totalDebit)}</td>
            <td class="text-right">${ppNum2(totalKredit)}</td>
          </tr>
        </tbody>
      </table>
    </div>`;
}

/* =====================================================================
   PICKER Customer — SALINAN LOKAL dari tplSoCustomerPicker() (Sales
   Order). Bukan reuse fungsi lintas modul (lihat catatan "local copy"
   di header file ini).
===================================================================== */
/* Param `holdingMode` (2026-08-28, fitur Pelunasan Piutang Terpusat):
   true = judul jadi "Pilih Customer Pusat (Holding)" + kolom tambahan
   "Cabang di Bawahnya" (nama-nama customer yang customerIndukKode-nya
   menunjuk ke customer pusat itu) supaya user tahu cakupan pelunasan
   sebelum memilih. List-nya sudah difilter di openPpCustomerPicker()
   (hanya customer yang benar-benar jadi induk). */
function tplPpCustomerPicker(list, holdingMode){
  const title = holdingMode ? 'Pilih Customer Pusat (Holding)' : 'Pilih Customer';
  if(!list.length){
    return `
    <div class="modal-box" style="max-width:560px;">
      <div class="modal-header"><span>${title}</span><span class="close" id="modalClose">&times;</span></div>
      <div class="modal-body"><p style="color:var(--text-light);">Belum ada customer pusat — isi field "Customer Induk" pada master customer cabang terlebih dahulu.</p></div>
      <div class="modal-footer"><button class="btn-secondary" id="modalCancel">Tutup</button></div>
    </div>`;
  }
  return `
    <div class="modal-box" style="max-width:${holdingMode?'680px':'560px'};">
      <div class="modal-header"><span>${title}</span><span class="close" id="modalClose">&times;</span></div>
      <div class="modal-body">
        <div class="table-wrap" style="max-height:340px;overflow:auto;"><table>
          <thead><tr><th>Kode</th><th>Nama Customer</th><th>Kota</th>${holdingMode?'<th>Cabang di Bawahnya</th>':''}<th></th></tr></thead>
          <tbody>${list.map(c=>`<tr><td>${c.kode}</td><td>${c.nama}</td><td>${c.kota}</td>${holdingMode?`<td style="font-size:11.8px;">${ppChildrenOf(c.kode).map(x=>x.nama).join(', ')||'-'}</td>`:''}<td><button class="btn-pick" data-pick-customer="${c.kode}">Pilih</button></td></tr>`).join('')}</tbody>
        </table></div>
      </div>
      <div class="modal-footer"><button class="btn-secondary" id="modalCancel">Tutup</button></div>
    </div>`;
}

function tplPpAkunBankPicker(list){
  return `
    <div class="modal-box" style="max-width:640px;">
      <div class="modal-header"><span>Pilih Akun Bank</span><span class="close" id="modalClose">&times;</span></div>
      <div class="modal-body">
        <div class="table-wrap" style="max-height:360px;overflow:auto;"><table>
          <thead><tr><th>Kode</th><th>Nama</th><th>Tipe</th><th>No. Rekening</th><th></th></tr></thead>
          <tbody>${list.map(b=>`<tr><td>${b.kode}</td><td>${b.nama}</td><td>${b.tipeRekening}</td><td>${b.noRekening||'-'}</td><td><button class="btn-pick" data-pick-akunbank="${b.kode}">Pilih</button></td></tr>`).join('')}</tbody>
        </table></div>
      </div>
      <div class="modal-footer"><button class="btn-secondary" id="modalCancel">Tutup</button></div>
    </div>`;
}

/* Picker dekoratif "Penagihan Piutang" — SALINAN LOKAL dari pola
   tplSoDecorativePicker() (Sales Order), dataset SELALU kosong karena
   belum ada modul master "Penagihan Piutang" di mockup ini. */
function tplPpDecorativePicker(title, list){
  return `
    <div class="modal-box" style="max-width:480px;">
      <div class="modal-header"><span>${title}</span><span class="close" id="modalClose">&times;</span></div>
      <div class="modal-body">
        <div class="table-wrap"><table>
          <thead><tr><th>No.</th><th>Tanggal</th><th>Keterangan</th></tr></thead>
          <tbody>${list.length ? '' : `<tr><td colspan="3" style="color:var(--text-light);">Tidak ada data</td></tr>`}</tbody>
        </table></div>
      </div>
      <div class="modal-footer"><button class="btn-secondary" id="modalCancel">Tutup</button></div>
    </div>`;
}

function tplPpDeleteConfirm(row){
  return `
    <div class="modal-box">
      <div class="modal-header"><span>Hapus Penerimaan Piutang</span><span class="close" id="modalClose">&times;</span></div>
      <div class="modal-body"><p>Yakin ingin menghapus Penerimaan Piutang <b>${row.no}</b>? Sisa piutang pada faktur terkait akan dikembalikan seperti semula.</p></div>
      <div class="modal-footer">
        <button class="btn-secondary" id="modalCancel">Batal</button>
        <button class="btn-danger" id="modalDelete">Hapus</button>
      </div>
    </div>`;
}

function tplPpInfoModal(title, text){
  return `
    <div class="modal-box">
      <div class="modal-header"><span>${title}</span><span class="close" id="modalClose">&times;</span></div>
      <div class="modal-body"><p>${text}</p></div>
      <div class="modal-footer"><button class="btn-primary" id="modalOk">Mengerti</button></div>
    </div>`;
}
