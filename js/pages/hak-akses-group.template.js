/* =========================================================
   TEMPLATE (HTML saja) — Setting Hak Akses Group (User
   Security > Hak Akses Group, page:'hakAksesGroup'). Semua
   fungsi di file ini HANYA menyusun & mengembalikan markup
   HTML (string) atau helper murni, TIDAK ada DOM-binding/
   mutation. Logic-nya di file sebelah: hak-akses-group.js
   NB: closeModal() dipakai bersama, didefinisikan di core.js.

   Dibangun 2026-09-01 sesuai screenshot MASERP SDL "Setting
   Hak Akses Group": banner kuning info administrator, dark
   header + tombol Reset Hak Akses (merah) / Save (biru) /
   Tutorial (merah), input "search hak akses ...", MATRIKS:
   kolom pertama "Nama Hak Akses" berupa TREE modul yang bisa
   di-expand (+/-) — SHELL, DASHBOARD, PURCHASING, SALES,
   INVENTORY, BANK, MANUFACTURING, FIXEDASSET, GENERALLEDGER,
   PROJECTMANAGEMENT — kolom berikutnya = kode Group User
   (DBM: dari DATA.groupUser, group isAdmin DIKECUALIKAN sesuai
   banner "administrator bisa mengakses semua"). Baris modul =
   sel kosong (checkbox hanya di baris anak, seperti
   screenshot yang modulnya belum di-expand). Expand modul
   menampilkan baris hak akses anak dgn CHECKBOX per group;
   pencarian memfilter nama hak akses & auto-expand modul yang
   cocok. Save = tulis balik ke DATA.hakAksesGroup + modal
   info; Reset Hak Akses = konfirmasi lalu kosongkan semua
   centang. Isi anak tiap modul dipetakan ke menu mockup DBM.
   Tabel dibungkus .table-wrap (scroll horizontal utk banyak
   kolom group, seperti screenshot yang terpotong di APJA-HO). */

const HAG_MODULES = [
  {nama:'SHELL', items:['Login Multi Cabang','Ganti Password','Kunci Layar','Notifikasi']},
  {nama:'DASHBOARD', items:['Dashboard Utama','Dashboard Supplier & Pembelian','Dashboard Customer & Penjualan','Dashboard Persediaan Barang','Dashboard Kas/Bank','Dashboard General Ledger']},
  {nama:'PURCHASING', items:['Purchase Order','Permintaan Pembelian','Terima Barang','Pembelian Melalui BPB','Pembelian Langsung','Pembelian dari PO','Retur Pembelian','Pelunasan Utang','Pengajuan Pembayaran','Uang Muka Supplier']},
  {nama:'SALES', items:['Sales Quotation','Sales Order','Picking List','Invoice','Retur Penjualan','Uang Muka Customer','Surat Pesanan Ekatalog & Khusus','T3F','Daftar Tagih Piutang','Penerimaan Piutang']},
  {nama:'INVENTORY', items:['Persediaan Barang','Stock Request','Transaksi Persediaan','Master Stock Opname','Stock Opname','Reordering Sheet']},
  {nama:'BANK', items:['Master Bank','Transaksi Kas','Jurnal Kas Lain-Lain','Daftar Giro Mundur','Rekonsiliasi']},
  {nama:'MANUFACTURING', items:['Work Order','Bill of Material','Hasil Produksi']},
  {nama:'FIXEDASSET', items:['Fixed Asset','Pembelian Aktiva Tetap','Penjualan Aktiva Tetap','Biaya Asset','Disposal Asset','Revaluasi Asset']},
  {nama:'GENERALLEDGER', items:['Akun GL','Jurnal Umum','Cost Center','Budget vs Actual']},
  {nama:'PROJECTMANAGEMENT', items:['Project','Task Project','Timeline Project']},
];

function hagGroups(){
  return (DATA.groupUser || []).filter(g => !g.isAdmin).map(g => g.kode);
}

function hagKey(modul, item, group){ return `${modul}|${item}|${group}`; }

function tplHagPage(){
  const groups = hagGroups();
  return `
    <div style="background:#faedb9;border-left:4px solid #e2b93b;border-radius:4px;padding:12px 16px;font-size:12.8px;font-weight:700;color:#4a3f12;margin-bottom:14px;">
      Jika jabatannya adalah administrator , maka administrator bisa mengakses semua sehingga tidak diperlu di setting .
    </div>
    <div class="card">
      <div class="card-header dark-header">
        <h3>${icon('alertTriangle',15)} Setting Hak Akses Group</h3>
        <div class="toolbar-actions">
          <button class="btn-danger" id="btnHagReset">${icon('refreshCw',13)} Reset Hak Akses</button>
          <button class="btn-primary" id="btnHagSave">${icon('save',13)} Save</button>
          <button class="btn-danger" id="btnHagTutorial">${icon('card',13)} Tutorial</button>
        </div>
      </div>
      <div style="padding:12px 14px 0;">
        <input type="text" id="hagSearch" placeholder="search hak akses ..." style="width:100%;border:1px solid var(--border);border-radius:6px;padding:9px 12px;font-size:12.8px;">
      </div>
      <div class="table-wrap" style="margin:10px 14px 14px;overflow-x:auto;">
        <table style="min-width:${300 + groups.length*90}px;">
          <thead><tr>
            <th style="min-width:260px;text-align:left;">Nama Hak Akses</th>
            ${groups.map(g=>`<th style="min-width:82px;text-align:center;">${g}</th>`).join('')}
          </tr></thead>
          <tbody id="hagTbody"></tbody>
        </table>
      </div>
    </div>`;
}

/* Baris matriks: modul (expandable, sel group kosong) + anak (checkbox per group).
   `checks` = Set key "MODUL|ITEM|GROUP"; `expanded` = Set nama modul; `q` = filter. */
function tplHagRows(checks, expanded, q){
  const groups = hagGroups();
  let html = '';
  HAG_MODULES.forEach(m => {
    const items = q ? m.items.filter(it => it.toLowerCase().includes(q)) : m.items;
    if(q && !items.length && !m.nama.toLowerCase().includes(q)) return;
    const isOpen = expanded.has(m.nama) || (!!q && items.length > 0);
    html += `
    <tr style="border-top:1px solid var(--border);">
      <td style="font-weight:700;">
        <span data-hag-toggle="${m.nama}" style="cursor:pointer;color:var(--blue);font-weight:800;display:inline-block;width:20px;text-align:center;">${isOpen?'&minus;':'+'}</span>
        ${m.nama}
      </td>
      ${groups.map(()=>'<td></td>').join('')}
    </tr>`;
    if(isOpen){
      (q ? items : m.items).forEach(it => {
        html += `
        <tr>
          <td style="padding-left:44px;color:var(--text);">${it}</td>
          ${groups.map(g=>`<td style="text-align:center;"><input type="checkbox" data-hag-cek="${hagKey(m.nama,it,g)}" ${checks.has(hagKey(m.nama,it,g))?'checked':''} style="width:auto;"></td>`).join('')}
        </tr>`;
      });
    }
  });
  if(!html) html = `<tr><td colspan="${groups.length+1}" style="color:var(--text-light);padding:14px;">Tidak ada hak akses yang cocok dengan pencarian.</td></tr>`;
  return html;
}

function tplHagResetConfirm(){
  return `
    <div class="modal-box">
      <div class="modal-header"><span>Reset Hak Akses</span><span class="close" id="modalClose">&times;</span></div>
      <div class="modal-body"><p>Yakin ingin me-reset SELURUH hak akses group? Semua centang akan dikosongkan.</p></div>
      <div class="modal-footer">
        <button class="btn-secondary" id="modalCancel">Batal</button>
        <button class="btn-danger" id="modalReset">Reset</button>
      </div>
    </div>`;
}

function tplHagInfoModal(title,text){
  return `
    <div class="modal-box">
      <div class="modal-header"><span>${title}</span><span class="close" id="modalClose">&times;</span></div>
      <div class="modal-body"><p>${text}</p></div>
      <div class="modal-footer"><button class="btn-primary" id="modalOk">Mengerti</button></div>
    </div>`;
}
