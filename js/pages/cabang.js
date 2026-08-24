/* =========================================================
   LOGIC (JS saja) — Master Cabang (menu General Ledger > Master &
   Setting > Cabang, page 'cabang'). Dimuat otomatis (lazy-load) oleh
   core.js saat menu ini pertama kali diklik — lihat PAGE_MODULES di
   js/core.js. Markup HTML-nya ada di file sebelah: cabang.template.js
   (tplCabangListPage/tplCbRows/tplCabangForm/tplCb*Panel/dst).
   NB: closeModal() dipakai bersama, didefinisikan di core.js.

   Pola CRUD: list + form FULL PAGE (sama seperti Master Wilayah) + 6
   tab (Cost Center/Rincian Jurnal Akun/Wilayah Sales/Penanggung
   Jawab/Informasi Izin Cabang/Jurnal R/K), semua diedit langsung ke
   `row` (deep-copy dari DATA.cabangMaster[idx] saat mode edit) lalu
   ditulis balik ke DATA.cabangMaster saat Simpan — sama seperti pola
   openWlForm()/wlSave() di master-wilayah.js.
========================================================= */

function renderCabangPage(){
  renderCbList();
}

function renderCbList(){
  content.innerHTML = tplCabangListPage();
  document.getElementById('btnCbAdd').onclick = () => openCbForm('add');
  document.getElementById('btnCbSyncCustomer').onclick = () => openCbSyncCustomerModal();
  document.getElementById('btnCbTutorial').onclick = () => alert('Tutorial video akan tersedia di sini. (Contoh tampilan mockup)');
  renderCbTable();
}

function renderCbTable(){
  const tbody = document.getElementById('cbTbody');
  const total = document.getElementById('cbTotal');
  const rows = DATA.cabangMaster;
  tbody.innerHTML = tplCbRows(rows);
  total.textContent = `Total Record: ${rows.length}`;
  tbody.querySelectorAll('[data-edit]').forEach(b => b.onclick = () => openCbForm('edit', +b.dataset.edit));
  tbody.querySelectorAll('[data-del]').forEach(b => b.onclick = () => openCbDeleteConfirm(+b.dataset.del));
}

function cbNextKode(){
  const used = new Set(DATA.cabangMaster.map(r=>r.kode));
  let n = 8;
  while (used.has(String(n).padStart(2,'0'))) n++;
  return String(n).padStart(2,'0');
}

function cbEmptyRow(){
  return {
    kode: cbNextKode(), nama:'', namaPerusahaan:'PT Distriversa Buanamas', alamat:'', kota:'', provinsi: DATA.provinsiList[0],
    kodePos:'', telepon:'', fax:'', email:'', npwp:'', tanggalBerdiri:'', status:'Aktif',
    costCenterKode:[], akunJurnal:{akunKas:'', akunPiutang:'', akunPersediaan:'', akunHutang:''}, wilayahKode:[],
    penanggungJawab:[], izinCabang:{noNib:'', tglNib:'', noSiup:'', tglSiup:'', noTdg:'', tglTdg:'', berlakuSampai:'', statusPerizinan:'Dalam Proses'},
    jurnalRK:{akunPiutangRK:'1120002', akunHutangRK:'2110003'},
  };
}

function openCbForm(mode, idx){
  const row = mode === 'add' ? cbEmptyRow() : JSON.parse(JSON.stringify(DATA.cabangMaster[idx]));
  content.innerHTML = tplCabangForm(mode, row);

  wireCbTabs();
  wireCbCcTab(row);
  wireCbJurnalTab(row);
  wireCbWilayahTab(row);
  wireCbPjTab(row);
  wireCbIzinTab(row);
  wireCbRkTab(row);

  document.getElementById('cbSave').onclick = () => cbSave(mode, idx, row);
  document.getElementById('cbCancel').onclick = () => renderCbList();
}

/* ===== Tab switching (pola sama seperti tab Rincian Transaksi
   Persediaan/Rincian Jurnal Akun di transaksi-persediaan.js) ===== */
function wireCbTabs(){
  const tabs = ['cc','jurnal','wilayah','pj','izin','rk'];
  const btns = content.querySelectorAll('[data-cb-tab]');
  btns.forEach(btn => {
    btn.onclick = () => {
      btns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      tabs.forEach(t => {
        document.getElementById(`cbTabPanel-${t}`).style.display = (t === btn.dataset.cbTab) ? '' : 'none';
      });
    };
  });
}

/* ===== Tab 1: Cost Center (tautan) ===== */
function wireCbCcTab(row){
  wireCbCcRows(row);
  document.getElementById('btnCbCcAdd').onclick = (e) => {
    e.preventDefault();
    const used = new Set(row.costCenterKode);
    const next = DATA.costCenter.find(c => !used.has(c.kode)) || DATA.costCenter[0];
    row.costCenterKode.push(next.kode);
    renderCbCcSection(row);
  };
}

function renderCbCcSection(row){
  document.getElementById('cbCcTbody').innerHTML = tplCbCcRows(row.costCenterKode);
  wireCbCcRows(row);
}

function wireCbCcRows(row){
  const tbody = document.getElementById('cbCcTbody');
  tbody.querySelectorAll('[data-cc-idx]').forEach(sel => {
    sel.onchange = (e) => { row.costCenterKode[+e.target.dataset.ccIdx] = e.target.value; };
  });
  tbody.querySelectorAll('[data-cc-del]').forEach(btn => {
    btn.onclick = () => { row.costCenterKode.splice(+btn.dataset.ccDel, 1); renderCbCcSection(row); };
  });
}

/* ===== Tab 2: Rincian Jurnal Akun (akun picker + Generate Account) ===== */
function wireCbJurnalTab(row){
  CB_AKUN_FIELDS.forEach(f => {
    document.querySelector(`[data-cb-akun-search="${f.key}"]`).onclick = () => openCbAkunPicker(f.key, row, 'jurnal');
    document.querySelector(`[data-cb-akun-clear="${f.key}"]`).onclick = () => {
      row.akunJurnal[f.key] = '';
      document.getElementById(`fCbAkun_${f.key}`).value = '';
      document.getElementById(`fCbAkunNama_${f.key}`).textContent = '';
    };
  });
  document.getElementById('btnCbGenerateAccount').onclick = () => {
    row.akunJurnal = { akunKas:'1100002', akunPiutang:'1120001', akunPersediaan:'1130001', akunHutang:'2110001' };
    CB_AKUN_FIELDS.forEach(f => {
      document.getElementById(`fCbAkun_${f.key}`).value = row.akunJurnal[f.key];
      document.getElementById(`fCbAkunNama_${f.key}`).textContent = cbAkunNama(row.akunJurnal[f.key]);
    });
  };
}

/* ===== Tab 6: Jurnal R/K (akun picker, target berbeda supaya
   openCbAkunPicker() tahu harus menulis ke row.jurnalRK bukan
   row.akunJurnal) ===== */
function wireCbRkTab(row){
  CB_RK_FIELDS.forEach(f => {
    document.querySelector(`#cbTabPanel-rk [data-cb-akun-search="${f.key}"]`).onclick = () => openCbAkunPicker(f.key, row, 'rk');
    document.querySelector(`#cbTabPanel-rk [data-cb-akun-clear="${f.key}"]`).onclick = () => {
      row.jurnalRK[f.key] = '';
      document.getElementById(`fCbRk_${f.key}`).value = '';
      document.getElementById(`fCbRkNama_${f.key}`).textContent = '';
    };
  });
}

function openCbAkunPicker(fieldKey, row, target){
  closeModal();
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.innerHTML = tplCbAkunPicker(DATA.akunGL, fieldKey, target);
  document.body.appendChild(overlay);
  document.getElementById('modalClose').onclick = closeModal;
  document.getElementById('modalCancel').onclick = closeModal;
  overlay.onclick = (e) => { if(e.target === overlay) closeModal(); };

  const wireRows = () => {
    overlay.querySelectorAll('[data-cb-pick-akun]').forEach(btn => btn.onclick = () => {
      const kode = btn.dataset.cbPickAkun;
      const fk = btn.dataset.cbPickField;
      const tg = btn.dataset.cbPickTarget;
      if(tg === 'rk'){
        row.jurnalRK[fk] = kode;
        document.getElementById(`fCbRk_${fk}`).value = kode;
        document.getElementById(`fCbRkNama_${fk}`).textContent = cbAkunNama(kode);
      } else {
        row.akunJurnal[fk] = kode;
        document.getElementById(`fCbAkun_${fk}`).value = kode;
        document.getElementById(`fCbAkunNama_${fk}`).textContent = cbAkunNama(kode);
      }
      closeModal();
    });
  };
  wireRows();

  document.getElementById('cbAkunPickerSearch').oninput = (e) => {
    const q = e.target.value.trim().toLowerCase();
    const filtered = DATA.akunGL.filter(a => a.kode.includes(q) || a.nama.toLowerCase().includes(q));
    document.getElementById('cbAkunPickerBody').innerHTML = tplCbAkunPickerRows(filtered, fieldKey, target);
    wireRows();
  };
}

/* ===== Tab 3: Wilayah Sales (tautan) ===== */
function wireCbWilayahTab(row){
  wireCbWlRows(row);
  document.getElementById('btnCbWlAdd').onclick = (e) => {
    e.preventDefault();
    const used = new Set(row.wilayahKode);
    const next = DATA.area.find(a => !used.has(a.kode)) || DATA.area[0];
    row.wilayahKode.push(next.kode);
    renderCbWlSection(row);
  };
}

function renderCbWlSection(row){
  document.getElementById('cbWlTbody').innerHTML = tplCbWlRows(row.wilayahKode);
  wireCbWlRows(row);
}

function wireCbWlRows(row){
  const tbody = document.getElementById('cbWlTbody');
  tbody.querySelectorAll('[data-wl-idx]').forEach(sel => {
    sel.onchange = (e) => { row.wilayahKode[+e.target.dataset.wlIdx] = e.target.value; };
  });
  tbody.querySelectorAll('[data-wl-del]').forEach(btn => {
    btn.onclick = () => { row.wilayahKode.splice(+btn.dataset.wlDel, 1); renderCbWlSection(row); };
  });
}

/* ===== Tab 4: Penanggung Jawab (entitas baru + tag-chip Kategori
   Barang) ===== */
function wireCbPjTab(row){
  wireCbPjRows(row);
  document.getElementById('btnCbPjAdd').onclick = (e) => {
    e.preventDefault();
    row.penanggungJawab.push({ nama:'', jabatan: CB_JABATAN_LIST[0], kategoriBarang:[] });
    renderCbPjSection(row);
  };
}

function renderCbPjSection(row){
  document.getElementById('cbPjTbody').innerHTML = tplCbPjRows(row.penanggungJawab);
  wireCbPjRows(row);
}

function wireCbPjRows(row){
  const tbody = document.getElementById('cbPjTbody');
  tbody.querySelectorAll('[data-pj-nama]').forEach(inp => {
    inp.oninput = (e) => { row.penanggungJawab[+e.target.dataset.pjNama].nama = e.target.value; };
  });
  tbody.querySelectorAll('[data-pj-jabatan]').forEach(sel => {
    sel.onchange = (e) => { row.penanggungJawab[+e.target.dataset.pjJabatan].jabatan = e.target.value; };
  });
  tbody.querySelectorAll('[data-pj-del]').forEach(btn => {
    btn.onclick = () => { row.penanggungJawab.splice(+btn.dataset.pjDel, 1); renderCbPjSection(row); };
  });
  tbody.querySelectorAll('[data-pj-kat-add]').forEach(a => {
    a.onclick = (e) => { e.preventDefault(); openCbPjKatPicker(row, +a.dataset.pjKatAdd); };
  });
  tbody.querySelectorAll('[data-pj-kat-rm]').forEach(rm => {
    rm.onclick = () => {
      const [rowIdx, katIdx] = rm.dataset.pjKatRm.split(':').map(Number);
      row.penanggungJawab[rowIdx].kategoriBarang.splice(katIdx, 1);
      renderCbPjKatTagsSection(row, rowIdx);
    };
  });
}

function renderCbPjKatTagsSection(row, rowIdx){
  document.getElementById(`cbPjKatBox_${rowIdx}`).innerHTML = tplCbPjKatTags(row.penanggungJawab[rowIdx].kategoriBarang, rowIdx);
  wireCbPjRows(row);
}

function openCbPjKatPicker(row, rowIdx){
  closeModal();
  const already = row.penanggungJawab[rowIdx].kategoriBarang;
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.innerHTML = tplCbPjKatPickerModal(DATA.kategoriBarang, already, rowIdx);
  document.body.appendChild(overlay);
  document.getElementById('modalClose').onclick = closeModal;
  document.getElementById('modalCancel').onclick = closeModal;
  overlay.onclick = (e) => { if(e.target === overlay) closeModal(); };
  overlay.querySelectorAll('[data-pj-kat-pick]').forEach(btn => btn.onclick = () => {
    const kode = btn.dataset.pjKatPick;
    if(!already.includes(kode)) already.push(kode);
    closeModal();
    renderCbPjKatTagsSection(row, rowIdx);
  });
}

/* ===== Tab 5: Informasi Izin Cabang (field-table biasa, tulis balik
   ke row.izinCabang saat Simpan — lihat cbSave()) ===== */
function wireCbIzinTab(row){
  // Tidak perlu live-binding khusus di sini — semua field dibaca
  // langsung dari DOM di cbSave() (sama seperti pola wlSave()).
}

function cbSave(mode, idx, row){
  row.nama = document.getElementById('fCbNama').value.trim();
  row.status = document.querySelector('input[name="fCbStatus"]:checked').value;
  row.alamat = document.getElementById('fCbAlamat').value.trim();
  row.kota = document.getElementById('fCbKota').value.trim();
  row.provinsi = document.getElementById('fCbProvinsi').value;
  row.kodePos = document.getElementById('fCbKodePos').value.trim();
  row.tanggalBerdiri = document.getElementById('fCbTglBerdiri').value.trim();
  row.telepon = document.getElementById('fCbTelepon').value.trim();
  row.fax = document.getElementById('fCbFax').value.trim();
  row.email = document.getElementById('fCbEmail').value.trim();
  row.npwp = document.getElementById('fCbNpwp').value.trim();

  row.izinCabang.noNib = document.getElementById('fCbNib').value.trim();
  row.izinCabang.tglNib = document.getElementById('fCbTglNib').value.trim();
  row.izinCabang.noSiup = document.getElementById('fCbSiup').value.trim();
  row.izinCabang.tglSiup = document.getElementById('fCbTglSiup').value.trim();
  row.izinCabang.noTdg = document.getElementById('fCbTdg').value.trim();
  row.izinCabang.tglTdg = document.getElementById('fCbTglTdg').value.trim();
  row.izinCabang.berlakuSampai = document.getElementById('fCbBerlakuSampai').value.trim();
  row.izinCabang.statusPerizinan = document.getElementById('fCbStatusPerizinan').value;

  if(!row.nama){ alert('Nama Cabang wajib diisi.'); return; }

  if(mode === 'add'){ DATA.cabangMaster.push(row); }
  else { DATA.cabangMaster[idx] = row; }
  renderCbList();
}

function openCbDeleteConfirm(idx){
  closeModal();
  const row = DATA.cabangMaster[idx];
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.innerHTML = tplCbDeleteConfirm(row);
  document.body.appendChild(overlay);
  document.getElementById('modalClose').onclick = closeModal;
  document.getElementById('modalCancel').onclick = closeModal;
  overlay.onclick = (e) => { if(e.target === overlay) closeModal(); };
  document.getElementById('modalDelete').onclick = () => {
    DATA.cabangMaster.splice(idx, 1);
    closeModal();
    renderCbTable();
  };
}

/* ===== "Update Cabang ke Master Customer" (dekoratif) ===== */
function openCbSyncCustomerModal(){
  closeModal();
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.innerHTML = tplCbSyncCustomerModal();
  document.body.appendChild(overlay);
  document.getElementById('modalClose').onclick = closeModal;
  document.getElementById('modalOk').onclick = closeModal;
  overlay.onclick = (e) => { if(e.target === overlay) closeModal(); };
}
