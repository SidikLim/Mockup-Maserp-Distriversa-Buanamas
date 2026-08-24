/* =========================================================
   LOGIC (JS saja) — Stock Request (Persediaan Barang > Daftar
   Transaksi). Dimuat otomatis (lazy-load) oleh core.js saat menu
   ini pertama kali diklik — lihat PAGE_MODULES di js/core.js.
   Markup HTML-nya ada di file sebelah: stock-request.template.js
   (tplStockRequestListPage/tplSrRows/tplStockRequestForm/dst,
   plus konstanta SR_CABANG_LIST/SR_GUDANG_LIST/dst yang dipakai
   bersama di sini).
   NB: closeModal() dipakai bersama, didefinisikan di core.js.

   Pola CRUD: list + form FULL PAGE (sama seperti Jurnal Pembelian
   & Master Supplier), dengan tambahan: tabel rincian barang yang
   dikelompokkan per kategori (Group), tiap grup bisa dibuka/tutup
   (collapsible), dan tiap baris barang punya checkbox "Pilih" yang
   meng-enable/disable input Qty di baris yang sama. Tombol "Lihat"
   membuka form yang sama dalam mode read-only (semua field
   disabled, tanpa tombol Simpan).
========================================================= */
function renderStockRequestPage(){
  renderSrList();
}

function renderSrList(){
  content.innerHTML = tplStockRequestListPage();
  document.getElementById('btnSrAdd').onclick = () => openSrForm('add');
  document.getElementById('btnSrPeriod').onclick = () => openSrInfo('Filter Periode', 'Menampilkan Stock Request untuk periode Agustus 2026. Pemilihan periode lain akan tersedia pada versi lengkap.');
  renderSrTable();
}

function renderSrTable(){
  const tbody = document.getElementById('srTbody');
  const total = document.getElementById('srTotal');
  tbody.innerHTML = tplSrRows(DATA.stockRequest);
  total.textContent = `Total: ${DATA.stockRequest.length}`;
  tbody.querySelectorAll('[data-view]').forEach(b => b.onclick = () => openSrForm('view', +b.dataset.view));
  tbody.querySelectorAll('[data-edit]').forEach(b => b.onclick = () => openSrForm('edit', +b.dataset.edit));
  tbody.querySelectorAll('[data-print]').forEach(b => b.onclick = () => openSrInfo('Cetak Stock Request', `Preview cetak dokumen Stock Request <b>${DATA.stockRequest[+b.dataset.print].no}</b> (PDF) akan tersedia di sini.`));
  tbody.querySelectorAll('[data-del]').forEach(b => b.onclick = () => openSrDeleteConfirm(+b.dataset.del));
  tbody.querySelectorAll('[data-toggle]').forEach(cb => cb.onchange = () => {
    const idx = +cb.dataset.idx;
    DATA.stockRequest[idx][cb.dataset.toggle] = cb.checked;
    // Toggle "Transfer Barang?" ini adalah field yang dipakai Notifikasi
    // topbar (lihat NOTIF_SOURCES di core.js) untuk menghitung Stock
    // Request yang belum ditransfer — refresh badge-nya di sini supaya
    // langsung sinkron begitu ditoggle manual, tanpa harus pindah menu.
    if(typeof refreshNotifBadge === 'function') refreshNotifBadge();
  });
}

function srGenerateNumber(cabang){
  const kode = SR_CABANG_CODE[cabang] || 'XXX';
  const seq = DATA.stockRequest.filter(r => r.cabangRequest === cabang).length + 1;
  return `26/SR/${kode}/08/${String(seq).padStart(5,'0')}`;
}

function srBuildDefaultItems(){
  return DATA.items.map(it => ({ kode: it.kode, nama: it.nama, kategori: it.kategori, qtyReordering: 0, pilih: false, qty: 0, um: it.satuan }));
}

function openSrForm(mode, idx){
  let row;
  if(mode === 'add'){
    row = {
      no: null, noPO: '', tglRequest: '07/08/2026', userEntry: 'sidik', reorderingSheet: '', tipeTransaksi: 'Transfer Out',
      keterangan: '', status: 'OPEN', closedManually: false, transferOutDibuat: false, cabangRequest: SR_CABANG_LIST[0], supplier: '',
      gudangSumber: SR_GUDANG_LIST[0], gudangTarget: SR_GUDANG_LIST[0], edBulan: 0, usedInPO: false,
      items: srBuildDefaultItems(), tglInput: '', userInput: '', tglEdit: '', userEdit: '',
    };
    row.no = srGenerateNumber(row.cabangRequest);
  } else {
    const src = DATA.stockRequest[idx];
    row = { ...src, items: src.items.map(it => ({ ...it })) };
  }

  let groups = srGroupItemsByKategori(row.items);
  content.innerHTML = tplStockRequestForm(mode, row, groups);
  wireSrGroupCollapse();

  if(mode === 'view'){
    document.getElementById('srTutup').onclick = (e) => { e.preventDefault(); renderSrList(); };
    return;
  }

  wireSrItemInputs(groups);

  if(mode === 'add'){
    document.getElementById('fSrCabang').onchange = (e) => {
      row.cabangRequest = e.target.value;
      row.no = srGenerateNumber(row.cabangRequest);
      document.getElementById('fSrNo').value = row.no;
    };
    document.getElementById('srRefreshNo').onclick = () => {
      row.no = srGenerateNumber(document.getElementById('fSrCabang').value);
      document.getElementById('fSrNo').value = row.no;
    };
  }

  document.getElementById('srRosSearch').onclick = () => openSrRosPicker(row);
  document.getElementById('srEdSearch').onclick = () => openSrEdPicker(row);

  document.getElementById('srBatalkan').onclick = (e) => { e.preventDefault(); renderSrList(); };

  document.getElementById('srSimpan').onclick = () => {
    const selectedItems = [];
    groups.forEach(g => g.items.forEach(it => { if(it.pilih && it.qty > 0) selectedItems.push(it); }));
    if(!selectedItems.length){ srValidationError('Pilih minimal 1 barang dengan Qty lebih dari 0'); return; }

    row.reorderingSheet = document.getElementById('fSrRos').value;
    row.supplier = document.getElementById('fSrSupplier').value;
    row.tglRequest = document.getElementById('fSrTgl').value;
    row.gudangSumber = document.getElementById('fSrGudangSumber').value;
    row.gudangTarget = document.getElementById('fSrGudangTarget').value;
    row.edBulan = +document.getElementById('fSrEd').value || 0;
    row.keterangan = document.getElementById('fSrKeterangan').value;
    row.items = selectedItems;

    if(mode === 'add'){
      row.cabangRequest = document.getElementById('fSrCabang').value;
      row.no = srGenerateNumber(row.cabangRequest);
      row.tglInput = row.tglRequest + ' ' + new Date().toTimeString().slice(0,8);
      row.userInput = 'sidik';
      DATA.stockRequest.push(row);
    } else {
      row.tglEdit = row.tglRequest + ' ' + new Date().toTimeString().slice(0,8);
      row.userEdit = 'sidik';
      DATA.stockRequest[idx] = row;
    }
    // Baris baru/diedit ikut memengaruhi jumlah Notifikasi topbar
    // (lihat NOTIF_SOURCES di core.js) kalau transferOutDibuat-nya
    // masih false — refresh badge-nya di sini juga.
    if(typeof refreshNotifBadge === 'function') refreshNotifBadge();
    renderSrList();
  };
}

/* Wiring checkbox "Pilih" per baris + checkbox "Pilih Semua" per
   grup + input Qty (enable/disable ikut status checkbox). */
function wireSrItemInputs(groups){
  groups.forEach((g, gi) => {
    document.querySelectorAll(`[data-sr-pilih^="${gi}:"]`).forEach(cb => {
      cb.onchange = () => {
        const ii = +cb.dataset.srPilih.split(':')[1];
        g.items[ii].pilih = cb.checked;
        const qtyInput = document.querySelector(`[data-sr-qty="${gi}:${ii}"]`);
        qtyInput.disabled = !cb.checked;
        if(cb.checked && (+qtyInput.value) === 0 && g.items[ii].qtyReordering > 0){
          qtyInput.value = g.items[ii].qtyReordering;
          g.items[ii].qty = g.items[ii].qtyReordering;
        }
        syncSrGroupCheckAll(gi, g);
      };
    });
    document.querySelectorAll(`[data-sr-qty^="${gi}:"]`).forEach(inp => {
      inp.onchange = () => {
        const ii = +inp.dataset.srQty.split(':')[1];
        g.items[ii].qty = +inp.value || 0;
      };
    });
    const checkAll = document.querySelector(`[data-group-check-all="${gi}"]`);
    if(checkAll){
      checkAll.onchange = () => {
        g.items.forEach((it, ii) => {
          it.pilih = checkAll.checked;
          const cb = document.querySelector(`[data-sr-pilih="${gi}:${ii}"]`);
          const qtyInput = document.querySelector(`[data-sr-qty="${gi}:${ii}"]`);
          if(cb) cb.checked = checkAll.checked;
          if(qtyInput){
            qtyInput.disabled = !checkAll.checked;
            if(checkAll.checked && (+qtyInput.value) === 0 && it.qtyReordering > 0){
              qtyInput.value = it.qtyReordering;
              it.qty = it.qtyReordering;
            }
          }
        });
      };
    }
  });
}

function syncSrGroupCheckAll(gi, g){
  const checkAll = document.querySelector(`[data-group-check-all="${gi}"]`);
  if(checkAll) checkAll.checked = g.items.every(it => it.pilih);
}

function wireSrGroupCollapse(){
  document.querySelectorAll('[data-group-toggle]').forEach(bar => {
    bar.onclick = () => {
      const gi = bar.dataset.groupToggle;
      bar.classList.toggle('open');
      document.getElementById(`srGroupBody${gi}`).classList.toggle('open');
    };
  });
}

/* Pengganti alert() bawaan browser untuk validasi sederhana —
   pakai modal info custom yang sudah ada, konsisten dengan
   kebijakan "hindari alert/confirm/prompt bawaan browser". */
function srValidationError(text){
  openSrInfo('Validasi', text);
}

function openSrRosPicker(row){
  closeModal();
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.innerHTML = tplSrRosPicker(DATA.reorderingSheet);
  document.body.appendChild(overlay);
  document.getElementById('modalClose').onclick = closeModal;
  document.getElementById('modalCancel').onclick = closeModal;
  overlay.onclick = (e) => { if(e.target === overlay) closeModal(); };
  overlay.querySelectorAll('[data-pick-ros]').forEach(btn => btn.onclick = () => {
    row.reorderingSheet = btn.dataset.pickRos;
    document.getElementById('fSrRos').value = row.reorderingSheet;
    closeModal();
  });
}

function openSrEdPicker(row){
  closeModal();
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.innerHTML = tplSrEdPicker(SR_ED_OPTIONS);
  document.body.appendChild(overlay);
  document.getElementById('modalClose').onclick = closeModal;
  document.getElementById('modalCancel').onclick = closeModal;
  overlay.onclick = (e) => { if(e.target === overlay) closeModal(); };
  overlay.querySelectorAll('[data-pick-ed]').forEach(btn => btn.onclick = () => {
    row.edBulan = +btn.dataset.pickEd;
    document.getElementById('fSrEd').value = row.edBulan;
    closeModal();
  });
}

function openSrDeleteConfirm(idx){
  closeModal();
  const row = DATA.stockRequest[idx];
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.innerHTML = tplSrDeleteConfirm(row);
  document.body.appendChild(overlay);
  document.getElementById('modalClose').onclick = closeModal;
  document.getElementById('modalCancel').onclick = closeModal;
  overlay.onclick = (e) => { if(e.target === overlay) closeModal(); };
  document.getElementById('modalDelete').onclick = () => {
    DATA.stockRequest.splice(idx, 1);
    closeModal();
    renderSrTable();
    if(typeof refreshNotifBadge === 'function') refreshNotifBadge();
  };
}

function openSrInfo(title, text){
  closeModal();
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.innerHTML = tplSrInfoModal(title, text);
  document.body.appendChild(overlay);
  document.getElementById('modalClose').onclick = closeModal;
  document.getElementById('modalOk').onclick = closeModal;
  overlay.onclick = (e) => { if(e.target === overlay) closeModal(); };
}
