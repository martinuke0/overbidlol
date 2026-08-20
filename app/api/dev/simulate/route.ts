import { NextResponse } from "next/server";
import { parseIdentity } from "@/lib/identity";
import { computePayCents } from "@/lib/bid";
import { enrich } from "@/lib/og";
import { findListingByKey, insertIntent, runApply } from "@/lib/db";

/**
 * DEV ONLY. Simulates a paid Polar order end-to-end (intent → apply) so you can
 * watch the board update without wiring Polar. Disabled when NODE_ENV=production.
 * ponytail: this is the test harness, not a product feature. Delete before deploy.
 */
export async function POST(req: Request) {
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "disabled in production" }, { status: 403 });
  }
  try {
    const body = await req.json();
    const dollars = Number(body.amount_dollars);
    if (!Number.isInteger(dollars) || dollars < 1) throw new Error("amount_dollars must be a whole number >= 1");

    const identity = parseIdentity({
      url: body.url,
      handle: body.handle,
      utmSource: process.env.NEXT_PUBLIC_UTM_SOURCE ?? "overbid",
    });
    const existing = await findListingByKey(identity.key);
    const target_bid_cents = dollars * 100;
    const pay_cents = computePayCents(target_bid_cents, existing?.bid_cents ?? null);

    const { title, description } = await enrich(
      identity.kind,
      identity.url,
      (body.title ?? "").slice(0, 120),
      (body.description ?? "").slice(0, 280),
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

    // fake order id — unique per intent so the idempotency guard behaves like Polar
    await runApply(intent.id, `dev-${intent.id}`);
    return NextResponse.json({ ok: true, identity_key: identity.key, target_bid_cents, pay_cents });
  } catch (e) {
    const message = e instanceof Error ? e.message : "simulate failed";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
