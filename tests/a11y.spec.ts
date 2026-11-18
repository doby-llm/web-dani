// Q1: axe, zero violations, every route. The desktop project runs at 1440 px, the mobile project at 390 px.
import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { routes } from './support';

for (const r of routes) {
  test(`axe clean: ${r.key}`, async ({ page }) => {
    await page.goto(r.path);
    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'])
      .analyze();
    const summary = results.violations.map(v => `${v.id} (${v.impact}): ${v.nodes.map(n => n.target.join(' ')).join(', ')}`);
    expect(summary, summary.join('\n')).toEqual([]);
  });
}
