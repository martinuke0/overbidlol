import { Polar } from "@polar-sh/sdk";
import { parseIdentity } from "./identity";
import { computePayCents } from "./bid";
import { enrich } from "./og";
import { findListingByKey, insertIntent, savePolarCheckoutId } from "./db";

// Lazy so the board renders even without Polar env set. Only /api/checkout needs it.
let _polar: Polar | null = null;
function polar(): Polar {
  if (!_polar) {
    const accessToken = process.env.POLAR_ACCESS_TOKEN;
    if (!accessToken) throw new Error("POLAR_ACCESS_TOKEN not set — cannot start checkout");
    _polar = new Polar({
      accessToken,
      server: process.env.POLAR_SERVER === "production" ? "production" : "sandbox",
    });
  }
  return _polar;
}

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
  appUrl?: string;
}): Promise<{ url: string }> {
  // Prefer explicit config; fall back to the request origin so a missing env var
  // can't produce "undefined/success?..." (which Polar rejects).
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || opts.appUrl;
  if (!appUrl) throw new Error("App URL not configured (set NEXT_PUBLIC_APP_URL)");
  const dollars = opts.body.amount_dollars;
  if (!Number.isInteger(dollars) || dollars < 1) {
    throw new Error("Amount must be a whole dollar >= 1");
  }

  const identity = parseIdentity({
    url: opts.body.url,
    handle: opts.body.handle,
    utmSource: process.env.NEXT_PUBLIC_UTM_SOURCE ?? "overbid",
  });

  const existing = await findListingByKey(identity.key);
  const target_bid_cents = dollars * 100;
  const pay_cents = computePayCents(target_bid_cents, existing?.bid_cents ?? null);

  const { title, description } = await enrich(
    identity.kind,
    identity.url,
    (opts.body.title ?? "").slice(0, 120),
    (opts.body.description ?? "").slice(0, 280),
  );

  const intent = await insertIntent({
    listing_id: existing?.id ?? null,
    identity_kind: identity.kind,
    identity_key: identity.key,
    url: identity.url,
    handle: identity.handle,
    title,
    description,
    target_bid_cents,
    pay_cents,
  });

  const productId = process.env.POLAR_PRODUCT_ID!;
  const checkout = await polar().checkouts.create({
    products: [productId],
    // Ad-hoc amount in cents. REQUIRES the Polar product to use a custom ("pay what you want")
    // price — with a fixed catalog price this is ignored and Polar bills the catalog amount.
    amount: pay_cents,
    metadata: { intent_id: intent.id },
    successUrl: `${appUrl}/success?checkout_id={CHECKOUT_ID}`,
    allowDiscountCodes: false,
    customerIpAddress: opts.clientIp,
  });

  await savePolarCheckoutId(intent.id, checkout.id);
  return { url: checkout.url };
}

type OrderLike = {
  id: string;
  checkoutId?: string | null;
  metadata?: Record<string, string | number | boolean> | null;
};

/** Find our intent_id from a paid Polar order (metadata, or fall back to the checkout). */
export async function resolveIntentId(order: OrderLike): Promise<string> {
  const fromMeta = order.metadata?.intent_id;
  if (typeof fromMeta === "string" && fromMeta.length > 0) return fromMeta;
  if (!order.checkoutId) throw new Error("order missing checkoutId and metadata.intent_id");
  const checkout = await polar().checkouts.get({ id: order.checkoutId });
  const id = checkout.metadata?.intent_id;
  if (typeof id !== "string" || !id) throw new Error("checkout missing metadata.intent_id");
  return id;
}
