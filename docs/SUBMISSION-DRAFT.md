# Submission draft — user approval required

No project record has been created and nothing has been submitted to Loops House.

**Title:** Memento

**Tagline:** An agent that knows what it can afford to remember.

**Repository:** https://github.com/hrsh22/memento

**Project logo:** Upload `public/logo.png` (512 × 512).

**Live demo:** [Add the user's Vercel deployment URL]

**Video:** [Add the user's short screen recording URL]

**Public X post:** [Add the user's published showcase URL]

## Short description

Memento is an autonomous memory treasury on Filecoin. It reads its own Filecoin Pay balance and runway, protects essential memories, compacts valuable context into verbatim excerpts, refuses unaffordable writes, and funds a reserve within explicit limits. Every real archive has two provider copies, a signed decision receipt, and an independent retrieval and onchain inclusion check.

## Pitch

An agent that remembers everything eventually runs out of money. An agent that forgets indiscriminately becomes useless. Memento treats memory as a portfolio of future usefulness: preserve the irreplaceable, condense the useful, and decline the noise. Its decisions are visible and independently inspectable.

The demo includes an honest interactive scenario lab plus actual Calibration evidence: an unfunded refusal, a funded archive, a strict-cap refusal despite a funded wallet, compacted memory storage, and an autonomous top-up of existing rails without duplicate uploads.

## How Filecoin is used

Synapse SDK 2.0.0 reads Filecoin Pay account summaries, reserves, runway, wallet balances, current price lists, and rails. The agent obtains a quote for exact archive bytes and two provider contexts, enforces integer financial limits, executes the preparation deposit/approval transaction when affordable, and stores selected memories on Filecoin Warm Storage. A fresh download must match the archive SHA-256. Independent verification also checks signatures and the PieceCID's inclusion in both live PDP datasets.

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

Deploy on Vercel, record the walkthrough, publish the X post, review the exact submission fields, and explicitly approve final submission. These links must be real and public; do not submit placeholders.
