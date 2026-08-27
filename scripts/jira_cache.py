#!/usr/bin/env python3
"""Local mirror of the ALK project, so any ticket lookup costs zero Jira calls.

Caching only open Bugs is enough for dedup and useless for anything else — a Task like a fix-verification ticket, a ticket that
is already Done, or the ALK ids named in a release's commits. Every one of those
was an ad-hoc query. Mirroring once makes every later lookup free.

This mirrors the whole project once, then tops up by `updated >=` on later runs.

  scripts/jira_cache.py sync                  # first run full, then incremental
  scripts/jira_cache.py sync --full           # force a complete re-fetch
  scripts/jira_cache.py show ALK-3123
  scripts/jira_cache.py list --open-bugs          # the dedup scope
  scripts/jira_cache.py list --keys ALK-3359,ALK-3358
  scripts/jira_cache.py grep 'recurrence'     # over summary + description

Everything but `sync` is local and free.
"""
import argparse, json, os, re, sys, time
from datetime import datetime, timedelta

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import jira_api

CACHE = os.path.expanduser("~/.cache/aloqa-qa/alk-cache.json")
PROJECT, PAGE = "ALK", 100


def search(body):
    try:
        return jira_api.call("/rest/api/3/search/jql", "POST", body)
    except jira_api.JiraError as e:
        return {"__err": str(e)}


def adf_text(node, out):
    if isinstance(node, dict):
        if node.get("type") == "text":
            out.append(node.get("text", ""))
        elif node.get("type") in ("hardBreak", "paragraph", "listItem", "heading", "codeBlock"):
            out.append("\n")
        for v in node.values():
            adf_text(v, out)
    elif isinstance(node, list):
        for v in node:
            adf_text(v, out)
    return out


def fetch(jql, label):
    """Page through a JQL, backing off when Jira throttles."""
    issues, token, page = {}, None, 0
    while True:
        page += 1
        body = {"jql": jql, "maxResults": PAGE,
                "fields": ["summary", "description", "status", "issuetype", "updated", "resolution"]}
        if token:
            body["nextPageToken"] = token
        for attempt in range(6):
            d = search(body)
            if "__err" not in d:
                break
            wait = 30 * (attempt + 1)
            print(f"  {d['__err']} — waiting {wait}s (page {page})", file=sys.stderr)
            time.sleep(wait)
        else:
            sys.exit(f"gave up on page {page}")
        for it in d.get("issues", []):
            f = it.get("fields") or {}
            issues[it["key"]] = {
                "key": it["key"], "summary": f.get("summary"),
                "status": (f.get("status") or {}).get("name"),
                "type": (f.get("issuetype") or {}).get("name"),
                "updated": f.get("updated"),
                "resolution": (f.get("resolution") or {}).get("name"),
                "description": re.sub(r"\n{3,}", "\n\n", "".join(adf_text(f.get("description"), [])).strip()),
            }
        print(f"  {label} page {page}: {len(issues)} so far", file=sys.stderr)
        token = d.get("nextPageToken") if not d.get("isLast") else None
        if not token:
            break
    return issues


def load():
    if os.path.exists(CACHE):
        return json.load(open(CACHE, encoding="utf-8"))
    return {"synced_at": None, "issues": {}}


def save(c):
    # Atomic: parallel sessions may sync at the same moment, and a half-written
    # mirror is worse than a stale one — a torn file makes every later read fail.
    os.makedirs(os.path.dirname(CACHE), exist_ok=True)
    tmp = "%s.tmp.%d" % (CACHE, os.getpid())
    with open(tmp, "w", encoding="utf-8") as fh:
        json.dump(c, fh, ensure_ascii=False)
    os.replace(tmp, CACHE)


def cmd_sync(a):
    c = load()
    if a.full or not c["synced_at"]:
        jql, label = f"project = {PROJECT} ORDER BY created ASC", "full"
    else:
        since = c["synced_at"][:16].replace("T", " ")
        jql, label = f'project = {PROJECT} AND updated >= "{since}" ORDER BY created ASC', "delta"
    t0 = time.time()
    got = fetch(jql, label)
    c["issues"].update(got)
    c["synced_at"] = datetime.now().astimezone().isoformat(timespec="seconds")
    save(c)
    chars = sum(len(i.get("description") or "") for i in c["issues"].values())
    print(f"{label}: +{len(got)} → {len(c['issues'])} issues, {chars//1000}k chars, "
          f"{time.time()-t0:.0f}s via {jira_api.transport()} → {CACHE}", file=sys.stderr)


OPEN_BUG_STATUSES = {"backlog", "ready", "in progress"}   # TESTING == closed here


def rows(c, a):
    out = list(c["issues"].values())
    if getattr(a, "open_bugs", False):
        out = [i for i in out if (i["type"] or "").lower() == "bug"
               and (i["status"] or "").lower() in OPEN_BUG_STATUSES]
    if getattr(a, "keys", None):
        want = {k.strip().upper() for k in a.keys.split(",")}
        out = [i for i in out if i["key"].upper() in want]
    if getattr(a, "status", None):
        out = [i for i in out if (i["status"] or "").lower() == a.status.lower()]
    if getattr(a, "type", None):
        out = [i for i in out if (i["type"] or "").lower() == a.type.lower()]
    if getattr(a, "since", None):
        n = int(a.since.rstrip("d"))
        cut = (datetime.now().astimezone() - timedelta(days=n)).isoformat()
        out = [i for i in out if (i["updated"] or "") >= cut]
    return sorted(out, key=lambda i: i["updated"] or "", reverse=True)


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    sub = ap.add_subparsers(dest="cmd", required=True)
    s = sub.add_parser("sync"); s.add_argument("--full", action="store_true")
    sh = sub.add_parser("show"); sh.add_argument("key")
    li = sub.add_parser("list")
    for p in (li,):
        p.add_argument("--status"); p.add_argument("--type")
        p.add_argument("--since", help="e.g. 7d"); p.add_argument("--keys")
        p.add_argument("--open-bugs", action="store_true",
                       help="the dedup scope: Bugs in Backlog/Ready/In Progress. "
                            "TESTING means closed in this project and is excluded.")
    g = sub.add_parser("grep"); g.add_argument("pattern")
    a = ap.parse_args()

    if a.cmd == "sync":
        return cmd_sync(a)
    c = load()
    if not c["issues"]:
        sys.exit("cache empty — run: scripts/jira_cache.py sync")
    if a.cmd == "show":
        i = c["issues"].get(a.key.upper()) or sys.exit(f"{a.key} not in cache")
        print(f"{i['key']}  [{i['type']}/{i['status']}]  {i['summary']}\n\n{i['description']}")
    elif a.cmd == "list":
        r = rows(c, a)
        for i in r:
            print(f"{i['key']}\t{i['type']}\t{i['status']}\t{i['summary']}")
        print(f"-- {len(r)} issue(s); cache synced {c['synced_at']}", file=sys.stderr)
    elif a.cmd == "grep":
        rx = re.compile(a.pattern, re.I)
        hits = [i for i in c["issues"].values()
                if rx.search(i["summary"] or "") or rx.search(i["description"] or "")]
        for i in sorted(hits, key=lambda x: x["key"]):
            where = "+".join(w for w, t in (("summary", i["summary"]), ("description", i["description"])) if rx.search(t or ""))
            print(f"{i['key']}\t{i['status']}\t[{where}]\t{i['summary']}")
        print(f"-- {len(hits)} match(es)", file=sys.stderr)


if __name__ == "__main__":
    main()
