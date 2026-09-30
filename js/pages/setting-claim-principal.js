/* =========================================================
   LOGIC (JS saja) — Setting Claim Principal (page:
   'settingClaimPrincipal'). Dimuat otomatis (lazy-load) oleh core.js
   — lihat PAGE_MODULES. Markup HTML-nya ada di file sebelah:
   setting-claim-principal.template.js. Data: DATA.settingClaimPrincipal
   (js/data.js). Satu principal hanya boleh punya satu setting.
========================================================= */

let scpState = { search:'' };

function renderSettingClaimPrincipalPage(){
  content.innerHTML = tplScpListPage();
  scpState = { search:'' };
  document.getElementById('btnScpAdd').onclick = () => openScpModal('add');
  document.getElementById('scpPageSize').onchange = () => renderScpTable();
  document.getElementById('scpSearch').oninput = (e) => { scpState.search = e.target.value.trim().toLowerCase(); renderScpTable(); };
  renderScpTable();
}

function renderScpTable(){
  const q = scpState.search;
  const perPage = parseInt(document.getElementById('scpPageSize').value, 10) || 10;
  const rows = DATA.settingClaimPrincipal.filter(r => !q ||
    r.principalKode.toLowerCase().includes(q) || r.principalNama.toLowerCase().includes(q) ||
    (r.emailTo||'').toLowerCase().includes(q) || (r.jalurDefault||'').toLowerCase().includes(q));
  document.getElementById('scpTbody').innerHTML = tplScpRows(rows.slice(0, perPage));
  document.getElementById('scpTotal').textContent = `Total Record: ${rows.length}`;
  const tbody = document.getElementById('scpTbody');
  tbody.querySelectorAll('[data-edit]').forEach(b => b.onclick = (e) => { e.preventDefault(); openScpModal('edit', +b.dataset.edit); });
  tbody.querySelectorAll('[data-del]').forEach(b => b.onclick = () => openScpDeleteConfirm(+b.dataset.del));
}

/* `draft` (opsional) = isian form yg dipertahankan saat modal dibuka ulang
   setelah picker principal (picker memakai modal sendiri). */
function openScpModal(mode, idx, draft){
  closeModal();
  const row = draft ? draft : mode === 'edit' ? { ...DATA.settingClaimPrincipal[idx] }
    : { principalKode:'', principalNama:'', emailTo:'', emailCc:'', jalurDefault:CLAIM_JALUR_LIST[0], batasHariRespon:14, aktif:true };
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.innerHTML = tplScpModal(mode, row);
  document.body.appendChild(overlay);
  document.getElementById('modalClose').onclick = closeModal;
  document.getElementById('modalCancel').onclick = closeModal;
  overlay.onclick = (e) => { if(e.target === overlay) closeModal(); };

  const searchBtn = document.getElementById('scpPrincipalSearch');
  if(searchBtn) searchBtn.onclick = () => {
    const draft = scpReadForm(row);
    openClaimSupplierPicker(s => {
      if(DATA.settingClaimPrincipal.some(x => x.principalKode === s.kode)){
        openClaimInfo('Principal sudah punya setting', `<b>${s.nama}</b> sudah terdaftar di Setting Claim Principal. Ubah baris yang sudah ada.`);
        return;
      }
      Object.assign(draft, { principalKode:s.kode, principalNama:s.nama, emailTo: draft.emailTo || s.email || '' });
      openScpModal(mode, idx, draft);
    });
  };

  document.getElementById('modalSave').onclick = () => {
    const data = scpReadForm(row);
    let ok = true;
    document.getElementById('fScpPrincipalErr').style.display = data.principalKode ? 'none' : 'block';
    document.getElementById('fScpEmailErr').style.display = data.emailTo ? 'none' : 'block';
    if(!data.principalKode || !data.emailTo) ok = false;
    if(!ok) return;
    if(mode === 'add') DATA.settingClaimPrincipal.push(data);
    else DATA.settingClaimPrincipal[idx] = data;
    closeModal();
    renderScpTable();
  };
}

function scpReadForm(row){
  return {
    principalKode: row.principalKode, principalNama: row.principalNama,
    emailTo: document.getElementById('fScpEmailTo').value.trim(),
    emailCc: document.getElementById('fScpEmailCc').value.trim(),
    jalurDefault: document.getElementById('fScpJalur').value,
    batasHariRespon: Math.max(1, parseInt(document.getElementById('fScpBatas').value, 10) || 14),
    aktif: document.getElementById('fScpAktif').checked,
  };
}

function openScpDeleteConfirm(idx){
  closeModal();
  const row = DATA.settingClaimPrincipal[idx];
  const dipakai = DATA.pengajuanClaim.filter(p => p.principalKode === row.principalKode).length;
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.innerHTML = tplScpDeleteConfirm(row, dipakai);
  document.body.appendChild(overlay);
  document.getElementById('modalClose').onclick = closeModal;
  document.getElementById('modalCancel').onclick = closeModal;
  overlay.onclick = (e) => { if(e.target === overlay) closeModal(); };
  const del = document.getElementById('modalDelete');
  if(del) del.onclick = () => { DATA.settingClaimPrincipal.splice(idx, 1); closeModal(); renderScpTable(); };
}
