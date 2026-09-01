/* =========================================================
   LOGIC (JS saja) — Setting Hak Akses Group (User Security >
   Hak Akses Group, page:'hakAksesGroup'). Dimuat otomatis
   (lazy-load) oleh core.js — lihat PAGE_MODULES di js/core.js.
   Markup di file sebelah: hak-akses-group.template.js (catatan
   desain & pemetaan screenshot SDL -> DBM di headernya).
   NB: closeModal() dipakai bersama, didefinisikan di core.js.

   State halaman: `hagChecks` (Set key "MODUL|ITEM|GROUP",
   diinisialisasi dari DATA.hakAksesGroup — array key yang
   tercentang, sample default per peran group), `hagExpanded`
   (Set modul terbuka), `hagQ` (filter — saat terisi, modul yg
   punya item cocok auto-expand). Centang/lepas langsung
   mengubah hagChecks; tombol Save menulis balik ke
   DATA.hakAksesGroup + modal info; Reset Hak Akses =
   konfirmasi lalu kosongkan semua. Group isAdmin tidak tampil
   (administrator akses semua — banner kuning). */

let hagChecks = null;
let hagExpanded = null;
let hagQ = '';

function renderHakAksesGroupPage(){
  hagChecks = new Set(DATA.hakAksesGroup || []);
  hagExpanded = new Set();
  hagQ = '';
  content.innerHTML = tplHagPage();
  document.getElementById('btnHagTutorial').onclick = () => openHagInfo('Tutorial', 'Video tutorial Setting Hak Akses Group tersedia di portal MASERP (mockup).');
  document.getElementById('btnHagSave').onclick = () => {
    DATA.hakAksesGroup = Array.from(hagChecks);
    openHagInfo('Simpan Hak Akses', `Hak akses group berhasil disimpan (${hagChecks.size} hak akses tercentang).`);
  };
  document.getElementById('btnHagReset').onclick = () => openHagResetConfirm();
  document.getElementById('hagSearch').oninput = (e) => {
    hagQ = e.target.value.trim().toLowerCase();
    renderHagTable();
  };
  renderHagTable();
}

function renderHagTable(){
  const tbody = document.getElementById('hagTbody');
  tbody.innerHTML = tplHagRows(hagChecks, hagExpanded, hagQ);
  tbody.querySelectorAll('[data-hag-toggle]').forEach(el => el.onclick = () => {
    const m = el.dataset.hagToggle;
    if(hagExpanded.has(m)) hagExpanded.delete(m);
    else hagExpanded.add(m);
    renderHagTable();
  });
  tbody.querySelectorAll('[data-hag-cek]').forEach(cb => cb.onchange = () => {
    if(cb.checked) hagChecks.add(cb.dataset.hagCek);
    else hagChecks.delete(cb.dataset.hagCek);
  });
}

function hagOverlay(html){
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

function openHagResetConfirm(){
  hagOverlay(tplHagResetConfirm());
  document.getElementById('modalReset').onclick = () => {
    hagChecks = new Set();
    DATA.hakAksesGroup = [];
    closeModal();
    renderHagTable();
    openHagInfo('Reset Hak Akses', 'Seluruh hak akses group berhasil di-reset.');
  };
}

function openHagInfo(title, text){
  hagOverlay(tplHagInfoModal(title, text));
  document.getElementById('modalOk').onclick = closeModal;
}
