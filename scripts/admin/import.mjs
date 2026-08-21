// Bulk-import the hater roster (haters.mjs) at $1 with avatars + custom share tweets.
// Usage:
//   node --env-file=.env.local scripts/admin/import.mjs
//   DATABASE_URL="postgresql://…" node scripts/admin/import.mjs
import { withClient, showBoard } from "./_lib.mjs";
import { importHaters } from "./haters.mjs";

await withClient(async (c) => {
  const n = await importHaters(c);
  console.log(`✓ imported ${n} haters at $1`);
  const { rows } = await c.query("select count(*)::int as n from listings where identity_kind = 'handle'");
  console.log(`total handles now: ${rows[0].n}`);
  await showBoard(c);
});
