import { NextResponse } from "next/server";
import { createCheckout } from "@/lib/checkout";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const clientIp = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
    const { url } = await createCheckout({ body, clientIp });
    return NextResponse.json({ url });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Checkout failed";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
