/* =========================================================
   TEMPLATE (HTML saja) — Dashboard Supplier & Pembelian
   Fungsi di file ini HANYA menyusun & mengembalikan markup
   HTML (string), TIDAK ada logic/DOM-binding di sini.
   Logic-nya ada di file sebelah: dashboard-supplier.js
========================================================= */
function tplSupplierDashboard(){
  return `
    <div class="breadcrumb">Home / <b>Supplier & Pembelian</b> / <b>Dashboard</b></div>
    <div class="kpi-row">
      ${DATA.supplierKpi.map(k=>`
        <div class="kpi-card ${k.color}">
          <div class="kpi-icon">${icon(k.ic,34)}</div>
          <div class="kpi-value">${k.value}</div>
          <div class="kpi-label">${k.label}</div>
        </div>`).join('')}
    </div>

    <div class="card">
      <div class="card-header"><h3>Purchase Transaction Flow</h3></div>
      <div class="card-body">
        <div class="flow-grid">
          <div class="flow-step" data-nav="purchaseOrder" data-title="Purchase Order" style="grid-column:1;grid-row:1;"><div class="flow-box quick">${icon('file',28)}</div><div class="flow-label">Purchase Order</div></div>
          <div class="flow-arrow" style="grid-column:2;grid-row:1;">&#8594;</div>
          <div class="flow-step" data-nav="terimaBarang" data-title="Terima Barang" style="grid-column:3;grid-row:1;"><div class="flow-box quick">${icon('truck',28)}</div><div class="flow-label">Terima Barang</div></div>
          <div class="flow-arrow" style="grid-column:4;grid-row:1;">&#8594;</div>
          <div class="flow-step" data-nav="pembelianBPB" data-title="Pembelian Melalui BPB" style="grid-column:5;grid-row:1;"><div class="flow-box quick">${icon('card',28)}</div><div class="flow-label">Faktur Pembelian</div></div>

          <div class="flow-step" data-nav="pembelianPO" data-title="Pembelian dari PO" style="grid-column:5;grid-row:2;"><div class="flow-box quick">${icon('cart',28)}</div><div class="flow-label">Pembelian dari PO</div></div>
          <div class="flow-arrow" style="grid-column:6;grid-row:2;">&#8594;</div>
          <div class="flow-step" data-nav="pelunasanUtang" data-title="Pelunasan Utang" style="grid-column:7;grid-row:2;"><div class="flow-box quick">${icon('cash',28)}</div><div class="flow-label">Pelunasan Utang</div></div>

          <div class="flow-step" data-nav="pembelianLangsung" data-title="Pembelian Langsung" style="grid-column:5;grid-row:3;"><div class="flow-box quick">${icon('cart',28)}</div><div class="flow-label">Pembelian Langsung</div></div>

          <div class="flow-step" data-nav="masterSupplier" data-title="Supplier" style="grid-column:1;grid-row:3;"><div class="flow-box quick">${icon('users',28)}</div><div class="flow-label">Daftar Supplier</div></div>
        </div>
      </div>
    </div>

    <div class="card">
      <div class="card-header"><h3>Average Cycle Purchasing (in Days)</h3><span class="chip">Agustus 2026</span></div>
      <div class="card-body">
        <div class="cycle-row">
          <div class="cycle-node"><span class="dot"></span><span>${DATA.purchaseCycle.stages[0]}</span></div>
          <div class="cycle-mid">${DATA.purchaseCycle.gaps[0]}</div>
          <div class="cycle-node"><span class="dot"></span><span>${DATA.purchaseCycle.stages[1]}</span></div>
          <div class="cycle-mid">${DATA.purchaseCycle.gaps[1]}</div>
          <div class="cycle-node"><span class="dot"></span><span>${DATA.purchaseCycle.stages[2]}</span></div>
          <div class="cycle-mid">${DATA.purchaseCycle.gaps[2]}</div>
          <div class="cycle-node"><span class="dot"></span><span>${DATA.purchaseCycle.stages[3]}</span></div>
        </div>
      </div>
    </div>

    <div class="grid-2">
      <div class="card">
        <div class="card-header dark-header"><h3>${icon('users',15)} Account Payable by Supplier</h3></div>
        <div class="table-wrap scroll-table"><table>
          <thead><tr><th>Nama Supplier</th><th>Saldo</th></tr></thead>
          <tbody>${DATA.apBySupplier.map(r=>`<tr><td>${r.nama}</td><td class="text-right">${rp(r.saldo)}</td></tr>`).join('')}</tbody>
        </table></div>
      </div>
      <div class="card">
        <div class="card-header dark-header"><h3>${icon('invoice',15)} Account Payable by Transaction</h3></div>
        <div class="table-wrap scroll-table"><table>
          <thead><tr><th>No. PU</th><th>Nama Supplier</th><th>Tanggal Jatuh Tempo</th><th>Jumlah (Sudah Terbayarkan %)</th></tr></thead>
          <tbody>${DATA.apByTransaction.map(r=>`<tr><td>${r.no}</td><td>${r.nama}</td><td>${r.tempo}</td><td class="text-right">${rp(r.jumlah)} (${r.persen}%)</td></tr>`).join('')}</tbody>
        </table></div>
      </div>
    </div>
    <div class="footer-note">MOCKUP — PT Distriversa Buanamas &middot; dibuat berdasarkan tema &amp; struktur menu Program MASERP</div>
  `;
}
