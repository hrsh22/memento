# Memento

**An AI agent should know what it can afford to remember.**

Memento is an autonomous memory treasury on **Filecoin Pay + Synapse SDK**. It reads its own financial state, decides which memories deserve storage, funds a bounded reserve, and verifies the result. Built for the [FilecoinTLDR Builder Challenge — Cycle 4](https://www.loops.house/filecointldr-builder-challenge-cycle-4).

The decision is the product: an unfunded agent refuses a write; a funded agent preserves valuable memories; an over-budget quote is rejected even when the wallet has funds.

## Try it

```bash
npm ci
npm run dev
```

Open [localhost:3000](http://localhost:3000). **No wallet, API key, or paid service is needed to explore the app.**

- **Decision lab:** move the budget slider, run the decision, inspect verbatim retained text, add your own memory, and change the retention policy. Clearly labeled simulation; no transactions.
- **Live onchain:** actual Calibration treasury reads alongside timestamped, recorded integration evidence. Inspect the funded/refused decisions and click **Verify independently now** to re-download a real archive, validate signatures, and check PieceCID inclusion in both live PDP datasets.
- **Memory vault:** keep, compact, or defer decisions with explicit reasons and transparent utility scores.
- **Decision receipts:** download machine-readable evidence, including account observations, policy, exact SDK quotes, transaction IDs, source hashes, signatures, and provider/dataset/piece IDs.

## What actually runs autonomously

```text
Filecoin Pay account + wallet + price list
                   ↓
       importance / use / age policy
                   ↓
 protect originals → extract useful passages → defer noise
                   ↓
        exact Synapse archive quote
                   ↓
 monthly cap + top-up cap + wallet + gas gate
           ↙                       ↘
     refuse the write       fund reserve → store 2 copies
                                   ↓
                   retrieve → SHA-256 → signed receipt
```

The worker runs independently of the browser, once a minute. It also checks existing memory runway when content is unchanged: duplicate suppression does not disable reserve top-ups. It stops on failures that require reconciliation, and a filesystem lock prevents simultaneous CLI/API cycles. Successful archives remain in a durable deduplication ledger.

```bash
cp .env.example .env.local
# Set a fresh Calibration-only FILECOIN_PRIVATE_KEY locally.
npm run wallet:status
npm run agent:once
npm run agent:watch
```

Get free test tokens from the [Calibration FIL faucet](https://faucet.calibnet.chainsafe-fil.io/funds.html) and [USDFC faucet](https://forest-explorer.chainsafe.dev/faucet/calibnet_usdfc). Default financial limits: **0.5 tUSDFC/month**, **2 tUSDFC per autonomous top-up**, and a **14-day runway reserve**. These are application-level policy limits, not a separately deployed spending-limit contract. The Synapse preparation transaction also approves the Warm Storage operator. Only use an isolated test wallet.

Custom memory inputs: set `MEMENTO_MEMORIES_PATH` to a JSON array matching `src/lib/agent/types.ts`. Inputs are validated before chain operations. `AGENT_MAX_TOPUP_USDFC` changes the deposit cap. `MEMENTO_DATA_DIR` selects a persistent worker directory.

## Real integration evidence

The [public evidence bundle](public/evidence/latest.json) contains real Calibration runs using synthetic research fixtures and actual integration findings. There are no private keys in the bundle.

First verified archive:

- Wallet: [`0xA704353cB48030557c307cB743581D49eFA1eF80`](https://filecoin-testnet.blockscout.com/address/0xA704353cB48030557c307cB743581D49eFA1eF80)
- [Initial reserve deposit](https://filecoin-testnet.blockscout.com/tx/0x432ed1903e1a29d5db8cf827f1b41a154efe595e99ad0027053046940bbc52a2): approximately **1.352 tUSDFC**
- PieceCID: `bafkzcibd6ivqsecksw5ufzydpbmlqhnhuda4vvmv76ni2g3vktatrpnzmwuuulzm`
- Provider 4, dataset 33836; provider 2, dataset 33835

The app’s verify endpoint checks the archive signature, fresh download hash, decision ID, and onchain PieceCID inclusion. Newer receipts additionally sign the entire financial decision using canonical JSON. The first archive predates that extra receipt signature; its archive signature still verifies.

```bash
npm run evidence:verify
npm run evidence:export
```

Export after the worker finishes, then commit `public/evidence/latest.json` to update the public demonstration. Do not export private memories. The public viewer uses this timestamped evidence when no local worker state exists; financial balances continue to come from live RPC calls.

## The economics are deliberate

Filecoin’s recurring price includes a per-dataset proving fee. Compressing a few kilobytes does **not** remove that fee. Memento’s primary savings come from refusing low-value writes and bundling selected memories into one piece, avoiding repeated operation fees. It never claims to have deleted existing paid data or instantly lowered existing rails.

The lab comparison conservatively subtracts operation fees from available funds. Actual fees draw from lifecycle reserves and may trigger replenishment. The live executor obtains a fresh SDK quote for exact serialized archive bytes and resolved provider contexts, accounting for reserve, debt, rate changes, and one-time fees. Integer base units govern all live financial comparisons.

Utility is a transparent heuristic: `importance × 0.72 + min(accesses,20) × 1.4 − ageDays × 0.7`, clamped to 0–100. Pinned sources always score 100. “Utility retained” measures the scores of retained memory items; it is not a claim that compaction preserves every fact. The runtime is a deterministic agent workflow, not an LLM pretending to make unbounded financial decisions. AI was used to design, build, critique, and test the product.

## Verification

```bash
npm run test
npm run lint
npm run build
# Optional: performs real bounded Calibration transactions with the local test wallet.
npm run test:live
```

See [browser QA](docs/QA.md), [architecture and failure handling](docs/ARCHITECTURE.md), [AI build log](docs/AI-BUILD-LOG.md), and [judging alignment review](docs/JUDGING-REVIEW.md).

## Deploy to Vercel

Import `hrsh22/memento`, choose the **Next.js** preset, and deploy with defaults. **No environment variables are required for the public demo.** Do not upload `.env.local` or add the operator wallet key to the public deployment. The Vercel app serves live reads and recorded, independently verifiable evidence. The autonomous writer runs locally or on a persistent Node host.

See [deployment and handoff](docs/DEPLOYMENT.md). The user retains control of deployment, the X showcase post, and the final Loops submission.

## Stack

Next.js 16 · TypeScript · React 19 · Tailwind CSS 4 · shadcn/ui (Base UI) · Synapse SDK 2 · viem · Vitest.

## Sources

[Filecoin Pay operations](https://docs.filecoin.cloud/developer-guides/payments/payment-operations/) · [Storage costs](https://docs.filecoin.cloud/developer-guides/storage/storage-costs/) · [Synapse quick start](https://docs.filecoin.cloud/getting-started/) · [Installed SDK source](https://github.com/FilOzone/synapse-sdk).
