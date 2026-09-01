/* =========================================================
   LOGIC (JS saja) — Surat Pesanan Ekatalog & Khusus (Customer
   & Penjualan > Daftar Transaksi, page:'spEcatKhusus'). Dimuat
   otomatis (lazy-load) oleh core.js saat menu ini pertama kali
   diklik — lihat PAGE_MODULES di js/core.js. Markup HTML-nya
   ada di file sebelah: sp-ecat-khusus.template.js (catatan
   desain & pemetaan screenshot AAA -> master DBM di headernya).
   NB: closeModal() dipakai bersama, didefinisikan di core.js.

   Alur inti:
   - List: chip bulan FUNGSIONAL (September/Agustus 2026, filter
     substring '/{mm}/' pada r.tgl), pencarian, sort 4 kolom
     (No/Tanggal/Customer/Nilai — Nilai = DPP dihitung via
     speTotals), pagination windowed. Toggle "Closed Manually"
     mengubah status Open<->Closed langsung dari list; toggle
     "Request PDR" tersimpan di baris.
   - Form: pilih Customer (picker) -> kode, alamat, rayon
     (kode/kota/salesman dari master Customer), Piutang BJT
     (= piutang customer) / JT (0), CL = creditLimit & Sisa CL =
     CL - piutang, DL/Sisa DL dari DATA.dominasi milik customer
     (nominalMax / sisa). Principal picker DATA.suppliers.
     Produk picker DATA.items mengisi kode/nama/UOM/harga; Qty &
     Harga Satuan editable, Bo Order mengikuti Qty, Total Harga
     = Qty x Harga; strip rekap (HSxQty/Potongan/DPP/PPN 11%/
     Biaya Kirim/Jumlah Tagihan) recalc live. Upload File &
     Activity Log = modal info (mockup).
   - Simpan validasi: Customer wajib, minimal 1 produk & semua
     baris punya kode produk (modal info, bukan alert browser).
   - No.ID auto: "EP-01M1" + 20 karakter acak A-Z/0-9 (pola
     screenshot), di-generate saat Tambah.
   Data: DATA.spEcatKhusus (12 sample September 2026). */

var speState = { page:1, search:'', sortField:'', sortDir:'asc', bulan:'09' };

function renderSpEcatKhususPage(){
  speState = { page:1, search:'', sortField:'', sortDir:'asc', bulan:'09' };
  renderSpeList();
}

function renderSpeList(){
  content.innerHTML = tplSpeListPage(speState.bulan);
  document.getElementById('btnSpeAdd').onclick = () => openSpeForm('add', null);
  document.getElementById('speSearch').oninput = (e) => { speState.search = e.target.value.trim().toLowerCase(); speState.page = 1; renderSpeTable(); };
  document.getElementById('speFilterBulan').onchange = (e) => { speState.bulan = e.target.value; speState.page = 1; renderSpeTable(); };
  document.getElementById('spePageSize').onchange = () => { speState.page = 1; renderSpeTable(); };
  document.querySelectorAll('[data-spe-sort]').forEach(el => el.onclick = () => {
    const field = el.dataset.speSort;
    if(speState.sortField === field){
      speState.sortDir = speState.sortDir === 'asc' ? 'desc' : 'asc';
    } else {
      speState.sortField = field;
      speState.sortDir = 'asc';
    }
    speState.page = 1;
    renderSpeTable();
  });
  renderSpeTable();
}

function speFilteredSortedRows(){
  const q = speState.search;
  let rows = (DATA.spEcatKhusus || []).filter(r => {
    if(speState.bulan && !(r.tgl || '').includes(`/${speState.bulan}/`)) return false;
    if(!q) return true;
    return r.noId.toLowerCase().includes(q) ||
      (r.customerNama||'').toLowerCase().includes(q) ||
      (r.customerKode||'').toLowerCase().includes(q) ||
      (r.principalNama||'').toLowerCase().includes(q);
  });
  const f = speState.sortField;
  if(f){
    const dir = speState.sortDir === 'desc' ? -1 : 1;
    rows.sort((a,b) => {
      if(f === 'nilai') return (speTotals(a).dpp - speTotals(b).dpp) * dir;
      return String(a[f]||'').localeCompare(String(b[f]||''), 'id') * dir;
    });
  }
  return rows;
}

function spePageSizeVal(){
  const sel = document.getElementById('spePageSize');
  return sel ? parseInt(sel.value, 10) : 10;
}

function renderSpeTable(){
  const perPage = spePageSizeVal();
  const rows = speFilteredSortedRows();
  const totalPages = Math.max(1, Math.ceil(rows.length/perPage));
  if(speState.page > totalPages) speState.page = totalPages;

  const tbody = document.getElementById('speTbody');
  tbody.innerHTML = tplSpeRows(rows, speState.page, perPage);
  document.getElementById('speTotal').textContent = `Total Record: ${rows.length}`;
  document.getElementById('spePager').innerHTML = tplSpePager(speState.page, totalPages);

  ['noId','tgl','customerNama','nilai'].forEach(f => {
    const el = document.getElementById(`speSortIcon_${f}`);
    if(!el) return;
    if(speState.sortField === f){
      el.innerHTML = speState.sortDir === 'asc' ? '&#8593;' : '&#8595;';
      el.style.color = 'var(--blue)';
    } else {
      el.innerHTML = '&#8693;';
      el.style.color = 'var(--text-light)';
    }
  });

  tbody.querySelectorAll('[data-spe-edit]').forEach(b => b.onclick = () => openSpeForm('edit', +b.dataset.speEdit));
  tbody.querySelectorAll('[data-spe-del]').forEach(b => b.onclick = () => openSpeDelete(+b.dataset.speDel));
  tbody.querySelectorAll('[data-spe-closed]').forEach(t => t.onchange = () => {
    DATA.spEcatKhusus[+t.dataset.speClosed].closedManually = t.checked;
    renderSpeTable();
  });
  tbody.querySelectorAll('[data-spe-pdr]').forEach(t => t.onchange = () => {
    DATA.spEcatKhusus[+t.dataset.spePdr].requestPdr = t.checked;
  });

  document.getElementById('spePager').querySelectorAll('[data-spepage]').forEach(b => b.onclick = () => { speState.page = +b.dataset.spepage; renderSpeTable(); });
}

/* No.ID acak pola screenshot: EP-01M1 + 20 karakter A-Z/0-9. */
function speGenerateNoId(){
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let s = 'EP-01M1';
  for(let i = 0; i < 20; i++) s += chars[Math.floor(Math.random() * chars.length)];
  return s;
}

/* Recalc strip rekap dari row + tulis ke DOM. */
function speRecalcStrip(row){
  const t = speTotals(row);
  const set = (id, v) => { const el = document.getElementById(id); if(el) el.textContent = v; };
  set('speHsxq', speNum2(t.hsxq));
  set('spePotongan', speNum2(t.potongan));
  set('speDpp', speNum2(t.dpp));
  set('spePpn', speNum2(t.ppn));
  set('speKirim', t.kirim ? speNum2(t.kirim) : '-');
  set('speTagihan', speNum2(t.tagihan));
}

/* =====================================================================
   FORM add / edit
===================================================================== */
function openSpeForm(mode, idx){
  const src = idx != null ? DATA.spEcatKhusus[idx] : null;
  const row = src ? JSON.parse(JSON.stringify(src)) : {
    noId: speGenerateNoId(), tgl: '01/09/2026',
    soNama: (DATA.salesOffice[0]||{}).nama || '', areaNama: (DATA.area[0]||{}).nama || '',
    customerKode: '', customerNama: '', alamat: '',
    rayonKode: '', rayonKota: '', rayonSalesman: '',
    principalNama: '', noKontrak: '', posisiPaket: '', uploadPo: false, files: [],
    noDsc: '', noDom: '',
    piutangBjt: 0, piutangJt: 0, cl: 0, sisaCl: 0, dl: 0, sisaDl: 0,
    sumberDana: '', metodeBayar: '', potongan: 0, biayaKirim: 0,
    items: [], closedManually: false, requestPdr: false,
  };
  content.innerHTML = tplSpeForm(mode, row);
  speRecalcStrip(row);
  wireSpeItems(row);

  const back = () => renderSpeList();
  document.getElementById('speBatalkan').onclick = (e) => { e.preventDefault(); back(); };
  document.getElementById('btnSpeActivityLog').onclick = () => openSpeInfo('Activity Log', `Riwayat aktivitas dokumen ${row.noId} (mockup): dibuat oleh sidik.`);
  document.getElementById('speUploadFile').onclick = () => {
    row.files = row.files || [];
    const nama = `PO_${row.customerKode || 'CUST'}_${row.files.length + 1}.pdf`;
    row.files.push(nama);
    document.getElementById('speFileBox').innerHTML = row.files.map(f=>`<div>${f}</div>`).join('');
    openSpeInfo('Upload File', `File "${nama}" ditambahkan ke lampiran (mockup — tidak ada file sungguhan yang diunggah).`);
  };
  document.getElementById('fSpeUploadPo').onchange = (e) => { row.uploadPo = e.target.checked; };
  document.getElementById('fSpeSO').onchange = (e) => { row.soNama = e.target.value; };
  document.getElementById('fSpeArea').onchange = (e) => { row.areaNama = e.target.value; };

  document.getElementById('speCustomerSearch').onclick = () => openSpeCustomerPicker((c) => {
    row.customerKode = c.kode;
    row.customerNama = c.nama;
    row.alamat = c.alamat || '';
    row.rayonKota = c.kota || '';
    row.rayonSalesman = c.salesman || '';
    const ray = (DATA.rayon || []).find(x => (x.salesman||'').toUpperCase() === (c.salesman||'').toUpperCase());
    row.rayonKode = ray ? ray.kode : ((DATA.rayon[0]||{}).kode || '');
    row.piutangBjt = Number(c.piutang || 0);
    row.piutangJt = 0;
    row.cl = Number(c.limit || 0);
    row.sisaCl = Math.max(0, Number(c.limit || 0) - Number(c.piutang || 0));
    const dom = (DATA.dominasi || []).find(d => d.customerKode === c.kode);
    row.dl = dom ? Number(dom.nominalMax || 0) : 0;
    row.sisaDl = dom ? Math.max(0, Number(dom.nominalMax || 0) - Number(dom.jumlahPakai || 0)) : 0;
    document.getElementById('fSpeCustomer').value = c.nama.toUpperCase();
    document.getElementById('fSpeCustomerKode').value = c.kode;
    document.getElementById('fSpeAlamat').value = row.alamat;
    document.getElementById('fSpeRayonKode').value = row.rayonKode;
    document.getElementById('fSpeRayonKota').value = row.rayonKota;
    document.getElementById('fSpeRayonSales').value = row.rayonSalesman;
    document.getElementById('fSpeBjt').value = speNum0(row.piutangBjt);
    document.getElementById('fSpeJt').value = speNum0(row.piutangJt);
    document.getElementById('fSpeCl').value = speNum0(row.cl);
    document.getElementById('fSpeSisaCl').value = speNum0(row.sisaCl);
    document.getElementById('fSpeDl').value = speNum0(row.dl);
    document.getElementById('fSpeSisaDl').value = speNum0(row.sisaDl);
  });

  document.getElementById('spePrincipalSearch').onclick = () => openSpePrincipalPicker((s) => {
    row.principalNama = s.nama;
    document.getElementById('fSpePrincipal').value = s.nama;
  });

  document.getElementById('speDscSearch').onclick = () => openSpeDscPicker((no) => {
    row.noDsc = no;
    document.getElementById('fSpeNoDsc').value = no;
  });
  document.getElementById('speDomSearch').onclick = () => openSpeDomPicker((no) => {
    row.noDom = no;
    document.getElementById('fSpeNoDom').value = no;
  });

  document.getElementById('speAddItem').onclick = (e) => {
    e.preventDefault();
    row.items = row.items || [];
    row.items.push({ kode:'', nama:'', uom:'', qty:0, harga:0 });
    wireSpeItems(row);
    speRecalcStrip(row);
  };

  document.getElementById('speSimpan').onclick = () => {
    row.tgl = document.getElementById('fSpeTgl').value.trim();
    row.noKontrak = document.getElementById('fSpeNoKontrak').value.trim();
    row.posisiPaket = document.getElementById('fSpePosisiPaket').value.trim();
    row.sumberDana = document.getElementById('fSpeSumberDana').value.trim();
    row.metodeBayar = document.getElementById('fSpeMetodeBayar').value.trim();
    if(!row.customerKode){ openSpeInfo('Validasi', 'Customer wajib dipilih.'); return; }
    if(!row.tgl){ openSpeInfo('Validasi', 'Tgl Paket wajib diisi.'); return; }
    if(!row.items || !row.items.length){ openSpeInfo('Validasi', 'Rincian produk masih kosong — klik "Tambah Item Baru".'); return; }
    if(row.items.some(it => !it.kode)){ openSpeInfo('Validasi', 'Ada baris produk yang belum dipilih kodenya.'); return; }
    DATA.spEcatKhusus = DATA.spEcatKhusus || [];
    if(mode === 'add') DATA.spEcatKhusus.unshift(row);
    else DATA.spEcatKhusus[idx] = row;
    back();
  };
}

/* ----- Tabel item produk ----- */
function wireSpeItems(row){
  document.getElementById('speItemsBody').innerHTML = tplSpeItemRows(row.items);
  const body = document.getElementById('speItemsBody');
  body.querySelectorAll('[data-spe-item-del]').forEach(b => b.onclick = () => {
    row.items.splice(+b.dataset.speItemDel, 1);
    wireSpeItems(row);
    speRecalcStrip(row);
  });
  body.querySelectorAll('[data-spe-item-pick]').forEach(b => b.onclick = () => {
    const i = +b.dataset.speItemPick;
    openSpeProdukPicker((p) => {
      row.items[i] = { kode: p.kode, nama: p.nama, uom: p.satuan || '', qty: row.items[i].qty || 1, harga: p.harga || 0 };
      wireSpeItems(row);
      speRecalcStrip(row);
    });
  });
  body.querySelectorAll('[data-spe-item-qty]').forEach(inp => inp.oninput = () => {
    const i = +inp.dataset.speItemQty;
    row.items[i].qty = Number(inp.value) || 0;
    body.querySelector(`[data-spe-item-bo="${i}"]`).textContent = speNum0(row.items[i].qty);
    body.querySelector(`[data-spe-item-total="${i}"]`).textContent = speNum2(row.items[i].qty * row.items[i].harga);
    speRecalcStrip(row);
  });
  body.querySelectorAll('[data-spe-item-harga]').forEach(inp => inp.oninput = () => {
    const i = +inp.dataset.speItemHarga;
    row.items[i].harga = Number(inp.value) || 0;
    body.querySelector(`[data-spe-item-total="${i}"]`).textContent = speNum2(row.items[i].qty * row.items[i].harga);
    speRecalcStrip(row);
  });
}

/* =====================================================================
   Modals: hapus, pickers, info
===================================================================== */
function speOverlay(html){
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

function openSpeDelete(idx){
  const row = DATA.spEcatKhusus[idx];
  speOverlay(tplSpeDeleteConfirm(row));
  document.getElementById('modalDelete').onclick = () => {
    DATA.spEcatKhusus.splice(idx, 1);
    closeModal();
    renderSpeTable();
  };
}

function openSpeInfo(title, text){
  speOverlay(tplSpeInfoModal(title, text));
  document.getElementById('modalOk').onclick = closeModal;
}

function openSpeCustomerPicker(onPick){
  const overlay = speOverlay(tplSpeCustomerPicker(DATA.customers));
  const wire = () => overlay.querySelectorAll('[data-pick-customer]').forEach(b => b.onclick = () => {
    const c = DATA.customers.find(x => x.kode === b.dataset.pickCustomer);
    if(c) onPick(c);
    closeModal();
  });
  wire();
  document.getElementById('speCustomerPickerSearch').oninput = (e) => {
    const q = e.target.value.trim().toLowerCase();
    const list = DATA.customers.filter(c => !q || c.kode.toLowerCase().includes(q) || c.nama.toLowerCase().includes(q));
    document.getElementById('speCustomerPickerBody').innerHTML = tplSpeCustomerPickerRows(list);
    wire();
  };
}

function openSpePrincipalPicker(onPick){
  const overlay = speOverlay(tplSpePrincipalPicker(DATA.suppliers));
  const wire = () => overlay.querySelectorAll('[data-pick-principal]').forEach(b => b.onclick = () => {
    const s = DATA.suppliers.find(x => x.kode === b.dataset.pickPrincipal);
    if(s) onPick(s);
    closeModal();
  });
  wire();
  document.getElementById('spePrincipalPickerSearch').oninput = (e) => {
    const q = e.target.value.trim().toLowerCase();
    const list = DATA.suppliers.filter(s => !q || s.kode.toLowerCase().includes(q) || s.nama.toLowerCase().includes(q));
    document.getElementById('spePrincipalPickerBody').innerHTML = tplSpePrincipalPickerRows(list);
    wire();
  };
}

function openSpeProdukPicker(onPick){
  const overlay = speOverlay(tplSpeProdukPicker(DATA.items));
  const wire = () => overlay.querySelectorAll('[data-pick-produk]').forEach(b => b.onclick = () => {
    const p = DATA.items.find(x => x.kode === b.dataset.pickProduk);
    if(p) onPick(p);
    closeModal();
  });
  wire();
  document.getElementById('speProdukPickerSearch').oninput = (e) => {
    const q = e.target.value.trim().toLowerCase();
    const list = DATA.items.filter(p => !q || p.kode.toLowerCase().includes(q) || p.nama.toLowerCase().includes(q));
    document.getElementById('speProdukPickerBody').innerHTML = tplSpeProdukPickerRows(list);
    wire();
  };
}

function openSpeDscPicker(onPick){
  const overlay = speOverlay(tplSpeDscPicker(SPE_DSC_LIST));
  overlay.querySelectorAll('[data-pick-dsc]').forEach(b => b.onclick = () => {
    onPick(b.dataset.pickDsc);
    closeModal();
  });
}

function openSpeDomPicker(onPick){
  const overlay = speOverlay(tplSpeDomPicker(DATA.dominasi || []));
  overlay.querySelectorAll('[data-pick-dom]').forEach(b => b.onclick = () => {
    onPick(b.dataset.pickDom);
    closeModal();
  });
}
