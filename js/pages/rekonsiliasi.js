/* =========================================================
   LOGIC (JS saja) — Rekonsiliasi (Kas/Bank > Daftar Transaksi).
   Dimuat otomatis (lazy-load) oleh core.js saat menu ini pertama
   kali diklik — lihat PAGE_MODULES di js/core.js. Markup HTML-nya
   ada di file sebelah: rekonsiliasi.template.js (lihat catatan
   desain & aritmetika lengkap di headernya).
   NB: closeModal() dipakai bersama, didefinisikan di core.js.

   Alur inti:
   1) Tambah: pilih Bank (picker DATA.kasBank — Saldo Awal otomatis
      dari saldo bank itu) + Pilih Bulan (No. Rekonsiliasi & Tgl.
      Rekonsiliasi ikut bulan terpilih), lalu tarik baris rincian
      lewat 3 tombol: + Transaksi Kas / + Pelunasan Utang /
      + Penerimaan Piutang — masing-masing mengambil transaksi
      sungguhan berikutnya dari DATA.transaksiKas /
      DATA.pelunasanUtang / DATA.penerimaanPiutang (yang belum
      ditarik ke rincian ini) jadi 1 baris Terima/Keluar.
   2) Checkbox Cek per baris + "centang semua" di header REAKTIF:
      Rekonsiliasi = total (Terima-Keluar) baris tercentang,
      Rekening Koran otomatis mengikuti (Saldo Awal +
      Rekonsiliasi baris TERCENTANG SEMUA — disimulasikan sbg
      saldo menurut bank), Selisih & Jumlah Saldo (Non)
      Rekonsiliasi ikut berubah. Tombol Refresh menghitung ulang
      semuanya.
   3) Simpan -> unshift/replace DATA.rekonsiliasi; Ubah/Lihat/
      Hapus/Cetak dari list (Cetak modal info placeholder). */

var rkState = { search:'' };

function renderRekonsiliasiPage(){
  rkState = { search:'' };
  renderRkList();
}

function renderRkList(){
  content.innerHTML = tplRekonsiliasiListPage();
  document.getElementById('btnRkAdd').onclick = () => openRkForm('add');
  document.getElementById('rkSearch').oninput = (e) => { rkState.search = e.target.value; renderRkTable(); };
  renderRkTable();
}

function rkFilteredRows(){
  const q = rkState.search.trim().toLowerCase();
  if(!q) return DATA.rekonsiliasi || [];
  return (DATA.rekonsiliasi || []).filter(r =>
    r.no.toLowerCase().includes(q) ||
    rkBankLabel(r.bankKode).toLowerCase().includes(q) ||
    (r.tglRekonIso || '').toLowerCase().includes(q));
}

function renderRkTable(){
  const rows = rkFilteredRows();
  const tbody = document.getElementById('rkTbody');
  tbody.innerHTML = tplRkRows(rows);
  document.getElementById('rkTotal').textContent = `Total Record: ${rows.length}`;
  const idxOf = (r) => DATA.rekonsiliasi.indexOf(r);
  tbody.querySelectorAll('[data-view-link]').forEach(b => b.onclick = () => openRkForm('view', idxOf(rows[+b.dataset.viewLink])));
  tbody.querySelectorAll('[data-view]').forEach(b => b.onclick = () => openRkForm('view', idxOf(rows[+b.dataset.view])));
  tbody.querySelectorAll('[data-edit]').forEach(b => b.onclick = () => openRkForm('edit', idxOf(rows[+b.dataset.edit])));
  tbody.querySelectorAll('[data-print]').forEach(b => b.onclick = () => {
    const r = rows[+b.dataset.print];
    openRkInfo('Cetak Rekonsiliasi', `Preview PDF Rekonsiliasi <b>${r.no}</b> akan tersedia di sini.`);
  });
  tbody.querySelectorAll('[data-del]').forEach(b => b.onclick = () => openRkDeleteConfirm(idxOf(rows[+b.dataset.del])));
}

/* Rekonsiliasi = total (Terima-Keluar) baris TERCENTANG; Rekening
   Koran (saldo menurut bank) di mockup = Saldo Awal + total SEMUA
   baris — jadi Selisih = nilai baris yang BELUM dicentang (0 begitu
   semua cocok/tercentang), meniru perilaku layar rekonsiliasi asli. */
function rkTotals(row){
  const items = row.items || [];
  const rekonsiliasi = Math.round(items.filter(it => it.cek).reduce((s,it) => s + (+it.terima||0) - (+it.keluar||0), 0) * 100) / 100;
  const nonRekonsiliasi = Math.round(items.filter(it => !it.cek).reduce((s,it) => s + (+it.terima||0) - (+it.keluar||0), 0) * 100) / 100;
  const saldoRekon = Math.round(((+row.saldoAwal||0) + rekonsiliasi) * 100) / 100;
  const selisih = Math.round(((+row.rekeningKoran||0) - saldoRekon) * 100) / 100;
  return { rekonsiliasi, nonRekonsiliasi, saldoRekon, selisih };
}

/* Rekening Koran mockup = Saldo Awal + total semua baris rincian. */
function rkRecalcRekeningKoran(row){
  const total = (row.items||[]).reduce((s,it) => s + (+it.terima||0) - (+it.keluar||0), 0);
  row.rekeningKoran = Math.round(((+row.saldoAwal||0) + total) * 100) / 100;
}

/* No format screenshot "01/BCA /TGR/I/2026" — {urut 2 digit}/{nama
   bank singkat} /{kode lokasi dari nama rekening}/{romawi bulan}/2026
   (spasi setelah nama bank direproduksi apa adanya). */
function rkGenerateNo(bankKode, bulanIdx){
  const kb = DATA.kasBank.find(x => x.kode === bankKode);
  const tokens = (kb ? kb.nama : '').split(' ');
  const bank = (tokens.find(t => /^(BCA|BNI|BRI|Mandiri)$/i.test(t)) || tokens[0] || 'BANK').toUpperCase();
  const lokasi = (tokens[tokens.length-1] || 'HO').toUpperCase();
  const seq = (DATA.rekonsiliasi || []).filter(r => r.bankKode === bankKode).length + 1;
  return `${String(seq).padStart(2,'0')}/${bank} /${lokasi}/${RK_ROMAWI[bulanIdx]||'I'}/2026`;
}

function rkAkhirBulan(bulanIdx){
  const last = new Date(2026, bulanIdx + 1, 0).getDate();
  return `${String(last).padStart(2,'0')}/${String(bulanIdx+1).padStart(2,'0')}/2026`;
}

function rkBuildEmptyRow(){
  return { no:'', bankKode:'', mataUang:'IDR', bulanIdx:7, tgl: rkAkhirBulan(7), tglRekonIso:'',
    saldoAwal:0, rekeningKoran:0, items: [] };
}

function openRkForm(mode, idx){
  const src = mode === 'add' ? rkBuildEmptyRow() : DATA.rekonsiliasi[idx];
  const row = { ...src, items: (src.items||[]).map(it => ({...it})) };
  content.innerHTML = tplRkForm(mode, row);
  wireRkForm(mode, idx, row);
}

function refreshRkTotalsDOM(row){
  const t = rkTotals(row);
  const set = (id, val) => { const el = document.getElementById(id); if(el) el.value = val; };
  set('fRkRekeningKoran', rkNum2(row.rekeningKoran));
  set('fRkSaldoAwal', rkNum2(row.saldoAwal));
  set('fRkRekonsiliasi', rkNum2(t.rekonsiliasi));
  set('fRkSelisih', rkNum2(t.selisih));
  set('fRkJumlahRekon', rkNum2(t.rekonsiliasi));
  set('fRkJumlahNonRekon', rkNum2(t.nonRekonsiliasi));
}

function refreshRkItemsDOM(row, isView){
  document.getElementById('rkItemsBody').innerHTML = tplRkItemRows(row.items, isView);
  wireRkItemEvents(row);
  rkRecalcRekeningKoran(row);
  refreshRkTotalsDOM(row);
}

function wireRkItemEvents(row){
  (row.items||[]).forEach((it, idx) => {
    const tgl = document.querySelector(`[data-rk-tgl="${idx}"]`);
    if(tgl) tgl.onchange = (e) => { it.tglBank = e.target.value; };
    const ket = document.querySelector(`[data-rk-ket="${idx}"]`);
    if(ket) ket.onchange = (e) => { it.keterangan = e.target.value; };
    const terima = document.querySelector(`[data-rk-terima="${idx}"]`);
    if(terima) terima.onchange = (e) => { it.terima = +e.target.value || 0; rkRecalcRekeningKoran(row); refreshRkTotalsDOM(row); };
    const keluar = document.querySelector(`[data-rk-keluar="${idx}"]`);
    if(keluar) keluar.onchange = (e) => { it.keluar = +e.target.value || 0; rkRecalcRekeningKoran(row); refreshRkTotalsDOM(row); };
    const cek = document.querySelector(`[data-rk-cek="${idx}"]`);
    if(cek) cek.onchange = (e) => { it.cek = e.target.checked; refreshRkTotalsDOM(row); };
    const del = document.querySelector(`[data-rk-del="${idx}"]`);
    if(del) del.onclick = () => { row.items.splice(idx,1); refreshRkItemsDOM(row, false); };
  });
}

/* Tarik 1 transaksi sungguhan berikutnya (yang belum ada di rincian)
   dari sumber masing-masing. */
function rkAddFromKas(row){
  const used = new Set(row.items.map(it => it.noTransaksi));
  const kode = 'HO';
  const arr = DATA.transaksiKas || [];
  let i = -1;
  for(let x = 0; x < arr.length; x++){
    if(!used.has(`26/KAS/${kode}/08/${String(x+1).padStart(5,'0')}`)){ i = x; break; }
  }
  const src = i >= 0 ? arr[i] : null;
  if(!src){ openRkInfo('Transaksi Kas', 'Semua Transaksi Kas sample sudah ditarik ke rincian.'); return; }
  const p = (src.tgl||'').split('-');
  row.items.push({
    tglBank: p.length===3 ? `${p[2]}/${p[1]}/${p[0]}` : (src.tgl||''),
    noTransaksi: `26/KAS/${kode}/08/${String(i+1).padStart(5,'0')}`,
    keterangan: src.ket || 'Transaksi Kas',
    kurs: 1,
    terima: src.tipe === 'Masuk' ? (+src.jumlah||0) : 0,
    keluar: src.tipe === 'Keluar' ? (+src.jumlah||0) : 0,
    cek: true,
  });
  refreshRkItemsDOM(row, false);
}

function rkAddFromUtang(row){
  const used = new Set(row.items.map(it => it.noTransaksi));
  const src = (DATA.pelunasanUtang || []).find(r => !used.has(r.no));
  if(!src){ openRkInfo('Pelunasan Utang', 'Semua Pelunasan Utang sample sudah ditarik ke rincian.'); return; }
  row.items.push({
    tglBank: src.tgl || '',
    noTransaksi: src.no,
    keterangan: src.keterangan || `Pelunasan Utang ${(src.supplierNama||'').toUpperCase()}`,
    kurs: 1,
    terima: 0,
    keluar: +src.totalPembayaran || +src.jumlahKeluarKas || 0,
    cek: true,
  });
  refreshRkItemsDOM(row, false);
}

function rkAddFromPiutang(row){
  const used = new Set(row.items.map(it => it.noTransaksi));
  const src = (DATA.penerimaanPiutang || []).find(r => !used.has(r.no));
  if(!src){ openRkInfo('Penerimaan Piutang', 'Semua Penerimaan Piutang sample sudah ditarik ke rincian.'); return; }
  const terima = +src.totalPenerimaan || +src.jumlahTerima ||
    Math.round((src.fakturs||[]).reduce((s,f) => s + (+f.pembayaran||0), 0) * 100) / 100;
  row.items.push({
    tglBank: src.tgl || '',
    noTransaksi: src.no,
    keterangan: src.keterangan || `Terima Piutang ${(src.customerNama||'').toUpperCase()}`,
    kurs: 1,
    terima: terima,
    keluar: 0,
    cek: true,
  });
  refreshRkItemsDOM(row, false);
}

function wireRkForm(mode, idx, row){
  const isAdd = mode === 'add';
  const isView = mode === 'view';

  document.getElementById('btnRkTutorial').onclick = () => openRkInfo('Tutorial', 'Video tutorial pengisian Rekonsiliasi akan tersedia di sini.');
  document.getElementById('rkBatalkan').onclick = (e) => { e.preventDefault(); renderRkList(); };

  wireRkItemEvents(row);

  const cekSemua = document.getElementById('rkCekSemua');
  if(cekSemua && !isView){
    cekSemua.checked = row.items.length > 0 && row.items.every(it => it.cek);
    cekSemua.onchange = (e) => {
      row.items.forEach(it => { it.cek = e.target.checked; });
      refreshRkItemsDOM(row, false);
    };
  }

  if(isView) return;

  if(isAdd){
    document.getElementById('rkBankSearch').onclick = () => openRkBankPicker(row);
    document.getElementById('fRkBulan').onchange = (e) => {
      row.bulanIdx = +e.target.value;
      row.tgl = rkAkhirBulan(row.bulanIdx);
      document.getElementById('fRkTgl').value = row.tgl;
      if(row.bankKode){
        row.no = rkGenerateNo(row.bankKode, row.bulanIdx);
        document.getElementById('fRkNo').value = row.no;
      }
    };
  }
  document.getElementById('fRkTgl').onchange = (e) => { row.tgl = e.target.value; };

  document.getElementById('rkRefresh').onclick = () => refreshRkItemsDOM(row, false);
  document.getElementById('rkAddKas').onclick = () => rkAddFromKas(row);
  document.getElementById('rkAddUtang').onclick = () => rkAddFromUtang(row);
  document.getElementById('rkAddPiutang').onclick = () => rkAddFromPiutang(row);

  document.getElementById('rkSimpan').onclick = () => {
    if(!row.bankKode){ openRkInfo('Validasi', 'Bank wajib dipilih.'); return; }
    if(!row.items.length){ openRkInfo('Validasi', 'Tarik minimal 1 transaksi ke Rincian Rekonsiliasi.'); return; }
    rkRecalcRekeningKoran(row);
    if(!row.tglRekonIso){
      const p = (row.tgl||'').split('/');
      const jam = new Date();
      row.tglRekonIso = p.length===3
        ? `${p[2]}-${p[1]}-${p[0]}T${String(jam.getHours()).padStart(2,'0')}:${String(jam.getMinutes()).padStart(2,'0')}:${String(jam.getSeconds()).padStart(2,'0')}`
        : '';
    }
    if(mode === 'add'){ DATA.rekonsiliasi.unshift(row); }
    else { DATA.rekonsiliasi[idx] = row; }
    renderRkList();
  };
}

function openRkBankPicker(row){
  closeModal();
  const list = DATA.kasBank.filter(k => (k.tipeRekening||'') !== 'Kas');
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.innerHTML = tplRkBankPicker(list);
  document.body.appendChild(overlay);
  document.getElementById('modalClose').onclick = closeModal;
  document.getElementById('modalCancel').onclick = closeModal;
  overlay.onclick = (e) => { if(e.target === overlay) closeModal(); };

  const wireRows = () => {
    overlay.querySelectorAll('[data-pick-bank]').forEach(btn => btn.onclick = () => {
      const kb = DATA.kasBank.find(x => x.kode === btn.dataset.pickBank);
      if(!kb) return;
      row.bankKode = kb.kode;
      row.mataUang = kb.mataUang || 'IDR';
      row.saldoAwal = Math.round((+kb.saldo || 0) * 100) / 100;
      row.no = rkGenerateNo(kb.kode, row.bulanIdx);
      document.getElementById('fRkBank').value = rkBankLabel(kb.kode);
      document.getElementById('fRkMataUang').value = row.mataUang;
      document.getElementById('fRkNo').value = row.no;
      rkRecalcRekeningKoran(row);
      refreshRkTotalsDOM(row);
      closeModal();
    });
  };
  wireRows();

  document.getElementById('rkBankPickerSearch').oninput = (e) => {
    const q = e.target.value.trim().toLowerCase();
    const filtered = list.filter(k => k.kode.toLowerCase().includes(q) || (k.nama||'').toLowerCase().includes(q) || (k.masterBank||'').toLowerCase().includes(q));
    document.getElementById('rkBankPickerBody').innerHTML = tplRkBankPickerRows(filtered);
    wireRows();
  };
}

function openRkDeleteConfirm(idx){
  closeModal();
  const row = DATA.rekonsiliasi[idx];
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.innerHTML = tplRkDeleteConfirm(row);
  document.body.appendChild(overlay);
  document.getElementById('modalClose').onclick = closeModal;
  document.getElementById('modalCancel').onclick = closeModal;
  overlay.onclick = (e) => { if(e.target === overlay) closeModal(); };
  document.getElementById('modalDelete').onclick = () => {
    DATA.rekonsiliasi.splice(idx, 1);
    closeModal();
    renderRkTable();
  };
}

function openRkInfo(title, text){
  closeModal();
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.innerHTML = tplRkInfoModal(title, text);
  document.body.appendChild(overlay);
  document.getElementById('modalClose').onclick = closeModal;
  document.getElementById('modalOk').onclick = closeModal;
  overlay.onclick = (e) => { if(e.target === overlay) closeModal(); };
}
