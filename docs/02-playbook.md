# Playbook

## What you are cloning

Not a SaaS. A live sports broadcast where the scoreboard is a checkout.

He posted almost only this for ~20 hours. If you have fewer than ~12k indie-hacker followers, run the same loop with a **wedge** and hijack his traffic instead of hoping your own feed is enough.

---

## 1. Product: 3-hour MVP

Ship these rules. Nothing else.

| Rule | Why |
|---|---|
| Rank = dollars paid, descending | Obvious in a screenshot |
| $1 beats the seat you want | First bid can be $1. Game starts. |
| Paying under #1 still places you | Cheap seats = fuller screenshot |
| Same URL / handle pays the **delta** to climb | Whales re-enter without a new row |
| Someone else cannot steal a rank by paying that delta | They pay a new **full** bid above the current total |
| Outbound `?utm_source=yoursite` + click counter | Tweet “this seat already did 400 clicks” |
| No accounts | Friction kills the first $5 |
| Board looks like a scoreboard | Huge $, gold #1, product name, clicks |

Do **not** ship: auth, dashboard, customer portal, categories, admin, blog, waitlist, websockets.

Stack: Next.js + Polar + Postgres. See [03-spec.md](03-spec.md).

**Seed before “we’re live”:** your own product at $10 (SQL insert, skip Polar). Empty board = dead launch. Marc seeded $10 in 2016. Wilke’s first public bids were $1–$6.

### Wedge (pick one)

- **Weekly reset** — the real business. Recurring bids. His board is a one-shot auction that dies when he stops tweeting.
- **One niche** — AI tools / agencies / games / a country.
- **One language, one WhatsApp/Telegram scene.**
- Reply under his $1k tweet: “same game, but [wedge]. $1 to be first.”

---

## 2. Voice

- 1–4 lines. Typos fine (`spend` not `spent`).
- Screenshot **every** original post. No screenshot = skip the tweet.
- Always the URL in the body.
- Frame: **fun project**, not company.
- Emoji: 🚀 🥇 🤯 🔥 ⚔️ 👑 😳
- Congratulate the **product URL**, then @ the founder if you know them.
- Close with a dare: `Who will overbid them?`

Never: long threads, feature lists, “we’re excited to announce.”

---

## 3. The 8 tweet types

He did not invent 40 ideas. He rotated these. Full copy in [04-tweets.md](04-tweets.md).

| ID | When | Job |
|---|---|---|
| **T1** | T-2h → T-0 | Quote-chain tease. Don’t explain the product. |
| **T2** | T-0 | Launch. Three nos + one mechanic + screenshot. |
| **T3** | Minutes later | First blood, then immediately the second bidder. |
| **T4** | Every #1 change | Sports commentary. Volume engine. |
| **T5** | Morning + round numbers | Recap. **This is the viral post, not T2.** |
| **T6** | Board stalls | Ship a 1-line feature that extracts more $. |
| **T7** | Whenever | Proof: Polar payout, analytics, clicks, outage, buy offer, clone ask. |
| **T8** | Morning of day 1 | Ask (directories). Replies = distribution. |

T1 chain:

```
cheapest domain I ever bought. lol
→ first project on [host]. let's see.
→ Launching in the next 30 minutes...
→ Almost there... just checking the Polar webhook 💸
```

His webhook tweet: **0 likes, 47k views.** The chain carries it.

---

## 4. Minute-by-minute

Full timestamp checklist: [05-calendar.md](05-calendar.md).

**T-3h → T-0** — Domain receipt → host/tool tweet → seed $10 → “30 minutes” → webhook → T2 quoting the webhook.

If a tool-company person replies (Rauch did), reply as a customer. Borrowed reach.

**T+0 → T+3h** — Pin launch. Reply to every comment in <2 min. DM 10 founders: “$1 puts you on the board. I’ll screenshot it.” First bid → T3. Second bid → quote T3. Cross-post Indie Hackers.

If nobody bids in 30 minutes: a friend at $2 so the screenshot has a fight. Then dare $3 in public.

**Sleep** — Only T4 when #1 changes. One T7 if Polar shows money. He stopped ~1:30am local.

**Next morning is the actual launch**

1. “This is starting to get crazy” + screenshot
2. “N visitors / $X in 12 hours, built in 3 hours”
3. Ship one feature (any-rank $1) + “#5 is still $Y”
4. Tag #1 if they’re known

His morning recap did more than the entire night of play-by-play.

**Rest of day 1** — One original screenshot tweet whenever #1 changes, a round number hits, a named person appears, or you ship a 1-line feature. Cluster tweets during a fight (he did traffic → new #1 → buy-the-site in five minutes).

---

## 5. Reply SOP

| They say | You say |
|---|---|
| Scam / pay-to-play | Fun project. Your product can be #1 when it pops. |
| How does it work? | $1 more than the seat you want. |
| I already listed | Pay the delta, same URL. |
| Clone idea | Screenshot it. “Most people wouldn’t even ask 😂” |
| Add Stripe / feature X | Ship it same day if it makes more bids. Else “maybe 👀” |
| Dead board | Quote current cheap seat: “#5 is $34.” |

Never argue economics. Critics quote you; that’s reach.

---

## 6. If you have <2k followers

Do not tweet into the void.

1. Launch in **his** replies / quotes. His $1k post is the distribution.
2. Seed 5 friends at $1, $2, $3, $5, $8 so the first screenshot looks alive.
3. One known niche account at #1 for an hour, then publicly overbid them.
4. One WhatsApp/Telegram of founders > 50 cold tweets.
5. Weekly reset + niche survives after his hype dies. Generic “also overbid” dies Friday.

---

## 7. What not to copy

- Launching **generic indie-SaaS overbid** against a $1k #1 this week
- Waiting to post until you have “enough” bids
- Threads, carousels, a landing page that isn’t the board
- Polished brand voice
- Building for a week — the story **is** “3 hours last night”
