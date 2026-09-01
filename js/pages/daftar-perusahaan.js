/* =========================================================
   LOGIC (JS saja) — Daftar Perusahaan (Profil Perusahaan >
   Daftar Perusahaan, page:'daftarPerusahaan'). Dimuat otomatis
   (lazy-load) oleh core.js — lihat PAGE_MODULES di js/core.js.
   Markup HTML-nya ada di file sebelah:
   daftar-perusahaan.template.js (catatan desain di headernya).
   NB: closeModal() dipakai bersama, didefinisikan di core.js.

   Menu Profil Perusahaan kini punya 2 sub menu (lihat
   js/menu.js): Detail Perusahaan (halaman companyProfile lama)
   + Daftar Perusahaan (modul ini). Pola CRUD ringkas: Tambah =
   modal 4 field (Kode Data uppercase & unik), Hapus =
   konfirmasi (tanpa Ubah, sesuai screenshot), sort 4 kolom +
   pencarian + page-size. Data: DATA.daftarPerusahaan. */

let dprState = { search:'', sortField:'', sortDir:'asc' };

function renderDaftarPerusahaanPage(){
  dprState = { search:'', sortField:'', sortDir:'asc' };
  content.innerHTML = tplDprPage();
  document.getElementById('btnDprAdd').onclick = () => openDprModal();
  document.getElementById('btnDprTutorial').onclick = () => openDprInfo('Tutorial', 'Video tutorial Daftar Perusahaan tersedia di portal MASERP (mockup).');
  document.getElementById('dprSearch').oninput = (e) => { dprState.search = e.target.value.trim().toLowerCase(); renderDprTable(); };
  document.getElementById('dprPageSize').onchange = () => renderDprTable();
  document.querySelectorAll('[data-dpr-sort]').forEach(el => el.onclick = () => {
    const field = el.dataset.dprSort;
    if(dprState.sortField === field){
      dprState.sortDir = dprState.sortDir === 'asc' ? 'desc' : 'asc';
    } else {
      dprState.sortField = field;
      dprState.sortDir = 'asc';
    }
    renderDprTable();
  });
  renderDprTable();
}

function dprFilteredSortedRows(){
  const q = dprState.search;
  let rows = (DATA.daftarPerusahaan || []).filter(r => !q ||
    (r.nama||'').toLowerCase().includes(q) ||
    (r.kode||'').toLowerCase().includes(q) ||
    (r.tglMulai||'').toLowerCase().includes(q) ||
    (r.generasi||'').toLowerCase().includes(q));
  const f = dprState.sortField;
  if(f){
    const dir = dprState.sortDir === 'desc' ? -1 : 1;
    rows.sort((a,b) => String(a[f]||'').localeCompare(String(b[f]||''), 'id') * dir);
  }
  return rows;
}

function renderDprTable(){
  const rows = dprFilteredSortedRows();
  document.getElementById('dprTbody').innerHTML = tplDprRows(rows);
  document.getElementById('dprTotal').textContent = `Total Record: ${rows.length}`;
  ['nama','kode','tglMulai','generasi'].forEach(f => {
    const el = document.getElementById(`dprSortIcon_${f}`);
    if(!el) return;
    if(dprState.sortField === f){
      el.innerHTML = dprState.sortDir === 'asc' ? '&#8593;' : '&#8595;';
      el.style.color = 'var(--blue)';
    } else {
      el.innerHTML = '&#8693;';
      el.style.color = 'var(--text-light)';
    }
  });
  document.getElementById('dprTbody').querySelectorAll('[data-dpr-del]').forEach(b => b.onclick = () => openDprDeleteConfirm(+b.dataset.dprDel));
}

function dprOverlay(html){
  closeModal();
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.innerHTML = html;
  document.body.appendChild(overlay);
  document.getElementById('modalClose').onclick = closeModal;
  const cancel = document.getElementById('modalCancel');
  if(cancel) cancel.onclick = closeModal;
  overlay.onclick = (e) => { if(e.target === overlay) closeModal(); };
  return overlay;
}

function openDprModal(){
  dprOverlay(tplDprModal({}));
  document.getElementById('modalSave').onclick = () => {
    const nama = document.getElementById('fDprNama').value.trim();
    const kode = document.getElementById('fDprKode').value.trim().toUpperCase();
    const tgl = document.getElementById('fDprTgl').value.trim();
    const generasi = document.getElementById('fDprGenerasi').value.trim();
    let ok = true;
    const err = (id, show, text) => {
      const el = document.getElementById(id);
      if(text) el.textContent = text;
      el.style.display = show ? 'block' : 'none';
      if(show) ok = false;
    };
    err('fDprNamaErr', !nama);
    if(!kode) err('fDprKodeErr', true, 'Kode Data wajib diisi');
    else if((DATA.daftarPerusahaan||[]).some(r => (r.kode||'').toUpperCase() === kode)) err('fDprKodeErr', true, `Kode Data "${kode}" sudah terdaftar`);
    else err('fDprKodeErr', false);
    err('fDprTglErr', !tgl);
    err('fDprGenerasiErr', !generasi);
    if(!ok) return;
    DATA.daftarPerusahaan.push({ nama, kode, tglMulai: tgl, generasi });
    closeModal();
    renderDprTable();
  };
}

function openDprDeleteConfirm(idx){
  const row = DATA.daftarPerusahaan[idx];
  dprOverlay(tplDprDeleteConfirm(row));
  document.getElementById('modalDelete').onclick = () => {
    DATA.daftarPerusahaan.splice(idx, 1);
    closeModal();
    renderDprTable();
  };
}

function openDprInfo(title, text){
  dprOverlay(tplDprInfoModal(title, text));
  document.getElementById('modalOk').onclick = closeModal;
}
