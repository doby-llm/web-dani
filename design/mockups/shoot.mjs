// Viewport-by-viewport screenshots (avoids Pi GPU tile repetition on tall captures).
// Usage: node shoot.mjs <name> [name...]   (run with NODE_PATH pointing at puppeteer-core)
import puppeteer from 'puppeteer-core';
import { mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = process.env.MOCK_DIR ?? dirname(fileURLToPath(import.meta.url));
const out = join(here, 'shots'); mkdirSync(out, { recursive: true });
const names = process.argv.slice(2);
const views = [ { tag: 'desk', width: 1440, height: 900, step: 860 }, { tag: 'mob', width: 390, height: 844, step: 800, mobile: true } ];
const browser = await puppeteer.launch({ executablePath: '/usr/bin/chromium', headless: true, args: ['--hide-scrollbars'] });
for (const name of names) {
  const [file, hash] = name.split('#');
  for (const v of views) {
    const page = await browser.newPage();
    await page.setViewport({ width: v.width, height: v.height, deviceScaleFactor: 1, isMobile: !!v.mobile, hasTouch: !!v.mobile });
    await page.goto('file://' + join(here, file + '.html'), { waitUntil: 'load' });
    await page.evaluate(() => document.fonts.ready);
    await new Promise(r => setTimeout(r, 900));
    const H = await page.evaluate(() => document.documentElement.scrollHeight);
    let i = 0;
    for (let y = 0; y < H; y += v.step, i++) {
      await page.evaluate(yy => window.scrollTo(0, yy), y);
      await new Promise(r => setTimeout(r, 250));
      await page.screenshot({ path: join(out, `${file}${hash ? '-' + hash : ''}-${v.tag}-${String(i).padStart(2, '0')}.png`) });
    }
    console.log(file, v.tag, 'height', H, 'slices', i);
    await page.close();
  }
}
await browser.close();
