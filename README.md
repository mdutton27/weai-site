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
| `api/contact.js` | Vercel serverless function — handles the contact-form POST and sends mail via Resend. |
| `vercel.json` | Deploy config — security headers, cache rules, clean URLs. |
| `robots.txt` / `sitemap.xml` | SEO basics. |
| `.env.example` | Template for local env vars (Resend API key, etc.). |

## Run locally

For the static site only (no contact form):

```bash
npx serve .            # or: python3 -m http.server 3000
```

For the full site **including** the `/api/contact` function, you need Vercel's CLI:

```bash
npm i -g vercel
cp .env.example .env.local
# Fill RESEND_API_KEY in .env.local
vercel dev
```

Open the URL Vercel prints (usually `http://localhost:3000`).

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
- [ ] Configure the contact form (see [Contact form setup](#contact-form-setup) below).
- [ ] Set DNS for `weai.co.nz` to Vercel.

## Contact form setup

The form POSTs to `/api/contact` (a Vercel serverless function in [`api/contact.js`](api/contact.js)). The function re-validates server-side, runs the bot guards (honeypot + time-trap), and sends a notification email via [Resend](https://resend.com).

### One-time setup

1. **Sign up at https://resend.com** (free tier is enough — 100 emails/day, 3 000/month).
2. **Verify your sending domain.** In the Resend dashboard go to **Domains → Add Domain**, enter `weai.co.nz`, and add the DNS records Resend shows you (an SPF `TXT`, three DKIM `CNAME`s, and an optional `DMARC TXT`). Same registrar where Vercel's DNS lives. Verification usually takes <10 minutes.
3. **Generate an API key.** Resend dashboard → **API Keys → Create**. Copy the key (it's shown once).
4. **Add the key to Vercel.** In your Vercel project: **Settings → Environment Variables → Add**:
   - Name: `RESEND_API_KEY`
   - Value: the key from step 3
   - Environments: Production, Preview, Development (tick all three)
5. **Redeploy** (any push, or hit "Redeploy" in the Vercel dashboard) — env vars only apply to deployments after they're added.

### Optional env vars

| Variable | Default | What it does |
|---|---|---|
| `CONTACT_TO` | `hello@weai.co.nz` | Where the notification email is sent. |
| `CONTACT_FROM` | `WE AI <noreply@weai.co.nz>` | The visible "from" address. **Must be on the verified Resend domain** — otherwise Resend will reject the send. |

### Testing it works

1. Submit the form on production.
2. Watch the Vercel project's **Logs** tab — `/api/contact` should return `200`.
3. Check the inbox for `CONTACT_TO`.
4. If something fails, the function logs the Resend error to Vercel logs.

### How the bot guards work

- **Honeypot fields** — two hidden inputs (`website_url_confirm`, `company_website`) that real users never see. If a bot fills them, the function returns `200 ok` without sending so the bot thinks it succeeded.
- **Time-trap** — the form stamps `loaded_at` on render. Submissions that arrive in <3 seconds are treated as bots and silently dropped.
- **Server-side re-validation** — same checks the client runs, repeated server-side so a determined attacker can't bypass them.

## Theme

The site loads with the **teal** theme by default (deep teal background, gold accents).

A small sun/moon button in the nav lets a visitor flip to **dark** (noir background). The choice persists to `localStorage` under `weai-theme`. Clearing storage returns to the teal default. The pre-paint script runs synchronously in `<head>` so there's no theme flash on load.

The CSS still includes a third `light` theme (white/teal-ink). It isn't reachable from the toggle, but you can opt a visitor in manually with `localStorage.setItem('weai-theme', 'light')` or wire a third toggle state later.

## Brand notes

See `../design_handoff_weai_site/CLAUDE.md` for type/colour rules. The two non-obvious ones:

- Fraunces ligatures must stay disabled globally — the `f` melts into `i` / `l` at large sizes otherwise.
- Italic display text uses **Cormorant Garamond**, not Fraunces italic. Don't merge them.
