# FilecoinTLDR alignment review

Private self-review using the sponsor evaluator prompt fetched with `loops evaluate`. This is an evidence-based alignment assessment, not a score or a prediction. Visible weights are 30/25/20/15 (90 total); no additional criterion is invented.

## Alignment summary

Memento directly implements the challenge’s financial decision loop: it reads its own Filecoin Pay state, changes retention choices under pressure, refuses unaffordable writes, stores selected memory on Filecoin, and funds existing rails when reserve runway falls below policy. The core build is working on Calibration and can be independently verified. Public showcase links and the user-approved submission remain outstanding.

## What is genuinely strong

- **Real autonomous refusal:** receipt `a56362eb` observed an empty wallet and deferred storage. Receipt `d95d79de` refused an approximately 0.24 USDFC/month quote under a 0.10 cap despite wallet funds. Actual implementation: `src/lib/server/runner.ts`, `src/lib/agent/gate.ts`, `public/evidence/latest.json`.
- **Retention changes:** later real archives compacted two memories and deferred three. Protected originals remained byte-for-byte intact. Implementation: `src/lib/agent/engine.ts`, `src/lib/agent/engine.test.ts`.
- **Real storage and payments:** three archives stored with Synapse, each included in provider 4/dataset 33836 and provider 2/dataset 33835. Deposit/approval and maintenance transactions are present in receipts. Implementation: `src/lib/server/filecoin.ts`, `src/lib/server/runner.ts`, `src/lib/server/maintain.ts`.
- **Independent verification:** fresh downloads, SHA-256 equality, wallet archive signatures, newer full financial receipt signatures, and onchain PieceCID inclusion all passed. Implementation: `src/lib/server/verify.ts`, `scripts/verify-evidence.ts`.
- **Maintenance without duplication:** replay receipt `820789bb` topped up roughly 0.016 tUSDFC for existing rails, without another archive upload. The worker checks health even when input is already stored.
- **Inspectable UX:** functional decision lab, memory inspector, custom input, policy controls, real receipts, and one-click verification tested in desktop Chrome and at 390px width. Implementation: `src/components/memento.tsx`, `docs/QA.md`.

## Gaps and risks

- The user has chosen to deploy on Vercel personally. A public demo URL is not yet supplied.
- A short recording and public X post still need to be created/published by the user. Copy and recording script are ready in `docs/SHOWCASE.md`.
- The runtime uses a transparent deterministic policy workflow and extractive compaction. Do not describe it as LLM inference or learned semantic valuation.
- The bundled public evidence is recorded; the deployed observer reads current balances and re-verifies archives, but the autonomous writer runs locally or on a persistent host. Do not say a worker runs continuously on Vercel.
- Retained utility is a heuristic over memory priorities; compaction is not a guarantee of preserving all facts. Existing paid files are not pruned, and no existing rail savings from deletion are claimed.
- Public submission fields include a required logo. `public/logo.png` is ready; no form fields have been submitted.

## Per-criterion assessment

| Criterion                         | Current evidence                                                                                                          | Most useful remaining improvement                                                                         |
| --------------------------------- | ------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------- |
| Autonomous budget decisions · 30% | Live refusal, selection, bounded deposit, and maintenance decisions are implemented and recorded.                         | Lead the recording with the strict-cap refusal and maintenance decision; show the exact quote and policy. |
| Working demo quality · 25%        | Production build and 17 tests pass; Chrome interaction flow and independent verification pass.                            | Deploy, then run the same smoke flow on the user's public URL.                                            |
| Meaningful use of Filecoin · 20%  | Real Pay account/rail reads, real two-provider Synapse storage, real deposits, PDP inclusion, and fresh retrieval checks. | Keep transaction and provider links visible during the walkthrough.                                       |
| Clarity + public showcase · 15%   | README, AI build log, source, branded interface, submission draft, and recording script are ready.                        | Publish the demo/video/X links after the user reviews them.                                               |

## Bounty fit

The first, second, and third prizes use the same challenge/rubric; they are ranking awards, not distinct technical tracks. Technical alignment is strong for all three, while submission completeness is **partial** until real public showcase links and user approval are supplied. No placement prediction is made.

## Top three next steps

1. User deploys the public read-only demo on Vercel; verify its real receipt endpoint and browser flow.
2. Record the concise walkthrough and publish the reviewed X post with demo and repository links.
3. User reviews the submission draft, uploads the logo, and explicitly authorizes final submission before 6 September 2026, 00:00 UTC (05:30 IST).
