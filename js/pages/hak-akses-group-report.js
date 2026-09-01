/* =========================================================
   LOGIC (JS saja) — Setting Hak Akses Group Report (User
   Security > Hak Akses Group Report, page:'hakAksesGroupReport').
   Dimuat otomatis (lazy-load) oleh core.js — lihat
   PAGE_MODULES di js/core.js. Markup di file sebelah:
   hak-akses-group-report.template.js (catatan desain &
   pemetaan screenshot SDL -> DBM di headernya).
   NB: closeModal() dipakai bersama, didefinisikan di core.js.

   Kembaran hak-akses-group.js utk matriks LAPORAN: state
   `hgrChecks` (Set key "MODUL|LAPORAN|GROUP", init dari
   DATA.hakAksesGroupReport), `hgrExpanded`, `hgrQ`. Item anak
   diambil dinamis dari REPORT_CENTERS_DATA (katalog Report
   Center DBM). Save menulis balik ke DATA.hakAksesGroupReport
   + modal info; Reset Hak Akses = konfirmasi lalu kosongkan
   semua centang. Kolom group TERMASUK ADM (sesuai screenshot
   report — beda dari layar Hak Akses Group). */

let hgrChecks = null;
let hgrExpanded = null;
let hgrQ = '';

function renderHakAksesGroupReportPage(){
  hgrChecks = new Set(DATA.hakAksesGroupReport || []);
  hgrExpanded = new Set();
  hgrQ = '';
  content.innerHTML = tplHgrPage();
  document.getElementById('btnHgrTutorial').onclick = () => openHgrInfo('Tutorial', 'Video tutorial Setting Hak Akses Group Report tersedia di portal MASERP (mockup).');
  document.getElementById('btnHgrSave').onclick = () => {
    DATA.hakAksesGroupReport = Array.from(hgrChecks);
    openHgrInfo('Simpan Hak Akses', `Hak akses laporan group berhasil disimpan (${hgrChecks.size} hak akses tercentang).`);
  };
  document.getElementById('btnHgrReset').onclick = () => openHgrResetConfirm();
  document.getElementById('hgrSearch').oninput = (e) => {
    hgrQ = e.target.value.trim().toLowerCase();
    renderHgrTable();
  };
  renderHgrTable();
}

function renderHgrTable(){
  const tbody = document.getElementById('hgrTbody');
  tbody.innerHTML = tplHgrRows(hgrChecks, hgrExpanded, hgrQ);
  tbody.querySelectorAll('[data-hgr-toggle]').forEach(el => el.onclick = () => {
    const m = el.dataset.hgrToggle;
    if(hgrExpanded.has(m)) hgrExpanded.delete(m);
    else hgrExpanded.add(m);
    renderHgrTable();
  });
  tbody.querySelectorAll('[data-hgr-cek]').forEach(cb => cb.onchange = () => {
    if(cb.checked) hgrChecks.add(cb.dataset.hgrCek);
    else hgrChecks.delete(cb.dataset.hgrCek);
  });
}

function hgrOverlay(html){
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

function openHgrResetConfirm(){
  hgrOverlay(tplHgrResetConfirm());
  document.getElementById('modalReset').onclick = () => {
    hgrChecks = new Set();
    DATA.hakAksesGroupReport = [];
    closeModal();
    renderHgrTable();
    openHgrInfo('Reset Hak Akses', 'Seluruh hak akses laporan group berhasil di-reset.');
  };
}

function openHgrInfo(title, text){
  hgrOverlay(tplHgrInfoModal(title, text));
  document.getElementById('modalOk').onclick = closeModal;
}
