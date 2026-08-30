#!/usr/bin/env python3
"""Validate finding and run sources against the schema.

    python3 scripts/verify_report.py                 # every source on disk
    python3 scripts/verify_report.py reports/findings/<id>.md ...

This used to parse published HTML with its own regexes -- a third independent
parser, disagreeing with the other four about what an article is, which
severities exist and whether a heading may carry attributes. Half of what it
checked was that two hand-maintained views of the same data still agreed:
the summary table against the articles, row chips against article chips, the
spelled-out Russian count against the article count. All three are generated
from one list now, so those checks have nothing left to catch and are gone.

What remains is what a generator cannot guarantee: that the content is right.
Required fields and closed enums, the prose budget, fixture names that must not
reach a published report, citations a reader can actually open, and repro
attributes that match something on disk.
"""
import os
import re
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
from findings import (FIELDS_KNOWN, FIELDS_REQUIRED, REPO,  # noqa: E402
                      REQUIRED_SECTIONS, SEVERITIES, SIDES, SNIP_DIR, SOURCE_DIRS,
                      SOURCE_ERROR_HINT, SURFACES, STATUSES, SourceError,
                      load_finding, load_findings, load_run, plain, split_front)

# Fixture names, ids, ports and hosts that must never reach a published report.
# Carried over unchanged -- this is a content rule, not a markup one.
LEAKS = [
    r'qa\.[a-z.]*@aloqa\.test', r'W4Q[A-Z0-9]', r'U4Q[A-Z0-9]', r'C4Q[A-Z0-9]',
    r'C4O[A-Z0-9]', r'S4O[A-Z0-9]', r'F4O[A-Z0-9]', r'92[0-9][0-9]\b',
    r'QA (Alice|Bob|Admin|Carol|Owner|Dave|Guest)',
    r'qa-(general|private|empty|archived)',
    r'zqrx|e2video|e2audio|e2arch|no-such-channel|NOTAREALTOKEN',
    r'e-search-control|e-arch-probe|zx9probe|probe-pw|qa-e-note',
    r'airion-cargo|aloqa\.test',
]
CITATION = re.compile(r'[A-Za-z0-9_/\[\].-]*\.(?:tsx?|json|go|py)+:[0-9-]+')
BUDGET = 180          # words over Проблема + Фактический результат + Ожидаемый результат


def check_finding(f, errs):
    where = f["path"]

    def bad(msg):
        errs.append("%s: %s" % (where, msg))

    for k in FIELDS_REQUIRED:
        key = {"severity": "sev", "side": "side", "status": "status"}.get(k, k)
        if not f.get(key):
            bad("missing required field %r" % k)
    for k in f["unknownFields"]:
        bad("unknown frontmatter field %r (known: %s)" % (k, ", ".join(FIELDS_KNOWN)))

    if f["sev"] and f["sev"] not in SEVERITIES:
        bad("severity %r is not one of %s" % (f["sev"], ", ".join(SEVERITIES)))
    if f["side"] and f["side"] not in SIDES:
        bad("side %r is not one of %s" % (f["side"], ", ".join(SIDES)))
    if f["status"] and f["status"] not in STATUSES:
        bad("status %r is not one of %s" % (f["status"], ", ".join(STATUSES)))
    if f["surface"] and f["surface"] not in SURFACES:
        bad("surface %r is not one of %s" % (f["surface"], ", ".join(SURFACES)))
    if f["id"] != os.path.splitext(os.path.basename(where))[0]:
        bad("id %r does not match the filename" % f["id"])

    for name in REQUIRED_SECTIONS:
        body = f["sections"].get(name)
        if not body:
            bad("no %s section" % name)
        elif len(plain(body).split()) < 6:
            bad("%s is thin (under six words)" % name)
    if f["status"] == "withdrawn" and not f["withdrawnBecause"]:
        bad("withdrawn but no «Почему снято» — the measurement that killed it is "
            "the whole value of keeping the finding")
    if f["status"] == "duplicate" and not f["duplicateOf"]:
        bad("duplicate but no duplicate-of")
    if not f["measure"]:
        bad("no measurement — Фактический результат needs a fenced block")
    if not f["steps"]:
        bad("Как воспроизвести has no numbered steps")
    if not f["checks"]:
        bad("Проверка has no items")

    words = sum(len(plain(f["sections"].get(k, "")).split())
                for k in ("Проблема", "Фактический результат", "Ожидаемый результат"))
    if words > BUDGET:
        bad("prose is %d words over budget (%d > %d) — check whether something is "
            "misplaced rather than merely long" % (words - BUDGET, words, BUDGET))

    text = open(os.path.join(REPO, where), encoding="utf-8").read()
    for pat in LEAKS:
        for m in set(re.findall(pat, text)):
            bad("leaked test-setup name: %r" % (m if isinstance(m, str) else m[0]))
    for c in sorted(set(CITATION.findall(text))):
        if not (c.startswith("apps/") or c.startswith("packages/") or c.startswith("platform/")):
            bad("citation %r is not a full path a reader can paste into git show" % c)

    if f["snippet"]:
        if not os.path.exists(os.path.join(SNIP_DIR, f["snippet"])):
            bad("snippet %s is not on disk" % f["snippet"])
        if f["lane"] and not f["snippet"].lower().startswith(f["lane"].lower() + "-"):
            bad("snippet %s does not start with the finding's lane (%s)"
                % (f["snippet"], f["lane"]))
        if not f["accounts"]:
            bad("a snippet but no accounts — the bench would not know what to launch")
    if f["lane"] and not re.fullmatch(r"[A-J]", f["lane"]):
        bad("lane %r is not a single letter A-J" % f["lane"])


def check_run(run, errs):
    where = run["path"]
    if not run["heading"]:
        errs.append("%s: no '# ' heading" % where)
    for k in ("date", "lane", "area", "build", "sha"):
        if not run.get(k):
            errs.append("%s: missing %s" % (where, k))
    if not run["items"]:
        errs.append("%s: lists no findings" % where)


def main(argv):
    paths = [os.path.abspath(a) for a in argv if not a.startswith("-")]
    errs = []
    if paths:
        for p in paths:
            try:
                if "/runs/" in p:
                    check_run(load_run(p), errs)
                else:
                    check_finding(load_finding(p), errs)
            except SourceError as e:
                errs.append(str(e))
        n_f, n_r = len([p for p in paths if "/runs/" not in p]), len([p for p in paths if "/runs/" in p])
    else:
        try:
            index = load_findings(status=None)
        except SourceError as e:
            print("  %s" % e)
            return 1
        for f in index.values():
            check_finding(f, errs)
        runs = []
        rd = os.path.join(REPO, "reports", "runs")
        for n in sorted(os.listdir(rd)) if os.path.isdir(rd) else []:
            if not n.endswith(".md"):
                continue
            try:
                runs.append(load_run(os.path.join(rd, n)))
            except SourceError as e:
                errs.append(str(e))
        for r in runs:
            check_run(r, errs)
        n_f, n_r = len(index), len(runs)

    print("\n  %d finding(s), %d run(s) checked" % (n_f, n_r))
    if errs:
        for e in errs:
            print("  FAIL  %s" % e)
        print("\n  %d problem(s)" % len(errs))
        return 1
    print("  ALL CHECKS PASS")
    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
