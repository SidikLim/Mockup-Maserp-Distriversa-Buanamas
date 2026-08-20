/* =========================================================
   LOGIC (JS saja) — Transaksi A.R. SSP (Customer & Penjualan > Daftar
   Transaksi > Transaksi A.R. SSP). Dimuat otomatis (lazy-load) oleh
   core.js saat menu ini pertama kali diklik — lihat PAGE_MODULES di
   js/core.js. Markup HTML-nya ada di file sebelah:
   penerimaan-ssp.template.js (lihat catatan desain lengkap di
   headernya, termasuk konteks & 3 contoh jurnal dari user).

   Alur inti:
   1) Pilih Customer (openPpSspCustomerPicker) -> ppSspOutstandingForCustomer()
      mengumpulkan SEMUA baris faktur (lintas SEMUA DATA.penerimaanPiutang)
      milik Customer itu yang potonganPpn/Pph:true TAPI
      sudahTerimaSspPpn/Pph:false — 1 baris per jenis pajak (jadi 1
      faktur dgn PPN+PPH ditanggung bisa muncul jadi 2 baris checklist).
   2) User centang item yang SUDAH diterima -> Jurnal & Jumlah reaktif
      (refreshPpSspJurnalDOM/refreshPpSspJumlahDOM).
   3) Simpan (ppSspSave) -> utk tiap item yang dicentang: cari balik baris
      faktur ASLI lewat ppSspFindFaktur() (lookup by penerimaanPiutangNo/
      fakturNo — BUKAN by array index, lihat catatan di bawah) lalu set
      sudahTerimaSspPpn/Pph = true (AR SSP itu dianggap "closed"). 1
      baris baru DATA.penerimaanSsp dibuat sbg histori/bukti (No.
      Transaksi format "26/NK/{Cabang}/08/{urut}").
   4) Hapus (openPpSspDeleteConfirm) -> kebalikannya: sudahTerimaSspPpn/Pph
      pada faktur terkait dikembalikan ke false (balik jadi outstanding
      lagi), baris DATA.penerimaanSsp itu sendiri di-splice.

   CATATAN PENTING: referensi ke faktur asal DISIMPAN sbg pasangan
   (penerimaanPiutangNo, fakturNo) — bukan (ppIdx, fIdx) array index.
   Percobaan pertama memakai index array ternyata RAPUH: Penerimaan
   Piutang baru selalu di-unshift() ke depan array (lihat ppSave() di
   penerimaan-piutang.js), jadi index baris manapun akan BERGESER begitu
   ada dokumen baru ditambah — referensi index yang disimpan lebih dulu
   jadi salah sasaran. No. Transaksi ("26/CL/...") & No. Faktur
   ("26/SI/...") keduanya string unik yang tidak pernah berubah,
   sehingga aman dipakai sbg referensi permanen. */

function renderPenerimaanSspPage(){
  renderPpSspList();
}

function renderPpSspList(){
  content.innerHTML = tplPenerimaanSspListPage();
  document.getElementById('btnPpSspAdd').onclick = () => openPpSspForm('add');
  renderPpSspTable();
}

function renderPpSspTable(){
  const tbody = document.getElementById('ppSspTbody');
  const total = document.getElementById('ppSspTotal');
  tbody.innerHTML = tplPpSspRows(DATA.penerimaanSsp);
  total.textContent = `Total Record: ${DATA.penerimaanSsp.length}`;
  tbody.querySelectorAll('[data-view]').forEach(b => b.onclick = () => openPpSspForm('view', +b.dataset.view));
  tbody.querySelectorAll('[data-del]').forEach(b => b.onclick = () => openPpSspDeleteConfirm(+b.dataset.del));
}

function ppSspGenerateNo(cabang){
  const kode = PP_CABANG_CODE[cabang] || 'XXX';
  const seq = DATA.penerimaanSsp.filter(r => r.cabang === cabang).length + 1;
  return `26/NK/${kode}/08/${String(seq).padStart(5,'0')}`;
}

/* Kumpulkan SEMUA baris faktur (lintas semua dokumen Penerimaan
   Piutang) milik 1 Customer yang potongan pajaknya masih BELUM diterima
   SSP-nya — 1 entry per jenis pajak (PPN/PPH) per faktur, menyimpan
   referensi balik (penerimaanPiutangNo/fakturNo — BUKAN index array,
   lihat catatan "CATATAN PENTING" di header file ini) supaya bisa
   dicari lagi & di-flip saat Simpan. */
function ppSspOutstandingForCustomer(customerKode){
  const out = [];
  DATA.penerimaanPiutang.forEach((pp) => {
    if(pp.customerKode !== customerKode) return;
    (pp.fakturs || []).forEach((f) => {
      if(f.potonganPpn && !f.sudahTerimaSspPpn){
        out.push({ penerimaanPiutangNo: pp.no, fakturNo: f.no, tipePajak: 'PPN', nominal: ppFakturTax(f).ppn, checked: true });
      }
      if(f.potonganPph && !f.sudahTerimaSspPph){
        out.push({ penerimaanPiutangNo: pp.no, fakturNo: f.no, tipePajak: 'PPH', nominal: ppFakturTax(f).pph, checked: true });
      }
    });
  });
  return out;
}

/* Cari balik baris faktur asal by No. Transaksi Penerimaan Piutang +
   No. Faktur (referensi stabil, lihat "CATATAN PENTING" di header). */
function ppSspFindFaktur(penerimaanPiutangNo, fakturNo){
  const pp = DATA.penerimaanPiutang.find(x => x.no === penerimaanPiutangNo);
  if(!pp) return null;
  return (pp.fakturs || []).find(f => f.no === fakturNo) || null;
}

function ppSspBuildEmptyRow(){
  return { no: '', cabang: '', tgl: '19/08/2026', customerKode: '', customerNama: '', items: [], keterangan: '', totalPpn: 0, totalPph: 0, jumlah: 0 };
}

function openPpSspForm(mode, idx){
  let row, outstanding;
  if(mode === 'add'){
    row = ppSspBuildEmptyRow();
    outstanding = [];
  } else {
    row = DATA.penerimaanSsp[idx];
    outstanding = [];
  }
  content.innerHTML = tplPpSspForm(mode, row, outstanding);
  wirePpSspForm(mode, idx, row);
}

function refreshPpSspItemsDOM(row){
  document.getElementById('ppSspItemBody').innerHTML = tplPpSspItemRows(row.items, false);
  const hint = document.getElementById('ppSspEmptyHint');
  if(hint) hint.style.display = row.items.length ? 'none' : '';
  wirePpSspItemRows(row);
}

function wirePpSspItemRows(row){
  document.querySelectorAll('[data-pp-ssp-item]').forEach(cb => cb.onchange = (e) => {
    const i = +cb.dataset.ppSspItem;
    row.items[i].checked = e.target.checked;
    refreshPpSspJumlahDOM(row);
    refreshPpSspJurnalDOM(row);
  });
}

function refreshPpSspJumlahDOM(row){
  const jumlah = row.items.filter(it => it.checked).reduce((s,it) => s + (+it.nominal||0), 0);
  document.getElementById('ppSspJumlah').value = ppSspNum2(Math.round(jumlah*100)/100);
}

function refreshPpSspJurnalDOM(row){
  const checkedItems = row.items.filter(it => it.checked);
  document.getElementById('ppSspJurnalBody').innerHTML = tplPpSspJurnalRows(checkedItems, row.customerNama||'');
}

function wirePpSspForm(mode, idx, row){
  const isView = mode === 'view';
  if(isView){
    document.getElementById('ppSspBatalkan').onclick = () => renderPpSspList();
    return;
  }

  document.getElementById('fPpSspTgl').oninput = (e) => { row.tgl = e.target.value; };
  document.getElementById('ppSspCustomerSearch').onclick = () => openPpSspCustomerPicker(row);
  document.getElementById('fPpSspKeterangan').oninput = (e) => { row.keterangan = e.target.value; };
  document.getElementById('ppSspSimpan').onclick = () => ppSspSave(row);
  document.getElementById('ppSspBatalkan').onclick = () => renderPpSspList();
}

function openPpSspCustomerPicker(row){
  closeModal();
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.innerHTML = tplPpSspCustomerPicker(DATA.customers);
  document.body.appendChild(overlay);
  document.getElementById('modalClose').onclick = closeModal;
  document.getElementById('modalCancel').onclick = closeModal;
  overlay.onclick = (e) => { if(e.target === overlay) closeModal(); };
  overlay.querySelectorAll('[data-pick-customer]').forEach(btn => btn.onclick = () => {
    const c = DATA.customers.find(x => x.kode === btn.dataset.pickCustomer);
    row.customerKode = c.kode;
    row.customerNama = c.nama;
    row.items = ppSspOutstandingForCustomer(c.kode);
    document.getElementById('fPpSspCustomer').value = row.customerNama;
    refreshPpSspItemsDOM(row);
    refreshPpSspJumlahDOM(row);
    refreshPpSspJurnalDOM(row);
    closeModal();
  });
}

/* Simpan: flip sudahTerimaSspPpn/Pph=true pada faktur ASLI (referensi
   ppIdx/fIdx yang disimpan tiap item outstanding), lalu buat 1 baris
   histori DATA.penerimaanSsp baru. Cabang dokumen diambil dari cabang
   Penerimaan Piutang milik item pertama yang dicentang (sederhana,
   lihat catatan header template). */
function ppSspSave(row){
  const checkedItems = row.items.filter(it => it.checked);
  if(!checkedItems.length){
    openPpSspInfo('Validasi', 'Pilih Customer dan centang minimal 1 item AR SSP PPN/PPH yang sudah diterima terlebih dahulu.');
    return;
  }
  const firstPp = DATA.penerimaanPiutang.find(x => x.no === checkedItems[0].penerimaanPiutangNo);
  row.cabang = firstPp ? firstPp.cabang : PP_CABANG_LIST[0];
  row.no = ppSspGenerateNo(row.cabang);

  checkedItems.forEach(it => {
    const f = ppSspFindFaktur(it.penerimaanPiutangNo, it.fakturNo);
    if(!f) return;
    if(it.tipePajak === 'PPN') f.sudahTerimaSspPpn = true; else f.sudahTerimaSspPph = true;
  });

  const totalPpn = Math.round(checkedItems.filter(it=>it.tipePajak==='PPN').reduce((s,it)=>s+(+it.nominal||0),0)*100)/100;
  const totalPph = Math.round(checkedItems.filter(it=>it.tipePajak==='PPH').reduce((s,it)=>s+(+it.nominal||0),0)*100)/100;
  row.items = checkedItems;
  row.totalPpn = totalPpn;
  row.totalPph = totalPph;
  row.jumlah = Math.round((totalPpn + totalPph)*100)/100;
  if(!row.keterangan){
    row.keterangan = `Terima SSP ${checkedItems.map(it=>it.fakturNo).join(', ')} ${(row.customerNama||'').toUpperCase()}`;
  }

  DATA.penerimaanSsp.unshift(row);
  renderPpSspList();
}

function openPpSspDeleteConfirm(idx){
  closeModal();
  const row = DATA.penerimaanSsp[idx];
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.innerHTML = tplPpSspDeleteConfirm(row);
  document.body.appendChild(overlay);
  document.getElementById('modalClose').onclick = closeModal;
  document.getElementById('modalCancel').onclick = closeModal;
  overlay.onclick = (e) => { if(e.target === overlay) closeModal(); };
  document.getElementById('modalDelete').onclick = () => {
    (row.items || []).forEach(it => {
      const f = ppSspFindFaktur(it.penerimaanPiutangNo, it.fakturNo);
      if(!f) return;
      if(it.tipePajak === 'PPN') f.sudahTerimaSspPpn = false; else f.sudahTerimaSspPph = false;
    });
    DATA.penerimaanSsp.splice(idx, 1);
    closeModal();
    renderPpSspTable();
  };
}

function openPpSspInfo(title, text){
  closeModal();
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.innerHTML = tplPpInfoModalSsp(title, text);
  document.body.appendChild(overlay);
  document.getElementById('modalClose').onclick = closeModal;
  document.getElementById('modalOk').onclick = closeModal;
  overlay.onclick = (e) => { if(e.target === overlay) closeModal(); };
}

/* Modal info kecil — SALINAN LOKAL pola tplPpInfoModal() (Penerimaan
   Piutang), nama fungsi beda (Ssp suffix) supaya tidak bentrok kalau
   2 modul ini kebetulan dimuat bersamaan di halaman combined. */
function tplPpInfoModalSsp(title, text){
  return `
    <div class="modal-box">
      <div class="modal-header"><span>${title}</span><span class="close" id="modalClose">&times;</span></div>
      <div class="modal-body"><p>${text}</p></div>
      <div class="modal-footer"><button class="btn-primary" id="modalOk">Mengerti</button></div>
    </div>`;
}
