import {
  mkdir,
  readFile,
  writeFile,
  rename,
  open,
  unlink,
} from "node:fs/promises";
import path from "node:path";
import type { AgentState, AgentEvent, Receipt } from "../agent/types";
const dir = process.env.MEMENTO_DATA_DIR || path.join(process.cwd(), "data");
const file = path.join(dir, "agent.json");
export async function readState(): Promise<AgentState> {
  try {
    return JSON.parse(await readFile(file, "utf8"));
  } catch (e) {
    if ((e as NodeJS.ErrnoException).code !== "ENOENT") throw e;
    return { running: false, events: [], receipts: [] };
  }
}
export async function writeState(state: AgentState) {
  await mkdir(dir, { recursive: true });
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
  state.events.unshift({
    id: crypto.randomUUID(),
    at: new Date().toISOString(),
    stage,
    title,
    detail,
  });
  state.events = state.events.slice(0, 100);
  await writeState(state);
}
export async function saveReceipt(receipt: Receipt) {
  const state = await readState();
  state.receipts.unshift(receipt);
  state.receipts = state.receipts.slice(0, 50);
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
