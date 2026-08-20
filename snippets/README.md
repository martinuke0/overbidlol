# Snippets

Copy into a Next.js app. They are not a runnable package.

| File | Use |
|---|---|
| [identity.ts](identity.ts) | Canonical URL / @handle. Block chat-invite hosts. Strip tracking params. Keep App Store / GitHub paths. |
| [polar-checkout.ts](polar-checkout.ts) | `POST /api/checkout` — intent row + ad-hoc fixed Polar price. |
| [polar-webhook.ts](polar-webhook.ts) | `POST /api/webhook/polar` — `order.paid` only. |
| [apply-paid-order.sql](apply-paid-order.sql) | Transaction the webhook runs. |

Install:

```bash
pnpm add @polar-sh/sdk @polar-sh/nextjs zod
```

Local webhooks:

```bash
curl -fsSL https://polar.sh/install.sh | bash
polar listen http://localhost:3000/
```

Then set Polar dashboard webhook to the forwarded URL, event `order.paid`.
