import { Pool } from "pg";

// ponytail: one global pool, reused across hot-reloads in dev.
// Accept whichever name the host set — Vercel/Neon may expose POSTGRES_URL, not DATABASE_URL.
const connectionString =
  process.env.DATABASE_URL ||
  process.env.POSTGRES_URL ||
  process.env.DATABASE_URL_UNPOOLED ||
  process.env.POSTGRES_URL_NON_POOLING;
const g = globalThis as unknown as { _pool?: Pool };
export const pool = g._pool ?? (g._pool = new Pool({ connectionString }));

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
  action?: "overbid" | "downbid";
  lower_cents?: number | null;
}): Promise<{ id: string }> {
  const { rows } = await pool.query<{ id: string }>(
    `insert into checkout_intents
       (listing_id, identity_kind, identity_key, url, handle, title, description, target_bid_cents, pay_cents, action, lower_cents)
     values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
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
      row.action ?? "overbid",
      row.lower_cents ?? null,
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

/** Record a heartbeat for a visitor (dedup happens in the count via distinct). */
export async function recordVisit(visitor: string): Promise<void> {
  await pool.query(`insert into visits (visitor) values ($1)`, [visitor.slice(0, 64)]);
}

/** Real live stats: distinct visitors in the last 5 min (online) and 24h. */
export async function getStats(): Promise<{ online: number; day: number }> {
  // ponytail: prune >24h rows here so the table stays bounded (polled every ~15s).
  await pool.query(`delete from visits where created_at < now() - interval '24 hours'`);
  const { rows } = await pool.query<{ online: string; day: string }>(
    `select
       count(distinct visitor) filter (where created_at > now() - interval '5 minutes') as online,
       count(distinct visitor) as day
     from visits`,
  );
  return { online: Number(rows[0]?.online ?? 0), day: Number(rows[0]?.day ?? 0) };
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

export type ActivityRow = {
  id: string;
  kind: "overbid" | "downbid";
  label: string;
  amount_cents: number;
  note: string;
  created_at: string;
};

/** Recent live-feed events, newest first. */
export async function getActivity(limit = 25): Promise<ActivityRow[]> {
  const { rows } = await pool.query<ActivityRow>(
    `select id, kind, label, amount_cents, note, created_at
     from activity order by created_at desc limit $1`,
    [limit],
  );
  return rows;
}

const money = (c: number) => (c % 100 === 0 ? `$${c / 100}` : `$${(c / 100).toFixed(2)}`);
function labelFor(r: {
  identity_kind: string;
  handle: string | null;
  url: string | null;
  identity_key: string;
}): string {
  if (r.identity_kind === "handle") return r.handle || r.identity_key;
  try {
    return new URL(r.url || r.identity_key).host.replace(/^www\./, "");
  } catch {
    return r.identity_key;
  }
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

    if (intent.action === "downbid") {
      // Subtract the reduction from the target. If it hits $0 or below, delist them.
      const key = intent.identity_key;
      const lower = intent.lower_cents ?? 0;
      const { rows: tgt } = await client.query<{ id: string; bid_cents: number }>(
        `select id, bid_cents from listings where identity_key = $1 for update`,
        [key],
      );
      if (tgt[0]) {
        const before = tgt[0].bid_cents;
        const next = before - lower;
        let note: string;
        if (next <= 0) {
          // schema forbids bid_cents <= 0 → remove the listing (children first).
          await client.query(`delete from bid_events where listing_id = $1`, [tgt[0].id]);
          await client.query(`delete from clicks where listing_id = $1`, [tgt[0].id]);
          await client.query(`update checkout_intents set listing_id = null where listing_id = $1`, [tgt[0].id]);
          await client.query(`delete from listings where id = $1`, [tgt[0].id]);
          note = "knocked off the board";
        } else {
          await client.query(
            `update listings set bid_cents = $2, updated_at = now() where id = $1`,
            [tgt[0].id, next],
          );
          note = `${money(before)} → ${money(next)}`;
        }
        await client.query(
          `insert into activity (kind, label, amount_cents, note) values ('downbid', $1, $2, $3)`,
          [labelFor(intent), lower, note],
        );
      }
      // Idempotency for downbids rides on the intent status guard below.
      await client.query(
        `update checkout_intents set status = 'paid', polar_order_id = $2, paid_at = now()
         where id = $1 and status = 'pending'`,
        [intentId, polarOrderId],
      );
      await client.query("commit");
      return;
    }

    const { rows: upserted } = await client.query<{ bid_cents: number }>(
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
         updated_at  = now()
       returning bid_cents`,
      [intentId, paidCents],
    );

    await client.query(
      `insert into activity (kind, label, amount_cents, note) values ('overbid', $1, $2, $3)`,
      [labelFor(intent), paidCents, `now ${money(upserted[0]?.bid_cents ?? paidCents)}`],
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
