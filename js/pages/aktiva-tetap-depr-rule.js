/* =========================================================
   LOGIC (JS saja) — Aktiva Tetap Depr Rule (Aktiva Tetap >
   Master & Setting > Rumus Penyusutan, page:
   'aktivaTetapDeprRule'). Dimuat otomatis (lazy-load) oleh
   core.js saat menu ini pertama kali diklik — lihat
   PAGE_MODULES di js/core.js. Markup HTML-nya ada di file
   sebelah: aktiva-tetap-depr-rule.template.js. NB: closeModal()
   dipakai bersama, didefinisikan di core.js.

   atDeprTarif() dipakai juga oleh fixed-asset.js (Nilai Susut %
   di form Master Fixed Asset) — didefinisikan di sini karena
   modul ini "sumber kebenaran" utk Aturan Penyusutan, TAPI
   fixed-asset.js punya SALINAN LOKAL sendiri (bukan reference
   cross-file, lazy-load antar modul tidak terjamin urutannya —
   lihat catatan konvensi di fixed-asset.js).
========================================================= */

let adrSearch = '';

/* Formula tarif penyusutan fiskal standar Indonesia: Straight
   Line = 100/masaSusut, Declining Balance = 200/masaSusut.
   Diverifikasi cocok 100% dgn 2 baris contoh nyata di screenshot
   (KENDARAAN BERMOTOR 1, masa 4 Thn → SL 25,00%/DB 50,00%; masa
   8 Thn dipakai contoh Aturan Penyusutan di form Master Fixed
   Asset → Nilai Susut 12,50% = 100/8). */
function atDeprTarif(masaSusut){
  const m = Number(masaSusut) || 1;
  return { sl: 100/m, db: 200/m };
}

function renderAktivaTetapDeprRulePage(){
  renderAdrList();
}

function renderAdrList(){
  content.innerHTML = tplAdrListPage();
  adrSearch = '';
  document.getElementById('btnAdrAdd').onclick = () => openAdrForm('add');
  document.getElementById('adrPageSize').onchange = () => {}; // dekoratif — 24 baris, tidak perlu pagination sungguhan
  document.getElementById('adrSearch').oninput = (e) => {
    adrSearch = e.target.value.trim().toLowerCase();
    renderAdrTable();
  };
  renderAdrTable();
}

function adrFilteredRows(){
  if(!adrSearch) return DATA.aktivaTetapDeprRule.slice();
  return DATA.aktivaTetapDeprRule.filter(r =>
    r.kodeKelompok.toLowerCase().includes(adrSearch) ||
    r.keterangan.toLowerCase().includes(adrSearch) ||
    r.kelompokAktiva.toLowerCase().includes(adrSearch));
}

function renderAdrTable(){
  const rows = adrFilteredRows();
  const tbody = document.getElementById('adrTbody');
  const total = document.getElementById('adrTotal');
  tbody.innerHTML = tplAdrRows(rows);
  total.textContent = `Total Record: ${rows.length}`;
  tbody.querySelectorAll('[data-edit]').forEach(b => b.onclick = (e) => { e.preventDefault(); openAdrForm('edit', +b.dataset.edit); });
  tbody.querySelectorAll('[data-del]').forEach(b => b.onclick = () => openAdrDeleteConfirm(+b.dataset.del));
}

function openAdrForm(mode, idx){
  const row = mode === 'edit' ? DATA.aktivaTetapDeprRule[idx] : { kodeKelompok:'', golongan:'1', kodeGolongan:'Bukan bangunan', masaSusut:4, kelompokAktiva:'Komersial', keterangan:'' };
  renderAdrFormBody(mode, row, idx);
}

function renderAdrFormBody(mode, row, idx){
  content.innerHTML = tplAdrForm(mode, row, atDeprTarif(row.masaSusut));
  wireAdrForm(mode, row, idx);
}

function wireAdrForm(mode, row, idx){
  document.getElementById('btnAdrTutorial').onclick = () => adrInfo('Tutorial', 'Video tutorial pengisian Aktiva Tetap Depr Rule ini contoh tampilan mockup (dekoratif).');
  document.getElementById('fAdrMasaSusut').oninput = (e) => {
    const tarif = atDeprTarif(e.target.value);
    document.getElementById('fAdrTarifSL').value = tarif.sl.toFixed(2).replace('.',',');
    document.getElementById('fAdrTarifDB').value = tarif.db.toFixed(2).replace('.',',');
  };
  document.getElementById('btnAdrCancel').onclick = () => renderAdrList();
  document.getElementById('btnAdrSave').onclick = () => adrSave(mode, row, idx);
}

function adrInfo(title, text){
  closeModal();
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.innerHTML = `
    <div class="modal-box">
      <div class="modal-header"><span>${title}</span><span class="close" id="modalClose">&times;</span></div>
      <div class="modal-body"><p>${text}</p></div>
      <div class="modal-footer"><button class="btn-primary" id="modalOk">Tutup</button></div>
    </div>`;
  document.body.appendChild(overlay);
  document.getElementById('modalClose').onclick = closeModal;
  document.getElementById('modalOk').onclick = closeModal;
}

function adrSave(mode, row, idx){
  const kodeKelompok = document.getElementById('fAdrKodeKelompok').value.trim().toUpperCase();
  const kodeGolongan = document.getElementById('fAdrKodeGolongan').value;
  const masaSusut = +document.getElementById('fAdrMasaSusut').value || 1;
  const kelompokAktiva = document.querySelector('[name="fAdrKelompokAktiva"]:checked').value;
  const keterangan = document.getElementById('fAdrKeterangan').value.trim();
  const golongan = kodeGolongan === 'Bukan bangunan' ? '1' : '2';

  if(!kodeKelompok){
    document.getElementById('fAdrKodeErr').textContent = 'Kode Kelompok wajib diisi & unik';
    document.getElementById('fAdrKodeErr').style.display = 'block';
    return;
  }
  if(mode === 'add' && DATA.aktivaTetapDeprRule.some(r => r.kodeKelompok.toUpperCase() === kodeKelompok)){
    document.getElementById('fAdrKodeErr').textContent = 'Kode Kelompok sudah dipakai, gunakan kode lain';
    document.getElementById('fAdrKodeErr').style.display = 'block';
    return;
  }

  const updated = { kodeKelompok, golongan, kodeGolongan, masaSusut, kelompokAktiva, keterangan };
  if(mode === 'add') DATA.aktivaTetapDeprRule.unshift(updated);
  else DATA.aktivaTetapDeprRule[idx] = updated;
  renderAdrList();
}

function openAdrDeleteConfirm(idx){
  closeModal();
  const row = DATA.aktivaTetapDeprRule[idx];
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.innerHTML = tplAdrDeleteConfirm(row);
  document.body.appendChild(overlay);
  document.getElementById('modalClose').onclick = closeModal;
  document.getElementById('modalCancel').onclick = closeModal;
  overlay.onclick = (e) => { if(e.target === overlay) closeModal(); };
  document.getElementById('modalDelete').onclick = () => {
    DATA.aktivaTetapDeprRule.splice(idx, 1);
    closeModal();
    renderAdrTable();
  };
}
