"use client";

import { useEffect, useRef, useState } from "react";
import type { BoardRow as Row } from "@/lib/db";
import { BoardRow } from "./BoardRow";

export function Board({ initial }: { initial: Row[] }) {
  const [rows, setRows] = useState(initial);
  // null until mounted so SSR and first client render match (avoids time-drift hydration mismatch).
  const [now, setNow] = useState<number | null>(null);
  const [fetchedAt, setFetchedAt] = useState(() => Date.now());
  const [secs, setSecs] = useState(0);
  const inFlight = useRef(false);

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
      <div className="mb-3 flex items-center justify-between px-1 text-sm text-muted-foreground">
        <span>Refreshed last {secs} second{secs === 1 ? "" : "s"} ago</span>
        <button onClick={refresh} className="font-semibold transition-colors hover:text-foreground">
          Refresh
        </button>
      </div>
      <ol className="space-y-3 pt-1">
        {rows.map((row) => (
          <BoardRow key={row.id} row={row} now={now} />
        ))}
        {rows.length === 0 && (
          <li className="rounded-[--radius] border bg-card px-4 py-8 text-center text-muted-foreground">
            The board is empty. Claim #1 for $1.
          </li>
        )}
      </ol>
    </section>
  );
}
