/* =========================================================
   LOGIC (JS saja) — Dashboard Customer & Penjualan
   Dimuat otomatis (lazy-load) oleh core.js saat menu ini
   pertama kali diklik — lihat PAGE_MODULES di js/core.js.
   Markup HTML-nya ada di file sebelah: dashboard-sales.template.js
   (fungsi tplSalesDashboard()).
========================================================= */
function renderSalesDashboard(){
  content.innerHTML=tplSalesDashboard();

  // Ikon-ikon "Sales Transaction Flow" (Sales Order/Picking List/Invoice/
  // Packing/Faktur Penjualan/Penerimaan Piutang) & quick-links (Daftar
  // Customer/Daftar Salesman/Tracking Status) sekarang bisa diklik langsung
  // ke halaman list masing-masing — sejak 2026-08-12 lanjutan lagi,
  // sebelumnya flow-icon cuma ilustrasi statis tanpa navigasi. Pola
  // wiring-nya sama seperti yang sudah dipakai di dashboard lain
  // (dashboard-inventory.js/dashboard-kasbank.js/dashboard-supplier.js):
  // selector generik `[data-nav]` yang otomatis menangkap baik `.quick-link`
  // maupun `.flow-step`, jadi tidak perlu class/selector khusus per dashboard.
  content.querySelectorAll('[data-nav]').forEach(q=>{
    q.onclick=()=>navigate(q.dataset.nav, q.dataset.title || q.querySelector('.flow-label')?.textContent.trim() || q.textContent.trim());
  });

  initCharts();
}

function initCharts(){
  const fontColor='#5b6178';
  chartInstances.push(new Chart(document.getElementById('chartAging'),{
    type:'bar',
    data:{labels:DATA.agingAR.labels, datasets:[{label:'Nilai (Rp ribu)', data:DATA.agingAR.data, backgroundColor:'#29b6f6', borderRadius:3}]},
    options:{plugins:{legend:{display:false}}, scales:{y:{ticks:{color:fontColor}, grid:{color:'#eef0f6'}}, x:{ticks:{color:fontColor}, grid:{display:false}}}}
  }));
  chartInstances.push(new Chart(document.getElementById('chartInvPaid'),{
    type:'bar',
    data:{labels:DATA.invVsPaid.labels, datasets:[
      {label:'Total Invoice', data:DATA.invVsPaid.invoice, backgroundColor:'#4472c4', borderRadius:3},
      {label:'Paid', data:DATA.invVsPaid.paid, backgroundColor:'#27ae60', borderRadius:3},
    ]},
    options:{plugins:{legend:{position:'bottom', labels:{color:fontColor}}}, scales:{y:{ticks:{color:fontColor}, grid:{color:'#eef0f6'}}, x:{ticks:{color:fontColor}, grid:{display:false}}}}
  }));
  chartInstances.push(new Chart(document.getElementById('chartStatus'),{
    type:'doughnut',
    data:{labels:DATA.invStatus.labels, datasets:[{data:DATA.invStatus.data, backgroundColor:DATA.invStatus.colors}]},
    options:{plugins:{legend:{position:'bottom', labels:{color:fontColor}}}}
  }));
  chartInstances.push(new Chart(document.getElementById('chartBranch'),{
    type:'pie',
    data:{labels:DATA.revenueBranch.labels, datasets:[{data:DATA.revenueBranch.data, backgroundColor:DATA.revenueBranch.colors}]},
    options:{plugins:{legend:{position:'bottom', labels:{color:fontColor, boxWidth:12, font:{size:11}}}}}
  }));
}
