export interface GateInput {
  projectedRate: bigint;
  monthlyCap: bigint;
  depositNeeded: bigint;
  walletBalance: bigint;
  maxTopUp: bigint;
  gasBalance: bigint;
}
/** All spending comparisons use integer token units. */
export function budgetGate(input: GateInput): {
  allowed: boolean;
  reason: string;
} {
  if (Object.values(input).some((v) => v < 0n))
    return { allowed: false, reason: "Financial inputs must be nonnegative." };
  if (input.projectedRate > input.monthlyCap)
    return {
      allowed: false,
      reason: "The projected recurring cost exceeds the monthly spending cap.",
    };
  if (input.depositNeeded > input.maxTopUp)
    return {
      allowed: false,
      reason: "The required deposit exceeds the autonomous top-up limit.",
    };
  if (input.depositNeeded > input.walletBalance)
    return {
      allowed: false,
      reason: "The wallet cannot fund the reserve needed for this upload.",
    };
  if (input.gasBalance < 10n ** 14n)
    return {
      allowed: false,
      reason: "The wallet needs test FIL for transaction gas.",
    };
  return {
    allowed: true,
    reason:
      input.depositNeeded > 0n
        ? "The archive fits the monthly cap. Top up the reserve from the test wallet, then store."
        : "Existing funds cover the reserve. Store without topping up.",
  };
}
