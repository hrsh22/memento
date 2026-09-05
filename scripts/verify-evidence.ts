import { readState } from "../src/lib/server/store";
import { verifyReceipt } from "../src/lib/server/verify";
const receipts = (await readState()).receipts.filter(
  (r) => r.action === "stored",
);
if (!receipts.length) throw new Error("No stored archives to verify.");
for (const receipt of receipts) {
  const result = await verifyReceipt(receipt);
  console.log(
    JSON.stringify(
      { id: receipt.id, pieceCid: receipt.pieceCid, ...result },
      null,
      2,
    ),
  );
  if (!result.verified) process.exitCode = 1;
}
