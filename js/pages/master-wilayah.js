/* =========================================================
   LOGIC (JS saja) — Master Area/Wilayah (menu Lain-lain > Wilayah,
   page 'masterWilayah'). Dimuat otomatis (lazy-load) oleh core.js saat
   menu ini pertama kali diklik — lihat PAGE_MODULES di js/core.js.
   Markup HTML-nya ada di file sebelah: master-wilayah.template.js
   (tplMasterWilayahListPage/tplWlRows/tplWilayahForm/tplWlRayonRows/
   tplWlSofficePickerModal/tplWlDeleteConfirm, plus WL_CABANG_LIST/
   WL_SUPERVISOR_LIST).
   NB: closeModal() dipakai bersama, didefinisikan di core.js.

   Pola CRUD: list + form FULL PAGE (sama seperti Master Rayon/Master
   Customer) + sub-grid nested "Rayon" yang BEDA sifatnya dari
   Kecamatan di Master Rayon: di sini setiap baris cuma <select> yang
   MENAUTKAN ke rayon YANG SUDAH ADA di DATA.rayon (row.rayonKode[]
   menyimpan array of kode, bukan objek baru), jadi "+ Tambah Rayon"
   cukup menambah 1 entry baru berisi kode rayon pertama yang belum
   dipakai baris lain (fallback ke rayon pertama kalau semua sudah
   dipakai) — user tinggal ganti dropdown-nya kalau mau rayon lain.
========================================================= */

function renderMasterWilayahPage(){
  renderWlList();
}

function renderWlList(){
  content.innerHTML = tplMasterWilayahListPage();
  document.getElementById('btnWlAdd').onclick = () => openWlForm('add');
  document.getElementById('btnWlTutorial').onclick = () => alert('Tutorial video akan tersedia di sini. (Contoh tampilan mockup)');
  renderWlTable();
}

function renderWlTable(){
  const tbody = document.getElementById('wlTbody');
  const total = document.getElementById('wlTotal');
  const rows = DATA.area;
  tbody.innerHTML = tplWlRows(rows);
  total.textContent = `Total Record: ${rows.length}`;
  tbody.querySelectorAll('[data-edit]').forEach(b => b.onclick = () => openWlForm('edit', +b.dataset.edit));
  tbody.querySelectorAll('[data-del]').forEach(b => b.onclick = () => openWlDeleteConfirm(+b.dataset.del));
}

function wlNextKode(){
  let n = 1;
  while (DATA.area.some(r => r.kode === `AREA-BARU-${n}`)) n++;
  return `AREA-BARU-${n}`;
}

function wlEmptyRow(){
  return {
    kode: wlNextKode(), nama:'', supervisor: WL_SUPERVISOR_LIST[0], isDefault:false,
    gudang: WL_CABANG_LIST[0], invoicing: WL_CABANG_LIST[0], salesOffice:'', status:'Aktif', rayonKode:[],
  };
}

function openWlForm(mode, idx){
  const row = mode==='add' ? wlEmptyRow() : JSON.parse(JSON.stringify(DATA.area[idx]));
  content.innerHTML = tplWilayahForm(mode, row);

  document.getElementById('fWlDefault').onchange = (e) => {
    document.getElementById('fWlDefaultLabel').textContent = e.target.checked ? 'Ya' : 'Tidak';
  };

  document.getElementById('btnWlSofficeSearch').onclick = () => openWlSofficePicker(row);
  wireWlRayonRows(row);

  document.getElementById('btnWlRayonAdd').onclick = (e) => {
    e.preventDefault();
    const used = new Set(row.rayonKode);
    const next = DATA.rayon.find(r => !used.has(r.kode)) || DATA.rayon[0];
    row.rayonKode.push(next.kode);
    renderWlRayonSection(row);
  };

  document.getElementById('wlSave').onclick = () => wlSave(mode, idx, row);
  document.getElementById('wlCancel').onclick = () => renderWlList();
}

function renderWlRayonSection(row){
  document.getElementById('wlRayonTbody').innerHTML = tplWlRayonRows(row.rayonKode);
  wireWlRayonRows(row);
}

function wireWlRayonRows(row){
  const tbody = document.getElementById('wlRayonTbody');
  tbody.querySelectorAll('[data-rayon-idx]').forEach(sel => {
    sel.onchange = (e) => { row.rayonKode[+e.target.dataset.rayonIdx] = e.target.value; };
  });
  tbody.querySelectorAll('[data-rayon-del]').forEach(btn => {
    btn.onclick = () => {
      row.rayonKode.splice(+btn.dataset.rayonDel, 1);
      renderWlRayonSection(row);
    };
  });
}

function openWlSofficePicker(row){
  closeModal();
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.innerHTML = tplWlSofficePickerModal();
  document.body.appendChild(overlay);
  document.getElementById('modalClose').onclick = closeModal;
  document.getElementById('modalCancel').onclick = closeModal;
  overlay.onclick = (e) => { if(e.target === overlay) closeModal(); };
  overlay.querySelectorAll('[data-pick-soffice]').forEach(btn => btn.onclick = () => {
    row.salesOffice = btn.dataset.pickSoffice;
    document.getElementById('fWlSalesOffice').value = wlSofficeNama(row.salesOffice);
    closeModal();
  });
}

function wlSave(mode, idx, row){
  // Nama/Gudang/Invoicing/Supervisor/Status TIDAK punya oninput handler
  // yang menulis langsung ke `row` (beda dari Default/Rayon yang sudah
  // live-bind) — nilai terbaru dari DOM HARUS dibaca eksplisit di sini
  // dulu, sama seperti pola rySave() di master-rayon.js.
  row.nama = document.getElementById('fWlNama').value.trim();
  row.gudang = document.getElementById('fWlGudang').value;
  row.invoicing = document.getElementById('fWlInvoicing').value;
  row.supervisor = document.getElementById('fWlSupervisor').value;
  row.isDefault = document.getElementById('fWlDefault').checked;
  row.status = document.querySelector('input[name="fWlStatus"]:checked').value;

  if (!row.nama){ alert('Nama Wilayah wajib diisi.'); return; }
  if (mode === 'add'){
    DATA.area.push(row);
  } else {
    DATA.area[idx] = row;
  }
  renderWlList();
}

function openWlDeleteConfirm(idx){
  closeModal();
  const row = DATA.area[idx];
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.innerHTML = tplWlDeleteConfirm(row);
  document.body.appendChild(overlay);
  document.getElementById('modalClose').onclick = closeModal;
  document.getElementById('modalCancel').onclick = closeModal;
  overlay.onclick = (e) => { if(e.target === overlay) closeModal(); };
  document.getElementById('modalDelete').onclick = () => {
    DATA.area.splice(idx, 1);
    closeModal();
    renderWlTable();
  };
}
