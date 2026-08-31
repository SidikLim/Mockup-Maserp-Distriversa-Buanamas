/* =========================================================
   LOGIC (JS saja) — Pembelian Aktiva Tetap (Aktiva Tetap >
   Daftar Transaksi). Dimuat otomatis (lazy-load) oleh core.js
   saat menu ini pertama kali diklik — lihat PAGE_MODULES di
   js/core.js. Markup HTML-nya ada di file sebelah:
   pembelian-aktiva-tetap.template.js (lihat catatan desain
   lengkap di headernya).
   NB: closeModal() dipakai bersama, didefinisikan di core.js.

   Alur inti:
   1) Header: Supplier (picker DATA.suppliers), Cabang menyetir
      No. Transaksi "26/FAB/{kode}/08/{urut}", Syarat Bayar
      menghitung Tgl. Jth. Tempo otomatis (CBD. = 0 hari).
   2) Tabel Rincian Aktiva Tetap: baris ditambah manual (+Tambah);
      Kode Aset lewat picker master Fixed Asset (mengisi nama,
      harga & jurnal golongan otomatis) ATAU dibiarkan "(aset
      baru)" dan Nama Aset diketik langsung; Diskon = Harga x
      Disc% / 100, Jumlah = Harga - Diskon; DPP/PPN/Uang Muka
      Pakai -> Jumlah & Sisa Jumlah reaktif.
   3) Tab Rincian Jurnal Akun — "Buat Jurnal": tiap baris aset
      di-debit ke akun golongannya (glDebit master Jurnal Aktiva
      Tetap terpilih, fallback PAT_GOLONGAN_AKUN), PPN Masukan
      1140002(D), lawannya Hutang Usaha 2110001(K) utk Kredit atau
      Kas Besar 1100002(K) utk CBD./tunai; baris tetap bisa
      diedit manual, divalidasi balance saat Simpan.
   4) Tipe Transaksi list dari Syarat Bayar (CBD. -> Beli Tunai,
      lainnya Beli Kredit). Cetak = modal info placeholder (belum
      ada contoh cetakan dari user). Dokumen bisa di-Ubah.
========================================================= */
function renderPembelianAktivaTetapPage(){
  renderPatList();
}

var patState = { search:'' };

function renderPatList(){
  patState = { search:'' };
  content.innerHTML = tplPembelianAktivaTetapListPage();
  document.getElementById('btnPatAdd').onclick = () => openPatForm('add');
  document.getElementById('patSearch').oninput = (e) => { patState.search = e.target.value; renderPatTable(); };
  document.getElementById('patFilter').onchange = () => renderPatTable();
  renderPatTable();
}

function patFilteredRows(){
  const q = patState.search.trim().toLowerCase();
  const tipe = (document.getElementById('patFilter')||{}).value || 'Semua';
  return (DATA.pembelianAktivaTetap || []).filter(r => {
    if(tipe !== 'Semua' && r.tipeTransaksi !== tipe) return false;
    if(q && !(
      r.no.toLowerCase().includes(q) ||
      (r.supplier || '').toLowerCase().includes(q) ||
      (r.tipeTransaksi || '').toLowerCase().includes(q))) return false;
    return true;
  });
}

function renderPatTable(){
  const rows = patFilteredRows();
  const tbody = document.getElementById('patTbody');
  tbody.innerHTML = tplPatRows(rows);
  document.getElementById('patTotal').textContent = `Total Record: ${rows.length}`;
  const idxOf = (r) => DATA.pembelianAktivaTetap.indexOf(r);
  tbody.querySelectorAll('[data-view-link]').forEach(b => b.onclick = () => openPatForm('view', idxOf(rows[+b.dataset.viewLink])));
  tbody.querySelectorAll('[data-view]').forEach(b => b.onclick = () => openPatForm('view', idxOf(rows[+b.dataset.view])));
  tbody.querySelectorAll('[data-edit]').forEach(b => b.onclick = () => openPatForm('edit', idxOf(rows[+b.dataset.edit])));
  tbody.querySelectorAll('[data-print]').forEach(b => b.onclick = () => {
    const r = rows[+b.dataset.print];
    openPatInfo('Cetak Pembelian Aktiva Tetap', `Preview PDF Pembelian Aktiva Tetap <b>${r.no}</b> akan tersedia di sini.`);
  });
  tbody.querySelectorAll('[data-del]').forEach(b => b.onclick = () => openPatDeleteConfirm(idxOf(rows[+b.dataset.del])));
}

/* No. Transaksi format screenshot: "26/FAB/HO/08/00001". */
function patGenerateNo(cabang){
  const kode = PAT_CABANG_CODE[cabang] || 'XXX';
  const seq = (DATA.pembelianAktivaTetap || []).filter(r => r.cabang === cabang).length + 1;
  return `26/FAB/${kode}/08/${String(seq).padStart(5,'0')}`;
}

/* ===== kalkulasi ===== */
function patRecalcItem(item){
  item.diskon = Math.round((+item.hargaBeli || 0) * (+item.disc || 0)) / 100;
  item.jumlah = Math.round(((+item.hargaBeli || 0) - item.diskon) * 100) / 100;
}

function patRecalcTotals(row){
  row.dpp = Math.round(row.items.reduce((s,it) => s + (+it.jumlah || 0), 0) * 100) / 100;
  row.diskon1Amount = Math.round(row.dpp * (+row.diskon1 || 0)) / 100;
  row.diskon2Amount = Math.round(row.dpp * (+row.diskon2 || 0)) / 100;
  const dppNet = row.dpp - row.diskon1Amount - row.diskon2Amount;
  row.ppnAmount = (row.ppnMode === 'eksklusif') ? Math.round(dppNet * 11) / 100 : 0;
  row.pajak11 = (row.ppnMode === 'eksklusif' || row.ppnMode === 'inklusif') ? 'PPN11' : '';
  row.jumlahTotal = Math.round((dppNet + row.ppnAmount) * 100) / 100;
  row.sisaJumlah = Math.round((row.jumlahTotal - (+row.uangMukaPakai || 0)) * 100) / 100;
}

function patJurnalTotals(row){
  const list = row.jurnalAkun || [];
  const debit = Math.round(list.reduce((s,e) => s + (+e.debit||0), 0) * 100) / 100;
  const kredit = Math.round(list.reduce((s,e) => s + (+e.kredit||0), 0) * 100) / 100;
  return { debit, kredit, selisih: Math.round((debit - kredit) * 100) / 100 };
}

/* Akun debit 1 baris aset: glDebit master Jurnal Aktiva Tetap yang
   dipilih di kolom Jurnal, fallback peta golongan -> akun 1510xxx. */
function patAkunDebitItem(item){
  const j = DATA.jurnalFixedAsset.find(x => x.kode === +item.jurnalKode);
  if(j && j.glDebit) return j.glDebit;
  if(j && PAT_GOLONGAN_AKUN[j.golongan]) return PAT_GOLONGAN_AKUN[j.golongan];
  return '1510004'; // Peralatan Kantor — fallback paling umum
}

function patBuildJurnal(row){
  patRecalcTotals(row);
  const ket = row.keterangan || `Pembelian Aktiva Tetap ${row.no}`;
  const rows = [];
  // Gabungkan debit per akun golongan (2 aset segolongan -> 1 baris)
  const byAkun = {};
  row.items.forEach(it => {
    if(!(+it.jumlah > 0)) return;
    const akun = patAkunDebitItem(it);
    byAkun[akun] = (byAkun[akun] || 0) + (+it.jumlah || 0);
  });
  Object.keys(byAkun).forEach(akun => {
    rows.push({ kodeAkun: akun, namaAkun: patAkunNama(akun), keterangan: ket, debit: Math.round(byAkun[akun]*100)/100, kredit: 0 });
  });
  if(row.ppnAmount > 0.004) rows.push({ kodeAkun:'1140002', namaAkun: patAkunNama('1140002')||'PPN Masukan', keterangan: ket, debit: row.ppnAmount, kredit: 0 });
  const akunLawan = row.syaratBayar === 'CBD.' ? '1100002' : '2110001';
  if(row.jumlahTotal > 0.004) rows.push({ kodeAkun: akunLawan, namaAkun: patAkunNama(akunLawan), keterangan: ket, debit: 0, kredit: row.jumlahTotal });
  // Penyeimbang (diskon dokumen / pembulatan)
  const t = { d: rows.reduce((s,r)=>s+r.debit,0), k: rows.reduce((s,r)=>s+r.kredit,0) };
  const selisih = Math.round((t.d - t.k) * 100) / 100;
  if(Math.abs(selisih) > 0.004) rows.push({ kodeAkun:'6510003', namaAkun: patAkunNama('6510003')||'Selisih Pembulatan / Pembayaran', keterangan: ket, debit: selisih < 0 ? -selisih : 0, kredit: selisih > 0 ? selisih : 0 });
  row.jurnalAkun = rows;
}

function patBuildEmptyRow(){
  const cabang0 = PAT_CABANG_LIST[0];
  return {
    no: patGenerateNo(cabang0), cabang: cabang0, tgl: '31/08/2026',
    syaratBayar: 'CBD.', tglJthTempo: '31/08/2026', tipeTransaksi: 'Beli Tunai',
    supplier: '', supplierKode: '', kirim: '', keterangan: '',
    items: [], jurnalAkun: [],
    ppnMode: 'tidak', pajak11: '', ppnAmount: 0,
    diskon1: 0, diskon1Amount: 0, diskon2: 0, diskon2Amount: 0, dpp: 0,
    uangMukaTipe: 'Oldest', sisaUangMuka: 0, uangMukaPakai: 0,
    jumlahTotal: 0, sisaJumlah: 0,
  };
}

function openPatForm(mode, idx){
  const src = mode === 'add' ? patBuildEmptyRow() : DATA.pembelianAktivaTetap[idx];
  const row = {
    ...src,
    items: (src.items||[]).map(it => ({...it})),
    jurnalAkun: (src.jurnalAkun||[]).map(e => ({...e})),
  };
  content.innerHTML = tplPatForm(mode, row);
  wirePatForm(mode, idx, row);
}

/* ===== refresh DOM ===== */
function refreshPatItemsDOM(row, isView){
  document.getElementById('patItemsBody').innerHTML = tplPatItemRows(row.items, isView);
  wirePatItemEvents(row);
  patRecalcTotals(row);
  refreshPatTotalsDOM(row);
}

function refreshPatTotalsDOM(row){
  const set = (id, val) => { const el = document.getElementById(id); if(el) el.value = val; };
  set('fPatDiskon1Amount', patNum2(row.diskon1Amount));
  set('fPatDiskon2Amount', patNum2(row.diskon2Amount));
  set('fPatDpp', patNum2(row.dpp));
  set('fPatPajak', row.pajak11);
  set('fPatPpnAmount', patNum2(row.ppnAmount));
  set('fPatJumlahTotal', patNum2(row.jumlahTotal));
  set('fPatSisaJumlah', patNum2(row.sisaJumlah));
}

function refreshPatItemRowDOM(idx, item){
  const d = document.querySelector(`[data-pat-diskon="${idx}"]`);
  const j = document.querySelector(`[data-pat-jumlah="${idx}"]`);
  if(d) d.value = patNum2(item.diskon);
  if(j) j.value = patNum2(item.jumlah);
}

function refreshPatJurnalContent(row, isView){
  const el = document.getElementById('patTabJurnalContent');
  if(!el) return;
  const visible = el.style.display !== 'none';
  el.innerHTML = tplPatJurnalContent(row, isView);
  el.style.display = visible ? '' : 'none';
  wirePatJurnalEvents(row, isView);
}

function refreshPatJurnalSelisih(row){
  const el = document.getElementById('patJurnalSelisih');
  if(!el) return;
  const totals = patJurnalTotals(row);
  el.value = patNum2(totals.selisih);
  el.style.color = Math.abs(totals.selisih) > 0.004 ? 'var(--red)' : 'var(--text)';
}

function wirePatItemEvents(row){
  (row.items||[]).forEach((it, idx) => {
    const search = document.querySelector(`[data-pat-aset-search="${idx}"]`);
    if(search) search.onclick = () => openPatAsetPicker(idx, row);
    const nama = document.querySelector(`[data-pat-nama="${idx}"]`);
    if(nama) nama.onchange = (e) => { it.namaAset = e.target.value; };
    const jurnal = document.querySelector(`[data-pat-jurnal="${idx}"]`);
    if(jurnal) jurnal.onchange = (e) => { it.jurnalKode = e.target.value ? +e.target.value : ''; };
    const recalc = () => {
      patRecalcItem(it);
      refreshPatItemRowDOM(idx, it);
      patRecalcTotals(row);
      refreshPatTotalsDOM(row);
    };
    const harga = document.querySelector(`[data-pat-harga="${idx}"]`);
    if(harga) harga.onchange = (e) => { it.hargaBeli = +e.target.value || 0; recalc(); };
    const disc = document.querySelector(`[data-pat-disc="${idx}"]`);
    if(disc) disc.onchange = (e) => { it.disc = +e.target.value || 0; recalc(); };
    const del = document.querySelector(`[data-pat-del="${idx}"]`);
    if(del) del.onclick = () => { row.items.splice(idx,1); refreshPatItemsDOM(row, false); };
  });
}

function wirePatJurnalEvents(row, isView){
  const btnBuat = document.getElementById('patBuatJurnal');
  if(btnBuat) btnBuat.onclick = () => {
    if(!row.items.length){ openPatInfo('Validasi', 'Isi minimal 1 baris Rincian Aktiva Tetap terlebih dahulu.'); return; }
    patBuildJurnal(row);
    refreshPatJurnalContent(row, isView);
  };
  const addRow = document.getElementById('patJurnalAddRow');
  if(addRow) addRow.onclick = () => {
    row.jurnalAkun.push({ kodeAkun:'', namaAkun:'', keterangan: row.keterangan||'', debit:0, kredit:0 });
    refreshPatJurnalContent(row, isView);
  };
  if(isView) return;
  (row.jurnalAkun||[]).forEach((entry, idx) => {
    const ket = document.querySelector(`[data-pat-jurnal-ket="${idx}"]`);
    if(ket) ket.onchange = () => { entry.keterangan = ket.value; };
    const deb = document.querySelector(`[data-pat-jurnal-debit="${idx}"]`);
    if(deb) deb.onchange = () => { entry.debit = +deb.value || 0; refreshPatJurnalSelisih(row); };
    const kre = document.querySelector(`[data-pat-jurnal-kredit="${idx}"]`);
    if(kre) kre.onchange = () => { entry.kredit = +kre.value || 0; refreshPatJurnalSelisih(row); };
    const del = document.querySelector(`[data-pat-jurnal-del="${idx}"]`);
    if(del) del.onclick = () => { row.jurnalAkun.splice(idx,1); refreshPatJurnalContent(row, isView); };
    const search = document.querySelector(`[data-pat-jurnal-akun-search="${idx}"]`);
    if(search) search.onclick = () => openPatAkunPicker(idx, row);
  });
}

function wirePatForm(mode, idx, row){
  const isAdd = mode === 'add';
  const isView = mode === 'view';

  const tabRincianBtn = document.getElementById('patTabRincianBtn');
  const tabJurnalBtn = document.getElementById('patTabJurnalBtn');
  const rincianContent = document.getElementById('patTabRincianContent');
  const jurnalContent = document.getElementById('patTabJurnalContent');
  tabRincianBtn.onclick = () => {
    tabRincianBtn.classList.add('active'); tabJurnalBtn.classList.remove('active');
    rincianContent.style.display = ''; jurnalContent.style.display = 'none';
  };
  tabJurnalBtn.onclick = () => {
    tabJurnalBtn.classList.add('active'); tabRincianBtn.classList.remove('active');
    refreshPatJurnalContent(row, isView);
    jurnalContent.style.display = ''; rincianContent.style.display = 'none';
  };

  document.getElementById('btnPatTutorial').onclick = () => openPatInfo('Tutorial', 'Video tutorial pengisian Pembelian Aktiva Tetap akan tersedia di sini.');
  document.getElementById('patBatalkan').onclick = (e) => { e.preventDefault(); renderPatList(); };

  wirePatItemEvents(row);
  wirePatJurnalEvents(row, isView);

  if(isView) return;

  const cabangSel = document.getElementById('fPatCabang');
  const applyNo = () => {
    row.no = patGenerateNo(row.cabang);
    document.getElementById('fPatNo').value = row.no;
  };
  if(isAdd){
    cabangSel.onchange = () => { row.cabang = cabangSel.value; applyNo(); };
    document.getElementById('patRefreshNo').onclick = applyNo;
  }

  const recomputeJatuhTempo = () => {
    row.tgl = document.getElementById('fPatTgl').value;
    row.syaratBayar = document.getElementById('fPatSyaratBayar').value;
    row.tglJthTempo = patJatuhTempo(row.tgl, row.syaratBayar);
    document.getElementById('fPatTglJthTempo').value = row.tglJthTempo;
  };
  document.getElementById('fPatTgl').onchange = recomputeJatuhTempo;
  document.getElementById('fPatSyaratBayar').onchange = recomputeJatuhTempo;
  document.getElementById('fPatKirim').onchange = (e) => { row.kirim = e.target.value; };
  document.getElementById('fPatKeterangan').onchange = (e) => { row.keterangan = e.target.value; };
  document.getElementById('patSupplierSearch').onclick = () => openPatSupplierPicker(row);

  document.getElementById('patRincianAdd').onclick = () => {
    row.items.push({ kodeAset:'', namaAset:'', jurnalKode:'', hargaBeli:0, disc:0, diskon:0, jumlah:0 });
    refreshPatItemsDOM(row, false);
  };

  document.querySelectorAll('input[name="patPpnMode"]').forEach(r => r.onchange = (e) => {
    row.ppnMode = e.target.value;
    patRecalcTotals(row); refreshPatTotalsDOM(row);
  });
  document.querySelectorAll('input[name="patUangMukaTipe"]').forEach(r => r.onchange = (e) => { row.uangMukaTipe = e.target.value; });
  ['fPatDiskon1','fPatDiskon2','fPatUangMukaPakai'].forEach(id => {
    document.getElementById(id).onchange = (e) => {
      const key = { fPatDiskon1:'diskon1', fPatDiskon2:'diskon2', fPatUangMukaPakai:'uangMukaPakai' }[id];
      row[key] = +e.target.value || 0;
      patRecalcTotals(row); refreshPatTotalsDOM(row);
    };
  });
  document.getElementById('patPajakInfo').onclick = () => openPatPpnPicker(row);

  document.getElementById('patSimpan').onclick = () => patSave(mode, idx, row, false);
  document.getElementById('patCetakSimpan').onclick = () => patSave(mode, idx, row, true);
}

function patSave(mode, idx, row, withPrint){
  if(!row.supplier){ openPatInfo('Validasi', 'Supplier wajib dipilih.'); return; }
  const adaItem = row.items.some(it => (+it.hargaBeli||0) > 0 && (it.namaAset||'').trim());
  if(!adaItem){ openPatInfo('Validasi', 'Isi minimal 1 baris Rincian Aktiva Tetap dengan Nama Aset dan Harga Beli.'); return; }
  patRecalcTotals(row);
  if(!row.jurnalAkun.length){
    patBuildJurnal(row);
  } else {
    const totals = patJurnalTotals(row);
    if(Math.abs(totals.selisih) > 0.004){
      openPatInfo('Validasi', `Rincian Jurnal Akun belum balance — Jumlah Debit - Kredit = <b>${patNum2(totals.selisih)}</b>. Klik "Buat Jurnal" untuk menyusun ulang otomatis, atau samakan Debit dan Kredit dulu.`);
      return;
    }
  }
  row.tipeTransaksi = row.syaratBayar === 'CBD.' ? 'Beli Tunai' : 'Beli Kredit';
  if(mode === 'add'){ DATA.pembelianAktivaTetap.unshift(row); }
  else { DATA.pembelianAktivaTetap[idx] = row; }
  if(withPrint){
    openPatInfo('Cetak Pembelian Aktiva Tetap', `Preview PDF Pembelian Aktiva Tetap <b>${row.no}</b> akan tersedia di sini. Data sudah tersimpan.`);
  }
  renderPatList();
}

/* ===== pickers ===== */
function openPatSupplierPicker(row){
  closeModal();
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.innerHTML = tplPatSupplierPicker(DATA.suppliers);
  document.body.appendChild(overlay);
  document.getElementById('modalClose').onclick = closeModal;
  document.getElementById('modalCancel').onclick = closeModal;
  overlay.onclick = (e) => { if(e.target === overlay) closeModal(); };
  const wireRows = () => {
    overlay.querySelectorAll('[data-pick-supplier]').forEach(btn => btn.onclick = () => {
      row.supplier = btn.dataset.pickSupplier;
      document.getElementById('fPatSupplier').value = row.supplier;
      closeModal();
    });
  };
  wireRows();
  document.getElementById('patSupplierPickerSearch').oninput = (e) => {
    const q = e.target.value.trim().toLowerCase();
    const filtered = DATA.suppliers.filter(s => s.kode.toLowerCase().includes(q) || s.nama.toLowerCase().includes(q));
    document.getElementById('patSupplierPickerBody').innerHTML = tplPatSupplierPickerRows(filtered);
    wireRows();
  };
}

function openPatAsetPicker(idx, row){
  closeModal();
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.innerHTML = tplPatAsetPicker(DATA.aktivaTetap, idx);
  document.body.appendChild(overlay);
  document.getElementById('modalClose').onclick = closeModal;
  document.getElementById('modalCancel').onclick = closeModal;
  overlay.onclick = (e) => { if(e.target === overlay) closeModal(); };
  const wireRows = () => {
    overlay.querySelectorAll('[data-pick-aset]').forEach(btn => btn.onclick = () => {
      const a = DATA.aktivaTetap.find(x => x.kode === btn.dataset.pickAset);
      if(!a) return;
      const it = row.items[idx];
      it.kodeAset = a.kode;
      it.namaAset = a.nama;
      it.hargaBeli = +a.hargaBeli || 0;
      // Pilih jurnal golongan yang cocok kalau ada (match teks golongan
      // di aturanKode master aset, mis. "KENDARAAN BERMOTOR 2").
      const j = DATA.jurnalFixedAsset.find(x => (a.aturanKode||'').toUpperCase().includes((x.golongan||'').toUpperCase()) && x.golongan);
      if(j) it.jurnalKode = j.kode;
      patRecalcItem(it);
      refreshPatItemsDOM(row, false);
      closeModal();
    });
  };
  wireRows();
  document.getElementById('patAsetPickerSearch').oninput = (e) => {
    const q = e.target.value.trim().toLowerCase();
    const filtered = DATA.aktivaTetap.filter(a => a.kode.toLowerCase().includes(q) || a.nama.toLowerCase().includes(q));
    document.getElementById('patAsetPickerBody').innerHTML = tplPatAsetPickerRows(filtered, idx);
    wireRows();
  };
}

function openPatPpnPicker(row){
  closeModal();
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.innerHTML = tplPatPpnPicker();
  document.body.appendChild(overlay);
  document.getElementById('modalClose').onclick = closeModal;
  document.getElementById('modalCancel').onclick = closeModal;
  overlay.onclick = (e) => { if(e.target === overlay) closeModal(); };
  document.getElementById('patPickPpn11').onclick = () => {
    row.ppnMode = 'eksklusif';
    const radio = document.querySelector('input[name="patPpnMode"][value="eksklusif"]');
    if(radio) radio.checked = true;
    patRecalcTotals(row);
    refreshPatTotalsDOM(row);
    closeModal();
  };
}

function openPatAkunPicker(idx, row){
  closeModal();
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.innerHTML = tplPatAkunPicker(DATA.akunGL);
  document.body.appendChild(overlay);
  document.getElementById('modalClose').onclick = closeModal;
  document.getElementById('modalCancel').onclick = closeModal;
  overlay.onclick = (e) => { if(e.target === overlay) closeModal(); };
  const wireRows = () => {
    overlay.querySelectorAll('[data-pat-pick-akun]').forEach(btn => btn.onclick = () => {
      const kode = btn.dataset.patPickAkun;
      row.jurnalAkun[idx].kodeAkun = kode;
      row.jurnalAkun[idx].namaAkun = patAkunNama(kode);
      document.querySelector(`[data-pat-jurnal-kode="${idx}"]`).value = kode;
      document.querySelector(`[data-pat-jurnal-nama="${idx}"]`).value = patAkunNama(kode);
      closeModal();
    });
  };
  wireRows();
  document.getElementById('patAkunPickerSearch').oninput = (e) => {
    const q = e.target.value.trim().toLowerCase();
    const filtered = DATA.akunGL.filter(a => a.kode.toLowerCase().includes(q) || a.nama.toLowerCase().includes(q));
    document.getElementById('patAkunPickerBody').innerHTML = tplPatAkunPickerRows(filtered);
    wireRows();
  };
}

function openPatDeleteConfirm(idx){
  closeModal();
  const row = DATA.pembelianAktivaTetap[idx];
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.innerHTML = tplPatDeleteConfirm(row);
  document.body.appendChild(overlay);
  document.getElementById('modalClose').onclick = closeModal;
  document.getElementById('modalCancel').onclick = closeModal;
  overlay.onclick = (e) => { if(e.target === overlay) closeModal(); };
  document.getElementById('modalDelete').onclick = () => {
    DATA.pembelianAktivaTetap.splice(idx, 1);
    closeModal();
    renderPatTable();
  };
}

function openPatInfo(title, text){
  closeModal();
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.innerHTML = tplPatInfoModal(title, text);
  document.body.appendChild(overlay);
  document.getElementById('modalClose').onclick = closeModal;
  document.getElementById('modalOk').onclick = closeModal;
  overlay.onclick = (e) => { if(e.target === overlay) closeModal(); };
}
