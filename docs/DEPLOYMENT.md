# Deployment handoff

The user will deploy this project. No Vercel deployment or Loops submission has been performed by the agent.

## Public Vercel demo

1. Open Vercel → Add New Project → import **hrsh22/memento**.
2. Keep the **Next.js** framework preset, repository root directory, `npm run build`, and default output directory.
3. Use Node.js **22.x**. No environment variables are required.
4. Deploy. Open the introduction and test **See real Filecoin evidence → latest memory archive → Verify independently now**. Also check **Try the decision lab** and the editable agent profile card.
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

The public demo URL, short demo recording, and public X post still need the user’s actions. `docs/SHOWCASE.md` supplies a recording script and draft post. `docs/SUBMISSION-DRAFT.md` supplies the project description. The user must explicitly approve any final Loops submission.
