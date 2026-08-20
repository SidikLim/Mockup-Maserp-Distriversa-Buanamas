/* =========================================================
   TEMPLATE (HTML saja) — Transaksi A.R. SSP (Customer & Penjualan >
   Daftar Transaksi > Transaksi A.R. SSP, key page:'penerimaanSsp').
   Semua fungsi di file ini HANYA menyusun & mengembalikan markup HTML
   (string) atau helper murni, TIDAK ada DOM-binding di sini. Logic-nya
   ada di file sebelah: penerimaan-ssp.js

   Modul baru 2026-08-20, melengkapi fitur "PPN/PPH ditanggung customer"
   yang ditambahkan ke Penerimaan Piutang hari yang sama (lihat catatan
   besar di js/pages/penerimaan-piutang.template.js utk konteks lengkap
   & 3 contoh jurnal dari user). Sebelumnya menu ini
   (`Transaksi A.R. SSP`) placeholder murni di js/menu.js — SEKARANG
   diisi modul CRUD sungguhan (walau ringkas, cuma Tambah/Lihat/Hapus,
   TANPA Ubah — sekali "diterima" tidak masuk akal untuk diubah lagi,
   konsisten dgn semangat "Nota Kredit" sbg dokumen final).

   Alur bisnis: saat Pelunasan Piutang, kalau PPN/PPH ditanggung customer
   TAPI bukti SSP-nya belum ada di tangan, faktur itu dicatat sbg
   piutang sementara "AR SSP PPN/PPH" (potonganPpn/Pph:true,
   sudahTerimaSspPpn/Pph:false — lihat DATA.penerimaanPiutang). Begitu
   Customer benar-benar menyerahkan bukti SSP, modul INI dipakai utk
   mencatatnya: pilih Customer -> tampil checklist SEMUA baris AR SSP
   PPN/PPH yang masih outstanding milik Customer itu (dikumpulkan lintas
   SEMUA baris DATA.penerimaanPiutang, bukan cuma 1 dokumen) -> centang
   yang sudah diterima -> Simpan. Efeknya 2: (1) flag
   sudahTerimaSspPpn/Pph pada faktur asal di-set true (AR SSP itu
   "closed", jurnal Penerimaan Piutang dokumen ASALNYA TIDAK diubah lagi
   — cukup dianggap sudah closed lewat 1 transaksi baru di sini,
   pendekatan "Nota Kredit terpisah" bukan "edit dokumen lama", sesuai
   istilah user "membuat transaksi AR dengan type nota kredit"), (2) 1
   baris baru DATA.penerimaanSsp dibuat sbg histori/bukti transaksi ini
   (No. Transaksi format "26/NK/{Cabang}/08/{urut}", NK = Nota Kredit).

   Jurnal transaksi ini (SELALU sama, tidak ada mode lain — lihat
   tplPpSspJurnalRows()): PPn Pemungut(D) + Uang Muka PPH 22(D) =
   AR SSP PPN(K) + AR SSP PPH(K) — kebalikan pas dari baris AR SSP yang
   dibuat sebelumnya di Penerimaan Piutang (Debit jadi Kredit), persis
   spesifikasi user. Akun dibaca dari DATA.jurnalPenjualan[0] sama
   seperti ppBuildJurnalLines() di penerimaan-piutang.js (fallback ke
   kode default kalau kosong).

   Cabang dokumen ini diambil dari cabang faktur PERTAMA yang dicentang
   (semua item 1 transaksi biasanya dari cabang yang sama di data sample
   ini) — SEDERHANA, tidak ada field Cabang terpisah di form (tidak ada
   screenshot detail utk modul ini, jadi form dibuat ringkas mengikuti
   pola "Dominasi Claim Setting"/CRUD sederhana, bukan full-page rumit).
========================================================= */

function ppSspNum2(n){ return Number(n||0).toLocaleString('id-ID', {minimumFractionDigits:2, maximumFractionDigits:2}); }

function tplPenerimaanSspListPage(){
  return `
    <div class="breadcrumb">Home / <b>Transaksi A.R. SSP</b></div>
    <div class="card">
      <div class="card-header dark-header">
        <h3>${icon('invoice',15)} Daftar Transaksi A.R. SSP</h3>
        <div class="toolbar-actions">
          <button class="btn-primary" id="btnPpSspAdd">${icon('plus',14)} Tambah</button>
        </div>
      </div>
      <div class="table-toolbar">
        <select id="ppSspPageSize"><option selected>10</option><option>25</option><option>50</option></select>
        <input type="text" id="ppSspSearch" placeholder="Pencarian Global">
      </div>
      <div class="table-wrap"><table>
        <thead><tr>
          <th>No. Transaksi</th>
          <th>Tgl. Trn.</th>
          <th>Customer</th>
          <th>Total AR SSP PPN</th>
          <th>Total AR SSP PPH</th>
          <th>Jumlah</th>
          <th>Keterangan</th>
          <th>Lihat</th>
          <th>Hapus</th>
        </tr></thead>
        <tbody id="ppSspTbody"></tbody>
      </table></div>
      <div class="table-footer"><div class="pager"><button>First</button><button>Previous</button><button class="active">1</button><button>Next</button><button>Last</button></div><div id="ppSspTotal"></div></div>
    </div>`;
}

function tplPpSspRows(rows){
  if(!rows.length) return `<tr><td colspan="9" style="color:var(--text-light);">Tidak ada data Transaksi A.R. SSP</td></tr>`;
  return rows.map((r,i)=>`
    <tr>
      <td><b style="color:var(--blue);">${r.no}</b></td>
      <td>${r.tgl||''}</td>
      <td>${r.customerNama||''}</td>
      <td class="text-right">${ppSspNum2(r.totalPpn)}</td>
      <td class="text-right">${ppSspNum2(r.totalPph)}</td>
      <td class="text-right" style="white-space:nowrap;">${ppSspNum2(r.jumlah)}</td>
      <td style="max-width:220px;"><div style="white-space:nowrap;overflow:hidden;text-overflow:ellipsis;" title="${r.keterangan||''}">${r.keterangan||''}</div></td>
      <td><button class="icon-btn view" data-view="${i}" title="Lihat">${icon('eye',15)}</button></td>
      <td><button class="icon-btn del" data-del="${i}" title="Hapus">${icon('trash',15)}</button></td>
    </tr>`).join('');
}

/* Form Tambah — pilih Customer, tampil checklist item AR SSP outstanding.
   Form Lihat — read-only, tampil item yang SUDAH dipilih waktu Simpan
   dulu (dari row.items yang tersimpan, bukan re-scan outstanding). */
function tplPpSspForm(mode, row, outstanding){
  const isView = mode === 'view';
  return `
    <div class="breadcrumb">Home / Transaksi A.R. SSP / <b>${isView?'Lihat':'Tambah'}</b></div>
    <div class="card">
      <div class="card-header dark-header"><h3>${icon(isView?'eye':'plus',15)} ${isView?'Transaksi A.R. SSP':'+ Transaksi A.R. SSP'}</h3></div>
      <div class="card-body">
        <div class="form-grid-3" style="grid-template-columns:repeat(3,1fr);">
          <div class="form-group">
            <label>No. Transaksi</label>
            <input type="text" value="${row.no||'(otomatis saat Simpan)'}" readonly>
          </div>
          <div class="form-group">
            <label>Tgl. Trn.</label>
            <input type="text" id="fPpSspTgl" value="${row.tgl||''}" ${isView?'disabled':''}>
          </div>
          <div class="form-group">
            <label>Dari Customer</label>
            <div class="input-with-btn">
              <input type="text" id="fPpSspCustomer" value="${row.customerNama||''}" placeholder="Pilih Customer" readonly>
              ${!isView ? `<button type="button" class="icon-btn edit" id="ppSspCustomerSearch" title="Cari Customer">${icon('search',13)}</button>` : ''}
            </div>
          </div>
        </div>

        <div class="card-header dark-header" style="border-radius:6px;margin:16px 0 0;">
          <h3>${icon('file',14)} ${isView ? 'AR SSP yang Diterima' : 'AR SSP PPN/PPH Belum Diterima'}</h3>
        </div>
        <div class="table-wrap" style="margin:6px 0 6px;">
          <table class="po-item-table">
            <thead><tr>
              <th>Terima?</th>
              <th>No. Penerimaan Piutang</th>
              <th>No. Faktur</th>
              <th>Tipe Pajak</th>
              <th>Nominal</th>
            </tr></thead>
            <tbody id="ppSspItemBody">${tplPpSspItemRows(isView ? (row.items||[]) : outstanding, isView)}</tbody>
          </table>
        </div>
        <div id="ppSspEmptyHint" style="font-size:11.5px;color:var(--text-light);${(isView?(row.items||[]).length:outstanding.length) ? 'display:none;' : ''}">
          ${isView ? 'Tidak ada item.' : 'Tidak ada AR SSP PPN/PPH yang perlu diterima untuk Customer ini — semua sudah diselesaikan, atau Customer belum punya potongan pajak sama sekali.'}
        </div>

        <div style="display:flex;justify-content:flex-end;margin-top:14px;">
          <div style="max-width:280px;width:100%;">
            <div class="form-group">
              <label>Jumlah</label>
              <input type="text" id="ppSspJumlah" value="${ppSspNum2(isView ? row.jumlah : 0)}" readonly style="text-align:right;font-weight:700;">
            </div>
          </div>
        </div>

        <div class="card-header dark-header" style="border-radius:6px;margin:16px 0 0;">
          <h3>${icon('bank',14)} Rincian Jurnal Akun</h3>
        </div>
        <div class="table-wrap" style="margin:6px 0 0;">
          <table class="po-item-table" id="ppSspJurnalTable">
            <thead><tr><th>Kode Akun</th><th>Nama Akun</th><th>Keterangan</th><th>Jumlah Debit</th><th>Jumlah Kredit</th></tr></thead>
            <tbody id="ppSspJurnalBody">${tplPpSspJurnalRows(isView ? row.items||[] : [], row.customerNama||'')}</tbody>
          </table>
        </div>

        <table class="field-table" style="margin-top:14px;">
          <tr><td class="flabel">Keterangan</td><td><textarea id="fPpSspKeterangan" class="po-textarea" rows="2" ${isView?'disabled':''}>${row.keterangan||''}</textarea></td></tr>
        </table>
      </div>
      <div class="card-footer" style="display:flex;gap:10px;justify-content:flex-end;padding:14px 20px;border-top:1px solid var(--border);">
        ${!isView ? `<button type="button" class="btn-primary" id="ppSspSimpan">Simpan</button>` : ''}
        <button type="button" class="btn-secondary" id="ppSspBatalkan">${isView?'Tutup':'Batalkan'}</button>
      </div>
    </div>`;
}

function tplPpSspItemRows(items, isView){
  if(!items || !items.length) return `<tr><td colspan="5" style="color:var(--text-light);">Tidak ada data.</td></tr>`;
  return items.map((it,idx)=>`
    <tr>
      <td style="text-align:center;width:60px;"><input type="checkbox" data-pp-ssp-item="${idx}" ${it.checked?'checked':''} ${isView?'disabled':''}></td>
      <td>${it.penerimaanPiutangNo}</td>
      <td>${it.fakturNo}</td>
      <td>${it.tipePajak}</td>
      <td class="text-right">${ppSspNum2(it.nominal)}</td>
    </tr>`).join('');
}

/* Jurnal transaksi ini SELALU sama polanya (lihat catatan besar di
   header file ini): PPn Pemungut(D)+Uang Muka PPH22(D) = AR SSP
   PPN(K)+AR SSP PPH(K) — dihitung dari item yang DICENTANG (mode
   Tambah, dipanggil ulang reaktif tiap centang berubah) atau item
   TERSIMPAN (mode Lihat). */
function tplPpSspJurnalRows(itemsChecked, customerNama){
  const totalPpn = itemsChecked.filter(it=>it.tipePajak==='PPN').reduce((s,it)=>s+(+it.nominal||0),0);
  const totalPph = itemsChecked.filter(it=>it.tipePajak==='PPH').reduce((s,it)=>s+(+it.nominal||0),0);
  const jj = (DATA.jurnalPenjualan && DATA.jurnalPenjualan[0]) || {};
  const akunArSspPpn = jj.akunARSSPPPN || '1120003';
  const akunArSspPph = jj.akunARSSPPPH || '1120004';
  const akunPpnPemungut = jj.akunPPNPemungut || '2120003';
  const akunUmPph22 = jj.akunUangMukaPPH22 || '1140003';
  const namaOf = (kode, fb) => { const a = DATA.akunGL.find(x=>x.kode===kode); return a ? a.nama : fb; };
  const rows = [];
  if(totalPpn > 0.004) rows.push({kode:akunPpnPemungut, nama:namaOf(akunPpnPemungut,'PPN Pemungut'), debit:totalPpn, kredit:0});
  if(totalPph > 0.004) rows.push({kode:akunUmPph22, nama:namaOf(akunUmPph22,'Uang Muka PPH 22'), debit:totalPph, kredit:0});
  if(totalPpn > 0.004) rows.push({kode:akunArSspPpn, nama:namaOf(akunArSspPpn,'Piutang SSP PPN'), debit:0, kredit:totalPpn});
  if(totalPph > 0.004) rows.push({kode:akunArSspPph, nama:namaOf(akunArSspPph,'Piutang SSP PPH'), debit:0, kredit:totalPph});
  if(!rows.length) return `<tr><td colspan="5" style="color:var(--text-light);">Belum ada item AR SSP yang dicentang.</td></tr>`;
  return rows.map(r=>`
    <tr>
      <td>${r.kode}</td><td>${r.nama}</td><td>${customerNama}</td>
      <td class="text-right">${ppSspNum2(r.debit)}</td>
      <td class="text-right">${ppSspNum2(r.kredit)}</td>
    </tr>`).join('');
}

/* Picker Customer — SALINAN LOKAL dari tplPpCustomerPicker() (Penerimaan
   Piutang), bukan reuse cross-file (lihat catatan "local copy" yang
   sama di semua modul transaksi lain karena urutan lazy-load antar
   modul tidak terjamin). */
function tplPpSspCustomerPicker(list){
  return `
    <div class="modal-box" style="max-width:560px;">
      <div class="modal-header"><span>Pilih Customer</span><span class="close" id="modalClose">&times;</span></div>
      <div class="modal-body">
        <div class="table-wrap" style="max-height:340px;overflow:auto;"><table>
          <thead><tr><th>Kode</th><th>Nama Customer</th><th>Kota</th><th></th></tr></thead>
          <tbody>${list.map(c=>`<tr><td>${c.kode}</td><td>${c.nama}</td><td>${c.kota}</td><td><button class="btn-pick" data-pick-customer="${c.kode}">Pilih</button></td></tr>`).join('')}</tbody>
        </table></div>
      </div>
      <div class="modal-footer"><button class="btn-secondary" id="modalCancel">Tutup</button></div>
    </div>`;
}

function tplPpSspDeleteConfirm(row){
  return `
    <div class="modal-box">
      <div class="modal-header"><span>Hapus Transaksi A.R. SSP</span><span class="close" id="modalClose">&times;</span></div>
      <div class="modal-body"><p>Yakin ingin menghapus <b>${row.no}</b>? Status "Sudah Terima SSP" pada faktur terkait akan dikembalikan seperti semula (jadi belum diterima lagi).</p></div>
      <div class="modal-footer">
        <button class="btn-secondary" id="modalCancel">Batal</button>
        <button class="btn-danger" id="modalDelete">Hapus</button>
      </div>
    </div>`;
}
