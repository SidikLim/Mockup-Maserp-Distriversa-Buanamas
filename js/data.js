/* =========================================================
   SAMPLE DATA — PT Distriversa Buanamas
========================================================= */
const rp = n => 'Rp ' + Number(n).toLocaleString('id-ID');
const num = n => Number(n).toLocaleString('id-ID');

/* =========================================================
   REPORT CENTERS — isi menu "Daftar Laporan" (2026-08-21)
   Ditambahkan 2026-08-21 (lanjutan mockup "Daftar Laporan"):
   sebelumnya menu ini cuma grid kartu judul dekoratif dari
   DATA.reports (array string polos, LIHAT versi lama di
   riwayat git). Sekarang direplikasi persis struktur "Report
   Center" MASERP sungguhan — 10 kategori submenu (Cetakan
   Transaksi/Account Receivable/Penjualan/Account Payable/
   Purchasing/Persediaan Barang/Kas-Bank/General Ledger/Aktiva
   Tetap/Cabang), masing-masing berupa tabel No./Report/
   Keterangan/Permission Code/Print/Edit Report/Reset Report,
   dikelompokkan per header kategori (mis. "FINANCE",
   "PELUNASAN HUTANG") PERSIS urutan & pengelompokan screenshot
   MASERP yang dikirim user. Nama/keterangan/permission code
   report SENGAJA TIDAK diganti ke istilah DBM manapun — ini
   daftar nama-nama laporan sistem generik MASERP, bukan data
   demo perusahaan lain, jadi valid dipakai apa adanya untuk
   instalasi PT Distriversa Buanamas juga (beda dengan data
   customer/supplier di modul lain yang memang diganti ke DBM).

   Kategori "Cetakan Transaksi" pada screenshot asli berisi
   jauh lebih banyak baris (belasan sub-kelompok kecil seperti
   PROJECT/KWITANSI/KASBON/dll dengan hanya 1-4 baris masing²)
   dalam resolusi gambar yang sangat kecil/padat sehingga sulit
   dipastikan akurat sampai baris-baris paling detail — mengikuti
   precedent modul Master Rayon (2026-08-18, kecamatan 117→24
   baris) & Price List By Province (2026-08-19, ~690→10 baris),
   volume di kategori ini DIRAMPINGKAN sambil tetap
   mempertahankan SEMUA nama kelompok yang terlihat di screenshot
   beserta contoh baris yang representatif per kelompok — bukan
   replikasi 1:1 jumlah barisnya.

   Tombol Print/Edit Report/Reset Report di tabel SENGAJA
   dekoratif (buka modal info singkat) — sesuai instruksi user
   modul ini baru sampai LIST laporannya saja, belum sampai
   membangun format/desainer laporannya.
========================================================= */
function rcGroup(name, rows){
  return { name, rows: rows.map(r=>({no:r[0], report:r[1], ket:r[2], perm:r[3]||''})) };
}
const REPORT_CENTERS_DATA = {
  cabang:{ title:'Cabang', groups:[
    rcGroup('CABANG', [
      [1,'Laporan Kontrol Inventory','Dalam laporan ini anda dapat melihat Transaksi Inventory berdasarkan Cabang'],
      [2,'Laporan Laba Rugi Multi Cabang','Laporan Laba / Rugi Multi Cabang berjejer kekanan.'],
      [3,'Laporan Laba Rugi Multi Cabang (Excel)','Laporan Laba / Rugi Multi Cabang yang akan tampil dalam excel.'],
      [4,'Laporan Laba Rugi Per Cabang','Laporan Laba / Rugi Per Cabang.'],
      [5,'Laporan Neraca Per Cabang','Laporan Neraca Per Cabang.'],
      [6,'Laporan Neraca Multiple Cabang','Laporan Neraca Multi Cabang berjejer kekanan.'],
      [7,'Laporan Cabang Pembelian','Laporan Pembelian per Cabang.','DepartmentByPurchaseBill'],
      [8,'Laporan Cabang Rekap Pembelian Per Bulan','Laporan Rekap Pembelian Berdasarkan Cabang Sortir Bulan.','DepartmentByPurchaseBillForRekap'],
      [9,'Laporan Cabang Penjualan','Laporan Penjualan per Cabang.'],
      [10,'Laporan Cabang Rekap Penjualan Per Bulan','Laporan Rekap Penjualan Berdasarkan Cabang Sortir Bulan.'],
      [11,'Laporan Cabang Cash/Bank','Laporan Cash/Bank per Cabang.'],
      [12,'Laporan Cabang Piutang','Laporan Piutang per Cabang.'],
      [13,'Laporan Jurnal Umum','Laporan jurnal umum berdasarkan Cabang.'],
      [14,'Laporan Buku Besar','Laporan buku besar berdasarkan Cabang (wajib menggunakan neraca per Cabang).'],
      [15,'Laporan Aktivitas User Per Hari','Laporan Aktivitas User Per Hari.'],
      [16,'Laporan Arus Kas Multi Cabang','Laporan Arus Kas Multi Cabang'],
      [17,'Laporan Budgeting Cabang Per Bulan','Laporan Budgeting Cabang Per Bulan.'],
      [18,'Laporan Budgeting Cabang 1 Tahun','Laporan Budgeting Cabang dalam satu tahun.'],
      [19,'Laporan Budgeting Purchase Request Per Cabang','Laporan Budgeting Purchase Request Per Cabang.'],
      [20,'Laporan Uang Muka Multiple Cabang','Laporan Uang Muka Cabang berjejer kekanan.'],
      [21,'Laporan Omset Klinik','Laporan omset per Cabang.'],
    ]),
  ]},
  aktivaTetap:{ title:'Fixed Asset', groups:[
    rcGroup('', [
      [1,'Daftar Fixed Asset','Dalam laporan ini Anda dapat melihat daftar fixed asset','PrintFixedAsset'],
      [2,'Penyusutan Fixed Asset Bulanan','Dalam laporan ini Anda dapat melihat Penyusutan Fixed Asset Bulanan','PrintFixedAssetSaldo'],
      [3,'Kartu Assets','Dalam laporan ini Anda dapat melihat rincian','PrintAssetCard'],
      [4,'Pembelian Asset Tahun Ini','Dalam laporan ini Anda dapat melihat pembelian asset tahun ini','PrintAssetPurchasingThisYear'],
      [5,'Biaya Asset','Dalam laporan ini Anda dapat melihat biaya asset.','PrintFixedAssetBiaya'],
      [6,'History Pemakaian Inventory','Dalam laporan ini Anda dapat melihat History Pemakaian Inventory','PrintFixedAssetBiaya'],
    ]),
  ]},
  ap:{ title:'Account Payable', groups:[
    rcGroup('FINANCE', [
      [1,'FA-02 Lap Hutang','Dalam laporan ini anda dapat melihat daftar Hutang Supplier','PrintListOfBillPayable'],
      [2,'FA-03 Lap Hutang Per Faktur','Dalam laporan ini anda dapat melihat saldo Supplier perfaktur','ReportOfBillsPayableByNoFaktur'],
      [3,'FA-04 Lap Umur Hutang','Dalam laporan ini anda dapat melihat umur Hutang Supplier','PrintPayablesDueDate'],
    ]),
    rcGroup('PELUNASAN HUTANG', [
      [1,'Laporan Kartu Supplier','Cetak Kartu Supplier','SupplierCard'],
      [2,'Laporan Rekap Umur Hutang','Dalam laporan ini anda dapat melihat rekap umur Hutang Supplier','PrintPayablesDueDateRekap'],
      [3,'Laporan Rekening Koran','Dalam laporan ini anda dapat melihat rekening koran Supplier','PrintApStatementAllDateFaktur'],
      [4,'Laporan Transaksi','Dalam laporan ini anda dapat melihat laporan transaksi Supplier','PrintPayableTransactionByFakturDate'],
      [5,'Laporan Daftar Supplier Dengan Saldo','Dalam laporan ini anda dapat melihat dengan saldo Supplier','PrintSupplierWithBalance'],
      [6,'Laporan Daftar Supplier Tanpa saldo','Dalam laporan ini anda dapat melihat tanpa saldo Supplier','PrintSupplierWithoutBalance'],
      [7,'Laporan Daftar Supplier Perwilayah','Dalam laporan ini anda dapat melihat saldo Supplier perwilayah','PrintSupplierWithBalanceByLocation'],
      [8,'Laporan Daftar Hutang Perfaktur Dengan Detail Kurs','Dalam laporan ini anda dapat melihat saldo Supplier perfaktur dengan detail kurs','ReportOfBillsPayableByNoFaktur'],
      [9,'Cetak Bukti Transaksi AP','Dalam laporan ini anda dapat melihat Bukti Transaksi AP','PrintPayableTransactionByTransactionNumber'],
      [10,'Cetak Bukti Transaksi AP Blank Form','Cetak Bukti Transaksi AP Form','PrintPayableTransactionBlankForm'],
      [11,'Laporan Daftar Uang Muka Supplier','Dalam laporan ini anda dapat melihat Daftar Uang Muka Supplier','PrintSupplierDownPayment'],
      [12,'Laporan Perbandingan A.P. dan GlAccount','Report ini menampilkan perbandingan antara Modul Rincian A.P. dengan Modul Rincian General Ledger yang berstatus cair (C).'],
      [13,'Laporan Daftar Supplier Dengan Saldo Berdasarkan Kurs','Dalam laporan ini anda dapat melihat dengan saldo Supplier berdasarkan Kurs'],
      [14,'Print Daftar Faktur pembelian yang sudah lunas dan belum isi nomor Faktur Pajak','Dalam laporan ini anda dapat melihat Faktur pembelian yang sudah lunas dan belum isi nomor Faktur Pajak','PrintListOfBillPayableNotExistsFakturP'],
    ]),
  ]},
  ar:{ title:'Account Receivable', groups:[
    rcGroup('FINANCE', [
      [1,'FA-05 Lap Piutang','Dalam laporan ini anda dapat melihat daftar piutang customer','PrintListOfBillsReceivable'],
      [2,'FA-06 Lap Piutang Per Faktur','Dalam laporan ini anda dapat melihat saldo customer perfaktur','PrintListOfBillsReceivableByNoFaktur'],
      [3,'FA-07 Lap Piutang Per Wilayah','Dalam laporan ini anda dapat melihat saldo customer perwilayah','PrintCustomerWithBalanceByLocation'],
      [4,'FA-08 Lap SSP Belum Diterima','Dalam laporan ini anda dapat melihat daftar SSP belum diterima','PrintReportSspListNotReceived'],
      [5,'FA-09 Lap SSP Sudah Diterima','Dalam laporan ini anda dapat melihat daftar SSP sudah diterima','PrintReportSspListReceived'],
      [6,'FA-10 Lap Umur Piutang','Dalam laporan ini anda dapat melihat umur piutang customer','PrintReceivabledDueDate'],
      [7,'FA-11 Lap AR Faktur per Customer','Dalam laporan ini anda dapat melihat AR faktur per customer','PrintArFakturPerCustomer'],
      [8,'FA-12 Lap AR vs Pelunasan per Customer','Dalam laporan ini anda dapat melihat AR vs pelunasan per customer','PrintArDanPelunasanPerCustomer'],
      [9,'FA-13 Lap List Sales & Collection Cabang','Dalam laporan ini anda dapat melihat List Sales & Collection Cabang','PrintListSalesDanCollectionCabang'],
      [10,'Laporan Umur Piutang Detail','Dalam laporan ini anda dapat melihat umur piutang customer per salesman','PrintReceivabledDueDatePerSalesman'],
    ]),
    rcGroup('CUSTOMER & PIUTANG', [
      [1,'Laporan AR Konsumen','Dalam laporan ini anda dapat melihat daftar AR Konsumen','PrintARKonsumen'],
      [2,'Laporan AR Faktur','Dalam laporan ini anda dapat melihat daftar AR Faktur','PrintARFaktur'],
      [3,'Laporan Kartu Customer','Cetak Kartu Customer','CustomerCard'],
      [4,'Laporan Rekap Umur Piutang','Dalam laporan ini anda dapat melihat rekap umur piutang customer','PrintReceivabledDueDateRekap'],
      [5,'Laporan Rekening Koran','Dalam laporan ini anda dapat melihat rekening koran customer','PrintArStatementAllDateFaktur'],
      [6,'Laporan Rekening Koran Full','Dalam laporan ini anda dapat melihat rekening koran customer dengan saldo uang muka dan giro','PrintArStatementAllDateFakturFull'],
      [7,'Laporan Transaksi Penjualan Customer','Dalam laporan ini anda dapat melihat laporan transaksi customer','PrintReceivableTransactionByFakturDate'],
      [8,'Laporan Daftar Customer Dengan Saldo','Dalam laporan ini anda dapat melihat dengan saldo customer','PrintCustomerWithBalance'],
      [9,'Laporan Daftar Customer Tanpa saldo','Dalam laporan ini anda dapat melihat tanpa saldo customer','PrintCustomerWithoutBalance'],
      [10,'Laporan Daftar Piutang Perfaktur Dengan Detail Kurs','Dalam laporan ini anda dapat melihat saldo customer perfaktur dengan detail kurs','PrintListOfBillsReceivableByNoFaktur'],
      [11,'Cetak Bukti Transaksi AR','Dalam laporan ini anda dapat melihat Bukti Transaksi AR','PrintReceivableTransactionByTransactionNumber'],
      [12,'Laporan Customer tanpa Penjualan','Dalam Laporan ini anda dapat mengetahui customer yang belum terjual.','PrintCustomerWithNoSales'],
      [13,'Laporan Daftar Customer dengan Sisa Kredit','Dalam Laporan ini anda dapat mengetahui jumlah piutang, batas piutang, dan sisa piutang per customer.','PrintCustomerSisaBatasKredit'],
      [14,'Laporan Perbandingan A.R. dan GlAccount','Report ini menampilkan perbandingan antara Modul Rincian A.R. dengan Modul Rincian General Ledger yang berstatus cair (C).','PrintPerbandinganAccountReceivableDanGlAccount'],
      [15,'Laporan Daftar Uang Muka Customer','Dalam laporan ini anda dapat melihat Daftar Uang Muka Customer','PrintCustomerDownPayment'],
      [16,'Laporan PPN Masukan dan PPN Keluaran','Dalam laporan ini anda dapat melihat Daftar PPN Masukan dan PPN Keluaran','PrintPPnInAndOut'],
      [17,'Laporan Kartu AR','Dalam laporan ini anda dapat melihat Kartu AR (Mata Uang Sebenarnya)','PrintArCard'],
    ]),
    rcGroup('DOMINASI', [
      [1,'Laporan Dominasi Approved','Dalam laporan ini anda dapat melihat laporan dominasi approved','PrintDominasiApproved'],
      [2,'Laporan Dominasi Klaim','Dalam laporan ini anda dapat melihat laporan dominasi klaim','PrintDominasiKlaim'],
      [3,'Laporan Dominasi Lunas','Dalam laporan ini anda dapat melihat laporan dominasi lunas','PrintDominasiLunas'],
    ]),
  ]},
  purchasing:{ title:'Pembelian', groups:[
    rcGroup('PURCHASE REQUEST', [
      [1,'Laporan Purchase Request berdasarkan Departemen','Dalam laporan ini anda dapat mengetahui Purchase Request per Departemen','PrintPurchaseRequestByDepartment'],
      [2,'Daftar Purchase Request','Daftar Purchase Request (1 halaman)','PrintPurchaseRequestList'],
    ]),
    rcGroup('PURCHASE ORDER', [
      [1,'Laporan Purchase Order Pertanggal','Dalam laporan ini anda dapat melihat order Pembelian pertanggal','PrintPurchaseOrderByDate'],
      [2,'Laporan Daftar Purchase Order','Daftar Purchase Order','PrintPurchaseOrderList'],
      [3,'Laporan Back Order P.O.','Dalam laporan ini anda dapat melihat qty barang yang belum terkirim dan sudah terkirim','PrintBackOrderPo'],
      [4,'Laporan Status Pengiriman PO Ke PU','Dalam laporan ini anda dapat mengetahui alur pengiriman PO ke PU','PoDeliveryStatus'],
    ]),
    rcGroup('PENERIMAAN BARANG', [
      [1,'Laporan Daftar Penerimaan Barang','Dalam laporan ini anda dapat melihat Daftar Penerimaan Barang','PrintProofOfReceiptInventory'],
      [2,'Laporan Daftar Penerimaan Barang Dengan Batch Number','Dalam laporan ini anda dapat melihat Daftar Penerimaan Barang dengan Batch Number','PrintProofOfReceiptInventoryWithBatchNumber'],
      [3,'Laporan Back Order dari Purchase Order-Bukti Penerimaan Barang Pertanggal','Dalam laporan ini anda dapat melihat Purchase Order-Bukti Penerimaan Barang pertanggal','PrintReceiveInventoryReportBySjPerFaktur'],
      [4,'Laporan Pembelian per hari bedasarkan BPB','Laporan ini untuk melihat BPB mana saja yang belum datang tagihannya dari Supplier','TransactionPurchaseByProofOfReceipt'],
      [5,'Laporan BPB dengan harga beli','Laporan ini untuk melihat BPB dengan harga beli','PrintProofOfReceiptWithPrice'],
      [6,'Laporan BPB Yang Belum Dibuatkan Faktur Pembelian','Dalam laporan ini dapat melihat bukti penerimaan barang yang belum dibuatkan Faktur Pembelian','PrintProofOfReceiptWithNoInvoice'],
    ]),
    rcGroup('PEMBELIAN', [
      [1,'Laporan Pembelian','Dalam laporan ini anda dapat melihat Pembelian secara rinci','PrintPayablePerFaktur'],
      [2,'Laporan History Pembelian PerProduk','Dalam laporan ini anda dapat melihat history pembelian perproduk','PrintPurhasingByProduct'],
      [3,'Laporan Pembelian Perhari','Dalam laporan ini anda dapat melihat Pembelian perhari','PrintPurchasePerDay'],
      [4,'Laporan Pembelian Terbanyak Supplier','Dalam laporan ini anda dapat melihat Pembelian Terbanyak Supplier','PrintHighestPurchasingBySupplier'],
      [5,'Laporan Rekap Pembelian Per Produk','Dalam laporan ini anda dapat melihat Rekap Pembelian Per Produk','PrintPurchaseSummeryByProduct'],
      [6,'Laporan Pembelian Per Supplier - Item','Dalam laporan ini anda dapat melihat pembelian barang persupplier item','PrintPurchaseItemPerSupplierItem'],
      [7,'Laporan Pembelian Per Per Supplier - Kategori','Dalam laporan ini anda dapat melihat pembelian barang persupplier - Kategori','PrintPurchaseItemPerSupplierKategori'],
      [8,'Laporan Pembelian Pertanggal','Dalam laporan ini anda dapat melihat Pembelian pertanggal','PrintTransactionPayablesPerDate'],
      [9,'Laporan Alokasi Biaya Import v1','Dalam laporan ini anda dapat melihat Alokasi Biaya Import v1','PrintAlokasiBiayaImport'],
      [10,'Laporan Biaya Import V2','Dalam laporan ini anda dapat melihat Biaya Import V1','PrintBiayaImport2'],
    ]),
    rcGroup('DELIVERY REQUEST', [
      [1,'Laporan Delivery Request Cabang','Dalam laporan ini anda dapat melihat delivery request cabang','PrintDeliveryRequestCabang'],
      [2,'Laporan Delivery Request Head Office','Dalam laporan ini anda dapat melihat delivery request head office','PrintDeliveryRequestHeadOffice'],
      [3,'Laporan Terima Delivery Request','Dalam laporan ini dapat melihat daftar terima Delivery Request','PrintReceiveDeliveryRequest'],
    ]),
  ]},
  kasBank:{ title:'Cash And Bank', groups:[
    rcGroup('KAS DAN BANK', [
      [1,'Laporan Keluar Masuk Kas/Bank (Per Tanggal)','Dalam laporan ini Anda dapat melihat transaksi keluar masuk uang dari perusahaan ini per harinya.','PrintCashBankInOutList'],
      [2,'Laporan Saldo Bank','Dalam laporan ini Anda dapat melihat transaksi mutasi kas dan bank','PrintBankWithBalance'],
      [3,'Laporan Giro Akan Jth Tmp.','Report ini menampilkan laporan rincian umur giro mundur yang akan jatuh tempo','PrintGiroWithDueDate'],
      [4,'Laporan Kas dan Bank By Kode Bank','Dalam laporan ini Anda dapat mencetak transaksi kas dan bank berdasarkan kode bank','TransaksiKasBankByKodeBank'],
      [5,'Laporan Rekening Koran','Dalam laporan ini Anda dapat mencetak rekening koran bank','PrintRekeningKoran'],
      [6,'Laporan Pelunasan Piutang','Report ini menampilkan laporan piutang yang sudah dilunasakan','SettlementOfAccountReceivableReport'],
      [7,'Laporan Pembayaran Hutang','Report ini menampilkan laporan hutang yang sudah dilunasakan','DebtPaymentReport'],
      [8,'Laporan Perbandingan Kas/Bank dan GlAccount','Report ini menampilkan perbandingan antara Modul Rincian Kas Bank dengan Modul Rincian General Ledger yang berstatus cair (C)'],
      [9,'Rekapitulasi Piutang Giro Mundur','Report ini menampilkan rekapitulasi piutang giro mundur'],
    ]),
    rcGroup('CASH FLOW', [
      [1,'Laporan Arus Kas per Bank','Report ini menampilkan arus Kas / Bank','ReportCashFlow'],
      [2,'Laporan Arus Kas Langsung','Dalam Report ini Anda dapat melihat Laporan Arus Kas Langsung secara total, dan detail Akun','ReportCashFlow'],
      [3,'Laporan Arus Kas Langsung dengan detail transaksi','Dalam Report ini Anda dapat melihat Laporan Arus Kas Langsung dengan detail rincian transaksinya','ReportCashFlow'],
    ]),
    rcGroup('SELISIH KURS', [
      [1,'Laporan Selisih Kurs Customer','Report ini menampilkan Selisih Kurs Customer','PrintCurrencyChangeForCustomer'],
      [2,'Laporan Selisih Kurs Supplier','Report ini menampilkan Selisih Kurs Supplier','PrintCurrencyChangeForVendor'],
      [3,'Laporan Selisih Kurs Cash / Bank','Report ini menampilkan Selisih Kurs Cash / Bank','PrintCurrencyChangeForCashBank'],
    ]),
    rcGroup('CETAKAN', [
      [1,'Cetakan Transaksi Kas Blank Form','Cetakan Transaksi Kas Blank Form','PrintCashTransactionBlankForm'],
      [2,'Cetak Bukti Bank Masuk','Report ini menampilkan cetakan laporan bukti bank masuk dari penerimaan piutang','CetakBuktiTerimaPiutang'],
      [3,'Cetak Bukti Bank Keluar','Report ini menampilkan cetakan laporan bukti bank keluar dari pembayaran hutang','CetakBuktiBayarHutang'],
      [4,'Cetak Bukti Kas Masuk','Report ini menampilkan cetakan laporan bukti kas masuk','CetakBuktiTransaksiLainlain'],
      [5,'Cetak Bukti Kas Keluar','Report ini menampilkan cetakan laporan bukti kas keluar','CetakBuktiTransaksiLainlain'],
    ]),
    rcGroup('KARYAWAN', [
      [1,'Cetak Bukti Kas Bon','Report ini menampilkan cetakan laporan bukti kas bon','CetakBuktiKasBon'],
      [2,'Cetak Bukti Pengembalian Kas Bon','Report ini menampilkan cetakan laporan bukti pengembalian kas bon','CetakBuktiPengembalianKasBon'],
      [3,'Laporan Daftar Kas Bon Karyawan','Dalam laporan ini Anda dapat melihat daftar piutang Karyawan','PrintListOfBillsEmployee'],
      [4,'Laporan Daftar Karyawan Dengan Saldo','Dalam laporan ini Anda dapat melihat dengan saldo karyawan','PrintEmployeeWithBalance'],
    ]),
  ]},
  gl:{ title:'General Ledger', groups:[
    rcGroup('LAPORAN DAFTAR AKUN', [
      [1,'Daftar Akun COA','Daftar akun Chart of Account beserta Kategorinya','DaftarAkunCOA'],
      [2,'Daftar Akun COA Dengan Saldo','Daftar akun Chart of Account beserta Kategorinya dan saldo','DaftarAkunCOADenganSaldo'],
      [3,'Daftar Akun COA Dengan Saldo Debit Kredit','Daftar akun Chart of Account beserta Kategorinya dan saldo debit kredit','DaftarAkunCOADenganSaldo'],
      [4,'Kartu G.L.','Cetak Laporan Gl. Lengkap','GeneralLedgerCard'],
      [5,'Kartu G.L. Per Departemen','Cetak Laporan Gl. Lengkap dengan departemen'],
    ]),
    rcGroup('LAPORAN TRANSAKSI G.L.', [
      [1,'Buku Besar','Lihat rincian transaksi per kode Akun GL','PrintTransactionAccountPerAccountCode'],
      [2,'Laporan Jurnal Umum','Transaksi jurnal yang terjadi dalam periode yang ditentukan.','PrintTransactionAccountsPerDate'],
      [3,'Laporan Transaksi Saldo Awal','Transaksi saldo awal Per Kode Akun','PrintTransactionStartingBalancePerAccountCode'],
      [4,'Laporan Lawan Akun','Laporan Lawan Akun'],
      [5,'Buku Besar Per Departemen','Lihat rincian transaksi per kode Akun GL berdasarkan Departemen'],
    ]),
    rcGroup('LAPORAN NERACA', [
      [1,'Neraca (Format Skontro)','Neraca untuk menganalisa aktiva dan passiva perusahaan untuk bulan yang sudah ditentukan.','PrintGeneralLedgerSKontro'],
      [2,'Neraca (Format Staffel)','Neraca untuk menganalisa aktiva dan passiva perusahaan untuk bulan yang sudah ditentukan.','PrintGeneralLedgerStaffel'],
      [3,'Neraca Mutasi','Neraca untuk mengetahui saldo awal, saldo berjalan, dan saldo akhir dalam bulan yang ditentukan.','BalanceSheetMutationByMonth'],
      [4,'Neraca Perbandingan Periode Bulanan','Perbanding neraca berjejer selama bulan yang ditentukan','YearlyBalanceSheet'],
      [5,'Neraca Percobaan (A4)','Laporan Nearaca Percobaan secara rekap, beserta saldo awal dan akhir','PrintGlTrialBalance'],
      [6,'Transaksi Neraca Percobaan (Besar)','Report ini menampilkan laporan neraca percobaan(perincian saldo awal Db/Kr, mutasi Db/Kr dan saldo akhir Db/Kr).','PrintDebitCreditTrialBalanceLarge'],
      [7,'Debit Kredit Neraca Percobaan','Report ini menampilkan laporan neraca percobaan(rekap saldo akhir Db/Kr)','PrintDebitCreditTrialBalance'],
      [8,'Perbandingan Neraca Lintas Tahun dan Bulan (Format Staffel)','Report ini menampilkan Perbandingan Neraca Lintas Tahun dan Bulan','PrintComparisonBalanceSheetByYearAndMonthStaffel'],
      [9,'Perbandingan Neraca Lintas Tahun dan Bulan (Format Skontro)','Report ini menampilkan Perbandingan Neraca Lintas Tahun dan Bulan','PrintComparisonBalanceSheetByYearAndMonthSkontro'],
    ]),
    rcGroup('LAPORAN LABA RUGI', [
      [1,'Laba/Rugi (Profit/Loss)','Total jumlah dari pembelian, penjualan dan biaya untuk menghitung laba bersih perusahaan.','PrintGLRugiLabaBulan'],
      [2,'Laporan Laba/Rugi Mutasi','Laporan Laba/Rugi Mutasi dari Saldo Awal Bulan, Mutasi Bulan, dan Saldo Akhir','PrintGLRugiLabaMutasi'],
      [3,'Laporan Laba/Rugi Budgeting','Laporan Laba/Rugi Budgeting Per Bulan','ProfitLossWithBudget'],
      [4,'Laba/Rugi (Profit/Loss) PerTahun','Total jumlah dari pembelian, penjualan dan biaya untuk menghitung laba bersih perusahaan per Tahun.','YearlyProfitLossReport'],
      [5,'Laba/Rugi (Profit/Loss) Per 12 Bulan','Total jumlah dari pembelian, penjualan dan biaya untuk menghitung laba bersih perusahaan per 12 bulan.','TwelveMonthProfitLossReport'],
      [6,'Laba/Rugi (Profit/Loss) Multi Cost Center','Total jumlah dari pembelian, penjualan dan biaya untuk menghitung laba bersih perusahaan.','PrintGlRugiLabaMutasiMultipleCostCenter'],
      [7,'Laba/Rugi (Profit/Loss) Per Cost Center','Total jumlah dari pembelian, penjualan dan biaya untuk menghitung laba bersih perusahaan.','PrintGlRugiLabaMutasiSingleCostCenter'],
      [8,'Laporan Laba/Rugi Perbandingan Triwulan Tahun Ini','Laporan Laba/Rugi Perbandingan Triwulan Tahun Ini','PrintGlRugiLabaTriwulan'],
      [9,'Laporan Laba/Rugi Perbandingan Triwulan Tahun Ini Dan Tahun Lalu','Laporan Laba/Rugi Perbandingan Triwulan Tahun Ini Dan Tahun Lalu','PrintGlRugiLabaTriwulanDgnTahunLalu'],
      [10,'Laporan Laba / Rugi Perbandingan Antar Tahun','Laporan Laba / Rugi Perbandingan Antar Tahun','PrintGlRugiLabaPerbandinganTahun'],
      [11,'Laba/Rugi (Profit/Loss) Per 12 Bulan Per Departemen','Total jumlah dari pembelian, penjualan dan biaya untuk menghitung laba bersih perusahaan per 12 bulan per Departemen.','TwelveMonthProfitLossPerDepartmentReport'],
      [12,'Laporan Laba/Rugi Perbandingan Bulan ini dan Bulan lalu','Laporan Laba/Rugi Perbandingan Bulan ini dan Bulan lalu','ProfitLossReportLastMonthComparison'],
    ]),
    rcGroup('LAPORAN RATIO', [
      [1,'Laporan Ratio','Laporan Ratio','RatioReport'],
    ]),
    rcGroup('BUDGET', [
      [1,'Budget Cost Center','Perbandingan Budget dengan Akun Per Cost Center','BudgetPerCostCenter'],
      [2,'Budget Lintas Tahun dan Bulan','Perbandingan Budget dengan Akun Lintas Tahun dan Bulan','ComparisonBudgetByYearAndMonth'],
      [3,'Laporan Budgeting Cost Center per 12 Bulan','Laporan Budgeting Cost Center sebanyak 12 kolom, dengan per kolom melambangkan 1 bulan','LaporanBudgeting'],
    ]),
    rcGroup('TEMPLATE', [
      [1,'General Ledger Template','General Ledger Template'],
    ]),
  ]},
  persediaan:{ title:'Inventory', groups:[
    rcGroup('INVENTORY', [
      [1,'INV-01 Lap Kartu Stock','Report ini menampilkan Kartu Stock Inventory','InventoryCard'],
      [2,'INV-02 Lap Kartu Stock Batch','Report ini menampilkan Kartu Stock Inventory Dengan Batch Number','InventoryCardBatchNumber'],
      [3,'INV-04 Lap Stock Per Batch','Report ini menampilkan List Inventory Stock dengan Batch Number','PrintListInventoryStockBatchNumber'],
      [4,'INV-05 Lap Umur Stock','Report ini menampilkan Qty Barang berdasarkan umur','PrintAgingOfInventory'],
      [5,'INV-06 Lap Barang Near ED','Report ini menampilkan List Barang Near ED','PrintListBarangNearEd'],
      [6,'INV-07 Lap List Barang GIT Reguler','Report ini menampilkan List Barang GIT Reguler','PrintListBarangGitReguler'],
    ]),
    rcGroup('LAPORAN KARTU INVENTORY', [
      [1,'Laporan Saldo Awal Inventory','Report ini menampilkan Daftar Barang dengan saldo awal','PrintDaftarBarangSaldoAwal'],
      [2,'Laporan Saldo Awal Inventory Dengan Serial Number','Report ini menampilkan Daftar Barang dengan saldo awal dan serial number','PrintDaftarBarangSaldoAwalWithSn'],
      [3,'Laporan Qty di bawah Minimum','Report ini menampilkan inventory yang di bawah Qty Minimum.','PrintInventoryQuantityMinimum'],
      [4,'Laporan Qty diatas Maksimum','Report ini menampilkan Qty diatas Maksimum.','InventoryOverQty'],
      [5,'Laporan Daftar Barang Stock Reorder Per Kode Item','Report ini menampilkan Laporan Daftar Barang Stock Reorder Per Kode Item','InventoryMinQtyPerkodeitem'],
      [6,'Laporan Stock Multi Gudang','Report ini menampilkan daftar stock dari banyak gudang','DaftarStockMultiGudang'],
      [7,'Laporan Stock Khusus','Report ini menampilkan daftar stock dengan batch number dan Qty','DaftarStockKhusus'],
    ]),
    rcGroup('LAPORAN DAFTAR INVENTORY', [
      [1,'Laporan Daftar Barang','Menampilkan Daftar Inventory dengan posisi stock akhir','PrintDaftarBarang'],
      [2,'Laporan Daftar Barang dengan Custom Field','Menampilkan Daftar Inventory dengan posisi stock akhir dengan custom field','PrintDaftarBarang'],
      [3,'Laporan Daftar Barang Multi Satuan','Menampilkan Daftar Barang dan Multi Satuan apabila Anda menggunakan lebih dari satu satuan (contoh: PCS, LSN, BAL, CRATE)','PrintDaftarBarangMultiSatuan'],
      [4,'Daftar Inventory Posisi Netto','Menampilkan Laporan Posisi Netto Stock (Qty Netto = Qty Real - Qty SO + Qty PO)','PrintInventoryDaftarPosisiNetto'],
      [5,'Laporan Daftar Barang Dengan HPP','Menampilkan Daftar Barang dengan posisi stock akhir + Harga Pokok sekarang','PrintDaftarBarangDenganHpp'],
      [6,'Laporan Daftar Barang Dengan Batch Number','Report ini menampilkan Daftar Barang yang menggunakan Batch Number','PrintInventoryMasterWithBatchNumber'],
      [7,'Laporan Daftar Barang Dengan Serial Number','Report ini menampilkan Daftar Barang yang menggunakan Serial Number','PrintInventoryMasterWithSerialNumber'],
      [8,'Laporan Pembantu Stock Opname','Menampilkan qty komputer sekarang dan juga menyediakan kolom Qty Asli yang dapat ditulis tangan pada saat proses stock opname. Hasil Stock Opname dapat diinput di menu Transaksi Stock Opname.','PrintSmallInventoryList'],
      [9,'Laporan Pembantu Stock Opname Tanpa Saldo','Sama dengan diatas, tetapi tanpa Saldo, supaya orang gudang dapat mengecek total tanpa acuan Qty Komputer','PrintSmallInventoryWithOutBalanceList'],
      [10,'Laporan Hasil Stock Opname','Report ini menampilkan hasil stock opname yang telah dilakukan','PrintStockOpname'],
      [11,'Laporan Daftar Barang Harga Beli Spesial Supplier','Report ini menampilkan Daftar Inventory dengan Harga Beli Special Supplier','PrintListOfItemsSoldBySupplier'],
      [12,'Laporan Daftar Harga Jual Barang','Report ini menampilkan daftar harga jual barang','InventoryPriceList'],
      [13,'Laporan Daftar Harga Jual Barang dengan sisa stock','Report ini menampilkan daftar harga jual barang dengan sisa stock','InventoryPriceListWithBalance'],
      [14,'Laporan Daftar Harga Beli Barang','Report ini menampilkan daftar harga beli barang','InventoryPurchasePriceList'],
      [15,'Laporan Daftar Qty Inventory Tidak Cukup Untuk S.O.','Report ini menampilkan Qty Barang yang diperlukan untuk Sales Order tetapi qty di gudang tidak mencukupi','PrintInsufficientStockBackOrderSo'],
      [16,'Laporan Mutasi Batch Number','Report ini menampilkan Daftar Barang yang menggunakan Batch Number','PrintMutasiBatchNumber'],
    ]),
    rcGroup('LAPORAN TRANSAKSI INVENTORY', [
      [1,'Laporan Transaksi Inventory','Laporan Transaksi Inventory (pemakaian, penyesuaian positif, penyesuaian negatif).','PrintTransaksiInventory'],
      [2,'Laporan Pengeluaran Barang','Report ini menampilkan transaksi barang dengan type transaksi pengeluaran dari modul Transaksi Inventory','PrintLaporanPengeluaranBarang'],
      [3,'Laporan Transfer Out','Report ini menampilkan transaksi barang dengan type transaksi transfer out dari modul Transaksi Retur','PrintLaporanTransferOutBarang'],
      [4,'Laporan Transfer Produk Bonus','Report ini menampilkan transaksi barang dengan type transaksi transfer produk bonus','PrintLaporanTransferProdukBonus'],
      [5,'Laporan Back Order Stock Request','Dalam laporan ini anda dapat melihat qty barang yang direquest','PrintLaporanBackOrderSr'],
      [6,'Laporan Perbandingan Inventory Dengan GL (Category Journal)','Report ini menampilkan perbandingan inventory dengan GL dengan company profile category journal'],
    ]),
    rcGroup('LAPORAN ANALISA INVENTORY', [
      [1,'Laporan Analisa Penjualan Inventory','Report ini menampilkan laporan analisa penjualan berdasarkan inventory','PrintAnalisaPenjualan'],
      [2,'Laporan Analisa Penjualan Inventory di bawah harga pokok','Report ini menampilkan laporan analisa penjualan dibawah harga pokok','PrintAnalisaPenjualanDibawahHargaPokok'],
      [3,'Laporan Analisa Stock Minus','Report ini menampilkan Qty yang minus (-)','PrintInventoryQtyMinus'],
      [4,'Laporan Analisa Harga Pokok Minus','Report ini menampilkan Harga Pokok yang minus (-)','PrintInventoryHppMinus'],
      [5,'Laporan Laba Rugi Per Item','Report ini menampilkan Rugi Laba Per Item','RugiLabaPerItem'],
      [6,'Laporan Analisa Penjualan Per Salesman','Report ini menampilkan laporan analisa penjualan berdasarkan salesman','PrintAnalisaPenjualanPersalesman'],
      [7,'Laporan Inventory Batch Number','Report ini menampilkan daftar laporan analisa inventory batch Number','PrintLaporaninventoryBatchNumber'],
      [8,'Laporan Analisa Penjualan Per Salesman Per Customer','Report ini menampilkan laporan analisa penjualan berdasarkan salesman dan customer','PrintAnalisaPenjualanPersalesmanPerCustomer'],
      [9,'Laporan Analisa Penjualan Rinci','Report ini menampilkan laporan analisa penjualan secara detail','PrintAnalisaPenjualanPersalesmanPerCustomer'],
    ]),
    rcGroup('LAPORAN STATUS MUTASI', [
      [1,'Laporan Status Mutasi Qty','Menampilkan status mutasi Qty per inventory untuk periode yang dipilih (Qty Awal, Qty Terima, Qty Keluar)','PrintSmallQtyStatus'],
      [2,'Laporan Status Mutasi Nilai','Menampilkan status mutasi Nilai per inventory untuk periode yang dipilih (Nilai Awal, Nilai Terima, Nilai Keluar)','PrintSmallNilaiStatus'],
      [3,'Laporan Status Mutasi Qty dan Nilai','Menampilkan status mutasi qty beserta nilai untuk setiap inventory di semua gudang.','PrintStatusMutasiQtyNilai'],
      [4,'Laporan Status Mutasi Qty Per Rincian','Menampilkan status mutasi qty untuk setiap inventory di semua gudang secara lebih rinci.','PrintStatusMutasiQtyRinci'],
      [5,'Laporan Status Mutasi Qty dan Nilai Perincian','Menampilkan status mutasi qty beserta nilai untuk setiap inventory di semua gudang secara lebih rinci.','PrintStatusMutasiQtyNilaiRinci'],
      [6,'Print Perincian Inventory Qty dan Nilai Kelompok Besar Per Kategory','Menampilkan qty dan nilai inventory kelompok besar per kategori.','PrintInventoryKelompokBesarPerKategori'],
      [7,'Print Perincian Inventory Qty dan Nilai Kelompok Besar','Menampilkan qty dan nilai inventory kelompok besar.','PrintInventoryKelompokBesar'],
      [8,'Print Laporan Posisi Stok dan Back Order','Report ini menampilkan posisi stock dan back order semua gudang(max 6 gudang)','PrintInventoryBackOrder'],
      [9,'Laporan Mutasi Multi Gudang','Report ini menampilkan daftar mutasi stock awal, akhir, terima, keluar barang','DaftarMutasiMultiGudang'],
      [10,'Laporan Inventory Qty Boh','Report ini menampilkan daftar barang yang transaksinya minus','PrintLaporanInventoryQtyBoh'],
      [11,'Laporan Status Mutasi barang Per gudang','Report ini menampilkan status mutasi barang per gudang','PrintLaporanStatusMutasiBarangPerGudang'],
      [12,'Laporan Status Mutasi Qty Batch Number','Menampilkan status mutasi Qty per inventory dengan Batch Number untuk periode yang dipilih (Qty Awal, Qty Terima, Qty Keluar)','PrintSmallQtyStatus'],
    ]),
    rcGroup('CETAKAN BARCODE', [
      [1,'Cetakan Barcode Barang','Report ini menampilkan barcode Barang','PrintBarcodeBarang'],
      [2,'Cetakan QR Code Address','Report ini menampilkan QR Code Address','PrintQrCodeAddress'],
      [3,'Cetakan QR Code Item','Report ini menampilkan QR Code Item','PrintQrCodeItem'],
    ]),
    rcGroup('INVENTORY PER ITEM', [
      [1,'Cetakan Inventory Per Item','Report ini menampilkan detail Inventory per item','PrintInventoryPerItem'],
    ]),
    rcGroup('SLOW MOVING INVENTORY', [
      [1,'Cetakan Slow Moving Inventory','Report ini menampilkan detail Slow Moving Inventory','PrintSlowMovingInventory'],
    ]),
    rcGroup('LIST BARANG', [
      [1,'Cetakan Daftar Barang','Report ini daftar barang'],
    ]),
  ]},
  penjualan:{ title:'Penjualan', groups:[
    rcGroup('SALES', [
      [1,'SI-01 List Sales Quotation (SQ)','Dalam laporan ini anda dapat melihat List Sales Quotation berdasarkan status','PrintListSalesQuotation'],
      [2,'SI-02 List Sales Order (SO)','Dalam laporan ini anda dapat melihat List Sales Order berdasarkan status','PrintListSalesOrder'],
      [3,'SI-03 List Sales & Retur','Dalam laporan ini anda dapat melihat list penjualan dan retur penjualan','PrintListSalesOrderDanRetur'],
      [4,'SI-04 Lap Tracking Status','Dalam laporan ini anda dapat mengetahui alur pengiriman SQ ke SI','SoDeliveryStatus'],
      [5,'SI-05 SQ vs SI','Dalam laporan ini anda dapat melihat SQ terhadap Faktur','PrintSQTerhadapFaktur'],
      [6,'SI-06 Lap Sales Per Hari','Dalam laporan ini anda dapat melihat penjualan perhari','PrintSalesPerDay'],
      [7,'SI-07 Lap Penjualan Produk Bulanan','Dalam laporan ini anda dapat melihat penjualan Produk Bulanan','PrintLaporanSalesProdukBulanan'],
      [8,'SI-08 Lap Sales by Group Konsumen','Dalam laporan ini anda dapat melihat penjualan per Group Konsumen','PrintSalesByGroupKonsumen'],
      [9,'SI-09 Lap Sales by Konsumen','Dalam laporan ini anda dapat melihat penjualan by konsumen','PrintSalesByCustomer'],
      [10,'SI-10 Lap Sales by Rayon','Dalam laporan ini anda dapat melihat List Sales value by Rayon','PrintSalesValueByRayon'],
      [11,'SI-11 Lap Sales Produk by Rayon','Dalam laporan ini anda dapat melihat List Faktur Produk & Value by Rayon','PrintSalesProdukAndValueByRayon'],
      [12,'SI-12 Lap 20 Top Sellings by Unit','Dalam laporan ini anda dapat melihat top 20 penjualan per Unit','PrintTwentyTopSellingByUnit'],
      [13,'SI-13 Lap 20 Top Sellings by Konsumen','Dalam laporan ini anda dapat melihat top 20 penjualan per Konsumen','PrintTwentyTopSellingByCustomer'],
      [14,'SI-14 Lap Evaluasi Performance Individual Team Sales','Dalam laporan ini anda dapat melihat Evaluasi Performance Individual Team Sales','PrintEvaluasiPerformanceIndividualTeamSales'],
      [15,'SI-15 Lap Evaluasi Performance Supervisor','Dalam laporan ini anda dapat melihat Evaluasi Performance Supervisor','PrintEvaluasiPerformanceSupervisor'],
      [16,'SI-16 Lap Evaluasi Performance ASCM','Dalam laporan ini anda dapat melihat Evaluasi Performance ASCM','PrintEvaluasiPerformanceAscm'],
    ]),
    rcGroup('WAREHOUSE', [
      [1,'WH-01 List Picking List (PL)','Dalam laporan ini anda dapat melihat List Picking List berdasarkan status','PrintListPickingList'],
      [2,'WH-02 List Invoice (IV)','Dalam laporan ini anda dapat melihat List Invoice berdasarkan status','PrintListInvoice'],
      [3,'WH-03 List SO Belum Terkirim','Dalam laporan ini anda dapat melihat sales order yang belum terkirim','PrintPendingPartialSalesOrder'],
    ]),
    rcGroup('PENJUALAN', [
      [1,'Laporan Penjualan Per Customer dengan Rincian Faktur','Dalam laporan ini anda dapat melihat penjualan secara rinci','PrintSalesReceivablePerFaktur'],
      [2,'Laporan Penjualan Per Produk','Dalam laporan ini anda dapat melihat penjualan per produk','PrintSalesByProduct'],
      [3,'Laporan Penjualan Per Rekap Produk','Dalam laporan ini anda dapat melihat penjualan per rekap produk','PrintSalesByRecapProduct'],
      [4,'Laporan Penjualan Per Wilayah','Dalam laporan ini anda dapat melihat penjualan barang per wilayah','PrintSalesByArea'],
      [5,'Laporan Penjualan Item Tertentu','Dalam laporan ini anda dapat melihat penjualan item tertentu','PrintBestSeller'],
      [6,'Laporan Penjualan Item Tertentu Per Kategori','Dalam laporan ini anda dapat melihat penjualan item tertentu per kategori','PrintItemTertentuPerKategori'],
      [7,'Laporan Penjualan Per Kategori','Dalam laporan ini anda dapat melihat penjualan barang per kategori','PrintSalesItemPerKategori'],
      [8,'Laporan Penjualan Per Langganan - Kategori','Dalam laporan ini anda dapat melihat penjualan barang per pelanggan - Kategori','PrintSalesItemPerLanggananKategori'],
      [9,'Laporan Analisa Penjualan Per Produk','Dalam laporan ini anda dapat melihat laporan penjualan barang per produk','PrintAnalisaSalesByProduct'],
      [10,'Laporan Analisa Penjualan Per Group Produk','Dalam laporan ini anda dapat melihat laporan penjualan barang per group produk','PrintAnalisaSalesByProduct'],
      [11,'Laporan Analisa Penjualan Per Kategori','Dalam laporan ini anda dapat melihat rekap penjualan barang per kategori','PrintAnalisaRecapKategori'],
      [12,'Laporan Rekap Penjualan Per Langganan','Dalam laporan ini anda dapat melihat penjualan barang per pelanggan','PrintTransactionSalesPerCustomer'],
      [13,'Laporan Penjualan Pertanggal','Dalam laporan ini anda dapat melihat penjualan pertanggal','PrintTransactionSalesPerInvoice'],
      [14,'Laporan Penjualan Per Nomor Faktur','Dalam laporan ini anda dapat melihat penjualan per nomor faktur','PrintTransactionSalesPerDateDepartemenPerProductPerCustomer'],
      [15,'Laporan Penjualan Per Tanggal, Per Departemen, Per Produk, Per Customer','Dalam laporan ini anda dapat melihat Penjualan Per Tanggal, Per Departemen, Per Produk, dan Per Customer','PrintTransactionSalesInvoicePerMonthPerDepartementPerProductPerCustomer'],
      [16,'Laporan SI Per Bulan, Per Departemen, Per Produk, Per Customer','Dalam laporan ini anda dapat melihat jumlah subtotal, diskon, DPP, PPN mengenai unggul, dan grand total berdasarkan penjualan per Customer','PrintRecapSalesByCustomer'],
      [17,'Laporan Rekap Penjualan Per Customer','Dalam laporan ini anda dapat melihat penjualan buku penjualan','PrintBukuPenjualan'],
      [18,'Laporan Laba / Rugi Per Customer','Dalam laporan ini anda dapat melihat laba/rugi penjualan barang per Customer','ProfitLossPerCustomer'],
      [19,'Laporan Penjualan Rangkuman','Dalam laporan ini anda dapat melihat rangkuman keuntungan penjualan','PrintPenjualanRangkuman'],
      [20,'Laporan Analisa Penjualan Per Customer per Brand','Dalam laporan ini anda dapat melihat laporan analisa penjualan per customer per brand','PrintAnalisaPenjualanPerCustPerBrand'],
      [21,'Laporan Buku Penjualan','Dalam laporan ini anda dapat melihat laporan buku penjualan','PrintBukuPenjualan'],
      [22,'Laporan Sales Journal','Dalam laporan ini anda dapat melihat sales journal','PrintSalesJournal'],
      [23,'Laporan Penjualan Per Wilayah Per Sales','Dalam laporan ini anda dapat melihat penjualan barang per wilayah dan Per Sales','PrintSalesByAreaBySales'],
      [24,'Laporan Ringkasan UZZT','Dalam laporan ini anda dapat melihat laporan ringkasan UZZT','PrintUzztSummary'],
      [25,'Laporan Outstanding UZZT','Dalam laporan ini anda dapat melihat laporan Outstanding UZZT','PrintOutstandingList'],
      [26,'Laporan Ringkasan Faktur Yang Belum Ditagih','Dalam laporan ini anda dapat melihat laporan Faktur Yang Belum Ditagih','PrintOutstandingDebitCollectionList'],
      [27,'Laporan Ringkasan Pajak Standard List','Dalam laporan ini anda dapat melihat laporan Ringkasan Pajak Standard List','PrintListTaxSummary'],
      [28,'Laporan Pembayaran Baru UZZT','Dalam laporan ini anda dapat melihat laporan Pembayaran Baru UZZT','PrintNewPaymentUzzt'],
      [29,'Laporan Daftar Barang Indent','Dalam laporan ini anda dapat melihat laporan Daftar Barang Indent','PrintIndentItem'],
      [30,'Laporan Penjualan Secara Rinci','Dalam laporan ini anda dapat melihat penjualan secara rinci','PrintSalesReportDetail'],
      [31,'Laporan List Klaim Bulanan Biaya Support Principal','Dalam laporan ini anda dapat melihat List Klaim Bulanan Biaya Support Principal','PrintMonthlyClaimSupportPrincipalFee'],
      [32,'Laporan Penjualan Per Item Dan Per Batch Number','Dalam laporan ini anda dapat melihat Penjualan Per Item Dan Per Batch Number','PrintPenjualanPerItemDanPerBatchNumber'],
      [33,'Laporan E-WAS Keluar','Dalam laporan ini anda dapat melihat laporan E-WAS Keluar','PrintEwasKeluar'],
      [34,'Laporan E-WAS Masuk','Dalam laporan ini anda dapat melihat laporan E-WAS Masuk','PrintEwasMasuk'],
      [35,'Laporan Support Discount (Off Faktur)','Dalam laporan ini anda dapat melihat laporan Support Discount Off Faktur','PrintSupportDiscount'],
      [36,'Laporan Klaim Discount ke Principle','Dalam laporan ini anda dapat melihat laporan klaim diskon ke principle','PrintClaimPrincipleDiscount'],
    ]),
    rcGroup('SALES ORDER', [
      [1,'Laporan Sales Order Per Tanggal','Dalam laporan ini anda dapat melihat order penjualan pertanggal','ListSoByDate'],
      [2,'Laporan Loss / Deal Penjualan','Dalam laporan ini anda dapat melihat sales order yang diajadikan sales order','LossAndDealSales'],
      [3,'Laporan Sales Order Dengan Bonus','Dalam laporan ini anda dapat melihat sales order dengan rincian bonus','PrintPendingPartialSalesOrder'],
      [4,'Laporan Sales Order Baru','Dalam laporan ini anda dapat melihat sales order baru','NewSalesOrder'],
      [5,'Cetak SO per Wilayah per Salesman yang belum Dibuat Faktur','Cetak Daftar SO per Wilayah per Salesman yang Dibuat Faktur','SalesOrderBasedOnAreaAndSalesmanNotInvoiceYet'],
    ]),
    rcGroup('PENGIRIMAN BARANG', [
      [1,'Laporan Surat Jalan Per Tanggal','Dalam laporan ini anda dapat melihat surat jalan pertanggal','PrintDeliveryPermitByDate'],
      [2,'Laporan Retur Surat Jalan Per Tanggal','Dalam laporan ini anda dapat melihat retur surat jalan pertanggal','PrintDeliveryPermitRefundByDate'],
      [3,'Laporan Back Order dari Sales Order-Surat Jalan Per Tanggal','Dalam laporan ini anda dapat melihat sales order-surat jalan yang sudah dibuatkan faktur dan yang belum','SalesPerDayByDeliveryPermit'],
      [4,'Laporan Surat Jalan Yang Telah Dibuatkan Faktur Penjualan','Dalam laporan ini anda dapat melihat surat jalan yang sudah dibuatkan faktur penjualan untuk sales jalan itu beserta rincian barangnya.','PrintDeliveryPermitWithPrice'],
      [5,'Laporan Surat Jalan Yang Belum Dibuatkan Faktur Penjualan','Dalam laporan ini anda dapat melihat surat jalan yang belum dibuatkan Faktur Penjualan','PrintDeliveryPermitWithNoSalesInvoice'],
    ]),
    rcGroup('SALES PERFORMANCE', [
      [1,'Performance / Sales','Dalam laporan ini anda dapat melihat performance sales','PerformanceSales'],
    ]),
    rcGroup('SALES BY VENDOR', [
      [1,'Laporan Penjualan(Vpp) Per Supplier','Dalam laporan ini anda dapat melihat laporan penjualan dari supplier'],
      [2,'Laporan Penjualan(Detail) Per Supplier','Dalam laporan ini anda dapat melihat laporan penjualan dari supplier lebih detail'],
    ]),
    rcGroup('KOMISI SALESMAN', [
      [1,'Laporan Komisi Salesman Per Item','Laporan komisi salesman menghitung persentase/nominal per item','ListCommissionPerItem'],
      [2,'Hitungan Komisi Salesman Per Faktur','Hitungan komisi mengambil persentase dari total penjualan oleh salesman itu dibatasi periode yang ditentukan (per bulan atau per 3 bulan continuous). Komisi keluar hanya setelah faktur dilunasi.'],
    ]),
    rcGroup('SALESMAN', [
      [1,'Laporan Penjualan Per Salesman','Dalam laporan ini anda dapat melihat penjualan per salesman','PrintSalesBySalesman'],
      [2,'Laporan Penjualan Item Per Salesman','Dalam laporan ini anda dapat melihat penjualan barang per salesman','PrintItemPerSales'],
      [3,'Laporan Analisa Penjualan Per Sales Nomor','Dalam laporan ini anda dapat melihat analisa penjualan per salesman','PrintAnalysisSalesBySalesman'],
      [4,'Laporan Analisa Penjualan Per Sales dengan target','Dalam laporan ini anda dapat melihat analisa penjualan per salesman dengan target','PrintAnalysisSalesBySalesmanWithTarget'],
      [5,'Laporan Penjualan Dengan Credit Note By Salesman (Excel)','Dalam laporan ini anda dapat melihat penjualan dengan nota debit berdasarkan salesman','PrintSalesInvoiceCreditNoteBySalesman'],
      [6,'Laporan Penjualan Dengan Credit Note By Customer (Excel)','Dalam laporan ini anda dapat melihat penjualan dengan nota debit berdasarkan Customer','PrintSalesInvoiceCreditNoteByCustomer'],
      [7,'Laporan Penjualan Dengan Credit Note By Salesman (Besar)','Dalam laporan ini anda dapat melihat penjualan dengan nota debit berdasarkan salesman','PrintSalesInvoiceCreditNoteBySalesman'],
      [8,'Laporan Penjualan Dengan Credit Note By Customer (Besar)','Dalam laporan ini anda dapat melihat penjualan dengan nota debit berdasarkan Customer','PrintSalesInvoiceCreditNoteByCustomer'],
      [9,'Laporan Penjualan Per Salesman per Kategory','Dalam laporan ini anda dapat melihat penjualan per salesman per Kategori','PrintSalesBySalesmanByCategory'],
      [10,'Laporan Sales Total Per Area Per Salesman Dengan Target','Dalam laporan ini anda dapat melihat total penjualan per area per salesman dengan target','PrintSalesBySalesmanByAreaWithInvoice'],
    ]),
    rcGroup('REWARD', [
      [1,'Laporan Perolehan Reward Customer','Dalam laporan ini anda dapat melihat paket, poin, dan kekurangan progress reward','PrintPromoCust'],
    ]),
    rcGroup('CUSTOMER', [
      [1,'Laporan Barcode Customer','Dalam laporan ini anda dapat mencetak Barcode Customer','CustomerBarcode'],
      [2,'Laporan Persiapan Legalitas Customer','Dalam laporan ini anda dapat mencetak Persiapan Legalitas Customer','CustomerPersiapanLegalitas'],
    ]),
    rcGroup('MEMBER', [
      [1,'Laporan Poin Member','Dalam laporan ini anda dapat mencetak riwayat poin member'],
    ]),
    rcGroup('KONSINYASI', [
      [1,'Laporan Pengembalian Transaksi Konsinyasi','Dalam laporan ini anda dapat mencetak Transaksi Pengembalian Konsinyasi'],
    ]),
    rcGroup('BONUS', [
      [1,'Laporan Daftar Transaksi Barang Bonus','Dalam laporan ini anda dapat mencetak Penjualan Transaksi Barang Bonus','PrintTransactionInventoryBonus'],
    ]),
  ]},
  cetakanTransaksi:{ title:'Cetakan Faktur', groups:[
    rcGroup('PENJUALAN', [
      [1,'Cetak Sales Quotation I Halaman','Cetakan Untuk Sales Quotation I Halaman','SalesQuotationFullPage'],
      [2,'Cetak Sales Quotation (2) Halaman','Cetakan Untuk Sales Quotation (2) Halaman','SalesQuotationHalfPage'],
      [3,'Cetak Sales Order I Halaman','Cetakan Untuk Sales Order I Halaman','SalesOrderFullPage'],
      [4,'Cetak Sales Order (2) Halaman','Cetakan Untuk Sales Order (2) Halaman','SalesOrderHalfPage'],
      [5,'Cetak Surat Jalan I Halaman','Cetakan Untuk Surat Jalan I Halaman','DeliveryPermitFullPage'],
      [6,'Cetak Surat Jalan (2) Halaman','Cetakan Untuk Surat Jalan (2) Halaman','DeliveryPermitHalfPage'],
      [7,'Cetak Faktur Jual I Halaman','Cetakan Untuk Faktur Jual I Halaman','SalesInvoiceTransactionFullPage'],
      [8,'Cetak Faktur Jual I Halaman (Cetakan Faktur Penagihan)','Cetakan Untuk Faktur Jual I Halaman Dalam Bentuk Cetakan Faktur Penagihan','SalesInvoiceTransactionFullPageForPenagihan'],
      [9,'Cetak Faktur Jual (2) Halaman','Cetakan Untuk Faktur Jual (2) Halaman','SalesInvoiceTransactionHalfPage'],
      [10,'Cetak Continue Faktur I Halaman','Cetakan Untuk Continue Faktur I Halaman'],
      [11,'Cetak Surat Jalan Di Halaman Longsum','Cetakan Untuk Surat Jalan Di Halaman Longsum'],
      [12,'Cetak Surat Jalan Di Halaman Dengan Batch Number','Cetakan Untuk Surat Jalan Di Halaman Dengan Batch Number'],
      [13,'Cetak Rekap Surat Jalan I Halaman','Cetakan Rekap Surat Jalan I Halaman'],
      [14,'Cetak Invoice Blank Form I Halaman','Cetakan Untuk Sales Invoice Blank Form I Halaman'],
      [15,'Cetak Invoice Blank Form (2) Halaman','Cetakan Untuk Sales Invoice Blank Form (2) Halaman'],
      [16,'Cetak Delivery Order Menggunakan Batch Number I Halaman','Cetakan Delivery Order Menggunakan Batch Number I Halaman'],
      [17,'Cetak Faktur Jual/Retur BAPBM','Cetakan Untuk Faktur Jual/Retur BAPBM'],
      [18,'Cetak Faktur Penagihan Piutang','Cetakan Untuk Faktur Penagihan Piutang'],
      [19,'Proforma Invoice (Sales Order)','Digunakan hanya untuk cetak Proforma Invoice (Sales Order)','SalesOrderPerformaInvoice'],
      [20,'Proforma Invoice (Delivery Order)','Digunakan hanya untuk cetak Proforma Invoice (Delivery Order)','DeliveryOrderPerformaInvoice'],
      [21,'Proforma Invoice 2 Half Page (Delivery Order)','Digunakan hanya untuk cetak Proforma Invoice 2 Half Page (Delivery Order)','DeliveryOrderPerformaInvoice2Half'],
      [22,'Proforma Invoice 2 Full Page (Delivery Order)','Digunakan hanya untuk cetak Proforma Invoice 2 Full Page (Delivery Order)','DeliveryOrderPerformaInvoice2Full'],
      [23,'Serah Terima Gudang','Digunakan untuk serah terima gudang'],
      [24,'Cetak Daftar Picking List','Cetakan Untuk Picking List'],
      [25,'Cetak Daftar Packing','Cetakan Untuk Daftar Packing'],
      [26,'Cetak Daftar Picking Pengaturan Kustomer','Cetakan Untuk Daftar Picking Pengaturan Kustomer'],
      [27,'Cetak Daftar Voucher','Cetakan Untuk Daftar Voucher'],
      [28,'Picking List Manual I Halaman','Cetakan Untuk Picking List Manual I Halaman'],
      [29,'Monitoring Control Delivery List','Cetakan Untuk Monitoring Control Delivery List'],
      [30,'Cetak Delivery Order Konsinyasi (2) Halaman','Cetakan Untuk Delivery Order Konsinyasi (2) Halaman'],
    ]),
    rcGroup('PEMBELIAN', [
      [1,'Purchase Request I Halaman','Cetakan Untuk Purchase Request I Halaman (cocok untuk printer dot matrix)'],
      [2,'Purchase Request (2) Halaman','Cetakan Untuk Purchase Request (2) Halaman (cocok untuk printer dot matrix)'],
      [3,'Purchase Order I Halaman','Cetakan Untuk Purchase Order I Halaman (cocok untuk printer dot matrix)'],
      [4,'Purchase Order (2) Halaman','Cetakan Untuk Purchase Order (2) Halaman (cocok untuk printer dot matrix)'],
      [5,'Bukti Penerimaan Barang I Halaman','Cetakan Untuk Bukti Penerimaan Barang I Halaman (cocok untuk printer dot matrix)'],
      [6,'Bukti Penerimaan Barang (2) Halaman','Cetakan Untuk Bukti Penerimaan Barang (2) Halaman (cocok untuk printer dot matrix)'],
      [7,'Faktur/Retur Pembelian I Halaman','Cetakan Untuk Faktur/Retur Pembelian I Halaman (cocok untuk printer dot matrix)'],
      [8,'Retur Pembelian (2) Halaman','Cetakan Untuk Retur Pembelian (2) Halaman (cocok untuk printer dot matrix)'],
      [9,'Bukti Penerimaan Barang Menggunakan Batch Number I Halaman','Cetakan Untuk Bukti Penerimaan Barang Menggunakan Batch Number I Halaman'],
      [10,'Faktur/Retur Pembelian Menggunakan Batch Number I Halaman','Cetakan Untuk Faktur/Retur Pembelian Menggunakan Batch Number I Halaman'],
      [11,'Draft Receipt I Halaman','Cetakan Untuk Draft Receipt I Halaman'],
      [12,'Draft Receipt (2) Halaman','Cetakan Untuk Draft Receipt (2) Halaman'],
      [13,'Draft Retur PB I Halaman','Cetakan Untuk Draft Retur Penerimaan Barang I Halaman'],
      [14,'Draft Retur PB (2) Halaman','Cetakan Untuk Draft Retur Penerimaan Barang (2) Halaman'],
      [15,'Purchase Quotation (2) Halaman','Cetakan Untuk Purchase Quotation (2) Halaman'],
      [16,'Perbandingan Purchase Quotation (2) Halaman','Cetakan Untuk Perbandingan Purchase Quotation (2) Halaman'],
      [17,'Cetak Proforma Dir (2) Halaman','Cetakan Proforma Dir (2) Halaman'],
      [18,'Cetak Proforma Dir (1) Halaman','Cetakan Proforma Dir (1) Halaman'],
      [19,'Cetak Delivery Request (2) Halaman','Cetakan Delivery Request (2) Halaman'],
      [20,'Cetak Delivery Request I Halaman','Cetakan Delivery Request I Halaman'],
      [21,'Cetak Faktur Draft Receipt In (2) Halaman','Cetakan Faktur Draft Receipt In (2) Halaman'],
      [22,'Cetak Faktur Draft Receipt In I Halaman','Cetakan Faktur Draft Receipt In I Halaman'],
      [23,'Cetak Terima Barang In (2) Halaman','Cetakan Terima Barang In (2) Halaman'],
      [24,'Cetak Terima Barang In I Halaman','Cetakan Terima Barang In I Halaman'],
      [25,'Cetak Purchase Order Konsinyasi I Halaman','Cetakan Purchase Order Konsinyasi I Halaman'],
      [26,'Cetak Faktur Pembelian Konsinyasi I Halaman','Cetakan Faktur Pembelian Konsinyasi I Halaman'],
      [27,'Cetak Faktur Pembelian Konsinyasi (2) Halaman','Cetakan Faktur Pembelian Konsinyasi (2) Halaman'],
      [28,'Cetak Surat Pesanan Obat Tertentu','Cetakan Surat Pesanan Obat Tertentu'],
      [29,'Cetak Purchase Order Konsinyasi Group By Kode I (Vertikal)','Cetakan Purchase Order Konsinyasi Group By Kode I (Vertikal)'],
      [30,'Cetak Purchase Order Konsinyasi Group By Kode II (Horizontal)','Cetakan Purchase Order Konsinyasi Group By Kode II (Horizontal)'],
      [31,'Cetak Terima Barang Konsinyasi I Halaman','Cetakan Terima Barang Konsinyasi I Halaman'],
    ]),
    rcGroup('CASH & BANK', [
      [1,'Cetak Bukti Pelunasan Piutang (AR) I Halaman','Report ini menampilkan bukti masuk kas maupun bank penerimaan piutang(AR) dalam bentuk I Halaman','CashReceiveFullPage'],
      [2,'Cetak Bukti Pelunasan Piutang (AR) (2) Halaman','Report ini menampilkan bukti masuk kas maupun bank penerimaan piutang(AR) dalam bentuk (2) Halaman','CashReceiveHalfPage'],
      [3,'Cetak Bukti Pelunasan Hutang (AP) I Halaman','Report ini menampilkan bukti keluar kas maupun bank pembayaran hutang(AP) dalam bentuk I Halaman','ApCashOutFullPage'],
      [4,'Cetak Bukti Pelunasan Hutang (AP) (2) Halaman','Report ini menampilkan bukti keluar kas maupun bank pembayaran hutang(AP) dalam bentuk (2) Halaman','ApCashOutHalfPage'],
      [5,'Cetak Bukti Kas Masuk (Lain-Lain) I Halaman','Report ini menampilkan bukti kas masuk lain-lain dalam bentuk I Halaman','AllCashReceiveFullPage'],
      [6,'Cetak Bukti Kas Keluar (Lain-Lain) I Halaman','Report ini menampilkan bukti kas keluar lain-lain dalam bentuk I Halaman','AllCashOutFullPage'],
      [7,'Cetak Bukti Kas Bon Karyawan I Halaman','Report ini menampilkan bukti kas bon karyawan dalam bentuk I Halaman','EmployeeKasbonPrint'],
      [8,'Cetak Bukti Giro Cair I Halaman','Cetakan bukti giro cair'],
      [9,'Rekonsiliasi','Digunakan hanya untuk cetakan Rekonsiliasi Full Page'],
    ]),
    rcGroup('INVENTORY', [
      [1,'Cetak Bukti Transaksi Inventory Full Page','Report ini menampilkan semua transaksi inventory di Report Ini Anda juga dapat mencetak transaksi Inventory secara detail','PrintBuktiTransaksiInventoryFullPage'],
      [2,'Cetak Informasi Inventory Field','Report ini menampilkan informasi field pada Report Ini Anda juga dapat mencetak informasi field'],
      [3,'Cetak Klaim Bonus Item I Halaman','Cetakan Untuk Klaim Bonus Item I Halaman'],
      [4,'Cetak Terima Klaim Bonus Item I Halaman','Cetakan Untuk Terima Klaim Bonus Item I Halaman'],
      [5,'Bereording Sheet I2 Halaman','Cetakan Untuk Reordering Sheet I2 Halaman'],
      [6,'Cetak Transaksi Stock Request Full Page','Cetakan Untuk Transaksi Stock Request'],
      [7,'Cetak Master Stock Opname','Cetakan Untuk Master Stock Opname'],
      [8,'Cetak Transaksi Stock Opname','Cetakan Untuk Transaksi Stock Opname'],
      [9,'Cetak Transaksi Transfer Out (Konsinyasi)','Cetakan Untuk Transaksi Transfer Out (Konsinyasi)'],
      [10,'Cetak Transaksi Transfer In (Konsinyasi)','Cetakan Untuk Transaksi Transfer In (Konsinyasi)'],
    ]),
    rcGroup('PELUNASAN', [
      [1,'Cetak Pelunasan Piutang (2) Halaman','Pelunasan Piutang (2) Halaman'],
      [2,'Cetak Pelunasan Hutang (2) Halaman','Pelunasan Hutang (2) Halaman'],
      [3,'Cetak Pelunasan Piutang I Halaman','Pelunasan Piutang I Halaman'],
      [4,'Cetak Pelunasan Hutang I Halaman','Pelunasan Hutang I Halaman'],
    ]),
    rcGroup('GENERAL LEDGER', [
      [1,'Cetak Bukti St. Account','PrintAccountTransaction'],
    ]),
    rcGroup('TANDA TERIMA DAN PAYMENT REQUEST', [
      [1,'Cetak Tanda Terima I Halaman','Cetak Tanda Terima I Halaman'],
      [2,'Cetak Tanda Terima (2) Halaman','Cetak Tanda Terima (2) Halaman'],
      [3,'Laporan Payment Request I Halaman','Payment Request I Halaman'],
      [4,'Laporan Payment Request (2) Halaman','Payment Request (2) Halaman'],
    ]),
    rcGroup('PROJECT', [
      [1,'Laporan Project Billing Transaction I Halaman','Cetak Project Billing Transaction I Halaman'],
      [2,'Laporan Project Billing Transaction (2) Halaman','Cetak Project Billing Transaction (2) Halaman'],
      [3,'Laporan Project Billing Transaction Custom','Cetak Project Billing Transaction Custom'],
    ]),
    rcGroup('KWITANSI', [
      [1,'Kwitansi','Kwitansi'],
    ]),
    rcGroup('UANG MUKA', [
      [1,'Uang Muka Supplier','Cetak uang muka supplier'],
      [2,'Uang Muka Customer','Cetak uang muka customer'],
      [3,'Invoice Uang Muka Customer','Cetak invoice uang muka customer'],
    ]),
    rcGroup('KASBON', [
      [1,'Kasbon Karyawan','Cetak Bukti Kasbon Karyawan'],
      [2,'Pengembalian Kasbon Karyawan','Cetak Bukti Pengembalian Kasbon Karyawan'],
    ]),
    rcGroup('APPROVAL', [
      [1,'Cetakan Daftar Approval','Kwitansi'],
    ]),
    rcGroup('INVOICE UANG MUKA TIPE 2', [
      [1,'Invoice Uang Muka Customer','Digunakan hanya untuk cetakan Invoice Uang Muka Customer Full Page'],
      [2,'Invoice Uang Muka Customer','Digunakan hanya untuk cetakan Invoice Uang Muka Customer Half Page'],
      [3,'Invoice Uang Muka Supplier','Digunakan hanya untuk cetakan Invoice Uang Muka Supplier Full Page'],
      [4,'Invoice Uang Muka Supplier','Digunakan hanya untuk cetakan Invoice Uang Muka Supplier Half Page'],
    ]),
    rcGroup('FIXED ASSET', [
      [1,'Pemilikan Fixed Asset','Digunakan hanya untuk cetakan Pemilikan Fixed Asset'],
      [2,'Penghapusan Fixed Asset','Digunakan hanya untuk cetakan Penghapusan Fixed Asset'],
    ]),
    rcGroup('BIAYA IMPORT', [
      [1,'Biaya Import V.2','Digunakan hanya untuk cetakan Biaya Import V.2','FreightCostPrint'],
    ]),
    rcGroup('PRODUKSI', [
      [1,'Cetak Work Order I Halaman','Cetakan Work Order I Halaman'],
      [2,'Cetak Raw Material I Halaman','Cetakan Raw Material I Halaman'],
      [3,'Cetak Finished Good I Halaman','Cetakan Finished Good I Halaman'],
    ]),
  ]},
};

const DATA = {
  kpi:[
    {label:'Overdue Invoice', value:'4', color:'kpi-red', ic:'alertTriangle'},
    {label:'Surat Jalan Belum Invoice', value:'62', color:'kpi-teal', ic:'file'},
    {label:'Rata-rata Diskon', value:'9,85 %', color:'kpi-yellow', ic:'percent'},
    {label:'Deal Rate', value:'58 %', color:'kpi-green', ic:'target'},
  ],
  agingAR:{labels:['<=30 days','<=60 days','<=90 days','<=120 days','>=121 days'], data:[15200,8700,5100,3200,11400]},
  invVsPaid:{labels:['Jun 26','Jul 26','Agu 26'], invoice:[980,1420,260], paid:[610,150,25]},
  invStatus:{labels:['Paid Invoice','Open Invoice','Overdue Invoice'], data:[2,14,3], colors:['#ef9aa8','#dfe2ea','#4472c4']},
  revenueBranch:{labels:['Head Office (Jakarta)','Surabaya','Bandung','Medan','Makassar'], data:[2150000000,320000000,210000000,150000000,95000000], colors:['#4472c4','#a8c4e8','#f0b429','#e8845e','#27ae60']},
  supplierKpi:[
    {label:'Overdue Account Payables', value:'Rp 214.850.000', color:'kpi-red', ic:'alertTriangle'},
    {label:'Orders with indent items', value:'7', color:'kpi-red', ic:'alertTriangle'},
  ],
  inventoryKpi:[
    {label:'Low Stock Inventory', value:'2', color:'kpi-red', ic:'alertTriangle'},
    {label:'Slow Moving Inventory', value:'3', color:'kpi-red', ic:'alertTriangle'},
  ],
  purchaseCycle:{stages:['purchase order','penerimaan barang','faktur pembelian','pelunasan'], gaps:['2 d','1 d','5 d']},
  apBySupplier:[
    {nama:'PT Sumber Pangan Nusantara', saldo:0},
    {nama:'PT Wilmar Nabati Indonesia', saldo:18500000},
    {nama:'PT Sinar Meadow', saldo:0},
    {nama:'CV Distribusi Sentosa', saldo:4250000},
    {nama:'PT Mayora Distribusi', saldo:0},
    {nama:'PT Indofood Distribusi', saldo:0},
    {nama:'UD Sumber Makmur', saldo:0},
    {nama:'CV Karya Abadi', saldo:0},
    {nama:'PT Sasa Inti', saldo:450180},
    {nama:'Toko Bahan Baku Jaya', saldo:1200000},
    {nama:'CV Anugerah Logistik', saldo:0},
    {nama:'PT Roda Mas Trading', saldo:0},
  ],
  apByTransaction:[
    {no:'26/PU/HO/03/00020', nama:'PT Wilmar Nabati Indonesia', tempo:'15/08/2026', jumlah:18500000, persen:0},
    {no:'26/PU/HO/03/00021', nama:'CV Distribusi Sentosa', tempo:'20/08/2026', jumlah:4250000, persen:0},
    {no:'26/PU/HO/01/00112', nama:'Toko Bahan Baku Jaya', tempo:'30/07/2026', jumlah:1200000, persen:50},
    {no:'25/PU/TGR/06/00009', nama:'PT Sinar Meadow', tempo:'09/06/2026', jumlah:1160000, persen:0},
    {no:'25/PU/SMG/09/00007', nama:'PT Sasa Inti', tempo:'22/09/2026', jumlah:450180, persen:0},
    {no:'26/GC/HO/12/00001', nama:'PT Sumber Pangan Nusantara', tempo:'27/02/2026', jumlah:-1335176.82, persen:-100},
    {no:'26/PU/HO/05/00012', nama:'CV Anugerah Logistik', tempo:'01/04/2026', jumlah:0, persen:0},
    {no:'26/PU/HO/03/00059', nama:'PT Roda Mas Trading', tempo:'30/10/2026', jumlah:814980, persen:0},
  ],
  discSalesman:[
    {nama:'BUDI SANTOSO', penjualan:61250000, disc:11.4, diskon:6982500, net:54267500},
    {nama:'ANDI WIJAYA', penjualan:38940000, disc:9.7, diskon:3777500, net:35162500},
    {nama:'CITRA LESTARI', penjualan:27110000, disc:14.2, diskon:3849000, net:23261000},
    {nama:'DEDI KURNIAWAN', penjualan:19875000, disc:8.5, diskon:1689000, net:18186000},
    {nama:'EKA PUTRI', penjualan:15420000, disc:12.1, diskon:1866000, net:13554000},
    {nama:'FAJAR NUGROHO', penjualan:9870000, disc:10.0, diskon:987000, net:8883000},
    {nama:'GITA PERMATA', penjualan:6120000, disc:7.6, diskon:465000, net:5655000},
    {nama:'HENDRA SAPUTRA', penjualan:3210000, disc:6.4, diskon:205000, net:3005000},
    {nama:'Tidak Ada Salesman', penjualan:0, disc:0, diskon:0, net:0},
  ],
  bestSeller:[
    {nama:'Minyak Goreng Sunco 2L', qty:5820, total:145500000},
    {nama:'Gula Pasir Gulaku 1kg', qty:5210, total:78150000},
    {nama:'Beras Premium Rojolele 5kg', qty:2130, total:127800000},
    {nama:'Tepung Terigu Segitiga Biru 1kg', qty:1980, total:23760000},
    {nama:'Mie Instan Indomie Goreng', qty:18400, total:46000000},
    {nama:'Kecap Manis ABC 600ml', qty:1420, total:19880000},
    {nama:'Susu Kental Manis Indomilk 380gr', qty:1105, total:17680000},
    {nama:'Teh Celup Sariwangi 25s', qty:980, total:9800000},
    {nama:'Kopi Kapal Api 165gr', qty:860, total:12040000},
    {nama:'Sabun Mandi Lifebuoy 90gr', qty:2340, total:11700000},
    {nama:'Sarden ABC 425gr', qty:640, total:9600000},
  ],
  /* NB (ditambahkan untuk modul Sales Order, lihat js/pages/sales-order.*):
     field `alamat` (alamat pengiriman customer, dipakai auto-fill field
     Alamat di form Sales Order) & `piutang` (saldo piutang outstanding
     customer saat ini, dipakai hitung field "Sisa CL" = limit − piutang)
     ditambahkan ke tiap baris di bawah.

     NB LAGI (2026-08-18, modul Master Customer — js/pages/master-customer.*,
     page 'customers'): field kode/nama/kota/salesman/limit/status/alamat/
     piutang di atas TIDAK DIUBAH SAMA SEKALI (dipertahankan persis, termasuk
     format kode 'CUST-00X' lama) karena sudah dipakai luas & di-hardcode
     sebagai string literal oleh banyak modul transaksi lain sejak 2026-08-11
     (Sales Order/Sales Quotation/Invoice/Picking List/Faktur Penjualan Via
     S.J.) — mengubahnya akan memutus rantai referensi itu. Field BARU untuk
     form "Customer" yang jauh lebih lengkap (sesuai 4 screenshot MASERP yang
     dikirim user) HANYA ditambahkan ke tiap baris: noRef/tglRegistrasi/
     mataUang/kodeFarma-Alkes, customerIndukKode/Nama/Alamat, data kontak
     (namaPemilik/kontakPerson/gender/email/tglLahir/fax/agama/jabatan/
     telepon), tipeIdentitas/noIdentitas/profesi/cabang/gudangJualSFA/
     kodeNegara/idTKU/consignment, alamat detail (area/rayonKode/rayonNama/
     rayonDistrict/provinsi/kabupaten/kecamatan/kelurahan/kodePos/latitude/
     longitude), groupCustomer/badanUsaha/statusARCustomer (BEDA dari
     `status` Aktif/Non-Aktif — ini status kelancaran AR: Lancar/Macet),
     data pajak (npwp/namaNpwp/alamatPajak/pkpStatus/kodeTransaksiPajak/
     typePpn), bank (masterBank/noVA/noRek), kredit (top/dominasiLimit/
     wajibDominasi — `limit` yang sudah ada dipakai langsung sebagai CL),
     akun GL (glAkunPiutang/glAkunUangMuka), uangMuka (baru, terpisah dari
     `piutang` yang sudah ada), serta 2 sub-grid Legalitas TETAP/fixed
     (legalitasOutlet 4 baris, legalitasPemilik 2 baris, masing-masing
     {syarat,keterangan,tglExpired,tglProses,uploaded}). Kode Customer
     format "C000001" pada screenshot HANYA dipakai untuk auto-generate
     customer BARU lewat mockup ini (lihat cstNextKode() di
     master-customer.js), tidak dipaksakan ke 8 baris existing di bawah. */
  customers:[
    {kode:'CUST-001', nama:'Toko Sumber Rejeki', kota:'Jakarta', salesman:'Budi Santoso', limit:50000000, status:'Aktif', alamat:'Jl. Mangga Dua Raya No. 12, Jakarta Pusat', piutang:18250000,
    noRef:'HO.0001', tglRegistrasi:'12/01/2020', mataUang:'IDR', kodeFarma:'', namaFarma:'', kodeAlkes:'', namaAlkes:'',
    customerIndukKode:'', customerIndukNama:'', customerIndukAlamat:'',
    namaPemilik:'Hj. Siti Rejeki', kontakPerson:'Hj. Siti Rejeki', gender:'Wanita', email:'sitirejeki@tokosumberrejeki.co.id', tglLahir:'14/05/1978', fax:'', agama:'Islam', jabatan:'Pemilik', telepon:'021-6541278',
    tipeIdentitas:'TIN', noIdentitas:'3171054405780002', profesi:'Wiraswasta', cabang:'Head Office', gudangJualSFA:'(00-GUU) Gudang Utama-HO', kodeNegara:'IDN', idTKU:'000000', consignment:false,
    area:'DKI001', rayonKode:'RY-JKT01', rayonNama:'Rayon Jakarta Pusat', rayonDistrict:'Jakarta Pusat', provinsi:'DKI Jakarta', kabupaten:'Jakarta Pusat', kecamatan:'Sawah Besar', kelurahan:'Mangga Dua Selatan', kodePos:'10730', latitude:-6.1352, longitude:106.8133,
    groupCustomer:'RTTR', badanUsaha:'PRO', statusARCustomer:'Lancar',
    npwp:'01.111.222.3-456.001', namaNpwp:'TOKO SUMBER REJEKI', alamatPajak:'', pkpStatus:'Non-PKP', kodeTransaksiPajak:'04', typePpn:'Eksklusif',
    masterBank:'', noVA:'', noRek:'',
    top:'N30', dominasiLimit:10000000, wajibDominasi:false,
    glAkunPiutang:'1120001', glAkunUangMuka:'', uangMuka:0,
    legalitasOutlet:[{syarat:'Nomor Izin Berusaha (NIB)', keterangan:'Sesuai dokumen terlampir', tglExpired:'31/12/2027', tglProses:'10/01/2024', uploaded:true}, {syarat:'NPWP', keterangan:'Sesuai dokumen terlampir', tglExpired:'31/12/2027', tglProses:'10/01/2024', uploaded:true}, {syarat:'SKPKP', keterangan:'', tglExpired:'', tglProses:'', uploaded:false}, {syarat:'Spesimen Cap/ Stempel Customer', keterangan:'', tglExpired:'', tglProses:'', uploaded:false}],
    legalitasPemilik:[{syarat:'KTP', keterangan:'Sesuai dokumen terlampir', tglExpired:'', tglProses:'10/01/2024', uploaded:true}, {syarat:'Nama Penanggung Jawab', keterangan:'Hj. Siti Rejeki', tglExpired:'', tglProses:'10/01/2024', uploaded:true}]},
    {kode:'CUST-002', nama:'UD Makmur Jaya', kota:'Surabaya', salesman:'Andi Wijaya', limit:35000000, status:'Aktif', alamat:'Jl. Raya Darmo No. 45, Surabaya', piutang:9120000,
    noRef:'SBY.0001', tglRegistrasi:'03/06/2019', mataUang:'IDR', kodeFarma:'', namaFarma:'', kodeAlkes:'', namaAlkes:'',
    customerIndukKode:'', customerIndukNama:'', customerIndukAlamat:'',
    namaPemilik:'Bpk. Makmur Wijaya', kontakPerson:'Bpk. Makmur Wijaya', gender:'Pria', email:'makmur@udmakmurjaya.co.id', tglLahir:'02/09/1975', fax:'', agama:'Islam', jabatan:'Pemilik', telepon:'031-7712345',
    tipeIdentitas:'TIN', noIdentitas:'3578020975750001', profesi:'Wiraswasta', cabang:'Surabaya', gudangJualSFA:'(01-GUU) Gudang Utama-SBY', kodeNegara:'IDN', idTKU:'000000', consignment:false,
    area:'JATIM001', rayonKode:'RY-SBY01', rayonNama:'Rayon Surabaya Kota', rayonDistrict:'Surabaya', provinsi:'Jawa Timur', kabupaten:'Surabaya', kecamatan:'Wonokromo', kelurahan:'Darmo', kodePos:'60241', latitude:-7.2575, longitude:112.7521,
    groupCustomer:'SBDS', badanUsaha:'UD', statusARCustomer:'Lancar',
    npwp:'01.222.333.4-567.002', namaNpwp:'UD MAKMUR JAYA', alamatPajak:'', pkpStatus:'PKP', kodeTransaksiPajak:'04', typePpn:'Eksklusif',
    masterBank:'', noVA:'', noRek:'',
    top:'N45', dominasiLimit:7000000, wajibDominasi:false,
    glAkunPiutang:'1120001', glAkunUangMuka:'2140001', uangMuka:0,
    legalitasOutlet:[{syarat:'Nomor Izin Berusaha (NIB)', keterangan:'Sesuai dokumen terlampir', tglExpired:'31/12/2027', tglProses:'10/01/2024', uploaded:true}, {syarat:'NPWP', keterangan:'Sesuai dokumen terlampir', tglExpired:'31/12/2027', tglProses:'10/01/2024', uploaded:true}, {syarat:'SKPKP', keterangan:'Sesuai dokumen terlampir', tglExpired:'31/12/2027', tglProses:'10/01/2024', uploaded:true}, {syarat:'Spesimen Cap/ Stempel Customer', keterangan:'', tglExpired:'', tglProses:'', uploaded:false}],
    legalitasPemilik:[{syarat:'KTP', keterangan:'Sesuai dokumen terlampir', tglExpired:'', tglProses:'10/01/2024', uploaded:true}, {syarat:'Nama Penanggung Jawab', keterangan:'Bpk. Makmur Wijaya', tglExpired:'', tglProses:'10/01/2024', uploaded:true}]},
    {kode:'CUST-003', nama:'CV Berkah Abadi', kota:'Bandung', salesman:'Citra Lestari', limit:20000000, status:'Aktif', alamat:'Jl. Soekarno Hatta No. 88, Bandung', piutang:4300000,
    noRef:'BDG.0001', tglRegistrasi:'18/03/2021', mataUang:'IDR', kodeFarma:'', namaFarma:'', kodeAlkes:'', namaAlkes:'',
    customerIndukKode:'', customerIndukNama:'', customerIndukAlamat:'',
    namaPemilik:'Ibu Wulan Sari', kontakPerson:'Ibu Wulan Sari', gender:'Wanita', email:'wulan@cvberkahabadi.co.id', tglLahir:'21/11/1982', fax:'', agama:'Kristen', jabatan:'Direktur', telepon:'022-6654321',
    tipeIdentitas:'TIN', noIdentitas:'3273612111820004', profesi:'Wiraswasta', cabang:'Bandung', gudangJualSFA:'(02-GUU) Gudang Utama-BDG', kodeNegara:'IDN', idTKU:'000000', consignment:false,
    area:'JABAR001', rayonKode:'RY-BDG01', rayonNama:'Rayon Bandung Kota', rayonDistrict:'Bandung', provinsi:'Jawa Barat', kabupaten:'Bandung', kecamatan:'Cibeunying Kaler', kelurahan:'Cihapit', kodePos:'40114', latitude:-6.9175, longitude:107.6191,
    groupCustomer:'SBDS', badanUsaha:'CV', statusARCustomer:'Lancar',
    npwp:'01.333.444.5-678.003', namaNpwp:'CV BERKAH ABADI', alamatPajak:'', pkpStatus:'PKP', kodeTransaksiPajak:'04', typePpn:'Eksklusif',
    masterBank:'', noVA:'', noRek:'',
    top:'N30', dominasiLimit:4000000, wajibDominasi:false,
    glAkunPiutang:'1120001', glAkunUangMuka:'', uangMuka:0,
    legalitasOutlet:[{syarat:'Nomor Izin Berusaha (NIB)', keterangan:'Sesuai dokumen terlampir', tglExpired:'31/12/2027', tglProses:'10/01/2024', uploaded:true}, {syarat:'NPWP', keterangan:'', tglExpired:'', tglProses:'', uploaded:false}, {syarat:'SKPKP', keterangan:'', tglExpired:'', tglProses:'', uploaded:false}, {syarat:'Spesimen Cap/ Stempel Customer', keterangan:'', tglExpired:'', tglProses:'', uploaded:false}],
    legalitasPemilik:[{syarat:'KTP', keterangan:'', tglExpired:'', tglProses:'', uploaded:false}, {syarat:'Nama Penanggung Jawab', keterangan:'', tglExpired:'', tglProses:'', uploaded:false}]},
    {kode:'CUST-004', nama:'Toko Anugrah', kota:'Medan', salesman:'Dedi Kurniawan', limit:15000000, status:'Aktif', alamat:'Jl. Gatot Subroto No. 21, Medan', piutang:6600000,
    noRef:'MDN.0001', tglRegistrasi:'25/07/2022', mataUang:'IDR', kodeFarma:'', namaFarma:'', kodeAlkes:'', namaAlkes:'',
    customerIndukKode:'', customerIndukNama:'', customerIndukAlamat:'',
    namaPemilik:'Bpk. Anugrah Simatupang', kontakPerson:'Bpk. Anugrah Simatupang', gender:'Pria', email:'', tglLahir:'09/02/1980', fax:'', agama:'Kristen', jabatan:'Pemilik', telepon:'061-4532290',
    tipeIdentitas:'TIN', noIdentitas:'1271090902800005', profesi:'Wiraswasta', cabang:'Medan', gudangJualSFA:'(04-GUU) Gudang Utama-MDN', kodeNegara:'IDN', idTKU:'000000', consignment:false,
    area:'SUMUT001', rayonKode:'RY-MDN01', rayonNama:'Rayon Medan Kota', rayonDistrict:'Medan', provinsi:'Sumatera Utara', kabupaten:'Medan', kecamatan:'Medan Baru', kelurahan:'Babura', kodePos:'20153', latitude:3.5952, longitude:98.6722,
    groupCustomer:'RTTR', badanUsaha:'PRO', statusARCustomer:'Lancar',
    npwp:'-', namaNpwp:'TOKO ANUGRAH', alamatPajak:'', pkpStatus:'Non-PKP', kodeTransaksiPajak:'04', typePpn:'Eksklusif',
    masterBank:'', noVA:'', noRek:'',
    top:'N14', dominasiLimit:3000000, wajibDominasi:false,
    glAkunPiutang:'1120001', glAkunUangMuka:'', uangMuka:0,
    legalitasOutlet:[{syarat:'Nomor Izin Berusaha (NIB)', keterangan:'', tglExpired:'', tglProses:'', uploaded:false}, {syarat:'NPWP', keterangan:'', tglExpired:'', tglProses:'', uploaded:false}, {syarat:'SKPKP', keterangan:'', tglExpired:'', tglProses:'', uploaded:false}, {syarat:'Spesimen Cap/ Stempel Customer', keterangan:'', tglExpired:'', tglProses:'', uploaded:false}],
    legalitasPemilik:[{syarat:'KTP', keterangan:'', tglExpired:'', tglProses:'', uploaded:false}, {syarat:'Nama Penanggung Jawab', keterangan:'', tglExpired:'', tglProses:'', uploaded:false}]},
    {kode:'CUST-005', nama:'UD Sinar Harapan', kota:'Makassar', salesman:'Eka Putri', limit:12000000, status:'Non Aktif', alamat:'Jl. Perintis Kemerdekaan No. 5, Makassar', piutang:2150000,
    noRef:'MKS.0001', tglRegistrasi:'11/11/2018', mataUang:'IDR', kodeFarma:'', namaFarma:'', kodeAlkes:'', namaAlkes:'',
    customerIndukKode:'', customerIndukNama:'', customerIndukAlamat:'',
    namaPemilik:'Bpk. Harapan Daeng', kontakPerson:'Bpk. Harapan Daeng', gender:'Pria', email:'sinarharapan@gmail.com', tglLahir:'30/12/1971', fax:'', agama:'Islam', jabatan:'Pemilik', telepon:'0411-556789',
    tipeIdentitas:'TIN', noIdentitas:'7371301271710006', profesi:'Wiraswasta', cabang:'Makassar', gudangJualSFA:'(05-GUU) Gudang Utama-MKS', kodeNegara:'IDN', idTKU:'000000', consignment:false,
    area:'SULSEL001', rayonKode:'RY-MKS01', rayonNama:'Rayon Makassar Kota', rayonDistrict:'Makassar', provinsi:'Sulawesi Selatan', kabupaten:'Makassar', kecamatan:'Panakkukang', kelurahan:'Karampuang', kodePos:'90231', latitude:-5.1477, longitude:119.4327,
    groupCustomer:'RTTR', badanUsaha:'UD', statusARCustomer:'Macet',
    npwp:'01.444.555.6-789.004', namaNpwp:'UD SINAR HARAPAN', alamatPajak:'', pkpStatus:'Non-PKP', kodeTransaksiPajak:'04', typePpn:'Eksklusif',
    masterBank:'', noVA:'', noRek:'',
    top:'CBD.', dominasiLimit:2400000, wajibDominasi:false,
    glAkunPiutang:'1120001', glAkunUangMuka:'', uangMuka:0,
    legalitasOutlet:[{syarat:'Nomor Izin Berusaha (NIB)', keterangan:'Sesuai dokumen terlampir', tglExpired:'31/12/2027', tglProses:'10/01/2024', uploaded:true}, {syarat:'NPWP', keterangan:'', tglExpired:'', tglProses:'', uploaded:false}, {syarat:'SKPKP', keterangan:'', tglExpired:'', tglProses:'', uploaded:false}, {syarat:'Spesimen Cap/ Stempel Customer', keterangan:'', tglExpired:'', tglProses:'', uploaded:false}],
    legalitasPemilik:[{syarat:'KTP', keterangan:'Sesuai dokumen terlampir', tglExpired:'', tglProses:'10/01/2024', uploaded:true}, {syarat:'Nama Penanggung Jawab', keterangan:'Bpk. Harapan Daeng', tglExpired:'', tglProses:'10/01/2024', uploaded:true}]},
    {kode:'CUST-006', nama:'Toko Family Mart Jaya', kota:'Jakarta', salesman:'Budi Santoso', limit:28000000, status:'Aktif', alamat:'Jl. Kelapa Gading Boulevard No. 9, Jakarta Utara', piutang:9870000,
    noRef:'HO.0002', tglRegistrasi:'08/09/2017', mataUang:'IDR', kodeFarma:'', namaFarma:'', kodeAlkes:'', namaAlkes:'',
    /* 2026-08-28 — customerInduk diisi (sebelumnya kosong) utk fitur
       BARU "Pelunasan Piutang Terpusat (Holding)" di Penerimaan
       Piutang: CUST-006 jadi salah satu cabang di bawah pusat
       CUST-009 PT Family Mart Indonesia (lihat komentar besar di
       baris CUST-009 di bawah). Field customerInduk* memang sudah
       ada di master customer sejak awal, baru sekarang terpakai. */
    customerIndukKode:'CUST-009', customerIndukNama:'PT Family Mart Indonesia', customerIndukAlamat:'Jl. Jend. Sudirman Kav. 52-53, Jakarta Selatan',
    namaPemilik:'Bpk. Jaya Kusuma', kontakPerson:'Bpk. Jaya Kusuma', gender:'Pria', email:'jaya.kusuma@familymartjaya.co.id', tglLahir:'05/04/1985', fax:'', agama:'Buddha', jabatan:'Direktur', telepon:'021-4587213',
    tipeIdentitas:'TIN', noIdentitas:'3172050485850007', profesi:'Wiraswasta', cabang:'Head Office', gudangJualSFA:'(00-GUU) Gudang Utama-HO', kodeNegara:'IDN', idTKU:'000000', consignment:true,
    area:'DKI001', rayonKode:'RY-JKT01', rayonNama:'Rayon Jakarta Pusat', rayonDistrict:'Jakarta Pusat', provinsi:'DKI Jakarta', kabupaten:'Jakarta Utara', kecamatan:'Kelapa Gading', kelurahan:'Kelapa Gading Barat', kodePos:'14240', latitude:-6.1352, longitude:106.8133,
    groupCustomer:'RTMD', badanUsaha:'PT', statusARCustomer:'Macet',
    npwp:'01.555.666.7-890.005', namaNpwp:'TOKO FAMILY MART JAYA', alamatPajak:'', pkpStatus:'PKP', kodeTransaksiPajak:'04', typePpn:'Eksklusif',
    masterBank:'', noVA:'', noRek:'',
    top:'N30', dominasiLimit:5600000, wajibDominasi:false,
    glAkunPiutang:'1120001', glAkunUangMuka:'2140001', uangMuka:500000,
    legalitasOutlet:[{syarat:'Nomor Izin Berusaha (NIB)', keterangan:'Sesuai dokumen terlampir', tglExpired:'31/12/2027', tglProses:'10/01/2024', uploaded:true}, {syarat:'NPWP', keterangan:'Sesuai dokumen terlampir', tglExpired:'31/12/2027', tglProses:'10/01/2024', uploaded:true}, {syarat:'SKPKP', keterangan:'Sesuai dokumen terlampir', tglExpired:'31/12/2027', tglProses:'10/01/2024', uploaded:true}, {syarat:'Spesimen Cap/ Stempel Customer', keterangan:'Sesuai dokumen terlampir', tglExpired:'31/12/2027', tglProses:'10/01/2024', uploaded:true}],
    legalitasPemilik:[{syarat:'KTP', keterangan:'Sesuai dokumen terlampir', tglExpired:'', tglProses:'10/01/2024', uploaded:true}, {syarat:'Nama Penanggung Jawab', keterangan:'Bpk. Jaya Kusuma', tglExpired:'', tglProses:'10/01/2024', uploaded:true}]},
    {kode:'CUST-007', nama:'CV Maju Terus', kota:'Semarang', salesman:'Fajar Nugroho', limit:9000000, status:'Aktif', alamat:'Jl. Pandanaran No. 33, Semarang', piutang:1200000,
    noRef:'SMG.0001', tglRegistrasi:'02/02/2020', mataUang:'IDR', kodeFarma:'', namaFarma:'', kodeAlkes:'', namaAlkes:'',
    customerIndukKode:'', customerIndukNama:'', customerIndukAlamat:'',
    namaPemilik:'Ibu Rina Kartika', kontakPerson:'Ibu Rina Kartika', gender:'Wanita', email:'rina@cvmajuterus.co.id', tglLahir:'17/07/1979', fax:'', agama:'Islam', jabatan:'Direktur', telepon:'024-8541223',
    tipeIdentitas:'TIN', noIdentitas:'3374170779790008', profesi:'Wiraswasta', cabang:'Semarang', gudangJualSFA:'(06-GUU) Gudang Utama-SMG', kodeNegara:'IDN', idTKU:'000000', consignment:false,
    area:'JATENG001', rayonKode:'RY-SMG01', rayonNama:'Rayon Semarang Kota', rayonDistrict:'Semarang', provinsi:'Jawa Tengah', kabupaten:'Semarang', kecamatan:'Semarang Selatan', kelurahan:'Pandanaran', kodePos:'50134', latitude:-6.9932, longitude:110.4203,
    groupCustomer:'SBDS', badanUsaha:'CV', statusARCustomer:'Lancar',
    npwp:'01.666.777.8-901.006', namaNpwp:'CV MAJU TERUS', alamatPajak:'', pkpStatus:'PKP', kodeTransaksiPajak:'04', typePpn:'Eksklusif',
    masterBank:'', noVA:'', noRek:'',
    top:'N45', dominasiLimit:1800000, wajibDominasi:false,
    glAkunPiutang:'1120001', glAkunUangMuka:'', uangMuka:0,
    legalitasOutlet:[{syarat:'Nomor Izin Berusaha (NIB)', keterangan:'Sesuai dokumen terlampir', tglExpired:'31/12/2027', tglProses:'10/01/2024', uploaded:true}, {syarat:'NPWP', keterangan:'Sesuai dokumen terlampir', tglExpired:'31/12/2027', tglProses:'10/01/2024', uploaded:true}, {syarat:'SKPKP', keterangan:'', tglExpired:'', tglProses:'', uploaded:false}, {syarat:'Spesimen Cap/ Stempel Customer', keterangan:'', tglExpired:'', tglProses:'', uploaded:false}],
    legalitasPemilik:[{syarat:'KTP', keterangan:'', tglExpired:'', tglProses:'', uploaded:false}, {syarat:'Nama Penanggung Jawab', keterangan:'', tglExpired:'', tglProses:'', uploaded:false}]},
    {kode:'CUST-008', nama:'Toko Sejahtera', kota:'Surabaya', salesman:'Andi Wijaya', limit:17500000, status:'Aktif', alamat:'Jl. Kertajaya No. 67, Surabaya', piutang:3120000,
    noRef:'SBY.0002', tglRegistrasi:'14/05/2023', mataUang:'IDR', kodeFarma:'', namaFarma:'', kodeAlkes:'', namaAlkes:'',
    customerIndukKode:'', customerIndukNama:'', customerIndukAlamat:'',
    namaPemilik:'Bpk. Sejahtera Wibowo', kontakPerson:'Bpk. Sejahtera Wibowo', gender:'Pria', email:'', tglLahir:'23/10/1983', fax:'', agama:'Islam', jabatan:'Pemilik', telepon:'031-5541278',
    tipeIdentitas:'TIN', noIdentitas:'3578231083830009', profesi:'Wiraswasta', cabang:'Surabaya', gudangJualSFA:'(01-GUU) Gudang Utama-SBY', kodeNegara:'IDN', idTKU:'000000', consignment:false,
    area:'JATIM001', rayonKode:'RY-SBY01', rayonNama:'Rayon Surabaya Kota', rayonDistrict:'Surabaya', provinsi:'Jawa Timur', kabupaten:'Surabaya', kecamatan:'Rungkut', kelurahan:'Kalirungkut', kodePos:'60293', latitude:-7.2575, longitude:112.7521,
    groupCustomer:'RTTR', badanUsaha:'PRO', statusARCustomer:'Lancar',
    npwp:'-', namaNpwp:'TOKO SEJAHTERA', alamatPajak:'', pkpStatus:'Non-PKP', kodeTransaksiPajak:'04', typePpn:'Eksklusif',
    masterBank:'', noVA:'', noRek:'',
    top:'N14', dominasiLimit:3500000, wajibDominasi:false,
    glAkunPiutang:'1120001', glAkunUangMuka:'', uangMuka:0,
    legalitasOutlet:[{syarat:'Nomor Izin Berusaha (NIB)', keterangan:'', tglExpired:'', tglProses:'', uploaded:false}, {syarat:'NPWP', keterangan:'', tglExpired:'', tglProses:'', uploaded:false}, {syarat:'SKPKP', keterangan:'', tglExpired:'', tglProses:'', uploaded:false}, {syarat:'Spesimen Cap/ Stempel Customer', keterangan:'', tglExpired:'', tglProses:'', uploaded:false}],
    legalitasPemilik:[{syarat:'KTP', keterangan:'', tglExpired:'', tglProses:'', uploaded:false}, {syarat:'Nama Penanggung Jawab', keterangan:'', tglExpired:'', tglProses:'', uploaded:false}]},
    /* =========================================================
       2 CUSTOMER BARU 2026-08-28 — utk fitur BARU "Pelunasan Piutang
       Terpusat (Holding)" di Penerimaan Piutang (modifikasi DBM yang
       diminta user: 1 entitas pusat melunasi piutang cabang-cabang di
       bawahnya, contoh kasus user "Matahari Pusat melunasi piutang
       cabang"). Struktur holding memakai field customerInduk* yang
       SUDAH ADA di master customer sejak awal (baru sekarang terpakai
       nyata):
       - CUST-009 "PT Family Mart Indonesia" = CUSTOMER PUSAT (holding,
         tidak bertransaksi sendiri — piutang 0, limit besar). Muncul
         di picker "Pilih Customer Pusat (Holding)" di Penerimaan
         Piutang karena jadi customerIndukKode 2 customer lain.
       - CUST-010 "Toko Family Mart Sentosa" (Surabaya) = cabang BARU
         di bawah CUST-009, di samping CUST-006 Toko Family Mart Jaya
         (existing, customerInduk-nya diisi — lihat komentar di baris
         CUST-006). piutang 1.240.000 = PERSIS outstanding 2 Invoice
         posted barunya (26/SI/SBY/08/00004 700.000 + 00005 540.000,
         lihat komentar di DATA.invoices) — konsisten aturan
         rekonsiliasi piutang FA-10 Lap Umur Piutang.
       Kedua cabang SENGAJA dibiarkan punya faktur outstanding
       (CUST-006 sisa 200.000 dari 26/SI/HO/08/00002, CUST-010
       1.240.000) supaya demo end-to-end pelunasan holding multi-
       customer bisa langsung dijalankan dari menu Penerimaan Piutang
       (pola "sengaja dibiarkan belum lunas" yang sama dgn UD Makmur
       Jaya utk demo + Tambah biasa). */
    {kode:'CUST-009', nama:'PT Family Mart Indonesia', kota:'Jakarta', salesman:'Budi Santoso', limit:100000000, status:'Aktif', alamat:'Jl. Jend. Sudirman Kav. 52-53, Jakarta Selatan', piutang:0,
    noRef:'HO.0003', tglRegistrasi:'15/03/2016', mataUang:'IDR', kodeFarma:'', namaFarma:'', kodeAlkes:'', namaAlkes:'',
    customerIndukKode:'', customerIndukNama:'', customerIndukAlamat:'',
    namaPemilik:'Ibu Ratna Dewi', kontakPerson:'Ibu Ratna Dewi', gender:'Wanita', email:'finance@familymartindonesia.co.id', tglLahir:'11/02/1978', fax:'021-5150999', agama:'Islam', jabatan:'Finance Director', telepon:'021-5150998',
    tipeIdentitas:'TIN', noIdentitas:'3174021102780003', profesi:'Karyawan Swasta', cabang:'Head Office', gudangJualSFA:'(00-GUU) Gudang Utama-HO', kodeNegara:'IDN', idTKU:'000000', consignment:false,
    area:'DKI001', rayonKode:'RY-JKT01', rayonNama:'Rayon Jakarta Pusat', rayonDistrict:'Jakarta Pusat', provinsi:'DKI Jakarta', kabupaten:'Jakarta Selatan', kecamatan:'Kebayoran Baru', kelurahan:'Senayan', kodePos:'12190', latitude:-6.2251, longitude:106.8097,
    groupCustomer:'RTMD', badanUsaha:'PT', statusARCustomer:'Lancar',
    npwp:'01.777.888.9-012.006', namaNpwp:'PT FAMILY MART INDONESIA', alamatPajak:'', pkpStatus:'PKP', kodeTransaksiPajak:'04', typePpn:'Eksklusif',
    masterBank:'', noVA:'', noRek:'',
    top:'N30', dominasiLimit:0, wajibDominasi:false,
    glAkunPiutang:'1120001', glAkunUangMuka:'', uangMuka:0,
    legalitasOutlet:[{syarat:'Nomor Izin Berusaha (NIB)', keterangan:'', tglExpired:'', tglProses:'', uploaded:false}, {syarat:'NPWP', keterangan:'', tglExpired:'', tglProses:'', uploaded:false}, {syarat:'SKPKP', keterangan:'', tglExpired:'', tglProses:'', uploaded:false}, {syarat:'Spesimen Cap/ Stempel Customer', keterangan:'', tglExpired:'', tglProses:'', uploaded:false}],
    legalitasPemilik:[{syarat:'KTP', keterangan:'', tglExpired:'', tglProses:'', uploaded:false}, {syarat:'Nama Penanggung Jawab', keterangan:'', tglExpired:'', tglProses:'', uploaded:false}]},
    {kode:'CUST-010', nama:'Toko Family Mart Sentosa', kota:'Surabaya', salesman:'Andi Wijaya', limit:20000000, status:'Aktif', alamat:'Jl. Basuki Rahmat No. 105, Surabaya', piutang:1240000,
    noRef:'SBY.0003', tglRegistrasi:'02/06/2021', mataUang:'IDR', kodeFarma:'', namaFarma:'', kodeAlkes:'', namaAlkes:'',
    customerIndukKode:'CUST-009', customerIndukNama:'PT Family Mart Indonesia', customerIndukAlamat:'Jl. Jend. Sudirman Kav. 52-53, Jakarta Selatan',
    namaPemilik:'Bpk. Hendro Sentosa', kontakPerson:'Bpk. Hendro Sentosa', gender:'Pria', email:'fm.sentosa@familymartindonesia.co.id', tglLahir:'19/07/1988', fax:'', agama:'Kristen', jabatan:'Store Manager', telepon:'031-5347788',
    tipeIdentitas:'TIN', noIdentitas:'3578191907880004', profesi:'Karyawan Swasta', cabang:'Surabaya', gudangJualSFA:'(01-GUU) Gudang Utama-SBY', kodeNegara:'IDN', idTKU:'000000', consignment:false,
    area:'JATIM001', rayonKode:'RY-SBY01', rayonNama:'Rayon Surabaya Kota', rayonDistrict:'Surabaya', provinsi:'Jawa Timur', kabupaten:'Surabaya', kecamatan:'Tegalsari', kelurahan:'Dr. Soetomo', kodePos:'60264', latitude:-7.2652, longitude:112.7425,
    groupCustomer:'RTMD', badanUsaha:'PT', statusARCustomer:'Lancar',
    npwp:'01.777.888.9-012.007', namaNpwp:'TOKO FAMILY MART SENTOSA', alamatPajak:'', pkpStatus:'PKP', kodeTransaksiPajak:'04', typePpn:'Eksklusif',
    masterBank:'', noVA:'', noRek:'',
    top:'N14', dominasiLimit:4000000, wajibDominasi:false,
    glAkunPiutang:'1120001', glAkunUangMuka:'', uangMuka:0,
    legalitasOutlet:[{syarat:'Nomor Izin Berusaha (NIB)', keterangan:'', tglExpired:'', tglProses:'', uploaded:false}, {syarat:'NPWP', keterangan:'', tglExpired:'', tglProses:'', uploaded:false}, {syarat:'SKPKP', keterangan:'', tglExpired:'', tglProses:'', uploaded:false}, {syarat:'Spesimen Cap/ Stempel Customer', keterangan:'', tglExpired:'', tglProses:'', uploaded:false}],
    legalitasPemilik:[{syarat:'KTP', keterangan:'', tglExpired:'', tglProses:'', uploaded:false}, {syarat:'Nama Penanggung Jawab', keterangan:'', tglExpired:'', tglProses:'', uploaded:false}]},
  ],
  supplierGroup:[
    {kode:'VND000', nama:'NONE', diskon1:0, diskon2:0},
    {kode:'VND001', nama:'PRINSIPAL', diskon1:0, diskon2:0},
    {kode:'VND002', nama:'DISTRIBUTOR', diskon1:0, diskon2:0},
  ],
  wilayah:['Jakarta Pusat','Jakarta Utara','Jakarta Barat','Jakarta Selatan','Jakarta Timur','Surabaya','Bandung','Semarang','Medan','Makassar','Yogyakarta','Solo','Bekasi','Tangerang','Cirebon'],
  provinsiList:['DKI Jakarta','Jawa Barat','Jawa Tengah','Jawa Timur','Sumatera Utara','Sulawesi Selatan','Banten','Yogyakarta'],
  syaratBayarList:['CBD.','N7','N14','N30','N45','N60'],
  typePpnList:['PPN 11%','PPN 12%','Non PKP'],
  typePphList:['PPh 23','Tidak Ada'],
  /* Master Supplier — daftar lengkap, dipakai oleh menu Supplier
     & form Tambah/Ubah Supplier (lihat js/pages/master-supplier.*) */
  suppliers:[
    {kode:'5015', nama:'PT Sumber Pangan Nusantara', kodeFarma:'', namaFarma:'', kodeAlkes:'', namaAlkes:'', crc:'IDR', mataUang:'IDR', wilayah:'Jakarta Pusat', supplierGroup:'VND002', telp:'021-5551234', fax:'021-5551235', email:'purchasing@sumberpangan.co.id', kontak:'Bpk. Hendra', status:'Aktif', syaratBayar:'N30', npwp:'01.234.567.8-901.001', batasKredit:100000000, provinsi:'DKI Jakarta', kabupaten:'Jakarta Pusat', kecamatan:'Gambir', kelurahan:'Petojo', typePpn:'PPN 11%', typePph:'PPh 23', kodePos:'10130', alamat:'Jl. Gajah Mada No. 21, Jakarta Pusat', integration:true, integrationFreeStock:false, uangMuka:0, saldoUtang:0, pusatBisnis:[{kode:'BSC104', nama:'Consumer Food'}], akunGlUtang:'2-1000 Hutang Usaha - Supplier'},
    {kode:'5016', nama:'PT Wilmar Nabati Indonesia', kodeFarma:'', namaFarma:'', kodeAlkes:'', namaAlkes:'', crc:'IDR', mataUang:'IDR', wilayah:'Surabaya', supplierGroup:'VND001', telp:'031-7778899', fax:'031-7778890', email:'ap@wilmarnabati.co.id', kontak:'Ibu Siska', status:'Aktif', syaratBayar:'N45', npwp:'01.234.567.8-901.002', batasKredit:250000000, provinsi:'Jawa Timur', kabupaten:'Surabaya', kecamatan:'Genteng', kelurahan:'Kapasari', typePpn:'PPN 11%', typePph:'PPh 23', kodePos:'60275', alamat:'Jl. Raya Rungkut Industri No. 10, Surabaya', integration:true, integrationFreeStock:true, uangMuka:0, saldoUtang:18500000, pusatBisnis:[{kode:'BSC101', nama:'Generik'}], akunGlUtang:'2-1000 Hutang Usaha - Supplier'},
    {kode:'5017', nama:'PT Sinar Meadow', kodeFarma:'', namaFarma:'', kodeAlkes:'', namaAlkes:'', crc:'IDR', mataUang:'IDR', wilayah:'Semarang', supplierGroup:'VND002', telp:'024-4443322', fax:'', email:'finance@sinarmeadow.co.id', kontak:'Bpk. Yusuf', status:'Aktif', syaratBayar:'N30', npwp:'01.234.567.8-901.003', batasKredit:80000000, provinsi:'Jawa Tengah', kabupaten:'Semarang', kecamatan:'Semarang Tengah', kelurahan:'Miroto', typePpn:'PPN 11%', typePph:'Tidak Ada', kodePos:'50132', alamat:'Jl. Pemuda No. 45, Semarang', integration:false, integrationFreeStock:false, uangMuka:0, saldoUtang:0, pusatBisnis:[], akunGlUtang:'2-1000 Hutang Usaha - Supplier'},
    {kode:'5018', nama:'CV Distribusi Sentosa', kodeFarma:'', namaFarma:'', kodeAlkes:'', namaAlkes:'', crc:'IDR', mataUang:'IDR', wilayah:'Bandung', supplierGroup:'VND002', telp:'022-6667788', fax:'022-6667789', email:'admin@distribusisentosa.co.id', kontak:'Ibu Wulan', status:'Aktif', syaratBayar:'N14', npwp:'01.234.567.8-901.004', batasKredit:50000000, provinsi:'Jawa Barat', kabupaten:'Bandung', kecamatan:'Coblong', kelurahan:'Dago', typePpn:'Non PKP', typePph:'Tidak Ada', kodePos:'40135', alamat:'Jl. Ir. H. Juanda No. 88, Bandung', integration:false, integrationFreeStock:false, uangMuka:0, saldoUtang:4250000, pusatBisnis:[], akunGlUtang:'2-1000 Hutang Usaha - Supplier'},
    {kode:'5019', nama:'PT Mayora Distribusi', kodeFarma:'', namaFarma:'', kodeAlkes:'', namaAlkes:'', crc:'IDR', mataUang:'IDR', wilayah:'Jakarta Selatan', supplierGroup:'VND001', telp:'021-9998877', fax:'021-9998878', email:'sales@mayoradistribusi.co.id', kontak:'Bpk. Rangga', status:'Non Aktif', syaratBayar:'N30', npwp:'01.234.567.8-901.005', batasKredit:150000000, provinsi:'DKI Jakarta', kabupaten:'Jakarta Selatan', kecamatan:'Kebayoran Baru', kelurahan:'Senayan', typePpn:'PPN 11%', typePph:'PPh 23', kodePos:'12190', alamat:'Jl. Sudirman Kav. 21, Jakarta Selatan', integration:true, integrationFreeStock:false, uangMuka:500000, saldoUtang:0, pusatBisnis:[{kode:'BSC103', nama:'Branded'}], akunGlUtang:'2-1000 Hutang Usaha - Supplier'},
    {kode:'5020', nama:'PT Indofood Distribusi', kodeFarma:'', namaFarma:'', kodeAlkes:'', namaAlkes:'', crc:'IDR', mataUang:'IDR', wilayah:'Medan', supplierGroup:'VND001', telp:'061-3332211', fax:'', email:'ho@indofooddistribusi.co.id', kontak:'Bpk. Tommy', status:'Aktif', syaratBayar:'N45', npwp:'01.234.567.8-901.006', batasKredit:200000000, provinsi:'Sumatera Utara', kabupaten:'Medan', kecamatan:'Medan Kota', kelurahan:'Sukaraja', typePpn:'PPN 11%', typePph:'PPh 23', kodePos:'20214', alamat:'Jl. Gatot Subroto No. 33, Medan', integration:true, integrationFreeStock:true, uangMuka:0, saldoUtang:0, pusatBisnis:[{kode:'BSC103', nama:'Branded'}], akunGlUtang:'2-1000 Hutang Usaha - Supplier'},
    {kode:'5021', nama:'UD Sumber Makmur', kodeFarma:'', namaFarma:'', kodeAlkes:'', namaAlkes:'', crc:'IDR', mataUang:'IDR', wilayah:'Yogyakarta', supplierGroup:'VND000', telp:'0274-556677', fax:'', email:'-', kontak:'Bpk. Slamet', status:'Aktif', syaratBayar:'CBD.', npwp:'-', batasKredit:15000000, provinsi:'Yogyakarta', kabupaten:'Sleman', kecamatan:'Depok', kelurahan:'Caturtunggal', typePpn:'Non PKP', typePph:'Tidak Ada', kodePos:'55281', alamat:'Jl. Kaliurang Km. 8, Sleman', integration:false, integrationFreeStock:false, uangMuka:0, saldoUtang:0, pusatBisnis:[], akunGlUtang:'2-1000 Hutang Usaha - Supplier'},
    {kode:'5022', nama:'CV Karya Abadi', kodeFarma:'', namaFarma:'', kodeAlkes:'', namaAlkes:'', crc:'IDR', mataUang:'IDR', wilayah:'Solo', supplierGroup:'VND000', telp:'0271-712233', fax:'', email:'karyaabadi@gmail.com', kontak:'Ibu Retno', status:'Aktif', syaratBayar:'N14', npwp:'01.234.567.8-901.007', batasKredit:25000000, provinsi:'Jawa Tengah', kabupaten:'Surakarta', kecamatan:'Laweyan', kelurahan:'Sondakan', typePpn:'Non PKP', typePph:'Tidak Ada', kodePos:'57147', alamat:'Jl. Slamet Riyadi No. 150, Solo', integration:false, integrationFreeStock:false, uangMuka:0, saldoUtang:0, pusatBisnis:[], akunGlUtang:'2-1000 Hutang Usaha - Supplier'},
    {kode:'5023', nama:'PT Sasa Inti', kodeFarma:'', namaFarma:'', kodeAlkes:'', namaAlkes:'', crc:'IDR', mataUang:'IDR', wilayah:'Makassar', supplierGroup:'VND001', telp:'0411-445566', fax:'0411-445567', email:'finance@sasainti.co.id', kontak:'Bpk. Arman', status:'Aktif', syaratBayar:'N30', npwp:'01.234.567.8-901.008', batasKredit:60000000, provinsi:'Sulawesi Selatan', kabupaten:'Makassar', kecamatan:'Panakkukang', kelurahan:'Karampuang', typePpn:'PPN 11%', typePph:'PPh 23', kodePos:'90231', alamat:'Jl. Boulevard No. 12, Makassar', integration:true, integrationFreeStock:false, uangMuka:0, saldoUtang:450180, pusatBisnis:[{kode:'BSC104', nama:'Consumer Food'}], akunGlUtang:'2-1000 Hutang Usaha - Supplier'},
    {kode:'5024', nama:'Toko Bahan Baku Jaya', kodeFarma:'', namaFarma:'', kodeAlkes:'', namaAlkes:'', crc:'IDR', mataUang:'IDR', wilayah:'Bekasi', supplierGroup:'VND000', telp:'021-8887766', fax:'', email:'-', kontak:'Bpk. Dani', status:'Aktif', syaratBayar:'CBD.', npwp:'-', batasKredit:10000000, provinsi:'Jawa Barat', kabupaten:'Bekasi', kecamatan:'Bekasi Timur', kelurahan:'Margahayu', typePpn:'Non PKP', typePph:'Tidak Ada', kodePos:'17113', alamat:'Jl. Ahmad Yani No. 5, Bekasi', integration:false, integrationFreeStock:false, uangMuka:0, saldoUtang:1200000, pusatBisnis:[], akunGlUtang:'2-1000 Hutang Usaha - Supplier'},
    {kode:'5025', nama:'CV Anugerah Logistik', kodeFarma:'', namaFarma:'', kodeAlkes:'', namaAlkes:'', crc:'IDR', mataUang:'IDR', wilayah:'Tangerang', supplierGroup:'VND000', telp:'021-5443322', fax:'', email:'ops@anugerahlogistik.co.id', kontak:'Bpk. Fikri', status:'Aktif', syaratBayar:'N14', npwp:'01.234.567.8-901.009', batasKredit:20000000, provinsi:'Banten', kabupaten:'Tangerang', kecamatan:'Cipondoh', kelurahan:'Petir', typePpn:'Non PKP', typePph:'Tidak Ada', kodePos:'15148', alamat:'Jl. Daan Mogot Km. 15, Tangerang', integration:false, integrationFreeStock:false, uangMuka:0, saldoUtang:0, pusatBisnis:[], akunGlUtang:'2-1000 Hutang Usaha - Supplier'},
    {kode:'5026', nama:'PT Roda Mas Trading', kodeFarma:'', namaFarma:'', kodeAlkes:'', namaAlkes:'', crc:'IDR', mataUang:'IDR', wilayah:'Cirebon', supplierGroup:'VND001', telp:'0231-556677', fax:'0231-556678', email:'trading@rodamas.co.id', kontak:'Ibu Melinda', status:'Aktif', syaratBayar:'N30', npwp:'01.234.567.8-901.010', batasKredit:70000000, provinsi:'Jawa Barat', kabupaten:'Cirebon', kecamatan:'Kejaksan', kelurahan:'Kebon Baru', typePpn:'PPN 11%', typePph:'PPh 23', kodePos:'45123', alamat:'Jl. Siliwangi No. 77, Cirebon', integration:true, integrationFreeStock:false, uangMuka:0, saldoUtang:814980, pusatBisnis:[{kode:'BSC101', nama:'Generik'}], akunGlUtang:'2-1000 Hutang Usaha - Supplier'},
  ],

  /* Estimasi Hari Pengiriman — menu Supplier & Pembelian > Master &
     Setting > Estimasi Hari Pengiriman (lihat js/pages/
     estimasi-hari-pengiriman.*). 1 baris = estimasi lama pengiriman
     (hari) dari 1 supplier ke 1 cabang target — kombinasi supplier x
     cabang unik (divalidasi saat simpan). `supplier` menaut ke
     DATA.suppliers (dipilih lewat modal picker, disimpan namanya —
     pola sama dengan field supplier di DATA.purchaseOrders),
     `cabangTarget` menaut ke DATA.cabangMaster (dropdown nama cabang).
     Screenshot MASERP acuan memakai 1 supplier farmasi (Bernofarm) ke
     6 cabang — di sini dipetakan ke supplier & cabang milik DBM
     sendiri, pola datanya sama: 1 supplier utama ke 6 cabang. */
  estimasiHariPengiriman:[
    {supplier:'PT Indofood Distribusi', cabangTarget:'Medan', hari:12},
    {supplier:'PT Indofood Distribusi', cabangTarget:'Bandung', hari:3},
    {supplier:'PT Indofood Distribusi', cabangTarget:'Surabaya', hari:10},
    {supplier:'PT Indofood Distribusi', cabangTarget:'Tangerang', hari:4},
    {supplier:'PT Indofood Distribusi', cabangTarget:'Semarang', hari:3},
    {supplier:'PT Indofood Distribusi', cabangTarget:'Makassar', hari:13},
  ],

  /* Jurnal A.P. — menu Supplier & Pembelian > Master & Setting >
     Jurnal A.P. (lihat js/pages/jurnal-ap.*). Master jurnal untuk
     transaksi A.P. manual: `kode` angka berurutan (di-generate
     nextJapKode(), tampil sebagai link biru di list), 3 field akun
     (akunDebit/akunKredit wajib, akunPPN khusus saldo Uang Muka
     opsional) menaut ke DATA.akunGL lewat modal picker — pola ringkas
     dari DATA.jurnalPembelian. Kode akun screenshot MASERP (101110012
     Bank BCA OPS / 620010420 Pph 23, skema instalasi lain) dipetakan
     ke chart of account 7-digit DBM yang sudah ada. */
  jurnalAP:[
    {kode:1, nama:'Saldo Awal', akunDebit:'3200001', akunKredit:'2110001', akunPPN:''},
    {kode:2, nama:'Saldo Awal Import', akunDebit:'3200001', akunKredit:'2110002', akunPPN:''},
    {kode:3, nama:'Pph 23', akunDebit:'1100012', akunKredit:'2120001', akunPPN:''},
  ],

  /* Jurnal A.R. — menu Customer & Penjualan > Master & Setting >
     Jurnal A.R. (lihat js/pages/jurnal-ar.*). KEMBARAN DATA.jurnalAP
     untuk sisi piutang: `kode` angka berurutan (link biru di list),
     `arSsp` = checkbox "Jurnal Ar SSP?" (menandai jurnal yang dipakai
     transaksi Penerimaan SSP — nyambung dgn modul Transaksi A.R. SSP),
     3 field akun (akunDebit/akunKredit wajib, akunPPN khusus saldo
     awal Uang Muka opsional) menaut ke DATA.akunGL. 7 baris sample
     mengikuti list screenshot MASERP; kode akunnya (210701 PPN
     Keluaran / 110501 Piutang Usaha IDR, skema instalasi lain)
     dipetakan ke chart of account 7-digit DBM yang sudah ada. */
  jurnalAR:[
    {kode:1, nama:'SALDO AWAL PIUTANG USAHA IDR', arSsp:false, akunDebit:'1120001', akunKredit:'3200001', akunPPN:''},
    {kode:2, nama:'SALDO AWAL UANG MUKA', arSsp:false, akunDebit:'3200001', akunKredit:'2140001', akunPPN:'2120002'},
    {kode:3, nama:'PENERIMAAN SSP PPN/PPH 22', arSsp:true, akunDebit:'2120003', akunKredit:'1120003', akunPPN:''},
    {kode:4, nama:'SALDO AWAL PIUTANG LAIN - LAIN', arSsp:false, akunDebit:'1120001', akunKredit:'3200001', akunPPN:''},
    {kode:5, nama:'PENERIMAAN SSP PPN', arSsp:true, akunDebit:'2120002', akunKredit:'1120001', akunPPN:''},
    {kode:6, nama:'PENERIMAAN SSP PPH 22', arSsp:true, akunDebit:'1140003', akunKredit:'1120004', akunPPN:''},
    {kode:7, nama:'PENERIMAAN SSP KEPADA PIUTANG USAHA', arSsp:true, akunDebit:'1120001', akunKredit:'1120003', akunPPN:''},
  ],

  /* Transaksi A.R. — menu Customer & Penjualan > Daftar Transaksi >
     Transaksi A.R. (lihat js/pages/transaksi-ar.*). KEMBARAN
     DATA.transaksiAP untuk sisi piutang: `jurnalKode` menaut ke
     DATA.jurnalAR, `customerKode/Nama` ke DATA.customers, `noFaktur`
     ke DATA.invoices (Faktur Penjualan), `rincian[]` = tab Rincian
     Transaksi A.R. (jumlah BOLEH NEGATIF — Nota Kredit, tampil merah
     dalam kurung di list), `jurnalAkun[]` = tab Rincian Jurnal Akun
     (otomatis dari master Jurnal A.R.: akunDebit(D) = akunKredit(K)
     senilai nilai absolut total). No. Transaksi format screenshot
     "26/ARS/{kode cabang}/08/{urut}". 3 baris sample meniru pola list
     screenshot (dokumen Penerimaan SSP bernilai minus) dengan
     customer/faktur/akun milik DBM sendiri. */
  transaksiAR:[
    {no:'26/ARS/HO/08/00001', cabang:'Head Office', tgl:'29/08/2026',
      customerKode:'CUST-001', customerNama:'Toko Sumber Rejeki', noFaktur:'26/SI/HO/08/00001', jurnalKode:3,
      keterangan:'PEMBAYARAN SSP - TOKO SUMBER REJEKI',
      rincian:[
        {tipe:'Nota Kredit', tglJthTempo:'28/10/2026', crc:'IDR', kurs:1, jumlah:-390000},
        {tipe:'Nota Kredit', tglJthTempo:'28/10/2026', crc:'IDR', kurs:1, jumlah:-2860000},
      ],
      jurnalMode:'manual',
      jurnalAkun:[
        {kodeAkun:'2120002', namaAkun:'PPN Keluaran', keterangan:'PEMBAYARAN SSP - TOKO SUMBER REJEKI', debit:2860000, kredit:0},
        {kodeAkun:'1120003', namaAkun:'Piutang SSP PPN', keterangan:'PEMBAYARAN SSP - TOKO SUMBER REJEKI', debit:0, kredit:2860000},
        {kodeAkun:'1140003', namaAkun:'Uang Muka PPH 22', keterangan:'PEMBAYARAN SSP - TOKO SUMBER REJEKI', debit:390000, kredit:0},
        {kodeAkun:'1120004', namaAkun:'Piutang SSP PPH', keterangan:'PEMBAYARAN SSP - TOKO SUMBER REJEKI', debit:0, kredit:390000},
      ],
      jumlah:-3250000},
    {no:'26/ARS/SBY/08/00001', cabang:'Surabaya', tgl:'28/08/2026',
      customerKode:'CUST-002', customerNama:'UD Makmur Jaya', noFaktur:'26/SI/SBY/08/00001', jurnalKode:6,
      keterangan:'Terima Piutang SSP UD MAKMUR JAYA - 26/SI/SBY/08/00001 (Hanya PPh 22)',
      rincian:[{tipe:'Nota Kredit', tglJthTempo:'27/10/2026', crc:'IDR', kurs:1, jumlah:-37200.24}],
      jurnalMode:'otomatis',
      jurnalAkun:[
        {kodeAkun:'1140003', namaAkun:'Uang Muka PPH 22', keterangan:'Terima Piutang SSP UD MAKMUR JAYA - 26/SI/SBY/08/00001 (Hanya PPh 22)', debit:37200.24, kredit:0},
        {kodeAkun:'1120004', namaAkun:'Piutang SSP PPH', keterangan:'Terima Piutang SSP UD MAKMUR JAYA - 26/SI/SBY/08/00001 (Hanya PPh 22)', debit:0, kredit:37200.24},
      ],
      jumlah:-37200.24},
    {no:'26/ARS/TGR/08/00001', cabang:'Tangerang', tgl:'28/08/2026',
      customerKode:'CUST-006', customerNama:'Toko Family Mart Jaya', noFaktur:'26/SI/TGR/08/00001', jurnalKode:5,
      keterangan:'Terima Piutang SSP TOKO FAMILY MART JAYA - 26/SI/TGR/08/00001',
      rincian:[{tipe:'Nota Kredit', tglJthTempo:'27/10/2026', crc:'IDR', kurs:1, jumlah:-962850}],
      jurnalMode:'otomatis',
      jurnalAkun:[
        {kodeAkun:'2120002', namaAkun:'PPN Keluaran', keterangan:'Terima Piutang SSP TOKO FAMILY MART JAYA - 26/SI/TGR/08/00001', debit:962850, kredit:0},
        {kodeAkun:'1120001', namaAkun:'Piutang Usaha', keterangan:'Terima Piutang SSP TOKO FAMILY MART JAYA - 26/SI/TGR/08/00001', debit:0, kredit:962850},
      ],
      jumlah:-962850},
  ],

  /* Retur Surat Jalan — menu Customer & Penjualan > Daftar Transaksi >
     Retur Surat Jalan (lihat js/pages/retur-surat-jalan.*). 1 baris =
     1 dokumen retur atas 1 Surat Jalan (noSJ menaut ke DATA.invoices
     — tiap invoice mockup punya nomor SJ pasangannya). items[] = 1
     baris per batch barang SJ (gudang = kode cabang, qtySJ terkunci,
     qtyRetur yang diedit user, tukarBatch + batchBaru utk tukar
     batch), jurnalAkun[] hasil "Buat Jurnal": Persediaan 1130001(D) =
     HPP 5110001(K) senilai qty retur x harga master barang.
     alasanTipe mengisi otomatis kalimat baku alasanText (lihat
     RSJ_ALASAN_TIPE). No. format screenshot "RSJ/{kode cabang}/
     {YY}{MM}{urut}". 3 baris sample menaut ke SJ sungguhan mockup
     (data screenshot milik instalasi lain/AAA Yogyakarta). */
  returSuratJalan:[
    {no:'RSJ/HO/260800001', cabang:'Head Office', tglRSJ:'14/08/2026', tglPrint:'',
      noSJ:'26/SJ/HO/08/00001', noSO:'26/SO/HO/08/00011', tglSO:'07/08/2026', noSP:'',
      customer:'Toko Sumber Rejeki', customerKode:'CUST-001', salesman:'Budi Santoso',
      alamatPengiriman:'Jl. Mangga Dua Raya No. 12, Jakarta Pusat',
      items:[
        {gudang:'HO', kode:'BRG-006', nama:'Kecap Manis ABC 600ml', satuan:'Dus', batch:'BT-260706-06', qtySJ:60, ed:'2027-03-31', qtyRetur:10, tukarBatch:false, batchBaru:''},
        {gudang:'HO', kode:'BRG-009', nama:'Kopi Kapal Api 165gr', satuan:'Dus', batch:'BT-260709-09', qtySJ:20, ed:'2027-09-30', qtyRetur:0, tukarBatch:false, batchBaru:''},
      ],
      jurnalMode:'otomatis',
      jurnalAkun:[
        {kodeAkun:'1130001', costCenter:'', namaAkun:'Persediaan Barang Dagang Jakarta', keterangan:'RETUR SJ 26/SJ/HO/08/00001 TOKO SUMBER REJEKI', debit:120000, kredit:0},
        {kodeAkun:'5110001', costCenter:'', namaAkun:'HPP Barang Dagang', keterangan:'RETUR SJ 26/SJ/HO/08/00001 TOKO SUMBER REJEKI', debit:0, kredit:120000},
      ],
      alasanTipe:'Kesalahan DPF/L', alasanSub:'Retur Sebagian', alasanText:'Salah Nilai/Amount Diskon/DPL Sudah Tidak Berlaku'},
    {no:'RSJ/SBY/260800001', cabang:'Surabaya', tglRSJ:'22/08/2026', tglPrint:'',
      noSJ:'26/SJ/SBY/08/00001', noSO:'26/SO/SBY/08/00007', tglSO:'08/08/2026', noSP:'SP/SBY/08/00007',
      customer:'UD Makmur Jaya', customerKode:'CUST-002', salesman:'Andi Wijaya',
      alamatPengiriman:'Jl. Raya Darmo No. 45, Surabaya',
      items:[
        {gudang:'SBY', kode:'BRG-007', nama:'Susu Kental Manis Indomilk 380gr', satuan:'Dus', batch:'BT-260707-07', qtySJ:30, ed:'2027-07-31', qtyRetur:5, tukarBatch:true, batchBaru:'BT-260807-11'},
      ],
      jurnalMode:'otomatis',
      jurnalAkun:[],
      alasanTipe:'Mendekati ED', alasanSub:'Retur Sebagian', alasanText:'Barang Mendekati/Melewati Tanggal Kadaluarsa'},
    {no:'RSJ/TGR/260800001', cabang:'Tangerang', tglRSJ:'28/08/2026', tglPrint:'',
      noSJ:'26/SJ/TGR/08/00001', noSO:'26/SO/HO/08/00013', tglSO:'11/08/2026', noSP:'SP/HO/08/00013',
      customer:'Toko Family Mart Jaya', customerKode:'CUST-006', salesman:'Citra Lestari',
      alamatPengiriman:'Jl. Kelapa Gading Boulevard No. 9, Jakarta Utara',
      items:[
        {gudang:'TGR', kode:'BRG-001', nama:'Minyak Goreng Sunco 2L', satuan:'Dus', batch:'BT-260701-01', qtySJ:20, ed:'2027-06-30', qtyRetur:20, tukarBatch:false, batchBaru:''},
      ],
      jurnalMode:'otomatis',
      jurnalAkun:[],
      alasanTipe:'Kesalahan Kirim', alasanSub:'Retur Semua', alasanText:'Salah Kirim Barang/Salah Alamat Pengiriman'},
  ],

  /* Retur Penjualan — menu Customer & Penjualan > Daftar Transaksi >
     Retur Penjualan (lihat js/pages/retur-penjualan.*). 1 baris = 1
     dokumen retur penjualan FINAL (tidak bisa diedit — hanya Lihat/
     Cetak/Hapus, banner kuning di form Lihat). noFakturJual menaut ke
     DATA.invoices (boleh kosong = retur cash tanpa faktur, seperti
     baris pertama screenshot), items[] menyalin barang faktur (harga
     jual dari master DATA.items, batch dari item invoice), jurnalAkun[]
     hasil "Buat Jurnal" (pemetaan akun lihat header template). 2
     CETAKAN per dokumen: faktur "Retur Penjualan" (tombol Cetak, ada
     Terbilang) & "BPBR" (tombol Lihat BAPBR) — replika 2 PDF acuan
     dengan kop PT Distriversa Buanamas. No. format screenshot
     "26/RS-{kode cabang}/{MM}/{urut}". 4 baris sample memakai
     customer/faktur/barang DBM (data screenshot & PDF milik instalasi
     lain/SDL Sidoarjo, tidak direplikasi). */
  returPenjualan:[
    {no:'26/RS-TGR/08/00002', cabang:'Tangerang', status:'Approved', tipeTransaksi:'Retur Penjualan Cash',
      inventoryTransaction:'', tglRetur:'15/08/2026 13:40:00', tglJthTempo:'15/08/2026',
      customer:'Toko Family Mart Jaya', customerKode:'CUST-006', noFakturJual:'26/SI/TGR/08/00001',
      syaratBayar:'Jadikan Nota Kredit', jurnal:'JURNAL PENJUALAN KREDIT (IDR)', principal:'PT Sumber Pangan Nusantara',
      tipeLayanan:'Reguler', returAdministrasi:false, gudangKode:'03-GUU', gudangAlokasi:false,
      salesman:'Citra Lestari', alamatPengiriman:'Jl. Kelapa Gading Boulevard No. 9, Jakarta Utara',
      items:[{kode:'BRG-002', nama:'Gula Pasir Gulaku 1kg', um:'Karung', qty:30, qtySisa:0, hargaJual:15000,
        discPrincipal:0, discDistributor:2, totalDisc:2, diskon1:9000, jumlah:441000,
        batches:[{no:'BT-260702-02', qty:30, ed:'2027-05-15'}]}],
      ppnMode:'eksklusif', tglFakturPajak:'15/08/2026', kodePajak:'04 - DPP Nilai Lain', noFakturPajak:'RET04260000866357',
      diskon1:0, diskon1Amount:0, diskon2:0, diskon2Amount:0, bruto:450000, dpp:441000,
      pajak11:'PPN11', ppnAmount:48510, ongkosAngkut:0, jumlahTotal:489510, sisaJumlah:489510,
      alasanTipe:'Kesalahan DPF/L', alasanSub:'Retur Sebagian', alasanText:'Salah Nilai/Amount Diskon/DPL Sudah Tidak Berlaku',
      jurnalAkun:[
        {kodeAkun:'4110002', namaAkun:'Retur Penjualan', keterangan:'', debit:450000, kredit:0},
        {kodeAkun:'1120001', namaAkun:'Piutang Usaha', keterangan:'', debit:0, kredit:489510},
        {kodeAkun:'4110005', namaAkun:'Sales Item Discount (Distributor)', keterangan:'', debit:0, kredit:9000},
        {kodeAkun:'2120002', namaAkun:'PPN Keluaran', keterangan:'', debit:48510, kredit:0},
        {kodeAkun:'1130001', namaAkun:'Persediaan Barang Dagang Jakarta', keterangan:'', debit:450000, kredit:0},
        {kodeAkun:'5110001', namaAkun:'HPP Barang Dagang', keterangan:'', debit:0, kredit:450000},
      ]},
    {no:'26/RS-TGR/08/00001', cabang:'Tangerang', status:'Approved', tipeTransaksi:'Retur Penjualan Cash',
      inventoryTransaction:'', tglRetur:'14/08/2026 11:05:00', tglJthTempo:'14/08/2026',
      customer:'Toko Family Mart Jaya', customerKode:'CUST-006', noFakturJual:'26/SI/TGR/08/00001',
      syaratBayar:'Jadikan Nota Kredit', jurnal:'JURNAL PENJUALAN KREDIT (IDR)', principal:'PT Sumber Pangan Nusantara',
      tipeLayanan:'Reguler', returAdministrasi:false, gudangKode:'03-GUU', gudangAlokasi:false,
      salesman:'Citra Lestari', alamatPengiriman:'Jl. Kelapa Gading Boulevard No. 9, Jakarta Utara',
      items:[{kode:'BRG-001', nama:'Minyak Goreng Sunco 2L', um:'Dus', qty:20, qtySisa:0, hargaJual:25000,
        discPrincipal:0, discDistributor:3, totalDisc:3, diskon1:15000, jumlah:485000,
        batches:[{no:'BT-260701-01', qty:20, ed:'2027-06-30'}]}],
      ppnMode:'eksklusif', tglFakturPajak:'14/08/2026', kodePajak:'04 - DPP Nilai Lain', noFakturPajak:'RET04260000866349',
      diskon1:0, diskon1Amount:0, diskon2:0, diskon2Amount:0, bruto:500000, dpp:485000,
      pajak11:'PPN11', ppnAmount:53350, ongkosAngkut:0, jumlahTotal:538350, sisaJumlah:538350,
      alasanTipe:'Barang Rusak', alasanSub:'Retur Sebagian', alasanText:'Barang Diterima Customer Dalam Kondisi Rusak',
      jurnalAkun:[
        {kodeAkun:'4110002', namaAkun:'Retur Penjualan', keterangan:'', debit:500000, kredit:0},
        {kodeAkun:'1120001', namaAkun:'Piutang Usaha', keterangan:'', debit:0, kredit:538350},
        {kodeAkun:'4110005', namaAkun:'Sales Item Discount (Distributor)', keterangan:'', debit:0, kredit:15000},
        {kodeAkun:'2120002', namaAkun:'PPN Keluaran', keterangan:'', debit:53350, kredit:0},
        {kodeAkun:'1130001', namaAkun:'Persediaan Barang Dagang Jakarta', keterangan:'', debit:500000, kredit:0},
        {kodeAkun:'5110001', namaAkun:'HPP Barang Dagang', keterangan:'', debit:0, kredit:500000},
      ]},
    {no:'26/RS-SBY/08/00001', cabang:'Surabaya', status:'Approved', tipeTransaksi:'Retur Penjualan Cash',
      inventoryTransaction:'', tglRetur:'13/08/2026 09:15:00', tglJthTempo:'13/08/2026',
      customer:'UD Makmur Jaya', customerKode:'CUST-002', noFakturJual:'26/SI/SBY/08/00001',
      syaratBayar:'Jadikan Nota Kredit', jurnal:'JURNAL PENJUALAN KREDIT (IDR)', principal:'PT Wilmar Nabati Indonesia',
      tipeLayanan:'Reguler', returAdministrasi:false, gudangKode:'01-GUU', gudangAlokasi:false,
      salesman:'Andi Wijaya', alamatPengiriman:'Jl. Raya Darmo No. 45, Surabaya',
      items:[{kode:'BRG-007', nama:'Susu Kental Manis Indomilk 380gr', um:'Dus', qty:5, qtySisa:0, hargaJual:14000,
        discPrincipal:0, discDistributor:0, totalDisc:0, diskon1:0, jumlah:70000,
        batches:[{no:'BT-260707-07', qty:5, ed:'2027-07-31'}]}],
      ppnMode:'eksklusif', tglFakturPajak:'13/08/2026', kodePajak:'04 - DPP Nilai Lain', noFakturPajak:'RET04260000866332',
      diskon1:0, diskon1Amount:0, diskon2:0, diskon2Amount:0, bruto:70000, dpp:70000,
      pajak11:'PPN11', ppnAmount:7700, ongkosAngkut:0, jumlahTotal:77700, sisaJumlah:77700,
      alasanTipe:'Mendekati ED', alasanSub:'Retur Sebagian', alasanText:'Barang Mendekati/Melewati Tanggal Kadaluarsa',
      jurnalAkun:[
        {kodeAkun:'4110002', namaAkun:'Retur Penjualan', keterangan:'', debit:70000, kredit:0},
        {kodeAkun:'1120001', namaAkun:'Piutang Usaha', keterangan:'', debit:0, kredit:77700},
        {kodeAkun:'2120002', namaAkun:'PPN Keluaran', keterangan:'', debit:7700, kredit:0},
        {kodeAkun:'1130001', namaAkun:'Persediaan Barang Dagang Jakarta', keterangan:'', debit:70000, kredit:0},
        {kodeAkun:'5110001', namaAkun:'HPP Barang Dagang', keterangan:'', debit:0, kredit:70000},
      ]},
    {no:'26/RS-HO/08/00001', cabang:'Head Office', status:'Approved', tipeTransaksi:'Retur Penjualan Cash',
      inventoryTransaction:'', tglRetur:'09/08/2026 10:28:29', tglJthTempo:'09/08/2026',
      customer:'Toko Sumber Rejeki', customerKode:'CUST-001', noFakturJual:'',
      syaratBayar:'Jadikan Nota Kredit', jurnal:'JURNAL PENJUALAN KREDIT (IDR)', principal:'',
      tipeLayanan:'Pilih', returAdministrasi:false, gudangKode:'00-GUU', gudangAlokasi:false,
      salesman:'Budi Santoso', alamatPengiriman:'Jl. Mangga Dua Raya No. 12, Jakarta Pusat',
      items:[{kode:'BRG-001', nama:'Minyak Goreng Sunco 2L', um:'Dus', qty:10, qtySisa:0, hargaJual:25000,
        discPrincipal:0, discDistributor:3, totalDisc:3, diskon1:7500, jumlah:242500,
        batches:[{no:'BT-260701-01', qty:10, ed:'2027-06-30'}]}],
      ppnMode:'eksklusif', tglFakturPajak:'09/08/2026', kodePajak:'04 - DPP Nilai Lain', noFakturPajak:'RET04260000866355',
      diskon1:0, diskon1Amount:0, diskon2:0, diskon2Amount:0, bruto:250000, dpp:242500,
      pajak11:'PPN11', ppnAmount:26675, ongkosAngkut:0, jumlahTotal:269175, sisaJumlah:269175,
      alasanTipe:'Lain-lain', alasanSub:'', alasanText:'',
      jurnalAkun:[
        {kodeAkun:'4110002', namaAkun:'Retur Penjualan', keterangan:'', debit:250000, kredit:0},
        {kodeAkun:'1120001', namaAkun:'Piutang Usaha', keterangan:'', debit:0, kredit:269175},
        {kodeAkun:'4110005', namaAkun:'Sales Item Discount (Distributor)', keterangan:'', debit:0, kredit:7500},
        {kodeAkun:'2120002', namaAkun:'PPN Keluaran', keterangan:'', debit:26675, kredit:0},
        {kodeAkun:'1130001', namaAkun:'Persediaan Barang Dagang Jakarta', keterangan:'', debit:250000, kredit:0},
        {kodeAkun:'5110001', namaAkun:'HPP Barang Dagang', keterangan:'', debit:0, kredit:250000},
      ]},
  ],

  /* Master Bank — menu Kas/Bank > Master & Setting > Master Bank
     (lihat js/pages/master-bank.*). Master identitas rekening Virtual
     Account per cabang/entitas (dipakai penagihan customer) — beda
     dari DATA.kasBank yang menyimpan akun kas & bank GL. Kode
     auto-generate "B{urut 2 digit}" (mbkGenerateKode). Nama sample
     memakai PT Distriversa Buanamas per cabang; nomor VA mengikuti
     contoh screenshot (instalasi SDL). */
  masterBank:[
    {kode:'B01', nama:'PT DISTRIVERSA BUANAMAS SURABAYA', va:'8290910219'},
    {kode:'B02', nama:'PT DISTRIVERSA BUANAMAS SEMARANG', va:'8292366689'},
    {kode:'B03', nama:'PT DISTRIVERSA BUANAMAS TANGERANG', va:'8292806689'},
    {kode:'B04', nama:'PT DISTRIVERSA BUANAMAS BANDUNG', va:'8293086689'},
  ],

  /* Jurnal Kas Lain-Lain — menu Kas/Bank > Master & Setting > Jurnal
     Kas Lain-Lain (lihat js/pages/jurnal-kas-lain.*). Template jurnal
     utk Transaksi Kas non utang/piutang: `akunKasBank` menaut ke
     DATA.kasBank (kode 6-digit master Kas/Bank), `akunLawan` &
     `akunGiroMundur` (opsional) ke DATA.akunGL. Kode angka berurutan
     (nextJklKode). 7 baris sample representatif dipetakan ke kas/bank
     & akun beban-pendapatan DBM (screenshot instalasi SDL punya 287
     baris — tidak direplikasi). */
  jurnalKasLain:[
    {kode:10, nama:'Kas Bon / Opening Balance', akunKasBank:'110104', akunGiroMundur:'', akunLawan:''},
    {kode:100, nama:'Beban Listrik & Air_BCA HO', akunKasBank:'110107', akunGiroMundur:'', akunLawan:'5210004'},
    {kode:101, nama:'Beban Gaji & Tunjangan_Mandiri HO', akunKasBank:'110106', akunGiroMundur:'', akunLawan:'5210001'},
    {kode:102, nama:'Beban Administrasi Bank_BCA HO', akunKasBank:'110107', akunGiroMundur:'', akunLawan:'6510001'},
    {kode:103, nama:'Pendapatan Jasa Giro dan Deposito', akunKasBank:'110107', akunGiroMundur:'', akunLawan:'6010001'},
    {kode:104, nama:'Beban ATK & Cetak_Kas Kecil SMG', akunKasBank:'110105', akunGiroMundur:'', akunLawan:'5210005'},
    {kode:105, nama:'Beban Administrasi Bank_BNI SBY', akunKasBank:'110109', akunGiroMundur:'', akunLawan:'6510001'},
  ],

  /* Daftar Giro Mundur — menu Kas/Bank > Daftar Transaksi > Daftar
     Giro Mundur (lihat js/pages/giro-mundur.*). 1 baris = 1 lembar
     giro/cek mundur yang diterima dari customer (tipe 'Terima Giro',
     lahir dari Penerimaan Piutang bertipe giro) atau dikeluarkan ke
     supplier ('Keluar Giro', dari Pelunasan Utang) — makanya list
     TIDAK punya tombol Tambah. `bankKode` menaut ke DATA.kasBank,
     `noTransaksi` memakai format nomor Pelunasan/Penerimaan
     ("26/CL/..."), `status` digerakkan tombol Cair ("Belum Cair" ->
     "Cair") / Tolak ("Sudah Ditolak"). 4 baris sample semuanya
     "Belum Cair" supaya tab default screenshot langsung berisi &
     kedua tombol bisa didemokan (data screenshot milik instalasi
     SDL — nomor giro AGC dipertahankan sebagai contoh). */
  giroMundur:[
    {noGiro:'AGC 221408', bankKode:'110107', noTransaksi:'26/CL/HO/08/00194', tgl:'07/08/2026', tglJthTempo:'05/09/2026',
      nama:'Toko Sumber Rejeki', tipe:'Terima Giro', jumlah:13689000, status:'Belum Cair', tglEfektif:'',
      keterangan:'Pembayaran BG BANK BCA No. AGC 221408 Rp. 13.689.000 jatuh tempo 05/09/26 - TOKO SUMBER REJEKI'},
    {noGiro:'AGC 221468', bankKode:'110107', noTransaksi:'26/CL/HO/08/00604', tgl:'28/08/2026', tglJthTempo:'03/10/2026',
      nama:'UD Makmur Jaya', tipe:'Terima Giro', jumlah:15180000, status:'Belum Cair', tglEfektif:'',
      keterangan:'Pembayaran BG BANK BCA No. AGC 221468 Rp. 15.180.000 jatuh tempo 03/10/26 - UD MAKMUR JAYA'},
    {noGiro:'AGC 221467', bankKode:'110107', noTransaksi:'26/CL/HO/08/00603', tgl:'28/08/2026', tglJthTempo:'19/09/2026',
      nama:'Toko Family Mart Jaya', tipe:'Terima Giro', jumlah:15160000, status:'Belum Cair', tglEfektif:'',
      keterangan:'Pembayaran BG BANK BCA No. AGC 221467 Rp. 15.160.000 jatuh tempo 19/09/26 - TOKO FAMILY MART JAYA'},
    {noGiro:'BG 004512', bankKode:'110106', noTransaksi:'26/CL/HO/08/00002', tgl:'21/08/2026', tglJthTempo:'20/09/2026',
      nama:'PT Wilmar Nabati Indonesia', tipe:'Keluar Giro', jumlah:12500000, status:'Belum Cair', tglEfektif:'',
      keterangan:'Pembayaran BG BANK MANDIRI No. BG 004512 Rp. 12.500.000 jatuh tempo 20/09/26 - PT WILMAR NABATI INDONESIA'},
  ],

  /* Rekonsiliasi — menu Kas/Bank > Daftar Transaksi > Rekonsiliasi
     (lihat js/pages/rekonsiliasi.*). 1 baris = 1 rekonsiliasi bank per
     bulan: `bankKode` menaut ke DATA.kasBank (Saldo Awal dari saldo
     rekening itu), `items[]` = Rincian Rekonsiliasi (baris ditarik
     dari Transaksi Kas / Pelunasan Utang / Penerimaan Piutang lewat
     3 tombol di form; `cek` = sudah dicocokkan dgn rekening koran).
     Aritmetika: rekeningKoran = saldoAwal + total semua baris;
     Rekonsiliasi = total baris tercentang; Selisih = 0 begitu semua
     tercentang. No. format screenshot "{urut}/{bank} /{lokasi}/
     {romawi bulan}/2026". 3 baris sample Bank BCA HO Juni-Agustus
     2026 (data screenshot instalasi SDL/94 baris tidak direplikasi). */
  rekonsiliasi:[
    {no:'03/BCA /HO/VIII/2026', bankKode:'110107', mataUang:'IDR', bulanIdx:7, tgl:'31/08/2026', tglRekonIso:'2026-08-31T08:18:03',
      saldoAwal:210000000, rekeningKoran:210041311,
      items:[
        {tglBank:'01/08/2026', noTransaksi:'26/CL-HO/08/00043', keterangan:'Biaya jasa VA Tgl 01/08/2026', kurs:1, terima:0, keluar:13626, cek:true},
        {tglBank:'01/08/2026', noTransaksi:'26/CL-HO/08/00044', keterangan:'Admin Kliring', kurs:1, terima:0, keluar:2000, cek:true},
        {tglBank:'02/08/2026', noTransaksi:'26/CL-HO/08/00011', keterangan:'Terima Piutang 26/SI/HO/08/00002 TOKO FAMILY MART JAYA', kurs:1, terima:56937, cek:true, keluar:0},
      ]},
    {no:'02/BCA /HO/VII/2026', bankKode:'110107', mataUang:'IDR', bulanIdx:6, tgl:'31/07/2026', tglRekonIso:'2026-07-31T06:39:39',
      saldoAwal:209600000, rekeningKoran:210000000,
      items:[
        {tglBank:'15/07/2026', noTransaksi:'26/CL-HO/07/00021', keterangan:'Terima Piutang pelanggan HO', kurs:1, terima:415000, keluar:0, cek:true},
        {tglBank:'20/07/2026', noTransaksi:'26/CL-HO/07/00034', keterangan:'Admin bank bulanan', kurs:1, terima:0, keluar:15000, cek:true},
      ]},
    {no:'01/BCA /HO/VI/2026', bankKode:'110107', mataUang:'IDR', bulanIdx:5, tgl:'30/06/2026', tglRekonIso:'2026-06-30T03:44:41',
      saldoAwal:209104000, rekeningKoran:209600000,
      items:[
        {tglBank:'10/06/2026', noTransaksi:'26/CL-HO/06/00017', keterangan:'Terima Piutang pelanggan HO', kurs:1, terima:510000, keluar:0, cek:true},
        {tglBank:'28/06/2026', noTransaksi:'26/CL-HO/06/00029', keterangan:'Admin bank bulanan', kurs:1, terima:0, keluar:14000, cek:true},
      ]},
  ],

  /* Pembelian Aktiva Tetap — menu Aktiva Tetap > Daftar Transaksi >
     Pembelian Aktiva Tetap (lihat js/pages/pembelian-aktiva-tetap.*).
     1 baris = 1 dokumen pembelian aset: `items[]` = tabel Rincian
     Aktiva Tetap (kodeAset boleh '' utk aset baru yang belum masuk
     master Fixed Asset; jurnalKode menaut ke DATA.jurnalFixedAsset),
     `jurnalAkun[]` hasil "Buat Jurnal" (debit akun golongan aset +
     PPN Masukan, kredit Hutang Usaha utk Kredit / Kas Besar utk
     CBD.). tipeTransaksi dari Syarat Bayar (CBD. -> Beli Tunai).
     No. format screenshot "26/FAB/{kode cabang}/08/{urut}".
     Screenshot list kosong — 2 baris sample supaya list & form
     Lihat langsung ada isinya. */

  /* ===== Uang Muka Supplier (Supplier & Pembelian > Daftar
     Transaksi > Uang Muka Supplier) — DP/tagihan uang muka ke
     supplier, dibuat dari PO (barang PO jadi baris Rincian
     Transaksi). Aritmetika: subtotal = total jumlah baris; DP
     ditagih = subtotal x % (editable); DPP = DP ditagih; PPN 11%
     DPP (mode eksklusif); PPh dipotong mengurangi; Jumlah = DPP +
     PPN - PPh. jurnalAkun[] hasil "Buat Jurnal": D 1140001 Uang
     Muka Pembelian (DPP) + D 1140002 PPN Masukan lawan K 2110001
     Hutang Usaha (Jumlah) + K 1140003 bila ada PPh. No. format
     "26/UMS-{kode cabang}/08/{urut 5 digit}". 2 baris sample
     terkait PO DBM yang sudah ada di DATA.purchaseOrder. */

  /* ===== Permintaan Pembelian / PR (Supplier & Pembelian > Daftar
     Transaksi > Permintaan Pembelian) — juga dipakai menu Tutup PR
     (flag tutupPr: tombol Tutup Request / Buka Request) dan kolom
     Status dari flag dipakaiPO. 2 baris Agustus 2026 (chip default
     list PR -> Total Record: 2 persis screenshot) + 7 baris periode
     lama supaya list Tutup PR berisi 9 record lintas bulan/tahun
     persis screenshot. No. format "26/PR-{kode cabang}/{MM}/{urut
     5 digit}". Rincian: Nama Barang textarea bebas (spesifikasi
     panjang, contoh Forklift screenshot). */

  /* ===== Retur Penerimaan Barang / Retur PB (Supplier & Pembelian
     > Daftar Transaksi > Retur PB) — retur barang atas penerimaan
     BPB (DATA.pembelianBPB): Qty Terima dari BPB, user mengisi Qty
     Retur. No. urut GLOBAL "26/RPB-{10 digit}" (bukan per cabang,
     persis screenshot). Flag adaTagihan utk chip filter list (All /
     Ada Tagihan / Belum Ditagih). Nilai jurnal = qtyRetur x
     hargaBeli (+PPN 11% bila BPB eksklusif): D Hutang Usaha lawan
     K Persediaan + K PPN Masukan. 2 baris sample terkait BPB DBM. */

  /* ===== Pembelian Langsung (Supplier & Pembelian > Daftar
     Transaksi > Pembelian Langsung) — faktur pembelian TANPA
     PO/BPB (jasa & barang non-stock; Kode Barang boleh kosong).
     Tipe Transaksi list dari Syarat Bayar (Kredit -> Pembelian
     Kredit, COD/CBD -> Pembelian Tunai); tombol Hapus di list
     NONAKTIF bila pembayaran > 0 (persis screenshot). No. faktur
     26/PU/{kode cabang}/08/{urut} (generator ikut menghitung PU
     milik Pembelian Melalui BPB agar tidak bentrok). Aritmetika
     & jurnal: lihat header js/pages/pembelian-langsung.js.
     5 baris sample DBM: 2 belum dibayar penuh Tangerang, 3
     Semarang (2 sudah lunas -> Hapus nonaktif). */

  /* ===== Pembelian dari PO (Supplier & Pembelian > Daftar
     Transaksi > Pembelian dari PO) — faktur pembelian yang dibuat
     DARI Purchase Order (DATA.purchaseOrder): header & barang ikut
     PO, per baris Qty. Pesan readonly, Qty (difakturkan) editable
     <= Qty Pesan, Qty. Belum Terima = selisihnya. Aritmetika &
     jurnal = pola Pembelian Langsung (lihat header js/pages/
     pembelian-po.js). Hapus di list NONAKTIF bila pembayaran > 0.
     No. 26/PU/{kode}/08/{urut} — berbagi urutan dengan Pembelian
     Melalui BPB & Pembelian Langsung. 2 baris sample dari PO DBM
     (1 lunas -> Hapus nonaktif). */

  /* ===== Pengajuan Pembayaran (Supplier & Pembelian > Daftar
     Transaksi > Pengajuan Pembayaran) — usulan pembayaran hutang
     ke supplier: pilih supplier, centang faktur outstanding-nya
     (gabungan Pembelian Melalui BPB + Pembelian Langsung +
     Pembelian dari PO yang sisa > 0), isi Pembayaran per faktur
     (di-clamp <= sisa) + Reminder. No. "PYR/{kode cabang}/2608
     {urut 4 digit}" — dropdown No. Otomatis PY{kode} memilih
     counter cabang. 2 baris sample terkait faktur DBM yang
     masih outstanding. */

  /* ===== Master Berat Produk (Persediaan Barang > Master &
     Setting > Berat Produk) — konversi isi box, berat (Kg) dan
     dimensi (cm) per barang; volume form = P x L x T / 1.000.000
     m3, kolom list "Volume m3" menampilkan nilai cm3 (quirk layar
     MASERP asli, direplikasi). Satu baris per kode barang —
     barang yang sudah ada tidak muncul lagi di picker Tambah. */
  beratProduk:[
    {kode:'BRG-001', konversi:6, berat:12.5, panjang:32, lebar:24, tinggi:28},
    {kode:'BRG-002', konversi:1, berat:50, panjang:80, lebar:50, tinggi:15},
    {kode:'BRG-003', konversi:1, berat:5, panjang:40, lebar:25, tinggi:10},
    {kode:'BRG-004', konversi:20, berat:20.4, panjang:45, lebar:35, tinggi:22},
    {kode:'BRG-005', konversi:40, berat:3.8, panjang:54, lebar:33, tinggi:18},
    {kode:'BRG-006', konversi:12, berat:9.6, panjang:38, lebar:26, tinggi:24},
  ],

  pengajuanPembayaran:[
    {no:'PYR/HO/26080002', kodeCabang:'HO', supplier:'PT Sumber Pangan Nusantara', tgl:'25/08/2026',
      keterangan:'Pengajuan pembayaran faktur minyak goreng jatuh tempo Oktober',
      fakturs:[
        {noFaktur:'26/PU/HO/08/00005', tglFaktur:'12/08/2026', tglJthTempo:'11/10/2026', kurs:1, reminder:'05/10/2026', dipilih:true, pembayaran:5258250, sisa:5258250},
      ],
      jumlah:5258250, userInput:'sidik', tglInput:'25/08/2026 09:35:18'},
    {no:'PYR/TGR/26080001', kodeCabang:'TGR', supplier:'CV Karya Abadi', tgl:'18/08/2026',
      keterangan:'Pengajuan pembayaran tiket perjalanan dinas Agustus',
      fakturs:[
        {noFaktur:'26/PU/TGR/08/00002', tglFaktur:'10/08/2026', tglJthTempo:'24/08/2026', kurs:1, reminder:'22/08/2026', dipilih:true, pembayaran:4908000, sisa:4908000},
      ],
      jumlah:4908000, userInput:'sidik', tglInput:'18/08/2026 14:02:51'},
  ],

  pembelianPO:[
    {no:'26/PU/HO/08/00006', cabang:'Head Office', noPO:'26/PO/HO/08/00010',
      supplier:'PT Wilmar Nabati Indonesia', supplierNoFaktur:'INV/WNI/08/0090',
      tglFaktur:'20/08/2026', syaratBayar:'Kredit 45 Hari', tglJthTempo:'04/10/2026',
      gudang:'Gudang Utama-HO', jurnal:'JURNAL PEMBELIAN KREDIT (IDR)',
      alamatPengiriman:'Jl. Ir. H. Juanda No. 88, Bandung',
      keterangan:'Faktur penuh PO gula pasir stok Jabar', kurs:1, ppnMode:'eksklusif',
      diskon1:0, diskon1Amount:0, diskon2:0, diskon2Amount:0,
      dpp:7350000, pajak11:'PPN11', ppnAmount:808500, pphKode:'', pphPersen:0, pphAmount:0,
      ongkosAngkut:0, jumlahTotal:8158500, sisaJumlah:0, pembayaran:8158500,
      uangMukaTipe:'Oldest', sisaUangMuka:4079250, uangMukaPakai:0, jurnalMode:'otomatis',
      items:[
        {kode:'BRG-002', nama:'Gula Pasir Gulaku 1kg', batch:'GP-2607-114', qtyPesan:500, qty:500, satuan:'Karung', hargaBeli:15000, feeDistribusi:2, budgetDiskon:0, totalDisc:2, discBarang:150000, jumlah:7350000},
      ],
      jurnalAkun:[
        {kodeAkun:'1130001', namaAkun:'Persediaan', keterangan:'26/PO/HO/08/00010', debit:7350000, kredit:0},
        {kodeAkun:'1140002', namaAkun:'PPN Masukan', keterangan:'26/PO/HO/08/00010', debit:808500, kredit:0},
        {kodeAkun:'2110001', namaAkun:'Hutang Usaha', keterangan:'26/PO/HO/08/00010', debit:0, kredit:8158500},
      ],
      userInput:'sidik', tglInput:'20/08/2026 13:05:27'},
    {no:'26/PU/HO/08/00005', cabang:'Head Office', noPO:'26/PO/HO/08/00011',
      supplier:'PT Sumber Pangan Nusantara', supplierNoFaktur:'INV/SPN/08/0244',
      tglFaktur:'12/08/2026', syaratBayar:'Kredit 60 Hari', tglJthTempo:'11/10/2026',
      gudang:'Gudang Utama-HO', jurnal:'JURNAL PEMBELIAN KREDIT (IDR)',
      alamatPengiriman:'Jl. Raya Industri No. 10, Kawasan Pergudangan Cakung, Jakarta Timur',
      keterangan:'Faktur penuh PO minyak goreng sembako gudang utama', kurs:1, ppnMode:'eksklusif',
      diskon1:0, diskon1Amount:0, diskon2:0, diskon2Amount:0,
      dpp:4750000, pajak11:'PPN11', ppnAmount:522500, pphKode:'PPH 22 (0.3)', pphPersen:0.3, pphAmount:14250,
      ongkosAngkut:0, jumlahTotal:5258250, sisaJumlah:5258250, pembayaran:0,
      uangMukaTipe:'Oldest', sisaUangMuka:5258250, uangMukaPakai:0, jurnalMode:'otomatis',
      items:[
        {kode:'BRG-001', nama:'Minyak Goreng Sunco 2L', batch:'MG-2608-021', qtyPesan:200, qty:200, satuan:'Dus', hargaBeli:25000, feeDistribusi:5, budgetDiskon:0, totalDisc:5, discBarang:250000, jumlah:4750000},
      ],
      jurnalAkun:[
        {kodeAkun:'1130001', namaAkun:'Persediaan', keterangan:'26/PO/HO/08/00011', debit:4750000, kredit:0},
        {kodeAkun:'1140002', namaAkun:'PPN Masukan', keterangan:'26/PO/HO/08/00011', debit:522500, kredit:0},
        {kodeAkun:'2110001', namaAkun:'Hutang Usaha', keterangan:'26/PO/HO/08/00011', debit:0, kredit:5258250},
        {kodeAkun:'1140003', namaAkun:'Uang Muka PPH 22', keterangan:'PPh dipotong PPH 22 (0.3)', debit:0, kredit:14250},
      ],
      userInput:'sidik', tglInput:'12/08/2026 10:47:52'},
  ],

  pembelianLangsung:[
    {no:'26/PU/TGR/08/00002', cabang:'Tangerang', supplier:'CV Karya Abadi', supplierNoFaktur:'546',
      tglFaktur:'10/08/2026', syaratBayar:'Kredit 14 Hari', tglJthTempo:'24/08/2026',
      gudang:'Non Stock Tangerang', jurnal:'JURNAL PEMBELIAN KREDIT (IDR)', alamatPengiriman:'',
      penerimaanKonsinyasi:false,
      keterangan:'Raynaldy Kent & Sarah Aulia / CGK - SUB / 07 Agustus 2026; Suhaeni / SUB - CGK / 01 Juli 2026',
      kurs:1, ppnMode:'tidak', diskon1:0, diskon1Amount:0, diskon2:0, diskon2Amount:0,
      dpp:4908000, pajak11:'', ppnAmount:0, pphKode:'', pphPersen:0, pphAmount:0,
      ongkosAngkut:0, jumlahTotal:4908000, sisaJumlah:4908000, pembayaran:0,
      uangMukaTipe:'Oldest', sisaUangMuka:0, uangMukaPakai:0, jurnalMode:'otomatis',
      items:[
        {kode:'', nama:'Tiket perjalanan dinas Raynaldy Kent & Sarah Aulia / CGK - SUB / 07 Agustus 2026', batch:'', qty:1, satuan:'UNIT', hargaBeli:3348000, feeDistribusi:0, budgetDiskon:0, totalDisc:0, discBarang:0, jumlah:3348000},
        {kode:'', nama:'Tiket perjalanan dinas Suhaeni / SUB - CGK / 01 Juli 2026', batch:'', qty:1, satuan:'UNIT', hargaBeli:1560000, feeDistribusi:0, budgetDiskon:0, totalDisc:0, discBarang:0, jumlah:1560000},
      ],
      jurnalAkun:[
        {kodeAkun:'5210002', namaAkun:'Biaya Transportasi & Logistik', keterangan:'546', debit:4908000, kredit:0},
        {kodeAkun:'2110001', namaAkun:'Hutang Usaha', keterangan:'546', debit:0, kredit:4908000},
      ],
      userInput:'sidik', tglInput:'10/08/2026 10:22:31'},
    {no:'26/PU/TGR/08/00001', cabang:'Tangerang', supplier:'UD Sumber Makmur', supplierNoFaktur:'INV/USM/08/117',
      tglFaktur:'01/08/2026', syaratBayar:'Kredit 30 Hari', tglJthTempo:'31/08/2026',
      gudang:'Non Stock Tangerang', jurnal:'JURNAL PEMBELIAN KREDIT (IDR)', alamatPengiriman:'',
      penerimaanKonsinyasi:false, keterangan:'Sewa tenda & perlengkapan event pasar murah Tangerang',
      kurs:1, ppnMode:'tidak', diskon1:0, diskon1Amount:0, diskon2:0, diskon2Amount:0,
      dpp:3270000, pajak11:'', ppnAmount:0, pphKode:'', pphPersen:0, pphAmount:0,
      ongkosAngkut:0, jumlahTotal:3270000, sisaJumlah:3270000, pembayaran:0,
      uangMukaTipe:'Oldest', sisaUangMuka:0, uangMukaPakai:0, jurnalMode:'otomatis',
      items:[
        {kode:'', nama:'Sewa tenda + meja kursi event pasar murah (3 hari)', batch:'', qty:1, satuan:'UNIT', hargaBeli:3270000, feeDistribusi:0, budgetDiskon:0, totalDisc:0, discBarang:0, jumlah:3270000},
      ],
      jurnalAkun:[
        {kodeAkun:'5210002', namaAkun:'Biaya Transportasi & Logistik', keterangan:'INV/USM/08/117', debit:3270000, kredit:0},
        {kodeAkun:'2110001', namaAkun:'Hutang Usaha', keterangan:'INV/USM/08/117', debit:0, kredit:3270000},
      ],
      userInput:'sidik', tglInput:'01/08/2026 09:05:12'},
    {no:'26/PU/SMG/08/00003', cabang:'Semarang', supplier:'CV Distribusi Sentosa', supplierNoFaktur:'HTL/0821',
      tglFaktur:'21/08/2026', syaratBayar:'Kredit 14 Hari', tglJthTempo:'04/09/2026',
      gudang:'Non Stock Semarang', jurnal:'JURNAL PEMBELIAN KREDIT (IDR)', alamatPengiriman:'',
      penerimaanKonsinyasi:false, keterangan:'Akomodasi hotel kunjungan audit gudang Semarang',
      kurs:1, ppnMode:'tidak', diskon1:0, diskon1Amount:0, diskon2:0, diskon2Amount:0,
      dpp:490000, pajak11:'', ppnAmount:0, pphKode:'', pphPersen:0, pphAmount:0,
      ongkosAngkut:0, jumlahTotal:490000, sisaJumlah:490000, pembayaran:0,
      uangMukaTipe:'Oldest', sisaUangMuka:0, uangMukaPakai:0, jurnalMode:'otomatis',
      items:[
        {kode:'', nama:'Kamar hotel 1 malam (audit gudang Semarang)', batch:'', qty:1, satuan:'UNIT', hargaBeli:490000, feeDistribusi:0, budgetDiskon:0, totalDisc:0, discBarang:0, jumlah:490000},
      ],
      jurnalAkun:[
        {kodeAkun:'5210002', namaAkun:'Biaya Transportasi & Logistik', keterangan:'HTL/0821', debit:490000, kredit:0},
        {kodeAkun:'2110001', namaAkun:'Hutang Usaha', keterangan:'HTL/0821', debit:0, kredit:490000},
      ],
      userInput:'sidik', tglInput:'21/08/2026 14:41:09'},
    {no:'26/PU/SMG/08/00002', cabang:'Semarang', supplier:'PT Mayora Distribusi', supplierNoFaktur:'INV/MYR/08/0552',
      tglFaktur:'03/08/2026', syaratBayar:'Kredit 30 Hari', tglJthTempo:'02/09/2026',
      gudang:'Gudang Semarang', jurnal:'JURNAL PEMBELIAN KREDIT (IDR)', alamatPengiriman:'Gudang Semarang',
      penerimaanKonsinyasi:false, keterangan:'Pembelian langsung stok biskuit promo Agustus',
      kurs:1, ppnMode:'eksklusif', diskon1:0, diskon1Amount:0, diskon2:0, diskon2Amount:0,
      dpp:5770590.1, pajak11:'PPN11', ppnAmount:634764.91, pphKode:'', pphPersen:0, pphAmount:0,
      ongkosAngkut:0, jumlahTotal:6405355.01, sisaJumlah:0, pembayaran:6405355.01,
      uangMukaTipe:'Oldest', sisaUangMuka:0, uangMukaPakai:0, jurnalMode:'otomatis',
      items:[
        {kode:'BRG-005', nama:'Mie Instan Indomie Goreng (karton promo)', batch:'MI-2608-07', qty:415, satuan:'Dus', hargaBeli:13905, feeDistribusi:0, budgetDiskon:0, totalDisc:0, discBarang:0, jumlah:5770575},
      ],
      jurnalAkun:[
        {kodeAkun:'1130001', namaAkun:'Persediaan', keterangan:'INV/MYR/08/0552', debit:5770590.1, kredit:0},
        {kodeAkun:'1140002', namaAkun:'PPN Masukan', keterangan:'INV/MYR/08/0552', debit:634764.91, kredit:0},
        {kodeAkun:'2110001', namaAkun:'Hutang Usaha', keterangan:'INV/MYR/08/0552', debit:0, kredit:6405355.01},
      ],
      userInput:'sidik', tglInput:'03/08/2026 08:55:47'},
    {no:'26/PU/SMG/08/00001', cabang:'Semarang', supplier:'PT Indofood Distribusi', supplierNoFaktur:'INV/IDF/08/0031',
      tglFaktur:'01/08/2026', syaratBayar:'CBD', tglJthTempo:'01/08/2026',
      gudang:'Non Stock Semarang', jurnal:'JURNAL PEMBELIAN CBD (IDR)', alamatPengiriman:'',
      penerimaanKonsinyasi:false, keterangan:'Pembelian tunai sample produk baru utk tim sales',
      kurs:1, ppnMode:'tidak', diskon1:0, diskon1Amount:0, diskon2:0, diskon2Amount:0,
      dpp:2158200, pajak11:'', ppnAmount:0, pphKode:'', pphPersen:0, pphAmount:0,
      ongkosAngkut:0, jumlahTotal:2158200, sisaJumlah:0, pembayaran:2158200,
      uangMukaTipe:'Oldest', sisaUangMuka:0, uangMukaPakai:0, jurnalMode:'otomatis',
      items:[
        {kode:'', nama:'Sample produk baru (paket display sales)', batch:'', qty:1, satuan:'Pack', hargaBeli:2158200, feeDistribusi:0, budgetDiskon:0, totalDisc:0, discBarang:0, jumlah:2158200},
      ],
      jurnalAkun:[
        {kodeAkun:'5210002', namaAkun:'Biaya Transportasi & Logistik', keterangan:'INV/IDF/08/0031', debit:2158200, kredit:0},
        {kodeAkun:'1100002', namaAkun:'Kas Besar', keterangan:'INV/IDF/08/0031', debit:0, kredit:2158200},
      ],
      userInput:'sidik', tglInput:'01/08/2026 11:14:26'},
  ],

  returPenerimaanBarang:[
    {no:'26/RPB-0000000002', noBPB:'26/BPB/HO/08/00002', noPO:'26/PO/HO/08/00010',
      tglPO:'21/08/2026', tglRetur:'24/08/2026', cabang:'Head Office',
      supplier:'PT Wilmar Nabati Indonesia', noSJSupplier:'SJ/WNI/08/0102',
      alamatPengiriman:'Jl. Ir. H. Juanda No. 88, Bandung',
      penerimaanKonsinyasi:false, keterangan:'Retur 20 karung gula pasir — karung sobek & lembab saat diterima',
      kurs:1, ppnMode:'eksklusif', adaTagihan:false,
      items:[
        {kode:'BRG-002', nama:'Gula Pasir Gulaku 1kg', batch:'GP-2607-114', barcode:'8992761002102', satuan:'Karung', qtyRetur:20, qtyTerima:500, hargaBeli:15000},
      ],
      jurnalAkun:[
        {kodeAkun:'2110001', namaAkun:'Hutang Usaha', keterangan:'Retur PB 26/BPB/HO/08/00002', debit:333000, kredit:0},
        {kodeAkun:'1130001', namaAkun:'Persediaan', keterangan:'Retur PB 26/BPB/HO/08/00002', debit:0, kredit:300000},
        {kodeAkun:'1140002', namaAkun:'PPN Masukan', keterangan:'Retur PB 26/BPB/HO/08/00002', debit:0, kredit:33000},
      ],
      userInput:'sidik', tglInput:'24/08/2026 11:26:40'},
    {no:'26/RPB-0000000001', noBPB:'26/BPB/HO/08/00001', noPO:'26/PO/HO/08/00011',
      tglPO:'09/08/2026', tglRetur:'12/08/2026', cabang:'Head Office',
      supplier:'PT Sumber Pangan Nusantara', noSJSupplier:'SJ/SPN/08/0231',
      alamatPengiriman:'Jl. Raya Industri No. 10, Kawasan Pergudangan Cakung, Jakarta Timur',
      penerimaanKonsinyasi:false, keterangan:'Retur 10 dus minyak goreng — kemasan bocor (kerusakan ekspedisi)',
      kurs:1, ppnMode:'eksklusif', adaTagihan:true,
      items:[
        {kode:'BRG-001', nama:'Minyak Goreng Sunco 2L', batch:'MG-2608-021', barcode:'8993115331207', satuan:'Dus', qtyRetur:10, qtyTerima:200, hargaBeli:25000},
      ],
      jurnalAkun:[
        {kodeAkun:'2110001', namaAkun:'Hutang Usaha', keterangan:'Retur PB 26/BPB/HO/08/00001', debit:277500, kredit:0},
        {kodeAkun:'1130001', namaAkun:'Persediaan', keterangan:'Retur PB 26/BPB/HO/08/00001', debit:0, kredit:250000},
        {kodeAkun:'1140002', namaAkun:'PPN Masukan', keterangan:'Retur PB 26/BPB/HO/08/00001', debit:0, kredit:27500},
      ],
      userInput:'sidik', tglInput:'12/08/2026 09:48:15'},
  ],

  permintaanPembelian:[
    {no:'26/PR-HO/08/00001', tgl:'19/08/2026', cabang:'Head Office', approvedBy:'',
      keterangan:'Untuk kebutuhan Pendukung Aktifitas Pemindahan barang dan Bongkar Muat Barang di Warehouse PT Distriversa Buanamas Cabang Semarang',
      gudang:'Non Stock Head Office', dipakaiPO:false, tutupPr:false,
      items:[
        {kode:'AK-00075', nama:'Forklift :\nVery Narrow Aisle\nMerk NIULI\nKapasitas 2 Ton, Tinggi Angkat 3 Meter', qty:1, um:'UNIT', hargaBeli:0, tglPerlu:'01/09/2026'},
      ],
      userInput:'sidik', tglInput:'19/08/2026 09:14:22'},
    {no:'26/PR-HO/08/00002', tgl:'26/08/2026', cabang:'Head Office', approvedBy:'',
      keterangan:'Farizon F3E (V3E Super Cargo) Electric Pick-up\nSupplier: Farizon Indonesia Dealer\nBattery: Lithium Iron Phosphate\nMax Power / Torque: 110 kW / 260 Nm\nCargo Length: 3.7 meters\nPayload Capacity: Up to 2,000 kg\nCharging: DC Fast Charging 100 kW',
      gudang:'Non Stock Head Office', dipakaiPO:false, tutupPr:false,
      items:[
        {kode:'AK-00082', nama:'Farizon F3E (V3E Super Cargo) Electric Pick-up\nBattery: Lithium Iron Phosphate\nMax Power / Torque: 110 kW / 260 Nm\nCargo Length: 3.7 m, Payload: 2.000 kg', qty:1, um:'UNIT', hargaBeli:0, tglPerlu:'15/09/2026'},
      ],
      userInput:'sidik', tglInput:'26/08/2026 13:40:05'},
    {no:'26/PR-HO/07/00001', tgl:'02/07/2026', cabang:'Head Office', approvedBy:'',
      keterangan:'Kebutuhan ATK dan supplies kantor Head Office periode Juli 2026',
      gudang:'Non Stock Head Office', dipakaiPO:false, tutupPr:false,
      items:[{kode:'', nama:'ATK & supplies kantor (paket bulanan)', qty:1, um:'Pack', hargaBeli:1500000, tglPerlu:'10/07/2026'}],
      userInput:'sidik', tglInput:'02/07/2026 08:30:00'},
    {no:'26/PR-HO/06/00002', tgl:'08/06/2026', cabang:'Head Office', approvedBy:'',
      keterangan:'Penggantian rak penyimpanan Gudang Utama-HO (5 unit heavy duty rack)',
      gudang:'Non Stock Head Office', dipakaiPO:false, tutupPr:false,
      items:[{kode:'', nama:'Heavy Duty Rack 4 tingkat, kapasitas 1 ton/level', qty:5, um:'UNIT', hargaBeli:4500000, tglPerlu:'22/06/2026'}],
      userInput:'sidik', tglInput:'08/06/2026 10:05:41'},
    {no:'26/PR-HO/06/00003', tgl:'17/06/2026', cabang:'Head Office', approvedBy:'',
      keterangan:'Pembelian timbangan digital gudang untuk QC penerimaan barang',
      gudang:'Non Stock Head Office', dipakaiPO:false, tutupPr:false,
      items:[{kode:'', nama:'Timbangan digital platform 500 kg', qty:2, um:'UNIT', hargaBeli:3250000, tglPerlu:'30/06/2026'}],
      userInput:'sidik', tglInput:'17/06/2026 14:12:19'},
    {no:'26/PR-HO/01/00009', tgl:'21/01/2026', cabang:'Head Office', approvedBy:'Manager Pembelian',
      keterangan:'Pengadaan seragam dan APD tim gudang 2026 (dibatalkan - anggaran dialihkan)',
      gudang:'Non Stock Head Office', dipakaiPO:false, tutupPr:true,
      items:[{kode:'', nama:'Seragam + APD tim gudang (paket)', qty:40, um:'Pack', hargaBeli:350000, tglPerlu:'10/02/2026'}],
      userInput:'sidik', tglInput:'21/01/2026 09:55:03'},
    {no:'25/PR-HO/11/00001', tgl:'05/11/2025', cabang:'Head Office', approvedBy:'',
      keterangan:'Perbaikan dan sparepart hand pallet gudang (roda + hydraulic seal kit)',
      gudang:'Non Stock Head Office', dipakaiPO:false, tutupPr:false,
      items:[{kode:'', nama:'Sparepart hand pallet: roda PU + seal kit hydraulic', qty:6, um:'Pack', hargaBeli:850000, tglPerlu:'20/11/2025'}],
      userInput:'sidik', tglInput:'05/11/2025 11:20:37'},
    {no:'25/PR-HO/08/00002', tgl:'14/08/2025', cabang:'Head Office', approvedBy:'',
      keterangan:'Pembelian AC split 2 PK untuk ruang server dan ruang meeting HO',
      gudang:'Non Stock Head Office', dipakaiPO:false, tutupPr:false,
      items:[{kode:'', nama:'AC Split 2 PK inverter', qty:3, um:'UNIT', hargaBeli:7200000, tglPerlu:'29/08/2025'}],
      userInput:'sidik', tglInput:'14/08/2025 15:44:58'},
    {no:'25/PR-HO/04/00002', tgl:'09/04/2025', cabang:'Head Office', approvedBy:'',
      keterangan:'Pengadaan CCTV tambahan area loading dock Gudang Utama-HO',
      gudang:'Non Stock Head Office', dipakaiPO:false, tutupPr:false,
      items:[{kode:'', nama:'CCTV outdoor 4MP + instalasi (8 titik)', qty:8, um:'UNIT', hargaBeli:1250000, tglPerlu:'25/04/2025'}],
      userInput:'sidik', tglInput:'09/04/2025 10:02:14'},
  ],

  uangMukaSupplier:[
    {no:'26/UMS-HO/08/00002', tgl:'27/08/2026', cabang:'Head Office',
      supplier:'PT Wilmar Nabati Indonesia', noPO:'26/PO/HO/08/00010',
      keterangan:'DP 50% gula pasir - transfer via bank BCA', syaratBayar:'Kredit 45 Hari',
      tglJthTempo:'11/10/2026', jurnal:'JURNAL PEMBELIAN KREDIT (IDR)',
      ppnMode:'eksklusif', tglFakturPajak:'27/08/2026', tanpaFakturPajak:false,
      noFakturPajak:'0100002608000102', noKmk:'', tglKmk:'',
      dpPersen:50, pphKode:'', pphPersen:0,
      items:[
        {keterangan:'Gula Pasir Gulaku 1kg', qty:500, jumlah:7350000},
      ],
      subtotal:7350000, dpAmount:3675000, dpp:3675000, dpTertagih:0,
      pajak11:'PPN11', ppnAmount:404250, pphAmount:0, jumlahTotal:4079250,
      jurnalAkun:[
        {kodeAkun:'1140001', namaAkun:'Uang Muka Pembelian', keterangan:'Uang Muka 26/PO/HO/08/00010', debit:3675000, kredit:0},
        {kodeAkun:'1140002', namaAkun:'PPN Masukan', keterangan:'Uang Muka 26/PO/HO/08/00010', debit:404250, kredit:0},
        {kodeAkun:'2110001', namaAkun:'Hutang Usaha', keterangan:'Uang Muka 26/PO/HO/08/00010', debit:0, kredit:4079250},
      ],
      tglInput:'27/08/2026 10:12:40', userInput:'sidik', tglEdit:'', userEdit:''},
    {no:'26/UMS-HO/08/00001', tgl:'20/08/2026', cabang:'Head Office',
      supplier:'PT Sumber Pangan Nusantara', noPO:'26/PO/HO/08/00011',
      keterangan:'di transfer via bank BCA', syaratBayar:'Kredit 30 Hari',
      tglJthTempo:'19/09/2026', jurnal:'JURNAL PEMBELIAN KREDIT (IDR)',
      ppnMode:'eksklusif', tglFakturPajak:'20/08/2026', tanpaFakturPajak:false,
      noFakturPajak:'0100002608000088', noKmk:'', tglKmk:'',
      dpPersen:100, pphKode:'PPH 22 (0.3)', pphPersen:0.3,
      items:[
        {keterangan:'Minyak Goreng Sunco 2L', qty:200, jumlah:4750000},
      ],
      subtotal:4750000, dpAmount:4750000, dpp:4750000, dpTertagih:0,
      pajak11:'PPN11', ppnAmount:522500, pphAmount:14250, jumlahTotal:5258250,
      jurnalAkun:[
        {kodeAkun:'1140001', namaAkun:'Uang Muka Pembelian', keterangan:'Uang Muka 26/PO/HO/08/00011', debit:4750000, kredit:0},
        {kodeAkun:'1140002', namaAkun:'PPN Masukan', keterangan:'Uang Muka 26/PO/HO/08/00011', debit:522500, kredit:0},
        {kodeAkun:'2110001', namaAkun:'Hutang Usaha', keterangan:'Uang Muka 26/PO/HO/08/00011', debit:0, kredit:5258250},
        {kodeAkun:'1140003', namaAkun:'Uang Muka PPH 22', keterangan:'PPh dipotong PPH 22 (0.3)', debit:0, kredit:14250},
      ],
      tglInput:'20/08/2026 14:35:12', userInput:'sidik', tglEdit:'', userEdit:''},
  ],

  pembelianAktivaTetap:[
    {no:'26/FAB/HO/08/00001', cabang:'Head Office', tgl:'20/08/2026',
      syaratBayar:'Kredit 30 Hari', tglJthTempo:'19/09/2026', tipeTransaksi:'Beli Kredit',
      supplier:'PT Roda Mas Trading', supplierKode:'5026',
      kirim:'Kirim ke Head Office - Jl. Raya Industri No. 88, Jakarta Utara',
      keterangan:'Pembelian 2 unit laptop tim Finance & Accounting',
      items:[
        {kodeAset:'', namaAset:'Laptop Lenovo ThinkPad E14 (2 unit)', jurnalKode:2, hargaBeli:15000000, disc:0, diskon:0, jumlah:15000000},
      ],
      ppnMode:'eksklusif', pajak11:'PPN11', ppnAmount:1650000,
      diskon1:0, diskon1Amount:0, diskon2:0, diskon2Amount:0, dpp:15000000,
      uangMukaTipe:'Oldest', sisaUangMuka:0, uangMukaPakai:0,
      jumlahTotal:16650000, sisaJumlah:16650000,
      jurnalAkun:[
        {kodeAkun:'1510004', namaAkun:'Peralatan Kantor', keterangan:'Pembelian 2 unit laptop tim Finance & Accounting', debit:15000000, kredit:0},
        {kodeAkun:'1140002', namaAkun:'PPN Masukan', keterangan:'Pembelian 2 unit laptop tim Finance & Accounting', debit:1650000, kredit:0},
        {kodeAkun:'2110001', namaAkun:'Hutang Usaha', keterangan:'Pembelian 2 unit laptop tim Finance & Accounting', debit:0, kredit:16650000},
      ]},
    {no:'26/FAB/SBY/08/00001', cabang:'Surabaya', tgl:'12/08/2026',
      syaratBayar:'CBD.', tglJthTempo:'12/08/2026', tipeTransaksi:'Beli Tunai',
      supplier:'CV Anugerah Logistik', supplierKode:'5025',
      kirim:'Kirim ke Cabang Surabaya - Jl. Rungkut Industri No. 12',
      keterangan:'Pembelian motor operasional kurir cabang Surabaya',
      items:[
        {kodeAset:'', namaAset:'Motor Honda Vario 125 th 2026', jurnalKode:4, hargaBeli:22000000, disc:0, diskon:0, jumlah:22000000},
      ],
      ppnMode:'tidak', pajak11:'', ppnAmount:0,
      diskon1:0, diskon1Amount:0, diskon2:0, diskon2Amount:0, dpp:22000000,
      uangMukaTipe:'Oldest', sisaUangMuka:0, uangMukaPakai:0,
      jumlahTotal:22000000, sisaJumlah:22000000,
      jurnalAkun:[
        {kodeAkun:'1510003', namaAkun:'Kendaraan', keterangan:'Pembelian motor operasional kurir cabang Surabaya', debit:22000000, kredit:0},
        {kodeAkun:'1100002', namaAkun:'Kas Besar', keterangan:'Pembelian motor operasional kurir cabang Surabaya', debit:0, kredit:22000000},
      ]},
  ],

  /* Transaksi A.P. — menu Supplier & Pembelian > Daftar Transaksi >
     Transaksi A.P. (lihat js/pages/transaksi-ap.*). 1 baris = 1 dokumen
     transaksi A.P. manual. `jurnalKode` menaut ke DATA.jurnalAP (master
     Jurnal A.P.), `supplierKode/Nama` ke DATA.suppliers, `rincian[]` =
     tab "Rincian Transaksi A.P." (tipe/tglJthTempo/crc/kurs/nominal),
     `jurnalAkun[]` = tab "Rincian Jurnal Akun" (dibangun otomatis dari
     master Jurnal A.P.: akunDebit(D) = akunKredit(K) senilai jumlah).
     No. Transaksi format screenshot "AP/{kode cabang}/{YY}{MM}{urut}"
     — dokumen baru selalu di-unshift() ke depan array (terbaru di
     atas), tapGenerateNo() menghitung urut per cabang dari jumlah
     baris cabang itu. 3 baris sample memakai 3 jurnal di DATA.jurnalAP
     supaya list, form Lihat/Ubah, dan kedua tab langsung ada isinya. */
  transaksiAP:[
    {no:'AP/HO/260800002', noFaktur:'AP/HO/260800002', cabang:'Head Office', tgl:'21/08/2026',
      supplierKode:'5016', supplierNama:'PT Wilmar Nabati Indonesia', jurnalKode:3,
      keterangan:'Pph 23 - PT Wilmar Nabati Indonesia', noFakturSupplier:'INV/WNI/2026/0813',
      rincian:[{tipe:'Hutang', tglJthTempo:'20/09/2026', crc:'IDR', kurs:1, nominal:1250000}],
      jurnalMode:'otomatis',
      jurnalAkun:[
        {kodeAkun:'1100012', costCenter:'', namaAkun:'Bank BCA', keterangan:'PT Wilmar Nabati Indonesia', debit:1250000, kredit:0},
        {kodeAkun:'2120001', costCenter:'', namaAkun:'Hutang Pajak', keterangan:'PT Wilmar Nabati Indonesia', debit:0, kredit:1250000},
      ],
      jumlah:1250000},
    {no:'AP/HO/260800001', noFaktur:'AP/HO/260800001', cabang:'Head Office', tgl:'05/08/2026',
      supplierKode:'5015', supplierNama:'PT Sumber Pangan Nusantara', jurnalKode:1,
      keterangan:'Saldo Awal - PT Sumber Pangan Nusantara', noFakturSupplier:'',
      rincian:[{tipe:'Hutang', tglJthTempo:'04/09/2026', crc:'IDR', kurs:1, nominal:4500000}],
      jurnalMode:'otomatis',
      jurnalAkun:[
        {kodeAkun:'3200001', costCenter:'', namaAkun:'Laba Ditahan', keterangan:'PT Sumber Pangan Nusantara', debit:4500000, kredit:0},
        {kodeAkun:'2110001', costCenter:'', namaAkun:'Hutang Usaha', keterangan:'PT Sumber Pangan Nusantara', debit:0, kredit:4500000},
      ],
      jumlah:4500000},
    {no:'AP/SBY/260800001', noFaktur:'AP/SBY/260800001', cabang:'Surabaya', tgl:'03/08/2026',
      supplierKode:'5026', supplierNama:'PT Roda Mas Trading', jurnalKode:2,
      keterangan:'Saldo Awal Import - PT Roda Mas Trading', noFakturSupplier:'RMT-IMP-2607',
      rincian:[{tipe:'Hutang', tglJthTempo:'02/09/2026', crc:'IDR', kurs:1, nominal:8750000}],
      jurnalMode:'otomatis',
      jurnalAkun:[
        {kodeAkun:'3200001', costCenter:'', namaAkun:'Laba Ditahan', keterangan:'PT Roda Mas Trading', debit:8750000, kredit:0},
        {kodeAkun:'2110002', costCenter:'', namaAkun:'Hutang Pembelian Belum Terfaktur', keterangan:'PT Roda Mas Trading', debit:0, kredit:8750000},
      ],
      jumlah:8750000},
  ],

  /* Retur Pembelian — menu Supplier & Pembelian > Daftar Transaksi >
     Retur Pembelian (lihat js/pages/retur-pembelian.*). 1 baris = 1
     dokumen retur atas 1 Faktur Pembelian (noFakturPembelian menaut ke
     DATA.pembelianBPB — No. Retur juga ditulis balik ke field noReturPB
     faktur itu). items[] menyalin barang faktur (qtyFaktur = qty asli
     faktur, qty = qty yang diretur; batches[] disintesis karena faktur
     tidak menyimpan batch), jurnalAkun[] hasil "Buat Jurnal": Hutang
     Usaha 2110001(D) = Persediaan 1130001(K) + PPN Masukan 1140002(K).
     tipeTransaksi SENGAJA '' di 2 baris sample supaya kolom "Tipe
     Transaksi" tampil kosong persis screenshot (dokumen baru yang
     disimpan user mengisinya 'Nota Debit'). Supplier & barang memakai
     data DBM sendiri (screenshot memakai PT Satoria Aneka Industri,
     instalasi lain). */
  returPembelian:[
    {no:'26/RP-HO/08/00002', cabang:'Head Office', tipeTransaksi:'',
      tglFaktur:'21/08/2026', tglJthTempo:'21/08/2026',
      supplier:'PT Wilmar Nabati Indonesia', noFakturPembelian:'26/PU/HO/08/00002', supplierNoFaktur:'INV/WNI/08/0088-A',
      syaratBayar:'Jadikan Nota Debit', jurnal:'JURNAL PEMBELIAN KREDIT (IDR)',
      gudangKode:'00-GUU', alamatPengiriman:'Jl. Raya Industri No. 10, Kawasan Pergudangan Cakung, Jakarta Timur',
      items:[{kode:'BRG-002', nama:'Gula Pasir Gulaku 1kg', um:'Karung', qty:50, qtyFaktur:500, hargaBeli:15000,
        feeDistribusi:2, budgetDiskon:0, totalDisc:2, diskon:15000, jumlah:735000, pph:false, ppn:true,
        batches:[{no:'B0002G01', qty:50, ed:'16/07/2028'}]}],
      ppnMode:'eksklusif', mataUang:'IDR', tglFakturPajak:'21/08/2026', noFakturPajak:'04002600297302454',
      kurs:1, diskon1:0, diskon1Amount:0, diskon2:0, diskon2Amount:0, dpp:735000,
      pajak11:'PPN11', ppnAmount:80850, pphKode:'', pphPersen:0, pphAmount:0,
      jumlahTotal:815850, sisaTotal:815850,
      keterangan:'RETUR PEMBELIAN ATAS 26/PU/HO/08/00002 (PT WILMAR NABATI INDONESIA)',
      jurnalAkun:[
        {kodeAkun:'2110001', namaAkun:'Hutang Usaha', keterangan:'RETUR PEMBELIAN ATAS 26/PU/HO/08/00002 (PT WILMAR NABATI INDONESIA)', debit:815850, kredit:0},
        {kodeAkun:'1130001', namaAkun:'Persediaan Barang Dagang Jakarta', keterangan:'RETUR PEMBELIAN ATAS 26/PU/HO/08/00002 (PT WILMAR NABATI INDONESIA)', debit:0, kredit:735000},
        {kodeAkun:'1140002', namaAkun:'PPN Masukan', keterangan:'RETUR PEMBELIAN ATAS 26/PU/HO/08/00002 (PT WILMAR NABATI INDONESIA)', debit:0, kredit:80850},
      ]},
    {no:'26/RP-HO/08/00001', cabang:'Head Office', tipeTransaksi:'',
      tglFaktur:'21/08/2026', tglJthTempo:'21/08/2026',
      supplier:'PT Sumber Pangan Nusantara', noFakturPembelian:'26/PU/HO/08/00001', supplierNoFaktur:'INV/SPN/08/0231-A',
      syaratBayar:'Jadikan Nota Debit', jurnal:'JURNAL PEMBELIAN KREDIT (IDR)',
      gudangKode:'00-GUU', alamatPengiriman:'Jl. Raya Industri No. 10, Kawasan Pergudangan Cakung, Jakarta Timur',
      items:[{kode:'BRG-001', nama:'Minyak Goreng Sunco 2L', um:'Dus', qty:20, qtyFaktur:200, hargaBeli:25000,
        feeDistribusi:5, budgetDiskon:0, totalDisc:5, diskon:25000, jumlah:475000, pph:true, ppn:true,
        batches:[{no:'B0001G01', qty:20, ed:'16/07/2028'}]}],
      ppnMode:'eksklusif', mataUang:'IDR', tglFakturPajak:'21/08/2026', noFakturPajak:'04002600297302441',
      kurs:1, diskon1:0, diskon1Amount:0, diskon2:0, diskon2Amount:0, dpp:475000,
      pajak11:'PPN11', ppnAmount:52250, pphKode:'', pphPersen:0, pphAmount:0,
      jumlahTotal:527250, sisaTotal:527250,
      keterangan:'RETUR PEMBELIAN ATAS 26/PU/HO/08/00001 (PT SUMBER PANGAN NUSANTARA)',
      jurnalAkun:[
        {kodeAkun:'2110001', namaAkun:'Hutang Usaha', keterangan:'RETUR PEMBELIAN ATAS 26/PU/HO/08/00001 (PT SUMBER PANGAN NUSANTARA)', debit:527250, kredit:0},
        {kodeAkun:'1130001', namaAkun:'Persediaan Barang Dagang Jakarta', keterangan:'RETUR PEMBELIAN ATAS 26/PU/HO/08/00001 (PT SUMBER PANGAN NUSANTARA)', debit:0, kredit:475000},
        {kodeAkun:'1140002', namaAkun:'PPN Masukan', keterangan:'RETUR PEMBELIAN ATAS 26/PU/HO/08/00001 (PT SUMBER PANGAN NUSANTARA)', debit:0, kredit:52250},
      ]},
  ],
  salesman:[
    {nama:'Budi Santoso', area:'Jakarta', target:80000000, realisasi:61250000},
    {nama:'Andi Wijaya', area:'Surabaya', target:60000000, realisasi:38940000},
    {nama:'Citra Lestari', area:'Bandung', target:40000000, realisasi:27110000},
    {nama:'Dedi Kurniawan', area:'Medan', target:30000000, realisasi:19875000},
    {nama:'Eka Putri', area:'Makassar', target:25000000, realisasi:15420000},
    {nama:'Fajar Nugroho', area:'Semarang', target:20000000, realisasi:9870000},
    {nama:'M. Reza Wijaya', area:'Head Office', target:100000000, realisasi:78650000},
  ],
  /* Sales Order — menu Customer & Penjualan > Daftar Transaksi > Sales
     Order (lihat js/pages/sales-order.*). Setiap baris berisi seluruh
     field yang dipakai list ("No. SO"/"No. SP"/Customer/Wilayah/TS/Status
     Approval") MAUPUN form Tambah/Ubah/Lihat (header S.Office/Area/
     Layanan/Order Via, picker Customer/Principal/No.SQ/No.SP/No.DSC,
     3 checkbox CITO/SP Asli/SK ED, field CL/Piutang/Sisa CL, Konsinyasi/
     Keterangan/Is Guarantee/Pecah Faktur/toggle KG-Dimensi, dan tabel
     item 2-tingkat: baris ringkasan {kode,nama,um,qty,hna1,hnaXqty,
     potongan,dpp,typePpn,ppn,biayaKirim} + baris detail per-item
     {noBatch,tglKadaluarsa} — lihat komentar di sales-order.template.js
     utk penjelasan pilihan field detail & simplifikasi PPN). `ts` (Tahap
     Status alur kerja: Baru/Diproses/Dikirim/Selesai) SENGAJA dipisah
     dari `statusApproval` (Pending/Approved/Rejected) — 2 konsep berbeda
     sesuai instruksi. Customer/wilayah/principal semua memakai master
     DBM sendiri (DATA.customers/DATA.suppliers), TIDAK ada nama customer
     bertema farmasi. 14 baris disebar supaya representatif menguji
     kombinasi TS x Status Approval x flag-flag lain. */
  salesOrders:[
    {no:'26/SO/HO/08/00013', noSP:'SP/HO/08/00013', noSQ:'SQ/HO/08/00013', noDSC:'', customer:'Toko Sumber Rejeki', wilayah:'Jakarta', ts:'Baru', statusApproval:'Pending',
      sOffice:'Head Office', area:'Jakarta', layanan:'Reguler', orderVia:'Sales Rep', alamat:'Jl. Mangga Dua Raya No. 12, Jakarta Pusat', rayon:'Rayon Jakarta Pusat',
      principalKode:'5015', principalNama:'PT Sumber Pangan Nusantara', cito:false, spAsli:true, skEd:false, cl:50000000, piutang:18250000, sisaCl:31750000,
      konsinyasi:false, keterangan:'Order rutin bulanan Sembako', isGuarantee:false, pecahFaktur:false, ukuranBasis:'KG',
      items:[{kode:'BRG-001', nama:'Minyak Goreng Sunco 2L', um:'Dus', qty:50, hna1:25000, hnaXqty:1250000, potongan:25000, dpp:1225000, typePpn:'PPN 11%', ppn:134750, biayaKirim:50000, noBatch:'BT-260701-01', tglKadaluarsa:'2027-06-30'}],
      totalDpp:1225000, totalPpn:134750, totalBiayaKirim:50000, jumlahAkhir:1409750,
      tglSO:'08/08/2026', tglInput:'08/08/2026 09:10:12', userInput:'sidik', tglEdit:'', userEdit:''},
    {no:'26/SO/SBY/08/00007', noSP:'SP/SBY/08/00007', noSQ:'SQ/SBY/08/00007', noDSC:'DSC/SBY/08/00001', customer:'UD Makmur Jaya', wilayah:'Surabaya', ts:'Diproses', statusApproval:'Approved',
      sOffice:'Surabaya', area:'Surabaya', layanan:'Reguler', orderVia:'WhatsApp', alamat:'Jl. Raya Darmo No. 45, Surabaya', rayon:'Rayon Surabaya Kota',
      principalKode:'5016', principalNama:'PT Wilmar Nabati Indonesia', cito:false, spAsli:true, skEd:false, cl:35000000, piutang:9120000, sisaCl:25880000,
      konsinyasi:false, keterangan:'Restock Sembako gudang Surabaya', isGuarantee:false, pecahFaktur:false, ukuranBasis:'KG',
      items:[{kode:'BRG-002', nama:'Gula Pasir Gulaku 1kg', um:'Karung', qty:100, hna1:15000, hnaXqty:1500000, potongan:0, dpp:1500000, typePpn:'PPN 11%', ppn:165000, biayaKirim:30000, noBatch:'BT-260702-02', tglKadaluarsa:'2027-05-15'}],
      totalDpp:1500000, totalPpn:165000, totalBiayaKirim:30000, jumlahAkhir:1695000,
      tglSO:'08/08/2026', tglInput:'08/08/2026 10:22:40', userInput:'sidik', tglEdit:'09/08/2026 08:05:11', userEdit:'sidik'},
    {no:'26/SO/BDG/08/00005', tutupSo:true, noSP:'SP/BDG/08/00005', noSQ:'', noDSC:'', customer:'CV Berkah Abadi', wilayah:'Bandung', ts:'Dikirim', statusApproval:'Approved',
      sOffice:'Bandung', area:'Bandung', layanan:'Ekspedisi Pihak Ketiga', orderVia:'Telepon', alamat:'Jl. Soekarno Hatta No. 88, Bandung', rayon:'Rayon Bandung Kota',
      principalKode:'', principalNama:'', cito:false, spAsli:false, skEd:true, cl:20000000, piutang:4300000, sisaCl:15700000,
      konsinyasi:false, keterangan:'Order beras premium', isGuarantee:false, pecahFaktur:false, ukuranBasis:'Dimensi',
      items:[{kode:'BRG-003', nama:'Beras Premium Rojolele 5kg', um:'Karung', qty:20, hna1:60000, hnaXqty:1200000, potongan:20000, dpp:1180000, typePpn:'Non PKP', ppn:0, biayaKirim:20000, noBatch:'BT-260703-03', tglKadaluarsa:'2027-02-28'}],
      totalDpp:1180000, totalPpn:0, totalBiayaKirim:20000, jumlahAkhir:1200000,
      tglSO:'09/08/2026', tglInput:'09/08/2026 09:00:00', userInput:'sidik', tglEdit:'', userEdit:''},
    {no:'26/SO/MDN/08/00003', noSP:'SP/MDN/08/00003', noSQ:'SQ/MDN/08/00003', noDSC:'', customer:'Toko Anugrah', wilayah:'Medan', ts:'Selesai', statusApproval:'Approved',
      sOffice:'Medan', area:'Medan', layanan:'Reguler', orderVia:'Sales Rep', alamat:'Jl. Gatot Subroto No. 21, Medan', rayon:'Rayon Medan Kota',
      principalKode:'5020', principalNama:'PT Indofood Distribusi', cito:false, spAsli:true, skEd:false, cl:15000000, piutang:6600000, sisaCl:8400000,
      konsinyasi:false, keterangan:'Order Tepung Terigu bulanan', isGuarantee:false, pecahFaktur:true, ukuranBasis:'KG',
      items:[{kode:'BRG-004', nama:'Tepung Terigu Segitiga Biru 1kg', um:'Karung', qty:200, hna1:12000, hnaXqty:2400000, potongan:0, dpp:2400000, typePpn:'PPN 11%', ppn:264000, biayaKirim:40000, noBatch:'BT-260704-04', tglKadaluarsa:'2027-01-31'}],
      totalDpp:2400000, totalPpn:264000, totalBiayaKirim:40000, jumlahAkhir:2704000,
      tglSO:'06/08/2026', tglInput:'06/08/2026 08:40:20', userInput:'sidik', tglEdit:'10/08/2026 14:12:00', userEdit:'sidik'},
    {no:'26/SO/MKS/08/00002', noSP:'', noSQ:'', noDSC:'', customer:'UD Sinar Harapan', wilayah:'Makassar', ts:'Baru', statusApproval:'Rejected',
      sOffice:'Makassar', area:'Makassar', layanan:'Reguler', orderVia:'Email', alamat:'Jl. Perintis Kemerdekaan No. 5, Makassar', rayon:'Rayon Makassar Kota',
      principalKode:'', principalNama:'', cito:false, spAsli:false, skEd:false, cl:12000000, piutang:2150000, sisaCl:9850000,
      konsinyasi:false, keterangan:'Ditolak - customer status Non Aktif, cek ulang legalitas', isGuarantee:false, pecahFaktur:false, ukuranBasis:'KG',
      items:[{kode:'BRG-005', nama:'Mie Instan Indomie Goreng', um:'Dus', qty:500, hna1:2500, hnaXqty:1250000, potongan:0, dpp:1250000, typePpn:'PPN 11%', ppn:137500, biayaKirim:15000, noBatch:'BT-260705-05', tglKadaluarsa:'2027-04-30'}],
      totalDpp:1250000, totalPpn:137500, totalBiayaKirim:15000, jumlahAkhir:1402500,
      tglSO:'07/08/2026', tglInput:'07/08/2026 11:15:30', userInput:'sidik', tglEdit:'', userEdit:''},
    {no:'26/SO/HO/08/00012', noSP:'SP/HO/08/00012', noSQ:'SQ/HO/08/00012', noDSC:'', customer:'Toko Family Mart Jaya', wilayah:'Jakarta', ts:'Diproses', statusApproval:'Pending',
      sOffice:'Head Office', area:'Jakarta', layanan:'Express', orderVia:'Online', alamat:'Jl. Kelapa Gading Boulevard No. 9, Jakarta Utara', rayon:'Rayon Jakarta Utara',
      principalKode:'5023', principalNama:'PT Sasa Inti', cito:true, spAsli:true, skEd:false, cl:28000000, piutang:9870000, sisaCl:18130000,
      konsinyasi:false, keterangan:'CITO - kebutuhan stock display minggu ini', isGuarantee:true, pecahFaktur:false, ukuranBasis:'KG',
      items:[{kode:'BRG-006', nama:'Kecap Manis ABC 600ml', um:'Dus', qty:300, hna1:14000, hnaXqty:4200000, potongan:50000, dpp:4150000, typePpn:'PPN 11%', ppn:456500, biayaKirim:60000, noBatch:'BT-260706-06', tglKadaluarsa:'2027-03-31'}],
      totalDpp:4150000, totalPpn:456500, totalBiayaKirim:60000, jumlahAkhir:4666500,
      tglSO:'10/08/2026', tglInput:'10/08/2026 08:05:00', userInput:'sidik', tglEdit:'', userEdit:''},
    {no:'26/SO/SMG/08/00004', noSP:'SP/SMG/08/00004', noSQ:'', noDSC:'', customer:'CV Maju Terus', wilayah:'Semarang', ts:'Selesai', statusApproval:'Approved',
      sOffice:'Semarang', area:'Semarang', layanan:'Reguler', orderVia:'Telepon', alamat:'Jl. Pandanaran No. 33, Semarang', rayon:'Rayon Semarang Kota',
      principalKode:'', principalNama:'', cito:false, spAsli:true, skEd:false, cl:9000000, piutang:1200000, sisaCl:7800000,
      konsinyasi:false, keterangan:'Order Susu Kental Manis', isGuarantee:false, pecahFaktur:false, ukuranBasis:'KG',
      items:[{kode:'BRG-007', nama:'Susu Kental Manis Indomilk 380gr', um:'Dus', qty:150, hna1:16000, hnaXqty:2400000, potongan:0, dpp:2400000, typePpn:'Non PKP', ppn:0, biayaKirim:25000, noBatch:'BT-260707-07', tglKadaluarsa:'2027-07-31'}],
      totalDpp:2400000, totalPpn:0, totalBiayaKirim:25000, jumlahAkhir:2425000,
      tglSO:'05/08/2026', tglInput:'05/08/2026 13:30:00', userInput:'sidik', tglEdit:'11/08/2026 09:00:00', userEdit:'sidik'},
    {no:'26/SO/SBY/08/00006', noSP:'SP/SBY/08/00006', noSQ:'SQ/SBY/08/00006', noDSC:'', customer:'Toko Sejahtera', wilayah:'Surabaya', ts:'Dikirim', statusApproval:'Approved',
      sOffice:'Surabaya', area:'Surabaya', layanan:'Reguler', orderVia:'Sales Rep', alamat:'Jl. Kertajaya No. 67, Surabaya', rayon:'Rayon Surabaya Kota',
      principalKode:'5016', principalNama:'PT Wilmar Nabati Indonesia', cito:false, spAsli:true, skEd:false, cl:17500000, piutang:3120000, sisaCl:14380000,
      konsinyasi:false, keterangan:'Order Teh Celup mingguan', isGuarantee:false, pecahFaktur:false, ukuranBasis:'KG',
      items:[{kode:'BRG-008', nama:'Teh Celup Sariwangi 25s', um:'Dus', qty:200, hna1:10000, hnaXqty:2000000, potongan:0, dpp:2000000, typePpn:'PPN 11%', ppn:220000, biayaKirim:20000, noBatch:'BT-260708-08', tglKadaluarsa:'2027-08-31'}],
      totalDpp:2000000, totalPpn:220000, totalBiayaKirim:20000, jumlahAkhir:2240000,
      tglSO:'09/08/2026', tglInput:'09/08/2026 10:00:00', userInput:'sidik', tglEdit:'', userEdit:''},
    {no:'26/SO/HO/08/00011', noSP:'', noSQ:'', noDSC:'', customer:'Toko Sumber Rejeki', wilayah:'Jakarta', ts:'Baru', statusApproval:'Pending',
      sOffice:'Head Office', area:'Jakarta', layanan:'Reguler', orderVia:'WhatsApp', alamat:'Jl. Mangga Dua Raya No. 12, Jakarta Pusat', rayon:'Rayon Jakarta Pusat',
      principalKode:'', principalNama:'', cito:false, spAsli:false, skEd:false, cl:50000000, piutang:18250000, sisaCl:31750000,
      konsinyasi:true, keterangan:'Order tambahan Kopi Kapal Api', isGuarantee:false, pecahFaktur:false, ukuranBasis:'KG',
      items:[{kode:'BRG-009', nama:'Kopi Kapal Api 165gr', um:'Dus', qty:80, hna1:14000, hnaXqty:1120000, potongan:0, dpp:1120000, typePpn:'PPN 11%', ppn:123200, biayaKirim:10000, noBatch:'BT-260709-09', tglKadaluarsa:'2027-09-30'}],
      totalDpp:1120000, totalPpn:123200, totalBiayaKirim:10000, jumlahAkhir:1253200,
      tglSO:'07/08/2026', tglInput:'07/08/2026 09:45:00', userInput:'sidik', tglEdit:'', userEdit:''},
    {no:'26/SO/BDG/08/00004', tutupSo:true, noSP:'SP/BDG/08/00004', noSQ:'', noDSC:'DSC/BDG/08/00001', customer:'CV Berkah Abadi', wilayah:'Bandung', ts:'Diproses', statusApproval:'Rejected',
      sOffice:'Bandung', area:'Bandung', layanan:'Reguler', orderVia:'Telepon', alamat:'Jl. Soekarno Hatta No. 88, Bandung', rayon:'Rayon Bandung Kota',
      principalKode:'5018', principalNama:'CV Distribusi Sentosa', cito:false, spAsli:true, skEd:true, cl:20000000, piutang:4300000, sisaCl:15700000,
      konsinyasi:false, keterangan:'Ditolak - melebihi Sisa CL setelah PPN', isGuarantee:false, pecahFaktur:false, ukuranBasis:'Dimensi',
      items:[{kode:'BRG-010', nama:'Sabun Mandi Lifebuoy 90gr', um:'Dus', qty:1000, hna1:5000, hnaXqty:5000000, potongan:100000, dpp:4900000, typePpn:'PPN 11%', ppn:539000, biayaKirim:30000, noBatch:'BT-260710-10', tglKadaluarsa:'2027-10-31'}],
      totalDpp:4900000, totalPpn:539000, totalBiayaKirim:30000, jumlahAkhir:5469000,
      tglSO:'10/08/2026', tglInput:'10/08/2026 11:20:00', userInput:'sidik', tglEdit:'', userEdit:''},
    {no:'26/SO/MDN/08/00002', noSP:'SP/MDN/08/00002', noSQ:'SQ/MDN/08/00002', noDSC:'', customer:'Toko Anugrah', wilayah:'Medan', ts:'Selesai', statusApproval:'Approved',
      sOffice:'Medan', area:'Medan', layanan:'Reguler', orderVia:'Sales Rep', alamat:'Jl. Gatot Subroto No. 21, Medan', rayon:'Rayon Medan Kota',
      principalKode:'5020', principalNama:'PT Indofood Distribusi', cito:false, spAsli:true, skEd:false, cl:15000000, piutang:6600000, sisaCl:8400000,
      konsinyasi:false, keterangan:'Order kombinasi Sembako', isGuarantee:false, pecahFaktur:false, ukuranBasis:'KG',
      items:[
        {kode:'BRG-001', nama:'Minyak Goreng Sunco 2L', um:'Dus', qty:40, hna1:25000, hnaXqty:1000000, potongan:0, dpp:1000000, typePpn:'PPN 11%', ppn:110000, biayaKirim:0, noBatch:'BT-260711-11', tglKadaluarsa:'2027-06-30'},
        {kode:'BRG-002', nama:'Gula Pasir Gulaku 1kg', um:'Karung', qty:60, hna1:15000, hnaXqty:900000, potongan:0, dpp:900000, typePpn:'PPN 11%', ppn:99000, biayaKirim:0, noBatch:'BT-260712-12', tglKadaluarsa:'2027-05-15'},
      ],
      totalDpp:1900000, totalPpn:209000, totalBiayaKirim:0, jumlahAkhir:2109000,
      tglSO:'04/08/2026', tglInput:'04/08/2026 08:00:00', userInput:'sidik', tglEdit:'06/08/2026 15:40:00', userEdit:'sidik'},
    {no:'26/SO/MKS/08/00001', noSP:'', noSQ:'', noDSC:'', customer:'UD Sinar Harapan', wilayah:'Makassar', ts:'Baru', statusApproval:'Pending',
      sOffice:'Makassar', area:'Makassar', layanan:'Reguler', orderVia:'Online', alamat:'Jl. Perintis Kemerdekaan No. 5, Makassar', rayon:'Rayon Makassar Kota',
      principalKode:'', principalNama:'', cito:false, spAsli:false, skEd:false, cl:12000000, piutang:2150000, sisaCl:9850000,
      konsinyasi:false, keterangan:'Order Beras Premium', isGuarantee:false, pecahFaktur:false, ukuranBasis:'KG',
      items:[{kode:'BRG-003', nama:'Beras Premium Rojolele 5kg', um:'Karung', qty:10, hna1:60000, hnaXqty:600000, potongan:0, dpp:600000, typePpn:'Non PKP', ppn:0, biayaKirim:15000, noBatch:'BT-260713-13', tglKadaluarsa:'2027-02-28'}],
      totalDpp:600000, totalPpn:0, totalBiayaKirim:15000, jumlahAkhir:615000,
      tglSO:'02/08/2026', tglInput:'02/08/2026 09:30:00', userInput:'sidik', tglEdit:'', userEdit:''},
    {no:'26/SO/HO/08/00010', noSP:'SP/HO/08/00010', noSQ:'SQ/HO/08/00010', noDSC:'', customer:'Toko Family Mart Jaya', wilayah:'Jakarta', ts:'Dikirim', statusApproval:'Approved',
      sOffice:'Head Office', area:'Jakarta', layanan:'Express', orderVia:'WhatsApp', alamat:'Jl. Kelapa Gading Boulevard No. 9, Jakarta Utara', rayon:'Rayon Jakarta Utara',
      principalKode:'5019', principalNama:'PT Mayora Distribusi', cito:false, spAsli:true, skEd:false, cl:28000000, piutang:9870000, sisaCl:18130000,
      konsinyasi:false, keterangan:'Order Tepung Terigu tambahan', isGuarantee:false, pecahFaktur:false, ukuranBasis:'KG',
      items:[{kode:'BRG-004', nama:'Tepung Terigu Segitiga Biru 1kg', um:'Karung', qty:150, hna1:12000, hnaXqty:1800000, potongan:0, dpp:1800000, typePpn:'PPN 11%', ppn:198000, biayaKirim:25000, noBatch:'BT-260714-14', tglKadaluarsa:'2027-01-31'}],
      totalDpp:1800000, totalPpn:198000, totalBiayaKirim:25000, jumlahAkhir:2023000,
      tglSO:'11/08/2026', tglInput:'11/08/2026 08:15:00', userInput:'sidik', tglEdit:'', userEdit:''},
    {no:'26/SO/SMG/08/00003', noSP:'SP/SMG/08/00003', noSQ:'', noDSC:'', customer:'CV Maju Terus', wilayah:'Semarang', ts:'Selesai', statusApproval:'Rejected',
      sOffice:'Semarang', area:'Semarang', layanan:'Reguler', orderVia:'Email', alamat:'Jl. Pandanaran No. 33, Semarang', rayon:'Rayon Semarang Kota',
      principalKode:'', principalNama:'', cito:false, spAsli:false, skEd:false, cl:9000000, piutang:1200000, sisaCl:7800000,
      konsinyasi:false, keterangan:'Ditolak - dokumen SP belum lengkap', isGuarantee:false, pecahFaktur:false, ukuranBasis:'KG',
      items:[{kode:'BRG-005', nama:'Mie Instan Indomie Goreng', um:'Dus', qty:300, hna1:2500, hnaXqty:750000, potongan:0, dpp:750000, typePpn:'PPN 11%', ppn:82500, biayaKirim:10000, noBatch:'BT-260715-15', tglKadaluarsa:'2027-04-30'}],
      totalDpp:750000, totalPpn:82500, totalBiayaKirim:10000, jumlahAkhir:842500,
      tglSO:'01/08/2026', tglInput:'01/08/2026 10:10:00', userInput:'sidik', tglEdit:'', userEdit:''},
  ],
  /* Invoice — menu Customer & Penjualan > Daftar Transaksi > Invoice
     (lihat js/pages/invoice.*). Sebelumnya cuma 10 baris dummy generik
     {no,tgl,customer,jumlah,status} TANPA hubungan ke modul lain — DIGANTI
     TOTAL jadi 8 baris yang masing-masing di-chain nyata ke 1 baris
     DATA.pickingList (8 dari 9 baris dipakai, index 2 -- 26/PKL/BDG/08/00021
     -- SENGAJA ditinggalkan supaya representatif "belum semua Picking List
     sudah di-invoice", realistis untuk alur SO -> PL -> Invoice). Tiap
     baris di bawah ini adalah hasil SEOLAH-OLAH picker "No PL" sudah
     dipakai (persis logic invApplyPickingList() di invoice.js): Customer/
     Cabang/Gudang/Area disalin dari baris Picking List sumbernya, No SP/
     No DSC/Principal/SP Asli/SK ED/Tgl SP disalin dari DATA.salesOrders
     yang noSO-nya cocok (kalau ada).
     DEVIASI YANG DIDOKUMENTASIKAN: 3 dari 8 Picking List sumber
     (26/PKL/MKS/08/00009, 26/PKL/SMG/08/00013, 26/PKL/SBY/08/00043) masih
     berstatus qtyPicking:0 (belum benar-benar di-picking di data Picking
     List aslinya, tercermin di batches:[] kosong). Untuk 3 baris itu SAJA,
     Qty Kirim di tabel Produk Invoice memakai fallback qtyOrder (bukan 0)
     supaya nilai `jumlah`-nya tetap masuk akal sebagai contoh Invoice yang
     sudah jadi — mockup ini berasumsi picking-nya sudah tuntas pada saat
     Invoice dibuat walau data Picking List sumbernya sendiri belum
     diperbarui; kalau modul ini dipakai interaktif lewat picker No PL/No SO
     yang sesungguhnya, Qty Kirim akan tetap ikut qtyPicking APA ADANYA
     (termasuk 0) sesuai spesifikasi. `jumlah` dihitung nyata dari
     DATA.items[].harga x Qty Kirim per baris (lihat invRecalcJumlah()),
     BUKAN angka acak. No. IVC/No. SJ format "26/SI(atau SJ)/<KODE>/08/<seq>"
     dengan seq per-cabang dimulai dari 1 (2 baris HO & 2 baris SBY sehingga
     masing-masing sampai seq 2) — konsisten dengan format nomor
     26/PKL/.../08/... & 26/SO/.../08/... yang sudah ada. 3 baris (index 1,
     4, 7 di bawah -- sumber Picking List yang sudah 'Terkirim') ditandai
     posted:true/ts:'Invoice Selesai' dari awal supaya perilaku tombol
     Ubah/Hapus/Posting yang disabled langsung terlihat tanpa perlu
     mengklik apa pun lebih dulu.

     2026-08-26 — field BARU `mcdHistory` (array riwayat status
     pengiriman: {tanggal, username, status, keterangan, printBadge?})
     ditambahkan ke SETIAP baris di bawah utk modul baru "Monitoring
     Control Delivery" (menggantikan submenu placeholder "Tracking
     Status" — lihat js/pages/monitoring-control-delivery.template.js
     utk penjelasan lengkap 8 status alur & rute Direct/via-SO). Status
     "saat ini" tiap baris TIDAK disimpan di sini — selalu computed dari
     entri TERAKHIR mcdHistory (mcdCurrentStatus() di
     monitoring-control-delivery.js). Rute Direct (shipVia:'Driver'/
     'Diambil Sendiri') vs rute relay lewat Sales Office (shipVia:
     'Ekspedisi'/'Dikirim Supplier') dicerminkan lewat pilihan status mana
     yang muncul di history masing-masing baris (BUKAN field baru
     terpisah). Tahap "Faktur" hanya di-seed pada baris yang sudah
     posted:true, konsisten field `posted` yang sudah ada. */
  invoices:[
    {no:'26/SI/TGR/08/00001', noSJ:'26/SJ/TGR/08/00001', tglBuat:'11/08/2026 10:30', tgl:'11/08/2026',
      cabang:'Tangerang', gudang:'(03-GUU) Gudang Utama-TGR', area:'JABODETABEK BANTEN',
      customerKode:'CUST-006', customerNama:'Toko Family Mart Jaya', customerAlamat:'Jl. Kelapa Gading Boulevard No. 9, Jakarta Utara',
      noSO:'26/SO/HO/08/00013', noPL:'26/PKL/TGR/08/00168', noSP:'SP/HO/08/00013', noDSC:'', principalKode:'5015', principalNama:'PT Sumber Pangan Nusantara', tglSP:'08/08/2026',
      spAsli:true, skEd:false, cito:false, citoTgl:'11/08/2026',
      syaratBayar:'Kredit 30 Hari', layanan:'Reguler', alamatPengiriman:'Jl. Kelapa Gading Boulevard No. 9, Jakarta Utara',
      shipVia:'Driver', noResi:'', driver:'Maulana Sidik - L 8753 GE (CDE)',
      keterangan:'Invoice sesuai Picking List 26/PKL/TGR/08/00168.',
      items:[
        {kode:'BRG-001', nama:'Minyak Goreng Sunco 2L', satuan:'Dus', qtyPesan:20, qtyKirim:20, batch:'BT-260701-01', ed:'2027-06-30'},
        {kode:'BRG-002', nama:'Gula Pasir Gulaku 1kg', satuan:'Karung', qtyPesan:80, qtyKirim:80, batch:'BT-260702-02', ed:'2027-05-15'},
      ],
      jumlah:1700000, posted:false, ts:'Create Invoice',
      tglInput:'11/08/2026 10:30', userInput:'sidik', tglEdit:'', userEdit:'',
      mcdHistory:[
        {tanggal:'11/08/2026 10:30', username:'sidik', status:'Create Invoice', keterangan:'Invoice dibuat dari Picking List 26/PKL/TGR/08/00168.'},
        {tanggal:'11/08/2026 10:35', username:'sidik', status:'Print Invoice', keterangan:'Invoice dicetak untuk dilampirkan ke Surat Jalan.', printBadge:true},
        {tanggal:'11/08/2026 11:15', username:'setia_adg', status:'Serah Terima ke Tim Pengantar (G)', keterangan:'Diserahterimakan ke Driver Maulana Sidik - L 8753 GE (CDE).'},
        {tanggal:'11/08/2026 15:20', username:'setia_adg', status:'Diterima Customer', keterangan:'Barang diterima lengkap oleh Toko Family Mart Jaya.'},
      ]},
    {no:'26/SI/SBY/08/00001', noSJ:'26/SJ/SBY/08/00001', tglBuat:'08/08/2026 15:20', tgl:'08/08/2026',
      cabang:'Surabaya', gudang:'(01-GUU) Gudang Utama-SBY', area:'JAWA TIMUR',
      customerKode:'CUST-002', customerNama:'UD Makmur Jaya', customerAlamat:'Jl. Raya Darmo No. 45, Surabaya',
      noSO:'26/SO/SBY/08/00007', noPL:'26/PKL/SBY/08/00042', noSP:'SP/SBY/08/00007', noDSC:'DSC/SBY/08/00001', principalKode:'5016', principalNama:'PT Wilmar Nabati Indonesia', tglSP:'08/08/2026',
      spAsli:true, skEd:false, cito:false, citoTgl:'08/08/2026',
      syaratBayar:'Kredit 14 Hari', layanan:'Reguler', alamatPengiriman:'Jl. Raya Darmo No. 45, Surabaya',
      shipVia:'Driver', noResi:'', driver:'Bambang Wijaya - B 9012 XYZ (ABC)',
      keterangan:'Invoice sesuai Picking List 26/PKL/SBY/08/00042.',
      items:[
        {kode:'BRG-007', nama:'Susu Kental Manis Indomilk 380gr', satuan:'Dus', qtyPesan:30, qtyKirim:30, batch:'BT-260707-07', ed:'2027-07-31'},
        {kode:'BRG-008', nama:'Teh Celup Sariwangi 25s', satuan:'Dus', qtyPesan:40, qtyKirim:40, batch:'BT-260708-08', ed:'2027-08-31'},
      ],
      jumlah:880000, posted:true, ts:'Invoice Selesai', dibayar:0,
      tglInput:'08/08/2026 15:20', userInput:'sidik', tglEdit:'09/08/2026 09:15', userEdit:'sidik',
      mcdHistory:[
        {tanggal:'08/08/2026 15:20', username:'sidik', status:'Create Invoice', keterangan:'Invoice dibuat dari Picking List 26/PKL/SBY/08/00042.'},
        {tanggal:'08/08/2026 15:25', username:'sidik', status:'Print Invoice', keterangan:'Invoice dicetak untuk dilampirkan ke Surat Jalan.', printBadge:true},
        {tanggal:'08/08/2026 16:00', username:'nazwaa_iks', status:'Serah Terima ke Tim Pengantar (G)', keterangan:'Diserahterimakan ke Driver Bambang Wijaya - B 9012 XYZ (ABC).'},
        {tanggal:'08/08/2026 19:30', username:'nazwaa_iks', status:'Diterima Customer', keterangan:'Barang diterima lengkap oleh UD Makmur Jaya.'},
        {tanggal:'09/08/2026 09:15', username:'sidik', status:'Faktur', keterangan:'Invoice sudah diposting (lihat modul Invoice).'},
      ]},
    {no:'26/SI/MDN/08/00001', noSJ:'26/SJ/MDN/08/00001', tglBuat:'06/08/2026 11:00', tgl:'06/08/2026',
      cabang:'Medan', gudang:'(04-GUU) Gudang Utama-MDN', area:'SUMATERA UTARA',
      customerKode:'CUST-004', customerNama:'Toko Anugrah', customerAlamat:'Jl. Gatot Subroto No. 21, Medan',
      noSO:'26/SO/MDN/08/00003', noPL:'26/PKL/MDN/08/00015', noSP:'SP/MDN/08/00003', noDSC:'', principalKode:'5020', principalNama:'PT Indofood Distribusi', tglSP:'06/08/2026',
      spAsli:true, skEd:false, cito:false, citoTgl:'06/08/2026',
      syaratBayar:'Kredit 45 Hari', layanan:'Reguler', alamatPengiriman:'Jl. Gatot Subroto No. 21, Medan',
      shipVia:'Ekspedisi', noResi:'JNE-88213345', driver:'',
      keterangan:'Invoice sesuai Picking List 26/PKL/MDN/08/00015.',
      items:[
        {kode:'BRG-004', nama:'Tepung Terigu Segitiga Biru 1kg', satuan:'Karung', qtyPesan:50, qtyKirim:50, batch:'BT-260704-04', ed:'2027-01-31'},
      ],
      jumlah:600000, posted:false, ts:'Create Invoice',
      tglInput:'06/08/2026 11:00', userInput:'sidik', tglEdit:'', userEdit:'',
      mcdHistory:[
        {tanggal:'06/08/2026 11:00', username:'sidik', status:'Create Invoice', keterangan:'Invoice dibuat dari Picking List 26/PKL/MDN/08/00015.'},
        {tanggal:'06/08/2026 11:10', username:'sidik', status:'Print Invoice', keterangan:'Invoice dicetak untuk dilampirkan ke Surat Jalan.'},
        {tanggal:'07/08/2026 08:00', username:'setia_adg', status:'Diterima Sales Office (SO)', keterangan:'Barang tiba di Sales Office cabang tujuan via Ekspedisi JNE (No. Resi JNE-88213345).'},
        {tanggal:'07/08/2026 09:30', username:'setia_adg', status:'Serah Terima ke Tim Pengantar (SO)', keterangan:'Diserahterimakan ke tim pengantar lokal Sales Office untuk diteruskan ke Toko Anugrah.'},
      ]},
    {no:'26/SI/MKS/08/00001', noSJ:'26/SJ/MKS/08/00001', tglBuat:'07/08/2026 13:15', tgl:'07/08/2026',
      cabang:'Makassar', gudang:'(05-GUU) Gudang Utama-MKS', area:'SULAWESI SELATAN',
      customerKode:'CUST-005', customerNama:'UD Sinar Harapan', customerAlamat:'Jl. Perintis Kemerdekaan No. 5, Makassar',
      noSO:'26/SO/MKS/08/00002', noPL:'26/PKL/MKS/08/00009', noSP:'', noDSC:'', principalKode:'', principalNama:'', tglSP:'07/08/2026',
      spAsli:false, skEd:false, cito:false, citoTgl:'07/08/2026',
      syaratBayar:'CBD', layanan:'Reguler', alamatPengiriman:'Jl. Perintis Kemerdekaan No. 5, Makassar',
      shipVia:'Driver', noResi:'', driver:'Hendra Gunawan - D 4521 FE (EFG)',
      keterangan:'Invoice sesuai Picking List 26/PKL/MKS/08/00009. Qty Kirim memakai fallback Qty Pesan karena Picking List sumbernya masih qtyPicking:0 (lihat catatan di atas array ini).',
      items:[
        {kode:'BRG-005', nama:'Mie Instan Indomie Goreng', satuan:'Dus', qtyPesan:100, qtyKirim:100, batch:'', ed:''},
      ],
      jumlah:250000, posted:false, ts:'Create Invoice',
      tglInput:'07/08/2026 13:15', userInput:'sidik', tglEdit:'', userEdit:'',
      mcdHistory:[
        {tanggal:'07/08/2026 13:15', username:'sidik', status:'Create Invoice', keterangan:'Invoice dibuat dari Picking List 26/PKL/MKS/08/00009.'},
        {tanggal:'07/08/2026 13:20', username:'sidik', status:'Print Invoice', keterangan:'Invoice dicetak untuk dilampirkan ke Surat Jalan.', printBadge:true},
      ]},
    {no:'26/SI/HO/08/00001', noSJ:'26/SJ/HO/08/00001', tglBuat:'07/08/2026 16:00', tgl:'07/08/2026',
      cabang:'Head Office', gudang:'(00-GUU) Gudang Utama-HO', area:'JABODETABEK BANTEN',
      customerKode:'CUST-001', customerNama:'Toko Sumber Rejeki', customerAlamat:'Jl. Mangga Dua Raya No. 12, Jakarta Pusat',
      noSO:'26/SO/HO/08/00011', noPL:'26/PKL/HO/08/00077', noSP:'', noDSC:'', principalKode:'', principalNama:'', tglSP:'07/08/2026',
      spAsli:false, skEd:false, cito:false, citoTgl:'07/08/2026',
      syaratBayar:'Kredit 30 Hari', layanan:'Reguler', alamatPengiriman:'Jl. Mangga Dua Raya No. 12, Jakarta Pusat',
      shipVia:'Diambil Sendiri', noResi:'', driver:'',
      keterangan:'Invoice sesuai Picking List 26/PKL/HO/08/00077.',
      items:[
        {kode:'BRG-006', nama:'Kecap Manis ABC 600ml', satuan:'Dus', qtyPesan:60, qtyKirim:60, batch:'BT-260706-06', ed:'2027-03-31'},
        {kode:'BRG-009', nama:'Kopi Kapal Api 165gr', satuan:'Dus', qtyPesan:20, qtyKirim:20, batch:'BT-260709-09', ed:'2027-09-30'},
      ],
      jumlah:1120000, posted:true, ts:'Invoice Selesai', dibayar:1120000,
      tglInput:'07/08/2026 16:00', userInput:'sidik', tglEdit:'07/08/2026 17:20', userEdit:'sidik',
      mcdHistory:[
        {tanggal:'07/08/2026 16:00', username:'sidik', status:'Create Invoice', keterangan:'Invoice dibuat dari Picking List 26/PKL/HO/08/00077.'},
        {tanggal:'07/08/2026 16:05', username:'sidik', status:'Print Invoice', keterangan:'Invoice dicetak untuk dilampirkan ke Surat Jalan.'},
        {tanggal:'07/08/2026 16:30', username:'sidik', status:'Diterima Customer', keterangan:'Barang diambil langsung oleh Toko Sumber Rejeki (Diambil Sendiri), tidak melalui tim pengantar.'},
        {tanggal:'07/08/2026 17:20', username:'sidik', status:'Faktur', keterangan:'Invoice sudah diposting (lihat modul Invoice).'},
        {tanggal:'08/08/2026 10:00', username:'setia_adg', status:'Sudah Tukar Faktur / Pemberkasan', keterangan:'Faktur asli sudah ditukar & berkas lengkap.'},
      ]},
    {no:'26/SI/SMG/08/00001', noSJ:'26/SJ/SMG/08/00001', tglBuat:'05/08/2026 15:30', tgl:'05/08/2026',
      cabang:'Semarang', gudang:'(06-GUU) Gudang Utama-SMG', area:'JAWA TENGAH',
      customerKode:'CUST-007', customerNama:'CV Maju Terus', customerAlamat:'Jl. Pandanaran No. 33, Semarang',
      noSO:'26/SO/SMG/08/00004', noPL:'26/PKL/SMG/08/00013', noSP:'SP/SMG/08/00004', noDSC:'', principalKode:'', principalNama:'', tglSP:'05/08/2026',
      spAsli:true, skEd:false, cito:false, citoTgl:'05/08/2026',
      syaratBayar:'Kredit 30 Hari', layanan:'Reguler', alamatPengiriman:'Jl. Pandanaran No. 33, Semarang',
      shipVia:'Driver', noResi:'', driver:'Yusuf Setiawan - B 7788 KLM (HIJ)',
      keterangan:'Invoice sesuai Picking List 26/PKL/SMG/08/00013. Qty Kirim memakai fallback Qty Pesan karena Picking List sumbernya masih qtyPicking:0 (lihat catatan di atas array ini).',
      items:[
        {kode:'BRG-007', nama:'Susu Kental Manis Indomilk 380gr', satuan:'Dus', qtyPesan:25, qtyKirim:25, batch:'', ed:''},
      ],
      jumlah:400000, posted:false, ts:'Create Invoice',
      tglInput:'05/08/2026 15:30', userInput:'sidik', tglEdit:'', userEdit:'',
      mcdHistory:[
        {tanggal:'05/08/2026 15:30', username:'sidik', status:'Create Invoice', keterangan:'Invoice dibuat dari Picking List 26/PKL/SMG/08/00013.'},
        {tanggal:'05/08/2026 15:35', username:'sidik', status:'Print Invoice', keterangan:'Invoice dicetak untuk dilampirkan ke Surat Jalan.'},
        {tanggal:'05/08/2026 16:10', username:'nazwaa_iks', status:'Serah Terima ke Tim Pengantar (G)', keterangan:'Diserahterimakan ke Driver Yusuf Setiawan - B 7788 KLM (HIJ).'},
        {tanggal:'06/08/2026 09:00', username:'nazwaa_iks', status:'Diterima Sales Office (SO)', keterangan:'Barang direlay lewat Sales Office sebelum diteruskan ke CV Maju Terus.'},
        {tanggal:'06/08/2026 10:15', username:'nazwaa_iks', status:'Serah Terima ke Tim Pengantar (SO)', keterangan:'Diserahterimakan ke tim pengantar Sales Office untuk pengantaran terakhir.'},
      ]},
    {no:'26/SI/SBY/08/00002', noSJ:'26/SJ/SBY/08/00002', tglBuat:'09/08/2026 12:40', tgl:'09/08/2026',
      cabang:'Surabaya', gudang:'(01-GUU) Gudang Utama-SBY', area:'JAWA TIMUR',
      customerKode:'CUST-008', customerNama:'Toko Sejahtera', customerAlamat:'Jl. Kertajaya No. 67, Surabaya',
      noSO:'26/SO/SBY/08/00006', noPL:'26/PKL/SBY/08/00043', noSP:'SP/SBY/08/00006', noDSC:'', principalKode:'5016', principalNama:'PT Wilmar Nabati Indonesia', tglSP:'09/08/2026',
      spAsli:true, skEd:false, cito:false, citoTgl:'09/08/2026',
      syaratBayar:'Kredit 14 Hari', layanan:'Reguler', alamatPengiriman:'Jl. Kertajaya No. 67, Surabaya',
      shipVia:'Dikirim Supplier', noResi:'', driver:'',
      keterangan:'Invoice sesuai Picking List 26/PKL/SBY/08/00043. Qty Kirim memakai fallback Qty Pesan karena Picking List sumbernya masih qtyPicking:0 (lihat catatan di atas array ini).',
      items:[
        {kode:'BRG-008', nama:'Teh Celup Sariwangi 25s', satuan:'Dus', qtyPesan:35, qtyKirim:35, batch:'', ed:''},
      ],
      jumlah:350000, posted:false, ts:'Create Invoice',
      tglInput:'09/08/2026 12:40', userInput:'sidik', tglEdit:'', userEdit:'',
      mcdHistory:[
        {tanggal:'09/08/2026 12:40', username:'sidik', status:'Create Invoice', keterangan:'Invoice baru dibuat, menunggu proses cetak.'},
      ]},
    {no:'26/SI/HO/08/00002', noSJ:'26/SJ/HO/08/00002', tglBuat:'11/08/2026 14:10', tgl:'11/08/2026',
      cabang:'Head Office', gudang:'(00-GUU) Gudang Utama-HO', area:'JABODETABEK BANTEN',
      customerKode:'CUST-006', customerNama:'Toko Family Mart Jaya', customerAlamat:'Jl. Kelapa Gading Boulevard No. 9, Jakarta Utara',
      noSO:'26/SO/HO/08/00010', noPL:'26/PKL/HO/08/00078', noSP:'SP/HO/08/00010', noDSC:'', principalKode:'5019', principalNama:'PT Mayora Distribusi', tglSP:'11/08/2026',
      spAsli:true, skEd:false, cito:false, citoTgl:'11/08/2026',
      syaratBayar:'Kredit 30 Hari', layanan:'Express', alamatPengiriman:'Jl. Kelapa Gading Boulevard No. 9, Jakarta Utara',
      shipVia:'Driver', noResi:'', driver:'Agus Salim - F 3344 AB (KLM)',
      keterangan:'Invoice sesuai Picking List 26/PKL/HO/08/00078.',
      items:[
        {kode:'BRG-010', nama:'Sabun Mandi Lifebuoy 90gr', satuan:'Dus', qtyPesan:70, qtyKirim:70, batch:'BT-260710-10', ed:'2027-10-31'},
      ],
      jumlah:350000, posted:true, ts:'Invoice Selesai', dibayar:150000,
      tglInput:'11/08/2026 14:10', userInput:'sidik', tglEdit:'11/08/2026 16:45', userEdit:'sidik',
      mcdHistory:[
        {tanggal:'11/08/2026 14:10', username:'sidik', status:'Create Invoice', keterangan:'Invoice dibuat dari Picking List 26/PKL/HO/08/00078.'},
        {tanggal:'11/08/2026 14:15', username:'sidik', status:'Print Invoice', keterangan:'Invoice dicetak untuk dilampirkan ke Surat Jalan.', printBadge:true},
        {tanggal:'11/08/2026 14:45', username:'setia_adg', status:'Serah Terima ke Tim Pengantar (G)', keterangan:'Diserahterimakan ke Driver Agus Salim - F 3344 AB (KLM).'},
        {tanggal:'11/08/2026 16:30', username:'setia_adg', status:'Diterima Customer', keterangan:'Diterima sebagian oleh Toko Family Mart Jaya (Ditolak Sebagian) — sebagian retur, lihat catatan pembayaran sebagian di Invoice terkait.'},
        {tanggal:'11/08/2026 17:20', username:'sidik', status:'Faktur', keterangan:'Invoice sudah diposting (lihat modul Invoice).'},
        {tanggal:'12/08/2026 09:40', username:'setia_adg', status:'Sudah Tukar Faktur / Pemberkasan', keterangan:'Faktur asli sudah ditukar & berkas lengkap.'},
      ]},
    /* 2026-08-26 — 2 baris BARU (bukan mengedit 8 baris di atas yang
       sudah terverifikasi) ditambahkan khusus untuk mendemokan laporan
       Report Center baru "Laporan Daftar Transaksi Barang Bonus"
       (Penjualan > grup BONUS, permission code PrintTransactionInventoryBonus
       — lihat js/pages/reports.js/.template.js). Screenshot contoh PDF
       laporan itu ("LAPORAN PENJUALAN BARANG BONUS") berisi data rumah
       sakit farmasi instalasi MASERP lain (customer "MITRA KELUARGA
       TEGAL", barang infus) — TIDAK direplikasi (bukan data DBM/tidak
       relevan), diganti transaksi yang genuinely konsisten dengan data
       DBM yang sudah ada. Setiap baris di bawah membawa 1 item tambahan
       bertanda `bonus:true` di array `items[]` — field BARU ini di-
       skip dari kalkulasi `jumlah` (lihat +1 baris di invRecalcJumlah(),
       invoice.js: item bonus dianggap harga 0/gratis, konsisten sifat
       "barang bonus") dan ditampilkan dengan label kecil "Bonus" di
       tabel Produk form Invoice (lihat tplInvItemRow(), invoice.template.js).
       Baris bonus ini SENGAJA di-CHAIN ke 2 baris DATA.promotion yang
       SUDAH ADA sejak modul Promotion dibangun 2026-08-11 (field
       ratioBarangBonus/barangBonusKode di tiap tier `ketentuan[]` —
       sebelumnya cuma metadata deskriptif, belum pernah benar2
       dikonsumsi transaksi mana pun sampai laporan ini):
       - Invoice ke-1 (Head Office/Toko Sumber Rejeki) chained ke PRO01
         "Promo Diskon Bertingkat Sembako" (26/PM-HO/08/00001): tier
         kategori Sembako qtyAwal 50-999999 -> ratioBarangBonus 20 ->
         barangBonusKode BRG-002. Baris ini beli 2 barang kategori
         Sembako (BRG-004 Tepung Terigu 30 + BRG-002 Gula Pasir 25 = 55
         >= 50) sehingga dapat bonus Gula Pasir 20% x 55 = 11 (dibulatkan
         ke bawah), persis barangBonusKode tier itu.
       - Invoice ke-2 (Surabaya/UD Makmur Jaya) chained ke PRO02 "Promo
         Beli Minyak Goreng Dapat Bonus" (26/PM-SBY/08/00001): tier
         BRG-001 Minyak Goreng Sunco 2L qtyAwal 100-999999 ->
         ratioBarangBonus 10 -> barangBonusKode BRG-001 (SKU sama,
         "beli 120 dapat bonus 12"). Baris ini beli Minyak Goreng 120
         (>=100) sehingga dapat bonus 10% x 120 = 12 unit SKU yang sama.
       Kedua baris TIDAK mengubah/menimpa `jumlah` baris manapun yang
       sudah ada — noSO/noPL/noSP di baris baru ini murni deskriptif
       (mengikuti pola nomor urut per-cabang yang sudah ada) seperti
       field serupa di banyak baris Invoice existing, tidak divalidasi
       silang ke DATA.salesOrders/DATA.pickingList (konsisten precedent
       "referensi deskriptif, bukan foreign-key wajib" yang sudah dipakai
       banyak field serupa di modul lain). */
    {no:'26/SI/HO/08/00003', noSJ:'26/SJ/HO/08/00003', tglBuat:'20/08/2026 10:00', tgl:'20/08/2026',
      cabang:'Head Office', gudang:'(00-GUU) Gudang Utama-HO', area:'JABODETABEK BANTEN',
      customerKode:'CUST-001', customerNama:'Toko Sumber Rejeki', customerAlamat:'Jl. Mangga Dua Raya No. 12, Jakarta Pusat',
      noSO:'26/SO/HO/08/00014', noPL:'26/PKL/HO/08/00079', noSP:'SP/HO/08/00014', noDSC:'', principalKode:'5015', principalNama:'PT Sumber Pangan Nusantara', tglSP:'19/08/2026',
      spAsli:true, skEd:false, cito:false, citoTgl:'20/08/2026',
      syaratBayar:'Kredit 30 Hari', layanan:'Reguler', alamatPengiriman:'Jl. Mangga Dua Raya No. 12, Jakarta Pusat',
      shipVia:'Driver', noResi:'', driver:'Maulana Sidik - L 8753 GE (CDE)',
      keterangan:'Invoice sesuai Picking List 26/PKL/HO/08/00079. Termasuk bonus barang dari Promotion 26/PM-HO/08/00001 (PRO01) — beli Sembako 55 pcs (Tepung 30 + Gula 25, >=50) mendapat bonus Gula Pasir Gulaku 1kg 20% x 55 = 11 pcs gratis.',
      items:[
        {kode:'BRG-004', nama:'Tepung Terigu Segitiga Biru 1kg', satuan:'Karung', qtyPesan:30, qtyKirim:30, batch:'BT-260815-15', ed:'2027-02-28'},
        {kode:'BRG-002', nama:'Gula Pasir Gulaku 1kg', satuan:'Karung', qtyPesan:25, qtyKirim:25, batch:'BT-260816-16', ed:'2027-06-15'},
        {kode:'BRG-002', nama:'Gula Pasir Gulaku 1kg', satuan:'Karung', qtyPesan:11, qtyKirim:11, batch:'BT-260816-16', ed:'2027-06-15', bonus:true, bonusKeterangan:'Bonus Promo PRO01 (26/PM-HO/08/00001) — 20% x 55'},
      ],
      jumlah:735000, posted:false, ts:'Create Invoice',
      tglInput:'20/08/2026 10:00', userInput:'sidik', tglEdit:'', userEdit:'',
      mcdHistory:[
        {tanggal:'20/08/2026 10:00', username:'sidik', status:'Create Invoice', keterangan:'Invoice dibuat dari Picking List 26/PKL/HO/08/00079.'},
        {tanggal:'20/08/2026 10:05', username:'sidik', status:'Print Invoice', keterangan:'Invoice dicetak untuk dilampirkan ke Surat Jalan.'},
        {tanggal:'20/08/2026 10:40', username:'setia_adg', status:'Serah Terima ke Tim Pengantar (G)', keterangan:'Diserahterimakan ke Driver Maulana Sidik - L 8753 GE (CDE).'},
        {tanggal:'20/08/2026 14:00', username:'setia_adg', status:'Diterima Sales Office (SO)', keterangan:'Barang direlay lewat Sales Office karena Toko Sumber Rejeki pindah titik terima sementara.'},
      ]},
    {no:'26/SI/SBY/08/00003', noSJ:'26/SJ/SBY/08/00003', tglBuat:'21/08/2026 09:45', tgl:'21/08/2026',
      cabang:'Surabaya', gudang:'(01-GUU) Gudang Utama-SBY', area:'JAWA TIMUR',
      customerKode:'CUST-002', customerNama:'UD Makmur Jaya', customerAlamat:'Jl. Raya Darmo No. 45, Surabaya',
      noSO:'26/SO/SBY/08/00008', noPL:'26/PKL/SBY/08/00044', noSP:'SP/SBY/08/00008', noDSC:'', principalKode:'5016', principalNama:'PT Wilmar Nabati Indonesia', tglSP:'20/08/2026',
      spAsli:true, skEd:false, cito:false, citoTgl:'21/08/2026',
      syaratBayar:'Kredit 14 Hari', layanan:'Reguler', alamatPengiriman:'Jl. Raya Darmo No. 45, Surabaya',
      shipVia:'Driver', noResi:'', driver:'Bambang Wijaya - B 9012 XYZ (ABC)',
      keterangan:'Invoice sesuai Picking List 26/PKL/SBY/08/00044. Termasuk bonus barang dari Promotion 26/PM-SBY/08/00001 (PRO02) — beli Minyak Goreng Sunco 2L 120 dus (>=100) mendapat bonus 10% x 120 = 12 dus gratis (SKU sama).',
      items:[
        {kode:'BRG-001', nama:'Minyak Goreng Sunco 2L', satuan:'Dus', qtyPesan:120, qtyKirim:120, batch:'BT-260817-17', ed:'2027-07-31'},
        {kode:'BRG-001', nama:'Minyak Goreng Sunco 2L', satuan:'Dus', qtyPesan:12, qtyKirim:12, batch:'BT-260817-17', ed:'2027-07-31', bonus:true, bonusKeterangan:'Bonus Promo PRO02 (26/PM-SBY/08/00001) — 10% x 120'},
      ],
      jumlah:3000000, posted:false, ts:'Create Invoice',
      tglInput:'21/08/2026 09:45', userInput:'sidik', tglEdit:'', userEdit:'',
      mcdHistory:[
        {tanggal:'21/08/2026 09:45', username:'sidik', status:'Create Invoice', keterangan:'Invoice dibuat dari Picking List 26/PKL/SBY/08/00044.'},
        {tanggal:'21/08/2026 09:50', username:'sidik', status:'Print Invoice', keterangan:'Invoice dicetak untuk dilampirkan ke Surat Jalan.', printBadge:true},
        {tanggal:'21/08/2026 10:20', username:'nazwaa_iks', status:'Serah Terima ke Tim Pengantar (G)', keterangan:'Diserahterimakan ke Driver Bambang Wijaya - B 9012 XYZ (ABC).'},
        {tanggal:'21/08/2026 13:10', username:'nazwaa_iks', status:'Diterima Customer', keterangan:'Barang diterima lengkap oleh UD Makmur Jaya.'},
      ]},
    /* 2026-08-28 — 2 baris BARU (bukan mengedit baris yang sudah
       terverifikasi) utk fitur BARU "Pelunasan Piutang Terpusat
       (Holding)" di Penerimaan Piutang: keduanya Invoice POSTED
       (posted:true — syarat tampil di tab "Lunasi Beberapa Faktur")
       milik cabang holding BARU CUST-010 Toko Family Mart Sentosa
       (lihat komentar besar di DATA.customers), dibiarkan outstanding
       (dibayar:0) supaya picker holding menampilkan faktur dari 2
       customer sekaligus (CUST-010 di sini + CUST-006 sisa 200.000
       dari 26/SI/HO/08/00002 yang sudah ada). `jumlah` dihitung nyata
       dari harga jual barang DBM yang sama dgn invoice lain (Kecap
       ABC 14.000 x 50 = 700.000; Teh Sariwangi 10.000 x 54 = 540.000)
       — total 1.240.000 = PERSIS field `piutang` CUST-010 (aturan
       rekonsiliasi FA-10). Nomor 26/SI/SBY/08/00004-00005 melanjutkan
       urutan SBY yang ada (00006 sudah terpakai sbg faktur lunas
       historis di DATA.penerimaanPiutang). noSO/noPL deskriptif
       (precedent "referensi deskriptif, bukan foreign-key wajib"). */
    {no:'26/SI/SBY/08/00004', noSJ:'26/SJ/SBY/08/00004', tglBuat:'22/08/2026 10:10', tgl:'22/08/2026',
      cabang:'Surabaya', gudang:'(01-GUU) Gudang Utama-SBY', area:'JAWA TIMUR',
      customerKode:'CUST-010', customerNama:'Toko Family Mart Sentosa', customerAlamat:'Jl. Basuki Rahmat No. 105, Surabaya',
      noSO:'26/SO/SBY/08/00009', noPL:'26/PKL/SBY/08/00045', noSP:'SP/SBY/08/00009', noDSC:'', principalKode:'5015', principalNama:'PT Sumber Pangan Nusantara', tglSP:'21/08/2026',
      spAsli:true, skEd:false, cito:false, citoTgl:'22/08/2026',
      syaratBayar:'Kredit 14 Hari', layanan:'Reguler', alamatPengiriman:'Jl. Basuki Rahmat No. 105, Surabaya',
      shipVia:'Driver', noResi:'', driver:'Bambang Wijaya - B 9012 XYZ (ABC)',
      keterangan:'Invoice sesuai Picking List 26/PKL/SBY/08/00045.',
      items:[
        {kode:'BRG-006', nama:'Kecap Manis ABC 600ml', satuan:'Dus', qtyPesan:50, qtyKirim:50, batch:'BT-260818-18', ed:'2027-01-20'},
      ],
      jumlah:700000, posted:true, ts:'Invoice Selesai', dibayar:0,
      tglInput:'22/08/2026 10:10', userInput:'sidik', tglEdit:'22/08/2026 15:40', userEdit:'sidik',
      mcdHistory:[
        {tanggal:'22/08/2026 10:10', username:'sidik', status:'Create Invoice', keterangan:'Invoice dibuat dari Picking List 26/PKL/SBY/08/00045.'},
        {tanggal:'22/08/2026 10:15', username:'sidik', status:'Print Invoice', keterangan:'Invoice dicetak untuk dilampirkan ke Surat Jalan.', printBadge:true},
        {tanggal:'22/08/2026 11:00', username:'nazwaa_iks', status:'Serah Terima ke Tim Pengantar (G)', keterangan:'Diserahterimakan ke Driver Bambang Wijaya - B 9012 XYZ (ABC).'},
        {tanggal:'22/08/2026 14:30', username:'nazwaa_iks', status:'Diterima Customer', keterangan:'Barang diterima lengkap oleh Toko Family Mart Sentosa.'},
        {tanggal:'22/08/2026 15:40', username:'sidik', status:'Faktur', keterangan:'Invoice sudah diposting (lihat modul Invoice).'},
      ]},
    {no:'26/SI/SBY/08/00005', noSJ:'26/SJ/SBY/08/00005', tglBuat:'24/08/2026 09:05', tgl:'24/08/2026',
      cabang:'Surabaya', gudang:'(01-GUU) Gudang Utama-SBY', area:'JAWA TIMUR',
      customerKode:'CUST-010', customerNama:'Toko Family Mart Sentosa', customerAlamat:'Jl. Basuki Rahmat No. 105, Surabaya',
      noSO:'26/SO/SBY/08/00010', noPL:'26/PKL/SBY/08/00046', noSP:'SP/SBY/08/00010', noDSC:'', principalKode:'5016', principalNama:'PT Wilmar Nabati Indonesia', tglSP:'23/08/2026',
      spAsli:true, skEd:false, cito:false, citoTgl:'24/08/2026',
      syaratBayar:'Kredit 14 Hari', layanan:'Reguler', alamatPengiriman:'Jl. Basuki Rahmat No. 105, Surabaya',
      shipVia:'Driver', noResi:'', driver:'Bambang Wijaya - B 9012 XYZ (ABC)',
      keterangan:'Invoice sesuai Picking List 26/PKL/SBY/08/00046.',
      items:[
        {kode:'BRG-008', nama:'Teh Celup Sariwangi 25s', satuan:'Dus', qtyPesan:54, qtyKirim:54, batch:'BT-260819-19', ed:'2027-09-18'},
      ],
      jumlah:540000, posted:true, ts:'Invoice Selesai', dibayar:0,
      tglInput:'24/08/2026 09:05', userInput:'sidik', tglEdit:'24/08/2026 13:20', userEdit:'sidik',
      mcdHistory:[
        {tanggal:'24/08/2026 09:05', username:'sidik', status:'Create Invoice', keterangan:'Invoice dibuat dari Picking List 26/PKL/SBY/08/00046.'},
        {tanggal:'24/08/2026 09:10', username:'sidik', status:'Print Invoice', keterangan:'Invoice dicetak untuk dilampirkan ke Surat Jalan.', printBadge:true},
        {tanggal:'24/08/2026 10:00', username:'nazwaa_iks', status:'Serah Terima ke Tim Pengantar (G)', keterangan:'Diserahterimakan ke Driver Bambang Wijaya - B 9012 XYZ (ABC).'},
        {tanggal:'24/08/2026 12:45', username:'nazwaa_iks', status:'Diterima Customer', keterangan:'Barang diterima lengkap oleh Toko Family Mart Sentosa.'},
        {tanggal:'24/08/2026 13:20', username:'sidik', status:'Faktur', keterangan:'Invoice sudah diposting (lihat modul Invoice).'},
      ]},
  ],
  /* Daftar Driver (dipakai field "Driver" di form Invoice, picker
     dekoratif sederhana — tidak ada modul Master Driver tersendiri di
     mockup ini, sama seperti DATA.pickerList yang plain string). */
  driverList:[
    'Maulana Sidik - L 8753 GE (CDE)',
    'Bambang Wijaya - B 9012 XYZ (ABC)',
    'Hendra Gunawan - D 4521 FE (EFG)',
    'Yusuf Setiawan - B 7788 KLM (HIJ)',
    'Agus Salim - F 3344 AB (KLM)',
  ],
  /* Picking List — menu Customer & Penjualan (terdaftar page:'pickingList',
     lihat js/pages/picking-list.*). Sebelumnya cuma pemetaan generik
     read-only 5 baris {no,tgl,gudang,status} — DIGANTI TOTAL jadi 9 baris
     dengan field lengkap sesuai form CRUD sungguhan (lihat komentar detail
     di picking-list.js untuk penjelasan kalkulasi Ready/Qty Sisa).
     Baris index 0 SENGAJA dibuat cocok persis dengan contoh screenshot
     "Ubah" (No. PL 26/PKL/TGR/08/00168, Cabang Tangerang, 2 item dengan
     Qty Sisa 20 & 80) — items baris ini DIPILIH BEBAS dari DATA.items
     (BRG-001/BRG-002), independen dari SO 26/SO/HO/08/00013 yang
     direferensikan di field noSO (SO itu di data aslinya cuma py 1 item),
     supaya angka Qty Sisa 20/80 di screenshot bisa direproduksi persis —
     pola ini konsisten dengan kebiasaan proyek ini mengganti data
     screenshot dengan data sample DBM yang self-consistent, bukan
     mengikuti screenshot 1:1 kalau datanya tidak nyambung secara logis.
     Customer baris 0 (CUST-006 Toko Family Mart Jaya) SENGAJA TIDAK sama
     dengan customer asli SO 26/SO/HO/08/00013 (Toko Sumber Rejeki) di
     DATA.salesOrders — mockup ini menoleransi referensi teks bebas
     no.SO/no.PO yang tidak divalidasi silang, sama seperti field noPO di
     Stock Request. */
  pickingList:[
    {no:'26/PKL/TGR/08/00168', tglBuat:'11/08/2026 09:12', tglPicking:'11/08/2026', cabang:'Tangerang', gudang:'(03-GUU) Gudang Utama-TGR', area:'JABODETABEK BANTEN',
      customerKode:'CUST-006', customerNama:'Toko Family Mart Jaya', customerAlamat:'Jl. Kelapa Gading Boulevard No. 9, Jakarta Utara',
      noSO:'26/SO/HO/08/00013', tglSO:'08/08/2026 09:10', noSOKeterangan:'Order rutin bulanan Sembako',
      status:'Waiting Request Packing', picker:['Deni Martianu'], pickerChecker:'Maulana Bukhori', keterangan:'',
      items:[
        {kode:'BRG-001', nama:'Minyak Goreng Sunco 2L', satuan:'Dus', qtyOrder:20, qtyPicking:20, batches:[{kode:'BT-260701-01', qty:20, tglExpired:'2027-06-30'}], qtySisa:20},
        {kode:'BRG-002', nama:'Gula Pasir Gulaku 1kg', satuan:'Karung', qtyOrder:80, qtyPicking:80, batches:[{kode:'BT-260702-02', qty:80, tglExpired:'2027-05-15'}], qtySisa:80},
      ],
      tglInput:'11/08/2026 09:12', userInput:'sidik', tglEdit:'', userEdit:''},
    {no:'26/PKL/SBY/08/00042', tglBuat:'08/08/2026 14:05', tglPicking:'08/08/2026', cabang:'Surabaya', gudang:'(01-GUU) Gudang Utama-SBY', area:'JAWA TIMUR',
      customerKode:'CUST-002', customerNama:'UD Makmur Jaya', customerAlamat:'Jl. Raya Darmo No. 45, Surabaya',
      noSO:'26/SO/SBY/08/00007', tglSO:'08/08/2026 10:22', noSOKeterangan:'Restock Sembako gudang Surabaya',
      status:'Terkirim', picker:['Slamet Riyadi','Ahmad Fauzi'], pickerChecker:'Deni Martianu', keterangan:'',
      items:[
        {kode:'BRG-007', nama:'Susu Kental Manis Indomilk 380gr', satuan:'Dus', qtyOrder:30, qtyPicking:30, batches:[{kode:'BT-260707-07', qty:30, tglExpired:'2027-07-31'}], qtySisa:150},
        {kode:'BRG-008', nama:'Teh Celup Sariwangi 25s', satuan:'Dus', qtyOrder:40, qtyPicking:40, batches:[{kode:'BT-260708-08', qty:40, tglExpired:'2027-08-31'}], qtySisa:180},
      ],
      tglInput:'08/08/2026 14:05', userInput:'sidik', tglEdit:'09/08/2026 08:30', userEdit:'sidik'},
    {no:'26/PKL/BDG/08/00021', tglBuat:'09/08/2026 10:30', tglPicking:'09/08/2026', cabang:'Bandung', gudang:'(02-GUU) Gudang Utama-BDG', area:'JAWA BARAT',
      customerKode:'CUST-003', customerNama:'CV Berkah Abadi', customerAlamat:'Jl. Soekarno Hatta No. 88, Bandung',
      noSO:'26/SO/BDG/08/00005', tglSO:'09/08/2026 09:00', noSOKeterangan:'Order beras premium',
      status:'Waiting Request Packing', picker:['Dian Permata Sari'], pickerChecker:'Rudi Hartono', keterangan:'',
      items:[
        {kode:'BRG-003', nama:'Beras Premium Rojolele 5kg', satuan:'Karung', qtyOrder:15, qtyPicking:0, batches:[], qtySisa:0},
      ],
      tglInput:'09/08/2026 10:30', userInput:'sidik', tglEdit:'', userEdit:''},
    {no:'26/PKL/MDN/08/00015', tglBuat:'06/08/2026 09:50', tglPicking:'06/08/2026', cabang:'Medan', gudang:'(04-GUU) Gudang Utama-MDN', area:'SUMATERA UTARA',
      customerKode:'CUST-004', customerNama:'Toko Anugrah', customerAlamat:'Jl. Gatot Subroto No. 21, Medan',
      noSO:'26/SO/MDN/08/00003', tglSO:'06/08/2026 08:40', noSOKeterangan:'Order Tepung Terigu bulanan',
      status:'Terkirim', picker:['Rudi Hartono'], pickerChecker:'Slamet Riyadi', keterangan:'',
      items:[
        {kode:'BRG-004', nama:'Tepung Terigu Segitiga Biru 1kg', satuan:'Karung', qtyOrder:50, qtyPicking:50, batches:[{kode:'BT-260704-04', qty:50, tglExpired:'2027-01-31'}], qtySisa:250},
      ],
      tglInput:'06/08/2026 09:50', userInput:'sidik', tglEdit:'06/08/2026 16:00', userEdit:'sidik'},
    {no:'26/PKL/MKS/08/00009', tglBuat:'07/08/2026 12:00', tglPicking:'07/08/2026', cabang:'Makassar', gudang:'(05-GUU) Gudang Utama-MKS', area:'SULAWESI SELATAN',
      customerKode:'CUST-005', customerNama:'UD Sinar Harapan', customerAlamat:'Jl. Perintis Kemerdekaan No. 5, Makassar',
      noSO:'26/SO/MKS/08/00002', tglSO:'07/08/2026 11:15', noSOKeterangan:'Ditolak - customer status Non Aktif, cek ulang legalitas',
      status:'Waiting Request Packing', picker:['Ahmad Fauzi'], pickerChecker:'Dian Permata Sari', keterangan:'',
      items:[
        {kode:'BRG-005', nama:'Mie Instan Indomie Goreng', satuan:'Dus', qtyOrder:100, qtyPicking:0, batches:[], qtySisa:0},
      ],
      tglInput:'07/08/2026 12:00', userInput:'sidik', tglEdit:'', userEdit:''},
    {no:'26/PKL/HO/08/00077', tglBuat:'07/08/2026 10:20', tglPicking:'07/08/2026', cabang:'Head Office', gudang:'(00-GUU) Gudang Utama-HO', area:'JABODETABEK BANTEN',
      customerKode:'CUST-001', customerNama:'Toko Sumber Rejeki', customerAlamat:'Jl. Mangga Dua Raya No. 12, Jakarta Pusat',
      noSO:'26/SO/HO/08/00011', tglSO:'07/08/2026 09:45', noSOKeterangan:'Order tambahan Kopi Kapal Api',
      status:'Terkirim', picker:['Maulana Bukhori','Deni Martianu'], pickerChecker:'Ahmad Fauzi', keterangan:'',
      items:[
        {kode:'BRG-006', nama:'Kecap Manis ABC 600ml', satuan:'Dus', qtyOrder:60, qtyPicking:60, batches:[{kode:'BT-260706-06', qty:60, tglExpired:'2027-03-31'}], qtySisa:190},
        {kode:'BRG-009', nama:'Kopi Kapal Api 165gr', satuan:'Dus', qtyOrder:20, qtyPicking:20, batches:[{kode:'BT-260709-09', qty:20, tglExpired:'2027-09-30'}], qtySisa:100},
      ],
      tglInput:'07/08/2026 10:20', userInput:'sidik', tglEdit:'07/08/2026 15:30', userEdit:'sidik'},
    {no:'26/PKL/SMG/08/00013', tglBuat:'05/08/2026 14:15', tglPicking:'05/08/2026', cabang:'Semarang', gudang:'(06-GUU) Gudang Utama-SMG', area:'JAWA TENGAH',
      customerKode:'CUST-007', customerNama:'CV Maju Terus', customerAlamat:'Jl. Pandanaran No. 33, Semarang',
      noSO:'26/SO/SMG/08/00004', tglSO:'05/08/2026 13:30', noSOKeterangan:'Order Susu Kental Manis',
      status:'Waiting Request Packing', picker:['Dian Permata Sari'], pickerChecker:'Maulana Bukhori', keterangan:'',
      items:[
        {kode:'BRG-007', nama:'Susu Kental Manis Indomilk 380gr', satuan:'Dus', qtyOrder:25, qtyPicking:0, batches:[], qtySisa:0},
      ],
      tglInput:'05/08/2026 14:15', userInput:'sidik', tglEdit:'', userEdit:''},
    {no:'26/PKL/SBY/08/00043', tglBuat:'09/08/2026 11:10', tglPicking:'09/08/2026', cabang:'Surabaya', gudang:'(01-GUU) Gudang Utama-SBY', area:'JAWA TIMUR',
      customerKode:'CUST-008', customerNama:'Toko Sejahtera', customerAlamat:'Jl. Kertajaya No. 67, Surabaya',
      noSO:'26/SO/SBY/08/00006', tglSO:'09/08/2026 10:00', noSOKeterangan:'Order Teh Celup mingguan',
      status:'Waiting Request Packing', picker:['Slamet Riyadi'], pickerChecker:'Rudi Hartono', keterangan:'',
      items:[
        {kode:'BRG-008', nama:'Teh Celup Sariwangi 25s', satuan:'Dus', qtyOrder:35, qtyPicking:0, batches:[], qtySisa:0},
      ],
      tglInput:'09/08/2026 11:10', userInput:'sidik', tglEdit:'', userEdit:''},
    {no:'26/PKL/HO/08/00078', tglBuat:'11/08/2026 09:00', tglPicking:'11/08/2026', cabang:'Head Office', gudang:'(00-GUU) Gudang Utama-HO', area:'JABODETABEK BANTEN',
      customerKode:'CUST-006', customerNama:'Toko Family Mart Jaya', customerAlamat:'Jl. Kelapa Gading Boulevard No. 9, Jakarta Utara',
      noSO:'26/SO/HO/08/00010', tglSO:'11/08/2026 08:15', noSOKeterangan:'Order Tepung Terigu tambahan',
      status:'Terkirim', picker:['Rudi Hartono','Ahmad Fauzi'], pickerChecker:'Deni Martianu', keterangan:'',
      items:[
        {kode:'BRG-010', nama:'Sabun Mandi Lifebuoy 90gr', satuan:'Dus', qtyOrder:70, qtyPicking:70, batches:[{kode:'BT-260710-10', qty:70, tglExpired:'2027-10-31'}], qtySisa:230},
      ],
      tglInput:'11/08/2026 09:00', userInput:'sidik', tglEdit:'11/08/2026 13:45', userEdit:'sidik'},
  ],
  /* Daftar nama Picker/Checker gudang (dipakai field "Picker" [multi-tag]
     & "Picker & Checker" [dropdown tunggal] di form Picking List). */
  pickerList:['Deni Martianu','Maulana Bukhori','Slamet Riyadi','Ahmad Fauzi','Dian Permata Sari','Rudi Hartono'],
  /* Stok per-batch/lot per kode barang (dipakai picker "Pilih Batch" &
     helper Ready/Qty Sisa di form Picking List, lihat js/pages/picking-list.js).
     Kode batch mengikuti format BT-YYMMDD-NN yang sudah dipakai di
     DATA.salesOrders[].items[].noBatch. Nilai qtyTersedia baris
     BRG-001 (40) & BRG-002 (160) SENGAJA dipilih 2x lipat dari qty yang
     dialokasikan di DATA.pickingList[0] (20 & 80) supaya rumus Qty Sisa
     (= qtyTersedia lot − qty dialokasikan di baris pertama) menghasilkan
     PERSIS 20 & 80 seperti di screenshot contoh — lihat komentar rumus
     lengkap di pklRecalcItem() (picking-list.js). */
  batchStock:{
    'BRG-001':[{kode:'BT-260701-01', qtyTersedia:40, tglExpired:'2027-06-30'}, {kode:'BT-260810-11', qtyTersedia:150, tglExpired:'2027-09-30'}],
    'BRG-002':[{kode:'BT-260702-02', qtyTersedia:160, tglExpired:'2027-05-15'}],
    'BRG-003':[{kode:'BT-260703-03', qtyTersedia:200, tglExpired:'2027-02-28'}],
    'BRG-004':[{kode:'BT-260704-04', qtyTersedia:300, tglExpired:'2027-01-31'}],
    'BRG-005':[{kode:'BT-260705-05', qtyTersedia:500, tglExpired:'2027-04-30'}],
    'BRG-006':[{kode:'BT-260706-06', qtyTersedia:250, tglExpired:'2027-03-31'}],
    'BRG-007':[{kode:'BT-260707-07', qtyTersedia:180, tglExpired:'2027-07-31'}],
    'BRG-008':[{kode:'BT-260708-08', qtyTersedia:220, tglExpired:'2027-08-31'}],
    'BRG-009':[{kode:'BT-260709-09', qtyTersedia:120, tglExpired:'2027-09-30'}],
    'BRG-010':[{kode:'BT-260710-10', qtyTersedia:300, tglExpired:'2027-10-31'}],
  },
  packing:[
    {no:'PACK-0701', tgl:'2026-08-01', so:'SO-2026-0812', status:'Selesai'},
    {no:'PACK-0702', tgl:'2026-08-02', so:'SO-2026-0813', status:'Selesai'},
    {no:'PACK-0703', tgl:'2026-08-03', so:'SO-2026-0814', status:'Proses'},
    {no:'PACK-0704', tgl:'2026-08-04', so:'SO-2026-0816', status:'Baru'},
  ],
  /* =========================================================
     2026-08-28 — ARRAY BARU "arFakturHistoris": saldo piutang
     HISTORIS per faktur, ditambahkan khusus untuk laporan Report
     Center baru "FA-10 Lap Umur Piutang" (Account Receivable,
     permission code PrintReceivabledDueDate — report SUNGGUHAN
     ke-4 setelah FA-08/Bonus Penjualan/Transfer Produk Bonus,
     lihat js/pages/reports.js rcuBuildRows()).
     KENAPA PERLU ARRAY BARU: laporan umur piutang butuh baris
     outstanding yang tersebar di banyak bucket umur (1-30/31-60/
     61-90/91-120/>120 hari), sedangkan DATA.invoices semuanya
     bertanggal Agustus 2026 (semua akan jatuh di bucket 1-30 saja)
     dan TIDAK BOLEH ditambah baris lama karena 8+2 barisnya
     terdokumentasi di-chain 1:1 ke DATA.pickingList/DATA.promotion
     (lihat komentar besar di atas DATA.invoices). Precedent yang
     diikuti: 6 baris "historis/dekoratif" bernomor Juli di
     DATA.penerimaanPiutang (faktur lama yang sengaja tidak
     terhubung ke DATA.invoices).
     REKONSILIASI (bukan angka acak): sisa historis per customer +
     outstanding live DATA.invoices (jumlah - dibayar, per batas
     tanggal default 28/08/2026) = PERSIS field `piutang` yang
     SUDAH ADA di DATA.customers sejak awal (saldo piutang yang
     dipakai hitung "Sisa CL" di Sales Order):
       CUST-001 17.515.000 + 735.000            = 18.250.000
       CUST-002  5.240.000 + (880.000+3.000.000) =  9.120.000
       CUST-003  4.300.000 + 0                   =  4.300.000
       CUST-004  6.000.000 + 600.000             =  6.600.000
       CUST-005  1.900.000 + 250.000             =  2.150.000
       CUST-006  7.970.000 + (1.700.000+200.000) =  9.870.000
       CUST-007    800.000 + 400.000             =  1.200.000
       CUST-008  2.770.000 + 350.000             =  3.120.000
     — jadi array ini adalah RINCIAN per-faktur dari saldo piutang
     customer yang memang sudah ada, bukan data baru yang lepas.
     tglJthTempo tiap baris konsisten dgn pola syarat bayar customer
     yang dipakai faktur live-nya (HO/SMG/MKS N30, SBY/BDG N14,
     MDN N45). Nomor faktur mengikuti format nomor per-cabang yang
     sudah ada, dicek tidak bentrok dengan nomor manapun di
     DATA.invoices/DATA.penerimaanPiutang (referensi deskriptif,
     bukan foreign-key — precedent yang sama dgn field serupa di
     modul lain). */
  arFakturHistoris:[
    {customerKode:'CUST-001', cabang:'Head Office', noFaktur:'25/SI/HO/11/00021', tglFaktur:'10/11/2025', tglJthTempo:'10/12/2025', sisa:6500000},
    {customerKode:'CUST-001', cabang:'Head Office', noFaktur:'26/SI/HO/05/00012', tglFaktur:'12/05/2026', tglJthTempo:'11/06/2026', sisa:7200000},
    {customerKode:'CUST-001', cabang:'Head Office', noFaktur:'26/SI/HO/07/00044', tglFaktur:'08/07/2026', tglJthTempo:'07/08/2026', sisa:3815000},
    {customerKode:'CUST-002', cabang:'Surabaya', noFaktur:'26/SI/SBY/06/00025', tglFaktur:'10/06/2026', tglJthTempo:'24/06/2026', sisa:3100000},
    {customerKode:'CUST-002', cabang:'Surabaya', noFaktur:'26/SI/SBY/07/00031', tglFaktur:'20/07/2026', tglJthTempo:'03/08/2026', sisa:2140000},
    {customerKode:'CUST-003', cabang:'Bandung', noFaktur:'26/SI/BDG/05/00017', tglFaktur:'20/05/2026', tglJthTempo:'03/06/2026', sisa:2500000},
    {customerKode:'CUST-003', cabang:'Bandung', noFaktur:'26/SI/BDG/07/00022', tglFaktur:'15/07/2026', tglJthTempo:'29/07/2026', sisa:1800000},
    {customerKode:'CUST-004', cabang:'Medan', noFaktur:'26/SI/MDN/03/00008', tglFaktur:'05/03/2026', tglJthTempo:'19/04/2026', sisa:3750000},
    {customerKode:'CUST-004', cabang:'Medan', noFaktur:'26/SI/MDN/06/00019', tglFaktur:'18/06/2026', tglJthTempo:'02/08/2026', sisa:2250000},
    {customerKode:'CUST-005', cabang:'Makassar', noFaktur:'26/SI/MKS/07/00020', tglFaktur:'05/07/2026', tglJthTempo:'04/08/2026', sisa:1900000},
    {customerKode:'CUST-006', cabang:'Head Office', noFaktur:'26/SI/HO/06/00033', tglFaktur:'02/06/2026', tglJthTempo:'02/07/2026', sisa:4470000},
    {customerKode:'CUST-006', cabang:'Head Office', noFaktur:'26/SI/HO/07/00051', tglFaktur:'22/07/2026', tglJthTempo:'21/08/2026', sisa:3500000},
    {customerKode:'CUST-007', cabang:'Semarang', noFaktur:'26/SI/SMG/07/00040', tglFaktur:'12/07/2026', tglJthTempo:'11/08/2026', sisa:800000},
    {customerKode:'CUST-008', cabang:'Surabaya', noFaktur:'26/SI/SBY/05/00028', tglFaktur:'12/05/2026', tglJthTempo:'26/05/2026', sisa:2770000},
  ],
  /* Penerimaan Piutang (Customer & Penjualan > Daftar Transaksi >
     Penerimaan Piutang, page:'penerimaanPiutang') — lihat catatan
     desain lengkap di header js/pages/penerimaan-piutang.template.js.
     Sebelumnya 4 baris dummy {no,tgl,customer,jumlah,metode} lepas
     tanpa hubungan ke modul lain — SUDAH DIHAPUS, diganti 8 baris di
     bawah. 2 baris PERTAMA BENAR-BENAR chained ke DATA.invoices lewat
     fakturs[].invoiceNo (Toko Sumber Rejeki melunasi 26/SI/HO/08/00001
     penuh; Toko Family Mart Jaya melunasi 26/SI/HO/08/00002 sebagian,
     sisa 200.000 masih outstanding — invoiceNo itu dipakai ppSave()/
     openPpDeleteConfirm() di penerimaan-piutang.js utk menambah/
     mengembalikan field `dibayar` pada invoice terkait). 6 baris
     sisanya historis/dekoratif (nomor Juli, invoiceNo:'' — tidak
     terhubung ke DATA.invoices yg cuma berisi Agustus), termasuk 1
     baris (CV Maju Terus) dgn 2 faktur sekaligus utk mendemokan
     "Lunasi Beberapa Faktur" beneran plural. UD Makmur Jaya
     (26/SI/SBY/08/00001, posted, 880.000) SENGAJA tidak muncul di
     sini sama sekali — dibiarkan belum lunas utk demo ujung-ke-ujung
     fitur "+ Tambah". */
  penerimaanPiutang:[
    {no:'26/CL/HO/08/00002', cabang:'Head Office', tgl:'13/08/2026',
      customerKode:'CUST-006', customerNama:'Toko Family Mart Jaya', badanUsaha:'', noPenagihanPiutang:'',
      akunBankKode:'110107', tipeTransaksi:'Terima Kas', cair:true, noGiro:'', bankSumber:'', tglJthTempoBank:'13/08/2026',
      fakturs:[{no:'26/SI/HO/08/00002', cabang:'Head Office', tipeTransaksi:'Jual Kredit', tglFaktur:'11/08/2026', tglJthTempo:'10/09/2026', mataUang:'IDR', kurs:1, reminder:350000, pembayaran:150000, checked:true, invoiceNo:'26/SI/HO/08/00002'}],
      keteranganUangMuka:'', kursUangMuka:1, jadikanUangMuka:0,
      keterangan:'VA - Terima Piutang 26/SI/HO/08/00002 TOKO FAMILY MART JAYA',
      jumlahTidakSama:true, kursTarget:1, status:'Approved',
      totalPembayaran:150000, jumlahBank:150000, jumlahPiutang:350000},
    {no:'26/CL/HO/08/00001', cabang:'Head Office', tgl:'12/08/2026',
      customerKode:'CUST-001', customerNama:'Toko Sumber Rejeki', badanUsaha:'', noPenagihanPiutang:'',
      akunBankKode:'110107', tipeTransaksi:'Terima Kas', cair:true, noGiro:'', bankSumber:'', tglJthTempoBank:'12/08/2026',
      fakturs:[{no:'26/SI/HO/08/00001', cabang:'Head Office', tipeTransaksi:'Jual Kredit', tglFaktur:'07/08/2026', tglJthTempo:'06/09/2026', mataUang:'IDR', kurs:1, reminder:1120000, pembayaran:1120000, checked:true, invoiceNo:'26/SI/HO/08/00001'}],
      keteranganUangMuka:'', kursUangMuka:1, jadikanUangMuka:0,
      keterangan:'VA - Terima Piutang 26/SI/HO/08/00001 TOKO SUMBER REJEKI',
      jumlahTidakSama:false, kursTarget:1, status:'Approved',
      totalPembayaran:1120000, jumlahBank:1120000, jumlahPiutang:1120000},
    {no:'26/CL/TGR/07/00001', cabang:'Tangerang', tgl:'26/07/2026',
      customerKode:'CUST-001', customerNama:'Toko Sumber Rejeki', badanUsaha:'', noPenagihanPiutang:'',
      akunBankKode:'110115', tipeTransaksi:'Terima Kas', cair:true, noGiro:'', bankSumber:'', tglJthTempoBank:'26/07/2026',
      fakturs:[{no:'26/SI/TGR/07/00028', cabang:'Tangerang', tipeTransaksi:'Jual Kredit', tglFaktur:'14/07/2026', tglJthTempo:'13/08/2026', mataUang:'IDR', kurs:1, reminder:530000, pembayaran:530000, checked:true, invoiceNo:''}],
      keteranganUangMuka:'', kursUangMuka:1, jadikanUangMuka:0,
      keterangan:'VA - Terima Piutang 26/SI/TGR/07/00028 TOKO SUMBER REJEKI',
      jumlahTidakSama:false, kursTarget:1, status:'Approved',
      totalPembayaran:530000, jumlahBank:530000, jumlahPiutang:530000},
    {no:'26/CL/MKS/07/00001', cabang:'Makassar', tgl:'25/07/2026',
      customerKode:'CUST-005', customerNama:'UD Sinar Harapan', badanUsaha:'', noPenagihanPiutang:'',
      akunBankKode:'110121', tipeTransaksi:'Terima Kas', cair:true, noGiro:'', bankSumber:'', tglJthTempoBank:'25/07/2026',
      fakturs:[{no:'26/SI/MKS/07/00012', cabang:'Makassar', tipeTransaksi:'Jual Kredit', tglFaktur:'12/07/2026', tglJthTempo:'12/07/2026', mataUang:'IDR', kurs:1, reminder:215000, pembayaran:215000, checked:true, invoiceNo:''}],
      keteranganUangMuka:'', kursUangMuka:1, jadikanUangMuka:0,
      keterangan:'VA - Terima Piutang 26/SI/MKS/07/00012 UD SINAR HARAPAN',
      jumlahTidakSama:false, kursTarget:1, status:'Approved',
      totalPembayaran:215000, jumlahBank:215000, jumlahPiutang:215000},
    {no:'26/CL/MDN/07/00001', cabang:'Medan', tgl:'24/07/2026',
      customerKode:'CUST-004', customerNama:'Toko Anugrah', badanUsaha:'', noPenagihanPiutang:'',
      akunBankKode:'110118', tipeTransaksi:'Terima Cek', cair:true, noGiro:'CK-002310', bankSumber:'Bank BRI MDN', tglJthTempoBank:'24/07/2026',
      fakturs:[{no:'26/SI/MDN/07/00005', cabang:'Medan', tipeTransaksi:'Jual Kredit', tglFaktur:'01/07/2026', tglJthTempo:'15/08/2026', mataUang:'IDR', kurs:1, reminder:660000, pembayaran:660000, checked:true, invoiceNo:''}],
      keteranganUangMuka:'', kursUangMuka:1, jadikanUangMuka:0,
      keterangan:'VA - Terima Piutang 26/SI/MDN/07/00005 TOKO ANUGRAH',
      jumlahTidakSama:false, kursTarget:1, status:'Approved',
      totalPembayaran:660000, jumlahBank:660000, jumlahPiutang:660000},
    {no:'26/CL/BDG/07/00001', cabang:'Bandung', tgl:'23/07/2026',
      customerKode:'CUST-003', customerNama:'CV Berkah Abadi', badanUsaha:'', noPenagihanPiutang:'',
      akunBankKode:'110112', tipeTransaksi:'Terima Kas', cair:true, noGiro:'', bankSumber:'', tglJthTempoBank:'23/07/2026',
      fakturs:[{no:'26/SI/BDG/07/00009', cabang:'Bandung', tipeTransaksi:'Jual Kredit', tglFaktur:'05/07/2026', tglJthTempo:'19/07/2026', mataUang:'IDR', kurs:1, reminder:430000, pembayaran:430000, checked:true, invoiceNo:''}],
      keteranganUangMuka:'', kursUangMuka:1, jadikanUangMuka:0,
      keterangan:'VA - Terima Piutang 26/SI/BDG/07/00009 CV BERKAH ABADI',
      jumlahTidakSama:false, kursTarget:1, status:'Approved',
      totalPembayaran:430000, jumlahBank:430000, jumlahPiutang:430000},
    {no:'26/CL/SBY/07/00001', cabang:'Surabaya', tgl:'22/07/2026',
      customerKode:'CUST-008', customerNama:'Toko Sejahtera', badanUsaha:'', noPenagihanPiutang:'',
      akunBankKode:'110109', tipeTransaksi:'Terima Kas', cair:true, noGiro:'', bankSumber:'', tglJthTempoBank:'22/07/2026',
      fakturs:[{no:'26/SI/SBY/07/00018', cabang:'Surabaya', tipeTransaksi:'Jual Kredit', tglFaktur:'10/07/2026', tglJthTempo:'24/07/2026', mataUang:'IDR', kurs:1, reminder:312000, pembayaran:312000, checked:true, invoiceNo:''}],
      keteranganUangMuka:'', kursUangMuka:1, jadikanUangMuka:0,
      keterangan:'VA - Terima Piutang 26/SI/SBY/07/00018 TOKO SEJAHTERA',
      jumlahTidakSama:false, kursTarget:1, status:'Approved',
      totalPembayaran:312000, jumlahBank:312000, jumlahPiutang:312000},
    {no:'26/CL/SMG/07/00001', cabang:'Semarang', tgl:'20/07/2026',
      customerKode:'CUST-007', customerNama:'CV Maju Terus', badanUsaha:'', noPenagihanPiutang:'',
      akunBankKode:'110124', tipeTransaksi:'Terima Giro', cair:false, noGiro:'GR-000451', bankSumber:'Bank Permata SMG', tglJthTempoBank:'20/08/2026',
      fakturs:[
        {no:'26/SI/SMG/07/00021', cabang:'Semarang', tipeTransaksi:'Jual Kredit', tglFaktur:'01/07/2026', tglJthTempo:'31/07/2026', mataUang:'IDR', kurs:1, reminder:620000, pembayaran:620000, checked:true, invoiceNo:''},
        /* Faktur ke-2 SENGAJA didemokan dengan PPN & PPH ditanggung
           customer (fitur baru 2026-08-20, lihat catatan besar di
           penerimaan-piutang.template.js): potonganPpn & potonganPph
           dua-duanya true. PPN (57.477,48) masih BELUM diterima SSP-nya
           (sudahTerimaSspPpn:false, jadi tetap outstanding di menu baru
           "Transaksi A.R. SSP" — dipakai utk demo picker customer CV
           MAJU TERUS di modul itu), sementara PPH (7.837,84) SUDAH
           diterima SSP-nya (sudahTerimaSspPph:true) — dicatat lewat 1
           baris histori DATA.penerimaanSsp (26/NK/SMG/07/00001) di bawah.
           Nominal AR SSP dihitung dari Pembayaran (580.000) via
           ppFakturTax(): DPP=522.522,52 (580.000/1,11), PPN=57.477,48,
           PPH 1,5%=7.837,84 — persis formula yang diverifikasi cocok
           dgn contoh screenshot user (DPP=Total/1,11, PPN=DPP x 11%). */
        {no:'26/SI/SMG/07/00033', cabang:'Semarang', tipeTransaksi:'Jual Kredit', tglFaktur:'09/07/2026', tglJthTempo:'08/08/2026', mataUang:'IDR', kurs:1, reminder:580000, pembayaran:580000, checked:true, invoiceNo:'',
          potonganPpn:true, potonganPph:true, sudahTerimaSspPpn:false, sudahTerimaSspPph:true, pphKode:'PPH 22 (1.5%)',
          noNtpnPpnAda:false, noNtpnPpn:'', tglNtpnPpn:'',
          noNtpnPphAda:true, noNtpnPph:'1234567890123456', tglNtpnPph:'20/07/2026'},
      ],
      keteranganUangMuka:'', kursUangMuka:1, jadikanUangMuka:0,
      keterangan:'VA - Terima Piutang 26/SI/SMG/07/00021, 26/SI/SMG/07/00033 CV MAJU TERUS',
      jumlahTidakSama:false, kursTarget:1, status:'Approved',
      /* totalPembayaran/jumlahBank sudah memperhitungkan potongan PPN+PPH
         faktur ke-2 (620.000 + [580.000-57.477,48-7.837,84]=514.684,68 =
         1.134.684,68) — angka ini DIPRA-HITUNG persis sama dengan hasil
         ppRecalcTotals()/ppFakturTax() supaya list & form (mode Lihat)
         menampilkan nilai yang identik. jumlahPiutang TETAP gross
         1.200.000 (AR yang dilunasi tidak berkurang oleh potongan pajak). */
      totalPembayaran:1134684.68, jumlahBank:1134684.68, jumlahPiutang:1200000},
    /* 3 baris BARU 2026-08-21 (lanjutan fitur PPN/PPH SSP 2026-08-20),
       ditambahkan khusus untuk mendemokan laporan baru "FA-08 Lap SSP
       Belum Diterima" (Report Center > Account Receivable) — lihat
       js/pages/reports.js (rcSspBuildRows). Sebelumnya cuma 1 faktur
       (26/SI/SMG/07/00033 di atas) yang punya potonganPpn/Pph, jadi
       laporan itu hanya akan menampilkan 1 baris — DITAMBAH 3 record
       BARU (bukan mengedit yang sudah ada, supaya totalPembayaran/
       jumlahBank/jumlahPiutang record LAMA yang sudah diverifikasi
       tidak berisiko berubah) di 3 cabang lain supaya laporan punya
       variasi cabang/customer yang masuk akal. Semua nilai dihitung
       dari formula yang sama (ppFakturTax(): DPP=Pembayaran÷1,11,
       PPN=Pembayaran−DPP, PPH=DPP×%KodePPH) sehingga totalPembayaran/
       jumlahBank tetap konsisten dengan hasil ppRecalcTotals() kalau
       baris ini dibuka lewat modul Penerimaan Piutang sendiri. */
    {no:'26/CL/MDN/08/00001', cabang:'Medan', tgl:'07/08/2026',
      customerKode:'CUST-004', customerNama:'Toko Anugrah', badanUsaha:'', noPenagihanPiutang:'',
      akunBankKode:'110118', tipeTransaksi:'Terima Kas', cair:true, noGiro:'', bankSumber:'', tglJthTempoBank:'07/08/2026',
      /* PPN & PPh dua-duanya baru pertama kali dilaporkan, belum ada
         NTPN sama sekali (kontras dgn baris SMG yang PPh-nya sudah
         diterima) — DPP=900.000/1,11=810.810,81, PPN=89.189,19,
         PPh 1,5%=12.162,16. */
      fakturs:[{no:'26/SI/MDN/08/00003', cabang:'Medan', tipeTransaksi:'Jual Kredit', tglFaktur:'05/08/2026', tglJthTempo:'04/09/2026', mataUang:'IDR', kurs:1, reminder:900000, pembayaran:900000, checked:true, invoiceNo:'',
        potonganPpn:true, potonganPph:true, sudahTerimaSspPpn:false, sudahTerimaSspPph:false, pphKode:'PPH 22 (1.5%)',
        noNtpnPpnAda:false, noNtpnPpn:'', tglNtpnPpn:'',
        noNtpnPphAda:false, noNtpnPph:'', tglNtpnPph:''}],
      keteranganUangMuka:'', kursUangMuka:1, jadikanUangMuka:0,
      keterangan:'VA - Terima Piutang 26/SI/MDN/08/00003 TOKO ANUGRAH',
      jumlahTidakSama:false, kursTarget:1, status:'Approved',
      totalPembayaran:798648.65, jumlahBank:798648.65, jumlahPiutang:900000},
    {no:'26/CL/SBY/08/00001', cabang:'Surabaya', tgl:'14/08/2026',
      customerKode:'CUST-008', customerNama:'Toko Sejahtera', badanUsaha:'', noPenagihanPiutang:'',
      akunBankKode:'110109', tipeTransaksi:'Terima Kas', cair:true, noGiro:'', bankSumber:'', tglJthTempoBank:'14/08/2026',
      /* Hanya PPN yang dipotong customer (potonganPph:false, jadi
         kolom PPh ps 22 di laporan tetap kosong utk baris ini) —
         NTPN PPN SUDAH ada tapi Tgl NTPN-nya belum dikonfirmasi
         (mendemokan variasi "nomor ada, tanggal menyusul" persis
         beberapa baris di contoh PDF user). DPP=1.500.000/1,11=
         1.351.351,35, PPN=148.648,65. */
      fakturs:[{no:'26/SI/SBY/08/00006', cabang:'Surabaya', tipeTransaksi:'Jual Kredit', tglFaktur:'12/08/2026', tglJthTempo:'11/09/2026', mataUang:'IDR', kurs:1, reminder:1500000, pembayaran:1500000, checked:true, invoiceNo:'',
        potonganPpn:true, potonganPph:false, sudahTerimaSspPpn:false, sudahTerimaSspPph:false, pphKode:'',
        noNtpnPpnAda:true, noNtpnPpn:'0X4471182KDLQAE9', tglNtpnPpn:'',
        noNtpnPphAda:false, noNtpnPph:'', tglNtpnPph:''}],
      keteranganUangMuka:'', kursUangMuka:1, jadikanUangMuka:0,
      keterangan:'VA - Terima Piutang 26/SI/SBY/08/00006 TOKO SEJAHTERA',
      jumlahTidakSama:false, kursTarget:1, status:'Approved',
      totalPembayaran:1351351.35, jumlahBank:1351351.35, jumlahPiutang:1500000},
    {no:'26/CL/BDG/08/00001', cabang:'Bandung', tgl:'17/08/2026',
      customerKode:'CUST-003', customerNama:'CV Berkah Abadi', badanUsaha:'', noPenagihanPiutang:'',
      akunBankKode:'110112', tipeTransaksi:'Terima Kas', cair:true, noGiro:'', bankSumber:'', tglJthTempoBank:'17/08/2026',
      /* PPN & PPh dua-duanya belum diterima, belum ada NTPN — DPP=
         2.000.000/1,11=1.801.801,80, PPN=198.198,20, PPh 1,5%=
         27.027,03. */
      fakturs:[{no:'26/SI/BDG/08/00004', cabang:'Bandung', tipeTransaksi:'Jual Kredit', tglFaktur:'15/08/2026', tglJthTempo:'14/09/2026', mataUang:'IDR', kurs:1, reminder:2000000, pembayaran:2000000, checked:true, invoiceNo:'',
        potonganPpn:true, potonganPph:true, sudahTerimaSspPpn:false, sudahTerimaSspPph:false, pphKode:'PPH 22 (1.5%)',
        noNtpnPpnAda:false, noNtpnPpn:'', tglNtpnPpn:'',
        noNtpnPphAda:false, noNtpnPph:'', tglNtpnPph:''}],
      keteranganUangMuka:'', kursUangMuka:1, jadikanUangMuka:0,
      keterangan:'VA - Terima Piutang 26/SI/BDG/08/00004 CV BERKAH ABADI',
      jumlahTidakSama:false, kursTarget:1, status:'Approved',
      totalPembayaran:1774774.77, jumlahBank:1774774.77, jumlahPiutang:2000000},
  ],
  /* Transaksi A.R. SSP (Customer & Penjualan > Daftar Transaksi >
     Transaksi A.R. SSP, page:'penerimaanSsp', menu.js — sebelumnya
     placeholder murni) — lihat catatan desain lengkap di header
     js/pages/penerimaan-ssp.template.js. Setiap baris = 1 transaksi
     "Nota Kredit" penerimaan bukti Surat Setoran Pajak (SSP) PPN/PPH
     dari Customer, dibuat lewat modul ini (bukan lewat Penerimaan
     Piutang) begitu SSP yang tadinya belum diterima (dicatat sbg AR
     SSP PPN/PPH di Penerimaan Piutang) benar-benar sudah diterima.
     1 baris histori di bawah mendokumentasikan settlement PPH faktur
     26/SI/SMG/07/00033 (CV Maju Terus) yang sudahTerimaSspPph sudah
     di-set true di DATA.penerimaanPiutang di atas — PPN faktur yang
     sama SENGAJA dibiarkan belum diselesaikan (sudahTerimaSspPpn:false)
     supaya modul ini punya 1 item nyata utk didemokan lewat customer
     picker (pilih CV MAJU TERUS -> 1 baris outstanding PPN 57.477,48
     muncul). */
  penerimaanSsp:[
    {no:'26/NK/SMG/07/00001', cabang:'Semarang', tgl:'21/07/2026', customerKode:'CUST-007', customerNama:'CV Maju Terus',
      items:[{penerimaanPiutangNo:'26/CL/SMG/07/00001', fakturNo:'26/SI/SMG/07/00033', tipePajak:'PPH', nominal:7837.84, checked:true}],
      totalPpn:0, totalPph:7837.84, jumlah:7837.84,
      keterangan:'Terima SSP PPH 26/SI/SMG/07/00033 CV MAJU TERUS'},
  ],
  /* DATA.items — DIPERKAYA 2026-08-24 dengan puluhan field baru mengikuti
     screenshot MASERP "+ Persediaan Barang" (menu Persediaan Barang >
     Master & Setting > Inventory, page:'items', sebelumnya renderer
     generik read-only kolom kode/nama/kategori/satuan/stok/harga di
     js/core.js — field 6 lama itu SENGAJA TIDAK diubah/dihapus karena
     sudah dipakai luas oleh modul lain [Purchase Order/Sales Order/
     Picking List/Invoice/Faktur Penjualan SJ/Stock Request/Terima
     Barang/Pembelian BPB/Dominasi/Promotion/Price List By Province/
     Reordering Sheet/Transaksi Persediaan/dashboard Inventory] lewat
     `openPersediaanPicker()` & referensi langsung — hanya DITAMBAH field
     baru per baris, pola sama seperti pengayaan DATA.customers saat
     modul Master Customer dibangun 2026-08-18).

     Field farmasi-eksklusif pada screenshot (Kode/Nama Alkes, Kode/Nama
     Item Farma, Farma/Sub-Farma/Bentuk Sediaan/Kekuatan Sediaan/Nama
     Jenis Obat/NIE/Kelas/Kode Barang Pajak) SENGAJA dikosongkan ('')
     utk 10 barang sembako DBM ini — BUKAN field yang dihapus dari
     form/UI (tetap ditampilkan lengkap, mockup ini kan meniru screen
     MASERP apa adanya), tapi datanya kosong konsisten dgn precedent
     "Kode/Nama Farma & Alkes selalu kosong" yang SUDAH ADA di
     DATA.suppliers (kodeFarma/namaFarma/kodeAlkes/namaAlkes, sejak
     Master Supplier) & DATA.customers (Kode/Nama Customer Farma &
     Alkes, sejak Master Customer) — distributor non-farma sepenuhnya
     konsisten kosongkan field2 ini di semua master terkait. Dropdown
     Farma/Sub-Farma/Bentuk Sediaan/Zat Kandungan Aktif tetap TERHUBUNG
     ke master sungguhan yang sudah dibangun (DATA.farmakoterapi/
     DATA.subFarmakoterapi/DATA.bentukSediaan/DATA.zatKandunganAktif,
     2026-08-21) — kosong di data cuma berarti "belum dipilih", picker-
     nya tetap fungsional kalau user mau demo pilih salah satu.

     Field yang MASIH RELEVAN & DIISI utk distributor FMCG (bukan
     eksklusif farmasi): `katReorderingSheetKode` diisi 'BBS' (kode
     DATA.kategoriReorderingSheet "NON OBAT - NON ALKES" — cocok
     persis utk sembako, lihat modul itu 2026-08-21), `kategoriKode`
     mapping 1:1 dari field `kategori` (teks, sudah ada) ke kode
     DATA.kategoriBarang (Sembako->CATSMB dst., sudah match persis
     nama kategori existing), `hsCode` (kode HS Bea Cukai, relevan utk
     barang import apa pun) diisi kode HS riil kategori komoditas
     masing2 barang, `tipePenyimpanan` diadaptasi jadi opsi FMCG umum
     (Suhu Ruang/Kering & Sejuk/Dingin, MENGGANTI opsi suhu farmasi
     spesifik "Regular 25-30°C" screenshot asli — precedent adaptasi
     farmasi->FMCG sama seperti Informasi Izin Cabang), `supplier[]`
     menaut ke DATA.suppliers sungguhan (dipetakan berdasarkan
     kecocokan brand/kategori barang), `groupProduk[]` HANYA barang
     pertama (BRG-001) ditaut ke 'SMBK01' (satu-satunya baris
     DATA.groupProduk yang ada, sekadar demo tautan) sisanya kosong.

     `lokasiGudang[]` (sub-grid "Barang ini tersedia di gudang/lokasi")
     diisi 8 baris (1 per cabang, kode gudang utama `<NN>-GUU`) dengan
     `stock` PERSIS SAMA dengan `qtyPhysical` di DATA.persediaan utk
     kombinasi barang+gudang yang sama (1 sumber kebenaran, bukan angka
     baru) — sub-gudang overflow lain (`<NN>-GUU-02` dst., total 29 baris
     di DATA.gudang) SENGAJA TIDAK di-pre-populate per barang (beda dari
     screenshot yang menunjukkan puluhan baris sekaligus, termasuk kode
     gudang eksotis GKR-xx/GRJ-xx/Transit yang TIDAK ADA di DATA.gudang
     DBM — cuma 29 baris "-GUU" murni, tanpa Karantina/Reject/Transit,
     lihat modul Gudang 2026-08-12) — didownsize demi kepraktisan, tapi
     tombol "+ Tambah Semua Gudang" di form tetap benar2 menambahkan
     SEMUA 29 baris DATA.gudang yang belum ada.

     `satuanDetail` (tabel "Jenis Satuan dan Harga") diisi Satuan Dasar
     (=`satuan` yang sudah ada, konversi 1) + U/M 2 (=pcs per Dus/Karung,
     sinkron dgn `beratProduk.isiDalamKarton`), U/M 3 & 4 kosong (barang2
     ini tidak butuh lebih dari 2 tingkat satuan). `hargaBeliPerTanggal`/
     `hargaJualPerTanggal` masing2 1 baris (tanggal efektif 01/01/2026,
     tanpa akhir = masih berlaku, nilai = field `harga` yang sudah ada,
     1 sumber kebenaran). `feeDistribusi`/`budgetDiskon`/
     `hargaSpecialSupplier`/`hargaSpecialCustomer`/`salesPriceByQuantity`
     dibiarkan array kosong utk SEMUA barang (fitur tetap fungsional lwt
     "+Tambah" di form, cuma tidak ada data sample bawaan — precedent
     sama seperti banyak sub-grid opsional di modul lain yang kosong
     default). */
  items:[
    {kode:'BRG-001', nama:'Minyak Goreng Sunco 2L', kategori:'Sembako', kategoriKode:'CATSMB', satuan:'Dus', stok:1240, harga:25000,
      gambarProduk:'', kodeBarangPajak:'', kodeAlkes:'', namaAlkes:'', kodeItemFarma:'', namaItemFarma:'', kodeItemPrincipal:'PRC-BRG001',
      tipeUkuran:'2 Liter', tipeBarang:'Inventory Stock (FG)', kelas:'', katReorderingSheetKode:'BBS', farmaKode:'', subFarmaKode:'', bentukSediaanKode:'',
      konversiSatuanDasar:1, kekuatanSediaan:'', namaJenisObat:'', memo:'Dus isi 6 botol @ 2 Liter', nie:'', tglEfektif:'01/01/2026', tglExpired:'',
      tipePenyimpanan:'Suhu Ruang (15-30°C)', qtyKelipatanOrder:1, hsCode:'1512.19.00',
      tampilkanMinimumMargin:false, sembunyikanNamaBarang:false, holdPembelian:false, holdPenjualan:false, holdTransaksiInventory:false, barangBonus:false,
      statusBarang:'Aktif', zatKandunganAktif:[], groupProduk:['SMBK01'],
      beratProduk:{isiDalamKarton:6, berat:12, panjang:30, lebar:20, tinggi:15},
      feeDistribusi:[], budgetDiskon:[],
      supplier:[{kodeSupplier:'5016', namaSupplier:'PT Wilmar Nabati Indonesia', pusatBisnis:'Generik', untukPembelian:true, lapPenjualan:true}],
      konsinyasiIn:false, divisi:'None',
      hargaBeliPerTanggal:[{tglAwal:'01/01/2026', tglAkhir:'', harga:23000}], hargaJualPerTanggal:[{tglAwal:'01/01/2026', tglAkhir:'', harga:25000}],
      satuanDetail:{dasar:{barcode:'8991002101019', satuan:'Dus', satuanPajak:'', konversi:1}, um2:{barcode:'8991002101026', satuan:'Botol', satuanPajak:'', konversi:6}, um3:{barcode:'', satuan:'', satuanPajak:'', konversi:0}, um4:{barcode:'', satuan:'', satuanPajak:'', konversi:0}},
      hargaSpecialSupplier:[], hargaSpecialCustomer:[], salesPriceByQuantity:[],
      lokasiGudang:[{gudangKode:'00-GUU', stock:372, qtyMin:0, qtyMax:0}, {gudangKode:'01-GUU', stock:186, qtyMin:0, qtyMax:0}, {gudangKode:'02-GUU', stock:124, qtyMin:0, qtyMax:0}, {gudangKode:'03-GUU', stock:186, qtyMin:0, qtyMax:0}, {gudangKode:'04-GUU', stock:99, qtyMin:0, qtyMax:0}, {gudangKode:'05-GUU', stock:87, qtyMin:0, qtyMax:0}, {gudangKode:'06-GUU', stock:99, qtyMin:0, qtyMax:0}, {gudangKode:'07-GUU', stock:87, qtyMin:0, qtyMax:0}]},
    {kode:'BRG-002', nama:'Gula Pasir Gulaku 1kg', kategori:'Sembako', kategoriKode:'CATSMB', satuan:'Karung', stok:860, harga:15000,
      gambarProduk:'', kodeBarangPajak:'', kodeAlkes:'', namaAlkes:'', kodeItemFarma:'', namaItemFarma:'', kodeItemPrincipal:'PRC-BRG002',
      tipeUkuran:'1 Kg', tipeBarang:'Inventory Stock (FG)', kelas:'', katReorderingSheetKode:'BBS', farmaKode:'', subFarmaKode:'', bentukSediaanKode:'',
      konversiSatuanDasar:1, kekuatanSediaan:'', namaJenisObat:'', memo:'Karung isi 20 pcs @ 1 Kg', nie:'', tglEfektif:'01/01/2026', tglExpired:'',
      tipePenyimpanan:'Kering & Sejuk', qtyKelipatanOrder:1, hsCode:'1701.99.00',
      tampilkanMinimumMargin:false, sembunyikanNamaBarang:false, holdPembelian:false, holdPenjualan:false, holdTransaksiInventory:false, barangBonus:false,
      statusBarang:'Aktif', zatKandunganAktif:[], groupProduk:[],
      beratProduk:{isiDalamKarton:20, berat:20, panjang:40, lebar:25, tinggi:10},
      feeDistribusi:[], budgetDiskon:[],
      supplier:[{kodeSupplier:'5015', namaSupplier:'PT Sumber Pangan Nusantara', pusatBisnis:'Generik', untukPembelian:true, lapPenjualan:true}],
      konsinyasiIn:false, divisi:'None',
      hargaBeliPerTanggal:[{tglAwal:'01/01/2026', tglAkhir:'', harga:13800}], hargaJualPerTanggal:[{tglAwal:'01/01/2026', tglAkhir:'', harga:15000}],
      satuanDetail:{dasar:{barcode:'8991002102019', satuan:'Karung', satuanPajak:'', konversi:1}, um2:{barcode:'8991002102026', satuan:'Pcs', satuanPajak:'', konversi:20}, um3:{barcode:'', satuan:'', satuanPajak:'', konversi:0}, um4:{barcode:'', satuan:'', satuanPajak:'', konversi:0}},
      hargaSpecialSupplier:[], hargaSpecialCustomer:[], salesPriceByQuantity:[],
      lokasiGudang:[{gudangKode:'00-GUU', stock:258, qtyMin:0, qtyMax:0}, {gudangKode:'01-GUU', stock:129, qtyMin:0, qtyMax:0}, {gudangKode:'02-GUU', stock:86, qtyMin:0, qtyMax:0}, {gudangKode:'03-GUU', stock:129, qtyMin:0, qtyMax:0}, {gudangKode:'04-GUU', stock:69, qtyMin:0, qtyMax:0}, {gudangKode:'05-GUU', stock:60, qtyMin:0, qtyMax:0}, {gudangKode:'06-GUU', stock:69, qtyMin:0, qtyMax:0}, {gudangKode:'07-GUU', stock:60, qtyMin:0, qtyMax:0}]},
    {kode:'BRG-003', nama:'Beras Premium Rojolele 5kg', kategori:'Sembako', kategoriKode:'CATSMB', satuan:'Karung', stok:410, harga:60000,
      gambarProduk:'', kodeBarangPajak:'', kodeAlkes:'', namaAlkes:'', kodeItemFarma:'', namaItemFarma:'', kodeItemPrincipal:'PRC-BRG003',
      tipeUkuran:'5 Kg', tipeBarang:'Inventory Stock (FG)', kelas:'', katReorderingSheetKode:'BBS', farmaKode:'', subFarmaKode:'', bentukSediaanKode:'',
      konversiSatuanDasar:1, kekuatanSediaan:'', namaJenisObat:'', memo:'Karung isi 1 pcs @ 5 Kg', nie:'', tglEfektif:'01/01/2026', tglExpired:'',
      tipePenyimpanan:'Kering & Sejuk', qtyKelipatanOrder:1, hsCode:'1006.30.00',
      tampilkanMinimumMargin:false, sembunyikanNamaBarang:false, holdPembelian:false, holdPenjualan:false, holdTransaksiInventory:false, barangBonus:false,
      statusBarang:'Aktif', zatKandunganAktif:[], groupProduk:[],
      beratProduk:{isiDalamKarton:1, berat:5, panjang:35, lebar:22, tinggi:8},
      feeDistribusi:[], budgetDiskon:[],
      supplier:[{kodeSupplier:'5021', namaSupplier:'UD Sumber Makmur', pusatBisnis:'Generik', untukPembelian:true, lapPenjualan:true}],
      konsinyasiIn:false, divisi:'None',
      hargaBeliPerTanggal:[{tglAwal:'01/01/2026', tglAkhir:'', harga:55000}], hargaJualPerTanggal:[{tglAwal:'01/01/2026', tglAkhir:'', harga:60000}],
      satuanDetail:{dasar:{barcode:'8991002103019', satuan:'Karung', satuanPajak:'', konversi:1}, um2:{barcode:'', satuan:'', satuanPajak:'', konversi:0}, um3:{barcode:'', satuan:'', satuanPajak:'', konversi:0}, um4:{barcode:'', satuan:'', satuanPajak:'', konversi:0}},
      hargaSpecialSupplier:[], hargaSpecialCustomer:[], salesPriceByQuantity:[],
      lokasiGudang:[{gudangKode:'00-GUU', stock:121, qtyMin:0, qtyMax:0}, {gudangKode:'01-GUU', stock:62, qtyMin:0, qtyMax:0}, {gudangKode:'02-GUU', stock:41, qtyMin:0, qtyMax:0}, {gudangKode:'03-GUU', stock:62, qtyMin:0, qtyMax:0}, {gudangKode:'04-GUU', stock:33, qtyMin:0, qtyMax:0}, {gudangKode:'05-GUU', stock:29, qtyMin:0, qtyMax:0}, {gudangKode:'06-GUU', stock:33, qtyMin:0, qtyMax:0}, {gudangKode:'07-GUU', stock:29, qtyMin:0, qtyMax:0}]},
    {kode:'BRG-004', nama:'Tepung Terigu Segitiga Biru 1kg', kategori:'Bahan Baku', kategoriKode:'CATBHB', satuan:'Karung', stok:990, harga:12000,
      gambarProduk:'', kodeBarangPajak:'', kodeAlkes:'', namaAlkes:'', kodeItemFarma:'', namaItemFarma:'', kodeItemPrincipal:'PRC-BRG004',
      tipeUkuran:'1 Kg', tipeBarang:'Inventory Stock (FG)', kelas:'', katReorderingSheetKode:'BBS', farmaKode:'', subFarmaKode:'', bentukSediaanKode:'',
      konversiSatuanDasar:1, kekuatanSediaan:'', namaJenisObat:'', memo:'Karung isi 20 pcs @ 1 Kg', nie:'', tglEfektif:'01/01/2026', tglExpired:'',
      tipePenyimpanan:'Kering & Sejuk', qtyKelipatanOrder:1, hsCode:'1101.00.00',
      tampilkanMinimumMargin:false, sembunyikanNamaBarang:false, holdPembelian:false, holdPenjualan:false, holdTransaksiInventory:false, barangBonus:false,
      statusBarang:'Aktif', zatKandunganAktif:[], groupProduk:[],
      beratProduk:{isiDalamKarton:20, berat:20, panjang:40, lebar:25, tinggi:10},
      feeDistribusi:[], budgetDiskon:[],
      supplier:[{kodeSupplier:'5020', namaSupplier:'PT Indofood Distribusi', pusatBisnis:'Generik', untukPembelian:true, lapPenjualan:true}],
      konsinyasiIn:false, divisi:'None',
      hargaBeliPerTanggal:[{tglAwal:'01/01/2026', tglAkhir:'', harga:11000}], hargaJualPerTanggal:[{tglAwal:'01/01/2026', tglAkhir:'', harga:12000}],
      satuanDetail:{dasar:{barcode:'8991002104019', satuan:'Karung', satuanPajak:'', konversi:1}, um2:{barcode:'8991002104026', satuan:'Pcs', satuanPajak:'', konversi:20}, um3:{barcode:'', satuan:'', satuanPajak:'', konversi:0}, um4:{barcode:'', satuan:'', satuanPajak:'', konversi:0}},
      hargaSpecialSupplier:[], hargaSpecialCustomer:[], salesPriceByQuantity:[],
      lokasiGudang:[{gudangKode:'00-GUU', stock:297, qtyMin:0, qtyMax:0}, {gudangKode:'01-GUU', stock:149, qtyMin:0, qtyMax:0}, {gudangKode:'02-GUU', stock:99, qtyMin:0, qtyMax:0}, {gudangKode:'03-GUU', stock:149, qtyMin:0, qtyMax:0}, {gudangKode:'04-GUU', stock:79, qtyMin:0, qtyMax:0}, {gudangKode:'05-GUU', stock:69, qtyMin:0, qtyMax:0}, {gudangKode:'06-GUU', stock:79, qtyMin:0, qtyMax:0}, {gudangKode:'07-GUU', stock:69, qtyMin:0, qtyMax:0}]},
    {kode:'BRG-005', nama:'Mie Instan Indomie Goreng', kategori:'Makanan', kategoriKode:'CATMKN', satuan:'Dus', stok:2210, harga:2500,
      gambarProduk:'', kodeBarangPajak:'', kodeAlkes:'', namaAlkes:'', kodeItemFarma:'', namaItemFarma:'', kodeItemPrincipal:'PRC-BRG005',
      tipeUkuran:'85 Gram', tipeBarang:'Inventory Stock (FG)', kelas:'', katReorderingSheetKode:'BBS', farmaKode:'', subFarmaKode:'', bentukSediaanKode:'',
      konversiSatuanDasar:1, kekuatanSediaan:'', namaJenisObat:'', memo:'Dus isi 40 pcs @ 85 Gram', nie:'', tglEfektif:'01/01/2026', tglExpired:'',
      tipePenyimpanan:'Suhu Ruang (15-30°C)', qtyKelipatanOrder:1, hsCode:'1902.30.00',
      tampilkanMinimumMargin:false, sembunyikanNamaBarang:false, holdPembelian:false, holdPenjualan:false, holdTransaksiInventory:false, barangBonus:false,
      statusBarang:'Aktif', zatKandunganAktif:[], groupProduk:[],
      beratProduk:{isiDalamKarton:40, berat:3.4, panjang:38, lebar:27, tinggi:20},
      feeDistribusi:[], budgetDiskon:[],
      supplier:[{kodeSupplier:'5020', namaSupplier:'PT Indofood Distribusi', pusatBisnis:'Generik', untukPembelian:true, lapPenjualan:true}],
      konsinyasiIn:false, divisi:'None',
      hargaBeliPerTanggal:[{tglAwal:'01/01/2026', tglAkhir:'', harga:2200}], hargaJualPerTanggal:[{tglAwal:'01/01/2026', tglAkhir:'', harga:2500}],
      satuanDetail:{dasar:{barcode:'8991002105019', satuan:'Dus', satuanPajak:'', konversi:1}, um2:{barcode:'8991002105026', satuan:'Pcs', satuanPajak:'', konversi:40}, um3:{barcode:'', satuan:'', satuanPajak:'', konversi:0}, um4:{barcode:'', satuan:'', satuanPajak:'', konversi:0}},
      hargaSpecialSupplier:[], hargaSpecialCustomer:[], salesPriceByQuantity:[],
      lokasiGudang:[{gudangKode:'00-GUU', stock:661, qtyMin:0, qtyMax:0}, {gudangKode:'01-GUU', stock:332, qtyMin:0, qtyMax:0}, {gudangKode:'02-GUU', stock:221, qtyMin:0, qtyMax:0}, {gudangKode:'03-GUU', stock:332, qtyMin:0, qtyMax:0}, {gudangKode:'04-GUU', stock:177, qtyMin:0, qtyMax:0}, {gudangKode:'05-GUU', stock:155, qtyMin:0, qtyMax:0}, {gudangKode:'06-GUU', stock:177, qtyMin:0, qtyMax:0}, {gudangKode:'07-GUU', stock:155, qtyMin:0, qtyMax:0}]},
    {kode:'BRG-006', nama:'Kecap Manis ABC 600ml', kategori:'Bumbu', kategoriKode:'CATBMB', satuan:'Dus', stok:530, harga:14000,
      gambarProduk:'', kodeBarangPajak:'', kodeAlkes:'', namaAlkes:'', kodeItemFarma:'', namaItemFarma:'', kodeItemPrincipal:'PRC-BRG006',
      tipeUkuran:'600 ml', tipeBarang:'Inventory Stock (FG)', kelas:'', katReorderingSheetKode:'BBS', farmaKode:'', subFarmaKode:'', bentukSediaanKode:'',
      konversiSatuanDasar:1, kekuatanSediaan:'', namaJenisObat:'', memo:'Dus isi 24 botol @ 600 ml', nie:'', tglEfektif:'01/01/2026', tglExpired:'',
      tipePenyimpanan:'Suhu Ruang (15-30°C)', qtyKelipatanOrder:1, hsCode:'2103.90.00',
      tampilkanMinimumMargin:false, sembunyikanNamaBarang:false, holdPembelian:false, holdPenjualan:false, holdTransaksiInventory:false, barangBonus:false,
      statusBarang:'Aktif', zatKandunganAktif:[], groupProduk:[],
      beratProduk:{isiDalamKarton:24, berat:18, panjang:32, lebar:24, tinggi:18},
      feeDistribusi:[], budgetDiskon:[],
      supplier:[{kodeSupplier:'5018', namaSupplier:'CV Distribusi Sentosa', pusatBisnis:'Generik', untukPembelian:true, lapPenjualan:true}],
      konsinyasiIn:false, divisi:'None',
      hargaBeliPerTanggal:[{tglAwal:'01/01/2026', tglAkhir:'', harga:12800}], hargaJualPerTanggal:[{tglAwal:'01/01/2026', tglAkhir:'', harga:14000}],
      satuanDetail:{dasar:{barcode:'8991002106019', satuan:'Dus', satuanPajak:'', konversi:1}, um2:{barcode:'8991002106026', satuan:'Botol', satuanPajak:'', konversi:24}, um3:{barcode:'', satuan:'', satuanPajak:'', konversi:0}, um4:{barcode:'', satuan:'', satuanPajak:'', konversi:0}},
      hargaSpecialSupplier:[], hargaSpecialCustomer:[], salesPriceByQuantity:[],
      lokasiGudang:[{gudangKode:'00-GUU', stock:159, qtyMin:0, qtyMax:0}, {gudangKode:'01-GUU', stock:80, qtyMin:0, qtyMax:0}, {gudangKode:'02-GUU', stock:53, qtyMin:0, qtyMax:0}, {gudangKode:'03-GUU', stock:80, qtyMin:0, qtyMax:0}, {gudangKode:'04-GUU', stock:42, qtyMin:0, qtyMax:0}, {gudangKode:'05-GUU', stock:37, qtyMin:0, qtyMax:0}, {gudangKode:'06-GUU', stock:42, qtyMin:0, qtyMax:0}, {gudangKode:'07-GUU', stock:37, qtyMin:0, qtyMax:0}]},
    {kode:'BRG-007', nama:'Susu Kental Manis Indomilk 380gr', kategori:'Minuman', kategoriKode:'CATMNM', satuan:'Dus', stok:640, harga:16000,
      gambarProduk:'', kodeBarangPajak:'', kodeAlkes:'', namaAlkes:'', kodeItemFarma:'', namaItemFarma:'', kodeItemPrincipal:'PRC-BRG007',
      tipeUkuran:'380 Gram', tipeBarang:'Inventory Stock (FG)', kelas:'', katReorderingSheetKode:'BBS', farmaKode:'', subFarmaKode:'', bentukSediaanKode:'',
      konversiSatuanDasar:1, kekuatanSediaan:'', namaJenisObat:'', memo:'Dus isi 48 kaleng @ 380 Gram', nie:'', tglEfektif:'01/01/2026', tglExpired:'',
      tipePenyimpanan:'Suhu Ruang (15-30°C)', qtyKelipatanOrder:1, hsCode:'0402.99.00',
      tampilkanMinimumMargin:false, sembunyikanNamaBarang:false, holdPembelian:false, holdPenjualan:false, holdTransaksiInventory:false, barangBonus:false,
      statusBarang:'Aktif', zatKandunganAktif:[], groupProduk:[],
      beratProduk:{isiDalamKarton:48, berat:19, panjang:34, lebar:26, tinggi:16},
      feeDistribusi:[], budgetDiskon:[],
      supplier:[{kodeSupplier:'5022', namaSupplier:'CV Karya Abadi', pusatBisnis:'Generik', untukPembelian:true, lapPenjualan:true}],
      konsinyasiIn:false, divisi:'None',
      hargaBeliPerTanggal:[{tglAwal:'01/01/2026', tglAkhir:'', harga:14700}], hargaJualPerTanggal:[{tglAwal:'01/01/2026', tglAkhir:'', harga:16000}],
      satuanDetail:{dasar:{barcode:'8991002107019', satuan:'Dus', satuanPajak:'', konversi:1}, um2:{barcode:'8991002107026', satuan:'Kaleng', satuanPajak:'', konversi:48}, um3:{barcode:'', satuan:'', satuanPajak:'', konversi:0}, um4:{barcode:'', satuan:'', satuanPajak:'', konversi:0}},
      hargaSpecialSupplier:[], hargaSpecialCustomer:[], salesPriceByQuantity:[],
      lokasiGudang:[{gudangKode:'00-GUU', stock:192, qtyMin:0, qtyMax:0}, {gudangKode:'01-GUU', stock:96, qtyMin:0, qtyMax:0}, {gudangKode:'02-GUU', stock:64, qtyMin:0, qtyMax:0}, {gudangKode:'03-GUU', stock:96, qtyMin:0, qtyMax:0}, {gudangKode:'04-GUU', stock:51, qtyMin:0, qtyMax:0}, {gudangKode:'05-GUU', stock:45, qtyMin:0, qtyMax:0}, {gudangKode:'06-GUU', stock:51, qtyMin:0, qtyMax:0}, {gudangKode:'07-GUU', stock:45, qtyMin:0, qtyMax:0}]},
    {kode:'BRG-008', nama:'Teh Celup Sariwangi 25s', kategori:'Minuman', kategoriKode:'CATMNM', satuan:'Dus', stok:720, harga:10000,
      gambarProduk:'', kodeBarangPajak:'', kodeAlkes:'', namaAlkes:'', kodeItemFarma:'', namaItemFarma:'', kodeItemPrincipal:'PRC-BRG008',
      tipeUkuran:'25 Sachet', tipeBarang:'Inventory Stock (FG)', kelas:'', katReorderingSheetKode:'BBS', farmaKode:'', subFarmaKode:'', bentukSediaanKode:'',
      konversiSatuanDasar:1, kekuatanSediaan:'', namaJenisObat:'', memo:'Dus isi 24 pcs @ 25 Sachet', nie:'', tglEfektif:'01/01/2026', tglExpired:'',
      tipePenyimpanan:'Kering & Sejuk', qtyKelipatanOrder:1, hsCode:'0902.30.00',
      tampilkanMinimumMargin:false, sembunyikanNamaBarang:false, holdPembelian:false, holdPenjualan:false, holdTransaksiInventory:false, barangBonus:false,
      statusBarang:'Aktif', zatKandunganAktif:[], groupProduk:[],
      beratProduk:{isiDalamKarton:24, berat:11, panjang:30, lebar:22, tinggi:18},
      feeDistribusi:[], budgetDiskon:[],
      supplier:[{kodeSupplier:'5025', namaSupplier:'CV Anugerah Logistik', pusatBisnis:'Generik', untukPembelian:true, lapPenjualan:true}],
      konsinyasiIn:false, divisi:'None',
      hargaBeliPerTanggal:[{tglAwal:'01/01/2026', tglAkhir:'', harga:9200}], hargaJualPerTanggal:[{tglAwal:'01/01/2026', tglAkhir:'', harga:10000}],
      satuanDetail:{dasar:{barcode:'8991002108019', satuan:'Dus', satuanPajak:'', konversi:1}, um2:{barcode:'8991002108026', satuan:'Pcs', satuanPajak:'', konversi:24}, um3:{barcode:'', satuan:'', satuanPajak:'', konversi:0}, um4:{barcode:'', satuan:'', satuanPajak:'', konversi:0}},
      hargaSpecialSupplier:[], hargaSpecialCustomer:[], salesPriceByQuantity:[],
      lokasiGudang:[{gudangKode:'00-GUU', stock:216, qtyMin:0, qtyMax:0}, {gudangKode:'01-GUU', stock:108, qtyMin:0, qtyMax:0}, {gudangKode:'02-GUU', stock:72, qtyMin:0, qtyMax:0}, {gudangKode:'03-GUU', stock:108, qtyMin:0, qtyMax:0}, {gudangKode:'04-GUU', stock:58, qtyMin:0, qtyMax:0}, {gudangKode:'05-GUU', stock:50, qtyMin:0, qtyMax:0}, {gudangKode:'06-GUU', stock:58, qtyMin:0, qtyMax:0}, {gudangKode:'07-GUU', stock:50, qtyMin:0, qtyMax:0}]},
    {kode:'BRG-009', nama:'Kopi Kapal Api 165gr', kategori:'Minuman', kategoriKode:'CATMNM', satuan:'Dus', stok:380, harga:14000,
      gambarProduk:'', kodeBarangPajak:'', kodeAlkes:'', namaAlkes:'', kodeItemFarma:'', namaItemFarma:'', kodeItemPrincipal:'PRC-BRG009',
      tipeUkuran:'165 Gram', tipeBarang:'Inventory Stock (FG)', kelas:'', katReorderingSheetKode:'BBS', farmaKode:'', subFarmaKode:'', bentukSediaanKode:'',
      konversiSatuanDasar:1, kekuatanSediaan:'', namaJenisObat:'', memo:'Dus isi 24 pcs @ 165 Gram', nie:'', tglEfektif:'01/01/2026', tglExpired:'',
      tipePenyimpanan:'Kering & Sejuk', qtyKelipatanOrder:1, hsCode:'0901.21.00',
      tampilkanMinimumMargin:false, sembunyikanNamaBarang:false, holdPembelian:false, holdPenjualan:false, holdTransaksiInventory:false, barangBonus:false,
      statusBarang:'Aktif', zatKandunganAktif:[], groupProduk:[],
      beratProduk:{isiDalamKarton:24, berat:9, panjang:28, lebar:20, tinggi:16},
      feeDistribusi:[], budgetDiskon:[],
      supplier:[{kodeSupplier:'5026', namaSupplier:'PT Roda Mas Trading', pusatBisnis:'Generik', untukPembelian:true, lapPenjualan:true}],
      konsinyasiIn:false, divisi:'None',
      hargaBeliPerTanggal:[{tglAwal:'01/01/2026', tglAkhir:'', harga:12900}], hargaJualPerTanggal:[{tglAwal:'01/01/2026', tglAkhir:'', harga:14000}],
      satuanDetail:{dasar:{barcode:'8991002109019', satuan:'Dus', satuanPajak:'', konversi:1}, um2:{barcode:'8991002109026', satuan:'Pcs', satuanPajak:'', konversi:24}, um3:{barcode:'', satuan:'', satuanPajak:'', konversi:0}, um4:{barcode:'', satuan:'', satuanPajak:'', konversi:0}},
      hargaSpecialSupplier:[], hargaSpecialCustomer:[], salesPriceByQuantity:[],
      lokasiGudang:[{gudangKode:'00-GUU', stock:114, qtyMin:0, qtyMax:0}, {gudangKode:'01-GUU', stock:57, qtyMin:0, qtyMax:0}, {gudangKode:'02-GUU', stock:38, qtyMin:0, qtyMax:0}, {gudangKode:'03-GUU', stock:57, qtyMin:0, qtyMax:0}, {gudangKode:'04-GUU', stock:30, qtyMin:0, qtyMax:0}, {gudangKode:'05-GUU', stock:27, qtyMin:0, qtyMax:0}, {gudangKode:'06-GUU', stock:30, qtyMin:0, qtyMax:0}, {gudangKode:'07-GUU', stock:27, qtyMin:0, qtyMax:0}]},
    {kode:'BRG-010', nama:'Sabun Mandi Lifebuoy 90gr', kategori:'Toiletries', kategoriKode:'CATTOI', satuan:'Dus', stok:990, harga:5000,
      gambarProduk:'', kodeBarangPajak:'', kodeAlkes:'', namaAlkes:'', kodeItemFarma:'', namaItemFarma:'', kodeItemPrincipal:'PRC-BRG010',
      tipeUkuran:'90 Gram', tipeBarang:'Inventory Stock (FG)', kelas:'', katReorderingSheetKode:'BBS', farmaKode:'', subFarmaKode:'', bentukSediaanKode:'',
      konversiSatuanDasar:1, kekuatanSediaan:'', namaJenisObat:'', memo:'Dus isi 72 pcs @ 90 Gram', nie:'', tglEfektif:'01/01/2026', tglExpired:'',
      tipePenyimpanan:'Suhu Ruang (15-30°C)', qtyKelipatanOrder:1, hsCode:'3401.11.00',
      tampilkanMinimumMargin:false, sembunyikanNamaBarang:false, holdPembelian:false, holdPenjualan:false, holdTransaksiInventory:false, barangBonus:false,
      statusBarang:'Aktif', zatKandunganAktif:[], groupProduk:[],
      beratProduk:{isiDalamKarton:72, berat:7, panjang:26, lebar:18, tinggi:14},
      feeDistribusi:[], budgetDiskon:[],
      supplier:[{kodeSupplier:'5017', namaSupplier:'PT Sinar Meadow', pusatBisnis:'Generik', untukPembelian:true, lapPenjualan:true}],
      konsinyasiIn:false, divisi:'None',
      hargaBeliPerTanggal:[{tglAwal:'01/01/2026', tglAkhir:'', harga:4500}], hargaJualPerTanggal:[{tglAwal:'01/01/2026', tglAkhir:'', harga:5000}],
      satuanDetail:{dasar:{barcode:'8991002110019', satuan:'Dus', satuanPajak:'', konversi:1}, um2:{barcode:'8991002110026', satuan:'Pcs', satuanPajak:'', konversi:72}, um3:{barcode:'', satuan:'', satuanPajak:'', konversi:0}, um4:{barcode:'', satuan:'', satuanPajak:'', konversi:0}},
      hargaSpecialSupplier:[], hargaSpecialCustomer:[], salesPriceByQuantity:[],
      lokasiGudang:[{gudangKode:'00-GUU', stock:297, qtyMin:0, qtyMax:0}, {gudangKode:'01-GUU', stock:149, qtyMin:0, qtyMax:0}, {gudangKode:'02-GUU', stock:99, qtyMin:0, qtyMax:0}, {gudangKode:'03-GUU', stock:149, qtyMin:0, qtyMax:0}, {gudangKode:'04-GUU', stock:79, qtyMin:0, qtyMax:0}, {gudangKode:'05-GUU', stock:69, qtyMin:0, qtyMax:0}, {gudangKode:'06-GUU', stock:79, qtyMin:0, qtyMax:0}, {gudangKode:'07-GUU', stock:69, qtyMin:0, qtyMax:0}]},
  ],
  /* Daftar Persediaan — sumber data popup "Pilih Barang" versi baru
     (dipakai bersama oleh SEMUA modul transaksi yang punya picker Kode
     Barang: Purchase Order, Sales Order, Picking List, Faktur Penjualan
     Via S.J. — lihat `tplPersediaanPickerModal()`/`openPersediaanPicker()`
     shared di js/core.js, sejak 2026-08-12). Sebelumnya tiap modul cuma
     nampilin Kode/Nama/Harga dari DATA.items (1 baris per barang, tanpa
     konteks gudang). SEKARANG modul barunya menampilkan 1 baris per
     KOMBINASI (Gudang Utama per cabang x Barang) — 8 gudang utama
     (`GUDANG_BY_CABANG` di core.js, kode 00-GUU s/d 07-GUU, sama seperti
     yang sudah dipakai Invoice/Picking List/Gudang) x 10 `DATA.items` =
     80 baris. `qtyPhysical` per baris BUKAN angka acak — tiap total stok
     `DATA.items[].stok` (yang sebelumnya cuma 1 angka global per barang)
     dipecah proporsional ke 8 gudang dengan bobot tetap [HO 30%, Surabaya
     15%, Bandung 10%, Tangerang 15%, Medan 8%, Makassar 7%, Semarang 8%,
     Sidoarjo 7%] (mencerminkan Head Office sebagai cabang terbesar),
     dibulatkan lalu sisa pembulatan diserap baris Head Office — TOTAL
     qtyPhysical 8 gudang per kode barang PERSIS SAMA dengan `stok`
     aslinya di DATA.items (diverifikasi lewat script Node terpisah
     sebelum ditulis ke sini, lihat Riwayat). `qtyReservasi` & `qtyBoPo`
     SENGAJA 0 di semua baris — mockup ini belum punya fitur reservasi
     barang (sales order booking) atau BoPo (barang yang sedang dalam
     proses order/outstanding), jadi `qtyAvailable` = qtyPhysical (rumus
     tetap dipakai sungguhan: qtyAvailable = qtyPhysical - qtyReservasi -
     qtyBoPo, supaya kalau field reservasi/BoPo diisi manual lewat form
     nanti, Available ikut ter-update benar). `kodeKategori` mapping 1:1
     dari `DATA.items[].kategori` (teks) ke kode `DATA.kategoriBarang`
     (Sembako->CATSMB, Bahan Baku->CATBHB, Makanan->CATMKN, Bumbu->CATBMB,
     Minuman->CATMNM, Toiletries->CATTOI — makanya SEMUA 10 barang
     kebetulan match sempurna, tidak ada yang kosong). `konsinyasi`
     ('Ya'/'Tidak') di-reuse dari field `konsinyasi` milik GUDANG-nya
     sendiri (`DATA.gudang[].konsinyasi`, BUKAN field baru per-barang) —
     ke-8 gudang utama semuanya `konsinyasi:false` di data sample Gudang,
     jadi kolom ini tampil 'Tidak' di semua 80 baris (kebetulan cocok
     dengan contoh screenshot yang juga semua 'Tidak'/0, TAPI ini genuine
     hasil reuse data yang sudah ada, bukan didekorasi sengaja jadi nol).
     `namaGudang` pakai `nama` asli dari `DATA.gudang` (format "Gudang
     Utama-<ABBR>", sama persis dengan yang di-generate `gdgNextNama()` di
     modul Gudang). Kalau butuh baris per gudang NON-utama juga (gudang
     ke-2/3/dst per cabang), tambahkan baris baru di sini dengan pola yang
     sama — TIDAK didesain untuk auto-generate dari seluruh 29 baris
     DATA.gudang supaya jumlah baris tetap masuk akal untuk mockup (80
     baris sudah representatif: cukup untuk demo pagination & search). */
  persediaan:[
    {namaGudang:'Gudang Utama-HO', kodeGudang:'00-GUU', cabang:'Head Office', kodeBarang:'BRG-001', namaBarang:'Minyak Goreng Sunco 2L', kodeKategori:'CATSMB', qtyPhysical:372, qtyReservasi:0, qtyBoPo:0, qtyAvailable:372, satuan:'Dus', konsinyasi:'Tidak'},
    {namaGudang:'Gudang Utama-SBY', kodeGudang:'01-GUU', cabang:'Surabaya', kodeBarang:'BRG-001', namaBarang:'Minyak Goreng Sunco 2L', kodeKategori:'CATSMB', qtyPhysical:186, qtyReservasi:0, qtyBoPo:0, qtyAvailable:186, satuan:'Dus', konsinyasi:'Tidak'},
    {namaGudang:'Gudang Utama-BDG', kodeGudang:'02-GUU', cabang:'Bandung', kodeBarang:'BRG-001', namaBarang:'Minyak Goreng Sunco 2L', kodeKategori:'CATSMB', qtyPhysical:124, qtyReservasi:0, qtyBoPo:0, qtyAvailable:124, satuan:'Dus', konsinyasi:'Tidak'},
    {namaGudang:'Gudang Utama-TGR', kodeGudang:'03-GUU', cabang:'Tangerang', kodeBarang:'BRG-001', namaBarang:'Minyak Goreng Sunco 2L', kodeKategori:'CATSMB', qtyPhysical:186, qtyReservasi:0, qtyBoPo:0, qtyAvailable:186, satuan:'Dus', konsinyasi:'Tidak'},
    {namaGudang:'Gudang Utama-MDN', kodeGudang:'04-GUU', cabang:'Medan', kodeBarang:'BRG-001', namaBarang:'Minyak Goreng Sunco 2L', kodeKategori:'CATSMB', qtyPhysical:99, qtyReservasi:0, qtyBoPo:0, qtyAvailable:99, satuan:'Dus', konsinyasi:'Tidak'},
    {namaGudang:'Gudang Utama-MKS', kodeGudang:'05-GUU', cabang:'Makassar', kodeBarang:'BRG-001', namaBarang:'Minyak Goreng Sunco 2L', kodeKategori:'CATSMB', qtyPhysical:87, qtyReservasi:0, qtyBoPo:0, qtyAvailable:87, satuan:'Dus', konsinyasi:'Tidak'},
    {namaGudang:'Gudang Utama-SMG', kodeGudang:'06-GUU', cabang:'Semarang', kodeBarang:'BRG-001', namaBarang:'Minyak Goreng Sunco 2L', kodeKategori:'CATSMB', qtyPhysical:99, qtyReservasi:0, qtyBoPo:0, qtyAvailable:99, satuan:'Dus', konsinyasi:'Tidak'},
    {namaGudang:'Gudang Utama-SDA', kodeGudang:'07-GUU', cabang:'Sidoarjo', kodeBarang:'BRG-001', namaBarang:'Minyak Goreng Sunco 2L', kodeKategori:'CATSMB', qtyPhysical:87, qtyReservasi:0, qtyBoPo:0, qtyAvailable:87, satuan:'Dus', konsinyasi:'Tidak'},
    {namaGudang:'Gudang Utama-HO', kodeGudang:'00-GUU', cabang:'Head Office', kodeBarang:'BRG-002', namaBarang:'Gula Pasir Gulaku 1kg', kodeKategori:'CATSMB', qtyPhysical:258, qtyReservasi:0, qtyBoPo:0, qtyAvailable:258, satuan:'Karung', konsinyasi:'Tidak'},
    {namaGudang:'Gudang Utama-SBY', kodeGudang:'01-GUU', cabang:'Surabaya', kodeBarang:'BRG-002', namaBarang:'Gula Pasir Gulaku 1kg', kodeKategori:'CATSMB', qtyPhysical:129, qtyReservasi:0, qtyBoPo:0, qtyAvailable:129, satuan:'Karung', konsinyasi:'Tidak'},
    {namaGudang:'Gudang Utama-BDG', kodeGudang:'02-GUU', cabang:'Bandung', kodeBarang:'BRG-002', namaBarang:'Gula Pasir Gulaku 1kg', kodeKategori:'CATSMB', qtyPhysical:86, qtyReservasi:0, qtyBoPo:0, qtyAvailable:86, satuan:'Karung', konsinyasi:'Tidak'},
    {namaGudang:'Gudang Utama-TGR', kodeGudang:'03-GUU', cabang:'Tangerang', kodeBarang:'BRG-002', namaBarang:'Gula Pasir Gulaku 1kg', kodeKategori:'CATSMB', qtyPhysical:129, qtyReservasi:0, qtyBoPo:0, qtyAvailable:129, satuan:'Karung', konsinyasi:'Tidak'},
    {namaGudang:'Gudang Utama-MDN', kodeGudang:'04-GUU', cabang:'Medan', kodeBarang:'BRG-002', namaBarang:'Gula Pasir Gulaku 1kg', kodeKategori:'CATSMB', qtyPhysical:69, qtyReservasi:0, qtyBoPo:0, qtyAvailable:69, satuan:'Karung', konsinyasi:'Tidak'},
    {namaGudang:'Gudang Utama-MKS', kodeGudang:'05-GUU', cabang:'Makassar', kodeBarang:'BRG-002', namaBarang:'Gula Pasir Gulaku 1kg', kodeKategori:'CATSMB', qtyPhysical:60, qtyReservasi:0, qtyBoPo:0, qtyAvailable:60, satuan:'Karung', konsinyasi:'Tidak'},
    {namaGudang:'Gudang Utama-SMG', kodeGudang:'06-GUU', cabang:'Semarang', kodeBarang:'BRG-002', namaBarang:'Gula Pasir Gulaku 1kg', kodeKategori:'CATSMB', qtyPhysical:69, qtyReservasi:0, qtyBoPo:0, qtyAvailable:69, satuan:'Karung', konsinyasi:'Tidak'},
    {namaGudang:'Gudang Utama-SDA', kodeGudang:'07-GUU', cabang:'Sidoarjo', kodeBarang:'BRG-002', namaBarang:'Gula Pasir Gulaku 1kg', kodeKategori:'CATSMB', qtyPhysical:60, qtyReservasi:0, qtyBoPo:0, qtyAvailable:60, satuan:'Karung', konsinyasi:'Tidak'},
    {namaGudang:'Gudang Utama-HO', kodeGudang:'00-GUU', cabang:'Head Office', kodeBarang:'BRG-003', namaBarang:'Beras Premium Rojolele 5kg', kodeKategori:'CATSMB', qtyPhysical:121, qtyReservasi:0, qtyBoPo:0, qtyAvailable:121, satuan:'Karung', konsinyasi:'Tidak'},
    {namaGudang:'Gudang Utama-SBY', kodeGudang:'01-GUU', cabang:'Surabaya', kodeBarang:'BRG-003', namaBarang:'Beras Premium Rojolele 5kg', kodeKategori:'CATSMB', qtyPhysical:62, qtyReservasi:0, qtyBoPo:0, qtyAvailable:62, satuan:'Karung', konsinyasi:'Tidak'},
    {namaGudang:'Gudang Utama-BDG', kodeGudang:'02-GUU', cabang:'Bandung', kodeBarang:'BRG-003', namaBarang:'Beras Premium Rojolele 5kg', kodeKategori:'CATSMB', qtyPhysical:41, qtyReservasi:0, qtyBoPo:0, qtyAvailable:41, satuan:'Karung', konsinyasi:'Tidak'},
    {namaGudang:'Gudang Utama-TGR', kodeGudang:'03-GUU', cabang:'Tangerang', kodeBarang:'BRG-003', namaBarang:'Beras Premium Rojolele 5kg', kodeKategori:'CATSMB', qtyPhysical:62, qtyReservasi:0, qtyBoPo:0, qtyAvailable:62, satuan:'Karung', konsinyasi:'Tidak'},
    {namaGudang:'Gudang Utama-MDN', kodeGudang:'04-GUU', cabang:'Medan', kodeBarang:'BRG-003', namaBarang:'Beras Premium Rojolele 5kg', kodeKategori:'CATSMB', qtyPhysical:33, qtyReservasi:0, qtyBoPo:0, qtyAvailable:33, satuan:'Karung', konsinyasi:'Tidak'},
    {namaGudang:'Gudang Utama-MKS', kodeGudang:'05-GUU', cabang:'Makassar', kodeBarang:'BRG-003', namaBarang:'Beras Premium Rojolele 5kg', kodeKategori:'CATSMB', qtyPhysical:29, qtyReservasi:0, qtyBoPo:0, qtyAvailable:29, satuan:'Karung', konsinyasi:'Tidak'},
    {namaGudang:'Gudang Utama-SMG', kodeGudang:'06-GUU', cabang:'Semarang', kodeBarang:'BRG-003', namaBarang:'Beras Premium Rojolele 5kg', kodeKategori:'CATSMB', qtyPhysical:33, qtyReservasi:0, qtyBoPo:0, qtyAvailable:33, satuan:'Karung', konsinyasi:'Tidak'},
    {namaGudang:'Gudang Utama-SDA', kodeGudang:'07-GUU', cabang:'Sidoarjo', kodeBarang:'BRG-003', namaBarang:'Beras Premium Rojolele 5kg', kodeKategori:'CATSMB', qtyPhysical:29, qtyReservasi:0, qtyBoPo:0, qtyAvailable:29, satuan:'Karung', konsinyasi:'Tidak'},
    {namaGudang:'Gudang Utama-HO', kodeGudang:'00-GUU', cabang:'Head Office', kodeBarang:'BRG-004', namaBarang:'Tepung Terigu Segitiga Biru 1kg', kodeKategori:'CATBHB', qtyPhysical:297, qtyReservasi:0, qtyBoPo:0, qtyAvailable:297, satuan:'Karung', konsinyasi:'Tidak'},
    {namaGudang:'Gudang Utama-SBY', kodeGudang:'01-GUU', cabang:'Surabaya', kodeBarang:'BRG-004', namaBarang:'Tepung Terigu Segitiga Biru 1kg', kodeKategori:'CATBHB', qtyPhysical:149, qtyReservasi:0, qtyBoPo:0, qtyAvailable:149, satuan:'Karung', konsinyasi:'Tidak'},
    {namaGudang:'Gudang Utama-BDG', kodeGudang:'02-GUU', cabang:'Bandung', kodeBarang:'BRG-004', namaBarang:'Tepung Terigu Segitiga Biru 1kg', kodeKategori:'CATBHB', qtyPhysical:99, qtyReservasi:0, qtyBoPo:0, qtyAvailable:99, satuan:'Karung', konsinyasi:'Tidak'},
    {namaGudang:'Gudang Utama-TGR', kodeGudang:'03-GUU', cabang:'Tangerang', kodeBarang:'BRG-004', namaBarang:'Tepung Terigu Segitiga Biru 1kg', kodeKategori:'CATBHB', qtyPhysical:149, qtyReservasi:0, qtyBoPo:0, qtyAvailable:149, satuan:'Karung', konsinyasi:'Tidak'},
    {namaGudang:'Gudang Utama-MDN', kodeGudang:'04-GUU', cabang:'Medan', kodeBarang:'BRG-004', namaBarang:'Tepung Terigu Segitiga Biru 1kg', kodeKategori:'CATBHB', qtyPhysical:79, qtyReservasi:0, qtyBoPo:0, qtyAvailable:79, satuan:'Karung', konsinyasi:'Tidak'},
    {namaGudang:'Gudang Utama-MKS', kodeGudang:'05-GUU', cabang:'Makassar', kodeBarang:'BRG-004', namaBarang:'Tepung Terigu Segitiga Biru 1kg', kodeKategori:'CATBHB', qtyPhysical:69, qtyReservasi:0, qtyBoPo:0, qtyAvailable:69, satuan:'Karung', konsinyasi:'Tidak'},
    {namaGudang:'Gudang Utama-SMG', kodeGudang:'06-GUU', cabang:'Semarang', kodeBarang:'BRG-004', namaBarang:'Tepung Terigu Segitiga Biru 1kg', kodeKategori:'CATBHB', qtyPhysical:79, qtyReservasi:0, qtyBoPo:0, qtyAvailable:79, satuan:'Karung', konsinyasi:'Tidak'},
    {namaGudang:'Gudang Utama-SDA', kodeGudang:'07-GUU', cabang:'Sidoarjo', kodeBarang:'BRG-004', namaBarang:'Tepung Terigu Segitiga Biru 1kg', kodeKategori:'CATBHB', qtyPhysical:69, qtyReservasi:0, qtyBoPo:0, qtyAvailable:69, satuan:'Karung', konsinyasi:'Tidak'},
    {namaGudang:'Gudang Utama-HO', kodeGudang:'00-GUU', cabang:'Head Office', kodeBarang:'BRG-005', namaBarang:'Mie Instan Indomie Goreng', kodeKategori:'CATMKN', qtyPhysical:661, qtyReservasi:0, qtyBoPo:0, qtyAvailable:661, satuan:'Dus', konsinyasi:'Tidak'},
    {namaGudang:'Gudang Utama-SBY', kodeGudang:'01-GUU', cabang:'Surabaya', kodeBarang:'BRG-005', namaBarang:'Mie Instan Indomie Goreng', kodeKategori:'CATMKN', qtyPhysical:332, qtyReservasi:0, qtyBoPo:0, qtyAvailable:332, satuan:'Dus', konsinyasi:'Tidak'},
    {namaGudang:'Gudang Utama-BDG', kodeGudang:'02-GUU', cabang:'Bandung', kodeBarang:'BRG-005', namaBarang:'Mie Instan Indomie Goreng', kodeKategori:'CATMKN', qtyPhysical:221, qtyReservasi:0, qtyBoPo:0, qtyAvailable:221, satuan:'Dus', konsinyasi:'Tidak'},
    {namaGudang:'Gudang Utama-TGR', kodeGudang:'03-GUU', cabang:'Tangerang', kodeBarang:'BRG-005', namaBarang:'Mie Instan Indomie Goreng', kodeKategori:'CATMKN', qtyPhysical:332, qtyReservasi:0, qtyBoPo:0, qtyAvailable:332, satuan:'Dus', konsinyasi:'Tidak'},
    {namaGudang:'Gudang Utama-MDN', kodeGudang:'04-GUU', cabang:'Medan', kodeBarang:'BRG-005', namaBarang:'Mie Instan Indomie Goreng', kodeKategori:'CATMKN', qtyPhysical:177, qtyReservasi:0, qtyBoPo:0, qtyAvailable:177, satuan:'Dus', konsinyasi:'Tidak'},
    {namaGudang:'Gudang Utama-MKS', kodeGudang:'05-GUU', cabang:'Makassar', kodeBarang:'BRG-005', namaBarang:'Mie Instan Indomie Goreng', kodeKategori:'CATMKN', qtyPhysical:155, qtyReservasi:0, qtyBoPo:0, qtyAvailable:155, satuan:'Dus', konsinyasi:'Tidak'},
    {namaGudang:'Gudang Utama-SMG', kodeGudang:'06-GUU', cabang:'Semarang', kodeBarang:'BRG-005', namaBarang:'Mie Instan Indomie Goreng', kodeKategori:'CATMKN', qtyPhysical:177, qtyReservasi:0, qtyBoPo:0, qtyAvailable:177, satuan:'Dus', konsinyasi:'Tidak'},
    {namaGudang:'Gudang Utama-SDA', kodeGudang:'07-GUU', cabang:'Sidoarjo', kodeBarang:'BRG-005', namaBarang:'Mie Instan Indomie Goreng', kodeKategori:'CATMKN', qtyPhysical:155, qtyReservasi:0, qtyBoPo:0, qtyAvailable:155, satuan:'Dus', konsinyasi:'Tidak'},
    {namaGudang:'Gudang Utama-HO', kodeGudang:'00-GUU', cabang:'Head Office', kodeBarang:'BRG-006', namaBarang:'Kecap Manis ABC 600ml', kodeKategori:'CATBMB', qtyPhysical:159, qtyReservasi:0, qtyBoPo:0, qtyAvailable:159, satuan:'Dus', konsinyasi:'Tidak'},
    {namaGudang:'Gudang Utama-SBY', kodeGudang:'01-GUU', cabang:'Surabaya', kodeBarang:'BRG-006', namaBarang:'Kecap Manis ABC 600ml', kodeKategori:'CATBMB', qtyPhysical:80, qtyReservasi:0, qtyBoPo:0, qtyAvailable:80, satuan:'Dus', konsinyasi:'Tidak'},
    {namaGudang:'Gudang Utama-BDG', kodeGudang:'02-GUU', cabang:'Bandung', kodeBarang:'BRG-006', namaBarang:'Kecap Manis ABC 600ml', kodeKategori:'CATBMB', qtyPhysical:53, qtyReservasi:0, qtyBoPo:0, qtyAvailable:53, satuan:'Dus', konsinyasi:'Tidak'},
    {namaGudang:'Gudang Utama-TGR', kodeGudang:'03-GUU', cabang:'Tangerang', kodeBarang:'BRG-006', namaBarang:'Kecap Manis ABC 600ml', kodeKategori:'CATBMB', qtyPhysical:80, qtyReservasi:0, qtyBoPo:0, qtyAvailable:80, satuan:'Dus', konsinyasi:'Tidak'},
    {namaGudang:'Gudang Utama-MDN', kodeGudang:'04-GUU', cabang:'Medan', kodeBarang:'BRG-006', namaBarang:'Kecap Manis ABC 600ml', kodeKategori:'CATBMB', qtyPhysical:42, qtyReservasi:0, qtyBoPo:0, qtyAvailable:42, satuan:'Dus', konsinyasi:'Tidak'},
    {namaGudang:'Gudang Utama-MKS', kodeGudang:'05-GUU', cabang:'Makassar', kodeBarang:'BRG-006', namaBarang:'Kecap Manis ABC 600ml', kodeKategori:'CATBMB', qtyPhysical:37, qtyReservasi:0, qtyBoPo:0, qtyAvailable:37, satuan:'Dus', konsinyasi:'Tidak'},
    {namaGudang:'Gudang Utama-SMG', kodeGudang:'06-GUU', cabang:'Semarang', kodeBarang:'BRG-006', namaBarang:'Kecap Manis ABC 600ml', kodeKategori:'CATBMB', qtyPhysical:42, qtyReservasi:0, qtyBoPo:0, qtyAvailable:42, satuan:'Dus', konsinyasi:'Tidak'},
    {namaGudang:'Gudang Utama-SDA', kodeGudang:'07-GUU', cabang:'Sidoarjo', kodeBarang:'BRG-006', namaBarang:'Kecap Manis ABC 600ml', kodeKategori:'CATBMB', qtyPhysical:37, qtyReservasi:0, qtyBoPo:0, qtyAvailable:37, satuan:'Dus', konsinyasi:'Tidak'},
    {namaGudang:'Gudang Utama-HO', kodeGudang:'00-GUU', cabang:'Head Office', kodeBarang:'BRG-007', namaBarang:'Susu Kental Manis Indomilk 380gr', kodeKategori:'CATMNM', qtyPhysical:192, qtyReservasi:0, qtyBoPo:0, qtyAvailable:192, satuan:'Dus', konsinyasi:'Tidak'},
    {namaGudang:'Gudang Utama-SBY', kodeGudang:'01-GUU', cabang:'Surabaya', kodeBarang:'BRG-007', namaBarang:'Susu Kental Manis Indomilk 380gr', kodeKategori:'CATMNM', qtyPhysical:96, qtyReservasi:0, qtyBoPo:0, qtyAvailable:96, satuan:'Dus', konsinyasi:'Tidak'},
    {namaGudang:'Gudang Utama-BDG', kodeGudang:'02-GUU', cabang:'Bandung', kodeBarang:'BRG-007', namaBarang:'Susu Kental Manis Indomilk 380gr', kodeKategori:'CATMNM', qtyPhysical:64, qtyReservasi:0, qtyBoPo:0, qtyAvailable:64, satuan:'Dus', konsinyasi:'Tidak'},
    {namaGudang:'Gudang Utama-TGR', kodeGudang:'03-GUU', cabang:'Tangerang', kodeBarang:'BRG-007', namaBarang:'Susu Kental Manis Indomilk 380gr', kodeKategori:'CATMNM', qtyPhysical:96, qtyReservasi:0, qtyBoPo:0, qtyAvailable:96, satuan:'Dus', konsinyasi:'Tidak'},
    {namaGudang:'Gudang Utama-MDN', kodeGudang:'04-GUU', cabang:'Medan', kodeBarang:'BRG-007', namaBarang:'Susu Kental Manis Indomilk 380gr', kodeKategori:'CATMNM', qtyPhysical:51, qtyReservasi:0, qtyBoPo:0, qtyAvailable:51, satuan:'Dus', konsinyasi:'Tidak'},
    {namaGudang:'Gudang Utama-MKS', kodeGudang:'05-GUU', cabang:'Makassar', kodeBarang:'BRG-007', namaBarang:'Susu Kental Manis Indomilk 380gr', kodeKategori:'CATMNM', qtyPhysical:45, qtyReservasi:0, qtyBoPo:0, qtyAvailable:45, satuan:'Dus', konsinyasi:'Tidak'},
    {namaGudang:'Gudang Utama-SMG', kodeGudang:'06-GUU', cabang:'Semarang', kodeBarang:'BRG-007', namaBarang:'Susu Kental Manis Indomilk 380gr', kodeKategori:'CATMNM', qtyPhysical:51, qtyReservasi:0, qtyBoPo:0, qtyAvailable:51, satuan:'Dus', konsinyasi:'Tidak'},
    {namaGudang:'Gudang Utama-SDA', kodeGudang:'07-GUU', cabang:'Sidoarjo', kodeBarang:'BRG-007', namaBarang:'Susu Kental Manis Indomilk 380gr', kodeKategori:'CATMNM', qtyPhysical:45, qtyReservasi:0, qtyBoPo:0, qtyAvailable:45, satuan:'Dus', konsinyasi:'Tidak'},
    {namaGudang:'Gudang Utama-HO', kodeGudang:'00-GUU', cabang:'Head Office', kodeBarang:'BRG-008', namaBarang:'Teh Celup Sariwangi 25s', kodeKategori:'CATMNM', qtyPhysical:216, qtyReservasi:0, qtyBoPo:0, qtyAvailable:216, satuan:'Dus', konsinyasi:'Tidak'},
    {namaGudang:'Gudang Utama-SBY', kodeGudang:'01-GUU', cabang:'Surabaya', kodeBarang:'BRG-008', namaBarang:'Teh Celup Sariwangi 25s', kodeKategori:'CATMNM', qtyPhysical:108, qtyReservasi:0, qtyBoPo:0, qtyAvailable:108, satuan:'Dus', konsinyasi:'Tidak'},
    {namaGudang:'Gudang Utama-BDG', kodeGudang:'02-GUU', cabang:'Bandung', kodeBarang:'BRG-008', namaBarang:'Teh Celup Sariwangi 25s', kodeKategori:'CATMNM', qtyPhysical:72, qtyReservasi:0, qtyBoPo:0, qtyAvailable:72, satuan:'Dus', konsinyasi:'Tidak'},
    {namaGudang:'Gudang Utama-TGR', kodeGudang:'03-GUU', cabang:'Tangerang', kodeBarang:'BRG-008', namaBarang:'Teh Celup Sariwangi 25s', kodeKategori:'CATMNM', qtyPhysical:108, qtyReservasi:0, qtyBoPo:0, qtyAvailable:108, satuan:'Dus', konsinyasi:'Tidak'},
    {namaGudang:'Gudang Utama-MDN', kodeGudang:'04-GUU', cabang:'Medan', kodeBarang:'BRG-008', namaBarang:'Teh Celup Sariwangi 25s', kodeKategori:'CATMNM', qtyPhysical:58, qtyReservasi:0, qtyBoPo:0, qtyAvailable:58, satuan:'Dus', konsinyasi:'Tidak'},
    {namaGudang:'Gudang Utama-MKS', kodeGudang:'05-GUU', cabang:'Makassar', kodeBarang:'BRG-008', namaBarang:'Teh Celup Sariwangi 25s', kodeKategori:'CATMNM', qtyPhysical:50, qtyReservasi:0, qtyBoPo:0, qtyAvailable:50, satuan:'Dus', konsinyasi:'Tidak'},
    {namaGudang:'Gudang Utama-SMG', kodeGudang:'06-GUU', cabang:'Semarang', kodeBarang:'BRG-008', namaBarang:'Teh Celup Sariwangi 25s', kodeKategori:'CATMNM', qtyPhysical:58, qtyReservasi:0, qtyBoPo:0, qtyAvailable:58, satuan:'Dus', konsinyasi:'Tidak'},
    {namaGudang:'Gudang Utama-SDA', kodeGudang:'07-GUU', cabang:'Sidoarjo', kodeBarang:'BRG-008', namaBarang:'Teh Celup Sariwangi 25s', kodeKategori:'CATMNM', qtyPhysical:50, qtyReservasi:0, qtyBoPo:0, qtyAvailable:50, satuan:'Dus', konsinyasi:'Tidak'},
    {namaGudang:'Gudang Utama-HO', kodeGudang:'00-GUU', cabang:'Head Office', kodeBarang:'BRG-009', namaBarang:'Kopi Kapal Api 165gr', kodeKategori:'CATMNM', qtyPhysical:114, qtyReservasi:0, qtyBoPo:0, qtyAvailable:114, satuan:'Dus', konsinyasi:'Tidak'},
    {namaGudang:'Gudang Utama-SBY', kodeGudang:'01-GUU', cabang:'Surabaya', kodeBarang:'BRG-009', namaBarang:'Kopi Kapal Api 165gr', kodeKategori:'CATMNM', qtyPhysical:57, qtyReservasi:0, qtyBoPo:0, qtyAvailable:57, satuan:'Dus', konsinyasi:'Tidak'},
    {namaGudang:'Gudang Utama-BDG', kodeGudang:'02-GUU', cabang:'Bandung', kodeBarang:'BRG-009', namaBarang:'Kopi Kapal Api 165gr', kodeKategori:'CATMNM', qtyPhysical:38, qtyReservasi:0, qtyBoPo:0, qtyAvailable:38, satuan:'Dus', konsinyasi:'Tidak'},
    {namaGudang:'Gudang Utama-TGR', kodeGudang:'03-GUU', cabang:'Tangerang', kodeBarang:'BRG-009', namaBarang:'Kopi Kapal Api 165gr', kodeKategori:'CATMNM', qtyPhysical:57, qtyReservasi:0, qtyBoPo:0, qtyAvailable:57, satuan:'Dus', konsinyasi:'Tidak'},
    {namaGudang:'Gudang Utama-MDN', kodeGudang:'04-GUU', cabang:'Medan', kodeBarang:'BRG-009', namaBarang:'Kopi Kapal Api 165gr', kodeKategori:'CATMNM', qtyPhysical:30, qtyReservasi:0, qtyBoPo:0, qtyAvailable:30, satuan:'Dus', konsinyasi:'Tidak'},
    {namaGudang:'Gudang Utama-MKS', kodeGudang:'05-GUU', cabang:'Makassar', kodeBarang:'BRG-009', namaBarang:'Kopi Kapal Api 165gr', kodeKategori:'CATMNM', qtyPhysical:27, qtyReservasi:0, qtyBoPo:0, qtyAvailable:27, satuan:'Dus', konsinyasi:'Tidak'},
    {namaGudang:'Gudang Utama-SMG', kodeGudang:'06-GUU', cabang:'Semarang', kodeBarang:'BRG-009', namaBarang:'Kopi Kapal Api 165gr', kodeKategori:'CATMNM', qtyPhysical:30, qtyReservasi:0, qtyBoPo:0, qtyAvailable:30, satuan:'Dus', konsinyasi:'Tidak'},
    {namaGudang:'Gudang Utama-SDA', kodeGudang:'07-GUU', cabang:'Sidoarjo', kodeBarang:'BRG-009', namaBarang:'Kopi Kapal Api 165gr', kodeKategori:'CATMNM', qtyPhysical:27, qtyReservasi:0, qtyBoPo:0, qtyAvailable:27, satuan:'Dus', konsinyasi:'Tidak'},
    {namaGudang:'Gudang Utama-HO', kodeGudang:'00-GUU', cabang:'Head Office', kodeBarang:'BRG-010', namaBarang:'Sabun Mandi Lifebuoy 90gr', kodeKategori:'CATTOI', qtyPhysical:297, qtyReservasi:0, qtyBoPo:0, qtyAvailable:297, satuan:'Dus', konsinyasi:'Tidak'},
    {namaGudang:'Gudang Utama-SBY', kodeGudang:'01-GUU', cabang:'Surabaya', kodeBarang:'BRG-010', namaBarang:'Sabun Mandi Lifebuoy 90gr', kodeKategori:'CATTOI', qtyPhysical:149, qtyReservasi:0, qtyBoPo:0, qtyAvailable:149, satuan:'Dus', konsinyasi:'Tidak'},
    {namaGudang:'Gudang Utama-BDG', kodeGudang:'02-GUU', cabang:'Bandung', kodeBarang:'BRG-010', namaBarang:'Sabun Mandi Lifebuoy 90gr', kodeKategori:'CATTOI', qtyPhysical:99, qtyReservasi:0, qtyBoPo:0, qtyAvailable:99, satuan:'Dus', konsinyasi:'Tidak'},
    {namaGudang:'Gudang Utama-TGR', kodeGudang:'03-GUU', cabang:'Tangerang', kodeBarang:'BRG-010', namaBarang:'Sabun Mandi Lifebuoy 90gr', kodeKategori:'CATTOI', qtyPhysical:149, qtyReservasi:0, qtyBoPo:0, qtyAvailable:149, satuan:'Dus', konsinyasi:'Tidak'},
    {namaGudang:'Gudang Utama-MDN', kodeGudang:'04-GUU', cabang:'Medan', kodeBarang:'BRG-010', namaBarang:'Sabun Mandi Lifebuoy 90gr', kodeKategori:'CATTOI', qtyPhysical:79, qtyReservasi:0, qtyBoPo:0, qtyAvailable:79, satuan:'Dus', konsinyasi:'Tidak'},
    {namaGudang:'Gudang Utama-MKS', kodeGudang:'05-GUU', cabang:'Makassar', kodeBarang:'BRG-010', namaBarang:'Sabun Mandi Lifebuoy 90gr', kodeKategori:'CATTOI', qtyPhysical:69, qtyReservasi:0, qtyBoPo:0, qtyAvailable:69, satuan:'Dus', konsinyasi:'Tidak'},
    {namaGudang:'Gudang Utama-SMG', kodeGudang:'06-GUU', cabang:'Semarang', kodeBarang:'BRG-010', namaBarang:'Sabun Mandi Lifebuoy 90gr', kodeKategori:'CATTOI', qtyPhysical:79, qtyReservasi:0, qtyBoPo:0, qtyAvailable:79, satuan:'Dus', konsinyasi:'Tidak'},
    {namaGudang:'Gudang Utama-SDA', kodeGudang:'07-GUU', cabang:'Sidoarjo', kodeBarang:'BRG-010', namaBarang:'Sabun Mandi Lifebuoy 90gr', kodeKategori:'CATTOI', qtyPhysical:69, qtyReservasi:0, qtyBoPo:0, qtyAvailable:69, satuan:'Dus', konsinyasi:'Tidak'},
  ],
  kasMasuk:[
    {tgl:'2026-08-01', ket:'Penerimaan piutang - Toko Sumber Rejeki', jumlah:8250000, kategori:'A.R.'},
    {tgl:'2026-08-02', ket:'Penjualan tunai', jumlah:3120000, kategori:'Penjualan'},
    {tgl:'2026-08-03', ket:'Penerimaan piutang - UD Makmur Jaya', jumlah:2500000, kategori:'A.R.'},
  ],
  kasKeluar:[
    {tgl:'2026-08-01', ket:'Pembayaran supplier - PT Wilmar Nabati', jumlah:12500000, kategori:'A.P.'},
    {tgl:'2026-08-02', ket:'Biaya operasional gudang', jumlah:1800000, kategori:'Operasional'},
    {tgl:'2026-08-03', ket:'Biaya transportasi', jumlah:950000, kategori:'Operasional'},
  ],
  transaksiKas:[
    {tgl:'2026-08-01', ket:'Penerimaan piutang - Toko Sumber Rejeki', tipe:'Masuk', kategori:'A.R.', jumlah:8250000},
    {tgl:'2026-08-01', ket:'Pembayaran supplier - PT Wilmar Nabati', tipe:'Keluar', kategori:'A.P.', jumlah:12500000},
    {tgl:'2026-08-02', ket:'Penjualan tunai', tipe:'Masuk', kategori:'Penjualan', jumlah:3120000},
    {tgl:'2026-08-02', ket:'Biaya operasional gudang', tipe:'Keluar', kategori:'Operasional', jumlah:1800000},
    {tgl:'2026-08-03', ket:'Penerimaan piutang - UD Makmur Jaya', tipe:'Masuk', kategori:'A.R.', jumlah:2500000},
    {tgl:'2026-08-03', ket:'Biaya transportasi', tipe:'Keluar', kategori:'Operasional', jumlah:950000},
  ],
  bankMovement:{labels:['Jun 26','Jul 26','Agu 26'], debit:[820,1040,175], credit:[640,980,205]},
  liquidityRatio:{labels:['Jun 26','Jul 26','Agu 26'], current:[2.1,2.4,2.3], quick:[1.4,1.6,1.5], cash:[0.8,0.9,0.85]},
  glDashboard:{
    labels:['Jun 26','Jul 26','Agu 26'],
    revenue:[9200,17400,650],
    cogs:[7800,16310,565],
    opex:[1250,640,180],
    netProfit:[150,450,-95],
  },
  divisi:[
    {kode:'DVS100', nama:'Head Office'},
    {kode:'DVS200', nama:'Sales & Marketing'},
    {kode:'DVS300', nama:'Warehouse & Logistik'},
    {kode:'DVS400', nama:'Finance & Accounting'},
    {kode:'DVS500', nama:'Human Resources'},
  ],
  businessCentre:[
    {kode:'BSC000', nama:'None', dpp:0, divisi:[{kode:'DVS100', nama:'Head Office'}]},
    {kode:'BSC101', nama:'Generik', dpp:0, divisi:[]},
    {kode:'BSC102', nama:'Alat Kesehatan', dpp:0, divisi:[]},
    {kode:'BSC103', nama:'Branded', dpp:0, divisi:[]},
    {kode:'BSC104', nama:'Consumer Food', dpp:0, divisi:[]},
    {kode:'BSC999', nama:'Asset', dpp:0, divisi:[]},
  ],
  budgetVsActual:[
    {kode:'4-1000', nama:'Pendapatan Penjualan', budget:20000000000, realisasi:17400000000},
    {kode:'5-1000', nama:'Harga Pokok Penjualan (COGS)', budget:15000000000, realisasi:16310000000},
    {kode:'6-1000', nama:'Biaya Operasional', budget:800000000, realisasi:640000000},
    {kode:'6-2000', nama:'Biaya Gaji & Tunjangan', budget:450000000, realisasi:420000000},
    {kode:'6-3000', nama:'Biaya Transportasi & Logistik', budget:180000000, realisasi:165000000},
    {kode:'8-1000', nama:'Laba Bersih', budget:500000000, realisasi:450000000},
  ],
  jurnalUmum:[
    {tgl:'2026-08-01', no:'JU-0001', akun:'Kas - Piutang Usaha', debit:8250000, kredit:0},
    {tgl:'2026-08-01', no:'JU-0002', akun:'Piutang Usaha', debit:0, kredit:8250000},
    {tgl:'2026-08-02', no:'JU-0003', akun:'Persediaan Barang Dagang', debit:12500000, kredit:0},
    {tgl:'2026-08-02', no:'JU-0004', akun:'Hutang Usaha', debit:0, kredit:12500000},
  ],
  /* Fixed Asset (menu Aktiva Tetap > Master & Setting > Fixed Asset,
     page:'aktivaTetap') — sebelumnya renderer generik read-only 4 baris
     (kode/nama/tahun/nilai/akumulasi/buku sederhana, lihat versi lama
     baris ini di git history), kini dibangun CRUD PENUH sesuai 2
     screenshot MASERP 2026-08-26: list "Daftar Aktiva Tetap" (Total
     Record: 244, kolom Kode Asset/Nama Aset/Cabang/Tgl Mulai Susut/
     Lokasi/Nilai/Status[toggle Active/Non Active]/Ubah/Hapus/Delete
     Generate Fixed Asset, toolbar Generate Fixed Asset/Tambah/Impor
     Fixed Asset) & form "Master Fixed Asset" (checkbox "Aset Ini Tidak
     Memiliki Penyusutan", field kiri Cabang/Kode Aset/Nama Aset/
     Spesifikasi/Merek/Tgl.Beli/Tgl Mulai Susut/Harga Beli Aset/Barcode/
     Status+Ubah Status, field kanan Metode Penyusutan radio Straight
     Line/Declining Balance + Kelompok Aktiva radio Fiskal/Komersial +
     Kode Golongan + picker Aturan Penyusutan + Nilai Susut/Masa Susut
     [readonly, diturunkan dari Aturan Penyusutan yang dipilih — lihat
     DATA.aktivaTetapDeprRule] + Nilai Residu, sub-section "Lokasi Aset"
     [Tgl.Perpindahan/Lokasi Aset/Penanggung Jawab/Pemakai Asset+Update]
     & "Jurnal" [Kode G.L. Biaya Susut/Akm. Susut, keduanya picker ke
     DATA.akunGL]).

     DOWNSIZE VOLUME (konsisten precedent Zat Kandungan Aktif dkk.):
     "Total Record: 244" di screenshot asli TIDAK direproduksi utuh —
     diturunkan ke 24 baris. 10 baris PERTAMA (`00-KDR001`-`00-KDR010`)
     PERSIS data halaman 1 screenshot list (nama kendaraan/tanggal/nilai,
     semua Head Office/Active) — termasuk `00-KDR001` "Grand Max Blin Van
     1.3" yang JUGA jadi contoh persis di screenshot form "Master Fixed
     Asset" (Aturan Penyusutan "Kelompok Kendaraan Bermotor Masa Manfaat 8
     Thn" = kodeKelompok `KENDARAAN BERMOTOR 2` di DATA.aktivaTetapDeprRule,
     Nilai Susut 12,50% cocok formula 100/8). 14 baris TAMBAHAN disusun
     sendiri lintas cabang Semarang/Tangerang/Bandung (SENGAJA hanya 4
     cabang ini + Head Office, cocok dgn 4 lokasi yang ada di
     DATA.lokasiAset — bukan 8 cabang standar app ini, supaya field
     Lokasi selalu bisa diresolve) & lintas kelompok aktiva lain (Peralatan
     Kantor/Peralatan IT/Mesin & Peralatan Gudang/Bangunan/Software/
     Kendaraan Bermotor gol. 4th) untuk mendemokan variasi Aturan
     Penyusutan & pasangan akun G.L. Biaya/Akum. Susut baru (lihat
     komentar di atas 12 akun baru di DATA.akunGL).

     Field "Nilai Susut %"/"Masa Susut (Tahun)" TIDAK disimpan redundan
     per baris — selalu dihitung live dari `aturanKode` (lookup ke
     DATA.aktivaTetapDeprRule + formula SL=100/masaSusut, DB=200/masaSusut,
     lihat atDeprTarif() di fixed-asset.js) supaya 1 sumber kebenaran.
     Semua baris: metodePenyusutan 'Straight Line' (satu-satunya varian
     yang datanya diperlihatkan discreenshot), nilaiResidu 0, status
     'Active', tidakPenyusutan false, tglPerpindahan default "01/01/0001"
     (persis placeholder kosong di screenshot form — Lokasi Aset belum
     pernah dipindah). "Perabotan Kantor" & "Peralatan Kantor" (2 golongan
     terpisah di DATA.aktivaTetapDeprRule) SENGAJA disatukan ke 1 pasang
     akun GL yang sama (5210007/1590003) — disederhanakan, didokumentasikan. */
  aktivaTetap:[
    {kode:'00-KDR001', nama:'Grand Max Blin Van 1.3', spesifikasi:'', merek:'', cabang:'Head Office', lokasiKode:'00', tglBeli:'02/07/2018', tglMulaiSusut:'02/07/2018', hargaBeli:75000000, barcode:'', status:'Active', tidakPenyusutan:false, metodePenyusutan:'Straight Line', kelompokAktiva:'Komersial', aturanKode:'KENDARAAN BERMOTOR 2', nilaiResidu:0, tglPerpindahan:'01/01/0001', penanggungJawab:'', pemakaiAsset:'', glBiayaSusut:'5210006', glAkmSusut:'1590002'},
    {kode:'00-KDR002', nama:'Suzuki Ertiga th 2013', spesifikasi:'', merek:'', cabang:'Head Office', lokasiKode:'00', tglBeli:'02/07/2018', tglMulaiSusut:'02/07/2018', hargaBeli:70000000, barcode:'', status:'Active', tidakPenyusutan:false, metodePenyusutan:'Straight Line', kelompokAktiva:'Komersial', aturanKode:'KENDARAAN BERMOTOR 2', nilaiResidu:0, tglPerpindahan:'01/01/0001', penanggungJawab:'', pemakaiAsset:'', glBiayaSusut:'5210006', glAkmSusut:'1590002'},
    {kode:'00-KDR003', nama:'Mitsubishi L 300 + Box, th 2013', spesifikasi:'', merek:'', cabang:'Head Office', lokasiKode:'00', tglBeli:'02/07/2018', tglMulaiSusut:'02/07/2018', hargaBeli:67500000, barcode:'', status:'Active', tidakPenyusutan:false, metodePenyusutan:'Straight Line', kelompokAktiva:'Komersial', aturanKode:'KENDARAAN BERMOTOR 2', nilaiResidu:0, tglPerpindahan:'01/01/0001', penanggungJawab:'', pemakaiAsset:'', glBiayaSusut:'5210006', glAkmSusut:'1590002'},
    {kode:'00-KDR004', nama:'Mitsubishi L 300 + Box, th 2013', spesifikasi:'', merek:'', cabang:'Head Office', lokasiKode:'00', tglBeli:'02/07/2018', tglMulaiSusut:'02/07/2018', hargaBeli:67500000, barcode:'', status:'Active', tidakPenyusutan:false, metodePenyusutan:'Straight Line', kelompokAktiva:'Komersial', aturanKode:'KENDARAAN BERMOTOR 2', nilaiResidu:0, tglPerpindahan:'01/01/0001', penanggungJawab:'', pemakaiAsset:'', glBiayaSusut:'5210006', glAkmSusut:'1590002'},
    {kode:'00-KDR005', nama:'Mitsubishi L 300 + Box, th 2015', spesifikasi:'', merek:'', cabang:'Head Office', lokasiKode:'00', tglBeli:'02/07/2018', tglMulaiSusut:'02/07/2018', hargaBeli:115000000, barcode:'', status:'Active', tidakPenyusutan:false, metodePenyusutan:'Straight Line', kelompokAktiva:'Komersial', aturanKode:'KENDARAAN BERMOTOR 2', nilaiResidu:0, tglPerpindahan:'01/01/0001', penanggungJawab:'', pemakaiAsset:'', glBiayaSusut:'5210006', glAkmSusut:'1590002'},
    {kode:'00-KDR006', nama:'Mitsubishi Colt Diesel FE 71 L + Box, th 2014', spesifikasi:'', merek:'', cabang:'Head Office', lokasiKode:'00', tglBeli:'02/07/2018', tglMulaiSusut:'02/07/2018', hargaBeli:130000000, barcode:'', status:'Active', tidakPenyusutan:false, metodePenyusutan:'Straight Line', kelompokAktiva:'Komersial', aturanKode:'KENDARAAN BERMOTOR 2', nilaiResidu:0, tglPerpindahan:'01/01/0001', penanggungJawab:'', pemakaiAsset:'', glBiayaSusut:'5210006', glAkmSusut:'1590002'},
    {kode:'00-KDR007', nama:'Mitsubishi L 300 + Box, th 2016', spesifikasi:'', merek:'', cabang:'Head Office', lokasiKode:'00', tglBeli:'02/07/2018', tglMulaiSusut:'02/07/2018', hargaBeli:134500000, barcode:'', status:'Active', tidakPenyusutan:false, metodePenyusutan:'Straight Line', kelompokAktiva:'Komersial', aturanKode:'KENDARAAN BERMOTOR 2', nilaiResidu:0, tglPerpindahan:'01/01/0001', penanggungJawab:'', pemakaiAsset:'', glBiayaSusut:'5210006', glAkmSusut:'1590002'},
    {kode:'00-KDR008', nama:'Isuzu Traga 2,5 Box Alm, Th 2023', spesifikasi:'', merek:'', cabang:'Head Office', lokasiKode:'00', tglBeli:'01/12/2023', tglMulaiSusut:'01/12/2023', hargaBeli:275000000, barcode:'', status:'Active', tidakPenyusutan:false, metodePenyusutan:'Straight Line', kelompokAktiva:'Komersial', aturanKode:'KENDARAAN BERMOTOR 2', nilaiResidu:0, tglPerpindahan:'01/01/0001', penanggungJawab:'', pemakaiAsset:'', glBiayaSusut:'5210006', glAkmSusut:'1590002'},
    {kode:'00-KDR009', nama:'Isuzu Traga 2,5 Box Alm, Th 2023', spesifikasi:'', merek:'', cabang:'Head Office', lokasiKode:'00', tglBeli:'01/12/2023', tglMulaiSusut:'01/12/2023', hargaBeli:275000000, barcode:'', status:'Active', tidakPenyusutan:false, metodePenyusutan:'Straight Line', kelompokAktiva:'Komersial', aturanKode:'KENDARAAN BERMOTOR 2', nilaiResidu:0, tglPerpindahan:'01/01/0001', penanggungJawab:'', pemakaiAsset:'', glBiayaSusut:'5210006', glAkmSusut:'1590002'},
    {kode:'00-KDR010', nama:'Isuzu Traga 2,5 Box Alm, Th 2023', spesifikasi:'', merek:'', cabang:'Head Office', lokasiKode:'00', tglBeli:'01/06/2024', tglMulaiSusut:'01/06/2024', hargaBeli:270000000, barcode:'', status:'Active', tidakPenyusutan:false, metodePenyusutan:'Straight Line', kelompokAktiva:'Komersial', aturanKode:'KENDARAAN BERMOTOR 2', nilaiResidu:0, tglPerpindahan:'01/01/0001', penanggungJawab:'', pemakaiAsset:'', glBiayaSusut:'5210006', glAkmSusut:'1590002'},
    {kode:'02-PRK001', nama:'AC Split Daikin 1.5 PK (Kantor Semarang)', spesifikasi:'', merek:'Daikin', cabang:'Semarang', lokasiKode:'02', tglBeli:'15/03/2021', tglMulaiSusut:'15/03/2021', hargaBeli:8500000, barcode:'', status:'Active', tidakPenyusutan:false, metodePenyusutan:'Straight Line', kelompokAktiva:'Komersial', aturanKode:'PERALATAN KANTOR 2', nilaiResidu:0, tglPerpindahan:'01/01/0001', penanggungJawab:'', pemakaiAsset:'', glBiayaSusut:'5210007', glAkmSusut:'1590003'},
    {kode:'02-PRK002', nama:'Meja & Kursi Kantor (Set 10)', spesifikasi:'', merek:'', cabang:'Semarang', lokasiKode:'02', tglBeli:'15/03/2021', tglMulaiSusut:'15/03/2021', hargaBeli:15000000, barcode:'', status:'Active', tidakPenyusutan:false, metodePenyusutan:'Straight Line', kelompokAktiva:'Komersial', aturanKode:'PERABOTAN KANTOR 2', nilaiResidu:0, tglPerpindahan:'01/01/0001', penanggungJawab:'', pemakaiAsset:'', glBiayaSusut:'5210007', glAkmSusut:'1590003'},
    {kode:'03-ITK001', nama:'Laptop Dell Latitude 5420', spesifikasi:'', merek:'Dell', cabang:'Tangerang', lokasiKode:'03', tglBeli:'10/01/2023', tglMulaiSusut:'10/01/2023', hargaBeli:12000000, barcode:'', status:'Active', tidakPenyusutan:false, metodePenyusutan:'Straight Line', kelompokAktiva:'Komersial', aturanKode:'PERALATAN IT 2', nilaiResidu:0, tglPerpindahan:'01/01/0001', penanggungJawab:'', pemakaiAsset:'', glBiayaSusut:'5210008', glAkmSusut:'1590004'},
    {kode:'03-ITK002', nama:'Server Rack HP ProLiant', spesifikasi:'', merek:'HP', cabang:'Tangerang', lokasiKode:'03', tglBeli:'10/01/2023', tglMulaiSusut:'10/01/2023', hargaBeli:45000000, barcode:'', status:'Active', tidakPenyusutan:false, metodePenyusutan:'Straight Line', kelompokAktiva:'Komersial', aturanKode:'PERALATAN IT 2', nilaiResidu:0, tglPerpindahan:'01/01/0001', penanggungJawab:'', pemakaiAsset:'', glBiayaSusut:'5210008', glAkmSusut:'1590004'},
    {kode:'04-MSN001', nama:'Forklift Toyota 2.5 Ton', spesifikasi:'', merek:'Toyota', cabang:'Bandung', lokasiKode:'04', tglBeli:'20/06/2019', tglMulaiSusut:'20/06/2019', hargaBeli:180000000, barcode:'', status:'Active', tidakPenyusutan:false, metodePenyusutan:'Straight Line', kelompokAktiva:'Komersial', aturanKode:'MESIN DAN PERALATAN GUDANG 2', nilaiResidu:0, tglPerpindahan:'01/01/0001', penanggungJawab:'', pemakaiAsset:'', glBiayaSusut:'5210009', glAkmSusut:'1590005'},
    {kode:'04-MSN002', nama:'Rak Gudang Besi Bertingkat (Set)', spesifikasi:'', merek:'', cabang:'Bandung', lokasiKode:'04', tglBeli:'20/06/2019', tglMulaiSusut:'20/06/2019', hargaBeli:45000000, barcode:'', status:'Active', tidakPenyusutan:false, metodePenyusutan:'Straight Line', kelompokAktiva:'Komersial', aturanKode:'MESIN DAN PERALATAN GUDANG 1', nilaiResidu:0, tglPerpindahan:'01/01/0001', penanggungJawab:'', pemakaiAsset:'', glBiayaSusut:'5210009', glAkmSusut:'1590005'},
    {kode:'00-GDG001', nama:'Gedung Kantor & Gudang Head Office', spesifikasi:'', merek:'', cabang:'Head Office', lokasiKode:'00', tglBeli:'01/01/2015', tglMulaiSusut:'01/01/2015', hargaBeli:1200000000, barcode:'', status:'Active', tidakPenyusutan:false, metodePenyusutan:'Straight Line', kelompokAktiva:'Komersial', aturanKode:'BANGUNAN PERMANEN', nilaiResidu:0, tglPerpindahan:'01/01/0001', penanggungJawab:'', pemakaiAsset:'', glBiayaSusut:'5210010', glAkmSusut:'1590006'},
    {kode:'00-GDG002', nama:'Gudang Cabang Head Office (Semi Permanen)', spesifikasi:'', merek:'', cabang:'Head Office', lokasiKode:'00', tglBeli:'01/01/2015', tglMulaiSusut:'01/01/2015', hargaBeli:250000000, barcode:'', status:'Active', tidakPenyusutan:false, metodePenyusutan:'Straight Line', kelompokAktiva:'Komersial', aturanKode:'BANGUNAN SEMI PERMANEN', nilaiResidu:0, tglPerpindahan:'01/01/0001', penanggungJawab:'', pemakaiAsset:'', glBiayaSusut:'5210010', glAkmSusut:'1590006'},
    {kode:'00-SFT001', nama:'Lisensi Software Akuntansi MASERP', spesifikasi:'', merek:'', cabang:'Head Office', lokasiKode:'00', tglBeli:'01/08/2024', tglMulaiSusut:'01/08/2024', hargaBeli:60000000, barcode:'', status:'Active', tidakPenyusutan:false, metodePenyusutan:'Straight Line', kelompokAktiva:'Komersial', aturanKode:'SOFTWARE 2', nilaiResidu:0, tglPerpindahan:'01/01/0001', penanggungJawab:'', pemakaiAsset:'', glBiayaSusut:'5210011', glAkmSusut:'1590007'},
    {kode:'00-SFT002', nama:'Lisensi Microsoft Office 365 (25 user)', spesifikasi:'', merek:'', cabang:'Head Office', lokasiKode:'00', tglBeli:'01/08/2024', tglMulaiSusut:'01/08/2024', hargaBeli:15000000, barcode:'', status:'Active', tidakPenyusutan:false, metodePenyusutan:'Straight Line', kelompokAktiva:'Komersial', aturanKode:'SOFTWARE 1', nilaiResidu:0, tglPerpindahan:'01/01/0001', penanggungJawab:'', pemakaiAsset:'', glBiayaSusut:'5210011', glAkmSusut:'1590007'},
    /* hargaBeli 00-KDR011 diupdate 2026-08-26 (lanjutan lagi) dari
       22.000.000 → 25.000.000: sudah "dinaikkan" via 1 contoh
       transaksi Revaluasi Asset (Nominal +3.000.000), lihat
       DATA.revaluasiAsset. hargaBeli TETAP field yg sama, hanya
       nilainya sudah mencerminkan revaluasi tsb — konsisten pola
       "computed live", bukan disimpan snapshot terpisah. */
    {kode:'00-KDR011', nama:'Motor Honda Vario 125 (Kurir Head Office)', spesifikasi:'', merek:'Honda', cabang:'Head Office', lokasiKode:'00', tglBeli:'05/09/2022', tglMulaiSusut:'05/09/2022', hargaBeli:25000000, barcode:'', status:'Active', tidakPenyusutan:false, metodePenyusutan:'Straight Line', kelompokAktiva:'Komersial', aturanKode:'KENDARAAN BERMOTOR 1', nilaiResidu:0, tglPerpindahan:'01/01/0001', penanggungJawab:'', pemakaiAsset:'', glBiayaSusut:'5210006', glAkmSusut:'1590002'},
    /* disposalNo diisi 2026-08-26 (lanjutan lagi): aset ini sudah
       "dikunci" via 1 contoh transaksi Disposal Asset, lihat
       DATA.disposalAsset — field disposalNo dicocokkan di picker
       "Pilih Fixed Asset" pada disposal-asset.js/revaluasi-asset.js
       (`!a.disposalNo`) supaya aset yg sudah di-disposal tidak bisa
       dipilih lagi. status:'Non Active' sudah ada dari sebelumnya
       (konsisten — aset yg didisposal seharusnya non-aktif). */
    {kode:'02-KDR012', nama:'Motor Honda Vario 125 (Kurir Semarang)', spesifikasi:'', merek:'Honda', cabang:'Semarang', lokasiKode:'02', tglBeli:'05/09/2022', tglMulaiSusut:'05/09/2022', hargaBeli:22000000, barcode:'', status:'Non Active', tidakPenyusutan:false, metodePenyusutan:'Straight Line', kelompokAktiva:'Komersial', aturanKode:'KENDARAAN BERMOTOR 1', nilaiResidu:0, tglPerpindahan:'01/01/0001', penanggungJawab:'', pemakaiAsset:'', glBiayaSusut:'5210006', glAkmSusut:'1590002', disposalNo:'26/DIS/SMG/08/00001'},
    {kode:'03-PRK003', nama:'Lemari Arsip Kantor Tangerang', spesifikasi:'', merek:'', cabang:'Tangerang', lokasiKode:'03', tglBeli:'12/11/2023', tglMulaiSusut:'12/11/2023', hargaBeli:6500000, barcode:'', status:'Active', tidakPenyusutan:false, metodePenyusutan:'Straight Line', kelompokAktiva:'Komersial', aturanKode:'PERALATAN KANTOR 1', nilaiResidu:0, tglPerpindahan:'01/01/0001', penanggungJawab:'', pemakaiAsset:'', glBiayaSusut:'5210007', glAkmSusut:'1590003'},
    {kode:'04-ITK003', nama:'Printer Epson L3210 (Kantor Bandung)', spesifikasi:'', merek:'Epson', cabang:'Bandung', lokasiKode:'04', tglBeli:'12/11/2023', tglMulaiSusut:'12/11/2023', hargaBeli:2800000, barcode:'', status:'Active', tidakPenyusutan:false, metodePenyusutan:'Straight Line', kelompokAktiva:'Komersial', aturanKode:'PERALATAN IT 1', nilaiResidu:0, tglPerpindahan:'01/01/0001', penanggungJawab:'', pemakaiAsset:'', glBiayaSusut:'5210008', glAkmSusut:'1590004'},
  ],
  /* Lokasi Aset (menu Aktiva Tetap > Master & Setting > Lokasi,
     page:'lokasiAset') — sebelumnya tidak ada menunya sama sekali,
     dibangun sesuai screenshot MASERP "Daftar Lokasi Aset" (+Tambah,
     kolom Kode Lokasi/Nama Lokasi/Ubah/Hapus). 4 baris PERSIS
     screenshot — kode "00"/"02"/"03"/"04" (LOMPAT dari "01", quirk data
     asli direproduksi apa adanya, bukan salah ketik). Kode dientri
     MANUAL, wajib unik, readonly di mode Ubah (pola sama Master Divisi/
     Kategori Reordering Sheet). Dipakai sebagai referensi field "Lokasi
     Aset" di form Master Fixed Asset (lihat DATA.aktivaTetap). */
  lokasiAset:[
    {kode:'00', nama:'Head Office'},
    {kode:'02', nama:'Semarang'},
    {kode:'03', nama:'Tangerang'},
    {kode:'04', nama:'Bandung'},
  ],
  /* Aktiva Tetap Depr Rule (menu Aktiva Tetap > Master & Setting >
     Rumus Penyusutan, page:'aktivaTetapDeprRule') — sebelumnya tidak ada
     menunya sama sekali, dibangun sesuai 2 screenshot MASERP: list
     "Daftar Master Aktiva Tetap Dept Rule" (24 baris, kolom Kode
     Kelompok/Golongan/Keterangan/Kelompok Aktiva[Fiskal/Komersial]/
     Ubah/Hapus) & form "Aktiva Tetap Depr Rule" (Kode Golongan/Tarif
     Susut Straight Line %/Tarif Susut Declining Balance %/Kode
     Kelompok/Masa Susut (Tahun)/Keterangan).

     24 baris PERSIS screenshot list (8 Fiskal kode "1"-"7"+"P", 16
     Komersial kode nama seperti "KENDARAAN BERMOTOR 1/2" dst.) — TIDAK
     didownsize karena datasetnya sudah kecil (konsisten precedent
     Group Produk/Kategori Reordering Sheet). "Masa Susut (Tahun)"
     diparse dari teks Keterangan tiap baris screenshot ("...Masa
     Manfaat N Thn"). Field "Tarif Susut Straight Line %"/"Declining
     Balance %" TIDAK disimpan di sini — dihitung live pakai formula
     SL=100/masaSusut, DB=200/masaSusut (lihat atDeprTarif() di
     aktiva-tetap-depr-rule.js), DIVERIFIKASI cocok 100% dengan 2 baris
     contoh nyata di screenshot form ("KENDARAAN BERMOTOR 1" masa 4 Thn
     → SL 25,00%/DB 50,00%; "KENDARAAN BERMOTOR 2" masa 8 Thn dipakai
     sbg Aturan Penyusutan contoh di form Master Fixed Asset → Nilai
     Susut 12,50% = SL 100/8). "Kode Golongan" (dropdown, screenshot
     cuma menampilkan 1 opsi "Bukan bangunan" utk baris golongan "1")
     dipetakan: golongan "1" → "Bukan bangunan", golongan "2"/"P" →
     "Bangunan Permanen" — opsi ke-3 "Bangunan Tidak Permanen"
     ditambahkan di dropdown form utk kelengkapan kategori fiskal real
     tapi tidak dipakai baris manapun di sini (asumsi desain).

     Field "Kelompok Aktiva" (Fiskal/Komersial) ADA di kolom list tapi
     TIDAK terlihat di screenshot form "Aktiva Tetap Depr Rule" (crop
     screenshot cuma menampilkan sampai Keterangan) — DITAMBAHKAN
     sebagai radio button di form (inferred/asumsi, didokumentasikan)
     supaya kolom list ini tetap bisa diisi lewat Tambah/Ubah. */
  aktivaTetapDeprRule:[
    {kodeKelompok:'1', golongan:'1', kodeGolongan:'Bukan bangunan', masaSusut:4, kelompokAktiva:'Fiskal', keterangan:'Kelompok Peralatan & Perabotan Adm Kantor Masa Manfaat 4 Thn'},
    {kodeKelompok:'2', golongan:'1', kodeGolongan:'Bukan bangunan', masaSusut:4, kelompokAktiva:'Fiskal', keterangan:'Kelompok Peralatan & Perabotan Adm Produksi Masa Manfaat 4Th'},
    {kodeKelompok:'3', golongan:'1', kodeGolongan:'Bukan bangunan', masaSusut:8, kelompokAktiva:'Fiskal', keterangan:'Kelompok Kendaraan Kantor Masa Manfaat 8 Thn'},
    {kodeKelompok:'4', golongan:'1', kodeGolongan:'Bukan bangunan', masaSusut:8, kelompokAktiva:'Fiskal', keterangan:'Kelompok Kendaraan Lapangan Masa Manfaat 8 Thn'},
    {kodeKelompok:'5', golongan:'1', kodeGolongan:'Bukan bangunan', masaSusut:8, kelompokAktiva:'Fiskal', keterangan:'Kelompok Mesin & Peralatan Kerja Lapangan Masa Manfaat 8 Thn'},
    {kodeKelompok:'6', golongan:'1', kodeGolongan:'Bukan bangunan', masaSusut:8, kelompokAktiva:'Fiskal', keterangan:'Kelompok Peralatan & Perabotan Adm Produksi Masa Manfaat 8Th'},
    {kodeKelompok:'7', golongan:'1', kodeGolongan:'Bukan bangunan', masaSusut:16, kelompokAktiva:'Fiskal', keterangan:'Kelompok Mesin & Peralatan Kerja Lapangan Masa Manfaat 16Thn'},
    {kodeKelompok:'P', golongan:'2', kodeGolongan:'Bangunan Permanen', masaSusut:20, kelompokAktiva:'Fiskal', keterangan:'Kelompok Bangunan Permanen Masa Manfaat 20 Thn'},
    {kodeKelompok:'SOFTWARE 2', golongan:'1', kodeGolongan:'Bukan bangunan', masaSusut:8, kelompokAktiva:'Komersial', keterangan:'Kelompok Software Masa Manfaat 8 Thn'},
    {kodeKelompok:'KENDARAAN BERMOTOR 1', golongan:'1', kodeGolongan:'Bukan bangunan', masaSusut:4, kelompokAktiva:'Komersial', keterangan:'Kelompok Kendaraan Bermotor Masa Manfaat 4 Thn'},
    {kodeKelompok:'PERALATAN KANTOR 2', golongan:'1', kodeGolongan:'Bukan bangunan', masaSusut:8, kelompokAktiva:'Komersial', keterangan:'Kelompok Peralatan Kantor Masa Manfaat 8 Thn'},
    {kodeKelompok:'PERABOTAN KANTOR 2', golongan:'1', kodeGolongan:'Bukan bangunan', masaSusut:8, kelompokAktiva:'Komersial', keterangan:'Kelompok Perabotan Kantor Masa Manfaat 8 Thn'},
    {kodeKelompok:'KENDARAAN BERMOTOR 2', golongan:'1', kodeGolongan:'Bukan bangunan', masaSusut:8, kelompokAktiva:'Komersial', keterangan:'Kelompok Kendaraan Bermotor Masa Manfaat 8 Thn'},
    {kodeKelompok:'PERALATAN IT 2', golongan:'1', kodeGolongan:'Bukan bangunan', masaSusut:8, kelompokAktiva:'Komersial', keterangan:'Kelompok Peralatan IT Masa Manfaat 8 Thn'},
    {kodeKelompok:'MESIN DAN PERALATAN GUDANG 2', golongan:'1', kodeGolongan:'Bukan bangunan', masaSusut:8, kelompokAktiva:'Komersial', keterangan:'Kelompok Mesin & Peralatan Masa Manfaat 8 Thn'},
    {kodeKelompok:'BANGUNAN PERMANEN', golongan:'2', kodeGolongan:'Bangunan Permanen', masaSusut:20, kelompokAktiva:'Komersial', keterangan:'Kelompok Bangunan Permanen Masa Manfaat 20 Thn'},
    {kodeKelompok:'BANGUNAN PERMANEN 30 TH', golongan:'2', kodeGolongan:'Bangunan Permanen', masaSusut:30, kelompokAktiva:'Komersial', keterangan:'Kelompok Bangunan Permanen Masa Manfaat 30 Thn'},
    {kodeKelompok:'SOFTWARE 1', golongan:'1', kodeGolongan:'Bukan bangunan', masaSusut:4, kelompokAktiva:'Komersial', keterangan:'Kelompok Software Masa Manfaat 4 Thn'},
    {kodeKelompok:'PERABOTAN KANTOR 1', golongan:'1', kodeGolongan:'Bukan bangunan', masaSusut:4, kelompokAktiva:'Komersial', keterangan:'Kelompok Perabotan Kantor Masa Manfaat 4 Thn'},
    {kodeKelompok:'PERALATAN IT 1', golongan:'1', kodeGolongan:'Bukan bangunan', masaSusut:4, kelompokAktiva:'Komersial', keterangan:'Kelompok Peralatan IT Masa Manfaat 4 Thn'},
    {kodeKelompok:'BANGUNAN SEMI PERMANEN', golongan:'2', kodeGolongan:'Bangunan Permanen', masaSusut:10, kelompokAktiva:'Komersial', keterangan:'Kelompok Bangunan Permanen Masa Manfaat 10 Thn'},
    {kodeKelompok:'MESIN DAN PERALATAN GUDANG 3', golongan:'1', kodeGolongan:'Bukan bangunan', masaSusut:16, kelompokAktiva:'Komersial', keterangan:'Kelompok Mesin & Peralatan Masa Manfaat 16 Thn'},
    {kodeKelompok:'MESIN DAN PERALATAN GUDANG 1', golongan:'1', kodeGolongan:'Bukan bangunan', masaSusut:4, kelompokAktiva:'Komersial', keterangan:'Kelompok Mesin & Peralatan Masa Manfaat 4 Thn'},
    {kodeKelompok:'PERALATAN KANTOR 1', golongan:'1', kodeGolongan:'Bukan bangunan', masaSusut:4, kelompokAktiva:'Komersial', keterangan:'Kelompok Peralatan Kantor Masa Manfaat 4 Thn'},
  ],
  /* Jurnal Fixed Asset (menu Aktiva Tetap > Master & Setting > Jurnal
     Aktiva Tetap, page:'jurnalFixedAsset') — sebelumnya tidak ada
     menunya sama sekali, dibangun sesuai screenshot MASERP "Daftar
     Jurnal Fixed Asset" (toolbar 6 tombol +Jurnal Saldo Awal/+Jurnal
     Pembelian/+Jurnal Penjualan/+Jurnal Biaya/+Jurnal Disposal/+Jurnal
     Revaluasi, kolom Kode Jurnal/Keterangan Jurnal/Edit/Delete).

     13 baris PERSIS screenshot (Kode Jurnal LOMPAT 1-4 lalu 9-17 —
     quirk data asli direproduksi apa adanya, kode 5-8 diasumsikan sudah
     terhapus di instalasi sumber screenshot, bukan salah ketik). Field
     `tipe` per baris diparse dari teks parentheses Keterangan (Saldo
     Awal/Pembelian Kredit/Penjualan/Disposal) — dipakai utk grouping
     & konsistensi dgn tombol toolbar mana yang akan membuat baris
     serupa. `golDebit`/`golKredit` (akun G.L.) SENGAJA dibiarkan kosong
     utk 13 baris legacy ini (screenshot list tidak pernah menampilkan
     kolom akun, jadi tidak direka-reka) — field ini hanya terisi utk
     baris BARU yang dibuat lewat salah satu 6 tombol Tambah (lihat
     jurnal-fixed-asset.js), yang mewajibkan pilih Kode G.L. Debit/
     Kredit dari DATA.akunGL. Tidak ada baris sample utk tipe "Biaya"/
     "Revaluasi" (screenshot tidak menunjukkan baris jenis itu), tapi
     ke-2 tombol toolbar-nya tetap fungsional utk Tambah baru.

     UPDATE 2026-08-26 (lanjutan lagi) — dibangun menu Disposal Asset
     & Revaluasi Asset (Aktiva Tetap > Daftar Transaksi), lihat
     disposal-asset.js/.template.js & revaluasi-asset.js/.template.js.
     Baris kode:9 (Disposal) yg sebelumnya glDebit/glKredit kosong
     kini DIISI (dipakai contoh transaksi Disposal), REUSE akun
     Aktiva Tetap EXISTING '1510003' Kendaraan (bukan akun baru) utk
     sisi Kredit + akun BARU '6510004' Kerugian Pelepasan utk sisi
     Debit. Baris BARU kode:18 (Revaluasi) ditambahkan — sebelumnya
     tidak ada contoh baris tipe ini sama sekali — dgn glDebit REUSE
     akun EXISTING '1510003' Kendaraan (sisi Aktiva Tetap) & glKredit
     akun BARU '3110002' Selisih Revaluasi. */
  jurnalFixedAsset:[
    {kode:1, keterangan:'Jurnal Gedung (Saldo Awal)', tipe:'Saldo Awal', golongan:'Gedung', glDebit:'', glKredit:''},
    {kode:2, keterangan:'Jurnal Perabotan Kantor (Saldo Awal)', tipe:'Saldo Awal', golongan:'Perabotan Kantor', glDebit:'', glKredit:''},
    {kode:3, keterangan:'Jurnal Mesin Peralatan (Saldo Awal)', tipe:'Saldo Awal', golongan:'Mesin Peralatan', glDebit:'', glKredit:''},
    {kode:4, keterangan:'Jurnal Kendaraan Bermotor (Saldo Awal)', tipe:'Saldo Awal', golongan:'Kendaraan Bermotor', glDebit:'', glKredit:''},
    {kode:9, keterangan:'Jurnal Kendaraan Bermotor (Disposal)', tipe:'Disposal', golongan:'Kendaraan Bermotor', glDebit:'6510004', glKredit:'1510003'},
    {kode:10, keterangan:'Jurnal Peralatan IT (Saldo Awal)', tipe:'Saldo Awal', golongan:'Peralatan IT', glDebit:'', glKredit:''},
    {kode:11, keterangan:'Jurnal Peralatan Kantor (Saldo Awal)', tipe:'Saldo Awal', golongan:'Peralatan Kantor', glDebit:'', glKredit:''},
    {kode:12, keterangan:'Jurnal Kendaraan (Pembelian Kredit)', tipe:'Pembelian Kredit', golongan:'Kendaraan', glDebit:'', glKredit:''},
    {kode:13, keterangan:'Jurnal Gedung (Pembelian Kredit)', tipe:'Pembelian Kredit', golongan:'Gedung', glDebit:'', glKredit:''},
    {kode:14, keterangan:'Jurnal Peralatan Kantor (Pembelian Kredit)', tipe:'Pembelian Kredit', golongan:'Peralatan Kantor', glDebit:'', glKredit:''},
    {kode:15, keterangan:'Jurnal Peralatan IT (Pembelian Kredit)', tipe:'Pembelian Kredit', golongan:'Peralatan IT', glDebit:'', glKredit:''},
    {kode:16, keterangan:'Jurnal Perabotan Kantor (Pembelian Kredit)', tipe:'Pembelian Kredit', golongan:'Perabotan Kantor', glDebit:'', glKredit:''},
    {kode:17, keterangan:'Jurnal Kendaraan Bermotor (Penjualan)', tipe:'Penjualan', golongan:'Kendaraan Bermotor', glDebit:'', glKredit:''},
    {kode:18, keterangan:'Jurnal Kendaraan Bermotor (Revaluasi)', tipe:'Revaluasi', golongan:'Kendaraan Bermotor', glDebit:'1510003', glKredit:'3110002'},
  ],
  /* Disposal Asset (Aktiva Tetap > Daftar Transaksi > Disposal Asset,
     page:'disposalAsset') — BARU 2026-08-26 (lanjutan lagi), sebelumnya
     placeholder. 1 baris sample: motor 02-KDR012 (Kurir Semarang) yg
     sebelumnya sudah status Non Active dihapusbukukan tgl 20/08/2026,
     Jurnal dipilih kode:9 (Disposal). Akumulasi
     Penyusutan & Nilai Buku Bersih TIDAK disimpan di sini — selalu
     computed live via disHitungSusut() di disposal-asset.js dari data
     asli aset (hargaBeli/tglMulaiSusut/aturanKode) + tglTransaksi. */
  disposalAsset:[
    {noTransaksi:'26/DIS/SMG/08/00001', tglTransaksi:'20/08/2026', cabang:'Semarang', keterangan:'Motor sering mogok, kondisi rusak berat, sudah tidak layak pakai — dihapusbukukan.', items:[
      {kode:'02-KDR012', jurnalKode:9},
    ]},
  ],
  /* Revaluasi Asset (Aktiva Tetap > Daftar Transaksi > Revaluasi Asset,
     page:'revaluasiAsset') — BARU 2026-08-26 (lanjutan lagi), sebelumnya
     placeholder. 1 baris sample: motor 00-KDR011 (Kurir Head Office)
     direvaluasi NAIK (Nominal +3.000.000) tgl 15/08/2026 setelah overhaul
     mesin — hargaBeli aset di DATA.aktivaTetap SUDAH mencerminkan
     kenaikan ini (22.000.000 → 25.000.000, lihat catatan di baris
     00-KDR011 di atas). Tahun/Bulan hanya informasional (lihat catatan
     besar di revaluasi-asset.js kenapa tidak genuinely dipakai). */
  revaluasiAsset:[
    {noTransaksi:'26/REV/HO/08/00001', tglTrn:'15/08/2026', tglMulaiSusut:'05/09/2022', cabang:'Head Office', keterangan:'Overhaul mesin & ganti komponen utama — menaikkan nilai wajar aset.', items:[
      {kode:'00-KDR011', jurnalKode:18, tahun:0, bulan:6, nominal:3000000},
    ]},
  ],
  /* Master User — menu User Security > Master User (page:'users', sebelumnya
     renderer generik lewat objek `pages` di js/core.js dgn field lama nama/
     username/role/status; kini renderer generik itu DIHAPUS, diganti modul
     CRUD PENUH js/pages/master-user.template.js+master-user.js). Sesuai 2
     screenshot MASERP yang dikirim user 2026-08-18: "Daftar User Profile"
     (list Total Record: 93, kolom Username/Name/User Role/Cabang/Edit/
     Delete, page-size 10 default + Global Search, pager standar 7 halaman)
     dan "User Form" (Tambah: User Name, Nama, Email [+teks validasi merah
     permanen "Email diperlukan..." — quirk direproduksi APA ADANYA dari
     screenshot, sama seperti quirk GROUP/ID kosong di Sales Quotation],
     Level Pemakai dropdown, Password Terdahulu, New Password, "Pilih Akses
     Ke Perusahaan" [dekoratif, single-company], Cabang/Salesman/Rayon/Area/
     Sales Office picker, Signature upload 200x100 [dekoratif], sub-grid
     "Perusahaan | Bank | Hapus" + "+Tambah Item Baru").

     10 baris PERTAMA (adit_sls s.d. anton_sls) PERSIS username/nama/role/
     cabang dari screenshot list (halaman pertama, termasuk baris apa adanya
     'amalia_csh'/'amalia_csh' & 'andri_sls'/'ANDRI MUHAMMAD' ALL CAPS persis
     data asli, bukan salah ketik). Kode Role screenshot (SLS/ADM/IKS-HO)
     TIDAK match kode DATA.groupUser (ACC/ADG/ADM/.../SALES dst, dibangun di
     modul Group User sebelumnya dari screenshot BERBEDA) — field "role" di
     modul ini SENGAJA dibuat daftar LOKAL independen `USR_ROLE_LIST` (pola
     sama seperti RY_SALESMAN_LIST/WL_SUPERVISOR_LIST yang juga independen
     dari master lain), BUKAN reference ke DATA.groupUser, supaya kode asli
     screenshot ini tidak perlu dipaksakan cocok dengan kode yang sudah
     dikarang di modul lain. 'IKS-HO' tidak ada penjelasan di screenshot;
     diasumsikan singkatan "Instalasi Kesehatan HO" (masuk akal utk
     distributor alkes/farma seperti DBM, lihat APJA/APJF di Group User),
     didokumentasikan sbg asumsi.

     83 baris SISANYA (dedi_csh s.d. eka_adg) adalah baris TAMBAHAN yang
     disusun sendiri (screenshot cuma menunjukkan halaman pertama, 10 dari 93
     baris) supaya "Total Record: 93" tetap PERSIS sesuai screenshot & pager
     standar bisa didemokan pindah beberapa halaman sungguhan (page-size 10 x
     ~10 hal.). Nama & username dibuat dari kombinasi pool nama Indonesia,
     role di-cycle rata ke SEMUA 9 kode USR_ROLE_LIST, cabang di-cycle rata
     ke 8 kode cabang (00-07, MAPPING SAMA PERSIS dgn GDG_CABANG_CODE di
     gudang.template.js: 00=Head Office s.d. 07=Sidoarjo) supaya konsisten
     lintas modul. Baris berrole 'SLS' SENGAJA ditautkan ke data REAL yang
     sudah ada (referential integrity, bukan field kosong semua): `salesman`
     merujuk nama di `DATA.salesman`, `rayonKode` merujuk kode di `DATA.rayon`
     (Master Rayon), `areaKode` merujuk kode di `DATA.area` (Master Wilayah),
     `salesOffice` diturunkan dari cabang. Role selain SLS sengaja dibiarkan
     kosong utk field2 itu (screenshot tidak pernah menunjukkan kombinasi
     tsb utk role non-SLS). Sub-grid `perusahaanBank[]` semua baris sample
     kosong (array baru dibuat live saat form dibuka/disimpan, sama seperti
     `kecamatan[]` di Master Rayon). */
  users:[
    {username:'adit_sls', nama:'Aditya Yuli Syaputra', email:'', role:'SLS', cabangKode:'00', salesman:'Budi Santoso', rayonKode:'BANTEN 1', areaKode:'BANTEN01', salesOffice:'', perusahaanBank:[]},
    {username:'admin', nama:'admin', email:'admin@gmail.com', role:'ADM', cabangKode:'', salesman:'', rayonKode:'', areaKode:'', salesOffice:'', perusahaanBank:[]},
    {username:'admin2', nama:'Admin 2', email:'', role:'ADM', cabangKode:'', salesman:'', rayonKode:'', areaKode:'', salesOffice:'', perusahaanBank:[]},
    {username:'admin3', nama:'Admin 3', email:'', role:'ADM', cabangKode:'', salesman:'', rayonKode:'', areaKode:'', salesOffice:'', perusahaanBank:[]},
    {username:'afikri_sls', nama:'Ahmad Fikri', email:'', role:'SLS', cabangKode:'03', salesman:'Andi Wijaya', rayonKode:'BOGOR1', areaKode:'BANTEN01', salesOffice:'TANGERANG', perusahaanBank:[]},
    {username:'agus_sls', nama:'Agus Purnomo', email:'', role:'SLS', cabangKode:'00', salesman:'Citra Lestari', rayonKode:'JAKARTA1', areaKode:'BANTEN01', salesOffice:'', perusahaanBank:[]},
    {username:'alan_sls', nama:'Achmad Jaelani Mubaroq', email:'', role:'SLS', cabangKode:'00', salesman:'Dedi Kurniawan', rayonKode:'JAKARTA2', areaKode:'BANTEN01', salesOffice:'', perusahaanBank:[]},
    {username:'amalia_csh', nama:'amalia_csh', email:'', role:'IKS-HO', cabangKode:'00', salesman:'', rayonKode:'', areaKode:'', salesOffice:'', perusahaanBank:[]},
    {username:'andri_sls', nama:'ANDRI MUHAMMAD', email:'', role:'SLS', cabangKode:'03', salesman:'Eka Putri', rayonKode:'BANDUNG 01', areaKode:'JABAR001', salesOffice:'TANGERANG', perusahaanBank:[]},
    {username:'anton_sls', nama:'Anton Tri Wahyuni', email:'', role:'SLS', cabangKode:'02', salesman:'Fajar Nugroho', rayonKode:'CIREBON', areaKode:'JABAR001', salesOffice:'BANDUNG', perusahaanBank:[]},
    {username:'dedi_csh', nama:'Dedi Firmansyah', email:'', role:'CSH', cabangKode:'06', salesman:'', rayonKode:'', areaKode:'', salesOffice:'', perusahaanBank:[]},
    {username:'indra_gdg', nama:'Indra Prasetyo', email:'', role:'GDG', cabangKode:'03', salesman:'', rayonKode:'', areaKode:'', salesOffice:'', perusahaanBank:[]},
    {username:'putri_fin', nama:'Putri Hidayat', email:'', role:'FIN', cabangKode:'00', salesman:'', rayonKode:'', areaKode:'', salesOffice:'', perusahaanBank:[]},
    {username:'yanto_pjk', nama:'Yanto Setiadi', email:'', role:'PJK', cabangKode:'05', salesman:'', rayonKode:'', areaKode:'', salesOffice:'', perusahaanBank:[]},
    {username:'ika_pur', nama:'Ika Syaputra', email:'', role:'PUR', cabangKode:'02', salesman:'', rayonKode:'', areaKode:'', salesOffice:'', perusahaanBank:[]},
    {username:'sigit_mgr', nama:'Sigit Susanto', email:'', role:'MGR', cabangKode:'07', salesman:'', rayonKode:'', areaKode:'', salesOffice:'', perusahaanBank:[]},
    {username:'aditya_drv', nama:'Aditya Wibowo', email:'', role:'DRV', cabangKode:'04', salesman:'', rayonKode:'', areaKode:'', salesOffice:'', perusahaanBank:[]},
    {username:'bayu_adg', nama:'Bayu Jaelani Mubaroq', email:'', role:'ADG', cabangKode:'01', salesman:'', rayonKode:'', areaKode:'', salesOffice:'', perusahaanBank:[]},
    {username:'fitri_sls', nama:'Fitri Handayani', email:'', role:'SLS', cabangKode:'06', salesman:'Budi Santoso', rayonKode:'BANTEN 1', areaKode:'BANTEN01', salesOffice:'SEMARANG', perusahaanBank:[]},
    {username:'maya_csh', nama:'Maya Yulianto', email:'', role:'CSH', cabangKode:'03', salesman:'', rayonKode:'', areaKode:'', salesOffice:'', perusahaanBank:[]},
    {username:'umar_gdg', nama:'Umar Wahyuni', email:'', role:'GDG', cabangKode:'00', salesman:'', rayonKode:'', areaKode:'', salesOffice:'', perusahaanBank:[]},
    {username:'yulia_fin', nama:'Yulia Anggraini', email:'', role:'FIN', cabangKode:'05', salesman:'', rayonKode:'', areaKode:'', salesOffice:'', perusahaanBank:[]},
    {username:'diana_pjk', nama:'Diana Maulana', email:'', role:'PJK', cabangKode:'02', salesman:'', rayonKode:'', areaKode:'', salesOffice:'', perusahaanBank:[]},
    {username:'yudi_pur', nama:'Yudi Saputri', email:'', role:'PUR', cabangKode:'07', salesman:'', rayonKode:'', areaKode:'', salesOffice:'', perusahaanBank:[]},
    {username:'amalia_mgr', nama:'Amalia Rahmawati', email:'', role:'MGR', cabangKode:'04', salesman:'', rayonKode:'', areaKode:'', salesOffice:'', perusahaanBank:[]},
    {username:'dewi_drv', nama:'Dewi Fikri', email:'', role:'DRV', cabangKode:'01', salesman:'', rayonKode:'', areaKode:'', salesOffice:'', perusahaanBank:[]},
    {username:'joko_adg', nama:'Joko Utami', email:'', role:'ADG', cabangKode:'06', salesman:'', rayonKode:'', areaKode:'', salesOffice:'', perusahaanBank:[]},
    {username:'rendra_sls', nama:'Rendra Permana', email:'', role:'SLS', cabangKode:'03', salesman:'Andi Wijaya', rayonKode:'BOGOR1', areaKode:'JABAR001', salesOffice:'TANGERANG', perusahaanBank:[]},
    {username:'zainal_csh', nama:'Zainal Wijaya', email:'', role:'CSH', cabangKode:'00', salesman:'', rayonKode:'', areaKode:'', salesOffice:'', perusahaanBank:[]},
    {username:'nurul_gdg', nama:'Nurul Gunawan', email:'', role:'GDG', cabangKode:'05', salesman:'', rayonKode:'', areaKode:'', salesOffice:'', perusahaanBank:[]},
    {username:'tono_fin', nama:'Tono Kusuma', email:'', role:'FIN', cabangKode:'02', salesman:'', rayonKode:'', areaKode:'', salesOffice:'', perusahaanBank:[]},
    {username:'ahmad_pjk', nama:'Ahmad Santoso', email:'', role:'PJK', cabangKode:'07', salesman:'', rayonKode:'', areaKode:'', salesOffice:'', perusahaanBank:[]},
    {username:'budi_pur', nama:'Budi Nugroho', email:'', role:'PUR', cabangKode:'04', salesman:'', rayonKode:'', areaKode:'', salesOffice:'', perusahaanBank:[]},
    {username:'gita_mgr', nama:'Gita Puspitasari', email:'', role:'MGR', cabangKode:'01', salesman:'', rayonKode:'', areaKode:'', salesOffice:'', perusahaanBank:[]},
    {username:'nanda_drv', nama:'Nanda Ramadhan', email:'', role:'DRV', cabangKode:'06', salesman:'', rayonKode:'', areaKode:'', salesOffice:'', perusahaanBank:[]},
    {username:'vina_adg', nama:'Vina Setiawan', email:'', role:'ADG', cabangKode:'03', salesman:'', rayonKode:'', areaKode:'', salesOffice:'', perusahaanBank:[]},
    {username:'rini_sls', nama:'Rini Purnomo', email:'', role:'SLS', cabangKode:'00', salesman:'Citra Lestari', rayonKode:'JAKARTA1', areaKode:'JATENG001', salesOffice:'', perusahaanBank:[]},
    {username:'iwan_csh', nama:'Iwan Pratama', email:'', role:'CSH', cabangKode:'05', salesman:'', rayonKode:'', areaKode:'', salesOffice:'', perusahaanBank:[]},
    {username:'bagus_gdg', nama:'Bagus Rahayu', email:'', role:'GDG', cabangKode:'02', salesman:'', rayonKode:'', areaKode:'', salesOffice:'', perusahaanBank:[]},
    {username:'andri_fin', nama:'Andri Kurniawan', email:'', role:'FIN', cabangKode:'07', salesman:'', rayonKode:'', areaKode:'', salesOffice:'', perusahaanBank:[]},
    {username:'eka_pjk', nama:'Eka Firmansyah', email:'', role:'PJK', cabangKode:'04', salesman:'', rayonKode:'', areaKode:'', salesOffice:'', perusahaanBank:[]},
    {username:'kartika_pur', nama:'Kartika Prasetyo', email:'', role:'PUR', cabangKode:'01', salesman:'', rayonKode:'', areaKode:'', salesOffice:'', perusahaanBank:[]},
    {username:'sari_mgr', nama:'Sari Hidayat', email:'', role:'MGR', cabangKode:'06', salesman:'', rayonKode:'', areaKode:'', salesOffice:'', perusahaanBank:[]},
    {username:'rizky_drv', nama:'Rizky Setiadi', email:'', role:'DRV', cabangKode:'03', salesman:'', rayonKode:'', areaKode:'', salesOffice:'', perusahaanBank:[]},
    {username:'wawan_adg', nama:'Wawan Syaputra', email:'', role:'ADG', cabangKode:'00', salesman:'', rayonKode:'', areaKode:'', salesOffice:'', perusahaanBank:[]},
    {username:'umi_sls', nama:'Umi Susanto', email:'', role:'SLS', cabangKode:'05', salesman:'Dedi Kurniawan', rayonKode:'JAKARTA2', areaKode:'JATIM001', salesOffice:'MAKASSAR', perusahaanBank:[]},
    {username:'agus_csh', nama:'Agus Wibowo', email:'', role:'CSH', cabangKode:'02', salesman:'', rayonKode:'', areaKode:'', salesOffice:'', perusahaanBank:[]},
    {username:'citra_gdg', nama:'Citra Jaelani Mubaroq', email:'', role:'GDG', cabangKode:'07', salesman:'', rayonKode:'', areaKode:'', salesOffice:'', perusahaanBank:[]},
    {username:'hendra_fin', nama:'Hendra Handayani', email:'', role:'FIN', cabangKode:'04', salesman:'', rayonKode:'', areaKode:'', salesOffice:'', perusahaanBank:[]},
    {username:'oki_pjk', nama:'Oki Yulianto', email:'', role:'PJK', cabangKode:'01', salesman:'', rayonKode:'', areaKode:'', salesOffice:'', perusahaanBank:[]},
    {username:'wahyu_pur', nama:'Wahyu Wahyuni', email:'', role:'PUR', cabangKode:'06', salesman:'', rayonKode:'', areaKode:'', salesOffice:'', perusahaanBank:[]},
    {username:'hadi_mgr', nama:'Hadi Anggraini', email:'', role:'MGR', cabangKode:'03', salesman:'', rayonKode:'', areaKode:'', salesOffice:'', perusahaanBank:[]},
    {username:'ratna_drv', nama:'Ratna Maulana', email:'', role:'DRV', cabangKode:'00', salesman:'', rayonKode:'', areaKode:'', salesOffice:'', perusahaanBank:[]},
    {username:'cahyo_adg', nama:'Cahyo Saputri', email:'', role:'ADG', cabangKode:'05', salesman:'', rayonKode:'', areaKode:'', salesOffice:'', perusahaanBank:[]},
    {username:'anton2_sls', nama:'Anton Rahmawati', email:'', role:'SLS', cabangKode:'02', salesman:'Eka Putri', rayonKode:'BANDUNG 01', areaKode:'JATIM002', salesOffice:'BANDUNG', perusahaanBank:[]},
    {username:'fajar_csh', nama:'Fajar Fikri', email:'', role:'CSH', cabangKode:'07', salesman:'', rayonKode:'', areaKode:'', salesOffice:'', perusahaanBank:[]},
    {username:'lestari_gdg', nama:'Lestari Utami', email:'', role:'GDG', cabangKode:'04', salesman:'', rayonKode:'', areaKode:'', salesOffice:'', perusahaanBank:[]},
    {username:'taufik_fin', nama:'Taufik Permana', email:'', role:'FIN', cabangKode:'01', salesman:'', rayonKode:'', areaKode:'', salesOffice:'', perusahaanBank:[]},
    {username:'fauzan_pjk', nama:'Fauzan Wijaya', email:'', role:'PJK', cabangKode:'06', salesman:'', rayonKode:'', areaKode:'', salesOffice:'', perusahaanBank:[]},
    {username:'setiawan_pur', nama:'Setiawan Gunawan', email:'', role:'PUR', cabangKode:'03', salesman:'', rayonKode:'', areaKode:'', salesOffice:'', perusahaanBank:[]},
    {username:'vera_mgr', nama:'Vera Kusuma', email:'', role:'MGR', cabangKode:'00', salesman:'', rayonKode:'', areaKode:'', salesOffice:'', perusahaanBank:[]},
    {username:'achmad_drv', nama:'Achmad Santoso', email:'', role:'DRV', cabangKode:'05', salesman:'', rayonKode:'', areaKode:'', salesOffice:'', perusahaanBank:[]},
    {username:'dedi_adg', nama:'Dedi Nugroho', email:'', role:'ADG', cabangKode:'02', salesman:'', rayonKode:'', areaKode:'', salesOffice:'', perusahaanBank:[]},
    {username:'indra_sls', nama:'Indra Puspitasari', email:'', role:'SLS', cabangKode:'07', salesman:'Fajar Nugroho', rayonKode:'CIREBON', areaKode:'BANTEN01', salesOffice:'SIDOARJO', perusahaanBank:[]},
    {username:'putri_csh', nama:'Putri Ramadhan', email:'', role:'CSH', cabangKode:'04', salesman:'', rayonKode:'', areaKode:'', salesOffice:'', perusahaanBank:[]},
    {username:'yanto_gdg', nama:'Yanto Setiawan', email:'', role:'GDG', cabangKode:'01', salesman:'', rayonKode:'', areaKode:'', salesOffice:'', perusahaanBank:[]},
    {username:'ika_fin', nama:'Ika Purnomo', email:'', role:'FIN', cabangKode:'06', salesman:'', rayonKode:'', areaKode:'', salesOffice:'', perusahaanBank:[]},
    {username:'sigit_pjk', nama:'Sigit Pratama', email:'', role:'PJK', cabangKode:'03', salesman:'', rayonKode:'', areaKode:'', salesOffice:'', perusahaanBank:[]},
    {username:'aditya_pur', nama:'Aditya Rahayu', email:'', role:'PUR', cabangKode:'00', salesman:'', rayonKode:'', areaKode:'', salesOffice:'', perusahaanBank:[]},
    {username:'bayu_mgr', nama:'Bayu Kurniawan', email:'', role:'MGR', cabangKode:'05', salesman:'', rayonKode:'', areaKode:'', salesOffice:'', perusahaanBank:[]},
    {username:'fitri_drv', nama:'Fitri Firmansyah', email:'', role:'DRV', cabangKode:'02', salesman:'', rayonKode:'', areaKode:'', salesOffice:'', perusahaanBank:[]},
    {username:'maya_adg', nama:'Maya Prasetyo', email:'', role:'ADG', cabangKode:'07', salesman:'', rayonKode:'', areaKode:'', salesOffice:'', perusahaanBank:[]},
    {username:'umar_sls', nama:'Umar Hidayat', email:'', role:'SLS', cabangKode:'04', salesman:'M. Reza Wijaya', rayonKode:'JEMBER', areaKode:'JABAR001', salesOffice:'MEDAN', perusahaanBank:[]},
    {username:'yulia_csh', nama:'Yulia Setiadi', email:'', role:'CSH', cabangKode:'01', salesman:'', rayonKode:'', areaKode:'', salesOffice:'', perusahaanBank:[]},
    {username:'diana_gdg', nama:'Diana Syaputra', email:'', role:'GDG', cabangKode:'06', salesman:'', rayonKode:'', areaKode:'', salesOffice:'', perusahaanBank:[]},
    {username:'yudi_fin', nama:'Yudi Susanto', email:'', role:'FIN', cabangKode:'03', salesman:'', rayonKode:'', areaKode:'', salesOffice:'', perusahaanBank:[]},
    {username:'amalia_pjk', nama:'Amalia Wibowo', email:'', role:'PJK', cabangKode:'00', salesman:'', rayonKode:'', areaKode:'', salesOffice:'', perusahaanBank:[]},
    {username:'dewi_pur', nama:'Dewi Jaelani Mubaroq', email:'', role:'PUR', cabangKode:'05', salesman:'', rayonKode:'', areaKode:'', salesOffice:'', perusahaanBank:[]},
    {username:'joko_mgr', nama:'Joko Handayani', email:'', role:'MGR', cabangKode:'02', salesman:'', rayonKode:'', areaKode:'', salesOffice:'', perusahaanBank:[]},
    {username:'rendra_drv', nama:'Rendra Yulianto', email:'', role:'DRV', cabangKode:'07', salesman:'', rayonKode:'', areaKode:'', salesOffice:'', perusahaanBank:[]},
    {username:'zainal_adg', nama:'Zainal Wahyuni', email:'', role:'ADG', cabangKode:'04', salesman:'', rayonKode:'', areaKode:'', salesOffice:'', perusahaanBank:[]},
    {username:'nurul_sls', nama:'Nurul Anggraini', email:'', role:'SLS', cabangKode:'01', salesman:'Budi Santoso', rayonKode:'SIDOARJO', areaKode:'JATENG001', salesOffice:'SURABAYA', perusahaanBank:[]},
    {username:'tono_csh', nama:'Tono Maulana', email:'', role:'CSH', cabangKode:'06', salesman:'', rayonKode:'', areaKode:'', salesOffice:'', perusahaanBank:[]},
    {username:'ahmad_gdg', nama:'Ahmad Saputri', email:'', role:'GDG', cabangKode:'03', salesman:'', rayonKode:'', areaKode:'', salesOffice:'', perusahaanBank:[]},
    {username:'budi_fin', nama:'Budi Rahmawati', email:'', role:'FIN', cabangKode:'00', salesman:'', rayonKode:'', areaKode:'', salesOffice:'', perusahaanBank:[]},
    {username:'gita_pjk', nama:'Gita Fikri', email:'', role:'PJK', cabangKode:'05', salesman:'', rayonKode:'', areaKode:'', salesOffice:'', perusahaanBank:[]},
    {username:'nanda_pur', nama:'Nanda Utami', email:'', role:'PUR', cabangKode:'02', salesman:'', rayonKode:'', areaKode:'', salesOffice:'', perusahaanBank:[]},
    {username:'vina_mgr', nama:'Vina Permana', email:'', role:'MGR', cabangKode:'07', salesman:'', rayonKode:'', areaKode:'', salesOffice:'', perusahaanBank:[]},
    {username:'rini_drv', nama:'Rini Wijaya', email:'', role:'DRV', cabangKode:'04', salesman:'', rayonKode:'', areaKode:'', salesOffice:'', perusahaanBank:[]},
    {username:'iwan_adg', nama:'Iwan Gunawan', email:'', role:'ADG', cabangKode:'01', salesman:'', rayonKode:'', areaKode:'', salesOffice:'', perusahaanBank:[]},
    {username:'bagus_sls', nama:'Bagus Kusuma', email:'', role:'SLS', cabangKode:'06', salesman:'Andi Wijaya', rayonKode:'SOLO', areaKode:'JATIM001', salesOffice:'SEMARANG', perusahaanBank:[]},
    {username:'andri_csh', nama:'Andri Santoso', email:'', role:'CSH', cabangKode:'03', salesman:'', rayonKode:'', areaKode:'', salesOffice:'', perusahaanBank:[]},
    {username:'eka_gdg', nama:'Eka Nugroho', email:'', role:'GDG', cabangKode:'00', salesman:'', rayonKode:'', areaKode:'', salesOffice:'', perusahaanBank:[]},
  ],
  reportCenters: REPORT_CENTERS_DATA,
  glKategori:[
    {kode:'A', nama:'Aktiva', noAwal:'11000000', glAwal:'AKTIVA LANCAR', noAkhir:'19999999', glAkhir:'AKTIVA'},
    {kode:'B', nama:'Hutang', noAwal:'20000000', glAwal:'PASSIVA', noAkhir:'29999999', glAkhir:'HUTANG'},
    {kode:'C', nama:'Modal', noAwal:'30000000', glAwal:'MODAL', noAkhir:'38999999', glAkhir:'MODAL'},
    {kode:'D', nama:'Penjualan', noAwal:'40000000', glAwal:'PENDAPATAN', noAkhir:'49999999', glAkhir:'Penjualan Bersih'},
    {kode:'E', nama:'Harga Pokok Penjualan', noAwal:'51000000', glAwal:'HARGA POKOK PENJUALAN', noAkhir:'51999999', glAkhir:'Laba Bruto'},
    {kode:'F', nama:'Biaya', noAwal:'52000000', glAwal:'BIAYA OPERASI', noAkhir:'58999999', glAkhir:'Biaya Operasi'},
    {kode:'G', nama:'Pendapatan Lain-lain', noAwal:'60000000', glAwal:'PENDAPATAN DILUAR USAHA', noAkhir:'61999999', glAkhir:'Pendapatan Diluar Usaha'},
    {kode:'H', nama:'Biaya Lain-lain', noAwal:'65000000', glAwal:'BIAYA DILUAR USAHA', noAkhir:'65999999', glAkhir:'Biaya Diluar Usaha'},
    {kode:'K', nama:'Laba Ditahan Tahun Lalu', noAwal:'32000001', glAwal:'Laba Ditahan', noAkhir:'32000099', glAkhir:'Laba Ditahan (Total)'},
    {kode:'K1', nama:'Laba Ditahan Awal Tahun s/d Bulan Lalu Entry', noAwal:'33000001', glAwal:'Laba Tahun Berjalan s/d Bulan Lalu', noAkhir:'33000099', glAkhir:'Laba Tahun Berjalan s/d Bulan Lalu (Total)'},
    {kode:'L', nama:'Laba Ditahan Awal Bulan Entry s/d Bulan Lalu', noAwal:'33000001', glAwal:'Laba Tahun Berjalan s/d Bulan Lalu', noAkhir:'33000099', glAkhir:'Laba Tahun Berjalan s/d Bulan Lalu (Total)'},
    {kode:'M', nama:'Laba Berjalan', noAwal:'34000000', glAwal:'Saldo Berjalan Bulan Ini', noAkhir:'34000000', glAkhir:'Saldo Berjalan Bulan Ini'},
    {kode:'N', nama:'Total Aktiva', noAwal:'19999999', glAwal:'AKTIVA', noAkhir:'19999999', glAkhir:'AKTIVA'},
    {kode:'O', nama:'Total Passiva', noAwal:'29999999', glAwal:'HUTANG', noAkhir:'29999999', glAkhir:'HUTANG'},
    {kode:'P', nama:'Produksi', noAwal:'11500001', glAwal:'Persediaan Barang Jakarta', noAkhir:'11500001', glAkhir:'Persediaan Barang Jakarta'},
    {kode:'X', nama:'Cash dan Bank', noAwal:'11100101', glAwal:'Cash Besar', noAkhir:'11299999', glAkhir:'Cash & Bank'},
  ],
  akunGL:[
    {kode:'1100000', nama:'AKTIVA LANCAR', kategori:'A', tipe:'D', jenis:'Header', saldoAwal:0, debet:0, kredit:0, saldoAkhir:0},
    {kode:'1100001', nama:'Kas Kecil Jakarta', kategori:'A', tipe:'D', jenis:'Detail', saldoAwal:5000000, debet:12000000, kredit:10500000, saldoAkhir:6500000},
    {kode:'1100002', nama:'Kas Besar', kategori:'A', tipe:'D', jenis:'Detail', saldoAwal:25000000, debet:80000000, kredit:78000000, saldoAkhir:27000000},
    {kode:'1100011', nama:'Bank Mandiri', kategori:'A', tipe:'D', jenis:'Detail', saldoAwal:350000000, debet:1200000000, kredit:1150000000, saldoAkhir:400000000},
    {kode:'1100012', nama:'Bank BCA', kategori:'A', tipe:'D', jenis:'Detail', saldoAwal:210000000, debet:900000000, kredit:860000000, saldoAkhir:250000000},
    {kode:'1120001', nama:'Piutang Usaha', kategori:'A', tipe:'D', jenis:'Detail', saldoAwal:480000000, debet:1750000000, kredit:1680000000, saldoAkhir:550000000},
    {kode:'1130001', nama:'Persediaan Barang Dagang Jakarta', kategori:'A', tipe:'D', jenis:'Detail', saldoAwal:620000000, debet:2100000000, kredit:2050000000, saldoAkhir:670000000},
    {kode:'1140001', nama:'Uang Muka Pembelian', kategori:'A', tipe:'D', jenis:'Detail', saldoAwal:15000000, debet:45000000, kredit:40000000, saldoAkhir:20000000},
    {kode:'1500000', nama:'AKTIVA TETAP', kategori:'A', tipe:'D', jenis:'Header', saldoAwal:0, debet:0, kredit:0, saldoAkhir:0},
    {kode:'1510001', nama:'Tanah', kategori:'A', tipe:'D', jenis:'Detail', saldoAwal:800000000, debet:0, kredit:0, saldoAkhir:800000000},
    {kode:'1510002', nama:'Bangunan', kategori:'A', tipe:'D', jenis:'Detail', saldoAwal:650000000, debet:0, kredit:0, saldoAkhir:650000000},
    {kode:'1510003', nama:'Kendaraan', kategori:'A', tipe:'D', jenis:'Detail', saldoAwal:350000000, debet:0, kredit:0, saldoAkhir:350000000},
    {kode:'1510004', nama:'Peralatan Kantor', kategori:'A', tipe:'D', jenis:'Detail', saldoAwal:85000000, debet:5000000, kredit:0, saldoAkhir:90000000},
    {kode:'1590001', nama:'Akumulasi Penyusutan', kategori:'A', tipe:'K', jenis:'Detail', saldoAwal:180000000, debet:0, kredit:25000000, saldoAkhir:205000000},
    {kode:'2100000', nama:'HUTANG LANCAR', kategori:'B', tipe:'K', jenis:'Header', saldoAwal:0, debet:0, kredit:0, saldoAkhir:0},
    {kode:'2110001', nama:'Hutang Usaha', kategori:'B', tipe:'K', jenis:'Detail', saldoAwal:214850000, debet:180000000, kredit:245000000, saldoAkhir:279850000},
    {kode:'2120001', nama:'Hutang Pajak', kategori:'B', tipe:'K', jenis:'Detail', saldoAwal:35000000, debet:12000000, kredit:18000000, saldoAkhir:41000000},
    {kode:'2130001', nama:'Biaya Yang Masih Harus Dibayar', kategori:'B', tipe:'K', jenis:'Detail', saldoAwal:22000000, debet:8000000, kredit:10000000, saldoAkhir:24000000},
    {kode:'2140001', nama:'Uang Muka Penjualan', kategori:'B', tipe:'K', jenis:'Detail', saldoAwal:18000000, debet:6000000, kredit:9000000, saldoAkhir:21000000},
    {kode:'3100000', nama:'MODAL', kategori:'C', tipe:'K', jenis:'Header', saldoAwal:0, debet:0, kredit:0, saldoAkhir:0},
    {kode:'3110001', nama:'Modal Disetor', kategori:'C', tipe:'K', jenis:'Detail', saldoAwal:2000000000, debet:0, kredit:0, saldoAkhir:2000000000},
    /* Akun BARU 2026-08-26 (lanjutan lagi) — dipakai sisi Kredit
       jurnal Revaluasi Asset saat Nominal positif (nilai aset
       naik), lihat DATA.jurnalFixedAsset kode:18 & revaluasi-asset.js. */
    {kode:'3110002', nama:'Selisih Revaluasi Aktiva Tetap', kategori:'C', tipe:'K', jenis:'Detail', saldoAwal:0, debet:0, kredit:0, saldoAkhir:0},
    {kode:'3200001', nama:'Laba Ditahan', kategori:'K', tipe:'K', jenis:'Detail', saldoAwal:850000000, debet:0, kredit:120000000, saldoAkhir:970000000},
    {kode:'3400001', nama:'Laba Berjalan', kategori:'M', tipe:'K', jenis:'Detail', saldoAwal:0, debet:0, kredit:450000000, saldoAkhir:450000000},
    {kode:'4100000', nama:'PENJUALAN', kategori:'D', tipe:'K', jenis:'Header', saldoAwal:0, debet:0, kredit:0, saldoAkhir:0},
    {kode:'4110001', nama:'Penjualan Barang Dagang', kategori:'D', tipe:'K', jenis:'Detail', saldoAwal:0, debet:0, kredit:17400000000, saldoAkhir:17400000000},
    {kode:'4110002', nama:'Retur Penjualan', kategori:'D', tipe:'D', jenis:'Detail', saldoAwal:0, debet:320000000, kredit:0, saldoAkhir:320000000},
    {kode:'4110003', nama:'Discount Penjualan', kategori:'D', tipe:'D', jenis:'Detail', saldoAwal:0, debet:180000000, kredit:0, saldoAkhir:180000000},
    {kode:'5100000', nama:'HARGA POKOK PENJUALAN', kategori:'E', tipe:'D', jenis:'Header', saldoAwal:0, debet:0, kredit:0, saldoAkhir:0},
    {kode:'5110001', nama:'HPP Barang Dagang', kategori:'E', tipe:'D', jenis:'Detail', saldoAwal:0, debet:16310000000, kredit:0, saldoAkhir:16310000000},
    {kode:'5200000', nama:'BIAYA OPERASI', kategori:'F', tipe:'D', jenis:'Header', saldoAwal:0, debet:0, kredit:0, saldoAkhir:0},
    {kode:'5210001', nama:'Biaya Gaji & Tunjangan', kategori:'F', tipe:'D', jenis:'Detail', saldoAwal:0, debet:420000000, kredit:0, saldoAkhir:420000000},
    {kode:'5210002', nama:'Biaya Transportasi & Logistik', kategori:'F', tipe:'D', jenis:'Detail', saldoAwal:0, debet:165000000, kredit:0, saldoAkhir:165000000},
    {kode:'5210003', nama:'Biaya Sewa Gudang', kategori:'F', tipe:'D', jenis:'Detail', saldoAwal:0, debet:96000000, kredit:0, saldoAkhir:96000000},
    {kode:'5210004', nama:'Biaya Listrik & Air', kategori:'F', tipe:'D', jenis:'Detail', saldoAwal:0, debet:28000000, kredit:0, saldoAkhir:28000000},
    {kode:'5210005', nama:'Biaya ATK & Cetak', kategori:'F', tipe:'D', jenis:'Detail', saldoAwal:0, debet:9500000, kredit:0, saldoAkhir:9500000},
    {kode:'6000000', nama:'PENDAPATAN DILUAR USAHA', kategori:'G', tipe:'K', jenis:'Header', saldoAwal:0, debet:0, kredit:0, saldoAkhir:0},
    {kode:'6010001', nama:'Pendapatan Bunga Bank', kategori:'G', tipe:'K', jenis:'Detail', saldoAwal:0, debet:0, kredit:8500000, saldoAkhir:8500000},
    {kode:'6010002', nama:'Laba Selisih Kurs', kategori:'G', tipe:'K', jenis:'Detail', saldoAwal:0, debet:0, kredit:4200000, saldoAkhir:4200000},
    {kode:'6500000', nama:'BIAYA DILUAR USAHA', kategori:'H', tipe:'D', jenis:'Header', saldoAwal:0, debet:0, kredit:0, saldoAkhir:0},
    {kode:'6510001', nama:'Biaya Administrasi Bank', kategori:'H', tipe:'D', jenis:'Detail', saldoAwal:0, debet:3200000, kredit:0, saldoAkhir:3200000},
    {kode:'6510002', nama:'Rugi Selisih Kurs', kategori:'H', tipe:'D', jenis:'Detail', saldoAwal:0, debet:2100000, kredit:0, saldoAkhir:2100000},
    {kode:'2110002', nama:'Hutang Pembelian Belum Terfaktur', kategori:'B', tipe:'K', jenis:'Detail', saldoAwal:0, debet:0, kredit:0, saldoAkhir:0},
    {kode:'1140002', nama:'PPN Masukan', kategori:'A', tipe:'D', jenis:'Detail', saldoAwal:0, debet:0, kredit:0, saldoAkhir:0},
    {kode:'6510003', nama:'Selisih Pembulatan / Pembayaran', kategori:'H', tipe:'D', jenis:'Detail', saldoAwal:0, debet:0, kredit:0, saldoAkhir:0},
    /* Akun BARU 2026-08-26 (lanjutan lagi) — dipakai sisi Debit
       jurnal Disposal Asset (Nilai Buku Bersih aset yg dihapus-
       bukukan) & sisi Kredit jurnal Revaluasi Asset saat Nominal
       negatif (nilai aset turun), lihat DATA.jurnalFixedAsset
       kode:9 & kode:18, disposal-asset.js & revaluasi-asset.js. */
    {kode:'6510004', nama:'Kerugian Pelepasan Aktiva Tetap', kategori:'H', tipe:'D', jenis:'Detail', saldoAwal:0, debet:0, kredit:0, saldoAkhir:0},
    {kode:'5110002', nama:'HPP Konsinyasi', kategori:'E', tipe:'D', jenis:'Detail', saldoAwal:0, debet:0, kredit:0, saldoAkhir:0},
    {kode:'2110003', nama:'Hutang R/K Cabang', kategori:'B', tipe:'K', jenis:'Detail', saldoAwal:0, debet:0, kredit:0, saldoAkhir:0},
    {kode:'1120002', nama:'Piutang R/K Cabang', kategori:'A', tipe:'D', jenis:'Detail', saldoAwal:0, debet:0, kredit:0, saldoAkhir:0},
    {kode:'1130002', nama:'Persediaan Barang Intransit', kategori:'A', tipe:'D', jenis:'Detail', saldoAwal:0, debet:0, kredit:0, saldoAkhir:0},
    {kode:'2120002', nama:'PPN Keluaran', kategori:'B', tipe:'K', jenis:'Detail', saldoAwal:0, debet:0, kredit:0, saldoAkhir:0},
    {kode:'4110004', nama:'Sales Item Discount (Principal)', kategori:'D', tipe:'D', jenis:'Detail', saldoAwal:0, debet:0, kredit:0, saldoAkhir:0},
    {kode:'4110005', nama:'Sales Item Discount (Distributor)', kategori:'D', tipe:'D', jenis:'Detail', saldoAwal:0, debet:0, kredit:0, saldoAkhir:0},
    /* 4 akun baru — fitur PPN/PPH ditanggung customer di Penerimaan
       Piutang (2026-08-20), lihat catatan besar di js/pages/
       penerimaan-piutang.template.js. */
    {kode:'1120003', nama:'Piutang SSP PPN', kategori:'A', tipe:'D', jenis:'Detail', saldoAwal:0, debet:0, kredit:0, saldoAkhir:0},
    {kode:'1120004', nama:'Piutang SSP PPH', kategori:'A', tipe:'D', jenis:'Detail', saldoAwal:0, debet:0, kredit:0, saldoAkhir:0},
    {kode:'2120003', nama:'PPN Pemungut', kategori:'B', tipe:'K', jenis:'Detail', saldoAwal:0, debet:0, kredit:0, saldoAkhir:0},
    {kode:'1140003', nama:'Uang Muka PPH 22', kategori:'A', tipe:'D', jenis:'Detail', saldoAwal:0, debet:0, kredit:0, saldoAkhir:0},
    /* 4 akun BARU 2026-08-28 — dipakai 2 modul master Kas/Bank baru
       "Jurnal Pelunasan Utang/Piutang" (DATA.jurnalKasUtangPiutang) &
       "Currency" (DATA.currencies): Bank BNI/BRI melengkapi Mandiri/BCA
       yang sudah ada (akun kas jurnal utk baris Bank BNI SBY & Bank BRI
       MDN di DATA.kasBank), 2 akun Giro Mundur utk field Akun Utang/
       Piutang Giro Mundur di form Jurnal Kas (screenshot MASERP acuan
       memakai akun giro mundur terpisah dari akun utang/piutang usaha).
       Precedent penambahan akun: 3110002 (Revaluasi, 2026-08-26). */
    {kode:'1100013', nama:'Bank BNI', kategori:'A', tipe:'D', jenis:'Detail', saldoAwal:0, debet:0, kredit:0, saldoAkhir:0},
    {kode:'1100014', nama:'Bank BRI', kategori:'A', tipe:'D', jenis:'Detail', saldoAwal:0, debet:0, kredit:0, saldoAkhir:0},
    {kode:'1120005', nama:'Piutang Usaha - Giro Mundur', kategori:'A', tipe:'D', jenis:'Detail', saldoAwal:0, debet:0, kredit:0, saldoAkhir:0},
    {kode:'2110004', nama:'Hutang Usaha Giro Mundur', kategori:'B', tipe:'K', jenis:'Detail', saldoAwal:0, debet:0, kredit:0, saldoAkhir:0},
    /* 12 akun baru (6 pasang Biaya Susut/Akum. Susut) — menu Aktiva
       Tetap (2026-08-26), lihat catatan besar di atas DATA.aktivaTetap
       & js/pages/fixed-asset.template.js. Screenshot MASERP contoh
       form "Master Fixed Asset" menampilkan kode akun "601603"/"120703"
       (skema instalasi lain, 6-digit) — dipetakan ke akun 7-digit DBM
       baru di sini, satu pasang per kelompok golongan aktiva (Kendaraan
       Bermotor/Peralatan Kantor/Peralatan IT/Mesin & Peralatan/Bangunan/
       Software), reuse header AKTIVA TETAP (1500000, kontra-akun akum.
       susut) & BIAYA OPERASI (5200000, akun biaya susut) yang sudah ada. */
    {kode:'5210006', nama:'Biaya Peny. Kendaraan Bermotor', kategori:'F', tipe:'D', jenis:'Detail', saldoAwal:0, debet:0, kredit:0, saldoAkhir:0},
    {kode:'5210007', nama:'Biaya Peny. Peralatan Kantor', kategori:'F', tipe:'D', jenis:'Detail', saldoAwal:0, debet:0, kredit:0, saldoAkhir:0},
    {kode:'5210008', nama:'Biaya Peny. Peralatan IT', kategori:'F', tipe:'D', jenis:'Detail', saldoAwal:0, debet:0, kredit:0, saldoAkhir:0},
    {kode:'5210009', nama:'Biaya Peny. Mesin & Peralatan', kategori:'F', tipe:'D', jenis:'Detail', saldoAwal:0, debet:0, kredit:0, saldoAkhir:0},
    {kode:'5210010', nama:'Biaya Peny. Bangunan', kategori:'F', tipe:'D', jenis:'Detail', saldoAwal:0, debet:0, kredit:0, saldoAkhir:0},
    {kode:'5210011', nama:'Biaya Peny. Software', kategori:'F', tipe:'D', jenis:'Detail', saldoAwal:0, debet:0, kredit:0, saldoAkhir:0},
    {kode:'1590002', nama:'Akum. Peny. Kendaraan Bermotor', kategori:'A', tipe:'K', jenis:'Detail', saldoAwal:0, debet:0, kredit:0, saldoAkhir:0},
    {kode:'1590003', nama:'Akum. Peny. Peralatan Kantor', kategori:'A', tipe:'K', jenis:'Detail', saldoAwal:0, debet:0, kredit:0, saldoAkhir:0},
    {kode:'1590004', nama:'Akum. Peny. Peralatan IT', kategori:'A', tipe:'K', jenis:'Detail', saldoAwal:0, debet:0, kredit:0, saldoAkhir:0},
    {kode:'1590005', nama:'Akum. Peny. Mesin & Peralatan', kategori:'A', tipe:'K', jenis:'Detail', saldoAwal:0, debet:0, kredit:0, saldoAkhir:0},
    {kode:'1590006', nama:'Akum. Peny. Bangunan', kategori:'A', tipe:'K', jenis:'Detail', saldoAwal:0, debet:0, kredit:0, saldoAkhir:0},
    {kode:'1590007', nama:'Akum. Peny. Software', kategori:'A', tipe:'K', jenis:'Detail', saldoAwal:0, debet:0, kredit:0, saldoAkhir:0},
  ],
  jurnalPembelian:[
    {kode:1, nama:'JURNAL PEMBELIAN KREDIT (IDR)', tipeJurnal:'Kredit', mataUang:'', cabang:'Head Office', konsinyasi:false, nonAktif:false,
      akunUtang:'2110001', akunKreditSementara:'2110002', akunBudgetDiskon:'', akunPPN:'1140002', akunOngkosKirim:'', akunLabaSelisihKurs:'6010002', akunRugiSelisihKurs:'6510002', akunSelisihDebitKredit:'6510003', akunUangMuka:'1140001',
      akunReturUtang:'2110001', akunReturPajak:'1140002',
      akunHppKonsinyasi:'', akunBiayaPemakaian:'', akunDiskonPrincipal:'', akunHutangRK:'', akunPiutangRK:'', akunHutangBelumDifaktur:'',
      akunARSSPPPN:'1120003', akunARSSPPPH:'1120004', akunPPNPemungut:'2120003', akunUangMukaPPH22:'1140003'},
    {kode:2, nama:'JURNAL PEMBELIAN KONSINYASI (SEMARANG)(IDR)', tipeJurnal:'Kredit', mataUang:'', cabang:'Semarang', konsinyasi:true, nonAktif:false,
      akunUtang:'2110001', akunKreditSementara:'', akunBudgetDiskon:'', akunPPN:'1140002', akunOngkosKirim:'', akunLabaSelisihKurs:'6010002', akunRugiSelisihKurs:'6510002', akunSelisihDebitKredit:'6510003', akunUangMuka:'1140001',
      akunReturUtang:'2110001', akunReturPajak:'1140002',
      akunHppKonsinyasi:'5110002', akunBiayaPemakaian:'', akunDiskonPrincipal:'', akunHutangRK:'2110003', akunPiutangRK:'1120002', akunHutangBelumDifaktur:'',
      akunARSSPPPN:'1120003', akunARSSPPPH:'1120004', akunPPNPemungut:'2120003', akunUangMukaPPH22:'1140003'},
    {kode:3, nama:'JURNAL PEMBELIAN KONSINYASI (TANGERANG)(IDR)', tipeJurnal:'Kredit', mataUang:'', cabang:'Tangerang', konsinyasi:true, nonAktif:false,
      akunUtang:'2110001', akunKreditSementara:'', akunBudgetDiskon:'', akunPPN:'1140002', akunOngkosKirim:'', akunLabaSelisihKurs:'6010002', akunRugiSelisihKurs:'6510002', akunSelisihDebitKredit:'6510003', akunUangMuka:'1140001',
      akunReturUtang:'2110001', akunReturPajak:'1140002',
      akunHppKonsinyasi:'5110002', akunBiayaPemakaian:'', akunDiskonPrincipal:'', akunHutangRK:'2110003', akunPiutangRK:'1120002', akunHutangBelumDifaktur:'',
      akunARSSPPPN:'1120003', akunARSSPPPH:'1120004', akunPPNPemungut:'2120003', akunUangMukaPPH22:'1140003'},
    {kode:4, nama:'JURNAL PEMBELIAN KONSINYASI (SIDOARJO)(IDR)', tipeJurnal:'Kredit', mataUang:'', cabang:'Sidoarjo', konsinyasi:true, nonAktif:false,
      akunUtang:'2110001', akunKreditSementara:'', akunBudgetDiskon:'', akunPPN:'1140002', akunOngkosKirim:'', akunLabaSelisihKurs:'6010002', akunRugiSelisihKurs:'6510002', akunSelisihDebitKredit:'6510003', akunUangMuka:'1140001',
      akunReturUtang:'2110001', akunReturPajak:'1140002',
      akunHppKonsinyasi:'5110002', akunBiayaPemakaian:'', akunDiskonPrincipal:'', akunHutangRK:'2110003', akunPiutangRK:'1120002', akunHutangBelumDifaktur:'',
      akunARSSPPPN:'1120003', akunARSSPPPH:'1120004', akunPPNPemungut:'2120003', akunUangMukaPPH22:'1140003'},
    {kode:5, nama:'JURNAL PEMBELIAN CBD (IDR)', tipeJurnal:'Kas', mataUang:'IDR', cabang:'Head Office', konsinyasi:false, nonAktif:false,
      akunUtang:'2110001', akunKreditSementara:'', akunBudgetDiskon:'', akunPPN:'1140002', akunOngkosKirim:'', akunLabaSelisihKurs:'6010002', akunRugiSelisihKurs:'6510002', akunSelisihDebitKredit:'6510003', akunUangMuka:'1140001',
      akunReturUtang:'2110001', akunReturPajak:'1140002',
      akunHppKonsinyasi:'', akunBiayaPemakaian:'', akunDiskonPrincipal:'', akunHutangRK:'', akunPiutangRK:'', akunHutangBelumDifaktur:'',
      akunARSSPPPN:'1120003', akunARSSPPPH:'1120004', akunPPNPemungut:'2120003', akunUangMukaPPH22:'1140003'},
    {kode:6, nama:'JURNAL PEMBELIAN KONSINYASI (BANDUNG)(IDR)', tipeJurnal:'Kredit', mataUang:'', cabang:'Bandung', konsinyasi:true, nonAktif:false,
      akunUtang:'2110001', akunKreditSementara:'', akunBudgetDiskon:'', akunPPN:'1140002', akunOngkosKirim:'', akunLabaSelisihKurs:'6010002', akunRugiSelisihKurs:'6510002', akunSelisihDebitKredit:'6510003', akunUangMuka:'1140001',
      akunReturUtang:'2110001', akunReturPajak:'1140002',
      akunHppKonsinyasi:'5110002', akunBiayaPemakaian:'', akunDiskonPrincipal:'', akunHutangRK:'2110003', akunPiutangRK:'1120002', akunHutangBelumDifaktur:'',
      akunARSSPPPN:'1120003', akunARSSPPPH:'1120004', akunPPNPemungut:'2120003', akunUangMukaPPH22:'1140003'},
    {kode:7, nama:'JURNAL PEMBELIAN COD (IDR)', tipeJurnal:'Kas', mataUang:'', cabang:'Head Office', konsinyasi:false, nonAktif:false,
      akunUtang:'2110001', akunKreditSementara:'', akunBudgetDiskon:'', akunPPN:'1140002', akunOngkosKirim:'', akunLabaSelisihKurs:'6010002', akunRugiSelisihKurs:'6510002', akunSelisihDebitKredit:'6510003', akunUangMuka:'1140001',
      akunReturUtang:'2110001', akunReturPajak:'1140002',
      akunHppKonsinyasi:'', akunBiayaPemakaian:'', akunDiskonPrincipal:'', akunHutangRK:'', akunPiutangRK:'', akunHutangBelumDifaktur:'',
      akunARSSPPPN:'1120003', akunARSSPPPH:'1120004', akunPPNPemungut:'2120003', akunUangMukaPPH22:'1140003'},
  ],
  /* Jurnal Penjualan — menu Customer & Penjualan > Master & Setting >
     Jurnal Penjualan (lihat js/pages/jurnal-penjualan.*). 1 baris sample
     identik screenshot MASERP yang dikirim user ("JURNAL PENJUALAN
     KREDIT (IDR)", Total Record: 1). Kode akun MASERP asli di screenshot
     (110501, 420102-01/02, 110902, 210701, 720011, 720010, 210301 — skema
     6-digit demo lain) TIDAK dipakai apa adanya, dipetakan ke akun
     DBM 7-digit yang sudah ada di DATA.akunGL (ditambah 4 akun baru:
     1130002 Persediaan Barang Intransit, 2120002 PPN Keluaran, 4110004
     Sales Item Discount (Principal), 4110005 Sales Item Discount
     (Distributor)) — pola penyesuaian sama seperti Jurnal Pembelian. */
  jurnalPenjualan:[
    {kode:1, nama:'JURNAL PENJUALAN KREDIT (IDR)', tipeJurnal:'Kredit', mataUang:'', active:true,
      akunPiutang:'1120001', akunDiskonPrincipal:'4110004', akunPersediaanIntransit:'1130002', akunDiskonDistributor:'4110005', akunDiskonSelisihHna:'4110004', akunDiskonVoucher:'', akunPPN:'2120002', akunOngkosKirim:'', akunLabaSelisihKurs:'6010002', akunRugiSelisihKurs:'6510002', akunSelisihDebitKredit:'6510003', akunUangMuka:'2140001', reward:'',
      akunReturKredit:'1120001', akunReturPajak:'2120002',
      akunARSSPPPN:'1120003', akunARSSPPPH:'1120004', akunPPNPemungut:'2120003', akunUangMukaPPH22:'1140003'},
  ],
  /* Stock Request — menu Persediaan Barang > Daftar Transaksi > Stock
     Request (lihat js/pages/stock-request.*). Setiap baris "items"
     adalah rincian barang yang diminta transfer dari Gudang Sumber ke
     Gudang Target, dikelompokkan per Kategori Barang (field `kategori`
     mengacu ke DATA.items). NB: 2 baris contoh PALING ATAS di bawah
     meniru screenshot MASERP "Daftar Stock Request" & "Stock Request"
     persis pada field No. Request/No. PO/Tgl/User/Status, tapi kode &
     nama barang serta nama Supplier diganti ke data milik DBM sendiri
     (BRG-xxx, supplier dari DATA.suppliers) karena screenshot berasal
     dari demo perusahaan farmasi lain (kode barang 01-30003 dst,
     supplier "PT SATORIA ANEKA INDUSTRI" tidak ada di master DBM) —
     pola yang sama seperti penyesuaian kode akun GL di Jurnal Pembelian.

     Field `transferOutDibuat` (2026-08-24, fitur Notifikasi Stock
     Request Baru) ditambahkan ke SEMUA baris — lihat komentar besar di
     core.js bagian NOTIFIKASI untuk alasan field ini independen dari
     `status`. 2 baris BARU (Bandung & Head Office) ditambahkan supaya
     ada 3 baris `transferOutDibuat:false` sekaligus (sama seperti
     baris TGR yang sudah ada) — meniru badge notifikasi "3" pada
     screenshot MASERP yang dikirim user, TANPA baris ini terhubung ke
     PO manapun (noPO:'', usedInPO:false — merepresentasikan Stock
     Request yang baru dibuat & belum ditindaklanjuti sama sekali,
     beda dari 2 baris lama yang sudah ada PO-nya sejak awal). */
  stockRequest:[
    {no:'26/SR/SMG/08/00001', noPO:'26/PO/HO/08/00003', tglRequest:'06/08/2026', userEntry:'khalimatus_apja', reorderingSheet:'', tipeTransaksi:'Transfer Out', keterangan:'', status:'CLOSED', closedManually:false, transferOutDibuat:true,
      cabangRequest:'Semarang', supplier:'', gudangSumber:'(00-GUU) Gudang Utama-HO', gudangTarget:'(05-GSM) Gudang Semarang', edBulan:0, usedInPO:true,
      items:[
        {kode:'BRG-007', nama:'Susu Kental Manis Indomilk 380gr', kategori:'Minuman', qtyReordering:800, pilih:true, qty:800, um:'Dus'},
        {kode:'BRG-008', nama:'Teh Celup Sariwangi 25s', kategori:'Minuman', qtyReordering:600, pilih:true, qty:600, um:'Dus'},
      ],
      tglInput:'06/08/2026 09:12:30', userInput:'khalimatus_apja', tglEdit:'', userEdit:''},
    {no:'26/SR/TGR/08/00001', noPO:'26/PO/HO/08/00002', tglRequest:'03/08/2026', userEntry:'sarah_scc', reorderingSheet:'26/ROS/TGR/08/00001', tipeTransaksi:'Transfer Out', keterangan:'PO PT. DAN', status:'OPEN', closedManually:false, transferOutDibuat:false,
      cabangRequest:'Tangerang', supplier:'PT Sumber Pangan Nusantara', gudangSumber:'(00-GUU) Gudang Utama-HO', gudangTarget:'(00-GUU) Gudang Utama-HO', edBulan:0, usedInPO:true,
      items:[
        {kode:'BRG-001', nama:'Minyak Goreng Sunco 2L', kategori:'Sembako', qtyReordering:6000, pilih:true, qty:6000, um:'Dus'},
        {kode:'BRG-002', nama:'Gula Pasir Gulaku 1kg', kategori:'Sembako', qtyReordering:3000, pilih:true, qty:3000, um:'Karung'},
        {kode:'BRG-003', nama:'Beras Premium Rojolele 5kg', kategori:'Sembako', qtyReordering:2000, pilih:true, qty:2000, um:'Karung'},
      ],
      tglInput:'03/08/2026 13:00:56', userInput:'sarah_scc', tglEdit:'07/08/2026 10:42:41', userEdit:'sidik'},
    {no:'26/SR/BDG/08/00001', noPO:'', tglRequest:'10/08/2026', userEntry:'budi_bdg', reorderingSheet:'', tipeTransaksi:'Transfer Out', keterangan:'Restock kebutuhan akhir bulan', status:'OPEN', closedManually:false, transferOutDibuat:false,
      cabangRequest:'Bandung', supplier:'', gudangSumber:'(00-GUU) Gudang Utama-HO', gudangTarget:'(02-GBD) Gudang Bandung', edBulan:0, usedInPO:false,
      items:[
        {kode:'BRG-009', nama:'Kopi Kapal Api 165gr', kategori:'Minuman', qtyReordering:400, pilih:true, qty:400, um:'Dus'},
        {kode:'BRG-005', nama:'Mie Instan Indomie Goreng', kategori:'Makanan', qtyReordering:900, pilih:true, qty:900, um:'Dus'},
      ],
      tglInput:'10/08/2026 08:45:12', userInput:'budi_bdg', tglEdit:'', userEdit:''},
    {no:'26/SR/HO/08/00001', noPO:'', tglRequest:'12/08/2026', userEntry:'rina_ho', reorderingSheet:'', tipeTransaksi:'Transfer Out', keterangan:'Kebutuhan stok Gudang Utama', status:'OPEN', closedManually:false, transferOutDibuat:false,
      cabangRequest:'Head Office', supplier:'', gudangSumber:'(00-GUU) Gudang Utama-HO', gudangTarget:'(00-GUU) Gudang Utama-HO', edBulan:0, usedInPO:false,
      items:[
        {kode:'BRG-006', nama:'Kecap Manis ABC 600ml', kategori:'Bumbu', qtyReordering:250, pilih:true, qty:250, um:'Dus'},
      ],
      tglInput:'12/08/2026 14:20:05', userInput:'rina_ho', tglEdit:'', userEdit:''},
  ],
  /* Reordering Sheet — menu Persediaan Barang > Daftar Transaksi >
     Reordering Sheet (lihat js/pages/reordering-sheet.*). Sebelumnya
     placeholder. 8 baris (1 per cabang) sesuai precedent downsize-volume
     (screenshot asli "Total Record: 447" — terlalu besar untuk mockup).
     On Hand/Qty. BoPo/Available tiap barang di `items[]` REAL, disalin
     persis dari DATA.persediaan (cabang+kodeBarang yang sama) supaya
     konsisten kalau dicek silang ke modul Persediaan. History Sales 6
     bulan/Sales Agt/Outstanding DR/Qty BoSo/Qty Picking List/Alpha/
     Faktorial ILUSTRATIF (tidak ada modul sumber di mockup ini — lihat
     komentar di reordering-sheet.template.js). Baris HO/BDG/MDN/MKS/SMG/
     SDA "belum dianalisa" (Max Stock/Forecast/Reorder masih 0, konsisten
     kondisi screenshot asli). Baris SBY sudah dianalisa & SENGAJA
     menyisakan 1 barang (BRG-002) dengan Forecast menyimpang >25% dari
     Average untuk mendemokan rule highlight merah. Baris TGR SUDAH
     dianalisa penuh & terhubung ke Stock Request SUNGGUHAN yang sudah
     ada sejak awal (`DATA.stockRequest` no 26/SR/TGR/08/00001, field
     `reorderingSheet` di sana sudah menunjuk ke '26/ROS/TGR/08/00001'
     sejak modul Stock Request dibangun) — field `stockRequest` di baris
     ini mengunci Ubah/Hapus (lihat tplRosRows), item & qty-nya (BRG-001
     6000/BRG-002 3000/BRG-003 2000) PERSIS sama dengan qtyReordering di
     Stock Request tersebut. */
  reorderingSheet:[
    {no:'26/ROS/HO/08/00001', tipe:'Reordering Sheet Reguler', tglRos:'01/08/2026', periode:'Agustus 2026', cabang:'Head Office', metode:'XP',
      keterangan:'', filterPrincipal:'', filterPusatBisnis:'', filterKategoriNama:'Minuman', filterPersediaanNama:'',
      items:[
        {kode:'BRG-007', nama:'Susu Kental Manis Indomilk 380gr', hist:[0,0,0,0,0,0], alpha:0, faktorial:0, average:0, forecast:0, keteranganItem:'', salesAgt:0, onHand:192, qtyBoPo:0, outstandingDR:0, qtyBoSo:0, qtyPickingList:0, available:192, maxStock:0, shouldReorder:0, qtyKelipatanOrder:0, konversiKarton:1, reorder:0, pareto:''},
        {kode:'BRG-008', nama:'Teh Celup Sariwangi 25s', hist:[0,0,0,0,0,0], alpha:0, faktorial:0, average:0, forecast:0, keteranganItem:'', salesAgt:0, onHand:216, qtyBoPo:0, outstandingDR:0, qtyBoSo:0, qtyPickingList:0, available:216, maxStock:0, shouldReorder:0, qtyKelipatanOrder:0, konversiKarton:1, reorder:0, pareto:''},
        {kode:'BRG-009', nama:'Kopi Kapal Api 165gr', hist:[0,0,0,0,0,0], alpha:0, faktorial:0, average:0, forecast:0, keteranganItem:'', salesAgt:0, onHand:114, qtyBoPo:0, outstandingDR:0, qtyBoSo:0, qtyPickingList:0, available:114, maxStock:0, shouldReorder:0, qtyKelipatanOrder:0, konversiKarton:1, reorder:0, pareto:''},
      ], tglInput:'01/08/2026 08:15:20', userEntry:'sidik', stockRequest:''},
    {no:'26/ROS/SBY/08/00001', tipe:'Reordering Sheet Reguler', tglRos:'02/08/2026', periode:'Agustus 2026', cabang:'Surabaya', metode:'FIFO',
      keterangan:'Analisa rutin bulanan', filterPrincipal:'PT Sumber Pangan Nusantara', filterPusatBisnis:'Consumer Food', filterKategoriNama:'Sembako', filterPersediaanNama:'',
      items:[
        {kode:'BRG-001', nama:'Minyak Goreng Sunco 2L', hist:[1100,1180,1250,1090,1200,1230], alpha:1, faktorial:1, average:1175, forecast:1150, keteranganItem:'', salesAgt:640, onHand:186, qtyBoPo:0, outstandingDR:40, qtyBoSo:60, qtyPickingList:20, available:186, maxStock:1800, shouldReorder:1614, qtyKelipatanOrder:50, konversiKarton:1, reorder:1600, pareto:'A'},
        {kode:'BRG-002', nama:'Gula Pasir Gulaku 1kg', hist:[520,560,610,590,540,575], alpha:1, faktorial:1, average:566, forecast:900, keteranganItem:'Cek ulang asumsi forecast', salesAgt:300, onHand:129, qtyBoPo:0, outstandingDR:15, qtyBoSo:25, qtyPickingList:10, available:129, maxStock:900, shouldReorder:771, qtyKelipatanOrder:25, konversiKarton:1, reorder:750, pareto:'B'},
        {kode:'BRG-003', nama:'Beras Premium Rojolele 5kg', hist:[210,225,240,230,205,220], alpha:1, faktorial:1, average:222, forecast:230, keteranganItem:'', salesAgt:120, onHand:62, qtyBoPo:0, outstandingDR:8, qtyBoSo:10, qtyPickingList:5, available:62, maxStock:450, shouldReorder:388, qtyKelipatanOrder:25, konversiKarton:1, reorder:375, pareto:'B'},
      ], tglInput:'02/08/2026 09:40:12', userEntry:'sidik', stockRequest:''},
    {no:'26/ROS/BDG/08/00001', tipe:'Reordering Sheet Reguler', tglRos:'02/08/2026', periode:'Agustus 2026', cabang:'Bandung', metode:'Manual',
      keterangan:'', filterPrincipal:'', filterPusatBisnis:'', filterKategoriNama:'Bahan Baku', filterPersediaanNama:'',
      items:[
        {kode:'BRG-004', nama:'Tepung Terigu Segitiga Biru 1kg', hist:[0,0,0,0,0,0], alpha:0, faktorial:0, average:0, forecast:0, keteranganItem:'', salesAgt:0, onHand:99, qtyBoPo:0, outstandingDR:0, qtyBoSo:0, qtyPickingList:0, available:99, maxStock:0, shouldReorder:0, qtyKelipatanOrder:0, konversiKarton:1, reorder:0, pareto:''},
      ], tglInput:'02/08/2026 10:05:44', userEntry:'sidik', stockRequest:''},
    {no:'26/ROS/TGR/08/00001', tipe:'Reordering Sheet Reguler', tglRos:'01/08/2026', periode:'Agustus 2026', cabang:'Tangerang', metode:'XP',
      keterangan:'Untuk PO PT. Sumber Pangan Nusantara', filterPrincipal:'PT Sumber Pangan Nusantara', filterPusatBisnis:'Consumer Food', filterKategoriNama:'Sembako', filterPersediaanNama:'',
      items:[
        {kode:'BRG-001', nama:'Minyak Goreng Sunco 2L', hist:[5800,6100,6400,6250,5950,6200], alpha:1, faktorial:1, average:6117, forecast:6200, keteranganItem:'', salesAgt:3200, onHand:186, qtyBoPo:0, outstandingDR:180, qtyBoSo:220, qtyPickingList:90, available:186, maxStock:6300, shouldReorder:6114, qtyKelipatanOrder:100, konversiKarton:1, reorder:6000, pareto:'A'},
        {kode:'BRG-002', nama:'Gula Pasir Gulaku 1kg', hist:[2850,2960,3120,3050,2900,3010], alpha:1, faktorial:1, average:2982, forecast:3000, keteranganItem:'', salesAgt:1450, onHand:129, qtyBoPo:0, outstandingDR:90, qtyBoSo:110, qtyPickingList:40, available:129, maxStock:3100, shouldReorder:2971, qtyKelipatanOrder:50, konversiKarton:1, reorder:3000, pareto:'A'},
        {kode:'BRG-003', nama:'Beras Premium Rojolele 5kg', hist:[1900,1980,2050,2020,1940,1995], alpha:1, faktorial:1, average:1981, forecast:2000, keteranganItem:'', salesAgt:980, onHand:62, qtyBoPo:0, outstandingDR:55, qtyBoSo:60, qtyPickingList:25, available:62, maxStock:2050, shouldReorder:1988, qtyKelipatanOrder:50, konversiKarton:1, reorder:2000, pareto:'A'},
      ], tglInput:'01/08/2026 08:50:05', userEntry:'sarah_scc', stockRequest:'26/SR/TGR/08/00001'},
    {no:'26/ROS/MDN/08/00001', tipe:'Reordering Sheet Konsinyasi', tglRos:'04/08/2026', periode:'Agustus 2026', cabang:'Medan', metode:'XP',
      keterangan:'', filterPrincipal:'', filterPusatBisnis:'', filterKategoriNama:'Makanan', filterPersediaanNama:'',
      items:[
        {kode:'BRG-005', nama:'Mie Instan Indomie Goreng', hist:[0,0,0,0,0,0], alpha:0, faktorial:0, average:0, forecast:0, keteranganItem:'', salesAgt:0, onHand:177, qtyBoPo:0, outstandingDR:0, qtyBoSo:0, qtyPickingList:0, available:177, maxStock:0, shouldReorder:0, qtyKelipatanOrder:0, konversiKarton:1, reorder:0, pareto:''},
      ], tglInput:'04/08/2026 11:20:33', userEntry:'sidik', stockRequest:''},
    {no:'26/ROS/MKS/08/00001', tipe:'Reordering Sheet Reguler', tglRos:'05/08/2026', periode:'Agustus 2026', cabang:'Makassar', metode:'Manual',
      keterangan:'', filterPrincipal:'', filterPusatBisnis:'', filterKategoriNama:'Bumbu', filterPersediaanNama:'',
      items:[
        {kode:'BRG-006', nama:'Kecap Manis ABC 600ml', hist:[0,0,0,0,0,0], alpha:0, faktorial:0, average:0, forecast:0, keteranganItem:'', salesAgt:0, onHand:37, qtyBoPo:0, outstandingDR:0, qtyBoSo:0, qtyPickingList:0, available:37, maxStock:0, shouldReorder:0, qtyKelipatanOrder:0, konversiKarton:1, reorder:0, pareto:''},
      ], tglInput:'05/08/2026 09:05:10', userEntry:'sidik', stockRequest:''},
    {no:'26/ROS/SMG/08/00001', tipe:'Reordering Sheet Reguler', tglRos:'06/08/2026', periode:'Agustus 2026', cabang:'Semarang', metode:'FIFO',
      keterangan:'', filterPrincipal:'', filterPusatBisnis:'', filterKategoriNama:'Minuman', filterPersediaanNama:'',
      items:[
        {kode:'BRG-007', nama:'Susu Kental Manis Indomilk 380gr', hist:[0,0,0,0,0,0], alpha:0, faktorial:0, average:0, forecast:0, keteranganItem:'', salesAgt:0, onHand:51, qtyBoPo:0, outstandingDR:0, qtyBoSo:0, qtyPickingList:0, available:51, maxStock:0, shouldReorder:0, qtyKelipatanOrder:0, konversiKarton:1, reorder:0, pareto:''},
        {kode:'BRG-008', nama:'Teh Celup Sariwangi 25s', hist:[0,0,0,0,0,0], alpha:0, faktorial:0, average:0, forecast:0, keteranganItem:'', salesAgt:0, onHand:58, qtyBoPo:0, outstandingDR:0, qtyBoSo:0, qtyPickingList:0, available:58, maxStock:0, shouldReorder:0, qtyKelipatanOrder:0, konversiKarton:1, reorder:0, pareto:''},
        {kode:'BRG-009', nama:'Kopi Kapal Api 165gr', hist:[0,0,0,0,0,0], alpha:0, faktorial:0, average:0, forecast:0, keteranganItem:'', salesAgt:0, onHand:30, qtyBoPo:0, outstandingDR:0, qtyBoSo:0, qtyPickingList:0, available:30, maxStock:0, shouldReorder:0, qtyKelipatanOrder:0, konversiKarton:1, reorder:0, pareto:''},
      ], tglInput:'06/08/2026 08:30:00', userEntry:'khalimatus_apja', stockRequest:''},
    {no:'26/ROS/SDA/08/00001', tipe:'Reordering Sheet Reguler', tglRos:'07/08/2026', periode:'Agustus 2026', cabang:'Sidoarjo', metode:'XP',
      keterangan:'', filterPrincipal:'', filterPusatBisnis:'', filterKategoriNama:'Toiletries', filterPersediaanNama:'',
      items:[
        {kode:'BRG-010', nama:'Sabun Mandi Lifebuoy 90gr', hist:[0,0,0,0,0,0], alpha:0, faktorial:0, average:0, forecast:0, keteranganItem:'', salesAgt:0, onHand:69, qtyBoPo:0, outstandingDR:0, qtyBoSo:0, qtyPickingList:0, available:69, maxStock:0, shouldReorder:0, qtyKelipatanOrder:0, konversiKarton:1, reorder:0, pareto:''},
      ], tglInput:'07/08/2026 09:00:00', userEntry:'sidik', stockRequest:''},
  ],
  /* Transaksi Persediaan — menu Persediaan Barang > Daftar Transaksi >
     Transaksi Persediaan (lihat js/pages/transaksi-persediaan.*).
     Sebelumnya placeholder. 16 baris (downsize dari "Total Record: 56"
     di screenshot asli, mengikuti precedent downsize-volume Master
     Rayon/Price List By Province/Report Center) mencakup SEMUA 6 Tipe
     Transaksi: 4 pasang Transfer Out/In (8 baris) + 2 Transfer Stock +
     2 Transfer Produk Bonus + 2 Pengeluaran + 2 Pemasukkan.

     Pasangan pertama (26/OUT-HO/08/00001 <-> 26/IN-SMG/08/00001)
     SENGAJA di-chain ke Stock Request `26/SR/SMG/08/00001` yang
     SUDAH ADA (baris itu satu-satunya di DATA.stockRequest dengan
     transferOutDibuat:true — lihat fitur Notifikasi topbar, 2026-08-24)
     dan diberi `locked:true` — mensimulasikan bahwa transfer ini SUDAH
     diproses lanjut jadi BPB/Terima Barang di cabang Semarang, sehingga
     tidak boleh diubah lagi (banner "TUTUP..."). 3 pasang Out/In
     lainnya (Bandung/Medan/Makassar) adalah alokasi ad-hoc antar
     cabang, TIDAK terhubung ke Stock Request manapun (field
     `stockRequest` kosong), tidak locked.

     Nomor transaksi 4 baris (26/TPB-HO/08/00001, 26/TSS-HO/08/00011 →
     disederhanakan jadi 26/TSS-HO/08/00001 karena dataset di sini
     tidak punya 10 transaksi TSS sebelumnya seperti demo asli,
     26/WRO-HO/08/00003, 26/PMA-HO/08/00001) mengikuti PERSIS format
     & prefix dari 4 screenshot form acuan (TPB=Transfer Produk Bonus,
     TSS=Transfer Stock, WRO=Pengeluaran/"Warehouse Removal Out",
     PMA=Pemasukkan). "Delivery Request Cabang" & "No.SJ Supplier"
     SENGAJA selalu kosong di semua baris (field dekoratif, konsisten
     dengan tampilan placeholder abu-abu di semua screenshot acuan,
     tidak ada modul Delivery Request Konsinyasi sungguhan di mockup
     ini). Gudang Sumber/Target memakai kode `DATA.gudang` SUNGGUHAN
     (00-GUU s.d. 07-GUU). */
  transaksiPersediaan:[
    {no:'26/OUT-HO/08/00001', noReferensi:'26/BPB/SMG/08/00012', stockRequest:'26/SR/SMG/08/00001', deliveryRequestCabang:'', noSjSupplier:'',
      cabang:'Head Office', tglTrn:'06/08/2026', tglTrnSort:20260806, tipeTransaksi:'Transfer Out', statusPengeluaran:'', gudangSumber:'(00-GUU) Gudang Utama-HO',
      gudangTarget:'(06-GUU) Gudang Utama-SMG', retur:false, jurnal:'', keterangan:'Pemenuhan Stock Request Semarang', userInput:'sidik', locked:true, approved:true, cetakanKe:0,
      items:[
        {noRequest:'26/SR/SMG/08/00001', itemRequest:'Susu Kental Manis Indomilk 380gr', kode:'BRG-007', nama:'Susu Kental Manis Indomilk 380gr', ket:'', kodeTarget:'', namaTarget:'', qty:800, um:'Dus', harga:0, jumlah:0, batches:[{batch:'BTH0806A', qty:800, exp:'01/02/2027'}]},
        {noRequest:'26/SR/SMG/08/00001', itemRequest:'Teh Celup Sariwangi 25s', kode:'BRG-008', nama:'Teh Celup Sariwangi 25s', ket:'', kodeTarget:'', namaTarget:'', qty:600, um:'Dus', harga:0, jumlah:0, batches:[{batch:'BTH0806B', qty:600, exp:'15/03/2027'}]},
      ]},
    {no:'26/IN-SMG/08/00001', noReferensi:'26/OUT-HO/08/00001', stockRequest:'26/SR/SMG/08/00001', deliveryRequestCabang:'', noSjSupplier:'',
      cabang:'Semarang', tglTrn:'07/08/2026', tglTrnSort:20260807, tipeTransaksi:'Transfer In', statusPengeluaran:'', gudangSumber:'(00-GUU) Gudang Utama-HO',
      gudangTarget:'(06-GUU) Gudang Utama-SMG', retur:false, jurnal:'', keterangan:'Terima dari HO — Stock Request Semarang', userInput:'khalimatus_apja', locked:true, approved:true, cetakanKe:0,
      items:[
        {noRequest:'26/SR/SMG/08/00001', itemRequest:'Susu Kental Manis Indomilk 380gr', kode:'BRG-007', nama:'Susu Kental Manis Indomilk 380gr', ket:'', kodeTarget:'', namaTarget:'', qty:800, um:'Dus', harga:0, jumlah:0, batches:[{batch:'BTH0806A', qty:800, exp:'01/02/2027'}]},
        {noRequest:'26/SR/SMG/08/00001', itemRequest:'Teh Celup Sariwangi 25s', kode:'BRG-008', nama:'Teh Celup Sariwangi 25s', ket:'', kodeTarget:'', namaTarget:'', qty:600, um:'Dus', harga:0, jumlah:0, batches:[{batch:'BTH0806B', qty:600, exp:'15/03/2027'}]},
      ]},
    {no:'26/OUT-HO/08/00002', noReferensi:'26/BPB/HO/08/00023', stockRequest:'', deliveryRequestCabang:'', noSjSupplier:'',
      cabang:'Head Office', tglTrn:'10/08/2026', tglTrnSort:20260810, tipeTransaksi:'Transfer Out', statusPengeluaran:'', gudangSumber:'(00-GUU) Gudang Utama-HO',
      gudangTarget:'(02-GUU) Gudang Utama-BDG', retur:false, jurnal:'', keterangan:'Alokasi stok akhir bulan — Bandung', userInput:'sidik', locked:false, approved:true, cetakanKe:0,
      items:[
        {noRequest:'', itemRequest:'', kode:'BRG-001', nama:'Minyak Goreng Sunco 2L', ket:'', kodeTarget:'', namaTarget:'', qty:300, um:'Dus', harga:0, jumlah:0, batches:[]},
        {noRequest:'', itemRequest:'', kode:'BRG-003', nama:'Beras Premium Rojolele 5kg', ket:'', kodeTarget:'', namaTarget:'', qty:150, um:'Karung', harga:0, jumlah:0, batches:[]},
      ]},
    {no:'26/IN-BDG/08/00001', noReferensi:'26/OUT-HO/08/00002', stockRequest:'', deliveryRequestCabang:'', noSjSupplier:'',
      cabang:'Bandung', tglTrn:'11/08/2026', tglTrnSort:20260811, tipeTransaksi:'Transfer In', statusPengeluaran:'', gudangSumber:'(00-GUU) Gudang Utama-HO',
      gudangTarget:'(02-GUU) Gudang Utama-BDG', retur:false, jurnal:'', keterangan:'Terima alokasi stok dari HO', userInput:'budi_bdg', locked:false, approved:true, cetakanKe:0,
      items:[
        {noRequest:'', itemRequest:'', kode:'BRG-001', nama:'Minyak Goreng Sunco 2L', ket:'', kodeTarget:'', namaTarget:'', qty:300, um:'Dus', harga:0, jumlah:0, batches:[]},
        {noRequest:'', itemRequest:'', kode:'BRG-003', nama:'Beras Premium Rojolele 5kg', ket:'', kodeTarget:'', namaTarget:'', qty:150, um:'Karung', harga:0, jumlah:0, batches:[]},
      ]},
    {no:'26/OUT-HO/08/00003', noReferensi:'26/BPB/HO/08/00028', stockRequest:'', deliveryRequestCabang:'', noSjSupplier:'',
      cabang:'Head Office', tglTrn:'12/08/2026', tglTrnSort:20260812, tipeTransaksi:'Transfer Out', statusPengeluaran:'', gudangSumber:'(00-GUU) Gudang Utama-HO',
      gudangTarget:'(04-GUU) Gudang Utama-MDN', retur:false, jurnal:'', keterangan:'Restock Medan', userInput:'sidik', locked:false, approved:true, cetakanKe:0,
      items:[
        {noRequest:'', itemRequest:'', kode:'BRG-005', nama:'Mie Instan Indomie Goreng', ket:'', kodeTarget:'', namaTarget:'', qty:400, um:'Dus', harga:0, jumlah:0, batches:[]},
      ]},
    {no:'26/IN-MDN/08/00001', noReferensi:'26/OUT-HO/08/00003', stockRequest:'', deliveryRequestCabang:'', noSjSupplier:'',
      cabang:'Medan', tglTrn:'13/08/2026', tglTrnSort:20260813, tipeTransaksi:'Transfer In', statusPengeluaran:'', gudangSumber:'(00-GUU) Gudang Utama-HO',
      gudangTarget:'(04-GUU) Gudang Utama-MDN', retur:false, jurnal:'', keterangan:'Terima restock dari HO', userInput:'sidik', locked:false, approved:true, cetakanKe:0,
      items:[
        {noRequest:'', itemRequest:'', kode:'BRG-005', nama:'Mie Instan Indomie Goreng', ket:'', kodeTarget:'', namaTarget:'', qty:400, um:'Dus', harga:0, jumlah:0, batches:[]},
      ]},
    {no:'26/OUT-HO/08/00004', noReferensi:'26/BPB/HO/08/00029', stockRequest:'', deliveryRequestCabang:'', noSjSupplier:'',
      cabang:'Head Office', tglTrn:'14/08/2026', tglTrnSort:20260814, tipeTransaksi:'Transfer Out', statusPengeluaran:'', gudangSumber:'(00-GUU) Gudang Utama-HO',
      gudangTarget:'(05-GUU) Gudang Utama-MKS', retur:false, jurnal:'', keterangan:'forecast marketing pak setiawan', userInput:'sidik', locked:false, approved:true, cetakanKe:0,
      items:[
        {noRequest:'', itemRequest:'', kode:'BRG-009', nama:'Kopi Kapal Api 165gr', ket:'', kodeTarget:'', namaTarget:'', qty:250, um:'Dus', harga:0, jumlah:0, batches:[]},
        {noRequest:'', itemRequest:'', kode:'BRG-010', nama:'Sabun Mandi Lifebuoy 90gr', ket:'', kodeTarget:'', namaTarget:'', qty:200, um:'Dus', harga:0, jumlah:0, batches:[]},
      ]},
    {no:'26/IN-MKS/08/00001', noReferensi:'26/OUT-HO/08/00004', stockRequest:'', deliveryRequestCabang:'', noSjSupplier:'',
      cabang:'Makassar', tglTrn:'15/08/2026', tglTrnSort:20260815, tipeTransaksi:'Transfer In', statusPengeluaran:'', gudangSumber:'(00-GUU) Gudang Utama-HO',
      gudangTarget:'(05-GUU) Gudang Utama-MKS', retur:false, jurnal:'', keterangan:'Terima alokasi marketing', userInput:'sidik', locked:false, approved:true, cetakanKe:0,
      items:[
        {noRequest:'', itemRequest:'', kode:'BRG-009', nama:'Kopi Kapal Api 165gr', ket:'', kodeTarget:'', namaTarget:'', qty:250, um:'Dus', harga:0, jumlah:0, batches:[]},
        {noRequest:'', itemRequest:'', kode:'BRG-010', nama:'Sabun Mandi Lifebuoy 90gr', ket:'', kodeTarget:'', namaTarget:'', qty:200, um:'Dus', harga:0, jumlah:0, batches:[]},
      ]},
    {no:'26/TSS-HO/08/00001', noReferensi:'', stockRequest:'', deliveryRequestCabang:'', noSjSupplier:'',
      cabang:'Head Office', tglTrn:'16/08/2026', tglTrnSort:20260816, tipeTransaksi:'Transfer Stock', statusPengeluaran:'', gudangSumber:'(00-GUU) Gudang Utama-HO',
      gudangTarget:'(01-GUU) Gudang Utama-SBY', retur:false, jurnal:'', keterangan:'Penyeimbangan stok Surabaya', userInput:'sidik', locked:false, approved:true, cetakanKe:0,
      items:[
        {noRequest:'', itemRequest:'', kode:'BRG-002', nama:'Gula Pasir Gulaku 1kg', ket:'', kodeTarget:'', namaTarget:'', qty:120, um:'Karung', harga:0, jumlah:0, batches:[]},
      ]},
    {no:'26/TSS-HO/08/00002', noReferensi:'', stockRequest:'', deliveryRequestCabang:'', noSjSupplier:'',
      cabang:'Head Office', tglTrn:'17/08/2026', tglTrnSort:20260817, tipeTransaksi:'Transfer Stock', statusPengeluaran:'', gudangSumber:'(00-GUU) Gudang Utama-HO',
      gudangTarget:'(07-GUU) Gudang Utama-SDA', retur:false, jurnal:'', keterangan:'Penyeimbangan stok Sidoarjo', userInput:'sidik', locked:false, approved:true, cetakanKe:0,
      items:[
        {noRequest:'', itemRequest:'', kode:'BRG-006', nama:'Kecap Manis ABC 600ml', ket:'', kodeTarget:'', namaTarget:'', qty:80, um:'Dus', harga:0, jumlah:0, batches:[]},
      ]},
    {no:'26/TPB-HO/08/00001', noReferensi:'', stockRequest:'', deliveryRequestCabang:'', noSjSupplier:'',
      cabang:'Head Office', tglTrn:'18/08/2026', tglTrnSort:20260818, tipeTransaksi:'Transfer Produk Bonus', statusPengeluaran:'', gudangSumber:'(00-GUU) Gudang Utama-HO',
      gudangTarget:'(00-GUU) Gudang Utama-HO', retur:false, jurnal:'', keterangan:'Bonus pembelian — Mie Indomie ke Kopi Kapal Api', userInput:'sidik', locked:false, approved:true, cetakanKe:0,
      items:[
        {noRequest:'', itemRequest:'', kode:'BRG-005', nama:'Mie Instan Indomie Goreng', ket:'Bonus principal', kodeTarget:'BRG-009', namaTarget:'Kopi Kapal Api 165gr', qty:50, um:'Dus', harga:0, jumlah:0, batches:[]},
      ]},
    {no:'26/TPB-HO/08/00002', noReferensi:'', stockRequest:'', deliveryRequestCabang:'', noSjSupplier:'',
      cabang:'Head Office', tglTrn:'19/08/2026', tglTrnSort:20260819, tipeTransaksi:'Transfer Produk Bonus', statusPengeluaran:'', gudangSumber:'(00-GUU) Gudang Utama-HO',
      gudangTarget:'(00-GUU) Gudang Utama-HO', retur:false, jurnal:'', keterangan:'Bonus pembelian — Gula Pasir ke Teh Celup', userInput:'sidik', locked:false, approved:true, cetakanKe:0,
      items:[
        {noRequest:'', itemRequest:'', kode:'BRG-002', nama:'Gula Pasir Gulaku 1kg', ket:'Bonus principal', kodeTarget:'BRG-008', namaTarget:'Teh Celup Sariwangi 25s', qty:30, um:'Karung', harga:0, jumlah:0, batches:[]},
      ]},
    {no:'26/WRO-HO/08/00001', noReferensi:'', stockRequest:'', deliveryRequestCabang:'', noSjSupplier:'',
      cabang:'Head Office', tglTrn:'20/08/2026', tglTrnSort:20260820, tipeTransaksi:'Pengeluaran', statusPengeluaran:'Barang Rusak / Reject', gudangSumber:'(00-GUU) Gudang Utama-HO',
      gudangTarget:'', retur:false, jurnal:'JURNAL PENGELUARAN (HO)', keterangan:'Kemasan rusak saat bongkar muat', userInput:'sidik', locked:false, approved:true, cetakanKe:0,
      items:[
        {noRequest:'', itemRequest:'', kode:'BRG-004', nama:'Tepung Terigu Segitiga Biru 1kg', ket:'', kodeTarget:'', namaTarget:'', qty:20, um:'Karung', harga:0, jumlah:0, batches:[]},
      ]},
    {no:'26/WRO-HO/08/00003', noReferensi:'', stockRequest:'', deliveryRequestCabang:'', noSjSupplier:'',
      cabang:'Head Office', tglTrn:'24/08/2026', tglTrnSort:20260824, tipeTransaksi:'Pengeluaran', statusPengeluaran:'Kadaluarsa (ED)', gudangSumber:'(00-GUU) Gudang Utama-HO',
      gudangTarget:'', retur:false, jurnal:'JURNAL PENGELUARAN (HO)', keterangan:'Stok mendekati tanggal kadaluarsa', userInput:'sidik', locked:false, approved:true, cetakanKe:0,
      items:[
        {noRequest:'', itemRequest:'', kode:'BRG-007', nama:'Susu Kental Manis Indomilk 380gr', ket:'', kodeTarget:'', namaTarget:'', qty:15, um:'Dus', harga:0, jumlah:0, batches:[]},
      ]},
    {no:'26/PMA-HO/08/00001', noReferensi:'', stockRequest:'', deliveryRequestCabang:'', noSjSupplier:'',
      cabang:'Head Office', tglTrn:'21/08/2026', tglTrnSort:20260821, tipeTransaksi:'Pemasukkan', statusPengeluaran:'', gudangSumber:'(00-GUU) Gudang Utama-HO',
      gudangTarget:'', retur:false, jurnal:'JURNAL PEMASUKAN (HO)', keterangan:'Penyesuaian stok hasil Stock Opname', userInput:'sidik', locked:false, approved:true, cetakanKe:0,
      items:[
        {noRequest:'', itemRequest:'', kode:'BRG-002', nama:'Gula Pasir Gulaku 1kg', ket:'', kodeTarget:'', namaTarget:'', qty:500, um:'Karung', harga:15000, jumlah:7500000, batches:[]},
      ]},
    {no:'26/PMA-HO/08/00002', noReferensi:'', stockRequest:'', deliveryRequestCabang:'', noSjSupplier:'',
      cabang:'Head Office', tglTrn:'22/08/2026', tglTrnSort:20260822, tipeTransaksi:'Pemasukkan', statusPengeluaran:'', gudangSumber:'(00-GUU) Gudang Utama-HO',
      gudangTarget:'', retur:false, jurnal:'JURNAL PEMASUKAN (HO)', keterangan:'Penyesuaian stok hasil Stock Opname', userInput:'sidik', locked:false, approved:true, cetakanKe:0,
      items:[
        {noRequest:'', itemRequest:'', kode:'BRG-010', nama:'Sabun Mandi Lifebuoy 90gr', ket:'', kodeTarget:'', namaTarget:'', qty:300, um:'Dus', harga:5000, jumlah:1500000, batches:[]},
      ]},
  ],

  /* Master Stock Opname — menu Persediaan Barang > Daftar Transaksi >
     Master Stock Opname (lihat js/pages/master-stock-opname.*), dibangun
     2026-08-27 sesuai screenshot MASERP "Master Stock Opname List" +
     "Master Stock Opname" (form) yang dikirim user. 1 baris sample,
     PERSIS meniru header dokumen di screenshot (No. Bukti "26/MSO/
     SMG/08/00001", Cabang Semarang, Tgl. Transaksi "08/08/2026
     12:03:40", Periode 08/08/2026 - 08/08/2026) — hanya kata "SDL"
     pada Keterangan diganti "DBM" (nama singkat perusahaan demo lain
     -> DBM). `items[]` HANYA 10 baris (seluruh katalog `DATA.items`
     mockup ini, bukan 125 seperti "Total: 125" di screenshot asli —
     downsize-volume, precedent sama seperti modul2 lain), difilter ke
     gudang "06-GUU" (Gudang Utama-SMG) — `sistem` tiap baris = PERSIS
     `qtyPhysical` baris `DATA.persediaan` gudang+barang yang sama (1
     sumber kebenaran, bukan angka baru, precedent sama seperti
     `lokasiGudang[].stock` di DATA.items). `hna` = `DATA.items[].harga`
     (harga jual, sama seperti field HNA di modul lain mis. Reordering
     Sheet/Dominasi). 8 dari 10 baris `qtyCounted` SAMA dengan `sistem`
     (Selisih 0, persis kondisi semua baris yang terlihat di screenshot
     halaman 1) — 2 baris SENGAJA dibuat beda (BRG-002 Gula Pasir
     qtyCounted 65 vs sistem 69 = selisih -4 "susut", BRG-009 Kopi
     Kapal Api qtyCounted 32 vs sistem 30 = selisih +2 "lebih") sekadar
     mendemokan kalkulasi Selisih/Total reaktif & pewarnaan
     merah/teal-nya, tidak mengubah kesan "screenshot semua nol" krn
     baris itu ADA di halaman berikutnya pada data 125-baris asli,
     bukan halaman 1 yang terlihat di screenshot. `batch`/`exp` semua
     baris "-" (mockup ini tidak memodelkan data batch/expiry per lot
     di level DATA.persediaan, lihat catatan lengkap di header
     master-stock-opname.template.js). CATATAN: `DATA.transaksiPersediaan`
     (array persis di atas) SUDAH punya 1 baris 'Pemasukkan' Head
     Office/BRG-010 berketerangan "Penyesuaian stok hasil Stock
     Opname" sejak sebelum modul ini dibangun — itu adalah ADJUSTMENT
     JURNAL yang TIDAK ditautkan ke baris Master Stock Opname manapun
     di sini (beda cabang & dibuat sesi lain sebelum modul source-nya
     ada) — dicatat di sini demi transparansi, bukan bug, dan bisa
     ditautkan sungguhan ke depan kalau diperlukan. */
  masterStockOpname:[
    {no:'26/MSO/SMG/08/00001', cabang:'Semarang', tglTransaksi:'08/08/2026 12:03:40', periodeAwal:'08/08/2026', periodeAkhir:'08/08/2026',
      keterangan:'STOK OPNAME DBM SEMARANG PERIODE AGUSTUS 2026', filterGudangKode:'06-GUU', filterGudangNama:'Gudang Utama-SMG',
      filterItemKode:'', filterItemNama:'', userEntry:'sidik',
      items:[
        {kodeGudang:'06-GUU', kode:'BRG-001', nama:'Minyak Goreng Sunco 2L', batch:'-', exp:'-', ketArea:'', sistem:99, qtyCounted:99, hna:25000, verified:false},
        {kodeGudang:'06-GUU', kode:'BRG-002', nama:'Gula Pasir Gulaku 1kg', batch:'-', exp:'-', ketArea:'', sistem:69, qtyCounted:65, hna:15000, verified:true},
        {kodeGudang:'06-GUU', kode:'BRG-003', nama:'Beras Premium Rojolele 5kg', batch:'-', exp:'-', ketArea:'', sistem:33, qtyCounted:33, hna:60000, verified:false},
        {kodeGudang:'06-GUU', kode:'BRG-004', nama:'Tepung Terigu Segitiga Biru 1kg', batch:'-', exp:'-', ketArea:'', sistem:79, qtyCounted:79, hna:12000, verified:false},
        {kodeGudang:'06-GUU', kode:'BRG-005', nama:'Mie Instan Indomie Goreng', batch:'-', exp:'-', ketArea:'', sistem:177, qtyCounted:177, hna:2500, verified:false},
        {kodeGudang:'06-GUU', kode:'BRG-006', nama:'Kecap Manis ABC 600ml', batch:'-', exp:'-', ketArea:'', sistem:42, qtyCounted:42, hna:14000, verified:false},
        {kodeGudang:'06-GUU', kode:'BRG-007', nama:'Susu Kental Manis Indomilk 380gr', batch:'-', exp:'-', ketArea:'', sistem:51, qtyCounted:51, hna:16000, verified:false},
        {kodeGudang:'06-GUU', kode:'BRG-008', nama:'Teh Celup Sariwangi 25s', batch:'-', exp:'-', ketArea:'', sistem:58, qtyCounted:58, hna:10000, verified:false},
        {kodeGudang:'06-GUU', kode:'BRG-009', nama:'Kopi Kapal Api 165gr', batch:'-', exp:'-', ketArea:'', sistem:30, qtyCounted:32, hna:14000, verified:true},
        {kodeGudang:'06-GUU', kode:'BRG-010', nama:'Sabun Mandi Lifebuoy 90gr', batch:'-', exp:'-', ketArea:'', sistem:79, qtyCounted:79, hna:5000, verified:false},
      ]},
  ],

  /* Stock Opname (Persediaan Barang > Daftar Transaksi > Stock
     Opname, page:'stockOpname') — DIBANGUN 2026-08-27, lanjutan dari
     Master Stock Opname di atas. 1 baris sample yang merujuk MSO
     '26/MSO/SMG/08/00001' di atas (masterStockOpnameNo), memecah 10
     barangnya jadi rincian per-batch (Batch Number/Qty Batch/Tgl.
     Expired — field yang di Master Stock Opname SENGAJA "-", di sini
     JUSTRU diisi krn itu fungsi utama modul ini). Qty Batch tiap
     baris SENGAJA disamakan manual dgn Qty Counted barang yg sama
     persis di MSO '26/MSO/SMG/08/00001' (BUKAN dihitung otomatis —
     modul ini TIDAK cross-mutate balik ke DATA.masterStockOpname,
     lihat catatan desain lengkap di header stock-opname.template.js).
     Format Batch Number "BT-YYMMDD-NN" mengikuti pola field noBatch
     yang sudah ada di DATA.salesOrder[].items. */
  stockOpname:[
    {no:'26/OPN-SMG/08/00001', cabang:'Semarang', tglTransaksi:'08/08/2026 12:15:22',
      masterStockOpnameNo:'26/MSO/SMG/08/00001', gudangKode:'06-GUU', gudangNama:'Gudang Utama-SMG',
      keterangan:'STOK OPNAME DBM SEMARANG PERIODE AGUSTUS 2026', userEntry:'sidik',
      items:[
        {kode:'BRG-001', nama:'Minyak Goreng Sunco 2L', batch:'BT-260801-01', qtyBatch:99, exp:'30/06/2027'},
        {kode:'BRG-002', nama:'Gula Pasir Gulaku 1kg', batch:'BT-260801-02', qtyBatch:65, exp:'15/05/2027'},
        {kode:'BRG-003', nama:'Beras Premium Rojolele 5kg', batch:'BT-260801-03', qtyBatch:33, exp:'28/02/2027'},
        {kode:'BRG-004', nama:'Tepung Terigu Segitiga Biru 1kg', batch:'BT-260801-04', qtyBatch:79, exp:'10/03/2027'},
        {kode:'BRG-005', nama:'Mie Instan Indomie Goreng', batch:'BT-260801-05', qtyBatch:177, exp:'01/12/2026'},
        {kode:'BRG-006', nama:'Kecap Manis ABC 600ml', batch:'BT-260801-06', qtyBatch:42, exp:'20/01/2027'},
        {kode:'BRG-007', nama:'Susu Kental Manis Indomilk 380gr', batch:'BT-260801-07', qtyBatch:51, exp:'05/11/2026'},
        {kode:'BRG-008', nama:'Teh Celup Sariwangi 25s', batch:'BT-260801-08', qtyBatch:58, exp:'18/09/2027'},
        {kode:'BRG-009', nama:'Kopi Kapal Api 165gr', batch:'BT-260801-09', qtyBatch:32, exp:'22/07/2027'},
        {kode:'BRG-010', nama:'Sabun Mandi Lifebuoy 90gr', batch:'BT-260801-10', qtyBatch:79, exp:'14/08/2028'},
      ]},
  ],

  /* =========================================================
     2026-08-28 — DATA utk modul BARU "Opname Faktur, Retur & S.J."
     (Customer & Penjualan > Daftar Transaksi, page:'opnameDokumen' —
     sesuai dokumen "Spesifikasi Aplikasi Web Opname Faktur, Retur &
     Surat Jalan" yang dikirim user; lihat catatan desain lengkap di
     header js/pages/opname-dokumen.template.js).

     1) collectorList & inkasoList: opsi Basis Filter metode opname
        "Random / By Filter" (spec: per Salesman / per Collector / per
        Inkaso). Belum ada master Collector/Inkaso di mockup ini, jadi
        dibuat daftar nama sederhana; penugasan collector/inkaso per
        customer dihitung deterministik di opdCollectorOf()/
        opdInkasoOf() (opname-dokumen.js) — simplifikasi terdokumentasi.
     2) returPenjualanDocs: dokumen Retur Penjualan OUTSTANDING —
        modul Retur Penjualan sendiri masih placeholder, tapi opname
        (cakupan "Retur") & Form Konfirmasi Outlet butuh dokumennya.
        4 baris di-chain deskriptif ke Invoice yang sudah ada
        (dariInvoice), nilai kecil yang wajar utk retur parsial.
     3) opnameDokumen: transaksi opname tersimpan. 1 baris sample
        SELESAI (metode Menyeluruh, cakupan Faktur+Retur+S.J., petugas
        Internal Audit) — items adalah SNAPSHOT hasil "Generate Daftar
        Dokumen" dari data live (nomor/nilai persis DATA.invoices/
        returPenjualanDocs/noSJ) + status hasil input petugas: 8
        Ditemukan / Sesuai, 2 Blank (Belum Diketemukan), 1 Selisih —
        supaya ketiga laporan (Rincian per Status/Summary By Salesman
        By Status/Rekapitulasi) langsung berisi contoh bermakna. */
  collectorList:['Rudi Salam','Yanto Prakoso','Sri Handayani'],
  inkasoList:['Tim Inkaso HO','Tim Inkaso Jawa Timur','Tim Inkaso Jabar'],
  returPenjualanDocs:[
    {no:'26/RJ/HO/08/00001', tgl:'18/08/2026', cabang:'Head Office', customerKode:'CUST-001', customerNama:'Toko Sumber Rejeki', dariInvoice:'26/SI/HO/08/00001', nilai:150000, alasan:'Barang rusak dalam pengiriman', status:'Outstanding'},
    {no:'26/RJ/SBY/08/00001', tgl:'20/08/2026', cabang:'Surabaya', customerKode:'CUST-002', customerNama:'UD Makmur Jaya', dariInvoice:'26/SI/SBY/08/00001', nilai:90000, alasan:'Kemasan penyok', status:'Outstanding'},
    {no:'26/RJ/BDG/08/00001', tgl:'21/08/2026', cabang:'Bandung', customerKode:'CUST-003', customerNama:'CV Berkah Abadi', dariInvoice:'26/SI/BDG/07/00009', nilai:120000, alasan:'Barang mendekati tanggal kadaluarsa', status:'Outstanding'},
    {no:'26/RJ/TGR/08/00001', tgl:'24/08/2026', cabang:'Tangerang', customerKode:'CUST-006', customerNama:'Toko Family Mart Jaya', dariInvoice:'26/SI/TGR/08/00001', nilai:85000, alasan:'Salah kirim varian', status:'Outstanding'},
  ],
  opnameDokumen:[
    {no:'26/OPD/HO/08/00001', tgl:'27/08/2026', cabang:'Semua Cabang',
      tipePetugas:'Internal Audit', petugas:'Maulana Sidik',
      metode:'Menyeluruh', filterBasis:'', filterNilai:'',
      cakupan:{faktur:true, retur:true, suratJalan:true},
      keterangan:'Opname menyeluruh dokumen Faktur, Retur & Surat Jalan periode Agustus 2026.',
      status:'Selesai', userEntry:'sidik', tglInput:'27/08/2026 09:15:00',
      items:[
        {jenis:'Faktur', no:'26/SI/HO/08/00001', tgl:'07/08/2026', customerNama:'Toko Sumber Rejeki', salesman:'Budi Santoso', nilai:1120000, statusOpname:'Ditemukan / Sesuai', ket:''},
        {jenis:'Faktur', no:'26/SI/TGR/08/00001', tgl:'11/08/2026', customerNama:'Toko Family Mart Jaya', salesman:'Budi Santoso', nilai:1700000, statusOpname:'Ditemukan / Sesuai', ket:''},
        {jenis:'Faktur', no:'26/SI/SBY/08/00001', tgl:'08/08/2026', customerNama:'UD Makmur Jaya', salesman:'Andi Wijaya', nilai:880000, statusOpname:'Ditemukan / Sesuai', ket:''},
        {jenis:'Faktur', no:'26/SI/MDN/08/00001', tgl:'06/08/2026', customerNama:'Toko Anugrah', salesman:'Dedi Kurniawan', nilai:600000, statusOpname:'Blank (Belum Diketemukan)', ket:'Fisik faktur tidak ada di odner MDN'},
        {jenis:'Faktur', no:'26/SI/MKS/08/00001', tgl:'07/08/2026', customerNama:'UD Sinar Harapan', salesman:'Eka Putri', nilai:250000, statusOpname:'Ditemukan / Sesuai', ket:''},
        {jenis:'Faktur', no:'26/SI/SMG/08/00001', tgl:'05/08/2026', customerNama:'CV Maju Terus', salesman:'Fajar Nugroho', nilai:400000, statusOpname:'Ditemukan / Sesuai', ket:''},
        {jenis:'Retur', no:'26/RJ/HO/08/00001', tgl:'18/08/2026', customerNama:'Toko Sumber Rejeki', salesman:'Budi Santoso', nilai:150000, statusOpname:'Ditemukan / Sesuai', ket:''},
        {jenis:'Retur', no:'26/RJ/SBY/08/00001', tgl:'20/08/2026', customerNama:'UD Makmur Jaya', salesman:'Andi Wijaya', nilai:90000, statusOpname:'Selisih / Tidak Sesuai', ket:'Nilai fisik retur tidak cocok dengan sistem'},
        {jenis:'Retur', no:'26/RJ/BDG/08/00001', tgl:'21/08/2026', customerNama:'CV Berkah Abadi', salesman:'Citra Lestari', nilai:120000, statusOpname:'Ditemukan / Sesuai', ket:''},
        {jenis:'Surat Jalan', no:'26/SJ/HO/08/00002', tgl:'11/08/2026', customerNama:'Toko Family Mart Jaya', salesman:'Budi Santoso', nilai:350000, statusOpname:'Ditemukan / Sesuai', ket:''},
        {jenis:'Surat Jalan', no:'26/SJ/SMG/08/00001', tgl:'05/08/2026', customerNama:'CV Maju Terus', salesman:'Fajar Nugroho', nilai:400000, statusOpname:'Blank (Belum Diketemukan)', ket:'SJ belum kembali dari pengiriman'},
      ]},
  ],
  /* Purchase Order — menu Supplier & Pembelian > Daftar Transaksi >
     Purchase Order (lihat js/pages/purchase-order.*). 11 baris data
     sample meniru struktur & alur screenshot MASERP "Daftar Purchase
     Order" + form "Purchase Order" yang dikirim user, TAPI kode
     barang/nama Supplier/keterangan DIGANTI ke milik DBM sendiri
     (barang dari DATA.items, supplier dari DATA.suppliers) — screenshot
     asli dari demo perusahaan farmasi lain (kode 01-30004, supplier
     "PT SATORIA ANEKA INDUSTRI", dst), pola penyesuaian yang sama
     seperti Jurnal Pembelian & Stock Request sebelumnya. Angka
     Jumlah Akhir/DPP/PPN/PPh juga dihitung ulang dari nol memakai
     harga & qty milik DBM sendiri (rumus: Disc/Barang = Harga Beli x
     Qty x Total Disc%; Jumlah baris = Harga Beli x Qty − Disc/Barang;
     PPN 11% = Jumlah baris x 11% [mode PPN Eksklusif]; PPh = Jumlah
     baris x %PPh; Jumlah Akhir = Jumlah baris + PPN − PPh + Ongkos
     Angkut) — BUKAN dicontek apa adanya dari angka di screenshot asli
     (yang skalanya tidak konsisten dengan skema harga barang DBM).

     2026-08-28 — field BARU `tutupPoStatus` ('Pending'/'In Progress'/
     'Close') ditambahkan ke SETIAP baris utk modul baru "Tutup Pending
     PO" (Supplier & Pembelian > Daftar Transaksi, sebelumnya
     placeholder — lihat js/pages/tutup-pending-po.*). Field ini
     SENGAJA terpisah dari `status` ('Pending Receive') yang sudah
     dipakai kolom Status list Purchase Order, supaya tampilan modul
     PO lama tidak berubah. Seeding-nya meniru campuran status di
     screenshot acuan: 1 baris Close (26/PO/HO/08/00002 — PO CBD
     "Diambil Sendiri" yang wajar sudah selesai/ditutup), 2 baris
     In Progress (00009 & 00007_RI — PO cetakanKe>1/revisi yang wajar
     sedang berjalan), sisanya Pending. Tombol Tutup/Buka Order di
     modul baru itu mengubah field ini LIVE (Close <-> status semula). */
  purchaseOrder:[
    {no:'26/PO/HO/08/00011', noPR:'', tglPO:'06/08/2026', supplier:'PT Sumber Pangan Nusantara', keterangan:'26/SR/HO/08/00003 - Sembako Gudang Utama', status:'Pending Receive', tutupPoStatus:'Pending', cetakanKe:1,
      cabang:'Head Office', cabangTarget:'Head Office', typePO:'Persediaan', noStockRequest:'26/SR/HO/08/00003', fob:'', shipVia:'Ekspedisi', cito:false,
      noOtomatis:'PO001', etd:'07/08/2026', noSoIndent:'', syaratBayar:'Kredit 60 Hari', gudang:'Gudang Utama-HO', gudangTarget:'Gudang Utama-HO',
      jurnalBPB:'JURNAL PEMBELIAN KREDIT (IDR)', alamatPengiriman:'Jl. Raya Industri No. 10, Kawasan Pergudangan Cakung, Jakarta Timur',
      items:[{kode:'BRG-001', nama:'Minyak Goreng Sunco 2L', qty:200, um:'Dus', hargaBeli:25000, feeDistribusi:5, budgetDiskon:0, totalDisc:5, discBarang:250000, jumlah:4750000, pph:true}],
      ppnMode:'eksklusif', mataUang:'IDR', kurs:1, diskon1:0, diskon1Amount:0, diskon2:0, diskon2Amount:0, dpp:4750000, pajak11:'PPN11', ppnAmount:522500,
      pphAktif:true, pphKode:'PPH 22 (0.3)', pphPersen:0.3, pphAmount:14250, ongkosAngkut:0, jumlahTotal:5258250,
      tglInput:'06/08/2026 08:20:10', userInput:'sidik', tglEdit:'', userEdit:''},
    {no:'26/PO/HO/08/00010', noPR:'', tglPO:'06/08/2026', supplier:'PT Wilmar Nabati Indonesia', keterangan:'26/SR/BDG/08/00001 - Stok Jabar', status:'Pending Receive', tutupPoStatus:'Pending', cetakanKe:1,
      cabang:'Head Office', cabangTarget:'Head Office', typePO:'Persediaan', noStockRequest:'26/SR/BDG/08/00001', fob:'', shipVia:'Ekspedisi', cito:false,
      noOtomatis:'PO001', etd:'08/08/2026', noSoIndent:'', syaratBayar:'Kredit 45 Hari', gudang:'Gudang Utama-HO', gudangTarget:'Gudang Bandung',
      jurnalBPB:'JURNAL PEMBELIAN KREDIT (IDR)', alamatPengiriman:'Jl. Ir. H. Juanda No. 88, Bandung',
      items:[{kode:'BRG-002', nama:'Gula Pasir Gulaku 1kg', qty:500, um:'Karung', hargaBeli:15000, feeDistribusi:2, budgetDiskon:0, totalDisc:2, discBarang:150000, jumlah:7350000, pph:true}],
      ppnMode:'eksklusif', mataUang:'IDR', kurs:1, diskon1:0, diskon1Amount:0, diskon2:0, diskon2Amount:0, dpp:7350000, pajak11:'PPN11', ppnAmount:808500,
      pphAktif:false, pphKode:'', pphPersen:0, pphAmount:0, ongkosAngkut:0, jumlahTotal:8158500,
      tglInput:'06/08/2026 09:05:44', userInput:'sidik', tglEdit:'', userEdit:''},
    {no:'26/PO/HO/08/00009', noPR:'26/PR-HO/07/00003', tglPO:'06/08/2026', supplier:'CV Distribusi Sentosa', keterangan:'PO Administrasi Kasbon II/SDL/VII/2026', status:'Pending Receive', tutupPoStatus:'In Progress', cetakanKe:1,
      cabang:'Head Office', cabangTarget:'Head Office', typePO:'Persediaan', noStockRequest:'', fob:'', shipVia:'Ekspedisi', cito:false,
      noOtomatis:'PO001', etd:'08/08/2026', noSoIndent:'', syaratBayar:'Kredit 14 Hari', gudang:'Gudang Utama-HO', gudangTarget:'Gudang Utama-HO',
      jurnalBPB:'JURNAL PEMBELIAN KREDIT (IDR)', alamatPengiriman:'Jl. Ir. H. Juanda No. 88, Bandung',
      items:[{kode:'BRG-004', nama:'Tepung Terigu Segitiga Biru 1kg', qty:100, um:'Karung', hargaBeli:12000, feeDistribusi:0, budgetDiskon:0, totalDisc:0, discBarang:0, jumlah:1200000, pph:true}],
      ppnMode:'eksklusif', mataUang:'IDR', kurs:1, diskon1:0, diskon1Amount:0, diskon2:0, diskon2Amount:0, dpp:1200000, pajak11:'PPN11', ppnAmount:132000,
      pphAktif:false, pphKode:'', pphPersen:0, pphAmount:0, ongkosAngkut:0, jumlahTotal:1332000,
      tglInput:'06/08/2026 10:12:00', userInput:'sidik', tglEdit:'', userEdit:''},
    {no:'26/PO/HO/08/00008', noPR:'26/PR-HO/07/00002', tglPO:'06/08/2026', supplier:'CV Distribusi Sentosa', keterangan:'PO Administrasi Kasbon II/SDL/VII/2026', status:'Pending Receive', tutupPoStatus:'Pending', cetakanKe:2,
      cabang:'Head Office', cabangTarget:'Head Office', typePO:'Persediaan', noStockRequest:'', fob:'', shipVia:'Ekspedisi', cito:false,
      noOtomatis:'PO001', etd:'08/08/2026', noSoIndent:'', syaratBayar:'Kredit 14 Hari', gudang:'Gudang Utama-HO', gudangTarget:'Gudang Utama-HO',
      jurnalBPB:'JURNAL PEMBELIAN KREDIT (IDR)', alamatPengiriman:'Jl. Ir. H. Juanda No. 88, Bandung',
      items:[{kode:'BRG-004', nama:'Tepung Terigu Segitiga Biru 1kg', qty:100, um:'Karung', hargaBeli:12000, feeDistribusi:0, budgetDiskon:0, totalDisc:0, discBarang:0, jumlah:1200000, pph:true}],
      ppnMode:'eksklusif', mataUang:'IDR', kurs:1, diskon1:0, diskon1Amount:0, diskon2:0, diskon2Amount:0, dpp:1200000, pajak11:'PPN11', ppnAmount:132000,
      pphAktif:false, pphKode:'', pphPersen:0, pphAmount:0, ongkosAngkut:0, jumlahTotal:1332000,
      tglInput:'06/08/2026 10:15:22', userInput:'sidik', tglEdit:'', userEdit:''},
    {no:'26/PO/HO/08/00007_RI', noPR:'', tglPO:'06/08/2026', supplier:'PT Sasa Inti', keterangan:'26/SR/HO/08/00002 - Pemenuhan Toko Anugrah', status:'Pending Receive', tutupPoStatus:'In Progress', cetakanKe:2,
      cabang:'Head Office', cabangTarget:'Head Office', typePO:'Persediaan', noStockRequest:'26/SR/HO/08/00002', fob:'', shipVia:'Ekspedisi', cito:false,
      noOtomatis:'PO001', etd:'07/08/2026', noSoIndent:'', syaratBayar:'Kredit 30 Hari', gudang:'Gudang Utama-HO', gudangTarget:'Gudang Utama-HO',
      jurnalBPB:'JURNAL PEMBELIAN KREDIT (IDR)', alamatPengiriman:'Jl. Raya Industri No. 10, Kawasan Pergudangan Cakung, Jakarta Timur',
      items:[{kode:'BRG-006', nama:'Kecap Manis ABC 600ml', qty:300, um:'Dus', hargaBeli:14000, feeDistribusi:3, budgetDiskon:0, totalDisc:3, discBarang:126000, jumlah:4074000, pph:true}],
      ppnMode:'eksklusif', mataUang:'IDR', kurs:1, diskon1:0, diskon1Amount:0, diskon2:0, diskon2Amount:0, dpp:4074000, pajak11:'PPN11', ppnAmount:448140,
      pphAktif:true, pphKode:'PPH 22 (0.3)', pphPersen:0.3, pphAmount:12222, ongkosAngkut:0, jumlahTotal:4509918,
      tglInput:'06/08/2026 11:02:37', userInput:'sidik', tglEdit:'', userEdit:''},
    {no:'26/PO/HO/08/00006', noPR:'', tglPO:'06/08/2026', supplier:'PT Sasa Inti', keterangan:'26/SR/HO/08/00001 - Pemenuhan Toko Sejahtera', status:'Pending Receive', tutupPoStatus:'Pending', cetakanKe:1,
      cabang:'Head Office', cabangTarget:'Head Office', typePO:'Persediaan', noStockRequest:'26/SR/HO/08/00001', fob:'', shipVia:'Ekspedisi', cito:false,
      noOtomatis:'PO001', etd:'07/08/2026', noSoIndent:'', syaratBayar:'Kredit 30 Hari', gudang:'Gudang Utama-HO', gudangTarget:'Gudang Utama-HO',
      jurnalBPB:'JURNAL PEMBELIAN KREDIT (IDR)', alamatPengiriman:'Jl. Raya Industri No. 10, Kawasan Pergudangan Cakung, Jakarta Timur',
      items:[{kode:'BRG-006', nama:'Kecap Manis ABC 600ml', qty:150, um:'Dus', hargaBeli:14000, feeDistribusi:3, budgetDiskon:0, totalDisc:3, discBarang:63000, jumlah:2037000, pph:true}],
      ppnMode:'eksklusif', mataUang:'IDR', kurs:1, diskon1:0, diskon1Amount:0, diskon2:0, diskon2Amount:0, dpp:2037000, pajak11:'PPN11', ppnAmount:224070,
      pphAktif:true, pphKode:'PPH 22 (0.3)', pphPersen:0.3, pphAmount:6111, ongkosAngkut:0, jumlahTotal:2254959,
      tglInput:'06/08/2026 11:30:05', userInput:'sidik', tglEdit:'', userEdit:''},
    {no:'26/PO/HO/08/00005', noPR:'26/PR-HO/07/00002', tglPO:'05/08/2026', supplier:'CV Distribusi Sentosa', keterangan:'PO Administrasi Kasbon IT No. 002/SDL/07/2026', status:'Pending Receive', tutupPoStatus:'Pending', cetakanKe:1,
      cabang:'Head Office', cabangTarget:'Head Office', typePO:'Persediaan', noStockRequest:'', fob:'', shipVia:'Ekspedisi', cito:false,
      noOtomatis:'PO001', etd:'07/08/2026', noSoIndent:'', syaratBayar:'Kredit 14 Hari', gudang:'Gudang Utama-HO', gudangTarget:'Gudang Utama-HO',
      jurnalBPB:'JURNAL PEMBELIAN KREDIT (IDR)', alamatPengiriman:'Jl. Ir. H. Juanda No. 88, Bandung',
      items:[{kode:'BRG-004', nama:'Tepung Terigu Segitiga Biru 1kg', qty:50, um:'Karung', hargaBeli:12000, feeDistribusi:0, budgetDiskon:0, totalDisc:0, discBarang:0, jumlah:600000, pph:true}],
      ppnMode:'eksklusif', mataUang:'IDR', kurs:1, diskon1:0, diskon1Amount:0, diskon2:0, diskon2Amount:0, dpp:600000, pajak11:'PPN11', ppnAmount:66000,
      pphAktif:false, pphKode:'', pphPersen:0, pphAmount:0, ongkosAngkut:0, jumlahTotal:666000,
      tglInput:'05/08/2026 09:40:00', userInput:'sidik', tglEdit:'', userEdit:''},
    {no:'26/PO/HO/08/00004', noPR:'26/PR-HO/07/00003', tglPO:'05/08/2026', supplier:'CV Distribusi Sentosa', keterangan:'PO Administrasi Kasbon IT No. 001/SDL/07/2026', status:'Pending Receive', tutupPoStatus:'Pending', cetakanKe:1,
      cabang:'Head Office', cabangTarget:'Head Office', typePO:'Persediaan', noStockRequest:'', fob:'', shipVia:'Ekspedisi', cito:false,
      noOtomatis:'PO001', etd:'07/08/2026', noSoIndent:'', syaratBayar:'Kredit 14 Hari', gudang:'Gudang Utama-HO', gudangTarget:'Gudang Utama-HO',
      jurnalBPB:'JURNAL PEMBELIAN KREDIT (IDR)', alamatPengiriman:'Jl. Ir. H. Juanda No. 88, Bandung',
      items:[{kode:'BRG-004', nama:'Tepung Terigu Segitiga Biru 1kg', qty:50, um:'Karung', hargaBeli:12000, feeDistribusi:0, budgetDiskon:0, totalDisc:0, discBarang:0, jumlah:600000, pph:true}],
      ppnMode:'eksklusif', mataUang:'IDR', kurs:1, diskon1:0, diskon1Amount:0, diskon2:0, diskon2Amount:0, dpp:600000, pajak11:'PPN11', ppnAmount:66000,
      pphAktif:false, pphKode:'', pphPersen:0, pphAmount:0, ongkosAngkut:0, jumlahTotal:666000,
      tglInput:'05/08/2026 09:42:15', userInput:'sidik', tglEdit:'', userEdit:''},
    {no:'26/PO/HO/08/00003', noPR:'', tglPO:'05/08/2026', supplier:'PT Sumber Pangan Nusantara', keterangan:'26/SR/SMG/08/00001 - Penambahan Stok Semarang', status:'Pending Receive', tutupPoStatus:'Pending', cetakanKe:1,
      cabang:'Head Office', cabangTarget:'Head Office', typePO:'Persediaan', noStockRequest:'26/SR/SMG/08/00001', fob:'', shipVia:'Ekspedisi', cito:false,
      noOtomatis:'PO001', etd:'06/08/2026', noSoIndent:'', syaratBayar:'Kredit 30 Hari', gudang:'Gudang Utama-HO', gudangTarget:'Gudang Semarang',
      jurnalBPB:'JURNAL PEMBELIAN KREDIT (IDR)', alamatPengiriman:'Jl. Pemuda No. 45, Semarang',
      items:[{kode:'BRG-007', nama:'Susu Kental Manis Indomilk 380gr', qty:100, um:'Dus', hargaBeli:16000, feeDistribusi:2, budgetDiskon:0, totalDisc:2, discBarang:32000, jumlah:1568000, pph:true}],
      ppnMode:'eksklusif', mataUang:'IDR', kurs:1, diskon1:0, diskon1Amount:0, diskon2:0, diskon2Amount:0, dpp:1568000, pajak11:'PPN11', ppnAmount:172480,
      pphAktif:false, pphKode:'', pphPersen:0, pphAmount:0, ongkosAngkut:0, jumlahTotal:1740480,
      tglInput:'05/08/2026 14:05:50', userInput:'sidik', tglEdit:'', userEdit:''},
    {no:'26/PO/HO/08/00002', noPR:'', tglPO:'03/08/2026', supplier:'PT Sumber Pangan Nusantara', keterangan:'Pemenuhan PT. DAN Direct dari Pabrik', status:'Pending Receive', tutupPoStatus:'Close', cetakanKe:0,
      cabang:'Head Office', cabangTarget:'Head Office', typePO:'Persediaan', noStockRequest:'', fob:'', shipVia:'Diambil Sendiri', cito:false,
      noOtomatis:'PO001', etd:'04/08/2026', noSoIndent:'', syaratBayar:'CBD', gudang:'Gudang Utama-HO', gudangTarget:'Gudang Utama-HO',
      jurnalBPB:'JURNAL PEMBELIAN CBD (IDR)', alamatPengiriman:'Jl. Raya Industri No. 10, Kawasan Pergudangan Cakung, Jakarta Timur',
      items:[{kode:'BRG-001', nama:'Minyak Goreng Sunco 2L', qty:30, um:'Dus', hargaBeli:25000, feeDistribusi:0, budgetDiskon:0, totalDisc:0, discBarang:0, jumlah:750000, pph:true}],
      ppnMode:'eksklusif', mataUang:'IDR', kurs:1, diskon1:0, diskon1Amount:0, diskon2:0, diskon2Amount:0, dpp:750000, pajak11:'PPN11', ppnAmount:82500,
      pphAktif:false, pphKode:'', pphPersen:0, pphAmount:0, ongkosAngkut:0, jumlahTotal:832500,
      tglInput:'03/08/2026 08:15:00', userInput:'sidik', tglEdit:'', userEdit:''},
    {no:'26/PO/HO/08/00001', noPR:'', tglPO:'01/08/2026', supplier:'PT Roda Mas Trading', keterangan:'Pembelian Rutin Bulanan Gudang Cirebon', status:'Pending Receive', tutupPoStatus:'Pending', cetakanKe:1,
      cabang:'Head Office', cabangTarget:'Head Office', typePO:'Persediaan', noStockRequest:'', fob:'', shipVia:'Ekspedisi', cito:false,
      noOtomatis:'PO001', etd:'03/08/2026', noSoIndent:'', syaratBayar:'Kredit 30 Hari', gudang:'Gudang Utama-HO', gudangTarget:'Gudang Utama-HO',
      jurnalBPB:'JURNAL PEMBELIAN KREDIT (IDR)', alamatPengiriman:'Jl. Siliwangi No. 77, Cirebon',
      items:[{kode:'BRG-009', nama:'Kopi Kapal Api 165gr', qty:100, um:'Dus', hargaBeli:14000, feeDistribusi:0, budgetDiskon:0, totalDisc:0, discBarang:0, jumlah:1400000, pph:true}],
      ppnMode:'eksklusif', mataUang:'IDR', kurs:1, diskon1:0, diskon1Amount:0, diskon2:0, diskon2Amount:0, dpp:1400000, pajak11:'PPN11', ppnAmount:154000,
      pphAktif:false, pphKode:'', pphPersen:0, pphAmount:0, ongkosAngkut:0, jumlahTotal:1554000,
      tglInput:'01/08/2026 08:00:00', userInput:'sidik', tglEdit:'', userEdit:''},
  ],

  /* Grup Customer (dipakai sub-grid "Grup Customer" di Kategori Barang, dan
     ke depan bisa dipetakan juga ke menu "Grup Customer" di Customer & Penjualan
     kalau modul itu dibangun tersendiri). Disesuaikan ke channel penjualan
     general trading/FMCG milik DBM (bukan channel farmasi seperti di contoh
     screenshot MASERP — pola penyesuaian sama seperti kode akun GL & data
     barang di modul-modul lain). */
  /* Master "Syarat Customer Grup" (Customer & Penjualan > Master & Setting >
     Master Syarat Customer Grup — masih placeholder di menu ini, tapi datanya
     sudah dipakai sebagai sumber picker sub-grid Legalitas di form Grup
     Customer, lihat js/pages/customer-group.template.js). Disesuaikan ke
     dokumen legalitas umum bisnis distribusi/general trading (bukan dokumen
     spesifik farmasi seperti "Surat Izin Apotek (SIA)"/"Surat Izin Praktek"
     di screenshot MASERP asli — pola penyesuaian sama seperti kode akun GL &
     data barang di modul-modul lain). */
  syaratCustomerGrup:[
    {kode:'ZC001', nama:'SIUP (Surat Izin Usaha Perdagangan)'},
    {kode:'ZC005', nama:'NIB (Nomor Izin Berusaha)'},
    {kode:'ZC008', nama:'NPWP'},
    {kode:'ZC011', nama:'SITU (Surat Izin Tempat Usaha)'},
    {kode:'ZC013', nama:'Spesimen TTD'},
    {kode:'ZC014', nama:'Akta Pendirian Perusahaan'},
    {kode:'ZC015', nama:'KTP Penanggung Jawab'},
    {kode:'ZC016', nama:'Nama Penanggung Jawab'},
    {kode:'ZC018', nama:'Surat Keterangan Domisili Usaha'},
    {kode:'ZC021', nama:'NPWP Badan Usaha'},
    {kode:'ZC025', nama:'Surat Kuasa'},
    {kode:'ZC027', nama:'Spesimen Cap / Stempel Customer'},
  ],

  /* Master "Badan Usaha" (Customer & Penjualan > Master & Setting > Badan
     Usaha — masih placeholder di menu ini, tapi datanya sudah dipakai
     sebagai sumber picker sub-grid "Badan Usaha" di form Grup Customer). */
  badanUsahaList:[
    {kode:'PT', nama:'PERSEROAN TERBATAS (PT)'},
    {kode:'CV', nama:'PERSEKUTUAN KOMANDITER (CV)'},
    {kode:'UD', nama:'USAHA DAGANG (UD)'},
    {kode:'KOP', nama:'KOPERASI'},
    {kode:'YYS', nama:'YAYASAN'},
    {kode:'PRO', nama:'PERORANGAN'},
  ],

  /* Master Grup Customer (Customer & Penjualan > Master & Setting > Grup
     Customer, page 'customerGroup'), sesuai 2 screenshot MASERP "Grup
     Customer" (list) & "Grup Customer" (form Ubah ACS/Apotek Chain Store)
     yang dikirim user 2026-08-11. Kode/nama channel penjualan DIPERTAHANKAN
     dari yang sudah dibangun sebelumnya untuk sub-grid "Grup Customer" di
     Kategori Barang (field kode/nama saja) — sekarang diperkaya dengan
     seluruh field form: Diskon #1/#2 (dipakai di kolom list), Mata Uang,
     Alamat/Telepon/Fax/Kontak Person, Default Min batas kredit, flag
     `dominasi`, 6 flag "legalitas" (outlet/penanggungJawab/asisten1-3/pemilik)
     beserta sub-grid syarat masing-masing (array {kode,nama} yang me-refer
     ke DATA.syaratCustomerGrup), dan sub-grid `badanUsaha` (me-refer ke
     DATA.badanUsahaList). Variasi baris sengaja dibuat berbeda-beda (ada yang
     3 section legalitas terbuka sekaligus, ada yang cuma 1, ada yang tidak
     sama sekali) supaya representatif menguji toggle dinamis section di
     form. Struktur {kode,nama} tetap kompatibel dengan sub-grid Kategori
     Barang yang sudah ada (field tambahan di sini tidak mengganggu itu). */
  customerGroup:[
    {kode:'GRSR', nama:'GROSIR', diskon1:0, diskon2:0, mataUang:'IDR', alamat:'', telepon:'', fax:'', kontakPerson:'', minBatasKredit:0, dominasi:false,
      legalitasOutlet:true, outletSyarat:[{kode:'ZC001',nama:'SIUP (Surat Izin Usaha Perdagangan)'},{kode:'ZC005',nama:'NIB (Nomor Izin Berusaha)'},{kode:'ZC008',nama:'NPWP'},{kode:'ZC011',nama:'SITU (Surat Izin Tempat Usaha)'}],
      legalitasPenanggungJawab:true, pjSyarat:[{kode:'ZC015',nama:'KTP Penanggung Jawab'},{kode:'ZC016',nama:'Nama Penanggung Jawab'},{kode:'ZC013',nama:'Spesimen TTD'}],
      legalitasAsisten1:false, asisten1Syarat:[], legalitasAsisten2:false, asisten2Syarat:[], legalitasAsisten3:false, asisten3Syarat:[],
      legalitasPemilik:false, pemilikSyarat:[],
      badanUsaha:[{kode:'PT',nama:'PERSEROAN TERBATAS (PT)'},{kode:'CV',nama:'PERSEKUTUAN KOMANDITER (CV)'}]},
    {kode:'RTMD', nama:'RITEL MODERN (MINIMARKET/SUPERMARKET)', diskon1:0, diskon2:0, mataUang:'IDR', alamat:'', telepon:'', fax:'', kontakPerson:'', minBatasKredit:0, dominasi:false,
      legalitasOutlet:true, outletSyarat:[{kode:'ZC005',nama:'NIB (Nomor Izin Berusaha)'},{kode:'ZC008',nama:'NPWP'},{kode:'ZC011',nama:'SITU (Surat Izin Tempat Usaha)'}],
      legalitasPenanggungJawab:true, pjSyarat:[{kode:'ZC015',nama:'KTP Penanggung Jawab'},{kode:'ZC016',nama:'Nama Penanggung Jawab'}],
      legalitasAsisten1:false, asisten1Syarat:[], legalitasAsisten2:false, asisten2Syarat:[], legalitasAsisten3:false, asisten3Syarat:[],
      legalitasPemilik:false, pemilikSyarat:[],
      badanUsaha:[{kode:'PT',nama:'PERSEROAN TERBATAS (PT)'}]},
    {kode:'RTTR', nama:'RITEL TRADISIONAL (TOKO/WARUNG)', diskon1:0, diskon2:0, mataUang:'IDR', alamat:'', telepon:'', fax:'', kontakPerson:'', minBatasKredit:0, dominasi:false,
      legalitasOutlet:true, outletSyarat:[{kode:'ZC005',nama:'NIB (Nomor Izin Berusaha)'},{kode:'ZC008',nama:'NPWP'}],
      legalitasPenanggungJawab:false, pjSyarat:[],
      legalitasAsisten1:false, asisten1Syarat:[], legalitasAsisten2:false, asisten2Syarat:[], legalitasAsisten3:false, asisten3Syarat:[],
      legalitasPemilik:false, pemilikSyarat:[],
      badanUsaha:[{kode:'PRO',nama:'PERORANGAN'},{kode:'UD',nama:'USAHA DAGANG (UD)'}]},
    {kode:'SBDS', nama:'SUB DISTRIBUTOR', diskon1:0, diskon2:0, mataUang:'IDR', alamat:'', telepon:'', fax:'', kontakPerson:'', minBatasKredit:0, dominasi:true,
      legalitasOutlet:true, outletSyarat:[{kode:'ZC001',nama:'SIUP (Surat Izin Usaha Perdagangan)'},{kode:'ZC005',nama:'NIB (Nomor Izin Berusaha)'},{kode:'ZC008',nama:'NPWP'},{kode:'ZC011',nama:'SITU (Surat Izin Tempat Usaha)'},{kode:'ZC014',nama:'Akta Pendirian Perusahaan'}],
      legalitasPenanggungJawab:true, pjSyarat:[{kode:'ZC015',nama:'KTP Penanggung Jawab'},{kode:'ZC016',nama:'Nama Penanggung Jawab'},{kode:'ZC013',nama:'Spesimen TTD'}],
      legalitasAsisten1:true, asisten1Syarat:[{kode:'ZC015',nama:'KTP Penanggung Jawab'},{kode:'ZC013',nama:'Spesimen TTD'}],
      legalitasAsisten2:false, asisten2Syarat:[], legalitasAsisten3:false, asisten3Syarat:[],
      legalitasPemilik:false, pemilikSyarat:[],
      badanUsaha:[{kode:'PT',nama:'PERSEROAN TERBATAS (PT)'},{kode:'CV',nama:'PERSEKUTUAN KOMANDITER (CV)'}]},
    {kode:'HORK', nama:'HORECA (HOTEL/RESTORAN/KAFE)', diskon1:0, diskon2:0, mataUang:'IDR', alamat:'', telepon:'', fax:'', kontakPerson:'', minBatasKredit:0, dominasi:false,
      legalitasOutlet:true, outletSyarat:[{kode:'ZC005',nama:'NIB (Nomor Izin Berusaha)'},{kode:'ZC008',nama:'NPWP'},{kode:'ZC011',nama:'SITU (Surat Izin Tempat Usaha)'}],
      legalitasPenanggungJawab:false, pjSyarat:[],
      legalitasAsisten1:false, asisten1Syarat:[], legalitasAsisten2:false, asisten2Syarat:[], legalitasAsisten3:false, asisten3Syarat:[],
      legalitasPemilik:false, pemilikSyarat:[],
      badanUsaha:[{kode:'PT',nama:'PERSEROAN TERBATAS (PT)'},{kode:'PRO',nama:'PERORANGAN'}]},
    {kode:'INST', nama:'INSTITUSI & PEMERINTAH', diskon1:0, diskon2:0, mataUang:'IDR', alamat:'', telepon:'', fax:'', kontakPerson:'', minBatasKredit:0, dominasi:false,
      legalitasOutlet:true, outletSyarat:[{kode:'ZC005',nama:'NIB (Nomor Izin Berusaha)'},{kode:'ZC008',nama:'NPWP'},{kode:'ZC018',nama:'Surat Keterangan Domisili Usaha'}],
      legalitasPenanggungJawab:true, pjSyarat:[{kode:'ZC015',nama:'KTP Penanggung Jawab'},{kode:'ZC016',nama:'Nama Penanggung Jawab'},{kode:'ZC025',nama:'Surat Kuasa'}],
      legalitasAsisten1:false, asisten1Syarat:[], legalitasAsisten2:false, asisten2Syarat:[], legalitasAsisten3:false, asisten3Syarat:[],
      legalitasPemilik:false, pemilikSyarat:[],
      badanUsaha:[{kode:'YYS',nama:'YAYASAN'}]},
    {kode:'KOPR', nama:'KOPERASI', diskon1:0, diskon2:0, mataUang:'IDR', alamat:'', telepon:'', fax:'', kontakPerson:'', minBatasKredit:0, dominasi:false,
      legalitasOutlet:true, outletSyarat:[{kode:'ZC005',nama:'NIB (Nomor Izin Berusaha)'},{kode:'ZC008',nama:'NPWP'},{kode:'ZC014',nama:'Akta Pendirian Perusahaan'}],
      legalitasPenanggungJawab:false, pjSyarat:[],
      legalitasAsisten1:false, asisten1Syarat:[], legalitasAsisten2:false, asisten2Syarat:[], legalitasAsisten3:false, asisten3Syarat:[],
      legalitasPemilik:false, pemilikSyarat:[],
      badanUsaha:[{kode:'KOP',nama:'KOPERASI'}]},
    {kode:'EXPR', nama:'EKSPOR', diskon1:0, diskon2:0, mataUang:'USD', alamat:'', telepon:'', fax:'', kontakPerson:'', minBatasKredit:0, dominasi:false,
      legalitasOutlet:true, outletSyarat:[{kode:'ZC001',nama:'SIUP (Surat Izin Usaha Perdagangan)'},{kode:'ZC005',nama:'NIB (Nomor Izin Berusaha)'},{kode:'ZC008',nama:'NPWP'},{kode:'ZC021',nama:'NPWP Badan Usaha'}],
      legalitasPenanggungJawab:true, pjSyarat:[{kode:'ZC015',nama:'KTP Penanggung Jawab'},{kode:'ZC016',nama:'Nama Penanggung Jawab'}],
      legalitasAsisten1:false, asisten1Syarat:[], legalitasAsisten2:false, asisten2Syarat:[], legalitasAsisten3:false, asisten3Syarat:[],
      legalitasPemilik:false, pemilikSyarat:[],
      badanUsaha:[{kode:'PT',nama:'PERSEROAN TERBATAS (PT)'}]},
  ],

  /* Opsi dropdown "Kategori Induk" di form Kategori Barang — pengelompokan
     tingkat atas kategori barang/beban, dipakai untuk rollup laporan. */
  kategoriIndukList:['Barang Dagang','Beban / Biaya','Jasa','Aktiva'],

  /* Master Kategori Barang (Persediaan Barang > Master & Setting > Kategori
     Barang), sesuai 2 screenshot MASERP "Daftar Kategori Barang" & "Kategori
     Barang" yang dikirim user 2026-08-11. 14 baris sample: 6 kategori barang
     dagang (konsisten dengan field `kategori` di DATA.items — Sembako, Bahan
     Baku, Makanan, Bumbu, Minuman, Toiletries), 7 kategori beban/biaya, dan
     1 kategori jasa — mengganti daftar kategori obat-obatan di screenshot asli
     (yang berasal dari demo perusahaan farmasi) dengan kategori yang relevan
     untuk bisnis distribusi general trading/FMCG milik DBM. Field akun GL
     kategori barang dagang di-map ke akun yang SUDAH ADA di DATA.akunGL
     (Penjualan Barang Dagang, Sales Item Discount Principal/Distributor,
     Retur Penjualan, Persediaan Barang Dagang Jakarta, HPP Barang Dagang,
     Persediaan Barang Intransit) — kategori beban/jasa sengaja dibiarkan
     tanpa akun & grup customer (field-field ini memang untuk kategori barang
     dagang yang dijual ke customer, bukan kategori beban internal). */
  kategoriBarang:[
    {kode:'CATSMB', nama:'Sembako', keterangan:'Product Category', kategoriInduk:'Barang Dagang',
      grupCustomer:[{kode:'GRSR',nama:'GROSIR'},{kode:'RTMD',nama:'RITEL MODERN (MINIMARKET/SUPERMARKET)'},{kode:'RTTR',nama:'RITEL TRADISIONAL (TOKO/WARUNG)'},{kode:'SBDS',nama:'SUB DISTRIBUTOR'}],
      akunDiskonPembelian:'4110004', akunPembelianJasa:'', akunDiskonPembelianJasa:'', akunPenjualan:'4110001', akunDiskonPrincipal:'4110004', akunDiskonDistributor:'4110005',
      akunDiskonSelisihHna:'4110004', akunPenjualanJasa:'', akunDiskonPenjualanJasa:'', akunSalesRefund:'4110002', akunReturDiskonPrincipal:'4110004', akunReturDiskonDistributor:'4110005',
      akunStokPersediaan:'1130001', akunHpp:'5110001', akunHppRetur:'5110001', akunPersediaanReject:'', akunPersediaanIntransit:'1130002'},
    {kode:'CATBHB', nama:'Bahan Baku', keterangan:'Product Category', kategoriInduk:'Barang Dagang',
      grupCustomer:[{kode:'GRSR',nama:'GROSIR'},{kode:'SBDS',nama:'SUB DISTRIBUTOR'},{kode:'INST',nama:'INSTITUSI & PEMERINTAH'}],
      akunDiskonPembelian:'4110004', akunPembelianJasa:'', akunDiskonPembelianJasa:'', akunPenjualan:'4110001', akunDiskonPrincipal:'4110004', akunDiskonDistributor:'4110005',
      akunDiskonSelisihHna:'4110004', akunPenjualanJasa:'', akunDiskonPenjualanJasa:'', akunSalesRefund:'4110002', akunReturDiskonPrincipal:'4110004', akunReturDiskonDistributor:'4110005',
      akunStokPersediaan:'1130001', akunHpp:'5110001', akunHppRetur:'5110001', akunPersediaanReject:'', akunPersediaanIntransit:'1130002'},
    {kode:'CATMKN', nama:'Makanan', keterangan:'Product Category', kategoriInduk:'Barang Dagang',
      grupCustomer:[{kode:'GRSR',nama:'GROSIR'},{kode:'RTMD',nama:'RITEL MODERN (MINIMARKET/SUPERMARKET)'},{kode:'RTTR',nama:'RITEL TRADISIONAL (TOKO/WARUNG)'},{kode:'HORK',nama:'HORECA (HOTEL/RESTORAN/KAFE)'}],
      akunDiskonPembelian:'4110004', akunPembelianJasa:'', akunDiskonPembelianJasa:'', akunPenjualan:'4110001', akunDiskonPrincipal:'4110004', akunDiskonDistributor:'4110005',
      akunDiskonSelisihHna:'4110004', akunPenjualanJasa:'', akunDiskonPenjualanJasa:'', akunSalesRefund:'4110002', akunReturDiskonPrincipal:'4110004', akunReturDiskonDistributor:'4110005',
      akunStokPersediaan:'1130001', akunHpp:'5110001', akunHppRetur:'5110001', akunPersediaanReject:'', akunPersediaanIntransit:'1130002'},
    {kode:'CATBMB', nama:'Bumbu', keterangan:'Product Category', kategoriInduk:'Barang Dagang',
      grupCustomer:[{kode:'GRSR',nama:'GROSIR'},{kode:'RTTR',nama:'RITEL TRADISIONAL (TOKO/WARUNG)'},{kode:'HORK',nama:'HORECA (HOTEL/RESTORAN/KAFE)'}],
      akunDiskonPembelian:'4110004', akunPembelianJasa:'', akunDiskonPembelianJasa:'', akunPenjualan:'4110001', akunDiskonPrincipal:'4110004', akunDiskonDistributor:'4110005',
      akunDiskonSelisihHna:'4110004', akunPenjualanJasa:'', akunDiskonPenjualanJasa:'', akunSalesRefund:'4110002', akunReturDiskonPrincipal:'4110004', akunReturDiskonDistributor:'4110005',
      akunStokPersediaan:'1130001', akunHpp:'5110001', akunHppRetur:'5110001', akunPersediaanReject:'', akunPersediaanIntransit:'1130002'},
    {kode:'CATMNM', nama:'Minuman', keterangan:'Product Category', kategoriInduk:'Barang Dagang',
      grupCustomer:[{kode:'GRSR',nama:'GROSIR'},{kode:'RTMD',nama:'RITEL MODERN (MINIMARKET/SUPERMARKET)'},{kode:'RTTR',nama:'RITEL TRADISIONAL (TOKO/WARUNG)'},{kode:'HORK',nama:'HORECA (HOTEL/RESTORAN/KAFE)'},{kode:'KOPR',nama:'KOPERASI'}],
      akunDiskonPembelian:'4110004', akunPembelianJasa:'', akunDiskonPembelianJasa:'', akunPenjualan:'4110001', akunDiskonPrincipal:'4110004', akunDiskonDistributor:'4110005',
      akunDiskonSelisihHna:'4110004', akunPenjualanJasa:'', akunDiskonPenjualanJasa:'', akunSalesRefund:'4110002', akunReturDiskonPrincipal:'4110004', akunReturDiskonDistributor:'4110005',
      akunStokPersediaan:'1130001', akunHpp:'5110001', akunHppRetur:'5110001', akunPersediaanReject:'', akunPersediaanIntransit:'1130002'},
    {kode:'CATTOI', nama:'Toiletries', keterangan:'Product Category', kategoriInduk:'Barang Dagang',
      grupCustomer:[{kode:'RTMD',nama:'RITEL MODERN (MINIMARKET/SUPERMARKET)'},{kode:'RTTR',nama:'RITEL TRADISIONAL (TOKO/WARUNG)'},{kode:'GRSR',nama:'GROSIR'}],
      akunDiskonPembelian:'4110004', akunPembelianJasa:'', akunDiskonPembelianJasa:'', akunPenjualan:'4110001', akunDiskonPrincipal:'4110004', akunDiskonDistributor:'4110005',
      akunDiskonSelisihHna:'4110004', akunPenjualanJasa:'', akunDiskonPenjualanJasa:'', akunSalesRefund:'4110002', akunReturDiskonPrincipal:'4110004', akunReturDiskonDistributor:'4110005',
      akunStokPersediaan:'1130001', akunHpp:'5110001', akunHppRetur:'5110001', akunPersediaanReject:'', akunPersediaanIntransit:'1130002'},
    {kode:'CATNTR', nama:'Beban Notaris', keterangan:'Product Category', kategoriInduk:'Beban / Biaya', grupCustomer:[],
      akunDiskonPembelian:'', akunPembelianJasa:'', akunDiskonPembelianJasa:'', akunPenjualan:'', akunDiskonPrincipal:'', akunDiskonDistributor:'',
      akunDiskonSelisihHna:'', akunPenjualanJasa:'', akunDiskonPenjualanJasa:'', akunSalesRefund:'', akunReturDiskonPrincipal:'', akunReturDiskonDistributor:'',
      akunStokPersediaan:'', akunHpp:'', akunHppRetur:'', akunPersediaanReject:'', akunPersediaanIntransit:''},
    {kode:'CATPBB', nama:'BEBAN PBB', keterangan:'Product Category', kategoriInduk:'Beban / Biaya', grupCustomer:[],
      akunDiskonPembelian:'', akunPembelianJasa:'', akunDiskonPembelianJasa:'', akunPenjualan:'', akunDiskonPrincipal:'', akunDiskonDistributor:'',
      akunDiskonSelisihHna:'', akunPenjualanJasa:'', akunDiskonPenjualanJasa:'', akunSalesRefund:'', akunReturDiskonPrincipal:'', akunReturDiskonDistributor:'',
      akunStokPersediaan:'', akunHpp:'', akunHppRetur:'', akunPersediaanReject:'', akunPersediaanIntransit:''},
    {kode:'CATPBN', nama:'Beban Pemeliharaan Bangunan', keterangan:'Product Category', kategoriInduk:'Beban / Biaya', grupCustomer:[],
      akunDiskonPembelian:'', akunPembelianJasa:'', akunDiskonPembelianJasa:'', akunPenjualan:'', akunDiskonPrincipal:'', akunDiskonDistributor:'',
      akunDiskonSelisihHna:'', akunPenjualanJasa:'', akunDiskonPenjualanJasa:'', akunSalesRefund:'', akunReturDiskonPrincipal:'', akunReturDiskonDistributor:'',
      akunStokPersediaan:'', akunHpp:'', akunHppRetur:'', akunPersediaanReject:'', akunPersediaanIntransit:''},
    {kode:'CATPDS', nama:'Beban Perjalanan Dinas', keterangan:'Product Category', kategoriInduk:'Beban / Biaya', grupCustomer:[],
      akunDiskonPembelian:'', akunPembelianJasa:'', akunDiskonPembelianJasa:'', akunPenjualan:'', akunDiskonPrincipal:'', akunDiskonDistributor:'',
      akunDiskonSelisihHna:'', akunPenjualanJasa:'', akunDiskonPenjualanJasa:'', akunSalesRefund:'', akunReturDiskonPrincipal:'', akunReturDiskonDistributor:'',
      akunStokPersediaan:'', akunHpp:'', akunHppRetur:'', akunPersediaanReject:'', akunPersediaanIntransit:''},
    {kode:'CATBGD', nama:'Beban Sewa Gudang', keterangan:'Product Category', kategoriInduk:'Beban / Biaya', grupCustomer:[],
      akunDiskonPembelian:'', akunPembelianJasa:'', akunDiskonPembelianJasa:'', akunPenjualan:'', akunDiskonPrincipal:'', akunDiskonDistributor:'',
      akunDiskonSelisihHna:'', akunPenjualanJasa:'', akunDiskonPenjualanJasa:'', akunSalesRefund:'', akunReturDiskonPrincipal:'', akunReturDiskonDistributor:'',
      akunStokPersediaan:'', akunHpp:'', akunHppRetur:'', akunPersediaanReject:'', akunPersediaanIntransit:''},
    {kode:'CATBAK', nama:'Beban Angkutan & Ekspedisi', keterangan:'Product Category', kategoriInduk:'Beban / Biaya', grupCustomer:[],
      akunDiskonPembelian:'', akunPembelianJasa:'', akunDiskonPembelianJasa:'', akunPenjualan:'', akunDiskonPrincipal:'', akunDiskonDistributor:'',
      akunDiskonSelisihHna:'', akunPenjualanJasa:'', akunDiskonPenjualanJasa:'', akunSalesRefund:'', akunReturDiskonPrincipal:'', akunReturDiskonDistributor:'',
      akunStokPersediaan:'', akunHpp:'', akunHppRetur:'', akunPersediaanReject:'', akunPersediaanIntransit:''},
    {kode:'CATATK', nama:'Beban ATK & Cetak Kantor', keterangan:'Product Category', kategoriInduk:'Beban / Biaya', grupCustomer:[],
      akunDiskonPembelian:'', akunPembelianJasa:'', akunDiskonPembelianJasa:'', akunPenjualan:'', akunDiskonPrincipal:'', akunDiskonDistributor:'',
      akunDiskonSelisihHna:'', akunPenjualanJasa:'', akunDiskonPenjualanJasa:'', akunSalesRefund:'', akunReturDiskonPrincipal:'', akunReturDiskonDistributor:'',
      akunStokPersediaan:'', akunHpp:'', akunHppRetur:'', akunPersediaanReject:'', akunPersediaanIntransit:''},
    {kode:'CATJSK', nama:'Jasa Konsultasi & Profesional', keterangan:'Product Category', kategoriInduk:'Jasa', grupCustomer:[],
      akunDiskonPembelian:'', akunPembelianJasa:'', akunDiskonPembelianJasa:'', akunPenjualan:'', akunDiskonPrincipal:'', akunDiskonDistributor:'',
      akunDiskonSelisihHna:'', akunPenjualanJasa:'', akunDiskonPenjualanJasa:'', akunSalesRefund:'', akunReturDiskonPrincipal:'', akunReturDiskonDistributor:'',
      akunStokPersediaan:'', akunHpp:'', akunHppRetur:'', akunPersediaanReject:'', akunPersediaanIntransit:''},
  ],

  /* Zat Kandungan Aktif (Persediaan Barang > Master & Setting > Zat
     Kandungan Aktif, page:'zatKandunganAktif'), sesuai screenshot MASERP
     "Daftar Zat Kandungan Aktif" (Total Record: 324) yang dikirim user
     2026-08-21. Field ini (& 3 tetangganya di sidebar — Farmakoterapi/
     Sub-Farmakoterapi/Bentuk Sediaan, masih placeholder) khas distributor
     farmasi/kesehatan, BEDA dari katalog FMCG sembako yang sudah dibangun
     untuk DBM sejauh ini — user mengonfirmasi dibangun APA ADANYA (nama
     zat aktif/INN obat adalah referensi standar industri, bukan data
     rahasia perusahaan demo lain, jadi aman dipakai persis).

     VOLUME diturunkan dari 324 baris (screenshot asli, terlalu besar untuk
     mockup) ke 69 baris — mengikuti precedent downsize-volume Master
     Rayon/Price List By Province/Cetakan Transaksi. 10 baris PALING ATAS
     PERSIS sesuai screenshot, termasuk 2 kode non-standar
     'ANTASIDADOENSLF'/'COTRIM400-80' (kuirk data asli — kode lama sebelum
     skema penomoran KZA00000 dst. diberlakukan, direproduksi apa adanya).
     59 baris sisanya nama generik/INN obat umum lain (BUKAN replikasi 314
     baris sungguhan dari screenshot yang resolusinya tidak bisa dipastikan
     akurat) — tetap genuinely cukup untuk mendemokan pagination
     multi-halaman sungguhan (69÷10=7 halaman, kebetulan pas dengan jumlah
     tombol nomor halaman "1..7" yang terlihat di screenshot). */
  zatKandunganAktif:[
    {kode:'ANTASIDADOENSLF', nama:'DRIED ALUMINIUM HYDROXIDE GEL|MAGNESIUM HYDROXIDE'},
    {kode:'COTRIM400-80', nama:'SULFAMETHOXAZOLE|TRIMETHOPRIM'},
    {kode:'KZA00000', nama:'Non'},
    {kode:'KZA00001', nama:'2QR-Complex'},
    {kode:'KZA00002', nama:'Acyclovir'},
    {kode:'KZA00003', nama:'Alga Extract'},
    {kode:'KZA00004', nama:'ALLOPURINOL'},
    {kode:'KZA00005', nama:'Aluminium Hidroksida / Al(OH)3'},
    {kode:'KZA00006', nama:'AMBROXOL HYDROCHLORIDE'},
    {kode:'KZA00007', nama:'AMLODIPINE BESILATE'},
    {kode:'KZA00008', nama:'Amoxicillin'},
    {kode:'KZA00009', nama:'Ampicillin Trihydrate'},
    {kode:'KZA00010', nama:'Antasida DOEN (Kombinasi)'},
    {kode:'KZA00011', nama:'Ascorbic Acid (Vitamin C)'},
    {kode:'KZA00012', nama:'Aspirin'},
    {kode:'KZA00013', nama:'Atorvastatin Calcium'},
    {kode:'KZA00014', nama:'Azithromycin'},
    {kode:'KZA00015', nama:'Betamethasone Valerate'},
    {kode:'KZA00016', nama:'Bisoprolol Fumarate'},
    {kode:'KZA00017', nama:'Calcium Carbonate'},
    {kode:'KZA00018', nama:'Calcium Lactate'},
    {kode:'KZA00019', nama:'Captopril'},
    {kode:'KZA00020', nama:'Cefadroxil'},
    {kode:'KZA00021', nama:'Cefixime'},
    {kode:'KZA00022', nama:'Cetirizine HCl'},
    {kode:'KZA00023', nama:'Chlorpheniramine Maleate'},
    {kode:'KZA00024', nama:'Ciprofloxacin HCl'},
    {kode:'KZA00025', nama:'Clindamycin HCl'},
    {kode:'KZA00026', nama:'Clopidogrel Bisulfate'},
    {kode:'KZA00027', nama:'Dexamethasone'},
    {kode:'KZA00028', nama:'Diclofenac Sodium'},
    {kode:'KZA00029', nama:'Diphenhydramine HCl'},
    {kode:'KZA00030', nama:'Domperidone'},
    {kode:'KZA00031', nama:'Enalapril Maleate'},
    {kode:'KZA00032', nama:'Erythromycin Stearate'},
    {kode:'KZA00033', nama:'Famotidine'},
    {kode:'KZA00034', nama:'Ferrous Sulfate'},
    {kode:'KZA00035', nama:'Furosemide'},
    {kode:'KZA00036', nama:'Glibenclamide'},
    {kode:'KZA00037', nama:'Glimepiride'},
    {kode:'KZA00038', nama:'Ibuprofen'},
    {kode:'KZA00039', nama:'Ketoconazole'},
    {kode:'KZA00040', nama:'Lansoprazole'},
    {kode:'KZA00041', nama:'Levofloxacin'},
    {kode:'KZA00042', nama:'Loperamide HCl'},
    {kode:'KZA00043', nama:'Loratadine'},
    {kode:'KZA00044', nama:'Losartan Potassium'},
    {kode:'KZA00045', nama:'Meloxicam'},
    {kode:'KZA00046', nama:'Metformin HCl'},
    {kode:'KZA00047', nama:'Metoclopramide HCl'},
    {kode:'KZA00048', nama:'Metronidazole'},
    {kode:'KZA00049', nama:'Miconazole Nitrate'},
    {kode:'KZA00050', nama:'Multivitamin & Mineral'},
    {kode:'KZA00051', nama:'Naproxen Sodium'},
    {kode:'KZA00052', nama:'Neomycin Sulfate'},
    {kode:'KZA00053', nama:'Omeprazole'},
    {kode:'KZA00054', nama:'Ondansetron HCl'},
    {kode:'KZA00055', nama:'Paracetamol'},
    {kode:'KZA00056', nama:'Phenylephrine HCl'},
    {kode:'KZA00057', nama:'Piroxicam'},
    {kode:'KZA00058', nama:'Prednisone'},
    {kode:'KZA00059', nama:'Ranitidine HCl'},
    {kode:'KZA00060', nama:'Salbutamol Sulfate'},
    {kode:'KZA00061', nama:'Simvastatin'},
    {kode:'KZA00062', nama:'Vitamin B Complex'},
    {kode:'KZA00063', nama:'Vitamin B12 (Cyanocobalamin)'},
    {kode:'KZA00064', nama:'Vitamin D3 (Cholecalciferol)'},
    {kode:'KZA00065', nama:'Zinc Sulfate'},
    {kode:'KZA00066', nama:'Zolpidem Tartrate'},
  ],

  /* Farmakoterapi (Persediaan Barang > Master & Setting >
     Farmakoterapi, page:'farmakoterapi'), sesuai screenshot MASERP
     "Master Farmakoterapi" (Total Record: 80, kolom Kode/Nama
     Farmakoterapi dengan ikon sort di kedua header, page-size 10
     default + Pencarian Global, pager First/Previous/1..7/Next/Last)
     yang dikirim user 2026-08-21. Pola & keputusan data SAMA
     persis dengan Zat Kandungan Aktif (menu tetangga di atas):
     field khas distributor farmasi, dibangun apa adanya karena
     nama kelas terapi (farmakoterapi) adalah terminologi
     farmakologi standar (mis. ATC-like), bukan data rahasia
     perusahaan demo lain.

     TIDAK ADA downsize volume di sini — Total Record: 80 pada
     screenshot asli SUDAH sewajarnya (beda dgn Zat Kandungan
     Aktif yg 324 baris di-downsize ke 60), jadi 80 baris
     dipertahankan utuh: 10 baris PALING ATAS PERSIS sesuai
     screenshot (FRK00000-FRK00009), 70 baris sisanya nama kelas
     farmakoterapi generik lain (bukan replikasi baris
     sungguhan screenshot yg tak termuat di layar), diurutkan
     alfabetis mengikuti pola natural penomoran kode berurutan
     yang terlihat di 10 baris pertama. Reuse `tplZkaPager()`-
     style windowed pager & real column-sort dari Zat Kandungan
     Aktif (lihat farmakoterapi.template.js). 80÷10=8 halaman,
     window pager tampil "1..7" + Next di halaman 1 — persis
     screenshot. */
  farmakoterapi:[
    {kode:'FRK00000', nama:'Non'},
    {kode:'FRK00001', nama:'Anafilaksis'},
    {kode:'FRK00002', nama:'Analgesik'},
    {kode:'FRK00003', nama:'Analgesik, Antipiretik'},
    {kode:'FRK00004', nama:'Analgesik, Antipiretik, Antiinflamasi Nonsteroid'},
    {kode:'FRK00005', nama:'Anemia'},
    {kode:'FRK00006', nama:'Anestetik'},
    {kode:'FRK00007', nama:'Antialergi'},
    {kode:'FRK00008', nama:'Antibiotik'},
    {kode:'FRK00009', nama:'Antidiabetik Oral'},
    {kode:'FRK00010', nama:'Analgesik Opioid'},
    {kode:'FRK00011', nama:'Antasida'},
    {kode:'FRK00012', nama:'Antidepresan'},
    {kode:'FRK00013', nama:'Antidiare'},
    {kode:'FRK00014', nama:'Antiemetik'},
    {kode:'FRK00015', nama:'Antifungal (Antijamur)'},
    {kode:'FRK00016', nama:'Antihipertensi'},
    {kode:'FRK00017', nama:'Antihistamin'},
    {kode:'FRK00018', nama:'Antiinflamasi'},
    {kode:'FRK00019', nama:'Antijamur Topikal'},
    {kode:'FRK00020', nama:'Antikoagulan'},
    {kode:'FRK00021', nama:'Antikonvulsan'},
    {kode:'FRK00022', nama:'Antimalaria'},
    {kode:'FRK00023', nama:'Antimigrain'},
    {kode:'FRK00024', nama:'Antiparkinson'},
    {kode:'FRK00025', nama:'Antipsikotik'},
    {kode:'FRK00026', nama:'Antiseptik & Disinfektan'},
    {kode:'FRK00027', nama:'Antiseptik Kulit'},
    {kode:'FRK00028', nama:'Antituberkulosis'},
    {kode:'FRK00029', nama:'Antitusif'},
    {kode:'FRK00030', nama:'Antivirus'},
    {kode:'FRK00031', nama:'Anxiolitik'},
    {kode:'FRK00032', nama:'Bronkodilator'},
    {kode:'FRK00033', nama:'Diuretik'},
    {kode:'FRK00034', nama:'Ekspektoran'},
    {kode:'FRK00035', nama:'Elektrolit & Cairan'},
    {kode:'FRK00036', nama:'Gangguan Tiroid'},
    {kode:'FRK00037', nama:'Gastrointestinal'},
    {kode:'FRK00038', nama:'Hematologi'},
    {kode:'FRK00039', nama:'Hepatoprotektor'},
    {kode:'FRK00040', nama:'Hipnotik & Sedatif'},
    {kode:'FRK00041', nama:'Hipolipidemik'},
    {kode:'FRK00042', nama:'Hormon & Endokrin'},
    {kode:'FRK00043', nama:'Imunosupresan'},
    {kode:'FRK00044', nama:'Kardiovaskular'},
    {kode:'FRK00045', nama:'Kemoterapi'},
    {kode:'FRK00046', nama:'Kesehatan Gigi & Mulut'},
    {kode:'FRK00047', nama:'Kontrasepsi'},
    {kode:'FRK00048', nama:'Kortikosteroid'},
    {kode:'FRK00049', nama:'Laksatif'},
    {kode:'FRK00050', nama:'Mukolitik'},
    {kode:'FRK00051', nama:'Muskuloskeletal'},
    {kode:'FRK00052', nama:'Nefrologi'},
    {kode:'FRK00053', nama:'Neurologi'},
    {kode:'FRK00054', nama:'Nutrisi & Suplemen'},
    {kode:'FRK00055', nama:'Obat Batuk'},
    {kode:'FRK00056', nama:'Obat Flu'},
    {kode:'FRK00057', nama:'Oftalmologi'},
    {kode:'FRK00058', nama:'Opioid'},
    {kode:'FRK00059', nama:'Osteoporosis'},
    {kode:'FRK00060', nama:'Otologi'},
    {kode:'FRK00061', nama:'Penyakit Jantung Koroner'},
    {kode:'FRK00062', nama:'Perawatan Kulit'},
    {kode:'FRK00063', nama:'Psikiatri'},
    {kode:'FRK00064', nama:'Relaksan Otot'},
    {kode:'FRK00065', nama:'Respirasi'},
    {kode:'FRK00066', nama:'Sistem Saraf Pusat'},
    {kode:'FRK00067', nama:'Stroke'},
    {kode:'FRK00068', nama:'Trombolitik'},
    {kode:'FRK00069', nama:'Urologi'},
    {kode:'FRK00070', nama:'Vaksin & Imunisasi'},
    {kode:'FRK00071', nama:'Vertigo'},
    {kode:'FRK00072', nama:'Vitamin & Mineral'},
    {kode:'FRK00073', nama:'Vitamin A'},
    {kode:'FRK00074', nama:'Vitamin B Complex'},
    {kode:'FRK00075', nama:'Vitamin C'},
    {kode:'FRK00076', nama:'Vitamin D'},
    {kode:'FRK00077', nama:'Vitamin E'},
    {kode:'FRK00078', nama:'Vitamin K'},
    {kode:'FRK00079', nama:'Zat Besi (Suplemen)'},
  ],

  /* Sub-Farmakoterapi (Persediaan Barang > Master & Setting >
     Sub-Farmakoterapi, page:'subFarmakoterapi'), sesuai 2
     screenshot MASERP "Master Sub-Farmakoterapi" (Total Record:
     150, page-size 20 default + Pencarian Global, pager
     First/Previous/1..7/Next/Last) yang dikirim user 2026-08-21.
     Pola & keputusan data SAMA dengan Zat Kandungan Aktif &
     Farmakoterapi: field khas farmasi, nama sub-kelas terapi
     adalah terminologi farmakologi standar, dibangun apa adanya.

     CATATAN PERBAIKAN vs screenshot: header kolom asli di
     screenshot MASERP tertulis "Kode Zat Kandungan Aktif"/"Nama
     Zat Kandungan Aktif" — ini bug label copy-paste di sistem
     asli (isinya jelas data Sub-Farmakoterapi berkode SFK, bukan
     KZA). Di mockup ini header diperbaiki jadi "Kode/Nama
     Sub-Farmakoterapi" karena ini typo UI, bukan data — beda
     kasus dengan kode legacy ANTASIDADOENSLF/COTRIM400-80 di Zat
     Kandungan Aktif yang memang bagian dari DATA asli (dipertahankan
     apa adanya), sedangkan ini cuma label kolom yang salah ketik.

     TIDAK ADA downsize volume — Total Record: 150 dipertahankan
     utuh: 20 baris PALING ATAS PERSIS sesuai screenshot
     (SFK00000-SFK00019, termasuk urutan nama yang TIDAK strict
     alfabetis persis seperti screenshot asli — mis. "Neuromyalgics"
     di SFK00006 nyempil di antara nama-nama "Analgesik...", direproduksi
     apa adanya bukan disortir ulang), 130 baris sisanya nama
     sub-kelas farmakologi generik lain (mekanisme/golongan obat,
     mis. "Inhibitor Pompa Proton (PPI)", "Antagonis Reseptor
     Muskarinik" dst.) menyambung penomoran SFK00020-SFK00149.
     Page-size default 20 (beda dari Zat Kandungan Aktif/
     Farmakoterapi yang default 10) — opsi dropdown 10/20/50 sesuai
     nilai "20" yang terlihat aktif di screenshot. 150÷20=8 halaman,
     window pager tampil "1..7"+Next di halaman 1 — persis
     screenshot. Reuse windowed pager & real column-sort pattern. */
  subFarmakoterapi:[
    {kode:'SFK00000', nama:'Non'},
    {kode:'SFK00001', nama:'ACE Inhibitors'},
    {kode:'SFK00002', nama:'Alkohol'},
    {kode:'SFK00003', nama:'Aminoglikosida'},
    {kode:'SFK00004', nama:'Anafilaksis'},
    {kode:'SFK00005', nama:'Analgesik Non Narkotik, Antipiretik'},
    {kode:'SFK00006', nama:'Neuromyalgics'},
    {kode:'SFK00007', nama:'Analgesik Non Opioid'},
    {kode:'SFK00008', nama:'Analgesik Non Opioid dan Antialergi'},
    {kode:'SFK00009', nama:'Analgesik Opioid'},
    {kode:'SFK00010', nama:'Analgesik Topikal'},
    {kode:'SFK00011', nama:'Analgesik, Antipiretik, Antiinflamasi Nonsteroid'},
    {kode:'SFK00012', nama:'Anemia Defisiensi Zat Besi'},
    {kode:'SFK00013', nama:'Anestesi Barbiturat'},
    {kode:'SFK00014', nama:'Anestesik Umum'},
    {kode:'SFK00015', nama:'Anestetik Lokal'},
    {kode:'SFK00016', nama:'Antagonis 5-HT3'},
    {kode:'SFK00017', nama:'Antagonis Kalsium'},
    {kode:'SFK00018', nama:'Antagonis Reseptor Angiotensin II'},
    {kode:'SFK00019', nama:'Antagonis Reseptor H2'},
    {kode:'SFK00020', nama:'Agonis Adrenergik Alfa'},
    {kode:'SFK00021', nama:'Agonis Adrenergik Beta'},
    {kode:'SFK00022', nama:'Antagonis Adrenergik Beta (Beta Blocker)'},
    {kode:'SFK00023', nama:'Inhibitor Pompa Proton (PPI)'},
    {kode:'SFK00024', nama:'Inhibitor Reuptake Serotonin (SSRI)'},
    {kode:'SFK00025', nama:'Inhibitor Reuptake Serotonin-Norepinefrin (SNRI)'},
    {kode:'SFK00026', nama:'Inhibitor Monoamine Oksidase (MAOI)'},
    {kode:'SFK00027', nama:'Inhibitor HMG-CoA Reduktase (Statin)'},
    {kode:'SFK00028', nama:'Inhibitor Alfa-Glukosidase'},
    {kode:'SFK00029', nama:'Inhibitor DPP-4'},
    {kode:'SFK00030', nama:'Inhibitor SGLT2'},
    {kode:'SFK00031', nama:'Inhibitor Beta-Laktamase'},
    {kode:'SFK00032', nama:'Antagonis Reseptor Histamin H1'},
    {kode:'SFK00033', nama:'Antagonis Reseptor Muskarinik'},
    {kode:'SFK00034', nama:'Antagonis Reseptor Opioid'},
    {kode:'SFK00035', nama:'Antagonis Reseptor Dopamin'},
    {kode:'SFK00036', nama:'Antagonis Reseptor Serotonin'},
    {kode:'SFK00037', nama:'Antagonis Reseptor Leukotrien'},
    {kode:'SFK00038', nama:'Agonis Reseptor GABA'},
    {kode:'SFK00039', nama:'Agonis Reseptor Opioid'},
    {kode:'SFK00040', nama:'Agonis Reseptor Dopamin'},
    {kode:'SFK00041', nama:'Agonis Reseptor Beta-2 (Bronkodilator)'},
    {kode:'SFK00042', nama:'Diuretik Loop'},
    {kode:'SFK00043', nama:'Diuretik Tiazid'},
    {kode:'SFK00044', nama:'Diuretik Hemat Kalium'},
    {kode:'SFK00045', nama:'Diuretik Osmotik'},
    {kode:'SFK00046', nama:'Antikoagulan Oral (Warfarin)'},
    {kode:'SFK00047', nama:'Antikoagulan Heparin'},
    {kode:'SFK00048', nama:'Antiplatelet'},
    {kode:'SFK00049', nama:'Antikonvulsan Golongan Barbiturat'},
    {kode:'SFK00050', nama:'Antikonvulsan Golongan Benzodiazepin'},
    {kode:'SFK00051', nama:'Antibiotik Golongan Penisilin'},
    {kode:'SFK00052', nama:'Antibiotik Golongan Sefalosporin'},
    {kode:'SFK00053', nama:'Antibiotik Golongan Makrolida'},
    {kode:'SFK00054', nama:'Antibiotik Golongan Fluorokuinolon'},
    {kode:'SFK00055', nama:'Antibiotik Golongan Tetrasiklin'},
    {kode:'SFK00056', nama:'Antijamur Golongan Azol'},
    {kode:'SFK00057', nama:'Antijamur Golongan Polien'},
    {kode:'SFK00058', nama:'Antivirus Golongan Nukleosida'},
    {kode:'SFK00059', nama:'Antivirus Antiretroviral'},
    {kode:'SFK00060', nama:'Kortikosteroid Sistemik'},
    {kode:'SFK00061', nama:'Kortikosteroid Topikal'},
    {kode:'SFK00062', nama:'Kortikosteroid Inhalasi'},
    {kode:'SFK00063', nama:'Mukolitik'},
    {kode:'SFK00064', nama:'Ekspektoran'},
    {kode:'SFK00065', nama:'Antitusif Golongan Opioid'},
    {kode:'SFK00066', nama:'Antitusif Non-Opioid'},
    {kode:'SFK00067', nama:'Laksatif Stimulan'},
    {kode:'SFK00068', nama:'Laksatif Osmotik'},
    {kode:'SFK00069', nama:'Laksatif Pembentuk Massa'},
    {kode:'SFK00070', nama:'Antasida Golongan Aluminium'},
    {kode:'SFK00071', nama:'Antasida Golongan Magnesium'},
    {kode:'SFK00072', nama:'Sitoprotektif Lambung'},
    {kode:'SFK00073', nama:'Antiemetik Antagonis Dopamin'},
    {kode:'SFK00074', nama:'Antiemetik Antagonis Serotonin'},
    {kode:'SFK00075', nama:'Vitamin Larut Lemak'},
    {kode:'SFK00076', nama:'Vitamin Larut Air'},
    {kode:'SFK00077', nama:'Mineral Trace Element'},
    {kode:'SFK00078', nama:'Elektrolit Kalium'},
    {kode:'SFK00079', nama:'Elektrolit Natrium'},
    {kode:'SFK00080', nama:'Elektrolit Kalsium'},
    {kode:'SFK00081', nama:'Elektrolit Magnesium'},
    {kode:'SFK00082', nama:'Hormon Tiroid'},
    {kode:'SFK00083', nama:'Antitiroid'},
    {kode:'SFK00084', nama:'Hormon Kortikosteroid Adrenal'},
    {kode:'SFK00085', nama:'Hormon Reproduksi Estrogen'},
    {kode:'SFK00086', nama:'Hormon Reproduksi Progesteron'},
    {kode:'SFK00087', nama:'Insulin Kerja Cepat'},
    {kode:'SFK00088', nama:'Insulin Kerja Menengah'},
    {kode:'SFK00089', nama:'Insulin Kerja Panjang'},
    {kode:'SFK00090', nama:'Antidiabetik Golongan Sulfonilurea'},
    {kode:'SFK00091', nama:'Antidiabetik Golongan Biguanid'},
    {kode:'SFK00092', nama:'Antidiabetik Golongan Thiazolidinedione'},
    {kode:'SFK00093', nama:'Imunosupresan Golongan Kalsineurin Inhibitor'},
    {kode:'SFK00094', nama:'Imunosupresan Golongan Antimetabolit'},
    {kode:'SFK00095', nama:'Sitostatika Alkilator'},
    {kode:'SFK00096', nama:'Sitostatika Antimetabolit'},
    {kode:'SFK00097', nama:'Sitostatika Antibiotik'},
    {kode:'SFK00098', nama:'Relaksan Otot Depolarisasi'},
    {kode:'SFK00099', nama:'Relaksan Otot Non-Depolarisasi'},
    {kode:'SFK00100', nama:'Anestesi Inhalasi'},
    {kode:'SFK00101', nama:'Anestesi Intravena'},
    {kode:'SFK00102', nama:'Analgesik Antipiretik'},
    {kode:'SFK00103', nama:'Analgesik Adjuvant'},
    {kode:'SFK00104', nama:'Antihistamin Generasi Pertama'},
    {kode:'SFK00105', nama:'Antihistamin Generasi Kedua'},
    {kode:'SFK00106', nama:'Bronkodilator Antikolinergik'},
    {kode:'SFK00107', nama:'Bronkodilator Metilxantin'},
    {kode:'SFK00108', nama:'Antiseptik Golongan Alkohol'},
    {kode:'SFK00109', nama:'Antiseptik Golongan Halogen'},
    {kode:'SFK00110', nama:'Disinfektan Golongan Aldehid'},
    {kode:'SFK00111', nama:'Suplemen Zat Besi'},
    {kode:'SFK00112', nama:'Suplemen Kalsium'},
    {kode:'SFK00113', nama:'Suplemen Asam Folat'},
    {kode:'SFK00114', nama:'Antihipertensi Golongan ARB'},
    {kode:'SFK00115', nama:'Antihipertensi Golongan CCB'},
    {kode:'SFK00116', nama:'Antihipertensi Golongan Diuretik'},
    {kode:'SFK00117', nama:'Antihipertensi Golongan Vasodilator'},
    {kode:'SFK00118', nama:'Trombolitik Golongan Aktivator Plasminogen'},
    {kode:'SFK00119', nama:'Antikoagulan Golongan DOAC'},
    {kode:'SFK00120', nama:'Vaksin Hidup Dilemahkan'},
    {kode:'SFK00121', nama:'Vaksin Inaktif'},
    {kode:'SFK00122', nama:'Vaksin Subunit'},
    {kode:'SFK00123', nama:'Analgesik Topikal NSAID'},
    {kode:'SFK00124', nama:'Analgesik Topikal Kapsaisin'},
    {kode:'SFK00125', nama:'Antivertigo'},
    {kode:'SFK00126', nama:'Nootropik'},
    {kode:'SFK00127', nama:'Neuroprotektif'},
    {kode:'SFK00128', nama:'Antipsikotik Tipikal'},
    {kode:'SFK00129', nama:'Antipsikotik Atipikal'},
    {kode:'SFK00130', nama:'Antidepresan Trisiklik'},
    {kode:'SFK00131', nama:'Antidepresan SSRI'},
    {kode:'SFK00132', nama:'Antidepresan SNRI'},
    {kode:'SFK00133', nama:'Ansiolitik Golongan Benzodiazepin'},
    {kode:'SFK00134', nama:'Ansiolitik Non-Benzodiazepin'},
    {kode:'SFK00135', nama:'Hipnotik Golongan Benzodiazepin'},
    {kode:'SFK00136', nama:'Hipnotik Non-Benzodiazepin (Z-drugs)'},
    {kode:'SFK00137', nama:'Antiparkinson Golongan Dopaminergik'},
    {kode:'SFK00138', nama:'Antiparkinson Golongan Antikolinergik'},
    {kode:'SFK00139', nama:'Obat Migrain Golongan Triptan'},
    {kode:'SFK00140', nama:'Obat Osteoporosis Golongan Bifosfonat'},
    {kode:'SFK00141', nama:'Suplemen Probiotik'},
    {kode:'SFK00142', nama:'Enzim Pencernaan'},
    {kode:'SFK00143', nama:'Antidiare Adsorben'},
    {kode:'SFK00144', nama:'Antidiare Antimotilitas'},
    {kode:'SFK00145', nama:'Pencahar (Laksatif) Lubrikan'},
    {kode:'SFK00146', nama:'Analgesik Non-Steroid Selektif COX-2'},
    {kode:'SFK00147', nama:'Antikoagulan Antagonis Vitamin K'},
    {kode:'SFK00148', nama:'Bronkodilator Kombinasi'},
    {kode:'SFK00149', nama:'Antibiotik Golongan Karbapenem'},
  ],

  /* Daftar Kategory Reordering Sheet (Persediaan Barang > Master
     & Setting > Daftar Kategory Reordering Sheet, page:
     'kategoriReorderingSheet'), sesuai screenshot MASERP "Daftar
     Kategory Reordering Sheet" yang dikirim user 2026-08-21
     (Total Record: 7, kolom Kode/Nama Kategori Reordering Sheet
     dengan ikon sort + Grup Penjualan, tanpa Pencarian Global/
     page-size besar karena datanya kecil). Field ini KHAS
     regulasi distribusi farmasi (ALKES=Alat Kesehatan, BBS=Bahan
     Baku Sediaan/Non Obat-Non Alkes, OOT=Obat Wajib Apotek/Obat
     Tertentu, PRE=Prekursor, PSI=Psikotropik) — kategori
     PENGAWASAN REGULATORI, bukan kategori produk FMCG biasa —
     jadi mengikuti keputusan user yang sama (dikonfirmasi lewat
     AskUserQuestion sebelumnya untuk Zat Kandungan Aktif dkk.):
     dibangun APA ADANYA karena ini singkatan regulasi standar
     industri farmasi (istilah BPOM), bukan data rahasia
     perusahaan demo lain.

     CATATAN PENTING — TIDAK terhubung ke filter "Kat. Reordering
     Sheet" di form modul Reordering Sheet (`openRosKategoriPicker()`
     di reordering-sheet.js): filter itu SUDAH fungsional nyata
     memakai kode kategori FMCG (CATSMB/CATBHB/dst.) yang benar-
     benar ada di `DATA.persediaan`/`DATA.kategoriBarang` — kode
     regulatori ALKES/BBS/NON/ODP/OOT/PRE/PSI di master INI tidak
     overlap sama sekali dengan kode itu, dan tidak ada barang di
     `DATA.persediaan` yang punya kategori regulatori ini. Menyambungkan
     keduanya butuh menambah field kategori-regulatori baru ke tiap
     barang persediaan yang di luar cakupan permintaan sesi ini —
     jadi master ini SENGAJA dibangun independen/berdiri sendiri
     (bukan bug, konsisten dengan banyak master lain di mockup ini
     yang belum punya konsumen lintas-modul, mis. Group Produk).
     Kolom "Grup Penjualan" disimpan sebagai teks bebas (bukan
     picker ke master lain — tidak ada master "Grup Penjualan"
     terpisah di mockup ini), persis apa adanya dari screenshot. */
  kategoriReorderingSheet:[
    {kode:'ALKES', nama:'ALAT KESEHATAN', grupPenjualan:'GROUP ALKES'},
    {kode:'BBS', nama:'NON OBAT - NON ALKES', grupPenjualan:'GROUP NON-OBAT NON-ALKES'},
    {kode:'NON', nama:'NON REORDERING SHEET', grupPenjualan:'GROUP NON REORDERING SHEET'},
    {kode:'ODP', nama:'OBAT DILUAR PPOT', grupPenjualan:'GROUP OBAT DILUAR PPOT'},
    {kode:'OOT', nama:'OBAT OBAT TERTENTU', grupPenjualan:'GROUP OOT'},
    {kode:'PRE', nama:'PREKURSOR', grupPenjualan:'GROUP PREKURSOR'},
    {kode:'PSI', nama:'OBAT PSIKOTROPIK', grupPenjualan:'GROUP PSIKOTROPIK'},
  ],

  /* Group Produk (Persediaan Barang > Master & Setting > Group
     Produk, page:'groupProduk'), sesuai screenshot MASERP
     "Daftar Group Produk" yang dikirim user 2026-08-21 (Total
     Record: 1 — dataset sekecil ini dipertahankan apa adanya,
     tidak perlu didownsize/diperbanyak). CRUD sederhana pola
     Master Divisi (3 field: Kode/Nama/Keterangan, tanpa sub-grid
     atau kalkulasi). BEDA dari Zat Kandungan Aktif/Farmakoterapi/
     Sub-Farmakoterapi/Bentuk Sediaan: 1 baris contoh di screenshot
     asli ("DANPAC"/"DANPAC GROUP PRODUCT") terlihat seperti kode
     internal SPESIFIK milik instalasi demo lain (mirip nama
     brand/principal tertentu, BUKAN istilah farmakologi standar
     seperti nama zat aktif/kelas terapi/bentuk sediaan) — jadi
     diperlakukan sebagai data yang perlu diganti (konsisten
     dengan konvensi umum proyek ini: ganti data spesifik
     perusahaan demo lain dengan data DBM sendiri), bukan
     dipertahankan apa adanya. Diganti dengan 1 baris contoh
     relevan untuk bisnis DBM (distributor sembako/FMCG). */
  groupProduk:[
    {kode:'SMBK01', nama:'KELOMPOK PRODUK SEMBAKO UTAMA', keterangan:''},
  ],

  /* Satuan (Persediaan Barang > Master & Setting > Satuan,
     page:'satuan'), sesuai screenshot MASERP "Daftar Satuan"
     yang dikirim user 2026-08-27 (Total Record: 15, kolom Kode
     Satuan/Nama Satuan dengan ikon sort di kedua header,
     page-size 10 default, pager First/Previous/1/2/Next/Last).
     CRUD sederhana pola Group Produk/Zat Kandungan Aktif — kode
     MANUAL (bukan auto-generate, karena kode aslinya singkatan
     bermakna seperti "BOX"/"BTL", bukan nomor urut), wajib unik,
     readonly di mode Ubah.

     10 baris PALING ATAS persis screenshot (AMP/BKS/BOX/BTL/
     KRT/M/MBX/PAC/PCH/PCS — nama satuan generik universal ERP,
     bukan data rahasia perusahaan demo lain, status sama seperti
     nama laporan Report Center/nama Zat Kandungan Aktif yang
     juga dipertahankan apa adanya). +5 baris tambahan (DUS/KRG/
     KLG/LSN/RIM) supaya Total Record 15 sesuai screenshot,
     SEKALIGUS SENGAJA dipilih supaya Nama Satuan-nya mencakup
     LIMA nilai `satuan`/`satuanDetail[...].satuan` yang SUDAH
     DIPAKAI di seluruh `DATA.items` sejak awal mockup ini (Dus/
     Karung/Kaleng/Botol/Pcs) — supaya begitu field "Satuan" di
     form Master Barang diubah dari input teks bebas jadi
     dropdown ke master ini (lihat persediaan-barang.template.js/
     .js), ke-10 baris sample barang yang sudah ada tetap
     menampilkan pilihan yang benar ter-select saat dibuka Ubah,
     bukan jatuh ke opsi kosong/tidak match.

     Nama Satuan baris BTL & PCS SEDIKIT DISESUAIKAN dari huruf
     besar semua di screenshot ("BTL"/"PCS") jadi "Botol"/"Pcs" —
     BUKAN salah ketik, melainkan penyesuaian sengaja supaya
     persis sama dengan string yang SUDAH ADA di `DATA.items`
     (mis. `satuan:'Dus'`, `satuanDetail.um2.satuan:'Botol'`)
     sehingga dropdown baru ini match dengan data existing tanpa
     perlu mengedit satu pun baris `DATA.items` yang sudah ada
     (konsisten prinsip "1 sumber kebenaran, tidak ada data
     redundan yang bisa saling berbeda" yang dipakai banyak modul
     lain di mockup ini, mis. Rumus Penyusutan Aktiva Tetap). */
  satuan:[
    {kode:'AMP', nama:'AMP'},
    {kode:'BKS', nama:'BKS'},
    {kode:'BOX', nama:'BOX'},
    {kode:'BTL', nama:'Botol'},
    {kode:'KRT', nama:'KRT'},
    {kode:'M', nama:'meter'},
    {kode:'MBX', nama:'MED BOX'},
    {kode:'PAC', nama:'PAC'},
    {kode:'PCH', nama:'PCH'},
    {kode:'PCS', nama:'Pcs'},
    {kode:'DUS', nama:'Dus'},
    {kode:'KRG', nama:'Karung'},
    {kode:'KLG', nama:'Kaleng'},
    {kode:'LSN', nama:'Lusin'},
    {kode:'RIM', nama:'Rim'},
  ],

  /* Bentuk Sediaan (Persediaan Barang > Master & Setting > Bentuk
     Sediaan, page:'bentukSediaan'), sesuai screenshot MASERP
     "Daftar Bentuk Sediaan" yang dikirim user 2026-08-21 (Total
     Record: 80, kolom Kode/Nama Bentuk Sediaan dengan ikon sort
     di kedua header, page-size 25 default + Pencarian Global,
     pager First/Previous/1-4/Next/Last). Field KEEMPAT & TERAKHIR
     dari grup field khas farmasi yang keputusan datanya sudah
     dikonfirmasi user sebelumnya lewat `AskUserQuestion` (lihat
     komentar di atas array `zatKandunganAktif`) — tidak ditanya
     ulang. "Bentuk Sediaan" (dosage form: Tablet/Kapsul/Sirup/
     Injeksi dst.) adalah terminologi farmasi UNIVERSAL/generik,
     bukan data rahasia perusahaan demo lain, jadi dibangun apa
     adanya.

     TIDAK ADA downsize volume (sama seperti Farmakoterapi/Sub-
     Farmakoterapi) — Total Record: 80 pada screenshot asli sudah
     sewajarnya dipertahankan utuh. Kode 3-digit `SED000`-`SED079`
     (BEDA dari `KZA`/`FRK`/`SFK` yang 5-digit) — mengikuti persis
     lebar digit yang terlihat di screenshot. 25 baris PALING ATAS
     PERSIS sesuai screenshot (`SED000`-`SED024`), 55 baris sisanya
     nama bentuk sediaan farmasi generik lain diurutkan alfabetis
     menyambung penomoran kode berurutan (pola sama seperti
     Farmakoterapi/Sub-Farmakoterapi). Page-size default 25 (opsi
     dropdown 10/25/50) sesuai nilai "25" aktif di screenshot.
     80÷25=4 halaman — reuse pager windowed & sort kolom SUNGGUHAN
     fungsional dari Zat Kandungan Aktif (redundan di sini karena
     4 halaman muat penuh di jendela 7, tapi kode dibiarkan generik
     sama seperti modul saudaranya untuk konsistensi). */
  bentukSediaan:[
    {kode:'SED000', nama:'Non'},
    {kode:'SED001', nama:'Bedak / Talk'},
    {kode:'SED002', nama:'Cairan'},
    {kode:'SED003', nama:'Compress'},
    {kode:'SED004', nama:'Cassette'},
    {kode:'SED005', nama:'Drops'},
    {kode:'SED006', nama:'Eliksir'},
    {kode:'SED007', nama:'Emulsi'},
    {kode:'SED008', nama:'Gel'},
    {kode:'SED009', nama:'Granul'},
    {kode:'SED010', nama:'Implan'},
    {kode:'SED011', nama:'Infus'},
    {kode:'SED012', nama:'Inhalasi'},
    {kode:'SED013', nama:'IUD'},
    {kode:'SED014', nama:'Injeksi'},
    {kode:'SED015', nama:'Kaplet'},
    {kode:'SED016', nama:'Kaplet Salut Selaput'},
    {kode:'SED017', nama:'Kaplet Salut Enterik'},
    {kode:'SED018', nama:'Kapsul'},
    {kode:'SED019', nama:'Kapsul Lunak'},
    {kode:'SED020', nama:'Kondom'},
    {kode:'SED021', nama:'Krim'},
    {kode:'SED022', nama:'Krim Steril'},
    {kode:'SED023', nama:'Lotion'},
    {kode:'SED024', nama:'Midstream'},
    {kode:'SED025', nama:'Aerosol'},
    {kode:'SED026', nama:'Balsem'},
    {kode:'SED027', nama:'Bubuk'},
    {kode:'SED028', nama:'Effervescent'},
    {kode:'SED029', nama:'Enema'},
    {kode:'SED030', nama:'Film Strip'},
    {kode:'SED031', nama:'Gargle'},
    {kode:'SED032', nama:'Gauze / Kasa'},
    {kode:'SED033', nama:'Hair Tonic'},
    {kode:'SED034', nama:'Jelly'},
    {kode:'SED035', nama:'Kertas Tempel'},
    {kode:'SED036', nama:'Larutan'},
    {kode:'SED037', nama:'Minyak Angin'},
    {kode:'SED038', nama:'Minyak Gosok'},
    {kode:'SED039', nama:'Nebulizer'},
    {kode:'SED040', nama:'Obat Kumur'},
    {kode:'SED041', nama:'Oral Gel'},
    {kode:'SED042', nama:'Ovula'},
    {kode:'SED043', nama:'Pasta Gigi'},
    {kode:'SED044', nama:'Patch'},
    {kode:'SED045', nama:'Pen Insulin'},
    {kode:'SED046', nama:'Pessary'},
    {kode:'SED047', nama:'Pil'},
    {kode:'SED048', nama:'Plester'},
    {kode:'SED049', nama:'Sabun Antiseptik'},
    {kode:'SED050', nama:'Salep'},
    {kode:'SED051', nama:'Salep Mata'},
    {kode:'SED052', nama:'Serbuk'},
    {kode:'SED053', nama:'Serbuk Effervescent'},
    {kode:'SED054', nama:'Shampoo'},
    {kode:'SED055', nama:'Sirup'},
    {kode:'SED056', nama:'Sirup Kering'},
    {kode:'SED057', nama:'Spray'},
    {kode:'SED058', nama:'Spray Hidung'},
    {kode:'SED059', nama:'Strip Test'},
    {kode:'SED060', nama:'Suntik'},
    {kode:'SED061', nama:'Suppositoria'},
    {kode:'SED062', nama:'Suspensi'},
    {kode:'SED063', nama:'Tablet'},
    {kode:'SED064', nama:'Tablet Effervescent'},
    {kode:'SED065', nama:'Tablet Hisap'},
    {kode:'SED066', nama:'Tablet Kunyah'},
    {kode:'SED067', nama:'Tablet Lepas Lambat'},
    {kode:'SED068', nama:'Tablet Salut Enterik'},
    {kode:'SED069', nama:'Tablet Salut Gula'},
    {kode:'SED070', nama:'Tablet Sublingual'},
    {kode:'SED071', nama:'Tampon'},
    {kode:'SED072', nama:'Tetes Hidung'},
    {kode:'SED073', nama:'Tetes Mata'},
    {kode:'SED074', nama:'Tetes Telinga'},
    {kode:'SED075', nama:'Tincture'},
    {kode:'SED076', nama:'Tisu Antiseptik'},
    {kode:'SED077', nama:'Transdermal Patch'},
    {kode:'SED078', nama:'Vaginal Cream'},
    {kode:'SED079', nama:'Vaginal Gel'},
  ],



  /* Master Gudang (Persediaan Barang > Master & Setting > Gudang), sesuai
     2 screenshot MASERP "Daftar Gudang" (list) & "Gudang" (form Tambah) yang
     dikirim user 2026-08-12. 29 baris data sample tersebar di 8 cabang DBM
     yang sama (Head Office/Surabaya/Bandung/Tangerang/Medan/Makassar/
     Semarang/Sidoarjo — lihat GDG_CABANG_LIST di gudang.template.js), setiap
     cabang punya 2-6 gudang. Kode gudang format `<NN>-GUU`[-`<seq>`] — angka
     cabang NN SENGAJA memakai mapping yang SAMA PERSIS dengan
     PKL_GUDANG_BY_CABANG (Picking List) & INV_GUDANG_BY_CABANG (Invoice):
     Head Office=00, Surabaya=01, Bandung=02, Tangerang=03, Medan=04,
     Makassar=05, Semarang=06, Sidoarjo=07 — supaya kode gudang di 3 modul ini
     (Picking List/Invoice/Gudang) konsisten & tidak kontradiktif; screenshot
     asli "Daftar Gudang" MASERP kebetulan memakai mapping 01=Sidoarjo/
     02=Semarang/03=Tangerang yang BEDA dari yang sudah dibangun duluan di
     Picking List — mapping screenshot itu SENGAJA DIABAIKAN demi konsistensi
     dengan 2 modul yang sudah ada, bukan salah ketik. Hanya baris pertama
     (00-GUU, Head Office) yang `default:true` (asumsi wajar: 1 gudang default
     untuk seluruh perusahaan, bukan per-cabang). Field `keterangan` "Keeping
     Stock" tersebar di beberapa baris non-utama per cabang, mengikuti pola di
     screenshot (00-GUU-02, 02-GUU-02, 03-GUU-03, dst juga "Keeping Stock").
     Field checkbox lain (gudangTransit/nearED/reject/gudangCadangan/
     konsinyasi) & hariPeringatan (number, hanya relevan kalau gudangCadangan
     true) semuanya default false/null di data sample karena screenshot tidak
     menunjukkan contoh gudang dengan flag-flag ini aktif — form-nya tetap
     fungsional kalau user mau centang salah satu saat Tambah/Ubah. */
  gudang:[
    {kode:'00-GUU', nama:'Gudang Utama-HO', kepalaGudang:'', keterangan:'', default:true, cabang:'Head Office', gudangTransit:false, nearED:false, reject:false, gudangCadangan:false, hariPeringatan:null, konsinyasi:false},
    {kode:'00-GUU-02', nama:'Gudang Utama-HO 2', kepalaGudang:'', keterangan:'Keeping Stock', default:false, cabang:'Head Office', gudangTransit:false, nearED:false, reject:false, gudangCadangan:false, hariPeringatan:null, konsinyasi:false},
    {kode:'00-GUU-03', nama:'Gudang Utama-HO 3', kepalaGudang:'', keterangan:'', default:false, cabang:'Head Office', gudangTransit:false, nearED:false, reject:false, gudangCadangan:false, hariPeringatan:null, konsinyasi:false},
    {kode:'00-GUU-04', nama:'Gudang Utama-HO 4', kepalaGudang:'', keterangan:'', default:false, cabang:'Head Office', gudangTransit:false, nearED:false, reject:false, gudangCadangan:false, hariPeringatan:null, konsinyasi:false},
    {kode:'01-GUU', nama:'Gudang Utama-SBY', kepalaGudang:'', keterangan:'', default:false, cabang:'Surabaya', gudangTransit:false, nearED:false, reject:false, gudangCadangan:false, hariPeringatan:null, konsinyasi:false},
    {kode:'01-GUU-02', nama:'Gudang Utama-SBY 2', kepalaGudang:'', keterangan:'', default:false, cabang:'Surabaya', gudangTransit:false, nearED:false, reject:false, gudangCadangan:false, hariPeringatan:null, konsinyasi:false},
    {kode:'02-GUU', nama:'Gudang Utama-BDG', kepalaGudang:'', keterangan:'', default:false, cabang:'Bandung', gudangTransit:false, nearED:false, reject:false, gudangCadangan:false, hariPeringatan:null, konsinyasi:false},
    {kode:'02-GUU-02', nama:'Gudang Utama-BDG 2', kepalaGudang:'', keterangan:'Keeping Stock', default:false, cabang:'Bandung', gudangTransit:false, nearED:false, reject:false, gudangCadangan:false, hariPeringatan:null, konsinyasi:false},
    {kode:'02-GUU-03', nama:'Gudang Utama-BDG 3', kepalaGudang:'', keterangan:'', default:false, cabang:'Bandung', gudangTransit:false, nearED:false, reject:false, gudangCadangan:false, hariPeringatan:null, konsinyasi:false},
    {kode:'03-GUU', nama:'Gudang Utama-TGR', kepalaGudang:'', keterangan:'', default:false, cabang:'Tangerang', gudangTransit:false, nearED:false, reject:false, gudangCadangan:false, hariPeringatan:null, konsinyasi:false},
    {kode:'03-GUU-02', nama:'Gudang Utama-TGR 2', kepalaGudang:'', keterangan:'', default:false, cabang:'Tangerang', gudangTransit:false, nearED:false, reject:false, gudangCadangan:false, hariPeringatan:null, konsinyasi:false},
    {kode:'03-GUU-03', nama:'Gudang Utama-TGR 3', kepalaGudang:'', keterangan:'Keeping Stock', default:false, cabang:'Tangerang', gudangTransit:false, nearED:false, reject:false, gudangCadangan:false, hariPeringatan:null, konsinyasi:false},
    {kode:'03-GUU-04', nama:'Gudang Utama-TGR 4', kepalaGudang:'', keterangan:'', default:false, cabang:'Tangerang', gudangTransit:false, nearED:false, reject:false, gudangCadangan:false, hariPeringatan:null, konsinyasi:false},
    {kode:'04-GUU', nama:'Gudang Utama-MDN', kepalaGudang:'', keterangan:'', default:false, cabang:'Medan', gudangTransit:false, nearED:false, reject:false, gudangCadangan:false, hariPeringatan:null, konsinyasi:false},
    {kode:'04-GUU-02', nama:'Gudang Utama-MDN 2', kepalaGudang:'', keterangan:'Keeping Stock', default:false, cabang:'Medan', gudangTransit:false, nearED:false, reject:false, gudangCadangan:false, hariPeringatan:null, konsinyasi:false},
    {kode:'05-GUU', nama:'Gudang Utama-MKS', kepalaGudang:'', keterangan:'', default:false, cabang:'Makassar', gudangTransit:false, nearED:false, reject:false, gudangCadangan:false, hariPeringatan:null, konsinyasi:false},
    {kode:'05-GUU-02', nama:'Gudang Utama-MKS 2', kepalaGudang:'', keterangan:'', default:false, cabang:'Makassar', gudangTransit:false, nearED:false, reject:false, gudangCadangan:false, hariPeringatan:null, konsinyasi:false},
    {kode:'05-GUU-03', nama:'Gudang Utama-MKS 3', kepalaGudang:'', keterangan:'Keeping Stock', default:false, cabang:'Makassar', gudangTransit:false, nearED:false, reject:false, gudangCadangan:false, hariPeringatan:null, konsinyasi:false},
    {kode:'06-GUU', nama:'Gudang Utama-SMG', kepalaGudang:'', keterangan:'', default:false, cabang:'Semarang', gudangTransit:false, nearED:false, reject:false, gudangCadangan:false, hariPeringatan:null, konsinyasi:false},
    {kode:'06-GUU-02', nama:'Gudang Utama-SMG 2', kepalaGudang:'', keterangan:'', default:false, cabang:'Semarang', gudangTransit:false, nearED:false, reject:false, gudangCadangan:false, hariPeringatan:null, konsinyasi:false},
    {kode:'06-GUU-03', nama:'Gudang Utama-SMG 3', kepalaGudang:'', keterangan:'', default:false, cabang:'Semarang', gudangTransit:false, nearED:false, reject:false, gudangCadangan:false, hariPeringatan:null, konsinyasi:false},
    {kode:'06-GUU-04', nama:'Gudang Utama-SMG 4', kepalaGudang:'', keterangan:'Keeping Stock', default:false, cabang:'Semarang', gudangTransit:false, nearED:false, reject:false, gudangCadangan:false, hariPeringatan:null, konsinyasi:false},
    {kode:'06-GUU-05', nama:'Gudang Utama-SMG 5', kepalaGudang:'', keterangan:'', default:false, cabang:'Semarang', gudangTransit:false, nearED:false, reject:false, gudangCadangan:false, hariPeringatan:null, konsinyasi:false},
    {kode:'07-GUU', nama:'Gudang Utama-SDA', kepalaGudang:'', keterangan:'', default:false, cabang:'Sidoarjo', gudangTransit:false, nearED:false, reject:false, gudangCadangan:false, hariPeringatan:null, konsinyasi:false},
    {kode:'07-GUU-02', nama:'Gudang Utama-SDA 2', kepalaGudang:'', keterangan:'Keeping Stock', default:false, cabang:'Sidoarjo', gudangTransit:false, nearED:false, reject:false, gudangCadangan:false, hariPeringatan:null, konsinyasi:false},
    {kode:'07-GUU-03', nama:'Gudang Utama-SDA 3', kepalaGudang:'', keterangan:'', default:false, cabang:'Sidoarjo', gudangTransit:false, nearED:false, reject:false, gudangCadangan:false, hariPeringatan:null, konsinyasi:false},
    {kode:'07-GUU-04', nama:'Gudang Utama-SDA 4', kepalaGudang:'', keterangan:'', default:false, cabang:'Sidoarjo', gudangTransit:false, nearED:false, reject:false, gudangCadangan:false, hariPeringatan:null, konsinyasi:false},
    {kode:'07-GUU-05', nama:'Gudang Utama-SDA 5', kepalaGudang:'', keterangan:'', default:false, cabang:'Sidoarjo', gudangTransit:false, nearED:false, reject:false, gudangCadangan:false, hariPeringatan:null, konsinyasi:false},
    {kode:'07-GUU-06', nama:'Gudang Utama-SDA 6', kepalaGudang:'', keterangan:'', default:false, cabang:'Sidoarjo', gudangTransit:false, nearED:false, reject:false, gudangCadangan:false, hariPeringatan:null, konsinyasi:false},
  ],

  /* Opsi dropdown "Master Bank" di form Kas/Bank (Kas/Bank > Master &
     Setting > Kas/Bank) — 8 badan usaha/legal-entity dummy, satu per cabang
     DBM yang sama dipakai di seluruh mockup ini (lihat GDG_CABANG_LIST di
     gudang.template.js / PKL_CABANG_LIST di picking-list.template.js).
     Sekadar dropdown referensi statis, TIDAK ada logic cross-link ke modul
     lain — nilai yang dipilih cuma disimpan sebagai string di
     DATA.kasBank[].masterBank. */
  masterBankList:[
    'PT Distriversa Buanamas - Head Office',
    'PT Distriversa Buanamas - Surabaya',
    'PT Distriversa Buanamas - Bandung',
    'PT Distriversa Buanamas - Tangerang',
    'PT Distriversa Buanamas - Medan',
    'PT Distriversa Buanamas - Makassar',
    'PT Distriversa Buanamas - Semarang',
    'PT Distriversa Buanamas - Sidoarjo',
  ],

  /* Master Kas/Bank (Kas/Bank > Master & Setting > Kas/Bank), sesuai 2
     screenshot MASERP "Daftar Bank" (list) & "Master Bank" (form Tambah)
     yang dikirim user 2026-08-12. 29 baris data sample, 5 baris pertama
     (110101-110105) meniru PERSIS 5 baris contoh yang tampil di screenshot
     "Daftar Bank" (Kas Kecil HO/Kas Besar SDA/Kas Kecil SDA/Kas Bon HO/Kas
     Kecil SMG beserta saldo aslinya) — 24 baris sisanya (110106-110129)
     karangan tambahan supaya Total Record: 29 sesuai screenshot, tersebar di
     8 cabang DBM yang sama (trigram HO/SBY/BDG/TGR/MDN/MKS/SMG/SDA di-COPY
     dari PKL_CABANG_CODE, Picking List) dengan campuran tipeRekening Kas
     (nama "Kas Kecil/Kas Besar/Kas Bon <TRIGRAM>", tanpa Telepon/No.Rekening
     — meniru pola 5 baris contoh yang juga kosong di kolom itu) & Bank
     (nama bank riil Indonesia seperti Bank Mandiri/BCA/BNI/BRI/Danamon/
     Permata, LENGKAP Telepon/No.Rekening/Kontak Person). `kode` SENGAJA
     flat sequential 110101..110129 (BUKAN reset per cabang seperti kode
     Gudang) — kode Bank di-generate otomatis oleh sistem, lihat
     kbkNextKode() di js/pages/kas-bank.js. `mataUang` semua 'IDR' &
     `nonAktif`/`smartlink` semua false di data sample (kedua field ini
     cuma toggle di form, screenshot tidak menunjukkan contoh yang aktif). */
  /* =========================================================
     2026-08-28 — DATA BARU "currencies": Master Currency (Kas/Bank >
     Master & Setting > Currency, page:'currency' — sebelumnya
     placeholder murni). Sesuai 3 screenshot MASERP yang dikirim user:
     "Daftar Mata Uang" (4 baris CNY/IDR/SGD/USD — kode & nama mata
     uang generik internasional, bukan data spesifik instalasi lain,
     jadi direplikasi apa adanya) dan "Ubah Mata Uang" USD (2 tab:
     "Rincian Transaksi" berisi grid Periode Kurs, "Jurnal Mata Uang"
     berisi Setting Account Jurnal Selisih Kurs).
     - periodeKurs USD: 8 baris akhir-bulan Des 2025 s/d Jul 2026,
       nilai kurs mengikuti screenshot (kurs pasar publik, bukan data
       sensitif instalasi lain); CNY & SGD diberi 3 periode terakhir
       dengan kurs pasar yang wajar supaya semua mata uang asing punya
       contoh; IDR (mata uang dasar) tanpa periode kurs.
     - jurnal (Setting Account Jurnal Selisih Kurs): screenshot acuan
       memakai akun per-valas khusus (Piutang Usaha USD 110502 dst.)
       milik COA instalasi lain — TIDAK direplikasi; USD dipetakan ke
       akun DATA.akunGL DBM yang sudah ada (1120001/2110001/1140001/
       2140001/6010002/6510002 — persis akun yang dipakai
       DATA.jurnalPembelian/jurnalPenjualan utk selisih kurs), CNY/SGD
       sengaja dikosongkan (belum pernah dipakai transaksi, sekaligus
       mendemokan picker akun GL pada form). */
  currencies:[
    {kode:'CNY', nama:'Chinese Yuan', keterangan:'', nonAktif:false,
      periodeKurs:[
        {kursTarget:'IDR', tglAwal:'31/05/2026', tglAkhir:'31/05/2026', kursStd:2470, kursPajak:2470},
        {kursTarget:'IDR', tglAwal:'30/06/2026', tglAkhir:'30/06/2026', kursStd:2481, kursPajak:2481},
        {kursTarget:'IDR', tglAwal:'31/07/2026', tglAkhir:'31/07/2026', kursStd:2512, kursPajak:2512},
      ],
      jurnal:{akunPiutang:'', akunUtang:'', akunUMPembelian:'', akunUMPenjualan:'', akunLabaSelisihKurs:'', akunRugiSelisihKurs:''}},
    {kode:'IDR', nama:'Indonesian Rupiah', keterangan:'', nonAktif:false,
      periodeKurs:[],
      jurnal:{akunPiutang:'1120001', akunUtang:'2110001', akunUMPembelian:'1140001', akunUMPenjualan:'2140001', akunLabaSelisihKurs:'6010002', akunRugiSelisihKurs:'6510002'}},
    {kode:'SGD', nama:'Singapore Dollar', keterangan:'', nonAktif:false,
      periodeKurs:[
        {kursTarget:'IDR', tglAwal:'31/05/2026', tglAkhir:'31/05/2026', kursStd:13802, kursPajak:13802},
        {kursTarget:'IDR', tglAwal:'30/06/2026', tglAkhir:'30/06/2026', kursStd:13951, kursPajak:13951},
        {kursTarget:'IDR', tglAwal:'31/07/2026', tglAkhir:'31/07/2026', kursStd:14126, kursPajak:14126},
      ],
      jurnal:{akunPiutang:'', akunUtang:'', akunUMPembelian:'', akunUMPenjualan:'', akunLabaSelisihKurs:'', akunRugiSelisihKurs:''}},
    {kode:'USD', nama:'American Dollar', keterangan:'', nonAktif:false,
      periodeKurs:[
        {kursTarget:'IDR', tglAwal:'31/12/2025', tglAkhir:'31/12/2025', kursStd:16782, kursPajak:16782},
        {kursTarget:'IDR', tglAwal:'31/01/2026', tglAkhir:'31/01/2026', kursStd:16786, kursPajak:16786},
        {kursTarget:'IDR', tglAwal:'28/02/2026', tglAkhir:'28/02/2026', kursStd:16758, kursPajak:16758},
        {kursTarget:'IDR', tglAwal:'31/03/2026', tglAkhir:'31/03/2026', kursStd:16993, kursPajak:16993},
        {kursTarget:'IDR', tglAwal:'30/04/2026', tglAkhir:'30/04/2026', kursStd:17324, kursPajak:17324},
        {kursTarget:'IDR', tglAwal:'31/05/2026', tglAkhir:'31/05/2026', kursStd:17789, kursPajak:17789},
        {kursTarget:'IDR', tglAwal:'30/06/2026', tglAkhir:'30/06/2026', kursStd:17856, kursPajak:17856},
        {kursTarget:'IDR', tglAwal:'31/07/2026', tglAkhir:'31/07/2026', kursStd:18078, kursPajak:18078},
      ],
      jurnal:{akunPiutang:'1120001', akunUtang:'2110001', akunUMPembelian:'1140001', akunUMPenjualan:'2140001', akunLabaSelisihKurs:'6010002', akunRugiSelisihKurs:'6510002'}},
  ],
  /* =========================================================
     2026-08-28 — DATA BARU "jurnalKasUtangPiutang": master Jurnal
     Pelunasan Utang/Piutang (Kas/Bank > Master & Setting, page:
     'jurnalPelunasanUP' — sebelumnya placeholder murni). Sesuai 2
     screenshot MASERP yang dikirim user: "Daftar Jurnal Kas Utang dan
     Piutang" (list Kode Jurnal/Keterangan/Ubah/Hapus, Total Record 16,
     kode sparse 1/13/143/...) dan form "+ Buat Jurnal Kas" (Nama
     Jurnal + Mata Uang readonly + 15 field akun GL dgn picker, tombol
     Simpan/Batalkan/DUPLICATE). Data list screenshot (BCA IDR
     829.091.0219 dst.) adalah rekening instalasi MASERP lain (SDL) —
     TIDAK direplikasi; 8 baris di bawah dibuat 1:1 dari baris
     DATA.kasBank DBM yang sudah ada (nama & no. rekening persis field
     kasBank, kode sequential 1..8 mengikuti pola kode numerik
     DATA.jurnalPembelian). Akun-akunnya dipetakan ke DATA.akunGL DBM:
     akun kas per baris = akun GL kas/bank yang sesuai (Bank BNI/BRI
     baru ditambahkan di atas), akun lain persis pemetaan yang sudah
     dipakai DATA.jurnalPembelian/jurnalPenjualan — Akun Biaya/
     Pendapatan Lain-Lain dua-duanya ke 6510003 'Selisih Pembulatan /
     Pembayaran' MENIRU screenshot acuan yang juga memetakan kedua
     field itu ke 1 akun selisih pembulatan yang sama. */
  jurnalKasUtangPiutang:[
    {kode:1, nama:'Kas Kecil HO (IDR)', mataUang:'IDR',
      akunKas:'1100001', akunUtang:'2110001', akunUtangGiroMundur:'2110004', akunPiutang:'1120001', akunPiutangGiroMundur:'1120005',
      akunLabaSelisihKurs:'6010002', akunRugiSelisihKurs:'6510002', akunBiayaLain:'6510003', akunPendapatanLain:'6510003',
      akunUangMukaPembelian:'1140001', akunUangMukaPenjualan:'2140001',
      akunARSSPPPN:'1120003', akunARSSPPPH:'1120004', akunPPNPemungut:'2120003', akunUangMukaPPH22:'1140003'},
    {kode:2, nama:'Kas Besar HO (IDR)', mataUang:'IDR',
      akunKas:'1100002', akunUtang:'2110001', akunUtangGiroMundur:'2110004', akunPiutang:'1120001', akunPiutangGiroMundur:'1120005',
      akunLabaSelisihKurs:'6010002', akunRugiSelisihKurs:'6510002', akunBiayaLain:'6510003', akunPendapatanLain:'6510003',
      akunUangMukaPembelian:'1140001', akunUangMukaPenjualan:'2140001',
      akunARSSPPPN:'1120003', akunARSSPPPH:'1120004', akunPPNPemungut:'2120003', akunUangMukaPPH22:'1140003'},
    {kode:3, nama:'Bank Mandiri HO 1270012345678', mataUang:'IDR',
      akunKas:'1100011', akunUtang:'2110001', akunUtangGiroMundur:'2110004', akunPiutang:'1120001', akunPiutangGiroMundur:'1120005',
      akunLabaSelisihKurs:'6010002', akunRugiSelisihKurs:'6510002', akunBiayaLain:'6510003', akunPendapatanLain:'6510003',
      akunUangMukaPembelian:'1140001', akunUangMukaPenjualan:'2140001',
      akunARSSPPPN:'1120003', akunARSSPPPH:'1120004', akunPPNPemungut:'2120003', akunUangMukaPPH22:'1140003'},
    {kode:4, nama:'Bank BCA HO 0123456789', mataUang:'IDR',
      akunKas:'1100012', akunUtang:'2110001', akunUtangGiroMundur:'2110004', akunPiutang:'1120001', akunPiutangGiroMundur:'1120005',
      akunLabaSelisihKurs:'6010002', akunRugiSelisihKurs:'6510002', akunBiayaLain:'6510003', akunPendapatanLain:'6510003',
      akunUangMukaPembelian:'1140001', akunUangMukaPenjualan:'2140001',
      akunARSSPPPN:'1120003', akunARSSPPPH:'1120004', akunPPNPemungut:'2120003', akunUangMukaPPH22:'1140003'},
    {kode:5, nama:'Bank BNI SBY 0198765432', mataUang:'IDR',
      akunKas:'1100013', akunUtang:'2110001', akunUtangGiroMundur:'2110004', akunPiutang:'1120001', akunPiutangGiroMundur:'1120005',
      akunLabaSelisihKurs:'6010002', akunRugiSelisihKurs:'6510002', akunBiayaLain:'6510003', akunPendapatanLain:'6510003',
      akunUangMukaPembelian:'1140001', akunUangMukaPenjualan:'2140001',
      akunARSSPPPN:'1120003', akunARSSPPPH:'1120004', akunPPNPemungut:'2120003', akunUangMukaPPH22:'1140003'},
    {kode:6, nama:'Bank Mandiri BDG 1270087654321', mataUang:'IDR',
      akunKas:'1100011', akunUtang:'2110001', akunUtangGiroMundur:'2110004', akunPiutang:'1120001', akunPiutangGiroMundur:'1120005',
      akunLabaSelisihKurs:'6010002', akunRugiSelisihKurs:'6510002', akunBiayaLain:'6510003', akunPendapatanLain:'6510003',
      akunUangMukaPembelian:'1140001', akunUangMukaPenjualan:'2140001',
      akunARSSPPPN:'1120003', akunARSSPPPH:'1120004', akunPPNPemungut:'2120003', akunUangMukaPPH22:'1140003'},
    {kode:7, nama:'Bank BCA TGR 0234567891', mataUang:'IDR',
      akunKas:'1100012', akunUtang:'2110001', akunUtangGiroMundur:'2110004', akunPiutang:'1120001', akunPiutangGiroMundur:'1120005',
      akunLabaSelisihKurs:'6010002', akunRugiSelisihKurs:'6510002', akunBiayaLain:'6510003', akunPendapatanLain:'6510003',
      akunUangMukaPembelian:'1140001', akunUangMukaPenjualan:'2140001',
      akunARSSPPPN:'1120003', akunARSSPPPH:'1120004', akunPPNPemungut:'2120003', akunUangMukaPPH22:'1140003'},
    {kode:8, nama:'Bank BRI MDN 009801123456789', mataUang:'IDR',
      akunKas:'1100014', akunUtang:'2110001', akunUtangGiroMundur:'2110004', akunPiutang:'1120001', akunPiutangGiroMundur:'1120005',
      akunLabaSelisihKurs:'6010002', akunRugiSelisihKurs:'6510002', akunBiayaLain:'6510003', akunPendapatanLain:'6510003',
      akunUangMukaPembelian:'1140001', akunUangMukaPenjualan:'2140001',
      akunARSSPPPN:'1120003', akunARSSPPPH:'1120004', akunPPNPemungut:'2120003', akunUangMukaPPH22:'1140003'},
  ],
  kasBank:[
    {kode:'110101', masterBank:'PT Distriversa Buanamas - Head Office', nama:'Kas Kecil HO', mataUang:'IDR', alamat:'', telepon:'', kontakPerson:'', noRekening:'', tipeRekening:'Kas', nonAktif:false, smartlink:false, saldo:12674900},
    {kode:'110102', masterBank:'PT Distriversa Buanamas - Sidoarjo', nama:'Kas Besar SDA', mataUang:'IDR', alamat:'', telepon:'', kontakPerson:'', noRekening:'', tipeRekening:'Kas', nonAktif:false, smartlink:false, saldo:17012515.11},
    {kode:'110103', masterBank:'PT Distriversa Buanamas - Sidoarjo', nama:'Kas Kecil SDA', mataUang:'IDR', alamat:'', telepon:'', kontakPerson:'', noRekening:'', tipeRekening:'Kas', nonAktif:false, smartlink:false, saldo:17570263},
    {kode:'110104', masterBank:'PT Distriversa Buanamas - Head Office', nama:'Kas Bon HO', mataUang:'IDR', alamat:'', telepon:'', kontakPerson:'', noRekening:'', tipeRekening:'Kas', nonAktif:false, smartlink:false, saldo:444548429},
    {kode:'110105', masterBank:'PT Distriversa Buanamas - Semarang', nama:'Kas Kecil SMG', mataUang:'IDR', alamat:'', telepon:'', kontakPerson:'', noRekening:'', tipeRekening:'Kas', nonAktif:false, smartlink:false, saldo:11343600},
    {kode:'110106', masterBank:'PT Distriversa Buanamas - Head Office', nama:'Bank Mandiri HO', mataUang:'IDR', alamat:'', telepon:'021-5551001', kontakPerson:'Budi Santoso', noRekening:'1270012345678', tipeRekening:'Bank', nonAktif:false, smartlink:false, saldo:125000000},
    {kode:'110107', masterBank:'PT Distriversa Buanamas - Head Office', nama:'Bank BCA HO', mataUang:'IDR', alamat:'', telepon:'021-5551002', kontakPerson:'Siti Rahayu', noRekening:'0123456789', tipeRekening:'Bank', nonAktif:false, smartlink:false, saldo:89500000},
    {kode:'110108', masterBank:'PT Distriversa Buanamas - Head Office', nama:'Kas Besar HO', mataUang:'IDR', alamat:'', telepon:'', kontakPerson:'', noRekening:'', tipeRekening:'Kas', nonAktif:false, smartlink:false, saldo:15230000},
    {kode:'110109', masterBank:'PT Distriversa Buanamas - Surabaya', nama:'Bank BNI SBY', mataUang:'IDR', alamat:'', telepon:'031-5552001', kontakPerson:'Andi Wijaya', noRekening:'0198765432', tipeRekening:'Bank', nonAktif:false, smartlink:false, saldo:210750000},
    {kode:'110110', masterBank:'PT Distriversa Buanamas - Surabaya', nama:'Kas Kecil SBY', mataUang:'IDR', alamat:'', telepon:'', kontakPerson:'', noRekening:'', tipeRekening:'Kas', nonAktif:false, smartlink:false, saldo:8450000},
    {kode:'110111', masterBank:'PT Distriversa Buanamas - Surabaya', nama:'Kas Besar SBY', mataUang:'IDR', alamat:'', telepon:'', kontakPerson:'', noRekening:'', tipeRekening:'Kas', nonAktif:false, smartlink:false, saldo:19870000},
    {kode:'110112', masterBank:'PT Distriversa Buanamas - Bandung', nama:'Bank Mandiri BDG', mataUang:'IDR', alamat:'', telepon:'022-5553001', kontakPerson:'Dewi Kusuma', noRekening:'1270087654321', tipeRekening:'Bank', nonAktif:false, smartlink:false, saldo:156300000},
    {kode:'110113', masterBank:'PT Distriversa Buanamas - Bandung', nama:'Kas Kecil BDG', mataUang:'IDR', alamat:'', telepon:'', kontakPerson:'', noRekening:'', tipeRekening:'Kas', nonAktif:false, smartlink:false, saldo:6120000},
    {kode:'110114', masterBank:'PT Distriversa Buanamas - Bandung', nama:'Kas Bon BDG', mataUang:'IDR', alamat:'', telepon:'', kontakPerson:'', noRekening:'', tipeRekening:'Kas', nonAktif:false, smartlink:false, saldo:3980000},
    {kode:'110115', masterBank:'PT Distriversa Buanamas - Tangerang', nama:'Bank BCA TGR', mataUang:'IDR', alamat:'', telepon:'021-5554001', kontakPerson:'Rudi Hartono', noRekening:'0234567891', tipeRekening:'Bank', nonAktif:false, smartlink:false, saldo:98750000},
    {kode:'110116', masterBank:'PT Distriversa Buanamas - Tangerang', nama:'Kas Kecil TGR', mataUang:'IDR', alamat:'', telepon:'', kontakPerson:'', noRekening:'', tipeRekening:'Kas', nonAktif:false, smartlink:false, saldo:5340000},
    {kode:'110117', masterBank:'PT Distriversa Buanamas - Tangerang', nama:'Kas Besar TGR', mataUang:'IDR', alamat:'', telepon:'', kontakPerson:'', noRekening:'', tipeRekening:'Kas', nonAktif:false, smartlink:false, saldo:17650000},
    {kode:'110118', masterBank:'PT Distriversa Buanamas - Medan', nama:'Bank BRI MDN', mataUang:'IDR', alamat:'', telepon:'061-5555001', kontakPerson:'Maya Sari', noRekening:'009801123456789', tipeRekening:'Bank', nonAktif:false, smartlink:false, saldo:312400000},
    {kode:'110119', masterBank:'PT Distriversa Buanamas - Medan', nama:'Kas Kecil MDN', mataUang:'IDR', alamat:'', telepon:'', kontakPerson:'', noRekening:'', tipeRekening:'Kas', nonAktif:false, smartlink:false, saldo:4210000},
    {kode:'110120', masterBank:'PT Distriversa Buanamas - Medan', nama:'Kas Bon MDN', mataUang:'IDR', alamat:'', telepon:'', kontakPerson:'', noRekening:'', tipeRekening:'Kas', nonAktif:false, smartlink:false, saldo:2890000},
    {kode:'110121', masterBank:'PT Distriversa Buanamas - Makassar', nama:'Bank Danamon MKS', mataUang:'IDR', alamat:'', telepon:'0411-555601', kontakPerson:'Agus Salim', noRekening:'003123456789', tipeRekening:'Bank', nonAktif:false, smartlink:false, saldo:145600000},
    {kode:'110122', masterBank:'PT Distriversa Buanamas - Makassar', nama:'Kas Kecil MKS', mataUang:'IDR', alamat:'', telepon:'', kontakPerson:'', noRekening:'', tipeRekening:'Kas', nonAktif:false, smartlink:false, saldo:7680000},
    {kode:'110123', masterBank:'PT Distriversa Buanamas - Makassar', nama:'Kas Besar MKS', mataUang:'IDR', alamat:'', telepon:'', kontakPerson:'', noRekening:'', tipeRekening:'Kas', nonAktif:false, smartlink:false, saldo:13920000},
    {kode:'110124', masterBank:'PT Distriversa Buanamas - Semarang', nama:'Bank Permata SMG', mataUang:'IDR', alamat:'', telepon:'024-5556001', kontakPerson:'Rina Wulandari', noRekening:'4001234567', tipeRekening:'Bank', nonAktif:false, smartlink:false, saldo:178900000},
    {kode:'110125', masterBank:'PT Distriversa Buanamas - Semarang', nama:'Kas Bon SMG', mataUang:'IDR', alamat:'', telepon:'', kontakPerson:'', noRekening:'', tipeRekening:'Kas', nonAktif:false, smartlink:false, saldo:3560000},
    {kode:'110126', masterBank:'PT Distriversa Buanamas - Sidoarjo', nama:'Bank Mandiri SDA', mataUang:'IDR', alamat:'', telepon:'031-8981001', kontakPerson:'Hendra Gunawan', noRekening:'1270055566677', tipeRekening:'Bank', nonAktif:false, smartlink:false, saldo:267500000},
    {kode:'110127', masterBank:'PT Distriversa Buanamas - Sidoarjo', nama:'Kas Bon SDA', mataUang:'IDR', alamat:'', telepon:'', kontakPerson:'', noRekening:'', tipeRekening:'Kas', nonAktif:false, smartlink:false, saldo:4780000},
    {kode:'110128', masterBank:'PT Distriversa Buanamas - Sidoarjo', nama:'Bank BCA SDA', mataUang:'IDR', alamat:'', telepon:'031-8981002', kontakPerson:'Lina Marlina', noRekening:'0345678912', tipeRekening:'Bank', nonAktif:false, smartlink:false, saldo:199300000},
    {kode:'110129', masterBank:'PT Distriversa Buanamas - Head Office', nama:'Kas Besar HO', mataUang:'IDR', alamat:'', telepon:'', kontakPerson:'', noRekening:'', tipeRekening:'Kas', nonAktif:false, smartlink:false, saldo:20150000},
  ],

  /* Opsi dropdown "Promotion Category" di form Promotion — field INI yang
     menentukan bentuk field & tabel rincian form berubah total (4 variasi
     berbeda), lihat js/pages/promotion.template.js. */
  promotionCategoryList:[
    {kode:'A', nama:'Discount Program'},
    {kode:'DPF', nama:'Discount Proposal Form'},
    {kode:'DPL', nama:'Discount Proposal List'},
    {kode:'CAT', nama:'Discount Category'},
    /* 2026-08-28 — kategori BARU "Diskon Syarat Bayar" (modifikasi DBM
       yang diminta user): promo yang memilih BEBERAPA syarat bayar dan
       memberi diskon berupa DISKON GLOBAL 1 & 2 saja (persentase ATAU
       nominal, TANPA pemilihan item barang), berlaku otomatis ke
       transaksi Sales Order yang syarat bayarnya cocok — lihat varian
       'DSB' di js/pages/promotion.* dan soApplyPromoSyaratBayar() di
       js/pages/sales-order.js. */
    {kode:'DSB', nama:'Diskon Syarat Bayar'},
  ],
  /* Opsi dropdown "Tipe Customer" di form Promotion — beda konsep dari
     DATA.customerGroup (channel penjualan): ini pengelompokan tipe customer
     yang lebih umum (dipakai di banyak modul MASERP lain, di mockup ini baru
     dipakai di form Promotion). */
  tipeCustomerList:[
    {kode:'TC01', nama:'Reguler'},
    {kode:'TC02', nama:'Modern Trade'},
    {kode:'TC03', nama:'Institusi'},
    {kode:'TC04', nama:'Ekspor'},
  ],
  /* Daftar Outlet (cabang) — reuse persis nama cabang yang sudah dipakai di
     PO_CABANG_LIST (purchase-order.template.js) & SR_CABANG_LIST
     (stock-request.template.js) supaya konsisten. */
  outletList:['Head Office','Surabaya','Bandung','Medan','Makassar','Semarang','Tangerang','Sidoarjo'],
  /* Daftar Hari — dipakai picker "Day Name" di variasi Discount Category. */
  hariList:['Senin','Selasa','Rabu','Kamis','Jumat','Sabtu','Minggu'],

  /* Ditambahkan untuk modul Sales Order (Customer & Penjualan > Daftar
     Transaksi > Sales Order, page 'salesOrders', lihat js/pages/
     sales-order.*) — 3 daftar pendek baru:
     - rayonList: nama rayon/wilayah penjualan (sub-area sales, lebih
       granular dari `wilayah`), dipakai field "Rayon" di form Sales Order.
     - layananList: jenis layanan pengiriman/pemenuhan order.
     - orderViaList: kanal masuknya order (dipakai field "Order Via"). */
  rayonList:['Rayon Jakarta Pusat','Rayon Jakarta Utara','Rayon Jakarta Barat','Rayon Surabaya Kota','Rayon Bandung Kota','Rayon Medan Kota','Rayon Makassar Kota','Rayon Semarang Kota'],
  layananList:['Reguler','Express','Konsinyasi','Ekspedisi Pihak Ketiga'],
  orderViaList:['Sales Rep','WhatsApp','Telepon','Email','Online'],

  /* Master Promotion (Customer & Penjualan > Master & Setting > Promotion,
     page 'promotion'), sesuai 6 screenshot MASERP yang dikirim user (1 list
     "Daftar Promotion" + 4 varian form Ubah tergantung "Promotion Category":
     A=Discount Program, DPF=Discount Proposal Form, DPL=Discount Proposal
     List, CAT=Discount Category). Nomor kode ikut skema
     `26/PM-<CABANG>/<bulan>/<urut>` (skema penomoran, dipertahankan dari
     screenshot asli) TAPI customer/nama pelanggan contoh di screenshot asli
     (rumah sakit/apotek/PBF seperti "MITRA KELUARGA GRAND WISATA, RS") DIGANTI
     ke customer & channel FMCG milik DBM sendiri (DATA.customers/
     DATA.customerGroup) — pola penyesuaian sama seperti modul-modul lain.
     14 baris, disebar ke 4 kategori (4 A, 4 DPF, 3 DPL, 3 CAT) supaya tiap
     varian form representatif untuk diuji. Field per kategori:
     - A (Discount Program): principalKode/principalNama + `detail.items[]`
       (tiap item {jenis:'Group'|'Barang', kode, nama, ketentuan:[...]} —
       struktur dua tingkat: item lalu tier "ketentuan" qty/diskon/bonus).
     - DPF/DPL (Discount Proposal Form/List): principalKode/principalNama +
       `items[]` flat (kode,nama,qty,satuan,hna,hna1,hna1Inklusif,
       discPrincipal(Unit),discDistributor(Unit),supportDiscount(Unit)) — DPF
       tambahan kuotaAktif/kuota/isGuarantee/janganUpdateHna, DPL tidak (field
       kuotaAktif/kuota tetap disimpan di data untuk kompatibilitas struktur
       tapi form DPL tidak menampilkannya, lihat tplPromDiscountProposal()).
     - CAT (Discount Category): dayName/day/jamBuka(Jam/Menit)/
       jamTutup(Jam/Menit)/minimalTransaksi/kuota + `items[]` flat
       (kategoriKode,kategoriNama,qty,discPrincipal(Unit),discDistributor(Unit)). */
  promotion:[
    /* 2026-08-28 — 1 baris BARU kategori 'DSB' (Diskon Syarat Bayar,
       modifikasi DBM — lihat komentar di DATA.promotionCategoryList):
       diskonnya HANYA berupa Diskon Global 1 & 2 (bertingkat: DG2
       dihitung dari sisa setelah DG1), masing-masing bisa persentase
       ('%') atau nominal ('Rp'), TANPA array items (bukan diskon
       per-item — beda dari 4 kategori lain). syaratBayarDiskon berisi
       BEBERAPA syarat bayar dari DATA.syaratBayarList; Sales Order
       yang Syarat Bayar-nya termasuk daftar ini otomatis mendapat
       Diskon Global 1 & 2 promo ini (soApplyPromoSyaratBayar(),
       sales-order.js) selama status Active. Contoh nyata: customer
       ber-TOP N14 (Toko Sejahtera/UD Makmur Jaya) langsung kena saat
       dipilih di SO. */
    {kode:'26/PM-HO/08/00003', noOtomatis:'PRO15', nama:'Promo Diskon Pembayaran Cepat (CBD & Kredit Pendek)', kategori:'DSB', kodeLock:'',
      tglAwal:'01/08/2026', tglAkhir:'30/09/2026', status:'Active', tipeCustomer:'TC01', customer:'', grupCustomer:'',
      description:'Diskon Global otomatis pada Sales Order untuk pembayaran cepat: syarat bayar CBD., N7, atau N14 mendapat Diskon Global 1 sebesar 2% dan Diskon Global 2 sebesar 1% (bertingkat). Tanpa pemilihan item barang.', outlet:'Head Office', ppn:11,
      syaratBayarDiskon:['CBD.','N7','N14'],
      diskonGlobal1:2, diskonGlobal1Unit:'%', diskonGlobal2:1, diskonGlobal2Unit:'%'},
    {kode:'26/PM-HO/08/00001', noOtomatis:'PRO01', nama:'Promo Diskon Bertingkat Sembako', kategori:'A', kodeLock:'LOCK-SMB01',
      tglAwal:'01/08/2026', tglAkhir:'31/08/2026', status:'Active', tipeCustomer:'TC01', customer:'Toko Sumber Rejeki', grupCustomer:'GRSR',
      description:'Diskon bertingkat pembelian kategori Sembako, semakin banyak qty semakin besar diskon plus bonus barang.', outlet:'Head Office', ppn:11,
      principalKode:'5015', principalNama:'PT Sumber Pangan Nusantara',
      detail:{items:[
        {jenis:'Group', kode:'CATSMB', nama:'Sembako', ketentuan:[
          {qtyAwal:1, qtyAkhir:49, diskonPrincipal:2, diskonDistributor:1, ratioBarangBonus:0, barangBonusKode:'', barangBonusNama:''},
          {qtyAwal:50, qtyAkhir:999999, diskonPrincipal:5, diskonDistributor:2, ratioBarangBonus:20, barangBonusKode:'BRG-002', barangBonusNama:'Gula Pasir Gulaku 1kg'},
        ]},
      ]}},
    {kode:'26/PM-SBY/08/00001', noOtomatis:'PRO02', nama:'Promo Beli Minyak Goreng Dapat Bonus', kategori:'A', kodeLock:'',
      tglAwal:'05/08/2026', tglAkhir:'05/09/2026', status:'Active', tipeCustomer:'TC02', customer:'UD Makmur Jaya', grupCustomer:'RTMD',
      description:'Promo khusus barang Minyak Goreng Sunco 2L.', outlet:'Surabaya', ppn:11,
      principalKode:'5016', principalNama:'PT Wilmar Nabati Indonesia',
      detail:{items:[
        {jenis:'Barang', kode:'BRG-001', nama:'Minyak Goreng Sunco 2L', ketentuan:[
          {qtyAwal:1, qtyAkhir:99, diskonPrincipal:3, diskonDistributor:1, ratioBarangBonus:0, barangBonusKode:'', barangBonusNama:''},
          {qtyAwal:100, qtyAkhir:999999, diskonPrincipal:6, diskonDistributor:2, ratioBarangBonus:10, barangBonusKode:'BRG-001', barangBonusNama:'Minyak Goreng Sunco 2L'},
        ]},
      ]}},
    {kode:'26/PM-BDG/08/00001', noOtomatis:'PRO03', nama:'Promo Kategori Minuman Merdeka', kategori:'A', kodeLock:'',
      tglAwal:'10/08/2026', tglAkhir:'25/08/2026', status:'Active', tipeCustomer:'TC01', customer:'CV Berkah Abadi', grupCustomer:'RTTR',
      description:'Diskon kategori Minuman menyambut HUT RI.', outlet:'Bandung', ppn:11,
      principalKode:'5017', principalNama:'PT Sinar Meadow',
      detail:{items:[
        {jenis:'Group', kode:'CATMNM', nama:'Minuman', ketentuan:[
          {qtyAwal:1, qtyAkhir:29, diskonPrincipal:1, diskonDistributor:1, ratioBarangBonus:0, barangBonusKode:'', barangBonusNama:''},
        ]},
      ]}},
    {kode:'26/PM-MKS/07/00001', noOtomatis:'PRO04', nama:'Promo Toiletries + Sembako Kombinasi', kategori:'A', kodeLock:'',
      tglAwal:'01/07/2026', tglAkhir:'31/07/2026', status:'Non Active', tipeCustomer:'TC03', customer:'', grupCustomer:'INST',
      description:'Promo kombinasi kategori Toiletries dan barang tertentu, sudah berakhir.', outlet:'Makassar', ppn:11,
      principalKode:'5023', principalNama:'PT Sasa Inti',
      detail:{items:[
        {jenis:'Group', kode:'CATTOI', nama:'Toiletries', ketentuan:[
          {qtyAwal:1, qtyAkhir:999999, diskonPrincipal:2, diskonDistributor:0, ratioBarangBonus:0, barangBonusKode:'', barangBonusNama:''},
        ]},
        {jenis:'Barang', kode:'BRG-010', nama:'Sabun Mandi Lifebuoy 90gr', ketentuan:[
          {qtyAwal:1, qtyAkhir:200, diskonPrincipal:1, diskonDistributor:1, ratioBarangBonus:0, barangBonusKode:'', barangBonusNama:''},
        ]},
      ]}},
    {kode:'26/PM-HO/08/00002', noOtomatis:'PRO05', nama:'Discount Proposal Kopi & Teh Q3', kategori:'DPF', kodeLock:'',
      tglAwal:'01/08/2026', tglAkhir:'30/09/2026', status:'Active', tipeCustomer:'TC01', customer:'Toko Family Mart Jaya', grupCustomer:'RTMD',
      description:'Proposal diskon Kopi & Teh untuk kuartal 3.', outlet:'Head Office', ppn:11,
      principalKode:'5015', principalNama:'PT Sumber Pangan Nusantara',
      kuotaAktif:true, kuota:500, isGuarantee:true, janganUpdateHna:false,
      items:[
        {kode:'BRG-009', nama:'Kopi Kapal Api 165gr', qty:100, satuan:'Dus', hna:14000, hna1:14000, hna1Inklusif:false, discPrincipal:5, discPrincipalUnit:'%', discDistributor:2, discDistributorUnit:'%', supportDiscount:0, supportDiscountUnit:'%'},
        {kode:'BRG-008', nama:'Teh Celup Sariwangi 25s', qty:50, satuan:'Dus', hna:10000, hna1:10000, hna1Inklusif:false, discPrincipal:3, discPrincipalUnit:'%', discDistributor:1, discDistributorUnit:'%', supportDiscount:0, supportDiscountUnit:'%'},
      ], subTotal:0},
    {kode:'26/PM-SDA/08/00001', noOtomatis:'PRO06', nama:'Discount Proposal Susu Kental Manis', kategori:'DPF', kodeLock:'',
      tglAwal:'15/08/2026', tglAkhir:'15/10/2026', status:'Active', tipeCustomer:'TC02', customer:'Toko Sejahtera', grupCustomer:'RTMD',
      description:'Proposal diskon Susu Kental Manis untuk ritel modern.', outlet:'Sidoarjo', ppn:11,
      principalKode:'5019', principalNama:'PT Mayora Distribusi',
      kuotaAktif:false, kuota:0, isGuarantee:false, janganUpdateHna:true,
      items:[
        {kode:'BRG-007', nama:'Susu Kental Manis Indomilk 380gr', qty:200, satuan:'Dus', hna:16000, hna1:15500, hna1Inklusif:true, discPrincipal:4, discPrincipalUnit:'%', discDistributor:0, discDistributorUnit:'Rp', supportDiscount:200, supportDiscountUnit:'Rp'},
      ], subTotal:0},
    {kode:'26/PM-MDN/07/00001', noOtomatis:'PRO07', nama:'Discount Proposal Kecap Manis', kategori:'DPF', kodeLock:'',
      tglAwal:'01/07/2026', tglAkhir:'31/07/2026', status:'Non Active', tipeCustomer:'TC01', customer:'Toko Anugrah', grupCustomer:'RTTR',
      description:'Proposal diskon Kecap Manis, sudah berakhir.', outlet:'Medan', ppn:11,
      principalKode:'5020', principalNama:'PT Indofood Distribusi',
      kuotaAktif:true, kuota:300, isGuarantee:false, janganUpdateHna:false,
      items:[
        {kode:'BRG-006', nama:'Kecap Manis ABC 600ml', qty:150, satuan:'Dus', hna:14000, hna1:14000, hna1Inklusif:false, discPrincipal:3, discPrincipalUnit:'%', discDistributor:3, discDistributorUnit:'%', supportDiscount:0, supportDiscountUnit:'%'},
      ], subTotal:0},
    {kode:'26/PM-TGR/08/00001', noOtomatis:'PRO08', nama:'Discount Proposal Tepung Terigu', kategori:'DPF', kodeLock:'',
      tglAwal:'01/08/2026', tglAkhir:'31/12/2026', status:'Active', tipeCustomer:'TC04', customer:'', grupCustomer:'EXPR',
      description:'Proposal diskon Tepung Terigu untuk mitra ekspor.', outlet:'Tangerang', ppn:0,
      principalKode:'5018', principalNama:'CV Distribusi Sentosa',
      kuotaAktif:true, kuota:1000, isGuarantee:true, janganUpdateHna:false,
      items:[
        {kode:'BRG-004', nama:'Tepung Terigu Segitiga Biru 1kg', qty:500, satuan:'Karung', hna:12000, hna1:12000, hna1Inklusif:false, discPrincipal:2, discPrincipalUnit:'%', discDistributor:1, discDistributorUnit:'%', supportDiscount:100, supportDiscountUnit:'Rp'},
      ], subTotal:0},
    {kode:'26/PM-HO/08/00003', noOtomatis:'PRO09', nama:'Discount Proposal List Mie Instan', kategori:'DPL', kodeLock:'',
      tglAwal:'01/08/2026', tglAkhir:'30/09/2026', status:'Active', tipeCustomer:'TC01', customer:'Toko Sumber Rejeki', grupCustomer:'GRSR',
      description:'Daftar proposal diskon Mie Instan untuk Grosir.', outlet:'Head Office', ppn:11,
      principalKode:'5019', principalNama:'PT Mayora Distribusi',
      kuotaAktif:false, kuota:0, isGuarantee:false, janganUpdateHna:false,
      items:[
        {kode:'BRG-005', nama:'Mie Instan Indomie Goreng', qty:1000, satuan:'Dus', hna:2500, hna1:2500, hna1Inklusif:false, discPrincipal:2, discPrincipalUnit:'%', discDistributor:1, discDistributorUnit:'%', supportDiscount:0, supportDiscountUnit:'%'},
      ], subTotal:0},
    {kode:'26/PM-SMG/08/00001', noOtomatis:'PRO10', nama:'Discount Proposal List Beras Premium', kategori:'DPL', kodeLock:'',
      tglAwal:'01/08/2026', tglAkhir:'31/10/2026', status:'Active', tipeCustomer:'TC03', customer:'', grupCustomer:'INST',
      description:'Daftar proposal diskon Beras Premium untuk Institusi & Pemerintah.', outlet:'Semarang', ppn:11,
      principalKode:'5017', principalNama:'PT Sinar Meadow',
      kuotaAktif:false, kuota:0, isGuarantee:false, janganUpdateHna:false,
      items:[
        {kode:'BRG-003', nama:'Beras Premium Rojolele 5kg', qty:300, satuan:'Karung', hna:60000, hna1:58000, hna1Inklusif:true, discPrincipal:0, discPrincipalUnit:'Rp', discDistributor:1500, discDistributorUnit:'Rp', supportDiscount:0, supportDiscountUnit:'%'},
      ], subTotal:0},
    {kode:'26/PM-BDG/07/00002', noOtomatis:'PRO11', nama:'Discount Proposal List Gula Pasir', kategori:'DPL', kodeLock:'',
      tglAwal:'01/07/2026', tglAkhir:'31/07/2026', status:'Non Active', tipeCustomer:'TC02', customer:'CV Berkah Abadi', grupCustomer:'RTTR',
      description:'Daftar proposal diskon Gula Pasir, sudah berakhir.', outlet:'Bandung', ppn:11,
      principalKode:'5016', principalNama:'PT Wilmar Nabati Indonesia',
      kuotaAktif:false, kuota:0, isGuarantee:false, janganUpdateHna:false,
      items:[
        {kode:'BRG-002', nama:'Gula Pasir Gulaku 1kg', qty:400, satuan:'Karung', hna:15000, hna1:15000, hna1Inklusif:false, discPrincipal:2, discPrincipalUnit:'%', discDistributor:2, discDistributorUnit:'%', supportDiscount:0, supportDiscountUnit:'%'},
      ], subTotal:0},
    {kode:'26/PM-HO/08/00004', noOtomatis:'PRO12', nama:'Diskon Kategori Jam Sibuk Sembako', kategori:'CAT', kodeLock:'',
      tglAwal:'01/08/2026', tglAkhir:'31/08/2026', status:'Active', tipeCustomer:'TC02', customer:'', grupCustomer:'RTMD',
      description:'Diskon kategori berdasarkan hari & jam transaksi untuk ritel modern.', outlet:'Head Office', ppn:11,
      dayName:'Sabtu', day:15, jamBukaJam:8, jamBukaMenit:0, jamTutupJam:17, jamTutupMenit:0, minimalTransaksi:500000, kuota:100,
      items:[
        {kategoriKode:'CATSMB', kategoriNama:'Sembako', qty:10, discPrincipal:3, discPrincipalUnit:'%', discDistributor:1, discDistributorUnit:'%'},
      ]},
    {kode:'26/PM-SBY/08/00002', noOtomatis:'PRO13', nama:'Diskon Kategori Weekend Minuman', kategori:'CAT', kodeLock:'',
      tglAwal:'01/08/2026', tglAkhir:'30/09/2026', status:'Active', tipeCustomer:'TC01', customer:'UD Makmur Jaya', grupCustomer:'RTTR',
      description:'Diskon kategori Minuman khusus akhir pekan.', outlet:'Surabaya', ppn:11,
      dayName:'Minggu', day:20, jamBukaJam:9, jamBukaMenit:30, jamTutupJam:21, jamTutupMenit:0, minimalTransaksi:250000, kuota:200,
      items:[
        {kategoriKode:'CATMNM', kategoriNama:'Minuman', qty:5, discPrincipal:2, discPrincipalUnit:'%', discDistributor:0, discDistributorUnit:'Rp'},
      ]},
    {kode:'26/PM-MKS/07/00002', noOtomatis:'PRO14', nama:'Diskon Kategori Bumbu Dapur', kategori:'CAT', kodeLock:'',
      tglAwal:'01/07/2026', tglAkhir:'31/07/2026', status:'Non Active', tipeCustomer:'TC03', customer:'', grupCustomer:'HORK',
      description:'Diskon kategori Bumbu Dapur untuk Horeca, sudah berakhir.', outlet:'Makassar', ppn:11,
      dayName:'Rabu', day:10, jamBukaJam:7, jamBukaMenit:0, jamTutupJam:15, jamTutupMenit:45, minimalTransaksi:100000, kuota:50,
      items:[
        {kategoriKode:'CATBMB', kategoriNama:'Bumbu', qty:20, discPrincipal:1, discPrincipalUnit:'%', discDistributor:1, discDistributorUnit:'%'},
      ]},
  ],
  /* Dominasi Claim Setting — menu Customer & Penjualan > Master & Setting >
     Dominasi (page:'dominasi', tombol "Setting Claim Dominasi" di header
     list, lihat js/pages/dominasi.*). Sesuai screenshot "Dominasi Claim
     Setting" MASERP yang dikirim user: 1 baris sample (Tgl. Efektif
     01/01/2024, Claim Persen 0.75). `claimPersen` SENGAJA disimpan &
     ditampilkan apa adanya (0.75, bertitik) — bukan diformat lewat
     num()/rp() (yang akan menampilkan "0,75" gaya Indonesia) — supaya
     persis meniru tampilan screenshot asli. */
  dominasiClaimSetting:[
    {tglEfektif:'01/01/2024', claimPersen:0.75},
  ],
  /* Dominasi — menu Customer & Penjualan > Master & Setting > Dominasi
     (page:'dominasi', sebelumnya placeholder murni). Sesuai 5 screenshot
     MASERP yang dikirim user: list "Daftar Dominasi" + 2 varian form
     "Dominasi Setting" tergantung field "Tipe" (Regular vs Fix) — lihat
     catatan desain lengkap di header js/pages/dominasi.template.js.

     Data customer/principal DIGANTI ke milik DBM sendiri (screenshot asli
     menampilkan nama dokter/apotek/instansi pemerintah dari demo
     distributor farmasi lain, bukan data PT Distriversa Buanamas) —
     `customerKode`/`customerNama` dipetakan ke 8 baris DATA.customers yang
     sudah ada, `principalKode`/`principalNama` ke DATA.suppliers yang
     sudah ada, `bcKode`/`divKode` ke DATA.businessCentre/DATA.divisi yang
     sudah ada. `customerRef`/`principalRef` adalah kode referensi kecil
     dekoratif yang tampil di bawah field Customer/Principal di form
     (murni tampilan, tidak dipakai modul lain) — formatnya meniru gaya
     "A000023823"/"HOVDR102IDR" di screenshot asli.

     10 baris pertama bertipe 'Regular' (noSpGuarantee & nilai mengikuti
     screenshot list, `jumlahPakai` diisi 0 utk yang belum "Terpakai" &
     disamakan dgn nominalMax utk yang sudah, `dipakai` diturunkan dari
     situ). Baris ke-11 bertipe 'Fix', 3 baris rincian barang dari
     DATA.items dgn Jumlah dihitung lewat formula HNA1 x (1 - discP% -
     discD%) x Qty (lihat domRecalcItem() di dominasi.js) — totalnya
     (225.000 + 560.000 + 900.000 = 1.685.000) SENGAJA persis sama dgn
     `nominalMax` baris ini, meniru screenshot asli dimana Nominal Max
     tipe Fix = SUM kolom Jumlah tabel rincian barang. */
  dominasi:[
    {no:'B-DM32026080009', tanggal:'18/08/2026', tipe:'Regular',
     customerKode:'CUST-001', customerNama:'Toko Sumber Rejeki', customerRef:'A000001',
     noSpGuarantee:'08/2026', tenor:9,
     bcKode:'BSC104', bcNama:'Consumer Food', divKode:'DVS100', divNama:'Head Office',
     principalKode:'5015', principalNama:'PT Sumber Pangan Nusantara', principalRef:'HOVDR5015IDR',
     nominalMax:14310000, jumlahPakai:0, statusAktif:'Active', dipakai:false, items:[]},
    {no:'B-DM32026080007', tanggal:'18/08/2026', tipe:'Regular',
     customerKode:'CUST-001', customerNama:'Toko Sumber Rejeki', customerRef:'A000001',
     noSpGuarantee:'08/2026', tenor:6,
     bcKode:'BSC104', bcNama:'Consumer Food', divKode:'DVS100', divNama:'Head Office',
     principalKode:'5015', principalNama:'PT Sumber Pangan Nusantara', principalRef:'HOVDR5015IDR',
     nominalMax:9900000, jumlahPakai:0, statusAktif:'Active', dipakai:false, items:[]},
    {no:'B-DM04426080004', tanggal:'18/08/2026', tipe:'Regular',
     customerKode:'CUST-002', customerNama:'UD Makmur Jaya', customerRef:'A000002',
     noSpGuarantee:'UD MAKMUR JAYA 14/08/2026', tenor:12,
     bcKode:'BSC101', bcNama:'Generik', divKode:'DVS200', divNama:'Sales & Marketing',
     principalKode:'5016', principalNama:'PT Wilmar Nabati Indonesia', principalRef:'HOVDR5016IDR',
     nominalMax:367830000, jumlahPakai:367830000, statusAktif:'Active', dipakai:true, items:[]},
    {no:'B-DM08326080007', tanggal:'18/08/2026', tipe:'Regular',
     customerKode:'CUST-003', customerNama:'CV Berkah Abadi', customerRef:'A000003',
     noSpGuarantee:'EP-01KZQ7CKAFB5B9DPP59SSJG3BW', tenor:9,
     bcKode:'BSC103', bcNama:'Branded', divKode:'DVS300', divNama:'Warehouse & Logistik',
     principalKode:'5017', principalNama:'PT Sinar Meadow', principalRef:'HOVDR5017IDR',
     nominalMax:95113602, jumlahPakai:95113602, statusAktif:'Active', dipakai:true, items:[]},
    {no:'B-DM04426080006', tanggal:'18/08/2026', tipe:'Regular',
     customerKode:'CUST-002', customerNama:'UD Makmur Jaya', customerRef:'A000002',
     noSpGuarantee:'UD MAKMUR JAYA 14/08/2026', tenor:12,
     bcKode:'BSC101', bcNama:'Generik', divKode:'DVS200', divNama:'Sales & Marketing',
     principalKode:'5016', principalNama:'PT Wilmar Nabati Indonesia', principalRef:'HOVDR5016IDR',
     nominalMax:392499000, jumlahPakai:0, statusAktif:'Active', dipakai:false, items:[]},
    {no:'B-DM19626080008', tanggal:'18/08/2026', tipe:'Regular',
     customerKode:'CUST-004', customerNama:'Toko Anugrah', customerRef:'A000004',
     noSpGuarantee:'000.3.2/SP.OBAT/007/VIII/2026', tenor:3,
     bcKode:'BSC104', bcNama:'Consumer Food', divKode:'DVS400', divNama:'Finance & Accounting',
     principalKode:'5019', principalNama:'PT Mayora Distribusi', principalRef:'HOVDR5019IDR',
     nominalMax:4459500, jumlahPakai:0, statusAktif:'Active', dipakai:false, items:[]},
    {no:'B-DM05526080005', tanggal:'18/08/2026', tipe:'Regular',
     customerKode:'CUST-005', customerNama:'UD Sinar Harapan', customerRef:'A000005',
     noSpGuarantee:'-', tenor:9,
     bcKode:'BSC102', bcNama:'Alat Kesehatan', divKode:'DVS100', divNama:'Head Office',
     principalKode:'5020', principalNama:'PT Indofood Distribusi', principalRef:'HOVDR5020IDR',
     nominalMax:101527475, jumlahPakai:101527475, statusAktif:'Non Active', dipakai:true, items:[]},
    {no:'B-DM08326080010', tanggal:'18/08/2026', tipe:'Regular',
     customerKode:'CUST-003', customerNama:'CV Berkah Abadi', customerRef:'A000003',
     noSpGuarantee:'EP-01KZNDV7C67PYEX0GKRW2CYPQA', tenor:9,
     bcKode:'BSC103', bcNama:'Branded', divKode:'DVS300', divNama:'Warehouse & Logistik',
     principalKode:'5017', principalNama:'PT Sinar Meadow', principalRef:'HOVDR5017IDR',
     nominalMax:42254095, jumlahPakai:42254095, statusAktif:'Active', dipakai:true, items:[]},
    {no:'B-DM06326080007', tanggal:'18/08/2026', tipe:'Regular',
     customerKode:'CUST-006', customerNama:'Toko Family Mart Jaya', customerRef:'A000006',
     noSpGuarantee:'EP-01KZTC4ATJXFQK2VSK0SZ4N49S', tenor:6,
     bcKode:'BSC104', bcNama:'Consumer Food', divKode:'DVS200', divNama:'Sales & Marketing',
     principalKode:'5023', principalNama:'PT Sasa Inti', principalRef:'HOVDR5023IDR',
     nominalMax:2510500, jumlahPakai:2510500, statusAktif:'Active', dipakai:true, items:[]},
    {no:'B-DM02326080002', tanggal:'18/08/2026', tipe:'Regular',
     customerKode:'CUST-007', customerNama:'CV Maju Terus', customerRef:'A000007',
     noSpGuarantee:'662/58.12/PL OBAT-OBATAN/SP/435.102.101/2026', tenor:9,
     bcKode:'BSC101', bcNama:'Generik', divKode:'DVS100', divNama:'Head Office',
     principalKode:'5026', principalNama:'PT Roda Mas Trading', principalRef:'HOVDR5026IDR',
     nominalMax:3911004.6, jumlahPakai:0, statusAktif:'Active', dipakai:false, items:[]},
    {no:'B-DM060FIX26080001', tanggal:'14/08/2026', tipe:'Fix',
     customerKode:'CUST-008', customerNama:'Toko Sejahtera', customerRef:'A000008',
     noSpGuarantee:'AAA.08.26', tenor:6,
     bcKode:'BSC104', bcNama:'Consumer Food', divKode:'DVS400', divNama:'Finance & Accounting',
     principalKode:'5015', principalNama:'PT Sumber Pangan Nusantara', principalRef:'HOVDR5015IDR',
     nominalMax:1685000, jumlahPakai:0, statusAktif:'Active', dipakai:false,
     items:[
       {kode:'BRG-005', nama:'Mie Instan Indomie Goreng', satuan:'Dus', qty:100, hna:2500, hna1:2500, discPrincipal:10, discDistributor:0, jumlah:225000},
       {kode:'BRG-009', nama:'Kopi Kapal Api 165gr', satuan:'Dus', qty:50, hna:14000, hna1:14000, discPrincipal:15, discDistributor:5, jumlah:560000},
       {kode:'BRG-010', nama:'Sabun Mandi Lifebuoy 90gr', satuan:'Dus', qty:200, hna:5000, hna1:5000, discPrincipal:8, discDistributor:2, jumlah:900000},
     ]},
  ],
  /* Price List By Province — menu Persediaan Barang > Master & Setting >
     Price List By Province (page:'priceListProvince', sebelumnya
     placeholder murni). Sesuai 3 screenshot MASERP yang dikirim user:
     list "Price List By Province" (toolbar chip periode "Agustus 2026" +
     tombol "+Tambah"/"Impor Price List"/"Ekspor ke Excel", kolom No.
     Transaksi/Tgl. Efektif/Keterangan/Province/Lihat/Ubah/Hapus) dan form
     "+ Price List" (No. Otomatis + No. Transaksi + Tgl. Efektif +
     Keterangan + picker Provincies, lalu section "Daftar Inventory" —
     tabel SEMUA barang dengan 4 kolom "Harga Jual 1-4" [masing-masing
     Satuan/Lama/Baru] + kotak %-header di atas tiap kolom Harga Jual
     yang begitu diisi langsung menghitung ulang Baru = Lama x (1+%/100)
     untuk SEMUA baris sekaligus — lihat catatan desain lengkap di header
     js/pages/price-list-province.template.js).

     PENYEDERHANAAN PENTING vs screenshot asli: screenshot MASERP asli
     menampilkan katalog produk farmasi ~690 baris dengan 2 satuan aktif
     per barang (BTL=Harga Jual 1, KRT=Harga Jual 2, kolom 3-4 kosong) —
     "Daftar Inventory" di mockup ini SENGAJA reuse DATA.items apa adanya
     (10 baris, satu satuan per barang, milik DBM sendiri, BUKAN nama
     obat dari demo farmasi lain) daripada mengarang 690 baris dummy,
     mengikuti precedent "downsize volume data demi kepraktisan" seperti
     Master Rayon/Group User — jadi hanya kolom **Harga Jual 1** yang
     benar-benar aktif (Satuan = item.satuan, Lama = item.harga, Baru =
     %-header reaktif atau override manual per baris); kolom Harga Jual
     2-4 tetap dirender strukturnya (persis 4 kolom di screenshot) tapi
     SELALU kosong/nonaktif karena DATA.items di mockup ini memang cuma
     punya 1 satuan per barang. "Kode Kategori" per baris dipetakan dari
     DATA.kategoriBarang (dicocokkan lewat nama, karena DATA.items.kategori
     menyimpan NAMA kategori bukan kode) — lihat kategoriKodeOf() di
     price-list-province.js. Province dipetakan ke DATA.provinsiList (8
     provinsi) yang sudah ada, bukan array baru.

     3 baris sample (DKI Jakarta/Jawa Barat/Jawa Timur) masing2 mencakup
     ke-10 DATA.items dengan markup seragam +6%/+4%/+8% dari harga master
     (item.harga), dibulatkan ke ratusan terdekat — cuma utk demo tampilan
     angka realistis, bukan hasil kalkulasi bisnis sungguhan. */
  priceListProvince:[
    {noTransaksi:'PLP/08/2026/0001', tglEfektif:'01/08/2026',
     keterangan:'Penyesuaian harga jual Agustus 2026 - wilayah DKI Jakarta',
     province:'DKI Jakarta',
     items:[
       {kode:'BRG-001', hargaBaru1:26500}, {kode:'BRG-002', hargaBaru1:15900}, {kode:'BRG-003', hargaBaru1:63600},
       {kode:'BRG-004', hargaBaru1:12700}, {kode:'BRG-005', hargaBaru1:2700}, {kode:'BRG-006', hargaBaru1:14800},
       {kode:'BRG-007', hargaBaru1:17000}, {kode:'BRG-008', hargaBaru1:10600}, {kode:'BRG-009', hargaBaru1:14800},
       {kode:'BRG-010', hargaBaru1:5300},
     ]},
    {noTransaksi:'PLP/08/2026/0002', tglEfektif:'05/08/2026',
     keterangan:'Penyesuaian harga jual Agustus 2026 - wilayah Jawa Barat',
     province:'Jawa Barat',
     items:[
       {kode:'BRG-001', hargaBaru1:26000}, {kode:'BRG-002', hargaBaru1:15600}, {kode:'BRG-003', hargaBaru1:62400},
       {kode:'BRG-004', hargaBaru1:12500}, {kode:'BRG-005', hargaBaru1:2600}, {kode:'BRG-006', hargaBaru1:14600},
       {kode:'BRG-007', hargaBaru1:16600}, {kode:'BRG-008', hargaBaru1:10400}, {kode:'BRG-009', hargaBaru1:14600},
       {kode:'BRG-010', hargaBaru1:5200},
     ]},
    {noTransaksi:'PLP/08/2026/0003', tglEfektif:'12/08/2026',
     keterangan:'Penyesuaian harga jual Agustus 2026 - wilayah Jawa Timur',
     province:'Jawa Timur',
     items:[
       {kode:'BRG-001', hargaBaru1:27000}, {kode:'BRG-002', hargaBaru1:16200}, {kode:'BRG-003', hargaBaru1:64800},
       {kode:'BRG-004', hargaBaru1:13000}, {kode:'BRG-005', hargaBaru1:2700}, {kode:'BRG-006', hargaBaru1:15100},
       {kode:'BRG-007', hargaBaru1:17300}, {kode:'BRG-008', hargaBaru1:10800}, {kode:'BRG-009', hargaBaru1:15100},
       {kode:'BRG-010', hargaBaru1:5400},
     ]},
  ],
  /* Daftar Kernet (dipakai field "Kernet" di form Faktur Penjualan Via
     S.J. — asisten driver saat pengiriman, picker dekoratif sederhana
     sama pola dengan DATA.driverList, tidak ada modul Master Kernet
     tersendiri di mockup ini). */
  kernetList:[
    'Slamet Riyadi',
    'Joko Purnomo',
    'Wawan Setiadi',
    'Rudi Hartono',
    'Bagus Prasetyo',
  ],
  /* Daftar Kode Pajak e-Faktur (dipakai field "Kode Pajak" di panel
     Informasi PPN, form Faktur Penjualan Via S.J.) — kode standar
     e-Faktur DJP, picker dekoratif (dropdown/search sederhana). */
  kodePajakList:[
    '01 - Penyerahan BKP/JKP yang terutang PPN',
    '04 - DPP Nilai Lain',
    '06 - Penyerahan lainnya',
    '07 - Penyerahan yang PPN/PPnBM-nya Tidak Dipungut',
  ],
  /* Faktur Penjualan Via S.J. — menu Customer & Penjualan > Daftar
     Transaksi > Penjualan Via S.J. (lihat js/pages/faktur-penjualan-sj.*).
     Sebelumnya placeholder generik. Modul ini adalah TAHAP LANJUTAN dari
     Invoice (lihat komentar di atas DATA.invoices): setiap baris di bawah
     ini di-CHAIN 1:1 ke 1 baris DATA.invoices (semua 8 baris dipakai,
     urutan sama) — "Dari S.J." = invoices[i].noSJ, "Dari Sales Order" =
     invoices[i].noSO, Customer/Cabang/Principal/No SP/Tgl SP/No DSC/
     Syarat Bayar/Tipe Layanan/Alamat Pengiriman semua disalin dari baris
     Invoice sumbernya (persis pola invApplyPickingList() Invoice yang
     nyalin dari Picking List). No. Faktur PAKAI SERI SENDIRI (bukan sama
     dengan `no` Invoice-nya) format "26/SI/<KODE>/08/<seq>" dengan seq
     nomor besar (095-182) supaya terasa sebagai dokumen yang jauh lebih
     sering terjadi daripada 8 baris Invoice contoh (realistis, karena di
     dunia nyata tidak semua Invoice/SJ langsung official-invoiced di hari
     yang sama) — baris index 4 (cabang Head Office) SENGAJA disamakan
     persis dengan No. Faktur "26/SI/HO/08/00181", Tgl. Faktur 10/08/2026 &
     Tgl. Jth. Tempo 09/09/2026 di screenshot MASERP "+ Penjualan Via S.J."
     supaya form Tambah/Ubah bisa direproduksi 1:1 utk baris itu.
     Tgl. Faktur SENGAJA dibuat beberapa hari SETELAH tgl Invoice/SJ
     sumbernya (`tglLag` 1-3 hari, merepresentasikan jeda proses
     administrasi sebelum faktur pajak resmi diterbitkan); Tgl. Jth. Tempo
     = Tgl. Faktur + jumlah hari kredit dari `syaratBayar` ("Kredit 30
     Hari" -> +30, dst; "CBD" -> 0 hari/sama hari), dihitung manual dgn
     Node sekali (bukan ditulis asal) supaya konsisten dgn helper
     fktJatuhTempo() yang dipakai form Tambah saat user pilih Syarat Bayar
     baru.
     ITEM & DISKON: kode/nama/satuan/qty & harga (`hna`/`hna1`, sama nilai)
     SEMUA diambil dari DATA.invoices[i].items + DATA.items[].harga (BUKAN
     angka acak). Disc Principal%/Disc Distributor% per item HANYA
     dihitung sungguhan dari DATA.promotion kalau ada promo yang match
     principalKode invoice tsb + kode barang + qty (lihat baris index 0,
     cabang Tangerang, principal 5015, match promo '26/PM-HO/08/00001'
     grup Sembako -> BRG-001 qty20 masuk tier 1-49 [principal 2%/
     distributor 1%], BRG-002 qty80 masuk tier >=50 [principal 5%/
     distributor 2%] — SATU-SATUNYA baris dgn diskon di 8 baris ini karena
     cuma principal 5015 yang promo grup-nya benar-benar match kategori
     barang yg dibeli; principal 5016 di data lain juga py promo tapi
     khusus barang BRG-001 saja jadi tidak match item BRG-007/BRG-008/dst
     di baris lain). Disc/Barang = hna1 x totalDisc%; Jumlah = (hna1 -
     Disc/Barang) x qty. DPP = total Jumlah semua item (Diskon 1/Diskon 2
     header level = 0 di semua baris sample). PPN pakai radio "PPN
     Eksklusif(+11%)" di semua baris (konsisten dgn typePpn 'PPN 11%' yang
     dominan dipakai di rantai SO/Invoice) = DPP x 11%. Jumlah Akhir = DPP
     + PPN (Uang Muka pakai / Pph / Ongkos Angkut = 0 di semua baris
     sample, field-nya tetap ada & reaktif di form utk kelengkapan UI).
     Salesman ambil dari DATA.salesman (termasuk 'M. Reza Wijaya' baris
     baru khusus Head Office, sesuai nama di screenshot). Driver/Kernet
     HANYA diisi kalau shipVia Invoice sumbernya 'Driver' (kernet dari
     DATA.kernetList baru); Ekspedisi/Diambil Sendiri/Dikirim Supplier ->
     Driver & Kernet kosong. P.O. Customer nomor bebas format
     "PO/<kodeCustomer>/2026-08/<seq>" (field dekoratif, tidak dipakai
     modul lain) — baris index 4 SENGAJA diberi suffix "0518" match
     screenshot. Tipe Transaksi DIHITUNG dari syaratBayar ('Penjualan
     Tunai' utk CBD, 'Penjualan Kredit' utk Kredit N Hari) — DEVIASI
     disengaja dari screenshot yg semua barisnya seragam 'Penjualan
     Kredit' meski data campur CBD/Kredit, supaya lebih konsisten logis
     dgn field Syarat Bayar sendiri. Total Record pakai
     DATA.fakturPenjualanSJ.length (8) — BUKAN "410" di screenshot, sama
     seperti konvensi Total Record dinamis di semua modul list lain. */
  fakturPenjualanSJ:[
    {no:'26/SI/TGR/08/00142', dariSJ:'26/SJ/TGR/08/00001', dariSO:'26/SO/HO/08/00013', cabang:'Tangerang',
      tglFaktur:'14/08/2026', tglJatuhTempo:'13/09/2026', syaratBayar:'Kredit 30 Hari',
      customerKode:'CUST-006', customerNama:'Toko Family Mart Jaya', customerAlamat:'Jl. Kelapa Gading Boulevard No. 9, Jakarta Utara',
      noDSC:'', principalKode:'5015', principalNama:'PT Sumber Pangan Nusantara', noReturSJ:'', noPacking:'',
      noSP:'SP/HO/08/00013', tglSP:'08/08/2026', jurnal:'JURNAL PENJUALAN KREDIT (IDR)', salesman:'Budi Santoso',
      poCustomer:'PO/CUST-006/2026-08/0512', driver:'', kernet:'',
      alamatPengirimanTipe:'Alamat Customer', alamatPengiriman:'Jl. Kelapa Gading Boulevard No. 9, Jakarta Utara',
      tglBatasRetur:'', tipeLayanan:'Reguler',
      items:[
        {kode:'BRG-001', nama:'Minyak Goreng Sunco 2L', keterangan:'', qtyPhysical:20, um:'Dus', hna:25000, hna1:25000, discPrincipal:2, discDistributor:1, totalDisc:3, discBarang:750, jumlah:485000, kodePromosi:'26/PM-HO/08/00001', ppnChecked:true},
        {kode:'BRG-002', nama:'Gula Pasir Gulaku 1kg', keterangan:'', qtyPhysical:80, um:'Karung', hna:15000, hna1:15000, discPrincipal:5, discDistributor:2, totalDisc:7, discBarang:1050, jumlah:1116000, kodePromosi:'26/PM-HO/08/00001', ppnChecked:true},
      ],
      tipePpn:'PPN Eksklusif(+11%)', mataUang:'Rupiah (IDR)', kursPajak:0, tglFakturPajak:'14/08/2026', kodePajak:'04 - DPP Nilai Lain', noFakturPajak:'0400126000000142',
      diskon1:0, diskon2:0, kurs:1, dpp:1601000,
      uangMukaTipe:'Tertua', sisaUangMuka:0, uangMukaPakai:0,
      pphAktif:false, pphKode:'', pphPersen:0, pphAmount:0,
      ongkosAngkut:0, ppn:176110, jumlahAkhir:1777110, sisaJumlah:1777110,
      keterangan:'Faktur Penjualan Via S.J. sesuai S.J. 26/SJ/TGR/08/00001.', tipeTransaksi:'Penjualan Kredit',
      tglInput:'14/08/2026 09:20', userInput:'sidik', tglEdit:'', userEdit:''},
    {no:'26/SI/SBY/08/00095', dariSJ:'26/SJ/SBY/08/00001', dariSO:'26/SO/SBY/08/00007', cabang:'Surabaya',
      tglFaktur:'10/08/2026', tglJatuhTempo:'24/08/2026', syaratBayar:'Kredit 14 Hari',
      customerKode:'CUST-002', customerNama:'UD Makmur Jaya', customerAlamat:'Jl. Raya Darmo No. 45, Surabaya',
      noDSC:'DSC/SBY/08/00001', principalKode:'5016', principalNama:'PT Wilmar Nabati Indonesia', noReturSJ:'', noPacking:'',
      noSP:'SP/SBY/08/00007', tglSP:'08/08/2026', jurnal:'JURNAL PENJUALAN KREDIT (IDR)', salesman:'Andi Wijaya',
      poCustomer:'PO/CUST-002/2026-08/0287', driver:'Bambang Wijaya - B 9012 XYZ (ABC)', kernet:'Joko Purnomo',
      alamatPengirimanTipe:'Alamat Customer', alamatPengiriman:'Jl. Raya Darmo No. 45, Surabaya',
      tglBatasRetur:'', tipeLayanan:'Reguler',
      items:[
        {kode:'BRG-007', nama:'Susu Kental Manis Indomilk 380gr', keterangan:'', qtyPhysical:30, um:'Dus', hna:16000, hna1:16000, discPrincipal:0, discDistributor:0, totalDisc:0, discBarang:0, jumlah:480000, kodePromosi:'', ppnChecked:true},
        {kode:'BRG-008', nama:'Teh Celup Sariwangi 25s', keterangan:'', qtyPhysical:40, um:'Dus', hna:10000, hna1:10000, discPrincipal:0, discDistributor:0, totalDisc:0, discBarang:0, jumlah:400000, kodePromosi:'', ppnChecked:true},
      ],
      tipePpn:'PPN Eksklusif(+11%)', mataUang:'Rupiah (IDR)', kursPajak:0, tglFakturPajak:'10/08/2026', kodePajak:'04 - DPP Nilai Lain', noFakturPajak:'0400126000000095',
      diskon1:0, diskon2:0, kurs:1, dpp:880000,
      uangMukaTipe:'Tertua', sisaUangMuka:0, uangMukaPakai:0,
      pphAktif:false, pphKode:'', pphPersen:0, pphAmount:0,
      ongkosAngkut:0, ppn:96800, jumlahAkhir:976800, sisaJumlah:976800,
      keterangan:'Faktur Penjualan Via S.J. sesuai S.J. 26/SJ/SBY/08/00001.', tipeTransaksi:'Penjualan Kredit',
      tglInput:'10/08/2026 10:05', userInput:'sidik', tglEdit:'', userEdit:''},
    {no:'26/SI/MDN/08/00077', dariSJ:'26/SJ/MDN/08/00001', dariSO:'26/SO/MDN/08/00003', cabang:'Medan',
      tglFaktur:'08/08/2026', tglJatuhTempo:'22/09/2026', syaratBayar:'Kredit 45 Hari',
      customerKode:'CUST-004', customerNama:'Toko Anugrah', customerAlamat:'Jl. Gatot Subroto No. 21, Medan',
      noDSC:'', principalKode:'5020', principalNama:'PT Indofood Distribusi', noReturSJ:'', noPacking:'',
      noSP:'SP/MDN/08/00003', tglSP:'06/08/2026', jurnal:'JURNAL PENJUALAN KREDIT (IDR)', salesman:'Dedi Kurniawan',
      poCustomer:'PO/CUST-004/2026-08/0143', driver:'', kernet:'',
      alamatPengirimanTipe:'Alamat Customer', alamatPengiriman:'Jl. Gatot Subroto No. 21, Medan',
      tglBatasRetur:'', tipeLayanan:'Reguler',
      items:[
        {kode:'BRG-004', nama:'Tepung Terigu Segitiga Biru 1kg', keterangan:'', qtyPhysical:50, um:'Karung', hna:12000, hna1:12000, discPrincipal:0, discDistributor:0, totalDisc:0, discBarang:0, jumlah:600000, kodePromosi:'', ppnChecked:true},
      ],
      tipePpn:'PPN Eksklusif(+11%)', mataUang:'Rupiah (IDR)', kursPajak:0, tglFakturPajak:'08/08/2026', kodePajak:'04 - DPP Nilai Lain', noFakturPajak:'0400126000000077',
      diskon1:0, diskon2:0, kurs:1, dpp:600000,
      uangMukaTipe:'Tertua', sisaUangMuka:0, uangMukaPakai:0,
      pphAktif:false, pphKode:'', pphPersen:0, pphAmount:0,
      ongkosAngkut:0, ppn:66000, jumlahAkhir:666000, sisaJumlah:666000,
      keterangan:'Faktur Penjualan Via S.J. sesuai S.J. 26/SJ/MDN/08/00001. Pengiriman via Ekspedisi (JNE), tanpa Driver/Kernet internal.', tipeTransaksi:'Penjualan Kredit',
      tglInput:'08/08/2026 11:30', userInput:'sidik', tglEdit:'', userEdit:''},
    {no:'26/SI/MKS/08/00058', dariSJ:'26/SJ/MKS/08/00001', dariSO:'26/SO/MKS/08/00002', cabang:'Makassar',
      tglFaktur:'08/08/2026', tglJatuhTempo:'08/08/2026', syaratBayar:'CBD',
      customerKode:'CUST-005', customerNama:'UD Sinar Harapan', customerAlamat:'Jl. Perintis Kemerdekaan No. 5, Makassar',
      noDSC:'', principalKode:'', principalNama:'', noReturSJ:'', noPacking:'',
      noSP:'', tglSP:'07/08/2026', jurnal:'JURNAL PENJUALAN KREDIT (IDR)', salesman:'Eka Putri',
      poCustomer:'', driver:'Hendra Gunawan - D 4521 FE (EFG)', kernet:'Rudi Hartono',
      alamatPengirimanTipe:'Alamat Customer', alamatPengiriman:'Jl. Perintis Kemerdekaan No. 5, Makassar',
      tglBatasRetur:'', tipeLayanan:'Reguler',
      items:[
        {kode:'BRG-005', nama:'Mie Instan Indomie Goreng', keterangan:'', qtyPhysical:100, um:'Dus', hna:2500, hna1:2500, discPrincipal:0, discDistributor:0, totalDisc:0, discBarang:0, jumlah:250000, kodePromosi:'', ppnChecked:true},
      ],
      tipePpn:'PPN Eksklusif(+11%)', mataUang:'Rupiah (IDR)', kursPajak:0, tglFakturPajak:'08/08/2026', kodePajak:'04 - DPP Nilai Lain', noFakturPajak:'0400126000000058',
      diskon1:0, diskon2:0, kurs:1, dpp:250000,
      uangMukaTipe:'Tertua', sisaUangMuka:0, uangMukaPakai:0,
      pphAktif:false, pphKode:'', pphPersen:0, pphAmount:0,
      ongkosAngkut:0, ppn:27500, jumlahAkhir:277500, sisaJumlah:277500,
      keterangan:'Faktur Penjualan Via S.J. sesuai S.J. 26/SJ/MKS/08/00001.', tipeTransaksi:'Penjualan Tunai',
      tglInput:'08/08/2026 14:00', userInput:'sidik', tglEdit:'', userEdit:''},
    {no:'26/SI/HO/08/00181', dariSJ:'26/SJ/HO/08/00001', dariSO:'26/SO/HO/08/00011', cabang:'Head Office',
      tglFaktur:'10/08/2026', tglJatuhTempo:'09/09/2026', syaratBayar:'Kredit 30 Hari',
      customerKode:'CUST-001', customerNama:'Toko Sumber Rejeki', customerAlamat:'Jl. Mangga Dua Raya No. 12, Jakarta Pusat',
      noDSC:'', principalKode:'', principalNama:'', noReturSJ:'', noPacking:'',
      noSP:'', tglSP:'07/08/2026', jurnal:'JURNAL PENJUALAN KREDIT (IDR)', salesman:'M. Reza Wijaya',
      poCustomer:'PO/CUST-001/2026-08/0518', driver:'', kernet:'',
      alamatPengirimanTipe:'Alamat Customer', alamatPengiriman:'Jl. Mangga Dua Raya No. 12, Jakarta Pusat',
      tglBatasRetur:'', tipeLayanan:'Reguler',
      items:[
        {kode:'BRG-006', nama:'Kecap Manis ABC 600ml', keterangan:'', qtyPhysical:60, um:'Dus', hna:14000, hna1:14000, discPrincipal:0, discDistributor:0, totalDisc:0, discBarang:0, jumlah:840000, kodePromosi:'', ppnChecked:true},
        {kode:'BRG-009', nama:'Kopi Kapal Api 165gr', keterangan:'', qtyPhysical:20, um:'Dus', hna:14000, hna1:14000, discPrincipal:0, discDistributor:0, totalDisc:0, discBarang:0, jumlah:280000, kodePromosi:'', ppnChecked:true},
      ],
      tipePpn:'PPN Eksklusif(+11%)', mataUang:'Rupiah (IDR)', kursPajak:0, tglFakturPajak:'10/08/2026', kodePajak:'04 - DPP Nilai Lain', noFakturPajak:'0400126000000181',
      diskon1:0, diskon2:0, kurs:1, dpp:1120000,
      uangMukaTipe:'Tertua', sisaUangMuka:0, uangMukaPakai:0,
      pphAktif:false, pphKode:'', pphPersen:0, pphAmount:0,
      ongkosAngkut:0, ppn:123200, jumlahAkhir:1243200, sisaJumlah:1243200,
      keterangan:'Faktur Penjualan Via S.J. sesuai S.J. 26/SJ/HO/08/00001. Diambil sendiri oleh customer, tanpa Driver/Kernet.', tipeTransaksi:'Penjualan Kredit',
      tglInput:'10/08/2026 15:45', userInput:'sidik', tglEdit:'', userEdit:''},
    {no:'26/SI/SMG/08/00064', dariSJ:'26/SJ/SMG/08/00001', dariSO:'26/SO/SMG/08/00004', cabang:'Semarang',
      tglFaktur:'07/08/2026', tglJatuhTempo:'06/09/2026', syaratBayar:'Kredit 30 Hari',
      customerKode:'CUST-007', customerNama:'CV Maju Terus', customerAlamat:'Jl. Pandanaran No. 33, Semarang',
      noDSC:'', principalKode:'', principalNama:'', noReturSJ:'', noPacking:'',
      noSP:'SP/SMG/08/00004', tglSP:'05/08/2026', jurnal:'JURNAL PENJUALAN KREDIT (IDR)', salesman:'Fajar Nugroho',
      poCustomer:'PO/CUST-007/2026-08/0091', driver:'Yusuf Setiawan - B 7788 KLM (HIJ)', kernet:'Bagus Prasetyo',
      alamatPengirimanTipe:'Alamat Customer', alamatPengiriman:'Jl. Pandanaran No. 33, Semarang',
      tglBatasRetur:'', tipeLayanan:'Reguler',
      items:[
        {kode:'BRG-007', nama:'Susu Kental Manis Indomilk 380gr', keterangan:'', qtyPhysical:25, um:'Dus', hna:16000, hna1:16000, discPrincipal:0, discDistributor:0, totalDisc:0, discBarang:0, jumlah:400000, kodePromosi:'', ppnChecked:true},
      ],
      tipePpn:'PPN Eksklusif(+11%)', mataUang:'Rupiah (IDR)', kursPajak:0, tglFakturPajak:'07/08/2026', kodePajak:'04 - DPP Nilai Lain', noFakturPajak:'0400126000000064',
      diskon1:0, diskon2:0, kurs:1, dpp:400000,
      uangMukaTipe:'Tertua', sisaUangMuka:0, uangMukaPakai:0,
      pphAktif:false, pphKode:'', pphPersen:0, pphAmount:0,
      ongkosAngkut:0, ppn:44000, jumlahAkhir:444000, sisaJumlah:444000,
      keterangan:'Faktur Penjualan Via S.J. sesuai S.J. 26/SJ/SMG/08/00001.', tipeTransaksi:'Penjualan Kredit',
      tglInput:'07/08/2026 09:50', userInput:'sidik', tglEdit:'', userEdit:''},
    {no:'26/SI/SBY/08/00096', dariSJ:'26/SJ/SBY/08/00002', dariSO:'26/SO/SBY/08/00006', cabang:'Surabaya',
      tglFaktur:'11/08/2026', tglJatuhTempo:'25/08/2026', syaratBayar:'Kredit 14 Hari',
      customerKode:'CUST-008', customerNama:'Toko Sejahtera', customerAlamat:'Jl. Kertajaya No. 67, Surabaya',
      noDSC:'', principalKode:'5016', principalNama:'PT Wilmar Nabati Indonesia', noReturSJ:'', noPacking:'',
      noSP:'SP/SBY/08/00006', tglSP:'09/08/2026', jurnal:'JURNAL PENJUALAN KREDIT (IDR)', salesman:'Andi Wijaya',
      poCustomer:'PO/CUST-008/2026-08/0333', driver:'', kernet:'',
      alamatPengirimanTipe:'Alamat Customer', alamatPengiriman:'Jl. Kertajaya No. 67, Surabaya',
      tglBatasRetur:'', tipeLayanan:'Reguler',
      items:[
        {kode:'BRG-008', nama:'Teh Celup Sariwangi 25s', keterangan:'', qtyPhysical:35, um:'Dus', hna:10000, hna1:10000, discPrincipal:0, discDistributor:0, totalDisc:0, discBarang:0, jumlah:350000, kodePromosi:'', ppnChecked:true},
      ],
      tipePpn:'PPN Eksklusif(+11%)', mataUang:'Rupiah (IDR)', kursPajak:0, tglFakturPajak:'11/08/2026', kodePajak:'04 - DPP Nilai Lain', noFakturPajak:'0400126000000096',
      diskon1:0, diskon2:0, kurs:1, dpp:350000,
      uangMukaTipe:'Tertua', sisaUangMuka:0, uangMukaPakai:0,
      pphAktif:false, pphKode:'', pphPersen:0, pphAmount:0,
      ongkosAngkut:0, ppn:38500, jumlahAkhir:388500, sisaJumlah:388500,
      keterangan:'Faktur Penjualan Via S.J. sesuai S.J. 26/SJ/SBY/08/00002. Dikirim Supplier langsung, tanpa Driver/Kernet internal.', tipeTransaksi:'Penjualan Kredit',
      tglInput:'11/08/2026 13:10', userInput:'sidik', tglEdit:'', userEdit:''},
    {no:'26/SI/HO/08/00182', dariSJ:'26/SJ/HO/08/00002', dariSO:'26/SO/HO/08/00010', cabang:'Head Office',
      tglFaktur:'13/08/2026', tglJatuhTempo:'12/09/2026', syaratBayar:'Kredit 30 Hari',
      customerKode:'CUST-006', customerNama:'Toko Family Mart Jaya', customerAlamat:'Jl. Kelapa Gading Boulevard No. 9, Jakarta Utara',
      noDSC:'', principalKode:'5019', principalNama:'PT Mayora Distribusi', noReturSJ:'', noPacking:'',
      noSP:'SP/HO/08/00010', tglSP:'11/08/2026', jurnal:'JURNAL PENJUALAN KREDIT (IDR)', salesman:'M. Reza Wijaya',
      poCustomer:'PO/CUST-006/2026-08/0602', driver:'Agus Salim - F 3344 AB (KLM)', kernet:'Slamet Riyadi',
      alamatPengirimanTipe:'Alamat Customer', alamatPengiriman:'Jl. Kelapa Gading Boulevard No. 9, Jakarta Utara',
      tglBatasRetur:'', tipeLayanan:'Express',
      items:[
        {kode:'BRG-010', nama:'Sabun Mandi Lifebuoy 90gr', keterangan:'', qtyPhysical:70, um:'Dus', hna:5000, hna1:5000, discPrincipal:0, discDistributor:0, totalDisc:0, discBarang:0, jumlah:350000, kodePromosi:'', ppnChecked:true},
      ],
      tipePpn:'PPN Eksklusif(+11%)', mataUang:'Rupiah (IDR)', kursPajak:0, tglFakturPajak:'13/08/2026', kodePajak:'04 - DPP Nilai Lain', noFakturPajak:'0400126000000182',
      diskon1:0, diskon2:0, kurs:1, dpp:350000,
      uangMukaTipe:'Tertua', sisaUangMuka:0, uangMukaPakai:0,
      pphAktif:false, pphKode:'', pphPersen:0, pphAmount:0,
      ongkosAngkut:0, ppn:38500, jumlahAkhir:388500, sisaJumlah:388500,
      keterangan:'Faktur Penjualan Via S.J. sesuai S.J. 26/SJ/HO/08/00002.', tipeTransaksi:'Penjualan Kredit',
      tglInput:'13/08/2026 10:00', userInput:'sidik', tglEdit:'', userEdit:''},
  ],
  /* Sales Quotation — menu Customer & Penjualan > Daftar Transaksi >
     Sales Quotation (lihat js/pages/sales-quotation.*). Tahap PALING
     AWAL dari rantai transaksi Customer & Penjualan (Sales Quotation →
     Sales Order → Picking List → Invoice → Penjualan Via S.J.) — belum
     di-chain otomatis ke DATA.salesOrders (Sales Quotation dibuat manual
     oleh sales, baru SEBAGIAN yang berlanjut jadi Sales Order sungguhan,
     ditandai lewat `ts:'Jadi SO'`). No. SQ format GLOBAL 10-digit
     (`26/SQ-0000000001`, TIDAK per-cabang) — persis format di screenshot
     MASERP yang dikirim user (beda dari No. SO/No. PKL/No.IVC yang
     menyisipkan kode cabang). Semua total (HNA1xQty/Potongan/DPP/PPN/
     Jumlah Akhir) diverifikasi lewat script Node terpisah sebelum
     dimasukkan ke sini (formula: Disc/Barang = HNA1 x Discount% / 100
     per-unit, Jumlah = (HNA1-Disc/Barang) x Qty, Potongan dokumen =
     total Disc/Barang x Qty semua baris, PPN 11% hanya utk Type PPN
     'Eksklusif'). `sOffice`/`gudang` dipetakan lewat SQ_GUDANG_BY_CABANG
     (copy verbatim dari PKL_GUDANG_BY_CABANG). Rayon/GROUP/ID/Credit
     Limit/Dominasi Limit semua diturunkan dari DATA.customers via
     sqApplyCustomer() (lihat komentar di sales-quotation.template.js). */
  salesQuotation:[
    {no:'26/SQ-0000000001', noSP:'', noDSC:'', customer:'Toko Sumber Rejeki', area:'Jakarta', ts:'Baru', status:'Pending',
      sOffice:'Head Office', layanan:'Reguler', gudang:'(00-GUU) Gudang Utama-HO', orderVia:'Sales Rep',
      alamat:'Jl. Mangga Dua Raya No. 12, Jakarta Pusat', rayonKode:'RY-JKT01', rayonNama:'Rayon Jakarta Pusat', rayonDistrict:'Jakarta Pusat',
      groupKode:'GRSR', idKode:'CUST-001', top:'N30', cppr1:0, cppr2:0,
      principalKode:'5015', principalNama:'PT Sumber Pangan Nusantara',
      pendingDsc:false, pendingDom:false, pendingGit:false,
      tglSP:'', tglSQ:'07/08/2026', tglKirim:'09/08/2026', catatanSp:'',
      cito:false, spAsli:false, skEd:false,
      creditLimit:50000000, sisaCreditLimit:31750000, belumJatuhTempo:12775000, jatuhTempo:5475000, dominasiLimit:10000000, sisaDominasiLimit:10000000,
      keterangan:'Rencana order rutin bulanan Sembako', pecahFakturAt:0, dimensiM3:0,
      typePpn:'Eksklusif', biayaKirim:40000,
      items:[{kode:'BRG-001', nama:'Minyak Goreng Sunco 2L', um:'Dus', qty:40, hna:25000, hna1:25000, discPercent:2, discBarang:500, hnaXqty:1000000, jumlah:980000}],
      totalHnaXqty:1000000, totalPotongan:20000, totalDpp:980000, totalPpn:107800, jumlahAkhir:1127800,
      tglInput:'07/08/2026 09:12:00', userInput:'sidik', tglEdit:'', userEdit:''},
    {no:'26/SQ-0000000002', noSP:'SP/SBY/08/00007', noDSC:'DSC/SBY/08/00001', customer:'UD Makmur Jaya', area:'Surabaya', ts:'Diproses', status:'Approved',
      sOffice:'Surabaya', layanan:'Reguler', gudang:'(01-GUU) Gudang Utama-SBY', orderVia:'WhatsApp',
      alamat:'Jl. Raya Darmo No. 45, Surabaya', rayonKode:'RY-SBY01', rayonNama:'Rayon Surabaya Kota', rayonDistrict:'Surabaya',
      groupKode:'RTMD', idKode:'CUST-002', top:'N45', cppr1:0, cppr2:0,
      principalKode:'5016', principalNama:'PT Wilmar Nabati Indonesia',
      pendingDsc:true, pendingDom:false, pendingGit:false,
      tglSP:'08/08/2026', tglSQ:'07/08/2026', tglKirim:'10/08/2026', catatanSp:'Menunggu approval DSC',
      cito:false, spAsli:true, skEd:false,
      creditLimit:35000000, sisaCreditLimit:25880000, belumJatuhTempo:6384000, jatuhTempo:2736000, dominasiLimit:7000000, sisaDominasiLimit:7000000,
      keterangan:'Restock Sembako gudang Surabaya', pecahFakturAt:0, dimensiM3:0,
      typePpn:'Eksklusif', biayaKirim:30000,
      items:[{kode:'BRG-002', nama:'Gula Pasir Gulaku 1kg', um:'Karung', qty:100, hna:15000, hna1:15000, discPercent:0, discBarang:0, hnaXqty:1500000, jumlah:1500000}],
      totalHnaXqty:1500000, totalPotongan:0, totalDpp:1500000, totalPpn:165000, jumlahAkhir:1695000,
      tglInput:'07/08/2026 10:30:00', userInput:'sidik', tglEdit:'08/08/2026 08:10:00', userEdit:'sidik'},
    {no:'26/SQ-0000000003', noSP:'SP/BDG/08/00005', noDSC:'', customer:'CV Berkah Abadi', area:'Bandung', ts:'Jadi SO', status:'Approved',
      sOffice:'Bandung', layanan:'Ekspedisi Pihak Ketiga', gudang:'(02-GUU) Gudang Utama-BDG', orderVia:'Telepon',
      alamat:'Jl. Soekarno Hatta No. 88, Bandung', rayonKode:'RY-BDG01', rayonNama:'Rayon Bandung Kota', rayonDistrict:'Bandung',
      groupKode:'RTTR', idKode:'CUST-003', top:'N14', cppr1:0, cppr2:0,
      principalKode:'', principalNama:'',
      pendingDsc:false, pendingDom:false, pendingGit:false,
      tglSP:'09/08/2026', tglSQ:'08/08/2026', tglKirim:'11/08/2026', catatanSp:'Sudah jadi Sales Order 26/SO/BDG/08/00005',
      cito:false, spAsli:false, skEd:true,
      creditLimit:20000000, sisaCreditLimit:15700000, belumJatuhTempo:3010000, jatuhTempo:1290000, dominasiLimit:4000000, sisaDominasiLimit:4000000,
      keterangan:'Order beras premium', pecahFakturAt:0, dimensiM3:0,
      typePpn:'Non PKP', biayaKirim:20000,
      items:[{kode:'BRG-003', nama:'Beras Premium Rojolele 5kg', um:'Karung', qty:20, hna:60000, hna1:60000, discPercent:1.5, discBarang:900, hnaXqty:1200000, jumlah:1182000}],
      totalHnaXqty:1200000, totalPotongan:18000, totalDpp:1182000, totalPpn:0, jumlahAkhir:1202000,
      tglInput:'08/08/2026 09:00:00', userInput:'sidik', tglEdit:'09/08/2026 09:00:00', userEdit:'sidik'},
    {no:'26/SQ-0000000004', noSP:'', noDSC:'', customer:'Toko Anugrah', area:'Medan', ts:'Baru', status:'Pending',
      sOffice:'Medan', layanan:'Reguler', gudang:'(04-GUU) Gudang Utama-MDN', orderVia:'Sales Rep',
      alamat:'Jl. Gatot Subroto No. 21, Medan', rayonKode:'RY-MDN01', rayonNama:'Rayon Medan Kota', rayonDistrict:'Medan',
      groupKode:'SBDS', idKode:'CUST-004', top:'N45', cppr1:0, cppr2:0,
      principalKode:'5020', principalNama:'PT Indofood Distribusi',
      pendingDsc:false, pendingDom:true, pendingGit:false,
      tglSP:'', tglSQ:'06/08/2026', tglKirim:'08/08/2026', catatanSp:'',
      cito:false, spAsli:false, skEd:false,
      creditLimit:15000000, sisaCreditLimit:8400000, belumJatuhTempo:4620000, jatuhTempo:1980000, dominasiLimit:3000000, sisaDominasiLimit:3000000,
      keterangan:'Rencana order Tepung Terigu bulanan', pecahFakturAt:0, dimensiM3:0,
      typePpn:'Eksklusif', biayaKirim:35000,
      items:[{kode:'BRG-004', nama:'Tepung Terigu Segitiga Biru 1kg', um:'Karung', qty:150, hna:12000, hna1:12000, discPercent:0, discBarang:0, hnaXqty:1800000, jumlah:1800000}],
      totalHnaXqty:1800000, totalPotongan:0, totalDpp:1800000, totalPpn:198000, jumlahAkhir:2033000,
      tglInput:'06/08/2026 08:20:00', userInput:'sidik', tglEdit:'', userEdit:''},
    {no:'26/SQ-0000000005', noSP:'', noDSC:'', customer:'UD Sinar Harapan', area:'Makassar', ts:'Batal', status:'Rejected',
      sOffice:'Makassar', layanan:'Reguler', gudang:'(05-GUU) Gudang Utama-MKS', orderVia:'Email',
      alamat:'Jl. Perintis Kemerdekaan No. 5, Makassar', rayonKode:'RY-MKS01', rayonNama:'Rayon Makassar Kota', rayonDistrict:'Makassar',
      groupKode:'HORK', idKode:'CUST-005', top:'N7', cppr1:0, cppr2:0,
      principalKode:'', principalNama:'',
      pendingDsc:false, pendingDom:false, pendingGit:true,
      tglSP:'', tglSQ:'07/08/2026', tglKirim:'', catatanSp:'Batal - customer status Non Aktif',
      cito:false, spAsli:false, skEd:false,
      creditLimit:12000000, sisaCreditLimit:9850000, belumJatuhTempo:1505000, jatuhTempo:645000, dominasiLimit:2400000, sisaDominasiLimit:2400000,
      keterangan:'Ditolak - cek ulang legalitas customer', pecahFakturAt:0, dimensiM3:0,
      typePpn:'Eksklusif', biayaKirim:15000,
      items:[{kode:'BRG-005', nama:'Mie Instan Indomie Goreng', um:'Dus', qty:300, hna:2500, hna1:2500, discPercent:0, discBarang:0, hnaXqty:750000, jumlah:750000}],
      totalHnaXqty:750000, totalPotongan:0, totalDpp:750000, totalPpn:82500, jumlahAkhir:847500,
      tglInput:'07/08/2026 11:00:00', userInput:'sidik', tglEdit:'', userEdit:''},
    {no:'26/SQ-0000000006', noSP:'SP/HO/08/00012', noDSC:'', customer:'Toko Family Mart Jaya', area:'Jakarta', ts:'Diproses', status:'Pending',
      sOffice:'Head Office', layanan:'Express', gudang:'(00-GUU) Gudang Utama-HO', orderVia:'Online',
      alamat:'Jl. Kelapa Gading Boulevard No. 9, Jakarta Utara', rayonKode:'RY-JKT01', rayonNama:'Rayon Jakarta Pusat', rayonDistrict:'Jakarta Pusat',
      groupKode:'INST', idKode:'CUST-006', top:'N30', cppr1:0, cppr2:0,
      principalKode:'5023', principalNama:'PT Sasa Inti',
      pendingDsc:false, pendingDom:false, pendingGit:false,
      tglSP:'10/08/2026', tglSQ:'10/08/2026', tglKirim:'12/08/2026', catatanSp:'CITO - kebutuhan stock display',
      cito:true, spAsli:true, skEd:false,
      creditLimit:28000000, sisaCreditLimit:18130000, belumJatuhTempo:6909000, jatuhTempo:2961000, dominasiLimit:5600000, sisaDominasiLimit:5600000,
      keterangan:'CITO - kebutuhan stock display minggu ini', pecahFakturAt:0, dimensiM3:0,
      typePpn:'Eksklusif', biayaKirim:45000,
      items:[{kode:'BRG-006', nama:'Kecap Manis ABC 600ml', um:'Dus', qty:200, hna:14000, hna1:14000, discPercent:3, discBarang:420, hnaXqty:2800000, jumlah:2716000}],
      totalHnaXqty:2800000, totalPotongan:84000, totalDpp:2716000, totalPpn:298760, jumlahAkhir:3059760,
      tglInput:'10/08/2026 08:00:00', userInput:'sidik', tglEdit:'', userEdit:''},
    {no:'26/SQ-0000000007', noSP:'SP/SMG/08/00004', noDSC:'', customer:'CV Maju Terus', area:'Semarang', ts:'Jadi SO', status:'Approved',
      sOffice:'Semarang', layanan:'Reguler', gudang:'(06-GUU) Gudang Utama-SMG', orderVia:'Telepon',
      alamat:'Jl. Pandanaran No. 33, Semarang', rayonKode:'RY-SMG01', rayonNama:'Rayon Semarang Kota', rayonDistrict:'Semarang',
      groupKode:'KOPR', idKode:'CUST-007', top:'N14', cppr1:0, cppr2:0,
      principalKode:'', principalNama:'',
      pendingDsc:false, pendingDom:false, pendingGit:false,
      tglSP:'05/08/2026', tglSQ:'04/08/2026', tglKirim:'06/08/2026', catatanSp:'Sudah jadi Sales Order 26/SO/SMG/08/00004',
      cito:false, spAsli:true, skEd:false,
      creditLimit:9000000, sisaCreditLimit:7800000, belumJatuhTempo:840000, jatuhTempo:360000, dominasiLimit:1800000, sisaDominasiLimit:1800000,
      keterangan:'Order Susu Kental Manis', pecahFakturAt:0, dimensiM3:0,
      typePpn:'Non PKP', biayaKirim:20000,
      items:[{kode:'BRG-007', nama:'Susu Kental Manis Indomilk 380gr', um:'Dus', qty:100, hna:16000, hna1:16000, discPercent:0, discBarang:0, hnaXqty:1600000, jumlah:1600000}],
      totalHnaXqty:1600000, totalPotongan:0, totalDpp:1600000, totalPpn:0, jumlahAkhir:1620000,
      tglInput:'04/08/2026 13:00:00', userInput:'sidik', tglEdit:'05/08/2026 09:00:00', userEdit:'sidik'},
    {no:'26/SQ-0000000008', noSP:'', noDSC:'', customer:'Toko Sejahtera', area:'Surabaya', ts:'Baru', status:'Pending',
      sOffice:'Surabaya', layanan:'Reguler', gudang:'(01-GUU) Gudang Utama-SBY', orderVia:'Sales Rep',
      alamat:'Jl. Kertajaya No. 67, Surabaya', rayonKode:'RY-SBY01', rayonNama:'Rayon Surabaya Kota', rayonDistrict:'Surabaya',
      groupKode:'EXPR', idKode:'CUST-008', top:'N30', cppr1:0, cppr2:0,
      principalKode:'5016', principalNama:'PT Wilmar Nabati Indonesia',
      pendingDsc:false, pendingDom:false, pendingGit:false,
      tglSP:'', tglSQ:'09/08/2026', tglKirim:'11/08/2026', catatanSp:'',
      cito:false, spAsli:false, skEd:false,
      creditLimit:17500000, sisaCreditLimit:14380000, belumJatuhTempo:2184000, jatuhTempo:936000, dominasiLimit:3500000, sisaDominasiLimit:3500000,
      keterangan:'Rencana order Teh Celup mingguan', pecahFakturAt:0, dimensiM3:0,
      typePpn:'Eksklusif', biayaKirim:25000,
      items:[{kode:'BRG-008', nama:'Teh Celup Sariwangi 25s', um:'Dus', qty:250, hna:10000, hna1:10000, discPercent:2, discBarang:200, hnaXqty:2500000, jumlah:2450000}],
      totalHnaXqty:2500000, totalPotongan:50000, totalDpp:2450000, totalPpn:269500, jumlahAkhir:2744500,
      tglInput:'09/08/2026 10:15:00', userInput:'sidik', tglEdit:'', userEdit:''},
  ],

  /* Bukti Terima Barang / BPB (Supplier & Pembelian > Daftar
     Transaksi > Terima Barang, page 'terimaBarang'), sesuai 2
     screenshot MASERP "Daftar Bukti Penerimaan Barang" (list) &
     "Bukti Terima Barang" (form) yang dikirim user 2026-08-13.
     TAHAP KE-2 rantai transaksi Supplier & Pembelian (Purchase
     Order → **Terima Barang** → Faktur Pembelian → Pelunasan
     Utang) — setiap baris di sini dirantaikan ke 1 baris
     DATA.purchaseOrder nyata (field noPO, cabang, fob, tglPO,
     supplier, alamatPengiriman, & item barang semuanya konsisten
     dengan PO sumbernya, lihat komentar besar di header
     js/pages/terima-barang.template.js untuk detail interpretasi
     tiap field). Status semua baris "Approved" (tidak ada alur
     approval bertingkat di mockup ini, sama simplifikasi seperti
     modul lain). Item dgn `fromPO:false` = "Additional Item" (baris
     ke-6 di bawah mendemokan ini dengan 1 barang bonus BRG-008 yang
     tidak ada di PO 26/PO/HO/08/00003). Baris ke-4 mendemokan Multi
     Batch Number (1 barang datang dalam 2 lot berbeda dari
     supplier). DATA.purchaseOrder TIDAK diubah statusnya (tetap
     "Pending Receive") saat dipakai di sini — konsisten dengan
     konvensi "downstream tidak memutasi status upstream" yang
     sudah dipakai Picking List (nge-refer Sales Order) & Faktur
     Penjualan Via S.J. (nge-refer S.J.). */
  terimaBarang:[
    {no:'26/BPB/HO/08/00001', noPO:'26/PO/HO/08/00011', tglPO:'06/08/2026', supplier:'PT Sumber Pangan Nusantara',
      noSJSupplier:'SJ/SPN/08/0231', keterangan:'26/SR/HO/08/00003 - Sembako Gudang Utama', status:'Approved',
      cabang:'Head Office', cabangTarget:'Head Office', fob:'', noOtomatis:'BPB001',
      tglSJK:'07/08/2026', tglKedatangan:'08/08/2026', alamatPengiriman:'Jl. Raya Industri No. 10, Kawasan Pergudangan Cakung, Jakarta Timur', kurs:1,
      items:[{kode:'BRG-001', nama:'Minyak Goreng Sunco 2L', satuan:'Dus', barcode:'8990011000110', qtyPesan:200, qtyTerima:200, batasQtyTerima:200, fromPO:true,
        batches:[{batch:'LOT-SPN-0806', qty:200, exp:'06/02/2027'}]}],
      tglInput:'08/08/2026 09:10:00', userInput:'sidik', tglEdit:'', userEdit:''},
    {no:'26/BPB/HO/08/00002', noPO:'26/PO/HO/08/00010', tglPO:'06/08/2026', supplier:'PT Wilmar Nabati Indonesia',
      noSJSupplier:'SJ/WNI/08/0088', keterangan:'26/SR/BDG/08/00001 - Stok Jabar', status:'Approved',
      cabang:'Head Office', cabangTarget:'Head Office', fob:'', noOtomatis:'BPB001',
      tglSJK:'08/08/2026', tglKedatangan:'09/08/2026', alamatPengiriman:'Jl. Ir. H. Juanda No. 88, Bandung', kurs:1,
      items:[{kode:'BRG-002', nama:'Gula Pasir Gulaku 1kg', satuan:'Karung', barcode:'8990021000210', qtyPesan:500, qtyTerima:500, batasQtyTerima:500, fromPO:true,
        batches:[{batch:'LOT-WNI-0807', qty:500, exp:'08/02/2027'}]}],
      tglInput:'09/08/2026 10:05:00', userInput:'sidik', tglEdit:'', userEdit:''},
    {no:'26/BPB/HO/08/00003', noPO:'26/PO/HO/08/00009', tglPO:'06/08/2026', supplier:'CV Distribusi Sentosa',
      noSJSupplier:'SJ/CDS/08/0045', keterangan:'PO Administrasi Kasbon II/SDL/VII/2026', status:'Approved',
      cabang:'Head Office', cabangTarget:'Head Office', fob:'', noOtomatis:'BPB001',
      tglSJK:'07/08/2026', tglKedatangan:'08/08/2026', alamatPengiriman:'Jl. Ir. H. Juanda No. 88, Bandung', kurs:1,
      items:[{kode:'BRG-004', nama:'Tepung Terigu Segitiga Biru 1kg', satuan:'Karung', barcode:'8990041000410', qtyPesan:100, qtyTerima:100, batasQtyTerima:100, fromPO:true,
        batches:[{batch:'LOT-CDS-0807', qty:100, exp:'07/02/2027'}]}],
      tglInput:'08/08/2026 11:20:00', userInput:'sidik', tglEdit:'', userEdit:''},
    {no:'26/BPB/HO/08/00004', noPO:'26/PO/HO/08/00007_RI', tglPO:'06/08/2026', supplier:'PT Sasa Inti',
      noSJSupplier:'SJ/SASA/08/0512', keterangan:'26/SR/HO/08/00002 - Pemenuhan Toko Anugrah', status:'Approved',
      cabang:'Head Office', cabangTarget:'Head Office', fob:'', noOtomatis:'BPB001',
      tglSJK:'08/08/2026', tglKedatangan:'09/08/2026', alamatPengiriman:'Jl. Raya Industri No. 10, Kawasan Pergudangan Cakung, Jakarta Timur', kurs:1,
      items:[{kode:'BRG-006', nama:'Kecap Manis ABC 600ml', satuan:'Dus', barcode:'8990061000610', qtyPesan:300, qtyTerima:300, batasQtyTerima:300, fromPO:true,
        batches:[{batch:'LOT-SASA-A', qty:200, exp:'09/02/2027'}, {batch:'LOT-SASA-B', qty:100, exp:'09/02/2027'}]}],
      tglInput:'09/08/2026 13:40:00', userInput:'sidik', tglEdit:'', userEdit:''},
    {no:'26/BPB/HO/08/00005', noPO:'26/PO/HO/08/00006', tglPO:'06/08/2026', supplier:'PT Sasa Inti',
      noSJSupplier:'SJ/SASA/08/0513', keterangan:'26/SR/HO/08/00001 - Pemenuhan Toko Sejahtera', status:'Approved',
      cabang:'Head Office', cabangTarget:'Head Office', fob:'', noOtomatis:'BPB001',
      tglSJK:'08/08/2026', tglKedatangan:'09/08/2026', alamatPengiriman:'Jl. Raya Industri No. 10, Kawasan Pergudangan Cakung, Jakarta Timur', kurs:1,
      items:[{kode:'BRG-006', nama:'Kecap Manis ABC 600ml', satuan:'Dus', barcode:'8990061000610', qtyPesan:150, qtyTerima:150, batasQtyTerima:150, fromPO:true,
        batches:[{batch:'LOT-SASA-C', qty:150, exp:'09/02/2027'}]}],
      tglInput:'09/08/2026 14:05:00', userInput:'sidik', tglEdit:'', userEdit:''},
    {no:'26/BPB/HO/08/00006', noPO:'26/PO/HO/08/00003', tglPO:'05/08/2026', supplier:'PT Sumber Pangan Nusantara',
      noSJSupplier:'SJ/SPN/08/0198', keterangan:'26/SR/SMG/08/00001 - Penambahan Stok Semarang', status:'Approved',
      cabang:'Head Office', cabangTarget:'Head Office', fob:'', noOtomatis:'BPB001',
      tglSJK:'06/08/2026', tglKedatangan:'07/08/2026', alamatPengiriman:'Jl. Pemuda No. 45, Semarang', kurs:1,
      items:[
        {kode:'BRG-007', nama:'Susu Kental Manis Indomilk 380gr', satuan:'Dus', barcode:'8990071000710', qtyPesan:100, qtyTerima:100, batasQtyTerima:100, fromPO:true,
          batches:[{batch:'LOT-SPN-0806B', qty:100, exp:'06/08/2027'}]},
        {kode:'BRG-008', nama:'Teh Celup Sariwangi 25s', satuan:'Dus', barcode:'8990081000810', qtyPesan:0, qtyTerima:10, batasQtyTerima:0, fromPO:false,
          batches:[{batch:'BONUS-SPN-0806', qty:10, exp:'06/08/2027'}]},
      ],
      tglInput:'07/08/2026 09:30:00', userInput:'sidik', tglEdit:'', userEdit:''},
  ],

  /* Pembelian Melalui BPB (Supplier & Pembelian > Daftar Transaksi
     > Pembelian Melalui BPB, page 'pembelianBPB'), sesuai 2
     screenshot MASERP "Daftar Pembelian Melalui BPB" (list) &
     "Pembelian Melalui BPB" (form) yang dikirim user 2026-08-13.
     TAHAP KE-3 rantai transaksi Supplier & Pembelian (Purchase
     Order → Terima Barang → **Pembelian Melalui BPB** → Pelunasan
     Utang) — setiap baris di sini dirantaikan ke 1 baris
     DATA.terimaBarang nyata (field noBPB/noPO/supplier/
     alamatPengiriman semua konsisten dengan BPB sumbernya, Harga
     Beli tiap item diambil dari DATA.items, Fee Distribusi/Budget
     Diskon/PPh SENGAJA disamakan dengan PO asalnya supaya seluruh
     angka Jumlah/DPP/PPN/PPh/Jumlah Total identik dengan baris
     DATA.purchaseOrder terkait — realistis karena syarat harga/
     diskon/pajak yang dinegosiasikan saat PO seharusnya konsisten
     sampai ke Faktur Pembelian, sudah diverifikasi ulang lewat
     Node terpisah sebelum ditulis). Hanya 4 dari 6 baris
     DATA.terimaBarang yang sudah difakturkan di sini (BPB
     26/BPB/HO/08/00005 & 26/BPB/HO/08/00006 SENGAJA belum, supaya
     popup "Pilih Purchase Order / BPB" di mode Tambah masih py
     pilihan tersisa untuk didemokan). Field Uang Muka (Sisa
     U.Muka/Pakai) semua 0 (tidak ada Uang Muka Supplier tercatat di
     mockup ini), Pembayaran semua 0 (belum ada modul Pelunasan
     Utang, tahap berikutnya di rantai ini yang belum dibangun).
     DATA.terimaBarang TIDAK diubah/ditandai statusnya saat dipakai
     di sini — konsisten dengan konvensi "downstream tidak memutasi
     status upstream" yang sudah dipakai Picking List/Faktur
     Penjualan Via S.J./Terima Barang sendiri. */
  pembelianBPB:[
    {no:'26/PU/HO/08/00001', noBPB:'26/BPB/HO/08/00001', noPO:'26/PO/HO/08/00011', noReturPB:'26/RP-HO/08/00001', supplier:'PT Sumber Pangan Nusantara',
      keterangan:'PJK/SPN/08/0231 ; SJK SJ/SPN/08/0231 ; 26/BPB/HO/08/00001',
      cabang:'Head Office', noOtomatis:'PU001',
      tglFaktur:'09/08/2026', syaratBayar:'Kredit 60 Hari', tglJatuhTempo:'08/10/2026',
      supplierNoFaktur:'INV/SPN/08/0231-A', jurnal:'JURNAL PEMBELIAN KREDIT (IDR)', alamatPengiriman:'Jl. Raya Industri No. 10, Kawasan Pergudangan Cakung, Jakarta Timur',
      items:[{kode:'BRG-001', nama:'Minyak Goreng Sunco 2L', qty:200, um:'Dus', hargaBeli:25000, feeDistribusi:5, budgetDiskon:0, totalDisc:5, discBarang:250000, jumlah:4750000, pph:true, ppn:true}],
      ppnMode:'eksklusif', mataUang:'IDR', tglFakturPajak:'09/08/2026', noFakturPajak:'PJK/SPN/08/0231',
      kurs:1, diskon1:0, diskon1Amount:0, diskon2:0, diskon2Amount:0, dpp:4750000, pajak11:'PPN11', ppnAmount:522500,
      pphAktif:true, pphKode:'PPH 22 (0.3)', pphPersen:0.3, pphAmount:14250, ongkosAngkut:0, jumlahTotal:5258250,
      uangMukaTipe:'Oldest', sisaUangMuka:0, uangMukaPakai:0, sisaJumlah:5258250,
      /* pembayaran DIISI 5.258.250 (lunas PENUH) — dilunasi lewat Pelunasan
         Utang 26/CL/HO/08/00001 (lihat DATA.pelunasanUtang, js/pages/
         pelunasan-utang.*), pembuktian mekanisme `pembayaran` end-to-end. */
      pembayaran:5258250, tglInput:'09/08/2026 15:10:00', userInput:'sidik', tglEdit:'', userEdit:''},
    {no:'26/PU/HO/08/00002', noBPB:'26/BPB/HO/08/00002', noPO:'26/PO/HO/08/00010', noReturPB:'26/RP-HO/08/00002', supplier:'PT Wilmar Nabati Indonesia',
      keterangan:'PJK/WNI/08/0088 ; SJK SJ/WNI/08/0088 ; 26/BPB/HO/08/00002',
      cabang:'Head Office', noOtomatis:'PU001',
      tglFaktur:'10/08/2026', syaratBayar:'Kredit 45 Hari', tglJatuhTempo:'24/09/2026',
      supplierNoFaktur:'INV/WNI/08/0088-A', jurnal:'JURNAL PEMBELIAN KREDIT (IDR)', alamatPengiriman:'Jl. Ir. H. Juanda No. 88, Bandung',
      items:[{kode:'BRG-002', nama:'Gula Pasir Gulaku 1kg', qty:500, um:'Karung', hargaBeli:15000, feeDistribusi:2, budgetDiskon:0, totalDisc:2, discBarang:150000, jumlah:7350000, pph:false, ppn:true}],
      ppnMode:'eksklusif', mataUang:'IDR', tglFakturPajak:'10/08/2026', noFakturPajak:'PJK/WNI/08/0088',
      kurs:1, diskon1:0, diskon1Amount:0, diskon2:0, diskon2Amount:0, dpp:7350000, pajak11:'PPN11', ppnAmount:808500,
      pphAktif:false, pphKode:'', pphPersen:0, pphAmount:0, ongkosAngkut:0, jumlahTotal:8158500,
      uangMukaTipe:'Oldest', sisaUangMuka:0, uangMukaPakai:0, sisaJumlah:8158500,
      /* pembayaran DIISI 5.000.000 (lunas SEBAGIAN, sisa 3.158.500 masih
         outstanding) — dilunasi sebagian lewat Pelunasan Utang
         26/CL/HO/08/00002 (lihat DATA.pelunasanUtang). */
      pembayaran:5000000, tglInput:'10/08/2026 10:45:00', userInput:'sidik', tglEdit:'', userEdit:''},
    {no:'26/PU/HO/08/00003', noBPB:'26/BPB/HO/08/00003', noPO:'26/PO/HO/08/00009', noReturPB:'', supplier:'CV Distribusi Sentosa',
      keterangan:'PJK/CDS/08/0045 ; SJK SJ/CDS/08/0045 ; 26/BPB/HO/08/00003',
      cabang:'Head Office', noOtomatis:'PU001',
      tglFaktur:'09/08/2026', syaratBayar:'Kredit 14 Hari', tglJatuhTempo:'23/08/2026',
      supplierNoFaktur:'INV/CDS/08/0045-A', jurnal:'JURNAL PEMBELIAN KREDIT (IDR)', alamatPengiriman:'Jl. Ir. H. Juanda No. 88, Bandung',
      items:[{kode:'BRG-004', nama:'Tepung Terigu Segitiga Biru 1kg', qty:100, um:'Karung', hargaBeli:12000, feeDistribusi:0, budgetDiskon:0, totalDisc:0, discBarang:0, jumlah:1200000, pph:false, ppn:true}],
      ppnMode:'eksklusif', mataUang:'IDR', tglFakturPajak:'09/08/2026', noFakturPajak:'PJK/CDS/08/0045',
      kurs:1, diskon1:0, diskon1Amount:0, diskon2:0, diskon2Amount:0, dpp:1200000, pajak11:'PPN11', ppnAmount:132000,
      pphAktif:false, pphKode:'', pphPersen:0, pphAmount:0, ongkosAngkut:0, jumlahTotal:1332000,
      uangMukaTipe:'Oldest', sisaUangMuka:0, uangMukaPakai:0, sisaJumlah:1332000,
      pembayaran:0, tglInput:'09/08/2026 11:50:00', userInput:'sidik', tglEdit:'', userEdit:''},
    {no:'26/PU/HO/08/00004', noBPB:'26/BPB/HO/08/00004', noPO:'26/PO/HO/08/00007_RI', noReturPB:'', supplier:'PT Sasa Inti',
      keterangan:'PJK/SASA/08/0512 ; SJK SJ/SASA/08/0512 ; 26/BPB/HO/08/00004',
      cabang:'Head Office', noOtomatis:'PU001',
      tglFaktur:'10/08/2026', syaratBayar:'Kredit 30 Hari', tglJatuhTempo:'09/09/2026',
      supplierNoFaktur:'INV/SASA/08/0512-A', jurnal:'JURNAL PEMBELIAN KREDIT (IDR)', alamatPengiriman:'Jl. Raya Industri No. 10, Kawasan Pergudangan Cakung, Jakarta Timur',
      items:[{kode:'BRG-006', nama:'Kecap Manis ABC 600ml', qty:300, um:'Dus', hargaBeli:14000, feeDistribusi:3, budgetDiskon:0, totalDisc:3, discBarang:126000, jumlah:4074000, pph:true, ppn:true}],
      ppnMode:'eksklusif', mataUang:'IDR', tglFakturPajak:'10/08/2026', noFakturPajak:'PJK/SASA/08/0512',
      kurs:1, diskon1:0, diskon1Amount:0, diskon2:0, diskon2Amount:0, dpp:4074000, pajak11:'PPN11', ppnAmount:448140,
      pphAktif:true, pphKode:'PPH 22 (0.3)', pphPersen:0.3, pphAmount:12222, ongkosAngkut:0, jumlahTotal:4509918,
      uangMukaTipe:'Oldest', sisaUangMuka:0, uangMukaPakai:0, sisaJumlah:4509918,
      pembayaran:0, tglInput:'10/08/2026 14:20:00', userInput:'sidik', tglEdit:'', userEdit:''},
  ],
  /* Pelunasan Utang — menu Supplier & Pembelian > Daftar Transaksi >
     Pelunasan Utang (lihat js/pages/pelunasan-utang.*, ganti dari
     placeholder lama). 14 baris sesuai screenshot MASERP "Daftar
     Pembayaran Utang" (Total Record: 14) yang dikirim user 2026-08-21.
     Nama Supplier di screenshot asli ("PT SATORIA ANEKA INDUSTRI",
     "NOVAPHARIN", dst — demo perusahaan lain, farmasi/tidak terkait
     DBM) DIGANTI TOTAL dengan Supplier DBM sendiri (DATA.suppliers yg
     sudah ada), lihat catatan lengkap di header pelunasan-utang.
     template.js.

     2 baris PERTAMA benar-benar chained ke DATA.pembelianBPB sungguhan
     (lihat komentar di masing-masing baris pembelianBPB di atas): PT
     Sumber Pangan Nusantara 26/PU/HO/08/00001 dilunasi PENUH, PT
     Wilmar Nabati Indonesia 26/PU/HO/08/00002 dilunasi SEBAGIAN (sisa
     3.158.500 masih outstanding) — pembuktian mekanisme `pembayaran`
     end-to-end, pola identik 2 baris pembuktian DATA.penerimaanPiutang.

     12 baris sisanya historis/dekoratif (fakturNo:'' — TIDAK terhubung
     ke DATA.pembelianBPB, no. faktur di dalamnya sekadar ilustrasi):
     6 baris Cabang non-HO bulan Juli 2026 (1 per cabang TGR/MKS/MDN/
     BDG/SBY/SMG, Supplier dicocokkan dgn field `wilayah` masing-masing
     di DATA.suppliers supaya masuk akal secara geografis — SBY sengaja
     memakai Supplier yg sama dgn baris live #2, mewakili histori
     pembayaran sebelumnya ke supplier yg sama), + 6 baris Cabang Head
     Office bulan Agustus 2026 (Supplier yang wilayahnya tidak memiliki
     cabang tersendiri di PU_CABANG_LIST — Yogyakarta/Solo/Bekasi/
     Cirebon/Jakarta Selatan — dibayar terpusat lewat Head Office; PT
     Mayora Distribusi dipakai 2x di tanggal berbeda, wajar utk
     supplier FMCG rutin). CATATAN: DATA.suppliers CV Distribusi
     Sentosa & PT Sasa Inti SENGAJA tidak dipakai jadi baris "lunas
     penuh" di sini (mereka baris historis Juli sengaja ilustrasi
     "pembayaran cicilan sebelumnya", BUKAN pelunasan penuh faktur
     26/PU/HO/08/00003 & 00004 miliknya yg TETAP dibiarkan utuh belum
     tersentuh sama sekali di DATA.pembelianBPB) — coba "+ Tambah" &
     pilih salah satu Supplier ini utk melihat faktur itu muncul nyata
     di tab Lunasi Beberapa Faktur.

     Tiap baris jurnalMode:'otomatis' dgn jurnalAkun 2 baris standar
     (Hutang Usaha 2110001 Debit / Akun Bank terkait Kredit) — sudah
     dihitung supaya balance (Debit=Kredit=totalPembayaran), konsisten
     dgn puBuildJurnalOtomatis() (pelunasan-utang.js). */
  pelunasanUtang:[
    {no:'26/CL/HO/08/00002', cabang:'Head Office', tgl:'13/08/2026',
      supplierKode:'5016', supplierNama:'PT Wilmar Nabati Indonesia', noPengajuanPembayaran:'',
      akunBankKode:'110106', tipeTransaksi:'Keluar Kas', cair:true, noGiro:'', tglJthTempoBank:'13/08/2026', kursTarget:1,
      fakturs:[{no:'26/PU/HO/08/00002', supplierNoFaktur:'INV/WNI/08/0088-A', tipeTransaksi:'Beli Kredit', tglFaktur:'10/08/2026', tglJthTempo:'24/09/2026', mataUang:'IDR', kurs:1, reminder:8158500, pembayaran:5000000, checked:true, fakturNo:'26/PU/HO/08/00002'}],
      keterangan:'Pembayaran Hutang Dagang', jumlahTidakSama:true, status:'Approved',
      jurnalMode:'otomatis', jurnalAkun:[
        {kodeAkun:'2110001', namaAkun:'Hutang Usaha', keterangan:'PT Wilmar Nabati Indonesia', debit:5000000, kredit:0},
        {kodeAkun:'110106', namaAkun:'110106 - Bank Mandiri HO', keterangan:'PT Wilmar Nabati Indonesia', debit:0, kredit:5000000},
      ],
      totalPembayaran:5000000, jumlahKeluarKas:5000000, jumlahUtang:5000000},
    {no:'26/CL/HO/08/00001', cabang:'Head Office', tgl:'12/08/2026',
      supplierKode:'5015', supplierNama:'PT Sumber Pangan Nusantara', noPengajuanPembayaran:'',
      akunBankKode:'110107', tipeTransaksi:'Keluar Kas', cair:true, noGiro:'', tglJthTempoBank:'12/08/2026', kursTarget:1,
      fakturs:[{no:'26/PU/HO/08/00001', supplierNoFaktur:'INV/SPN/08/0231-A', tipeTransaksi:'Beli Kredit', tglFaktur:'09/08/2026', tglJthTempo:'08/10/2026', mataUang:'IDR', kurs:1, reminder:5258250, pembayaran:5258250, checked:true, fakturNo:'26/PU/HO/08/00001'}],
      keterangan:'Pembayaran Hutang Dagang', jumlahTidakSama:false, status:'Approved',
      jurnalMode:'otomatis', jurnalAkun:[
        {kodeAkun:'2110001', namaAkun:'Hutang Usaha', keterangan:'PT Sumber Pangan Nusantara', debit:5258250, kredit:0},
        {kodeAkun:'110107', namaAkun:'110107 - Bank BCA HO', keterangan:'PT Sumber Pangan Nusantara', debit:0, kredit:5258250},
      ],
      totalPembayaran:5258250, jumlahKeluarKas:5258250, jumlahUtang:5258250},
    {no:'26/CL/HO/08/00008', cabang:'Head Office', tgl:'19/08/2026',
      supplierKode:'5019', supplierNama:'PT Mayora Distribusi', noPengajuanPembayaran:'',
      akunBankKode:'110107', tipeTransaksi:'Keluar Kas', cair:true, noGiro:'', tglJthTempoBank:'19/08/2026', kursTarget:1,
      fakturs:[{no:'26/PU/HO/08/00099', supplierNoFaktur:'INV/MYR/08/0119', tipeTransaksi:'Beli Kredit', tglFaktur:'05/08/2026', tglJthTempo:'19/08/2026', mataUang:'IDR', kurs:1, reminder:3950000, pembayaran:3950000, checked:true, fakturNo:''}],
      keterangan:'Pembayaran Hutang Dagang', jumlahTidakSama:false, status:'Approved',
      jurnalMode:'otomatis', jurnalAkun:[
        {kodeAkun:'2110001', namaAkun:'Hutang Usaha', keterangan:'PT Mayora Distribusi', debit:3950000, kredit:0},
        {kodeAkun:'110107', namaAkun:'110107 - Bank BCA HO', keterangan:'PT Mayora Distribusi', debit:0, kredit:3950000},
      ],
      totalPembayaran:3950000, jumlahKeluarKas:3950000, jumlahUtang:3950000},
    {no:'26/CL/HO/08/00007', cabang:'Head Office', tgl:'17/08/2026',
      supplierKode:'5026', supplierNama:'PT Roda Mas Trading', noPengajuanPembayaran:'',
      akunBankKode:'110106', tipeTransaksi:'Keluar Kas', cair:true, noGiro:'', tglJthTempoBank:'17/08/2026', kursTarget:1,
      fakturs:[{no:'26/PU/HO/08/00087', supplierNoFaktur:'INV/RMT/08/0064', tipeTransaksi:'Beli Kredit', tglFaktur:'01/08/2026', tglJthTempo:'17/08/2026', mataUang:'IDR', kurs:1, reminder:6600000, pembayaran:6600000, checked:true, fakturNo:''}],
      keterangan:'Pembayaran Hutang Dagang', jumlahTidakSama:false, status:'Approved',
      jurnalMode:'otomatis', jurnalAkun:[
        {kodeAkun:'2110001', namaAkun:'Hutang Usaha', keterangan:'PT Roda Mas Trading', debit:6600000, kredit:0},
        {kodeAkun:'110106', namaAkun:'110106 - Bank Mandiri HO', keterangan:'PT Roda Mas Trading', debit:0, kredit:6600000},
      ],
      totalPembayaran:6600000, jumlahKeluarKas:6600000, jumlahUtang:6600000},
    {no:'26/CL/HO/08/00006', cabang:'Head Office', tgl:'14/08/2026',
      supplierKode:'5024', supplierNama:'Toko Bahan Baku Jaya', noPengajuanPembayaran:'',
      akunBankKode:'110107', tipeTransaksi:'Keluar Kas', cair:true, noGiro:'', tglJthTempoBank:'14/08/2026', kursTarget:1,
      fakturs:[{no:'26/PU/HO/08/00071', supplierNoFaktur:'INV/TBBJ/08/0027', tipeTransaksi:'Beli Kredit', tglFaktur:'31/07/2026', tglJthTempo:'14/08/2026', mataUang:'IDR', kurs:1, reminder:1200000, pembayaran:1200000, checked:true, fakturNo:''}],
      keterangan:'Pembayaran Hutang Dagang', jumlahTidakSama:false, status:'Approved',
      jurnalMode:'otomatis', jurnalAkun:[
        {kodeAkun:'2110001', namaAkun:'Hutang Usaha', keterangan:'Toko Bahan Baku Jaya', debit:1200000, kredit:0},
        {kodeAkun:'110107', namaAkun:'110107 - Bank BCA HO', keterangan:'Toko Bahan Baku Jaya', debit:0, kredit:1200000},
      ],
      totalPembayaran:1200000, jumlahKeluarKas:1200000, jumlahUtang:1200000},
    {no:'26/CL/HO/08/00005', cabang:'Head Office', tgl:'10/08/2026',
      supplierKode:'5022', supplierNama:'CV Karya Abadi', noPengajuanPembayaran:'',
      akunBankKode:'110106', tipeTransaksi:'Keluar Kas', cair:true, noGiro:'', tglJthTempoBank:'10/08/2026', kursTarget:1,
      fakturs:[{no:'26/PU/HO/08/00058', supplierNoFaktur:'INV/CKA/07/0091', tipeTransaksi:'Beli Kredit', tglFaktur:'27/07/2026', tglJthTempo:'10/08/2026', mataUang:'IDR', kurs:1, reminder:2975000, pembayaran:2975000, checked:true, fakturNo:''}],
      keterangan:'Pembayaran Hutang Dagang', jumlahTidakSama:false, status:'Approved',
      jurnalMode:'otomatis', jurnalAkun:[
        {kodeAkun:'2110001', namaAkun:'Hutang Usaha', keterangan:'CV Karya Abadi', debit:2975000, kredit:0},
        {kodeAkun:'110106', namaAkun:'110106 - Bank Mandiri HO', keterangan:'CV Karya Abadi', debit:0, kredit:2975000},
      ],
      totalPembayaran:2975000, jumlahKeluarKas:2975000, jumlahUtang:2975000},
    {no:'26/CL/HO/08/00004', cabang:'Head Office', tgl:'07/08/2026',
      supplierKode:'5021', supplierNama:'UD Sumber Makmur', noPengajuanPembayaran:'',
      akunBankKode:'110107', tipeTransaksi:'Keluar Kas', cair:true, noGiro:'', tglJthTempoBank:'07/08/2026', kursTarget:1,
      fakturs:[{no:'26/PU/HO/08/00042', supplierNoFaktur:'INV/USM/07/0038', tipeTransaksi:'Beli Kredit', tglFaktur:'25/07/2026', tglJthTempo:'07/08/2026', mataUang:'IDR', kurs:1, reminder:1850000, pembayaran:1850000, checked:true, fakturNo:''}],
      keterangan:'Pembayaran Hutang Dagang', jumlahTidakSama:false, status:'Approved',
      jurnalMode:'otomatis', jurnalAkun:[
        {kodeAkun:'2110001', namaAkun:'Hutang Usaha', keterangan:'UD Sumber Makmur', debit:1850000, kredit:0},
        {kodeAkun:'110107', namaAkun:'110107 - Bank BCA HO', keterangan:'UD Sumber Makmur', debit:0, kredit:1850000},
      ],
      totalPembayaran:1850000, jumlahKeluarKas:1850000, jumlahUtang:1850000},
    {no:'26/CL/HO/08/00003', cabang:'Head Office', tgl:'05/08/2026',
      supplierKode:'5019', supplierNama:'PT Mayora Distribusi', noPengajuanPembayaran:'',
      akunBankKode:'110107', tipeTransaksi:'Keluar Kas', cair:true, noGiro:'', tglJthTempoBank:'05/08/2026', kursTarget:1,
      fakturs:[{no:'26/PU/HO/08/00033', supplierNoFaktur:'INV/MYR/07/0102', tipeTransaksi:'Beli Kredit', tglFaktur:'22/07/2026', tglJthTempo:'05/08/2026', mataUang:'IDR', kurs:1, reminder:8400000, pembayaran:8400000, checked:true, fakturNo:''}],
      keterangan:'Pembayaran Hutang Dagang', jumlahTidakSama:false, status:'Approved',
      jurnalMode:'otomatis', jurnalAkun:[
        {kodeAkun:'2110001', namaAkun:'Hutang Usaha', keterangan:'PT Mayora Distribusi', debit:8400000, kredit:0},
        {kodeAkun:'110107', namaAkun:'110107 - Bank BCA HO', keterangan:'PT Mayora Distribusi', debit:0, kredit:8400000},
      ],
      totalPembayaran:8400000, jumlahKeluarKas:8400000, jumlahUtang:8400000},
    {no:'26/CL/TGR/07/00001', cabang:'Tangerang', tgl:'24/07/2026',
      supplierKode:'5025', supplierNama:'CV Anugerah Logistik', noPengajuanPembayaran:'',
      akunBankKode:'110115', tipeTransaksi:'Keluar Kas', cair:true, noGiro:'', tglJthTempoBank:'24/07/2026', kursTarget:1,
      fakturs:[{no:'26/PU/TGR/07/00012', supplierNoFaktur:'INV/CAL/07/0015', tipeTransaksi:'Beli Kredit', tglFaktur:'10/07/2026', tglJthTempo:'24/07/2026', mataUang:'IDR', kurs:1, reminder:4200000, pembayaran:4200000, checked:true, fakturNo:''}],
      keterangan:'Pembayaran Hutang Dagang', jumlahTidakSama:false, status:'Approved',
      jurnalMode:'otomatis', jurnalAkun:[
        {kodeAkun:'2110001', namaAkun:'Hutang Usaha', keterangan:'CV Anugerah Logistik', debit:4200000, kredit:0},
        {kodeAkun:'110115', namaAkun:'110115 - Bank BCA TGR', keterangan:'CV Anugerah Logistik', debit:0, kredit:4200000},
      ],
      totalPembayaran:4200000, jumlahKeluarKas:4200000, jumlahUtang:4200000},
    {no:'26/CL/MKS/07/00001', cabang:'Makassar', tgl:'23/07/2026',
      supplierKode:'5023', supplierNama:'PT Sasa Inti', noPengajuanPembayaran:'',
      akunBankKode:'110121', tipeTransaksi:'Keluar Kas', cair:true, noGiro:'', tglJthTempoBank:'23/07/2026', kursTarget:1,
      fakturs:[{no:'26/PU/MKS/07/00009', supplierNoFaktur:'INV/SASA/07/0388', tipeTransaksi:'Beli Kredit', tglFaktur:'09/07/2026', tglJthTempo:'23/07/2026', mataUang:'IDR', kurs:1, reminder:6750000, pembayaran:6750000, checked:true, fakturNo:''}],
      keterangan:'Pembayaran Hutang Dagang', jumlahTidakSama:false, status:'Approved',
      jurnalMode:'otomatis', jurnalAkun:[
        {kodeAkun:'2110001', namaAkun:'Hutang Usaha', keterangan:'PT Sasa Inti', debit:6750000, kredit:0},
        {kodeAkun:'110121', namaAkun:'110121 - Bank Danamon MKS', keterangan:'PT Sasa Inti', debit:0, kredit:6750000},
      ],
      totalPembayaran:6750000, jumlahKeluarKas:6750000, jumlahUtang:6750000},
    {no:'26/CL/MDN/07/00001', cabang:'Medan', tgl:'22/07/2026',
      supplierKode:'5020', supplierNama:'PT Indofood Distribusi', noPengajuanPembayaran:'',
      akunBankKode:'110118', tipeTransaksi:'Keluar Kas', cair:true, noGiro:'', tglJthTempoBank:'22/07/2026', kursTarget:1,
      fakturs:[{no:'26/PU/MDN/07/00016', supplierNoFaktur:'INV/IFD/07/0203', tipeTransaksi:'Beli Kredit', tglFaktur:'06/07/2026', tglJthTempo:'22/07/2026', mataUang:'IDR', kurs:1, reminder:15300000, pembayaran:15300000, checked:true, fakturNo:''}],
      keterangan:'Pembayaran Hutang Dagang', jumlahTidakSama:false, status:'Approved',
      jurnalMode:'otomatis', jurnalAkun:[
        {kodeAkun:'2110001', namaAkun:'Hutang Usaha', keterangan:'PT Indofood Distribusi', debit:15300000, kredit:0},
        {kodeAkun:'110118', namaAkun:'110118 - Bank BRI MDN', keterangan:'PT Indofood Distribusi', debit:0, kredit:15300000},
      ],
      totalPembayaran:15300000, jumlahKeluarKas:15300000, jumlahUtang:15300000},
    {no:'26/CL/BDG/07/00001', cabang:'Bandung', tgl:'21/07/2026',
      supplierKode:'5018', supplierNama:'CV Distribusi Sentosa', noPengajuanPembayaran:'',
      akunBankKode:'110112', tipeTransaksi:'Keluar Kas', cair:true, noGiro:'', tglJthTempoBank:'21/07/2026', kursTarget:1,
      fakturs:[{no:'26/PU/BDG/07/00007', supplierNoFaktur:'INV/CDS/07/0029', tipeTransaksi:'Beli Kredit', tglFaktur:'07/07/2026', tglJthTempo:'21/07/2026', mataUang:'IDR', kurs:1, reminder:2100000, pembayaran:2100000, checked:true, fakturNo:''}],
      keterangan:'Pembayaran Hutang Dagang', jumlahTidakSama:false, status:'Approved',
      jurnalMode:'otomatis', jurnalAkun:[
        {kodeAkun:'2110001', namaAkun:'Hutang Usaha', keterangan:'CV Distribusi Sentosa', debit:2100000, kredit:0},
        {kodeAkun:'110112', namaAkun:'110112 - Bank Mandiri BDG', keterangan:'CV Distribusi Sentosa', debit:0, kredit:2100000},
      ],
      totalPembayaran:2100000, jumlahKeluarKas:2100000, jumlahUtang:2100000},
    {no:'26/CL/SBY/07/00001', cabang:'Surabaya', tgl:'20/07/2026',
      supplierKode:'5016', supplierNama:'PT Wilmar Nabati Indonesia', noPengajuanPembayaran:'',
      akunBankKode:'110109', tipeTransaksi:'Keluar Kas', cair:true, noGiro:'', tglJthTempoBank:'20/07/2026', kursTarget:1,
      fakturs:[{no:'26/PU/SBY/07/00021', supplierNoFaktur:'INV/WNI/07/0055', tipeTransaksi:'Beli Kredit', tglFaktur:'06/07/2026', tglJthTempo:'20/07/2026', mataUang:'IDR', kurs:1, reminder:9850000, pembayaran:9850000, checked:true, fakturNo:''}],
      keterangan:'Pembayaran Hutang Dagang', jumlahTidakSama:false, status:'Approved',
      jurnalMode:'otomatis', jurnalAkun:[
        {kodeAkun:'2110001', namaAkun:'Hutang Usaha', keterangan:'PT Wilmar Nabati Indonesia', debit:9850000, kredit:0},
        {kodeAkun:'110109', namaAkun:'110109 - Bank BNI SBY', keterangan:'PT Wilmar Nabati Indonesia', debit:0, kredit:9850000},
      ],
      totalPembayaran:9850000, jumlahKeluarKas:9850000, jumlahUtang:9850000},
    {no:'26/CL/SMG/07/00001', cabang:'Semarang', tgl:'19/07/2026',
      supplierKode:'5017', supplierNama:'PT Sinar Meadow', noPengajuanPembayaran:'',
      akunBankKode:'110124', tipeTransaksi:'Keluar Kas', cair:true, noGiro:'', tglJthTempoBank:'19/07/2026', kursTarget:1,
      fakturs:[{no:'26/PU/SMG/07/00010', supplierNoFaktur:'INV/SMD/07/0071', tipeTransaksi:'Beli Kredit', tglFaktur:'05/07/2026', tglJthTempo:'19/07/2026', mataUang:'IDR', kurs:1, reminder:3600000, pembayaran:3600000, checked:true, fakturNo:''}],
      keterangan:'Pembayaran Hutang Dagang', jumlahTidakSama:false, status:'Approved',
      jurnalMode:'otomatis', jurnalAkun:[
        {kodeAkun:'2110001', namaAkun:'Hutang Usaha', keterangan:'PT Sinar Meadow', debit:3600000, kredit:0},
        {kodeAkun:'110124', namaAkun:'110124 - Bank Permata SMG', keterangan:'PT Sinar Meadow', debit:0, kredit:3600000},
      ],
      totalPembayaran:3600000, jumlahKeluarKas:3600000, jumlahUtang:3600000},
  ],
  /* Master Rayon — menu Lain-lain > Rayon (page:'masterRayon', ganti dari
     placeholder lama, lihat js/menu.js). Sesuai 3 screenshot MASERP yang
     dikirim user 2026-08-18: "Daftar Rayon" (list, Total Record: 35) dan
     "Rayon" (form: Kode Rayon readonly, Nama Rayon, Salesman dropdown,
     checkbox Default) + sub-grid nested "Kecamatan" per rayon (kolom
     Kecamatan/"Luar Kota?"/Hapus, tombol "+ Tambah Kecamatan", DAN gaya
     pager BARU yang belum pernah dipakai modul lain: "First < [halaman]
     to Y Of Total > Last" — lihat tplRyKecPager()/openRyKecPage() di
     master-rayon.js).
     35 baris: 10 nama PERSIS dari screenshot (BANTEN 1, BEKASI 1, BOGOR1,
     BOGOR2, JAKARTA1, JAKARTA2, JEMBER, JOGJA, KEDIRI, MADIUN) + 25 nama
     kota/kabupaten lain yang DIKARANG supaya genap 35 (Total Record: 35
     persis sesuai screenshot). Kode Rayon = nama tanpa spasi (mis. "BANTEN
     1"->"BANTEN1"), format ini terlihat langsung dari screenshot (kolom
     Kode Rayon menampilkan string yang sama dengan Nama Rayon tanpa
     spasi), BUKAN kode independen seperti "RY-xxx" yang dipakai
     CST_AREA_LIST di master-customer.template.js — 2 modul ini SENGAJA
     tidak disatukan (tidak ada instruksi untuk itu, dan constant
     CST_AREA_LIST cuma dipakai lokal oleh form Customer, tidak
     mereferensi DATA.rayon), jadi tidak ada risiko pecah referensi.
     Salesman pakai daftar lokal RY_SALESMAN_LIST (10 nama PERSIS dari
     screenshot: BABAY SUHAEMI dst.) di master-rayon.template.js, BUKAN
     DATA.salesman (7 baris) yang sudah dipakai Dashboard Sales — supaya
     tidak mengubah data yang sudah dipakai chart di modul lain.
     isDefault: true hanya utk 2 baris (JAKARTA1 & KARAWANG) sekadar
     contoh kedua state checkbox Default; sisanya false (unchecked)
     sesuai screenshot form yang menunjukkan Default tidak dicentang +
     label "Tidak".
     kecamatan[]: screenshot BANTEN 1 menunjukkan total 117 kecamatan
     dengan pager "1 to 12 Of 117" — mockup ini SENGAJA menurunkan skala
     jumlah datanya (BANTEN1 dibuat 24 baris, rayon lain 3-11 baris) demi
     kepraktisan, TAPI struktur pager barunya (tplRyKecPager) dibuat
     BENAR-BENAR FUNGSIONAL (bukan dekoratif) supaya perilaku navigasi
     multi-halamannya tetap teruji nyata. 10 nama kecamatan pertama utk
     BANTEN1 (Angsana, Anyar, Balaraja, Bandung, Banjar, Banjarsari,
     Baros, Bayah, Binuang, Bojonegara) PERSIS sesuai screenshot; sisanya
     + seluruh rayon lain memakai daur ulang pool nama kecamatan gaya
     Banten (KEC_POOL di master-rayon.template.js, ~60 nama) dengan
     offset berbeda per rayon. Field luarKota:true diberi sesekali (tiap
     baris ke-6 dalam tiap rayon) sekadar contoh kedua state checkbox
     "Luar Kota?".

     UPDATE 2026-08-18 (revisi sama hari): user mengirim ulang screenshot
     "Daftar Rayon"/"Rayon" ASLI MASERP dgn kualitas lebih jelas, ternyata
     Nama Rayon utk 10 baris PERSIS itu bukan cuma nama kota polos, tapi
     ada rincian wilayah dalam kurung, mis. "BANTEN 01 (LEBAK, PANDEGLANG,
     KAB & KOTA SERANG, KOTA CILEGON)", "BOGOR 2 (CILEUNGSI - CIBUBUR -
     JONGGOL - CIBARUSAH - DEPOK)", dst — kode Rayon "BANTEN 1"/"BEKASI 1"
     juga PAKAI SPASI (bukan "BANTEN1"/"BEKASI1" seperti revisi pertama).
     10 baris ini sudah disesuaikan PERSIS dgn screenshot (kode+nama),
     salesman/isDefault/kecamatan TIDAK berubah. 25 baris rayon "dikarang"
     lainnya SENGAJA dibiarkan nama kota polos tanpa rincian kurung (mis.
     JOGJA/KEDIRI di 10 baris asli pun memang tidak ada rincian kurung —
     jadi ini konsisten, bukan berarti kurang lengkap). */
  rayon:[
    {kode:'BANTEN 1', nama:'BANTEN 01 (LEBAK, PANDEGLANG, KAB & KOTA SERANG, KOTA CILEGON)', salesman:'BABAY SUHAEMI', isDefault:false, kecamatan:[{nama:'Angsana', luarKota:false}, {nama:'Anyar', luarKota:false}, {nama:'Balaraja', luarKota:false}, {nama:'Bandung', luarKota:false}, {nama:'Banjar', luarKota:false}, {nama:'Banjarsari', luarKota:true}, {nama:'Baros', luarKota:false}, {nama:'Bayah', luarKota:false}, {nama:'Binuang', luarKota:false}, {nama:'Bojonegara', luarKota:false}, {nama:'Cikande', luarKota:false}, {nama:'Cikeusal', luarKota:true}, {nama:'Cikupa', luarKota:false}, {nama:'Cileles', luarKota:false}, {nama:'Cimanggu', luarKota:false}, {nama:'Cinangka', luarKota:false}, {nama:'Cipanas', luarKota:false}, {nama:'Cipeundeuy', luarKota:true}, {nama:'Cipocok Jaya', luarKota:false}, {nama:'Ciruas', luarKota:false}, {nama:'Curug', luarKota:false}, {nama:'Gunung Kaler', luarKota:false}, {nama:'Jawilan', luarKota:false}, {nama:'Jayanti', luarKota:true}]},
    {kode:'BEKASI 1', nama:'BEKASI 1 (KAB. BEKASI - CIBITUNG)', salesman:'ARI ARIH GINTING SUKA', isDefault:false, kecamatan:[{nama:'Bayah', luarKota:false}, {nama:'Binuang', luarKota:false}, {nama:'Bojonegara', luarKota:false}, {nama:'Cikande', luarKota:false}, {nama:'Cikeusal', luarKota:false}, {nama:'Cikupa', luarKota:true}, {nama:'Cileles', luarKota:false}, {nama:'Cimanggu', luarKota:false}]},
    {kode:'BOGOR1', nama:'BOGOR 1 (KAB. BOGOR - KOTA BOGOR)', salesman:'SYAEFUL ANWAR', isDefault:false, kecamatan:[{nama:'Cimanggu', luarKota:false}, {nama:'Cinangka', luarKota:false}, {nama:'Cipanas', luarKota:false}, {nama:'Cipeundeuy', luarKota:false}]},
    {kode:'BOGOR2', nama:'BOGOR 2 (CILEUNGSI - CIBUBUR - JONGGOL - CIBARUSAH - DEPOK)', salesman:'ANDRI MUHAMMAD', isDefault:false, kecamatan:[{nama:'Gunung Kaler', luarKota:false}, {nama:'Jawilan', luarKota:false}, {nama:'Jayanti', luarKota:false}, {nama:'Kaduhejo', luarKota:false}, {nama:'Kibin', luarKota:false}, {nama:'Kopo', luarKota:true}, {nama:'Kragilan', luarKota:false}, {nama:'Kresek', luarKota:false}, {nama:'Kronjo', luarKota:false}]},
    {kode:'JAKARTA1', nama:'JAKARTA 1 (JAKBAR - JAKPUS - JAKSEL)', salesman:'ISDI DWI JATMIKO', isDefault:true, kecamatan:[{nama:'Kresek', luarKota:false}, {nama:'Kronjo', luarKota:false}, {nama:'Kutamekar', luarKota:false}, {nama:'Labuan', luarKota:false}, {nama:'Legok', luarKota:false}]},
    {kode:'JAKARTA2', nama:'JAKARTA 2 (JAKTIM - JAKUT - KOTA BEKASI - KAB. BEKASI)', salesman:'SYARIFUDIN', isDefault:false, kecamatan:[{nama:'Menes', luarKota:false}, {nama:'Munjul', luarKota:false}, {nama:'Padarincang', luarKota:false}, {nama:'Pagedangan', luarKota:false}, {nama:'Pamarayan', luarKota:false}, {nama:'Panggarangan', luarKota:true}, {nama:'Panimbang', luarKota:false}, {nama:'Petir', luarKota:false}, {nama:'Pontang', luarKota:false}, {nama:'Pulomerak', luarKota:false}]},
    {kode:'JEMBER', nama:'JEMBER (JEMBER, BONDOWOSO, BANYUWANGI, SITUBONDO)', salesman:'ONI BAHTIAR', isDefault:false, kecamatan:[{nama:'Petir', luarKota:false}, {nama:'Pontang', luarKota:false}, {nama:'Pulomerak', luarKota:false}, {nama:'Rangkasbitung', luarKota:false}, {nama:'Sajira', luarKota:false}, {nama:'Saketi', luarKota:true}]},
    {kode:'JOGJA', nama:'JOGJA', salesman:'ALBERTUS SUBANDONO', isDefault:false, kecamatan:[{nama:'Serang', luarKota:false}, {nama:'Sindangresmi', luarKota:false}, {nama:'Sobang', luarKota:false}, {nama:'Solear', luarKota:false}, {nama:'Sukamulya', luarKota:false}, {nama:'Tanara', luarKota:true}, {nama:'Tenjo', luarKota:false}, {nama:'Tigaraksa', luarKota:false}, {nama:'Tirtayasa', luarKota:false}, {nama:'Tunjung Teja', luarKota:false}, {nama:'Waringinkurung', luarKota:false}]},
    {kode:'KEDIRI', nama:'KEDIRI', salesman:'ONY GALIH PURWO SAPUTRO', isDefault:false, kecamatan:[{nama:'Tigaraksa', luarKota:false}, {nama:'Tirtayasa', luarKota:false}, {nama:'Tunjung Teja', luarKota:false}, {nama:'Waringinkurung', luarKota:false}, {nama:'Warunggunung', luarKota:false}, {nama:'Cadasari', luarKota:true}, {nama:'Angsana', luarKota:false}]},
    {kode:'MADIUN', nama:'MADIUN (MADIUN, PACITAN, PONOROGO, MAGETAN, NGAWI)', salesman:'AGUS PURNOMO', isDefault:false, kecamatan:[{nama:'Anyar', luarKota:false}, {nama:'Balaraja', luarKota:false}, {nama:'Bandung', luarKota:false}]},
    {kode:'BEKASI2', nama:'BEKASI2', salesman:'BABAY SUHAEMI', isDefault:false, kecamatan:[{nama:'Binuang', luarKota:false}, {nama:'Bojonegara', luarKota:false}, {nama:'Cikande', luarKota:false}, {nama:'Cikeusal', luarKota:false}, {nama:'Cikupa', luarKota:false}, {nama:'Cileles', luarKota:true}, {nama:'Cimanggu', luarKota:false}, {nama:'Cinangka', luarKota:false}]},
    {kode:'BOGOR3', nama:'BOGOR3', salesman:'ARI ARIH GINTING SUKA', isDefault:false, kecamatan:[{nama:'Cinangka', luarKota:false}, {nama:'Cipanas', luarKota:false}, {nama:'Cipeundeuy', luarKota:false}, {nama:'Cipocok Jaya', luarKota:false}]},
    {kode:'BANDUNG 01', nama:'BANDUNG 01 (CILEUNYI, MAJALAYA, SUMEDANG, CICALENGKA, BANDUNG KOTA)', salesman:'SYAEFUL ANWAR', isDefault:false, kecamatan:[{nama:'Jawilan', luarKota:false}, {nama:'Jayanti', luarKota:false}, {nama:'Kaduhejo', luarKota:false}, {nama:'Kibin', luarKota:false}, {nama:'Kopo', luarKota:false}, {nama:'Kragilan', luarKota:true}, {nama:'Kresek', luarKota:false}, {nama:'Kronjo', luarKota:false}, {nama:'Kutamekar', luarKota:false}]},
    {kode:'BANDUNG 02 BRT', nama:'BANDUNG 02 BRT (CIMAHI, CILILIN, SOREANG, CIWIDEY, PADALARANG, KOPO, BALEENDAH)', salesman:'ANDRI MUHAMMAD', isDefault:false, kecamatan:[{nama:'Kronjo', luarKota:false}, {nama:'Kutamekar', luarKota:false}, {nama:'Labuan', luarKota:false}, {nama:'Legok', luarKota:false}, {nama:'Mancak', luarKota:false}]},
    {kode:'BANDUNG 03', nama:'BANDUNG 03 (PURWAKARTA, SUBANG)', salesman:'ISDI DWI JATMIKO', isDefault:false, kecamatan:[{nama:'Munjul', luarKota:false}, {nama:'Padarincang', luarKota:false}, {nama:'Pagedangan', luarKota:false}, {nama:'Pamarayan', luarKota:false}, {nama:'Panggarangan', luarKota:false}, {nama:'Panimbang', luarKota:true}, {nama:'Petir', luarKota:false}, {nama:'Pontang', luarKota:false}, {nama:'Pulomerak', luarKota:false}, {nama:'Rangkasbitung', luarKota:false}]},
    {kode:'CIREBON', nama:'CIREBON, KUNINGAN , INDRAMYU, MAJALENGKA', salesman:'SYARIFUDIN', isDefault:false, kecamatan:[{nama:'Pontang', luarKota:false}, {nama:'Pulomerak', luarKota:false}, {nama:'Rangkasbitung', luarKota:false}, {nama:'Sajira', luarKota:false}, {nama:'Saketi', luarKota:false}, {nama:'Sepatan', luarKota:true}]},
    {kode:'PRIANGAN TIMUR', nama:'PRIANGAN TIMUR (KAB. CIAMIS, KAB. GARUT, PANGANDARAN, TASIKMALAYA, KOTA BANJAR)', salesman:'ONI BAHTIAR', isDefault:false, kecamatan:[{nama:'Sindangresmi', luarKota:false}, {nama:'Sobang', luarKota:false}, {nama:'Solear', luarKota:false}, {nama:'Sukamulya', luarKota:false}, {nama:'Tanara', luarKota:false}, {nama:'Tenjo', luarKota:true}, {nama:'Tigaraksa', luarKota:false}, {nama:'Tirtayasa', luarKota:false}, {nama:'Tunjung Teja', luarKota:false}, {nama:'Waringinkurung', luarKota:false}, {nama:'Warunggunung', luarKota:false}]},
    {kode:'BANDUNG 06', nama:'BANDUNG 06 (SUKABUMI & CIANJUR)', salesman:'ALBERTUS SUBANDONO', isDefault:false, kecamatan:[{nama:'Tirtayasa', luarKota:false}, {nama:'Tunjung Teja', luarKota:false}, {nama:'Waringinkurung', luarKota:false}, {nama:'Warunggunung', luarKota:false}, {nama:'Cadasari', luarKota:false}, {nama:'Angsana', luarKota:true}, {nama:'Anyar', luarKota:false}]},
    {kode:'GARUT', nama:'GARUT', salesman:'ONY GALIH PURWO SAPUTRO', isDefault:false, kecamatan:[{nama:'Balaraja', luarKota:false}, {nama:'Bandung', luarKota:false}, {nama:'Banjar', luarKota:false}]},
    {kode:'PURWAKARTA', nama:'PURWAKARTA', salesman:'AGUS PURNOMO', isDefault:false, kecamatan:[{nama:'Bojonegara', luarKota:false}, {nama:'Cikande', luarKota:false}, {nama:'Cikeusal', luarKota:false}, {nama:'Cikupa', luarKota:false}, {nama:'Cileles', luarKota:false}, {nama:'Cimanggu', luarKota:true}, {nama:'Cinangka', luarKota:false}, {nama:'Cipanas', luarKota:false}]},
    {kode:'KARAWANG', nama:'KARAWANG', salesman:'BABAY SUHAEMI', isDefault:true, kecamatan:[{nama:'Cipanas', luarKota:false}, {nama:'Cipeundeuy', luarKota:false}, {nama:'Cipocok Jaya', luarKota:false}, {nama:'Ciruas', luarKota:false}]},
    {kode:'SERANG', nama:'SERANG', salesman:'ARI ARIH GINTING SUKA', isDefault:false, kecamatan:[{nama:'Jayanti', luarKota:false}, {nama:'Kaduhejo', luarKota:false}, {nama:'Kibin', luarKota:false}, {nama:'Kopo', luarKota:false}, {nama:'Kragilan', luarKota:false}, {nama:'Kresek', luarKota:true}, {nama:'Kronjo', luarKota:false}, {nama:'Kutamekar', luarKota:false}, {nama:'Labuan', luarKota:false}]},
    {kode:'CILEGON', nama:'CILEGON', salesman:'SYAEFUL ANWAR', isDefault:false, kecamatan:[{nama:'Kutamekar', luarKota:false}, {nama:'Labuan', luarKota:false}, {nama:'Legok', luarKota:false}, {nama:'Mancak', luarKota:false}, {nama:'Mekarbaru', luarKota:false}]},
    {kode:'SUMEDANG', nama:'SUMEDANG', salesman:'ANDRI MUHAMMAD', isDefault:false, kecamatan:[{nama:'Padarincang', luarKota:false}, {nama:'Pagedangan', luarKota:false}, {nama:'Pamarayan', luarKota:false}, {nama:'Panggarangan', luarKota:false}, {nama:'Panimbang', luarKota:false}, {nama:'Petir', luarKota:true}, {nama:'Pontang', luarKota:false}, {nama:'Pulomerak', luarKota:false}, {nama:'Rangkasbitung', luarKota:false}, {nama:'Sajira', luarKota:false}]},
    {kode:'MALANG', nama:'MALANG', salesman:'ISDI DWI JATMIKO', isDefault:false, kecamatan:[{nama:'Pulomerak', luarKota:false}, {nama:'Rangkasbitung', luarKota:false}, {nama:'Sajira', luarKota:false}, {nama:'Saketi', luarKota:false}, {nama:'Sepatan', luarKota:false}, {nama:'Serang', luarKota:true}]},
    {kode:'SIDOARJO', nama:'SIDOARJO', salesman:'SYARIFUDIN', isDefault:false, kecamatan:[{nama:'Sobang', luarKota:false}, {nama:'Solear', luarKota:false}, {nama:'Sukamulya', luarKota:false}, {nama:'Tanara', luarKota:false}, {nama:'Tenjo', luarKota:false}, {nama:'Tigaraksa', luarKota:true}, {nama:'Tirtayasa', luarKota:false}, {nama:'Tunjung Teja', luarKota:false}, {nama:'Waringinkurung', luarKota:false}, {nama:'Warunggunung', luarKota:false}, {nama:'Cadasari', luarKota:false}]},
    {kode:'GRESIK', nama:'GRESIK', salesman:'ONI BAHTIAR', isDefault:false, kecamatan:[{nama:'Tunjung Teja', luarKota:false}, {nama:'Waringinkurung', luarKota:false}, {nama:'Warunggunung', luarKota:false}, {nama:'Cadasari', luarKota:false}, {nama:'Angsana', luarKota:false}, {nama:'Anyar', luarKota:true}, {nama:'Balaraja', luarKota:false}]},
    {kode:'MOJOKERTO', nama:'MOJOKERTO', salesman:'ALBERTUS SUBANDONO', isDefault:false, kecamatan:[{nama:'Bandung', luarKota:false}, {nama:'Banjar', luarKota:false}, {nama:'Banjarsari', luarKota:false}]},
    {kode:'PASURUAN', nama:'PASURUAN', salesman:'ONY GALIH PURWO SAPUTRO', isDefault:false, kecamatan:[{nama:'Cikande', luarKota:false}, {nama:'Cikeusal', luarKota:false}, {nama:'Cikupa', luarKota:false}, {nama:'Cileles', luarKota:false}, {nama:'Cimanggu', luarKota:false}, {nama:'Cinangka', luarKota:true}, {nama:'Cipanas', luarKota:false}, {nama:'Cipeundeuy', luarKota:false}]},
    {kode:'PROBOLINGGO', nama:'PROBOLINGGO', salesman:'AGUS PURNOMO', isDefault:false, kecamatan:[{nama:'Cipeundeuy', luarKota:false}, {nama:'Cipocok Jaya', luarKota:false}, {nama:'Ciruas', luarKota:false}, {nama:'Curug', luarKota:false}]},
    {kode:'BANYUWANGI', nama:'BANYUWANGI', salesman:'BABAY SUHAEMI', isDefault:false, kecamatan:[{nama:'Kaduhejo', luarKota:false}, {nama:'Kibin', luarKota:false}, {nama:'Kopo', luarKota:false}, {nama:'Kragilan', luarKota:false}, {nama:'Kresek', luarKota:false}, {nama:'Kronjo', luarKota:true}, {nama:'Kutamekar', luarKota:false}, {nama:'Labuan', luarKota:false}, {nama:'Legok', luarKota:false}]},
    {kode:'SOLO', nama:'SOLO', salesman:'ARI ARIH GINTING SUKA', isDefault:false, kecamatan:[{nama:'Labuan', luarKota:false}, {nama:'Legok', luarKota:false}, {nama:'Mancak', luarKota:false}, {nama:'Mekarbaru', luarKota:false}, {nama:'Menes', luarKota:false}]},
    {kode:'PURWOKERTO', nama:'PURWOKERTO', salesman:'SYAEFUL ANWAR', isDefault:false, kecamatan:[{nama:'Pagedangan', luarKota:false}, {nama:'Pamarayan', luarKota:false}, {nama:'Panggarangan', luarKota:false}, {nama:'Panimbang', luarKota:false}, {nama:'Petir', luarKota:false}, {nama:'Pontang', luarKota:true}, {nama:'Pulomerak', luarKota:false}, {nama:'Rangkasbitung', luarKota:false}, {nama:'Sajira', luarKota:false}, {nama:'Saketi', luarKota:false}]},
    {kode:'TEGAL', nama:'TEGAL', salesman:'ANDRI MUHAMMAD', isDefault:false, kecamatan:[{nama:'Rangkasbitung', luarKota:false}, {nama:'Sajira', luarKota:false}, {nama:'Saketi', luarKota:false}, {nama:'Sepatan', luarKota:false}, {nama:'Serang', luarKota:false}, {nama:'Sindangresmi', luarKota:true}]},
    {kode:'PEKALONGAN', nama:'PEKALONGAN', salesman:'ISDI DWI JATMIKO', isDefault:false, kecamatan:[{nama:'Solear', luarKota:false}, {nama:'Sukamulya', luarKota:false}, {nama:'Tanara', luarKota:false}, {nama:'Tenjo', luarKota:false}, {nama:'Tigaraksa', luarKota:false}, {nama:'Tirtayasa', luarKota:true}, {nama:'Tunjung Teja', luarKota:false}, {nama:'Waringinkurung', luarKota:false}, {nama:'Warunggunung', luarKota:false}, {nama:'Cadasari', luarKota:false}, {nama:'Angsana', luarKota:false}]},
  ],
  /* Master Area/Wilayah — menu Lain-lain > Wilayah (page:'masterWilayah',
     ganti dari placeholder lama, lihat js/menu.js). Sesuai screenshot
     MASERP yang dikirim user 2026-08-18: "Area" (list, Total Record: 9)
     dan "Wilayah" (form Ubah: Kode Wilayah readonly, Nama Wilayah,
     Default checkbox+"Tidak", Supervisor dropdown, Gudang/Invoicing
     dropdown, Sales Office input+search icon, Status radio Aktif/
     Non-Aktif) + sub-card nested "Rayon" (daftar dropdown Rayon yang
     SUDAH ADA di DATA.rayon — beda dari sub-grid Kecamatan di modul
     Rayon yang bikin ENTITAS BARU, di sini cuma MEMILIH/menautkan
     rayon yang sudah terdaftar, makanya field-nya rayonKode[] berisi
     `kode` yang merujuk ke DATA.rayon, BUKAN objek baru — lihat
     wlRayonNama()/tplWilayahForm() di master-wilayah.template.js).
     9 baris PERSIS Total Record: 9 dari screenshot list. Baris
     'JABAR001'/'JAWA BARAT' adalah contoh yang discreenshot detail form-
     nya — 6 rayon yang ditautkan (CIREBON/BANDUNG 06/BANDUNG 02 BRT/
     PRIANGAN TIMUR/BANDUNG 01/BANDUNG 03) PERSIS sesuai screenshot form
     Wilayah, dan karena itu 6 baris DATA.rayon terkait (BANDUNG1/
     BANDUNG2/BANDUNG3/CIREBON/TASIKMALAYA/SUKABUMI) di atas SENGAJA
     di-enrich nama+kode-nya (lihat "UPDATE 2026-08-18" di komentar
     DATA.rayon) supaya kedua modul (Rayon & Wilayah) konsisten memakai
     satu sumber data yang sama, bukan 2 versi rayon yang beda. Baris
     Wilayah lain (Supervisor/Gudang/Sales Office/rayonKode) TIDAK ada di
     screenshot, jadi disusun masuk akal sendiri: BANTEN01 menaungi
     rayon Jabodetabek+Banten yang belum dipakai JABAR001, JATENG001/
     JATIM001/JATIM002 menaungi rayon kota Jateng/Jatim yang sudah ada,
     sisanya (83117/AREAOFFICE/DUMMY/LN01) sengaja rayonKode:[] kosong
     (area administratif/minor, bukan area penjualan aktif). */
  area:[
    {kode:'83117', nama:'Mataram , nusa tenggara barat', supervisor:'ILHAM YUSDIANSYAH', isDefault:false, gudang:'Head Office', invoicing:'Head Office', salesOffice:'SF01', status:'Aktif', rayonKode:[]},
    {kode:'AREAOFFICE', nama:'AREAOFFICE', supervisor:'ILHAM YUSDIANSYAH', isDefault:false, gudang:'Head Office', invoicing:'Head Office', salesOffice:'SF01', status:'Aktif', rayonKode:[]},
    {kode:'BANTEN01', nama:'JABODETABEK BANTEN', supervisor:'BABAY SUHAEMI', isDefault:false, gudang:'Tangerang', invoicing:'Tangerang', salesOffice:'SF03', status:'Aktif', rayonKode:['BANTEN 1','BEKASI 1','BEKASI2','BOGOR1','BOGOR2','BOGOR3','JAKARTA1','JAKARTA2','KARAWANG','SERANG','CILEGON']},
    {kode:'DUMMY', nama:'dummy', supervisor:'ILHAM YUSDIANSYAH', isDefault:false, gudang:'Head Office', invoicing:'Head Office', salesOffice:'SF00', status:'Non-Aktif', rayonKode:[]},
    {kode:'JABAR001', nama:'JAWA BARAT', supervisor:'ANTONIOUS SURYO WINARNO', isDefault:false, gudang:'Bandung', invoicing:'Bandung', salesOffice:'SF04', status:'Aktif', rayonKode:['CIREBON','BANDUNG 06','BANDUNG 02 BRT','PRIANGAN TIMUR','BANDUNG 01','BANDUNG 03']},
    {kode:'JATENG001', nama:'JATENG001', supervisor:'PERA LESMANA', isDefault:false, gudang:'Semarang', invoicing:'Semarang', salesOffice:'SF02', status:'Aktif', rayonKode:['SOLO','PURWOKERTO','TEGAL','PEKALONGAN']},
    {kode:'JATIM001', nama:'JATIM001', supervisor:'ILHAM YUSDIANSYAH', isDefault:false, gudang:'Surabaya', invoicing:'Surabaya', salesOffice:'SF01', status:'Aktif', rayonKode:['JEMBER','KEDIRI','MADIUN','MALANG']},
    {kode:'JATIM002', nama:'JATIM002', supervisor:'ILHAM YUSDIANSYAH', isDefault:false, gudang:'Surabaya', invoicing:'Surabaya', salesOffice:'SF01', status:'Aktif', rayonKode:['SIDOARJO','GRESIK','MOJOKERTO','PASURUAN','PROBOLINGGO','BANYUWANGI']},
    {kode:'LN01', nama:'LN01', supervisor:'ILHAM YUSDIANSYAH', isDefault:false, gudang:'Head Office', invoicing:'Head Office', salesOffice:'SF00', status:'Aktif', rayonKode:[]},
  ],
  /* UPDATE 2026-08-18 (lanjutan): field `salesOffice` di atas SEMULA berisi
     nama cabang bebas (MATARAM/HEAD OFFICE/TANGERANG/BANDUNG/SEMARANG/
     SURABAYA/'', dipilih dari WL_CABANG_LIST dekoratif di form Wilayah
     karena modul Sales Office sungguhan belum ada). Setelah user mengirim
     screenshot MASERP "Daftar Sales Office" (5 baris SF00-SF04) yang
     menunjukkan Area mana saja yang benar-benar tertaut ke tiap Sales
     Office, field ini DIKOREKSI jadi menyimpan KODE Sales Office (SF00 s.d.
     SF04, merujuk DATA.salesOffice di bawah) PERSIS sesuai screenshot:
     SF00(SIDOARJO DC)→DUMMY,LN01 · SF01(SIDOARJO)→83117,AREAOFFICE,
     JATIM001,JATIM002 · SF02(SEMARANG)→JATENG001 · SF03(TANGERANG)→
     BANTEN01 · SF04(BANDUNG)→JABAR001 — total 9 area persis jumlah baris
     DATA.area, tidak ada yang tercecer. Modul Master Wilayah (js/pages/
     master-wilayah.*) ikut disesuaikan: picker "Sales Office" di form-nya
     sekarang menautkan ke DATA.salesOffice sungguhan (bukan lagi
     WL_CABANG_LIST dekoratif 8-cabang) — lihat catatan di module tsb. */
  salesOffice:[
    {kode:'SF00', nama:'SIDOARJO (DC)', ascm:'EDI YUWONO', status:'Aktif'},
    {kode:'SF01', nama:'SIDOARJO', ascm:'EDI YUWONO', status:'Aktif'},
    {kode:'SF02', nama:'SEMARANG', ascm:'ALDESGA DAVINO', status:'Aktif'},
    {kode:'SF03', nama:'TANGERANG', ascm:'FIRMAN HIDAYAT', status:'Aktif'},
    {kode:'SF04', nama:'BANDUNG', ascm:'ALDESGA DAVINO', status:'Aktif'},
  ],
  /* Master Group User — menu User Security > Group User (page:'groupUser').
     Sesuai 3 screenshot MASERP yang dikirim user 2026-08-18: "Daftar Group
     Hak Akses" (list: dark header + tombol "+Add MNGR"/"+Add PURCH"/
     "+Add SALES"/"+Add" + tombol merah "Tutorial", toolbar page-size(20)+
     Pencarian Global, kolom User Role Code/Name/Description/Gudang/
     Administrator?/Edit/Delete, pager BARU gaya "First < [halaman] to Y
     Of Total > Last" — SAMA PERSIS dengan tplRyKecPager() di
     master-rayon.template.js, di sini DIPAKAI ULANG sebagai pager LIST
     UTAMA/luar untuk pertama kalinya, bukan cuma sub-grid — lihat
     tplGuPager() di group-user.template.js & class CSS .ry-kec-pager di
     style.css yang sekarang dipakai lintas-modul, "Total Record: 60") dan
     "Master User Role" (form Ubah: Kode User Role readonly abu-abu, Name,
     Keterangan, field "Pilih Gudang" input+tombol search yang buka modal
     checklist multi-pilih ke DATA.gudang, tombol "Duplicate Hak Akses dari
     Jabatan Lain" yang buka modal pilih role lain lalu menyalin Keterangan+
     Gudang-nya /simulasi duplikasi hak akses karena mockup ini belum py
     matrix permission sungguhan/, checkbox "Is Administrator", Simpan/
     Cancel).

     20 baris PERTAMA (ACC s.d. BBB) PERSIS nama/kode dari screenshot list
     (halaman pertama). Kolom "Gudang" pada screenshot asli menampilkan kode
     gudang milik installasi MASERP lain (mis. "GKR-00"/"GRJ-00"/"NON-00")
     yang TIDAK match DATA.gudang milik DBM — demi referential integrity
     lintas modul (sama seperti WL_CABANG_LIST dipakai ulang di Master
     Wilayah), kode gudang asli itu SENGAJA DIGANTI dengan kode gudang DBM
     yang sudah ada di DATA.gudang (lihat js/pages/gudang.template.js/
     GDG_CABANG_LIST): role tanpa akhiran cabang (mis. ADG/ADS/APJA/APJF)
     dapat 1 gudang utama per cabang (00-GUU s.d. 07-GUU = akses lintas
     cabang), role dengan akhiran -HO/-SMG/-TGR dapat SELURUH kode gudang
     milik cabang itu saja (mis. ADG-HO dapat semua 00-GUU*, ADG-SMG dapat
     semua 06-GUU*, ADG-TGR dapat semua 03-GUU*). ADM (Administrator?:true,
     satu-satunya baris true persis screenshot) dapat semua 8 gudang utama.
     Baris 'BBB'/'bbb' PERSIS apa adanya dari screenshot (baris contoh/test
     di data asli, bukan salah ketik saya).

     40 baris SISANYA (CS s.d. SALES-HO) adalah baris TAMBAHAN yang saya
     susun sendiri (screenshot cuma menunjukkan halaman pertama, 20 dari 60
     baris) supaya "Total Record: 60" tetap PERSIS sesuai screenshot & pager
     baru bisa didemokan pindah 3 halaman sungguhan (page-size 20 x 3 hal. =
     60) — mengikuti kode MNGR/PURCH/SALES supaya 3 tombol quick-add
     "+Add MNGR"/"+Add PURCH"/"+Add SALES" di toolbar punya role yang benar-
     benar cocok/masuk akal untuk didemokan menambah varian barunya. */
  groupUser:[
    {kode:'ACC', nama:'Accounting', keterangan:'Staff Accounting', gudangKode:['00-GUU','01-GUU','02-GUU','03-GUU','04-GUU','05-GUU','06-GUU','07-GUU'], isAdmin:false},
    {kode:'ADG', nama:'Admin Gudang', keterangan:'Admin Gudang (Seluruh Cabang)', gudangKode:['00-GUU','01-GUU','02-GUU','03-GUU','04-GUU','05-GUU','06-GUU','07-GUU'], isAdmin:false},
    {kode:'ADG-HO', nama:'Admin Gudang HO', keterangan:'Admin Gudang Head Office', gudangKode:['00-GUU','00-GUU-02','00-GUU-03','00-GUU-04'], isAdmin:false},
    {kode:'ADG-SMG', nama:'Admin Gudang Semarang', keterangan:'Admin Gudang Cabang Semarang', gudangKode:['06-GUU','06-GUU-02','06-GUU-03','06-GUU-04','06-GUU-05'], isAdmin:false},
    {kode:'ADG-TGR', nama:'Admin Gudang Tangerang', keterangan:'Admin Gudang Cabang Tangerang', gudangKode:['03-GUU','03-GUU-02','03-GUU-03','03-GUU-04'], isAdmin:false},
    {kode:'ADM', nama:'Administrator', keterangan:'Administrator Sistem (Akses Penuh)', gudangKode:['00-GUU','01-GUU','02-GUU','03-GUU','04-GUU','05-GUU','06-GUU','07-GUU'], isAdmin:true},
    {kode:'ADS', nama:'Admin Sales', keterangan:'Admin Sales (Seluruh Cabang)', gudangKode:['00-GUU','01-GUU','02-GUU','03-GUU','04-GUU','05-GUU','06-GUU','07-GUU'], isAdmin:false},
    {kode:'ADS-HO', nama:'Admin Sales HO', keterangan:'Admin Sales Head Office', gudangKode:['00-GUU','00-GUU-02','00-GUU-03','00-GUU-04'], isAdmin:false},
    {kode:'ADS-TGR', nama:'Admin Sales Tangerang', keterangan:'Admin Sales Cabang Tangerang', gudangKode:['03-GUU','03-GUU-02','03-GUU-03','03-GUU-04'], isAdmin:false},
    {kode:'ADT', nama:'Admin Tax', keterangan:'Admin Tax / Perpajakan', gudangKode:['00-GUU'], isAdmin:false},
    {kode:'APB', nama:'Account Payable BUMI', keterangan:'Account Payable', gudangKode:['00-GUU'], isAdmin:false},
    {kode:'APJA', nama:'Penanggung Jawab Alat Kesehatan', keterangan:'Penanggung Jawab Alat Kesehatan (Seluruh Cabang)', gudangKode:['00-GUU','01-GUU','02-GUU','03-GUU','04-GUU','05-GUU','06-GUU','07-GUU'], isAdmin:false},
    {kode:'APJA-HO', nama:'Penanggung Jawab Alat Kesehatan HO', keterangan:'Penanggung Jawab Alat Kesehatan Head Office', gudangKode:['00-GUU','00-GUU-02','00-GUU-03','00-GUU-04'], isAdmin:false},
    {kode:'APJA-SMG', nama:'Penanggung Jawab Alat Kesehatan Semarang', keterangan:'Penanggung Jawab Alat Kesehatan Cabang Semarang', gudangKode:['06-GUU','06-GUU-02','06-GUU-03','06-GUU-04','06-GUU-05'], isAdmin:false},
    {kode:'APJA-TGR', nama:'Penanggung Jawab Alat Kesehatan Tangerang', keterangan:'Penanggung Jawab Alat Kesehatan Cabang Tangerang', gudangKode:['03-GUU','03-GUU-02','03-GUU-03','03-GUU-04'], isAdmin:false},
    {kode:'APJF', nama:'Penanggung Jawab Teknis Farma', keterangan:'Penanggung Jawab Teknis Farmasi (Seluruh Cabang)', gudangKode:['00-GUU','01-GUU','02-GUU','03-GUU','04-GUU','05-GUU','06-GUU','07-GUU'], isAdmin:false},
    {kode:'APJF-HO', nama:'Penanggung Jawab Teknis Farma HO', keterangan:'Penanggung Jawab Teknis Farmasi Head Office', gudangKode:['00-GUU','00-GUU-02','00-GUU-03','00-GUU-04'], isAdmin:false},
    {kode:'APJF-SMG', nama:'Penanggung Jawab Teknis Farma Semarang', keterangan:'Penanggung Jawab Teknis Farmasi Cabang Semarang', gudangKode:['06-GUU','06-GUU-02','06-GUU-03','06-GUU-04','06-GUU-05'], isAdmin:false},
    {kode:'APJF-TGR', nama:'Penanggung Jawab Teknis Farma Tangerang', keterangan:'Penanggung Jawab Teknis Farmasi Cabang Tangerang', gudangKode:['03-GUU','03-GUU-02','03-GUU-03','03-GUU-04'], isAdmin:false},
    {kode:'BBB', nama:'bbb', keterangan:'bbb', gudangKode:[], isAdmin:false},

    {kode:'CS', nama:'Customer Service', keterangan:'Staff Customer Service (Seluruh Cabang)', gudangKode:['00-GUU','01-GUU','02-GUU','03-GUU','04-GUU','05-GUU','06-GUU','07-GUU'], isAdmin:false},
    {kode:'CS-HO', nama:'Customer Service HO', keterangan:'Customer Service Head Office', gudangKode:['00-GUU','00-GUU-02','00-GUU-03','00-GUU-04'], isAdmin:false},
    {kode:'CS-SMG', nama:'Customer Service Semarang', keterangan:'Customer Service Cabang Semarang', gudangKode:['06-GUU','06-GUU-02','06-GUU-03','06-GUU-04','06-GUU-05'], isAdmin:false},
    {kode:'CS-TGR', nama:'Customer Service Tangerang', keterangan:'Customer Service Cabang Tangerang', gudangKode:['03-GUU','03-GUU-02','03-GUU-03','03-GUU-04'], isAdmin:false},
    {kode:'DRV', nama:'Driver', keterangan:'Driver Pengiriman (Seluruh Cabang)', gudangKode:['00-GUU','01-GUU','02-GUU','03-GUU','04-GUU','05-GUU','06-GUU','07-GUU'], isAdmin:false},
    {kode:'DRV-HO', nama:'Driver HO', keterangan:'Driver Pengiriman Head Office', gudangKode:['00-GUU','00-GUU-02','00-GUU-03','00-GUU-04'], isAdmin:false},
    {kode:'DRV-SMG', nama:'Driver Semarang', keterangan:'Driver Pengiriman Cabang Semarang', gudangKode:['06-GUU','06-GUU-02','06-GUU-03','06-GUU-04','06-GUU-05'], isAdmin:false},
    {kode:'DRV-TGR', nama:'Driver Tangerang', keterangan:'Driver Pengiriman Cabang Tangerang', gudangKode:['03-GUU','03-GUU-02','03-GUU-03','03-GUU-04'], isAdmin:false},
    {kode:'EXP', nama:'Staff Ekspedisi', keterangan:'Staff Ekspedisi (Seluruh Cabang)', gudangKode:['00-GUU','01-GUU','02-GUU','03-GUU','04-GUU','05-GUU','06-GUU','07-GUU'], isAdmin:false},
    {kode:'EXP-HO', nama:'Staff Ekspedisi HO', keterangan:'Staff Ekspedisi Head Office', gudangKode:['00-GUU','00-GUU-02','00-GUU-03','00-GUU-04'], isAdmin:false},
    {kode:'EXP-SMG', nama:'Staff Ekspedisi Semarang', keterangan:'Staff Ekspedisi Cabang Semarang', gudangKode:['06-GUU','06-GUU-02','06-GUU-03','06-GUU-04','06-GUU-05'], isAdmin:false},
    {kode:'EXP-TGR', nama:'Staff Ekspedisi Tangerang', keterangan:'Staff Ekspedisi Cabang Tangerang', gudangKode:['03-GUU','03-GUU-02','03-GUU-03','03-GUU-04'], isAdmin:false},
    {kode:'FIN', nama:'Finance', keterangan:'Staff Finance (Seluruh Cabang)', gudangKode:['00-GUU','01-GUU','02-GUU','03-GUU','04-GUU','05-GUU','06-GUU','07-GUU'], isAdmin:false},
    {kode:'FIN-HO', nama:'Finance HO', keterangan:'Staff Finance Head Office', gudangKode:['00-GUU','00-GUU-02','00-GUU-03','00-GUU-04'], isAdmin:false},
    {kode:'GDG', nama:'Staff Gudang', keterangan:'Staff Gudang (Seluruh Cabang)', gudangKode:['00-GUU','01-GUU','02-GUU','03-GUU','04-GUU','05-GUU','06-GUU','07-GUU'], isAdmin:false},
    {kode:'GDG-HO', nama:'Staff Gudang HO', keterangan:'Staff Gudang Head Office', gudangKode:['00-GUU','00-GUU-02','00-GUU-03','00-GUU-04'], isAdmin:false},
    {kode:'GDG-SMG', nama:'Staff Gudang Semarang', keterangan:'Staff Gudang Cabang Semarang', gudangKode:['06-GUU','06-GUU-02','06-GUU-03','06-GUU-04','06-GUU-05'], isAdmin:false},
    {kode:'GDG-TGR', nama:'Staff Gudang Tangerang', keterangan:'Staff Gudang Cabang Tangerang', gudangKode:['03-GUU','03-GUU-02','03-GUU-03','03-GUU-04'], isAdmin:false},
    {kode:'HRD', nama:'Human Resource', keterangan:'Staff Human Resource / Personalia', gudangKode:['00-GUU'], isAdmin:false},
    {kode:'ITG', nama:'IT & Teknologi Informasi', keterangan:'Staff IT / Teknologi Informasi', gudangKode:['00-GUU'], isAdmin:false},
    {kode:'KAS', nama:'Kasir', keterangan:'Kasir (Seluruh Cabang)', gudangKode:['00-GUU','01-GUU','02-GUU','03-GUU','04-GUU','05-GUU','06-GUU','07-GUU'], isAdmin:false},
    {kode:'KAS-HO', nama:'Kasir HO', keterangan:'Kasir Head Office', gudangKode:['00-GUU','00-GUU-02','00-GUU-03','00-GUU-04'], isAdmin:false},
    {kode:'KAS-SMG', nama:'Kasir Semarang', keterangan:'Kasir Cabang Semarang', gudangKode:['06-GUU','06-GUU-02','06-GUU-03','06-GUU-04','06-GUU-05'], isAdmin:false},
    {kode:'KAS-TGR', nama:'Kasir Tangerang', keterangan:'Kasir Cabang Tangerang', gudangKode:['03-GUU','03-GUU-02','03-GUU-03','03-GUU-04'], isAdmin:false},
    {kode:'KOL', nama:'Kolektor Piutang', keterangan:'Kolektor Piutang (Seluruh Cabang)', gudangKode:['00-GUU','01-GUU','02-GUU','03-GUU','04-GUU','05-GUU','06-GUU','07-GUU'], isAdmin:false},
    {kode:'KOL-HO', nama:'Kolektor Piutang HO', keterangan:'Kolektor Piutang Head Office', gudangKode:['00-GUU','00-GUU-02','00-GUU-03','00-GUU-04'], isAdmin:false},
    {kode:'KOL-SMG', nama:'Kolektor Piutang Semarang', keterangan:'Kolektor Piutang Cabang Semarang', gudangKode:['06-GUU','06-GUU-02','06-GUU-03','06-GUU-04','06-GUU-05'], isAdmin:false},
    {kode:'KOL-TGR', nama:'Kolektor Piutang Tangerang', keterangan:'Kolektor Piutang Cabang Tangerang', gudangKode:['03-GUU','03-GUU-02','03-GUU-03','03-GUU-04'], isAdmin:false},
    {kode:'MNGR', nama:'Manager', keterangan:'Manager (Seluruh Cabang)', gudangKode:['00-GUU','01-GUU','02-GUU','03-GUU','04-GUU','05-GUU','06-GUU','07-GUU'], isAdmin:false},
    {kode:'MNGR-HO', nama:'Manager HO', keterangan:'Manager Head Office', gudangKode:['00-GUU','00-GUU-02','00-GUU-03','00-GUU-04'], isAdmin:false},
    {kode:'MNGR-SMG', nama:'Manager Semarang', keterangan:'Manager Cabang Semarang', gudangKode:['06-GUU','06-GUU-02','06-GUU-03','06-GUU-04','06-GUU-05'], isAdmin:false},
    {kode:'MNGR-TGR', nama:'Manager Tangerang', keterangan:'Manager Cabang Tangerang', gudangKode:['03-GUU','03-GUU-02','03-GUU-03','03-GUU-04'], isAdmin:false},
    {kode:'OPS', nama:'Operasional Gudang', keterangan:'Staff Operasional Gudang', gudangKode:['00-GUU'], isAdmin:false},
    {kode:'PJK', nama:'Staff Pajak', keterangan:'Staff Pajak / Perpajakan', gudangKode:['00-GUU'], isAdmin:false},
    {kode:'PURCH', nama:'Purchasing', keterangan:'Purchasing (Seluruh Cabang)', gudangKode:['00-GUU','01-GUU','02-GUU','03-GUU','04-GUU','05-GUU','06-GUU','07-GUU'], isAdmin:false},
    {kode:'PURCH-HO', nama:'Purchasing HO', keterangan:'Purchasing Head Office', gudangKode:['00-GUU','00-GUU-02','00-GUU-03','00-GUU-04'], isAdmin:false},
    {kode:'PURCH-SMG', nama:'Purchasing Semarang', keterangan:'Purchasing Cabang Semarang', gudangKode:['06-GUU','06-GUU-02','06-GUU-03','06-GUU-04','06-GUU-05'], isAdmin:false},
    {kode:'PURCH-TGR', nama:'Purchasing Tangerang', keterangan:'Purchasing Cabang Tangerang', gudangKode:['03-GUU','03-GUU-02','03-GUU-03','03-GUU-04'], isAdmin:false},
    {kode:'SALES', nama:'Sales', keterangan:'Sales (Seluruh Cabang)', gudangKode:['00-GUU','01-GUU','02-GUU','03-GUU','04-GUU','05-GUU','06-GUU','07-GUU'], isAdmin:false},
    {kode:'SALES-HO', nama:'Sales HO', keterangan:'Sales Head Office', gudangKode:['00-GUU','00-GUU-02','00-GUU-03','00-GUU-04'], isAdmin:false},
  ],
  /* Administrasi Bulanan — menu Pengaturan > Administrasi Bulanan (page:
     'adminBulanan', sebelumnya submenu Pengaturan ini bahkan tidak ada di
     daftar — struktur lama cuma 3 placeholder generik "Setting Umum/
     Setting Approval/Setting Numbering", diganti total jadi 12 item sesuai
     screenshot sidebar MASERP: Update Software/Backup & Restore/Tutup
     Buku/Schedule Maintenance/Generasi Sementara/Data Transfer/Saldo Awal/
     Administrasi Bulanan/Regenerate Journal/Import Transaction/Import
     Custom Field/Export Master — lihat js/menu.js; 11 dari 12 masih
     placeholder, belum ada screenshot detailnya).

     Sesuai screenshot MASERP "Administrasi Bulanan" yang dikirim user
     2026-08-18: halaman UTILITY sederhana (BUKAN CRUD — tidak ada +Tambah/
     Ubah/Hapus/pager/pencarian sama sekali), header terang [BUKA dark-
     header seperti modul lain] dgn ikon+judul biru + tombol merah
     "Tutorial", tabel statis No/Nama/Keterangan/tombol "Process" per
     baris. 5 baris PERSIS teks dari screenshot (nama & keterangan lengkap
     apa adanya, termasuk ejaan/tanda baca asli seperti "bulan Lalu" &
     "dibulan ini" tanpa spasi — quirk data asli, bukan salah ketik saya).
     Klik "Process" HANYA menampilkan `confirm()` "Apakah Anda yakin ingin
     melakukan Proses [Nama]?" TANPA reaksi apa pun (baik user klik OK
     maupun Cancel, tidak ada perubahan state/data) — sesuai instruksi
     eksplisit user, karena proses-proses ini (generate jurnal, kunci
     transaksi, dst.) butuh logic backend sungguhan yang di luar cakupan
     mockup ini. */
  adminBulanan:[
    {nama:'Generate Jurnal Fixed Asset', keterangan:'Proses ini akan menghasilkan jurnal untuk masing-masing Inventaris (Fixed Asset) yang masih terjadi penyusutan.'},
    {nama:'Kunci Transaksi Bulan Lalu', keterangan:'Apabila sudah ingin mencetak laporan Laba Rugi dan Neraca bulan, sebaiknya tidak membolehkan transaksi lagi di bulan lalu supaya tidak berubah laporannya.'},
    {nama:'Generate Currency Accrual', keterangan:'Apabila perusahaan Anda menggunakan transaksi dengan mata uang asing, Anda dapat memilih untuk meraup untung/rugi kurs untuk transaksi tersebut berdasarkan kurs akhir bulan.'},
    {nama:'Reject Expired Date Sales Quotation Pending', keterangan:'Proses ini akan melakukan Reject by Expired Date Sales Quotation Pending yang masih pending bulan Lalu.'},
    {nama:'Transfer batch number yang akan ED & sudah ED', keterangan:'Proses ini akan melakukan transfer stock barang batch number yang akan ED ke gudang Near ED dan Sudah ED dibulan ini ke gudang Reject'},
  ],
  /* Master Cost Center — menu General Ledger > Master & Setting > Cost
     Center (page:'costCenter', menggantikan entry placeholder lama —
     lihat js/menu.js). Sesuai screenshot MASERP "Daftar Cost Center"
     (18 baris, 3 kolom: Kode Cost Center/Nama Cost Center/Keterangan +
     ikon sort per kolom, page-size default "1000" karena jumlah Cost
     Center biasanya sedikit & jarang bertambah).

     18 baris DIKARANG ULANG sepenuhnya (bukan terjemahan 1:1 dari
     screenshot yang datanya generik contoh MASERP) supaya benar-benar
     representatif struktur organisasi PT Distriversa Buanamas sebagai
     distributor FMCG 8-cabang (GDG_CABANG_CODE): 8 Cost Center Head
     Office per-departemen (Direksi/Finance/HR/Marketing/IT/Purchasing/
     Gudang HO/Sales HO) + 10 Cost Center regional (Gudang & Sales
     masing-masing utk Surabaya/Bandung/Tangerang/Semarang, plus 1
     gabungan Gudang & Sales utk Medan, 1 gabungan lagi utk Makassar —
     2 cabang kecil ini sengaja tidak dipecah Gudang/Sales terpisah
     karena skala operasinya lebih kecil dari 4 cabang besar lainnya).
     Sidoarjo TIDAK punya Cost Center sendiri — dianggap gudang satelit
     region Jawa Timur yang berbagi Cost Center dengan Surabaya
     (CC009/CC010), konsisten dgn Master Cabang (lihat tautan
     costCenterKode di DATA.cabangMaster di bawah). */
  costCenter:[
    {kode:'CC001', nama:'Direksi & Corporate Office', keterangan:'Cost Center Kantor Direksi dan Corporate Office - Head Office'},
    {kode:'CC002', nama:'Finance & Accounting', keterangan:'Cost Center Departemen Finance & Accounting - Head Office'},
    {kode:'CC003', nama:'Human Resources & GA', keterangan:'Cost Center Departemen Human Resources & General Affair - Head Office'},
    {kode:'CC004', nama:'Marketing & Trade Promotion', keterangan:'Cost Center Departemen Marketing & Trade Promotion - Head Office'},
    {kode:'CC005', nama:'IT & System', keterangan:'Cost Center Departemen Information Technology & System - Head Office'},
    {kode:'CC006', nama:'Purchasing / Procurement', keterangan:'Cost Center Departemen Purchasing & Procurement - Head Office'},
    {kode:'CC007', nama:'Gudang Head Office', keterangan:'Cost Center Operasional Gudang - Head Office (Jakarta Utara)'},
    {kode:'CC008', nama:'Sales Head Office', keterangan:'Cost Center Tim Sales & Marketing Lapangan - Head Office'},
    {kode:'CC009', nama:'Gudang Surabaya', keterangan:'Cost Center Operasional Gudang - Cabang Surabaya (termasuk Sidoarjo)'},
    {kode:'CC010', nama:'Sales Surabaya', keterangan:'Cost Center Tim Sales & Marketing Lapangan - Cabang Surabaya (termasuk Sidoarjo)'},
    {kode:'CC011', nama:'Gudang Bandung', keterangan:'Cost Center Operasional Gudang - Cabang Bandung'},
    {kode:'CC012', nama:'Sales Bandung', keterangan:'Cost Center Tim Sales & Marketing Lapangan - Cabang Bandung'},
    {kode:'CC013', nama:'Gudang Tangerang', keterangan:'Cost Center Operasional Gudang - Cabang Tangerang'},
    {kode:'CC014', nama:'Sales Tangerang', keterangan:'Cost Center Tim Sales & Marketing Lapangan - Cabang Tangerang'},
    {kode:'CC015', nama:'Gudang Semarang', keterangan:'Cost Center Operasional Gudang - Cabang Semarang'},
    {kode:'CC016', nama:'Sales Semarang', keterangan:'Cost Center Tim Sales & Marketing Lapangan - Cabang Semarang'},
    {kode:'CC017', nama:'Gudang & Sales Medan', keterangan:'Cost Center gabungan Operasional Gudang dan Sales - Cabang Medan'},
    {kode:'CC018', nama:'Gudang & Sales Makassar', keterangan:'Cost Center gabungan Operasional Gudang dan Sales - Cabang Makassar'},
  ],
  /* Master Cabang — menu General Ledger > Master & Setting > Cabang
     (page:'cabang', menggantikan entry placeholder lama — lihat
     js/menu.js). Sesuai 8 screenshot MASERP yang dikirim user: list
     "Daftar Cabang" (toolbar dgn tombol "+ Cabang" dan "Update Cabang
     ke Master Customer") + form "+ Cabang" full-page dgn header (Kode
     Cabang/Nama Perusahaan/Nama Cabang/Alamat/Kota/Provinsi/Kode Pos/
     Telepon/Fax/Email/NPWP Cabang/Tanggal Berdiri/Status) + 6 tab:
     Cost Center / Rincian Jurnal Akun / Wilayah Sales / Penanggung
     Jawab / Informasi Izin Cabang / Jurnal R/K.

     Screenshot reference MASERP pakai 5 baris cabang contoh & nama
     perusahaan generik "PT SATORIA DISTRIBUSI LESTARI" — DIGANTI total
     jadi 8 baris memakai skema kode cabang KANONIK 00-07 yang sudah
     established di GDG_CABANG_CODE (js/pages/gudang.template.js), dan
     nama perusahaan diganti "PT Distriversa Buanamas" (lihat
     company-profile.template.js) supaya konsisten dgn seluruh mockup —
     BUKAN multi-company seperti template asli (DBM cuma 1 badan usaha
     dgn 8 cabang, bukan multi-tenant), jadi field "Nama Perusahaan" di
     form dibuat disabled/fixed berisi nama itu saja (bukan dropdown
     pilih company lain seperti template asli, karena tidak relevan
     utk DBM).

     Kota/Provinsi 8 cabang memakai DATA.provinsiList yang sudah ada
     (js/data.js baris ~826) — HO tetap DKI Jakarta konsisten dgn
     company-profile.template.js ("Jl. Raya Industri No. 88, Jakarta
     Utara, DKI Jakarta").

     Field per-tab:
     - costCenterKode[] (tab "Cost Center"): pola TAUTAN sama seperti
       row.rayonKode[] di Master Wilayah — link ke DATA.costCenter yang
       SUDAH ADA (bukan bikin Cost Center baru), sesuai region cabang.
     - akunJurnal{} (tab "Rincian Jurnal Akun"): akun GL yang dipakai
       transaksi internal cabang ybs — Akun Kas, Akun Piutang Usaha,
       Akun Persediaan Barang Dagang, Akun Hutang Usaha — masing-masing
       menyimpan KODE dari DATA.akunGL yang sudah ada (picker lokal, lihat
       tplCbAkunPicker di cabang.template.js, disalin dari pola
       tplJpAkunPicker di jurnal-pembelian.template.js). Tombol "Generate
       Account" pada tab ini men-generate ulang ke-4 akun tsb dgn default
       akun HO (1100002/1120001/1130001/2110001) — simulasi ringkas fitur
       auto-generate akun cabang baru di MASERP asli, TANPA benar-benar
       membuat baris akun baru di DATA.akunGL (di luar cakupan mockup).
     - wilayahKode[] (tab "Wilayah Sales"): pola TAUTAN sama seperti
       Cost Center, link ke DATA.area (field `gudang` di DATA.area sudah
       memetakan tiap Area ke nama cabang — dipakai utk pre-populate
       tautan default per cabang di bawah). Cabang Medan/Makassar/
       Sidoarjo sengaja tautan kosong ([]) karena belum ada baris
       DATA.area yang gudang-nya mengarah ke 3 cabang itu (area
       penjualan region tersebut belum terbentuk di data yang ada —
       user bisa "+Tambah" tautan manual di form kalau perlu).
     - penanggungJawab[] (tab "Penanggung Jawab"): pola ENTITAS BARU
       sama seperti Kecamatan di Master Rayon (BUKAN tautan) — tiap
       baris {nama, jabatan, kategoriBarang[]}. Jabatan pakai daftar
       FMCG (Kepala Cabang/Supply Chain Manager/Finance Manager/Sales
       Manager/Warehouse Supervisor) — MENGGANTI daftar jabatan farmasi
       di screenshot asli (mis. Apoteker Penanggung Jawab) karena tidak
       relevan utk distributor sembako, sama seperti precedent modul
       Invoice (apoteker signature dihapus). kategoriBarang[] pakai tag-
       chip multi-select ke KODE ASLI DATA.kategoriBarang (CATSMB/CATBHB/
       dst, bukan tag demo farmasi) — pola tag-chip disalin lokal dari
       tplPklPickerTags di picking-list.template.js.
     - izinCabang{} (tab "Informasi Izin Cabang"): field lisensi FMCG
       distributor (NIB/SIUP/TDG - Tanda Daftar Gudang) MENGGANTI field
       lisensi farmasi asli (No. Izin PBF/DAK) karena tidak relevan utk
       distributor sembako — precedent sama seperti Invoice/kategori
       barang di atas (adaptasi farmasi->FMCG, BUKAN dipertahankan
       seperti kasus Zat Kandungan Aktif/Farmakoterapi yg memang
       nomenklatur industri generik).
     - jurnalRK{} (tab "Jurnal R/K"): 2 akun picker (Akun Piutang R/K
       Cabang & Akun Hutang R/K Cabang) — default memakai akun yang
       SUDAH ADA persis di DATA.akunGL (1120002 Piutang R/K Cabang &
       2110003 Hutang R/K Cabang), jadi tiap cabang menaut ke akun R/K
       yang sama (skema sederhana, wajar utk mockup — di MASERP asli tiap
       cabang biasanya punya akun R/K sendiri2, tapi itu berarti harus
       generate belasan akun GL baru yang di luar cakupan mockup ini). */
  cabangMaster:[
    {kode:'00', nama:'Head Office', namaPerusahaan:'PT Distriversa Buanamas', alamat:'Jl. Raya Industri No. 88, Jakarta Utara', kota:'Jakarta Utara', provinsi:'DKI Jakarta', kodePos:'14350', telepon:'(021) 555-8899', fax:'(021) 555-8898', email:'ho@distriversabuanamas.co.id', npwp:'01.234.567.8-901.000', tanggalBerdiri:'02/01/2010', status:'Aktif',
      costCenterKode:['CC001','CC002','CC003','CC004','CC005','CC006','CC007','CC008'],
      akunJurnal:{akunKas:'1100002', akunPiutang:'1120001', akunPersediaan:'1130001', akunHutang:'2110001'},
      wilayahKode:['83117','AREAOFFICE','DUMMY','LN01'],
      penanggungJawab:[
        {nama:'HERMAWAN SUSANTO', jabatan:'Kepala Cabang', kategoriBarang:['CATSMB','CATBHB','CATMKN']},
        {nama:'DEWI KARTIKA NINGRUM', jabatan:'Supply Chain Manager', kategoriBarang:['CATSMB','CATBHB','CATMKN','CATBMB']},
      ],
      izinCabang:{noNib:'0123456789012', tglNib:'02/01/2010', noSiup:'503/SIUP-B/01/2010', tglSiup:'02/01/2010', noTdg:'12/TDG/1/2010', tglTdg:'15/01/2010', berlakuSampai:'02/01/2030', statusPerizinan:'Aktif'},
      jurnalRK:{akunPiutangRK:'1120002', akunHutangRK:'2110003'}},
    {kode:'01', nama:'Surabaya', namaPerusahaan:'PT Distriversa Buanamas', alamat:'Jl. Rungkut Industri No. 12', kota:'Surabaya', provinsi:'Jawa Timur', kodePos:'60293', telepon:'(031) 841-2200', fax:'(031) 841-2201', email:'surabaya@distriversabuanamas.co.id', npwp:'01.234.567.8-902.000', tanggalBerdiri:'14/03/2012', status:'Aktif',
      costCenterKode:['CC009','CC010'],
      akunJurnal:{akunKas:'1100002', akunPiutang:'1120001', akunPersediaan:'1130001', akunHutang:'2110001'},
      wilayahKode:['JATIM001','JATIM002'],
      penanggungJawab:[
        {nama:'BAMBANG PRIYONO', jabatan:'Kepala Cabang', kategoriBarang:['CATSMB','CATMKN']},
        {nama:'RATNA WULANDARI', jabatan:'Sales Manager', kategoriBarang:['CATSMB','CATMKN','CATMNM']},
      ],
      izinCabang:{noNib:'0123456789013', tglNib:'14/03/2012', noSiup:'503/SIUP-B/03/2012', tglSiup:'14/03/2012', noTdg:'08/TDG/3/2012', tglTdg:'20/03/2012', berlakuSampai:'14/03/2032', statusPerizinan:'Aktif'},
      jurnalRK:{akunPiutangRK:'1120002', akunHutangRK:'2110003'}},
    {kode:'02', nama:'Bandung', namaPerusahaan:'PT Distriversa Buanamas', alamat:'Jl. Soekarno-Hatta No. 456', kota:'Bandung', provinsi:'Jawa Barat', kodePos:'40286', telepon:'(022) 766-5500', fax:'(022) 766-5501', email:'bandung@distriversabuanamas.co.id', npwp:'01.234.567.8-903.000', tanggalBerdiri:'20/06/2013', status:'Aktif',
      costCenterKode:['CC011','CC012'],
      akunJurnal:{akunKas:'1100002', akunPiutang:'1120001', akunPersediaan:'1130001', akunHutang:'2110001'},
      wilayahKode:['JABAR001'],
      penanggungJawab:[
        {nama:'ADE FIRMANSYAH', jabatan:'Kepala Cabang', kategoriBarang:['CATSMB','CATBHB']},
        {nama:'YULIA PERMATASARI', jabatan:'Warehouse Supervisor', kategoriBarang:['CATSMB','CATBHB','CATBMB']},
      ],
      izinCabang:{noNib:'0123456789014', tglNib:'20/06/2013', noSiup:'503/SIUP-B/06/2013', tglSiup:'20/06/2013', noTdg:'05/TDG/6/2013', tglTdg:'25/06/2013', berlakuSampai:'20/06/2033', statusPerizinan:'Aktif'},
      jurnalRK:{akunPiutangRK:'1120002', akunHutangRK:'2110003'}},
    {kode:'03', nama:'Tangerang', namaPerusahaan:'PT Distriversa Buanamas', alamat:'Jl. Daan Mogot Km. 19', kota:'Tangerang', provinsi:'Banten', kodePos:'15122', telepon:'(021) 552-3300', fax:'(021) 552-3301', email:'tangerang@distriversabuanamas.co.id', npwp:'01.234.567.8-904.000', tanggalBerdiri:'11/09/2014', status:'Aktif',
      costCenterKode:['CC013','CC014'],
      akunJurnal:{akunKas:'1100002', akunPiutang:'1120001', akunPersediaan:'1130001', akunHutang:'2110001'},
      wilayahKode:['BANTEN01'],
      penanggungJawab:[
        {nama:'RUDI HARTONO', jabatan:'Kepala Cabang', kategoriBarang:['CATSMB','CATMKN','CATMNM']},
        {nama:'SITI NURHALIZA', jabatan:'Finance Manager', kategoriBarang:['CATSMB','CATMKN']},
      ],
      izinCabang:{noNib:'0123456789015', tglNib:'11/09/2014', noSiup:'503/SIUP-B/09/2014', tglSiup:'11/09/2014', noTdg:'19/TDG/9/2014', tglTdg:'18/09/2014', berlakuSampai:'11/09/2034', statusPerizinan:'Aktif'},
      jurnalRK:{akunPiutangRK:'1120002', akunHutangRK:'2110003'}},
    {kode:'04', nama:'Medan', namaPerusahaan:'PT Distriversa Buanamas', alamat:'Jl. Gatot Subroto No. 88', kota:'Medan', provinsi:'Sumatera Utara', kodePos:'20115', telepon:'(061) 456-7700', fax:'(061) 456-7701', email:'medan@distriversabuanamas.co.id', npwp:'01.234.567.8-905.000', tanggalBerdiri:'03/02/2016', status:'Aktif',
      costCenterKode:['CC017'],
      akunJurnal:{akunKas:'1100002', akunPiutang:'1120001', akunPersediaan:'1130001', akunHutang:'2110001'},
      wilayahKode:[],
      penanggungJawab:[
        {nama:'AGUS SALIM NASUTION', jabatan:'Kepala Cabang', kategoriBarang:['CATSMB','CATBHB','CATMKN']},
      ],
      izinCabang:{noNib:'0123456789016', tglNib:'03/02/2016', noSiup:'503/SIUP-B/02/2016', tglSiup:'03/02/2016', noTdg:'11/TDG/2/2016', tglTdg:'09/02/2016', berlakuSampai:'03/02/2036', statusPerizinan:'Aktif'},
      jurnalRK:{akunPiutangRK:'1120002', akunHutangRK:'2110003'}},
    {kode:'05', nama:'Makassar', namaPerusahaan:'PT Distriversa Buanamas', alamat:'Jl. Perintis Kemerdekaan Km. 10', kota:'Makassar', provinsi:'Sulawesi Selatan', kodePos:'90245', telepon:'(0411) 588-900', fax:'(0411) 588-901', email:'makassar@distriversabuanamas.co.id', npwp:'01.234.567.8-906.000', tanggalBerdiri:'17/05/2017', status:'Aktif',
      costCenterKode:['CC018'],
      akunJurnal:{akunKas:'1100002', akunPiutang:'1120001', akunPersediaan:'1130001', akunHutang:'2110001'},
      wilayahKode:[],
      penanggungJawab:[
        {nama:'MUHAMMAD YUSUF DAENG', jabatan:'Kepala Cabang', kategoriBarang:['CATSMB','CATMKN']},
      ],
      izinCabang:{noNib:'0123456789017', tglNib:'17/05/2017', noSiup:'503/SIUP-B/05/2017', tglSiup:'17/05/2017', noTdg:'22/TDG/5/2017', tglTdg:'23/05/2017', berlakuSampai:'17/05/2037', statusPerizinan:'Aktif'},
      jurnalRK:{akunPiutangRK:'1120002', akunHutangRK:'2110003'}},
    {kode:'06', nama:'Semarang', namaPerusahaan:'PT Distriversa Buanamas', alamat:'Jl. Kaligawe Raya No. 200', kota:'Semarang', provinsi:'Jawa Tengah', kodePos:'50118', telepon:'(024) 658-4400', fax:'(024) 658-4401', email:'semarang@distriversabuanamas.co.id', npwp:'01.234.567.8-907.000', tanggalBerdiri:'25/08/2015', status:'Aktif',
      costCenterKode:['CC015','CC016'],
      akunJurnal:{akunKas:'1100002', akunPiutang:'1120001', akunPersediaan:'1130001', akunHutang:'2110001'},
      wilayahKode:['JATENG001'],
      penanggungJawab:[
        {nama:'JOKO SUPRIYANTO', jabatan:'Kepala Cabang', kategoriBarang:['CATSMB','CATBHB','CATMKN']},
        {nama:'ENDANG SUSILOWATI', jabatan:'Sales Manager', kategoriBarang:['CATSMB','CATMKN','CATMNM']},
      ],
      izinCabang:{noNib:'0123456789018', tglNib:'25/08/2015', noSiup:'503/SIUP-B/08/2015', tglSiup:'25/08/2015', noTdg:'14/TDG/8/2015', tglTdg:'01/09/2015', berlakuSampai:'25/08/2035', statusPerizinan:'Aktif'},
      jurnalRK:{akunPiutangRK:'1120002', akunHutangRK:'2110003'}},
    {kode:'07', nama:'Sidoarjo', namaPerusahaan:'PT Distriversa Buanamas', alamat:'Jl. Raya Waru No. 33', kota:'Sidoarjo', provinsi:'Jawa Timur', kodePos:'61256', telepon:'(031) 853-1100', fax:'(031) 853-1101', email:'sidoarjo@distriversabuanamas.co.id', npwp:'01.234.567.8-908.000', tanggalBerdiri:'09/11/2018', status:'Aktif',
      costCenterKode:['CC009'],
      akunJurnal:{akunKas:'1100002', akunPiutang:'1120001', akunPersediaan:'1130001', akunHutang:'2110001'},
      wilayahKode:[],
      penanggungJawab:[
        {nama:'FAJAR NUR ROHMAN', jabatan:'Warehouse Supervisor', kategoriBarang:['CATSMB','CATMKN']},
      ],
      izinCabang:{noNib:'0123456789019', tglNib:'09/11/2018', noSiup:'503/SIUP-B/11/2018', tglSiup:'09/11/2018', noTdg:'27/TDG/11/2018', tglTdg:'14/11/2018', berlakuSampai:'09/11/2038', statusPerizinan:'Aktif'},
      jurnalRK:{akunPiutangRK:'1120002', akunHutangRK:'2110003'}},
  ],
};
