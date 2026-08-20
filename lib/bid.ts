/** Pure bid math — the money path. Kept dependency-free so it's unit-testable. */

export const MIN_CENTS = 100; // $1 minimum
export const STEP_CENTS = 100; // whole dollars

/**
 * What the buyer owes Polar right now.
 * - new listing  → pay the whole target
 * - same identity (upbid) → pay only the difference
 * Throws on an invalid target (below min, or not beating your current bid).
 */
export function computePayCents(
  targetCents: number,
  existingBidCents: number | null,
): number {
  if (!Number.isInteger(targetCents)) throw new Error("Amount must be whole dollars");
  if (existingBidCents == null) {
    if (targetCents < MIN_CENTS) throw new Error("Minimum bid is $1");
    return targetCents;
  }
  if (targetCents <= existingBidCents) {
    throw new Error(`Must beat your current $${Math.round(existingBidCents / 100)}`);
  }
  return targetCents - existingBidCents;
}

/** UI helper: dollars needed to take rank N (one step above that row). */
export function toTakeRankCents(rowBidCents: number): number {
  return rowBidCents + STEP_CENTS;
}
