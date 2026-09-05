import { formatUnits, parseUnits } from "viem";
import { planMemories } from "../agent/engine";
import { budgetGate } from "../agent/gate";
import { assessSpending } from "../agent/spending";
import { DEFAULT_POLICY, SEED_MEMORIES } from "../agent/memories";
import { policySchema } from "../agent/schema";
import type { DecisionPlan, LiveDecision, Policy } from "../agent/types";
import { readChain } from "./filecoin";
import { readState } from "./store";

const BASIS =
  "By design this deployment holds no private key, so no visitor can make it spend. Decisions here are read-only evaluations of live Filecoin Pay state through the same policy engine and budget gate the funded worker uses; signed transactions are only ever executed by that local worker. Recurring cost is projected from the onchain price list, and the worker additionally obtains an exact Synapse quote for the serialized archive and resolved provider contexts before broadcasting.";

/** The gate compares integer base units, so every projection crosses over as 18-decimal units. */
function units(value: number): bigint {
  if (!Number.isFinite(value)) throw new Error("Projection is not finite.");
  return parseUnits(Math.max(0, value).toFixed(18), 18);
}

export interface ProjectionInput {
  plan: DecisionPlan;
  policy: Policy;
  existingMonthlyUsdfc: number;
  availableUsdfc: number;
  walletUsdfc: string;
  walletFil: string;
  maxTopUpUsdfc: string;
}

/** Pure: turns a plan plus live account figures into the numbers the gate judges. */
export function projectDecision(input: ProjectionInput) {
  const { plan, policy } = input;
  // Filecoin Pay locks the recurring rate across the reserve window. Only the rate the
  // plan adds needs new lockup; one-time operation fees are due on top of it.
  const additionalLockup = Math.max(
    0,
    (plan.plannedMonthly - input.existingMonthlyUsdfc) *
      (policy.reserveDays / 30),
  );
  const depositNeeded = Math.max(
    0,
    additionalLockup + plan.plannedFees - input.availableUsdfc,
  );
  const projection = {
    payloadBytes: plan.retainedBytes,
    projectedMonthlyUsdfc: formatUnits(units(plan.plannedMonthly), 18),
    additionalLockupUsdfc: formatUnits(units(additionalLockup), 18),
    operationFeesUsdfc: formatUnits(units(plan.plannedFees), 18),
    depositNeededUsdfc: formatUnits(units(depositNeeded), 18),
  };
  const gate = budgetGate({
    projectedRate: units(plan.plannedMonthly),
    monthlyCap: units(policy.maxMonthlyUsdfc),
    depositNeeded: units(depositNeeded),
    walletBalance: parseUnits(input.walletUsdfc, 18),
    maxTopUp: parseUnits(input.maxTopUpUsdfc, 18),
    gasBalance: parseUnits(input.walletFil, 18),
  });
  return { projection, gate };
}

export async function decideLive(
  overrides: Partial<Policy> = {},
): Promise<LiveDecision> {
  const policy = policySchema.parse({ ...DEFAULT_POLICY, ...overrides });
  const snapshot = await readChain();
  const existingMonthlyUsdfc = Number(snapshot.monthlyRate);
  const availableUsdfc = Number(snapshot.availableFunds);
  const plan = planMemories(
    SEED_MEMORIES,
    {
      availableUsdfc,
      existingMonthlyUsdfc,
      ...snapshot.prices,
      copies: 2,
      newDataset: snapshot.rails.length === 0,
    },
    policy,
  );
  const { projection, gate } = projectDecision({
    plan,
    policy,
    existingMonthlyUsdfc,
    availableUsdfc,
    walletUsdfc: snapshot.walletUsdfc,
    walletFil: snapshot.walletFil,
    maxTopUpUsdfc: process.env.AGENT_MAX_TOPUP_USDFC || "2",
  });
  // The rolling allowance only gates writes the recurring-cost gate already cleared.
  const ledger = (await readState()).spendingLedger;
  const spending =
    gate.allowed && ledger
      ? assessSpending(ledger, {
          address: snapshot.address,
          now: new Date(),
          feesUsdfc: projection.operationFeesUsdfc,
          depositUsdfc: projection.depositNeededUsdfc,
          feeLimitUsdfc: process.env.AGENT_MAX_ROLLING_FEES_USDFC || "0.10",
          depositLimitUsdfc: process.env.AGENT_MAX_ROLLING_TOPUPS_USDFC || "2",
        })
      : undefined;
  const allowed = gate.allowed && (spending?.allowed ?? true);
  return {
    decidedAt: new Date().toISOString(),
    snapshot,
    policy,
    plan,
    projection,
    gate,
    spending,
    verdict: allowed ? "store" : "refuse",
    headline:
      allowed || !gate.allowed || !spending ? gate.reason : spending.reason,
    basis: BASIS,
  };
}
