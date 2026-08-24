#!/usr/bin/env python3
"""Dump the open ALK bugs (Backlog / Ready / In Progress) through the `twg` CLI, for report dedup.

HOW TO DEDUP (the method, not a suggestion):
  1. --print            read ALL summaries yourself, top to bottom. Not a keyword
                        search — you are looking for anything in the same area,
                        and a title can describe the same defect in words you
                        would never have guessed.
  2. --show <KEY>       for every candidate that looks even loosely related,
                        read its full description before deciding.

Both stages read the cached dump, so only the first call hits Jira (~9 s, 3 pages).

Two failures on 24.08.2026 that this exists to prevent:
  * ALK-3123 was missed by a stem search: its title says "с любым повтором",
    the finding was worded "повторяющаяся". Identical descriptions.
  * ALK-2899 was wrongly dismissed on its title alone; its description said the
    opposite of what the title implied.

--grep is a convenience for spot-checks. Do NOT dedup with it.

Usage:
  scripts/alk_open_bugs.py                      # fetch all pages, write JSON, print count + path (stderr)
  scripts/alk_open_bugs.py --print              # also print "KEY<TAB>status<TAB>summary" per issue (stdout)
  scripts/alk_open_bugs.py --grep 'side room'   # case-insensitive regex over summary+description
  scripts/alk_open_bugs.py --show ALK-3123      # print one issue's full description
  scripts/alk_open_bugs.py --out FILE --jql '...'

Needs the Atlassian Teamwork Graph CLI logged in (`twg doctor`). Pages through
`twg -o json jira workitem query` 100 issues at a time via pageInfo.nextCursor. The
payload goes to a temp file (`--output-file`, slimmed with `--select`) and is parsed
from there — nothing is echoed inline.
"""
import argparse
import json
import os
import re
import shutil
import subprocess
import sys
import tempfile
import time

CLOUD_ID = "823c42fe-9add-4000-b9b6-0c64496759f8"  # ttbrm.atlassian.net
DEFAULT_JQL = ('project = ALK AND issuetype = Bug AND status IN ("Backlog","Ready","In Progress") '
               'ORDER BY created DESC')
PAGE_SIZE = 100
MAX_PAGES = 50


def twg_bin():
    return shutil.which("twg") or os.path.expanduser("~/.local/bin/twg")


SELECT = "data.issues.key,data.issues.summary,data.issues.status,data.issues.updated,pageInfo"


def run_query(jql, after=None):
    fd, path = tempfile.mkstemp(prefix="twg-alk-", suffix=".json")
    os.close(fd)
    cmd = [twg_bin(), "-o", "json", "--select", SELECT, "jira", "workitem", "query",
           "--cloud-id", CLOUD_ID, "--jql", jql, "--first", str(PAGE_SIZE), "--output-file", path]
    if after:
        cmd += ["--after", after]
    try:
        p = subprocess.run(cmd, capture_output=True, text=True)
        # twg writes its error envelope INTO --output-file and still prints a
        # normal-looking "stdout=<path>" line, so the payload is the source of
        # truth, not the exit code. Check it before trusting either.
        payload = None
        if os.path.getsize(path) > 0:
            with open(path, encoding="utf-8") as f:
                try:
                    payload = json.load(f)
                except json.JSONDecodeError:
                    payload = None
        if isinstance(payload, dict) and payload.get("ok") is False:
            err = payload.get("error") or {}
            sys.exit("twg error {}: {} (status {}, trace {})".format(
                err.get("code", "?"), err.get("message", "")[:300],
                err.get("statusCode", "?"), err.get("traceId", "?")))
        if p.returncode != 0:
            sys.exit(f"twg failed (exit {p.returncode}): "
                     f"{(p.stderr.strip() or p.stdout.strip())[:600] or '<no stderr; check auth with `twg doctor`>'}")
        if payload is not None:
            return payload
        out = p.stdout.lstrip()
        if out.startswith("{"):  # plain JSON on stdout
            return json.loads(out)
        # agent envelope (YAML): full payload lives in output_files.stdout
        m = re.search(r'^\s*stdout:\s*"([^"]+)"', p.stdout, re.M)
        if not m:
            sys.exit("unexpected twg output (no --output-file content, no JSON, no envelope):\n" + p.stdout[:600])
        with open(m.group(1), encoding="utf-8") as f:
            return json.load(f)
    finally:
        try:
            os.remove(path)
        except OSError:
            pass


ADF_CACHE_NOTE = "description is flattened ADF -> plain text"


def adf_text(node, out):
    """Flatten Atlassian Document Format to plain text."""
    if isinstance(node, dict):
        if node.get("type") == "text":
            out.append(node.get("text", ""))
        elif node.get("type") in ("hardBreak", "paragraph", "listItem", "heading"):
            out.append("\n")
        for v in node.values():
            adf_text(v, out)
    elif isinstance(node, list):
        for v in node:
            adf_text(v, out)
    return out


def rest_search(jql, token=None, page_size=100):
    """Jira REST search — returns descriptions, which the graph query does not."""
    body = {"jql": jql, "maxResults": page_size,
            "fields": ["summary", "description", "status", "updated"]}
    if token:
        body["nextPageToken"] = token
    fd, path = tempfile.mkstemp(prefix="alk-rest-", suffix=".json")
    os.close(fd)
    try:
        cmd = [twg_bin(), "api", "jira:/rest/api/3/search/jql", "-X", "POST", "--input", "-"]
        with open(path, "w", encoding="utf-8") as f:
            p = subprocess.run(cmd, input=json.dumps(body), stdout=f,
                               stderr=subprocess.PIPE, text=True)
        with open(path, encoding="utf-8") as f:
            raw = f.read()
        try:
            d = json.loads(raw)
        except json.JSONDecodeError:
            sys.exit(f"twg api returned non-JSON (exit {p.returncode}): "
                     f"{(p.stderr or raw)[:400]}")
        if isinstance(d, dict) and d.get("errorMessages"):
            sys.exit("jira error: " + "; ".join(d["errorMessages"])[:300])
        if isinstance(d, dict) and d.get("ok") is False:
            err = d.get("error") or {}
            sys.exit("twg error {}: {} (status {})".format(
                err.get("code", "?"), err.get("message", "")[:200], err.get("statusCode", "?")))
        return d
    finally:
        try:
            os.remove(path)
        except OSError:
            pass


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--jql", default=DEFAULT_JQL)
    ap.add_argument("--out", default=os.path.join(tempfile.gettempdir(), "alk-open-bugs.json"))
    ap.add_argument("--print", action="store_true", help="print KEY<TAB>status<TAB>summary for every issue")
    ap.add_argument("--grep", metavar="REGEX", help="case-insensitive regex over summary+description")
    ap.add_argument("--show", metavar="KEY", help="print one issue's summary and full description")
    ap.add_argument("--no-desc", action="store_true", help="summaries only (faster, but see docstring)")
    ap.add_argument("--refresh", action="store_true", help="re-fetch even if --out already has a cached dump")
    a = ap.parse_args()

    # Two-stage dedup: fetch once, then read locally as many times as you like.
    # --print gives every summary; --show <KEY> gives one full description.
    # Re-reads the cached file unless it is missing or --refresh is passed.
    if not a.refresh and os.path.exists(a.out):
        with open(a.out, encoding="utf-8") as f:
            cached = json.load(f)
        if cached.get("jql") == a.jql and cached.get("issues"):
            report(cached["issues"], a, cached_at=cached.get("fetched_at"))
            return

    t0 = time.time()
    issues, token, pages = [], None, 0
    while True:
        d = rest_search(a.jql, token)
        pages += 1
        for it in d.get("issues", []):
            f = it.get("fields") or {}
            desc = "" if a.no_desc else re.sub(r"\n{3,}", "\n\n",
                                              "".join(adf_text(f.get("description"), [])).strip())
            issues.append({"key": it.get("key"), "summary": f.get("summary"),
                           "status": ((f.get("status") or {}).get("name")),
                           "updated": f.get("updated"), "description": desc})
        token = d.get("nextPageToken") if not d.get("isLast") else None
        if not token:
            break
        if pages >= MAX_PAGES:
            sys.exit(f"aborting after {MAX_PAGES} pages — JQL too broad?")

    with open(a.out, "w", encoding="utf-8") as f:
        json.dump({"fetched_at": time.strftime("%Y-%m-%dT%H:%M:%S%z"), "jql": a.jql,
                   "count": len(issues), "note": ADF_CACHE_NOTE, "issues": issues},
                  f, ensure_ascii=False, indent=1)
    chars = sum(len(i["description"]) for i in issues)
    print(f"{len(issues)} open ALK bugs in {pages} page(s), {time.time() - t0:.1f}s, "
          f"{chars // 1000}k chars of description -> {a.out}", file=sys.stderr)
    report(issues, a)


def report(issues, a, cached_at=None):
    if cached_at:
        print(f"{len(issues)} open ALK bugs from cache ({cached_at}) -> {a.out}"
              f"   [--refresh to re-fetch]", file=sys.stderr)

    if a.show:
        for i in issues:
            if (i["key"] or "").upper() == a.show.upper():
                print(f"{i['key']}  [{i['status']}]  {i['summary']}\n\n{i['description']}")
                return
        sys.exit(f"{a.show} not in the open-bug set")

    if a.grep:
        rx = re.compile(a.grep, re.I)
        hits = [i for i in issues if rx.search(i["summary"] or "") or rx.search(i["description"] or "")]
        for i in hits:
            where = [w for w, t in (("summary", i["summary"]), ("description", i["description"]))
                     if rx.search(t or "")]
            print(f"{i['key']}\t{i['status']}\t[{'+'.join(where)}]\t{i['summary']}")
        print(f"-- {len(hits)} match(es)", file=sys.stderr)
    elif a.print:
        for i in issues:
            print(f"{i['key']}\t{i['status']}\t{i['summary']}")


if __name__ == "__main__":
    main()
