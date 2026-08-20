import { NextResponse } from "next/server";
import { getBoard } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  const listings = await getBoard(100);
  const top = listings[0]?.bid_cents ?? 0;
  return NextResponse.json(
    { listings, next_to_claim_1_cents: top + 100 },
    { headers: { "cache-control": "public, max-age=2" } },
  );
}
