// F1–F6: contact form. The endpoint-set path is tested by setting data-endpoint in the page and mocking the request,
// so nothing leaves 127.0.0.1 and the build is not changed.
import { test, expect } from '@playwright/test';
import { BASE } from './support';

test('F1 empty submit shows both required errors and focuses Nombre', async ({ page }) => {
  await page.goto('contacto/');
  await page.locator('form[data-contact] button[type="submit"]').click();
  await expect(page.locator('#f-name-err')).toBeVisible();
  await expect(page.locator('#f-email-err')).toBeVisible();
  await expect(page.locator('#f-name')).toBeFocused();
});

test('F1 "ana@" shows the email error and focuses Email', async ({ page }) => {
  await page.goto('contacto/');
  await page.locator('#f-name').fill('Ana');
  await page.locator('#f-email').fill('ana@');
  await page.locator('form[data-contact] button[type="submit"]').click();
  await expect(page.locator('#f-email-err')).toBeVisible();
  await expect(page.locator('#f-email')).toBeFocused();
});

test('F2 ?objetivo= preselects the matching goal chip (aliases from site.js 6b)', async ({ page }) => {
  const cases: [string, string, string?][] = [
    ['clinica', 'clinico'],
    ['deportiva', 'rendimiento'],
    ['medico', 'perdida-de-peso', 'B'],
    ['perdida-de-peso', 'perdida-de-peso'],
  ];
  for (const [alias, value, programa] of cases) {
    await page.goto(`contacto/?objetivo=${alias}`);
    await expect(page.locator(`input[name="objetivo"][value="${value}"]`), alias).toBeChecked();
    if (programa) await expect(page.locator('input[name="programa"]'), alias).toHaveValue(programa);
  }
});

test('F3 prototype (no endpoint): valid data shows success, focuses the status, and sends no request', async ({ page }) => {
  let posts = 0;
  page.on('request', r => { if (r.method() === 'POST') posts++; });
  await page.goto('contacto/');
  await page.locator('#f-name').fill('Ana');
  await page.locator('#f-email').fill('ana@example.com');
  await page.locator('form[data-contact] button[type="submit"]').click();
  await expect(page.locator('.form-status')).toHaveAttribute('data-state', 'success');
  await expect(page.locator('.form-status')).toBeFocused();
  expect(posts).toBe(0);
});

test('F3 endpoint set: POST success and POST failure show the matching state (mocked)', async ({ page }) => {
  const mock = `${BASE}mock-form/`;
  let status = 200;
  let posts = 0;
  await page.route(`**${mock}`, route => {
    if (route.request().method() === 'POST') posts++;
    return route.fulfill({ status, contentType: 'application/json', body: '{}' });
  });
  await page.goto('contacto/');
  await page.evaluate(endpoint => { (document.querySelector('form[data-contact]') as HTMLFormElement).dataset.endpoint = endpoint; }, mock);
  await page.locator('#f-name').fill('Ana');
  await page.locator('#f-email').fill('ana@example.com');

  await page.locator('form[data-contact] button[type="submit"]').click();
  await expect(page.locator('.form-status')).toHaveAttribute('data-state', 'success');
  expect(posts).toBe(1);

  status = 500;
  await page.locator('#f-name').fill('Ana');
  await page.locator('#f-email').fill('ana@example.com');
  await page.locator('form[data-contact] button[type="submit"]').click();
  await expect(page.locator('.form-status')).toHaveAttribute('data-state', 'error');
  expect(posts).toBe(2);
});

test('F4 honeypot is present, unfocusable and hidden from assistive tech', async ({ page }) => {
  await page.goto('contacto/');
  const hp = page.locator('input[name="empresa"]');
  await expect(hp).toHaveAttribute('tabindex', '-1');
  expect(await hp.evaluate(el => !!el.closest('[aria-hidden="true"]'))).toBe(true);
});

test('F5 labels are bound, autocomplete set, and inputs and submit are 44 px high or more', async ({ page }) => {
  await page.goto('contacto/');
  for (const [id, ac] of [['f-name', 'name'], ['f-email', 'email'], ['f-wa', 'tel']] as const) {
    await expect(page.locator(`label[for="${id}"]`), id).toHaveCount(1);
    await expect(page.locator(`#${id}`), id).toHaveAttribute('autocomplete', ac);
  }
  for (const sel of ['#f-name', '#f-email', '#f-wa', 'form[data-contact] button[type="submit"]']) {
    const box = await page.locator(sel).boundingBox();
    expect(box!.height, sel).toBeGreaterThanOrEqual(44);
  }
});

test('F6 no <select>; goal chips are a radio group with a legend', async ({ page }) => {
  await page.goto('contacto/');
  await expect(page.locator('form select')).toHaveCount(0);
  const group = page.locator('fieldset.goal-chips');
  await expect(group.locator('legend')).toHaveCount(1);
  await expect(group.locator('input[type="radio"][name="objetivo"]')).toHaveCount(6);
});
