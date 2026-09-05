# Public showcase kit — draft, not posted

## Two-minute demo script

**0:00–0:15 · Hook**

“Agents can store everything. But can they decide what is worth paying to remember? This is Memento: a memory treasury with a survival instinct.”

Show the overview and the layered memory sculpture. Mention that the Decision Lab is a simulation and the Live Onchain tab contains actual evidence.

**0:15–0:40 · Visible decision**

Keep the default scenario budget at 0.25 USDFC. Click Run decision. Show observe → decide → act → verify. Open Experiment 024: 4.4 KB becomes 279 bytes of verbatim source excerpts. Pinned core memories remain intact; noisy traces are deferred. Move the budget higher to show compaction changing.

“Most of the practical saving here is fewer paid writes. Tiny files still incur dataset proving fees; we account for that.”

**0:40–1:10 · Real money, real refusal**

Click Inspect live evidence. Open the strict-cap refusal: the wallet was funded, but approximately 0.24 USDFC/month exceeded the 0.10 cap. The agent refused without a transaction. Then open the latest committed archive: two memories compacted, three deferred, exact archive 6,912 bytes, real reserve quote.

**1:10–1:40 · Verify it yourself**

Click Verify independently now. Show fresh download SHA-256, archive signature, financial receipt signature, and inclusion in two live PDP datasets. Open the provider link or transaction explorer.

“This is live retrieval and chain inclusion, not an animation saying ‘verified.’ It does not claim future proof success or semantic correctness.”

**1:40–2:00 · Autonomous maintenance**

Open the reserve top-up receipt. Show the approximately 0.016 tUSDFC deposit made on unchanged input. No duplicate archive was uploaded.

“The worker runs without browser clicks. It decides when to store, when to refuse, and when to fund existing memories. Memory is a budget decision.”

## Recording notes

Use the browser at normal desktop size, hide unrelated tabs, and record a short screen walkthrough. Narrate the lab/live distinction once early. Do not show `.env.local` or the terminal containing credentials. The public deployment can demonstrate independent verification without the worker running; label recorded activity accurately. An additional local live-worker segment is optional.

## X post draft

Built Memento for @FilecoinTLDR: an agent that knows what it can afford to remember.

It reads Filecoin Pay, protects core memories, compacts useful context, refuses over-budget writes, and tops up its own reserve.

Real Calibration storage. Two providers. Signed decisions. Verify the archive yourself.

Demo: [ADD VERCEL URL]
Code: https://github.com/hrsh22/memento

[Attach a short screen recording. This draft has not been posted.]
