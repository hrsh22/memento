import { readFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import path from "node:path";
import { verifyMessage, type Hex } from "viem";
import { canonicalJson, receiptMessage } from "../agent/receipt";
import type { Receipt, AgentEvent } from "../agent/types";
import { DEMO_ADDRESS } from "./filecoin";
import { verifyReceipt } from "./verify";
export interface RecordedRun {
  version: number;
  kind: string;
  startedAt: string;
  endedAt: string;
  address: string;
  network: string;
  note: string;
  phases: {
    title: string;
    startedAt: string;
    endedAt: string;
    receiptId: string;
    action: string;
    reason: string;
  }[];
  events: AgentEvent[];
  receipts: Receipt[];
  receiptIds: string[];
  verification: {
    verified: boolean;
    bytes: number;
    retrievalCopies: {
      providerId: string;
      bytes: number;
      hashMatches: boolean;
    }[];
  };
  digest: string;
  signature: string;
}
export async function readRecording(): Promise<RecordedRun> {
  return JSON.parse(
    await readFile(
      path.join(process.cwd(), "public/showcase/run.json"),
      "utf8",
    ),
  );
}
export async function verifyRecordingManifest(run: RecordedRun) {
  const unsigned = { ...run } as Partial<RecordedRun>;
  delete unsigned.digest;
  delete unsigned.signature;
  const digest = createHash("sha256")
    .update(canonicalJson(unsigned))
    .digest("hex");
  const expected = (
    process.env.NEXT_PUBLIC_AGENT_ADDRESS || DEMO_ADDRESS
  ).toLowerCase();
  const hashMatches = digest === run.digest;
  const signatureValid =
    run.address.toLowerCase() === expected &&
    (await verifyMessage({
      address: run.address as Hex,
      message: "Memento recorded run SHA-256:" + digest,
      signature: run.signature as Hex,
    }));
  const decisions = await Promise.all(
    run.receipts.map(async (receipt) => ({
      id: receipt.id,
      valid:
        !!receipt.decisionSignature &&
        receipt.address.toLowerCase() === expected &&
        (await verifyMessage({
          address: receipt.address as Hex,
          message: receiptMessage(
            receipt as unknown as Record<string, unknown>,
          ),
          signature: receipt.decisionSignature as Hex,
        })),
    })),
  );
  return {
    verified:
      hashMatches &&
      signatureValid &&
      decisions.length === run.phases.length &&
      decisions.every((d) => d.valid) &&
      run.phases.every((p) => decisions.some((d) => d.id === p.receiptId)),
    hashMatches,
    signatureValid,
    decisions,
  };
}
export async function verifyRecording() {
  const run = await readRecording();
  const manifest = await verifyRecordingManifest(run);
  if (!manifest.verified)
    return { ...manifest, archive: null, checkedAt: new Date().toISOString() };
  const stored = run.receipts.find((r) => r.action === "stored");
  if (!stored) throw new Error("Recording has no archive.");
  const archive = await verifyReceipt(stored);
  return {
    ...manifest,
    verified: manifest.verified && archive.verified,
    archive,
    checkedAt: new Date().toISOString(),
  };
}
