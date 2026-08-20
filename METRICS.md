# Metrics — Vemetric (like outbid.lol)

outbid.lol's "see stats→" pill links to a **public Vemetric dashboard**
(`app.vemetric.com/public/outbid.lol`). This wires the same for overbid.lol: real
visitor counts feeding the live pill's vibe, and a shareable public stats page.

Right now the live pill is **theater** (`components/LivePill.tsx`, client-side jitter).
Vemetric replaces the *credibility* of that number with real traffic and gives you the
public dashboard to link to.

## 1. Install (we're on Next 15.5 → `@vemetric/web`)

```bash
npm install @vemetric/web
```

Create `instrumentation-client.ts` in the project root (next to `app/`):

```ts
import { vemetric } from "@vemetric/web";

vemetric.init({ token: process.env.NEXT_PUBLIC_VEMETRIC_TOKEN! });
```

That's it — Next.js runs this on the client before anything else, and page views track
automatically. (On Next ≤15.2 you'd instead drop `<VemetricScript token=… />` into
`app/layout.tsx` from `@vemetric/react`.)

## 2. Token + env

1. Create a project at [vemetric.com](https://vemetric.com), copy the project **token**.
2. Add `NEXT_PUBLIC_VEMETRIC_TOKEN=…` to `.env.local` and to Vercel env vars.
3. **Note:** Vemetric ignores `localhost` by default — stats only appear once deployed.

## 3. Make the dashboard public + link the "see stats" pill

1. In Vemetric project settings, enable the **public dashboard** → you get a URL like
   `https://app.vemetric.com/public/overbid.lol`.
2. Point the pill at it. In `components/LivePill.tsx`, change the wrapper `href`:

   ```tsx
   // was: href="#board"
   href="https://app.vemetric.com/public/overbid.lol"
   ```
   (add `target="_blank" rel="noopener"` so it opens the dashboard in a new tab).

## 4. Optional — make the pill's number real

The pill count is currently random jitter. To show a true "visitors online", read it from
Vemetric's API (or a Vercel Analytics endpoint) in a small `/api/stats` route and fetch it
from `LivePill` on an interval, replacing the `Math.random()` seed. Skipped for now —
`// ponytail:` the fake number sells the same "it's live" feeling at zero cost until real
traffic makes the true number worth showing.

## 5. What to watch after launch

Mirror the original's early signals (see `docs/06-metrics.md` for outbid.lol's actual
numbers):

| Metric | Where | Why it matters |
|---|---|---|
| Visitors (24h) | Vemetric | Is the tweet/loop still driving traffic? |
| Top bid ($) | `select max(bid_cents) from listings` | Depth of competition = revenue |
| # of listings | `select count(*) from listings` | Board fullness = screenshot value |
| Clicks per listing | `click_count` column | Are top spots actually getting traffic (the pitch)? |
| Paid vs pending intents | `checkout_intents.status` | Checkout → payment conversion |
