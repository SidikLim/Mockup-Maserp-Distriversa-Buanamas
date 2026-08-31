/* =========================================================
   TEMPLATE (HTML saja) — Transaksi A.R. (Customer & Penjualan >
   Daftar Transaksi > Transaksi A.R., key page:'transaksiAR' —
   menu TERPISAH dari "Transaksi A.R. SSP" / penerimaanSsp yang
   sudah ada). Semua fungsi di file ini HANYA menyusun &
   mengembalikan markup HTML (string) atau helper murni, TIDAK
   ada DOM-binding/data mutation di sini. Logic-nya ada di file
   sebelah: transaksi-ar.js

   Sesuai 3 screenshot MASERP yang dikirim user — KEMBARAN modul
   Transaksi A.P. (transaksi-ap.*) untuk sisi piutang, dengan
   beda-beda ini:
   - List "Daftar Transaksi A.R.": ada kolom Customer + No Faktur,
     filter chip periode "Agustus 2026", kolom Jumlah tampil MERAH
     dalam kurung untuk nilai negatif (dokumen sample screenshot
     semuanya Nota Kredit — mengurangi piutang, jadi minus).
   - Form: Dari Customer (picker DATA.customers), Jurnal dropdown
     dari master Jurnal A.R. yang baru dibuat (DATA.jurnalAR),
     No. Otomatis "AR001" (dekoratif persis screenshot), No.
     Transaksi format "26/ARS/{kode cabang}/08/{urut}", No. Faktur
     readonly + picker dari DATA.invoices (Faktur Penjualan
     sungguhan di mockup — memilih faktur ikut mengisi Customer).
   - Tab "Rincian Transaksi A.R.": Tipe Transaksi default "Nota
     Kredit" dan kolom Jumlah BOLEH NEGATIF (nota kredit) — beda
     dari Transaksi A.P. yang nominalnya selalu positif.
   - Tab "Rincian Jurnal Akun": TANPA kolom Cost Center (sesuai
     screenshot; di Transaksi A.P. ada). Jurnal Otomatis dibangun
     dari master Jurnal A.R. terpilih: akunDebit(D) = akunKredit(K)
     senilai NILAI ABSOLUT total rincian (contoh screenshot:
     PPN Keluaran(D) = Piutang SSP PPN(K); kode akun 210701/110790/
     111102/110791 skema instalasi lain dipetakan ke akun 7-digit
     DBM 2120002/1120003/1140003/1120004).
========================================================= */

const TAR_CABANG_LIST = ['Head Office','Surabaya','Bandung','Medan','Makassar','Semarang','Tangerang','Sidoarjo'];
const TAR_CABANG_CODE = {'Head Office':'HO','Surabaya':'SBY','Bandung':'BDG','Medan':'MDN','Makassar':'MKS','Semarang':'SMG','Tangerang':'TGR','Sidoarjo':'SDA'};
const TAR_TIPE_TRANSAKSI_LIST = ['Nota Kredit','Nota Debit','Piutang','Uang Muka'];

function tarNum2(n){ return Number(n||0).toLocaleString('id-ID', {minimumFractionDigits:2, maximumFractionDigits:2}); }
/* Nilai negatif tampil merah dalam kurung — pola kolom Jumlah di
   list screenshot (semua dokumen sample Nota Kredit/minus). */
function tarJumlahCell(n){
  const v = +n || 0;
  if(v < 0) return `<span style="color:var(--red);white-space:nowrap;">( ${tarNum2(-v)} )</span>`;
  return `<span style="white-space:nowrap;">${tarNum2(v)}</span>`;
}
function tarAkunNama(kode){ const a = DATA.akunGL.find(x => x.kode === kode); return a ? a.nama : ''; }

/* =====================================================================
   LIST PAGE — "Daftar Transaksi A.R."
===================================================================== */
function tplTransaksiArListPage(){
  return `
    <div class="breadcrumb">Home / <b>Transaksi A.R.</b></div>
    <div class="card">
      <div class="card-header dark-header">
        <h3>${icon('alertTriangle',15)} Daftar Transaksi A.R.</h3>
        <div class="toolbar-actions">
          <select class="chip-btn" id="tarFilter"><option>Agustus 2026</option><option>Juli 2026</option></select>
          <button class="btn-primary" id="btnTarAdd">${icon('plus',14)} Tambah</button>
        </div>
      </div>
      <div class="table-toolbar">
        <select id="tarPageSize"><option selected>10</option><option>25</option><option>50</option></select>
        <input type="text" id="tarSearch" placeholder="Pencarian Global">
      </div>
      <div class="table-wrap"><table>
        <thead><tr>
          <th>No. Transaksi</th>
          <th>Customer</th>
          <th>Tgl. Trn.</th>
          <th>No Faktur</th>
          <th>Keterangan</th>
          <th class="text-right">Jumlah</th>
          <th>Ubah</th>
          <th>Lihat</th>
          <th>Cetak</th>
          <th>CetakG.L.</th>
          <th>Hapus</th>
        </tr></thead>
        <tbody id="tarTbody"></tbody>
      </table></div>
      <div class="table-footer"><div class="pager"><button>First</button><button>Previous</button><button class="active">1</button><button>Next</button><button>Last</button></div><div id="tarTotal"></div></div>
    </div>`;
}

function tplTarRows(rows){
  if(!rows.length) return `<tr><td colspan="11" style="text-align:center;font-weight:700;">Tidak Ada Data</td></tr>`;
  return rows.map((r,i)=>`
    <tr>
      <td><button class="link-pick" data-view-link="${i}">${r.no}</button></td>
      <td>${r.customerNama||''}</td>
      <td>${r.tgl||''}</td>
      <td>${r.noFaktur||''}</td>
      <td style="max-width:280px;"><div style="white-space:normal;">${r.keterangan||''}</div></td>
      <td class="text-right">${tarJumlahCell(r.jumlah)}</td>
      <td><button class="icon-btn edit" data-edit="${i}" title="Ubah">${icon('edit',15)}</button></td>
      <td><button class="icon-btn view" data-view="${i}" title="Lihat">${icon('eye',15)}</button></td>
      <td><button class="icon-btn print" data-print="${i}" title="Cetak">${icon('printer',15)}</button></td>
      <td><button class="icon-btn print" data-print-gl="${i}" title="Cetak G.L.">${icon('book',15)}</button></td>
      <td><button class="icon-btn del" data-del="${i}" title="Hapus">${icon('trash',15)}</button></td>
    </tr>`).join('');
}

/* =====================================================================
   FORM (full page) — header + 2 tab (Rincian Transaksi A.R. /
   Rincian Jurnal Akun)
===================================================================== */
function tplTarForm(mode, row){
  const isAdd = mode === 'add';
  const isView = mode === 'view';
  const dis = isView ? 'disabled' : '';
  const titleAction = isAdd ? 'Tambah' : (isView ? 'Lihat' : 'Ubah');
  const headerIcon = isAdd ? 'plus' : (isView ? 'eye' : 'edit');
  return `
    <div class="breadcrumb">Home / Transaksi A.R. / <b>${titleAction}</b></div>
    <div class="card">
      <div class="card-header dark-header">
        <h3>${icon(headerIcon,15)} Transaksi A.R.</h3>
        <button class="btn-danger" id="btnTarTutorial">${icon('card',14)} Tutorial</button>
      </div>
      <div class="card-body">
        <div style="display:flex;align-items:flex-start;justify-content:space-between;gap:16px;flex-wrap:wrap;">
          <h2 style="font-size:20px;font-weight:700;color:var(--navy);margin:0;padding-bottom:10px;border-bottom:1px solid var(--border);min-width:260px;">Transaksi A.R.</h2>
          <div class="form-group" style="max-width:260px;min-width:200px;margin-bottom:0;">
            <label>Cabang</label>
            <select id="fTarCabang" ${(!isAdd)?'disabled':dis}>${TAR_CABANG_LIST.map(c=>`<option ${row.cabang===c?'selected':''}>${c}</option>`).join('')}</select>
          </div>
          <div style="min-width:200px;"></div>
        </div>

        <div class="form-grid-3" style="margin-top:18px;grid-template-columns:repeat(3,1fr);">
          <div class="form-group">
            <label>Dari Customer</label>
            <div class="input-with-btn">
              <input type="text" id="fTarCustomer" value="${row.customerNama||''}" placeholder="Pilih Customer" readonly>
              ${!isView ? `<button type="button" class="icon-btn edit" id="tarCustomerSearch" title="Cari Customer">${icon('search',13)}</button>` : ''}
            </div>
          </div>
          <div class="form-group">
            <label>Tgl. Trn.</label>
            <div class="input-with-btn">
              <input type="text" id="fTarTgl" value="${row.tgl||''}" ${dis}>
              <span class="icon-btn edit" style="pointer-events:none;">${icon('calendar',13)}</span>
            </div>
          </div>
          <div class="form-group">
            <label>Jurnal</label>
            <select id="fTarJurnal" ${dis}>
              <option value="">-Pilih Jurnal-</option>
              ${DATA.jurnalAR.map(j=>`<option value="${j.kode}" ${row.jurnalKode===j.kode?'selected':''}>${j.nama}</option>`).join('')}
            </select>
          </div>
        </div>

        <div class="form-grid-3" style="grid-template-columns:repeat(4,1fr);">
          <div class="form-group">
            <label>No. Otomatis</label>
            <select id="fTarNoOtomatis" disabled><option>AR001</option></select>
          </div>
          <div class="form-group">
            <label>No. Transaksi</label>
            <div class="input-with-btn">
              <input type="text" id="fTarNo" value="${row.no||''}" readonly>
              ${isAdd ? `<button type="button" class="icon-btn edit" id="tarRefreshNo" title="Generate Ulang Nomor">${icon('refreshCw',13)}</button>` : ''}
            </div>
          </div>
          <div class="form-group">
            <label>No. Faktur</label>
            <div class="input-with-btn">
              <input type="text" id="fTarNoFaktur" value="${row.noFaktur||''}" placeholder="Pilih Faktur Penjualan" readonly>
              ${!isView ? `<button type="button" class="icon-btn edit" id="tarNoFakturSearch" title="Cari Faktur Penjualan">${icon('search',13)}</button>` : ''}
            </div>
          </div>
          <div class="form-group">
            <label>Keterangan</label>
            <textarea id="fTarKeterangan" class="po-textarea" rows="3" ${dis}>${row.keterangan||''}</textarea>
          </div>
        </div>

        <div class="inv-tabs">
          <button type="button" class="inv-tab-btn active" id="tarTabRincianBtn">Rincian Transaksi A.R.</button>
          <button type="button" class="inv-tab-btn" id="tarTabJurnalBtn">Rincian Jurnal Akun</button>
        </div>

        <div id="tarTabRincianContent">${tplTarRincianTab(row, isView)}</div>
        <div id="tarTabJurnalContent" style="display:none;">${tplTarJurnalContent(row, isView)}</div>
      </div>
      <div class="card-footer" style="display:flex;gap:10px;justify-content:flex-end;align-items:center;padding:14px 20px;border-top:1px solid var(--border);">
        ${!isView ? `
          <button type="button" class="btn-teal" id="tarCetakSimpan">Cetak dan Simpan</button>
          <button type="button" class="btn-primary" id="tarSimpan">Simpan</button>` : ''}
        <a href="#" id="tarBatalkan" class="link-add" style="margin-top:0;">${isView?'Tutup':'Batalkan'}</a>
      </div>
    </div>`;
}

/* ===== Tab 1 — Rincian Transaksi A.R. ===== */
function tplTarRincianTab(row, isView){
  return `
    <div class="card-header dark-header" style="border-radius:6px;">
      <h3>${icon('alertTriangle',14)} Rincian Transaksi A.R.</h3>
      ${!isView ? `<button type="button" class="btn-primary" id="tarRincianAdd">${icon('plus',13)} Tambah</button>` : ''}
    </div>
    <div class="table-wrap" style="margin:6px 0 0;">
      <table class="po-item-table">
        <thead><tr>
          <th>Tipe Transaksi</th>
          <th>Tgl. Jth. Tempo</th>
          <th>Crc</th>
          <th>Kurs</th>
          <th class="text-right">Jumlah</th>
          <th>Hapus</th>
        </tr></thead>
        <tbody id="tarRincianBody">${tplTarRincianRows(row.rincian, isView)}</tbody>
      </table>
    </div>
    <div style="display:flex;justify-content:flex-end;margin-top:14px;">
      <div style="max-width:280px;width:100%;">
        <div class="form-group">
          <label>Jumlah</label>
          <input type="text" id="tarJumlah" value="${tarNum2(tarRecalcJumlah(row))}" readonly style="text-align:right;font-weight:700;">
        </div>
      </div>
    </div>`;
}

function tplTarRincianRows(list, isView){
  if(!list || !list.length) return `<tr><td colspan="6" style="color:var(--text-light);">Belum ada rincian — klik "+ Tambah" untuk menambah baris. Nilai Jumlah boleh negatif (Nota Kredit).</td></tr>`;
  const dis = isView ? 'disabled' : '';
  return list.map((it,idx)=>`
    <tr>
      <td style="min-width:170px;">
        <select data-tar-rincian-tipe="${idx}" ${dis}>${TAR_TIPE_TRANSAKSI_LIST.map(t=>`<option ${it.tipe===t?'selected':''}>${t}</option>`).join('')}</select>
      </td>
      <td style="min-width:120px;"><input type="text" data-tar-rincian-tempo="${idx}" value="${it.tglJthTempo||''}" ${dis}></td>
      <td style="width:90px;"><select data-tar-rincian-crc="${idx}" disabled><option>IDR</option></select></td>
      <td style="width:100px;"><input type="text" data-tar-rincian-kurs="${idx}" value="${tarNum2(it.kurs!=null?it.kurs:1)}" disabled></td>
      <td style="width:180px;"><input type="number" step="0.01" data-tar-rincian-jumlah="${idx}" value="${it.jumlah||0}" style="text-align:right;" ${dis}></td>
      <td style="width:60px;">${!isView ? `<button type="button" class="icon-btn del" data-tar-rincian-del="${idx}" title="Hapus Baris">${icon('trash',14)}</button>` : ''}</td>
    </tr>`).join('');
}

/* ===== Tab 2 — Rincian Jurnal Akun (pola Transaksi A.P., TANPA kolom
   Cost Center — sesuai screenshot) ===== */
function tplTarJurnalContent(row, isView){
  const isManual = row.jurnalMode === 'manual';
  const totals = tarJurnalTotals(row);
  const selisihColor = Math.abs(totals.selisih) > 0.004 ? 'var(--red)' : 'var(--text)';
  return `
    <div style="display:flex;align-items:center;justify-content:space-between;gap:12px;margin:4px 0 14px;flex-wrap:wrap;">
      <div class="radio-inline" style="padding-top:0;">
        <label><input type="radio" name="tarJurnalMode" id="tarJurnalOtomatis" value="otomatis" ${!isManual?'checked':''} ${isView?'disabled':''}> Jurnal Otomatis</label>
        <label><input type="radio" name="tarJurnalMode" id="tarJurnalManual" value="manual" ${isManual?'checked':''} ${isView?'disabled':''}> Jurnal Manual</label>
      </div>
      ${!isView ? `<button type="button" class="btn-secondary" id="tarBuatJurnal">${icon('refreshCw',13)} Buat Jurnal</button>` : ''}
      <div style="min-width:120px;"></div>
    </div>
    <div class="card-header dark-header" style="border-radius:6px;">
      <h3>${icon('settings',14)} Rincian Jurnal Akun</h3>
      ${(!isView && isManual) ? `<button type="button" class="btn-primary" id="tarJurnalAddRow">${icon('plus',13)} Tambah</button>` : ''}
    </div>
    <div class="table-wrap" style="margin:6px 0 0;">
      <table class="po-item-table">
        <thead><tr>
          <th>Kode Akun</th><th>Nama Akun</th><th>Keterangan</th><th class="text-right">Jumlah Debit</th><th class="text-right">Jumlah Kredit</th><th>Hapus</th>
        </tr></thead>
        <tbody id="tarJurnalBody">${tplTarJurnalRows(row.jurnalAkun, isManual && !isView)}</tbody>
      </table>
    </div>
    <div style="max-width:280px;margin:16px 0 0 auto;">
      <div style="font-size:12.5px;font-weight:600;color:var(--text);margin-bottom:4px;">Jumlah Debit - Kredit</div>
      <input type="text" id="tarJurnalSelisih" value="${tarNum2(totals.selisih)}" readonly style="text-align:right;font-weight:700;color:${selisihColor};">
    </div>`;
}

function tplTarJurnalRows(list, isManual){
  if(!list || !list.length) return `<tr><td colspan="6" style="color:var(--text-light);">Belum ada rincian jurnal — pilih Jurnal lalu klik "Buat Jurnal".</td></tr>`;
  return list.map((entry,idx) => tplTarJurnalRow(entry, idx, isManual)).join('');
}

function tplTarJurnalRow(entry, idx, isManual){
  if(isManual){
    return `
    <tr data-tar-jurnal-row="${idx}">
      <td style="min-width:120px;">
        <div class="input-with-btn">
          <input type="text" data-tar-jurnal-kode="${idx}" value="${entry.kodeAkun||''}" readonly>
          <button type="button" class="icon-btn edit" data-tar-jurnal-akun-search="${idx}" title="Cari Akun GL">${icon('search',12)}</button>
        </div>
      </td>
      <td style="min-width:180px;"><input type="text" data-tar-jurnal-nama="${idx}" value="${entry.namaAkun||''}" readonly></td>
      <td style="min-width:180px;"><input type="text" data-tar-jurnal-ket="${idx}" value="${entry.keterangan||''}"></td>
      <td style="width:150px;"><input type="number" step="0.01" min="0" data-tar-jurnal-debit="${idx}" value="${entry.debit||0}" style="text-align:right;"></td>
      <td style="width:150px;"><input type="number" step="0.01" min="0" data-tar-jurnal-kredit="${idx}" value="${entry.kredit||0}" style="text-align:right;"></td>
      <td style="width:50px;"><button type="button" class="icon-btn del" data-tar-jurnal-del="${idx}" title="Hapus Baris">${icon('trash',14)}</button></td>
    </tr>`;
  }
  return `
    <tr>
      <td style="min-width:120px;"><input type="text" value="${entry.kodeAkun||''}" readonly></td>
      <td style="min-width:180px;"><input type="text" value="${entry.namaAkun||''}" readonly></td>
      <td style="min-width:180px;"><input type="text" value="${entry.keterangan||''}" readonly></td>
      <td style="width:150px;"><input type="text" value="${tarNum2(entry.debit||0)}" readonly style="text-align:right;"></td>
      <td style="width:150px;"><input type="text" value="${tarNum2(entry.kredit||0)}" readonly style="text-align:right;"></td>
      <td style="width:50px;"></td>
    </tr>`;
}

/* Picker Customer — pola tplPpSspCustomerPicker (Transaksi A.R. SSP)
   + kotak pencarian. SALINAN LOKAL, bukan reuse cross-file. */
function tplTarCustomerPicker(list){
  return `
    <div class="modal-box" style="max-width:640px;">
      <div class="modal-header"><span>Pilih Customer</span><span class="close" id="modalClose">&times;</span></div>
      <div class="modal-body">
        <input type="text" id="tarCustomerPickerSearch" placeholder="Cari kode / nama customer..." style="width:100%;border:1px solid var(--border);border-radius:6px;padding:8px 10px;font-size:12.8px;margin-bottom:12px;">
        <div class="table-wrap" style="max-height:360px;overflow:auto;">
          <table>
            <thead><tr><th>Kode</th><th>Nama Customer</th><th>Kota</th><th></th></tr></thead>
            <tbody id="tarCustomerPickerBody">${tplTarCustomerPickerRows(list)}</tbody>
          </table>
        </div>
      </div>
      <div class="modal-footer"><button class="btn-secondary" id="modalCancel">Tutup</button></div>
    </div>`;
}

function tplTarCustomerPickerRows(list){
  if(!list.length) return `<tr><td colspan="4" style="color:var(--text-light);">Tidak ada customer ditemukan</td></tr>`;
  return list.map(c=>`
    <tr>
      <td>${c.kode}</td>
      <td>${c.nama}</td>
      <td>${c.kota||''}</td>
      <td><button class="btn-pick" data-pick-customer="${c.kode}">Pilih</button></td>
    </tr>`).join('');
}

/* Picker Faktur Penjualan — sumber DATA.invoices (Faktur Penjualan
   sungguhan di mockup). Memilih faktur ikut mengisi Customer. */
function tplTarFakturPicker(list){
  return `
    <div class="modal-box" style="max-width:760px;">
      <div class="modal-header"><span>Pilih Faktur Penjualan</span><span class="close" id="modalClose">&times;</span></div>
      <div class="modal-body">
        <input type="text" id="tarFakturPickerSearch" placeholder="Cari no. faktur / customer..." style="width:100%;border:1px solid var(--border);border-radius:6px;padding:8px 10px;font-size:12.8px;margin-bottom:12px;">
        <div class="table-wrap" style="max-height:340px;overflow:auto;">
          <table>
            <thead><tr><th>No. Faktur</th><th>Tgl.</th><th>Customer</th><th>Cabang</th><th></th></tr></thead>
            <tbody id="tarFakturPickerBody">${tplTarFakturPickerRows(list)}</tbody>
          </table>
        </div>
      </div>
      <div class="modal-footer"><button class="btn-secondary" id="modalCancel">Tutup</button></div>
    </div>`;
}

function tplTarFakturPickerRows(list){
  if(!list.length) return `<tr><td colspan="5" style="color:var(--text-light);">Tidak ada faktur ditemukan</td></tr>`;
  return list.map(f=>`
    <tr>
      <td>${f.no}</td>
      <td>${f.tgl||''}</td>
      <td>${f.customerNama||''}</td>
      <td>${f.cabang||''}</td>
      <td><button class="btn-pick" data-pick-faktur="${f.no}">Pilih</button></td>
    </tr>`).join('');
}

/* Picker Akun GL utk baris jurnal manual — salinan lokal pola
   tplTapAkunPicker (Transaksi A.P.). */
function tplTarAkunPicker(list){
  return `
    <div class="modal-box" style="max-width:640px;">
      <div class="modal-header"><span>Pilih Akun GL</span><span class="close" id="modalClose">&times;</span></div>
      <div class="modal-body">
        <input type="text" id="tarAkunPickerSearch" placeholder="Cari kode / nama akun..." style="width:100%;border:1px solid var(--border);border-radius:6px;padding:8px 10px;font-size:12.8px;margin-bottom:12px;">
        <div class="table-wrap" style="max-height:360px;overflow:auto;">
          <table>
            <thead><tr><th>Kode</th><th>Nama Akun</th><th>Kat.</th><th></th></tr></thead>
            <tbody id="tarAkunPickerBody">${tplTarAkunPickerRows(list)}</tbody>
          </table>
        </div>
      </div>
      <div class="modal-footer"><button class="btn-secondary" id="modalCancel">Tutup</button></div>
    </div>`;
}

function tplTarAkunPickerRows(list){
  if(!list.length) return `<tr><td colspan="4" style="color:var(--text-light);">Tidak ada akun ditemukan</td></tr>`;
  return list.map(a=>`
    <tr>
      <td>${a.kode}</td>
      <td>${a.nama}</td>
      <td>${a.kategori}</td>
      <td><button class="btn-pick" data-tar-pick-akun="${a.kode}">Pilih</button></td>
    </tr>`).join('');
}

function tplTarDeleteConfirm(row){
  return `
    <div class="modal-box">
      <div class="modal-header"><span>Hapus Transaksi A.R.</span><span class="close" id="modalClose">&times;</span></div>
      <div class="modal-body"><p>Yakin ingin menghapus transaksi A.R. <b>${row.no}</b> — ${row.customerNama||''} (${tarNum2(row.jumlah)})?</p></div>
      <div class="modal-footer">
        <button class="btn-secondary" id="modalCancel">Batal</button>
        <button class="btn-danger" id="modalDelete">Hapus</button>
      </div>
    </div>`;
}

function tplTarInfoModal(title,text){
  return `
    <div class="modal-box">
      <div class="modal-header"><span>${title}</span><span class="close" id="modalClose">&times;</span></div>
      <div class="modal-body"><p>${text}</p></div>
      <div class="modal-footer"><button class="btn-primary" id="modalOk">Mengerti</button></div>
    </div>`;
}
