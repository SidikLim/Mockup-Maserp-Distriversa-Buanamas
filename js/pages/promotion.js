/* =========================================================
   LOGIC (JS saja) — Promotion (Customer & Penjualan > Master &
   Setting). Dimuat otomatis (lazy-load) oleh core.js saat menu
   ini pertama kali diklik — lihat PAGE_MODULES di js/core.js.
   Markup HTML-nya ada di file sebelah: promotion.template.js
   (tplPromotionListPage/tplPromRows/tplPromotionForm/
   tplPromotionFormBody/tplPromDiscountProgram/
   tplPromDiscountProposal/tplPromDiscountCategory/dst).
   NB: closeModal() dipakai bersama, didefinisikan di core.js.

   Pola CRUD: list + form FULL PAGE (sama seperti Master Supplier/
   Jurnal Pembelian/Stock Request/Purchase Order/Kategori Barang/
   Grup Customer). Bagian PALING KHAS modul ini: field "Promotion
   Category" adalah DRIVER — begitu diganti, SELURUH badan form
   (bukan cuma 1 sub-section seperti Grup Customer) di-render ulang
   lewat tplPromotionFormBody() sesuai kategori baru. Supaya field
   umum yang sudah diisi user (Nama, Tgl Awal/Akhir, Status, Tipe
   Customer, dst — semuanya IKUT ter-render ulang di tiap varian)
   tidak hilang saat kategori diganti, nilai-nilai itu dibaca dulu
   dari DOM (promSyncCommonFromDOM) SEBELUM badan form diganti,
   nilainya disimpan balik ke `row`, baru redraw dengan kategori
   baru — pola "baca state dari DOM sebelum render ulang" ini sama
   seperti renderCgLegalitasSections() di Grup Customer.
========================================================= */

const PROM_OUTLET_CODE = {'Head Office':'HO','Surabaya':'SBY','Bandung':'BDG','Medan':'MDN','Makassar':'MKS','Semarang':'SMG','Tangerang':'TGR','Sidoarjo':'SDA'};

function renderPromotionPage(){
  renderPromList();
}

function renderPromList(){
  content.innerHTML = tplPromotionListPage();
  document.getElementById('btnPromAdd').onclick = () => openPromForm('add');
  document.getElementById('btnPromImport').onclick = () => openPromInfo('Import', 'Fitur import Promotion akan tersedia di modul lain.');
  renderPromTable();
}

function renderPromTable(){
  const tbody = document.getElementById('promTbody');
  const total = document.getElementById('promTotal');
  tbody.innerHTML = tplPromRows(DATA.promotion);
  total.textContent = `Total Record: ${DATA.promotion.length}`;
  tbody.querySelectorAll('[data-edit]').forEach(b => b.onclick = () => openPromForm('edit', +b.dataset.edit));
  tbody.querySelectorAll('[data-del]').forEach(b => b.onclick = () => openPromDeleteConfirm(+b.dataset.del));
  tbody.querySelectorAll('.prom-code-link').forEach(a => a.onclick = (e) => { e.preventDefault(); openPromForm('edit', +a.dataset.code); });
}

function promGenerateNumber(outlet){
  const kode = PROM_OUTLET_CODE[outlet] || 'XXX';
  const seq = DATA.promotion.filter(r => r.outlet === outlet).length + 1;
  return `26/PM-${kode}/08/${String(seq).padStart(5,'0')}`;
}

/* ---------- Builder baris kosong per kategori ---------- */
function promEmptyKetentuan(){
  return { qtyAwal:0, qtyAkhir:0, diskonPrincipal:0, diskonDistributor:0, ratioBarangBonus:0, barangBonusKode:'', barangBonusNama:'' };
}
function promEmptyDpItem(){
  return { jenis:'Group', kode:'', nama:'', ketentuan:[promEmptyKetentuan()] };
}
function promEmptyDpfItem(){
  return { kode:'', nama:'', qty:1, satuan:'', hna:0, hna1:0, hna1Inklusif:false, discPrincipal:0, discPrincipalUnit:'%', discDistributor:0, discDistributorUnit:'%', supportDiscount:0, supportDiscountUnit:'%' };
}
function promEmptyCatItem(){
  const kb = DATA.kategoriBarang[0];
  return { kategoriKode: kb.kode, kategoriNama: kb.nama, qty:0, discPrincipal:0, discPrincipalUnit:'%', discDistributor:0, discDistributorUnit:'%' };
}

function promEmptyRow(kategori){
  return {
    kode:null, noOtomatis:'PRO01', nama:'', kategori: kategori||'A', kodeLock:'',
    tglAwal:'11/08/2026', tglAkhir:'11/09/2026', status:'Active',
    tipeCustomer:'', customer:'', grupCustomer:'', description:'', outlet: DATA.outletList[0], ppn:11,
  };
}

/* Pastikan field spesifik-kategori ter-inisialisasi begitu Promotion
   Category diganti di form yang sedang terbuka — kalau baris sebelumnya
   sudah pernah punya struktur yang cocok (misal pindah DPF<->DPL yang
   struktur `items`-nya identik), datanya DIPERTAHANKAN, bukan direset. */
function promEnsureCategoryDefaults(row){
  if(row.kategori === 'A'){
    if(!row.detail || !Array.isArray(row.detail.items) || !row.detail.items.length){
      row.detail = { items:[promEmptyDpItem()] };
    }
  } else if(row.kategori === 'DPF' || row.kategori === 'DPL'){
    if(row.kuotaAktif === undefined) row.kuotaAktif = false;
    if(row.kuota === undefined) row.kuota = 0;
    if(row.isGuarantee === undefined) row.isGuarantee = false;
    if(row.janganUpdateHna === undefined) row.janganUpdateHna = false;
    if(row.subTotal === undefined) row.subTotal = 0;
    if(!Array.isArray(row.items) || !row.items.length || !('hna' in row.items[0])){
      row.items = [promEmptyDpfItem()];
    }
  } else if(row.kategori === 'CAT'){
    if(row.dayName === undefined) row.dayName = '';
    if(row.day === undefined) row.day = 1;
    if(row.jamBukaJam === undefined) row.jamBukaJam = 0;
    if(row.jamBukaMenit === undefined) row.jamBukaMenit = 0;
    if(row.jamTutupJam === undefined) row.jamTutupJam = 0;
    if(row.jamTutupMenit === undefined) row.jamTutupMenit = 0;
    if(row.minimalTransaksi === undefined) row.minimalTransaksi = 0;
    if(row.kuota === undefined) row.kuota = 0;
    if(!Array.isArray(row.items) || !row.items.length || !('kategoriKode' in row.items[0])){
      row.items = [promEmptyCatItem()];
    }
  } else if(row.kategori === 'DSB'){
    /* 2026-08-28 — kategori BARU "Diskon Syarat Bayar" (modifikasi
       DBM): TANPA array items sama sekali (bukan diskon per-item),
       hanya daftar syarat bayar terpilih + Diskon Global 1 & 2
       (nilai + unit '%'/'Rp'). Lihat komentar di
       DATA.promotionCategoryList & tplPromDiskonSyaratBayar(). */
    if(!Array.isArray(row.syaratBayarDiskon)) row.syaratBayarDiskon = [];
    if(row.diskonGlobal1 === undefined) row.diskonGlobal1 = 0;
    if(row.diskonGlobal1Unit === undefined) row.diskonGlobal1Unit = '%';
    if(row.diskonGlobal2 === undefined) row.diskonGlobal2 = 0;
    if(row.diskonGlobal2Unit === undefined) row.diskonGlobal2Unit = '%';
  }
}

function promCloneRow(src){
  const row = { ...src };
  if(src.detail){
    row.detail = { items: src.detail.items.map(it => ({ ...it, ketentuan: it.ketentuan.map(k => ({ ...k })) })) };
  }
  if(src.items){
    row.items = src.items.map(it => ({ ...it }));
  }
  /* Array syarat bayar promo DSB (2026-08-28) ikut di-deep-copy —
     checkbox-nya memutasi array langsung, jangan sampai Batalkan tetap
     mengubah baris master. */
  if(src.syaratBayarDiskon){
    row.syaratBayarDiskon = src.syaratBayarDiskon.slice();
  }
  return row;
}

function promValidationError(text){
  openPromInfo('Validasi', text);
}

/* =========================================================
   FORM UTAMA — dispatch ulang seluruh badan form tiap kali
   Promotion Category berganti.
========================================================= */
function openPromForm(mode, idx){
  const row = mode === 'add' ? promEmptyRow('A') : promCloneRow(DATA.promotion[idx]);
  if(mode === 'add'){
    row.kode = promGenerateNumber(row.outlet);
    promEnsureCategoryDefaults(row);
  }

  function renderBody(){
    content.innerHTML = tplPromotionForm(mode, row);
    wireHeader();
    wireCommonBlockFields();
    wireVariant();
    wireFooter();
  }

  function wireHeader(){
    if(mode === 'add'){
      const btn = document.getElementById('promRefreshKode');
      if(btn) btn.onclick = () => {
        row.kode = promGenerateNumber(row.outlet);
        document.getElementById('fPromKode').value = row.kode;
      };
    }
    document.getElementById('fPromKategori').onchange = (e) => {
      promSyncCommonFromDOM(row);
      row.kategori = e.target.value;
      promEnsureCategoryDefaults(row);
      renderBody();
    };
  }

  function wireCommonBlockFields(){
    document.getElementById('promTipeCustomerSearch').onclick = () => openPromTipeCustomerPicker(row);
    document.getElementById('promCustomerSearch').onclick = () => openPromCustomerPicker(row);
    document.getElementById('promGrupCustomerSearch').onclick = () => openPromGrupCustomerPicker(row);
    document.getElementById('promOutletSearch').onclick = () => openPromOutletPicker(row);
    document.getElementById('promPpnInfo').onclick = () => openPromInfo('PPN', `PPN yang berlaku untuk promotion ini saat ini: ${document.getElementById('fPromPpn').value}%.`);
  }

  function wireVariant(){
    if(row.kategori === 'A') wireDiscountProgram(row);
    else if(row.kategori === 'DPF' || row.kategori === 'DPL') wireDiscountProposal(row);
    else if(row.kategori === 'CAT') wireDiscountCategory(row);
    else if(row.kategori === 'DSB') wireDiskonSyaratBayar(row);
  }

  function wireFooter(){
    document.getElementById('promCancel').onclick = (e) => { e.preventDefault(); renderPromList(); };
    document.getElementById('promSave').onclick = () => {
      promSyncCommonFromDOM(row);
      if(!row.nama){ promValidationError('Promotion Name wajib diisi'); return; }
      if(row.kategori === 'DSB' && !(row.syaratBayarDiskon||[]).length){
        promValidationError('Pilih minimal 1 Syarat Bayar untuk promo Diskon Syarat Bayar'); return;
      }
      if(mode === 'add'){
        row.kode = row.kode || promGenerateNumber(row.outlet);
        DATA.promotion.push(row);
      } else {
        DATA.promotion[idx] = row;
      }
      renderPromList();
    };
  }

  renderBody();
}

/* Baca field-field yang SELALU ada di semua varian (header + common
   block) langsung dari DOM — dipanggil sebelum ganti kategori (supaya
   data yang sudah diisi user tidak hilang saat badan form diganti total)
   maupun sebelum Simpan. */
function promSyncCommonFromDOM(row){
  const kodeEl = document.getElementById('fPromKode'); if(kodeEl) row.kode = kodeEl.value.trim();
  const namaEl = document.getElementById('fPromNama'); if(namaEl) row.nama = namaEl.value.trim();
  const tglAwalEl = document.getElementById('fPromTglAwal'); if(tglAwalEl) row.tglAwal = tglAwalEl.value;
  const tglAkhirEl = document.getElementById('fPromTglAkhir'); if(tglAkhirEl) row.tglAkhir = tglAkhirEl.value;
  const statusEl = document.getElementById('fPromStatus'); if(statusEl) row.status = statusEl.value;
  const tcEl = document.getElementById('fPromTipeCustomer'); if(tcEl) row.tipeCustomer = tcEl.dataset.kode || row.tipeCustomer;
  const custEl = document.getElementById('fPromCustomer'); if(custEl) row.customer = custEl.value;
  const gcEl = document.getElementById('fPromGrupCustomer'); if(gcEl) row.grupCustomer = gcEl.dataset.kode || row.grupCustomer;
  const descEl = document.getElementById('fPromDescription'); if(descEl) row.description = descEl.value.trim();
  const outletEl = document.getElementById('fPromOutlet'); if(outletEl) row.outlet = outletEl.value;
  const ppnEl = document.getElementById('fPromPpn'); if(ppnEl) row.ppn = +ppnEl.value || 0;
  const klEl = document.getElementById('fPromKodeLock'); if(klEl) row.kodeLock = klEl.value;
}

/* ---------- Pickers field umum (dipakai di semua varian) ---------- */
function openPromTipeCustomerPicker(row){
  closeModal();
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.innerHTML = tplPromSimplePicker('Pilih Tipe Customer', DATA.tipeCustomerList);
  document.body.appendChild(overlay);
  document.getElementById('pickerClose').onclick = closeModal;
  document.getElementById('pickerCancel').onclick = closeModal;
  overlay.onclick = (e) => { if(e.target === overlay) closeModal(); };
  overlay.querySelectorAll('[data-pick]').forEach(b => b.onclick = () => {
    row.tipeCustomer = b.dataset.pick;
    const el = document.getElementById('fPromTipeCustomer');
    el.value = b.dataset.pickNama;
    el.dataset.kode = b.dataset.pick;
    closeModal();
  });
}

function openPromCustomerPicker(row){
  closeModal();
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.innerHTML = tplPromCustomerPicker(DATA.customers);
  document.body.appendChild(overlay);
  document.getElementById('pickerClose').onclick = closeModal;
  document.getElementById('pickerCancel').onclick = closeModal;
  overlay.onclick = (e) => { if(e.target === overlay) closeModal(); };
  overlay.querySelectorAll('[data-pick-customer]').forEach(b => b.onclick = () => {
    row.customer = b.dataset.pickCustomer;
    document.getElementById('fPromCustomer').value = row.customer;
    closeModal();
  });
}

function openPromGrupCustomerPicker(row){
  closeModal();
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.innerHTML = tplPromSimplePicker('Pilih Grup Customer', DATA.customerGroup);
  document.body.appendChild(overlay);
  document.getElementById('pickerClose').onclick = closeModal;
  document.getElementById('pickerCancel').onclick = closeModal;
  overlay.onclick = (e) => { if(e.target === overlay) closeModal(); };
  overlay.querySelectorAll('[data-pick]').forEach(b => b.onclick = () => {
    row.grupCustomer = b.dataset.pick;
    const el = document.getElementById('fPromGrupCustomer');
    el.value = b.dataset.pickNama;
    el.dataset.kode = b.dataset.pick;
    closeModal();
  });
}

function openPromOutletPicker(row){
  closeModal();
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.innerHTML = tplPromOutletPicker(DATA.outletList);
  document.body.appendChild(overlay);
  document.getElementById('pickerClose').onclick = closeModal;
  document.getElementById('pickerCancel').onclick = closeModal;
  overlay.onclick = (e) => { if(e.target === overlay) closeModal(); };
  overlay.querySelectorAll('[data-pick-outlet]').forEach(b => b.onclick = () => {
    row.outlet = b.dataset.pickOutlet;
    document.getElementById('fPromOutlet').value = row.outlet;
    closeModal();
  });
}

function openPromPrincipalPicker(row){
  closeModal();
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.innerHTML = tplPromSupplierPicker(DATA.suppliers);
  document.body.appendChild(overlay);
  document.getElementById('pickerClose').onclick = closeModal;
  document.getElementById('pickerCancel').onclick = closeModal;
  overlay.onclick = (e) => { if(e.target === overlay) closeModal(); };
  overlay.querySelectorAll('[data-pick-supplier]').forEach(b => b.onclick = () => {
    const s = DATA.suppliers.find(x => x.kode === b.dataset.pickSupplier);
    row.principalKode = s.kode;
    row.principalNama = s.nama;
    document.getElementById('fPromPrincipal').value = s.nama;
    closeModal();
  });
}

/* =========================================================
   VARIAN 1 — Discount Program (kategori 'A')
========================================================= */
function wireDiscountProgram(row){
  document.getElementById('promPrincipalSearch').onclick = () => openPromPrincipalPicker(row);
  wireDpItems(row);
  document.getElementById('promDpAddItem').onclick = (e) => {
    e.preventDefault();
    row.detail.items.push(promEmptyDpItem());
    rerenderDpItems(row);
  };
}

function rerenderDpItems(row){
  document.getElementById('promDpItemsWrap').innerHTML = tplPromDpItemsWrap(row.detail.items);
  wireDpItems(row);
}

function wireDpItems(row){
  row.detail.items.forEach((item, idx) => {
    const jenisEl = document.querySelector(`[data-prom-jenis="${idx}"]`);
    if(jenisEl) jenisEl.onchange = () => {
      item.jenis = jenisEl.value;
      item.kode = ''; item.nama = '';
      document.querySelector(`[data-prom-item-kode="${idx}"]`).value = '';
      document.querySelector(`[data-prom-item-nama="${idx}"]`).value = '';
    };
    const searchBtn = document.querySelector(`[data-prom-item-search="${idx}"]`);
    if(searchBtn) searchBtn.onclick = () => openPromGroupOrItemPicker(item, idx, row);
    const delBtn = document.querySelector(`[data-prom-item-del="${idx}"]`);
    if(delBtn) delBtn.onclick = () => {
      if(row.detail.items.length <= 1){ promValidationError('Minimal harus ada 1 item'); return; }
      row.detail.items.splice(idx, 1);
      rerenderDpItems(row);
    };
    const addKetentuanLink = document.querySelector(`[data-prom-ketentuan-add="${idx}"]`);
    if(addKetentuanLink) addKetentuanLink.onclick = (e) => {
      e.preventDefault();
      item.ketentuan.push(promEmptyKetentuan());
      rerenderKetentuan(idx, item);
    };
    wireKetentuanRows(idx, item);
  });
}

function rerenderKetentuan(idx, item){
  const body = document.querySelector(`[data-prom-ketentuan-body="${idx}"]`);
  if(!body) return;
  body.innerHTML = tplPromKetentuanRows(idx, item.ketentuan);
  wireKetentuanRows(idx, item);
}

function wireKetentuanRows(idx, item){
  item.ketentuan.forEach((k, ki) => {
    const key = `${idx}:${ki}`;
    const qa = document.querySelector(`[data-prom-k-qtyawal="${key}"]`); if(qa) qa.onchange = () => k.qtyAwal = +qa.value || 0;
    const qe = document.querySelector(`[data-prom-k-qtyakhir="${key}"]`); if(qe) qe.onchange = () => k.qtyAkhir = +qe.value || 0;
    const dp = document.querySelector(`[data-prom-k-discp="${key}"]`); if(dp) dp.onchange = () => k.diskonPrincipal = +dp.value || 0;
    const dd = document.querySelector(`[data-prom-k-discd="${key}"]`); if(dd) dd.onchange = () => k.diskonDistributor = +dd.value || 0;
    const ra = document.querySelector(`[data-prom-k-ratio="${key}"]`); if(ra) ra.onchange = () => k.ratioBarangBonus = +ra.value || 0;
    const bonusBtn = document.querySelector(`[data-prom-k-bonus-search="${key}"]`); if(bonusBtn) bonusBtn.onclick = () => openPromBonusItemPicker(k, idx, item);
    const delBtn = document.querySelector(`[data-prom-k-del="${key}"]`); if(delBtn) delBtn.onclick = () => {
      if(item.ketentuan.length <= 1){ promValidationError('Minimal harus ada 1 ketentuan'); return; }
      item.ketentuan.splice(ki, 1);
      rerenderKetentuan(idx, item);
    };
  });
}

function openPromGroupOrItemPicker(item, idx, row){
  closeModal();
  const list = item.jenis === 'Barang' ? DATA.items : DATA.kategoriBarang;
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.innerHTML = tplPromGroupOrItemPicker(item.jenis, list);
  document.body.appendChild(overlay);
  document.getElementById('modalClose').onclick = closeModal;
  document.getElementById('modalCancel').onclick = closeModal;
  overlay.onclick = (e) => { if(e.target === overlay) closeModal(); };

  const wireRows = () => {
    overlay.querySelectorAll('[data-pick-goi]').forEach(b => b.onclick = () => {
      item.kode = b.dataset.pickGoi;
      item.nama = b.dataset.pickGoiNama;
      document.querySelector(`[data-prom-item-kode="${idx}"]`).value = item.kode;
      document.querySelector(`[data-prom-item-nama="${idx}"]`).value = item.nama;
      closeModal();
    });
  };
  wireRows();

  if(item.jenis === 'Barang'){
    document.getElementById('promItemPickerSearch').oninput = (e) => {
      const q = e.target.value.trim().toLowerCase();
      const filtered = DATA.items.filter(a => a.kode.toLowerCase().includes(q) || a.nama.toLowerCase().includes(q));
      document.getElementById('promGroupOrItemBody').innerHTML = tplPromGroupOrItemRows('Barang', filtered);
      wireRows();
    };
  }
}

function openPromBonusItemPicker(k, idx, item){
  closeModal();
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.innerHTML = tplPromGroupOrItemPicker('Barang', DATA.items);
  document.body.appendChild(overlay);
  document.getElementById('modalClose').onclick = closeModal;
  document.getElementById('modalCancel').onclick = closeModal;
  overlay.onclick = (e) => { if(e.target === overlay) closeModal(); };

  const wireRows = () => {
    overlay.querySelectorAll('[data-pick-goi]').forEach(b => b.onclick = () => {
      k.barangBonusKode = b.dataset.pickGoi;
      k.barangBonusNama = b.dataset.pickGoiNama;
      closeModal();
      rerenderKetentuan(idx, item);
    });
  };
  wireRows();

  document.getElementById('promItemPickerSearch').oninput = (e) => {
    const q = e.target.value.trim().toLowerCase();
    const filtered = DATA.items.filter(a => a.kode.toLowerCase().includes(q) || a.nama.toLowerCase().includes(q));
    document.getElementById('promGroupOrItemBody').innerHTML = tplPromGroupOrItemRows('Barang', filtered);
    wireRows();
  };
}

/* =========================================================
   VARIAN 2 & 3 — Discount Proposal Form / List (kategori
   'DPF'/'DPL') — reuse fungsi & template yang sama persis
   (parameter showKuota di template-lah satu-satunya beda).
========================================================= */
function wireDiscountProposal(row){
  document.getElementById('promPrincipalSearch').onclick = () => openPromPrincipalPicker(row);

  const kuotaAktifEl = document.getElementById('fPromKuotaAktif');
  if(kuotaAktifEl) kuotaAktifEl.onchange = () => row.kuotaAktif = kuotaAktifEl.checked;
  const kuotaEl = document.getElementById('fPromKuota');
  if(kuotaEl) kuotaEl.onchange = () => row.kuota = +kuotaEl.value || 0;
  const guaranteeEl = document.getElementById('fPromIsGuarantee');
  if(guaranteeEl) guaranteeEl.onchange = () => row.isGuarantee = guaranteeEl.checked;

  document.getElementById('fPromJanganUpdateHna').onchange = (e) => row.janganUpdateHna = e.target.checked;

  wireDpfItems(row);
  document.getElementById('promDpfAddItem').onclick = (e) => {
    e.preventDefault();
    row.items.push(promEmptyDpfItem());
    rerenderDpfItems(row);
  };

  promRecalcSubTotal(row);
  promRefreshSubTotalDOM(row);
}

function rerenderDpfItems(row){
  document.getElementById('promDpfItemsWrap').innerHTML = tplPromDpfItemsTable(row.items);
  wireDpfItems(row);
  promRecalcSubTotal(row);
  promRefreshSubTotalDOM(row);
}

function wireDpfItems(row){
  row.items.forEach((item, idx) => {
    const searchBtn = document.querySelector(`[data-prom-dpf-search="${idx}"]`);
    if(searchBtn) searchBtn.onclick = () => openPromDpfItemPicker(item, idx, row);
    const delBtn = document.querySelector(`[data-prom-dpf-del="${idx}"]`);
    if(delBtn) delBtn.onclick = () => {
      if(row.items.length <= 1){ promValidationError('Minimal harus ada 1 baris barang'); return; }
      row.items.splice(idx, 1);
      rerenderDpfItems(row);
    };
    const namaEl = document.querySelector(`[data-prom-dpf-nama="${idx}"]`);
    if(namaEl) namaEl.onchange = () => item.nama = namaEl.value;
    const satuanEl = document.querySelector(`[data-prom-dpf-satuan="${idx}"]`);
    if(satuanEl) satuanEl.onchange = () => item.satuan = satuanEl.value;

    const qtyEl = document.querySelector(`[data-prom-dpf-qty="${idx}"]`);
    const hnaEl = document.querySelector(`[data-prom-dpf-hna="${idx}"]`);
    const hna1El = document.querySelector(`[data-prom-dpf-hna1="${idx}"]`);
    const hna1IncEl = document.querySelector(`[data-prom-dpf-hna1inc="${idx}"]`);
    const discpEl = document.querySelector(`[data-prom-dpf-discp="${idx}"]`);
    const discpUnitEl = document.querySelector(`[data-prom-dpf-discpunit="${idx}"]`);
    const discdEl = document.querySelector(`[data-prom-dpf-discd="${idx}"]`);
    const discdUnitEl = document.querySelector(`[data-prom-dpf-discdunit="${idx}"]`);
    const suppEl = document.querySelector(`[data-prom-dpf-supp="${idx}"]`);
    const suppUnitEl = document.querySelector(`[data-prom-dpf-suppunit="${idx}"]`);

    const recalc = () => {
      item.qty = +qtyEl.value || 0;
      item.hna = +hnaEl.value || 0;
      item.hna1 = +hna1El.value || 0;
      item.hna1Inklusif = hna1IncEl.checked;
      item.discPrincipal = +discpEl.value || 0;
      item.discPrincipalUnit = discpUnitEl.value;
      item.discDistributor = +discdEl.value || 0;
      item.discDistributorUnit = discdUnitEl.value;
      item.supportDiscount = +suppEl.value || 0;
      item.supportDiscountUnit = suppUnitEl.value;
      promRecalcSubTotal(row);
      promRefreshSubTotalDOM(row);
    };
    [qtyEl, hnaEl, hna1El, discpEl, discdEl, suppEl].forEach(el => { if(el) el.oninput = recalc; });
    [hna1IncEl, discpUnitEl, discdUnitEl, suppUnitEl].forEach(el => { if(el) el.onchange = recalc; });
  });
}

/* Sub Total reaktif: qty * HNA1 dikurangi Discount Principal/Distributor/
   Support Discount — kalau unit '%' dihitung persentase dari HNA1, kalau
   'Rp' diperlakukan sebagai potongan flat per unit (dikali qty). Simplifikasi
   wajar untuk mockup (formula per screenshot tidak dijelaskan detail; disini
   diseragamkan 1 formula konsisten untuk ketiga jenis diskon). */
function promRecalcSubTotal(row){
  row.subTotal = Math.round(row.items.reduce((sum, it) => {
    const qty = +it.qty || 0;
    const hna1 = +it.hna1 || 0;
    let net = hna1;
    net -= (it.discPrincipalUnit === '%') ? (hna1 * (+it.discPrincipal || 0) / 100) : (+it.discPrincipal || 0);
    net -= (it.discDistributorUnit === '%') ? (hna1 * (+it.discDistributor || 0) / 100) : (+it.discDistributor || 0);
    net -= (it.supportDiscountUnit === '%') ? (hna1 * (+it.supportDiscount || 0) / 100) : (+it.supportDiscount || 0);
    return sum + qty * net;
  }, 0));
}

function promRefreshSubTotalDOM(row){
  const el = document.getElementById('fPromSubTotal');
  if(el) el.value = num(row.subTotal || 0);
}

function openPromDpfItemPicker(item, idx, row){
  closeModal();
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.innerHTML = tplPromGroupOrItemPicker('Barang', DATA.items);
  document.body.appendChild(overlay);
  document.getElementById('modalClose').onclick = closeModal;
  document.getElementById('modalCancel').onclick = closeModal;
  overlay.onclick = (e) => { if(e.target === overlay) closeModal(); };

  const wireRows = () => {
    overlay.querySelectorAll('[data-pick-goi]').forEach(b => b.onclick = () => {
      const it = DATA.items.find(x => x.kode === b.dataset.pickGoi);
      item.kode = it.kode; item.nama = it.nama; item.satuan = it.satuan; item.hna = it.harga; item.hna1 = it.harga;
      closeModal();
      rerenderDpfItems(row);
    });
  };
  wireRows();

  document.getElementById('promItemPickerSearch').oninput = (e) => {
    const q = e.target.value.trim().toLowerCase();
    const filtered = DATA.items.filter(a => a.kode.toLowerCase().includes(q) || a.nama.toLowerCase().includes(q));
    document.getElementById('promGroupOrItemBody').innerHTML = tplPromGroupOrItemRows('Barang', filtered);
    wireRows();
  };
}

/* =========================================================
   VARIAN 4 — Discount Category (kategori 'CAT')
========================================================= */
function wireDiscountCategory(row){
  document.getElementById('promDayNameSearch').onclick = () => openPromDayNamePicker(row);
  document.getElementById('fPromDay').onchange = (e) => row.day = +e.target.value;
  document.getElementById('fPromJamBukaJam').onchange = (e) => row.jamBukaJam = +e.target.value;
  document.getElementById('fPromJamBukaMenit').onchange = (e) => row.jamBukaMenit = +e.target.value;
  document.getElementById('fPromJamTutupJam').onchange = (e) => row.jamTutupJam = +e.target.value;
  document.getElementById('fPromJamTutupMenit').onchange = (e) => row.jamTutupMenit = +e.target.value;
  document.getElementById('fPromMinimalTransaksi').onchange = (e) => row.minimalTransaksi = +e.target.value || 0;
  document.getElementById('fPromKuota').onchange = (e) => row.kuota = +e.target.value || 0;

  wireCatItems(row);
  document.getElementById('promCatAddItem').onclick = (e) => {
    e.preventDefault();
    row.items.push(promEmptyCatItem());
    rerenderCatItems(row);
  };
}

function rerenderCatItems(row){
  document.getElementById('promCatItemsWrap').innerHTML = tplPromCatItemsTable(row.items);
  wireCatItems(row);
}

function wireCatItems(row){
  row.items.forEach((item, idx) => {
    const kategoriEl = document.querySelector(`[data-prom-cat-kategori="${idx}"]`);
    if(kategoriEl) kategoriEl.onchange = () => {
      const kb = DATA.kategoriBarang.find(k => k.kode === kategoriEl.value);
      item.kategoriKode = kb.kode; item.kategoriNama = kb.nama;
    };
    const qtyEl = document.querySelector(`[data-prom-cat-qty="${idx}"]`);
    if(qtyEl) qtyEl.onchange = () => item.qty = +qtyEl.value || 0;
    const discpEl = document.querySelector(`[data-prom-cat-discp="${idx}"]`);
    if(discpEl) discpEl.onchange = () => item.discPrincipal = +discpEl.value || 0;
    const discpUnitEl = document.querySelector(`[data-prom-cat-discpunit="${idx}"]`);
    if(discpUnitEl) discpUnitEl.onchange = () => item.discPrincipalUnit = discpUnitEl.value;
    const discdEl = document.querySelector(`[data-prom-cat-discd="${idx}"]`);
    if(discdEl) discdEl.onchange = () => item.discDistributor = +discdEl.value || 0;
    const discdUnitEl = document.querySelector(`[data-prom-cat-discdunit="${idx}"]`);
    if(discdUnitEl) discdUnitEl.onchange = () => item.discDistributorUnit = discdUnitEl.value;
    const delBtn = document.querySelector(`[data-prom-cat-del="${idx}"]`);
    if(delBtn) delBtn.onclick = () => {
      if(row.items.length <= 1){ promValidationError('Minimal harus ada 1 baris kategori'); return; }
      row.items.splice(idx, 1);
      rerenderCatItems(row);
    };
  });
}

function openPromDayNamePicker(row){
  closeModal();
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.innerHTML = tplPromSimplePicker('Pilih Day Name', DATA.hariList.map(h => ({ kode:h, nama:h })));
  document.body.appendChild(overlay);
  document.getElementById('pickerClose').onclick = closeModal;
  document.getElementById('pickerCancel').onclick = closeModal;
  overlay.onclick = (e) => { if(e.target === overlay) closeModal(); };
  overlay.querySelectorAll('[data-pick]').forEach(b => b.onclick = () => {
    row.dayName = b.dataset.pick;
    document.getElementById('fPromDayName').value = row.dayName;
    closeModal();
  });
}

/* ---------- Hapus & Info ---------- */
function openPromDeleteConfirm(idx){
  closeModal();
  const row = DATA.promotion[idx];
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.innerHTML = tplPromDeleteConfirm(row);
  document.body.appendChild(overlay);
  document.getElementById('modalClose').onclick = closeModal;
  document.getElementById('modalCancel').onclick = closeModal;
  overlay.onclick = (e) => { if(e.target === overlay) closeModal(); };
  document.getElementById('modalDelete').onclick = () => {
    DATA.promotion.splice(idx, 1);
    closeModal();
    renderPromTable();
  };
}

function openPromInfo(title, text){
  closeModal();
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.innerHTML = tplPromInfoModal(title, text);
  document.body.appendChild(overlay);
  document.getElementById('modalClose').onclick = closeModal;
  document.getElementById('modalOk').onclick = closeModal;
  overlay.onclick = (e) => { if(e.target === overlay) closeModal(); };
}

/* =========================================================
   VARIAN 5 (BARU 2026-08-28) — Diskon Syarat Bayar (kategori 'DSB')
   Modifikasi DBM yang diminta user: promo memilih BEBERAPA syarat
   bayar (checkbox dari DATA.syaratBayarList) + Diskon Global 1 & 2
   yang nilainya bisa persentase ('%') atau nominal ('Rp'). TIDAK ada
   pemilihan item barang (bukan diskon per-item) — karena itu tidak
   ada tombol "Tambah Item" sama sekali di varian ini. Hasilnya
   dikonsumsi transaksi Sales Order lewat soApplyPromoSyaratBayar()
   (sales-order.js): SO yang Syarat Bayar-nya termasuk daftar promo
   Active otomatis mendapat Diskon Global 1 & 2 promo ini.
========================================================= */
function wireDiskonSyaratBayar(row){
  document.querySelectorAll('[data-prom-dsb-sb]').forEach(cb => cb.onchange = (e) => {
    const sb = cb.dataset.promDsbSb;
    if(!Array.isArray(row.syaratBayarDiskon)) row.syaratBayarDiskon = [];
    const i = row.syaratBayarDiskon.indexOf(sb);
    if(e.target.checked && i === -1) row.syaratBayarDiskon.push(sb);
    if(!e.target.checked && i !== -1) row.syaratBayarDiskon.splice(i, 1);
    const lbl = document.getElementById('promDsbTerpilih');
    if(lbl) lbl.textContent = row.syaratBayarDiskon.length
      ? row.syaratBayarDiskon.join(', ')
      : 'Belum ada syarat bayar dipilih';
  });
  const dg1 = document.getElementById('fPromDsbDg1');
  const dg1u = document.getElementById('fPromDsbDg1Unit');
  const dg2 = document.getElementById('fPromDsbDg2');
  const dg2u = document.getElementById('fPromDsbDg2Unit');
  if(dg1) dg1.onchange = (e) => { row.diskonGlobal1 = +e.target.value || 0; };
  if(dg1u) dg1u.onchange = (e) => { row.diskonGlobal1Unit = e.target.value; };
  if(dg2) dg2.onchange = (e) => { row.diskonGlobal2 = +e.target.value || 0; };
  if(dg2u) dg2u.onchange = (e) => { row.diskonGlobal2Unit = e.target.value; };
}
