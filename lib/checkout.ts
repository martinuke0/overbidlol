import { Polar } from "@polar-sh/sdk";
import { parseIdentity } from "./identity";
import { computePayCents, downbidPayCents, MIN_CENTS, STEP_CENTS } from "./bid";
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
  amount_cents: number;
  title?: string;
  description?: string;
};

// Redirect base must be TRUSTED config — never the request Origin (spoofable → open redirect).
function resolveAppUrl(): string {
  const appUrl =
    process.env.NEXT_PUBLIC_APP_URL ||
    (process.env.VERCEL_PROJECT_PRODUCTION_URL
      ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
      : undefined);
  if (!appUrl) throw new Error("App URL not configured (set NEXT_PUBLIC_APP_URL)");
  return appUrl;
}

export async function createCheckout(opts: {
  body: CheckoutBody;
  clientIp: string | undefined;
}): Promise<{ url: string }> {
  const appUrl = resolveAppUrl();

  // Amount arrives in cents; snap to the $0.25 step and enforce the $1 minimum.
  const raw = opts.body.amount_cents;
  if (!Number.isFinite(raw)) throw new Error("Amount is required");
  const target_bid_cents = Math.max(MIN_CENTS, Math.round(raw / STEP_CENTS) * STEP_CENTS);

  const identity = parseIdentity({
    url: opts.body.url,
    handle: opts.body.handle,
    utmSource: process.env.NEXT_PUBLIC_UTM_SOURCE ?? "overbid",
  });

  const existing = await findListingByKey(identity.key);
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

/** Pay to LOWER a target's bid by `lower_cents`, at a 25% hater tax. */
export async function createDownbid(opts: {
  body: { url?: string; handle?: string; lower_cents: number };
  clientIp: string | undefined;
}): Promise<{ url: string }> {
  const appUrl = resolveAppUrl();

  const identity = parseIdentity({
    url: opts.body.url,
    handle: opts.body.handle,
    utmSource: process.env.NEXT_PUBLIC_UTM_SOURCE ?? "overbid",
  });

  const target = await findListingByKey(identity.key);
  if (!target) throw new Error("That URL or @handle isn't on the board");

  const lower_cents = Math.max(
    MIN_CENTS,
    Math.round((opts.body.lower_cents || 0) / STEP_CENTS) * STEP_CENTS,
  );
  const pay_cents = downbidPayCents(lower_cents);

  const intent = await insertIntent({
    listing_id: target.id,
    identity_kind: identity.kind,
    identity_key: identity.key,
    url: identity.url,
    handle: identity.handle,
    title: "",
    description: "",
    target_bid_cents: lower_cents, // satisfies the >=100 column; semantically the reduction
    pay_cents,
    action: "downbid",
    lower_cents,
  });

  const productId = process.env.POLAR_PRODUCT_ID!;
  const checkout = await polar().checkouts.create({
    products: [productId],
    amount: pay_cents,
    metadata: { intent_id: intent.id },
    successUrl: `${appUrl}/success?checkout_id={CHECKOUT_ID}`,
    allowDiscountCodes: false,
    customerIpAddress: opts.clientIp,
  });

  await savePolarCheckoutId(intent.id, checkout.id);
  return { url: checkout.url };
}

export const MAX_BIO = 100;

/** Pay to rewrite a listing's description: 1¢/char, $0.50 min (processor floor), $1 max. */
export async function createEditDescription(opts: {
  body: { url?: string; handle?: string; description: string };
  clientIp: string | undefined;
}): Promise<{ url: string }> {
  const appUrl = resolveAppUrl();

  const identity = parseIdentity({
    url: opts.body.url,
    handle: opts.body.handle,
    utmSource: process.env.NEXT_PUBLIC_UTM_SOURCE ?? "overbid",
  });

  const target = await findListingByKey(identity.key);
  if (!target) throw new Error("That listing isn't on the board");

  const description = (opts.body.description ?? "").trim().slice(0, MAX_BIO);
  if (!description) throw new Error("Write something first");
  const pay_cents = Math.min(MAX_BIO, Math.max(50, description.length)); // 1¢/char, 50¢ floor, $1 cap

  const intent = await insertIntent({
    listing_id: target.id,
    identity_kind: identity.kind,
    identity_key: identity.key,
    url: identity.url,
    handle: identity.handle,
    title: "",
    description,
    target_bid_cents: MIN_CENTS, // satisfies the >=100 column; unused for edits
    pay_cents,
    action: "edit",
    lower_cents: null,
  });

  const productId = process.env.POLAR_PRODUCT_ID!;
  const checkout = await polar().checkouts.create({
    products: [productId],
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
