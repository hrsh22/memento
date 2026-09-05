import { assessSpending } from "../agent/spending";
import type { Receipt } from "../agent/types";
import { readState, writeState } from "./store";

/** Called only under the worker lock. Budgets start at rollout, not retroactively. */
export async function checkSpending(
  receipt: Receipt,
  feesUsdfc: string,
  depositUsdfc: string,
) {
  const state = await readState();
  if (!state.spendingLedger) {
    if (state.receipts.some((r) => r.spending))
      throw new Error(
        "Spending history is missing. Restore the ledger before continuing.",
      );
    state.spendingLedger = { enabledAt: new Date().toISOString(), entries: [] };
    await writeState(state);
  }
  receipt.spending = assessSpending(state.spendingLedger, {
    address: receipt.address,
    now: new Date(),
    feesUsdfc,
    depositUsdfc,
    feeLimitUsdfc: process.env.AGENT_MAX_ROLLING_FEES_USDFC || "0.10",
    depositLimitUsdfc: process.env.AGENT_MAX_ROLLING_TOPUPS_USDFC || "2",
  });
  return receipt.spending;
}

/** Reserve the full quoted amount before any broadcast. Failed/uncertain writes
 * remain charged until explicit reconciliation; a retry cannot reset the ledger. */
export async function reserveSpending(receipt: Receipt) {
  const decision = receipt.spending;
  if (!decision?.allowed)
    throw new Error("Spending must pass before reserving.");
  const state = await readState();
  if (!state.spendingLedger) throw new Error("Spending ledger is missing.");
  if (state.spendingLedger.entries.some((e) => e.id === receipt.id)) return;
  state.spendingLedger.entries.push({
    id: receipt.id,
    address: receipt.address,
    at: new Date().toISOString(),
    feesUsdfc: decision.requestedFeesUsdfc,
    depositUsdfc: decision.requestedDepositUsdfc,
  });
  await writeState(state);
}
