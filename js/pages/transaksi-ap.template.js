/* =========================================================
   TEMPLATE (HTML saja) — Transaksi A.P. (Supplier & Pembelian >
   Daftar Transaksi > Transaksi A.P., key page:'transaksiAP').
   Semua fungsi di file ini HANYA menyusun & mengembalikan markup
   HTML (string) atau helper murni, TIDAK ada DOM-binding/data
   mutation di sini. Logic-nya ada di file sebelah: transaksi-ap.js

   Sesuai 3 screenshot MASERP yang dikirim user:
   1) "Daftar AP. Transaksi" (judul list PERSIS screenshot, beda dari
      label menu "Transaksi A.P." — pola sama seperti Pelunasan Utang
      yang judul list-nya "Daftar Pembayaran Utang"): kolom No.
      Transaksi / Supplier / Tgl. Trn. / Keterangan / Jumlah + aksi
      Ubah / Lihat / Cetak / CetakG.L. / Hapus, dropdown filter
      "Semua" + tombol +Tambah di header, page size default 20.
   2) Form full page tab "Rincian Transaksi A.P.": heading kiri
      "Transaksi A.P.", Cabang di atas; Dari Supplier (picker) /
      Tgl. Trn. / Jurnal (dropdown dari master Jurnal A.P. yang baru
      dibuat — DATA.jurnalAP); No. Otomatis (dropdown AP{kode cabang})
      / No. Transaksi (+ tombol refresh) / No. Faktur (readonly +
      cari) / Keterangan; No. Faktur Supplier. Tab 1 berisi tabel
      rincian: Tipe Transaksi / Tgl. Jth. Tempo / Crc / Kurs /
      Nominal / Hapus + total Jumlah di kanan bawah.
   3) Form tab "Rincian Jurnal Akun": radio Jurnal Otomatis / Jurnal
      Manual + tombol "Buat Jurnal", tabel Kode Akun / Cost Center /
      Nama Akun / Keterangan / Jumlah Debit / Jumlah Kredit / Hapus
      + "Jumlah Debit - Kredit" di kanan bawah. Pola Otomatis/Manual
      disalin dari Pelunasan Utang (tplPuJurnalContent dkk) — bedanya
      di sini ada kolom Cost Center (dropdown DATA.costCenter) dan
      jurnal otomatis dibangun dari master Jurnal A.P. yang dipilih:
      akunDebit(D) = akunKredit(K) senilai total rincian transaksi.
   Footer form: Cetak dan Simpan (teal) / Simpan / Batalkan — sama
   persis susunan screenshot.

   No. Transaksi format screenshot "AP/HO/260800001" = AP/{kode
   cabang}/{YY}{MM}{urut 5 digit} — digenerate tapGenerateNo().
   TAP_CABANG_LIST/TAP_CABANG_CODE SALINAN LOKAL pola PU_CABANG_*
   di pelunasan-utang.template.js (bukan reuse cross-file, karena
   urutan lazy-load antar modul tidak terjamin).
========================================================= */

const TAP_CABANG_LIST = ['Head Office','Surabaya','Bandung','Medan','Makassar','Semarang','Tangerang','Sidoarjo'];
const TAP_CABANG_CODE = {'Head Office':'HO','Surabaya':'SBY','Bandung':'BDG','Medan':'MDN','Makassar':'MKS','Semarang':'SMG','Tangerang':'TGR','Sidoarjo':'SDA'};
const TAP_TIPE_TRANSAKSI_LIST = ['Hutang','Uang Muka','Nota Debet','Lain-lain'];

function tapNum2(n){ return Number(n||0).toLocaleString('id-ID', {minimumFractionDigits:2, maximumFractionDigits:2}); }
function tapAkunNama(kode){ const a = DATA.akunGL.find(x => x.kode === kode); return a ? a.nama : ''; }

/* =====================================================================
   LIST PAGE — "Daftar AP. Transaksi"
===================================================================== */
function tplTransaksiApListPage(){
  return `
    <div class="breadcrumb">Home / <b>Transaksi A.P.</b></div>
    <div class="card">
      <div class="card-header dark-header">
        <h3>${icon('alertTriangle',15)} Daftar AP. Transaksi</h3>
        <div class="toolbar-actions">
          <select class="chip-btn" id="tapFilter"><option>Semua</option><option>Bulan Ini</option><option>Bulan Lalu</option></select>
          <button class="btn-primary" id="btnTapAdd">${icon('plus',14)} Tambah</button>
        </div>
      </div>
      <div class="table-toolbar">
        <select id="tapPageSize"><option>10</option><option selected>20</option><option>50</option></select>
        <input type="text" id="tapSearch" placeholder="Pencarian Global">
      </div>
      <div class="table-wrap"><table>
        <thead><tr>
          <th>No. Transaksi</th>
          <th>Supplier</th>
          <th>Tgl. Trn.</th>
          <th>Keterangan</th>
          <th>Jumlah</th>
          <th>Ubah</th>
          <th>Lihat</th>
          <th>Cetak</th>
          <th>CetakG.L.</th>
          <th>Hapus</th>
        </tr></thead>
        <tbody id="tapTbody"></tbody>
      </table></div>
      <div class="table-footer"><div class="pager"><button>First</button><button>Previous</button><button class="active">1</button><button>Next</button><button>Last</button></div><div id="tapTotal"></div></div>
    </div>`;
}

function tplTapRows(rows){
  if(!rows.length) return `<tr><td colspan="10" style="text-align:center;font-weight:700;">Tidak Ada Data</td></tr>`;
  return rows.map((r,i)=>`
    <tr>
      <td><b style="color:var(--blue);">${r.no}</b></td>
      <td>${r.supplierNama||''}</td>
      <td>${r.tgl||''}</td>
      <td style="max-width:240px;"><div style="white-space:nowrap;overflow:hidden;text-overflow:ellipsis;" title="${r.keterangan||''}">${r.keterangan||''}</div></td>
      <td class="text-right" style="white-space:nowrap;">${tapNum2(r.jumlah)}</td>
      <td><button class="icon-btn edit" data-edit="${i}" title="Ubah">${icon('edit',15)}</button></td>
      <td><button class="icon-btn view" data-view="${i}" title="Lihat">${icon('eye',15)}</button></td>
      <td><button class="icon-btn print" data-print="${i}" title="Cetak">${icon('printer',15)}</button></td>
      <td><button class="icon-btn print" data-print-gl="${i}" title="Cetak G.L.">${icon('book',15)}</button></td>
      <td><button class="icon-btn del" data-del="${i}" title="Hapus">${icon('trash',15)}</button></td>
    </tr>`).join('');
}

/* =====================================================================
   FORM (full page) — header fields + 2 tab (Rincian Transaksi A.P. /
   Rincian Jurnal Akun)
===================================================================== */
function tplTapForm(mode, row){
  const isAdd = mode === 'add';
  const isView = mode === 'view';
  const dis = isView ? 'disabled' : '';
  const titleAction = isAdd ? 'Tambah' : (isView ? 'Lihat' : 'Ubah');
  const headerIcon = isAdd ? 'plus' : (isView ? 'eye' : 'edit');
  return `
    <div class="breadcrumb">Home / Transaksi A.P. / <b>${titleAction}</b></div>
    <div class="card">
      <div class="card-header dark-header">
        <h3>${icon(headerIcon,15)} Transaksi A.P.</h3>
        <button class="btn-danger" id="btnTapTutorial">${icon('card',14)} Tutorial</button>
      </div>
      <div class="card-body">
        <div style="display:flex;align-items:flex-start;justify-content:space-between;gap:16px;flex-wrap:wrap;">
          <h2 style="font-size:20px;font-weight:700;color:var(--navy);margin:0;padding-bottom:10px;border-bottom:1px solid var(--border);min-width:260px;">Transaksi A.P.</h2>
          <div class="form-group" style="max-width:260px;min-width:200px;margin-bottom:0;">
            <label>Cabang</label>
            <select id="fTapCabang" ${(!isAdd)?'disabled':dis}>${TAP_CABANG_LIST.map(c=>`<option ${row.cabang===c?'selected':''}>${c}</option>`).join('')}</select>
          </div>
          <div style="min-width:200px;"></div>
        </div>

        <div class="form-grid-3" style="margin-top:18px;grid-template-columns:repeat(3,1fr);">
          <div class="form-group">
            <label>Dari Supplier</label>
            <div class="input-with-btn">
              <input type="text" id="fTapSupplier" value="${row.supplierNama||''}" placeholder="Pilih Supplier" readonly>
              ${!isView ? `<button type="button" class="icon-btn edit" id="tapSupplierSearch" title="Cari Supplier">${icon('search',13)}</button>` : ''}
            </div>
          </div>
          <div class="form-group">
            <label>Tgl. Trn.</label>
            <div class="input-with-btn">
              <input type="text" id="fTapTgl" value="${row.tgl||''}" ${dis}>
              <span class="icon-btn edit" style="pointer-events:none;">${icon('calendar',13)}</span>
            </div>
          </div>
          <div class="form-group">
            <label>Jurnal</label>
            <select id="fTapJurnal" ${dis}>
              <option value="">-Pilih Jurnal-</option>
              ${DATA.jurnalAP.map(j=>`<option value="${j.kode}" ${row.jurnalKode===j.kode?'selected':''}>${j.nama}</option>`).join('')}
            </select>
          </div>
        </div>

        <div class="form-grid-3" style="grid-template-columns:repeat(4,1fr);">
          <div class="form-group">
            <label>No. Otomatis</label>
            <select id="fTapNoOtomatis" ${(!isAdd)?'disabled':dis}>${TAP_CABANG_LIST.map(c=>`<option value="${TAP_CABANG_CODE[c]}" ${row.cabang===c?'selected':''}>AP${TAP_CABANG_CODE[c]}</option>`).join('')}</select>
          </div>
          <div class="form-group">
            <label>No. Transaksi</label>
            <div class="input-with-btn">
              <input type="text" id="fTapNo" value="${row.no||''}" readonly>
              ${isAdd ? `<button type="button" class="icon-btn edit" id="tapRefreshNo" title="Generate Ulang Nomor">${icon('refreshCw',13)}</button>` : ''}
            </div>
          </div>
          <div class="form-group">
            <label>No. Faktur</label>
            <div class="input-with-btn">
              <input type="text" id="fTapNoFaktur" value="${row.noFaktur||''}" readonly>
              ${!isView ? `<button type="button" class="icon-btn edit" id="tapNoFakturSearch" title="Cari No. Faktur">${icon('search',13)}</button>` : ''}
            </div>
          </div>
          <div class="form-group">
            <label>Keterangan</label>
            <textarea id="fTapKeterangan" class="po-textarea" rows="3" ${dis}>${row.keterangan||''}</textarea>
          </div>
        </div>

        <div class="form-grid-3" style="grid-template-columns:repeat(3,1fr);">
          <div class="form-group">
            <label>No. Faktur Supplier</label>
            <input type="text" id="fTapNoFakturSupplier" value="${row.noFakturSupplier||''}" ${dis}>
          </div>
        </div>

        <div class="inv-tabs">
          <button type="button" class="inv-tab-btn active" id="tapTabRincianBtn">Rincian Transaksi A.P.</button>
          <button type="button" class="inv-tab-btn" id="tapTabJurnalBtn">Rincian Jurnal Akun</button>
        </div>

        <div id="tapTabRincianContent">${tplTapRincianTab(row, isView)}</div>
        <div id="tapTabJurnalContent" style="display:none;">${tplTapJurnalContent(row, isView)}</div>
      </div>
      <div class="card-footer" style="display:flex;gap:10px;justify-content:flex-end;align-items:center;padding:14px 20px;border-top:1px solid var(--border);">
        ${!isView ? `
          <button type="button" class="btn-teal" id="tapCetakSimpan">Cetak dan Simpan</button>
          <button type="button" class="btn-primary" id="tapSimpan">Simpan</button>
        ` : ''}
        <a href="#" id="tapBatalkan" class="link-add" style="margin-top:0;">${isView?'Tutup':'Batalkan'}</a>
      </div>
    </div>`;
}

/* ===== Tab 1 — Rincian Transaksi A.P. ===== */
function tplTapRincianTab(row, isView){
  return `
    <div class="card-header dark-header" style="border-radius:6px;">
      <h3>${icon('alertTriangle',14)} Rincian Transaksi A.P.</h3>
      ${!isView ? `<button type="button" class="btn-primary" id="tapRincianAdd">${icon('plus',13)} Tambah</button>` : ''}
    </div>
    <div class="table-wrap" style="margin:6px 0 0;">
      <table class="po-item-table">
        <thead><tr>
          <th>Tipe Transaksi</th>
          <th>Tgl. Jth. Tempo</th>
          <th>Crc</th>
          <th>Kurs</th>
          <th class="text-right">Nominal</th>
          <th>Hapus</th>
        </tr></thead>
        <tbody id="tapRincianBody">${tplTapRincianRows(row.rincian, isView)}</tbody>
      </table>
    </div>
    <div style="display:flex;justify-content:flex-end;margin-top:14px;">
      <div style="max-width:280px;width:100%;">
        <div class="form-group">
          <label>Jumlah</label>
          <input type="text" id="tapJumlah" value="${tapNum2(tapRecalcJumlah(row))}" readonly style="text-align:right;font-weight:700;">
        </div>
      </div>
    </div>`;
}

function tplTapRincianRows(list, isView){
  if(!list || !list.length) return `<tr><td colspan="6" style="color:var(--text-light);">Belum ada rincian — klik "+ Tambah" untuk menambah baris.</td></tr>`;
  const dis = isView ? 'disabled' : '';
  return list.map((it,idx)=>`
    <tr>
      <td style="min-width:150px;">
        <select data-tap-rincian-tipe="${idx}" ${dis}>${TAP_TIPE_TRANSAKSI_LIST.map(t=>`<option ${it.tipe===t?'selected':''}>${t}</option>`).join('')}</select>
      </td>
      <td style="min-width:120px;"><input type="text" data-tap-rincian-tempo="${idx}" value="${it.tglJthTempo||''}" ${dis}></td>
      <td style="width:90px;"><select data-tap-rincian-crc="${idx}" disabled><option>IDR</option></select></td>
      <td style="width:100px;"><input type="text" data-tap-rincian-kurs="${idx}" value="${tapNum2(it.kurs!=null?it.kurs:1)}" disabled></td>
      <td style="width:160px;"><input type="number" step="0.01" min="0" data-tap-rincian-nominal="${idx}" value="${it.nominal||0}" style="text-align:right;" ${dis}></td>
      <td style="width:60px;">${!isView ? `<button type="button" class="icon-btn del" data-tap-rincian-del="${idx}" title="Hapus Baris">${icon('trash',14)}</button>` : ''}</td>
    </tr>`).join('');
}

/* ===== Tab 2 — Rincian Jurnal Akun (pola Otomatis/Manual + "Buat
   Jurnal" disalin dari Pelunasan Utang, ditambah kolom Cost Center) ===== */
function tplTapJurnalContent(row, isView){
  const isManual = row.jurnalMode === 'manual';
  const totals = tapJurnalTotals(row);
  const selisihColor = Math.abs(totals.selisih) > 0.004 ? 'var(--red)' : 'var(--text)';
  return `
    <div style="display:flex;align-items:center;justify-content:space-between;gap:12px;margin:4px 0 14px;flex-wrap:wrap;">
      <div class="radio-inline" style="padding-top:0;">
        <label><input type="radio" name="tapJurnalMode" id="tapJurnalOtomatis" value="otomatis" ${!isManual?'checked':''} ${isView?'disabled':''}> Jurnal Otomatis</label>
        <label><input type="radio" name="tapJurnalMode" id="tapJurnalManual" value="manual" ${isManual?'checked':''} ${isView?'disabled':''}> Jurnal Manual</label>
      </div>
      ${!isView ? `<button type="button" class="btn-secondary" id="tapBuatJurnal">${icon('refreshCw',13)} Buat Jurnal</button>` : ''}
      <div style="min-width:120px;"></div>
    </div>
    <div class="card-header dark-header" style="border-radius:6px;">
      <h3>${icon('settings',14)} Rincian Jurnal Akun</h3>
      ${(!isView && isManual) ? `<button type="button" class="btn-primary" id="tapJurnalAddRow">${icon('plus',13)} Tambah</button>` : ''}
    </div>
    <div class="table-wrap" style="margin:6px 0 0;">
      <table class="po-item-table">
        <thead><tr>
          <th>Kode Akun</th><th>Cost Center</th><th>Nama Akun</th><th>Keterangan</th><th class="text-right">Jumlah Debit</th><th class="text-right">Jumlah Kredit</th><th>Hapus</th>
        </tr></thead>
        <tbody id="tapJurnalBody">${tplTapJurnalRows(row.jurnalAkun, isManual && !isView)}</tbody>
      </table>
    </div>
    <div style="max-width:280px;margin:16px 0 0 auto;">
      <div style="font-size:12.5px;font-weight:600;color:var(--text);margin-bottom:4px;">Jumlah Debit - Kredit</div>
      <input type="text" id="tapJurnalSelisih" value="${tapNum2(totals.selisih)}" readonly style="text-align:right;font-weight:700;color:${selisihColor};">
    </div>`;
}

function tplTapJurnalRows(list, isManual){
  if(!list || !list.length) return `<tr><td colspan="7" style="color:var(--text-light);">Belum ada rincian jurnal — pilih Jurnal lalu klik "Buat Jurnal".</td></tr>`;
  return list.map((entry,idx) => tplTapJurnalRow(entry, idx, isManual)).join('');
}

function tplTapJurnalRow(entry, idx, isManual){
  const ccOptions = `<option value=""></option>` + DATA.costCenter.map(c=>`<option value="${c.kode}" ${entry.costCenter===c.kode?'selected':''}>${c.kode} - ${c.nama}</option>`).join('');
  if(isManual){
    return `
    <tr data-tap-jurnal-row="${idx}">
      <td style="min-width:120px;">
        <div class="input-with-btn">
          <input type="text" data-tap-jurnal-kode="${idx}" value="${entry.kodeAkun||''}" readonly>
          <button type="button" class="icon-btn edit" data-tap-jurnal-akun-search="${idx}" title="Cari Akun GL">${icon('search',12)}</button>
        </div>
      </td>
      <td style="min-width:170px;"><select data-tap-jurnal-cc="${idx}">${ccOptions}</select></td>
      <td style="min-width:170px;"><input type="text" data-tap-jurnal-nama="${idx}" value="${entry.namaAkun||''}" readonly></td>
      <td style="min-width:160px;"><input type="text" data-tap-jurnal-ket="${idx}" value="${entry.keterangan||''}"></td>
      <td style="width:140px;"><input type="number" step="0.01" min="0" data-tap-jurnal-debit="${idx}" value="${entry.debit||0}" style="text-align:right;"></td>
      <td style="width:140px;"><input type="number" step="0.01" min="0" data-tap-jurnal-kredit="${idx}" value="${entry.kredit||0}" style="text-align:right;"></td>
      <td style="width:50px;"><button type="button" class="icon-btn del" data-tap-jurnal-del="${idx}" title="Hapus Baris">${icon('trash',14)}</button></td>
    </tr>`;
  }
  const cc = DATA.costCenter.find(c=>c.kode===entry.costCenter);
  return `
    <tr>
      <td style="min-width:120px;"><input type="text" value="${entry.kodeAkun||''}" readonly></td>
      <td style="min-width:150px;"><input type="text" value="${cc ? (cc.kode+' - '+cc.nama) : ''}" readonly></td>
      <td style="min-width:170px;"><input type="text" value="${entry.namaAkun||''}" readonly></td>
      <td style="min-width:160px;"><input type="text" value="${entry.keterangan||''}" readonly></td>
      <td style="width:140px;"><input type="text" value="${tapNum2(entry.debit||0)}" readonly style="text-align:right;"></td>
      <td style="width:140px;"><input type="text" value="${tapNum2(entry.kredit||0)}" readonly style="text-align:right;"></td>
      <td style="width:50px;"></td>
    </tr>`;
}

/* Picker Supplier — SALINAN LOKAL pola tplPoSupplierPicker() (Purchase
   Order) + kotak pencarian, sama seperti picker di Estimasi Hari
   Pengiriman. */
function tplTapSupplierPicker(list){
  return `
    <div class="modal-box" style="max-width:640px;">
      <div class="modal-header"><span>Pilih Supplier</span><span class="close" id="modalClose">&times;</span></div>
      <div class="modal-body">
        <input type="text" id="tapSupplierPickerSearch" placeholder="Cari kode / nama supplier..." style="width:100%;border:1px solid var(--border);border-radius:6px;padding:8px 10px;font-size:12.8px;margin-bottom:12px;">
        <div class="table-wrap" style="max-height:360px;overflow:auto;">
          <table>
            <thead><tr><th>Kode</th><th>Nama Supplier</th><th></th></tr></thead>
            <tbody id="tapSupplierPickerBody">${tplTapSupplierPickerRows(list)}</tbody>
          </table>
        </div>
      </div>
      <div class="modal-footer"><button class="btn-secondary" id="modalCancel">Tutup</button></div>
    </div>`;
}

function tplTapSupplierPickerRows(list){
  if(!list.length) return `<tr><td colspan="3" style="color:var(--text-light);">Tidak ada supplier ditemukan</td></tr>`;
  return list.map(s=>`
    <tr>
      <td>${s.kode}</td>
      <td>${s.nama}</td>
      <td><button class="btn-pick" data-pick-supplier="${s.kode}">Pilih</button></td>
    </tr>`).join('');
}

/* Picker Akun GL utk baris jurnal manual — salinan lokal pola
   tplPuAkunPicker() (Pelunasan Utang). */
function tplTapAkunPicker(list){
  return `
    <div class="modal-box" style="max-width:640px;">
      <div class="modal-header"><span>Pilih Akun GL</span><span class="close" id="modalClose">&times;</span></div>
      <div class="modal-body">
        <input type="text" id="tapAkunPickerSearch" placeholder="Cari kode / nama akun..." style="width:100%;border:1px solid var(--border);border-radius:6px;padding:8px 10px;font-size:12.8px;margin-bottom:12px;">
        <div class="table-wrap" style="max-height:360px;overflow:auto;">
          <table>
            <thead><tr><th>Kode</th><th>Nama Akun</th><th>Kat.</th><th></th></tr></thead>
            <tbody id="tapAkunPickerBody">${tplTapAkunPickerRows(list)}</tbody>
          </table>
        </div>
      </div>
      <div class="modal-footer"><button class="btn-secondary" id="modalCancel">Tutup</button></div>
    </div>`;
}

function tplTapAkunPickerRows(list){
  if(!list.length) return `<tr><td colspan="4" style="color:var(--text-light);">Tidak ada akun ditemukan</td></tr>`;
  return list.map(a=>`
    <tr>
      <td>${a.kode}</td>
      <td>${a.nama}</td>
      <td>${a.kategori}</td>
      <td><button class="btn-pick" data-tap-pick-akun="${a.kode}">Pilih</button></td>
    </tr>`).join('');
}

function tplTapDeleteConfirm(row){
  return `
    <div class="modal-box">
      <div class="modal-header"><span>Hapus Transaksi A.P.</span><span class="close" id="modalClose">&times;</span></div>
      <div class="modal-body"><p>Yakin ingin menghapus transaksi A.P. <b>${row.no}</b> — ${row.supplierNama||''} (${tapNum2(row.jumlah)})?</p></div>
      <div class="modal-footer">
        <button class="btn-secondary" id="modalCancel">Batal</button>
        <button class="btn-danger" id="modalDelete">Hapus</button>
      </div>
    </div>`;
}

function tplTapInfoModal(title,text){
  return `
    <div class="modal-box">
      <div class="modal-header"><span>${title}</span><span class="close" id="modalClose">&times;</span></div>
      <div class="modal-body"><p>${text}</p></div>
      <div class="modal-footer"><button class="btn-primary" id="modalOk">Mengerti</button></div>
    </div>`;
}
