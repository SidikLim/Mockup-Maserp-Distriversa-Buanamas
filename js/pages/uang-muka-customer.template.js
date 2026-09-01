/* =========================================================
   TEMPLATE (HTML saja) — Uang Muka Customer (Customer &
   Penjualan > Daftar Transaksi > Uang Muka Customer, key
   page:'uangMukaCustomer'). Semua fungsi di file ini HANYA
   menyusun & mengembalikan markup HTML (string) atau helper
   murni, TIDAK ada DOM-binding/data mutation di sini. Logic-nya
   ada di file sebelah: uang-muka-customer.js

   Sesuai 2 screenshot MASERP yang dikirim user 2026-09-01
   (instalasi SDL — data dipetakan ke master DBM sendiri sesuai
   konvensi):
   1) List "Uang Muka Customer 2" (judul header PERSIS screenshot,
      angka "2" quirk layar MASERP asli — label menu tetap "Uang
      Muka Customer"): chip periode "September 2026" + Tambah;
      kolom No. Uang Muka (link biru -> Lihat) / Tgl. Uang Muka /
      Customer / No. SQ / Jumlah / Keterangan + aksi Lihat
      Invoice / Cetak Invoice / Ubah / Hapus. Screenshot SDL
      "Tidak Ada Data" (Total Record: 0) — mockup DBM diberi 3
      sample September 2026 supaya list hidup; chip periode
      FUNGSIONAL (September/Agustus, filter bulan di r.tgl).
   2) Form "+ Uang Muka Customer 2": heading kiri + Cabang;
      Customer (picker) + Sales Quotation (picker DATA.
      salesQuotation, OPSIONAL — "--Sales Quotation (Opsional)--";
      barang SQ jadi baris Rincian Transaksi, ongkos angkut ikut
      biayaKirim SQ) + Kode Sales (dropdown DATA.salesman);
      No. Otomatis "UMC01" (dekoratif) + No. Transaksi
      "26/UMC-HO/09/00001" readonly + refresh + Keterangan
      (placeholder "contoh: di transfer via bank BCA");
      Tgl. Trn. / Syarat Bayar / Tgl. Jth. Tempo / Jurnal
      (dropdown master Jurnal Penjualan, default kosong sesuai
      screenshot). Tab "Rincian Transaksi": Keterangan / Qty /
      Jumlah / Hapus + link "+Tambah Item Baru" (BEDA dari Uang
      Muka Supplier: baris bisa DITAMBAH & DIEDIT MANUAL karena
      SQ opsional). Panel kiri "Informasi PPN" HANYA 4 radio
      (tanpa kotak faktur pajak — sesuai screenshot); label
      radio terakhir "PPN Eksklusif (+{persen}%)" mengikuti PPN
      terpilih (0% sebelum pilih PPN, sesuai screenshot). Panel
      kanan "Rincian Transaksi": Customer Mata Uang/kurs 1,00,
      Ongkos Angkut (readonly, dari SQ), Subtotal, Dp Tertagih
      % (EDITABLE, default 100), DPP, "Pajak {p} %" + picker
      "Pilih Ppn" (PPN11), Jumlah.
   Footer: Cetak dan Simpan / Simpan / Batalkan. No. format
   "26/UMC-{kode cabang}/09/{urut 5 digit}" (September 2026).
   Aritmetika: Subtotal = Σ Jumlah baris rincian; DP = Subtotal
   x %; DPP = DP (mode Eksklusif) / DP x 100/(100+p) (Inklusif);
   PPN = p% DPP; Jumlah = DPP + PPN. Ongkos Angkut display-only
   (informasi SQ, tidak ikut ditagih di uang muka).
   Jurnal otomatis: D 1120001 Piutang Usaha (Jumlah) lawan
   K 2140001 Uang Muka Penjualan (DPP) + K 2120002 PPN Keluaran
   (PPN) — tagihan uang muka ke customer. */

const UMC_CABANG_LIST = ['Head Office','Surabaya','Bandung','Medan','Makassar','Semarang','Tangerang','Sidoarjo'];
const UMC_CABANG_CODE = {'Head Office':'HO','Surabaya':'SBY','Bandung':'BDG','Medan':'MDN','Makassar':'MKS','Semarang':'SMG','Tangerang':'TGR','Sidoarjo':'SDA'};
const UMC_SYARAT_BAYAR_LIST = ['','COD','CBD','Kredit 14 Hari','Kredit 30 Hari'];
const UMC_PPN_LIST = [
  {kode:'PPN11', persen:11},
];
const UMC_BULAN_LIST = [
  {label:'September 2026', mm:'09'},
  {label:'Agustus 2026', mm:'08'},
];

function umcNum2(n){ return Number(n||0).toLocaleString('id-ID', {minimumFractionDigits:2, maximumFractionDigits:2}); }
function umcAkunNama(kode){ const a = DATA.akunGL.find(x => x.kode === kode); return a ? a.nama : ''; }

/* =====================================================================
   LIST PAGE — "Uang Muka Customer 2"
===================================================================== */
function tplUangMukaCustomerListPage(bulan){
  return `
    <div class="breadcrumb">Home / Customer &amp; Penjualan / <b>Uang Muka Customer</b></div>
    <div class="card">
      <div class="card-header dark-header">
        <h3>${icon('alertTriangle',15)} Uang Muka Customer 2</h3>
        <div class="toolbar-actions">
          <select class="chip-btn" id="umcFilterBulan">${UMC_BULAN_LIST.map(b=>`<option ${bulan===b.mm?'selected':''} value="${b.mm}">${b.label}</option>`).join('')}</select>
          <button class="btn-primary" id="btnUmcAdd">${icon('plus',14)} Tambah</button>
        </div>
      </div>
      <div class="table-toolbar">
        <select id="umcPageSize"><option selected>10</option><option>25</option><option>50</option></select>
        <input type="text" id="umcSearch" placeholder="Pencarian Global">
      </div>
      <div class="table-wrap"><table>
        <thead><tr>
          <th style="width:170px;">No. Uang Muka</th>
          <th style="width:115px;">Tgl. Uang Muka</th>
          <th>Customer</th>
          <th style="width:150px;">No. SQ</th>
          <th class="text-right" style="width:130px;">Jumlah</th>
          <th style="width:170px;">Keterangan</th>
          <th style="width:76px;">Lihat Invoice</th>
          <th style="width:76px;">Cetak Invoice</th>
          <th style="width:60px;">Ubah</th>
          <th style="width:60px;">Hapus</th>
        </tr></thead>
        <tbody id="umcTbody"></tbody>
      </table></div>
      <div class="table-footer"><div class="pager"><button>First</button><button>Previous</button><button class="active">1</button><button>Next</button><button>Last</button></div><div id="umcTotal"></div></div>
    </div>`;
}

function tplUmcRows(rows){
  if(!rows.length) return `<tr><td colspan="10" style="color:var(--text-light);padding:14px;text-align:center;font-weight:600;">Tidak Ada Data</td></tr>`;
  return rows.map((r,i)=>`
    <tr>
      <td><button class="link-pick" data-view-link="${i}">${r.no}</button></td>
      <td>${r.tgl||''}</td>
      <td>${(r.customer||'').toUpperCase()}</td>
      <td>${r.noSQ||''}</td>
      <td class="text-right">${umcNum2(r.jumlahTotal)}</td>
      <td style="max-width:190px;"><div style="white-space:nowrap;overflow:hidden;text-overflow:ellipsis;" title="${r.keterangan||''}">${r.keterangan||''}</div></td>
      <td><button class="icon-btn view" data-invoice="${i}" title="Lihat Invoice">${icon('eye',15)}</button></td>
      <td><button class="icon-btn view" data-print="${i}" title="Cetak Invoice">${icon('printer',15)}</button></td>
      <td><button class="icon-btn edit" data-edit="${i}" title="Ubah">${icon('edit',15)}</button></td>
      <td><button class="icon-btn del" data-del="${i}" title="Hapus">${icon('trash',15)}</button></td>
    </tr>`).join('');
}

/* =====================================================================
   FORM (full page)
===================================================================== */
function tplUmcForm(mode, row){
  const isAdd = mode === 'add';
  const isView = mode === 'view';
  const dis = isView ? 'disabled' : '';
  return `
    <div class="breadcrumb">Home / Uang Muka Customer / <b>${isAdd ? 'Tambah' : (isView ? 'Lihat' : 'Ubah')}</b></div>
    <div class="card">
      <div class="card-header dark-header">
        <h3>${icon('plus',15)} Uang Muka Customer 2</h3>
        <button class="btn-danger" id="btnUmcTutorial">${icon('card',14)} Tutorial</button>
      </div>
      <div class="card-body">
        <div class="form-grid-3" style="grid-template-columns:repeat(3,1fr);align-items:end;">
          <h2 style="font-size:20px;font-weight:700;color:var(--navy);margin:0 0 10px;padding-bottom:10px;border-bottom:1px solid var(--border);">Uang Muka Customer</h2>
          <div class="form-group">
            <label>Cabang</label>
            <select id="fUmcCabang" ${(!isAdd)?'disabled':dis}>${UMC_CABANG_LIST.map(c=>`<option ${row.cabang===c?'selected':''}>${c}</option>`).join('')}</select>
          </div>
          <div class="form-group"></div>
        </div>

        <div class="form-grid-3" style="grid-template-columns:repeat(3,1fr);">
          <div class="form-group">
            <label>Customer</label>
            <div class="input-with-btn">
              <input type="text" id="fUmcCustomer" value="${(row.customer||'').toUpperCase()}" placeholder="Pilih Customer" readonly>
              ${!isView ? `<button type="button" class="icon-btn edit" id="umcCustomerSearch" title="Cari Customer">${icon('search',13)}</button>` : ''}
            </div>
          </div>
          <div class="form-group">
            <label>Sales Quotation</label>
            <div class="input-with-btn">
              <input type="text" id="fUmcNoSQ" value="${row.noSQ||''}" placeholder="--Sales Quotation (Opsional)--" readonly>
              ${!isView ? `<button type="button" class="icon-btn edit" id="umcSqSearch" title="Cari Sales Quotation">${icon('search',13)}</button>` : ''}
            </div>
          </div>
          <div class="form-group">
            <label>Kode Sales</label>
            <select id="fUmcKodeSales" ${dis}><option value=""></option>${DATA.salesman.map(s=>`<option ${row.kodeSales===s.nama?'selected':''}>${s.nama}</option>`).join('')}</select>
          </div>
        </div>

        <div class="form-grid-3" style="grid-template-columns:repeat(3,1fr);">
          <div class="form-group" style="max-width:220px;">
            <label>No. Otomatis</label>
            <select disabled><option>UMC01</option></select>
          </div>
          <div class="form-group">
            <label>No. Transaksi</label>
            <div class="input-with-btn">
              <input type="text" id="fUmcNo" value="${row.no||''}" readonly>
              ${isAdd ? `<button type="button" class="icon-btn edit" id="umcRefreshNo" title="Generate Ulang Nomor">${icon('refreshCw',13)}</button>` : ''}
            </div>
          </div>
          <div class="form-group">
            <label>Keterangan</label>
            <textarea id="fUmcKeterangan" class="po-textarea" rows="3" placeholder="contoh: di transfer via bank BCA" ${dis}>${row.keterangan||''}</textarea>
          </div>
        </div>

        <div class="form-grid-3" style="grid-template-columns:repeat(4,1fr);">
          <div class="form-group">
            <label>Tgl. Trn.</label>
            <div class="input-with-btn">
              <input type="text" id="fUmcTgl" value="${row.tgl||''}" ${dis}>
              <span class="icon-btn edit" style="pointer-events:none;">${icon('calendar',13)}</span>
            </div>
          </div>
          <div class="form-group">
            <label>Syarat Bayar</label>
            <select id="fUmcSyaratBayar" ${dis}>${UMC_SYARAT_BAYAR_LIST.map(s=>`<option ${row.syaratBayar===s?'selected':''}>${s}</option>`).join('')}</select>
          </div>
          <div class="form-group">
            <label>Tgl. Jth. Tempo</label>
            <div class="input-with-btn">
              <input type="text" id="fUmcTglJthTempo" value="${row.tglJthTempo||''}" placeholder="Tgl. Jth. Tempo" ${dis}>
              <span class="icon-btn edit" style="pointer-events:none;">${icon('calendar',13)}</span>
            </div>
          </div>
          <div class="form-group">
            <label>Jurnal</label>
            <select id="fUmcJurnal" ${dis}><option value=""></option>${DATA.jurnalPenjualan.map(j=>`<option ${row.jurnal===j.nama?'selected':''}>${j.nama}</option>`).join('')}</select>
          </div>
        </div>

        <div class="inv-tabs">
          <button type="button" class="inv-tab-btn active" id="umcTabRincianBtn">Rincian Transaksi</button>
          <button type="button" class="inv-tab-btn" id="umcTabJurnalBtn">Rincian Jurnal Akun</button>
        </div>

        <div id="umcTabRincianContent">${tplUmcRincianTab(row, isView)}</div>
        <div id="umcTabJurnalContent" style="display:none;">${tplUmcJurnalContent(row, isView)}</div>
      </div>
      <div class="card-footer" style="display:flex;gap:10px;justify-content:flex-end;align-items:center;padding:14px 20px;border-top:1px solid var(--border);">
        ${!isView ? `
          <button type="button" class="btn-teal" id="umcCetakSimpan">Cetak dan Simpan</button>
          <button type="button" class="btn-primary" id="umcSimpan">Simpan</button>` : ''}
        <a href="#" id="umcBatalkan" class="link-add" style="margin-top:0;">${isView?'Tutup':'Batalkan'}</a>
      </div>
    </div>`;
}

/* ===== Tab 1 — Rincian Transaksi + panel PPN & DP ===== */
function tplUmcRincianTab(row, isView){
  const p = Number(row.ppnPersen || 0);
  return `
    <div class="table-wrap" style="margin:10px 0 0;">
      <table class="po-item-table">
        <thead><tr>
          <th>Keterangan</th>
          <th class="text-right" style="width:100px;">Qty</th>
          <th class="text-right" style="width:150px;">Jumlah</th>
          <th style="width:60px;">Hapus</th>
        </tr></thead>
        <tbody id="umcItemsBody">${tplUmcItemRows(row.items, isView)}</tbody>
      </table>
    </div>
    ${!isView ? `<a href="#" class="link-add" id="umcAddItem">${icon('plus',12)}Tambah Item Baru</a>` : ''}

    <div class="form-grid" style="margin-top:24px;">
      <div>
        <div class="form-section">Informasi PPN</div>
        <div class="radio-group">
          <label><input type="radio" name="umcPpnMode" value="tidak" ${row.ppnMode==='tidak'?'checked':''} ${isView?'disabled':''}> Tidak ada PPN</label>
          <label><input type="radio" name="umcPpnMode" value="tidakDipungut" ${row.ppnMode==='tidakDipungut'?'checked':''} ${isView?'disabled':''}> PPN Tidak Dipungut Pajak</label>
          <label><input type="radio" name="umcPpnMode" value="inklusif" ${row.ppnMode==='inklusif'?'checked':''} ${isView?'disabled':''}> PPN Inklusif</label>
          <label><input type="radio" name="umcPpnMode" value="eksklusif" ${row.ppnMode==='eksklusif'?'checked':''} ${isView?'disabled':''}> PPN Eksklusif (+<span id="umcPpnPersenRadio">${p}</span>%)</label>
        </div>
      </div>
      <div>
        <div class="form-section">Rincian Transaksi</div>
        <table class="field-table po-rincian-table">
          <tr><td class="flabel">Customer Mata Uang</td><td><input type="text" value="IDR" disabled></td><td class="flabel"></td><td><input type="text" value="${umcNum2(1)}" disabled style="text-align:right;"></td></tr>
          <tr><td class="flabel">Ongkos Angkut</td><td colspan="3"><input type="text" id="fUmcOngkosAngkut" value="${umcNum2(row.ongkosAngkut||0)}" disabled style="text-align:right;"></td></tr>
          <tr><td class="flabel">Subtotal</td><td colspan="3"><input type="text" id="fUmcSubtotal" value="${umcNum2(row.subtotal||0)}" disabled style="text-align:right;"></td></tr>
          <tr><td class="flabel">Dp Tertagih</td><td><input type="number" min="0" max="100" id="fUmcDpPersen" value="${row.dpPersen!=null?row.dpPersen:100}" ${isView?'disabled':''}> %</td><td></td><td><input type="text" id="fUmcDpAmount" value="${umcNum2(row.dpAmount||0)}" disabled style="text-align:right;"></td></tr>
          <tr><td class="flabel">DPP</td><td colspan="3"><input type="text" id="fUmcDpp" value="${umcNum2(row.dpp||0)}" disabled style="text-align:right;"></td></tr>
          <tr><td class="flabel">Pajak <span id="umcPpnPersenLabel">${p}</span> %</td><td>
              <div class="input-with-btn">
                <input type="text" id="fUmcPpnKode" value="${row.ppnKode||''}" placeholder="Pilih Ppn" readonly>
                ${!isView ? `<button type="button" class="icon-btn edit" id="umcPpnSearch" title="Cari Kode PPN">${icon('search',13)}</button>
                <button type="button" class="icon-btn del" id="umcPpnClear" title="Hapus PPN">${icon('trash',13)}</button>` : ''}
              </div>
            </td><td></td><td><input type="text" id="fUmcPpnAmount" value="${umcNum2(row.ppnAmount||0)}" disabled style="text-align:right;"></td></tr>
          <tr><td class="flabel">Jumlah</td><td colspan="3"><input type="text" id="fUmcJumlahTotal" value="${umcNum2(row.jumlahTotal||0)}" disabled style="text-align:right;font-weight:700;font-size:14px;"></td></tr>
        </table>
      </div>
    </div>`;
}

function tplUmcItemRows(items, isView){
  if(!items || !items.length) return `<tr><td colspan="4" style="color:var(--text-light);">Belum ada rincian — pilih Sales Quotation atau klik "Tambah Item Baru".</td></tr>`;
  return items.map((it,idx)=>`
    <tr>
      <td><input type="text" data-umc-item-ket="${idx}" value="${it.keterangan||''}" ${isView?'readonly':''}></td>
      <td style="width:100px;"><input type="number" min="0" data-umc-item-qty="${idx}" value="${it.qty||0}" ${isView?'readonly':''} style="text-align:right;"></td>
      <td style="width:150px;"><input type="number" step="0.01" min="0" data-umc-item-jumlah="${idx}" value="${it.jumlah||0}" ${isView?'readonly':''} style="text-align:right;"></td>
      <td style="width:60px;">${!isView ? `<button type="button" class="icon-btn del" data-umc-del="${idx}" title="Hapus Baris">${icon('trash',14)}</button>` : ''}</td>
    </tr>`).join('');
}

/* ===== Tab 2 — Rincian Jurnal Akun (Buat Jurnal + tabel editable) ===== */
function tplUmcJurnalContent(row, isView){
  const totals = umcJurnalTotals(row);
  const selisihColor = Math.abs(totals.selisih) > 0.004 ? 'var(--red)' : 'var(--text)';
  return `
    ${!isView ? `<div style="display:flex;justify-content:center;margin:14px 0;">
      <button type="button" class="btn-secondary" id="umcBuatJurnal">${icon('refreshCw',13)} Buat Jurnal</button>
    </div>` : '<div style="margin-top:14px;"></div>'}
    <div class="card-header dark-header" style="border-radius:6px;">
      <h3>${icon('settings',14)} Rincian Jurnal Akun</h3>
      ${!isView ? `<button type="button" class="btn-primary" id="umcJurnalAddRow">${icon('plus',13)} Tambah</button>` : ''}
    </div>
    <div class="table-wrap" style="margin:6px 0 0;">
      <table class="po-item-table">
        <thead><tr>
          <th>Kode Akun</th><th>Nama Akun</th><th>Keterangan</th><th class="text-right">Jumlah Debit</th><th class="text-right">Jumlah Kredit</th><th>Hapus</th>
        </tr></thead>
        <tbody id="umcJurnalBody">${tplUmcJurnalRows(row.jurnalAkun, isView)}</tbody>
      </table>
    </div>
    <div style="max-width:280px;margin:16px 0 0 auto;">
      <div style="font-size:12.5px;font-weight:600;color:var(--text);margin-bottom:4px;">Jumlah Debit - Kredit</div>
      <input type="text" id="umcJurnalSelisih" value="${umcNum2(totals.selisih)}" readonly style="text-align:right;font-weight:700;color:${selisihColor};">
    </div>`;
}

function tplUmcJurnalRows(list, isView){
  if(!list || !list.length) return `<tr><td colspan="6" style="color:var(--text-light);">Belum ada rincian jurnal — klik "Buat Jurnal".</td></tr>`;
  return list.map((entry,idx)=>{
    if(isView){
      return `
      <tr>
        <td style="min-width:110px;"><input type="text" value="${entry.kodeAkun||''}" readonly></td>
        <td style="min-width:180px;"><input type="text" value="${entry.namaAkun||''}" readonly></td>
        <td style="min-width:160px;"><input type="text" value="${entry.keterangan||''}" readonly></td>
        <td style="width:150px;"><input type="text" value="${umcNum2(entry.debit||0)}" readonly style="text-align:right;"></td>
        <td style="width:150px;"><input type="text" value="${umcNum2(entry.kredit||0)}" readonly style="text-align:right;"></td>
        <td style="width:50px;"></td>
      </tr>`;
    }
    return `
    <tr data-umc-jurnal-row="${idx}">
      <td style="min-width:110px;">
        <div class="input-with-btn">
          <input type="text" data-umc-jurnal-kode="${idx}" value="${entry.kodeAkun||''}" readonly>
          <button type="button" class="icon-btn edit" data-umc-jurnal-akun-search="${idx}" title="Cari Akun GL">${icon('search',12)}</button>
        </div>
      </td>
      <td style="min-width:180px;"><input type="text" data-umc-jurnal-nama="${idx}" value="${entry.namaAkun||''}" readonly></td>
      <td style="min-width:160px;"><input type="text" data-umc-jurnal-ket="${idx}" value="${entry.keterangan||''}"></td>
      <td style="width:150px;"><input type="number" step="0.01" min="0" data-umc-jurnal-debit="${idx}" value="${entry.debit||0}" style="text-align:right;"></td>
      <td style="width:150px;"><input type="number" step="0.01" min="0" data-umc-jurnal-kredit="${idx}" value="${entry.kredit||0}" style="text-align:right;"></td>
      <td style="width:50px;"><button type="button" class="icon-btn del" data-umc-jurnal-del="${idx}" title="Hapus Baris">${icon('trash',14)}</button></td>
    </tr>`;
  }).join('');
}

/* Cetakan/preview "Invoice Uang Muka Customer" — dipakai tombol Lihat
   Invoice & Cetak Invoice di list + "Cetak dan Simpan" di form (kop
   DBM, pola sama Invoice Uang Muka Supplier). */
function tplUmcInvoiceModal(row){
  const ho = DATA.cabangMaster[0] || {};
  const td = 'padding:3px 6px;font-size:11.5px;';
  const itemRows = (row.items||[]).map((it,i)=>`
    <tr>
      <td style="${td}text-align:center;">${i+1}</td>
      <td style="${td}">${it.keterangan}</td>
      <td style="${td}text-align:right;">${umcNum2(it.qty)}</td>
      <td style="${td}text-align:right;">${umcNum2(it.jumlah)}</td>
    </tr>`).join('');
  return `
    <div class="modal-box" style="max-width:860px;width:96vw;">
      <div class="modal-header"><span>${icon('printer',15)} Invoice Uang Muka — ${row.no}</span><span class="close" id="modalClose">&times;</span></div>
      <div class="modal-body" style="max-height:72vh;overflow:auto;">
        <div style="background:#fff;border:1px solid var(--border);padding:22px 26px;font-family:Arial,Helvetica,sans-serif;color:#111;">
          <div style="display:flex;gap:14px;align-items:flex-start;">
            <div style="width:64px;height:64px;border-radius:10px;background:var(--navy);color:#fff;display:flex;align-items:center;justify-content:center;font-weight:800;font-size:20px;">DBM</div>
            <div>
              <div style="font-weight:800;font-size:14px;">${(ho.namaPerusahaan||'PT Distriversa Buanamas').toUpperCase()}</div>
              <div style="font-size:11.5px;">${ho.alamat||''}, ${ho.kota||''} — Tlp: ${ho.telepon||''}</div>
            </div>
          </div>
          <div style="text-align:center;font-weight:800;font-size:15px;margin:12px 0;">Invoice Uang Muka Customer</div>
          <table style="border:none;font-size:11.5px;"><tbody>
            <tr><td style="${td}">No. Uang Muka</td><td style="${td}">: ${row.no}</td><td style="${td}padding-left:40px;">Customer</td><td style="${td}">: ${(row.customer||'').toUpperCase()}</td></tr>
            <tr><td style="${td}">Tgl. Trn.</td><td style="${td}">: ${row.tgl||''}</td><td style="${td}padding-left:40px;">No. SQ</td><td style="${td}">: ${row.noSQ||'-'}</td></tr>
            <tr><td style="${td}">Tgl. Jth. Tempo</td><td style="${td}">: ${row.tglJthTempo||'-'}</td><td style="${td}padding-left:40px;">Syarat Bayar</td><td style="${td}">: ${row.syaratBayar||'-'}</td></tr>
            <tr><td style="${td}">Kode Sales</td><td style="${td}">: ${row.kodeSales||'-'}</td><td style="${td}padding-left:40px;">Cabang</td><td style="${td}">: ${row.cabang||''}</td></tr>
          </tbody></table>
          <table style="width:100%;border-collapse:collapse;margin-top:10px;">
            <thead><tr style="border-top:2px solid #111;border-bottom:2px solid #111;">
              <th style="${td}width:34px;">No.</th><th style="${td}text-align:left;">Keterangan</th><th style="${td}text-align:right;">Qty</th><th style="${td}text-align:right;">Jumlah</th>
            </tr></thead>
            <tbody>${itemRows}</tbody>
          </table>
          <div style="border-top:2px solid #111;margin-top:30px;"></div>
          <div style="display:flex;justify-content:flex-end;margin-top:8px;">
            <table style="border:none;min-width:280px;font-size:11.5px;"><tbody>
              <tr><td style="${td}">Subtotal :</td><td style="${td}text-align:right;">${umcNum2(row.subtotal)}</td></tr>
              <tr><td style="${td}">Dp Tertagih (${row.dpPersen!=null?row.dpPersen:100}%) / DPP :</td><td style="${td}text-align:right;">${umcNum2(row.dpp)}</td></tr>
              <tr><td style="${td}">PPN :</td><td style="${td}text-align:right;">${umcNum2(row.ppnAmount)}</td></tr>
              <tr style="border-top:2px solid #111;"><td style="${td}font-weight:800;">Jumlah :</td><td style="${td}text-align:right;font-weight:800;">${umcNum2(row.jumlahTotal)}</td></tr>
            </tbody></table>
          </div>
        </div>
      </div>
      <div class="modal-footer"><button class="btn-secondary" id="modalCancel">Tutup</button></div>
    </div>`;
}

/* Picker Customer / SQ / PPN / Akun GL — salinan lokal pola modul lain. */
function tplUmcCustomerPicker(list){
  return `
    <div class="modal-box" style="max-width:640px;">
      <div class="modal-header"><span>Pilih Customer</span><span class="close" id="modalClose">&times;</span></div>
      <div class="modal-body">
        <input type="text" id="umcCustomerPickerSearch" placeholder="Cari kode / nama customer..." style="width:100%;border:1px solid var(--border);border-radius:6px;padding:8px 10px;font-size:12.8px;margin-bottom:12px;">
        <div class="table-wrap" style="max-height:360px;overflow:auto;">
          <table>
            <thead><tr><th>Kode</th><th>Nama Customer</th><th></th></tr></thead>
            <tbody id="umcCustomerPickerBody">${tplUmcCustomerPickerRows(list)}</tbody>
          </table>
        </div>
      </div>
      <div class="modal-footer"><button class="btn-secondary" id="modalCancel">Tutup</button></div>
    </div>`;
}

function tplUmcCustomerPickerRows(list){
  if(!list.length) return `<tr><td colspan="3" style="color:var(--text-light);">Tidak ada customer ditemukan</td></tr>`;
  return list.map(c=>`
    <tr><td>${c.kode}</td><td>${c.nama}</td><td><button class="btn-pick" data-pick-customer="${c.nama}">Pilih</button></td></tr>`).join('');
}

function tplUmcSqPicker(list){
  return `
    <div class="modal-box" style="max-width:760px;">
      <div class="modal-header"><span>Pilih Sales Quotation</span><span class="close" id="modalClose">&times;</span></div>
      <div class="modal-body">
        <input type="text" id="umcSqPickerSearch" placeholder="Cari no. SQ / customer..." style="width:100%;border:1px solid var(--border);border-radius:6px;padding:8px 10px;font-size:12.8px;margin-bottom:12px;">
        <div class="table-wrap" style="max-height:340px;overflow:auto;">
          <table>
            <thead><tr><th>No. SQ</th><th>Tgl. SQ</th><th>Customer</th><th>Sales Office</th><th></th></tr></thead>
            <tbody id="umcSqPickerBody">${tplUmcSqPickerRows(list)}</tbody>
          </table>
        </div>
      </div>
      <div class="modal-footer"><button class="btn-secondary" id="modalCancel">Tutup</button></div>
    </div>`;
}

function tplUmcSqPickerRows(list){
  if(!list.length) return `<tr><td colspan="5" style="color:var(--text-light);">Tidak ada Sales Quotation ditemukan</td></tr>`;
  return list.map(q=>`
    <tr><td>${q.no}</td><td>${q.tglSQ||''}</td><td>${q.customer||''}</td><td>${q.sOffice||''}</td><td><button class="btn-pick" data-pick-sq="${q.no}">Pilih</button></td></tr>`).join('');
}

function tplUmcPpnPicker(list){
  return `
    <div class="modal-box" style="max-width:400px;">
      <div class="modal-header"><span>Pilih PPN</span><span class="close" id="modalClose">&times;</span></div>
      <div class="modal-body">
        <div class="table-wrap"><table>
          <thead><tr><th>Kode PPN</th><th>Persen</th><th></th></tr></thead>
          <tbody>${list.map(p=>`<tr><td>${p.kode}</td><td>${p.persen}%</td><td><button class="btn-pick" data-pick-ppn="${p.kode}" data-pick-persen="${p.persen}">Pilih</button></td></tr>`).join('')}</tbody>
        </table></div>
      </div>
      <div class="modal-footer"><button class="btn-secondary" id="modalCancel">Tutup</button></div>
    </div>`;
}

function tplUmcAkunPicker(list){
  return `
    <div class="modal-box" style="max-width:640px;">
      <div class="modal-header"><span>Pilih Akun GL</span><span class="close" id="modalClose">&times;</span></div>
      <div class="modal-body">
        <input type="text" id="umcAkunPickerSearch" placeholder="Cari kode / nama akun..." style="width:100%;border:1px solid var(--border);border-radius:6px;padding:8px 10px;font-size:12.8px;margin-bottom:12px;">
        <div class="table-wrap" style="max-height:360px;overflow:auto;">
          <table>
            <thead><tr><th>Kode</th><th>Nama Akun</th><th>Kat.</th><th></th></tr></thead>
            <tbody id="umcAkunPickerBody">${tplUmcAkunPickerRows(list)}</tbody>
          </table>
        </div>
      </div>
      <div class="modal-footer"><button class="btn-secondary" id="modalCancel">Tutup</button></div>
    </div>`;
}

function tplUmcAkunPickerRows(list){
  if(!list.length) return `<tr><td colspan="4" style="color:var(--text-light);">Tidak ada akun ditemukan</td></tr>`;
  return list.map(a=>`
    <tr><td>${a.kode}</td><td>${a.nama}</td><td>${a.kategori}</td><td><button class="btn-pick" data-umc-pick-akun="${a.kode}">Pilih</button></td></tr>`).join('');
}

function tplUmcDeleteConfirm(row){
  return `
    <div class="modal-box">
      <div class="modal-header"><span>Hapus Uang Muka Customer</span><span class="close" id="modalClose">&times;</span></div>
      <div class="modal-body"><p>Yakin ingin menghapus Uang Muka <b>${row.no}</b> — ${(row.customer||'').toUpperCase()} (${umcNum2(row.jumlahTotal)})?</p></div>
      <div class="modal-footer">
        <button class="btn-secondary" id="modalCancel">Batal</button>
        <button class="btn-danger" id="modalDelete">Hapus</button>
      </div>
    </div>`;
}

function tplUmcInfoModal(title,text){
  return `
    <div class="modal-box">
      <div class="modal-header"><span>${title}</span><span class="close" id="modalClose">&times;</span></div>
      <div class="modal-body"><p>${text}</p></div>
      <div class="modal-footer"><button class="btn-primary" id="modalOk">Mengerti</button></div>
    </div>`;
}
