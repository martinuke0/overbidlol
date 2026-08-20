# Polar sandbox setup (take real test money locally)

The board renders **without Polar** (browse-only). Configure Polar when you want the
**Overbid** button to open a real checkout. Use a **sandbox** org for free test payments;
switch to a production org only for real money.

## 1. Expose localhost so Polar can reach your webhook

In its own terminal, leave this running:

```bash
ngrok http 3000
```

Copy the `https://…ngrok-free.app` URL it prints. That's `<PUBLIC>` below.

## 2. Polar sandbox dashboard (https://sandbox.polar.sh)

1. Create a sandbox organization.
2. **Products → New** → one-time product named `Board listing`. Any price (e.g. $1) —
   we override the amount on every checkout, so the catalog price never shows.
   Copy its **Product ID** → `POLAR_PRODUCT_ID`.
3. **Settings → Access Tokens** → new **Organization Access Token** with
   `checkouts:write` + `orders:read` scopes. Copy it → `POLAR_ACCESS_TOKEN`.
4. **Settings → Webhooks → Add endpoint**:
   - URL: `<PUBLIC>/api/webhook/polar`
   - Format: **Raw**
   - Events: check **`order.paid`**
   - Save, then copy the **signing secret** → `POLAR_WEBHOOK_SECRET`.
5. On the product, turn **discount codes off** (we also pass `allowDiscountCodes: false`).

## 3. Fill `.env.local`

```
POLAR_ACCESS_TOKEN=polar_oat_…
POLAR_WEBHOOK_SECRET=whsec_…
POLAR_PRODUCT_ID=…
POLAR_SERVER=sandbox
NEXT_PUBLIC_APP_URL=https://<PUBLIC>   # use the ngrok URL so successUrl/returnUrl resolve
```

Restart `npm run dev` after editing env.

## 4. Test the real flow

1. Open the ngrok URL (not localhost, so the webhook origin matches).
2. Enter a URL + amount → **overbid** → Polar checkout opens.
3. Pay with a Polar **sandbox test card** (`4242 4242 4242 4242`, any future expiry/CVC).
4. `order.paid` hits `/api/webhook/polar` → the board updates. The `/success` page
   polls until it flips to paid.

## Going to production

- Swap to a production Polar org, set `POLAR_SERVER=production`, new token/secret/product.
- Point the webhook at your real deployed domain, set `NEXT_PUBLIC_APP_URL` to it.
- Delete `app/api/dev/simulate/route.ts` (it's already disabled when `NODE_ENV=production`).
