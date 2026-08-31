/* =========================================================
   LOGIC (JS saja) — Tutup PR (Supplier & Pembelian > Daftar
   Transaksi). Dimuat otomatis (lazy-load) oleh core.js saat menu
   ini pertama kali diklik — lihat PAGE_MODULES di js/core.js.
   Markup HTML-nya ada di file sebelah: tutup-pr.template.js
   (lihat catatan desain lengkap di headernya).
   NB: closeModal() dipakai bersama, didefinisikan di core.js.

   Alur inti (persis screenshot):
   - List SEMUA PR lintas periode dari DATA.permintaanPembelian
     (data BERSAMA menu Permintaan Pembelian).
   - Klik "Tutup Request" -> flag r.tutupPr = true, keterangan
     baris berubah "No. PR ini sudah ditutup" & tombol berganti
     "Buka Request" (teal); klik "Buka Request" -> kebalikannya.
     Toggle langsung tanpa modal, persis perilaku MASERP.
   - Link No. Permintaan -> modal detail PR (info + rincian
     barang, readonly). */

var tprSearchQ = '';

function renderTutupPRPage(){
  tprSearchQ = '';
  content.innerHTML = tplTutupPRListPage();
  document.getElementById('btnTprTutorial').onclick = () => openTprInfo('Tutorial', 'Video tutorial Tutup PR tersedia di portal MASERP (mockup).');
  document.getElementById('tprSearch').oninput = (e) => { tprSearchQ = e.target.value; renderTprTable(); };
  renderTprTable();
}

function tprFilteredRows(){
  const q = tprSearchQ.trim().toLowerCase();
  return (DATA.permintaanPembelian || []).filter(r => {
    if(!q) return true;
    const ket = r.tutupPr ? 'no. pr ini sudah ditutup' : 'no pr ini masih terbuka';
    return r.no.toLowerCase().includes(q) || ket.includes(q) || (r.keterangan||'').toLowerCase().includes(q);
  });
}

function renderTprTable(){
  // Urut naik seperti screenshot (25/PR paling atas, 26/PR/08 paling bawah).
  const rows = tprFilteredRows().slice().sort((a,b) => a.no.localeCompare(b.no));
  const tbody = document.getElementById('tprTbody');
  tbody.innerHTML = tplTprRows(rows);
  document.getElementById('tprTotal').textContent = `Total Record: ${rows.length}`;
  tbody.querySelectorAll('[data-tpr-view]').forEach(b => b.onclick = () => openTprDetail(rows[+b.dataset.tprView]));
  tbody.querySelectorAll('[data-tpr-toggle]').forEach(b => b.onclick = () => {
    const row = rows[+b.dataset.tprToggle];
    row.tutupPr = !row.tutupPr;
    renderTprTable();
  });
}

function tprOverlay(html){
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

function openTprDetail(row){
  tprOverlay(tplTprDetailModal(row));
}

function openTprInfo(title, text){
  tprOverlay(tplTprInfoModal(title, text));
  document.getElementById('modalOk').onclick = closeModal;
}
