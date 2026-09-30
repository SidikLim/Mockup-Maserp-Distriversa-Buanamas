/* =========================================================
   TEMPLATE (HTML saja) — Claim Customer (Customer & Penjualan >
   Daftar Transaksi > Claim Customer, page:'claimCustomer'). Semua
   fungsi di file ini HANYA menyusun & mengembalikan markup HTML
   (string). Logic-nya ada di file sebelah: claim-customer.js

   Dibuat 2026-09-30 dari dokumen spesifikasi Modul Claim Customer &
   Principal (BUKAN dari screenshot MASERP) — bagian "Form Claim
   Customer": header (Cabang, No. Claim otomatis 26/CLM/{cabang}/
   {bulan}/{urut}, Customer, Principal, Jenis, Cara Pemberian,
   Promotion, Periode, No/Tgl Surat, Keterangan) + 4 tab: Rincian,
   Riwayat Status, Dokumen Terkait, Rincian Jurnal (dihitung otomatis
   oleh claimJurnalLines() di core.js, tidak diketik). Form hanya bisa
   DIUBAH selama status Draft; setelah itu tampil sebagai Lihat dengan
   tombol aksi sesuai status (approval internal, Buat Nota Kredit,
   Kirim Barang Bonus, Lanjut ke Penyelesaian).
   NB: closeModal(), claimStatusPill(), claimNum2(), dst ada di core.js.

   Lampiran (2026-09-30, permintaan Sidik: "menu claim customernya juga
   perlu ada file attachment"): tab Lampiran dengan kategori Surat Claim
   Customer / Bukti Promosi / Rekap & Lainnya. Bisa ditambah/dihapus
   selama claim belum dijawab principal (Draft, Approval, Diajukan).
   Semua lampiran claim ikut terkirim sebagai lampiran email Pengajuan
   Claim Principal. Markup & upload: tplClaimLampiran()/
   bindClaimLampiran() di core.js.
========================================================= */
const CLM_LAMP_OPTS = { kategoriList:['Surat Claim Customer','Bukti Promosi','Rekap / Lainnya'],
  hint:'Lampirkan surat claim customer, foto/bukti promosi, atau rekap pendukung.' };
function clmLampiranEditable(mode, row){ return mode !== 'view' || ['Approval','Diajukan'].includes(row.status); }

function tplClmListPage(status){
  return `
    <div class="breadcrumb">Home / Customer &amp; Penjualan / <b>Claim Customer</b></div>
    <div class="card">
      <div class="card-header dark-header">
        <h3>${icon('clipboard',15)} Daftar Claim Customer</h3>
        <div class="toolbar-actions">
          <select class="chip-btn" id="clmFilterStatus">
            <option value="">Semua Status</option>
            ${CLAIM_STATUS_LIST.map(s=>`<option ${status===s?'selected':''}>${s}</option>`).join('')}
          </select>
          <button class="btn-primary" id="btnClmAdd">${icon('plus',14)} Tambah</button>
        </div>
      </div>
      <div class="table-toolbar">
        <select id="clmPageSize"><option selected>10</option><option>25</option><option>50</option></select>
        <input type="text" id="clmSearch" placeholder="Pencarian Global">
      </div>
      <div class="table-wrap"><table>
        <thead><tr>
          <th style="width:170px;">No. Claim</th>
          <th style="width:95px;">Tanggal</th>
          <th>Customer</th>
          <th>Principal</th>
          <th style="width:130px;">Jenis / Cara</th>
          <th class="text-right" style="width:125px;">Nilai Claim</th>
          <th class="text-right" style="width:125px;">Nilai ACC</th>
          <th style="width:95px;">Status</th>
          <th style="width:140px;">Status ke Customer</th>
          <th style="width:55px;">Ubah</th>
          <th style="width:55px;">Hapus</th>
        </tr></thead>
        <tbody id="clmTbody"></tbody>
      </table></div>
      <div class="table-footer"><div class="pager" id="clmPager"></div><div id="clmTotal"></div></div>
    </div>`;
}

function tplClmRows(rows, page, pageSize){
  if(!rows.length) return `<tr><td colspan="11" style="color:var(--text-light);text-align:center;font-weight:600;">Tidak Ada Data</td></tr>`;
  const start = (page-1)*pageSize;
  return rows.slice(start, start+pageSize).map(r => {
    const idx = DATA.claimCustomer.indexOf(r);
    const draft = r.status === 'Draft';
    const terlambat = claimIsTerlambat(r) ? ` <span class="status-pill status-overdue" title="Belum dijawab principal lewat batas hari respon">Terlambat</span>` : '';
    return `
    <tr>
      <td><button class="link-pick" data-open="${idx}">${r.no}</button></td>
      <td>${r.tgl}</td>
      <td>${r.customerNama}</td>
      <td>${r.principalNama}</td>
      <td>${r.jenis}<div style="font-size:11px;color:var(--text-light);">${r.cara}</div></td>
      <td class="text-right">${claimNum2(r.nilaiClaim)}</td>
      <td class="text-right">${['Disetujui','Diproses','Selesai','Ditolak'].includes(r.status) ? claimNum2(r.nilaiAcc) : '-'}</td>
      <td>${claimStatusPill(r.status)}${terlambat}</td>
      <td style="font-size:12px;">${claimStatusCustomer(r)}</td>
      <td>${draft ? `<button class="icon-btn edit" data-open="${idx}" title="Ubah">${icon('edit',15)}</button>` : ''}</td>
      <td>${draft ? `<button class="icon-btn del" data-del="${idx}" title="Hapus">${icon('trash',15)}</button>` : ''}</td>
    </tr>`;
  }).join('');
}

function tplClmPager(page, totalPages){
  if(totalPages <= 1) return '';
  let nums = '';
  for(let p = 1; p <= totalPages; p++) nums += `<button class="${p===page?'active':''}" data-clmpage="${p}">${p}</button>`;
  return `
    <button data-clmpage="1" ${page<=1?'disabled':''}>First</button>
    <button data-clmpage="${Math.max(1,page-1)}" ${page<=1?'disabled':''}>Previous</button>
    ${nums}
    <button data-clmpage="${Math.min(totalPages,page+1)}" ${page>=totalPages?'disabled':''}>Next</button>
    <button data-clmpage="${totalPages}" ${page>=totalPages?'disabled':''}>Last</button>`;
}

/* ===================== FORM (full page) ===================== */
function tplClmForm(mode, row){
  const edit = mode !== 'view';
  const dis = edit ? '' : 'disabled';
  const title = mode === 'add' ? 'Tambah Claim Customer' : (edit ? 'Ubah Claim Customer' : 'Lihat Claim Customer');
  const promos = DATA.promotion.filter(p => !row.principalKode || !p.principalKode || p.principalKode === row.principalKode);
  return `
    <div class="breadcrumb">Home / Claim Customer / <b>${mode==='add'?'Tambah':(edit?'Ubah':'Lihat')}</b></div>
    <div class="card">
      <div class="card-header dark-header">
        <h3>${icon(mode==='add'?'plus':'clipboard',15)} ${title}</h3>
        ${mode!=='add' ? `<div style="display:flex;gap:8px;align-items:center;">${claimStatusPill(row.status)}</div>` : ''}
      </div>
      <div class="card-body">
        ${mode!=='add' ? tplClmStatusBar(row) : ''}
        <div class="form-grid-3" style="grid-template-columns:repeat(3,1fr);">
          <div class="form-group">
            <label>Cabang</label>
            <select id="fClmCabang" ${mode==='add'?'':'disabled'}>${CLAIM_CABANG_LIST.map(c=>`<option ${row.cabang===c.nama?'selected':''}>${c.nama}</option>`).join('')}</select>
          </div>
          <div class="form-group">
            <label>No. Claim</label>
            <input type="text" id="fClmNo" value="${row.no||''}" placeholder="Otomatis saat disimpan" readonly>
          </div>
          <div class="form-group">
            <label>Tanggal</label>
            <div class="input-with-btn">
              <input type="text" id="fClmTgl" value="${row.tgl||''}" ${dis}>
              <span class="icon-btn edit" style="pointer-events:none;">${icon('calendar',13)}</span>
            </div>
          </div>
        </div>
        <div class="form-grid-3" style="grid-template-columns:repeat(4,1fr);">
          <div class="form-group">
            <label>Customer</label>
            <div class="input-with-btn">
              <input type="text" id="fClmCustomer" value="${row.customerNama||''}" placeholder="Pilih Customer" readonly>
              ${edit ? `<button type="button" class="icon-btn edit" id="clmCustomerSearch" title="Cari Customer">${icon('search',13)}</button>` : ''}
            </div>
            <div class="form-error" id="fClmCustomerErr">Customer wajib dipilih</div>
          </div>
          <div class="form-group">
            <label>Principal</label>
            <div class="input-with-btn">
              <input type="text" id="fClmPrincipal" value="${row.principalNama||''}" placeholder="Pilih Principal" readonly>
              ${edit ? `<button type="button" class="icon-btn edit" id="clmPrincipalSearch" title="Cari Principal">${icon('search',13)}</button>` : ''}
            </div>
            <div class="form-error" id="fClmPrincipalErr">Principal wajib dipilih</div>
          </div>
          <div class="form-group">
            <label>Jenis Claim</label>
            <select id="fClmJenis" ${dis}>${CLAIM_JENIS_LIST.map(j=>`<option ${row.jenis===j?'selected':''}>${j}</option>`).join('')}</select>
          </div>
          <div class="form-group">
            <label>Cara Pemberian ke Customer</label>
            <select id="fClmCara" ${dis}>${CLAIM_CARA_LIST.map(j=>`<option ${row.cara===j?'selected':''}>${j}</option>`).join('')}</select>
          </div>
        </div>
        <div class="form-grid-3" style="grid-template-columns:2fr 1fr 1fr;">
          <div class="form-group">
            <label>Promotion Terkait</label>
            <select id="fClmPromotion" ${dis}>
              <option value="">-- Tanpa Promotion --</option>
              ${promos.map(p=>`<option value="${p.kode}" ${row.promotionKode===p.kode?'selected':''}>${p.kode} — ${p.nama}</option>`).join('')}
            </select>
          </div>
          <div class="form-group">
            <label>Periode Awal</label>
            <input type="text" id="fClmPeriodeAwal" value="${row.periodeAwal||''}" placeholder="dd/mm/yyyy" ${dis}>
          </div>
          <div class="form-group">
            <label>Periode Akhir</label>
            <input type="text" id="fClmPeriodeAkhir" value="${row.periodeAkhir||''}" placeholder="dd/mm/yyyy" ${dis}>
          </div>
        </div>
        <div class="form-grid-3" style="grid-template-columns:1fr 1fr 2fr;">
          <div class="form-group">
            <label>No. Surat Claim Customer</label>
            <input type="text" id="fClmNoSurat" value="${row.noSurat||''}" ${dis}>
          </div>
          <div class="form-group">
            <label>Tgl. Surat</label>
            <input type="text" id="fClmTglSurat" value="${row.tglSurat||''}" placeholder="dd/mm/yyyy" ${dis}>
          </div>
          <div class="form-group">
            <label>Keterangan</label>
            <textarea id="fClmKeterangan" class="po-textarea" rows="2" ${dis}>${row.keterangan||''}</textarea>
          </div>
        </div>

        <div class="inv-tabs">
          <button type="button" class="inv-tab-btn active" data-clm-tab="rincian">Rincian</button>
          <button type="button" class="inv-tab-btn" data-clm-tab="lampiran">Lampiran${(row.lampiran||[]).length ? ` (${row.lampiran.length})` : ''}</button>
          ${mode!=='add' ? `
          <button type="button" class="inv-tab-btn" data-clm-tab="riwayat">Riwayat Status</button>
          <button type="button" class="inv-tab-btn" data-clm-tab="dokumen">Dokumen Terkait</button>
          <button type="button" class="inv-tab-btn" data-clm-tab="jurnal">Rincian Jurnal</button>` : ''}
        </div>
        <div data-clm-panel="rincian">${tplClmRincianTab(row, edit)}</div>
        <div data-clm-panel="lampiran" style="display:none;"><div id="clmLampiranWrap" style="margin-top:12px;">${tplClaimLampiran(row.lampiran, clmLampiranEditable(mode, row), CLM_LAMP_OPTS)}</div></div>
        ${mode!=='add' ? `
        <div data-clm-panel="riwayat" style="display:none;">${tplClmRiwayat(row)}</div>
        <div data-clm-panel="dokumen" style="display:none;">${tplClmDokumen(row)}</div>
        <div data-clm-panel="jurnal" style="display:none;">${tplClmJurnal(row)}</div>` : ''}
      </div>
      <div class="card-footer" style="display:flex;gap:10px;justify-content:flex-end;align-items:center;padding:14px 20px;border-top:1px solid var(--border);flex-wrap:wrap;">
        ${tplClmFooterButtons(mode, row)}
        <a href="#" id="clmTutup" class="link-add" style="margin-top:0;">${edit?'Batalkan':'Tutup'}</a>
      </div>
    </div>`;
}

/* Baris ringkas status di atas form (mode Ubah/Lihat). */
function tplClmStatusBar(row){
  const item = (label, val) => `<div><div style="font-size:11px;color:var(--text-light);">${label}</div><div style="font-weight:600;font-size:12.8px;margin-top:2px;">${val}</div></div>`;
  const ai = row.approvalInternal === 'Menunggu' ? '<span style="color:#b7791f;">Menunggu approver</span>'
    : row.approvalInternal === 'Disetujui' ? '<span style="color:#1a9c53;">Disetujui</span>' : '-';
  const terlambat = claimIsTerlambat(row) ? ' <span class="status-pill status-overdue">Terlambat</span>' : '';
  return `
    <div style="display:flex;gap:28px;flex-wrap:wrap;background:#f6f8fc;border:1px solid var(--border);border-radius:8px;padding:10px 16px;margin-bottom:16px;">
      ${item('Status ke Principal', claimStatusPill(row.status)+terlambat)}
      ${item('Approval Internal', ai)}
      ${item('No. Pengajuan', row.noPengajuan||'-')}
      ${item('Status ke Customer', claimStatusCustomer(row))}
      ${row.alasanTolak ? item('Alasan Ditolak', `<span style="color:var(--red);">${row.alasanTolak}</span>`) : ''}
    </div>`;
}

function tplClmFooterButtons(mode, row){
  if(mode !== 'view') return `
    <button type="button" class="btn-secondary" id="clmSimpan">Simpan Draft</button>
    <button type="button" class="btn-primary" id="clmSimpanKirim">${icon('check',13)} Simpan &amp; Kirim untuk Approval</button>`;
  const b = [];
  if(row.status === 'Approval' && row.approvalInternal === 'Menunggu')
    b.push(`<button type="button" class="btn-primary" id="clmApprover">${icon('shield',13)} Proses Approval (Approver)</button>`);
  if(row.status === 'Approval' && row.approvalInternal === 'Disetujui')
    b.push(`<button type="button" class="btn-primary" id="clmKePengajuan">${icon('mail',13)} Buat Pengajuan ke Principal</button>`);
  if(row.status === 'Approval')
    b.push(`<button type="button" class="btn-danger" id="clmBatal">Batalkan Claim</button>`);
  const acc = ['Disetujui','Diproses','Selesai'].includes(row.status);
  if(acc && row.cara === 'Off Faktur' && !row.notaKredit && !row.bonusDikirim){
    if(row.jenis === 'Bonus Barang') b.push(`<button type="button" class="btn-teal" id="clmKirimBonus">${icon('box',13)} Kirim Barang Bonus</button>`);
    b.push(`<button type="button" class="btn-teal" id="clmBuatNK">${icon('file',13)} Buat Nota Kredit</button>`);
  }
  if(acc && claimSisaPulih(row) > 0)
    b.push(`<button type="button" class="btn-primary" id="clmKePenyelesaian">${icon('wallet',13)} Lanjut ke Penyelesaian</button>`);
  return b.join('');
}

function tplClmRincianTab(row, edit){
  return `
    ${edit ? `<div style="display:flex;gap:8px;margin:12px 0 0;flex-wrap:wrap;">
      <button type="button" class="btn-secondary" id="clmTarikFaktur">${icon('invoice',13)} Tarik dari Faktur</button>
    </div>` : ''}
    <div class="table-wrap" style="margin:10px 0 0;">
      <table class="po-item-table">
        <thead><tr>
          <th style="width:150px;">No. Faktur</th>
          <th style="width:130px;">Kode Barang</th>
          <th>Nama Barang / Keterangan</th>
          <th class="text-right" style="width:80px;">Qty</th>
          <th style="width:80px;">Satuan</th>
          <th class="text-right" style="width:120px;">HNA / Harga</th>
          <th class="text-right" style="width:140px;">Nilai Claim</th>
          <th style="width:50px;">Hapus</th>
        </tr></thead>
        <tbody id="clmItemsBody">${tplClmItemRows(row.items, edit)}</tbody>
      </table>
    </div>
    ${edit ? `<a href="#" class="link-add" id="clmAddItem">${icon('plus',12)}Tambah Baris</a>` : ''}
    <div class="form-error" id="fClmItemsErr">Minimal 1 baris dengan Nilai Claim lebih dari 0</div>
    <div style="max-width:380px;margin:18px 0 0 auto;">
      <table class="field-table po-rincian-table">
        <tr><td class="flabel">Nilai Claim</td><td><input type="text" id="fClmNilaiClaim" value="${claimNum2(row.nilaiClaim)}" disabled style="text-align:right;font-weight:700;"></td></tr>
        <tr><td class="flabel">Nilai ACC Principal</td><td><input type="text" value="${claimNum2(row.nilaiAcc)}" disabled style="text-align:right;"></td></tr>
        <tr><td class="flabel">Nilai Dipulihkan</td><td><input type="text" value="${claimNum2(row.nilaiDipulihkan)}" disabled style="text-align:right;"></td></tr>
        <tr><td class="flabel">Sisa Dipulihkan</td><td><input type="text" value="${claimNum2(claimSisaPulih(row))}" disabled style="text-align:right;font-weight:700;"></td></tr>
      </table>
    </div>`;
}

function tplClmItemRows(items, edit){
  if(!items || !items.length) return `<tr><td colspan="8" style="color:var(--text-light);">Belum ada rincian — klik "Tambah Baris" atau "Tarik dari Faktur".</td></tr>`;
  return items.map((it, i) => {
    const dariFaktur = !!it.noFaktur;
    /* Baris Disc. Principal hasil tarik faktur terkunci; baris bonus hasil
       tarik faktur (qtyEditable) tetap boleh diisi qty bonusnya. */
    const ro = (!edit || (dariFaktur && !it.qtyEditable)) ? 'readonly' : '';
    return `
    <tr>
      <td>${it.noFaktur || '<span style="color:var(--text-light);">-</span>'}</td>
      <td>
        <div class="input-with-btn">
          <input type="text" value="${it.kode||''}" placeholder="(opsional)" readonly>
          ${edit && !dariFaktur ? `<button type="button" class="icon-btn edit" data-clm-item-barang="${i}" title="Pilih Barang">${icon('search',12)}</button>` : ''}
        </div>
      </td>
      <td><input type="text" data-clm-item-nama="${i}" value="${it.nama||''}" ${ro}></td>
      <td><input type="number" min="0" data-clm-item-qty="${i}" value="${it.qty||0}" ${ro} style="text-align:right;"></td>
      <td><input type="text" data-clm-item-satuan="${i}" value="${it.satuan||''}" ${ro}></td>
      <td><input type="number" min="0" step="0.01" data-clm-item-hna="${i}" value="${it.hna||0}" ${ro} style="text-align:right;"></td>
      <td><input type="number" min="0" step="0.01" data-clm-item-nilai="${i}" value="${it.nilai||0}" ${ro} style="text-align:right;font-weight:600;"></td>
      <td>${edit ? `<button type="button" class="icon-btn del" data-clm-item-del="${i}" title="Hapus Baris">${icon('trash',14)}</button>` : ''}</td>
    </tr>`;
  }).join('');
}

function tplClmRiwayat(row){
  const list = (row.riwayat||[]).slice().reverse();
  return `
    <div class="table-wrap" style="margin-top:12px;"><table>
      <thead><tr><th style="width:140px;">Tanggal - Jam</th><th style="width:110px;">Status</th><th style="width:190px;">User</th><th>Catatan</th></tr></thead>
      <tbody>${list.map(h=>`<tr><td>${h.waktu}</td><td>${claimStatusPill(h.status)}</td><td>${h.user}</td><td>${h.catatan||''}</td></tr>`).join('')}</tbody>
    </table></div>`;
}

function tplClmDokumen(row){
  const docs = [];
  const p = claimPengajuanOf(row);
  if(p) docs.push({jenis:'Pengajuan Claim Principal', no:p.no, tgl:p.tgl, nilai:row.nilaiClaim, ket:`${p.status} — email ke ${p.emailTo}`, page:'pengajuanClaim'});
  if(row.notaKredit) docs.push({jenis:'Transaksi A.R. — Nota Kredit terbuka', no:row.notaKredit.no, tgl:row.notaKredit.tgl, nilai:row.notaKredit.nilai, ket:`Sisa Nota Kredit ${claimNum2(row.notaKredit.sisa)}`, page:'transaksiAR'});
  if(row.bonusDikirim) docs.push({jenis:'Klaim Bonus Item', no:row.bonusDikirim.no, tgl:row.bonusDikirim.tgl, nilai:row.bonusDikirim.nilai, ket:'Barang bonus dikirim ke customer', page:''});
  (row.pemulihan||[]).forEach(x => docs.push({jenis:`Penyelesaian — ${x.jalur}`, no:x.noDok, tgl:x.tgl, nilai:x.nilai, ket:`via ${x.noPenyelesaian}`,
    page: x.jalur==='Nota Debit AP' ? 'transaksiAP' : x.jalur==='Penjualan Langsung' ? 'penjualanLangsung' : ''}));
  if(!docs.length) return `<p style="color:var(--text-light);margin-top:14px;">Belum ada dokumen yang lahir dari claim ini.</p>`;
  return `
    <div class="table-wrap" style="margin-top:12px;"><table>
      <thead><tr><th>Jenis Dokumen</th><th style="width:170px;">No. Dokumen</th><th style="width:95px;">Tanggal</th><th class="text-right" style="width:130px;">Nilai</th><th>Keterangan</th></tr></thead>
      <tbody>${docs.map(d=>`<tr>
        <td>${d.jenis}</td>
        <td>${d.page ? `<button class="link-pick" data-clm-goto="${d.page}">${d.no}</button>` : d.no}</td>
        <td>${d.tgl||''}</td><td class="text-right">${claimNum2(d.nilai)}</td><td>${d.ket}</td></tr>`).join('')}</tbody>
    </table></div>`;
}

function tplClmJurnal(row){
  const lines = claimJurnalLines(row);
  if(!lines.length) return `<p style="color:var(--text-light);margin-top:14px;">Belum ada jurnal — jurnal terbentuk otomatis setelah principal ACC.</p>`;
  const td = lines.reduce((a,l)=>a+l.debit,0), tk = lines.reduce((a,l)=>a+l.kredit,0);
  return `
    <div class="table-wrap" style="margin-top:12px;"><table>
      <thead><tr><th>Sumber</th><th style="width:100px;">Kode Akun</th><th>Nama Akun</th><th class="text-right" style="width:140px;">Debit</th><th class="text-right" style="width:140px;">Kredit</th></tr></thead>
      <tbody>${lines.map(l=>`<tr><td style="font-size:12px;color:var(--text-light);">${l.sumber}</td><td>${l.kodeAkun}</td><td>${l.namaAkun}</td>
        <td class="text-right">${l.debit?claimNum2(l.debit):''}</td><td class="text-right">${l.kredit?claimNum2(l.kredit):''}</td></tr>`).join('')}
        <tr style="font-weight:700;"><td colspan="3" class="text-right">Total</td><td class="text-right">${claimNum2(td)}</td><td class="text-right">${claimNum2(tk)}</td></tr>
      </tbody>
    </table></div>
    <div style="font-size:11.8px;color:var(--text-light);margin-top:8px;">Jurnal dihitung otomatis dari status claim, nota kredit, dan dokumen penyelesaian.</div>`;
}

/* ===================== MODAL ===================== */
function tplClmCustomerPicker(list){
  return `
    <div class="modal-box" style="max-width:640px;">
      <div class="modal-header"><span>Pilih Customer</span><span class="close" id="modalClose">&times;</span></div>
      <div class="modal-body">
        <input type="text" id="clmCustSearch" placeholder="Cari kode / nama customer..." style="width:100%;border:1px solid var(--border);border-radius:6px;padding:8px 10px;font-size:12.8px;margin-bottom:12px;">
        <div class="table-wrap" style="max-height:360px;overflow:auto;"><table>
          <thead><tr><th>Kode</th><th>Nama Customer</th><th>Kota</th><th></th></tr></thead>
          <tbody id="clmCustBody">${tplClmCustomerRows(list)}</tbody>
        </table></div>
      </div>
      <div class="modal-footer"><button class="btn-secondary" id="modalCancel">Tutup</button></div>
    </div>`;
}
function tplClmCustomerRows(list){
  if(!list.length) return `<tr><td colspan="4" style="color:var(--text-light);">Tidak ada customer ditemukan</td></tr>`;
  return list.map(c=>`<tr><td>${c.kode}</td><td>${c.nama}</td><td>${c.kota||''}</td><td><button class="btn-pick" data-clm-pick-cust="${c.kode}">Pilih</button></td></tr>`).join('');
}

/* Tarik dari Faktur: baris faktur customer (Faktur Penjualan Via S.J.).
   Biaya Promosi → hanya baris ber-Disc. Principal (nilai = qty × HNA1 ×
   Disc. Principal%); Bonus Barang → semua baris (qty bonus diisi sendiri). */
function tplClmFakturPicker(lines, jenis){
  return `
    <div class="modal-box" style="max-width:900px;width:96vw;">
      <div class="modal-header"><span>Tarik dari Faktur — ${jenis}</span><span class="close" id="modalClose">&times;</span></div>
      <div class="modal-body">
        <div style="font-size:12px;color:var(--text-light);margin-bottom:10px;">${jenis==='Biaya Promosi'
          ? 'Baris faktur yang punya Disc. Principal. Nilai claim = Qty × HNA1 × Disc. Principal %.'
          : 'Pilih baris barang yang bonusnya diklaim. Qty bonus diisi setelah baris ditambahkan.'}
          Baris yang sudah pernah diklaim tidak ditampilkan.</div>
        <div class="table-wrap" style="max-height:380px;overflow:auto;"><table>
          <thead><tr><th style="width:36px;"></th><th>No. Faktur</th><th>Tgl</th><th>Barang</th><th class="text-right">Qty</th><th class="text-right">HNA1</th><th class="text-right">Disc. P.</th><th class="text-right">Nilai Claim</th></tr></thead>
          <tbody>${lines.length ? lines.map((l,i)=>`<tr>
            <td><input type="checkbox" data-clm-fkt="${i}" style="width:auto;"></td>
            <td>${l.noFaktur}</td><td>${l.tgl}</td><td>${l.kode} — ${l.nama}</td>
            <td class="text-right">${l.qty} ${l.satuan}</td><td class="text-right">${claimNum2(l.hna)}</td>
            <td class="text-right">${l.discPrincipal}%</td><td class="text-right">${claimNum2(l.nilai)}</td></tr>`).join('')
            : `<tr><td colspan="8" style="color:var(--text-light);">Tidak ada baris faktur yang cocok untuk customer ini${jenis==='Biaya Promosi'?' (butuh Disc. Principal)':''}.</td></tr>`}</tbody>
        </table></div>
      </div>
      <div class="modal-footer">
        <button class="btn-secondary" id="modalCancel">Tutup</button>
        <button class="btn-primary" id="clmFktTambah" ${lines.length?'':'disabled'}>Tambahkan ke Rincian</button>
      </div>
    </div>`;
}

function tplClmApproverModal(row){
  return `
    <div class="modal-box" style="max-width:520px;">
      <div class="modal-header"><span>Approval Internal — ${row.no}</span><span class="close" id="modalClose">&times;</span></div>
      <div class="modal-body">
        <p style="margin-bottom:10px;">Claim <b>${row.jenis}</b> ${row.customerNama} ke <b>${row.principalNama}</b> senilai <b>${claimNum2(row.nilaiClaim)}</b>.</p>
        <div style="font-size:11.8px;color:var(--text-light);margin-bottom:12px;">Approval internal wajib untuk semua nilai claim sebelum diajukan ke principal. Di sistem sungguhan tombol ini hanya muncul untuk user approver Hak Approval tipe Claim Customer.</div>
        <div class="form-group">
          <label>Approver</label>
          <select id="fClmApprover">${DATA.users.filter(u=>u.role==='FIN').map(u=>`<option value="${u.username}">${u.username} — ${u.nama}</option>`).join('')}</select>
        </div>
        <div class="form-group">
          <label>Catatan</label>
          <textarea id="fClmApproverCatatan" class="po-textarea" rows="3" placeholder="Wajib diisi bila ditolak"></textarea>
          <div class="form-error" id="fClmApproverErr">Catatan wajib diisi bila claim ditolak</div>
        </div>
      </div>
      <div class="modal-footer">
        <button class="btn-secondary" id="modalCancel">Batal</button>
        <button class="btn-danger" id="clmApproverTolak">Tolak</button>
        <button class="btn-primary" id="clmApproverSetuju">Setujui</button>
      </div>
    </div>`;
}

/* Konfirmasi generik (Hapus / Batalkan / Buat Nota Kredit / Kirim Bonus). */
function tplClmConfirm(title, html, btnLabel, btnClass){
  return `
    <div class="modal-box" style="max-width:520px;">
      <div class="modal-header"><span>${title}</span><span class="close" id="modalClose">&times;</span></div>
      <div class="modal-body"><div style="line-height:1.55;">${html}</div></div>
      <div class="modal-footer">
        <button class="btn-secondary" id="modalCancel">Batal</button>
        <button class="${btnClass||'btn-primary'}" id="modalOk">${btnLabel}</button>
      </div>
    </div>`;
}
