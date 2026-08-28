/* =========================================================
   LOGIC (JS saja) — Jurnal Pelunasan Utang/Piutang (Kas/Bank >
   Master & Setting). Dimuat otomatis (lazy-load) oleh core.js saat
   menu ini pertama kali diklik — lihat PAGE_MODULES di js/core.js.
   Markup HTML-nya ada di file sebelah: jurnal-pelunasan-up.template.js
   (plus konstanta JKUP_AKUN_FIELDS yang dipakai bersama di sini).
   NB: closeModal() dipakai bersama, didefinisikan di core.js.

   Pola CRUD: list + form FULL PAGE dgn 15 field akun GL ber-picker —
   disalin dari pola Jurnal Pembelian (openJpForm/openJpAkunPicker),
   termasuk tombol DUPLICATE (menyalin jurnal jadi baris baru dgn
   kode berikutnya, persis tombol Duplikat Jurnal Pembelian; label
   memakai ejaan "DUPLICATE" mengikuti screenshot acuan form ini).
   Sumber data: DATA.jurnalKasUtangPiutang (BARU 2026-08-28, lihat
   komentar besar di js/data.js). */

var jkupSearchQ = '';

function renderJurnalPelunasanUPPage(){
  renderJkupList();
}

function jkupFilteredRows(){
  const q = jkupSearchQ.trim().toLowerCase();
  if(!q) return DATA.jurnalKasUtangPiutang;
  return DATA.jurnalKasUtangPiutang.filter(r =>
    String(r.kode).includes(q) || (r.nama || '').toLowerCase().includes(q));
}

function renderJkupList(){
  jkupSearchQ = '';
  content.innerHTML = tplJkupListPage();
  document.getElementById('btnJkupAdd').onclick = () => openJkupForm('add');
  document.getElementById('jkupSearch').oninput = (e) => { jkupSearchQ = e.target.value; renderJkupTable(); };
  renderJkupTable();
}

function renderJkupTable(){
  const rows = jkupFilteredRows();
  document.getElementById('jkupTbody').innerHTML = tplJkupRows(rows);
  document.getElementById('jkupTotal').textContent = `Total Record: ${rows.length}`;
  content.querySelectorAll('[data-edit-kode]').forEach(el => el.onclick = () => {
    const idx = DATA.jurnalKasUtangPiutang.findIndex(r => r.kode === +el.dataset.editKode);
    if(idx >= 0) openJkupForm('edit', idx);
  });
  content.querySelectorAll('[data-del-kode]').forEach(el => el.onclick = () => {
    const idx = DATA.jurnalKasUtangPiutang.findIndex(r => r.kode === +el.dataset.delKode);
    if(idx >= 0) openJkupDeleteConfirm(idx);
  });
}

function jkupNextKode(){
  return DATA.jurnalKasUtangPiutang.length
    ? Math.max(...DATA.jurnalKasUtangPiutang.map(r => r.kode)) + 1 : 1;
}

function jkupEmptyRow(){
  const row = { kode:null, nama:'', mataUang:'IDR' };
  JKUP_AKUN_FIELDS.forEach(f => { row[f.key] = ''; });
  return row;
}

function openJkupForm(mode, idx){
  const row = mode === 'edit' ? { ...DATA.jurnalKasUtangPiutang[idx] } : jkupEmptyRow();
  content.innerHTML = tplJkupForm(mode, row);

  document.getElementById('btnJkupTutorial').onclick = () => openJkupInfo('Tutorial', 'Video tutorial pengisian Jurnal Pelunasan Utang/Piutang akan tersedia di sini.');

  JKUP_AKUN_FIELDS.forEach(f => {
    content.querySelector(`[data-akun-search="${f.key}"]`).onclick = () => openJkupAkunPicker(f.key, row);
    content.querySelector(`[data-akun-clear="${f.key}"]`).onclick = () => {
      row[f.key] = '';
      document.getElementById(`fJkup_${f.key}`).value = '';
      document.getElementById(`fJkupNama_${f.key}`).textContent = '';
    };
  });

  document.getElementById('jkupCancel').onclick = (e) => { e.preventDefault(); renderJkupList(); };
  document.getElementById('jkupDuplicate').onclick = () => {
    const nama = document.getElementById('fJkupNama').value.trim();
    DATA.jurnalKasUtangPiutang.push({ ...row, kode: jkupNextKode(), nama: (nama || row.nama) + ' (Copy)' });
    renderJkupList();
  };
  document.getElementById('jkupSave').onclick = () => {
    const nama = document.getElementById('fJkupNama').value.trim();
    if(!nama){ jkupValidationError('Nama Jurnal wajib diisi.'); return; }
    row.nama = nama;
    if(mode === 'add'){
      row.kode = jkupNextKode();
      DATA.jurnalKasUtangPiutang.push(row);
    } else {
      DATA.jurnalKasUtangPiutang[idx] = row;
    }
    renderJkupList();
  };
}

function openJkupAkunPicker(fieldKey, row){
  closeModal();
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.innerHTML = tplJkupAkunPicker(DATA.akunGL, fieldKey);
  document.body.appendChild(overlay);
  document.getElementById('modalClose').onclick = closeModal;
  document.getElementById('modalCancel').onclick = closeModal;
  overlay.onclick = (e) => { if(e.target === overlay) closeModal(); };

  const wireRows = () => {
    overlay.querySelectorAll('[data-pick-akun]').forEach(btn => btn.onclick = () => {
      const kode = btn.dataset.pickAkun;
      row[fieldKey] = kode;
      document.getElementById(`fJkup_${fieldKey}`).value = kode;
      document.getElementById(`fJkupNama_${fieldKey}`).textContent = jkupAkunNama(kode);
      closeModal();
    });
  };
  wireRows();

  document.getElementById('jkupAkunPickerSearch').oninput = (e) => {
    const q = e.target.value.trim().toLowerCase();
    const filtered = DATA.akunGL.filter(a => a.kode.toLowerCase().includes(q) || a.nama.toLowerCase().includes(q));
    document.getElementById('jkupAkunPickerBody').innerHTML = tplJkupAkunPickerRows(filtered, fieldKey);
    wireRows();
  };
}

function openJkupDeleteConfirm(idx){
  closeModal();
  const row = DATA.jurnalKasUtangPiutang[idx];
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.innerHTML = tplJkupDeleteConfirm(row);
  document.body.appendChild(overlay);
  document.getElementById('modalClose').onclick = closeModal;
  document.getElementById('modalCancel').onclick = closeModal;
  overlay.onclick = (e) => { if(e.target === overlay) closeModal(); };
  document.getElementById('modalDelete').onclick = () => {
    DATA.jurnalKasUtangPiutang.splice(idx, 1);
    closeModal();
    renderJkupTable();
  };
}

function openJkupInfo(title, text){
  closeModal();
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.innerHTML = tplJkupInfoModal(title, text);
  document.body.appendChild(overlay);
  document.getElementById('modalClose').onclick = closeModal;
  document.getElementById('modalCancel').onclick = closeModal;
  overlay.onclick = (e) => { if(e.target === overlay) closeModal(); };
}

function jkupValidationError(text){
  openJkupInfo('Validasi', text);
}
