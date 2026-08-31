/* =========================================================
   LOGIC (JS saja) — Permintaan Pembelian / PR (Supplier &
   Pembelian > Daftar Transaksi). Dimuat otomatis (lazy-load)
   oleh core.js saat menu ini pertama kali diklik — lihat
   PAGE_MODULES di js/core.js. Markup HTML-nya ada di file
   sebelah: permintaan-pembelian.template.js (catatan desain
   lengkap di headernya).
   NB: closeModal() dipakai bersama, didefinisikan di core.js.

   Alur inti:
   - Chip periode FUNGSIONAL: filter Tgl. Permintaan per bulan
     (default Agustus 2026 -> 2 record, persis screenshot; pilih
     "Semua Periode" untuk melihat PR lama termasuk milik menu
     Tutup PR).
   - Form: nomor otomatis per cabang 26/PR-{kode}/08/{urut};
     rincian barang bebas — Kode Barang dari picker DATA.items
     (Nama Barang tetap EDITABLE utk spesifikasi panjang persis
     screenshot Forklift), Qty/UM/Harga Beli/Tgl Perlu manual,
     +Tambah Item Baru menambah baris kosong.
   - Duplicate: menyimpan SALINAN form sebagai PR BARU dengan
     nomor baru (PR yang sedang diubah tetap tersimpan seperti
     apa adanya di list).
   - Cetak / Cetak dan Simpan: preview cetakan PR kop DBM
     (tplPrqPrintModal) dengan kolom tanda tangan.
   - Hapus: modal konfirmasi custom (bukan alert browser).
   Data: DATA.permintaanPembelian — juga dipakai menu Tutup PR
   (flag r.tutupPr; PR yang sudah ditutup tetap tampil di list
   ini). Status kolom dari flag r.dipakaiPO. */

var prqState = { bulan:'08|2026', search:'' };

function renderPermintaanPembelianPage(){
  prqState = { bulan:'08|2026', search:'' };
  renderPrqList();
}

function renderPrqList(){
  content.innerHTML = tplPermintaanPembelianListPage(prqState.bulan);
  document.getElementById('btnPrqAdd').onclick = () => openPrqForm('add', null);
  document.getElementById('prqFilterBulan').onchange = (e) => { prqState.bulan = e.target.value; renderPrqTable(); };
  document.getElementById('prqSearch').oninput = (e) => { prqState.search = e.target.value; renderPrqTable(); };
  renderPrqTable();
}

function prqFilteredRows(){
  const q = prqState.search.trim().toLowerCase();
  const parts = prqState.bulan.split('|');
  const mm = parts[0], yy = parts[1];
  return (DATA.permintaanPembelian || []).filter(r => {
    if(mm && !( (r.tgl||'').endsWith('/' + mm + '/' + yy) || (r.tgl||'').includes('/' + mm + '/' + yy) )) return false;
    if(q && !(
      r.no.toLowerCase().includes(q) ||
      (r.keterangan||'').toLowerCase().includes(q) ||
      (r.approvedBy||'').toLowerCase().includes(q) ||
      prqStatusText(r).toLowerCase().includes(q))) return false;
    return true;
  });
}

function renderPrqTable(){
  const rows = prqFilteredRows();
  const tbody = document.getElementById('prqTbody');
  tbody.innerHTML = tplPrqRows(rows);
  document.getElementById('prqTotal').textContent = `Total Record: ${rows.length}`;
  const idxOf = (r) => DATA.permintaanPembelian.indexOf(r);
  tbody.querySelectorAll('[data-view-link]').forEach(b => b.onclick = () => openPrqForm('view', idxOf(rows[+b.dataset.viewLink])));
  tbody.querySelectorAll('[data-prq-view]').forEach(b => b.onclick = () => openPrqForm('view', idxOf(rows[+b.dataset.prqView])));
  tbody.querySelectorAll('[data-prq-print]').forEach(b => b.onclick = () => openPrqPrint(rows[+b.dataset.prqPrint]));
  tbody.querySelectorAll('[data-prq-edit]').forEach(b => b.onclick = () => openPrqForm('edit', idxOf(rows[+b.dataset.prqEdit])));
  tbody.querySelectorAll('[data-prq-del]').forEach(b => b.onclick = () => openPrqDelete(idxOf(rows[+b.dataset.prqDel])));
}

/* Nomor otomatis per cabang: 26/PR-HO/08/00001, 00002, ... */
function prqGenerateNo(cabang){
  const kode = PRQ_CABANG_CODE[cabang] || 'HO';
  const prefix = `26/PR-${kode}/08/`;
  let max = 0;
  (DATA.permintaanPembelian || []).forEach(r => {
    if(r.no && r.no.startsWith(prefix)){
      const n = parseInt(r.no.slice(prefix.length), 10);
      if(!isNaN(n) && n > max) max = n;
    }
  });
  return prefix + String(max + 1).padStart(5, '0');
}

/* =====================================================================
   FORM add / edit / view
===================================================================== */
function openPrqForm(mode, idx){
  const src = idx != null ? DATA.permintaanPembelian[idx] : null;
  const row = src ? JSON.parse(JSON.stringify(src)) : {
    no: prqGenerateNo('Head Office'), tgl: '31/08/2026', cabang: 'Head Office',
    approvedBy: '', keterangan: '', gudang: 'Non Stock Head Office',
    dipakaiPO: false, tutupPr: false,
    items: [{ kode:'', nama:'', qty:1, um:'UNIT', hargaBeli:0, tglPerlu:'01/09/2026' }],
    userInput: 'sidik',
  };
  const isView = mode === 'view';
  content.innerHTML = tplPrqForm(mode, row);

  const back = () => renderPrqList();
  document.getElementById('prqBatalkan').onclick = (e) => { e.preventDefault(); back(); };
  document.getElementById('btnPrqTutorial').onclick = () => openPrqInfo('Tutorial', 'Video tutorial Permintaan Pembelian tersedia di portal MASERP (mockup).');

  wirePrqItems(row, isView);
  if(isView) return;

  const refreshNoBtn = document.getElementById('prqRefreshNo');
  if(refreshNoBtn) refreshNoBtn.onclick = () => { row.no = prqGenerateNo(row.cabang); document.getElementById('fPrqNo').value = row.no; };

  document.getElementById('fPrqCabang').onchange = (e) => {
    row.cabang = e.target.value;
    row.gudang = 'Non Stock ' + row.cabang;
    document.getElementById('fPrqGudang').innerHTML = tplPrqGudangOptions(row.cabang, row.gudang);
    if(mode === 'add'){ row.no = prqGenerateNo(row.cabang); document.getElementById('fPrqNo').value = row.no; }
  };

  document.getElementById('prqAddItem').onclick = (e) => {
    e.preventDefault();
    prqReadItems(row);
    row.items.push({ kode:'', nama:'', qty:1, um:'UNIT', hargaBeli:0, tglPerlu:'' });
    wirePrqItems(row, isView);
  };

  const doSave = () => prqSave(mode, idx, row, false);
  document.getElementById('prqSimpan').onclick = () => { if(doSave()) back(); };
  document.getElementById('prqCetakSimpan').onclick = () => { if(doSave()){ back(); openPrqPrint(row); } };
  document.getElementById('prqDuplicate').onclick = () => {
    if(prqSave(mode, idx, row, true)){
      back();
      openPrqInfo('Duplicate Berhasil', `Permintaan Pembelian disalin sebagai <b>${row.no}</b>.`);
    }
  };
}

/* Baca nilai baris rincian dari DOM ke state (dipanggil sebelum
   render ulang tabel & sebelum simpan supaya editan tidak hilang). */
function prqReadItems(row){
  row.items.forEach((it, idx) => {
    const g = (sel) => document.querySelector(`[data-prq-${sel}="${idx}"]`);
    const nama = g('nama'); if(nama) it.nama = nama.value;
    const qty = g('qty'); if(qty) it.qty = Number(qty.value) || 0;
    const um = g('um'); if(um) it.um = um.value;
    const harga = g('harga'); if(harga) it.hargaBeli = Number(harga.value) || 0;
    const tp = g('tglperlu'); if(tp) it.tglPerlu = tp.value;
  });
}

function wirePrqItems(row, isView){
  document.getElementById('prqItemsBody').innerHTML = tplPrqItemRows(row.items, isView);
  if(isView) return;
  document.querySelectorAll('[data-prq-item-del]').forEach(b => b.onclick = () => {
    prqReadItems(row);
    row.items.splice(+b.dataset.prqItemDel, 1);
    wirePrqItems(row, isView);
  });
  document.querySelectorAll('[data-prq-item-search]').forEach(b => b.onclick = () => {
    const i = +b.dataset.prqItemSearch;
    openPrqItemPicker((barang) => {
      prqReadItems(row);
      row.items[i].kode = barang.kode;
      row.items[i].nama = barang.nama;
      row.items[i].um = PRQ_UM_LIST.includes(barang.satuan) ? barang.satuan : row.items[i].um;
      row.items[i].hargaBeli = barang.harga || 0;
      wirePrqItems(row, isView);
    });
  });
}

/* ----- Simpan + validasi. asDuplicate: simpan sebagai PR BARU. ----- */
function prqSave(mode, idx, row, asDuplicate){
  row.tgl = document.getElementById('fPrqTgl').value.trim();
  row.keterangan = document.getElementById('fPrqKeterangan').value.trim();
  row.gudang = document.getElementById('fPrqGudang').value;
  prqReadItems(row);
  row.items = row.items.filter(it => (it.nama||'').trim() || (it.kode||'').trim());

  if(!row.tgl){ openPrqInfo('Validasi', 'Tgl. Permintaan wajib diisi.'); return false; }
  if(!row.keterangan){ openPrqInfo('Validasi', 'Keterangan wajib diisi.'); return false; }
  if(!row.items.length){ openPrqInfo('Validasi', 'Rincian Permintaan Pembelian minimal 1 barang.'); return false; }

  DATA.permintaanPembelian = DATA.permintaanPembelian || [];
  if(asDuplicate){
    row.no = prqGenerateNo(row.cabang);
    document.getElementById('fPrqNo').value = row.no;
    row.dipakaiPO = false; row.tutupPr = false; row.approvedBy = '';
    DATA.permintaanPembelian.unshift(JSON.parse(JSON.stringify(row)));
  } else if(mode === 'add'){
    DATA.permintaanPembelian.unshift(row);
  } else {
    DATA.permintaanPembelian[idx] = row;
  }
  return true;
}

/* =====================================================================
   Modals
===================================================================== */
function prqOverlay(html){
  closeModal();
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.innerHTML = html;
  document.body.appendChild(overlay);
  document.getElementById('modalClose').onclick = closeModal;
  const cancel = document.getElementById('modalCancel');
  if(cancel) cancel.onclick = closeModal;
  overlay.onclick = (e) => { if(e.target === overlay) closeModal(); };
  return overlay;
}

function openPrqPrint(row){
  prqOverlay(tplPrqPrintModal(row));
}

function openPrqDelete(idx){
  const row = DATA.permintaanPembelian[idx];
  prqOverlay(tplPrqDeleteConfirm(row));
  document.getElementById('modalDelete').onclick = () => {
    DATA.permintaanPembelian.splice(idx, 1);
    closeModal();
    renderPrqTable();
  };
}

function openPrqInfo(title, text){
  prqOverlay(tplPrqInfoModal(title, text));
  document.getElementById('modalOk').onclick = closeModal;
}

function openPrqItemPicker(onPick){
  const overlay = prqOverlay(tplPrqItemPicker(DATA.items));
  const wire = () => overlay.querySelectorAll('[data-prq-pick-item]').forEach(b => b.onclick = () => {
    const barang = DATA.items.find(x => x.kode === b.dataset.prqPickItem);
    if(barang) onPick(barang);
    closeModal();
  });
  wire();
  document.getElementById('prqItemPickerSearch').oninput = (e) => {
    const q = e.target.value.trim().toLowerCase();
    const list = DATA.items.filter(x => !q || x.kode.toLowerCase().includes(q) || x.nama.toLowerCase().includes(q));
    document.getElementById('prqItemPickerBody').innerHTML = tplPrqItemPickerRows(list);
    wire();
  };
}
