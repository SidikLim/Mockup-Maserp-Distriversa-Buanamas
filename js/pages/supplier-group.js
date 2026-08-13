/* =========================================================
   LOGIC (JS saja) — Supplier Group (Supplier & Pembelian) — CRUD
   sederhana: Kode Group, Nama Group, Diskon #1, Diskon #2.
   Dimuat otomatis (lazy-load) oleh core.js saat menu ini
   pertama kali diklik — lihat PAGE_MODULES di js/core.js.
   Markup HTML-nya ada di file sebelah: supplier-group.template.js
   (tplSupplierGroupPage/tplSgRows/tplSgModal/tplSgDeleteConfirm).
   NB: closeModal() dipakai bersama, didefinisikan di core.js.
========================================================= */
function renderSupplierGroupPage(){
  content.innerHTML=tplSupplierGroupPage();
  document.getElementById('btnAddSg').onclick=()=>openSgModal('add');
  renderSgTable();
}

function renderSgTable(){
  const tbody=document.getElementById('sgTbody');
  const total=document.getElementById('sgTotal');
  tbody.innerHTML=tplSgRows(DATA.supplierGroup);
  total.textContent=`Total Record: ${DATA.supplierGroup.length}`;
  tbody.querySelectorAll('[data-edit]').forEach(b=>b.onclick=()=>openSgModal('edit', +b.dataset.edit));
  tbody.querySelectorAll('[data-del]').forEach(b=>b.onclick=()=>openSgDeleteConfirm(+b.dataset.del));
}

function openSgModal(mode, idx){
  closeModal();
  const row = mode==='edit' ? DATA.supplierGroup[idx] : {kode:'', nama:'', diskon1:0, diskon2:0};
  const overlay=document.createElement('div');
  overlay.className='modal-overlay';
  overlay.innerHTML=tplSgModal(mode, row);
  document.body.appendChild(overlay);
  document.getElementById('modalClose').onclick=closeModal;
  document.getElementById('modalCancel').onclick=closeModal;
  overlay.onclick=(e)=>{ if(e.target===overlay) closeModal(); };
  document.getElementById('modalSave').onclick=()=>{
    const kode=document.getElementById('fSgKode').value.trim();
    const nama=document.getElementById('fSgNama').value.trim();
    const d1Raw=document.getElementById('fSgDisc1').value.trim().replace(/\./g,'').replace(',', '.');
    const d2Raw=document.getElementById('fSgDisc2').value.trim().replace(/\./g,'').replace(',', '.');
    const diskon1=parseFloat(d1Raw)||0;
    const diskon2=parseFloat(d2Raw)||0;
    if(!kode){ document.getElementById('fSgKodeErr').style.display='block'; return; }
    if(mode==='add'){ DATA.supplierGroup.push({kode, nama, diskon1, diskon2}); }
    else { DATA.supplierGroup[idx]={kode, nama, diskon1, diskon2}; }
    closeModal();
    renderSgTable();
  };
}

function openSgDeleteConfirm(idx){
  closeModal();
  const row=DATA.supplierGroup[idx];
  const overlay=document.createElement('div');
  overlay.className='modal-overlay';
  overlay.innerHTML=tplSgDeleteConfirm(row);
  document.body.appendChild(overlay);
  document.getElementById('modalClose').onclick=closeModal;
  document.getElementById('modalCancel').onclick=closeModal;
  overlay.onclick=(e)=>{ if(e.target===overlay) closeModal(); };
  document.getElementById('modalDelete').onclick=()=>{
    DATA.supplierGroup.splice(idx,1);
    closeModal();
    renderSgTable();
  };
}
