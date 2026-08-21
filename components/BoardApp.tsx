"use client";

import { useEffect, useState } from "react";
import type { BoardPage } from "@/lib/db";
import { MIN_CENTS, STEP_CENTS } from "@/lib/bid";
import { Header } from "./Header";
import { BidForm } from "./BidForm";
import { DownbidForm } from "./DownbidForm";
import { Board, type Filter } from "./Board";
import { ActivityFeed } from "./ActivityFeed";

type Bid = { identity_kind: "url" | "handle"; bid_cents: number };

export function BoardApp({
  initialPage,
  allBids,
  initialMode,
  initialTarget,
}: {
  initialPage: BoardPage;
  allBids: Bid[];
  initialMode?: "overbid" | "downbid";
  initialTarget?: string;
}) {
  const [mode, setMode] = useState<"overbid" | "downbid">(initialMode ?? "overbid");
  const [filter, setFilter] = useState<Filter>("handle");

  // Haters! flips the whole page to the dark theme by toggling `.dark` on <html>.
  useEffect(() => {
    document.documentElement.classList.toggle("dark", mode === "downbid");
    return () => document.documentElement.classList.remove("dark");
  }, [mode]);

  const down = mode === "downbid";

  // The price to be #1 depends on the selected category (slider tab) — uncapped.
  const catBids = allBids
    .filter((l) => filter === "all" || l.identity_kind === filter)
    .map((l) => l.bid_cents);
  const catTop = catBids.length ? Math.max(...catBids) : 0;
  const overbidDefault = Math.max(MIN_CENTS, catTop + STEP_CENTS);
  const downbidDefault = Math.max(MIN_CENTS, catTop);

  return (
    <>
      <Header mode={mode} />

      <div className="mb-6 flex justify-center">
        <button
          type="button"
          onClick={() => setMode(down ? "overbid" : "downbid")}
          className={`inline-flex items-center gap-2 rounded-full border border-transparent px-5 py-2 text-sm font-extrabold tracking-tight uppercase transition-transform hover:scale-105 ${
            down ? "bg-white text-black shadow-sm" : "hater-btn bg-[#ff1f2e] text-white"
          }`}
        >
          {down ? "😇 Angels!" : "😈 Haters!"}
        </button>
      </div>

      {down ? (
        <DownbidForm defaultLowerCents={downbidDefault} initialTarget={initialTarget} />
      ) : (
        <BidForm defaultCents={overbidDefault} bids={catBids} initialTarget={initialTarget} />
      )}

      <Board initialPage={initialPage} filter={filter} onFilter={setFilter} />
      <ActivityFeed />
    </>
  );
}
