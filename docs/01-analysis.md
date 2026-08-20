# How Jonathan Wilke launched overbid.lol

Source: his X account [@jonathan_wilke](https://x.com/jonathan_wilke) (~12.2k followers), Aug 19–20 2026, plus the live board at [overbid.lol](https://overbid.lol).

This is not a SaaS launch. It is a **live sports broadcast** where the scoreboard is a checkout.

```
bid happens
  → screenshot the board
  → tweet the new #1 + URL + “who’s next”
  → tagged founder quote-tweets it
  → more eyes → rank is worth more → next bid
```

He posted almost only this for ~20 hours. That is the product. The site is the prop.

Precedent: Marc Köhlbrugge’s [highscore.money](https://highscore.money) (2016) — $2,251 in one day. Same mechanic, different era. Wilke added product URLs, click tracking, bid-up-by-delta, and a 20-hour posting machine.

---

## Who

German indie hacker. [supastarter](https://supastarter.dev) (~$10k MRR historically). Next.js / Nuxt / Tailwind crowd. Polar customer already. Audience **is** the customer: founders who buy directory slots and like being in screenshots.

He did not launch into a cold feed.

Stack he named in public: Next.js, Polar, Cursor Origin, Grok 4.6. Built in ~3 hours the night of Aug 19. First project hosted on Cursor Origin. Guillermo Rauch replied to the countdown asking about the Vercel integration.

---

## Product (what the site actually does)

Public ranking. Whoever paid more sits higher.

- No ads, no API, no revenue share
- $1 increment
- Paying under #1 still places you
- Same URL / @handle raises that row; you pay only the difference
- Someone else cannot steal your rank by paying that difference — they pay a **new full bid** higher than yours
- Outbound clicks get `utm_source=overbid` and a public click counter
- Polar checkout; tax is extra (he tweeted “forgot about the tax”)

Live board ~20h later: #1 around **$1,016** with 1.6k clicks; 50+ paid listings; cluster of $1k seats.

---

## 24-hour timeline (UTC)

| Time | Move | What it did |
|---|---|---|
| Aug 19 17:48 | “cheapest domain I ever bought. lol” + screenshot | Curiosity. No product yet. |
| 18:18 | First project on @cursor_ai Origin | Tool-audience bait. ~12k views. |
| 20:15 | “Launching in the next 30 minutes…” (quote of Origin post) | Countdown. @rauchg replied. ~11k views. |
| 20:25 | “Should I do a live stream when I launch?” | Extra replies on the countdown. |
| 20:55 | “Almost there… Polar webhook” | Quote-stacked. **0 likes, 47k views.** |
| **21:08** | **“Aaaaaaand we're live!”** + screenshot + URL | Positioning. **~75k views, 139 bookmarks.** |
| 21:31–23:30 | Play-by-play of every new #1 | First bids at $1–$6. Each takeover is a post. |
| 21:48 | First Polar payout screenshot | Proof it’s real money. |
| 23:14 | “It’s all about distribution. overbid.lol” | One-liner while the board moved. |
| ~23:43 | “1:30 AM here…” then sleep | Stopped play-by-play. |
| Aug 20 06:14 | **“This is starting to get crazy”** + screenshot | **Breakout: ~206k views, 543 likes, 507 bookmarks.** |
| 06:47 | 3k visitors, $200 bids + shipped “claim any rank for $1 more” | Widened who can buy. |
| 07:57 | “4.5k visitors / $1.4k in 12h, fun project” | Number recap. ~52k views, 234 bookmarks. |
| 08:36 | “What are good directories to launch in?” | 38 replies = free DR list + circulation. |
| 10:12–10:30 | ~10k visitors, then “3 hours, $1.8k” | Same story, tighter. |
| 13:53 | Screenshot of someone asking to clone it | Copycats = social proof. |
| 14:24 | 100 listings | Milestone. |
| 14:36 | First outage (“now it’s a real app”) | Status as content. |
| 14:45 | Ship: raise old bid by paying the difference | Keeps whales in. |
| 15:39 | “someone just spent $1000” | ~13k views, **16 quotes.** Went international. |
| 16:17–16:22 | “traffic is absurd” → new #1 → inbound to buy the site | Three tweets in five minutes during a fight. |

He also cross-posted to Indie Hackers the same night: “I made a public ranking where #1 is whoever paid more than the last person.”

---

## What actually moved

Reposts were almost zero (1–4). Spread = **quotes + listed founders posting + other people screenshotting the board**.

| Type | Views | Bookmarks | Role |
|---|---|---|---|
| Morning “this is crazy” + screenshot | **206k** | **507** | Breakout. Do this. |
| Launch + three nos | 75k | 139 | Launch. |
| Polar webhook tease (0 likes) | 47k | 1 | Quote-chain works. |
| 4.5k vis / $1.4k recap | 52k | 234 | Social proof. |
| $1000 bid | 13k | 12 | Quote-bait (16 quotes). |
| Individual #1 changes | 2–9k | low | Volume engine, not the viral post. |
| Replies | tiny | — | Keep the main tweets alive. |

Night-of play-by-play filled the board. **Morning recap is what left his follower graph.**

Revenue he stated: **$1.4k at 12h, $1.8k shortly after.** Commenters claimed ~$4k by afternoon — treat only his numbers as sourced. Acquisition inbound showed up before the first full day ended.

---

## Launch copy (exact)

> Aaaaaaand we're live!
>
> https://overbid.lol
>
> No ads. No API keys. No revenue sharing.
>
> Just overbid your competitors to rank #1 and consider marketing done for today 🚀

Contrast with directories / PH boosts / paid newsletters. One sentence, three nos, one mechanic. Frame stayed **fun project** so “scammy” replies (Jesse Hanley, first 20 minutes) bounced off.

---

## Distribution he borrowed

Not ads. Name-drops with a real integration:

- Polar (he already ran supastarter on it)
- Cursor Origin (first project there)
- Grok 4.6 (“it just built me overbid.lol”)
- Vercel — Rauch replied to the countdown

Plus Indie Hackers. Plus asking for directories while traffic was free.

Copycats within a day (Indian version, Brazilian onepageking, betteroverbid.site) were free ads. He screenshotted the guy who asked permission to clone.

People compared it to highscore.money — that comparison is SEO among people who already paid for this mechanic once.

---

## Why it worked

1. 12k-follower indie who already sells to founders
2. Mechanic that is also a spectator sport
3. Feed of screenshots that get more interesting as people spend
4. Low first-price ($1–$6) so the game starts, then FOMO does price
5. “Fun weekend project / 3 hours / AI built it” as the story wrapper

Honest caveat from the quotes: a lot of this is **makers paying to be seen by other makers**. When the posting stops, traffic falls. A $1,016 #1 is only rational while his tweets hit six-figure views. He is both the marketplace and the ad inventory.

---

## Replicable bit

Not “make a paid leaderboard.”

**Ship a live scoreboard into an audience that competes in public, narrate every score change, keep shipping rules that let more people pay.**
