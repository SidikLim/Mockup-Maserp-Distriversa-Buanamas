/* =========================================================
   LOGIC (JS saja) — Daftar Jurnal Fixed Asset (Aktiva Tetap >
   Master & Setting > Jurnal Aktiva Tetap, page:
   'jurnalFixedAsset'). Dimuat otomatis (lazy-load) oleh core.js
   saat menu ini pertama kali diklik — lihat PAGE_MODULES di
   js/core.js. Markup HTML-nya ada di file sebelah:
   jurnal-fixed-asset.template.js. NB: closeModal() dipakai
   bersama, didefinisikan di core.js.
========================================================= */

let jfaSearch = '';

function jfaAkunNamaOf(kode){
  const a = DATA.akunGL.find(x => x.kode === kode);
  return a ? a.nama : '';
}

function renderJurnalFixedAssetPage(){
  content.innerHTML = tplJfaPage();
  jfaSearch = '';
  document.querySelectorAll('[data-jfa-tipe]').forEach(btn => {
    btn.onclick = () => openJfaModal('add', btn.dataset.jfaTipe);
  });
  document.getElementById('jfaPageSize').onchange = () => {}; // dekoratif — dataset kecil, tidak perlu pagination sungguhan
  document.getElementById('jfaSearch').oninput = (e) => {
    jfaSearch = e.target.value.trim().toLowerCase();
    renderJfaTable();
  };
  renderJfaTable();
}

function jfaFilteredRows(){
  if(!jfaSearch) return DATA.jurnalFixedAsset.slice();
  return DATA.jurnalFixedAsset.filter(r => String(r.kode).includes(jfaSearch) || (r.keterangan||'').toLowerCase().includes(jfaSearch));
}

function renderJfaTable(){
  const rows = jfaFilteredRows();
  const tbody = document.getElementById('jfaTbody');
  const total = document.getElementById('jfaTotal');
  tbody.innerHTML = tplJfaRows(rows);
  total.textContent = `Total Record: ${rows.length}`;
  tbody.querySelectorAll('[data-edit]').forEach(b => b.onclick = () => openJfaModal('edit', DATA.jurnalFixedAsset[+b.dataset.edit].tipe, +b.dataset.edit));
  tbody.querySelectorAll('[data-del]').forEach(b => b.onclick = () => openJfaDeleteConfirm(+b.dataset.del));
}

function jfaNextKode(){
  const max = DATA.jurnalFixedAsset.reduce((m,r) => Math.max(m, r.kode), 0);
  return max + 1;
}

function openJfaModal(mode, tipe, idx){
  closeModal();
  const row = mode === 'edit' ? DATA.jurnalFixedAsset[idx] : { kode: jfaNextKode(), keterangan: '', tipe, golongan: JFA_GOLONGAN_LIST[0], glDebit: '', glKredit: '' };
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.innerHTML = tplJfaModal(mode, row, tipe);
  document.body.appendChild(overlay);
  document.getElementById('modalClose').onclick = closeModal;
  document.getElementById('modalCancel').onclick = closeModal;
  overlay.onclick = (e) => { if(e.target === overlay) closeModal(); };

  const golSel = document.getElementById('fJfaGolongan');
  const ketInput = document.getElementById('fJfaKeterangan');
  golSel.onchange = () => {
    // auto-susun Keterangan HANYA kalau user belum mengetik manual (masih pola default)
    const autoText = `Jurnal ${golSel.value} (${tipe})`;
    const wasAuto = !ketInput.value || /^Jurnal .+\(.+\)$/.test(ketInput.value);
    if(wasAuto) ketInput.value = autoText;
  };
  if(mode === 'add' && !ketInput.value){ ketInput.value = `Jurnal ${golSel.value} (${tipe})`; }

  document.getElementById('fJfaGlDebitBtn').onclick = () => openJfaAkunPicker('debit', row);
  document.getElementById('fJfaGlKreditBtn').onclick = () => openJfaAkunPicker('kredit', row);

  document.getElementById('modalSave').onclick = () => {
    const keterangan = ketInput.value.trim();
    const golongan = golSel.value;
    if(!keterangan){ document.getElementById('fJfaKeteranganErr').style.display = 'block'; return; }
    document.getElementById('fJfaKeteranganErr').style.display = 'none';
    if(mode === 'add'){
      DATA.jurnalFixedAsset.unshift({ kode: row.kode, keterangan, tipe, golongan, glDebit: row.glDebit, glKredit: row.glKredit });
    } else {
      DATA.jurnalFixedAsset[idx].keterangan = keterangan;
      DATA.jurnalFixedAsset[idx].golongan = golongan;
      DATA.jurnalFixedAsset[idx].glDebit = row.glDebit;
      DATA.jurnalFixedAsset[idx].glKredit = row.glKredit;
    }
    closeModal();
    renderJfaTable();
  };
}

function openJfaAkunPicker(target, row){
  const modalBox = document.querySelector('.modal-overlay .modal-box');
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.innerHTML = tplJfaAkunPicker(DATA.akunGL, target);
  document.body.appendChild(overlay);
  document.getElementById('pickerClose').onclick = () => overlay.remove();
  document.getElementById('pickerCancel').onclick = () => overlay.remove();
  overlay.onclick = (e) => { if(e.target === overlay) overlay.remove(); };
  document.getElementById('jfaAkunPickerSearch').oninput = (e) => {
    const q = e.target.value.toLowerCase();
    const filtered = DATA.akunGL.filter(a => a.kode.toLowerCase().includes(q) || a.nama.toLowerCase().includes(q));
    document.getElementById('jfaAkunPickerBody').innerHTML = tplJfaAkunPickerRows(filtered, target);
    wireJfaAkunPickerRows(overlay, target, row);
  };
  wireJfaAkunPickerRows(overlay, target, row);
}

function wireJfaAkunPickerRows(overlay, target, row){
  overlay.querySelectorAll('[data-pick-akun]').forEach(btn => {
    btn.onclick = () => {
      const kode = btn.dataset.pickAkun;
      if(target === 'debit'){
        row.glDebit = kode;
        document.getElementById('fJfaGlDebit').value = `${kode} - ${jfaAkunNamaOf(kode)}`;
      } else {
        row.glKredit = kode;
        document.getElementById('fJfaGlKredit').value = `${kode} - ${jfaAkunNamaOf(kode)}`;
      }
      overlay.remove();
    };
  });
}

function openJfaDeleteConfirm(idx){
  closeModal();
  const row = DATA.jurnalFixedAsset[idx];
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.innerHTML = tplJfaDeleteConfirm(row);
  document.body.appendChild(overlay);
  document.getElementById('modalClose').onclick = closeModal;
  document.getElementById('modalCancel').onclick = closeModal;
  overlay.onclick = (e) => { if(e.target === overlay) closeModal(); };
  document.getElementById('modalDelete').onclick = () => {
    DATA.jurnalFixedAsset.splice(idx, 1);
    closeModal();
    renderJfaTable();
  };
}
