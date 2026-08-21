// Set a listing's bid amount (which is its rank). URLs and @handles.
// Usage: set-amount.mjs <url|@handle> <dollars>
import { withClient, normalize, toCents, findListing, showBoard } from "./_lib.mjs";

const [target, dollars] = process.argv.slice(2);
if (!target || !dollars) {
  console.error("Usage: set-amount <url|@handle> <dollars>");
  process.exit(1);
}
const id = normalize(target);
const bid = toCents(dollars);

await withClient(async (c) => {
  const listing = await findListing(c, id.key);
  if (!listing) {
    console.log(`not on the board: ${id.key} (use add.mjs to create it)`);
    return;
  }
  await c.query("update listings set bid_cents = $2, updated_at = now() where identity_key = $1", [
    id.key,
    bid,
  ]);
  console.log(`✓ ${id.key} → $${(bid / 100).toFixed(2)}`);
  await showBoard(c);
});
