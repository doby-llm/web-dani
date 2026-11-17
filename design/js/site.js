/* =========================================================
   site.js (CANONICAL) — the only client JS of the site (< 3 KB min).
   Progressive enhancement: every page works without it.
   Port to src/scripts/site.js, loaded once in BaseLayout with
   <script type="module">. No frameworks, no dependencies.
   ========================================================= */
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

/* 1. Header elevation once the page scrolls */
const header = $('.site-header');
if (header) {
  const onScroll = () => header.dataset.scrolled = String(scrollY > 8);
  addEventListener('scroll', onScroll, { passive: true }); onScroll();
}

/* 2. Mobile sheet menu (button[aria-controls=menu-sheet]) */
const sheet = $('#menu-sheet');
const openers = $$('[aria-controls="menu-sheet"]');
function setSheet(open) {
  if (!sheet) return;
  sheet.dataset.open = String(open);
  sheet.toggleAttribute('inert', !open);
  openers.forEach(b => b.setAttribute('aria-expanded', String(open)));
  document.documentElement.style.overflow = open ? 'hidden' : '';
  if (open) $('a, button', sheet)?.focus(); else openers[0]?.focus();
}
openers.forEach(b => b.addEventListener('click', () => setSheet(sheet.dataset.open !== 'true')));
$$('[data-close-sheet]').forEach(b => b.addEventListener('click', () => setSheet(false)));
addEventListener('keydown', e => { if (e.key === 'Escape' && sheet?.dataset.open === 'true') setSheet(false); });

/* 3. Services disclosure in desktop nav (button + panel, not hover-only) */
$$('.nav-menu').forEach(menu => {
  const btn = $('button', menu), panel = $('.nav-menu__panel', menu);
  const set = open => { btn.setAttribute('aria-expanded', String(open)); panel.hidden = !open; };
  btn.addEventListener('click', () => set(btn.getAttribute('aria-expanded') !== 'true'));
  menu.addEventListener('focusout', e => { if (!menu.contains(e.relatedTarget)) set(false); });
  addEventListener('keydown', e => { if (e.key === 'Escape') set(false); });
  document.addEventListener('click', e => { if (!menu.contains(e.target)) set(false); });
});

/* 4. Mobile action bar: visible after the hero CTAs leave the viewport,
      hidden again when the footer or any [data-hide-action-bar] is visible */
const bar = $('.action-bar');
const trigger = $('[data-action-bar-trigger]');
if (bar && trigger && 'IntersectionObserver' in window) {
  let pastHero = false, blocked = false;
  const update = () => bar.dataset.visible = String(pastHero && !blocked);
  new IntersectionObserver(([e]) => { pastHero = !e.isIntersecting && e.boundingClientRect.top < 0; update(); }).observe(trigger);
  const blockers = $$('.site-footer, [data-hide-action-bar]');
  const seen = new Set();
  const io = new IntersectionObserver(es => { es.forEach(e => e.isIntersecting ? seen.add(e.target) : seen.delete(e.target)); blocked = seen.size > 0; update(); });
  blockers.forEach(b => io.observe(b));
}

/* 5. Duration switch on pricing (radio group; no-JS shows 2 meses = default prices) */
$$('[data-duration-switch]').forEach(group => {
  const scope = group.closest('[data-pricing]');
  group.addEventListener('change', e => {
    const d = e.target.value;
    $$('[data-price-swap]', scope).forEach(el => {
      const next = el.dataset['p' + d];
      if (!next || reduce) { if (next) el.textContent = next; return; }
      el.dataset.swapping = 'true';
      setTimeout(() => { el.textContent = next; el.dataset.swapping = 'false'; }, 140);
    });
    $$('[data-duration-label]', scope).forEach(el => el.textContent = e.target.dataset.label);
  });
});

/* 6. Contact form: client validation + honest prototype result.
      Final host swaps FORM_ENDPOINT in config; see SPEC §8. */
const form = $('form[data-contact]');
if (form) {
  const status = $('.form-status', form.parentElement);
  form.addEventListener('submit', async e => {
    e.preventDefault();
    let firstBad = null;
    $$('.field', form).forEach(f => {
      const input = $('input, textarea, select', f);
      const bad = input && !input.checkValidity();
      f.dataset.invalid = String(bad);
      input?.setAttribute('aria-invalid', String(bad));
      if (bad && !firstBad) firstBad = input;
    });
    if (firstBad) { firstBad.focus(); return; }
    const endpoint = form.dataset.endpoint;
    if (!endpoint) { status.dataset.state = 'success'; status.focus(); form.reset(); return; } // prototype mode
    try {
      const r = await fetch(endpoint, { method: 'POST', body: new FormData(form), headers: { Accept: 'application/json' } });
      status.dataset.state = r.ok ? 'success' : 'error';
      if (r.ok) form.reset();
    } catch { status.dataset.state = 'error'; }
    status.focus();
  });
}

/* 6b. Contact prefill from ?objetivo= (service CTAs link to contacto/?objetivo=<alias>) */
if (form) {
  const alias = { deportiva: 'rendimiento', clinica: 'clinico', medico: 'perdida-de-peso', 'perdida-de-peso': 'perdida-de-peso' };
  const q = new URLSearchParams(location.search);
  const v = alias[q.get('objetivo')] || q.get('objetivo');
  const radio = v && form.querySelector(`input[name="objetivo"][value="${CSS.escape(v)}"]`);
  if (radio) radio.checked = true;
  const prog = form.querySelector('input[name="programa"]');
  if (prog && (q.get('objetivo') === 'medico' || q.get('programa') === 'b')) prog.value = 'B';
}

/* 7. Article TOC: highlight current section */
const toc = $('.toc');
if (toc && 'IntersectionObserver' in window) {
  const links = $$('a', toc);
  const io = new IntersectionObserver(es => es.forEach(e => {
    if (e.isIntersecting) links.forEach(a => a.setAttribute('aria-current', String(a.hash === '#' + e.target.id)));
  }), { rootMargin: '0px 0px -70% 0px' });
  $$('.article-body h2[id]').forEach(h => io.observe(h));
}

/* 8. Footer year */
$$('[data-year]').forEach(el => el.textContent = new Date().getFullYear());
