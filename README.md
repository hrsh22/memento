# Memento

**An AI agent should know what it can afford to remember.**

Memento is an autonomous memory treasury on **Filecoin Pay + Synapse SDK**. It reads its own onchain balance and runway, decides which memories are worth paying to keep, funds a bounded reserve, and leaves a receipt anyone can verify. Built for the [FilecoinTLDR Builder Challenge — Cycle 4](https://www.loops.house/filecointldr-builder-challenge-cycle-4).

The decision is the product. An unfunded agent refuses a write. A funded agent preserves what matters. **An over-budget quote is rejected even when the wallet is full.**

[Open the app](https://memento-sigma-rosy.vercel.app) · [Run a live decision](https://memento-sigma-rosy.vercel.app/live) · [Watch the recordings](https://memento-sigma-rosy.vercel.app/watch)

## For judges: four checks, about 90 seconds

**1. Make it decide, right now.** Open [the live tab](https://memento-sigma-rosy.vercel.app/live), drag the monthly cap, and press **Run a live decision now**. It reads this wallet's Filecoin Pay balance, runway, rails, and the onchain price list at the current epoch, then runs the real policy engine and budget gate. Set the cap below the projected recurring cost and the same funded account is refused. No wallet, key, or signup needed.

```bash
curl -s "https://memento-sigma-rosy.vercel.app/api/decide?cap=0.5"  | jq '{verdict, headline}'
curl -s "https://memento-sigma-rosy.vercel.app/api/decide?cap=0.05" | jq '{verdict, headline}'
# store  -> "Existing funds cover the reserve. Store without topping up."
# refuse -> "The projected recurring cost exceeds the monthly spending cap."
```

That endpoint holds no signer and never calls `createContexts` or `prepare`, so a public request cannot broadcast a transaction or create a dataset.

**2. Confirm the archives are really on Filecoin.** This re-downloads both provider copies and checks PieceCID inclusion in two live PDP datasets:

```bash
curl -s https://memento-sigma-rosy.vercel.app/api/showcase | jq '.verified, .archive.onchainCopies'
```

**3. Watch it happen, if you would rather not click.** [`/watch`](https://memento-sigma-rosy.vercel.app/watch) opens with a 25-second **screen recording of the deployed app** — not an animation — where the cap moves from 0.50 to 0.10 USDFC against an unchanged 0.24 cost and the funded wallet is refused. Below it is the 93-second visualization of the worker run that actually spent funds.

**4. Read the account yourself.** `GET /api/chain` returns the raw Calibration snapshot — epoch, rails, lockup, runway — or check [the wallet on Blockscout](https://filecoin-testnet.blockscout.com/address/0xA704353cB48030557c307cB743581D49eFA1eF80).

## What decides, and where

```text
Filecoin Pay account + wallet + onchain price list
                   ↓
       importance / use / age policy
                   ↓
 protect originals → extract useful passages → defer noise
                   ↓
        exact Synapse quote for the real archive bytes
                   ↓
 recurring cap + rolling fees/top-ups + wallet + gas gate
           ↙                       ↘
     refuse the write       fund reserve → store 2 copies
                                   ↓
                   retrieve → SHA-256 → signed receipt
```

The gate is `budgetGate` in `src/lib/agent/gate.ts`. It compares integer base units and returns the sentence that appears in the UI, the receipt, and the API. Every refusal a judge sees is that function's return value.

| Where | What it decides on |
| --- | --- |
| `GET /api/decide` | Live chain read → real policy + gate. Read-only, judge-triggerable. |
| `npm run agent:once` | The same decision, plus the exact Synapse quote, then executes. Needs a funded key. |
| `/watch` | A screen recording of a live decision, plus four decisions from an actual worker run, re-verified on demand. |
| `/demo` → Decision lab | Labelled simulation for exploring the policy without touching the chain. |

## The four decisions already on record

The [signed showcase run](public/showcase/run.json) captures an actual 135-second execution, presented as a 93-second captioned visualization with waiting intervals shortened:

1. **Refused** — a funded wallet still obeys the recurring-cost cap.
2. **Stored** — a 6,838-byte archive on two providers, retrieved and hash-checked.
3. **Refused** — cumulative fees: 0.022 used + 0.022 requested exceeds a 0.03 tUSDFC rolling allowance.
4. **Prevented** — identical input, so no duplicate paid upload.

All four run receipts are signed. `/watch` verifies the manifest and freshly retrieves both archive copies.

First verified archive:

- Wallet: [`0xA704353cB48030557c307cB743581D49eFA1eF80`](https://filecoin-testnet.blockscout.com/address/0xA704353cB48030557c307cB743581D49eFA1eF80)
- [Initial reserve deposit](https://filecoin-testnet.blockscout.com/tx/0x432ed1903e1a29d5db8cf827f1b41a154efe595e99ad0027053046940bbc52a2): approximately **1.352 tUSDFC**
- PieceCID: `bafkzcibd6ivqsecksw5ufzydpbmlqhnhuda4vvmv76ni2g3vktatrpnzmwuuulzm`
- Provider 4, dataset 33836; provider 2, dataset 33835

The [public evidence bundle](public/evidence/latest.json) holds **10 real receipts and four archives**, with no private keys.

## How Filecoin is used

Synapse SDK 2.0.0 reads Filecoin Pay account summaries, reserves, runway, wallet balances, live price lists, and rails. The agent quotes the exact archive bytes against two resolved provider contexts, enforces integer recurring-cost limits and durable rolling allowances, executes the preparation deposit/approval when affordable, and stores selected memories on Filecoin Warm Storage. Fresh downloads from each registered provider must match the archive SHA-256. Independent verification also checks signatures and PieceCID inclusion in both live PDP datasets.

Balances, rails, and proofs are real and onchain. Nothing is hardcoded or simulated outside the clearly labelled Decision lab.

## Try it

```bash
npm ci
npm run dev     # localhost:3000 — no wallet, API key, or paid service needed
```

Run the worker for real (Calibration only):

```bash
cp .env.example .env.local
# Set a fresh Calibration-only FILECOIN_PRIVATE_KEY.
npm run wallet:status
npm run agent:once
npm run agent:watch
```

Free test tokens: [Calibration FIL faucet](https://faucet.calibnet.chainsafe-fil.io/funds.html) and [USDFC faucet](https://forest-explorer.chainsafe.dev/faucet/calibnet_usdfc). Use an isolated test wallet only.

Default limits: **0.5 tUSDFC/month**, **2 tUSDFC per autonomous top-up**, a **14-day runway reserve**, and rolling 30-day allowances of **0.10 tUSDFC** in operation fees and **2 tUSDFC** in reserve funding (`AGENT_MAX_ROLLING_FEES_USDFC`, `AGENT_MAX_ROLLING_TOPUPS_USDFC`, `AGENT_MAX_TOPUP_USDFC`). Set `MEMENTO_MEMORIES_PATH` to supply your own memories, `MEMENTO_DATA_DIR` for a persistent worker directory.

The worker runs independently of the browser, once a minute. It re-checks runway even when content is unchanged, so duplicate suppression never disables reserve top-ups. It stops on failures needing reconciliation, and a filesystem lock prevents simultaneous CLI/API cycles.

## Verification

```bash
npm run test        # 44 tests
npm run lint
npm run build
npm run evidence:verify
npm run test:live   # optional: real bounded Calibration transactions
```

Export with `npm run evidence:export` after the worker finishes, then commit `public/evidence/latest.json`. The public viewer falls back to this timestamped evidence when no local worker state exists; financial balances always come from live RPC.

## How the policy works

Utility is a transparent heuristic: `importance × 0.72 + min(accesses,20) × 1.4 − ageDays × 0.7`, clamped to 0–100. Pinned sources always score 100. Compaction is verbatim sentence extraction — it preserves decimals and URLs, keeps every explicitly marked critical constraint alongside ranked excerpts, and passes six annotated essential-fact fixtures.

Filecoin's recurring price includes a per-dataset proving fee, so compressing a few kilobytes does not remove it. Memento's savings come from refusing low-value writes and bundling selected memories into one piece, avoiding repeated operation fees.

## Limitations, stated plainly

- **Not an LLM making money decisions.** The runtime is a deterministic policy workflow. AI was used to design, build, critique, and test the product; no model infers monetary decisions at run time, and there is no hidden LLM dependency.
- **`/api/decide` projects, it does not quote.** Recurring cost comes from the live onchain price list. The funded worker additionally obtains an exact Synapse quote for serialized bytes and resolved provider contexts before broadcasting.
- **Two videos, two kinds of evidence.** The live-decision clip is a real screen capture with two idle pauses cut. The worker-run video is a visualization of a signed event log with original timestamps, not a screen capture; playback sends no transactions.
- **Spending limits are application-level policy**, not a separately deployed spending-limit contract. The Synapse preparation transaction also approves the Warm Storage operator.
- **Receipts prove integrity, not meaning.** Signatures establish signer and record integrity; fresh retrieval checks both copies. Nothing here proves future availability, PDP challenge outcomes, or that compaction preserved every fact. "Priority retained" scores retained items — it is not a claim that compaction keeps everything.
- **Accounting starts at activation.** The rolling ledger does not backfill earlier transactions. Full quoted amounts are reserved before broadcast; uncertain outcomes stay charged until reconciliation. tFIL gas is tracked separately.
- **No mainnet.** Calibration testnet only. Memento never claims to have deleted paid data or lowered existing rails.

## Build log

[docs/AI-BUILD-LOG.md](docs/AI-BUILD-LOG.md) documents how this was built with AI, including where the tooling was wrong and what was corrected.
