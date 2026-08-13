/* =========================================================
   TEMPLATE (HTML saja) — Master Gudang (Persediaan Barang >
   Master & Setting > Gudang). Semua fungsi di file ini HANYA
   menyusun & mengembalikan markup HTML (string), TIDAK ada
   logic/DOM-binding/data mutation di sini. Logic-nya ada di
   file sebelah: gudang.js

   Sesuai 2 screenshot MASERP yang dikirim user 2026-08-12
   (lanjutan setelah Invoice): "Daftar Gudang" (list, kolom Kode
   Gudang/Nama Gudang/Keterangan/Ubah/Hapus, Total Record: 29)
   dan "+ Gudang" (form Tambah, full page, header dark + tombol
   merah "Tutorial" — pola sama seperti Jurnal Pembelian/Kategori
   Barang/Picking List, BUKAN modal, walau field-nya tidak terlalu
   banyak — dipilih full page karena screenshot aslinya juga jelas
   full page dengan header "+ Gudang" + Tutorial, bukan popup kecil).

   8-cabang & mapping kode gudang (GDG_CABANG_LIST/GDG_CABANG_CODE)
   di-COPY VERBATIM dari PKL_CABANG_LIST/PKL_GUDANG_BY_CABANG
   (Picking List) supaya kode gudang 00-07 di Gudang, Picking List,
   & Invoice konsisten satu sama lain (lihat catatan lengkap di
   js/data.js, DATA.gudang) — screenshot asli "Daftar Gudang" MASERP
   kebetulan pakai mapping cabang yang berbeda (01=Sidoarjo,
   02=Semarang, 03=Tangerang), SENGAJA diabaikan demi konsistensi.
========================================================= */
const GDG_CABANG_LIST = ['Head Office','Surabaya','Bandung','Tangerang','Medan','Makassar','Semarang','Sidoarjo'];
const GDG_CABANG_CODE = {'Head Office':'00','Surabaya':'01','Bandung':'02','Tangerang':'03','Medan':'04','Makassar':'05','Semarang':'06','Sidoarjo':'07'};

function tplGudangListPage(){
  return `
    <div class="breadcrumb">Home / <b>Gudang</b></div>
    <div class="card">
      <div class="card-header dark-header">
        <h3>${icon('box',15)} Daftar Gudang</h3>
        <button class="btn-primary" id="btnGdgAdd">${icon('plus',14)} Tambah</button>
      </div>
      <div class="table-toolbar">
        <select><option selected>10</option><option>25</option><option>50</option></select>
        <input type="text" placeholder="Pencarian Global">
      </div>
      <div class="table-wrap"><table>
        <thead><tr>
          <th>Kode Gudang</th>
          <th>Nama Gudang</th>
          <th>Keterangan</th>
          <th>Ubah</th>
          <th>Hapus</th>
        </tr></thead>
        <tbody id="gdgTbody"></tbody>
      </table></div>
      <div class="table-footer"><div class="pager"><button>First</button><button>Previous</button><button class="active">1</button><button>Next</button><button>Last</button></div><div id="gdgTotal"></div></div>
    </div>`;
}

function tplGdgRows(rows){
  return rows.map((r,i)=>`
    <tr>
      <td><span style="color:var(--blue);font-weight:600;">${r.kode}</span></td>
      <td>${r.nama||''}</td>
      <td>${r.keterangan||''}</td>
      <td><button class="icon-btn edit" data-edit="${i}" title="Ubah">${icon('edit',15)}</button></td>
      <td><button class="icon-btn del" data-del="${i}" title="Hapus">${icon('trash',15)}</button></td>
    </tr>`).join('');
}

function tplGudangForm(mode, row){
  const isAdd = mode === 'add';
  const titleAction = isAdd ? '+ Gudang' : 'Ubah Gudang';
  return `
    <div class="breadcrumb">Home / Gudang / <b>${isAdd?'Tambah':'Ubah'}</b></div>
    <div class="card">
      <div class="card-header dark-header">
        <h3>${icon(isAdd?'plus':'edit',15)} ${titleAction}</h3>
        <button class="btn-danger" id="btnGdgTutorial" type="button">${icon('card',14)} Tutorial</button>
      </div>
      <div class="card-body">
        <table class="field-table">
          <tr>
            <td class="flabel">Kode Gudang</td>
            <td><input type="text" id="fGdgKode" value="${row.kode||''}" disabled></td>
          </tr>
          <tr>
            <td class="flabel">Nama Gudang</td>
            <td><input type="text" id="fGdgNama" value="${row.nama||''}"></td>
          </tr>
          <tr>
            <td class="flabel">Nama Kepala Gudang</td>
            <td><input type="text" id="fGdgKepala" value="${row.kepalaGudang||''}" placeholder="Nama Kepala Gudang"></td>
          </tr>
          <tr>
            <td class="flabel">Keterangan</td>
            <td><input type="text" id="fGdgKeterangan" value="${row.keterangan||''}" placeholder="Keterangan"></td>
          </tr>
          <tr>
            <td class="flabel">Default</td>
            <td><input type="checkbox" id="fGdgDefault" ${row.default?'checked':''}></td>
          </tr>
          <tr>
            <td class="flabel">Pilih Cabang</td>
            <td><select id="fGdgCabang">${GDG_CABANG_LIST.map(c=>`<option ${row.cabang===c?'selected':''}>${c}</option>`).join('')}</select></td>
          </tr>
          <tr>
            <td class="flabel">Gudang Transit</td>
            <td><input type="checkbox" id="fGdgTransit" ${row.gudangTransit?'checked':''}></td>
          </tr>
          <tr>
            <td class="flabel">Near ED</td>
            <td><input type="checkbox" id="fGdgNearED" ${row.nearED?'checked':''}></td>
          </tr>
          <tr>
            <td class="flabel">Reject</td>
            <td><input type="checkbox" id="fGdgReject" ${row.reject?'checked':''}></td>
          </tr>
          <tr>
            <td class="flabel">Gudang Cadangan</td>
            <td>
              <input type="checkbox" id="fGdgCadangan" ${row.gudangCadangan?'checked':''}>
              <span style="margin-left:16px;color:var(--text);">Hari Peringatan</span>
              <input type="number" id="fGdgHariPeringatan" min="0" value="${row.hariPeringatan!=null?row.hariPeringatan:''}" style="width:80px;margin-left:8px;${row.gudangCadangan?'':'display:none;'}">
            </td>
          </tr>
          <tr>
            <td class="flabel">Konsinyasi</td>
            <td><input type="checkbox" id="fGdgKonsinyasi" ${row.konsinyasi?'checked':''}></td>
          </tr>
        </table>
      </div>
      <div class="form-page-actions">
        <button class="btn-primary" id="gdgSave">Simpan</button>
        <a href="#" id="gdgCancel">Batalkan</a>
      </div>
    </div>`;
}

function tplGdgDeleteConfirm(row){
  return `
    <div class="modal-box">
      <div class="modal-header"><span>Hapus Gudang</span><span class="close" id="modalClose">&times;</span></div>
      <div class="modal-body"><p>Yakin ingin menghapus gudang <b>${row.kode}</b> — ${row.nama||''}?</p></div>
      <div class="modal-footer">
        <button class="btn-secondary" id="modalCancel">Batal</button>
        <button class="btn-danger" id="modalDelete">Hapus</button>
      </div>
    </div>`;
}

function tplGdgInfoModal(title, text){
  return `
    <div class="modal-box">
      <div class="modal-header"><span>${title}</span><span class="close" id="modalClose">&times;</span></div>
      <div class="modal-body"><p>${text}</p></div>
      <div class="modal-footer">
        <button class="btn-primary" id="modalCancel">Tutup</button>
      </div>
    </div>`;
}
