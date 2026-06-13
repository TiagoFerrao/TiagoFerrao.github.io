# ferrao.me — project notes

Personal site of Tiago Ferrão. Static site, **GitHub Pages** from repo `tiagoferrao.github.io`
(GitHub user `tiagoferrao`), custom domain `ferrao.me`. **Deploys on push to `master`** (~1 min build;
CDN caches ~10 min — hard-refresh to see changes). DNS at Namecheap; `api.ferrao.me` → a Railway app
(the notion-agent backend, see "Next step").

## Dev / handoff
Mockups, design explorations and the session **handoff notes** live in a **separate private repo**,
`TiagoFerrao/homepage-dev` (no Pages). This repo stays public + lean. To resume work on another machine,
clone that repo and read its `HANDOFF.md` (current state, checkpoint, open TODOs). Reason it's separate:
making this `username.github.io` repo private would disable GitHub Pages on a free plan and take the site down.

## Purpose (drives design decisions)
Dual audience: (1) Tiago's own complete archive of his work; (2) an employer-facing pitch. The IA must
serve both — a curated, high-signal surface on top, the full archive underneath.

## Current design — green-screen CLI terminal (shipped June 2026)
The site is built around a **reusable terminal component**:
- `js/terminal.js` — binds to `#lp-term`. Commands: `ls`, `contact`, `cat cv`, `lamp`, `about`, `clear`,
  + easter eggs (`whoami`, `sudo`). `data-init="cmd"` on `#lp-term` auto-runs commands on load (shown as a
  real session). Slim "strip" mode (`.st`) collapses to the prompt and expands on focus / on data-init.
- `js/footer.js` — injects the slim terminal strip into every content page's footer, with the copyright in
  the `~/` bar and a **mobile** section-nav fallback. Also injects `landing.css` + `terminal.js`.
- `js/header.js` — brand (= Home link, no Home tab) + discreet **CLI section nav** under it on desktop
  (`~/ digital · business · …`, current page lit); meta nav `about · contact · cv` in matching CLI style.
- `index.html` (landing) — its own minimal top bar (`~/` + meta nav) + hero + pitch cards
  (Business/Education/Skills) + browse row + full centerpiece terminal. Does NOT use header.js/footer.js.
- `contacts.html` — standard page; the footer terminal auto-expands with `cat contact.txt`.
- `about.html` — hosts the "Where I've worked & studied" world map.

### CSS
- `css/landing.css` — terminal frame, expand animation, landing layout, footer strip, section nav.
- Width: `.container` uses `--shell-max` (wide); landing wrap = 700px; **footer terminal spans the page
  content width** (same `min(100% - 2*gutter, --shell-max)` formula). One earlier attempt to unify
  everything to `--content-max: 760px` was rejected ("looked terrible") — do NOT reintroduce.
- Nav language site-wide: lowercase mono, `·` separators, phosphor hover, current/active in phosphor.

### Canonical content-page structure (every section page MUST follow this)
All content/section pages (digital, business, education, skills, energy, innovation, …) share one skeleton —
do NOT reinvent it per page, and do NOT override the spacing tokens inline:
- `<header id="site-header"></header>` + `js/header.js` (brand + CLI section nav) and
  `<footer id="site-footer"></footer>` + `js/footer.js` (terminal strip); load the shared
  `css/variables|base|layout|components|responsive.css` (with `?v=N`).
- Content lives in `<main>` → `<div class="container">` → `<section class="page-header fade-in">`
  (centered FA icon 64px + `<h2>` title + lead `<p>`), then the page body.
- Spacing is canonical, from `css/layout.css`: `main { padding: var(--space-3xl) 0 }`,
  `.page-header { margin-bottom: var(--space-3xl) }`, icon `margin: 0 auto var(--space-lg)`,
  `h2 { margin-bottom: var(--space-sm) }`, lead `max-width:600px;margin:0 auto`.
  `.container` = `min(100% - 2*--gutter, --shell-max)`. **Never** hard-code a page `.container`
  width or `body`/hero padding — it breaks the cross-page negative-space rhythm.
- The page title is the `<h2>` inside `.page-header`; the only `<h1>` is the brand (from header.js).
- A page may add its own bespoke body below the `page-header` (e.g. innovation's interactive diagram),
  but the header/footer chrome + the `main>container>page-header` hero must stay canonical.

### Innovation section (shipped June 2026)
- `innovation.html` — standard content page (header.js/footer.js). Hosts interactive innovation-management
  tools as cards. Nav activated everywhere (header.js, footer.js, index.html browse row, terminal.js `ls`)
  — no longer a `soon`/`lp-soon` stub.
- **Tools live in-repo as self-contained static apps** (single `index.html`, React+Babel via unpkg CDN):
  - `business-model-app/` — interactive Business Platform Canvas (thesis Fig. 28 layout) + adoption-driven
    financial estimate. localStorage key `platform-model-v2`. Seeded with SportSpots.
  - `business-case-builder/` — 7-step wizard replicating the 360 business-case template
    (Fundamentals → Stakeholders → Opportunity Size TAM/SOM → Concept & Costs → Product Spec → Financial Plan
    → Results), multi-year P&L to EBITDA, floating Assumptions drawer. localStorage key `business-case-builder-v1`.
  - Both served by GitHub Pages at `/business-model-app/` and `/business-case-builder/`. May later move to Vercel.

## ▶ NEXT STEP (pick up here) — wire the "ask me anything" agent
The terminal's free-text "ask me about Tiago" is a placeholder: `askAgent()` in `js/terminal.js`.
Wire it to the **notion-agent** backend (`/Users/home/code/notion-agent`, FastAPI on Railway):
- Endpoint: `POST https://api.ferrao.me/chat` (CORS already `*`). Returns a single JSON response.
- Before going public:
  - **Rate-limit / abuse guard** — it's a public unauth endpoint calling Claude (Anthropic-cost risk):
    per-IP/session limits, max input length, capped `max_tokens`.
  - **Widen knowledge scope** — backend currently only queries Notion DBs Research + Eventos; add more
    so it can answer career/bio/skills questions.
  - **Model bump** — backend pins `claude-sonnet-4-20250514`; move to current Sonnet (`claude-sonnet-4-6`).
  - UX: a "thinking…" indicator; consider streaming (SSE) later (backend returns one response today).

## Workflow
- Preview locally: `cd /Users/home/code/homepage && python3 -m http.server 8766` → http://localhost:8766/
  (JS-injected bits update instantly; linked CSS is browser-cached — hard-refresh after CSS edits).
- Deploy: `git add -A && git commit && git pull --rebase origin master && git push origin master`.
  (Note: `git mv`/`mv` is aliased to `-i`; use `/bin/mv -f` in scripts. GitHub commits CNAME churn when
  the Pages custom domain is re-saved — rebase over it.)
