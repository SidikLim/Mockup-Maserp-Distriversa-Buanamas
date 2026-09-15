/* =========================================================
   TEMPLATE (HTML saja) — Hak Approval (User Security > Hak
   Approval, page:'hakApproval'). Semua fungsi di file ini HANYA
   menyusun & mengembalikan markup HTML (string) atau helper
   murni, TIDAK ada DOM-binding/mutation — logic-nya di file
   sebelah: hak-approval.js. NB: closeModal() dipakai bersama,
   didefinisikan di core.js.

   Dibangun 2026-09-15 sesuai 4 screenshot MASERP (lihat komentar
   lengkap di atas DATA.hakApproval di js/data.js untuk pemetaan
   detail tiap screenshot -> field). Ringkasnya: modul ini punya 2
   tampilan — "Daftar Hak Approval" (list: dark header + tombol
   "+Add", toolbar page-size(20 default)+Pencarian Global, kolom
   Tipe Dokumen/Document Type Options/Aktif?/Edit/Delete, pager
   standar) dan "Hak Approval" (form: dark header + tombol merah
   Tutorial, field-table label|kontrol [Tipe Dokumen dropdown +
   checkbox kondisi tambahan yang BEDA-BEDA tergantung Tipe
   Dokumen + Aktifkan Approval], checkbox "Menentukan User Request
   dan Approver" [statis/dekoratif — semua screenshot menunjukkan
   kondisi tidak dicentang & tidak ada UI lanjutan yang terlihat,
   jadi tidak diberi perilaku dinamis supaya tidak menebak di luar
   cakupan], lalu tabel Level Approval dengan kolom numerik
   tambahan yang juga BEDA-BEDA tergantung Tipe Dokumen + 2 kolom
   Approver [User Roles/User Names, keduanya TAG MULTI-VALUE] +
   Delete, tombol "+Tambah Level Baru").

   Field per Tipe Dokumen dikonfigurasi lewat `HAP_DOC_TYPES` di
   bawah — daftar TETAP milik aplikasi (pola sama seperti
   USR_ROLE_LIST di master-user.template.js / HAG_MODULES di
   hak-akses-group.template.js), BUKAN data yang di-CRUD user,
   makanya sengaja tidak ditaruh di DATA.hakApproval (data.js).
   `extraOptions` = checkbox kondisi tambahan (muncul di atas
   "Aktifkan Approval"), `levelCols` = kolom numerik tambahan di
   tabel Level Approval. Tipe Dokumen yang extraOptions/levelCols-
   nya kosong (Purchase Request/Delivery Order Refund) cuma
   menampilkan checkbox "Aktifkan Approval" & tabel level polos
   (Level/Approver/Delete saja) — persis pola screenshot "Delivery
   Order Refund".

   `code` di tiap extraOptions dipakai utk kolom "Document Type
   Options" di list (gabungan `code` yang aktif, dipisah ";" —
   PERSIS format screenshot "OverCreditLimit;InvoiceOverDue" /
   "WithInvoice;WithoutInvoice"). */

const HAP_DOC_TYPES = [
  {key:'salesOrder', label:'Sales Order',
    extraOptions:[
      {key:'grandTotal', code:'GrandTotal', label:'Grand Total'},
      {key:'overCreditLimit', code:'OverCreditLimit', label:'Over Credit Limit'},
      {key:'invoiceOverDue', code:'InvoiceOverDue', label:'Invoice Over Due'},
      {key:'priceUnderCost', code:'PriceUnderCost', label:'Price Under Cost of Goods Sold'},
    ],
    levelCols:[
      {key:'batasOverKreditPct', label:'Batas Over Kredit(%)'},
      {key:'batasOverKreditNominal', label:'Upto Batas Over Kredit (Nominal)'},
      {key:'batasHariOverDue', label:'Batas Hari Over Due'},
    ]},
  {key:'purchaseRequest', label:'Purchase Request', extraOptions:[], levelCols:[]},
  {key:'salesRefund', label:'Sales Refund',
    extraOptions:[
      {key:'withInvoice', code:'WithInvoice', label:'With Invoice'},
      {key:'withoutInvoice', code:'WithoutInvoice', label:'Without Invoice'},
    ], levelCols:[]},
  {key:'deliveryOrderRefund', label:'Delivery Order Refund', extraOptions:[], levelCols:[]},
];

/* Daftar Jabatan (User Roles) — LOKAL khusus modul ini, konsep BEDA dari
   DATA.groupUser (kode akses sistem: ACC/ADG/ADM/...) maupun USR_ROLE_LIST
   di master-user.template.js (Level Pemakai: ADM/SLS/FIN/...) — di sini
   representasi JABATAN STRUKTURAL yang dipakai sbg approver hierarki
   (persis istilah di screenshot: "Finance Accounting SPV HO"/"Kepala
   Cabang Semarang"/dst). Nama jabatan per-cabang dibentuk dari 8 kode
   cabang yang sama dipakai USR_CABANG_LIST (master-user.template.js) —
   "HO" dipakai apa adanya (bukan "Cabang Head Office") krn begitulah
   istilah persis di screenshot ("Finance Accounting SPV HO"/"Kepala
   Cabang HO"), sisanya "Cabang <Nama>". 4 nilai PERTAMA tiap grup PERSIS
   dari screenshot (Finance Accounting SPV HO/...Semarang, Kepala Cabang
   HO/Semarang/Tangerang, Finance Accounting Supervisor); sisanya
   TAMBAHAN supaya cabang lain (Surabaya/Bandung/Medan/Makassar/Sidoarjo)
   juga punya opsi jabatan yang konsisten, bukan cuma 3 cabang yg
   kebetulan tampak di screenshot. */
const HAP_JABATAN_LIST = [
  'Finance Accounting SPV HO',
  'Finance Accounting SPV Cabang Surabaya',
  'Finance Accounting SPV Cabang Bandung',
  'Finance Accounting SPV Cabang Tangerang',
  'Finance Accounting SPV Cabang Medan',
  'Finance Accounting SPV Cabang Makassar',
  'Finance Accounting SPV Cabang Semarang',
  'Finance Accounting SPV Cabang Sidoarjo',
  'Kepala Cabang HO',
  'Kepala Cabang Surabaya',
  'Kepala Cabang Bandung',
  'Kepala Cabang Tangerang',
  'Kepala Cabang Medan',
  'Kepala Cabang Makassar',
  'Kepala Cabang Semarang',
  'Kepala Cabang Sidoarjo',
  'Finance Accounting Supervisor',
  'Finance Accounting Manager',
  'Direktur',
];

const HAP_PAGE_SIZE_DEFAULT = 20;

function hapDocType(key){
  return HAP_DOC_TYPES.find(t => t.key === key);
}

/* Kolom "Document Type Options" di list — gabungan `code` extraOptions
   yang bernilai true di `row.options`, dipisah ";" (kosong kalau Tipe
   Dokumennya tidak punya extraOptions sama sekali, mis. Purchase
   Request/Delivery Order Refund — PERSIS screenshot list, sel kosong). */
function hapOptionsSummary(row){
  const type = hapDocType(row.tipeDokumen);
  if(!type || !type.extraOptions.length) return '';
  return type.extraOptions.filter(o => row.options && row.options[o.key]).map(o => o.code).join(';');
}

/* ===================== LIST "Daftar Hak Approval" ===================== */

function tplHapListPage(){
  return `
    <div class="breadcrumb">Home / <b>Daftar Hak Approval</b></div>
    <div class="card">
      <div class="card-header dark-header">
        <h3>${icon('shield',15)} Daftar Hak Approval</h3>
        <button class="btn-primary" id="btnHapAdd">${icon('plus',14)} Add</button>
      </div>
      <div class="table-toolbar" style="justify-content:flex-end;">
        <select id="hapPageSize"><option>10</option><option selected>20</option><option>50</option></select>
        <input type="text" id="hapSearch" placeholder="Pencarian Global">
      </div>
      <div class="table-wrap"><table>
        <thead><tr>
          <th>Tipe Dokumen</th>
          <th>Document Type Options</th>
          <th>Aktif?</th>
          <th>Edit</th>
          <th>Delete</th>
        </tr></thead>
        <tbody id="hapTbody"></tbody>
      </table></div>
      <div class="table-footer"><div id="hapPagerWrap"></div><div id="hapTotal"></div></div>
    </div>`;
}

function tplHapRows(rows){
  if(!rows.length) return `<tr><td colspan="5" style="color:var(--text-light);">Tidak Ada Data</td></tr>`;
  return rows.map(r=>{
    const i = DATA.hakApproval.indexOf(r);
    const type = hapDocType(r.tipeDokumen);
    return `
    <tr>
      <td><b style="color:var(--blue);cursor:pointer;" data-edit="${i}">${type ? type.label : r.tipeDokumen}</b></td>
      <td>${hapOptionsSummary(r)}</td>
      <td>${r.aktif ? `<span style="color:var(--teal);">${icon('check',16)}</span>` : ''}</td>
      <td><button class="icon-btn edit" data-edit="${i}">${icon('edit',14)}</button></td>
      <td><button class="icon-btn del" data-del="${i}">${icon('trash',14)}</button></td>
    </tr>`;
  }).join('');
}

function tplHapPager(page, totalPages){
  let nums = '';
  for(let p=1; p<=totalPages; p++) nums += `<button class="${p===page?'active':''}" data-hap-page="${p}">${p}</button>`;
  return `<div class="pager">
    <button data-hap-first ${page<=1?'disabled':''}>First</button>
    <button data-hap-prev ${page<=1?'disabled':''}>Previous</button>
    ${nums}
    <button data-hap-next ${page>=totalPages?'disabled':''}>Next</button>
    <button data-hap-last ${page>=totalPages?'disabled':''}>Last</button>
  </div>`;
}

function tplHapDeleteConfirm(row){
  const type = hapDocType(row.tipeDokumen);
  return `
    <div class="modal-box">
      <div class="modal-header"><span>Hapus Hak Approval</span><span class="close" id="modalClose">&times;</span></div>
      <div class="modal-body"><p>Yakin ingin menghapus setting Hak Approval untuk <b>${type?type.label:row.tipeDokumen}</b>?</p></div>
      <div class="modal-footer">
        <button class="btn-secondary" id="modalCancel">Batal</button>
        <button class="btn-danger" id="modalDelete">Hapus</button>
      </div>
    </div>`;
}

function tplHapInfoModal(title, text){
  return `
    <div class="modal-box">
      <div class="modal-header"><span>${title}</span><span class="close" id="modalClose">&times;</span></div>
      <div class="modal-body"><p>${text}</p></div>
      <div class="modal-footer"><button class="btn-primary" id="modalOk">Mengerti</button></div>
    </div>`;
}

/* ===================== FORM "Hak Approval" ===================== */

function tplHapForm(mode, row){
  const type = hapDocType(row.tipeDokumen);
  const title = mode==='add' ? '+ Hak Approval' : 'Hak Approval';
  return `
    <div class="breadcrumb">Home / Hak Approval / <b>${title}</b></div>
    <div class="card">
      <div class="card-header dark-header">
        <h3>${icon(mode==='add'?'plus':'edit',15)} Hak Approval</h3>
        <button class="btn-danger" id="btnHapTutorial" type="button">${icon('card',14)} Tutorial</button>
      </div>
      <div class="card-body">
        <table class="field-table">
          <tr>
            <td class="flabel">Tipe Dokumen</td>
            <td>
              <select id="fHapTipeDokumen" ${mode==='edit'?'disabled style="background:#f2f3f6;color:var(--text-light);"':''}>
                ${HAP_DOC_TYPES.map(t=>`<option value="${t.key}" ${t.key===row.tipeDokumen?'selected':''}>${t.label}</option>`).join('')}
              </select>
            </td>
          </tr>
          ${type.extraOptions.map(opt=>`
          <tr>
            <td class="flabel">${opt.label}</td>
            <td><input type="checkbox" data-hap-opt="${opt.key}" ${row.options && row.options[opt.key] ? 'checked':''} style="width:auto;"></td>
          </tr>`).join('')}
          <tr>
            <td class="flabel">Aktifkan Approval</td>
            <td><input type="checkbox" id="fHapAktif" ${row.aktif?'checked':''} style="width:auto;"></td>
          </tr>
        </table>

        <label class="checkbox-row">
          <input type="checkbox" id="fHapUseUserReq" ${row.useUserRequestApprover?'checked':''}>
          <span>Menentukan User Request dan Approver</span>
        </label>

        <div class="table-wrap" style="margin-top:6px;">
          <table>
            <thead>
              <tr>
                <th rowspan="2" style="vertical-align:middle;">Level</th>
                ${type.levelCols.map(c=>`<th rowspan="2" style="vertical-align:middle;">${c.label}</th>`).join('')}
                <th colspan="2" style="text-align:center;">Approver</th>
                <th rowspan="2" style="vertical-align:middle;">Delete</th>
              </tr>
              <tr>
                <th>User Roles</th>
                <th>User Names</th>
              </tr>
            </thead>
            <tbody id="hapLevelsBody">${tplHapLevelRows(row, type)}</tbody>
          </table>
        </div>
        <div style="padding:10px 0 0;">
          <a href="#" id="btnHapAddLevel" class="link-add">${icon('plus',13)} Tambah Level Baru</a>
        </div>

        <div class="form-page-actions">
          <button class="btn-primary" id="hapSave">${icon('check',14)} Simpan</button>
          <button class="btn-outline" id="hapCancel">Cancel</button>
        </div>
      </div>
    </div>`;
}

function tplHapLevelRows(row, type){
  const colspan = 1 + type.levelCols.length + 2 + 1;
  if(!row.levels.length) return `<tr><td colspan="${colspan}" style="color:var(--text-light);">Belum ada level approval — klik "Tambah Level Baru" di bawah.</td></tr>`;
  return row.levels.map((lvl,i)=>`
    <tr>
      <td>${lvl.level}</td>
      ${type.levelCols.map(c=>`<td><input type="number" data-hap-lvl-col="${c.key}" data-hap-lvl-idx="${i}" value="${lvl[c.key]!=null?lvl[c.key]:0}" style="min-width:90px;"></td>`).join('')}
      <td><div class="tag-box" data-hap-roles-box="${i}" style="cursor:pointer;min-width:170px;">${tplHapTagChips(lvl.userRoles,'role',i)}</div></td>
      <td><div class="tag-box" data-hap-names-box="${i}" style="cursor:pointer;min-width:170px;">${tplHapTagChips(lvl.userNames,'name',i)}</div></td>
      <td><button class="icon-btn del" data-hap-lvl-del="${i}" title="Hapus Level">${icon('trash',13)}</button></td>
    </tr>`).join('');
}

function tplHapTagChips(list, kind, levelIdx){
  if(!list || !list.length){
    return `<span style="color:var(--text-light);font-size:12px;">${kind==='role' ? 'Pilih Jabatan...' : 'Pilih User...'}</span>`;
  }
  return list.map((name,i)=>`<span class="tag-chip">${name}<span class="rm" data-hap-rm="${kind}" data-hap-rm-level="${levelIdx}" data-hap-rm-i="${i}">&times;</span></span>`).join('');
}

/* Modal picker tag "User Roles"/"User Names" — dipakai keduanya (kind
   'role'|'name'), reuse pola tplPklPickerAddModal (Picking List field
   "Picker"): klik "Pilih" langsung menambah & menutup modal (bukan
   checklist+Terapkan seperti "Pilih Gudang" di Group User), krn di sini
   1 klik = 1 item, konsisten dgn precedent tag input yg sudah ada. Search
   ditambahkan (beda dari Picking List yang listnya pendek) krn sumber
   "User Names" (DATA.users, ~95 baris) & "User Roles" (HAP_JABATAN_LIST,
   ~19 baris) cukup panjang utk butuh filter, pola sama tplUsrRayonPickerModal. */
function hapTagPickerSource(kind){
  return kind==='role' ? HAP_JABATAN_LIST : DATA.users.map(u=>u.username);
}

function tplHapTagPickerModal(kind, already){
  const title = kind==='role' ? 'Pilih Jabatan (User Roles)' : 'Pilih User (User Names)';
  return `
    <div class="modal-box" style="max-width:420px;">
      <div class="modal-header"><span>${title}</span><span class="close" id="modalClose">&times;</span></div>
      <div class="modal-body">
        <input type="text" id="hapTagPickerSearch" placeholder="Cari..." style="width:100%;border:1px solid var(--border);border-radius:6px;padding:8px 10px;font-size:12.8px;margin-bottom:12px;">
        <div class="table-wrap" style="max-height:320px;overflow:auto;">
          <table><tbody id="hapTagPickerBody">${tplHapTagPickerRows(kind, hapTagPickerSource(kind), already)}</tbody></table>
        </div>
      </div>
      <div class="modal-footer"><button class="btn-secondary" id="modalCancel">Tutup</button></div>
    </div>`;
}

function tplHapTagPickerRows(kind, list, already){
  if(!list.length) return `<tr><td style="color:var(--text-light);">Tidak ditemukan</td></tr>`;
  return list.map(name=>`
    <tr>
      <td>${name}</td>
      <td style="text-align:right;">${already.includes(name) ? '<span style="font-size:11px;color:var(--text-light);">Sudah dipilih</span>' : `<button class="btn-pick" data-hap-pick="${name}">Pilih</button>`}</td>
    </tr>`).join('');
}
