// Copy pipeline: content-src/copydeck/*.yaml (verbatim) + content-src/overrides.yaml → src/data/copy/*.json.
// Usage: npm run copy         writes the JSON
//        npm run check:copy   exits 1 if the committed JSON is stale or an override no longer matches
import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { basename, dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parse } from 'yaml';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const deckDir = join(root, 'content-src', 'copydeck');
const outDir = join(root, 'src', 'data', 'copy');
const overrides = parse(readFileSync(join(root, 'content-src', 'overrides.yaml'), 'utf8'));

const DROP_KEYS = new Set(['eyebrow', 'kicker', 'number', 'stamp', 'badge', 'featured', 'recommended', 'scope', 'noscript', 'old_path']);
const NOTE_KIND = new Map(Object.entries(overrides.notes_kind).flatMap(([kind, texts]) => texts.map(t => [t, kind])));

// "form.fields[2].label" → ["form", "fields", 2, "label"]
const tokenize = where => [...where.matchAll(/\[(\d+)\]|([^.[\]]+)/g)].map(([, i, k]) => (i !== undefined ? Number(i) : k));

function eachString(node, fn) {
  for (const [k, v] of Object.entries(node)) {
    if (typeof v === 'string') node[k] = fn(v);
    else if (v && typeof v === 'object') eachString(v, fn);
  }
}

function applyOverrides(data, page, errors) {
  for (const { find, replace = '', where } of overrides[page] ?? []) {
    let hits = 0;
    const replaceIn = s => {
      hits += s.split(find).length - 1;
      return s.replaceAll(find, replace);
    };
    if (where) {
      const path = tokenize(where);
      const parent = path.slice(0, -1).reduce((node, k) => node?.[k], data);
      const key = path.at(-1);
      if (typeof parent?.[key] === 'string') parent[key] = replaceIn(parent[key]);
    } else {
      eachString(data, replaceIn);
    }
    if (hits === 0) errors.push(`${page}: "${find}"${where ? ` at ${where}` : ''} matched 0 times`);
  }
}

const toNote = text => ({ text, kind: NOTE_KIND.get(text) ?? 'provisional' });

// Drops internal keys and emptied strings; disclaimers become {text, kind} (DEC-07).
function clean(node) {
  if (Array.isArray(node)) return node.filter(v => v !== '').map(clean);
  if (!node || typeof node !== 'object') return node;
  const out = {};
  for (const [k, v] of Object.entries(node)) {
    if (DROP_KEYS.has(k) || v === '') continue;
    const value = clean(v);
    out[k] = k === 'disclaimers' ? value.map(toNote) : value;
  }
  return out;
}

function build() {
  const errors = [];
  const files = new Map();
  const pages = readdirSync(deckDir).filter(f => f.endsWith('.yaml')).map(f => basename(f, '.yaml'));
  for (const page of pages) {
    const data = parse(readFileSync(join(deckDir, `${page}.yaml`), 'utf8'));
    applyOverrides(data, page, errors);
    const out = clean(data);
    if (out.form?.notes) out.form.notes = out.form.notes.map(toNote);
    files.set(`${page === '_shared' ? 'shared' : page}.json`, JSON.stringify(out, null, 2) + '\n');
  }
  for (const page of Object.keys(overrides)) {
    if (page !== 'notes_kind' && !pages.includes(page)) errors.push(`${page}: overrides for a page with no copydeck file`);
  }
  return { files, errors };
}

const { files, errors } = build();
if (errors.length) {
  console.error(`copy: ${errors.length} override problem(s):\n  ${errors.join('\n  ')}`);
  process.exit(1);
}

if (process.argv.includes('--check')) {
  const drift = [...files].filter(([name, text]) => !existsSync(join(outDir, name)) || readFileSync(join(outDir, name), 'utf8') !== text).map(([name]) => name);
  const stale = existsSync(outDir) ? readdirSync(outDir).filter(f => f.endsWith('.json') && !files.has(f)).map(f => `${f} (no source)`) : [];
  const problems = [...drift, ...stale];
  if (problems.length) {
    console.error(`copy: src/data/copy is out of date, run npm run copy:\n  ${problems.join('\n  ')}`);
    process.exit(1);
  }
  console.log(`copy: ${files.size} files in sync`);
} else {
  mkdirSync(outDir, { recursive: true });
  for (const [name, text] of files) writeFileSync(join(outDir, name), text);
  console.log(`copy: wrote ${files.size} files to src/data/copy/`);
}
