import {
  mkdir,
  readFile,
  writeFile,
  rename,
  open,
  unlink,
  appendFile,
} from "node:fs/promises";
import path from "node:path";
import { privateKeyToAccount } from "viem/accounts";
import { receiptMessage } from "../agent/receipt";
import type { AgentState, AgentEvent, Receipt } from "../agent/types";
const dir = process.env.MEMENTO_DATA_DIR || path.join(process.cwd(), "data");
const file = path.join(dir, "agent.json");
export async function readState(): Promise<AgentState> {
  try {
    return JSON.parse(await readFile(file, "utf8"));
  } catch (e) {
    if ((e as NodeJS.ErrnoException).code !== "ENOENT") throw e;
    try {
      return JSON.parse(
        await readFile(
          path.join(process.cwd(), "public/evidence/latest.json"),
          "utf8",
        ),
      );
    } catch (fallback) {
      if ((fallback as NodeJS.ErrnoException).code !== "ENOENT") throw fallback;
      return { running: false, events: [], receipts: [] };
    }
  }
}
export async function writeState(state: AgentState) {
  await mkdir(dir, { recursive: true });
  delete state.evidenceMode;
  delete state.exportedAt;
  const tmp = file + ".tmp";
  await writeFile(tmp, JSON.stringify(state, null, 2));
  await rename(tmp, file);
}
export async function addEvent(
  stage: AgentEvent["stage"],
  title: string,
  detail: string,
) {
  const state = await readState();
  const event: AgentEvent = {
    id: crypto.randomUUID(),
    at: new Date().toISOString(),
    stage,
    title,
    detail,
  };
  state.events.unshift(event);
  state.events = state.events.slice(0, 100);
  await writeState(state);
  if (process.env.MEMENTO_RECORD_PATH)
    await appendFile(
      process.env.MEMENTO_RECORD_PATH,
      JSON.stringify(event) + "\n",
    );
}
export async function saveReceipt(receipt: Receipt) {
  const state = await readState();
  if (process.env.FILECOIN_PRIVATE_KEY)
    receipt.decisionSignature = await privateKeyToAccount(
      process.env.FILECOIN_PRIVATE_KEY as `0x${string}`,
    ).signMessage({
      message: receiptMessage(receipt as unknown as Record<string, unknown>),
    });
  state.receipts = state.receipts.filter((r) => r.id !== receipt.id);
  state.receipts.unshift(receipt);
  // Retain successful archives as a durable deduplication ledger. Only no-op history is bounded.
  let noops = 0;
  state.receipts = state.receipts.filter(
    (r) =>
      r.action === "stored" ||
      r.action === "funded" ||
      r.broadcastAttempted ||
      ++noops <= 30,
  );
  await writeState(state);
}
/** Exclusive across the CLI worker and API process. A crashed process leaves a lock
 * for manual reconciliation, intentionally preventing ambiguous duplicate writes. */
export async function withAgentLock<T>(fn: () => Promise<T>): Promise<T> {
  await mkdir(dir, { recursive: true });
  let handle;
  try {
    handle = await open(path.join(dir, "agent.lock"), "wx");
  } catch {
    throw new Error(
      "An agent cycle is already active. If a process crashed, reconcile its last receipt before removing data/agent.lock.",
    );
  }
  try {
    return await fn();
  } finally {
    await handle.close();
    await unlink(path.join(dir, "agent.lock"));
  }
}
