/* =========================================================
   LOGIC (JS saja) — Kategori Barang (Persediaan Barang > Master
   & Setting). Dimuat otomatis (lazy-load) oleh core.js saat menu
   ini pertama kali diklik — lihat PAGE_MODULES di js/core.js.
   Markup HTML-nya ada di file sebelah: kategori-barang.template.js
   (tplKategoriBarangListPage/tplKbRows/tplKategoriBarangForm/
   tplKbGrupRows/tplKbGrupPicker/tplKbAkunPicker/dst, plus konstanta
   KB_AKUN_FIELDS yang dipakai bersama di sini).
   NB: closeModal() dipakai bersama, didefinisikan di core.js.

   Pola CRUD: list + form FULL PAGE (bukan modal, karena field akun
   sangat banyak — 17 field akun, plus sub-grid Grup Customer), sama
   seperti Master Supplier/Jurnal Pembelian. Sub-grid Grup Customer
   pakai state sementara di variabel modul (pola sama seperti
   bcDivisiRows di Business Centre / msPbRows di Master Supplier),
   baru di-commit ke DATA.kategoriBarang saat tombol Simpan diklik.
   Field akun pakai picker DATA.akunGL dengan live search, reuse
   PERSIS pola openJpAkunPicker() di Jurnal Pembelian.
========================================================= */
let kbGrupRows = [];

function renderKategoriBarangPage(){
  renderKbList();
}

function renderKbList(){
  content.innerHTML = tplKategoriBarangListPage();
  document.getElementById('btnKbAdd').onclick = () => openKbForm('add');
  renderKbTable();
}

function renderKbTable(){
  const tbody = document.getElementById('kbTbody');
  const total = document.getElementById('kbTotal');
  tbody.innerHTML = tplKbRows(DATA.kategoriBarang);
  total.textContent = `Total Record: ${DATA.kategoriBarang.length}`;
  tbody.querySelectorAll('[data-edit]').forEach(b => b.onclick = () => openKbForm('edit', +b.dataset.edit));
  tbody.querySelectorAll('[data-del]').forEach(b => b.onclick = () => openKbDeleteConfirm(+b.dataset.del));
}

function kbEmptyRow(){
  const row = { kode:'', nama:'', keterangan:'Product Category', kategoriInduk:'', grupCustomer:[] };
  KB_AKUN_FIELDS.forEach(f => { row[f.key] = ''; });
  return row;
}

function openKbForm(mode, idx){
  const row = mode === 'edit'
    ? { ...DATA.kategoriBarang[idx], grupCustomer: (DATA.kategoriBarang[idx].grupCustomer||[]).map(g=>({...g})) }
    : kbEmptyRow();

  kbGrupRows = (row.grupCustomer||[]).map(g=>({...g}));
  content.innerHTML = tplKategoriBarangForm(mode, row);
  renderKbGrupRows();

  document.getElementById('btnKbTutorial').onclick = () => openKbInfo('Tutorial', 'Video tutorial pengisian Kategori Barang akan tersedia di sini.');
  document.getElementById('btnKbIndukClear').onclick = () => { document.getElementById('fKbIndukKategori').value = ''; };
  document.getElementById('kbGrupAddRow').onclick = (e) => { e.preventDefault(); kbGrupRows.push({kode:'',nama:''}); renderKbGrupRows(); };

  KB_AKUN_FIELDS.forEach(f => {
    content.querySelector(`[data-akun-search="${f.key}"]`).onclick = () => openKbAkunPicker(f.key, row);
    content.querySelector(`[data-akun-clear="${f.key}"]`).onclick = () => {
      row[f.key] = '';
      document.getElementById(`fKb_${f.key}`).value = '';
      document.getElementById(`fKbNama_${f.key}`).textContent = '';
    };
  });

  document.getElementById('kbCancel').onclick = () => renderKbList();
  document.getElementById('kbSave').onclick = () => {
    const kode = document.getElementById('fKbKode').value.trim();
    const nama = document.getElementById('fKbNama').value.trim();
    if(!kode || !nama){ kbValidationError('Kode Kategori dan Nama Kategori wajib diisi'); return; }
    row.kode = kode;
    row.nama = nama;
    row.keterangan = document.getElementById('fKbKeterangan').value.trim();
    row.kategoriInduk = document.getElementById('fKbIndukKategori').value;
    row.grupCustomer = kbGrupRows.filter(g => g.kode);
    if(mode === 'add'){
      DATA.kategoriBarang.push(row);
    } else {
      DATA.kategoriBarang[idx] = row;
    }
    renderKbList();
  };
}

function renderKbGrupRows(){
  const wrap = document.getElementById('kbGrupWrap');
  if(!wrap) return;
  wrap.innerHTML = tplKbGrupRows(kbGrupRows);
  wrap.querySelectorAll('[data-kbg-search]').forEach(b => b.onclick = () => openKbGrupPicker(+b.dataset.kbgSearch));
  wrap.querySelectorAll('[data-kbg-rm]').forEach(b => b.onclick = () => { kbGrupRows.splice(+b.dataset.kbgRm, 1); renderKbGrupRows(); });
}

function openKbGrupPicker(rowIdx){
  closeModal();
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.innerHTML = tplKbGrupPicker(DATA.customerGroup);
  document.body.appendChild(overlay);
  document.getElementById('pickerClose').onclick = closeModal;
  document.getElementById('pickerCancel').onclick = closeModal;
  overlay.onclick = (e) => { if(e.target === overlay) closeModal(); };
  overlay.querySelectorAll('[data-pick]').forEach(b => b.onclick = () => {
    const g = DATA.customerGroup.find(x => x.kode === b.dataset.pick);
    kbGrupRows[rowIdx] = { kode:g.kode, nama:g.nama };
    closeModal();
    renderKbGrupRows();
  });
}

/* Pengganti alert() bawaan browser untuk validasi sederhana — pakai modal
   info custom, konsisten dengan kebijakan "hindari alert/confirm/prompt
   bawaan browser" di seluruh mockup ini. */
function kbValidationError(text){
  openKbInfo('Validasi', text);
}

function openKbAkunPicker(fieldKey, row){
  closeModal();
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.innerHTML = tplKbAkunPicker(DATA.akunGL, fieldKey);
  document.body.appendChild(overlay);
  document.getElementById('modalClose').onclick = closeModal;
  document.getElementById('modalCancel').onclick = closeModal;
  overlay.onclick = (e) => { if(e.target === overlay) closeModal(); };

  const wireRows = () => {
    overlay.querySelectorAll('[data-pick-akun]').forEach(btn => btn.onclick = () => {
      const kode = btn.dataset.pickAkun;
      row[fieldKey] = kode;
      document.getElementById(`fKb_${fieldKey}`).value = kode;
      document.getElementById(`fKbNama_${fieldKey}`).textContent = kbAkunNama(kode);
      closeModal();
    });
  };
  wireRows();

  document.getElementById('kbAkunPickerSearch').oninput = (e) => {
    const q = e.target.value.trim().toLowerCase();
    const filtered = DATA.akunGL.filter(a => a.kode.toLowerCase().includes(q) || a.nama.toLowerCase().includes(q));
    document.getElementById('kbAkunPickerBody').innerHTML = tplKbAkunPickerRows(filtered, fieldKey);
    wireRows();
  };
}

function openKbDeleteConfirm(idx){
  closeModal();
  const row = DATA.kategoriBarang[idx];
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.innerHTML = tplKbDeleteConfirm(row);
  document.body.appendChild(overlay);
  document.getElementById('modalClose').onclick = closeModal;
  document.getElementById('modalCancel').onclick = closeModal;
  overlay.onclick = (e) => { if(e.target === overlay) closeModal(); };
  document.getElementById('modalDelete').onclick = () => {
    DATA.kategoriBarang.splice(idx, 1);
    closeModal();
    renderKbTable();
  };
}

function openKbInfo(title, text){
  closeModal();
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.innerHTML = tplKbInfoModal(title, text);
  document.body.appendChild(overlay);
  document.getElementById('modalClose').onclick = closeModal;
  document.getElementById('modalOk').onclick = closeModal;
  overlay.onclick = (e) => { if(e.target === overlay) closeModal(); };
}
