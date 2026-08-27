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


def blocks(path):
    """(index, attrs) for every repro block, in document order."""
    src = open(path, encoding="utf-8").read()
    out = []
    for i, part in enumerate(re.split(r"(?=<h2)", src)):
        if "<h2" not in part:
            continue
        m = re.search(r'<div class="block repro"([^>]*)>', part)
        title = re.sub(r"<[^>]+>", "", re.search(r"<h2[^>]*>(.*?)</h2>", part, re.S).group(1)
                       if re.search(r"<h2[^>]*>(.*?)</h2>", part, re.S) else "")
        attrs = dict(re.findall(r'data-([a-z]+)="([^"]*)"', m.group(1))) if m else None
        out.append((i, " ".join(title.split())[:70], attrs))
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
    if not re.search(r"\bready\s*[:=]\s*true", src) and "out.ready = true" not in src:
        bad.append("never sets ready:true — the bench cannot tell it arrived")
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
    if argv:
        reports = [os.path.abspath(a) for a in argv]
    else:
        import bench
        reports = [os.path.join(REPO, r[2]) for r in bench.REPORTS]

    problems = total = withblock = 0
    for path in reports:
        if not os.path.exists(path):
            print(f"MISSING  {path}")
            problems += 1
            continue
        rows = blocks(path)
        named = [(t, a) for _, t, a in rows if a]
        total += len(rows)
        withblock += len(named)
        print(f"\n{os.path.relpath(path, REPO)}  —  {len(named)}/{len(rows)} findings have a block")
        for title, a in named:
            name = a.get("snippet", "")
            lane = a.get("lane", "")
            errs = check_snippet(name) if name else ["block has no data-snippet"]
            if name and lane and not name.lower().startswith(lane.lower() + "-"):
                errs.append(f"name does not start with the lane ({lane})")
            if not a.get("accounts"):
                errs.append("no data-accounts")
            if errs:
                problems += len(errs)
                print(f"  FAIL  {name or '(none)'}  — {title}")
                for e in errs:
                    print(f"          {e}")
        for _, t, a in rows:
            if not a:
                print(f"  none  {t}")

    print(f"\n{withblock} of {total} findings carry a runnable block")
    print("PROBLEMS: %d" % problems if problems else "ALL BLOCKS OK")
    return 1 if problems else 0


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
