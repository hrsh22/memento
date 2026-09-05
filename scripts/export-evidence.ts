import { readState } from "../src/lib/server/store";
import { mkdir, writeFile } from "node:fs/promises";
const state = await readState();
if (state.running)
  throw new Error(
    "Wait for the active cycle to finish before exporting evidence.",
  );
await mkdir("public/evidence", { recursive: true });
await writeFile(
  "public/evidence/latest.json",
  JSON.stringify(
    {
      ...state,
      running: false,
      evidenceMode: "recorded",
      exportedAt: new Date().toISOString(),
    },
    null,
    2,
  ),
);
console.log(
  `Exported ${state.receipts.length} public receipts. Only synthetic demo data belongs in this public evidence file.`,
);
