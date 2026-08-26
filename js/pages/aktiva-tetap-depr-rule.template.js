/* =========================================================
   TEMPLATE (HTML saja) — Aktiva Tetap Depr Rule (Aktiva Tetap >
   Master & Setting > Rumus Penyusutan, page:
   'aktivaTetapDeprRule'). Semua fungsi di file ini HANYA
   menyusun & mengembalikan markup HTML (string), TIDAK ada
   logic/DOM-binding/data mutation di sini. Logic-nya ada di
   file sebelah: aktiva-tetap-depr-rule.js

   Sebelumnya tidak ada menunya sama sekali. Dibangun 2026-08-26
   sesuai 2 screenshot MASERP: list "Daftar Master Aktiva Tetap
   Dept Rule" (page-size 100, kolom Kode Kelompok/Golongan/
   Keterangan/Kelompok Aktiva[Fiskal/Komersial]/Ubah/Hapus,
   +Tambah) & form full page "Aktiva Tetap Depr Rule" (dark
   header + Tutorial, field Kode Golongan/Tarif Susut Straight
   Line %/Tarif Susut Declining Balance %/Kode Kelompok/Masa
   Susut (Tahun)/Keterangan — pola field-table sama Gudang/
   Cabang, BUKAN modal).

   24 baris data PERSIS screenshot list — lihat komentar besar
   di atas DATA.aktivaTetapDeprRule di js/data.js utk detail
   lengkap (termasuk kenapa field "Kelompok Aktiva" ditambahkan
   sbg radio di form walau tidak kelihatan di crop screenshot
   form, dan formula Tarif Susut SL=100/masaSusut & DB=200/
   masaSusut yang diverifikasi cocok 2 baris contoh nyata di
   screenshot). Tarif SL/DB READONLY di form — dihitung reaktif
   setiap field "Masa Susut (Tahun)" diubah (lihat atDeprTarif()
   di aktiva-tetap-depr-rule.js), TIDAK bisa diketik manual
   (konsisten dgn semantik screenshot yang jelas 100/8=12.50%
   utk masa 8 Thn). */

const ADR_KODE_GOLONGAN_LIST = ['Bukan bangunan', 'Bangunan Permanen', 'Bangunan Tidak Permanen'];

function tplAdrListPage(){
  return `
    <div class="breadcrumb">Home / <b>Daftar Master Aktiva Tetap Dept Rule</b></div>
    <div class="card">
      <div class="card-header dark-header">
        <h3>${icon('percent',15)} Daftar Master Aktiva Tetap Dept Rule</h3>
        <button class="btn-primary" id="btnAdrAdd">${icon('plus',14)} Tambah</button>
      </div>
      <div class="table-toolbar">
        <select id="adrPageSize"><option>20</option><option>50</option><option selected>100</option></select>
        <input type="text" id="adrSearch" placeholder="Pencarian Global">
      </div>
      <div class="table-wrap"><table>
        <thead><tr>
          <th>Kode Kelompok</th>
          <th>Golongan</th>
          <th>Keterangan</th>
          <th>Kelompok Aktiva</th>
          <th style="width:70px;">Ubah</th>
          <th style="width:70px;">Hapus</th>
        </tr></thead>
        <tbody id="adrTbody"></tbody>
      </table></div>
      <div class="table-footer"><div class="pager"><button>First</button><button>Previous</button><button class="active">1</button><button>Next</button><button>Last</button></div><div id="adrTotal"></div></div>
    </div>`;
}

function tplAdrRows(rows){
  if(!rows.length) return `<tr><td colspan="6" style="color:var(--text-light);text-align:center;">Tidak Ada Data</td></tr>`;
  return rows.map((r) => {
    const idx = DATA.aktivaTetapDeprRule.indexOf(r);
    return `
    <tr>
      <td><a href="#" class="row-link" data-edit="${idx}" style="color:var(--blue);font-weight:600;">${r.kodeKelompok}</a></td>
      <td>${r.golongan}</td>
      <td>${r.keterangan}</td>
      <td>${r.kelompokAktiva}</td>
      <td><button class="icon-btn edit" data-edit="${idx}" title="Ubah">${icon('edit',15)}</button></td>
      <td><button class="icon-btn del" data-del="${idx}" title="Hapus">${icon('trash',15)}</button></td>
    </tr>`;
  }).join('');
}

function tplAdrForm(mode, row, tarif){
  const isEdit = mode === 'edit';
  const title = isEdit ? 'Aktiva Tetap Depr Rule' : '+ Aktiva Tetap Depr Rule';
  return `
    <div class="breadcrumb">Home / Daftar Master Aktiva Tetap Dept Rule / <b>${isEdit?'Ubah':'Tambah'}</b></div>
    <div class="card">
      <div class="card-header dark-header">
        <h3>${icon(isEdit?'edit':'plus', 15)} ${title}</h3>
        <button class="btn-danger" id="btnAdrTutorial" type="button">${icon('card',14)} Tutorial</button>
      </div>
      <div class="card-body">
        <div class="grid-2" style="gap:24px;">
          <table class="field-table">
            <tr>
              <td class="flabel">Kode Golongan</td>
              <td><select id="fAdrKodeGolongan">${ADR_KODE_GOLONGAN_LIST.map(g=>`<option ${row.kodeGolongan===g?'selected':''}>${g}</option>`).join('')}</select></td>
            </tr>
            <tr>
              <td class="flabel">Tarif Susut Straight Line (%)</td>
              <td><input type="text" id="fAdrTarifSL" value="${tarif.sl.toFixed(2).replace('.',',')}" readonly style="text-align:right;background:#f4f6fb;color:var(--text-light);"></td>
            </tr>
            <tr>
              <td class="flabel">Tarif Susut Declining Balance (%)</td>
              <td><input type="text" id="fAdrTarifDB" value="${tarif.db.toFixed(2).replace('.',',')}" readonly style="text-align:right;background:#f4f6fb;color:var(--text-light);"></td>
            </tr>
            <tr>
              <td class="flabel">Kode Kelompok</td>
              <td><input type="text" id="fAdrKodeKelompok" value="${row.kodeKelompok||''}" placeholder="Contoh: PERALATAN KANTOR 3" ${isEdit?'readonly style="background:#f4f6fb;color:var(--text-light);"':''}></td>
            </tr>
          </table>
          <table class="field-table">
            <tr>
              <td class="flabel">Masa Susut (Tahun)</td>
              <td><input type="number" id="fAdrMasaSusut" value="${row.masaSusut||''}" min="1"></td>
            </tr>
            <tr>
              <td class="flabel">Kelompok Aktiva</td>
              <td>
                <label><input type="radio" name="fAdrKelompokAktiva" value="Fiskal" ${row.kelompokAktiva==='Fiskal'?'checked':''}> Fiskal</label>
                &nbsp;&nbsp;
                <label><input type="radio" name="fAdrKelompokAktiva" value="Komersial" ${row.kelompokAktiva!=='Fiskal'?'checked':''}> Komersial</label>
              </td>
            </tr>
            <tr>
              <td class="flabel">Keterangan</td>
              <td><textarea id="fAdrKeterangan" class="po-textarea">${row.keterangan||''}</textarea></td>
            </tr>
          </table>
        </div>
        <div class="form-error" id="fAdrKodeErr" style="display:none;">Kode Kelompok wajib diisi &amp; unik</div>
        <div class="form-page-actions">
          <button class="btn-secondary" id="btnAdrCancel">Batalkan</button>
          <button class="btn-primary" id="btnAdrSave">Simpan</button>
        </div>
      </div>
    </div>`;
}

function tplAdrDeleteConfirm(row){
  return `
    <div class="modal-box">
      <div class="modal-header"><span>Hapus Aktiva Tetap Depr Rule</span><span class="close" id="modalClose">&times;</span></div>
      <div class="modal-body"><p>Yakin ingin menghapus kelompok <b>${row.kodeKelompok}</b> — ${row.keterangan}?</p></div>
      <div class="modal-footer">
        <button class="btn-secondary" id="modalCancel">Batal</button>
        <button class="btn-danger" id="modalDelete">Hapus</button>
      </div>
    </div>`;
}
