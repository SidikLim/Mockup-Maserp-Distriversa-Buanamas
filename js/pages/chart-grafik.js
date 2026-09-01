/* =========================================================
   LOGIC (JS saja) — Chart / Grafik (Daftar Laporan > Chart /
   Grafik, page:'chartGrafik'). Dimuat otomatis (lazy-load)
   oleh core.js — lihat PAGE_MODULES di js/core.js. Markup di
   file sebelah: chart-grafik.template.js (catatan desain &
   pemetaan screenshot SDL -> DBM di headernya).
   NB: closeModal() dipakai bersama, didefinisikan di core.js.

   Semua chart Chart.js (vendor global). Instance disimpan di
   cgCharts dan di-destroy sebelum digambar ulang (ganti chip
   bulan/jenis atau Terapkan parameter). Sumber data DBM:
   produk = DATA.items (nilai omset = harga x stok, mockup);
   salesman = DATA.salesman.realisasi; customer =
   DATA.customers.piutang (Saldo); wilayah = DATA.wilayah
   (5 wilayah bernilai + sisanya 0.00 seperti screenshot).
   Chip bulan FUNGSIONAL (Agustus = ~85-90% nilai September);
   chip jenis: "Retur Penjualan" menampilkan ~6% nilai
   Penjualan. Panel "Use Parameter": Top 10 Customer Use
   Parameter awalnya SEMUA 0.00 (persis screenshot) dan baru
   terisi setelah modal Show Parameter di-Terapkan; Top 10
   Product by Omset langsung berisi nilai. */

const CG_WARNA = ['#2e6bd6','#a8c4ef','#f28c28','#8fd18f','#e04b4b','#f3c96b','#7d55c7','#d9a7e0','#2f9e8f','#f2a3b3'];

let cgCharts = {};
let cgParamCustomerAktif = false;
let cgParamState = { dari:'01/09/2026', sampai:'30/09/2026', cabang:'Semua Cabang' };

function renderChartGrafikPage(){
  Object.values(cgCharts).forEach(c => { try{ c.destroy(); }catch(e){} });
  cgCharts = {};
  cgParamCustomerAktif = false;
  cgParamState = { dari:'01/09/2026', sampai:'30/09/2026', cabang:'Semua Cabang' };
  content.innerHTML = tplCgPage();

  const wire = (id, fn) => { const el = document.getElementById(id); if(el) el.onchange = fn; };
  wire('cgProdukBulan', cgRenderProduk); wire('cgProdukJenis', cgRenderProduk);
  wire('cgSalesmanBulan', cgRenderSalesman);
  wire('cgCustomerBulan', cgRenderCustomer); wire('cgCustomerJenis', cgRenderCustomer);
  wire('cgWilayahBulan', cgRenderWilayah); wire('cgWilayahJenis', cgRenderWilayah);
  document.getElementById('btnCgParamCustomer').onclick = () => openCgParam('Top 10 Customer Use Parameter', () => {
    cgParamCustomerAktif = true;
    cgRenderCustomerParam();
  });
  document.getElementById('btnCgParamProduk').onclick = () => openCgParam('Top 10 Product by Omset Use Parameter', () => {
    cgRenderProdukOmset();
  });

  cgRenderProduk();
  cgRenderSalesman();
  cgRenderCustomer();
  cgRenderWilayah();
  cgRenderCustomerParam();
  cgRenderProdukOmset();
}

function cgFaktor(bulanSelId, jenisSelId){
  const bulan = (document.getElementById(bulanSelId)||{}).value || '09';
  let f = bulan === '08' ? 0.87 : 1;
  if(jenisSelId){
    const jenis = (document.getElementById(jenisSelId)||{}).value || 'Penjualan';
    if(jenis === 'Retur Penjualan') f *= 0.06;
  }
  return f;
}

function cgGambar(key, canvasId, config){
  const el = document.getElementById(canvasId);
  if(!el) return;
  if(cgCharts[key]){ try{ cgCharts[key].destroy(); }catch(e){} }
  cgCharts[key] = new Chart(el.getContext('2d'), config);
}

function cgPieConfig(labels, values){
  return {
    type:'pie',
    data:{ labels, datasets:[{ data: values, backgroundColor: CG_WARNA, borderColor:'#fff', borderWidth:1 }] },
    options:{ responsive:true, maintainAspectRatio:false,
      plugins:{ legend:{ position:'top', labels:{ boxWidth:9, font:{ size:10 } } } } }
  };
}

function cgHbarConfig(labels, values){
  return {
    type:'bar',
    data:{ labels, datasets:[{ label:'Saldo', data: values, backgroundColor:'#5b93c9' }] },
    options:{ indexAxis:'y', responsive:true, maintainAspectRatio:false,
      plugins:{ legend:{ position:'top', align:'end', labels:{ boxWidth:9, font:{ size:10 } } } },
      scales:{ x:{ title:{ display:true, text:'Jumlah (Saldo)', font:{ size:10 } }, ticks:{ font:{ size:9 } } },
               y:{ ticks:{ font:{ size:10 } } } } }
  };
}

/* ---- sumber data DBM ---- */
function cgDataProduk(){
  return (DATA.items||[]).slice(0,10).map(it => ({ label: it.nama, nilai: Number(it.harga||0) * Number(it.stok||0) }));
}

function cgDataSalesman(){
  return (DATA.salesman||[]).slice(0,10).map(s => ({ label: s.nama, nilai: Number(s.realisasi||0) }));
}

function cgDataCustomer(){
  return (DATA.customers||[]).slice(0,10)
    .map(c => ({ label: (c.nama||'').toUpperCase(), nilai: Number(c.piutang||0) }))
    .sort((a,b) => b.nilai - a.nilai);
}

function cgDataWilayah(){
  const nilaiTetap = [816354882, 226619621, 90681543, 34437910, 12750000, 0, 0, 0, 0];
  return (DATA.wilayah||[]).slice(0,9).map((w,i) => ({ label: w, nilai: nilaiTetap[i] || 0 }));
}

/* ---- render per panel ---- */
function cgRenderProduk(){
  const f = cgFaktor('cgProdukBulan','cgProdukJenis');
  const d = cgDataProduk();
  cgGambar('produk','cgChartProduk', cgPieConfig(d.map(x=>x.label), d.map(x=>Math.round(x.nilai*f))));
}

function cgRenderSalesman(){
  const f = cgFaktor('cgSalesmanBulan');
  const d = cgDataSalesman();
  cgGambar('salesman','cgChartSalesman', cgPieConfig(d.map(x=>x.label), d.map(x=>Math.round(x.nilai*f))));
}

function cgRenderCustomer(){
  const f = cgFaktor('cgCustomerBulan','cgCustomerJenis');
  const d = cgDataCustomer();
  cgGambar('customer','cgChartCustomer', cgHbarConfig(d.map(x=>x.label), d.map(x=>Math.round(x.nilai*f))));
}

function cgRenderWilayah(){
  const f = cgFaktor('cgWilayahBulan','cgWilayahJenis');
  const d = cgDataWilayah();
  cgGambar('wilayah','cgChartWilayah', cgHbarConfig(d.map(x=>x.label), d.map(x=>Math.round(x.nilai*f))));
}

function cgRenderCustomerParam(){
  const d = cgDataCustomer();
  const values = cgParamCustomerAktif ? d.map(x=>Math.round(x.nilai*0.72)) : d.map(()=>0);
  cgGambar('customerParam','cgChartCustomerParam', cgHbarConfig(d.map(x=>x.label), values));
}

function cgRenderProdukOmset(){
  const d = cgDataProduk().sort((a,b)=>b.nilai-a.nilai);
  cgGambar('produkOmset','cgChartProdukOmset', cgHbarConfig(d.map(x=>x.label), d.map(x=>x.nilai)));
}

/* ---- modal parameter ---- */
function openCgParam(judul, onTerapkan){
  closeModal();
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.innerHTML = tplCgParamModal(judul, cgParamState);
  document.body.appendChild(overlay);
  document.getElementById('modalClose').onclick = closeModal;
  document.getElementById('modalCancel').onclick = closeModal;
  overlay.onclick = (e) => { if(e.target === overlay) closeModal(); };
  document.getElementById('cgTerapkan').onclick = () => {
    cgParamState = {
      dari: document.getElementById('fCgDari').value.trim(),
      sampai: document.getElementById('fCgSampai').value.trim(),
      cabang: document.getElementById('fCgCabang').value,
    };
    closeModal();
    onTerapkan();
  };
}
