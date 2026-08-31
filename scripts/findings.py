#!/usr/bin/env python3
"""The one parser. Findings are Markdown with flat frontmatter; nothing reads HTML.

Findings used to be authored as HTML and read back by five independent regex
parsers that disagreed with each other -- on what counts as a finding, on which
severities exist, on which class names match. Four bug classes came out of that,
and every one of them is a shape this module makes impossible rather than
detectable:

  * a repro block attached to a finding by document position, so one stray <h2
    silently drove the wrong snippet against the wrong browsers;
  * a finding identified by sha1(title), so fixing a typo orphaned the human's
    recorded verdict;
  * a severity attached to an article by fuzzy-matching the summary table;
  * the browsers to launch guessed by grepping Russian morphology.

Here a finding is a file, its id is stated, its repro is a field on it, and the
summary table is generated from the same list as the articles.

Stdlib only, deliberately: there is no PyYAML here, `pip install` is refused
under PEP-668, and macapp/Bench.swift launches bench.py with a hard-coded system
python3 -- a venv dependency would mean changing the Swift launcher too. So the
frontmatter is flat (scalars and comma lists, no nesting), which is also one
shape to parse and one shape to validate.

    from findings import load_findings, load_run, load_runs
"""
import copy
import os
import re

HERE = os.path.dirname(os.path.abspath(__file__))
# QA_REPO lets a caller point the whole module at a copy of the tree. The
# selftest uses it to mutate findings in a temp directory instead of in
# reports/, which is what removes the need for a crash net over tracked files.
REPO = os.environ.get("QA_REPO") or os.path.normpath(os.path.join(HERE, ".."))
FINDINGS_DIR = os.path.join(REPO, "reports", "findings")
RUNS_DIR = os.path.join(REPO, "reports", "runs")
SNIP_DIR = os.path.join(REPO, "scripts", "callrig", "snip")

# The section headings a finding may carry, in render order. These are the
# schema: a heading outside this set is a validation error rather than a silently
# dropped field, which is how the old Russian-keyed dict lost whole sections to a
# typo.
SECTIONS = ["Проблема", "Как воспроизвести", "Фактический результат",
            "Подтверждённая причина", "Ожидаемый результат", "Проверка",
            "Почему снято"]
REQUIRED_SECTIONS = ["Проблема", "Как воспроизвести", "Фактический результат",
                     "Ожидаемый результат", "Проверка"]

SEVERITIES = ["Critical", "High", "Medium", "Low"]
SIDES = ["backend", "frontend"]
STATUSES = ["published", "withdrawn", "duplicate"]
# Kept from verify_run.ROUTE's keys: the surface names route a verification walk
# to a starting URL. Stated per finding now instead of guessed from its prose.
SURFACES = ["Calls", "Chat", "Admin settings", "Roles", "Settings",
            "Directories", "Calendar", "Files", "Shell"]

FIELDS_REQUIRED = ["id", "title", "severity", "side", "surface", "status"]
FIELDS_KNOWN = FIELDS_REQUIRED + ["tags", "lane", "accounts", "snippet",
                                  "build", "sha", "duplicate-of"]
LIST_FIELDS = {"tags", "accounts", "findings"}
SOURCE_DIRS = [FINDINGS_DIR, RUNS_DIR]


class SourceError(Exception):
    """A source file that cannot be read as a finding or a run."""


# --------------------------------------------------------------------------
# frontmatter


def split_front(text, path="<source>"):
    """(dict of frontmatter, body) for a file opening with a --- fence.

    Flat only: `key: scalar` or `key: a, b, c`. A nested or multi-line value is
    an error rather than a silent partial read -- the whole reason for the flat
    shape is that there is exactly one thing the parser can encounter.
    """
    if not text.startswith("---\n"):
        raise SourceError("%s: no frontmatter (file must open with '---')" % path)
    end = text.find("\n---\n", 3)
    if end == -1:
        raise SourceError("%s: frontmatter is never closed with '---'" % path)
    head, body = text[4:end + 1], text[end + 5:]

    front = {}
    for n, line in enumerate(head.splitlines(), start=2):
        if not line.strip() or line.lstrip().startswith("#"):
            continue
        if line[:1] in " \t":
            raise SourceError("%s:%d: indented frontmatter line — the schema is "
                              "flat, use a comma list instead of nesting" % (path, n))
        if ":" not in line:
            raise SourceError("%s:%d: frontmatter line without a colon: %r"
                              % (path, n, line[:60]))
        k, _, v = line.partition(":")
        k, v = k.strip(), v.strip()
        if k in front:
            raise SourceError("%s:%d: duplicate frontmatter key %r" % (path, n, k))
        front[k] = [x.strip() for x in v.split(",") if x.strip()] if k in LIST_FIELDS else v
    return front, body


# --------------------------------------------------------------------------
# body


def split_sections(body, path="<source>", preamble=False):
    """{heading: raw markdown} for '## ' sections, in document order.

    A finding is nothing but sections, so prose before the first heading there is
    content that no consumer would ever read -- an error, not a silent loss. A run
    is the opposite: its `# ` title and lede legitimately precede any section, so
    it passes preamble=True.
    """
    out = {}
    cur, buf = None, []
    for line in body.splitlines():
        if line.startswith("## "):
            if cur is not None:
                out[cur] = "\n".join(buf).strip()
            cur, buf = line[3:].strip(), []
        elif cur is not None:
            buf.append(line)
        elif line.strip() and not line.startswith("#") and not preamble:
            raise SourceError("%s: prose before the first '## ' heading — a finding "
                              "is only sections, so this text would be dropped" % path)
    if cur is not None:
        out[cur] = "\n".join(buf).strip()
    return out


FENCE = re.compile(r"^```[^\n]*\n(.*?)^```\s*$", re.M | re.S)


def split_prose_and_code(section):
    """(prose without fenced blocks, '\\n\\n'-joined fenced blocks).

    The measurement lives in a fence. Splitting them here is what lets the word
    budget count prose only, and lets the renderer put the measurement in a <pre>
    without the author choosing markup.
    """
    code = [m.group(1).rstrip("\n") for m in FENCE.finditer(section)]
    prose = FENCE.sub("", section).strip()
    return prose, "\n\n".join(code)


def list_items(section):
    """Items of an ordered or unordered list, markers stripped.

    Fences are stripped first. The renderer puts a fenced block in a <pre>, so a
    line inside one that happens to start with "- " or "1." is not a list item --
    counting it here made the published report and the bench disagree about how
    many steps a finding has, and the bench's tick list could then never
    complete. Every other text helper in this module is fence-aware; this one
    was the exception.
    """
    out = []
    for line in FENCE.sub("", section).splitlines():
        m = re.match(r"\s*(?:[-*]|\d+[.)])\s+(.*)$", line)
        if m:
            out.append(m.group(1).strip())
        elif out and line.strip() and line[:1] in " \t":
            out[-1] += " " + line.strip()      # continuation of the previous item
    return out


def plain(md):
    """Markdown prose as one line of text, for word counts and the UI."""
    t = FENCE.sub(" ", md)
    t = re.sub(r"`([^`]*)`", r"\1", t)
    t = re.sub(r"\[([^\]]*)\]\([^)]*\)", r"\1", t)
    return re.sub(r"\s+", " ", t).strip()


# --------------------------------------------------------------------------
# findings


def load_finding(path):
    """One finding file -> the dict every consumer sees."""
    with open(path, encoding="utf-8") as fh:
        text = fh.read()
    front, body = split_front(text, path)
    secs = split_sections(body, path)

    unknown = [h for h in secs if h not in SECTIONS]
    if unknown:
        raise SourceError("%s: unknown section heading(s): %s — the schema is %s"
                          % (path, ", ".join(unknown), ", ".join(SECTIONS)))

    actual_prose, measure = split_prose_and_code(secs.get("Фактический результат", ""))
    tags = front.get("tags") or []
    f = {
        "id": front.get("id", ""),
        "path": os.path.relpath(path, REPO),
        "title": front.get("title", ""),
        "tags": tags,
        # The [FE-WEB][CHAT] prefix is generated from tags at render time, so the
        # title stays one string and the summary row cannot drift from the <h2>.
        "titleTagged": "".join("[%s]" % t for t in tags) + (" " if tags else "") + front.get("title", ""),
        "sev": front.get("severity", ""),
        "side": front.get("side", ""),
        "area": tags[-1] if tags else "?",
        "surface": front.get("surface", ""),
        "status": front.get("status", "published"),
        "duplicateOf": front.get("duplicate-of", ""),
        "lane": front.get("lane", ""),
        "accounts": front.get("accounts") or [],
        "snippet": front.get("snippet", ""),
        "build": front.get("build", ""),
        "sha": front.get("sha", ""),
        "raw": text,          # the source, so validators need not re-read it
        "sections": secs,
        "steps": list_items(secs.get("Как воспроизвести", "")),
        "checks": list_items(secs.get("Проверка", "")),
        "problem": plain(secs.get("Проблема", "")),
        "actual": plain(actual_prose),
        "measure": measure,
        "cause": plain(secs.get("Подтверждённая причина", "")),
        "expected": plain(secs.get("Ожидаемый результат", "")),
        "withdrawnBecause": plain(secs.get("Почему снято", "")),
        "unknownFields": [k for k in front if k not in FIELDS_KNOWN],
    }
    # repro is a field on the finding, never a positional lookup into a second list
    f["repro"] = ({"lane": f["lane"], "accounts": ",".join(f["accounts"]),
                   "snippet": f["snippet"]} if f["snippet"] else None)
    return f


def load_findings(status="published"):
    """Every finding on disk, id -> finding. status=None for all of them."""
    out = {}
    if not os.path.isdir(FINDINGS_DIR):
        return out
    for name in sorted(os.listdir(FINDINGS_DIR)):
        if not name.endswith(".md"):
            continue
        f = load_finding(os.path.join(FINDINGS_DIR, name))
        if status and f["status"] != status:
            continue
        if not f["id"]:
            raise SourceError("%s: no id" % f["path"])
        if f["id"] in out:
            # Hard stop: every consumer resolves findings by id, so a collision
            # has no safe interpretation. It is only reachable when an `id:` does
            # not match its filename, so say that -- pointing at verify_report
            # was circular advice, since it raises this same error before it can
            # reach its own per-file check.
            raise SourceError("%s: id %r already used by %s — an id must match "
                              "its filename, so rename the id in one of them"
                              % (f["path"], f["id"], out[f["id"]]["path"]))
        out[f["id"]] = f
    return out


SEV_RANK = {s: i for i, s in enumerate(SEVERITIES)}


def load_run(path, index=None, known=None):
    """A run file plus its resolved findings, severity-ordered.

    The order is computed once here, so the summary table and the articles that
    the renderer emits come from one list. Two lists that must agree is the shape
    that produced the substitution and ordering bugs.
    """
    with open(path, encoding="utf-8") as fh:
        text = fh.read()
    front, body = split_front(text, path)
    index = load_findings() if index is None else index
    ids = front.get("findings") or []
    # A run lists ids; some of them stop being publishable. Withdrawing a single
    # finding is the normal outcome of verification, and it must not empty the
    # run -- raising here blanked every other finding in it. Unpublished ids are
    # dropped with a note; an id that names no file at all is still an error,
    # because that is a typo rather than a decision.
    dropped = [i for i in ids if i not in index]
    if dropped:
        # Telling a withdrawn id from a typo'd one needs an all-status view. A
        # caller that already has one passes it as `known`; only a caller that
        # does not pays for the scan. Withdrawing a finding is the ordinary case,
        # so making it re-read every file was the cost this exists to avoid.
        everything = known if known is not None else load_findings(status=None)
        missing = [i for i in dropped if i not in everything]
        if missing:
            raise SourceError("%s: findings not found: %s"
                              % (os.path.relpath(path, REPO), ", ".join(missing)))
    ids = [i for i in ids if i in index]
    # Deep-copy before ordering. These dicts belong to a shared index, so
    # numbering them in place meant a finding listed by two runs took whichever
    # number the last run assigned. A shallow dict() left `steps`, `accounts`,
    # `sections` and `repro` shared, so the guarantee only held for the keys
    # nobody happened to mutate yet.
    items = [copy.deepcopy(index[i]) for i in ids]
    items.sort(key=lambda f: SEV_RANK.get(f["sev"], len(SEVERITIES)))
    for i, f in enumerate(items, start=1):
        f["n"] = i
    secs = split_sections(body, path, preamble=True)
    return {
        "path": os.path.relpath(path, REPO),
        "raw": text,          # the source, so validators need not re-read it
        "dropped": dropped,
        "date": front.get("date", ""),
        "lane": front.get("lane", ""),
        "sector": front.get("sector", ""),
        "area": front.get("area", ""),
        "build": front.get("build", ""),
        "sha": front.get("sha", ""),
        "artifact": front.get("artifact", ""),
        "heading": (re.search(r"^# (.+)$", body, re.M).group(1).strip()
                    if re.search(r"^# (.+)$", body, re.M) else ""),
        "lede": [p.strip() for p in re.split(r"\n\s*\n", re.sub(r"^# .+$", "", body, flags=re.M).split("## ")[0]) if p.strip()],
        "sections": secs,
        "items": items,
        "basename": "aloqa-%s-qa-%s-%s" % (front.get("area", "report"),
                                           front.get("date", ""), front.get("lane", "")),
    }


def is_run_path(path):
    """Does this path name a run rather than a finding?

    One definition, because two spellings of it diverged: a substring test for
    "/runs/" fires on any ancestor directory of that name, so a repo checked out
    under ~/runs sent every finding down the run branch -- and in verify_report
    the routing was fixed while the sibling count line kept the old test, so the
    summary reported checking a run it had not looked at.
    """
    return os.path.basename(os.path.dirname(os.path.abspath(path))) == "runs"


def publish_blockers(run):
    """Why this run must not be published, or [] if it may be.

    One definition, three reactions: the renderer refuses, the validator errors,
    the bench warns. Leaving each consumer to decide for itself is how the
    renderer ended up silently publishing a run short -- it was the only one that
    never asked.
    """
    out = []
    for d in run.get("dropped") or []:
        out.append("lists %s, which is not published" % d)
    if not run.get("items"):
        out.append("has no findings to publish")
    return out


def load_runs():
    """Every run on disk, newest first."""
    if not os.path.isdir(RUNS_DIR):
        return []
    known = load_findings(status=None)
    index = {k: v for k, v in known.items() if v["status"] == "published"}
    runs = [load_run(os.path.join(RUNS_DIR, n), index, known)
            for n in sorted(os.listdir(RUNS_DIR)) if n.endswith(".md")]
    runs.sort(key=lambda r: (r["date"], r["lane"]), reverse=True)
    return runs


def bench_items(runs=None):
    """The flat list bench.py serves, one entry per finding across all runs.

    Field names match what reports/tools/bench-ui.html already reads, so the UI
    and the Mac app need no changes.
    """
    out = []
    for r in runs if runs is not None else load_runs():
        for f in r["items"]:
            out.append({
                # The FINDING's lane, not the run's. The snippet is bound to a
                # lane (it hardcodes that lane's workspace id and its name carries
                # the prefix), so driving it on the lane the run happened to use
                # is how a repro ends up pointed at another lane's fixtures.
                "id": f["id"], "n": f["n"], "lane": f["lane"] or r["lane"],
                "laneName": lane_name(r), "title": f["titleTagged"],
                "sev": f["sev"], "area": f["area"], "side": f["side"],
                "surface": f["surface"], "accounts": f["accounts"],
                "steps": f["steps"], "problem": f["problem"], "actual": f["actual"],
                "measure": f["measure"], "expected": f["expected"],
                "notes": notes_for(f), "repro": f["repro"],
            })
    return out


def lane_name(run):
    """Display name for a run, from its area token rather than its lane letter."""
    area = run.get("area") or ""
    head, _, tail = area.partition("-")
    return "%s · %s" % (head.capitalize(), tail.replace("-", " ")) if tail else head.capitalize()


def notes_for(f):
    """Warnings a person should see before judging this finding."""
    out = []
    if not f["snippet"]:
        out.append("No repro snippet — this finding has to be reached by hand.")
    if f["status"] == "duplicate":
        out.append("Marked duplicate of %s." % (f["duplicateOf"] or "another ticket"))
    if not f["cause"]:
        out.append("No Подтверждённая причина — the cause was deliberately omitted.")
    return out


def withdrawn():
    """The false-positive register: findings measured and then killed.

    This used to be prose in session logs, found by grepping for 'ложн' inside a
    600-character window. It is a field now.
    """
    return [f for f in load_findings(status=None).values() if f["status"] == "withdrawn"]


if __name__ == "__main__":
    import json
    import sys
    if "--withdrawn" in sys.argv:
        for f in withdrawn():
            print("  %-40s %s" % (f["id"], f["title"][:70]))
            if f["withdrawnBecause"]:
                print("      %s" % f["withdrawnBecause"][:100])
    else:
        print(json.dumps(bench_items(), ensure_ascii=False, indent=1))
