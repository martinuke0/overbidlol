// Generate SHARE-LINKS.md: the exact X (Twitter) intent URL the "share on X"
// button opens for every listing, in board order.
//   node --env-file=.env.local scripts/admin/share-links.mjs
//   BASE_URL=https://overbid.lol node --env-file=.env.local scripts/admin/share-links.mjs
import { writeFile } from "node:fs/promises";
import { withClient } from "./_lib.mjs";

const BASE = process.env.BASE_URL || "https://overbid.lol";

function nameOf(r) {
  if (r.identity_kind === "handle") return r.handle || r.identity_key;
  try {
    return new URL(r.url || r.identity_key).host.replace(/^www\./, "");
  } catch {
    return r.identity_key;
  }
}

await withClient(async (c) => {
  const { rows } = await c.query(
    `select l.identity_kind, l.identity_key, l.handle, l.url, l.share_text, b.rank
       from board b join listings l on l.identity_key = b.identity_key
      order by b.rank`,
  );

  const out = [
    "# Share-to-X links",
    "",
    `Base: \`${BASE}\` — one row per listing, in board order. Each link opens the X composer`,
    "pre-filled with that account's tweet + its personal `/roast/<slug>` URL.",
    "",
    "| # | Listing | Share on X |",
    "|---|---|---|",
  ];

  for (const r of rows) {
    const name = nameOf(r);
    const slug = name.replace(/^@/, "");
    const text =
      r.share_text && r.share_text.trim()
        ? r.share_text
        : `Hey ${name} — you're only #${r.rank} on overbid.lol 😤\n\nDo something about it.`;
    const link = `${BASE}/roast/${encodeURIComponent(slug)}`;
    const intent = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(link)}`;
    out.push(`| ${r.rank} | ${name} | ${intent} |`);
  }

  await writeFile("SHARE-LINKS.md", out.join("\n") + "\n");
  console.log(`wrote SHARE-LINKS.md (${rows.length} listings)`);
});
