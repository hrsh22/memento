import { formatUnits, parseUnits } from "viem";
import type { SpendingLedger, SpendAssessment } from "./types";

export function assessSpending(
  ledger: SpendingLedger,
  input: {
    address: string;
    now: Date;
    feesUsdfc: string;
    depositUsdfc: string;
    feeLimitUsdfc: string;
    depositLimitUsdfc: string;
  },
): SpendAssessment {
  const windowDays = 30;
  const start = input.now.getTime() - windowDays * 86400000;
  if (!Number.isFinite(start) || !Number.isFinite(Date.parse(ledger.enabledAt)))
    throw new Error("Invalid spending ledger time.");
  const amounts = [
    input.feesUsdfc,
    input.depositUsdfc,
    input.feeLimitUsdfc,
    input.depositLimitUsdfc,
  ].map((value) => {
    if (!/^\d+(\.\d{1,18})?$/.test(value))
      throw new Error("Invalid spending amount.");
    return parseUnits(value, 18);
  });
  const [fees, deposit, feeCap, depositCap] = amounts;
  let usedFees = 0n,
    usedDeposits = 0n;
  const ids = new Set<string>();
  for (const entry of ledger.entries) {
    if (ids.has(entry.id)) throw new Error("Duplicate spending reservation.");
    ids.add(entry.id);
    const timestamp = Date.parse(entry.at);
    if (!Number.isFinite(timestamp))
      throw new Error("Invalid spending entry time.");
    if (
      entry.address.toLowerCase() !== input.address.toLowerCase() ||
      timestamp <= start
    )
      continue;
    // Future-dated entries remain charged, so a clock rollback cannot free funds.
    if (
      ![entry.feesUsdfc, entry.depositUsdfc].every((v) =>
        /^\d+(\.\d{1,18})?$/.test(v),
      )
    )
      throw new Error("Invalid spending entry.");
    usedFees += parseUnits(entry.feesUsdfc, 18);
    usedDeposits += parseUnits(entry.depositUsdfc, 18);
  }
  const allowed =
    usedFees + fees <= feeCap && usedDeposits + deposit <= depositCap;
  const reason =
    usedFees + fees > feeCap
      ? "The rolling 30-day operation-fee budget is exhausted. Defer this write."
      : usedDeposits + deposit > depositCap
        ? "The rolling 30-day reserve-funding budget is exhausted. Defer this top-up."
        : "This operation fits both rolling 30-day spending allowances.";
  return {
    allowed,
    reason,
    trackingSince: ledger.enabledAt,
    windowStart: new Date(
      Math.max(start, Date.parse(ledger.enabledAt)),
    ).toISOString(),
    windowDays,
    feeLimitUsdfc: formatUnits(feeCap, 18),
    depositLimitUsdfc: formatUnits(depositCap, 18),
    feesUsedUsdfc: formatUnits(usedFees, 18),
    depositsUsedUsdfc: formatUnits(usedDeposits, 18),
    requestedFeesUsdfc: formatUnits(fees, 18),
    requestedDepositUsdfc: formatUnits(deposit, 18),
  };
}
