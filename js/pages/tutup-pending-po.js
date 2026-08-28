/* =========================================================
   LOGIC (JS saja) — Tutup Pending PO (Supplier & Pembelian >
   Daftar Transaksi). Dimuat otomatis (lazy-load) oleh core.js saat
   menu ini pertama kali diklik — lihat PAGE_MODULES di js/core.js.
   Markup HTML-nya ada di file sebelah: tutup-pending-po.template.js.
   NB: closeModal() dipakai bersama, didefinisikan di core.js.

   Fungsi modul: menampilkan daftar PO dari DATA.purchaseOrder LIVE
   dan menutup ("Tutup Order") atau membuka kembali ("Buka Order")
   PO lewat field BARU `tutupPoStatus` — lihat komentar besar di atas
   DATA.purchaseOrder di js/data.js. Kedua tombol FUNGSIONAL dengan
   modal konfirmasi (bukan confirm() bawaan browser, sesuai kebijakan
   mockup): Tutup Order mengubah status baris menjadi 'Close' (tombol
   berubah jadi "Buka Order" teal, persis baris teratas screenshot),
   Buka Order mengembalikannya ke 'Pending'. Status semula sebelum
   ditutup ('Pending'/'In Progress') disimpan di field sementara
   `tutupPoPrevStatus` supaya Buka Order mengembalikan status yang
   benar, bukan selalu 'Pending'.

   Filter header (dropdown teal "All" = status & bulan, default
   "Agustus 2026" — semua PO sample DBM memang Agustus 2026) dan
   Pencarian Global FUNGSIONAL, meniru kontrol yang terlihat di
   screenshot. */

var tppState = { status:'', bulan:'202608', search:'' };

function renderTutupPendingPOPage(){
  tppState = { status:'', bulan:'202608', search:'' };
  content.innerHTML = tplTppListPage();
  document.getElementById('btnTppTutorial').onclick = () => openTppInfo('Tutorial', 'Video tutorial Tutup Pending PO akan tersedia di sini.');
  document.getElementById('tppFilterStatus').onchange = (e) => { tppState.status = e.target.value; renderTppTable(); };
  document.getElementById('tppFilterBulan').onchange = (e) => { tppState.bulan = e.target.value; renderTppTable(); };
  document.getElementById('tppSearch').oninput = (e) => { tppState.search = e.target.value; renderTppTable(); };
  renderTppTable();
}

/* tglPO 'dd/mm/yyyy' -> 'yyyymm' utk filter bulan. */
function tppYm(tglPO){
  const p = (tglPO || '').split('/');
  return p.length === 3 ? (p[2] + p[1]) : '';
}

function tppFilteredRows(){
  const q = tppState.search.trim().toLowerCase();
  return (DATA.purchaseOrder || []).filter(r => {
    if(tppState.status && (r.tutupPoStatus || 'Pending') !== tppState.status) return false;
    if(tppState.bulan && tppYm(r.tglPO) !== tppState.bulan) return false;
    if(q && !(
      r.no.toLowerCase().includes(q) ||
      (r.supplier || '').toLowerCase().includes(q) ||
      (r.keterangan || '').toLowerCase().includes(q))) return false;
    return true;
  });
}

function renderTppTable(){
  const rows = tppFilteredRows();
  document.getElementById('tppTbody').innerHTML = tplTppRows(rows);
  document.getElementById('tppTotal').textContent = `Total Record: ${rows.length}`;
  content.querySelectorAll('[data-tpp-view]').forEach(a => a.onclick = () => {
    const row = DATA.purchaseOrder.find(r => r.no === a.dataset.tppView);
    if(row) openTppDetail(row);
  });
  content.querySelectorAll('[data-tpp-toggle]').forEach(b => b.onclick = () => {
    const row = DATA.purchaseOrder.find(r => r.no === b.dataset.tppToggle);
    if(row) openTppConfirm(row);
  });
}

function openTppConfirm(row){
  closeModal();
  const willClose = row.tutupPoStatus !== 'Close';
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.innerHTML = tplTppConfirmModal(row, willClose);
  document.body.appendChild(overlay);
  document.getElementById('modalClose').onclick = closeModal;
  document.getElementById('modalCancel').onclick = closeModal;
  overlay.onclick = (e) => { if(e.target === overlay) closeModal(); };
  document.getElementById('tppConfirmBtn').onclick = () => {
    if(willClose){
      row.tutupPoPrevStatus = row.tutupPoStatus || 'Pending';
      row.tutupPoStatus = 'Close';
    } else {
      row.tutupPoStatus = row.tutupPoPrevStatus || 'Pending';
      delete row.tutupPoPrevStatus;
    }
    closeModal();
    renderTppTable();
  };
}

function openTppDetail(row){
  closeModal();
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.innerHTML = tplTppDetailModal(row);
  document.body.appendChild(overlay);
  document.getElementById('modalClose').onclick = closeModal;
  document.getElementById('modalCancel').onclick = closeModal;
  overlay.onclick = (e) => { if(e.target === overlay) closeModal(); };
}

function openTppInfo(title, text){
  closeModal();
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.innerHTML = tplTppInfoModal(title, text);
  document.body.appendChild(overlay);
  document.getElementById('modalClose').onclick = closeModal;
  document.getElementById('modalCancel').onclick = closeModal;
  overlay.onclick = (e) => { if(e.target === overlay) closeModal(); };
}
