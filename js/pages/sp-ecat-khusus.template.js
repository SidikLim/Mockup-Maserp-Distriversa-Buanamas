/* =========================================================
   TEMPLATE (HTML saja) — Surat Pesanan Ekatalog & Khusus
   (Customer & Penjualan > Daftar Transaksi > Surat Pesanan
   Ekatalog & Khusus, key page:'spEcatKhusus'). Semua fungsi di
   file ini HANYA menyusun & mengembalikan markup HTML (string)
   atau helper murni, TIDAK ada DOM-binding/data mutation.
   Logic-nya ada di file sebelah: sp-ecat-khusus.js
   NB: closeModal() dipakai bersama, didefinisikan di core.js.

   Sesuai 2 screenshot MASERP instalasi AAA (PT Adya Artha
   Abadi) yang dikirim user 2026-09-01 — data dipetakan ke
   master DBM sendiri sesuai konvensi (customer CUST-xxx,
   barang BRG-xxx, principal = DATA.suppliers, rayon/area/
   sales office DBM):
   1) List "SP ECAT & KHUSUS": chip periode "September 2026" +
      Tambah; kolom No. Ecat / Khusus (link biru -> Ubah, sort) /
      Tanggal (dd/mm/yy, sort) / Customer ("{kode} - {NAMA}",
      sort) / Nilai (kanan, sort) / Status (Open|Closed) /
      Closed Manually (toggle) / Request PDR (toggle) / Ubah /
      Hapus. Toggle Closed Manually FUNGSIONAL (status ikut
      berubah), Request PDR toggle tersimpan di baris. Screenshot
      AAA 2 halaman — mockup DBM diberi 12 sample September 2026
      (10+2, pager 1-2 windowed fungsional).
   2) Form "SP ECAT & KHUSUS" (satu halaman penuh + tombol
      "Activity Log" di header): SO / Area (2 dropdown:
      DATA.salesOffice + DATA.area); Customer (picker — mengisi
      kode, Alamat, Rayon 3 baris (kode rayon/kota/salesman),
      panel Piutang BJT/JT + CL/Sisa CL + DL/Sisa DL dari master
      Customer & Dominasi); Principal (picker DATA.suppliers);
      No.ID "EP-..." readonly auto-generate; Tgl Paket;
      No.Kontrak / Posisi Paket / checkbox Upload PO + tombol
      Upload File (mockup: modal info) ; No DSC / No DOM (picker
      "Pilih Diskon Proposal Form" — DSC list lokal, DOM dari
      DATA.dominasi); Sumber Dana / Metode Bayar. Strip
      rekap: Harga Satuan x Qty / Potongan / DPP / PPN (11%) /
      Biaya Kirim / Jumlah Tagihan — recalc live. Tabel item:
      No / Produk (Kode picker DATA.items + Nama + UOM) / Qty
      (editable) / Bo Order / Harga Satuan (editable) / Total
      Harga / Hapus + link "+Tambah Item Baru".
   Footer form: Simpan / Batalkan. Nilai di list = DPP
   (Harga Satuan x Qty - Potongan). No.ID format
   "EP-01M1{20 karakter A-Z/0-9}" meniru pola screenshot. */

const SPE_DSC_LIST = [
  {no:'DSC/HO/09/00001', keterangan:'Diskon Proposal Ekatalog Q3'},
  {no:'DSC/SBY/09/00002', keterangan:'Diskon Proposal Khusus Instansi'},
];

function speNum2(n){ return Number(n||0).toLocaleString('id-ID', {minimumFractionDigits:2, maximumFractionDigits:2}); }
function speNum0(n){ return Number(n||0).toLocaleString('id-ID'); }
function speTgl2(t){ return (t||'').replace('/2026','/26'); }

/* Rekap angka dari row — dipakai list (Nilai) & strip form. */
function speTotals(r){
  const hsxq = (r.items||[]).reduce((a,it)=> a + Number(it.qty||0)*Number(it.harga||0), 0);
  const potongan = Number(r.potongan||0);
  const dpp = hsxq - potongan;
  const ppn = dpp * 0.11;
  const kirim = Number(r.biayaKirim||0);
  return { hsxq, potongan, dpp, ppn, kirim, tagihan: dpp + ppn + kirim };
}

/* =====================================================================
   LIST PAGE — "SP ECAT & KHUSUS"
===================================================================== */
function tplSpeListPage(bulan){
  return `
    <div class="breadcrumb">Home / Customer &amp; Penjualan / <b>Surat Pesanan Ekatalog &amp; Khusus</b></div>
    <div class="card">
      <div class="card-header dark-header">
        <h3>${icon('alertTriangle',15)} SP ECAT &amp; KHUSUS</h3>
        <div class="toolbar-actions">
          <select class="chip-btn" id="speFilterBulan"><option value="09" ${bulan==='09'?'selected':''}>September 2026</option><option value="08" ${bulan==='08'?'selected':''}>Agustus 2026</option></select>
          <button class="btn-primary" id="btnSpeAdd">${icon('plus',14)} Tambah</button>
        </div>
      </div>
      <div class="table-toolbar">
        <select id="spePageSize"><option selected>10</option><option>25</option><option>50</option></select>
        <input type="text" id="speSearch" placeholder="Pencarian Global">
      </div>
      <div class="table-wrap"><table>
        <thead><tr>
          <th>${tplSpeSortHeader('No. Ecat / Khusus','noId')}</th>
          <th style="width:100px;">${tplSpeSortHeader('Tanggal','tgl')}</th>
          <th>${tplSpeSortHeader('Customer','customerNama')}</th>
          <th class="text-right" style="width:130px;">${tplSpeSortHeader('Nilai','nilai')}</th>
          <th style="width:70px;">Status</th>
          <th style="width:120px;">Closed Manually</th>
          <th style="width:105px;">Request PDR</th>
          <th style="width:60px;">Ubah</th>
          <th style="width:60px;">Hapus</th>
        </tr></thead>
        <tbody id="speTbody"></tbody>
      </table></div>
      <div class="table-footer"><div class="pager" id="spePager"></div><div id="speTotal"></div></div>
    </div>`;
}

function tplSpeSortHeader(label, field){
  return `<span data-spe-sort="${field}" style="cursor:pointer;display:inline-flex;align-items:center;gap:4px;">${label}<span id="speSortIcon_${field}" style="color:var(--text-light);font-size:11px;">&#8693;</span></span>`;
}

function tplSpeRows(rows, page, pageSize){
  if(!rows.length) return `<tr><td colspan="9" style="color:var(--text-light);padding:14px;text-align:center;font-weight:600;">Tidak Ada Data</td></tr>`;
  const start = (page-1)*pageSize;
  return rows.slice(start, start+pageSize).map((r) => {
    const idx = DATA.spEcatKhusus.indexOf(r);
    const t = speTotals(r);
    return `
    <tr>
      <td><a href="javascript:void(0)" data-spe-edit="${idx}" style="color:var(--blue);font-weight:600;text-decoration:none;">${r.noId}</a></td>
      <td>${speTgl2(r.tgl)}</td>
      <td>${r.customerKode} - ${(r.customerNama||'').toUpperCase()}</td>
      <td class="text-right">${speNum2(t.dpp)}</td>
      <td>${r.closedManually ? 'Closed' : 'Open'}</td>
      <td><label class="toggle-switch"><input type="checkbox" data-spe-closed="${idx}" ${r.closedManually?'checked':''}><span class="toggle-slider"></span></label></td>
      <td><label class="toggle-switch"><input type="checkbox" data-spe-pdr="${idx}" ${r.requestPdr?'checked':''}><span class="toggle-slider"></span></label></td>
      <td><button class="icon-btn edit" data-spe-edit="${idx}" title="Ubah">${icon('edit',15)}</button></td>
      <td><button class="icon-btn del" data-spe-del="${idx}" title="Hapus">${icon('trash',15)}</button></td>
    </tr>`;
  }).join('');
}

function tplSpePager(page, totalPages){
  if(totalPages <= 1) return '';
  const windowSize = 7;
  let start = Math.max(1, page - Math.floor(windowSize/2));
  let end = Math.min(totalPages, start + windowSize - 1);
  start = Math.max(1, end - windowSize + 1);
  let nums = '';
  for(let p = start; p <= end; p++){
    nums += `<button class="${p===page?'active':''}" data-spepage="${p}">${p}</button>`;
  }
  return `
    <button data-spepage="1" ${page<=1?'disabled':''}>First</button>
    <button data-spepage="${Math.max(1,page-1)}" ${page<=1?'disabled':''}>Previous</button>
    ${nums}
    <button data-spepage="${Math.min(totalPages,page+1)}" ${page>=totalPages?'disabled':''}>Next</button>
    <button data-spepage="${totalPages}" ${page>=totalPages?'disabled':''}>Last</button>`;
}

/* =====================================================================
   FORM (full page)
===================================================================== */
function tplSpeForm(mode, row){
  const isAdd = mode === 'add';
  return `
    <div class="breadcrumb">Home / Surat Pesanan Ekatalog &amp; Khusus / <b>${isAdd?'Tambah':'Ubah'}</b></div>
    <div class="card">
      <div class="card-header dark-header">
        <h3>${icon('alertTriangle',15)} SP ECAT &amp; KHUSUS</h3>
        <button class="btn-primary" id="btnSpeActivityLog">${icon('search',13)} Activity Log</button>
      </div>
      <div class="card-body">
        <div style="display:grid;grid-template-columns:1.1fr 1.1fr 1fr;gap:14px 26px;align-items:start;">
          <div>
            <table class="field-table po-rincian-table">
              <tr><td class="flabel" style="width:92px;">SO / Area</td><td>
                <div style="display:flex;gap:8px;">
                  <select id="fSpeSO" style="flex:1;">${DATA.salesOffice.map(s=>`<option ${row.soNama===s.nama?'selected':''}>${s.nama}</option>`).join('')}</select>
                  <select id="fSpeArea" style="flex:1;">${DATA.area.map(a=>`<option ${row.areaNama===a.nama?'selected':''}>${a.nama}</option>`).join('')}</select>
                </div>
              </td></tr>
              <tr><td class="flabel">Customer</td><td>
                <div class="input-with-btn">
                  <input type="text" id="fSpeCustomer" value="${(row.customerNama||'').toUpperCase()}" placeholder="Pilih Customer" readonly>
                  <button type="button" class="icon-btn edit" id="speCustomerSearch" title="Cari Customer">${icon('search',13)}</button>
                </div>
                <input type="text" id="fSpeCustomerKode" value="${row.customerKode||''}" readonly style="margin-top:6px;background:#f2f3f6;color:var(--text-light);">
              </td></tr>
              <tr><td class="flabel">Principal</td><td>
                <div class="input-with-btn">
                  <input type="text" id="fSpePrincipal" value="${row.principalNama||''}" placeholder="Pilih Principal" readonly>
                  <button type="button" class="icon-btn edit" id="spePrincipalSearch" title="Cari Principal">${icon('search',13)}</button>
                </div>
              </td></tr>
              <tr><td class="flabel">No.ID</td><td><input type="text" id="fSpeNoId" value="${row.noId||''}" readonly style="background:#f2f3f6;color:var(--text-light);"></td></tr>
              <tr><td class="flabel">Tgl Paket</td><td>
                <div class="input-with-btn">
                  <input type="text" id="fSpeTgl" value="${row.tgl||''}">
                  <span class="icon-btn edit" style="pointer-events:none;">${icon('calendar',13)}</span>
                </div>
              </td></tr>
            </table>
          </div>
          <div>
            <table class="field-table po-rincian-table">
              <tr><td class="flabel" style="width:92px;">Alamat</td><td><textarea id="fSpeAlamat" class="po-textarea" rows="3" readonly style="background:#f2f3f6;">${row.alamat||''}</textarea></td></tr>
              <tr><td class="flabel">No.Kontrak</td><td><input type="text" id="fSpeNoKontrak" value="${row.noKontrak||''}" placeholder="No.Kontrak"></td></tr>
              <tr><td class="flabel">Posisi Paket</td><td><input type="text" id="fSpePosisiPaket" value="${row.posisiPaket||''}" placeholder="Posisi Paket"></td></tr>
              <tr><td class="flabel">Upload PO</td><td>
                <label style="display:flex;align-items:center;gap:6px;font-size:12px;"><input type="checkbox" id="fSpeUploadPo" ${row.uploadPo?'checked':''} style="width:auto;"></label>
                <button type="button" class="btn-secondary" id="speUploadFile" style="margin-top:6px;">Upload File</button>
                <div id="speFileBox" style="border:1px solid var(--border);border-radius:6px;min-height:44px;margin-top:6px;padding:6px 8px;font-size:11.8px;color:var(--text-light);overflow:auto;">${(row.files&&row.files.length)?row.files.map(f=>`<div>${f}</div>`).join(''):''}</div>
              </td></tr>
            </table>
          </div>
          <div>
            <table class="field-table po-rincian-table">
              <tr><td class="flabel" style="width:78px;">Rayon</td><td>
                <input type="text" id="fSpeRayonKode" value="${row.rayonKode||''}" readonly style="background:#f2f3f6;">
                <input type="text" id="fSpeRayonKota" value="${row.rayonKota||''}" readonly style="background:#f2f3f6;margin-top:6px;">
                <input type="text" id="fSpeRayonSales" value="${row.rayonSalesman||''}" readonly style="background:#f2f3f6;margin-top:6px;">
              </td></tr>
              <tr><td class="flabel">No DSC</td><td>
                <div class="input-with-btn">
                  <input type="text" id="fSpeNoDsc" value="${row.noDsc||''}" placeholder="Pilih Diskon Proposal Form" readonly>
                  <button type="button" class="icon-btn edit" id="speDscSearch" title="Cari DSC">${icon('search',13)}</button>
                </div>
              </td></tr>
              <tr><td class="flabel">No DOM</td><td>
                <div class="input-with-btn">
                  <input type="text" id="fSpeNoDom" value="${row.noDom||''}" placeholder="Pilih Diskon Proposal Form" readonly>
                  <button type="button" class="icon-btn edit" id="speDomSearch" title="Cari Dominasi">${icon('search',13)}</button>
                </div>
              </td></tr>
            </table>
          </div>
        </div>

        <div style="display:grid;grid-template-columns:1.1fr 1.1fr 1fr;gap:14px 26px;align-items:start;margin-top:14px;">
          <div>
            <table class="field-table po-rincian-table">
              <tr><td class="flabel" style="width:92px;">Piutang</td><td>
                <div style="display:flex;gap:8px;">
                  <div style="flex:1;"><input type="text" id="fSpeBjt" value="${speNum0(row.piutangBjt||0)}" disabled style="text-align:right;"><div style="font-size:10.5px;color:var(--text-light);margin-top:2px;">BJT</div></div>
                  <div style="flex:1;"><input type="text" id="fSpeJt" value="${speNum0(row.piutangJt||0)}" disabled style="text-align:right;"><div style="font-size:10.5px;color:var(--text-light);margin-top:2px;">JT</div></div>
                </div>
              </td></tr>
              <tr><td class="flabel">Sumber Dana</td><td><input type="text" id="fSpeSumberDana" value="${row.sumberDana||''}" placeholder="Sumber Dana"></td></tr>
            </table>
          </div>
          <div>
            <table class="field-table po-rincian-table">
              <tr><td class="flabel" style="width:92px;">CL</td><td>
                <div style="display:flex;gap:8px;">
                  <div style="flex:1;"><input type="text" id="fSpeCl" value="${speNum0(row.cl||0)}" disabled style="text-align:right;"><div style="font-size:10.5px;color:var(--text-light);margin-top:2px;">CL</div></div>
                  <div style="flex:1;"><input type="text" id="fSpeSisaCl" value="${speNum0(row.sisaCl||0)}" disabled style="text-align:right;"><div style="font-size:10.5px;color:var(--text-light);margin-top:2px;">Sisa CL</div></div>
                </div>
              </td></tr>
              <tr><td class="flabel">Metode Bayar</td><td><input type="text" id="fSpeMetodeBayar" value="${row.metodeBayar||''}" placeholder="Metode Bayar"></td></tr>
            </table>
          </div>
          <div>
            <table class="field-table po-rincian-table">
              <tr><td class="flabel" style="width:78px;">DL</td><td>
                <div style="display:flex;gap:8px;">
                  <div style="flex:1;"><input type="text" id="fSpeDl" value="${speNum0(row.dl||0)}" disabled style="text-align:right;"><div style="font-size:10.5px;color:var(--text-light);margin-top:2px;">DL</div></div>
                  <div style="flex:1;"><input type="text" id="fSpeSisaDl" value="${speNum0(row.sisaDl||0)}" disabled style="text-align:right;"><div style="font-size:10.5px;color:var(--text-light);margin-top:2px;">Sisa DL</div></div>
                </div>
              </td></tr>
            </table>
          </div>
        </div>

        <div class="table-wrap" style="margin-top:20px;">
          <table class="po-item-table">
            <thead><tr>
              <th class="text-right">Harga Satuan x Qty</th>
              <th class="text-right">Potongan</th>
              <th class="text-right">DPP</th>
              <th class="text-right">PPN</th>
              <th class="text-right">Biaya Kirim</th>
              <th class="text-right">Jumlah Tagihan</th>
            </tr></thead>
            <tbody><tr>
              <td class="text-right" id="speHsxq">0,00</td>
              <td class="text-right" id="spePotongan">0,00</td>
              <td class="text-right" id="speDpp">0,00</td>
              <td class="text-right" id="spePpn">0,00</td>
              <td class="text-right" id="speKirim">-</td>
              <td class="text-right" id="speTagihan" style="font-weight:700;">0,00</td>
            </tr></tbody>
          </table>
        </div>

        <div class="table-wrap" style="margin-top:14px;">
          <table class="po-item-table">
            <thead>
              <tr><th rowspan="2" style="width:36px;">No</th><th colspan="3" style="text-align:center;">Produk</th><th rowspan="2" class="text-right" style="width:120px;">Qty</th><th rowspan="2" class="text-right" style="width:80px;">Bo Order</th><th rowspan="2" class="text-right" style="width:130px;">Harga Satuan</th><th rowspan="2" class="text-right" style="width:130px;">Total Harga</th><th rowspan="2" style="width:56px;">Hapus</th></tr>
              <tr><th style="width:170px;">Kode</th><th>Nama</th><th style="width:80px;">UOM</th></tr>
            </thead>
            <tbody id="speItemsBody">${tplSpeItemRows(row.items)}</tbody>
          </table>
        </div>
        <a href="#" class="link-add" id="speAddItem">${icon('plus',12)}Tambah Item Baru</a>
      </div>
      <div class="card-footer" style="display:flex;gap:10px;justify-content:flex-end;align-items:center;padding:14px 20px;border-top:1px solid var(--border);">
        <button type="button" class="btn-primary" id="speSimpan">Simpan</button>
        <a href="#" id="speBatalkan" class="link-add" style="margin-top:0;">Batalkan</a>
      </div>
    </div>`;
}

function tplSpeItemRows(items){
  if(!items || !items.length) return `<tr><td colspan="9" style="color:var(--text-light);">Belum ada produk — klik "Tambah Item Baru".</td></tr>`;
  return items.map((it,idx)=>`
    <tr>
      <td style="text-align:center;">${idx+1}</td>
      <td>
        <div class="input-with-btn">
          <input type="text" data-spe-item-kode="${idx}" value="${it.kode||''}" readonly>
          <button type="button" class="icon-btn edit" data-spe-item-pick="${idx}" title="Cari Produk">${icon('search',12)}</button>
        </div>
      </td>
      <td><span data-spe-item-nama="${idx}">${it.nama||''}</span></td>
      <td><span data-spe-item-uom="${idx}">${it.uom||''}</span></td>
      <td><input type="number" min="0" data-spe-item-qty="${idx}" value="${it.qty||0}" style="text-align:right;"></td>
      <td class="text-right"><span data-spe-item-bo="${idx}">${speNum0(it.qty||0)}</span></td>
      <td><input type="number" step="0.01" min="0" data-spe-item-harga="${idx}" value="${it.harga||0}" style="text-align:right;"></td>
      <td class="text-right"><span data-spe-item-total="${idx}">${speNum2((it.qty||0)*(it.harga||0))}</span></td>
      <td style="text-align:center;"><button type="button" class="icon-btn del" data-spe-item-del="${idx}" title="Hapus Baris">${icon('trash',14)}</button></td>
    </tr>`).join('');
}

/* Picker Customer / Principal / Produk / DSC / DOM — salinan lokal. */
function tplSpeCustomerPicker(list){
  return `
    <div class="modal-box" style="max-width:640px;">
      <div class="modal-header"><span>Pilih Customer</span><span class="close" id="modalClose">&times;</span></div>
      <div class="modal-body">
        <input type="text" id="speCustomerPickerSearch" placeholder="Cari kode / nama customer..." style="width:100%;border:1px solid var(--border);border-radius:6px;padding:8px 10px;font-size:12.8px;margin-bottom:12px;">
        <div class="table-wrap" style="max-height:360px;overflow:auto;">
          <table>
            <thead><tr><th>Kode</th><th>Nama Customer</th><th>Kota</th><th></th></tr></thead>
            <tbody id="speCustomerPickerBody">${tplSpeCustomerPickerRows(list)}</tbody>
          </table>
        </div>
      </div>
      <div class="modal-footer"><button class="btn-secondary" id="modalCancel">Tutup</button></div>
    </div>`;
}

function tplSpeCustomerPickerRows(list){
  if(!list.length) return `<tr><td colspan="4" style="color:var(--text-light);">Tidak ada customer ditemukan</td></tr>`;
  return list.map(c=>`
    <tr><td>${c.kode}</td><td>${c.nama}</td><td>${c.kota||''}</td><td><button class="btn-pick" data-pick-customer="${c.kode}">Pilih</button></td></tr>`).join('');
}

function tplSpePrincipalPicker(list){
  return `
    <div class="modal-box" style="max-width:640px;">
      <div class="modal-header"><span>Pilih Principal</span><span class="close" id="modalClose">&times;</span></div>
      <div class="modal-body">
        <input type="text" id="spePrincipalPickerSearch" placeholder="Cari kode / nama principal..." style="width:100%;border:1px solid var(--border);border-radius:6px;padding:8px 10px;font-size:12.8px;margin-bottom:12px;">
        <div class="table-wrap" style="max-height:360px;overflow:auto;">
          <table>
            <thead><tr><th>Kode</th><th>Nama Principal</th><th></th></tr></thead>
            <tbody id="spePrincipalPickerBody">${tplSpePrincipalPickerRows(list)}</tbody>
          </table>
        </div>
      </div>
      <div class="modal-footer"><button class="btn-secondary" id="modalCancel">Tutup</button></div>
    </div>`;
}

function tplSpePrincipalPickerRows(list){
  if(!list.length) return `<tr><td colspan="3" style="color:var(--text-light);">Tidak ada principal ditemukan</td></tr>`;
  return list.map(s=>`
    <tr><td>${s.kode}</td><td>${s.nama}</td><td><button class="btn-pick" data-pick-principal="${s.kode}">Pilih</button></td></tr>`).join('');
}

function tplSpeProdukPicker(list){
  return `
    <div class="modal-box" style="max-width:700px;">
      <div class="modal-header"><span>Pilih Produk</span><span class="close" id="modalClose">&times;</span></div>
      <div class="modal-body">
        <input type="text" id="speProdukPickerSearch" placeholder="Cari kode / nama produk..." style="width:100%;border:1px solid var(--border);border-radius:6px;padding:8px 10px;font-size:12.8px;margin-bottom:12px;">
        <div class="table-wrap" style="max-height:340px;overflow:auto;">
          <table>
            <thead><tr><th>Kode</th><th>Nama Produk</th><th>UOM</th><th class="text-right">Harga</th><th></th></tr></thead>
            <tbody id="speProdukPickerBody">${tplSpeProdukPickerRows(list)}</tbody>
          </table>
        </div>
      </div>
      <div class="modal-footer"><button class="btn-secondary" id="modalCancel">Tutup</button></div>
    </div>`;
}

function tplSpeProdukPickerRows(list){
  if(!list.length) return `<tr><td colspan="5" style="color:var(--text-light);">Tidak ada produk ditemukan</td></tr>`;
  return list.map(p=>`
    <tr><td>${p.kode}</td><td>${p.nama}</td><td>${p.satuan||''}</td><td class="text-right">${speNum0(p.harga||0)}</td><td><button class="btn-pick" data-pick-produk="${p.kode}">Pilih</button></td></tr>`).join('');
}

function tplSpeDscPicker(list){
  return `
    <div class="modal-box" style="max-width:520px;">
      <div class="modal-header"><span>Pilih Diskon Proposal Form (DSC)</span><span class="close" id="modalClose">&times;</span></div>
      <div class="modal-body">
        <div class="table-wrap"><table>
          <thead><tr><th>No DSC</th><th>Keterangan</th><th></th></tr></thead>
          <tbody>${list.map(d=>`<tr><td>${d.no}</td><td>${d.keterangan}</td><td><button class="btn-pick" data-pick-dsc="${d.no}">Pilih</button></td></tr>`).join('')}</tbody>
        </table></div>
      </div>
      <div class="modal-footer"><button class="btn-secondary" id="modalCancel">Tutup</button></div>
    </div>`;
}

function tplSpeDomPicker(list){
  return `
    <div class="modal-box" style="max-width:640px;">
      <div class="modal-header"><span>Pilih Dominasi (DOM)</span><span class="close" id="modalClose">&times;</span></div>
      <div class="modal-body">
        <div class="table-wrap" style="max-height:340px;overflow:auto;"><table>
          <thead><tr><th>No</th><th>Customer</th><th>Principal</th><th class="text-right">Nominal Max</th><th></th></tr></thead>
          <tbody>${list.map(d=>`<tr><td>${d.no}</td><td>${d.customerNama||''}</td><td>${d.principalNama||''}</td><td class="text-right">${speNum0(d.nominalMax||0)}</td><td><button class="btn-pick" data-pick-dom="${d.no}">Pilih</button></td></tr>`).join('')}</tbody>
        </table></div>
      </div>
      <div class="modal-footer"><button class="btn-secondary" id="modalCancel">Tutup</button></div>
    </div>`;
}

function tplSpeDeleteConfirm(row){
  return `
    <div class="modal-box">
      <div class="modal-header"><span>Hapus SP Ecat &amp; Khusus</span><span class="close" id="modalClose">&times;</span></div>
      <div class="modal-body"><p>Yakin ingin menghapus SP <b>${row.noId}</b> — ${row.customerKode} - ${(row.customerNama||'').toUpperCase()} (${speNum2(speTotals(row).dpp)})?</p></div>
      <div class="modal-footer">
        <button class="btn-secondary" id="modalCancel">Batal</button>
        <button class="btn-danger" id="modalDelete">Hapus</button>
      </div>
    </div>`;
}

function tplSpeInfoModal(title,text){
  return `
    <div class="modal-box">
      <div class="modal-header"><span>${title}</span><span class="close" id="modalClose">&times;</span></div>
      <div class="modal-body"><p>${text}</p></div>
      <div class="modal-footer"><button class="btn-primary" id="modalOk">Mengerti</button></div>
    </div>`;
}
