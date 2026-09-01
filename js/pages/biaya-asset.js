/* =========================================================
   LOGIC (JS saja) — Biaya Asset / "Biaya Fixed Asset" (Aktiva
   Tetap > Daftar Transaksi, key page:'biayaAsset'). Dimuat
   otomatis (lazy-load) oleh core.js — lihat PAGE_MODULES di
   js/core.js. Markup di file sebelah: biaya-asset.template.js
   (catatan desain & pemetaan screenshot SDL -> DBM di header).
   NB: closeModal() dipakai bersama, didefinisikan di core.js.

   Alur inti: pilih Supplier (mengisi Mata Uang Vendor IDR),
   tambah baris Fixed Asset Item (picker aset, keterangan
   editable, jurnal dari master Jurnal Aktiva Tetap — entry
   tipe "Biaya" tersedia, jumlah editable); Total = Σ Jumlah x
   Kurs Vendor (kurs editable, recalc live). Buat Jurnal:
   D akun biaya per item (glDebit jurnal item || 5210006) lawan
   K 2110001 Hutang Usaha (total); Simpan menolak jurnal tak
   balance (modal info). Chip bulan list fungsional. Nomor
   GLOBAL "26/FAC-{urut 10 digit}".
   Data: DATA.biayaFixedAsset (2 sample September 2026). */

var facState = { search:'', sortField:'', sortDir:'asc', bulan:'09' };

function renderBiayaAssetPage(){
  facState = { search:'', sortField:'', sortDir:'asc', bulan:'09' };
  renderFacList();
}

function renderFacList(){
  content.innerHTML = tplFacListPage(facState.bulan);
  document.getElementById('btnFacAdd').onclick = () => openFacForm('add', null);
  document.getElementById('facSearch').oninput = (e) => { facState.search = e.target.value.trim().toLowerCase(); renderFacTable(); };
  document.getElementById('facFilterBulan').onchange = (e) => { facState.bulan = e.target.value; renderFacTable(); };
  document.getElementById('facPageSize').onchange = () => renderFacTable();
  document.querySelectorAll('[data-fac-sort]').forEach(el => el.onclick = () => {
    const field = el.dataset.facSort;
    if(facState.sortField === field){
      facState.sortDir = facState.sortDir === 'asc' ? 'desc' : 'asc';
    } else {
      facState.sortField = field;
      facState.sortDir = 'asc';
    }
    renderFacTable();
  });
  renderFacTable();
}

function facFilteredRows(){
  const q = facState.search;
  let rows = (DATA.biayaFixedAsset || []).filter(r => {
    if(facState.bulan && !(r.tgl || '').includes(`/${facState.bulan}/`)) return false;
    if(!q) return true;
    return r.no.toLowerCase().includes(q) ||
      (r.supplier||'').toLowerCase().includes(q) ||
      (r.tipeTransaksi||'').toLowerCase().includes(q);
  });
  const f = facState.sortField;
  if(f){
    const dir = facState.sortDir === 'desc' ? -1 : 1;
    rows.sort((a,b) => {
      if(f === 'grandTotal') return (facGrandTotal(a) - facGrandTotal(b)) * dir;
      return String(a[f]||'').localeCompare(String(b[f]||''), 'id') * dir;
    });
  }
  return rows;
}

function renderFacTable(){
  const rows = facFilteredRows();
  const tbody = document.getElementById('facTbody');
  tbody.innerHTML = tplFacRows(rows);
  document.getElementById('facTotal').textContent = `Total Record: ${rows.length}`;
  ['no','tgl','tipeTransaksi','supplier','grandTotal'].forEach(f => {
    const el = document.getElementById(`facSortIcon_${f}`);
    if(!el) return;
    if(facState.sortField === f){
      el.innerHTML = facState.sortDir === 'asc' ? '&#8593;' : '&#8595;';
      el.style.color = 'var(--blue)';
    } else {
      el.innerHTML = '&#8693;';
      el.style.color = 'var(--text-light)';
    }
  });
  tbody.querySelectorAll('[data-fac-edit]').forEach(b => b.onclick = () => openFacForm('edit', +b.dataset.facEdit));
  tbody.querySelectorAll('[data-fac-del]').forEach(b => b.onclick = () => openFacDelete(+b.dataset.facDel));
}

/* Nomor otomatis GLOBAL: 26/FAC-0000000001, 0000000002, ... */
function facGenerateNo(){
  const prefix = '26/FAC-';
  let max = 0;
  (DATA.biayaFixedAsset || []).forEach(r => {
    if(r.no && r.no.startsWith(prefix)){
      const n = parseInt(r.no.slice(prefix.length), 10);
      if(!isNaN(n) && n > max) max = n;
    }
  });
  return prefix + String(max + 1).padStart(10, '0');
}

function facRecalcTotal(row){
  const el = document.getElementById('fFacTotal');
  if(el) el.value = facNum2(facGrandTotal(row));
}

function facJurnalTotals(row){
  let d = 0, k = 0;
  (row.jurnalAkun || []).forEach(e => { d += Number(e.debit || 0); k += Number(e.kredit || 0); });
  return { debit: d, kredit: k, selisih: d - k };
}

/* Jurnal otomatis biaya aktiva tetap. */
function facBuildJurnal(row){
  const kurs = Number(row.kursVendor || 1);
  const list = [];
  (row.items || []).forEach(it => {
    const j = DATA.jurnalFixedAsset.find(x => x.keterangan === it.jurnal);
    const akun = (j && j.glDebit) ? j.glDebit : '5210006';
    list.push({ kodeAkun: akun, namaAkun: facAkunNama(akun), keterangan: it.keterangan || `${it.kodeAset} ${it.namaAset}`, debit: Number(it.jumlah || 0) * kurs, kredit: 0 });
  });
  list.push({ kodeAkun:'2110001', namaAkun: facAkunNama('2110001'), keterangan: `Biaya FA ${row.no} — ${row.supplier||''}`, debit: 0, kredit: facGrandTotal(row) });
  return list;
}

/* =====================================================================
   FORM add / edit
===================================================================== */
function openFacForm(mode, idx){
  const src = idx != null ? DATA.biayaFixedAsset[idx] : null;
  const row = src ? JSON.parse(JSON.stringify(src)) : {
    no: facGenerateNo(), tgl: '01/09/2026', tglJthTmp: '01/09/2026',
    supplier: '', supplierKode: '', syaratBayar: 'CBD.', tipeTransaksi: 'Perbaikan',
    mataUangVendor: '', kursVendor: 1, memo: '',
    items: [], jurnalAkun: [],
  };
  content.innerHTML = tplFacForm(mode, row);

  const back = () => renderFacList();
  document.getElementById('facBatalkan').onclick = (e) => { e.preventDefault(); back(); };
  document.getElementById('btnFacTutorial').onclick = () => openFacInfo('Tutorial', 'Video tutorial Biaya Fixed Asset tersedia di portal MASERP (mockup).');

  const tabD = document.getElementById('facTabDetailBtn');
  const tabJ = document.getElementById('facTabJurnalBtn');
  const contD = document.getElementById('facTabDetailContent');
  const contJ = document.getElementById('facTabJurnalContent');
  tabD.onclick = () => { tabD.classList.add('active'); tabJ.classList.remove('active'); contD.style.display = ''; contJ.style.display = 'none'; };
  tabJ.onclick = () => { tabJ.classList.add('active'); tabD.classList.remove('active'); contJ.style.display = ''; contD.style.display = 'none'; };

  wireFacItems(row);
  wireFacJurnalTab(row);

  const refreshNoBtn = document.getElementById('facRefreshNo');
  if(refreshNoBtn) refreshNoBtn.onclick = () => { row.no = facGenerateNo(); document.getElementById('fFacNo').value = row.no; };

  document.getElementById('fFacTgl').oninput = (e) => {
    row.tgl = e.target.value;
    row.tglJthTmp = e.target.value;
    document.getElementById('fFacTglJthTmp').value = e.target.value;
  };
  document.getElementById('fFacTipe').onchange = (e) => { row.tipeTransaksi = e.target.value; };
  document.getElementById('fFacSyaratBayar').onchange = (e) => { row.syaratBayar = e.target.value; };
  document.getElementById('fFacKurs').oninput = (e) => {
    row.kursVendor = Number(e.target.value) || 0;
    facRecalcTotal(row);
  };

  document.getElementById('facSupplierSearch').onclick = () => openFacSupplierPicker((s) => {
    row.supplier = s.nama;
    row.supplierKode = s.kode;
    row.mataUangVendor = s.mataUang || 'IDR';
    document.getElementById('fFacSupplier').value = s.nama.toUpperCase();
    document.getElementById('fFacMataUang').value = row.mataUangVendor;
  });

  document.getElementById('facSimpan').onclick = () => {
    row.tgl = document.getElementById('fFacTgl').value.trim();
    row.memo = document.getElementById('fFacMemo').value;
    row.syaratBayar = document.getElementById('fFacSyaratBayar').value;
    row.tipeTransaksi = document.getElementById('fFacTipe').value;
    if(!row.supplier){ openFacInfo('Validasi', 'Supplier wajib dipilih.'); return; }
    if(!row.tgl){ openFacInfo('Validasi', 'Tgl. Transaksi wajib diisi.'); return; }
    if(!row.items || !row.items.length){ openFacInfo('Validasi', 'Fixed Asset Item masih kosong — klik "Add".'); return; }
    if(row.items.some(it => !it.kodeAset)){ openFacInfo('Validasi', 'Ada baris item yang belum dipilih Kode Aset-nya.'); return; }
    if(row.jurnalAkun && row.jurnalAkun.length){
      const t = facJurnalTotals(row);
      if(Math.abs(t.selisih) > 0.004){
        openFacInfo('Jurnal Tidak Balance', `Total Debit (${facNum2(t.debit)}) tidak sama dengan Total Kredit (${facNum2(t.kredit)}). Selisih: ${facNum2(t.selisih)}.`);
        return;
      }
    }
    DATA.biayaFixedAsset = DATA.biayaFixedAsset || [];
    if(mode === 'add') DATA.biayaFixedAsset.unshift(row);
    else DATA.biayaFixedAsset[idx] = row;
    back();
  };
}

/* ----- Tabel item ----- */
function wireFacItems(row){
  document.getElementById('facItemsBody').innerHTML = tplFacItemRows(row.items);
  const body = document.getElementById('facItemsBody');
  document.getElementById('facItemAdd').onclick = () => {
    row.items = row.items || [];
    row.items.push({ kodeAset:'', namaAset:'', keterangan:'', jurnal:'', jumlah:0 });
    wireFacItems(row);
    facRecalcTotal(row);
  };
  body.querySelectorAll('[data-fac-item-del]').forEach(b => b.onclick = () => {
    row.items.splice(+b.dataset.facItemDel, 1);
    wireFacItems(row);
    facRecalcTotal(row);
  });
  body.querySelectorAll('[data-fac-item-pick]').forEach(b => b.onclick = () => {
    const i = +b.dataset.facItemPick;
    openFacAsetPicker((a) => {
      row.items[i].kodeAset = a.kode;
      row.items[i].namaAset = a.nama;
      wireFacItems(row);
      facRecalcTotal(row);
    });
  });
  body.querySelectorAll('[data-fac-item-ket]').forEach(inp => inp.oninput = () => {
    row.items[+inp.dataset.facItemKet].keterangan = inp.value;
  });
  body.querySelectorAll('[data-fac-item-jurnal]').forEach(sel => sel.onchange = () => {
    row.items[+sel.dataset.facItemJurnal].jurnal = sel.value;
  });
  body.querySelectorAll('[data-fac-item-jumlah]').forEach(inp => inp.oninput = () => {
    row.items[+inp.dataset.facItemJumlah].jumlah = Number(inp.value) || 0;
    facRecalcTotal(row);
  });
}

/* ----- Tab Account Journal Details ----- */
function wireFacJurnalTab(row){
  const cont = document.getElementById('facTabJurnalContent');
  cont.innerHTML = tplFacJurnalContent(row);

  const rerender = () => wireFacJurnalTab(row);
  const refreshSelisih = () => {
    const t = facJurnalTotals(row);
    const el = document.getElementById('facJurnalSelisih');
    el.value = facNum2(t.selisih);
    el.style.color = Math.abs(t.selisih) > 0.004 ? 'var(--red)' : 'var(--text)';
  };

  document.getElementById('facBuatJurnal').onclick = () => {
    row.jurnalAkun = facBuildJurnal(row);
    rerender();
  };
  document.getElementById('facJurnalAddRow').onclick = () => {
    row.jurnalAkun = row.jurnalAkun || [];
    row.jurnalAkun.push({ kodeAkun:'', namaAkun:'', keterangan:'', debit:0, kredit:0 });
    rerender();
  };
  cont.querySelectorAll('[data-fac-jurnal-del]').forEach(b => b.onclick = () => {
    row.jurnalAkun.splice(+b.dataset.facJurnalDel, 1);
    rerender();
  });
  cont.querySelectorAll('[data-fac-jurnal-akun-search]').forEach(b => b.onclick = () => {
    const i = +b.dataset.facJurnalAkunSearch;
    openFacAkunPicker((akun) => {
      row.jurnalAkun[i].kodeAkun = akun.kode;
      row.jurnalAkun[i].namaAkun = akun.nama;
      cont.querySelector(`[data-fac-jurnal-kode="${i}"]`).value = akun.kode;
      cont.querySelector(`[data-fac-jurnal-nama="${i}"]`).value = akun.nama;
    });
  });
  cont.querySelectorAll('[data-fac-jurnal-ket]').forEach(inp => inp.oninput = () => {
    row.jurnalAkun[+inp.dataset.facJurnalKet].keterangan = inp.value;
  });
  cont.querySelectorAll('[data-fac-jurnal-debit]').forEach(inp => inp.oninput = () => {
    row.jurnalAkun[+inp.dataset.facJurnalDebit].debit = Number(inp.value) || 0;
    refreshSelisih();
  });
  cont.querySelectorAll('[data-fac-jurnal-kredit]').forEach(inp => inp.oninput = () => {
    row.jurnalAkun[+inp.dataset.facJurnalKredit].kredit = Number(inp.value) || 0;
    refreshSelisih();
  });
}

/* =====================================================================
   Modals
===================================================================== */
function facOverlay(html){
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

function openFacDelete(idx){
  const row = DATA.biayaFixedAsset[idx];
  facOverlay(tplFacDeleteConfirm(row));
  document.getElementById('modalDelete').onclick = () => {
    DATA.biayaFixedAsset.splice(idx, 1);
    closeModal();
    renderFacTable();
  };
}

function openFacInfo(title, text){
  facOverlay(tplFacInfoModal(title, text));
  document.getElementById('modalOk').onclick = closeModal;
}

function openFacSupplierPicker(onPick){
  const overlay = facOverlay(tplFacSupplierPicker(DATA.suppliers));
  const wire = () => overlay.querySelectorAll('[data-pick-supplier]').forEach(b => b.onclick = () => {
    const s = DATA.suppliers.find(x => x.kode === b.dataset.pickSupplier);
    if(s) onPick(s);
    closeModal();
  });
  wire();
  document.getElementById('facSupplierPickerSearch').oninput = (e) => {
    const q = e.target.value.trim().toLowerCase();
    const list = DATA.suppliers.filter(s => !q || s.kode.toLowerCase().includes(q) || s.nama.toLowerCase().includes(q));
    document.getElementById('facSupplierPickerBody').innerHTML = tplFacSupplierPickerRows(list);
    wire();
  };
}

function openFacAsetPicker(onPick){
  const overlay = facOverlay(tplFacAsetPicker(DATA.aktivaTetap));
  const wire = () => overlay.querySelectorAll('[data-pick-aset]').forEach(b => b.onclick = () => {
    const a = DATA.aktivaTetap.find(x => x.kode === b.dataset.pickAset);
    if(a) onPick(a);
    closeModal();
  });
  wire();
  document.getElementById('facAsetPickerSearch').oninput = (e) => {
    const q = e.target.value.trim().toLowerCase();
    const list = DATA.aktivaTetap.filter(a => !q || a.kode.toLowerCase().includes(q) || a.nama.toLowerCase().includes(q));
    document.getElementById('facAsetPickerBody').innerHTML = tplFacAsetPickerRows(list);
    wire();
  };
}

function openFacAkunPicker(onPick){
  const overlay = facOverlay(tplFacAkunPicker(DATA.akunGL));
  const wire = () => overlay.querySelectorAll('[data-fac-pick-akun]').forEach(b => b.onclick = () => {
    const akun = DATA.akunGL.find(a => a.kode === b.dataset.facPickAkun);
    if(akun) onPick(akun);
    closeModal();
  });
  wire();
  document.getElementById('facAkunPickerSearch').oninput = (e) => {
    const q = e.target.value.trim().toLowerCase();
    const list = DATA.akunGL.filter(a => !q || a.kode.includes(q) || a.nama.toLowerCase().includes(q));
    document.getElementById('facAkunPickerBody').innerHTML = tplFacAkunPickerRows(list);
    wire();
  };
}
