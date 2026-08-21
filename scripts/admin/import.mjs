// Bulk-import the hater roster (haters.mjs) at $1 with avatars + custom share tweets.
// Usage:
//   node --env-file=.env.local scripts/admin/import.mjs
//   DATABASE_URL="postgresql://…" node scripts/admin/import.mjs
import { withClient, showBoard } from "./_lib.mjs";
import { importHaters } from "./haters.mjs";
import { importHaters2 } from "./haters2.mjs";
import { applyLocalAvatars } from "./avatars.mjs";

await withClient(async (c) => {
  const n = await importHaters(c);
  const n2 = await importHaters2(c);
  const av = await applyLocalAvatars(c);
  console.log(`✓ imported ${n} haters + ${n2.urls} urls + ${n2.handles} handles at $1 (${av} local avatars)`);
  const { rows } = await c.query("select count(*)::int as n from listings where identity_kind = 'handle'");
  console.log(`total handles now: ${rows[0].n}`);
  await showBoard(c);
});
