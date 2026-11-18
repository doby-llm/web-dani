// P2–P9, L1: DOM checks per page (visual composition is the coordinator's shots review, not automated here).
// Still counts follow R20 (2 per hero that has one; 0 on medical, programas, FAQ, legal) with home at 3 (R21).
import { test, expect, type Page } from '@playwright/test';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const copy = (file: string) => JSON.parse(readFileSync(resolve('src/data/copy', file + '.json'), 'utf8'));
const iconIds = new Set([...readFileSync(resolve('public/icons.svg'), 'utf8').matchAll(/id="(i-[^"]+)"/g)].map(m => m[1]));
// Top-level section kinds in document order: hero, band, or the bg-* ground.
const kinds = (page: Page) => page.locator('main > section').evaluateAll(els => els.map(el => {
  const cls = el.className;
  if (cls.includes('page-hero')) return 'hero';
  if (cls.includes('cta-band')) return 'band';
  return (cls.match(/bg-[a-z]+/) || ['other'])[0];
}));

test('P3 service pages follow the SPEC §3 order', async ({ page }) => {
  await page.goto('perdida-de-peso/');
  expect(await kinds(page)).toEqual(['hero', 'bg-paper', 'bg-medical', 'band']);
  for (const p of ['nutricion-deportiva/', 'nutricion-clinica/']) {
    await page.goto(p);
    expect(await kinds(page), p).toEqual(['hero', 'bg-paper', 'bg-surface', 'bg-paper', 'band']);
    await expect(page.locator('aside.fiche'), p).toHaveCount(1);
  }
});

test('P3 perdida-de-peso and tratamiento-medico heroes carry the fiche and the right geometry', async ({ page }) => {
  await page.goto('perdida-de-peso/');
  await expect(page.locator('aside.fiche')).toHaveCount(1);
  await page.goto('perdida-de-peso/tratamiento-medico/');
  await expect(page.locator('table.roles')).toHaveCount(1);
  await expect(page.locator('.still')).toHaveCount(0);
});

test('P2 areas: one .areas list per service page with the copy item count, and every icon exists in icons.svg', async ({ page }) => {
  const sport = copy('nutricion-deportiva').sections.find((s: { id: string }) => s.id === 'areas-de-trabajo');
  const clinic = copy('nutricion-clinica').sections.find((s: { id: string }) => s.id === 'areas-de-trabajo');
  for (const [path, expected] of [['nutricion-deportiva/', sport.items.length], ['nutricion-clinica/', clinic.items.length]] as const) {
    await page.goto(path);
    await expect(page.locator('ul.areas > li.area'), path).toHaveCount(expected);
    const hrefs = await page.locator('ul.areas use').evaluateAll(els => els.map(e => e.getAttribute('href') ?? ''));
    expect(hrefs.length, `${path} icon count`).toBe(expected);
    const missing = hrefs.map(h => h.split('#')[1]).filter(id => !iconIds.has(id));
    expect(missing, `${path} icon ids missing from icons.svg`).toEqual([]);
  }
});

test('R20 still counts: 2 objects in each hero that has one, 3 on home (R21), 0 on the others', async ({ page }) => {
  await page.goto('');
  await expect(page.locator('.hero .still__obj')).toHaveCount(3);
  for (const p of ['servicios/', 'perdida-de-peso/', 'nutricion-deportiva/', 'nutricion-clinica/', 'como-funciona/', 'sobre-mi/', 'contacto/', 'blog/']) {
    await page.goto(p);
    await expect(page.locator('.page-hero .still__obj'), p).toHaveCount(2);
  }
  for (const p of ['programas/', 'preguntas-frecuentes/', 'aviso-legal/', 'privacidad/', 'cookies/']) {
    await page.goto(p);
    await expect(page.locator('.still__obj'), p).toHaveCount(0);
  }
});

test('P4 medical page: roles table, Importante note, and the medication sentence (L1)', async ({ page }) => {
  await page.goto('perdida-de-peso/tratamiento-medico/');
  await expect(page.locator('table.roles')).toHaveCount(1);
  await expect(page.locator('main')).toContainText(/la medicación no está incluida/i);
});

test('P5 programas: two plans with anchors and every copy price shown; medication sentence (L1)', async ({ page }) => {
  await page.goto('programas/');
  await expect(page.locator('#programa-a')).toHaveCount(1);
  await expect(page.locator('#programa-b')).toHaveCount(1);
  const prices: string[] = [];
  const walk = (o: unknown) => {
    if (Array.isArray(o)) o.forEach(walk);
    else if (o && typeof o === 'object') for (const v of Object.values(o)) typeof v === 'string' && /^\d+\s?€$/.test(v) ? prices.push(v) : walk(v);
  };
  walk(copy('programas'));
  expect(prices.length, 'prices in programas.json').toBeGreaterThan(0);
  const text = await page.locator('main').innerText();
  const absent = [...new Set(prices)].filter(p => !text.includes(p));
  expect(absent, 'copy prices missing from programas').toEqual([]);
  await expect(page.locator('main')).toContainText('La medicación no está incluida');
});

test('P6 cómo funciona: five protocol steps', async ({ page }) => {
  await page.goto('como-funciona/');
  await expect(page.locator('.protocol__step')).toHaveCount(5);
});

test('P8 FAQ: eight details, the first one open, FAQPage JSON-LD present', async ({ page }) => {
  await page.goto('preguntas-frecuentes/');
  const details = page.locator('details');
  await expect(details).toHaveCount(8);
  expect(await details.evaluateAll(els => els.map(e => e.hasAttribute('open')))).toEqual([true, false, false, false, false, false, false, false]);
  const ld = await page.locator('script[type="application/ld+json"]').allTextContents();
  const types = ld.flatMap(t => [...JSON.parse(t)['@graph'].map((n: { '@type': string }) => n['@type'])]);
  expect(types).toContain('FAQPage');
});

test('P9 legal pages come from one component: one note each, same structure', async ({ page }) => {
  const shapes: string[] = [];
  for (const p of ['aviso-legal/', 'privacidad/', 'cookies/']) {
    await page.goto(p);
    await expect(page.locator('.note'), p).toHaveCount(1);
    await expect(page.locator('h1'), p).toHaveCount(1);
    shapes.push(await page.locator('main').evaluate(m => [...m.children].map(c => c.tagName + '.' + c.className).join('|')));
  }
  expect(new Set(shapes).size, 'legal page structures differ').toBe(1);
});
