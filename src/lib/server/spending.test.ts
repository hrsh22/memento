import { describe, it, expect, vi, afterEach } from "vitest";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import type { Receipt } from "../agent/types";
afterEach(() => {
  vi.unstubAllEnvs();
  vi.resetModules();
});
describe("durable spending reservations", () => {
  it("persists the reservation before execution and refuses the next charge after restart", async () => {
    const dir = await mkdtemp(path.join(tmpdir(), "memento-budget-"));
    vi.stubEnv("MEMENTO_DATA_DIR", dir);
    vi.stubEnv("AGENT_MAX_ROLLING_FEES_USDFC", "0.03");
    const { writeState, readState } = await import("./store");
    await writeState({ running: false, receipts: [], events: [] });
    const { checkSpending, reserveSpending } = await import("./spending");
    const first = { id: "first", address: "0xabc" } as Receipt;
    expect((await checkSpending(first, "0.022", "0")).allowed).toBe(true);
    await reserveSpending(first);
    await reserveSpending(first);
    expect((await readState()).spendingLedger?.entries).toHaveLength(1);
    vi.resetModules();
    const restarted = await import("./spending");
    expect(
      (
        await restarted.checkSpending(
          { id: "second", address: "0xabc" } as Receipt,
          "0.022",
          "0",
        )
      ).allowed,
    ).toBe(false);
    await rm(dir, { recursive: true, force: true });
  });
  it("refuses to recreate a missing ledger when receipts prove tracking was enabled", async () => {
    const dir = await mkdtemp(path.join(tmpdir(), "memento-budget-corrupt-"));
    vi.stubEnv("MEMENTO_DATA_DIR", dir);
    const { writeState } = await import("./store");
    await writeState({
      running: false,
      events: [],
      receipts: [{ spending: { allowed: true } } as Receipt],
    });
    const { checkSpending } = await import("./spending");
    await expect(
      checkSpending({ id: "next", address: "0xabc" } as Receipt, "0.01", "0"),
    ).rejects.toThrow("history is missing");
    await rm(dir, { recursive: true, force: true });
  });
});
