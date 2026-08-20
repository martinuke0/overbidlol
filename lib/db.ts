import { Pool } from "pg";

// ponytail: one global pool, reused across hot-reloads in dev.
const g = globalThis as unknown as { _pool?: Pool };
export const pool =
  g._pool ??
  (g._pool = new Pool({ connectionString: process.env.DATABASE_URL }));

export type BoardRow = {
  rank: number;
  id: string;
  identity_kind: "url" | "handle";
  identity_key: string;
  url: string | null;
  handle: string | null;
  title: string;
  description: string;
  favicon_url: string | null;
  bid_cents: number;
  click_count: number;
  created_at: string;
  updated_at: string;
};

export async function getBoard(limit = 100): Promise<BoardRow[]> {
  const { rows } = await pool.query<BoardRow>(
    `select * from board order by rank asc limit $1`,
    [limit],
  );
  return rows;
}

export async function findListingByKey(
  key: string,
): Promise<{ id: string; bid_cents: number } | null> {
  const { rows } = await pool.query<{ id: string; bid_cents: number }>(
    `select id, bid_cents from listings where identity_key = $1`,
    [key],
  );
  return rows[0] ?? null;
}

export async function insertIntent(row: {
  listing_id: string | null;
  identity_kind: "url" | "handle";
  identity_key: string;
  url: string | null;
  handle: string | null;
  title: string;
  description: string;
  target_bid_cents: number;
  pay_cents: number;
}): Promise<{ id: string }> {
  const { rows } = await pool.query<{ id: string }>(
    `insert into checkout_intents
       (listing_id, identity_kind, identity_key, url, handle, title, description, target_bid_cents, pay_cents)
     values ($1,$2,$3,$4,$5,$6,$7,$8,$9)
     returning id`,
    [
      row.listing_id,
      row.identity_kind,
      row.identity_key,
      row.url,
      row.handle,
      row.title,
      row.description,
      row.target_bid_cents,
      row.pay_cents,
    ],
  );
  return rows[0];
}

export async function savePolarCheckoutId(
  intentId: string,
  polarCheckoutId: string,
): Promise<void> {
  await pool.query(
    `update checkout_intents set polar_checkout_id = $2 where id = $1`,
    [intentId, polarCheckoutId],
  );
}

/** Success-page poll: intent status + resulting rank (if paid). */
export async function getIntentByCheckoutId(checkoutId: string) {
  const { rows } = await pool.query(
    `select i.status, i.identity_key, i.target_bid_cents,
            (select rank from board b where b.identity_key = i.identity_key) as rank
     from checkout_intents i
     where i.polar_checkout_id = $1`,
    [checkoutId],
  );
  return rows[0] ?? null;
}

/** Click-out: bump count, return the tagged destination URL. */
export async function registerClick(id: string): Promise<string | null> {
  const { rows } = await pool.query<{ url: string | null }>(
    `update listings set click_count = click_count + 1 where id = $1 returning url`,
    [id],
  );
  if (!rows[0]) return null;
  await pool.query(`insert into clicks (listing_id) values ($1)`, [id]);
  return rows[0].url;
}

/**
 * The only write that matters. One transaction, idempotent on polar_order_id.
 * Mirrors snippets/apply-paid-order.sql: new row = pay_cents, upbid = +delta.
 */
export async function runApply(
  intentId: string,
  polarOrderId: string,
  paidCents: number,
): Promise<void> {
  // Money-true: apply what was ACTUALLY paid (Polar order net amount), not the
  // intended pay_cents — so editing the amount on Polar's page can't buy free rank.
  if (!Number.isInteger(paidCents) || paidCents <= 0) {
    throw new Error(`invalid paidCents ${paidCents}`);
  }
  const client = await pool.connect();
  try {
    await client.query("begin");

    const { rows: intents } = await client.query(
      `select * from checkout_intents where id = $1 for update`,
      [intentId],
    );
    const intent = intents[0];
    if (!intent) {
      await client.query("rollback");
      throw new Error(`unknown intent ${intentId}`);
    }
    // Already applied or not payable → no-op (absorbs webhook retries).
    if (intent.polar_order_id === polarOrderId || intent.status !== "pending") {
      await client.query("commit");
      return;
    }

    await client.query(
      `insert into listings
         (identity_kind, identity_key, url, handle, title, description, bid_cents)
       select identity_kind, identity_key, url, handle, title, description, $2::int
       from checkout_intents where id = $1
       on conflict (identity_key) do update set
         bid_cents   = listings.bid_cents + excluded.bid_cents,
         title       = case when excluded.title = '' then listings.title else excluded.title end,
         description = case when excluded.description = '' then listings.description else excluded.description end,
         url         = coalesce(excluded.url, listings.url),
         handle      = coalesce(excluded.handle, listings.handle),
         updated_at  = now()`,
      [intentId, paidCents],
    );

    await client.query(
      `insert into bid_events (listing_id, intent_id, polar_order_id, delta_cents, bid_after_cents)
       select l.id, i.id, $2, $3::int, l.bid_cents
       from checkout_intents i
       join listings l on l.identity_key = i.identity_key
       where i.id = $1
       on conflict (polar_order_id) do nothing`,
      [intentId, polarOrderId, paidCents],
    );

    await client.query(
      `update checkout_intents set
         status = 'paid',
         polar_order_id = $2,
         listing_id = (select id from listings where identity_key = checkout_intents.identity_key),
         paid_at = now()
       where id = $1 and status = 'pending'`,
      [intentId, polarOrderId],
    );

    await client.query("commit");
  } catch (e) {
    await client.query("rollback");
    throw e;
  } finally {
    client.release();
  }
}
