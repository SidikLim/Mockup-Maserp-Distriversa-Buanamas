/* =========================================================
   LOGIC (JS saja) — Dominasi (Customer & Penjualan > Master &
   Setting). Dimuat otomatis (lazy-load) oleh core.js saat menu ini
   pertama kali diklik — lihat PAGE_MODULES di js/core.js. Markup
   HTML-nya ada di file sebelah: dominasi.template.js
   (tplDominasiListPage/tplDomRows/tplDominasiForm/
   tplDominasiFormBody/tplDominasiRegularBody/tplDominasiFixBody/
   tplDomClaimListPage/dst). NB: closeModal() dipakai bersama,
   didefinisikan di core.js.

   Pola CRUD form: persis Promotion — field "Tipe" adalah DRIVER,
   begitu diganti (mode Tambah saja; di mode Ubah Tipe existing
   dipertahankan sesuai data), badan form di bawah blok BC/Div/
   Principal di-render ulang total lewat tplDominasiFormBody(), dan
   field header yang sudah diisi user dibaca dulu dari DOM
   (domSyncHeaderFromDOM) sebelum badan form diganti supaya tidak
   hilang — pola "baca state dari DOM sebelum render ulang" yang
   sama seperti renderCgLegalitasSections()/openPromForm().

   Sub-halaman "Dominasi Claim Setting" BUKAN menu sidebar
   tersendiri — hanya bisa dibuka lewat tombol "Setting Claim
   Dominasi" di header list Dominasi (sesuai screenshot), dan
   ditutup kembali lewat tombol "Kembali" di header sub-halaman itu
   sendiri. CRUD-nya sederhana (persis pola Master Divisi): modal
   Tambah/Ubah dengan 2 field (Tgl. Efektif, Claim Persen) + Hapus.
========================================================= */

const DOM_PREFIX = { Regular:'B-DM320', Fix:'B-DM060FIX' };

function renderDominasiPage(){
  renderDomList();
}

function renderDomList(){
  content.innerHTML = tplDominasiListPage();
  document.getElementById('btnDomAdd').onclick = () => openDominasiForm('add');
  document.getElementById('btnDomClaimSetting').onclick = () => renderDomClaimList();
  renderDomTable();
}

function renderDomTable(){
  const tbody = document.getElementById('domTbody');
  const total = document.getElementById('domTotal');
  tbody.innerHTML = tplDomRows(DATA.dominasi);
  total.textContent = `Total Record: ${DATA.dominasi.length}`;
  tbody.querySelectorAll('[data-edit]').forEach(b => b.onclick = (e) => { e.preventDefault(); openDominasiForm('edit', +b.dataset.edit); });
  tbody.querySelectorAll('[data-del]').forEach(b => b.onclick = () => openDomDeleteConfirm(+b.dataset.del));
}

function domGenerateNumber(tipe){
  const prefix = DOM_PREFIX[tipe] || 'B-DM000';
  const seq = DATA.dominasi.filter(r => r.tipe === tipe).length + 1;
  return `${prefix}26080${String(seq).padStart(3,'0')}`;
}

function domEmptyItem(){
  return { kode:'', nama:'', satuan:'', qty:1, hna:0, hna1:0, discPrincipal:0, discDistributor:0, jumlah:0 };
}

function domEmptyRow(tipe){
  return {
    no:null, tanggal:'19/08/2026', tipe: tipe||'Regular',
    customerKode:'', customerNama:'', customerRef:'',
    noSpGuarantee:'', tenor:0,
    bcKode: DATA.businessCentre[0].kode, bcNama: DATA.businessCentre[0].nama,
    divKode: DATA.divisi[0].kode, divNama: DATA.divisi[0].nama,
    principalKode:'', principalNama:'', principalRef:'',
    nominalMax:0, jumlahPakai:0, statusAktif:'Active', dipakai:false,
    items:[domEmptyItem()],
  };
}

function domCloneRow(src){
  return { ...src, items: (src.items||[]).map(it => ({ ...it })) };
}

/* Pastikan field spesifik-tipe ter-inisialisasi begitu Tipe diganti
   di form yang sedang terbuka (mode Tambah) — kalau baris sebelumnya
   sudah pernah punya struktur yang cocok, datanya DIPERTAHANKAN. */
function domEnsureTypeDefaults(row){
  if(row.tipe === 'Fix'){
    if(!Array.isArray(row.items) || !row.items.length) row.items = [domEmptyItem()];
    domRecalcNominalMaxFix(row);
  } else {
    if(row.jumlahPakai === undefined) row.jumlahPakai = 0;
  }
}

function domValidationError(text){
  closeModal();
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.innerHTML = tplDomValidationModal(text);
  document.body.appendChild(overlay);
  document.getElementById('modalClose').onclick = closeModal;
  document.getElementById('modalOk').onclick = closeModal;
  overlay.onclick = (e) => { if(e.target === overlay) closeModal(); };
}

/* =========================================================
   FORM UTAMA — dispatch ulang badan form tiap kali Tipe berganti.
========================================================= */
function openDominasiForm(mode, idx){
  const row = mode === 'add' ? domEmptyRow('Regular') : domCloneRow(DATA.dominasi[idx]);
  if(mode === 'add'){
    row.no = domGenerateNumber(row.tipe);
    domEnsureTypeDefaults(row);
  }

  function renderBody(){
    content.innerHTML = tplDominasiForm(mode, row);
    wireHeader();
    wireVariant();
    wireFooter();
  }

  function wireHeader(){
    if(mode === 'add'){
      const btn = document.getElementById('domRefreshNo');
      if(btn) btn.onclick = () => {
        row.no = domGenerateNumber(row.tipe);
        document.getElementById('fDomNoGuarantee').value = row.no;
      };
    }
    document.getElementById('domCustomerSearch').onclick = () => openDomCustomerPicker(row);
    document.getElementById('domPrincipalSearch').onclick = () => openDomPrincipalPicker(row);
    document.getElementById('fDomBc').onchange = (e) => {
      const bc = DATA.businessCentre.find(b => b.kode === e.target.value);
      if(bc){ row.bcKode = bc.kode; row.bcNama = bc.nama; }
    };
    document.getElementById('fDomDiv').onchange = (e) => {
      const d = DATA.divisi.find(x => x.kode === e.target.value);
      if(d){ row.divKode = d.kode; row.divNama = d.nama; }
    };
    document.getElementById('fDomTipe').onchange = (e) => {
      domSyncHeaderFromDOM(row);
      row.tipe = e.target.value;
      domEnsureTypeDefaults(row);
      if(mode === 'add') row.no = domGenerateNumber(row.tipe);
      renderBody();
    };
  }

  function wireVariant(){
    if(row.tipe === 'Fix') wireFixVariant(row);
    else wireRegularVariant(row);
  }

  function wireFooter(){
    document.getElementById('domCancel').onclick = (e) => { e.preventDefault(); renderDomList(); };
    document.getElementById('domSave').onclick = () => {
      domSyncHeaderFromDOM(row);
      if(row.tipe === 'Fix') domSyncFixFromDOM(row);
      else domSyncRegularFromDOM(row);
      if(!row.customerKode){ domValidationError('Customer wajib dipilih'); return; }
      if(!row.principalKode){ domValidationError('Principal wajib dipilih'); return; }
      if(mode === 'add'){
        row.no = row.no || domGenerateNumber(row.tipe);
        DATA.dominasi.push(row);
      } else {
        DATA.dominasi[idx] = row;
      }
      renderDomList();
    };
  }

  renderBody();
}

/* Baca field-field header (selalu ada di kedua varian) langsung dari
   DOM — dipanggil sebelum ganti Tipe (supaya data yang sudah diisi
   user tidak hilang saat badan form diganti total) maupun sebelum
   Simpan. */
function domSyncHeaderFromDOM(row){
  const noSpEl = document.getElementById('fDomNoSpGuarantee'); if(noSpEl) row.noSpGuarantee = noSpEl.value.trim();
  const tenorEl = document.getElementById('fDomTenor'); if(tenorEl) row.tenor = +tenorEl.value || 0;
  const tglEl = document.getElementById('fDomTanggal'); if(tglEl) row.tanggal = tglEl.value;
}

function domSyncRegularFromDOM(row){
  const nmEl = document.getElementById('fDomNominalMax'); if(nmEl) row.nominalMax = +nmEl.value || 0;
  const jpEl = document.getElementById('fDomJumlahPakai'); if(jpEl) row.jumlahPakai = +jpEl.value || 0;
  const stEl = document.getElementById('fDomStatus'); if(stEl) row.statusAktif = stEl.value;
  row.dipakai = (row.jumlahPakai || 0) > 0;
}

function domSyncFixFromDOM(row){
  const stEl = document.getElementById('fDomStatus'); if(stEl) row.statusAktif = stEl.value;
  domRecalcNominalMaxFix(row);
}

/* ---------- Pickers Customer/Principal ---------- */
/* Kode referensi dekoratif di bawah field Customer (mis. "A000023823"
   di screenshot) — diturunkan deterministik dari posisi customer di
   DATA.customers, bukan data master sungguhan (tidak ada field ini di
   DATA.customers). */
function domCustomerRefFor(c){
  const i = DATA.customers.indexOf(c);
  return `A${String(i+1).padStart(6,'0')}`;
}

function openDomCustomerPicker(row){
  closeModal();
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.innerHTML = tplDomSimplePicker('Pilih Customer', DATA.customers);
  document.body.appendChild(overlay);
  document.getElementById('pickerClose').onclick = closeModal;
  document.getElementById('pickerCancel').onclick = closeModal;
  overlay.onclick = (e) => { if(e.target === overlay) closeModal(); };
  overlay.querySelectorAll('[data-pick]').forEach(b => b.onclick = () => {
    const c = DATA.customers.find(x => x.kode === b.dataset.pick);
    row.customerKode = c.kode; row.customerNama = c.nama; row.customerRef = domCustomerRefFor(c);
    document.getElementById('fDomCustomer').value = c.nama;
    document.getElementById('fDomCustomerRef').textContent = row.customerRef;
    closeModal();
  });
}

function openDomPrincipalPicker(row){
  closeModal();
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.innerHTML = tplDomSimplePicker('Pilih Supplier (Principal)', DATA.suppliers);
  document.body.appendChild(overlay);
  document.getElementById('pickerClose').onclick = closeModal;
  document.getElementById('pickerCancel').onclick = closeModal;
  overlay.onclick = (e) => { if(e.target === overlay) closeModal(); };
  overlay.querySelectorAll('[data-pick]').forEach(b => b.onclick = () => {
    const s = DATA.suppliers.find(x => x.kode === b.dataset.pick);
    row.principalKode = s.kode; row.principalNama = s.nama; row.principalRef = `HOVDR${s.kode}IDR`;
    document.getElementById('fDomPrincipal').value = s.nama;
    document.getElementById('fDomPrincipalRef').textContent = row.principalRef;
    closeModal();
  });
}

/* =========================================================
   VARIAN REGULAR — tidak ada kalkulasi reaktif (Nominal Max &
   Jumlah Pakai murni input manual).
========================================================= */
function wireRegularVariant(row){
  /* Tidak ada wiring khusus selain field biasa — dibaca langsung
     saat Simpan lewat domSyncRegularFromDOM(). Fungsi ini sengaja
     tetap ada (kosong) supaya wireVariant() di openDominasiForm()
     konsisten memanggil salah satu dari 2 fungsi wire, sama seperti
     wireDiscountProgram/wireDiscountProposal di Promotion. */
}

/* =========================================================
   VARIAN FIX — tabel rincian barang reaktif; Nominal Max = SUM
   kolom Jumlah (readonly, bukan input manual).
========================================================= */
function wireFixVariant(row){
  wireDomItems(row);
  document.getElementById('domAddItem').onclick = (e) => {
    e.preventDefault();
    row.items.push(domEmptyItem());
    rerenderDomItems(row);
  };
}

function rerenderDomItems(row){
  document.getElementById('domItemsWrap').innerHTML = tplDomItemsTable(row.items);
  wireDomItems(row);
  domRecalcNominalMaxFix(row);
  domRefreshNominalMaxDOM(row);
}

function wireDomItems(row){
  row.items.forEach((item, idx) => {
    const searchBtn = document.querySelector(`[data-dom-item-search="${idx}"]`);
    if(searchBtn) searchBtn.onclick = () => openDomItemPicker(item, idx, row);
    const delBtn = document.querySelector(`[data-dom-item-del="${idx}"]`);
    if(delBtn) delBtn.onclick = () => {
      if(row.items.length <= 1){ domValidationError('Minimal harus ada 1 baris barang'); return; }
      row.items.splice(idx, 1);
      rerenderDomItems(row);
    };
    const satuanEl = document.querySelector(`[data-dom-satuan="${idx}"]`);
    if(satuanEl) satuanEl.onchange = () => item.satuan = satuanEl.value;

    const qtyEl = document.querySelector(`[data-dom-qty="${idx}"]`);
    const hnaEl = document.querySelector(`[data-dom-hna="${idx}"]`);
    const hna1El = document.querySelector(`[data-dom-hna1="${idx}"]`);
    const discpEl = document.querySelector(`[data-dom-discp="${idx}"]`);
    const discdEl = document.querySelector(`[data-dom-discd="${idx}"]`);

    const recalc = () => {
      item.qty = +qtyEl.value || 0;
      item.hna = +hnaEl.value || 0;
      item.hna1 = +hna1El.value || 0;
      item.discPrincipal = +discpEl.value || 0;
      item.discDistributor = +discdEl.value || 0;
      domRecalcItem(item);
      const cell = document.querySelector(`[data-dom-jumlah-cell="${idx}"]`);
      if(cell) cell.textContent = num(item.jumlah || 0);
      domRecalcNominalMaxFix(row);
      domRefreshNominalMaxDOM(row);
    };
    [qtyEl, hnaEl, hna1El, discpEl, discdEl].forEach(el => { if(el) el.oninput = recalc; });
  });
}

/* Jumlah per baris = HNA1 x (1 - Discount Principal% - Discount
   Distributor%) x Qty — mengurangi 2 diskon persen sekaligus dari 1
   harga dasar (HNA1), pola sama seperti Discount Category di
   Promotion (promRecalcSubTotal). */
function domRecalcItem(item){
  const discP = (+item.discPrincipal || 0) / 100;
  const discD = (+item.discDistributor || 0) / 100;
  const netPerUnit = (+item.hna1 || 0) * (1 - discP - discD);
  item.jumlah = Math.round(netPerUnit * (+item.qty || 0));
}

function domRecalcNominalMaxFix(row){
  row.items.forEach(domRecalcItem);
  row.nominalMax = row.items.reduce((sum, it) => sum + (it.jumlah || 0), 0);
}

function domRefreshNominalMaxDOM(row){
  const el = document.getElementById('fDomNominalMax');
  if(el) el.value = num(row.nominalMax || 0);
}

function openDomItemPicker(item, idx, row){
  closeModal();
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.innerHTML = tplDomItemPicker(DATA.items);
  document.body.appendChild(overlay);
  document.getElementById('modalClose').onclick = closeModal;
  document.getElementById('modalCancel').onclick = closeModal;
  overlay.onclick = (e) => { if(e.target === overlay) closeModal(); };

  const wireRows = () => {
    overlay.querySelectorAll('[data-pick-item]').forEach(b => b.onclick = () => {
      const it = DATA.items.find(x => x.kode === b.dataset.pickItem);
      item.kode = it.kode; item.nama = it.nama; item.satuan = it.satuan; item.hna = it.harga; item.hna1 = it.harga;
      closeModal();
      rerenderDomItems(row);
    });
  };
  wireRows();

  document.getElementById('domItemPickerSearch').oninput = (e) => {
    const q = e.target.value.trim().toLowerCase();
    const filtered = DATA.items.filter(a => a.kode.toLowerCase().includes(q) || a.nama.toLowerCase().includes(q));
    document.getElementById('domItemPickerBody').innerHTML = tplDomItemPickerRows(filtered);
    wireRows();
  };
}

/* ---------- Hapus ---------- */
function openDomDeleteConfirm(idx){
  closeModal();
  const row = DATA.dominasi[idx];
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.innerHTML = tplDomDeleteConfirm(row);
  document.body.appendChild(overlay);
  document.getElementById('modalClose').onclick = closeModal;
  document.getElementById('modalCancel').onclick = closeModal;
  overlay.onclick = (e) => { if(e.target === overlay) closeModal(); };
  document.getElementById('modalDelete').onclick = () => {
    DATA.dominasi.splice(idx, 1);
    closeModal();
    renderDomTable();
  };
}

/* =========================================================
   SUB-HALAMAN "Dominasi Claim Setting"
========================================================= */
function renderDomClaimList(){
  content.innerHTML = tplDomClaimListPage();
  document.getElementById('btnDomClaimBack').onclick = () => renderDomList();
  document.getElementById('btnDomClaimAdd').onclick = () => openDomClaimModal('add');
  renderDomClaimTable();
}

function renderDomClaimTable(){
  const tbody = document.getElementById('domClaimTbody');
  const total = document.getElementById('domClaimTotal');
  tbody.innerHTML = tplDomClaimRows(DATA.dominasiClaimSetting);
  total.textContent = `Total Record: ${DATA.dominasiClaimSetting.length}`;
  tbody.querySelectorAll('[data-claim-edit]').forEach(b => b.onclick = () => openDomClaimModal('edit', +b.dataset.claimEdit));
  tbody.querySelectorAll('[data-claim-del]').forEach(b => b.onclick = () => openDomClaimDeleteConfirm(+b.dataset.claimDel));
}

function openDomClaimModal(mode, idx){
  closeModal();
  const row = mode === 'edit' ? DATA.dominasiClaimSetting[idx] : { tglEfektif:'', claimPersen:0 };
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.innerHTML = tplDomClaimModal(mode, row);
  document.body.appendChild(overlay);
  document.getElementById('modalClose').onclick = closeModal;
  document.getElementById('modalCancel').onclick = closeModal;
  overlay.onclick = (e) => { if(e.target === overlay) closeModal(); };
  document.getElementById('modalSave').onclick = () => {
    const tglEfektif = document.getElementById('fClaimTglEfektif').value.trim();
    const claimPersen = +document.getElementById('fClaimPersen').value || 0;
    if(!tglEfektif){ domValidationError('Tgl. Efektif wajib diisi'); return; }
    if(mode === 'add'){ DATA.dominasiClaimSetting.push({ tglEfektif, claimPersen }); }
    else { DATA.dominasiClaimSetting[idx] = { tglEfektif, claimPersen }; }
    closeModal();
    renderDomClaimTable();
  };
}

function openDomClaimDeleteConfirm(idx){
  closeModal();
  const row = DATA.dominasiClaimSetting[idx];
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.innerHTML = tplDomClaimDeleteConfirm(row);
  document.body.appendChild(overlay);
  document.getElementById('modalClose').onclick = closeModal;
  document.getElementById('modalCancel').onclick = closeModal;
  overlay.onclick = (e) => { if(e.target === overlay) closeModal(); };
  document.getElementById('modalDelete').onclick = () => {
    DATA.dominasiClaimSetting.splice(idx, 1);
    closeModal();
    renderDomClaimTable();
  };
}
