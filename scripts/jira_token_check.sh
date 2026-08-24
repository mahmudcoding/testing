#!/usr/bin/env bash
# Verifies the Jira API token in seed/.env.local works. Prints nothing secret.
set -euo pipefail
cd "$(dirname "$0")/.."
set -a; . ./seed/.env.local; set +a
: "${QA_JIRA_TOKEN:?not set — paste it into seed/.env.local}"
[ -n "$QA_JIRA_TOKEN" ] || { echo "QA_JIRA_TOKEN is empty — paste the token into seed/.env.local"; exit 1; }
code=$(curl -s -o /tmp/jt.json -w '%{http_code}' -u "$QA_JIRA_EMAIL:$QA_JIRA_TOKEN" \
        -H 'Accept: application/json' "https://$QA_JIRA_SITE/rest/api/3/myself")
if [ "$code" = 200 ]; then
  python3 -c "import json;d=json.load(open('/tmp/jt.json'));print('OK — authenticated as',d.get('displayName'),'<'+d.get('emailAddress','?')+'>')"
  curl -s -D- -o /dev/null -u "$QA_JIRA_EMAIL:$QA_JIRA_TOKEN" \
       "https://$QA_JIRA_SITE/rest/api/3/myself" | grep -i '^ratelimit-policy:' | sed 's/^/quota: /'
else
  echo "FAILED — HTTP $code"; head -c 200 /tmp/jt.json; echo
fi
rm -f /tmp/jt.json
