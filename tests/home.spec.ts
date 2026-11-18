// I1 duration switch (JS and no-JS), I2 still-life settle (once, off under reduced motion), N5 header shadow after scroll.
import { test, expect } from '@playwright/test';

const amounts = (page: import('@playwright/test').Page) => page.locator('.plan__amount').allTextContents();
const labels = (page: import('@playwright/test').Page) => page.locator('[data-duration-label]').allTextContents();

test.describe('I1 duration switch', () => {
  test('changes both plan prices and the label', async ({ page }) => {
    await page.goto('');
    expect(await amounts(page)).toEqual(['180 €', '280 €']);
    expect(await labels(page)).toEqual(['2 meses', '2 meses']);

    await page.locator('.duration__opt', { hasText: '4 meses' }).click();
    await expect.poll(() => amounts(page)).toEqual(['320 €', '420 €']);
    expect(await labels(page)).toEqual(['4 meses', '4 meses']);

    await page.locator('.duration__opt', { hasText: '6 meses' }).click();
    await expect.poll(() => amounts(page)).toEqual(['450 €', '550 €']);
    expect(await labels(page)).toEqual(['6 meses', '6 meses']);
  });
});

test.describe('I1 duration switch without JS', () => {
  test.use({ javaScriptEnabled: false });
  test('shows 2 meses prices', async ({ page }) => {
    await page.goto('');
    expect(await amounts(page)).toEqual(['180 €', '280 €']);
    await expect(page.locator('input[name="dur"][value="2"]')).toBeChecked();
  });
});

test('I2 still-life settle runs once and the page does not loop it', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.goto('');
  const obj = page.locator('.hero .still--settle .still__obj').first();
  await expect(obj).toBeVisible();
  expect(await obj.evaluate(el => getComputedStyle(el).animationName)).toBe('settle');
  expect(await obj.evaluate(el => getComputedStyle(el).animationIterationCount)).toBe('1');
  await page.waitForTimeout(1200);
  expect(await obj.evaluate(el => el.getAnimations().filter(a => a.playState === 'running').length)).toBe(0);
});

test('I2 still-life settle is off under prefers-reduced-motion (base.css shortens it to 1 ms)', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('');
  const obj = page.locator('.hero .still--settle .still__obj').first();
  expect(await obj.evaluate(el => getComputedStyle(el).animationDuration)).toBe('0.001s');
});

test('I2 no still life on medical, programas, FAQ or legal pages (article: see blog.spec)', async ({ page }) => {
  for (const path of ['perdida-de-peso/tratamiento-medico/', 'programas/', 'preguntas-frecuentes/', 'aviso-legal/', 'privacidad/', 'cookies/']) {
    await page.goto(path);
    await expect(page.locator('.still'), path).toHaveCount(0);
  }
});

test('N5 header gains data-scrolled=true after scrolling', async ({ page }) => {
  await page.goto('');
  const header = page.locator('.site-header');
  await expect(header).toHaveAttribute('data-scrolled', 'false');
  await page.evaluate(() => window.scrollTo(0, 400));
  await expect(header).toHaveAttribute('data-scrolled', 'true');
});
