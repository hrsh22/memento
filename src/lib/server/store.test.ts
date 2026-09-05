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
