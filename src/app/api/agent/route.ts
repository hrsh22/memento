import { timingSafeEqual } from "node:crypto";
import { readState } from "@/lib/server/store";
import { runCycle } from "@/lib/server/runner";
import { DEFAULT_POLICY } from "@/lib/agent/memories";
export const dynamic = "force-dynamic";
export const maxDuration = 300;
export async function GET() {
  return Response.json(await readState(), {
    headers: { "Cache-Control": "no-store" },
  });
}
export async function POST(request: Request) {
  const expected = process.env.AGENT_API_TOKEN;
  const authorization = request.headers.get("authorization");
  const provided = authorization?.startsWith("Bearer ")
    ? authorization.slice(7)
    : undefined;
  if (
    !expected ||
    !provided ||
    Buffer.byteLength(provided) !== Buffer.byteLength(expected) ||
    !timingSafeEqual(Buffer.from(provided), Buffer.from(expected))
  )
    return Response.json(
      {
        error:
          "Operator authorization required. The public demo cannot spend the agent wallet.",
      },
      { status: 401 },
    );
  try {
    return Response.json(await runCycle(DEFAULT_POLICY));
  } catch {
    return Response.json(
      { error: "Cycle stopped. Inspect the decision log for details." },
      { status: 500 },
    );
  }
}
