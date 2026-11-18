// Lighthouse needs the site under the base path. LHCI's staticDistDir serves from its root, so the indexable build is
// copied to .lhci/web-dani/ and URLs are http://localhost/web-dani/... (planner note 2).
import { cpSync, existsSync, rmSync } from 'node:fs';
import { resolve } from 'node:path';

const src = resolve('dist-indexable');
if (!existsSync(src)) {
  console.error('dist-indexable/ missing: run npm run build:indexable first');
  process.exit(1);
}
rmSync(resolve('.lhci'), { recursive: true, force: true });
cpSync(src, resolve('.lhci/web-dani'), { recursive: true });
console.log('copied dist-indexable/ to .lhci/web-dani/');
