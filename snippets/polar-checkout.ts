/**
 * POST /api/checkout
 *
 * Collect listing fields on YOUR form. Polar page is payment only.
 * Do not use @polar-sh/nextjs Checkout() GET helper — no ad-hoc prices.
 *
 * Bid math: user types a TARGET total in dollars.
 *   new listing  → pay_cents = target
 *   same identity → pay_cents = target - current bid
 */
import { Polar } from "@polar-sh/sdk";
import { parseIdentity } from "./identity";

const MIN_CENTS = 100;

const polar = new Polar({
  accessToken: process.env.POLAR_ACCESS_TOKEN!,
  server: process.env.POLAR_SERVER === "sandbox" ? "sandbox" : "production",
});

export type CheckoutBody = {
  url?: string;
  handle?: string;
  amount_dollars: number;
  title?: string;
  description?: string;
};

export async function createCheckout(opts: {
  body: CheckoutBody;
  clientIp: string | undefined;
  findListingByKey: (key: string) => Promise<{ id: string; bid_cents: number } | null>;
  insertIntent: (row: {
    listing_id: string | null;
    identity_kind: "url" | "handle";
    identity_key: string;
    url: string | null;
    handle: string | null;
    title: string;
    description: string;
    target_bid_cents: number;
    pay_cents: number;
  }) => Promise<{ id: string }>;
  savePolarCheckoutId: (intentId: string, polarCheckoutId: string) => Promise<void>;
}): Promise<{ url: string }> {
  const dollars = opts.body.amount_dollars;
  if (!Number.isInteger(dollars) || dollars < 1) {
    throw new Error("Amount must be a whole dollar >= 1");
  }

  const identity = parseIdentity({
    url: opts.body.url,
    handle: opts.body.handle,
    utmSource: process.env.NEXT_PUBLIC_UTM_SOURCE ?? "copycat",
  });

  const target_bid_cents = dollars * 100;
  const existing = await opts.findListingByKey(identity.key);

  let pay_cents: number;
  if (existing) {
    if (target_bid_cents <= existing.bid_cents) {
      throw new Error(
        `Must beat your current $${(existing.bid_cents / 100).toFixed(0)}`,
      );
    }
    pay_cents = target_bid_cents - existing.bid_cents;
  } else {
    if (target_bid_cents < MIN_CENTS) throw new Error("Minimum bid is $1");
    pay_cents = target_bid_cents;
  }

  if (pay_cents < MIN_CENTS) throw new Error("Nothing to pay");

  const intent = await opts.insertIntent({
    listing_id: existing?.id ?? null,
    identity_kind: identity.kind,
    identity_key: identity.key,
    url: identity.url,
    handle: identity.handle,
    title: (opts.body.title ?? "").slice(0, 120),
    description: (opts.body.description ?? "").slice(0, 280),
    target_bid_cents,
    pay_cents,
  });

  const productId = process.env.POLAR_PRODUCT_ID!;
  const checkout = await polar.checkouts.create({
    products: [productId],
    prices: {
      [productId]: [
        {
          amountType: "fixed",
          priceAmount: pay_cents,
          priceCurrency: "usd",
        },
      ],
    },
    metadata: {
      intent_id: intent.id,
    },
    successUrl: `${process.env.NEXT_PUBLIC_APP_URL}/success?checkout_id={CHECKOUT_ID}`,
    returnUrl: process.env.NEXT_PUBLIC_APP_URL,
    allowDiscountCodes: false,
    customerIpAddress: opts.clientIp,
  });

  await opts.savePolarCheckoutId(intent.id, checkout.id);
  return { url: checkout.url };
}
