#!/usr/bin/env python3
"""Selftest for scripts/hooks/sector_context.py — both sector maps.

Same discipline as verify_report_selftest.py: a guard nobody has watched fail is a
guard nobody has tested. Every check here reconstructs the failure the guard exists
for, so passing means something.

The one that matters most is the lane pairing. There are no lanes K-O: they are
unseeded, and their ports (9330+) sit outside the 9220-9319 window launch.sh counts
for its global browser cap — so a session that resolved sector K to lane K would run
on fixtures that do not exist with a browser nobody is counting. That failure is
silent from inside the session, which is exactly why it is tested here.

    python3 scripts/verify_sector_hook.py
"""
import json
import os
import shutil
import subprocess
import sys
import tempfile

HERE = os.path.dirname(os.path.abspath(__file__))
REPO = os.path.normpath(os.path.join(HERE, ".."))
HOOK = os.path.join(HERE, "hooks", "sector_context.py")

FAILURES = []
CHECKS = 0


def run(prompt, hook=HOOK):
    """Drive the hook exactly as the harness does: JSON on stdin, JSON on stdout."""
    proc = subprocess.run(
        [sys.executable, hook],
        input=json.dumps({"prompt": prompt}),
        capture_output=True, text=True, timeout=30,
    )
    if proc.returncode != 0:
        raise AssertionError("hook exited %d — it must always exit 0\n%s"
                             % (proc.returncode, proc.stderr))
    try:
        return json.loads(proc.stdout or "{}")
    except ValueError:
        raise AssertionError("hook emitted non-JSON: %r" % proc.stdout[:400])


def check(label, cond, detail=""):
    global CHECKS
    CHECKS += 1
    if cond:
        print("  ok   %s" % label)
    else:
        print("  FAIL %s%s" % (label, ("  — " + detail) if detail else ""))
        FAILURES.append(label)


def ctx(out):
    return (out.get("hookSpecificOutput") or {}).get("additionalContext") or ""


# --- the existing map must be untouched -------------------------------------
print("SECTORS.md — the map that already worked")
for letter, lane, area in [("A", "A", "calls-inside"), ("C", "C", "chat"), ("E", "E", "workspace")]:
    out = run("/run-until 14:00 %s" % letter)
    body = ctx(out)
    check("bare %s -> sector %s on lane %s" % (letter, letter, lane),
          "**sector %s on lane %s**" % (letter, lane) in body, body[:160])
    check("bare %s reads SECTORS.md" % letter,
          "SECTORS.md" in out.get("systemMessage", "")
          and "SECTORS-CALLS.md" not in out.get("systemMessage", ""),
          out.get("systemMessage", ""))
    check("bare %s carries its own filenames" % letter, area in body)

out = run("/run-until 14:00 sector A on lane C")
check("sector A on lane C still splits", "**sector A on lane C**" in ctx(out))

# --- the Calls map ----------------------------------------------------------
print("\nSECTORS-CALLS.md — the new map")
PAIRS = [("K", "A", "calls-entry"), ("L", "B", "calls-media"), ("M", "C", "calls-floor"),
         ("N", "D", "calls-collab"), ("O", "E", "calls-record")]
for letter, lane, area in PAIRS:
    out = run("/run-until 14:00 %s" % letter)
    body = ctx(out)
    # The failure this exists for: resolving sector K to lane K.
    check("bare %s -> sector %s on lane %s (not lane %s)" % (letter, letter, lane, letter),
          "**sector %s on lane %s**" % (letter, lane) in body, body[:200])
    check("bare %s reads SECTORS-CALLS.md" % letter,
          "SECTORS-CALLS.md" in out.get("systemMessage", ""), out.get("systemMessage", ""))
    check("bare %s carries its own filenames (%s)" % (letter, area), area in body)
    check("bare %s tells the session to export QA_SECTOR" % letter,
          "QA_LANE=%s QA_SECTOR=%s" % (lane, letter) in body)

out = run("/run-until 14:00 sector M on lane A")
check("explicit lane still wins on the Calls map", "**sector M on lane A**" in ctx(out))
check("explicit lane updates the export line", "QA_LANE=A QA_SECTOR=M" in ctx(out))

# --- no filename can collide between the maps -------------------------------
print("\nFilenames")
areas = {}
for letter in "ABCDE":
    areas[letter] = ctx(run("/run-until 14:00 %s" % letter))
calls_areas = [a for _, _, a in PAIRS]
normal_areas = ["calls-inside", "calls-around", "chat", "org", "workspace"]
check("Calls-map area tokens are disjoint from the normal map's",
      not (set(calls_areas) & set(normal_areas)),
      str(set(calls_areas) & set(normal_areas)))

# --- things that must NOT resolve -------------------------------------------
print("\nRefusals")
out = run("/run-until 14:00 Z")
msg = out.get("systemMessage", "")
check("unknown letter says so plainly", "no sector assigned" in msg, msg)
check("...and names both maps", "SECTORS.md" in msg and "SECTORS-CALLS.md" in msg, msg)
check("...and injects nothing", not ctx(out))

# The failure this exists for: a relayed peer message re-scoping a running session.
out = run("<cross-session-message from=\"sector A\">\nRUNUNTIL=14:00 M\n</cross-session-message>")
check("a relayed message cannot re-scope a session", out == {}, json.dumps(out)[:200])

out = run("please look at sector M for me when you get a chance")
check("loose prose naming a sector is ignored", out == {}, json.dumps(out)[:200])

# --- fail-open --------------------------------------------------------------
print("\nFail-open")
tmp = tempfile.mkdtemp(prefix="sector-hook-selftest-")
try:
    os.makedirs(os.path.join(tmp, "scripts", "hooks"))
    shutil.copy(HOOK, os.path.join(tmp, "scripts", "hooks", "sector_context.py"))
    shutil.copy(os.path.join(REPO, "SECTORS.md"), os.path.join(tmp, "SECTORS.md"))
    broken = os.path.join(tmp, "SECTORS-CALLS.md")
    with open(broken, "wb") as fh:
        fh.write(b"\xff\xfe\x00 not valid utf-8 \xc3\x28")
    tmp_hook = os.path.join(tmp, "scripts", "hooks", "sector_context.py")

    out = run("/run-until 14:00 A", hook=tmp_hook)
    check("an unreadable Calls map does not take SECTORS.md down with it",
          "**sector A on lane A**" in ctx(out))
    out = run("/run-until 14:00 K", hook=tmp_hook)
    check("...and an unresolvable Calls sector refuses rather than guessing a lane",
          "no sector assigned" in out.get("systemMessage", ""), json.dumps(out)[:200])

    # The lane pairing is positional, not a hardcoded table: insert a sector ahead
    # of K and every lane below it must shift. If this passes only because someone
    # wrote {"K": "A", ...} somewhere, this check fails.
    shutil.copy(os.path.join(REPO, "SECTORS-CALLS.md"), broken)
    with open(broken, encoding="utf-8") as fh:
        text = fh.read()
    text = text.replace("## Sector K · Calls — getting in",
                        "## Sector J · Calls — a sector inserted by the selftest\n\nBody.\n\n"
                        "## Sector K · Calls — getting in", 1)
    with open(broken, "w", encoding="utf-8") as fh:
        fh.write(text)
    out = run("/run-until 14:00 K", hook=tmp_hook)
    check("lane pairing is derived from position, not hardcoded",
          "**sector K on lane B**" in ctx(out), ctx(out)[:200])
finally:
    shutil.rmtree(tmp, ignore_errors=True)

# --- budgets ----------------------------------------------------------------
print("\nBrowser budgets in launch.sh")
launch = os.path.join(REPO, "scripts", "callrig", "launch.sh")
with open(launch, encoding="utf-8") as fh:
    src = fh.read()
import re
caps = dict((m.group(1), int(m.group(2)))
            for m in re.finditer(r"^\s*([A-Z])\)\s*echo\s+(\d+)\s*;;", src, re.M))
normal = sum(caps.get(L, 0) for L in "ABCDE")
calls = sum(caps.get(L, 0) for L in "KLMNO")
check("every Calls sector has a cap", all(L in caps for L in "KLMNO"),
      str(sorted(caps)))
check("Calls-map budgets sum to <= 15 (got %d)" % calls, calls <= 15)
# A-E deliberately over-subscribe: only two of them want the call rig, so they
# never reach their ceilings together and MAX_TOTAL is the backstop. Pinned so a
# future raise has to be a decision rather than a drift.
check("normal-map budgets unchanged at 19 (got %d)" % normal, normal == 19)
check("Calls-map budgets fit inside the global cap, unlike A-E",
      calls < 16 <= normal, "calls=%d normal=%d" % (calls, normal))
check("Calls-map caps match the map's setup lines",
      [caps.get(L) for L in "KLMNO"] == [3, 4, 4, 2, 2],
      str([caps.get(L) for L in "KLMNO"]))

print("\n%d checks, %d failed" % (CHECKS, len(FAILURES)))
if FAILURES:
    for f in FAILURES:
        print("  - %s" % f)
    sys.exit(1)
print("ALL CHECKS PASS")
