#!/usr/bin/env bash
# Creates the Loops submission for FilecoinTLDR Builder Challenge - Cycle 4.
# Run from the repo root:  bash docs/submit.sh
#
# `loops project create` accepts every field, so this is a single call. Nothing
# here is destructive: one project exists per user per event, and if one already
# exists this fails rather than overwriting. Switch `create` to `update` then.
#
# All three prizes are selected. They are placement tiers for the same judging,
# not separate tracks, so selecting all three just keeps every placement open.
# The ids are not listed by `loops` but they are in the submit page payload.
set -euo pipefail

cd "$(dirname "$0")/.."

EVENT=filecointldr-builder-challenge-cycle-4
BASE=https://memento-sigma-rosy.vercel.app

for f in docs/pitch.txt docs/description.txt; do
  [ -s "$f" ] || { echo "missing or empty: $f" >&2; exit 1; }
done
grep -q 'PASTE_X_URL_HERE' docs/description.txt && {
  echo "docs/description.txt still has a placeholder X URL" >&2; exit 1; }

echo "Submitting to $EVENT as:"
loops auth status
echo

loops project create --event "$EVENT" \
  --name "Memento" \
  --tagline "An agent that knows what it can afford to remember." \
  --repo-url "https://github.com/hrsh22/memento" \
  --demo-url "$BASE/live" \
  --video-url "$BASE/watch" \
  --logo-url "$BASE/logo.png" \
  --screenshot-urls "$BASE/shots/01-landing.png" \
  --screenshot-urls "$BASE/shots/02-live-refusal.png" \
  --screenshot-urls "$BASE/shots/03-watch.png" \
  --screenshot-urls "$BASE/shots/04-verification.png" \
  --bounty-ids "63cbe493-f496-4026-a8c1-1b26764a93cf" \
  --bounty-ids "af1127fa-6f07-43fb-a804-42abd4b41477" \
  --bounty-ids "b2a194ec-5bb7-484d-b781-7c9fde37f5de" \
  --pitch "$(cat docs/pitch.txt)" \
  --description "$(cat docs/description.txt)"

echo
echo "Submitted. Verifying what the platform stored:"
loops project get --event "$EVENT"
