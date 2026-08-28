/* =========================================================
   LOGIC (JS saja) — Master Currency (Kas/Bank > Master & Setting >
   Currency). Dimuat otomatis (lazy-load) oleh core.js saat menu ini
   pertama kali diklik — lihat PAGE_MODULES di js/core.js. Markup
   HTML-nya ada di file sebelah: currency.template.js. NB:
   closeModal() dipakai bersama, didefinisikan di core.js.

   Pola CRUD: list + form FULL PAGE (form punya 2 tab + sub-grid
   Periode Kurs yang reaktif, jadi memakai variabel state modul
   `crcFormRow` seperti modul CRUD besar lain — grid di-render ulang
   dari state saat baris ditambah/dihapus, nilai input disalin ke
   state lewat event oninput/onchange supaya tidak hilang saat
   re-render atau pindah tab).

   Sumber data: DATA.currencies (BARU 2026-08-28, lihat komentar
   besar di js/data.js). Picker Akun GL me-list DATA.akunGL — pola
   sama seperti Jurnal Pembelian (salinan lokal, bukan reuse
   cross-module). Tombol "Impor Periode Kurs"/"Tutorial"/kalender
   dekoratif (membuka modal info), konsisten tombol serupa di
   Master Bank. Angka kurs diketik/ditampilkan dalam format id-ID
   ("17.856,00") — crcParseNum() mengubahnya balik ke Number saat
   disimpan ke state. */

var crcFormRow = null;
var crcSearchQ = '';

function renderCurrencyPage(){
  renderCrcList();
}

function crcFilteredRows(){
  const q = crcSearchQ.trim().toLowerCase();
  if(!q) return DATA.currencies;
  return DATA.currencies.filter(r =>
    r.kode.toLowerCase().includes(q) ||
    (r.nama || '').toLowerCase().includes(q) ||
    (r.keterangan || '').toLowerCase().includes(q));
}

function renderCrcList(){
  crcSearchQ = '';
  content.innerHTML = tplCurrencyListPage();
  document.getElementById('btnCrcAdd').onclick = () => openCrcForm('add');
  document.getElementById('btnCrcImpor').onclick = () => openCrcInfo('Impor Periode Kurs', 'Impor Periode Kurs massal dari file Excel akan tersedia di sini — pada mockup ini periode kurs diisi lewat form Ubah Mata Uang (tab Rincian Transaksi).');
  document.getElementById('btnCrcTutorial').onclick = () => openCrcInfo('Tutorial', 'Video tutorial pengisian Master Currency akan tersedia di sini.');
  document.getElementById('crcSearch').oninput = (e) => { crcSearchQ = e.target.value; renderCrcTable(); };
  renderCrcTable();
}

function renderCrcTable(){
  const rows = crcFilteredRows();
  document.getElementById('crcTbody').innerHTML = tplCrcRows(rows);
  document.getElementById('crcTotal').textContent = `Total Record: ${rows.length}`;
  content.querySelectorAll('[data-edit-kode]').forEach(el => el.onclick = () => {
    const idx = DATA.currencies.findIndex(c => c.kode === el.dataset.editKode);
    if(idx >= 0) openCrcForm('edit', idx);
  });
  content.querySelectorAll('[data-del-kode]').forEach(el => el.onclick = () => {
    const idx = DATA.currencies.findIndex(c => c.kode === el.dataset.delKode);
    if(idx >= 0) openCrcDeleteConfirm(idx);
  });
}

function crcParseNum(s){
  const n = parseFloat(String(s || '').replace(/\./g, '').replace(',', '.'));
  return isNaN(n) ? 0 : n;
}

function crcEmptyRow(){
  return { kode:'', nama:'', keterangan:'', nonAktif:false, periodeKurs:[],
    jurnal:{akunPiutang:'', akunUtang:'', akunUMPembelian:'', akunUMPenjualan:'', akunLabaSelisihKurs:'', akunRugiSelisihKurs:''} };
}

function openCrcForm(mode, idx){
  /* Deep copy supaya Batalkan benar-benar membuang perubahan
     (periodeKurs & jurnal adalah objek bersarang). */
  crcFormRow = mode === 'edit'
    ? JSON.parse(JSON.stringify(DATA.currencies[idx]))
    : crcEmptyRow();
  const row = crcFormRow;

  content.innerHTML = tplCurrencyForm(mode, row);

  document.getElementById('btnCrcFormTutorial').onclick = () => openCrcInfo('Tutorial', 'Video tutorial pengisian Master Currency akan tersedia di sini.');

  /* Tab switching (pola sama dgn Cabang/Invoice). */
  content.querySelectorAll('[data-crc-tab]').forEach(btn => {
    btn.onclick = () => {
      content.querySelectorAll('[data-crc-tab]').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      document.getElementById('crcTabPanel-kurs').style.display = btn.dataset.crcTab === 'kurs' ? '' : 'none';
      document.getElementById('crcTabPanel-jurnal').style.display = btn.dataset.crcTab === 'jurnal' ? '' : 'none';
    };
  });

  wireCrcKursGrid(row);
  wireCrcJurnalFields(row);

  document.getElementById('crcCancel').onclick = (e) => { e.preventDefault(); renderCrcList(); };
  document.getElementById('crcSave').onclick = () => {
    const kode = document.getElementById('fCrcKode').value.trim().toUpperCase();
    const nama = document.getElementById('fCrcNama').value.trim();
    if(!kode){ crcValidationError('Kode Mata Uang wajib diisi.'); return; }
    if(!nama){ crcValidationError('Nama Mata Uang wajib diisi.'); return; }
    if(mode === 'add' && DATA.currencies.some(c => c.kode === kode)){
      crcValidationError(`Kode Mata Uang ${kode} sudah terdaftar.`); return;
    }
    row.kode = kode;
    row.nama = nama;
    row.keterangan = document.getElementById('fCrcKeterangan').value.trim();
    row.nonAktif = document.getElementById('fCrcNonAktif').checked;
    if(mode === 'add'){
      DATA.currencies.push(row);
      DATA.currencies.sort((a, b) => a.kode < b.kode ? -1 : 1);
    } else {
      DATA.currencies[idx] = row;
    }
    renderCrcList();
  };
}

/* Grid Periode Kurs: baris di-render dari state row.periodeKurs;
   input menyalin nilainya balik ke state, tombol hapus/tambah
   me-render ulang tbody lalu wiring ulang. */
function wireCrcKursGrid(row){
  const tbody = document.getElementById('crcKursBody');

  const rewire = () => {
    tbody.querySelectorAll('[data-kurs-field]').forEach(inp => {
      inp.onchange = () => {
        const k = row.periodeKurs[+inp.dataset.kursIdx];
        const f = inp.dataset.kursField;
        if(f === 'kursStd' || f === 'kursPajak'){
          k[f] = crcParseNum(inp.value);
          inp.value = crcFmtKurs(k[f]);
        } else {
          k[f] = inp.value;
        }
      };
    });
    tbody.querySelectorAll('[data-kurs-del]').forEach(btn => btn.onclick = () => {
      row.periodeKurs.splice(+btn.dataset.kursDel, 1);
      rerender();
    });
    tbody.querySelectorAll('[data-kurs-cal]').forEach(btn => btn.onclick = () =>
      openCrcInfo('Kalender', 'Ketik tanggal langsung pada kolomnya dengan format dd/mm/yyyy — date picker kalender belum tersedia di mockup ini.'));
  };

  const rerender = () => {
    tbody.innerHTML = row.periodeKurs.map((k, i) => tplCrcKursRow(k, i, row.kode)).join('');
    rewire();
  };

  document.getElementById('crcKursAdd').onclick = () => {
    row.periodeKurs.push({kursTarget:'IDR', tglAwal:'', tglAkhir:'', kursStd:0, kursPajak:0});
    rerender();
  };
  rewire();
}

function wireCrcJurnalFields(row){
  if(!row.jurnal) row.jurnal = crcEmptyRow().jurnal;
  CRC_JURNAL_FIELDS.forEach(f => {
    content.querySelector(`[data-akun-search="${f.key}"]`).onclick = () => openCrcAkunPicker(f.key, row);
  });
}

function openCrcAkunPicker(fieldKey, row){
  closeModal();
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.innerHTML = tplCrcAkunPicker(DATA.akunGL, fieldKey);
  document.body.appendChild(overlay);
  document.getElementById('modalClose').onclick = closeModal;
  document.getElementById('modalCancel').onclick = closeModal;
  overlay.onclick = (e) => { if(e.target === overlay) closeModal(); };

  const wireRows = () => {
    overlay.querySelectorAll('[data-pick-akun]').forEach(btn => btn.onclick = () => {
      const kode = btn.dataset.pickAkun;
      row.jurnal[fieldKey] = kode;
      document.getElementById(`fCrc_${fieldKey}`).value = kode;
      document.getElementById(`fCrcNama_${fieldKey}`).textContent = crcAkunNama(kode);
      closeModal();
    });
  };
  wireRows();

  document.getElementById('crcAkunPickerSearch').oninput = (e) => {
    const q = e.target.value.trim().toLowerCase();
    const filtered = DATA.akunGL.filter(a => a.kode.toLowerCase().includes(q) || a.nama.toLowerCase().includes(q));
    document.getElementById('crcAkunPickerBody').innerHTML = tplCrcAkunPickerRows(filtered, fieldKey);
    wireRows();
  };
}

function openCrcDeleteConfirm(idx){
  closeModal();
  const row = DATA.currencies[idx];
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.innerHTML = tplCrcDeleteConfirm(row);
  document.body.appendChild(overlay);
  document.getElementById('modalClose').onclick = closeModal;
  document.getElementById('modalCancel').onclick = closeModal;
  overlay.onclick = (e) => { if(e.target === overlay) closeModal(); };
  document.getElementById('modalDelete').onclick = () => {
    DATA.currencies.splice(idx, 1);
    closeModal();
    renderCrcTable();
  };
}

function openCrcInfo(title, text){
  closeModal();
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.innerHTML = tplCrcInfoModal(title, text);
  document.body.appendChild(overlay);
  document.getElementById('modalClose').onclick = closeModal;
  document.getElementById('modalCancel').onclick = closeModal;
  overlay.onclick = (e) => { if(e.target === overlay) closeModal(); };
}

function crcValidationError(text){
  openCrcInfo('Validasi', text);
}
