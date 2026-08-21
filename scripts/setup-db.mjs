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
  drop table if exists bid_events, clicks, activity, checkout_intents, listings cascade;
`);
await client.query(schema);

await client.query(
  `insert into listings (identity_kind, identity_key, url, handle, title, description, bid_cents)
   values
     ('handle', '@jonathan_wilke', 'https://x.com/jonathan_wilke?utm_source=overbid', '@jonathan_wilke', '', 'Very successful — he launched outbid.lol.', 1000),
     ('handle', '@realdonaldtrump', 'https://x.com/realDonaldTrump?utm_source=overbid', '@realDonaldTrump', '', 'He is the president.', 975),
     ('handle', '@sama', 'https://x.com/sama?utm_source=overbid', '@sama', '', 'He is evil.', 950),
     ('handle', '@elonmusk', 'https://x.com/elonmusk?utm_source=overbid', '@elonmusk', '', 'He launches rockets.', 925),
     ('url', 'https://grok.bot', 'https://grok.bot/?utm_source=overbid', null, 'grok.bot',
      'AI agents that run your site.', 125),
     ('url', 'https://outbid.lol', 'https://outbid.lol/?utm_source=overbid', null, 'outbid.lol',
      'No ads, no API keys, no revenue sharing. Just outbid your competition to get to the top.', 100)
   on conflict (identity_key) do nothing`,
);

// grok.bot leads the sites: same $1, but placed earliest so the tie-break ranks it first.
await client.query(
  `update listings
     set updated_at = (select updated_at from listings where identity_key = 'https://outbid.lol') - interval '1 second'
   where identity_key = 'https://grok.bot'`,
);

// Seed a little launch history for the live feed.
await client.query(
  `insert into activity (kind, label, amount_cents, note, created_at) values
     ('downbid', '@elonmusk',        25,  '$9.50 → $9.25',  now() - interval '1 minute'),
     ('overbid', '@jonathan_wilke',  1000,'took #1',        now() - interval '11 minutes'),
     ('downbid', '@sama',            50,  '$10.00 → $9.50', now() - interval '26 minutes'),
     ('overbid', '@realDonaldTrump', 975, 'joined the board', now() - interval '44 minutes')`,
);

const { rows } = await client.query(`select rank, title, bid_cents from board order by rank`);
console.log("Board seeded:");
for (const r of rows) console.log(`  #${r.rank}  ${r.title}  $${r.bid_cents / 100}`);

await client.end();
