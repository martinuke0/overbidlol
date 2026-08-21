"use client";

import { useEffect, useRef, useState } from "react";
import type { BoardPage } from "@/lib/db";
import { BoardRow } from "./BoardRow";

const TABS = [
  { key: "url", label: "URLs" },
  { key: "handle", label: "X" },
  { key: "all", label: "All" },
] as const;
export type Filter = (typeof TABS)[number]["key"];

// Windowed page numbers: 1 … 4 5 6 … 20
function pageItems(page: number, pages: number): (number | "…")[] {
  if (pages <= 7) return Array.from({ length: pages }, (_, i) => i + 1);
  const items: (number | "…")[] = [1];
  const start = Math.max(2, page - 1);
  const end = Math.min(pages - 1, page + 1);
  if (start > 2) items.push("…");
  for (let i = start; i <= end; i++) items.push(i);
  if (end < pages - 1) items.push("…");
  items.push(pages);
  return items;
}

export function Board({
  initialPage,
  filter,
  onFilter,
}: {
  initialPage: BoardPage;
  filter: Filter;
  onFilter: (f: Filter) => void;
}) {
  const [data, setData] = useState<BoardPage>(initialPage);
  const [page, setPage] = useState(1);
  // null until mounted so SSR and first client render match (avoids time-drift hydration mismatch).
  const [now, setNow] = useState<number | null>(null);
  const [fetchedAt, setFetchedAt] = useState(() => Date.now());
  const [secs, setSecs] = useState(0);
  const inFlight = useRef(false);

  const activeIndex = TABS.findIndex((t) => t.key === filter);

  async function load(f = filter, p = page) {
    if (inFlight.current) return;
    inFlight.current = true;
    try {
      const res = await fetch(`/api/board?tab=${f}&page=${p}`, { cache: "no-store" });
      const d = (await res.json()) as BoardPage;
      setData(d);
      if (d.page !== p) setPage(d.page); // clamp if page went out of range
      setFetchedAt(Date.now());
      setNow(Date.now());
    } catch {
      /* keep last board on transient error */
    } finally {
      inFlight.current = false;
    }
  }

  // Reset to page 1 whenever the category changes.
  useEffect(() => {
    setPage(1);
  }, [filter]);

  // Fetch on tab/page change.
  useEffect(() => {
    load(filter, page);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter, page]);

  // Poll the current page every 4s; tick the "refreshed" label every second.
  useEffect(() => {
    setNow(Date.now());
    const poll = setInterval(() => load(filter, page), 4000);
    const tick = setInterval(() => {
      setNow(Date.now());
      setSecs(Math.floor((Date.now() - fetchedAt) / 1000));
    }, 1000);
    return () => {
      clearInterval(poll);
      clearInterval(tick);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter, page, fetchedAt]);

  const rows = data.listings;

  return (
    <section id="board" className="mt-8">
      {/* Triple slider: URLs · X · All */}
      <div className="relative mx-auto mb-5 flex w-full max-w-[340px] rounded-full bg-muted p-1.5 text-sm font-semibold shadow-[inset_0_1px_3px_rgba(0,0,0,0.07)]">
        <span
          className="absolute inset-y-1.5 left-1.5 rounded-full bg-foreground shadow-sm will-change-transform"
          style={{
            width: "calc((100% - 0.75rem) / 3)",
            transform: `translateX(${activeIndex * 100}%)`,
            transition: "transform 0.42s cubic-bezier(0.34, 1.56, 0.64, 1)",
          }}
        />
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => onFilter(t.key)}
            className={`relative z-10 flex-1 rounded-full py-2 tracking-tight transition-colors duration-300 ${
              filter === t.key ? "text-background" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="mb-3 flex items-center justify-between px-1 text-sm text-muted-foreground">
        <span>Refreshed last {secs} second{secs === 1 ? "" : "s"} ago</span>
        <button
          onClick={() => load(filter, page)}
          className="font-semibold transition-colors hover:text-foreground"
        >
          Refresh
        </button>
      </div>

      <ol className="space-y-3 pt-1">
        {rows.map((row) => (
          <BoardRow key={row.id} row={row} now={now} rank={Number(row.rank)} />
        ))}
        {rows.length === 0 && (
          <li className="rounded-[--radius] border bg-card px-4 py-8 text-center text-muted-foreground">
            {filter === "handle"
              ? "No @handles on the board yet."
              : filter === "url"
                ? "No URLs on the board yet."
                : "The board is empty. Claim #1 for $1."}
          </li>
        )}
      </ol>

      {data.pages > 1 && (
        <nav className="mt-6 flex items-center justify-center gap-1.5 text-sm">
          <button
            disabled={page <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            className="rounded-lg px-2.5 py-1.5 font-semibold text-muted-foreground transition-colors hover:text-foreground disabled:opacity-30"
          >
            ‹
          </button>
          {pageItems(page, data.pages).map((it, i) =>
            it === "…" ? (
              <span key={`e${i}`} className="px-1.5 text-muted-foreground">
                …
              </span>
            ) : (
              <button
                key={it}
                onClick={() => setPage(it)}
                className={`min-w-8 rounded-lg px-2.5 py-1.5 font-semibold tabular-nums transition-colors ${
                  it === page
                    ? "bg-foreground text-background"
                    : "bg-muted text-muted-foreground hover:text-foreground"
                }`}
              >
                {it}
              </button>
            ),
          )}
          <button
            disabled={page >= data.pages}
            onClick={() => setPage((p) => Math.min(data.pages, p + 1))}
            className="rounded-lg px-2.5 py-1.5 font-semibold text-muted-foreground transition-colors hover:text-foreground disabled:opacity-30"
          >
            ›
          </button>
        </nav>
      )}
    </section>
  );
}
