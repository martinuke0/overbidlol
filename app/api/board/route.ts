import { NextResponse } from "next/server";
import { getBoardPage } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const sp = new URL(req.url).searchParams;
  const tab = sp.get("tab") ?? "all";
  const page = parseInt(sp.get("page") ?? "1", 10) || 1;
  const data = await getBoardPage({ tab, page });
  return NextResponse.json(data, { headers: { "cache-control": "public, max-age=2" } });
}
