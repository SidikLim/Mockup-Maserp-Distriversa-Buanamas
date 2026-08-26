/* =========================================================
   LOGIC (JS saja) — Disposal Asset (Aktiva Tetap > Daftar
   Transaksi > Disposal Asset, page:'disposalAsset'). Dimuat
   otomatis (lazy-load) oleh core.js saat menu ini pertama kali
   diklik — lihat PAGE_MODULES di js/core.js. Markup HTML-nya
   ada di file sebelah: disposal-asset.template.js. NB:
   closeModal() dipakai bersama, didefinisikan di core.js.

   atDeprTarifDis() adalah SALINAN LOKAL formula atDeprTarif() di
   aktiva-tetap-depr-rule.js (bukan reference cross-file — lazy-
   load antar modul tidak terjamin urutannya, lihat konvensi
   "Salinan lokal, bukan reference cross-file" di catatan
   project). Akumulasi Penyusutan & Harga Perolehan per baris
   item TIDAK disimpan redundan — selalu computed LIVE dari
   DATA.aktivaTetap (aset asli) + Tgl. Transaksi transaksi ini
   via disHitungSusut(), pola sama "computed bukan disimpan"
   Nilai Susut/Masa Susut di Master Fixed Asset. Selalu memakai
   tarif Straight Line utk perhitungan Akumulasi Penyusutan
   (metodePenyusutan asli aset diabaikan di sini — simplifikasi,
   konsisten precedent lain di mockup ini yang tidak memodelkan
   skedul Declining Balance penuh/amortisasi bertingkat).

   Menyimpan transaksi Disposal BARU (mode 'add') MENGUNCI aset
   terkait: field `disposalNo` di DATA.aktivaTetap diisi No.
   Transaksi ini + status di-set 'Non Active' — aset yang sudah
   di-disposal TIDAK muncul lagi di picker "Pilih Fixed Asset"
   utk transaksi Disposal baru (dicocokkan `!a.disposalNo`).
   Meng-edit ulang (mode 'edit') transaksi yang SUDAH ADA HANYA
   memperbarui field deskriptif (Tgl./Cabang/Memo/pilihan Jurnal)
   — TIDAK mengunci ulang aset lain (disederhanakan, menghindari
   kasus double-lock/unlock kalau baris item diganti saat edit,
   di luar cakupan mockup ini). Menghapus transaksi Disposal
   MENGEMBALIKAN aset terkait (disposalNo dikosongkan) — status
   aktif/non-aktifnya TIDAK ikut dikembalikan otomatis ke
   'Active' (tetap keputusan manual user via Ubah Status di
   Master Fixed Asset, supaya tidak menimpa nilai status yang
   mungkin sudah diubah manual sebelum/sesudah disposal).

   "Jurnal" per baris item — dropdown ke DATA.jurnalFixedAsset
   difilter tipe==='Disposal', DIPILIH MANUAL oleh user (tidak
   auto-match by golongan aset — screenshot menampilkan dropdown
   kosong "--- Pilih Jurnal ---" tanpa auto-select). Rincian
   jurnal (tab "Account Journal Details") dibangun REAKTIF per
   baris item yang jurnalnya sudah dipilih: Debit akun Akm.
   Penyusutan aset (glAkmSusut — akun NYATA milik aset itu sendiri
   dari modul Master Fixed Asset, BUKAN dari template Jurnal) +
   Debit akun Kerugian Pelepasan (jurnal.glDebit, akun BARU
   '6510004') sebesar Nilai Buku Bersih (NBV = Harga Perolehan −
   Akm. Penyusutan) + Kredit akun Aktiva Tetap (jurnal.glKredit,
   akun EXISTING '1510003' Kendaraan dkk — reuse header AKTIVA
   TETAP 1500000 & akun cost per-kategori yang sudah ada sejak
   awal DATA.akunGL) sebesar Harga Perolehan penuh — identitas
   AkmSusut+NBV=HargaPerolehan menjamin jurnal SELALU balance by
   construction, pola sama Invoice Jurnal Otomatis (2026-08-19).
========================================================= */

let disState = { page: 1, search: '' };

function atDeprTarifDis(masaSusut){
  const m = Number(masaSusut) || 1;
  return { sl: 100/m, db: 200/m };
}

function disAssetOf(kode){
  return DATA.aktivaTetap.find(a => a.kode === kode) || null;
}

function disAkunNamaOf(kode){
  if(!kode) return '';
  const a = DATA.akunGL.find(x => x.kode === kode);
  return a ? a.nama : '';
}

function disYearsBetween(dmy1, dmy2){
  const parse = s => { const p = (s||'').split('/'); return new Date(+p[2]||2026, (+p[1]||1)-1, +p[0]||1); };
  const days = (parse(dmy2) - parse(dmy1)) / 86400000;
  return days / 365.25;
}

function disHitungSusut(asset, tglTrn){
  if(!asset) return { akm: 0, nbv: 0 };
  if(asset.tidakPenyusutan || !asset.aturanKode) return { akm: 0, nbv: asset.hargaBeli };
  const aturan = DATA.aktivaTetapDeprRule.find(a => a.kodeKelompok === asset.aturanKode);
  if(!aturan) return { akm: 0, nbv: asset.hargaBeli };
  const tarif = atDeprTarifDis(aturan.masaSusut).sl;
  const years = Math.max(0, disYearsBetween(asset.tglMulaiSusut, tglTrn || asset.tglMulaiSusut));
  const maxAkm = Math.max(0, asset.hargaBeli - (asset.nilaiResidu||0));
  const akm = Math.min(maxAkm, asset.hargaBeli * (tarif/100) * years);
  return { akm, nbv: asset.hargaBeli - akm };
}

function disNum2(n){
  return Number(n||0).toLocaleString('id-ID', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function disRowTotals(row){
  let akm = 0, hargaPerolehan = 0;
  (row.items||[]).forEach(it => {
    const asset = disAssetOf(it.kode);
    if(!asset) return;
    akm += disHitungSusut(asset, row.tglTransaksi).akm;
    hargaPerolehan += asset.hargaBeli;
  });
  return { akm, hargaPerolehan };
}

function disBuildJurnalLines(row){
  const lines = [];
  (row.items||[]).forEach(it => {
    const asset = disAssetOf(it.kode);
    const jurnal = it.jurnalKode ? DATA.jurnalFixedAsset.find(j => j.kode === it.jurnalKode) : null;
    if(!asset || !jurnal) return;
    const { akm, nbv } = disHitungSusut(asset, row.tglTransaksi);
    if(akm > 0.5) lines.push({ akun: asset.glAkmSusut, ket: `Akumulasi Penyusutan — ${asset.nama}`, debit: akm, kredit: 0 });
    if(nbv > 0.5) lines.push({ akun: jurnal.glDebit, ket: `Kerugian Pelepasan Aset — ${asset.nama}`, debit: nbv, kredit: 0 });
    lines.push({ akun: jurnal.glKredit, ket: `Pelepasan Aset — ${asset.nama}`, debit: 0, kredit: asset.hargaBeli });
  });
  return lines;
}

function disGenerateNumber(cabang){
  const code = DIS_CABANG_CODE[cabang] || 'HO';
  const seq = DATA.disposalAsset.length + 1;
  return `26/DIS/${code}/08/${String(seq).padStart(5,'0')}`;
}

function renderDisposalAssetPage(){
  renderDisList();
}

function renderDisList(){
  content.innerHTML = tplDisListPage();
  disState = { page: 1, search: '' };
  document.getElementById('btnDisAdd').onclick = () => openDisForm('add');
  document.getElementById('btnDisPeriode').onclick = () => disInfo('Periode', 'Filter periode ini contoh tampilan mockup (dekoratif) — daftar tetap menampilkan seluruh transaksi Disposal Asset.');
  document.getElementById('disPageSize').onchange = () => { disState.page = 1; renderDisTable(); };
  document.getElementById('disSearch').oninput = (e) => {
    disState.search = e.target.value.trim().toLowerCase();
    disState.page = 1;
    renderDisTable();
  };
  renderDisTable();
}

function disPageSize(){
  const sel = document.getElementById('disPageSize');
  return sel ? parseInt(sel.value, 10) : 10;
}

function disFilteredRows(){
  const q = disState.search;
  if(!q) return DATA.disposalAsset.slice();
  return DATA.disposalAsset.filter(r =>
    r.noTransaksi.toLowerCase().includes(q) ||
    (r.keterangan||'').toLowerCase().includes(q));
}

function renderDisTable(){
  const perPage = disPageSize();
  const filtered = disFilteredRows();
  const totalPages = Math.max(1, Math.ceil(filtered.length/perPage));
  if(disState.page > totalPages) disState.page = totalPages;
  if(disState.page < 1) disState.page = 1;
  const start = (disState.page-1)*perPage;
  const pageRows = filtered.slice(start, start+perPage);

  document.getElementById('disTbody').innerHTML = tplDisRows(pageRows);
  document.getElementById('disTotal').textContent = `Total Record: ${filtered.length}`;
  document.getElementById('disPager').innerHTML = tplDisPager(disState.page, totalPages);

  const tbody = document.getElementById('disTbody');
  tbody.querySelectorAll('[data-edit]').forEach(b => b.onclick = (e) => { e.preventDefault(); openDisForm('edit', +b.dataset.edit); });
  tbody.querySelectorAll('[data-del]').forEach(b => b.onclick = () => openDisDeleteConfirm(+b.dataset.del));

  document.getElementById('disPager').querySelectorAll('[data-dispage]').forEach(b => b.onclick = () => { disState.page = +b.dataset.dispage; renderDisTable(); });
}

function disEmptyRow(){
  return {
    noTransaksi: disGenerateNumber('Head Office'),
    tglTransaksi: '26/08/2026',
    cabang: 'Head Office',
    keterangan: '',
    items: [{ kode: '', jurnalKode: '' }],
  };
}

function openDisForm(mode, idx){
  const row = mode === 'edit' ? DATA.disposalAsset[idx] : disEmptyRow();
  renderDisFormBody(mode, row, idx);
}

function renderDisFormBody(mode, row, idx){
  content.innerHTML = tplDisForm(mode, row);
  wireDisForm(mode, row, idx);
}

function wireDisForm(mode, row, idx){
  document.getElementById('btnDisCancel').onclick = () => renderDisList();
  document.getElementById('btnDisSave').onclick = () => disSave(mode, row, idx);
  document.getElementById('btnDisRefreshNo').onclick = () => {
    row.noTransaksi = disGenerateNumber(row.cabang);
    document.getElementById('fDisNoTransaksi').value = row.noTransaksi;
  };
  document.getElementById('fDisCabang').onchange = (e) => { row.cabang = e.target.value; };
  document.getElementById('fDisTglTransaksi').onchange = (e) => {
    row.tglTransaksi = e.target.value.trim();
    refreshDisDetailTab(row);
  };

  document.getElementById('disTabDetailBtn').onclick = () => disSwitchTab('detail');
  document.getElementById('disTabJurnalBtn').onclick = () => disSwitchTab('jurnal');

  document.getElementById('btnDisItemAdd').onclick = () => {
    row.items.push({ kode: '', jurnalKode: '' });
    refreshDisDetailTab(row);
  };

  wireDisItemRows(row);
}

function disSwitchTab(which){
  const btnDetail = document.getElementById('disTabDetailBtn');
  const btnJurnal = document.getElementById('disTabJurnalBtn');
  const contentDetail = document.getElementById('disTabDetailContent');
  const contentJurnal = document.getElementById('disTabJurnalContent');
  if(which === 'jurnal'){
    btnJurnal.classList.add('active'); btnDetail.classList.remove('active');
    contentJurnal.style.display = ''; contentDetail.style.display = 'none';
  } else {
    btnDetail.classList.add('active'); btnJurnal.classList.remove('active');
    contentDetail.style.display = ''; contentJurnal.style.display = 'none';
  }
}

/* Sebelum me-render ulang tab Detail/Jurnal (dipicu ganti Tgl.
   Transaksi/tambah-hapus baris/pilih aset-jurnal), Memo yang
   sudah diketik user di textarea dibaca dulu dari DOM supaya
   tidak hilang — pola sama domSyncHeaderFromDOM()/
   promSyncCommonFromDOM() di modul lain. */
function refreshDisDetailTab(row){
  const memoEl = document.getElementById('fDisMemo');
  if(memoEl) row.keterangan = memoEl.value;
  document.getElementById('disTabDetailContent').innerHTML = tplDisDetailTab(row);
  document.getElementById('disTabJurnalContent').innerHTML = tplDisJurnalTab(row);
  wireDisItemRows(row);
}

function wireDisItemRows(row){
  const body = document.getElementById('disItemsBody');
  if(!body) return;
  body.querySelectorAll('[data-disaset-pick]').forEach(b => b.onclick = () => openDisAsetPicker(+b.dataset.disasetPick, row));
  body.querySelectorAll('[data-disjurnal]').forEach(sel => sel.onchange = (e) => {
    const idx = +sel.dataset.disjurnal;
    row.items[idx].jurnalKode = e.target.value ? +e.target.value : '';
    refreshDisDetailTab(row);
  });
  body.querySelectorAll('[data-disitem-del]').forEach(b => b.onclick = () => {
    row.items.splice(+b.dataset.disitemDel, 1);
    refreshDisDetailTab(row);
  });
}

function openDisAsetPicker(itemIdx, row){
  closeModal();
  const usedKodes = row.items.map(it => it.kode).filter(Boolean);
  const list = DATA.aktivaTetap.filter(a => !a.disposalNo && !usedKodes.includes(a.kode));
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.innerHTML = tplDisAsetPicker(list);
  document.body.appendChild(overlay);
  document.getElementById('pickerClose').onclick = closeModal;
  document.getElementById('pickerCancel').onclick = closeModal;
  overlay.onclick = (e) => { if(e.target === overlay) closeModal(); };
  const search = document.getElementById('disAsetPickerSearch');
  if(search) search.oninput = (e) => {
    const q = e.target.value.toLowerCase();
    const filtered = list.filter(a => a.kode.toLowerCase().includes(q) || a.nama.toLowerCase().includes(q));
    document.getElementById('disAsetPickerBody').innerHTML = tplDisAsetPickerRows(filtered);
    wireDisAsetPickerRows(overlay, itemIdx, row);
  };
  wireDisAsetPickerRows(overlay, itemIdx, row);
}

function wireDisAsetPickerRows(overlay, itemIdx, row){
  overlay.querySelectorAll('[data-pick-aset]').forEach(btn => {
    btn.onclick = () => {
      row.items[itemIdx].kode = btn.dataset.pickAset;
      closeModal();
      refreshDisDetailTab(row);
    };
  });
}

function disInfo(title, text){
  closeModal();
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.innerHTML = tplDisInfoModal(title, text);
  document.body.appendChild(overlay);
  document.getElementById('modalClose').onclick = closeModal;
  document.getElementById('modalOk').onclick = closeModal;
}

function disSave(mode, row, idx){
  row.tglTransaksi = document.getElementById('fDisTglTransaksi').value.trim() || row.tglTransaksi;
  row.cabang = document.getElementById('fDisCabang').value;
  const memoEl = document.getElementById('fDisMemo');
  if(memoEl) row.keterangan = memoEl.value.trim();

  const validItems = row.items.filter(it => it.kode);
  if(!validItems.length){
    return disValidationError('Minimal 1 Fixed Asset Item wajib dipilih.');
  }
  row.items = validItems;

  if(mode === 'add'){
    DATA.disposalAsset.unshift(row);
    // Kunci aset yang di-disposal — tidak bisa dipilih lagi di
    // transaksi Disposal baru (lihat catatan besar di atas file
    // ini kenapa ini HANYA dijalankan utk transaksi baru).
    row.items.forEach(it => {
      const asset = disAssetOf(it.kode);
      if(asset){ asset.disposalNo = row.noTransaksi; asset.status = 'Non Active'; }
    });
  }

  renderDisList();
}

function disValidationError(text){
  const el = document.getElementById('fDisErr');
  el.textContent = text;
  el.style.display = 'block';
}

function openDisDeleteConfirm(idx){
  closeModal();
  const row = DATA.disposalAsset[idx];
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.innerHTML = tplDisDeleteConfirm(row);
  document.body.appendChild(overlay);
  document.getElementById('modalClose').onclick = closeModal;
  document.getElementById('modalCancel').onclick = closeModal;
  overlay.onclick = (e) => { if(e.target === overlay) closeModal(); };
  document.getElementById('modalDelete').onclick = () => {
    row.items.forEach(it => {
      const asset = disAssetOf(it.kode);
      if(asset && asset.disposalNo === row.noTransaksi) asset.disposalNo = '';
    });
    DATA.disposalAsset.splice(idx, 1);
    closeModal();
    renderDisTable();
  };
}
