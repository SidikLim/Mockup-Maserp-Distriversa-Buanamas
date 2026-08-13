/* =========================================================
   LOGIC (JS saja) — Business Centre (Lain-lain) — CRUD +
   sub-grid pilih Divisi.
   Dimuat otomatis (lazy-load) oleh core.js saat menu ini
   pertama kali diklik — lihat PAGE_MODULES di js/core.js.
   Markup HTML-nya ada di file sebelah: business-centre.template.js
   (tplBusinessCentrePage/tplBcRows/tplBcModal/tplBcDivisiRows/
   tplBcDivisiPicker/tplBcDeleteConfirm).
   NB: closeModal() dipakai bersama, didefinisikan di core.js.
========================================================= */
let bcDivisiRows = [];

function renderBusinessCentrePage(){
  content.innerHTML=tplBusinessCentrePage();
  document.getElementById('btnAddBc').onclick=()=>openBcModal('add');
  renderBcTable();
}

function renderBcTable(){
  const tbody=document.getElementById('bcTbody');
  const total=document.getElementById('bcTotal');
  tbody.innerHTML=tplBcRows(DATA.businessCentre);
  total.textContent=`Total Record: ${DATA.businessCentre.length}`;
  tbody.querySelectorAll('[data-edit]').forEach(b=>b.onclick=()=>openBcModal('edit', +b.dataset.edit));
  tbody.querySelectorAll('[data-del]').forEach(b=>b.onclick=()=>openBcDeleteConfirm(+b.dataset.del));
}

function openBcModal(mode, idx){
  closeModal();
  const row = mode==='edit' ? DATA.businessCentre[idx] : {kode:'', nama:'', dpp:0, divisi:[]};
  bcDivisiRows = (row.divisi||[]).map(d=>({...d}));
  const overlay=document.createElement('div');
  overlay.className='modal-overlay';
  overlay.innerHTML=tplBcModal(mode, row);
  document.body.appendChild(overlay);
  renderBcDivisiRows();
  document.getElementById('modalClose').onclick=closeModal;
  document.getElementById('modalCancel').onclick=closeModal;
  overlay.onclick=(e)=>{ if(e.target===overlay) closeModal(); };
  document.getElementById('bcAddRow').onclick=(e)=>{ e.preventDefault(); bcDivisiRows.push({kode:'',nama:''}); renderBcDivisiRows(); };
  document.getElementById('modalSave').onclick=()=>{
    const kode=document.getElementById('fBcKode').value.trim();
    const nama=document.getElementById('fBcNama').value.trim();
    const dppRaw=document.getElementById('fBcDpp').value.trim().replace(/\./g,'').replace(',', '.');
    const dpp=parseFloat(dppRaw)||0;
    if(!kode){ document.getElementById('fBcKodeErr').style.display='block'; return; }
    const payload={kode, nama, dpp, divisi:bcDivisiRows.filter(d=>d.kode)};
    if(mode==='add'){ DATA.businessCentre.push(payload); }
    else { DATA.businessCentre[idx]=payload; }
    closeModal();
    renderBcTable();
  };
}

function renderBcDivisiRows(){
  const wrap=document.getElementById('bcDivisiWrap');
  if(!wrap) return;
  wrap.innerHTML=tplBcDivisiRows(bcDivisiRows);
  wrap.querySelectorAll('[data-bc-search]').forEach(b=>b.onclick=()=>openBcDivisiPicker(+b.dataset.bcSearch));
  wrap.querySelectorAll('[data-bc-rm]').forEach(b=>b.onclick=()=>{ bcDivisiRows.splice(+b.dataset.bcRm,1); renderBcDivisiRows(); });
}

function openBcDivisiPicker(rowIdx){
  const overlay=document.createElement('div');
  overlay.className='modal-overlay';
  overlay.innerHTML=tplBcDivisiPicker(DATA.divisi);
  document.body.appendChild(overlay);
  document.getElementById('pickerClose').onclick=closeModal;
  document.getElementById('pickerCancel').onclick=closeModal;
  overlay.onclick=(e)=>{ if(e.target===overlay) closeModal(); };
  overlay.querySelectorAll('[data-pick]').forEach(b=>b.onclick=()=>{
    const d=DATA.divisi.find(x=>x.kode===b.dataset.pick);
    bcDivisiRows[rowIdx]={kode:d.kode, nama:d.nama};
    closeModal();
    renderBcDivisiRows();
  });
}

function openBcDeleteConfirm(idx){
  closeModal();
  const row=DATA.businessCentre[idx];
  const overlay=document.createElement('div');
  overlay.className='modal-overlay';
  overlay.innerHTML=tplBcDeleteConfirm(row);
  document.body.appendChild(overlay);
  document.getElementById('modalClose').onclick=closeModal;
  document.getElementById('modalCancel').onclick=closeModal;
  overlay.onclick=(e)=>{ if(e.target===overlay) closeModal(); };
  document.getElementById('modalDelete').onclick=()=>{
    DATA.businessCentre.splice(idx,1);
    closeModal();
    renderBcTable();
  };
}
