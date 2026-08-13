/* =========================================================
   TEMPLATE (HTML saja) — Dashboard Kas/Bank
   Fungsi di file ini HANYA menyusun & mengembalikan markup
   HTML (string), TIDAK ada logic/DOM-binding/chart di sini.
   Logic-nya ada di file sebelah: dashboard-kasbank.js
========================================================= */
function tplKasBankDashboard(){
  return `
    <div class="breadcrumb">Home / <b>Kas/Bank</b> / <b>Dashboard</b></div>

    <div class="card">
      <div class="card-header"><h3>Kas &amp; Bank Dashboard Flow</h3></div>
      <div class="card-body">
        <div class="flow-row">
          <div class="flow-step" data-nav="placeholder" data-title="Jenis Mata Uang"><div class="flow-box quick">${icon('dollar',28)}</div><div class="flow-label">Jenis Mata Uang</div></div>
          <div class="flow-step" data-nav="placeholder" data-title="Daftar Bank"><div class="flow-box quick">${icon('bank',28)}</div><div class="flow-label">Daftar Bank</div></div>
          <div class="flow-arrow">&#8594;</div>
          <div class="flow-step" data-nav="transaksiKas" style="cursor:pointer;"><div class="flow-box">${icon('cash',28)}</div><div class="flow-label">Transaksi Kas</div></div>
          <div class="flow-arrow">&#8594;</div>
          <div class="flow-step" data-nav="placeholder" data-title="Cairkan Giro" style="cursor:pointer;"><div class="flow-box">${icon('folder',28)}</div><div class="flow-label">Cairkan Giro</div></div>
        </div>
      </div>
    </div>

    <div class="grid-2">
      <div class="card">
        <div class="card-header"><h3>Bank Movement</h3><span class="chip">3 Bulan belakang</span></div>
        <div class="card-body"><canvas id="chartBankMovement" height="220"></canvas></div>
      </div>
      <div class="card">
        <div class="card-header"><h3>Liquidity Ratio Analysis</h3><span class="chip">3 Bulan belakang</span></div>
        <div class="card-body"><canvas id="chartLiquidity" height="220"></canvas></div>
      </div>
    </div>
    <div class="footer-note">MOCKUP — PT Distriversa Buanamas &middot; dibuat berdasarkan tema &amp; struktur menu Program MASERP</div>
  `;
}
