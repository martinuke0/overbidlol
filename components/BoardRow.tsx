import type { BoardRow as Row } from "@/lib/db";
import { usd, timeAgo, displayName, faviconUrl } from "@/lib/format";
import { Favicon } from "./Favicon";

export function BoardRow({ row, now }: { row: Row; now: number | null }) {
  const name = displayName(row);
  const favicon = faviconUrl(row);
  const letter = name.replace(/^@/, "").charAt(0).toUpperCase() || "?";

  return (
    <li className="group flex items-center gap-3 rounded-2xl border border-primary/15 bg-primary/[0.04] px-3 py-3 sm:px-4">
      <span className="inline-flex shrink-0 items-center justify-center rounded-lg bg-foreground px-2.5 py-1 text-sm font-bold tabular-nums text-background">
        #{row.rank}
      </span>

      <span className="flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-xl border bg-card text-sm font-bold text-muted-foreground">
        <Favicon src={favicon} letter={letter} />
      </span>

      <div className="min-w-0 flex-1">
        <a
          href={`/r/${row.id}`}
          target="_blank"
          rel="noopener nofollow"
          className="font-semibold text-foreground hover:text-primary hover:underline"
        >
          {name}
        </a>
        {row.description && (
          <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
            {row.description}
          </p>
        )}
        <p className="mt-0.5 text-xs text-muted-foreground" suppressHydrationWarning>
          {now !== null && `${timeAgo(row.updated_at, now)} · `}
          <span className="font-semibold text-foreground">
            {row.click_count.toLocaleString()} clicks
          </span>
        </p>
      </div>

      <div className="shrink-0 pl-1 text-right">
        <div className="text-lg font-bold tabular-nums text-primary">{usd(row.bid_cents)}</div>
      </div>
    </li>
  );
}
