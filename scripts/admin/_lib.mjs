// Shared helpers for the admin scripts. Uses DATABASE_URL from the environment.
import pg from "pg";

export async function withClient(fn) {
  const url = process.env.DATABASE_URL;
  if (!url) {
    console.error(
      "DATABASE_URL not set.\n" +
        "  local:  node --env-file=.env.local scripts/admin/<cmd>.mjs ...\n" +
        '  prod:   DATABASE_URL="postgresql://…" node scripts/admin/<cmd>.mjs ...',
    );
    process.exit(1);
  }
  const client = new pg.Client({ connectionString: url });
  await client.connect();
  try {
    return await fn(client);
  } finally {
    await client.end();
  }
}

const TRACKING = new Set(["ref", "fbclid", "gclid", "mc_cid", "mc_eid"]);

// Mirrors lib/identity: a URL or an @handle → canonical identity_key + click url.
export function normalize(input) {
  const v = String(input ?? "").trim();
  if (!v) throw new Error("target required (a URL or @handle)");
  const looksHandle = v.startsWith("@") || (!v.includes(".") && !v.includes("/"));
  if (looksHandle) {
    const handle = v.startsWith("@") ? v : "@" + v;
    if (!/^@[A-Za-z0-9_]{1,15}$/.test(handle)) throw new Error(`invalid @handle: ${handle}`);
    const key = handle.toLowerCase();
    return {
      kind: "handle",
      key,
      handle, // keep the given casing for display
      url: `https://x.com/${key.slice(1)}?utm_source=overbid`,
      title: "",
      // Auto-resolve the X profile pic by handle (letter fallback if it 404s).
      favicon: `https://unavatar.io/x/${key.slice(1)}?fallback=false`,
    };
  }
  let u;
  try {
    u = new URL(/^https?:\/\//i.test(v) ? v : "https://" + v);
  } catch {
    throw new Error(`invalid URL: ${v}`);
  }
  const host = u.hostname.replace(/^www\./i, "").toLowerCase();
  u.hostname = host;
  u.hash = "";
  u.protocol = "https:";
  for (const k of [...u.searchParams.keys()]) {
    const lk = k.toLowerCase();
    if (lk.startsWith("utm_") || TRACKING.has(lk)) u.searchParams.delete(k);
  }
  const path = u.pathname.replace(/\/+$/, "");
  const search = u.searchParams.toString();
  const key = `https://${host}${path || ""}` + (search ? `?${search}` : "");
  const url = key + (key.includes("?") ? "&" : "?") + "utm_source=overbid";
  return { kind: "url", key, handle: null, url, title: host, favicon: null };
}

export function toCents(dollars) {
  const n = Number(dollars);
  if (!Number.isFinite(n) || n <= 0) throw new Error(`invalid amount: ${dollars}`);
  return Math.round(n * 100);
}

export async function showBoard(client) {
  const { rows } = await client.query(
    `select rank, identity_kind, coalesce(handle, nullif(title,''), identity_key) as label, bid_cents
     from board order by rank`,
  );
  console.log("Board:");
  for (const r of rows) {
    console.log(`  #${r.rank}  ${r.label}  $${(r.bid_cents / 100).toFixed(2)}  [${r.identity_kind}]`);
  }
}

export async function findListing(client, key) {
  const { rows } = await client.query("select id from listings where identity_key = $1", [key]);
  return rows[0] ?? null;
}
