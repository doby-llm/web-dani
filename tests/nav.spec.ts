// N1–N4: header disclosure, mobile sheet, mobile action bar, aria-current. Desktop/mobile split by viewport width.
import { test, expect } from '@playwright/test';
import { pages } from './support';

const width = (page: import('@playwright/test').Page) => page.viewportSize()!.width;

test('N1 desktop: Servicios disclosure opens, closes on Esc and on focus-out', async ({ page }) => {
  test.skip(width(page) < 1024, 'desktop header only');
  await page.goto('');
  const btn = page.locator('.nav-menu > button');
  const panel = page.locator('.nav-menu__panel');
  await expect(btn).toHaveAttribute('aria-expanded', 'false');
  await expect(panel).toBeHidden();

  await btn.click();
  await expect(btn).toHaveAttribute('aria-expanded', 'true');
  await expect(panel).toBeVisible();

  await page.keyboard.press('Escape');
  await expect(btn).toHaveAttribute('aria-expanded', 'false');
  await expect(panel).toBeHidden();

  await btn.click();
  await page.locator('.nav__cta').focus();
  await expect(btn).toHaveAttribute('aria-expanded', 'false');
  await expect(panel).toBeHidden();
});

test('N2 mobile: sheet opens, locks scroll, Esc closes and returns focus to Menú', async ({ page }) => {
  test.skip(width(page) >= 1024, 'mobile sheet only');
  await page.goto('');
  const sheet = page.locator('#menu-sheet');
  const menu = page.locator('.site-header .nav-toggle');
  await expect(sheet).toHaveAttribute('inert', '');
  await expect(sheet).toHaveAttribute('data-open', 'false');

  await menu.click();
  await expect(sheet).toHaveAttribute('data-open', 'true');
  await expect(sheet).not.toHaveAttribute('inert', '');
  await expect(menu).toHaveAttribute('aria-expanded', 'true');
  expect(await page.evaluate(() => document.documentElement.style.overflow)).toBe('hidden');
  expect(await page.evaluate(() => !!document.getElementById('menu-sheet')!.contains(document.activeElement))).toBe(true);

  await page.keyboard.press('Escape');
  await expect(sheet).toHaveAttribute('data-open', 'false');
  await expect(sheet).toHaveAttribute('inert', '');
  expect(await page.evaluate(() => document.documentElement.style.overflow)).toBe('');
  expect(await page.evaluate(() => document.activeElement?.textContent?.trim())).toBe(await menu.textContent().then(t => t!.trim()));
});

test('N3 mobile: action bar hidden on load, shows after hero CTAs, hides over footer; absent on contacto and 404', async ({ page }) => {
  test.skip(width(page) >= 900, 'action bar is mobile only');
  await page.goto('');
  const bar = page.locator('.action-bar');
  await expect(bar).toHaveAttribute('data-visible', 'false');

  await page.evaluate(() => window.scrollTo(0, 1200));
  await expect(bar).toHaveAttribute('data-visible', 'true');

  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await expect(bar).toHaveAttribute('data-visible', 'false');

  await page.goto('contacto/');
  await expect(page.locator('.action-bar')).toHaveCount(0);
  await page.goto('404.html');
  await expect(page.locator('.action-bar')).toHaveCount(0);
});

test('N4 aria-current on the nav link and on the last breadcrumb item', async ({ page }) => {
  await page.goto('programas/');
  await expect(page.locator('nav.nav a[aria-current="page"]')).toHaveText('Programas');
  await page.goto('blog/');
  await expect(page.locator('nav.nav a[aria-current="page"]')).toHaveText('Blog');

  for (const p of pages.filter(p => p.path !== '')) {
    await page.goto(p.path);
    const crumbs = page.locator('nav.breadcrumb li');
    if (await crumbs.count() === 0) continue;
    await expect(crumbs.last(), `breadcrumb of ${p.key}`).toHaveAttribute('aria-current', 'page');
  }
});
