/* =========================================================
   LOGIC (JS saja) — Penerimaan Piutang (Customer & Penjualan > Daftar
   Transaksi > Penerimaan Piutang). Dimuat otomatis (lazy-load) oleh
   core.js saat menu ini pertama kali diklik — lihat PAGE_MODULES di
   js/core.js. Markup HTML-nya ada di file sebelah:
   penerimaan-piutang.template.js (tplPenerimaanPiutangListPage/
   tplPpRows/tplPpForm/dst, plus konstanta PP_CABANG_LIST/
   PP_TIPE_TRANSAKSI_LIST & catatan desain lengkap di headernya).

   Alur inti (BENAR-BENAR reaktif, bukan dekoratif):
   1) Pilih Customer (openPpCustomerPicker) -> row.fakturs diisi ulang
      dari ppOutstandingInvoicesForCustomer(kode) — HANYA Invoice yang
      posted:true (sudah di-Posting ke GL di modul Invoice) & masih
      punya sisa (jumlah - dibayar > 0) untuk customer itu. Semua baris
      hasil default checked:true & Pembayaran = Reminder penuh (asumsi
      "bayar lunas" adalah default paling umum di ERP sungguhan; user
      tinggal uncheck/kurangi kalau parsial).
   2) Centang/nilai Pembayaran diubah -> ppRecalcTotals() menghitung
      ulang Jumlah Bank/Setelah Konversi Kurs/Total Pembayaran/Jumlah
      Piutang, ditampilkan reaktif (refreshPpTotalsDOM).
   3) Simpan (ppSave) -> baris baru di-push/replace ke
      DATA.penerimaanPiutang DAN `dibayar` tiap Invoice yang
      dicentang (row.fakturs[].invoiceNo) BENAR-BENAR ditambah sebesar
      Pembayaran-nya di DATA.invoices — supaya lain kali modul ini
      dibuka, invoice yang sudah lunas tidak muncul lagi di tab Lunasi
      Beberapa Faktur untuk customer itu.
   4) Hapus (openPpDeleteConfirm) -> kebalikannya: `dibayar` yang tadi
      ditambahkan DIKEMBALIKAN ke Invoice terkait sebelum baris
      Penerimaan Piutang itu sendiri di-splice, supaya pembukuan AR
      tetap konsisten.
========================================================= */

function renderPenerimaanPiutangPage(){
  renderPpList();
}

function renderPpList(){
  content.innerHTML = tplPenerimaanPiutangListPage();
  document.getElementById('btnPpAdd').onclick = () => openPpForm('add');
  renderPpTable();
}

function renderPpTable(){
  const tbody = document.getElementById('ppTbody');
  const total = document.getElementById('ppTotal');
  tbody.innerHTML = tplPpRows(DATA.penerimaanPiutang);
  total.textContent = `Total Record: ${DATA.penerimaanPiutang.length}`;
  tbody.querySelectorAll('[data-view]').forEach(b => b.onclick = () => openPpForm('view', +b.dataset.view));
  /* Chevron "Pilihan Lihat" SENGAJA disamakan dengan tombol Lihat utama
     (belum ada opsi kedua yang berguna di mockup ini — beda dari
     chevron Cetak yang memang punya 2 opsi nyata di Invoice). */
  tbody.querySelectorAll('[data-view-menu]').forEach(b => b.onclick = () => openPpForm('view', +b.dataset.viewMenu));
  tbody.querySelectorAll('[data-print]').forEach(b => b.onclick = () => {
    const r = DATA.penerimaanPiutang[+b.dataset.print];
    openPpInfo('Cetak Penerimaan Piutang', `Preview PDF Penerimaan Piutang <b>${r.no}</b> akan tersedia di sini.`);
  });
  tbody.querySelectorAll('[data-print-menu]').forEach(b => b.onclick = () => {
    const r = DATA.penerimaanPiutang[+b.dataset.printMenu];
    openPpInfo('Cetak Penerimaan Piutang', `Preview PDF Penerimaan Piutang <b>${r.no}</b> akan tersedia di sini.`);
  });
  tbody.querySelectorAll('[data-edit]').forEach(b => b.onclick = () => openPpForm('edit', +b.dataset.edit));
  tbody.querySelectorAll('[data-del]').forEach(b => b.onclick = () => openPpDeleteConfirm(+b.dataset.del));
}

/* ===== Helper murni (no DOM) ===== */
function ppGenerateNo(cabang){
  const kode = PP_CABANG_CODE[cabang] || 'XXX';
  const seq = DATA.penerimaanPiutang.filter(r => r.cabang === cabang).length + 1;
  return `26/CL/${kode}/08/${String(seq).padStart(5,'0')}`;
}

function ppFindKasBank(kode){
  return DATA.kasBank.find(b => b.kode === kode);
}

function ppParseNum(str){
  if(typeof str === 'number') return str;
  const cleaned = String(str||'0').replace(/\./g,'').replace(',', '.');
  const n = parseFloat(cleaned);
  return Number.isFinite(n) ? n : 0;
}

function ppParseTglDDMMYYYY(s){
  const m = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(s||'');
  if(!m) return null;
  return new Date(+m[3], +m[2]-1, +m[1]);
}
function ppFormatTglDDMMYYYY(d){
  const dd = String(d.getDate()).padStart(2,'0');
  const mm = String(d.getMonth()+1).padStart(2,'0');
  return `${dd}/${mm}/${d.getFullYear()}`;
}
/* Tgl. Jth. Tempo per-faktur = Tgl. Faktur + jumlah hari dari
   syaratBayar ("Kredit 30 Hari" -> +30, "CBD" -> +0) — SALINAN LOKAL
   dari pola invPrintJthTempo() (fitur cetak Invoice, sesi sebelumnya),
   bukan reuse cross-module (lihat catatan "local copy"). */
function ppJatuhTempo(tglStr, syaratBayar){
  const d = ppParseTglDDMMYYYY(tglStr);
  if(!d) return tglStr || '';
  const m = /(\d+)/.exec(syaratBayar || '');
  const days = m ? +m[1] : 0;
  d.setDate(d.getDate() + days);
  return ppFormatTglDDMMYYYY(d);
}

/* Invoice yang BOLEH ditagih via modul ini: sudah di-posting ke GL
   (posted:true, lihat openInvPostingConfirm() di invoice.js) DAN masih
   ada sisa (jumlah - dibayar > 0) untuk customer yang dipilih. */
function ppOutstandingInvoicesForCustomer(customerKode){
  return DATA.invoices.filter(inv => inv.posted && inv.customerKode === customerKode && (inv.jumlah - (inv.dibayar||0)) > 0.004);
}

function ppBuildFakturRow(inv){
  const sisa = Math.round((inv.jumlah - (inv.dibayar||0)) * 100) / 100;
  return {
    no: inv.no, cabang: inv.cabang, tipeTransaksi: 'Jual Kredit',
    tglFaktur: inv.tgl, tglJthTempo: ppJatuhTempo(inv.tgl, inv.syaratBayar),
    mataUang: 'IDR', kurs: 1,
    reminder: sisa, pembayaran: sisa, checked: true,
    invoiceNo: inv.no,
    /* PPN/PPH ditanggung customer (fitur baru 2026-08-20) — default
       semua false/kosong, user meng-aktifkan lewat checkbox "Ada
       potongan Ppn?/Pph?" di panel per-baris kalau relevan. */
    potonganPpn: false, potonganPph: false,
    sudahTerimaSspPpn: false, sudahTerimaSspPph: false,
    pphKode: PP_PPH_LIST[0].kode,
    noNtpnPpnAda: false, noNtpnPpn: '', tglNtpnPpn: '',
    noNtpnPphAda: false, noNtpnPph: '', tglNtpnPph: '',
  };
}

/* ===== PPN/PPH ditanggung customer — helper murni (no DOM) =====
   Basis dihitung dari f.pembayaran (bukan f.reminder) supaya
   proporsional kalau faktur dibayar sebagian — lihat catatan besar di
   header penerimaan-piutang.template.js utk penjelasan & verifikasi
   formula lengkap (DPP = Pembayaran/1,11, PPN = Pembayaran-DPP, PPH =
   DPP x %KodePPH). */
function ppFakturTax(f){
  const base = +f.pembayaran || 0;
  const dpp = Math.round((base / 1.11) * 100) / 100;
  const ppn = Math.round((base - dpp) * 100) / 100;
  const rateEntry = PP_PPH_LIST.find(p => p.kode === f.pphKode);
  const rate = rateEntry ? rateEntry.persen : 0;
  const pph = Math.round((dpp * (rate / 100)) * 100) / 100;
  return { dpp, ppn, pph };
}

/* Total nilai pajak yang DIPOTONG (ditanggung customer) utk 1 baris
   faktur — 0 kalau kedua checkbox potongan tidak dicentang. */
function ppFakturPotongan(f){
  const tax = ppFakturTax(f);
  let potongan = 0;
  if(f.potonganPpn) potongan += tax.ppn;
  if(f.potonganPph) potongan += tax.pph;
  return Math.round(potongan * 100) / 100;
}

/* Cash yang BENAR-BENAR diterima dari 1 baris faktur setelah dikurangi
   potongan pajak (kalau ada) — dipakai di panel per-baris ("Pembayaran
   Setelah Dikurangi Potongan") & di ppRecalcTotals() utk Jumlah Bank. */
function ppFakturNetPembayaran(f){
  return Math.round(((+f.pembayaran || 0) - ppFakturPotongan(f)) * 100) / 100;
}

/* Nama akun GL dgn fallback teks kalau kode tidak/tidak-sengaja belum
   ada di DATA.akunGL (mis. saat load pertama sebelum 4 akun baru
   sempat ditambahkan user via Master Akun GL). */
function ppAkunNama(kode, fallback){
  const a = DATA.akunGL.find(x => x.kode === kode);
  return a ? a.nama : (fallback || '');
}

/* Susun baris jurnal DINAMIS utk tab "Rincian Jurnal Akun" — 2 baris
   tetap (Bank/Piutang Usaha) + baris tambahan tergantung status
   potongan/sudah-terima-SSP tiap faktur yang dicentang. Lihat catatan
   besar & verifikasi balance di header penerimaan-piutang.template.js. */
function ppBuildJurnalLines(row, totals){
  const bank = ppFindKasBank(row.akunBankKode);
  const namaAkunBank = bank ? (bank.kode + ' - ' + bank.nama) : '(pilih Akun Bank)';
  const cust = row.customerNama || '';
  const r2 = n => Math.round(n * 100) / 100;

  const lines = [
    { kode: bank ? bank.kode : '', nama: namaAkunBank, ket: cust, debit: totals.jumlahBank, kredit: 0 },
    { kode: '1120001', nama: 'Piutang Usaha', ket: cust, debit: 0, kredit: totals.jumlahPiutang },
  ];

  /* Akun default dibaca dari master Jurnal Penjualan (DATA.jurnalPenjualan[0]
     — section "Akun Untuk Pelunasan Piutang" yang ditambahkan 2026-08-20),
     fallback ke kode lokal kalau kosong/belum diisi user. */
  const jj = (DATA.jurnalPenjualan && DATA.jurnalPenjualan[0]) || {};
  const akunArSspPpn = jj.akunARSSPPPN || '1120003';
  const akunArSspPph = jj.akunARSSPPPH || '1120004';
  const akunPpnPemungut = jj.akunPPNPemungut || '2120003';
  const akunUmPph22 = jj.akunUangMukaPPH22 || '1140003';

  let arSspPpnDebit = 0, arSspPphDebit = 0, ppnPemungutDebit = 0, umPph22Debit = 0;
  (row.fakturs || []).filter(f => f.checked).forEach(f => {
    const tax = ppFakturTax(f);
    if(f.potonganPpn){
      if(f.sudahTerimaSspPpn) ppnPemungutDebit += tax.ppn; else arSspPpnDebit += tax.ppn;
    }
    if(f.potonganPph){
      if(f.sudahTerimaSspPph) umPph22Debit += tax.pph; else arSspPphDebit += tax.pph;
    }
  });

  if(arSspPpnDebit > 0.004) lines.push({ kode: akunArSspPpn, nama: ppAkunNama(akunArSspPpn, 'Piutang SSP PPN'), ket: cust, debit: r2(arSspPpnDebit), kredit: 0 });
  if(arSspPphDebit > 0.004) lines.push({ kode: akunArSspPph, nama: ppAkunNama(akunArSspPph, 'Piutang SSP PPH'), ket: cust, debit: r2(arSspPphDebit), kredit: 0 });
  if(ppnPemungutDebit > 0.004) lines.push({ kode: akunPpnPemungut, nama: ppAkunNama(akunPpnPemungut, 'PPN Pemungut'), ket: cust, debit: r2(ppnPemungutDebit), kredit: 0 });
  if(umPph22Debit > 0.004) lines.push({ kode: akunUmPph22, nama: ppAkunNama(akunUmPph22, 'Uang Muka PPH 22'), ket: cust, debit: r2(umPph22Debit), kredit: 0 });

  return lines;
}

function ppComposeKeterangan(row){
  const fakturNos = (row.fakturs||[]).filter(f => f.checked).map(f => f.no);
  if(!fakturNos.length || !row.customerNama) return '';
  return `VA - Terima Piutang ${fakturNos.join(', ')} ${row.customerNama.toUpperCase()}`;
}

function ppRecalcTotals(row){
  const fakturs = row.fakturs || [];
  const checked = fakturs.filter(f => f.checked);
  /* Jumlah Bank = cash yang BENAR-BENAR diterima — dikurangi potongan
     PPN/PPH yang ditanggung customer per baris (ppFakturNetPembayaran,
     fitur baru 2026-08-20). Kalau tidak ada faktur yang potonganPpn/Pph-
     nya dicentang, ini persis sama dengan sebelumnya (sum pembayaran). */
  const jumlahBank = Math.round(checked.reduce((s,f) => s + ppFakturNetPembayaran(f), 0) * 100) / 100;
  const totalPotongan = Math.round(checked.reduce((s,f) => s + ppFakturPotongan(f), 0) * 100) / 100;
  const kursTarget = row.kursTarget != null ? (+row.kursTarget||1) : 1;
  const setelahKonversi = Math.round(jumlahBank * kursTarget * 100) / 100;
  const totalPembayaran = setelahKonversi; // potongan sudah terhitung di dalam jumlahBank
  const jumlahPiutang = Math.round(checked.reduce((s,f) => s + (+f.reminder||0), 0) * 100) / 100;
  return { jumlahBank, setelahKonversi, totalPembayaran, jumlahPiutang, totalPotongan };
}

function ppBuildEmptyRow(){
  const cabang0 = PP_CABANG_LIST[0];
  return {
    no: ppGenerateNo(cabang0), cabang: cabang0, tgl: '19/08/2026',
    customerKode: '', customerNama: '', badanUsaha: '', noPenagihanPiutang: '',
    akunBankKode: '', tipeTransaksi: 'Terima Kas', cair: true, noGiro: '', bankSumber: '', tglJthTempoBank: '19/08/2026',
    fakturs: [], keteranganUangMuka: '', kursUangMuka: 1, jadikanUangMuka: 0, keterangan: '',
    jumlahTidakSama: true, kursTarget: 1, status: 'Approved',
  };
}

/* ===== FORM (full page) ===== */
function openPpForm(mode, idx){
  let row;
  const isAdd = mode === 'add';
  if(isAdd){
    row = ppBuildEmptyRow();
  } else {
    const src = DATA.penerimaanPiutang[idx];
    row = { ...src, fakturs: (src.fakturs||[]).map(f => ({...f})) };
  }
  content.innerHTML = tplPpForm(mode, row);
  wirePpForm(mode, idx, row);
}

function refreshPpTotalsDOM(row){
  const totals = ppRecalcTotals(row);
  document.getElementById('ppJumlahBank').value = ppNum2(totals.jumlahBank);
  document.getElementById('ppSetelahKonversi').value = ppNum2(totals.setelahKonversi);
  document.getElementById('ppTotalPembayaran').value = ppNum2(totals.totalPembayaran);
  const jp = document.getElementById('ppJumlahPiutang');
  if(jp) jp.value = ppNum2(totals.jumlahPiutang);
  return totals;
}

function refreshPpFakturTableDOM(mode, row){
  const isView = mode === 'view';
  document.getElementById('ppFakturBody').innerHTML = tplPpFakturRows(row.fakturs, isView);
  const hint = document.getElementById('ppFakturEmptyHint');
  if(hint) hint.style.display = (row.fakturs && row.fakturs.length) ? 'none' : '';
  wirePpFakturRows(mode, row);
}

function wirePpFakturRows(mode, row){
  const isView = mode === 'view';
  if(isView) return;
  document.querySelectorAll('[data-pp-bayar]').forEach(cb => cb.onchange = (e) => {
    const i = +cb.dataset.ppBayar;
    row.fakturs[i].checked = e.target.checked;
    if(e.target.checked && !row.fakturs[i].pembayaran){
      row.fakturs[i].pembayaran = row.fakturs[i].reminder;
    }
    row.keterangan = ppComposeKeterangan(row);
    const ketArea = document.getElementById('fPpKeterangan');
    if(ketArea) ketArea.value = row.keterangan;
    const ketBank = document.getElementById('fPpBankKeterangan');
    if(ketBank) ketBank.value = row.keterangan;
    refreshPpFakturTableDOM(mode, row);
    refreshPpTotalsDOM(row);
  });
  document.querySelectorAll('[data-pp-pembayaran]').forEach(inp => inp.oninput = (e) => {
    const i = +inp.dataset.ppPembayaran;
    row.fakturs[i].pembayaran = ppParseNum(e.target.value);
    refreshPpFakturTableDOM(mode, row); // nominal AR SSP & "Pembayaran Setelah Dikurangi Potongan" ikut berubah
    refreshPpTotalsDOM(row);
  });

  /* ===== PPN/PPH ditanggung customer (fitur baru 2026-08-20) =====
     Toggle "Ada potongan Ppn?/Pph?" & "Sudah Terima SSP?" perlu
     re-render penuh (refreshPpFakturTableDOM) karena sub-panel terkait
     tampil/hilang & Jumlah Bank/Total Pembayaran ikut berubah. Field
     Kode PPH/No. NTPN/Tgl. cukup update state saja (kecuali Kode PPH,
     yang mengubah Nominal AR SSP PPH sehingga perlu re-render juga). */
  document.querySelectorAll('[data-pp-potongan-ppn]').forEach(cb => cb.onchange = (e) => {
    const i = +cb.dataset.ppPotonganPpn;
    row.fakturs[i].potonganPpn = e.target.checked;
    refreshPpFakturTableDOM(mode, row);
    refreshPpTotalsDOM(row);
  });
  document.querySelectorAll('[data-pp-potongan-pph]').forEach(cb => cb.onchange = (e) => {
    const i = +cb.dataset.ppPotonganPph;
    row.fakturs[i].potonganPph = e.target.checked;
    refreshPpFakturTableDOM(mode, row);
    refreshPpTotalsDOM(row);
  });
  document.querySelectorAll('[data-pp-ssp-terima-ppn]').forEach(cb => cb.onchange = (e) => {
    const i = +cb.dataset.ppSspTerimaPpn;
    row.fakturs[i].sudahTerimaSspPpn = e.target.checked;
  });
  document.querySelectorAll('[data-pp-ssp-terima-pph]').forEach(cb => cb.onchange = (e) => {
    const i = +cb.dataset.ppSspTerimaPph;
    row.fakturs[i].sudahTerimaSspPph = e.target.checked;
  });
  document.querySelectorAll('[data-pp-pph-kode]').forEach(sel => sel.onchange = (e) => {
    const i = +sel.dataset.ppPphKode;
    row.fakturs[i].pphKode = e.target.value;
    refreshPpFakturTableDOM(mode, row); // Nominal AR SSP PPH & Pembayaran Setelah Dikurangi Potongan ikut berubah
    refreshPpTotalsDOM(row);
  });
  document.querySelectorAll('[data-pp-ntpn-ppn-ada]').forEach(cb => cb.onchange = (e) => {
    const i = +cb.dataset.ppNtpnPpnAda;
    row.fakturs[i].noNtpnPpnAda = e.target.checked;
    refreshPpFakturTableDOM(mode, row);
  });
  document.querySelectorAll('[data-pp-ntpn-pph-ada]').forEach(cb => cb.onchange = (e) => {
    const i = +cb.dataset.ppNtpnPphAda;
    row.fakturs[i].noNtpnPphAda = e.target.checked;
    refreshPpFakturTableDOM(mode, row);
  });
  document.querySelectorAll('[data-pp-ntpn-ppn]').forEach(inp => inp.oninput = (e) => {
    const i = +inp.dataset.ppNtpnPpn;
    row.fakturs[i].noNtpnPpn = e.target.value;
  });
  document.querySelectorAll('[data-pp-ntpn-pph]').forEach(inp => inp.oninput = (e) => {
    const i = +inp.dataset.ppNtpnPph;
    row.fakturs[i].noNtpnPph = e.target.value;
  });
  document.querySelectorAll('[data-pp-tgl-ppn]').forEach(inp => inp.oninput = (e) => {
    const i = +inp.dataset.ppTglPpn;
    row.fakturs[i].tglNtpnPpn = e.target.value;
  });
  document.querySelectorAll('[data-pp-tgl-pph]').forEach(inp => inp.oninput = (e) => {
    const i = +inp.dataset.ppTglPph;
    row.fakturs[i].tglNtpnPph = e.target.value;
  });
}

function refreshPpJurnalTab(row){
  const totals = ppRecalcTotals(row);
  const el = document.getElementById('ppTabJurnalContent');
  if(el) el.innerHTML = tplPpJurnalContent(row, totals);
}

function wirePpForm(mode, idx, row){
  const isAdd = mode === 'add';
  const isView = mode === 'view';

  wirePpFakturRows(mode, row);

  if(!isView){
    if(isAdd){
      document.getElementById('fPpCabang').onchange = (e) => {
        row.cabang = e.target.value;
        row.no = ppGenerateNo(row.cabang);
        document.getElementById('fPpNo').value = row.no;
      };
      const refreshBtn = document.getElementById('ppRefreshNo');
      if(refreshBtn) refreshBtn.onclick = () => {
        row.no = ppGenerateNo(document.getElementById('fPpCabang').value);
        document.getElementById('fPpNo').value = row.no;
      };
    }

    document.getElementById('fPpTgl').oninput = (e) => { row.tgl = e.target.value; };
    document.getElementById('ppCustomerSearch').onclick = () => openPpCustomerPicker(mode, row);
    const penagihanBtn = document.getElementById('ppPenagihanSearch');
    if(penagihanBtn) penagihanBtn.onclick = () => openPpDecorativePicker('Pilih Penagihan Piutang', []);
    document.getElementById('fPpBadanUsaha').oninput = (e) => { row.badanUsaha = e.target.value; };

    document.getElementById('ppAkunBankSearch').onclick = () => openPpAkunBankPicker(row);
    document.getElementById('fPpKursTarget').oninput = (e) => {
      row.kursTarget = ppParseNum(e.target.value);
      refreshPpTotalsDOM(row);
    };
    document.getElementById('fPpTipeTransaksi').onchange = (e) => {
      row.tipeTransaksi = e.target.value;
      const cairBox = document.getElementById('fPpCair');
      if(row.tipeTransaksi === 'Terima Kas'){
        row.cair = true;
        cairBox.checked = true;
        cairBox.disabled = true;
      } else {
        cairBox.disabled = false;
      }
    };
    document.getElementById('fPpCair').onchange = (e) => { row.cair = e.target.checked; };
    document.getElementById('fPpNoGiro').oninput = (e) => { row.noGiro = e.target.value; };
    document.getElementById('fPpBankSumber').oninput = (e) => { row.bankSumber = e.target.value; };
    document.getElementById('fPpTglJthTempo').oninput = (e) => { row.tglJthTempoBank = e.target.value; };

    document.getElementById('fPpKetUangMuka').oninput = (e) => { row.keteranganUangMuka = e.target.value; };
    document.getElementById('fPpKursUangMuka').oninput = (e) => { row.kursUangMuka = ppParseNum(e.target.value); };
    document.getElementById('fPpJadikanUangMuka').oninput = (e) => { row.jadikanUangMuka = ppParseNum(e.target.value); };
    document.getElementById('fPpKeterangan').oninput = (e) => {
      row.keterangan = e.target.value;
      const ketBank = document.getElementById('fPpBankKeterangan');
      if(ketBank) ketBank.value = row.keterangan;
    };
    document.getElementById('fPpTidakSama').onchange = (e) => { row.jumlahTidakSama = e.target.checked; };

    document.getElementById('ppSimpan').onclick = () => ppSave(mode, idx, row, false);
    document.getElementById('ppCetakSimpan').onclick = () => ppSave(mode, idx, row, true);
  }

  document.getElementById('ppBatalkan').onclick = () => renderPpList();

  const tabFakturBtn = document.getElementById('ppTabFakturBtn');
  const tabJurnalBtn = document.getElementById('ppTabJurnalBtn');
  const fakturContent = document.getElementById('ppTabFakturContent');
  const jurnalContent = document.getElementById('ppTabJurnalContent');
  tabFakturBtn.onclick = () => {
    tabFakturBtn.classList.add('active'); tabJurnalBtn.classList.remove('active');
    fakturContent.style.display = ''; jurnalContent.style.display = 'none';
  };
  tabJurnalBtn.onclick = () => {
    tabJurnalBtn.classList.add('active'); tabFakturBtn.classList.remove('active');
    refreshPpJurnalTab(row);
    jurnalContent.style.display = ''; fakturContent.style.display = 'none';
  };
}

function openPpCustomerPicker(mode, row){
  closeModal();
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.innerHTML = tplPpCustomerPicker(DATA.customers);
  document.body.appendChild(overlay);
  document.getElementById('modalClose').onclick = closeModal;
  document.getElementById('modalCancel').onclick = closeModal;
  overlay.onclick = (e) => { if(e.target === overlay) closeModal(); };
  overlay.querySelectorAll('[data-pick-customer]').forEach(btn => btn.onclick = () => {
    const c = DATA.customers.find(x => x.kode === btn.dataset.pickCustomer);
    row.customerKode = c.kode;
    row.customerNama = c.nama;
    row.fakturs = ppOutstandingInvoicesForCustomer(c.kode).map(ppBuildFakturRow);
    row.keterangan = ppComposeKeterangan(row);
    document.getElementById('fPpCustomer').value = row.customerNama;
    document.getElementById('fPpKeterangan').value = row.keterangan;
    const ketBank = document.getElementById('fPpBankKeterangan');
    if(ketBank) ketBank.value = row.keterangan;
    refreshPpFakturTableDOM(mode, row);
    refreshPpTotalsDOM(row);
    closeModal();
  });
}

function openPpAkunBankPicker(row){
  closeModal();
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.innerHTML = tplPpAkunBankPicker(DATA.kasBank);
  document.body.appendChild(overlay);
  document.getElementById('modalClose').onclick = closeModal;
  document.getElementById('modalCancel').onclick = closeModal;
  overlay.onclick = (e) => { if(e.target === overlay) closeModal(); };
  overlay.querySelectorAll('[data-pick-akunbank]').forEach(btn => btn.onclick = () => {
    const b = DATA.kasBank.find(x => x.kode === btn.dataset.pickAkunbank);
    row.akunBankKode = b.kode;
    document.getElementById('fPpAkunBank').value = b.kode;
    document.getElementById('fPpNamaBank').value = b.nama;
    document.getElementById('fPpJurnal').value = `${b.kode} - ${b.nama}`;
    closeModal();
  });
}

function openPpDecorativePicker(title, list){
  closeModal();
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.innerHTML = tplPpDecorativePicker(title, list);
  document.body.appendChild(overlay);
  document.getElementById('modalClose').onclick = closeModal;
  document.getElementById('modalCancel').onclick = closeModal;
  overlay.onclick = (e) => { if(e.target === overlay) closeModal(); };
}

/* Simpan: tulis/replace baris DATA.penerimaanPiutang & tambahkan
   `dibayar` ke tiap Invoice yang dicentang. `withPrint` cuma memicu
   info dekoratif tambahan (lihat catatan "Cetak dekoratif" di header
   template) — logic simpannya SAMA persis dengan Simpan biasa. */
function ppSave(mode, idx, row, withPrint){
  const totals = ppRecalcTotals(row);
  row.totalPembayaran = totals.totalPembayaran;
  row.jumlahBank = totals.jumlahBank;
  row.jumlahPiutang = totals.jumlahPiutang;
  row.fakturs = (row.fakturs||[]).filter(f => f.checked);

  /* Mode 'edit' menimpa baris yang SUDAH pernah menambah `dibayar` pada
     invoice terkait sebelumnya — batalkan dulu efek versi LAMA (supaya
     Simpan ulang / ubah nilai Pembayaran tidak dobel-hitung), baru
     terapkan efek versi BARU di bawah. */
  if(mode === 'edit'){
    const old = DATA.penerimaanPiutang[idx];
    (old.fakturs||[]).forEach(f => {
      if(!f.invoiceNo) return;
      const inv = DATA.invoices.find(x => x.no === f.invoiceNo);
      if(inv) inv.dibayar = Math.round(Math.max(0, (inv.dibayar||0) - (+f.pembayaran||0)) * 100) / 100;
    });
  }

  row.fakturs.forEach(f => {
    if(!f.invoiceNo) return;
    const inv = DATA.invoices.find(x => x.no === f.invoiceNo);
    if(inv) inv.dibayar = Math.round(((inv.dibayar||0) + (+f.pembayaran||0)) * 100) / 100;
  });

  if(mode === 'add'){
    DATA.penerimaanPiutang.unshift(row);
  } else {
    DATA.penerimaanPiutang[idx] = row;
  }

  if(withPrint){
    openPpInfo('Cetak Penerimaan Piutang', `Preview PDF Penerimaan Piutang <b>${row.no}</b> akan tersedia di sini. Data sudah tersimpan.`);
  }
  renderPpList();
}

function openPpDeleteConfirm(idx){
  closeModal();
  const row = DATA.penerimaanPiutang[idx];
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.innerHTML = tplPpDeleteConfirm(row);
  document.body.appendChild(overlay);
  document.getElementById('modalClose').onclick = closeModal;
  document.getElementById('modalCancel').onclick = closeModal;
  overlay.onclick = (e) => { if(e.target === overlay) closeModal(); };
  document.getElementById('modalDelete').onclick = () => {
    (row.fakturs||[]).forEach(f => {
      if(!f.invoiceNo) return;
      const inv = DATA.invoices.find(x => x.no === f.invoiceNo);
      if(inv) inv.dibayar = Math.round(Math.max(0, (inv.dibayar||0) - (+f.pembayaran||0)) * 100) / 100;
    });
    DATA.penerimaanPiutang.splice(idx, 1);
    closeModal();
    renderPpTable();
  };
}

function openPpInfo(title, text){
  closeModal();
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.innerHTML = tplPpInfoModal(title, text);
  document.body.appendChild(overlay);
  document.getElementById('modalClose').onclick = closeModal;
  document.getElementById('modalOk').onclick = closeModal;
  overlay.onclick = (e) => { if(e.target === overlay) closeModal(); };
}
