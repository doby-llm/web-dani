// C3: every disclaimer from src/data/copy/*.json is rendered through <Note> (.note), and Note kinds honour the env flags.
// Sentence-level: the home medical disclaimer is split across the roles table and its legal note (R4, R6), so a
// sentence counts as rendered when it sits in a .note or in table.roles.
// Flag check: a second build with PUBLIC_PROVISIONAL=false goes to test-results/ (never dist/).
import { test, expect } from '@playwright/test';
import { execFileSync } from 'node:child_process';
import { readdirSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { pages } from './support';

interface Disclaimer { file: string; text: string; kind: string }
const disclaimers: Disclaimer[] = readdirSync(resolve('src/data/copy'))
  .flatMap(file => {
    const found: Disclaimer[] = [];
    const walk = (o: unknown) => {
      if (Array.isArray(o)) o.forEach(walk);
      else if (o && typeof o === 'object') {
        for (const [k, v] of Object.entries(o)) {
          if (k === 'disclaimers' && Array.isArray(v)) v.forEach((d: { text: string; kind: string }) => found.push({ file, text: d.text, kind: d.kind }));
          else walk(v);
        }
      }
    };
    walk(JSON.parse(readFileSync(resolve('src/data/copy', file), 'utf8')));
    return found;
  });
const sentences = (text: string) => text.split(/(?<=\.)\s+/);
const norm = (s: string) => s.replace(/\s+/g, ' ').trim();

test.describe('C3 notes', () => {
  test('every disclaimer sentence is rendered in .note (or the roles table)', async ({ page }) => {
    const rendered = { note: new Set<string>(), roles: new Set<string>() };
    for (const p of pages) {
      await page.goto(p.path);
      const got = await page.evaluate(() => ({
        note: [...document.querySelectorAll('.note')].map(n => n.textContent ?? ''),
        roles: [...document.querySelectorAll('table.roles')].map(n => n.textContent ?? ''),
      }));
      got.note.forEach(t => rendered.note.add(norm(t)));
      got.roles.forEach(t => rendered.roles.add(norm(t)));
    }
    const missing: string[] = [];
    for (const d of disclaimers) {
      for (const s of sentences(d.text)) {
        const ok = [...rendered.note, ...rendered.roles].some(t => t.includes(norm(s)));
        if (!ok) missing.push(`${d.file} [${d.kind}] ${s}`);
      }
    }
    expect(missing, `not rendered via .note:\n${missing.join('\n')}`).toEqual([]);
  });

  test.describe('flag off build', () => {
    test.setTimeout(300_000);
    let html: Record<string, string> = {};

    test.beforeAll(() => {
      // One astro build at a time on the Pi: same lock as npm run build.
      execFileSync('flock', ['/tmp/web-dani-build.lock', 'npx', 'astro', 'build', '--outDir', 'test-results/dist-noprov'], {
        env: { ...process.env, PUBLIC_PROVISIONAL: 'false' },
        stdio: 'inherit',
      });
      for (const p of pages) {
        const file = resolve('test-results/dist-noprov', p.path === '' ? 'index.html' : p.path.endsWith('/') ? p.path + 'index.html' : p.path);
        html[p.key] = readFileSync(file, 'utf8');
      }
    });

    test('provisional notes are not rendered, legal notes still are', async ({ page }) => {
      const provisional = disclaimers.filter(d => d.kind === 'provisional').flatMap(d => sentences(d.text));
      const legal = disclaimers.filter(d => d.kind === 'legal').flatMap(d => sentences(d.text));
      const notesOf = () => page.evaluate(() => [...document.querySelectorAll('.note, table.roles')]
        .map(n => (n.textContent ?? '').replace(/\s+/g, ' ').trim()));

      const leaked: string[] = [];
      const missingLegal: string[] = [];
      for (const p of pages) {
        // Legal sentences this page shows in the default build (dist/, served by astro preview).
        await page.goto(p.path);
        const shownLegal = (await notesOf()).join(' ');
        const expectedLegal = legal.filter(s => shownLegal.includes(norm(s)));

        await page.setContent(html[p.key]);
        const offNotes = (await notesOf()).join(' ');
        for (const s of provisional) if (offNotes.includes(norm(s))) leaked.push(`${p.key}: ${s}`);
        for (const s of expectedLegal) if (!offNotes.includes(norm(s))) missingLegal.push(`${p.key}: ${s}`);
      }
      expect(leaked, `provisional text rendered with PUBLIC_PROVISIONAL=false:\n${leaked.join('\n')}`).toEqual([]);
      expect(missingLegal, `legal note lost with PUBLIC_PROVISIONAL=false:\n${missingLegal.join('\n')}`).toEqual([]);
    });
  });
});
