// Cached avatar proxy: fetch an X pfp from unavatar once, then let the CDN serve it.
// s-maxage means Vercel caches the response globally, so unavatar is hit ~once per
// handle instead of once per visitor — no more throttling when the board loads.
// A 404 (no X avatar found) flows through so <Favicon> shows its letter fallback.
export async function GET(_req: Request, { params }: { params: Promise<{ handle: string }> }) {
  const { handle } = await params;
  const upstream = await fetch(
    `https://unavatar.io/x/${encodeURIComponent(handle)}?fallback=false`,
    { cache: "no-store" },
  ).catch(() => null);

  if (!upstream || !upstream.ok) return new Response(null, { status: 404 });

  return new Response(upstream.body, {
    headers: {
      "Content-Type": upstream.headers.get("content-type") ?? "image/jpeg",
      "Cache-Control": "public, max-age=86400, s-maxage=2592000, stale-while-revalidate=86400",
    },
  });
}
