# FilecoinTLDR alignment review

Reassessed on 6 September 2026 (IST) after fetching the current `loops evaluate --event filecointldr-builder-challenge-cycle-4 --sponsor filecointldr` prompt. This is the coding agent's review of the repository and browser-tested product, not independent judging. Loops returns review instructions, not a numeric judging result.

Public app: https://memento-sigma-rosy.vercel.app

Real-run walkthrough: https://memento-sigma-rosy.vercel.app/watch

## Alignment summary

Memento directly implements the challenge: live financial observations drive memory admission, bounded reserve funding, and refusal. The original gaps in cumulative spending, independent retrieval of both copies, loading feedback, and a concrete real-run walkthrough have been addressed. Public showcase completion remains user-owned: the X post and final Loops submission are not yet verified.

## What's genuinely strong

- **Observe, decide, act:** `src/lib/server/filecoin.ts` reads Filecoin Pay, wallet balances, rates, and rails. `runner.ts` passes the observations through `src/lib/agent/engine.ts`, prepares exact bytes with two provider contexts, and checks financial gates before execution. `maintain.ts` replenishes an existing reserve without uploading a duplicate.
- **Cumulative limits are implemented:** `src/lib/agent/spending.ts` uses integer units for separate rolling 30-day fee/funding allowances. `src/lib/server/spending.ts` persists reservations under the worker lock before broadcast. Integration tests cover restart persistence and missing-ledger refusal. Reservations survive uncertain failures.
- **Real refusal demonstrated:** `public/showcase/run.json` records receipt `0a94e53e`: 0.022 tUSDFC reserved plus 0.022 requested exceeds the configured 0.03 allowance. The next paid upload was refused. The same continuous run includes a recurring-rate refusal, an actual 6,838-byte archive, and duplicate prevention.
- **Real Filecoin integration:** `runner.ts` stores through Synapse. `src/lib/server/verify.ts` resolves both provider URLs from the registry, independently downloads and validates both copies, and checks PieceCID inclusion in two distinct live datasets. Four real archives and ten decisions are present in `public/evidence/latest.json`.
- **Inspectable evidence:** `src/lib/server/recording.ts` verifies the signed complete run manifest, all four signed financial decisions, and fresh archive evidence. `/watch` exposes the captioned 93-second event visualization, original event transcript, signed download, and independent verification button. Chrome verified all four signatures and both provider copies on the credential-free production build.
- **Better memory regression coverage:** `src/lib/agent/engine.ts` preserves decimal values, URLs, and explicitly marked critical constraints in addition to ranked verbatim excerpts. Six annotated essential-fact fixtures pass. The UI now says "Priority retained" rather than suggesting measured factual retention.
- **Working product:** the introduction, editable profile, scenario lab, real receipt views, video playback, and verification are wired. All 37 tests, lint, TypeScript, and production build pass. Chrome desktop and 390-pixel mobile checks show working navigation and no horizontal overflow.

## Gaps and risks

1. **Public showcase is incomplete until the user posts.** `docs/SHOWCASE.md` has a ready MP4 and post draft. `docs/SUBMISSION-DRAFT.md` has actual demo/video URLs and one explicit X URL placeholder. No social post or project submission was performed. The current evaluator says no submitted project record was provided.
2. **Recorded execution remains recorded.** The walkthrough visualizes events captured from actual executions, with waiting intervals shortened. It is not a screen recording of the browser or a continuously hosted public writer. Inputs and policy changes are predetermined scenario stimuli; the worker makes its own financial decisions in response. A judge can rerun the local worker, inspect exact signed events, and freshly retrieve the archives.
3. **Operational boundaries remain deliberate.** The filesystem-backed writer needs a persistent host. Ambiguous broadcasts stop for manual reconciliation. Spending tracking starts at its recorded activation timestamp, with earlier transactions excluded. Operation fees, funding, recurring rates, and gas are distinct. These are app-level guards, not a custom onchain spending-limit contract.
4. **Memory quality is bounded.** Six regression fixtures establish specific essential-fact preservation, not general downstream task success. Priority remains a transparent heuristic. Existing paid pieces and rails are not automatically deleted or cancelled. Current retrieval and inclusion do not guarantee future availability.

## Per-criterion assessment

| Published criterion              | Current state                                                                                                                            | Remaining improvement                                                                                                             |
| -------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| Autonomous budget decisions, 30% | Live observations drive admission, refusal, reserve top-up, and deduplication. Durable cumulative allowances now guard repeated actions. | Persistent hosting and automated reconciliation would strengthen operation beyond the hackathon prototype.                        |
| Working demo quality, 25%        | Public explorer, interactive lab, actual captured run, signed transcript, fresh two-copy verification, and 37 passing tests.             | An additional narrated screen walkthrough would provide more product context than the event visualization alone.                  |
| Meaningful use of Filecoin, 20%  | Actual Pay balances/rails, Synapse uploads, two registry-resolved provider retrievals, and both PDP dataset inclusions.                  | Preserve the clear distinction between observed integrity and future availability. No missing sponsor integration was identified. |
| Clarity and public showcase, 15% | Plain-language introduction, public app/repo, video, build log, and complete technical submission copy.                                  | User must publish the X showcase and insert its real URL before final submission.                                                 |

The published weights total 90. This review does not invent a missing criterion.

## Bounty fit

The 1st, 2nd, and 3rd prizes share the same challenge; they are ranked awards, not separate integration tracks. Technical requirements are met in this prototype. For each prize, overall submission readiness remains partial until the public X showcase and final submission are completed by the user. The review cannot predict placement.

## Top three next steps

1. Watch the real-run page and use its verifier. The finished video and signed evidence are ready for the user's review.
2. Publish the prepared X post with the MP4, then replace the X URL placeholder in the submission draft.
3. Review the exact submission fields and submit before 6 September 00:00 UTC (05:30 IST). Final submission remains under user control.

## Separate informal estimate requested by the user

The evaluator's normal output is qualitative. Since the user explicitly asked for a score, this separate estimate is provided as a subjective readiness aid only. It is not a Loops-generated score, independent validation, or a prediction. The same coding agent implemented and reviewed this product.

| Criterion                   | Informal estimate | Remaining deduction                                                                              |
| --------------------------- | ----------------: | ------------------------------------------------------------------------------------------------ |
| Autonomous budget decisions |           29 / 30 | Manual recovery for ambiguous broadcasts limits unattended operation.                            |
| Working demo quality        |           24 / 25 | Real events are visualized; an additional narrated product screen walkthrough would be stronger. |
| Meaningful use of Filecoin  |           20 / 20 | The required integrations are implemented and independently retrievable.                         |
| Clarity and public showcase |           11 / 15 | Public X showcase and final submission are still pending.                                        |
| Total                       |       **84 / 90** | **Approximately 93 / 100 normalized over the listed criteria.**                                  |

Treat this as a rough 90–95 readiness range, not precise measurement. A defensible 100/100 cannot be asserted while showcase requirements are incomplete, and final judging remains outside the builder's control. Posting does not automatically guarantee any particular score.
