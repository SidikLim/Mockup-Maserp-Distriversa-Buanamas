/* =========================================================
   TEMPLATE (HTML saja) — Revaluasi Asset (Aktiva Tetap > Daftar
   Transaksi > Revaluasi Asset, page:'revaluasiAsset'). Semua
   fungsi di file ini HANYA menyusun & mengembalikan markup HTML
   (string), TIDAK ada logic/DOM-binding/data mutation di sini.
   Logic-nya ada di file sebelah: revaluasi-asset.js

   Sesuai 2 screenshot MASERP 2026-08-26: list "Daftar Revaluasi
   Asset" (Total Record: 0 di instalasi Sidik sendiri, kolom No.
   Transaksi/Tanggal Revaluasi/Nama Aset/Keterangan/Jumlah Akhir/
   Ubah/Hapus, toolbar page-size 20 + "Pencarian Global" [BEDA
   dari placeholder "Global Search" milik Disposal Asset — dua
   quirk placeholder berbeda direproduksi apa adanya persis
   screenshot masing-masing], "Tidak Ada Data" ditampilkan bold
   di tengah tabel, pager First/Previous/Next/Last TANPA nomor
   halaman) & form "Revaluasi Asset" (No. Otomatis "REV01"/No.
   Transaksi+refresh/Tgl. Trn.+kalender/Tgl Mulai Susut+kalender/
   Keterangan, Cabang di pojok kanan atas, tab "Rincian
   Transaksi"/"Rincian Jurnal Akun" [KEDUANYA Indonesia — BEDA
   dari tab Disposal Asset yang tab ke-2-nya Inggris "Account
   Journal Details", quirk lain direproduksi apa adanya], tabel
   Kode Aset/Nama Aset/Jurnal/[header gabungan 2-baris]
   "Penambahan/Pengurangan Masa Susut" → Tahun/Bulan/Nominal,
   footer "Simpan"/"Batalkan" [KEDUANYA Indonesia — beda lagi
   dari footer Disposal Asset yang "Simpan"/"Cancel"]).

   Screenshot form TIDAK menampilkan tombol tambah baris item
   secara eksplisit (form contoh hanya berisi 1 baris kosong) —
   link "+ Tambah Baris" di bawah tabel adalah TAMBAHAN wajar
   supaya form ini tetap bisa merevaluasi >1 aset sekaligus,
   didokumentasikan sebagai inferensi (bukan bagian dari
   screenshot), pola sama "+ Tambah Baris Jurnal" di modal Jurnal
   Fixed Asset.

   Field "Tahun"/"Bulan" (Penambahan/Pengurangan Masa Susut)
   BERSIFAT INFORMASIONAL SAJA di mockup ini (tidak ada model
   data "skedul penyusutan per-aset" yang bisa diperpanjang per
   transaksi — Masa Susut aset ditentukan oleh Aturan Penyusutan
   yang dipakai BERSAMA banyak aset lain di DATA.aktivaTetapDeprRule,
   mengubahnya per-transaksi akan mengubah semua aset lain yang
   memakai Aturan yang sama). HANYA "Nominal" yang genuinely
   diterapkan — ditambahkan/dikurangkan ke `hargaBeli` aset
   terkait saat Simpan (mode Tambah), lihat catatan besar di
   revaluasi-asset.js. Simplifikasi ini didokumentasikan eksplisit,
   bukan bug. */

const REV_CABANG_LIST = ['Head Office','Surabaya','Bandung','Tangerang','Medan','Makassar','Semarang','Sidoarjo'];
const REV_CABANG_CODE = {'Head Office':'HO','Surabaya':'SBY','Bandung':'BDG','Tangerang':'TGR','Medan':'MDN','Makassar':'MKS','Semarang':'SMG','Sidoarjo':'SDA'};

function tplRevListPage(){
  return `
    <div class="breadcrumb">Home / <b>Daftar Revaluasi Asset</b></div>
    <div class="card">
      <div class="card-header dark-header">
        <h3>${icon('dollar',15)} Daftar Revaluasi Asset</h3>
        <div class="toolbar-actions">
          <button class="chip-btn" id="btnRevPeriode">Agustus 2026 ${icon('chevronDown',12)}</button>
          <button class="btn-primary" id="btnRevAdd">${icon('plus',14)} Tambah</button>
        </div>
      </div>
      <div class="table-toolbar">
        <select id="revPageSize"><option>10</option><option selected>20</option><option>50</option></select>
        <input type="text" id="revSearch" placeholder="Pencarian Global">
      </div>
      <div class="table-wrap"><table>
        <thead><tr>
          <th>No. Transaksi</th>
          <th>Tanggal Revaluasi</th>
          <th>Nama Aset</th>
          <th>Keterangan</th>
          <th class="text-right">Jumlah Akhir</th>
          <th style="width:70px;">Ubah</th>
          <th style="width:70px;">Hapus</th>
        </tr></thead>
        <tbody id="revTbody"></tbody>
      </table></div>
      <div class="table-footer"><div class="pager" id="revPager"></div><div id="revTotal"></div></div>
    </div>`;
}

function tplRevRows(rows){
  if(!rows.length) return `<tr><td colspan="7" style="color:var(--text-light);text-align:center;font-weight:600;">Tidak Ada Data</td></tr>`;
  return rows.map((r) => {
    const idx = DATA.revaluasiAsset.indexOf(r);
    return `
    <tr>
      <td><a href="#" class="row-link" data-edit="${idx}" style="color:var(--blue);font-weight:600;">${r.noTransaksi}</a></td>
      <td>${r.tglTrn}</td>
      <td>${revRowNamaAset(r)}</td>
      <td>${r.keterangan||'-'}</td>
      <td class="text-right">${revNum2(revRowJumlahAkhir(r))}</td>
      <td><button class="icon-btn edit" data-edit="${idx}" title="Ubah">${icon('edit',15)}</button></td>
      <td><button class="icon-btn del" data-del="${idx}" title="Hapus">${icon('trash',15)}</button></td>
    </tr>`;
  }).join('');
}

function tplRevPager(page, totalPages){
  return `
    <button data-revpage="1" ${page<=1?'disabled':''}>First</button>
    <button data-revpage="${Math.max(1,page-1)}" ${page<=1?'disabled':''}>Previous</button>
    <button data-revpage="${Math.min(totalPages,page+1)}" ${page>=totalPages?'disabled':''}>Next</button>
    <button data-revpage="${totalPages}" ${page>=totalPages?'disabled':''}>Last</button>`;
}

/* ---------- Form "Revaluasi Asset" ---------- */
function tplRevItemRow(item, idx){
  const asset = revAssetOf(item.kode);
  const jurnalOptions = DATA.jurnalFixedAsset.filter(j => j.tipe === 'Revaluasi');
  return `
    <tr data-revitem="${idx}">
      <td>
        <div class="input-with-btn">
          <input type="text" value="${item.kode||''}" readonly placeholder="Pilih Item">
          <button class="icon-btn edit" data-revaset-pick="${idx}" type="button">${icon('search',14)}</button>
        </div>
      </td>
      <td>${asset ? asset.nama : ''}</td>
      <td>
        <select data-revjurnal="${idx}">
          <option value="" ${!item.jurnalKode?'selected':''}>--- Pilih Jurnal ---</option>
          ${jurnalOptions.map(j=>`<option value="${j.kode}" ${item.jurnalKode===j.kode?'selected':''}>${j.keterangan}</option>`).join('')}
        </select>
      </td>
      <td><input type="number" data-revtahun="${idx}" value="${item.tahun||0}" style="text-align:right;"></td>
      <td><input type="number" data-revbulan="${idx}" value="${item.bulan||0}" style="text-align:right;"></td>
      <td><input type="number" data-revnominal="${idx}" value="${item.nominal||0}" style="text-align:right;"></td>
      <td><button class="icon-btn del" data-revitem-del="${idx}" type="button" title="Hapus">${icon('trash',15)}</button></td>
    </tr>`;
}

function tplRevItemsTable(row){
  const items = (row.items && row.items.length) ? row.items : [{kode:'',jurnalKode:'',tahun:0,bulan:0,nominal:0}];
  return `
    <div class="table-wrap"><table class="po-item-table">
      <thead>
        <tr>
          <th rowspan="2">Kode Aset</th>
          <th rowspan="2">Nama Aset</th>
          <th rowspan="2">Jurnal</th>
          <th colspan="3" style="text-align:center;">Penambahan/Pengurangan Masa Susut</th>
          <th rowspan="2"></th>
        </tr>
        <tr><th>Tahun</th><th>Bulan</th><th>Nominal</th></tr>
      </thead>
      <tbody id="revItemsBody">${items.map((it,i)=>tplRevItemRow(it,i)).join('')}</tbody>
    </table></div>
    <a href="#" class="link-add" id="btnRevItemAdd">${icon('plus',13)} Tambah Baris</a>`;
}

function tplRevDetailTab(row){
  return tplRevItemsTable(row);
}

function tplRevJurnalTab(row){
  const lines = revBuildJurnalLines(row);
  if(!lines.length){
    return `<p style="color:var(--text-light);padding:20px 0;">Pilih Jurnal & isi Nominal pada baris Rincian Transaksi terlebih dahulu untuk menampilkan rincian jurnal akun.</p>`;
  }
  const totalDebit = lines.reduce((s,l)=>s+l.debit,0);
  const totalKredit = lines.reduce((s,l)=>s+l.kredit,0);
  const selisih = Math.abs(totalDebit-totalKredit);
  return `
    <div class="table-wrap"><table class="po-item-table">
      <thead><tr><th>Kode Akun</th><th>Nama Akun</th><th>Keterangan</th><th class="text-right">Jumlah Debit</th><th class="text-right">Jumlah Kredit</th></tr></thead>
      <tbody>
        ${lines.map(l=>`<tr><td>${l.akun||'-'}</td><td>${revAkunNamaOf(l.akun)}</td><td>${l.ket}</td><td class="text-right">${revNum2(l.debit)}</td><td class="text-right">${revNum2(l.kredit)}</td></tr>`).join('')}
      </tbody>
      <tfoot><tr style="font-weight:700;">
        <td colspan="3" class="text-right">Jumlah Debit - Kredit</td>
        <td class="text-right">${revNum2(totalDebit)}</td>
        <td class="text-right" style="${selisih>0.5?'color:var(--red);':''}">${revNum2(totalKredit)}</td>
      </tr></tfoot>
    </table></div>`;
}

function tplRevForm(mode, row){
  const isEdit = mode === 'edit';
  return `
    <div class="breadcrumb">Home / Daftar Revaluasi Asset / <b>${isEdit?'Ubah':'Tambah'}</b></div>
    <div class="card">
      <div class="card-header dark-header">
        <h3>${icon(isEdit?'edit':'plus',15)} Revaluasi Asset</h3>
      </div>
      <div class="card-body">
        <div style="display:flex;justify-content:flex-end;margin-bottom:14px;">
          <div class="form-group" style="width:260px;margin-bottom:0;">
            <label>Cabang</label>
            <select id="fRevCabang">${REV_CABANG_LIST.map(c=>`<option ${row.cabang===c?'selected':''}>${c}</option>`).join('')}</select>
          </div>
        </div>
        <h2 style="font-size:19px;font-weight:600;color:var(--navy);margin:0 0 16px;padding-bottom:14px;border-bottom:1px solid var(--border);">Revaluasi Asset</h2>
        <div class="grid-2" style="gap:20px;">
          <div class="form-group">
            <label>No. Otomatis</label>
            <select id="fRevAutoNumber" disabled><option selected>REV01</option></select>
          </div>
          <div class="form-group">
            <label>No. Transaksi</label>
            <div class="input-with-btn">
              <input type="text" id="fRevNoTransaksi" value="${row.noTransaksi||''}" readonly>
              <button class="icon-btn edit" id="btnRevRefreshNo" type="button">${icon('refreshCw',14)}</button>
            </div>
          </div>
          <div class="form-group">
            <label>Tgl. Trn.</label>
            <div class="input-with-btn"><input type="text" id="fRevTglTrn" value="${row.tglTrn||''}" placeholder="dd/mm/yyyy"><button class="icon-btn edit" type="button">${icon('calendar',14)}</button></div>
          </div>
          <div class="form-group">
            <label>Tgl Mulai Susut</label>
            <div class="input-with-btn"><input type="text" id="fRevTglMulaiSusut" value="${row.tglMulaiSusut||''}" placeholder="dd/mm/yyyy"><button class="icon-btn edit" type="button">${icon('calendar',14)}</button></div>
          </div>
          <div class="form-group" style="grid-column:1 / -1;">
            <label>Keterangan</label>
            <textarea id="fRevKeterangan" class="po-textarea" rows="3">${row.keterangan||''}</textarea>
          </div>
        </div>
        <div class="inv-tabs">
          <button type="button" class="inv-tab-btn active" id="revTabDetailBtn">Rincian Transaksi</button>
          <button type="button" class="inv-tab-btn" id="revTabJurnalBtn">Rincian Jurnal Akun</button>
        </div>
        <div id="revTabDetailContent">${tplRevDetailTab(row)}</div>
        <div id="revTabJurnalContent" style="display:none;">${tplRevJurnalTab(row)}</div>
        <div class="form-error" id="fRevErr"></div>
        <div class="form-page-actions">
          <button class="btn-secondary" id="btnRevCancel">Batalkan</button>
          <button class="btn-primary" id="btnRevSave">Simpan</button>
        </div>
      </div>
    </div>`;
}

/* Picker "Pilih Item" — hanya menampilkan aset yang belum
   di-disposal (`!a.disposalNo` — aset yang sudah dihapus-bukukan
   tidak masuk akal direvaluasi lagi) & belum dipakai baris item
   lain di transaksi yang sedang diedit. */
function tplRevAsetPicker(list){
  if(!list.length) return `
    <div class="modal-box" style="max-width:560px;">
      <div class="modal-header"><span>Pilih Item</span><span class="close" id="pickerClose">&times;</span></div>
      <div class="modal-body"><p style="color:var(--text-light);">Tidak ada aset yang bisa dipilih (semua aset sudah di-disposal atau sudah dipakai baris lain).</p></div>
      <div class="modal-footer"><button class="btn-secondary" id="pickerCancel">Tutup</button></div>
    </div>`;
  return `
    <div class="modal-box" style="max-width:640px;">
      <div class="modal-header"><span>Pilih Item</span><span class="close" id="pickerClose">&times;</span></div>
      <div class="modal-body">
        <input type="text" id="revAsetPickerSearch" placeholder="Cari kode / nama aset..." style="width:100%;border:1px solid var(--border);border-radius:6px;padding:8px 10px;font-size:12.8px;margin-bottom:12px;">
        <div class="table-wrap" style="max-height:360px;overflow:auto;">
          <table>
            <thead><tr><th>Kode Aset</th><th>Nama Aset</th><th>Cabang</th><th></th></tr></thead>
            <tbody id="revAsetPickerBody">${tplRevAsetPickerRows(list)}</tbody>
          </table>
        </div>
      </div>
      <div class="modal-footer"><button class="btn-secondary" id="pickerCancel">Tutup</button></div>
    </div>`;
}

function tplRevAsetPickerRows(list){
  if(!list.length) return `<tr><td colspan="4" style="color:var(--text-light);">Tidak ada aset ditemukan</td></tr>`;
  return list.map(a=>`
    <tr>
      <td>${a.kode}</td>
      <td>${a.nama}</td>
      <td>${a.cabang}</td>
      <td><button class="btn-pick" data-pick-aset="${a.kode}">Pilih</button></td>
    </tr>`).join('');
}

function tplRevDeleteConfirm(row){
  return `
    <div class="modal-box">
      <div class="modal-header"><span>Hapus Revaluasi Asset</span><span class="close" id="modalClose">&times;</span></div>
      <div class="modal-body"><p>Yakin ingin menghapus transaksi <b>${row.noTransaksi}</b>? Nilai Harga Beli Aset yang sudah ditambah/dikurangi lewat transaksi ini akan dikembalikan ke nilai semula.</p></div>
      <div class="modal-footer">
        <button class="btn-secondary" id="modalCancel">Batal</button>
        <button class="btn-danger" id="modalDelete">Hapus</button>
      </div>
    </div>`;
}

function tplRevInfoModal(title, text){
  return `
    <div class="modal-box">
      <div class="modal-header"><span>${title}</span><span class="close" id="modalClose">&times;</span></div>
      <div class="modal-body"><p>${text}</p></div>
      <div class="modal-footer"><button class="btn-primary" id="modalOk">Tutup</button></div>
    </div>`;
}
