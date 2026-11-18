// B1–B4: blog index teasers, no draft output, article template on the fixture server (port 4322), TOC state.
import { test, expect } from '@playwright/test';
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { resolve } from 'node:path';

test('B1 index: four "Próximamente" teasers, none linked, no published posts in the default build', async ({ page }) => {
  await page.goto('blog/');
  const rows = page.locator('ul.posts > li.post-row');
  await expect(rows).toHaveCount(4);
  await expect(page.locator('ul.posts .post-row__status')).toHaveText(['Próximamente', 'Próximamente', 'Próximamente', 'Próximamente']);
  await expect(page.locator('ul.posts a')).toHaveCount(0);
});

test('B2 default build has no draft post output', () => {
  const dir = resolve('dist/blog');
  expect(existsSync(dir)).toBe(true);
  const entries = readdirSync(dir).filter(n => statSync(resolve(dir, n)).isDirectory());
  expect(entries, 'folders under dist/blog/').toEqual([]);
  expect(existsSync(resolve(dir, 'glp-1-y-perdida-de-peso'))).toBe(false);
  expect(readFileSync(resolve(dir, 'index.html'), 'utf8')).not.toContain('glp-1-y-perdida-de-peso');
});

test.describe('article template with the fixture (dev server on 4322)', () => {
  test.use({ baseURL: 'http://127.0.0.1:4322/web-dani/' });

  test('B3 fixture post renders: title, TOC links that resolve, author box, closing section', async ({ page }) => {
    await page.goto('blog/fixture-post/');
    await expect(page.locator('h1')).toHaveText('Artículo de prueba');
    const links = page.locator('nav.toc a');
    await expect(links).toHaveCount(2);
    for (const href of await links.evaluateAll(els => els.map(e => e.getAttribute('href')))) {
      expect(await page.evaluate(id => !!document.getElementById(id), href!.slice(1)), href!).toBe(true);
    }
    await expect(page.locator('.author-box')).toHaveCount(1);
    await expect(page.locator('section[data-hide-action-bar]')).toHaveCount(1);
  });

  test('B3 article has no still life (R20)', async ({ page }) => {
    await page.goto('blog/fixture-post/');
    await expect(page.locator('.still')).toHaveCount(0);
  });

  test('B4 TOC marks the current h2 at >= 1024 px', async ({ page }) => {
    test.skip((page.viewportSize()?.width ?? 0) < 1024, 'TOC highlight is desktop only');
    await page.goto('blog/fixture-post/');
    const second = page.locator('nav.toc a').nth(1);
    await page.evaluate(() => window.scrollTo(0, document.querySelectorAll('.article-body h2')[1].getBoundingClientRect().top + window.scrollY - 40));
    await expect(second).toHaveAttribute('aria-current', 'true');
    await expect(page.locator('nav.toc a').first()).toHaveAttribute('aria-current', 'false');
  });
});
