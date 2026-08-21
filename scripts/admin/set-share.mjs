// Set a listing's custom "share on X" tweet. URLs and @handles.
// Empty string clears it (reverts to the default template).
// Usage: set-share.mjs <url|@handle> <message...>
//   node --env-file=.env.local scripts/admin/set-share.mjs @sama "@sama runs the AI. Someone unplug him 👇"
import { withClient, normalize, findListing, showBoard } from "./_lib.mjs";

const [target, ...rest] = process.argv.slice(2);
if (!target) {
  console.error('Usage: set-share <url|@handle> <message...>   (empty message clears → default)');
  process.exit(1);
}
const id = normalize(target);
const message = rest.join(" ").trim() || null;

await withClient(async (c) => {
  const listing = await findListing(c, id.key);
  if (!listing) {
    console.log(`not on the board: ${id.key} (use add.mjs first)`);
    return;
  }
  await c.query("update listings set share_text = $2, updated_at = now() where identity_key = $1", [
    id.key,
    message,
  ]);
  console.log(message ? `✓ ${id.key} share → "${message}"` : `✓ ${id.key} share → default`);
  await showBoard(c);
});
