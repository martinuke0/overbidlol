# Deploy to Vercel

## Secret audit (done 2026-08-20)

Repo was scanned before any push:

- ✅ Real secrets (`POLAR_ACCESS_TOKEN`, `POLAR_WEBHOOK_SECRET`, `POLAR_PRODUCT_ID`, `DATABASE_URL`)
  live **only** in `.env.local`, which is gitignored.
- ✅ `env.example` and `POLAR-SETUP.md` contain **placeholders only** (`polar_oat_…`, `user:pass@…`).
- ✅ Not a git repo yet — nothing has ever been committed, so nothing has leaked.

**Rule going forward:** never commit `.env.local`. Set every value below in the Vercel
dashboard (Project → Settings → Environment Variables) instead.

## 1. Push to GitHub

```bash
git init
git add -A
git commit -m "overbid.lol clone"
gh repo create overbid-lol --private --source=. --push   # or push to an existing remote
```

`.gitignore` already excludes `node_modules`, `.next`, `.env.local`, scratch files.

## 2. Environment variables to set in Vercel

| Variable | Secret? | Value |
|---|---|---|
| `DATABASE_URL` | 🔒 yes | Postgres connection string (see step 3) |
| `POLAR_ACCESS_TOKEN` | 🔒 yes | `polar_oat_…` (scopes: checkouts:write, checkouts:read, orders:read) |
| `POLAR_WEBHOOK_SECRET` | 🔒 yes | `whsec_…` |
| `POLAR_PRODUCT_ID` | no | the one-time product id |
| `POLAR_SERVER` | no | `sandbox` now, `production` when live |
| `NEXT_PUBLIC_APP_URL` | no | your Vercel URL, e.g. `https://overbid.lol` (no trailing slash) |
| `NEXT_PUBLIC_UTM_SOURCE` | no | `overbid` |
| `NEXT_PUBLIC_VEMETRIC_TOKEN` | no | analytics token — see [METRICS.md](METRICS.md) |

## 3. Postgres

Vercel → Storage → create a **Postgres** (Neon) DB, which sets `DATABASE_URL` automatically.
Then load the schema + seed once (from your machine, pointed at the prod URL):

```bash
DATABASE_URL="<prod url>" node scripts/setup-db.mjs
```

## 4. Point Polar at the real domain

- Webhook endpoint → `https://<your-domain>/api/webhook/polar` (Format **Raw**, event **`order.paid`**).
- Set `NEXT_PUBLIC_APP_URL` to the same domain so Polar's success/return URLs resolve.
- Going live for real money: swap to a **production** Polar org, `POLAR_SERVER=production`,
  new token + secret + product, then re-point the webhook.

## 5. Notes

- `app/api/dev/simulate` is already disabled when `NODE_ENV=production` — safe to leave, or delete it.
- ngrok is only for local webhook testing; drop it once deployed.
