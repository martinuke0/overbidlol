// Add (or upsert) a listing. Works for URLs and @handles.
// Usage: add.mjs <url|@handle> <dollars> [description...]
//   node --env-file=.env.local scripts/admin/add.mjs @naval 12.50 "Angel investor."
//   node --env-file=.env.local scripts/admin/add.mjs stripe.com 5 "Payments."
import { withClient, normalize, toCents, showBoard } from "./_lib.mjs";

const [target, dollars, ...rest] = process.argv.slice(2);
if (!target || !dollars) {
  console.error('Usage: add <url|@handle> <dollars> [description...]');
  process.exit(1);
}
const id = normalize(target);
const bid = toCents(dollars);
const description = rest.join(" ");

await withClient(async (c) => {
  await c.query(
    `insert into listings (identity_kind, identity_key, url, handle, title, description, bid_cents)
     values ($1,$2,$3,$4,$5,$6,$7)
     on conflict (identity_key) do update set
       bid_cents = excluded.bid_cents,
       description = excluded.description,
       url = excluded.url,
       handle = excluded.handle,
       updated_at = now()`,
    [id.kind, id.key, id.url, id.handle, id.title, description, bid],
  );
  console.log(`✓ ${id.key} → $${(bid / 100).toFixed(2)}${description ? ` · "${description}"` : ""}`);
  await showBoard(c);
});
