/* =========================================================
   LOGIC (JS saja) — Master Kas/Bank (Kas/Bank > Master & Setting >
   Kas/Bank). Dimuat otomatis (lazy-load) oleh core.js saat menu ini
   pertama kali diklik — lihat PAGE_MODULES di js/core.js. Markup
   HTML-nya ada di file sebelah: kas-bank.template.js
   (tplKasBankListPage/tplKbkRows/tplKasBankForm/tplKbkDeleteConfirm/
   tplKbkInfoModal). NB: closeModal() dipakai bersama, didefinisikan
   di core.js.

   Pola CRUD: list + form FULL PAGE (sama seperti Gudang/Jurnal
   Pembelian/Picking List), field cukup sederhana (tanpa sub-grid/
   tabel reaktif) jadi tidak perlu state sementara di variabel modul
   seperti modul CRUD besar lainnya.

   Kode Bank SELALU readonly/disabled (baik Tambah maupun Ubah) —
   flat sequential (110101, 110102, ...), BUKAN per-cabang seperti
   Kode Gudang, karena screenshot "Daftar Bank" aslinya juga jelas
   sequential rata tanpa reset per cabang. kbkNextKode() = kode
   numerik terbesar yang sudah ada + 1, di-format ulang dengan lebar
   digit yang sama (padStart) supaya tetap konsisten kalau suatu saat
   base data-nya diubah ke kode yang lebih panjang. Tombol kaca
   pembesar di sebelah Kode Bank & tombol merah "Tutorial" di header
   form sama-sama cuma membuka modal info kecil (tplKbkInfoModal),
   tidak ada logic pencarian sungguhan — Kode Bank tidak pernah
   di-input manual jadi tombol "cari" itu murni dekoratif. */

function kbkNextKode(){
  const width = (DATA.kasBank[0] && DATA.kasBank[0].kode ? DATA.kasBank[0].kode.length : 6);
  const maxNum = DATA.kasBank.reduce((max,r)=> Math.max(max, Number(r.kode)||0), 0);
  return String(maxNum + 1).padStart(width, '0');
}

function renderKasBankPage(){
  renderKbkList();
}

function renderKbkList(){
  content.innerHTML = tplKasBankListPage();
  document.getElementById('btnKbkAdd').onclick = () => openKbkForm('add');
  renderKbkTable();
}

function renderKbkTable(){
  const tbody = document.getElementById('kbkTbody');
  const total = document.getElementById('kbkTotal');
  tbody.innerHTML = tplKbkRows(DATA.kasBank);
  total.textContent = `Total Record: ${DATA.kasBank.length}`;
  tbody.querySelectorAll('[data-edit]').forEach(b => b.onclick = () => openKbkForm('edit', +b.dataset.edit));
  tbody.querySelectorAll('[data-del]').forEach(b => b.onclick = () => openKbkDeleteConfirm(+b.dataset.del));
}

function kbkEmptyRow(){
  return {
    kode: kbkNextKode(), masterBank: DATA.masterBankList[0], nama:'', mataUang:'IDR', alamat:'',
    telepon:'', kontakPerson:'', noRekening:'', tipeRekening:'Kas', nonAktif:false, smartlink:false, saldo:0,
  };
}

function openKbkForm(mode, idx){
  const row = mode === 'edit' ? { ...DATA.kasBank[idx] } : kbkEmptyRow();
  content.innerHTML = tplKasBankForm(mode, row);

  document.getElementById('btnKbkTutorial').onclick = () => openKbkInfo('Tutorial', 'Video tutorial pengisian Master Bank akan tersedia di sini.');
  document.getElementById('btnKbkKodeSearch').onclick = () => openKbkInfo('Kode Bank', 'Kode Bank di-generate otomatis oleh sistem secara berurutan, tidak bisa dicari/diubah manual.');

  document.getElementById('kbkCancel').onclick = (e) => { e.preventDefault(); renderKbkList(); };
  document.getElementById('kbkSave').onclick = () => {
    const nama = document.getElementById('fKbkNama').value.trim();
    if(!nama){ kbkValidationError('Nama Bank wajib diisi.'); return; }
    const updated = {
      kode: document.getElementById('fKbkKode').value,
      masterBank: document.getElementById('fKbkMasterBank').value,
      nama,
      mataUang: document.getElementById('fKbkMataUang').value,
      alamat: document.getElementById('fKbkAlamat').value.trim(),
      telepon: document.getElementById('fKbkTelepon').value.trim(),
      kontakPerson: document.getElementById('fKbkKontakPerson').value.trim(),
      noRekening: document.getElementById('fKbkNoRekening').value.trim(),
      tipeRekening: document.getElementById('fKbkTipeRekening').value,
      nonAktif: document.getElementById('fKbkNonAktif').checked,
      smartlink: document.getElementById('fKbkSmartlink').checked,
      saldo: mode === 'edit' ? (DATA.kasBank[idx].saldo||0) : 0,
    };
    if(mode === 'add'){ DATA.kasBank.push(updated); }
    else { DATA.kasBank[idx] = updated; }
    renderKbkList();
  };
}

function openKbkDeleteConfirm(idx){
  closeModal();
  const row = DATA.kasBank[idx];
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.innerHTML = tplKbkDeleteConfirm(row);
  document.body.appendChild(overlay);
  document.getElementById('modalClose').onclick = closeModal;
  document.getElementById('modalCancel').onclick = closeModal;
  overlay.onclick = (e) => { if(e.target === overlay) closeModal(); };
  document.getElementById('modalDelete').onclick = () => {
    DATA.kasBank.splice(idx, 1);
    closeModal();
    renderKbkTable();
  };
}

function openKbkInfo(title, text){
  closeModal();
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.innerHTML = tplKbkInfoModal(title, text);
  document.body.appendChild(overlay);
  document.getElementById('modalClose').onclick = closeModal;
  document.getElementById('modalCancel').onclick = closeModal;
  overlay.onclick = (e) => { if(e.target === overlay) closeModal(); };
}

function kbkValidationError(text){
  openKbkInfo('Validasi', text);
}
