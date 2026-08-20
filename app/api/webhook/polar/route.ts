import { Webhooks } from "@polar-sh/nextjs";
import { resolveIntentId } from "@/lib/checkout";
import { runApply } from "@/lib/db";

// order.paid is the ONLY source of truth. Never list on checkout.created/updated.
export const POST = Webhooks({
  webhookSecret: process.env.POLAR_WEBHOOK_SECRET!,
  onOrderPaid: async (payload) => {
    const order = payload.data as {
      id: string;
      checkoutId?: string | null;
      metadata?: Record<string, string>;
      netAmount?: number;
      subtotalAmount?: number;
    };
    const intentId = await resolveIntentId(order);
    // netAmount = pre-tax amount actually paid = the bid. Fall back to subtotal.
    const paidCents = order.netAmount ?? order.subtotalAmount ?? 0;
    await runApply(intentId, order.id, paidCents);
  },
});
