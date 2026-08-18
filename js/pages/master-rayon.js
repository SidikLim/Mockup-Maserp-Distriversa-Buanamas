/* =========================================================
   LOGIC (JS saja) — Master Rayon (menu Lain-lain > Rayon, page
   'masterRayon'). Dimuat otomatis (lazy-load) oleh core.js saat menu
   ini pertama kali diklik — lihat PAGE_MODULES di js/core.js.
   Markup HTML-nya ada di file sebelah: master-rayon.template.js
   (tplMasterRayonListPage/tplRyRows/tplRayonForm/tplRyKecRows/
   tplRyKecPager/tplRyKecPickerModal/tplRyDeleteConfirm, plus
   RY_SALESMAN_LIST/RY_KEC_POOL/RY_KEC_PAGE_SIZE).
   NB: closeModal() dipakai bersama, didefinisikan di core.js.

   Pola CRUD: list + form FULL PAGE (sama seperti Master Customer/
   Master Supplier) + sub-grid nested "Kecamatan" yang PAGINATED
   SUNGGUHAN (bukan dekoratif) memakai pager gaya baru "First < [halaman]
   to Y Of Total > Last" — lihat ryKecState/renderRyKecSection() di
   bawah. Perubahan pada sub-grid Kecamatan disimpan ke row.kecamatan
   HANYA saat form disimpan (tombol Simpan), sama seperti pola form
   Master Customer/Grup Customer (edit-in-place lalu commit saat save),
   BUKAN auto-save per-baris.
========================================================= */

function renderMasterRayonPage(){
  renderRyList();
}

function renderRyList(){
  content.innerHTML = tplMasterRayonListPage();
  document.getElementById('btnRyAdd').onclick = () => openRyForm('add');
  renderRyTable();
}

function renderRyTable(){
  const tbody = document.getElementById('ryTbody');
  const total = document.getElementById('ryTotal');
  const rows = DATA.rayon;
  tbody.innerHTML = tplRyRows(rows);
  total.textContent = `Total Record: ${rows.length}`;
  tbody.querySelectorAll('[data-edit]').forEach(b => b.onclick = () => openRyForm('edit', +b.dataset.edit));
  tbody.querySelectorAll('[data-del]').forEach(b => b.onclick = () => openRyDeleteConfirm(+b.dataset.del));
}

function ryNextKode(){
  // Kode Rayon baru sederhana "RAYON-BARU-N" (screenshot tidak pernah
  // menunjukkan alur Tambah Rayon baru dieksekusi, hanya form Ubah
  // yang terlihat) — cukup pastikan unik & tidak menabrak 35 kode
  // existing.
  let n = 1;
  while (DATA.rayon.some(r => r.kode === `RAYON-BARU-${n}`)) n++;
  return `RAYON-BARU-${n}`;
}

function ryEmptyRow(){
  return { kode: ryNextKode(), nama:'', salesman: RY_SALESMAN_LIST[0], isDefault:false, kecamatan:[] };
}

let ryKecState = { page:1, search:'' };

function openRyForm(mode, idx){
  const row = mode==='add' ? ryEmptyRow() : JSON.parse(JSON.stringify(DATA.rayon[idx]));
  ryKecState = { page:1, search:'' };
  content.innerHTML = tplRayonForm(mode, row);

  document.getElementById('fRyDefault').onchange = (e) => {
    document.getElementById('fRyDefaultLabel').textContent = e.target.checked ? 'Ya' : 'Tidak';
  };

  renderRyKecSection(row);

  document.getElementById('ryKecSearch').oninput = (e) => {
    ryKecState.search = e.target.value.trim().toLowerCase();
    ryKecState.page = 1;
    renderRyKecSection(row);
  };
  document.getElementById('ryKecPageSize').onchange = () => { ryKecState.page = 1; renderRyKecSection(row); };
  document.getElementById('btnRyKecAdd').onclick = (e) => {
    e.preventDefault();
    row.kecamatan.push({ nama:'', luarKota:false });
    // lompat ke halaman terakhir supaya baris baru langsung terlihat
    const perPage = ryKecPerPage();
    ryKecState.page = Math.max(1, Math.ceil(row.kecamatan.length/perPage));
    renderRyKecSection(row);
  };

  document.getElementById('rySave').onclick = () => rySave(mode, idx, row);
  document.getElementById('ryCancel').onclick = () => renderRyList();
}

function ryKecPerPage(){
  const sel = document.getElementById('ryKecPageSize');
  return sel ? parseInt(sel.value, 10) : RY_KEC_PAGE_SIZE;
}

function ryKecFiltered(row){
  if (!ryKecState.search) return row.kecamatan;
  return row.kecamatan.filter(k => (k.nama||'').toLowerCase().includes(ryKecState.search));
}

function renderRyKecSection(row){
  const perPage = ryKecPerPage();
  const filtered = ryKecFiltered(row);
  const totalFiltered = filtered.length;
  const lastPage = Math.max(1, Math.ceil(totalFiltered/perPage));
  if (ryKecState.page > lastPage) ryKecState.page = lastPage;
  if (ryKecState.page < 1) ryKecState.page = 1;
  const startIdx = (ryKecState.page-1) * perPage;
  const pageItems = filtered.slice(startIdx, startIdx+perPage);

  // absOffset dipakai agar data-kec-* index tetap merujuk ke posisi ASLI
  // di row.kecamatan (bukan di array filtered) — dicari lewat indexOf per
  // item supaya tetap benar walau sedang difilter search.
  const tbody = document.getElementById('ryKecTbody');
  tbody.innerHTML = pageItems.map((k, i) => {
    const realIdx = row.kecamatan.indexOf(k);
    return tplRyKecRows([k], realIdx);
  }).join('');

  document.getElementById('ryKecPagerWrap').innerHTML = tplRyKecPager(ryKecState.page, perPage, totalFiltered);
  wireRyKecRowEvents(row);
  wireRyKecPagerEvents(row, lastPage);
}

function wireRyKecRowEvents(row){
  const tbody = document.getElementById('ryKecTbody');
  tbody.querySelectorAll('[data-kec-nama]').forEach(inp => {
    inp.oninput = (e) => { row.kecamatan[+e.target.dataset.kecNama].nama = e.target.value; };
  });
  tbody.querySelectorAll('[data-kec-luar]').forEach(chk => {
    chk.onchange = (e) => { row.kecamatan[+e.target.dataset.kecLuar].luarKota = e.target.checked; };
  });
  tbody.querySelectorAll('[data-kec-del]').forEach(btn => {
    btn.onclick = () => {
      row.kecamatan.splice(+btn.dataset.kecDel, 1);
      renderRyKecSection(row);
    };
  });
  tbody.querySelectorAll('[data-kec-search]').forEach(btn => {
    btn.onclick = () => openRyKecPicker(row, +btn.dataset.kecSearch);
  });
}

function wireRyKecPagerEvents(row, lastPage){
  const wrap = document.getElementById('ryKecPagerWrap');
  const goTo = (p) => { ryKecState.page = Math.min(Math.max(1,p), lastPage); renderRyKecSection(row); };
  wrap.querySelector('#ryKecFirst').onclick = () => goTo(1);
  wrap.querySelector('#ryKecPrev').onclick = () => goTo(ryKecState.page-1);
  wrap.querySelector('#ryKecNext').onclick = () => goTo(ryKecState.page+1);
  wrap.querySelector('#ryKecLast').onclick = () => goTo(lastPage);
  const pageInput = wrap.querySelector('#ryKecPageInput');
  pageInput.onkeydown = (e) => {
    if (e.key === 'Enter'){
      const v = parseInt(e.target.value, 10);
      if (!isNaN(v)) goTo(v); else renderRyKecSection(row);
    }
  };
  pageInput.onblur = (e) => {
    const v = parseInt(e.target.value, 10);
    if (!isNaN(v)) goTo(v); else renderRyKecSection(row);
  };
}

function openRyKecPicker(row, kecIdx){
  closeModal();
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.innerHTML = tplRyKecPickerModal();
  document.body.appendChild(overlay);
  document.getElementById('modalClose').onclick = closeModal;
  document.getElementById('modalCancel').onclick = closeModal;
  overlay.onclick = (e) => { if(e.target === overlay) closeModal(); };

  const wireRows = () => {
    overlay.querySelectorAll('[data-pick-kec]').forEach(btn => btn.onclick = () => {
      row.kecamatan[kecIdx].nama = btn.dataset.pickKec;
      closeModal();
      renderRyKecSection(row);
    });
  };
  wireRows();
  document.getElementById('ryKecPickerSearch').oninput = (e) => {
    const q = e.target.value.trim().toLowerCase();
    const filtered = RY_KEC_POOL.filter(nm => nm.toLowerCase().includes(q));
    document.getElementById('ryKecPickerBody').innerHTML = tplRyKecPickerRows(filtered);
    wireRows();
  };
}

function rySave(mode, idx, row){
  // Nama/Salesman/Default TIDAK punya oninput handler yang menulis
  // langsung ke `row` (beda dari field Kecamatan yang sudah live-bind),
  // jadi nilai terbaru dari DOM harus dibaca eksplisit di sini sebelum
  // disimpan — kalau tidak, field-field ini akan ke-reset ke nilai lama.
  row.nama = document.getElementById('fRyNama').value.trim();
  row.salesman = document.getElementById('fRySalesman').value;
  row.isDefault = document.getElementById('fRyDefault').checked;

  if (!row.nama){ alert('Nama Rayon wajib diisi.'); return; }
  if (mode === 'add'){
    DATA.rayon.push(row);
  } else {
    DATA.rayon[idx] = row;
  }
  renderRyList();
}

function openRyDeleteConfirm(idx){
  closeModal();
  const row = DATA.rayon[idx];
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.innerHTML = tplRyDeleteConfirm(row);
  document.body.appendChild(overlay);
  document.getElementById('modalClose').onclick = closeModal;
  document.getElementById('modalCancel').onclick = closeModal;
  overlay.onclick = (e) => { if(e.target === overlay) closeModal(); };
  document.getElementById('modalDelete').onclick = () => {
    DATA.rayon.splice(idx, 1);
    closeModal();
    renderRyTable();
  };
}
