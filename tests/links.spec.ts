// A1: every internal href/src starts with the base path (or is a fragment).
// Q5: every internal page link answers 200 and every fragment target exists.
import { test, expect } from '@playwright/test';
import { BASE, routes } from './support';

const cache = new Map<string, { status: number; html: string }>();
async function fetchTarget(request: import('@playwright/test').APIRequestContext, url: string) {
  if (!cache.has(url)) {
    const res = await request.get(url);
    cache.set(url, { status: res.status(), html: res.ok() ? await res.text() : '' });
  }
  return cache.get(url)!;
}

for (const r of routes) {
  test(`links and fragments: ${r.key}`, async ({ page, request }) => {
    await page.goto(r.path);
    const refs = await page.evaluate(() => {
      const attr = (sel: string, name: string) => [...document.querySelectorAll(sel)].map(e => e.getAttribute(name) ?? '');
      return [
        ...attr('a[href]', 'href').map(v => ({ kind: 'a', v })),
        ...attr('link[href]', 'href').map(v => ({ kind: 'link', v })),
        ...attr('img[src]', 'src').map(v => ({ kind: 'img', v })),
        ...attr('use[href]', 'href').map(v => ({ kind: 'use', v })),
      ];
    });
    const internal = refs.filter(r => !/^(https?:|mailto:|tel:|data:)/.test(r.v));

    const bad = internal.filter(r => !(r.v.startsWith(BASE) || r.v.startsWith('#'))).map(r => `${r.kind} ${r.v}`);
    expect(bad, `hrefs/src without the base path:\n${bad.join('\n')}`).toEqual([]);

    const broken: string[] = [];
    const missingFragments: string[] = [];
    const pageUrl = new URL(page.url());
    for (const ref of internal.filter(r => r.kind === 'a')) {
      const target = new URL(ref.v, pageUrl);
      const hash = target.hash.slice(1);
      target.hash = '';
      const { status, html } = await fetchTarget(request, target.href);
      if (status !== 200) { broken.push(`${status} ${ref.v}`); continue; }
      if (hash) {
        const found = target.href === pageUrl.href.split('#')[0]
          ? await page.evaluate(id => !!document.getElementById(id), hash)
          : html.includes(`id="${hash}"`);
        if (!found) missingFragments.push(ref.v);
      }
    }
    expect(broken, `broken internal links:\n${broken.join('\n')}`).toEqual([]);
    expect(missingFragments, `fragment targets missing:\n${missingFragments.join('\n')}`).toEqual([]);
  });
}
