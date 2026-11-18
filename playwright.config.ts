import { defineConfig } from '@playwright/test';

// Pi: CHROMIUM_PATH=/usr/bin/chromium. CI leaves it unset and uses Playwright's own chromium.
// Two servers: `dist/` on 4321 (default build), and the blog fixture dev server on 4322 (B3 only).
export default defineConfig({
  testDir: 'tests',
  testMatch: /.*\.spec\.ts/,
  workers: 1,
  retries: 0,
  reporter: [['list'], ['html', { open: 'never' }]],
  use: {
    baseURL: 'http://127.0.0.1:4321/web-dani/',
    launchOptions: { executablePath: process.env.CHROMIUM_PATH || undefined },
  },
  projects: [
    { name: 'desktop', use: { viewport: { width: 1440, height: 900 } } },
    { name: 'mobile', use: { viewport: { width: 390, height: 844 } } },
  ],
  webServer: [
    {
      command: 'npx astro preview --host 127.0.0.1 --port 4321',
      url: 'http://127.0.0.1:4321/web-dani/',
      reuseExistingServer: !process.env.CI,
    },
    {
      command: 'PUBLIC_INCLUDE_FIXTURES=true npx astro dev --host 127.0.0.1 --port 4322',
      url: 'http://127.0.0.1:4322/web-dani/',
      reuseExistingServer: !process.env.CI,
    },
  ],
});
