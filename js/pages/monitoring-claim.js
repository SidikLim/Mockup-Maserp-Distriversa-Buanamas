/* =========================================================
   LOGIC (JS saja) — Monitoring Claim (page:'monitoringClaim'). Dimuat
   otomatis (lazy-load) oleh core.js — lihat PAGE_MODULES. Markup HTML
   ada di file sebelah: monitoring-claim.template.js. Hanya MEMBACA
   DATA.claimCustomer (tidak mengubah data); semua angka dihitung ulang
   tiap render sehingga selalu sesuai perubahan di modul claim lain.
========================================================= */

let mclFilter = { status:'', principal:'', jenis:'', search:'', terlambat:false };

function renderMonitoringClaimPage(){
  content.innerHTML = tplMclPage(mclFilter);
  document.getElementById('mclPrincipal').onchange = (e) => { mclFilter.principal = e.target.value; renderMclTable(); };
  document.getElementById('mclJenis').onchange = (e) => { mclFilter.jenis = e.target.value; renderMclTable(); };
  document.getElementById('mclTerlambat').onchange = (e) => { mclFilter.terlambat = e.target.checked; renderMclTable(); };
  document.getElementById('mclSearch').oninput = (e) => { mclFilter.search = e.target.value.trim().toLowerCase(); renderMclTable(); };
  renderMclTable();
}

/* Filter principal/jenis/cari berlaku untuk KPI & chip; filter status &
   "hanya terlambat" hanya untuk tabel (supaya chip tetap menunjukkan
   komposisi semua status). */
function mclBaseRows(){
  const f = mclFilter;
  return DATA.claimCustomer.filter(r => (!f.principal || r.principalKode === f.principal) && (!f.jenis || r.jenis === f.jenis) && (!f.search ||
    [r.no, r.customerNama, r.principalNama, r.keterangan, r.noPengajuan].some(v => (v||'').toLowerCase().includes(f.search))));
}

function renderMclTable(){
  const base = mclBaseRows();
  const sum = (list, fn) => list.reduce((a, r) => a + fn(r), 0);
  const internal = base.filter(r => ['Draft','Approval'].includes(r.status));
  const principal = base.filter(r => r.status === 'Diajukan');
  const sisa = base.filter(r => ['Disetujui','Diproses'].includes(r.status) && claimSisaPulih(r) > 0);
  const pulih = base.filter(r => r.nilaiDipulihkan > 0);
  document.getElementById('mclKpi').innerHTML = tplMclKpi({
    internal: sum(internal, r => r.nilaiClaim), internalN: internal.length,
    principal: sum(principal, r => r.nilaiClaim), principalN: principal.length, terlambatN: principal.filter(claimIsTerlambat).length,
    sisa: sum(sisa, claimSisaPulih), sisaN: sisa.length,
    pulih: sum(pulih, r => r.nilaiDipulihkan), pulihN: pulih.length,
  });
  const counts = {};
  base.forEach(r => {
    counts[r.status] = counts[r.status] || { n:0, nilai:0 };
    counts[r.status].n++;
    counts[r.status].nilai += ['Disetujui','Diproses','Selesai'].includes(r.status) ? r.nilaiAcc : r.nilaiClaim;
  });
  document.getElementById('mclChips').innerHTML = tplMclChips(counts, mclFilter.status);
  document.querySelectorAll('[data-mcl-status]').forEach(b => b.onclick = () => {
    mclFilter.status = mclFilter.status === b.dataset.mclStatus ? '' : b.dataset.mclStatus;
    renderMclTable();
  });
  const rows = base.filter(r => (!mclFilter.status || r.status === mclFilter.status) && (!mclFilter.terlambat || claimIsTerlambat(r)));
  document.getElementById('mclTbody').innerHTML = tplMclRows(rows);
  document.getElementById('mclTotal').textContent = `Total Record: ${rows.length}`;
  document.querySelectorAll('[data-mcl-open]').forEach(b => b.onclick = () => {
    const no = b.dataset.mclOpen;
    goToPage('claimCustomer', 'Claim Customer', () => { if(typeof openClmFormByNo === 'function') openClmFormByNo(no); });
  });
}
