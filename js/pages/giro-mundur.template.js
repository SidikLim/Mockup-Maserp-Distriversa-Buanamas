/* =========================================================
   TEMPLATE (HTML saja) — Daftar Giro Mundur (Kas/Bank > Daftar
   Transaksi > Daftar Giro Mundur, key page:'giroMundur'). Semua
   fungsi di file ini HANYA menyusun & mengembalikan markup HTML
   (string) atau helper murni, TIDAK ada DOM-binding/data mutation
   di sini. Logic-nya ada di file sebelah: giro-mundur.js

   Sesuai 3 screenshot MASERP yang dikirim user:
   1) "Daftar Giro Mundur": dropdown filter status di header (Belum
      Cair / Cair / Sudah Ditolak, default Belum Cair — FUNGSIONAL,
      giro yang dicairkan/ditolak pindah ke filter status barunya),
      TANPA tombol Tambah (giro mundur lahir otomatis dari
      Pelunasan Utang / Penerimaan Piutang bertipe giro, bukan
      diinput di sini). Kolom: No. Giro (link biru -> modal detail)
      / Bank Giro / No. Transaksi / Tgl. Trn. / Tgl. Jth. Tempo /
      Nama Supplier/Customer / Tipe Transaksi (Terima Giro = dari
      customer, Keluar Giro = ke supplier) / Jumlah Transaksi +
      2 tombol aksi per baris: Cair & Tolak.
   2) Tombol Cair -> halaman "+ Cairkan Giro": Bank (readonly),
      Tgl. Efektif, Keterangan, Jumlah Transaksi readonly; section
      "Pilihan Jurnal": Kode Jurnal (dropdown akun bank dari
      DATA.kasBank) + Debit/Credit readonly yang otomatis mengikuti
      tipe giro — Terima Giro: Debit akun bank, Credit Piutang
      Usaha - Giro Mundur 1120005; Keluar Giro: Debit Hutang Usaha
      Giro Mundur 2110004, Credit akun bank. Footer: Cairkan +
      Batalkan.
   3) Tombol Tolak -> halaman "+ Batalkan Giro" (tanpa field Bank):
      jurnal pembatalan mengembalikan giro ke utang/piutang usaha —
      Terima Giro: Debit Piutang Usaha 1120001, Credit 1120005;
      Keluar Giro: Debit 2110004, Credit Hutang Usaha 2110001.
      Footer: Batalkan Giro + Batalkan.
   Kode akun screenshot (110202/110505/110501, skema instalasi
   lain/SDL) dipetakan ke akun 7-digit DBM; akun giro mundur
   1120005 & 2110004 memang sudah ada di DATA.akunGL (dibuat utk
   form Jurnal Pelunasan Utang/Piutang). */

const GM_STATUS_LIST = ['Belum Cair','Cair','Sudah Ditolak'];

function gmNum2(n){ return Number(n||0).toLocaleString('id-ID', {minimumFractionDigits:2, maximumFractionDigits:2}); }
function gmAkunNama(kode){ const a = DATA.akunGL.find(x => x.kode === kode); return a ? a.nama : ''; }
function gmBankLabel(kode){
  const kb = DATA.kasBank.find(x => x.kode === kode);
  return kb ? `${kb.nama} ${kb.mataUang||''}`.trim() : '';
}
/* Akun GL utk 1 akun bank DATA.kasBank — di mockup dipetakan
   sederhana by nama bank ke akun bank 7-digit DBM di DATA.akunGL. */
function gmBankAkunGL(kode){
  const kb = DATA.kasBank.find(x => x.kode === kode);
  const nama = (kb ? kb.nama : '').toLowerCase();
  if(nama.includes('mandiri')) return '1100011';
  if(nama.includes('bca')) return '1100012';
  if(nama.includes('bni')) return '1100013';
  if(nama.includes('bri')) return '1100014';
  return '1100002'; // Kas Besar — fallback utk rekening kas
}

/* =====================================================================
   LIST PAGE — "Daftar Giro Mundur"
===================================================================== */
function tplGiroMundurListPage(status){
  const selStyle = 'background:var(--teal,#20c997);background:var(--blue-light);color:#fff;border:none;border-radius:6px;padding:8px 10px;font-size:12.5px;font-weight:600;cursor:pointer;';
  return `
    <div class="breadcrumb">Home / Kas/Bank / <b>Daftar Giro Mundur</b></div>
    <div class="card">
      <div class="card-header dark-header">
        <h3>${icon('bank',15)} Daftar Giro Mundur</h3>
        <div class="toolbar-actions">
          <select id="gmFilterStatus" style="${selStyle}">
            ${GM_STATUS_LIST.map(s=>`<option ${s===status?'selected':''}>${s}</option>`).join('')}
          </select>
        </div>
      </div>
      <div class="table-toolbar">
        <select id="gmPageSize"><option selected>10</option><option>25</option><option>50</option></select>
        <input type="text" id="gmSearch" placeholder="Pencarian Global">
      </div>
      <div class="table-wrap"><table>
        <thead><tr>
          <th style="width:120px;">No. Giro</th>
          <th style="width:180px;">Bank Giro</th>
          <th style="width:160px;">No. Transaksi</th>
          <th style="width:100px;">Tgl. Trn.</th>
          <th style="width:110px;">Tgl. Jth. Tempo</th>
          <th>Nama Supplier/Customer</th>
          <th style="width:120px;">Tipe Transaksi</th>
          <th class="text-right" style="width:150px;">Jumlah Transaksi</th>
          <th style="width:70px;">Cair</th>
          <th style="width:70px;">Tolak</th>
        </tr></thead>
        <tbody id="gmTbody"></tbody>
      </table></div>
      <div class="table-footer"><div class="pager"><button>First</button><button>Previous</button><button class="active">1</button><button>Next</button><button>Last</button></div><div id="gmTotal"></div></div>
    </div>`;
}

function tplGmRows(rows, status){
  if(!rows.length) return `<tr><td colspan="10" style="color:var(--text-light);padding:14px;">Tidak ada giro berstatus "${status}" yang cocok dengan pencarian.</td></tr>`;
  const aksiAktif = status === 'Belum Cair';
  return rows.map((r,i)=>`
    <tr>
      <td><button class="link-pick" data-gm-view="${i}">${r.noGiro}</button></td>
      <td>${gmBankLabel(r.bankKode)}</td>
      <td>${r.noTransaksi||''}</td>
      <td>${r.tgl||''}</td>
      <td>${r.tglJthTempo||''}</td>
      <td>${(r.nama||'').toUpperCase()}</td>
      <td>${r.tipe||''}</td>
      <td class="text-right">${gmNum2(r.jumlah)}</td>
      <td>${aksiAktif ? `<button class="icon-btn edit" data-gm-cair="${i}" title="Cairkan Giro">${icon('wallet',15)}</button>` : ''}</td>
      <td>${aksiAktif ? `<button class="icon-btn edit" data-gm-tolak="${i}" title="Batalkan Giro" style="font-size:13px;line-height:1;">&#9632;</button>` : ''}</td>
    </tr>`).join('');
}

/* =====================================================================
   FORM "Cairkan Giro" (mode='cair') / "Batalkan Giro" (mode='tolak')
   — full page, hanya field yang berbeda: Cairkan punya field Bank.
===================================================================== */
function tplGmActionForm(mode, row){
  const isCair = mode === 'cair';
  const jurnal = gmJurnalFor(mode, row);
  const bankOptions = DATA.kasBank
    .filter(k => (k.tipeRekening||'') !== 'Kas')
    .map(k => `<option value="${k.kode}" ${row.bankKode===k.kode?'selected':''}>${gmBankLabel(k.kode)}</option>`).join('');
  return `
    <div class="breadcrumb">Home / Daftar Giro Mundur / <b>${isCair ? 'Cairkan Giro' : 'Batalkan Giro'}</b></div>
    <div class="card">
      <div class="card-header dark-header"><h3>${icon('plus',15)} ${isCair ? 'Cairkan Giro' : 'Batalkan Giro'}</h3></div>
      <div class="card-body">
        <h2 style="font-size:20px;font-weight:700;color:var(--navy);margin:0 0 16px;padding-bottom:10px;border-bottom:1px solid var(--border);max-width:300px;">${isCair ? 'Cairkan Giro' : 'Batalkan Giro'}</h2>

        <div class="form-grid-3" style="grid-template-columns:repeat(4,1fr);">
          ${isCair ? `
          <div class="form-group">
            <label>Bank</label>
            <select id="fGmBank" disabled>${bankOptions}</select>
          </div>` : ''}
          <div class="form-group">
            <label>Tgl. Efektif</label>
            <div class="input-with-btn">
              <input type="text" id="fGmTglEfektif" value="${row.tglJthTempo||''}">
              <span class="icon-btn edit" style="pointer-events:none;">${icon('calendar',13)}</span>
            </div>
          </div>
          <div class="form-group" ${isCair ? '' : 'style="grid-column:2 / span 2;"'}>
            <label>Keterangan</label>
            <textarea id="fGmKeterangan" class="po-textarea" rows="2">${row.keterangan||''}</textarea>
          </div>
          <div class="form-group">
            <label>Jumlah Transaksi</label>
            <input type="text" value="${gmNum2(row.jumlah)}" readonly style="text-align:right;">
          </div>
        </div>

        <div class="form-section" style="margin-top:18px;">Pilihan Jurnal</div>
        <table class="field-table" style="max-width:820px;">
          <tr>
            <td class="flabel" style="width:180px;">Kode Jurnal</td>
            <td colspan="2"><select id="fGmKodeJurnal">${DATA.kasBank.filter(k => (k.tipeRekening||'') !== 'Kas').map(k=>`<option value="${k.kode}" ${row.bankKode===k.kode?'selected':''}>${gmBankLabel(k.kode)}</option>`).join('')}</select></td>
          </tr>
          <tr>
            <td class="flabel">Debit</td>
            <td style="width:200px;"><input type="text" id="fGmDebit" value="${jurnal.debit}" readonly></td>
            <td id="fGmDebitNama" style="font-size:12.5px;">${gmAkunNama(jurnal.debit)}</td>
          </tr>
          <tr>
            <td class="flabel">Credit</td>
            <td><input type="text" id="fGmCredit" value="${jurnal.kredit}" readonly></td>
            <td id="fGmCreditNama" style="font-size:12.5px;">${gmAkunNama(jurnal.kredit)}</td>
          </tr>
        </table>
      </div>
      <div class="card-footer" style="display:flex;gap:10px;justify-content:flex-end;align-items:center;padding:14px 20px;border-top:1px solid var(--border);">
        <button type="button" class="btn-primary" id="gmAksi">${isCair ? 'Cairkan' : 'Batalkan Giro'}</button>
        <button type="button" class="btn-secondary" id="gmBatalkan">Batalkan</button>
      </div>
    </div>`;
}

/* Modal detail giro read-only utk link No. Giro. */
function tplGmDetailModal(row){
  return `
    <div class="modal-box" style="max-width:560px;">
      <div class="modal-header"><span>Giro ${row.noGiro}</span><span class="close" id="modalClose">&times;</span></div>
      <div class="modal-body">
        <table class="field-table">
          <tr><td class="flabel">No. Giro</td><td>${row.noGiro}</td><td class="flabel">Status</td><td>${row.status}</td></tr>
          <tr><td class="flabel">Bank Giro</td><td>${gmBankLabel(row.bankKode)}</td><td class="flabel">Tipe</td><td>${row.tipe}</td></tr>
          <tr><td class="flabel">No. Transaksi</td><td>${row.noTransaksi||''}</td><td class="flabel">Jumlah</td><td>${gmNum2(row.jumlah)}</td></tr>
          <tr><td class="flabel">Tgl. Trn.</td><td>${row.tgl||''}</td><td class="flabel">Tgl. Jth. Tempo</td><td>${row.tglJthTempo||''}</td></tr>
          <tr><td class="flabel">Supplier/Customer</td><td colspan="3">${(row.nama||'').toUpperCase()}</td></tr>
          <tr><td class="flabel">Keterangan</td><td colspan="3">${row.keterangan||''}</td></tr>
          ${row.tglEfektif ? `<tr><td class="flabel">Tgl. Efektif</td><td colspan="3">${row.tglEfektif}</td></tr>` : ''}
        </table>
      </div>
      <div class="modal-footer"><button class="btn-secondary" id="modalCancel">Tutup</button></div>
    </div>`;
}

function tplGmInfoModal(title,text){
  return `
    <div class="modal-box">
      <div class="modal-header"><span>${title}</span><span class="close" id="modalClose">&times;</span></div>
      <div class="modal-body"><p>${text}</p></div>
      <div class="modal-footer"><button class="btn-primary" id="modalOk">Mengerti</button></div>
    </div>`;
}
