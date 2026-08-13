/* =========================================================
   TEMPLATE (HTML saja) — Profil Perusahaan
   Logic-nya ada di file sebelah: company-profile.js
========================================================= */
function tplCompanyProfile(){
  return `
    <div class="breadcrumb">Home / <b>Profil Perusahaan</b></div>
    <div class="page-head"><h2>Profil Perusahaan</h2></div>
    <div class="card"><div class="card-body">
      <div style="display:flex;gap:22px;align-items:center;margin-bottom:24px;">
        <div class="logo-badge" style="width:64px;height:64px;font-size:22px;border-radius:12px;background:var(--blue);color:#fff;display:flex;align-items:center;justify-content:center;">DBM</div>
        <div>
          <div style="font-size:19px;font-weight:700;">PT Distriversa Buanamas</div>
          <div style="color:var(--text-light);font-size:12.8px;">Distributor &amp; Trading Perusahaan</div>
        </div>
      </div>
      <dl class="profile-grid">
        <dt>Nama Perusahaan</dt><dd>PT Distriversa Buanamas</dd>
        <dt>Alamat</dt><dd>Jl. Raya Industri No. 88, Jakarta Utara, DKI Jakarta</dd>
        <dt>NPWP</dt><dd>01.234.567.8-901.000</dd>
        <dt>Telepon</dt><dd>(021) 555-8899</dd>
        <dt>Email</dt><dd>info@distriversabuanamas.co.id</dd>
        <dt>Bidang Usaha</dt><dd>Distribusi &amp; Perdagangan Umum</dd>
        <dt>Jumlah Cabang</dt><dd>5 Cabang (Jakarta, Surabaya, Bandung, Medan, Makassar)</dd>
      </dl>
    </div></div>`;
}
