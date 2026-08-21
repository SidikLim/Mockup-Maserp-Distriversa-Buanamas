/* =========================================================
   LOGIC (JS saja) — Pelunasan Utang (Supplier & Pembelian > Daftar
   Transaksi > Pelunasan Utang). Dimuat otomatis (lazy-load) oleh
   core.js saat menu ini pertama kali diklik — lihat PAGE_MODULES di
   js/core.js. Markup HTML-nya ada di file sebelah:
   pelunasan-utang.template.js (tplPelunasanUtangListPage/tplPuRows/
   tplPuForm/dst, plus konstanta PU_CABANG_LIST/PU_TIPE_TRANSAKSI_LIST
   & catatan desain lengkap di headernya — termasuk kenapa tab Jurnal
   di modul ini memakai pola LENGKAP Otomatis/Manual milik Invoice,
   bukan pola sederhana milik Penerimaan Piutang).

   Alur inti (BENAR-BENAR reaktif, bukan dekoratif — kebalikan/mirror
   dari Penerimaan Piutang, lihat penerimaan-piutang.js utk pola AR yg
   jadi acuan di sini):
   1) Pilih Supplier (openPuSupplierPicker) -> row.fakturs diisi ulang
      dari puOutstandingInvoicesForSupplier(nama) — Faktur Pembelian
      (DATA.pembelianBPB) milik Supplier itu yang masih ada sisa
      (jumlahTotal - pembayaran > 0). Semua baris hasil default
      checked:true & Pembayaran = Reminder penuh.
   2) Centang/nilai Pembayaran diubah -> puRecalcTotals() menghitung
      ulang Jumlah Keluar Kas/Setelah Konversi Kurs/Total Utang
      Dibayar, ditampilkan reaktif.
   3) Simpan (puSave) -> baris baru di-push/replace ke
      DATA.pelunasanUtang DAN `pembayaran` tiap Faktur Pembelian yang
      dicentang (row.fakturs[].fakturNo) BENAR-BENAR ditambah sebesar
      Pembayaran-nya di DATA.pembelianBPB — supaya lain kali modul ini
      dibuka, faktur yang sudah lunas tidak muncul lagi di tab Lunasi
      Beberapa Faktur untuk supplier itu.
   4) Hapus (openPuDeleteConfirm) -> kebalikannya: `pembayaran` yang
      tadi ditambahkan DIKEMBALIKAN ke Faktur Pembelian terkait sebelum
      baris Pelunasan Utang itu sendiri di-splice, supaya pembukuan AP
      tetap konsisten.
========================================================= */

function renderPelunasanUtangPage(){
  renderPuList();
}

function renderPuList(){
  content.innerHTML = tplPelunasanUtangListPage();
  document.getElementById('btnPuAdd').onclick = () => openPuForm('add');
  renderPuTable();
}

function renderPuTable(){
  const tbody = document.getElementById('puTbody');
  const total = document.getElementById('puTotal');
  tbody.innerHTML = tplPuRows(DATA.pelunasanUtang);
  total.textContent = `Total Record: ${DATA.pelunasanUtang.length}`;
  tbody.querySelectorAll('[data-view]').forEach(b => b.onclick = () => openPuForm('view', +b.dataset.view));
  tbody.querySelectorAll('[data-view-menu]').forEach(b => b.onclick = () => openPuForm('view', +b.dataset.viewMenu));
  tbody.querySelectorAll('[data-print]').forEach(b => b.onclick = () => {
    const r = DATA.pelunasanUtang[+b.dataset.print];
    openPuInfo('Cetak Pelunasan Utang', `Preview PDF Pelunasan Utang <b>${r.no}</b> akan tersedia di sini.`);
  });
  tbody.querySelectorAll('[data-print-menu]').forEach(b => b.onclick = () => {
    const r = DATA.pelunasanUtang[+b.dataset.printMenu];
    openPuInfo('Cetak Pelunasan Utang', `Preview PDF Pelunasan Utang <b>${r.no}</b> akan tersedia di sini.`);
  });
  tbody.querySelectorAll('[data-edit]').forEach(b => b.onclick = () => openPuForm('edit', +b.dataset.edit));
  tbody.querySelectorAll('[data-del]').forEach(b => b.onclick = () => openPuDeleteConfirm(+b.dataset.del));
}

/* ===== Helper murni (no DOM) ===== */
function puGenerateNo(cabang){
  const kode = PU_CABANG_CODE[cabang] || 'XXX';
  const seq = DATA.pelunasanUtang.filter(r => r.cabang === cabang).length + 1;
  return `26/CL/${kode}/08/${String(seq).padStart(5,'0')}`;
}

function puFindKasBank(kode){
  return DATA.kasBank.find(b => b.kode === kode);
}

function puParseNum(str){
  if(typeof str === 'number') return str;
  const cleaned = String(str||'0').replace(/\./g,'').replace(',', '.');
  const n = parseFloat(cleaned);
  return Number.isFinite(n) ? n : 0;
}

/* Faktur Pembelian (DATA.pembelianBPB) yang BOLEH dilunasi via modul
   ini: milik Supplier yang dipilih (cocok berdasarkan NAMA, lihat
   catatan data model di header pelunasan-utang.template.js) DAN masih
   ada sisa (jumlahTotal - pembayaran > 0). */
function puOutstandingInvoicesForSupplier(supplierNama){
  return DATA.pembelianBPB.filter(p => p.supplier === supplierNama && (p.jumlahTotal - (p.pembayaran||0)) > 0.004);
}

function puBuildFakturRow(p){
  const sisa = Math.round((p.jumlahTotal - (p.pembayaran||0)) * 100) / 100;
  return {
    no: p.no, supplierNoFaktur: p.supplierNoFaktur||'', tipeTransaksi: 'Beli Kredit',
    tglFaktur: p.tglFaktur, tglJthTempo: p.tglJatuhTempo,
    mataUang: p.mataUang||'IDR', kurs: p.kurs!=null?p.kurs:1,
    reminder: sisa, pembayaran: sisa, checked: true,
    fakturNo: p.no,
  };
}

function puAkunNamaFallback(kode, fallback){
  const a = DATA.akunGL.find(x => x.kode === kode);
  return a ? a.nama : (fallback || '');
}

function puRecalcTotals(row){
  const fakturs = row.fakturs || [];
  const checked = fakturs.filter(f => f.checked);
  const jumlahKeluarKas = Math.round(checked.reduce((s,f) => s + (+f.pembayaran||0), 0) * 100) / 100;
  const kursTarget = row.kursTarget != null ? (+row.kursTarget||1) : 1;
  const setelahKonversi = Math.round(jumlahKeluarKas * kursTarget * 100) / 100;
  const jumlahUtang = jumlahKeluarKas; // tidak ada potongan pajak di modul ini (lihat catatan header template)
  return { jumlahKeluarKas, setelahKonversi, jumlahUtang };
}

/* ===== Rincian Jurnal Akun (tab kedua form) — pola LENGKAP Otomatis/
   Manual disalin dari invBuildJurnalOtomatis()/wireInvJurnalEvents()
   (invoice.js), lihat catatan desain lengkap di header
   pelunasan-utang.template.js. puBuildJurnalOtomatis() SELALU dipanggil
   ulang oleh: (1) pertama kali form dibuka, (2) tombol "Buat Jurnal",
   (3) otomatis begitu tabel Faktur/Akun Bank berubah SELAMA
   row.jurnalMode masih 'otomatis'. ===== */
function puBuildJurnalOtomatis(row){
  const totals = puRecalcTotals(row);
  const bank = puFindKasBank(row.akunBankKode);
  const namaBank = bank ? (bank.kode + ' - ' + bank.nama) : '(pilih Akun Bank)';
  const ket = row.supplierNama || '';
  row.jurnalAkun = [
    { kodeAkun:'2110001', namaAkun: puAkunNamaFallback('2110001','Hutang Usaha'), keterangan: ket, debit: totals.jumlahUtang, kredit: 0 },
    { kodeAkun: bank?bank.kode:'', namaAkun: namaBank, keterangan: ket, debit: 0, kredit: totals.jumlahKeluarKas },
  ];
}

function refreshPuJurnalContent(row){
  const el = document.getElementById('puTabJurnalContent');
  if(!el) return;
  el.innerHTML = tplPuJurnalContent(row);
  wirePuJurnalEvents(row);
}

function refreshPuJurnalSelisih(row){
  const el = document.getElementById('puJurnalSelisih');
  if(!el) return;
  const totals = puJurnalTotals(row);
  el.value = puNum2(totals.selisih);
  el.style.color = Math.abs(totals.selisih) > 0.004 ? 'var(--red)' : 'var(--text)';
}

function wirePuJurnalEvents(row){
  const btnOto = document.getElementById('puJurnalOtomatis');
  const btnManual = document.getElementById('puJurnalManual');
  if(btnOto) btnOto.onchange = () => {
    row.jurnalMode = 'otomatis';
    puBuildJurnalOtomatis(row);
    refreshPuJurnalContent(row);
  };
  if(btnManual) btnManual.onchange = () => {
    row.jurnalMode = 'manual';
    refreshPuJurnalContent(row);
  };

  const btnBuat = document.getElementById('puBuatJurnal');
  if(btnBuat) btnBuat.onclick = () => {
    puBuildJurnalOtomatis(row);
    refreshPuJurnalContent(row);
  };

  const addRow = document.getElementById('puJurnalAddRow');
  if(addRow) addRow.onclick = (e) => {
    e.preventDefault();
    row.jurnalAkun.push({ kodeAkun:'', namaAkun:'', keterangan: row.supplierNama||'', debit:0, kredit:0 });
    refreshPuJurnalContent(row);
  };

  (row.jurnalAkun||[]).forEach((entry, idx) => {
    const ket = document.querySelector(`[data-pu-jurnal-ket="${idx}"]`);
    if(ket) ket.onchange = () => { entry.keterangan = ket.value; };
    const deb = document.querySelector(`[data-pu-jurnal-debit="${idx}"]`);
    if(deb) deb.onchange = () => { entry.debit = +deb.value || 0; refreshPuJurnalSelisih(row); };
    const kre = document.querySelector(`[data-pu-jurnal-kredit="${idx}"]`);
    if(kre) kre.onchange = () => { entry.kredit = +kre.value || 0; refreshPuJurnalSelisih(row); };
    const del = document.querySelector(`[data-pu-jurnal-del="${idx}"]`);
    if(del) del.onclick = () => { row.jurnalAkun.splice(idx,1); refreshPuJurnalContent(row); };
    const search = document.querySelector(`[data-pu-jurnal-akun-search="${idx}"]`);
    if(search) search.onclick = () => openPuAkunPicker(idx, row);
  });
}

function openPuAkunPicker(idx, row){
  closeModal();
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.innerHTML = tplPuAkunPicker(DATA.akunGL);
  document.body.appendChild(overlay);
  document.getElementById('modalClose').onclick = closeModal;
  document.getElementById('modalCancel').onclick = closeModal;
  overlay.onclick = (e) => { if(e.target === overlay) closeModal(); };

  const wireRows = () => {
    overlay.querySelectorAll('[data-pu-pick-akun]').forEach(btn => btn.onclick = () => {
      const kode = btn.dataset.puPickAkun;
      row.jurnalAkun[idx].kodeAkun = kode;
      row.jurnalAkun[idx].namaAkun = puAkunNama(kode);
      document.getElementById('puJurnalBody').querySelector(`[data-pu-jurnal-kode="${idx}"]`).value = kode;
      document.getElementById('puJurnalBody').querySelector(`[data-pu-jurnal-nama="${idx}"]`).value = puAkunNama(kode);
      closeModal();
    });
  };
  wireRows();

  document.getElementById('puAkunPickerSearch').oninput = (e) => {
    const q = e.target.value.trim().toLowerCase();
    const filtered = DATA.akunGL.filter(a => a.kode.toLowerCase().includes(q) || a.nama.toLowerCase().includes(q));
    document.getElementById('puAkunPickerBody').innerHTML = tplPuAkunPickerRows(filtered);
    wireRows();
  };
}

function puBuildEmptyRow(){
  const cabang0 = PU_CABANG_LIST[0];
  return {
    no: puGenerateNo(cabang0), cabang: cabang0, tgl: '21/08/2026',
    supplierKode: '', supplierNama: '', noPengajuanPembayaran: '',
    akunBankKode: '', tipeTransaksi: 'Keluar Kas', cair: true, noGiro: '', tglJthTempoBank: '21/08/2026',
    fakturs: [], keterangan: 'Pembayaran Hutang Dagang',
    jumlahTidakSama: true, kursTarget: 1, status: 'Approved',
    jurnalMode: 'otomatis', jurnalAkun: [],
  };
}

/* ===== FORM (full page) ===== */
function openPuForm(mode, idx){
  let row;
  const isAdd = mode === 'add';
  if(isAdd){
    row = puBuildEmptyRow();
  } else {
    const src = DATA.pelunasanUtang[idx];
    row = { ...src, fakturs: (src.fakturs||[]).map(f => ({...f})), jurnalAkun: (src.jurnalAkun||[]).map(j => ({...j})) };
  }
  if(!row.jurnalAkun.length && row.jurnalMode !== 'manual') puBuildJurnalOtomatis(row);
  content.innerHTML = tplPuForm(mode, row);
  wirePuForm(mode, idx, row);
}

function refreshPuTotalsDOM(row){
  const totals = puRecalcTotals(row);
  document.getElementById('puJumlahKeluarKas').value = puNum2(totals.jumlahKeluarKas);
  document.getElementById('puSetelahKonversi').value = puNum2(totals.setelahKonversi);
  const tud = document.getElementById('puTotalUtangDibayar');
  if(tud) tud.value = puNum2(totals.jumlahUtang);
  if(row.jurnalMode === 'otomatis'){
    puBuildJurnalOtomatis(row);
    const jurnalTab = document.getElementById('puTabJurnalContent');
    if(jurnalTab && jurnalTab.style.display !== 'none') refreshPuJurnalContent(row);
  }
  return totals;
}

function refreshPuFakturTableDOM(mode, row){
  const isView = mode === 'view';
  document.getElementById('puFakturBody').innerHTML = tplPuFakturRows(row.fakturs, isView);
  const hint = document.getElementById('puFakturEmptyHint');
  if(hint) hint.style.display = (row.fakturs && row.fakturs.length) ? 'none' : '';
  wirePuFakturRows(mode, row);
}

function wirePuFakturRows(mode, row){
  const isView = mode === 'view';
  if(isView) return;
  document.querySelectorAll('[data-pu-bayar]').forEach(cb => cb.onchange = (e) => {
    const i = +cb.dataset.puBayar;
    row.fakturs[i].checked = e.target.checked;
    if(e.target.checked && !row.fakturs[i].pembayaran){
      row.fakturs[i].pembayaran = row.fakturs[i].reminder;
    }
    refreshPuFakturTableDOM(mode, row);
    refreshPuTotalsDOM(row);
  });
  document.querySelectorAll('[data-pu-pembayaran]').forEach(inp => inp.oninput = (e) => {
    const i = +inp.dataset.puPembayaran;
    row.fakturs[i].pembayaran = puParseNum(e.target.value);
    refreshPuTotalsDOM(row);
  });
}

function wirePuForm(mode, idx, row){
  const isAdd = mode === 'add';
  const isView = mode === 'view';

  wirePuFakturRows(mode, row);

  if(!isView){
    if(isAdd){
      document.getElementById('fPuCabang').onchange = (e) => {
        row.cabang = e.target.value;
        row.no = puGenerateNo(row.cabang);
        document.getElementById('fPuNo').value = row.no;
      };
      const refreshBtn = document.getElementById('puRefreshNo');
      if(refreshBtn) refreshBtn.onclick = () => {
        row.no = puGenerateNo(document.getElementById('fPuCabang').value);
        document.getElementById('fPuNo').value = row.no;
      };
    }

    document.getElementById('fPuTgl').oninput = (e) => { row.tgl = e.target.value; };
    document.getElementById('puSupplierSearch').onclick = () => openPuSupplierPicker(mode, row);
    const pengajuanBtn = document.getElementById('puPengajuanSearch');
    if(pengajuanBtn) pengajuanBtn.onclick = () => openPuDecorativePicker('Pilih Pengajuan Pembayaran', []);

    document.getElementById('puAkunBankSearch').onclick = () => openPuAkunBankPicker(row);
    document.getElementById('fPuKursTarget').oninput = (e) => {
      row.kursTarget = puParseNum(e.target.value);
      refreshPuTotalsDOM(row);
    };
    document.getElementById('fPuTipeTransaksi').onchange = (e) => {
      row.tipeTransaksi = e.target.value;
      const cairBox = document.getElementById('fPuCair');
      if(row.tipeTransaksi === 'Keluar Kas'){
        row.cair = true;
        cairBox.checked = true;
        cairBox.disabled = true;
      } else {
        cairBox.disabled = false;
      }
    };
    document.getElementById('fPuCair').onchange = (e) => { row.cair = e.target.checked; };
    document.getElementById('fPuNoGiro').oninput = (e) => { row.noGiro = e.target.value; };
    document.getElementById('fPuTglJthTempo').oninput = (e) => { row.tglJthTempoBank = e.target.value; };

    const tambahBankBtn = document.getElementById('puTambahBankBaru');
    if(tambahBankBtn) tambahBankBtn.onclick = (e) => {
      e.preventDefault();
      openPuInfo('Tambah Bank Baru', 'Mockup ini hanya mendukung 1 Rekening Pengeluaran per transaksi Pelunasan Utang.');
    };

    document.getElementById('fPuKeterangan').oninput = (e) => {
      row.keterangan = e.target.value;
      const ketBank = document.getElementById('fPuBankKeterangan');
      if(ketBank) ketBank.value = row.keterangan;
    };
    document.getElementById('fPuTidakSama').onchange = (e) => { row.jumlahTidakSama = e.target.checked; };

    document.getElementById('puSimpan').onclick = () => puSave(mode, idx, row, false);
    document.getElementById('puCetakSimpan').onclick = () => puSave(mode, idx, row, true);
  }

  document.getElementById('puBatalkan').onclick = () => renderPuList();

  const tabFakturBtn = document.getElementById('puTabFakturBtn');
  const tabJurnalBtn = document.getElementById('puTabJurnalBtn');
  const fakturContent = document.getElementById('puTabFakturContent');
  const jurnalContent = document.getElementById('puTabJurnalContent');
  tabFakturBtn.onclick = () => {
    tabFakturBtn.classList.add('active'); tabJurnalBtn.classList.remove('active');
    fakturContent.style.display = ''; jurnalContent.style.display = 'none';
  };
  tabJurnalBtn.onclick = () => {
    tabJurnalBtn.classList.add('active'); tabFakturBtn.classList.remove('active');
    if(row.jurnalMode === 'otomatis') puBuildJurnalOtomatis(row);
    refreshPuJurnalContent(row);
    jurnalContent.style.display = ''; fakturContent.style.display = 'none';
  };
}

function openPuSupplierPicker(mode, row){
  closeModal();
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.innerHTML = tplPuSupplierPicker(DATA.suppliers);
  document.body.appendChild(overlay);
  document.getElementById('modalClose').onclick = closeModal;
  document.getElementById('modalCancel').onclick = closeModal;
  overlay.onclick = (e) => { if(e.target === overlay) closeModal(); };
  overlay.querySelectorAll('[data-pick-supplier]').forEach(btn => btn.onclick = () => {
    const s = DATA.suppliers.find(x => x.kode === btn.dataset.pickSupplier);
    row.supplierKode = s.kode;
    row.supplierNama = s.nama;
    row.fakturs = puOutstandingInvoicesForSupplier(s.nama).map(puBuildFakturRow);
    document.getElementById('fPuSupplier').value = row.supplierNama;
    refreshPuFakturTableDOM(mode, row);
    refreshPuTotalsDOM(row);
    closeModal();
  });
}

function openPuAkunBankPicker(row){
  closeModal();
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.innerHTML = tplPuAkunBankPicker(DATA.kasBank);
  document.body.appendChild(overlay);
  document.getElementById('modalClose').onclick = closeModal;
  document.getElementById('modalCancel').onclick = closeModal;
  overlay.onclick = (e) => { if(e.target === overlay) closeModal(); };
  overlay.querySelectorAll('[data-pick-akunbank]').forEach(btn => btn.onclick = () => {
    const b = DATA.kasBank.find(x => x.kode === btn.dataset.pickAkunbank);
    row.akunBankKode = b.kode;
    document.getElementById('fPuAkunBank').value = b.kode;
    document.getElementById('fPuNamaBank').value = b.nama;
    document.getElementById('fPuJurnal').value = `${b.kode} - ${b.nama}`;
    refreshPuTotalsDOM(row);
    closeModal();
  });
}

function openPuDecorativePicker(title, list){
  closeModal();
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.innerHTML = tplPuDecorativePicker(title, list);
  document.body.appendChild(overlay);
  document.getElementById('modalClose').onclick = closeModal;
  document.getElementById('modalCancel').onclick = closeModal;
  overlay.onclick = (e) => { if(e.target === overlay) closeModal(); };
}

/* Simpan: tulis/replace baris DATA.pelunasanUtang & tambahkan
   `pembayaran` ke tiap Faktur Pembelian yang dicentang. `withPrint`
   cuma memicu info dekoratif tambahan — logic simpannya SAMA persis
   dengan Simpan biasa. */
function puSave(mode, idx, row, withPrint){
  const totals = puRecalcTotals(row);
  row.totalPembayaran = totals.jumlahKeluarKas;
  row.jumlahKeluarKas = totals.jumlahKeluarKas;
  row.jumlahUtang = totals.jumlahUtang;
  row.fakturs = (row.fakturs||[]).filter(f => f.checked);

  if(mode === 'edit'){
    const old = DATA.pelunasanUtang[idx];
    (old.fakturs||[]).forEach(f => {
      if(!f.fakturNo) return;
      const p = DATA.pembelianBPB.find(x => x.no === f.fakturNo);
      if(p) p.pembayaran = Math.round(Math.max(0, (p.pembayaran||0) - (+f.pembayaran||0)) * 100) / 100;
    });
  }

  row.fakturs.forEach(f => {
    if(!f.fakturNo) return;
    const p = DATA.pembelianBPB.find(x => x.no === f.fakturNo);
    if(p) p.pembayaran = Math.round(((p.pembayaran||0) + (+f.pembayaran||0)) * 100) / 100;
  });

  if(mode === 'add'){
    DATA.pelunasanUtang.unshift(row);
  } else {
    DATA.pelunasanUtang[idx] = row;
  }

  if(withPrint){
    openPuInfo('Cetak Pelunasan Utang', `Preview PDF Pelunasan Utang <b>${row.no}</b> akan tersedia di sini. Data sudah tersimpan.`);
  }
  renderPuList();
}

function openPuDeleteConfirm(idx){
  closeModal();
  const row = DATA.pelunasanUtang[idx];
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.innerHTML = tplPuDeleteConfirm(row);
  document.body.appendChild(overlay);
  document.getElementById('modalClose').onclick = closeModal;
  document.getElementById('modalCancel').onclick = closeModal;
  overlay.onclick = (e) => { if(e.target === overlay) closeModal(); };
  document.getElementById('modalDelete').onclick = () => {
    (row.fakturs||[]).forEach(f => {
      if(!f.fakturNo) return;
      const p = DATA.pembelianBPB.find(x => x.no === f.fakturNo);
      if(p) p.pembayaran = Math.round(Math.max(0, (p.pembayaran||0) - (+f.pembayaran||0)) * 100) / 100;
    });
    DATA.pelunasanUtang.splice(idx, 1);
    closeModal();
    renderPuTable();
  };
}

function openPuInfo(title, text){
  closeModal();
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.innerHTML = tplPuInfoModal(title, text);
  document.body.appendChild(overlay);
  document.getElementById('modalClose').onclick = closeModal;
  document.getElementById('modalOk').onclick = closeModal;
  overlay.onclick = (e) => { if(e.target === overlay) closeModal(); };
}
