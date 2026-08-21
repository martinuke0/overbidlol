import { BoardApp } from "@/components/BoardApp";
import { getBoard } from "@/lib/db";
import { MIN_CENTS, STEP_CENTS } from "@/lib/bid";

export const dynamic = "force-dynamic";

export default async function Home() {
  const listings = await getBoard(100);
  const topBidCents = listings[0]?.bid_cents ?? 0;
  const defaultCents = Math.max(MIN_CENTS, topBidCents + STEP_CENTS);

  return (
    <main className="mx-auto w-full max-w-3xl grow px-4 py-10 sm:py-14">
      <h1 className="sr-only">
        overbid.lol — the pay-to-rank leaderboard where your bid is your rank. Overbid to take #1,
        or downbid to drag a rival down.
      </h1>
      <BoardApp
        initial={listings}
        defaultCents={defaultCents}
        bids={listings.map((l) => l.bid_cents)}
      />
      <footer className="mt-12 text-center text-xs text-muted-foreground">
        Rank is the bid. Bids are in US dollars, $0.25 at a time. A completed payment claims the rank.
        <div className="mt-2">
          <a href="/rules" className="font-semibold transition-colors hover:text-foreground">
            Rules
          </a>
        </div>
        <div className="mt-4">© 2026. All rights reserved.</div>
      </footer>
    </main>
  );
}
