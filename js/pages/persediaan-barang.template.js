/* =========================================================
   TEMPLATE (HTML saja) — Persediaan Barang / Master Item (menu
   Persediaan Barang > Master & Setting > Inventory, page:'items',
   menggantikan renderer generik lama `pages.items` di js/core.js —
   lihat komentar besar di atas DATA.items di js/data.js untuk
   penjelasan lengkap pengayaan field & adaptasi farmasi->FMCG).
   Logic-nya ada di file sebelah: persediaan-barang.js.

   List "Daftar Persediaan": BEDA dari kebanyakan list page lain di
   mockup ini — kolomnya DINAMIS mengikuti input "Pilih Gudang"
   (semicolon-separated kode gudang, mis. "00-GUU;01-GUU"), tiap
   gudang terpilih menyumbang 4 kolom (Qty/Qty BoSo/Qty BoPo/Qty
   Available) — sesuai screenshot MASERP "Daftar Persediaan" yang
   dikirim user 2026-08-24. Sumber angka per gudang: DATA.persediaan
   (qtyPhysical->Qty, qtyReservasi->Qty BoSo, qtyBoPo->Qty BoPo,
   qtyAvailable->Qty Available — 1 sumber kebenaran, tidak ada angka
   baru). Kolom "Total" & "Satuan" tetap dari DATA.items[].stok/satuan
   (total SEMUA gudang, TIDAK berubah walau kolom gudang yang
   ditampilkan berubah).

   Form "+ Persediaan Barang": pola FULL PAGE 1 kolom scroll panjang
   (SAMA seperti Master Customer, BUKAN tab seperti Master Cabang —
   screenshot menunjukkan semua section berurutan di 1 halaman,
   kecuali "Harga Special Supplier dan Customer" yang punya 2 tab
   kecil di dalamnya, pola .inv-tabs disalin dari Transaksi
   Persediaan/Invoice). Sub-grid pakai 2 pola yang sudah baku di
   proyek ini: TAUTAN (Zat Kandungan Aktif/Group Produk/Lokasi
   Gudang — select dari master, "+Tambah" push kode belum terpakai)
   & ENTITAS BARU (Fee Distribusi/Budget Diskon/Harga Beli-Jual Per
   Tanggal/Harga Special Supplier-Customer/Sales Price By Quantity —
   tiap baris obyek baru, field diedit inline). Supplier sub-grid
   pakai varian tautan + search picker modal (pola disalin dari
   openCbAkunPicker() di cabang.js, disesuaikan ke DATA.suppliers).
========================================================= */

const PSB_TIPE_BARANG_LIST = ['Inventory Stock (FG)','Inventory Stock (RM)','Non Inventory','Jasa'];
const PSB_TIPE_PENYIMPANAN_LIST = ['Suhu Ruang (15-30°C)','Kering & Sejuk','Dingin (2-8°C)'];

function psbSelectOptions(list, selected, emptyLabel){
  const empty = emptyLabel ? `<option value="">${emptyLabel}</option>` : '';
  return empty + list.map(o=>`<option value="${o.kode}" ${selected===o.kode?'selected':''}>${o.kode} - ${o.nama}</option>`).join('');
}

/* ===== LIST "Daftar Persediaan" ===== */
function tplPersediaanListPage(state){
  return `
    <div class="breadcrumb">Home / <b>Persediaan Barang</b></div>
    <div class="card">
      <div class="card-header dark-header">
        <h3>${icon('box',15)} Daftar Persediaan</h3>
        <div class="toolbar-actions">
          <button class="btn-primary" id="btnPsbAdd">${icon('plus',14)} Tambah</button>
          <button class="btn-outline" id="btnPsbImport">${icon('file',14)} Import</button>
        </div>
      </div>
      <div class="table-toolbar" style="flex-wrap:wrap;gap:14px;">
        <label style="display:flex;align-items:center;gap:8px;font-size:12.8px;color:var(--text);font-weight:400;">
          <input type="checkbox" id="psbShowNegatif" ${state.showNegatif?'checked':''} style="width:auto;"> Tampilkan Barang dengan Qty Negatif
        </label>
        <label style="display:flex;align-items:center;gap:8px;font-size:12.8px;color:var(--text);font-weight:400;">
          <input type="checkbox" id="psbShowInactive" ${state.showInactive?'checked':''} style="width:auto;"> Tampilkan Barang yang Tidak Aktif
        </label>
        <div class="form-group" style="margin:0;min-width:260px;">
          <label style="margin-bottom:4px;">Pilih Gudang <span style="font-weight:400;color:var(--text-light);">(pisahkan kode dengan titik koma)</span></label>
          <input type="text" id="psbGudangFilter" value="${state.gudangFilter}" placeholder="Contoh: 00-GUU;01-GUU">
        </div>
      </div>
      <div class="table-toolbar" style="justify-content:space-between;">
        <div style="display:flex;gap:10px;align-items:center;">
          <select id="psbPageSize"><option selected>10</option><option>25</option><option>50</option></select>
          <select style="max-width:130px;"><option>Global Search</option><option>Kode Barang</option><option>Nama Barang</option></select>
        </div>
        <input type="text" id="psbSearch" value="${state.search}" placeholder="Pencarian Global" style="max-width:240px;">
      </div>
      <div class="table-wrap" id="psbTableWrap" style="overflow:auto;"></div>
      <div class="table-footer"><div class="pager"><button>First</button><button>Previous</button><button class="active">1</button><button>Next</button><button>Last</button></div><div id="psbTotal"></div></div>
    </div>`;
}

function tplPsbTable(rows, gudangList){
  const gCols = gudangList.length;
  return `
    <table>
      <thead>
        <tr>
          <th rowspan="2">Kode Barang</th>
          <th rowspan="2">Nama Barang</th>
          ${gCols ? gudangList.map(g=>`<th colspan="4" style="text-align:center;border-left:1px solid var(--border);">${g.nama}</th>`).join('') : `<th rowspan="2">Gudang</th>`}
          <th rowspan="2" class="text-right">Total</th>
          <th rowspan="2">Satuan</th>
          <th rowspan="2">Ubah</th>
          <th rowspan="2">Hapus</th>
        </tr>
        <tr>
          ${gCols ? gudangList.map(()=>`<th class="text-right" style="border-left:1px solid var(--border);">Qty</th><th class="text-right">Qty BoSo</th><th class="text-right">Qty BoPo</th><th class="text-right">Qty Available</th>`).join('') : `<th>-</th>`}
        </tr>
      </thead>
      <tbody>${tplPsbRows(rows, gudangList)}</tbody>
    </table>`;
}

function tplPsbRows(rows, gudangList){
  if(!rows.length) return `<tr><td colspan="${4+gudangList.length*4}" style="color:var(--text-light);">Tidak Ada Data</td></tr>`;
  return rows.map(it=>{
    const i = DATA.items.indexOf(it);
    const gudCells = gudangList.length ? gudangList.map(g=>{
      const p = DATA.persediaan.find(r=>r.kodeGudang===g.kode && r.kodeBarang===it.kode);
      const qp=p?p.qtyPhysical:0, qr=p?p.qtyReservasi:0, qb=p?p.qtyBoPo:0, qa=p?p.qtyAvailable:0;
      return `<td class="text-right" style="border-left:1px solid var(--border);">${num(qp)}</td><td class="text-right">${num(qr)}</td><td class="text-right">${num(qb)}</td><td class="text-right">${num(qa)}</td>`;
    }).join('') : `<td style="color:var(--text-light);">Belum ada gudang dipilih</td>`;
    return `
    <tr>
      <td><b style="color:var(--blue);cursor:pointer;" data-edit="${i}">${it.kode}</b></td>
      <td>${it.nama}</td>
      ${gudCells}
      <td class="text-right">${num(it.stok)}</td>
      <td>${it.satuan}</td>
      <td><button class="icon-btn edit" data-edit="${i}" title="Ubah">${icon('edit',15)}</button></td>
      <td><button class="icon-btn del" data-del="${i}" title="Hapus">${icon('trash',15)}</button></td>
    </tr>`;
  }).join('');
}

/* ===== FORM "+ Persediaan Barang" ===== */
function tplPersediaanForm(mode, row){
  const isEdit = mode==='edit';
  return `
    <div class="breadcrumb">Home / Persediaan Barang / <b>${isEdit?'Ubah Persediaan Barang':'Tambah Persediaan Barang'}</b></div>
    <div class="card">
      <div class="card-header dark-header"><h3>${icon(isEdit?'edit':'plus',15)} ${isEdit?'Persediaan Barang':'+ Persediaan Barang'}</h3></div>
      <div class="card-body">
        <h3 style="text-align:center;color:var(--navy);font-size:15px;font-weight:700;padding-bottom:14px;margin-bottom:18px;">Informasi Persediaan</h3>

        <div class="form-section" style="margin-top:0;border-top:none;padding-top:0;">Data Barang</div>
        <div class="form-grid">
          <div class="form-group">
            <label>Gambar Produk</label>
            <div class="input-with-btn">
              <input type="text" value="${row.gambarProduk||'Belum ada gambar'}" disabled>
              <button type="button" class="icon-btn edit" id="btnPsbUpload" title="Upload Gambar">${icon('file',14)}</button>
            </div>
          </div>
          <div class="form-group"><label>Kode Barang</label><input type="text" id="fPsbKode" value="${row.kode||''}" readonly></div>
          <div class="form-group"><label>Nama Barang</label><input type="text" id="fPsbNama" value="${row.nama||''}" placeholder="Contoh: Minyak Goreng Sunco 2L"><div class="form-error" id="fPsbNamaErr">Nama Barang wajib diisi</div></div>
          <div class="form-group"><label>Kode Barang Pajak</label><input type="text" id="fPsbKodeBarangPajak" value="${row.kodeBarangPajak||''}"></div>
          <div class="form-group"><label>Kode Alkes</label><input type="text" id="fPsbKodeAlkes" value="${row.kodeAlkes||''}" placeholder="Kode Kemenkes"></div>
          <div class="form-group"><label>Nama Alkes</label><input type="text" id="fPsbNamaAlkes" value="${row.namaAlkes||''}"></div>
          <div class="form-group"><label>Kode Item Farma</label><input type="text" id="fPsbKodeItemFarma" value="${row.kodeItemFarma||''}" placeholder="Kode BPOM"></div>
          <div class="form-group"><label>Nama Item Farma</label><input type="text" id="fPsbNamaItemFarma" value="${row.namaItemFarma||''}"></div>
          <div class="form-group"><label>Kode Item Principal</label><input type="text" id="fPsbKodeItemPrincipal" value="${row.kodeItemPrincipal||''}"></div>
          <div class="form-group"><label>Tipe &amp; Ukuran</label><input type="text" id="fPsbTipeUkuran" value="${row.tipeUkuran||''}" placeholder="Contoh: 2 Liter"></div>
          <div class="form-group"><label>Tipe Barang</label><select id="fPsbTipeBarang">${PSB_TIPE_BARANG_LIST.map(t=>`<option ${row.tipeBarang===t?'selected':''}>${t}</option>`).join('')}</select></div>
          <div class="form-group"><label>Kelas</label><input type="text" id="fPsbKelas" value="${row.kelas||''}"></div>
          <div class="form-group"><label>Kategori Barang</label>
            <div class="input-with-btn">
              <select id="fPsbKategoriKode" style="flex:1;">${psbSelectOptions(DATA.kategoriBarang, row.kategoriKode, '-')}</select>
              <button type="button" class="icon-btn edit" id="btnPsbKategoriAdd" title="Tambah Kategori Barang Baru">${icon('plus',14)}</button>
            </div>
          </div>
          <div class="form-group"><label>Kat. Reordering Sheet</label><select id="fPsbKatReorderingSheet">${psbSelectOptions(DATA.kategoriReorderingSheet, row.katReorderingSheetKode, '-')}</select></div>
          <div class="form-group"><label>Farmakoterapi</label><select id="fPsbFarma">${psbSelectOptions(DATA.farmakoterapi, row.farmaKode, '-')}</select></div>
          <div class="form-group"><label>Sub-Farmakoterapi</label><select id="fPsbSubFarma">${psbSelectOptions(DATA.subFarmakoterapi, row.subFarmaKode, '-')}</select></div>
          <div class="form-group"><label>Bentuk Sediaan</label><select id="fPsbBentukSediaan">${psbSelectOptions(DATA.bentukSediaan, row.bentukSediaanKode, '-')}</select></div>
          <div class="form-group"><label>Konversi Satuan Dasar</label><input type="number" id="fPsbKonversiSatuanDasar" value="${row.konversiSatuanDasar??1}" min="1"></div>
          <div class="form-group"><label>Kekuatan Sediaan</label><input type="text" id="fPsbKekuatanSediaan" value="${row.kekuatanSediaan||''}"></div>
          <div class="form-group"><label>Nama Jenis Obat</label><input type="text" id="fPsbNamaJenisObat" value="${row.namaJenisObat||''}"></div>
          <div class="form-group"><label>NIE</label><input type="text" id="fPsbNie" value="${row.nie||''}" placeholder="No. Izin Edar"></div>
          <div class="form-group"><label>Tgl. Efektif</label><input type="text" id="fPsbTglEfektif" value="${row.tglEfektif||''}" placeholder="dd/mm/yyyy"></div>
          <div class="form-group"><label>Tgl. Expired</label><input type="text" id="fPsbTglExpired" value="${row.tglExpired||''}" placeholder="dd/mm/yyyy"></div>
          <div class="form-group"><label>Tipe Penyimpanan</label><select id="fPsbTipePenyimpanan">${PSB_TIPE_PENYIMPANAN_LIST.map(t=>`<option ${row.tipePenyimpanan===t?'selected':''}>${t}</option>`).join('')}</select></div>
          <div class="form-group"><label>Qty Kelipatan Order</label><input type="number" id="fPsbQtyKelipatanOrder" value="${row.qtyKelipatanOrder??1}" min="1"></div>
          <div class="form-group"><label>HS Code</label>
            <div class="input-with-btn">
              <input type="text" id="fPsbHsCode" value="${row.hsCode||''}" placeholder="Kode HS Bea Cukai">
              <button type="button" class="icon-btn edit" id="btnPsbHsSearch" title="Cari Kode HS">${icon('search',14)}</button>
            </div>
          </div>
          <div class="form-group"><label>Memo</label><textarea id="fPsbMemo" rows="2">${row.memo||''}</textarea></div>
        </div>

        <div class="checkbox-row"><input type="checkbox" id="fPsbMinMargin" ${row.tampilkanMinimumMargin?'checked':''}><label for="fPsbMinMargin">Tampilkan Minimum Margin</label></div>
        <div class="checkbox-row"><input type="checkbox" id="fPsbSembunyikanNama" ${row.sembunyikanNamaBarang?'checked':''}><label for="fPsbSembunyikanNama">Sembunyikan Nama Barang</label></div>
        <div class="checkbox-row"><input type="checkbox" id="fPsbHoldPembelian" ${row.holdPembelian?'checked':''}><label for="fPsbHoldPembelian">Hold Pembelian</label></div>
        <div class="checkbox-row"><input type="checkbox" id="fPsbHoldPenjualan" ${row.holdPenjualan?'checked':''}><label for="fPsbHoldPenjualan">Hold Penjualan</label></div>
        <div class="checkbox-row"><input type="checkbox" id="fPsbHoldTransaksiInv" ${row.holdTransaksiInventory?'checked':''}><label for="fPsbHoldTransaksiInv">Hold Transaksi Inventory</label></div>
        <div class="checkbox-row"><input type="checkbox" id="fPsbBarangBonus" ${row.barangBonus?'checked':''}><label for="fPsbBarangBonus">Barang Bonus</label></div>
        <div class="form-group" style="max-width:320px;">
          <label>Status Barang</label>
          <div class="radio-inline">
            <label><input type="radio" name="fPsbStatus" value="Aktif" ${row.statusBarang!=='Non Aktif'?'checked':''}> Aktif</label>
            <label><input type="radio" name="fPsbStatus" value="Non Aktif" ${row.statusBarang==='Non Aktif'?'checked':''}> Non Aktif</label>
          </div>
        </div>

        <div class="form-section">Zat Kandungan Aktif</div>
        <div class="table-wrap"><table>
          <thead><tr><th>Zat Kandungan Aktif</th><th style="width:70px;">Hapus</th></tr></thead>
          <tbody id="psbZatTbody">${tplPsbZatRows(row.zatKandunganAktif)}</tbody>
        </table></div>
        <a href="#" class="link-add" id="btnPsbZatAdd">${icon('plus',13)} Tambah Zat Kandungan Aktif</a>

        <div class="form-section">Group Produk</div>
        <div class="table-wrap"><table>
          <thead><tr><th>Group Produk</th><th style="width:70px;">Hapus</th></tr></thead>
          <tbody id="psbGrpTbody">${tplPsbGrpRows(row.groupProduk)}</tbody>
        </table></div>
        <a href="#" class="link-add" id="btnPsbGrpAdd">${icon('plus',13)} Tambah Group Produk</a>

        <div class="form-section">Barang ini tersedia di gudang/lokasi</div>
        <div class="table-wrap"><table>
          <thead><tr><th>Gudang / Lokasi</th><th class="text-right">Stock</th><th class="text-right">Qty Min</th><th class="text-right">Qty Max</th><th style="width:70px;">Hapus</th></tr></thead>
          <tbody id="psbLokTbody">${tplPsbLokRows(row.lokasiGudang)}</tbody>
        </table></div>
        <div style="display:flex;gap:16px;margin-top:8px;">
          <a href="#" class="link-add" id="btnPsbLokAdd">${icon('plus',13)} Tambah Lokasi Baru</a>
          <button type="button" class="btn-outline" id="btnPsbLokAddAll" style="padding:6px 14px;font-size:12.5px;">${icon('plus',13)} Tambah Semua Gudang</button>
        </div>

        <div class="form-section">Berat Produk</div>
        <div class="form-grid">
          <div class="form-group"><label>Isi Dalam Karton</label><input type="number" id="fPsbIsiDalamKarton" value="${row.beratProduk.isiDalamKarton??0}" min="0"></div>
          <div class="form-group"><label>Berat (Kg)</label><input type="number" id="fPsbBerat" value="${row.beratProduk.berat??0}" min="0" step="0.01"></div>
          <div class="form-group"><label>Panjang (cm)</label><input type="number" id="fPsbPanjang" value="${row.beratProduk.panjang??0}" min="0"></div>
          <div class="form-group"><label>Lebar (cm)</label><input type="number" id="fPsbLebar" value="${row.beratProduk.lebar??0}" min="0"></div>
          <div class="form-group"><label>Tinggi (cm)</label><input type="number" id="fPsbTinggi" value="${row.beratProduk.tinggi??0}" min="0"></div>
          <div class="form-group"><label>Volume (m3)</label><input type="text" id="fPsbVolume" value="${psbVolume(row.beratProduk)}" disabled></div>
        </div>

        <div class="form-section">Fee Distribusi</div>
        <div class="table-wrap"><table>
          <thead><tr><th>Nama Fee</th><th class="text-right">Nilai</th><th style="width:70px;">Hapus</th></tr></thead>
          <tbody id="psbFeeTbody">${tplPsbFeeRows(row.feeDistribusi)}</tbody>
        </table></div>
        <a href="#" class="link-add" id="btnPsbFeeAdd">${icon('plus',13)} Tambah Fee Distribusi</a>

        <div class="form-section">Budget Diskon</div>
        <div class="table-wrap"><table>
          <thead><tr><th>Nama Budget</th><th class="text-right">Nilai</th><th style="width:70px;">Hapus</th></tr></thead>
          <tbody id="psbBudTbody">${tplPsbBudRows(row.budgetDiskon)}</tbody>
        </table></div>
        <a href="#" class="link-add" id="btnPsbBudAdd">${icon('plus',13)} Tambah Budget Diskon</a>

        <div class="form-section">Supplier</div>
        <div class="table-wrap"><table>
          <thead><tr><th>Supplier</th><th>Pusat Bisnis</th><th>Untuk Pembelian</th><th>Lap. Penjualan</th><th style="width:70px;">Hapus</th></tr></thead>
          <tbody id="psbSupTbody">${tplPsbSupRows(row.supplier)}</tbody>
        </table></div>
        <a href="#" class="link-add" id="btnPsbSupAdd">${icon('plus',13)} Tambah Supplier</a>

        <div class="form-section">Divisi</div>
        <div class="form-grid">
          <div class="form-group"><label>Divisi</label>
            <select id="fPsbDivisi">
              <option ${row.divisi==='None'||!row.divisi?'selected':''}>None</option>
              ${DATA.divisi.map(d=>`<option ${row.divisi===d.nama?'selected':''}>${d.nama}</option>`).join('')}
            </select>
          </div>
          <div class="form-group" style="display:flex;align-items:flex-end;">
            <label style="display:flex;align-items:center;gap:8px;margin:0;font-weight:400;"><input type="checkbox" id="fPsbKonsinyasiIn" ${row.konsinyasiIn?'checked':''} style="width:auto;"> Konsinyasi In</label>
          </div>
        </div>

        <div class="form-section">Harga Beli Per Tanggal</div>
        <div class="table-wrap"><table>
          <thead><tr><th>Tgl. Awal</th><th>Tgl. Akhir</th><th class="text-right">Harga</th><th style="width:70px;">Hapus</th></tr></thead>
          <tbody id="psbHbTbody">${tplPsbHargaRows(row.hargaBeliPerTanggal,'Hb')}</tbody>
        </table></div>
        <a href="#" class="link-add" id="btnPsbHbAdd">${icon('plus',13)} Tambah Harga Beli</a>

        <div class="form-section">Harga Jual Per Tanggal</div>
        <div class="table-wrap"><table>
          <thead><tr><th>Tgl. Awal</th><th>Tgl. Akhir</th><th class="text-right">Harga</th><th style="width:70px;">Hapus</th></tr></thead>
          <tbody id="psbHjTbody">${tplPsbHargaRows(row.hargaJualPerTanggal,'Hj')}</tbody>
        </table></div>
        <a href="#" class="link-add" id="btnPsbHjAdd">${icon('plus',13)} Tambah Harga Jual</a>

        <div class="form-section">Jenis Satuan dan Harga</div>
        <div class="table-wrap"><table>
          <thead><tr><th>Satuan Level</th><th>Barcode</th><th>Satuan</th><th>Satuan Pajak</th><th class="text-right">Konversi</th></tr></thead>
          <tbody>${tplPsbSatuanRows(row.satuanDetail)}</tbody>
        </table></div>

        <div class="form-section">Harga Special Supplier dan Customer</div>
        <div class="inv-tabs">
          <button type="button" class="inv-tab-btn active" id="psbTabHssBtn">Harga Special Supplier</button>
          <button type="button" class="inv-tab-btn" id="psbTabHscBtn">Harga Special Customer</button>
        </div>
        <div id="psbTabHssContent">
          <div class="table-wrap"><table>
            <thead><tr><th>Supplier</th><th class="text-right">Harga</th><th style="width:70px;">Hapus</th></tr></thead>
            <tbody id="psbHssTbody">${tplPsbHssRows(row.hargaSpecialSupplier)}</tbody>
          </table></div>
          <a href="#" class="link-add" id="btnPsbHssAdd">${icon('plus',13)} Tambah Harga Special Supplier</a>
        </div>
        <div id="psbTabHscContent" style="display:none;">
          <div class="table-wrap"><table>
            <thead><tr><th>Customer</th><th class="text-right">Harga</th><th style="width:70px;">Hapus</th></tr></thead>
            <tbody id="psbHscTbody">${tplPsbHscRows(row.hargaSpecialCustomer)}</tbody>
          </table></div>
          <a href="#" class="link-add" id="btnPsbHscAdd">${icon('plus',13)} Tambah Harga Special Customer</a>
        </div>

        <div class="form-section">Sales Price By Quantity</div>
        <div class="table-wrap"><table>
          <thead><tr><th class="text-right">Qty Min</th><th class="text-right">Qty Max</th><th class="text-right">Harga</th><th style="width:70px;">Hapus</th></tr></thead>
          <tbody id="psbSpqTbody">${tplPsbSpqRows(row.salesPriceByQuantity)}</tbody>
        </table></div>
        <a href="#" class="link-add" id="btnPsbSpqAdd">${icon('plus',13)} Tambah Sales Price By Quantity</a>

        <div class="form-page-actions">
          <button class="btn-secondary" id="psbCancel">Batalkan</button>
          <button class="btn-primary" id="psbSave">Simpan</button>
        </div>
      </div>
    </div>`;
}

function psbVolume(bp){
  const v = (Number(bp.panjang)||0) * (Number(bp.lebar)||0) * (Number(bp.tinggi)||0) / 1000000;
  return v.toLocaleString('id-ID',{minimumFractionDigits:3,maximumFractionDigits:3});
}

/* ----- Zat Kandungan Aktif (tautan -> DATA.zatKandunganAktif) ----- */
function tplPsbZatRows(list){
  if(!list.length) return `<tr><td colspan="2" style="color:var(--text-light);">Belum ada zat kandungan aktif ditaut</td></tr>`;
  return list.map((kode,i)=>`
    <tr>
      <td><select data-zat-idx="${i}">${psbSelectOptions(DATA.zatKandunganAktif, kode)}</select></td>
      <td><button type="button" class="icon-btn del" data-zat-del="${i}">${icon('trash',14)}</button></td>
    </tr>`).join('');
}

/* ----- Group Produk (tautan -> DATA.groupProduk) ----- */
function tplPsbGrpRows(list){
  if(!list.length) return `<tr><td colspan="2" style="color:var(--text-light);">Belum ada group produk ditaut</td></tr>`;
  return list.map((kode,i)=>`
    <tr>
      <td><select data-grp-idx="${i}">${psbSelectOptions(DATA.groupProduk, kode)}</select></td>
      <td><button type="button" class="icon-btn del" data-grp-del="${i}">${icon('trash',14)}</button></td>
    </tr>`).join('');
}

/* ----- Lokasi Gudang (tautan -> DATA.gudang, + Stock/Qty Min/Max) ----- */
function tplPsbLokRows(list){
  if(!list.length) return `<tr><td colspan="5" style="color:var(--text-light);">Belum ada lokasi gudang ditaut</td></tr>`;
  return list.map((r,i)=>`
    <tr>
      <td><select data-lok-gudang="${i}">${psbSelectOptions(DATA.gudang, r.gudangKode)}</select></td>
      <td><input type="number" data-lok-stock="${i}" value="${r.stock??0}" style="width:100px;text-align:right;"></td>
      <td><input type="number" data-lok-min="${i}" value="${r.qtyMin??0}" style="width:90px;text-align:right;"></td>
      <td><input type="number" data-lok-max="${i}" value="${r.qtyMax??0}" style="width:90px;text-align:right;"></td>
      <td><button type="button" class="icon-btn del" data-lok-del="${i}">${icon('trash',14)}</button></td>
    </tr>`).join('');
}

/* ----- Fee Distribusi / Budget Diskon (entitas baru: nama+nilai) ----- */
function tplPsbFeeRows(list){
  if(!list.length) return `<tr><td colspan="3" style="color:var(--text-light);">Belum ada fee distribusi</td></tr>`;
  return list.map((r,i)=>`
    <tr>
      <td><input type="text" data-fee-nama="${i}" value="${r.nama||''}" placeholder="Nama Fee"></td>
      <td><input type="number" data-fee-nilai="${i}" value="${r.nilai??0}" style="width:120px;text-align:right;"></td>
      <td><button type="button" class="icon-btn del" data-fee-del="${i}">${icon('trash',14)}</button></td>
    </tr>`).join('');
}
function tplPsbBudRows(list){
  if(!list.length) return `<tr><td colspan="3" style="color:var(--text-light);">Belum ada budget diskon</td></tr>`;
  return list.map((r,i)=>`
    <tr>
      <td><input type="text" data-bud-nama="${i}" value="${r.nama||''}" placeholder="Nama Budget"></td>
      <td><input type="number" data-bud-nilai="${i}" value="${r.nilai??0}" style="width:120px;text-align:right;"></td>
      <td><button type="button" class="icon-btn del" data-bud-del="${i}">${icon('trash',14)}</button></td>
    </tr>`).join('');
}

/* ----- Supplier sub-grid (tautan + search picker + checkboxes) ----- */
function tplPsbSupRows(list){
  if(!list.length) return `<tr><td colspan="5" style="color:var(--text-light);">Belum ada supplier ditaut</td></tr>`;
  return list.map((r,i)=>`
    <tr>
      <td>
        <div class="input-with-btn">
          <input type="text" data-sup-nama="${i}" value="${r.kodeSupplier?r.kodeSupplier+' - '+r.namaSupplier:''}" readonly>
          <button type="button" class="icon-btn edit" data-sup-search="${i}" title="Cari Supplier">${icon('search',14)}</button>
        </div>
      </td>
      <td><select data-sup-pb="${i}">${psbSelectOptions(DATA.businessCentre, r.pusatBisnis ? DATA.businessCentre.find(b=>b.nama===r.pusatBisnis)?.kode : '')}</select></td>
      <td style="text-align:center;"><input type="checkbox" data-sup-beli="${i}" ${r.untukPembelian?'checked':''}></td>
      <td style="text-align:center;"><input type="checkbox" data-sup-jual="${i}" ${r.lapPenjualan?'checked':''}></td>
      <td><button type="button" class="icon-btn del" data-sup-del="${i}">${icon('trash',14)}</button></td>
    </tr>`).join('');
}

function tplPsbSupplierPicker(list){
  return `
    <div class="modal-box" style="max-width:640px;">
      <div class="modal-header"><span>Pilih Supplier</span><span class="close" id="modalClose">&times;</span></div>
      <div class="modal-body">
        <input type="text" id="psbSupPickerSearch" placeholder="Cari kode / nama supplier..." style="width:100%;border:1px solid var(--border);border-radius:6px;padding:8px 10px;font-size:12.8px;margin-bottom:12px;">
        <div class="table-wrap" style="max-height:360px;overflow:auto;">
          <table>
            <thead><tr><th>Kode</th><th>Nama Supplier</th><th></th></tr></thead>
            <tbody id="psbSupPickerBody">${tplPsbSupplierPickerRows(list)}</tbody>
          </table>
        </div>
      </div>
      <div class="modal-footer"><button class="btn-secondary" id="modalCancel">Tutup</button></div>
    </div>`;
}
function tplPsbSupplierPickerRows(list){
  if(!list.length) return `<tr><td colspan="3" style="color:var(--text-light);">Tidak ada supplier ditemukan</td></tr>`;
  return list.map(s=>`
    <tr>
      <td>${s.kode}</td>
      <td>${s.nama}</td>
      <td><button class="btn-pick" data-sup-pick="${s.kode}">Pilih</button></td>
    </tr>`).join('');
}

/* ----- Harga Beli/Jual Per Tanggal (entitas baru) ----- */
function tplPsbHargaRows(list, prefix){
  if(!list.length) return `<tr><td colspan="4" style="color:var(--text-light);">Belum ada data</td></tr>`;
  return list.map((r,i)=>`
    <tr>
      <td><input type="text" data-${prefix.toLowerCase()}-awal="${i}" value="${r.tglAwal||''}" placeholder="dd/mm/yyyy"></td>
      <td><input type="text" data-${prefix.toLowerCase()}-akhir="${i}" value="${r.tglAkhir||''}" placeholder="dd/mm/yyyy (kosong = masih berlaku)"></td>
      <td><input type="number" data-${prefix.toLowerCase()}-harga="${i}" value="${r.harga??0}" style="width:130px;text-align:right;"></td>
      <td><button type="button" class="icon-btn del" data-${prefix.toLowerCase()}-del="${i}">${icon('trash',14)}</button></td>
    </tr>`).join('');
}

/* ----- Jenis Satuan dan Harga (fixed 4 baris) ----- */
function tplPsbSatuanRows(sd){
  const rows = [['dasar','Satuan Dasar'],['um2','U/M 2'],['um3','U/M 3'],['um4','U/M 4']];
  return rows.map(([key,label])=>{
    const d = sd[key];
    return `
    <tr>
      <td><b>${label}</b></td>
      <td><input type="text" data-sat-barcode="${key}" value="${d.barcode||''}"></td>
      <td><input type="text" data-sat-satuan="${key}" value="${d.satuan||''}"></td>
      <td><input type="text" data-sat-pajak="${key}" value="${d.satuanPajak||''}"></td>
      <td><input type="number" data-sat-konversi="${key}" value="${d.konversi??0}" style="width:90px;text-align:right;"></td>
    </tr>`;
  }).join('');
}

/* ----- Harga Special Supplier / Customer (2 tab, entitas baru) ----- */
function tplPsbHssRows(list){
  if(!list.length) return `<tr><td colspan="3" style="color:var(--text-light);">Belum ada harga special supplier</td></tr>`;
  return list.map((r,i)=>`
    <tr>
      <td><select data-hss-supplier="${i}">${psbSelectOptions(DATA.suppliers, r.kodeSupplier)}</select></td>
      <td><input type="number" data-hss-harga="${i}" value="${r.harga??0}" style="width:130px;text-align:right;"></td>
      <td><button type="button" class="icon-btn del" data-hss-del="${i}">${icon('trash',14)}</button></td>
    </tr>`).join('');
}
function tplPsbHscRows(list){
  if(!list.length) return `<tr><td colspan="3" style="color:var(--text-light);">Belum ada harga special customer</td></tr>`;
  return list.map((r,i)=>`
    <tr>
      <td><select data-hsc-customer="${i}">${psbSelectOptions(DATA.customers, r.kodeCustomer)}</select></td>
      <td><input type="number" data-hsc-harga="${i}" value="${r.harga??0}" style="width:130px;text-align:right;"></td>
      <td><button type="button" class="icon-btn del" data-hsc-del="${i}">${icon('trash',14)}</button></td>
    </tr>`).join('');
}

/* ----- Sales Price By Quantity (entitas baru) ----- */
function tplPsbSpqRows(list){
  if(!list.length) return `<tr><td colspan="4" style="color:var(--text-light);">Belum ada tingkatan harga per quantity</td></tr>`;
  return list.map((r,i)=>`
    <tr>
      <td><input type="number" data-spq-min="${i}" value="${r.qtyMin??0}" style="width:100px;text-align:right;"></td>
      <td><input type="number" data-spq-max="${i}" value="${r.qtyMax??0}" style="width:100px;text-align:right;"></td>
      <td><input type="number" data-spq-harga="${i}" value="${r.harga??0}" style="width:130px;text-align:right;"></td>
      <td><button type="button" class="icon-btn del" data-spq-del="${i}">${icon('trash',14)}</button></td>
    </tr>`).join('');
}

function tplPsbDeleteConfirm(row){
  return `
    <div class="modal-box" style="max-width:420px;">
      <div class="modal-header"><span>${icon('alertTriangle',15)} Hapus Barang</span><span class="close" id="modalClose">&times;</span></div>
      <div class="modal-body"><p>Yakin ingin menghapus barang <b>${row.kode} - ${row.nama}</b>? Tindakan ini tidak dapat dibatalkan.</p></div>
      <div class="modal-footer">
        <button class="btn-secondary" id="modalCancel">Batal</button>
        <button class="btn-danger" id="modalDelete">Hapus</button>
      </div>
    </div>`;
}
