#!/usr/bin/env bash
# Launch one Chrome-for-Testing instance with synthetic (but real) WebRTC media
# devices and a CDP debugging port, so calls can be driven end-to-end.
#   usage: launch.sh <profile-name> <cdp-port>
# Windows open maximized.
set -euo pipefail
CH="$HOME/Library/Caches/ms-playwright/chromium-1234/chrome-mac-arm64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing"
NAME="${1:?profile name}"; PORT="${2:?cdp port}"; X="${3:-0}"; Y="${4:-0}"
DIR="$HOME/.cache/aloqa-callrig/$NAME"
mkdir -p "$DIR"
EXTRA=()
# per-profile fake media sources, if provided (distinguishable audio/video per user)
[ -f "$DIR/audio.wav" ] && EXTRA+=(--use-file-for-fake-audio-capture="$DIR/audio.wav%noloop")
[ -f "$DIR/video.y4m" ] && EXTRA+=(--use-file-for-fake-video-capture="$DIR/video.y4m")
"$CH" \
  --user-data-dir="$DIR" \
  --remote-debugging-port="$PORT" \
  --use-fake-ui-for-media-stream \
  --use-fake-device-for-media-stream \
  --auto-select-desktop-capture-source="Entire screen" \
  --autoplay-policy=no-user-gesture-required \
  --allow-http-screen-capture \
  --no-first-run --no-default-browser-check --no-service-autorun \
  --disable-features=Translate,MediaRouter,OptimizationHints \
  --start-maximized \
  ${EXTRA[@]+"${EXTRA[@]}"} \
  about:blank >"$DIR/chrome.log" 2>&1 &
echo "launched $NAME pid=$! port=$PORT dir=$DIR"
