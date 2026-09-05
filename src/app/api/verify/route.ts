import { readState } from "@/lib/server/store";
import { verifyReceipt } from "@/lib/server/verify";
export const dynamic = "force-dynamic";
export const maxDuration = 60;
export async function GET(request: Request) {
  const id = new URL(request.url).searchParams.get("id");
  const receipt = (await readState()).receipts.find((r) => r.id === id);
  if (!receipt)
    return Response.json({ error: "Receipt not found." }, { status: 404 });
  try {
    return Response.json(await verifyReceipt(receipt), {
      headers: { "Cache-Control": "no-store" },
    });
  } catch {
    return Response.json(
      {
        error:
          "Fresh verification could not complete. The provider may be unavailable; no success is assumed.",
      },
      { status: 503 },
    );
  }
}
