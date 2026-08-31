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
from findings import (FIELDS_KNOWN, FIELDS_REQUIRED, REPO, REQUIRED_SECTIONS,  # noqa: E402
                      RUNS_DIR, SEVERITIES, SIDES, SNIP_DIR, STATUSES, SURFACES,
                      SourceError, load_finding, load_findings, load_run, plain)

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

    scan_text(f["raw"], where, errs)   # load_finding already read the file

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


def scan_text(text, where, errs):
    """Leak and citation rules. Applies to anything that reaches a reader.

    Run prose used to escape this: the checks lived inside check_finding, while
    a run's heading, lede and extra sections are rendered into the published
    header verbatim.
    """
    for pat in LEAKS:
        for m in set(re.findall(pat, text)):
            errs.append("%s: leaked test-setup name: %r"
                        % (where, m if isinstance(m, str) else m[0]))
    for c in sorted(set(CITATION.findall(text))):
        if not c.startswith(("apps/", "packages/", "platform/")):
            errs.append("%s: citation %r is not a full path a reader can paste "
                        "into git show" % (where, c))


def check_run(run, errs):
    where = run["path"]
    with open(os.path.join(REPO, where), encoding="utf-8") as fh:
        scan_text(fh.read(), where, errs)
    for d in run.get("dropped") or []:
        errs.append("%s: lists %s, which is not published — remove it from "
                    "`findings:` or republish it" % (where, d))
    if not run["heading"]:
        errs.append("%s: no '# ' heading" % where)
    for k in ("date", "lane", "area", "build", "sha"):
        if not run.get(k):
            errs.append("%s: missing %s" % (where, k))
    if not run["items"]:
        errs.append("%s: lists no findings" % where)


def check_corpus(index, errs):
    """Rules about the set of findings, which no per-file check can see.

    Two findings sharing a title render two identical <h2>s and two identical
    summary rows. Generating both views from one list stops them drifting apart;
    it does not stop them being duplicates in the first place, and a
    find-and-replace that overwrote one published finding with a copy of another
    is exactly how that has gone wrong before.
    """
    by_title, by_prefix = {}, {}
    for f in sorted(index.values(), key=lambda x: x["id"]):
        t = " ".join(f["title"].split())
        if t in by_title:
            errs.append("%s: same title as %s" % (f["path"], by_title[t]))
        by_title[t] = f["path"]
        pre = t[:30].lower()
        if len(pre) == 30 and pre in by_prefix:
            errs.append("%s: first 30 characters of the title match %s — too "
                        "close to tell apart in a summary row"
                        % (f["path"], by_prefix[pre]))
        by_prefix[pre] = f["path"]


def main(argv):
    paths = [os.path.abspath(a) for a in argv if not a.startswith("-")]
    errs = []
    if paths:
        # The corpus rules are a property of the pair, so they need every
        # published finding even when the invocation names one file. Scoping them
        # to the argument let "check the finding I just wrote" pass a duplicate
        # that only a full run would catch. One index, built once and reused for
        # both the corpus rules and every run resolution below.
        try:
            known = load_findings(status=None)
        except SourceError as e:
            errs.append(str(e))
            known = {}
        pub = {k: v for k, v in known.items() if v["status"] == "published"}
        check_corpus(pub, errs)
        for p in paths:
            try:
                if "/runs/" in p.replace(os.sep, "/"):
                    check_run(load_run(p, pub, known), errs)
                else:
                    check_finding(known.get(
                        os.path.splitext(os.path.basename(p))[0]) or load_finding(p), errs)
            except (SourceError, OSError) as e:
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
        # One published index for every run. Without it each run rebuilt the
        # whole index from disk: M + N*M parses instead of M + N.
        pub = {k: v for k, v in index.items() if v["status"] == "published"}
        # Published only: a withdrawn or duplicate finding never reaches a
        # rendered report, so sharing a title with one is not a collision. Over
        # the whole index this made `status: duplicate` -- which the schema
        # documents -- fail validation with an error nobody could resolve.
        check_corpus(pub, errs)
        runs = []
        for name in sorted(os.listdir(RUNS_DIR)) if os.path.isdir(RUNS_DIR) else []:
            if not name.endswith(".md"):
                continue
            try:
                runs.append(load_run(os.path.join(RUNS_DIR, name), pub, index))
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
