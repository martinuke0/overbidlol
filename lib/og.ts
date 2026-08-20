// Best-effort OpenGraph scrape so a row filled from a bare URL still shows a
// title + description (like overbid.lol). Never blocks/fails checkout.
const ENTITIES: Record<string, string> = {
  "&amp;": "&", "&lt;": "<", "&gt;": ">", "&quot;": '"', "&#39;": "'", "&apos;": "'", "&nbsp;": " ",
};
const decode = (s: string) =>
  s.replace(/&#(\d+);/g, (_, n) => String.fromCharCode(+n)).replace(/&[a-z#0-9]+;/gi, (m) => ENTITIES[m] ?? m);

function metaContent(html: string, key: string): string {
  const tag = html.match(new RegExp(`<meta[^>]*(?:property|name)=["']${key}["'][^>]*>`, "i"));
  if (!tag) return "";
  const c = tag[0].match(/content=["']([^"']*)["']/i);
  return c ? decode(c[1]).trim() : "";
}

export async function fetchOg(url: string): Promise<{ title: string; description: string }> {
  try {
    const ac = new AbortController();
    const timer = setTimeout(() => ac.abort(), 2500);
    const res = await fetch(url, {
      signal: ac.signal,
      headers: { "user-agent": "Mozilla/5.0 (compatible; overbid.lol OG fetcher)" },
      redirect: "follow",
    });
    clearTimeout(timer);
    const html = (await res.text()).slice(0, 200_000);
    const titleTag = html.match(/<title[^>]*>([^<]+)<\/title>/i);
    const title = metaContent(html, "og:title") || (titleTag ? decode(titleTag[1]).trim() : "");
    const description = metaContent(html, "og:description") || metaContent(html, "description");
    return { title: title.slice(0, 120), description: description.slice(0, 280) };
  } catch {
    return { title: "", description: "" };
  }
}

/** Fill missing title/description from OG tags for URL listings only. */
export async function enrich(
  kind: "url" | "handle",
  url: string | null,
  title: string,
  description: string,
): Promise<{ title: string; description: string }> {
  if (kind !== "url" || !url || (title && description)) return { title, description };
  const og = await fetchOg(url);
  return { title: title || og.title, description: description || og.description };
}
