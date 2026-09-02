/* =========================================================
   LOGIC (JS saja) — Alasan Retur (Customer & Penjualan > Master
   & Setting > Alasan Retur, page:'alasanRetur'). Dimuat otomatis
   (lazy-load) oleh core.js saat menu ini pertama kali diklik —
   lihat PAGE_MODULES di js/core.js. Markup HTML-nya ada di file
   sebelah: alasan-retur.template.js.
   NB: closeModal() dipakai bersama, didefinisikan di core.js.

   Form Tambah/Ubah FULL PAGE (bukan modal) — lihat catatan
   lengkap di alasan-retur.template.js. renderRtaList() (beda
   dari renderAlasanReturPage()) dipakai untuk kembali ke list
   dari form TANPA me-reset sort/search/page yang sedang aktif —
   pola sama Rumus Komisi Salesman.
========================================================= */

let rtaState = { page:1, search:'', sortField:'tipe', sortDir:'asc' };

function renderAlasanReturPage(){
  rtaState = { page:1, search:'', sortField:'tipe', sortDir:'asc' };
  renderRtaList();
}

function renderRtaList(){
  content.innerHTML = tplRtaListPage();
  document.getElementById('rtaSearch').value = rtaState.search;
  document.getElementById('btnRtaAdd').onclick = () => openRtaForm('add');
  document.getElementById('rtaPageSize').onchange = () => { rtaState.page = 1; renderRtaTable(); };
  document.getElementById('rtaSearch').oninput = (e) => {
    rtaState.search = e.target.value.trim().toLowerCase();
    rtaState.page = 1;
    renderRtaTable();
  };
  document.querySelectorAll('[data-rta-sort]').forEach(el => el.onclick = () => {
    const field = el.dataset.rtaSort;
    if(rtaState.sortField === field){
      rtaState.sortDir = rtaState.sortDir === 'asc' ? 'desc' : 'asc';
    } else {
      rtaState.sortField = field;
      rtaState.sortDir = 'asc';
    }
    rtaState.page = 1;
    renderRtaTable();
  });
  renderRtaTable();
}

function rtaPageSize(){
  const sel = document.getElementById('rtaPageSize');
  return sel ? parseInt(sel.value, 10) : 100;
}

function rtaFilteredSortedRows(){
  const q = rtaState.search;
  let rows = !q ? DATA.alasanRetur.slice() : DATA.alasanRetur.filter(r =>
    (r.tipe||'').toLowerCase().includes(q) || (r.alasan||'').toLowerCase().includes(q));
  const field = rtaState.sortField;
  const dir = rtaState.sortDir === 'desc' ? -1 : 1;
  rows.sort((a,b) => String(a[field]||'').localeCompare(String(b[field]||''), 'id') * dir);
  return rows;
}

function renderRtaTable(){
  const perPage = rtaPageSize();
  const filtered = rtaFilteredSortedRows();
  const totalPages = Math.max(1, Math.ceil(filtered.length/perPage));
  if(rtaState.page > totalPages) rtaState.page = totalPages;
  if(rtaState.page < 1) rtaState.page = 1;

  document.getElementById('rtaTbody').innerHTML = tplRtaRows(filtered, rtaState.page, perPage);
  document.getElementById('rtaTotal').textContent = `Total Record: ${filtered.length}`;
  document.getElementById('rtaPager').innerHTML = tplRtaPager(rtaState.page, totalPages);

  const el = document.getElementById(`rtaSortIcon_${rtaState.sortField}`);
  if(el){
    el.innerHTML = rtaState.sortDir === 'asc' ? '&#8593;' : '&#8595;';
    el.style.color = 'var(--blue)';
  }

  const tbody = document.getElementById('rtaTbody');
  tbody.querySelectorAll('[data-edit]').forEach(b => b.onclick = (e) => { e.preventDefault(); openRtaForm('edit', +b.dataset.edit); });
  tbody.querySelectorAll('[data-del]').forEach(b => b.onclick = () => openRtaDeleteConfirm(+b.dataset.del));

  const pager = document.getElementById('rtaPager');
  pager.querySelectorAll('[data-rtapage]').forEach(b => b.onclick = () => { rtaState.page = +b.dataset.rtapage; renderRtaTable(); });
}

function openRtaForm(mode, idx){
  const row = mode === 'edit' ? DATA.alasanRetur[idx] : { tipe:'', alasan:'' };
  content.innerHTML = tplRtaForm(mode, row);
  document.getElementById('rtaBatalkan').onclick = (e) => { e.preventDefault(); renderRtaList(); };
  document.getElementById('rtaSimpan').onclick = () => {
    const tipe = document.getElementById('fRtaTipe').value.trim();
    const alasan = document.getElementById('fRtaAlasan').value.trim();
    let ok = true;
    if(!tipe){ document.getElementById('fRtaTipeErr').style.display = 'block'; ok = false; }
    else { document.getElementById('fRtaTipeErr').style.display = 'none'; }
    if(!alasan){ document.getElementById('fRtaAlasanErr').style.display = 'block'; ok = false; }
    else { document.getElementById('fRtaAlasanErr').style.display = 'none'; }
    if(!ok) return;

    if(mode === 'add'){
      DATA.alasanRetur.push({ tipe, alasan });
    } else {
      DATA.alasanRetur[idx].tipe = tipe;
      DATA.alasanRetur[idx].alasan = alasan;
    }
    renderRtaList();
  };
}

function openRtaDeleteConfirm(idx){
  closeModal();
  const row = DATA.alasanRetur[idx];
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.innerHTML = tplRtaDeleteConfirm(row);
  document.body.appendChild(overlay);
  document.getElementById('modalClose').onclick = closeModal;
  document.getElementById('modalCancel').onclick = closeModal;
  overlay.onclick = (e) => { if(e.target === overlay) closeModal(); };
  document.getElementById('modalDelete').onclick = () => {
    DATA.alasanRetur.splice(idx, 1);
    closeModal();
    renderRtaTable();
  };
}
