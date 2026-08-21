// Reset + create schema, then seed the launch state: overbid.lol at $1 = #1.
// Usage: npm run db:setup   (reads DATABASE_URL from .env.local via node --env-file)
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import pg from "pg";
import { importHaters } from "./admin/haters.mjs";

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
     ('handle', '@lewiscarhart', 'https://x.com/lewiscarhart?utm_source=overbid', '@lewiscarhart', '', 'lamborghini.lol ? LOL', 1025),
     ('handle', '@jonathan_wilke', 'https://x.com/jonathan_wilke?utm_source=overbid', '@jonathan_wilke', '', 'Very successful — he launched outbid.lol.', 1000),
     ('handle', '@realdonaldtrump', 'https://x.com/realDonaldTrump?utm_source=overbid', '@realDonaldTrump', '', 'He is the president.', 975),
     ('handle', '@sama', 'https://x.com/sama?utm_source=overbid', '@sama', '', 'He is evil.', 950),
     ('handle', '@elonmusk', 'https://x.com/elonmusk?utm_source=overbid', '@elonmusk', '', 'He launches rockets.', 925),
     ('handle', '@tibo_maker', 'https://x.com/tibo_maker?utm_source=overbid', '@tibo_maker', '', 'He spent 12k for nothing.', 900),
     ('handle', '@eugzolotarenko', 'https://x.com/eugZolotarenko?utm_source=overbid', '@eugZolotarenko', '', 'he let @tibo_maker spend 12k', 850),
     ('url', 'https://grok.bot', 'https://grok.bot/?utm_source=overbid', null, 'grok.bot',
      'AI agents that run your site.', 125),
     ('url', 'https://outbid.lol', 'https://outbid.lol/?utm_source=overbid', null, 'outbid.lol',
      'No ads, no API keys, no revenue sharing. Just outbid your competition to get to the top.', 100)
   on conflict (identity_key) do nothing`,
);

// The owner, at the bottom of his own hate list — with his X avatar.
await client.query(
  `insert into listings (identity_kind, identity_key, url, handle, title, description, favicon_url, bid_cents)
   values ('handle', '@martinuke0', 'https://x.com/martinuke0?utm_source=overbid', '@martinuke0', '',
           'He built this whole thing.', '/avatars/martinuke0.png', 800)
   on conflict (identity_key) do nothing`,
);

// grok.bot leads the sites: same $1, but placed earliest so the tie-break ranks it first.
await client.query(
  `update listings
     set updated_at = (select updated_at from listings where identity_key = 'https://outbid.lol') - interval '1 second'
   where identity_key = 'https://grok.bot'`,
);

// Launch state: every hater starts at $1; @martinuke0 sits last (newest timestamp).
const haterOrder = [
  "@lewiscarhart",
  "@jonathan_wilke",
  "@realdonaldtrump",
  "@sama",
  "@elonmusk",
  "@tibo_maker",
  "@eugzolotarenko",
  "@martinuke0",
];
for (let i = 0; i < haterOrder.length; i++) {
  await client.query(
    `update listings set bid_cents = 100, updated_at = now() - ($2 * interval '5 seconds') where identity_key = $1`,
    [haterOrder[i], haterOrder.length - i],
  );
}

// Auto-fill X avatars for any handle without a custom one (keeps @martinuke0's uploaded pic).
await client.query(
  `update listings
     set favicon_url = 'https://unavatar.io/x/' || ltrim(handle, '@') || '?fallback=false'
   where identity_kind = 'handle' and favicon_url is null`,
);

// The full hater roster (@haters.md) at $1 with avatars + per-account share tweets.
await importHaters(client);


const { rows } = await client.query(`select rank, title, bid_cents from board order by rank`);
console.log("Board seeded:");
for (const r of rows) console.log(`  #${r.rank}  ${r.title}  $${r.bid_cents / 100}`);

await client.end();
