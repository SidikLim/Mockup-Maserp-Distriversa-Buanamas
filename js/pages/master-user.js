/* =========================================================
   LOGIC (JS saja) — Master User (menu User Security > Master User, page
   'users'). Dimuat otomatis (lazy-load) oleh core.js saat menu ini pertama
   kali diklik — lihat PAGE_MODULES di js/core.js (entry generik lama di
   objek `pages` sudah DIHAPUS). Markup HTML-nya ada di file sebelah:
   master-user.template.js (tplMasterUserListPage/tplUsrRows/tplUsrPager/
   tplMasterUserForm/tplUsrPbRows/tplUsrCabangPickerModal/
   tplUsrRayonPickerModal/tplUsrAreaPickerModal/tplUsrSofficePickerModal/
   tplUsrAksesInfoModal/tplUsrDeleteConfirm, plus USR_ROLE_LIST/
   USR_CABANG_LIST/USR_SOFFICE_LIST). NB: closeModal() dipakai bersama,
   didefinisikan di core.js.

   Pola CRUD: list (page-size 10 default + Pencarian Global SUNGGUHAN,
   filter username/nama/role) + pager STANDAR genuinely FUNGSIONAL (beda
   dari kebanyakan modul lain yang pager standarnya dekoratif — di sini
   93 baris data beneran perlu dipaginasi) + form FULL PAGE (sama seperti
   Master Rayon/Wilayah/Group User) dengan 4 picker (Cabang/Rayon/Area/
   Sales Office) + sub-grid "Perusahaan/Bank" yang membuat ENTITAS BARU
   per baris (pola sama seperti Kecamatan di Master Rayon).
========================================================= */

let usrState = { page:1, search:'' };

function renderMasterUserPage(){
  renderUsrList();
}

function renderUsrList(){
  content.innerHTML = tplMasterUserListPage();
  usrState = { page:1, search:'' };
  document.getElementById('btnUsrAdd').onclick = () => openUsrForm('add');
  document.getElementById('btnUsrTutorial').onclick = () => alert('Tutorial video akan tersedia di sini. (Contoh tampilan mockup)');
  document.getElementById('usrPageSize').onchange = () => { usrState.page = 1; renderUsrTable(); };
  document.getElementById('usrSearch').oninput = (e) => {
    usrState.search = e.target.value.trim().toLowerCase();
    usrState.page = 1;
    renderUsrTable();
  };
  renderUsrTable();
}

function usrPageSize(){
  const sel = document.getElementById('usrPageSize');
  return sel ? parseInt(sel.value, 10) : USR_PAGE_SIZE_DEFAULT;
}

function usrFiltered(){
  if (!usrState.search) return DATA.users;
  const q = usrState.search;
  return DATA.users.filter(r =>
    r.username.toLowerCase().includes(q) ||
    r.nama.toLowerCase().includes(q) ||
    r.role.toLowerCase().includes(q));
}

function renderUsrTable(){
  const perPage = usrPageSize();
  const filtered = usrFiltered();
  const totalFiltered = filtered.length;
  const totalPages = Math.max(1, Math.ceil(totalFiltered/perPage));
  if (usrState.page > totalPages) usrState.page = totalPages;
  if (usrState.page < 1) usrState.page = 1;
  const startIdx = (usrState.page-1) * perPage;
  const pageRows = filtered.slice(startIdx, startIdx+perPage);

  document.getElementById('usrTbody').innerHTML = tplUsrRows(pageRows);
  document.getElementById('usrTotal').textContent = `Total Record: ${totalFiltered}`;
  document.getElementById('usrPagerWrap').innerHTML = tplUsrPager(usrState.page, totalPages);

  document.getElementById('usrTbody').querySelectorAll('[data-edit]').forEach(b => b.onclick = () => openUsrForm('edit', +b.dataset.edit));
  document.getElementById('usrTbody').querySelectorAll('[data-del]').forEach(b => b.onclick = () => openUsrDeleteConfirm(+b.dataset.del));
  wireUsrPagerEvents(totalPages);
}

function wireUsrPagerEvents(totalPages){
  const wrap = document.getElementById('usrPagerWrap');
  const goTo = (p) => { usrState.page = Math.min(Math.max(1,p), totalPages); renderUsrTable(); };
  wrap.querySelector('[data-usr-first]').onclick = () => goTo(1);
  wrap.querySelector('[data-usr-prev]').onclick = () => goTo(usrState.page-1);
  wrap.querySelector('[data-usr-next]').onclick = () => goTo(usrState.page+1);
  wrap.querySelector('[data-usr-last]').onclick = () => goTo(totalPages);
  wrap.querySelectorAll('[data-usr-page]').forEach(b => b.onclick = () => goTo(+b.dataset.usrPage));
}

function usrEmptyRow(){
  return {
    username:'', nama:'', email:'', role: USR_ROLE_LIST[1].kode /* default 'SLS' */,
    cabangKode:'', salesman:'', rayonKode:'', areaKode:'', salesOffice:'',
    signature:false, perusahaanBank:[],
  };
}

function openUsrForm(mode, idx){
  const row = mode==='add' ? usrEmptyRow() : JSON.parse(JSON.stringify(DATA.users[idx]));
  content.innerHTML = tplMasterUserForm(mode, row);

  document.getElementById('btnUsrCabangSearch').onclick = () => openUsrCabangPicker(row);
  document.getElementById('btnUsrRayonSearch').onclick = () => openUsrRayonPicker(row);
  document.getElementById('btnUsrAreaSearch').onclick = () => openUsrAreaPicker(row);
  document.getElementById('btnUsrSofficeSearch').onclick = () => openUsrSofficePicker(row);
  document.getElementById('btnUsrAksesInfo').onclick = () => openUsrAksesInfo();

  document.getElementById('btnUsrSignatureUpload').onclick = () => {
    row.signature = true;
    document.getElementById('fUsrSignatureBox').textContent = 'Signature Tersimpan';
  };
  document.getElementById('btnUsrSignatureHapus').onclick = () => {
    row.signature = false;
    document.getElementById('fUsrSignatureBox').textContent = '200 x 100';
  };

  wireUsrPbRows(row);
  document.getElementById('btnUsrPbAdd').onclick = (e) => {
    e.preventDefault();
    row.perusahaanBank.push({ perusahaan:'PT Distriversa Buanamas', bank:'' });
    renderUsrPbSection(row);
  };

  document.getElementById('usrSave').onclick = () => usrSave(mode, idx, row);
  document.getElementById('usrCancel').onclick = () => renderUsrList();
}

function renderUsrPbSection(row){
  document.getElementById('usrPbTbody').innerHTML = tplUsrPbRows(row.perusahaanBank);
  wireUsrPbRows(row);
}

function wireUsrPbRows(row){
  const tbody = document.getElementById('usrPbTbody');
  tbody.querySelectorAll('[data-pb-perusahaan]').forEach(inp => {
    inp.oninput = (e) => { row.perusahaanBank[+e.target.dataset.pbPerusahaan].perusahaan = e.target.value; };
  });
  tbody.querySelectorAll('[data-pb-bank]').forEach(sel => {
    sel.onchange = (e) => { row.perusahaanBank[+e.target.dataset.pbBank].bank = e.target.value; };
  });
  tbody.querySelectorAll('[data-pb-del]').forEach(btn => {
    btn.onclick = () => {
      row.perusahaanBank.splice(+btn.dataset.pbDel, 1);
      renderUsrPbSection(row);
    };
  });
}

function openUsrCabangPicker(row){
  closeModal();
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.innerHTML = tplUsrCabangPickerModal();
  document.body.appendChild(overlay);
  document.getElementById('modalClose').onclick = closeModal;
  document.getElementById('modalCancel').onclick = closeModal;
  overlay.onclick = (e) => { if(e.target === overlay) closeModal(); };
  overlay.querySelectorAll('[data-pick-cabang]').forEach(btn => btn.onclick = () => {
    row.cabangKode = btn.dataset.pickCabang;
    document.getElementById('fUsrCabangDisplay').value = usrCabangNama(row.cabangKode);
    closeModal();
  });
}

function openUsrRayonPicker(row){
  closeModal();
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.innerHTML = tplUsrRayonPickerModal();
  document.body.appendChild(overlay);
  document.getElementById('modalClose').onclick = closeModal;
  document.getElementById('modalCancel').onclick = closeModal;
  overlay.onclick = (e) => { if(e.target === overlay) closeModal(); };

  const wireRows = () => {
    overlay.querySelectorAll('[data-pick-rayon]').forEach(btn => btn.onclick = () => {
      row.rayonKode = btn.dataset.pickRayon;
      document.getElementById('fUsrRayonDisplay').value = usrRayonNama(row.rayonKode);
      closeModal();
    });
  };
  wireRows();
  document.getElementById('usrRayonPickerSearch').oninput = (e) => {
    const q = e.target.value.trim().toLowerCase();
    const filtered = DATA.rayon.filter(r => r.kode.toLowerCase().includes(q) || r.nama.toLowerCase().includes(q));
    document.getElementById('usrRayonPickerBody').innerHTML = tplUsrRayonPickerRows(filtered);
    wireRows();
  };
}

function openUsrAreaPicker(row){
  closeModal();
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.innerHTML = tplUsrAreaPickerModal();
  document.body.appendChild(overlay);
  document.getElementById('modalClose').onclick = closeModal;
  document.getElementById('modalCancel').onclick = closeModal;
  overlay.onclick = (e) => { if(e.target === overlay) closeModal(); };
  overlay.querySelectorAll('[data-pick-area]').forEach(btn => btn.onclick = () => {
    row.areaKode = btn.dataset.pickArea;
    document.getElementById('fUsrAreaDisplay').value = usrAreaNama(row.areaKode);
    closeModal();
  });
}

function openUsrSofficePicker(row){
  closeModal();
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.innerHTML = tplUsrSofficePickerModal();
  document.body.appendChild(overlay);
  document.getElementById('modalClose').onclick = closeModal;
  document.getElementById('modalCancel').onclick = closeModal;
  overlay.onclick = (e) => { if(e.target === overlay) closeModal(); };
  overlay.querySelectorAll('[data-pick-soffice]').forEach(btn => btn.onclick = () => {
    row.salesOffice = btn.dataset.pickSoffice;
    document.getElementById('fUsrSofficeDisplay').value = row.salesOffice;
    closeModal();
  });
}

function openUsrAksesInfo(){
  closeModal();
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.innerHTML = tplUsrAksesInfoModal();
  document.body.appendChild(overlay);
  document.getElementById('modalClose2').onclick = () => overlay.remove();
  document.getElementById('modalCancel2').onclick = () => overlay.remove();
  overlay.onclick = (e) => { if(e.target === overlay) overlay.remove(); };
}

function usrSave(mode, idx, row){
  // Username (mode add saja)/Nama/Email/Salesman/Level Pemakai TIDAK punya
  // oninput handler yang menulis langsung ke `row` (beda dari Cabang/
  // Rayon/Area/Sales Office/Signature/Perusahaan-Bank yang sudah live-
  // bind) — nilai terbaru dari DOM HARUS dibaca eksplisit di sini dulu,
  // sama seperti pola rySave()/wlSave()/guSave() di modul lain.
  if (mode === 'add'){
    row.username = document.getElementById('fUsrUsername').value.trim();
  }
  row.nama = document.getElementById('fUsrNama').value.trim();
  row.email = document.getElementById('fUsrEmail').value.trim();
  row.salesman = document.getElementById('fUsrSalesman').value;
  row.role = document.getElementById('fUsrRole').value;
  // Password Terdahulu/New Password SENGAJA tidak disimpan ke DATA (tidak
  // ada backend/crypto sungguhan di mockup ini, sama seperti field
  // password lain yang murni dekoratif kalau ada di modul lain).

  if (!row.username){ alert('User Name wajib diisi.'); return; }
  if (mode === 'add' && DATA.users.some(u => u.username === row.username)){
    alert('Username sudah dipakai, gunakan username lain.');
    return;
  }
  if (!row.nama){ alert('Nama wajib diisi.'); return; }

  if (mode === 'add'){
    DATA.users.push(row);
  } else {
    DATA.users[idx] = row;
  }
  renderUsrList();
}

function openUsrDeleteConfirm(idx){
  closeModal();
  const row = DATA.users[idx];
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.innerHTML = tplUsrDeleteConfirm(row);
  document.body.appendChild(overlay);
  document.getElementById('modalClose').onclick = closeModal;
  document.getElementById('modalCancel').onclick = closeModal;
  overlay.onclick = (e) => { if(e.target === overlay) closeModal(); };
  document.getElementById('modalDelete').onclick = () => {
    DATA.users.splice(idx, 1);
    closeModal();
    renderUsrTable();
  };
}
