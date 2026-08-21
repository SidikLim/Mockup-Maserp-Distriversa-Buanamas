/* =========================================================
   TEMPLATE (HTML saja) — Pelunasan Utang (Supplier & Pembelian >
   Daftar Transaksi > Pelunasan Utang, key page:'pelunasanUtang').
   Semua fungsi di file ini HANYA menyusun & mengembalikan markup HTML
   (string) atau helper murni, TIDAK ada DOM-binding di sini. Logic-nya
   ada di file sebelah: pelunasan-utang.js

   3 screenshot MASERP yang dikirim user ("Pelunasan Utang" — form dgn
   tabel 1 baris Akun Bank/Nama Bank/Mata Uang/Kurs/dst, tab "Lunasi
   Beberapa Faktur" (aktif di 1 screenshot, supplier "PT SATORIA ANEKA
   INDUSTRI" 6 faktur total Rp 500.000.000) & "Rincian Jurnal Akun"
   (aktif di screenshot lain, radio Otomatis/Manual + tombol "Buat
   Jurnal"), dan "Daftar Pembayaran Utang" — list 10 kolom, Total
   Record: 14) dijadikan acuan LAYOUT. Modul ini adalah KEBALIKAN
   (mirror) dari Penerimaan Piutang (Customer & Penjualan > Daftar
   Transaksi, lihat penerimaan-piutang.template.js utk catatan desain
   AR yang jadi acuan pola di sini) — di sana Piutang (AR) dilunasi
   Customer, di sini Utang (AP) dilunasi ke Supplier. Prefix fungsi/id
   "Pu"/"pu" (Pelunasan Utang), TIDAK bertabrakan dgn "po" (Purchase
   Order) atau "pp" (Penerimaan Piutang) yang sudah ada.

   Semua nama Supplier & data contoh di screenshot ("PT SATORIA ANEKA
   INDUSTRI", "NOVAPHARIN", "PT AMANAH FARMA BERSAUDARA", "TRAVELOKA",
   "88 Catering Service", "PT INTISUMBER HASIL SEMPURNA GLOBAL", "PT
   RODA HAMMERINDO JAYA SURABAYA" — demo perusahaan FARMASI/lain yang
   tidak ada hubungannya dengan DBM) DIGANTI TOTAL dengan Supplier DBM
   sendiri (DATA.suppliers yang sudah ada — PT Sumber Pangan Nusantara
   dkk, FMCG/sembako, bukan RS/apotek/agen tiket), pola yang sama
   seperti Penerimaan Piutang.

   Sebelumnya page:'pelunasanUtang' cuma placeholder (menu Supplier &
   Pembelian > Daftar Transaksi > Pelunasan Utang, lihat js/menu.js) —
   SEKARANG modul CRUD sungguhan yang BENAR-BENAR chained ke
   DATA.pembelianBPB: field `pembayaran` yang SUDAH ADA di tiap baris
   DATA.pembelianBPB (default 0, dibuat sejak modul Pembelian Melalui
   BPB dibangun) dipakai persis seperti `dibayar` pada DATA.invoices di
   Penerimaan Piutang — Faktur Pembelian (26/PU/{cabang}/08/{urut})
   yang masih ada sisa (jumlahTotal - pembayaran > 0) untuk Supplier yg
   dipilih, itulah yang muncul di tab "Lunasi Beberapa Faktur". TIDAK
   ada konsep "posted" di Pembelian Melalui BPB (beda dari Invoice yang
   perlu di-Posting dulu) — begitu Faktur BPB disimpan, otomatis sudah
   "final" & boleh dilunasi.

   CATATAN PENTING soal data model: DATA.pembelianBPB menyimpan Supplier
   sebagai STRING NAMA (field `supplier`, bukan kode) — bukan keputusan
   modul ini, itu struktur yang sudah ada sejak Pembelian Melalui BPB
   dibangun. Jadi puOutstandingInvoicesForSupplier() (pelunasan-
   utang.js) mencocokkan berdasarkan NAMA, bukan kode — konsekuensinya:
   kalau 2 supplier di DATA.suppliers punya nama identik modul ini akan
   keliru; tidak masalah di mockup ini karena semua nama supplier unik.

   Penomoran No. Transaksi: screenshot asli "26/CL-HO/08/00197" (tanda
   hubung antara "CL" & kode cabang, SAMA seperti screenshot asli
   Penerimaan Piutang) — dinormalisasi jadi "26/CL/{KodeCabang}/08/
   {urut}" (garis miring penuh, konsisten dgn modul lain), PERSIS pola
   yang dipakai Penerimaan Piutang. PU_CABANG_LIST/PU_CABANG_CODE di
   bawah SALINAN LOKAL dari PP_CABANG_LIST/PP_CABANG_CODE (bukan
   reference lintas modul — urutan lazy-load antar modul tidak
   terjamin, lihat catatan "local copy" yang sama di semua modul
   transaksi lain). Counter urut DIHITUNG SENDIRI dari
   DATA.pelunasanUtang (independen dari counter Penerimaan Piutang) —
   di ERP sungguhan 2 modul ini idealnya beda skema penomoran, tapi
   screenshot MASERP asli literally memakai prefix "CL" utk keduanya,
   jadi dibiarkan sama demi konsistensi visual dgn sumbernya; TIDAK
   masalah kalau kebetulan menghasilkan angka urut yang sama dgn
   Penerimaan Piutang karena keduanya array data yang terpisah total.

   Format angka uang di MODUL INI SENGAJA TANPA prefix "Rp" (persis
   pola ppNum2()/invNum2() — beda dari rp() global di data.js yang
   selalu pakai "Rp "), meniru screenshot: setiap kotak/kolom angka
   (Jumlah Keluar Kas, Setelah Konversi Kurs, Total Utang Dibayar,
   Reminder, Pembayaran, Jumlah Debit/Kredit Jurnal, kolom "Jumlah" di
   list) selalu tampil polos 2 desimal ("500.000.000,00") tanpa "Rp".
   Kolom "Jumlah" di list ditampilkan dalam tanda kurung warna merah
   ("(500.000.000,00)") — meniru screenshot asli yang menandai nominal
   ini sebagai KAS KELUAR (uang berkurang), beda dari list Penerimaan
   Piutang yang tidak memakai warna karena uang masuk.

   Kurs/Kurs Target: seluruh mockup ini IDR-only, jadi field ini tetap
   dekoratif ("1,00") persis pola Penerimaan Piutang.

   "Pengajuan Pembayaran": di screenshot field ini HANYA tampil sebagai
   label + bar abu-abu tanpa kotak input yang jelas (kemungkinan
   scrollbar tabel yang render tumpang-tindih di screenshot, resolusi
   asli kurang jelas) — diinterpretasikan di sini sebagai picker
   dekoratif input+ikon cari (persis pola "Penagihan Piutang" milik
   Penerimaan Piutang, tplPuDecorativePicker() SALINAN LOKAL dari
   tplPpDecorativePicker(), dataset SELALU kosong karena belum ada
   modul master "Pengajuan Pembayaran" tersendiri di mockup ini).

   Kolom "Jurnal" di baris tabel Akun Bank SENGAJA auto-terisi read-
   only dari Akun Bank yang dipilih, sama seperti Penerimaan Piutang —
   begitu Akun Bank dipilih, akun GL Kas/Bank yang dikredit otomatis
   sudah jelas.

   Tab "Rincian Jurnal Akun" di sini BEDA dari Penerimaan Piutang (yang
   versi sederhana read-only-Otomatis-saja) — screenshot modul ini
   justru menunjukkan pola LENGKAP radio Jurnal Otomatis/Manual +
   tombol "Buat Jurnal" + tabel editable (tambah/hapus baris, cari Akun
   GL) SAMA PERSIS dgn tab Jurnal Invoice (lihat catatan desain lengkap
   di header tplInvJurnalContent(), invoice.template.js) — jadi pola
   INI yang dicontek (bukan pola PP), disalin lokal sebagai
   tplPuJurnalContent()/tplPuAkunPicker() dgn prefix "pu"/"Pu".

   Mode Otomatis (default) SELALU 2 baris: Debit "Hutang Usaha"
   (2110001, akun yg sudah ada di DATA.akunGL, dipetakan dari kode demo
   screenshot "210201" yang skema 6-digit farmasi lain) sebesar Jumlah
   Keluar Kas, Kredit Akun Bank terpilih sebesar nilai yang sama — jadi
   "Jumlah Debit - Kredit" mode Otomatis SELALU 0 (2 baris memang saling
   menyeimbangkan by construction, kebalikan arah dari jurnal Penerimaan
   Piutang: di sana Bank(D)/Piutang(K), di sini Hutang(D)/Bank(K) —
   melunasi utang = utang berkurang (Debit) & kas berkurang (Kredit)).
   Mode Manual membuka tabel jadi editable via tplPuAkunPicker() (list
   DATA.akunGL) — sama seperti Invoice, tidak ada validasi wajib-balance.

   TIDAK ADA fitur "PPN/PPH ditanggung Supplier" di modul ini — 3
   screenshot yang dikirim user tidak menunjukkan panel semacam itu
   (beda dari Penerimaan Piutang yang memang ada screenshot fitur PPN/
   PPH ditanggung Customer terpisah) — jangan ditambahkan tanpa
   permintaan/screenshot baru dari user.

   Keterangan & checkbox "Total keluar kas tidak sama dengan utang?" di
   screenshot TAMPIL PERSIS SAMA baik saat tab Faktur maupun tab Jurnal
   aktif — artinya keduanya field DI LUAR/DI BAWAH kedua tab (bukan
   bagian dari tab Faktur seperti field serupa di Penerimaan Piutang),
   diletakkan di level form (tplPuForm()) SETELAH kedua div tab, SAMA
   posisinya dgn checkbox itu di Penerimaan Piutang tapi Keterangan-nya
   dipindah keluar. Keterangan default "Pembayaran Hutang Dagang" (teks
   statis, bisa diedit user) — BEDA dari Penerimaan Piutang yang
   otomatis menyusun teks dari nomor faktur (ppComposeKeterangan) karena
   screenshot list "Daftar Pembayaran Utang" menunjukkan mayoritas baris
   memang literally berketerangan sama "Pembayaran Hutang Dagang" apa
   adanya, jadi tidak perlu logic compose yang lebih rumit.

   Hapus (Hapus button di list): MENGEMBALIKAN `pembayaran` yang sudah
   dikurangkan ke tiap Faktur Pembelian BPB yang direferensikan
   row.fakturs[].fakturNo (kalau ada) sebelum baris Pelunasan Utang itu
   sendiri dihapus — persis pola reversal Penerimaan Piutang, supaya
   pembukuan AP tetap konsisten.

   Cetak (tombol "Cetak dan Simpan" di form, tombol Cetak di list)
   SENGAJA dekoratif (buka modal info) — sama seperti Penerimaan
   Piutang, belum ada contoh cetakan Pelunasan Utang yang dikirim user.

   14 baris sample DATA.pelunasanUtang (lihat js/data.js): 2 baris
   PERTAMA benar-benar chained ke DATA.pembelianBPB sungguhan (PT Sumber
   Pangan Nusantara 26/PU/HO/08/00001 dilunasi PENUH; PT Wilmar Nabati
   Indonesia 26/PU/HO/08/00002 dilunasi SEBAGIAN, sisa 3.158.500 masih
   outstanding) — membuktikan mekanisme `pembayaran` ini nyata, bukan
   sekadar teks dekoratif, pola identik 2 baris pembuktian Penerimaan
   Piutang. 12 baris sisanya historis/dekoratif (Juli & Agustus 2026,
   fakturNo kosong tidak terhubung ke DATA.pembelianBPB) menyebar ke 12
   Supplier DBM yang ada supaya representatif. CV Distribusi Sentosa
   (26/PU/HO/08/00003, sisa 1.332.000) & PT Sasa Inti (26/PU/HO/08/00004,
   sisa 4.509.918) SENGAJA dibiarkan belum tersentuh sama sekali —
   pilih salah satu Supplier ini saat mencoba "+ Tambah" untuk melihat
   faktur itu muncul nyata di tab Lunasi Beberapa Faktur.
========================================================= */

const PU_CABANG_LIST = ['Head Office','Surabaya','Bandung','Medan','Makassar','Semarang','Tangerang','Sidoarjo'];
const PU_CABANG_CODE = {'Head Office':'HO','Surabaya':'SBY','Bandung':'BDG','Medan':'MDN','Makassar':'MKS','Semarang':'SMG','Tangerang':'TGR','Sidoarjo':'SDA'};
const PU_TIPE_TRANSAKSI_LIST = ['Keluar Kas','Keluar Giro','Keluar Cek'];

function puNum2(n){ return Number(n||0).toLocaleString('id-ID', {minimumFractionDigits:2, maximumFractionDigits:2}); }
function puAkunNama(kode){ const a = DATA.akunGL.find(x => x.kode === kode); return a ? a.nama : ''; }

/* =====================================================================
   LIST PAGE — "Daftar Pembayaran Utang" (judul list PERSIS screenshot,
   beda dari label menu "Pelunasan Utang" — pola sama seperti Penerimaan
   Piutang yg judul list "Daftar Penerimaan Piutang" tapi label menu
   "Penerimaan Piutang").
===================================================================== */
function tplPelunasanUtangListPage(){
  return `
    <div class="breadcrumb">Home / <b>Pelunasan Utang</b></div>
    <div class="card">
      <div class="card-header dark-header">
        <h3>${icon('wallet',15)} Daftar Pembayaran Utang</h3>
        <div class="toolbar-actions">
          <select class="chip-btn" id="puPeriodFilter"><option>Agustus 2026</option></select>
          <button class="btn-primary" id="btnPuAdd">${icon('plus',14)} Tambah</button>
        </div>
      </div>
      <div class="table-toolbar">
        <select id="puPageSize"><option selected>10</option><option>25</option><option>50</option></select>
        <input type="text" id="puSearch" placeholder="Pencarian Global">
      </div>
      <div class="table-wrap"><table>
        <thead><tr>
          <th>No. Transaksi</th>
          <th>No. Faktur</th>
          <th>Supplier</th>
          <th>Tgl. Trn.</th>
          <th>Keterangan</th>
          <th>Jumlah</th>
          <th>Lihat</th>
          <th>Cetak</th>
          <th>Ubah</th>
          <th>Hapus</th>
        </tr></thead>
        <tbody id="puTbody"></tbody>
      </table></div>
      <div class="table-footer"><div class="pager"><button>First</button><button>Previous</button><button class="active">1</button><button>Next</button><button>Last</button></div><div id="puTotal"></div></div>
    </div>`;
}

function tplPuRows(rows){
  if(!rows.length) return `<tr><td colspan="10" style="color:var(--text-light);">Tidak ada data Pelunasan Utang</td></tr>`;
  return rows.map((r,i)=>{
    const fakturLabel = (r.fakturs && r.fakturs.length)
      ? r.fakturs[0].no + (r.fakturs.length>1 ? ` <span style="color:var(--text-light);">(+${r.fakturs.length-1} lainnya)</span>` : '')
      : '';
    return `
    <tr>
      <td><b style="color:var(--blue);">${r.no}</b></td>
      <td>${fakturLabel}</td>
      <td>${r.supplierNama||''}</td>
      <td>${r.tgl||''}</td>
      <td style="max-width:220px;">
        <div style="white-space:nowrap;overflow:hidden;text-overflow:ellipsis;" title="${r.keterangan||''}">${r.keterangan||''}</div>
        <span class="status-pill status-paid">${r.status||'Approved'}</span>
      </td>
      <td class="text-right" style="white-space:nowrap;color:var(--red);">(${puNum2(r.totalPembayaran)})</td>
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
   FORM (full page, sama pola dgn Invoice/Penerimaan Piutang)
===================================================================== */
function tplPuForm(mode, row){
  const isAdd = mode === 'add';
  const isView = mode === 'view';
  const dis = isView ? 'disabled' : '';
  const titleAction = isAdd ? 'Tambah' : (isView ? 'Lihat' : 'Ubah');
  const headerIcon = isAdd ? 'plus' : (isView ? 'eye' : 'edit');
  const totals = puRecalcTotals(row);
  return `
    <div class="breadcrumb">Home / Pelunasan Utang / <b>${titleAction}</b></div>
    <div class="card">
      <div class="card-header dark-header">
        <h3>${icon(headerIcon,15)} ${isAdd?'+ Pelunasan Utang':'Pelunasan Utang'}</h3>
      </div>
      <div class="card-body">
        <div style="display:flex;align-items:flex-start;justify-content:space-between;gap:16px;flex-wrap:wrap;">
          <h2 style="font-size:20px;font-weight:700;color:var(--navy);margin:0;">Pelunasan Utang</h2>
          <div class="form-group" style="max-width:220px;min-width:180px;margin-bottom:0;">
            <label>Cabang</label>
            <select id="fPuCabang" ${(!isAdd)?'disabled':dis}>${PU_CABANG_LIST.map(c=>`<option ${row.cabang===c?'selected':''}>${c}</option>`).join('')}</select>
          </div>
        </div>

        <div class="form-grid-3" style="margin-top:18px;grid-template-columns:repeat(4,1fr);">
          <div class="form-group">
            <label>No. Transaksi</label>
            <div class="input-with-btn">
              <input type="text" id="fPuNo" value="${row.no||''}" readonly>
              ${isAdd ? `<button type="button" class="icon-btn edit" id="puRefreshNo" title="Generate Ulang Nomor">${icon('refreshCw',13)}</button>` : ''}
            </div>
          </div>
          <div class="form-group">
            <label>Tgl. Trn.</label>
            <div class="input-with-btn">
              <input type="text" id="fPuTgl" value="${row.tgl||''}" ${dis}>
              <span class="icon-btn edit" style="pointer-events:none;">${icon('calendar',13)}</span>
            </div>
          </div>
          <div class="form-group">
            <label>Dari Supplier</label>
            <div class="input-with-btn">
              <input type="text" id="fPuSupplier" value="${row.supplierNama||''}" placeholder="Pilih Supplier" readonly>
              ${!isView ? `<button type="button" class="icon-btn edit" id="puSupplierSearch" title="Cari Supplier">${icon('search',13)}</button>` : ''}
            </div>
          </div>
          <div class="form-group">
            <label>Pengajuan Pembayaran</label>
            <div class="input-with-btn">
              <input type="text" id="fPuPengajuan" value="${row.noPengajuanPembayaran||''}" placeholder="Pengajuan Pembayaran" readonly>
              ${!isView ? `<button type="button" class="icon-btn edit" id="puPengajuanSearch" title="Cari Pengajuan Pembayaran">${icon('search',13)}</button>` : ''}
            </div>
          </div>
        </div>

        <div class="card-header dark-header" style="border-radius:6px;margin:18px 0 0;">
          <h3>${icon('bank',14)} Rekening Pengeluaran</h3>
        </div>
        <div class="table-wrap" style="margin:6px 0 6px;">
          <table class="po-item-table">
            <thead><tr>
              <th>Akun Bank</th>
              <th>Nama Bank</th>
              <th>Mata Uang</th>
              <th>Kurs (IDR)</th>
              <th>Kurs Target (IDR)</th>
              <th>Tipe Transaksi</th>
              <th>Cair?</th>
              <th>No. Giro</th>
              <th>Tgl. Jth. Tempo</th>
              <th>Jurnal</th>
              <th>Keterangan</th>
            </tr></thead>
            <tbody id="puBankRowBody">${tplPuBankRow(row, isView)}</tbody>
          </table>
        </div>
        <a href="#" id="puTambahBankBaru" class="link-add" style="${isView?'display:none;':''}">${icon('plus',12)} Tambah Bank Baru</a>

        <div style="display:flex;justify-content:flex-end;margin:14px 0 0;">
          <div style="max-width:280px;width:100%;">
            <div class="form-group">
              <label>Jumlah Keluar Kas</label>
              <input type="text" id="puJumlahKeluarKas" value="${puNum2(totals.jumlahKeluarKas)}" readonly style="text-align:right;font-weight:700;">
            </div>
            <div class="form-group">
              <label>Setelah Konversi Kurs</label>
              <input type="text" id="puSetelahKonversi" value="${puNum2(totals.setelahKonversi)}" readonly style="text-align:right;">
            </div>
          </div>
        </div>

        <div class="inv-tabs">
          <button type="button" class="inv-tab-btn active" id="puTabFakturBtn">Lunasi Beberapa Faktur</button>
          <button type="button" class="inv-tab-btn" id="puTabJurnalBtn">Rincian Jurnal Akun</button>
        </div>

        <div id="puTabFakturContent">${tplPuFakturTab(row, isView, totals)}</div>
        <div id="puTabJurnalContent" style="display:none;">${tplPuJurnalContent(row)}</div>

        <table class="field-table" style="margin-top:16px;">
          <tr><td class="flabel">Keterangan</td><td><textarea id="fPuKeterangan" class="po-textarea" rows="2" ${isView?'disabled':''}>${row.keterangan||''}</textarea></td></tr>
        </table>

        <div style="font-size:11.8px;color:var(--text-light);margin-top:4px;line-height:1.7;">
          <label style="display:flex;align-items:flex-start;gap:8px;cursor:pointer;">
            <input type="checkbox" id="fPuTidakSama" ${row.jumlahTidakSama?'checked':''} style="width:auto;margin-top:2px;" ${dis}>
            <span>Total keluar kas tidak sama dengan utang dapat disimpan?</span>
          </label>
        </div>
      </div>
      <div class="card-footer" style="display:flex;gap:10px;justify-content:flex-end;padding:14px 20px;border-top:1px solid var(--border);">
        ${!isView ? `
          <button type="button" class="btn-teal" id="puCetakSimpan">Cetak dan Simpan</button>
          <button type="button" class="btn-primary" id="puSimpan">Simpan</button>
        ` : ''}
        <button type="button" class="btn-secondary" id="puBatalkan">${isView?'Tutup':'Batalkan'}</button>
      </div>
    </div>`;
}

function tplPuBankRow(row, isView){
  const dis = isView ? 'disabled' : '';
  const bank = puFindKasBank(row.akunBankKode);
  const cairForced = row.tipeTransaksi === 'Keluar Kas';
  return `
    <tr>
      <td style="min-width:110px;">
        <div class="input-with-btn">
          <input type="text" id="fPuAkunBank" value="${row.akunBankKode||''}" readonly>
          ${!isView ? `<button type="button" class="icon-btn edit" id="puAkunBankSearch" title="Cari Akun Bank">${icon('search',13)}</button>` : ''}
        </div>
      </td>
      <td style="min-width:150px;"><input type="text" id="fPuNamaBank" value="${bank?bank.nama:''}" readonly></td>
      <td style="width:90px;"><select id="fPuMataUang" disabled><option>IDR</option></select></td>
      <td style="width:90px;"><input type="text" id="fPuKurs" value="${puNum2(1)}" disabled></td>
      <td style="width:110px;"><input type="text" id="fPuKursTarget" value="${puNum2(row.kursTarget!=null?row.kursTarget:1)}" ${dis}></td>
      <td style="min-width:130px;">
        <select id="fPuTipeTransaksi" ${dis}>${PU_TIPE_TRANSAKSI_LIST.map(t=>`<option ${row.tipeTransaksi===t?'selected':''}>${t}</option>`).join('')}</select>
      </td>
      <td style="width:60px;text-align:center;"><input type="checkbox" id="fPuCair" ${row.cair?'checked':''} ${(cairForced||isView)?'disabled':''}></td>
      <td style="width:110px;"><input type="text" id="fPuNoGiro" value="${row.noGiro||''}" ${dis}></td>
      <td style="width:120px;"><input type="text" id="fPuTglJthTempo" value="${row.tglJthTempoBank||''}" ${dis}></td>
      <td style="min-width:140px;"><input type="text" id="fPuJurnal" value="${bank?(bank.kode+' - '+bank.nama):''}" readonly></td>
      <td style="min-width:200px;"><input type="text" id="fPuBankKeterangan" value="${row.keterangan||''}" readonly></td>
    </tr>`;
}

function tplPuFakturTab(row, isView, totals){
  return `
    <div class="table-toolbar">
      <select id="puFakturPageSize"><option selected>10</option><option>25</option><option>50</option></select>
      <input type="text" id="puFakturSearch" placeholder="Pencarian Global">
    </div>
    <div class="table-wrap">
      <table class="po-item-table">
        <thead><tr>
          <th>Bayar</th>
          <th>No. Faktur</th>
          <th>No. Faktur Supplier</th>
          <th>Tipe Transaksi</th>
          <th>Tgl. Trn. Faktur</th>
          <th>Tgl. Jth. Tempo</th>
          <th>Mata Uang</th>
          <th>Kurs</th>
          <th>Reminder</th>
          <th>Pembayaran</th>
        </tr></thead>
        <tbody id="puFakturBody">${tplPuFakturRows(row.fakturs, isView)}</tbody>
      </table>
    </div>
    <div id="puFakturEmptyHint" style="font-size:11.5px;color:var(--text-light);margin-top:6px;${(row.fakturs&&row.fakturs.length)?'display:none;':''}">Belum ada faktur yang dipilih — pilih Supplier terlebih dahulu, Faktur Pembelian yang masih ada sisa akan tampil di sini.</div>

    <div style="display:flex;justify-content:flex-end;margin-top:14px;">
      <div style="max-width:280px;width:100%;">
        <div class="form-group">
          <label>Total Utang Dibayar</label>
          <input type="text" id="puTotalUtangDibayar" value="${puNum2(totals.jumlahUtang)}" readonly style="text-align:right;font-weight:700;color:var(--blue);">
        </div>
      </div>
    </div>`;
}

function tplPuFakturRows(fakturs, isView){
  if(!fakturs || !fakturs.length) return `<tr><td colspan="10" style="color:var(--text-light);">Belum ada faktur — pilih Supplier terlebih dahulu.</td></tr>`;
  return fakturs.map((f,idx)=>`
    <tr>
      <td style="text-align:center;width:50px;"><input type="checkbox" data-pu-bayar="${idx}" ${f.checked?'checked':''} ${isView?'disabled':''}></td>
      <td>${f.no}</td>
      <td>${f.supplierNoFaktur||''}</td>
      <td>${f.tipeTransaksi||'Beli Kredit'}</td>
      <td>${f.tglFaktur||''}</td>
      <td>${f.tglJthTempo||''}</td>
      <td>${f.mataUang||'IDR'}</td>
      <td>${puNum2(f.kurs!=null?f.kurs:1)}</td>
      <td class="text-right">${puNum2(f.reminder)}</td>
      <td style="width:130px;"><input type="text" data-pu-pembayaran="${idx}" value="${puNum2(f.pembayaran)}" style="text-align:right;" ${(!f.checked||isView)?'disabled':''}></td>
    </tr>`).join('');
}

/* Tab "Rincian Jurnal Akun" — pola LENGKAP disalin dari tplInvJurnalContent()
   (invoice.template.js: radio Otomatis/Manual + "Buat Jurnal" + tabel
   editable mode Manual) — BUKAN pola sederhana read-only milik Penerimaan
   Piutang, lihat catatan besar di header file ini kenapa. SALINAN LOKAL
   (prefix "Pu"/"pu"), bukan reference cross-file. */
function puJurnalTotals(row){
  const list = row.jurnalAkun || [];
  const debit = list.reduce((s,r)=>s+(+r.debit||0),0);
  const kredit = list.reduce((s,r)=>s+(+r.kredit||0),0);
  return { debit, kredit, selisih: debit - kredit };
}

function tplPuJurnalRow(entry, idx, isManual){
  if(isManual){
    return `
    <tr data-pu-jurnal-row="${idx}">
      <td style="min-width:120px;">
        <div class="input-with-btn">
          <input type="text" data-pu-jurnal-kode="${idx}" value="${entry.kodeAkun||''}" readonly>
          <button type="button" class="icon-btn edit" data-pu-jurnal-akun-search="${idx}" title="Cari Akun GL">${icon('search',12)}</button>
        </div>
      </td>
      <td style="min-width:180px;"><input type="text" data-pu-jurnal-nama="${idx}" value="${entry.namaAkun||''}" readonly></td>
      <td style="min-width:170px;"><input type="text" data-pu-jurnal-ket="${idx}" value="${entry.keterangan||''}"></td>
      <td style="width:140px;"><input type="number" step="0.01" min="0" data-pu-jurnal-debit="${idx}" value="${entry.debit||0}"></td>
      <td style="width:140px;"><input type="number" step="0.01" min="0" data-pu-jurnal-kredit="${idx}" value="${entry.kredit||0}"></td>
      <td style="width:36px;"><button type="button" class="icon-btn del" data-pu-jurnal-del="${idx}" title="Hapus Baris">${icon('trash',14)}</button></td>
    </tr>`;
  }
  return `
    <tr>
      <td style="min-width:120px;"><input type="text" value="${entry.kodeAkun||''}" readonly></td>
      <td style="min-width:180px;"><input type="text" value="${entry.namaAkun||''}" readonly></td>
      <td style="min-width:170px;"><input type="text" value="${entry.keterangan||''}" readonly></td>
      <td style="width:140px;"><input type="text" value="${puNum2(entry.debit||0)}" readonly style="text-align:right;"></td>
      <td style="width:140px;"><input type="text" value="${puNum2(entry.kredit||0)}" readonly style="text-align:right;"></td>
    </tr>`;
}

function tplPuJurnalRows(list, isManual){
  if(!list || !list.length) return `<tr><td colspan="${isManual?6:5}" style="color:var(--text-light);">Belum ada rincian jurnal — klik "Buat Jurnal".</td></tr>`;
  return list.map((entry,idx) => tplPuJurnalRow(entry, idx, isManual)).join('');
}

function tplPuJurnalContent(row){
  const isManual = row.jurnalMode === 'manual';
  const totals = puJurnalTotals(row);
  const selisihColor = Math.abs(totals.selisih) > 0.004 ? 'var(--red)' : 'var(--text)';
  return `
    <div style="display:flex;align-items:center;justify-content:space-between;gap:12px;margin:16px 0 14px;flex-wrap:wrap;">
      <div class="radio-inline" style="padding-top:0;">
        <label><input type="radio" name="puJurnalMode" id="puJurnalOtomatis" value="otomatis" ${!isManual?'checked':''}> Jurnal Otomatis</label>
        <label><input type="radio" name="puJurnalMode" id="puJurnalManual" value="manual" ${isManual?'checked':''}> Jurnal Manual</label>
      </div>
      <button type="button" class="btn-teal" id="puBuatJurnal">${icon('refreshCw',13)} Buat Jurnal</button>
    </div>
    <div class="table-wrap">
      <table class="po-item-table">
        <thead><tr>
          <th>Kode Akun</th><th>Nama Akun</th><th>Keterangan</th><th>Jumlah Debit</th><th>Jumlah Kredit</th>${isManual?'<th></th>':''}
        </tr></thead>
        <tbody id="puJurnalBody">${tplPuJurnalRows(row.jurnalAkun, isManual)}</tbody>
      </table>
    </div>
    ${isManual ? `<a href="#" id="puJurnalAddRow" class="link-add">${icon('plus',12)} Tambah Akun Baru</a>` : ''}
    <div style="max-width:260px;margin:16px 0 0 auto;">
      <div style="font-size:12.5px;font-weight:600;color:var(--text);margin-bottom:4px;">Jumlah Debit - Kredit</div>
      <input type="text" id="puJurnalSelisih" value="${puNum2(totals.selisih)}" readonly style="text-align:right;font-weight:700;color:${selisihColor};">
    </div>`;
}

/* Picker Akun GL untuk tabel Rincian Jurnal Akun (mode Manual) — SALINAN
   LOKAL dari tplInvAkunPicker()/tplInvAkunPickerRows() (invoice.template.js). */
function tplPuAkunPicker(list){
  return `
    <div class="modal-box" style="max-width:640px;">
      <div class="modal-header"><span>Pilih Akun GL</span><span class="close" id="modalClose">&times;</span></div>
      <div class="modal-body">
        <input type="text" id="puAkunPickerSearch" placeholder="Cari kode / nama akun..." style="width:100%;border:1px solid var(--border);border-radius:6px;padding:8px 10px;font-size:12.8px;margin-bottom:12px;">
        <div class="table-wrap" style="max-height:360px;overflow:auto;">
          <table>
            <thead><tr><th>Kode</th><th>Nama Akun</th><th>Kat.</th><th></th></tr></thead>
            <tbody id="puAkunPickerBody">${tplPuAkunPickerRows(list)}</tbody>
          </table>
        </div>
      </div>
      <div class="modal-footer"><button class="btn-secondary" id="modalCancel">Tutup</button></div>
    </div>`;
}

function tplPuAkunPickerRows(list){
  if(!list.length) return `<tr><td colspan="4" style="color:var(--text-light);">Tidak ada akun ditemukan</td></tr>`;
  return list.map(a=>`
    <tr>
      <td>${a.kode}</td>
      <td>${a.nama}</td>
      <td>${a.kategori}</td>
      <td><button class="btn-pick" data-pu-pick-akun="${a.kode}">Pilih</button></td>
    </tr>`).join('');
}

/* =====================================================================
   PICKER Supplier — SALINAN LOKAL dari tplPpCustomerPicker() (Penerimaan
   Piutang), disesuaikan ke DATA.suppliers.
===================================================================== */
function tplPuSupplierPicker(list){
  return `
    <div class="modal-box" style="max-width:560px;">
      <div class="modal-header"><span>Pilih Supplier</span><span class="close" id="modalClose">&times;</span></div>
      <div class="modal-body">
        <div class="table-wrap" style="max-height:340px;overflow:auto;"><table>
          <thead><tr><th>Kode</th><th>Nama Supplier</th><th>Wilayah</th><th></th></tr></thead>
          <tbody>${list.map(s=>`<tr><td>${s.kode}</td><td>${s.nama}</td><td>${s.wilayah||''}</td><td><button class="btn-pick" data-pick-supplier="${s.kode}">Pilih</button></td></tr>`).join('')}</tbody>
        </table></div>
      </div>
      <div class="modal-footer"><button class="btn-secondary" id="modalCancel">Tutup</button></div>
    </div>`;
}

function tplPuAkunBankPicker(list){
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

/* Picker dekoratif "Pengajuan Pembayaran" — SALINAN LOKAL dari pola
   tplPpDecorativePicker(), dataset SELALU kosong (belum ada modul master
   "Pengajuan Pembayaran" di mockup ini — lihat catatan besar di header
   file ini). */
function tplPuDecorativePicker(title, list){
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

function tplPuDeleteConfirm(row){
  return `
    <div class="modal-box">
      <div class="modal-header"><span>Hapus Pelunasan Utang</span><span class="close" id="modalClose">&times;</span></div>
      <div class="modal-body"><p>Yakin ingin menghapus Pelunasan Utang <b>${row.no}</b>? Sisa utang pada Faktur Pembelian terkait akan dikembalikan seperti semula.</p></div>
      <div class="modal-footer">
        <button class="btn-secondary" id="modalCancel">Batal</button>
        <button class="btn-danger" id="modalDelete">Hapus</button>
      </div>
    </div>`;
}

function tplPuInfoModal(title, text){
  return `
    <div class="modal-box">
      <div class="modal-header"><span>${title}</span><span class="close" id="modalClose">&times;</span></div>
      <div class="modal-body"><p>${text}</p></div>
      <div class="modal-footer"><button class="btn-primary" id="modalOk">Mengerti</button></div>
    </div>`;
}
