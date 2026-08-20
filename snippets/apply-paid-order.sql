-- Apply a paid Polar order. One transaction. Idempotent on polar_order_id.
-- Bind: $intent_id uuid, $order_id text

begin;

-- 1. Lock intent
select *
from checkout_intents
where id = $intent_id
for update;

-- If no row → fail
-- If polar_order_id = $order_id already → commit empty (retry)
-- If status != 'pending' → commit empty

-- 2. Upsert listing. New row at pay_cents; existing row ADDS pay_cents.
insert into listings (
  identity_kind,
  identity_key,
  url,
  handle,
  title,
  description,
  bid_cents
)
select
  identity_kind,
  identity_key,
  url,
  handle,
  title,
  description,
  pay_cents
from checkout_intents
where id = $intent_id
on conflict (identity_key) do update set
  bid_cents   = listings.bid_cents + excluded.bid_cents,
  title       = case when excluded.title = '' then listings.title else excluded.title end,
  description = case when excluded.description = '' then listings.description else excluded.description end,
  url         = coalesce(excluded.url, listings.url),
  handle      = coalesce(excluded.handle, listings.handle),
  updated_at  = now()
returning id, bid_cents;

-- 3. Ledger (unique polar_order_id absorbs webhook retries)
insert into bid_events (
  listing_id,
  intent_id,
  polar_order_id,
  delta_cents,
  bid_after_cents
)
select
  l.id,
  i.id,
  $order_id,
  i.pay_cents,
  l.bid_cents
from checkout_intents i
join listings l on l.identity_key = i.identity_key
where i.id = $intent_id
on conflict (polar_order_id) do nothing;

-- 4. Close intent
update checkout_intents
set
  status = 'paid',
  polar_order_id = $order_id,
  listing_id = (
    select id from listings
    where identity_key = checkout_intents.identity_key
  ),
  paid_at = now()
where id = $intent_id
  and status = 'pending';

commit;
