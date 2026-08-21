"use client";

import { useEffect, useState } from "react";
import type { ActivityRow } from "@/lib/db";
import { usd, timeAgo } from "@/lib/format";

export function ActivityFeed() {
  const [events, setEvents] = useState<ActivityRow[]>([]);
  const [now, setNow] = useState<number | null>(null);

  useEffect(() => {
    setNow(Date.now());
    const load = () =>
      fetch("/api/activity", { cache: "no-store" })
        .then((r) => r.json())
        .then((d) => setEvents(d.events ?? []))
        .catch(() => {});
    load();
    const poll = setInterval(load, 5000);
    const tick = setInterval(() => setNow(Date.now()), 1000);
    return () => {
      clearInterval(poll);
      clearInterval(tick);
    };
  }, []);

  return (
    <aside className="mt-10 xl:fixed xl:right-6 xl:top-24 xl:mt-0 xl:w-72">
      <div className="mb-3 flex items-center gap-2 px-1">
        <span className="relative inline-flex size-2">
          <span className="absolute inline-flex size-full animate-ping rounded-full bg-live opacity-75 motion-reduce:animate-none" />
          <span className="relative inline-flex size-2 rounded-full bg-live" />
        </span>
        <span className="text-sm font-bold tracking-tight text-foreground">Live</span>
        <span className="text-sm text-muted-foreground">· what just happened</span>
      </div>

      <ol className="space-y-2 xl:max-h-[70vh] xl:overflow-auto">
        {events.map((e) => {
          const down = e.kind === "downbid";
          return (
            <li
              key={e.id}
              className="flex items-start gap-2.5 rounded-xl border border-primary/15 bg-primary/[0.03] px-3 py-2.5"
            >
              <span
                className={`mt-0.5 shrink-0 text-sm font-bold ${down ? "text-destructive" : "text-primary"}`}
              >
                {down ? "▼" : "▲"}
              </span>
              <div className="min-w-0 flex-1">
                <div className="truncate text-sm font-semibold text-foreground">{e.label}</div>
                <div className="text-xs text-muted-foreground">
                  {e.note || (down ? "dragged down" : "overbid")}
                </div>
                <div className="mt-0.5 text-[11px] text-muted-foreground">
                  {down ? "−" : "+"}
                  {usd(e.amount_cents)}
                  {now !== null && ` · ${timeAgo(e.created_at, now)}`}
                </div>
              </div>
            </li>
          );
        })}
        {events.length === 0 && (
          <li className="rounded-xl border border-primary/15 bg-primary/[0.03] px-3 py-4 text-center text-xs text-muted-foreground">
            Quiet for now. Be the first to strike.
          </li>
        )}
      </ol>
    </aside>
  );
}
