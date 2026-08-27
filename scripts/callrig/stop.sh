#!/usr/bin/env bash
# Close rig browsers, and leave a record that they were closed.
#   ./stop.sh B alice bob      # just those two
#   ./stop.sh B                # every browser in lane B
#
# Two reasons this exists. There was no scripted way to close a browser, so the
# documented "close one, free the slot, launch another" path meant hand-rolling a
# kill — which nobody did, because a stray pattern can take down a neighbouring
# lane's window. And an externally killed browser is indistinguishable from a
# product crash seen from inside a snippet: sessions have burned tool calls
# disproving "Page crashed" findings, and two came close to filing a Critical
# against innocent code. So every close is timestamped into RIGLOG, which a
# session can read to rule that out in one command:
#   grep "$(TZ=Asia/Tashkent date +%H:%M)" ~/.cache/aloqa-callrig/rig-events.log
set -euo pipefail
cd "$(dirname "$0")"

RIGLOG="$HOME/.cache/aloqa-callrig/rig-events.log"
LANE="${1:?usage: stop.sh <lane> [account...]}"; shift || true

ACCTS=("$@")
if [ "${#ACCTS[@]}" -eq 0 ]; then
  ACCTS=(alice bob carol dave owner admin guest outsider)
fi

closed=0
for ACCT in "${ACCTS[@]}"; do
  PORT="$(node rigmap.mjs port "$LANE" "$ACCT")"
  PROFILE="$(node rigmap.mjs profile "$LANE" "$ACCT")"
  nc -z -G 1 -w 1 127.0.0.1 "$PORT" 2>/dev/null || continue
  DIR="$HOME/.cache/aloqa-callrig/$PROFILE"
  # Match the profile directory exactly, so a lane never reaches into another's.
  pkill -f -- "--user-data-dir=$DIR " 2>/dev/null || true
  sleep 1
  pkill -9 -f -- "--user-data-dir=$DIR " 2>/dev/null || true
  echo "$(TZ=Asia/Tashkent date '+%Y-%m-%d %H:%M:%S %Z') closed lane=$LANE account=$ACCT port=$PORT profile=$PROFILE by=${QA_STOP_REASON:-stop.sh}" >> "$RIGLOG"
  echo "stopped $PROFILE (port $PORT)"
  closed=$((closed + 1))
done

[ "$closed" -eq 0 ] && echo "nothing to stop in lane $LANE"
exit 0
