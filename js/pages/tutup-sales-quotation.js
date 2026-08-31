/* =========================================================
   LOGIC (JS saja) — Tutup Sales Quotation (Customer & Penjualan >
   Daftar Transaksi). Dimuat otomatis (lazy-load) oleh core.js
   saat menu ini pertama kali diklik — lihat PAGE_MODULES di
   js/core.js. Markup HTML-nya ada di file sebelah:
   tutup-sales-quotation.template.js (lihat catatan desain
   lengkap di headernya). NB: closeModal() dipakai bersama,
   didefinisikan di core.js.

   Fungsi modul: menampilkan daftar Sales Quotation dari
   DATA.salesQuotation LIVE dengan toggle "Closed Manually" per
   baris (field baru `sqClosedManually` — pola sama dgn toggle
   Closed Manually di Stock Request: langsung mengubah data tanpa
   modal konfirmasi, karena toggle bisa dibalikkan seketika).
   Link No. SQ membuka modal ringkasan read-only. Pencarian
   Global fungsional (no. SQ / customer / no. SP / area /
   status). */

var tsqState = { search:'' };

function renderTutupSalesQuotationPage(){
  tsqState = { search:'' };
  content.innerHTML = tplTutupSalesQuotationPage();
  document.getElementById('tsqSearch').oninput = (e) => { tsqState.search = e.target.value; renderTsqTable(); };
  renderTsqTable();
}

function tsqFilteredRows(){
  const q = tsqState.search.trim().toLowerCase();
  if(!q) return DATA.salesQuotation || [];
  return (DATA.salesQuotation || []).filter(r =>
    r.no.toLowerCase().includes(q) ||
    (r.customer || '').toLowerCase().includes(q) ||
    (r.noSP || '').toLowerCase().includes(q) ||
    (r.area || '').toLowerCase().includes(q) ||
    (r.status || '').toLowerCase().includes(q));
}

function renderTsqTable(){
  const rows = tsqFilteredRows();
  document.getElementById('tsqTbody').innerHTML = tplTsqRows(rows);
  document.getElementById('tsqTotal').textContent = `Total Record: ${rows.length}`;
  content.querySelectorAll('[data-tsq-view]').forEach(a => a.onclick = () => {
    const row = DATA.salesQuotation.find(r => r.no === a.dataset.tsqView);
    if(row) openTsqDetail(row);
  });
  content.querySelectorAll('[data-tsq-toggle]').forEach(cb => cb.onchange = (e) => {
    const row = DATA.salesQuotation.find(r => r.no === cb.dataset.tsqToggle);
    if(row) row.sqClosedManually = e.target.checked;
  });
}

function openTsqDetail(row){
  closeModal();
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.innerHTML = tplTsqDetailModal(row);
  document.body.appendChild(overlay);
  document.getElementById('modalClose').onclick = closeModal;
  document.getElementById('modalCancel').onclick = closeModal;
  overlay.onclick = (e) => { if(e.target === overlay) closeModal(); };
}
