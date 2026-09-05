import { verifyRecording } from "@/lib/server/recording";
export const dynamic = "force-dynamic";
export const maxDuration = 60;
export async function GET() {
  try {
    return Response.json(await verifyRecording(), {
      headers: { "Cache-Control": "no-store" },
    });
  } catch {
    return Response.json(
      { error: "Verification could not complete. No success is assumed." },
      { status: 503 },
    );
  }
}
