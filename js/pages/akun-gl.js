/* =========================================================
   LOGIC (JS saja) — Akun GL (General Ledger > Master & Setting).
   Dimuat otomatis (lazy-load) oleh core.js saat menu ini
   pertama kali diklik — lihat PAGE_MODULES di js/core.js.
   Markup HTML-nya ada di file sebelah: akun-gl.template.js
   (tplAkunGLPage/tplAkGlRows/tplAkGlModal/tplAkGlDeleteConfirm/
   tplAkGlInfoModal).
   NB: closeModal() dipakai bersama, didefinisikan di core.js.

   Beda dari GL Kategori: halaman ini CRUD PENUH (Tambah/Ubah/
   Hapus), sesuai contoh screenshot "Daftar General Ledger".
   Kategori Akun (dropdown) mengambil pilihan dari DATA.glKategori
   (menu GL Kategori) — supaya data antar-2 menu General Ledger
   ini nyambung.
========================================================= */
function renderAkunGLPage(){
  content.innerHTML=tplAkunGLPage();
  document.getElementById('btnAkAdd').onclick=()=>openAkGlModal('add');
  document.getElementById('btnAkGenerate').onclick=()=>openAkGlInfo('Generate Ak.', 'Fitur generate otomatis nomor akun berdasarkan template Kategori GL akan tersedia di modul terpisah.');
  document.getElementById('btnAkImport').onclick=()=>openAkGlInfo('Import', 'Fitur import Akun GL dari file Excel akan tersedia di modul terpisah.');
  document.getElementById('btnAkImportNS').onclick=()=>openAkGlInfo('Import Neraca Saldo', 'Fitur import saldo awal dari Neraca Saldo akan tersedia di modul terpisah.');
  document.getElementById('btnAkCopy').onclick=()=>openAkGlInfo('Copy', 'Fitur copy struktur Akun GL dari cabang/perusahaan lain akan tersedia di modul terpisah.');
  renderAkGlTable();
}

function renderAkGlTable(){
  const tbody=document.getElementById('akGlTbody');
  const total=document.getElementById('akGlTotal');
  tbody.innerHTML=tplAkGlRows(DATA.akunGL);
  total.textContent=`Total Record: ${DATA.akunGL.length}`;
  tbody.querySelectorAll('[data-edit]').forEach(b=>b.onclick=()=>openAkGlModal('edit', +b.dataset.edit));
  tbody.querySelectorAll('[data-del]').forEach(b=>b.onclick=()=>openAkGlDeleteConfirm(+b.dataset.del));
}

function openAkGlModal(mode, idx){
  closeModal();
  const row = mode==='edit' ? DATA.akunGL[idx] : {kode:'', nama:'', kategori:DATA.glKategori[0].kode, tipe:'D', jenis:'Detail', saldoAwal:0, debet:0, kredit:0, saldoAkhir:0};
  const overlay=document.createElement('div');
  overlay.className='modal-overlay';
  overlay.innerHTML=tplAkGlModal(mode, row);
  document.body.appendChild(overlay);
  document.getElementById('modalClose').onclick=closeModal;
  document.getElementById('modalCancel').onclick=closeModal;
  overlay.onclick=(e)=>{ if(e.target===overlay) closeModal(); };
  document.getElementById('modalSave').onclick=()=>{
    const kode=document.getElementById('fAkKode').value.trim();
    const nama=document.getElementById('fAkNama').value.trim();
    const kategori=document.getElementById('fAkKategori').value;
    const tipe=document.getElementById('fAkTipe').value;
    const jenis=document.getElementById('fAkJenis').value;
    const parseNum=(id)=>parseFloat(document.getElementById(id).value.trim().replace(/\./g,'').replace(',', '.'))||0;
    const saldoAwal=parseNum('fAkSaldoAwal');
    const debet=parseNum('fAkDebet');
    const kredit=parseNum('fAkKredit');
    let ok=true;
    if(!kode){ document.getElementById('fAkKodeErr').style.display='block'; ok=false; } else { document.getElementById('fAkKodeErr').style.display='none'; }
    if(!nama){ document.getElementById('fAkNamaErr').style.display='block'; ok=false; } else { document.getElementById('fAkNamaErr').style.display='none'; }
    if(!ok) return;
    const saldoAkhir = tipe==='K' ? (saldoAwal - debet + kredit) : (saldoAwal + debet - kredit);
    const newRow={kode, nama, kategori, tipe, jenis, saldoAwal, debet, kredit, saldoAkhir};
    if(mode==='add'){ DATA.akunGL.push(newRow); }
    else { DATA.akunGL[idx]=newRow; }
    closeModal();
    renderAkGlTable();
  };
}

function openAkGlDeleteConfirm(idx){
  closeModal();
  const row=DATA.akunGL[idx];
  const overlay=document.createElement('div');
  overlay.className='modal-overlay';
  overlay.innerHTML=tplAkGlDeleteConfirm(row);
  document.body.appendChild(overlay);
  document.getElementById('modalClose').onclick=closeModal;
  document.getElementById('modalCancel').onclick=closeModal;
  overlay.onclick=(e)=>{ if(e.target===overlay) closeModal(); };
  document.getElementById('modalDelete').onclick=()=>{
    DATA.akunGL.splice(idx,1);
    closeModal();
    renderAkGlTable();
  };
}

function openAkGlInfo(title,text){
  closeModal();
  const overlay=document.createElement('div');
  overlay.className='modal-overlay';
  overlay.innerHTML=tplAkGlInfoModal(title,text);
  document.body.appendChild(overlay);
  document.getElementById('modalClose').onclick=closeModal;
  document.getElementById('modalOk').onclick=closeModal;
  overlay.onclick=(e)=>{ if(e.target===overlay) closeModal(); };
}
