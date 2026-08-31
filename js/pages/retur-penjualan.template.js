/* =========================================================
   TEMPLATE (HTML saja) — Retur Penjualan (Customer & Penjualan >
   Daftar Transaksi > Retur Penjualan, key page:'returPenjualan').
   Semua fungsi di file ini HANYA menyusun & mengembalikan markup
   HTML (string) atau helper murni, TIDAK ada DOM-binding/data
   mutation di sini. Logic-nya ada di file sebelah:
   retur-penjualan.js

   Sesuai 3 screenshot + 2 PDF cetakan MASERP yang dikirim user:
   1) "Daftar Retur Penjualan": chip periode + Tambah; kolom No.
      Retur (link + pill teal "Approved") / Tgl. Retur / Customer /
      No Faktur / Tipe Transaksi + aksi Attach / Lihat / Lihat
      BAPBR / Cetak / Hapus. TANPA kolom Ubah — dokumen retur
      final (banner kuning di form: "Transaksi retur tidak bisa
      diedit. Hapus transaksi ini apabila mau mengubahnya...").
   2) Form full page: Cabang + Inventory Transaction (Optional,
      dekoratif); No. Faktur Retur (+refresh) / Customer (picker +
      teks "Kode Lama Customer {kode}") / Syarat Bayar ("Jadikan
      Nota Kredit"); Tgl. Retur (dengan jam) / Tgl. Jth. Tempo /
      No. Faktur Jual (picker DATA.invoices + tombol hapus) /
      Jurnal ke kas/bank ini (DATA.jurnalPenjualan); Principal /
      Tipe Layanan / checkbox Retur Administrasi (+ catatan kecil)
      / Gudang / checkbox Gudang Alokasi / Salesman / Alamat
      Pengiriman. Tab "Barang Yang Diretur" (item + multi batch +
      kolom diskon principal/distributor) & tab "Rincian Jurnal
      Akun" (Buat Jurnal + tabel selalu editable, TANPA Cost
      Center). Panel Informasi PPN (4 radio + kotak Mata Uang/
      Tgl. Faktur Pajak/Kode Pajak/No Faktur Pajak "RET04...") +
      Rincian Transaksi + blok Alasan. Footer: Perbaharui Kurs /
      Cetak dan Simpan / Simpan / Batalkan.
   3) CETAKAN (2 PDF direplikasi sebagai modal preview HTML,
      kop diganti PT Distriversa Buanamas + logo DBM):
      - tombol Cetak  -> "Retur Penjualan" (faktur retur: header
        No. Faktur/Tanggal/Tgl. Jth. Tempo/KodeCrc/Salesman/Dept +
        Langganan/Alamat, tabel No/Kode/Nama/Qty/Harga/Disc%/
        Jumlah, Terbilang + Catatan, Sub Total/Dpp/Ppn/Grand
        Total, ttd Penerima & "{kota}, {tanggal}").
      - tombol Lihat BAPBR -> "BUKTI PENERIMAAN BARANG RETUR
        (BPBR) DARI PELANGGAN" (header BPBR NO/TANGGAL/INVOICE NO/
        NAMA PELANGGAN, tabel Kode Item/Nama Item/Exp Date & Batch
        No./Qty/UoM/Alasan Retur/Credit Memo No/Debit Memo No.,
        7 kolom tanda tangan).
   Contoh jurnal screenshot dipetakan ke akun 7-digit DBM:
   Retur Penjualan 4110002(D, bruto) + PPN Keluaran 2120002(D) +
   Persediaan 1130001(D, HPP) = Piutang Usaha 1120001(K, grand
   total) + Sales Item Discount (Distributor) 4110005(K, diskon) +
   HPP Barang Dagang 5110001(K, HPP).
========================================================= */

const RPJ_CABANG_LIST = ['Head Office','Surabaya','Bandung','Medan','Makassar','Semarang','Tangerang','Sidoarjo'];
const RPJ_CABANG_CODE = {'Head Office':'HO','Surabaya':'SBY','Bandung':'BDG','Medan':'MDN','Makassar':'MKS','Semarang':'SMG','Tangerang':'TGR','Sidoarjo':'SDA'};
const RPJ_SYARAT_BAYAR_LIST = ['Jadikan Nota Kredit','Potong Piutang','Kembali Dana (Kas/Bank)'];
const RPJ_TIPE_LAYANAN_LIST = ['Pilih','Reguler','Cito'];
const RPJ_KODE_PAJAK_LIST = ['04 - DPP Nilai Lain','01 - Normal'];
const RPJ_ALASAN_TIPE_LIST = ['Lain-lain','Kesalahan DPF/L','Kesalahan Kirim','Barang Rusak','Mendekati ED'];

function rpjNum2(n){ return Number(n||0).toLocaleString('id-ID', {minimumFractionDigits:2, maximumFractionDigits:2}); }
function rpjAkunNama(kode){ const a = DATA.akunGL.find(x => x.kode === kode); return a ? a.nama : ''; }

/* Terbilang id-ID sederhana (bilangan bulat) — dipakai baris
   "Terbilang" cetakan faktur retur, pola teks PDF:
   "{terbilang rupiah} Rupiah koma {terbilang sen}". */
function rpjTerbilang(n){
  n = Math.floor(Math.abs(+n || 0));
  const satuan = ['','Satu','Dua','Tiga','Empat','Lima','Enam','Tujuh','Delapan','Sembilan','Sepuluh','Sebelas'];
  function t(x){
    if(x < 12) return satuan[x];
    if(x < 20) return t(x - 10) + ' Belas';
    if(x < 100) return t(Math.floor(x / 10)) + ' Puluh' + (x % 10 ? ' ' + t(x % 10) : '');
    if(x < 200) return 'Seratus' + (x % 100 ? ' ' + t(x % 100) : '');
    if(x < 1000) return t(Math.floor(x / 100)) + ' Ratus' + (x % 100 ? ' ' + t(x % 100) : '');
    if(x < 2000) return 'Seribu' + (x % 1000 ? ' ' + t(x % 1000) : '');
    if(x < 1e6) return t(Math.floor(x / 1000)) + ' Ribu' + (x % 1000 ? ' ' + t(x % 1000) : '');
    if(x < 1e9) return t(Math.floor(x / 1e6)) + ' Juta' + (x % 1e6 ? ' ' + t(x % 1e6) : '');
    return t(Math.floor(x / 1e9)) + ' Miliar' + (x % 1e9 ? ' ' + t(x % 1e9) : '');
  }
  return n === 0 ? 'Nol' : t(n);
}
function rpjTerbilangRupiah(n){
  const abs = Math.abs(+n || 0);
  const bulat = Math.floor(abs);
  const sen = Math.round((abs - bulat) * 100);
  return rpjTerbilang(bulat) + ' Rupiah' + (sen ? ' koma ' + rpjTerbilang(sen) : '');
}
/* '09/08/2026' -> '09 Agustus 2026' (header tanggal cetakan). */
function rpjTglPanjang(tgl){
  const bulan = ['','Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember'];
  const p = (String(tgl||'').split(' ')[0] || '').split('/');
  return p.length === 3 ? `${p[0]} ${bulan[+p[1]]||''} ${p[2]}` : (tgl || '');
}

/* =====================================================================
   LIST PAGE — "Daftar Retur Penjualan"
===================================================================== */
function tplReturPenjualanListPage(){
  return `
    <div class="breadcrumb">Home / Customer &amp; Penjualan / <b>Retur Penjualan</b></div>
    <div class="card">
      <div class="card-header dark-header">
        <h3>${icon('alertTriangle',15)} Daftar Retur Penjualan</h3>
        <div class="toolbar-actions">
          <select class="chip-btn" id="rpjFilterBulan"><option>Agustus 2026</option><option>Juli 2026</option></select>
          <button class="btn-primary" id="btnRpjAdd">${icon('plus',14)} Tambah</button>
        </div>
      </div>
      <div class="table-toolbar">
        <select id="rpjPageSize"><option selected>10</option><option>25</option><option>50</option></select>
        <input type="text" id="rpjSearch" placeholder="Pencarian Global">
      </div>
      <div class="table-wrap"><table>
        <thead><tr>
          <th style="width:220px;">No. Retur</th>
          <th style="width:100px;">Tgl. Retur</th>
          <th>Customer</th>
          <th style="width:160px;">No Faktur</th>
          <th style="width:170px;">Tipe Transaksi</th>
          <th style="width:70px;">Attach</th>
          <th style="width:70px;">Lihat</th>
          <th style="width:80px;">Lihat BAPBR</th>
          <th style="width:70px;">Cetak</th>
          <th style="width:70px;">Hapus</th>
        </tr></thead>
        <tbody id="rpjTbody"></tbody>
      </table></div>
      <div class="table-footer"><div class="pager"><button>First</button><button>Previous</button><button class="active">1</button><button>Next</button><button>Last</button></div><div id="rpjTotal"></div></div>
    </div>`;
}

function tplRpjRows(rows){
  if(!rows.length) return `<tr><td colspan="10" style="color:var(--text-light);padding:14px;">Tidak ada Retur Penjualan yang cocok dengan pencarian.</td></tr>`;
  return rows.map((r,i)=>`
    <tr>
      <td>
        <button class="link-pick" data-view-link="${i}">${r.no}</button>
        <span class="status-pill status-paid" style="margin-left:8px;">${r.status||'Approved'}</span>
      </td>
      <td>${(r.tglRetur||'').split(' ')[0]}</td>
      <td>${(r.customer||'').toUpperCase()}</td>
      <td>${r.noFakturJual||''}</td>
      <td>${r.tipeTransaksi||''}</td>
      <td><button class="icon-btn view" data-attach="${i}" title="Attach">${icon('file',15)}</button></td>
      <td><button class="icon-btn view" data-view="${i}" title="Lihat">${icon('eye',15)}</button></td>
      <td><button class="icon-btn view" data-bapbr="${i}" title="Lihat BAPBR">${icon('eye',15)}</button></td>
      <td><button class="icon-btn print" data-print="${i}" title="Cetak">${icon('printer',15)}</button></td>
      <td><button class="icon-btn del" data-del="${i}" title="Hapus">${icon('trash',15)}</button></td>
    </tr>`).join('');
}

/* =====================================================================
   FORM (full page)
===================================================================== */
function tplRpjForm(mode, row){
  const isAdd = mode === 'add';
  const isView = mode === 'view';
  const dis = isView ? 'disabled' : '';
  return `
    <div class="breadcrumb">Home / Retur Penjualan / <b>${isAdd ? 'Tambah' : 'Lihat'}</b></div>
    ${isView ? `<div class="alert-warning"><b>Transaksi retur tidak bisa diedit. Hapus transaksi ini apabila mau mengubahnya.</b><br>LOCK: Transaksi dikunci Administrator. Perubahan tidak diperbolehkan.</div>` : ''}
    <div class="card">
      <div class="card-header dark-header">
        <h3>${icon('plus',15)} Retur Penjualan</h3>
        <button class="btn-danger" id="btnRpjTutorial">${icon('card',14)} Tutorial</button>
      </div>
      <div class="card-body">
        <div class="form-grid-3" style="grid-template-columns:repeat(3,1fr);align-items:end;">
          <h2 style="font-size:20px;font-weight:700;color:var(--navy);margin:0 0 10px;padding-bottom:10px;border-bottom:1px solid var(--border);">Retur Penjualan</h2>
          <div class="form-group">
            <label>Cabang</label>
            <select id="fRpjCabang" ${(!isAdd)?'disabled':dis}>${RPJ_CABANG_LIST.map(c=>`<option ${row.cabang===c?'selected':''}>${c}</option>`).join('')}</select>
          </div>
          <div class="form-group">
            <label>Inventory Transaction (Optional)</label>
            <div class="input-with-btn">
              <input type="text" value="${row.inventoryTransaction||''}" placeholder="--Pilih Inventory Transaction--" readonly>
              ${!isView ? `<button type="button" class="icon-btn edit" id="rpjInvTrxSearch" title="Cari Inventory Transaction">${icon('search',13)}</button>
              <button type="button" class="icon-btn del" id="rpjInvTrxClear" title="Hapus">${icon('trash',13)}</button>` : ''}
            </div>
          </div>
        </div>

        <div class="form-grid-3" style="grid-template-columns:repeat(3,1fr);">
          <div class="form-group">
            <label>No. Faktur Retur</label>
            <div class="input-with-btn">
              <input type="text" id="fRpjNo" value="${row.no||''}" readonly>
              ${isAdd ? `<button type="button" class="icon-btn edit" id="rpjRefreshNo" title="Generate Ulang Nomor">${icon('refreshCw',13)}</button>` : ''}
            </div>
          </div>
          <div class="form-group">
            <label>Customer</label>
            <div class="input-with-btn">
              <input type="text" id="fRpjCustomer" value="${(row.customer||'').toUpperCase()}" placeholder="Pilih Customer" readonly>
              ${!isView ? `<button type="button" class="icon-btn edit" id="rpjCustomerSearch" title="Cari Customer">${icon('search',13)}</button>` : ''}
            </div>
            <div id="fRpjKodeLama" style="font-size:11.5px;color:var(--text-light);margin-top:4px;">${row.customerKode ? 'Kode Lama Customer ' + row.customerKode : ''}</div>
          </div>
          <div class="form-group">
            <label>Syarat Bayar</label>
            <select id="fRpjSyaratBayar" ${dis}>${RPJ_SYARAT_BAYAR_LIST.map(s=>`<option ${row.syaratBayar===s?'selected':''}>${s}</option>`).join('')}</select>
          </div>
        </div>

        <div class="form-grid-3" style="grid-template-columns:repeat(4,1fr);">
          <div class="form-group">
            <label>Tgl. Retur</label>
            <div class="input-with-btn">
              <input type="text" id="fRpjTglRetur" value="${row.tglRetur||''}" ${dis}>
              <span class="icon-btn edit" style="pointer-events:none;">${icon('calendar',13)}</span>
            </div>
          </div>
          <div class="form-group">
            <label>Tgl. Jth. Tempo</label>
            <input type="text" id="fRpjTglJthTempo" value="${row.tglJthTempo||''}" ${dis}>
          </div>
          <div class="form-group">
            <label>No. Faktur Jual</label>
            <div class="input-with-btn">
              <input type="text" id="fRpjNoFakturJual" value="${row.noFakturJual||''}" placeholder="Pilih Sales Invoice" readonly>
              ${!isView ? `<button type="button" class="icon-btn edit" id="rpjFakturSearch" title="Cari Sales Invoice">${icon('search',13)}</button>
              <button type="button" class="icon-btn del" id="rpjFakturClear" title="Hapus Faktur Terpilih">${icon('trash',13)}</button>` : ''}
            </div>
          </div>
          <div class="form-group">
            <label>Jurnal ke kas/bank ini</label>
            <select id="fRpjJurnal" ${dis}>${DATA.jurnalPenjualan.map(j=>`<option ${row.jurnal===j.nama?'selected':''}>${j.nama}</option>`).join('')}</select>
          </div>
        </div>

        <div class="form-grid-3" style="grid-template-columns:repeat(4,1fr);">
          <div class="form-group">
            <label>Principal</label>
            <input type="text" id="fRpjPrincipal" value="${row.principal||''}" readonly>
          </div>
          <div class="form-group">
            <label>Tipe Layanan</label>
            <select id="fRpjTipeLayanan" ${dis}>${RPJ_TIPE_LAYANAN_LIST.map(t=>`<option ${row.tipeLayanan===t?'selected':''}>${t}</option>`).join('')}</select>
          </div>
          <div class="form-group" style="grid-column:3 / span 2;">
            <label>Retur Administasi <input type="checkbox" id="fRpjReturAdm" ${row.returAdministrasi?'checked':''} ${dis} style="width:auto;vertical-align:middle;margin-left:6px;"></label>
            <div style="font-size:11.5px;color:var(--text-light);margin-top:4px;">(Checklist retur administrasi ini tidak akan ada memasukan data transaksi inventory)</div>
          </div>
        </div>

        <div class="form-grid-3" style="grid-template-columns:repeat(4,1fr);">
          <div class="form-group">
            <label>Gudang</label>
            <select id="fRpjGudang" ${dis}>${DATA.gudang.map(g=>`<option value="${g.kode}" ${row.gudangKode===g.kode?'selected':''}>(${g.kode}) ${g.nama}</option>`).join('')}</select>
          </div>
          <div class="form-group">
            <label>Gudang Alokasi <input type="checkbox" id="fRpjGudangAlokasi" ${row.gudangAlokasi?'checked':''} ${dis} style="width:auto;vertical-align:middle;margin-left:6px;"></label>
          </div>
          <div class="form-group">
            <label>Salesman</label>
            <select id="fRpjSalesman" ${dis}>${DATA.salesman.map(sm=>`<option ${row.salesman===sm.nama?'selected':''}>${sm.nama}</option>`).join('')}</select>
          </div>
          <div class="form-group">
            <label>Alamat Pengiriman</label>
            <textarea id="fRpjAlamat" class="po-textarea" rows="3" ${dis}>${row.alamatPengiriman||''}</textarea>
          </div>
        </div>

        <div class="inv-tabs">
          <button type="button" class="inv-tab-btn active" id="rpjTabBarangBtn">Barang Yang Diretur</button>
          <button type="button" class="inv-tab-btn" id="rpjTabJurnalBtn">Rincian Jurnal Akun</button>
        </div>

        <div id="rpjTabBarangContent">${tplRpjBarangTab(row, isView)}</div>
        <div id="rpjTabJurnalContent" style="display:none;">${tplRpjJurnalContent(row, isView)}</div>

        <div class="form-grid" style="margin-top:26px;">
          <div>
            <div class="form-section">Informasi PPN</div>
            <div class="radio-group">
              <label><input type="radio" name="rpjPpnMode" value="tidak" ${row.ppnMode==='tidak'?'checked':''} ${dis}> Tidak ada PPN</label>
              <label><input type="radio" name="rpjPpnMode" value="tidakDipungut" ${row.ppnMode==='tidakDipungut'?'checked':''} ${dis}> PPN Tidak Dipungut Pajak</label>
              <label><input type="radio" name="rpjPpnMode" value="inklusif" ${row.ppnMode==='inklusif'?'checked':''} ${dis}> PPN Inklusif</label>
              <label><input type="radio" name="rpjPpnMode" value="eksklusif" ${row.ppnMode==='eksklusif'?'checked':''} ${dis}> PPN Eksklusif (+11%)</label>
            </div>
            <table class="field-table po-rincian-table" style="margin-top:10px;">
              <tr><td class="flabel">Mata Uang</td><td colspan="3"><select id="fRpjMataUang" ${dis}><option>Rupiah (IDR)</option></select></td></tr>
              <tr><td class="flabel">Tgl. Faktur Pajak</td><td colspan="3"><input type="text" id="fRpjTglFakturPajak" value="${row.tglFakturPajak||''}" ${dis}></td></tr>
              <tr><td class="flabel">Kode Pajak</td><td colspan="3"><select id="fRpjKodePajak" ${dis}>${RPJ_KODE_PAJAK_LIST.map(k=>`<option ${row.kodePajak===k?'selected':''}>${k}</option>`).join('')}</select></td></tr>
              <tr><td class="flabel">No Faktur Pajak</td><td colspan="3"><input type="text" id="fRpjNoFakturPajak" value="${row.noFakturPajak||''}" readonly></td></tr>
            </table>
          </div>
          <div>
            <div class="form-section">Rincian Transaksi</div>
            <table class="field-table po-rincian-table">
              <tr><td class="flabel">Mata Uang</td><td><input type="text" value="IDR" disabled></td><td class="flabel">Kurs</td><td><input type="text" value="${rpjNum2(1)}" disabled></td></tr>
              <tr><td class="flabel">Diskon 1</td><td><input type="number" id="fRpjDiskon1" value="${row.diskon1||0}" ${dis}> %</td><td></td><td><input type="text" id="fRpjDiskon1Amount" value="${rpjNum2(row.diskon1Amount||0)}" disabled></td></tr>
              <tr><td class="flabel">Diskon 2</td><td><input type="number" id="fRpjDiskon2" value="${row.diskon2||0}" ${dis}> %</td><td></td><td><input type="text" id="fRpjDiskon2Amount" value="${rpjNum2(row.diskon2Amount||0)}" disabled></td></tr>
              <tr><td class="flabel">DPP</td><td colspan="3"><input type="text" id="fRpjDpp" value="${rpjNum2(row.dpp||0)}" disabled></td></tr>
              <tr><td class="flabel">Pajak 11 %</td><td>
                  <div class="input-with-btn">
                    <input type="text" id="fRpjPajak11" value="${row.pajak11||''}" readonly>
                    ${!isView ? `<button type="button" class="icon-btn edit" id="rpjPajakInfo" title="Cari Kode Pajak">${icon('search',13)}</button>` : ''}
                  </div>
                </td><td class="flabel" style="background:none;">PPN</td><td><input type="text" id="fRpjPpnAmount" value="${rpjNum2(row.ppnAmount||0)}" disabled></td></tr>
              <tr><td class="flabel">Ongkos Angkut</td><td colspan="3"><input type="number" id="fRpjOngkosAngkut" value="${row.ongkosAngkut||0}" ${dis}></td></tr>
              <tr><td class="flabel">Jumlah</td><td colspan="3"><input type="text" id="fRpjJumlahTotal" value="${rpjNum2(row.jumlahTotal||0)}" disabled style="font-weight:700;font-size:14px;"></td></tr>
              <tr><td class="flabel">Sisa Jumlah</td><td colspan="3"><input type="text" id="fRpjSisaJumlah" value="${rpjNum2(row.sisaJumlah||0)}" disabled></td></tr>
            </table>
          </div>
        </div>

        <div class="form-grid-3" style="grid-template-columns:repeat(3,1fr);margin-top:18px;">
          <div class="form-group">
            <label>Alasan Tipe</label>
            <select id="fRpjAlasanTipe" ${dis}>${RPJ_ALASAN_TIPE_LIST.map(t=>`<option ${row.alasanTipe===t?'selected':''}>${t}</option>`).join('')}</select>
          </div>
          <div class="form-group">
            <label>Alasan</label>
            <select id="fRpjAlasanSub" ${dis}><option value=""></option><option ${row.alasanSub==='Retur Sebagian'?'selected':''}>Retur Sebagian</option><option ${row.alasanSub==='Retur Semua'?'selected':''}>Retur Semua</option></select>
          </div>
        </div>
        <div class="form-group" style="max-width:760px;">
          <label>Alasan</label>
          <textarea id="fRpjAlasanText" class="po-textarea" rows="2" ${dis} placeholder="(…isi manual…)">${row.alasanText||''}</textarea>
        </div>
      </div>
      <div class="card-footer" style="display:flex;gap:10px;justify-content:flex-end;align-items:center;padding:14px 20px;border-top:1px solid var(--border);">
        ${!isView ? `
          <button type="button" class="btn-teal" id="rpjPerbaharuiKurs" style="background:#4dbd9e;">Perbaharui Kurs</button>
          <button type="button" class="btn-teal" id="rpjCetakSimpan">Cetak dan Simpan</button>
          <button type="button" class="btn-primary" id="rpjSimpan">Simpan</button>` : ''}
        <a href="#" id="rpjBatalkan" class="link-add" style="margin-top:0;">${isView?'Tutup':'Batalkan'}</a>
      </div>
    </div>`;
}

/* ===== Tab 1 — Barang Yang Diretur ===== */
function tplRpjBarangTab(row, isView){
  return `
    <div class="table-wrap" style="margin:10px 0 6px;">
      <table class="po-item-table">
        <thead><tr>
          <th>Kode Barang</th>
          <th>Nama Barang</th>
          <th>Multi Batch Number</th>
          <th class="text-right">Qty Physical</th>
          <th class="text-right">Qty Sisa</th>
          <th>U/M</th>
          <th class="text-right">Harga Jual</th>
          <th class="text-right">Disc. Principal(%)</th>
          <th class="text-right">Disc. Distributor(%)</th>
          <th class="text-right">Total Diskon%</th>
          <th class="text-right">Diskon1</th>
          <th class="text-right">Jumlah</th>
        </tr></thead>
        <tbody id="rpjItemsBody">${tplRpjItemRows(row.items, isView)}</tbody>
      </table>
    </div>
    <a href="#" id="rpjTambahItem" class="link-add" style="${isView?'display:none;':''}">${icon('plus',12)} Tambah Item Baru</a>
    <div id="rpjItemsEmptyHint" style="font-size:11.5px;color:var(--text-light);margin-top:6px;${(row.items&&row.items.length)?'display:none;':''}">Belum ada barang — pilih No. Faktur Jual (Sales Invoice) terlebih dahulu, barang faktur itu akan tampil di sini untuk diretur.</div>`;
}

function tplRpjItemRows(items, isView){
  if(!items || !items.length) return `<tr><td colspan="12" style="color:var(--text-light);">Belum ada barang yang diretur.</td></tr>`;
  const dis = isView ? 'disabled' : '';
  return items.map((it,idx)=>`
    <tr data-rpj-item-row="${idx}">
      <td style="min-width:110px;">
        <div class="input-with-btn">
          <input type="text" value="${it.kode||''}" disabled>
          ${!isView ? `<button type="button" class="icon-btn edit" data-rpj-item-info="${idx}" title="Info Barang">${icon('search',12)}</button>` : ''}
        </div>
      </td>
      <td style="min-width:180px;"><textarea rows="2" disabled>${it.nama||''}</textarea></td>
      <td style="min-width:210px;">
        <div class="input-with-btn">
          <input type="text" value="${(it.batches||[]).length}" disabled style="text-align:right;">
          ${!isView ? `<button type="button" class="icon-btn edit" data-rpj-batch-info="${idx}" title="Tambah Batch">${icon('plus',12)}</button>` : ''}
        </div>
        ${(it.batches||[]).map((b,bi)=>`
          <div style="display:flex;gap:4px;margin-top:4px;">
            <input type="text" data-rpj-batch-no="${idx}-${bi}" value="${b.no||''}" style="width:45%;" ${dis}>
            <input type="text" data-rpj-batch-qty="${idx}-${bi}" value="${b.qty||0}" style="width:25%;text-align:right;" ${dis}>
            <input type="text" data-rpj-batch-ed="${idx}-${bi}" value="${b.ed||''}" style="width:30%;" ${dis}>
          </div>`).join('')}
      </td>
      <td style="width:90px;"><input type="number" min="0" data-rpj-qty="${idx}" value="${it.qty||0}" style="text-align:right;" ${dis}></td>
      <td style="width:80px;"><input type="text" value="${it.qtySisa||0}" readonly style="text-align:right;"></td>
      <td style="width:80px;"><select disabled><option>${it.um||''}</option></select></td>
      <td style="width:110px;">
        <div class="input-with-btn">
          <input type="text" data-rpj-harga="${idx}" value="${rpjNum2(it.hargaJual||0)}" readonly style="text-align:right;">
          ${!isView ? `<button type="button" class="icon-btn edit" data-rpj-harga-info="${idx}" title="Cari Harga">${icon('search',12)}</button>` : ''}
        </div>
      </td>
      <td style="width:100px;"><input type="number" min="0" data-rpj-discp="${idx}" value="${it.discPrincipal||0}" style="text-align:right;" ${dis}></td>
      <td style="width:100px;"><input type="number" min="0" data-rpj-discd="${idx}" value="${it.discDistributor||0}" style="text-align:right;" ${dis}></td>
      <td style="width:90px;"><input type="text" data-rpj-totaldisc="${idx}" value="${it.totalDisc||0}" disabled style="text-align:right;"></td>
      <td style="width:110px;"><input type="text" data-rpj-diskon1="${idx}" value="${rpjNum2(it.diskon1||0)}" disabled style="text-align:right;"></td>
      <td style="width:130px;"><input type="text" data-rpj-jumlah="${idx}" value="${rpjNum2(it.jumlah||0)}" disabled style="text-align:right;"></td>
    </tr>`).join('');
}

/* ===== Tab 2 — Rincian Jurnal Akun (Buat Jurnal di tengah + tabel
   selalu editable, TANPA Cost Center — pola Retur Pembelian) ===== */
function tplRpjJurnalContent(row, isView){
  const totals = rpjJurnalTotals(row);
  const selisihColor = Math.abs(totals.selisih) > 0.004 ? 'var(--red)' : 'var(--text)';
  return `
    ${!isView ? `<div style="display:flex;justify-content:center;margin:14px 0;">
      <button type="button" class="btn-secondary" id="rpjBuatJurnal">${icon('refreshCw',13)} Buat Jurnal</button>
    </div>` : '<div style="margin-top:14px;"></div>'}
    <div class="card-header dark-header" style="border-radius:6px;">
      <h3>${icon('settings',14)} Rincian Jurnal Akun</h3>
      ${!isView ? `<button type="button" class="btn-primary" id="rpjJurnalAddRow">${icon('plus',13)} Add</button>` : ''}
    </div>
    <div class="table-wrap" style="margin:6px 0 0;">
      <table class="po-item-table">
        <thead><tr>
          <th>Kode Akun</th><th>Nama Akun</th><th>Keterangan</th><th class="text-right">Jumlah Debit</th><th class="text-right">Jumlah Kredit</th><th>Hapus</th>
        </tr></thead>
        <tbody id="rpjJurnalBody">${tplRpjJurnalRows(row.jurnalAkun, isView)}</tbody>
      </table>
    </div>
    <div style="max-width:280px;margin:16px 0 0 auto;">
      <div style="font-size:12.5px;font-weight:600;color:var(--text);margin-bottom:4px;">Jumlah Debit - Kredit</div>
      <input type="text" id="rpjJurnalSelisih" value="${rpjNum2(totals.selisih)}" readonly style="text-align:right;font-weight:700;color:${selisihColor};">
    </div>`;
}

function tplRpjJurnalRows(list, isView){
  if(!list || !list.length) return `<tr><td colspan="6" style="color:var(--text-light);">Belum ada rincian jurnal — klik "Buat Jurnal".</td></tr>`;
  return list.map((entry,idx)=>{
    if(isView){
      return `
      <tr>
        <td style="min-width:110px;"><input type="text" value="${entry.kodeAkun||''}" readonly></td>
        <td style="min-width:180px;"><input type="text" value="${entry.namaAkun||''}" readonly></td>
        <td style="min-width:160px;"><input type="text" value="${entry.keterangan||'(…isi manual…)'}" readonly></td>
        <td style="width:150px;"><input type="text" value="${rpjNum2(entry.debit||0)}" readonly style="text-align:right;"></td>
        <td style="width:150px;"><input type="text" value="${rpjNum2(entry.kredit||0)}" readonly style="text-align:right;"></td>
        <td style="width:50px;"></td>
      </tr>`;
    }
    return `
    <tr data-rpj-jurnal-row="${idx}">
      <td style="min-width:110px;">
        <div class="input-with-btn">
          <input type="text" data-rpj-jurnal-kode="${idx}" value="${entry.kodeAkun||''}" readonly>
          <button type="button" class="icon-btn edit" data-rpj-jurnal-akun-search="${idx}" title="Cari Akun GL">${icon('search',12)}</button>
        </div>
      </td>
      <td style="min-width:180px;"><input type="text" data-rpj-jurnal-nama="${idx}" value="${entry.namaAkun||''}" readonly></td>
      <td style="min-width:160px;"><input type="text" data-rpj-jurnal-ket="${idx}" value="${entry.keterangan||''}" placeholder="(…isi manual…)"></td>
      <td style="width:150px;"><input type="number" step="0.01" min="0" data-rpj-jurnal-debit="${idx}" value="${entry.debit||0}" style="text-align:right;"></td>
      <td style="width:150px;"><input type="number" step="0.01" min="0" data-rpj-jurnal-kredit="${idx}" value="${entry.kredit||0}" style="text-align:right;"></td>
      <td style="width:50px;"><button type="button" class="icon-btn del" data-rpj-jurnal-del="${idx}" title="Hapus Baris">${icon('trash',14)}</button></td>
    </tr>`;
  }).join('');
}

/* =====================================================================
   CETAKAN — kop bersama (logo DBM + nama & alamat perusahaan dari
   DATA.cabangMaster[0]/Head Office), dipakai 2 cetakan di bawah.
===================================================================== */
function tplRpjKop(){
  const ho = DATA.cabangMaster[0] || {};
  return `
    <div style="display:flex;gap:14px;align-items:flex-start;">
      <div style="width:64px;height:64px;border-radius:10px;background:var(--navy);color:#fff;display:flex;align-items:center;justify-content:center;font-weight:800;font-size:20px;">DBM</div>
      <div>
        <div style="font-weight:800;font-size:14px;">${(ho.namaPerusahaan||'PT Distriversa Buanamas').toUpperCase()}</div>
        <div style="font-size:11.5px;color:#333;">${ho.alamat||''}</div>
        <div style="font-size:11.5px;color:#333;">${ho.kota||''}, ${ho.provinsi||''} ${ho.kodePos||''}</div>
        <div style="font-size:11.5px;color:#333;">Tlp: ${ho.telepon||''}</div>
      </div>
    </div>`;
}

/* Cetakan 1 — "Retur Penjualan" (faktur retur, replika PDF
   "Faktur Retur Penjualan"). */
function tplRpjCetakFaktur(row){
  const itemRows = (row.items||[]).map((it,i)=>`
    <tr>
      <td style="text-align:center;">${i+1}</td>
      <td>${it.kode}</td>
      <td>${it.nama}</td>
      <td style="text-align:right;">${rpjNum2(it.qty)}&nbsp;&nbsp;${it.um||''}</td>
      <td style="text-align:right;">${rpjNum2(it.hargaJual)}</td>
      <td style="text-align:right;">${rpjNum2(it.totalDisc)}</td>
      <td style="text-align:right;">${rpjNum2(it.jumlah)}</td>
    </tr>`).join('');
  const kota = (DATA.cabangMaster[0]||{}).kota || 'Jakarta';
  const td = 'padding:3px 6px;font-size:11.5px;';
  return `
    <div class="modal-box" style="max-width:900px;width:96vw;">
      <div class="modal-header"><span>${icon('printer',15)} Cetak Retur Penjualan — ${row.no}</span><span class="close" id="modalClose">&times;</span></div>
      <div class="modal-body" style="max-height:72vh;overflow:auto;">
        <div style="background:#fff;border:1px solid var(--border);padding:22px 26px;font-family:Arial,Helvetica,sans-serif;color:#111;">
          <div style="display:flex;justify-content:space-between;">${tplRpjKop()}<div style="font-size:11px;">1/1</div></div>
          <div style="text-align:center;font-weight:800;font-size:15px;margin:10px 0 12px;">Retur Penjualan</div>
          <div style="display:flex;justify-content:space-between;gap:20px;font-size:11.5px;line-height:1.7;">
            <table style="border:none;"><tbody>
              <tr><td style="${td}">No. Faktur</td><td style="${td}">: ${row.no}</td></tr>
              <tr><td style="${td}">Tanggal</td><td style="${td}">: ${rpjTglPanjang(row.tglRetur)}</td></tr>
              <tr><td style="${td}">Tgl. Jth. Tempo</td><td style="${td}">: ${row.tglJthTempo||''}</td></tr>
              <tr><td style="${td}">KodeCrc</td><td style="${td}">: IDR</td></tr>
              <tr><td style="${td}">Salesman</td><td style="${td}">: ${(row.salesman||'').toUpperCase()} &nbsp; Dept : 00</td></tr>
            </tbody></table>
            <table style="border:none;"><tbody>
              <tr><td style="${td}">Langganan</td><td style="${td}">: ${(row.customer||'').toUpperCase()}</td></tr>
              <tr><td style="${td}">Alamat</td><td style="${td}">: ${(row.alamatPengiriman||'').toUpperCase().slice(0,40)}</td></tr>
            </tbody></table>
          </div>
          <table style="width:100%;border-collapse:collapse;margin-top:10px;">
            <thead><tr style="border-top:2px solid #111;border-bottom:2px solid #111;">
              <th style="${td}width:34px;">No.</th><th style="${td}text-align:left;">Kode Barang</th><th style="${td}text-align:left;">Nama Barang</th><th style="${td}text-align:right;">Qty</th><th style="${td}text-align:right;">Harga</th><th style="${td}text-align:right;">Disc%</th><th style="${td}text-align:right;">Jumlah</th>
            </tr></thead>
            <tbody>${itemRows}</tbody>
          </table>
          <div style="border-top:2px solid #111;margin-top:70px;"></div>
          <div style="display:flex;justify-content:space-between;gap:20px;margin-top:8px;font-size:11.5px;">
            <div style="max-width:55%;">
              <div><b>Terbilang :</b> ${rpjTerbilangRupiah(row.jumlahTotal)}</div>
              <div style="margin-top:6px;"><b>Catatan &nbsp;&nbsp;:</b> ${row.alasanText||'(…isi manual…)'}</div>
              <div style="display:flex;gap:80px;margin-top:26px;text-align:center;">
                <div><b>Penerima</b><div style="margin-top:44px;">( ______________ )</div></div>
                <div><b>${kota}, ${rpjTglPanjang(row.tglRetur)}</b><div style="margin-top:44px;">( ______________ )</div></div>
              </div>
            </div>
            <table style="border:none;min-width:220px;"><tbody>
              <tr><td style="${td}">Sub Total :</td><td style="${td}text-align:right;">${rpjNum2(row.dpp)}</td></tr>
              <tr><td style="${td}">Dpp :</td><td style="${td}text-align:right;">${rpjNum2(row.dpp)}</td></tr>
              <tr><td style="${td}">Ppn :</td><td style="${td}text-align:right;">${rpjNum2(row.ppnAmount)}</td></tr>
              <tr style="border-top:2px solid #111;"><td style="${td}font-weight:800;">Grand Total :</td><td style="${td}text-align:right;font-weight:800;">${rpjNum2(row.jumlahTotal)}</td></tr>
            </tbody></table>
          </div>
        </div>
      </div>
      <div class="modal-footer">
        <button class="btn-secondary" id="modalCancel">Tutup</button>
      </div>
    </div>`;
}

/* Cetakan 2 — "BUKTI PENERIMAAN BARANG RETUR (BPBR) DARI PELANGGAN"
   (replika PDF "Klik Lihat BAPBR"). */
function tplRpjCetakBapbr(row){
  const td = 'padding:4px 6px;font-size:11.5px;vertical-align:top;';
  const itemRows = (row.items||[]).map(it=>{
    const batchTxt = (it.batches||[]).map(b=>`${b.no} - ${b.ed}(${b.qty})`).join('<br>');
    return `
    <tr>
      <td style="${td}">${it.kode}</td>
      <td style="${td}">${it.nama}</td>
      <td style="${td}">${batchTxt}</td>
      <td style="${td}text-align:right;">${rpjNum2(it.qty)}</td>
      <td style="${td}">${it.um||''}</td>
      <td style="${td}">${row.alasanText||'(…isi manual…)'}</td>
      <td style="${td}"></td>
      <td style="${td}"></td>
    </tr>`;
  }).join('');
  const ttd = ['Verifikasi oleh Penanggung Jawab','Disetujui oleh Finance & Accounting','Disetujui oleh Principal','Diketahui oleh Kepala Cabang/HO','Diserahkan oleh Pelanggan','Diterima oleh Salesman/Pengantar Brg','Fisik Produk Diperiksa Ka.Gudang'];
  return `
    <div class="modal-box" style="max-width:980px;width:96vw;">
      <div class="modal-header"><span>${icon('eye',15)} BAPBR — ${row.no}</span><span class="close" id="modalClose">&times;</span></div>
      <div class="modal-body" style="max-height:72vh;overflow:auto;">
        <div style="background:#fff;border:1px solid var(--border);padding:22px 26px;font-family:Arial,Helvetica,sans-serif;color:#111;">
          <div style="display:flex;justify-content:space-between;gap:20px;">
            ${tplRpjKop()}
            <table style="border:none;font-size:11.5px;"><tbody>
              <tr><td style="${td}">BPBR NO</td><td style="${td}">: ${row.no}</td></tr>
              <tr><td style="${td}">TANGGAL</td><td style="${td}">: ${(row.tglRetur||'').split(' ')[0]}</td></tr>
              <tr><td style="${td}">INVOICE NO</td><td style="${td}">: ${row.noFakturJual||''}</td></tr>
              <tr><td style="${td}">NAMA PELANGGAN</td><td style="${td}">: ${(row.customer||'').toUpperCase()}</td></tr>
            </tbody></table>
          </div>
          <div style="text-align:center;font-weight:800;font-size:14px;margin:14px 0 10px;">BUKTI PENERIMAAN BARANG RETUR (BPBR) DARI PELANGGAN</div>
          <table style="width:100%;border-collapse:collapse;">
            <thead><tr style="border-top:2px solid #111;border-bottom:2px solid #111;">
              <th style="${td}text-align:left;">Kode Item</th>
              <th style="${td}text-align:left;">Nama Item</th>
              <th style="${td}text-align:left;">Exp Date &amp; Batch No.</th>
              <th style="${td}text-align:right;">Qty</th>
              <th style="${td}text-align:left;">UoM</th>
              <th style="${td}text-align:left;">Alasan Retur</th>
              <th style="${td}text-align:left;">Credit Memo No</th>
              <th style="${td}text-align:left;">Debit Memo No.</th>
            </tr></thead>
            <tbody>${itemRows}</tbody>
          </table>
          <div style="border-top:2px solid #111;margin-top:80px;"></div>
          <div style="display:flex;gap:8px;justify-content:space-between;margin-top:14px;text-align:center;font-size:10.8px;">
            ${ttd.map(t=>`<div style="flex:1;">${t}<div style="margin-top:52px;">( ______ )</div></div>`).join('')}
          </div>
        </div>
      </div>
      <div class="modal-footer">
        <button class="btn-secondary" id="modalCancel">Tutup</button>
      </div>
    </div>`;
}

/* Picker Customer & Sales Invoice & Akun GL — salinan lokal pola
   modul transaksi lain. */
function tplRpjCustomerPicker(list){
  return `
    <div class="modal-box" style="max-width:640px;">
      <div class="modal-header"><span>Pilih Customer</span><span class="close" id="modalClose">&times;</span></div>
      <div class="modal-body">
        <input type="text" id="rpjCustomerPickerSearch" placeholder="Cari kode / nama customer..." style="width:100%;border:1px solid var(--border);border-radius:6px;padding:8px 10px;font-size:12.8px;margin-bottom:12px;">
        <div class="table-wrap" style="max-height:360px;overflow:auto;">
          <table>
            <thead><tr><th>Kode</th><th>Nama Customer</th><th>Kota</th><th></th></tr></thead>
            <tbody id="rpjCustomerPickerBody">${tplRpjCustomerPickerRows(list)}</tbody>
          </table>
        </div>
      </div>
      <div class="modal-footer"><button class="btn-secondary" id="modalCancel">Tutup</button></div>
    </div>`;
}

function tplRpjCustomerPickerRows(list){
  if(!list.length) return `<tr><td colspan="4" style="color:var(--text-light);">Tidak ada customer ditemukan</td></tr>`;
  return list.map(c=>`
    <tr><td>${c.kode}</td><td>${c.nama}</td><td>${c.kota||''}</td><td><button class="btn-pick" data-pick-customer="${c.kode}">Pilih</button></td></tr>`).join('');
}

function tplRpjFakturPicker(list){
  return `
    <div class="modal-box" style="max-width:760px;">
      <div class="modal-header"><span>Pilih Sales Invoice</span><span class="close" id="modalClose">&times;</span></div>
      <div class="modal-body">
        <input type="text" id="rpjFakturPickerSearch" placeholder="Cari no. faktur / customer..." style="width:100%;border:1px solid var(--border);border-radius:6px;padding:8px 10px;font-size:12.8px;margin-bottom:12px;">
        <div class="table-wrap" style="max-height:340px;overflow:auto;">
          <table>
            <thead><tr><th>No. Faktur</th><th>Tgl.</th><th>Customer</th><th>Cabang</th><th></th></tr></thead>
            <tbody id="rpjFakturPickerBody">${tplRpjFakturPickerRows(list)}</tbody>
          </table>
        </div>
      </div>
      <div class="modal-footer"><button class="btn-secondary" id="modalCancel">Tutup</button></div>
    </div>`;
}

function tplRpjFakturPickerRows(list){
  if(!list.length) return `<tr><td colspan="5" style="color:var(--text-light);">Tidak ada faktur ditemukan</td></tr>`;
  return list.map(f=>`
    <tr><td>${f.no}</td><td>${f.tgl||''}</td><td>${f.customerNama||''}</td><td>${f.cabang||''}</td><td><button class="btn-pick" data-pick-faktur="${f.no}">Pilih</button></td></tr>`).join('');
}

function tplRpjAkunPicker(list){
  return `
    <div class="modal-box" style="max-width:640px;">
      <div class="modal-header"><span>Pilih Akun GL</span><span class="close" id="modalClose">&times;</span></div>
      <div class="modal-body">
        <input type="text" id="rpjAkunPickerSearch" placeholder="Cari kode / nama akun..." style="width:100%;border:1px solid var(--border);border-radius:6px;padding:8px 10px;font-size:12.8px;margin-bottom:12px;">
        <div class="table-wrap" style="max-height:360px;overflow:auto;">
          <table>
            <thead><tr><th>Kode</th><th>Nama Akun</th><th>Kat.</th><th></th></tr></thead>
            <tbody id="rpjAkunPickerBody">${tplRpjAkunPickerRows(list)}</tbody>
          </table>
        </div>
      </div>
      <div class="modal-footer"><button class="btn-secondary" id="modalCancel">Tutup</button></div>
    </div>`;
}

function tplRpjAkunPickerRows(list){
  if(!list.length) return `<tr><td colspan="4" style="color:var(--text-light);">Tidak ada akun ditemukan</td></tr>`;
  return list.map(a=>`
    <tr><td>${a.kode}</td><td>${a.nama}</td><td>${a.kategori}</td><td><button class="btn-pick" data-rpj-pick-akun="${a.kode}">Pilih</button></td></tr>`).join('');
}

function tplRpjDeleteConfirm(row){
  return `
    <div class="modal-box">
      <div class="modal-header"><span>Hapus Retur Penjualan</span><span class="close" id="modalClose">&times;</span></div>
      <div class="modal-body"><p>Yakin ingin menghapus Retur Penjualan <b>${row.no}</b> — ${(row.customer||'').toUpperCase()}? Dokumen retur tidak bisa diedit — hapus lalu buat ulang apabila mau mengubahnya.</p></div>
      <div class="modal-footer">
        <button class="btn-secondary" id="modalCancel">Batal</button>
        <button class="btn-danger" id="modalDelete">Hapus</button>
      </div>
    </div>`;
}

function tplRpjInfoModal(title,text){
  return `
    <div class="modal-box">
      <div class="modal-header"><span>${title}</span><span class="close" id="modalClose">&times;</span></div>
      <div class="modal-body"><p>${text}</p></div>
      <div class="modal-footer"><button class="btn-primary" id="modalOk">Mengerti</button></div>
    </div>`;
}
