import { runCycle, loadMemories } from "../src/lib/server/runner";
import { DEFAULT_POLICY } from "../src/lib/agent/memories";
const once = process.argv.includes("--once");
let stopped = false;
process.on("SIGINT", () => {
  stopped = true;
});
process.on("SIGTERM", () => {
  stopped = true;
});
do {
  try {
    const r = await runCycle(DEFAULT_POLICY, await loadMemories());
    console.log(
      JSON.stringify({
        id: r.id,
        action: r.action,
        reason: r.reason,
        pieceCid: r.pieceCid,
        verified: r.verified,
      }),
    );
  } catch (e) {
    console.error(e instanceof Error ? e.message : e);
    process.exitCode = 1;
    stopped = true;
  }
  if (!once && !stopped) await new Promise((r) => setTimeout(r, 60000));
} while (!once && !stopped);
