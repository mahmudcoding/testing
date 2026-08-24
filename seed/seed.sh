#!/usr/bin/env bash
# Seed / repair the permanent QA fixtures on Aloqa staging.
# Idempotent — run it as often as you like.
#
#   seed/seed.sh            seed then verify
#   seed/seed.sh --verify   verify only, write nothing
set -euo pipefail
cd "$(dirname "$0")"

if [ -f .env.local ]; then set -a; . ./.env.local; set +a; fi

VENV="${QA_VENV:-$HOME/.cache/aloqa-qa-venv}"
if [ ! -x "$VENV/bin/python" ]; then
  echo "creating venv at $VENV"
  python3 -m venv "$VENV"
  "$VENV/bin/pip" install --quiet --upgrade pip
  "$VENV/bin/pip" install --quiet "psycopg[binary]" bcrypt
fi

exec "$VENV/bin/python" seed_qa_fixtures.py "$@"
