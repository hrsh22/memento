import { createHash, randomUUID } from "node:crypto";
import { readFile } from "node:fs/promises";
import { formatUnits, parseUnits } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { planMemories } from "../agent/engine";
import { budgetGate } from "../agent/gate";
import { DEFAULT_POLICY, SEED_MEMORIES } from "../agent/memories";
import type { Memory, Policy, Receipt } from "../agent/types";
import { getSynapse, readChain } from "./filecoin";
import {
  addEvent,
  readState,
  saveReceipt,
  withAgentLock,
  writeState,
} from "./store";
export const sha256 = (value: string | Uint8Array) =>
  createHash("sha256").update(value).digest("hex");
export async function runCycle(
  policy: Policy = DEFAULT_POLICY,
  memories: Memory[] = SEED_MEMORIES,
): Promise<Receipt> {
  return withAgentLock(async () => {
    let state = await readState();
    state.running = true;
    state.lastError = undefined;
    await writeState(state);
    let receipt: Receipt | undefined;
    try {
      await addEvent(
        "observe",
        "Reading my storage treasury",
        "Querying Filecoin Pay account summary, wallet balances, payment rails, and the onchain price list.",
      );
      const snapshot = await readChain();
      state = await readState();
      state.lastSnapshot = snapshot;
      await writeState(state);
      const plan = planMemories(
        memories,
        {
          availableUsdfc: Number(snapshot.availableFunds),
          existingMonthlyUsdfc: Number(snapshot.monthlyRate),
          ...snapshot.prices,
          copies: 2,
          newDataset: snapshot.rails.length === 0,
        },
        policy,
      );
      // The original hash is attached before the bundle is signed or uploaded.
      plan.decisions.forEach((d) => {
        d.sourceHash = sha256(memories.find((m) => m.id === d.id)!.content);
      });
      receipt = {
        id: randomUUID(),
        version: 1,
        createdAt: new Date().toISOString(),
        mode: "calibration",
        address: snapshot.address,
        snapshot,
        plan,
        action: "deferred",
        reason: "",
      };
      await addEvent(
        "decide",
        `${plan.protectedCount} protected · ${plan.compactedCount} compacted · ${plan.deferredCount} deferred`,
        plan.explanation,
      );
      const contentFingerprint = sha256(JSON.stringify({ memories, policy }));
      const previous = (await readState()).receipts.find(
        (r) =>
          r.action === "stored" &&
          r.verified &&
          r.reason.includes(contentFingerprint),
      );
      if (previous) {
        receipt.reason =
          "The same memory set and policy already have a verified archive. Avoid a duplicate paid write.";
        await addEvent("act", "Duplicate write prevented", receipt.reason);
        await saveReceipt(receipt);
        return receipt;
      }
      // Capture a byte-identical archive that can be independently verified. Receipt's
      // payload hash and signature are external, avoiding self-referential hashing.
      const archive = JSON.stringify(
        {
          schema: "memento.memory-archive.v1",
          createdAt: receipt.createdAt,
          decisionId: receipt.id,
          chain: {
            network: snapshot.network,
            epoch: snapshot.epoch,
            address: snapshot.address,
          },
          policy,
          memories: plan.decisions.filter((d) => d.action !== "defer"),
          deferred: plan.decisions
            .filter((d) => d.action === "defer")
            .map(({ id, title, sourceHash, reason }) => ({
              id,
              title,
              sourceHash,
              reason,
            })),
        },
        null,
        2,
      );
      const data = new TextEncoder().encode(archive);
      const synapse = getSynapse(true);
      await addEvent(
        "decide",
        "Pricing the exact archive",
        `Requesting an SDK quote for ${data.byteLength.toLocaleString()} actual bytes and two provider copies, including the ${policy.reserveDays}-day reserve.`,
      );
      const contexts = await synapse.storage.createContexts({ copies: 2 });
      const prep = await synapse.storage.prepare({
        context: contexts,
        pieceSizes: [BigInt(data.byteLength)],
        extraRunwayEpochs: BigInt(policy.reserveDays) * 2880n,
      });
      // rates.perMonth refers to affected datasets. rateDelta adds only the increase
      // to all existing account rails, so unrelated rails cannot escape the cap.
      const projectedRate =
        BigInt(snapshot.ratePerEpoch) * 86400n +
        prep.costs.lockups.rateDeltaPerEpoch * 86400n;
      const gate = budgetGate({
        projectedRate,
        monthlyCap: parseUnits(policy.maxMonthlyUsdfc.toString(), 18),
        depositNeeded: prep.costs.depositNeeded,
        walletBalance: parseUnits(snapshot.walletUsdfc, 18),
        maxTopUp: parseUnits(process.env.AGENT_MAX_TOPUP_USDFC || "2", 18),
        gasBalance: parseUnits(snapshot.walletFil, 18),
      });
      receipt.reason = gate.reason;
      await addEvent(
        "decide",
        gate.allowed ? "Budget gate passed" : "Write deferred autonomously",
        `${gate.reason} Quote: ${formatUnits(projectedRate, 18)} USDFC/month; deposit ${formatUnits(prep.costs.depositNeeded, 18)} USDFC.`,
      );
      if (!gate.allowed) {
        await saveReceipt(receipt);
        return receipt;
      }
      if (prep.transaction) {
        await addEvent(
          "act",
          "Funding storage reserve",
          "Executing the SDK deposit/approval transaction on Calibration only.",
        );
        const { hash } = await prep.transaction.execute();
        receipt.depositTx = hash;
        await addEvent("act", "Reserve transaction confirmed", hash);
      }
      receipt.payloadHash = sha256(data);
      receipt.signature = await privateKeyToAccount(
        process.env.FILECOIN_PRIVATE_KEY as `0x${string}`,
      ).signMessage({
        message: `Memento archive SHA-256:${receipt.payloadHash}`,
      });
      // Persist the intent BEFORE broadcasting upload, so ambiguous failures remain visible.
      receipt.reason = `Upload intent; content fingerprint ${contentFingerprint}`;
      await saveReceipt(receipt);
      await addEvent(
        "act",
        "Storing the selected memories",
        "Synapse is storing and committing the archive on two independent providers.",
      );
      const upload = await synapse.storage.upload(data, { contexts });
      receipt.pieceCid = upload.pieceCid.toString();
      receipt.copies = upload.copies.map((c) => ({
        providerId: c.providerId.toString(),
        dataSetId: c.dataSetId.toString(),
        pieceId: c.pieceId.toString(),
        retrievalUrl: c.retrievalUrl,
      }));
      if (!upload.complete)
        throw new Error(
          `Only ${upload.copies.length}/${upload.requestedCopies} copies were confirmed. Inspect the receipt before retrying.`,
        );
      receipt.action = "stored";
      await addEvent(
        "verify",
        "Retrieving the archive",
        "Downloading the PieceCID through Synapse and comparing SHA-256 with the original archive.",
      );
      const downloaded = await synapse.storage.download({
        pieceCid: upload.pieceCid,
      });
      receipt.verified = sha256(downloaded) === receipt.payloadHash;
      if (!receipt.verified)
        throw new Error("The retrieved bytes did not match the archive hash.");
      receipt.reason = `Stored two copies and verified retrieval. Content fingerprint ${contentFingerprint}`;
      await addEvent(
        "verify",
        "Every byte accounted for",
        `SHA-256 matches. ${receipt.pieceCid}. This is retrieval integrity; ongoing PDP proof status is independently inspectable onchain.`,
      );
      // Replace the persisted intent with its final result.
      state = await readState();
      state.receipts = state.receipts.filter((r) => r.id !== receipt!.id);
      state.lastSnapshot = await readChain();
      await writeState(state);
      await saveReceipt(receipt);
      return receipt;
    } catch (e) {
      const message = e instanceof Error ? e.message : "Agent cycle failed";
      await addEvent("error", "Cycle stopped safely", message);
      state = await readState();
      state.lastError = message;
      if (receipt) {
        receipt.action = "failed";
        receipt.reason = message;
        state.receipts = state.receipts.filter((r) => r.id !== receipt!.id);
        state.receipts.unshift(receipt);
      }
      await writeState(state);
      throw e;
    } finally {
      state = await readState();
      state.running = false;
      await writeState(state);
    }
  });
}
export async function loadMemories() {
  if (process.env.MEMENTO_MEMORIES_PATH)
    return JSON.parse(
      await readFile(process.env.MEMENTO_MEMORIES_PATH, "utf8"),
    ) as Memory[];
  return SEED_MEMORIES;
}
