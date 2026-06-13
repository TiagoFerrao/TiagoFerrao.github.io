# ferrao.me

Personal site of **Tiago Ferrão** — live at **[ferrao.me](https://ferrao.me)**.
Static site, served by **GitHub Pages** from `master` (custom domain `ferrao.me`).

## Run locally
```bash
python3 -m http.server 8766      # then open http://localhost:8766/
```
JS-injected bits (header/footer/terminal) update instantly; linked CSS is browser-cached — hard-refresh after CSS edits.

## Deploy
Push to `master` → GitHub Pages rebuilds (~1 min) and the CDN cache refreshes (~10 min).
```bash
git add -A && git commit && git pull --rebase origin master && git push origin master
```

## Project notes & resuming work
- **`CLAUDE.md`** (this repo) — architecture, conventions, and the canonical page structure.
- **Dev / mockups / handoff live in a separate _private_ repo:** `TiagoFerrao/homepage-dev` (no Pages).
  To pick up where the last session left off — current state, the safe checkpoint, and open TODOs —
  clone that repo and read its **`HANDOFF.md`**.

> The site repo is intentionally **public + lean**. The repo can't be made private without disabling
> GitHub Pages on a free plan (it would take the site down), so anything private lives in `homepage-dev`.
