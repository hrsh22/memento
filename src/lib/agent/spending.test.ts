import { describe, it, expect } from "vitest";
import { assessSpending } from "./spending";
import type { SpendingLedger } from "./types";
const now = new Date("2026-09-06T00:00:00Z");
const input = {
  address: "0xabc",
  now,
  feesUsdfc: "0.022",
  depositUsdfc: "0.01",
  feeLimitUsdfc: "0.1",
  depositLimitUsdfc: "2",
};
const ledger: SpendingLedger = {
  enabledAt: "2026-08-01T00:00:00Z",
  entries: [
    {
      id: "earlier",
      address: "0xABC",
      at: "2026-09-05T00:00:00Z",
      feesUsdfc: "0.08",
      depositUsdfc: "1.9",
    },
  ],
};
describe("cumulative financial budgets", () => {
  it("refuses repeated fees even when each write individually fits", () =>
    expect(assessSpending(ledger, input).allowed).toBe(false));
  it("allows the exact boundary with integer arithmetic", () =>
    expect(
      assessSpending(ledger, { ...input, feesUsdfc: "0.02" }).allowed,
    ).toBe(true));
  it("refuses cumulative top-ups independently of fees", () =>
    expect(
      assessSpending(ledger, {
        ...input,
        feesUsdfc: "0",
        depositUsdfc: "0.100000000000000001",
      }).allowed,
    ).toBe(false));
  it("retains reserved uncertain operations after serialization/restart", () =>
    expect(
      assessSpending(JSON.parse(JSON.stringify(ledger)), input).feesUsedUsdfc,
    ).toBe("0.08"));
  it("expires only entries outside the rolling window", () =>
    expect(
      assessSpending(
        {
          ...ledger,
          entries: [{ ...ledger.entries[0], at: "2026-08-07T00:00:00Z" }],
        },
        input,
      ).allowed,
    ).toBe(true));
  it("does not reclaim future-dated charges after clock rollback", () =>
    expect(
      assessSpending(
        {
          ...ledger,
          entries: [{ ...ledger.entries[0], at: "2026-09-07T00:00:00Z" }],
        },
        input,
      ).allowed,
    ).toBe(false));
  it("isolates accounts", () =>
    expect(assessSpending(ledger, { ...input, address: "0xdef" }).allowed).toBe(
      true,
    ));
  it("fails closed for invalid ledger amounts or duplicate entries", () => {
    expect(() =>
      assessSpending(
        { ...ledger, entries: [{ ...ledger.entries[0], feesUsdfc: "-1" }] },
        input,
      ),
    ).toThrow();
    expect(() =>
      assessSpending(
        { ...ledger, entries: [...ledger.entries, ...ledger.entries] },
        input,
      ),
    ).toThrow();
  });
  it("supports a zero allowance without silently applying defaults", () =>
    expect(
      assessSpending(
        { enabledAt: now.toISOString(), entries: [] },
        { ...input, feeLimitUsdfc: "0" },
      ).allowed,
    ).toBe(false));
});
