"use client";

import { useEffect, useState } from "react";
import type { BoardRow } from "@/lib/db";
import { Header } from "./Header";
import { BidForm } from "./BidForm";
import { DownbidForm } from "./DownbidForm";
import { Board } from "./Board";

export function BoardApp({
  initial,
  defaultCents,
  bids,
}: {
  initial: BoardRow[];
  defaultCents: number;
  bids: number[];
}) {
  const [mode, setMode] = useState<"overbid" | "downbid">("overbid");

  // Haters! flips the whole page to the dark theme by toggling `.dark` on <html>.
  useEffect(() => {
    document.documentElement.classList.toggle("dark", mode === "downbid");
    return () => document.documentElement.classList.remove("dark");
  }, [mode]);

  const down = mode === "downbid";

  return (
    <>
      <Header mode={mode} />

      <div className="mb-6 flex justify-center">
        <button
          type="button"
          onClick={() => setMode(down ? "overbid" : "downbid")}
          className={`inline-flex items-center gap-2 rounded-full border border-transparent px-5 py-2 text-sm font-extrabold tracking-tight uppercase transition-transform hover:scale-105 ${
            down
              ? "bg-white text-black shadow-sm"
              : "hater-btn bg-[#ff1f2e] text-white"
          }`}
        >
          {down ? "😇 Angels!" : "😈 Haters!"}
        </button>
      </div>

      {down ? (
        <DownbidForm defaultLowerCents={bids.length ? Math.max(...bids) : 100} />
      ) : (
        <BidForm defaultCents={defaultCents} bids={bids} />
      )}

      <Board initial={initial} />
    </>
  );
}
