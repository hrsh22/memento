# QA evidence — 5 September 2026

## Automated

- 17 tests: pressure-dependent decisions, pinned source preservation, no fabricated runway with zero rate, invalid financial inputs, verbatim extraction, per-dataset fee behavior, bundling fee arithmetic, bigint spending gates, canonical signatures, tamper detection, schema validation, and cross-process exclusion/lock release.
- ESLint: clean.
- TypeScript: checked with incremental cache disabled.
- Next.js production build: successful.
- HTTP: `/api/chain` 200; `/api/agent` 200; unauthenticated POST `/api/agent` 401; unknown verification receipt 404.

## Actual Calibration integration

Initial unfunded cycle autonomously refused. After the user supplied tFIL/tUSDFC, the agent deposited approximately 1.352 tUSDFC, stored on two providers, retrieved bytes, and verified their SHA-256.

Follow-up integration:

1. Compacted archival revision on existing datasets (the normalization upgrade changed the development fingerprint scheme once).
2. A strict 0.10 USDFC/month cap rejected the approximately 0.24/month actual quote without a write.
3. A new memory containing real integration evidence was selected and stored; two other memories were compacted and three deferred.
4. Replaying the normalized input prevented another archive upload. Low runway triggered a bounded maintenance deposit of approximately 0.016 tUSDFC.
5. All three stored archives independently passed fresh retrieval, archive signature, decision ID, and PieceCID inclusion in both live PDP datasets. The two newer archives also passed full financial receipt signatures; the first predates that added signature layer.

Latest verified archive: `bafkzcibdyaeqq7bicexnvgcwkti4rmj5fpt5hwt3e2xm7amyqk32ldjfsdlzoszy`, 6,912 serialized bytes. Providers 4 and 2; datasets 33836 and 33835; piece 2 on both. Verification was repeated through the actual Chrome UI and returned **Fresh verification passed**.

## Chrome interaction tests

Used the installed Chrome extension / computer-use browser, not a separate headless test browser.

- Desktop render and visual screenshot inspected.
- Decision replay completes and creates a scenario receipt.
- Compacted memory inspector shows the actual 279-byte verbatim output from a 4.4 KB source.
- Search with no match shows a proper empty state; clearing search restores the table.
- Custom memory form adds a real browser-session record and recalculates its score.
- Policy utility threshold and compaction switch change state; Restore defaults resets them.
- Live mode shows actual account data and real receipt history.
- Latest receipt displays observed funds, reserve, exact archive quote, provider links, and a transaction link.
- Independent verification button obtains a fresh server-side retrieval and onchain check; browser displays all verification results.
- Mobile breakpoint 390×844 inspected. Fixed the decorative sculpture overlap and prevented hidden sidebar links from receiving focus. Temporary viewport override reset to desktop.
- Increased secondary text contrast after visual review and removed the development indicator from the UI.
- Production server tested with empty wallet/token environment variables and a fresh data directory. All six bundled receipts loaded, public write requests returned 401, and fresh archive verification passed in Chrome. Mobile navigation opened, switched views, and closed correctly; content width matched the 390-pixel viewport without horizontal overflow.

## Honest boundaries

The decision lab is explicitly simulated. No lab transaction is broadcast. Its conservative fee projection is not the exact lifecycle reserve ledger. The real writer uses the SDK quote. Public archives contain synthetic research fixtures and actual integration findings, not user-private data. No mainnet transaction, Vercel deployment, X post, or final hackathon submission was made.

Public deployment smoke testing remains for after the user deploys. Recorded evidence includes timestamps; it is not presented as a continuously running hosted writer.
