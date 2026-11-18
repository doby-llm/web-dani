// Q8: every string leaf in src/data/copy/*.json is rendered in the default build (text or attribute, entities decoded),
// or listed in tests/copy-allowlist.json with a reason. Exit 1 listing the rest.
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { join, resolve } from 'node:path';

const dist = resolve('dist');
if (!existsSync(dist)) {
  console.error('dist/ missing: run npm run build first');
  process.exit(1);
}

const decode = s => s
  .replace(/&#x([0-9a-f]+);/gi, (_, h) => String.fromCodePoint(parseInt(h, 16)))
  .replace(/&#(\d+);/g, (_, d) => String.fromCodePoint(Number(d)))
  .replace(/&nbsp;/g, ' ').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&amp;/g, '&');
const norm = s => s.replace(/\s+/g, ' ').trim();

// Haystacks: raw decoded HTML (catches attributes) and the same with tags removed (catches text split by <em>).
const htmlFiles = [];
const walk = dir => { for (const n of readdirSync(dir)) { const p = join(dir, n); if (statSync(p).isDirectory()) walk(p); else if (n.endsWith('.html')) htmlFiles.push(p); } };
walk(dist);
const raw = norm(htmlFiles.map(f => decode(readFileSync(f, 'utf8'))).join('\n'));
const text = norm(htmlFiles.map(f => decode(readFileSync(f, 'utf8')).replace(/<script[\s\S]*?<\/script>/g, ' ').replace(/<[^>]+>/g, ' ')).join('\n'));
// Rendering transforms this check accepts, and nothing more:
//  - fully uppercase brand strings are shown in title case by brandCase() (lib/text.ts);
//  - {año} is the footer year span (refreshed by site.js);
//  - disclaimers are split into sentences (home medical text is split across roles and notes, R4; see notes.spec).
const phrase = s => {
  const esc = t => t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return s.split('{año}').map(esc).join('\\d{4}');
};
const hay = [raw, text];
const renderedOne = s => {
  const re = new RegExp(phrase(norm(s)));
  if (hay.some(h => re.test(h))) return true;
  if (s === s.toUpperCase() && s !== s.toLowerCase()) {
    const caseless = new RegExp(phrase(norm(s)), 'i');
    return hay.some(h => caseless.test(h));
  }
  return false;
};
const sentences = t => t.split(/(?<=\.)\s+/);
const rendered = (path, s) => path.includes('disclaimers')
  ? sentences(s).every(renderedOne)
  : renderedOne(s);

const allowlist = JSON.parse(readFileSync(resolve('tests/copy-allowlist.json'), 'utf8'));
const allowed = (page, path) => allowlist.some(e => e.page === page && (path === e.path || path.startsWith(e.path + '.') || path.startsWith(e.path + '[')));

const leaves = [];
const collect = (page, node, path) => {
  if (typeof node === 'string') leaves.push({ page, path, value: node });
  else if (Array.isArray(node)) node.forEach((v, i) => collect(page, v, `${path}[${i}]`));
  else if (node && typeof node === 'object') for (const [k, v] of Object.entries(node)) collect(page, v, path ? `${path}.${k}` : k);
};
for (const f of readdirSync(resolve('src/data/copy')).filter(n => n.endsWith('.json')).sort()) {
  collect(f.replace(/\.json$/, ''), JSON.parse(readFileSync(resolve('src/data/copy', f), 'utf8')), '');
}

const unused = leaves.filter(l => l.value.trim() && !allowed(l.page, l.path) && !rendered(l.path, l.value));
const stale = allowlist.filter(e => !leaves.some(l => l.page === e.page && (l.path === e.path || l.path.startsWith(e.path + '.') || l.path.startsWith(e.path + '['))));

console.log(`copy strings: ${leaves.length}, allowlisted entries: ${allowlist.length}`);
for (const e of stale) console.log(`allowlist entry matches no copy string: ${e.page} ${e.path}`);
if (unused.length) {
  console.log(`\n${unused.length} copy strings neither rendered nor allowlisted:`);
  for (const u of unused) console.log(`  ${u.page} ${u.path}: ${JSON.stringify(u.value.slice(0, 80))}`);
  process.exit(1);
}
console.log('every copy string is rendered or allowlisted');
