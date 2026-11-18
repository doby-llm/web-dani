// Q4: size budgets (SPEC §9), read from the default build in dist/. Prints a table; exit 1 on any over-budget row.
// KB = 1024 bytes. Gzip uses zlib level 9. Page transfer = the HTML plus every local src/href/srcset file it references.
import { gzipSync } from 'node:zlib';
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { join, resolve } from 'node:path';

const KB = 1024;
const dist = resolve('dist');
const limits = { js: 6 * KB, css: 15 * KB, fonts: 100 * KB, page: 450 * KB };

if (!existsSync(dist)) {
  console.error('dist/ missing: run npm run build first');
  process.exit(1);
}

const files = (dir, re) => existsSync(dir) ? readdirSync(dir).filter(n => re.test(n)).map(n => join(dir, n)) : [];
const gz = paths => paths.reduce((sum, p) => sum + gzipSync(readFileSync(p), { level: 9 }).length, 0);
const raw = paths => paths.reduce((sum, p) => sum + statSync(p).size, 0);

const js = files(join(dist, '_astro'), /\.js$/);
const css = files(join(dist, '_astro'), /\.css$/);
const fonts = files(join(dist, '_astro'), /\.woff2?$/).concat(files(join(dist, 'fonts'), /\.woff2?$/));

const rows = [
  { check: 'JS gzip total', value: gz(js), limit: limits.js },
  { check: 'CSS gzip total', value: gz(css), limit: limits.css },
  { check: 'fonts total (raw)', value: raw(fonts), limit: limits.fonts },
];

// Per page: HTML bytes plus each local asset it references (href, src, every srcset candidate).
const htmlFiles = [];
const walk = dir => { for (const n of readdirSync(dir)) { const p = join(dir, n); if (statSync(p).isDirectory()) walk(p); else if (n.endsWith('.html')) htmlFiles.push(p); } };
walk(dist);
for (const file of htmlFiles) {
  const html = readFileSync(file, 'utf8');
  const refs = new Set();
  for (const m of html.matchAll(/\s(?:href|src)="([^"]+)"/g)) refs.add(m[1]);
  // The browser downloads ONE candidate per srcset; count the largest (conservative for 2x screens), not all of them (F1 ruling).
  for (const m of html.matchAll(/\ssrcset="([^"]+)"/g)) { const cs = m[1].split(',').map(c => c.trim().split(/\s+/)); cs.sort((a, b) => parseFloat(a[1] || '0') - parseFloat(b[1] || '0')); refs.add(cs[cs.length - 1][0]); }
  const base = '/web-dani/';
  const local = [...refs]
    .filter(r => r.startsWith(base) && !r.includes('?') && r.split('#')[0].match(/\.[a-z0-9]+$/i))
    .map(r => join(dist, r.slice(base.length).split('#')[0]))
    .filter(p => existsSync(p) && statSync(p).isFile());
  const total = statSync(file).size + raw([...new Set(local)]);
  rows.push({ check: `page ${file.slice(dist.length + 1)} (transfer)`, value: total, limit: limits.page });
}

let failed = 0;
const fmt = n => `${(n / KB).toFixed(2)} KB`;
console.log('| check | value | limit | result |');
console.log('|---|---|---|---|');
for (const r of rows) {
  const ok = r.value <= r.limit;
  if (!ok) failed++;
  console.log(`| ${r.check} | ${fmt(r.value)} | ${fmt(r.limit)} | ${ok ? 'PASS' : 'FAIL'} |`);
}
console.log(`\n${rows.length - failed}/${rows.length} within budget`);
process.exit(failed ? 1 : 0);
