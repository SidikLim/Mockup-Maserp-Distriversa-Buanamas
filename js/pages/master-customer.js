/* =========================================================
   LOGIC (JS saja) — Master Customer (Customer & Penjualan > Master
   & Setting > Customer, page 'customers'). Dimuat otomatis (lazy-
   load) oleh core.js saat menu ini pertama kali diklik — lihat
   PAGE_MODULES di js/core.js. Markup HTML-nya ada di file sebelah:
   master-customer.template.js (tplMasterCustomerListPage/tplCstRows/
   tplCustomerForm/tplCstLegalitasTable/tplCstIndukPicker/
   tplCstWilayahPicker/tplCstAkunPicker/dst, plus semua konstanta
   CST_* yang dipakai bersama di sini).
   NB: closeModal() dipakai bersama, didefinisikan di core.js.

   Pola CRUD: list + form FULL PAGE (bukan modal) — form TERBANYAK
   field dari semua modul master di mockup ini (Personal Data,
   Informasi Customer Induk, Contact Data, Address, Group Customer,
   Status Customer, 2 sub-grid Legalitas TETAP/fixed [BEDA dari Grup
   Customer yang 6 blok dinamis via checkbox — di sini selalu tampil
   apa adanya, jumlah baris FIXED 4 & 2 sesuai screenshot, jadi tidak
   perlu tombol tambah/hapus baris], lalu section "Info Akuntansi":
   Tax Data/Bank/Kredit/GL Data). Reuse pola picker Akun GL persis
   dari Jurnal Pembelian (tplJpAkunPicker/openJpAkunPicker), disalin
   lokal ke sini (bukan reference cross-file) karena lazy-load antar
   modul tidak terjamin urutannya — pola yang sama dipakai Kategori
   Barang/Pembelian BPB untuk alasan yang sama (lihat catatan proyek).
========================================================= */
let cstShowInactive = false;

function renderMasterCustomerPage(){
  renderCstList();
}

function renderCstList(){
  content.innerHTML = tplMasterCustomerListPage(cstShowInactive);
  document.getElementById('btnCstAdd').onclick = () => openCstForm('add');
  document.getElementById('btnCstAdjustQuota').onclick = () => openCstInfo('Adjust Quota Tanpa DOM', 'Fitur ini akan menyesuaikan kuota customer yang belum memiliki DOM (Dominasi). (Contoh tampilan mockup)');
  document.getElementById('btnCstGeneratePpn').onclick = () => openCstInfo('Generate Default Type PPN', 'Fitur ini akan menjalankan proses generate Type PPN default untuk seluruh customer yang belum memiliki Type PPN. (Contoh tampilan mockup)');
  document.getElementById('btnCstSyncAR').onclick = () => openCstInfo('Sync Status AR Customer', 'Fitur ini akan menyinkronkan ulang Status AR seluruh customer berdasarkan umur piutang saat ini. (Contoh tampilan mockup)');
  document.getElementById('btnCstUangMuka').onclick = () => openCstInfo('Uang Muka Customer', 'Pencatatan uang muka customer akan tersedia pada modul Transaksi A/R. (Contoh tampilan mockup)');
  document.getElementById('btnCstImpor').onclick = () => openCstInfo('Impor Customer', 'Impor data customer dari file Excel/CSV akan tersedia di sini. (Contoh tampilan mockup)');
  document.getElementById('btnCstArea').onclick = () => openCstInfo('Semua Area', 'Filter berdasarkan Area akan tersedia di sini. (Contoh tampilan mockup)');
  document.getElementById('cstShowInactive').onchange = (e) => { cstShowInactive = e.target.checked; renderCstTable(); };
  renderCstTable();
}

function cstFilteredRows(){
  return cstShowInactive ? DATA.customers : DATA.customers.filter(r => r.status !== 'Non Aktif');
}

function renderCstTable(){
  const tbody = document.getElementById('cstTbody');
  const total = document.getElementById('cstTotal');
  const rows = cstFilteredRows();
  tbody.innerHTML = tplCstRows(rows);
  total.textContent = `Total Record: ${rows.length}`;
  tbody.querySelectorAll('[data-edit]').forEach(b => b.onclick = () => openCstForm('edit', +b.dataset.edit));
  tbody.querySelectorAll('[data-del]').forEach(b => b.onclick = () => openCstDeleteConfirm(+b.dataset.del));
}

function cstNextKode(){
  const nums = DATA.customers
    .map(r => /^C(\d+)$/i.exec(r.kode))
    .filter(Boolean)
    .map(m => parseInt(m[1], 10));
  const next = nums.length ? Math.max(...nums) + 1 : 1;
  return 'C' + String(next).padStart(6, '0');
}

function cstEmptyRow(){
  return {
    kode:'', nama:'', kota:'', salesman:'', limit:0, status:'Aktif', alamat:'', piutang:0,
    noRef:'', tglRegistrasi:'', mataUang:'IDR', kodeFarma:'', namaFarma:'', kodeAlkes:'', namaAlkes:'',
    isInduk:false, customerIndukKode:'', customerIndukNama:'', customerIndukAlamat:'',
    namaPemilik:'', kontakPerson:'', gender:'', email:'', tglLahir:'', fax:'', agama:'Islam', jabatan:'', telepon:'',
    statusARCustomer:'Lancar', tipeIdentitas:'TIN', noIdentitas:'', profesi:'Wiraswasta',
    cabang:'Head Office', gudangJualSFA:CST_GUDANG_BY_CABANG['Head Office'], kodeNegara:'IDN', idTKU:'000000', consignment:false,
    area:'', rayonKode:'', rayonNama:'', rayonDistrict:'', provinsi:'', kabupaten:'', kecamatan:'', kelurahan:'', kodePos:'', latitude:'', longitude:'',
    groupCustomer:'', badanUsaha:'',
    npwp:'', namaNpwp:'', alamatPajak:'', pkpStatus:'Non-PKP', kodeTransaksiPajak:'04', typePpn:'Eksklusif',
    masterBank:'', noVA:'', noRek:'',
    top: DATA.syaratBayarList[0], dominasiLimit:0, wajibDominasi:false,
    glAkunPiutang:'1120001', glAkunUangMuka:'', uangMuka:0,
    legalitasOutlet: CST_LEGALITAS_OUTLET_SYARAT.map(s=>({syarat:s, keterangan:'', tglExpired:'', tglProses:'', uploaded:false})),
    legalitasPemilik: CST_LEGALITAS_PEMILIK_SYARAT.map(s=>({syarat:s, keterangan:'', tglExpired:'', tglProses:'', uploaded:false})),
  };
}

function openCstForm(mode, idx){
  const row = mode === 'edit'
    ? { ...DATA.customers[idx], legalitasOutlet:(DATA.customers[idx].legalitasOutlet||[]).map(x=>({...x})), legalitasPemilik:(DATA.customers[idx].legalitasPemilik||[]).map(x=>({...x})) }
    : cstEmptyRow();

  content.innerHTML = tplCustomerForm(mode, row);

  if(mode === 'add') document.getElementById('fCstKode').value = cstNextKode();

  document.getElementById('btnCstTutorial').onclick = () => openCstInfo('Tutorial', 'Video tutorial pengisian Customer akan tersedia di sini.');
  document.getElementById('lnkStatusARSetting').onclick = (e) => { e.preventDefault(); openCstInfo('Setting Status AR Customer', 'Halaman pengaturan aging Status AR Customer akan tersedia di modul "Status AR Customer".'); };

  document.getElementById('btnCstIndukSearch').onclick = () => openCstIndukPicker(row, idx);
  document.getElementById('btnCstIndukClear').onclick = () => {
    row.customerIndukKode=''; row.customerIndukNama=''; row.customerIndukAlamat='';
    document.getElementById('fCstIndukNama').value=''; document.getElementById('fCstIndukAlamat').value='';
  };

  document.getElementById('btnCstWilayahSearch').onclick = () => openCstWilayahPicker(row);

  document.getElementById('btnCstTopAdd').onclick = () => openCstSyaratAddModal();

  document.getElementById('btnCstAkunPiutangSearch').onclick = () => openCstAkunPicker('glAkunPiutang', row);
  document.getElementById('btnCstAkunPiutangClear').onclick = () => {
    row.glAkunPiutang=''; document.getElementById('fCstAkunPiutang').value=''; document.getElementById('fCstAkunPiutangNama').textContent='';
  };
  document.getElementById('btnCstAkunUangMukaSearch').onclick = () => openCstAkunPicker('glAkunUangMuka', row);
  document.getElementById('btnCstAkunUangMukaClear').onclick = () => {
    row.glAkunUangMuka=''; document.getElementById('fCstAkunUangMuka').value=''; document.getElementById('fCstAkunUangMukaNama').textContent='';
  };

  wireCstLegalitasUpload();

  document.getElementById('cstCancel').onclick = () => renderCstList();
  document.getElementById('cstSave').onclick = () => cstSave(mode, idx, row);
}

/* Tombol "Upload File" per baris Legalitas — dekoratif (tidak ada
   upload sungguhan), tapi tetap menghidupkan kotak Preview supaya
   terasa nyata: toggle ikon mata di kolom Preview baris terkait
   TANPA re-render seluruh sub-grid (supaya input Keterangan/Tanggal
   yang sedang diisi user di baris lain tidak ikut hilang). */
function wireCstLegalitasUpload(){
  content.querySelectorAll('[data-leg-upload]').forEach(btn => {
    btn.onclick = () => {
      const key = btn.dataset.legUpload;
      const cell = content.querySelector(`[data-leg-preview="${key}"]`);
      const isOn = cell.dataset.on === '1';
      cell.dataset.on = isOn ? '0' : '1';
      cell.innerHTML = isOn ? '' : icon('eye', 18);
      if(!isOn) openCstInfo('Upload File', 'Berkas berhasil diunggah (contoh tampilan mockup, tidak ada penyimpanan file sungguhan).');
    };
  });
}

function cstReadLegalitasRows(prefix, baseRows){
  return baseRows.map((it, i) => {
    const keteranganEl = content.querySelector(`[data-leg-field="${prefix}:${i}:keterangan"]`);
    const expiredEl = document.getElementById(`fLeg_${prefix}_${i}_tglExpired`);
    const prosesEl = document.getElementById(`fLeg_${prefix}_${i}_tglProses`);
    const previewCell = content.querySelector(`[data-leg-preview="${prefix}:${i}"]`);
    return {
      syarat: it.syarat,
      keterangan: keteranganEl ? keteranganEl.value.trim() : (it.keterangan||''),
      tglExpired: expiredEl ? expiredEl.value.trim() : (it.tglExpired||''),
      tglProses: prosesEl ? prosesEl.value.trim() : (it.tglProses||''),
      uploaded: previewCell ? previewCell.dataset.on === '1' : !!it.uploaded,
    };
  });
}

function cstSave(mode, idx, row){
  const nama = document.getElementById('fCstNama').value.trim();
  if(!nama){ document.getElementById('fCstNamaErr').style.display='block'; return; }
  document.getElementById('fCstNamaErr').style.display='none';

  row.nama = nama;
  row.kode = mode==='edit' ? row.kode : document.getElementById('fCstKode').value.trim();
  row.isInduk = document.getElementById('fCstIsInduk').checked;
  row.noRef = document.getElementById('fCstNoRef').value.trim();
  row.tglRegistrasi = document.getElementById('fCstTglRegistrasi').value.trim();
  row.mataUang = document.getElementById('fCstMataUang').value;
  row.kodeFarma = document.getElementById('fCstKodeFarma').value.trim();
  row.namaFarma = document.getElementById('fCstNamaFarma').value.trim();
  row.kodeAlkes = document.getElementById('fCstKodeAlkes').value.trim();
  row.namaAlkes = document.getElementById('fCstNamaAlkes').value.trim();

  row.namaPemilik = document.getElementById('fCstNamaPemilik').value.trim();
  row.kontakPerson = document.getElementById('fCstKontakPerson').value.trim();
  row.gender = document.getElementById('fCstGender').value;
  row.email = document.getElementById('fCstEmail').value.trim();
  row.tglLahir = document.getElementById('fCstTglLahir').value.trim();
  row.fax = document.getElementById('fCstFax').value.trim();
  row.agama = document.getElementById('fCstAgama').value;
  row.jabatan = document.getElementById('fCstJabatan').value.trim();
  row.telepon = document.getElementById('fCstTelepon').value.trim();
  row.statusARCustomer = document.getElementById('fCstStatusAR').value;
  row.tipeIdentitas = document.getElementById('fCstTipeIdentitas').value;
  row.noIdentitas = document.getElementById('fCstNoIdentitas').value.trim();
  row.profesi = document.getElementById('fCstProfesi').value;
  row.cabang = document.getElementById('fCstCabang').value;
  row.gudangJualSFA = document.getElementById('fCstGudang').value;
  row.kodeNegara = document.getElementById('fCstKodeNegara').value.trim();
  row.idTKU = document.getElementById('fCstIdTku').value.trim();
  row.status = document.querySelector('input[name="fCstStatus"]:checked').value;

  row.area = document.getElementById('fCstWilayah').value.trim();
  row.rayonNama = document.getElementById('fCstRayon').value.trim();
  row.provinsi = document.getElementById('fCstProvinsi').value;
  row.kabupaten = document.getElementById('fCstKabupaten').value.trim();
  row.kecamatan = document.getElementById('fCstKecamatan').value.trim();
  row.kelurahan = document.getElementById('fCstKelurahan').value.trim();
  row.kodePos = document.getElementById('fCstKodePos').value.trim();
  row.salesman = document.getElementById('fCstSalesman').value;
  row.latitude = document.getElementById('fCstLatitude').value.trim();
  row.longitude = document.getElementById('fCstLongitude').value.trim();
  row.kota = row.kota || (CST_AREA_LIST.find(a=>a.area===row.area)||{}).kota || row.kota;
  row.alamat = document.getElementById('fCstAlamat').value.trim();

  row.groupCustomer = document.getElementById('fCstGroup').value;
  row.badanUsaha = document.getElementById('fCstBadanUsaha').value;

  row.consignment = document.getElementById('fCstConsignment').checked;

  row.legalitasOutlet = cstReadLegalitasRows('legalitasOutlet', row.legalitasOutlet);
  row.legalitasPemilik = cstReadLegalitasRows('legalitasPemilik', row.legalitasPemilik);

  row.npwp = document.getElementById('fCstNpwp').value.trim();
  row.namaNpwp = document.getElementById('fCstNamaNpwp').value.trim();
  row.alamatPajak = document.getElementById('fCstAlamatPajak').value.trim();
  row.pkpStatus = document.querySelector('input[name="fCstPkp"]:checked').value;
  row.kodeTransaksiPajak = document.getElementById('fCstKodeTransaksiPajak').value;
  row.typePpn = document.getElementById('fCstTypePpn').value;

  row.masterBank = document.getElementById('fCstMasterBank').value;
  row.noVA = document.getElementById('fCstNoVA').value.trim();
  row.noRek = document.getElementById('fCstNoRek').value.trim();

  row.top = document.getElementById('fCstTop').value;
  const clRaw = document.getElementById('fCstCl').value.trim().replace(/\./g,'').replace(/,/g,'.');
  row.limit = parseFloat(clRaw) || 0;
  const dlRaw = document.getElementById('fCstDl').value.trim().replace(/\./g,'').replace(/,/g,'.');
  row.dominasiLimit = parseFloat(dlRaw) || 0;
  row.wajibDominasi = document.getElementById('fCstWajibDominasi').checked;

  row.glAkunPiutang = document.getElementById('fCstAkunPiutang').value;
  row.glAkunUangMuka = document.getElementById('fCstAkunUangMuka').value;

  if(mode === 'add'){
    row.piutang = row.piutang || 0;
    row.uangMuka = row.uangMuka || 0;
    DATA.customers.push(row);
  } else {
    DATA.customers[idx] = row;
  }
  renderCstList();
}

function openCstIndukPicker(row, selfIdx){
  closeModal();
  const list = DATA.customers.filter((c,i) => i !== selfIdx);
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.innerHTML = tplCstIndukPicker(list);
  document.body.appendChild(overlay);
  document.getElementById('pickerClose').onclick = closeModal;
  document.getElementById('pickerCancel').onclick = closeModal;
  overlay.onclick = (e) => { if(e.target === overlay) closeModal(); };

  const wireRows = () => {
    overlay.querySelectorAll('[data-pick-induk]').forEach(btn => btn.onclick = () => {
      const c = DATA.customers.find(x => x.kode === btn.dataset.pickInduk);
      row.customerIndukKode = c.kode;
      row.customerIndukNama = c.nama;
      row.customerIndukAlamat = c.alamat || '';
      document.getElementById('fCstIndukNama').value = c.nama;
      document.getElementById('fCstIndukAlamat').value = c.alamat || '';
      closeModal();
    });
  };
  wireRows();
  document.getElementById('cstIndukSearch').oninput = (e) => {
    const q = e.target.value.trim().toLowerCase();
    const filtered = list.filter(c => c.kode.toLowerCase().includes(q) || c.nama.toLowerCase().includes(q));
    document.getElementById('cstIndukPickerBody').innerHTML = tplCstIndukPickerRows(filtered);
    wireRows();
  };
}

function openCstWilayahPicker(row){
  closeModal();
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.innerHTML = tplCstWilayahPicker(CST_AREA_LIST);
  document.body.appendChild(overlay);
  document.getElementById('pickerClose').onclick = closeModal;
  document.getElementById('pickerCancel').onclick = closeModal;
  overlay.onclick = (e) => { if(e.target === overlay) closeModal(); };
  overlay.querySelectorAll('[data-pick]').forEach(b => b.onclick = () => {
    const w = CST_AREA_LIST.find(x => x.area === b.dataset.pick);
    row.area = w.area; row.rayonKode = w.rayonKode; row.rayonNama = w.rayonNama; row.rayonDistrict = w.rayonDistrict; row.provinsi = w.provinsi; row.kota = w.kota;
    document.getElementById('fCstWilayah').value = w.area;
    document.getElementById('fCstRayon').value = w.rayonNama;
    document.getElementById('fCstProvinsi').value = w.provinsi;
    closeModal();
  });
}

function openCstSyaratAddModal(){
  closeModal();
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.innerHTML = tplCstSyaratAddModal();
  document.body.appendChild(overlay);
  document.getElementById('modalClose').onclick = closeModal;
  document.getElementById('modalCancel').onclick = closeModal;
  overlay.onclick = (e) => { if(e.target === overlay) closeModal(); };
  document.getElementById('modalSave').onclick = () => {
    const v = document.getElementById('fNewSyarat').value.trim();
    if(v){
      DATA.syaratBayarList.push(v);
      const sel = document.getElementById('fCstTop');
      const opt = document.createElement('option');
      opt.textContent = v; opt.selected = true;
      sel.appendChild(opt);
    }
    closeModal();
  };
}

function openCstAkunPicker(fieldKey, row){
  closeModal();
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.innerHTML = tplCstAkunPicker(DATA.akunGL, fieldKey);
  document.body.appendChild(overlay);
  document.getElementById('modalClose').onclick = closeModal;
  document.getElementById('modalCancel').onclick = closeModal;
  overlay.onclick = (e) => { if(e.target === overlay) closeModal(); };

  const inputId = fieldKey === 'glAkunPiutang' ? 'fCstAkunPiutang' : 'fCstAkunUangMuka';
  const namaId = fieldKey === 'glAkunPiutang' ? 'fCstAkunPiutangNama' : 'fCstAkunUangMukaNama';

  const wireRows = () => {
    overlay.querySelectorAll('[data-pick-akun]').forEach(btn => btn.onclick = () => {
      const kode = btn.dataset.pickAkun;
      row[fieldKey] = kode;
      document.getElementById(inputId).value = kode;
      document.getElementById(namaId).textContent = cstAkunNama(kode);
      closeModal();
    });
  };
  wireRows();
  document.getElementById('cstAkunPickerSearch').oninput = (e) => {
    const q = e.target.value.trim().toLowerCase();
    const filtered = DATA.akunGL.filter(a => a.kode.toLowerCase().includes(q) || a.nama.toLowerCase().includes(q));
    document.getElementById('cstAkunPickerBody').innerHTML = tplCstAkunPickerRows(filtered, fieldKey);
    wireRows();
  };
}

function openCstDeleteConfirm(idx){
  closeModal();
  const row = DATA.customers[idx];
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.innerHTML = tplCstDeleteConfirm(row);
  document.body.appendChild(overlay);
  document.getElementById('modalClose').onclick = closeModal;
  document.getElementById('modalCancel').onclick = closeModal;
  overlay.onclick = (e) => { if(e.target === overlay) closeModal(); };
  document.getElementById('modalDelete').onclick = () => {
    DATA.customers.splice(idx, 1);
    closeModal();
    renderCstTable();
  };
}

function openCstInfo(title, text){
  closeModal();
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.innerHTML = tplCstInfoModal(title, text);
  document.body.appendChild(overlay);
  document.getElementById('modalClose').onclick = closeModal;
  document.getElementById('modalOk').onclick = closeModal;
  overlay.onclick = (e) => { if(e.target === overlay) closeModal(); };
}
