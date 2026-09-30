/* =========================================================
   LOGIC (JS saja) — Claim Customer (page:'claimCustomer'). Dimuat
   otomatis (lazy-load) oleh core.js — lihat PAGE_MODULES. Markup HTML
   ada di file sebelah: claim-customer.template.js. Data:
   DATA.claimCustomer (js/data.js, dokumen terbaru di depan array).

   Alur status di modul ini (sisanya di Pengajuan/Penyelesaian Claim):
     Draft --Simpan & Kirim untuk Approval--> Approval (Menunggu)
     Approval --approver Setujui--> Approval (Disetujui, siap diajukan)
     Approval --approver Tolak / Batalkan Claim--> Dibatalkan
     Disetujui/Diproses/Selesai (off faktur) --Buat Nota Kredit /
       Kirim Barang Bonus--> status ke customer berubah (bukan status
       ke principal).
   Form Tambah/Ubah bekerja pada SALINAN (`clmRow`) — baru ditulis ke
   DATA saat Simpan, supaya Batalkan tidak meninggalkan perubahan.
   `openClmFormByNo(no)` dipakai modul lain (Monitoring/Pengajuan/
   Penyelesaian) lewat goToPage() untuk langsung membuka 1 claim.
========================================================= */

let clmState = { page:1, search:'', status:'' };
let clmRow = null;      // salinan kerja form Tambah/Ubah
let clmEditIdx = -1;    // index DATA.claimCustomer yg sedang diubah (-1 = tambah)

function renderClaimCustomerPage(){
  content.innerHTML = tplClmListPage(clmState.status);
  clmState.page = 1; clmState.search = '';
  document.getElementById('btnClmAdd').onclick = () => openClmForm('add');
  document.getElementById('clmFilterStatus').onchange = (e) => { clmState.status = e.target.value; clmState.page = 1; renderClmTable(); };
  document.getElementById('clmPageSize').onchange = () => { clmState.page = 1; renderClmTable(); };
  document.getElementById('clmSearch').oninput = (e) => { clmState.search = e.target.value.trim().toLowerCase(); clmState.page = 1; renderClmTable(); };
  renderClmTable();
}

function renderClmTable(){
  const q = clmState.search;
  const perPage = parseInt(document.getElementById('clmPageSize').value, 10) || 10;
  const rows = DATA.claimCustomer.filter(r => (!clmState.status || r.status === clmState.status) && (!q ||
    r.no.toLowerCase().includes(q) || r.customerNama.toLowerCase().includes(q) || r.principalNama.toLowerCase().includes(q) ||
    r.jenis.toLowerCase().includes(q) || (r.keterangan||'').toLowerCase().includes(q)));
  const totalPages = Math.max(1, Math.ceil(rows.length / perPage));
  if(clmState.page > totalPages) clmState.page = totalPages;
  document.getElementById('clmTbody').innerHTML = tplClmRows(rows, clmState.page, perPage);
  document.getElementById('clmTotal').textContent = `Total Record: ${rows.length}`;
  document.getElementById('clmPager').innerHTML = tplClmPager(clmState.page, totalPages);
  const tbody = document.getElementById('clmTbody');
  tbody.querySelectorAll('[data-open]').forEach(b => b.onclick = () => {
    const r = DATA.claimCustomer[+b.dataset.open];
    openClmForm(r.status === 'Draft' ? 'edit' : 'view', +b.dataset.open);
  });
  tbody.querySelectorAll('[data-del]').forEach(b => b.onclick = () => openClmDelete(+b.dataset.del));
  document.querySelectorAll('[data-clmpage]').forEach(b => b.onclick = () => { clmState.page = +b.dataset.clmpage; renderClmTable(); });
}

function openClmFormByNo(no){
  const idx = DATA.claimCustomer.findIndex(c => c.no === no);
  if(idx < 0) return;
  openClmForm(DATA.claimCustomer[idx].status === 'Draft' ? 'edit' : 'view', idx);
}

function clmEmptyRow(){
  return { no:'', tgl:claimToday(), cabang:'Head Office', customerKode:'', customerNama:'', principalKode:'', principalNama:'',
    jenis:'Biaya Promosi', cara:'Off Faktur', promotionKode:'', periodeAwal:'', periodeAkhir:'', noSurat:'', tglSurat:'', keterangan:'',
    items:[], nilaiClaim:0, nilaiAcc:0, nilaiDipulihkan:0, status:'Draft', approvalInternal:'', noPengajuan:'', alasanTolak:'',
    notaKredit:null, bonusDikirim:null, pemulihan:[], riwayat:[] };
}

function openClmForm(mode, idx){
  closeModal();
  clmEditIdx = mode === 'add' ? -1 : idx;
  clmRow = mode === 'view' ? null
    : (mode === 'add' ? clmEmptyRow() : JSON.parse(JSON.stringify(DATA.claimCustomer[idx])));
  clmRenderForm(mode, mode === 'view' ? DATA.claimCustomer[idx] : clmRow);
  window.scrollTo(0, 0);
}

/* Render + bind form. Dipanggil ulang (tanpa membuat salinan baru)
   setelah ganti principal supaya daftar Promotion ikut tersaring. */
function clmRenderForm(mode, row){
  content.innerHTML = tplClmForm(mode, row);
  document.querySelectorAll('[data-clm-tab]').forEach(btn => btn.onclick = () => {
    document.querySelectorAll('[data-clm-tab]').forEach(b => b.classList.toggle('active', b === btn));
    document.querySelectorAll('[data-clm-panel]').forEach(p => p.style.display = p.dataset.clmPanel === btn.dataset.clmTab ? '' : 'none');
  });
  document.getElementById('clmTutup').onclick = (e) => { e.preventDefault(); renderClaimCustomerPage(); };
  document.querySelectorAll('[data-clm-goto]').forEach(b => b.onclick = () => claimGoToDok(b.dataset.clmGoto));
  if(mode === 'view') return bindClmViewActions(row);

  document.getElementById('clmCustomerSearch').onclick = () => openClmCustomerPicker();
  document.getElementById('clmPrincipalSearch').onclick = () => openClaimSupplierPicker(s => {
    clmReadHeader();
    clmRow.principalKode = s.kode; clmRow.principalNama = s.nama;
    if(clmRow.promotionKode){
      const pr = DATA.promotion.find(x => x.kode === clmRow.promotionKode);
      if(pr && pr.principalKode && pr.principalKode !== s.kode) clmRow.promotionKode = '';
    }
    clmRenderForm(mode, clmRow);
  });
  document.getElementById('clmTarikFaktur').onclick = () => openClmFakturPicker();
  document.getElementById('clmAddItem').onclick = (e) => {
    e.preventDefault();
    clmReadItems();
    clmRow.items.push({ noFaktur:'', kode:'', nama:'', qty:1, satuan:'', hna:0, nilai:0 });
    clmRenderItems();
  };
  document.getElementById('clmSimpan').onclick = () => clmSave(false);
  document.getElementById('clmSimpanKirim').onclick = () => clmSave(true);
  bindClmItemEvents();
}

/* Header dibaca ke `clmRow` sebelum form di-render ulang. */
function clmReadHeader(){
  const v = id => document.getElementById(id).value.trim();
  Object.assign(clmRow, {
    cabang: v('fClmCabang'), tgl: v('fClmTgl'), jenis: v('fClmJenis'), cara: v('fClmCara'), promotionKode: v('fClmPromotion'),
    periodeAwal: v('fClmPeriodeAwal'), periodeAkhir: v('fClmPeriodeAkhir'), noSurat: v('fClmNoSurat'), tglSurat: v('fClmTglSurat'),
    keterangan: document.getElementById('fClmKeterangan').value.trim(),
  });
  clmReadItems();
}

function clmReadItems(){
  if(!clmRow) return;
  clmRow.items.forEach((it, i) => {
    const g = (a) => document.querySelector(`[data-clm-item-${a}="${i}"]`);
    if(!g('nama')) return;
    it.nama = g('nama').value; it.satuan = g('satuan').value;
    it.qty = parseFloat(g('qty').value) || 0; it.hna = parseFloat(g('hna').value) || 0; it.nilai = parseFloat(g('nilai').value) || 0;
  });
  clmRecalc();
}
function clmRecalc(){
  clmRow.nilaiClaim = Math.round(clmRow.items.reduce((a, it) => a + (it.nilai || 0), 0) * 100) / 100;
  const el = document.getElementById('fClmNilaiClaim');
  if(el) el.value = claimNum2(clmRow.nilaiClaim);
}
function clmRenderItems(){
  document.getElementById('clmItemsBody').innerHTML = tplClmItemRows(clmRow.items, true);
  clmRecalc();
  bindClmItemEvents();
}
function bindClmItemEvents(){
  const body = document.getElementById('clmItemsBody');
  /* Qty / HNA berubah → Nilai = Qty × HNA (baris manual). Nilai tetap
     boleh diketik langsung (mis. biaya promosi paket tanpa qty). */
  body.querySelectorAll('[data-clm-item-qty],[data-clm-item-hna]').forEach(inp => inp.oninput = () => {
    const i = +(inp.dataset.clmItemQty ?? inp.dataset.clmItemHna);
    const qty = parseFloat(body.querySelector(`[data-clm-item-qty="${i}"]`).value) || 0;
    const hna = parseFloat(body.querySelector(`[data-clm-item-hna="${i}"]`).value) || 0;
    body.querySelector(`[data-clm-item-nilai="${i}"]`).value = Math.round(qty * hna * 100) / 100;
    clmReadItems();
  });
  body.querySelectorAll('[data-clm-item-nilai],[data-clm-item-nama],[data-clm-item-satuan]').forEach(inp => inp.oninput = () => clmReadItems());
  body.querySelectorAll('[data-clm-item-del]').forEach(b => b.onclick = () => {
    clmReadItems(); clmRow.items.splice(+b.dataset.clmItemDel, 1); clmRenderItems();
  });
  body.querySelectorAll('[data-clm-item-barang]').forEach(b => b.onclick = () => {
    clmReadItems();
    const i = +b.dataset.clmItemBarang;
    openPersediaanPicker(document.getElementById('fClmCabang').value, p => {
      const master = DATA.items.find(x => x.kode === p.kodeBarang);
      const it = clmRow.items[i];
      Object.assign(it, { kode:p.kodeBarang, nama:p.namaBarang, satuan:p.satuan, hna: master ? master.harga : it.hna });
      it.nilai = Math.round((it.qty || 0) * (it.hna || 0) * 100) / 100;
      clmRenderItems();
    });
  });
}

function openClmCustomerPicker(){
  closeModal();
  /* Customer principal (terhubung ke supplier) tidak bisa mengajukan claim. */
  const base = DATA.customers.filter(c => !isCustomerPrincipal(c) && c.status !== 'Non Aktif');
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.innerHTML = tplClmCustomerPicker(base);
  document.body.appendChild(overlay);
  document.getElementById('modalClose').onclick = closeModal;
  document.getElementById('modalCancel').onclick = closeModal;
  overlay.onclick = (e) => { if(e.target === overlay) closeModal(); };
  const bind = () => overlay.querySelectorAll('[data-clm-pick-cust]').forEach(b => b.onclick = () => {
    const c = DATA.customers.find(x => x.kode === b.dataset.clmPickCust);
    clmRow.customerKode = c.kode; clmRow.customerNama = c.nama;
    document.getElementById('fClmCustomer').value = c.nama;
    closeModal();
  });
  document.getElementById('clmCustSearch').oninput = (e) => {
    const q = e.target.value.trim().toLowerCase();
    document.getElementById('clmCustBody').innerHTML = tplClmCustomerRows(base.filter(c => !q || c.kode.toLowerCase().includes(q) || c.nama.toLowerCase().includes(q)));
    bind();
  };
  bind();
}

/* Baris faktur yang sudah pernah diklaim (claim lain yg tidak Dibatalkan)
   tidak ditampilkan lagi — mencegah 1 baris faktur diklaim dua kali. */
function clmSudahDiklaim(){
  const set = new Set();
  DATA.claimCustomer.forEach((c, i) => {
    if(i === clmEditIdx || c.status === 'Dibatalkan') return;
    c.items.forEach(it => { if(it.noFaktur) set.add(it.noFaktur + '|' + it.kode); });
  });
  clmRow.items.forEach(it => { if(it.noFaktur) set.add(it.noFaktur + '|' + it.kode); });
  return set;
}
function openClmFakturPicker(){
  clmReadHeader();
  if(!clmRow.customerKode){
    document.getElementById('fClmCustomerErr').style.display = 'block';
    return;
  }
  const jenis = clmRow.jenis;
  const used = clmSudahDiklaim();
  const lines = [];
  DATA.fakturPenjualanSJ.filter(f => f.customerKode === clmRow.customerKode && (!clmRow.principalKode || f.principalKode === clmRow.principalKode))
    .forEach(f => (f.items||[]).forEach(it => {
      if(used.has(f.no + '|' + it.kode)) return;
      if(jenis === 'Biaya Promosi' && !(it.discPrincipal > 0)) return;
      const nilai = jenis === 'Biaya Promosi' ? Math.round(it.qtyPhysical * it.hna1 * it.discPrincipal) / 100 : 0;
      lines.push({ noFaktur:f.no, tgl:f.tglFaktur, kode:it.kode, nama:it.nama, qty:it.qtyPhysical, satuan:it.um, hna:it.hna1, discPrincipal:it.discPrincipal||0, nilai });
    }));
  closeModal();
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.innerHTML = tplClmFakturPicker(lines, jenis);
  document.body.appendChild(overlay);
  document.getElementById('modalClose').onclick = closeModal;
  document.getElementById('modalCancel').onclick = closeModal;
  overlay.onclick = (e) => { if(e.target === overlay) closeModal(); };
  document.getElementById('clmFktTambah').onclick = () => {
    overlay.querySelectorAll('[data-clm-fkt]:checked').forEach(cb => {
      const l = lines[+cb.dataset.clmFkt];
      clmRow.items.push(jenis === 'Biaya Promosi'
        ? { noFaktur:l.noFaktur, kode:l.kode, nama:`${l.nama} (Disc. Principal ${l.discPrincipal}%)`, qty:l.qty, satuan:l.satuan, hna:l.hna, nilai:l.nilai }
        : { noFaktur:l.noFaktur, kode:l.kode, nama:`${l.nama} (bonus)`, qty:0, satuan:l.satuan, hna:l.hna, nilai:0, qtyEditable:true });
    });
    closeModal();
    clmRenderItems();
  };
}

function clmSave(kirimApproval){
  clmReadHeader();
  let ok = true;
  const show = (id, cond) => { document.getElementById(id).style.display = cond ? 'block' : 'none'; if(cond) ok = false; };
  show('fClmCustomerErr', !clmRow.customerKode);
  show('fClmPrincipalErr', !clmRow.principalKode);
  show('fClmItemsErr', !clmRow.items.some(it => it.nilai > 0));
  if(!ok) return;
  clmRow.items = clmRow.items.filter(it => it.nilai > 0 || it.nama);
  const baru = clmEditIdx < 0;
  if(baru){
    clmRow.no = claimNextNo(DATA.claimCustomer, `26/CLM/${claimCabangKode(clmRow.cabang)}/${(clmRow.tgl||claimToday()).slice(3,5)}/`, 5);
    claimLog(clmRow, 'Draft', 'Claim dibuat');
    DATA.claimCustomer.unshift(clmRow);
    clmEditIdx = 0;
  } else {
    claimLog(clmRow, 'Draft', 'Claim diubah');
    DATA.claimCustomer[clmEditIdx] = clmRow;
  }
  const saved = DATA.claimCustomer[clmEditIdx];
  if(kirimApproval){
    saved.status = 'Approval'; saved.approvalInternal = 'Menunggu';
    claimLog(saved, 'Approval', 'Dikirim untuk approval internal');
  }
  clmRow = null;
  openClmForm(kirimApproval ? 'view' : 'edit', clmEditIdx);
}

function openClmDelete(idx){
  const r = DATA.claimCustomer[idx];
  clmConfirm('Hapus Claim', `Yakin ingin menghapus claim <b>${r.no}</b> — ${r.customerNama} (${claimNum2(r.nilaiClaim)})?`, 'Hapus', 'btn-danger', () => {
    DATA.claimCustomer.splice(idx, 1);
    renderClmTable();
  });
}

function clmConfirm(title, html, btnLabel, btnClass, onOk){
  closeModal();
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.innerHTML = tplClmConfirm(title, html, btnLabel, btnClass);
  document.body.appendChild(overlay);
  document.getElementById('modalClose').onclick = closeModal;
  document.getElementById('modalCancel').onclick = closeModal;
  overlay.onclick = (e) => { if(e.target === overlay) closeModal(); };
  document.getElementById('modalOk').onclick = () => { closeModal(); onOk(); };
}

/* ===================== AKSI MODE LIHAT ===================== */
function bindClmViewActions(row){
  const idx = DATA.claimCustomer.indexOf(row);
  const reopen = () => openClmForm('view', idx);
  const on = (id, fn) => { const el = document.getElementById(id); if(el) el.onclick = fn; };

  on('clmApprover', () => openClmApprover(row, reopen));
  on('clmBatal', () => clmConfirm('Batalkan Claim', `Claim <b>${row.no}</b> akan dibatalkan dan tidak bisa diajukan ke principal.`, 'Batalkan Claim', 'btn-danger', () => {
    row.status = 'Dibatalkan'; row.approvalInternal = row.approvalInternal || '';
    claimLog(row, 'Dibatalkan', 'Claim dibatalkan sebelum diajukan ke principal');
    reopen();
  }));
  on('clmKePengajuan', () => goToPage('pengajuanClaim', 'Pengajuan Claim Principal', () => {
    if(typeof openPclForm === 'function') openPclForm('add', -1, row.principalKode);
  }));
  on('clmBuatNK', () => clmConfirm('Buat Nota Kredit Terbuka',
    `Nota Kredit terbuka senilai <b>${claimNum2(row.nilaiAcc)}</b> (Nilai ACC principal${row.nilaiAcc < row.nilaiClaim ? `, claim customer dikurangi dari ${claimNum2(row.nilaiClaim)}` : ''}) akan dibuat di <b>Transaksi A.R.</b> untuk <b>${row.customerNama}</b>.<br><br>
     Nota Kredit tidak langsung dialokasikan — customer memakainya untuk melunasi faktur lain di Penerimaan Piutang.<br>
     Jurnal: D 1120006 Piutang Claim Principal / K 1120001 Piutang Usaha.`, 'Buat Nota Kredit', 'btn-teal', () => {
      const no = claimBuatNotaKredit(row);
      reopen();
      openClaimInfo('Nota Kredit dibuat', `Transaksi A.R. <b>${no}</b> (Nota Kredit) sudah dibuat untuk ${row.customerNama}. Lihat di menu Transaksi A.R. atau tab Dokumen Terkait.`);
    }));
  on('clmKirimBonus', () => clmConfirm('Kirim Barang Bonus ke Customer',
    `Barang bonus senilai <b>${claimNum2(row.nilaiAcc)}</b> dikirim ke <b>${row.customerNama}</b> lewat Klaim Bonus Item.<br><br>
     Jurnal: D 1120006 Piutang Claim Principal / K 1130001 Persediaan Barang Dagang.<br>
     <span style="color:var(--text-light);font-size:12px;">Menu Klaim Bonus Item masih placeholder — nomor dokumen dicatat di claim ini.</span>`, 'Kirim Bonus', 'btn-teal', () => {
      const t = claimToday();
      const no = `KBI/${claimCabangKode(row.cabang)}/${t.slice(8,10)}${t.slice(3,5)}/${claimPad(DATA.claimCustomer.filter(c => c.bonusDikirim).length + 1, 4)}`;
      row.bonusDikirim = { no, tgl:t, nilai:row.nilaiAcc };
      claimLog(row, row.status, `Barang bonus dikirim ke ${row.customerNama} lewat Klaim Bonus Item ${no}`);
      reopen();
    }));
  on('clmKePenyelesaian', () => goToPage('penyelesaianClaim', 'Penyelesaian Claim', () => {
    if(typeof openPnyForm === 'function') openPnyForm('add', -1, row.no);
  }));
}

function openClmApprover(row, done){
  closeModal();
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.innerHTML = tplClmApproverModal(row);
  document.body.appendChild(overlay);
  document.getElementById('modalClose').onclick = closeModal;
  document.getElementById('modalCancel').onclick = closeModal;
  overlay.onclick = (e) => { if(e.target === overlay) closeModal(); };
  const user = () => document.getElementById('fClmApprover').value;
  const catatan = () => document.getElementById('fClmApproverCatatan').value.trim();
  document.getElementById('clmApproverSetuju').onclick = () => {
    row.approvalInternal = 'Disetujui';
    claimLog(row, 'Approval', 'Approval internal disetujui — siap diajukan ke principal' + (catatan() ? ` (${catatan()})` : ''), user());
    closeModal(); done();
  };
  document.getElementById('clmApproverTolak').onclick = () => {
    if(!catatan()){ document.getElementById('fClmApproverErr').style.display = 'block'; return; }
    row.status = 'Dibatalkan';
    claimLog(row, 'Dibatalkan', `Ditolak approver internal: ${catatan()}`, user());
    closeModal(); done();
  };
}
