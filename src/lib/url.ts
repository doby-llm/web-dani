/* Builds every internal URL from the Astro base (`/web-dani/` on Pages, `/` elsewhere).
   Paths without a dot, `?` or `#` get a trailing slash (trailingSlash: 'always').
   Self-check (kept as comments, not run):
     url('')                    → '/web-dani/'
     url('programas')           → '/web-dani/programas/'
     url('icons.svg')           → '/web-dani/icons.svg'
     url('contacto/?objetivo=x') → '/web-dani/contacto/?objetivo=x' (query kept)
*/
export const url = (p = '') =>
  (import.meta.env.BASE_URL.replace(/\/$/, '') + '/' + p.replace(/^\//, ''))
    .replace(/\/?$/, p.includes('.') || p.includes('?') || p.includes('#') ? '' : '/');
