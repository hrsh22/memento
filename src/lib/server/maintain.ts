import { formatUnits, parseUnits } from "viem";
import { budgetGate } from "../agent/gate";
import type { Receipt } from "../agent/types";
import { getSynapse, readChain } from "./filecoin";
import { addEvent, readState, saveReceipt, writeState } from "./store";
/** Duplicate content still gets treasury health checks: idempotence must not
 * disable reserve maintenance when no new memories arrive. */
export async function maintainReserve(receipt: Receipt): Promise<Receipt> {
  const { snapshot, plan } = receipt;
  if (
    snapshot.runwayDays === null ||
    snapshot.runwayDays >= plan.policy.reserveDays
  ) {
    receipt.reason =
      "The same memories already have a verified archive and the reserve remains healthy. Prevent a duplicate paid write.";
    await addEvent("act", "Duplicate write prevented", receipt.reason);
    await saveReceipt(receipt);
    return receipt;
  }
  const rate = BigInt(snapshot.ratePerEpoch);
  const target = rate * BigInt(plan.policy.reserveDays + 2) * 2880n;
  const available = parseUnits(snapshot.availableFunds, 18);
  const deposit =
    (target > available ? target - available : 0n) +
    parseUnits(snapshot.debt, 18);
  const gate = budgetGate({
    projectedRate: rate * 86400n,
    monthlyCap: parseUnits(plan.policy.maxMonthlyUsdfc.toString(), 18),
    depositNeeded: deposit,
    walletBalance: parseUnits(snapshot.walletUsdfc, 18),
    maxTopUp: parseUnits(process.env.AGENT_MAX_TOPUP_USDFC || "2", 18),
    gasBalance: parseUnits(snapshot.walletFil, 18),
  });
  receipt.reason = gate.reason;
  await addEvent(
    "decide",
    "Existing memories still need a budget",
    `Runway ${snapshot.runwayDays.toFixed(2)} days is below the ${plan.policy.reserveDays}-day reserve. ${gate.reason}`,
  );
  if (!gate.allowed) {
    await saveReceipt(receipt);
    return receipt;
  }
  receipt.action = "pending";
  receipt.broadcastAttempted = true;
  await saveReceipt(receipt);
  const synapse = getSynapse(true);
  const hash = await synapse.payments.depositWithPermit({ amount: deposit });
  receipt.depositTx = hash;
  await saveReceipt(receipt);
  const tx = await synapse.readClient.waitForTransactionReceipt({ hash });
  if (tx.status !== "success") throw new Error("Reserve top-up reverted.");
  receipt.action = "funded";
  receipt.reason = `Autonomously added ${formatUnits(deposit, 18)} tUSDFC to protect existing memory rails. No duplicate archive was uploaded.`;
  await addEvent("act", "Existing memory reserve restored", receipt.reason);
  const state = await readState();
  state.lastSnapshot = await readChain();
  await writeState(state);
  await saveReceipt(receipt);
  return receipt;
}
