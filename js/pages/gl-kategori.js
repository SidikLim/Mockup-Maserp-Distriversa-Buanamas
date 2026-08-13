/* =========================================================
   LOGIC (JS saja) — GL Kategori (General Ledger > Master & Setting).
   Dimuat otomatis (lazy-load) oleh core.js saat menu ini
   pertama kali diklik — lihat PAGE_MODULES di js/core.js.
   Markup HTML-nya ada di file sebelah: gl-kategori.template.js
   (tplGlKategoriPage/tplGlKategoriRows/tplGlKategoriModal/
   tplGlKategoriHelpModal).
   NB: closeModal() dipakai bersama, didefinisikan di core.js.

   Beda dari Master Divisi/Business Centre/Supplier Group:
   halaman ini HANYA punya aksi Ubah (tanpa Tambah/Hapus),
   karena daftar kategori GL bersifat tetap (fixed) sesuai
   struktur laporan keuangan sistem.
========================================================= */
function renderGlKategoriPage(){
  content.innerHTML=tplGlKategoriPage();
  document.getElementById('btnGlKategoriHelp').onclick=openGlKategoriHelp;
  renderGlKategoriTable();
}

function renderGlKategoriTable(){
  const tbody=document.getElementById('glKategoriTbody');
  tbody.innerHTML=tplGlKategoriRows(DATA.glKategori);
  tbody.querySelectorAll('[data-edit]').forEach(b=>b.onclick=()=>openGlKategoriModal(+b.dataset.edit));
}

function openGlKategoriModal(idx){
  closeModal();
  const row=DATA.glKategori[idx];
  const overlay=document.createElement('div');
  overlay.className='modal-overlay';
  overlay.innerHTML=tplGlKategoriModal(row);
  document.body.appendChild(overlay);
  document.getElementById('modalClose').onclick=closeModal;
  document.getElementById('modalCancel').onclick=closeModal;
  overlay.onclick=(e)=>{ if(e.target===overlay) closeModal(); };
  document.getElementById('modalSave').onclick=()=>{
    const nama=document.getElementById('fNama').value.trim();
    const noAwal=document.getElementById('fNoAwal').value.trim();
    const glAwal=document.getElementById('fGlAwal').value.trim();
    const noAkhir=document.getElementById('fNoAkhir').value.trim();
    const glAkhir=document.getElementById('fGlAkhir').value.trim();
    DATA.glKategori[idx]={...row, nama, noAwal, glAwal, noAkhir, glAkhir};
    closeModal();
    renderGlKategoriTable();
  };
}

function openGlKategoriHelp(){
  closeModal();
  const overlay=document.createElement('div');
  overlay.className='modal-overlay';
  overlay.innerHTML=tplGlKategoriHelpModal();
  document.body.appendChild(overlay);
  document.getElementById('modalClose').onclick=closeModal;
  document.getElementById('modalOk').onclick=closeModal;
  overlay.onclick=(e)=>{ if(e.target===overlay) closeModal(); };
}
