import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

// Routes come from src/data/seo.json (T10). Paths are relative to the base (/web-dani/).
// Run from the repo root (npm scripts do this).
interface SeoEntry { path: string; title: string | null; description: string | null }
export const seo = JSON.parse(readFileSync(resolve('src/data/seo.json'), 'utf8')) as Record<string, SeoEntry>;

// Every built route, including the 404 page (path 404.html).
export const routes = Object.entries(seo).map(([key, e]) => ({ key, path: e.path }));

// Inner pages only (the 404 is not part of the site navigation).
export const pages = routes.filter(r => r.path !== '404.html');

export const SITE = 'https://doby-llm.github.io';
export const BASE = '/web-dani/';
