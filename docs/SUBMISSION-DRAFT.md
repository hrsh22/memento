# Submission draft — user approval required

No project record has been created and nothing has been submitted to Loops House.

**Title:** Memento

**Tagline:** An agent that knows what it can afford to remember.

**Repository:** https://github.com/hrsh22/memento

**Project logo:** Upload `public/logo.png` (512 × 512).

**Live demo:** https://memento-sigma-rosy.vercel.app

**Video:** https://memento-sigma-rosy.vercel.app/watch (direct MP4: https://memento-sigma-rosy.vercel.app/showcase/memento-demo.mp4)

**Public X post:** [Add the user's published showcase URL]

## Short description

Memento is an autonomous memory treasury on Filecoin. It reads its own Filecoin Pay balance and runway, protects essential memories, compacts valuable context into verbatim excerpts, refuses unaffordable writes, and funds a reserve within explicit limits. Every real archive has two provider copies and an archive signature. Newer receipts also sign the full financial decision. Both copies can be freshly retrieved and checked against their live onchain datasets.

## Pitch

An agent that remembers everything eventually runs out of money. An agent that forgets indiscriminately becomes useless. Memento treats memory as a portfolio of future usefulness: preserve the irreplaceable, condense the useful, and decline the noise. Its decisions are visible and independently inspectable.

The demo includes an honest interactive scenario lab plus actual Calibration evidence: an unfunded refusal, a funded archive, a strict-cap refusal despite a funded wallet, compacted memory storage, and an autonomous top-up of existing rails without duplicate uploads.

The 93-second captioned walkthrough visualizes a signed real worker run: a rate-cap refusal, a 6,838-byte archive, a second write refused because 0.022 + 0.022 exceeds a 0.03 tUSDFC rolling allowance, and a duplicate prevented. The signed transcript includes all original event timestamps.

## How Filecoin is used

Synapse SDK 2.0.0 reads Filecoin Pay account summaries, reserves, runway, wallet balances, current price lists, and rails. The agent obtains a quote for exact archive bytes and two provider contexts, enforces integer recurring-cost limits and durable rolling operation-fee/reserve-funding allowances, executes the preparation deposit/approval transaction when affordable, and stores selected memories on Filecoin Warm Storage. Fresh downloads from each registered provider must match the archive SHA-256. Independent verification also checks signatures and the PieceCID's inclusion in both live PDP datasets.

No mainnet funds or simulated onchain balances are used. The lab is explicitly labeled. Memento does not claim that compressing tiny files removes dataset proving fees or cancels existing rails.

## What makes it different

- A visible counterfactual: blindly storing individual memories versus selecting and bundling useful knowledge.
- Memory value changes behavior under budget pressure, with immutable protection for pinned sources.
- Real financial refusal and bounded reserve maintenance, not just automatic uploads.
- Signed financial decisions and one-click fresh verification against both providers' onchain datasets.
- A transparent deterministic agent workflow that remains reproducible without an LLM API key.

## AI build log

https://github.com/hrsh22/memento/blob/main/docs/AI-BUILD-LOG.md

## Remaining user actions

Publish the X post, add its real URL, review the exact submission fields, and submit when ready. Deployment and the captioned real-run visualization are ready. The user retains final submission control. These links must be real and public; do not submit placeholders.
