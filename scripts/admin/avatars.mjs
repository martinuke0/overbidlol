// Point each handle listing at its local icon in public/avatars (served at /avatars/<file>).
// Local files never throttle and always render — unlike hitting unavatar per page load.
// Matches by handle, case-insensitively, so realDonaldTrump.jpg → @realDonaldTrump.
import { readdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const AV_DIR = join(dirname(fileURLToPath(import.meta.url)), "..", "..", "public", "avatars");

export async function applyLocalAvatars(client) {
  let n = 0;
  for (const f of readdirSync(AV_DIR)) {
    if (!/\.(jpe?g|png|webp)$/i.test(f)) continue;
    const base = f.replace(/\.[^.]+$/, "").toLowerCase();
    const r = await client.query(
      `update listings set favicon_url = $1
         where identity_kind = 'handle' and lower(ltrim(handle, '@')) = $2`,
      [`/avatars/${f}`, base],
    );
    n += r.rowCount ?? 0;
  }
  return n;
}
