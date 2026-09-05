import { describe, it, expect } from "vitest";
import { readRecording, verifyRecordingManifest } from "./recording";
describe("recorded execution integrity", () => {
  it("verifies the captured run and every financial decision signature", async () => {
    const result = await verifyRecordingManifest(await readRecording());
    expect(result.verified).toBe(true);
    expect(result.decisions).toHaveLength(4);
  });
  it("rejects a changed event transcript", async () => {
    const run = await readRecording();
    run.events[0].detail = "Invented successful transaction";
    expect((await verifyRecordingManifest(run)).verified).toBe(false);
  });
  it("rejects a changed financial cap", async () => {
    const run = await readRecording();
    run.receipts[0].plan.policy.maxMonthlyUsdfc = 99;
    const result = await verifyRecordingManifest(run);
    expect(result.verified).toBe(false);
    expect(result.decisions.some((d) => !d.valid)).toBe(true);
  });
});
