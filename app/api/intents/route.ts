import { NextResponse } from "next/server";
import { getIntentByCheckoutId } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const checkoutId = new URL(req.url).searchParams.get("checkout_id");
  if (!checkoutId) return NextResponse.json({ error: "checkout_id required" }, { status: 400 });
  const intent = await getIntentByCheckoutId(checkoutId);
  if (!intent) return NextResponse.json({ status: "unknown" });
  return NextResponse.json(intent);
}
