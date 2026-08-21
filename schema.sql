-- Copycat leaderboard — Postgres
-- Rank is a query, not a column:
--   row_number() over (order by bid_cents desc, updated_at asc)

create extension if not exists pgcrypto;

create table listings (
  id              uuid primary key default gen_random_uuid(),
  identity_kind   text not null check (identity_kind in ('url', 'handle')),
  identity_key    text not null,
  url             text,
  handle          text,
  title           text not null default '',
  description     text not null default '',
  favicon_url     text,
  share_text      text, -- custom "share on X" tweet; null → default template (bought listings)
  bid_cents       integer not null check (bid_cents > 0),
  click_count     integer not null default 0,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  unique (identity_key)
);

create index listings_rank_idx on listings (bid_cents desc, updated_at asc);

create table checkout_intents (
  id                uuid primary key default gen_random_uuid(),
  listing_id        uuid references listings(id),
  identity_kind     text not null check (identity_kind in ('url', 'handle')),
  identity_key      text not null,
  url               text,
  handle            text,
  title             text not null default '',
  description       text not null default '',
  target_bid_cents  integer not null check (target_bid_cents >= 100),
  pay_cents         integer not null check (pay_cents >= 25),
  action            text not null default 'overbid' check (action in ('overbid', 'downbid', 'edit')),
  lower_cents       integer, -- downbid only: how much to subtract from the target
  polar_checkout_id text unique,
  polar_order_id    text unique,
  status            text not null default 'pending'
                    check (status in ('pending', 'paid', 'expired')),
  created_at        timestamptz not null default now(),
  paid_at           timestamptz
);

create index checkout_intents_status_idx on checkout_intents (status, created_at desc);

create table bid_events (
  id              uuid primary key default gen_random_uuid(),
  listing_id      uuid not null references listings(id),
  intent_id       uuid not null references checkout_intents(id),
  polar_order_id  text not null unique,
  delta_cents     integer not null,
  bid_after_cents integer not null,
  created_at      timestamptz not null default now()
);

create table clicks (
  id          bigserial primary key,
  listing_id  uuid not null references listings(id),
  created_at  timestamptz not null default now()
);

create index clicks_listing_idx on clicks (listing_id, created_at desc);

-- Real visitor stats for the live pill. Client heartbeats every ~30s.
-- `if not exists` so a board reseed never wipes accumulated visitor history.
create table if not exists visits (
  id         bigserial primary key,
  visitor    text not null,
  created_at timestamptz not null default now()
);

create index if not exists visits_created_idx on visits (created_at desc);

-- Live activity feed: one row per applied overbid/downbid.
create table activity (
  id           bigserial primary key,
  kind         text not null check (kind in ('overbid', 'downbid', 'edit')),
  label        text not null,          -- affected listing, e.g. "@elonmusk"
  amount_cents integer not null,       -- the delta (bid amount or reduction)
  note         text not null default '',
  created_at   timestamptz not null default now()
);

create index activity_created_idx on activity (created_at desc);

-- Ranked board
create or replace view board as
select
  row_number() over (order by bid_cents desc, updated_at asc) as rank,
  id,
  identity_kind,
  identity_key,
  url,
  handle,
  title,
  description,
  favicon_url,
  bid_cents,
  click_count,
  created_at,
  updated_at
from listings;

-- Seed your own product at $10 before going live (skip Polar).
-- insert into listings (identity_kind, identity_key, url, title, description, bid_cents)
-- values (
--   'url',
--   'https://yourproduct.com',
--   'https://yourproduct.com',
--   'Your product',
--   'Seed listing so the first screenshot is not empty.',
--   1000
-- );
