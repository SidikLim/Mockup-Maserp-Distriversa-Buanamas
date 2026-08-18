/* =========================================================
   LOGIC (JS saja) — Group User (menu User Security > Group User, page
   'groupUser'). Dimuat otomatis (lazy-load) oleh core.js saat menu ini
   pertama kali diklik — lihat PAGE_MODULES di js/core.js. Markup HTML-nya
   ada di file sebelah: group-user.template.js (tplGroupUserListPage/
   tplGuRows/tplGuPager/tplGroupUserForm/tplGuGudangPickerModal/
   tplGuDuplicatePickerModal/tplGuDeleteConfirm). NB: closeModal() dipakai
   bersama, didefinisikan di core.js.

   Pola CRUD: list (page-size 20 default + Pencarian Global SUNGGUHAN,
   filter oleh kode/nama/keterangan) + pager BARU "First < [halaman] to Y
   Of Total > Last" (guState.page, FUNGSIONAL sungguhan — reuse gaya
   tplRyKecPager di master-rayon.js tapi untuk LIST UTAMA, bukan sub-grid)
   + form FULL PAGE (sama seperti Master Rayon/Master Wilayah) dengan
   picker "Pilih Gudang" (multi-select checklist ke DATA.gudang, commit
   lewat tombol Terapkan) & "Duplicate Hak Akses dari Jabatan Lain"
   (menyalin Keterangan+Gudang dari role lain yang dipilih — simulasi
   duplikasi hak akses karena mockup ini belum punya matrix permission
   sungguhan per role).
========================================================= */

const GU_PAGE_SIZE_DEFAULT = 20;
let guState = { page:1, search:'' };

function renderGroupUserPage(){
  renderGuList();
}

function renderGuList(){
  content.innerHTML = tplGroupUserListPage();
  guState = { page:1, search:'' };
  document.getElementById('btnGuAdd').onclick = () => openGuForm('add', null, 'GRUP');
  document.getElementById('btnGuAddMngr').onclick = () => openGuForm('add', null, 'MNGR');
  document.getElementById('btnGuAddPurch').onclick = () => openGuForm('add', null, 'PURCH');
  document.getElementById('btnGuAddSales').onclick = () => openGuForm('add', null, 'SALES');
  document.getElementById('btnGuTutorial').onclick = () => alert('Tutorial video akan tersedia di sini. (Contoh tampilan mockup)');
  document.getElementById('guPageSize').onchange = () => { guState.page = 1; renderGuTable(); };
  document.getElementById('guSearch').oninput = (e) => {
    guState.search = e.target.value.trim().toLowerCase();
    guState.page = 1;
    renderGuTable();
  };
  renderGuTable();
}

function guPageSize(){
  const sel = document.getElementById('guPageSize');
  return sel ? parseInt(sel.value, 10) : GU_PAGE_SIZE_DEFAULT;
}

function guFiltered(){
  if (!guState.search) return DATA.groupUser;
  const q = guState.search;
  return DATA.groupUser.filter(r =>
    r.kode.toLowerCase().includes(q) ||
    r.nama.toLowerCase().includes(q) ||
    (r.keterangan||'').toLowerCase().includes(q));
}

function renderGuTable(){
  const perPage = guPageSize();
  const filtered = guFiltered();
  const totalFiltered = filtered.length;
  const lastPage = Math.max(1, Math.ceil(totalFiltered/perPage));
  if (guState.page > lastPage) guState.page = lastPage;
  if (guState.page < 1) guState.page = 1;
  const startIdx = (guState.page-1) * perPage;
  const pageRows = filtered.slice(startIdx, startIdx+perPage);

  document.getElementById('guTbody').innerHTML = tplGuRows(pageRows);
  document.getElementById('guPagerWrap').innerHTML = tplGuPager(guState.page, perPage, totalFiltered) + `<div id="guTotal">Total Record: ${totalFiltered}</div>`;

  document.getElementById('guTbody').querySelectorAll('[data-edit]').forEach(b => b.onclick = () => openGuForm('edit', +b.dataset.edit));
  document.getElementById('guTbody').querySelectorAll('[data-del]').forEach(b => b.onclick = () => openGuDeleteConfirm(+b.dataset.del));
  wireGuPagerEvents(lastPage);
}

function wireGuPagerEvents(lastPage){
  const wrap = document.getElementById('guPagerWrap');
  const goTo = (p) => { guState.page = Math.min(Math.max(1,p), lastPage); renderGuTable(); };
  wrap.querySelector('#guFirst').onclick = () => goTo(1);
  wrap.querySelector('#guPrev').onclick = () => goTo(guState.page-1);
  wrap.querySelector('#guNext').onclick = () => goTo(guState.page+1);
  wrap.querySelector('#guLast').onclick = () => goTo(lastPage);
  const pageInput = wrap.querySelector('#guPageInput');
  pageInput.onkeydown = (e) => {
    if (e.key === 'Enter'){
      const v = parseInt(e.target.value, 10);
      if (!isNaN(v)) goTo(v); else renderGuTable();
    }
  };
  pageInput.onblur = (e) => {
    const v = parseInt(e.target.value, 10);
    if (!isNaN(v)) goTo(v); else renderGuTable();
  };
}

function guNextKode(prefix){
  // Kode User Role baru otomatis "<prefix>-BARU-N" — konsisten dgn pola
  // ryNextKode()/wlNextKode(). Prefix datang dari tombol quick-add
  // ("+Add MNGR"/"+Add PURCH"/"+Add SALES") atau "GRUP" utk tombol "+Add"
  // generik, supaya kode baru langsung mencerminkan tombol yang diklik.
  let n = 1;
  while (DATA.groupUser.some(r => r.kode === `${prefix}-BARU-${n}`)) n++;
  return `${prefix}-BARU-${n}`;
}

function guEmptyRow(prefix){
  return { kode: guNextKode(prefix), nama:'', keterangan:'', gudangKode:[], isAdmin:false };
}

function openGuForm(mode, idx, addPrefix){
  const row = mode==='add' ? guEmptyRow(addPrefix||'GRUP') : JSON.parse(JSON.stringify(DATA.groupUser[idx]));
  content.innerHTML = tplGroupUserForm(mode, row);

  document.getElementById('fGuAdmin').onchange = (e) => {
    document.getElementById('fGuAdminLabel').textContent = e.target.checked ? 'Ya' : 'Tidak';
  };

  document.getElementById('btnGuGudangSearch').onclick = () => openGuGudangPicker(row);
  document.getElementById('btnGuDuplicate').onclick = () => openGuDuplicatePicker(row);

  document.getElementById('guSave').onclick = () => guSave(mode, idx, row);
  document.getElementById('guCancel').onclick = () => renderGuList();
}

function openGuGudangPicker(row){
  closeModal();
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.innerHTML = tplGuGudangPickerModal(row.gudangKode);
  document.body.appendChild(overlay);
  document.getElementById('modalClose').onclick = closeModal;
  document.getElementById('modalCancel').onclick = closeModal;
  overlay.onclick = (e) => { if(e.target === overlay) closeModal(); };
  document.getElementById('guGudangApply').onclick = () => {
    const checked = Array.from(overlay.querySelectorAll('[data-gudang-chk]:checked')).map(c => c.dataset.gudangChk);
    row.gudangKode = checked;
    document.getElementById('fGuGudang').value = row.gudangKode.join(';');
    closeModal();
  };
}

function openGuDuplicatePicker(row){
  closeModal();
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.innerHTML = tplGuDuplicatePickerModal(row.kode);
  document.body.appendChild(overlay);
  document.getElementById('modalClose').onclick = closeModal;
  document.getElementById('modalCancel').onclick = closeModal;
  overlay.onclick = (e) => { if(e.target === overlay) closeModal(); };

  const wireRows = () => {
    overlay.querySelectorAll('[data-pick-dup]').forEach(btn => btn.onclick = () => {
      const source = DATA.groupUser.find(r => r.kode === btn.dataset.pickDup);
      if (source){
        row.keterangan = source.keterangan;
        row.gudangKode = [...source.gudangKode];
        document.getElementById('fGuKeterangan').value = row.keterangan;
        document.getElementById('fGuGudang').value = row.gudangKode.join(';');
      }
      closeModal();
      alert(`Hak akses berhasil diduplikasi dari role ${btn.dataset.pickDup}. (Contoh tampilan mockup — belum ada matrix permission sungguhan)`);
    });
  };
  wireRows();
  document.getElementById('guDupSearch').oninput = (e) => {
    const q = e.target.value.trim().toLowerCase();
    const filtered = DATA.groupUser.filter(r => r.kode.toLowerCase().includes(q) || r.nama.toLowerCase().includes(q));
    document.getElementById('guDupBody').innerHTML = tplGuDuplicatePickerRows(filtered, row.kode);
    wireRows();
  };
}

function guSave(mode, idx, row){
  // Nama/Keterangan/Is Administrator TIDAK punya oninput handler yang
  // menulis langsung ke `row` (beda dari Gudang/Duplicate yang sudah
  // live-bind) — nilai terbaru dari DOM HARUS dibaca eksplisit di sini
  // dulu, sama seperti pola rySave()/wlSave() di master-rayon.js/
  // master-wilayah.js.
  row.nama = document.getElementById('fGuNama').value.trim();
  row.keterangan = document.getElementById('fGuKeterangan').value.trim();
  row.isAdmin = document.getElementById('fGuAdmin').checked;

  if (!row.nama){ alert('Name wajib diisi.'); return; }
  if (mode === 'add'){
    DATA.groupUser.push(row);
  } else {
    DATA.groupUser[idx] = row;
  }
  renderGuList();
}

function openGuDeleteConfirm(idx){
  closeModal();
  const row = DATA.groupUser[idx];
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.innerHTML = tplGuDeleteConfirm(row);
  document.body.appendChild(overlay);
  document.getElementById('modalClose').onclick = closeModal;
  document.getElementById('modalCancel').onclick = closeModal;
  overlay.onclick = (e) => { if(e.target === overlay) closeModal(); };
  document.getElementById('modalDelete').onclick = () => {
    DATA.groupUser.splice(idx, 1);
    closeModal();
    renderGuTable();
  };
}
