/* =========================================================
   LOGIC (JS saja) — Rumus Rasio Keuangan (General Ledger > Master &
   Setting > Rumus Rasio Keuangan, page:'rumusRasioKeuangan'). Dimuat
   otomatis (lazy-load) oleh core.js — lihat PAGE_MODULES di
   js/core.js. Markup di file sebelah: rumus-rasio-keuangan.template.js
   (catatan desain lengkap ada di headernya — termasuk keputusan
   Akun picker yang menampilkan akun Header MAUPUN Detail, beda dari
   Budgeting Cc.).
   NB: closeModal() dipakai bersama, didefinisikan di core.js.

   Alur inti:
   - List "Daftar Rasio" (DATA.rumusRasioKeuangan, array flat — bukan
     object per-kombinasi seperti Budgeting Cc, karena rasio bukan
     data yang di-scope per Cabang/Cost Center) dengan sort (klik
     header Nama Ratio/Type Ratio), search, page-size, pager — pola
     sama seperti Rumus Komisi Salesman.
   - "+ Ratio" (Tambah) / Ubah membuka form dengan draft lokal
     (rrkDraft) hasil copy dari baris DATA (atau baris kosong baru).
     Tabel item (Kode/Nama/Akun) diedit bebas di draft ini — baris
     bisa ditambah ("+Tambah Item Baru") atau dihapus kapan saja,
     TIDAK ditulis ke DATA sampai tombol Simpan ditekan (pola draft
     sama seperti Budgeting Cc, tapi di sini draft-nya 1 objek Ratio
     utuh, bukan array baris budget per Cabang+CC).
   - Kode item disaring HANYA huruf saat mengetik (rrkSanitizeKode) —
     sesuai teks bantuan di screenshot form.
   - Akun dipilih lewat modal picker (openRrkAkunPicker) yang
     menampilkan akun Header & Detail dari DATA.akunGL, dengan
     pencarian & guard anti-duplikat (1 akun tidak boleh dipakai di
     2 baris item pada draft yang sama). Begitu akun dipilih, field
     Nama item ikut diisi otomatis dari nama akun HANYA jika field
     Nama itu masih kosong (tidak pernah menimpa nama yang sudah
     diketik user sendiri).
   - Simpan memvalidasi Nama Ratio & Rumus Ratio wajib diisi, lalu
     menulis draft (item yang kode-nya kosong dibuang, sama seperti
     bccSimpan()) ke DATA.rumusRasioKeuangan[idx] (Ubah) atau push
     baris baru (Tambah).
   Data: DATA.rumusRasioKeuangan (array {namaRatio, tipeRatio, rumus,
   target, items:[{kode,nama,akunKode}]}) — lihat js/data.js. */

let rrkState = { page:1, pageSize:10, search:'', sortField:'namaRatio', sortDir:'asc' };
let rrkDraft = null;
let rrkEditIndex = -1;

function renderRumusRasioKeuanganPage(){
  rrkState = { page:1, pageSize:10, search:'', sortField:'namaRatio', sortDir:'asc' };
  content.innerHTML = tplRrkListPage();

  document.getElementById('btnRrkAdd').onclick = () => openRrkForm('add', -1);
  document.getElementById('rrkPageSize').onchange = (e) => { rrkState.pageSize = +e.target.value; rrkState.page = 1; renderRrkTable(); };
  document.getElementById('rrkSearch').oninput = (e) => { rrkState.search = e.target.value.trim().toLowerCase(); rrkState.page = 1; renderRrkTable(); };

  document.querySelectorAll('.rrk-sort-header').forEach(el => el.onclick = () => {
    const field = el.dataset.rrkSort;
    if(rrkState.sortField === field){ rrkState.sortDir = rrkState.sortDir === 'asc' ? 'desc' : 'asc'; }
    else { rrkState.sortField = field; rrkState.sortDir = 'asc'; }
    renderRrkTable();
  });

  renderRrkTable();
}

function rrkFilteredSorted(){
  const q = rrkState.search;
  let rows = DATA.rumusRasioKeuangan.slice();
  if(q){
    rows = rows.filter(r => `${r.namaRatio||''} ${r.tipeRatio||''}`.toLowerCase().includes(q));
  }
  const field = rrkState.sortField, dir = rrkState.sortDir === 'asc' ? 1 : -1;
  rows.sort((a,b) => String(a[field]||'').localeCompare(String(b[field]||'')) * dir);
  return rows;
}

function renderRrkTable(){
  const rows = rrkFilteredSorted();
  const totalPages = Math.max(1, Math.ceil(rows.length / rrkState.pageSize));
  if(rrkState.page > totalPages) rrkState.page = totalPages;

  document.getElementById('rrkTbody').innerHTML = tplRrkRows(rows, rrkState.page, rrkState.pageSize);
  document.getElementById('rrkTotal').textContent = `Total Record: ${rows.length}`;
  document.getElementById('rrkPager').innerHTML = tplRrkPager(rrkState.page, totalPages);

  ['namaRatio','tipeRatio'].forEach(f => {
    const icon = document.getElementById(`rrkSortIcon_${f}`);
    if(icon) icon.innerHTML = (rrkState.sortField === f) ? (rrkState.sortDir === 'asc' ? '&#8593;' : '&#8595;') : '&#8693;';
  });

  document.querySelectorAll('#rrkTbody [data-edit]').forEach(el => el.onclick = (e) => { e.preventDefault(); openRrkForm('edit', +el.dataset.edit); });
  document.querySelectorAll('#rrkTbody [data-del]').forEach(btn => btn.onclick = () => openRrkDeleteConfirm(+btn.dataset.del));
  const pager = document.getElementById('rrkPager');
  pager.querySelectorAll('[data-rrkpage]').forEach(b => b.onclick = () => { rrkState.page = +b.dataset.rrkpage; renderRrkTable(); });
}

function openRrkForm(mode, idx){
  rrkEditIndex = idx;
  rrkDraft = mode === 'edit'
    ? JSON.parse(JSON.stringify(DATA.rumusRasioKeuangan[idx]))
    : { namaRatio:'', tipeRatio:RRK_TIPE_LIST[0], rumus:'', target:0, items:[] };
  if(!rrkDraft.items) rrkDraft.items = [];

  content.innerHTML = tplRrkForm(mode, rrkDraft);

  document.getElementById('fRrkNamaRatio').oninput = (e) => { rrkDraft.namaRatio = e.target.value; };
  document.getElementById('fRrkTipeRatio').onchange = (e) => { rrkDraft.tipeRatio = e.target.value; };
  document.getElementById('fRrkRumus').oninput = (e) => { rrkDraft.rumus = e.target.value; };
  document.getElementById('fRrkTarget').oninput = (e) => { rrkDraft.target = e.target.value === '' ? 0 : Number(e.target.value.replace(/[^0-9.\-]/g,'')) || 0; };

  document.getElementById('rrkAddItem').onclick = (e) => {
    e.preventDefault();
    rrkDraft.items.push({ kode:'', nama:'', akunKode:'' });
    renderRrkItemsTable();
  };
  document.getElementById('rrkSimpan').onclick = rrkSimpan;
  document.getElementById('rrkCancel').onclick = (e) => { e.preventDefault(); renderRumusRasioKeuanganPage(); };

  renderRrkItemsTable();
}

function rrkSanitizeKode(str){
  return String(str||'').replace(/[^A-Za-z]/g,'');
}

function renderRrkItemsTable(){
  document.getElementById('rrkItemsBody').innerHTML = tplRrkItemRows(rrkDraft.items);

  document.querySelectorAll('[data-rrk-kode]').forEach(inp => inp.oninput = (e) => {
    const i = +e.target.dataset.rrkKode;
    const clean = rrkSanitizeKode(e.target.value);
    rrkDraft.items[i].kode = clean;
    if(e.target.value !== clean) e.target.value = clean;
  });
  document.querySelectorAll('[data-rrk-nama]').forEach(inp => inp.oninput = (e) => {
    rrkDraft.items[+e.target.dataset.rrkNama].nama = e.target.value;
  });
  document.querySelectorAll('[data-rrk-pick]').forEach(btn => btn.onclick = () => openRrkAkunPicker(+btn.dataset.rrkPick));
  document.querySelectorAll('[data-rrk-delitem]').forEach(btn => btn.onclick = () => {
    rrkDraft.items.splice(+btn.dataset.rrkDelitem, 1);
    renderRrkItemsTable();
  });
}

function rrkOverlay(html){
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

function openRrkAkunPicker(itemIdx){
  const usedKodes = rrkDraft.items.filter((it,i) => i !== itemIdx && it.akunKode).map(it => it.akunKode);
  const master = (DATA.akunGL||[]).slice();
  const overlay = rrkOverlay(tplRrkAkunPicker(master));

  const wireRows = () => {
    overlay.querySelectorAll('[data-pick-akun]').forEach(btn => btn.onclick = () => {
      const kode = btn.dataset.pickAkun;
      if(usedKodes.includes(kode)){
        openRrkInfo('Pilih Account', 'Akun ini sudah dipakai di baris item lain pada rasio yang sama.');
        return;
      }
      const akun = master.find(a => a.kode === kode);
      rrkDraft.items[itemIdx].akunKode = kode;
      if(akun && !rrkDraft.items[itemIdx].nama) rrkDraft.items[itemIdx].nama = akun.nama;
      closeModal();
      renderRrkItemsTable();
    });
  };
  wireRows();

  document.getElementById('rrkAkunPickerSearch').oninput = (e) => {
    const q = e.target.value.trim().toLowerCase();
    const filtered = master.filter(a => a.kode.toLowerCase().includes(q) || a.nama.toLowerCase().includes(q));
    document.getElementById('rrkAkunPickerBody').innerHTML = tplRrkAkunPickerRows(filtered);
    wireRows();
  };
}

function rrkSimpan(){
  if(!rrkDraft.namaRatio || !rrkDraft.namaRatio.trim()){
    document.getElementById('fRrkNamaRatioErr').style.display = 'block';
    return;
  }
  document.getElementById('fRrkNamaRatioErr').style.display = 'none';
  if(!rrkDraft.rumus || !rrkDraft.rumus.trim()){
    document.getElementById('fRrkRumusErr').style.display = 'block';
    return;
  }
  document.getElementById('fRrkRumusErr').style.display = 'none';

  const bersih = {
    namaRatio: rrkDraft.namaRatio.trim(),
    tipeRatio: rrkDraft.tipeRatio,
    rumus: rrkDraft.rumus.trim(),
    target: rrkDraft.target || 0,
    items: rrkDraft.items.filter(it => !!it.kode),
  };

  if(rrkEditIndex >= 0){
    DATA.rumusRasioKeuangan[rrkEditIndex] = bersih;
  }else{
    DATA.rumusRasioKeuangan.push(bersih);
  }
  renderRumusRasioKeuanganPage();
}

function openRrkDeleteConfirm(idx){
  const row = DATA.rumusRasioKeuangan[idx];
  rrkOverlay(tplRrkDeleteConfirm(row));
  document.getElementById('modalDelete').onclick = () => {
    DATA.rumusRasioKeuangan.splice(idx, 1);
    closeModal();
    renderRrkTable();
  };
}

function openRrkInfo(title, text){
  rrkOverlay(tplRrkInfoModal(title, text));
  document.getElementById('modalOk').onclick = closeModal;
}
