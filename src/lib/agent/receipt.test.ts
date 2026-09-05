import { describe, it, expect } from "vitest";
import { generatePrivateKey, privateKeyToAccount } from "viem/accounts";
import { verifyMessage } from "viem";
import { canonicalJson, receiptMessage } from "./receipt";
import { memoriesSchema, policySchema } from "./schema";
import { SEED_MEMORIES, DEFAULT_POLICY } from "./memories";
describe("receipt integrity", () => {
  it("canonicalizes nested keys and excludes the signature itself", () => {
    expect(canonicalJson({ b: 2, a: { z: 3, c: 1 } })).toBe(
      canonicalJson({ a: { c: 1, z: 3 }, b: 2 }),
    );
    expect(receiptMessage({ a: 1, decisionSignature: "0xabc" })).toBe(
      receiptMessage({ a: 1 }),
    );
  });
  it("detects tampered financial decisions", async () => {
    const account = privateKeyToAccount(generatePrivateKey());
    const original = {
      action: "deferred",
      snapshot: { availableFunds: "0.01" },
      quote: { depositNeededUsdfc: "1.3" },
    };
    const signature = await account.signMessage({
      message: receiptMessage(original),
    });
    expect(
      await verifyMessage({
        address: account.address,
        message: receiptMessage(original),
        signature,
      }),
    ).toBe(true);
    expect(
      await verifyMessage({
        address: account.address,
        message: receiptMessage({ ...original, action: "stored" }),
        signature,
      }),
    ).toBe(false);
  });
  it("rejects malformed memory input before any chain operations", () => {
    expect(() =>
      memoriesSchema.parse([...SEED_MEMORIES, SEED_MEMORIES[0]]),
    ).toThrow();
    expect(() =>
      memoriesSchema.parse([{ ...SEED_MEMORIES[0], importance: NaN }]),
    ).toThrow();
    expect(() =>
      policySchema.parse({ ...DEFAULT_POLICY, reserveDays: 1.5 }),
    ).toThrow();
  });
});
