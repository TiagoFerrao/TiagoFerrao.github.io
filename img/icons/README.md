# SVG icons — source of truth

This folder is a **reference catalogue** of every SVG icon used across the site.

## ⚠️ Important

The site **does not load these files at runtime**. All icons are *inline* inside
the HTML pages so they can be styled via CSS (theme switching, `fa-primary` /
`fa-secondary` duotone). This folder exists for:

- **Discoverability** — find an icon's source by name instead of grepping HTML.
- **Version control** — track icon changes over time.
- **Future migration** — if we ever move to SVG sprites, these files are ready.
- **Re-use** — when you need the same icon on a new page, grab the SVG from
  here and paste it inline into the new HTML.

## Drift warning

If you change an icon, you must update **two places**:

1. The file here in `img/icons/<name>.svg`
2. The inline `<svg>` block(s) in every HTML page that uses it

Use `grep -r "card-skills-head-side-brain" *.html` (with the matching name) to
find inline copies that need updating.

## Naming convention

| Prefix          | What it is                                                   |
|-----------------|--------------------------------------------------------------|
| `card-*`        | Hub card icons on `index.html` (small, inside `.hub-card`)   |
| `page-*`        | Page-header icons (one per page, large, at top of `<main>`)  |
| `energy-*`      | Content card icons inside `energy.html` (fire/wind/sun)      |
| `social-*`      | Social media icons (footer & contacts page)                  |
| `contact-*`     | Contact-method icons (phone, map-pin, document)              |
| `ui-*`          | UI controls (nav-toggle, theme-toggle)                       |
| `placeholder-*` | Decorative "Coming Soon" icons (will be removed when section ships) |

## Current inventory

### Hub cards (`index.html`)
- `card-business-chart-user.svg` *(chart-user, duotone thin)*
- `card-digital-robot.svg` *(robot, duotone thin)*
- `card-education-user-graduate.svg` *(user-graduate, duotone thin)*
- `card-energy-power.svg` *(power-off, duotone)*
- `card-environment-hand-holding-seedling.svg` *(hand-holding-seedling, single thin)*
- `card-greenscreen-computer-classic.svg` *(computer-classic, single thin)*
- `card-innovation-user-astronaut.svg` *(user-astronaut, single thin)*
- `card-skills-head-side-brain.svg` *(head-side-brain, duotone thin)*

### Page headers
- `page-business-chart-user.svg`
- `page-digital-code.svg`
- `page-education-user-graduate.svg`
- `page-energy-power.svg`
- `page-environment-hand-holding-seedling.svg`
- `page-greenscreen-computer-classic.svg`

### Energy page content cards (`energy.html`)
- `energy-fire.svg` *(fire-flame-curved, duotone)*
- `energy-wind.svg` *(wind, duotone)*
- `energy-sun.svg` *(sun-bright, duotone)*

### Contacts page (`contacts.html`)
- `contact-phone.svg`
- `contact-map-pin.svg`
- `contact-document.svg` *(used for the CV link)*

### Social (footer & contacts)
- `social-email.svg`
- `social-github.svg`
- `social-linkedin.svg`

### UI
- `ui-nav-toggle.svg` *(hamburger menu)*
- `ui-theme-toggle-moon.svg`

### Placeholders (temporary — section under construction)
- `placeholder-tree.svg` *(environment.html "Coming Soon")*
- `placeholder-skills-spheres.svg` *(skills.html "Coming Soon")*

## Visual style

Most icons are FontAwesome Pro 7.2.0. Two coexisting styles:

- **Duotone Solid / Duotone Thin** — 2 paths with `fa-secondary` and `fa-primary`
  classes. CSS applies different colors + opacity for the duotone effect.
- **Single Thin** — 1 path with `fa-primary` class. Flat single-color rendering.
  Used when the FontAwesome family doesn't ship a duotone variant for that icon.

All paths use `fill="currentColor"` so they inherit color from CSS, which
makes them respect the active theme (teal ↔ navy).
