# SPEC — Daniel Clemente · web redesign (`web-redesign`)

Status: PROPOSED (planner Opus, 2026-11-14). Becomes binding on Manu's APROBADO.
Executors: coordinator Claude Sonnet 5.5 `--effort high`; workers and reviewer Claude Haiku 5.5 `--effort high`.
Packet path in the new repo: `docs/specs/web-redesign/`. Design system: `design/` (DESIGN.md, css, js, mockups, fonts, img, icons).

## 0. Authority order
`tasks.md` (scope, files, order) > `briefs/<ID>.md` (how) > this SPEC (detail) > `design/DESIGN.md` (rules) > `design/css` (values) > `design/mockups` (composition). A real contradiction → stop and ask the coordinator; the coordinator asks Manu only for product questions.

## 1. Goal and non-goals
Goal: replace the prototype `doby-llm/web-dani-prototype1` with a distinctive, accessible, fast, SEO-ready static site that carries the SAME text (copydeck + approved overrides) in a new visual system ("Consulta con carácter", v4, palette Salvia y melocotón), usable on mobile and desktop, deployable to GitHub Pages now and to any static host later without code changes.

Non-goals: new copy or claims; real form backend; payments/booking; analytics; CMS; multi-language; writing blog articles; editing the old repo.

## 2. Decisions (DEC)
| ID | Decision | Type |
|---|---|---|
| DEC-01 | New public repo `doby-llm/web-dani` (default branch `main`). The old repo stays untouched as an archive. Pages deploys from GitHub Actions. | planner default A, confirmed with APROBADO (Q2) |
| DEC-02 | GitHub Pages is enough for the prototype. Limits accepted: no server-side form, no custom headers (CSP/caching), no redirects, no PR previews, project-path base `/web-dani/`, public repo. The final host (recommended: Cloudflare Pages or Netlify) takes the same `dist/` with `SITE_URL`/`BASE_PATH` changed; forms via a provider endpoint (`PUBLIC_FORM_ENDPOINT`). | planner |
| DEC-03 | Stack: Astro **6.4.8** (static output, pinned; Astro 7 needs Node ≥ 22.23), Node 22, `@astrojs/sitemap` 3.7.5, `satori` 0.63.2 + `@resvg/resvg-js` 2.6.2 (OG images at build time), `yaml` for data. No UI framework, no Tailwind, no CSS-in-JS. Client JS = `design/js/site.js` only. Spike verified on the Pi: build OK. | planner |
| DEC-04 | Visual system = `design/DESIGN.md` + canonical CSS ported **verbatim** (tokens/base/components). Pages compose existing classes only; page-scoped `<style>` may use tokens for layout tweaks only. | planner (Manu delegated visuals) |
| DEC-05 | Copy source = `copydeck/*.yaml` (verbatim extraction, 0 missing sentences both directions) + `copy/overrides.yaml`. A build script produces `src/data/copy/<page>.json`; pages never hard-code copy except the microcopy table in §4.3. | planner |
| DEC-06 | Internal/dev sentences of the prototype ("prioridad de captación", "preventDefault activo", "placeholder honesto"…) are rewritten for clients as listed in `copy/overrides.yaml`; facts, prices, credentials and medical limits stay verbatim. | planner default A, confirmed with APROBADO (Q1) |
| DEC-07 | Notes have three kinds: `legal` (always shown), `provisional` (shown while `PUBLIC_PROVISIONAL=true`), `editorial` (shown only when `PUBLIC_SHOW_EDITORIAL=true`). Prototype build: provisional=true, editorial=true. | planner |
| DEC-08 | Prototype is `noindex` (`PUBLIC_INDEXABLE=false` → `<meta name="robots" content="noindex,nofollow">` and `robots.txt` `Disallow: /`). The final host flips it. Avoids Google indexing provisional prices and a temporary domain. | planner default A, confirmed with APROBADO (Q3) |
| DEC-09 | Images: current food cut-outs (Pexels licence, `design/img/sources/`) and the AI portrait are temporary. They are replaced by the final assets of `IMAGE_PROMPTS.md` without code changes (same filenames under `src/assets/`). | superseded by DEC-13 |
| DEC-10 | No cookies, no analytics, no third-party requests (fonts self-hosted). Hence no cookie banner. | planner |
| DEC-12 | Palette is role-based and swappable (`design/palettes/`). History: v1 cobalt rejected (tech look), v2 terracota/huerta/remolacha superseded, v3 sober clinical rejected (too sober), v4 middle ground accepted. **Chosen: `salvia` (Salvia y melocotón)**; `oliva`, `petroleo` kept as fallbacks. | Manu, 2026-11-17 |
| DEC-14 | Visual direction = v4 "Consulta con carácter" (`design/DESIGN.md`): clinical structure (rows, protocol, roles table, fiches, CV) + character (Fraunces italic accents, service tints, food still life, sage closing band). Earlier designs archived in `archive/` as references only. | Manu, 2026-11-17 (feedback/03–05) |
| DEC-13 | Daniel's photos = AI generation from one real reference photo of Daniel plus the exact prompts in `IMAGE_PROMPTS.md`; Manu runs them. Same filenames, no code change. | Manu, 2026-11-14 |
| DEC-11 | URLs: lowercase, trailing slash, no `.html`. The medical page moves to `/perdida-de-peso/tratamiento-medico/` (matches its H1 and nests under its parent). No redirects from the old repo (different repo, prototype, not indexed). | planner |

## 3. Routes and templates
| Route | Template / mockup | Copy file | Field of hero | Nav current |
|---|---|---|---|---|
| `/` | Home / `home.html` | home | hero--v4 (paper→surface gradient) | — |
| `/servicios/` | Index / `servicios.html` | servicios | bg-tint | Servicios |
| `/perdida-de-peso/` | T-SERVICE / `servicio.html` | perdida-de-peso | bg-weight | Servicios |
| `/perdida-de-peso/tratamiento-medico/` | T-MEDICAL / `medico.html` | perdida-de-peso-con-apoyo-medico | bg-medical (no food) | Servicios |
| `/nutricion-deportiva/` | T-SERVICE / `servicio.html` | nutricion-deportiva | bg-sport | Servicios |
| `/nutricion-clinica/` | T-SERVICE / `servicio.html` | nutricion-clinica | bg-clinic | Servicios |
| `/como-funciona/` | `como-funciona.html` | como-funciona | bg-sport | Cómo funciona |
| `/programas/` | T-PROGRAMS / `programas.html` | programas | bg-tint (no food) | Programas |
| `/sobre-mi/` | `sobre-mi.html` | sobre-mi | bg-weight | Sobre mí |
| `/preguntas-frecuentes/` | `preguntas-frecuentes.html` | preguntas-frecuentes | bg-medical (no food) | — (footer) |
| `/blog/` | `blog.html` | blog | bg-clinic | Blog |
| `/blog/<slug>/` | T-ARTICLE / `blog-articulo.html` | content collection | by category: weight/hábitos → bg-weight, sport → bg-sport, clinic → bg-clinic (no food) | Blog |
| `/contacto/` | T-CONTACT / `contacto.html` | contacto | bg-weight | CTA |
| `/aviso-legal/`, `/privacidad/`, `/cookies/` | T-LEGAL / `legal.html` | aviso-legal, privacidad, cookies | page-hero default (surface, no food) | — |
| `/404.html` | `404.html` | §4.3 | bg-sport | — |

T-SERVICE section order (all three services; mockup `servicio.html`, drawn for deportiva), using the page's copy file:
1. `page-hero page-hero--v4 bg-<service> svc-<service>`: breadcrumb, h1 (italic `<em>` accent on the last words, DESIGN §2), lead, CTAs "Cuéntame tu objetivo" → `/contacto/?objetivo=<slug>` and "Ver programas"; right column `page-hero__aside` = 2-object still life + `aside.fiche` (rows from microcopy `fiche.*`, §4.3);
2. bg-paper: `.sec-head` + `.areas` (`.area` with `span.icon-badge`, icon per §6.4) + editorial note;
3. bg-surface: `.split--5-7`: h2 "¿Qué puede incluir…" + `.panel` (the "estrategia/seguimiento práctico" text) on the left, `.checklist` on the right;
4. bg-paper: `.profile` with `working.webp` + "Un acompañamiento basado en tu contexto" + "Plan a tu medida" + editorial note;
5. `cta-band cta-band--v4 bg-brand on-dark` (`data-hide-action-bar`): closing h2 + paragraph + primary CTA in the text column, 2-object still life on the right.
Service objects: perdida-de-peso grapefruit + lemon-b; deportiva lemon-c + lemon-b; clínica avocado + lemon-a.
`/perdida-de-peso/` has fewer sections in the copy: 1 → 3 (h2 "¿Qué incluye?" + checklist, left panel "Un proceso acompañado") → bg-medical block "¿Y si necesitas tratamiento médico?" with `.callout` + `table.roles` + link "Ver tratamiento médico" (no food in that block) → 5 (band reuses home `cta-banner` heading "Tu objetivo merece un plan que encaje contigo." + "Quiero empezar").

## 4. Content
### 4.1 Pipeline
`copydeck/*.yaml` and `copy/overrides.yaml` are committed under `content-src/`. `scripts/build-copy.mjs` (T02) applies each override as an exact string replacement in its page (each `find` must match ≥ 1 time, else the script fails), drops fields `eyebrow`, `kicker`, `number`, `stamp`, `badge`, `featured`, `recommended`, `hero_proof`'s icons, and writes `src/data/copy/<page>.json`. `npm run check:copy` re-runs it and diffs (CI fails on drift). Overrides with `replace: ""` remove the string (and an emptied CTA/note/list item disappears).

### 4.2 Notes
`src/components/Note.astro` receives the text, looks up its kind in `notes_kind` (default `provisional` if not listed) and renders `.note` or nothing according to DEC-07. Every disclaimer in the copy must go through `Note` (test: no disclaimer string appears outside a `.note` element).

### 4.3 Microcopy (planner-approved, exact)
| Key | Text |
|---|---|
| skip | Saltar al contenido |
| menu.open / menu.close | Menú / Cerrar |
| nav.services | Servicios |
| nav.medical (menu + footer) | Tratamiento médico |
| crumbs.home | Inicio |
| aria.nav | Navegación principal |
| aria.breadcrumb | Migas de pan |
| aria.duration | Duración del programa |
| status.soon | Próximamente |
| price.per | / {n} meses |
| form.optional | opcional |
| form.err.name | Escribe tu nombre. |
| form.err.email | Revisa el email: falta algo (por ejemplo, @gmail.com). |
| form.ok.title | Datos validados. |
| form.ok.proto | Esta demo no envía ni guarda nada. Cuando los canales estén confirmados, aquí te diré cuándo responderé. |
| form.ok.live | Mensaje enviado. Te responderé lo antes posible. |
| form.err.send | No se ha podido enviar. Inténtalo de nuevo en unos minutos. |
| toc.title | En este artículo |
| article.read | {n} min de lectura |
| 404.h1 | Página no encontrada |
| 404.lead | Puede que el enlace haya cambiado. Vuelve al inicio o cuéntame tu objetivo. |
| 404.cta | Volver al inicio |
| fiche.aria | Resumen del servicio |
| fiche.mode / fiche.mode.v | Modalidad / 100% online |
| fiche.follow / fiche.follow.v | Seguimiento / Seguimiento semanal y por WhatsApp |
| fiche.review / fiche.review.v | Revisión / Videollamada mensual |
| fiche.programs / fiche.programs.v | Programas / Ver programas |
| fiche.med.nutrition | Nutrición y hábitos → Daniel |
| fiche.med.prescription | Valoración y prescripción → La profesional médica |
| fiche.med.medication | Medicación → No incluida en el programa |
| cred.role | Nutricionista |
| cv.education | Formación |
| 404.lead | Puede que el enlace haya cambiado. Vuelve al inicio o cuéntame tu objetivo. |
| 404.cta1 / cta2 | Volver al inicio / Contacto |
| tag.hero | Seguimiento · cercano y flexible (from home.yaml hero_float) ; Un plan adaptado a tu vida real |
| tag.portrait | Evidencia · + cercanía (home.yaml stamp, kept as the portrait tag) |
| chip.medical | Tratamiento médico · provisional (only while PROVISIONAL) |
| chip.priority | (none — removed) |
| plan.letter | Programa A / Programa B |
| roles | Daniel / La profesional médica |
| cat.* | Pérdida de peso / Nutrición deportiva / Nutrición clínica / Hábitos |
| form.err.send (error box) | see above |
| nav.contact | Contacto |
| cta.how | Cómo funciona |
| crumbs.faq | Preguntas frecuentes |
| price.caption | Tarifas {Programa A/B} |

### 4.4 SEO metadata (per route; ≤ 60 / ≤ 155 chars)
| Route | `<title>` | description |
|---|---|---|
| / | Daniel Clemente · Nutricionista online | Pérdida de peso, nutrición deportiva y clínica con un enfoque integral, personalizado y basado en evidencia científica. 100% online. |
| /servicios/ | Servicios de nutrición online · Daniel Clemente | Pérdida de peso, tratamiento médico coordinado, nutrición deportiva y nutrición clínica online. Elige tu objetivo. |
| /perdida-de-peso/ | Pérdida de peso online · Daniel Clemente | Programa de pérdida de peso online con un enfoque integral, personalizado y basado en evidencia científica. |
| /perdida-de-peso/tratamiento-medico/ | Pérdida de peso con tratamiento médico · Daniel Clemente | Tratamiento médico cuando la profesional médica lo indique y prescriba, siempre con seguimiento nutricional y de hábitos. |
| /nutricion-deportiva/ | Nutrición deportiva online · Daniel Clemente | Seguimiento nutricional para deportistas de fuerza, resistencia y otras modalidades, adaptado a tu entrenamiento y horarios. |
| /nutricion-clinica/ | Nutrición clínica online · Daniel Clemente | Seguimiento nutricional en patologías digestivas, alergias e intolerancias, dislipemias e hipertensión, adaptado a ti. |
| /como-funciona/ | Cómo funciona el seguimiento · Daniel Clemente | Cinco pasos: valoración inicial, plan con recetas y menú, seguimiento semanal y por WhatsApp, videollamada mensual y ajustes. |
| /programas/ | Programas y tarifas · Daniel Clemente | Seguimiento nutricional online desde 180 € / 2 meses y opción con tratamiento médico. Precios orientativos. |
| /sobre-mi/ | Sobre mí · Daniel Clemente, nutricionista | Grado en nutrición (UEM), máster en endocrinología y nutrición clínica (UCAM) y más de 8 años con pacientes online. |
| /preguntas-frecuentes/ | Preguntas frecuentes · Daniel Clemente | Cómo es la primera valoración, qué recibes, cómo funciona WhatsApp, la videollamada mensual y la opción con tratamiento médico. |
| /blog/ | Blog · Daniel Clemente, nutricionista | Artículos educativos sobre pérdida de peso, nutrición deportiva y hábitos, revisados desde la evidencia científica. |
| /contacto/ | Contacto · Daniel Clemente, nutricionista | Cuéntame tu objetivo y revisa qué programa encaja mejor contigo. |
| /aviso-legal/ | Aviso legal · Daniel Clemente | Aviso legal de la web de Daniel Clemente, nutricionista: titularidad, contacto y condiciones de uso (en preparación). |
| /privacidad/ | Privacidad · Daniel Clemente | Política de privacidad de la web de Daniel Clemente, nutricionista (en preparación). El formulario todavía no guarda datos. |
| /cookies/ | Cookies · Daniel Clemente | Esta web no usa cookies ni herramientas de analítica. |
| /blog/<slug>/ | `<post title> · Daniel Clemente` | post `description` frontmatter |

## 5. SEO, social cards and sharing
Implemented in `src/components/Seo.astro` (T10) and consumed by `BaseLayout`.
- Head order: charset, viewport (`width=device-width, initial-scale=1, viewport-fit=cover`), title, description, canonical (absolute, trailing slash), robots (DEC-08), theme-color = `--brand` value, preloads (2 fonts), CSS, icons, manifest, OG, Twitter, JSON-LD.
- Open Graph: `og:type` (website | article), `og:site_name` "Daniel Clemente · Nutricionista", `og:locale` es_ES, `og:title`, `og:description`, `og:url`, `og:image` (absolute PNG 1200×630), `og:image:width/height/alt/type`. Article: `article:published_time`, `article:author`. Twitter: `summary_large_image` + title/description/image/alt. WhatsApp/Telegram/LinkedIn use OG → PNG (never SVG; the old site's SVG card does not render in WhatsApp).
- OG images generated at build by `src/pages/og/[slug].png.ts` with satori + resvg: `--brand` (sage) field, page title in Fraunces 560 (static TTF `fraunces-og-560.ttf`; the last words of the h1 in `fraunces-og-italic-450.ttf` coloured `--sun` when the h1 has an `<em>`), brand line in Public Sans, one food cut-out bottom-right (none for medical/programas/FAQ/legal), a small pill with the service name (`--sun` fill, ink text). One image per route + per article. File size ≤ 300 KB.
- JSON-LD (`@graph`): `WebSite` + `Person` (Daniel Clemente, jobTitle exactly "Nutricionista"; `alumniOf` UEM, UCAM; `knowsAbout` list from services) + `ProfessionalService` (name, url, areaServed "ES", `availableService` names; no address, no phone until confirmed) on every page; `BreadcrumbList` on inner pages; `FAQPage` on FAQ; `BlogPosting` on articles. NO `Offer`/price markup while `PUBLIC_PROVISIONAL=true`. NO `MedicalBusiness`/`Physician` types.
- `sitemap-index.xml` via @astrojs/sitemap (excluding 404 and `/og/`); `robots.txt` generated from env (DEC-08), pointing to the sitemap when indexable.
- Icons: `favicon.svg` ("DC" monogram in Fraunces, paper on brand, rounded square as `.brand__mark`), `favicon-32.png`, `apple-touch-icon.png` 180, `icon-512.png`, `site.webmanifest` (name, short_name "D. Clemente", theme/background colours, display "browser").
- Headings: one H1; hierarchy without skips. Images: width/height set; `loading="lazy"` except hero; `fetchpriority="high"` on the hero LCP element (it is text; do not preload decorative fruit).
- `lang="es"`; every page reachable within 2 clicks from home; footer links all routes.

## 6. Components (Astro, owned by T03 unless stated)
`BaseLayout.astro` (props: title, description, ogSlug, field of header, current nav, breadcrumb items, hideActionBar, article meta), `Header.astro`, `ServicesMenu.astro`, `MenuSheet.astro`, `ActionBar.astro`, `Footer.astro`, `Breadcrumb.astro`, `Icon.astro` (`<svg class="icon"><use href="{base}icons.svg#i-name"/></svg>`, decorative by default), `Note.astro`, `Still.astro` (objects: [{src, w, top/left/right/bottom, rotate}], settle), `Button.astro` (variant primary|secondary, href, icon arrow), `Fiche.astro` (service summary card). No Tag/Chip components: badges are `<span class="badge …">`. Page sections are written inline in each page with the catalogue classes; no further abstraction.
§6.4 Area icons: deportiva: dumbbell, footprints, activity, sun · clínica: salad (digestivas), wheat-off (alergias), droplets (dislipemias), heart-pulse (hipertensión), microscope (otras metabólicas) · pérdida de peso checklist uses ticks only.
§6.5 Action bar label "Cuéntame tu objetivo" → `/contacto/`; hidden on `/contacto/` and 404.
§6.6 Contact form: fields from contacto copy (Nombre*, Email*, WhatsApp opcional, Objetivo = radio chips, Mensaje), hidden `programa` input, honeypot field `empresa` (visually hidden, `tabindex=-1`, `autocomplete=off`). `data-endpoint` = `PUBLIC_FORM_ENDPOINT` (empty in prototype → success state "form.ok.proto"). `?objetivo=` preselects a chip (site.js 6b). No select element.
§6.7 Whole-card links: in `.svc-row` and `.post-row` only the title/arrow link exists; its `::after` covers the card. No nested interactive elements.

## 7. Responsive and interaction contract
Breakpoints 600/900/1024 only. At 360 px width: no horizontal scroll, no text < 14 px, buttons stack full width, header shows brand + "Menú". Touch targets ≥ 44×44. Behaviour of header, sheet, services disclosure, action bar, duration switch, form, TOC: exactly `design/js/site.js` (ported as `src/scripts/site.js`, imported once by BaseLayout). Everything readable and navigable without JS (sheet falls back to footer links; duration shows 2-month prices; form posts nowhere and shows browser validation).

## 8. Environment variables (`.env.example`)
`SITE_URL` (https://doby-llm.github.io), `BASE_PATH` (/web-dani/), `PUBLIC_INDEXABLE` (false), `PUBLIC_PROVISIONAL` (true), `PUBLIC_SHOW_EDITORIAL` (true), `PUBLIC_FORM_ENDPOINT` (empty). All links/assets built with `import.meta.env.BASE_URL`; a test fails on any absolute `/` href that bypasses the base.

## 9. Quality budgets (verification matrix in `tasks.md`)
- Lighthouse mobile (simulated Moto G, 4G) on `/`, `/programas/`, `/contacto/`, one service: Performance ≥ 95, Accessibility 100, Best Practices 100, SEO 100 (SEO measured with `PUBLIC_INDEXABLE=true` build, since noindex costs SEO points by design).
- LCP < 2.0 s, CLS < 0.02, TBT < 50 ms. Total JS ≤ 6 KB gzip; CSS ≤ 15 KB gzip; fonts ≤ 100 KB (actual 84 KB); each page ≤ 450 KB transferred.
- axe-core: 0 violations (wcag2a, wcag2aa, wcag21aa, wcag22aa) on all routes at 390 and 1440 px.
- Copy: `check:copy` green; every `src/data/copy` string rendered somewhere (unused-string report = 0 except dropped fields).
- Links: 0 broken internal links, 0 hrefs without base.
- Visual: coordinator compares `npm run shots` output against `design/mockups/shots` (v4, salvia) per route at 390/1440; differences in composition = bug, differences from real copy length = fine.

## 10. Risks
- Haiku drift from mockups → mitigated by verbatim CSS, class catalogue, per-page mockup, screenshot gate.
- Copy override typos → script fails when a `find` does not match.
- OG generation on CI (resvg native binary) → pinned versions verified on arm64 Pi; GitHub runners are x64 (prebuilt binaries exist). Fallback: commit generated PNGs with `npm run og` (pre-approved, trigger: CI build fails in the OG step twice).
- Temporary images licence: Pexels licence allows commercial use without attribution; still replaced by DEC-09 assets before launch.
