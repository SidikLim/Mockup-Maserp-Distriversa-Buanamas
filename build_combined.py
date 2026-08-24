#!/usr/bin/env python3
"""
Generate dbm-erp-mockup-combined.html — single-file combined build of the
DBM ERP mockup, for the Cowork artifact (double-click index.html is the
canonical multi-file version; this combined file is just for quick preview,
built by inlining everything so no lazy-load/fetch is needed).

Order: <style> from css/style.css -> vendor Chart.js -> icons.js -> data.js
-> menu.js -> all js/pages/*.template.js -> all js/pages/*.js (logic, not
.template.js) -> core.js (patched so loadedModules is pre-filled, since in
the combined file everything is already loaded, no real lazy-load needed).

Run from the root of the mockup folder: python3 build_combined.py
"""
import glob, os, re

ROOT = os.path.dirname(os.path.abspath(__file__))

def read(path):
    with open(os.path.join(ROOT, path), encoding='utf-8') as f:
        return f.read()

def main():
    css = read('css/style.css')
    chart_js = read('js/vendor/chart.umd.js')
    icons_js = read('js/icons.js')
    data_js = read('js/data.js')
    menu_js = read('js/menu.js')

    template_files = sorted(glob.glob(os.path.join(ROOT, 'js/pages/*.template.js')))
    logic_files = sorted(
        f for f in glob.glob(os.path.join(ROOT, 'js/pages/*.js'))
        if not f.endswith('.template.js')
    )

    templates_js = '\n'.join(read(os.path.relpath(f, ROOT)) for f in template_files)
    logics_js = '\n'.join(read(os.path.relpath(f, ROOT)) for f in logic_files)

    core_js = read('js/core.js')
    # Patch: in the combined build every page module's script is already
    # inlined above, so pre-fill loadedModules with every PAGE_MODULES key
    # right after it's declared, instead of relying on real lazy-load.
    core_js = core_js.replace(
        "const loadedModules=new Set();",
        "const loadedModules=new Set(Object.keys(PAGE_MODULES));"
    )

    html = f"""<!DOCTYPE html>
<html lang="id">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>PT Distriversa Buanamas — ERP Mockup</title>
<style>
{css}
</style>
</head>
<body>
<div class="topbar">
  <div class="left">
    <span class="hamburger" id="hamburgerBtn"></span>
    <div class="brand">
      <div class="logo-badge">DBM</div>
      <div class="full-name">Distriversa Buanamas<small>ERP SYSTEM — MOCKUP</small></div>
    </div>
  </div>
  <div class="topbar-right">
    <span class="icon-wrap" id="notifBtn" title="Notifikasi"><span class="badge" id="notifBadge" style="display:none;"></span></span>
    <span class="icon-wrap" title="Keamanan"></span>
    <div class="user-greet">
      <span>Halo, <span class="uname">Sidik</span></span>
      <span class="udemo">(MOCKUP DBM-2026)</span>
    </div>
  </div>
</div>

<div class="layout" id="layout">
  <aside class="sidebar">
    <div class="sidebar-scroll" id="sidebarScroll"></div>
    <div class="sidebar-footer">
      (ver. mockup.1.0) &copy; Distriversa Buanamas<br>
      Licensed to: PT Distriversa Buanamas
    </div>
  </aside>
  <main class="content" id="content"></main>
</div>

<script>
{chart_js}
</script>
<script>
{icons_js}
</script>
<script>
{data_js}
</script>
<script>
{menu_js}
</script>
<script>
{templates_js}
</script>
<script>
{logics_js}
</script>
<script>
{core_js}
</script>
</body>
</html>
"""
    out_path = os.path.join(ROOT, 'dbm-erp-mockup-combined.html')
    with open(out_path, 'w', encoding='utf-8') as f:
        f.write(html)
    print(f"Wrote {out_path} ({len(html):,} bytes)")

if __name__ == '__main__':
    main()
