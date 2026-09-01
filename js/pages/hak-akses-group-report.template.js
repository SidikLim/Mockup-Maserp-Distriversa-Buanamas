/* =========================================================
   TEMPLATE (HTML saja) — Setting Hak Akses Group Report (User
   Security > Hak Akses Group Report, page:'hakAksesGroupReport').
   Semua fungsi di file ini HANYA menyusun & mengembalikan
   markup HTML (string) atau helper murni, TIDAK ada DOM-
   binding/mutation. Logic-nya di file sebelah:
   hak-akses-group-report.js
   NB: closeModal() dipakai bersama, didefinisikan di core.js.

   Dibangun 2026-09-01 sesuai screenshot MASERP SDL "Setting
   Hak Akses Group Report" — kembaran Setting Hak Akses Group
   (pola sama: header + Reset Hak Akses/Save/Tutorial, input
   "search hak akses ...", matriks tree modul x kolom group)
   dengan BEDA: (1) TANPA banner kuning administrator, (2)
   kolom group TERMASUK ADM (di screenshot report kolom ADM
   ikut tampil, beda dari layar Hak Akses Group), (3) modul =
   kategori LAPORAN (CETAKANTRANSAKSI, ACCOUNTRECEIVABLE,
   SALES, ACCOUNTPAYABLE, PURCHASING, INVENTORY, CASHANDBANK,
   GENERALLEDGER — urutan persis screenshot), dan (4) item
   anak per modul DIAMBIL DINAMIS dari katalog laporan Report
   Center DBM (REPORT_CENTERS_DATA di js/data.js — nama-nama
   laporan sungguhan modul Daftar Laporan), bukan daftar
   statis. */

const HGR_MODULES = [
  {nama:'CETAKANTRANSAKSI', key:'cetakanTransaksi'},
  {nama:'ACCOUNTRECEIVABLE', key:'ar'},
  {nama:'SALES', key:'penjualan'},
  {nama:'ACCOUNTPAYABLE', key:'ap'},
  {nama:'PURCHASING', key:'purchasing'},
  {nama:'INVENTORY', key:'persediaan'},
  {nama:'CASHANDBANK', key:'kasBank'},
  {nama:'GENERALLEDGER', key:'gl'},
];

function hgrGroups(){
  return (DATA.groupUser || []).map(g => g.kode);
}

/* Nama laporan per modul — flatten groups Report Center, dedupe. */
function hgrItems(modKey){
  const cat = (typeof REPORT_CENTERS_DATA !== 'undefined') ? REPORT_CENTERS_DATA[modKey] : null;
  if(!cat || !cat.groups) return [];
  const seen = new Set();
  const out = [];
  cat.groups.forEach(g => (g.rows||[]).forEach(r => {
    if(r.report && !seen.has(r.report)){ seen.add(r.report); out.push(r.report); }
  }));
  return out;
}

function hgrKey(modul, item, group){ return `${modul}|${item}|${group}`; }

function tplHgrPage(){
  const groups = hgrGroups();
  return `
    <div class="card">
      <div class="card-header dark-header">
        <h3>${icon('alertTriangle',15)} Setting Hak Akses Group Report</h3>
        <div class="toolbar-actions">
          <button class="btn-danger" id="btnHgrReset">${icon('refreshCw',13)} Reset Hak Akses</button>
          <button class="btn-primary" id="btnHgrSave">${icon('save',13)} Save</button>
          <button class="btn-danger" id="btnHgrTutorial">${icon('card',13)} Tutorial</button>
        </div>
      </div>
      <div style="padding:12px 14px 0;">
        <input type="text" id="hgrSearch" placeholder="search hak akses ..." style="width:100%;border:1px solid var(--border);border-radius:6px;padding:9px 12px;font-size:12.8px;">
      </div>
      <div class="table-wrap" style="margin:10px 14px 14px;overflow-x:auto;">
        <table style="min-width:${300 + groups.length*90}px;">
          <thead><tr>
            <th style="min-width:260px;text-align:left;">Nama Hak Akses</th>
            ${groups.map(g=>`<th style="min-width:82px;text-align:center;">${g}</th>`).join('')}
          </tr></thead>
          <tbody id="hgrTbody"></tbody>
        </table>
      </div>
    </div>`;
}

function tplHgrRows(checks, expanded, q){
  const groups = hgrGroups();
  let html = '';
  HGR_MODULES.forEach(m => {
    const all = hgrItems(m.key);
    const items = q ? all.filter(it => it.toLowerCase().includes(q)) : all;
    if(q && !items.length && !m.nama.toLowerCase().includes(q)) return;
    const isOpen = expanded.has(m.nama) || (!!q && items.length > 0);
    html += `
    <tr style="border-top:1px solid var(--border);">
      <td style="font-weight:700;">
        <span data-hgr-toggle="${m.nama}" style="cursor:pointer;color:var(--blue);font-weight:800;display:inline-block;width:20px;text-align:center;">${isOpen?'&minus;':'+'}</span>
        ${m.nama}
      </td>
      ${groups.map(()=>'<td></td>').join('')}
    </tr>`;
    if(isOpen){
      (q ? items : all).forEach(it => {
        html += `
        <tr>
          <td style="padding-left:44px;color:var(--text);">${it}</td>
          ${groups.map(g=>`<td style="text-align:center;"><input type="checkbox" data-hgr-cek="${hgrKey(m.nama,it,g)}" ${checks.has(hgrKey(m.nama,it,g))?'checked':''} style="width:auto;"></td>`).join('')}
        </tr>`;
      });
    }
  });
  if(!html) html = `<tr><td colspan="${groups.length+1}" style="color:var(--text-light);padding:14px;">Tidak ada hak akses laporan yang cocok dengan pencarian.</td></tr>`;
  return html;
}

function tplHgrResetConfirm(){
  return `
    <div class="modal-box">
      <div class="modal-header"><span>Reset Hak Akses</span><span class="close" id="modalClose">&times;</span></div>
      <div class="modal-body"><p>Yakin ingin me-reset SELURUH hak akses laporan group? Semua centang akan dikosongkan.</p></div>
      <div class="modal-footer">
        <button class="btn-secondary" id="modalCancel">Batal</button>
        <button class="btn-danger" id="modalReset">Reset</button>
      </div>
    </div>`;
}

function tplHgrInfoModal(title,text){
  return `
    <div class="modal-box">
      <div class="modal-header"><span>${title}</span><span class="close" id="modalClose">&times;</span></div>
      <div class="modal-body"><p>${text}</p></div>
      <div class="modal-footer"><button class="btn-primary" id="modalOk">Mengerti</button></div>
    </div>`;
}
