/* =========================================================
   LOGIC (JS saja) — Tutup Pending SO (Customer & Penjualan >
   Daftar Transaksi). Dimuat otomatis (lazy-load) oleh core.js saat
   menu ini pertama kali diklik — lihat PAGE_MODULES di js/core.js.
   Markup HTML-nya ada di file sebelah: tutup-pending-so.template.js
   (lihat catatan desain lengkap di headernya — KEMBARAN Tutup
   Pending PO utk sisi Sales Order beserta daftar bedanya).
   NB: closeModal() dipakai bersama, didefinisikan di core.js.

   Fungsi modul: menampilkan daftar SO dari DATA.salesOrders LIVE
   dan menutup ("Tutup Order") / membuka kembali ("Buka Order") SO
   lewat field `tutupSo` (boolean). Saat ditutup, kolom Keterangan
   diganti teks "No. SO ini sudah ditutup" (keterangan asli tetap
   tersimpan di field-nya, hanya tampilannya yang diganti — jadi
   Buka Order otomatis menampilkan keterangan asli lagi tanpa perlu
   backup terpisah). Kedua tombol FUNGSIONAL dengan modal konfirmasi
   (bukan confirm() bawaan browser, sesuai kebijakan mockup).

   Filter header (status All/Pending/In Progress/Close/Sent + bulan,
   default Agustus 2026 — semua SO sample DBM memang Agustus 2026)
   dan Pencarian Global FUNGSIONAL: nilai filter 'Close' mencocokkan
   baris yang tutupSo=true, nilai status lain mencocokkan status
   kirim baris yang BELUM ditutup (baris tertutup hanya muncul di
   All/Close). */

var tpsState = { status:'', bulan:'202608', search:'' };

function renderTutupPendingSOPage(){
  tpsState = { status:'', bulan:'202608', search:'' };
  content.innerHTML = tplTpsListPage();
  document.getElementById('btnTpsTutorial').onclick = () => openTpsInfo('Tutorial', 'Video tutorial Tutup Pending SO akan tersedia di sini.');
  document.getElementById('tpsFilterStatus').onchange = (e) => { tpsState.status = e.target.value; renderTpsTable(); };
  document.getElementById('tpsFilterBulan').onchange = (e) => { tpsState.bulan = e.target.value; renderTpsTable(); };
  document.getElementById('tpsSearch').oninput = (e) => { tpsState.search = e.target.value; renderTpsTable(); };
  renderTpsTable();
}

/* tglSO 'dd/mm/yyyy' -> 'yyyymm' utk filter bulan. */
function tpsYm(tglSO){
  const p = (tglSO || '').split('/');
  return p.length === 3 ? (p[2] + p[1]) : '';
}

function tpsFilteredRows(){
  const q = tpsState.search.trim().toLowerCase();
  return (DATA.salesOrders || []).filter(r => {
    if(tpsState.status === 'Close'){
      if(!r.tutupSo) return false;
    } else if(tpsState.status){
      if(r.tutupSo || tpsStatusKirim(r) !== tpsState.status) return false;
    }
    if(tpsState.bulan && tpsYm(r.tglSO) !== tpsState.bulan) return false;
    if(q && !(
      r.no.toLowerCase().includes(q) ||
      (r.customer || '').toLowerCase().includes(q) ||
      (r.noSP || '').toLowerCase().includes(q) ||
      (r.keterangan || '').toLowerCase().includes(q))) return false;
    return true;
  });
}

function renderTpsTable(){
  const rows = tpsFilteredRows();
  document.getElementById('tpsTbody').innerHTML = tplTpsRows(rows);
  document.getElementById('tpsTotal').textContent = `Total Record: ${rows.length}`;
  content.querySelectorAll('[data-tps-view]').forEach(a => a.onclick = () => {
    const row = DATA.salesOrders.find(r => r.no === a.dataset.tpsView);
    if(row) openTpsDetail(row);
  });
  content.querySelectorAll('[data-tps-toggle]').forEach(b => b.onclick = () => {
    const row = DATA.salesOrders.find(r => r.no === b.dataset.tpsToggle);
    if(row) openTpsConfirm(row);
  });
}

function openTpsConfirm(row){
  closeModal();
  const willClose = !row.tutupSo;
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.innerHTML = tplTpsConfirmModal(row, willClose);
  document.body.appendChild(overlay);
  document.getElementById('modalClose').onclick = closeModal;
  document.getElementById('modalCancel').onclick = closeModal;
  overlay.onclick = (e) => { if(e.target === overlay) closeModal(); };
  document.getElementById('tpsConfirmBtn').onclick = () => {
    row.tutupSo = willClose;
    closeModal();
    renderTpsTable();
  };
}

function openTpsDetail(row){
  closeModal();
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.innerHTML = tplTpsDetailModal(row);
  document.body.appendChild(overlay);
  document.getElementById('modalClose').onclick = closeModal;
  document.getElementById('modalCancel').onclick = closeModal;
  overlay.onclick = (e) => { if(e.target === overlay) closeModal(); };
}

function openTpsInfo(title, text){
  closeModal();
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.innerHTML = tplTpsInfoModal(title, text);
  document.body.appendChild(overlay);
  document.getElementById('modalClose').onclick = closeModal;
  document.getElementById('modalCancel').onclick = closeModal;
  overlay.onclick = (e) => { if(e.target === overlay) closeModal(); };
}
