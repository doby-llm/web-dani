// Q7: no third-party requests.
// Live: every request made while visiting each route goes to 127.0.0.1.
// Static: dist/**/*.html and *.css contain no external URL except the allowed namespaces below.
import { test, expect } from '@playwright/test';
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { routes, SITE } from './support';

// schema.org JSON-LD context, the SVG namespace in inline icons, and the site's own origin
// (canonical, og:image and sitemap URLs are absolute by design, SPEC §5). Nothing else.
const ALLOWED = ['https://schema.org', 'http://www.w3.org/2000/svg', SITE + '/web-dani/'];

test('every request goes to 127.0.0.1', async ({ page }) => {
  const offHost: string[] = [];
  page.on('request', req => {
    const u = new URL(req.url());
    if (u.protocol.startsWith('http') && u.hostname !== '127.0.0.1') offHost.push(req.url());
  });
  for (const r of routes) await page.goto(r.path);
  expect(offHost, `requests outside 127.0.0.1:\n${offHost.join('\n')}`).toEqual([]);
});

test('no external URLs in dist HTML or CSS', () => {
  const files: string[] = [];
  const walk = (dir: string) => {
    for (const name of readdirSync(dir)) {
      const p = join(dir, name);
      if (statSync(p).isDirectory()) walk(p);
      else if (/\.(html|css)$/.test(name)) files.push(p);
    }
  };
  walk('dist');
  expect(files.length, 'no dist/ files found: run npm run build first').toBeGreaterThan(0);

  const bad: string[] = [];
  for (const f of files) {
    const text = readFileSync(f, 'utf8');
    for (const m of text.matchAll(/https?:\/\/[^\s"'<>()\\]+/g)) {
      if (!ALLOWED.some(a => m[0].startsWith(a))) bad.push(`${f}: ${m[0]}`);
    }
  }
  expect(bad, `external URLs:\n${bad.join('\n')}`).toEqual([]);
});
