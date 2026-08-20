"use client";

import { useEffect, useRef, useState } from "react";
import type { BoardRow as Row } from "@/lib/db";
import { BoardRow } from "./BoardRow";

const TABS = [
  { key: "url", label: "URLs" },
  { key: "all", label: "All" },
  { key: "handle", label: "X" },
] as const;
type Filter = (typeof TABS)[number]["key"];

export function Board({ initial }: { initial: Row[] }) {
  const [rows, setRows] = useState(initial);
  const [filter, setFilter] = useState<Filter>("all");
  // null until mounted so SSR and first client render match (avoids time-drift hydration mismatch).
  const [now, setNow] = useState<number | null>(null);
  const [fetchedAt, setFetchedAt] = useState(() => Date.now());
  const [secs, setSecs] = useState(0);
  const inFlight = useRef(false);

  const shown = rows.filter((r) => filter === "all" || r.identity_kind === filter);
  const activeIndex = TABS.findIndex((t) => t.key === filter);

  async function refresh() {
    if (inFlight.current) return;
    inFlight.current = true;
    try {
      const res = await fetch("/api/board", { cache: "no-store" });
      const data = await res.json();
      setRows(data.listings);
      setFetchedAt(Date.now());
      setNow(Date.now());
    } catch {
      /* keep last board on transient error */
    } finally {
      inFlight.current = false;
    }
  }

  // Poll every 4s; tick the "refreshed N seconds ago" label every second.
  useEffect(() => {
    setNow(Date.now());
    const poll = setInterval(refresh, 4000);
    const tick = setInterval(() => {
      setNow(Date.now());
      setSecs(Math.floor((Date.now() - fetchedAt) / 1000));
    }, 1000);
    return () => {
      clearInterval(poll);
      clearInterval(tick);
    };
  }, [fetchedAt]);

  return (
    <section id="board" className="mt-8">
      {/* Triple slider: URLs · All · X */}
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
            onClick={() => setFilter(t.key)}
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
        <button onClick={refresh} className="font-semibold transition-colors hover:text-foreground">
          Refresh
        </button>
      </div>
      <ol className="space-y-3 pt-1">
        {shown.map((row, i) => (
          <BoardRow key={row.id} row={row} now={now} rank={i + 1} />
        ))}
        {shown.length === 0 && (
          <li className="rounded-[--radius] border bg-card px-4 py-8 text-center text-muted-foreground">
            {filter === "handle"
              ? "No @handles on the board yet."
              : filter === "url"
                ? "No URLs on the board yet."
                : "The board is empty. Claim #1 for $1."}
          </li>
        )}
      </ol>
    </section>
  );
}
