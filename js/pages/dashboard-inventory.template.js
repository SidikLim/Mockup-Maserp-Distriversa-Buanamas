/* =========================================================
   TEMPLATE (HTML saja) — Dashboard Persediaan Barang
   Fungsi di file ini HANYA menyusun & mengembalikan markup
   HTML (string), TIDAK ada logic/DOM-binding/chart di sini.
   Logic-nya ada di file sebelah: dashboard-inventory.js
========================================================= */
function tplInventoryDashboard(){
  return `
    <div class="breadcrumb">Home / <b>Persediaan Barang</b> / <b>Dashboard</b></div>
    <div class="kpi-row">
      ${DATA.inventoryKpi.map(k=>`
        <div class="kpi-card ${k.color}">
          <div class="kpi-icon">${icon(k.ic,34)}</div>
          <div class="kpi-value">${k.value}</div>
          <div class="kpi-label">${k.label}</div>
        </div>`).join('')}
    </div>

    <div class="card">
      <div class="card-header"><h3>Inventory Dashboard</h3></div>
      <div class="card-body">
        <div class="flow-row">
          <div class="flow-step" data-nav="placeholder" data-title="Kategori Barang"><div class="flow-box quick">${icon('list',28)}</div><div class="flow-label">Kategori Barang</div></div>
          <div class="flow-step" data-nav="placeholder" data-title="Lokasi Gudang"><div class="flow-box quick">${icon('building',28)}</div><div class="flow-label">Lokasi Gudang</div></div>
          <div class="flow-arrow">&#8594;</div>
          <div class="flow-step" data-nav="items"><div class="flow-box quick">${icon('file',28)}</div><div class="flow-label">Daftar Barang</div></div>
          <div class="flow-arrow">&#8594;</div>
          <div class="flow-step"><div class="flow-box">${icon('invoice',28)}</div><div class="flow-label">Transaksi Barang</div></div>
        </div>
      </div>
    </div>

    <div class="card">
      <div class="card-header"><h3>Value of Items by Category</h3><span class="chip">Update Otomatis</span></div>
      <div class="card-body" style="display:flex;justify-content:center;">
        <div style="width:100%;max-width:460px;"><canvas id="chartItemCategory"></canvas></div>
      </div>
    </div>
    <div class="footer-note">MOCKUP — PT Distriversa Buanamas &middot; dibuat berdasarkan tema &amp; struktur menu Program MASERP</div>
  `;
}
