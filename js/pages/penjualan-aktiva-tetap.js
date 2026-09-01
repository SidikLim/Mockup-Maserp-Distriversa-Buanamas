/* =========================================================
   LOGIC (JS saja) — Penjualan Aktiva Tetap / "Penjualan Fixed
   Asset" (Aktiva Tetap > Daftar Transaksi, key
   page:'penjualanAktivaTetap'). Dimuat otomatis (lazy-load)
   oleh core.js — lihat PAGE_MODULES di js/core.js. Markup di
   file sebelah: penjualan-aktiva-tetap.template.js (catatan
   desain & pemetaan screenshot SDL -> DBM di headernya).
   NB: closeModal() dipakai bersama, didefinisikan di core.js.

   Aritmetika: itemNet = Harga Jual x (1 - Disc%); Subtotal =
   Σ itemNet; Diskon 1 = Subtotal x d1%; Diskon 2 BERJENJANG =
   (Subtotal - D1) x d2%; base = Subtotal - D1 - D2; Eksklusif:
   DPP = base & PPN = p% DPP; Inklusif: DPP = base x 100/(100+p)
   & PPN = base - DPP; Tidak ada PPN: DPP = base, PPN = 0.
   Total = DPP + PPN; Pakai (uang muka) di-clamp <=
   min(Sisa U. Muka customer, Total); Sisa Total = Total-Pakai.
   Buat Jurnal: D 1120001 Piutang Usaha (Sisa Total) + D
   2140001 Uang Muka Penjualan (Pakai) lawan K akun aset per
   item (glKredit jurnal item || 1510003 Kendaraan,
   proporsional DPP, pembulatan disesuaikan di baris terakhir)
   + K 2120002 PPN Keluaran. Simpan menolak jurnal tak balance.
   Data: DATA.penjualanFixedAsset (2 sample September 2026). */

var fasState = { search:'', sortField:'', sortDir:'asc', bulan:'' };

function renderPenjualanAktivaTetapPage(){
  fasState = { search:'', sortField:'', sortDir:'asc', bulan:'' };
  renderFasList();
}

function renderFasList(){
  content.innerHTML = tplFasListPage(fasState.bulan);
  document.getElementById('btnFasAdd').onclick = () => openFasForm('add', null);
  document.getElementById('fasSearch').oninput = (e) => { fasState.search = e.target.value.trim().toLowerCase(); renderFasTable(); };
  document.getElementById('fasFilterBulan').onchange = (e) => { fasState.bulan = e.target.value; renderFasTable(); };
  document.getElementById('fasPageSize').onchange = () => renderFasTable();
  document.querySelectorAll('[data-fas-sort]').forEach(el => el.onclick = () => {
    const field = el.dataset.fasSort;
    if(fasState.sortField === field){
      fasState.sortDir = fasState.sortDir === 'asc' ? 'desc' : 'asc';
    } else {
      fasState.sortField = field;
      fasState.sortDir = 'asc';
    }
    renderFasTable();
  });
  renderFasTable();
}

function fasFilteredRows(){
  const q = fasState.search;
  let rows = (DATA.penjualanFixedAsset || []).filter(r => {
    if(fasState.bulan && !(r.tgl || '').includes(`/${fasState.bulan}/`)) return false;
    if(!q) return true;
    return r.no.toLowerCase().includes(q) ||
      (r.customer||'').toLowerCase().includes(q) ||
      (r.tipeTransaksi||'').toLowerCase().includes(q);
  });
  const f = fasState.sortField;
  if(f){
    const dir = fasState.sortDir === 'desc' ? -1 : 1;
    rows.sort((a,b) => {
      if(f === 'grandTotal') return ((a.total||0) - (b.total||0)) * dir;
      return String(a[f]||'').localeCompare(String(b[f]||''), 'id') * dir;
    });
  }
  return rows;
}

function renderFasTable(){
  const rows = fasFilteredRows();
  const tbody = document.getElementById('fasTbody');
  tbody.innerHTML = tplFasRows(rows);
  document.getElementById('fasTotal').textContent = `Total Record: ${rows.length}`;
  ['no','tgl','customer','tipeTransaksi','grandTotal'].forEach(f => {
    const el = document.getElementById(`fasSortIcon_${f}`);
    if(!el) return;
    if(fasState.sortField === f){
      el.innerHTML = fasState.sortDir === 'asc' ? '&#8593;' : '&#8595;';
      el.style.color = 'var(--blue)';
    } else {
      el.innerHTML = '&#8693;';
      el.style.color = 'var(--text-light)';
    }
  });
  tbody.querySelectorAll('[data-fas-edit]').forEach(b => b.onclick = () => openFasForm('edit', +b.dataset.fasEdit));
  tbody.querySelectorAll('[data-fas-view]').forEach(b => b.onclick = () => openFasForm('view', +b.dataset.fasView));
  tbody.querySelectorAll('[data-fas-del]').forEach(b => b.onclick = () => openFasDelete(+b.dataset.fasDel));
  tbody.querySelectorAll('[data-fas-print]').forEach(b => b.onclick = () => openFasInvoice(DATA.penjualanFixedAsset[+b.dataset.fasPrint]));
}

/* Nomor otomatis per cabang: 26/FAS/HO/09/00001, ... */
function fasGenerateNo(cabang){
  const kode = FAS_CABANG_CODE[cabang] || 'HO';
  const prefix = `26/FAS/${kode}/09/`;
  let max = 0;
  (DATA.penjualanFixedAsset || []).forEach(r => {
    if(r.no && r.no.startsWith(prefix)){
      const n = parseInt(r.no.slice(prefix.length), 10);
      if(!isNaN(n) && n > max) max = n;
    }
  });
  return prefix + String(max + 1).padStart(5, '0');
}

function fasItemNet(it){ return Number(it.hargaJual||0) * (1 - Number(it.discPersen||0)/100); }

/* Recalc seluruh angka panel Rincian dari state `row` + tulis ke DOM. */
function fasRecalc(row){
  const subtotal = (row.items || []).reduce((a, it) => a + fasItemNet(it), 0);
  const d1 = Number(row.diskon1 || 0), d2 = Number(row.diskon2 || 0);
  const p = Number(row.ppnPersen || 0);
  row.diskon1Amt = subtotal * d1 / 100;
  row.diskon2Amt = (subtotal - row.diskon1Amt) * d2 / 100;
  const base = subtotal - row.diskon1Amt - row.diskon2Amt;
  if(row.ppnMode === 'eksklusif' && p > 0){
    row.dpp = base;
    row.ppnAmount = base * p / 100;
  } else if(row.ppnMode === 'inklusif' && p > 0){
    row.dpp = base * 100 / (100 + p);
    row.ppnAmount = base - row.dpp;
  } else {
    row.dpp = base;
    row.ppnAmount = 0;
  }
  row.total = row.dpp + row.ppnAmount;
  let pakai = Number(row.pakaiUangMuka || 0);
  const maxPakai = Math.min(Number(row.sisaUangMuka || 0), row.total);
  if(pakai > maxPakai) pakai = maxPakai;
  if(pakai < 0) pakai = 0;
  row.pakaiUangMuka = pakai;
  row.sisaTotal = row.total - pakai;
  row.tipeTransaksi = (row.syaratBayar === 'COD' || row.syaratBayar === 'CBD') ? 'Tunai' : 'Kredit';

  const set = (id, v) => { const el = document.getElementById(id); if(el) el.value = v; };
  set('fFasDiskon1Amt', fasNum2(row.diskon1Amt));
  set('fFasDiskon2Amt', fasNum2(row.diskon2Amt));
  set('fFasDpp', fasNum2(row.dpp));
  set('fFasSisaUm', fasNum2(row.sisaUangMuka || 0));
  set('fFasPpnAmount', fasNum2(row.ppnAmount));
  set('fFasTotal', fasNum2(row.total));
  set('fFasSisaTotal', fasNum2(row.sisaTotal));
  const l1 = document.getElementById('fasPpnPersenLabel'); if(l1) l1.textContent = p;
  const l2 = document.getElementById('fasPpnPersenRadio'); if(l2) l2.textContent = p;
}

function fasJurnalTotals(row){
  let d = 0, k = 0;
  (row.jurnalAkun || []).forEach(e => { d += Number(e.debit || 0); k += Number(e.kredit || 0); });
  return { debit: d, kredit: k, selisih: d - k };
}

/* Jurnal otomatis penjualan aktiva tetap. */
function fasBuildJurnal(row){
  const ket = `Penjualan FA ${row.no}`;
  const list = [
    { kodeAkun:'1120001', namaAkun: fasAkunNama('1120001'), keterangan: ket, debit: row.sisaTotal, kredit: 0 },
  ];
  if(row.pakaiUangMuka > 0.004){
    list.push({ kodeAkun:'2140001', namaAkun: fasAkunNama('2140001'), keterangan: `Pakai Uang Muka ${row.no}`, debit: row.pakaiUangMuka, kredit: 0 });
  }
  const subtotal = (row.items || []).reduce((a, it) => a + fasItemNet(it), 0);
  let sisa = row.dpp;
  (row.items || []).forEach((it, i) => {
    const j = DATA.jurnalFixedAsset.find(x => x.keterangan === it.jurnal);
    const akun = (j && j.glKredit) ? j.glKredit : '1510003';
    let amt = (i === row.items.length - 1) ? sisa : (subtotal > 0 ? row.dpp * fasItemNet(it) / subtotal : 0);
    sisa -= amt;
    list.push({ kodeAkun: akun, namaAkun: fasAkunNama(akun), keterangan: `${it.kodeAset} ${it.namaAset}`, debit: 0, kredit: amt });
  });
  if(row.ppnAmount > 0.004){
    list.push({ kodeAkun:'2120002', namaAkun: fasAkunNama('2120002'), keterangan: ket, debit: 0, kredit: row.ppnAmount });
  }
  return list;
}

/* =====================================================================
   FORM add / edit / view
===================================================================== */
function openFasForm(mode, idx){
  const src = idx != null ? DATA.penjualanFixedAsset[idx] : null;
  const row = src ? JSON.parse(JSON.stringify(src)) : {
    no: fasGenerateNo('Head Office'), tgl: '01/09/2026', tglJthTmp: '01/09/2026', cabang: '',
    customer: '', customerKode: '', syaratBayar: '', salesman: (DATA.salesman[0]||{}).nama || '',
    alamatPengirim: '', memo: '', tipeTransaksi: 'Kredit',
    ppnMode: 'tidak', ppnKode: '', ppnPersen: 0,
    diskon1: 0, diskon2: 0, diskon1Amt: 0, diskon2Amt: 0,
    sisaUangMuka: 0, pakaiUangMuka: 0,
    items: [], jurnalAkun: [],
    dpp: 0, ppnAmount: 0, total: 0, sisaTotal: 0,
  };
  const isView = mode === 'view';
  content.innerHTML = tplFasForm(mode, row);

  const back = () => renderFasList();
  document.getElementById('fasBatalkan').onclick = (e) => { e.preventDefault(); back(); };
  document.getElementById('btnFasTutorial').onclick = () => openFasInfo('Tutorial', 'Video tutorial Penjualan Fixed Asset tersedia di portal MASERP (mockup).');

  const tabD = document.getElementById('fasTabDetailBtn');
  const tabJ = document.getElementById('fasTabJurnalBtn');
  const contD = document.getElementById('fasTabDetailContent');
  const contJ = document.getElementById('fasTabJurnalContent');
  tabD.onclick = () => { tabD.classList.add('active'); tabJ.classList.remove('active'); contD.style.display = ''; contJ.style.display = 'none'; };
  tabJ.onclick = () => { tabJ.classList.add('active'); tabD.classList.remove('active'); contJ.style.display = ''; contD.style.display = 'none'; };

  wireFasDetailTab(row, isView);
  wireFasJurnalTab(row, isView);
  if(isView) return;

  document.getElementById('fFasCabang').onchange = (e) => {
    row.cabang = e.target.value;
    if(mode === 'add' && row.cabang){ row.no = fasGenerateNo(row.cabang); document.getElementById('fFasNo').value = row.no; }
  };
  const refreshNoBtn = document.getElementById('fasRefreshNo');
  if(refreshNoBtn) refreshNoBtn.onclick = () => { row.no = fasGenerateNo(row.cabang || 'Head Office'); document.getElementById('fFasNo').value = row.no; };

  document.getElementById('fFasTgl').oninput = (e) => {
    row.tgl = e.target.value;
    row.tglJthTmp = e.target.value;
    document.getElementById('fFasTglJthTmp').value = e.target.value;
  };
  document.getElementById('fFasSyaratBayar').onchange = (e) => { row.syaratBayar = e.target.value; fasRecalc(row); };
  document.getElementById('fFasSalesman').onchange = (e) => { row.salesman = e.target.value; };

  document.getElementById('fasCustomerSearch').onclick = () => openFasCustomerPicker((c) => {
    row.customer = c.nama;
    row.customerKode = c.kode;
    row.alamatPengirim = c.alamat || '';
    row.sisaUangMuka = Number(c.uangMuka || 0);
    document.getElementById('fFasCustomer').value = c.nama.toUpperCase();
    document.getElementById('fFasAlamat').value = row.alamatPengirim;
    fasRecalc(row);
  });

  document.getElementById('fasSimpan').onclick = () => {
    row.tgl = document.getElementById('fFasTgl').value.trim();
    row.alamatPengirim = document.getElementById('fFasAlamat').value;
    row.memo = document.getElementById('fFasMemo').value;
    row.syaratBayar = document.getElementById('fFasSyaratBayar').value;
    row.salesman = document.getElementById('fFasSalesman').value;
    fasRecalc(row);
    if(!row.customer){ openFasInfo('Validasi', 'Customer wajib dipilih.'); return; }
    if(!row.tgl){ openFasInfo('Validasi', 'Tgl. Transaksi wajib diisi.'); return; }
    if(!row.items || !row.items.length){ openFasInfo('Validasi', 'Fixed Asset Item masih kosong — klik "Add".'); return; }
    if(row.items.some(it => !it.kodeAset)){ openFasInfo('Validasi', 'Ada baris item yang belum dipilih Kode Aset-nya.'); return; }
    if(row.jurnalAkun && row.jurnalAkun.length){
      const t = fasJurnalTotals(row);
      if(Math.abs(t.selisih) > 0.004){
        openFasInfo('Jurnal Tidak Balance', `Total Debit (${fasNum2(t.debit)}) tidak sama dengan Total Kredit (${fasNum2(t.kredit)}). Selisih: ${fasNum2(t.selisih)}.`);
        return;
      }
    }
    DATA.penjualanFixedAsset = DATA.penjualanFixedAsset || [];
    if(mode === 'add') DATA.penjualanFixedAsset.unshift(row);
    else DATA.penjualanFixedAsset[idx] = row;
    back();
  };
}

/* ----- Tab Detail Transaksi ----- */
function renderFasItems(row, isView){
  document.getElementById('fasItemsBody').innerHTML = tplFasItemRows(row.items, isView);
  const body = document.getElementById('fasItemsBody');
  if(isView) return;
  body.querySelectorAll('[data-fas-item-del]').forEach(b => b.onclick = () => {
    row.items.splice(+b.dataset.fasItemDel, 1);
    renderFasItems(row, isView);
    fasRecalc(row);
  });
  body.querySelectorAll('[data-fas-item-pick]').forEach(b => b.onclick = () => {
    const i = +b.dataset.fasItemPick;
    openFasAsetPicker((a) => {
      row.items[i].kodeAset = a.kode;
      row.items[i].namaAset = a.nama;
      if(!row.items[i].hargaJual) row.items[i].hargaJual = a.hargaBeli || 0;
      renderFasItems(row, isView);
      fasRecalc(row);
    });
  });
  body.querySelectorAll('[data-fas-item-jurnal]').forEach(sel => sel.onchange = () => {
    row.items[+sel.dataset.fasItemJurnal].jurnal = sel.value;
  });
  const refreshRow = (i) => {
    body.querySelector(`[data-fas-item-discamt="${i}"]`).textContent = fasNum2((row.items[i].hargaJual||0)*(row.items[i].discPersen||0)/100);
    body.querySelector(`[data-fas-item-total="${i}"]`).textContent = fasNum2(fasItemNet(row.items[i]));
    fasRecalc(row);
  };
  body.querySelectorAll('[data-fas-item-harga]').forEach(inp => inp.oninput = () => {
    const i = +inp.dataset.fasItemHarga;
    row.items[i].hargaJual = Number(inp.value) || 0;
    refreshRow(i);
  });
  body.querySelectorAll('[data-fas-item-disc]').forEach(inp => inp.oninput = () => {
    const i = +inp.dataset.fasItemDisc;
    let v = Number(inp.value) || 0;
    if(v < 0) v = 0; if(v > 100) v = 100;
    row.items[i].discPersen = v;
    refreshRow(i);
  });
}

function wireFasDetailTab(row, isView){
  renderFasItems(row, isView);
  fasRecalc(row);
  if(isView) return;

  document.getElementById('fasItemAdd').onclick = () => {
    row.items = row.items || [];
    row.items.push({ kodeAset:'', namaAset:'', jurnal:'', hargaJual:0, discPersen:0 });
    renderFasItems(row, isView);
    fasRecalc(row);
  };
  document.querySelectorAll('input[name="fasPpnMode"]').forEach(r => r.onchange = () => {
    row.ppnMode = r.value;
    fasRecalc(row);
  });
  document.getElementById('fFasDiskon1').oninput = (e) => {
    let v = Number(e.target.value); if(isNaN(v)||v<0) v=0; if(v>100) v=100;
    row.diskon1 = v; fasRecalc(row);
  };
  document.getElementById('fFasDiskon2').oninput = (e) => {
    let v = Number(e.target.value); if(isNaN(v)||v<0) v=0; if(v>100) v=100;
    row.diskon2 = v; fasRecalc(row);
  };
  document.getElementById('fFasPakai').oninput = (e) => {
    row.pakaiUangMuka = Number(e.target.value) || 0;
    fasRecalc(row);
    e.target.value = row.pakaiUangMuka;
  };
  document.getElementById('fasPpnSearch').onclick = () => openFasPpnPicker((pp) => {
    row.ppnKode = pp.kode; row.ppnPersen = pp.persen;
    document.getElementById('fFasPpnKode').value = pp.kode;
    fasRecalc(row);
  });
  document.getElementById('fasPpnClear').onclick = () => {
    row.ppnKode = ''; row.ppnPersen = 0;
    document.getElementById('fFasPpnKode').value = '';
    fasRecalc(row);
  };
}

/* ----- Tab Account Journal Details ----- */
function wireFasJurnalTab(row, isView){
  const cont = document.getElementById('fasTabJurnalContent');
  cont.innerHTML = tplFasJurnalContent(row, isView);
  if(isView) return;

  const rerender = () => wireFasJurnalTab(row, isView);
  const refreshSelisih = () => {
    const t = fasJurnalTotals(row);
    const el = document.getElementById('fasJurnalSelisih');
    el.value = fasNum2(t.selisih);
    el.style.color = Math.abs(t.selisih) > 0.004 ? 'var(--red)' : 'var(--text)';
  };

  document.getElementById('fasBuatJurnal').onclick = () => {
    fasRecalc(row);
    row.jurnalAkun = fasBuildJurnal(row);
    rerender();
  };
  document.getElementById('fasJurnalAddRow').onclick = () => {
    row.jurnalAkun = row.jurnalAkun || [];
    row.jurnalAkun.push({ kodeAkun:'', namaAkun:'', keterangan:'', debit:0, kredit:0 });
    rerender();
  };
  cont.querySelectorAll('[data-fas-jurnal-del]').forEach(b => b.onclick = () => {
    row.jurnalAkun.splice(+b.dataset.fasJurnalDel, 1);
    rerender();
  });
  cont.querySelectorAll('[data-fas-jurnal-akun-search]').forEach(b => b.onclick = () => {
    const i = +b.dataset.fasJurnalAkunSearch;
    openFasAkunPicker((akun) => {
      row.jurnalAkun[i].kodeAkun = akun.kode;
      row.jurnalAkun[i].namaAkun = akun.nama;
      cont.querySelector(`[data-fas-jurnal-kode="${i}"]`).value = akun.kode;
      cont.querySelector(`[data-fas-jurnal-nama="${i}"]`).value = akun.nama;
    });
  });
  cont.querySelectorAll('[data-fas-jurnal-ket]').forEach(inp => inp.oninput = () => {
    row.jurnalAkun[+inp.dataset.fasJurnalKet].keterangan = inp.value;
  });
  cont.querySelectorAll('[data-fas-jurnal-debit]').forEach(inp => inp.oninput = () => {
    row.jurnalAkun[+inp.dataset.fasJurnalDebit].debit = Number(inp.value) || 0;
    refreshSelisih();
  });
  cont.querySelectorAll('[data-fas-jurnal-kredit]').forEach(inp => inp.oninput = () => {
    row.jurnalAkun[+inp.dataset.fasJurnalKredit].kredit = Number(inp.value) || 0;
    refreshSelisih();
  });
}

/* =====================================================================
   Modals
===================================================================== */
function fasOverlay(html){
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

function openFasInvoice(row){ fasOverlay(tplFasInvoiceModal(row)); }

function openFasDelete(idx){
  const row = DATA.penjualanFixedAsset[idx];
  fasOverlay(tplFasDeleteConfirm(row));
  document.getElementById('modalDelete').onclick = () => {
    DATA.penjualanFixedAsset.splice(idx, 1);
    closeModal();
    renderFasTable();
  };
}

function openFasInfo(title, text){
  fasOverlay(tplFasInfoModal(title, text));
  document.getElementById('modalOk').onclick = closeModal;
}

function openFasCustomerPicker(onPick){
  const overlay = fasOverlay(tplFasCustomerPicker(DATA.customers));
  const wire = () => overlay.querySelectorAll('[data-pick-customer]').forEach(b => b.onclick = () => {
    const c = DATA.customers.find(x => x.kode === b.dataset.pickCustomer);
    if(c) onPick(c);
    closeModal();
  });
  wire();
  document.getElementById('fasCustomerPickerSearch').oninput = (e) => {
    const q = e.target.value.trim().toLowerCase();
    const list = DATA.customers.filter(c => !q || c.kode.toLowerCase().includes(q) || c.nama.toLowerCase().includes(q));
    document.getElementById('fasCustomerPickerBody').innerHTML = tplFasCustomerPickerRows(list);
    wire();
  };
}

function openFasAsetPicker(onPick){
  const overlay = fasOverlay(tplFasAsetPicker(DATA.aktivaTetap));
  const wire = () => overlay.querySelectorAll('[data-pick-aset]').forEach(b => b.onclick = () => {
    const a = DATA.aktivaTetap.find(x => x.kode === b.dataset.pickAset);
    if(a) onPick(a);
    closeModal();
  });
  wire();
  document.getElementById('fasAsetPickerSearch').oninput = (e) => {
    const q = e.target.value.trim().toLowerCase();
    const list = DATA.aktivaTetap.filter(a => !q || a.kode.toLowerCase().includes(q) || a.nama.toLowerCase().includes(q));
    document.getElementById('fasAsetPickerBody').innerHTML = tplFasAsetPickerRows(list);
    wire();
  };
}

function openFasPpnPicker(onPick){
  const overlay = fasOverlay(tplFasPpnPicker(FAS_PPN_LIST));
  overlay.querySelectorAll('[data-pick-ppn]').forEach(b => b.onclick = () => {
    onPick({ kode: b.dataset.pickPpn, persen: Number(b.dataset.pickPersen) });
    closeModal();
  });
}

function openFasAkunPicker(onPick){
  const overlay = fasOverlay(tplFasAkunPicker(DATA.akunGL));
  const wire = () => overlay.querySelectorAll('[data-fas-pick-akun]').forEach(b => b.onclick = () => {
    const akun = DATA.akunGL.find(a => a.kode === b.dataset.fasPickAkun);
    if(akun) onPick(akun);
    closeModal();
  });
  wire();
  document.getElementById('fasAkunPickerSearch').oninput = (e) => {
    const q = e.target.value.trim().toLowerCase();
    const list = DATA.akunGL.filter(a => !q || a.kode.includes(q) || a.nama.toLowerCase().includes(q));
    document.getElementById('fasAkunPickerBody').innerHTML = tplFasAkunPickerRows(list);
    wire();
  };
}
