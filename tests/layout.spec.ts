// Q2: at 360 px, every route. No horizontal scroll, no visible text below 14 px, touch targets >= 44 x 44
// (inline links inside running text are exempt, see below).
import { test, expect } from '@playwright/test';
import { routes } from './support';

test.use({ viewport: { width: 360, height: 780 } });

for (const r of routes) {
  test(`360 px layout: ${r.key}`, async ({ page }) => {
    await page.goto(r.path);
    await page.evaluate(() => document.fonts.ready);

    const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
    expect(scrollWidth, 'document.documentElement.scrollWidth').toBeLessThanOrEqual(360);

    // Own text nodes only, so a parent does not inherit the size check of its children.
    const smallText = await page.evaluate(() => {
      const out: string[] = [];
      for (const el of document.body.querySelectorAll<HTMLElement>('*')) {
        if (el.closest('.visually-hidden, [inert], [hidden], [aria-hidden="true"]')) continue;
        const own = [...el.childNodes].some(n => n.nodeType === Node.TEXT_NODE && n.textContent!.trim());
        if (!own || el.getClientRects().length === 0) continue;
        const size = parseFloat(getComputedStyle(el).fontSize);
        if (size < 14) out.push(`${size}px <${el.tagName.toLowerCase()}> "${el.textContent!.trim().slice(0, 40)}"`);
      }
      return out;
    });
    expect(smallText, smallText.join('\n')).toEqual([]);

    const smallTargets = await page.evaluate(() => {
      // WCAG 2.5.8 inline exception (planner ruling, C1): a link inside a running sentence of a <p> or <li> is exempt,
      // because its size is set by the text around it. A link that is alone in its paragraph or item is still checked.
      const inRunningText = (el: HTMLElement) => {
        if (getComputedStyle(el).display !== 'inline') return false;
        const host = el.closest<HTMLElement>('p, li');
        return !!host && host.textContent!.trim().length > el.textContent!.trim().length;
      };
      const out: string[] = [];
      for (const el of document.querySelectorAll<HTMLElement>('a, button, summary')) {
        if (el.closest('.visually-hidden, [inert], [hidden]')) continue;
        if (el.tagName === 'A' && inRunningText(el)) continue;
        const box = el.getBoundingClientRect();
        if (box.width === 0 || box.height === 0) continue;
        if (box.width < 44 || box.height < 44) {
          out.push(`${Math.round(box.width)}x${Math.round(box.height)} <${el.tagName.toLowerCase()}> "${(el.textContent ?? el.getAttribute('aria-label') ?? '').trim().slice(0, 40)}"`);
        }
      }
      return out;
    });
    expect(smallTargets, smallTargets.join('\n')).toEqual([]);
  });
}
