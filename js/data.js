/* =========================================================
   SAMPLE DATA — PT Distriversa Buanamas
========================================================= */
const rp = n => 'Rp ' + Number(n).toLocaleString('id-ID');
const num = n => Number(n).toLocaleString('id-ID');

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
     ditambahkan ke tiap baris di bawah — tidak mengubah kolom yang sudah
     dipakai renderer generik "Customer" di js/core.js (cols kode/nama/
     kota/salesman/limit/status tetap sama). */
  customers:[
    {kode:'CUST-001', nama:'Toko Sumber Rejeki', kota:'Jakarta', salesman:'Budi Santoso', limit:50000000, status:'Aktif', alamat:'Jl. Mangga Dua Raya No. 12, Jakarta Pusat', piutang:18250000},
    {kode:'CUST-002', nama:'UD Makmur Jaya', kota:'Surabaya', salesman:'Andi Wijaya', limit:35000000, status:'Aktif', alamat:'Jl. Raya Darmo No. 45, Surabaya', piutang:9120000},
    {kode:'CUST-003', nama:'CV Berkah Abadi', kota:'Bandung', salesman:'Citra Lestari', limit:20000000, status:'Aktif', alamat:'Jl. Soekarno Hatta No. 88, Bandung', piutang:4300000},
    {kode:'CUST-004', nama:'Toko Anugrah', kota:'Medan', salesman:'Dedi Kurniawan', limit:15000000, status:'Aktif', alamat:'Jl. Gatot Subroto No. 21, Medan', piutang:6600000},
    {kode:'CUST-005', nama:'UD Sinar Harapan', kota:'Makassar', salesman:'Eka Putri', limit:12000000, status:'Non Aktif', alamat:'Jl. Perintis Kemerdekaan No. 5, Makassar', piutang:2150000},
    {kode:'CUST-006', nama:'Toko Family Mart Jaya', kota:'Jakarta', salesman:'Budi Santoso', limit:28000000, status:'Aktif', alamat:'Jl. Kelapa Gading Boulevard No. 9, Jakarta Utara', piutang:9870000},
    {kode:'CUST-007', nama:'CV Maju Terus', kota:'Semarang', salesman:'Fajar Nugroho', limit:9000000, status:'Aktif', alamat:'Jl. Pandanaran No. 33, Semarang', piutang:1200000},
    {kode:'CUST-008', nama:'Toko Sejahtera', kota:'Surabaya', salesman:'Andi Wijaya', limit:17500000, status:'Aktif', alamat:'Jl. Kertajaya No. 67, Surabaya', piutang:3120000},
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
    {no:'26/SO/BDG/08/00005', noSP:'SP/BDG/08/00005', noSQ:'', noDSC:'', customer:'CV Berkah Abadi', wilayah:'Bandung', ts:'Dikirim', statusApproval:'Approved',
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
    {no:'26/SO/BDG/08/00004', noSP:'SP/BDG/08/00004', noSQ:'', noDSC:'DSC/BDG/08/00001', customer:'CV Berkah Abadi', wilayah:'Bandung', ts:'Diproses', statusApproval:'Rejected',
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
     mengklik apa pun lebih dulu. */
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
      tglInput:'11/08/2026 10:30', userInput:'sidik', tglEdit:'', userEdit:''},
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
      jumlah:880000, posted:true, ts:'Invoice Selesai',
      tglInput:'08/08/2026 15:20', userInput:'sidik', tglEdit:'09/08/2026 09:15', userEdit:'sidik'},
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
      tglInput:'06/08/2026 11:00', userInput:'sidik', tglEdit:'', userEdit:''},
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
      tglInput:'07/08/2026 13:15', userInput:'sidik', tglEdit:'', userEdit:''},
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
      jumlah:1120000, posted:true, ts:'Invoice Selesai',
      tglInput:'07/08/2026 16:00', userInput:'sidik', tglEdit:'07/08/2026 17:20', userEdit:'sidik'},
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
      tglInput:'05/08/2026 15:30', userInput:'sidik', tglEdit:'', userEdit:''},
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
      tglInput:'09/08/2026 12:40', userInput:'sidik', tglEdit:'', userEdit:''},
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
      jumlah:350000, posted:true, ts:'Invoice Selesai',
      tglInput:'11/08/2026 14:10', userInput:'sidik', tglEdit:'11/08/2026 16:45', userEdit:'sidik'},
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
  penerimaanPiutang:[
    {no:'RCV-0601', tgl:'2026-08-01', customer:'Toko Sumber Rejeki', jumlah:8250000, metode:'Transfer Bank'},
    {no:'RCV-0602', tgl:'2026-08-02', customer:'Toko Sejahtera', jumlah:3120000, metode:'Tunai'},
    {no:'RCV-0603', tgl:'2026-08-03', customer:'UD Makmur Jaya', jumlah:2500000, metode:'Transfer Bank'},
    {no:'RCV-0604', tgl:'2026-08-04', customer:'CV Maju Terus', jumlah:4300000, metode:'Giro'},
  ],
  items:[
    {kode:'BRG-001', nama:'Minyak Goreng Sunco 2L', kategori:'Sembako', satuan:'Dus', stok:1240, harga:25000},
    {kode:'BRG-002', nama:'Gula Pasir Gulaku 1kg', kategori:'Sembako', satuan:'Karung', stok:860, harga:15000},
    {kode:'BRG-003', nama:'Beras Premium Rojolele 5kg', kategori:'Sembako', satuan:'Karung', stok:410, harga:60000},
    {kode:'BRG-004', nama:'Tepung Terigu Segitiga Biru 1kg', kategori:'Bahan Baku', satuan:'Karung', stok:990, harga:12000},
    {kode:'BRG-005', nama:'Mie Instan Indomie Goreng', kategori:'Makanan', satuan:'Dus', stok:2210, harga:2500},
    {kode:'BRG-006', nama:'Kecap Manis ABC 600ml', kategori:'Bumbu', satuan:'Dus', stok:530, harga:14000},
    {kode:'BRG-007', nama:'Susu Kental Manis Indomilk 380gr', kategori:'Minuman', satuan:'Dus', stok:640, harga:16000},
    {kode:'BRG-008', nama:'Teh Celup Sariwangi 25s', kategori:'Minuman', satuan:'Dus', stok:720, harga:10000},
    {kode:'BRG-009', nama:'Kopi Kapal Api 165gr', kategori:'Minuman', satuan:'Dus', stok:380, harga:14000},
    {kode:'BRG-010', nama:'Sabun Mandi Lifebuoy 90gr', kategori:'Toiletries', satuan:'Dus', stok:990, harga:5000},
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
  aktivaTetap:[
    {kode:'AT-001', nama:'Truk Box Isuzu Elf', tahun:2023, nilai:350000000, akumulasi:70000000, buku:280000000},
    {kode:'AT-002', nama:'Forklift Gudang', tahun:2022, nilai:180000000, akumulasi:54000000, buku:126000000},
    {kode:'AT-003', nama:'Rak Gudang Besi (Set)', tahun:2024, nilai:45000000, akumulasi:4500000, buku:40500000},
    {kode:'AT-004', nama:'Komputer Kantor (5 unit)', tahun:2024, nilai:35000000, akumulasi:7000000, buku:28000000},
  ],
  users:[
    {nama:'Sidik', username:'sidik', role:'Administrator', status:'Aktif'},
    {nama:'Budi Santoso', username:'budi.s', role:'Salesman', status:'Aktif'},
    {nama:'Rina Kusuma', username:'rina.k', role:'Finance', status:'Aktif'},
    {nama:'Wawan Setiadi', username:'wawan.s', role:'Gudang', status:'Aktif'},
    {nama:'Lia Amelia', username:'lia.a', role:'Purchasing', status:'Non Aktif'},
  ],
  reports:['Laporan Penjualan','Laporan Pembelian','Laporan Persediaan / Stok','Laporan Piutang','Laporan Hutang','Laporan Laba Rugi','Laporan Kas / Bank','Laporan Aktiva Tetap','Laporan Komisi Salesman','Laporan Aging Piutang'],
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
    {kode:'5110002', nama:'HPP Konsinyasi', kategori:'E', tipe:'D', jenis:'Detail', saldoAwal:0, debet:0, kredit:0, saldoAkhir:0},
    {kode:'2110003', nama:'Hutang R/K Cabang', kategori:'B', tipe:'K', jenis:'Detail', saldoAwal:0, debet:0, kredit:0, saldoAkhir:0},
    {kode:'1120002', nama:'Piutang R/K Cabang', kategori:'A', tipe:'D', jenis:'Detail', saldoAwal:0, debet:0, kredit:0, saldoAkhir:0},
    {kode:'1130002', nama:'Persediaan Barang Intransit', kategori:'A', tipe:'D', jenis:'Detail', saldoAwal:0, debet:0, kredit:0, saldoAkhir:0},
    {kode:'2120002', nama:'PPN Keluaran', kategori:'B', tipe:'K', jenis:'Detail', saldoAwal:0, debet:0, kredit:0, saldoAkhir:0},
    {kode:'4110004', nama:'Sales Item Discount (Principal)', kategori:'D', tipe:'D', jenis:'Detail', saldoAwal:0, debet:0, kredit:0, saldoAkhir:0},
    {kode:'4110005', nama:'Sales Item Discount (Distributor)', kategori:'D', tipe:'D', jenis:'Detail', saldoAwal:0, debet:0, kredit:0, saldoAkhir:0},
  ],
  jurnalPembelian:[
    {kode:1, nama:'JURNAL PEMBELIAN KREDIT (IDR)', tipeJurnal:'Kredit', mataUang:'', cabang:'Head Office', konsinyasi:false, nonAktif:false,
      akunUtang:'2110001', akunKreditSementara:'2110002', akunBudgetDiskon:'', akunPPN:'1140002', akunOngkosKirim:'', akunLabaSelisihKurs:'6010002', akunRugiSelisihKurs:'6510002', akunSelisihDebitKredit:'6510003', akunUangMuka:'1140001',
      akunReturUtang:'2110001', akunReturPajak:'1140002',
      akunHppKonsinyasi:'', akunBiayaPemakaian:'', akunDiskonPrincipal:'', akunHutangRK:'', akunPiutangRK:'', akunHutangBelumDifaktur:''},
    {kode:2, nama:'JURNAL PEMBELIAN KONSINYASI (SEMARANG)(IDR)', tipeJurnal:'Kredit', mataUang:'', cabang:'Semarang', konsinyasi:true, nonAktif:false,
      akunUtang:'2110001', akunKreditSementara:'', akunBudgetDiskon:'', akunPPN:'1140002', akunOngkosKirim:'', akunLabaSelisihKurs:'6010002', akunRugiSelisihKurs:'6510002', akunSelisihDebitKredit:'6510003', akunUangMuka:'1140001',
      akunReturUtang:'2110001', akunReturPajak:'1140002',
      akunHppKonsinyasi:'5110002', akunBiayaPemakaian:'', akunDiskonPrincipal:'', akunHutangRK:'2110003', akunPiutangRK:'1120002', akunHutangBelumDifaktur:''},
    {kode:3, nama:'JURNAL PEMBELIAN KONSINYASI (TANGERANG)(IDR)', tipeJurnal:'Kredit', mataUang:'', cabang:'Tangerang', konsinyasi:true, nonAktif:false,
      akunUtang:'2110001', akunKreditSementara:'', akunBudgetDiskon:'', akunPPN:'1140002', akunOngkosKirim:'', akunLabaSelisihKurs:'6010002', akunRugiSelisihKurs:'6510002', akunSelisihDebitKredit:'6510003', akunUangMuka:'1140001',
      akunReturUtang:'2110001', akunReturPajak:'1140002',
      akunHppKonsinyasi:'5110002', akunBiayaPemakaian:'', akunDiskonPrincipal:'', akunHutangRK:'2110003', akunPiutangRK:'1120002', akunHutangBelumDifaktur:''},
    {kode:4, nama:'JURNAL PEMBELIAN KONSINYASI (SIDOARJO)(IDR)', tipeJurnal:'Kredit', mataUang:'', cabang:'Sidoarjo', konsinyasi:true, nonAktif:false,
      akunUtang:'2110001', akunKreditSementara:'', akunBudgetDiskon:'', akunPPN:'1140002', akunOngkosKirim:'', akunLabaSelisihKurs:'6010002', akunRugiSelisihKurs:'6510002', akunSelisihDebitKredit:'6510003', akunUangMuka:'1140001',
      akunReturUtang:'2110001', akunReturPajak:'1140002',
      akunHppKonsinyasi:'5110002', akunBiayaPemakaian:'', akunDiskonPrincipal:'', akunHutangRK:'2110003', akunPiutangRK:'1120002', akunHutangBelumDifaktur:''},
    {kode:5, nama:'JURNAL PEMBELIAN CBD (IDR)', tipeJurnal:'Kas', mataUang:'IDR', cabang:'Head Office', konsinyasi:false, nonAktif:false,
      akunUtang:'2110001', akunKreditSementara:'', akunBudgetDiskon:'', akunPPN:'1140002', akunOngkosKirim:'', akunLabaSelisihKurs:'6010002', akunRugiSelisihKurs:'6510002', akunSelisihDebitKredit:'6510003', akunUangMuka:'1140001',
      akunReturUtang:'2110001', akunReturPajak:'1140002',
      akunHppKonsinyasi:'', akunBiayaPemakaian:'', akunDiskonPrincipal:'', akunHutangRK:'', akunPiutangRK:'', akunHutangBelumDifaktur:''},
    {kode:6, nama:'JURNAL PEMBELIAN KONSINYASI (BANDUNG)(IDR)', tipeJurnal:'Kredit', mataUang:'', cabang:'Bandung', konsinyasi:true, nonAktif:false,
      akunUtang:'2110001', akunKreditSementara:'', akunBudgetDiskon:'', akunPPN:'1140002', akunOngkosKirim:'', akunLabaSelisihKurs:'6010002', akunRugiSelisihKurs:'6510002', akunSelisihDebitKredit:'6510003', akunUangMuka:'1140001',
      akunReturUtang:'2110001', akunReturPajak:'1140002',
      akunHppKonsinyasi:'5110002', akunBiayaPemakaian:'', akunDiskonPrincipal:'', akunHutangRK:'2110003', akunPiutangRK:'1120002', akunHutangBelumDifaktur:''},
    {kode:7, nama:'JURNAL PEMBELIAN COD (IDR)', tipeJurnal:'Kas', mataUang:'', cabang:'Head Office', konsinyasi:false, nonAktif:false,
      akunUtang:'2110001', akunKreditSementara:'', akunBudgetDiskon:'', akunPPN:'1140002', akunOngkosKirim:'', akunLabaSelisihKurs:'6010002', akunRugiSelisihKurs:'6510002', akunSelisihDebitKredit:'6510003', akunUangMuka:'1140001',
      akunReturUtang:'2110001', akunReturPajak:'1140002',
      akunHppKonsinyasi:'', akunBiayaPemakaian:'', akunDiskonPrincipal:'', akunHutangRK:'', akunPiutangRK:'', akunHutangBelumDifaktur:''},
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
      akunReturKredit:'1120001', akunReturPajak:'2120002'},
  ],
  /* Stock Request — menu Persediaan Barang > Daftar Transaksi > Stock
     Request (lihat js/pages/stock-request.*). Setiap baris "items"
     adalah rincian barang yang diminta transfer dari Gudang Sumber ke
     Gudang Target, dikelompokkan per Kategori Barang (field `kategori`
     mengacu ke DATA.items). NB: 2 baris contoh di bawah meniru screenshot
     MASERP "Daftar Stock Request" & "Stock Request" persis pada field
     No. Request/No. PO/Tgl/User/Status, tapi kode & nama barang serta
     nama Supplier diganti ke data milik DBM sendiri (BRG-xxx, supplier
     dari DATA.suppliers) karena screenshot berasal dari demo perusahaan
     farmasi lain (kode barang 01-30003 dst, supplier "PT SATORIA ANEKA
     INDUSTRI" tidak ada di master DBM) — pola yang sama seperti
     penyesuaian kode akun GL di Jurnal Pembelian. */
  stockRequest:[
    {no:'26/SR/SMG/08/00001', noPO:'26/PO/HO/08/00003', tglRequest:'06/08/2026', userEntry:'khalimatus_apja', reorderingSheet:'', tipeTransaksi:'Transfer Out', keterangan:'', status:'CLOSED', closedManually:false,
      cabangRequest:'Semarang', supplier:'', gudangSumber:'(00-GUU) Gudang Utama-HO', gudangTarget:'(05-GSM) Gudang Semarang', edBulan:0, usedInPO:true,
      items:[
        {kode:'BRG-007', nama:'Susu Kental Manis Indomilk 380gr', kategori:'Minuman', qtyReordering:800, pilih:true, qty:800, um:'Dus'},
        {kode:'BRG-008', nama:'Teh Celup Sariwangi 25s', kategori:'Minuman', qtyReordering:600, pilih:true, qty:600, um:'Dus'},
      ],
      tglInput:'06/08/2026 09:12:30', userInput:'khalimatus_apja', tglEdit:'', userEdit:''},
    {no:'26/SR/TGR/08/00001', noPO:'26/PO/HO/08/00002', tglRequest:'03/08/2026', userEntry:'sarah_scc', reorderingSheet:'26/ROS/TGR/08/00001', tipeTransaksi:'Transfer Out', keterangan:'PO PT. DAN', status:'OPEN', closedManually:false,
      cabangRequest:'Tangerang', supplier:'PT Sumber Pangan Nusantara', gudangSumber:'(00-GUU) Gudang Utama-HO', gudangTarget:'(00-GUU) Gudang Utama-HO', edBulan:0, usedInPO:true,
      items:[
        {kode:'BRG-001', nama:'Minyak Goreng Sunco 2L', kategori:'Sembako', qtyReordering:6000, pilih:true, qty:6000, um:'Dus'},
        {kode:'BRG-002', nama:'Gula Pasir Gulaku 1kg', kategori:'Sembako', qtyReordering:3000, pilih:true, qty:3000, um:'Karung'},
        {kode:'BRG-003', nama:'Beras Premium Rojolele 5kg', kategori:'Sembako', qtyReordering:2000, pilih:true, qty:2000, um:'Karung'},
      ],
      tglInput:'03/08/2026 13:00:56', userInput:'sarah_scc', tglEdit:'07/08/2026 10:42:41', userEdit:'sidik'},
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
     (yang skalanya tidak konsisten dengan skema harga barang DBM). */
  purchaseOrder:[
    {no:'26/PO/HO/08/00011', noPR:'', tglPO:'06/08/2026', supplier:'PT Sumber Pangan Nusantara', keterangan:'26/SR/HO/08/00003 - Sembako Gudang Utama', status:'Pending Receive', cetakanKe:1,
      cabang:'Head Office', cabangTarget:'Head Office', typePO:'Persediaan', noStockRequest:'26/SR/HO/08/00003', fob:'', shipVia:'Ekspedisi', cito:false,
      noOtomatis:'PO001', etd:'07/08/2026', noSoIndent:'', syaratBayar:'Kredit 60 Hari', gudang:'Gudang Utama-HO', gudangTarget:'Gudang Utama-HO',
      jurnalBPB:'JURNAL PEMBELIAN KREDIT (IDR)', alamatPengiriman:'Jl. Raya Industri No. 10, Kawasan Pergudangan Cakung, Jakarta Timur',
      items:[{kode:'BRG-001', nama:'Minyak Goreng Sunco 2L', qty:200, um:'Dus', hargaBeli:25000, feeDistribusi:5, budgetDiskon:0, totalDisc:5, discBarang:250000, jumlah:4750000, pph:true}],
      ppnMode:'eksklusif', mataUang:'IDR', kurs:1, diskon1:0, diskon1Amount:0, diskon2:0, diskon2Amount:0, dpp:4750000, pajak11:'PPN11', ppnAmount:522500,
      pphAktif:true, pphKode:'PPH 22 (0.3)', pphPersen:0.3, pphAmount:14250, ongkosAngkut:0, jumlahTotal:5258250,
      tglInput:'06/08/2026 08:20:10', userInput:'sidik', tglEdit:'', userEdit:''},
    {no:'26/PO/HO/08/00010', noPR:'', tglPO:'06/08/2026', supplier:'PT Wilmar Nabati Indonesia', keterangan:'26/SR/BDG/08/00001 - Stok Jabar', status:'Pending Receive', cetakanKe:1,
      cabang:'Head Office', cabangTarget:'Head Office', typePO:'Persediaan', noStockRequest:'26/SR/BDG/08/00001', fob:'', shipVia:'Ekspedisi', cito:false,
      noOtomatis:'PO001', etd:'08/08/2026', noSoIndent:'', syaratBayar:'Kredit 45 Hari', gudang:'Gudang Utama-HO', gudangTarget:'Gudang Bandung',
      jurnalBPB:'JURNAL PEMBELIAN KREDIT (IDR)', alamatPengiriman:'Jl. Ir. H. Juanda No. 88, Bandung',
      items:[{kode:'BRG-002', nama:'Gula Pasir Gulaku 1kg', qty:500, um:'Karung', hargaBeli:15000, feeDistribusi:2, budgetDiskon:0, totalDisc:2, discBarang:150000, jumlah:7350000, pph:true}],
      ppnMode:'eksklusif', mataUang:'IDR', kurs:1, diskon1:0, diskon1Amount:0, diskon2:0, diskon2Amount:0, dpp:7350000, pajak11:'PPN11', ppnAmount:808500,
      pphAktif:false, pphKode:'', pphPersen:0, pphAmount:0, ongkosAngkut:0, jumlahTotal:8158500,
      tglInput:'06/08/2026 09:05:44', userInput:'sidik', tglEdit:'', userEdit:''},
    {no:'26/PO/HO/08/00009', noPR:'26/PR-HO/07/00003', tglPO:'06/08/2026', supplier:'CV Distribusi Sentosa', keterangan:'PO Administrasi Kasbon II/SDL/VII/2026', status:'Pending Receive', cetakanKe:1,
      cabang:'Head Office', cabangTarget:'Head Office', typePO:'Persediaan', noStockRequest:'', fob:'', shipVia:'Ekspedisi', cito:false,
      noOtomatis:'PO001', etd:'08/08/2026', noSoIndent:'', syaratBayar:'Kredit 14 Hari', gudang:'Gudang Utama-HO', gudangTarget:'Gudang Utama-HO',
      jurnalBPB:'JURNAL PEMBELIAN KREDIT (IDR)', alamatPengiriman:'Jl. Ir. H. Juanda No. 88, Bandung',
      items:[{kode:'BRG-004', nama:'Tepung Terigu Segitiga Biru 1kg', qty:100, um:'Karung', hargaBeli:12000, feeDistribusi:0, budgetDiskon:0, totalDisc:0, discBarang:0, jumlah:1200000, pph:true}],
      ppnMode:'eksklusif', mataUang:'IDR', kurs:1, diskon1:0, diskon1Amount:0, diskon2:0, diskon2Amount:0, dpp:1200000, pajak11:'PPN11', ppnAmount:132000,
      pphAktif:false, pphKode:'', pphPersen:0, pphAmount:0, ongkosAngkut:0, jumlahTotal:1332000,
      tglInput:'06/08/2026 10:12:00', userInput:'sidik', tglEdit:'', userEdit:''},
    {no:'26/PO/HO/08/00008', noPR:'26/PR-HO/07/00002', tglPO:'06/08/2026', supplier:'CV Distribusi Sentosa', keterangan:'PO Administrasi Kasbon II/SDL/VII/2026', status:'Pending Receive', cetakanKe:2,
      cabang:'Head Office', cabangTarget:'Head Office', typePO:'Persediaan', noStockRequest:'', fob:'', shipVia:'Ekspedisi', cito:false,
      noOtomatis:'PO001', etd:'08/08/2026', noSoIndent:'', syaratBayar:'Kredit 14 Hari', gudang:'Gudang Utama-HO', gudangTarget:'Gudang Utama-HO',
      jurnalBPB:'JURNAL PEMBELIAN KREDIT (IDR)', alamatPengiriman:'Jl. Ir. H. Juanda No. 88, Bandung',
      items:[{kode:'BRG-004', nama:'Tepung Terigu Segitiga Biru 1kg', qty:100, um:'Karung', hargaBeli:12000, feeDistribusi:0, budgetDiskon:0, totalDisc:0, discBarang:0, jumlah:1200000, pph:true}],
      ppnMode:'eksklusif', mataUang:'IDR', kurs:1, diskon1:0, diskon1Amount:0, diskon2:0, diskon2Amount:0, dpp:1200000, pajak11:'PPN11', ppnAmount:132000,
      pphAktif:false, pphKode:'', pphPersen:0, pphAmount:0, ongkosAngkut:0, jumlahTotal:1332000,
      tglInput:'06/08/2026 10:15:22', userInput:'sidik', tglEdit:'', userEdit:''},
    {no:'26/PO/HO/08/00007_RI', noPR:'', tglPO:'06/08/2026', supplier:'PT Sasa Inti', keterangan:'26/SR/HO/08/00002 - Pemenuhan Toko Anugrah', status:'Pending Receive', cetakanKe:2,
      cabang:'Head Office', cabangTarget:'Head Office', typePO:'Persediaan', noStockRequest:'26/SR/HO/08/00002', fob:'', shipVia:'Ekspedisi', cito:false,
      noOtomatis:'PO001', etd:'07/08/2026', noSoIndent:'', syaratBayar:'Kredit 30 Hari', gudang:'Gudang Utama-HO', gudangTarget:'Gudang Utama-HO',
      jurnalBPB:'JURNAL PEMBELIAN KREDIT (IDR)', alamatPengiriman:'Jl. Raya Industri No. 10, Kawasan Pergudangan Cakung, Jakarta Timur',
      items:[{kode:'BRG-006', nama:'Kecap Manis ABC 600ml', qty:300, um:'Dus', hargaBeli:14000, feeDistribusi:3, budgetDiskon:0, totalDisc:3, discBarang:126000, jumlah:4074000, pph:true}],
      ppnMode:'eksklusif', mataUang:'IDR', kurs:1, diskon1:0, diskon1Amount:0, diskon2:0, diskon2Amount:0, dpp:4074000, pajak11:'PPN11', ppnAmount:448140,
      pphAktif:true, pphKode:'PPH 22 (0.3)', pphPersen:0.3, pphAmount:12222, ongkosAngkut:0, jumlahTotal:4509918,
      tglInput:'06/08/2026 11:02:37', userInput:'sidik', tglEdit:'', userEdit:''},
    {no:'26/PO/HO/08/00006', noPR:'', tglPO:'06/08/2026', supplier:'PT Sasa Inti', keterangan:'26/SR/HO/08/00001 - Pemenuhan Toko Sejahtera', status:'Pending Receive', cetakanKe:1,
      cabang:'Head Office', cabangTarget:'Head Office', typePO:'Persediaan', noStockRequest:'26/SR/HO/08/00001', fob:'', shipVia:'Ekspedisi', cito:false,
      noOtomatis:'PO001', etd:'07/08/2026', noSoIndent:'', syaratBayar:'Kredit 30 Hari', gudang:'Gudang Utama-HO', gudangTarget:'Gudang Utama-HO',
      jurnalBPB:'JURNAL PEMBELIAN KREDIT (IDR)', alamatPengiriman:'Jl. Raya Industri No. 10, Kawasan Pergudangan Cakung, Jakarta Timur',
      items:[{kode:'BRG-006', nama:'Kecap Manis ABC 600ml', qty:150, um:'Dus', hargaBeli:14000, feeDistribusi:3, budgetDiskon:0, totalDisc:3, discBarang:63000, jumlah:2037000, pph:true}],
      ppnMode:'eksklusif', mataUang:'IDR', kurs:1, diskon1:0, diskon1Amount:0, diskon2:0, diskon2Amount:0, dpp:2037000, pajak11:'PPN11', ppnAmount:224070,
      pphAktif:true, pphKode:'PPH 22 (0.3)', pphPersen:0.3, pphAmount:6111, ongkosAngkut:0, jumlahTotal:2254959,
      tglInput:'06/08/2026 11:30:05', userInput:'sidik', tglEdit:'', userEdit:''},
    {no:'26/PO/HO/08/00005', noPR:'26/PR-HO/07/00002', tglPO:'05/08/2026', supplier:'CV Distribusi Sentosa', keterangan:'PO Administrasi Kasbon IT No. 002/SDL/07/2026', status:'Pending Receive', cetakanKe:1,
      cabang:'Head Office', cabangTarget:'Head Office', typePO:'Persediaan', noStockRequest:'', fob:'', shipVia:'Ekspedisi', cito:false,
      noOtomatis:'PO001', etd:'07/08/2026', noSoIndent:'', syaratBayar:'Kredit 14 Hari', gudang:'Gudang Utama-HO', gudangTarget:'Gudang Utama-HO',
      jurnalBPB:'JURNAL PEMBELIAN KREDIT (IDR)', alamatPengiriman:'Jl. Ir. H. Juanda No. 88, Bandung',
      items:[{kode:'BRG-004', nama:'Tepung Terigu Segitiga Biru 1kg', qty:50, um:'Karung', hargaBeli:12000, feeDistribusi:0, budgetDiskon:0, totalDisc:0, discBarang:0, jumlah:600000, pph:true}],
      ppnMode:'eksklusif', mataUang:'IDR', kurs:1, diskon1:0, diskon1Amount:0, diskon2:0, diskon2Amount:0, dpp:600000, pajak11:'PPN11', ppnAmount:66000,
      pphAktif:false, pphKode:'', pphPersen:0, pphAmount:0, ongkosAngkut:0, jumlahTotal:666000,
      tglInput:'05/08/2026 09:40:00', userInput:'sidik', tglEdit:'', userEdit:''},
    {no:'26/PO/HO/08/00004', noPR:'26/PR-HO/07/00003', tglPO:'05/08/2026', supplier:'CV Distribusi Sentosa', keterangan:'PO Administrasi Kasbon IT No. 001/SDL/07/2026', status:'Pending Receive', cetakanKe:1,
      cabang:'Head Office', cabangTarget:'Head Office', typePO:'Persediaan', noStockRequest:'', fob:'', shipVia:'Ekspedisi', cito:false,
      noOtomatis:'PO001', etd:'07/08/2026', noSoIndent:'', syaratBayar:'Kredit 14 Hari', gudang:'Gudang Utama-HO', gudangTarget:'Gudang Utama-HO',
      jurnalBPB:'JURNAL PEMBELIAN KREDIT (IDR)', alamatPengiriman:'Jl. Ir. H. Juanda No. 88, Bandung',
      items:[{kode:'BRG-004', nama:'Tepung Terigu Segitiga Biru 1kg', qty:50, um:'Karung', hargaBeli:12000, feeDistribusi:0, budgetDiskon:0, totalDisc:0, discBarang:0, jumlah:600000, pph:true}],
      ppnMode:'eksklusif', mataUang:'IDR', kurs:1, diskon1:0, diskon1Amount:0, diskon2:0, diskon2Amount:0, dpp:600000, pajak11:'PPN11', ppnAmount:66000,
      pphAktif:false, pphKode:'', pphPersen:0, pphAmount:0, ongkosAngkut:0, jumlahTotal:666000,
      tglInput:'05/08/2026 09:42:15', userInput:'sidik', tglEdit:'', userEdit:''},
    {no:'26/PO/HO/08/00003', noPR:'', tglPO:'05/08/2026', supplier:'PT Sumber Pangan Nusantara', keterangan:'26/SR/SMG/08/00001 - Penambahan Stok Semarang', status:'Pending Receive', cetakanKe:1,
      cabang:'Head Office', cabangTarget:'Head Office', typePO:'Persediaan', noStockRequest:'26/SR/SMG/08/00001', fob:'', shipVia:'Ekspedisi', cito:false,
      noOtomatis:'PO001', etd:'06/08/2026', noSoIndent:'', syaratBayar:'Kredit 30 Hari', gudang:'Gudang Utama-HO', gudangTarget:'Gudang Semarang',
      jurnalBPB:'JURNAL PEMBELIAN KREDIT (IDR)', alamatPengiriman:'Jl. Pemuda No. 45, Semarang',
      items:[{kode:'BRG-007', nama:'Susu Kental Manis Indomilk 380gr', qty:100, um:'Dus', hargaBeli:16000, feeDistribusi:2, budgetDiskon:0, totalDisc:2, discBarang:32000, jumlah:1568000, pph:true}],
      ppnMode:'eksklusif', mataUang:'IDR', kurs:1, diskon1:0, diskon1Amount:0, diskon2:0, diskon2Amount:0, dpp:1568000, pajak11:'PPN11', ppnAmount:172480,
      pphAktif:false, pphKode:'', pphPersen:0, pphAmount:0, ongkosAngkut:0, jumlahTotal:1740480,
      tglInput:'05/08/2026 14:05:50', userInput:'sidik', tglEdit:'', userEdit:''},
    {no:'26/PO/HO/08/00002', noPR:'', tglPO:'03/08/2026', supplier:'PT Sumber Pangan Nusantara', keterangan:'Pemenuhan PT. DAN Direct dari Pabrik', status:'Pending Receive', cetakanKe:0,
      cabang:'Head Office', cabangTarget:'Head Office', typePO:'Persediaan', noStockRequest:'', fob:'', shipVia:'Diambil Sendiri', cito:false,
      noOtomatis:'PO001', etd:'04/08/2026', noSoIndent:'', syaratBayar:'CBD', gudang:'Gudang Utama-HO', gudangTarget:'Gudang Utama-HO',
      jurnalBPB:'JURNAL PEMBELIAN CBD (IDR)', alamatPengiriman:'Jl. Raya Industri No. 10, Kawasan Pergudangan Cakung, Jakarta Timur',
      items:[{kode:'BRG-001', nama:'Minyak Goreng Sunco 2L', qty:30, um:'Dus', hargaBeli:25000, feeDistribusi:0, budgetDiskon:0, totalDisc:0, discBarang:0, jumlah:750000, pph:true}],
      ppnMode:'eksklusif', mataUang:'IDR', kurs:1, diskon1:0, diskon1Amount:0, diskon2:0, diskon2Amount:0, dpp:750000, pajak11:'PPN11', ppnAmount:82500,
      pphAktif:false, pphKode:'', pphPersen:0, pphAmount:0, ongkosAngkut:0, jumlahTotal:832500,
      tglInput:'03/08/2026 08:15:00', userInput:'sidik', tglEdit:'', userEdit:''},
    {no:'26/PO/HO/08/00001', noPR:'', tglPO:'01/08/2026', supplier:'PT Roda Mas Trading', keterangan:'Pembelian Rutin Bulanan Gudang Cirebon', status:'Pending Receive', cetakanKe:1,
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
    {no:'26/PU/HO/08/00001', noBPB:'26/BPB/HO/08/00001', noPO:'26/PO/HO/08/00011', noReturPB:'', supplier:'PT Sumber Pangan Nusantara',
      keterangan:'PJK/SPN/08/0231 ; SJK SJ/SPN/08/0231 ; 26/BPB/HO/08/00001',
      cabang:'Head Office', noOtomatis:'PU001',
      tglFaktur:'09/08/2026', syaratBayar:'Kredit 60 Hari', tglJatuhTempo:'08/10/2026',
      supplierNoFaktur:'INV/SPN/08/0231-A', jurnal:'JURNAL PEMBELIAN KREDIT (IDR)', alamatPengiriman:'Jl. Raya Industri No. 10, Kawasan Pergudangan Cakung, Jakarta Timur',
      items:[{kode:'BRG-001', nama:'Minyak Goreng Sunco 2L', qty:200, um:'Dus', hargaBeli:25000, feeDistribusi:5, budgetDiskon:0, totalDisc:5, discBarang:250000, jumlah:4750000, pph:true, ppn:true}],
      ppnMode:'eksklusif', mataUang:'IDR', tglFakturPajak:'09/08/2026', noFakturPajak:'PJK/SPN/08/0231',
      kurs:1, diskon1:0, diskon1Amount:0, diskon2:0, diskon2Amount:0, dpp:4750000, pajak11:'PPN11', ppnAmount:522500,
      pphAktif:true, pphKode:'PPH 22 (0.3)', pphPersen:0.3, pphAmount:14250, ongkosAngkut:0, jumlahTotal:5258250,
      uangMukaTipe:'Oldest', sisaUangMuka:0, uangMukaPakai:0, sisaJumlah:5258250,
      pembayaran:0, tglInput:'09/08/2026 15:10:00', userInput:'sidik', tglEdit:'', userEdit:''},
    {no:'26/PU/HO/08/00002', noBPB:'26/BPB/HO/08/00002', noPO:'26/PO/HO/08/00010', noReturPB:'', supplier:'PT Wilmar Nabati Indonesia',
      keterangan:'PJK/WNI/08/0088 ; SJK SJ/WNI/08/0088 ; 26/BPB/HO/08/00002',
      cabang:'Head Office', noOtomatis:'PU001',
      tglFaktur:'10/08/2026', syaratBayar:'Kredit 45 Hari', tglJatuhTempo:'24/09/2026',
      supplierNoFaktur:'INV/WNI/08/0088-A', jurnal:'JURNAL PEMBELIAN KREDIT (IDR)', alamatPengiriman:'Jl. Ir. H. Juanda No. 88, Bandung',
      items:[{kode:'BRG-002', nama:'Gula Pasir Gulaku 1kg', qty:500, um:'Karung', hargaBeli:15000, feeDistribusi:2, budgetDiskon:0, totalDisc:2, discBarang:150000, jumlah:7350000, pph:false, ppn:true}],
      ppnMode:'eksklusif', mataUang:'IDR', tglFakturPajak:'10/08/2026', noFakturPajak:'PJK/WNI/08/0088',
      kurs:1, diskon1:0, diskon1Amount:0, diskon2:0, diskon2Amount:0, dpp:7350000, pajak11:'PPN11', ppnAmount:808500,
      pphAktif:false, pphKode:'', pphPersen:0, pphAmount:0, ongkosAngkut:0, jumlahTotal:8158500,
      uangMukaTipe:'Oldest', sisaUangMuka:0, uangMukaPakai:0, sisaJumlah:8158500,
      pembayaran:0, tglInput:'10/08/2026 10:45:00', userInput:'sidik', tglEdit:'', userEdit:''},
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
};
