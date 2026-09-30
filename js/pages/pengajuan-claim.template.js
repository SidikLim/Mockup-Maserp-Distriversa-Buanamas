/* =========================================================
   TEMPLATE (HTML saja) — Pengajuan Claim Principal (Customer &
   Penjualan > Daftar Transaksi > Pengajuan Claim Principal, page:
   'pengajuanClaim'). Semua fungsi di file ini HANYA menyusun &
   mengembalikan markup HTML (string). Logic-nya ada di file sebelah:
   pengajuan-claim.js

   Dibuat 2026-09-30 dari dokumen spesifikasi Modul Claim (bagian
   "Form Pengajuan Claim Principal" & "Email ke principal", BUKAN dari
   screenshot MASERP). Satu pengajuan = satu principal, berisi banyak
   claim yang SUDAH lolos approval internal. Status pengajuan: Draft →
   Diajukan (email terkirim) → Dijawab (principal menjawab lewat link
   Setujui/Tolak di email, ATAU admin mencatat balasan manual);
   Dibatalkan = batal sebelum dijawab (claim kembali siap diajukan).
   Karena mockup tidak bisa mengirim email sungguhan: Kirim Email =
   modal pratinjau email, dan halaman Setuju/Tolak principal
   ditampilkan sebagai modal "Simulasi Link Principal".
   NB: helper claim*() & closeModal() ada di core.js.
========================================================= */
const PCL_STATUS_LIST = ['Draft','Diajukan','Dijawab','Dibatalkan'];

/* Helper murni: claim di dalam pengajuan & status terlambat. */
function pclClaims(row){ return (row.claims||[]).map(no => claimFind(no)).filter(Boolean); }
function pclIsTerlambat(row){
  if(row.status !== 'Diajukan') return false;
  const s = claimSetting(row.principalKode);
  return claimUmurHari(row.tglKirim || row.tgl) > (s ? s.batasHariRespon : 14);
}

function pclStatusPill(status){
  const map = { 'Draft':'background:#eef1f7;color:#7b8194;', 'Diajukan':'background:#fff4dc;color:#b7791f;',
    'Dijawab':'background:#e3f8ec;color:#1a9c53;', 'Dibatalkan':'background:#fdeaec;color:#e0405b;' };
  return `<span class="status-pill" style="${map[status]||''}">${status}</span>`;
}

function tplPclListPage(status){
  return `
    <div class="breadcrumb">Home / Customer &amp; Penjualan / <b>Pengajuan Claim Principal</b></div>
    <div class="card">
      <div class="card-header dark-header">
        <h3>${icon('mail',15)} Daftar Pengajuan Claim Principal</h3>
        <div class="toolbar-actions">
          <select class="chip-btn" id="pclFilterStatus">
            <option value="">Semua Status</option>
            ${PCL_STATUS_LIST.map(s=>`<option ${status===s?'selected':''}>${s}</option>`).join('')}
          </select>
          <button class="btn-primary" id="btnPclAdd">${icon('plus',14)} Tambah</button>
        </div>
      </div>
      <div class="table-toolbar">
        <select id="pclPageSize"><option selected>10</option><option>25</option><option>50</option></select>
        <input type="text" id="pclSearch" placeholder="Pencarian Global">
      </div>
      <div class="table-wrap"><table>
        <thead><tr>
          <th style="width:150px;">No. Pengajuan</th>
          <th style="width:95px;">Tanggal</th>
          <th>Principal</th>
          <th>Email Tujuan</th>
          <th class="text-right" style="width:80px;">Jml Claim</th>
          <th class="text-right" style="width:130px;">Total Diajukan</th>
          <th class="text-right" style="width:130px;">Total ACC</th>
          <th style="width:150px;">Status</th>
          <th style="width:55px;">Lihat</th>
        </tr></thead>
        <tbody id="pclTbody"></tbody>
      </table></div>
      <div class="table-footer"><div></div><div id="pclTotal"></div></div>
    </div>`;
}

function tplPclRows(rows){
  if(!rows.length) return `<tr><td colspan="9" style="color:var(--text-light);text-align:center;font-weight:600;">Tidak Ada Data</td></tr>`;
  return rows.map(r => {
    const idx = DATA.pengajuanClaim.indexOf(r);
    const claims = pclClaims(r);
    const diajukan = claims.reduce((a,c)=>a+c.nilaiClaim,0);
    const acc = claims.reduce((a,c)=>a+(c.nilaiAcc||0),0);
    const umur = r.status === 'Diajukan' ? `<div style="font-size:11px;color:var(--text-light);margin-top:2px;">${claimUmurHari(r.tglKirim)} hari sejak dikirim</div>` : '';
    return `
    <tr>
      <td><button class="link-pick" data-open="${idx}">${r.no}</button></td>
      <td>${r.tgl}</td>
      <td>${r.principalNama}</td>
      <td style="font-size:12px;">${r.emailTo}</td>
      <td class="text-right">${claims.length}</td>
      <td class="text-right">${claimNum2(diajukan)}</td>
      <td class="text-right">${r.status==='Dijawab' ? claimNum2(acc) : '-'}</td>
      <td>${pclStatusPill(r.status)}${pclIsTerlambat(r) ? ' <span class="status-pill status-overdue">Terlambat</span>' : ''}${umur}</td>
      <td><button class="icon-btn view" data-open="${idx}" title="Lihat">${icon('eye',15)}</button></td>
    </tr>`;
  }).join('');
}

/* ===================== FORM ===================== */
function tplPclForm(mode, row, eligible){
  const isAdd = mode === 'add';
  const dis = isAdd ? '' : 'disabled';
  return `
    <div class="breadcrumb">Home / Pengajuan Claim Principal / <b>${isAdd?'Tambah':'Lihat'}</b></div>
    <div class="card">
      <div class="card-header dark-header">
        <h3>${icon(isAdd?'plus':'mail',15)} ${isAdd?'Tambah':'Lihat'} Pengajuan Claim Principal</h3>
        ${!isAdd ? pclStatusPill(row.status) : ''}
      </div>
      <div class="card-body">
        ${!isAdd ? tplPclStatusBar(row) : ''}
        <div class="form-grid-3" style="grid-template-columns:repeat(4,1fr);">
          <div class="form-group">
            <label>Cabang</label>
            <select id="fPclCabang" ${dis}>${CLAIM_CABANG_LIST.map(c=>`<option ${row.cabang===c.nama?'selected':''}>${c.nama}</option>`).join('')}</select>
          </div>
          <div class="form-group">
            <label>No. Pengajuan</label>
            <input type="text" value="${row.no||''}" placeholder="Otomatis saat disimpan" readonly>
          </div>
          <div class="form-group">
            <label>Tanggal</label>
            <input type="text" id="fPclTgl" value="${row.tgl||''}" ${dis}>
          </div>
          <div class="form-group">
            <label>Principal</label>
            <div class="input-with-btn">
              <input type="text" id="fPclPrincipal" value="${row.principalNama||''}" placeholder="Pilih Principal" readonly>
              ${isAdd ? `<button type="button" class="icon-btn edit" id="pclPrincipalSearch" title="Cari Principal">${icon('search',13)}</button>` : ''}
            </div>
            <div class="form-error" id="fPclPrincipalErr">Principal wajib dipilih</div>
          </div>
        </div>
        <div class="form-grid-3" style="grid-template-columns:1fr 1fr 2fr;">
          <div class="form-group">
            <label>Email Tujuan (To)</label>
            <input type="text" id="fPclEmailTo" value="${row.emailTo||''}" ${dis}>
            <div class="form-error" id="fPclEmailErr">Email tujuan wajib diisi</div>
          </div>
          <div class="form-group">
            <label>CC</label>
            <input type="text" id="fPclEmailCc" value="${row.emailCc||''}" ${dis}>
          </div>
          <div class="form-group">
            <label>Keterangan</label>
            <textarea id="fPclKeterangan" class="po-textarea" rows="2" ${dis}>${row.keterangan||''}</textarea>
          </div>
        </div>
        <div class="form-section">${isAdd ? 'Claim yang siap diajukan (lolos approval internal)' : 'Rincian Claim'}</div>
        ${isAdd ? tplPclEligible(row, eligible) : tplPclClaimTable(row)}
        ${!isAdd ? `<div class="form-section">Riwayat Email</div>${tplPclRiwayatEmail(row)}` : ''}
      </div>
      <div class="card-footer" style="display:flex;gap:10px;justify-content:flex-end;align-items:center;padding:14px 20px;border-top:1px solid var(--border);flex-wrap:wrap;">
        ${tplPclFooter(mode, row)}
        <a href="#" id="pclTutup" class="link-add" style="margin-top:0;">${isAdd?'Batalkan':'Tutup'}</a>
      </div>
    </div>`;
}

function tplPclStatusBar(row){
  const s = claimSetting(row.principalKode);
  const item = (label, val) => `<div><div style="font-size:11px;color:var(--text-light);">${label}</div><div style="font-weight:600;font-size:12.8px;margin-top:2px;">${val}</div></div>`;
  return `
    <div style="display:flex;gap:28px;flex-wrap:wrap;background:#f6f8fc;border:1px solid var(--border);border-radius:8px;padding:10px 16px;margin-bottom:16px;">
      ${item('Status', pclStatusPill(row.status) + (pclIsTerlambat(row) ? ' <span class="status-pill status-overdue">Terlambat</span>' : ''))}
      ${item('Tgl. Kirim Email', row.tglKirim || '-')}
      ${item('Batas Respon', s ? s.batasHariRespon+' hari' : '14 hari')}
      ${item('Tgl. Dijawab', row.tglJawab || '-')}
      ${item('Sumber Jawaban', row.sumberJawaban || '-')}
    </div>`;
}

function tplPclEligible(row, eligible){
  if(!row.principalKode) return `<p style="color:var(--text-light);">Pilih principal dulu untuk menampilkan claim yang siap diajukan.</p>`;
  if(!eligible.length) return `<p style="color:var(--text-light);">Belum ada claim ${row.principalNama} yang lolos approval internal dan belum diajukan.</p>
    <div class="form-error" id="fPclClaimErr">Minimal 1 claim harus dipilih</div>`;
  return `
    <div class="table-wrap"><table>
      <thead><tr><th style="width:36px;"><input type="checkbox" id="pclCheckAll" checked style="width:auto;"></th><th>No. Claim</th><th>Tanggal</th><th>Customer</th><th>Jenis / Cara</th><th>Keterangan</th><th class="text-right">Nilai Diajukan</th></tr></thead>
      <tbody>${eligible.map(c=>`<tr>
        <td><input type="checkbox" data-pcl-claim="${c.no}" checked style="width:auto;"></td>
        <td>${c.no}</td><td>${c.tgl}</td><td>${c.customerNama}</td><td>${c.jenis}<div style="font-size:11px;color:var(--text-light);">${c.cara}</div></td>
        <td style="font-size:12px;white-space:normal;">${c.keterangan||''}</td><td class="text-right">${claimNum2(c.nilaiClaim)}</td></tr>`).join('')}</tbody>
    </table></div>
    <div class="form-error" id="fPclClaimErr">Minimal 1 claim harus dipilih</div>`;
}

function tplPclClaimTable(row){
  const claims = pclClaims(row);
  const tot = (f) => claims.reduce((a,c)=>a+(c[f]||0),0);
  return `
    <div class="table-wrap"><table>
      <thead><tr><th>No. Claim</th><th>Customer</th><th>Jenis / Cara</th><th class="text-right">Nilai Diajukan</th><th class="text-right">Nilai ACC</th><th>Status</th><th>Alasan Ditolak / Catatan</th></tr></thead>
      <tbody>${claims.map(c=>`<tr>
        <td><button class="link-pick" data-pcl-claim-open="${c.no}">${c.no}</button></td>
        <td>${c.customerNama}</td><td>${c.jenis}<div style="font-size:11px;color:var(--text-light);">${c.cara}</div></td>
        <td class="text-right">${claimNum2(c.nilaiClaim)}</td>
        <td class="text-right">${row.status==='Dijawab' ? claimNum2(c.nilaiAcc) : '-'}</td>
        <td>${claimStatusPill(c.status)}</td><td style="font-size:12px;">${c.alasanTolak||''}</td></tr>`).join('')}
        <tr style="font-weight:700;"><td colspan="3" class="text-right">Total</td><td class="text-right">${claimNum2(tot('nilaiClaim'))}</td>
          <td class="text-right">${row.status==='Dijawab' ? claimNum2(tot('nilaiAcc')) : '-'}</td><td colspan="2"></td></tr>
      </tbody>
    </table></div>`;
}

function tplPclRiwayatEmail(row){
  const ev = [];
  if(row.tglKirim) ev.push([row.tglKirim, `Email pengajuan dikirim ke ${row.emailTo}${row.emailCc?` (CC ${row.emailCc})`:''}`]);
  (row.pengingat||[]).forEach(p => ev.push([p, 'Email pengingat dikirim (lewat batas hari respon)']));
  if(row.tglJawab) ev.push([row.tglJawab, `Dijawab principal — ${row.sumberJawaban==='Manual' ? 'dicatat manual oleh admin (Catat Balasan)' : 'lewat link Setujui/Tolak di email'}`]);
  if(!ev.length) return `<p style="color:var(--text-light);">Email belum dikirim.</p>`;
  return `<div class="table-wrap"><table><thead><tr><th style="width:120px;">Tanggal</th><th>Kejadian</th></tr></thead>
    <tbody>${ev.map(e=>`<tr><td>${e[0]}</td><td>${e[1]}</td></tr>`).join('')}</tbody></table></div>`;
}

function tplPclFooter(mode, row){
  if(mode === 'add') return `
    <button type="button" class="btn-secondary" id="pclSimpan">Simpan Draft</button>
    <button type="button" class="btn-primary" id="pclSimpanKirim">${icon('mail',13)} Simpan &amp; Kirim Email</button>`;
  if(row.status === 'Draft') return `
    <button type="button" class="btn-danger" id="pclHapus">Hapus</button>
    <button type="button" class="btn-primary" id="pclKirim">${icon('mail',13)} Kirim Email</button>`;
  if(row.status === 'Diajukan') return `
    <button type="button" class="btn-danger" id="pclBatal">Batal Pengajuan</button>
    <button type="button" class="btn-warning" id="pclPengingat">${icon('bell',13)} Kirim Pengingat</button>
    <button type="button" class="btn-secondary" id="pclManual">${icon('edit',13)} Catat Balasan Manual</button>
    <button type="button" class="btn-primary" id="pclLink">${icon('eye',13)} Simulasi Link Principal</button>`;
  return '';
}

/* ===================== EMAIL & JAWABAN ===================== */
function tplPclEmailPreview(row){
  const claims = pclClaims(row);
  const total = claims.reduce((a,c)=>a+c.nilaiClaim,0);
  const td = 'padding:5px 8px;border:1px solid #d9dde7;font-size:12px;white-space:normal;';
  const lampiran = [`Pengajuan_${row.no.replace(/\//g,'-')}.pdf`].concat(claims.filter(c=>c.noSurat).map(c=>`Surat_Claim_${c.noSurat.replace(/\//g,'-')}.pdf`));
  return `
    <div class="modal-box" style="max-width:780px;width:96vw;">
      <div class="modal-header"><span>${icon('mail',15)} Pratinjau Email Pengajuan</span><span class="close" id="modalClose">&times;</span></div>
      <div class="modal-body" style="max-height:72vh;overflow:auto;">
        <table class="field-table" style="margin-bottom:12px;">
          <tr><td class="flabel" style="width:90px;">Dari</td><td>claim@distriversabuanamas.co.id</td></tr>
          <tr><td class="flabel">Kepada</td><td>${row.emailTo}</td></tr>
          <tr><td class="flabel">CC</td><td>${row.emailCc||'-'}</td></tr>
          <tr><td class="flabel">Subjek</td><td><b>Pengajuan Claim ${row.no} — PT Distriversa Buanamas</b></td></tr>
          <tr><td class="flabel">Lampiran</td><td>${lampiran.map(l=>`<span class="tag-chip" style="margin:0 6px 4px 0;display:inline-block;">${icon('file',12)} ${l}</span>`).join('')}</td></tr>
        </table>
        <div style="border:1px solid var(--border);border-radius:8px;padding:18px 20px;background:#fff;font-size:13px;line-height:1.6;">
          <p>Yth. Tim Claim ${row.principalNama},</p>
          <p>Bersama ini PT Distriversa Buanamas mengajukan ${claims.length} claim senilai total <b>Rp ${claimNum2(total)}</b> untuk disetujui:</p>
          <table style="border-collapse:collapse;width:100%;margin:10px 0;">
            <thead><tr style="background:#f3f5fa;"><th style="${td}">No. Claim</th><th style="${td}">Customer</th><th style="${td}">Jenis</th><th style="${td}">Keterangan</th><th style="${td}text-align:right;">Nilai</th></tr></thead>
            <tbody>${claims.map(c=>`<tr><td style="${td}">${c.no}</td><td style="${td}">${c.customerNama}</td><td style="${td}">${c.jenis} (${c.cara})</td><td style="${td}">${c.keterangan||''}</td><td style="${td}text-align:right;">${claimNum2(c.nilaiClaim)}</td></tr>`).join('')}</tbody>
          </table>
          <p>Silakan berikan persetujuan melalui tombol di bawah ini:</p>
          <div style="display:flex;gap:10px;margin:12px 0;">
            <span style="background:#27ae60;color:#fff;padding:8px 16px;border-radius:6px;font-weight:600;">Setujui</span>
            <span style="background:#ef4b62;color:#fff;padding:8px 16px;border-radius:6px;font-weight:600;">Tolak / Setujui Sebagian</span>
          </div>
          <p style="font-size:11.5px;color:#8a90a3;">Link berlaku untuk pengajuan ini saja. Jika tidak dijawab dalam ${(claimSetting(row.principalKode)||{}).batasHariRespon||14} hari, sistem mengirim email pengingat.</p>
          <p>Hormat kami,<br>Tim Claim — PT Distriversa Buanamas</p>
        </div>
        <div style="font-size:11.8px;color:var(--text-light);margin-top:10px;">Mockup: email tidak benar-benar dikirim. Klik Kirim untuk menandai pengajuan sebagai Diajukan.</div>
      </div>
      <div class="modal-footer">
        <button class="btn-secondary" id="modalCancel">Batal</button>
        <button class="btn-primary" id="pclEmailKirim">${icon('mail',13)} Kirim</button>
      </div>
    </div>`;
}

/* Satu template untuk 2 jalur jawaban: `sumber` 'Link Email' =
   pratinjau halaman web principal (dibuka dari link di email), 'Manual'
   = admin mencatat balasan email/surat principal. */
function tplPclJawabModal(row, sumber){
  const claims = pclClaims(row);
  const isLink = sumber === 'Link Email';
  return `
    <div class="modal-box" style="max-width:1080px;width:96vw;">
      <div class="modal-header"><span>${isLink ? `${icon('eye',15)} Simulasi Link Principal — halaman yang dibuka principal` : `${icon('edit',15)} Catat Balasan Principal`}</span><span class="close" id="modalClose">&times;</span></div>
      <div class="modal-body" style="max-height:72vh;overflow:auto;">
        ${isLink ? `
        <div style="display:flex;align-items:center;gap:12px;background:var(--navy);color:#fff;border-radius:8px;padding:12px 16px;margin-bottom:14px;">
          <div class="logo-badge" style="width:34px;height:34px;border-radius:8px;background:var(--blue);display:flex;align-items:center;justify-content:center;font-weight:700;">DBM</div>
          <div><div style="font-weight:700;">Portal Persetujuan Claim — PT Distriversa Buanamas</div>
          <div style="font-size:11.5px;color:#b9c0d6;">${row.no} · untuk ${row.principalNama} · tanpa login (link bertoken)</div></div>
        </div>` : `
        <div class="form-grid" style="gap:12px;margin-bottom:6px;">
          <div class="form-group"><label>Tanggal Balasan</label><input type="text" id="fPclTglJawab" value="${claimToday()}"></div>
          <div class="form-group"><label>Bukti Balasan (lampiran)</label><input type="text" id="fPclBukti" placeholder="contoh: Email balasan 14-09-2026.pdf"></div>
        </div>`}
        <div style="display:flex;gap:8px;margin-bottom:8px;">
          <button type="button" class="btn-secondary" id="pclIsiSetujuSemua">${icon('check',13)} Setujui Semua</button>
          <button type="button" class="btn-secondary" id="pclIsiTolakSemua">Tolak Semua</button>
        </div>
        <div class="table-wrap"><table>
          <thead><tr><th>No. Claim</th><th>Customer</th><th>Jenis / Keterangan</th><th class="text-right" style="width:130px;">Nilai Diajukan</th><th style="width:150px;">Nilai ACC</th><th style="width:200px;">Alasan (wajib bila ditolak)</th></tr></thead>
          <tbody>${claims.map((c,i)=>`<tr>
            <td>${c.no}</td><td>${c.customerNama}</td>
            <td style="font-size:12px;white-space:normal;min-width:220px;">${c.jenis} (${c.cara})<div style="color:var(--text-light);">${c.keterangan||''}</div></td>
            <td class="text-right">${claimNum2(c.nilaiClaim)}</td>
            <td><input type="number" min="0" max="${c.nilaiClaim}" step="0.01" data-pcl-acc="${i}" value="${c.nilaiClaim}" style="text-align:right;"></td>
            <td><input type="text" data-pcl-alasan="${i}" placeholder="Alasan / catatan"></td></tr>`).join('')}</tbody>
        </table></div>
        <div class="form-error" id="fPclJawabErr"></div>
        <div style="font-size:11.8px;color:var(--text-light);margin-top:8px;line-height:1.5;">Nilai ACC 0 = Ditolak. Nilai ACC lebih kecil dari nilai diajukan = Disetujui Sebagian — claim customer ikut dikurangi. Untuk claim on faktur, selisihnya dibebankan ke Biaya Promosi DBM.</div>
      </div>
      <div class="modal-footer">
        <button class="btn-secondary" id="modalCancel">Batal</button>
        <button class="btn-primary" id="pclJawabSimpan">${isLink ? 'Kirim Jawaban' : 'Simpan Balasan'}</button>
      </div>
    </div>`;
}

function tplPclConfirm(title, html, btnLabel, btnClass){
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
