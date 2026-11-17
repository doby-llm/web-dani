#!/usr/bin/env python3
"""Assemble planner mockups: src/<name>.body.html + shared header/footer -> <name>.html.
Run: python3 -I design/mockups/build.py   (from the planning dir)."""
import pathlib, re, sys

HERE = pathlib.Path(__file__).resolve().parent
SRC = HERE / "src"
import os
PALETTE = os.environ.get("PALETTE", "salvia")
OUTDIR = HERE if os.environ.get("PALETTE_OUT", "main") == "main" else HERE.parent / f"mockups-{PALETTE}"
ICONS = (HERE.parent / "icons.svg").read_text()
HEADER = (SRC / "_header.html").read_text()
FOOTER = (SRC / "_footer.html").read_text()

HEAD = """<!doctype html>
<html lang="es">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>{title}</title>
<meta name="robots" content="noindex">
<link rel="stylesheet" href="../css/tokens.css">
<link rel="stylesheet" href="../palettes/{palette}.css">
<link rel="stylesheet" href="../css/base.css">
<link rel="stylesheet" href="../css/components.css">
<style>
/* mockup-only helpers */
@media (max-width: 899px) {{ .hide-mobile {{ display: none !important; }} }}
</style>
</head>
<body>
"""

def build(body_path: pathlib.Path) -> str:
    raw = body_path.read_text()
    m = re.search(r"<!-- META (.*?) -->", raw)
    meta = dict(re.findall(r'(\w+)="([^"]*)"', m.group(1))) if m else {}
    hdr = HEADER
    cur = meta.get("cur", "")
    for key in ("como", "programas", "sobre", "blog"):
        hdr = hdr.replace("{{CUR_%s}}" % key, 'aria-current="page"' if key == cur else "")
    hdr = hdr.replace("{{HEADER_VARIANT}}", meta.get("header", ""))
    services_open = meta.get("services_open") == "1"
    hdr = hdr.replace("{{SERVICES_OPEN}}", "true" if services_open else "false")
    hdr = hdr.replace("{{SERVICES_HIDDEN}}", "" if services_open else "hidden")
    ftr = FOOTER
    sheet_open = meta.get("sheet") == "1"
    ftr = ftr.replace("{{SHEET_OPEN}}", "true" if sheet_open else "false")
    ftr = ftr.replace("{{SHEET_INERT}}", "" if sheet_open else "inert")
    ftr = ftr.replace("{{BAR_VISIBLE}}", "true" if meta.get("bar") == "1" else "false")
    return (HEAD.format(title=meta.get("title", "Mockup"), palette=PALETTE) + ICONS + "\n" + hdr + raw + ftr +
            '\n<script src="../js/site.js" defer></script>\n</body>\n</html>\n')

targets = sys.argv[1:] or [p.name.replace(".body.html", "") for p in sorted(SRC.glob("*.body.html"))]
for name in targets:
    OUTDIR.mkdir(parents=True, exist_ok=True)
    out = OUTDIR / f"{name}.html"
    out.write_text(build(SRC / f"{name}.body.html"))
    print("wrote", out.relative_to(HERE.parent.parent))
