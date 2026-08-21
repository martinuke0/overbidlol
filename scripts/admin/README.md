# Admin scripts

Manage board listings (URLs **and** X @handles) directly against the database.
Plain Node + `pg`, no build step. Identity is normalized the same way the app does
(`@Handle` → lowercased key, URLs stripped of `www`/tracking params), so keys always match.

## Which database?

Scripts read `DATABASE_URL` from the environment:

- **Local** (uses `.env.local`):
  ```bash
  node --env-file=.env.local scripts/admin/list.mjs
  ```
- **Production** (pass the Neon URL inline — never commit it):
  ```bash
  DATABASE_URL="postgresql://…neon…/neondb?sslmode=require" node scripts/admin/list.mjs
  ```

## Commands

| Command | Usage |
|---|---|
| **list** | `list.mjs` |
| **add** (upsert) | `add.mjs <url\|@handle> <dollars> [description…]` |
| **remove** | `remove.mjs <url\|@handle>` |
| **set-amount** | `set-amount.mjs <url\|@handle> <dollars>` |
| **set-bio** | `set-bio.mjs <url\|@handle> <description…>` |

`<dollars>` accepts decimals (`10.25`). Every command prints the resulting board.

## Examples

```bash
# add a personality to the X list at $12.50
node --env-file=.env.local scripts/admin/add.mjs @naval 12.50 "Angel investor."

# add a site
node --env-file=.env.local scripts/admin/add.mjs stripe.com 5 "Payments infrastructure."

# change a bid (= change rank)
node --env-file=.env.local scripts/admin/set-amount.mjs @elonmusk 9.25

# rewrite a bio
node --env-file=.env.local scripts/admin/set-bio.mjs @sama "He is evil."

# remove a listing (also clears its bid/click/intent rows)
node --env-file=.env.local scripts/admin/remove.mjs grok.bot

# same, against production
DATABASE_URL="postgresql://…" node scripts/admin/set-amount.mjs @lewiscarhart 10.25
```

Notes:
- `add` upserts — run it again on the same target to update amount/description.
- Amounts are the rank: highest bid = #1. Ties break by earliest placement.
- These write live data with no confirmation — double-check the target before running against prod.
