import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { privateKeyToAccount } from "viem/accounts";
import { runCycle, sha256 } from "../src/lib/server/runner";
import { addEvent, readState } from "../src/lib/server/store";
import { verifyReceipt } from "../src/lib/server/verify";
import { DEFAULT_POLICY, SEED_MEMORIES } from "../src/lib/agent/memories";
import { canonicalJson } from "../src/lib/agent/receipt";
import type { Receipt } from "../src/lib/agent/types";

await mkdir("public/showcase", { recursive: true });
await mkdir("data", { recursive: true });
const eventPath = path.resolve("data/recording-events.jsonl");
await writeFile(eventPath, "");
process.env.MEMENTO_RECORD_PATH = eventPath;
// A tight demonstration allowance makes cumulative refusal visible after one write.
process.env.AGENT_MAX_ROLLING_FEES_USDFC = "0.03";
process.env.AGENT_MAX_ROLLING_TOPUPS_USDFC = "2";
const startedAt = new Date().toISOString();
const memories = [
  ...SEED_MEMORIES,
  {
    id: "spending-ledger-rollout",
    title: "A budget that remembers prior spending",
    kind: "research" as const,
    content:
      "Result: Memento now reserves operation fees and reserve funding in a persistent rolling 30-day ledger before any transaction. Critical: pending or failed attempts remain charged. The ledger records its activation time and does not pretend to cover earlier activity.",
    importance: 98,
    accesses: 8,
    ageDays: 0,
    pinned: false,
  },
];
const phases: {
  title: string;
  startedAt: string;
  endedAt: string;
  receiptId: string;
  action: string;
  reason: string;
}[] = [];
async function phase(title: string, fn: () => Promise<Receipt>) {
  console.log("START", new Date().toISOString(), title);
  const begin = new Date().toISOString();
  const r = await fn();
  phases.push({
    title,
    startedAt: begin,
    endedAt: new Date().toISOString(),
    receiptId: r.id,
    action: r.action,
    reason: r.reason,
  });
  console.log("RESULT", r.id, r.action, r.reason);
  return r;
}
const refusal = await phase(
  "A funded wallet still obeys the recurring-cost cap",
  () => runCycle({ ...DEFAULT_POLICY, maxMonthlyUsdfc: 0.1 }, memories),
);
if (refusal.action !== "deferred")
  throw new Error("Expected recurring-cost refusal.");
const archive = await phase("One useful archive fits the budget", () =>
  runCycle(DEFAULT_POLICY, memories),
);
if (archive.action !== "stored" || !archive.verified)
  throw new Error("Expected verified archive.");
await addEvent(
  "verify",
  "Checking both providers independently",
  "Retrieve the same archive directly from each registered provider and validate PieceCID and SHA-256.",
);
const verification = await verifyReceipt(archive);
if (!verification.verified) throw new Error("Independent verification failed.");
await addEvent(
  "verify",
  "Both provider copies passed",
  "Two independently downloaded copies match the signed archive hash and both live datasets include the PieceCID.",
);
const cumulative = await phase(
  "A second write hits the cumulative fee allowance",
  () =>
    runCycle(DEFAULT_POLICY, [
      ...memories,
      {
        id: "second-spending-request",
        title: "A new request must share the same allowance",
        kind: "research",
        content:
          "Finding: a second new archive incurs an additional operation fee. It must count against the same rolling allowance as the first archive.",
        importance: 99,
        accesses: 10,
        ageDays: 0,
        pinned: false,
      },
    ]),
);
if (cumulative.action !== "deferred" || cumulative.spending?.allowed !== false)
  throw new Error("Expected cumulative refusal.");
const unchanged = await phase(
  "Identical input avoids a duplicate paid upload",
  () => runCycle(DEFAULT_POLICY, memories),
);
if (unchanged.action === "stored")
  throw new Error("Duplicate storage occurred.");
const events = (await readFile(eventPath, "utf8"))
  .trim()
  .split("\n")
  .filter(Boolean)
  .map((s) => JSON.parse(s));
const state = await readState();
const account = privateKeyToAccount(
  process.env.FILECOIN_PRIVATE_KEY as `0x${string}`,
);
const unsigned = {
  version: 1,
  kind: "recorded-worker-run",
  startedAt,
  endedAt: new Date().toISOString(),
  address: account.address,
  network: "Filecoin Calibration",
  note: "Continuous recording of a real local worker run with predefined input/policy stimuli. Playback does not broadcast transactions. Ledger tracking starts at activation; older operations are not backfilled.",
  phases,
  events,
  verification,
  receiptIds: phases.map((p) => p.receiptId),
  receipts: state.receipts.filter((r) =>
    phases.some((p) => p.receiptId === r.id),
  ),
};
const digest = sha256(canonicalJson(unsigned));
const signature = await account.signMessage({
  message: `Memento recorded run SHA-256:${digest}`,
});
await writeFile(
  "public/showcase/run.json",
  JSON.stringify({ ...unsigned, digest, signature }, null, 2),
);
console.log("RECORDED", unsigned.startedAt, unsigned.endedAt, digest);
