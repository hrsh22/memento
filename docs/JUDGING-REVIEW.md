# FilecoinTLDR alignment review

Evaluated on 6 September 2026 (IST), against application commit `1254237`, using a newly fetched `loops evaluate --event filecointldr-builder-challenge-cycle-4 --sponsor filecointldr` prompt. The command returns a rubric and review instructions; this report is the coding agent's assessment of the repository and deployed product. It is not independent judging or a Loops-generated score.

Public demo: https://memento-sigma-rosy.vercel.app

## Alignment summary

Memento implements the central challenge: it reads Filecoin Pay financial state, changes memory retention under pressure, refuses unaffordable quotes, stores selected data, and replenishes a reserve without repeating an upload. The public product now has a clear introduction, an interactive scenario lab, actual recorded decisions, current chain data, and fresh archive verification. Its main remaining weaknesses are visibility of a new autonomous decision, incomplete public showcase evidence, and limits in long-running budget accounting.

## Verified strengths

- **Financial observations drive behavior.** [`src/lib/server/filecoin.ts:28`](../src/lib/server/filecoin.ts#L28) reads account summary, wallet balances, gas, rails, and price lists. [`src/lib/server/runner.ts:49`](../src/lib/server/runner.ts#L49) passes those observations into the planner; [`src/lib/agent/engine.ts:80`](../src/lib/agent/engine.ts#L80) changes retention mode with runway.
- **Genuine refusal before paid execution.** [`src/lib/server/runner.ts:140`](../src/lib/server/runner.ts#L140) checks the exact SDK quote with integer token units, and returns before execution if the gate fails. Recorded receipt `d95d79de` rejected approximately 0.24 USDFC/month under a 0.10 cap despite available wallet funds. The earlier `a56362eb` receipt records an unfunded refusal. Both are in [`public/evidence/latest.json`](../public/evidence/latest.json).
- **Actual Filecoin storage.** [`src/lib/server/runner.ts:129`](../src/lib/server/runner.ts#L129) prepares two provider contexts and exact serialized bytes; line 196 uploads through Synapse. Three recorded archives have PieceCIDs and provider/dataset identifiers.
- **Reserve maintenance works on unchanged input.** [`src/lib/server/runner.ts:84`](../src/lib/server/runner.ts#L84) detects a previously stored input and calls [`src/lib/server/maintain.ts:8`](../src/lib/server/maintain.ts#L8). Receipt `820789bb` records a roughly 0.016 tUSDFC top-up without a duplicate upload.
- **Evidence is independently checkable.** [`src/lib/server/verify.ts:11`](../src/lib/server/verify.ts#L11) checks archive and available financial signatures, retrieves and hashes bytes, checks decision identity, and reads inclusion in both live datasets. At 00:58:51 IST, the deployed Chrome UI freshly verified the latest 6,912-byte archive, both signatures, SHA-256, and two dataset inclusions. This is retrieval/inclusion evidence, not a claim about future PDP challenge success.
- **A usable product and reproducible checks.** The landing page at [`src/app/page.tsx`](../src/app/page.tsx) explains the problem and offers lab/evidence routes. The deployed evidence route loaded all six receipts. All 17 tests passed again during this review, and [CI for the reviewed application commit](https://github.com/hrsh22/memento/actions/runs/33985612825) passed tests, lint, TypeScript, and production build. Prior desktop/mobile interaction checks are recorded in [`docs/QA.md`](QA.md).

## Gaps and risks

### 1. A new autonomous decision is not visible from the public viewer

The event specifically values watching the agent notice, weigh, and act. The public site's animated Run decision flow is a simulation ([`src/components/memento.tsx:469`](../src/components/memento.tsx#L469)); real activity is recorded, with current balances and fresh verification. The actual worker loop exists ([`scripts/agent.ts:11`](../scripts/agent.ts#L11)), but runs locally or on a persistent host. The viewer is labeled honestly, so this is a demonstration gap rather than a fake integration.

Most useful improvement: capture one uninterrupted real worker cycle with its observed state, policy decision, and receipt visible. A live read-only feed from a persistent worker would make this stronger, but should not require giving the public site spending credentials.

### 2. The monthly cap is a recurring-rate cap, not a complete monthly spending ledger

[`src/lib/server/runner.ts:137`](../src/lib/server/runner.ts#L137) compares existing recurring rates plus the quoted rate delta against the monthly cap. Operation fees are recorded at line 151, but do not accumulate against a rolling spending cap. Top-ups are limited per operation ([`src/lib/server/maintain.ts:31`](../src/lib/server/maintain.ts#L31)); there is no aggregate time-window allowance. Many changing inputs could incur repeated one-off fees while recurring charges remain under the limit. Wallet balance and per-operation gates still constrain each execution.

Most useful improvement: explicitly label the existing limit as recurring storage cost, and add a cumulative operation-fee/top-up budget with a durable accounting window if long-running autonomy is claimed.

### 3. Public showcase and submission completeness are not verified

The deployed demo and GitHub repo are public and working. A published demo recording and X showcase URL have not been supplied or verified; [`docs/SHOWCASE.md`](SHOWCASE.md) still contains draft material. A fresh `loops project get` returned `exists: false`. No project record was created during evaluation, consistent with the user's approval requirement.

Most useful improvement: finish the recording and public post, then review the final submission fields. Do not submit placeholder links.

### 4. Memory quality and persistence are prototype-level

Utility depends on input priorities, access counts, and age ([`src/lib/agent/engine.ts:10`](../src/lib/agent/engine.ts#L10)); compaction keeps four keyword-ranked verbatim sentences (line 25). The retained-utility metric gives compacted memories their full heuristic score (line 145), so it is not a measured percentage of facts preserved. Pinned memories are protected, but extraction can omit essential relationships. There is no downstream task-quality benchmark.

The writer uses a filesystem ledger and exclusive lock ([`src/lib/server/store.ts:80`](../src/lib/server/store.ts#L80)); ambiguous broadcasts stop for manual reconciliation. This is cautious for a prototype, but not unattended fault recovery. Existing archives are not deleted and current rails are not cancelled. Avoid claiming automatic reclamation of previously paid storage.

## Per-criterion assessment

| Published criterion              | Current assessment                                                                                               | Most useful improvement                                                                                                                                        |
| -------------------------------- | ---------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Autonomous budget decisions, 30% | Strong implemented observation/refusal/retention/top-up loop; exact-byte quote gates and deduplication are real. | Show a new real decision end to end and account for cumulative non-recurring spend.                                                                            |
| Working demo quality, 25%        | Public deployment works; introduction and lab are clear; real receipts and fresh verification passed in Chrome.  | Add the real-worker walkthrough and use a loading state instead of briefly showing an empty receipt history while fetching.                                    |
| Meaningful use of Filecoin, 20%  | Real Filecoin Pay, Synapse uploads, two-provider dataset inclusion, signatures, and retrieval.                   | Keep exact transaction/inclusion evidence visible; distinguish retrieval from future availability and avoid overclaiming independent retrieval of both copies. |
| Clarity and public showcase, 15% | Landing page, README, build log, repository, and public demo exist.                                              | Supply and verify the actual video and X post, then complete the user-approved submission.                                                                     |

Published weights sum to 90. No missing 10-point criterion is invented.

## Bounty fit

The first, second, and third prizes share the same challenge and are ranking awards, not separate integration tracks. Technical alignment is substantial for each. Submission/showcase completeness remains partial until the required real links and user-approved submission exist. This review cannot predict placement.

## Top three next steps

1. Record an uninterrupted real worker decision and show the signed result through the public verifier. Lead with a financially meaningful refusal or bounded top-up.
2. Clarify the recurring-cost cap, and implement cumulative one-off spending limits before claiming comprehensive unattended budget control.
3. Publish the reviewed video/X showcase, add the real URLs to the submission draft, and obtain the user's explicit final-submission approval.

## Separate, informal score estimate requested by the user

The Loops evaluator explicitly provides qualitative feedback and no numeric scores. The following is the coding agent's subjective estimate, added only because the user requested one. It is not an output of the Loops service, an official judge score, an independent review, or a placement prediction. The same agent built and reviewed the product, so this estimate should not be treated as external validation.

| Criterion                   | Estimated points | Reason for the deduction                                                                                                        |
| --------------------------- | ---------------: | ------------------------------------------------------------------------------------------------------------------------------- |
| Autonomous budget decisions |          24 / 30 | Good real decisions; limited cumulative accounting and limited public visibility of a new decision.                             |
| Working demo quality        |          22 / 25 | Public app and verification work; real execution is presented as recorded evidence, with a small loading-state rough edge.      |
| Meaningful use of Filecoin  |          18 / 20 | Substantial real integration; verification checks inclusion and a retrieved payload, not a complete ongoing availability audit. |
| Clarity and public showcase |           8 / 15 | Clear app and documentation; published video/X evidence and final submission remain unverified/incomplete.                      |
| Total on the listed rubric  |      **72 / 90** | **Approximately 80 / 100 when normalized across the four published criteria.**                                                  |

Treat 80/100 as a rough current-readiness estimate, not a measured result. No new paid transaction, project creation, final submission, or social post was performed for this review.
