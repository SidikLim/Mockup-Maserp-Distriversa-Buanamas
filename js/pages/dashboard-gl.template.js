/* =========================================================
   TEMPLATE (HTML saja) — Dashboard General Ledger
   Fungsi di file ini HANYA menyusun & mengembalikan markup
   HTML (string), TIDAK ada logic/DOM-binding/chart di sini.
   Logic-nya ada di file sebelah: dashboard-gl.js
========================================================= */
function tplGLDashboard(){
  const g=DATA.glDashboard;
  return `
    <div class="breadcrumb">Home / <b>General Ledger</b> / <b>Dashboard</b></div>

    <div class="grid-2">
      <div class="card">
        <div class="card-header"><h3>Nett Profit<span class="sub">Laba Bersih</span></h3><span class="chip">3 Bulan belakang</span></div>
        <div class="card-body"><canvas id="chartNettProfit" height="220"></canvas></div>
      </div>
      <div class="card">
        <div class="card-header"><h3>Total Revenue<span class="sub">Total Penjualan</span></h3><span class="chip">3 Bulan belakang</span></div>
        <div class="card-body"><canvas id="chartRevenue" height="220"></canvas></div>
      </div>
    </div>

    <div class="grid-2">
      <div class="card">
        <div class="card-header"><h3>Operation Expense<span class="sub">Biaya Operasional Usaha</span></h3><span class="chip">3 Bulan belakang</span></div>
        <div class="card-body"><canvas id="chartOpex" height="220"></canvas></div>
      </div>
      <div class="card">
        <div class="card-header"><h3>COGS<span class="sub">Total COGS</span></h3><span class="chip">3 Bulan belakang</span></div>
        <div class="card-body"><canvas id="chartCogs" height="220"></canvas></div>
      </div>
    </div>

    <div class="grid-2">
      <div class="card">
        <div class="card-header"><h3>Profit Margin Analysis</h3><span class="chip">3 Bulan belakang</span></div>
        <div class="card-body"><canvas id="chartMargin" height="220"></canvas></div>
      </div>
      <div class="card">
        <div class="card-header"><h3>Omset per Cabang</h3><span class="chip">Minggu Ini</span></div>
        <div class="card-body"><canvas id="chartOmsetCabang" height="220"></canvas></div>
      </div>
    </div>

    <div class="card">
      <div class="card-header dark-header"><h3>${icon('target',15)} Budget vs Actual</h3><span class="chip">Agustus 2026</span></div>
      <div class="table-toolbar">
        <select><option>Semua Akun</option><option>Pendapatan</option><option>Beban</option></select>
        <input type="text" placeholder="Pencarian Global">
      </div>
      <div class="table-wrap"><table>
        <thead><tr><th>Kode Akun</th><th>Nama Akun</th><th>Budget</th><th>Realisasi</th></tr></thead>
        <tbody>${DATA.budgetVsActual.map(r=>`<tr><td>${r.kode}</td><td>${r.nama}</td><td class="text-right">${rp(r.budget)}</td><td class="text-right">${rp(r.realisasi)}</td></tr>`).join('')}</tbody>
      </table></div>
      <div class="table-footer"><div class="pager"><button>First</button><button>Previous</button><button class="active">1</button><button>Next</button><button>Last</button></div><div>Total Record: ${DATA.budgetVsActual.length}</div></div>
    </div>
    <div class="footer-note">MOCKUP — PT Distriversa Buanamas &middot; dibuat berdasarkan tema &amp; struktur menu Program MASERP</div>
  `;
}
