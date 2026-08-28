/* =========================================================
   TEMPLATE (HTML saja) — Opname Faktur, Retur & Surat Jalan
   (Customer & Penjualan > Daftar Transaksi, page:'opnameDokumen' —
   menu BARU 2026-08-28). Semua fungsi di file ini HANYA menyusun &
   mengembalikan markup HTML (string), TIDAK ada logic/DOM-binding/
   data mutation di sini. Logic-nya di file sebelah: opname-dokumen.js

   Dibangun dari dokumen "Spesifikasi Aplikasi Web Opname Faktur,
   Retur & Surat Jalan" yang dikirim user 2026-08-28. Cakupan mockup:
   - MODUL A (Manajemen Stock Opname Dokumen) — PENUH: list + form
     dgn Cakupan Dokumen (Faktur/Retur/Surat Jalan), Metode
     Menyeluruh (Comprehensive) / Random By Filter (per Salesman /
     Collector / Inkaso), tombol Generate Daftar Dokumen (menarik
     dokumen dari data live), input Status Opname per dokumen
     (Ditemukan / Sesuai; Blank (Belum Diketemukan); Selisih / Tidak
     Sesuai — spec menyebut "status pilihan lainnya sesuai kebutuhan",
     Selisih dipilih sbg status ketiga yang paling umum), plus 3
     cetakan Review & Print-Out sesuai spec: (1) Rincian per Status
     ("Details Of Accounts Receivable By Status", bisa difilter mis.
     hanya Blank), (2) Receivables Opname Report — Summary By
     Salesman By Status, (3) Rekapitulasi Hasil Opname Keseluruhan.
   - MODUL B (Konfirmasi Outlet) — tombol "Form Konfirmasi Outlet" di
     header list: pilih outlet -> cetak langsung (Direct Print) form
     berisi rincian Faktur/Retur/S.J. OUTSTANDING outlet itu + kolom
     hasil konfirmasi & tanda tangan.
   - MODUL C (Pelunasan Faktur & Retur + DTH) TIDAK termasuk mockup
     ini — proses pelunasan sudah diwakili modul Penerimaan Piutang;
     DTH & role admin pusat/cabang dicatat sbg pengembangan terpisah.

   Sumber dokumen saat Generate (live, bukan statis):
   - Faktur      -> DATA.invoices (semua faktur tercatat sistem)
   - Retur       -> DATA.returPenjualanDocs (BARU — lihat js/data.js)
   - Surat Jalan -> noSJ tiap baris DATA.invoices (1 faktur = 1 SJ)
   Penugasan Collector/Inkaso per customer belum punya master di
   mockup ini — dihitung deterministik dari urutan customer
   (opdCollectorOf/opdInkasoOf di opname-dokumen.js, simplifikasi
   terdokumentasi). Pola list+form full page, print via window.open
   mengikuti Report Center. */

const OPD_STATUS_LIST = ['Ditemukan / Sesuai', 'Blank (Belum Diketemukan)', 'Selisih / Tidak Sesuai'];
const OPD_TIPE_PETUGAS = ['Inkaso', 'Internal Audit'];
const OPD_FILTER_BASIS = ['Salesman', 'Collector', 'Inkaso'];
const OPD_CABANG_LIST = ['Semua Cabang','Head Office','Surabaya','Bandung','Tangerang','Medan','Makassar','Semarang','Sidoarjo'];
const OPD_CABANG_CODE = {'Semua Cabang':'HO','Head Office':'HO','Surabaya':'SBY','Bandung':'BDG','Tangerang':'TGR','Medan':'MDN','Makassar':'MKS','Semarang':'SMG','Sidoarjo':'SDA'};

function opdNum2(n){
  return Number(n || 0).toLocaleString('id-ID', {minimumFractionDigits:2, maximumFractionDigits:2});
}

function opdCakupanLabel(c){
  const out = [];
  if(c && c.faktur) out.push('Faktur');
  if(c && c.retur) out.push('Retur');
  if(c && c.suratJalan) out.push('Surat Jalan');
  return out.join(', ') || '-';
}

function opdMetodeLabel(row){
  if(row.metode !== 'By Filter') return 'Menyeluruh';
  return `By Filter — ${row.filterBasis}: ${row.filterNilai || '-'}`;
}

function opdCountStatus(items, status){
  return (items || []).filter(it => it.statusOpname === status).length;
}

function tplOpnameDokumenListPage(){
  return `
    <div class="breadcrumb">Home / Customer &amp; Penjualan / <b>Opname Faktur, Retur &amp; S.J.</b></div>
    <div class="card">
      <div class="card-header dark-header">
        <h3>${icon('clipboard',15)} Daftar Opname Faktur, Retur &amp; Surat Jalan</h3>
        <div class="toolbar-actions">
          <button class="btn-teal" id="btnOpdKonfirmasiOutlet">${icon('printer',14)} Form Konfirmasi Outlet</button>
          <button class="btn-primary" id="btnOpdAdd">${icon('plus',14)} Tambah</button>
          <button class="btn-danger" id="btnOpdTutorial">${icon('card',14)} Tutorial</button>
        </div>
      </div>
      <div class="table-toolbar">
        <select><option selected>10</option><option>25</option><option>50</option></select>
        <input type="text" id="opdSearch" placeholder="Pencarian Global">
      </div>
      <div class="table-wrap"><table>
        <thead><tr>
          <th style="width:150px;">No. Opname</th>
          <th style="width:86px;">Tgl</th>
          <th>Petugas</th>
          <th>Metode</th>
          <th>Cakupan</th>
          <th class="text-right" style="width:64px;">Jml Dok</th>
          <th class="text-right" style="width:76px;">Ditemukan</th>
          <th class="text-right" style="width:56px;">Blank</th>
          <th class="text-right" style="width:56px;">Selisih</th>
          <th style="width:66px;">Status</th>
          <th style="width:52px;">Lihat</th>
          <th style="width:52px;">Ubah</th>
          <th style="width:56px;">Hapus</th>
        </tr></thead>
        <tbody id="opdTbody"></tbody>
      </table></div>
      <div class="table-footer"><div class="pager"><button>First</button><button>Previous</button><button class="active">1</button><button>Next</button><button>Last</button></div><div id="opdTotal"></div></div>
    </div>`;
}

function tplOpdRows(rows){
  if(!rows.length) return `<tr><td colspan="13" style="color:var(--text-light);padding:14px;">Belum ada transaksi opname.</td></tr>`;
  return rows.map((r,i)=>`
    <tr>
      <td><a href="javascript:void(0)" data-view="${i}" style="color:var(--blue);font-weight:600;text-decoration:none;">${r.no}</a></td>
      <td>${r.tgl||''}</td>
      <td>${r.petugas||''}<br><span style="font-size:11px;color:var(--text-light);">${r.tipePetugas||''}</span></td>
      <td>${opdMetodeLabel(r)}</td>
      <td>${opdCakupanLabel(r.cakupan)}</td>
      <td class="text-right">${(r.items||[]).length}</td>
      <td class="text-right">${opdCountStatus(r.items, OPD_STATUS_LIST[0])}</td>
      <td class="text-right" style="${opdCountStatus(r.items, OPD_STATUS_LIST[1])?'color:#c0392b;font-weight:700;':''}">${opdCountStatus(r.items, OPD_STATUS_LIST[1])}</td>
      <td class="text-right" style="${opdCountStatus(r.items, OPD_STATUS_LIST[2])?'color:#c0392b;font-weight:700;':''}">${opdCountStatus(r.items, OPD_STATUS_LIST[2])}</td>
      <td>${r.status==='Selesai' ? `<span class="st-open">Selesai</span>` : `<span style="color:var(--yellow);font-weight:700;">Draft</span>`}</td>
      <td><button class="icon-btn view" data-view="${i}" title="Lihat">${icon('eye',15)}</button></td>
      <td><button class="icon-btn edit" data-edit="${i}" title="Ubah">${icon('edit',15)}</button></td>
      <td><button class="icon-btn del" data-del="${i}" title="Hapus">${icon('trash',15)}</button></td>
    </tr>`).join('');
}

function tplOpdItemRows(items, isView){
  if(!items || !items.length){
    return `<tr><td colspan="9" style="color:var(--text-light);padding:12px;">Belum ada dokumen — atur Cakupan &amp; Metode lalu klik <b>Generate Daftar Dokumen</b>.</td></tr>`;
  }
  const dis = isView ? 'disabled' : '';
  return items.map((it,idx)=>`
    <tr>
      <td style="text-align:center;">${idx+1}</td>
      <td>${it.jenis}</td>
      <td>${it.no}</td>
      <td>${it.tgl||''}</td>
      <td>${it.customerNama||''}</td>
      <td>${it.salesman||''}</td>
      <td class="text-right">${opdNum2(it.nilai)}</td>
      <td style="width:190px;">
        <select data-opd-status="${idx}" ${dis}>
          ${OPD_STATUS_LIST.map(s=>`<option ${it.statusOpname===s?'selected':''}>${s}</option>`).join('')}
        </select>
      </td>
      <td style="width:190px;"><input type="text" data-opd-ket="${idx}" value="${it.ket||''}" placeholder="Keterangan" ${dis}></td>
    </tr>`).join('');
}

function tplOpdForm(mode, row){
  const isAdd = mode === 'add';
  const isView = mode === 'view';
  const dis = isView ? 'disabled' : '';
  const titleAction = isAdd ? 'Tambah' : (isView ? 'Lihat' : 'Ubah');
  const byFilter = row.metode === 'By Filter';
  return `
    <div class="breadcrumb">Home / Opname Faktur, Retur &amp; S.J. / <b>${titleAction}</b></div>
    <div class="card">
      <div class="card-header dark-header">
        <h3>${icon(isAdd?'plus':(isView?'eye':'edit'),15)} Stock Opname Faktur, Retur &amp; Surat Jalan</h3>
      </div>
      <div class="card-body">
        <div class="form-grid-3" style="grid-template-columns:repeat(4,1fr);">
          <div class="form-group">
            <label>No. Opname</label>
            <div class="input-with-btn">
              <input type="text" id="fOpdNo" value="${row.no||''}" readonly>
              ${isAdd ? `<button type="button" class="icon-btn edit" id="opdRefreshNo" title="Generate Nomor">${icon('refreshCw',13)}</button>` : ''}
            </div>
          </div>
          <div class="form-group">
            <label>Tgl. Opname</label>
            <div class="input-with-btn">
              <input type="text" id="fOpdTgl" value="${row.tgl||''}" ${dis}>
              <span class="icon-btn edit" style="pointer-events:none;">${icon('calendar',13)}</span>
            </div>
          </div>
          <div class="form-group">
            <label>Cabang</label>
            <select id="fOpdCabang" ${dis}>${OPD_CABANG_LIST.map(c=>`<option ${row.cabang===c?'selected':''}>${c}</option>`).join('')}</select>
          </div>
          <div class="form-group">
            <label>Status Opname</label>
            <select id="fOpdStatus" ${dis}>
              <option ${row.status!=='Selesai'?'selected':''}>Draft</option>
              <option ${row.status==='Selesai'?'selected':''}>Selesai</option>
            </select>
          </div>
          <div class="form-group">
            <label>Tipe Petugas</label>
            <select id="fOpdTipePetugas" ${dis}>${OPD_TIPE_PETUGAS.map(t=>`<option ${row.tipePetugas===t?'selected':''}>${t}</option>`).join('')}</select>
          </div>
          <div class="form-group">
            <label>Nama Petugas</label>
            <input type="text" id="fOpdPetugas" value="${row.petugas||''}" placeholder="Nama petugas Inkaso / Internal Audit" ${dis}>
          </div>
          <div class="form-group" style="grid-column:span 2;">
            <label>Keterangan</label>
            <input type="text" id="fOpdKeterangan" value="${row.keterangan||''}" placeholder="Keterangan opname" ${dis}>
          </div>
        </div>

        <div class="form-section">${icon('list',15)} Cakupan Dokumen &amp; Metode Pelaksanaan</div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:18px;">
          <div>
            <div class="form-group">
              <label>Cakupan Dokumen</label>
              <div style="display:flex;gap:18px;flex-wrap:wrap;padding:6px 0;">
                <label style="display:flex;align-items:center;gap:6px;font-weight:400;font-size:12.8px;cursor:pointer;"><input type="checkbox" id="fOpdCakFaktur" ${row.cakupan.faktur?'checked':''} ${dis} style="width:auto;"> Faktur</label>
                <label style="display:flex;align-items:center;gap:6px;font-weight:400;font-size:12.8px;cursor:pointer;"><input type="checkbox" id="fOpdCakRetur" ${row.cakupan.retur?'checked':''} ${dis} style="width:auto;"> Retur</label>
                <label style="display:flex;align-items:center;gap:6px;font-weight:400;font-size:12.8px;cursor:pointer;"><input type="checkbox" id="fOpdCakSJ" ${row.cakupan.suratJalan?'checked':''} ${dis} style="width:auto;"> Surat Jalan</label>
              </div>
            </div>
          </div>
          <div>
            <div class="form-group">
              <label>Metode Pelaksanaan Opname</label>
              <div class="radio-inline">
                <label><input type="radio" name="fOpdMetode" value="Menyeluruh" ${!byFilter?'checked':''} ${dis}> Menyeluruh (Comprehensive)</label>
                <label><input type="radio" name="fOpdMetode" value="By Filter" ${byFilter?'checked':''} ${dis}> Random / By Filter</label>
              </div>
            </div>
            <div id="opdFilterWrap" style="display:${byFilter?'flex':'none'};gap:10px;">
              <div class="form-group" style="flex:0 0 160px;">
                <label>Basis Filter</label>
                <select id="fOpdFilterBasis" ${dis}>${OPD_FILTER_BASIS.map(b=>`<option ${row.filterBasis===b?'selected':''}>${b}</option>`).join('')}</select>
              </div>
              <div class="form-group" style="flex:1;">
                <label>Nilai Filter</label>
                <select id="fOpdFilterNilai" ${dis}></select>
              </div>
            </div>
          </div>
        </div>

        <div class="card-header dark-header" style="border-radius:6px;margin:14px 0 10px;">
          <h3>${icon('clipboard',14)} Daftar Dokumen Hasil Opname</h3>
          ${!isView ? `<button class="btn-teal" id="btnOpdGenerate">${icon('refreshCw',14)} Generate Daftar Dokumen</button>` : ''}
        </div>
        <div class="table-wrap">
          <table class="po-item-table">
            <thead><tr>
              <th style="width:36px;">No.</th>
              <th style="width:90px;">Jenis Dok.</th>
              <th style="width:150px;">No. Dokumen</th>
              <th style="width:84px;">Tgl. Dok.</th>
              <th>Customer / Outlet</th>
              <th style="width:120px;">Salesman</th>
              <th class="text-right" style="width:110px;">Nilai</th>
              <th>Status Opname</th>
              <th>Keterangan</th>
            </tr></thead>
            <tbody id="opdItemsBody">${tplOpdItemRows(row.items, isView)}</tbody>
          </table>
        </div>

        <div id="opdRingkasan" style="display:flex;gap:26px;flex-wrap:wrap;margin-top:12px;font-size:12.6px;">${tplOpdRingkasan(row.items)}</div>

        <div class="form-section">${icon('printer',15)} Review &amp; Print-Out Rincian</div>
        <div style="display:flex;gap:10px;flex-wrap:wrap;align-items:flex-end;">
          <div class="form-group" style="margin-bottom:0;min-width:230px;">
            <label>Cetak Rincian Berdasarkan Status</label>
            <select id="fOpdCetakStatus">
              <option value="">Semua Status</option>
              ${OPD_STATUS_LIST.map(s=>`<option>${s}</option>`).join('')}
            </select>
          </div>
          <button type="button" class="btn-teal" id="btnOpdCetakRincian">${icon('printer',14)} Cetak Rincian per Status</button>
          <button type="button" class="btn-teal" id="btnOpdCetakSummary">${icon('printer',14)} Summary By Salesman By Status</button>
          <button type="button" class="btn-teal" id="btnOpdCetakRekap">${icon('printer',14)} Rekapitulasi Hasil Opname</button>
        </div>

        <div style="font-size:11.8px;color:var(--text-light);margin-top:16px;line-height:1.7;">
          ${row.tglInput ? `Tgl. Input : ${row.tglInput}  User Entry : ${row.userEntry||''}` : ''}
        </div>

        <div class="form-page-actions">
          ${isView
            ? `<a href="#" id="opdTutup" class="link-add" style="margin-right:auto;">&larr; Kembali ke Daftar</a>`
            : `<a href="#" id="opdBatalkan" class="link-add" style="margin-right:auto;">Batalkan</a>
               <button class="btn-primary" id="opdSimpan">Simpan</button>`}
        </div>
      </div>
    </div>`;
}

function tplOpdRingkasan(items){
  const total = (items || []).length;
  const nilai = (items || []).reduce((s,it)=>s+(+it.nilai||0),0);
  return `
    <span>Total Dokumen: <b>${total}</b></span>
    <span>Total Nilai: <b>${opdNum2(nilai)}</b></span>
    <span style="color:#1e8449;">Ditemukan / Sesuai: <b>${opdCountStatus(items, OPD_STATUS_LIST[0])}</b></span>
    <span style="color:#c0392b;">Blank (Belum Diketemukan): <b>${opdCountStatus(items, OPD_STATUS_LIST[1])}</b></span>
    <span style="color:#b9770e;">Selisih / Tidak Sesuai: <b>${opdCountStatus(items, OPD_STATUS_LIST[2])}</b></span>`;
}

/* ===== Kerangka dokumen cetak bersama (toolbar Cetak/Tutup + header
   perusahaan) — pola yang sama dgn dokumen cetak Report Center. ===== */
function tplOpdDocShell(title, subLines, bodyHtml){
  return `<!DOCTYPE html>
<html><head><meta charset="utf-8"><title>${title}</title>
<style>
  body{font-family:Arial, Helvetica, sans-serif;font-size:11px;color:#111;margin:20px;}
  .rc-doc-toolbar{margin-bottom:10px;}
  .rc-doc-toolbar button{padding:7px 16px;border:none;border-radius:5px;font-size:12.5px;font-weight:600;cursor:pointer;margin-right:8px;}
  .rc-doc-toolbar .btn-print{background:#4472c4;color:#fff;}
  .rc-doc-toolbar .btn-close{background:#eef1f7;color:#333;}
  .doc-company{font-weight:700;font-size:13.5px;text-align:center;}
  h1{font-size:13.5px;text-align:center;margin:2px 0;text-transform:uppercase;}
  .sub{font-size:10.8px;text-align:center;margin:0 0 2px;}
  table{width:100%;border-collapse:collapse;margin-top:10px;}
  th,td{border:1px solid #999;padding:3px 6px;font-size:10.4px;}
  thead th{background:#f0f0f0;text-align:center;font-weight:700;}
  tfoot td{font-weight:700;background:#f7f7f7;}
  .sign-row{display:flex;justify-content:space-between;margin-top:34px;font-size:11px;text-align:center;}
  .sign-box{width:200px;}
  .sign-line{margin-top:52px;border-top:1px solid #333;padding-top:4px;}
  @media print{ .rc-doc-toolbar{display:none;} body{margin:0;} }
</style></head>
<body>
  <div class="rc-doc-toolbar">
    <button class="btn-print" onclick="window.print()">Cetak</button>
    <button class="btn-close" onclick="window.close()">Tutup</button>
  </div>
  <div class="doc-company">PT Distriversa Buanamas</div>
  <h1>${title}</h1>
  ${subLines.map(s=>`<div class="sub">${s}</div>`).join('')}
  ${bodyHtml}
</body></html>`;
}

/* (1) Rincian hasil opname per status — "Details Of Accounts
   Receivable By Status" (spec 2.A: bisa cetak hanya status tertentu,
   misal hanya Blank). */
function tplOpdDocRincian(row, statusFilter, printedAt){
  const items = (row.items||[]).filter(it => !statusFilter || it.statusOpname === statusFilter);
  const totalNilai = items.reduce((s,it)=>s+(+it.nilai||0),0);
  const body = `
    <table>
      <thead><tr>
        <th style="width:30px;">No.</th><th>Jenis Dok.</th><th>No. Dokumen</th><th>Tgl. Dok.</th>
        <th>Customer / Outlet</th><th>Salesman</th><th style="width:100px;">Nilai</th><th>Status Opname</th><th>Keterangan</th>
      </tr></thead>
      <tbody>${items.length ? items.map((it,i)=>`
        <tr>
          <td style="text-align:center;">${i+1}</td>
          <td>${it.jenis}</td><td>${it.no}</td><td>${it.tgl||''}</td>
          <td>${it.customerNama||''}</td><td>${it.salesman||''}</td>
          <td style="text-align:right;">${opdNum2(it.nilai)}</td>
          <td>${it.statusOpname}</td><td>${it.ket||''}</td>
        </tr>`).join('') : `<tr><td colspan="9" style="text-align:center;color:#777;padding:12px;">Tidak ada dokumen dengan status ini.</td></tr>`}
      </tbody>
      <tfoot><tr>
        <td colspan="6" style="text-align:right;">Total (${items.length} dokumen) :</td>
        <td style="text-align:right;">${opdNum2(totalNilai)}</td><td colspan="2"></td>
      </tr></tfoot>
    </table>
    <div style="margin-top:20px;font-size:11px;">Petugas: ${row.petugas||''} (${row.tipePetugas||''}) &nbsp;&mdash;&nbsp; Dicetak: ${printedAt}</div>`;
  return tplOpdDocShell('Details Of Accounts Receivable By Status',
    [`No. Opname: ${row.no} &mdash; Tgl: ${row.tgl}`,
     `Metode: ${opdMetodeLabel(row)} &mdash; Cakupan: ${opdCakupanLabel(row.cakupan)}`,
     `Filter Status: <b>${statusFilter || 'Semua Status'}</b>`], body);
}

/* (2) Receivables Opname Report — Summary By Salesman By Status
   (spec 2.A): pivot salesman (baris) x status (kolom), tiap sel
   jumlah dokumen + total nilai. */
function tplOpdDocSummary(row, printedAt){
  const bySales = {};
  (row.items||[]).forEach(it => {
    const s = it.salesman || '(Tanpa Salesman)';
    if(!bySales[s]) bySales[s] = {};
    if(!bySales[s][it.statusOpname]) bySales[s][it.statusOpname] = {jml:0, nilai:0};
    bySales[s][it.statusOpname].jml += 1;
    bySales[s][it.statusOpname].nilai += (+it.nilai||0);
  });
  const salesNames = Object.keys(bySales).sort();
  const totalPerStatus = {};
  OPD_STATUS_LIST.forEach(st => totalPerStatus[st] = {jml:0, nilai:0});
  const body = `
    <table>
      <thead><tr>
        <th rowspan="2" style="width:150px;">Salesman</th>
        ${OPD_STATUS_LIST.map(st=>`<th colspan="2">${st}</th>`).join('')}
        <th colspan="2">Total</th>
      </tr><tr>
        ${OPD_STATUS_LIST.map(()=>`<th style="width:44px;">Jml</th><th style="width:96px;">Nilai</th>`).join('')}
        <th style="width:44px;">Jml</th><th style="width:96px;">Nilai</th>
      </tr></thead>
      <tbody>${salesNames.length ? salesNames.map(s => {
        let rowJml = 0, rowNilai = 0;
        const cells = OPD_STATUS_LIST.map(st => {
          const c = bySales[s][st] || {jml:0, nilai:0};
          rowJml += c.jml; rowNilai += c.nilai;
          totalPerStatus[st].jml += c.jml; totalPerStatus[st].nilai += c.nilai;
          return `<td style="text-align:center;">${c.jml||''}</td><td style="text-align:right;">${c.jml?opdNum2(c.nilai):''}</td>`;
        }).join('');
        return `<tr><td>${s}</td>${cells}<td style="text-align:center;font-weight:700;">${rowJml}</td><td style="text-align:right;font-weight:700;">${opdNum2(rowNilai)}</td></tr>`;
      }).join('') : `<tr><td colspan="${2*OPD_STATUS_LIST.length+3}" style="text-align:center;color:#777;padding:12px;">Belum ada dokumen.</td></tr>`}
      </tbody>
      <tfoot><tr>
        <td style="text-align:right;">Grand Total :</td>
        ${OPD_STATUS_LIST.map(st=>`<td style="text-align:center;">${totalPerStatus[st].jml}</td><td style="text-align:right;">${opdNum2(totalPerStatus[st].nilai)}</td>`).join('')}
        <td style="text-align:center;">${OPD_STATUS_LIST.reduce((a,st)=>a+totalPerStatus[st].jml,0)}</td>
        <td style="text-align:right;">${opdNum2(OPD_STATUS_LIST.reduce((a,st)=>a+totalPerStatus[st].nilai,0))}</td>
      </tr></tfoot>
    </table>
    <div style="margin-top:20px;font-size:11px;">Petugas: ${row.petugas||''} (${row.tipePetugas||''}) &nbsp;&mdash;&nbsp; Dicetak: ${printedAt}</div>`;
  return tplOpdDocShell('Receivables Opname Report — Summary By Salesman By Status',
    [`No. Opname: ${row.no} &mdash; Tgl: ${row.tgl}`,
     `Metode: ${opdMetodeLabel(row)} &mdash; Cakupan: ${opdCakupanLabel(row.cakupan)}`], body);
}

/* (3) Rekapitulasi Hasil Opname Keseluruhan (spec 2.A): rekap makro
   per jenis dokumen x status. */
function tplOpdDocRekap(row, printedAt){
  const jenisList = ['Faktur','Retur','Surat Jalan'];
  const rekap = {};
  jenisList.forEach(j => { rekap[j] = {}; OPD_STATUS_LIST.forEach(st => rekap[j][st] = {jml:0, nilai:0}); });
  (row.items||[]).forEach(it => {
    if(rekap[it.jenis] && rekap[it.jenis][it.statusOpname]){
      rekap[it.jenis][it.statusOpname].jml += 1;
      rekap[it.jenis][it.statusOpname].nilai += (+it.nilai||0);
    }
  });
  const body = `
    <table>
      <thead><tr>
        <th rowspan="2" style="width:120px;">Jenis Dokumen</th>
        ${OPD_STATUS_LIST.map(st=>`<th colspan="2">${st}</th>`).join('')}
        <th colspan="2">Total</th>
      </tr><tr>
        ${OPD_STATUS_LIST.map(()=>`<th style="width:44px;">Jml</th><th style="width:96px;">Nilai</th>`).join('')}
        <th style="width:44px;">Jml</th><th style="width:96px;">Nilai</th>
      </tr></thead>
      <tbody>${jenisList.map(j => {
        let rowJml = 0, rowNilai = 0;
        const cells = OPD_STATUS_LIST.map(st => {
          const c = rekap[j][st];
          rowJml += c.jml; rowNilai += c.nilai;
          return `<td style="text-align:center;">${c.jml||''}</td><td style="text-align:right;">${c.jml?opdNum2(c.nilai):''}</td>`;
        }).join('');
        return `<tr><td>${j}</td>${cells}<td style="text-align:center;font-weight:700;">${rowJml}</td><td style="text-align:right;font-weight:700;">${opdNum2(rowNilai)}</td></tr>`;
      }).join('')}
      </tbody>
      <tfoot><tr>
        <td style="text-align:right;">Grand Total :</td>
        ${OPD_STATUS_LIST.map(st => {
          const jml = jenisList.reduce((a,j)=>a+rekap[j][st].jml,0);
          const nilai = jenisList.reduce((a,j)=>a+rekap[j][st].nilai,0);
          return `<td style="text-align:center;">${jml}</td><td style="text-align:right;">${opdNum2(nilai)}</td>`;
        }).join('')}
        <td style="text-align:center;">${(row.items||[]).length}</td>
        <td style="text-align:right;">${opdNum2((row.items||[]).reduce((a,it)=>a+(+it.nilai||0),0))}</td>
      </tr></tfoot>
    </table>
    <div class="sign-row">
      <div class="sign-box">Petugas Opname,<div class="sign-line">${row.petugas||''} (${row.tipePetugas||''})</div></div>
      <div class="sign-box">Mengetahui,<div class="sign-line">(________________)</div></div>
    </div>
    <div style="margin-top:16px;font-size:11px;">Dicetak: ${printedAt}</div>`;
  return tplOpdDocShell('Rekapitulasi Hasil Opname Keseluruhan',
    [`No. Opname: ${row.no} &mdash; Tgl: ${row.tgl}`,
     `Metode: ${opdMetodeLabel(row)} &mdash; Cakupan: ${opdCakupanLabel(row.cakupan)}`], body);
}

/* ===== MODUL B — Form Konfirmasi Outlet (spec 2.B): rincian dokumen
   OUTSTANDING (Faktur belum lunas, Retur outstanding, S.J. faktur
   outstanding) per outlet + kolom hasil konfirmasi + tanda tangan,
   Direct Print. ===== */
function tplOpdPilihOutletModal(list){
  return `
    <div class="modal-box" style="max-width:560px;">
      <div class="modal-header"><span>Form Konfirmasi Outlet — Pilih Outlet</span><span class="close" id="modalClose">&times;</span></div>
      <div class="modal-body">
        <p style="font-size:12.3px;color:var(--text-light);margin-bottom:10px;">Sistem akan menarik rincian Faktur, Retur &amp; Surat Jalan yang masih <b>Outstanding</b> untuk outlet terpilih, lalu membuka lembar Form Konfirmasi Outlet yang siap dicetak (Direct Print).</p>
        <div class="table-wrap" style="max-height:320px;overflow:auto;"><table>
          <thead><tr><th>Kode</th><th>Nama Outlet</th><th>Kota</th><th></th></tr></thead>
          <tbody>${list.map(c=>`<tr><td>${c.kode}</td><td>${c.nama}</td><td>${c.kota}</td><td><button class="btn-pick" data-opd-outlet="${c.kode}">Pilih</button></td></tr>`).join('')}</tbody>
        </table></div>
      </div>
      <div class="modal-footer"><button class="btn-secondary" id="modalCancel">Tutup</button></div>
    </div>`;
}

function tplOpdDocKonfirmasiOutlet(cust, fakturs, returs, sjs, printedAt){
  const seksi = (judul, rows, cols) => `
    <div style="font-weight:700;font-size:11.5px;margin-top:14px;">${judul}</div>
    <table>
      <thead><tr>${cols.map(c=>`<th>${c}</th>`).join('')}<th style="width:110px;">Hasil Konfirmasi<br>(Sesuai / Tidak)</th></tr></thead>
      <tbody>${rows.length ? rows : `<tr><td colspan="${cols.length+1}" style="text-align:center;color:#777;padding:10px;">Tidak ada dokumen outstanding.</td></tr>`}</tbody>
    </table>`;
  const fakturRows = fakturs.map((f,i)=>`
    <tr><td style="text-align:center;">${i+1}</td><td>${f.no}</td><td>${f.tgl}</td><td>${f.tglJthTempo}</td><td style="text-align:right;">${opdNum2(f.sisa)}</td><td></td></tr>`).join('');
  const returRows = returs.map((r,i)=>`
    <tr><td style="text-align:center;">${i+1}</td><td>${r.no}</td><td>${r.tgl}</td><td>${r.alasan||''}</td><td style="text-align:right;">${opdNum2(r.nilai)}</td><td></td></tr>`).join('');
  const sjRows = sjs.map((s,i)=>`
    <tr><td style="text-align:center;">${i+1}</td><td>${s.noSJ}</td><td>${s.tgl}</td><td>${s.noFaktur}</td><td style="text-align:right;">${opdNum2(s.nilai)}</td><td></td></tr>`).join('');
  const body = `
    <table style="margin-top:12px;">
      <tr><td style="width:130px;font-weight:700;background:#f7f8fb;">Kode Outlet</td><td>${cust.kode}</td><td style="width:130px;font-weight:700;background:#f7f8fb;">Salesman</td><td>${cust.salesman||''}</td></tr>
      <tr><td style="font-weight:700;background:#f7f8fb;">Nama Outlet</td><td>${cust.nama}</td><td style="font-weight:700;background:#f7f8fb;">Telepon</td><td>${cust.telepon||''}</td></tr>
      <tr><td style="font-weight:700;background:#f7f8fb;">Alamat</td><td colspan="3">${cust.alamat||''}</td></tr>
    </table>
    ${seksi('A. FAKTUR OUTSTANDING (BELUM LUNAS)', fakturRows, ['No.','No. Faktur','Tgl. Faktur','Tgl. Jth. Tempo','Sisa Piutang'])}
    ${seksi('B. RETUR OUTSTANDING', returRows, ['No.','No. Retur','Tgl. Retur','Alasan Retur','Nilai Retur'])}
    ${seksi('C. SURAT JALAN OUTSTANDING', sjRows, ['No.','No. Surat Jalan','Tgl.','Dari Faktur','Nilai'])}
    <div style="margin-top:14px;font-size:10.8px;">Catatan hasil kunjungan: ...................................................................................................................</div>
    <div class="sign-row">
      <div class="sign-box">Petugas Konfirmasi,<div class="sign-line">(________________)</div></div>
      <div class="sign-box">Outlet / Pelanggan,<div class="sign-line">(Nama jelas &amp; stempel)</div></div>
    </div>
    <div style="margin-top:16px;font-size:11px;">Dicetak: ${printedAt}</div>`;
  return tplOpdDocShell('Form Konfirmasi Outlet', [`Kunjungan verifikasi dokumen Faktur, Retur &amp; Surat Jalan Outstanding`], body);
}

function tplOpdDeleteConfirm(row){
  return `
    <div class="modal-box">
      <div class="modal-header"><span>Hapus Opname</span><span class="close" id="modalClose">&times;</span></div>
      <div class="modal-body"><p>Yakin ingin menghapus transaksi opname <b>${row.no}</b>?</p></div>
      <div class="modal-footer">
        <button class="btn-secondary" id="modalCancel">Batal</button>
        <button class="btn-danger" id="modalDelete">Hapus</button>
      </div>
    </div>`;
}

function tplOpdInfoModal(title, text){
  return `
    <div class="modal-box">
      <div class="modal-header"><span>${title}</span><span class="close" id="modalClose">&times;</span></div>
      <div class="modal-body"><p>${text}</p></div>
      <div class="modal-footer"><button class="btn-primary" id="modalCancel">Tutup</button></div>
    </div>`;
}
