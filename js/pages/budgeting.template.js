/* =========================================================
   TEMPLATE (HTML saja) — Budgeting (General Ledger > Master &
   Setting > Budgeting, page:'budgeting'). Semua fungsi di file
   ini HANYA menyusun & mengembalikan markup HTML (string) atau
   helper murni, TIDAK ada DOM-binding/mutation. Logic-nya di
   file sebelah: budgeting.js
   NB: closeModal() dipakai bersama, didefinisikan di core.js.

   Dibangun 2026-09-01 sesuai screenshot MASERP SDL "Daftar
   Budgeting" (Total Record: 282, akun 6-digit SDL → dipetakan
   ke DATA.akunGL DBM 7-digit): dark header + tombol Simpan
   (biru) + Tutorial (merah); checkbox "Munculkan Akun Neraca"
   (default TERCENTANG — bila dilepas, akun neraca kode 1/2/3
   disembunyikan dan hanya akun laba-rugi 4/5/6 yang tampil);
   input pencarian; tabel: Budgeting PO (toggle per baris) /
   Kode GL (sort) / Nama GL (sort) / kolom nominal budget
   JANUARI s.d. DESEMBER (12 input angka per akun — sesuai
   permintaan user; screenshot ter-scroll mulai April) /
   Delete (mengosongkan nilai budget + toggle baris). Tabel
   scroll horizontal (.table-wrap), pager windowed, Total
   Record = jumlah akun terfilter. Nilai diedit ke DRAFT dulu
   (bgtDraft) supaya awet pindah halaman; tombol Simpan menulis
   draft ke DATA.budgeting + modal info. Data sample: budget
   2026 beberapa akun biaya (Gaji, Listrik & Air, Transportasi)
   di DATA.budgeting. */

const BGT_BULAN = ['Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember'];

function bgtIsNeraca(kode){ return /^[123]/.test(kode || ''); }

function tplBgtPage(showNeraca){
  return `
    <div class="breadcrumb">Home / General Ledger / <b>Budgeting</b></div>
    <div class="card">
      <div class="card-header dark-header">
        <h3>${icon('alertTriangle',15)} Daftar Budgeting</h3>
        <div class="toolbar-actions">
          <button class="btn-primary" id="btnBgtSimpan">${icon('save',13)} Simpan</button>
          <button class="btn-danger" id="btnBgtTutorial">${icon('card',13)} Tutorial</button>
        </div>
      </div>
      <div style="padding:12px 14px 0;">
        <label style="display:flex;align-items:center;gap:7px;font-size:12.8px;font-weight:600;"><input type="checkbox" id="bgtNeraca" ${showNeraca?'checked':''} style="width:auto;"> Munculkan Akun Neraca</label>
        <input type="text" id="bgtSearch" placeholder="Cari kode / nama akun GL ..." style="width:100%;border:1px solid var(--border);border-radius:6px;padding:9px 12px;font-size:12.8px;margin-top:10px;">
      </div>
      <div class="table-wrap" style="margin:10px 14px 0;overflow-x:auto;">
        <table style="min-width:${480 + 12*128 + 70}px;">
          <thead><tr>
            <th style="min-width:86px;">Budgeting PO</th>
            <th style="min-width:96px;">${tplBgtSortHeader('Kode GL','kode')}</th>
            <th style="min-width:200px;">${tplBgtSortHeader('Nama GL','nama')}</th>
            ${BGT_BULAN.map(b=>`<th class="text-right" style="min-width:120px;">${b}</th>`).join('')}
            <th style="width:64px;">Delete</th>
          </tr></thead>
          <tbody id="bgtTbody"></tbody>
        </table>
      </div>
      <div class="table-footer" style="padding:12px 14px;"><div class="pager" id="bgtPager"></div><div id="bgtTotal"></div></div>
    </div>`;
}

function tplBgtSortHeader(label, field){
  return `<span data-bgt-sort="${field}" style="cursor:pointer;display:inline-flex;align-items:center;gap:4px;">${label}<span id="bgtSortIcon_${field}" style="color:var(--text-light);font-size:11px;">&#8693;</span></span>`;
}

/* Baris akun: toggle PO + 12 input nominal (nilai dari draft). */
function tplBgtRows(rows, draft){
  if(!rows.length) return `<tr><td colspan="${3 + BGT_BULAN.length + 1}" style="color:var(--text-light);padding:14px;text-align:center;font-weight:600;">Tidak Ada Data</td></tr>`;
  return rows.map(a => {
    const d = draft[a.kode] || { po:false, bulan:[] };
    return `
    <tr>
      <td style="text-align:center;"><label class="toggle-switch"><input type="checkbox" data-bgt-po="${a.kode}" ${d.po?'checked':''}><span class="toggle-slider"></span></label></td>
      <td>${a.kode}</td>
      <td>${a.nama}</td>
      ${BGT_BULAN.map((b,i)=>`<td><input type="number" step="0.01" min="0" data-bgt-val="${a.kode}|${i}" value="${d.bulan[i]!=null && d.bulan[i]!=='' ? d.bulan[i] : ''}" placeholder="" style="text-align:right;min-width:106px;"></td>`).join('')}
      <td style="text-align:center;"><button type="button" class="icon-btn del" data-bgt-del="${a.kode}" title="Kosongkan Budget">${icon('trash',15)}</button></td>
    </tr>`;
  }).join('');
}

function tplBgtPager(page, totalPages){
  if(totalPages <= 1) return `
    <button disabled>First</button><button disabled>Previous</button><button class="active">1</button><button disabled>Next</button><button disabled>Last</button>`;
  const windowSize = 7;
  let start = Math.max(1, page - Math.floor(windowSize/2));
  let end = Math.min(totalPages, start + windowSize - 1);
  start = Math.max(1, end - windowSize + 1);
  let nums = '';
  for(let p = start; p <= end; p++){
    nums += `<button class="${p===page?'active':''}" data-bgtpage="${p}">${p}</button>`;
  }
  return `
    <button data-bgtpage="1" ${page<=1?'disabled':''}>First</button>
    <button data-bgtpage="${Math.max(1,page-1)}" ${page<=1?'disabled':''}>Previous</button>
    ${nums}
    <button data-bgtpage="${Math.min(totalPages,page+1)}" ${page>=totalPages?'disabled':''}>Next</button>
    <button data-bgtpage="${totalPages}" ${page>=totalPages?'disabled':''}>Last</button>`;
}

function tplBgtInfoModal(title,text){
  return `
    <div class="modal-box">
      <div class="modal-header"><span>${title}</span><span class="close" id="modalClose">&times;</span></div>
      <div class="modal-body"><p>${text}</p></div>
      <div class="modal-footer"><button class="btn-primary" id="modalOk">Mengerti</button></div>
    </div>`;
}

function tplBgtDeleteConfirm(akun){
  return `
    <div class="modal-box">
      <div class="modal-header"><span>Kosongkan Budget</span><span class="close" id="modalClose">&times;</span></div>
      <div class="modal-body"><p>Yakin ingin mengosongkan seluruh nominal budget akun <b>${akun.kode}</b> — ${akun.nama}?</p></div>
      <div class="modal-footer">
        <button class="btn-secondary" id="modalCancel">Batal</button>
        <button class="btn-danger" id="modalDelete">Kosongkan</button>
      </div>
    </div>`;
}
