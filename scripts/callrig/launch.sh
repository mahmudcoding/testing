#!/usr/bin/env bash
# Launch one Chrome-for-Testing instance with synthetic (but real) WebRTC media
# devices and a CDP debugging port, so calls can be driven end-to-end.
#   usage: launch.sh <lane> <account>          e.g. launch.sh B alice
#          launch.sh <profile-name> <cdp-port>  legacy form, still supported
#
# The lane form derives both port and profile from scripts/callrig/rigmap.mjs, so
# two parallel sessions can never land on the same window. Windows open maximized.
set -euo pipefail
CH="$HOME/Library/Caches/ms-playwright/chromium-1234/chrome-mac-arm64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing"

if [[ "${2:-}" =~ ^[0-9]+$ ]]; then          # legacy: <profile> <port>
  NAME="$1"; PORT="$2"
else                                          # lane form: <lane> <account>
  LANE="${1:?lane letter, e.g. B}"; ACCT="${2:?account, e.g. alice}"
  PORT="$(node "$(dirname "$0")/rigmap.mjs" port "$LANE" "$ACCT")"
  NAME="$(node "$(dirname "$0")/rigmap.mjs" profile "$LANE" "$ACCT")"
  echo "lane $LANE / $ACCT -> port $PORT, profile $NAME, sign in as $(node "$(dirname "$0")/rigmap.mjs" email "$LANE" "$ACCT")"
fi
X="${3:-0}"; Y="${4:-0}"
# Chrome needs *a* page for CDP to have something to attach to. Opening the app instead of
# about:blank satisfies that and lands the window signed in, rather than leaving an orphaned
# blank tab beside whatever the session opens next.
START_URL="${QA_START_URL:-https://airion-cargo.store/}"

if curl -s -m 1 "http://127.0.0.1:$PORT/json/version" >/dev/null 2>&1; then
  echo "refusing: something is already listening on CDP port $PORT — another session may own it" >&2
  exit 1
fi
# ---- window caps -------------------------------------------------------------
# A Chrome-for-Testing window costs ~470-590 MB resident (measured across live
# five-session runs). Two caps: per-lane stops one session starving the others,
# total keeps the machine off swap — and the total is the one that matters, since
# 20 browsers put a 16 GB machine into 4.6 GB of swap, where macOS discards
# background tabs and a discarded tab in a live call looks exactly like a
# participant dropping. Sectors need different amounts (E rarely wants more than
# 2, A's own scope line asks for 3-4), so the per-lane default is deliberately
# below what the widest sector needs and the slack lives in the global pool.
# Both are deliberate to exceed, never accidental:
#   QA_MAX_PER_LANE=4 ./launch.sh A dave   # a genuine 4-participant call
# Per-SECTOR caps, sized from each sector's own setup line in SECTORS.md rather
# than one number for everyone — a flat cap pinches the sectors that genuinely
# need windows while leaving the single-browser sectors' slack unused. They sum
# to 15, which keeps the machine off swap with room for one spare.
sector_cap() {
  case "$1" in
    # Counted from the accounts each sector's repro blocks actually name. No one
    # finding needs more than three, but browsers accumulate as you work through
    # a lane, so the cap has to cover the distinct accounts it touches -- B, C
    # and D each reach four, and the fourth launch was being refused mid-run.
    A) echo 4 ;;   # calls, inside: alice, bob, carol
    B) echo 4 ;;   # calls, around: alice, bob, carol, guest
    C) echo 4 ;;   # chat: alice, bob, carol, dave
    D) echo 4 ;;   # org/identity: alice, carol, owner, outsider
    E) echo 3 ;;   # workspace: alice, bob, and a slot spare
    *) echo 3 ;;   # free lanes carrying no sector
  esac
}
MAX_TOTAL="${QA_MAX_BROWSERS:-16}"

count_live() {   # $1 = first port, $2 = last port
  local p n=0
  for ((p=$1; p<=$2; p++)); do
    if nc -z -G 1 -w 1 127.0.0.1 "$p" 2>/dev/null; then n=$((n+1)); fi
  done
  printf '%s' "$n"
}

BLOCK_START=$(( ((PORT - 9220) / 10) * 10 + 9220 ))
BLOCK_END=$(( BLOCK_START + 9 ))
LANE_LETTER=$(printf "\\$(printf '%03o' $(( 65 + (BLOCK_START - 9220) / 10 )))")

# Lane and sector are different things (see CLAUDE.md): the letters usually match,
# but a session may run sector A on lane C. Cap by the sector actually being
# tested when QA_SECTOR says so, and by the lane letter otherwise.
SECTOR="${QA_SECTOR:-$LANE_LETTER}"
MAX_PER_LANE="${QA_MAX_PER_LANE:-$(sector_cap "$SECTOR")}"

IN_LANE="$(count_live "$BLOCK_START" "$BLOCK_END")"
if [ "$IN_LANE" -ge "$MAX_PER_LANE" ]; then
  echo "refusing: lane $LANE_LETTER already has $IN_LANE browsers up (sector $SECTOR cap: $MAX_PER_LANE)." >&2
  echo "  Free a slot with ./stop.sh $LANE_LETTER <account>, which logs the closure," >&2
  echo "  or override: QA_MAX_PER_LANE=$((MAX_PER_LANE+1)) $0 $*" >&2
  echo "  If you are running a different sector on this lane, say so: QA_SECTOR=<letter>" >&2
  exit 1
fi

TOTAL="$(count_live 9220 9319)"
if [ "$TOTAL" -ge "$MAX_TOTAL" ]; then
  echo "refusing: $TOTAL rig browsers running across all lanes (cap $MAX_TOTAL)." >&2
  echo "  At ~470 MB each that is the point this machine starts swapping." >&2
  echo "  Override only if you know the RAM is there: QA_MAX_BROWSERS=$((MAX_TOTAL+4)) $0 $*" >&2
  exit 1
fi

DIR="$HOME/.cache/aloqa-callrig/$NAME"
mkdir -p "$DIR"

# Rig browsers are killed, never closed, so Chrome persists a restorable session
# and reopens the previous run's tabs on the next start — on top of the START_URL
# tab below, which is how a window comes up with two or three tabs, one of them
# hours stale. Drop the session files so there is nothing to restore. Cookies and
# logins live elsewhere in the profile and are untouched. Safe here: this line is
# only reached when the CDP port is free, so the profile is not in use.
rm -rf "$DIR/Default/Sessions" \
       "$DIR/Default/Current Session" "$DIR/Default/Current Tabs" \
       "$DIR/Default/Last Session" "$DIR/Default/Last Tabs" 2>/dev/null || true
EXTRA=()
# per-profile fake media sources, if provided (distinguishable audio/video per user)
[ -f "$DIR/audio.wav" ] && EXTRA+=(--use-file-for-fake-audio-capture="$DIR/audio.wav%noloop")
[ -f "$DIR/video.y4m" ] && EXTRA+=(--use-file-for-fake-video-capture="$DIR/video.y4m")
# Chrome flags are the same either way; only how we start it differs.
FLAGS=(
  --user-data-dir="$DIR"
  --remote-debugging-port="$PORT"
  --use-fake-ui-for-media-stream
  --use-fake-device-for-media-stream
  --auto-select-desktop-capture-source="Entire screen"
  --autoplay-policy=no-user-gesture-required
  --allow-http-screen-capture
  --no-first-run --no-default-browser-check --no-service-autorun
  --disable-features=Translate,MediaRouter,OptimizationHints
  --start-maximized
  ${EXTRA[@]+"${EXTRA[@]}"}
)

# Start it WITHOUT taking focus. Running the binary directly activates the app,
# so every launch yanks the user's window away mid-work — with a lane of four
# browsers that is four interruptions. `open -g` starts it in the background
# instead, and -n gives each profile its own instance. `open` does not hand back
# a pid or let us redirect stdio, so Chrome writes its own log and the pid is
# looked up afterwards. If `open` is unavailable the direct exec still works,
# focus-stealing and all, rather than leaving the rig with no way to launch.
APP="${CH%%/Contents/MacOS/*}"
if [ -d "$APP" ] && command -v open >/dev/null 2>&1; then
  open -g -n -a "$APP" --args "${FLAGS[@]}" \
    --enable-logging --log-file="$DIR/chrome.log" "$START_URL"
else
  echo "note: falling back to a direct launch — this one will take focus" >&2
  "$CH" "${FLAGS[@]}" "$START_URL" >"$DIR/chrome.log" 2>&1 &
fi

# A freshly started Chrome reports no CDP targets for a few seconds, and Playwright
# cannot attach to a browser with no page — so wait for an actual *page* target.
# Two things this gets right that the previous check did not: it counts pages
# rather than any target (a service worker used to satisfy it), and it refuses
# instead of returning success when the browser never becomes drivable. Under load
# — many browsers, machine into swap — a start can take far longer than the old
# 20s ceiling, and returning "launched" anyway is what left sessions driving a port
# nobody was serving and losing measurements to ECONNREFUSED.
pages_up() {
  # `|| true` sits inside the group on purpose: with `set -o pipefail` a failing
  # curl fails the whole pipeline even though python already printed a count, and
  # a trailing `|| echo 0` then appends a second line — the caller gets "0\n0"
  # and the numeric test errors out on every poll.
  local n
  n="$( { curl -s -m 2 "http://127.0.0.1:$PORT/json/list" 2>/dev/null || true; } \
        | python3 -c 'import sys, json
try:
    print(sum(1 for t in json.load(sys.stdin) if t.get("type") == "page"))
except Exception:
    print(0)' 2>/dev/null )"
  printf '%s' "${n:-0}"
}
READY=0
LAUNCH_TIMEOUT="${QA_LAUNCH_TIMEOUT:-60}"
for i in $(seq 1 "$LAUNCH_TIMEOUT"); do
  [ "$(pages_up)" -gt 0 ] && { READY=1; break; }
  # Half way through, nudge it with a tab of our own in case the start-URL target
  # never registered; then keep waiting rather than returning on the nudge alone.
  [ "$i" -eq $((LAUNCH_TIMEOUT / 2)) ] &&
    { curl -s -m 5 -X PUT "http://127.0.0.1:$PORT/json/new?url=$START_URL" >/dev/null 2>&1 || true; }
  sleep 1
done
if [ "$READY" != 1 ]; then
  echo "refusing: $NAME came up on port $PORT but no CDP page target appeared in ${LAUNCH_TIMEOUT}s." >&2
  echo "  Driving it now would fail with ECONNREFUSED, so this reports rather than pretending it worked." >&2
  echo "  Clear it with ./stop.sh $LANE_LETTER $NAME, or wait and re-check:" >&2
  echo "    curl -s http://127.0.0.1:$PORT/json/list" >&2
  echo "  Raise the wait with QA_LAUNCH_TIMEOUT=120 if the machine is loaded." >&2
  exit 1
fi

# `open` detaches, so find the browser process rather than trusting $!.
PID="$(ps -Ao pid,args | grep -- "--user-data-dir=$DIR " | grep -v -- '--type=' \
       | grep -v grep | awk '{print $1}' | head -1)"
echo "launched $NAME pid=${PID:-?} port=$PORT dir=$DIR"
