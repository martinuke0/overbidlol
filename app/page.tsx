import { Header } from "@/components/Header";
import { BidForm } from "@/components/BidForm";
import { Board } from "@/components/Board";
import { getBoard } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function Home() {
  const listings = await getBoard(100);
  const topBidCents = listings[0]?.bid_cents ?? 0;
  const nextToClaimDollars = Math.round(topBidCents / 100) + 1 || 1;

  return (
    <main className="mx-auto w-full max-w-3xl grow px-4 py-10 sm:py-14">
      <Header />
      <BidForm
        defaultDollars={Math.max(1, nextToClaimDollars)}
        devMode={process.env.NODE_ENV !== "production"}
      />
      <Board initial={listings} />
      <footer className="mt-12 text-center text-xs text-muted-foreground">
        Rank is the bid. Bids are whole US dollars. A completed payment claims the rank.
        <div className="mt-2">
          <a href="/rules" className="font-semibold transition-colors hover:text-foreground">
            Rules
          </a>
        </div>
      </footer>
    </main>
  );
}
