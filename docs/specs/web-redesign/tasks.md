# tasks.md — web-redesign

## Worker rules (read before any task)
1. One task per run. Read in order: `briefs/README.md` → `briefs/<ID>.md` → this task entry → the matrix rows it lists → the referenced SPEC sections and mockup.
2. Check every predecessor is merged on `main`; if not, stop and report.
3. Branch `feat/<id>-<slug>` from fresh `main`. Touch ONLY the files listed under **Files**. Any other file needed = stop and report.
4. Copy comes from `src/data/copy/*.json` (after T02) or the microcopy table SPEC §4.3. Never type client-facing Spanish yourself.
5. CSS: never edit `src/styles/*.css` (owned by T01, frozen). Page-scoped `<style>` may only use tokens (`var(--…)`) for layout.
6. Run `npm run build` and `npm run check` locally before pushing. CI is the build authority.
7. Open a PR titled `<ID>: <title>`, body = receipt (below). Do NOT merge. Budget: 45 min wall time, 2 CI attempts; then stop and report.
8. Receipt: what changed (files), commands run + result, matrix rows claimed, screenshots path (`npm run shots -- <routes>` → `shots/`), open doubts.
9. Planner rulings at the end of this file override briefs.

## Graph
```
T00 → T01 → T02 → T03 → {T04, T05, T06, T07, T08, T09, T10} → T11 → R1 → C1 → F1
```
Parallel wave W3 = T04–T10 (max 3 concurrent workers on the Pi). Shared-file leases: `src/layouts/BaseLayout.astro` = T03 creates, T10 is the only later editor; `src/components/*` = T03 only (others import); `package.json` = T01, then T10 (adds og deps), then T11 (adds test deps) — serialized by graph; `astro.config.mjs` = T01, T10.

---

## T00 — Create repo and import packet (coordinator-only)
Pred: APROBADO. Files: new repo `doby-llm/web-dani` (public). Steps: `gh repo create doby-llm/web-dani --public`; copy `~/.local/share/dani-web-planning/{packet → docs/specs/web-redesign/, design → design/, copydeck → content-src/copydeck/, copy/overrides.yaml → content-src/overrides.yaml}`; keep `design/mockups/shots/` (reference screenshots for the visual gate, convert to WebP q80 first if > 15 MB), drop `design/mockups/node_modules` (symlink) and `design/fonts/sources/`, `design/icons-src/` stays; copy `archive/screens/` → `docs/specs/web-redesign/history/` (rejected v1–v4 candidates, reference only); add README (one paragraph + link to spec); gitleaks/secret grep; commit to `main`; enable Pages with source "GitHub Actions" (`gh api -X POST repos/doby-llm/web-dani/pages -f build_type=workflow`). Done when: repo exists, `docs/specs/web-redesign/SPEC.md` on main. Rows: M0.

## T01 — Astro scaffold, design system port, CI/Pages
Pred: T00. Files: `package.json`, `package-lock.json`, `astro.config.mjs`, `tsconfig.json`, `.nvmrc`, `.env.example`, `.gitignore`, `src/styles/{tokens,base,components}.css`, `src/scripts/site.js`, `public/fonts/*`, `public/icons.svg`, `src/assets/img/*`, `src/pages/index.astro` (placeholder "Hola"), `.github/workflows/deploy.yml`, `scripts/shots.mjs`. Brief: T01. Rows: M1, M2, M3, Q7.

## T02 — Copy pipeline
Pred: T01. Files: `scripts/build-copy.mjs`, `src/data/copy/*.json` (generated, committed), `package.json` (scripts only: `copy`, `check:copy`). Brief: T02. Rows: C1, C2.

## T03 — Layout shell and shared components + 404
Pred: T02. Files: `src/layouts/BaseLayout.astro`, `src/components/{Header,ServicesMenu,MenuSheet,ActionBar,Footer,Breadcrumb,Icon,Note,Still,Button,Fiche}.astro`, `src/lib/{env,nav,url,text}.ts`, `src/pages/404.astro`, `src/pages/index.astro` (still placeholder, but using BaseLayout). Mockups: `_header.html`, `_footer.html`, `estados-nav.html`, `404.html`. Brief: T03. Rows: N1–N6, A1, C3.

## T04 — Home
Pred: T03. Files: `src/pages/index.astro`. Mockup: `home.html` (section order per ruling R21). Brief: T04. Rows: P1, I1, I2.

## T05 — Services index + 3 service pages
Pred: T03. Files: `src/pages/servicios/index.astro`, `src/pages/perdida-de-peso/index.astro`, `src/pages/nutricion-deportiva/index.astro`, `src/pages/nutricion-clinica/index.astro`, `src/components/sections/ServiceAreas.astro` (only new component allowed). Mockups: `servicios.html`, `servicio.html`. SPEC §3 T-SERVICE. Brief: T05. Rows: P2, P3.

## T06 — Medical, Programas, Cómo funciona
Pred: T03. Files: `src/pages/perdida-de-peso/tratamiento-medico/index.astro`, `src/pages/programas/index.astro`, `src/pages/como-funciona/index.astro`. Mockups: `medico.html`, `programas.html`, `como-funciona.html`. Brief: T06. Rows: P4, P5, P6, L1.

## T07 — Sobre mí, FAQ, legal ×3
Pred: T03. Files: `src/pages/sobre-mi/index.astro`, `src/pages/preguntas-frecuentes/index.astro`, `src/pages/{aviso-legal,privacidad,cookies}/index.astro`, `src/components/sections/LegalPage.astro`. Mockups: `sobre-mi.html`, `preguntas-frecuentes.html`, `legal.html`. Brief: T07. Rows: P7, P8, P9.

## T08 — Contacto + form
Pred: T03. Files: `src/pages/contacto/index.astro`. Mockup: `contacto.html`. SPEC §6.6. Brief: T08. Rows: F1–F6.

## T09 — Blog (collection, index, article template)
Pred: T03. Files: `src/content.config.ts`, `src/content/blog/glp-1-y-perdida-de-peso.md` (`draft: true`, body = placeholders from mockup), `src/pages/blog/index.astro`, `src/pages/blog/[slug].astro`. Mockups: `blog.html`, `blog-articulo.html`. Brief: T09. Rows: B1–B4.

## T10 — SEO, social cards, icons
Pred: T03. Files: `src/components/Seo.astro`, `src/lib/seo.ts`, `src/data/seo.json` (SPEC §4.4 table), `src/pages/og/[slug].png.ts`, `src/pages/robots.txt.ts`, `public/{favicon.svg,favicon-32.png,apple-touch-icon.png,icon-512.png,site.webmanifest}`, `scripts/make-icons.mjs`, `src/layouts/BaseLayout.astro` (head only), `astro.config.mjs` (sitemap integration), `package.json` (deps satori, @resvg/resvg-js, @astrojs/sitemap). Brief: T10. Rows: S1–S9.

## T11 — Test harness and full run
Pred: T04–T10. Files: `tests/**`, `playwright.config.ts`, `lighthouserc.json`, `package.json` (devDeps + `check` script), `.github/workflows/deploy.yml` (add test job before deploy). Brief: T11. Rows: Q1–Q8 (runs all rows; reports failures, does NOT fix pages).

## IMG — Swap in AI images (coordinator-only, not counted, non-blocking)
Pred: Manu delivers files from `IMAGE_PROMPTS.md`. Coordinator converts portrait/working/avatar to WebP (sharp, q 82, long side 1600/1600/800), food PNGs to transparent PNG (cut-out with `rembg` or as delivered) ≤ 1024 px, replaces same-name files in `src/assets/img/`, re-runs `make-icons` (OG objects), build, shots; commits `chore: real images`. Rejects any image failing the IMAGE_PROMPTS checklist and tells Manu which item and why.

## R1 — Independent review (Haiku, read-only)
Pred: T11. Exhaust the whole matrix against the deployed preview + `npm run shots` vs `design/mockups/shots/`. One findings file `docs/specs/web-redesign/review/R1.md`, each finding: row, route, viewport, evidence (screenshot/selector), class (bug | evidence gap | spec gap). No fixes.

## C1 — Consolidated correction batch
Pred: R1. One worker fixes all R1 `bug` findings in the files that own them (the original task allowlists, union). Spec gaps → coordinator asks planner/Manu; not fixed here.

## F1 — Final verification and publish (coordinator)
Pred: C1. Re-run full matrix on `main`; deploy; record the Pages URL, Lighthouse JSON and axe report in `docs/specs/web-redesign/evidence/`. If any row fails: stop, report rows; no new automatic writer.

---

## Verification matrix
| Row | Check | How | Owner |
|---|---|---|---|
| M0 | repo + packet on main | `gh repo view doby-llm/web-dani` ; file exists | T00 |
| M1 | build passes Node 22 | `npm ci && npm run build` | T01 |
| M2 | CSS ported verbatim | `diff design/css/X.css src/styles/X.css` empty except font URL paths (`../fonts/` → `/fonts/` via BASE) | T01 |
| M3 | Pages deploy from Actions works | workflow green, URL 200 | T01 |
| C1 | overrides apply, each `find` matches | `npm run check:copy` | T02 |
| C2 | generated JSON committed and in sync | CI `check:copy` | T02 |
| C3 | every disclaimer rendered via `.note`, kinds honour env | test `notes.spec` | T03/T11 |
| N1 | header desktop: nav + Servicios disclosure (click, Esc, focus-out) | Playwright | T03 |
| N2 | sheet < 1024 px: opens, traps scroll, Esc closes, focus returns, `inert` when closed | Playwright | T03 |
| N3 | action bar < 900 px: hidden on load, shows after hero CTAs, hides over footer/`[data-hide-action-bar]`; absent on /contacto/ & 404 | Playwright | T03 |
| N4 | aria-current on nav + breadcrumb last item | Playwright | T03 |
| N5 | header gains shadow after scroll (`data-scrolled=true`) | Playwright | T03/T04 |
| N6 | 404 page | build output `404.html` | T03 |
| A1 | all hrefs/assets respect BASE_PATH | test `links.spec` | T03/T11 |
| P1 | home matches mockup composition H1–H8 at 390 + 1440 | shots vs mockup | T04 |
| I1 | duration switch changes both prices + labels; no-JS shows 2 meses | Playwright | T04 |
| I2 | still-life settle runs once, disabled with reduced motion; no food on medical/programas/FAQ/legal/article (R20) | Playwright (emulate) + DOM | T04/T11 |
| P2 | /servicios/ svc-index rows (tints + thumbnails) + "Cómo elegir" | shots | T05 |
| P3 | 3 service pages follow SPEC §3 order, correct hero ground + fiche, area icons §6.4 | shots | T05 |
| P4 | medical page: no food art, roles block, Importante block, CTAs | shots + DOM | T06 |
| P5 | programas: two plans with full price tables, anchors #programa-a/#programa-b | DOM | T06 |
| P6 | cómo funciona: protocol 5 columns ≥ 900, vertical rail below | shots | T06 |
| L1 | medication-not-included sentence present on medical + programas | DOM text | T06 |
| P7 | sobre mí composition | shots | T07 |
| P8 | FAQ: 8 `<details>`, first open, FAQPage JSON-LD (after T10) | DOM | T07/T10 |
| P9 | 3 legal pages from one component | DOM | T07 |
| F1 | required/email validation messages (§4.3), focus first invalid | Playwright | T08 |
| F2 | `?objetivo=` preselects chip (deportiva, clinica, medico, perdida-de-peso) | Playwright | T08 |
| F3 | empty endpoint → prototype success state; endpoint set → POST + live/error states (mock route) | Playwright | T08 |
| F4 | honeypot present and hidden from AT | DOM | T08 |
| F5 | labels bound, autocomplete attrs, 44 px targets | axe + DOM | T08 |
| F6 | no `<select>`; goal chips are a radio group with legend | DOM | T08 |
| B1 | blog index lists teasers "Próximamente" (from copy) + published posts (0 now) | DOM | T09 |
| B2 | draft posts not built | build output | T09 |
| B3 | article template renders a post when `draft:false` (test fixture) | Playwright fixture | T09 |
| B4 | TOC highlights current h2 (≥ 1024 px only) | Playwright | T09 |
| S1 | title/description per SPEC §4.4, lengths | test | T10 |
| S2 | canonical absolute with trailing slash | test | T10 |
| S3 | robots meta + robots.txt follow PUBLIC_INDEXABLE | test both builds | T10 |
| S4 | OG/Twitter tags complete; og:image absolute PNG 1200×630 ≤ 300 KB | test + file check | T10 |
| S5 | OG images visually: title readable, no clipping (coordinator looks at 3) | eyes | T10 |
| S6 | JSON-LD valid JSON, types per §5, no Offer while provisional | test | T10 |
| S7 | sitemap excludes 404/og; lists all routes | test | T10 |
| S8 | favicon set + manifest load (200) | test | T10 |
| S9 | share preview: send the Pages URL to Manu in Telegram, preview shows image+title | 👤 Manu, 1 min | F1 |
| Q1 | axe 0 violations, all routes, 390 + 1440 | `npm run test:a11y` | T11 |
| Q2 | no horizontal scroll at 360 px, all routes | Playwright | T11 |
| Q3 | Lighthouse mobile budgets SPEC §9 on 4 routes | `npm run lhci` | T11 |
| Q4 | size budgets JS/CSS/fonts/page | script | T11 |
| Q5 | 0 broken internal links | `links.spec` | T11 |
| Q6 | keyboard: every interactive reachable, visible focus | Playwright tab walk | T11 |
| Q7 | no third-party requests | Playwright request log | T01/T11 |
| Q8 | copy usage: every JSON string rendered or listed as dropped | script | T11 |

## Planner rulings
Rulings override every brief. Numbering is global. **R16–R21 (v4, 2026-11-17) override every older ruling and brief text they contradict.**

R16. **Visual system v4 "Consulta con carácter" (DEC-14).** `design/` now holds v4 only (DESIGN.md, css, fonts, img, icons, mockups, shots). Any brief text naming v2 classes or tokens (`field--*`, `stall*`, `tag`, `chip`, `banner*`, `role`/`roles` grid, `steps`/`step__n`, `creds`, `mist`, `leaf`, `leaf-tint`, `sun-tint`, `accent-deep`, `brand-deep`, `page-hero__art`, `headerOnCobalt`/`site-header--on-brand`) is obsolete: implement what the v4 mockup of that page shows, using DESIGN.md §6 classes. Where the mockup and a brief disagree on markup, the mockup wins; briefs still win on copy keys, hrefs, data attributes and logic.
R17. **Components (T03).** Drop `Tag.astro` and `Chip.astro`; add `Fiche.astro` (`{ title: string; icon: string; rows: {dt: string; dd: string; href?: string}[] }` → `aside.fiche` markup of `servicio.html`, `aria-label` = microcopy `fiche.aria`). `Header` has no `onCobalt` prop (the header is always paper). `BaseLayout` drops `headerOnCobalt`. Badges are plain `<span class="badge …">`. `nav.ts` services get `svc: 'weight'|'medical'|'sport'|'clinic'` instead of tint/fg/swatch.
R18. **Fonts.** Web: `fraunces-web.woff2`, `fraunces-italic-web.woff2`, `public-sans-web.woff2` (84 KB total) → `src/assets/fonts/`; preload only `fraunces-web` and `public-sans-web`. OG: `fraunces-og-560.ttf`, `fraunces-og-italic-450.ttf`, `public-sans-og-500.ttf`, `public-sans-og-700.ttf` → `src/assets/og-fonts/`. In tokens.css only the three `url(...)` lines may differ from `design/css` (row M2). Fonts budget ≤ 100 KB. `design/fonts/sources/` is not copied.
R19. **Italic accent.** h1/h2 `<em>` accents in mockups are produced by splitting the copy string, never by retyping it: `accent(text, n)` in `src/lib/text.ts` (T03) wraps the last `n` words in `<em>` (n from the mockup; 0 = none). Words must be identical to the copy.
R20. **Food placement.** Still life only where the v4 mockup has it (DESIGN §2). Never on medical, programas, FAQ, legal, article, nor in OG images of those routes (`ogObject: null`). Objects/geometry: copy the mockup inline styles into `<Still>` props.
R21. **Home (T04) v4 mapping.** Sections in order: hero (`hero--v4`: h1 accent n=3 "integral y personalizado"; `hero__stage` with portrait.webp, 3 objects avocado/lemon-a/lemon-b, `cred-card` = name + microcopy `cred.role` + 3 credentials: `sobre-mi.json` formación items [0] and [2] and home about `items[2]`, trailing periods removed) → `trust` (home about `items[0..3]`, icons laptop-minimal-check, stethoscope, school, microscope) → `svc-index` (objectives + medical row) → bg-medical medical block (`callout` + `table.roles`) → `protocol` → pricing (bg-surface) → `profile` about (bg-paper, `dl.cv` rows: Formación = sobre-mi formación items; Experiencia = about items[0..1]; Docencia y enfoque = about items[2..3]; row labels = microcopy `cv.education`, then sobre-mi headings "Experiencia" and "Docencia y enfoque"; the same 3 rows on /sobre-mi/) → `posts` → `cta-band--v4`. The v2 H1–H8 list in T04 is obsolete; P1 checks this order.

R1. **Component lease.** `src/components/*.astro` (top level) = T03 only. `src/components/sections/` is open: T05 owns `ServiceAreas.astro`, T07 owns `LegalPage.astro`. No other task adds files there.
R2. *(geometry part SUPERSEDED by R20: copy v4 mockup geometry)* **Still props** = `top/left/right/bottom` (T03 brief fixed). Briefs saying `x`/`y` mean `left`/`top`. Heroes without their own mockup (perdida-de-peso, nutricion-clinica) reuse the deportiva geometry with the objects named in T05.
R3. **Heading levels:** the copy `level` field is ignored. Mockup hierarchy wins (h1 → h2 per section → h3 inside panels/cards); never skip levels.
R4. **Reusing existing copy across pages is allowed** (home `cta-banner`/`final-cta` for closing banners, home medical disclaimer split into roles for medical blocks, `hero_ctas` labels reused on plan CTAs, `meta.title` prefixes). Writing new Spanish is not. The roles split rule and fallback of T04 H3 applies everywhere roles appear.
R5. **/perdida-de-peso/ hero CTAs** = its own copy: primary `hero_ctas[1]` "Quiero empezar" → `contacto/?objetivo=perdida-de-peso`, secondary `hero_ctas[0]` "Ver programas". SPEC §3 "Cuéntame tu objetivo" applies to the other two services.
R6. **Disclaimers always via `<Note>`.** Where a mockup shows a disclaimer as bold text or a chip (medical "Importante" second paragraph, medical top chip, programas medication sentence), render `<Note>` instead; for the Importante block use `<Note>` inside the `.important` box. Kinds: the medication sentences are `legal` (overrides.yaml updated); the como-funciona health-data sentence is `legal` (updated).
R7. *(colour-variable examples SUPERSEDED by R16)* **Mockup inline styles:** copy geometry (margin, width, position, aspect-ratio, transform) and the colour variables already used in mockups for avatars, ticks and links (`var(--accent-tint)`, `var(--mist)`, `var(--brand)` …). DESIGN §6 forbids NEW colours, not the mockups' token use. `.h3-like` does not exist: use the plan `h3` styles by giving the h2 class `plan__title` in page-scoped style `.plan .plan__title{…}` copied from `.plan h3` in components.css.
R8. **Unused copy** (hero_ctas not shown on programas/blog/legal/faq, "Ver pérdida de peso", etc.): T11 keeps `tests/copy-allowlist.json` listing each unused string with the page and reason; the coordinator approves the list at the T11 gate. Do not change T02 for this.
R9. **Blog:** teasers are unlinked `<h3>` everywhere (T04 fixed). Hábitos article hero ground = `bg-weight` (R16). Post titles `<title> · Daniel Clemente`; OG for posts: `ogTitle` = post title, `ogTag` = category label, object: none for articles (R20). Date shown with `Intl.DateTimeFormat('es-ES', { dateStyle: 'long' })`. The editorial note stays in the article template only behind `SHOW_EDITORIAL`. With `PUBLIC_INCLUDE_FIXTURES=true` the glob base is `tests/fixtures/blog` (draft absent in that run — fine). Astro 6.4.8 ships `astro/loaders` with `glob` (verified in node_modules); still check `render()`/`headings` against installed types and stop if different.
R10. **Legal pages:** `LegalPage` props `{ copyKey; crumb }` accepted; crumb labels = nav/footer labels ("Aviso legal", "Privacidad", "Cookies"). FAQ crumb = microcopy `crumbs.faq`. Legal pages DO show the action bar: put `data-action-bar-trigger` on the lead paragraph. SEO descriptions for legal pages and posts are now in SPEC §4.4.
R11. **Price-table caption** = microcopy `price.caption` (SPEC §4.3). Mockup section `aria-label`s without a key: omit and use `aria-labelledby` on the section heading.
R12. **Tooling:** Lighthouse via `@lhci/cli@0.15.1` (0.16 needs Node ≥ 22.19). `@playwright/test@1.65.1` and `@axe-core/playwright@4.14.0`. On the Pi use `CHROMIUM_PATH=/usr/bin/chromium` (Chromium 147); if Playwright rejects it, run `npx playwright install chromium` in the clone (allowed, not a dependency change). LHCI serves `.lhci/web-dani/` copy of dist (accepted). B3 uses `astro dev` on port 4322 with fixtures (accepted). Lighthouse service route = `/perdida-de-peso/`. The extra specs (`notes.spec`, `pages.spec`) are accepted. Q7 allows only `schema.org` and `www.w3.org` URL strings (T01 grep fixed). `.gitignore` entries added in T01.
R14. **Palette (DEC-12, chosen `salvia`).** All tasks use role tokens only (`--brand`, `--sun`, `--accent`, `--t-weight`, `--t-medical`, `--t-sport`, `--t-clinic`, `--ink`, `--paper`…). Never write a hex value in a component, page, OG generator or manifest; T10 reads the hex values from the `PALETTE:BEGIN/END` block of tokens.css. T01 copies tokens.css as-is (block included). A later palette change = replace that block only.
R15. **Images (DEC-13).** Code references `src/assets/img/{portrait,working,avatar}.webp` and the food PNGs `{avocado,grapefruit,lemon-a,lemon-b,lemon-c}.png` by these names. Until Manu delivers the AI images, T01 copies `portrait-placeholder.webp` three times under those names and the Pexels cut-outs as they are. Replacing them later is the coordinator-only step IMG (no worker). Replacing them later is a file swap (no task).
R22. **Answers to the v4 brief notes (2026-11-17).**
(a) Heroes without their own mockup (/perdida-de-peso/, /nutricion-clinica/) copy the `servicio.html` geometry with the objects of SPEC §3. (b) `design/mockups/shots/` is shipped by T00 (fixed); the gates compare against it. (c) Medical mockup fixed: hero has `page-hero--v4`, section 3 is `bg-surface` (no two adjacent grounds alike); the roles block keeps the `callout__foot` legal Note even though the mockup draws the note below the table. (d) Text in mockups vs copy: the copy JSON wins for words (README rule); the mockup only shows where the `<em>` accent goes. Programas and blog h1 come from the copy (after overrides) with the accent of the mockup applied via `accent()`; if the overridden string no longer ends with the mockup's accent words, use n = 0. (e) "Formación documentada" = `sobre-mi.json` section `formacion.heading`; contact submit label = `contacto.json` `form.submit` (both are copy keys, not microcopy). (f) Legal pages show the action bar (R10 wins over the mockup). (g) Blog teaser titles stay unlinked (R9 wins over the mockup).
R13. **Programas hero:** no buttons (mockup). Plan A CTA "Cuéntame tu objetivo" → `contacto/?objetivo=perdida-de-peso`; plan B "Consultar" → `contacto/?objetivo=medico`.
