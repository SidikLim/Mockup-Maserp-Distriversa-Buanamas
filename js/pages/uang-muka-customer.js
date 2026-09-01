/* =========================================================
   LOGIC (JS saja) — Uang Muka Customer (Customer & Penjualan >
   Daftar Transaksi). Dimuat otomatis (lazy-load) oleh core.js
   saat menu ini pertama kali diklik — lihat PAGE_MODULES di
   js/core.js. Markup HTML-nya ada di file sebelah:
   uang-muka-customer.template.js (catatan desain di headernya).
   NB: closeModal() dipakai bersama, didefinisikan di core.js.

   Alur inti (kembaran Uang Muka Supplier, sisi customer):
   - Tambah -> pilih Customer, atau langsung pilih Sales
     Quotation (OPSIONAL — picker DATA.salesQuotation): barang SQ
     menjadi baris Rincian Transaksi (Keterangan = nama barang,
     Qty, Jumlah), customer & ongkos angkut (biayaKirim SQ) ikut
     SQ. Baris rincian bisa juga DITAMBAH MANUAL lewat link
     "Tambah Item Baru" (keterangan/qty/jumlah editable) karena
     SQ opsional. Nomor transaksi per cabang:
     26/UMC-{kode}/09/{urut 5 digit}.
   - Aritmetika (lihat header template): Subtotal = Σ jumlah
     baris; DP = Subtotal x % (persen EDITABLE, default 100);
     DPP = DP (Eksklusif) / DP x 100/(100+p) (Inklusif); PPN =
     p% DPP; Jumlah = DPP + PPN. Persen PPN dari picker "Pilih
     Ppn" (PPN11) — label "Pajak {p} %" + radio "PPN Eksklusif
     (+{p}%)" ikut berubah. Ongkos Angkut display-only. Semua
     di-recalc live (umcRecalc).
   - "Buat Jurnal" (tab Rincian Jurnal Akun): D 1120001 Piutang
     Usaha (Jumlah) lawan K 2140001 Uang Muka Penjualan (DPP) +
     K 2120002 PPN Keluaran (PPN) — seimbang karena Jumlah =
     DPP+PPN. Jurnal manual boleh diedit; Simpan menolak jurnal
     tidak balance (modal info, bukan alert browser).
   - Chip bulan di list FUNGSIONAL (September/Agustus 2026,
     filter substring '/{mm}/' pada r.tgl).
   - Lihat Invoice / Cetak Invoice di list & "Cetak dan Simpan"
     di form membuka preview invoice (tplUmcInvoiceModal).
   Data: DATA.uangMukaCustomer (3 sample September 2026). */

var umcSearchQ = '';
var umcBulan = '09';

function renderUangMukaCustomerPage(){
  umcSearchQ = '';
  umcBulan = '09';
  renderUmcList();
}

function renderUmcList(){
  content.innerHTML = tplUangMukaCustomerListPage(umcBulan);
  document.getElementById('btnUmcAdd').onclick = () => openUmcForm('add', null);
  document.getElementById('umcSearch').oninput = (e) => { umcSearchQ = e.target.value; renderUmcTable(); };
  document.getElementById('umcFilterBulan').onchange = (e) => { umcBulan = e.target.value; renderUmcTable(); };
  renderUmcTable();
}

function umcFilteredRows(){
  const q = umcSearchQ.trim().toLowerCase();
  return (DATA.uangMukaCustomer || []).filter(r => {
    if(umcBulan && !(r.tgl || '').includes(`/${umcBulan}/`)) return false;
    if(!q) return true;
    return r.no.toLowerCase().includes(q) ||
      (r.customer||'').toLowerCase().includes(q) ||
      (r.keterangan||'').toLowerCase().includes(q) ||
      (r.noSQ||'').toLowerCase().includes(q);
  });
}

function renderUmcTable(){
  const rows = umcFilteredRows();
  const tbody = document.getElementById('umcTbody');
  tbody.innerHTML = tplUmcRows(rows);
  document.getElementById('umcTotal').textContent = `Total Record: ${rows.length}`;
  const idxOf = (r) => DATA.uangMukaCustomer.indexOf(r);
  tbody.querySelectorAll('[data-view-link]').forEach(b => b.onclick = () => openUmcForm('view', idxOf(rows[+b.dataset.viewLink])));
  tbody.querySelectorAll('[data-invoice]').forEach(b => b.onclick = () => openUmcInvoice(rows[+b.dataset.invoice]));
  tbody.querySelectorAll('[data-print]').forEach(b => b.onclick = () => openUmcInvoice(rows[+b.dataset.print]));
  tbody.querySelectorAll('[data-edit]').forEach(b => b.onclick = () => openUmcForm('edit', idxOf(rows[+b.dataset.edit])));
  tbody.querySelectorAll('[data-del]').forEach(b => b.onclick = () => openUmcDelete(idxOf(rows[+b.dataset.del])));
}

/* Nomor otomatis per cabang: 26/UMC-HO/09/00001, 00002, ... */
function umcGenerateNo(cabang){
  const kode = UMC_CABANG_CODE[cabang] || 'HO';
  const prefix = `26/UMC-${kode}/09/`;
  let max = 0;
  (DATA.uangMukaCustomer || []).forEach(r => {
    if(r.no && r.no.startsWith(prefix)){
      const n = parseInt(r.no.slice(prefix.length), 10);
      if(!isNaN(n) && n > max) max = n;
    }
  });
  return prefix + String(max + 1).padStart(5, '0');
}

/* Recalc seluruh angka panel Rincian dari state `row` + tulis ke DOM. */
function umcRecalc(row){
  row.subtotal = (row.items || []).reduce((a, it) => a + Number(it.jumlah || 0), 0);
  const persen = Number(row.dpPersen != null ? row.dpPersen : 100);
  const p = Number(row.ppnPersen || 0);
  row.dpAmount = row.subtotal * persen / 100;
  row.dpp = row.dpAmount;
  if(row.ppnMode === 'eksklusif' && p > 0){
    row.ppnAmount = row.dpp * p / 100;
  } else if(row.ppnMode === 'inklusif' && p > 0){
    row.dpp = row.dpAmount * 100 / (100 + p);
    row.ppnAmount = row.dpAmount - row.dpp;
  } else {
    row.ppnAmount = 0;
  }
  row.jumlahTotal = row.dpp + row.ppnAmount;

  const set = (id, v) => { const el = document.getElementById(id); if(el) el.value = v; };
  set('fUmcSubtotal', umcNum2(row.subtotal));
  set('fUmcOngkosAngkut', umcNum2(row.ongkosAngkut || 0));
  set('fUmcDpAmount', umcNum2(row.dpAmount));
  set('fUmcDpp', umcNum2(row.dpp));
  set('fUmcPpnAmount', umcNum2(row.ppnAmount));
  set('fUmcJumlahTotal', umcNum2(row.jumlahTotal));
  const lbl = document.getElementById('umcPpnPersenLabel');
  if(lbl) lbl.textContent = p;
  const lblRadio = document.getElementById('umcPpnPersenRadio');
  if(lblRadio) lblRadio.textContent = p;
}

function umcJurnalTotals(row){
  let d = 0, k = 0;
  (row.jurnalAkun || []).forEach(e => { d += Number(e.debit || 0); k += Number(e.kredit || 0); });
  return { debit: d, kredit: k, selisih: d - k };
}

/* Jurnal otomatis tagihan uang muka ke customer. */
function umcBuildJurnal(row){
  const ket = `Uang Muka ${row.noSQ || row.no}`;
  const list = [
    { kodeAkun:'1120001', namaAkun: umcAkunNama('1120001'), keterangan: ket, debit: row.jumlahTotal, kredit: 0 },
    { kodeAkun:'2140001', namaAkun: umcAkunNama('2140001'), keterangan: ket, debit: 0, kredit: row.dpp },
  ];
  if(row.ppnAmount > 0.004){
    list.push({ kodeAkun:'2120002', namaAkun: umcAkunNama('2120002'), keterangan: ket, debit: 0, kredit: row.ppnAmount });
  }
  return list;
}

/* =====================================================================
   FORM add / edit / view
===================================================================== */
function openUmcForm(mode, idx){
  const src = idx != null ? DATA.uangMukaCustomer[idx] : null;
  const row = src ? JSON.parse(JSON.stringify(src)) : {
    no: umcGenerateNo('Head Office'), tgl: '01/09/2026', cabang: 'Head Office',
    customer: '', noSQ: '', kodeSales: '', keterangan: '', syaratBayar: '',
    tglJthTempo: '', jurnal: '',
    ppnMode: 'tidak', ppnKode: '', ppnPersen: 0,
    dpPersen: 100, ongkosAngkut: 0,
    items: [], jurnalAkun: [],
    subtotal: 0, dpAmount: 0, dpp: 0, ppnAmount: 0, jumlahTotal: 0,
  };
  const isView = mode === 'view';
  content.innerHTML = tplUmcForm(mode, row);

  const back = () => renderUmcList();
  document.getElementById('umcBatalkan').onclick = (e) => { e.preventDefault(); back(); };
  document.getElementById('btnUmcTutorial').onclick = () => openUmcInfo('Tutorial', 'Video tutorial Uang Muka Customer tersedia di portal MASERP (mockup).');

  // Tabs
  const tabR = document.getElementById('umcTabRincianBtn');
  const tabJ = document.getElementById('umcTabJurnalBtn');
  const contR = document.getElementById('umcTabRincianContent');
  const contJ = document.getElementById('umcTabJurnalContent');
  tabR.onclick = () => { tabR.classList.add('active'); tabJ.classList.remove('active'); contR.style.display = ''; contJ.style.display = 'none'; };
  tabJ.onclick = () => { tabJ.classList.add('active'); tabR.classList.remove('active'); contJ.style.display = ''; contR.style.display = 'none'; };

  wireUmcRincianTab(row, isView);
  wireUmcJurnalTab(row, isView);
  if(isView) return;

  // Header fields
  document.getElementById('fUmcCabang').onchange = (e) => {
    row.cabang = e.target.value;
    if(mode === 'add'){ row.no = umcGenerateNo(row.cabang); document.getElementById('fUmcNo').value = row.no; }
  };
  const refreshNoBtn = document.getElementById('umcRefreshNo');
  if(refreshNoBtn) refreshNoBtn.onclick = () => { row.no = umcGenerateNo(row.cabang); document.getElementById('fUmcNo').value = row.no; };

  document.getElementById('umcCustomerSearch').onclick = () => openUmcCustomerPicker((nama) => {
    row.customer = nama;
    document.getElementById('fUmcCustomer').value = nama.toUpperCase();
  });

  document.getElementById('umcSqSearch').onclick = () => openUmcSqPicker((sq) => {
    row.noSQ = sq.no;
    row.customer = sq.customer || row.customer;
    row.ongkosAngkut = Number(sq.biayaKirim || 0);
    row.items = (sq.items || []).map(it => ({ keterangan: it.nama, qty: it.qty, jumlah: it.jumlah }));
    document.getElementById('fUmcNoSQ').value = row.noSQ;
    document.getElementById('fUmcCustomer').value = (row.customer || '').toUpperCase();
    renderUmcItems(row, isView);
    umcRecalc(row);
  });

  document.getElementById('fUmcKodeSales').onchange = (e) => { row.kodeSales = e.target.value; };

  // Simpan / Cetak dan Simpan
  const doSave = () => umcSave(mode, idx, row);
  document.getElementById('umcSimpan').onclick = () => { if(doSave()) back(); };
  document.getElementById('umcCetakSimpan').onclick = () => {
    if(doSave()){ back(); openUmcInvoice(row); }
  };
}

/* ----- Tab Rincian Transaksi ----- */
function renderUmcItems(row, isView){
  document.getElementById('umcItemsBody').innerHTML = tplUmcItemRows(row.items, isView);
  if(isView) return;
  document.querySelectorAll('[data-umc-del]').forEach(b => b.onclick = () => {
    row.items.splice(+b.dataset.umcDel, 1);
    renderUmcItems(row, isView);
    umcRecalc(row);
  });
  document.querySelectorAll('[data-umc-item-ket]').forEach(inp => inp.oninput = () => {
    row.items[+inp.dataset.umcItemKet].keterangan = inp.value;
  });
  document.querySelectorAll('[data-umc-item-qty]').forEach(inp => inp.oninput = () => {
    row.items[+inp.dataset.umcItemQty].qty = Number(inp.value) || 0;
  });
  document.querySelectorAll('[data-umc-item-jumlah]').forEach(inp => inp.oninput = () => {
    row.items[+inp.dataset.umcItemJumlah].jumlah = Number(inp.value) || 0;
    umcRecalc(row);
  });
}

function wireUmcRincianTab(row, isView){
  renderUmcItems(row, isView);
  if(isView) return;

  document.getElementById('umcAddItem').onclick = (e) => {
    e.preventDefault();
    row.items = row.items || [];
    row.items.push({ keterangan:'', qty:1, jumlah:0 });
    renderUmcItems(row, isView);
    umcRecalc(row);
  };
  document.querySelectorAll('input[name="umcPpnMode"]').forEach(r => r.onchange = () => {
    row.ppnMode = r.value;
    umcRecalc(row);
  });
  document.getElementById('fUmcDpPersen').oninput = (e) => {
    let v = Number(e.target.value);
    if(isNaN(v) || v < 0) v = 0;
    if(v > 100) v = 100;
    row.dpPersen = v;
    umcRecalc(row);
  };
  document.getElementById('umcPpnSearch').onclick = () => openUmcPpnPicker((p) => {
    row.ppnKode = p.kode; row.ppnPersen = p.persen;
    document.getElementById('fUmcPpnKode').value = p.kode;
    umcRecalc(row);
  });
  document.getElementById('umcPpnClear').onclick = () => {
    row.ppnKode = ''; row.ppnPersen = 0;
    document.getElementById('fUmcPpnKode').value = '';
    umcRecalc(row);
  };
}

/* ----- Tab Rincian Jurnal Akun ----- */
function wireUmcJurnalTab(row, isView){
  const cont = document.getElementById('umcTabJurnalContent');
  cont.innerHTML = tplUmcJurnalContent(row, isView);
  if(isView) return;

  const rerender = () => wireUmcJurnalTab(row, isView);
  const refreshSelisih = () => {
    const t = umcJurnalTotals(row);
    const el = document.getElementById('umcJurnalSelisih');
    el.value = umcNum2(t.selisih);
    el.style.color = Math.abs(t.selisih) > 0.004 ? 'var(--red)' : 'var(--text)';
  };

  document.getElementById('umcBuatJurnal').onclick = () => {
    umcRecalc(row);
    row.jurnalAkun = umcBuildJurnal(row);
    rerender();
  };
  document.getElementById('umcJurnalAddRow').onclick = () => {
    row.jurnalAkun = row.jurnalAkun || [];
    row.jurnalAkun.push({ kodeAkun:'', namaAkun:'', keterangan:'', debit:0, kredit:0 });
    rerender();
  };
  cont.querySelectorAll('[data-umc-jurnal-del]').forEach(b => b.onclick = () => {
    row.jurnalAkun.splice(+b.dataset.umcJurnalDel, 1);
    rerender();
  });
  cont.querySelectorAll('[data-umc-jurnal-akun-search]').forEach(b => b.onclick = () => {
    const i = +b.dataset.umcJurnalAkunSearch;
    openUmcAkunPicker((akun) => {
      row.jurnalAkun[i].kodeAkun = akun.kode;
      row.jurnalAkun[i].namaAkun = akun.nama;
      cont.querySelector(`[data-umc-jurnal-kode="${i}"]`).value = akun.kode;
      cont.querySelector(`[data-umc-jurnal-nama="${i}"]`).value = akun.nama;
    });
  });
  cont.querySelectorAll('[data-umc-jurnal-ket]').forEach(inp => inp.oninput = () => {
    row.jurnalAkun[+inp.dataset.umcJurnalKet].keterangan = inp.value;
  });
  cont.querySelectorAll('[data-umc-jurnal-debit]').forEach(inp => inp.oninput = () => {
    row.jurnalAkun[+inp.dataset.umcJurnalDebit].debit = Number(inp.value) || 0;
    refreshSelisih();
  });
  cont.querySelectorAll('[data-umc-jurnal-kredit]').forEach(inp => inp.oninput = () => {
    row.jurnalAkun[+inp.dataset.umcJurnalKredit].kredit = Number(inp.value) || 0;
    refreshSelisih();
  });
}

/* ----- Simpan + validasi ----- */
function umcSave(mode, idx, row){
  row.tgl = document.getElementById('fUmcTgl').value.trim();
  row.keterangan = document.getElementById('fUmcKeterangan').value;
  row.syaratBayar = document.getElementById('fUmcSyaratBayar').value;
  row.tglJthTempo = document.getElementById('fUmcTglJthTempo').value.trim();
  row.jurnal = document.getElementById('fUmcJurnal').value;
  row.kodeSales = document.getElementById('fUmcKodeSales').value;
  umcRecalc(row);

  if(!row.customer){ openUmcInfo('Validasi', 'Customer wajib dipilih.'); return false; }
  if(!row.tgl){ openUmcInfo('Validasi', 'Tgl. Trn. wajib diisi.'); return false; }
  if(!row.items || !row.items.length){ openUmcInfo('Validasi', 'Rincian transaksi masih kosong — pilih Sales Quotation atau tambah item baru.'); return false; }
  if(row.jurnalAkun && row.jurnalAkun.length){
    const t = umcJurnalTotals(row);
    if(Math.abs(t.selisih) > 0.004){
      openUmcInfo('Jurnal Tidak Balance', `Total Debit (${umcNum2(t.debit)}) tidak sama dengan Total Kredit (${umcNum2(t.kredit)}). Selisih: ${umcNum2(t.selisih)}.`);
      return false;
    }
  }

  DATA.uangMukaCustomer = DATA.uangMukaCustomer || [];
  if(mode === 'add') DATA.uangMukaCustomer.unshift(row);
  else DATA.uangMukaCustomer[idx] = row;
  return true;
}

/* =====================================================================
   Modals: invoice, hapus, pickers, info
===================================================================== */
function umcOverlay(html){
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

function openUmcInvoice(row){
  umcOverlay(tplUmcInvoiceModal(row));
}

function openUmcDelete(idx){
  const row = DATA.uangMukaCustomer[idx];
  umcOverlay(tplUmcDeleteConfirm(row));
  document.getElementById('modalDelete').onclick = () => {
    DATA.uangMukaCustomer.splice(idx, 1);
    closeModal();
    renderUmcTable();
  };
}

function openUmcInfo(title, text){
  umcOverlay(tplUmcInfoModal(title, text));
  document.getElementById('modalOk').onclick = closeModal;
}

function openUmcCustomerPicker(onPick){
  const overlay = umcOverlay(tplUmcCustomerPicker(DATA.customers));
  const wire = () => overlay.querySelectorAll('[data-pick-customer]').forEach(b => b.onclick = () => {
    onPick(b.dataset.pickCustomer);
    closeModal();
  });
  wire();
  document.getElementById('umcCustomerPickerSearch').oninput = (e) => {
    const q = e.target.value.trim().toLowerCase();
    const list = DATA.customers.filter(c => !q || c.kode.toLowerCase().includes(q) || c.nama.toLowerCase().includes(q));
    document.getElementById('umcCustomerPickerBody').innerHTML = tplUmcCustomerPickerRows(list);
    wire();
  };
}

function openUmcSqPicker(onPick){
  const overlay = umcOverlay(tplUmcSqPicker(DATA.salesQuotation));
  const wire = () => overlay.querySelectorAll('[data-pick-sq]').forEach(b => b.onclick = () => {
    const sq = DATA.salesQuotation.find(q => q.no === b.dataset.pickSq);
    if(sq) onPick(sq);
    closeModal();
  });
  wire();
  document.getElementById('umcSqPickerSearch').oninput = (e) => {
    const q = e.target.value.trim().toLowerCase();
    const list = DATA.salesQuotation.filter(x => !q || x.no.toLowerCase().includes(q) || (x.customer||'').toLowerCase().includes(q));
    document.getElementById('umcSqPickerBody').innerHTML = tplUmcSqPickerRows(list);
    wire();
  };
}

function openUmcPpnPicker(onPick){
  const overlay = umcOverlay(tplUmcPpnPicker(UMC_PPN_LIST));
  overlay.querySelectorAll('[data-pick-ppn]').forEach(b => b.onclick = () => {
    onPick({ kode: b.dataset.pickPpn, persen: Number(b.dataset.pickPersen) });
    closeModal();
  });
}

function openUmcAkunPicker(onPick){
  const overlay = umcOverlay(tplUmcAkunPicker(DATA.akunGL));
  const wire = () => overlay.querySelectorAll('[data-umc-pick-akun]').forEach(b => b.onclick = () => {
    const akun = DATA.akunGL.find(a => a.kode === b.dataset.umcPickAkun);
    if(akun) onPick(akun);
    closeModal();
  });
  wire();
  document.getElementById('umcAkunPickerSearch').oninput = (e) => {
    const q = e.target.value.trim().toLowerCase();
    const list = DATA.akunGL.filter(a => !q || a.kode.includes(q) || a.nama.toLowerCase().includes(q));
    document.getElementById('umcAkunPickerBody').innerHTML = tplUmcAkunPickerRows(list);
    wire();
  };
}
