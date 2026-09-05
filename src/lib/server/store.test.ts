import { describe, it, expect, vi, afterEach } from "vitest";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
afterEach(() => {
  vi.unstubAllEnvs();
  vi.resetModules();
});
describe("durable worker exclusion", () => {
  it("rejects concurrent cycles and releases the lock after failure", async () => {
    const dir = await mkdtemp(path.join(tmpdir(), "memento-test-"));
    vi.stubEnv("MEMENTO_DATA_DIR", dir);
    const { withAgentLock } = await import("./store");
    let release!: () => void;
    const held = withAgentLock(
      () =>
        new Promise<void>((resolve) => {
          release = resolve;
        }),
    );
    while (!release) await new Promise((r) => setTimeout(r, 1));
    await expect(withAgentLock(async () => 1)).rejects.toThrow(
      "already active",
    );
    release();
    await held;
    await expect(
      withAgentLock(async () => {
        throw new Error("worker failed");
      }),
    ).rejects.toThrow("worker failed");
    expect(await withAgentLock(async () => 42)).toBe(42);
    await rm(dir, { recursive: true, force: true });
  });
});

describe("receipt retention", () => {
  it("never evicts a stored archive, because dedup is what stops a second payment", async () => {
    const dir = await mkdtemp(path.join(tmpdir(), "memento-retain-"));
    vi.stubEnv("MEMENTO_DATA_DIR", dir);
    vi.stubEnv("FILECOIN_PRIVATE_KEY", "");
    const { saveReceipt, readState, NOOP_RECEIPT_HISTORY } =
      await import("./store");
    const receipt = (id: string, action: string, extra = {}) =>
      ({
        id,
        version: 1,
        createdAt: new Date().toISOString(),
        mode: "calibration",
        address: "0x0000000000000000000000000000000000000001",
        action,
        reason: "",
        contentFingerprint: "fingerprint",
        ...extra,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      }) as any;

    await saveReceipt(receipt("archive", "stored", { verified: true }));
    await saveReceipt(receipt("topup", "funded"));
    await saveReceipt(
      receipt("broadcast", "failed", { broadcastAttempted: true }),
    );
    for (let i = 0; i < NOOP_RECEIPT_HISTORY * 3; i++)
      await saveReceipt(receipt(`noop-${i}`, "deferred"));

    const { receipts } = await readState();
    const ids = receipts.map((r) => r.id);
    expect(ids).toContain("archive");
    expect(ids).toContain("topup");
    expect(ids).toContain("broadcast");
    expect(receipts.filter((r) => r.id.startsWith("noop-"))).toHaveLength(
      NOOP_RECEIPT_HISTORY,
    );
    // the survivors are the most recent no-ops, not the oldest
    expect(ids).toContain(`noop-${NOOP_RECEIPT_HISTORY * 3 - 1}`);
    expect(ids).not.toContain("noop-0");
    await rm(dir, { recursive: true, force: true });
  });
});
