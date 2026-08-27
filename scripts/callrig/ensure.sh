#!/usr/bin/env bash
# Bring a lane's browsers up and signed in, repairing only what is missing.
#   ./ensure.sh B alice bob guest
#
# Idempotent and safe to run at any point, including mid-session: a browser that
# is already up and signed in as the right account is left completely alone — it
# is not navigated, not reloaded, not re-logged. Three sessions each hand-rolled
# their own version of this after external kills cost them measurements, which is
# why it lives here now.
#
# Exit status is 0 only if every account asked for ended up ready.
set -euo pipefail
cd "$(dirname "$0")"

LANE="${1:?usage: ensure.sh <lane> <account>...}"; shift
[ "$#" -gt 0 ] || { echo "usage: ensure.sh <lane> <account>..." >&2; exit 2; }

fail=0
for ACCT in "$@"; do
  PORT="$(node rigmap.mjs port "$LANE" "$ACCT")"
  EMAIL="$(node rigmap.mjs email "$LANE" "$ACCT")"

  if ! nc -z -G 1 -w 1 127.0.0.1 "$PORT" 2>/dev/null; then
    echo "ensure: $ACCT (port $PORT) down — launching"
    if ! ./launch.sh "$LANE" "$ACCT" >/dev/null; then
      echo "ensure: FAILED to launch $ACCT on $PORT" >&2; fail=1; continue
    fi
  fi

  # Read the session without touching the page, so a healthy browser mid-test is
  # not disturbed. Only sign in when it is actually the wrong account.
  who="$(node drive.mjs "$PORT" snip/whoami.mjs 2>/dev/null | tr -d '"' | tail -1 || echo none)"
  if [ "$who" = "$EMAIL" ]; then
    echo "ensure: $ACCT ready ($EMAIL)"
  else
    echo "ensure: $ACCT signed in as ${who:-none}, logging in as $EMAIL"
    if QA_EMAIL="$EMAIL" node drive.mjs "$PORT" snip/login.mjs >/dev/null 2>&1; then
      who="$(node drive.mjs "$PORT" snip/whoami.mjs 2>/dev/null | tr -d '"' | tail -1 || echo none)"
      [ "$who" = "$EMAIL" ] && echo "ensure: $ACCT ready ($EMAIL)" \
        || { echo "ensure: $ACCT still not signed in (got ${who:-none})" >&2; fail=1; }
    else
      echo "ensure: login failed for $ACCT" >&2; fail=1
    fi
  fi
done
exit "$fail"
