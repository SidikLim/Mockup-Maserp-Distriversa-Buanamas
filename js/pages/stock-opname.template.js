/* =========================================================
   TEMPLATE (HTML saja) — Stock Opname (Persediaan Barang >
   Daftar Transaksi > Stock Opname, page:'stockOpname'). Logic-nya
   ada di file sebelah: stock-opname.js

   Sebelumnya placeholder murni. Dibangun 2026-08-27, LANJUTAN
   LANGSUNG dari modul Master Stock Opname (lihat header komentar
   master-stock-opname.template.js dulu utk konteks modul itu) sesuai
   permintaan eksplisit user: "lanjut buatkan mockup Stock Opnamenya,
   lanjutan dari master stock opname yang sebelumnya" + 2 screenshot
   MASERP yang dikirim ("Daftar Stok Opname" list & form "+Stock
   Opname").

   BEDA PERAN dengan Master Stock Opname: Master Stock Opname adalah
   dokumen RENCANA/HASIL HITUNG per-barang (Qty Counted vs Sistem,
   Selisih, Verifikasi) — sudah dibangun sebelumnya. Stock Opname
   (modul ini) adalah dokumen TURUNAN yang me-RUJUK 1 Master Stock
   Opname lalu memecah tiap barangnya jadi RINCIAN PER BATCH (Batch
   Number/Qty Batch/Tgl. Expired) — karena di dunia nyata 1 kode
   barang bisa punya banyak batch/lot dengan tanggal kadaluarsa
   beda-beda (persis terlihat di screenshot form MASERP: kode barang
   "01-30001" muncul 5x berturut-turut dengan Batch Number & Tgl.
   Expired berbeda tiap baris, dikelompokkan dgn warna latar beda).

   Screenshot form REFERENSI (`ee0608b9-image.png`) berasal dari
   instalasi MASERP customer lain (farmasi/alkes — item "SATORIA
   MEDIKA", "Infus Ringer Lactate" dst., kolom Batch Number dari data
   customer itu) — BUKAN data DBM. Field & alur kerjanya (Cabang/No.
   Bukti/Tgl. Transaksi/Master Stock Opname/Gudang/Keterangan lalu
   tabel Rincian Batch Number/Qty Batch/Tgl. Expired) DIPERTAHANKAN
   sesuai referensi, tapi SELURUH data barangnya diganti katalog FMCG
   DBM (10 barang yang sama dipakai modul-modul lain) — kode gudang
   Semarang DBM sendiri adalah 06-GUU (BUKAN 02-GUU seperti contoh di
   screenshot, itu kode instalasi customer lain), konsisten dgn
   DATA.masterStockOpname yang sudah ada.

   PRESEDEN Batch Number/Tgl Expired: BEDA dari Master Stock Opname
   (yang field Batch/Exp-nya SENGAJA selalu "-" krn modul itu cuma
   soal Qty Counted vs Sistem, bukan soal batch) — modul Stock Opname
   ini JUSTRU FUNGSI UTAMANYA adalah mengisi Batch Number/Qty
   Batch/Tgl. Expired per barang, jadi field2 itu di sini WAJIB
   diisi/editable, bukan "-". Format Batch Number ("BT-YYMMDD-NN")
   mengikuti pola yang SUDAH ADA di field noBatch pada baris
   DATA.salesOrder[].items (satu2nya tempat lain di mockup ini yang
   sudah punya nomor batch), Tgl. Expired pakai format dd/mm/yyyy
   (konsisten format tanggal mockup ini, BUKAN format yyyy-mm-dd yang
   dipakai field tglKadaluarsa Sales Order).

   ALUR "Generate": pilih Cabang -> pilih dokumen "Master Stock
   Opname" (dropdown, hanya menampilkan MSO milik Cabang terpilih,
   dari DATA.masterStockOpname) -> Gudang & Keterangan otomatis
   terisi dari MSO terpilih (field Gudang tetap berupa <select> yang
   bisa diganti manual selama masih di Cabang yang sama, BUKAN
   dikunci total) -> klik "Generate" -> Rincian diisi 1 baris per
   barang di MSO tsb (Kode/Nama Barang dari MSO, Qty Batch
   DIINISIALISASI = Qty Counted barang itu di MSO sebagai TITIK AWAL
   yang masuk akal utk 1 batch, Batch Number/Tgl. Expired kosong utk
   diisi user) + banner kuning "Master Stock Opname sudah digenerate"
   muncul (pola .alert-warning yang SUDAH ADA, dipakai persis sama
   spt di Reordering Sheet/Sales Order/Stock Request utk banner
   status). "+Tambah Item" menambah baris kosong baru (kode barang
   dicari lewat picker, DIVALIDASI harus di Gudang yang sama spt
   Filter Gudang di form ini — pola cross-check sama persis MSO).
   "+Tambah Batch Number" MENDUPLIKASI baris TERAKHIR (kode & nama
   barang yang sama) dengan Batch Number/Qty Batch/Tgl. Expired
   kosong — merepresentasikan "barang yang sama, batch/lot lain" —
   baris2 dengan kode barang sama dgn baris sebelumnya diberi
   highlight latar peach (persis pola visual grouping di screenshot).

   PENTING — TIDAK ADA sinkronisasi otomatis balik ke Qty Counted
   Master Stock Opname (mis. sum semua Qty Batch per kode barang
   TIDAK menimpa row.items[].qtyCounted di DATA.masterStockOpname).
   Ini KEPUTUSAN DESAIN SENGAJA, konsisten dgn precedent modul lain
   (row "Penyesuaian stok hasil Stock Opname" di DATA.transaksiPersediaan
   yang JUGA sengaja tidak di-cross-link otomatis ke Master Stock
   Opname) — 2 modul ini merujuk satu sama lain scr VISUAL/naratif
   (nomor dokumen ditampilkan) tapi TIDAK saling memutasi data secara
   live, supaya tidak menambah kerapuhan lintas-modul. Angka Qty
   Batch di data sample SUDAH disusun manual supaya konsisten dgn
   Qty Counted MSO terkait (bukan dihitung otomatis).

   List page TIDAK punya kolom Lihat/Cetak terpisah (beda dari Master
   Stock Opname) — persis screenshot "Daftar Stok Opname" yang cuma
   py kolom Ubah/Hapus, No. Bukti-nya sendiri jadi link yang membuka
   mode edit (pola sama persis modul CRUD sederhana lain spt Satuan/
   Group Produk, BUKAN pola Lihat-terpisah Master Stock Opname). */

const OPN_CABANG_LIST = ['Head Office','Surabaya','Bandung','Tangerang','Medan','Makassar','Semarang','Sidoarjo'];
const OPN_CABANG_CODE = {'Head Office':'HO','Surabaya':'SBY','Bandung':'BDG','Tangerang':'TGR','Medan':'MDN','Makassar':'MKS','Semarang':'SMG','Sidoarjo':'SDA'};

function tplOpnListPage(){
  return `
    <div class="breadcrumb">Home / <b>Stock Opname</b></div>
    <div class="card">
      <div class="card-header dark-header">
        <h3>${icon('clipboard',15)} Daftar Stok Opname</h3>
        <div class="toolbar-actions">
          <select id="opnPeriodeChip" style="max-width:150px;">
            <option>Juni 2026</option><option>Juli 2026</option><option selected>Agustus 2026</option>
          </select>
          <button class="btn-primary" id="btnOpnAdd">${icon('plus',14)} Tambah</button>
        </div>
      </div>
      <div class="table-toolbar">
        <select id="opnPageSize"><option selected>10</option><option>25</option><option>50</option></select>
        <input type="text" id="opnSearch" placeholder="Pencarian Global">
      </div>
      <div class="table-wrap"><table>
        <thead><tr>
          <th>No. Bukti</th>
          <th>Tgl Transaksi</th>
          <th>Cabang</th>
          <th>Master Stock Opname</th>
          <th>Keterangan</th>
          <th>Ubah</th>
          <th>Hapus</th>
        </tr></thead>
        <tbody id="opnTbody"></tbody>
      </table></div>
      <div class="table-footer"><div class="pager" id="opnPager"></div><div id="opnTotal"></div></div>
    </div>`;
}

function tplOpnRows(rows, page, pageSize){
  if(!rows.length) return `<tr><td colspan="7" style="color:var(--text-light);">Tidak ada data Stock Opname</td></tr>`;
  const start = (page-1)*pageSize;
  return rows.slice(start, start+pageSize).map((r) => {
    const idx = DATA.stockOpname.indexOf(r);
    return `
    <tr>
      <td><a href="#" class="row-link" data-edit="${idx}" style="color:var(--blue);font-weight:600;">${r.no}</a></td>
      <td>${(r.tglTransaksi||'').split(' ')[0]||''}</td>
      <td>${r.cabang}</td>
      <td>${r.masterStockOpnameNo||'-'}</td>
      <td>${r.keterangan||''}</td>
      <td><button class="icon-btn edit" data-edit="${idx}" title="Ubah">${icon('edit',15)}</button></td>
      <td><button class="icon-btn del" data-del="${idx}" title="Hapus">${icon('trash',15)}</button></td>
    </tr>`;
  }).join('');
}

function tplOpnPager(page, totalPages){
  if(totalPages <= 1) return '';
  let btns = `<button data-opnpage="1">First</button><button data-opnpage="${Math.max(1,page-1)}">Previous</button>`;
  for(let p=1;p<=totalPages;p++){ btns += `<button data-opnpage="${p}" class="${p===page?'active':''}">${p}</button>`; }
  btns += `<button data-opnpage="${Math.min(totalPages,page+1)}">Next</button><button data-opnpage="${totalPages}">Last</button>`;
  return btns;
}

/* Pager windowed (maks. 7 nomor), pola sama tplMsoItemPager() —
   dipakai utk tabel Rincian, walau data sample DBM cuma 10 baris
   (tidak butuh pagination sungguhan), infrastrukturnya dipertahankan
   konsisten dgn modul lain utk jaga-jaga Rincian yang lebih besar. */
function tplOpnItemPager(page, totalPages){
  if(totalPages <= 1) return '';
  const windowSize = 7;
  let startP = Math.max(1, page - Math.floor(windowSize/2));
  let endP = Math.min(totalPages, startP + windowSize - 1);
  startP = Math.max(1, endP - windowSize + 1);
  let btns = `<button data-opnitempage="1">First</button><button data-opnitempage="${Math.max(1,page-1)}">Previous</button>`;
  for(let p=startP;p<=endP;p++){ btns += `<button data-opnitempage="${p}" class="${p===page?'active':''}">${p}</button>`; }
  btns += `<button data-opnitempage="${Math.min(totalPages,page+1)}">Next</button><button data-opnitempage="${totalPages}">Last</button>`;
  return btns;
}

function tplOpnItemRow(it, ii, sameAsPrev){
  return `
    <tr style="${sameAsPrev?'background:#fdf1cf;':''}">
      <td>
        <div class="input-with-btn">
          <input type="text" data-opn-kode="${ii}" value="${it.kode}" readonly placeholder="Cari barang...">
          <button type="button" class="icon-btn edit" data-opn-kodesearch="${ii}" title="Cari Barang">${icon('search',14)}</button>
        </div>
      </td>
      <td>${it.nama||'-'}</td>
      <td><input type="text" data-opn-batch="${ii}" value="${it.batch||''}" placeholder="Batch Number" style="width:130px;"></td>
      <td><input type="number" min="0" step="1" data-opn-qtybatch="${ii}" value="${it.qtyBatch||0}" style="width:90px;"></td>
      <td>
        <div class="input-with-btn">
          <input type="text" data-opn-exp="${ii}" value="${it.exp||''}" placeholder="dd/mm/yyyy" style="width:110px;">
          <span class="icon-btn edit" style="pointer-events:none;">${icon('calendar',14)}</span>
        </div>
      </td>
      <td><button type="button" class="icon-btn del" data-opn-hapus="${ii}" title="Hapus Baris">${icon('trash',14)}</button></td>
    </tr>`;
}

function tplOpnItemsTable(items, page, pageSize){
  const totalPages = Math.max(1, Math.ceil(items.length/pageSize));
  const p = Math.min(page, totalPages);
  const start = (p-1)*pageSize;
  const pageItems = items.slice(start, start+pageSize);
  return `
    <table class="opn-item-table">
      <thead>
        <tr>
          <th>Kode Barang</th>
          <th>Nama Barang</th>
          <th>Batch Number</th>
          <th>Qty Batch</th>
          <th>Tgl. Expired</th>
          <th>Hapus</th>
        </tr>
      </thead>
      <tbody id="opnItemsBody">
        ${pageItems.length ? pageItems.map((it,ii)=>{
          const realIdx = start+ii;
          const prev = items[realIdx-1];
          return tplOpnItemRow(it, realIdx, !!(prev && prev.kode && prev.kode===it.kode));
        }).join('') : `<tr><td colspan="6" style="color:var(--text-light);padding:14px;">Belum ada barang — pilih Master Stock Opname lalu klik "Generate", atau klik "+Tambah Item".</td></tr>`}
      </tbody>
    </table>
    <a href="#" id="opnAddItem" class="link-add">${icon('plus',13)} Tambah Item</a>
    <a href="#" id="opnAddBatch" class="link-add" style="margin-left:16px;">${icon('plus',13)} Tambah Batch Number</a>
    <div class="table-footer"><div class="pager" id="opnItemPager">${tplOpnItemPager(p, totalPages)}</div><div>Total: ${items.length}</div></div>`;
}

/* Opsi <option> Master Stock Opname milik Cabang terpilih saja
   (dari DATA.masterStockOpname, difilter m.cabang===cabang). */
function opnMsoOptionsForCabang(cabang, selectedNo){
  return DATA.masterStockOpname.filter(m => m.cabang === cabang)
    .map(m => `<option value="${m.no}" ${m.no===selectedNo?'selected':''}>${m.no} — ${m.keterangan}</option>`).join('');
}

/* Opsi <option> Gudang mengikuti Cabang terpilih (dari DATA.gudang),
   pola sama persis msoGudangOptionsForCabang() — salinan lokal krn
   urutan lazy-load antar modul tidak terjamin. */
function opnGudangOptionsForCabang(cabang, selectedKode){
  return DATA.gudang.filter(g => g.cabang === cabang)
    .map(g => `<option value="${g.kode}" ${g.kode===selectedKode?'selected':''}>${g.kode} - ${g.nama}</option>`).join('');
}

function tplOpnForm(mode, row){
  const isAdd = mode === 'add';
  const titleAction = isAdd ? '+ Stock Opname' : 'Ubah Stock Opname';
  return `
    <div class="breadcrumb">Home / Stock Opname / <b>${isAdd?'Tambah':'Ubah'}</b></div>
    <div class="card">
      <div class="card-header dark-header"><h3>${icon('clipboard',15)} ${titleAction}</h3></div>
      <div class="card-body">
        ${row.items.length ? `<div class="alert-warning" id="opnGeneratedBanner">Master Stock Opname sudah digenerate</div>` : ''}
        <div class="form-grid">
          <div class="form-group">
            <label>Cabang</label>
            <select id="fOpnCabang" ${(!isAdd)?'disabled':''}>
              ${OPN_CABANG_LIST.map(c=>`<option ${row.cabang===c?'selected':''}>${c}</option>`).join('')}
            </select>
          </div>
          <div class="form-group">
            <label>No. Bukti</label>
            <div class="input-with-btn">
              <input type="text" id="fOpnNo" value="${row.no||''}" placeholder="Otomatis" readonly>
              ${isAdd ? `<button type="button" class="icon-btn edit" id="opnRefreshNo" title="Generate Ulang Nomor">${icon('refreshCw',13)}</button>` : ''}
            </div>
          </div>
        </div>
        <div class="form-grid">
          <div class="form-group">
            <label>Tgl. Transaksi</label>
            <div class="input-with-btn">
              <input type="text" id="fOpnTglTransaksi" value="${row.tglTransaksi||''}">
              <span class="icon-btn edit" style="pointer-events:none;">${icon('calendar',14)}</span>
            </div>
          </div>
          <div class="form-group">
            <label>Master Stock Opname</label>
            <select id="fOpnMso">
              <option value="">- Pilih Master Stock Opname -</option>
              ${opnMsoOptionsForCabang(row.cabang, row.masterStockOpnameNo)}
            </select>
          </div>
        </div>
        <div class="form-grid">
          <div class="form-group">
            <label>Gudang</label>
            <select id="fOpnGudang">
              <option value="">- Pilih Gudang -</option>
              ${opnGudangOptionsForCabang(row.cabang, row.gudangKode)}
            </select>
          </div>
          <div class="form-group">
            <label>Keterangan</label>
            <input type="text" id="fOpnKeterangan" value="${row.keterangan||''}" placeholder="Keterangan">
          </div>
        </div>
        <div style="margin-bottom:16px;">
          <button class="btn-primary" id="opnGenerate">Generate</button>
        </div>

        <div class="table-wrap" style="overflow-x:auto;">
          <div id="opnItemsWrap">${tplOpnItemsTable(row.items, 1, 10)}</div>
        </div>

        <div class="form-page-actions">
          <a href="#" id="opnBatalkan" class="link-add" style="margin-right:auto;">Batalkan</a>
          <button class="btn-primary" id="opnSimpan">Simpan</button>
        </div>
      </div>
    </div>`;
}

function tplOpnDeleteConfirm(row){
  return `
    <div class="modal-box">
      <div class="modal-header"><span>Hapus Stock Opname</span><span class="close" id="modalClose">&times;</span></div>
      <div class="modal-body"><p>Yakin ingin menghapus Stock Opname <b>${row.no}</b>?</p></div>
      <div class="modal-footer">
        <button class="btn-secondary" id="modalCancel">Batal</button>
        <button class="btn-danger" id="modalDelete">Hapus</button>
      </div>
    </div>`;
}

function tplOpnInfoModal(title, text){
  return `
    <div class="modal-box">
      <div class="modal-header"><span>${title}</span><span class="close" id="modalClose">&times;</span></div>
      <div class="modal-body"><p>${text}</p></div>
      <div class="modal-footer"><button class="btn-primary" id="modalOk">Mengerti</button></div>
    </div>`;
}
