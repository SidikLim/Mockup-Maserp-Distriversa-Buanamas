/* =========================================================
   LOGIC (JS saja) — Master Fixed Asset (Aktiva Tetap > Master &
   Setting > Fixed Asset, page:'aktivaTetap'). Dimuat otomatis
   (lazy-load) oleh core.js saat menu ini pertama kali diklik —
   lihat PAGE_MODULES di js/core.js. Markup HTML-nya ada di file
   sebelah: fixed-asset.template.js. NB: closeModal() dipakai
   bersama, didefinisikan di core.js.

   atDeprTarifFa() adalah SALINAN LOKAL formula atDeprTarif() di
   aktiva-tetap-depr-rule.js (bukan reference cross-file — lazy-
   load antar modul tidak terjamin urutannya, lihat konvensi
   "Salinan lokal, bukan reference cross-file" di catatan project).
========================================================= */

let faState = { page: 1, search: '' };

function atDeprTarifFa(masaSusut){
  const m = Number(masaSusut) || 1;
  return { sl: 100/m, db: 200/m };
}

function faLokasiNamaOf(kode){
  const l = DATA.lokasiAset.find(x => x.kode === kode);
  return l ? l.nama : (kode || '-');
}

function faAturanOf(kodeKelompok){
  return DATA.aktivaTetapDeprRule.find(a => a.kodeKelompok === kodeKelompok) || null;
}

function faAkunNamaOfTpl(kode){
  if(!kode) return '';
  const a = DATA.akunGL.find(x => x.kode === kode);
  return a ? a.nama : '';
}

function renderFixedAssetPage(){
  renderFaList();
}

function renderFaList(){
  content.innerHTML = tplFaListPage();
  faState = { page: 1, search: '' };
  document.getElementById('btnFaAdd').onclick = () => openFaForm('add');
  document.getElementById('btnFaGenerate').onclick = () => faInfo('Generate Fixed Asset', 'Fitur ini menghasilkan baris Aktiva Tetap otomatis dari transaksi Pembelian Aktiva Tetap — menu tersebut masih placeholder di mockup ini, jadi tombol ini contoh tampilan (dekoratif).');
  document.getElementById('btnFaImpor').onclick = () => faInfo('Impor Fixed Asset', 'Fitur impor Fixed Asset dari file Excel ini contoh tampilan mockup (dekoratif) — proses impor sungguhan akan disesuaikan lebih lanjut sesuai kebutuhan.');
  document.getElementById('faPageSize').onchange = () => { faState.page = 1; renderFaTable(); };
  document.getElementById('faSearch').oninput = (e) => {
    faState.search = e.target.value.trim().toLowerCase();
    faState.page = 1;
    renderFaTable();
  };
  renderFaTable();
}

function faPageSize(){
  const sel = document.getElementById('faPageSize');
  return sel ? parseInt(sel.value, 10) : 10;
}

function faFilteredRows(){
  const q = faState.search;
  if(!q) return DATA.aktivaTetap.slice();
  return DATA.aktivaTetap.filter(r =>
    r.kode.toLowerCase().includes(q) ||
    r.nama.toLowerCase().includes(q) ||
    r.cabang.toLowerCase().includes(q) ||
    faLokasiNamaOf(r.lokasiKode).toLowerCase().includes(q));
}

function renderFaTable(){
  const perPage = faPageSize();
  const filtered = faFilteredRows();
  const totalPages = Math.max(1, Math.ceil(filtered.length/perPage));
  if(faState.page > totalPages) faState.page = totalPages;
  if(faState.page < 1) faState.page = 1;
  const start = (faState.page-1)*perPage;
  const pageRows = filtered.slice(start, start+perPage);

  document.getElementById('faTbody').innerHTML = tplFaRows(pageRows);
  document.getElementById('faTotal').textContent = `Total Record: ${filtered.length}`;
  document.getElementById('faPager').innerHTML = tplFaPager(faState.page, totalPages);

  const tbody = document.getElementById('faTbody');
  tbody.querySelectorAll('[data-edit]').forEach(b => b.onclick = (e) => { e.preventDefault(); openFaForm('edit', +b.dataset.edit); });
  tbody.querySelectorAll('[data-del]').forEach(b => b.onclick = () => openFaDeleteConfirm(+b.dataset.del));
  tbody.querySelectorAll('[data-delgen]').forEach(b => b.onclick = () => faInfo('Delete Generate Fixed Asset', 'Aksi ini menghapus tautan aset ke transaksi Pembelian Aktiva Tetap sumbernya (Generate Fixed Asset) — menu tersebut masih placeholder di mockup ini, jadi tombol ini contoh tampilan (dekoratif).'));
  tbody.querySelectorAll('[data-toggle]').forEach(b => b.onclick = () => {
    const idx = +b.dataset.toggle;
    DATA.aktivaTetap[idx].status = DATA.aktivaTetap[idx].status === 'Non Active' ? 'Active' : 'Non Active';
    renderFaTable();
  });

  const pager = document.getElementById('faPager');
  pager.querySelectorAll('[data-fapage]').forEach(b => b.onclick = () => { faState.page = +b.dataset.fapage; renderFaTable(); });
}

function faEmptyRow(){
  return {
    kode: '', cabang: 'Head Office', nama: '', spesifikasi: '', merek: '',
    tglBeli: '26/08/2026', tglMulaiSusut: '26/08/2026', hargaBeli: 0, barcode: '',
    status: 'Active', tidakPenyusutan: false, metodePenyusutan: 'Straight Line',
    kelompokAktiva: 'Komersial', aturanKode: '', nilaiResidu: 0,
    lokasiKode: '00', tglPerpindahan: '01/01/0001', penanggungJawab: '', pemakaiAsset: '',
    glBiayaSusut: '', glAkmSusut: '',
  };
}

function openFaForm(mode, idx){
  const row = mode === 'edit' ? DATA.aktivaTetap[idx] : faEmptyRow();
  renderFaFormBody(mode, row, idx);
}

function renderFaFormBody(mode, row, idx){
  const aturan = faAturanOf(row.aturanKode);
  content.innerHTML = tplFaForm(mode, row, aturan);
  wireFaForm(mode, row, idx);
}

function wireFaForm(mode, row, idx){
  document.getElementById('btnFaTutorial').onclick = () => faInfo('Tutorial', 'Video tutorial pengisian Master Fixed Asset ini contoh tampilan mockup (dekoratif).');
  document.getElementById('btnFaDuplicate').onclick = () => faInfo('Duplicate', 'Fitur Duplicate Fixed Asset ini contoh tampilan mockup (disederhanakan) — di aplikasi sungguhan akan membuka form Tambah baru terisi salinan data aset ini.');
  document.getElementById('btnFaCancel').onclick = () => renderFaList();
  document.getElementById('btnFaSave').onclick = () => faSave(mode, row, idx);

  document.getElementById('fFaTidakSusut').onchange = (e) => {
    row.tidakPenyusutan = e.target.checked;
    wireFaRightFields(row);
  };

  document.getElementById('btnFaUbahStatus').onclick = () => {
    row.status = row.status === 'Non Active' ? 'Active' : 'Non Active';
    document.getElementById('fFaStatusLabel').textContent = row.status;
  };

  document.getElementById('btnFaLokasiUpdate').onclick = () => {
    row.tglPerpindahan = document.getElementById('fFaTglPerpindahan').value.trim();
    row.lokasiKode = document.getElementById('fFaLokasi').value;
    row.penanggungJawab = document.getElementById('fFaPenanggungJawab').value.trim();
    row.pemakaiAsset = document.getElementById('fFaPemakaiAsset').value.trim();
    faInfo('Lokasi Aset', 'Lokasi Aset berhasil diupdate.');
  };

  document.getElementById('btnFaGlBiayaSusutPick').onclick = () => openFaAkunPicker('biaya', row);
  document.getElementById('btnFaGlAkmSusutPick').onclick = () => openFaAkunPicker('akm', row);

  wireFaRightFields(row);
}

/* Menulis ulang wrap kanan (Metode Penyusutan/Kelompok Aktiva/Kode
   Golongan/Aturan Penyusutan/Nilai Susut/Masa Susut/Nilai Residu)
   & mewiring ulang event-nya — dipanggil ulang setiap checkbox
   "Aset Ini Tidak Memiliki Penyusutan" berubah ATAU radio Kelompok
   Aktiva berubah (Aturan Penyusutan yang sudah dipilih di-reset
   karena daftar pilihannya berubah). */
function wireFaRightFields(row){
  const aturan = faAturanOf(row.aturanKode);
  const dis = row.tidakPenyusutan ? 'disabled' : '';
  document.getElementById('fFaRightWrap').innerHTML = tplFaRightFields(row, aturan, dis);

  document.querySelectorAll('[name="fFaMetode"]').forEach(r => r.onchange = (e) => { row.metodePenyusutan = e.target.value; });
  document.querySelectorAll('[name="fFaKelompokAktiva"]').forEach(r => r.onchange = (e) => {
    row.kelompokAktiva = e.target.value;
    row.aturanKode = '';
    wireFaRightFields(row);
  });
  const btnPick = document.getElementById('btnFaAturanPick');
  if(btnPick) btnPick.onclick = () => openFaAturanPicker(row);
  const nilaiResidu = document.getElementById('fFaNilaiResidu');
  if(nilaiResidu) nilaiResidu.onchange = (e) => { row.nilaiResidu = +e.target.value || 0; };
}

function openFaAturanPicker(row){
  closeModal();
  const list = DATA.aktivaTetapDeprRule.filter(a => a.kelompokAktiva === row.kelompokAktiva);
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.innerHTML = tplFaAturanPicker(list);
  document.body.appendChild(overlay);
  document.getElementById('pickerClose').onclick = closeModal;
  document.getElementById('pickerCancel').onclick = closeModal;
  overlay.onclick = (e) => { if(e.target === overlay) closeModal(); };
  overlay.querySelectorAll('[data-pick-aturan]').forEach(btn => {
    btn.onclick = () => {
      row.aturanKode = btn.dataset.pickAturan;
      closeModal();
      wireFaRightFields(row);
    };
  });
}

function openFaAkunPicker(target, row){
  closeModal();
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.innerHTML = tplFaAkunPicker(DATA.akunGL, target);
  document.body.appendChild(overlay);
  document.getElementById('pickerClose').onclick = closeModal;
  document.getElementById('pickerCancel').onclick = closeModal;
  overlay.onclick = (e) => { if(e.target === overlay) closeModal(); };
  document.getElementById('faAkunPickerSearch').oninput = (e) => {
    const q = e.target.value.toLowerCase();
    const filtered = DATA.akunGL.filter(a => a.kode.toLowerCase().includes(q) || a.nama.toLowerCase().includes(q));
    document.getElementById('faAkunPickerBody').innerHTML = tplFaAkunPickerRows(filtered, target);
    wireFaAkunPickerRows(overlay, target, row);
  };
  wireFaAkunPickerRows(overlay, target, row);
}

function wireFaAkunPickerRows(overlay, target, row){
  overlay.querySelectorAll('[data-pick-akun]').forEach(btn => {
    btn.onclick = () => {
      const kode = btn.dataset.pickAkun;
      if(target === 'biaya'){
        row.glBiayaSusut = kode;
        document.getElementById('fFaGlBiayaSusut').value = kode;
        document.getElementById('fFaGlBiayaSusutCaption').textContent = faAkunNamaOfTpl(kode);
      } else {
        row.glAkmSusut = kode;
        document.getElementById('fFaGlAkmSusut').value = kode;
        document.getElementById('fFaGlAkmSusutCaption').textContent = faAkunNamaOfTpl(kode);
      }
      closeModal();
    };
  });
}

function faInfo(title, text){
  closeModal();
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.innerHTML = tplFaInfoModal(title, text);
  document.body.appendChild(overlay);
  document.getElementById('modalClose').onclick = closeModal;
  document.getElementById('modalOk').onclick = closeModal;
}

function faSave(mode, row, idx){
  const kode = document.getElementById('fFaKode').value.trim();
  const nama = document.getElementById('fFaNama').value.trim();

  if(!kode){ return faValidationError('Kode Aset wajib diisi.'); }
  if(mode === 'add' && DATA.aktivaTetap.some(r => r.kode.toLowerCase() === kode.toLowerCase())){
    return faValidationError('Kode Aset sudah dipakai, gunakan kode lain.');
  }
  if(!nama){ return faValidationError('Nama Aset wajib diisi.'); }

  row.kode = kode;
  row.nama = nama;
  row.cabang = document.getElementById('fFaCabang').value;
  row.spesifikasi = document.getElementById('fFaSpesifikasi').value.trim();
  row.merek = document.getElementById('fFaMerek').value.trim();
  row.tglBeli = document.getElementById('fFaTglBeli').value.trim();
  row.tglMulaiSusut = document.getElementById('fFaTglMulaiSusut').value.trim();
  row.hargaBeli = +document.getElementById('fFaHargaBeli').value || 0;
  row.barcode = document.getElementById('fFaBarcode').value.trim();
  row.tidakPenyusutan = document.getElementById('fFaTidakSusut').checked;
  row.nilaiResidu = +(document.getElementById('fFaNilaiResidu')?.value) || 0;
  // Lokasi Aset & Jurnal & Metode/Kelompok Aktiva/Aturan Penyusutan sudah
  // langsung disinkron ke `row` lewat event handler masing-masing
  // (btnFaLokasiUpdate/wireFaRightFields/openFaAturanPicker/openFaAkunPicker)
  // sehingga tidak perlu dibaca ulang dari DOM di sini.

  if(mode === 'add') DATA.aktivaTetap.unshift(row);
  renderFaList();
}

function faValidationError(text){
  const el = document.getElementById('fFaErr');
  el.textContent = text;
  el.style.display = 'block';
}

function openFaDeleteConfirm(idx){
  closeModal();
  const row = DATA.aktivaTetap[idx];
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.innerHTML = tplFaDeleteConfirm(row);
  document.body.appendChild(overlay);
  document.getElementById('modalClose').onclick = closeModal;
  document.getElementById('modalCancel').onclick = closeModal;
  overlay.onclick = (e) => { if(e.target === overlay) closeModal(); };
  document.getElementById('modalDelete').onclick = () => {
    DATA.aktivaTetap.splice(idx, 1);
    closeModal();
    renderFaTable();
  };
}
