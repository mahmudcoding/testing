#!/usr/bin/env python3
"""Check that every repro block in a report is real and honours the contract.

    python3 scripts/check_repro.py            # all reports the bench reads
    python3 scripts/check_repro.py <file>...  # specific reports

A block is only worth anything if a person can press Reproduce and land on the
defect. That fails silently in three ways this catches:

  * the block names a snippet that is not in snip/            -> the app skips it
  * the snippet never sets ready, so the bench cannot tell whether it arrived
  * the snippet never calls progress(), so the steps sit inert during the run

It does not run anything. A snippet that passes here can still land on the wrong
screen; only running it proves that, which is the author's job.
"""
import os, re, sys

REPO = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, os.path.join(REPO, "scripts"))
from findings import (SNIP_DIR as SNIP, SourceError, is_run_path,  # noqa: E402
                      load_findings, load_run, publish_blockers)


def blocks(only=None):
    """(id, title, repro) for every finding, from the source. No HTML anywhere.

    This used to re-implement bench.py's regex over report HTML, with an index
    into a differently-filtered split -- so a stray <h2 shifted every block onto
    the wrong finding. A repro is a field on its finding now; the pairing cannot
    come apart.
    """
    out = []
    # Every status, not just published: a withdrawn finding is still a real file
    # on disk, and scoping the tool to one used to hard-fail as "nothing matched".
    for f in sorted(load_findings(status=None).values(), key=lambda x: x["id"]):
        if only and f["id"] not in only and f["path"] not in only:
            continue
        out.append((f["id"], f["title"][:70], f["repro"]))
    return out


def check_snippet(name):
    """Static problems that make a snippet useless to the bench."""
    p = os.path.join(SNIP, name)
    if not os.path.exists(p):
        return ["not in snip/"]
    src = open(p, encoding="utf-8").read()
    bad = []
    if "export default" not in src:
        bad.append("no default export")
    # any ready assignment that is not literally `false` counts: snippets
    # legitimately compute it (`ready: ok`), and demanding the literal `true`
    # flagged contract-correct scripts
    if not re.search(r"\bready\b\s*[:=]\s*(?!false\b)\S", src):
        bad.append("never assigns ready anything but false — the bench cannot tell it arrived")
    if "leftToDo" not in src:
        bad.append("no leftToDo — nothing tells the person what to do")
    if "asserted" not in src:
        bad.append("no asserted — the state it reached is unproven")
    if "progress(" not in src:
        bad.append("never calls progress() — steps stay inert during the run")
    if "stepsDone" not in src:
        bad.append("no stepsDone — nothing gets ticked off")
    return bad


def main(argv):
    # Honour the arguments the docstring advertises. Ignoring them printed
    # full-corpus output to someone who thought they had scoped the run to one
    # file, which reads as a clean result for findings they never asked about.
    only, unchecked = set(), 0
    for a in argv:
        if a.startswith("-"):
            continue
        # A run expands to the findings it publishes. Since the source-format
        # change the report-shaped file IS the run, so pointing the tool at one
        # is the natural scoped invocation and used to exit 1 as "nothing
        # matched".
        if is_run_path(a):
            try:
                run = load_run(os.path.abspath(a))
                only.update(f["id"] for f in run["items"])
                # Say what the run lists but cannot be checked, rather than
                # quietly reporting a pass over the remainder.
                why = publish_blockers(run)
                for w in why:
                    print("  note  %s %s — not checked" % (os.path.basename(a), w))
                if why:
                    # Count runs, not blocker strings: "has no findings to
                    # publish" is a reason, not a finding, so counting strings
                    # reported "1 listed finding(s)" for a run listing none.
                    unchecked += 1
            except (SourceError, OSError) as e:
                print("\n  %s" % e)
                return 1
            continue
        only.add(a)
        only.add(os.path.splitext(os.path.basename(a))[0])
        only.add(os.path.relpath(os.path.abspath(a), REPO))
    # `scoped` distinguishes "no arguments" from "arguments that matched nothing".
    # Collapsing them with `only or None` made an argument resolving to zero ids --
    # a run whose findings are all withdrawn -- fall back to the whole corpus and
    # report ALL BLOCKS OK, which is a pass the tool never performed.
    scoped = any(not a.startswith("-") for a in argv)
    if scoped and not only:
        print("\n  nothing to check: %s names no published finding"
              % ", ".join(sorted(a for a in argv if not a.startswith("-"))))
        return 1
    rows = blocks(only if scoped else None)
    if scoped and not rows:
        print("\n  nothing matched: %s" % ", ".join(sorted(a for a in argv if not a.startswith("-"))))
        return 1
    named = [(i, t, a) for i, t, a in rows if a]
    problems = 0
    print("\n  %d of %d findings carry a runnable block\n" % (len(named), len(rows)))
    for fid, title, a in named:
        name, lane = a.get("snippet", ""), a.get("lane", "")
        errs = check_snippet(name) if name else ["no snippet named"]
        if name and lane and not name.lower().startswith(lane.lower() + "-"):
            errs.append("snippet name does not start with the finding's lane (%s)" % lane)
        if not a.get("accounts"):
            errs.append("no accounts")
        if errs:
            problems += len(errs)
            print("  FAIL  %s  — %s" % (name or "(none)", title))
            for e in errs:
                print("          %s" % e)
    for fid, t, a in rows:
        if not a:
            print("  none  %-34s %s" % (fid, t))
    # Green means "everything you asked about was checked". A run listing an
    # unpublishable finding was reported above and then passed anyway, so the
    # note was above the fold and the verdict below it disagreed.
    if problems:
        print("\nPROBLEMS: %d" % problems)
    elif unchecked:
        print("\nBLOCKS OK, but %d run(s) could not be fully checked (see notes)"
              % unchecked)
    else:
        print("\nALL BLOCKS OK")
    return 1 if problems or unchecked else 0


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
