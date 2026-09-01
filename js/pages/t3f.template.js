/* =========================================================
   TEMPLATE (HTML saja) — T3F / Tanda Terima Tukar Faktur
   (Customer & Penjualan > Daftar Transaksi > T3F, key
   page:'t3f'). Semua fungsi di file ini HANYA menyusun &
   mengembalikan markup HTML (string) atau helper murni, TIDAK
   ada DOM-binding/mutation. Logic-nya di file sebelah: t3f.js
   NB: closeModal() dipakai bersama, didefinisikan di core.js.

   Sesuai 4 screenshot MASERP SDL + 2 PDF cetakan yang dikirim
   user 2026-09-01 (data SDL Total Record: 8331 dipetakan ke
   master DBM — 8 sample dari DATA.fakturPenjualanSJ):
   1) List "Daftar T3F": chip "Semua" (FUNGSIONAL:
      Semua/September/Agustus 2026) + Tambah; kolom No.
      Transaksi (link biru -> Ubah, sort) / Customer (sort) /
      Tgl. Tanda Terima (sort) / No. Faktur (gabungan ';' bila
      lebih dari satu, sort) / Jumlah Akhir (sort) / Tgl.
      Terima Customer (sort) + aksi: Terima (tombol oranye
      kalender -> modal "Update Tanggal Terima" + Submit Form,
      mengisi kolom Tgl. Terima Customer), Attach File (modal
      Choose File + Simpan — mockup, hanya nama file yang
      tersimpan), Cetak (tombol eye + caret -> DROPDOWN dua
      pilihan: Full Page / Half Page, membuka preview cetakan
      replika PDF), Hapus. Pager windowed.
   2) Form "+ T3F": Customer (picker — memuat faktur outstanding
      customer dari DATA.fakturPenjualanSJ sebagai baris
      ber-CHECKBOX); No. T3F "26/AL/HO/09/00001" readonly
      (format 26/AL/{cab}/09/{urut}); Tgl. T3F; Salesman (auto
      dari faktur/customer, editable); Keterangan. Tabel: cek /
      No. Faktur / Tgl. Faktur / Tgl. Jth. Tempo / Kurs (IDR) /
      P.O. Customer / Jumlah (semua readonly); Jumlah total =
      Σ baris tercentang (recalc live). Footer: Cetak dan
      Simpan (buka cetakan Full Page) / Simpan / Batalkan.
   3) Cetakan FULL PAGE (replika "Tanda Terima Full Page.pdf",
      kop SDL -> DBM): kop + "1/1", judul TANDA TERIMA, No.
      Tanda Terima/Tanggal (format "24 Agustus 2026"), "Kami
      adalah : {CUSTOMER}", "menyatakan telah terima tagihan
      dari : {SALESMAN}", Alamat, tabel No./Nomor Invoice/No.
      Surat Jalan/Tanggal Transaksi/Tanggal Jatuh Tempo/Jumlah,
      body TINGGI (1 halaman penuh), footer Terbilang + Grand
      Total, Catatan, "Yang Menerima," + ", {tanggal}", 2 garis
      tanda tangan.
   4) Cetakan HALF PAGE (replika "Tanda Terima.pdf"): ringkas,
      TANPA kolom No. Surat Jalan, + baris "Pembayaran
      ditujukan: PT DISTRIVERSA BUANAMAS  VA BCA : {va}" (VA
      dari DATA.masterBank sesuai cabang, fallback baris
      pertama), "Yang Menerima," + "Tgl Terima :", 2 garis
      tanda tangan. */

const T3F_BULAN_LIST = [
  {label:'Semua', mm:''},
  {label:'September 2026', mm:'09'},
  {label:'Agustus 2026', mm:'08'},
];
const T3F_BULAN_NAMA = ['','Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember'];

function t3fNum2(n){ return Number(n||0).toLocaleString('id-ID', {minimumFractionDigits:2, maximumFractionDigits:2}); }
function t3fJumlahAkhir(r){ return (r.fakturs||[]).reduce((a,f)=> a + Number(f.jumlah||0), 0); }
function t3fNoFakturJoin(r){ return (r.fakturs||[]).map(f=>f.no).join(';'); }

/* "24/08/2026" -> "24 Agustus 2026" */
function t3fTglLong(t){
  const m = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(t||'');
  if(!m) return t||'';
  return `${parseInt(m[1],10)} ${T3F_BULAN_NAMA[parseInt(m[2],10)]||''} ${m[3]}`;
}

/* Terbilang id — salinan lokal (pola cetakan Retur Penjualan). */
function t3fTerbilang(n){
  const angka = ['','Satu','Dua','Tiga','Empat','Lima','Enam','Tujuh','Delapan','Sembilan','Sepuluh','Sebelas'];
  function terb(x){
    x = Math.floor(x);
    if(x < 12) return angka[x];
    if(x < 20) return terb(x-10) + ' Belas';
    if(x < 100) return (terb(Math.floor(x/10)) + ' Puluh ' + terb(x%10)).trim();
    if(x < 200) return ('Seratus ' + terb(x-100)).trim();
    if(x < 1000) return (terb(Math.floor(x/100)) + ' Ratus ' + terb(x%100)).trim();
    if(x < 2000) return ('Seribu ' + terb(x-1000)).trim();
    if(x < 1e6) return (terb(Math.floor(x/1000)) + ' Ribu ' + terb(x%1000)).trim();
    if(x < 1e9) return (terb(Math.floor(x/1e6)) + ' Juta ' + terb(x%1e6)).trim();
    if(x < 1e12) return (terb(Math.floor(x/1e9)) + ' Milyar ' + terb(x%1e9)).trim();
    return (terb(Math.floor(x/1e12)) + ' Triliun ' + terb(x%1e12)).trim();
  }
  const bulat = Math.floor(n);
  const sen = Math.round((n - bulat) * 100);
  let hasil = (terb(bulat) || 'Nol') + ' Rupiah';
  if(sen > 0) hasil += ' koma ' + terb(sen);
  return hasil.replace(/\s+/g,' ').trim();
}

/* =====================================================================
   LIST PAGE — "Daftar T3F"
===================================================================== */
function tplT3fListPage(bulan){
  return `
    <div class="breadcrumb">Home / Customer &amp; Penjualan / <b>T3F</b></div>
    <div class="card">
      <div class="card-header dark-header">
        <h3>${icon('alertTriangle',15)} Daftar T3F</h3>
        <div class="toolbar-actions">
          <select class="chip-btn" id="t3fFilterBulan">${T3F_BULAN_LIST.map(b=>`<option value="${b.mm}" ${bulan===b.mm?'selected':''}>${b.label}</option>`).join('')}</select>
          <button class="btn-primary" id="btnT3fAdd">${icon('plus',14)} Tambah</button>
        </div>
      </div>
      <div class="table-toolbar">
        <select id="t3fPageSize"><option selected>10</option><option>25</option><option>50</option></select>
        <input type="text" id="t3fSearch" placeholder="Pencarian Global">
      </div>
      <div class="table-wrap"><table>
        <thead><tr>
          <th style="width:170px;">${tplT3fSortHeader('No. Transaksi','no')}</th>
          <th>${tplT3fSortHeader('Customer','customerNama')}</th>
          <th style="width:130px;">${tplT3fSortHeader('Tgl. Tanda Terima','tgl')}</th>
          <th>${tplT3fSortHeader('No. Faktur','noFaktur')}</th>
          <th class="text-right" style="width:130px;">${tplT3fSortHeader('Jumlah Akhir','jumlahAkhir')}</th>
          <th style="width:140px;">${tplT3fSortHeader('Tgl. Terima Customer','tglTerimaCustomer')}</th>
          <th style="width:60px;">Terima</th>
          <th style="width:78px;">Attach File</th>
          <th style="width:66px;">Cetak</th>
          <th style="width:60px;">Hapus</th>
        </tr></thead>
        <tbody id="t3fTbody"></tbody>
      </table></div>
      <div class="table-footer"><div class="pager" id="t3fPager"></div><div id="t3fTotal"></div></div>
    </div>`;
}

function tplT3fSortHeader(label, field){
  return `<span data-t3f-sort="${field}" style="cursor:pointer;display:inline-flex;align-items:center;gap:4px;">${label}<span id="t3fSortIcon_${field}" style="color:var(--text-light);font-size:11px;">&#8693;</span></span>`;
}

function tplT3fRows(rows, page, pageSize){
  if(!rows.length) return `<tr><td colspan="10" style="color:var(--text-light);padding:14px;text-align:center;font-weight:600;">Tidak Ada Data</td></tr>`;
  const start = (page-1)*pageSize;
  return rows.slice(start, start+pageSize).map((r) => {
    const idx = DATA.t3f.indexOf(r);
    return `
    <tr>
      <td><a href="javascript:void(0)" data-t3f-edit="${idx}" style="color:var(--blue);font-weight:600;text-decoration:none;">${r.no}</a></td>
      <td>${(r.customerNama||'').toUpperCase()}</td>
      <td>${r.tgl||''}</td>
      <td style="max-width:280px;word-break:break-all;">${t3fNoFakturJoin(r)}</td>
      <td class="text-right">${t3fNum2(t3fJumlahAkhir(r))}</td>
      <td>${r.tglTerimaCustomer||''}</td>
      <td><button class="icon-btn" data-t3f-terima="${idx}" title="Update Tanggal Terima" style="background:#e8a33d;color:#fff;">${icon('calendar',15)}</button></td>
      <td><button class="icon-btn view" data-t3f-attach="${idx}" title="Attach File${r.attachFile ? ' — ' + r.attachFile : ''}">${icon('file',15)}</button></td>
      <td style="position:relative;">
        <button class="icon-btn view" data-t3f-cetak="${idx}" title="Cetak">${icon('eye',15)} <span style="font-size:9px;">&#9662;</span></button>
      </td>
      <td><button class="icon-btn del" data-t3f-del="${idx}" title="Hapus">${icon('trash',15)}</button></td>
    </tr>`;
  }).join('');
}

function tplT3fPager(page, totalPages){
  if(totalPages <= 1) return '';
  const windowSize = 7;
  let start = Math.max(1, page - Math.floor(windowSize/2));
  let end = Math.min(totalPages, start + windowSize - 1);
  start = Math.max(1, end - windowSize + 1);
  let nums = '';
  for(let p = start; p <= end; p++){
    nums += `<button class="${p===page?'active':''}" data-t3fpage="${p}">${p}</button>`;
  }
  return `
    <button data-t3fpage="1" ${page<=1?'disabled':''}>First</button>
    <button data-t3fpage="${Math.max(1,page-1)}" ${page<=1?'disabled':''}>Previous</button>
    ${nums}
    <button data-t3fpage="${Math.min(totalPages,page+1)}" ${page>=totalPages?'disabled':''}>Next</button>
    <button data-t3fpage="${totalPages}" ${page>=totalPages?'disabled':''}>Last</button>`;
}

/* Dropdown kecil pilihan cetakan (Full Page / Half Page). */
function tplT3fCetakMenu(idx){
  return `
    <div id="t3fCetakMenu" style="position:absolute;z-index:200;background:#fff;border:1px solid var(--border);border-radius:6px;box-shadow:0 4px 14px rgba(0,0,0,.16);min-width:120px;overflow:hidden;">
      <button data-t3f-cetak-full="${idx}" style="display:block;width:100%;border:none;background:none;padding:8px 14px;text-align:left;font-size:12.5px;cursor:pointer;">Full Page</button>
      <button data-t3f-cetak-half="${idx}" style="display:block;width:100%;border:none;background:none;padding:8px 14px;text-align:left;font-size:12.5px;cursor:pointer;border-top:1px solid var(--border);">Half Page</button>
    </div>`;
}

/* =====================================================================
   FORM (full page)
===================================================================== */
function tplT3fForm(mode, row, fakturList){
  const isAdd = mode === 'add';
  return `
    <div class="breadcrumb">Home / T3F / <b>${isAdd?'Tambah':'Ubah'}</b></div>
    <div class="card">
      <div class="card-header dark-header">
        <h3>${icon('plus',15)} T3F</h3>
        <button class="btn-danger" id="btnT3fTutorial">${icon('card',14)} Tutorial</button>
      </div>
      <div class="card-body">
        <div class="form-grid-3" style="grid-template-columns:repeat(3,1fr);align-items:end;">
          <h2 style="font-size:20px;font-weight:700;color:var(--navy);margin:0 0 10px;padding-bottom:10px;border-bottom:1px solid var(--border);">T3F</h2>
          <div class="form-group"></div>
          <div class="form-group"></div>
        </div>
        <div class="form-grid-3" style="grid-template-columns:1.4fr 1fr 1fr;">
          <div class="form-group">
            <label>Customer</label>
            <div class="input-with-btn">
              <input type="text" id="fT3fCustomer" value="${(row.customerNama||'').toUpperCase()}" placeholder="Pilih Customer" readonly style="background:#f2f3f6;">
              <button type="button" class="icon-btn edit" id="t3fCustomerSearch" title="Cari Customer">${icon('search',13)}</button>
            </div>
          </div>
          <div class="form-group"></div>
          <div class="form-group"></div>
        </div>
        <div class="form-grid-3" style="grid-template-columns:repeat(4,1fr);">
          <div class="form-group"></div>
          <div class="form-group">
            <label>No. T3F</label>
            <input type="text" id="fT3fNo" value="${row.no||''}" readonly style="background:#f2f3f6;color:var(--text-light);">
          </div>
          <div class="form-group">
            <label>Tgl. T3F</label>
            <div class="input-with-btn">
              <input type="text" id="fT3fTgl" value="${row.tgl||''}" style="background:#f2f3f6;">
              <span class="icon-btn edit" style="pointer-events:none;">${icon('calendar',13)}</span>
            </div>
          </div>
          <div class="form-group">
            <label>Salesman</label>
            <input type="text" id="fT3fSalesman" value="${row.salesman||''}">
          </div>
        </div>
        <div class="form-grid-3" style="grid-template-columns:2fr 1.4fr;">
          <div class="form-group"></div>
          <div class="form-group">
            <label>Keterangan</label>
            <textarea id="fT3fKeterangan" class="po-textarea" rows="3">${row.keterangan||''}</textarea>
          </div>
        </div>

        <div class="table-wrap" style="margin-top:14px;">
          <table class="po-item-table">
            <thead><tr>
              <th style="width:36px;"></th>
              <th>No. Faktur</th>
              <th style="width:110px;">Tgl. Faktur</th>
              <th style="width:110px;">Tgl. Jth. Tempo</th>
              <th style="width:60px;">Kurs</th>
              <th>P.O. Customer</th>
              <th class="text-right" style="width:150px;">Jumlah</th>
            </tr></thead>
            <tbody id="t3fFakturBody">${tplT3fFakturRows(fakturList, row)}</tbody>
          </table>
        </div>
        <div style="display:flex;justify-content:flex-end;align-items:center;gap:10px;margin-top:14px;">
          <span style="font-size:12.5px;font-weight:600;">Jumlah</span>
          <input type="text" id="fT3fJumlah" value="${t3fNum2(t3fJumlahAkhir(row))}" disabled style="max-width:300px;text-align:right;font-weight:700;">
        </div>
      </div>
      <div class="card-footer" style="display:flex;gap:10px;justify-content:flex-end;align-items:center;padding:14px 20px;border-top:1px solid var(--border);">
        <button type="button" class="btn-teal" id="t3fCetakSimpan">Cetak dan Simpan</button>
        <button type="button" class="btn-primary" id="t3fSimpan">Simpan</button>
        <a href="#" id="t3fBatalkan" class="link-add" style="margin-top:0;">Batalkan</a>
      </div>
    </div>`;
}

function tplT3fFakturRows(fakturList, row){
  if(!fakturList || !fakturList.length) return `<tr><td colspan="7" style="color:var(--text-light);">Pilih Customer terlebih dahulu — faktur outstanding customer itu akan tampil di sini.</td></tr>`;
  const checked = new Set((row.fakturs||[]).map(f=>f.no));
  return fakturList.map((f,idx)=>`
    <tr>
      <td style="text-align:center;"><input type="checkbox" data-t3f-cek="${idx}" ${checked.has(f.no)?'checked':''} style="width:auto;"></td>
      <td><input type="text" value="${f.no}" readonly style="background:#f2f3f6;"></td>
      <td><input type="text" value="${f.tglFaktur||''}" readonly style="background:#f2f3f6;"></td>
      <td><input type="text" value="${f.tglJthTempo||''}" readonly style="background:#f2f3f6;"></td>
      <td><input type="text" value="${f.kurs||'IDR'}" readonly style="background:#f2f3f6;text-align:center;"></td>
      <td><input type="text" value="${f.po||''}" readonly style="background:#f2f3f6;"></td>
      <td><input type="text" value="${t3fNum2(f.jumlah||0)}" readonly style="background:#f2f3f6;text-align:right;"></td>
    </tr>`).join('');
}

/* Modal "Update Tanggal Terima" (tombol oranye kolom Terima). */
function tplT3fTerimaModal(row){
  return `
    <div class="modal-box" style="max-width:560px;">
      <div class="modal-header"><span></span><span class="close" id="modalClose">&times;</span></div>
      <div class="modal-body">
        <div style="font-weight:800;font-size:15px;margin-bottom:6px;">Update Tanggal Terima:</div>
        <label style="font-size:12.5px;font-weight:600;">Tanggal Terima</label>
        <div class="input-with-btn" style="margin-top:4px;">
          <input type="text" id="fT3fTglTerima" value="${row.tglTerimaCustomer||'01/09/2026'}" style="background:#f2f3f6;">
          <span class="icon-btn edit" style="pointer-events:none;">${icon('calendar',13)}</span>
        </div>
      </div>
      <div class="modal-footer"><button class="btn-primary" id="t3fSubmitTerima">Submit Form</button></div>
    </div>`;
}

/* Modal "Attach File" (kolom Attach File). */
function tplT3fAttachModal(row){
  return `
    <div class="modal-box" style="max-width:560px;">
      <div class="modal-header"><span></span><span class="close" id="modalClose">&times;</span></div>
      <div class="modal-body">
        <div style="font-weight:800;font-size:15px;margin-bottom:10px;">Attach File</div>
        <div style="display:flex;gap:10px;align-items:center;border:1px solid var(--border);border-radius:6px;padding:10px;">
          <input type="file" id="fT3fFile" style="flex:1;font-size:12.5px;">
          <button class="btn-primary" id="t3fSimpanFile">Simpan</button>
        </div>
        ${row.attachFile ? `<div style="font-size:12px;color:var(--text-light);margin-top:8px;">Lampiran saat ini: <b>${row.attachFile}</b></div>` : ''}
      </div>
    </div>`;
}

/* ===== Cetakan — replika 2 PDF ===== */
function tplT3fKop(){
  const ho = DATA.cabangMaster[0] || {};
  return `
    <div style="display:flex;justify-content:space-between;align-items:flex-start;">
      <div style="font-weight:800;font-size:16px;padding-left:60px;">DBM</div>
      <div style="font-size:10.5px;">1/1</div>
    </div>`;
}

function tplT3fCetakHeaderRows(row, compact){
  const td = 'padding:2px 4px;font-size:11.5px;vertical-align:top;';
  return `
    <table style="border:none;width:100%;font-size:11.5px;"><tbody>
      <tr>
        <td style="${td}width:140px;">No. Tanda Terima</td><td style="${td}width:6px;">:</td><td style="${td}">${row.no}</td>
        <td style="${td}width:70px;">Tanggal</td><td style="${td}width:6px;">:</td><td style="${td}">${t3fTglLong(row.tgl)}</td>
      </tr>
      <tr>
        <td style="${td}">Kami adalah</td><td style="${td}">:</td><td style="${td}"><b>${(row.customerNama||'').toUpperCase()}</b></td>
        <td style="${td}">Alamat</td><td style="${td}">:</td><td style="${td}">${(row.customerAlamat||'').toUpperCase()}</td>
      </tr>
      <tr>
        <td style="${td}" colspan="2">menyatakan telah terima tagihan dari :</td><td style="${td}">${(row.salesman||'').toUpperCase()}</td>
        <td style="${td}" colspan="3"></td>
      </tr>
    </tbody></table>
    <div style="font-size:11.5px;margin:6px 0 4px;">dengan perincian sebagai berikut</div>`;
}

function tplT3fCetakFull(row){
  const td = 'padding:3px 6px;font-size:11.5px;';
  const total = t3fJumlahAkhir(row);
  const rows = (row.fakturs||[]).map((f,i)=>`
    <tr>
      <td style="${td}text-align:center;width:34px;">${i+1}</td>
      <td style="${td}">${f.no}</td>
      <td style="${td}">${f.noSJ||''}</td>
      <td style="${td}">${f.tglFaktur||''}</td>
      <td style="${td}">${f.tglJthTempo||''}</td>
      <td style="${td}text-align:right;">${t3fNum2(f.jumlah)}</td>
    </tr>`).join('');
  return `
    <div class="modal-box" style="max-width:880px;width:96vw;">
      <div class="modal-header"><span>${icon('printer',15)} Tanda Terima (Full Page) — ${row.no}</span><span class="close" id="modalClose">&times;</span></div>
      <div class="modal-body" style="max-height:76vh;overflow:auto;">
        <div style="background:#fff;border:1px solid var(--border);padding:24px 30px;font-family:Arial,Helvetica,sans-serif;color:#111;">
          ${tplT3fKop()}
          <div style="text-align:center;font-weight:800;font-size:14px;margin:8px 0 10px;">TANDA TERIMA</div>
          ${tplT3fCetakHeaderRows(row)}
          <table style="width:100%;border-collapse:collapse;margin-top:4px;">
            <thead><tr style="border-top:2px solid #111;border-bottom:2px solid #111;">
              <th style="${td}width:34px;text-align:left;">No.</th>
              <th style="${td}text-align:left;">Nomor Invoice</th>
              <th style="${td}text-align:left;">No. Surat Jalan</th>
              <th style="${td}text-align:left;width:120px;">Tanggal Transaksi</th>
              <th style="${td}text-align:left;width:130px;">Tanggal Jatuh Tempo</th>
              <th style="${td}text-align:right;width:110px;">Jumlah</th>
            </tr></thead>
            <tbody>${rows}</tbody>
          </table>
          <div style="min-height:430px;"></div>
          <div style="border-top:2px solid #111;"></div>
          <table style="border:none;width:100%;font-size:11.5px;margin-top:6px;"><tbody>
            <tr>
              <td style="padding:2px 4px;width:64px;vertical-align:top;"><b>Terbilang</b></td>
              <td style="padding:2px 4px;width:8px;vertical-align:top;">:</td>
              <td style="padding:2px 4px;vertical-align:top;max-width:380px;">${t3fTerbilang(total)}</td>
              <td style="padding:2px 4px;text-align:right;vertical-align:top;width:100px;">Grand Total :</td>
              <td style="padding:2px 4px;text-align:right;vertical-align:top;width:110px;"><b>${t3fNum2(total)}</b></td>
            </tr>
            <tr><td style="padding:2px 4px;"><b>Catatan</b></td><td style="padding:2px 4px;">:</td><td colspan="3" style="padding:2px 4px;">${row.keterangan||''}</td></tr>
          </tbody></table>
          <div style="display:flex;justify-content:space-between;margin-top:14px;font-size:11.5px;">
            <div style="padding-left:60px;"><b>Yang&nbsp; Menerima,</b></div>
            <div style="padding-right:60px;"><b>, ${t3fTglLong(row.tgl)}</b></div>
          </div>
          <div style="display:flex;justify-content:space-between;margin-top:40px;font-size:11.5px;">
            <div style="padding-left:40px;">(&nbsp;<span style="display:inline-block;width:150px;border-bottom:1px solid #111;"></span>&nbsp;)</div>
            <div style="padding-right:40px;">(&nbsp;<span style="display:inline-block;width:150px;border-bottom:1px solid #111;"></span>&nbsp;)</div>
          </div>
        </div>
      </div>
      <div class="modal-footer"><button class="btn-secondary" id="modalCancel">Tutup</button></div>
    </div>`;
}

function tplT3fCetakHalf(row){
  const td = 'padding:3px 6px;font-size:11.5px;';
  const total = t3fJumlahAkhir(row);
  const cab = (row.cabang||'').toUpperCase();
  const bank = (DATA.masterBank||[]).find(b => cab && b.nama.toUpperCase().includes(cab)) || (DATA.masterBank||[])[0] || {};
  const rows = (row.fakturs||[]).map((f,i)=>`
    <tr>
      <td style="${td}text-align:center;width:34px;">${i+1}</td>
      <td style="${td}">${f.no}</td>
      <td style="${td}">${f.tglFaktur||''}</td>
      <td style="${td}">${f.tglJthTempo||''}</td>
      <td style="${td}text-align:right;">${t3fNum2(f.jumlah)}</td>
    </tr>`).join('');
  return `
    <div class="modal-box" style="max-width:880px;width:96vw;">
      <div class="modal-header"><span>${icon('printer',15)} Tanda Terima (Half Page) — ${row.no}</span><span class="close" id="modalClose">&times;</span></div>
      <div class="modal-body" style="max-height:76vh;overflow:auto;">
        <div style="background:#fff;border:1px solid var(--border);padding:20px 26px;font-family:Arial,Helvetica,sans-serif;color:#111;">
          ${tplT3fKop()}
          <div style="text-align:center;font-weight:800;font-size:13.5px;margin:6px 0 8px;">Tanda Terima</div>
          ${tplT3fCetakHeaderRows(row, true)}
          <table style="width:100%;border-collapse:collapse;margin-top:4px;">
            <thead><tr style="border-top:2px solid #111;border-bottom:2px solid #111;">
              <th style="${td}width:34px;text-align:left;">No.</th>
              <th style="${td}text-align:left;">Nomor Invoice</th>
              <th style="${td}text-align:left;width:130px;">Tgl Transaksi</th>
              <th style="${td}text-align:left;width:150px;">Tanggal Jatuh Tempo</th>
              <th style="${td}text-align:right;width:110px;">Jumlah</th>
            </tr></thead>
            <tbody>${rows}</tbody>
          </table>
          <div style="min-height:50px;"></div>
          <div style="border-top:2px solid #111;"></div>
          <table style="border:none;width:100%;font-size:11.5px;margin-top:6px;"><tbody>
            <tr>
              <td style="padding:2px 4px;width:64px;vertical-align:top;"><b>Terbilang</b></td>
              <td style="padding:2px 4px;width:8px;vertical-align:top;">:</td>
              <td style="padding:2px 4px;vertical-align:top;max-width:380px;">${t3fTerbilang(total)}</td>
              <td style="padding:2px 4px;text-align:right;vertical-align:top;width:100px;">Grand Total :</td>
              <td style="padding:2px 4px;text-align:right;vertical-align:top;width:110px;"><b>${t3fNum2(total)}</b></td>
            </tr>
            <tr><td style="padding:2px 4px;"><b>Catatan</b></td><td style="padding:2px 4px;">:</td><td colspan="3" style="padding:2px 4px;">${row.keterangan||''}</td></tr>
          </tbody></table>
          <div style="font-size:11.5px;margin-top:8px;">Pembayaran ditujukan:<b>PT DISTRIVERSA BUANAMAS</b> <b>VA BCA : ${bank.va||'-'}</b></div>
          <div style="display:flex;justify-content:space-between;margin-top:6px;font-size:11.5px;">
            <div style="padding-left:60px;"><b>Yang&nbsp; Menerima,</b></div>
          </div>
          <div style="font-size:10.5px;margin-top:2px;">Tgl Terima : ${row.tglTerimaCustomer||''}</div>
          <div style="display:flex;justify-content:flex-start;gap:180px;margin-top:26px;font-size:11.5px;">
            <div style="padding-left:40px;">(&nbsp;<span style="display:inline-block;width:140px;border-bottom:1px solid #111;"></span>&nbsp;)</div>
            <div>(&nbsp;<span style="display:inline-block;width:140px;border-bottom:1px solid #111;"></span>&nbsp;)</div>
          </div>
        </div>
      </div>
      <div class="modal-footer"><button class="btn-secondary" id="modalCancel">Tutup</button></div>
    </div>`;
}

/* Picker Customer — salinan lokal. */
function tplT3fCustomerPicker(list){
  return `
    <div class="modal-box" style="max-width:640px;">
      <div class="modal-header"><span>Pilih Customer</span><span class="close" id="modalClose">&times;</span></div>
      <div class="modal-body">
        <input type="text" id="t3fCustomerPickerSearch" placeholder="Cari kode / nama customer..." style="width:100%;border:1px solid var(--border);border-radius:6px;padding:8px 10px;font-size:12.8px;margin-bottom:12px;">
        <div class="table-wrap" style="max-height:360px;overflow:auto;">
          <table>
            <thead><tr><th>Kode</th><th>Nama Customer</th><th></th></tr></thead>
            <tbody id="t3fCustomerPickerBody">${tplT3fCustomerPickerRows(list)}</tbody>
          </table>
        </div>
      </div>
      <div class="modal-footer"><button class="btn-secondary" id="modalCancel">Tutup</button></div>
    </div>`;
}

function tplT3fCustomerPickerRows(list){
  if(!list.length) return `<tr><td colspan="3" style="color:var(--text-light);">Tidak ada customer ditemukan</td></tr>`;
  return list.map(c=>`
    <tr><td>${c.kode}</td><td>${c.nama}</td><td><button class="btn-pick" data-pick-customer="${c.kode}">Pilih</button></td></tr>`).join('');
}

function tplT3fDeleteConfirm(row){
  return `
    <div class="modal-box">
      <div class="modal-header"><span>Hapus T3F</span><span class="close" id="modalClose">&times;</span></div>
      <div class="modal-body"><p>Yakin ingin menghapus T3F <b>${row.no}</b> — ${(row.customerNama||'').toUpperCase()} (${t3fNum2(t3fJumlahAkhir(row))})?</p></div>
      <div class="modal-footer">
        <button class="btn-secondary" id="modalCancel">Batal</button>
        <button class="btn-danger" id="modalDelete">Hapus</button>
      </div>
    </div>`;
}

function tplT3fInfoModal(title,text){
  return `
    <div class="modal-box">
      <div class="modal-header"><span>${title}</span><span class="close" id="modalClose">&times;</span></div>
      <div class="modal-body"><p>${text}</p></div>
      <div class="modal-footer"><button class="btn-primary" id="modalOk">Mengerti</button></div>
    </div>`;
}
