import { readState } from "@/lib/server/store";
export const dynamic = "force-dynamic";
export async function GET() {
  const state = await readState();
  return Response.json(
    {
      schema: "memento.receipts.v1",
      exportedAt: new Date().toISOString(),
      receipts: state.receipts,
    },
    {
      headers: {
        "Content-Disposition": 'attachment; filename="memento-receipts.json"',
        "Cache-Control": "no-store",
      },
    },
  );
}
