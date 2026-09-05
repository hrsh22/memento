import { describe, expect, it } from "vitest";
import { planMemories, compact } from "./engine";
import { budgetGate } from "./gate";
import { DEFAULT_POLICY, DEMO_BUDGET, SEED_MEMORIES } from "./memories";
describe("memory planner", () => {
  it("never compacts or defers pinned memories even with zero funds and a strict threshold", () => {
    const p = planMemories(
      SEED_MEMORIES,
      { ...DEMO_BUDGET, availableUsdfc: 0 },
      { ...DEFAULT_POLICY, minUtility: 99 },
    );
    for (const m of SEED_MEMORIES.filter((m) => m.pinned)) {
      const d = p.decisions.find((d) => d.id === m.id)!;
      expect(d.action).toBe("keep");
      expect(d.content).toBe(m.content);
    }
    expect(p.plannedRunwayDays).toBe(0);
  });
  it("changes retention under real budget pressure", () => {
    const high = planMemories(
      SEED_MEMORIES,
      { ...DEMO_BUDGET, availableUsdfc: 10 },
      DEFAULT_POLICY,
    );
    const low = planMemories(
      SEED_MEMORIES,
      { ...DEMO_BUDGET, availableUsdfc: 0.08 },
      DEFAULT_POLICY,
    );
    expect(high.mode).toBe("abundant");
    expect(low.mode).toBe("survival");
    expect(low.compactedCount).toBeGreaterThan(0);
    expect(low.retainedBytes).toBeLessThan(high.retainedBytes);
  });
  it("accounts for a per-dataset proving fee only on new datasets", () => {
    const old = planMemories(SEED_MEMORIES, DEMO_BUDGET, DEFAULT_POLICY);
    const fresh = planMemories(
      SEED_MEMORIES,
      { ...DEMO_BUDGET, newDataset: true },
      DEFAULT_POLICY,
    );
    expect(fresh.plannedMonthly - old.plannedMonthly).toBeCloseTo(0.24, 8);
  });
  it("does not claim compression eliminates the existing recurring rate", () => {
    const p = planMemories(
      SEED_MEMORIES,
      { ...DEMO_BUDGET, availableUsdfc: 0.08 },
      DEFAULT_POLICY,
    );
    expect(p.plannedMonthly).toBeGreaterThanOrEqual(
      DEMO_BUDGET.existingMonthlyUsdfc,
    );
  });
  it("extracts verbatim source sentences and does not hallucinate", () => {
    const input =
      "Noise. Result: keep the signed hash. More noise. Evidence: verified retrieval. Important: two copies. Critical: never delete a pinned source.";
    const out = compact(input);
    expect(out).toContain("Result: keep the signed hash.");
    for (const sentence of out.match(/[^.!?]+[.!?]/g)!) {
      expect(input).toContain(sentence.trim());
    }
  });
  it("rejects non-finite and negative financial inputs", () => {
    expect(() =>
      planMemories(
        SEED_MEMORIES,
        { ...DEMO_BUDGET, availableUsdfc: NaN },
        DEFAULT_POLICY,
      ),
    ).toThrow();
    expect(() =>
      planMemories(
        SEED_MEMORIES,
        { ...DEMO_BUDGET, availableUsdfc: -1 },
        DEFAULT_POLICY,
      ),
    ).toThrow();
  });
  it("handles no memory and no spending rate without fabricated runway", () => {
    const p = planMemories(
      [],
      { ...DEMO_BUDGET, existingMonthlyUsdfc: 0 },
      DEFAULT_POLICY,
    );
    expect(p.plannedRunwayDays).toBeNull();
    expect(p.plannedFees).toBe(0);
    expect(p.retainedUtilityPercent).toBe(100);
  });
  it("bundles retained memories into one piece per copy", () => {
    const p = planMemories(SEED_MEMORIES, DEMO_BUDGET, DEFAULT_POLICY);
    expect(p.plannedFees).toBe(0.022);
    expect(p.baselineFees).toBe(0.176);
  });
});
describe("integer financial execution gate", () => {
  const valid = {
    projectedRate: 24n,
    monthlyCap: 50n,
    depositNeeded: 12n,
    walletBalance: 100n,
    maxTopUp: 20n,
    gasBalance: 10n ** 18n,
  };
  it("permits an affordable reserve top-up", () =>
    expect(budgetGate(valid).allowed).toBe(true));
  it.each([
    { ...valid, projectedRate: 51n },
    { ...valid, depositNeeded: 21n },
    { ...valid, walletBalance: 0n },
    { ...valid, gasBalance: 0n },
  ])("refuses a cap, balance, or gas violation", (input) =>
    expect(budgetGate(input).allowed).toBe(false),
  );
});
