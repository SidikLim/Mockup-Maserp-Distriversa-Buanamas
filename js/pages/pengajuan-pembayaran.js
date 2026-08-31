/* =========================================================
   LOGIC (JS saja) — Pengajuan Pembayaran (Supplier & Pembelian >
   Daftar Transaksi). Dimuat otomatis (lazy-load) oleh core.js
   saat menu ini pertama kali diklik — lihat PAGE_MODULES di
   js/core.js. Markup HTML-nya ada di file sebelah:
   pengajuan-pembayaran.template.js (catatan desain lengkap di
   headernya). NB: closeModal() dipakai bersama (core.js).

   Alur inti:
   - Pilih Supplier (picker) -> pjpFakturOutstanding() mengambil
     SEMUA faktur outstanding supplier tsb — gabungan Pembelian
     Melalui BPB (DATA.pembelianBPB), Pembelian Langsung
     (DATA.pembelianLangsung) & Pembelian dari PO
     (DATA.pembelianPO) yang sisa tagihannya > 0 — dan
     menampilkannya di Rincian Pengajuan Pembayaran.
   - Centang faktur yang diajukan; Pembayaran editable (default =
     sisa faktur, di-clamp <= sisa); Reminder tanggal bebas.
     "Jumlah" bawah = total Pembayaran baris tercentang (LIVE).
   - No. Otomatis dropdown PY{kode cabang} FUNGSIONAL — ganti
     kode = counter cabang lain; No. Transaksi
     "PYR/{kode}/2608{urut 4 digit}" + tombol refresh.
   - Cetak -> preview pengajuan (faktur tercentang saja) kop DBM
     + kolom tanda tangan Diajukan/Disetujui/Finance.
   - Simpan validasi: supplier wajib, minimal 1 faktur dicentang,
     pembayaran baris tercentang > 0.
   Data: DATA.pengajuanPembayaran. */

var pjpState = { bulan:'|', search:'' };

function renderPengajuanPembayaranPage(){
  pjpState = { bulan:'|', search:'' };
  renderPjpList();
}

function renderPjpList(){
  content.innerHTML = tplPengajuanPembayaranListPage(pjpState.bulan);
  document.getElementById('btnPjpAdd').onclick = () => openPjpForm('add', null);
  document.getElementById('pjpFilterBulan').onchange = (e) => { pjpState.bulan = e.target.value; renderPjpTable(); };
  document.getElementById('pjpSearch').oninput = (e) => { pjpState.search = e.target.value; renderPjpTable(); };
  renderPjpTable();
}

function pjpFilteredRows(){
  const q = pjpState.search.trim().toLowerCase();
  const parts = pjpState.bulan.split('|');
  const mm = parts[0], yy = parts[1];
  return (DATA.pengajuanPembayaran || []).filter(r => {
    if(mm && !(r.tgl||'').includes('/' + mm + '/' + yy)) return false;
    if(q && !(
      r.no.toLowerCase().includes(q) ||
      (r.supplier||'').toLowerCase().includes(q) ||
      (r.keterangan||'').toLowerCase().includes(q))) return false;
    return true;
  });
}

function renderPjpTable(){
  const rows = pjpFilteredRows();
  const tbody = document.getElementById('pjpTbody');
  tbody.innerHTML = tplPjpRows(rows);
  document.getElementById('pjpTotal').textContent = `Total Record: ${rows.length}`;
  const idxOf = (r) => DATA.pengajuanPembayaran.indexOf(r);
  tbody.querySelectorAll('[data-view-link]').forEach(b => b.onclick = () => openPjpForm('view', idxOf(rows[+b.dataset.viewLink])));
  tbody.querySelectorAll('[data-pjp-view]').forEach(b => b.onclick = () => openPjpForm('view', idxOf(rows[+b.dataset.pjpView])));
  tbody.querySelectorAll('[data-pjp-print]').forEach(b => b.onclick = () => openPjpPrint(rows[+b.dataset.pjpPrint]));
  tbody.querySelectorAll('[data-pjp-edit]').forEach(b => b.onclick = () => openPjpForm('edit', idxOf(rows[+b.dataset.pjpEdit])));
  tbody.querySelectorAll('[data-pjp-del]').forEach(b => b.onclick = () => openPjpDelete(idxOf(rows[+b.dataset.pjpDel])));
}

/* Nomor otomatis per kode cabang: PYR/HO/26080001, 26080002, ... */
function pjpGenerateNo(kode){
  const prefix = `PYR/${kode}/2608`;
  let max = 0;
  (DATA.pengajuanPembayaran || []).forEach(r => {
    if(r.no && r.no.startsWith(prefix)){
      const n = parseInt(r.no.slice(prefix.length), 10);
      if(!isNaN(n) && n > max) max = n;
    }
  });
  return prefix + String(max + 1).padStart(4, '0');
}

/* Kumpulkan faktur outstanding (sisa > 0) milik supplier dari 3 sumber. */
function pjpFakturOutstanding(supplier){
  const out = [];
  const push = (no, tglFaktur, tglJthTempo, sisa) => {
    if(sisa > 0.004) out.push({ noFaktur: no, tglFaktur: tglFaktur||'', tglJthTempo: tglJthTempo||'', kurs: 1, reminder: '', dipilih: false, pembayaran: sisa, sisa: sisa });
  };
  const match = (s) => (s||'').toLowerCase() === (supplier||'').toLowerCase();
  (DATA.pembelianBPB || []).forEach(r => {
    if(match(r.supplier)) push(r.no, r.tglFaktur, r.tglJatuhTempo, Number(r.jumlahTotal||0) - Number(r.pembayaran||0));
  });
  (DATA.pembelianLangsung || []).forEach(r => {
    if(match(r.supplier)) push(r.no, r.tglFaktur, r.tglJthTempo, r.sisaJumlah != null ? Number(r.sisaJumlah) : Number(r.jumlahTotal||0) - Number(r.pembayaran||0));
  });
  (DATA.pembelianPO || []).forEach(r => {
    if(match(r.supplier)) push(r.no, r.tglFaktur, r.tglJthTempo, r.sisaJumlah != null ? Number(r.sisaJumlah) : Number(r.jumlahTotal||0) - Number(r.pembayaran||0));
  });
  return out;
}

function pjpRecalc(row){
  row.jumlah = (row.fakturs || []).reduce((a,f) => a + (f.dipilih ? Number(f.pembayaran||0) : 0), 0);
  const el = document.getElementById('fPjpJumlah');
  if(el) el.value = pjpNum2(row.jumlah);
}

/* =====================================================================
   FORM add / edit / view
===================================================================== */
function openPjpForm(mode, idx){
  const src = idx != null ? DATA.pengajuanPembayaran[idx] : null;
  const row = src ? JSON.parse(JSON.stringify(src)) : {
    no: pjpGenerateNo('HO'), kodeCabang: 'HO', supplier: '', tgl: '31/08/2026',
    keterangan: '', fakturs: [], jumlah: 0, userInput: 'sidik',
  };
  const isView = mode === 'view';
  content.innerHTML = tplPjpForm(mode, row);

  const back = () => renderPjpList();
  document.getElementById('pjpBatalkan').onclick = (e) => { e.preventDefault(); back(); };
  document.getElementById('btnPjpTutorial').onclick = () => openPjpInfo('Tutorial', 'Video tutorial Pengajuan Pembayaran tersedia di portal MASERP (mockup).');

  wirePjpFakturs(row, isView);
  if(isView) return;

  document.getElementById('fPjpNoOtomatis').onchange = (e) => {
    row.kodeCabang = e.target.value;
    if(mode === 'add'){ row.no = pjpGenerateNo(row.kodeCabang); document.getElementById('fPjpNo').value = row.no; }
  };
  const refreshNoBtn = document.getElementById('pjpRefreshNo');
  if(refreshNoBtn) refreshNoBtn.onclick = () => { row.no = pjpGenerateNo(row.kodeCabang); document.getElementById('fPjpNo').value = row.no; };

  document.getElementById('pjpSupplierSearch').onclick = () => openPjpSupplierPicker((nama) => {
    row.supplier = nama;
    document.getElementById('fPjpSupplier').value = nama.toUpperCase();
    row.fakturs = pjpFakturOutstanding(nama);
    wirePjpFakturs(row, isView);
    pjpRecalc(row);
    if(!row.fakturs.length) openPjpInfo('Informasi', `Tidak ada faktur outstanding untuk <b>${nama.toUpperCase()}</b> — semua tagihan supplier ini sudah lunas.`);
  });

  document.getElementById('pjpCetak').onclick = () => { pjpReadForm(row); pjpRecalc(row); openPjpPrint(row); };
  document.getElementById('pjpSimpan').onclick = () => { if(pjpSave(mode, idx, row)) back(); };
}

function wirePjpFakturs(row, isView){
  document.getElementById('pjpFakturBody').innerHTML = tplPjpFakturRows(row.fakturs, isView);
  const hint = document.getElementById('pjpFakturEmptyHint');
  if(hint) hint.style.display = (row.fakturs && row.fakturs.length) ? 'none' : '';
  if(isView) return;
  document.querySelectorAll('[data-pjp-check]').forEach(cb => cb.onchange = () => {
    row.fakturs[+cb.dataset.pjpCheck].dipilih = cb.checked;
    pjpRecalc(row);
  });
  document.querySelectorAll('[data-pjp-reminder]').forEach(inp => inp.oninput = () => {
    row.fakturs[+inp.dataset.pjpReminder].reminder = inp.value;
  });
  document.querySelectorAll('[data-pjp-bayar]').forEach(inp => inp.oninput = () => {
    const i = +inp.dataset.pjpBayar;
    let v = Number(inp.value) || 0;
    const sisa = Number(row.fakturs[i].sisa || 0);
    if(v < 0) v = 0;
    if(v > sisa){ v = sisa; inp.value = v; }
    row.fakturs[i].pembayaran = v;
    pjpRecalc(row);
  });
}

function pjpReadForm(row){
  row.tgl = document.getElementById('fPjpTgl').value.trim();
  row.keterangan = document.getElementById('fPjpKeterangan').value;
}

/* ----- Simpan + validasi ----- */
function pjpSave(mode, idx, row){
  pjpReadForm(row);
  pjpRecalc(row);

  if(!row.supplier){ openPjpInfo('Validasi', 'Supplier wajib dipilih.'); return false; }
  if(!row.tgl){ openPjpInfo('Validasi', 'Tgl. Trn. wajib diisi.'); return false; }
  const terpilih = (row.fakturs || []).filter(f => f.dipilih);
  if(!terpilih.length){ openPjpInfo('Validasi', 'Centang minimal 1 faktur yang akan diajukan pembayarannya.'); return false; }
  if(terpilih.some(f => Number(f.pembayaran||0) <= 0)){ openPjpInfo('Validasi', 'Nilai Pembayaran pada faktur yang dicentang harus lebih dari 0.'); return false; }

  DATA.pengajuanPembayaran = DATA.pengajuanPembayaran || [];
  if(mode === 'add') DATA.pengajuanPembayaran.unshift(row);
  else DATA.pengajuanPembayaran[idx] = row;
  return true;
}

/* =====================================================================
   Modals
===================================================================== */
function pjpOverlay(html){
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

function openPjpPrint(row){ pjpOverlay(tplPjpPrintModal(row)); }

function openPjpDelete(idx){
  const row = DATA.pengajuanPembayaran[idx];
  pjpOverlay(tplPjpDeleteConfirm(row));
  document.getElementById('modalDelete').onclick = () => {
    DATA.pengajuanPembayaran.splice(idx, 1);
    closeModal();
    renderPjpTable();
  };
}

function openPjpInfo(title, text){
  pjpOverlay(tplPjpInfoModal(title, text));
  document.getElementById('modalOk').onclick = closeModal;
}

function openPjpSupplierPicker(onPick){
  const overlay = pjpOverlay(tplPjpSupplierPicker(DATA.suppliers));
  const wire = () => overlay.querySelectorAll('[data-pjp-pick-supplier]').forEach(b => b.onclick = () => {
    closeModal();
    onPick(b.dataset.pjpPickSupplier);
  });
  wire();
  document.getElementById('pjpSupplierPickerSearch').oninput = (e) => {
    const q = e.target.value.trim().toLowerCase();
    const list = DATA.suppliers.filter(s => !q || s.kode.toLowerCase().includes(q) || s.nama.toLowerCase().includes(q));
    document.getElementById('pjpSupplierPickerBody').innerHTML = tplPjpSupplierPickerRows(list);
    wire();
  };
}
