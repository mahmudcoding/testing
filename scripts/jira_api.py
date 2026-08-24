"""Shared Jira transport: direct REST when a token is configured, `twg` otherwise.

Direct calls authenticate with a personal API token from seed/.env.local and are
subject only to Atlassian's own limits (100 req/s burst; no app quota applies to a
personal token). `twg` has its own, tighter and unpublished limiter, so it is the
fallback rather than the default.

Both paths return parsed JSON, or raise JiraError with a readable message.
"""
import base64, json, os, subprocess, sys, urllib.error, urllib.request

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


def _direct(path, method, body):
    c = _env()
    url = f"https://{c['QA_JIRA_SITE']}{path}"
    data = json.dumps(body).encode() if body is not None else None
    req = urllib.request.Request(url, data=data, method=method)
    token = base64.b64encode(f"{c['QA_JIRA_EMAIL']}:{c['QA_JIRA_TOKEN']}".encode()).decode()
    req.add_header("Authorization", "Basic " + token)
    req.add_header("Accept", "application/json")
    if data:
        req.add_header("Content-Type", "application/json")
    try:
        with urllib.request.urlopen(req, timeout=60) as r:
            raw = r.read().decode("utf-8", "replace")
            return json.loads(raw) if raw.strip() else {}
    except urllib.error.HTTPError as e:
        detail = e.read().decode("utf-8", "replace")[:300]
        raise JiraError(f"HTTP {e.code} on {method} {path}: {detail}")
    except Exception as e:
        raise JiraError(f"{method} {path}: {e}")


def _twg(path, method, body):
    cmd = [os.path.expanduser("~/.local/bin/twg"), "api", f"jira:{path}", "-X", method]
    if body is not None:
        cmd += ["--input", "-"]
    p = subprocess.run(cmd, input=json.dumps(body) if body is not None else None,
                       capture_output=True, text=True)
    raw = p.stdout.strip()
    if not raw:
        if p.returncode == 0:
            return {}
        raise JiraError(f"twg {method} {path} exit {p.returncode}: {p.stderr[:200]}")
    try:
        d = json.loads(raw)
    except json.JSONDecodeError:
        raise JiraError(f"twg returned non-JSON: {raw[:200]}")
    if isinstance(d, dict):
        if d.get("ok") is False:
            raise JiraError("twg " + (d.get("error") or {}).get("code", "error"))
        if d.get("errorMessages"):
            raise JiraError("; ".join(d["errorMessages"])[:200])
        if isinstance(d.get("status"), int) and d["status"] >= 400:
            raise JiraError(f"{d['status']} {d.get('title','')} {d.get('detail','')}"[:200])
    return d


def call(path, method="GET", body=None):
    """Direct REST if a token is configured, else twg. Falls back on transport failure."""
    if have_token():
        try:
            return _direct(path, method, body)
        except JiraError as e:
            if "HTTP 4" in str(e) or "HTTP 5" in str(e):
                raise                                    # a real API error — don't retry elsewhere
            print(f"  direct call failed ({e}); falling back to twg", file=sys.stderr)
    return _twg(path, method, body)


def transport():
    return "direct REST (personal token)" if have_token() else "twg"
