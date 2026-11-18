// Q6: Tab walk on every route. Every visible focusable element is reached, and each focused element shows an outline.
import { test, expect } from '@playwright/test';
import { routes } from './support';

const FOCUSABLE = 'a[href], button:not([disabled]), input:not([disabled]), textarea:not([disabled]), select:not([disabled]), summary, [tabindex]:not([tabindex="-1"])';

for (const r of routes) {
  test(`tab walk: ${r.key}`, async ({ page }) => {
    await page.goto(r.path);
    await page.evaluate(() => document.fonts.ready);
    const labels = await page.evaluate(sel => {
      const els = [...document.querySelectorAll<HTMLElement>(sel)].filter(el =>
        !el.closest('[inert], [hidden], .visually-hidden') && el.getClientRects().length > 0);
      els.forEach((el, i) => { el.dataset.kbd = String(i); });
      return els.map(el => `${el.tagName.toLowerCase()} "${(el.textContent || el.getAttribute('aria-label') || el.getAttribute('name') || '').trim().slice(0, 40)}"`);
    }, FOCUSABLE);

    const reached = new Set<string>();
    const noOutline: string[] = [];
    const steps = labels.length * 2 + 5;
    for (let i = 0; i < steps; i++) {
      await page.keyboard.press('Tab');
      const info = await page.evaluate(() => {
        const el = document.activeElement as HTMLElement | null;
        if (!el || !el.dataset.kbd) return null;
        const cs = getComputedStyle(el);
        const outlined = cs.outlineStyle !== 'none' && parseFloat(cs.outlineWidth) > 0;
        return { id: el.dataset.kbd, outlined, label: `${el.tagName.toLowerCase()} "${(el.textContent || el.getAttribute('aria-label') || el.getAttribute('name') || '').trim().slice(0, 40)}"` };
      });
      if (!info) continue;
      reached.add(info.id);
      if (!info.outlined) noOutline.push(info.label);
    }

    // A radio group is one tab stop (arrow keys move inside it), so a group counts as reached when one member is.
    const groupOf = await page.evaluate(sel => [...document.querySelectorAll<HTMLElement>(sel)]
      .filter(el => !el.closest('[inert], [hidden], .visually-hidden') && el.getClientRects().length > 0)
      .map(el => (el as HTMLInputElement).type === 'radio' ? `radio:${(el as HTMLInputElement).name}` : ''), FOCUSABLE);
    const reachedGroups = new Set<string>();
    labels.forEach((_, i) => { if (reached.has(String(i)) && groupOf[i]) reachedGroups.add(groupOf[i]); });
    const missed = labels.filter((_, i) => !reached.has(String(i)) && !(groupOf[i] && reachedGroups.has(groupOf[i])));
    expect(missed, `not reached by Tab:\n${missed.join('\n')}`).toEqual([]);
    expect(noOutline, `focused without visible outline:\n${noOutline.join('\n')}`).toEqual([]);
  });
}
