/* =========================================================
   LOGIC (JS saja) — Master Berat Produk (Persediaan Barang >
   Master & Setting > Berat Produk). Dimuat otomatis (lazy-load)
   oleh core.js saat menu ini pertama kali diklik — lihat
   PAGE_MODULES di js/core.js. Markup HTML-nya ada di file
   sebelah: berat-produk.template.js (catatan desain lengkap di
   headernya). NB: closeModal() dipakai bersama (core.js).

   Alur inti:
   - Tambah -> picker barang (DATA.items) yang BELUM punya data
     berat (satu baris per kode barang); Nama Barang otomatis.
   - Konversi isi dalam Box, Berat (Kg), Panjang/Lebar/Tinggi
     (cm, desimal boleh) -> Volume m3 = P x L x T / 1.000.000
     recalc LIVE saat P/L/T diketik.
   - Link Kode Barang & tombol Ubah -> form edit (kode terkunci);
     Hapus -> modal konfirmasi. "Import Master Berat Produk" ->
     modal upload (mockup).
   - Validasi Simpan: barang wajib dipilih, Berat > 0, dimensi
     tidak negatif. Data: DATA.beratProduk. */

var mbpSearchQ = '';

function renderBeratProdukPage(){
  mbpSearchQ = '';
  renderMbpList();
}

function renderMbpList(){
  content.innerHTML = tplBeratProdukListPage();
  document.getElementById('btnMbpAdd').onclick = () => openMbpForm('add', null);
  document.getElementById('btnMbpImport').onclick = () => openMbpImport();
  document.getElementById('mbpSearch').oninput = (e) => { mbpSearchQ = e.target.value; renderMbpTable(); };
  renderMbpTable();
}

function mbpFilteredRows(){
  const q = mbpSearchQ.trim().toLowerCase();
  return (DATA.beratProduk || []).filter(r => {
    if(!q) return true;
    return r.kode.toLowerCase().includes(q) || mbpNamaBarang(r.kode).toLowerCase().includes(q);
  });
}

function renderMbpTable(){
  const rows = mbpFilteredRows();
  const tbody = document.getElementById('mbpTbody');
  tbody.innerHTML = tplMbpRows(rows);
  document.getElementById('mbpTotal').textContent = `Total Record: ${rows.length}`;
  const idxOf = (r) => DATA.beratProduk.indexOf(r);
  tbody.querySelectorAll('[data-mbp-link]').forEach(b => b.onclick = () => openMbpForm('edit', idxOf(rows[+b.dataset.mbpLink])));
  tbody.querySelectorAll('[data-mbp-edit]').forEach(b => b.onclick = () => openMbpForm('edit', idxOf(rows[+b.dataset.mbpEdit])));
  tbody.querySelectorAll('[data-mbp-del]').forEach(b => b.onclick = () => openMbpDelete(idxOf(rows[+b.dataset.mbpDel])));
}

/* =====================================================================
   FORM add / edit
===================================================================== */
function openMbpForm(mode, idx){
  const src = idx != null ? DATA.beratProduk[idx] : null;
  const row = src ? JSON.parse(JSON.stringify(src)) : {
    kode: '', konversi: 1, berat: 0, panjang: 0, lebar: 0, tinggi: 0,
  };
  content.innerHTML = tplMbpForm(mode, row);

  const back = () => renderMbpList();
  document.getElementById('mbpBatalkan').onclick = (e) => { e.preventDefault(); back(); };

  const refreshVolume = () => {
    row.panjang = Number(document.getElementById('fMbpPanjang').value) || 0;
    row.lebar = Number(document.getElementById('fMbpLebar').value) || 0;
    row.tinggi = Number(document.getElementById('fMbpTinggi').value) || 0;
    document.getElementById('fMbpVolume').value = mbpVolM3(row).toLocaleString('id-ID', {minimumFractionDigits:4, maximumFractionDigits:4});
  };
  ['fMbpPanjang','fMbpLebar','fMbpTinggi'].forEach(id => {
    document.getElementById(id).oninput = refreshVolume;
  });

  const searchBtn = document.getElementById('mbpItemSearch');
  if(searchBtn) searchBtn.onclick = () => openMbpItemPicker((barang) => {
    row.kode = barang.kode;
    document.getElementById('fMbpKode').value = barang.kode;
    document.getElementById('fMbpNama').value = barang.nama;
  });

  document.getElementById('mbpSimpan').onclick = () => {
    row.konversi = Number(document.getElementById('fMbpKonversi').value) || 0;
    row.berat = Number(document.getElementById('fMbpBerat').value) || 0;
    refreshVolume();

    if(!row.kode){ openMbpInfo('Validasi', 'Kode Barang wajib dipilih.'); return; }
    if(row.berat <= 0){ openMbpInfo('Validasi', 'Berat (Kg) harus lebih dari 0.'); return; }
    if(row.panjang < 0 || row.lebar < 0 || row.tinggi < 0){ openMbpInfo('Validasi', 'Panjang / Lebar / Tinggi tidak boleh negatif.'); return; }
    if(mode === 'add' && (DATA.beratProduk || []).some(r => r.kode === row.kode)){
      openMbpInfo('Validasi', `Barang <b>${row.kode}</b> sudah memiliki data berat produk — gunakan tombol Ubah.`);
      return;
    }

    DATA.beratProduk = DATA.beratProduk || [];
    if(mode === 'add') DATA.beratProduk.unshift(row);
    else DATA.beratProduk[idx] = row;
    back();
  };
}

/* =====================================================================
   Modals
===================================================================== */
function mbpOverlay(html){
  closeModal();
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.innerHTML = html;
  document.body.appendChild(overlay);
  document.getElementById('modalClose').onclick = closeModal;
  const cancel = document.getElementById('modalCancel');
  if(cancel) cancel.onclick = closeModal;
  overlay.onclick = (e) => { if(e.target === overlay) closeModal(); };
  return overlay;
}

function openMbpImport(){
  mbpOverlay(tplMbpImportModal());
  document.getElementById('mbpImportOk').onclick = () => {
    closeModal();
    openMbpInfo('Import Master Berat Produk', 'Import berhasil disimulasikan (mockup) — pada aplikasi asli data dari file Excel akan divalidasi lalu dimasukkan ke master.');
  };
}

function openMbpDelete(idx){
  const row = DATA.beratProduk[idx];
  mbpOverlay(tplMbpDeleteConfirm(row));
  document.getElementById('modalDelete').onclick = () => {
    DATA.beratProduk.splice(idx, 1);
    closeModal();
    renderMbpTable();
  };
}

function openMbpInfo(title, text){
  mbpOverlay(tplMbpInfoModal(title, text));
  document.getElementById('modalOk').onclick = closeModal;
}

function openMbpItemPicker(onPick){
  const sudah = new Set((DATA.beratProduk || []).map(r => r.kode));
  const base = DATA.items.filter(b => !sudah.has(b.kode));
  const overlay = mbpOverlay(tplMbpItemPicker(base));
  const wire = () => overlay.querySelectorAll('[data-mbp-pick-item]').forEach(b => b.onclick = () => {
    const barang = DATA.items.find(x => x.kode === b.dataset.mbpPickItem);
    closeModal();
    if(barang) onPick(barang);
  });
  wire();
  document.getElementById('mbpItemPickerSearch').oninput = (e) => {
    const q = e.target.value.trim().toLowerCase();
    const list = base.filter(x => !q || x.kode.toLowerCase().includes(q) || x.nama.toLowerCase().includes(q));
    document.getElementById('mbpItemPickerBody').innerHTML = tplMbpItemPickerRows(list);
    wire();
  };
}
