/* =========================================================
   LOGIC (JS saja) — T3F / Tanda Terima Tukar Faktur (Customer
   & Penjualan > Daftar Transaksi, key page:'t3f'). Dimuat
   otomatis (lazy-load) oleh core.js — lihat PAGE_MODULES di
   js/core.js. Markup di file sebelah: t3f.template.js (catatan
   desain, pemetaan screenshot SDL -> DBM & rincian 2 cetakan
   di headernya).
   NB: closeModal() dipakai bersama, didefinisikan di core.js.

   Alur inti:
   - List: chip Semua/September/Agustus fungsional, sort 6
     kolom, pagination windowed, pencarian. Aksi per baris:
     Terima (modal Update Tanggal Terima -> isi kolom Tgl.
     Terima Customer), Attach File (modal Choose File + Simpan
     — nama file tersimpan di baris, mockup), Cetak (dropdown
     Full Page / Half Page -> preview cetakan replika PDF),
     Hapus (konfirmasi), link No. Transaksi -> Ubah.
   - Form: pilih Customer -> faktur outstanding customer dari
     DATA.fakturPenjualanSJ tampil ber-checkbox (snapshot no/
     noSJ (dariSJ)/tglFaktur/tglJatuhTempo/kurs IDR/poCustomer/
     jumlahAkhir); salesman auto dari faktur pertama customer;
     Jumlah = Σ tercentang, recalc live; Simpan validasi
     customer + minimal 1 faktur tercentang; Cetak dan Simpan
     membuka cetakan Full Page setelah tersimpan. Nomor
     26/AL/HO/09/{urut 5 digit} (form selalu HO Sept seperti
     screenshot; sample data memakai cabang faktur masing2).
   Data: DATA.t3f (8 sample Agustus 2026 dari faktur DBM). */

var t3fState = { page:1, search:'', sortField:'', sortDir:'asc', bulan:'' };

function renderT3fPage(){
  t3fState = { page:1, search:'', sortField:'', sortDir:'asc', bulan:'' };
  renderT3fList();
}

function renderT3fList(){
  content.innerHTML = tplT3fListPage(t3fState.bulan);
  document.getElementById('btnT3fAdd').onclick = () => openT3fForm('add', null);
  document.getElementById('t3fSearch').oninput = (e) => { t3fState.search = e.target.value.trim().toLowerCase(); t3fState.page = 1; renderT3fTable(); };
  document.getElementById('t3fFilterBulan').onchange = (e) => { t3fState.bulan = e.target.value; t3fState.page = 1; renderT3fTable(); };
  document.getElementById('t3fPageSize').onchange = () => { t3fState.page = 1; renderT3fTable(); };
  document.querySelectorAll('[data-t3f-sort]').forEach(el => el.onclick = () => {
    const field = el.dataset.t3fSort;
    if(t3fState.sortField === field){
      t3fState.sortDir = t3fState.sortDir === 'asc' ? 'desc' : 'asc';
    } else {
      t3fState.sortField = field;
      t3fState.sortDir = 'asc';
    }
    t3fState.page = 1;
    renderT3fTable();
  });
  renderT3fTable();
}

function t3fFilteredSortedRows(){
  const q = t3fState.search;
  let rows = (DATA.t3f || []).filter(r => {
    if(t3fState.bulan && !(r.tgl || '').includes(`/${t3fState.bulan}/`)) return false;
    if(!q) return true;
    return r.no.toLowerCase().includes(q) ||
      (r.customerNama||'').toLowerCase().includes(q) ||
      t3fNoFakturJoin(r).toLowerCase().includes(q) ||
      (r.keterangan||'').toLowerCase().includes(q);
  });
  const f = t3fState.sortField;
  if(f){
    const dir = t3fState.sortDir === 'desc' ? -1 : 1;
    rows.sort((a,b) => {
      if(f === 'jumlahAkhir') return (t3fJumlahAkhir(a) - t3fJumlahAkhir(b)) * dir;
      if(f === 'noFaktur') return t3fNoFakturJoin(a).localeCompare(t3fNoFakturJoin(b), 'id') * dir;
      return String(a[f]||'').localeCompare(String(b[f]||''), 'id') * dir;
    });
  }
  return rows;
}

function t3fPageSizeVal(){
  const sel = document.getElementById('t3fPageSize');
  return sel ? parseInt(sel.value, 10) : 10;
}

function renderT3fTable(){
  const perPage = t3fPageSizeVal();
  const rows = t3fFilteredSortedRows();
  const totalPages = Math.max(1, Math.ceil(rows.length/perPage));
  if(t3fState.page > totalPages) t3fState.page = totalPages;

  const tbody = document.getElementById('t3fTbody');
  tbody.innerHTML = tplT3fRows(rows, t3fState.page, perPage);
  document.getElementById('t3fTotal').textContent = `Total Record: ${rows.length}`;
  document.getElementById('t3fPager').innerHTML = tplT3fPager(t3fState.page, totalPages);

  ['no','customerNama','tgl','noFaktur','jumlahAkhir','tglTerimaCustomer'].forEach(f => {
    const el = document.getElementById(`t3fSortIcon_${f}`);
    if(!el) return;
    if(t3fState.sortField === f){
      el.innerHTML = t3fState.sortDir === 'asc' ? '&#8593;' : '&#8595;';
      el.style.color = 'var(--blue)';
    } else {
      el.innerHTML = '&#8693;';
      el.style.color = 'var(--text-light)';
    }
  });

  tbody.querySelectorAll('[data-t3f-edit]').forEach(b => b.onclick = () => openT3fForm('edit', +b.dataset.t3fEdit));
  tbody.querySelectorAll('[data-t3f-del]').forEach(b => b.onclick = () => openT3fDelete(+b.dataset.t3fDel));
  tbody.querySelectorAll('[data-t3f-terima]').forEach(b => b.onclick = () => openT3fTerima(+b.dataset.t3fTerima));
  tbody.querySelectorAll('[data-t3f-attach]').forEach(b => b.onclick = () => openT3fAttach(+b.dataset.t3fAttach));
  tbody.querySelectorAll('[data-t3f-cetak]').forEach(b => b.onclick = (e) => { e.stopPropagation(); openT3fCetakMenu(b, +b.dataset.t3fCetak); });

  document.getElementById('t3fPager').querySelectorAll('[data-t3fpage]').forEach(b => b.onclick = () => { t3fState.page = +b.dataset.t3fpage; renderT3fTable(); });
}

/* Dropdown kecil Full Page / Half Page di kolom Cetak. */
function closeT3fCetakMenu(){
  const m = document.getElementById('t3fCetakMenu');
  if(m) m.remove();
  document.removeEventListener('click', closeT3fCetakMenu);
}

function openT3fCetakMenu(btn, idx){
  closeT3fCetakMenu();
  const wrap = document.createElement('div');
  wrap.innerHTML = tplT3fCetakMenu(idx);
  const menu = wrap.firstElementChild;
  document.body.appendChild(menu);
  const rect = btn.getBoundingClientRect();
  menu.style.position = 'fixed';
  menu.style.top = (rect.bottom + 4) + 'px';
  menu.style.left = Math.max(8, rect.right - 120) + 'px';
  menu.querySelector('[data-t3f-cetak-full]').onclick = () => { closeT3fCetakMenu(); openT3fCetak(DATA.t3f[idx], 'full'); };
  menu.querySelector('[data-t3f-cetak-half]').onclick = () => { closeT3fCetakMenu(); openT3fCetak(DATA.t3f[idx], 'half'); };
  setTimeout(() => document.addEventListener('click', closeT3fCetakMenu), 0);
}

/* Nomor otomatis: 26/AL/HO/09/00001, ... (form selalu HO/09). */
function t3fGenerateNo(){
  const prefix = '26/AL/HO/09/';
  let max = 0;
  (DATA.t3f || []).forEach(r => {
    if(r.no && r.no.startsWith(prefix)){
      const n = parseInt(r.no.slice(prefix.length), 10);
      if(!isNaN(n) && n > max) max = n;
    }
  });
  return prefix + String(max + 1).padStart(5, '0');
}

/* Faktur outstanding milik customer utk tabel form. */
function t3fFakturListFor(customerKode){
  return (DATA.fakturPenjualanSJ || []).filter(f => f.customerKode === customerKode).map(f => ({
    no: f.no, noSJ: f.dariSJ || '', tglFaktur: f.tglFaktur || '', tglJthTempo: f.tglJatuhTempo || '',
    kurs: 'IDR', po: f.poCustomer || '', jumlah: Number(f.jumlahAkhir || 0),
  }));
}

/* =====================================================================
   FORM add / edit
===================================================================== */
function openT3fForm(mode, idx){
  const src = idx != null ? DATA.t3f[idx] : null;
  const row = src ? JSON.parse(JSON.stringify(src)) : {
    no: t3fGenerateNo(), tgl: '01/09/2026', cabang: 'Head Office',
    customerKode: '', customerNama: '', customerAlamat: '', salesman: '',
    keterangan: '', fakturs: [], tglTerimaCustomer: '', attachFile: '',
  };
  let fakturList = row.customerKode ? t3fFakturListFor(row.customerKode) : [];
  // baris tersimpan yang tidak ada lagi di sumber tetap ditampilkan (tercentang)
  (row.fakturs||[]).forEach(f => { if(!fakturList.some(x => x.no === f.no)) fakturList.push(f); });
  content.innerHTML = tplT3fForm(mode, row, fakturList);

  const back = () => renderT3fList();
  document.getElementById('t3fBatalkan').onclick = (e) => { e.preventDefault(); back(); };
  document.getElementById('btnT3fTutorial').onclick = () => openT3fInfo('Tutorial', 'Video tutorial T3F (Tanda Terima Tukar Faktur) tersedia di portal MASERP (mockup).');

  const wireFakturs = () => {
    document.getElementById('t3fFakturBody').innerHTML = tplT3fFakturRows(fakturList, row);
    document.querySelectorAll('[data-t3f-cek]').forEach(cb => cb.onchange = () => {
      const f = fakturList[+cb.dataset.t3fCek];
      if(cb.checked){
        if(!row.fakturs.some(x => x.no === f.no)) row.fakturs.push(JSON.parse(JSON.stringify(f)));
      } else {
        row.fakturs = row.fakturs.filter(x => x.no !== f.no);
      }
      document.getElementById('fT3fJumlah').value = t3fNum2(t3fJumlahAkhir(row));
    });
  };
  wireFakturs();

  document.getElementById('t3fCustomerSearch').onclick = () => openT3fCustomerPicker((c) => {
    row.customerKode = c.kode;
    row.customerNama = c.nama;
    row.customerAlamat = c.alamat || '';
    row.fakturs = [];
    fakturList = t3fFakturListFor(c.kode);
    row.salesman = fakturList.length ? '' : (c.salesman || '');
    // salesman default: dari faktur pertama customer (kolom salesman DATA.fakturPenjualanSJ), fallback salesman master customer
    const src0 = (DATA.fakturPenjualanSJ || []).find(f => f.customerKode === c.kode);
    row.salesman = (src0 && src0.salesman) || c.salesman || '';
    document.getElementById('fT3fCustomer').value = c.nama.toUpperCase();
    document.getElementById('fT3fSalesman').value = row.salesman;
    document.getElementById('fT3fJumlah').value = t3fNum2(0);
    wireFakturs();
  });

  const doSave = () => {
    row.tgl = document.getElementById('fT3fTgl').value.trim();
    row.salesman = document.getElementById('fT3fSalesman').value.trim();
    row.keterangan = document.getElementById('fT3fKeterangan').value;
    if(!row.customerKode){ openT3fInfo('Validasi', 'Customer wajib dipilih.'); return false; }
    if(!row.tgl){ openT3fInfo('Validasi', 'Tgl. T3F wajib diisi.'); return false; }
    if(!row.fakturs || !row.fakturs.length){ openT3fInfo('Validasi', 'Belum ada faktur yang dicentang.'); return false; }
    DATA.t3f = DATA.t3f || [];
    if(mode === 'add') DATA.t3f.unshift(row);
    else DATA.t3f[idx] = row;
    return true;
  };
  document.getElementById('t3fSimpan').onclick = () => { if(doSave()) back(); };
  document.getElementById('t3fCetakSimpan').onclick = () => {
    if(doSave()){ back(); openT3fCetak(row, 'full'); }
  };
}

/* =====================================================================
   Modals: terima, attach, cetak, hapus, picker, info
===================================================================== */
function t3fOverlay(html){
  closeModal();
  closeT3fCetakMenu();
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

function openT3fTerima(idx){
  const row = DATA.t3f[idx];
  t3fOverlay(tplT3fTerimaModal(row));
  document.getElementById('t3fSubmitTerima').onclick = () => {
    row.tglTerimaCustomer = document.getElementById('fT3fTglTerima').value.trim();
    closeModal();
    renderT3fTable();
  };
}

function openT3fAttach(idx){
  const row = DATA.t3f[idx];
  t3fOverlay(tplT3fAttachModal(row));
  document.getElementById('t3fSimpanFile').onclick = () => {
    const inp = document.getElementById('fT3fFile');
    if(!inp.files || !inp.files.length){
      openT3fInfo('Attach File', 'Pilih file terlebih dahulu.');
      return;
    }
    row.attachFile = inp.files[0].name;
    closeModal();
    openT3fInfo('Attach File', `File "${row.attachFile}" dilampirkan ke ${row.no} (mockup — file tidak benar-benar diunggah).`);
    renderT3fTable();
  };
}

function openT3fCetak(row, tipe){
  t3fOverlay(tipe === 'half' ? tplT3fCetakHalf(row) : tplT3fCetakFull(row));
}

function openT3fDelete(idx){
  const row = DATA.t3f[idx];
  t3fOverlay(tplT3fDeleteConfirm(row));
  document.getElementById('modalDelete').onclick = () => {
    DATA.t3f.splice(idx, 1);
    closeModal();
    renderT3fTable();
  };
}

function openT3fInfo(title, text){
  t3fOverlay(tplT3fInfoModal(title, text));
  document.getElementById('modalOk').onclick = closeModal;
}

function openT3fCustomerPicker(onPick){
  const overlay = t3fOverlay(tplT3fCustomerPicker(DATA.customers));
  const wire = () => overlay.querySelectorAll('[data-pick-customer]').forEach(b => b.onclick = () => {
    const c = DATA.customers.find(x => x.kode === b.dataset.pickCustomer);
    if(c) onPick(c);
    closeModal();
  });
  wire();
  document.getElementById('t3fCustomerPickerSearch').oninput = (e) => {
    const q = e.target.value.trim().toLowerCase();
    const list = DATA.customers.filter(c => !q || c.kode.toLowerCase().includes(q) || c.nama.toLowerCase().includes(q));
    document.getElementById('t3fCustomerPickerBody').innerHTML = tplT3fCustomerPickerRows(list);
    wire();
  };
}
