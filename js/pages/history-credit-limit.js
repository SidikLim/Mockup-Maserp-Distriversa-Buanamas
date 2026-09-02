/* =========================================================
   LOGIC (JS saja) — History Credit Limit Customer (Customer &
   Penjualan > Master & Setting > History Credit Limit,
   page:'historyCreditLimit'). Dimuat otomatis (lazy-load) oleh
   core.js saat menu ini pertama kali diklik — lihat
   PAGE_MODULES di js/core.js. Markup HTML-nya ada di file
   sebelah: history-credit-limit.template.js.
   NB: closeModal() dipakai bersama, didefinisikan di core.js.

   Read-only (tidak ada Tambah/Ubah/Hapus) — cuma sort kolom,
   pager windowed, Pencarian Global, filter Jenis/Status, dan
   modal "Lihat" detail per baris. Lihat catatan desain lengkap
   di history-credit-limit.template.js.
========================================================= */

let hclState = { page:1, search:'', filterJenis:'', filterStatus:'', sortField:'tanggal', sortDir:'desc' };

/* Parse tanggal format 'dd/mm/yyyy' (konsisten format tanggal
   mockup ini) jadi angka yang bisa dibandingkan untuk sort —
   salinan lokal kecil, bukan cross-module dependency (lazy-load
   antar modul tidak terjamin urutannya, pola sama seperti
   duplikasi konstanta lain di mockup ini). */
function hclDateVal(str){
  if(!str) return 0;
  const parts = str.split('/');
  if(parts.length !== 3) return 0;
  const [d,m,y] = parts.map(Number);
  return y*10000 + m*100 + d;
}

function renderHistoryCreditLimitPage(){
  content.innerHTML = tplHclPage();
  hclState = { page:1, search:'', filterJenis:'', filterStatus:'', sortField:'tanggal', sortDir:'desc' };
  document.getElementById('hclPageSize').onchange = () => { hclState.page = 1; renderHclTable(); };
  document.getElementById('hclSearch').oninput = (e) => {
    hclState.search = e.target.value.trim().toLowerCase();
    hclState.page = 1;
    renderHclTable();
  };
  document.getElementById('hclFilterJenis').onchange = (e) => {
    hclState.filterJenis = e.target.value;
    hclState.page = 1;
    renderHclTable();
  };
  document.getElementById('hclFilterStatus').onchange = (e) => {
    hclState.filterStatus = e.target.value;
    hclState.page = 1;
    renderHclTable();
  };
  document.querySelectorAll('[data-hcl-sort]').forEach(el => el.onclick = () => {
    const field = el.dataset.hclSort;
    if(hclState.sortField === field){
      hclState.sortDir = hclState.sortDir === 'asc' ? 'desc' : 'asc';
    } else {
      hclState.sortField = field;
      hclState.sortDir = field === 'tanggal' ? 'desc' : 'asc';
    }
    hclState.page = 1;
    renderHclTable();
  });
  renderHclTable();
}

function hclPageSize(){
  const sel = document.getElementById('hclPageSize');
  return sel ? parseInt(sel.value, 10) : 10;
}

function hclFilteredSortedRows(){
  const q = hclState.search;
  let rows = DATA.historyCreditLimit.filter(r => {
    if(q && !((r.customerKode||'').toLowerCase().includes(q) || (r.customerNama||'').toLowerCase().includes(q))) return false;
    if(hclState.filterJenis && r.jenis !== hclState.filterJenis) return false;
    if(hclState.filterStatus && r.status !== hclState.filterStatus) return false;
    return true;
  });
  const field = hclState.sortField;
  const dir = hclState.sortDir === 'desc' ? -1 : 1;
  rows.sort((a,b) => {
    if(field === 'tanggal') return (hclDateVal(a.tanggal) - hclDateVal(b.tanggal)) * dir;
    return String(a[field]||'').localeCompare(String(b[field]||''), 'id') * dir;
  });
  return rows;
}

function renderHclTable(){
  const perPage = hclPageSize();
  const filtered = hclFilteredSortedRows();
  const totalPages = Math.max(1, Math.ceil(filtered.length/perPage));
  if(hclState.page > totalPages) hclState.page = totalPages;
  if(hclState.page < 1) hclState.page = 1;

  document.getElementById('hclTbody').innerHTML = tplHclRows(filtered, hclState.page, perPage);
  document.getElementById('hclTotal').textContent = `Total Record: ${filtered.length}`;
  document.getElementById('hclPager').innerHTML = tplHclPager(hclState.page, totalPages);

  ['customerKode','customerNama','tanggal','status'].forEach(f => {
    const el = document.getElementById(`hclSortIcon_${f}`);
    if(!el) return;
    if(hclState.sortField === f){
      el.innerHTML = hclState.sortDir === 'asc' ? '&#8593;' : '&#8595;';
      el.style.color = 'var(--blue)';
    } else {
      el.innerHTML = '&#8693;';
      el.style.color = 'var(--text-light)';
    }
  });

  const tbody = document.getElementById('hclTbody');
  tbody.querySelectorAll('[data-view]').forEach(b => b.onclick = () => openHclDetail(+b.dataset.view));

  const pager = document.getElementById('hclPager');
  pager.querySelectorAll('[data-hclpage]').forEach(b => b.onclick = () => { hclState.page = +b.dataset.hclpage; renderHclTable(); });
}

function openHclDetail(idx){
  closeModal();
  const row = DATA.historyCreditLimit[idx];
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.innerHTML = tplHclDetailModal(row);
  document.body.appendChild(overlay);
  document.getElementById('modalClose').onclick = closeModal;
  document.getElementById('modalCancel').onclick = closeModal;
  overlay.onclick = (e) => { if(e.target === overlay) closeModal(); };
}
