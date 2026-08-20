# Stack + metrics

Snapshot: **Thu 20 Aug 2026 ~evening UTC**, ~20h after launch (21:08 UTC 19 Aug).

## Stack

| Piece | What |
|---|---|
| Domain | **Namecheap** — `overbid.lol`, 1 year, **$1.80** + $0.20 ICANN. Order `211607795`, created `2026-08-19T17:47:18Z`. |
| Git | **Cursor Origin** — repo `supastarter/overbid-lol`, branch `main` |
| App / DNS | **Vercel** — team `supastarter` (Pro), project `overbid-lol`, NS `ns1/ns2.vercel-dns.com` |
| Payments | **Polar** (MoR). Tax on top of bid. |
| Build | Next.js, Grok 4.6, **~3 hours** |

## His stated numbers (treat as source)

| When (UTC) | Hours live | What he said |
|---|---|---|
| 19 Aug 21:57 | ~0:50 | #1 at **$6** (pour.dev) |
| 20 Aug 06:47 | ~9.5 | **3,000 visitors**, top bids **>$200** |
| 20 Aug 07:57 | ~11 | **4,500 visitors**, **$1.4k revenue** |
| 20 Aug 10:12 | ~13 | About to hit **10k visitors** in 12h |
| 20 Aug 10:30 | ~13.5 | **$1.8k revenue**, 3h build |
| 20 Aug 14:24 | ~17 | **100 listings** |
| 20 Aug 15:39 | ~18.5 | Someone spent **$1,000** for #1 |

He did not post a revenue figure after the $1k bidding war. Everything below that is inferred from the public board.

## Board right now (live scrape, top 50)

| | |
|---|---|
| #1 | prelint.com **$1,017** / 771 clicks |
| #2 | trycodus.com **$1,016** / 12,354 clicks |
| #5 | last $1k seat — startglobal.co **$1,001** |
| #6 | drops to **$501** |
| Visible listings | 50 on first page (he claimed 100 total) |
| **Sum of top-50 bids** | **~$10,904** |
| **Sum of top-50 clicks** | **~19,500** |

Board sum ≈ GMV if `bid_cents` is cumulative spend per listing (upbids add). Polar tax and fees are extra / off-board. **Lower bound on take: ~$11k in ~20h**, not counting rows 51–100.

### Implied CPC for the top seats

| Seat | Bid | Clicks | Bid / clicks |
|---|---|---|---|
| trycodus #2 | $1,016 | 12,354 | **$0.08** |
| tinystartups #9 | $307 | 672 | $0.46 |
| tolt #10 | $306 | 674 | $0.45 |
| prelint #1 | $1,017 | 771 | $1.32 |
| startglobal #5 | $1,001 | 490 | $2.04 |

Clicks are self-reported by his counter. trycodus is an outlier (12k). Most $1k seats are still **$1–2 per click** of *on-board* traffic, not including screenshot / tweet impressions.

## X distribution (his posts)

Account: [@jonathan_wilke](https://x.com/jonathan_wilke) **~12.3k** followers.

| Post | Views | Likes | Bookmarks | Quotes |
|---|---|---|---|---|
| “This is starting to get crazy” | **211k** | 551 | 521 | 18 |
| “Aaaaaaand we're live” | **76k** | 127 | 140 | 7 |
| 4.5k vis / $1.4k | **54k** | 271 | 235 | 7 |
| Polar webhook tease (0 likes) | **47k** | 0 | 1 | 1 |
| $1000 bid | **15k** | 60 | 13 | 17 |
| “3 hours, $1.8k” | **10k** | 82 | 20 | 7 |
| Cursor Origin screenshot | **12k** | 12 | 1 | 1 |
| Domain receipt | **3k** | 11 | 2 | 1 |
| Directories ask | ~9k | 38 | 40 | 1 |

Reposts stayed tiny (0–4). Spread was **quotes + listed founders**, not retweets.

Rough sum of the big posts above: **~430k views** on his own account, concentrated in 4 tweets.

## Unit economics (back of napkin)

| | |
|---|---|
| Domain | $2.00 |
| Hosting / Origin | $0 incremental on existing Vercel Pro + Cursor |
| Time | ~3h build + ~20h posting |
| Stated revenue @13.5h | $1,800 |
| Board GMV @~20h (top 50) | **~$10,900** |
| Polar MoR fee | not public on his posts — net < GMV |
| First bid | $1–$6 |
| Time to $200 top bid | <12h |
| Time to $1k top bid | ~18.5h |
| Time to 100 listings | ~17h |

## Vemetric public dashboard (last 24h)

Source: [app.vemetric.com/public/overbid.lol?t=24hrs](https://app.vemetric.com/public/overbid.lol?t=24hrs) scraped live.

This is the real traffic log. His tweets were low vs this.

| | |
|---|---|
| Users | **32,722** (391 on the site at scrape time) |
| Page views | **61,666** (~1.9 views / user) |
| Bounce rate | **75%** (expected: the product is one page) |
| Visit duration | **4m 44s** |
| Countries | 164 |
| Chart | hourly pageviews peaking near **10k** |

### Funnel that actually matters

| Step | Users | Of total |
|---|---|---|
| Hit `/` | 32,554 | 99.5% |
| Clicked a listing (Outbound Link event) | **9,916** users / **19,467** clicks | 30% click a product |
| Hit `/success` on overbid.lol | **164** (229 views) | **0.50%** pay |
| Hit `/success` on `overbid-lol.vercel.app` | 46 | extra Polar returns on the raw Vercel host |
| `/rules` | 464 | 1.4% |

`/success` = Polar `successUrl`. Unique success users ≈ **paid checkouts**.  
164 / 9,916 clickers = **1.7% of clickers pay**.  
If board GMV ~$11k → **~$67 per successful payment**.

Outbound click count **19,467** matches the on-board click counters (~19.5k on top 50).

### Sources (34 referrers)

| Source | Users | Share |
|---|---|---|
| **Twitter** (`t.co`) | **27,701** | **85%** |
| Direct / None | 4,582 | 14% |
| Facebook | 440 | 1.3% |
| Reddit | 160 | |
| Google (Android) | 125 | |
| Threads | 62 | |
| WeChat | 51 | |
| polar.sh | 48 | return from checkout |
| Hacker News | 23 | almost nothing |
| Slack / Bing / others | <20 | |

This is an X launch. PH/HN/SEO did not matter.

### Browsers (in-app X is the #1 browser)

| Browser | Users |
|---|---|
| **Twitter** (in-app) | **15,194** |
| Chrome | 11,047 |
| Brave | 1,556 |
| Mobile Safari | 1,531 |
| Firefox | 671 |
| Safari | 659 |
| Mobile Chrome | 532 |

~46% never left the X in-app browser. Design + Polar checkout must work in Twitter’s webview.

### Countries (top 7 of 164)

| Country | Users |
|---|---|
| United States | 5,122 |
| Brazil | 4,345 |
| India | 4,190 |
| United Kingdom | 1,911 |
| Germany | 1,353 |
| France | 1,084 |
| Canada | 964 |

US + BR + IN = **42%**. The clone wave (India, Brazil) is the same traffic.

### Other pages

- `overbid-lol.vercel.app` — 97 users (raw Vercel URL leaked)
- `/sudhanshu-singh.com` — 84 users (broken path, someone listed a path as a page)

## What to copy as targets

If you run the same machine with a smaller account, do not expect $11k. Use his **shape**:

1. First paid bid in minutes, even if $1
2. Screenshot-able $ amounts by morning ($100+ top)
3. One recap tweet that outperforms the launch tweet
4. A feature that lets more people pay before the first stall
