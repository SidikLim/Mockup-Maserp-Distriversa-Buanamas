/* =========================================================
   LOGIC (JS saja) — Dashboard General Ledger
   Dimuat otomatis (lazy-load) oleh core.js saat menu ini
   pertama kali diklik — lihat PAGE_MODULES di js/core.js.
   Markup HTML-nya ada di file sebelah: dashboard-gl.template.js
   (fungsi tplGLDashboard()).
========================================================= */
function renderGLDashboard(){
  content.innerHTML=tplGLDashboard();
  initGLCharts();
}

function initGLCharts(){
  const fontColor='#5b6178';
  const g=DATA.glDashboard;
  const barColor=g.netProfit.map(v=>v<0?'#ef4b62':'#29b6f6');

  chartInstances.push(new Chart(document.getElementById('chartNettProfit'),{
    type:'bar',
    data:{labels:g.labels, datasets:[{label:'Laba Bersih', data:g.netProfit, backgroundColor:barColor, borderRadius:3}]},
    options:{plugins:{legend:{display:false}}, scales:{y:{ticks:{color:fontColor}, grid:{color:'#eef0f6'}}, x:{ticks:{color:fontColor}, grid:{display:false}}}}
  }));
  chartInstances.push(new Chart(document.getElementById('chartRevenue'),{
    type:'bar',
    data:{labels:g.labels, datasets:[{label:'Total Penjualan', data:g.revenue, backgroundColor:'#29b6f6', borderRadius:3}]},
    options:{plugins:{legend:{display:false}}, scales:{y:{ticks:{color:fontColor}, grid:{color:'#eef0f6'}}, x:{ticks:{color:fontColor}, grid:{display:false}}}}
  }));
  chartInstances.push(new Chart(document.getElementById('chartOpex'),{
    type:'bar',
    data:{labels:g.labels, datasets:[{label:'Biaya Operasional', data:g.opex, backgroundColor:'#29b6f6', borderRadius:3}]},
    options:{plugins:{legend:{display:false}}, scales:{y:{ticks:{color:fontColor}, grid:{color:'#eef0f6'}}, x:{ticks:{color:fontColor}, grid:{display:false}}}}
  }));
  chartInstances.push(new Chart(document.getElementById('chartCogs'),{
    type:'bar',
    data:{labels:g.labels, datasets:[{label:'Total COGS', data:g.cogs, backgroundColor:'#29b6f6', borderRadius:3}]},
    options:{plugins:{legend:{display:false}}, scales:{y:{ticks:{color:fontColor}, grid:{color:'#eef0f6'}}, x:{ticks:{color:fontColor}, grid:{display:false}}}}
  }));
  chartInstances.push(new Chart(document.getElementById('chartMargin'),{
    data:{labels:g.labels, datasets:[
      {type:'bar', label:'Revenue', data:g.revenue, backgroundColor:'#29b6f6', borderRadius:3, yAxisID:'y'},
      {type:'bar', label:'Net Profit', data:g.netProfit, backgroundColor:'#27ae60', borderRadius:3, yAxisID:'y'},
      {type:'line', label:'Profit Margin (%)', data:g.revenue.map((r,i)=> r? +(g.netProfit[i]/r*100).toFixed(1) : 0), borderColor:'#f0b429', backgroundColor:'#f0b429', tension:.3, yAxisID:'y1'},
    ]},
    options:{plugins:{legend:{position:'bottom', labels:{color:fontColor}}}, scales:{
      y:{position:'left', ticks:{color:fontColor}, grid:{color:'#eef0f6'}},
      y1:{position:'right', ticks:{color:fontColor}, grid:{drawOnChartArea:false}},
      x:{ticks:{color:fontColor}, grid:{display:false}},
    }}
  }));
  chartInstances.push(new Chart(document.getElementById('chartOmsetCabang'),{
    type:'bar',
    data:{labels:DATA.revenueBranch.labels, datasets:[{label:'Omset (Jt)', data:DATA.revenueBranch.data.map(v=>Math.round(v/1000000)), backgroundColor:DATA.revenueBranch.colors, borderRadius:3}]},
    options:{plugins:{legend:{display:false}}, scales:{y:{ticks:{color:fontColor}, grid:{color:'#eef0f6'}}, x:{ticks:{color:fontColor}, grid:{display:false}}}}
  }));
}
