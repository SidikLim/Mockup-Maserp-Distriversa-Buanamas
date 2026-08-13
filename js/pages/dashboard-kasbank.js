/* =========================================================
   LOGIC (JS saja) — Dashboard Kas/Bank
   Dimuat otomatis (lazy-load) oleh core.js saat menu ini
   pertama kali diklik — lihat PAGE_MODULES di js/core.js.
   Markup HTML-nya ada di file sebelah: dashboard-kasbank.template.js
   (fungsi tplKasBankDashboard()).
========================================================= */
function renderKasBankDashboard(){
  content.innerHTML=tplKasBankDashboard();

  content.querySelectorAll('[data-nav]').forEach(q=>{
    q.onclick=()=>navigate(q.dataset.nav, q.dataset.title || q.querySelector('.flow-label')?.textContent.trim());
  });

  initKasBankCharts();
}

function initKasBankCharts(){
  const fontColor='#5b6178';
  chartInstances.push(new Chart(document.getElementById('chartBankMovement'),{
    type:'bar',
    data:{labels:DATA.bankMovement.labels, datasets:[
      {label:'Debit', data:DATA.bankMovement.debit, backgroundColor:'#4472c4', borderRadius:3},
      {label:'Credit', data:DATA.bankMovement.credit, backgroundColor:'#27ae60', borderRadius:3},
    ]},
    options:{plugins:{legend:{position:'bottom', labels:{color:fontColor}}}, scales:{y:{ticks:{color:fontColor}, grid:{color:'#eef0f6'}}, x:{ticks:{color:fontColor}, grid:{display:false}}}}
  }));
  chartInstances.push(new Chart(document.getElementById('chartLiquidity'),{
    type:'line',
    data:{labels:DATA.liquidityRatio.labels, datasets:[
      {label:'Current Ratio', data:DATA.liquidityRatio.current, borderColor:'#4472c4', backgroundColor:'#4472c4', tension:.3},
      {label:'Quick Ratio', data:DATA.liquidityRatio.quick, borderColor:'#27ae60', backgroundColor:'#27ae60', tension:.3},
      {label:'Cash Ratio', data:DATA.liquidityRatio.cash, borderColor:'#f0b429', backgroundColor:'#f0b429', tension:.3},
    ]},
    options:{plugins:{legend:{position:'bottom', labels:{color:fontColor}}}, scales:{y:{ticks:{color:fontColor}, grid:{color:'#eef0f6'}}, x:{ticks:{color:fontColor}, grid:{display:false}}}}
  }));
}
