/* =========================================================
   TEMPLATE (HTML saja) — Dashboard Utama
   Fungsi di file ini HANYA menyusun & mengembalikan markup
   HTML (string), TIDAK ada logic/DOM-binding di sini.
   Logic-nya ada di file sebelah: dashboard-main.js
========================================================= */
function tplMainDashboard(){
  return `
    <div class="breadcrumb">Home / <b>Dashboard</b></div>
    <h3 style="font-size:15px;font-weight:700;margin-bottom:16px;">Alur Sistem Pembelian</h3>
    <div class="flow-row" style="margin-bottom:34px;">
      <div class="flow-step"><div class="flow-box">${icon('file',28)}</div><div class="flow-label">Purchase Order</div></div>
      <div class="flow-arrow">&#8594;</div>
      <div class="flow-step"><div class="flow-box">${icon('truck',28)}</div><div class="flow-label">Terima Barang</div></div>
      <div class="flow-arrow">&#8594;</div>
      <div class="flow-step"><div class="flow-box">${icon('cart',28)}</div><div class="flow-label">Faktur Pembelian</div></div>
      <div class="flow-arrow">&#8594;</div>
      <div class="flow-step"><div class="flow-box">${icon('cash',28)}</div><div class="flow-label">Pelunasan Utang</div></div>
    </div>

    <h3 style="font-size:15px;font-weight:700;margin-bottom:16px;">Alur Sistem Penjualan</h3>
    <div class="flow-row">
      <div class="flow-step"><div class="flow-box">${icon('file',28)}</div><div class="flow-label">Sales Order</div></div>
      <div class="flow-arrow">&#8594;</div>
      <div class="flow-step"><div class="flow-box">${icon('truck',28)}</div><div class="flow-label">Invoice</div></div>
      <div class="flow-arrow">&#8594;</div>
      <div class="flow-step"><div class="flow-box">${icon('card',28)}</div><div class="flow-label">Faktur Penjualan</div></div>
      <div class="flow-arrow">&#8594;</div>
      <div class="flow-step"><div class="flow-box">${icon('cash',28)}</div><div class="flow-label">Penerimaan Piutang</div></div>
    </div>
  `;
}
