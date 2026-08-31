/* =========================================================
   TEMPLATE (HTML saja) — Rekonsiliasi (Kas/Bank > Daftar
   Transaksi > Rekonsiliasi, key page:'rekonsiliasi'). Semua
   fungsi di file ini HANYA menyusun & mengembalikan markup HTML
   (string) atau helper murni, TIDAK ada DOM-binding/data mutation
   di sini. Logic-nya ada di file sebelah: rekonsiliasi.js

   Sesuai 2 screenshot MASERP yang dikirim user:
   1) "Daftar Rekonsiliasi": tombol +Tambah; kolom No.
      Rekonsiliasi (link biru -> Lihat) / Tgl. Rekonsiliasi
      (format ISO "2026-01-31T04:34:00" persis screenshot) / Bank /
      Saldo Rekon. / Saldo Bank / Selisih + aksi Ubah / Hapus /
      Lihat / Cetak.
   2) Form "+ Rekonsiliasi": No. Rekonsiliasi readonly (format
      "{urut}/{bank} /{kode cabang}/{bulan romawi}/{tahun}" —
      spasi setelah nama bank direproduksi apa adanya dari
      screenshot), Bank (picker DATA.kasBank), Mata Uang readonly,
      Tgl. Rekonsiliasi (akhir bulan terpilih); panel kanan: Pilih
      Bulan (dropdown 2026), Rekening Koran / Saldo Awal /
      Rekonsiliasi / Selisih (semua readonly & REAKTIF). Tabel
      "Rincian Rekonsiliasi" dgn 4 tombol header: Refresh (teal,
      menghitung ulang) + Transaksi Kas + Pelunasan Utang +
      Penerimaan Piutang (masing-masing menarik 1 transaksi
      sungguhan dari DATA.transaksiKas / DATA.pelunasanUtang /
      DATA.penerimaanPiutang jadi baris rincian). Kolom: Tgl. Trn.
      Bank / No. Transaksi / Keterangan / Kurs / Terima / Keluar /
      Cek (checkbox header = centang semua) / Hapus. Bawah: Jumlah
      Saldo Rekonsiliasi (total baris tercentang) & Jumlah Saldo
      Non Rekonsiliasi (baris belum dicentang). Footer Simpan +
      Batalkan.
   Aritmetika mockup: Rekonsiliasi = total (Terima - Keluar) baris
   TERCENTANG; Rekening Koran = Saldo Awal + Rekonsiliasi (saldo
   menurut bank); Selisih = Rekening Koran - Saldo Awal -
   Rekonsiliasi (0 kalau semua cocok — mencentang/menghapus baris
   mengubah Selisih secara reaktif). */

const RK_BULAN_LIST = ['Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember'];
const RK_ROMAWI = ['I','II','III','IV','V','VI','VII','VIII','IX','X','XI','XII'];

function rkNum2(n){ return Number(n||0).toLocaleString('id-ID', {minimumFractionDigits:2, maximumFractionDigits:2}); }
function rkBankLabel(kode){
  const kb = DATA.kasBank.find(x => x.kode === kode);
  return kb ? `${kb.nama} ${kb.mataUang||''}`.trim() : '';
}

/* =====================================================================
   LIST PAGE — "Daftar Rekonsiliasi"
===================================================================== */
function tplRekonsiliasiListPage(){
  return `
    <div class="breadcrumb">Home / Kas/Bank / <b>Rekonsiliasi</b></div>
    <div class="card">
      <div class="card-header dark-header">
        <h3>${icon('refreshCw',15)} Daftar Rekonsiliasi</h3>
        <button class="btn-primary" id="btnRkAdd">${icon('plus',14)} Tambah</button>
      </div>
      <div class="table-toolbar">
        <select id="rkPageSize"><option selected>10</option><option>25</option><option>50</option></select>
        <input type="text" id="rkSearch" placeholder="Pencarian Global">
      </div>
      <div class="table-wrap"><table>
        <thead><tr>
          <th style="width:190px;">No. Rekonsiliasi</th>
          <th style="width:170px;">Tgl. Rekonsiliasi</th>
          <th>Bank</th>
          <th class="text-right" style="width:140px;">Saldo Rekon.</th>
          <th class="text-right" style="width:140px;">Saldo Bank</th>
          <th class="text-right" style="width:90px;">Selisih</th>
          <th style="width:64px;">Ubah</th>
          <th style="width:64px;">Hapus</th>
          <th style="width:64px;">Lihat</th>
          <th style="width:64px;">Cetak</th>
        </tr></thead>
        <tbody id="rkTbody"></tbody>
      </table></div>
      <div class="table-footer"><div class="pager"><button>First</button><button>Previous</button><button class="active">1</button><button>Next</button><button>Last</button></div><div id="rkTotal"></div></div>
    </div>`;
}

function tplRkRows(rows){
  if(!rows.length) return `<tr><td colspan="10" style="color:var(--text-light);padding:14px;">Tidak ada Rekonsiliasi yang cocok dengan pencarian.</td></tr>`;
  return rows.map((r,i)=>{
    const t = rkTotals(r);
    return `
    <tr>
      <td><button class="link-pick" data-view-link="${i}">${r.no}</button></td>
      <td>${r.tglRekonIso||''}</td>
      <td>${rkBankLabel(r.bankKode)}</td>
      <td class="text-right">${rkNum2(t.saldoRekon)}</td>
      <td class="text-right">${rkNum2(r.rekeningKoran)}</td>
      <td class="text-right">${rkNum2(t.selisih)}</td>
      <td><button class="icon-btn edit" data-edit="${i}" title="Ubah">${icon('edit',15)}</button></td>
      <td><button class="icon-btn del" data-del="${i}" title="Hapus">${icon('trash',15)}</button></td>
      <td><button class="icon-btn view" data-view="${i}" title="Lihat">${icon('eye',15)}</button></td>
      <td><button class="icon-btn print" data-print="${i}" title="Cetak">${icon('printer',15)}</button></td>
    </tr>`;
  }).join('');
}

/* =====================================================================
   FORM (full page)
===================================================================== */
function tplRkForm(mode, row){
  const isAdd = mode === 'add';
  const isView = mode === 'view';
  const dis = isView ? 'disabled' : '';
  const t = rkTotals(row);
  return `
    <div class="breadcrumb">Home / Rekonsiliasi / <b>${isAdd ? 'Tambah' : (isView ? 'Lihat' : 'Ubah')}</b></div>
    <div class="card">
      <div class="card-header dark-header">
        <h3>${icon('plus',15)} Rekonsiliasi</h3>
        <button class="btn-danger" id="btnRkTutorial">${icon('card',14)} Tutorial</button>
      </div>
      <div class="card-body">
        <h2 style="font-size:20px;font-weight:700;color:var(--navy);margin:0 0 16px;padding-bottom:10px;border-bottom:1px solid var(--border);max-width:260px;">Rekonsiliasi</h2>

        <div class="form-grid-3" style="grid-template-columns:repeat(4,1fr);">
          <div class="form-group">
            <label>No. Rekonsiliasi</label>
            <input type="text" id="fRkNo" value="${row.no||''}" readonly>
          </div>
          <div class="form-group">
            <label>Bank</label>
            <div class="input-with-btn">
              <input type="text" id="fRkBank" value="${rkBankLabel(row.bankKode)}" placeholder="Pilih Bank" readonly>
              ${isAdd ? `<button type="button" class="icon-btn edit" id="rkBankSearch" title="Cari Bank">${icon('search',13)}</button>` : ''}
            </div>
          </div>
          <div class="form-group">
            <label>Mata Uang</label>
            <input type="text" id="fRkMataUang" value="${row.mataUang||'IDR'}" readonly>
          </div>
          <div class="form-group">
            <label>Tgl. Rekonsiliasi</label>
            <div class="input-with-btn">
              <input type="text" id="fRkTgl" value="${row.tgl||''}" ${dis}>
              <span class="icon-btn edit" style="pointer-events:none;">${icon('calendar',13)}</span>
            </div>
          </div>
        </div>

        <div style="display:flex;justify-content:flex-end;">
          <table class="field-table" style="max-width:520px;">
            <tr><td class="flabel" style="background:none;border:none;text-align:right;">Pilih Bulan</td>
              <td><select id="fRkBulan" ${(!isAdd)?'disabled':dis}>${RK_BULAN_LIST.map((b,i)=>`<option value="${i}" ${row.bulanIdx===i?'selected':''}>${b} 2026</option>`).join('')}</select></td></tr>
            <tr><td class="flabel" style="background:none;border:none;text-align:right;">Rekening Koran</td>
              <td><input type="text" id="fRkRekeningKoran" value="${rkNum2(row.rekeningKoran)}" readonly style="text-align:right;"></td></tr>
            <tr><td class="flabel" style="background:none;border:none;text-align:right;">Saldo Awal</td>
              <td><input type="text" id="fRkSaldoAwal" value="${rkNum2(row.saldoAwal)}" readonly style="text-align:right;"></td></tr>
            <tr><td class="flabel" style="background:none;border:none;text-align:right;">Rekonsiliasi</td>
              <td><input type="text" id="fRkRekonsiliasi" value="${rkNum2(t.rekonsiliasi)}" readonly style="text-align:right;"></td></tr>
            <tr><td class="flabel" style="background:none;border:none;text-align:right;">Selisih</td>
              <td><input type="text" id="fRkSelisih" value="${rkNum2(t.selisih)}" readonly style="text-align:right;font-weight:700;"></td></tr>
          </table>
        </div>

        <div class="card-header dark-header" style="border-radius:6px;margin-top:14px;">
          <h3>${icon('alertTriangle',14)} Rincian Rekonsiliasi</h3>
          ${!isView ? `<div class="toolbar-actions">
            <button type="button" class="btn-teal" id="rkRefresh">${icon('refreshCw',13)} Refresh</button>
            <button type="button" class="btn-primary" id="rkAddKas">${icon('plus',13)} Transaksi Kas</button>
            <button type="button" class="btn-primary" id="rkAddUtang">${icon('plus',13)} Pelunasan Utang</button>
            <button type="button" class="btn-primary" id="rkAddPiutang">${icon('plus',13)} Penerimaan Piutang</button>
          </div>` : ''}
        </div>
        <div class="table-wrap" style="margin:6px 0 0;max-height:380px;overflow:auto;">
          <table class="po-item-table">
            <thead><tr>
              <th style="width:110px;">Tgl. Trn. Bank</th>
              <th style="width:170px;">No. Transaksi</th>
              <th>Keterangan</th>
              <th style="width:80px;">Kurs</th>
              <th class="text-right" style="width:130px;">Terima</th>
              <th class="text-right" style="width:130px;">Keluar</th>
              <th style="width:60px;text-align:center;">Cek<br><input type="checkbox" id="rkCekSemua" ${isView?'disabled':''}></th>
              <th style="width:50px;"></th>
            </tr></thead>
            <tbody id="rkItemsBody">${tplRkItemRows(row.items, isView)}</tbody>
          </table>
        </div>

        <div style="display:flex;justify-content:flex-end;margin-top:16px;">
          <table class="field-table" style="max-width:560px;">
            <tr><td class="flabel" style="background:none;border:none;text-align:right;">Jumlah Saldo Rekonsiliasi</td>
              <td style="width:220px;"><input type="text" id="fRkJumlahRekon" value="${rkNum2(t.rekonsiliasi)}" readonly style="text-align:right;"></td></tr>
            <tr><td class="flabel" style="background:none;border:none;text-align:right;">Jumlah Saldo Non Rekonsiliasi</td>
              <td><input type="text" id="fRkJumlahNonRekon" value="${rkNum2(t.nonRekonsiliasi)}" readonly style="text-align:right;"></td></tr>
          </table>
        </div>
      </div>
      <div class="card-footer" style="display:flex;gap:10px;justify-content:flex-end;align-items:center;padding:14px 20px;border-top:1px solid var(--border);">
        ${!isView ? `<button type="button" class="btn-primary" id="rkSimpan">Simpan</button>` : ''}
        <a href="#" id="rkBatalkan" class="link-add" style="margin-top:0;">${isView?'Tutup':'Batalkan'}</a>
      </div>
    </div>`;
}

function tplRkItemRows(items, isView){
  if(!items || !items.length) return `<tr><td colspan="8" style="color:var(--text-light);">Belum ada rincian — tarik transaksi lewat tombol + Transaksi Kas / + Pelunasan Utang / + Penerimaan Piutang di atas.</td></tr>`;
  const dis = isView ? 'disabled' : '';
  return items.map((it,idx)=>`
    <tr>
      <td><input type="text" data-rk-tgl="${idx}" value="${it.tglBank||''}" ${dis}></td>
      <td><input type="text" value="${it.noTransaksi||''}" readonly></td>
      <td><input type="text" data-rk-ket="${idx}" value="${it.keterangan||''}" ${dis}></td>
      <td><input type="text" value="${rkNum2(it.kurs!=null?it.kurs:1)}" readonly style="text-align:right;"></td>
      <td><input type="number" step="0.01" min="0" data-rk-terima="${idx}" value="${it.terima||0}" style="text-align:right;" ${dis}></td>
      <td><input type="number" step="0.01" min="0" data-rk-keluar="${idx}" value="${it.keluar||0}" style="text-align:right;" ${dis}></td>
      <td style="text-align:center;"><input type="checkbox" data-rk-cek="${idx}" ${it.cek?'checked':''} ${dis}></td>
      <td>${!isView ? `<button type="button" class="icon-btn del" data-rk-del="${idx}" title="Hapus Baris">${icon('trash',14)}</button>` : ''}</td>
    </tr>`).join('');
}

/* Picker Bank — sumber DATA.kasBank (rekening tipe Bank saja). */
function tplRkBankPicker(list){
  return `
    <div class="modal-box" style="max-width:680px;">
      <div class="modal-header"><span>Pilih Bank</span><span class="close" id="modalClose">&times;</span></div>
      <div class="modal-body">
        <input type="text" id="rkBankPickerSearch" placeholder="Cari kode / nama bank..." style="width:100%;border:1px solid var(--border);border-radius:6px;padding:8px 10px;font-size:12.8px;margin-bottom:12px;">
        <div class="table-wrap" style="max-height:360px;overflow:auto;">
          <table>
            <thead><tr><th>Kode</th><th>Nama</th><th>Entitas</th><th>Crc</th><th class="text-right">Saldo</th><th></th></tr></thead>
            <tbody id="rkBankPickerBody">${tplRkBankPickerRows(list)}</tbody>
          </table>
        </div>
      </div>
      <div class="modal-footer"><button class="btn-secondary" id="modalCancel">Tutup</button></div>
    </div>`;
}

function tplRkBankPickerRows(list){
  if(!list.length) return `<tr><td colspan="6" style="color:var(--text-light);">Tidak ada bank ditemukan</td></tr>`;
  return list.map(k=>`
    <tr><td>${k.kode}</td><td>${k.nama}</td><td>${k.masterBank||''}</td><td>${k.mataUang||''}</td><td class="text-right">${rkNum2(k.saldo)}</td><td><button class="btn-pick" data-pick-bank="${k.kode}">Pilih</button></td></tr>`).join('');
}

function tplRkDeleteConfirm(row){
  return `
    <div class="modal-box">
      <div class="modal-header"><span>Hapus Rekonsiliasi</span><span class="close" id="modalClose">&times;</span></div>
      <div class="modal-body"><p>Yakin ingin menghapus rekonsiliasi <b>${row.no}</b> — ${rkBankLabel(row.bankKode)}?</p></div>
      <div class="modal-footer">
        <button class="btn-secondary" id="modalCancel">Batal</button>
        <button class="btn-danger" id="modalDelete">Hapus</button>
      </div>
    </div>`;
}

function tplRkInfoModal(title,text){
  return `
    <div class="modal-box">
      <div class="modal-header"><span>${title}</span><span class="close" id="modalClose">&times;</span></div>
      <div class="modal-body"><p>${text}</p></div>
      <div class="modal-footer"><button class="btn-primary" id="modalOk">Mengerti</button></div>
    </div>`;
}
