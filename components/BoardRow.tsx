import type { BoardRow as Row } from "@/lib/db";
import { usd, timeAgo, displayName, faviconUrl } from "@/lib/format";
import { toTakeRankCents } from "@/lib/bid";
import { Favicon } from "./Favicon";
import { EditBio } from "./EditBio";
import { ShareButton } from "./ShareButton";

export function BoardRow({ row, now, rank }: { row: Row; now: number | null; rank: number }) {
  const name = displayName(row);
  const favicon = faviconUrl(row);
  const letter = name.replace(/^@/, "").charAt(0).toUpperCase() || "?";
  const isTop = rank === 1;
  const editTarget = row.handle ?? row.url ?? row.identity_key;

  return (
    <li
      className={`group relative rounded-2xl px-3 py-4 transition-colors sm:px-5 ${
        isTop
          ? "gold-ring border border-transparent bg-primary/[0.07]"
          : "border border-primary/15 bg-primary/[0.03] hover:border-primary/40 hover:bg-primary/[0.07]"
      }`}
    >
      {/* Stretched link: whole card → out to the listing. Interactive bits below sit above it (z-10). */}
      <a
        href={`/r/${row.id}`}
        target="_blank"
        rel="noopener nofollow"
        aria-label={name}
        className="absolute inset-0 z-0 rounded-2xl"
      />

      {/* Floats above the card on hover — the next step up to take this rank. */}
      <span className="pointer-events-none absolute -top-3 left-1/2 z-10 -translate-x-1/2 rounded-full bg-primary px-3 py-1 text-xs font-semibold whitespace-nowrap text-primary-foreground opacity-0 shadow-sm transition-opacity group-hover:opacity-100">
        claim this rank for {usd(toTakeRankCents(row.bid_cents))}
      </span>

      <div className="flex items-center gap-4">
        <span className="inline-flex shrink-0 items-center justify-center rounded-lg bg-foreground px-3 py-1.5 text-sm font-bold tabular-nums text-background">
          #{rank}
        </span>

        <span className="flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-xl border bg-card text-base font-bold text-muted-foreground">
          <Favicon src={favicon} letter={letter} />
        </span>

        <div className="min-w-0 flex-1">
          <span className="block text-base font-semibold text-foreground transition-colors group-hover:text-primary">
            {name}
          </span>
          {row.description && (
            <p className="line-clamp-2 text-[15px] leading-snug text-muted-foreground">
              {row.description}
            </p>
          )}
          <p className="mt-1 text-xs text-muted-foreground" suppressHydrationWarning>
            {now !== null && `${timeAgo(row.updated_at, now)} · `}
            <span className="font-semibold text-foreground">
              {row.click_count.toLocaleString()} clicks
            </span>
          </p>
          {/* Above the stretched link so they're independently clickable. */}
          <div className="relative z-10 mt-1 flex flex-wrap items-center gap-x-4 gap-y-1">
            <EditBio target={editTarget} />
            <ShareButton id={row.id} name={name} rank={rank} />
          </div>
        </div>

        <div className="shrink-0 self-start pl-2 text-right">
          <div className="text-xl font-bold tabular-nums text-primary">{usd(row.bid_cents)}</div>
        </div>
      </div>
    </li>
  );
}
