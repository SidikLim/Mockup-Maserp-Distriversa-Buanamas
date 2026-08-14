/* =========================================================
   TEMPLATE (HTML saja) — Pembelian Melalui BPB (Supplier &
   Pembelian > Daftar Transaksi > Pembelian Melalui BPB). Semua
   fungsi di file ini HANYA menyusun & mengembalikan markup HTML
   (string), TIDAK ada logic/DOM-binding di sini. Logic-nya ada di
   file sebelah: pembelian-bpb.js

   Sesuai 2 screenshot MASERP yang dikirim user: "Daftar Pembelian
   Melalui BPB" (list — kolom No. Faktur/No. BPB/No. PO/Tgl.
   Faktur/Supplier/Keterangan/Nilai Faktur/Pembayaran, lalu aksi
   Lihat/Ubah/Hapus, TANPA Attach/Cetak — beda dari Terima Barang)
   dan "Pembelian Melalui BPB" (form — header dark-header + tombol
   merah "Tutorial", field Dari Purchase Order/BPB yang akan
   ditagihkan/No. Retur PB/No. Otomatis+No. Faktur/Tgl. Faktur/
   Syarat Bayar/Tgl. Jth. Tempo/Supplier No. Faktur/Jurnal/Alamat
   Pengiriman, tabel rincian barang PERSIS sama kolomnya dengan
   Purchase Order tapi ditambah checkbox Ppn per baris, lalu panel
   "Informasi PPN" + "Rincian Transaksi" + "Uang Muka").

   KONTEKS RANTAI TRANSAKSI: modul ini TAHAP KE-3 dari rantai
   Supplier & Pembelian (Purchase Order → Terima Barang →
   **Pembelian Melalui BPB** → Pelunasan Utang) — mengubah 1 baris
   Bukti Terima Barang (`DATA.terimaBarang`) yang SUDAH diterima
   jadi Faktur Pembelian yang menagih ke Supplier. Field header
   "Dari Purchase Order" adalah PICKER UTAMA tapi datanya diambil
   dari `DATA.terimaBarang` (bukan langsung `DATA.purchaseOrder`)
   karena secara bisnis hanya barang yang SUDAH diterima (punya BPB)
   yang boleh ditagih — begitu 1 BPB dipilih, field "BPB yang akan
   ditagihkan" otomatis ikut terisi (1 BPB = 1 PO di mockup ini,
   jadi cukup 1 picker). BPB yang SUDAH pernah dipakai bikin Faktur
   sebelumnya (match `DATA.pembelianBPB[].noBPB`) DIKELUARKAN dari
   daftar pilihan supaya tidak dobel tagih.

   CATATAN DESAIN — field yang tidak jelas dari screenshot:
   - Baris kecil di bawah field "Dari Purchase Order" (nama +
     alamat Supplier) BUKAN dari `DATA.terimaBarang.alamatPengiriman`
     (itu alamat TUJUAN pengiriman DBM sendiri, dipakai field
     "Alamat Pengiriman" terpisah) melainkan alamat SUPPLIER-nya
     sendiri, diambil dari `DATA.suppliers[].alamat` lewat lookup
     nama Supplier — dua alamat ini konsepnya beda (asal vs tujuan
     barang) walau sama-sama muncul di form yang sama.
   - "No. Retur PB" SELALU kosong/readonly (fitur Retur Pembelian
     belum jadi modul di mockup ini, sama seperti "No. S.O. Indent"
     di Purchase Order yang juga masih dekoratif).
   - Baris item TIDAK BISA ditambah/dihapus manual (tidak ada
     "+Tambah Item Baru" seperti Purchase Order) — barang & Qty
     SELALU persis sama dengan yang tercatat di BPB sumbernya
     (Kode/Nama/Qty semua readonly), hanya Harga Beli/Fee
     Distribusi/Budget Diskon/checkbox Pph/checkbox Ppn yang bisa
     diedit user, karena secara bisnis nilai faktur pembelian tidak
     boleh menagih barang di luar yang sudah diterima.
   - Checkbox "Ppn" per baris (baru, tidak ada di Purchase Order)
     TETAP dekoratif seperti checkbox "Pph" per baris (tidak
     mempengaruhi kalkulasi baris, kalkulasi PPN tetap di level
     dokumen lewat "Informasi PPN") — konsisten dengan penyederhanaan
     checkbox Pph per-baris yang sudah ada sejak Purchase Order.
   - Panel "Uang Muka" (radio Oldest/Pilih Uang Muka + Sisa U.Muka +
     Pakai) mereuse PERSIS pola yang sudah diperkenalkan Faktur
     Penjualan Via S.J. (di sana radio Tertua/Pilih) — Sisa U.Muka
     tetap statis dari data (tidak ada ledger uang muka sungguhan di
     mockup ini), field "Sisa Jumlah" = Jumlah − Pakai.
   - Kalkulasi tabel item & panel PPN/PPh/Ongkos Angkut/Jumlah
     PERSIS pola `poRecalcItem()`/`poRecalcTotals()` di Purchase
     Order (Total Disc% = Fee Distribusi% + Budget Diskon%,
     Disc/Barang = Harga Beli × Qty × Total Disc% ÷ 100, dst.) —
     TIDAK dibuat ulang dari nol, hanya prefix fungsi diganti `pbb`.
========================================================= */

const PBB_CABANG_LIST = ['Head Office','Surabaya','Bandung','Medan','Makassar','Semarang','Tangerang','Sidoarjo'];
const PBB_CABANG_CODE = {'Head Office':'HO','Surabaya':'SBY','Bandung':'BDG','Medan':'MDN','Makassar':'MKS','Semarang':'SMG','Tangerang':'TGR','Sidoarjo':'SDA'};
const PBB_SYARAT_BAYAR_LIST = ['CBD','Kredit 14 Hari','Kredit 30 Hari','Kredit 45 Hari','Kredit 60 Hari'];
const PBB_UANG_MUKA_LIST = ['Oldest','Pilih Uang Muka'];
/* Copy verbatim dari PO_PPH_LIST (Purchase Order) — bukan reference
   cross-file karena lazy-load antar modul tidak terjamin urutannya. */
const PBB_PPH_LIST = [
  {kode:'PPH 22 (0.3)', persen:0.3},
  {kode:'PPH 23 (2)', persen:2},
  {kode:'PPH 4(2) (2.5)', persen:2.5},
];

function pbbParseTglID(str){
  if(!str) return null;
  const parts = String(str).split('/');
  if(parts.length !== 3) return null;
  const d = +parts[0], m = +parts[1], y = +parts[2];
  if(!d || !m || !y) return null;
  return new Date(y, m - 1, d);
}
function pbbFormatTglID(date){
  const d = String(date.getDate()).padStart(2, '0');
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const y = date.getFullYear();
  return `${d}/${m}/${y}`;
}
/* Tgl. Jth. Tempo = Tgl. Faktur + N hari kredit dari Syarat Bayar
   ("Kredit N Hari" -> +N hari; "CBD" -> 0 hari) — salinan lokal
   pola yang sama seperti fktJatuhTempo() di Faktur Penjualan Via
   S.J. (tidak reference cross-file karena lazy-load antar modul
   tidak terjamin urutannya). */
function pbbJatuhTempo(tglFaktur, syaratBayar){
  const dt = pbbParseTglID(tglFaktur);
  if(!dt) return '';
  const match = /Kredit\s+(\d+)\s+Hari/i.exec(syaratBayar || '');
  const hari = match ? (+match[1]) : 0;
  dt.setDate(dt.getDate() + hari);
  return pbbFormatTglID(dt);
}

function tplPembelianBPBListPage(){
  return `
    <div class="breadcrumb">Home / <b>Pembelian Melalui BPB</b></div>
    <div class="card">
      <div class="card-header dark-header">
        <h3>${icon('cart',15)} Daftar Pembelian Melalui BPB</h3>
        <div class="toolbar-actions">
          <select class="chip-btn" id="pbbFilterPeriod"><option>Agustus 2026</option></select>
          <button class="btn-primary" id="btnPbbAdd">${icon('plus',14)} Tambah</button>
        </div>
      </div>
      <div class="table-toolbar">
        <select id="pbbPageSize"><option selected>10</option><option>25</option><option>50</option></select>
        <input type="text" id="pbbSearch" placeholder="Pencarian Global">
      </div>
      <div class="table-wrap"><table>
        <thead><tr>
          <th>No. Faktur</th>
          <th>No. BPB</th>
          <th>No. PO</th>
          <th>Tgl. Faktur</th>
          <th>Supplier</th>
          <th>Keterangan</th>
          <th class="text-right">Nilai Faktur</th>
          <th class="text-right">Pembayaran</th>
          <th>Lihat</th>
          <th>Ubah</th>
          <th>Hapus</th>
        </tr></thead>
        <tbody id="pbbTbody"></tbody>
      </table></div>
      <div class="table-footer"><div class="pager"><button>First</button><button>Previous</button><button class="active">1</button><button>Next</button><button>Last</button></div><div id="pbbTotal"></div></div>
    </div>`;
}

function tplPbbRows(rows){
  if(!rows.length) return `<tr><td colspan="11" style="color:var(--text-light);">Tidak Ada Data</td></tr>`;
  return rows.map((r,i)=>`
    <tr>
      <td><b style="color:var(--blue);">${r.no}</b></td>
      <td>${r.noBPB||''}</td>
      <td>${r.noPO||''}</td>
      <td>${r.tglFaktur||''}</td>
      <td>${r.supplier||''}</td>
      <td>${r.keterangan||''}</td>
      <td class="text-right">${num(r.jumlahTotal||0)}</td>
      <td class="text-right">${num(r.pembayaran||0)}</td>
      <td><button class="icon-btn view" data-view="${i}" title="Lihat">${icon('eye',15)}</button></td>
      <td><button class="icon-btn edit" data-edit="${i}" title="Ubah">${icon('edit',15)}</button></td>
      <td><button class="icon-btn del" data-del="${i}" title="Hapus">${icon('trash',15)}</button></td>
    </tr>`).join('');
}

/* Baris tabel rincian barang — kolom & lebar PERSIS meniru
   tplPoItemRow() di Purchase Order, ditambah 1 kolom checkbox
   "Ppn" (dekoratif, lihat catatan desain di atas), dan Kode/Nama/
   Qty/U/M SELALU readonly (tidak ada tombol cari/hapus baris)
   karena datanya terkunci mengikuti BPB sumber. */
function tplPbbItemRow(item, idx, dis){
  return `
    <tr data-pbb-item-row="${idx}">
      <td style="text-align:center;"><input type="checkbox" data-pbb-pph="${idx}" ${item.pph?'checked':''} ${dis}></td>
      <td style="text-align:center;"><input type="checkbox" data-pbb-ppn="${idx}" ${item.ppn?'checked':''} ${dis}></td>
      <td style="min-width:110px;"><input type="text" value="${item.kode||''}" disabled></td>
      <td style="min-width:190px;"><textarea rows="1" disabled>${item.nama||''}</textarea></td>
      <td style="width:80px;"><input type="number" value="${item.qty||0}" disabled></td>
      <td style="width:70px;">${item.um||''}</td>
      <td style="width:110px;"><input type="number" min="0" data-pbb-harga="${idx}" value="${item.hargaBeli||0}" ${dis}></td>
      <td style="width:90px;"><input type="number" min="0" data-pbb-fee="${idx}" value="${item.feeDistribusi||0}" ${dis}></td>
      <td style="width:90px;"><input type="number" min="0" data-pbb-budget="${idx}" value="${item.budgetDiskon||0}" ${dis}></td>
      <td style="width:90px;"><input type="number" data-pbb-totaldisc="${idx}" value="${item.totalDisc||0}" disabled></td>
      <td style="width:120px;"><input type="text" data-pbb-discbarang="${idx}" value="${num(item.discBarang||0)}" disabled></td>
      <td style="width:140px;"><input type="text" data-pbb-jumlah="${idx}" value="${num(item.jumlah||0)}" disabled></td>
    </tr>`;
}

function tplPbbJurnalPlaceholder(){
  return `
    <div class="placeholder-box" style="padding:36px 20px;">
      <div class="pico">${icon('book',36)}</div>
      <h3 style="font-size:14px;font-weight:700;color:#5b6178;">Rincian Jurnal Akun</h3>
      <p>Preview jurnal akun (debit Persediaan/PPN Masukan, kredit Hutang Usaha) hasil posting Faktur Pembelian ini akan tersedia di sini pada versi lengkap.</p>
    </div>`;
}

function tplPbbForm(mode, row){
  const isAdd = mode === 'add';
  const isView = mode === 'view';
  const dis = isView ? 'disabled' : '';
  const titleAction = isAdd ? 'Tambah' : (isView ? 'Lihat' : 'Ubah');
  const headerIcon = isAdd ? 'plus' : (isView ? 'eye' : 'edit');
  const supplierMaster = DATA.suppliers.find(s => s.nama === row.supplier);
  return `
    <div class="breadcrumb">Home / Pembelian Melalui BPB / <b>${titleAction}</b></div>
    <div class="card">
      <div class="card-header dark-header">
        <h3>${icon(headerIcon,15)} ${isAdd?'+ Pembelian Melalui BPB':'Pembelian Melalui BPB'}</h3>
        ${!isView ? `<button class="btn-danger" id="btnPbbTutorial" type="button">${icon('card',14)} Tutorial</button>` : ''}
      </div>
      <div class="card-body">

        <div class="po-grid-3">
          <div class="form-group">
            <label>Cabang</label>
            <select id="fPbbCabang" ${(isView||!isAdd)?'disabled':''}>${PBB_CABANG_LIST.map(c=>`<option ${row.cabang===c?'selected':''}>${c}</option>`).join('')}</select>
          </div>
          <div class="form-group"></div>
          <div class="form-group"></div>
        </div>

        <div class="po-grid-3">
          <div class="form-group">
            <label>Dari Purchase Order</label>
            <div class="input-with-btn">
              <input type="text" id="fPbbNoPO" value="${row.noPO||''}" placeholder="Pilih dari BPB yang sudah diterima" readonly>
              ${!isView ? `<button type="button" class="icon-btn edit" id="pbbBpbSearch" title="Cari Purchase Order / BPB">${icon('search',13)}</button>` : ''}
            </div>
            <div id="fPbbSupplierInfo" style="font-size:11px;color:var(--text-light);margin-top:4px;">${row.supplier ? `${row.supplier}${supplierMaster && supplierMaster.alamat ? ', '+supplierMaster.alamat : ''}` : ''}</div>
          </div>
          <div class="form-group">
            <label>BPB yang akan ditagihkan</label>
            <input type="text" id="fPbbNoBPB" value="${row.noBPB||''}" disabled>
          </div>
          <div class="form-group">
            <label>No. Retur PB</label>
            <input type="text" value="${row.noReturPB||''}" placeholder="Tidak ada" disabled>
          </div>
        </div>

        <div class="po-grid-3">
          <div class="form-group">
            <label>No. Otomatis</label>
            <div class="input-with-btn">
              <select id="fPbbNoOtomatis" ${dis} style="max-width:90px;"><option>${row.noOtomatis||'PU001'}</option></select>
              <input type="text" id="fPbbNo" value="${row.no||''}" placeholder="Otomatis" readonly>
              ${isAdd ? `<button type="button" class="icon-btn edit" id="pbbRefreshNo" title="Generate Nomor">${icon('refreshCw',13)}</button>` : ''}
            </div>
          </div>
          <div class="form-group">
            <label>Tgl. Faktur</label>
            <div class="input-with-btn">
              <input type="text" id="fPbbTglFaktur" value="${row.tglFaktur||''}" ${dis}>
              <span class="icon-btn edit" style="pointer-events:none;">${icon('calendar',13)}</span>
            </div>
          </div>
          <div class="form-group">
            <label>Syarat Bayar</label>
            <select id="fPbbSyaratBayar" ${dis}>${PBB_SYARAT_BAYAR_LIST.map(s=>`<option ${row.syaratBayar===s?'selected':''}>${s}</option>`).join('')}</select>
          </div>
        </div>

        <div class="po-grid-3">
          <div class="form-group">
            <label>Tgl. Jth. Tempo</label>
            <input type="text" id="fPbbTglJthTempo" value="${row.tglJatuhTempo||''}" disabled>
          </div>
          <div class="form-group">
            <label>Supplier No. Faktur</label>
            <input type="text" id="fPbbSupplierNoFaktur" value="${row.supplierNoFaktur||''}" ${dis}>
          </div>
          <div class="form-group"></div>
        </div>

        <div class="po-grid-3">
          <div class="form-group">
            <label>Jurnal</label>
            <select id="fPbbJurnal" ${dis}>${DATA.jurnalPembelian.map(j=>`<option ${row.jurnal===j.nama?'selected':''}>${j.nama}</option>`).join('')}</select>
          </div>
          <div class="form-group" style="grid-column:2 / span 2;">
            <label>Alamat Pengiriman</label>
            <textarea id="fPbbAlamat" class="po-textarea" rows="2" ${dis}>${row.alamatPengiriman||''}</textarea>
          </div>
        </div>

        <div class="inv-tabs">
          <button type="button" class="inv-tab-btn active" id="pbbTabDetailBtn">Rincian Transaksi</button>
          <button type="button" class="inv-tab-btn" id="pbbTabJurnalBtn">Rincian Jurnal Akun</button>
        </div>

        <div id="pbbTabDetailContent">
          <div class="table-wrap" style="margin:10px 0 6px;">
            <table class="po-item-table">
              <thead><tr>
                <th>Pph</th>
                <th>Ppn</th>
                <th>Kode Barang</th>
                <th>Nama Barang</th>
                <th>Qty</th>
                <th>U/M</th>
                <th class="text-right">Harga Beli</th>
                <th class="text-right">Fee Distribusi(%)</th>
                <th class="text-right">Budget Diskon(%)</th>
                <th class="text-right">Total Disc(%)</th>
                <th class="text-right">Disc/Barang</th>
                <th class="text-right">Jumlah</th>
              </tr></thead>
              <tbody id="pbbItemsBody">${row.items.map((it,idx)=>tplPbbItemRow(it,idx,dis)).join('')}</tbody>
            </table>
          </div>
          <div id="pbbItemsEmptyHint" style="font-size:11.5px;color:var(--text-light);margin-top:6px;${row.items.length?'display:none;':''}">Belum ada barang — pilih Purchase Order / BPB terlebih dahulu.</div>

          <div class="form-grid" style="margin-top:22px;">
            <div>
              <div class="form-section">Informasi PPN</div>
              <div class="radio-group">
                <label><input type="radio" name="pbbPpnMode" value="tidak" ${row.ppnMode==='tidak'?'checked':''} ${dis}> Tidak ada PPN</label>
                <label><input type="radio" name="pbbPpnMode" value="tidakDipungut" ${row.ppnMode==='tidakDipungut'?'checked':''} ${dis}> PPN Tidak Dipungut Pajak</label>
                <label><input type="radio" name="pbbPpnMode" value="inklusif" ${row.ppnMode==='inklusif'?'checked':''} ${dis}> PPN Inklusif</label>
                <label><input type="radio" name="pbbPpnMode" value="eksklusif" ${row.ppnMode==='eksklusif'?'checked':''} ${dis}> PPN Eksklusif (+11%)</label>
              </div>
              <table class="field-table po-rincian-table" style="margin-top:10px;">
                <tr><td class="flabel">Mata Uang</td><td colspan="3"><select id="fPbbMataUang" ${dis}><option ${row.mataUang==='IDR'?'selected':''}>IDR</option><option ${row.mataUang==='USD'?'selected':''}>USD</option></select></td></tr>
                <tr><td class="flabel">Tgl. Faktur Pajak</td><td colspan="3"><input type="text" id="fPbbTglFakturPajak" value="${row.tglFakturPajak||''}" ${dis}></td></tr>
                <tr><td class="flabel">No. Faktur Pajak</td><td colspan="3"><input type="text" id="fPbbNoFakturPajak" value="${row.noFakturPajak||''}" ${dis}></td></tr>
              </table>
            </div>
            <div>
              <div class="form-section">Rincian Transaksi</div>
              <table class="field-table po-rincian-table">
                <tr><td class="flabel">Mata Uang</td><td><input type="text" value="${row.mataUang||'IDR'}" disabled></td><td class="flabel">Kurs</td><td><input type="number" id="fPbbKurs" value="${row.kurs||1}" ${dis}></td></tr>
                <tr><td class="flabel">Diskon 1</td><td><input type="number" id="fPbbDiskon1" value="${row.diskon1||0}" ${dis}> %</td><td></td><td><input type="text" id="fPbbDiskon1Amount" value="${num(row.diskon1Amount||0)}" disabled></td></tr>
                <tr><td class="flabel">Diskon 2</td><td><input type="number" id="fPbbDiskon2" value="${row.diskon2||0}" ${dis}> %</td><td></td><td><input type="text" id="fPbbDiskon2Amount" value="${num(row.diskon2Amount||0)}" disabled></td></tr>
                <tr><td class="flabel">DPP</td><td colspan="3"><input type="text" id="fPbbDpp" value="${num(row.dpp||0)}" disabled></td></tr>
                <tr><td class="flabel">Pajak 11%</td><td>
                    <div class="input-with-btn">
                      <input type="text" id="fPbbPajak11" value="${row.pajak11||''}" readonly>
                      ${!isView ? `<button type="button" class="icon-btn edit" id="pbbPajakInfo" title="Cari Kode Pajak">${icon('search',13)}</button>` : ''}
                    </div>
                  </td><td></td><td><input type="text" id="fPbbPpnAmount" value="${num(row.ppnAmount||0)}" disabled></td></tr>
                <tr><td class="flabel">PPh Dipungut</td><td>
                    <div class="input-with-btn">
                      <input type="text" id="fPbbPphKode" value="${row.pphKode||''}" placeholder="Tidak ada" readonly>
                      ${!isView ? `<button type="button" class="icon-btn edit" id="pbbPphSearch" title="Cari PPh">${icon('search',13)}</button>
                      <button type="button" class="icon-btn del" id="pbbPphClear" title="Hapus">${icon('trash',13)}</button>` : ''}
                    </div>
                  </td><td style="font-size:11.5px;color:var(--text-light);white-space:nowrap;">${row.pphKode? (row.pphPersen+'%') : ''}</td><td><input type="text" id="fPbbPphAmount" value="${num(row.pphAmount||0)}" disabled></td></tr>
                <tr><td class="flabel">Ongkos Angkut</td><td colspan="3"><input type="number" id="fPbbOngkosAngkut" value="${row.ongkosAngkut||0}" ${dis}></td></tr>
                <tr><td class="flabel">Jumlah</td><td colspan="3"><input type="text" id="fPbbJumlahTotal" value="${num(row.jumlahTotal||0)}" disabled style="font-weight:700;font-size:14px;"></td></tr>
                <tr><td class="flabel">Sisa Jumlah</td><td colspan="3"><input type="text" id="fPbbSisaJumlah" value="${num(row.sisaJumlah||0)}" disabled></td></tr>
              </table>
            </div>
          </div>

          <div class="form-section">Uang Muka</div>
          <div class="radio-group">
            ${PBB_UANG_MUKA_LIST.map(u=>`<label><input type="radio" name="pbbUangMukaTipe" value="${u}" ${row.uangMukaTipe===u?'checked':''} ${dis}> ${u}</label>`).join('')}
          </div>
          <table class="field-table" style="max-width:420px;margin-top:12px;">
            <tr><td class="flabel">Sisa U.Muka</td><td><input type="text" id="fPbbSisaUangMuka" value="${num(row.sisaUangMuka||0)}" disabled></td></tr>
            <tr><td class="flabel">Pakai</td><td><input type="number" id="fPbbUangMukaPakai" value="${row.uangMukaPakai||0}" ${dis}></td></tr>
          </table>
        </div>
        <div id="pbbTabJurnalContent" style="display:none;">${tplPbbJurnalPlaceholder()}</div>

        <table class="field-table" style="margin-top:18px;">
          <tr>
            <td class="flabel">Keterangan</td>
            <td><textarea id="fPbbKeterangan" class="po-textarea" rows="2" ${dis}>${row.keterangan||''}</textarea></td>
          </tr>
        </table>

        <div style="font-size:11.8px;color:var(--text-light);margin-top:18px;line-height:1.7;">
          ${row.tglInput ? `Tgl. Input : ${row.tglInput}  User Entry : ${row.userInput||''}<br>` : ''}
          ${row.tglEdit ? `Tgl Edit : ${row.tglEdit}  User Edit : ${row.userEdit||''}` : ''}
        </div>

        <div class="form-page-actions">
          ${isView
            ? `<a href="#" id="pbbTutup" class="link-add" style="margin-right:auto;">&larr; Kembali ke Daftar</a>`
            : `<a href="#" id="pbbBatalkan" class="link-add" style="margin-right:auto;">Batalkan</a>
               ${!isAdd ? `<button class="btn-teal" id="pbbPerbaharuiKurs" type="button">Perbaharui Kurs</button>
               <button class="btn-teal" id="pbbCetak" type="button">${icon('printer',13)} Cetak</button>` : ''}
               <button class="btn-primary" id="pbbSimpan">Simpan</button>`}
        </div>
      </div>
    </div>`;
}

function tplPbbDeleteConfirm(row){
  return `
    <div class="modal-box">
      <div class="modal-header"><span>Hapus Pembelian Melalui BPB</span><span class="close" id="modalClose">&times;</span></div>
      <div class="modal-body"><p>Yakin ingin menghapus Faktur <b>${row.no}</b>?</p></div>
      <div class="modal-footer">
        <button class="btn-secondary" id="modalCancel">Batal</button>
        <button class="btn-danger" id="modalDelete">Hapus</button>
      </div>
    </div>`;
}

function tplPbbInfoModal(title,text){
  return `
    <div class="modal-box">
      <div class="modal-header"><span>${title}</span><span class="close" id="modalClose">&times;</span></div>
      <div class="modal-body"><p>${text}</p></div>
      <div class="modal-footer"><button class="btn-primary" id="modalOk">OK</button></div>
    </div>`;
}

/* Popup "Pilih Purchase Order / BPB" — sumbernya DATA.terimaBarang
   (bukan DATA.purchaseOrder langsung, lihat catatan desain di atas),
   dikeluarkan BPB yang sudah pernah dipakai bikin Faktur. */
function tplPbbBpbPicker(list){
  return `
    <div class="modal-box" style="max-width:720px;">
      <div class="modal-header"><span>Pilih Purchase Order / BPB</span><span class="close" id="modalClose">&times;</span></div>
      <div class="modal-body">
        <div class="table-wrap" style="max-height:340px;overflow:auto;"><table>
          <thead><tr><th>No. PO</th><th>No. BPB</th><th>Tgl. Terima</th><th>Supplier</th><th></th></tr></thead>
          <tbody>${list.length ? list.map(b=>`<tr><td>${b.noPO}</td><td>${b.no}</td><td>${b.tglKedatangan||''}</td><td>${b.supplier||''}</td><td><button class="btn-pick" data-pick-bpb="${b.no}">Pilih</button></td></tr>`).join('') : `<tr><td colspan="5" style="color:var(--text-light);">Semua BPB sudah difakturkan</td></tr>`}</tbody>
        </table></div>
      </div>
      <div class="modal-footer"><button class="btn-secondary" id="modalCancel">Tutup</button></div>
    </div>`;
}

function tplPbbPphPicker(list){
  return `
    <div class="modal-box" style="max-width:400px;">
      <div class="modal-header"><span>Pilih PPh</span><span class="close" id="modalClose">&times;</span></div>
      <div class="modal-body">
        <div class="table-wrap"><table>
          <thead><tr><th>Kode PPh</th><th>Persen</th><th></th></tr></thead>
          <tbody>${list.map(p=>`<tr><td>${p.kode}</td><td>${p.persen}%</td><td><button class="btn-pick" data-pick-pph="${p.kode}" data-pick-persen="${p.persen}">Pilih</button></td></tr>`).join('')}</tbody>
        </table></div>
      </div>
      <div class="modal-footer"><button class="btn-secondary" id="modalCancel">Tutup</button></div>
    </div>`;
}
