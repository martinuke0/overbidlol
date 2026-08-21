import { NextResponse } from "next/server";
import { getActivity } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  const events = await getActivity(25);
  return NextResponse.json({ events }, { headers: { "cache-control": "public, max-age=3" } });
}
