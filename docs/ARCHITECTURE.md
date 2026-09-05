# Architecture and trust boundaries

## Agent decision path

`src/lib/server/filecoin.ts` creates Synapse on Calibration (chain 314159). It reads `payments.accountSummary()`, wallet USDFC, native gas balance, the price list, and payment rails. No simulated value can satisfy the live executor’s balance check. RPC failures stop a cycle.

`src/lib/agent/engine.ts` is a pure, deterministic planner. Importance, access count, and age define a score. Pinned memory overrides every cutoff. Under pressure, eligible long text is compacted using ordered, verbatim sentence extraction. Deferred content remains local. These are memory admission decisions; the program never deletes a stored paid piece.

`src/lib/server/runner.ts` validates inputs, attaches original source hashes, and builds an archive. It resolves two provider contexts and calls `storage.prepare()` using exact serialized bytes and required reserve epochs. The live monthly cap is compared against the total existing account rate plus the quote’s rate delta, rather than just the affected datasets. Every financial comparison uses bigint base units.

`src/lib/agent/gate.ts` permits a write only when the monthly cap, top-up cap, available wallet balance, and gas threshold are satisfied. Preparation may create a deposit/approval transaction. This is application-level policy; the official SDK grants Warm Storage operator approval, and no custom spending-cap contract is claimed.

`src/lib/server/maintain.ts` runs before treating duplicate input as a no-op. When existing runway falls below the reserve threshold, it tops up to the threshold plus two days, within the same budget gates. It does not re-upload unchanged data.

## Evidence chain

1. Original source text → SHA-256 in each memory decision.
2. Exact serialized archive → SHA-256 → agent EIP-191 archive signature.
3. Synapse upload → successful provider IDs, dataset IDs, piece IDs, PieceCID.
4. Fresh SDK download → hash comparison and matching decision ID.
5. Final financial receipt → canonical JSON → separate agent signature for newer receipts.
6. Independent verification → a separate fresh download from each provider URL resolved through the onchain registry, both signatures when present, and PDP Verifier reads confirming that the PieceCID is included in both live datasets.

`getNextChallengeEpoch` is read for context. Dataset inclusion is not a claim that all future proofs succeed. Retrieval integrity is not semantic correctness. The signature establishes which wallet attested the receipt, not an external guarantee of the policy’s wisdom.

## Persistence and concurrency

An exclusive `open(..., 'wx')` lock serializes CLI and API cycles across processes. Each state save writes a temporary file then atomically renames it. Paid-write intent is persisted before broadcasting. Pending or ambiguous failed broadcasts stop subsequent cycles. Successful archive receipts are retained as a deduplication ledger; no-op history is bounded separately.

Input normalization via Zod makes deduplication stable across object key ordering in incoming JSON. During development, introducing this normalization changed the fingerprint scheme once; the public evidence includes that migration upload. The final replay test prevented a second upload and maintained the reserve instead.

## Public viewer

The Next.js app serves the decision lab, live treasury reads, and receipts. Public mutation requests require the operator bearer token and are disabled when the token is absent. The Vercel setup intentionally has no signer or operator token. The observer reads the checked-in evidence bundle when no local agent state exists. It can verify existing evidence without a signer.

User-added lab memories exist only in React memory for that browser session. They are not uploaded. Lab values and chain values are labeled separately. The current UI uses synthetic local allocation as a preview even in the live overview; actual retained contents and financial quotes are available in the real receipt export.

## Limitations

- The planner is a deterministic agent workflow, not an inference-time LLM. Extraction cannot invent new facts but may omit relevant context.
- Utility scores describe prioritization, not measured factual completeness.
- The lab economics conservatively charge operation fees against available funds. Live Filecoin lifecycle reserve accounting is more detailed and is handled by the SDK.
- Multi-call RPC observations are not a single atomic snapshot; the runner requotes immediately before execution. No other program should spend from this isolated test wallet concurrently.
- The worker uses a persistent filesystem and is unsuitable for stateless serverless writes.
- The shipped archive data is synthetic research material plus actual integration results. It is not a production memory corpus.

## Rolling accounting and captured-run verification

`src/lib/agent/spending.ts` sums per-account reservations in a rolling 30-day window using integer token units. `src/lib/server/spending.ts` checks separate operation-fee and reserve-funding allowances under the worker lock, then persists the complete quoted reservation before any broadcast. Both upload and reserve-maintenance paths use it. Future timestamps remain charged across clock rollback. An exhausted cap refuses execution; uncertain transactions do not automatically refund the allowance. Missing accounting with existing assessed receipts fails closed.

Accounting starts at the ledger's explicit activation timestamp. Legacy transactions are not backfilled. The policy separates recurring-rate, one-off-fee, reserve-funding, wallet-balance, and gas checks. It does not describe deposits as consumed storage fees or claim to cap tFIL gas expenditure.

`scripts/record-run.ts` captured actual events from four sequential scenarios. `public/showcase/run.json` includes all original events, four financial receipts, fresh two-provider verification, and a wallet signature over the canonical manifest hash. `src/lib/server/recording.ts` verifies that manifest and every decision, then independently re-verifies the stored archive. The video is a clearly labeled visualization of these events with waiting intervals shortened. Viewing it does not invoke the writer.

Compaction now preserves decimal sentence boundaries, URLs, and all explicitly marked critical constraints in addition to ranked excerpts. Six annotated fixtures cover essential facts. This is a regression benchmark, not a downstream task-quality or universal semantic guarantee.
