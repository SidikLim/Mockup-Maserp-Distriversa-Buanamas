/* =========================================================
   TEMPLATE (HTML saja) — Tagihan Piutang / "Daftar Tagih
   Piutang" (Customer & Penjualan > Daftar Transaksi > Daftar
   Tagih Piutang, key page:'tagihanPiutang'). Semua fungsi di
   file ini HANYA menyusun & mengembalikan markup HTML (string)
   atau helper murni, TIDAK ada DOM-binding/mutation. Logic-nya
   di file sebelah: tagihan-piutang.js
   NB: closeModal() dipakai bersama, didefinisikan di core.js.

   Sesuai 3 screenshot MASERP SDL + 2 PDF cetakan yang dikirim
   user 2026-09-01 (data SDL "KERTHA UTAMA MEDIKA/C001977"
   dipetakan ke master DBM — faktur dari DATA.fakturPenjualanSJ,
   alasan dari DATA.alasanBelumTertagih):
   1) List "Daftar Tagih Piutang": chip "September 2026"
      (FUNGSIONAL Sept/Agust) + Tambah; page-size default 20;
      kolom No. Tagih Piutang / Tgl. Tagih / Customer / Nama
      Kolektor / Keterangan / Jumlah Akhir / Status (OPEN hijau
      | CLOSED merah) / Closed Manually (toggle FUNGSIONAL) +
      aksi: Ubah, "Ubah Alasan Belum Tagih" (tombol teal ->
      modal "Daftar Tagih Piutang Item": tabel No. Faktur +
      Alasan Belum Tertagih readonly + picker master Alasan
      Belum Tertagih, tombol Simpan), Cetak (tombol printer +
      caret -> DROPDOWN: Daftar Tagih Full Page / Kwitansi),
      Lihat (form view), Hapus.
   2) Form "+ Daftar Tagih Piutang": No. Otomatis "DC001"
      (dekoratif) + No. Tagih Piutang "26/DC/HO/09/00001"
      readonly + refresh; Tgl. Tagih; Salesman/Kolektor
      (picker: OFFICE + DATA.salesman); Keterangan. Tabel
      faktur: Tgl. Faktur / Nama Customer / Badan Usaha / No.
      Faktur / Jumlah / Keterangan ("Jual Kredit") / Alasan
      Belum Tertagih (readonly + picker) / Tgl. Visit
      (editable) / Kolektor Sebelumnya / Kolektor Saat Ini /
      Tgl. Tagih Sebelumnya / No. Pelunasan / Alasan Belum
      Tertagih Sebelumnya / Hapus + link "+ Tambah Faktur Baru"
      (picker DATA.fakturPenjualanSJ). Jumlah = Σ faktur,
      recalc live. Simpan / Batalkan.
   3) Cetakan "DAFTAR TAGIH" Full Page (replika PDF, kop SDL ->
      PT DISTRIVERSA BUANAMAS): kop + "Tgl Print : {tgl}  1/1",
      judul DAFTAR TAGIH digarisbawahi, Nomor/Tanggal (dgn
      jam)/Sales, tabel Kode Customer/Nama Customer/Badan
      Usaha/No. Faktur/Tgl. Faktur/Tgl. Jth. Tempo/Jumlah/Cash
      + grup "Pembayaran" (Giro/Transfer, Bank) + grup
      "Potongan" (Bank, SSP) + Kembali + Keterangan (kolom
      pembayaran KOSONG utk diisi manual), ttd Penerima, /
      Penanggung Jawab ,.
   4) Cetakan "Kwitansi" (replika PDF "Perincian Nota Piutang &
      Tanda Terima Pembayaran"): kop DBM + kotak Nama/Alamat/
      Tanggal customer; tabel kiri "Perincian Sisa Piutang"
      (No/No Nota/Tgl Nota/Tgl Tempo/Sisa Nota) + tabel kanan
      "Pembayaran" (Bank/Tanggal/No Ac/Giro/Jumlah KOSONG +
      Total + Terbilang kosong); ttd Dibuat Oleh / Konsumen /
      Sales/Collector; 2 catatan kaki (cek/giro & retur/
      refaksi). */

function dtpNum2(n){ return Number(n||0).toLocaleString('id-ID', {minimumFractionDigits:2, maximumFractionDigits:2}); }
function dtpJumlahAkhir(r){ return (r.items||[]).reduce((a,it)=> a + Number(it.jumlah||0), 0); }

/* =====================================================================
   LIST PAGE — "Daftar Tagih Piutang"
===================================================================== */
function tplDtpListPage(bulan){
  return `
    <div class="breadcrumb">Home / Customer &amp; Penjualan / <b>Daftar Tagih Piutang</b></div>
    <div class="card">
      <div class="card-header dark-header">
        <h3>${icon('alertTriangle',15)} Daftar Tagih Piutang</h3>
        <div class="toolbar-actions">
          <select class="chip-btn" id="dtpFilterBulan"><option value="09" ${bulan==='09'?'selected':''}>September 2026</option><option value="08" ${bulan==='08'?'selected':''}>Agustus 2026</option></select>
          <button class="btn-primary" id="btnDtpAdd">${icon('plus',14)} Tambah</button>
        </div>
      </div>
      <div class="table-toolbar">
        <select id="dtpPageSize"><option>10</option><option selected>20</option><option>25</option><option>50</option></select>
        <input type="text" id="dtpSearch" placeholder="Pencarian Global">
      </div>
      <div class="table-wrap"><table>
        <thead><tr>
          <th style="width:170px;">No. Tagih Piutang</th>
          <th style="width:100px;">Tgl. Tagih</th>
          <th>Customer</th>
          <th style="width:130px;">Nama Kolektor</th>
          <th style="width:120px;">Keterangan</th>
          <th class="text-right" style="width:120px;">Jumlah Akhir</th>
          <th style="width:64px;">Status</th>
          <th style="width:120px;">Closed Manually</th>
          <th style="width:56px;">Ubah</th>
          <th style="width:76px;">Ubah Alasan Belum Tagih</th>
          <th style="width:64px;">Cetak</th>
          <th style="width:56px;">Lihat</th>
          <th style="width:56px;">Hapus</th>
        </tr></thead>
        <tbody id="dtpTbody"></tbody>
      </table></div>
      <div class="table-footer"><div class="pager" id="dtpPager"><button>First</button><button>Previous</button><button class="active">1</button><button>Next</button><button>Last</button></div><div id="dtpTotal"></div></div>
    </div>`;
}

function tplDtpRows(rows){
  if(!rows.length) return `<tr><td colspan="13" style="color:var(--text-light);padding:14px;text-align:center;font-weight:600;">Tidak Ada Data</td></tr>`;
  return rows.map((r) => {
    const idx = DATA.tagihanPiutang.indexOf(r);
    const closed = !!r.closedManually;
    return `
    <tr>
      <td>${r.no}</td>
      <td>${r.tgl||''}</td>
      <td>${(r.customerNama||'').toUpperCase()}</td>
      <td>${r.kolektor||''}</td>
      <td style="max-width:130px;"><div style="white-space:nowrap;overflow:hidden;text-overflow:ellipsis;" title="${r.keterangan||''}">${r.keterangan||''}</div></td>
      <td class="text-right">${dtpNum2(dtpJumlahAkhir(r))}</td>
      <td style="font-weight:700;color:${closed?'var(--red)':'#1d9a6c'};">${closed?'CLOSED':'OPEN'}</td>
      <td><label class="toggle-switch"><input type="checkbox" data-dtp-closed="${idx}" ${closed?'checked':''}><span class="toggle-slider"></span></label></td>
      <td><button class="icon-btn edit" data-dtp-edit="${idx}" title="Ubah">${icon('edit',15)}</button></td>
      <td><button class="icon-btn" data-dtp-alasan="${idx}" title="Ubah Alasan Belum Tagih" style="background:#2fb5a8;color:#fff;">${icon('edit',15)}</button></td>
      <td><button class="icon-btn edit" data-dtp-cetak="${idx}" title="Cetak">${icon('printer',15)} <span style="font-size:9px;">&#9662;</span></button></td>
      <td><button class="icon-btn view" data-dtp-view="${idx}" title="Lihat">${icon('eye',15)}</button></td>
      <td><button class="icon-btn del" data-dtp-del="${idx}" title="Hapus">${icon('trash',15)}</button></td>
    </tr>`;
  }).join('');
}

/* Dropdown pilihan cetakan (Daftar Tagih Full Page / Kwitansi). */
function tplDtpCetakMenu(idx){
  return `
    <div id="dtpCetakMenu" style="position:fixed;z-index:200;background:#fff;border:1px solid var(--border);border-radius:6px;box-shadow:0 4px 14px rgba(0,0,0,.16);min-width:170px;overflow:hidden;">
      <button data-dtp-cetak-full="${idx}" style="display:block;width:100%;border:none;background:none;padding:8px 14px;text-align:left;font-size:12.5px;cursor:pointer;">Daftar Tagih Full Page</button>
      <button data-dtp-cetak-kwitansi="${idx}" style="display:block;width:100%;border:none;background:none;padding:8px 14px;text-align:left;font-size:12.5px;cursor:pointer;border-top:1px solid var(--border);">Kwitansi</button>
    </div>`;
}

/* =====================================================================
   FORM (full page)
===================================================================== */
function tplDtpForm(mode, row){
  const isAdd = mode === 'add';
  const isView = mode === 'view';
  const dis = isView ? 'disabled' : '';
  return `
    <div class="breadcrumb">Home / Daftar Tagih Piutang / <b>${isAdd?'Tambah':(isView?'Lihat':'Ubah')}</b></div>
    <div class="card">
      <div class="card-header dark-header">
        <h3>${icon('plus',15)} Daftar Tagih Piutang</h3>
        <button class="btn-danger" id="btnDtpTutorial">${icon('card',14)} Tutorial</button>
      </div>
      <div class="card-body">
        <div class="form-grid-3" style="grid-template-columns:repeat(3,1fr);align-items:end;">
          <h2 style="font-size:20px;font-weight:700;color:var(--navy);margin:0 0 10px;padding-bottom:10px;border-bottom:1px solid var(--border);">Daftar Tagih Piutang</h2>
          <div class="form-group"></div>
          <div class="form-group"></div>
        </div>
        <div class="form-grid-3" style="grid-template-columns:220px 1fr 1fr;">
          <div class="form-group">
            <label>No. Otomatis</label>
            <select disabled><option>DC001</option></select>
          </div>
          <div class="form-group">
            <label>No. Tagih Piutang</label>
            <div class="input-with-btn">
              <input type="text" id="fDtpNo" value="${row.no||''}" readonly style="background:#f2f3f6;">
              ${isAdd ? `<button type="button" class="icon-btn edit" id="dtpRefreshNo" title="Generate Ulang Nomor">${icon('refreshCw',13)}</button>` : ''}
            </div>
          </div>
          <div class="form-group"></div>
        </div>
        <div class="form-grid-3" style="grid-template-columns:1fr 1fr 1fr;">
          <div class="form-group">
            <label>Tgl. Tagih</label>
            <div class="input-with-btn">
              <input type="text" id="fDtpTgl" value="${row.tgl||''}" ${dis}>
              <span class="icon-btn edit" style="pointer-events:none;">${icon('calendar',13)}</span>
            </div>
          </div>
          <div class="form-group">
            <label>Salesman</label>
            <div class="input-with-btn">
              <input type="text" id="fDtpKolektor" value="${row.kolektor||''}" placeholder="Pilih Kolektor" readonly>
              ${!isView ? `<button type="button" class="icon-btn edit" id="dtpKolektorSearch" title="Cari Kolektor">${icon('search',13)}</button>` : ''}
            </div>
          </div>
          <div class="form-group">
            <label>Keterangan</label>
            <textarea id="fDtpKeterangan" class="po-textarea" rows="2" ${dis}>${row.keterangan||''}</textarea>
          </div>
        </div>

        <div class="table-wrap" style="margin-top:12px;">
          <table class="po-item-table">
            <thead><tr>
              <th style="width:92px;">Tgl. Faktur</th>
              <th style="min-width:120px;">Nama Customer</th>
              <th style="width:74px;">Badan Usaha</th>
              <th style="min-width:140px;">No. Faktur</th>
              <th class="text-right" style="width:110px;">Jumlah</th>
              <th style="width:86px;">Keterangan</th>
              <th style="min-width:150px;">Alasan Belum Tertagih</th>
              <th style="width:130px;">Tgl. Visit</th>
              <th style="width:100px;">Kolektor Sebelumnya</th>
              <th style="width:100px;">Kolektor Saat Ini</th>
              <th style="width:100px;">Tgl. Tagih Sebelumnya</th>
              <th style="width:100px;">No. Pelunasan</th>
              <th style="min-width:130px;">Alasan Belum Tertagih Sebelumnya</th>
              <th style="width:50px;">Hapus</th>
            </tr></thead>
            <tbody id="dtpItemsBody">${tplDtpItemRows(row.items, isView)}</tbody>
          </table>
        </div>
        ${!isView ? `<a href="#" class="link-add" id="dtpAddFaktur">${icon('plus',12)} Tambah Faktur Baru</a>` : ''}

        <div style="display:flex;justify-content:flex-end;align-items:center;gap:10px;margin-top:16px;">
          <span style="font-size:12.5px;font-weight:600;">Jumlah</span>
          <input type="text" id="fDtpJumlah" value="${dtpNum2(dtpJumlahAkhir(row))}" disabled style="max-width:300px;text-align:right;font-weight:700;">
        </div>
      </div>
      <div class="card-footer" style="display:flex;gap:10px;justify-content:flex-end;align-items:center;padding:14px 20px;border-top:1px solid var(--border);">
        ${!isView ? `<button type="button" class="btn-primary" id="dtpSimpan">Simpan</button>` : ''}
        <a href="#" id="dtpBatalkan" class="link-add" style="margin-top:0;">${isView?'Tutup':'Batalkan'}</a>
      </div>
    </div>`;
}

function tplDtpItemRows(items, isView){
  if(!items || !items.length) return `<tr><td colspan="14" style="color:var(--text-light);">Belum ada faktur — klik "Tambah Faktur Baru".</td></tr>`;
  return items.map((it,idx)=>`
    <tr>
      <td>${it.tglFaktur||''}</td>
      <td>${(it.customerNama||'').toUpperCase()}</td>
      <td>${it.badanUsaha||''}</td>
      <td>${it.noFaktur||''}</td>
      <td class="text-right">${dtpNum2(it.jumlah||0)}</td>
      <td>${it.keterangan||'Jual Kredit'}</td>
      <td>
        <div class="input-with-btn">
          <input type="text" data-dtp-item-alasan="${idx}" value="${it.alasan||''}" readonly style="background:#f2f3f6;">
          ${!isView ? `<button type="button" class="icon-btn edit" data-dtp-item-alasan-pick="${idx}" title="Cari Alasan">${icon('search',12)}</button>` : ''}
        </div>
      </td>
      <td>
        <div class="input-with-btn">
          <input type="text" data-dtp-item-visit="${idx}" value="${it.tglVisit||''}" ${isView?'readonly':''}>
          <span class="icon-btn edit" style="pointer-events:none;">${icon('calendar',12)}</span>
        </div>
      </td>
      <td>${it.kolektorSebelumnya||''}</td>
      <td data-dtp-item-kolektor="${idx}">${it.kolektorSaatIni||''}</td>
      <td>${it.tglTagihSebelumnya||''}</td>
      <td>${it.noPelunasan||''}</td>
      <td>${it.alasanSebelumnya||''}</td>
      <td style="text-align:center;">${!isView ? `<button type="button" class="icon-btn del" data-dtp-item-del="${idx}" title="Hapus Baris">${icon('trash',14)}</button>` : ''}</td>
    </tr>`).join('');
}

/* Modal "Daftar Tagih Piutang Item" — Ubah Alasan Belum Tagih dari list. */
function tplDtpAlasanModal(row){
  return `
    <div class="modal-box" style="max-width:620px;">
      <div class="modal-header"><span></span><span class="close" id="modalClose">&times;</span></div>
      <div class="modal-body">
        <div style="font-weight:800;font-size:17px;margin-bottom:10px;">Daftar Tagih Piutang Item</div>
        <div style="display:flex;gap:10px;margin-bottom:8px;">
          <select id="dtpAlasanModalSize" style="max-width:90px;"><option selected>10</option><option>25</option></select>
          <input type="text" id="dtpAlasanModalSearch" placeholder="Pencarian Global" style="flex:1;border:1px solid var(--blue);border-radius:6px;padding:7px 10px;font-size:12.5px;">
        </div>
        <div class="table-wrap"><table>
          <thead><tr><th style="width:170px;">No. Faktur</th><th>Alasan Belum Tertagih</th></tr></thead>
          <tbody id="dtpAlasanModalBody">${tplDtpAlasanModalRows(row.items)}</tbody>
        </table></div>
        <div class="pager" style="margin-top:10px;"><button>First</button><button>Previous</button><button class="active">1</button><button>Next</button><button>Last</button></div>
      </div>
      <div class="modal-footer"><button class="btn-primary" id="dtpAlasanSimpan">Simpan</button></div>
    </div>`;
}

function tplDtpAlasanModalRows(items, q){
  const list = (items||[]).map((it,idx)=>({it,idx})).filter(x => !q || x.it.noFaktur.toLowerCase().includes(q) || (x.it.alasan||'').toLowerCase().includes(q));
  if(!list.length) return `<tr><td colspan="2" style="color:var(--text-light);">Tidak ada faktur</td></tr>`;
  return list.map(({it,idx})=>`
    <tr>
      <td>${it.noFaktur}</td>
      <td>
        <div class="input-with-btn">
          <input type="text" data-dtp-modal-alasan="${idx}" value="${it._alasanBaru!=null?it._alasanBaru:(it.alasan||'')}" readonly style="background:#f2f3f6;">
          <button type="button" class="icon-btn edit" data-dtp-modal-alasan-pick="${idx}" title="Cari Alasan">${icon('search',12)}</button>
        </div>
      </td>
    </tr>`).join('');
}

/* Picker Alasan Belum Tertagih / Kolektor / Faktur — salinan lokal. */
function tplDtpAlasanPicker(list){
  return `
    <div class="modal-box" style="max-width:560px;">
      <div class="modal-header"><span>Pilih Alasan Belum Tertagih</span><span class="close" id="modalClose">&times;</span></div>
      <div class="modal-body">
        <input type="text" id="dtpAlasanPickerSearch" placeholder="Cari kode / nama alasan..." style="width:100%;border:1px solid var(--border);border-radius:6px;padding:8px 10px;font-size:12.8px;margin-bottom:12px;">
        <div class="table-wrap" style="max-height:340px;overflow:auto;">
          <table>
            <thead><tr><th style="width:90px;">Kode</th><th>Alasan</th><th></th></tr></thead>
            <tbody id="dtpAlasanPickerBody">${tplDtpAlasanPickerRows(list)}</tbody>
          </table>
        </div>
      </div>
      <div class="modal-footer"><button class="btn-secondary" id="modalCancel">Tutup</button></div>
    </div>`;
}

function tplDtpAlasanPickerRows(list){
  if(!list.length) return `<tr><td colspan="3" style="color:var(--text-light);">Tidak ada alasan ditemukan</td></tr>`;
  return list.map(a=>`
    <tr><td>${a.kode}</td><td>${a.nama}</td><td><button class="btn-pick" data-pick-alasan="${a.kode}">Pilih</button></td></tr>`).join('');
}

function tplDtpKolektorPicker(list){
  return `
    <div class="modal-box" style="max-width:480px;">
      <div class="modal-header"><span>Pilih Kolektor</span><span class="close" id="modalClose">&times;</span></div>
      <div class="modal-body">
        <div class="table-wrap" style="max-height:340px;overflow:auto;"><table>
          <thead><tr><th>Nama</th><th>Area</th><th></th></tr></thead>
          <tbody>${list.map(k=>`<tr><td>${k.nama}</td><td>${k.area||''}</td><td><button class="btn-pick" data-pick-kolektor="${k.nama}">Pilih</button></td></tr>`).join('')}</tbody>
        </table></div>
      </div>
      <div class="modal-footer"><button class="btn-secondary" id="modalCancel">Tutup</button></div>
    </div>`;
}

function tplDtpFakturPicker(list){
  return `
    <div class="modal-box" style="max-width:760px;">
      <div class="modal-header"><span>Pilih Faktur Penjualan</span><span class="close" id="modalClose">&times;</span></div>
      <div class="modal-body">
        <input type="text" id="dtpFakturPickerSearch" placeholder="Cari no. faktur / customer..." style="width:100%;border:1px solid var(--border);border-radius:6px;padding:8px 10px;font-size:12.8px;margin-bottom:12px;">
        <div class="table-wrap" style="max-height:340px;overflow:auto;">
          <table>
            <thead><tr><th>No. Faktur</th><th>Tgl. Faktur</th><th>Customer</th><th class="text-right">Jumlah</th><th></th></tr></thead>
            <tbody id="dtpFakturPickerBody">${tplDtpFakturPickerRows(list)}</tbody>
          </table>
        </div>
      </div>
      <div class="modal-footer"><button class="btn-secondary" id="modalCancel">Tutup</button></div>
    </div>`;
}

function tplDtpFakturPickerRows(list){
  if(!list.length) return `<tr><td colspan="5" style="color:var(--text-light);">Tidak ada faktur ditemukan</td></tr>`;
  return list.map(f=>`
    <tr><td>${f.no}</td><td>${f.tglFaktur||''}</td><td>${f.customerNama||''}</td><td class="text-right">${dtpNum2(f.jumlahAkhir||0)}</td><td><button class="btn-pick" data-pick-faktur="${f.no}">Pilih</button></td></tr>`).join('');
}

/* ===== Cetakan 1 — "DAFTAR TAGIH" Full Page (replika PDF) ===== */
function tplDtpCetakFull(row){
  const td = 'border:1px solid #111;padding:3px 5px;font-size:10.5px;';
  const kodeOf = (nama) => { const c = (DATA.customers||[]).find(x => x.nama === nama); return c ? c.kode : ''; };
  const rows = (row.items||[]).map((it)=>`
    <tr>
      <td style="${td}text-align:center;">${kodeOf(it.customerNama)||it.customerKode||''}</td>
      <td style="${td}">${(it.customerNama||'').toUpperCase()}</td>
      <td style="${td}text-align:center;">${it.badanUsaha||''}</td>
      <td style="${td}text-align:center;">${it.noFaktur}</td>
      <td style="${td}text-align:center;">${it.tglFaktur||''}<br>${it.jamFaktur||''}</td>
      <td style="${td}text-align:center;">${it.tglJthTempo||''}<br>${it.jamFaktur||''}</td>
      <td style="${td}text-align:right;">${dtpNum2(it.jumlah)}</td>
      <td style="${td}"></td><td style="${td}"></td><td style="${td}"></td>
      <td style="${td}"></td><td style="${td}"></td><td style="${td}"></td><td style="${td}"></td>
    </tr>`).join('');
  return `
    <div class="modal-box" style="max-width:1060px;width:97vw;">
      <div class="modal-header"><span>${icon('printer',15)} Daftar Tagih (Full Page) — ${row.no}</span><span class="close" id="modalClose">&times;</span></div>
      <div class="modal-body" style="max-height:76vh;overflow:auto;">
        <div style="background:#fff;border:1px solid var(--border);padding:20px 24px;font-family:Arial,Helvetica,sans-serif;color:#111;min-width:960px;">
          <div style="display:flex;justify-content:space-between;align-items:flex-start;">
            <div style="font-weight:800;font-size:14px;">PT. DISTRIVERSA BUANAMAS</div>
            <div style="font-size:11px;"><b>Tgl Print : ${row.tgl||''}</b> &nbsp;&nbsp; <span style="font-size:10px;">1/1</span></div>
          </div>
          <div style="text-align:center;font-weight:800;font-size:13.5px;text-decoration:underline;margin:2px 0 10px;">DAFTAR TAGIH</div>
          <table style="border:none;font-size:11px;"><tbody>
            <tr><td style="padding:1px 4px;width:64px;"><b>Nomor</b></td><td style="padding:1px 4px;">: ${row.no}</td></tr>
            <tr><td style="padding:1px 4px;"><b>Tanggal</b></td><td style="padding:1px 4px;">: ${row.tgl||''} ${row.jam||''}</td></tr>
            <tr><td style="padding:1px 4px;"><b>Sales</b></td><td style="padding:1px 4px;">: ${row.kolektor||''}</td></tr>
          </tbody></table>
          <table style="width:100%;border-collapse:collapse;margin-top:4px;">
            <thead>
              <tr>
                <th rowspan="2" style="${td}width:56px;">Kode<br>Customer</th>
                <th rowspan="2" style="${td}">Nama Customer</th>
                <th rowspan="2" style="${td}width:66px;">Badan Usaha</th>
                <th rowspan="2" style="${td}width:120px;">No. Faktur</th>
                <th rowspan="2" style="${td}width:80px;">Tgl. Faktur</th>
                <th rowspan="2" style="${td}width:84px;">Tgl. Jth. Tempo</th>
                <th rowspan="2" style="${td}width:88px;">Jumlah</th>
                <th rowspan="2" style="${td}width:40px;">Cash</th>
                <th colspan="2" style="${td}text-align:center;">Pembayaran</th>
                <th colspan="2" style="${td}text-align:center;">Potongan</th>
                <th rowspan="2" style="${td}width:52px;">Kembali</th>
                <th rowspan="2" style="${td}width:72px;">Keterangan</th>
              </tr>
              <tr>
                <th style="${td}width:70px;">Giro/Transfer</th>
                <th style="${td}width:40px;">Bank</th>
                <th style="${td}width:56px;">Bank</th>
                <th style="${td}width:40px;">SSP</th>
              </tr>
            </thead>
            <tbody>${rows}</tbody>
          </table>
          <div style="display:flex;justify-content:space-between;margin-top:26px;font-size:11.5px;">
            <div style="padding-left:70px;"><b>Penerima,</b></div>
            <div style="padding-right:60px;"><b>Penanggung Jawab ,</b></div>
          </div>
          <div style="display:flex;justify-content:space-between;margin-top:48px;font-size:11.5px;">
            <div style="padding-left:20px;">(&nbsp;<span style="display:inline-block;width:150px;border-bottom:1px solid #111;"></span>&nbsp;)</div>
            <div style="padding-right:16px;">(&nbsp;<span style="display:inline-block;width:150px;border-bottom:1px solid #111;"></span>&nbsp;)</div>
          </div>
        </div>
      </div>
      <div class="modal-footer"><button class="btn-secondary" id="modalCancel">Tutup</button></div>
    </div>`;
}

/* ===== Cetakan 2 — "Kwitansi" / Perincian Nota Piutang (replika PDF) ===== */
function tplDtpCetakKwitansi(row){
  const td = 'border:1px solid #111;padding:3px 6px;font-size:11px;';
  const cust = (DATA.customers||[]).find(c => c.nama === row.customerNama) || {};
  const rows = (row.items||[]).map((it,i)=>`
    <tr>
      <td style="${td}text-align:center;width:28px;">${i+1}</td>
      <td style="${td}">${it.noFaktur}</td>
      <td style="${td}text-align:center;">${it.tglFaktur||''}</td>
      <td style="${td}text-align:center;">${it.tglJthTempo||''}<br>${it.jamFaktur||''}</td>
      <td style="${td}text-align:right;">${dtpNum2(it.jumlah)}</td>
    </tr>`).join('');
  return `
    <div class="modal-box" style="max-width:1000px;width:97vw;">
      <div class="modal-header"><span>${icon('printer',15)} Kwitansi — ${row.no}</span><span class="close" id="modalClose">&times;</span></div>
      <div class="modal-body" style="max-height:76vh;overflow:auto;">
        <div style="background:#fff;border:1px solid var(--border);padding:22px 28px;font-family:Arial,Helvetica,sans-serif;color:#111;min-width:900px;">
          <div style="text-align:center;font-weight:800;font-size:14px;margin-bottom:8px;">Perincian Nota Piutang &amp; Tanda Terima Pembayaran</div>
          <div style="display:flex;justify-content:space-between;align-items:flex-start;">
            <div style="font-weight:800;font-size:15px;padding-left:60px;">DBM</div>
            <table style="border-collapse:collapse;min-width:440px;"><tbody>
              <tr><td style="${td}width:70px;">Nama</td><td style="${td}">${(row.customerNama||'').toUpperCase()}</td></tr>
              <tr><td style="${td}">Alamat</td><td style="${td}">${(row.customerAlamat||cust.alamat||'').toUpperCase()}</td></tr>
              <tr><td style="${td}">Tanggal</td><td style="${td}">${row.tgl||''}</td></tr>
            </tbody></table>
          </div>
          <div style="display:flex;gap:26px;margin-top:18px;align-items:flex-start;">
            <table style="border-collapse:collapse;flex:1;">
              <thead>
                <tr><th colspan="5" style="${td}text-align:center;">Perincian Sisa Piutang</th></tr>
                <tr>
                  <th style="${td}width:28px;">No</th><th style="${td}">No Nota</th><th style="${td}width:80px;">Tgl Nota</th><th style="${td}width:84px;">Tgl Tempo</th><th style="${td}width:104px;">Sisa Nota</th>
                </tr>
              </thead>
              <tbody>${rows}
                <tr><td colspan="5" style="border:1px solid #111;height:14px;"></td></tr>
              </tbody>
            </table>
            <table style="border-collapse:collapse;flex:1;">
              <thead>
                <tr><th colspan="4" style="${td}text-align:center;">Pembayaran</th></tr>
                <tr><th style="${td}">Bank</th><th style="${td}">Tanggal</th><th style="${td}">No Ac/Giro</th><th style="${td}width:104px;">Jumlah</th></tr>
              </thead>
              <tbody>
                <tr><td style="${td}height:26px;"></td><td style="${td}"></td><td style="${td}"></td><td style="${td}"></td></tr>
                <tr><td style="${td}height:26px;"></td><td style="${td}"></td><td style="${td}"></td><td style="${td}"></td></tr>
                <tr><td colspan="3" style="${td}text-align:right;font-weight:800;">Total</td><td style="${td}"></td></tr>
                <tr><td colspan="4" style="${td}height:34px;vertical-align:top;font-size:10px;">Terbilang</td></tr>
              </tbody>
            </table>
          </div>
          <div style="display:flex;justify-content:space-between;margin-top:20px;font-size:11.5px;">
            <div style="padding-left:90px;"><b>Dibuat Oleh</b></div>
            <div><b>Konsumen</b></div>
            <div style="padding-right:70px;"><b>Sales/Collector</b></div>
          </div>
          <div style="display:flex;justify-content:space-between;margin-top:46px;font-size:11.5px;">
            <div style="padding-left:56px;">(&nbsp;<span style="display:inline-block;width:130px;border-bottom:1px solid #111;"></span>&nbsp;)</div>
            <div>(&nbsp;<span style="display:inline-block;width:130px;border-bottom:1px solid #111;"></span>&nbsp;)</div>
            <div style="padding-right:36px;">(&nbsp;<span style="display:inline-block;width:130px;border-bottom:1px solid #111;"></span>&nbsp;)</div>
          </div>
          <div style="font-size:10.5px;margin-top:16px;">- Pembayaran dianggap lunas bila cek/ giro sudah diuangkan</div>
          <div style="font-size:10.5px;margin-top:6px;">- Retur / Refaksi tanpa ada bukti yang sudah disetujui oleh pihak perusahaan, tidak dapat dipotongkan</div>
        </div>
      </div>
      <div class="modal-footer"><button class="btn-secondary" id="modalCancel">Tutup</button></div>
    </div>`;
}

function tplDtpDeleteConfirm(row){
  return `
    <div class="modal-box">
      <div class="modal-header"><span>Hapus Daftar Tagih Piutang</span><span class="close" id="modalClose">&times;</span></div>
      <div class="modal-body"><p>Yakin ingin menghapus <b>${row.no}</b> — ${(row.customerNama||'').toUpperCase()} (${dtpNum2(dtpJumlahAkhir(row))})?</p></div>
      <div class="modal-footer">
        <button class="btn-secondary" id="modalCancel">Batal</button>
        <button class="btn-danger" id="modalDelete">Hapus</button>
      </div>
    </div>`;
}

function tplDtpInfoModal(title,text){
  return `
    <div class="modal-box">
      <div class="modal-header"><span>${title}</span><span class="close" id="modalClose">&times;</span></div>
      <div class="modal-body"><p>${text}</p></div>
      <div class="modal-footer"><button class="btn-primary" id="modalOk">Mengerti</button></div>
    </div>`;
}
