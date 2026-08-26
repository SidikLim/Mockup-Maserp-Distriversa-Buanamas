/* =========================================================
   LOGIC (JS saja) — Monitoring Control Delivery (Customer &
   Penjualan > Daftar Transaksi > Monitoring Control Delivery,
   page:'monitoringControlDelivery'). Markup HTML-nya ada di
   file sebelah: monitoring-control-delivery.template.js (baca
   komentar besar di sana utk penjelasan lengkap desain modul
   ini). NB: closeModal() dipakai bersama, didefinisikan di
   core.js.

   Dropdown kecil (status filter "All" & aksi "Diterima
   Customer") dibangun manual sbg elemen `position:fixed` yang
   di-append ke `document.body` (BUKAN lewat helper openModal()/
   closeModal() yang untuk `.modal-overlay` penuh) — ditutup
   lewat listener klik-di-luar (mcdCloseMenu()) yang dipasang
   1x saat menu dibuka & dilepas saat ditutup, supaya tidak
   menumpuk listener kalau menu dibuka-tutup berkali-kali. */

let mcdState = { page: 1, search: '', statusFilter: '' };
let mcdOpenMenuEl = null;
let mcdOpenMenuOutsideHandler = null;

function renderMonitoringControlDeliveryPage(){
  renderMcdList();
}

function renderMcdList(){
  content.innerHTML = tplMcdListPage();
  mcdState = { page: 1, search: '', statusFilter: '' };
  document.getElementById('btnMcdStatusFilter').onclick = (e) => openMcdStatusFilterMenu(e.currentTarget);
  document.getElementById('btnMcdPeriode').onclick = () => mcdInfo('Periode', 'Filter periode ini contoh tampilan mockup (dekoratif) — daftar tetap menampilkan seluruh transaksi Monitoring Control Delivery.');
  document.getElementById('mcdPageSize').onchange = () => { mcdState.page = 1; renderMcdTable(); };
  document.getElementById('mcdSearch').oninput = (e) => {
    mcdState.search = e.target.value.trim().toLowerCase();
    mcdState.page = 1;
    renderMcdTable();
  };
  renderMcdTable();
}

function mcdPageSize(){
  const sel = document.getElementById('mcdPageSize');
  return sel ? parseInt(sel.value, 10) : 10;
}

/* Status "saat ini" tiap baris SELALU computed dari entri
   TERAKHIR row.mcdHistory — TIDAK disimpan terpisah (lihat
   catatan besar di template). Baris tanpa mcdHistory (seharusnya
   tidak terjadi di data seed) fallback ke status pertama. */
function mcdCurrentStatus(row){
  const hist = row.mcdHistory || [];
  if(!hist.length) return MCD_STATUSES[0];
  return hist[hist.length-1].status;
}

function mcdFilteredRows(){
  const q = mcdState.search;
  const statusFilter = mcdState.statusFilter;
  return DATA.invoices.filter(r => {
    if(statusFilter && mcdCurrentStatus(r) !== statusFilter) return false;
    if(!q) return true;
    return r.no.toLowerCase().includes(q) ||
      (r.noPL||'').toLowerCase().includes(q) ||
      (r.noSO||'').toLowerCase().includes(q) ||
      (r.customerNama||'').toLowerCase().includes(q);
  });
}

function renderMcdTable(){
  const perPage = mcdPageSize();
  const filtered = mcdFilteredRows();
  const totalPages = Math.max(1, Math.ceil(filtered.length/perPage));
  if(mcdState.page > totalPages) mcdState.page = totalPages;
  if(mcdState.page < 1) mcdState.page = 1;
  const start = (mcdState.page-1)*perPage;
  const pageRows = filtered.slice(start, start+perPage);

  document.getElementById('mcdTbody').innerHTML = tplMcdRows(pageRows);
  document.getElementById('mcdTotal').textContent = `Total Record: ${filtered.length}`;
  document.getElementById('mcdPager').innerHTML = tplMcdPager(mcdState.page, totalPages);

  const tbody = document.getElementById('mcdTbody');
  tbody.querySelectorAll('[data-mcd-open]').forEach(a => a.onclick = (e) => { e.preventDefault(); mcdOpenInvoice(+a.dataset.mcdOpen); });
  tbody.querySelectorAll('[data-mcd-history]').forEach(b => b.onclick = () => openMcdHistoryModal(+b.dataset.mcdHistory));
  tbody.querySelectorAll('[data-mcd-action]').forEach(b => b.onclick = (e) => openMcdActionMenu(+b.dataset.mcdAction, e.currentTarget));
  tbody.querySelectorAll('[data-mcd-refresh]').forEach(b => b.onclick = () => mcdInfo('Refresh', 'Tombol refresh ini contoh tampilan mockup (dekoratif) — status Monitoring Control Delivery sudah otomatis computed dari History terbaru setiap baris.'));

  document.getElementById('mcdPager').querySelectorAll('[data-mcdpage]').forEach(b => b.onclick = () => { mcdState.page = +b.dataset.mcdpage; renderMcdTable(); });
}

/* Klik "No Invoice" -> lompat ke modul Invoice, buka baris yang
   sama dalam mode Lihat — pola sama goToPage() (NOTIF_SOURCES di
   core.js) supaya highlight sidebar & submenu-open state tetap
   konsisten dgn kalau menu Invoice diklik manual dari sidebar. */
function mcdOpenInvoice(idx){
  const row = DATA.invoices[idx];
  if(!row) return;
  goToPage('invoices', 'Invoice', () => {
    const invIdx = DATA.invoices.findIndex(x => x.no === row.no);
    // NB: modul Invoice cuma mengenal mode 'add'/'edit' (tidak ada mode
    // 'view' sungguhan — lihat openInvForm() di invoice.js, isAdd =
    // mode==='add'), jadi dipakai 'edit' di sini supaya konsisten
    // dengan pola pemanggilan yang sudah ada (data-edit di list Invoice).
    if(invIdx >= 0 && typeof openInvForm === 'function') openInvForm('edit', invIdx);
  });
}

function mcdNowLabel(){
  const d = new Date();
  const pad = n => String(n).padStart(2,'0');
  return `${pad(d.getDate())}/${pad(d.getMonth()+1)}/${d.getFullYear()} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function openMcdHistoryModal(idx){
  closeModal();
  const row = DATA.invoices[idx];
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.innerHTML = tplMcdHistoryModal(row);
  document.body.appendChild(overlay);
  document.getElementById('modalClose').onclick = closeModal;
  document.getElementById('modalCancel').onclick = closeModal;
  overlay.onclick = (e) => { if(e.target === overlay) closeModal(); };
  overlay.querySelectorAll('[data-mcd-print]').forEach(b => b.onclick = (e) => {
    e.stopPropagation();
    mcdInfo('Print', 'Cetak riwayat status ini contoh tampilan mockup (dekoratif) — tidak menghasilkan dokumen sungguhan.');
  });
}

/* Menu kecil position:fixed generik, dipakai baik utk filter
   status maupun dropdown aksi baris. `onPick(value)` dipanggil
   saat salah satu opsi diklik (menu ditutup otomatis sesudahnya). */
function mcdOpenMenu(triggerEl, items, dataAttr, onPick){
  mcdCloseMenu();
  const rect = triggerEl.getBoundingClientRect();
  const menu = document.createElement('div');
  menu.innerHTML = tplMcdMiniMenu(items, dataAttr);
  const el = menu.firstElementChild;
  el.style.position = 'fixed';
  el.style.top = `${rect.bottom + 4}px`;
  el.style.left = `${rect.left}px`;
  el.style.zIndex = '300';
  document.body.appendChild(el);
  mcdOpenMenuEl = el;

  el.querySelectorAll(`[data-${dataAttr}]`).forEach(btn => {
    btn.onclick = (e) => {
      e.stopPropagation();
      const val = btn.dataset[dataAttr.replace(/-([a-z])/g, (m,c)=>c.toUpperCase())];
      mcdCloseMenu();
      onPick(val);
    };
  });

  mcdOpenMenuOutsideHandler = (e) => {
    if(el.contains(e.target) || e.target === triggerEl || triggerEl.contains(e.target)) return;
    mcdCloseMenu();
  };
  document.addEventListener('click', mcdOpenMenuOutsideHandler, true);
}

function mcdCloseMenu(){
  if(mcdOpenMenuEl){ mcdOpenMenuEl.remove(); mcdOpenMenuEl = null; }
  if(mcdOpenMenuOutsideHandler){ document.removeEventListener('click', mcdOpenMenuOutsideHandler, true); mcdOpenMenuOutsideHandler = null; }
}

function openMcdStatusFilterMenu(triggerEl){
  const items = [{label:'All', value:''}].concat(MCD_STATUSES.map(s => ({label:s, value:s})));
  mcdOpenMenu(triggerEl, items, 'mcd-filter', (val) => {
    mcdState.statusFilter = val;
    mcdState.page = 1;
    document.getElementById('btnMcdStatusFilter').innerHTML = `${val || 'All'} ${icon('chevronDown',12)}`;
    renderMcdTable();
  });
}

function openMcdActionMenu(idx, triggerEl){
  const items = [
    {label:'Diterima Customer', value:'diterima'},
    {label:'Sudah Tukar Faktur / Pemberkasan', value:'tukarfaktur'},
  ];
  mcdOpenMenu(triggerEl, items, 'mcd-action-opt', (val) => {
    if(val === 'diterima') openMcdDiterimaModal(idx);
    else openMcdTukarFakturModal(idx);
  });
}

function openMcdDiterimaModal(idx){
  closeModal();
  const row = DATA.invoices[idx];
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.innerHTML = tplMcdDiterimaModal(row, idx);
  document.body.appendChild(overlay);
  document.getElementById('modalClose').onclick = closeModal;
  document.getElementById('modalCancel').onclick = closeModal;
  overlay.onclick = (e) => { if(e.target === overlay) closeModal(); };
  document.getElementById('modalSave').onclick = () => mcdSaveDiterima(idx);
}

function mcdSaveDiterima(idx){
  const row = DATA.invoices[idx];
  const nama = document.getElementById('fMcdNamaPenerima').value.trim();
  const keterangan = document.getElementById('fMcdKeterangan').value.trim();
  if(!nama){
    const el = document.getElementById('fMcdErr');
    el.textContent = 'Nama Penerima wajib diisi.';
    el.style.display = 'block';
    return;
  }
  const opt = document.querySelector('input[name="mcdDiterimaOpt"]:checked');
  const status = opt ? opt.value : 'Diterima';
  row.mcdHistory = row.mcdHistory || [];
  row.mcdHistory.push({
    tanggal: mcdNowLabel(),
    username: 'sidik',
    status: status === 'Diterima' ? 'Diterima Customer' : status,
    keterangan: `${status} — Nama Penerima: ${nama}.${keterangan ? ' ' + keterangan : ''}`,
  });
  closeModal();
  renderMcdTable();
}

function openMcdTukarFakturModal(idx){
  closeModal();
  const row = DATA.invoices[idx];
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.innerHTML = tplMcdTukarFakturModal(row, idx);
  document.body.appendChild(overlay);
  document.getElementById('modalClose').onclick = closeModal;
  document.getElementById('modalCancel').onclick = closeModal;
  overlay.onclick = (e) => { if(e.target === overlay) closeModal(); };
  document.getElementById('modalSave').onclick = () => mcdSaveTukarFaktur(idx);
}

function mcdSaveTukarFaktur(idx){
  const row = DATA.invoices[idx];
  const keterangan = document.getElementById('fMcdTukarKeterangan').value.trim();
  row.mcdHistory = row.mcdHistory || [];
  row.mcdHistory.push({
    tanggal: mcdNowLabel(),
    username: 'sidik',
    status: 'Sudah Tukar Faktur / Pemberkasan',
    keterangan: keterangan || 'Faktur asli sudah ditukar & berkas lengkap.',
  });
  closeModal();
  renderMcdTable();
}

function mcdInfo(title, text){
  closeModal();
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.innerHTML = tplMcdInfoModal(title, text);
  document.body.appendChild(overlay);
  document.getElementById('modalClose').onclick = closeModal;
  document.getElementById('modalOk').onclick = closeModal;
}
