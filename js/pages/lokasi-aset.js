/* =========================================================
   LOGIC (JS saja) — Daftar Lokasi Aset (Aktiva Tetap > Master &
   Setting > Lokasi, page:'lokasiAset'). Dimuat otomatis (lazy-
   load) oleh core.js saat menu ini pertama kali diklik — lihat
   PAGE_MODULES di js/core.js. Markup HTML-nya ada di file
   sebelah: lokasi-aset.template.js. NB: closeModal() dipakai
   bersama, didefinisikan di core.js.
========================================================= */

let lokAsetSearch = '';

function renderLokasiAsetPage(){
  content.innerHTML = tplLokAsetPage();
  lokAsetSearch = '';
  document.getElementById('btnLokAsetAdd').onclick = () => openLokAsetModal('add');
  document.getElementById('lokAsetPageSize').onchange = () => {}; // dekoratif — dataset terlalu kecil utk pagination sungguhan
  document.getElementById('lokAsetSearch').oninput = (e) => {
    lokAsetSearch = e.target.value.trim().toLowerCase();
    renderLokAsetTable();
  };
  renderLokAsetTable();
}

function lokAsetFilteredRows(){
  if(!lokAsetSearch) return DATA.lokasiAset.slice();
  return DATA.lokasiAset.filter(r => (r.kode||'').toLowerCase().includes(lokAsetSearch) || (r.nama||'').toLowerCase().includes(lokAsetSearch));
}

function renderLokAsetTable(){
  const rows = lokAsetFilteredRows();
  const tbody = document.getElementById('lokAsetTbody');
  const total = document.getElementById('lokAsetTotal');
  tbody.innerHTML = tplLokAsetRows(rows);
  total.textContent = `Total Record: ${rows.length}`;
  tbody.querySelectorAll('[data-edit]').forEach(b => b.onclick = (e) => { e.preventDefault(); openLokAsetModal('edit', +b.dataset.edit); });
  tbody.querySelectorAll('[data-del]').forEach(b => b.onclick = () => openLokAsetDeleteConfirm(+b.dataset.del));
}

function openLokAsetModal(mode, idx){
  closeModal();
  const row = mode === 'edit' ? DATA.lokasiAset[idx] : { kode: '', nama: '' };
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.innerHTML = tplLokAsetModal(mode, row);
  document.body.appendChild(overlay);
  document.getElementById('modalClose').onclick = closeModal;
  document.getElementById('modalCancel').onclick = closeModal;
  overlay.onclick = (e) => { if(e.target === overlay) closeModal(); };
  document.getElementById('modalSave').onclick = () => {
    const kode = document.getElementById('fLokAsetKode').value.trim();
    const nama = document.getElementById('fLokAsetNama').value.trim();
    let ok = true;
    if(!kode){ document.getElementById('fLokAsetKodeErr').textContent = 'Kode Lokasi wajib diisi'; document.getElementById('fLokAsetKodeErr').style.display = 'block'; ok = false; }
    else if(mode === 'add' && DATA.lokasiAset.some(r => r.kode.toLowerCase() === kode.toLowerCase())){
      document.getElementById('fLokAsetKodeErr').textContent = 'Kode sudah dipakai, gunakan kode lain'; document.getElementById('fLokAsetKodeErr').style.display = 'block'; ok = false;
    } else {
      document.getElementById('fLokAsetKodeErr').style.display = 'none';
    }
    if(!nama){ document.getElementById('fLokAsetNamaErr').style.display = 'block'; ok = false; } else { document.getElementById('fLokAsetNamaErr').style.display = 'none'; }
    if(!ok) return;
    if(mode === 'add'){ DATA.lokasiAset.push({ kode, nama }); }
    else { DATA.lokasiAset[idx].nama = nama; }
    closeModal();
    renderLokAsetTable();
  };
}

function openLokAsetDeleteConfirm(idx){
  closeModal();
  const row = DATA.lokasiAset[idx];
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.innerHTML = tplLokAsetDeleteConfirm(row);
  document.body.appendChild(overlay);
  document.getElementById('modalClose').onclick = closeModal;
  document.getElementById('modalCancel').onclick = closeModal;
  overlay.onclick = (e) => { if(e.target === overlay) closeModal(); };
  document.getElementById('modalDelete').onclick = () => {
    DATA.lokasiAset.splice(idx, 1);
    closeModal();
    renderLokAsetTable();
  };
}
