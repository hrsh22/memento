# AI build log, 5 September 2026

Built collaboratively by Harsh Gupta and Codex for FilecoinTLDR Builder Challenge Cycle 4.

1. Read the installed Loops skill, the full challenge, sponsor resources, and visible judging criteria in Chrome. Confirmed the deadline as 6 September 2026, 00:00 UTC. Confirmed there was no existing project submission.
2. Consulted the Loops mentor for concept comparison. Queried the sponsor knowledge graph twice; both calls returned no relevant evidence. Used official Filecoin documentation and the installed Synapse SDK 2.0.0 source instead of inventing API behavior. The mentor incorrectly said 30+25+20+15=100; retained the actual published weights (90 total).
3. Selected Memento: useful memory admission, extractive compaction, cost-aware bundling, bounded top-ups, and verifiable financial receipts. Chose a quiet botanical dashboard with a layered memory sculpture to make retention decisions visible.
4. Scaffolded Next.js/TypeScript/Tailwind and installed actual shadcn components. Built the pure decision engine, accounting gate, responsive interface, memory inspector, policy controls, and receipts.
5. Harsh authenticated GitHub CLI. Created the public `hrsh22/memento` repository and pushed implementation milestones. Harsh funded a fresh Calibration-only wallet. No mainnet funds were used.
6. Verified the unfunded refusal on real account reads. Then ran actual Synapse deposit/approval, two-provider storage, retrieval, and hash comparison. Added an independent verifier using agent signatures and live PDP dataset inclusion.
7. Reviewed failure modes: duplicate writes, reserve maintenance on unchanged input, uncertain broadcast retries, concurrent CLI/API cycles, stale UI reads, finite numeric inputs, and public deployment without a wallet key. Added durable intent records, canonical receipt signatures, validation, and locks.
8. Ran a second live integration exercise: strict monthly-cap refusal, actual compaction and storage of new evidence, and a replay that topped up existing rails without another archive upload. Independently reverified all three stored archives.
9. Tested the real UI in Chrome at desktop and 390px mobile width. Exercised replay, memory inspection, custom memory entry, empty search results, policy changes, live receipt inspection, and independent verification. Fixed responsive overlap and strengthened secondary text contrast.
10. Prepared deployment instructions, judging review, a submission draft, and public showcase copy. Harsh chose to deploy on Vercel personally. No final Loops submission or public social post was made.

Runtime note: AI assisted the development and critique. The running agent is a transparent deterministic policy workflow. There is no hidden LLM API dependency or claim that a model inferred monetary decisions during the demo.

## Judging feedback improvements, 6 September 2026

Added durable rolling allowances for operation fees and reserve funding, preserving reservations before broadcast and across restarts. Added independent retrieval from both registered providers, decimal/URL-safe extraction with protected critical constraints, and explicit priority-retention labeling. Expanded regression coverage to 37 tests.

Captured an actual four-scenario Calibration run: refusal under a strict recurring cap, one new archive, cumulative fee refusal, and duplicate prevention. Signed the complete 22-event transcript and each financial decision. Generated a 93-second captioned visualization of the captured log and a public page that re-verifies the signature and both stored copies. Playback is explicitly labeled as recorded and does not execute new transactions.

The user retains X posting and final submission control. The evaluator supplies qualitative alignment instructions, not an official numeric score.

## Live decision endpoint, 5 September 2026

Re-read the challenge brief against the deployed product and found the weakest point: the brief asks that a judge "see the agent notice something, weigh it, and act – not just read a log afterwards," and every decision on the site was recorded. The live tab paired current balances with stale events, which reads as a dashboard over history rather than an agent deciding.

Added `GET /api/decide`. It reads Filecoin Pay at the current epoch and runs the same `planMemories` policy engine and `budgetGate` the funded worker uses. Rejected the alternative of reusing the worker's `createContexts`/`prepare` path for an exact SDK quote: `createContexts` can create a dataset onchain, and a public unauthenticated endpoint must not be able to spend or write. The endpoint therefore loads no signer and projects recurring cost from the live onchain price list, with that limit stated in the response payload, the UI, and the README.

Extracted `projectDecision` as a pure function so the lockup, fee, and deposit projection is testable, and covered every refusal branch the gate can return. Test count went from 37 to 44.

Rewrote the README to lead with three checks a judge can run in about a minute and consolidated the honest caveats into one Limitations section, rather than interleaving them with the claims they qualify.

## Screen recording and reasoning trace, 5 September 2026

Consulted the Loops mentor twice. Its first answer recommended building the live decision endpoint that had already shipped, so the session was corrected with the deployed URLs; the second answer, working from the real state, identified two gaps worth acting on and confirmed a third judgement.

Gap one: the live panel reported a verdict and six figures with no visible inference, which reads as a black box. Added a four-step trace rendered from the same response, covering what it observed at this epoch, what it selected under policy, what it priced against the onchain price list, and which limit the gate applied, plus one plain sentence for a reader who does not know what a payment rail is.

Gap two: no artifact per live decision. Added a JSON download. Live decisions are deliberately unsigned because the public deployment holds no key; that is now stated as a safety property rather than buried as a caveat.

Confirmed judgement: replacing the event-log animation was worth doing. Drove the deployed app under browser automation and captured a real screen recording of the cap moving from 0.50 to 0.10 USDFC while the account cost stayed at 0.24, flipping the same funded wallet from approved to refused. Converted to H.264, cut two idle stretches, and made it the first thing on `/watch`; the worker-run visualization follows it as the record of transactions that actually spent funds. Both videos are labelled for what they are.
