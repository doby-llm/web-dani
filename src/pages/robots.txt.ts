import type { APIRoute } from 'astro';
import { INDEXABLE } from '../lib/env';
import { absolute } from '../lib/seo';

// DEC-08: the prototype disallows everything; the final host builds with PUBLIC_INDEXABLE=true.
export const GET: APIRoute = () => {
  const body = INDEXABLE
    ? `User-agent: *\nAllow: /\nSitemap: ${absolute('sitemap-index.xml')}\n`
    : 'User-agent: *\nDisallow: /\n';
  return new Response(body, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
};
