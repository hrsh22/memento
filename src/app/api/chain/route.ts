import { readChain } from "@/lib/server/filecoin";
export const dynamic = "force-dynamic";
export async function GET() {
  try {
    return Response.json(await readChain(), {
      headers: { "Cache-Control": "no-store" },
    });
  } catch {
    return Response.json(
      {
        error:
          "Calibration RPC is unavailable. No financial decision will use stale or simulated balances.",
      },
      { status: 503 },
    );
  }
}
