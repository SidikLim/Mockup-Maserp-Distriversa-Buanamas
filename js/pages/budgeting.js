/* =========================================================
   LOGIC (JS saja) — Budgeting (General Ledger > Master &
   Setting > Budgeting, page:'budgeting'). Dimuat otomatis
   (lazy-load) oleh core.js — lihat PAGE_MODULES di js/core.js.
   Markup di file sebelah: budgeting.template.js (catatan
   desain & pemetaan screenshot SDL -> DBM di headernya).
   NB: closeModal() dipakai bersama, didefinisikan di core.js.

   Alur inti:
   - Baris = seluruh DATA.akunGL jenis 'Detail'; checkbox
     "Munculkan Akun Neraca" (default ON) — bila OFF, akun kode
     awalan 1/2/3 disembunyikan (tinggal akun laba-rugi 4/5/6).
   - Nominal budget JANUARI-DESEMBER per akun + toggle
     "Budgeting PO" per baris. Semua edit masuk DRAFT
     (bgtDraft, object per kode akun {po, bulan[12]}) sehingga
     nilai awet saat pindah halaman/filter; tombol Simpan
     menulis draft ke DATA.budgeting + modal info jumlah akun
     yang punya budget. Delete per baris = konfirmasi lalu
     kosongkan nilai + toggle akun itu.
   - Pencarian kode/nama, sort Kode GL & Nama GL, pager
     windowed page-size 10, Total Record = akun terfilter.
   Data: DATA.budgeting (object {kode:{po,bulan[12]}}, sample
   budget 2026 akun biaya). */

let bgtState = { page:1, search:'', sortField:'kode', sortDir:'asc', showNeraca:true };
let bgtDraft = null;
const BGT_PAGE_SIZE = 10;

function renderBudgetingPage(){
  bgtState = { page:1, search:'', sortField:'kode', sortDir:'asc', showNeraca:true };
  bgtDraft = JSON.parse(JSON.stringify(DATA.budgeting || {}));
  content.innerHTML = tplBgtPage(bgtState.showNeraca);
  document.getElementById('btnBgtTutorial').onclick = () => openBgtInfo('Tutorial', 'Video tutorial Budgeting tersedia di portal MASERP (mockup).');
  document.getElementById('btnBgtSimpan').onclick = () => {
    // buang entry kosong (tanpa nilai & tanpa toggle) agar DATA rapi
    const bersih = {};
    Object.keys(bgtDraft).forEach(k => {
      const d = bgtDraft[k];
      const adaNilai = (d.bulan || []).some(v => v !== '' && v != null && Number(v) !== 0);
      if(d.po || adaNilai) bersih[k] = d;
    });
    DATA.budgeting = JSON.parse(JSON.stringify(bersih));
    openBgtInfo('Simpan Budgeting', `Budget berhasil disimpan — ${Object.keys(bersih).length} akun GL punya budget/toggle aktif.`);
  };
  document.getElementById('bgtNeraca').onchange = (e) => {
    bgtState.showNeraca = e.target.checked;
    bgtState.page = 1;
    renderBgtTable();
  };
  document.getElementById('bgtSearch').oninput = (e) => {
    bgtState.search = e.target.value.trim().toLowerCase();
    bgtState.page = 1;
    renderBgtTable();
  };
  document.querySelectorAll('[data-bgt-sort]').forEach(el => el.onclick = () => {
    const field = el.dataset.bgtSort;
    if(bgtState.sortField === field){
      bgtState.sortDir = bgtState.sortDir === 'asc' ? 'desc' : 'asc';
    } else {
      bgtState.sortField = field;
      bgtState.sortDir = 'asc';
    }
    bgtState.page = 1;
    renderBgtTable();
  });
  renderBgtTable();
}

function bgtFilteredSortedRows(){
  const q = bgtState.search;
  let rows = (DATA.akunGL || []).filter(a => a.jenis === 'Detail');
  if(!bgtState.showNeraca) rows = rows.filter(a => !bgtIsNeraca(a.kode));
  if(q) rows = rows.filter(a => a.kode.toLowerCase().includes(q) || (a.nama||'').toLowerCase().includes(q));
  const f = bgtState.sortField;
  const dir = bgtState.sortDir === 'desc' ? -1 : 1;
  rows.sort((a,b) => String(a[f]||'').localeCompare(String(b[f]||''), 'id') * dir);
  return rows;
}

function bgtDraftRow(kode){
  if(!bgtDraft[kode]) bgtDraft[kode] = { po:false, bulan:[] };
  return bgtDraft[kode];
}

function renderBgtTable(){
  const rows = bgtFilteredSortedRows();
  const totalPages = Math.max(1, Math.ceil(rows.length/BGT_PAGE_SIZE));
  if(bgtState.page > totalPages) bgtState.page = totalPages;
  const start = (bgtState.page-1)*BGT_PAGE_SIZE;
  const pageRows = rows.slice(start, start+BGT_PAGE_SIZE);

  document.getElementById('bgtTbody').innerHTML = tplBgtRows(pageRows, bgtDraft);
  document.getElementById('bgtTotal').textContent = `Total Record: ${rows.length}`;
  document.getElementById('bgtPager').innerHTML = tplBgtPager(bgtState.page, totalPages);

  ['kode','nama'].forEach(f => {
    const el = document.getElementById(`bgtSortIcon_${f}`);
    if(!el) return;
    if(bgtState.sortField === f){
      el.innerHTML = bgtState.sortDir === 'asc' ? '&#8593;' : '&#8595;';
      el.style.color = 'var(--blue)';
    } else {
      el.innerHTML = '&#8693;';
      el.style.color = 'var(--text-light)';
    }
  });

  const tbody = document.getElementById('bgtTbody');
  tbody.querySelectorAll('[data-bgt-po]').forEach(t => t.onchange = () => {
    bgtDraftRow(t.dataset.bgtPo).po = t.checked;
  });
  tbody.querySelectorAll('[data-bgt-val]').forEach(inp => inp.oninput = () => {
    const [kode, i] = inp.dataset.bgtVal.split('|');
    const d = bgtDraftRow(kode);
    d.bulan = d.bulan || [];
    d.bulan[+i] = inp.value === '' ? '' : Number(inp.value);
  });
  tbody.querySelectorAll('[data-bgt-del]').forEach(b => b.onclick = () => openBgtDelete(b.dataset.bgtDel));

  document.getElementById('bgtPager').querySelectorAll('[data-bgtpage]').forEach(b => b.onclick = () => { bgtState.page = +b.dataset.bgtpage; renderBgtTable(); });
}

function bgtOverlay(html){
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

function openBgtDelete(kode){
  const akun = (DATA.akunGL || []).find(a => a.kode === kode) || { kode, nama:'' };
  bgtOverlay(tplBgtDeleteConfirm(akun));
  document.getElementById('modalDelete').onclick = () => {
    delete bgtDraft[kode];
    closeModal();
    renderBgtTable();
  };
}

function openBgtInfo(title, text){
  bgtOverlay(tplBgtInfoModal(title, text));
  document.getElementById('modalOk').onclick = closeModal;
}
