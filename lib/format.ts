import type { BoardRow } from "./db";

export const usd = (cents: number) => {
  const d = cents / 100;
  // Whole dollars stay clean ($1,020); fractional show cents ($2.48).
  return d % 1 === 0
    ? `$${d.toLocaleString("en-US")}`
    : `$${d.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

/** "5 minutes ago", "3 hours ago", "2 days ago" — matches overbid.lol phrasing. */
export function timeAgo(iso: string, now: number): string {
  const s = Math.max(0, Math.floor((now - new Date(iso).getTime()) / 1000));
  if (s < 60) return `${s} second${s === 1 ? "" : "s"} ago`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m} minute${m === 1 ? "" : "s"} ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h} hour${h === 1 ? "" : "s"} ago`;
  const d = Math.floor(h / 24);
  return `${d} day${d === 1 ? "" : "s"} ago`;
}

/** What we show for a row: bare host, or the @handle. */
export function displayName(row: Pick<BoardRow, "identity_kind" | "handle" | "url" | "identity_key">): string {
  if (row.identity_kind === "handle") return row.handle ?? row.identity_key;
  try {
    return new URL(row.url ?? row.identity_key).host.replace(/^www\./, "");
  } catch {
    return row.identity_key;
  }
}

export function faviconUrl(
  row: Pick<BoardRow, "identity_kind" | "url" | "identity_key" | "favicon_url">,
): string | null {
  if (row.favicon_url) return row.favicon_url; // stored avatar (e.g. an X profile pic)
  if (row.identity_kind === "handle") return null;
  try {
    const host = new URL(row.url ?? row.identity_key).host;
    return `https://www.google.com/s2/favicons?domain=${host}&sz=64`;
  } catch {
    return null;
  }
}
