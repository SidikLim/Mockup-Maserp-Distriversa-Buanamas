/* =========================================================
   CORE — sidebar, navigasi, dan lazy-loader modul per menu

   File ini SENGAJA dibuat kecil dan selalu dimuat di awal
   (bareng icons.js/data.js/menu.js). Kode tiap dashboard/
   halaman menu ada di file terpisah di js/pages/*.js, dan
   BARU dimuat (di-inject sebagai <script>) begitu menu itu
   diklik untuk pertama kalinya — lihat PAGE_MODULES di bawah.
   Tujuannya: index.html tidak perlu membaca & mem-parsing
   seluruh kode semua dashboard sekaligus saat pertama dibuka,
   supaya tetap ringan walau jumlah menu terus bertambah.
========================================================= */
let currentPage='mainDashboard', currentTitle=null;
const sidebarScroll=document.getElementById('sidebarScroll');

function buildSidebar(){
  sidebarScroll.innerHTML='';
  MENU.forEach((top,ti)=>{
    if(top.children){
      const wrap=document.createElement('div');
      const head=document.createElement('div');
      head.className='menu-top'+(top.open?' open':'');
      head.innerHTML=`${icon(top.icon)}<span>${top.label}</span><span class="chev">&#9656;</span>`;
      const sub=document.createElement('div');
      sub.className='submenu'+(top.open?' open':'');
      top.children.forEach(c=>{
        if(c.header){
          const h=document.createElement('div');
          h.className='submenu-header';
          h.textContent=c.header;
          sub.appendChild(h);
        }else{
          const it=document.createElement('div');
          it.className='submenu-item';
          it.innerHTML=`<span class="dot"></span><span>${c.label}</span>`;
          it.onclick=()=>{
            navigate(c.page, c.title||c.label, it);
            document.querySelectorAll('.menu-top').forEach(m=>m.classList.remove('active-parent'));
            if(top.page) head.classList.add('active-parent');
          };
          sub.appendChild(it);
        }
      });
      head.onclick=()=>{
        const willOpen=!head.classList.contains('open');
        document.querySelectorAll('.menu-top').forEach(m=>m.classList.remove('open'));
        document.querySelectorAll('.submenu').forEach(m=>m.classList.remove('open'));
        if(willOpen){ head.classList.add('open'); sub.classList.add('open'); }
        if(top.page){ navigate(top.page, top.label, head, true); }
      };
      wrap.appendChild(head); wrap.appendChild(sub);
      sidebarScroll.appendChild(wrap);
    }else{
      const leaf=document.createElement('div');
      leaf.className='menu-top leaf';
      leaf.innerHTML=`${icon(top.icon)}<span>${top.label}</span>`;
      leaf.onclick=()=>{
        document.querySelectorAll('.menu-top').forEach(m=>m.classList.remove('open','active-parent'));
        document.querySelectorAll('.submenu').forEach(m=>m.classList.remove('open'));
        navigate(top.page, top.label, leaf);
      };
      sidebarScroll.appendChild(leaf);
    }
  });
}

function navigate(page,title,el,isParent){
  currentPage=page; currentTitle=title;
  document.querySelectorAll('.submenu-item, .menu-top.leaf').forEach(x=>x.classList.remove('current'));
  if(isParent){
    document.querySelectorAll('.menu-top').forEach(m=>m.classList.remove('active-parent'));
    if(el) el.classList.add('active-parent');
  }else if(el){
    el.classList.add('current');
  }
  renderPage();
}

/* =========================================================
   LAZY-LOAD MODUL PER MENU
   Tiap entry = {srcs, fn}. `srcs` adalah DAFTAR file JS yang
   harus dimuat berurutan untuk menu itu — selalu 2 file:
   1) file *.template.js  → HANYA berisi markup HTML (fungsi
      tpl...() yang mengembalikan string HTML, tanpa logic).
   2) file logic-nya (nama sama tanpa ".template") → berisi
      fungsi render...() yang memanggil tpl...() lalu mengurus
      DOM-binding/event/chart/data — TANPA markup HTML mentah.
   `fn` = nama fungsi render yang dipanggil setelah kedua file
   itu selesai dimuat.
   Sekali dimuat, key menunya disimpan di `loadedModules`
   supaya klik berikutnya ke menu yang sama tidak fetch ulang.
========================================================= */
const PAGE_MODULES={
  mainDashboard:{srcs:['js/pages/dashboard-main.template.js','js/pages/dashboard-main.js'], fn:'renderMainDashboard'},
  salesDashboard:{srcs:['js/pages/dashboard-sales.template.js','js/pages/dashboard-sales.js'], fn:'renderSalesDashboard'},
  supplierDashboard:{srcs:['js/pages/dashboard-supplier.template.js','js/pages/dashboard-supplier.js'], fn:'renderSupplierDashboard'},
  inventoryDashboard:{srcs:['js/pages/dashboard-inventory.template.js','js/pages/dashboard-inventory.js'], fn:'renderInventoryDashboard'},
  kasbankDashboard:{srcs:['js/pages/dashboard-kasbank.template.js','js/pages/dashboard-kasbank.js'], fn:'renderKasBankDashboard'},
  glDashboard:{srcs:['js/pages/dashboard-gl.template.js','js/pages/dashboard-gl.js'], fn:'renderGLDashboard'},
  divisi:{srcs:['js/pages/master-divisi.template.js','js/pages/master-divisi.js'], fn:'renderDivisiPage'},
  businessCentre:{srcs:['js/pages/business-centre.template.js','js/pages/business-centre.js'], fn:'renderBusinessCentrePage'},
  supplierGroup:{srcs:['js/pages/supplier-group.template.js','js/pages/supplier-group.js'], fn:'renderSupplierGroupPage'},
  masterSupplier:{srcs:['js/pages/master-supplier.template.js','js/pages/master-supplier.js'], fn:'renderMasterSupplierPage'},
  jurnalPembelian:{srcs:['js/pages/jurnal-pembelian.template.js','js/pages/jurnal-pembelian.js'], fn:'renderJurnalPembelianPage'},
  jurnalPenjualan:{srcs:['js/pages/jurnal-penjualan.template.js','js/pages/jurnal-penjualan.js'], fn:'renderJurnalPenjualanPage'},
  glKategori:{srcs:['js/pages/gl-kategori.template.js','js/pages/gl-kategori.js'], fn:'renderGlKategoriPage'},
  akunGL:{srcs:['js/pages/akun-gl.template.js','js/pages/akun-gl.js'], fn:'renderAkunGLPage'},
  stockRequest:{srcs:['js/pages/stock-request.template.js','js/pages/stock-request.js'], fn:'renderStockRequestPage'},
  purchaseOrder:{srcs:['js/pages/purchase-order.template.js','js/pages/purchase-order.js'], fn:'renderPurchaseOrderPage'},
  kategoriBarang:{srcs:['js/pages/kategori-barang.template.js','js/pages/kategori-barang.js'], fn:'renderKategoriBarangPage'},
  customerGroup:{srcs:['js/pages/customer-group.template.js','js/pages/customer-group.js'], fn:'renderCustomerGroupPage'},
  promotion:{srcs:['js/pages/promotion.template.js','js/pages/promotion.js'], fn:'renderPromotionPage'},
  salesOrders:{srcs:['js/pages/sales-order.template.js','js/pages/sales-order.js'], fn:'renderSalesOrderPage'},
  pickingList:{srcs:['js/pages/picking-list.template.js','js/pages/picking-list.js'], fn:'renderPickingListPage'},
  invoices:{srcs:['js/pages/invoice.template.js','js/pages/invoice.js'], fn:'renderInvoicePage'},
  fakturPenjualanSJ:{srcs:['js/pages/faktur-penjualan-sj.template.js','js/pages/faktur-penjualan-sj.js'], fn:'renderFakturPenjualanSJPage'},
  gudang:{srcs:['js/pages/gudang.template.js','js/pages/gudang.js'], fn:'renderGudangPage'},
  kasBank:{srcs:['js/pages/kas-bank.template.js','js/pages/kas-bank.js'], fn:'renderKasBankPage'},
  reports:{srcs:['js/pages/reports.template.js','js/pages/reports.js'], fn:'renderReports'},
  companyProfile:{srcs:['js/pages/company-profile.template.js','js/pages/company-profile.js'], fn:'renderCompanyProfile'},
};
const loadedModules=new Set();

function loadScriptsSequential(srcs, onDone){
  let i=0;
  function next(){
    if(i>=srcs.length) return onDone();
    const src=srcs[i];
    const s=document.createElement('script');
    s.src=src;
    s.onload=()=>{ i++; next(); };
    s.onerror=()=>{
      content.innerHTML=`<div class="card"><div class="card-body">Gagal memuat modul <code>${src}</code>.</div></div>`;
    };
    document.body.appendChild(s);
  }
  next();
}

/* =========================================================
   PAGE RENDERERS (infrastruktur bersama)
========================================================= */
const content=document.getElementById('content');
let chartInstances=[];
function destroyCharts(){ chartInstances.forEach(c=>c.destroy()); chartInstances=[]; }

function renderPage(){
  destroyCharts();
  if(currentPage==='placeholder') return renderPlaceholder(currentTitle);

  const mod=PAGE_MODULES[currentPage];
  if(mod){
    if(loadedModules.has(currentPage)){
      return window[mod.fn]();
    }
    content.innerHTML='<div class="page-loading">Memuat halaman&hellip;</div>';
    return loadScriptsSequential(mod.srcs, ()=>{ loadedModules.add(currentPage); window[mod.fn](); });
  }

  const pages={
    customers:{title:'Customer', cols:[['kode','Kode'],['nama','Nama Customer'],['kota','Kota'],['salesman','Salesman'],['limit','Limit Kredit',true],['status','Status','pill']], rows:DATA.customers},
    salesman:{title:'Salesman', cols:[['nama','Nama Salesman'],['area','Area'],['target','Target',true],['realisasi','Realisasi',true]], rows:DATA.salesman},
    packing:{title:'Packing', cols:[['no','No. Packing'],['tgl','Tanggal'],['so','No. SO'],['status','Status','pill']], rows:DATA.packing},
    penerimaanPiutang:{title:'Penerimaan Piutang', cols:[['no','No. Penerimaan'],['tgl','Tanggal'],['customer','Customer'],['jumlah','Jumlah',true],['metode','Metode']], rows:DATA.penerimaanPiutang},
    items:{title:'Daftar Barang', cols:[['kode','Kode'],['nama','Nama Barang'],['kategori','Kategori'],['satuan','Satuan'],['stok','Stok','num'],['harga','Harga',true]], rows:DATA.items},
    kasMasuk:{title:'Kas Masuk', cols:[['tgl','Tanggal'],['ket','Keterangan'],['kategori','Kategori'],['jumlah','Jumlah',true]], rows:DATA.kasMasuk},
    kasKeluar:{title:'Kas Keluar', cols:[['tgl','Tanggal'],['ket','Keterangan'],['kategori','Kategori'],['jumlah','Jumlah',true]], rows:DATA.kasKeluar},
    transaksiKas:{title:'Transaksi Kas', cols:[['tgl','Tanggal'],['ket','Keterangan'],['tipe','Tipe','pill'],['kategori','Kategori'],['jumlah','Jumlah',true]], rows:DATA.transaksiKas},
    jurnalUmum:{title:'Jurnal Umum', cols:[['tgl','Tanggal'],['no','No. Jurnal'],['akun','Akun'],['debit','Debit',true],['kredit','Kredit',true]], rows:DATA.jurnalUmum},
    aktivaTetap:{title:'Daftar Aktiva Tetap', cols:[['kode','Kode'],['nama','Nama Aktiva'],['tahun','Tahun'],['nilai','Nilai Perolehan',true],['akumulasi','Akum. Penyusutan',true],['buku','Nilai Buku',true]], rows:DATA.aktivaTetap},
    users:{title:'Daftar User', cols:[['nama','Nama'],['username','Username'],['role','Role'],['status','Status','pill']], rows:DATA.users},
  };
  const cfg=pages[currentPage];
  if(cfg) return renderListPage(cfg);
  return renderPlaceholder(currentTitle||'Halaman');
}

function fmtCell(val,type){
  if(type==='num') return Number.isFinite(val)? num(val) : val;
  if(type===true) return Number.isFinite(val)? rp(val) : val;
  if(type==='pill'){
    const v=String(val).toLowerCase();
    let cls='status-open';
    if(v==='aktif'||v==='paid'||v==='closed'||v==='selesai'||v==='masuk') cls='status-paid';
    else if(v==='non aktif'||v==='overdue'||v==='keluar') cls='status-overdue';
    return `<span class="status-pill ${cls}">${val}</span>`;
  }
  return val;
}

function renderListPage(cfg){
  const rows=cfg.rows;
  content.innerHTML=`
    <div class="breadcrumb">Home / <b>${cfg.title}</b></div>
    <div class="page-head">
      <h2>${cfg.title}</h2>
      <button class="btn-primary">${icon('grid',14)} Tambah ${cfg.title}</button>
    </div>
    <div class="card">
      <div class="table-toolbar">
        <select><option>10</option><option>25</option><option>50</option></select>
        <input type="text" placeholder="Pencarian Global">
      </div>
      <div class="table-wrap">
        <table>
          <thead><tr>${cfg.cols.map(c=>`<th>${c[1]}</th>`).join('')}</tr></thead>
          <tbody>
            ${rows.map(r=>`<tr>${cfg.cols.map(c=>{
              const val=r[c[0]];
              const cell=fmtCell(val,c[2]);
              const align=(c[2]===true||c[2]==='num')?'text-right':'';
              return `<td class="${align}">${cell}</td>`;
            }).join('')}</tr>`).join('')}
          </tbody>
        </table>
      </div>
      <div class="table-footer">
        <div class="pager">
          <button>First</button><button>Previous</button><button class="active">1</button><button>Next</button><button>Last</button>
        </div>
        <div>Total Record: ${rows.length}</div>
      </div>
    </div>`;
}

function renderPlaceholder(title){
  content.innerHTML=`
    <div class="breadcrumb">Home / <b>${title||'Halaman'}</b></div>
    <div class="page-head"><h2>${title||'Halaman'}</h2></div>
    <div class="card"><div class="card-body">
      <div class="placeholder-box">
        <div class="pico">${icon('wrench',46)}</div>
        <h3 style="font-size:15px;font-weight:700;color:#5b6178;">Contoh Tampilan Mockup</h3>
        <p>Halaman <b>${title}</b> ini adalah contoh mockup tampilan menu untuk PT Distriversa Buanamas. Layout, field, dan data pada modul ini akan disesuaikan lebih lanjut sesuai kebutuhan proses bisnis perusahaan.</p>
      </div>
    </div></div>`;
}

/* =========================================================
   MODAL HELPER (dipakai bersama oleh semua halaman CRUD,
   misal js/pages/master-divisi.js & js/pages/business-centre.js)
========================================================= */
function closeModal(){
  const modals=document.querySelectorAll('.modal-overlay');
  if(modals.length) modals[modals.length-1].remove();
}

/* =========================================================
   PICKER "DAFTAR PERSEDIAAN" (dipakai bersama oleh SEMUA modul
   transaksi yang punya field "Kode Barang": Purchase Order, Sales
   Order, Picking List, Faktur Penjualan Via S.J. — sejak 2026-08-12
   lanjutan lagi, menggantikan popup "Pilih Barang" versi lama yang
   cuma tampil Kode/Nama/Harga per modul (tplPoItemPicker/
   tplSoItemPicker/tplPklItemPicker/tplFktItemPicker — SUDAH DIHAPUS,
   lihat catatan proyek). Ditaruh di core.js (BUKAN di salah satu
   js/pages/*.js) karena dipakai lintas-modul & core.js selalu
   dimuat di awal, jadi otomatis tersedia untuk semua modul tanpa
   perlu di-lazy-load ulang.

   Sumber data: DATA.persediaan (lihat komentar lengkap di js/data.js)
   — 1 baris per kombinasi Gudang Utama x Barang. Dipanggil dari modul
   manapun cukup lewat 1 fungsi: openPersediaanPicker(cabang, onPick).
   `cabang` dipakai untuk filter baris persediaan supaya modal hanya
   menampilkan stok di Gudang Utama milik cabang transaksi yang sedang
   dibuka (kalau cabang belum match apa pun di DATA.persediaan, modal
   fallback menampilkan SEMUA baris supaya tetap ada isi). `onPick`
   dipanggil dengan 1 argumen (baris DATA.persediaan yang diklik) begitu
   user klik teks biru Kode Barang ATAU Nama Barang — pemanggil (modul
   transaksi) yang bertanggung jawab memetakan field persediaan itu ke
   bentuk item row modulnya sendiri (kode/nama/um/harga, dst berbeda-
   beda tiap modul) & memanggil recalc/rerender modulnya sendiri.

   Pencarian & pagination di modal ini SUNGGUHAN (bukan dekoratif) —
   pertama kalinya di mockup ini paginasi benar-benar berfungsi, karena
   DATA.persediaan per-cabang bisa lebih dari `pageSize` baris (10 baris
   per cabang, default 5 baris/halaman = 2 halaman, meniru pager
   First/Previous/1/2/Next/Last di screenshot MASERP). Dropdown ke-2 di
   toolbar ("Global Search") SENGAJA dekoratif (cuma visual, meniru
   dropdown pemilih kolom pencarian di screenshot) — pencarian sungguhan
   tetap mencari lewat SEMUA kolom teks (Kode Barang/Nama Barang/Nama
   Gudang) via 1 input teks, supaya tidak menambah kompleksitas UI tanpa
   manfaat nyata di mockup. Tombol "+" SENGAJA dekoratif (buka modal info
   singkat) karena menambah barang baru ke master Persediaan ada di luar
   scope popup pemilihan barang ini.
========================================================= */
let pspState = { rows:[], search:'', page:1, pageSize:5, onPick:null };

function openPersediaanPicker(cabang, onPick){
  closeModal();
  let rows = DATA.persediaan.filter(r => r.cabang === cabang);
  if(!rows.length) rows = DATA.persediaan;
  pspState = { rows, search:'', page:1, pageSize:5, onPick };
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.innerHTML = tplPersediaanPickerModal();
  document.body.appendChild(overlay);
  document.getElementById('modalClose').onclick = closeModal;
  overlay.onclick = (e) => { if(e.target === overlay) closeModal(); };
  document.getElementById('pspAddBtn').onclick = () => openPspAddInfo();
  document.getElementById('pspPageSize').onchange = (e) => {
    pspState.pageSize = +e.target.value; pspState.page = 1; pspRenderTable();
  };
  document.getElementById('pspSearch').oninput = (e) => {
    pspState.search = e.target.value; pspState.page = 1; pspRenderTable();
  };
  pspRenderTable();
}

function pspFiltered(){
  const q = pspState.search.trim().toLowerCase();
  if(!q) return pspState.rows;
  return pspState.rows.filter(r =>
    r.kodeBarang.toLowerCase().includes(q) ||
    r.namaBarang.toLowerCase().includes(q) ||
    r.namaGudang.toLowerCase().includes(q));
}

function pspRenderTable(){
  const filtered = pspFiltered();
  const totalPages = Math.max(1, Math.ceil(filtered.length / pspState.pageSize));
  if(pspState.page > totalPages) pspState.page = totalPages;
  const startIdx = (pspState.page - 1) * pspState.pageSize;
  const pageRows = filtered.slice(startIdx, startIdx + pspState.pageSize);
  document.getElementById('pspBody').innerHTML = tplPersediaanPickerRows(pageRows);
  document.getElementById('pspTotal').textContent = `Total Record: ${filtered.length}`;
  document.getElementById('pspPagerWrap').innerHTML = tplPersediaanPager(pspState.page, totalPages);
  document.querySelectorAll('[data-psp-pick]').forEach(el => el.onclick = () => {
    const row = pspState.rows.find(r => r.kodeGudang === el.dataset.pspGudang && r.kodeBarang === el.dataset.pspPick);
    if(row && pspState.onPick) pspState.onPick(row);
    closeModal();
  });
  const pagerBtns = document.getElementById('pspPagerWrap');
  pagerBtns.querySelector('[data-psp-first]').onclick = () => { pspState.page = 1; pspRenderTable(); };
  pagerBtns.querySelector('[data-psp-prev]').onclick = () => { pspState.page = Math.max(1, pspState.page - 1); pspRenderTable(); };
  pagerBtns.querySelector('[data-psp-next]').onclick = () => { pspState.page = Math.min(totalPages, pspState.page + 1); pspRenderTable(); };
  pagerBtns.querySelector('[data-psp-last]').onclick = () => { pspState.page = totalPages; pspRenderTable(); };
  pagerBtns.querySelectorAll('[data-psp-page]').forEach(b => b.onclick = () => { pspState.page = +b.dataset.pspPage; pspRenderTable(); });
}

function tplPersediaanPickerModal(){
  return `
    <div class="modal-box" style="max-width:1120px;width:96vw;">
      <div class="modal-header"><span>${icon('box',15)} Daftar Persediaan</span><span class="close" id="modalClose">&times;</span></div>
      <div class="modal-body">
        <div class="table-toolbar">
          <select id="pspPageSize"><option value="5" selected>5</option><option value="10">10</option><option value="25">25</option><option value="50">50</option></select>
          <select style="max-width:120px;"><option>Global Search</option><option>Kode Barang</option><option>Nama Barang</option><option>Nama Gudang</option></select>
          <input type="text" id="pspSearch" placeholder="Pencarian Global">
          <button class="btn-primary" id="pspAddBtn" type="button">${icon('plus',14)}</button>
        </div>
        <div class="table-wrap" style="max-height:420px;overflow:auto;">
          <table>
            <thead><tr>
              <th>Nama Gudang</th>
              <th>Kode Barang</th>
              <th>Nama Barang</th>
              <th>Kode Kategori</th>
              <th>Qty Physical</th>
              <th>Qty Reservasi</th>
              <th>Qty BoPo</th>
              <th>Qty Available</th>
              <th>Satuan</th>
              <th>Konsinyasi</th>
            </tr></thead>
            <tbody id="pspBody"></tbody>
          </table>
        </div>
        <div class="table-footer"><div id="pspPagerWrap"></div><div id="pspTotal"></div></div>
      </div>
    </div>`;
}

function tplPersediaanPickerRows(rows){
  if(!rows.length) return `<tr><td colspan="10" style="color:var(--text-light);">Tidak ada barang ditemukan</td></tr>`;
  return rows.map(r => `
    <tr>
      <td>${r.namaGudang}</td>
      <td><button class="link-pick" data-psp-pick="${r.kodeBarang}" data-psp-gudang="${r.kodeGudang}">${r.kodeBarang}</button></td>
      <td><button class="link-pick" data-psp-pick="${r.kodeBarang}" data-psp-gudang="${r.kodeGudang}">${r.namaBarang}</button></td>
      <td>${r.kodeKategori}</td>
      <td>${r.qtyPhysical}</td>
      <td>${r.qtyReservasi}</td>
      <td>${r.qtyBoPo}</td>
      <td>${r.qtyAvailable}</td>
      <td>${r.satuan}</td>
      <td>${r.konsinyasi}</td>
    </tr>`).join('');
}

function tplPersediaanPager(page, totalPages){
  let nums = '';
  for(let p = 1; p <= totalPages; p++){
    nums += `<button class="${p===page?'active':''}" data-psp-page="${p}">${p}</button>`;
  }
  return `<div class="pager">
    <button data-psp-first>First</button>
    <button data-psp-prev>Previous</button>
    ${nums}
    <button data-psp-next>Next</button>
    <button data-psp-last>Last</button>
  </div>`;
}

function openPspAddInfo(){
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.innerHTML = `
    <div class="modal-box" style="max-width:420px;">
      <div class="modal-header"><span>Tambah Persediaan</span><span class="close" id="modalClose2">&times;</span></div>
      <div class="modal-body"><p>Menambah barang baru ke master Persediaan dilakukan lewat menu Persediaan Barang &gt; Inventory, bukan dari popup pemilihan barang ini.</p></div>
      <div class="modal-footer"><button class="btn-secondary" id="modalCancel2">Tutup</button></div>
    </div>`;
  document.body.appendChild(overlay);
  document.getElementById('modalClose2').onclick = () => overlay.remove();
  document.getElementById('modalCancel2').onclick = () => overlay.remove();
  overlay.onclick = (e) => { if(e.target === overlay) overlay.remove(); };
}

/* =========================================================
   INIT
========================================================= */
document.getElementById('hamburgerBtn').innerHTML=icon('menu',20);
document.getElementById('hamburgerBtn').onclick=()=>{
  document.getElementById('layout').classList.toggle('collapsed');
};
buildSidebar();
renderPage();
// mark Dashboard as active leaf by default
document.querySelectorAll('.menu-top.leaf').forEach(l=>{ if(l.textContent.trim()==='Dashboard') l.classList.add('current'); });
