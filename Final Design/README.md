# WE AI — Final Design

This folder is the written record of the design as shipped. The source of truth is the live code in this repository; this document explains what's there and why, and how it differs from the original design handoff at `../design_handoff_weai_site/`.

Last updated: 2026-05-04. Live at https://weai.co.nz (or the current Vercel deployment).

---

## 1. What this site is

A single long-scrolling marketing page for **WE AI** — a boutique AI consultancy serving New Zealand owner-operators, GMs, and founders. Not enterprise. The site reads as a "field guide": a manifesto-style top, a role × function picker that lets visitors see a concrete AI scenario for their job, three working modes, a six-step process, a case study, a beliefs grid, an ethics statement, and a contact form.

The tone of voice is direct, dry, and plainspoken. NZ English (*colour*, *organisation*). One italicised word per sentence carries the meaning. No hype.

## 2. Stack

- **HTML + CSS + a small inline `<script>`.** No build step, no JS framework, no bundler.
- **One Vercel serverless function** (`api/contact.js`) for the contact form. Sends mail via Resend's REST API using native `fetch` — no SDK dependency.
- **Hosted on Vercel.** Static files served from edge, function runs as a Node.js serverless on `/api/contact`.
- **Fonts from Google Fonts** via a single `@import` in `tokens.css`.

Everything required to run the site is in this directory. There is no `package.json`, no `node_modules`, no Dockerfile.

## 3. Typography — the big change from the handoff

The original handoff used **Fraunces** (variable font, modern) for upright display and **Cormorant Garamond** (classical) for italic display. Two-family display was the original design intent — contrast between the modern and the classical.

**The final design uses Cormorant Garamond for all display, both upright and italic.** Fraunces was removed entirely.

### Why

Fraunces' `f` glyph has an aggressive descender / swash. At hero scale (≈ 360 px) and at headline scale (clamps from 56–96 px), it fused into adjacent letters (`fi`, `fl`, "for", "fees", "fixed"…) as a single melted shape. The fallback patches in the original (`font-feature-settings: "liga" 0, "dlig" 0, "clig" 0, "calt" 0, "swsh" 0, "salt" 0` + a unicode-range "Fraunces F-swap" `@font-face` that hot-swapped the `f` glyph into Cormorant) reduced the problem but didn't eliminate it.

Switching the whole display family to Cormorant solved it cleanly — Cormorant's `f` is restrained at every size — and produced a more cohesive read: upright and italic display now share the same family, so the eye transitions seamlessly between them. The page lands more "boutique stationery" and less "modern variable-font tech".

### Final font stack

```
--font-display: 'Cormorant Garamond', 'Iowan Old Style', Georgia, serif;
--font-italic:  'Cormorant Garamond', 'Iowan Old Style', Georgia, serif;
--font-body:    'Geist', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
--font-mono:    'Geist Mono', ui-monospace, 'SF Mono', Menlo, monospace;
```

- **Cormorant Garamond** — display upright + italic. Weights 400/500/600/700 in both styles.
- **Geist** — body text, UI (buttons, form fields), nav meta. Weights 300/400/500/600/700.
- **Geist Mono** — eyebrows ("PRACTICAL AI"), captions, metadata, file refs, the nav meta strip.

The `@import` in `tokens.css` only loads these three families — Fraunces is no longer in the payload.

### Type-system rules to preserve

- **Ligatures must stay disabled globally.** `font-feature-settings: "liga" 0, "dlig" 0, "clig" 0, "calt" 0;` is set on body + every display selector in `index.html`. With Cormorant this is less critical than it was with Fraunces, but Cormorant Garamond's `ct` and `st` ligatures will fire by default in some weights — leave it off.
- **Italic display is always Cormorant Garamond italic** — never style-faked italic of a sans family.
- **Display headlines use Cormorant 300–500 weight.** Heavier weights (600/700) are loaded but reserved for tight all-caps treatments (e.g. the close-CTA mega-heading).
- **Body copy stays Geist.** Cormorant is for display only — except for the hero lead (see below).

### Where Cormorant goes beyond display

The hero lead paragraph ("Most owners can *tell* there's something to AI…") is set in Cormorant at 24 px / 1.5 line-height. The italic `<em>` words inside it are boosted to 1.2 em and coloured gold-cream. This is a deliberate departure from the rest of the body copy (which stays Geist) — it ties the editorial display voice down into the first body paragraph and lets the italic gold words read as part of the hero composition rather than as inline emphasis in a sans paragraph.

## 4. Word-mark (WE AI)

The wordmark is two `<text>` elements inside an SVG: upright `WE` in Cormorant, italic `AI` in Cormorant italic. It appears in three sizes:

- **Nav** — 44 px tall, used as the home link. Hairline strokes (2.4 px), bright teal + gold, semi-transparent fills (8 % on dark, 10 % on teal/light).
- **Hero** — 360 px, centered, with a one-shot draw-on animation (stroke-dasharray 4000, animated to 0 over 5.5 s; `AI` delayed 0.8 s).
- **Footer** — medium, plain.

### Letter-spacing tuning (the wordmark fix)

The original `.word-mark text` rule set `letter-spacing: -0.04em`. With Fraunces, that produced a clean tight pair. With Cormorant's wider W flare, the W's right wing crossed into the E.

Final values:

| Element | letter-spacing | Notes |
|---|---|---|
| `.word-mark text` (default for both) | `-0.04em` | Tight, kept for AI |
| `.word-mark .we` (override) | `0` | Natural Cormorant kerning — W wing just clears E. Selected after previewing 0.02em, 0.01em, 0, and -0.1em |
| `.word-mark .ai` | inherits `-0.04em` | Italic A/I have wider natural metrics, the negative value sits comfortably |

The nav wordmark (`.nav-logo svg text`) still uses `-0.04em` globally — at 44 px the WE/E collision isn't visible.

### Word-mark centering and mobile sizing

The hero word-mark used to be left-anchored within a 1300 px max-width SVG; on narrower viewports it drifted toward the left of the visible area. Final layout centres the SVG inside its container (`justify-content: center` on `.word-mark`) and clamps the font-size so the wordmark never renders smaller than the italic hero tagline below it:

```css
.word-mark text { font-size: clamp(120px, 22vw, 360px); }
```

On mobile this means the wordmark scales down with the viewport but always reads at least as large as the italic boutique-consultancy line — it never visually subordinates to the body copy beneath it.

### Glow on light / teal

On the dark theme the bright teal + gold strokes against the noir bg produce a "lit edge" for free. On light and teal themes the letters become darker than the background, so the lit-edge feel is recreated with two stacked `drop-shadow` filters per letter (8 px tight halo + 22 px softer outer halo) at teal-bright and gold opacities.

## 5. Color & themes

### Palette (final, from `tokens.css`)

| Token | Value | Role |
|---|---|---|
| `--noir` (`--night` on the page) | `#000C0E` | Primary dark surface |
| `--teal-deep` | `#003E47` | Default page surface (teal mode) |
| `--paper` | `#F8F5EE` / `#FFFFFF` (light) | Light surface |
| `--ink` / `--teal-ink` | `#001E22` | Type on light |
| `--cream` / `--ink-fg` | `#F4EFDF` | Type on dark |
| `--teal-bright` / `--teal-soft` | `#4FB8BE` | WE strokes, accents |
| `--gold-1` | `#DAA520` | AI strokes, CTAs |
| `--gold-cream` | `#EDD197` | Italic display words on dark |
| `--gold-deep` | `#8A6312` | Italic display words on light (AA contrast) |
| `--rule` | `rgba(244, 239, 223, 0.16)` | Hairline dividers on dark |

No green, no blue. Only teal + gold + cream + ink.

### Three themes

The CSS supports `data-theme="dark" | "light" | "teal"` on `<html>`. The shipped site reaches two of them through the nav toggle:

- **Teal** — default. Deep teal background (`#003E47`), cream type, gold + cream italics, drop-shadow glows on the wordmark.
- **Dark** — alternative. Noir background (`#000C0E`), cream type, bright teal + gold strokes glow naturally.
- **Light** — defined in CSS but not reachable from the nav toggle. White surface, teal-ink type. Can be opted into manually with `localStorage.setItem('weai-theme', 'light')` and reload, or wired into a 3-state toggle later.

### Theme behaviour

- Default on first visit is **teal**, regardless of OS `prefers-color-scheme`. An earlier version followed the OS pref; that was rolled back so the brand identity always leads.
- A small round sun/moon button in the nav (`#theme-toggle`, class `.nav-theme`) flips between teal and dark.
- The choice persists to `localStorage['weai-theme']`. Clearing it returns the visitor to the teal default.
- A pre-paint script in `<head>` reads the saved value (or falls back to `'teal'`) and sets `data-theme` before the first frame — there's no theme flash on load.
- `<meta name="theme-color">` is doubled with `media="(prefers-color-scheme: ...)"` so the browser chrome / address bar tints to the right colour on each OS mode.

## 6. Layout

- **Page max-width:** 1480 px on the wide container, 1320 px / 1240 px on narrower content sections, 48 px horizontal padding desktop, 24 px mobile.
- **Section padding-block:** 96 px desktop, 80 px on the picker / manifesto sections.
- **Card grid gap:** 24 px standard, 32 px for prose-heavy sections.
- **Border radius:** most surfaces are square; pill CTAs are `999px`, cards inside manifesto / picker are 12–16 px.
- **Section spacing inside the hero** uses CSS-grid `auto` rows so the hero stretches to fill the viewport on desktop and gracefully collapses on mobile.

## 7. The page in order

1. **Sticky nav** — `WE AI` wordmark (left), 3-col mono meta strip `AOTEAROA · NZ / EST. 2026 / SENIOR-LED` (centre), theme toggle + "Let's have a coffee →" pill CTA (right). 88 px tall on desktop, semi-transparent backdrop with 20 px blur, 1 px hairline bottom rule.
2. **Hero** — mono eyebrow row, huge centered `WE AI` SVG word-mark (draw-on animation), italic Cormorant tagline (gold-cream, fades in 1.4 s in), two-column hero-bottom with the Cormorant lead paragraph + two pill CTAs.
3. **Manifesto** — large editorial type block, Cormorant 36–64 px / weight 300, italic accents in gold-cream, signed off in an italic Cormorant signature.
4. **Picker — "What would AI do for *you?*"** — interactive role × function picker. Five roles × six functions = 30 scenarios. Result card shows the scenario, the tools touched, four stats (time saved, weeks to live, indicative fee, payback), and a "Talk through this →" link.
5. **Three ways we work** — three numbered cards in a row. Each: number, Cormorant 30 px title, short description, gold underline.
6. **How we work — 6 steps** — six numbered circles in a flow. The "How" section is the only section that **inverts** colour: it sits on a paper surface even on the dark theme, and inverts to a dark surface on the light theme — important to preserve.
7. **Case study (Tannin Co.)** — two-column block: copy (left) + visual quote card with stats (right). Cormorant 96 px quotation mark.
8. **What we believe** — section heading + grid of belief cards.
9. **Responsible AI / Ethics** — *"Responsible AI is the floor."* headline, a gold banner with `An off-switch that works.`, and a two-column principle grid (Care / Craft).
10. **Integrity protocol** — numbered four-step list with Cormorant step headings.
11. **Close CTA — "Let's have a *yarn.*"** — massive Cormorant headline, "Thirty minutes over coffee. No commitment, no slide deck. Human to human." copy, then the contact form: name / email / company / contact preference / message, honeypot + time-trap, two centered actions ("Request a 30-min yarn →" + "Or email hello@weai.co.nz"), status line.
12. **Footer** — three-column: wordmark (left), nav links (middle), meta (right).

## 8. Contact form

Server-side wired up via `api/contact.js` (Vercel function) and Resend.

- Form submits JSON to `/api/contact` via `fetch`. The handler in `index.html` is async and bubbles server errors back to the status line.
- The function re-validates everything client-side validation does (name, email regex, length limits), then runs two bot guards:
  - **Honeypot** — two hidden fields (`website_url_confirm`, `company_website`). If a bot fills either, the function returns `200 ok` and silently drops the message (so the bot thinks it succeeded).
  - **Time-trap** — the form stamps `loaded_at` on render. Submissions in < 3 s are dropped silently with the same fake `200 ok`.
- If everything passes, the function calls Resend's REST API with both HTML and plain-text bodies, sets `Reply-To` to the visitor's email so replies go straight back, and notifies `hello@weai.co.nz` (overridable via `CONTACT_TO`).
- Errors hit Vercel logs with `[contact] …` prefixes so they're easy to filter.

### Env vars

| Variable | Required? | Default | Purpose |
|---|---|---|---|
| `RESEND_API_KEY` | yes | — | Resend API key. Site returns 500 without it. |
| `CONTACT_TO` | no | `hello@weai.co.nz` | Notification recipient. |
| `CONTACT_FROM` | no | `WE AI <noreply@weai.co.nz>` | Visible from address. Must be on the Resend-verified domain or Resend will 422 → site returns 502. |

## 9. Concrete deltas vs the original design handoff

1. **Display family switched from Fraunces → Cormorant Garamond.** The F-swap `@font-face` blocks and the Fraunces Google Fonts import were removed.
2. **Tweaks panel removed.** The original loaded React + Babel from unpkg and referenced a missing `tweaks-panel.jsx` — would have 404'd in production.
3. **Theme defaults to teal**, not dark. Toggle is a small sun/moon button in the nav instead of the in-page Tweaks panel.
4. **Contact form is wired** — original had no backend, now POSTs to a Vercel function backed by Resend.
5. **Nav CTA copy:** "Let's have a chat →" → "Let's have a coffee →".
6. **Close-CTA copy:** added "over coffee" and "Human to human." to the supporting paragraph.
7. **Submit button copy:** "Book a 30-min yarn" → "Request a 30-min yarn".
8. **Email-fallback link** now opens with a `Let's have a yarn.` subject pre-filled.
9. **Form actions centred** under the form rather than left-aligned.
10. **Hero word-mark centred** within its container and clamped (`clamp(120px, 22vw, 360px)`) so it never drops below the size of the italic tagline beneath it on mobile.
11. **WE letter-spacing override** (`0`, normal kerning) so the W wing clears the E with Cormorant's wider flare.
12. **Hero lead paragraph** moved from Geist sans 21 px to Cormorant 24 px / 1.5, with italic `<em>` words boosted to 1.2 em.
13. **SEO + social** — added description, canonical, Open Graph, Twitter Card, dual `theme-color` (light/dark), apple-touch-icon, font preconnect.
14. **`vercel.json`** — HSTS, X-Frame-Options, X-Content-Type-Options, Referrer-Policy, Permissions-Policy. Long-cache `/assets/*`, short-cache `tokens.css`, no-cache HTML, no-store `/api/*`. `cleanUrls: true`.
15. **`404.html`** — brand-consistent not-found page.
16. **`robots.txt` + `sitemap.xml`** — SEO basics.
17. **All asset paths are root-absolute** (`/tokens.css`, `/assets/...`) so they resolve identically from any URL.

## 10. Where things live

| File | Role |
|---|---|
| `../index.html` | Site shell, all inline CSS, all inline JS. ~2200 lines, ~85 KB. |
| `../tokens.css` | Design tokens — colours, type, spacing, motion. ~376 lines. |
| `../assets/favicon-weai.svg` | SVG favicon, wireframe treatment, 50% fill. |
| `../assets/logos/` | 12 SVGs — 3 themes × 3 fill weights + 3 solid lockups. Recommended default `weai-{theme}-fill-08.svg`. |
| `../404.html` | Not-found page. |
| `../api/contact.js` | Vercel serverless function. Handles the form POST and the Resend send. |
| `../vercel.json` | Deploy config. |
| `../robots.txt`, `../sitemap.xml` | SEO. |
| `../.env.example` | Template for local Resend env vars. |
| `../README.md` | Run-locally + deploy-to-Vercel instructions, contact-form setup walkthrough. |

## 11. Deployment

- **Hosting:** Vercel.
- **Repository:** `mdutton27/weai-site` on GitHub. Push to `main` deploys to production; PRs get preview URLs.
- **Production URL:** https://weai.co.nz.
- **Static files:** served from edge with the cache rules in `vercel.json`.
- **Function:** `/api/contact` runs as a Node.js serverless function in Vercel's `iad1` region (typically).
- **DNS:** `weai.co.nz` → Vercel. SPF / DKIM / DMARC for Resend live at the same registrar.

### Pre-launch checklist (status as of this writeup)

- [x] Site deployed and serving from `weai.co.nz`.
- [x] Cormorant typography shipped.
- [x] Contact form wired to Resend, verified end-to-end.
- [x] Theme toggle works, defaults to teal.
- [x] Hero wordmark centred and clamped on mobile.
- [ ] Replace `/assets/og-image.png` placeholder (currently points at the SVG favicon). Generate a 1200 × 630 PNG so LinkedIn / Slack / iMessage previews render properly.
- [ ] Submit `weai.co.nz/sitemap.xml` to Google Search Console and Bing Webmaster Tools.
- [ ] Enable Vercel Analytics in the project dashboard (one toggle, no code change).

## 12. Brand voice

Direct, plainspoken, dry. NZ English. Italicise the one word in a sentence that carries the meaning. Speak to owner-operators, GMs, founders — never enterprise, never "C-suite". The italic Cormorant words in gold-cream are the brand's voice signature; use them sparingly so they don't lose their charge.
