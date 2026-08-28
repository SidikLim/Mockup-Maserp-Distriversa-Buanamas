/* =========================================================
   TEMPLATE (HTML saja) — Promotion (Customer & Penjualan >
   Master & Setting). Semua fungsi di file ini HANYA menyusun &
   mengembalikan markup HTML (string), TIDAK ada logic/DOM-
   binding/data mutation di sini. Logic-nya ada di file sebelah:
   promotion.js

   Sesuai 6 screenshot MASERP yang dikirim user: 1 list "Daftar
   Promotion" + 4 varian form Ubah tergantung field "Promotion
   Category" (A=Discount Program, DPF=Discount Proposal Form,
   DPL=Discount Proposal List, CAT=Discount Category) — INTI modul
   ini adalah field & tabel rincian form berubah BENTUK TOTAL
   tergantung Promotion Category yang dipilih (mirip pola dynamic-
   section Grup Customer, tapi di sini yang berubah 1 section besar
   sekaligus, bukan beberapa section independen). Form dibuat FULL
   PAGE (bukan modal) karena field jauh lebih dari 6.

   Data customer/channel di sample DIGANTI ke milik DBM sendiri
   (DATA.customers/DATA.customerGroup) — screenshot asli dari demo
   perusahaan farmasi/rumah sakit lain (lihat catatan di
   DATA.promotion, js/data.js).
========================================================= */

function promDiscUnitOptions(sel){
  return `<option value="%" ${sel==='%'?'selected':''}>%</option><option value="Rp" ${sel==='Rp'?'selected':''}>Rp</option>`;
}

/* ---------- LIST "Daftar Promotion" ---------- */
function tplPromotionListPage(){
  return `
    <div class="breadcrumb">Home / <b>Promotion</b></div>
    <div class="card">
      <div class="card-header dark-header">
        <h3>${icon('percent',15)} Daftar Promotion</h3>
        <div class="toolbar-actions">
          <button class="btn-teal" id="btnPromImport">${icon('file',14)} Import</button>
          <button class="btn-primary" id="btnPromAdd">${icon('plus',14)} Tambah</button>
        </div>
      </div>
      <div class="table-toolbar">
        <select id="promPageSize"><option selected>10</option><option>25</option><option>50</option></select>
        <input type="text" id="promSearch" placeholder="Pencarian Global">
      </div>
      <div class="table-wrap"><table>
        <thead><tr>
          <th>Category</th>
          <th>Promotion Code</th>
          <th>Promotion Name</th>
          <th>Kode Lock</th>
          <th>Customer Name</th>
          <th>Start Date</th>
          <th>End Date</th>
          <th>Status</th>
          <th>Ubah</th>
          <th>Hapus</th>
        </tr></thead>
        <tbody id="promTbody"></tbody>
      </table></div>
      <div class="table-footer"><div class="pager"><button>First</button><button>Previous</button><button class="active">1</button><button>Next</button><button>Last</button></div><div id="promTotal"></div></div>
    </div>`;
}

function tplPromRows(rows){
  if(!rows.length) return `<tr><td colspan="10" style="color:var(--text-light);">Tidak ada data Promotion</td></tr>`;
  return rows.map((r,i)=>`
    <tr>
      <td>${r.kategori}</td>
      <td><a href="#" class="prom-code-link" data-code="${i}" style="color:var(--blue);font-weight:600;text-decoration:underline;">${r.kode}</a></td>
      <td>${r.nama}</td>
      <td>${r.kodeLock||''}</td>
      <td>${r.customer||'-'}</td>
      <td>${r.tglAwal||''}</td>
      <td>${r.tglAkhir||''}</td>
      <td><span class="${r.status==='Active'?'st-open':'st-closed'}">${r.status}</span></td>
      <td><button class="icon-btn edit" data-edit="${i}" title="Ubah">${icon('edit',15)}</button></td>
      <td><button class="icon-btn del" data-del="${i}" title="Hapus">${icon('trash',15)}</button></td>
    </tr>`).join('');
}

/* ---------- Komponen umum ke-4 varian form ---------- */
function tplPromCommonHeader(mode, row){
  const isEdit = mode === 'edit';
  return `
    <table class="field-table">
      <tr>
        <td class="flabel">No. Otomatis</td>
        <td><div class="input-with-btn"><select style="max-width:90px;" disabled><option>${row.noOtomatis||'PRO01'}</option></select></div></td>
        <td class="flabel">Promotion Code</td>
        <td>
          <div class="input-with-btn">
            <input type="text" id="fPromKode" value="${row.kode||''}" ${isEdit?'disabled':''}>
            ${!isEdit? `<button type="button" class="icon-btn edit" id="promRefreshKode" title="Generate Nomor">${icon('refreshCw',13)}</button>` : ''}
          </div>
        </td>
      </tr>
      <tr>
        <td class="flabel">Promotion Name</td>
        <td colspan="3"><input type="text" id="fPromNama" value="${row.nama||''}"></td>
      </tr>
      <tr>
        <td class="flabel">Promotion Category</td>
        <td colspan="3">
          <select id="fPromKategori">
            ${DATA.promotionCategoryList.map(c=>`<option value="${c.kode}" ${row.kategori===c.kode?'selected':''}>${c.nama}</option>`).join('')}
          </select>
        </td>
      </tr>
    </table>`;
}

/* Blok field umum yang selalu ada di SEMUA varian: Tgl Awal/Akhir, Status,
   Tipe Customer, Customer, Grup Customer, Description, Outlet, PPN.
   `extraTop` = markup field yang disisipkan SEBELUM blok ini (beda-beda per
   varian, misal Kode Lock+Principal untuk Discount Program). */
function tplPromCommonBlock(row, opts){
  const skipTgl = !!(opts && opts.skipTglAwalAkhir);
  return `
    <table class="field-table">
      ${skipTgl ? '' : `
      <tr>
        <td class="flabel">Tgl. Awal</td>
        <td><div class="input-with-btn"><input type="text" id="fPromTglAwal" value="${row.tglAwal||''}"><span class="icon-btn edit" style="pointer-events:none;">${icon('calendar',13)}</span></div></td>
        <td class="flabel">Tgl. Akhir</td>
        <td><div class="input-with-btn"><input type="text" id="fPromTglAkhir" value="${row.tglAkhir||''}"><span class="icon-btn edit" style="pointer-events:none;">${icon('calendar',13)}</span></div></td>
      </tr>`}
      <tr>
        <td class="flabel">Status</td>
        <td colspan="3">
          <select id="fPromStatus" style="max-width:200px;">
            <option value="Active" ${row.status==='Active'?'selected':''}>Active</option>
            <option value="Non Active" ${row.status==='Non Active'?'selected':''}>Non Active</option>
          </select>
        </td>
      </tr>
      <tr>
        <td class="flabel">Tipe Customer</td>
        <td>
          <div class="input-with-btn">
            <input type="text" id="fPromTipeCustomer" value="${(DATA.tipeCustomerList.find(t=>t.kode===row.tipeCustomer)||{}).nama||''}" data-kode="${row.tipeCustomer||''}" placeholder="Pilih Tipe Customer" readonly>
            <button type="button" class="icon-btn edit" id="promTipeCustomerSearch" title="Cari Tipe Customer">${icon('search',13)}</button>
          </div>
        </td>
        <td class="flabel">Customer</td>
        <td>
          <div class="input-with-btn">
            <input type="text" id="fPromCustomer" value="${row.customer||''}" placeholder="Pilih Customer" readonly>
            <button type="button" class="icon-btn edit" id="promCustomerSearch" title="Cari Customer">${icon('search',13)}</button>
          </div>
        </td>
      </tr>
      <tr>
        <td class="flabel">Grup Customer</td>
        <td colspan="3">
          <div class="input-with-btn" style="max-width:340px;">
            <input type="text" id="fPromGrupCustomer" value="${(DATA.customerGroup.find(g=>g.kode===row.grupCustomer)||{}).nama||''}" data-kode="${row.grupCustomer||''}" placeholder="Pilih Grup Customer" readonly>
            <button type="button" class="icon-btn edit" id="promGrupCustomerSearch" title="Cari Grup Customer">${icon('search',13)}</button>
          </div>
        </td>
      </tr>
      <tr>
        <td class="flabel">Description</td>
        <td colspan="3"><textarea id="fPromDescription" rows="2">${row.description||''}</textarea></td>
      </tr>
      <tr>
        <td class="flabel">Outlet</td>
        <td>
          <div class="input-with-btn">
            <input type="text" id="fPromOutlet" value="${row.outlet||''}" placeholder="Pilih Outlet" readonly>
            <button type="button" class="icon-btn edit" id="promOutletSearch" title="Cari Outlet">${icon('search',13)}</button>
          </div>
        </td>
        <td class="flabel">PPN</td>
        <td>
          <div class="input-with-btn">
            <input type="number" id="fPromPpn" value="${row.ppn!=null?row.ppn:11}">
            <button type="button" class="icon-btn edit" id="promPpnInfo" title="Cari PPN">${icon('search',13)}</button>
          </div>
        </td>
      </tr>
    </table>`;
}

function tplPromFooter(){
  return `
    <div class="form-page-actions">
      <button class="btn-secondary" id="promCancel">Batalkan</button>
      <button class="btn-primary" id="promSave">Simpan</button>
    </div>`;
}

/* ============================================================
   VARIAN 1 — Discount Program (kategori 'A')
   ============================================================ */
function tplPromKetentuanRows(itemIdx, ketentuan){
  if(!ketentuan.length) return `<tr><td colspan="8" style="color:var(--text-light);">Belum ada ketentuan</td></tr>`;
  return ketentuan.map((k,ki)=>`
    <tr>
      <td>${ki+1}</td>
      <td><input type="number" data-prom-k-qtyawal="${itemIdx}:${ki}" value="${k.qtyAwal||0}"></td>
      <td><input type="number" data-prom-k-qtyakhir="${itemIdx}:${ki}" value="${k.qtyAkhir||0}"></td>
      <td><input type="number" data-prom-k-discp="${itemIdx}:${ki}" value="${k.diskonPrincipal||0}"></td>
      <td><input type="number" data-prom-k-discd="${itemIdx}:${ki}" value="${k.diskonDistributor||0}"></td>
      <td><input type="number" data-prom-k-ratio="${itemIdx}:${ki}" value="${k.ratioBarangBonus||0}"></td>
      <td style="min-width:170px;">
        <div class="input-with-btn">
          <input type="text" value="${k.barangBonusNama||''}" placeholder="Barang Bonus" readonly>
          <button type="button" class="icon-btn edit" data-prom-k-bonus-search="${itemIdx}:${ki}" title="Cari Barang Bonus">${icon('search',13)}</button>
        </div>
      </td>
      <td><button type="button" class="icon-btn del" data-prom-k-del="${itemIdx}:${ki}" title="Hapus Ketentuan">${icon('trash',13)}</button></td>
    </tr>`).join('');
}

function tplPromDpItemBlock(item, idx){
  return `
    <div class="table-wrap" style="margin-bottom:4px;"><table class="po-item-table">
      <thead><tr>
        <th style="width:40px;">No.</th>
        <th>Pilih Jenis</th>
        <th>Pilih Group / Kode Barang</th>
        <th>Nama Group/Barang</th>
        <th style="width:34px;"></th>
      </tr></thead>
      <tbody><tr data-prom-item-row="${idx}">
        <td>${idx+1}</td>
        <td>
          <select data-prom-jenis="${idx}">
            <option value="Group" ${item.jenis==='Group'?'selected':''}>Group</option>
            <option value="Barang" ${item.jenis==='Barang'?'selected':''}>Barang</option>
          </select>
        </td>
        <td style="min-width:140px;">
          <div class="input-with-btn">
            <input type="text" data-prom-item-kode="${idx}" value="${item.kode||''}" readonly>
            <button type="button" class="icon-btn edit" data-prom-item-search="${idx}" title="Cari Group/Barang">${icon('search',13)}</button>
          </div>
        </td>
        <td><input type="text" data-prom-item-nama="${idx}" value="${item.nama||''}" readonly></td>
        <td><button type="button" class="icon-btn del" data-prom-item-del="${idx}" title="Hapus Item">${icon('trash',13)}</button></td>
      </tr></tbody>
    </table></div>
    <div class="table-wrap" style="margin:0 0 8px 24px;"><table class="jp-akun-table">
      <thead><tr>
        <th style="width:40px;">No.</th><th>Qty Awal</th><th>Qty Akhir</th><th>Diskon Principal</th><th>Diskon Distributor</th><th>Ratio Barang Bonus</th><th>Barang Bonus</th><th style="width:34px;"></th>
      </tr></thead>
      <tbody data-prom-ketentuan-body="${idx}">${tplPromKetentuanRows(idx, item.ketentuan||[])}</tbody>
    </table></div>
    <a href="#" data-prom-ketentuan-add="${idx}" class="link-add" style="margin:0 0 18px 24px;">${icon('plus',13)} Tambah Ketentuan Baru</a>`;
}

function tplPromDpItemsWrap(items){
  return items.map((it,idx)=>tplPromDpItemBlock(it, idx)).join('');
}

function tplPromDiscountProgram(mode, row){
  const isEdit = mode === 'edit';
  return `
    ${tplPromCommonHeader(mode, row)}
    <table class="field-table">
      <tr>
        <td class="flabel">Kode Lock</td>
        <td><input type="text" id="fPromKodeLock" value="${row.kodeLock||''}"></td>
        <td class="flabel">Principal</td>
        <td>
          <div class="input-with-btn">
            <input type="text" id="fPromPrincipal" value="${row.principalNama||''}" placeholder="Pilih Supplier" readonly>
            <button type="button" class="icon-btn edit" id="promPrincipalSearch" title="Cari Supplier">${icon('search',13)}</button>
          </div>
        </td>
      </tr>
    </table>
    ${tplPromCommonBlock(row)}
    <div class="form-section">${icon('box',15)} Rincian Discount Program</div>
    <div id="promDpItemsWrap">${tplPromDpItemsWrap(row.detail.items)}</div>
    <a href="#" id="promDpAddItem" class="link-add">${icon('plus',13)} Tambah Item Baru</a>
    ${tplPromFooter()}`;
}

/* ============================================================
   VARIAN 2 & 3 — Discount Proposal Form / List (kategori 'DPF'/'DPL')
   Sama persis, bedanya HANYA field Kuota (showKuota:true untuk DPF).
   ============================================================ */
function tplPromDpfItemRow(item, idx){
  return `
    <tr data-prom-dpf-row="${idx}">
      <td style="min-width:120px;">
        <div class="input-with-btn">
          <input type="text" data-prom-dpf-kode="${idx}" value="${item.kode||''}" readonly>
          <button type="button" class="icon-btn edit" data-prom-dpf-search="${idx}" title="Cari Barang">${icon('search',13)}</button>
        </div>
      </td>
      <td style="min-width:160px;"><input type="text" data-prom-dpf-nama="${idx}" value="${item.nama||''}" readonly></td>
      <td style="width:70px;"><input type="number" min="0" data-prom-dpf-qty="${idx}" value="${item.qty||0}"></td>
      <td style="width:90px;"><input type="text" data-prom-dpf-satuan="${idx}" value="${item.satuan||''}"></td>
      <td style="width:90px;"><input type="number" min="0" data-prom-dpf-hna="${idx}" value="${item.hna||0}"></td>
      <td style="width:130px;">
        <div style="display:flex;align-items:center;gap:4px;">
          <input type="number" min="0" data-prom-dpf-hna1="${idx}" value="${item.hna1||0}" style="width:80px;">
          <label style="display:flex;align-items:center;gap:2px;font-weight:400;font-size:10.5px;white-space:nowrap;" title="Inklusif"><input type="checkbox" data-prom-dpf-hna1inc="${idx}" ${item.hna1Inklusif?'checked':''} style="width:auto;">Inc.</label>
        </div>
      </td>
      <td style="width:110px;">
        <div style="display:flex;gap:3px;">
          <input type="number" data-prom-dpf-discp="${idx}" value="${item.discPrincipal||0}" style="width:56px;">
          <select data-prom-dpf-discpunit="${idx}" style="width:auto;">${promDiscUnitOptions(item.discPrincipalUnit||'%')}</select>
        </div>
      </td>
      <td style="width:110px;">
        <div style="display:flex;gap:3px;">
          <input type="number" data-prom-dpf-discd="${idx}" value="${item.discDistributor||0}" style="width:56px;">
          <select data-prom-dpf-discdunit="${idx}" style="width:auto;">${promDiscUnitOptions(item.discDistributorUnit||'%')}</select>
        </div>
      </td>
      <td style="width:110px;">
        <div style="display:flex;gap:3px;">
          <input type="number" data-prom-dpf-supp="${idx}" value="${item.supportDiscount||0}" style="width:56px;">
          <select data-prom-dpf-suppunit="${idx}" style="width:auto;">${promDiscUnitOptions(item.supportDiscountUnit||'%')}</select>
        </div>
      </td>
      <td style="width:34px;"><button type="button" class="icon-btn del" data-prom-dpf-del="${idx}" title="Hapus Baris">${icon('trash',13)}</button></td>
    </tr>`;
}

function tplPromDpfItemsTable(items){
  return `
    <div class="table-wrap"><table class="po-item-table">
      <thead><tr>
        <th>Kode Barang</th><th>Nama Barang</th><th>Qty</th><th>Satuan</th>
        <th class="text-right">HNA</th><th class="text-right">HNA1</th>
        <th class="text-right">Disc. Principal</th><th class="text-right">Disc. Distributor</th><th class="text-right">Support Disc.</th><th></th>
      </tr></thead>
      <tbody id="promDpfItemsBody">${items.map((it,idx)=>tplPromDpfItemRow(it,idx)).join('')}</tbody>
    </table></div>`;
}

function tplPromDiscountProposal(mode, row, opts){
  const showKuota = !!(opts && opts.showKuota);
  return `
    ${tplPromCommonHeader(mode, row)}
    <table class="field-table">
      <tr>
        <td class="flabel">Principal</td>
        <td colspan="3">
          <div class="input-with-btn" style="max-width:340px;">
            <input type="text" id="fPromPrincipal" value="${row.principalNama||''}" placeholder="Pilih Supplier" readonly>
            <button type="button" class="icon-btn edit" id="promPrincipalSearch" title="Cari Supplier">${icon('search',13)}</button>
          </div>
        </td>
      </tr>
      ${showKuota ? `
      <tr>
        <td class="flabel">Kuota</td>
        <td>
          <div style="display:flex;align-items:center;gap:8px;">
            <input type="number" id="fPromKuota" value="${row.kuota||0}" style="max-width:120px;">
            <label style="display:flex;align-items:center;gap:5px;font-weight:400;font-size:12.5px;" title="Kuota Aktif"><input type="checkbox" id="fPromKuotaAktif" ${row.kuotaAktif?'checked':''} style="width:auto;">Kuota Aktif</label>
          </div>
        </td>
        <td class="flabel">Is Guarantee</td>
        <td><input type="checkbox" id="fPromIsGuarantee" ${row.isGuarantee?'checked':''} style="width:auto;"></td>
      </tr>` : ''}
    </table>
    ${tplPromCommonBlock(row)}
    <div class="checkbox-row"><input type="checkbox" id="fPromJanganUpdateHna" ${row.janganUpdateHna?'checked':''}><label for="fPromJanganUpdateHna">Jangan Update HNA apabila ada Update HNA pada Master Inventory.</label></div>

    <div class="form-section">${icon('box',15)} Rincian Barang</div>
    <div id="promDpfItemsWrap">${tplPromDpfItemsTable(row.items)}</div>
    <a href="#" id="promDpfAddItem" class="link-add">${icon('plus',13)} Tambah Item Baru</a>

    <div style="display:flex;justify-content:flex-end;margin-top:14px;">
      <table class="field-table" style="max-width:320px;">
        <tr><td class="flabel">Sub Total</td><td><input type="text" id="fPromSubTotal" value="${num(row.subTotal||0)}" disabled style="text-align:right;font-weight:700;"></td></tr>
      </table>
    </div>
    <p style="font-size:11px;color:var(--red);margin:4px 0 0;">*Apabila hanya menggunakan Discount Principal dan Discount Distributor maka HNA = HNA1.</p>
    <p style="font-size:11px;color:var(--red);margin:2px 0 0;">*Apabila hanya menggunakan HNA1 maka Discount Distributor yang hanya bisa diubah.</p>
    ${tplPromFooter()}`;
}

/* ============================================================
   VARIAN 4 — Discount Category (kategori 'CAT')
   ============================================================ */
function tplPromCatItemRow(item, idx){
  return `
    <tr data-prom-cat-row="${idx}">
      <td style="min-width:170px;">
        <select data-prom-cat-kategori="${idx}">
          ${DATA.kategoriBarang.map(k=>`<option value="${k.kode}" ${item.kategoriKode===k.kode?'selected':''}>${k.nama}</option>`).join('')}
        </select>
      </td>
      <td style="width:80px;"><input type="number" min="0" data-prom-cat-qty="${idx}" value="${item.qty||0}"></td>
      <td style="width:120px;">
        <div style="display:flex;gap:3px;">
          <input type="number" data-prom-cat-discp="${idx}" value="${item.discPrincipal||0}" style="width:60px;">
          <select data-prom-cat-discpunit="${idx}" style="width:auto;">${promDiscUnitOptions(item.discPrincipalUnit||'%')}</select>
        </div>
      </td>
      <td style="width:120px;">
        <div style="display:flex;gap:3px;">
          <input type="number" data-prom-cat-discd="${idx}" value="${item.discDistributor||0}" style="width:60px;">
          <select data-prom-cat-discdunit="${idx}" style="width:auto;">${promDiscUnitOptions(item.discDistributorUnit||'%')}</select>
        </div>
      </td>
      <td style="width:34px;"><button type="button" class="icon-btn del" data-prom-cat-del="${idx}" title="Hapus Baris">${icon('trash',13)}</button></td>
    </tr>`;
}

function tplPromCatItemsTable(items){
  return `
    <div class="table-wrap"><table class="po-item-table">
      <thead><tr><th>Category</th><th>Qty</th><th class="text-right">Disc. Principal</th><th class="text-right">Disc. Distributor</th><th></th></tr></thead>
      <tbody id="promCatItemsBody">${items.map((it,idx)=>tplPromCatItemRow(it,idx)).join('')}</tbody>
    </table></div>`;
}

function jamOptions(sel){
  let out = '';
  for(let h=0; h<24; h++) out += `<option value="${h}" ${(+sel)===h?'selected':''}>${String(h).padStart(2,'0')}</option>`;
  return out;
}
function menitOptions(sel){
  return [0,15,30,45].map(m=>`<option value="${m}" ${(+sel)===m?'selected':''}>${String(m).padStart(2,'0')}</option>`).join('');
}
function dayNumberOptions(sel){
  let out = '';
  for(let d=1; d<=31; d++) out += `<option value="${d}" ${(+sel)===d?'selected':''}>${d}</option>`;
  return out;
}

function tplPromDiscountCategory(mode, row){
  return `
    ${tplPromCommonHeader(mode, row)}
    <table class="field-table">
      <tr>
        <td class="flabel">Tgl. Awal</td>
        <td><div class="input-with-btn"><input type="text" id="fPromTglAwal" value="${row.tglAwal||''}"><span class="icon-btn edit" style="pointer-events:none;">${icon('calendar',13)}</span></div></td>
        <td class="flabel">Tgl. Akhir</td>
        <td><div class="input-with-btn"><input type="text" id="fPromTglAkhir" value="${row.tglAkhir||''}"><span class="icon-btn edit" style="pointer-events:none;">${icon('calendar',13)}</span></div></td>
      </tr>
      <tr>
        <td class="flabel">Day Name</td>
        <td>
          <div class="input-with-btn">
            <input type="text" id="fPromDayName" value="${row.dayName||''}" placeholder="Pilih Day Name" readonly>
            <button type="button" class="icon-btn edit" id="promDayNameSearch" title="Cari Day Name">${icon('search',13)}</button>
          </div>
        </td>
        <td class="flabel">Day</td>
        <td><select id="fPromDay">${dayNumberOptions(row.day||1)}</select></td>
      </tr>
      <tr>
        <td class="flabel">Waktu Buka</td>
        <td>
          <div style="display:flex;gap:6px;align-items:center;">
            <select id="fPromJamBukaJam">${jamOptions(row.jamBukaJam||0)}</select> :
            <select id="fPromJamBukaMenit">${menitOptions(row.jamBukaMenit||0)}</select>
          </div>
        </td>
        <td class="flabel">Waktu Tutup</td>
        <td>
          <div style="display:flex;gap:6px;align-items:center;">
            <select id="fPromJamTutupJam">${jamOptions(row.jamTutupJam||0)}</select> :
            <select id="fPromJamTutupMenit">${menitOptions(row.jamTutupMenit||0)}</select>
          </div>
        </td>
      </tr>
      <tr>
        <td class="flabel">Minimal Transaksi Penjualan (Nominal)</td>
        <td><input type="number" id="fPromMinimalTransaksi" value="${row.minimalTransaksi||0}"></td>
        <td class="flabel">Kuota</td>
        <td><input type="number" id="fPromKuota" value="${row.kuota||0}"></td>
      </tr>
    </table>
    ${tplPromCommonBlock(row, {skipTglAwalAkhir:true})}
    <div class="form-section">${icon('box',15)} Rincian Kategori</div>
    <div id="promCatItemsWrap">${tplPromCatItemsTable(row.items)}</div>
    <a href="#" id="promCatAddItem" class="link-add">${icon('plus',13)} Tambah Item Baru</a>
    ${tplPromFooter()}`;
}

/* ---------- Dispatcher form berdasarkan Promotion Category ---------- */
function tplPromotionFormBody(mode, row){
  if(row.kategori === 'A') return tplPromDiscountProgram(mode, row);
  if(row.kategori === 'DPF') return tplPromDiscountProposal(mode, row, {showKuota:true});
  if(row.kategori === 'DPL') return tplPromDiscountProposal(mode, row, {showKuota:false});
  if(row.kategori === 'CAT') return tplPromDiscountCategory(mode, row);
  if(row.kategori === 'DSB') return tplPromDiskonSyaratBayar(mode, row); /* BARU 2026-08-28 — Diskon Syarat Bayar */
  return tplPromDiscountProgram(mode, row);
}

function tplPromotionForm(mode, row){
  const isEdit = mode === 'edit';
  return `
    <div class="breadcrumb">Home / Promotion / <b>${isEdit ? 'Ubah' : 'Tambah'}</b></div>
    <div class="card">
      <div class="card-header dark-header">
        <h3>${icon(isEdit ? 'edit' : 'plus', 15)} ${isEdit ? 'Ubah' : 'Tambah'} Promotion</h3>
      </div>
      <div class="card-body">
        <h3 style="color:var(--navy);font-size:14px;font-weight:700;padding-bottom:10px;border-bottom:1px solid var(--border);margin-bottom:18px;">Promotion Setting</h3>
        <div id="promFormBody">${tplPromotionFormBody(mode, row)}</div>
      </div>
    </div>`;
}

/* ---------- Pickers generik ---------- */
function tplPromPickerRows(list, dataAttr){
  if(!list.length) return `<tr><td colspan="3" style="color:var(--text-light);">Tidak ada data</td></tr>`;
  return list.map(d=>`<tr><td>${d.kode}</td><td>${d.nama}</td><td><button class="btn-pick" data-pick="${d.kode}" data-pick-nama="${d.nama}">Pilih</button></td></tr>`).join('');
}

function tplPromSimplePicker(title, list){
  return `
    <div class="modal-box">
      <div class="modal-header"><span>${title}</span><span class="close" id="pickerClose">&times;</span></div>
      <div class="modal-body">
        <div class="table-wrap"><table>
          <thead><tr><th>Kode</th><th>Nama</th><th></th></tr></thead>
          <tbody>${tplPromPickerRows(list)}</tbody>
        </table></div>
      </div>
      <div class="modal-footer"><button class="btn-secondary" id="pickerCancel">Tutup</button></div>
    </div>`;
}

function tplPromCustomerPicker(list){
  return `
    <div class="modal-box">
      <div class="modal-header"><span>Pilih Customer</span><span class="close" id="pickerClose">&times;</span></div>
      <div class="modal-body">
        <div class="table-wrap" style="max-height:340px;overflow:auto;"><table>
          <thead><tr><th>Kode</th><th>Nama Customer</th><th>Kota</th><th></th></tr></thead>
          <tbody>${list.map(c=>`<tr><td>${c.kode}</td><td>${c.nama}</td><td>${c.kota}</td><td><button class="btn-pick" data-pick-customer="${c.nama}">Pilih</button></td></tr>`).join('')}</tbody>
        </table></div>
      </div>
      <div class="modal-footer"><button class="btn-secondary" id="pickerCancel">Tutup</button></div>
    </div>`;
}

function tplPromOutletPicker(list){
  return `
    <div class="modal-box">
      <div class="modal-header"><span>Pilih Outlet</span><span class="close" id="pickerClose">&times;</span></div>
      <div class="modal-body">
        <div class="table-wrap"><table>
          <thead><tr><th>Outlet</th><th></th></tr></thead>
          <tbody>${list.map(o=>`<tr><td>${o}</td><td><button class="btn-pick" data-pick-outlet="${o}">Pilih</button></td></tr>`).join('')}</tbody>
        </table></div>
      </div>
      <div class="modal-footer"><button class="btn-secondary" id="pickerCancel">Tutup</button></div>
    </div>`;
}

function tplPromSupplierPicker(list){
  return `
    <div class="modal-box" style="max-width:560px;">
      <div class="modal-header"><span>Pilih Supplier</span><span class="close" id="pickerClose">&times;</span></div>
      <div class="modal-body">
        <div class="table-wrap" style="max-height:340px;overflow:auto;"><table>
          <thead><tr><th>Kode</th><th>Nama Supplier</th><th></th></tr></thead>
          <tbody>${list.map(s=>`<tr><td>${s.kode}</td><td>${s.nama}</td><td><button class="btn-pick" data-pick-supplier="${s.kode}">Pilih</button></td></tr>`).join('')}</tbody>
        </table></div>
      </div>
      <div class="modal-footer"><button class="btn-secondary" id="pickerCancel">Tutup</button></div>
    </div>`;
}

/* Picker "Pilih Group / Kode Barang" — daftarnya berubah tergantung Jenis
   (Group -> kategori barang dari DATA.kategoriBarang, Barang -> live search
   DATA.items). */
function tplPromGroupOrItemPicker(jenis, list){
  const isBarang = jenis === 'Barang';
  return `
    <div class="modal-box" style="max-width:560px;">
      <div class="modal-header"><span>Pilih ${isBarang?'Barang':'Group'}</span><span class="close" id="modalClose">&times;</span></div>
      <div class="modal-body">
        ${isBarang ? `<input type="text" id="promItemPickerSearch" placeholder="Cari kode / nama barang..." style="width:100%;border:1px solid var(--border);border-radius:6px;padding:8px 10px;font-size:12.8px;margin-bottom:12px;">` : ''}
        <div class="table-wrap" style="max-height:340px;overflow:auto;"><table>
          <thead><tr><th>Kode</th><th>Nama</th><th></th></tr></thead>
          <tbody id="promGroupOrItemBody">${tplPromGroupOrItemRows(jenis, list)}</tbody>
        </table></div>
      </div>
      <div class="modal-footer"><button class="btn-secondary" id="modalCancel">Tutup</button></div>
    </div>`;
}
function tplPromGroupOrItemRows(jenis, list){
  if(!list.length) return `<tr><td colspan="3" style="color:var(--text-light);">Tidak ada data</td></tr>`;
  return list.map(d=>`<tr><td>${d.kode}</td><td>${d.nama}</td><td><button class="btn-pick" data-pick-goi="${d.kode}" data-pick-goi-nama="${d.nama}">Pilih</button></td></tr>`).join('');
}

function tplPromDeleteConfirm(row){
  return `
    <div class="modal-box">
      <div class="modal-header"><span>Hapus Promotion</span><span class="close" id="modalClose">&times;</span></div>
      <div class="modal-body"><p>Yakin ingin menghapus promotion <b>${row.kode}</b> — ${row.nama}?</p></div>
      <div class="modal-footer">
        <button class="btn-secondary" id="modalCancel">Batal</button>
        <button class="btn-danger" id="modalDelete">Hapus</button>
      </div>
    </div>`;
}

function tplPromInfoModal(title,text){
  return `
    <div class="modal-box">
      <div class="modal-header"><span>${title}</span><span class="close" id="modalClose">&times;</span></div>
      <div class="modal-body"><p>${text}</p></div>
      <div class="modal-footer">
        <button class="btn-primary" id="modalOk">Mengerti</button>
      </div>
    </div>`;
}

/* ============================================================
   VARIAN 5 (BARU 2026-08-28) — Diskon Syarat Bayar (kategori 'DSB')
   Lihat catatan desain lengkap di atas wireDiskonSyaratBayar()
   (promotion.js). Tanpa tabel item sama sekali — hanya checkbox
   multi-pilih syarat bayar + 2 baris Diskon Global (nilai + unit
   %/Rp, pola select unit sama dgn promDiscUnitOptions varian lain)
   + catatan cara kerjanya di transaksi SO.
   ============================================================ */
function tplPromDsbBlock(row){
  const sbList = row.syaratBayarDiskon || [];
  return `
    <div class="form-section">${icon('percent',15)} Syarat Bayar &amp; Diskon Global</div>
    <table class="field-table">
      <tr>
        <td class="flabel" style="vertical-align:top;">Syarat Bayar<br><span style="font-weight:400;font-size:11px;color:var(--text-light);">(bisa pilih beberapa)</span></td>
        <td colspan="3">
          <div style="display:flex;gap:18px;flex-wrap:wrap;padding:4px 0;">
            ${DATA.syaratBayarList.map(sb => `
              <label style="display:flex;align-items:center;gap:6px;font-size:12.6px;font-weight:400;cursor:pointer;">
                <input type="checkbox" data-prom-dsb-sb="${sb}" ${sbList.indexOf(sb)!==-1?'checked':''} style="width:auto;"> ${sb}
              </label>`).join('')}
          </div>
          <div style="font-size:11.5px;color:var(--text-light);margin-top:2px;">Terpilih: <b id="promDsbTerpilih">${sbList.length ? sbList.join(', ') : 'Belum ada syarat bayar dipilih'}</b></div>
        </td>
      </tr>
      <tr>
        <td class="flabel">Diskon Global 1</td>
        <td>
          <div style="display:flex;gap:6px;">
            <input type="number" min="0" id="fPromDsbDg1" value="${row.diskonGlobal1||0}" style="max-width:120px;">
            <select id="fPromDsbDg1Unit" style="width:auto;">
              <option value="%" ${row.diskonGlobal1Unit!=='Rp'?'selected':''}>%</option>
              <option value="Rp" ${row.diskonGlobal1Unit==='Rp'?'selected':''}>Rp</option>
            </select>
          </div>
        </td>
        <td class="flabel">Diskon Global 2</td>
        <td>
          <div style="display:flex;gap:6px;">
            <input type="number" min="0" id="fPromDsbDg2" value="${row.diskonGlobal2||0}" style="max-width:120px;">
            <select id="fPromDsbDg2Unit" style="width:auto;">
              <option value="%" ${row.diskonGlobal2Unit!=='Rp'?'selected':''}>%</option>
              <option value="Rp" ${row.diskonGlobal2Unit==='Rp'?'selected':''}>Rp</option>
            </select>
          </div>
        </td>
      </tr>
    </table>
    <div style="font-size:11.8px;color:var(--text-light);line-height:1.7;margin-top:6px;">
      Diskon promo ini berupa <b>Diskon Global 1 &amp; Diskon Global 2</b> saja (perhitungan bertingkat: Diskon Global 2 dihitung dari sisa setelah Diskon Global 1) — <b>tidak ada pemilihan item barang</b>.
      Berlaku otomatis pada transaksi <b>Sales Order</b> yang Syarat Bayar-nya termasuk daftar terpilih di atas, selama status promo Active.
    </div>`;
}

function tplPromDiskonSyaratBayar(mode, row){
  return `
    ${tplPromCommonHeader(mode, row)}
    ${tplPromCommonBlock(row)}
    ${tplPromDsbBlock(row)}
    ${tplPromFooter()}`;
}
