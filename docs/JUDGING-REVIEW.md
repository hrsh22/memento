# Self-review against the FilecoinTLDR criteria

This is the build team's own read of the repository, kept in the repo so the
weak points are written down rather than discovered. It is not judging, and it
carries no score. Loops returns review instructions, not a numeric result.

Public app: https://memento-sigma-rosy.vercel.app/live
Recordings: https://memento-sigma-rosy.vercel.app/watch

## What is verifiable, with the file that does it

- **One gate, three callers.** `src/lib/agent/gate.ts` compares integer base
  units and returns one sentence per outcome. It is called from
  `src/lib/server/runner.ts:141` (the funded worker), `src/lib/server/maintain.ts:27`
  (reserve top ups) and `src/lib/server/decide.ts:51` (the public read-only
  endpoint). A reviewer moving the slider runs the same function that spends.
- **A decision anyone can trigger.** `GET /api/decide` reads Filecoin Pay at the
  current epoch and returns store or refuse. It loads no signer and never
  reaches `createContexts`, `prepare`, `upload` or `depositWithPermit`, so a
  public request cannot broadcast or create a dataset.
- **Cumulative limits that survive a restart.** `src/lib/agent/spending.ts`
  tracks separate rolling 30-day allowances for fees and reserve funding.
  `src/lib/server/spending.ts` persists the reservation under the worker lock
  before any broadcast, so an uncertain outcome stays charged.
- **Real Filecoin calls.** `src/lib/server/filecoin.ts` reads account summaries,
  wallet balances, the onchain price list and rails. `src/lib/server/verify.ts`
  resolves both providers from the registry, downloads both copies again, and
  checks PieceCID inclusion in two distinct live PDP datasets.
- **Recorded execution that re-verifies.** `public/showcase/run.json` holds a
  signed run including receipt `0a94e53e`, where 0.022 already reserved plus
  0.022 requested exceeded a 0.03 allowance and the write was refused.
- **45 tests**, lint, TypeScript and a production build all pass.

## Where a skeptical reviewer has a point

1. **No worker on a schedule in production.** The public deployment holds no
   private key, so the funded worker runs separately rather than as a cron.
   That is deliberate: the rolling spend ledger, the duplicate-write ledger and
   the concurrency lock all need a persistent filesystem, and a stateless
   function would reset all three and let the agent exceed its own limits.
   `docs/DEPLOYMENT.md` says not to run the writer inside a Vercel function.
   The trade is real, and it is safety over always-on.
2. **The live decision estimates, it does not quote.** `/api/decide` projects
   recurring cost from the live onchain price list. Only the funded worker gets
   an exact Synapse quote for serialized bytes before broadcasting.
3. **The live decision uses a fixed memory set.** The spending cap and the chain
   state vary; the memories do not. At these payload sizes the other policy
   levers produce no visible change in the verdict, so exposing them would have
   added controls that do nothing.
4. **Two videos, two kinds of evidence.** The live-decision clip is a real
   screen capture with two idle pauses cut. The worker-run video is a
   visualization of a signed event log, not a screen capture, and says so.
5. **Deterministic, not an LLM.** The runtime is a policy workflow. AI designed,
   built, critiqued and tested it, but no model infers monetary decisions at run
   time. The brief allows "agent, workflow, or tool".
6. **Memory quality is bounded.** Six regression fixtures cover specific
   essential-fact preservation, not general task success. Utility is a
   transparent heuristic. Existing paid pieces and rails are never deleted or
   cancelled, and current retrieval does not guarantee future availability.

## Weights

The four published criteria total 90, not 100. The Loops mentor stated 100
during ideation; the published numbers were kept. No missing criterion is
invented here, and no placement is predicted.
