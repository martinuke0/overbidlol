// Remove a listing (and its bid/click/intent references). URLs and @handles.
// Usage: remove.mjs <url|@handle>
import { withClient, normalize, findListing, showBoard } from "./_lib.mjs";

const [target] = process.argv.slice(2);
if (!target) {
  console.error("Usage: remove <url|@handle>");
  process.exit(1);
}
const id = normalize(target);

await withClient(async (c) => {
  const listing = await findListing(c, id.key);
  if (!listing) {
    console.log(`not on the board: ${id.key}`);
    return;
  }
  await c.query("begin");
  await c.query("delete from bid_events where listing_id = $1", [listing.id]);
  await c.query("delete from clicks where listing_id = $1", [listing.id]);
  await c.query("update checkout_intents set listing_id = null where listing_id = $1", [listing.id]);
  await c.query("delete from listings where id = $1", [listing.id]);
  await c.query("commit");
  console.log(`✓ removed ${id.key}`);
  await showBoard(c);
});
