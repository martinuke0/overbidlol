/**
 * POST /api/webhook/polar
 *
 * Source of truth = order.paid.
 * Never insert a listing on checkout.created / checkout.updated.
 */
import { Polar } from "@polar-sh/sdk";
import { Webhooks } from "@polar-sh/nextjs";

const polar = new Polar({
  accessToken: process.env.POLAR_ACCESS_TOKEN!,
  server: process.env.POLAR_SERVER === "sandbox" ? "sandbox" : "production",
});

type OrderLike = {
  id: string;
  checkoutId?: string | null;
  metadata?: Record<string, string | number | boolean> | null;
};

export const POST = Webhooks({
  webhookSecret: process.env.POLAR_WEBHOOK_SECRET!,
  onOrderPaid: async (payload) => {
    await applyPaidOrder(payload.data as OrderLike);
  },
});

export async function resolveIntentId(order: OrderLike): Promise<string> {
  const fromMeta = order.metadata?.intent_id;
  if (typeof fromMeta === "string" && fromMeta.length > 0) return fromMeta;

  if (!order.checkoutId) {
    throw new Error("order missing checkoutId and metadata.intent_id");
  }

  const checkout = await polar.checkouts.get({ id: order.checkoutId });
  const id = checkout.metadata?.intent_id;
  if (typeof id !== "string" || !id) {
    throw new Error("checkout missing metadata.intent_id");
  }
  return id;
}

/**
 * Wire this to a transaction that runs snippets/apply-paid-order.sql
 * Parameters: intent_id, polar_order_id
 */
export async function applyPaidOrder(
  order: OrderLike,
  runApply?: (intentId: string, polarOrderId: string) => Promise<void>,
): Promise<void> {
  const intentId = await resolveIntentId(order);
  if (!runApply) {
    console.log("applyPaidOrder: wire runApply", { intentId, orderId: order.id });
    return;
  }
  await runApply(intentId, order.id);
}
