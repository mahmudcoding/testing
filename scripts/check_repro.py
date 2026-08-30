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
SNIP = os.path.join(REPO, "scripts", "callrig", "snip")
sys.path.insert(0, os.path.join(REPO, "scripts"))
from findings import load_findings  # noqa: E402


def blocks(_unused=None):
    """(id, title, repro) for every finding, from the source. No HTML anywhere.

    This used to re-implement bench.py's regex over report HTML, with an index
    into a differently-filtered split -- so a stray <h2 shifted every block onto
    the wrong finding. A repro is a field on its finding now; the pairing cannot
    come apart.
    """
    out = []
    for f in sorted(load_findings().values(), key=lambda x: x["id"]):
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
    rows = blocks()
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
    print("\nPROBLEMS: %d" % problems if problems else "\nALL BLOCKS OK")
    return 1 if problems else 0


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
