# WE AI — marketing site

Single-page static site for **WE AI**, a boutique AI consultancy for NZ owner-operators, GMs, and founders.

No framework, no build step. Plain HTML + CSS + a small inline `<script>` for the role × function picker and the contact form.

## Files

| File | Role |
|---|---|
| `index.html` | The site. |
| `tokens.css` | Design tokens — colors, type, scale. |
| `assets/favicon-weai.svg` | Favicon. |
| `assets/logos/` | 12 SVG word-mark variants (3 themes × 3 fill weights + 3 solid lockups). |
| `404.html` | Custom not-found page. |
| `vercel.json` | Deploy config — security headers, cache rules, clean URLs. |
| `robots.txt` / `sitemap.xml` | SEO basics. |

## Run locally

```bash
npx serve .            # or: python3 -m http.server 3000
```

Open `http://localhost:3000`.

## Deploy to Vercel

**Option A — CLI (one-off):**

```bash
npm i -g vercel
vercel              # preview deploy
vercel --prod       # production deploy
```

**Option B — GitHub integration (recommended):**

1. Push this directory to GitHub.
2. Import the repo at https://vercel.com/new.
3. Vercel auto-detects it as a static site — no framework preset needed.
4. Set the production domain (e.g. `weai.co.nz`) under **Project Settings → Domains**.

Each push to `main` deploys to production; PRs get preview URLs.

## Before going live

- [ ] Replace the OG / Twitter image at `https://weai.co.nz/assets/og-image.png` (the head currently points at the SVG favicon as a placeholder — generate a 1200×630 PNG).
- [ ] Update the canonical / OG URLs if the production domain isn't `weai.co.nz`.
- [ ] Wire the contact form to a real endpoint. The form currently falls back to `mailto:hello@weai.co.nz` — see the `initYarnForm` IIFE at the bottom of `index.html`. Swap the mailto block for a `fetch()` to Formspree, a Vercel serverless function, or the team's existing endpoint.
- [ ] Set DNS for `weai.co.nz` to Vercel.

## Theme

The site loads with the **teal** theme by default (deep teal background, gold accents).

A small sun/moon button in the nav lets a visitor flip to **dark** (noir background). The choice persists to `localStorage` under `weai-theme`. Clearing storage returns to the teal default. The pre-paint script runs synchronously in `<head>` so there's no theme flash on load.

The CSS still includes a third `light` theme (white/teal-ink). It isn't reachable from the toggle, but you can opt a visitor in manually with `localStorage.setItem('weai-theme', 'light')` or wire a third toggle state later.

## Brand notes

See `../design_handoff_weai_site/CLAUDE.md` for type/colour rules. The two non-obvious ones:

- Fraunces ligatures must stay disabled globally — the `f` melts into `i` / `l` at large sizes otherwise.
- Italic display text uses **Cormorant Garamond**, not Fraunces italic. Don't merge them.
