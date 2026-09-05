import { describe, expect, it } from "vitest";
import { projectDecision, type ProjectionInput } from "./decide";
import { planMemories } from "../agent/engine";
import { DEFAULT_POLICY, DEMO_BUDGET, SEED_MEMORIES } from "../agent/memories";

const plan = planMemories(SEED_MEMORIES, DEMO_BUDGET, DEFAULT_POLICY);
const base: ProjectionInput = {
  plan,
  policy: DEFAULT_POLICY,
  existingMonthlyUsdfc: DEMO_BUDGET.existingMonthlyUsdfc,
  availableUsdfc: DEMO_BUDGET.availableUsdfc,
  walletUsdfc: "100",
  walletFil: "100",
  maxTopUpUsdfc: "2",
};

describe("live projection", () => {
  it("charges lockup only for the rate the plan adds, over the reserve window", () => {
    const { projection } = projectDecision(base);
    const added = plan.plannedMonthly - DEMO_BUDGET.existingMonthlyUsdfc;
    expect(Number(projection.additionalLockupUsdfc)).toBeCloseTo(
      added * (DEFAULT_POLICY.reserveDays / 30),
      12,
    );
    expect(Number(projection.projectedMonthlyUsdfc)).toBeCloseTo(
      plan.plannedMonthly,
      12,
    );
  });
  it("needs no deposit while available funds already cover lockup and fees", () => {
    const { projection, gate } = projectDecision({
      ...base,
      availableUsdfc: 50,
    });
    expect(projection.depositNeededUsdfc).toBe("0");
    expect(gate.allowed).toBe(true);
  });
  it("refuses when the projected recurring cost exceeds the cap", () => {
    const { gate } = projectDecision({
      ...base,
      policy: { ...DEFAULT_POLICY, maxMonthlyUsdfc: 0.05 },
    });
    expect(gate.allowed).toBe(false);
    expect(gate.reason).toMatch(/recurring cost exceeds/i);
  });
  it("refuses when the deposit exceeds the autonomous top-up limit", () => {
    const { gate } = projectDecision({
      ...base,
      availableUsdfc: 0,
      policy: { ...DEFAULT_POLICY, reserveDays: 365 },
      maxTopUpUsdfc: "0.000001",
    });
    expect(gate.allowed).toBe(false);
    expect(gate.reason).toMatch(/top-up limit/i);
  });
  it("refuses when the wallet cannot fund the required reserve", () => {
    const { gate } = projectDecision({
      ...base,
      availableUsdfc: 0,
      policy: { ...DEFAULT_POLICY, reserveDays: 365 },
      walletUsdfc: "0.000001",
    });
    expect(gate.allowed).toBe(false);
    expect(gate.reason).toMatch(/cannot fund the reserve/i);
  });
  it("refuses without gas even when every USDFC limit passes", () => {
    const { gate } = projectDecision({ ...base, walletFil: "0" });
    expect(gate.allowed).toBe(false);
    expect(gate.reason).toMatch(/test FIL/i);
  });
  it("rejects a non-finite projection instead of quoting a wrong number", () => {
    expect(() =>
      projectDecision({ ...base, existingMonthlyUsdfc: Number.NaN }),
    ).toThrow();
  });
});
