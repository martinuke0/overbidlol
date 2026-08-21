// Set a listing's description / bio. URLs and @handles.
// Usage: set-bio.mjs <url|@handle> <description...>
import { withClient, normalize, findListing, showBoard } from "./_lib.mjs";

const [target, ...rest] = process.argv.slice(2);
const description = rest.join(" ");
if (!target || !description) {
  console.error('Usage: set-bio <url|@handle> <description...>');
  process.exit(1);
}
const id = normalize(target);

await withClient(async (c) => {
  const listing = await findListing(c, id.key);
  if (!listing) {
    console.log(`not on the board: ${id.key} (use add.mjs to create it)`);
    return;
  }
  await c.query("update listings set description = $2, updated_at = now() where identity_key = $1", [
    id.key,
    description.slice(0, 280),
  ]);
  console.log(`✓ ${id.key} bio → "${description}"`);
  await showBoard(c);
});
