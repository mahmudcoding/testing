#!/usr/bin/env python3
"""Run every repro snippet a report names, and report which actually arrive.

    python3 scripts/verify_snippets.py D        # one lane
    python3 scripts/verify_snippets.py A B C    # several

check_repro.py is static: it proves a snippet exists and mentions the right
things. It cannot tell you the snippet reaches the screen the finding is about.
Only running it can, so this runs each one against a live browser, driven by the
account its own block names, and reports:

    ready     did it get there and say so
    steps     stepsDone it claims
    marks     @@STEP markers it emitted -- the app ticks steps off these, so a
              snippet claiming steps while emitting none shows an inert list

A ready:false is not automatically a bug in the snippet. Refusing when the state
is wrong is the contract working; the fault is only real if it refuses when
driven by the account its block names, from a clean lane.
"""
import os, re, subprocess, sys

REPO = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, os.path.join(REPO, "scripts"))
import bench

REPORT = {r[0]: os.path.join(REPO, r[2]) for r in bench.REPORTS}


def blocks(lane):
    """[(snippet, driver_account)] in document order."""
    src = open(REPORT[lane], encoding="utf-8").read()
    out = []
    for attrs in re.findall(r'<div class="block repro"([^>]*)>', src, re.S):
        d = dict(re.findall(r'data-([a-z]+)="([^"]*)"', attrs))
        snip = d.get("snippet", "")
        acct = (d.get("accounts", "alice").split(",")[0] or "alice").strip()
        if snip:
            out.append((snip, acct))
    return out


def sh(cmd, **kw):
    return subprocess.run(cmd, cwd=REPO, text=True, capture_output=True,
                          stdin=subprocess.DEVNULL, **kw)


def verify(lane):
    rows = blocks(lane)
    if not rows:
        print(f"lane {lane}: no blocks yet")
        return []
    accts = sorted({a for _, a in rows})
    env = dict(os.environ, QA_LANE=lane)
    print(f"lane {lane}: {len(rows)} snippets, accounts {' '.join(accts)}")
    for a in accts:                       # launch is a no-op if it is already up
        sh(["./scripts/callrig/launch.sh", lane, a], env=env)
    sh(["./scripts/callrig/ensure.sh", lane] + accts, env=env)

    results = []
    for snip, acct in rows:
        p = sh(["./scripts/callrig/d", f"{lane.lower()}:{acct}", f"snip/{snip}"], env=env)
        out = p.stdout + p.stderr
        m = re.search(r'"ready"\s*:\s*(true|false)', out)
        ready = m.group(1) if m else "no-json"
        st = re.search(r'"stepsDone"\s*:\s*(\d+)', out)
        marks = out.count("@@STEP")
        results.append((snip, acct, ready, st.group(1) if st else "?", marks))
        flag = "   " if ready == "true" else "!! "
        print(f"  {flag}{snip:<30} {acct:<9} ready={ready:<7} steps={st.group(1) if st else '?':<3} marks={marks}")
    return results


def main(lanes):
    allr = []
    for lane in lanes:
        allr += verify(lane.upper())
    ok = [r for r in allr if r[2] == "true"]
    bad = [r for r in allr if r[2] != "true"]
    # a snippet that claims steps but emits no markers leaves the list inert
    inert = [r for r in ok if r[3] not in ("?", "0") and r[4] == 0]
    mismatch = [r for r in ok if r[3] not in ("?",) and r[4] and int(r[3]) != r[4]]
    print(f"\n{len(ok)}/{len(allr)} reach their screen")
    if inert:
        print("claims steps but emits no @@STEP (steps sit inert during the run):")
        for r in inert:
            print(f"  {r[0]}")
    if mismatch:
        print("stepsDone disagrees with markers emitted (live tick and final count differ):")
        for r in mismatch:
            print(f"  {r[0]}  stepsDone={r[3]} marks={r[4]}")
    if bad:
        print("did NOT reach their screen:")
        for r in bad:
            print(f"  {r[0]}  (as {r[1]})  -> {r[2]}")
    return 1 if bad else 0


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:] or ["A", "B", "C", "D", "E"]))
