/* =========================================================
   TEMPLATE (HTML saja) — Monitoring Claim (Customer & Penjualan >
   Daftar Transaksi > Monitoring Claim, page:'monitoringClaim'). Semua
   fungsi di file ini HANYA menyusun & mengembalikan markup HTML
   (string). Logic-nya ada di file sebelah: monitoring-claim.js

   Dibuat 2026-09-30 dari dokumen spesifikasi Modul Claim (bagian
   "Status & tracking", BUKAN dari screenshot MASERP): 4 kartu KPI,
   ringkasan jumlah & nilai per status (chip, bisa diklik untuk filter),
   filter Status/Principal/Jenis + pencarian, dan tabel semua claim
   dengan Nilai Diajukan / ACC / Dipulihkan, umur sejak diajukan, dan
   penanda merah "Terlambat" (lewat batas hari respon Setting Claim
   Principal). Klik No. Claim membuka claim di menu Claim Customer.
   NB: helper claim*() ada di core.js.
========================================================= */

function tplMclPage(f){
  const principals = [...new Map(DATA.claimCustomer.map(c => [c.principalKode, c.principalNama])).entries()];
  return `
    <div class="breadcrumb">Home / Customer &amp; Penjualan / <b>Monitoring Claim</b></div>
    <div class="kpi-row" id="mclKpi"></div>
    <div class="card">
      <div class="card-header dark-header">
        <h3>${icon('chart',15)} Monitoring Claim</h3>
        <div class="toolbar-actions">
          <select class="chip-btn" id="mclPrincipal">
            <option value="">Semua Principal</option>
            ${principals.map(([k,n])=>`<option value="${k}" ${f.principal===k?'selected':''}>${n}</option>`).join('')}
          </select>
          <select class="chip-btn" id="mclJenis">
            <option value="">Semua Jenis</option>
            ${CLAIM_JENIS_LIST.map(j=>`<option ${f.jenis===j?'selected':''}>${j}</option>`).join('')}
          </select>
        </div>
      </div>
      <div style="display:flex;gap:8px;flex-wrap:wrap;padding:12px 18px 0;" id="mclChips"></div>
      <div class="table-toolbar">
        <label style="display:flex;align-items:center;gap:6px;font-size:12.5px;"><input type="checkbox" id="mclTerlambat" ${f.terlambat?'checked':''} style="width:auto;"> Hanya yang terlambat</label>
        <input type="text" id="mclSearch" placeholder="Pencarian Global" value="${f.search||''}">
      </div>
      <div class="table-wrap"><table>
        <thead><tr>
          <th style="width:165px;">No. Claim</th>
          <th style="width:90px;">Tanggal</th>
          <th>Customer</th>
          <th>Principal</th>
          <th style="width:120px;">Jenis / Cara</th>
          <th class="text-right" style="width:115px;">Diajukan</th>
          <th class="text-right" style="width:115px;">ACC</th>
          <th class="text-right" style="width:115px;">Dipulihkan</th>
          <th style="width:105px;">Status</th>
          <th style="width:130px;">Status ke Customer</th>
          <th class="text-right" style="width:90px;">Umur</th>
        </tr></thead>
        <tbody id="mclTbody"></tbody>
      </table></div>
      <div class="table-footer"><div></div><div id="mclTotal"></div></div>
    </div>`;
}

function tplMclKpi(k){
  const card = (color, ic, value, label) => `
    <div class="kpi-card ${color}">
      <div class="kpi-icon">${icon(ic,34)}</div>
      <div class="kpi-value" style="font-size:20px;">${value}</div>
      <div class="kpi-label">${label}</div>
    </div>`;
  return card('kpi-teal', 'clipboard', claimNum2(k.internal), `Proses internal (${k.internalN} claim)`)
    + card('kpi-yellow', 'mail', claimNum2(k.principal), `Menunggu principal (${k.principalN} claim${k.terlambatN?`, ${k.terlambatN} terlambat`:''})`)
    + card('kpi-red', 'wallet', claimNum2(k.sisa), `ACC belum dipulihkan (${k.sisaN} claim)`)
    + card('kpi-green', 'check', claimNum2(k.pulih), `Sudah dipulihkan (${k.pulihN} claim)`);
}

function tplMclChips(counts, aktif){
  return CLAIM_STATUS_LIST.map(s => {
    const c = counts[s] || { n:0, nilai:0 };
    const on = aktif === s;
    return `<button type="button" data-mcl-status="${s}" style="border:1px solid ${on?'var(--blue)':'var(--border)'};background:${on?'#e6f0fb':'#fff'};border-radius:18px;padding:5px 12px;font-size:12px;cursor:pointer;display:flex;gap:6px;align-items:center;">
      ${claimStatusPill(s)} <b>${c.n}</b> <span style="color:var(--text-light);">· ${claimNum2(c.nilai)}</span></button>`;
  }).join('') + (aktif ? `<button type="button" data-mcl-status="" class="btn-link-plain" style="font-size:12px;">Tampilkan semua status</button>` : '');
}

function tplMclRows(rows){
  if(!rows.length) return `<tr><td colspan="11" style="color:var(--text-light);text-align:center;font-weight:600;">Tidak Ada Data</td></tr>`;
  return rows.map(r => {
    const terlambat = claimIsTerlambat(r);
    const p = claimPengajuanOf(r);
    const umur = r.status === 'Diajukan' && p ? `${claimUmurHari(p.tglKirim||p.tgl)} hari` : '-';
    const acc = ['Disetujui','Diproses','Selesai','Ditolak'].includes(r.status);
    return `
    <tr style="${terlambat?'background:#fff5f6;':''}">
      <td><button class="link-pick" data-mcl-open="${r.no}">${r.no}</button></td>
      <td>${r.tgl}</td>
      <td>${r.customerNama}</td>
      <td>${r.principalNama}</td>
      <td>${r.jenis}<div style="font-size:11px;color:var(--text-light);">${r.cara}</div></td>
      <td class="text-right">${claimNum2(r.nilaiClaim)}</td>
      <td class="text-right">${acc ? claimNum2(r.nilaiAcc) : '-'}</td>
      <td class="text-right">${r.nilaiDipulihkan ? claimNum2(r.nilaiDipulihkan) : '-'}</td>
      <td>${claimStatusPill(r.status)}</td>
      <td style="font-size:12px;">${claimStatusCustomer(r)}</td>
      <td class="text-right">${umur}${terlambat ? '<div><span class="status-pill status-overdue">Terlambat</span></div>' : ''}</td>
    </tr>`;
  }).join('');
}
