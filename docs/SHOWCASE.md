# Public showcase kit

## Ready-to-share recordings

Two videos, two kinds of evidence.

**A. Live decision (real screen capture, 25s):** `public/showcase/live-decision.mp4` (1280 x 800, H.264, ~536 KB). Captured from the deployed app on 5 September 2026. The monthly cap moves 0.50 -> 0.10 USDFC against an unchanged 0.24 cost and the funded wallet is refused. Two idle pauses were cut; nothing else is edited. Poster: `public/showcase/live-decision-poster.png`.

**B. Worker run (event-log visualization, 93s):** the run that actually spent funds.

- Watch: https://memento-sigma-rosy.vercel.app/watch
- MP4: https://memento-sigma-rosy.vercel.app/showcase/memento-demo.mp4
- Signed source: https://memento-sigma-rosy.vercel.app/showcase/run.json
- Local attachment: `public/showcase/memento-demo.mp4` (1280 × 720, H.264, approximately 1.1 MB, 93 seconds).

The captioned video visualizes 22 events captured during an actual 135-second Calibration run. Waiting intervals are shortened; original timestamps and all events remain in the signed transcript. It is an event-log visualization, not a screen recording or a new transaction during playback. The four decisions are a recurring-cost refusal, an affordable two-provider archive, cumulative fee refusal, and duplicate prevention. On `/watch`, click **Verify this run independently** to verify the run signature, four signed decisions, and fresh retrieval from both providers.

## X post draft

X allows 280 characters. Any URL counts as 23 regardless of length, and attached
media is free, so the raw character count reads longer than X will measure.
All options below are under 256 as measured by X.

The link is `/live`, an alias configured in `next.config.ts` that redirects to
`/demo?live=1`. Bare `/demo` opens the labelled Decision lab, which contradicts
a post promising live onchain state; the alias keeps the query string out of a
public link.

**Recommended (254):**

```
Having funds doesn't mean spending them.

Memento reads its own Filecoin Pay runway and refuses writes it can't afford, even with a full wallet.

Move the cap yourself, live onchain, no signup:
https://memento-sigma-rosy.vercel.app/live

@FilecoinTLDR Builder Challenge C4
```

Echoes the hero card on the landing page, so the post and the site reinforce
each other, and leads with the counterintuitive part.

**Alternate, positions against the field (255):**

```
Most AI storage agents just call an upload API.

Memento reads its own Filecoin Pay runway, then decides what it can afford to remember.

Drag the cap. Watch a funded wallet refuse its own write:
https://memento-sigma-rosy.vercel.app/live

@FilecoinTLDR Builder Challenge C4
```

**Shortest, if you want room for a reply thread (203):**

```
Most storage agents just call an upload API.

Memento reads its own Filecoin Pay runway and refuses what it can't afford. Move the cap and watch it change its mind:
https://memento-sigma-rosy.vercel.app/live

@FilecoinTLDR
```

**Attach `public/showcase/live-decision.mp4`**, the 25-second screen capture. It
is shorter than the worker-run video, it is real footage rather than an
animation, and the approved-to-refused flip is legible on a phone. Media does
not count against the character limit. Keep `memento-demo.mp4` for the site.

**Published:** https://x.com/hrsh22/status/2096347741018619918, posted by the user on 5 September 2026. Nothing was posted
by the agent.

## Reproducing the media

`scripts/record-run.ts` captured the real run using the funded local test wallet. Running it performs bounded Calibration transactions; the checked-in evidence already exists, so it is unnecessary for judges. Its fixed demonstration inputs are intended for the captured scenario, not repeated fresh uploads.

To render the existing signed log again without transactions:

```bash
python3 -m venv /tmp/memento-video-tools
/tmp/memento-video-tools/bin/pip install Pillow==12.3.0 imageio-ffmpeg==0.6.0
/tmp/memento-video-tools/bin/python scripts/render-showcase.py
```

The renderer uses macOS Avenir Next when available and falls back to DejaVu Sans. It writes MP4, poster, and WebVTT captions under `public/showcase`.
