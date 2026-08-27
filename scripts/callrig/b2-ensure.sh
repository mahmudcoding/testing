#!/bin/zsh
# Relaunch any lane-B browser that is not listening, then wait until CDP answers.
cd /Users/mahmud/Projects/testing
export QA_LANE=B
typeset -A PORT
PORT=(alice 9232 bob 9233 carol 9234 guest 9238)
accts=($@); [[ ${#accts} -eq 0 ]] && accts=(alice bob carol guest)
launched=()
for a in $accts; do
  p=$PORT[$a]
  if curl -s -m 2 "http://127.0.0.1:$p/json/version" >/dev/null 2>&1; then
    echo "$a ($p) up"
  else
    echo "$a ($p) down -> launching"
    scripts/callrig/launch.sh B $a 2>&1 | tail -1
    launched+=($a)
  fi
done
# wait for CDP readiness on anything just launched
for a in $launched; do
  p=$PORT[$a]
  for i in {1..40}; do
    if curl -s -m 2 "http://127.0.0.1:$p/json/list" 2>/dev/null | grep -q '"type": *"page"'; then
      echo "$a ($p) ready"; break
    fi
    sleep 1
  done
done
