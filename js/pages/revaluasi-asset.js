/* =========================================================
   LOGIC (JS saja) — Revaluasi Asset (Aktiva Tetap > Daftar
   Transaksi > Revaluasi Asset, page:'revaluasiAsset'). Dimuat
   otomatis (lazy-load) oleh core.js saat menu ini pertama kali
   diklik — lihat PAGE_MODULES di js/core.js. Markup HTML-nya
   ada di file sebelah: revaluasi-asset.template.js. NB:
   closeModal() dipakai bersama, didefinisikan di core.js.

   BEDA MENDASAR dgn Disposal Asset: modul ini TIDAK menghitung
   penyusutan sama sekali — tidak ada tarif/masa-susut yg dipakai
   di sini. Satu-satunya field yg genuinely berefek adalah
   "Nominal" per baris item: ditambahkan/dikurangkan langsung ke
   `hargaBeli` aset terkait di DATA.aktivaTetap saat Simpan (mode
   Tambah). Field "Tahun"/"Bulan" (Penambahan/Pengurangan Masa
   Susut) HANYA disimpan sbg data informasional di baris item —
   tidak ada model "skedul penyusutan per-aset" yg diperpanjang,
   krn Masa Susut ditentukan oleh Aturan Penyusutan yg dipakai
   BERSAMA banyak aset lain (DATA.aktivaTetapDeprRule) — mengubah
   per-transaksi akan mengubah aset lain yg memakai Aturan yg sama.
   Simplifikasi ini didokumentasikan eksplisit, bukan bug (lihat
   juga catatan sama di revaluasi-asset.template.js).

   Menyimpan transaksi Revaluasi BARU (mode 'add') MENERAPKAN
   Nominal tiap baris item ke `asset.hargaBeli` (bisa naik/turun,
   nominal boleh negatif). Meng-edit ulang (mode 'edit') transaksi
   yg SUDAH ADA HANYA memperbarui field deskriptif — TIDAK
   menerapkan ulang Nominal ke hargaBeli (disederhanakan, sama
   alasan dgn Disposal Asset: menghindari kasus double-apply kalau
   baris item diganti saat edit, di luar cakupan mockup ini).
   Menghapus transaksi Revaluasi MENGEMBALIKAN hargaBeli aset
   terkait (nominal yg sudah diterapkan dikurangkan balik / dibalik
   tandanya) — reversal simetris kebalikan dari saat Simpan.

   "Jurnal" per baris item — dropdown ke DATA.jurnalFixedAsset
   difilter tipe==='Revaluasi', DIPILIH MANUAL oleh user (sama pola
   dgn Disposal Asset). Rincian jurnal (tab "Rincian Jurnal Akun")
   dibangun REAKTIF per baris item yg jurnal+nominalnya sudah
   diisi, dgn Debit/Kredit yg SWAP tergantung TANDA Nominal: kalau
   Nominal positif (nilai aset naik) → Debit akun Aktiva Tetap
   (jurnal.glDebit, akun EXISTING reuse '1510003' Kendaraan dkk) +
   Kredit akun "Selisih Revaluasi Aktiva Tetap" (jurnal.glKredit,
   akun BARU '3110002'); kalau Nominal negatif (nilai aset turun) →
   dibalik: Debit Selisih Revaluasi + Kredit akun Aktiva Tetap —
   masing² baris otomatis balance (Debit=Kredit=|Nominal|) by
   construction, pola sama Invoice Jurnal Otomatis (2026-08-19) &
   Disposal Asset (2026-08-26).

   Catatan DOM-sync: field Keterangan/Tgl. Trn./Tgl Mulai
   Susut/Cabang ada DI LUAR div tab yg di-re-render
   (#revTabDetailContent/#revTabJurnalContent) — beda dgn Memo
   Disposal Asset yg textarea-nya ada DI DALAM tab yg direfresh —
   jadi TIDAK perlu dibaca dari DOM dulu sebelum re-render di sini
   (tidak ada resiko kehilangan input seperti pola
   domSyncHeaderFromDOM()/promSyncCommonFromDOM() di modul lain).
   Input Tahun/Bulan/Nominal per baris item memakai event 'change'
   (bukan 'input') supaya tidak kehilangan fokus tiap ketik digit
   akibat innerHTML di-replace penuh saat re-render tabel/jurnal.
========================================================= */

let revState = { page: 1, search: '' };

function revAssetOf(kode){
  return DATA.aktivaTetap.find(a => a.kode === kode) || null;
}

function revAkunNamaOf(kode){
  if(!kode) return '';
  const a = DATA.akunGL.find(x => x.kode === kode);
  return a ? a.nama : '';
}

function revNum2(n){
  return Number(n||0).toLocaleString('id-ID', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function revRowNamaAset(row){
  const names = (row.items||[]).map(it => { const a = revAssetOf(it.kode); return a ? a.nama : null; }).filter(Boolean);
  return names.length ? names.join(', ') : '-';
}

function revRowJumlahAkhir(row){
  let total = 0;
  (row.items||[]).forEach(it => {
    const a = revAssetOf(it.kode);
    if(a) total += a.hargaBeli;
  });
  return total;
}

function revBuildJurnalLines(row){
  const lines = [];
  (row.items||[]).forEach(it => {
    const asset = revAssetOf(it.kode);
    const jurnal = it.jurnalKode ? DATA.jurnalFixedAsset.find(j => j.kode === it.jurnalKode) : null;
    const nominal = Number(it.nominal) || 0;
    if(!asset || !jurnal || !nominal) return;
    const abs = Math.abs(nominal);
    if(nominal > 0){
      lines.push({ akun: jurnal.glDebit, ket: `Kenaikan Nilai Aset — ${asset.nama}`, debit: abs, kredit: 0 });
      lines.push({ akun: jurnal.glKredit, ket: `Selisih Revaluasi — ${asset.nama}`, debit: 0, kredit: abs });
    } else {
      lines.push({ akun: jurnal.glKredit, ket: `Selisih Revaluasi — ${asset.nama}`, debit: abs, kredit: 0 });
      lines.push({ akun: jurnal.glDebit, ket: `Penurunan Nilai Aset — ${asset.nama}`, debit: 0, kredit: abs });
    }
  });
  return lines;
}

function revGenerateNumber(cabang){
  const code = REV_CABANG_CODE[cabang] || 'HO';
  const seq = DATA.revaluasiAsset.length + 1;
  return `26/REV/${code}/08/${String(seq).padStart(5,'0')}`;
}

function renderRevaluasiAssetPage(){
  renderRevList();
}

function renderRevList(){
  content.innerHTML = tplRevListPage();
  revState = { page: 1, search: '' };
  document.getElementById('btnRevAdd').onclick = () => openRevForm('add');
  document.getElementById('btnRevPeriode').onclick = () => revInfo('Periode', 'Filter periode ini contoh tampilan mockup (dekoratif) — daftar tetap menampilkan seluruh transaksi Revaluasi Asset.');
  document.getElementById('revPageSize').onchange = () => { revState.page = 1; renderRevTable(); };
  document.getElementById('revSearch').oninput = (e) => {
    revState.search = e.target.value.trim().toLowerCase();
    revState.page = 1;
    renderRevTable();
  };
  renderRevTable();
}

function revPageSize(){
  const sel = document.getElementById('revPageSize');
  return sel ? parseInt(sel.value, 10) : 20;
}

function revFilteredRows(){
  const q = revState.search;
  if(!q) return DATA.revaluasiAsset.slice();
  return DATA.revaluasiAsset.filter(r =>
    r.noTransaksi.toLowerCase().includes(q) ||
    (r.keterangan||'').toLowerCase().includes(q) ||
    revRowNamaAset(r).toLowerCase().includes(q));
}

function renderRevTable(){
  const perPage = revPageSize();
  const filtered = revFilteredRows();
  const totalPages = Math.max(1, Math.ceil(filtered.length/perPage));
  if(revState.page > totalPages) revState.page = totalPages;
  if(revState.page < 1) revState.page = 1;
  const start = (revState.page-1)*perPage;
  const pageRows = filtered.slice(start, start+perPage);

  document.getElementById('revTbody').innerHTML = tplRevRows(pageRows);
  document.getElementById('revTotal').textContent = `Total Record: ${filtered.length}`;
  document.getElementById('revPager').innerHTML = tplRevPager(revState.page, totalPages);

  const tbody = document.getElementById('revTbody');
  tbody.querySelectorAll('[data-edit]').forEach(b => b.onclick = (e) => { e.preventDefault(); openRevForm('edit', +b.dataset.edit); });
  tbody.querySelectorAll('[data-del]').forEach(b => b.onclick = () => openRevDeleteConfirm(+b.dataset.del));

  document.getElementById('revPager').querySelectorAll('[data-revpage]').forEach(b => b.onclick = () => { revState.page = +b.dataset.revpage; renderRevTable(); });
}

function revEmptyRow(){
  return {
    noTransaksi: revGenerateNumber('Head Office'),
    tglTrn: '26/08/2026',
    tglMulaiSusut: '',
    cabang: 'Head Office',
    keterangan: '',
    items: [{ kode: '', jurnalKode: '', tahun: 0, bulan: 0, nominal: 0 }],
  };
}

function openRevForm(mode, idx){
  const row = mode === 'edit' ? DATA.revaluasiAsset[idx] : revEmptyRow();
  renderRevFormBody(mode, row, idx);
}

function renderRevFormBody(mode, row, idx){
  content.innerHTML = tplRevForm(mode, row);
  wireRevForm(mode, row, idx);
}

function wireRevForm(mode, row, idx){
  document.getElementById('btnRevCancel').onclick = () => renderRevList();
  document.getElementById('btnRevSave').onclick = () => revSave(mode, row, idx);
  document.getElementById('btnRevRefreshNo').onclick = () => {
    row.noTransaksi = revGenerateNumber(row.cabang);
    document.getElementById('fRevNoTransaksi').value = row.noTransaksi;
  };
  document.getElementById('fRevCabang').onchange = (e) => { row.cabang = e.target.value; };
  document.getElementById('fRevTglTrn').onchange = (e) => { row.tglTrn = e.target.value.trim(); };
  document.getElementById('fRevTglMulaiSusut').onchange = (e) => { row.tglMulaiSusut = e.target.value.trim(); };

  document.getElementById('revTabDetailBtn').onclick = () => revSwitchTab('detail');
  document.getElementById('revTabJurnalBtn').onclick = () => revSwitchTab('jurnal');

  document.getElementById('btnRevItemAdd').onclick = () => {
    row.items.push({ kode: '', jurnalKode: '', tahun: 0, bulan: 0, nominal: 0 });
    refreshRevDetailTab(row);
  };

  wireRevItemRows(row);
}

function revSwitchTab(which){
  const btnDetail = document.getElementById('revTabDetailBtn');
  const btnJurnal = document.getElementById('revTabJurnalBtn');
  const contentDetail = document.getElementById('revTabDetailContent');
  const contentJurnal = document.getElementById('revTabJurnalContent');
  if(which === 'jurnal'){
    btnJurnal.classList.add('active'); btnDetail.classList.remove('active');
    contentJurnal.style.display = ''; contentDetail.style.display = 'none';
  } else {
    btnDetail.classList.add('active'); btnJurnal.classList.remove('active');
    contentDetail.style.display = ''; contentJurnal.style.display = 'none';
  }
}

/* Re-render tab Rincian Transaksi/Rincian Jurnal Akun — dipicu
   tambah/hapus baris, pilih aset, ganti Jurnal, atau ganti
   Nominal. Field header (Keterangan/Tgl./Cabang) ada DI LUAR area
   yg direplace di sini jadi tidak perlu disinkron dari DOM dulu
   (lihat catatan besar di atas file ini). */
function refreshRevDetailTab(row){
  document.getElementById('revTabDetailContent').innerHTML = tplRevDetailTab(row);
  document.getElementById('revTabJurnalContent').innerHTML = tplRevJurnalTab(row);
  wireRevItemRows(row);
}

function wireRevItemRows(row){
  const body = document.getElementById('revItemsBody');
  if(!body) return;
  body.querySelectorAll('[data-revaset-pick]').forEach(b => b.onclick = () => openRevAsetPicker(+b.dataset.revasetPick, row));
  body.querySelectorAll('[data-revjurnal]').forEach(sel => sel.onchange = (e) => {
    const idx = +sel.dataset.revjurnal;
    row.items[idx].jurnalKode = e.target.value ? +e.target.value : '';
    refreshRevDetailTab(row);
  });
  body.querySelectorAll('[data-revtahun]').forEach(inp => inp.onchange = (e) => {
    row.items[+inp.dataset.revtahun].tahun = Number(e.target.value) || 0;
  });
  body.querySelectorAll('[data-revbulan]').forEach(inp => inp.onchange = (e) => {
    row.items[+inp.dataset.revbulan].bulan = Number(e.target.value) || 0;
  });
  body.querySelectorAll('[data-revnominal]').forEach(inp => inp.onchange = (e) => {
    row.items[+inp.dataset.revnominal].nominal = Number(e.target.value) || 0;
    refreshRevDetailTab(row);
  });
  body.querySelectorAll('[data-revitem-del]').forEach(b => b.onclick = () => {
    row.items.splice(+b.dataset.revitemDel, 1);
    refreshRevDetailTab(row);
  });
}

function openRevAsetPicker(itemIdx, row){
  closeModal();
  const usedKodes = row.items.map(it => it.kode).filter(Boolean);
  const list = DATA.aktivaTetap.filter(a => !a.disposalNo && !usedKodes.includes(a.kode));
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.innerHTML = tplRevAsetPicker(list);
  document.body.appendChild(overlay);
  document.getElementById('pickerClose').onclick = closeModal;
  document.getElementById('pickerCancel').onclick = closeModal;
  overlay.onclick = (e) => { if(e.target === overlay) closeModal(); };
  const search = document.getElementById('revAsetPickerSearch');
  if(search) search.oninput = (e) => {
    const q = e.target.value.toLowerCase();
    const filtered = list.filter(a => a.kode.toLowerCase().includes(q) || a.nama.toLowerCase().includes(q));
    document.getElementById('revAsetPickerBody').innerHTML = tplRevAsetPickerRows(filtered);
    wireRevAsetPickerRows(overlay, itemIdx, row);
  };
  wireRevAsetPickerRows(overlay, itemIdx, row);
}

function wireRevAsetPickerRows(overlay, itemIdx, row){
  overlay.querySelectorAll('[data-pick-aset]').forEach(btn => {
    btn.onclick = () => {
      row.items[itemIdx].kode = btn.dataset.pickAset;
      closeModal();
      refreshRevDetailTab(row);
    };
  });
}

function revInfo(title, text){
  closeModal();
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.innerHTML = tplRevInfoModal(title, text);
  document.body.appendChild(overlay);
  document.getElementById('modalClose').onclick = closeModal;
  document.getElementById('modalOk').onclick = closeModal;
}

function revSave(mode, row, idx){
  row.tglTrn = document.getElementById('fRevTglTrn').value.trim() || row.tglTrn;
  row.tglMulaiSusut = document.getElementById('fRevTglMulaiSusut').value.trim();
  row.cabang = document.getElementById('fRevCabang').value;
  row.keterangan = document.getElementById('fRevKeterangan').value.trim();

  const validItems = row.items.filter(it => it.kode && Number(it.nominal));
  if(!validItems.length){
    return revValidationError('Minimal 1 baris dengan Kode Aset & Nominal (tidak boleh 0) wajib diisi.');
  }
  row.items = validItems;

  if(mode === 'add'){
    DATA.revaluasiAsset.unshift(row);
    // Terapkan Nominal ke hargaBeli aset terkait — HANYA utk
    // transaksi baru (lihat catatan besar di atas file ini kenapa
    // ini HANYA dijalankan utk transaksi baru).
    row.items.forEach(it => {
      const asset = revAssetOf(it.kode);
      if(asset) asset.hargaBeli = (asset.hargaBeli||0) + (Number(it.nominal)||0);
    });
  }

  renderRevList();
}

function revValidationError(text){
  const el = document.getElementById('fRevErr');
  el.textContent = text;
  el.style.display = 'block';
}

function openRevDeleteConfirm(idx){
  closeModal();
  const row = DATA.revaluasiAsset[idx];
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.innerHTML = tplRevDeleteConfirm(row);
  document.body.appendChild(overlay);
  document.getElementById('modalClose').onclick = closeModal;
  document.getElementById('modalCancel').onclick = closeModal;
  overlay.onclick = (e) => { if(e.target === overlay) closeModal(); };
  document.getElementById('modalDelete').onclick = () => {
    // Reversal simetris — kebalikan dari penerapan Nominal saat Simpan.
    row.items.forEach(it => {
      const asset = revAssetOf(it.kode);
      if(asset) asset.hargaBeli = (asset.hargaBeli||0) - (Number(it.nominal)||0);
    });
    DATA.revaluasiAsset.splice(idx, 1);
    closeModal();
    renderRevTable();
  };
}
