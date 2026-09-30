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

/* `pageToElement` memetakan key `page` (sama seperti dipakai
   PAGE_MODULES/MENU) ke elemen DOM sidebar yang jadi "pintu masuk"
   navigasi ke halaman itu — diisi ulang tiap kali buildSidebar()
   jalan. Dipakai oleh goToPage() (lihat bagian NOTIFIKASI di bawah)
   supaya pemanggil dari LUAR sidebar (misal notifikasi topbar) bisa
   berpindah halaman dengan cara IDENTIK seperti user mengklik menu
   itu sendiri (highlight current/active-parent ikut benar), tanpa
   perlu menduplikasi logic navigasi. */
let pageToElement={};
/* `navIndex` = sama seperti pageToElement, tapi key-nya navKey(page,
   title) (lihat bagian RIWAYAT NAVIGASI di bawah) — beda untuk semua
   menu `placeholder` yang page-nya sama tapi judulnya beda. Tiap entry
   {el, head, sub, isParent, title}: dipakai syncSidebar() untuk
   memulihkan highlight sidebar saat user klik Back/Forward browser. */
let navIndex={};

function buildSidebar(){
  sidebarScroll.innerHTML='';
  pageToElement={};
  navIndex={};
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
          if(c.page) pageToElement[c.page]=it;
          if(c.page) navIndex[navKey(c.page, c.title||c.label)]={el:it, head:top.page?head:null, sub, title:c.title||c.label};
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
      if(top.page) pageToElement[top.page]=head;
      if(top.page) navIndex[navKey(top.page, top.label)]={el:head, isParent:true, sub, title:top.label};
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
      if(top.page) pageToElement[top.page]=leaf;
      if(top.page) navIndex[navKey(top.page, top.label)]={el:leaf, title:top.label};
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
  pushNavHistory();
  renderPage();
}
/* =========================================================
   RIWAYAT NAVIGASI (tombol Back/Forward browser) — 2026-09-30

   Permintaan Sidik: saat mockup dibuka dari index.html lalu pindah-
   pindah menu, tombol Back browser tidak kembali ke halaman menu
   sebelumnya (malah keluar dari mockup), karena navigasi cuma
   mengganti isi #content tanpa mencatat riwayat browser.
   Solusi: tiap navigate() mencatat 1 entry riwayat lewat HASH URL
   (index.html#salesOrders, atau #placeholder/<Judul> untuk menu
   placeholder) — hash dipakai (bukan path) supaya tetap jalan saat
   dibuka langsung dari file:// tanpa web server. Saat Back/Forward,
   event `popstate` memulihkan halaman + highlight sidebar-nya TANPA
   push riwayat baru. Bonus: refresh browser (F5) tetap di halaman
   yang sama (data sampel tetap kembali ke awal karena memang cuma
   di memori).
   Catatan: yang tercatat HANYA perpindahan menu. Form/modal di
   dalam 1 halaman (mis. form Tambah SO) bukan entry riwayat sendiri
   — Back dari situ kembali ke MENU sebelumnya.
========================================================= */
function navKey(page,title){
  return page==='placeholder' ? 'placeholder/'+(title||'') : page;
}
function navHash(page,title){
  return page==='placeholder' ? '#placeholder/'+encodeURIComponent(title||'') : '#'+page;
}
function parseNavHash(hash){
  const h=(hash||'').replace(/^#/,'');
  if(!h) return null;
  if(h.startsWith('placeholder/')){
    let t=h.slice('placeholder/'.length);
    try{ t=decodeURIComponent(t); }catch(e){}
    return {page:'placeholder', title:t};
  }
  const entry=navIndex[h];
  return {page:h, title:entry?entry.title:null};
}
/* Klik menu yang sama dengan halaman sekarang (mis. klik ulang judul
   grup untuk buka/tutup submenu) → replaceState, bukan push, supaya
   Back tidak "tertahan" di halaman yang sama berkali-kali. */
function pushNavHistory(){
  const state={page:currentPage, title:currentTitle};
  const hash=navHash(currentPage,currentTitle);
  const cur=history.state;
  if(cur && navKey(cur.page,cur.title)===navKey(currentPage,currentTitle)){
    history.replaceState(state,'',hash);
  }else{
    history.pushState(state,'',hash);
  }
}
/* Pulihkan highlight sidebar (current/active-parent/submenu terbuka)
   untuk page+title tertentu — dipanggil saat Back/Forward & saat load
   awal dari hash, karena di situ tidak ada klik menu sungguhan. */
function syncSidebar(page,title){
  document.querySelectorAll('.submenu-item, .menu-top.leaf').forEach(x=>x.classList.remove('current'));
  document.querySelectorAll('.menu-top').forEach(m=>m.classList.remove('active-parent','open'));
  document.querySelectorAll('.submenu').forEach(m=>m.classList.remove('open'));
  const entry=navIndex[navKey(page,title)];
  if(!entry) return;
  if(entry.sub){
    entry.sub.classList.add('open');
    const head=entry.sub.previousElementSibling;
    if(head) head.classList.add('open');
  }
  if(entry.isParent) entry.el.classList.add('active-parent');
  else{
    entry.el.classList.add('current');
    if(entry.head) entry.head.classList.add('active-parent');
  }
}
window.addEventListener('popstate',(e)=>{
  const st=e.state || parseNavHash(location.hash) || {page:'mainDashboard', title:'Dashboard'};
  document.querySelectorAll('.modal-overlay').forEach(m=>m.remove());
  if(typeof closeNotifDropdown==='function') closeNotifDropdown();
  window.__pendingPageAction=null;
  currentPage=st.page; currentTitle=st.title;
  syncSidebar(currentPage,currentTitle);
  renderPage();
});

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
  jurnalAP:{srcs:['js/pages/jurnal-ap.template.js','js/pages/jurnal-ap.js'], fn:'renderJurnalAPPage'},
  jurnalAR:{srcs:['js/pages/jurnal-ar.template.js','js/pages/jurnal-ar.js'], fn:'renderJurnalARPage'},
  estimasiHariPengiriman:{srcs:['js/pages/estimasi-hari-pengiriman.template.js','js/pages/estimasi-hari-pengiriman.js'], fn:'renderEstimasiHariPengirimanPage'},
  transaksiAP:{srcs:['js/pages/transaksi-ap.template.js','js/pages/transaksi-ap.js'], fn:'renderTransaksiApPage'},
  transaksiAR:{srcs:['js/pages/transaksi-ar.template.js','js/pages/transaksi-ar.js'], fn:'renderTransaksiArPage'},
  returPembelian:{srcs:['js/pages/retur-pembelian.template.js','js/pages/retur-pembelian.js'], fn:'renderReturPembelianPage'},
  returSuratJalan:{srcs:['js/pages/retur-surat-jalan.template.js','js/pages/retur-surat-jalan.js'], fn:'renderReturSuratJalanPage'},
  returPenjualan:{srcs:['js/pages/retur-penjualan.template.js','js/pages/retur-penjualan.js'], fn:'renderReturPenjualanPage'},
  jurnalPenjualan:{srcs:['js/pages/jurnal-penjualan.template.js','js/pages/jurnal-penjualan.js'], fn:'renderJurnalPenjualanPage'},
  glKategori:{srcs:['js/pages/gl-kategori.template.js','js/pages/gl-kategori.js'], fn:'renderGlKategoriPage'},
  akunGL:{srcs:['js/pages/akun-gl.template.js','js/pages/akun-gl.js'], fn:'renderAkunGLPage'},
  stockRequest:{srcs:['js/pages/stock-request.template.js','js/pages/stock-request.js'], fn:'renderStockRequestPage'},
  purchaseOrder:{srcs:['js/pages/purchase-order.template.js','js/pages/purchase-order.js'], fn:'renderPurchaseOrderPage'},
  tutupPendingPO:{srcs:['js/pages/tutup-pending-po.template.js','js/pages/tutup-pending-po.js'], fn:'renderTutupPendingPOPage'},
  uangMukaSupplier:{srcs:['js/pages/uang-muka-supplier.template.js','js/pages/uang-muka-supplier.js'], fn:'renderUangMukaSupplierPage'},
  uangMukaCustomer:{srcs:['js/pages/uang-muka-customer.template.js','js/pages/uang-muka-customer.js'], fn:'renderUangMukaCustomerPage'},
  spEcatKhusus:{srcs:['js/pages/sp-ecat-khusus.template.js','js/pages/sp-ecat-khusus.js'], fn:'renderSpEcatKhususPage'},
  penjualanAktivaTetap:{srcs:['js/pages/penjualan-aktiva-tetap.template.js','js/pages/penjualan-aktiva-tetap.js'], fn:'renderPenjualanAktivaTetapPage'},
  biayaAsset:{srcs:['js/pages/biaya-asset.template.js','js/pages/biaya-asset.js'], fn:'renderBiayaAssetPage'},
  t3f:{srcs:['js/pages/t3f.template.js','js/pages/t3f.js'], fn:'renderT3fPage'},
  alasanBelumTertagih:{srcs:['js/pages/alasan-belum-tertagih.template.js','js/pages/alasan-belum-tertagih.js'], fn:'renderAlasanBelumTertagihPage'},
  tagihanPiutang:{srcs:['js/pages/tagihan-piutang.template.js','js/pages/tagihan-piutang.js'], fn:'renderTagihanPiutangPage'},
  permintaanPembelian:{srcs:['js/pages/permintaan-pembelian.template.js','js/pages/permintaan-pembelian.js'], fn:'renderPermintaanPembelianPage'},
  tutupPR:{srcs:['js/pages/tutup-pr.template.js','js/pages/tutup-pr.js'], fn:'renderTutupPRPage'},
  returPB:{srcs:['js/pages/retur-penerimaan-barang.template.js','js/pages/retur-penerimaan-barang.js'], fn:'renderReturPBPage'},
  pembelianLangsung:{srcs:['js/pages/pembelian-langsung.template.js','js/pages/pembelian-langsung.js'], fn:'renderPembelianLangsungPage'},
  pembelianPO:{srcs:['js/pages/pembelian-po.template.js','js/pages/pembelian-po.js'], fn:'renderPembelianPOPage'},
  pengajuanPembayaran:{srcs:['js/pages/pengajuan-pembayaran.template.js','js/pages/pengajuan-pembayaran.js'], fn:'renderPengajuanPembayaranPage'},
  beratProduk:{srcs:['js/pages/berat-produk.template.js','js/pages/berat-produk.js'], fn:'renderBeratProdukPage'},
  tutupPendingSO:{srcs:['js/pages/tutup-pending-so.template.js','js/pages/tutup-pending-so.js'], fn:'renderTutupPendingSOPage'},
  terimaBarang:{srcs:['js/pages/terima-barang.template.js','js/pages/terima-barang.js'], fn:'renderTerimaBarangPage'},
  pembelianBPB:{srcs:['js/pages/pembelian-bpb.template.js','js/pages/pembelian-bpb.js'], fn:'renderPembelianBPBPage'},
  pelunasanUtang:{srcs:['js/pages/pelunasan-utang.template.js','js/pages/pelunasan-utang.js'], fn:'renderPelunasanUtangPage'},
  kategoriBarang:{srcs:['js/pages/kategori-barang.template.js','js/pages/kategori-barang.js'], fn:'renderKategoriBarangPage'},
  customerGroup:{srcs:['js/pages/customer-group.template.js','js/pages/customer-group.js'], fn:'renderCustomerGroupPage'},
  customers:{srcs:['js/pages/master-customer.template.js','js/pages/master-customer.js'], fn:'renderMasterCustomerPage'},
  promotion:{srcs:['js/pages/promotion.template.js','js/pages/promotion.js'], fn:'renderPromotionPage'},
  dominasi:{srcs:['js/pages/dominasi.template.js','js/pages/dominasi.js'], fn:'renderDominasiPage'},
  salesQuotation:{srcs:['js/pages/sales-quotation.template.js','js/pages/sales-quotation.js'], fn:'renderSalesQuotationPage'},
  tutupSalesQuotation:{srcs:['js/pages/tutup-sales-quotation.template.js','js/pages/tutup-sales-quotation.js'], fn:'renderTutupSalesQuotationPage'},
  salesOrders:{srcs:['js/pages/sales-order.template.js','js/pages/sales-order.js'], fn:'renderSalesOrderPage'},
  pickingList:{srcs:['js/pages/picking-list.template.js','js/pages/picking-list.js'], fn:'renderPickingListPage'},
  invoices:{srcs:['js/pages/invoice.template.js','js/pages/invoice.js'], fn:'renderInvoicePage'},
  fakturPenjualanSJ:{srcs:['js/pages/faktur-penjualan-sj.template.js','js/pages/faktur-penjualan-sj.js'], fn:'renderFakturPenjualanSJPage'},
  penjualanLangsung:{srcs:['js/pages/penjualan-langsung.template.js','js/pages/penjualan-langsung.js'], fn:'renderPenjualanLangsungPage'},
  gudang:{srcs:['js/pages/gudang.template.js','js/pages/gudang.js'], fn:'renderGudangPage'},
  kasBank:{srcs:['js/pages/kas-bank.template.js','js/pages/kas-bank.js'], fn:'renderKasBankPage'},
  masterBank:{srcs:['js/pages/master-bank.template.js','js/pages/master-bank.js'], fn:'renderMasterBankPage'},
  jurnalKasLain:{srcs:['js/pages/jurnal-kas-lain.template.js','js/pages/jurnal-kas-lain.js'], fn:'renderJurnalKasLainPage'},
  giroMundur:{srcs:['js/pages/giro-mundur.template.js','js/pages/giro-mundur.js'], fn:'renderGiroMundurPage'},
  rekonsiliasi:{srcs:['js/pages/rekonsiliasi.template.js','js/pages/rekonsiliasi.js'], fn:'renderRekonsiliasiPage'},
  pembelianAktivaTetap:{srcs:['js/pages/pembelian-aktiva-tetap.template.js','js/pages/pembelian-aktiva-tetap.js'], fn:'renderPembelianAktivaTetapPage'},
  currency:{srcs:['js/pages/currency.template.js','js/pages/currency.js'], fn:'renderCurrencyPage'},
  jurnalPelunasanUP:{srcs:['js/pages/jurnal-pelunasan-up.template.js','js/pages/jurnal-pelunasan-up.js'], fn:'renderJurnalPelunasanUPPage'},
  reportCabang:{srcs:['js/pages/reports.template.js','js/pages/reports.js'], fn:'renderReportCabang'},
  reportAktivaTetap:{srcs:['js/pages/reports.template.js','js/pages/reports.js'], fn:'renderReportAktivaTetap'},
  reportAP:{srcs:['js/pages/reports.template.js','js/pages/reports.js'], fn:'renderReportAP'},
  reportAR:{srcs:['js/pages/reports.template.js','js/pages/reports.js'], fn:'renderReportAR'},
  reportPurchasing:{srcs:['js/pages/reports.template.js','js/pages/reports.js'], fn:'renderReportPurchasing'},
  reportKasBank:{srcs:['js/pages/reports.template.js','js/pages/reports.js'], fn:'renderReportKasBank'},
  reportGL:{srcs:['js/pages/reports.template.js','js/pages/reports.js'], fn:'renderReportGL'},
  reportPersediaan:{srcs:['js/pages/reports.template.js','js/pages/reports.js'], fn:'renderReportPersediaan'},
  reportPenjualan:{srcs:['js/pages/reports.template.js','js/pages/reports.js'], fn:'renderReportPenjualan'},
  reportCetakanTransaksi:{srcs:['js/pages/reports.template.js','js/pages/reports.js'], fn:'renderReportCetakanTransaksi'},
  companyProfile:{srcs:['js/pages/company-profile.template.js','js/pages/company-profile.js'], fn:'renderCompanyProfile'},
  daftarPerusahaan:{srcs:['js/pages/daftar-perusahaan.template.js','js/pages/daftar-perusahaan.js'], fn:'renderDaftarPerusahaanPage'},
  hakAksesGroup:{srcs:['js/pages/hak-akses-group.template.js','js/pages/hak-akses-group.js'], fn:'renderHakAksesGroupPage'},
  hakAksesGroupReport:{srcs:['js/pages/hak-akses-group-report.template.js','js/pages/hak-akses-group-report.js'], fn:'renderHakAksesGroupReportPage'},
  budgeting:{srcs:['js/pages/budgeting.template.js','js/pages/budgeting.js'], fn:'renderBudgetingPage'},
  budgetingCc:{srcs:['js/pages/budgeting-cc.template.js','js/pages/budgeting-cc.js'], fn:'renderBudgetingCcPage'},
  rumusRasioKeuangan:{srcs:['js/pages/rumus-rasio-keuangan.template.js','js/pages/rumus-rasio-keuangan.js'], fn:'renderRumusRasioKeuanganPage'},
  chartGrafik:{srcs:['js/pages/chart-grafik.template.js','js/pages/chart-grafik.js'], fn:'renderChartGrafikPage'},
  masterRayon:{srcs:['js/pages/master-rayon.template.js','js/pages/master-rayon.js'], fn:'renderMasterRayonPage'},
  masterWilayah:{srcs:['js/pages/master-wilayah.template.js','js/pages/master-wilayah.js'], fn:'renderMasterWilayahPage'},
  groupUser:{srcs:['js/pages/group-user.template.js','js/pages/group-user.js'], fn:'renderGroupUserPage'},
  users:{srcs:['js/pages/master-user.template.js','js/pages/master-user.js'], fn:'renderMasterUserPage'},
  salesOffice:{srcs:['js/pages/sales-office.template.js','js/pages/sales-office.js'], fn:'renderSalesOfficePage'},
  adminBulanan:{srcs:['js/pages/admin-bulanan.template.js','js/pages/admin-bulanan.js'], fn:'renderAdminBulananPage'},
  priceListProvince:{srcs:['js/pages/price-list-province.template.js','js/pages/price-list-province.js'], fn:'renderPriceListProvincePage'},
  penerimaanPiutang:{srcs:['js/pages/penerimaan-piutang.template.js','js/pages/penerimaan-piutang.js'], fn:'renderPenerimaanPiutangPage'},
  penerimaanSsp:{srcs:['js/pages/penerimaan-ssp.template.js','js/pages/penerimaan-ssp.js'], fn:'renderPenerimaanSspPage'},
  opnameDokumen:{srcs:['js/pages/opname-dokumen.template.js','js/pages/opname-dokumen.js'], fn:'renderOpnameDokumenPage'},
  reorderingSheet:{srcs:['js/pages/reordering-sheet.template.js','js/pages/reordering-sheet.js'], fn:'renderReorderingSheetPage'},
  zatKandunganAktif:{srcs:['js/pages/zat-kandungan-aktif.template.js','js/pages/zat-kandungan-aktif.js'], fn:'renderZatKandunganAktifPage'},
  farmakoterapi:{srcs:['js/pages/farmakoterapi.template.js','js/pages/farmakoterapi.js'], fn:'renderFarmakoterapiPage'},
  subFarmakoterapi:{srcs:['js/pages/sub-farmakoterapi.template.js','js/pages/sub-farmakoterapi.js'], fn:'renderSubFarmakoterapiPage'},
  bentukSediaan:{srcs:['js/pages/bentuk-sediaan.template.js','js/pages/bentuk-sediaan.js'], fn:'renderBentukSediaanPage'},
  groupProduk:{srcs:['js/pages/group-produk.template.js','js/pages/group-produk.js'], fn:'renderGroupProdukPage'},
  kategoriReorderingSheet:{srcs:['js/pages/kategori-reordering-sheet.template.js','js/pages/kategori-reordering-sheet.js'], fn:'renderKategoriReorderingSheetPage'},
  transaksiPersediaan:{srcs:['js/pages/transaksi-persediaan.template.js','js/pages/transaksi-persediaan.js'], fn:'renderTransaksiPersediaanPage'},
  costCenter:{srcs:['js/pages/cost-center.template.js','js/pages/cost-center.js'], fn:'renderCostCenterPage'},
  cabang:{srcs:['js/pages/cabang.template.js','js/pages/cabang.js'], fn:'renderCabangPage'},
  items:{srcs:['js/pages/persediaan-barang.template.js','js/pages/persediaan-barang.js'], fn:'renderPersediaanBarangPage'},
  aktivaTetap:{srcs:['js/pages/fixed-asset.template.js','js/pages/fixed-asset.js'], fn:'renderFixedAssetPage'},
  lokasiAset:{srcs:['js/pages/lokasi-aset.template.js','js/pages/lokasi-aset.js'], fn:'renderLokasiAsetPage'},
  aktivaTetapDeprRule:{srcs:['js/pages/aktiva-tetap-depr-rule.template.js','js/pages/aktiva-tetap-depr-rule.js'], fn:'renderAktivaTetapDeprRulePage'},
  jurnalFixedAsset:{srcs:['js/pages/jurnal-fixed-asset.template.js','js/pages/jurnal-fixed-asset.js'], fn:'renderJurnalFixedAssetPage'},
  disposalAsset:{srcs:['js/pages/disposal-asset.template.js','js/pages/disposal-asset.js'], fn:'renderDisposalAssetPage'},
  revaluasiAsset:{srcs:['js/pages/revaluasi-asset.template.js','js/pages/revaluasi-asset.js'], fn:'renderRevaluasiAssetPage'},
  monitoringControlDelivery:{srcs:['js/pages/monitoring-control-delivery.template.js','js/pages/monitoring-control-delivery.js'], fn:'renderMonitoringControlDeliveryPage'},
  satuan:{srcs:['js/pages/satuan.template.js','js/pages/satuan.js'], fn:'renderSatuanPage'},
  badanUsaha:{srcs:['js/pages/badan-usaha.template.js','js/pages/badan-usaha.js'], fn:'renderBadanUsahaPage'},
  masterStockOpname:{srcs:['js/pages/master-stock-opname.template.js','js/pages/master-stock-opname.js'], fn:'renderMasterStockOpnamePage'},
  stockOpname:{srcs:['js/pages/stock-opname.template.js','js/pages/stock-opname.js'], fn:'renderStockOpnamePage'},
  historyCreditLimit:{srcs:['js/pages/history-credit-limit.template.js','js/pages/history-credit-limit.js'], fn:'renderHistoryCreditLimitPage'},
  rumusKomisiSalesman:{srcs:['js/pages/rumus-komisi-salesman.template.js','js/pages/rumus-komisi-salesman.js'], fn:'renderRumusKomisiSalesmanPage'},
  alasanRetur:{srcs:['js/pages/alasan-retur.template.js','js/pages/alasan-retur.js'], fn:'renderAlasanReturPage'},
  hakApproval:{srcs:['js/pages/hak-approval.template.js','js/pages/hak-approval.js'], fn:'renderHakApprovalPage'},
  masterCollector:{srcs:['js/pages/master-collector.template.js','js/pages/master-collector.js'], fn:'renderMasterCollectorPage'},
  masterStatusOpname:{srcs:['js/pages/master-status-opname.template.js','js/pages/master-status-opname.js'], fn:'renderMasterStatusOpnamePage'},
  /* 2026-09-30 — Modul Claim Customer & Principal (helper bersama: lihat
     bagian MODUL CLAIM di bawah). */
  settingClaimPrincipal:{srcs:['js/pages/setting-claim-principal.template.js','js/pages/setting-claim-principal.js'], fn:'renderSettingClaimPrincipalPage'},
  claimCustomer:{srcs:['js/pages/claim-customer.template.js','js/pages/claim-customer.js'], fn:'renderClaimCustomerPage'},
  pengajuanClaim:{srcs:['js/pages/pengajuan-claim.template.js','js/pages/pengajuan-claim.js'], fn:'renderPengajuanClaimPage'},
  penyelesaianClaim:{srcs:['js/pages/penyelesaian-claim.template.js','js/pages/penyelesaian-claim.js'], fn:'renderPenyelesaianClaimPage'},
  monitoringClaim:{srcs:['js/pages/monitoring-claim.template.js','js/pages/monitoring-claim.js'], fn:'renderMonitoringClaimPage'},
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

/* `window.__pendingPageAction` = {page, run} — dipasang oleh goToPage()
   (bagian NOTIFIKASI di bawah) SEBELUM navigasi terjadi, lalu dieksekusi
   sendiri oleh runPendingPageAction() begitu renderPage() untuk `page`
   yang sama selesai me-render (baik lewat jalur module sudah ter-load
   maupun jalur lazy-load async) — supaya pemanggil bisa "lompat ke
   halaman X lalu jalankan Y" (mis. notifikasi buka Stock Request lalu
   langsung buka form Lihat baris tertentu) tanpa renderPage()/navigate()
   perlu tahu apa-apa soal kebutuhan spesifik pemanggilnya. */
function runPendingPageAction(){
  const action=window.__pendingPageAction;
  if(action && action.page===currentPage){
    window.__pendingPageAction=null;
    action.run();
  }
}

function renderPage(){
  destroyCharts();
  if(currentPage==='placeholder') return renderPlaceholder(currentTitle);

  const mod=PAGE_MODULES[currentPage];
  if(mod){
    if(loadedModules.has(currentPage)){
      window[mod.fn]();
      runPendingPageAction();
      return;
    }
    content.innerHTML='<div class="page-loading">Memuat halaman&hellip;</div>';
    return loadScriptsSequential(mod.srcs, ()=>{ loadedModules.add(currentPage); window[mod.fn](); runPendingPageAction(); });
  }

  const pages={
    salesman:{title:'Salesman', cols:[['nama','Nama Salesman'],['area','Area'],['target','Target',true],['realisasi','Realisasi',true]], rows:DATA.salesman},
    packing:{title:'Packing', cols:[['no','No. Packing'],['tgl','Tanggal'],['so','No. SO'],['status','Status','pill']], rows:DATA.packing},
    kasMasuk:{title:'Kas Masuk', cols:[['tgl','Tanggal'],['ket','Keterangan'],['kategori','Kategori'],['jumlah','Jumlah',true]], rows:DATA.kasMasuk},
    kasKeluar:{title:'Kas Keluar', cols:[['tgl','Tanggal'],['ket','Keterangan'],['kategori','Kategori'],['jumlah','Jumlah',true]], rows:DATA.kasKeluar},
    transaksiKas:{title:'Transaksi Kas', cols:[['tgl','Tanggal'],['ket','Keterangan'],['tipe','Tipe','pill'],['kategori','Kategori'],['jumlah','Jumlah',true]], rows:DATA.transaksiKas},
    jurnalUmum:{title:'Jurnal Umum', cols:[['tgl','Tanggal'],['no','No. Jurnal'],['akun','Akun'],['debit','Debit',true],['kredit','Kredit',true]], rows:DATA.jurnalUmum},
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
   NOTIFIKASI (topbar) — 2026-08-24

   Permintaan awal: notifikasi lonceng topbar muncul untuk transaksi
   Stock Request yang belum dibuat transaksi transfer barangnya, dan
   begitu salah satu notifikasi diklik akan membuka Stock Request
   tersebut. Mockup ini belum punya modul "Transfer Barang" sungguhan
   yang terhubung ke Stock Request (beda dari rantai Purchase Order →
   Terima Barang yang sudah nyata) — atas pilihan Sidik, status ini
   DITANDAI LEWAT FIELD BARU `row.transferOutDibuat` (boolean) yang
   independen dari field `status` (OPEN/CLOSED) yang sudah ada,
   supaya bisa didemokan lewat toggle switch manual di kolom "Transfer
   Barang?" pada Stock Request List (lihat stock-request.template.js/
   .js) — sama seperti pola toggle "Closed Manually" yang sudah ada di
   modul itu. Kalau nanti modul "Transfer Barang" sungguhan dibangun,
   field ini idealnya diganti/disinkronkan ke status transaksi Transfer
   Barang yang sebenarnya, bukan toggle manual lagi.

   Arsitektur SENGAJA dibuat generik (`NOTIF_SOURCES`, bukan logic
   Stock Request yang di-hardcode langsung di sini) supaya sumber
   notifikasi lain di masa depan (mis. modul Transfer Barang itu
   sendiri, atau modul lain) tinggal ditambah sebagai 1 entry baru ke
   array ini tanpa mengubah mekanisme dropdown/badge-nya. Tiap entry
   punya `list()` yang mengembalikan array item notifikasi
   `{key,icon,title,sub,date,open()}` — `open()` yang tahu cara
   berpindah & menindaklanjuti notifikasi jenisnya sendiri.

   Ditaruh di core.js (bukan di js/pages/stock-request.js) karena
   topbar & badge-nya harus selalu ada terlepas dari modul mana yang
   lagi lazy-loaded — sama alasannya dengan openPersediaanPicker() di
   atas. `refreshNotifBadge()` dibuat GLOBAL (bukan lewat closure)
   supaya modul manapun (mis. stock-request.js setelah toggle/simpan/
   hapus baris) bisa memanggilnya langsung begitu data yang memengaruhi
   notifikasi berubah — lihat pemanggilannya di renderSrTable()/
   openSrForm() pada stock-request.js.
========================================================= */
const NOTIF_SOURCES=[
  {
    key:'stockRequestTransferOut',
    list(){
      return (DATA.stockRequest||[])
        .filter(r=>!r.transferOutDibuat)
        .map(r=>({
          key:'sr-'+r.no,
          icon:'box',
          title:`Stock Request Baru — ${r.no}`,
          sub:`${r.cabangRequest||'-'} — belum dibuat Transfer Barang`,
          date:r.tglRequest||'',
          open(){
            goToPage('stockRequest','Stock Request', ()=>{
              const idx=DATA.stockRequest.findIndex(x=>x.no===r.no);
              if(idx>=0 && typeof openSrForm==='function') openSrForm('view', idx);
            });
          },
        }));
    },
  },
];

function notifAllItems(){
  return NOTIF_SOURCES.flatMap(s=>s.list());
}

let notifOpen=false;

function refreshNotifBadge(){
  const items=notifAllItems();
  const badge=document.getElementById('notifBadge');
  if(badge){
    if(items.length){ badge.textContent=items.length; badge.style.display='inline-block'; }
    else { badge.textContent=''; badge.style.display='none'; }
  }
  if(notifOpen) openNotifDropdown();
}

function tplNotifItems(items){
  if(!items.length) return `<div class="notif-empty">Tidak ada notifikasi baru.</div>`;
  return items.map((it,i)=>`
    <div class="notif-item" data-notif="${i}">
      <div class="notif-title">${icon(it.icon||'alertTriangle',14)}<span>${it.title}</span></div>
      <div class="notif-sub">${it.sub}</div>
      ${it.date?`<div class="notif-date">${it.date}</div>`:''}
    </div>`).join('');
}

function openNotifDropdown(){
  const notifBtn=document.getElementById('notifBtn');
  const old=document.getElementById('notifDropdown');
  if(old) old.remove();
  const items=notifAllItems();
  const wrap=document.createElement('div');
  wrap.className='notif-dropdown';
  wrap.id='notifDropdown';
  wrap.innerHTML=`<div class="notif-dropdown-header">Notifikasi${items.length?` (${items.length})`:''}</div>
    <div class="notif-list">${tplNotifItems(items)}</div>`;
  notifBtn.appendChild(wrap);
  wrap.querySelectorAll('[data-notif]').forEach(el=>{
    el.onclick=(e)=>{
      e.stopPropagation();
      const it=items[+el.dataset.notif];
      closeNotifDropdown();
      if(it && it.open) it.open();
    };
  });
  notifOpen=true;
}

function closeNotifDropdown(){
  const old=document.getElementById('notifDropdown');
  if(old) old.remove();
  notifOpen=false;
}

/* goToPage(page, title, run) — berpindah ke `page` PERSIS seperti
   user mengklik menu sidebar-nya sendiri (highlight current/
   active-parent & submenu yang terbuka tetap konsisten, lewat
   pageToElement yang diisi buildSidebar()), lalu menjalankan `run`
   begitu halaman itu selesai di-render (lewat runPendingPageAction()
   di renderPage()) — dipakai open() pada NOTIF_SOURCES di atas untuk
   "buka Stock Request lalu langsung tampilkan 1 baris tertentu",
   tapi generik untuk kebutuhan serupa di luar notifikasi juga. */
function goToPage(page,title,run){
  window.__pendingPageAction = run ? {page,run} : null;
  const el=pageToElement[page];
  if(el){
    const sub=el.closest && el.closest('.submenu');
    if(sub){
      document.querySelectorAll('.menu-top').forEach(m=>m.classList.remove('open'));
      document.querySelectorAll('.submenu').forEach(m=>m.classList.remove('open'));
      sub.classList.add('open');
      const head=sub.previousElementSibling;
      if(head && head.classList.contains('menu-top')) head.classList.add('open');
    }
    el.click();
  }else{
    navigate(page,title);
  }
}

/* =========================================================
   MODUL CLAIM CUSTOMER & PRINCIPAL — helper bersama (2026-09-30)

   Dipakai lintas 5 modul lazy-loaded (Setting Claim Principal, Claim
   Customer, Pengajuan Claim Principal, Penyelesaian Claim, Monitoring
   Claim) + Master Supplier/Master Customer/Sales Order/Sales Quotation
   (Link Supplier ↔ Customer) — makanya ditaruh di core.js (selalu
   dimuat), alasan sama dgn openPersediaanPicker() di atas. Aturan bisnis
   lengkapnya ada di komentar DATA.claimCustomer (js/data.js) & dokumen
   spesifikasi. Status claim & arti tiap status: lihat CLAIM_STATUS_LIST.
========================================================= */
const CLAIM_STATUS_LIST=['Draft','Approval','Diajukan','Disetujui','Ditolak','Diproses','Selesai','Dibatalkan'];
const CLAIM_JALUR_LIST=['Nota Debit AP','Penjualan Langsung','Penerimaan Barang'];
const CLAIM_JENIS_LIST=['Biaya Promosi','Bonus Barang'];
const CLAIM_CARA_LIST=['Off Faktur','On Faktur'];
const CLAIM_CABANG_LIST=[
  {nama:'Head Office', kode:'HO'}, {nama:'Surabaya', kode:'SBY'}, {nama:'Bandung', kode:'BDG'},
  {nama:'Medan', kode:'MDN'}, {nama:'Makassar', kode:'MKS'}, {nama:'Semarang', kode:'SMG'}, {nama:'Tangerang', kode:'TGR'},
];
function claimCabangKode(nama){ const c=CLAIM_CABANG_LIST.find(x=>x.nama===nama); return c?c.kode:'HO'; }
function claimNum2(n){ return Number(n||0).toLocaleString('id-ID',{minimumFractionDigits:2, maximumFractionDigits:2}); }
function claimPad(n,len){ return String(n).padStart(len,'0'); }
function claimToday(){ const d=new Date(); return `${claimPad(d.getDate(),2)}/${claimPad(d.getMonth()+1,2)}/${d.getFullYear()}`; }
function claimNow(){ const d=new Date(); return `${claimToday()} ${claimPad(d.getHours(),2)}:${claimPad(d.getMinutes(),2)}`; }
function claimParseTgl(s){ const p=String(s||'').split(' ')[0].split('/'); return p.length===3 ? new Date(+p[2], +p[1]-1, +p[0]) : null; }
function claimUmurHari(tgl){
  const d=claimParseTgl(tgl); if(!d) return 0;
  const t=new Date(); t.setHours(0,0,0,0);
  return Math.max(0, Math.round((t-d)/864e5));
}
/* Nomor urut berikutnya untuk `prefix` di `list` (field `no`). */
function claimNextNo(list, prefix, len){
  const n=list.filter(r=>String(r.no||'').startsWith(prefix)).length+1;
  return prefix+claimPad(n,len);
}
function claimAkunNama(kode){ const a=DATA.akunGL.find(x=>x.kode===kode); return a?a.nama:''; }
function claimSetting(principalKode){ return (DATA.settingClaimPrincipal||[]).find(s=>s.principalKode===principalKode)||null; }
function claimFind(no){ return (DATA.claimCustomer||[]).find(c=>c.no===no)||null; }
function claimSisaPulih(c){ return Math.max(0,(c.nilaiAcc||0)-(c.nilaiDipulihkan||0)); }
function claimLog(c, status, catatan, user){
  c.riwayat=c.riwayat||[];
  c.riwayat.push({waktu:claimNow(), status, user:user||'sidik', catatan:catatan||''});
}
/* Pill status ke principal — warna mengikuti arti status (hijau =
   berhasil, merah = gagal, kuning = menunggu pihak lain, biru = sedang
   diproses, abu = belum keluar dari internal). */
function claimStatusPill(status){
  const map={
    'Draft':'background:#eef1f7;color:#7b8194;',
    'Approval':'background:#fff4dc;color:#b7791f;',
    'Diajukan':'background:#fff4dc;color:#b7791f;',
    'Disetujui':'background:#e6f0fb;color:#2f6db5;',
    'Diproses':'background:#e6f0fb;color:#2f6db5;',
    'Selesai':'background:#e3f8ec;color:#1a9c53;',
    'Ditolak':'background:#fdeaec;color:#e0405b;',
    'Dibatalkan':'background:#fdeaec;color:#e0405b;',
  };
  return `<span class="status-pill" style="${map[status]||''}">${status}</span>`;
}
/* Status ke customer (dihitung, tidak disimpan) — tabel "Status ke
   customer" di spesifikasi. */
function claimStatusCustomer(c){
  if(c.status==='Ditolak' || c.status==='Dibatalkan') return 'Tidak Diberikan';
  if(c.cara==='On Faktur') return 'Tidak Perlu';
  if(c.bonusDikirim) return 'Bonus Dikirim';
  if(c.notaKredit) return c.notaKredit.sisa>0 ? 'Nota Kredit Terbuka' : 'Nota Kredit Terpakai';
  if(['Disetujui','Diproses','Selesai'].includes(c.status)) return 'Siap Diberikan';
  return 'Menunggu ACC';
}
function claimPengajuanOf(c){ return (DATA.pengajuanClaim||[]).find(p=>p.no===c.noPengajuan)||null; }
/* Terlambat = sudah Diajukan tapi belum dijawab lewat batas hari respon
   Setting Claim Principal (default 14 hari). */
function claimIsTerlambat(c){
  if(c.status!=='Diajukan') return false;
  const p=claimPengajuanOf(c); const s=claimSetting(c.principalKode);
  return !!p && claimUmurHari(p.tglKirim||p.tgl) > (s?s.batasHariRespon:14);
}
/* Setelah nilai dipulihkan berubah: Diproses (sebagian) / Selesai. */
function claimRefreshStatusPulih(c){
  if(!['Disetujui','Diproses','Selesai'].includes(c.status)) return;
  if(c.nilaiDipulihkan>=c.nilaiAcc-0.004) c.status='Selesai';
  else if(c.nilaiDipulihkan>0) c.status='Diproses';
}

/* ---------- LINK SUPPLIER ↔ CUSTOMER PRINCIPAL ----------
   Principal tetap supplier (modul AP). Untuk penagihan (Penjualan
   Langsung wajib pilih customer) tiap principal boleh punya MAKSIMAL 1
   customer terhubung, kode `P-{kode supplier}`, tipeCustomer
   'Principal'. Field identitas disinkronkan SATU ARAH supplier →
   customer setiap Master Supplier disimpan (claimSyncCustomerPrincipal),
   field keuangan (top/limit/cabang) milik customer sendiri. */
function isCustomerPrincipal(c){ return !!(c && (c.supplierKode || c.tipeCustomer==='Principal')); }
function claimCustomerPrincipalOf(supplierKode){ return DATA.customers.find(c=>c.supplierKode===supplierKode)||null; }
function claimSyncCustomerPrincipal(sup){
  const c=claimCustomerPrincipalOf(sup.kode); if(!c) return null;
  Object.assign(c,{
    nama:sup.nama, alamat:sup.alamat||'', kota:sup.wilayah||'', telepon:sup.telp||'', fax:sup.fax||'',
    email:sup.email||'', kontakPerson:sup.kontak||'', npwp:sup.npwp||'', namaNpwp:sup.nama, alamatPajak:sup.alamat||'',
    mataUang:sup.mataUang||'IDR', provinsi:sup.provinsi||'', kabupaten:sup.kabupaten||'', kecamatan:sup.kecamatan||'',
    kelurahan:sup.kelurahan||'', kodePos:sup.kodePos||'', status: sup.status==='Non Aktif' ? 'Non Aktif' : 'Aktif',
  });
  return c;
}
function claimEnsureCustomerPrincipal(supplierKode){
  const sup=DATA.suppliers.find(s=>s.kode===supplierKode); if(!sup) return null;
  let c=claimCustomerPrincipalOf(supplierKode);
  if(!c){
    /* Bentuk objek disalin dari customer pertama (semua field dikosongkan)
       supaya list/form Master Customer tetap menemukan field yg dipakainya. */
    const tpl=DATA.customers[0]; c={};
    Object.keys(tpl).forEach(k=>{ const v=tpl[k]; c[k]=Array.isArray(v)?[]:(typeof v==='number'?0:(typeof v==='boolean'?false:'')); });
    Object.assign(c,{kode:'P-'+supplierKode, supplierKode, tipeCustomer:'Principal', groupCustomer:'PRINCIPAL', cabang:'Head Office',
      noRef:'PRC.'+supplierKode, tglRegistrasi:claimToday(), top:sup.syaratBayar||'', limit:0, piutang:0, salesman:'OFFICE', collector:[]});
    DATA.customers.push(c);
  }
  sup.customerKode=c.kode;
  claimSyncCustomerPrincipal(sup);
  return c;
}

/* ---------- PEMBUAT DOKUMEN (Transaksi A.R. / A.P. / Penjualan Langsung) ---------- */
function claimBuatNotaKredit(c){
  const kode=claimCabangKode(c.cabang), mm=claimToday().slice(3,5), n=c.nilaiAcc;
  const no=claimNextNo(DATA.transaksiAR, `26/ARS/${kode}/${mm}/`, 5);
  const ket=`NOTA KREDIT CLAIM ${c.no} - ${(c.principalNama||'').toUpperCase()}`;
  DATA.transaksiAR.unshift({no, cabang:c.cabang, tgl:claimToday(), customerKode:c.customerKode, customerNama:c.customerNama,
    noFaktur:'', jurnalKode:8, noClaim:c.no, keterangan:ket,
    rincian:[{tipe:'Nota Kredit', tglJthTempo:claimToday(), crc:'IDR', kurs:1, jumlah:-n}],
    jurnalMode:'otomatis',
    jurnalAkun:[
      {kodeAkun:'1120006', namaAkun:claimAkunNama('1120006'), keterangan:ket, debit:n, kredit:0},
      {kodeAkun:'1120001', namaAkun:claimAkunNama('1120001'), keterangan:ket, debit:0, kredit:n},
    ], jumlah:-n});
  c.notaKredit={no, tgl:claimToday(), nilai:n, sisa:n};
  claimLog(c, c.status, `Nota Kredit terbuka ${no} dibuat untuk ${c.customerNama} senilai ${claimNum2(n)}`);
  return no;
}
function claimBuatNotaDebitAP(c, nilai, noFakturSupplier){
  const kode=claimCabangKode(c.cabang), t=claimToday();
  const no=claimNextNo(DATA.transaksiAP, `AP/${kode}/${t.slice(8,10)}${t.slice(3,5)}`, 5);
  const ket=`Nota Debit Claim ${c.no} - ${c.customerNama}`;
  DATA.transaksiAP.unshift({no, noFaktur:no, cabang:c.cabang, tgl:t, supplierKode:c.principalKode, supplierNama:c.principalNama,
    jurnalKode:4, noClaim:c.no, keterangan:ket, noFakturSupplier:noFakturSupplier||'',
    rincian:[{tipe:'Nota Debet', tglJthTempo:t, crc:'IDR', kurs:1, nominal:-nilai}],
    jurnalMode:'otomatis',
    jurnalAkun:[
      {kodeAkun:'2110001', costCenter:'', namaAkun:claimAkunNama('2110001'), keterangan:ket, debit:nilai, kredit:0},
      {kodeAkun:'1120006', costCenter:'', namaAkun:claimAkunNama('1120006'), keterangan:ket, debit:0, kredit:nilai},
    ], jumlah:-nilai});
  return no;
}
/* Pajak tagihan claim ke principal — keputusan: SEMUA principal PPN 11%
   kode 04 DPP Nilai Lain + PPh 23 2%. */
function claimPajakTagihan(dpp){
  const ppn=Math.round(dpp*0.11*100)/100, pph=Math.round(dpp*0.02*100)/100;
  return {dpp, ppn, pph, jumlahAkhir:Math.round((dpp+ppn-pph)*100)/100};
}
function claimBuatPenjualanLangsung(c, nilai){
  const cust=claimEnsureCustomerPrincipal(c.principalKode);
  const kode=claimCabangKode(c.cabang), t=claimToday();
  const no=claimNextNo(DATA.penjualanLangsung, `26/DSI/${kode}/${t.slice(3,5)}/`, 5);
  const pj=claimPajakTagihan(nilai);
  /* Salin struktur dokumen contoh pertama (yg juga bertema klaim) lalu
     timpa field-nya — supaya list/form Penjualan Langsung tetap lengkap. */
  const row=JSON.parse(JSON.stringify(DATA.penjualanLangsung[DATA.penjualanLangsung.length-1]));
  Object.assign(row,{no, cabang:c.cabang, customerKode:cust.kode, customerNama:cust.nama,
    principalKode:c.principalKode, principalNama:c.principalNama, tglFaktur:t, tglJatuhTempo:t,
    syaratBayar:cust.top||row.syaratBayar, gudang:'Non Stock '+c.cabang, salesman:'OFFICE',
    alamatPengirimanTipe:'Alamat Customer', alamatPengiriman:cust.alamat||'',
    items:[{kode:'BB-00036', nama:`Klaim Biaya Promosi ${c.no}`, pphChecked:true, ppnChecked:true, specialDisc:'', batch:'0', qty:1, um:'UNIT',
      hna:0, hna1:nilai, hna1Inklusif:false, discPrincipal:0, discDistributor:0, totalDisc:0, discBarang:0, jumlah:nilai}],
    tipePpn:'PPN Eksklusif(+11%)', kodePajak:'04 - DPP Nilai Lain', noFakturPajak:'', tglFakturPajak:t,
    diskon1:0, diskon2:0, diskon1Amount:0, diskon2Amount:0, dpp:pj.dpp, pajak11:'PPN11', ppn:pj.ppn,
    pphKode:'PPH 23 (2)', pphPersen:2, pphAmount:pj.pph, ongkosAngkut:0, jumlahAkhir:pj.jumlahAkhir, sisaJumlah:pj.jumlahAkhir,
    suratJalan:no, keterangan:`Tagihan claim ${c.no} (${c.customerNama}) ke ${c.principalNama}`, tipeTransaksi:'Penjualan Kredit',
    pembayaran:0, noClaim:c.no, tglInput:claimNow(), userInput:'sidik', tglEdit:'', userEdit:''});
  DATA.penjualanLangsung.unshift(row);
  return no;
}

/* ---------- JURNAL (dihitung dari keadaan claim, tidak disimpan) ----------
   Tabel "Penyelesaian & jurnal" di spesifikasi. */
function claimJurnalLines(c){
  const lines=[]; const L=(sumber,kode,debit,kredit)=>lines.push({sumber, kodeAkun:kode, namaAkun:claimAkunNama(kode), debit, kredit});
  const akunOnFaktur = c.jenis==='Bonus Barang' ? '5110002' : '4110003';
  if(c.nilaiAcc>0 && c.cara==='On Faktur'){
    L('ACC claim on faktur','1120006',c.nilaiAcc,0); L('ACC claim on faktur',akunOnFaktur,0,c.nilaiAcc);
  }
  if(c.cara==='On Faktur' && ['Disetujui','Diproses','Selesai','Ditolak'].includes(c.status)){
    const selisih=(c.nilaiClaim||0)-(c.nilaiAcc||0);
    if(selisih>0.004){ L('Selisih on faktur → Biaya Promosi DBM','5210012',selisih,0); L('Selisih on faktur → Biaya Promosi DBM',akunOnFaktur,0,selisih); }
  }
  if(c.notaKredit){ const n=c.notaKredit.nilai; L(`Nota Kredit ${c.notaKredit.no}`,'1120006',n,0); L(`Nota Kredit ${c.notaKredit.no}`,'1120001',0,n); }
  if(c.bonusDikirim){ const n=c.bonusDikirim.nilai; L(`Kirim bonus ${c.bonusDikirim.no}`,'1120006',n,0); L(`Kirim bonus ${c.bonusDikirim.no}`,'1130001',0,n); }
  (c.pemulihan||[]).forEach(p=>{
    const s=`${p.jalur} ${p.noDok}`;
    if(p.jalur==='Nota Debit AP'){ L(s,'2110001',p.nilai,0); L(s,'1120006',0,p.nilai); }
    else if(p.jalur==='Penjualan Langsung'){ const pj=claimPajakTagihan(p.nilai); L(s,'1120001',pj.jumlahAkhir,0); L(s,'1140004',pj.pph,0); L(s,'1120006',0,pj.dpp); L(s,'2120002',0,pj.ppn); }
    else { L(s,'1130001',p.nilai,0); L(s,'1120006',0,p.nilai); }
  });
  return lines;
}
/* Picker principal (DATA.suppliers) sederhana dengan pencarian —
   dipakai Claim Customer & Setting Claim Principal. */
function openClaimSupplierPicker(onPick, onlySetting){
  closeModal();
  const base=onlySetting ? DATA.suppliers.filter(s=>claimSetting(s.kode)) : DATA.suppliers;
  const overlay=document.createElement('div');
  overlay.className='modal-overlay';
  const rowsHtml=list=>list.length ? list.map(s=>`<tr><td>${s.kode}</td><td>${s.nama}</td><td>${s.email||''}</td><td><button class="btn-pick" data-claim-pick-sup="${s.kode}">Pilih</button></td></tr>`).join('')
    : `<tr><td colspan="4" style="color:var(--text-light);">Tidak ada principal ditemukan</td></tr>`;
  overlay.innerHTML=`
    <div class="modal-box" style="max-width:680px;">
      <div class="modal-header"><span>Pilih Principal</span><span class="close" id="modalClose">&times;</span></div>
      <div class="modal-body">
        <input type="text" id="claimSupSearch" placeholder="Cari kode / nama principal..." style="width:100%;border:1px solid var(--border);border-radius:6px;padding:8px 10px;font-size:12.8px;margin-bottom:12px;">
        ${onlySetting?'<div style="font-size:11.8px;color:var(--text-light);margin:-4px 0 10px;">Hanya principal yang sudah punya Setting Claim Principal.</div>':''}
        <div class="table-wrap" style="max-height:360px;overflow:auto;"><table>
          <thead><tr><th>Kode</th><th>Nama Principal</th><th>Email</th><th></th></tr></thead>
          <tbody id="claimSupBody">${rowsHtml(base)}</tbody>
        </table></div>
      </div>
      <div class="modal-footer"><button class="btn-secondary" id="modalCancel">Tutup</button></div>
    </div>`;
  document.body.appendChild(overlay);
  const bind=()=>overlay.querySelectorAll('[data-claim-pick-sup]').forEach(b=>b.onclick=()=>{
    const s=DATA.suppliers.find(x=>x.kode===b.dataset.claimPickSup); closeModal(); onPick(s);
  });
  document.getElementById('modalClose').onclick=closeModal;
  document.getElementById('modalCancel').onclick=closeModal;
  overlay.onclick=e=>{ if(e.target===overlay) closeModal(); };
  document.getElementById('claimSupSearch').oninput=e=>{
    const q=e.target.value.trim().toLowerCase();
    document.getElementById('claimSupBody').innerHTML=rowsHtml(base.filter(s=>!q||s.kode.toLowerCase().includes(q)||s.nama.toLowerCase().includes(q)));
    bind();
  };
  bind();
}
/* ---------- LAMPIRAN (upload file) — dipakai Claim Customer & Pengajuan Claim ----------
   `list` = array {nama, ukuran (byte), tgl, user, kategori, url?}. `url`
   = object URL file yang diunggah di sesi ini (bisa dibuka); lampiran
   data contoh tidak punya `url` (file fisiknya tidak ada di mockup).
   `opts` = {kategoriList:[...] (>1 → muncul dropdown kategori sebelum
   upload), deletable(f) (default: semua boleh dihapus), hint,
   onChange() (dipanggil setelah upload/hapus)}.
   Semua elemen memakai atribut data-lamp-* (bukan id) supaya aman bila
   ada lebih dari satu blok lampiran di halaman. */
const CLAIM_LAMPIRAN_EXT=['pdf','jpg','jpeg','png','xls','xlsx','doc','docx','zip'];
const CLAIM_LAMPIRAN_MAX=10*1024*1024;
function claimFileSize(b){
  if(b>=1024*1024) return (b/1024/1024).toLocaleString('id-ID',{maximumFractionDigits:1})+' MB';
  return Math.max(1,Math.round(b/1024)).toLocaleString('id-ID')+' KB';
}
/* Validasi ekstensi & ukuran; kembalikan pesan error atau '' bila lolos. */
function claimCekFile(f){
  const ext=(f.name.split('.').pop()||'').toLowerCase();
  if(!CLAIM_LAMPIRAN_EXT.includes(ext)) return `${f.name}: jenis file .${ext} tidak diizinkan`;
  if(f.size>CLAIM_LAMPIRAN_MAX) return `${f.name}: ukuran ${claimFileSize(f.size)} melebihi 10 MB`;
  return '';
}
function claimFileToLampiran(f, kategori){
  return {nama:f.name, ukuran:f.size, tgl:claimToday(), user:'sidik', kategori, url:URL.createObjectURL(f)};
}
function tplClaimLampiran(list, editable, opts){
  opts=opts||{}; list=list||[];
  const kat=opts.kategoriList||['Lampiran'];
  const canDel=opts.deletable||(()=>true);
  return `
    ${editable ? `<div style="display:flex;gap:10px;align-items:center;flex-wrap:wrap;margin-bottom:8px;">
      ${kat.length>1 ? `<select data-lamp-kategori title="Kategori lampiran" style="width:auto;min-width:200px;padding:8px 10px;border:1px solid var(--border);border-radius:6px;font-size:12.8px;background:#fff;color:var(--text);">${kat.map(k=>`<option>${k}</option>`).join('')}</select>` : ''}
      <button type="button" class="btn-secondary" data-lamp-upload>${icon('plus',13)} Upload File</button>
      <input type="file" data-lamp-input multiple accept="${CLAIM_LAMPIRAN_EXT.map(e=>'.'+e).join(',')}" style="display:none;">
      <span style="font-size:11.8px;color:var(--text-light);">PDF, JPG, PNG, Excel, Word, ZIP · maks. 10 MB per file · bisa pilih beberapa file sekaligus</span>
    </div>
    <div class="form-error" data-lamp-err></div>` : ''}
    ${list.length ? `<div class="table-wrap"><table>
      <thead><tr><th style="width:40px;">No.</th><th>Nama File</th><th style="width:170px;">Kategori</th><th class="text-right" style="width:90px;">Ukuran</th><th style="width:150px;">Diunggah</th><th style="width:55px;">Lihat</th>${editable?'<th style="width:55px;">Hapus</th>':''}</tr></thead>
      <tbody>${list.map((f,i)=>`<tr>
        <td>${i+1}</td>
        <td style="white-space:normal;">${icon('file',13)} ${f.nama}</td>
        <td>${f.kategori}</td>
        <td class="text-right">${claimFileSize(f.ukuran)}</td>
        <td style="font-size:12px;">${f.tgl} · ${f.user}</td>
        <td><button type="button" class="icon-btn view" data-lamp-view="${i}" title="Lihat">${icon('eye',15)}</button></td>
        ${editable?`<td>${canDel(f)?`<button type="button" class="icon-btn del" data-lamp-del="${i}" title="Hapus">${icon('trash',15)}</button>`:''}</td>`:''}
      </tr>`).join('')}</tbody>
    </table></div>`
    : `<div class="upload-box">Belum ada file diunggah.${editable&&opts.hint?' '+opts.hint:''}</div>`}`;
}
/* Bind upload/lihat/hapus di dalam elemen `wrap`; `row.lampiran` diubah langsung. */
function bindClaimLampiran(wrap, row, editable, opts){
  row.lampiran=row.lampiran||[];
  const rerender=()=>{
    wrap.innerHTML=tplClaimLampiran(row.lampiran, editable, opts); bindClaimLampiran(wrap, row, editable, opts);
    if(opts&&opts.onChange) opts.onChange();
  };
  const input=wrap.querySelector('[data-lamp-input]');
  const btn=wrap.querySelector('[data-lamp-upload]');
  if(btn) btn.onclick=()=>input.click();
  if(input) input.onchange=()=>{
    const katEl=wrap.querySelector('[data-lamp-kategori]');
    const kategori=katEl ? katEl.value : ((opts&&opts.kategoriList)||['Lampiran'])[0];
    const errs=[];
    [...input.files].forEach(f=>{ const e=claimCekFile(f); if(e) errs.push(e); else row.lampiran.push(claimFileToLampiran(f, kategori)); });
    rerender();
    const katNew=wrap.querySelector('[data-lamp-kategori]'); if(katNew) katNew.value=kategori;
    if(errs.length){ const el=wrap.querySelector('[data-lamp-err]'); el.innerHTML=errs.join('<br>'); el.style.display='block'; }
  };
  wrap.querySelectorAll('[data-lamp-del]').forEach(b=>b.onclick=()=>{
    const f=row.lampiran[+b.dataset.lampDel];
    if(f.url) URL.revokeObjectURL(f.url);
    row.lampiran.splice(+b.dataset.lampDel,1);
    rerender();
  });
  wrap.querySelectorAll('[data-lamp-view]').forEach(b=>b.onclick=()=>{
    const f=row.lampiran[+b.dataset.lampView];
    if(f.url) window.open(f.url,'_blank');
    else openClaimInfo('Lampiran contoh', `<b>${f.nama}</b> adalah lampiran data contoh mockup, file fisiknya tidak tersedia. File yang Anda unggah sendiri bisa langsung dibuka.`);
  });
}

/* Buka dokumen hasil claim di modulnya. Penjualan Langsung punya filter
   periode (default Juli 2026) → dibuka dengan "Semua Periode" supaya
   tagihan claim yang baru dibuat langsung terlihat. */
function claimGoToDok(page){
  const titles={ pengajuanClaim:'Pengajuan Claim Principal', transaksiAR:'Transaksi A.R.', transaksiAP:'Transaksi A.P.', penjualanLangsung:'Penjualan Langsung' };
  goToPage(page, titles[page], page==='penjualanLangsung' ? ()=>{
    if(typeof pjlState!=='undefined' && typeof renderPjlList==='function'){ pjlState.bulan='|'; renderPjlList(); }
  } : null);
}
/* Modal info sederhana bersama modul claim. */
function openClaimInfo(title, html){
  closeModal();
  const overlay=document.createElement('div');
  overlay.className='modal-overlay';
  overlay.innerHTML=`<div class="modal-box"><div class="modal-header"><span>${title}</span><span class="close" id="modalClose">&times;</span></div>
    <div class="modal-body"><p style="line-height:1.55;">${html}</p></div>
    <div class="modal-footer"><button class="btn-primary" id="modalOk">Mengerti</button></div></div>`;
  document.body.appendChild(overlay);
  document.getElementById('modalClose').onclick=closeModal;
  document.getElementById('modalOk').onclick=closeModal;
  overlay.onclick=e=>{ if(e.target===overlay) closeModal(); };
}

/* =========================================================
   INIT
========================================================= */
document.getElementById('hamburgerBtn').innerHTML=icon('menu',20);
document.getElementById('hamburgerBtn').onclick=()=>{
  document.getElementById('layout').classList.toggle('collapsed');
};
buildSidebar();
// Contoh Link Supplier ↔ Customer: PT Wilmar Nabati Indonesia (5016)
// sudah punya customer principal terhubung P-5016 sejak awal demo.
claimEnsureCustomerPrincipal('5016');
// Load awal: kalau URL sudah punya hash (mis. setelah refresh), buka
// halaman itu; kalau tidak, default Dashboard. replaceState (bukan
// push) supaya entry riwayat pertama = halaman awal ini.
(function(){
  const init=parseNavHash(location.hash);
  if(init){ currentPage=init.page; currentTitle=init.title; }
  else{ currentTitle='Dashboard'; }
  history.replaceState({page:currentPage, title:currentTitle},'',navHash(currentPage,currentTitle));
  syncSidebar(currentPage,currentTitle);
})();
renderPage();

const notifBtnEl=document.getElementById('notifBtn');
notifBtnEl.insertAdjacentHTML('afterbegin', icon('bell',20));
notifBtnEl.addEventListener('click',(e)=>{
  e.stopPropagation();
  notifOpen ? closeNotifDropdown() : openNotifDropdown();
});
document.addEventListener('click',(e)=>{
  if(notifOpen && !notifBtnEl.contains(e.target)) closeNotifDropdown();
});
refreshNotifBadge();
