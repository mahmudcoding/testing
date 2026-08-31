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
                      RUNS_DIR, SEVERITIES, SIDES, SNIP_DIR, STATUSES, SURFACES, is_run_path,
                      SourceError, UnreadableSource, load_finding, load_findings, load_run, plain,
                      publish_blockers)

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
REPO_PREFIX = REPO + os.sep   # trimmed from messages: nobody typed it
BUDGET = 180          # words over Проблема + Фактический результат + Ожидаемый результат


def check_finding(f, errs, shown=None):
    # `shown` is the path the caller typed. f["path"] is relative to REPO, which
    # for an argument outside the tree renders as ../../../.. -- a path the user
    # never typed and cannot paste back.
    where = shown or f["path"]

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


def check_run(run, errs, shown=None):
    """Validate a run. Publishability comes from findings.publish_blockers.

    This was the last consumer still spelling those conditions itself -- and the
    one publish_blockers' own docstring names ("the validator errors"). A new
    blocker would have been honoured by the renderer, the bench, check_repro and
    verify_run, and silently ignored here.
    """
    # Same rule as check_finding: read what was named. run["path"] is relative to
    # REPO, and re-joining a "../.." relpath resolves against the real parent
    # rather than the lexical one, so an out-of-tree run under a symlinked root
    # raised FileNotFoundError against a path the user never typed.
    where = shown or run["path"]
    scan_text(run["raw"], where, errs)   # load_run already read the file
    for why in publish_blockers(run):
        errs.append("%s: %s" % (where, why))
    if not run["heading"]:
        errs.append("%s: no '# ' heading" % where)
    for k in ("date", "lane", "area", "build", "sha"):
        if not run.get(k):
            errs.append("%s: missing %s" % (where, k))


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
    # As typed. `shown` echoes the caller's own words back in every message, and
    # absolutising here made that a 126-character temp prefix in the selftest --
    # which, at the width the diagnostic prints, truncated to the directory name
    # and blinded the output that catches a case rejected by the wrong check.
    # Resolution is unaffected: every consumer below absolutises what it needs.
    paths = [a for a in argv if not a.startswith("-")]
    errs, unreadable = [], []
    checked_f = checked_r = 0
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
                if is_run_path(p):
                    check_run(load_run(p, pub, known), errs, shown=p)
                    checked_r += 1
                else:
                    # Always load the named file. Reusing the index entry by
                    # basename validated a DIFFERENT file whenever the argument
                    # lived outside reports/findings -- a corrupted copy passed
                    # because a repo finding of the same name was clean.
                    check_finding(load_finding(p), errs, shown=p)
                    checked_f += 1
            except (OSError, UnreadableSource) as e:
                # "I could not read this" is a different answer from "this file
                # is wrong", and the exit code says which -- see the convention
                # at the end of main(). A missing file and one that will not
                # parse are the same answer: nothing was checked.
                unreadable.append(str(e))
            except SourceError as e:
                errs.append(str(e))
        # Counted where the check succeeded, not where the path was routed.
        # Counting named paths meant a file that could not be read still counted
        # as checked, so "nothing was checked" was never true and the exit code
        # said 1 for a run that never loaded.
        n_f, n_r = checked_f, checked_r
    else:
        try:
            index = load_findings(status=None)
        except SourceError as e:
            print("  %s" % e)
            return 2
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
            except UnreadableSource as e:
                # Same classification as the scoped branch. Labelling this FAIL
                # here and UNREADABLE there described one condition two ways, in
                # one tool, depending only on how it was invoked.
                unreadable.append(str(e).replace(REPO_PREFIX, ""))
            except SourceError as e:
                errs.append(str(e))
        for r in runs:
            check_run(r, errs)
        n_f, n_r = len(index), len(runs)

    # Exit codes, shared by all five tools: 0 nothing wrong, 1 problems found in
    # what was checked, 2 could not run at all. Returning 1 for both left a
    # caller unable to tell a failing report from a mistyped path.
    print("\n  %d finding(s), %d run(s) checked" % (n_f, n_r))
    for e in unreadable:
        print("  UNREADABLE  %s" % e)
    for e in errs:
        print("  FAIL  %s" % e)
    if errs:
        print("\n  %d problem(s)" % len(errs))
        return 1
    if unreadable:
        print("\n  %d path(s) could not be read" % len(unreadable))
        # 2 only when NOTHING could be checked. An unreadable file among others
        # that checked fine is a problem found during a run that happened, which
        # is 1 -- the same answer render_report --all gives for one bad run
        # among several.
        return 2 if n_f + n_r == 0 else 1
    print("  ALL CHECKS PASS")
    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
