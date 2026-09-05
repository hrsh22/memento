# Deployment handoff

The user deployed https://memento-sigma-rosy.vercel.app. Pushing main updates the linked deployment. No Loops submission has been performed.

## Public Vercel demo

1. Open Vercel → Add New Project → import **hrsh22/memento**.
2. Keep the **Next.js** framework preset, repository root directory, `npm run build`, and default output directory.
3. Use Node.js **22.x**. No environment variables are required.
4. Deploy. Open the introduction and test **Watch a real agent run → Verify this run independently**. Also check **Try the decision lab** and the editable agent profile card.
5. Save the public demo URL for the submission. Confirm deployment protection allows judges to open it without signing in.

The bundled `public/evidence/latest.json` preserves actual, timestamped Calibration receipts. `/api/chain` continues to read the real public wallet. `/api/verify` retrieves the archive and checks signatures and onchain dataset inclusion afresh. The evidence viewer labels recorded worker activity; it does not claim a worker is running on Vercel.

**Do not add `FILECOIN_PRIVATE_KEY` or `AGENT_API_TOKEN` to this public deployment.** Public write requests return 401. `.vercelignore` excludes `.env*` and the mutable worker data directory. The wallet key remains only in the local `.env.local` (gitignored, mode 0600).

## Local autonomous writer

The local operator already has a fresh, funded Calibration test wallet. Run:

```bash
npm run agent:once
# Or leave this running in a terminal for independent 60-second cycles:
npm run agent:watch
```

For a persistent remote writer, use a Node.js 22 host with a persistent volume for `MEMENTO_DATA_DIR` and secret environment variables. Do not run the filesystem-backed writer inside a stateless Vercel function. It is intentionally separate from the public viewer.

After new real cycles:

```bash
npm run evidence:export
npm run evidence:verify
git add public/evidence/latest.json
git commit -m "docs: refresh verified Calibration evidence"
git push
```

Only export synthetic or explicitly public memories. The bundled seed research content is a demonstration dataset, not private user information.

## Reconciliation

A process crash leaves `data/agent.lock`. Before removing it, check whether another worker is running and inspect the receipt and transaction explorer. A `pending` receipt or a `failed` receipt with `broadcastAttempted` blocks additional writes. Resolve the confirmed chain result and correct the local state before resuming. Blind retries can cause duplicate payment or storage commitments.

## Final handoff

The public demo and 93-second recording are ready. The user will publish the X post and submit. `docs/SHOWCASE.md` supplies the video attachment and draft post. `docs/SUBMISSION-DRAFT.md` supplies the project description. The user must explicitly approve any final Loops submission.

## Rolling spending limits

The local writer defaults to 0.10 tUSDFC operation fees and 2 tUSDFC reserve funding per rolling 30 days. Configure `AGENT_MAX_ROLLING_FEES_USDFC` and `AGENT_MAX_ROLLING_TOPUPS_USDFC` on the persistent writer only. The ledger starts at activation, excludes earlier transactions, and reserves quoted amounts before broadcast. Do not delete it to resume an exhausted budget. Ambiguous reservations remain charged until explicit reconciliation. Gas remains a separate tFIL balance check.
