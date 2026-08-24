/* =========================================================
   LOGIC (JS saja) — Master Cost Center (menu General Ledger > Master
   & Setting > Cost Center, page 'costCenter'). Dimuat otomatis
   (lazy-load) oleh core.js saat menu ini pertama kali diklik — lihat
   PAGE_MODULES di js/core.js. Markup HTML-nya ada di file sebelah:
   cost-center.template.js (tplCostCenterPage/tplCcRows/tplCcModal/
   tplCcDeleteConfirm/ccSortIcon).
   NB: closeModal() dipakai bersama, didefinisikan di core.js.

   Pola CRUD sederhana sama seperti Master Divisi/Business Centre,
   ditambah 1 fitur baru: sort per kolom (klik header Kode/Nama/
   Keterangan) — state sort disimpan di `ccSortState` (var lokal
   modul ini), di-reset ke default setiap kali renderCostCenterPage()
   dipanggil (menu diklik ulang dari sidebar).
========================================================= */
var ccSortState = { col: 'kode', dir: 'asc' };
var ccSearchQuery = '';

function renderCostCenterPage(){
  ccSortState = { col: 'kode', dir: 'asc' };
  ccSearchQuery = '';
  content.innerHTML = tplCostCenterPage();
  document.getElementById('btnCcAdd').onclick = () => openCcModal('add');
  document.getElementById('ccSearch').oninput = (e) => { ccSearchQuery = e.target.value.trim().toLowerCase(); renderCcTable(); };
  content.querySelectorAll('[data-sort-col]').forEach(th => {
    th.style.cursor = 'pointer';
    th.onclick = () => {
      const col = th.dataset.sortCol;
      if(ccSortState.col === col){ ccSortState.dir = ccSortState.dir === 'asc' ? 'desc' : 'asc'; }
      else { ccSortState = { col, dir: 'asc' }; }
      // ikon sort di 3 header ikut berubah — cukup re-render seluruh
      // <thead>+<tbody> lewat renderCostCenterPage() supaya sinkron,
      // tapi itu akan reset search juga — jadi cukup update ikon +
      // tbody saja tanpa reset search:
      content.querySelectorAll('[data-sort-col]').forEach(h => {
        h.innerHTML = `${h.dataset.sortCol==='kode'?'Kode Cost Center':h.dataset.sortCol==='nama'?'Nama Cost Center':'Keterangan'} ${ccSortIcon(h.dataset.sortCol)}`;
      });
      renderCcTable();
    };
  });
  renderCcTable();
}

function ccFilteredSortedRows(){
  let rows = DATA.costCenter.slice();
  if(ccSearchQuery){
    rows = rows.filter(r => (r.kode+r.nama+(r.keterangan||'')).toLowerCase().includes(ccSearchQuery));
  }
  rows.sort((a,b) => {
    const va = (a[ccSortState.col]||'').toString().toLowerCase();
    const vb = (b[ccSortState.col]||'').toString().toLowerCase();
    if(va < vb) return ccSortState.dir === 'asc' ? -1 : 1;
    if(va > vb) return ccSortState.dir === 'asc' ? 1 : -1;
    return 0;
  });
  return rows;
}

function renderCcTable(){
  const tbody = document.getElementById('ccTbody');
  const total = document.getElementById('ccTotal');
  const rows = ccFilteredSortedRows();
  tbody.innerHTML = tplCcRows(rows);
  total.textContent = `Total Record: ${rows.length}`;
  tbody.querySelectorAll('[data-edit]').forEach(b => b.onclick = () => openCcModal('edit', +b.dataset.edit));
  tbody.querySelectorAll('[data-del]').forEach(b => b.onclick = () => openCcDeleteConfirm(+b.dataset.del));
}

function ccNextKode(){
  let n = DATA.costCenter.length + 1;
  while (DATA.costCenter.some(r => r.kode === `CC${String(n).padStart(3,'0')}`)) n++;
  return `CC${String(n).padStart(3,'0')}`;
}

function openCcModal(mode, idx){
  closeModal();
  const row = mode === 'edit' ? DATA.costCenter[idx] : { kode: ccNextKode(), nama:'', keterangan:'' };
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.innerHTML = tplCcModal(mode, row);
  document.body.appendChild(overlay);
  document.getElementById('modalClose').onclick = closeModal;
  document.getElementById('modalCancel').onclick = closeModal;
  overlay.onclick = (e) => { if(e.target === overlay) closeModal(); };
  document.getElementById('modalSave').onclick = () => {
    const kode = document.getElementById('fCcKode').value.trim();
    const nama = document.getElementById('fCcNama').value.trim();
    const keterangan = document.getElementById('fCcKeterangan').value.trim();
    if(!kode){ document.getElementById('fCcKodeErr').style.display = 'block'; return; }
    if(mode === 'add'){ DATA.costCenter.push({ kode, nama, keterangan }); }
    else { DATA.costCenter[idx] = { kode, nama, keterangan }; }
    closeModal();
    renderCcTable();
  };
}

function openCcDeleteConfirm(idx){
  closeModal();
  const row = DATA.costCenter[idx];
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.innerHTML = tplCcDeleteConfirm(row);
  document.body.appendChild(overlay);
  document.getElementById('modalClose').onclick = closeModal;
  document.getElementById('modalCancel').onclick = closeModal;
  overlay.onclick = (e) => { if(e.target === overlay) closeModal(); };
  document.getElementById('modalDelete').onclick = () => {
    DATA.costCenter.splice(idx, 1);
    closeModal();
    renderCcTable();
  };
}
