/* =========================================================
   TEMPLATE (HTML saja) — Master Customer (Customer & Penjualan >
   Master & Setting > Customer, page 'customers'). Semua fungsi di
   file ini HANYA menyusun & mengembalikan markup HTML (string),
   TIDAK ada logic/DOM-binding/data mutation di sini. Logic-nya ada
   di file sebelah: master-customer.js

   Sesuai 4 screenshot MASERP yang dikirim user 2026-08-18: "Daftar
   Customer" (list, toolbar dengan banyak tombol + checkbox
   "Tampilkan Customer yang Tidak Aktif") dan "+ Customer"/"Customer"
   (form Tambah/Ubah, full page — field TERBANYAK dari semua modul
   master di mockup ini, dikelompokkan dalam banyak section: Personal
   Data, Informasi Customer Induk, Contact Data, Address, Group
   Customer, Status Customer, Legalitas Outlet, Legalitas Pemilik/
   Pimpinan, lalu "Info Akuntansi": Tax Data, Bank, Kredit, GL Data).

   Sebelumnya menu "Customer" (page:'customers') cuma renderer generik
   read-only di js/core.js (cols kode/nama/kota/salesman/limit/status,
   lihat fungsi renderPage()/objek `pages`) — SEKARANG diganti modul
   CRUD PENUH sungguhan, entry generik lama DIHAPUS dari core.js
   (lihat catatan project). DATA.customers (8 baris) TIDAK diganti
   kode/nama/kota/salesman/limit/status/alamat/piutang-nya SAMA SEKALI
   (field-field itu sudah dipakai luas oleh Sales Order/Sales Quotation/
   Invoice/Picking List/Faktur Penjualan Via S.J. — banyak baris sample
   di modul-modul itu hardcode string kode customer ini, kode:'CUST-00X'
   dipertahankan APA ADANYA supaya rantai referensi lintas modul yang
   sudah dibangun sejak 2026-08-11 tidak putus) — field BARU untuk form
   ini (noRef, tglRegistrasi, groupCustomer, badanUsaha, dst — lihat
   komentar besar di atas array DATA.customers di js/data.js) HANYA
   ditambahkan ke tiap baris yang sudah ada, tidak menghapus apa pun.

   Kode Customer format "C000001" pada screenshot SENGAJA TIDAK dipakai
   untuk 8 baris existing (supaya tidak memutus rantai referensi di
   atas) — hanya dipakai sebagai auto-generate untuk customer BARU yang
   ditambah lewat mockup ini (lihat cstNextKode() di master-customer.js),
   dropdown "CS01" di sebelahnya murni dekoratif (label seri kode),
   bukan bagian dari kode yang disimpan — konsisten dengan pola serupa
   di Master Supplier (fKodePrefix dekoratif, tidak selalu ikut
   digabung ke kode akhir).
========================================================= */

const CST_CABANG_LIST = ['Head Office','Surabaya','Bandung','Tangerang','Medan','Makassar','Semarang','Sidoarjo'];
/* Gudang per Cabang — copy verbatim dari SQ_GUDANG_BY_CABANG/PKL_GUDANG_BY_CABANG
   (js/pages/sales-quotation.template.js/picking-list.template.js) supaya kode
   gudang konsisten lintas modul, tanpa bergantung ke file lain yang di-lazy-load
   terpisah (urutan lazy-load antar modul tidak dijamin). */
const CST_GUDANG_BY_CABANG = {
  'Head Office':'(00-GUU) Gudang Utama-HO','Surabaya':'(01-GUU) Gudang Utama-SBY','Bandung':'(02-GUU) Gudang Utama-BDG',
  'Tangerang':'(03-GUU) Gudang Utama-TGR','Medan':'(04-GUU) Gudang Utama-MDN','Makassar':'(05-GUU) Gudang Utama-MKS',
  'Semarang':'(06-GUU) Gudang Utama-SMG','Sidoarjo':'(07-GUU) Gudang Utama-SDA',
};
const CST_GUDANG_LIST = Object.values(CST_GUDANG_BY_CABANG);

/* Wilayah/Area + Rayon — tidak ada modul master Wilayah/Rayon detail di
   mockup ini, jadi disederhanakan jadi 6 entri tetap (kode area gaya
   "JATIM001" + rayon turunannya), dipilih lewat picker lalu mengisi
   Area/Rayon/Provinsi sekaligus. Rayon nama/kode/district REUSE persis
   nilai SQ_RAYON_BY_KOTA (Sales Quotation) supaya "Rayon Jakarta Pusat"
   dst. konsisten kalau nanti dibandingkan lintas modul. */
const CST_AREA_LIST = [
  {area:'DKI001', kota:'Jakarta', provinsi:'DKI Jakarta', rayonKode:'RY-JKT01', rayonNama:'Rayon Jakarta Pusat', rayonDistrict:'Jakarta Pusat'},
  {area:'JATIM001', kota:'Surabaya', provinsi:'Jawa Timur', rayonKode:'RY-SBY01', rayonNama:'Rayon Surabaya Kota', rayonDistrict:'Surabaya'},
  {area:'JABAR001', kota:'Bandung', provinsi:'Jawa Barat', rayonKode:'RY-BDG01', rayonNama:'Rayon Bandung Kota', rayonDistrict:'Bandung'},
  {area:'SUMUT001', kota:'Medan', provinsi:'Sumatera Utara', rayonKode:'RY-MDN01', rayonNama:'Rayon Medan Kota', rayonDistrict:'Medan'},
  {area:'SULSEL001', kota:'Makassar', provinsi:'Sulawesi Selatan', rayonKode:'RY-MKS01', rayonNama:'Rayon Makassar Kota', rayonDistrict:'Makassar'},
  {area:'JATENG001', kota:'Semarang', provinsi:'Jawa Tengah', rayonKode:'RY-SMG01', rayonNama:'Rayon Semarang Kota', rayonDistrict:'Semarang'},
];

const CST_GENDER_LIST = ['Pria','Wanita'];
const CST_AGAMA_LIST = ['Islam','Kristen','Katolik','Hindu','Buddha','Konghucu','Lainnya'];
const CST_TIPE_IDENTITAS_LIST = ['TIN','KTP','Passport'];
const CST_PROFESI_LIST = ['Wiraswasta','Karyawan Swasta','PNS/TNI/POLRI','Lainnya'];
const CST_TYPE_PPN_LIST = ['Eksklusif','Inklusif','Non PKP'];
const CST_KODE_TRANSAKSI_PAJAK_LIST = [
  {kode:'01', label:'01 - Penyerahan yang PPN-nya dipungut sendiri oleh PKP'},
  {kode:'02', label:'02 - Penyerahan yang PPN-nya dipungut Pemungut Bendaharawan'},
  {kode:'03', label:'03 - Penyerahan yang PPN-nya dipungut Pemungut Selain Bendaharawan'},
  {kode:'04', label:'04 - DPP Nilai Lain'},
  {kode:'06', label:'06 - Penyerahan Lainnya'},
  {kode:'07', label:'07 - Penyerahan yang PPN-nya Tidak Dipungut'},
  {kode:'08', label:'08 - Penyerahan yang PPN-nya Dibebaskan'},
  {kode:'09', label:'09 - Penyerahan Aktiva (Pasal 16D)'},
];
const CST_BANK_LIST = ['Bank Mandiri','Bank BCA','Bank BNI','Bank BRI','Bank Danamon','Bank Permata','Bank CIMB Niaga'];

/* Konfigurasi 2 blok Legalitas — dipakai bersama oleh template (render
   sub-grid) dan logic (baca/tulis baris). Fixed (tidak seperti Grup
   Customer yang 6 blok dinamis via checkbox) karena screenshot memang
   selalu menampilkan kedua blok ini apa adanya, tanpa gerbang checkbox. */
const CST_LEGALITAS_OUTLET_SYARAT = ['Nomor Izin Berusaha (NIB)','NPWP','SKPKP','Spesimen Cap/ Stempel Customer'];
const CST_LEGALITAS_PEMILIK_SYARAT = ['KTP','Nama Penanggung Jawab'];

function cstGroupNama(kode){
  const g = DATA.customerGroup.find(x=>x.kode===kode);
  return g ? g.nama : '';
}
function cstBadanUsahaNama(kode){
  const b = DATA.badanUsahaList.find(x=>x.kode===kode);
  return b ? b.nama : '';
}
function cstAkunNama(kode){
  if(!kode) return '';
  const a = DATA.akunGL.find(x=>x.kode===kode);
  return a ? a.nama : '';
}

function tplMasterCustomerListPage(showInactive){
  return `
    <div class="breadcrumb">Home / <b>Customer</b></div>
    <div class="card">
      <div class="card-header dark-header">
        <h3>${icon('users',15)} Daftar Customer</h3>
        <div class="toolbar-actions">
          <button class="btn-danger" id="btnCstAdjustQuota">${icon('refreshCw',14)} Adjust Quota Tanpa DOM</button>
          <button class="btn-teal" id="btnCstGeneratePpn">${icon('refreshCw',14)} Generate Default Type PPN</button>
          <button class="btn-teal" id="btnCstSyncAR">${icon('refreshCw',14)} Sync Status AR Customer</button>
          <button class="btn-outline" id="btnCstUangMuka">${icon('plus',14)} Uang Muka</button>
          <button class="btn-primary" id="btnCstAdd">${icon('plus',14)} Tambah</button>
          <button class="btn-outline" id="btnCstImpor">${icon('file',14)} Impor Customer</button>
          <button class="chip-btn" id="btnCstArea">Semua Area ${icon('chevronDown',13)}</button>
        </div>
      </div>
      <div class="table-toolbar" style="justify-content:space-between;">
        <label style="display:flex;align-items:center;gap:8px;font-size:12.8px;color:var(--text);font-weight:400;">
          <input type="checkbox" id="cstShowInactive" ${showInactive?'checked':''} style="width:auto;"> Tampilkan Customer yang Tidak Aktif
        </label>
        <div style="display:flex;gap:10px;align-items:center;">
          <select id="cstPageSize"><option selected>10</option><option>25</option><option>50</option></select>
          <input type="text" id="cstSearch" placeholder="Pencarian Global">
        </div>
      </div>
      <div class="table-wrap"><table>
        <thead><tr>
          <th>Kode Customer</th>
          <th>Nama Customer</th>
          <th>Grup Customer</th>
          <th>Badan Usaha</th>
          <th>Cabang</th>
          <th>Area</th>
          <th>Rayon</th>
          <th>Salesman</th>
          <th>Alamat</th>
          <th>Status AR Customer</th>
          <th class="text-right">Uang Muka</th>
          <th class="text-right">Saldo Piutang</th>
          <th>Ubah</th>
          <th>Hapus</th>
        </tr></thead>
        <tbody id="cstTbody"></tbody>
      </table></div>
      <div class="table-footer"><div class="pager"><button>First</button><button>Previous</button><button class="active">1</button><button>Next</button><button>Last</button></div><div id="cstTotal"></div></div>
    </div>`;
}

function tplCstStatusARPill(status){
  const cls = status==='Macet' ? 'status-overdue' : 'status-paid';
  return `<span class="status-pill ${cls}">${status||'Lancar'}</span>`;
}

function tplCstRows(rows){
  if(!rows.length) return `<tr><td colspan="14" style="color:var(--text-light);">Tidak Ada Data</td></tr>`;
  return rows.map(r=>{
    const i = DATA.customers.indexOf(r);
    return `
    <tr>
      <td>${r.kode}</td>
      <td>${r.nama}</td>
      <td>${r.groupCustomer||''}</td>
      <td>${r.badanUsaha||''}</td>
      <td>${r.cabang||''}</td>
      <td>${r.area||''}</td>
      <td>${r.rayonNama||''}</td>
      <td>${r.salesman||''}</td>
      <td>${r.alamat||''}</td>
      <td>${tplCstStatusARPill(r.statusARCustomer)}</td>
      <td class="text-right">${Number(r.uangMuka||0).toLocaleString('id-ID',{minimumFractionDigits:2,maximumFractionDigits:2})}</td>
      <td class="text-right">${Number(r.piutang||0).toLocaleString('id-ID',{minimumFractionDigits:2,maximumFractionDigits:2})}</td>
      <td><button class="icon-btn edit" data-edit="${i}" title="Ubah">${icon('edit',15)}</button></td>
      <td><button class="icon-btn del" data-del="${i}" title="Hapus">${icon('trash',15)}</button></td>
    </tr>`;
  }).join('');
}

function tplCstDateField(id, value){
  return `
    <div class="input-with-btn">
      <input type="text" id="${id}" value="${value||''}" placeholder="dd/mm/yyyy">
      <button type="button" class="icon-btn edit" title="Kalender" disabled>${icon('calendar',13)}</button>
    </div>`;
}

function tplCustomerForm(mode, row){
  const isEdit = mode==='edit';
  return `
    <div class="breadcrumb">Home / Customer / <b>${isEdit?'Ubah Customer':'Tambah Customer'}</b></div>
    <div class="card">
      <div class="card-header dark-header">
        <h3>${icon(isEdit?'edit':'plus',15)} ${isEdit?'Customer':'+ Customer'}</h3>
        <button class="btn-danger" id="btnCstTutorial">${icon('card',14)} Tutorial</button>
      </div>
      <div class="card-body">
        <h3 style="text-align:center;color:var(--navy);font-size:15px;font-weight:700;padding-bottom:14px;margin-bottom:18px;">Informasi Customer</h3>

        <div class="form-section" style="margin-top:0;border-top:none;padding-top:0;">Personal Data</div>
        <div class="form-grid">
          <div class="form-group">
            <label>Customer Induk</label>
            <input type="checkbox" id="fCstIsInduk" ${row.isInduk?'checked':''} style="width:auto;">
          </div>
          <div class="form-group">
            <label>No Ref</label>
            <input type="text" id="fCstNoRef" value="${row.noRef||''}" placeholder="Contoh: HO.0001">
          </div>
          <div class="form-group">
            <label>Kode Customer</label>
            <div class="field-pair">
              <select id="fCstKodePrefix" disabled><option>CS01</option></select>
              <input type="text" id="fCstKode" value="${row.kode||''}" ${isEdit?'readonly':'readonly'} placeholder="Auto">
            </div>
          </div>
          <div class="form-group">
            <label>Nama Customer</label>
            <input type="text" id="fCstNama" value="${row.nama||''}" placeholder="Contoh: Toko Sumber Rejeki">
            <div class="form-error" id="fCstNamaErr">Nama Customer wajib diisi</div>
          </div>
          <div class="form-group">
            <label>Kode Customer Farma</label>
            <input type="text" id="fCstKodeFarma" value="${row.kodeFarma||''}" placeholder="Kode Customer BPOM">
          </div>
          <div class="form-group">
            <label>Nama Customer Farma</label>
            <input type="text" id="fCstNamaFarma" value="${row.namaFarma||''}" placeholder="Nama Customer BPOM">
          </div>
          <div class="form-group">
            <label>Kode Customer Alkes</label>
            <input type="text" id="fCstKodeAlkes" value="${row.kodeAlkes||''}" placeholder="Kode Customer Kemenkes">
          </div>
          <div class="form-group">
            <label>Nama Customer Alkes</label>
            <input type="text" id="fCstNamaAlkes" value="${row.namaAlkes||''}" placeholder="Nama Customer Kemenkes">
          </div>
          <div class="form-group">
            <label>Tgl. Registrasi</label>
            ${tplCstDateField('fCstTglRegistrasi', row.tglRegistrasi)}
          </div>
          <div class="form-group">
            <label>Mata Uang</label>
            <select id="fCstMataUang">
              <option ${row.mataUang==='IDR'||!row.mataUang?'selected':''}>IDR</option>
              <option ${row.mataUang==='USD'?'selected':''}>USD</option>
            </select>
          </div>
        </div>

        <div class="form-section">Informasi Customer Induk</div>
        <div class="form-grid">
          <div class="form-group">
            <label>Nama Customer Induk</label>
            <div class="input-with-btn">
              <input type="text" id="fCstIndukNama" value="${row.customerIndukNama||''}" placeholder="Nama" readonly>
              <button type="button" class="icon-btn edit" id="btnCstIndukSearch" title="Cari Customer Induk">${icon('search',14)}</button>
              <button type="button" class="icon-btn del" id="btnCstIndukClear" title="Hapus">${icon('trash',14)}</button>
            </div>
          </div>
          <div class="form-group">
            <label>Alamat Customer Induk</label>
            <input type="text" id="fCstIndukAlamat" value="${row.customerIndukAlamat||''}" placeholder="Alamat Customer Induk" readonly>
          </div>
        </div>

        <div class="form-section">Contact Data</div>
        <div class="form-grid">
          <div class="form-group"><label>Nama Pemilik</label><input type="text" id="fCstNamaPemilik" value="${row.namaPemilik||''}"></div>
          <div class="form-group"><label>Kontak Person</label><input type="text" id="fCstKontakPerson" value="${row.kontakPerson||''}"></div>
          <div class="form-group"><label>Gender</label><select id="fCstGender"><option value="">-</option>${CST_GENDER_LIST.map(g=>`<option ${row.gender===g?'selected':''}>${g}</option>`).join('')}</select></div>
          <div class="form-group"><label>Alamat Email</label><input type="email" id="fCstEmail" value="${row.email||''}" placeholder="Alamat Email@Contoh.com"></div>
          <div class="form-group"><label>Tgl. Lahir</label>${tplCstDateField('fCstTglLahir', row.tglLahir)}</div>
          <div class="form-group"><label>Fax</label><input type="text" id="fCstFax" value="${row.fax||''}" placeholder="No. Fax"></div>
          <div class="form-group"><label>Agama</label><select id="fCstAgama">${CST_AGAMA_LIST.map(a=>`<option ${row.agama===a?'selected':''}>${a}</option>`).join('')}</select></div>
          <div class="form-group"><label>Jabatan</label><input type="text" id="fCstJabatan" value="${row.jabatan||''}"></div>
          <div class="form-group"><label>Telepon</label><input type="text" id="fCstTelepon" value="${row.telepon||''}" placeholder="Contoh: (021) 645 66 33"></div>
          <div class="form-group">
            <label>Status AR Customer</label>
            <select id="fCstStatusAR">
              <option ${row.statusARCustomer==='Lancar'||!row.statusARCustomer?'selected':''}>Lancar</option>
              <option ${row.statusARCustomer==='Macet'?'selected':''}>Macet</option>
            </select>
            <div style="font-size:11px;color:var(--red);margin-top:4px;">Status AR customer akan digenerate otomatis setiap hari pukul 23:59, pastikan sudah setting Status AR customer <a href="#" id="lnkStatusARSetting" style="color:var(--blue);">disini</a>.</div>
          </div>
          <div class="form-group">
            <label>Tipe Identitas</label>
            <div class="field-pair">
              <select id="fCstTipeIdentitas">${CST_TIPE_IDENTITAS_LIST.map(t=>`<option ${row.tipeIdentitas===t?'selected':''}>${t}</option>`).join('')}</select>
              <input type="text" id="fCstNoIdentitas" value="${row.noIdentitas||''}" placeholder="No. Identitas">
            </div>
          </div>
          <div class="form-group"><label>Profesi</label><select id="fCstProfesi">${CST_PROFESI_LIST.map(p=>`<option ${row.profesi===p?'selected':''}>${p}</option>`).join('')}</select></div>
          <div class="form-group"><label>Cabang</label><select id="fCstCabang">${CST_CABANG_LIST.map(c=>`<option ${row.cabang===c?'selected':''}>${c}</option>`).join('')}</select></div>
          <div class="form-group">
            <label>Gudang Jual SFA</label>
            <select id="fCstGudang">${CST_GUDANG_LIST.map(g=>`<option ${row.gudangJualSFA===g?'selected':''}>${g}</option>`).join('')}</select>
            <div style="font-size:11px;color:var(--red);margin-top:4px;">Pemilihan gudang ini diperuntukkan untuk aplikasi SFA</div>
          </div>
          <div class="form-group"><label>Kode Negara</label><input type="text" id="fCstKodeNegara" value="${row.kodeNegara||'IDN'}"></div>
          <div class="form-group"><label>ID TKU</label><input type="text" id="fCstIdTku" value="${row.idTKU||'000000'}"></div>
          <div class="form-group">
            <label>Status Customer</label>
            <div class="radio-inline">
              <label><input type="radio" name="fCstStatus" value="Aktif" ${row.status!=='Non Aktif'?'checked':''}> Aktif</label>
              <label><input type="radio" name="fCstStatus" value="Non Aktif" ${row.status==='Non Aktif'?'checked':''}> Non-Aktif</label>
            </div>
          </div>
        </div>

        <div class="form-section">Address</div>
        <div class="form-grid">
          <div class="form-group">
            <label>Wilayah</label>
            <div class="input-with-btn">
              <input type="text" id="fCstWilayah" value="${row.area||''}" readonly>
              <button type="button" class="icon-btn edit" id="btnCstWilayahSearch" title="Cari Wilayah">${icon('search',14)}</button>
            </div>
          </div>
          <div class="form-group"><label>Rayon</label><input type="text" id="fCstRayon" value="${row.rayonNama||''}" readonly></div>
          <div class="form-group"><label>Province</label><select id="fCstProvinsi"><option value="">-</option>${DATA.provinsiList.map(p=>`<option ${row.provinsi===p?'selected':''}>${p}</option>`).join('')}</select></div>
          <div class="form-group"><label>Regency / Kabupaten</label><input type="text" id="fCstKabupaten" value="${row.kabupaten||''}"></div>
          <div class="form-group"><label>District / Kecamatan</label><input type="text" id="fCstKecamatan" value="${row.kecamatan||''}"></div>
          <div class="form-group"><label>Village / Kelurahan</label><input type="text" id="fCstKelurahan" value="${row.kelurahan||''}"></div>
          <div class="form-group"><label>Kode Pos</label><input type="text" id="fCstKodePos" value="${row.kodePos||''}"></div>
          <div class="form-group"><label>Salesman</label><select id="fCstSalesman">${DATA.salesman.map(s=>`<option ${row.salesman===s.nama?'selected':''}>${s.nama}</option>`).join('')}</select></div>
          <div class="form-group"><label>Latitude</label><input type="text" id="fCstLatitude" value="${row.latitude??''}"></div>
          <div class="form-group"><label>Longitude</label><input type="text" id="fCstLongitude" value="${row.longitude??''}"></div>
        </div>
        <div class="form-group">
          <label>Alamat</label>
          <textarea id="fCstAlamat" rows="2">${row.alamat||''}</textarea>
        </div>

        <div class="form-section">Group Customer</div>
        <div class="form-grid">
          <div class="form-group">
            <label>Grup Customer</label>
            <select id="fCstGroup">
              <option value="">-</option>
              ${DATA.customerGroup.map(g=>`<option value="${g.kode}" ${row.groupCustomer===g.kode?'selected':''}>${g.kode} - ${g.nama}</option>`).join('')}
            </select>
          </div>
          <div class="form-group">
            <label>Badan Usaha</label>
            <select id="fCstBadanUsaha">
              <option value="">-</option>
              ${DATA.badanUsahaList.map(b=>`<option value="${b.kode}" ${row.badanUsaha===b.kode?'selected':''}>${b.kode} - ${b.nama}</option>`).join('')}
            </select>
          </div>
        </div>

        <div class="form-section">Status Customer</div>
        <div class="checkbox-row"><input type="checkbox" id="fCstConsignment" ${row.consignment?'checked':''}><label for="fCstConsignment">Customer Consignment</label></div>

        <div class="form-section">Legalitas Outlet :</div>
        <div id="cstLegalitasOutletWrap">${tplCstLegalitasTable(row.legalitasOutlet||[], 'legalitasOutlet')}</div>

        <div class="form-section">Legalitas Pemilik / Pimpinan :</div>
        <div id="cstLegalitasPemilikWrap">${tplCstLegalitasTable(row.legalitasPemilik||[], 'legalitasPemilik')}</div>

        <h3 style="text-align:center;color:var(--navy);font-size:15px;font-weight:700;padding-top:24px;padding-bottom:14px;margin-top:18px;border-top:1px solid var(--border);">Info Akuntansi</h3>

        <div class="form-section" style="margin-top:0;border-top:none;padding-top:0;">Tax Data</div>
        <div class="form-grid">
          <div class="form-group"><label>No. NPWP</label><input type="text" id="fCstNpwp" value="${row.npwp||''}"></div>
          <div class="form-group">
            <label>PKP / NON PKP</label>
            <div class="radio-inline">
              <label><input type="radio" name="fCstPkp" value="PKP" ${row.pkpStatus==='PKP'?'checked':''}> PKP</label>
              <label><input type="radio" name="fCstPkp" value="Non-PKP" ${row.pkpStatus!=='PKP'?'checked':''}> Non-PKP</label>
            </div>
          </div>
          <div class="form-group"><label>Nama NPWP</label><input type="text" id="fCstNamaNpwp" value="${row.namaNpwp||''}"></div>
          <div class="form-group">
            <label>Kode Transaksi Pajak</label>
            <select id="fCstKodeTransaksiPajak">${CST_KODE_TRANSAKSI_PAJAK_LIST.map(k=>`<option value="${k.kode}" ${row.kodeTransaksiPajak===k.kode?'selected':''}>${k.label}</option>`).join('')}</select>
            <div style="font-size:11px;color:var(--text-light);margin-top:4px;">Pada penjualan jika menggunakan pajak otomatis kode ini akan terisi pada 2 digit depan nomor transaksi pajak</div>
          </div>
          <div class="form-group"><label>Alamat Pajak</label><textarea id="fCstAlamatPajak" rows="2">${row.alamatPajak||''}</textarea></div>
          <div class="form-group"><label>Type PPN</label><select id="fCstTypePpn">${CST_TYPE_PPN_LIST.map(t=>`<option ${row.typePpn===t?'selected':''}>${t}</option>`).join('')}</select></div>
        </div>

        <div class="form-section">Bank</div>
        <div class="form-grid">
          <div class="form-group"><label>Master Bank</label><select id="fCstMasterBank"><option value="">-</option>${CST_BANK_LIST.map(b=>`<option ${row.masterBank===b?'selected':''}>${b}</option>`).join('')}</select></div>
          <div class="form-group"><label>No. VA</label><input type="text" id="fCstNoVA" value="${row.noVA||''}" readonly></div>
          <div class="form-group"><label>No. Rek</label><input type="text" id="fCstNoRek" value="${row.noRek||''}"></div>
        </div>

        <div class="form-section">Kredit</div>
        <div class="form-grid">
          <div class="form-group">
            <label>TOP</label>
            <div class="input-with-btn">
              <select id="fCstTop">${DATA.syaratBayarList.map(s=>`<option ${row.top===s?'selected':''}>${s}</option>`).join('')}</select>
              <button type="button" class="icon-btn edit" id="btnCstTopAdd" title="Tambah Syarat Bayar">${icon('plus',14)}</button>
            </div>
          </div>
          <div class="form-group"><label>CL</label><input type="text" id="fCstCl" value="${Number(row.limit||0).toLocaleString('id-ID')}" style="text-align:right;"></div>
          <div class="form-group"><label>DL</label><input type="text" id="fCstDl" value="${Number(row.dominasiLimit||0).toLocaleString('id-ID')}" style="text-align:right;"></div>
        </div>
        <div class="checkbox-row"><input type="checkbox" id="fCstWajibDominasi" ${row.wajibDominasi?'checked':''}><label for="fCstWajibDominasi">Wajib Dominasi</label></div>

        <div class="form-section">GL Data</div>
        <div class="form-grid">
          <div class="form-group">
            <label>GL Akun Piutang</label>
            <div class="input-with-btn">
              <input type="text" id="fCstAkunPiutang" value="${row.glAkunPiutang||''}" readonly>
              <button type="button" class="icon-btn edit" id="btnCstAkunPiutangSearch" title="Cari Akun GL">${icon('search',14)}</button>
              <button type="button" class="icon-btn del" id="btnCstAkunPiutangClear" title="Hapus">${icon('trash',14)}</button>
            </div>
            <div style="font-size:11.5px;color:var(--blue);margin-top:4px;" id="fCstAkunPiutangNama">${cstAkunNama(row.glAkunPiutang)}</div>
          </div>
          <div class="form-group">
            <label>GL Akun Uang Muka</label>
            <div class="input-with-btn">
              <input type="text" id="fCstAkunUangMuka" value="${row.glAkunUangMuka||''}" placeholder="Klik untuk mencari" readonly>
              <button type="button" class="icon-btn edit" id="btnCstAkunUangMukaSearch" title="Cari Akun GL">${icon('search',14)}</button>
              <button type="button" class="icon-btn del" id="btnCstAkunUangMukaClear" title="Hapus">${icon('trash',14)}</button>
            </div>
            <div style="font-size:11.5px;color:var(--blue);margin-top:4px;" id="fCstAkunUangMukaNama">${cstAkunNama(row.glAkunUangMuka)}</div>
          </div>
        </div>

        <div class="form-page-actions">
          <button class="btn-secondary" id="cstCancel">Batalkan</button>
          <button class="btn-primary" id="cstSave">Simpan</button>
        </div>
      </div>
    </div>`;
}

function tplCstLegalitasTable(items, prefix){
  return `
    <div class="table-wrap"><table>
      <thead><tr>
        <th style="width:36px;">No.</th>
        <th>Syarat</th>
        <th>Keterangan</th>
        <th>Tgl. Expired</th>
        <th>Tanggal Proses</th>
        <th>Upload File</th>
        <th>Preview</th>
      </tr></thead>
      <tbody>
        ${items.map((it,i)=>`
          <tr>
            <td>${i+1}</td>
            <td>${it.syarat}</td>
            <td><input type="text" data-leg-field="${prefix}:${i}:keterangan" value="${it.keterangan||''}" placeholder="Keterangan" style="width:100%;border:1px solid var(--border);border-radius:5px;padding:6px 8px;font-size:12.5px;"></td>
            <td>${tplCstDateField(`fLeg_${prefix}_${i}_tglExpired`, it.tglExpired)}</td>
            <td>${tplCstDateField(`fLeg_${prefix}_${i}_tglProses`, it.tglProses)}</td>
            <td><button type="button" class="icon-btn edit" data-leg-upload="${prefix}:${i}" title="Upload File">${icon('file',14)}</button></td>
            <td><div class="leg-preview" data-leg-preview="${prefix}:${i}">${it.uploaded?icon('eye',18):''}</div></td>
          </tr>`).join('')}
      </tbody>
    </table></div>`;
}

function tplCstIndukPicker(list){
  return `
    <div class="modal-box">
      <div class="modal-header"><span>Pilih Customer Induk</span><span class="close" id="pickerClose">&times;</span></div>
      <div class="modal-body">
        <input type="text" id="cstIndukSearch" placeholder="Cari kode / nama customer..." style="width:100%;border:1px solid var(--border);border-radius:6px;padding:8px 10px;font-size:12.8px;margin-bottom:12px;">
        <div class="table-wrap" style="max-height:360px;overflow:auto;"><table>
          <thead><tr><th>Kode</th><th>Nama</th><th>Kota</th><th></th></tr></thead>
          <tbody id="cstIndukPickerBody">${tplCstIndukPickerRows(list)}</tbody>
        </table></div>
      </div>
      <div class="modal-footer"><button class="btn-secondary" id="pickerCancel">Tutup</button></div>
    </div>`;
}
function tplCstIndukPickerRows(list){
  if(!list.length) return `<tr><td colspan="4" style="color:var(--text-light);">Tidak ada customer ditemukan</td></tr>`;
  return list.map(c=>`<tr><td>${c.kode}</td><td>${c.nama}</td><td>${c.kota||''}</td><td><button class="btn-pick" data-pick-induk="${c.kode}">Pilih</button></td></tr>`).join('');
}

function tplCstWilayahPicker(list){
  return `
    <div class="modal-box">
      <div class="modal-header"><span>Pilih Wilayah</span><span class="close" id="pickerClose">&times;</span></div>
      <div class="modal-body">
        <div class="table-wrap"><table>
          <thead><tr><th>Kode Area</th><th>Kota</th><th>Rayon</th><th></th></tr></thead>
          <tbody>
            ${list.map(w=>`<tr><td>${w.area}</td><td>${w.kota}</td><td>${w.rayonNama}</td><td><button class="btn-secondary btn-pick" data-pick="${w.area}">Pilih</button></td></tr>`).join('')}
          </tbody>
        </table></div>
      </div>
      <div class="modal-footer"><button class="btn-secondary" id="pickerCancel">Tutup</button></div>
    </div>`;
}

function tplCstAkunPicker(list, fieldKey){
  return `
    <div class="modal-box" style="max-width:640px;">
      <div class="modal-header"><span>Pilih Akun GL</span><span class="close" id="modalClose">&times;</span></div>
      <div class="modal-body">
        <input type="text" id="cstAkunPickerSearch" placeholder="Cari kode / nama akun..." style="width:100%;border:1px solid var(--border);border-radius:6px;padding:8px 10px;font-size:12.8px;margin-bottom:12px;">
        <div class="table-wrap" style="max-height:360px;overflow:auto;">
          <table>
            <thead><tr><th>Kode</th><th>Nama Akun</th><th>Kat.</th><th></th></tr></thead>
            <tbody id="cstAkunPickerBody">${tplCstAkunPickerRows(list, fieldKey)}</tbody>
          </table>
        </div>
      </div>
      <div class="modal-footer"><button class="btn-secondary" id="modalCancel">Tutup</button></div>
    </div>`;
}
function tplCstAkunPickerRows(list, fieldKey){
  if(!list.length) return `<tr><td colspan="4" style="color:var(--text-light);">Tidak ada akun ditemukan</td></tr>`;
  return list.map(a=>`
    <tr>
      <td>${a.kode}</td>
      <td>${a.nama}</td>
      <td>${a.kategori}</td>
      <td><button class="btn-pick" data-pick-akun="${a.kode}" data-pick-field="${fieldKey}">Pilih</button></td>
    </tr>`).join('');
}

function tplCstSyaratAddModal(){
  return `
    <div class="modal-box">
      <div class="modal-header"><span>Tambah Syarat Bayar Baru</span><span class="close" id="modalClose">&times;</span></div>
      <div class="modal-body">
        <div class="form-group"><label>Syarat Bayar</label><input type="text" id="fNewSyarat" placeholder="Contoh: N60"></div>
      </div>
      <div class="modal-footer">
        <button class="btn-secondary" id="modalCancel">Batal</button>
        <button class="btn-primary" id="modalSave">Simpan</button>
      </div>
    </div>`;
}

function tplCstInfoModal(title, text){
  return `
    <div class="modal-box">
      <div class="modal-header"><span>${title}</span><span class="close" id="modalClose">&times;</span></div>
      <div class="modal-body"><p>${text}</p></div>
      <div class="modal-footer"><button class="btn-primary" id="modalOk">Tutup</button></div>
    </div>`;
}

function tplCstDeleteConfirm(row){
  return `
    <div class="modal-box">
      <div class="modal-header"><span>Hapus Customer</span><span class="close" id="modalClose">&times;</span></div>
      <div class="modal-body"><p>Yakin ingin menghapus customer <b>${row.kode}</b> — ${row.nama||'None'}?</p></div>
      <div class="modal-footer">
        <button class="btn-secondary" id="modalCancel">Batal</button>
        <button class="btn-danger" id="modalDelete">Hapus</button>
      </div>
    </div>`;
}
