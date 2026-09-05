import { decideLive } from "@/lib/server/decide";
import type { Policy } from "@/lib/agent/types";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

/** Absent overrides must stay absent: an explicit undefined would shadow the default. */
function readOverrides(params: URLSearchParams): Partial<Policy> {
  const overrides: Partial<Policy> = {};
  const numeric = {
    cap: "maxMonthlyUsdfc",
    reserveDays: "reserveDays",
    minUtility: "minUtility",
  } as const;
  for (const [key, field] of Object.entries(numeric)) {
    const raw = params.get(key);
    if (raw === null || raw.trim() === "") continue;
    const value = Number(raw);
    if (!Number.isFinite(value)) throw new Error(`${key} must be a number.`);
    overrides[field] = value;
  }
  if (params.has("compaction"))
    overrides.allowCompaction = params.get("compaction") !== "false";
  return overrides;
}

/** Read-only: live account state through the real policy engine and budget gate.
 * Overrides let a reviewer move a limit and watch the verdict change against the
 * same onchain numbers. No signer is loaded here, so nothing can be broadcast. */
export async function GET(request: Request) {
  let overrides: Partial<Policy>;
  try {
    overrides = readOverrides(new URL(request.url).searchParams);
  } catch (e) {
    return Response.json(
      { error: e instanceof Error ? e.message : "Invalid override." },
      { status: 400 },
    );
  }
  try {
    return Response.json(await decideLive(overrides), {
      headers: { "Cache-Control": "no-store" },
    });
  } catch (e) {
    const invalid = e instanceof Error && e.name === "ZodError";
    return Response.json(
      {
        error: invalid
          ? "Policy override is outside the accepted range."
          : "Live decision could not complete. The Calibration RPC may be unavailable; no verdict is assumed.",
      },
      { status: invalid ? 400 : 503 },
    );
  }
}
