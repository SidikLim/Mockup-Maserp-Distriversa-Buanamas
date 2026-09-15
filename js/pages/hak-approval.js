/* =========================================================
   LOGIC (JS saja) — Hak Approval (User Security > Hak Approval,
   page:'hakApproval'). Dimuat otomatis (lazy-load) oleh core.js
   saat menu ini pertama kali diklik — lihat PAGE_MODULES di
   js/core.js. Markup HTML-nya ada di file sebelah:
   hak-approval.template.js (HAP_DOC_TYPES/HAP_JABATAN_LIST/
   tplHapListPage/tplHapRows/tplHapPager/tplHapDeleteConfirm/
   tplHapInfoModal/tplHapForm/tplHapLevelRows/tplHapTagChips/
   tplHapTagPickerModal/tplHapTagPickerRows/hapDocType/
   hapOptionsSummary/hapTagPickerSource). NB: closeModal() dipakai
   bersama, didefinisikan di core.js.

   Pola: list (page-size 20 default + Pencarian Global SUNGGUHAN,
   filter label Tipe Dokumen & isi Document Type Options) + pager
   STANDAR fungsional (sama pola tplUsrPager/wireUsrPagerEvents di
   master-user.js) + form FULL PAGE dengan:
   - Tipe Dokumen: <select> HANYA bisa diganti saat mode 'add'
     (readonly/disabled saat 'edit', sama pola Kode Satuan/Kode
     User Role readonly saat Ubah) — ganti Tipe Dokumen saat 'add'
     me-reset seluruh form ke hapEmptyRow() milik tipe baru (re-
     render penuh, field checkbox/kolom level yang beda tipe tidak
     ada gunanya dipertahankan parsial).
   - Checkbox kondisi tambahan (data-hap-opt) & Aktifkan Approval:
     dibaca langsung dari DOM saat Simpan (TIDAK live-bind), sama
     pola guSave()/rySave() di modul lain.
   - Tabel Level Approval: kolom numerik tambahan live-bind
     (oninput langsung tulis ke row.levels[i][key]), "+Tambah Level
     Baru" push baris kosong baru (nomor level = max+1), Delete per
     baris langsung splice tanpa konfirmasi (pola sama sub-grid
     Perusahaan/Bank di Master User — bukan modal konfirmasi
     terpisah, krn ini sub-baris di dalam 1 form, bukan record
     independen).
   - Tag "User Roles"/"User Names": klik box (bukan klik chip "x")
     membuka modal picker (openHapTagPicker) — pola sama field
     "Picker" Picking List, direct-add-on-click lalu closeModal().
     Klik "x" pada 1 chip (stopPropagation supaya tidak ikut
     membuka modal box-nya) langsung splice dari array.
   - Simpan mode 'add' MEMVALIDASI Tipe Dokumen belum pernah
     dikonfigurasi (1 baris per Tipe Dokumen, sama semangat
     validasi kode unik di modul lain seperti Satuan/Group Produk)
     — kalau sudah ada, tampilkan modal info & BATALKAN simpan
     (form tetap terbuka, bukan auto-redirect ke baris lama). */

let hapState = { page:1, search:'' };
let hapFormMode = null;
let hapFormIdx = null;
let hapFormRow = null;

function renderHakApprovalPage(){
  renderHapList();
}

/* ===================== LIST ===================== */

function renderHapList(){
  content.innerHTML = tplHapListPage();
  hapState = { page:1, search:'' };
  document.getElementById('btnHapAdd').onclick = () => openHapForm('add', null);
  document.getElementById('hapPageSize').onchange = () => { hapState.page = 1; renderHapTable(); };
  document.getElementById('hapSearch').oninput = (e) => {
    hapState.search = e.target.value.trim().toLowerCase();
    hapState.page = 1;
    renderHapTable();
  };
  renderHapTable();
}

function hapPageSize(){
  const sel = document.getElementById('hapPageSize');
  return sel ? parseInt(sel.value, 10) : HAP_PAGE_SIZE_DEFAULT;
}

function hapFiltered(){
  if(!hapState.search) return DATA.hakApproval;
  const q = hapState.search;
  return DATA.hakApproval.filter(r => {
    const type = hapDocType(r.tipeDokumen);
    const label = type ? type.label.toLowerCase() : r.tipeDokumen.toLowerCase();
    return label.includes(q) || hapOptionsSummary(r).toLowerCase().includes(q);
  });
}

function renderHapTable(){
  const perPage = hapPageSize();
  const filtered = hapFiltered();
  const total = filtered.length;
  const totalPages = Math.max(1, Math.ceil(total/perPage));
  if(hapState.page > totalPages) hapState.page = totalPages;
  if(hapState.page < 1) hapState.page = 1;
  const startIdx = (hapState.page-1) * perPage;
  const pageRows = filtered.slice(startIdx, startIdx+perPage);

  document.getElementById('hapTbody').innerHTML = tplHapRows(pageRows);
  document.getElementById('hapTotal').textContent = `Total Record: ${total}`;
  document.getElementById('hapPagerWrap').innerHTML = tplHapPager(hapState.page, totalPages);

  document.getElementById('hapTbody').querySelectorAll('[data-edit]').forEach(b => b.onclick = () => openHapForm('edit', +b.dataset.edit));
  document.getElementById('hapTbody').querySelectorAll('[data-del]').forEach(b => b.onclick = () => openHapDeleteConfirm(+b.dataset.del));
  wireHapPagerEvents(totalPages);
}

function wireHapPagerEvents(totalPages){
  const wrap = document.getElementById('hapPagerWrap');
  const goTo = (p) => { hapState.page = Math.min(Math.max(1,p), totalPages); renderHapTable(); };
  wrap.querySelector('[data-hap-first]').onclick = () => goTo(1);
  wrap.querySelector('[data-hap-prev]').onclick = () => goTo(hapState.page-1);
  wrap.querySelector('[data-hap-next]').onclick = () => goTo(hapState.page+1);
  wrap.querySelector('[data-hap-last]').onclick = () => goTo(totalPages);
  wrap.querySelectorAll('[data-hap-page]').forEach(b => b.onclick = () => goTo(+b.dataset.hapPage));
}

function openHapDeleteConfirm(idx){
  closeModal();
  const row = DATA.hakApproval[idx];
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.innerHTML = tplHapDeleteConfirm(row);
  document.body.appendChild(overlay);
  document.getElementById('modalClose').onclick = closeModal;
  document.getElementById('modalCancel').onclick = closeModal;
  overlay.onclick = (e) => { if(e.target === overlay) closeModal(); };
  document.getElementById('modalDelete').onclick = () => {
    DATA.hakApproval.splice(idx, 1);
    closeModal();
    renderHapTable();
  };
}

function hapOverlay(html){
  closeModal();
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.innerHTML = html;
  document.body.appendChild(overlay);
  document.getElementById('modalClose').onclick = closeModal;
  const cancel = document.getElementById('modalCancel');
  if(cancel) cancel.onclick = closeModal;
  overlay.onclick = (e) => { if(e.target === overlay) closeModal(); };
  return overlay;
}

function openHapInfo(title, text){
  hapOverlay(tplHapInfoModal(title, text));
  document.getElementById('modalOk').onclick = closeModal;
}

/* ===================== FORM ===================== */

function hapEmptyOptionsFor(type){
  const o = {};
  type.extraOptions.forEach(opt => o[opt.key] = false);
  return o;
}

function hapEmptyRow(typeKey){
  const type = hapDocType(typeKey) || HAP_DOC_TYPES[0];
  return { tipeDokumen:type.key, aktif:true, options:hapEmptyOptionsFor(type), useUserRequestApprover:false, levels:[] };
}

function hapDefaultAddTypeKey(){
  const used = new Set((DATA.hakApproval||[]).map(r=>r.tipeDokumen));
  const free = HAP_DOC_TYPES.find(t => !used.has(t.key));
  return free ? free.key : HAP_DOC_TYPES[0].key;
}

function hapNextLevelNumber(levels){
  return levels.length ? Math.max(...levels.map(l=>l.level)) + 1 : 1;
}

function openHapForm(mode, idx){
  hapFormMode = mode;
  hapFormIdx = idx;
  hapFormRow = mode==='add' ? hapEmptyRow(hapDefaultAddTypeKey()) : JSON.parse(JSON.stringify(DATA.hakApproval[idx]));
  renderHapFormPage();
}

function renderHapFormPage(){
  content.innerHTML = tplHapForm(hapFormMode, hapFormRow);
  document.getElementById('btnHapTutorial').onclick = () => openHapInfo('Tutorial', 'Video tutorial Hak Approval tersedia di portal MASERP (mockup).');

  if(hapFormMode==='add'){
    document.getElementById('fHapTipeDokumen').onchange = (e) => {
      hapFormRow = hapEmptyRow(e.target.value);
      renderHapFormPage();
    };
  }

  document.getElementById('btnHapAddLevel').onclick = (e) => {
    e.preventDefault();
    const type = hapDocType(hapFormRow.tipeDokumen);
    const newLevel = { level: hapNextLevelNumber(hapFormRow.levels), userRoles:[], userNames:[] };
    type.levelCols.forEach(c => newLevel[c.key] = 0);
    hapFormRow.levels.push(newLevel);
    renderHapLevelsBody();
  };

  document.getElementById('hapSave').onclick = () => hapSave();
  document.getElementById('hapCancel').onclick = () => renderHapList();

  renderHapLevelsBody();
}

function renderHapLevelsBody(){
  const type = hapDocType(hapFormRow.tipeDokumen);
  const tbody = document.getElementById('hapLevelsBody');
  tbody.innerHTML = tplHapLevelRows(hapFormRow, type);

  tbody.querySelectorAll('[data-hap-lvl-col]').forEach(inp => inp.oninput = (e) => {
    const li = +inp.dataset.hapLvlIdx, key = inp.dataset.hapLvlCol;
    hapFormRow.levels[li][key] = +e.target.value || 0;
  });
  tbody.querySelectorAll('[data-hap-lvl-del]').forEach(btn => btn.onclick = () => {
    hapFormRow.levels.splice(+btn.dataset.hapLvlDel, 1);
    renderHapLevelsBody();
  });
  tbody.querySelectorAll('[data-hap-roles-box]').forEach(box => box.onclick = (e) => {
    if(e.target.closest('.rm')) return;
    openHapTagPicker(+box.dataset.hapRolesBox, 'role');
  });
  tbody.querySelectorAll('[data-hap-names-box]').forEach(box => box.onclick = (e) => {
    if(e.target.closest('.rm')) return;
    openHapTagPicker(+box.dataset.hapNamesBox, 'name');
  });
  tbody.querySelectorAll('[data-hap-rm]').forEach(rm => rm.onclick = (e) => {
    e.stopPropagation();
    const kind = rm.dataset.hapRm, li = +rm.dataset.hapRmLevel, i = +rm.dataset.hapRmI;
    const list = kind==='role' ? hapFormRow.levels[li].userRoles : hapFormRow.levels[li].userNames;
    list.splice(i, 1);
    renderHapLevelsBody();
  });
}

function openHapTagPicker(levelIdx, kind){
  closeModal();
  const list = kind==='role' ? hapFormRow.levels[levelIdx].userRoles : hapFormRow.levels[levelIdx].userNames;
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.innerHTML = tplHapTagPickerModal(kind, list);
  document.body.appendChild(overlay);
  document.getElementById('modalClose').onclick = closeModal;
  document.getElementById('modalCancel').onclick = closeModal;
  overlay.onclick = (e) => { if(e.target === overlay) closeModal(); };

  const wireRows = () => {
    overlay.querySelectorAll('[data-hap-pick]').forEach(btn => btn.onclick = () => {
      const name = btn.dataset.hapPick;
      if(!list.includes(name)) list.push(name);
      closeModal();
      renderHapLevelsBody();
    });
  };
  wireRows();
  document.getElementById('hapTagPickerSearch').oninput = (e) => {
    const q = e.target.value.trim().toLowerCase();
    const source = hapTagPickerSource(kind).filter(n => n.toLowerCase().includes(q));
    document.getElementById('hapTagPickerBody').innerHTML = tplHapTagPickerRows(kind, source, list);
    wireRows();
  };
}

function hapSave(){
  const type = hapDocType(hapFormRow.tipeDokumen);
  hapFormRow.aktif = document.getElementById('fHapAktif').checked;
  hapFormRow.useUserRequestApprover = document.getElementById('fHapUseUserReq').checked;
  hapFormRow.options = hapFormRow.options || {};
  type.extraOptions.forEach(opt => {
    const cb = document.querySelector(`[data-hap-opt="${opt.key}"]`);
    hapFormRow.options[opt.key] = cb ? cb.checked : false;
  });

  if(hapFormMode==='add'){
    const dup = DATA.hakApproval.some(r => r.tipeDokumen === hapFormRow.tipeDokumen);
    if(dup){
      openHapInfo('Tipe Dokumen Sudah Ada', `Tipe Dokumen <b>${type.label}</b> sudah memiliki setting Hak Approval. Silakan Edit baris yang sudah ada di Daftar Hak Approval.`);
      return;
    }
    DATA.hakApproval.push(hapFormRow);
  } else {
    DATA.hakApproval[hapFormIdx] = hapFormRow;
  }
  renderHapList();
}
