/* =========================================================
   TEMPLATE (HTML saja) — Chart / Grafik (Daftar Laporan >
   Chart / Grafik, page:'chartGrafik'). Semua fungsi di file
   ini HANYA menyusun & mengembalikan markup HTML (string) atau
   helper murni, TIDAK ada DOM-binding/Chart.js di sini.
   Logic-nya di file sebelah: chart-grafik.js
   NB: closeModal() dipakai bersama, didefinisikan di core.js.

   Dibangun 2026-09-01 sesuai screenshot MASERP SDL halaman
   "Chart / Grafik" (data SDL alkes/farmasi dipetakan ke master
   DBM: produk DATA.items, salesman DATA.salesman (realisasi),
   customer DATA.customers (piutang sbg Saldo), wilayah
   DATA.wilayah). 6 panel:
   1) Top 10 Product — PIE + legend nama produk; chip
      "Penjualan ▾" + chip bulan (FUNGSIONAL Sept/Agust 2026;
      chip Penjualan ▾ opsi Penjualan/Retur Penjualan —
      Retur menampilkan nilai retur yang jauh lebih kecil).
   2) Top 10 Salesman — PIE + legend nama salesman; chip bulan.
   3) Top 10 Customer — BAR HORIZONTAL dataset "Saldo", sumbu X
      "Jumlah (Saldo)"; chip Penjualan + bulan.
   4) Top 10 Wilayah — BAR HORIZONTAL (beberapa wilayah 0.00
      seperti screenshot); chip Penjualan + bulan.
   5) Top 10 Customer Use Parameter — BAR HORIZONTAL yang
      AWALNYA SEMUA 0.00 (persis screenshot) + tombol
      "+ Show Parameter" (modal periode+cabang; Terapkan
      mengisi nilai).
   6) Top 10 Product by Omset Use Parameter — BAR HORIZONTAL
      berisi nilai + tombol "+ Show Parameter".
   Semua chart digambar dgn Chart.js (vendor sudah dimuat
   global); instance disimpan & di-destroy sebelum digambar
   ulang supaya ganti chip/parameter tidak menumpuk canvas. */

function tplCgChipBulan(id){
  return `<select class="chip-btn" id="${id}"><option value="09">September 2026</option><option value="08">Agustus 2026</option></select>`;
}

function tplCgChipJenis(id){
  return `<select class="chip-btn" id="${id}"><option>Penjualan</option><option>Retur Penjualan</option></select>`;
}

function tplCgPage(){
  return `
    <div class="breadcrumb">Home / Daftar Laporan / <b>Chart / Grafik</b></div>

    <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;">
      <div class="card">
        <div class="card-header dark-header">
          <h3>${icon('users',14)} Top 10 Product</h3>
          <div class="toolbar-actions">${tplCgChipJenis('cgProdukJenis')}${tplCgChipBulan('cgProdukBulan')}</div>
        </div>
        <div class="card-body" style="height:330px;"><canvas id="cgChartProduk"></canvas></div>
      </div>
      <div class="card">
        <div class="card-header dark-header">
          <h3>${icon('users',14)} Top 10 Salesman</h3>
          <div class="toolbar-actions">${tplCgChipBulan('cgSalesmanBulan')}</div>
        </div>
        <div class="card-body" style="height:330px;"><canvas id="cgChartSalesman"></canvas></div>
      </div>
    </div>

    <div class="card" style="margin-top:16px;">
      <div class="card-header dark-header">
        <h3>${icon('users',14)} Top 10 Customer</h3>
        <div class="toolbar-actions">${tplCgChipJenis('cgCustomerJenis')}${tplCgChipBulan('cgCustomerBulan')}</div>
      </div>
      <div class="card-body" style="height:380px;"><canvas id="cgChartCustomer"></canvas></div>
    </div>

    <div class="card" style="margin-top:16px;">
      <div class="card-header dark-header">
        <h3>${icon('users',14)} Top 10 Wilayah</h3>
        <div class="toolbar-actions">${tplCgChipJenis('cgWilayahJenis')}${tplCgChipBulan('cgWilayahBulan')}</div>
      </div>
      <div class="card-body" style="height:380px;"><canvas id="cgChartWilayah"></canvas></div>
    </div>

    <div class="card" style="margin-top:16px;">
      <div class="card-header dark-header">
        <h3>${icon('users',14)} Top 10 Customer Use Parameter</h3>
        <button class="btn-primary" id="btnCgParamCustomer">${icon('plus',13)} Show Parameter</button>
      </div>
      <div class="card-body" style="height:380px;"><canvas id="cgChartCustomerParam"></canvas></div>
    </div>

    <div class="card" style="margin-top:16px;">
      <div class="card-header dark-header">
        <h3>${icon('users',14)} Top 10 Product by Omset Use Parameter</h3>
        <button class="btn-primary" id="btnCgParamProduk">${icon('plus',13)} Show Parameter</button>
      </div>
      <div class="card-body" style="height:380px;"><canvas id="cgChartProdukOmset"></canvas></div>
    </div>`;
}

/* Modal parameter (tombol "+ Show Parameter"). */
function tplCgParamModal(judul, param){
  return `
    <div class="modal-box" style="max-width:520px;">
      <div class="modal-header"><span>Parameter — ${judul}</span><span class="close" id="modalClose">&times;</span></div>
      <div class="modal-body">
        <div class="form-group">
          <label>Periode Dari</label>
          <div class="input-with-btn">
            <input type="text" id="fCgDari" value="${param.dari||'01/09/2026'}">
            <span class="icon-btn edit" style="pointer-events:none;">${icon('calendar',13)}</span>
          </div>
        </div>
        <div class="form-group">
          <label>Periode Sampai</label>
          <div class="input-with-btn">
            <input type="text" id="fCgSampai" value="${param.sampai||'30/09/2026'}">
            <span class="icon-btn edit" style="pointer-events:none;">${icon('calendar',13)}</span>
          </div>
        </div>
        <div class="form-group">
          <label>Cabang</label>
          <select id="fCgCabang">
            <option ${param.cabang==='Semua Cabang'?'selected':''}>Semua Cabang</option>
            ${(DATA.cabangMaster||[]).map(c=>`<option ${param.cabang===c.namaCabang?'selected':''}>${c.namaCabang||c.nama||''}</option>`).join('')}
          </select>
        </div>
      </div>
      <div class="modal-footer">
        <button class="btn-secondary" id="modalCancel">Batal</button>
        <button class="btn-primary" id="cgTerapkan">Terapkan</button>
      </div>
    </div>`;
}
