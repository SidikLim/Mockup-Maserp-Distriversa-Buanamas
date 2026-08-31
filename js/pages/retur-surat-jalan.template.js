/* =========================================================
   TEMPLATE (HTML saja) — Retur Surat Jalan (Customer & Penjualan >
   Daftar Transaksi > Retur Surat Jalan, key page:'returSuratJalan').
   Semua fungsi di file ini HANYA menyusun & mengembalikan markup
   HTML (string) atau helper murni, TIDAK ada DOM-binding/data
   mutation di sini. Logic-nya ada di file sebelah:
   retur-surat-jalan.js

   Sesuai 3 screenshot MASERP yang dikirim user:
   1) "Daftar Retur SJ": filter chip All + periode Agustus 2026 +
      tombol +Tambah; kolom No. RSJ (link biru -> Lihat) / No. SJ /
      No. S.O. / Tgl. RSJ / Customer / Tgl. Print + aksi Lihat /
      Ubah / Hapus; page size default 5.
   2) Form "+ Retur Surat Jalan" tab "Detail Transaksi": heading
      kiri; No. SJ (readonly + cari — picker dari DATA.invoices,
      surat jalan sungguhan di mockup) / Cabang; No. S.O. / Tgl.
      S.O. (keduanya readonly, ikut SJ terpilih) / Salesman
      (dropdown DATA.salesman); No. Retur SJ (+refresh) / Tgl. RSJ /
      Customer (readonly + teks kecil "Kode Lama Customer: {kode}");
      No. SP (readonly) / Alamat Pengiriman. Tabel item per BATCH:
      Gudang (kode cabang) / Kode Barang / Nama Barang / Satuan /
      Batch Number / Qty SJ Batch (readonly) / Tgl Expired /
      Qty Retur Batch (editable, maks qty SJ) / Tukar Batch
      (checkbox) / Batch Number Baru (aktif hanya saat Tukar Batch
      dicentang). Di bawah tab: Alasan Tipe (dropdown) + Alasan
      (dropdown pelengkap, dekoratif) + textarea Alasan yang
      OTOMATIS terisi kalimat baku sesuai Alasan Tipe (teks
      screenshot "Salah Nilai/Amount Diskon/DPL Sudah Tidak
      Berlaku" utk tipe "Kesalahan DPF/L").
   3) Tab "Rincian Jurnal Akun": radio Jurnal Otomatis/Manual +
      tombol "Buat Jurnal" (kolom: Kode Akun / Cost Center / Nama
      Akun / Keterangan / Debit / Kredit — ADA Cost Center seperti
      Transaksi A.P.). Jurnal otomatis retur SJ: Persediaan Barang
      1130001(D) = HPP Barang Dagang 5110001(K) senilai nilai
      barang yang diretur (qty retur x HNA barang dari master
      DATA.items — barang kembali masuk stok, membalik jurnal HPP
      pengiriman).
   Footer: Simpan + Batalkan. Dokumen bisa di-Ubah (beda dari
   Retur Pembelian yang final) — sesuai kolom Ubah di screenshot.
   Data list dari DATA.returSuratJalan (3 baris sample menaut ke
   invoice/SJ sungguhan mockup; data screenshot milik instalasi
   lain/AAA-Yogyakarta, tidak direplikasi). */

const RSJ_CABANG_LIST = ['Head Office','Surabaya','Bandung','Medan','Makassar','Semarang','Tangerang','Sidoarjo'];
const RSJ_CABANG_CODE = {'Head Office':'HO','Surabaya':'SBY','Bandung':'BDG','Medan':'MDN','Makassar':'MKS','Semarang':'SMG','Tangerang':'TGR','Sidoarjo':'SDA'};
/* Kalimat baku textarea Alasan per Alasan Tipe — baris pertama
   direproduksi persis dari screenshot. */
const RSJ_ALASAN_TIPE = {
  'Kesalahan DPF/L':'Salah Nilai/Amount Diskon/DPL Sudah Tidak Berlaku',
  'Kesalahan Kirim':'Salah Kirim Barang/Salah Alamat Pengiriman',
  'Barang Rusak':'Barang Diterima Customer Dalam Kondisi Rusak',
  'Mendekati ED':'Barang Mendekati/Melewati Tanggal Kadaluarsa',
  'Batal Beli':'Customer Membatalkan Pembelian',
};

function rsjNum2(n){ return Number(n||0).toLocaleString('id-ID', {minimumFractionDigits:2, maximumFractionDigits:2}); }
function rsjAkunNama(kode){ const a = DATA.akunGL.find(x => x.kode === kode); return a ? a.nama : ''; }

/* =====================================================================
   LIST PAGE — "Daftar Retur SJ"
===================================================================== */
function tplReturSuratJalanListPage(){
  return `
    <div class="breadcrumb">Home / Customer &amp; Penjualan / <b>Retur Surat Jalan</b></div>
    <div class="card">
      <div class="card-header dark-header">
        <h3>${icon('alertTriangle',15)} Daftar Retur SJ</h3>
        <div class="toolbar-actions">
          <select class="chip-btn" id="rsjFilterStatus"><option>All</option></select>
          <select class="chip-btn" id="rsjFilterBulan"><option>Agustus 2026</option><option>Juli 2026</option></select>
          <button class="btn-primary" id="btnRsjAdd">${icon('plus',14)} Tambah</button>
        </div>
      </div>
      <div class="table-toolbar">
        <select id="rsjPageSize"><option selected>5</option><option>10</option><option>25</option></select>
        <input type="text" id="rsjSearch" placeholder="Global Search">
      </div>
      <div class="table-wrap"><table>
        <thead><tr>
          <th style="width:170px;">No. RSJ</th>
          <th style="width:170px;">No. SJ</th>
          <th style="width:170px;">No. S.O.</th>
          <th style="width:100px;">Tgl. RSJ</th>
          <th>Customer</th>
          <th style="width:90px;">Tgl. Print</th>
          <th style="width:70px;">Lihat</th>
          <th style="width:70px;">Ubah</th>
          <th style="width:70px;">Hapus</th>
        </tr></thead>
        <tbody id="rsjTbody"></tbody>
      </table></div>
      <div class="table-footer"><div class="pager"><button>First</button><button>Previous</button><button class="active">1</button><button>Next</button><button>Last</button></div><div id="rsjTotal"></div></div>
    </div>`;
}

function tplRsjRows(rows){
  if(!rows.length) return `<tr><td colspan="9" style="color:var(--text-light);padding:14px;">Tidak ada Retur SJ yang cocok dengan pencarian.</td></tr>`;
  return rows.map((r,i)=>`
    <tr>
      <td><button class="link-pick" data-view-link="${i}">${r.no}</button></td>
      <td>${r.noSJ||''}</td>
      <td>${r.noSO||''}</td>
      <td>${r.tglRSJ||''}</td>
      <td>${(r.customer||'').toUpperCase()}</td>
      <td>${r.tglPrint||''}</td>
      <td><button class="icon-btn view" data-view="${i}" title="Lihat">${icon('eye',15)}</button></td>
      <td><button class="icon-btn edit" data-edit="${i}" title="Ubah">${icon('edit',15)}</button></td>
      <td><button class="icon-btn del" data-del="${i}" title="Hapus">${icon('trash',15)}</button></td>
    </tr>`).join('');
}

/* =====================================================================
   FORM (full page) — header + tab Detail Transaksi / Rincian Jurnal
   Akun + blok Alasan bersama (di bawah kedua tab, sesuai screenshot)
===================================================================== */
function tplRsjForm(mode, row){
  const isAdd = mode === 'add';
  const isView = mode === 'view';
  const dis = isView ? 'disabled' : '';
  const titleAction = isAdd ? 'Tambah' : (isView ? 'Lihat' : 'Ubah');
  return `
    <div class="breadcrumb">Home / Retur Surat Jalan / <b>${titleAction}</b></div>
    <div class="card">
      <div class="card-header dark-header">
        <h3>${icon('plus',15)} Retur Surat Jalan</h3>
        <button class="btn-danger" id="btnRsjTutorial">${icon('card',14)} Tutorial</button>
      </div>
      <div class="card-body">
        <div class="form-grid-3" style="grid-template-columns:repeat(3,1fr);align-items:end;">
          <h2 style="font-size:20px;font-weight:700;color:var(--navy);margin:0 0 10px;padding-bottom:10px;border-bottom:1px solid var(--border);">Retur Surat Jalan</h2>
          <div class="form-group">
            <label>No. SJ</label>
            <div class="input-with-btn">
              <input type="text" id="fRsjNoSJ" value="${row.noSJ||''}" placeholder="Pilih Surat Jalan" readonly>
              ${!isView ? `<button type="button" class="icon-btn edit" id="rsjSjSearch" title="Cari Surat Jalan">${icon('search',13)}</button>` : ''}
            </div>
          </div>
          <div class="form-group">
            <label>Cabang</label>
            <select id="fRsjCabang" disabled>${RSJ_CABANG_LIST.map(c=>`<option ${row.cabang===c?'selected':''}>${c}</option>`).join('')}</select>
          </div>
        </div>

        <div class="form-grid-3" style="grid-template-columns:repeat(3,1fr);">
          <div class="form-group">
            <label>No. S.O.</label>
            <input type="text" id="fRsjNoSO" value="${row.noSO||''}" readonly>
          </div>
          <div class="form-group">
            <label>Tgl. S.O.</label>
            <input type="text" id="fRsjTglSO" value="${row.tglSO||''}" readonly>
          </div>
          <div class="form-group">
            <label>Salesman</label>
            <select id="fRsjSalesman" ${dis}>${DATA.salesman.map(sm=>`<option ${row.salesman===sm.nama?'selected':''}>${sm.nama}</option>`).join('')}</select>
          </div>
        </div>

        <div class="form-grid-3" style="grid-template-columns:repeat(3,1fr);">
          <div class="form-group">
            <label>No. Retur SJ</label>
            <div class="input-with-btn">
              <input type="text" id="fRsjNo" value="${row.no||''}" readonly>
              ${isAdd ? `<button type="button" class="icon-btn edit" id="rsjRefreshNo" title="Generate Ulang Nomor">${icon('refreshCw',13)}</button>` : ''}
            </div>
          </div>
          <div class="form-group">
            <label>Tgl. RSJ</label>
            <div class="input-with-btn">
              <input type="text" id="fRsjTglRSJ" value="${row.tglRSJ||''}" ${dis}>
              <span class="icon-btn edit" style="pointer-events:none;">${icon('calendar',13)}</span>
            </div>
          </div>
          <div class="form-group">
            <label>Customer</label>
            <input type="text" id="fRsjCustomer" value="${(row.customer||'').toUpperCase()}" readonly>
            <div id="fRsjKodeLama" style="font-size:11.5px;color:var(--blue);margin-top:4px;">${row.customerKode ? 'Kode Lama Customer: ' + row.customerKode : ''}</div>
          </div>
        </div>

        <div class="form-grid-3" style="grid-template-columns:repeat(3,1fr);">
          <div class="form-group">
            <label>No. SP</label>
            <input type="text" id="fRsjNoSP" value="${row.noSP||''}" readonly>
          </div>
          <div class="form-group" style="grid-column:2 / span 2;">
            <label>Alamat Pengiriman</label>
            <textarea id="fRsjAlamat" class="po-textarea" rows="3" ${dis}>${row.alamatPengiriman||''}</textarea>
          </div>
        </div>

        <div class="inv-tabs">
          <button type="button" class="inv-tab-btn active" id="rsjTabDetailBtn">Detail Transaksi</button>
          <button type="button" class="inv-tab-btn" id="rsjTabJurnalBtn">Rincian Jurnal Akun</button>
        </div>

        <div id="rsjTabDetailContent">${tplRsjDetailTab(row, isView)}</div>
        <div id="rsjTabJurnalContent" style="display:none;">${tplRsjJurnalContent(row, isView)}</div>

        <div class="form-grid-3" style="grid-template-columns:repeat(3,1fr);margin-top:22px;">
          <div class="form-group">
            <label>Alasan Tipe</label>
            <select id="fRsjAlasanTipe" ${dis}>${Object.keys(RSJ_ALASAN_TIPE).map(t=>`<option ${row.alasanTipe===t?'selected':''}>${t}</option>`).join('')}</select>
          </div>
          <div class="form-group">
            <label>Alasan</label>
            <select id="fRsjAlasanSub" ${dis}><option value=""></option><option ${row.alasanSub==='Retur Sebagian'?'selected':''}>Retur Sebagian</option><option ${row.alasanSub==='Retur Semua'?'selected':''}>Retur Semua</option></select>
          </div>
        </div>
        <div class="form-group" style="max-width:760px;">
          <label>Alasan</label>
          <textarea id="fRsjAlasanText" class="po-textarea" rows="2" ${dis}>${row.alasanText||''}</textarea>
        </div>
      </div>
      <div class="card-footer" style="display:flex;gap:10px;justify-content:flex-end;align-items:center;padding:14px 20px;border-top:1px solid var(--border);">
        ${!isView ? `<button type="button" class="btn-primary" id="rsjSimpan">Simpan</button>` : ''}
        <a href="#" id="rsjBatalkan" class="link-add" style="margin-top:0;">${isView?'Tutup':'Batalkan'}</a>
      </div>
    </div>`;
}

/* ===== Tab 1 — Detail Transaksi (1 baris per batch barang SJ) ===== */
function tplRsjDetailTab(row, isView){
  return `
    <div class="table-wrap" style="margin:10px 0 0;">
      <table class="po-item-table">
        <thead><tr>
          <th style="width:30px;"></th>
          <th>Gudang</th>
          <th>Kode Barang</th>
          <th>Nama Barang</th>
          <th>Satuan</th>
          <th>Batch Number</th>
          <th class="text-right">Qty SJ Batch</th>
          <th>Tgl Expired</th>
          <th class="text-right">Qty Retur Batch</th>
          <th>Tukar Batch</th>
          <th>Batch Number Baru</th>
        </tr></thead>
        <tbody id="rsjItemsBody">${tplRsjItemRows(row.items, isView)}</tbody>
      </table>
    </div>
    <div id="rsjItemsEmptyHint" style="font-size:11.5px;color:var(--text-light);margin-top:6px;${(row.items&&row.items.length)?'display:none;':''}">Belum ada barang — pilih Surat Jalan terlebih dahulu (tombol cari di field No. SJ), barang SJ itu akan tampil di sini per batch.</div>`;
}

function tplRsjItemRows(items, isView){
  if(!items || !items.length) return `<tr><td colspan="11" style="color:var(--text-light);">Belum ada barang yang diretur.</td></tr>`;
  const dis = isView ? 'disabled' : '';
  return items.map((it,idx)=>`
    <tr>
      <td style="text-align:center;color:var(--text-light);cursor:grab;">&#10021;</td>
      <td style="width:70px;">${it.gudang||''}</td>
      <td style="width:100px;">${it.kode||''}</td>
      <td style="min-width:220px;">${it.nama||''}</td>
      <td style="width:70px;">${it.satuan||''}</td>
      <td style="width:120px;"><input type="text" data-rsj-batch="${idx}" value="${it.batch||''}" ${dis}></td>
      <td style="width:100px;"><input type="text" value="${it.qtySJ||0}" readonly style="text-align:right;"></td>
      <td style="width:110px;"><input type="text" data-rsj-ed="${idx}" value="${it.ed||''}" ${dis}></td>
      <td style="width:110px;"><input type="number" min="0" data-rsj-qty="${idx}" value="${it.qtyRetur||0}" style="text-align:right;" ${dis}></td>
      <td style="width:80px;text-align:center;"><input type="checkbox" data-rsj-tukar="${idx}" ${it.tukarBatch?'checked':''} ${dis}></td>
      <td style="width:130px;"><input type="text" data-rsj-batchbaru="${idx}" value="${it.batchBaru||''}" ${(it.tukarBatch && !isView)?'':'disabled'}></td>
    </tr>`).join('');
}

/* ===== Tab 2 — Rincian Jurnal Akun (pola Transaksi A.P.: radio
   Otomatis/Manual + Buat Jurnal + kolom Cost Center) ===== */
function tplRsjJurnalContent(row, isView){
  const isManual = row.jurnalMode === 'manual';
  const totals = rsjJurnalTotals(row);
  const selisihColor = Math.abs(totals.selisih) > 0.004 ? 'var(--red)' : 'var(--text)';
  return `
    <div style="display:flex;align-items:center;justify-content:space-between;gap:12px;margin:14px 0;flex-wrap:wrap;">
      <div class="radio-inline" style="padding-top:0;">
        <label><input type="radio" name="rsjJurnalMode" id="rsjJurnalOtomatis" value="otomatis" ${!isManual?'checked':''} ${isView?'disabled':''}> Jurnal Otomatis</label>
        <label><input type="radio" name="rsjJurnalMode" id="rsjJurnalManual" value="manual" ${isManual?'checked':''} ${isView?'disabled':''}> Jurnal Manual</label>
      </div>
      ${!isView ? `<button type="button" class="btn-secondary" id="rsjBuatJurnal">${icon('refreshCw',13)} Buat Jurnal</button>` : ''}
      <div style="min-width:120px;"></div>
    </div>
    <div class="table-wrap">
      <table class="po-item-table">
        <thead><tr>
          <th>Kode Akun</th><th>Cost Center</th><th>Nama Akun</th><th>Keterangan</th><th class="text-right">Jumlah Debit</th><th class="text-right">Jumlah Kredit</th>${(isManual && !isView)?'<th>Hapus</th>':''}
        </tr></thead>
        <tbody id="rsjJurnalBody">${tplRsjJurnalRows(row.jurnalAkun, isManual && !isView)}</tbody>
      </table>
    </div>
    ${(isManual && !isView) ? `<a href="#" id="rsjJurnalAddRow" class="link-add">${icon('plus',12)} Tambah Akun Baru</a>` : ''}
    <div style="max-width:280px;margin:16px 0 0 auto;">
      <div style="font-size:12.5px;font-weight:600;color:var(--text);margin-bottom:4px;">Jumlah Debit - Kredit</div>
      <input type="text" id="rsjJurnalSelisih" value="${rsjNum2(totals.selisih)}" readonly style="text-align:right;font-weight:700;color:${selisihColor};">
    </div>`;
}

function tplRsjJurnalRows(list, isManual){
  if(!list || !list.length) return `<tr><td colspan="${isManual?7:6}" style="color:var(--text-light);">Belum ada rincian jurnal — klik "Buat Jurnal".</td></tr>`;
  return list.map((entry,idx)=>{
    const ccOptions = `<option value=""></option>` + DATA.costCenter.map(c=>`<option value="${c.kode}" ${entry.costCenter===c.kode?'selected':''}>${c.kode} - ${c.nama}</option>`).join('');
    if(isManual){
      return `
      <tr data-rsj-jurnal-row="${idx}">
        <td style="min-width:110px;">
          <div class="input-with-btn">
            <input type="text" data-rsj-jurnal-kode="${idx}" value="${entry.kodeAkun||''}" readonly>
            <button type="button" class="icon-btn edit" data-rsj-jurnal-akun-search="${idx}" title="Cari Akun GL">${icon('search',12)}</button>
          </div>
        </td>
        <td style="min-width:160px;"><select data-rsj-jurnal-cc="${idx}">${ccOptions}</select></td>
        <td style="min-width:160px;"><input type="text" data-rsj-jurnal-nama="${idx}" value="${entry.namaAkun||''}" readonly></td>
        <td style="min-width:150px;"><input type="text" data-rsj-jurnal-ket="${idx}" value="${entry.keterangan||''}"></td>
        <td style="width:140px;"><input type="number" step="0.01" min="0" data-rsj-jurnal-debit="${idx}" value="${entry.debit||0}" style="text-align:right;"></td>
        <td style="width:140px;"><input type="number" step="0.01" min="0" data-rsj-jurnal-kredit="${idx}" value="${entry.kredit||0}" style="text-align:right;"></td>
        <td style="width:50px;"><button type="button" class="icon-btn del" data-rsj-jurnal-del="${idx}" title="Hapus Baris">${icon('trash',14)}</button></td>
      </tr>`;
    }
    const cc = DATA.costCenter.find(c=>c.kode===entry.costCenter);
    return `
    <tr>
      <td style="min-width:110px;"><input type="text" value="${entry.kodeAkun||''}" readonly></td>
      <td style="min-width:140px;"><input type="text" value="${cc ? (cc.kode+' - '+cc.nama) : ''}" readonly></td>
      <td style="min-width:160px;"><input type="text" value="${entry.namaAkun||''}" readonly></td>
      <td style="min-width:150px;"><input type="text" value="${entry.keterangan||''}" readonly></td>
      <td style="width:140px;"><input type="text" value="${rsjNum2(entry.debit||0)}" readonly style="text-align:right;"></td>
      <td style="width:140px;"><input type="text" value="${rsjNum2(entry.kredit||0)}" readonly style="text-align:right;"></td>
    </tr>`;
  }).join('');
}

/* Picker Surat Jalan — sumber DATA.invoices (tiap invoice mockup
   punya nomor SJ pasangannya di field noSJ). */
function tplRsjSjPicker(list){
  return `
    <div class="modal-box" style="max-width:760px;">
      <div class="modal-header"><span>Pilih Surat Jalan</span><span class="close" id="modalClose">&times;</span></div>
      <div class="modal-body">
        <input type="text" id="rsjSjPickerSearch" placeholder="Cari no. SJ / no. SO / customer..." style="width:100%;border:1px solid var(--border);border-radius:6px;padding:8px 10px;font-size:12.8px;margin-bottom:12px;">
        <div class="table-wrap" style="max-height:340px;overflow:auto;">
          <table>
            <thead><tr><th>No. SJ</th><th>No. S.O.</th><th>Tgl.</th><th>Customer</th><th>Cabang</th><th></th></tr></thead>
            <tbody id="rsjSjPickerBody">${tplRsjSjPickerRows(list)}</tbody>
          </table>
        </div>
      </div>
      <div class="modal-footer"><button class="btn-secondary" id="modalCancel">Tutup</button></div>
    </div>`;
}

function tplRsjSjPickerRows(list){
  if(!list.length) return `<tr><td colspan="6" style="color:var(--text-light);">Tidak ada Surat Jalan ditemukan</td></tr>`;
  return list.map(f=>`
    <tr>
      <td>${f.noSJ}</td>
      <td>${f.noSO||''}</td>
      <td>${f.tgl||''}</td>
      <td>${f.customerNama||''}</td>
      <td>${f.cabang||''}</td>
      <td><button class="btn-pick" data-pick-sj="${f.noSJ}">Pilih</button></td>
    </tr>`).join('');
}

/* Picker Akun GL utk baris jurnal manual — salinan lokal pola modul
   transaksi lain. */
function tplRsjAkunPicker(list){
  return `
    <div class="modal-box" style="max-width:640px;">
      <div class="modal-header"><span>Pilih Akun GL</span><span class="close" id="modalClose">&times;</span></div>
      <div class="modal-body">
        <input type="text" id="rsjAkunPickerSearch" placeholder="Cari kode / nama akun..." style="width:100%;border:1px solid var(--border);border-radius:6px;padding:8px 10px;font-size:12.8px;margin-bottom:12px;">
        <div class="table-wrap" style="max-height:360px;overflow:auto;">
          <table>
            <thead><tr><th>Kode</th><th>Nama Akun</th><th>Kat.</th><th></th></tr></thead>
            <tbody id="rsjAkunPickerBody">${tplRsjAkunPickerRows(list)}</tbody>
          </table>
        </div>
      </div>
      <div class="modal-footer"><button class="btn-secondary" id="modalCancel">Tutup</button></div>
    </div>`;
}

function tplRsjAkunPickerRows(list){
  if(!list.length) return `<tr><td colspan="4" style="color:var(--text-light);">Tidak ada akun ditemukan</td></tr>`;
  return list.map(a=>`
    <tr>
      <td>${a.kode}</td>
      <td>${a.nama}</td>
      <td>${a.kategori}</td>
      <td><button class="btn-pick" data-rsj-pick-akun="${a.kode}">Pilih</button></td>
    </tr>`).join('');
}

function tplRsjDeleteConfirm(row){
  return `
    <div class="modal-box">
      <div class="modal-header"><span>Hapus Retur SJ</span><span class="close" id="modalClose">&times;</span></div>
      <div class="modal-body"><p>Yakin ingin menghapus Retur Surat Jalan <b>${row.no}</b> — ${(row.customer||'').toUpperCase()}?</p></div>
      <div class="modal-footer">
        <button class="btn-secondary" id="modalCancel">Batal</button>
        <button class="btn-danger" id="modalDelete">Hapus</button>
      </div>
    </div>`;
}

function tplRsjInfoModal(title,text){
  return `
    <div class="modal-box">
      <div class="modal-header"><span>${title}</span><span class="close" id="modalClose">&times;</span></div>
      <div class="modal-body"><p>${text}</p></div>
      <div class="modal-footer"><button class="btn-primary" id="modalOk">Mengerti</button></div>
    </div>`;
}
