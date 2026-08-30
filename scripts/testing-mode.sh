#!/bin/bash
# testing-mode.sh {on|off|status} — quiet this Mac down for a QA run, reversibly.
#
# 16 GB M3 Air: RAM is the binding constraint. One rig Chrome with the Aloqa SPA
# loaded measures ~1.3 GB, so every GB freed here is roughly one more browser.
#
# Never touches: Claude.app (hosts the session), Terminal, the aloqa-mirror-sync
# agent, or anything under the QA repo.

set -u

# Graceful quit — preserves Chrome tabs, unsaved Notes, etc.
APPS=(
  "Google Chrome" "Telegram" "ChatGPT" "Shottr" "Net Conditioner"
  "Mail" "Notes" "Podcasts" "Journal" "Stocks" "Weather" "Home"
  "FindMy" "VoiceMemos" "Clock" "Music" "TV" "News" "Freeform"
)

# Periodic wakeups that fire mid-run. aloqa-mirror-sync is deliberately absent.
AGENTS=(
  com.google.GoogleUpdater.wake
  com.google.keystone.agent
  com.microsoft.EdgeUpdater.wake
  com.valvesoftware.steamclean
  com.atlassian.twg.upkeep
)

STATE="$HOME/.cache/aloqa-qa/testing-mode.state"
mkdir -p "$(dirname "$STATE")"

mem() {
  vm_stat | awk '
    /Pages free/           {gsub(/\./,"",$3); f=$3}
    /Pages active/         {gsub(/\./,"",$3); a=$3}
    /Pages wired/          {gsub(/\./,"",$4); w=$4}
    /occupied by compressor/ {gsub(/\./,"",$5); c=$5}
    END { printf "%.1f", (f+ (0)) * 16384/1073741824 }'
}
report() {
  vm_stat | awk -v tag="$1" '
    /Pages free/             {gsub(/\./,"",$3); f=$3}
    /Pages active/           {gsub(/\./,"",$3); a=$3}
    /Pages inactive/         {gsub(/\./,"",$3); i=$3}
    /Pages wired/            {gsub(/\./,"",$4); w=$4}
    /occupied by compressor/ {gsub(/\./,"",$5); c=$5}
    END { p=16384/1073741824
          printf "%-8s active %.1fG  inactive %.1fG  wired %.1fG  compressed %.1fG  free %.1fG\n",
                 tag, a*p, i*p, w*p, c*p, f*p }'
  echo "         swap: $(sysctl -n vm.swapusage | sed 's/.*used = //; s/ free.*//')"
}

running() { pgrep -x "$1" >/dev/null 2>&1 || pgrep -f "/Applications/$1.app" >/dev/null 2>&1; }

case "${1:-status}" in

on)
  echo "=== BEFORE ==="; report before; echo

  echo "=== quitting apps (graceful) ==="
  : > "$STATE"
  for app in "${APPS[@]}"; do
    if running "$app"; then
      echo "$app" >> "$STATE"
      osascript -e "quit app \"$app\"" 2>/dev/null && echo "  quit: $app" || echo "  could not quit: $app (quit it by hand)"
    fi
  done

  echo; echo "=== unloading periodic agents ==="
  for a in "${AGENTS[@]}"; do
    p="$HOME/Library/LaunchAgents/$a.plist"
    [ -f "$p" ] || continue
    if launchctl bootout "gui/$UID/$a" 2>/dev/null || launchctl unload -w "$p" 2>/dev/null; then
      echo "  unloaded: $a"
    else
      echo "  already off: $a"
    fi
  done

  echo; echo "=== pausing background analysis ==="
  killall -STOP mediaanalysisd  2>/dev/null && echo "  paused: mediaanalysisd"
  killall -STOP photoanalysisd  2>/dev/null && echo "  paused: photoanalysisd"

  echo; echo "=== keeping the machine awake for unattended runs ==="
  pkill -f "caffeinate -dimsu" 2>/dev/null
  nohup caffeinate -dimsu >/dev/null 2>&1 &
  echo "  caffeinate running (pid $!)"

  sleep 4
  echo; echo "=== AFTER ==="; report after
  echo
  echo "Rig browser budget: ~1.3 GB each with the Aloqa app loaded."
  echo "Restore with:  $0 off"
  ;;

off)
  echo "=== restoring ==="
  for a in "${AGENTS[@]}"; do
    p="$HOME/Library/LaunchAgents/$a.plist"
    [ -f "$p" ] || continue
    launchctl bootstrap "gui/$UID" "$p" 2>/dev/null || launchctl load -w "$p" 2>/dev/null
    echo "  reloaded: $a"
  done
  killall -CONT mediaanalysisd 2>/dev/null && echo "  resumed: mediaanalysisd"
  killall -CONT photoanalysisd 2>/dev/null && echo "  resumed: photoanalysisd"
  pkill -f "caffeinate -dimsu" 2>/dev/null && echo "  caffeinate stopped"
  if [ -s "$STATE" ]; then
    echo; echo "apps that were quit (reopen as you like):"
    sed 's/^/  /' "$STATE"
  fi
  echo; report now
  ;;

status)
  report now
  echo
  echo "rig browsers up: $(pgrep -f chrome-for-testing 2>/dev/null | wc -l | tr -d ' ') procs"
  echo "caffeinate:      $(pgrep -f 'caffeinate -dimsu' >/dev/null && echo on || echo off)"
  echo "paused analysis: $(ps -o stat= -p "$(pgrep -x mediaanalysisd 2>/dev/null | head -1)" 2>/dev/null | grep -q T && echo yes || echo no)"
  echo
  echo "top memory consumers:"
  ps -Axo rss=,comm= | sort -rn | head -8 | awk '{printf "  %7.0f MB  %s\n", $1/1024, $2}'
  ;;

*) echo "usage: $0 {on|off|status}" >&2; exit 2 ;;
esac
