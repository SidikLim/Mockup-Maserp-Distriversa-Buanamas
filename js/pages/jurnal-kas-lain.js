/* =========================================================
   LOGIC (JS saja) — Jurnal Kas Lain-Lain (Kas/Bank > Master &
   Setting). Dimuat otomatis (lazy-load) oleh core.js saat menu
   ini pertama kali diklik — lihat PAGE_MODULES di js/core.js.
   Markup HTML-nya ada di file sebelah: jurnal-kas-lain.template.js
   (lihat catatan desain lengkap di headernya).
   NB: closeModal() dipakai bersama, didefinisikan di core.js.

   Pola CRUD: list + form full page. Kode Jurnal angka berurutan
   (nextJklKode = kode terbesar + 1, link biru di list membuka
   form Ubah). Field Mata Uang readonly & otomatis mengikuti akun
   Kas/Bank terpilih. Tombol Duplikat menyalin baris menjadi
   jurnal baru bernama "{nama} (Copy)" — pola tombol Duplikat di
   Jurnal Pembelian. Validasi: Nama & Akun Kas/Bank & Lawan Akun
   Kas wajib (Giro Mundur opsional). Data: DATA.jurnalKasLain. */
function renderJurnalKasLainPage(){
  renderJklList();
}

var jklState = { search:'' };

function renderJklList(){
  jklState = { search:'' };
  content.innerHTML = tplJurnalKasLainListPage();
  document.getElementById('btnJklAdd').onclick = () => openJklForm('add');
  document.getElementById('jklSearch').oninput = (e) => { jklState.search = e.target.value; renderJklTable(); };
  renderJklTable();
}

function jklFilteredRows(){
  const q = jklState.search.trim().toLowerCase();
  if(!q) return DATA.jurnalKasLain || [];
  return (DATA.jurnalKasLain || []).filter(r =>
    String(r.kode).includes(q) ||
    (r.nama || '').toLowerCase().includes(q) ||
    jklKasBankLabel(r.akunKasBank).toLowerCase().includes(q) ||
    jklAkunNama(r.akunLawan).toLowerCase().includes(q));
}

function renderJklTable(){
  const rows = jklFilteredRows();
  const tbody = document.getElementById('jklTbody');
  tbody.innerHTML = tplJklRows(rows);
  document.getElementById('jklTotal').textContent = `Total Record: ${rows.length}`;
  const idxOf = (r) => DATA.jurnalKasLain.indexOf(r);
  tbody.querySelectorAll('[data-edit]').forEach(b => b.onclick = () => openJklForm('edit', idxOf(rows[+b.dataset.edit])));
  tbody.querySelectorAll('[data-edit-link]').forEach(b => b.onclick = () => openJklForm('edit', idxOf(rows[+b.dataset.editLink])));
  tbody.querySelectorAll('[data-del]').forEach(b => b.onclick = () => openJklDeleteConfirm(idxOf(rows[+b.dataset.del])));
}

function nextJklKode(){
  return (DATA.jurnalKasLain || []).reduce((m,r) => Math.max(m, +r.kode || 0), 0) + 1;
}

function openJklForm(mode, idx){
  const row = mode === 'edit'
    ? { ...DATA.jurnalKasLain[idx] }
    : { kode: nextJklKode(), nama:'', akunKasBank:'', akunGiroMundur:'', akunLawan:'' };

  content.innerHTML = tplJurnalKasLainForm(mode, row);

  const setField = (key, kode, nama) => {
    row[key] = kode;
    document.getElementById(`fJkl_${key}`).value = kode;
    document.getElementById(`fJklNama_${key}`).textContent = nama;
  };

  content.querySelector('[data-jkl-search="akunKasBank"]').onclick = () => openJklKasBankPicker(row, setField);
  content.querySelector('[data-jkl-search="akunGiroMundur"]').onclick = () => openJklAkunPicker('akunGiroMundur', row, setField);
  content.querySelector('[data-jkl-search="akunLawan"]').onclick = () => openJklAkunPicker('akunLawan', row, setField);
  ['akunKasBank','akunGiroMundur','akunLawan'].forEach(key => {
    content.querySelector(`[data-jkl-clear="${key}"]`).onclick = () => {
      setField(key, '', '');
      if(key === 'akunKasBank') document.getElementById('fJklMataUang').value = 'IDR';
    };
  });

  document.getElementById('btnJklTutorial').onclick = () => openJklInfo('Tutorial', 'Video tutorial pengisian Jurnal Kas Lain-Lain akan tersedia di sini.');
  document.getElementById('jklBatalkan').onclick = (e) => { e.preventDefault(); renderJklList(); };

  const readForm = () => {
    row.nama = document.getElementById('fJklNama').value.trim();
    if(!row.nama){ openJklInfo('Validasi', 'Nama Jurnal wajib diisi.'); return false; }
    if(!row.akunKasBank){ openJklInfo('Validasi', 'Akun Kas / Bank wajib dipilih.'); return false; }
    if(!row.akunLawan){ openJklInfo('Validasi', 'Lawan Akun Kas wajib dipilih.'); return false; }
    return true;
  };

  document.getElementById('jklDuplikat').onclick = () => {
    if(!readForm()) return;
    DATA.jurnalKasLain.push({ ...row, kode: nextJklKode(), nama: row.nama + ' (Copy)' });
    renderJklList();
  };
  document.getElementById('jklSimpan').onclick = () => {
    if(!readForm()) return;
    if(mode === 'add'){ DATA.jurnalKasLain.push(row); }
    else { DATA.jurnalKasLain[idx] = row; }
    renderJklList();
  };
}

function openJklKasBankPicker(row, setField){
  closeModal();
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.innerHTML = tplJklKasBankPicker(DATA.kasBank);
  document.body.appendChild(overlay);
  document.getElementById('modalClose').onclick = closeModal;
  document.getElementById('modalCancel').onclick = closeModal;
  overlay.onclick = (e) => { if(e.target === overlay) closeModal(); };

  const wireRows = () => {
    overlay.querySelectorAll('[data-pick-kasbank]').forEach(btn => btn.onclick = () => {
      const kb = DATA.kasBank.find(x => x.kode === btn.dataset.pickKasbank);
      if(!kb) return;
      setField('akunKasBank', kb.kode, `${kb.nama} ${kb.mataUang||''}`.trim());
      document.getElementById('fJklMataUang').value = kb.mataUang || 'IDR';
      closeModal();
    });
  };
  wireRows();

  document.getElementById('jklKasBankPickerSearch').oninput = (e) => {
    const q = e.target.value.trim().toLowerCase();
    const filtered = DATA.kasBank.filter(k => k.kode.toLowerCase().includes(q) || (k.nama||'').toLowerCase().includes(q) || (k.masterBank||'').toLowerCase().includes(q));
    document.getElementById('jklKasBankPickerBody').innerHTML = tplJklKasBankPickerRows(filtered);
    wireRows();
  };
}

function openJklAkunPicker(key, row, setField){
  closeModal();
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.innerHTML = tplJklAkunPicker(DATA.akunGL, key);
  document.body.appendChild(overlay);
  document.getElementById('modalClose').onclick = closeModal;
  document.getElementById('modalCancel').onclick = closeModal;
  overlay.onclick = (e) => { if(e.target === overlay) closeModal(); };

  const wireRows = () => {
    overlay.querySelectorAll('[data-pick-akun]').forEach(btn => btn.onclick = () => {
      setField(key, btn.dataset.pickAkun, jklAkunNama(btn.dataset.pickAkun));
      closeModal();
    });
  };
  wireRows();

  document.getElementById('jklAkunPickerSearch').oninput = (e) => {
    const q = e.target.value.trim().toLowerCase();
    const filtered = DATA.akunGL.filter(a => a.kode.toLowerCase().includes(q) || a.nama.toLowerCase().includes(q));
    document.getElementById('jklAkunPickerBody').innerHTML = tplJklAkunPickerRows(filtered, key);
    wireRows();
  };
}

function openJklDeleteConfirm(idx){
  closeModal();
  const row = DATA.jurnalKasLain[idx];
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.innerHTML = tplJklDeleteConfirm(row);
  document.body.appendChild(overlay);
  document.getElementById('modalClose').onclick = closeModal;
  document.getElementById('modalCancel').onclick = closeModal;
  overlay.onclick = (e) => { if(e.target === overlay) closeModal(); };
  document.getElementById('modalDelete').onclick = () => {
    DATA.jurnalKasLain.splice(idx, 1);
    closeModal();
    renderJklTable();
  };
}

function openJklInfo(title, text){
  closeModal();
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.innerHTML = tplJklInfoModal(title, text);
  document.body.appendChild(overlay);
  document.getElementById('modalClose').onclick = closeModal;
  document.getElementById('modalOk').onclick = closeModal;
  overlay.onclick = (e) => { if(e.target === overlay) closeModal(); };
}
