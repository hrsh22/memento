# Submission draft — user approval required

Nothing has been submitted to Loops House and no social post has been published. The fields below are ready to paste once the X post URL exists.

Loops requires seven things: title, short description, live demo link, repo link, Filecoin integration explanation, AI build log, public X post link.

## Fields

**Title:** Memento

**Tagline:** An agent that knows what it can afford to remember.

**Repository:** https://github.com/hrsh22/memento

**Live demo:** https://memento-sigma-rosy.vercel.app

**Video:** https://memento-sigma-rosy.vercel.app/watch (direct MP4: https://memento-sigma-rosy.vercel.app/showcase/memento-demo.mp4)

**Project logo:** upload `public/logo.png` (512 × 512).

**Public X post:** _[paste the published URL here before submitting]_

**AI build log:** https://github.com/hrsh22/memento/blob/main/docs/AI-BUILD-LOG.md

## Short description

Memento is an autonomous memory treasury on Filecoin. It reads its own Filecoin Pay balance and runway, protects essential memories, compacts valuable context into verbatim excerpts, refuses writes it cannot afford, and funds a reserve within explicit limits.

You can make it decide right now. On the Live onchain tab, drag the monthly spending cap and press "Run a live decision now": it reads this wallet's balance, runway, rails, and the onchain price list at the current epoch, then runs the real policy engine and budget gate. Set the cap below the projected cost and the same funded account gets refused. No wallet or signup needed, and the endpoint holds no signer so it cannot broadcast.

Four decisions from an actual recorded run are also on record, each independently verifiable: a cap refusal, a stored two-provider archive, a cumulative-fee refusal, and duplicate prevention.

## Pitch

An agent that remembers everything eventually runs out of money. An agent that forgets indiscriminately becomes useless. Memento treats memory as a portfolio of future usefulness: preserve the irreplaceable, condense the useful, decline the noise.

The decision is the product, so every decision is inspectable. `budgetGate` in `src/lib/agent/gate.ts` compares integer base units and returns one sentence; that exact sentence is what appears in the UI, the receipt, and the API response. There is no place where a refusal is narrated rather than computed.

Judges can trigger a decision against live onchain state, or verify the recorded ones: `/api/showcase` re-downloads both provider copies and checks PieceCID inclusion in two live PDP datasets, returning `verified: true` in about a second.

## How Filecoin is used

Synapse SDK 2.0.0 reads Filecoin Pay account summaries, reserves, runway, wallet balances, live price lists, and rails. The agent quotes exact archive bytes against two resolved provider contexts, enforces integer recurring-cost limits plus durable rolling operation-fee and reserve-funding allowances, executes the preparation deposit/approval transaction when affordable, and stores selected memories on Filecoin Warm Storage. Fresh downloads from each registered provider must match the archive SHA-256. Independent verification checks signatures and the PieceCID's inclusion in both live PDP datasets.

Balances, payment rails, and proofs are real and onchain on Calibration. Nothing is hardcoded or simulated outside the clearly labelled Decision lab. No mainnet funds are used.

## What makes it different

- A judge can trigger a real budget decision on live onchain state, not just replay a log.
- A visible counterfactual: storing every memory individually versus selecting and bundling.
- Memory value changes behaviour under budget pressure, with immutable protection for pinned sources.
- Real financial refusals and bounded reserve maintenance, not just automatic uploads.
- Signed financial decisions and one-click fresh verification against both providers' onchain datasets.
- A deterministic agent workflow that stays reproducible without an LLM API key.

## Limitations disclosed in the submission

`/api/decide` projects recurring cost from the live price list; the funded worker additionally obtains an exact Synapse quote before broadcasting. `/watch` is a signed event-log visualization, not a screen recording. Spending limits are application-level policy, not a deployed spending-limit contract. Receipts prove integrity, not semantic correctness.

## Remaining user actions

1. Publish the X post (copy in `docs/SHOWCASE.md`), attaching `public/showcase/memento-demo.mp4`.
2. Paste its real URL into the Public X post field above.
3. Push the repo so the live decision feature is deployed, and confirm https://memento-sigma-rosy.vercel.app/api/decide responds.
4. Run `loops project create` / `loops project update` and submit.

Every link must be real and public. Do not submit placeholders.
