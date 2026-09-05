import { runCycle } from "../src/lib/server/runner";
import { readState } from "../src/lib/server/store";
import { DEFAULT_POLICY, SEED_MEMORIES } from "../src/lib/agent/memories";
// This opt-in integration exercise uses the configured fresh Calibration wallet.
const previous = (await readState()).receipts.find(
  (r) => r.action === "stored" && r.verified,
);
if (!previous)
  throw new Error(
    "Run agent:once successfully before this integration exercise.",
  );
const health = await runCycle();
console.log("Health/dedup:", health.action, health.reason);
const memories = [
  ...SEED_MEMORIES,
  {
    id: "verified-live-evidence",
    title: "Verified Filecoin archive",
    kind: "research" as const,
    content: `Result: the first Memento archive was stored as ${previous.pieceCid}. Evidence: provider datasets ${previous.copies?.map((c) => c.dataSetId).join(", ")}. The local agent retrieved the archive and matched SHA-256 ${previous.payloadHash}. This is a real integration result; it does not claim future availability.`,
    importance: 91,
    accesses: 5,
    ageDays: 0,
    pinned: false,
  },
];
const refusal = await runCycle(
  { ...DEFAULT_POLICY, maxMonthlyUsdfc: 0.1 },
  memories,
);
console.log("Strict cap:", refusal.action, refusal.reason);
if (refusal.action !== "deferred") throw new Error("Strict cap did not defer.");
const stored = await runCycle(DEFAULT_POLICY, memories);
console.log("New memory:", stored.action, stored.verified, stored.pieceCid);
if (stored.action !== "stored" || !stored.verified)
  throw new Error("New memory archive was not verified.");
const dedup = await runCycle(DEFAULT_POLICY, memories);
console.log("Replay:", dedup.action, dedup.reason);
if (dedup.action === "stored")
  throw new Error("A duplicate archive was stored.");
