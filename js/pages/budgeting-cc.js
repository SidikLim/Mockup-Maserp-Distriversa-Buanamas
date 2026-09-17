/* =========================================================
   LOGIC (JS saja) — Budgeting Cost Center (General Ledger > Master &
   Setting > Budgeting Cc., page:'budgetingCc'). Dimuat otomatis
   (lazy-load) oleh core.js — lihat PAGE_MODULES di js/core.js.
   Markup di file sebelah: budgeting-cc.template.js (catatan desain
   lengkap ada di headernya).
   NB: closeModal() dipakai bersama, didefinisikan di core.js.

   Alur inti:
   - Pilih Cabang (picker dari DATA.cabangMaster) -> Cost Center
     (picker, di-scope oleh cabang.costCenterKode — direset tiap
     Cabang berganti, pola sama msoGudangOptionsForCabang() di
     Master Stock Opname).
   - Begitu Cabang+Cost Center terpilih, draft (bccDraft) dimuat dari
     DATA.budgetingCc["kodeCabang|kodeCC"] (atau array kosong kalau
     kombinasi ini belum pernah disimpan).
   - "+Tambah Akun Baru" menambah 1 baris kosong ke draft; klik ikon
     cari di baris itu membuka picker Akun GL (akun 'Header' tidak
     ditampilkan) — akun yang sudah dipakai di baris LAIN pada draft
     yang sama ditolak (cegah duplikat 1 akun 2x utk kombinasi yang
     sama).
   - Nominal 12 bulan & Keterangan diedit langsung ke baris draft
     (tersimpan sementara, awet pindah halaman/search/tab). Tombol
     Simpan menulis draft (baris yang sudah punya akun saja — baris
     kosong yang belum sempat dipilih akunnya dibuang) ke
     DATA.budgetingCc + modal info jumlah akun tersimpan.
   - Pencarian Global menyaring baris (kode/nama akun/keterangan);
     filtering dilakukan dengan tetap membawa index ASLI di bccDraft
     (lihat bccFilteredIndexedRows()) supaya wiring input tidak salah
     sasaran saat tabel difilter/dipaginasi.
   Data: DATA.budgetingCc (object per "kodeCabang|kodeCC", array baris
   {kode, keterangan, bulan[12]}). */

let bccState = { cabangKode:'', ccKode:'', page:1, search:'' };
let bccDraft = [];
let bccPageSize = 10;

function renderBudgetingCcPage(){
  bccState = { cabangKode:'', ccKode:'', page:1, search:'' };
  bccDraft = [];
  bccPageSize = 10;
  content.innerHTML = tplBccPage();

  document.getElementById('btnBccTutorial').onclick = () => openBccInfo('Tutorial', 'Video tutorial Budgeting Cost Center tersedia di portal MASERP (mockup).');
  document.getElementById('btnBccSimpan').onclick = bccSimpan;
  document.getElementById('bccCabangSearch').onclick = openBccCabangPicker;
  document.getElementById('bccCostCenterSearch').onclick = () => {
    if(!bccState.cabangKode){ openBccInfo('Cost Center', 'Pilih Cabang terlebih dahulu.'); return; }
    openBccCostCenterPicker();
  };
  document.getElementById('btnBccAddAkun').onclick = () => {
    if(!bccState.cabangKode || !bccState.ccKode){ openBccInfo('Tambah Akun Baru', 'Pilih Cabang dan Cost Center terlebih dahulu sebelum menambah akun.'); return; }
    bccDraft.push({ kode:'', keterangan:'', bulan:[] });
    bccState.page = Math.max(1, Math.ceil(bccDraft.length / bccPageSize));
    renderBccTable();
  };
  document.getElementById('bccPageSize').onchange = (e) => {
    bccPageSize = +e.target.value;
    bccState.page = 1;
    renderBccTable();
  };
  document.getElementById('bccSearch').oninput = (e) => {
    bccState.search = e.target.value.trim().toLowerCase();
    bccState.page = 1;
    renderBccTable();
  };

  renderBccTable();
}

function bccRefreshFilterFields(){
  const cabang = DATA.cabangMaster.find(c => c.kode === bccState.cabangKode);
  document.getElementById('fBccCabang').value = cabang ? `${cabang.kode} - ${cabang.nama}` : '';
  const cc = DATA.costCenter.find(c => c.kode === bccState.ccKode);
  document.getElementById('fBccCostCenter').value = cc ? `${cc.kode} - ${cc.nama}` : '';
}

function bccFilteredIndexedRows(){
  const q = bccState.search;
  let rows = bccDraft.map((row, idx) => ({ row, idx }));
  if(q){
    rows = rows.filter(({row}) => {
      const akun = row.kode ? (DATA.akunGL||[]).find(a => a.kode === row.kode) : null;
      const hay = `${row.kode||''} ${akun ? akun.nama : ''} ${row.keterangan||''}`.toLowerCase();
      return hay.includes(q);
    });
  }
  return rows;
}

function renderBccTable(){
  const hasFilter = !!(bccState.cabangKode && bccState.ccKode);
  const indexedRows = hasFilter ? bccFilteredIndexedRows() : [];
  const totalPages = Math.max(1, Math.ceil(indexedRows.length / bccPageSize));
  if(bccState.page > totalPages) bccState.page = totalPages;
  const start = (bccState.page - 1) * bccPageSize;
  const pageRows = indexedRows.slice(start, start + bccPageSize);

  document.getElementById('bccTbody').innerHTML = hasFilter
    ? tplBccRows(pageRows)
    : `<tr><td colspan="${3 + BCC_BULAN.length + 1}" style="color:var(--text-light);padding:14px;text-align:center;font-weight:600;">Pilih Cabang dan Cost Center terlebih dahulu</td></tr>`;
  document.getElementById('bccTotal').textContent = `Total Record: ${indexedRows.length}`;
  document.getElementById('bccPager').innerHTML = tplBccPager(bccState.page, totalPages);

  const tbody = document.getElementById('bccTbody');
  tbody.querySelectorAll('[data-bcc-pick]').forEach(btn => btn.onclick = () => openBccAkunPicker(+btn.dataset.bccPick));
  tbody.querySelectorAll('[data-bcc-ket]').forEach(inp => inp.oninput = () => { bccDraft[+inp.dataset.bccKet].keterangan = inp.value; });
  tbody.querySelectorAll('[data-bcc-val]').forEach(inp => inp.oninput = () => {
    const [idx, mi] = inp.dataset.bccVal.split('|');
    const row = bccDraft[+idx];
    row.bulan = row.bulan || [];
    row.bulan[+mi] = inp.value === '' ? '' : Number(inp.value);
  });
  tbody.querySelectorAll('[data-bcc-del]').forEach(btn => btn.onclick = () => openBccDeleteConfirm(+btn.dataset.bccDel));

  document.getElementById('bccPager').querySelectorAll('[data-bccpage]').forEach(b => b.onclick = () => { bccState.page = +b.dataset.bccpage; renderBccTable(); });
}

function bccSimpan(){
  if(!bccState.cabangKode || !bccState.ccKode){
    openBccInfo('Simpan Budgeting Cost Center', 'Pilih Cabang dan Cost Center terlebih dahulu sebelum menyimpan.');
    return;
  }
  const bersih = bccDraft.filter(row => !!row.kode);
  const key = `${bccState.cabangKode}|${bccState.ccKode}`;
  if(!DATA.budgetingCc) DATA.budgetingCc = {};
  DATA.budgetingCc[key] = JSON.parse(JSON.stringify(bersih));
  bccDraft = JSON.parse(JSON.stringify(bersih));
  bccState.page = 1;
  renderBccTable();
  openBccInfo('Simpan Budgeting Cost Center', `Budget berhasil disimpan — ${bersih.length} akun GL punya budget untuk Cost Center ini.`);
}

function bccOverlay(html){
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

function openBccCabangPicker(){
  const overlay = bccOverlay(tplBccCabangPicker(DATA.cabangMaster));
  overlay.querySelectorAll('[data-pick-cabang]').forEach(btn => btn.onclick = () => {
    const kode = btn.dataset.pickCabang;
    if(kode !== bccState.cabangKode){
      bccState.cabangKode = kode;
      bccState.ccKode = '';
      bccDraft = [];
      bccState.page = 1;
    }
    closeModal();
    bccRefreshFilterFields();
    renderBccTable();
  });
}

function openBccCostCenterPicker(){
  const cabang = DATA.cabangMaster.find(c => c.kode === bccState.cabangKode);
  const allowedKode = (cabang && cabang.costCenterKode) || [];
  const list = DATA.costCenter.filter(cc => allowedKode.includes(cc.kode));
  const overlay = bccOverlay(tplBccCostCenterPicker(list));
  overlay.querySelectorAll('[data-pick-cc]').forEach(btn => btn.onclick = () => {
    const kode = btn.dataset.pickCc;
    bccState.ccKode = kode;
    const key = `${bccState.cabangKode}|${kode}`;
    bccDraft = JSON.parse(JSON.stringify((DATA.budgetingCc && DATA.budgetingCc[key]) || []));
    bccState.page = 1;
    closeModal();
    bccRefreshFilterFields();
    renderBccTable();
  });
}

function openBccAkunPicker(rowIdx){
  const usedKodes = bccDraft.filter((r,i) => i !== rowIdx && r.kode).map(r => r.kode);
  const master = (DATA.akunGL||[]).filter(a => a.jenis === 'Detail');
  const overlay = bccOverlay(tplBccAkunPicker(master, rowIdx));

  const wireRows = () => {
    overlay.querySelectorAll('[data-pick-akun]').forEach(btn => btn.onclick = () => {
      const kode = btn.dataset.pickAkun;
      if(usedKodes.includes(kode)){
        openBccInfo('Tambah Akun', 'Akun ini sudah ada di daftar Budgeting Cost Center untuk Cabang & Cost Center yang sama.');
        return;
      }
      bccDraft[rowIdx].kode = kode;
      closeModal();
      renderBccTable();
    });
  };
  wireRows();

  document.getElementById('bccAkunPickerSearch').oninput = (e) => {
    const q = e.target.value.trim().toLowerCase();
    const filtered = master.filter(a => a.kode.toLowerCase().includes(q) || a.nama.toLowerCase().includes(q));
    document.getElementById('bccAkunPickerBody').innerHTML = tplBccAkunPickerRows(filtered, rowIdx);
    wireRows();
  };
}

function openBccDeleteConfirm(idx){
  const row = bccDraft[idx];
  const akun = row.kode ? (DATA.akunGL||[]).find(a => a.kode === row.kode) : null;
  bccOverlay(tplBccDeleteConfirm(row, akun));
  document.getElementById('modalDelete').onclick = () => {
    bccDraft.splice(idx, 1);
    closeModal();
    renderBccTable();
  };
}

function openBccInfo(title, text){
  bccOverlay(tplBccInfoModal(title, text));
  document.getElementById('modalOk').onclick = closeModal;
}
