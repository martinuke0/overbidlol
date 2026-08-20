# Copycat

Launch kit for a pay-to-rank leaderboard in the style of [overbid.lol](https://overbid.lol) (Jonathan Wilke, Aug 19–20 2026) and the 2016 original [highscore.money](https://highscore.money).

Copy the **machine**, not the URL. A 1:1 generic clone this week is already crowded. Same mechanic + a **wedge** + this posting system is the actual copy.

## What’s in here

| File | What |
|---|---|
| [docs/01-analysis.md](docs/01-analysis.md) | How Wilke actually launched (timeline, numbers, posts) |
| [docs/02-playbook.md](docs/02-playbook.md) | Operating system: product rules, voice, 8 tweet types, replies |
| [docs/03-spec.md](docs/03-spec.md) | Schema + Polar checkout + webhook apply |
| [docs/04-tweets.md](docs/04-tweets.md) | Fill-in copy, swap `YOUR.URL` |
| [docs/05-calendar.md](docs/05-calendar.md) | 36-hour runbook with timestamps |
| [docs/06-metrics.md](docs/06-metrics.md) | Domain, host, his numbers, live board, tweet stats |
| [docs/07-domains.md](docs/07-domains.md) | Cheap viral names matching overbid.lol (checked free) |
| [schema.sql](schema.sql) | Postgres: listings, intents, bid_events, clicks |
| [env.example](env.example) | Polar + app env |
| [snippets/](snippets/) | Polar checkout, webhook, identity, apply SQL |

## Stack (3-hour MVP)

Next.js + Polar (Merchant of Record) + Postgres.

- One catalog product, **ad-hoc fixed price per checkout** (do not use pay-what-you-want)
- Form on your site → locked dollar amount on Polar → `order.paid` webhook upserts the board
- Rank is a query: `ORDER BY bid_cents DESC, updated_at ASC`
- No accounts

## Wedge (pick one or you are clone #8)

- Weekly reset (the actual business — his board dies when he stops tweeting)
- One niche (AI tools, agencies, games, a country)
- One language + one WhatsApp/Telegram scene
- Reply under his viral posts: “same game, but [wedge]. $1 to be first.”

## Launch in one sentence

Seed the board at $10 → quote-chain tease for 2 hours → “we’re live” + screenshot → narrate every #1 change → morning recap with round numbers is the real launch tweet.

Start with [docs/03-spec.md](docs/03-spec.md) to build, [docs/05-calendar.md](docs/05-calendar.md) to ship.
# overbidlol
