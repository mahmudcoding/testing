"""Jira REST transport — direct calls with a personal API token.

Credentials come from seed/.env.local (gitignored): QA_JIRA_SITE, QA_JIRA_EMAIL,
QA_JIRA_TOKEN. A personal token is subject only to Atlassian's own burst limit
(100 req/s, no app quota), so no pacing or backoff is needed.

Returns parsed JSON, or raises JiraError with a readable message.
"""
import base64, json, os, urllib.error, urllib.request

ENV = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "seed", ".env.local")


class JiraError(RuntimeError):
    pass


def _env():
    cfg = {}
    if os.path.exists(ENV):
        for line in open(ENV, encoding="utf-8"):
            line = line.strip()
            if line.startswith("QA_JIRA_") and "=" in line:
                k, v = line.split("=", 1)
                cfg[k] = v.strip().strip("'\"")
    for k in ("QA_JIRA_SITE", "QA_JIRA_EMAIL", "QA_JIRA_TOKEN"):
        if os.environ.get(k):
            cfg[k] = os.environ[k]
    return cfg


def have_token():
    c = _env()
    return bool(c.get("QA_JIRA_TOKEN") and c.get("QA_JIRA_EMAIL") and c.get("QA_JIRA_SITE"))


def call(path, method="GET", body=None):
    c = _env()
    if not have_token():
        raise JiraError(
            "no Jira credentials — set QA_JIRA_SITE / QA_JIRA_EMAIL / QA_JIRA_TOKEN in seed/.env.local. "
            "Create a token at https://id.atlassian.com/manage-profile/security/api-tokens, "
            "then check it with scripts/jira_token_check.sh")
    req = urllib.request.Request(f"https://{c['QA_JIRA_SITE']}{path}",
                                 data=json.dumps(body).encode() if body is not None else None,
                                 method=method)
    req.add_header("Authorization", "Basic " + base64.b64encode(
        f"{c['QA_JIRA_EMAIL']}:{c['QA_JIRA_TOKEN']}".encode()).decode())
    req.add_header("Accept", "application/json")
    if body is not None:
        req.add_header("Content-Type", "application/json")
    try:
        with urllib.request.urlopen(req, timeout=60) as r:
            raw = r.read().decode("utf-8", "replace")
            return json.loads(raw) if raw.strip() else {}
    except urllib.error.HTTPError as e:
        raise JiraError(f"HTTP {e.code} on {method} {path}: "
                        f"{e.read().decode('utf-8', 'replace')[:300]}")
    except Exception as e:
        raise JiraError(f"{method} {path}: {e}")


def transport():
    return "direct REST (personal token)"
