/* =========================================================
   LOGIC (JS saja) — Pengajuan Claim Principal (page:'pengajuanClaim').
   Dimuat otomatis (lazy-load) oleh core.js — lihat PAGE_MODULES.
   Markup HTML ada di file sebelah: pengajuan-claim.template.js.
   Data: DATA.pengajuanClaim (dokumen terbaru di depan array); claim di
   dalamnya menaut lewat `claims[]` (No. Claim) ke DATA.claimCustomer —
   nilai ACC/alasan ditolak DISIMPAN DI CLAIM, bukan di pengajuan.

   Efek ke claim:
     Kirim Email      → claim: Approval → Diajukan (+ noPengajuan)
     Jawaban principal→ claim: Diajukan → Disetujui (ACC > 0, boleh
                        sebagian) / Ditolak (ACC = 0)
     Batal Pengajuan  → claim kembali Approval (Disetujui internal),
                        noPengajuan dikosongkan, bisa diajukan ulang.
   `openPclForm(mode, idx, principalKode)` dipanggil juga dari Claim
   Customer (tombol "Buat Pengajuan ke Principal") lewat goToPage().
========================================================= */

let pclState = { search:'', status:'' };
let pclDraft = null;   // isian form Tambah

function renderPengajuanClaimPage(){
  content.innerHTML = tplPclListPage(pclState.status);
  pclState.search = '';
  document.getElementById('btnPclAdd').onclick = () => openPclForm('add', -1);
  document.getElementById('pclFilterStatus').onchange = (e) => { pclState.status = e.target.value; renderPclTable(); };
  document.getElementById('pclPageSize').onchange = () => renderPclTable();
  document.getElementById('pclSearch').oninput = (e) => { pclState.search = e.target.value.trim().toLowerCase(); renderPclTable(); };
  renderPclTable();
}

function renderPclTable(){
  const q = pclState.search;
  const perPage = parseInt(document.getElementById('pclPageSize').value, 10) || 10;
  const rows = DATA.pengajuanClaim.filter(r => (!pclState.status || r.status === pclState.status) && (!q ||
    r.no.toLowerCase().includes(q) || r.principalNama.toLowerCase().includes(q) || (r.emailTo||'').toLowerCase().includes(q) ||
    r.claims.some(n => n.toLowerCase().includes(q))));
  document.getElementById('pclTbody').innerHTML = tplPclRows(rows.slice(0, perPage));
  document.getElementById('pclTotal').textContent = `Total Record: ${rows.length}`;
  document.querySelectorAll('#pclTbody [data-open]').forEach(b => b.onclick = () => openPclForm('view', +b.dataset.open));
}

/* Claim yang boleh masuk pengajuan baru: principal sama, status Approval
   dengan approval internal Disetujui, belum ada di pengajuan lain. */
function pclEligibleClaims(principalKode){
  return DATA.claimCustomer.filter(c => c.principalKode === principalKode && c.status === 'Approval' && c.approvalInternal === 'Disetujui' && !c.noPengajuan);
}

function openPclForm(mode, idx, principalKode){
  closeModal();
  if(mode === 'add'){
    pclDraft = { no:'', tgl:claimToday(), cabang:'Head Office', principalKode:'', principalNama:'', emailTo:'', emailCc:'', keterangan:'',
      claims:[], status:'Draft', tglKirim:'', tglJawab:'', sumberJawaban:'', pengingat:[], lampiran:[] };
    if(principalKode) pclApplyPrincipal(principalKode);
    return pclRenderAdd();
  }
  const row = DATA.pengajuanClaim[idx];
  content.innerHTML = tplPclForm('view', row, []);
  window.scrollTo(0, 0);
  bindPclView(row, idx);
}

function pclApplyPrincipal(kode){
  const s = claimSetting(kode);
  const sup = DATA.suppliers.find(x => x.kode === kode) || {};
  Object.assign(pclDraft, { principalKode:kode, principalNama:sup.nama || (s && s.principalNama) || '',
    emailTo: (s && s.emailTo) || sup.email || '', emailCc: (s && s.emailCc) || '' });
}

function pclRenderAdd(){
  content.innerHTML = tplPclForm('add', pclDraft, pclDraft.principalKode ? pclEligibleClaims(pclDraft.principalKode) : []);
  window.scrollTo(0, 0);
  document.getElementById('pclTutup').onclick = (e) => { e.preventDefault(); renderPengajuanClaimPage(); };
  document.getElementById('pclPrincipalSearch').onclick = () => {
    pclReadHeader();
    openClaimSupplierPicker(s => { pclApplyPrincipal(s.kode); pclRenderAdd(); }, true);
  };
  const all = document.getElementById('pclCheckAll');
  if(all) all.onchange = () => document.querySelectorAll('[data-pcl-claim]').forEach(cb => cb.checked = all.checked);
  document.getElementById('pclSimpan').onclick = () => pclSaveAdd(false);
  document.getElementById('pclSimpanKirim').onclick = () => pclSaveAdd(true);
  bindClaimLampiran(document.getElementById('pclLampiranWrap'), pclDraft, true, PCL_LAMP_OPTS);
}

function pclReadHeader(){
  Object.assign(pclDraft, {
    cabang: document.getElementById('fPclCabang').value,
    tgl: document.getElementById('fPclTgl').value.trim(),
    emailTo: document.getElementById('fPclEmailTo').value.trim(),
    emailCc: document.getElementById('fPclEmailCc').value.trim(),
    keterangan: document.getElementById('fPclKeterangan').value.trim(),
  });
}

function pclSaveAdd(kirim){
  pclReadHeader();
  const picked = [...document.querySelectorAll('[data-pcl-claim]:checked')].map(cb => cb.dataset.pclClaim);
  let ok = true;
  const show = (id, cond) => { const el = document.getElementById(id); if(el) el.style.display = cond ? 'block' : 'none'; if(cond) ok = false; };
  show('fPclPrincipalErr', !pclDraft.principalKode);
  show('fPclEmailErr', !pclDraft.emailTo);
  show('fPclClaimErr', !!pclDraft.principalKode && !picked.length);
  if(!ok) return;
  const t = pclDraft.tgl || claimToday();
  pclDraft.no = claimNextNo(DATA.pengajuanClaim, `PCL/${claimCabangKode(pclDraft.cabang)}/${t.slice(8,10)}${t.slice(3,5)}/`, 4);
  pclDraft.claims = picked;
  /* Claim langsung "dipesan" oleh pengajuan Draft ini supaya tidak ikut
     pengajuan lain; status claim baru berubah saat email dikirim. */
  picked.forEach(no => { claimFind(no).noPengajuan = pclDraft.no; });
  DATA.pengajuanClaim.unshift(pclDraft);
  pclDraft = null;
  if(kirim) openPclEmail(DATA.pengajuanClaim[0], 0);
  else openPclForm('view', 0);
}

function pclConfirm(title, html, btnLabel, btnClass, onOk){
  closeModal();
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.innerHTML = tplPclConfirm(title, html, btnLabel, btnClass);
  document.body.appendChild(overlay);
  document.getElementById('modalClose').onclick = closeModal;
  document.getElementById('modalCancel').onclick = closeModal;
  overlay.onclick = (e) => { if(e.target === overlay) closeModal(); };
  document.getElementById('modalOk').onclick = () => { closeModal(); onOk(); };
}

function bindPclView(row, idx){
  const reopen = () => openPclForm('view', DATA.pengajuanClaim.indexOf(row));
  const on = (id, fn) => { const el = document.getElementById(id); if(el) el.onclick = fn; };
  document.getElementById('pclTutup').onclick = (e) => { e.preventDefault(); renderPengajuanClaimPage(); };
  document.querySelectorAll('[data-pcl-claim-open]').forEach(b => b.onclick = () => {
    const no = b.dataset.pclClaimOpen;
    goToPage('claimCustomer', 'Claim Customer', () => { if(typeof openClmFormByNo === 'function') openClmFormByNo(no); });
  });
  on('pclKirim', () => openPclEmail(row, idx));
  on('pclHapus', () => pclConfirm('Hapus Pengajuan', `Pengajuan <b>${row.no}</b> (Draft) akan dihapus. Claim di dalamnya kembali siap diajukan.`, 'Hapus', 'btn-danger', () => {
    pclClaims(row).forEach(c => { c.noPengajuan = ''; });
    DATA.pengajuanClaim.splice(DATA.pengajuanClaim.indexOf(row), 1);
    renderPengajuanClaimPage();
  }));
  on('pclBatal', () => pclConfirm('Batal Pengajuan', `Pengajuan <b>${row.no}</b> dibatalkan. Claim di dalamnya kembali ke status Approval (sudah disetujui internal) dan bisa diajukan ulang.`, 'Batal Pengajuan', 'btn-danger', () => {
    pclClaims(row).forEach(c => { c.status = 'Approval'; c.noPengajuan = ''; claimLog(c, 'Approval', `Pengajuan ${row.no} dibatalkan — claim bisa diajukan ulang`); });
    row.status = 'Dibatalkan';
    reopen();
  }));
  on('pclPengingat', () => pclConfirm('Kirim Email Pengingat', `Email pengingat untuk <b>${row.no}</b> dikirim ulang ke ${row.emailTo}${row.emailCc?` (CC ${row.emailCc})`:''} dengan link Setujui/Tolak yang sama.`, 'Kirim Pengingat', 'btn-primary', () => {
    row.pengingat = row.pengingat || [];
    row.pengingat.push(claimToday());
    pclClaims(row).forEach(c => claimLog(c, 'Diajukan', `Email pengingat ${row.no} dikirim ke ${row.emailTo}`));
    reopen();
  }));
  on('pclLink', () => openPclJawab(row, 'Link Email', reopen));
  on('pclManual', () => openPclJawab(row, 'Manual', reopen));
  bindClaimLampiran(document.getElementById('pclLampiranWrap'), row, pclLampiranEditable('view', row), PCL_LAMP_OPTS);
}

function openPclEmail(row, idx){
  closeModal();
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.innerHTML = tplPclEmailPreview(row);
  document.body.appendChild(overlay);
  const back = () => { closeModal(); openPclForm('view', DATA.pengajuanClaim.indexOf(row)); };
  document.getElementById('modalClose').onclick = back;
  document.getElementById('modalCancel').onclick = back;
  document.getElementById('pclEmailKirim').onclick = () => {
    row.status = 'Diajukan'; row.tglKirim = claimToday();
    pclClaims(row).forEach(c => {
      c.status = 'Diajukan'; c.noPengajuan = row.no;
      claimLog(c, 'Diajukan', `Diajukan lewat ${row.no} (email ke ${row.emailTo})`);
    });
    back();
  };
}

function openPclJawab(row, sumber, done){
  closeModal();
  const claims = pclClaims(row);
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.innerHTML = tplPclJawabModal(row, sumber);
  document.body.appendChild(overlay);
  document.getElementById('modalClose').onclick = closeModal;
  document.getElementById('modalCancel').onclick = closeModal;
  document.getElementById('pclIsiSetujuSemua').onclick = () => claims.forEach((c, i) => { document.querySelector(`[data-pcl-acc="${i}"]`).value = c.nilaiClaim; });
  document.getElementById('pclIsiTolakSemua').onclick = () => claims.forEach((c, i) => { document.querySelector(`[data-pcl-acc="${i}"]`).value = 0; });
  document.getElementById('pclJawabSimpan').onclick = () => {
    const err = document.getElementById('fPclJawabErr');
    const jawab = claims.map((c, i) => ({ c,
      acc: parseFloat(document.querySelector(`[data-pcl-acc="${i}"]`).value) || 0,
      alasan: document.querySelector(`[data-pcl-alasan="${i}"]`).value.trim() }));
    const salah = jawab.find(j => j.acc < 0 || j.acc > j.c.nilaiClaim + 0.004);
    if(salah){ err.textContent = `Nilai ACC ${salah.c.no} harus antara 0 dan ${claimNum2(salah.c.nilaiClaim)}`; err.style.display = 'block'; return; }
    const tanpaAlasan = jawab.find(j => j.acc === 0 && !j.alasan);
    if(tanpaAlasan){ err.textContent = `Alasan wajib diisi untuk claim yang ditolak (${tanpaAlasan.c.no})`; err.style.display = 'block'; return; }
    const bukti = sumber === 'Manual' ? document.getElementById('fPclBukti').files[0] : null;
    const buktiErr = bukti ? claimCekFile(bukti) : '';
    if(buktiErr){ err.textContent = buktiErr; err.style.display = 'block'; return; }
    const user = sumber === 'Link Email' ? 'Principal via email' : 'sidik (Catat Balasan manual)';
    jawab.forEach(({ c, acc, alasan }) => {
      c.nilaiAcc = Math.round(acc * 100) / 100;
      if(c.nilaiAcc <= 0){
        c.status = 'Ditolak'; c.alasanTolak = alasan;
        claimLog(c, 'Ditolak', `Ditolak: ${alasan}` + (c.cara === 'On Faktur' ? ` — ${claimNum2(c.nilaiClaim)} claim on faktur dibebankan ke Biaya Promosi DBM` : ''), user);
      } else {
        c.status = 'Disetujui'; c.alasanTolak = '';
        const selisih = c.nilaiClaim - c.nilaiAcc;
        let cat = selisih > 0.004
          ? `ACC sebagian ${claimNum2(c.nilaiAcc)} dari ${claimNum2(c.nilaiClaim)}` + (c.cara === 'On Faktur'
              ? ` — selisih ${claimNum2(selisih)} claim on faktur dibebankan ke Biaya Promosi DBM`
              : ' — claim customer ikut dikurangi')
          : `ACC penuh ${claimNum2(c.nilaiAcc)}`;
        if(alasan) cat += ` (${alasan})`;
        claimLog(c, 'Disetujui', cat, user);
      }
    });
    row.status = 'Dijawab';
    row.tglJawab = sumber === 'Manual' ? (document.getElementById('fPclTglJawab').value.trim() || claimToday()) : claimToday();
    row.sumberJawaban = sumber;
    if(bukti){
      row.lampiran = row.lampiran || [];
      row.lampiran.push(claimFileToLampiran(bukti, 'Bukti Balasan'));
    }
    closeModal();
    done();
  };
}
