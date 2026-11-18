import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: process.env.SITE_URL ?? 'https://doby-llm.github.io',
  base: process.env.BASE_PATH ?? '/web-dani/',
  trailingSlash: 'always',
  build: { format: 'directory', inlineStylesheets: 'auto' },
  prefetch: { prefetchAll: false, defaultStrategy: 'hover' },
  compressHTML: true,
  integrations: [
    sitemap({ filter: (page) => !page.includes('/og/') && !/\/404(\.html|\/)?$/.test(page) }),
  ],
});
