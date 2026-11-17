// Viewport-by-viewport screenshots of built routes (avoids Pi GPU tile repetition on tall captures).
// Usage: npm run shots -- / /programas/   → shots/<slug>-{desk,mob}-NN.png
// Starts `astro preview` on :4321 unless it is already answering; needs a prior `npm run build`.
import puppeteer from 'puppeteer-core';
import { spawn } from 'node:child_process';
import { mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const out = join(root, 'shots');
const origin = 'http://localhost:4321';
const base = process.env.BASE_PATH ?? '/web-dani/';
const routes = process.argv.slice(2);
const views = [
  { tag: 'desk', width: 1440, height: 900, step: 860 },
  { tag: 'mob', width: 390, height: 844, step: 800, mobile: true },
];

if (routes.length === 0) {
  console.error('usage: npm run shots -- / /programas/');
  process.exit(1);
}

const up = () => fetch(origin + base).then(r => r.ok, () => false);
const wait = ms => new Promise(r => setTimeout(r, ms));

let preview = null;
if (!(await up())) {
  preview = spawn(join(root, 'node_modules', '.bin', 'astro'), ['preview', '--port', '4321'], { cwd: root, stdio: 'ignore' });
  for (let i = 0; i < 60 && !(await up()); i++) await wait(500);
  if (!(await up())) {
    preview.kill();
    throw new Error('astro preview did not answer on ' + origin + base);
  }
}

mkdirSync(out, { recursive: true });
const browser = await puppeteer.launch({
  executablePath: process.env.CHROMIUM_PATH ?? '/usr/bin/chromium',
  headless: true,
  args: ['--hide-scrollbars'],
});

try {
  for (const route of routes) {
    const slug = route === '/' ? 'home' : route.replace(/^\/|\/$/g, '').replace(/\//g, '-');
    const url = origin + base + route.replace(/^\//, '');
    for (const v of views) {
      const page = await browser.newPage();
      await page.setViewport({ width: v.width, height: v.height, deviceScaleFactor: 1, isMobile: !!v.mobile, hasTouch: !!v.mobile });
      await page.goto(url, { waitUntil: 'load' });
      await page.evaluate(() => document.fonts.ready);
      await wait(900);
      const H = await page.evaluate(() => document.documentElement.scrollHeight);
      let i = 0;
      for (let y = 0; y < H; y += v.step, i++) {
        await page.evaluate(yy => window.scrollTo(0, yy), y);
        await wait(250);
        await page.screenshot({ path: join(out, `${slug}-${v.tag}-${String(i).padStart(2, '0')}.png`) });
      }
      console.log(route, v.tag, 'height', H, 'slices', i);
      await page.close();
    }
  }
} finally {
  await browser.close();
  if (preview) preview.kill();
}
