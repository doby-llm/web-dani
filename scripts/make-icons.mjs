// One-off generator for the static icon set. Outputs are committed; rerun only when the palette or the monogram changes:
//   node scripts/make-icons.mjs
// Colours come from the PALETTE block of src/styles/tokens.css (R14), never from literals here.
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { Resvg } from '@resvg/resvg-js';
import satori from 'satori';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const tokens = readFileSync(join(root, 'src/styles/tokens.css'), 'utf8');
const palette = tokens.slice(tokens.indexOf('PALETTE:BEGIN'), tokens.indexOf('PALETTE:END'));
const color = (name) => {
  const m = palette.match(new RegExp(`--${name}:\\s*(#[0-9a-fA-F]{6})\\s*;`));
  if (!m) throw new Error(`--${name} is missing from the PALETTE block`);
  return m[1];
};

// "DC" monogram as outlines (satori, Fraunces 560, 30 px, centred on a 64 px box).
const serif = readFileSync(join(root, 'src/assets/og-fonts/fraunces-og-560.ttf'));
const glyphs = await satori(
  {
    type: 'div',
    props: {
      style: { display: 'flex', width: 64, height: 64, alignItems: 'center', justifyContent: 'center', fontFamily: 'Fraunces', fontWeight: 560, fontSize: 30, color: 'black' },
      children: 'DC',
    },
  },
  { width: 64, height: 64, fonts: [{ name: 'Fraunces', data: serif, weight: 560, style: 'normal' }] },
);
const paths = [...glyphs.matchAll(/ d="([^"]+)"/g)].map(m => m[1]);
if (!paths.length) throw new Error('monogram produced no outlines');

const brand = color('brand');
const paper = color('paper');
const sun = color('sun');

// Same mark for the favicon (rounded) and the apple/Android sizes (square, no transparency).
const mark = (radius) => `<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 64 64">
<rect width="64" height="64" rx="${radius}" fill="${brand}"/>
<g fill="${paper}">${paths.map(d => `<path d="${d}"/>`).join('')}</g>
<circle cx="52" cy="12" r="4" fill="${sun}"/>
</svg>
`;

const favicon = mark(14);
writeFileSync(join(root, 'public/favicon.svg'), favicon);
const png = (svg, width) => new Resvg(svg, { fitTo: { mode: 'width', value: width } }).render().asPng();
writeFileSync(join(root, 'public/favicon-32.png'), png(favicon, 32));
writeFileSync(join(root, 'public/apple-touch-icon.png'), png(mark(0), 180));
writeFileSync(join(root, 'public/icon-512.png'), png(favicon, 512));

const manifest = {
  name: 'Daniel Clemente · Nutricionista',
  short_name: 'D. Clemente',
  lang: 'es',
  start_url: './',
  display: 'browser',
  background_color: paper,
  theme_color: brand,
  icons: [
    { src: 'icon-512.png', sizes: '512x512', type: 'image/png' },
    { src: 'apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
  ],
};
writeFileSync(join(root, 'public/site.webmanifest'), `${JSON.stringify(manifest, null, 2)}\n`);
console.log(`icons written: ${paths.length} glyph paths, brand ${brand}, sun ${sun}`);
