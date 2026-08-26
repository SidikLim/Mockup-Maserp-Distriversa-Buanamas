/* =========================================================
   TEMPLATE (HTML saja) — Master Fixed Asset (Aktiva Tetap >
   Master & Setting > Fixed Asset, page:'aktivaTetap' —
   MENGGANTIKAN renderer generik read-only lama, lihat catatan
   besar di atas DATA.aktivaTetap di js/data.js). Semua fungsi
   di file ini HANYA menyusun & mengembalikan markup HTML
   (string), TIDAK ada logic/DOM-binding/data mutation di sini.
   Logic-nya ada di file sebelah: fixed-asset.js

   Sesuai 2 screenshot MASERP 2026-08-26: list "Daftar Aktiva
   Tetap" (toolbar Generate Fixed Asset/Tambah/Impor Fixed
   Asset, kolom Kode Asset/Nama Aset/Cabang/Tgl Mulai Susut/
   Lokasi/Nilai/Status[toggle]/Ubah/Hapus/Delete Generate Fixed
   Asset) & form full page "Master Fixed Asset" (checkbox "Aset
   Ini Tidak Memiliki Penyusutan", field kiri Cabang/Kode Aset/
   Nama Aset/Spesifikasi/Merek/Tgl.Beli/Tgl Mulai Susut/Harga
   Beli Aset/Barcode/Status+Ubah Status, field kanan Metode
   Penyusutan/Kelompok Aktiva/Kode Golongan/Aturan Penyusutan/
   Nilai Susut/Masa Susut/Nilai Residu, sub-section "Lokasi
   Aset" & "Jurnal", footer Duplicate/Simpan/Batalkan).

   "Generate Fixed Asset" & "Impor Fixed Asset" (toolbar) serta
   "Delete Generate Fixed Asset" (kolom list) DIBUAT DEKORATIF
   (modal info) — di MASERP asli ketiganya terhubung ke modul
   Pembelian Aktiva Tetap (Generate Fixed Asset dari transaksi
   pembelian) yang masih placeholder di mockup ini, jadi tidak
   ada sumber data nyata utk dihubungkan. "Duplicate" (footer
   form) juga dekoratif (disederhanakan, konsisten pola tombol
   lanjutan lain yang belum ada alur sumbernya di mockup ini).

   FA_CABANG_LIST — SALINAN LOKAL 8-cabang standar app ini (pola
   sama CST_CABANG_LIST/GDG_CABANG_LIST), bukan reference cross-
   file. Kode Aset format "{lokasiKode}-{3huruf}{3digit}" (Contoh
   00-KDR001) — prefix dropdown "FAM01" di kiri field Kode Aset
   dekoratif (satu-satunya opsi, meniru kode batch/sesi generate
   yang ada di screenshot tapi tidak fungsional di mockup ini). */

const FA_CABANG_LIST = ['Head Office','Surabaya','Bandung','Tangerang','Medan','Makassar','Semarang','Sidoarjo'];
const FA_CABANG_CODE = {'Head Office':'00','Surabaya':'01','Bandung':'02','Tangerang':'03','Medan':'04','Makassar':'05','Semarang':'06','Sidoarjo':'07'};

function tplFaListPage(){
  return `
    <div class="breadcrumb">Home / <b>Daftar Aktiva Tetap</b></div>
    <div class="card">
      <div class="card-header dark-header">
        <h3>${icon('truck',15)} Daftar Aktiva Tetap</h3>
        <div class="toolbar-actions">
          <button class="btn-outline" id="btnFaGenerate">${icon('refreshCw',13)} Generate Fixed Asset</button>
          <button class="btn-primary" id="btnFaAdd">${icon('plus',14)} Tambah</button>
          <button class="btn-outline" id="btnFaImpor">${icon('file',13)} Impor Fixed Asset</button>
        </div>
      </div>
      <div class="table-toolbar">
        <select id="faPageSize"><option selected>10</option><option>25</option><option>50</option></select>
        <input type="text" id="faSearch" placeholder="Pencarian Global">
      </div>
      <div class="table-wrap"><table>
        <thead><tr>
          <th>Kode Asset</th>
          <th>Nama Aset</th>
          <th>Cabang</th>
          <th>Tgl Mulai Susut</th>
          <th>Lokasi</th>
          <th class="text-right">Nilai</th>
          <th>Status</th>
          <th style="width:70px;">Ubah</th>
          <th style="width:70px;">Hapus</th>
          <th style="width:90px;">Delete Generate Fixed Asset</th>
        </tr></thead>
        <tbody id="faTbody"></tbody>
      </table></div>
      <div class="table-footer"><div class="pager" id="faPager"></div><div id="faTotal"></div></div>
    </div>`;
}

function tplFaRows(rows){
  if(!rows.length) return `<tr><td colspan="10" style="color:var(--text-light);text-align:center;">Tidak Ada Data</td></tr>`;
  return rows.map((r) => {
    const idx = DATA.aktivaTetap.indexOf(r);
    const lokasi = faLokasiNamaOf(r.lokasiKode);
    const isActive = r.status !== 'Non Active';
    return `
    <tr>
      <td><a href="#" class="row-link" data-edit="${idx}" style="color:var(--blue);font-weight:600;">${r.kode}</a></td>
      <td>${r.nama}</td>
      <td>(${FA_CABANG_CODE[r.cabang]||'00'}) ${r.cabang}</td>
      <td>${r.tglMulaiSusut}</td>
      <td>${lokasi}</td>
      <td class="text-right">${num(r.hargaBeli)}</td>
      <td><button class="btn-status-toggle ${isActive?'active':'nonactive'}" data-toggle="${idx}">${isActive?'Non Active':'Active'}</button></td>
      <td><button class="icon-btn edit" data-edit="${idx}" title="Ubah">${icon('edit',15)}</button></td>
      <td><button class="icon-btn del" data-del="${idx}" title="Hapus">${icon('trash',15)}</button></td>
      <td><button class="icon-btn del" data-delgen="${idx}" title="Delete Generate Fixed Asset">${icon('trash',15)}</button></td>
    </tr>`;
  }).join('');
}

function tplFaPager(page, totalPages){
  if(totalPages <= 1) return '';
  const windowSize = 7;
  let start = Math.max(1, page - Math.floor(windowSize/2));
  let end = Math.min(totalPages, start + windowSize - 1);
  start = Math.max(1, end - windowSize + 1);
  let nums = '';
  for(let p = start; p <= end; p++){
    nums += `<button class="${p===page?'active':''}" data-fapage="${p}">${p}</button>`;
  }
  return `
    <button data-fapage="1" ${page<=1?'disabled':''}>First</button>
    <button data-fapage="${Math.max(1,page-1)}" ${page<=1?'disabled':''}>Previous</button>
    ${nums}
    <button data-fapage="${Math.min(totalPages,page+1)}" ${page>=totalPages?'disabled':''}>Next</button>
    <button data-fapage="${totalPages}" ${page>=totalPages?'disabled':''}>Last</button>`;
}

/* ---------- Form "Master Fixed Asset" ---------- */
function tplFaLeftFields(row){
  return `
    <table class="field-table">
      <tr><td class="flabel">Cabang</td><td><select id="fFaCabang">${FA_CABANG_LIST.map(c=>`<option ${row.cabang===c?'selected':''}>${c}</option>`).join('')}</select></td></tr>
      <tr><td class="flabel">Kode Aset</td><td>
        <div class="field-pair">
          <select id="fFaKodePrefix" disabled><option selected>FAM01</option></select>
          <input type="text" id="fFaKode" value="${row.kode||''}" placeholder="Contoh: 00-KDR025" ${row.kode?'readonly style="background:#f4f6fb;color:var(--text-light);"':''}>
        </div>
      </td></tr>
      <tr><td class="flabel">Nama Aset</td><td><input type="text" id="fFaNama" value="${row.nama||''}"></td></tr>
      <tr><td class="flabel">Spesifikasi</td><td><input type="text" id="fFaSpesifikasi" value="${row.spesifikasi||''}" placeholder="Spesifikasi"></td></tr>
      <tr><td class="flabel">Merek</td><td><input type="text" id="fFaMerek" value="${row.merek||''}" placeholder="Merek"></td></tr>
      <tr><td class="flabel">Tgl.Beli</td><td>
        <div class="input-with-btn"><input type="text" id="fFaTglBeli" value="${row.tglBeli||''}" placeholder="dd/mm/yyyy"><button class="icon-btn edit" type="button">${icon('calendar',14)}</button></div>
      </td></tr>
      <tr><td class="flabel">Tgl Mulai Susut</td><td>
        <div class="input-with-btn"><input type="text" id="fFaTglMulaiSusut" value="${row.tglMulaiSusut||''}" placeholder="dd/mm/yyyy"><button class="icon-btn edit" type="button">${icon('calendar',14)}</button></div>
      </td></tr>
      <tr><td class="flabel">Harga Beli Aset</td><td><input type="number" id="fFaHargaBeli" value="${row.hargaBeli||0}" style="text-align:right;"></td></tr>
      <tr><td class="flabel">Barcode</td><td><input type="text" id="fFaBarcode" value="${row.barcode||''}" placeholder="Barcode"></td></tr>
      <tr><td class="flabel">Status</td><td>
        <span id="fFaStatusLabel" style="margin-right:10px;font-weight:600;">${row.status||'Active'}</span>
        <button class="btn-primary" id="btnFaUbahStatus" type="button">Ubah Status</button>
      </td></tr>
    </table>`;
}

function tplFaRightFields(row, aturan, dis){
  dis = dis || '';
  return `
    <table class="field-table">
      <tr><td class="flabel">Metode Penyusutan</td><td>
        <label><input type="radio" name="fFaMetode" value="Straight Line" ${row.metodePenyusutan!=='Declining Balance'?'checked':''} ${dis}> Straight Line</label>
        &nbsp;&nbsp;
        <label><input type="radio" name="fFaMetode" value="Declining Balance" ${row.metodePenyusutan==='Declining Balance'?'checked':''} ${dis}> Declining Balance</label>
      </td></tr>
      <tr><td class="flabel">Kelompok Aktiva</td><td>
        <label><input type="radio" name="fFaKelompokAktiva" value="Fiskal" ${row.kelompokAktiva==='Fiskal'?'checked':''} ${dis}> Fiskal</label>
        &nbsp;&nbsp;
        <label><input type="radio" name="fFaKelompokAktiva" value="Komersial" ${row.kelompokAktiva!=='Fiskal'?'checked':''} ${dis}> Komersial</label>
      </td></tr>
      <tr><td class="flabel">Kode Golongan</td><td><input type="text" id="fFaKodeGolongan" value="${aturan?aturan.kodeGolongan:''}" readonly style="background:#f4f6fb;color:var(--text-light);"></td></tr>
      <tr><td class="flabel">Aturan Penyusutan</td><td>
        <div class="input-with-btn">
          <input type="text" id="fFaAturan" value="${aturan?aturan.keterangan:''}" readonly placeholder="Pilih Aturan Penyusutan...">
          <button class="icon-btn edit" id="btnFaAturanPick" type="button" ${dis}>${icon('search',14)}</button>
        </div>
      </td></tr>
      <tr><td class="flabel">Nilai Susut</td><td><input type="text" id="fFaNilaiSusut" value="${aturan?atDeprTarifFa(aturan.masaSusut).sl.toFixed(2).replace('.',','):'0,00'} %" readonly style="text-align:right;background:#f4f6fb;color:var(--text-light);"></td></tr>
      <tr><td class="flabel">Masa Susut</td><td><input type="text" id="fFaMasaSusut" value="${aturan?aturan.masaSusut+' Tahun':''}" readonly style="background:#f4f6fb;color:var(--text-light);"></td></tr>
      <tr><td class="flabel">Nilai Residu</td><td><input type="number" id="fFaNilaiResidu" value="${row.nilaiResidu||0}" style="text-align:right;" ${dis}></td></tr>
    </table>`;
}

function tplFaLokasiSection(row){
  return `
    <h3 style="color:var(--navy);font-size:14px;font-weight:700;padding-bottom:10px;border-bottom:1px solid var(--border);margin:22px 0 14px;display:flex;align-items:center;gap:8px;">Lokasi Aset ${icon('edit',13)}</h3>
    <table class="field-table">
      <tr><td class="flabel">Tgl. Perpindahan</td><td>
        <div class="input-with-btn"><input type="text" id="fFaTglPerpindahan" value="${row.tglPerpindahan||'01/01/0001'}"><button class="icon-btn edit" type="button">${icon('calendar',14)}</button></div>
      </td></tr>
      <tr><td class="flabel">Lokasi Aset</td><td><select id="fFaLokasi">${DATA.lokasiAset.map(l=>`<option value="${l.kode}" ${row.lokasiKode===l.kode?'selected':''}>${l.nama}</option>`).join('')}</select></td></tr>
      <tr><td class="flabel">Penanggung Jawab</td><td><input type="text" id="fFaPenanggungJawab" value="${row.penanggungJawab||''}" placeholder="Penanggung Jawab"></td></tr>
      <tr><td class="flabel">Pemakai Asset</td><td><input type="text" id="fFaPemakaiAsset" value="${row.pemakaiAsset||''}" placeholder="Pemakai Asset"></td></tr>
    </table>
    <div style="text-align:right;margin:-4px 0 6px;"><button class="btn-primary" id="btnFaLokasiUpdate" type="button">Update</button></div>`;
}

function tplFaJurnalSection(row){
  return `
    <h3 style="color:var(--navy);font-size:14px;font-weight:700;padding-bottom:10px;border-bottom:1px solid var(--border);margin:22px 0 14px;">Jurnal</h3>
    <div class="grid-2" style="gap:24px;">
      <div>
        <label style="font-weight:600;font-size:12.5px;">Kode G.L. Biaya Susut</label>
        <div class="input-with-btn" style="margin:6px 0 4px;">
          <input type="text" id="fFaGlBiayaSusut" value="${row.glBiayaSusut||''}" readonly>
          <button class="icon-btn edit" id="btnFaGlBiayaSusutPick" type="button">${icon('search',14)}</button>
        </div>
        <div id="fFaGlBiayaSusutCaption" style="color:var(--text-light);font-size:12px;">${faAkunNamaOfTpl(row.glBiayaSusut)}</div>
      </div>
      <div>
        <label style="font-weight:600;font-size:12.5px;">Kode G.L. Akm. Susut</label>
        <div class="input-with-btn" style="margin:6px 0 4px;">
          <input type="text" id="fFaGlAkmSusut" value="${row.glAkmSusut||''}" readonly>
          <button class="icon-btn edit" id="btnFaGlAkmSusutPick" type="button">${icon('search',14)}</button>
        </div>
        <div id="fFaGlAkmSusutCaption" style="color:var(--text-light);font-size:12px;">${faAkunNamaOfTpl(row.glAkmSusut)}</div>
      </div>
    </div>`;
}

function tplFaForm(mode, row, aturan){
  const isEdit = mode === 'edit';
  const dis = row.tidakPenyusutan ? 'disabled' : '';
  return `
    <div class="breadcrumb">Home / Daftar Aktiva Tetap / <b>${isEdit?'Ubah':'Tambah'}</b></div>
    <div class="card">
      <div class="card-header dark-header">
        <h3>${icon(isEdit?'edit':'plus', 15)} Master Fixed Asset</h3>
        <button class="btn-danger" id="btnFaTutorial" type="button">${icon('card',14)} Tutorial</button>
      </div>
      <div class="card-body">
        <div class="form-group" style="margin-bottom:16px;">
          <label><input type="checkbox" id="fFaTidakSusut" ${row.tidakPenyusutan?'checked':''}> Aset Ini Tidak Memiliki Penyusutan</label>
        </div>
        <div class="grid-2" style="gap:24px;">
          ${tplFaLeftFields(row)}
          <div id="fFaRightWrap">${tplFaRightFields(row, aturan, dis)}</div>
        </div>
        ${tplFaLokasiSection(row)}
        ${tplFaJurnalSection(row)}
        <div class="form-error" id="fFaErr" style="display:none;"></div>
        <div class="form-page-actions">
          <button class="btn-outline" id="btnFaDuplicate" type="button">Duplicate</button>
          <button class="btn-secondary" id="btnFaCancel">Batalkan</button>
          <button class="btn-primary" id="btnFaSave">Simpan</button>
        </div>
      </div>
    </div>`;
}

/* Picker "Aturan Penyusutan" — ke DATA.aktivaTetapDeprRule, difilter
   oleh radio Kelompok Aktiva yang sedang dipilih di form. */
function tplFaAturanPicker(list){
  if(!list.length) return `
    <div class="modal-box" style="max-width:560px;">
      <div class="modal-header"><span>Pilih Aturan Penyusutan</span><span class="close" id="pickerClose">&times;</span></div>
      <div class="modal-body"><p style="color:var(--text-light);">Tidak ada Aturan Penyusutan utk kelompok aktiva ini.</p></div>
      <div class="modal-footer"><button class="btn-secondary" id="pickerCancel">Tutup</button></div>
    </div>`;
  return `
    <div class="modal-box" style="max-width:560px;">
      <div class="modal-header"><span>Pilih Aturan Penyusutan</span><span class="close" id="pickerClose">&times;</span></div>
      <div class="modal-body">
        <div class="table-wrap" style="max-height:360px;overflow:auto;"><table>
          <thead><tr><th>Kode Kelompok</th><th>Keterangan</th><th></th></tr></thead>
          <tbody>${list.map(a=>`<tr><td>${a.kodeKelompok}</td><td>${a.keterangan}</td><td><button class="btn-pick" data-pick-aturan="${a.kodeKelompok}">Pilih</button></td></tr>`).join('')}</tbody>
        </table></div>
      </div>
      <div class="modal-footer"><button class="btn-secondary" id="pickerCancel">Tutup</button></div>
    </div>`;
}

function tplFaAkunPicker(list, target){
  if(!list.length) return `<tr><td colspan="3" style="color:var(--text-light);">Tidak ada akun ditemukan</td></tr>`;
  return `
    <div class="modal-box" style="max-width:640px;">
      <div class="modal-header"><span>Pilih Akun GL</span><span class="close" id="pickerClose">&times;</span></div>
      <div class="modal-body">
        <input type="text" id="faAkunPickerSearch" placeholder="Cari kode / nama akun..." style="width:100%;border:1px solid var(--border);border-radius:6px;padding:8px 10px;font-size:12.8px;margin-bottom:12px;">
        <div class="table-wrap" style="max-height:360px;overflow:auto;">
          <table>
            <thead><tr><th>Kode</th><th>Nama Akun</th><th></th></tr></thead>
            <tbody id="faAkunPickerBody">${tplFaAkunPickerRows(list, target)}</tbody>
          </table>
        </div>
      </div>
      <div class="modal-footer"><button class="btn-secondary" id="pickerCancel">Tutup</button></div>
    </div>`;
}

function tplFaAkunPickerRows(list, target){
  if(!list.length) return `<tr><td colspan="3" style="color:var(--text-light);">Tidak ada akun ditemukan</td></tr>`;
  return list.map(a=>`
    <tr>
      <td>${a.kode}</td>
      <td>${a.nama}</td>
      <td><button class="btn-pick" data-pick-akun="${a.kode}" data-target="${target}">Pilih</button></td>
    </tr>`).join('');
}

function tplFaDeleteConfirm(row){
  return `
    <div class="modal-box">
      <div class="modal-header"><span>Hapus Aktiva Tetap</span><span class="close" id="modalClose">&times;</span></div>
      <div class="modal-body"><p>Yakin ingin menghapus aset <b>${row.kode}</b> — ${row.nama}?</p></div>
      <div class="modal-footer">
        <button class="btn-secondary" id="modalCancel">Batal</button>
        <button class="btn-danger" id="modalDelete">Hapus</button>
      </div>
    </div>`;
}

function tplFaInfoModal(title, text){
  return `
    <div class="modal-box">
      <div class="modal-header"><span>${title}</span><span class="close" id="modalClose">&times;</span></div>
      <div class="modal-body"><p>${text}</p></div>
      <div class="modal-footer"><button class="btn-primary" id="modalOk">Tutup</button></div>
    </div>`;
}
