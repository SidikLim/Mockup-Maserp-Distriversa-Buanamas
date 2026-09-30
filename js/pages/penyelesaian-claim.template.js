/* =========================================================
   TEMPLATE (HTML saja) — Penyelesaian Claim (Customer & Penjualan >
   Daftar Transaksi > Penyelesaian Claim, page:'penyelesaianClaim').
   Semua fungsi di file ini HANYA menyusun & mengembalikan markup HTML
   (string). Logic-nya ada di file sebelah: penyelesaian-claim.js

   Dibuat 2026-09-30 dari dokumen spesifikasi Modul Claim (bagian
   "Form Penyelesaian Claim" & "Penyelesaian & jurnal", BUKAN dari
   screenshot MASERP). Satu dokumen penyelesaian = memulihkan sebagian/
   seluruh Nilai ACC SATU claim dari principal lewat SATU jalur:
     - Nota Debit AP (default)  → Transaksi A.P. bernilai minus
     - Penjualan Langsung       → tagihan baru ke customer principal
                                  terhubung (P-kode supplier), PPN 04 +
                                  PPh 23 2%
     - Penerimaan Barang        → claim diganti barang (Terima Klaim
                                  Bonus Item, menu masih placeholder)
   Jalur boleh dicampur & bertahap (beberapa dokumen per claim).
   NB: helper claim*() & closeModal() ada di core.js.
========================================================= */

function tplPnyListPage(){
  return `
    <div class="breadcrumb">Home / Customer &amp; Penjualan / <b>Penyelesaian Claim</b></div>
    <div class="card">
      <div class="card-header dark-header">
        <h3>${icon('wallet',15)} Daftar Penyelesaian Claim</h3>
        <button class="btn-primary" id="btnPnyAdd">${icon('plus',14)} Tambah</button>
      </div>
      <div class="table-toolbar">
        <select id="pnyPageSize"><option selected>10</option><option>25</option><option>50</option></select>
        <input type="text" id="pnySearch" placeholder="Pencarian Global">
      </div>
      <div class="table-wrap"><table>
        <thead><tr>
          <th style="width:150px;">No. Penyelesaian</th>
          <th style="width:95px;">Tanggal</th>
          <th style="width:170px;">No. Claim</th>
          <th>Customer</th>
          <th>Principal</th>
          <th style="width:140px;">Jalur Pemulihan</th>
          <th class="text-right" style="width:130px;">Nilai</th>
          <th style="width:160px;">No. Dokumen</th>
          <th style="width:55px;">Lihat</th>
        </tr></thead>
        <tbody id="pnyTbody"></tbody>
      </table></div>
      <div class="table-footer"><div></div><div id="pnyTotal"></div></div>
    </div>`;
}

function tplPnyRows(rows){
  if(!rows.length) return `<tr><td colspan="9" style="color:var(--text-light);text-align:center;font-weight:600;">Tidak Ada Data</td></tr>`;
  return rows.map(r => {
    const idx = DATA.penyelesaianClaim.indexOf(r);
    const c = claimFind(r.noClaim) || {};
    return `
    <tr>
      <td><button class="link-pick" data-open="${idx}">${r.no}</button></td>
      <td>${r.tgl}</td>
      <td><button class="link-pick" data-pny-claim="${r.noClaim}">${r.noClaim}</button></td>
      <td>${c.customerNama||''}</td>
      <td>${r.principalNama}</td>
      <td>${r.jalur}</td>
      <td class="text-right">${claimNum2(r.nilai)}</td>
      <td>${tplPnyDokLink(r)}</td>
      <td><button class="icon-btn view" data-open="${idx}" title="Lihat">${icon('eye',15)}</button></td>
    </tr>`;
  }).join('');
}

/* No. dokumen hasil penyelesaian — link ke modulnya bila modul ada. */
function tplPnyDokLink(r){
  const page = r.jalur === 'Nota Debit AP' ? 'transaksiAP' : r.jalur === 'Penjualan Langsung' ? 'penjualanLangsung' : '';
  return page ? `<button class="link-pick" data-pny-goto="${page}">${r.noDok}</button>` : `${r.noDok} <div style="font-size:11px;color:var(--text-light);">Terima Klaim Bonus Item</div>`;
}

/* ===================== FORM ===================== */
function tplPnyForm(mode, row, claim){
  const isAdd = mode === 'add';
  const dis = isAdd ? '' : 'disabled';
  return `
    <div class="breadcrumb">Home / Penyelesaian Claim / <b>${isAdd?'Tambah':'Lihat'}</b></div>
    <div class="card">
      <div class="card-header dark-header">
        <h3>${icon(isAdd?'plus':'wallet',15)} ${isAdd?'Tambah':'Lihat'} Penyelesaian Claim</h3>
      </div>
      <div class="card-body">
        <div class="form-grid-3" style="grid-template-columns:repeat(4,1fr);">
          <div class="form-group">
            <label>No. Penyelesaian</label>
            <input type="text" value="${row.no||''}" placeholder="Otomatis saat disimpan" readonly>
          </div>
          <div class="form-group">
            <label>Tanggal</label>
            <input type="text" id="fPnyTgl" value="${row.tgl||''}" ${dis}>
          </div>
          <div class="form-group" style="grid-column:span 2;">
            <label>Claim</label>
            <div class="input-with-btn">
              <input type="text" id="fPnyClaim" value="${claim ? `${claim.no} — ${claim.customerNama} / ${claim.principalNama}` : ''}" placeholder="Pilih claim yang sudah di-ACC principal" readonly>
              ${isAdd ? `<button type="button" class="icon-btn edit" id="pnyClaimSearch" title="Cari Claim">${icon('search',13)}</button>` : ''}
            </div>
            <div class="form-error" id="fPnyClaimErr">Claim wajib dipilih</div>
          </div>
        </div>
        ${claim ? tplPnyClaimInfo(claim, isAdd) : '<p style="color:var(--text-light);">Pilih claim dulu untuk menampilkan nilai ACC dan jalur pemulihan.</p>'}
        ${claim ? tplPnyJalurSection(mode, row, claim) : ''}
      </div>
      <div class="card-footer" style="display:flex;gap:10px;justify-content:flex-end;align-items:center;padding:14px 20px;border-top:1px solid var(--border);">
        ${isAdd ? `<button type="button" class="btn-primary" id="pnySimpan" ${claim?'':'disabled'}>${icon('save',13)} Simpan &amp; Buat Dokumen</button>` : ''}
        <a href="#" id="pnyTutup" class="link-add" style="margin-top:0;">${isAdd?'Batalkan':'Tutup'}</a>
      </div>
    </div>`;
}

function tplPnyClaimInfo(c, isAdd){
  const item = (label, val) => `<div><div style="font-size:11px;color:var(--text-light);">${label}</div><div style="font-weight:600;font-size:12.8px;margin-top:2px;">${val}</div></div>`;
  const perluNK = isAdd && c.cara === 'Off Faktur' && !c.notaKredit && !c.bonusDikirim;
  return `
    <div style="display:flex;gap:26px;flex-wrap:wrap;background:#f6f8fc;border:1px solid var(--border);border-radius:8px;padding:10px 16px;margin-bottom:14px;">
      ${item('Jenis / Cara', `${c.jenis} · ${c.cara}`)}
      ${item('Status Claim', claimStatusPill(c.status))}
      ${item('Nilai Claim', claimNum2(c.nilaiClaim))}
      ${item('Nilai ACC', claimNum2(c.nilaiAcc))}
      ${item('Sudah Dipulihkan', claimNum2(c.nilaiDipulihkan))}
      ${item('Sisa Dipulihkan', `<span style="color:var(--blue);">${claimNum2(claimSisaPulih(c))}</span>`)}
      ${item('Status ke Customer', claimStatusCustomer(c))}
    </div>
    ${perluNK ? `<div class="alert-warning" style="display:flex;justify-content:space-between;align-items:center;gap:12px;flex-wrap:wrap;">
      <span>Claim off faktur ini sudah di-ACC, tetapi ${c.customerNama} belum menerima ${c.jenis==='Bonus Barang'?'barang bonus / ':''}Nota Kredit terbuka.</span>
      <button type="button" class="btn-teal" id="pnyBuatNK">${icon('file',13)} Buat Nota Kredit sekarang</button>
    </div>` : ''}`;
}

function tplPnyJalurSection(mode, row, c){
  const isAdd = mode === 'add';
  const dis = isAdd ? '' : 'disabled';
  const jalur = row.jalur;
  return `
    <div class="form-section">Jalur Pemulihan dari Principal</div>
    <div class="form-grid-3" style="grid-template-columns:1fr 1fr 2fr;">
      <div class="form-group">
        <label>Jalur</label>
        <select id="fPnyJalur" ${dis}>${CLAIM_JALUR_LIST.map(j=>`<option value="${j}" ${jalur===j?'selected':''}>${j}${(claimSetting(c.principalKode)||{}).jalurDefault===j?' (default)':''}</option>`).join('')}</select>
      </div>
      <div class="form-group">
        <label>Nilai Dipulihkan</label>
        <input type="number" min="0" step="0.01" id="fPnyNilai" value="${row.nilai||0}" ${dis} style="text-align:right;">
        <div class="form-error" id="fPnyNilaiErr">Nilai harus lebih dari 0 dan maksimal ${claimNum2(claimSisaPulih(c))}</div>
      </div>
      <div class="form-group">
        <label>Keterangan</label>
        <input type="text" id="fPnyKeterangan" value="${row.keterangan||''}" ${dis}>
      </div>
    </div>
    <div id="pnyJalurDetail">${tplPnyJalurDetail(mode, row, c)}</div>
    <div class="form-section">Jurnal yang akan terbentuk</div>
    <div id="pnyJurnalPreview">${tplPnyJurnalPreview(row, c)}</div>`;
}

function tplPnyJalurDetail(mode, row, c){
  const isAdd = mode === 'add';
  const dis = isAdd ? '' : 'disabled';
  if(row.jalur === 'Nota Debit AP'){
    const fakturs = DATA.transaksiAP.filter(t => t.supplierKode === c.principalKode && t.jumlah > 0 && t.noFakturSupplier).map(t => t.noFakturSupplier);
    return `
      <div class="form-grid-3" style="grid-template-columns:1fr 2fr;">
        <div class="form-group">
          <label>No. Faktur Supplier yang Dipotong</label>
          <input type="text" id="fPnyFakturSupplier" list="pnyFakturList" value="${row.noFakturSupplier||''}" placeholder="Pilih / ketik no. faktur supplier" ${dis}>
          <datalist id="pnyFakturList">${fakturs.map(f=>`<option value="${f}">`).join('')}</datalist>
        </div>
        <div class="form-group" style="font-size:12px;color:var(--text-light);align-self:end;line-height:1.5;">
          Membuat <b>Transaksi A.P.</b> tipe Nota Debet bernilai minus ke ${c.principalNama}. Sisa hutang dilunasi seperti biasa di Pelunasan Utang.
        </div>
      </div>`;
  }
  if(row.jalur === 'Penjualan Langsung'){
    const cust = claimCustomerPrincipalOf(c.principalKode);
    const pj = claimPajakTagihan(Number(row.nilai)||0);
    return `
      <div class="form-grid-3" style="grid-template-columns:1fr 1fr;">
        <div class="form-group">
          <label>Customer Penagihan (terhubung ke supplier)</label>
          <input type="text" value="${cust ? `${cust.kode} — ${cust.nama}` : `Belum ada — dibuat otomatis P-${c.principalKode} saat disimpan`}" disabled>
        </div>
        <div class="form-group">
          <label>Pajak</label>
          <input type="text" value="PPN 11% kode 04 - DPP Nilai Lain · PPh 23 2%" disabled>
        </div>
      </div>
      <div style="max-width:380px;margin-left:auto;">
        <table class="field-table po-rincian-table">
          <tr><td class="flabel">DPP</td><td><input type="text" value="${claimNum2(pj.dpp)}" disabled style="text-align:right;"></td></tr>
          <tr><td class="flabel">PPN 11%</td><td><input type="text" value="${claimNum2(pj.ppn)}" disabled style="text-align:right;"></td></tr>
          <tr><td class="flabel">PPh 23 2% (dipotong principal)</td><td><input type="text" value="-${claimNum2(pj.pph)}" disabled style="text-align:right;"></td></tr>
          <tr><td class="flabel">Jumlah Tagihan</td><td><input type="text" value="${claimNum2(pj.jumlahAkhir)}" disabled style="text-align:right;font-weight:700;"></td></tr>
        </table>
      </div>`;
  }
  const gudangs = DATA.gudang.filter(g => g.cabang === c.cabang);
  const barang = c.items.map(it => it.kode ? `${it.kode} ${it.nama} ${it.qty} ${it.satuan}` : '').filter(Boolean).join(', ');
  return `
    <div class="form-grid-3" style="grid-template-columns:1fr 2fr;">
      <div class="form-group">
        <label>Gudang Penerimaan</label>
        <select id="fPnyGudang" ${dis}>${(gudangs.length?gudangs:DATA.gudang).map(g=>`<option ${row.gudang===g.nama?'selected':''}>${g.nama}</option>`).join('')}</select>
      </div>
      <div class="form-group">
        <label>Barang Pengganti dari Principal</label>
        <input type="text" id="fPnyBarang" value="${row.barang||barang}" placeholder="Kode, nama, qty barang yang diterima" ${dis}>
      </div>
    </div>
    <div style="font-size:12px;color:var(--text-light);">Dicatat sebagai dokumen <b>Terima Klaim Bonus Item</b> (menu masih placeholder). Nilai = qty × HNA pada tanggal claim.</div>`;
}

function tplPnyJurnalPreview(row, c){
  const n = Number(row.nilai) || 0;
  const L = [];
  if(row.jalur === 'Nota Debit AP'){ L.push(['2110001', n, 0], ['1120006', 0, n]); }
  else if(row.jalur === 'Penjualan Langsung'){ const pj = claimPajakTagihan(n); L.push(['1120001', pj.jumlahAkhir, 0], ['1140004', pj.pph, 0], ['1120006', 0, pj.dpp], ['2120002', 0, pj.ppn]); }
  else { L.push(['1130001', n, 0], ['1120006', 0, n]); }
  return `
    <div class="table-wrap"><table>
      <thead><tr><th style="width:110px;">Kode Akun</th><th>Nama Akun</th><th class="text-right" style="width:150px;">Debit</th><th class="text-right" style="width:150px;">Kredit</th></tr></thead>
      <tbody>${L.map(l=>`<tr><td>${l[0]}</td><td>${claimAkunNama(l[0])}${l[0]==='1120001'?' (customer principal)':''}${l[0]==='2110001'?' (principal)':''}</td>
        <td class="text-right">${l[1]?claimNum2(l[1]):''}</td><td class="text-right">${l[2]?claimNum2(l[2]):''}</td></tr>`).join('')}</tbody>
    </table></div>`;
}

/* Picker claim yang siap dipulihkan: Disetujui / Diproses, sisa > 0. */
function tplPnyClaimPicker(list){
  return `
    <div class="modal-box" style="max-width:860px;width:96vw;">
      <div class="modal-header"><span>Pilih Claim</span><span class="close" id="modalClose">&times;</span></div>
      <div class="modal-body">
        <div style="font-size:12px;color:var(--text-light);margin-bottom:10px;">Claim berstatus Disetujui / Diproses yang Nilai ACC-nya belum dipulihkan penuh.</div>
        <div class="table-wrap" style="max-height:380px;overflow:auto;"><table>
          <thead><tr><th>No. Claim</th><th>Customer</th><th>Principal</th><th>Jenis / Cara</th><th class="text-right">Nilai ACC</th><th class="text-right">Sisa</th><th></th></tr></thead>
          <tbody>${list.length ? list.map(c=>`<tr><td>${c.no}</td><td>${c.customerNama}</td><td>${c.principalNama}</td>
            <td>${c.jenis}<div style="font-size:11px;color:var(--text-light);">${c.cara}</div></td>
            <td class="text-right">${claimNum2(c.nilaiAcc)}</td><td class="text-right">${claimNum2(claimSisaPulih(c))}</td>
            <td><button class="btn-pick" data-pny-pick="${c.no}">Pilih</button></td></tr>`).join('')
            : `<tr><td colspan="7" style="color:var(--text-light);">Tidak ada claim yang menunggu pemulihan.</td></tr>`}</tbody>
        </table></div>
      </div>
      <div class="modal-footer"><button class="btn-secondary" id="modalCancel">Tutup</button></div>
    </div>`;
}
