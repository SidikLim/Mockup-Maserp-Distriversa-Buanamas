/* =========================================================
   LOGIC (JS saja) — Rumus Komisi Salesman (Customer & Penjualan
   > Master & Setting > Rumus Komisi Salesman, page:
   'rumusKomisiSalesman'). Dimuat otomatis (lazy-load) oleh
   core.js saat menu ini pertama kali diklik — lihat
   PAGE_MODULES di js/core.js. Markup HTML-nya ada di file
   sebelah: rumus-komisi-salesman.template.js.
   NB: closeModal() dipakai bersama, didefinisikan di core.js.

   Pola CRUD kode manual (bukan auto-generate), wajib unik,
   readonly di mode Ubah — sama seperti Satuan/Group Produk —
   + sort kolom & pager windowed sungguhan fungsional. Form
   selalu berisi TEPAT 5 baris Tingkat (fixed, tidak ada tambah/
   hapus baris) — lihat catatan lengkap di
   rumus-komisi-salesman.template.js.
========================================================= */

let rksState = { page:1, search:'', sortField:'kode', sortDir:'asc' };

function renderRumusKomisiSalesmanPage(){
  rksState = { page:1, search:'', sortField:'kode', sortDir:'asc' };
  renderRksList();
}

/* Beda dari renderRumusKomisiSalesmanPage(): TIDAK me-reset
   rksState (sort/search/page yang sedang aktif) — dipanggil saat
   kembali ke list dari form Tambah/Ubah (Simpan/Batalkan) supaya
   posisi sort/pencarian/halaman yang sedang dilihat user tidak
   ter-reset ke default begitu saja tiap kali selesai edit. */
function renderRksList(){
  content.innerHTML = tplRksListPage();
  document.getElementById('rksSearch').value = rksState.search;
  document.getElementById('btnRksAdd').onclick = () => openRksForm('add');
  document.getElementById('rksPageSize').onchange = () => { rksState.page = 1; renderRksTable(); };
  document.getElementById('rksSearch').oninput = (e) => {
    rksState.search = e.target.value.trim().toLowerCase();
    rksState.page = 1;
    renderRksTable();
  };
  document.querySelectorAll('[data-rks-sort]').forEach(el => el.onclick = () => {
    const field = el.dataset.rksSort;
    if(rksState.sortField === field){
      rksState.sortDir = rksState.sortDir === 'asc' ? 'desc' : 'asc';
    } else {
      rksState.sortField = field;
      rksState.sortDir = 'asc';
    }
    rksState.page = 1;
    renderRksTable();
  });
  renderRksTable();
}

function rksPageSize(){
  const sel = document.getElementById('rksPageSize');
  return sel ? parseInt(sel.value, 10) : 10;
}

function rksFilteredSortedRows(){
  const q = rksState.search;
  let rows = !q ? DATA.rumusKomisiSalesman.slice() : DATA.rumusKomisiSalesman.filter(r =>
    (r.kode||'').toLowerCase().includes(q) || (r.keterangan||'').toLowerCase().includes(q));
  const field = rksState.sortField;
  const dir = rksState.sortDir === 'desc' ? -1 : 1;
  rows.sort((a,b) => String(a[field]||'').localeCompare(String(b[field]||''), 'id') * dir);
  return rows;
}

function renderRksTable(){
  const perPage = rksPageSize();
  const filtered = rksFilteredSortedRows();
  const totalPages = Math.max(1, Math.ceil(filtered.length/perPage));
  if(rksState.page > totalPages) rksState.page = totalPages;
  if(rksState.page < 1) rksState.page = 1;

  document.getElementById('rksTbody').innerHTML = tplRksRows(filtered, rksState.page, perPage);
  document.getElementById('rksTotal').textContent = `Total Record: ${filtered.length}`;
  document.getElementById('rksPager').innerHTML = tplRksPager(rksState.page, totalPages);

  ['kode','keterangan'].forEach(f => {
    const el = document.getElementById(`rksSortIcon_${f}`);
    if(!el) return;
    if(rksState.sortField === f){
      el.innerHTML = rksState.sortDir === 'asc' ? '&#8593;' : '&#8595;';
      el.style.color = 'var(--blue)';
    } else {
      el.innerHTML = '&#8693;';
      el.style.color = 'var(--text-light)';
    }
  });

  const tbody = document.getElementById('rksTbody');
  tbody.querySelectorAll('[data-edit]').forEach(b => b.onclick = (e) => { e.preventDefault(); openRksForm('edit', +b.dataset.edit); });
  tbody.querySelectorAll('[data-del]').forEach(b => b.onclick = () => openRksDeleteConfirm(+b.dataset.del));

  const pager = document.getElementById('rksPager');
  pager.querySelectorAll('[data-rkspage]').forEach(b => b.onclick = () => { rksState.page = +b.dataset.rkspage; renderRksTable(); });
}

function rksEmptyTingkat(){
  return [0,1,2,3,4].map(() => ({ min:0, max:0, persen:0 }));
}

function openRksForm(mode, idx){
  const row = mode === 'edit' ? DATA.rumusKomisiSalesman[idx] : { kode:'', keterangan:'', tingkat: rksEmptyTingkat() };
  content.innerHTML = tplRksForm(mode, row);
  document.getElementById('btnRksTutorial').onclick = () => openRksInfo('Tutorial', 'Video tutorial pengisian Rumus Komisi Salesman akan tersedia di sini.');
  document.getElementById('rksBatalkan').onclick = (e) => { e.preventDefault(); renderRksList(); };
  document.getElementById('rksSimpan').onclick = () => {
    const kode = document.getElementById('fRksKode').value.trim().toUpperCase();
    const keterangan = document.getElementById('fRksKeterangan').value.trim();
    let ok = true;
    if(!kode){
      document.getElementById('fRksKodeErr').style.display = 'block'; ok = false;
    } else if(mode === 'add' && DATA.rumusKomisiSalesman.some(r => r.kode.toUpperCase() === kode)){
      document.getElementById('fRksKodeErr').textContent = 'Kode sudah dipakai, gunakan kode lain';
      document.getElementById('fRksKodeErr').style.display = 'block'; ok = false;
    } else {
      document.getElementById('fRksKodeErr').style.display = 'none';
    }
    if(!keterangan){ document.getElementById('fRksKeteranganErr').style.display = 'block'; ok = false; }
    else { document.getElementById('fRksKeteranganErr').style.display = 'none'; }
    if(!ok) return;

    const tingkat = [0,1,2,3,4].map(i => ({
      min: rksParseNum(document.getElementById(`fRksMin_${i}`).value),
      max: rksParseNum(document.getElementById(`fRksMax_${i}`).value),
      persen: rksParseNum(document.getElementById(`fRksPersen_${i}`).value),
    }));

    if(mode === 'add'){
      DATA.rumusKomisiSalesman.push({ kode, keterangan, tingkat });
    } else {
      DATA.rumusKomisiSalesman[idx].keterangan = keterangan;
      DATA.rumusKomisiSalesman[idx].tingkat = tingkat;
    }
    renderRksList();
  };
}

function openRksDeleteConfirm(idx){
  closeModal();
  const row = DATA.rumusKomisiSalesman[idx];
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.innerHTML = tplRksDeleteConfirm(row);
  document.body.appendChild(overlay);
  document.getElementById('modalClose').onclick = closeModal;
  document.getElementById('modalCancel').onclick = closeModal;
  overlay.onclick = (e) => { if(e.target === overlay) closeModal(); };
  document.getElementById('modalDelete').onclick = () => {
    DATA.rumusKomisiSalesman.splice(idx, 1);
    closeModal();
    renderRksTable();
  };
}

function openRksInfo(title, text){
  closeModal();
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.innerHTML = tplRksInfoModal(title, text);
  document.body.appendChild(overlay);
  document.getElementById('modalClose').onclick = closeModal;
  document.getElementById('modalOk').onclick = closeModal;
  overlay.onclick = (e) => { if(e.target === overlay) closeModal(); };
}
