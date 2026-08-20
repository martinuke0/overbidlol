/** Pure bid math — the money path. Kept dependency-free so it's unit-testable. */

export const MIN_CENTS = 100; // $1 minimum
export const STEP_CENTS = 25; // $0.25 increments

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
  if (!Number.isInteger(targetCents)) throw new Error("Amount must be in cents");
  if (existingBidCents == null) {
    if (targetCents < MIN_CENTS) throw new Error("Minimum bid is $1");
    return targetCents;
  }
  if (targetCents <= existingBidCents) {
    throw new Error(`Must beat your current $${(existingBidCents / 100).toFixed(2)}`);
  }
  return targetCents - existingBidCents;
}

/** UI helper: dollars needed to take rank N (one step above that row). */
export function toTakeRankCents(rowBidCents: number): number {
  return rowBidCents + STEP_CENTS;
}

export const HATER_TAX = 0.25; // 25% surcharge to downbid someone

/** What a hater pays to lower a target by `lowerCents` (reduction + 25% tax). */
export function downbidPayCents(lowerCents: number): number {
  if (!Number.isInteger(lowerCents) || lowerCents < MIN_CENTS) {
    throw new Error("Minimum downbid is $1");
  }
  return Math.round(lowerCents * (1 + HATER_TAX));
}
