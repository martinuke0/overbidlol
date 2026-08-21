// Reset + create schema, then seed the launch state: overbid.lol at $1 = #1.
// Usage: npm run db:setup   (reads DATABASE_URL from .env.local via node --env-file)
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import pg from "pg";

const here = dirname(fileURLToPath(import.meta.url));
const schema = await readFile(join(here, "..", "schema.sql"), "utf8");

const client = new pg.Client({ connectionString: process.env.DATABASE_URL });
await client.connect();

await client.query(`
  drop view if exists board cascade;
  drop table if exists bid_events, clicks, visits, checkout_intents, listings cascade;
`);
await client.query(schema);

await client.query(
  `insert into listings (identity_kind, identity_key, url, handle, title, description, bid_cents)
   values
     ('handle', '@jonathan_wilke', 'https://x.com/jonathan_wilke?utm_source=overbid', '@jonathan_wilke', '', '', 1000),
     ('handle', '@realdonaldtrump', 'https://x.com/realDonaldTrump?utm_source=overbid', '@realDonaldTrump', '', '', 975),
     ('handle', '@sama', 'https://x.com/sama?utm_source=overbid', '@sama', '', '', 950),
     ('handle', '@elonmusk', 'https://x.com/elonmusk?utm_source=overbid', '@elonmusk', '', '', 200),
     ('url', 'https://outbid.lol', 'https://outbid.lol/?utm_source=overbid', null, 'outbid.lol',
      'No ads, no API keys, no revenue sharing. Just outbid your competition to get to the top.', 100)
   on conflict (identity_key) do nothing`,
);

const { rows } = await client.query(`select rank, title, bid_cents from board order by rank`);
console.log("Board seeded:");
for (const r of rows) console.log(`  #${r.rank}  ${r.title}  $${r.bid_cents / 100}`);

await client.end();
