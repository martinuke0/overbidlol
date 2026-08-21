"use client";

import { useEffect, useState } from "react";
import type { BoardRow } from "@/lib/db";
import { MIN_CENTS, STEP_CENTS } from "@/lib/bid";
import { Header } from "./Header";
import { BidForm } from "./BidForm";
import { DownbidForm } from "./DownbidForm";
import { Board, type Filter } from "./Board";
import { ActivityFeed } from "./ActivityFeed";

export function BoardApp({ initial }: { initial: BoardRow[] }) {
  const [mode, setMode] = useState<"overbid" | "downbid">("downbid");
  const [filter, setFilter] = useState<Filter>("handle");

  // Haters! flips the whole page to the dark theme by toggling `.dark` on <html>.
  useEffect(() => {
    document.documentElement.classList.toggle("dark", mode === "downbid");
    return () => document.documentElement.classList.remove("dark");
  }, [mode]);

  const down = mode === "downbid";

  // The price to be #1 depends on the selected category (slider tab) — uncapped.
  const catBids = initial
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
        <DownbidForm defaultLowerCents={downbidDefault} />
      ) : (
        <BidForm defaultCents={overbidDefault} bids={catBids} />
      )}

      <Board initial={initial} filter={filter} onFilter={setFilter} />
      <ActivityFeed />
    </>
  );
}
