/* =========================================================
   LOGIC (JS saja) — Master Gudang (Persediaan Barang > Master &
   Setting > Gudang). Dimuat otomatis (lazy-load) oleh core.js saat
   menu ini pertama kali diklik — lihat PAGE_MODULES di js/core.js.
   Markup HTML-nya ada di file sebelah: gudang.template.js
   (tplGudangListPage/tplGdgRows/tplGudangForm/tplGdgDeleteConfirm/
   tplGdgInfoModal, plus konstanta GDG_CABANG_LIST/GDG_CABANG_CODE).
   NB: closeModal() dipakai bersama, didefinisikan di core.js.

   Pola CRUD: list + form FULL PAGE (sama seperti Jurnal Pembelian/
   Kategori Barang/Picking List), field cukup sederhana (tanpa
   sub-grid/tabel reaktif) jadi tidak perlu state sementara di
   variabel modul seperti modul CRUD besar lainnya.

   Kode Gudang SELALU readonly/disabled (baik Tambah maupun Ubah) —
   auto-generate dari Cabang yang dipilih, format `<NN>-GUU` untuk
   gudang pertama di cabang itu, `<NN>-GUU-02`/`-03`/dst untuk gudang
   berikutnya (NN dari GDG_CABANG_CODE). Di mode Tambah, kalau user
   ganti dropdown Cabang, Kode Gudang (dan usulan Nama Gudang) di-
   generate ULANG mengikuti cabang baru — pola regenerasi-saat-ganti-
   cabang ini sama seperti No.IVC/No.SJ di Invoice. Di mode Ubah,
   Cabang tetap bisa diganti tapi Kode Gudang yang sudah ada TIDAK
   ikut berubah (kode sudah jadi identitas record, bukan turunan
   otomatis lagi setelah tersimpan).
========================================================= */

function gdgNextKode(cabang, excludeIdx){
  const kodeAwal = GDG_CABANG_CODE[cabang] || '00';
  const existingCount = DATA.gudang.filter((g,i)=> g.cabang===cabang && i!==excludeIdx).length;
  const seq = existingCount + 1;
  return seq === 1 ? `${kodeAwal}-GUU` : `${kodeAwal}-GUU-${String(seq).padStart(2,'0')}`;
}

function gdgNextNama(cabang, excludeIdx){
  const abbr = { 'Head Office':'HO','Surabaya':'SBY','Bandung':'BDG','Tangerang':'TGR','Medan':'MDN','Makassar':'MKS','Semarang':'SMG','Sidoarjo':'SDA' }[cabang] || cabang;
  const existingCount = DATA.gudang.filter((g,i)=> g.cabang===cabang && i!==excludeIdx).length;
  const seq = existingCount + 1;
  return seq === 1 ? `Gudang Utama-${abbr}` : `Gudang Utama-${abbr} ${seq}`;
}

function renderGudangPage(){
  renderGdgList();
}

function renderGdgList(){
  content.innerHTML = tplGudangListPage();
  document.getElementById('btnGdgAdd').onclick = () => openGdgForm('add');
  renderGdgTable();
}

function renderGdgTable(){
  const tbody = document.getElementById('gdgTbody');
  const total = document.getElementById('gdgTotal');
  tbody.innerHTML = tplGdgRows(DATA.gudang);
  total.textContent = `Total Record: ${DATA.gudang.length}`;
  tbody.querySelectorAll('[data-edit]').forEach(b => b.onclick = () => openGdgForm('edit', +b.dataset.edit));
  tbody.querySelectorAll('[data-del]').forEach(b => b.onclick = () => openGdgDeleteConfirm(+b.dataset.del));
}

function gdgEmptyRow(){
  const cabang = GDG_CABANG_LIST[0];
  return {
    kode: gdgNextKode(cabang, -1), nama: gdgNextNama(cabang, -1), kepalaGudang:'', keterangan:'',
    default:false, cabang, gudangTransit:false, nearED:false, reject:false,
    gudangCadangan:false, hariPeringatan:null, konsinyasi:false,
  };
}

function openGdgForm(mode, idx){
  const row = mode === 'edit' ? { ...DATA.gudang[idx] } : gdgEmptyRow();
  content.innerHTML = tplGudangForm(mode, row);

  document.getElementById('btnGdgTutorial').onclick = () => openGdgInfo('Tutorial', 'Video tutorial pengisian Master Gudang akan tersedia di sini.');

  if(mode === 'add'){
    document.getElementById('fGdgCabang').onchange = (e) => {
      const cabang = e.target.value;
      document.getElementById('fGdgKode').value = gdgNextKode(cabang, -1);
      document.getElementById('fGdgNama').value = gdgNextNama(cabang, -1);
    };
  }

  const cbCadangan = document.getElementById('fGdgCadangan');
  const inpHari = document.getElementById('fGdgHariPeringatan');
  cbCadangan.onchange = () => {
    if(cbCadangan.checked){ inpHari.style.display = 'inline-block'; }
    else { inpHari.style.display = 'none'; inpHari.value = ''; }
  };

  document.getElementById('gdgCancel').onclick = (e) => { e.preventDefault(); renderGdgList(); };
  document.getElementById('gdgSave').onclick = () => {
    const nama = document.getElementById('fGdgNama').value.trim();
    if(!nama){ openGdgInfo('Validasi', 'Nama Gudang wajib diisi.'); return; }
    const hariVal = document.getElementById('fGdgHariPeringatan').value;
    const updated = {
      kode: document.getElementById('fGdgKode').value,
      nama,
      kepalaGudang: document.getElementById('fGdgKepala').value.trim(),
      keterangan: document.getElementById('fGdgKeterangan').value.trim(),
      default: document.getElementById('fGdgDefault').checked,
      cabang: document.getElementById('fGdgCabang').value,
      gudangTransit: document.getElementById('fGdgTransit').checked,
      nearED: document.getElementById('fGdgNearED').checked,
      reject: document.getElementById('fGdgReject').checked,
      gudangCadangan: cbCadangan.checked,
      hariPeringatan: cbCadangan.checked && hariVal !== '' ? Number(hariVal) : null,
      konsinyasi: document.getElementById('fGdgKonsinyasi').checked,
    };
    if(mode === 'add'){ DATA.gudang.push(updated); }
    else { DATA.gudang[idx] = updated; }
    renderGdgList();
  };
}

function openGdgDeleteConfirm(idx){
  closeModal();
  const row = DATA.gudang[idx];
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.innerHTML = tplGdgDeleteConfirm(row);
  document.body.appendChild(overlay);
  document.getElementById('modalClose').onclick = closeModal;
  document.getElementById('modalCancel').onclick = closeModal;
  overlay.onclick = (e) => { if(e.target === overlay) closeModal(); };
  document.getElementById('modalDelete').onclick = () => {
    DATA.gudang.splice(idx, 1);
    closeModal();
    renderGdgTable();
  };
}

function openGdgInfo(title, text){
  closeModal();
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.innerHTML = tplGdgInfoModal(title, text);
  document.body.appendChild(overlay);
  document.getElementById('modalClose').onclick = closeModal;
  document.getElementById('modalCancel').onclick = closeModal;
  overlay.onclick = (e) => { if(e.target === overlay) closeModal(); };
}
