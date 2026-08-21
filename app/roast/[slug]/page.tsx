import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getListingById } from "@/lib/db";
import { displayName, usd } from "@/lib/format";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const l = await getListingById(slug);
  if (!l) return { title: "overbid.lol" };
  const name = displayName(l);
  const title = `${name} is #${l.rank} on overbid.lol`;
  const description = `${name} is sitting at #${l.rank} for ${usd(l.bid_cents)}.${
    l.description ? ` ${l.description}` : ""
  } Outbid them — or drag them down.`;
  return {
    title,
    description,
    openGraph: { title, description, type: "website" },
    twitter: { card: "summary_large_image", title, description },
  };
}

export default async function RoastPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const l = await getListingById(slug);
  if (!l) notFound();

  const name = displayName(l);
  const target = l.handle ?? l.url ?? l.identity_key;
  const q = `target=${encodeURIComponent(target)}`;

  return (
    <main className="mx-auto flex w-full max-w-lg grow flex-col items-center justify-center px-4 py-16 text-center">
      <Link href="/" className="mb-8 inline-flex items-center gap-2 text-2xl font-semibold tracking-[-0.04em]">
        <svg width="26" height="26" viewBox="0 0 32 32" fill="none" aria-hidden>
          <path d="M4 23 L6 10 L13 16 L16 7 L19 16 L26 10 L28 23 Z" fill="var(--primary)" />
          <rect x="4" y="23" width="24" height="4" rx="1.5" fill="var(--foreground)" />
        </svg>
        overbid.lol
      </Link>

      <div className="w-full rounded-2xl border border-primary/20 bg-primary/[0.05] p-6">
        <div className="flex items-center justify-center gap-3">
          <span className="inline-flex items-center justify-center rounded-lg bg-foreground px-3 py-1 text-sm font-bold text-background">
            #{l.rank}
          </span>
          <span className="text-2xl font-bold tracking-[-0.02em]">{name}</span>
        </div>
        <div className="mt-2 text-4xl font-extrabold tabular-nums text-primary">{usd(l.bid_cents)}</div>
        {l.description && <p className="mt-3 text-muted-foreground">{l.description}</p>}
      </div>

      <div className="mt-6 flex w-full flex-col gap-2 sm:flex-row">
        <Link
          href={`/?mode=overbid&${q}`}
          className="flex-1 rounded-full bg-foreground py-3 font-bold text-background transition-opacity hover:opacity-90"
        >
          Overbid them
        </Link>
        <Link
          href={`/?mode=downbid&${q}`}
          className="flex-1 rounded-full bg-destructive py-3 font-bold text-white transition-opacity hover:opacity-90"
        >
          Drag them down
        </Link>
      </div>

      <Link href="/" className="mt-5 text-sm font-semibold text-muted-foreground hover:text-foreground">
        see the whole board →
      </Link>
    </main>
  );
}
