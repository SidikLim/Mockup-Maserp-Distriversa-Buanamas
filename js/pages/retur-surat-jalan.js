/* =========================================================
   LOGIC (JS saja) — Retur Surat Jalan (Customer & Penjualan >
   Daftar Transaksi). Dimuat otomatis (lazy-load) oleh core.js
   saat menu ini pertama kali diklik — lihat PAGE_MODULES di
   js/core.js. Markup HTML-nya ada di file sebelah:
   retur-surat-jalan.template.js (lihat catatan desain lengkap
   di headernya). NB: closeModal() dipakai bersama, didefinisikan
   di core.js.

   Alur inti:
   1) Pilih Surat Jalan (openRsjSjPicker — tombol cari di field
      No. SJ) -> rsjApplySj() mengisi Cabang/No. S.O./Tgl. S.O./
      Customer (+ kode lama)/No. SP/Alamat + tabel item per batch
      dari invoice/SJ terpilih (DATA.invoices — Gudang/Kode/Nama/
      Satuan/Batch/Qty SJ terkunci; yang diedit user: Batch
      Number, Tgl Expired, Qty Retur Batch (maks qty SJ), Tukar
      Batch + Batch Number Baru).
   2) Tab "Rincian Jurnal Akun": Buat Jurnal (mode Otomatis)
      membangun Persediaan Barang 1130001(D) = HPP Barang Dagang
      5110001(K) senilai total qty retur x harga master barang
      (DATA.items) — barang kembali masuk stok, membalik jurnal
      HPP pengiriman; mode Manual bebas edit + picker Akun GL +
      dropdown Cost Center, validasi balance saat Simpan.
   3) Alasan Tipe mengisi otomatis textarea Alasan dengan kalimat
      baku (RSJ_ALASAN_TIPE) — teks tetap bisa diedit manual.
   4) Simpan -> unshift/replace di DATA.returSuratJalan. Dokumen
      bisa di-Ubah (kolom Ubah di list, beda dari Retur Pembelian
      yang final).
========================================================= */
function renderReturSuratJalanPage(){
  renderRsjList();
}

var rsjState = { search:'' };

function renderRsjList(){
  rsjState = { search:'' };
  content.innerHTML = tplReturSuratJalanListPage();
  document.getElementById('btnRsjAdd').onclick = () => openRsjForm('add');
  document.getElementById('rsjSearch').oninput = (e) => { rsjState.search = e.target.value; renderRsjTable(); };
  renderRsjTable();
}

function rsjFilteredRows(){
  const q = rsjState.search.trim().toLowerCase();
  if(!q) return DATA.returSuratJalan || [];
  return (DATA.returSuratJalan || []).filter(r =>
    r.no.toLowerCase().includes(q) ||
    (r.noSJ || '').toLowerCase().includes(q) ||
    (r.noSO || '').toLowerCase().includes(q) ||
    (r.customer || '').toLowerCase().includes(q));
}

function renderRsjTable(){
  const rows = rsjFilteredRows();
  const tbody = document.getElementById('rsjTbody');
  tbody.innerHTML = tplRsjRows(rows);
  document.getElementById('rsjTotal').textContent = `Total Record: ${rows.length}`;
  const idxOf = (r) => DATA.returSuratJalan.indexOf(r);
  tbody.querySelectorAll('[data-view-link]').forEach(b => b.onclick = () => openRsjForm('view', idxOf(rows[+b.dataset.viewLink])));
  tbody.querySelectorAll('[data-view]').forEach(b => b.onclick = () => openRsjForm('view', idxOf(rows[+b.dataset.view])));
  tbody.querySelectorAll('[data-edit]').forEach(b => b.onclick = () => openRsjForm('edit', idxOf(rows[+b.dataset.edit])));
  tbody.querySelectorAll('[data-del]').forEach(b => b.onclick = () => openRsjDeleteConfirm(idxOf(rows[+b.dataset.del])));
}

/* No. Retur SJ format screenshot: "RSJ/YGY/260800005" =
   RSJ/{kode cabang}/{YY}{MM}{urut 5 digit per cabang}. */
function rsjGenerateNo(cabang){
  const kode = RSJ_CABANG_CODE[cabang] || 'XXX';
  const seq = (DATA.returSuratJalan || []).filter(r => r.cabang === cabang).length + 1;
  return `RSJ/${kode}/2608${String(seq).padStart(5,'0')}`;
}

/* Nilai barang diretur utk jurnal = qty retur x harga master barang. */
function rsjNilaiRetur(row){
  return Math.round((row.items || []).reduce((s,it) => {
    const master = DATA.items.find(x => x.kode === it.kode);
    return s + (+it.qtyRetur || 0) * (master ? (+master.harga || 0) : 0);
  }, 0) * 100) / 100;
}

function rsjJurnalTotals(row){
  const list = row.jurnalAkun || [];
  const debit = Math.round(list.reduce((s,e) => s + (+e.debit||0), 0) * 100) / 100;
  const kredit = Math.round(list.reduce((s,e) => s + (+e.kredit||0), 0) * 100) / 100;
  return { debit, kredit, selisih: Math.round((debit - kredit) * 100) / 100 };
}

function rsjBuildJurnalOtomatis(row){
  const nilai = rsjNilaiRetur(row);
  if(!(nilai > 0)){ row.jurnalAkun = []; return; }
  const ket = `RETUR SJ ${row.noSJ||''} ${(row.customer||'').toUpperCase()}`.trim();
  row.jurnalAkun = [
    { kodeAkun:'1130001', costCenter:'', namaAkun: rsjAkunNama('1130001')||'Persediaan Barang Dagang', keterangan: ket, debit: nilai, kredit: 0 },
    { kodeAkun:'5110001', costCenter:'', namaAkun: rsjAkunNama('5110001')||'HPP Barang Dagang', keterangan: ket, debit: 0, kredit: nilai },
  ];
}

/* Mengisi form + tabel item dari 1 invoice/SJ terpilih (DATA.invoices). */
function rsjApplySj(row, inv){
  row.noSJ = inv.noSJ;
  row.noSO = inv.noSO || '';
  row.tglSO = inv.tgl || '';
  row.cabang = inv.cabang || row.cabang;
  row.customer = inv.customerNama || '';
  row.customerKode = inv.customerKode || '';
  row.noSP = inv.noSP || '';
  row.alamatPengiriman = inv.customerAlamat || '';
  row.items = (inv.items || []).map(it => ({
    gudang: RSJ_CABANG_CODE[inv.cabang] || '',
    kode: it.kode, nama: it.nama, satuan: it.satuan || '',
    batch: it.batch || '', qtySJ: it.qtyKirim != null ? it.qtyKirim : (it.qtyPesan || 0),
    ed: it.ed || '', qtyRetur: it.qtyKirim != null ? it.qtyKirim : (it.qtyPesan || 0),
    tukarBatch: false, batchBaru: '',
  }));
}

function rsjBuildEmptyRow(){
  const cabang0 = RSJ_CABANG_LIST[0];
  return {
    no: rsjGenerateNo(cabang0), cabang: cabang0, tglRSJ: '31/08/2026', tglPrint: '',
    noSJ: '', noSO: '', tglSO: '', noSP: '', customer: '', customerKode: '',
    salesman: DATA.salesman.length ? DATA.salesman[0].nama : '', alamatPengiriman: '',
    items: [], jurnalMode: 'otomatis', jurnalAkun: [],
    alasanTipe: 'Kesalahan DPF/L', alasanSub: '', alasanText: RSJ_ALASAN_TIPE['Kesalahan DPF/L'],
  };
}

function openRsjForm(mode, idx){
  const src = mode === 'add' ? rsjBuildEmptyRow() : DATA.returSuratJalan[idx];
  const row = {
    ...src,
    items: (src.items||[]).map(it => ({...it})),
    jurnalAkun: (src.jurnalAkun||[]).map(e => ({...e})),
  };
  content.innerHTML = tplRsjForm(mode, row);
  wireRsjForm(mode, idx, row);
}

/* ===== refresh DOM per bagian ===== */
function refreshRsjItemsDOM(row, isView){
  document.getElementById('rsjItemsBody').innerHTML = tplRsjItemRows(row.items, isView);
  document.getElementById('rsjItemsEmptyHint').style.display = row.items.length ? 'none' : '';
  wireRsjItemEvents(row);
  if(row.jurnalMode === 'otomatis'){ rsjBuildJurnalOtomatis(row); refreshRsjJurnalContent(row, isView); }
}

function refreshRsjJurnalContent(row, isView){
  const el = document.getElementById('rsjTabJurnalContent');
  if(!el) return;
  const visible = el.style.display !== 'none';
  el.innerHTML = tplRsjJurnalContent(row, isView);
  el.style.display = visible ? '' : 'none';
  wireRsjJurnalEvents(row, isView);
}

function refreshRsjJurnalSelisih(row){
  const el = document.getElementById('rsjJurnalSelisih');
  if(!el) return;
  const totals = rsjJurnalTotals(row);
  el.value = rsjNum2(totals.selisih);
  el.style.color = Math.abs(totals.selisih) > 0.004 ? 'var(--red)' : 'var(--text)';
}

function wireRsjItemEvents(row){
  (row.items||[]).forEach((it, idx) => {
    const batch = document.querySelector(`[data-rsj-batch="${idx}"]`);
    if(batch) batch.onchange = (e) => { it.batch = e.target.value; };
    const ed = document.querySelector(`[data-rsj-ed="${idx}"]`);
    if(ed) ed.onchange = (e) => { it.ed = e.target.value; };
    const qty = document.querySelector(`[data-rsj-qty="${idx}"]`);
    if(qty) qty.onchange = (e) => {
      let q = +e.target.value || 0;
      if(q > (+it.qtySJ || 0)){
        openRsjInfo('Validasi', `Qty Retur Batch (${q}) tidak boleh melebihi Qty SJ Batch (${it.qtySJ}).`);
        q = +it.qtySJ || 0;
        e.target.value = q;
      }
      it.qtyRetur = q;
      if(row.jurnalMode === 'otomatis'){ rsjBuildJurnalOtomatis(row); refreshRsjJurnalContent(row, false); }
    };
    const tukar = document.querySelector(`[data-rsj-tukar="${idx}"]`);
    if(tukar) tukar.onchange = (e) => {
      it.tukarBatch = e.target.checked;
      const bb = document.querySelector(`[data-rsj-batchbaru="${idx}"]`);
      if(bb){ bb.disabled = !it.tukarBatch; if(!it.tukarBatch){ it.batchBaru=''; bb.value=''; } }
    };
    const bb = document.querySelector(`[data-rsj-batchbaru="${idx}"]`);
    if(bb) bb.onchange = (e) => { it.batchBaru = e.target.value; };
  });
}

function wireRsjJurnalEvents(row, isView){
  const btnOto = document.getElementById('rsjJurnalOtomatis');
  const btnManual = document.getElementById('rsjJurnalManual');
  if(btnOto) btnOto.onchange = () => {
    row.jurnalMode = 'otomatis';
    rsjBuildJurnalOtomatis(row);
    refreshRsjJurnalContent(row, isView);
  };
  if(btnManual) btnManual.onchange = () => {
    row.jurnalMode = 'manual';
    refreshRsjJurnalContent(row, isView);
  };

  const btnBuat = document.getElementById('rsjBuatJurnal');
  if(btnBuat) btnBuat.onclick = () => {
    if(!row.items.length){ openRsjInfo('Validasi', 'Pilih Surat Jalan dan pastikan ada Qty Retur terlebih dahulu.'); return; }
    rsjBuildJurnalOtomatis(row);
    refreshRsjJurnalContent(row, isView);
  };

  const addRow = document.getElementById('rsjJurnalAddRow');
  if(addRow) addRow.onclick = (e) => {
    e.preventDefault();
    row.jurnalAkun.push({ kodeAkun:'', costCenter:'', namaAkun:'', keterangan:(row.customer||'').toUpperCase(), debit:0, kredit:0 });
    refreshRsjJurnalContent(row, isView);
  };

  if(isView || row.jurnalMode !== 'manual') return;
  (row.jurnalAkun||[]).forEach((entry, idx) => {
    const cc = document.querySelector(`[data-rsj-jurnal-cc="${idx}"]`);
    if(cc) cc.onchange = () => { entry.costCenter = cc.value; };
    const ket = document.querySelector(`[data-rsj-jurnal-ket="${idx}"]`);
    if(ket) ket.onchange = () => { entry.keterangan = ket.value; };
    const deb = document.querySelector(`[data-rsj-jurnal-debit="${idx}"]`);
    if(deb) deb.onchange = () => { entry.debit = +deb.value || 0; refreshRsjJurnalSelisih(row); };
    const kre = document.querySelector(`[data-rsj-jurnal-kredit="${idx}"]`);
    if(kre) kre.onchange = () => { entry.kredit = +kre.value || 0; refreshRsjJurnalSelisih(row); };
    const del = document.querySelector(`[data-rsj-jurnal-del="${idx}"]`);
    if(del) del.onclick = () => { row.jurnalAkun.splice(idx,1); refreshRsjJurnalContent(row, isView); };
    const search = document.querySelector(`[data-rsj-jurnal-akun-search="${idx}"]`);
    if(search) search.onclick = () => openRsjAkunPicker(idx, row);
  });
}

function wireRsjForm(mode, idx, row){
  const isAdd = mode === 'add';
  const isView = mode === 'view';

  const tabDetailBtn = document.getElementById('rsjTabDetailBtn');
  const tabJurnalBtn = document.getElementById('rsjTabJurnalBtn');
  const detailContent = document.getElementById('rsjTabDetailContent');
  const jurnalContent = document.getElementById('rsjTabJurnalContent');
  tabDetailBtn.onclick = () => {
    tabDetailBtn.classList.add('active'); tabJurnalBtn.classList.remove('active');
    detailContent.style.display = ''; jurnalContent.style.display = 'none';
  };
  tabJurnalBtn.onclick = () => {
    tabJurnalBtn.classList.add('active'); tabDetailBtn.classList.remove('active');
    if(!isView && row.jurnalMode === 'otomatis') rsjBuildJurnalOtomatis(row);
    refreshRsjJurnalContent(row, isView);
    jurnalContent.style.display = ''; detailContent.style.display = 'none';
  };

  document.getElementById('btnRsjTutorial').onclick = () => openRsjInfo('Tutorial', 'Video tutorial pengisian Retur Surat Jalan akan tersedia di sini.');
  document.getElementById('rsjBatalkan').onclick = (e) => { e.preventDefault(); renderRsjList(); };

  wireRsjItemEvents(row);
  wireRsjJurnalEvents(row, isView);

  if(isView) return;

  if(isAdd){
    document.getElementById('rsjRefreshNo').onclick = () => {
      row.no = rsjGenerateNo(row.cabang);
      document.getElementById('fRsjNo').value = row.no;
    };
  }

  document.getElementById('fRsjTglRSJ').oninput = (e) => { row.tglRSJ = e.target.value; };
  document.getElementById('fRsjSalesman').onchange = (e) => { row.salesman = e.target.value; };
  document.getElementById('fRsjAlamat').onchange = (e) => { row.alamatPengiriman = e.target.value; };
  document.getElementById('rsjSjSearch').onclick = () => openRsjSjPicker(row, isAdd);

  document.getElementById('fRsjAlasanTipe').onchange = (e) => {
    row.alasanTipe = e.target.value;
    row.alasanText = RSJ_ALASAN_TIPE[row.alasanTipe] || '';
    document.getElementById('fRsjAlasanText').value = row.alasanText;
  };
  document.getElementById('fRsjAlasanSub').onchange = (e) => { row.alasanSub = e.target.value; };
  document.getElementById('fRsjAlasanText').onchange = (e) => { row.alasanText = e.target.value; };

  document.getElementById('rsjSimpan').onclick = () => {
    if(!row.noSJ){ openRsjInfo('Validasi', 'Surat Jalan wajib dipilih (tombol cari di field No. SJ).'); return; }
    const adaQty = row.items.some(it => (+it.qtyRetur||0) > 0);
    if(!adaQty){ openRsjInfo('Validasi', 'Isi Qty Retur Batch minimal 1 barang.'); return; }
    if(row.jurnalMode === 'otomatis'){
      rsjBuildJurnalOtomatis(row);
    } else {
      const totals = rsjJurnalTotals(row);
      if(Math.abs(totals.selisih) > 0.004){
        openRsjInfo('Validasi', `Rincian Jurnal Akun belum balance — Jumlah Debit - Kredit = <b>${rsjNum2(totals.selisih)}</b>. Samakan total Debit dan Kredit terlebih dahulu.`);
        return;
      }
    }
    if(mode === 'add'){ DATA.returSuratJalan.unshift(row); }
    else { DATA.returSuratJalan[idx] = row; }
    renderRsjList();
  };
}

function openRsjSjPicker(row, isAdd){
  closeModal();
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.innerHTML = tplRsjSjPicker(DATA.invoices);
  document.body.appendChild(overlay);
  document.getElementById('modalClose').onclick = closeModal;
  document.getElementById('modalCancel').onclick = closeModal;
  overlay.onclick = (e) => { if(e.target === overlay) closeModal(); };

  const wireRows = () => {
    overlay.querySelectorAll('[data-pick-sj]').forEach(btn => btn.onclick = () => {
      const inv = DATA.invoices.find(f => f.noSJ === btn.dataset.pickSj);
      if(!inv) return;
      rsjApplySj(row, inv);
      if(isAdd){ row.no = rsjGenerateNo(row.cabang); document.getElementById('fRsjNo').value = row.no; }
      document.getElementById('fRsjNoSJ').value = row.noSJ;
      document.getElementById('fRsjCabang').value = row.cabang;
      document.getElementById('fRsjNoSO').value = row.noSO;
      document.getElementById('fRsjTglSO').value = row.tglSO;
      document.getElementById('fRsjCustomer').value = (row.customer||'').toUpperCase();
      document.getElementById('fRsjKodeLama').textContent = row.customerKode ? 'Kode Lama Customer: ' + row.customerKode : '';
      document.getElementById('fRsjNoSP').value = row.noSP;
      document.getElementById('fRsjAlamat').value = row.alamatPengiriman;
      refreshRsjItemsDOM(row, false);
      closeModal();
    });
  };
  wireRows();

  document.getElementById('rsjSjPickerSearch').oninput = (e) => {
    const q = e.target.value.trim().toLowerCase();
    const filtered = DATA.invoices.filter(f =>
      (f.noSJ||'').toLowerCase().includes(q) ||
      (f.noSO||'').toLowerCase().includes(q) ||
      (f.customerNama||'').toLowerCase().includes(q));
    document.getElementById('rsjSjPickerBody').innerHTML = tplRsjSjPickerRows(filtered);
    wireRows();
  };
}

function openRsjAkunPicker(idx, row){
  closeModal();
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.innerHTML = tplRsjAkunPicker(DATA.akunGL);
  document.body.appendChild(overlay);
  document.getElementById('modalClose').onclick = closeModal;
  document.getElementById('modalCancel').onclick = closeModal;
  overlay.onclick = (e) => { if(e.target === overlay) closeModal(); };

  const wireRows = () => {
    overlay.querySelectorAll('[data-rsj-pick-akun]').forEach(btn => btn.onclick = () => {
      const kode = btn.dataset.rsjPickAkun;
      row.jurnalAkun[idx].kodeAkun = kode;
      row.jurnalAkun[idx].namaAkun = rsjAkunNama(kode);
      document.querySelector(`[data-rsj-jurnal-kode="${idx}"]`).value = kode;
      document.querySelector(`[data-rsj-jurnal-nama="${idx}"]`).value = rsjAkunNama(kode);
      closeModal();
    });
  };
  wireRows();

  document.getElementById('rsjAkunPickerSearch').oninput = (e) => {
    const q = e.target.value.trim().toLowerCase();
    const filtered = DATA.akunGL.filter(a => a.kode.toLowerCase().includes(q) || a.nama.toLowerCase().includes(q));
    document.getElementById('rsjAkunPickerBody').innerHTML = tplRsjAkunPickerRows(filtered);
    wireRows();
  };
}

function openRsjDeleteConfirm(idx){
  closeModal();
  const row = DATA.returSuratJalan[idx];
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.innerHTML = tplRsjDeleteConfirm(row);
  document.body.appendChild(overlay);
  document.getElementById('modalClose').onclick = closeModal;
  document.getElementById('modalCancel').onclick = closeModal;
  overlay.onclick = (e) => { if(e.target === overlay) closeModal(); };
  document.getElementById('modalDelete').onclick = () => {
    DATA.returSuratJalan.splice(idx, 1);
    closeModal();
    renderRsjTable();
  };
}

function openRsjInfo(title, text){
  closeModal();
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.innerHTML = tplRsjInfoModal(title, text);
  document.body.appendChild(overlay);
  document.getElementById('modalClose').onclick = closeModal;
  document.getElementById('modalOk').onclick = closeModal;
  overlay.onclick = (e) => { if(e.target === overlay) closeModal(); };
}
