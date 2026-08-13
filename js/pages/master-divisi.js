/* =========================================================
   LOGIC (JS saja) — Master Divisi (Lain-lain) — CRUD
   sederhana: hanya Kode Divisi & Nama Divisi.
   Dimuat otomatis (lazy-load) oleh core.js saat menu ini
   pertama kali diklik — lihat PAGE_MODULES di js/core.js.
   Markup HTML-nya ada di file sebelah: master-divisi.template.js
   (tplDivisiPage/tplDivisiRows/tplDivisiModal/tplDivisiDeleteConfirm).
   NB: closeModal() dipakai bersama, didefinisikan di core.js.
========================================================= */
function renderDivisiPage(){
  content.innerHTML=tplDivisiPage();
  document.getElementById('btnAddDivisi').onclick=()=>openDivisiModal('add');
  renderDivisiTable();
}

function renderDivisiTable(){
  const tbody=document.getElementById('divisiTbody');
  const total=document.getElementById('divisiTotal');
  tbody.innerHTML=tplDivisiRows(DATA.divisi);
  total.textContent=`Total Record: ${DATA.divisi.length}`;
  tbody.querySelectorAll('[data-edit]').forEach(b=>b.onclick=()=>openDivisiModal('edit', +b.dataset.edit));
  tbody.querySelectorAll('[data-del]').forEach(b=>b.onclick=()=>openDivisiDeleteConfirm(+b.dataset.del));
}

function openDivisiModal(mode, idx){
  closeModal();
  const row = mode==='edit' ? DATA.divisi[idx] : {kode:'', nama:''};
  const overlay=document.createElement('div');
  overlay.className='modal-overlay';
  overlay.innerHTML=tplDivisiModal(mode, row);
  document.body.appendChild(overlay);
  document.getElementById('modalClose').onclick=closeModal;
  document.getElementById('modalCancel').onclick=closeModal;
  overlay.onclick=(e)=>{ if(e.target===overlay) closeModal(); };
  document.getElementById('modalSave').onclick=()=>{
    const kode=document.getElementById('fKode').value.trim();
    const nama=document.getElementById('fNama').value.trim();
    if(!kode){ document.getElementById('fKodeErr').style.display='block'; return; }
    if(mode==='add'){ DATA.divisi.push({kode, nama}); }
    else { DATA.divisi[idx]={kode, nama}; }
    closeModal();
    renderDivisiTable();
  };
}

function openDivisiDeleteConfirm(idx){
  closeModal();
  const row=DATA.divisi[idx];
  const overlay=document.createElement('div');
  overlay.className='modal-overlay';
  overlay.innerHTML=tplDivisiDeleteConfirm(row);
  document.body.appendChild(overlay);
  document.getElementById('modalClose').onclick=closeModal;
  document.getElementById('modalCancel').onclick=closeModal;
  overlay.onclick=(e)=>{ if(e.target===overlay) closeModal(); };
  document.getElementById('modalDelete').onclick=()=>{
    DATA.divisi.splice(idx,1);
    closeModal();
    renderDivisiTable();
  };
}
