/* =========================================================
   LOGIC (JS saja) — Dashboard Persediaan Barang
   Dimuat otomatis (lazy-load) oleh core.js saat menu ini
   pertama kali diklik — lihat PAGE_MODULES di js/core.js.
   Markup HTML-nya ada di file sebelah: dashboard-inventory.template.js
   (fungsi tplInventoryDashboard()).
========================================================= */
function renderInventoryDashboard(){
  content.innerHTML=tplInventoryDashboard();

  content.querySelectorAll('[data-nav]').forEach(q=>{
    q.onclick=()=>navigate(q.dataset.nav, q.dataset.title || q.querySelector('.flow-label')?.textContent.trim());
  });

  initInventoryChart();
}

function initInventoryChart(){
  const fontColor='#5b6178';
  const byCat={};
  DATA.items.forEach(it=>{ byCat[it.kategori]=(byCat[it.kategori]||0)+it.stok*it.harga; });
  const labels=Object.keys(byCat);
  const values=Object.values(byCat);
  const palette=['#4472c4','#a8c4e8','#f0b429','#e8845e','#27ae60','#8e5ea2','#29b6f6','#ef4b62'];
  chartInstances.push(new Chart(document.getElementById('chartItemCategory'),{
    type:'pie',
    data:{labels, datasets:[{data:values, backgroundColor:labels.map((_,i)=>palette[i%palette.length])}]},
    options:{plugins:{legend:{position:'top', labels:{color:fontColor, boxWidth:10, font:{size:11}}}}}
  }));
}
