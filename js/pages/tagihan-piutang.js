/* =========================================================
   LOGIC (JS saja) — Tagihan Piutang / "Daftar Tagih Piutang"
   (Customer & Penjualan > Daftar Transaksi, key
   page:'tagihanPiutang'). Dimuat otomatis (lazy-load) oleh
   core.js — lihat PAGE_MODULES di js/core.js. Markup di file
   sebelah: tagihan-piutang.template.js (catatan desain,
   pemetaan screenshot SDL -> DBM & rincian 2 cetakan di
   headernya).
   NB: closeModal() dipakai bersama, didefinisikan di core.js.

   Alur inti:
   - List: chip bulan fungsional, pencarian, page-size default
     20. Toggle "Closed Manually" mengubah Status OPEN<->CLOSED
     langsung dari list. Aksi: Ubah (form), "Ubah Alasan Belum
     Tagih" (modal "Daftar Tagih Piutang Item" — alasan per
     faktur via picker master DATA.alasanBelumTertagih,
     perubahan baru tersimpan saat tombol Simpan modal), Cetak
     (dropdown: Daftar Tagih Full Page / Kwitansi — preview
     replika PDF), Lihat (form view), Hapus.
   - Form: No. 26/DC/HO/09/{urut 5 digit} + refresh; Kolektor
     picker (OFFICE + DATA.salesman); "Tambah Faktur Baru" =
     picker DATA.fakturPenjualanSJ (faktur yang sudah ada di
     daftar disembunyikan) — baris menyimpan snapshot tglFaktur/
     customer/badanUsaha (dari master Customer)/noFaktur/jumlah
     (jumlahAkhir)/tglJthTempo + keterangan "Jual Kredit",
     Kolektor Saat Ini = kolektor header, Tgl. Tagih Sebelumnya
     = Tgl. Tagih, Tgl. Visit editable, Alasan Belum Tertagih
     via picker; Jumlah = Σ baris, recalc live. Customer header
     record = customer faktur pertama.
   Data: DATA.tagihanPiutang (1 sample September 2026 —
   kembaran layar SDL: 2 faktur CUST-006, kolektor OFFICE). */

var dtpState = { search:'', bulan:'09' };

function renderTagihanPiutangPage(){
  dtpState = { search:'', bulan:'09' };
  renderDtpList();
}

function renderDtpList(){
  content.innerHTML = tplDtpListPage(dtpState.bulan);
  document.getElementById('btnDtpAdd').onclick = () => openDtpForm('add', null);
  document.getElementById('dtpSearch').oninput = (e) => { dtpState.search = e.target.value.trim().toLowerCase(); renderDtpTable(); };
  document.getElementById('dtpFilterBulan').onchange = (e) => { dtpState.bulan = e.target.value; renderDtpTable(); };
  document.getElementById('dtpPageSize').onchange = () => renderDtpTable();
  renderDtpTable();
}

function dtpFilteredRows(){
  const q = dtpState.search;
  return (DATA.tagihanPiutang || []).filter(r => {
    if(dtpState.bulan && !(r.tgl || '').includes(`/${dtpState.bulan}/`)) return false;
    if(!q) return true;
    return r.no.toLowerCase().includes(q) ||
      (r.customerNama||'').toLowerCase().includes(q) ||
      (r.kolektor||'').toLowerCase().includes(q) ||
      (r.keterangan||'').toLowerCase().includes(q);
  });
}

function renderDtpTable(){
  const rows = dtpFilteredRows();
  const tbody = document.getElementById('dtpTbody');
  tbody.innerHTML = tplDtpRows(rows);
  document.getElementById('dtpTotal').textContent = `Total Record: ${rows.length}`;
  tbody.querySelectorAll('[data-dtp-closed]').forEach(t => t.onchange = () => {
    DATA.tagihanPiutang[+t.dataset.dtpClosed].closedManually = t.checked;
    renderDtpTable();
  });
  tbody.querySelectorAll('[data-dtp-edit]').forEach(b => b.onclick = () => openDtpForm('edit', +b.dataset.dtpEdit));
  tbody.querySelectorAll('[data-dtp-view]').forEach(b => b.onclick = () => openDtpForm('view', +b.dataset.dtpView));
  tbody.querySelectorAll('[data-dtp-del]').forEach(b => b.onclick = () => openDtpDelete(+b.dataset.dtpDel));
  tbody.querySelectorAll('[data-dtp-alasan]').forEach(b => b.onclick = () => openDtpAlasanModal(+b.dataset.dtpAlasan));
  tbody.querySelectorAll('[data-dtp-cetak]').forEach(b => b.onclick = (e) => { e.stopPropagation(); openDtpCetakMenu(b, +b.dataset.dtpCetak); });
}

/* Dropdown pilihan cetakan di kolom Cetak. */
function closeDtpCetakMenu(){
  const m = document.getElementById('dtpCetakMenu');
  if(m) m.remove();
  document.removeEventListener('click', closeDtpCetakMenu);
}

function openDtpCetakMenu(btn, idx){
  closeDtpCetakMenu();
  const wrap = document.createElement('div');
  wrap.innerHTML = tplDtpCetakMenu(idx);
  const menu = wrap.firstElementChild;
  document.body.appendChild(menu);
  const rect = btn.getBoundingClientRect();
  menu.style.top = (rect.bottom + 4) + 'px';
  menu.style.left = Math.max(8, rect.right - 170) + 'px';
  menu.querySelector('[data-dtp-cetak-full]').onclick = () => { closeDtpCetakMenu(); dtpOverlay(tplDtpCetakFull(DATA.tagihanPiutang[idx])); };
  menu.querySelector('[data-dtp-cetak-kwitansi]').onclick = () => { closeDtpCetakMenu(); dtpOverlay(tplDtpCetakKwitansi(DATA.tagihanPiutang[idx])); };
  setTimeout(() => document.addEventListener('click', closeDtpCetakMenu), 0);
}

/* Nomor otomatis: 26/DC/HO/09/00001, ... */
function dtpGenerateNo(){
  const prefix = '26/DC/HO/09/';
  let max = 0;
  (DATA.tagihanPiutang || []).forEach(r => {
    if(r.no && r.no.startsWith(prefix)){
      const n = parseInt(r.no.slice(prefix.length), 10);
      if(!isNaN(n) && n > max) max = n;
    }
  });
  return prefix + String(max + 1).padStart(5, '0');
}

/* =====================================================================
   FORM add / edit / view
===================================================================== */
function openDtpForm(mode, idx){
  const src = idx != null ? DATA.tagihanPiutang[idx] : null;
  const row = src ? JSON.parse(JSON.stringify(src)) : {
    no: dtpGenerateNo(), tgl: '01/09/2026', jam: '08.15.00',
    customerNama: '', customerAlamat: '', kolektor: 'OFFICE', keterangan: '',
    closedManually: false, items: [],
  };
  const isView = mode === 'view';
  content.innerHTML = tplDtpForm(mode, row);

  const back = () => renderDtpList();
  document.getElementById('dtpBatalkan').onclick = (e) => { e.preventDefault(); back(); };
  document.getElementById('btnDtpTutorial').onclick = () => openDtpInfo('Tutorial', 'Video tutorial Daftar Tagih Piutang tersedia di portal MASERP (mockup).');

  const wireItems = () => {
    document.getElementById('dtpItemsBody').innerHTML = tplDtpItemRows(row.items, isView);
    document.getElementById('fDtpJumlah').value = dtpNum2(dtpJumlahAkhir(row));
    if(isView) return;
    const body = document.getElementById('dtpItemsBody');
    body.querySelectorAll('[data-dtp-item-del]').forEach(b => b.onclick = () => {
      row.items.splice(+b.dataset.dtpItemDel, 1);
      wireItems();
    });
    body.querySelectorAll('[data-dtp-item-alasan-pick]').forEach(b => b.onclick = () => {
      const i = +b.dataset.dtpItemAlasanPick;
      openDtpAlasanPicker((a) => {
        row.items[i].alasan = a.nama;
        body.querySelector(`[data-dtp-item-alasan="${i}"]`).value = a.nama;
      });
    });
    body.querySelectorAll('[data-dtp-item-visit]').forEach(inp => inp.oninput = () => {
      row.items[+inp.dataset.dtpItemVisit].tglVisit = inp.value;
    });
  };
  wireItems();
  if(isView) return;

  const refreshNoBtn = document.getElementById('dtpRefreshNo');
  if(refreshNoBtn) refreshNoBtn.onclick = () => { row.no = dtpGenerateNo(); document.getElementById('fDtpNo').value = row.no; };

  document.getElementById('dtpKolektorSearch').onclick = () => openDtpKolektorPicker((nama) => {
    row.kolektor = nama;
    document.getElementById('fDtpKolektor').value = nama;
    row.items.forEach((it,i) => {
      it.kolektorSaatIni = nama;
      const cell = document.querySelector(`[data-dtp-item-kolektor="${i}"]`);
      if(cell) cell.textContent = nama;
    });
  });

  document.getElementById('dtpAddFaktur').onclick = (e) => {
    e.preventDefault();
    openDtpFakturPicker(row, (f) => {
      const cust = (DATA.customers||[]).find(c => c.kode === f.customerKode) || {};
      row.items.push({
        tglFaktur: f.tglFaktur || '', jamFaktur: (f.tglInput||'').split(' ')[1] ? (f.tglInput.split(' ')[1].replace(/:/g,'.')) : '',
        customerKode: f.customerKode, customerNama: f.customerNama, customerAlamat: f.customerAlamat || cust.alamat || '',
        badanUsaha: cust.badanUsaha || 'PT', noFaktur: f.no, jumlah: Number(f.jumlahAkhir || 0),
        tglJthTempo: f.tglJatuhTempo || '', keterangan: 'Jual Kredit',
        alasan: '', tglVisit: row.tgl, kolektorSebelumnya: '', kolektorSaatIni: row.kolektor,
        tglTagihSebelumnya: row.tgl, noPelunasan: '', alasanSebelumnya: '',
      });
      if(!row.customerNama){ row.customerNama = f.customerNama; row.customerAlamat = f.customerAlamat || cust.alamat || ''; }
      wireItems();
    });
  };

  document.getElementById('dtpSimpan').onclick = () => {
    row.tgl = document.getElementById('fDtpTgl').value.trim();
    row.keterangan = document.getElementById('fDtpKeterangan').value;
    if(!row.tgl){ openDtpInfo('Validasi', 'Tgl. Tagih wajib diisi.'); return; }
    if(!row.kolektor){ openDtpInfo('Validasi', 'Kolektor wajib dipilih.'); return; }
    if(!row.items || !row.items.length){ openDtpInfo('Validasi', 'Belum ada faktur — klik "Tambah Faktur Baru".'); return; }
    row.customerNama = row.items[0].customerNama;
    row.customerAlamat = row.items[0].customerAlamat || '';
    DATA.tagihanPiutang = DATA.tagihanPiutang || [];
    if(mode === 'add') DATA.tagihanPiutang.unshift(row);
    else DATA.tagihanPiutang[idx] = row;
    back();
  };
}

/* =====================================================================
   Modal "Ubah Alasan Belum Tagih" (Daftar Tagih Piutang Item)
===================================================================== */
function openDtpAlasanModal(idx){
  const row = DATA.tagihanPiutang[idx];
  row.items.forEach(it => { delete it._alasanBaru; });
  const overlay = dtpOverlay(tplDtpAlasanModal(row));
  const wire = () => {
    const q = (document.getElementById('dtpAlasanModalSearch').value || '').trim().toLowerCase();
    document.getElementById('dtpAlasanModalBody').innerHTML = tplDtpAlasanModalRows(row.items, q);
    overlay.querySelectorAll('[data-dtp-modal-alasan-pick]').forEach(b => b.onclick = () => {
      const i = +b.dataset.dtpModalAlasanPick;
      openDtpAlasanPicker((a) => {
        row.items[i]._alasanBaru = a.nama;
        // picker menutup modal item — buka ulang dgn nilai baru tertahan
        const ov2 = dtpOverlay(tplDtpAlasanModal(row));
        rewire(ov2);
      });
    });
    document.getElementById('dtpAlasanSimpan').onclick = () => {
      row.items.forEach(it => {
        if(it._alasanBaru != null){ it.alasan = it._alasanBaru; delete it._alasanBaru; }
      });
      closeModal();
      renderDtpTable();
    };
    document.getElementById('dtpAlasanModalSearch').oninput = wire;
  };
  const rewire = (ov) => {
    ov.querySelectorAll('[data-dtp-modal-alasan-pick]').forEach(b => b.onclick = () => {
      const i = +b.dataset.dtpModalAlasanPick;
      openDtpAlasanPicker((a) => {
        row.items[i]._alasanBaru = a.nama;
        const ov3 = dtpOverlay(tplDtpAlasanModal(row));
        rewire(ov3);
      });
    });
    document.getElementById('dtpAlasanSimpan').onclick = () => {
      row.items.forEach(it => {
        if(it._alasanBaru != null){ it.alasan = it._alasanBaru; delete it._alasanBaru; }
      });
      closeModal();
      renderDtpTable();
    };
    document.getElementById('dtpAlasanModalSearch').oninput = () => {
      const q = (document.getElementById('dtpAlasanModalSearch').value || '').trim().toLowerCase();
      document.getElementById('dtpAlasanModalBody').innerHTML = tplDtpAlasanModalRows(row.items, q);
      rewire(ov);
    };
  };
  wire();
}

/* =====================================================================
   Modals umum & picker
===================================================================== */
function dtpOverlay(html){
  closeModal();
  closeDtpCetakMenu();
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.innerHTML = html;
  document.body.appendChild(overlay);
  document.getElementById('modalClose').onclick = closeModal;
  const cancel = document.getElementById('modalCancel');
  if(cancel) cancel.onclick = closeModal;
  overlay.onclick = (e) => { if(e.target === overlay) closeModal(); };
  return overlay;
}

function openDtpDelete(idx){
  const row = DATA.tagihanPiutang[idx];
  dtpOverlay(tplDtpDeleteConfirm(row));
  document.getElementById('modalDelete').onclick = () => {
    DATA.tagihanPiutang.splice(idx, 1);
    closeModal();
    renderDtpTable();
  };
}

function openDtpInfo(title, text){
  dtpOverlay(tplDtpInfoModal(title, text));
  document.getElementById('modalOk').onclick = closeModal;
}

function openDtpAlasanPicker(onPick){
  const overlay = dtpOverlay(tplDtpAlasanPicker(DATA.alasanBelumTertagih));
  const wire = () => overlay.querySelectorAll('[data-pick-alasan]').forEach(b => b.onclick = () => {
    const a = DATA.alasanBelumTertagih.find(x => x.kode === b.dataset.pickAlasan);
    closeModal(); // tutup picker DULU — onPick boleh membuka modal lain (modal Item)
    if(a) onPick(a);
  });
  wire();
  document.getElementById('dtpAlasanPickerSearch').oninput = (e) => {
    const q = e.target.value.trim().toLowerCase();
    const list = DATA.alasanBelumTertagih.filter(a => !q || a.kode.toLowerCase().includes(q) || a.nama.toLowerCase().includes(q));
    document.getElementById('dtpAlasanPickerBody').innerHTML = tplDtpAlasanPickerRows(list);
    wire();
  };
}

function openDtpKolektorPicker(onPick){
  const list = [{nama:'OFFICE', area:'Head Office'}].concat(DATA.salesman || []);
  const overlay = dtpOverlay(tplDtpKolektorPicker(list));
  overlay.querySelectorAll('[data-pick-kolektor]').forEach(b => b.onclick = () => {
    onPick(b.dataset.pickKolektor);
    closeModal();
  });
}

function openDtpFakturPicker(row, onPick){
  const dipakai = new Set((row.items||[]).map(it => it.noFaktur));
  const src = (DATA.fakturPenjualanSJ || []).filter(f => !dipakai.has(f.no));
  const overlay = dtpOverlay(tplDtpFakturPicker(src));
  const wire = () => overlay.querySelectorAll('[data-pick-faktur]').forEach(b => b.onclick = () => {
    const f = (DATA.fakturPenjualanSJ || []).find(x => x.no === b.dataset.pickFaktur);
    if(f) onPick(f);
    closeModal();
  });
  wire();
  document.getElementById('dtpFakturPickerSearch').oninput = (e) => {
    const q = e.target.value.trim().toLowerCase();
    const list = src.filter(f => !q || f.no.toLowerCase().includes(q) || (f.customerNama||'').toLowerCase().includes(q));
    document.getElementById('dtpFakturPickerBody').innerHTML = tplDtpFakturPickerRows(list);
    wire();
  };
}
