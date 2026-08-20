/* =========================================================
   LOGIC (JS saja) — Invoice (Customer & Penjualan > Daftar
   Transaksi > Invoice, page key 'invoices'). Dimuat otomatis
   (lazy-load) oleh core.js saat menu ini pertama kali diklik —
   lihat PAGE_MODULES di js/core.js. Markup HTML-nya ada di file
   sebelah: invoice.template.js (tplInvoiceListPage/tplInvRows/
   tplInvForm/dst, plus konstanta INV_CABANG_LIST/INV_GUDANG_BY_CABANG/
   INV_SYARAT_BAYAR_LIST/INV_SHIP_VIA_LIST & helper murni invFindSO()/
   invFindPL() yang dipakai bersama di sini).
   NB: closeModal() dipakai bersama, didefinisikan di core.js.

   RANTAI DATA (inti desain modul ini) — 2 picker di form, "No SO" dan
   "No PL", KEDUANYA bisa jadi titik masuk, dan keduanya bermuara ke
   1 fungsi bersama invApplyPickingList() supaya logic auto-fill
   (Customer/Cabang/Gudang/Area/tabel Produk/data Sales Order terkait)
   TIDAK diduplikasi — pola yang sama seperti openPoSrPicker() di
   Purchase Order yang mengisi banyak field dari 1 sumber:
   - openInvPlPicker(): pilih 1 baris DATA.pickingList -> panggil
     invApplyPickingList(row, plRow) langsung.
   - openInvSoPicker(): pilih 1 baris DATA.salesOrders -> isi
     noSO/noSP/noDSC/principal/spAsli/skEd/tglSP LANGSUNG dari SO itu,
     resolve Customer dari DATA.customers (mirror cara Sales Order
     sendiri resolve customer-nya), LALU cari DATA.pickingList yang
     noSO-nya cocok — kalau ketemu, panggil invApplyPickingList() juga
     (supaya No PL & tabel Produk ikut terisi); kalau tidak ketemu,
     No PL & tabel Produk dibiarkan kosong (SO itu belum di-Picking List,
     wajar terjadi di sample data ini).

   POSTING (aksi baru, BUKAN reversible seperti Checked/Terkirim di
   Picking List): begitu row.posted di-set true lewat
   openInvPostingConfirm(), TIDAK ADA cara membatalkannya lagi dari UI
   ini (tombol Ubah/Hapus/Posting baris itu langsung disabled+pudar,
   lihat tplInvRows() & class .icon-btn.disabled/gaya inline di
   css/style.css) — beda mendasar dari toggle Checked/Terkirim yang
   memang dirancang bisa bolak-balik.
========================================================= */

function renderInvoicePage(){
  renderInvList();
}

function renderInvList(){
  content.innerHTML = tplInvoiceListPage();
  document.getElementById('btnInvAdd').onclick = () => openInvForm('add');
  document.getElementById('btnInvPickingReq').onclick = () => openInvInfo('Picking Requested', 'Filter khusus Invoice yang menunggu proses Picking Request. Filter ini dekoratif pada mockup ini, akan tersedia pada versi lengkap.');
  document.getElementById('btnInvTsFilter').onclick = () => openInvInfo('Filter TS', 'Pencarian/filter berdasarkan Tahap Status (TS) Invoice. Filter ini dekoratif pada mockup ini, akan tersedia pada versi lengkap.');
  document.getElementById('invStatusFilter').onchange = () => openInvInfo('Filter Status', 'Menampilkan semua status Invoice. Filter per status akan tersedia pada versi lengkap.');
  document.getElementById('invPeriodFilter').onchange = () => openInvInfo('Filter Periode', 'Menampilkan Invoice untuk periode Agustus 2026. Pemilihan periode lain akan tersedia pada versi lengkap.');
  renderInvTable();
}

function renderInvTable(){
  const tbody = document.getElementById('invTbody');
  const total = document.getElementById('invTotal');
  tbody.innerHTML = tplInvRows(DATA.invoices);
  // NB: mengikuti konvensi seluruh modul CRUD lain di mockup ini (lihat
  // catatan yang sama di renderPklTable(), picking-list.js) — Total
  // Record SELALU dihitung dari panjang array data asli (8), BUKAN angka
  // dekoratif dari screenshot contoh (yang menampilkan "488").
  total.textContent = `Total Record: ${DATA.invoices.length}`;
  // 2026-08-19 (lanjutan lagi): tombol printer polos = cetak cepat
  // format Half Page langsung (default paling umum dipakai); tombol
  // chevron di sebelahnya (data-print-menu) tetap buka dropdown pilihan
  // (Half Page/Full Page/Surat Jalan) — lihat openInvPrintWindow() &
  // openInvCetakDropdown() di bawah, dan catatan desain besar di
  // tplInvPrintDoc() (invoice.template.js).
  tbody.querySelectorAll('[data-print]').forEach(b => b.onclick = () => openInvPrintWindow(+b.dataset.print, 'half'));
  tbody.querySelectorAll('[data-print-menu]').forEach(b => b.onclick = () => openInvCetakDropdown(+b.dataset.printMenu));
  tbody.querySelectorAll('[data-edit]').forEach(b => b.onclick = () => openInvForm('edit', +b.dataset.edit));
  tbody.querySelectorAll('[data-del]').forEach(b => b.onclick = () => openInvDeleteConfirm(+b.dataset.del));
  tbody.querySelectorAll('[data-posting]').forEach(b => b.onclick = () => openInvPostingConfirm(+b.dataset.posting));
}

/* No. IVC & No. SJ SELALU berbagi 1 nomor urut yang sama (beda prefix
   saja, "SI" = Sales Invoice / "SJ" = Surat Jalan) — sesuai model
   mockup ini: 1 Invoice selalu punya persis 1 Surat Jalan pengantar. */
function invGenerateNumbers(cabang){
  const kode = INV_CABANG_CODE[cabang] || 'XXX';
  const seq = DATA.invoices.filter(r => r.cabang === cabang).length + 1;
  const seqStr = String(seq).padStart(5,'0');
  return { no: `26/SI/${kode}/08/${seqStr}`, noSJ: `26/SJ/${kode}/08/${seqStr}` };
}

/* ===== Helper bersama "terapkan 1 Picking List" — dipanggil dari
   openInvPlPicker() (langsung) MAUPUN openInvSoPicker() (setelah
   ketemu Picking List yang noSO-nya cocok) ===== */
function invApplyPickingList(row, plRow){
  row.noPL = plRow.no;
  row.noSO = plRow.noSO;
  const so = invFindSO(plRow.noSO);
  if(so){
    row.noSP = so.noSP || '';
    row.noDSC = so.noDSC || '';
    row.principalKode = so.principalKode || '';
    row.principalNama = so.principalNama || '';
    row.spAsli = !!so.spAsli;
    row.skEd = !!so.skEd;
    row.tglSP = so.tglSO || ''; // Sales Order tidak punya field tanggal SP terpisah, tglSO dipakai ulang (didokumentasikan)
  } else {
    row.noSP = ''; row.noDSC = ''; row.principalKode = ''; row.principalNama = '';
    row.spAsli = false; row.skEd = false; row.tglSP = '';
  }
  row.customerKode = plRow.customerKode || '';
  row.customerNama = plRow.customerNama || '';
  row.customerAlamat = plRow.customerAlamat || '';
  row.alamatPengiriman = plRow.customerAlamat || '';
  row.cabang = plRow.cabang;
  row.gudang = plRow.gudang;
  row.area = plRow.area;
  row.items = (plRow.items || []).map(it => ({
    kode: it.kode, nama: it.nama, satuan: it.satuan,
    qtyPesan: it.qtyOrder || 0, qtyKirim: it.qtyPicking || 0,
    batch: (it.batches && it.batches[0]) ? it.batches[0].kode : '',
    ed: (it.batches && it.batches[0]) ? it.batches[0].tglExpired : '',
  }));
}

/* Jumlah (total Invoice) — dihitung ulang saat Simpan dari
   DATA.items[].harga x qtyKirim per baris (barang yang kode-nya tidak
   ketemu di DATA.items diabaikan/dianggap 0, seharusnya tidak terjadi
   karena tabel Produk selalu berasal dari barang yang sudah valid di
   Picking List sumbernya). Field ini TIDAK ditampilkan sebagai total
   reaktif di form (tidak ada di 2 screenshot form), hanya dipakai untuk
   kolom "@Rp." di list — beda dari Sales Order/Purchase Order yang
   memang menampilkan Total DPP/PPN/Jumlah Akhir reaktif di form-nya. */
function invRecalcJumlah(row){
  row.jumlah = (row.items || []).reduce((sum, it) => {
    const master = DATA.items.find(x => x.kode === it.kode);
    const harga = master ? (+master.harga || 0) : 0;
    return sum + harga * (+it.qtyKirim || 0);
  }, 0);
}

function invBuildEmptyRow(){
  const cabang0 = INV_CABANG_LIST[0];
  const gen = invGenerateNumbers(cabang0);
  return {
    no: gen.no, noSJ: gen.noSJ, tglBuat: '', tgl: '11/08/2026', cabang: cabang0,
    gudang: INV_GUDANG_BY_CABANG[cabang0], area: '',
    customerKode:'', customerNama:'', customerAlamat:'',
    noSO:'', noPL:'', noSP:'', noDSC:'', principalKode:'', principalNama:'', tglSP:'',
    spAsli:false, skEd:false, cito:false, citoTgl:'11/08/2026',
    syaratBayar: INV_SYARAT_BAYAR_LIST[0], layanan: DATA.layananList[0],
    alamatPengiriman:'', shipVia: INV_SHIP_VIA_LIST[0], noResi:'', driver:'',
    keterangan:'', items:[], jumlah:0, posted:false, ts:'Create Invoice',
    tglInput:'', userInput:'', tglEdit:'', userEdit:'',
    jurnalMode:'otomatis', jurnalAkun:[],
  };
}

/* ===== Rincian Jurnal Akun (tab kedua form) — lihat catatan desain
   lengkap di header tplInvJurnalContent() (invoice.template.js).
   invBuildJurnalOtomatis() SELALU dipanggil ulang oleh:
   (1) pertama kali form dibuka (openInvForm), (2) tombol "Buat Jurnal",
   (3) otomatis begitu tabel Produk berubah (qty kirim/pick SO-PL) SELAMA
   row.jurnalMode masih 'otomatis' — supaya baris jurnal "otomatis" itu
   selalu benar-benar reaktif terhadap Jumlah Invoice, bukan snapshot
   statis. Begitu user pindah ke mode 'manual', regenerasi otomatis ini
   berhenti (nilai jadi murni hasil edit manual) sampai user pindah balik
   ke 'otomatis' atau klik "Buat Jurnal" lagi. ===== */
function invBuildJurnalOtomatis(row){
  invRecalcJumlah(row);
  const ket = row.customerNama || '';
  row.jurnalAkun = [
    { kodeAkun:'1130001', namaAkun: invAkunNama('1130001'), keterangan: ket, debit: 0, kredit: row.jumlah },
    { kodeAkun:'1130002', namaAkun: invAkunNama('1130002'), keterangan: ket, debit: row.jumlah, kredit: 0 },
  ];
}

/* Render ulang SELURUH konten tab Jurnal (tabel + radio + ringkasan) —
   dipakai tiap kali struktur baris berubah (ganti mode, Buat Jurnal,
   tambah/hapus baris) supaya atribut readonly/editable & jumlah baris
   selalu konsisten dengan state row.jurnalMode/row.jurnalAkun terkini. */
function refreshInvJurnalContent(row){
  const el = document.getElementById('invTabJurnalContent');
  if(!el) return;
  el.innerHTML = tplInvJurnalContent(row);
  wireInvJurnalEvents(row);
}

/* Update ringan hanya pada field "Jumlah Debit - Kredit" — dipakai
   setelah edit Keterangan/Debit/Kredit per baris (mode Manual) supaya
   tidak perlu me-rebuild seluruh tabel & kehilangan fokus input yang
   sedang diketik user. */
function refreshInvJurnalSelisih(row){
  const el = document.getElementById('invJurnalSelisih');
  if(!el) return;
  const totals = invJurnalTotals(row);
  el.value = invNum2(totals.selisih);
  el.style.color = Math.abs(totals.selisih) > 0.004 ? 'var(--red)' : 'var(--text)';
}

function wireInvJurnalEvents(row){
  const btnOto = document.getElementById('invJurnalOtomatis');
  const btnManual = document.getElementById('invJurnalManual');
  if(btnOto) btnOto.onchange = () => {
    row.jurnalMode = 'otomatis';
    invBuildJurnalOtomatis(row);
    refreshInvJurnalContent(row);
  };
  if(btnManual) btnManual.onchange = () => {
    row.jurnalMode = 'manual';
    refreshInvJurnalContent(row);
  };

  const btnBuat = document.getElementById('invBuatJurnal');
  if(btnBuat) btnBuat.onclick = () => {
    invBuildJurnalOtomatis(row);
    refreshInvJurnalContent(row);
  };

  const addRow = document.getElementById('invJurnalAddRow');
  if(addRow) addRow.onclick = (e) => {
    e.preventDefault();
    row.jurnalAkun.push({ kodeAkun:'', namaAkun:'', keterangan: row.customerNama||'', debit:0, kredit:0 });
    refreshInvJurnalContent(row);
  };

  (row.jurnalAkun||[]).forEach((entry, idx) => {
    const ket = document.querySelector(`[data-jurnal-ket="${idx}"]`);
    if(ket) ket.onchange = () => { entry.keterangan = ket.value; };
    const deb = document.querySelector(`[data-jurnal-debit="${idx}"]`);
    if(deb) deb.onchange = () => { entry.debit = +deb.value || 0; refreshInvJurnalSelisih(row); };
    const kre = document.querySelector(`[data-jurnal-kredit="${idx}"]`);
    if(kre) kre.onchange = () => { entry.kredit = +kre.value || 0; refreshInvJurnalSelisih(row); };
    const del = document.querySelector(`[data-jurnal-del="${idx}"]`);
    if(del) del.onclick = () => { row.jurnalAkun.splice(idx,1); refreshInvJurnalContent(row); };
    const search = document.querySelector(`[data-jurnal-akun-search="${idx}"]`);
    if(search) search.onclick = () => openInvAkunPicker(idx, row);
  });
}

/* Picker Akun GL khusus tabel Jurnal (mode Manual) — lihat catatan
   di tplInvAkunPicker() (invoice.template.js) soal kenapa ini salinan
   lokal, bukan reuse fungsi Jurnal Pembelian. */
function openInvAkunPicker(idx, row){
  closeModal();
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.innerHTML = tplInvAkunPicker(DATA.akunGL);
  document.body.appendChild(overlay);
  document.getElementById('modalClose').onclick = closeModal;
  document.getElementById('modalCancel').onclick = closeModal;
  overlay.onclick = (e) => { if(e.target === overlay) closeModal(); };

  const wireRows = () => {
    overlay.querySelectorAll('[data-pick-akun]').forEach(btn => btn.onclick = () => {
      const kode = btn.dataset.pickAkun;
      row.jurnalAkun[idx].kodeAkun = kode;
      row.jurnalAkun[idx].namaAkun = invAkunNama(kode);
      document.getElementById(`invJurnalBody`).querySelector(`[data-jurnal-kode="${idx}"]`).value = kode;
      document.getElementById(`invJurnalBody`).querySelector(`[data-jurnal-nama="${idx}"]`).value = invAkunNama(kode);
      closeModal();
    });
  };
  wireRows();

  document.getElementById('invAkunPickerSearch').oninput = (e) => {
    const q = e.target.value.trim().toLowerCase();
    const filtered = DATA.akunGL.filter(a => a.kode.toLowerCase().includes(q) || a.nama.toLowerCase().includes(q));
    document.getElementById('invAkunPickerBody').innerHTML = tplInvAkunPickerRows(filtered);
    wireRows();
  };
}

function openInvForm(mode, idx){
  let row;
  const isAdd = mode === 'add';
  if(isAdd){
    row = invBuildEmptyRow();
  } else {
    const src = DATA.invoices[idx];
    row = { ...src, items: src.items.map(it => ({ ...it })) };
  }

  // NB: 8 baris sample DATA.invoices yang sudah ada sejak sebelum tab
  // Rincian Jurnal Akun ini dibangun belum punya jurnalMode/jurnalAkun
  // — default ke 'otomatis' + auto-generate 2 baris standar begitu form
  // dibuka, supaya tab Jurnal langsung terisi tanpa user harus klik
  // "Buat Jurnal" dulu (lihat invBuildJurnalOtomatis()).
  row.jurnalMode = row.jurnalMode || 'otomatis';
  row.jurnalAkun = row.jurnalAkun ? row.jurnalAkun.map(j => ({ ...j })) : [];
  if(!row.jurnalAkun.length && row.jurnalMode === 'otomatis') invBuildJurnalOtomatis(row);

  content.innerHTML = tplInvForm(mode, row);

  if(isAdd){
    document.getElementById('fInvCabang').onchange = (e) => {
      row.cabang = e.target.value;
      row.gudang = INV_GUDANG_BY_CABANG[row.cabang] || INV_GUDANG_LIST[0];
      const gen = invGenerateNumbers(row.cabang);
      row.no = gen.no; row.noSJ = gen.noSJ;
      document.getElementById('fInvGudang').value = row.gudang;
      document.getElementById('fInvNoIVC').value = row.no;
      document.getElementById('fInvNoSJ').value = row.noSJ;
    };
    document.getElementById('invRefreshNo').onclick = () => {
      const gen = invGenerateNumbers(document.getElementById('fInvCabang').value);
      row.no = gen.no; row.noSJ = gen.noSJ;
      document.getElementById('fInvNoIVC').value = row.no;
      document.getElementById('fInvNoSJ').value = row.noSJ;
    };
  }

  document.getElementById('invSoSearch').onclick = () => openInvSoPicker(row);
  document.getElementById('invPlSearch').onclick = () => openInvPlPicker(row);
  document.getElementById('invDriverSearch').onclick = () => openInvDriverPicker(row);

  wireInvTabs();
  wireInvItemEvents(row);
  wireInvJurnalEvents(row);

  document.getElementById('invBatalkan').onclick = (e) => { e.preventDefault(); renderInvList(); };
  // 2026-08-19 (lanjutan lagi): tombol "Cetak" di dalam form (hanya
  // tampil mode Ubah, lihat tplInvForm()) membuka dropdown pilihan
  // Half Page/Full Page yang sama seperti di LIST — mencetak dari
  // `row` yang sedang diedit di layar ini (lihat openInvCetakDropdownFromForm()).
  const cetakBtn = document.getElementById('invCetak');
  if(cetakBtn) cetakBtn.onclick = () => openInvCetakDropdownFromForm(idx, row);

  document.getElementById('invSimpan').onclick = () => {
    if(!row.noSO && !row.noPL){ invValidationError('No SO atau No PL wajib dipilih terlebih dahulu'); return; }

    row.gudang = document.getElementById('fInvGudang').value;
    row.syaratBayar = document.getElementById('fInvSyaratBayar').value;
    row.layanan = document.getElementById('fInvLayanan').value;
    row.alamatPengiriman = document.getElementById('fInvAlamatKirim').value;
    row.shipVia = document.getElementById('fInvShipVia').value;
    row.noResi = document.getElementById('fInvNoResi').value;
    row.spAsli = document.getElementById('fInvSpAsli').checked;
    row.skEd = document.getElementById('fInvSkEd').checked;
    row.cito = document.getElementById('fInvCito').checked;
    row.keterangan = document.getElementById('fInvKeterangan').value;
    if(isAdd) row.cabang = document.getElementById('fInvCabang').value;

    invRecalcJumlah(row);

    if(isAdd){
      const gen = invGenerateNumbers(row.cabang);
      row.no = gen.no; row.noSJ = gen.noSJ;
      row.tglBuat = row.tgl + ' ' + new Date().toTimeString().slice(0,5);
      row.tglInput = row.tglBuat;
      row.userInput = 'sidik';
      DATA.invoices.push(row);
    } else {
      row.tglEdit = row.tgl + ' ' + new Date().toTimeString().slice(0,5);
      row.userEdit = 'sidik';
      DATA.invoices[idx] = row;
    }
    renderInvList();
  };
}

/* ===== Tab switcher "Detail Transaksi" / "Rincian Jurnal Akun" — pola
   UI baru di mockup ini (belum ada modul lain yang butuh tab), dibuat
   minimal: 2 tombol toggle class .active + toggle visibility 2 div
   konten, tanpa animasi. ===== */
function wireInvTabs(){
  const btnDetail = document.getElementById('invTabDetailBtn');
  const btnJurnal = document.getElementById('invTabJurnalBtn');
  const contentDetail = document.getElementById('invTabDetailContent');
  const contentJurnal = document.getElementById('invTabJurnalContent');
  btnDetail.onclick = () => {
    btnDetail.classList.add('active'); btnJurnal.classList.remove('active');
    contentDetail.style.display = ''; contentJurnal.style.display = 'none';
  };
  btnJurnal.onclick = () => {
    btnJurnal.classList.add('active'); btnDetail.classList.remove('active');
    contentJurnal.style.display = ''; contentDetail.style.display = 'none';
  };
}

/* ===== Tabel Produk: hanya Qty Kirim yang reaktif (tidak ada
   tambah/hapus baris, tidak ada kalkulasi total ditampilkan di form —
   lihat catatan invRecalcJumlah()). Sejak tab Rincian Jurnal Akun
   dibangun (2026-08-19): kalau row.jurnalMode masih 'otomatis', ganti
   Qty Kirim ikut memicu regenerasi jurnal otomatis supaya baris jurnal
   tetap sinkron dengan Jumlah Invoice terkini (lihat catatan
   invBuildJurnalOtomatis()). ===== */
function wireInvItemEvents(row){
  row.items.forEach((item, idx) => {
    const qtyKirimEl = document.querySelector(`[data-inv-qtykirim="${idx}"]`);
    if(qtyKirimEl) qtyKirimEl.onchange = () => {
      item.qtyKirim = +qtyKirimEl.value || 0;
      if(row.jurnalMode === 'otomatis'){ invBuildJurnalOtomatis(row); refreshInvJurnalContent(row); }
    };
  });
}

function rerenderInvItemsTable(row){
  document.getElementById('invItemsBody').innerHTML = row.items.map((it,idx) => tplInvItemRow(it,idx)).join('');
  wireInvItemEvents(row);
  const hint = document.getElementById('invItemsEmptyHint');
  if(hint) hint.style.display = row.items.length ? 'none' : '';
  if(row.jurnalMode === 'otomatis'){ invBuildJurnalOtomatis(row); refreshInvJurnalContent(row); }
}

function invValidationError(text){
  openInvInfo('Validasi', text);
}

/* Picker "No PL" — sumber utama pengisian rantai data (lihat komentar
   header file ini & invApplyPickingList()). */
function openInvPlPicker(row){
  closeModal();
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.innerHTML = tplInvPlPicker(DATA.pickingList);
  document.body.appendChild(overlay);
  document.getElementById('modalClose').onclick = closeModal;
  document.getElementById('modalCancel').onclick = closeModal;
  overlay.onclick = (e) => { if(e.target === overlay) closeModal(); };
  overlay.querySelectorAll('[data-pick-pl]').forEach(btn => btn.onclick = () => {
    const plRow = invFindPL(btn.dataset.pickPl);
    if(!plRow) return;
    invApplyPickingList(row, plRow);
    invSyncFormAfterPick(row);
    closeModal();
  });
}

/* Picker "No SO" — kalau Sales Order yang dipilih SUDAH punya Picking
   List terkait (dicari lewat noSO), reuse invApplyPickingList() supaya
   No PL & tabel Produk ikut terisi otomatis; kalau belum ada Picking
   List sama sekali untuk SO itu, No PL & tabel Produk dibiarkan kosong
   (skenario valid — belum semua SO sudah di-Picking List di sample
   data ini). */
function openInvSoPicker(row){
  closeModal();
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.innerHTML = tplInvSoPicker(DATA.salesOrders);
  document.body.appendChild(overlay);
  document.getElementById('modalClose').onclick = closeModal;
  document.getElementById('modalCancel').onclick = closeModal;
  overlay.onclick = (e) => { if(e.target === overlay) closeModal(); };
  overlay.querySelectorAll('[data-pick-so]').forEach(btn => btn.onclick = () => {
    const so = invFindSO(btn.dataset.pickSo);
    if(!so) return;

    row.noSO = so.no;
    row.noSP = so.noSP || '';
    row.noDSC = so.noDSC || '';
    row.principalKode = so.principalKode || '';
    row.principalNama = so.principalNama || '';
    row.spAsli = !!so.spAsli;
    row.skEd = !!so.skEd;
    row.tglSP = so.tglSO || '';

    const cust = DATA.customers.find(c => c.nama === so.customer);
    if(cust){
      row.customerKode = cust.kode; row.customerNama = cust.nama; row.customerAlamat = cust.alamat || '';
    } else {
      row.customerKode = ''; row.customerNama = so.customer || ''; row.customerAlamat = '';
    }
    row.alamatPengiriman = row.customerAlamat;

    const plRow = DATA.pickingList.find(p => p.noSO === so.no);
    if(plRow){
      invApplyPickingList(row, plRow);
    } else {
      row.noPL = '';
      row.items = [];
    }

    invSyncFormAfterPick(row);
    closeModal();
  });
}

/* Sinkronkan seluruh input form yang bisa berubah gara-gara picker
   No SO / No PL (dipanggil dari kedua handler supaya tidak duplikasi
   baris DOM-update ini).
   NB: kalau Cabang ikut berubah (mode Tambah, field Cabang belum
   disabled) DAN cabang hasil pick beda dari yang sedang tampil, No.
   IVC/No. SJ ikut di-generate ULANG supaya kode cabang di nomor
   dokumen selalu konsisten dengan Cabang yang benar-benar terpakai —
   kalau tidak, nomor bisa "nyasar" pakai kode cabang default (mis.
   26/SI/HO/... padahal Cabang sudah pindah ke Tangerang). */
function invSyncFormAfterPick(row){
  document.getElementById('fInvNoSO').value = row.noSO || '';
  document.getElementById('fInvNoPL').value = row.noPL || '';
  document.getElementById('fInvPrincipal').value = row.principalNama || '';
  document.getElementById('fInvNoDSC').value = row.noDSC || '';
  document.getElementById('fInvNoSP').value = row.noSP || '';
  document.getElementById('fInvTglSP').value = row.tglSP || '';
  document.getElementById('fInvSpAsli').checked = !!row.spAsli;
  document.getElementById('fInvSkEd').checked = !!row.skEd;
  document.getElementById('fInvCustomerNama').value = row.customerNama || '';
  document.getElementById('fInvAlamatKirim').value = row.alamatPengiriman || '';
  const gudangEl = document.getElementById('fInvGudang');
  if(gudangEl) gudangEl.value = row.gudang || INV_GUDANG_LIST[0];
  const cabangEl = document.getElementById('fInvCabang');
  if(cabangEl && !cabangEl.disabled && row.cabang && cabangEl.value !== row.cabang){
    cabangEl.value = row.cabang;
    const gen = invGenerateNumbers(row.cabang);
    row.no = gen.no; row.noSJ = gen.noSJ;
    document.getElementById('fInvNoIVC').value = row.no;
    document.getElementById('fInvNoSJ').value = row.noSJ;
  }
  rerenderInvItemsTable(row);
}

function openInvDriverPicker(row){
  closeModal();
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.innerHTML = tplInvDriverPicker(DATA.driverList);
  document.body.appendChild(overlay);
  document.getElementById('modalClose').onclick = closeModal;
  document.getElementById('modalCancel').onclick = closeModal;
  overlay.onclick = (e) => { if(e.target === overlay) closeModal(); };
  overlay.querySelectorAll('[data-pick-driver]').forEach(btn => btn.onclick = () => {
    row.driver = btn.dataset.pickDriver;
    document.getElementById('fInvDriver').value = row.driver;
    closeModal();
  });
}

/* Dipicu tombol chevron "Pilihan Cetak" di LIST — dicetak langsung dari
   baris persisten DATA.invoices[idx] (bukan copy form), lihat
   openInvCetakDropdownFromForm() untuk versi yang dipicu dari dalam
   form Ubah. */
function openInvCetakDropdown(idx){
  closeModal();
  const row = DATA.invoices[idx];
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.innerHTML = tplInvCetakDropdown(row);
  document.body.appendChild(overlay);
  document.getElementById('modalClose').onclick = closeModal;
  document.getElementById('modalCancel').onclick = closeModal;
  overlay.onclick = (e) => { if(e.target === overlay) closeModal(); };
  document.getElementById('invCetakHalf').onclick = () => openInvPrintWindow(idx, 'half');
  document.getElementById('invCetakFull').onclick = () => openInvPrintWindow(idx, 'full');
  document.getElementById('invCetakSJ').onclick = () => openInvInfo('Cetak Surat Jalan', `Preview PDF Surat Jalan <b>${row.noSJ}</b> akan tersedia di sini.`);
}

/* Dipicu tombol "Cetak" di DALAM form Ubah — sama seperti
   openInvCetakDropdown() tapi mencetak dari `row` yang sedang diedit di
   layar (shallow-copy, lihat openInvForm()) supaya perubahan yang belum
   di-Simpan tetap ikut tercetak (mis. Qty Kirim/pick SO-PL/Driver yang
   memang live-bind ke `row`), sementara counter "Cetakan ke-N" tetap
   ditambah ke baris PERSISTEN DATA.invoices[idx] (lihat parameter
   liveRow di openInvPrintWindow()) supaya konsisten dipakai ulang lain
   kali baris itu dicetak dari mana pun. */
function openInvCetakDropdownFromForm(idx, row){
  closeModal();
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.innerHTML = tplInvCetakDropdown(row);
  document.body.appendChild(overlay);
  document.getElementById('modalClose').onclick = closeModal;
  document.getElementById('modalCancel').onclick = closeModal;
  overlay.onclick = (e) => { if(e.target === overlay) closeModal(); };
  document.getElementById('invCetakHalf').onclick = () => openInvPrintWindow(idx, 'half', row);
  document.getElementById('invCetakFull').onclick = () => openInvPrintWindow(idx, 'full', row);
  document.getElementById('invCetakSJ').onclick = () => openInvInfo('Cetak Surat Jalan', `Preview PDF Surat Jalan <b>${row.noSJ}</b> akan tersedia di sini.`);
}

/* ===== Cetak Invoice — Half Page / Full Page (2026-08-19, lanjutan
   lagi). Lihat catatan desain LENGKAP di header tplInvPrintDoc()
   (invoice.template.js) untuk penjelasan setiap penyesuaian dari 2 PDF
   acuan yang dikirim user. Membuka tab baru (window.open + document.write)
   berisi dokumen cetak yang berdiri sendiri — fitur cetak PERTAMA di
   seluruh mockup ini yang benar-benar merender dokumen, bukan modal info
   dekoratif ("Preview PDF akan tersedia di sini").

   cetakanKe SELALU ditambah ke DATA.invoices[idx] (baris PERSISTEN),
   TIDAK PERNAH ke `liveRow` (copy form) saja — supaya counter konsisten
   walau baris yang sama dicetak berulang kali dari LIST maupun dari
   FORM, pola persis cetakanKe di Purchase Order (openPoCetak()). */
function openInvPrintWindow(idx, mode, liveRow){
  closeModal();
  const persisted = DATA.invoices[idx];
  if(!persisted) return;
  persisted.cetakanKe = (persisted.cetakanKe || 0) + 1;
  if(liveRow) liveRow.cetakanKe = persisted.cetakanKe;
  const row = liveRow || persisted;
  const w = window.open('', '_blank');
  if(!w){
    openInvInfo('Cetak Invoice', 'Pop-up diblokir browser. Izinkan pop-up untuk halaman ini agar bisa membuka preview cetak Invoice.');
    return;
  }
  w.document.open();
  w.document.write(tplInvPrintDoc(row, mode));
  w.document.close();
}

function openInvDeleteConfirm(idx){
  closeModal();
  const row = DATA.invoices[idx];
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.innerHTML = tplInvDeleteConfirm(row);
  document.body.appendChild(overlay);
  document.getElementById('modalClose').onclick = closeModal;
  document.getElementById('modalCancel').onclick = closeModal;
  overlay.onclick = (e) => { if(e.target === overlay) closeModal(); };
  document.getElementById('modalDelete').onclick = () => {
    DATA.invoices.splice(idx, 1);
    closeModal();
    renderInvTable();
  };
}

/* Posting — TRANSISI SATU ARAH, lihat catatan lengkap di header file
   ini & tplInvPostingConfirm(). Begitu dikonfirmasi, row.posted=true &
   row.ts berubah 'Create Invoice' -> 'Invoice Selesai', lalu tabel
   di-render ulang supaya tombol Ubah/Hapus/Posting baris itu langsung
   tampil disabled (lihat tplInvRows()). */
function openInvPostingConfirm(idx){
  closeModal();
  const row = DATA.invoices[idx];
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.innerHTML = tplInvPostingConfirm(row);
  document.body.appendChild(overlay);
  document.getElementById('modalClose').onclick = closeModal;
  document.getElementById('modalCancel').onclick = closeModal;
  overlay.onclick = (e) => { if(e.target === overlay) closeModal(); };
  document.getElementById('modalConfirm').onclick = () => {
    row.posted = true;
    row.ts = 'Invoice Selesai';
    row.tglEdit = new Date().toLocaleDateString('id-ID') + ' ' + new Date().toTimeString().slice(0,5);
    row.userEdit = 'sidik';
    closeModal();
    renderInvTable();
  };
}

function openInvInfo(title, text){
  closeModal();
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.innerHTML = tplInvInfoModal(title, text);
  document.body.appendChild(overlay);
  document.getElementById('modalClose').onclick = closeModal;
  document.getElementById('modalOk').onclick = closeModal;
  overlay.onclick = (e) => { if(e.target === overlay) closeModal(); };
}
