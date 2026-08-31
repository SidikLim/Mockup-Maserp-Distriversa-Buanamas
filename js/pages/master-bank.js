/* =========================================================
   LOGIC (JS saja) — Master Bank (Kas/Bank > Master & Setting).
   Dimuat otomatis (lazy-load) oleh core.js saat menu ini pertama
   kali diklik — lihat PAGE_MODULES di js/core.js. Markup HTML-nya
   ada di file sebelah: master-bank.template.js
   (tplMasterBankListPage/tplMbkRows/tplMasterBankForm/dst).
   NB: closeModal() dipakai bersama, didefinisikan di core.js.

   Pola CRUD: list + form FULL PAGE (sesuai screenshot — walau
   field-nya cuma 3, form MASERP asli memang halaman penuh dengan
   section "Informasi Bank"). Kode Master Bank auto-generate
   "B{urut 2 digit}" (B01, B02, ...) readonly — tidak diketik user.
   Validasi: Nama wajib diisi, VA wajib diisi & hanya angka.
   Pencarian Global fungsional. Data: DATA.masterBank.
========================================================= */
function renderMasterBankPage(){
  renderMbkList();
}

var mbkState = { search:'' };

function renderMbkList(){
  mbkState = { search:'' };
  content.innerHTML = tplMasterBankListPage();
  document.getElementById('btnMbkAdd').onclick = () => openMbkForm('add');
  document.getElementById('mbkSearch').oninput = (e) => { mbkState.search = e.target.value; renderMbkTable(); };
  renderMbkTable();
}

function mbkFilteredRows(){
  const q = mbkState.search.trim().toLowerCase();
  if(!q) return DATA.masterBank || [];
  return (DATA.masterBank || []).filter(r =>
    r.kode.toLowerCase().includes(q) ||
    (r.nama || '').toLowerCase().includes(q) ||
    (r.va || '').toLowerCase().includes(q));
}

function renderMbkTable(){
  const rows = mbkFilteredRows();
  const tbody = document.getElementById('mbkTbody');
  tbody.innerHTML = tplMbkRows(rows);
  document.getElementById('mbkTotal').textContent = `Total Record: ${rows.length}`;
  const idxOf = (r) => DATA.masterBank.indexOf(r);
  tbody.querySelectorAll('[data-edit]').forEach(b => b.onclick = () => openMbkForm('edit', idxOf(rows[+b.dataset.edit])));
  tbody.querySelectorAll('[data-del]').forEach(b => b.onclick = () => openMbkDeleteConfirm(idxOf(rows[+b.dataset.del])));
}

/* Kode auto "B{urut 2 digit}" — lanjut dari kode terbesar yang ada
   supaya tidak dobel walau ada baris yang pernah dihapus. */
function mbkGenerateKode(){
  const max = (DATA.masterBank || []).reduce((m,r) => {
    const n = parseInt(String(r.kode||'').replace(/\D/g,''), 10);
    return Number.isFinite(n) && n > m ? n : m;
  }, 0);
  return 'B' + String(max + 1).padStart(2,'0');
}

function openMbkForm(mode, idx){
  const row = mode === 'edit'
    ? { ...DATA.masterBank[idx] }
    : { kode: mbkGenerateKode(), nama:'', va:'' };

  content.innerHTML = tplMasterBankForm(mode, row);

  document.getElementById('mbkBatalkan').onclick = (e) => { e.preventDefault(); renderMbkList(); };
  document.getElementById('mbkSimpan').onclick = () => {
    const nama = document.getElementById('fMbkNama').value.trim();
    const va = document.getElementById('fMbkVa').value.trim();
    if(!nama){ openMbkInfo('Validasi', 'Nama Master Bank wajib diisi.'); return; }
    if(!va){ openMbkInfo('Validasi', 'VA wajib diisi.'); return; }
    if(!/^\d+$/.test(va)){ openMbkInfo('Validasi', 'VA hanya boleh berisi angka.'); return; }
    row.nama = nama;
    row.va = va;
    if(mode === 'add'){ DATA.masterBank.push(row); }
    else { DATA.masterBank[idx] = row; }
    renderMbkList();
  };
}

function openMbkDeleteConfirm(idx){
  closeModal();
  const row = DATA.masterBank[idx];
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.innerHTML = tplMbkDeleteConfirm(row);
  document.body.appendChild(overlay);
  document.getElementById('modalClose').onclick = closeModal;
  document.getElementById('modalCancel').onclick = closeModal;
  overlay.onclick = (e) => { if(e.target === overlay) closeModal(); };
  document.getElementById('modalDelete').onclick = () => {
    DATA.masterBank.splice(idx, 1);
    closeModal();
    renderMbkTable();
  };
}

function openMbkInfo(title, text){
  closeModal();
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.innerHTML = tplMbkInfoModal(title, text);
  document.body.appendChild(overlay);
  document.getElementById('modalClose').onclick = closeModal;
  document.getElementById('modalOk').onclick = closeModal;
  overlay.onclick = (e) => { if(e.target === overlay) closeModal(); };
}
