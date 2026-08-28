/* =========================================================
   LOGIC (JS saja) — Sales Order (Customer & Penjualan > Daftar
   Transaksi). Dimuat otomatis (lazy-load) oleh core.js saat menu
   ini pertama kali diklik — lihat PAGE_MODULES di js/core.js.
   Markup HTML-nya ada di file sebelah: sales-order.template.js
   (tplSalesOrderListPage/tplSoRows/tplSoForm/dst, plus konstanta
   SO_TS_LIST/SO_APPROVAL_LIST/dst yang dipakai bersama di sini).
   NB: closeModal() dipakai bersama, didefinisikan di core.js.

   Pola CRUD: list + form FULL PAGE (sama seperti Purchase Order/
   Stock Request), dengan tabel rincian barang 2-tingkat (baris
   ringkasan kalkulasi harga/diskon/pajak + baris detail No. Batch/
   Tgl. Kadaluarsa) yang re-kalkulasi reaktif tiap kali Qty/HNA1/
   Potongan/Type PPN berubah — mengikuti persis pola
   poRecalcItem()/poRefreshItemRowDOM() & poRecalcTotals()/
   poRefreshTotalsDOM() split di Purchase Order (pure calc function
   TIDAK menyentuh DOM, function *DOM terpisah meng-update tampilan).
   Field CL/Piutang/Sisa CL juga reaktif: langsung terisi ulang begitu
   Customer diganti (lihat soRecalcCustomerFinance/
   soRefreshCustomerFinanceDOM & wiring di openSoCustomerPicker).
========================================================= */

function renderSalesOrderPage(){
  renderSoList();
}

function renderSoList(){
  content.innerHTML = tplSalesOrderListPage();
  document.getElementById('btnSoAdd').onclick = () => openSoForm('add');
  document.getElementById('btnSoStatusFilter').onclick = () => openSoInfo('Filter Status Approval', 'Menampilkan semua Status Approval (Pending/Approved/Rejected). Filter per status akan tersedia pada versi lengkap.');
  document.getElementById('btnSoPeriod').onclick = () => openSoInfo('Filter Periode', 'Menampilkan Sales Order untuk periode Agustus 2026. Pemilihan periode lain akan tersedia pada versi lengkap.');
  renderSoTable();
}

function renderSoTable(){
  const tbody = document.getElementById('soTbody');
  const total = document.getElementById('soTotal');
  tbody.innerHTML = tplSoRows(DATA.salesOrders);
  total.textContent = `Total Record: ${DATA.salesOrders.length}`;
  tbody.querySelectorAll('[data-view]').forEach(b => b.onclick = () => openSoForm('view', +b.dataset.view));
  tbody.querySelectorAll('[data-edit]').forEach(b => b.onclick = () => openSoForm('edit', +b.dataset.edit));
  tbody.querySelectorAll('[data-del]').forEach(b => b.onclick = () => openSoDeleteConfirm(+b.dataset.del));
}

function soGenerateNumber(sOffice){
  const kode = SO_CABANG_CODE[sOffice] || 'XXX';
  const seq = DATA.salesOrders.filter(r => r.sOffice === sOffice).length + 1;
  return `26/SO/${kode}/08/${String(seq).padStart(5,'0')}`;
}

function soBuildEmptyItem(){
  return { kode:'', nama:'', qty:1, um:'', hna1:0, hnaXqty:0, potongan:0, dpp:0, typePpn:DATA.typePpnList[0], ppn:0, biayaKirim:0, noBatch:'', tglKadaluarsa:'' };
}

/* Kalkulasi murni 1 baris item — TIDAK menyentuh DOM (dipanggil oleh
   wireSoItemEvents/openSoItemPicker, tampilannya di-refresh terpisah
   lewat soRefreshItemRowDOM). Potongan didefinisikan sebagai NOMINAL
   Rupiah (bukan persen) — sesuai rumus "DPP = HNA1 x Qty − Potongan".
   PPN: hanya mode 'PPN 11%' yang benar-benar dihitung (11% dari DPP);
   mode 'PPN 12%'/'Non PKP' disederhanakan jadi 0 — pola simplifikasi
   yang sama seperti poRecalcTotals() di Purchase Order (mode PPN
   "Tidak ada"/"Tidak Dipungut" -> ppnAmount 0 tanpa ekstraksi lebih
   jauh), supaya mockup tidak perlu simulasi tabel pajak lengkap. */
function soRecalcItem(item){
  item.hnaXqty = Math.round((+item.hna1 || 0) * (+item.qty || 0));
  item.dpp = Math.max(0, item.hnaXqty - (+item.potongan || 0));
  item.ppn = (item.typePpn === 'PPN 11%') ? Math.round(item.dpp * 0.11) : 0;
}

function soRefreshItemRowDOM(idx, item){
  const hnaXqtyEl = document.querySelector(`[data-so-hnaxqty="${idx}"]`);
  const dppEl = document.querySelector(`[data-so-dpp="${idx}"]`);
  const ppnEl = document.querySelector(`[data-so-ppn="${idx}"]`);
  if(hnaXqtyEl) hnaXqtyEl.value = num(item.hnaXqty);
  if(dppEl) dppEl.value = num(item.dpp);
  if(ppnEl) ppnEl.value = num(item.ppn);
}

/* Total dokumen — Biaya Kirim didefinisikan per-baris (kolom di tabel
   item) lalu dijumlah ke Total Biaya Kirim dokumen, konsisten dengan
   Ongkos Angkut di Purchase Order yang juga masuk ke Jumlah Akhir.

   2026-08-28 — FITUR BARU "Diskon Global 1 & 2" (modifikasi DBM yang
   diminta user, ada juga di Invoice & Faktur Penjualan): dihitung
   BERTINGKAT dari Total DPP — Diskon Global 1 dari Total DPP, lalu
   Diskon Global 2 dari SISA setelah Diskon Global 1 — dan nilainya
   bisa dimasukkan sebagai persentase (unit '%') maupun nominal
   rupiah (unit 'Rp'). Total PPN ikut dikoreksi PROPORSIONAL terhadap
   rasio DPP-setelah-diskon / Total DPP (diskon global mengecilkan
   dasar pengenaan pajak semua baris secara merata — simplifikasi
   terdokumentasi, alokasi per-baris tidak dimodelkan di mockup ini).
   Jumlah Akhir = DPP Setelah Diskon + Total PPN (terkoreksi) + Total
   Biaya Kirim. */
function soHitungDiskonGlobal(base, nilai, unit){
  const v = +nilai || 0;
  if(unit === 'Rp') return Math.min(Math.round(v), base);
  return Math.round(base * v / 100);
}

function soRecalcTotals(row){
  row.totalDpp = row.items.reduce((s,it) => s + (+it.dpp || 0), 0);
  const ppnPenuh = row.items.reduce((s,it) => s + (+it.ppn || 0), 0);
  row.totalBiayaKirim = row.items.reduce((s,it) => s + (+it.biayaKirim || 0), 0);

  row.diskonGlobal1Amount = soHitungDiskonGlobal(row.totalDpp, row.diskonGlobal1, row.diskonGlobal1Unit);
  const sisaSetelahDg1 = row.totalDpp - row.diskonGlobal1Amount;
  row.diskonGlobal2Amount = soHitungDiskonGlobal(sisaSetelahDg1, row.diskonGlobal2, row.diskonGlobal2Unit);
  row.dppSetelahDiskon = sisaSetelahDg1 - row.diskonGlobal2Amount;

  const faktor = row.totalDpp > 0 ? (row.dppSetelahDiskon / row.totalDpp) : 1;
  row.totalPpn = Math.round(ppnPenuh * faktor);
  row.jumlahAkhir = row.dppSetelahDiskon + row.totalPpn + row.totalBiayaKirim;
}

function soRefreshTotalsDOM(row){
  document.getElementById('fSoTotalDpp').value = num(row.totalDpp);
  const dg1El = document.getElementById('fSoDg1Amount');
  if(dg1El) dg1El.value = num(row.diskonGlobal1Amount || 0);
  const dg2El = document.getElementById('fSoDg2Amount');
  if(dg2El) dg2El.value = num(row.diskonGlobal2Amount || 0);
  const dppNetEl = document.getElementById('fSoDppSetelahDiskon');
  if(dppNetEl) dppNetEl.value = num(row.dppSetelahDiskon || 0);
  document.getElementById('fSoTotalPpn').value = num(row.totalPpn);
  document.getElementById('fSoTotalBiayaKirim').value = num(row.totalBiayaKirim);
  document.getElementById('fSoJumlahAkhir').value = num(row.jumlahAkhir);
}

/* Cari promo "Diskon Syarat Bayar" (kategori DSB, fitur baru
   2026-08-28 — lihat js/pages/promotion.*) yang Active dan daftar
   syarat bayarnya memuat syarat bayar SO ini. Dipanggil saat Syarat
   Bayar berganti (manual maupun otomatis dari TOP customer). Nilai
   diskon promo diisikan ke Diskon Global 1 & 2 tapi TETAP bisa
   diubah manual setelahnya (mengubah manual melepas tautan promo). */
function soFindPromoSyaratBayar(syaratBayar){
  if(!syaratBayar) return null;
  return (DATA.promotion || []).find(p =>
    p.kategori === 'DSB' && p.status === 'Active' &&
    (p.syaratBayarDiskon || []).indexOf(syaratBayar) !== -1) || null;
}

function soApplyPromoSyaratBayar(row){
  const promo = soFindPromoSyaratBayar(row.syaratBayar);
  if(promo){
    row.diskonGlobal1 = +promo.diskonGlobal1 || 0;
    row.diskonGlobal1Unit = promo.diskonGlobal1Unit || '%';
    row.diskonGlobal2 = +promo.diskonGlobal2 || 0;
    row.diskonGlobal2Unit = promo.diskonGlobal2Unit || '%';
    row.diskonPromoKode = promo.kode;
  } else if(row.diskonPromoKode){
    /* Syarat bayar baru tidak (lagi) kena promo — diskon dari promo
       lama dicabut; diskon yang diisi manual (tanpa diskonPromoKode)
       TIDAK disentuh. */
    row.diskonGlobal1 = 0; row.diskonGlobal2 = 0;
    row.diskonPromoKode = '';
  }
  soRefreshDiskonGlobalDOM(row);
}

function soRefreshDiskonGlobalDOM(row){
  const dg1 = document.getElementById('fSoDg1');
  const dg1u = document.getElementById('fSoDg1Unit');
  const dg2 = document.getElementById('fSoDg2');
  const dg2u = document.getElementById('fSoDg2Unit');
  if(dg1) dg1.value = row.diskonGlobal1 || 0;
  if(dg1u) dg1u.value = row.diskonGlobal1Unit || '%';
  if(dg2) dg2.value = row.diskonGlobal2 || 0;
  if(dg2u) dg2u.value = row.diskonGlobal2Unit || '%';
  const note = document.getElementById('soDgPromoNote');
  if(note){
    if(row.diskonPromoKode){
      const promo = (DATA.promotion || []).find(p => p.kode === row.diskonPromoKode);
      note.style.display = '';
      note.innerHTML = `${icon('percent',12)} Diskon Global otomatis dari Promotion <b>${row.diskonPromoKode}</b>${promo ? ' — ' + promo.nama : ''} (Diskon Syarat Bayar; nilai masih bisa diubah manual).`;
    } else {
      note.style.display = 'none';
    }
  }
}

/* CL/Piutang/Sisa CL — dihitung ulang begitu Customer diganti (bukan
   nunggu tombol Simpan), mengikuti pola split "kalkulasi murni vs
   update DOM" yang sama seperti item barang & total dokumen. */
function soRecalcCustomerFinance(row, customer){
  row.cl = customer ? (+customer.limit || 0) : 0;
  row.piutang = customer ? (+customer.piutang || 0) : 0;
  row.sisaCl = row.cl - row.piutang;
}

function soRefreshCustomerFinanceDOM(row){
  document.getElementById('fSoCl').value = num(row.cl);
  document.getElementById('fSoPiutang').value = num(row.piutang);
  document.getElementById('fSoSisaCl').value = num(row.sisaCl);
}

function openSoForm(mode, idx){
  let row;
  if(mode === 'add'){
    row = {
      no: null, noSP:'', noSQ:'', noDSC:'', customer:'', wilayah:'', ts:'Baru', statusApproval:'Pending',
      sOffice: DATA.outletList[0], area: DATA.wilayah[0], layanan: DATA.layananList[0], orderVia: DATA.orderViaList[0],
      alamat:'', rayon: DATA.rayonList[0], principalKode:'', principalNama:'',
      cito:false, spAsli:false, skEd:false, cl:0, piutang:0, sisaCl:0,
      konsinyasi:false, keterangan:'', isGuarantee:false, pecahFaktur:false, ukuranBasis:'KG',
      /* syaratBayar + diskonGlobal* — fitur baru 2026-08-28 (lihat
         soRecalcTotals/soApplyPromoSyaratBayar di atas). */
      syaratBayar:'', diskonGlobal1:0, diskonGlobal1Unit:'%', diskonGlobal1Amount:0,
      diskonGlobal2:0, diskonGlobal2Unit:'%', diskonGlobal2Amount:0, dppSetelahDiskon:0, diskonPromoKode:'',
      items:[soBuildEmptyItem()], totalDpp:0, totalPpn:0, totalBiayaKirim:0, jumlahAkhir:0,
      tglSO:'11/08/2026', tglInput:'', userInput:'', tglEdit:'', userEdit:'',
    };
    row.no = soGenerateNumber(row.sOffice);
  } else {
    const src = DATA.salesOrders[idx];
    row = { ...src, items: src.items.map(it => ({ ...it })) };
  }

  content.innerHTML = tplSoForm(mode, row);

  if(mode === 'view'){
    document.getElementById('soTutup').onclick = (e) => { e.preventDefault(); renderSoList(); };
    return;
  }

  const isAdd = mode === 'add';

  if(isAdd){
    document.getElementById('fSoSOffice').onchange = (e) => {
      row.sOffice = e.target.value;
      row.no = soGenerateNumber(row.sOffice);
      document.getElementById('fSoNo').value = row.no;
    };
    document.getElementById('soRefreshNo').onclick = () => {
      row.no = soGenerateNumber(document.getElementById('fSoSOffice').value);
      document.getElementById('fSoNo').value = row.no;
    };
  }

  document.getElementById('soCustomerSearch').onclick = () => openSoCustomerPicker(row);
  document.getElementById('soPrincipalSearch').onclick = () => openSoPrincipalPicker(row);

  /* ===== Syarat Bayar + Diskon Global 1 & 2 (fitur baru 2026-08-28) =====
     Semua reaktif: ganti Syarat Bayar -> cek promo Diskon Syarat Bayar
     (auto-isi Diskon Global); ubah nilai/unit diskon -> hitung ulang
     bertingkat + lepaskan tautan promo (dianggap koreksi manual). */
  document.getElementById('fSoSyaratBayar').onchange = (e) => {
    row.syaratBayar = e.target.value;
    soApplyPromoSyaratBayar(row);
    soRecalcTotals(row);
    soRefreshTotalsDOM(row);
  };
  const soDgManual = () => {
    row.diskonGlobal1 = +document.getElementById('fSoDg1').value || 0;
    row.diskonGlobal1Unit = document.getElementById('fSoDg1Unit').value;
    row.diskonGlobal2 = +document.getElementById('fSoDg2').value || 0;
    row.diskonGlobal2Unit = document.getElementById('fSoDg2Unit').value;
    row.diskonPromoKode = '';
    soRefreshDiskonGlobalDOM(row);
    soRecalcTotals(row);
    soRefreshTotalsDOM(row);
  };
  ['fSoDg1','fSoDg1Unit','fSoDg2','fSoDg2Unit'].forEach(id => {
    document.getElementById(id).onchange = soDgManual;
  });
  document.getElementById('soSqSearch').onclick = () => {
    // Sejak 2026-08-13: sumbernya DATA.salesQuotation sungguhan (modul
    // Sales Quotation), bukan lagi SO_SQ_DUMMY_LIST statis — lihat
    // catatan di sales-order.template.js.
    const sqList = DATA.salesQuotation.map(sq => ({ no: sq.no, tgl: sq.tglSQ, ket: `${sq.customer} — ${sq.keterangan}` }));
    openSoDecorativePicker('Pilih Sales Quotation', sqList, 'pick-sq', (v) => {
      row.noSQ = v;
      document.getElementById('fSoNoSQ').value = v;
    });
  };
  document.getElementById('soSpSearch').onclick = () => openSoDecorativePicker('Pilih Surat Pesanan', SO_SP_DUMMY_LIST, 'pick-sp', (v) => {
    row.noSP = v;
    document.getElementById('fSoNoSP').value = v;
  });
  document.getElementById('soDscSearch').onclick = () => openSoDecorativePicker('Pilih DSC', SO_DSC_DUMMY_LIST, 'pick-dsc', (v) => {
    row.noDSC = v;
    document.getElementById('fSoNoDSC').value = v;
  });
  document.getElementById('soUploadBtn').onclick = () => openSoInfo('Upload File', 'Fitur upload lampiran file Sales Order akan tersedia di sini.');

  wireSoItemEvents(row);
  document.getElementById('soAddItem').onclick = (e) => {
    e.preventDefault();
    row.items.push(soBuildEmptyItem());
    rerenderSoItemsTable(row);
  };

  document.getElementById('soBatalkan').onclick = (e) => { e.preventDefault(); renderSoList(); };

  document.getElementById('soSimpan').onclick = () => {
    const customer = document.getElementById('fSoCustomer').value.trim();
    if(!customer){ soValidationError('Customer wajib dipilih'); return; }
    const validItems = row.items.filter(it => it.kode && (+it.qty) > 0);
    if(!validItems.length){ soValidationError('Minimal 1 baris barang dengan Kode Barang dan Qty lebih dari 0'); return; }

    row.customer = customer;
    row.sOffice = document.getElementById('fSoSOffice').value;
    row.area = document.getElementById('fSoArea').value;
    row.layanan = document.getElementById('fSoLayanan').value;
    row.orderVia = document.getElementById('fSoOrderVia').value;
    row.alamat = document.getElementById('fSoAlamat').value;
    row.rayon = document.getElementById('fSoRayon').value;
    row.cito = document.getElementById('fSoCito').checked;
    row.spAsli = document.getElementById('fSoSpAsli').checked;
    row.skEd = document.getElementById('fSoSkEd').checked;
    row.konsinyasi = document.getElementById('fSoKonsinyasi').checked;
    row.keterangan = document.getElementById('fSoKeterangan').value;
    row.isGuarantee = document.getElementById('fSoIsGuarantee').checked;
    row.pecahFaktur = document.getElementById('fSoPecahFaktur').checked;
    row.ukuranBasis = document.querySelector('input[name="fSoUkuranBasis"]:checked').value;
    row.items = validItems;
    soRecalcTotals(row);

    if(isAdd){
      row.no = soGenerateNumber(row.sOffice);
      row.tglInput = row.tglSO + ' ' + new Date().toTimeString().slice(0,8);
      row.userInput = 'sidik';
      DATA.salesOrders.push(row);
    } else {
      row.tglEdit = row.tglSO + ' ' + new Date().toTimeString().slice(0,8);
      row.userEdit = 'sidik';
      DATA.salesOrders[idx] = row;
    }
    renderSoList();
  };
}

function rerenderSoItemsTable(row){
  document.getElementById('soItemsBody').innerHTML = row.items.map((it,idx)=>tplSoItemRow(it,idx,'')).join('');
  wireSoItemEvents(row);
  soRecalcTotals(row);
  soRefreshTotalsDOM(row);
}

function wireSoItemEvents(row){
  row.items.forEach((item, idx) => {
    const searchBtn = document.querySelector(`[data-so-item-search="${idx}"]`);
    const delBtn = document.querySelector(`[data-so-item-del="${idx}"]`);
    const namaEl = document.querySelector(`[data-so-nama="${idx}"]`);
    const qtyEl = document.querySelector(`[data-so-qty="${idx}"]`);
    const hna1El = document.querySelector(`[data-so-hna1="${idx}"]`);
    const potonganEl = document.querySelector(`[data-so-potongan="${idx}"]`);
    const typePpnEl = document.querySelector(`[data-so-typeppn="${idx}"]`);
    const biayaKirimEl = document.querySelector(`[data-so-biayakirim="${idx}"]`);
    const batchEl = document.querySelector(`[data-so-batch="${idx}"]`);
    const edEl = document.querySelector(`[data-so-ed="${idx}"]`);

    if(searchBtn) searchBtn.onclick = () => openSoItemPicker(idx, row);
    if(delBtn) delBtn.onclick = () => {
      if(row.items.length <= 1){ soValidationError('Minimal harus ada 1 baris barang'); return; }
      row.items.splice(idx, 1);
      rerenderSoItemsTable(row);
    };
    if(namaEl) namaEl.onchange = () => { item.nama = namaEl.value; };
    if(batchEl) batchEl.onchange = () => { item.noBatch = batchEl.value; };
    if(edEl) edEl.onchange = () => { item.tglKadaluarsa = edEl.value; };

    const recalcRow = () => {
      item.qty = qtyEl ? (+qtyEl.value || 0) : item.qty;
      item.hna1 = hna1El ? (+hna1El.value || 0) : item.hna1;
      item.potongan = potonganEl ? (+potonganEl.value || 0) : item.potongan;
      item.typePpn = typePpnEl ? typePpnEl.value : item.typePpn;
      item.biayaKirim = biayaKirimEl ? (+biayaKirimEl.value || 0) : item.biayaKirim;
      soRecalcItem(item);
      soRefreshItemRowDOM(idx, item);
      soRecalcTotals(row);
      soRefreshTotalsDOM(row);
    };
    [qtyEl, hna1El, potonganEl, typePpnEl, biayaKirimEl].forEach(el => {
      if(!el) return;
      const evt = (el.tagName === 'SELECT') ? 'onchange' : 'onchange';
      el[evt] = recalcRow;
      // Biaya Kirim tidak mempengaruhi DPP/PPN baris, tapi tetap perlu
      // memicu re-total dokumen segera (reaktif), makanya tetap masuk
      // ke recalcRow yang sama.
    });
  });
}

function soValidationError(text){
  openSoInfo('Validasi', text);
}

function openSoItemPicker(idx, row){
  // Popup "Daftar Persediaan" bersama (openPersediaanPicker, di js/core.js)
  // menggantikan tplSoItemPicker lama sejak 2026-08-12 lanjutan lagi —
  // filter otomatis ke Gudang Utama milik row.sOffice SO ini.
  openPersediaanPicker(row.sOffice, (persed) => {
    const it = DATA.items.find(x => x.kode === persed.kodeBarang);
    const target = row.items[idx];
    target.kode = persed.kodeBarang; target.nama = persed.namaBarang;
    target.hna1 = it ? it.harga : 0; target.um = persed.satuan;
    soRecalcItem(target);
    rerenderSoItemsTable(row);
  });
}

function openSoCustomerPicker(row){
  closeModal();
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.innerHTML = tplSoCustomerPicker(DATA.customers);
  document.body.appendChild(overlay);
  document.getElementById('modalClose').onclick = closeModal;
  document.getElementById('modalCancel').onclick = closeModal;
  overlay.onclick = (e) => { if(e.target === overlay) closeModal(); };
  overlay.querySelectorAll('[data-pick-customer]').forEach(btn => btn.onclick = () => {
    const c = DATA.customers.find(x => x.kode === btn.dataset.pickCustomer);
    row.customer = c.nama;
    row.wilayah = c.kota;
    row.alamat = c.alamat || '';
    document.getElementById('fSoCustomer').value = row.customer;
    document.getElementById('fSoAlamat').value = row.alamat;
    /* Syarat Bayar otomatis mengikuti TOP master customer (fitur baru
       2026-08-28) lalu langsung dicek ke promo Diskon Syarat Bayar. */
    if(c.top && DATA.syaratBayarList.indexOf(c.top) !== -1){
      row.syaratBayar = c.top;
      const sbEl = document.getElementById('fSoSyaratBayar');
      if(sbEl) sbEl.value = row.syaratBayar;
      soApplyPromoSyaratBayar(row);
      soRecalcTotals(row);
      soRefreshTotalsDOM(row);
    }
    soRecalcCustomerFinance(row, c);
    soRefreshCustomerFinanceDOM(row);
    closeModal();
  });
}

function openSoPrincipalPicker(row){
  closeModal();
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.innerHTML = tplSoPrincipalPicker(DATA.suppliers);
  document.body.appendChild(overlay);
  document.getElementById('modalClose').onclick = closeModal;
  document.getElementById('modalCancel').onclick = closeModal;
  overlay.onclick = (e) => { if(e.target === overlay) closeModal(); };
  overlay.querySelectorAll('[data-pick-principal]').forEach(btn => btn.onclick = () => {
    const s = DATA.suppliers.find(x => x.kode === btn.dataset.pickPrincipal);
    row.principalKode = s.kode;
    row.principalNama = s.nama;
    document.getElementById('fSoPrincipal').value = s.nama;
    closeModal();
  });
}

/* Picker dekoratif bersama untuk No. SQ/No. SP/No. DSC — lihat komentar
   tplSoDecorativePicker() di sales-order.template.js. `datasetKey`
   contoh 'pick-sq', dibaca balik via getAttribute (bukan .dataset)
   supaya tidak perlu peduli konversi camelCase per field. */
function openSoDecorativePicker(title, list, datasetKey, onPick){
  closeModal();
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.innerHTML = tplSoDecorativePicker(title, list, datasetKey);
  document.body.appendChild(overlay);
  document.getElementById('modalClose').onclick = closeModal;
  document.getElementById('modalCancel').onclick = closeModal;
  overlay.onclick = (e) => { if(e.target === overlay) closeModal(); };
  overlay.querySelectorAll(`[data-${datasetKey}]`).forEach(btn => btn.onclick = () => {
    onPick(btn.getAttribute(`data-${datasetKey}`));
    closeModal();
  });
}

function openSoDeleteConfirm(idx){
  closeModal();
  const row = DATA.salesOrders[idx];
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.innerHTML = tplSoDeleteConfirm(row);
  document.body.appendChild(overlay);
  document.getElementById('modalClose').onclick = closeModal;
  document.getElementById('modalCancel').onclick = closeModal;
  overlay.onclick = (e) => { if(e.target === overlay) closeModal(); };
  document.getElementById('modalDelete').onclick = () => {
    DATA.salesOrders.splice(idx, 1);
    closeModal();
    renderSoTable();
  };
}

function openSoInfo(title, text){
  closeModal();
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.innerHTML = tplSoInfoModal(title, text);
  document.body.appendChild(overlay);
  document.getElementById('modalClose').onclick = closeModal;
  document.getElementById('modalOk').onclick = closeModal;
  overlay.onclick = (e) => { if(e.target === overlay) closeModal(); };
}
