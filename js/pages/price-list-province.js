/* =========================================================
   LOGIC (JS saja) — Price List By Province (Persediaan Barang >
   Master & Setting). Dimuat otomatis (lazy-load) oleh core.js
   saat menu ini pertama kali diklik — lihat PAGE_MODULES di
   js/core.js. Markup HTML-nya ada di file sebelah:
   price-list-province.template.js. NB: closeModal() dipakai
   bersama, didefinisikan di core.js.

   Model data 1 baris DATA.priceListProvince: {noTransaksi,
   tglEfektif, keterangan, province, items:[{kode, hargaBaru1}]} —
   `items` cuma menyimpan Harga Jual 1 (hargaBaru1) per kode barang
   karena kolom Harga Jual 2-4 SELALU nonaktif di mockup ini (lihat
   catatan panjang di header price-list-province.template.js &
   DATA.priceListProvince). "Harga Lama" (kolom Lama tier 1) TIDAK
   disimpan per transaksi — selalu dibaca live dari DATA.items[].
   harga saat form dibuka (`buildInvRows()`), meniru semantik "harga
   di master saat ini" persis seperti kolom Lama di layar aslinya.
========================================================= */

const PLZ_STATE = { category:'', search:'' };

function renderPriceListProvincePage(){
  renderPlzList();
}

function renderPlzList(){
  content.innerHTML = tplPlzListPage();
  document.getElementById('btnPlzAdd').onclick = () => openPlzForm('add');
  document.getElementById('btnPlzPeriod').onclick = () => plzOpenInfo('Filter Periode', 'Filter periode "Agustus 2026" ini contoh tampilan mockup (dekoratif) — daftar tetap menampilkan seluruh sample price list terlepas dari periode yang dipilih.');
  document.getElementById('btnPlzImpor').onclick = () => plzOpenInfo('Impor Price List', 'Fitur impor price list dari file Excel ini contoh tampilan mockup — proses impor sungguhan akan disesuaikan lebih lanjut sesuai kebutuhan.');
  document.getElementById('btnPlzEkspor').onclick = () => plzOpenInfo('Ekspor ke Excel', 'Fitur ekspor daftar price list ke Excel ini contoh tampilan mockup — proses ekspor sungguhan akan disesuaikan lebih lanjut sesuai kebutuhan.');
  renderPlzTable();
}

function renderPlzTable(){
  const tbody = document.getElementById('plzTbody');
  const total = document.getElementById('plzTotal');
  tbody.innerHTML = tplPlzRows(DATA.priceListProvince);
  total.textContent = `Total Record: ${DATA.priceListProvince.length}`;
  tbody.querySelectorAll('[data-view]').forEach(b => b.onclick = () => openPlzForm('view', +b.dataset.view));
  tbody.querySelectorAll('[data-edit]').forEach(b => b.onclick = () => openPlzForm('edit', +b.dataset.edit));
  tbody.querySelectorAll('[data-del]').forEach(b => b.onclick = () => openPlzDeleteConfirm(+b.dataset.del));
}

function plzGenerateNumber(){
  const seq = DATA.priceListProvince.length + 1;
  return `PLP/08/2026/${String(seq).padStart(4,'0')}`;
}

function plzEmptyRow(){
  return {
    noTransaksi: plzGenerateNumber(), autoNo:'ya',
    tglEfektif:'19/08/2026', keterangan:'', province:'',
    items: DATA.items.map(it => ({ kode: it.kode, hargaBaru1: 0 })),
  };
}

/* Cari Kode Kategori dari DATA.kategoriBarang lewat NAMA (DATA.items.
   kategori menyimpan nama kategori, bukan kode) — kalau tidak ketemu
   (kategori barang belum terdaftar di DATA.kategoriBarang), fallback
   ke nama kategorinya apa adanya supaya kolom tidak kosong. */
function plzKategoriKodeOf(namaKategori){
  const found = DATA.kategoriBarang.find(k => k.nama === namaKategori);
  return found ? found.kode : namaKategori;
}

/* Gabungkan DATA.items (master, selalu jadi sumber Satuan/Lama) dengan
   items tersimpan di baris price list ini (sumber Baru), lalu filter
   berdasarkan kategori & pencarian global. */
function plzBuildInvRows(row, category, search){
  const byKode = {};
  (row.items||[]).forEach(it => { byKode[it.kode] = it; });
  let rows = DATA.items.map(it => ({
    kode: it.kode, nama: it.nama, satuan: it.satuan,
    kategoriKode: plzKategoriKodeOf(it.kategori),
    kategoriNama: it.kategori,
    hargaLama1: it.harga,
    hargaBaru1: byKode[it.kode] ? byKode[it.kode].hargaBaru1 : 0,
  }));
  if(category) rows = rows.filter(r => r.kategoriKode === category);
  if(search){
    const q = search.toLowerCase();
    rows = rows.filter(r => r.kode.toLowerCase().includes(q) || r.nama.toLowerCase().includes(q));
  }
  return rows;
}

function plzCategoryOptions(){
  const usedNames = [...new Set(DATA.items.map(it => it.kategori))];
  return usedNames.map(n => ({ kode: plzKategoriKodeOf(n), nama: n })).sort((a,b)=>a.nama.localeCompare(b.nama));
}

function openPlzForm(mode, idx){
  const row = mode === 'add' ? plzEmptyRow() : DATA.priceListProvince[idx];
  PLZ_STATE.category = '';
  PLZ_STATE.search = '';
  renderPlzFormBody(mode, row, idx);
}

function renderPlzFormBody(mode, row, idx){
  const invRows = plzBuildInvRows(row, PLZ_STATE.category, PLZ_STATE.search);
  content.innerHTML = tplPlzForm(mode, row, invRows, plzCategoryOptions(), PLZ_STATE.category);
  wirePlzForm(mode, row, idx);
}

function wirePlzForm(mode, row, idx){
  const isView = mode === 'view';

  if(isView){
    document.getElementById('plzBack').onclick = () => renderPlzList();
    return;
  }

  const autoNoSel = document.getElementById('plzAutoNo');
  const noInput = document.getElementById('plzNoTransaksi');
  const refreshBtn = document.getElementById('plzRefreshNo');
  autoNoSel.onchange = () => {
    if(autoNoSel.value === 'tidak'){
      noInput.readOnly = false;
      refreshBtn.disabled = true;
    } else {
      noInput.readOnly = true;
      refreshBtn.disabled = false;
      noInput.value = plzGenerateNumber();
    }
  };
  refreshBtn.onclick = () => { noInput.value = plzGenerateNumber(); };

  document.getElementById('plzProvinceBtn').onclick = () => openPlzProvincePicker(row);

  document.getElementById('plzCategoryFilter').onchange = (e) => {
    plzSyncItemsFromDOM(row);
    PLZ_STATE.category = e.target.value;
    renderPlzFormBody(mode, row, idx);
  };
  document.getElementById('plzInvSearch').oninput = (e) => {
    PLZ_STATE.search = e.target.value;
    plzRefreshInvTable(row);
  };
  document.getElementById('plzInvPageSize').onchange = () => {}; // dekoratif — dataset terlalu kecil utk pagination sungguhan

  wirePlzInvRows(row);

  document.querySelectorAll('.plz-pct').forEach(inp => {
    inp.onchange = () => {
      const tier = +inp.dataset.tier;
      if(tier !== 1) return; // tier 2-4 selalu nonaktif di mockup ini
      plzApplyPercent(row, +inp.value || 0);
    };
  });

  document.getElementById('plzCancel').onclick = () => renderPlzList();
  document.getElementById('plzSave').onclick = () => plzSave(mode, row, idx);
}

function wirePlzInvRows(row){
  document.querySelectorAll('.plz-baru').forEach(inp => {
    inp.onchange = () => {
      const kode = inp.dataset.kode;
      const item = row.items.find(it => it.kode === kode);
      if(item) item.hargaBaru1 = +inp.value || 0;
    };
  });
}

function plzRefreshInvTable(row){
  const rows = plzBuildInvRows(row, PLZ_STATE.category, PLZ_STATE.search);
  document.getElementById('plzInvTbody').innerHTML = tplPlzInventoryRows(rows);
  document.getElementById('plzInvTotal').textContent = `Total: ${rows.length}`;
  wirePlzInvRows(row);
}

/* Header % di atas kolom Harga Jual 1 — begitu diisi, hitung ulang
   Baru = Lama x (1 + %/100) dibulatkan ke rupiah penuh, untuk SEMUA
   baris item milik price list ini (bukan cuma yang sedang tampil di
   filter), lalu refresh tabel supaya nilainya langsung kelihatan. */
function plzApplyPercent(row, pct){
  row.items.forEach(it => {
    const master = DATA.items.find(m => m.kode === it.kode);
    const lama = master ? master.harga : 0;
    it.hargaBaru1 = Math.round(lama * (1 + pct/100));
  });
  plzRefreshInvTable(row);
}

/* Baca ulang field header dari DOM sebelum tabel di-render ulang
   (dipicu ganti kategori filter) — supaya input yang sudah diketik
   user (No. Transaksi manual, Keterangan, dst.) tidak hilang, pola
   sama seperti domSyncHeaderFromDOM() di Dominasi. */
function plzSyncItemsFromDOM(row){
  document.querySelectorAll('.plz-baru').forEach(inp => {
    const kode = inp.dataset.kode;
    const item = row.items.find(it => it.kode === kode);
    if(item && inp.value !== '') item.hargaBaru1 = +inp.value || 0;
  });
}

function openPlzProvincePicker(row){
  closeModal();
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.innerHTML = tplPlzProvincePicker(DATA.provinsiList);
  document.body.appendChild(overlay);
  document.getElementById('pickerClose').onclick = closeModal;
  document.getElementById('pickerCancel').onclick = closeModal;
  overlay.onclick = (e) => { if(e.target === overlay) closeModal(); };
  overlay.querySelectorAll('[data-pick]').forEach(btn => {
    btn.onclick = () => {
      row.province = btn.dataset.pick;
      document.getElementById('plzProvince').value = row.province;
      closeModal();
    };
  });
}

function plzValidationError(text){
  closeModal();
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.innerHTML = tplPlzInfoModal('Validasi', text);
  document.body.appendChild(overlay);
  document.getElementById('modalClose').onclick = closeModal;
  document.getElementById('modalOk').onclick = closeModal;
}

function plzSave(mode, row, idx){
  plzSyncItemsFromDOM(row);
  row.noTransaksi = document.getElementById('plzNoTransaksi').value.trim();
  row.tglEfektif = document.getElementById('plzTglEfektif').value.trim();
  row.keterangan = document.getElementById('plzKeterangan').value.trim();
  row.autoNo = document.getElementById('plzAutoNo').value;

  if(!row.noTransaksi) return plzValidationError('No. Transaksi wajib diisi.');
  if(!row.tglEfektif) return plzValidationError('Tgl. Efektif wajib diisi.');
  if(!row.province) return plzValidationError('Provincies wajib dipilih.');

  if(mode === 'add') DATA.priceListProvince.unshift(row);
  else DATA.priceListProvince[idx] = row;
  renderPlzList();
}

function openPlzDeleteConfirm(idx){
  closeModal();
  const row = DATA.priceListProvince[idx];
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.innerHTML = tplPlzDeleteConfirm(row);
  document.body.appendChild(overlay);
  document.getElementById('modalClose').onclick = closeModal;
  document.getElementById('modalCancel').onclick = closeModal;
  document.getElementById('modalConfirmDel').onclick = () => {
    DATA.priceListProvince.splice(idx, 1);
    closeModal();
    renderPlzTable();
  };
}

function plzOpenInfo(title, text){
  closeModal();
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.innerHTML = tplPlzInfoModal(title, text);
  document.body.appendChild(overlay);
  document.getElementById('modalClose').onclick = closeModal;
  document.getElementById('modalOk').onclick = closeModal;
}
