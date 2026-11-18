// S1–S8: titles and descriptions, canonical, robots in both builds, OG/Twitter, JSON-LD types, sitemap, icons.
// Both builds are read as files: dist/ (default, noindex) and dist-indexable/ (PUBLIC_INDEXABLE=true).
import { test, expect } from '@playwright/test';
import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { pages, routes, seo, SITE, BASE } from './support';

const ABS = (path: string) => SITE + BASE + path;
const readBuild = (dir: string, path: string) => readFileSync(resolve(dir, path === '' ? 'index.html' : path.endsWith('/') ? path + 'index.html' : path), 'utf8');
const meta = (html: string, attr: string, name: string) => html.match(new RegExp(`<meta ${attr}="${name}" content="([^"]*)"`))?.[1];
const needBuild = (dir: string) => expect(existsSync(resolve(dir, 'index.html')), `${dir}/ missing: run npm run build:indexable`).toBe(true);

test('S1 title and description equal seo.json; lengths within 60 / 155', async ({ page }) => {
  for (const { key, path } of pages) {
    const entry = seo[key];
    if (!entry.title || !entry.description) continue;
    expect(entry.title.length, `${key} title length`).toBeLessThanOrEqual(60);
    expect(entry.description.length, `${key} description length`).toBeLessThanOrEqual(155);
    await page.goto(path);
    await expect(page, key).toHaveTitle(entry.title);
    await expect(page.locator('meta[name="description"]'), key).toHaveAttribute('content', entry.description);
  }
});

test('S2 canonical is absolute with a trailing slash', async ({ page }) => {
  for (const { key, path } of pages) {
    await page.goto(path);
    await expect(page.locator('link[rel="canonical"]'), key).toHaveAttribute('href', ABS(path));
  }
  expect(ABS('').endsWith('/')).toBe(true);
});

test('S3 robots: default build noindex and Disallow, indexable build index and Sitemap line', () => {
  needBuild('dist-indexable');
  for (const { key, path } of routes) {
    expect(meta(readBuild('dist', path), 'name', 'robots'), `dist ${key}`).toBe('noindex,nofollow');
    if (key !== '404') expect(meta(readBuild('dist-indexable', path), 'name', 'robots'), `dist-indexable ${key}`).toMatch(/^index,follow/);
  }
  expect(readFileSync('dist/robots.txt', 'utf8')).toMatch(/Disallow:\s*\//);
  expect(readFileSync('dist-indexable/robots.txt', 'utf8')).toMatch(/^Sitemap: .+sitemap-index\.xml/m);
});

test('S4 OG and Twitter tags complete; og:image absolute PNG 1200x630, <= 300 KB', () => {
  const tags = ['og:type', 'og:site_name', 'og:locale', 'og:title', 'og:description', 'og:url', 'og:image', 'og:image:width', 'og:image:height', 'og:image:alt', 'og:image:type'];
  const twitter = ['twitter:card', 'twitter:title', 'twitter:description', 'twitter:image', 'twitter:image:alt'];
  const problems: string[] = [];
  for (const { key, path } of pages) {
    const html = readBuild('dist', path);
    for (const t of tags) if (!meta(html, 'property', t)) problems.push(`${key} missing ${t}`);
    for (const t of twitter) if (!meta(html, 'name', t)) problems.push(`${key} missing ${t}`);
    const image = meta(html, 'property', 'og:image') ?? '';
    if (!image.startsWith('https://')) problems.push(`${key} og:image not absolute https: ${image}`);
    const local = resolve('dist', image.replace(SITE + BASE, ''));
    if (!existsSync(local)) { problems.push(`${key} og:image file missing: ${local}`); continue; }
    const png = readFileSync(local);
    if (png.subarray(1, 4).toString() !== 'PNG') problems.push(`${key} og:image is not a PNG`);
    const w = png.readUInt32BE(16), h = png.readUInt32BE(20);
    if (w !== 1200 || h !== 630) problems.push(`${key} og:image is ${w}x${h}`);
    if (png.length > 300 * 1024) problems.push(`${key} og:image is ${Math.round(png.length / 1024)} KB`);
  }
  expect(problems, problems.join('\n')).toEqual([]);
});

test('S6 JSON-LD parses and holds no Offer, MedicalBusiness, Physician or Drug', () => {
  const forbidden = new Set(['Offer', 'MedicalBusiness', 'Physician', 'Drug']);
  const problems: string[] = [];
  const types = (node: unknown): string[] => Array.isArray(node) ? node.flatMap(types)
    : node && typeof node === 'object' ? [...(('@type' in node) ? [String((node as { '@type': unknown })['@type'])] : []), ...Object.values(node).flatMap(types)]
    : [];
  for (const { key, path } of pages) {
    const html = readBuild('dist', path);
    for (const m of html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)) {
      let data: unknown;
      try { data = JSON.parse(m[1]); } catch (e) { problems.push(`${key} JSON-LD does not parse: ${e}`); continue; }
      for (const t of types(data)) if (forbidden.has(t)) problems.push(`${key} has @type ${t}`);
    }
  }
  expect(problems, problems.join('\n')).toEqual([]);
});

test('S7 sitemap lists every route and excludes 404 and /og/', () => {
  needBuild('dist-indexable');
  const xml = readFileSync('dist-indexable/sitemap-0.xml', 'utf8');
  const locs = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map(m => m[1]);
  const missing = pages.map(p => ABS(p.path)).filter(u => !locs.includes(u));
  expect(missing, 'routes missing from sitemap').toEqual([]);
  expect(locs.filter(l => l.includes('/og/') || l.includes('404')), 'excluded entries present').toEqual([]);
});

test('S8 favicon set and manifest answer 200', async ({ request }) => {
  for (const f of ['favicon.svg', 'favicon-32.png', 'apple-touch-icon.png', 'site.webmanifest']) {
    const res = await request.get(BASE + f);
    expect(res.status(), f).toBe(200);
  }
});

test.describe('S1/S2 on the article template (fixture, port 4322)', () => {
  test.use({ baseURL: 'http://127.0.0.1:4322/web-dani/' });
  test('post title, description and canonical follow the frontmatter', async ({ page }) => {
    await page.goto('blog/fixture-post/');
    await expect(page).toHaveTitle('Artículo de prueba · Daniel Clemente');
    await expect(page.locator('meta[name="description"]')).toHaveAttribute('content', 'Texto de prueba para la plantilla.');
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', ABS('blog/fixture-post/'));
  });
});
