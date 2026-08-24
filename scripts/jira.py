#!/usr/bin/env python3
"""Jira reads and writes through `twg`, keeping payloads out of the model's context.

The Atlassian MCP echoes the whole issue back on every create/comment — description
verbatim plus reporter/assignee/project blocks with four avatar URLs each. `twg` hits
the same API with the same credentials and returns plain text, and --output-file keeps
even that on disk.

  scripts/jira.py comment ALK-3123 --file body.md
  scripts/jira.py create --summary '[FE-WEB][CALLS] …' --file body.md \
                         --priority High --labels frontend
  scripts/jira.py search --jql 'project = ALK AND status = Done' --out /tmp/s.json
  scripts/jira.py get ALK-3123 --out /tmp/i.json

Bodies are written in Markdown and converted to ADF here. Supported: headings,
paragraphs, fenced code, bullet/numbered lists, tables, **bold**, `code`.
"""
import argparse, json, os, re, sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import jira_api

CLOUD = "823c42fe-9add-4000-b9b6-0c64496759f8"
PROJECT, ISSUETYPE = "ALK", "Bug"


def twg(path, method="GET", body=None, out=None):
    """Kept for call-site compatibility; routes through the shared transport."""
    try:
        d = jira_api.call(path, method, body)
    except jira_api.JiraError as e:
        sys.exit(str(e))
    if out:
        json.dump(d, open(out, "w", encoding="utf-8"), ensure_ascii=False)
    return d


# ---------- markdown -> ADF ----------
def _inline(text):
    out, i = [], 0
    for m in re.finditer(r"\*\*(.+?)\*\*|`([^`]+)`", text):
        if m.start() > i:
            out.append({"type": "text", "text": text[i:m.start()]})
        if m.group(1) is not None:
            out.append({"type": "text", "text": m.group(1),
                        "marks": [{"type": "strong"}]})
        else:
            out.append({"type": "text", "text": m.group(2),
                        "marks": [{"type": "code"}]})
        i = m.end()
    if i < len(text):
        out.append({"type": "text", "text": text[i:]})
    return out or [{"type": "text", "text": " "}]


def _cell(txt, header):
    return {"type": "tableHeader" if header else "tableCell", "attrs": {},
            "content": [{"type": "paragraph", "content": _inline(txt.strip())}]}


def md_to_adf(md):
    content, lines, i = [], md.split("\n"), 0
    while i < len(lines):
        ln = lines[i]
        if ln.startswith("```"):                                   # fenced code
            lang, buf, i = ln[3:].strip() or None, [], i + 1
            while i < len(lines) and not lines[i].startswith("```"):
                buf.append(lines[i]); i += 1
            node = {"type": "codeBlock", "content": [{"type": "text", "text": "\n".join(buf) or " "}]}
            if lang:
                node["attrs"] = {"language": lang}
            content.append(node); i += 1; continue
        if re.match(r"^#{1,6} ", ln):                              # heading
            lvl = len(ln) - len(ln.lstrip("#"))
            content.append({"type": "heading", "attrs": {"level": min(lvl, 6)},
                            "content": _inline(ln[lvl:].strip())}); i += 1; continue
        if ln.strip().startswith("|") and i + 1 < len(lines) and re.match(r"^\s*\|[\s:|-]+\|\s*$", lines[i + 1]):
            rows, header = [], True                                # table
            while i < len(lines) and lines[i].strip().startswith("|"):
                if re.match(r"^\s*\|[\s:|-]+\|\s*$", lines[i]):
                    i += 1; continue
                cells = [c for c in lines[i].strip().strip("|").split("|")]
                rows.append({"type": "tableRow", "content": [_cell(c, header) for c in cells]})
                header = False; i += 1
            content.append({"type": "table", "attrs": {"isNumberColumnEnabled": False,
                                                       "layout": "default"}, "content": rows})
            continue
        m = re.match(r"^(\s*)([-*]|\d+\.) +(.*)$", ln)             # list
        if m:
            ordered = not m.group(2) in ("-", "*")
            items = []
            while i < len(lines):
                mm = re.match(r"^(\s*)([-*]|\d+\.) +(.*)$", lines[i])
                if not mm:
                    break
                items.append({"type": "listItem",
                              "content": [{"type": "paragraph", "content": _inline(mm.group(3))}]})
                i += 1
            content.append({"type": "bulletList" if not ordered else "orderedList",
                            "content": items}); continue
        if ln.strip():                                             # paragraph
            buf = []
            while i < len(lines) and lines[i].strip() and not lines[i].startswith(("```", "#", "|")) \
                    and not re.match(r"^(\s*)([-*]|\d+\.) +", lines[i]):
                buf.append(lines[i].strip()); i += 1
            content.append({"type": "paragraph", "content": _inline(" ".join(buf))}); continue
        i += 1
    return {"type": "doc", "version": 1, "content": content or [{"type": "paragraph", "content": [{"type": "text", "text": " "}]}]}


def read_body(a):
    if a.file:
        return open(a.file, encoding="utf-8").read()
    if a.body:
        return a.body
    return sys.stdin.read()


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    sub = ap.add_subparsers(dest="cmd", required=True)

    c = sub.add_parser("comment"); c.add_argument("key")
    c.add_argument("--file"); c.add_argument("--body")

    n = sub.add_parser("create")
    n.add_argument("--summary", required=True); n.add_argument("--file"); n.add_argument("--body")
    n.add_argument("--priority", default="Medium")
    n.add_argument("--labels", default="", help="comma-separated")
    n.add_argument("--issuetype", default=ISSUETYPE)

    s = sub.add_parser("search"); s.add_argument("--jql", required=True)
    s.add_argument("--out", default="/tmp/jira-search.json"); s.add_argument("--max", type=int, default=100)
    s.add_argument("--fields", default="summary,description,status")

    g = sub.add_parser("get"); g.add_argument("key"); g.add_argument("--out", default="/tmp/jira-issue.json")
    a = ap.parse_args()

    if a.cmd == "comment":
        d = twg(f"/rest/api/3/issue/{a.key}/comment", "POST", {"body": md_to_adf(read_body(a))})
        print(f"{a.key} comment {d.get('id')} posted")

    elif a.cmd == "create":
        fields = {"project": {"key": PROJECT}, "issuetype": {"name": a.issuetype},
                  "summary": a.summary, "description": md_to_adf(read_body(a)),
                  "priority": {"name": a.priority}}
        if a.labels:
            fields["labels"] = [l.strip() for l in a.labels.split(",") if l.strip()]
        d = twg("/rest/api/3/issue", "POST", {"fields": fields})
        print(f"created {d.get('key')}  https://ttbrm.atlassian.net/browse/{d.get('key')}")

    elif a.cmd == "search":
        twg("/rest/api/3/search/jql", "POST",
            {"jql": a.jql, "maxResults": a.max, "fields": a.fields.split(",")}, out=a.out)
        d = json.load(open(a.out))
        print(f"{len(d.get('issues', []))} issue(s) -> {a.out}")

    elif a.cmd == "get":
        twg(f"/rest/api/3/issue/{a.key}", out=a.out)
        print(f"{a.key} -> {a.out}")


if __name__ == "__main__":
    main()
