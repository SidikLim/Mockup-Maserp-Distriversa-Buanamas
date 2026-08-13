/* =========================================================
   TEMPLATE (HTML saja) — Dashboard Customer & Penjualan
   Fungsi di file ini HANYA menyusun & mengembalikan markup
   HTML (string), TIDAK ada logic/DOM-binding/chart di sini.
   Logic-nya ada di file sebelah: dashboard-sales.js
========================================================= */
function tplSalesDashboard(){
  return `
    <div class="breadcrumb">Home / <b>Customer & Penjualan</b> / <b>Dashboard</b></div>
    <div class="kpi-row">
      ${DATA.kpi.map(k=>`
        <div class="kpi-card ${k.color}">
          <div class="kpi-icon">${icon(k.ic,34)}</div>
          <div class="kpi-value">${k.value}</div>
          <div class="kpi-label">${k.label}</div>
        </div>`).join('')}
    </div>

    <div class="card">
      <div class="card-header"><h3>Sales Transaction Flow</h3></div>
      <div class="card-body">
        <div class="flow-row">
          <div class="flow-step" data-nav="salesOrders" data-title="Sales Order"><div class="flow-box quick">${icon('file',28)}</div><div class="flow-label">Sales Order</div></div>
          <div class="flow-arrow">&#8594;</div>
          <div class="flow-step" data-nav="pickingList" data-title="Picking List"><div class="flow-box quick">${icon('clipboard',28)}</div><div class="flow-label">Picking List</div></div>
          <div class="flow-arrow">&#8594;</div>
          <div class="flow-step" data-nav="invoices" data-title="Invoice"><div class="flow-box quick">${icon('truck',28)}</div><div class="flow-label">Invoice</div></div>
          <div class="flow-arrow">&#8594;</div>
          <div class="flow-step" data-nav="packing" data-title="Packing"><div class="flow-box quick">${icon('box',28)}</div><div class="flow-label">Packing</div></div>
          <div class="flow-arrow">&#8594;</div>
          <div class="flow-step" data-nav="fakturPenjualanSJ" data-title="Penjualan Via S.J."><div class="flow-box quick">${icon('invoice',28)}</div><div class="flow-label">Faktur Penjualan</div></div>
          <div class="flow-arrow">&#8594;</div>
          <div class="flow-step" data-nav="penerimaanPiutang" data-title="Penerimaan Piutang"><div class="flow-box quick">${icon('dollar',28)}</div><div class="flow-label">Penerimaan Piutang</div></div>
        </div>
        <div class="flow-extra">
          <div class="flow-step"><div class="flow-box">${icon('file',28)}</div><div class="flow-label">MCD</div></div>
        </div>
        <div class="quick-links">
          <div class="quick-link" data-nav="customers">${icon('users',22)}Daftar Customer</div>
          <div class="quick-link" data-nav="salesman">${icon('users',22)}Daftar Salesman</div>
          <div class="quick-link" data-nav="placeholder" data-title="Tracking Status">${icon('target',22)}Tracking Status</div>
        </div>
      </div>
    </div>

    <div class="grid-2">
      <div class="card">
        <div class="card-header"><h3>Aging Account Receivable</h3></div>
        <div class="card-body"><canvas id="chartAging" height="220"></canvas></div>
      </div>
      <div class="card">
        <div class="card-header"><h3>Total Invoices vs Paid Invoices</h3><span class="chip">3 Bulan belakang</span></div>
        <div class="card-body"><canvas id="chartInvPaid" height="220"></canvas></div>
      </div>
    </div>

    <div class="grid-2">
      <div class="card">
        <div class="card-header"><h3>Invoices By Status</h3></div>
        <div class="card-body"><canvas id="chartStatus" height="220"></canvas></div>
      </div>
      <div class="card">
        <div class="card-header dark-header"><h3>${icon('percent',15)} Average Discount by Salesman</h3><span class="chip">Agustus 2026</span></div>
        <div class="table-wrap"><table>
          <thead><tr><th>Nama Salesman</th><th>Total Penjualan</th><th>Disc(%)</th><th>Total Diskon</th><th>Total Net</th></tr></thead>
          <tbody>${DATA.discSalesman.map(r=>`<tr><td>${r.nama}</td><td class="text-right">${rp(r.penjualan)}</td><td class="text-right">${r.disc.toFixed(2)} %</td><td class="text-right">${rp(r.diskon)}</td><td class="text-right">${rp(r.net)}</td></tr>`).join('')}</tbody>
        </table></div>
        <div class="table-footer"><div class="pager"><button>First</button><button>Previous</button><button class="active">1</button><button>Next</button><button>Last</button></div><div>Total Record: ${DATA.discSalesman.length}</div></div>
      </div>
    </div>

    <div class="grid-2">
      <div class="card">
        <div class="card-header"><h3>Revenue By Branch</h3><span class="chip">Agustus 2026</span></div>
        <div class="card-body"><canvas id="chartBranch" height="220"></canvas></div>
      </div>
      <div class="card">
        <div class="card-header dark-header"><h3>${icon('chart',15)} Best Seller Items</h3><span class="chip">Agustus 2026</span></div>
        <div class="table-wrap"><table>
          <thead><tr><th>Nama Barang</th><th>Total Qty Jual</th><th>Total Jumlah Jual</th></tr></thead>
          <tbody>${DATA.bestSeller.slice(0,10).map(r=>`<tr><td>${r.nama}</td><td class="text-right">${num(r.qty)}</td><td class="text-right">${rp(r.total)}</td></tr>`).join('')}</tbody>
        </table></div>
        <div class="table-footer"><div class="pager"><button>First</button><button>Previous</button><button class="active">1</button><button>Next</button><button>Last</button></div><div>Total Record: ${DATA.bestSeller.length}</div></div>
      </div>
    </div>
    <div class="footer-note">MOCKUP — PT Distriversa Buanamas &middot; dibuat berdasarkan tema &amp; struktur menu Program MASERP</div>
  `;
}
