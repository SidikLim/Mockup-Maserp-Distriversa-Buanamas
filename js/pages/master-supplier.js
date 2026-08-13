/* =========================================================
   LOGIC (JS saja) — Master Supplier (Supplier & Pembelian)
   List Daftar Supplier + form Tambah/Ubah Supplier (full page,
   bukan modal, karena jumlah field sangat banyak — sesuai
   contoh tampilan form Supplier yang dikirim).
   Dimuat otomatis (lazy-load) oleh core.js saat menu ini
   pertama kali diklik — lihat PAGE_MODULES di js/core.js.
   Markup HTML-nya ada di file sebelah: master-supplier.template.js
   (tplMasterSupplierList/tplMsRows/tplSupplierForm/tplMsPbRows/
   tplMsPbPicker/tplMsWilayahPicker/tplMsWilayahAddModal/
   tplMsSyaratAddModal/tplMsInfoModal/tplMsDeleteConfirm).
   NB: closeModal() dipakai bersama, didefinisikan di core.js.
========================================================= */
let msPbRows = [];

function renderMasterSupplierPage(){
  renderMsList();
}

function renderMsList(){
  content.innerHTML=tplMasterSupplierList();
  document.getElementById('btnAddSupplier').onclick=()=>openMsForm('add');
  document.getElementById('btnGeneratePpn').onclick=()=>openMsInfo('Generate Default Type PPN','Fitur ini akan menjalankan proses generate Type PPN default untuk seluruh supplier yang belum memiliki Type PPN. (Contoh tampilan mockup)');
  document.getElementById('btnUangMuka').onclick=()=>openMsInfo('Uang Muka Supplier','Pencatatan uang muka supplier akan tersedia pada modul Transaksi A.P. (Contoh tampilan mockup)');
  document.getElementById('btnImporSupplier').onclick=()=>openMsInfo('Impor Supplier','Impor data supplier dari file Excel/CSV akan tersedia di sini. (Contoh tampilan mockup)');
  renderMsTable();
}

function renderMsTable(){
  const tbody=document.getElementById('msTbody');
  const total=document.getElementById('msTotal');
  tbody.innerHTML=tplMsRows(DATA.suppliers);
  total.textContent=`Total Record: ${DATA.suppliers.length}`;
  tbody.querySelectorAll('[data-edit]').forEach(b=>b.onclick=()=>openMsForm('edit', +b.dataset.edit));
  tbody.querySelectorAll('[data-del]').forEach(b=>b.onclick=()=>openMsDeleteConfirm(+b.dataset.del));
}

function openMsForm(mode, idx){
  const row = mode==='edit' ? DATA.suppliers[idx] : {kode:'', nama:'', crc:'IDR', mataUang:'IDR', status:'Aktif', uangMuka:0, saldoUtang:0, pusatBisnis:[]};
  msPbRows = (row.pusatBisnis||[]).map(d=>({...d}));
  content.innerHTML=tplSupplierForm(mode, row);
  renderMsPbRows();

  document.getElementById('msPbAddRow').onclick=(e)=>{ e.preventDefault(); msPbRows.push({kode:'',nama:''}); renderMsPbRows(); };
  document.getElementById('msCancel').onclick=()=>renderMsList();
  document.getElementById('btnWilayahSearch').onclick=()=>openWilayahPicker();
  document.getElementById('btnWilayahAdd').onclick=()=>openWilayahAddModal();
  document.getElementById('btnSyaratAdd').onclick=()=>openSyaratAddModal();
  document.getElementById('btnAkunGlSearch').onclick=()=>openMsInfo('Cari Akun GL','Pencarian Akun GL akan menampilkan daftar Chart of Account (COA) Hutang Usaha. (Contoh tampilan mockup)');

  document.getElementById('msSave').onclick=()=>{
    const prefix=document.getElementById('fKodePrefix').value;
    const num=document.getElementById('fKodeNum').value.trim();
    const nama=document.getElementById('fNama').value.trim();
    let hasErr=false;
    if(!num){ document.getElementById('fKodeErr').style.display='block'; hasErr=true; } else { document.getElementById('fKodeErr').style.display='none'; }
    if(!nama){ document.getElementById('fNamaErr').style.display='block'; hasErr=true; } else { document.getElementById('fNamaErr').style.display='none'; }
    if(hasErr) return;

    const kode = mode==='edit' ? row.kode : (prefix ? prefix+'-'+num : num);
    const mataUang=document.getElementById('fMataUang').value;
    const batasKreditRaw=document.getElementById('fBatasKredit').value.trim().replace(/\./g,'').replace(/,/g,'.');
    const payload={
      kode, nama,
      kodeFarma: document.getElementById('fKodeFarma').value.trim(),
      namaFarma: document.getElementById('fNamaFarma').value.trim(),
      kodeAlkes: document.getElementById('fKodeAlkes').value.trim(),
      namaAlkes: document.getElementById('fNamaAlkes').value.trim(),
      crc: mataUang,
      mataUang: mataUang,
      wilayah: document.getElementById('fWilayah').value.trim(),
      supplierGroup: document.getElementById('fSupplierGroup').value,
      telp: document.getElementById('fTelp').value.trim(),
      fax: document.getElementById('fFax').value.trim(),
      email: document.getElementById('fEmail').value.trim(),
      kontak: document.getElementById('fKontak').value.trim(),
      status: document.querySelector('input[name="fStatus"]:checked').value,
      syaratBayar: document.getElementById('fSyaratBayar').value,
      npwp: document.getElementById('fNpwp').value.trim(),
      batasKredit: parseFloat(batasKreditRaw)||0,
      provinsi: document.getElementById('fProvinsi').value,
      kabupaten: document.getElementById('fKabupaten').value.trim(),
      kecamatan: document.getElementById('fKecamatan').value.trim(),
      kelurahan: document.getElementById('fKelurahan').value.trim(),
      typePpn: document.getElementById('fTypePpn').value,
      typePph: document.getElementById('fTypePph').value,
      kodePos: document.getElementById('fKodePos').value.trim(),
      alamat: document.getElementById('fAlamat').value.trim(),
      integration: document.getElementById('fIntegration').checked,
      integrationFreeStock: document.getElementById('fIntegrationFreeStock').checked,
      uangMuka: row.uangMuka||0,
      saldoUtang: row.saldoUtang||0,
      pusatBisnis: msPbRows.filter(d=>d.kode),
      akunGlUtang: document.getElementById('fAkunGl').value,
    };
    if(mode==='add'){ DATA.suppliers.push(payload); }
    else { DATA.suppliers[idx]=payload; }
    renderMsList();
  };
}

function renderMsPbRows(){
  const wrap=document.getElementById('msPbWrap');
  if(!wrap) return;
  wrap.innerHTML=tplMsPbRows(msPbRows);
  wrap.querySelectorAll('[data-pb-search]').forEach(b=>b.onclick=()=>openPbPicker(+b.dataset.pbSearch));
  wrap.querySelectorAll('[data-pb-rm]').forEach(b=>b.onclick=()=>{ msPbRows.splice(+b.dataset.pbRm,1); renderMsPbRows(); });
}

function openPbPicker(rowIdx){
  const overlay=document.createElement('div');
  overlay.className='modal-overlay';
  overlay.innerHTML=tplMsPbPicker(DATA.businessCentre);
  document.body.appendChild(overlay);
  document.getElementById('pickerClose').onclick=closeModal;
  document.getElementById('pickerCancel').onclick=closeModal;
  overlay.onclick=(e)=>{ if(e.target===overlay) closeModal(); };
  overlay.querySelectorAll('[data-pick]').forEach(b=>b.onclick=()=>{
    const d=DATA.businessCentre.find(x=>x.kode===b.dataset.pick);
    msPbRows[rowIdx]={kode:d.kode, nama:d.nama};
    closeModal();
    renderMsPbRows();
  });
}

function openWilayahPicker(){
  const overlay=document.createElement('div');
  overlay.className='modal-overlay';
  overlay.innerHTML=tplMsWilayahPicker(DATA.wilayah);
  document.body.appendChild(overlay);
  document.getElementById('pickerClose').onclick=closeModal;
  document.getElementById('pickerCancel').onclick=closeModal;
  overlay.onclick=(e)=>{ if(e.target===overlay) closeModal(); };
  overlay.querySelectorAll('[data-pick]').forEach(b=>b.onclick=()=>{
    document.getElementById('fWilayah').value=b.dataset.pick;
    closeModal();
  });
}

function openWilayahAddModal(){
  closeModal();
  const overlay=document.createElement('div');
  overlay.className='modal-overlay';
  overlay.innerHTML=tplMsWilayahAddModal();
  document.body.appendChild(overlay);
  document.getElementById('modalClose').onclick=closeModal;
  document.getElementById('modalCancel').onclick=closeModal;
  overlay.onclick=(e)=>{ if(e.target===overlay) closeModal(); };
  document.getElementById('modalSave').onclick=()=>{
    const v=document.getElementById('fNewWilayah').value.trim();
    if(v){
      DATA.wilayah.push(v);
      document.getElementById('fWilayah').value=v;
    }
    closeModal();
  };
}

function openSyaratAddModal(){
  closeModal();
  const overlay=document.createElement('div');
  overlay.className='modal-overlay';
  overlay.innerHTML=tplMsSyaratAddModal();
  document.body.appendChild(overlay);
  document.getElementById('modalClose').onclick=closeModal;
  document.getElementById('modalCancel').onclick=closeModal;
  overlay.onclick=(e)=>{ if(e.target===overlay) closeModal(); };
  document.getElementById('modalSave').onclick=()=>{
    const v=document.getElementById('fNewSyarat').value.trim();
    if(v){
      DATA.syaratBayarList.push(v);
      const sel=document.getElementById('fSyaratBayar');
      const opt=document.createElement('option');
      opt.textContent=v;
      opt.selected=true;
      sel.appendChild(opt);
    }
    closeModal();
  };
}

function openMsInfo(title, text){
  closeModal();
  const overlay=document.createElement('div');
  overlay.className='modal-overlay';
  overlay.innerHTML=tplMsInfoModal(title, text);
  document.body.appendChild(overlay);
  document.getElementById('modalClose').onclick=closeModal;
  document.getElementById('modalCancel').onclick=closeModal;
  overlay.onclick=(e)=>{ if(e.target===overlay) closeModal(); };
}

function openMsDeleteConfirm(idx){
  closeModal();
  const row=DATA.suppliers[idx];
  const overlay=document.createElement('div');
  overlay.className='modal-overlay';
  overlay.innerHTML=tplMsDeleteConfirm(row);
  document.body.appendChild(overlay);
  document.getElementById('modalClose').onclick=closeModal;
  document.getElementById('modalCancel').onclick=closeModal;
  overlay.onclick=(e)=>{ if(e.target===overlay) closeModal(); };
  document.getElementById('modalDelete').onclick=()=>{
    DATA.suppliers.splice(idx,1);
    closeModal();
    renderMsTable();
  };
}
