import { NextResponse } from "next/server";
import { recordVisit } from "@/lib/db";

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const visitor = typeof body.visitor === "string" ? body.visitor : "";
  if (visitor) await recordVisit(visitor);
  return NextResponse.json({ ok: true });
}
