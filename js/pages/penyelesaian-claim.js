/* =========================================================
   LOGIC (JS saja) — Penyelesaian Claim (page:'penyelesaianClaim').
   Dimuat otomatis (lazy-load) oleh core.js — lihat PAGE_MODULES.
   Markup HTML ada di file sebelah: penyelesaian-claim.template.js.
   Data: DATA.penyelesaianClaim (terbaru di depan array).

   Simpan = membuat dokumen sungguhan di modul lain lewat helper core.js
   (claimBuatNotaDebitAP → DATA.transaksiAP, claimBuatPenjualanLangsung
   → DATA.penjualanLangsung + customer principal otomatis), lalu
   menambah `pemulihan[]` & `nilaiDipulihkan` claim; status claim jadi
   Diproses (sebagian) / Selesai (= Nilai ACC) lewat
   claimRefreshStatusPulih(). Jalur Penerimaan Barang hanya mencatat
   nomor Terima Klaim Bonus Item (menu itu masih placeholder).
   `openPnyForm('add', -1, noClaim)` dipanggil juga dari Claim Customer
   (tombol "Lanjut ke Penyelesaian") lewat goToPage().
========================================================= */

let pnyState = { search:'' };
let pnyDraft = null;

function renderPenyelesaianClaimPage(){
  content.innerHTML = tplPnyListPage();
  pnyState.search = '';
  document.getElementById('btnPnyAdd').onclick = () => openPnyForm('add', -1);
  document.getElementById('pnyPageSize').onchange = () => renderPnyTable();
  document.getElementById('pnySearch').oninput = (e) => { pnyState.search = e.target.value.trim().toLowerCase(); renderPnyTable(); };
  renderPnyTable();
}

function renderPnyTable(){
  const q = pnyState.search;
  const perPage = parseInt(document.getElementById('pnyPageSize').value, 10) || 10;
  const rows = DATA.penyelesaianClaim.filter(r => !q || [r.no, r.noClaim, r.principalNama, r.jalur, r.noDok].some(v => (v||'').toLowerCase().includes(q)));
  document.getElementById('pnyTbody').innerHTML = tplPnyRows(rows.slice(0, perPage));
  document.getElementById('pnyTotal').textContent = `Total Record: ${rows.length}`;
  pnyBindLinks();
  document.querySelectorAll('#pnyTbody [data-open]').forEach(b => b.onclick = () => openPnyForm('view', +b.dataset.open));
}

function pnyBindLinks(){
  document.querySelectorAll('[data-pny-claim]').forEach(b => b.onclick = () => {
    const no = b.dataset.pnyClaim;
    goToPage('claimCustomer', 'Claim Customer', () => { if(typeof openClmFormByNo === 'function') openClmFormByNo(no); });
  });
  document.querySelectorAll('[data-pny-goto]').forEach(b => b.onclick = () => claimGoToDok(b.dataset.pnyGoto));
}

function pnyClaimSiap(){
  return DATA.claimCustomer.filter(c => ['Disetujui','Diproses'].includes(c.status) && claimSisaPulih(c) > 0.004);
}

function openPnyForm(mode, idx, noClaim){
  closeModal();
  if(mode === 'view'){
    const row = DATA.penyelesaianClaim[idx];
    content.innerHTML = tplPnyForm('view', row, claimFind(row.noClaim));
    window.scrollTo(0, 0);
    document.getElementById('pnyTutup').onclick = (e) => { e.preventDefault(); renderPenyelesaianClaimPage(); };
    return;
  }
  pnyDraft = { no:'', tgl:claimToday(), noClaim:'', jalur:CLAIM_JALUR_LIST[0], nilai:0, noFakturSupplier:'', gudang:'', barang:'', keterangan:'' };
  if(noClaim) pnyApplyClaim(noClaim);
  pnyRenderAdd();
}

function pnyApplyClaim(no){
  const c = claimFind(no);
  const s = claimSetting(c.principalKode);
  Object.assign(pnyDraft, { noClaim:no, jalur:(s && s.jalurDefault) || CLAIM_JALUR_LIST[0], nilai:claimSisaPulih(c), barang:'', gudang:'' });
}

function pnyRenderAdd(){
  const claim = pnyDraft.noClaim ? claimFind(pnyDraft.noClaim) : null;
  content.innerHTML = tplPnyForm('add', pnyDraft, claim);
  window.scrollTo(0, 0);
  document.getElementById('pnyTutup').onclick = (e) => { e.preventDefault(); renderPenyelesaianClaimPage(); };
  document.getElementById('pnyClaimSearch').onclick = () => openPnyClaimPicker();
  if(!claim) return;
  const nk = document.getElementById('pnyBuatNK');
  if(nk) nk.onclick = () => {
    pnyRead();
    const no = claimBuatNotaKredit(claim);
    pnyRenderAdd();
    openClaimInfo('Nota Kredit dibuat', `Transaksi A.R. <b>${no}</b> (Nota Kredit terbuka) sudah dibuat untuk ${claim.customerNama} senilai ${claimNum2(claim.nilaiAcc)}.`);
  };
  document.getElementById('fPnyJalur').onchange = () => { pnyRead(); pnyRenderAdd(); };
  document.getElementById('fPnyNilai').oninput = () => {
    pnyRead();
    document.getElementById('pnyJurnalPreview').innerHTML = tplPnyJurnalPreview(pnyDraft, claim);
    if(pnyDraft.jalur === 'Penjualan Langsung'){
      document.getElementById('pnyJalurDetail').innerHTML = tplPnyJalurDetail('add', pnyDraft, claim);
    }
  };
  document.getElementById('pnySimpan').onclick = () => pnySave(claim);
}

function pnyRead(){
  const v = id => { const el = document.getElementById(id); return el ? el.value.trim() : ''; };
  Object.assign(pnyDraft, {
    tgl: v('fPnyTgl') || claimToday(), jalur: v('fPnyJalur') || pnyDraft.jalur, nilai: parseFloat(v('fPnyNilai')) || 0,
    keterangan: v('fPnyKeterangan'), noFakturSupplier: v('fPnyFakturSupplier') || pnyDraft.noFakturSupplier,
    gudang: v('fPnyGudang') || pnyDraft.gudang, barang: v('fPnyBarang') || pnyDraft.barang,
  });
}

function openPnyClaimPicker(){
  closeModal();
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.innerHTML = tplPnyClaimPicker(pnyClaimSiap());
  document.body.appendChild(overlay);
  document.getElementById('modalClose').onclick = closeModal;
  document.getElementById('modalCancel').onclick = closeModal;
  overlay.onclick = (e) => { if(e.target === overlay) closeModal(); };
  overlay.querySelectorAll('[data-pny-pick]').forEach(b => b.onclick = () => {
    closeModal();
    pnyApplyClaim(b.dataset.pnyPick);
    pnyRenderAdd();
  });
}

function pnySave(c){
  pnyRead();
  const sisa = claimSisaPulih(c);
  const bad = !(pnyDraft.nilai > 0) || pnyDraft.nilai > sisa + 0.004;
  document.getElementById('fPnyNilaiErr').style.display = bad ? 'block' : 'none';
  if(bad) return;
  const n = Math.round(pnyDraft.nilai * 100) / 100;
  const t = pnyDraft.tgl;
  const kode = claimCabangKode(c.cabang);
  let noDok;
  if(pnyDraft.jalur === 'Nota Debit AP') noDok = claimBuatNotaDebitAP(c, n, pnyDraft.noFakturSupplier);
  else if(pnyDraft.jalur === 'Penjualan Langsung') noDok = claimBuatPenjualanLangsung(c, n);
  else noDok = claimNextNo(DATA.penyelesaianClaim.map(p => ({ no:p.noDok })), `TKB/${kode}/${t.slice(8,10)}${t.slice(3,5)}/`, 4);
  const no = claimNextNo(DATA.penyelesaianClaim, `PNY/${kode}/${t.slice(8,10)}${t.slice(3,5)}/`, 4);
  DATA.penyelesaianClaim.unshift({ no, tgl:t, cabang:c.cabang, noClaim:c.no, principalKode:c.principalKode, principalNama:c.principalNama,
    jalur:pnyDraft.jalur, nilai:n, noDok, noFakturSupplier:pnyDraft.jalur === 'Nota Debit AP' ? pnyDraft.noFakturSupplier : '',
    gudang:pnyDraft.jalur === 'Penerimaan Barang' ? pnyDraft.gudang : '', barang:pnyDraft.jalur === 'Penerimaan Barang' ? pnyDraft.barang : '',
    keterangan:pnyDraft.keterangan });
  c.pemulihan = c.pemulihan || [];
  c.pemulihan.push({ noPenyelesaian:no, tgl:t, jalur:pnyDraft.jalur, nilai:n, noDok });
  c.nilaiDipulihkan = Math.round(((c.nilaiDipulihkan || 0) + n) * 100) / 100;
  claimRefreshStatusPulih(c);
  claimLog(c, c.status, `Dipulihkan lewat ${pnyDraft.jalur} ${noDok} senilai ${claimNum2(n)} (${no})`);
  pnyDraft = null;
  openPnyForm('view', 0);
  const modulNama = { 'Nota Debit AP':'Transaksi A.P.', 'Penjualan Langsung':'Penjualan Langsung', 'Penerimaan Barang':'Terima Klaim Bonus Item' };
  openClaimInfo('Penyelesaian tersimpan', `Dokumen <b>${noDok}</b> dibuat di ${modulNama[DATA.penyelesaianClaim[0].jalur]}. Claim ${c.no} sekarang berstatus <b>${c.status}</b> (sisa ${claimNum2(claimSisaPulih(c))}).`);
}
