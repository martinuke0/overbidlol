import { Webhooks } from "@polar-sh/nextjs";
import { resolveIntentId } from "@/lib/checkout";
import { runApply } from "@/lib/db";

// order.paid is the ONLY source of truth. Never list on checkout.created/updated.
export const POST = Webhooks({
  webhookSecret: process.env.POLAR_WEBHOOK_SECRET!,
  onOrderPaid: async (payload) => {
    const order = payload.data as { id: string; checkoutId?: string | null; metadata?: Record<string, string> };
    const intentId = await resolveIntentId(order);
    await runApply(intentId, order.id);
  },
});
