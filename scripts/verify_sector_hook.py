#!/usr/bin/env python3
"""Selftest for scripts/hooks/sector_context.py — the nine-sector map.

Same discipline as verify_report_selftest.py: a guard nobody has watched fail is a
guard nobody has tested. Every check here reconstructs the failure the guard exists
for, so passing means something.

The one that matters most is the filenames. `read_files_row` used to search the
whole map for a row keyed on a bare sector letter, and the map holds more than one
such table. `[^|]` matches a newline, so a two-cell row runs into the row below it
and the regex matched the *dedup-targets* table instead — handing a session a list
of other people's reports where it expected its own log and report names. It looked
exactly like a correct answer. The scoping check below rebuilds that trap and proves
it is live before showing the hook survives it.

    python3 scripts/verify_sector_hook.py
"""
import json
import os
import re
import shutil
import subprocess
import sys
import tempfile

HERE = os.path.dirname(os.path.abspath(__file__))
REPO = os.path.normpath(os.path.join(HERE, ".."))
HOOK = os.path.join(HERE, "hooks", "sector_context.py")
sys.path.insert(0, HERE)
from findings import RUNS_DIR  # noqa: E402

# sector -> (lane, area token). Lane letter is the sector letter on this map.
SECTORS = [
    ("A", "calls-lifecycle"), ("B", "calls-room"), ("C", "calls-studio"),
    ("D", "chat-messages"), ("E", "chat-spaces"), ("F", "admin-org"),
    ("G", "identity"), ("H", "shell"), ("I", "calendar-files"),
]
def published_areas():
    """Area tokens already used by a run on disk.

    Read rather than hardcoded: a sector writing under a token that already
    exists lands its report beside an unrelated one. Runs are source files now,
    so the token is read from the `area:` field rather than parsed out of a
    filename.
    """
    out = set()
    rd = RUNS_DIR
    for name in sorted(os.listdir(rd)) if os.path.isdir(rd) else []:
        if not name.endswith(".md"):
            continue
        with open(os.path.join(rd, name), encoding="utf-8") as fh:
            m = re.search(r"^area:\s*(\S+)\s*$", fh.read(), re.M)
        if m:
            out.add(m.group(1))
    return out

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


def files_row(body):
    """(log, report) as the hook actually injected them, or None."""
    m = re.search(r"session log: `([^`]+)`\n- report source: `([^`]+)`", body)
    return (m.group(1), m.group(2)) if m else None


# --- every sector resolves, on its own lane, with its own filenames ----------
print("SECTORS.md — nine sectors, A-I")
for letter, area in SECTORS:
    out = run("/run-until 14:00 %s" % letter)
    body = ctx(out)
    check("bare %s -> sector %s on lane %s" % (letter, letter, letter),
          "**sector %s on lane %s**" % (letter, letter) in body, body[:160])
    check("bare %s reads SECTORS.md" % letter,
          "SECTORS.md" in out.get("systemMessage", ""), out.get("systemMessage", ""))
    row = files_row(body)
    check("bare %s carries its own filenames (%s)" % (letter, area),
          bool(row) and area in row[0] and area in row[1],
          str(row))
    check("bare %s injects a real scope, not just a heading" % letter,
          "**In scope**" in body and len(body) > 1500, "len=%d" % len(body))

# --- filenames cannot collide, with each other or with what is on disk -------
print("\nFilenames")
areas = [a for _, a in SECTORS]
check("the nine area tokens are distinct", len(set(areas)) == 9, str(areas))
# reports/runs/ can legitimately be empty, and an empty set makes the collision
# check below vacuous -- it would pass for any token at all. So prove the scanner
# can see a token before trusting it not to find one: positive control first, the
# real question second. Same discipline as an empty grep needing one.
control = re.search(r"^area:\s*(\S+)\s*$", "date: 2026-09-01\narea: chat-messages\n", re.M)
check("the run scanner can recognise an area token at all",
      bool(control) and control.group(1) == "chat-messages",
      control.group(1) if control else "no match")
on_disk = published_areas()
# A run's area token IS its sector's token -- that is how a session's files are
# named. So the question is not whether they collide (they must match) but
# whether anything on disk was written under a token no sector owns, which is
# how a run ends up invisible to every tool that looks by area.
stray = on_disk - set(areas)
check("every run on disk uses a sector's area token (%d run token(s))" % len(on_disk),
      not stray, "not owned by any sector: %s" % sorted(stray))
logs = set()
reports = set()
for letter, _ in SECTORS:
    row = files_row(ctx(run("/run-until 14:00 %s" % letter)))
    if row:
        logs.add(row[0])
        reports.add(row[1])
check("nine distinct log paths", len(logs) == 9, str(sorted(logs)))
check("nine distinct report paths", len(reports) == 9, str(sorted(reports)))

# --- sector and lane may still be split ---------------------------------------
print("\nSector on a different lane")
out = run("/run-until 14:00 sector G on lane C")
body = ctx(out)
check("sector G on lane C splits", "**sector G on lane C**" in body, body[:200])
check("...and tells the session to export both", "QA_LANE=C QA_SECTOR=G" in body)
check("...and still names sector G's files", "identity" in (files_row(body) or ("",))[0])

# --- things that must NOT resolve --------------------------------------------
print("\nRefusals")
out = run("/run-until 14:00 J")
msg = out.get("systemMessage", "")
check("lane J says 'no sector assigned' plainly", "no sector assigned" in msg, msg)
check("...and names where the sectors are", "A-I in SECTORS.md" in msg, msg)
check("...and injects nothing", not ctx(out))

for letter in "KZ":
    out = run("/run-until 14:00 %s" % letter)
    msg = out.get("systemMessage", "")
    # The failure this exists for: a session handed a letter the map does not define,
    # silently getting no scope and testing whatever it felt like.
    check("undefined letter %s refuses rather than going quiet" % letter,
          "no sector assigned" in msg and "A-I in SECTORS.md" in msg, msg)
    check("...and injects nothing for %s" % letter, not ctx(out))

# The failure this exists for: a relayed peer message re-scoping a running session.
out = run("<cross-session-message from=\"sector A\">\nRUNUNTIL=14:00 F\n</cross-session-message>")
check("a relayed message cannot re-scope a session", out == {}, json.dumps(out)[:200])
out = run("please look at sector F for me when you get a chance")
check("loose prose naming a sector is ignored", out == {}, json.dumps(out)[:200])

# --- the files-row trap, rebuilt --------------------------------------------
print("\nThe files-row trap (the guard watched failing)")
tmp = tempfile.mkdtemp(prefix="sector-hook-selftest-")
try:
    os.makedirs(os.path.join(tmp, "scripts", "hooks"))
    tmp_hook = os.path.join(tmp, "scripts", "hooks", "sector_context.py")
    shutil.copy(HOOK, tmp_hook)
    tmp_map = os.path.join(tmp, "SECTORS.md")

    with open(os.path.join(REPO, "SECTORS.md"), encoding="utf-8") as fh:
        real = fh.read()

    decoy = ("\n## A decoy table the selftest inserted\n\n"
             "| sector | not your filenames |\n|---|---|\n"
             + "".join("| %s | `decoy-%s` |\n" % (L, L) for L, _ in SECTORS)
             + "\n")
    at = real.index("## Files each session writes")
    poisoned = real[:at] + decoy + real[at:]
    with open(tmp_map, "w", encoding="utf-8") as fh:
        fh.write(poisoned)

    # First prove the trap is live: the unscoped regex the hook used to run really
    # does prefer the decoy. A trap that cannot catch anything proves nothing.
    naive = re.search(r"^\|\s*A\s*\|([^|]+)\|([^|]+)\|", poisoned, re.M)
    check("the decoy would fool an unscoped search",
          bool(naive) and "decoy-A" in naive.group(1), naive.group(1) if naive else "no match")

    out = run("/run-until 14:00 A", hook=tmp_hook)
    row = files_row(ctx(out))
    check("the hook reads past it to the real table",
          bool(row) and "calls-lifecycle" in row[0] and "decoy" not in row[0], str(row))

    # --- fail-open ----------------------------------------------------------
    print("\nFail-open")
    with open(tmp_map, "wb") as fh:
        fh.write(b"\xff\xfe\x00 not valid utf-8 \xc3\x28")
    out = run("/run-until 14:00 A", hook=tmp_hook)
    check("an unreadable map does not wedge the session (exit 0, valid JSON)", True)
    check("...and refuses rather than inventing a scope",
          "no sector assigned" in out.get("systemMessage", "") and not ctx(out),
          json.dumps(out)[:200])

    os.remove(tmp_map)
    out = run("/run-until 14:00 A", hook=tmp_hook)
    check("a missing map behaves the same way",
          "no sector assigned" in out.get("systemMessage", ""), json.dumps(out)[:200])

    # The letters are read out of the map, not hardcoded: rename a section and the
    # hook must follow it. If this passes only because someone wrote a table of
    # letters into the hook, it fails.
    with open(tmp_map, "w", encoding="utf-8") as fh:
        fh.write(real.replace("## Sector I · Calendar and files",
                              "## Sector X · Calendar and files", 1))
    out = run("/run-until 14:00 X", hook=tmp_hook)
    check("sector letters come from the map, not from the hook",
          "**sector X on lane X**" in ctx(out), ctx(out)[:160])
    out = run("/run-until 14:00 I", hook=tmp_hook)
    check("...and a letter the map no longer defines stops resolving",
          "no sector assigned" in out.get("systemMessage", ""), json.dumps(out)[:200])
finally:
    shutil.rmtree(tmp, ignore_errors=True)

# --- budgets ----------------------------------------------------------------
print("\nBrowser budgets in launch.sh")
launch = os.path.join(REPO, "scripts", "callrig", "launch.sh")
with open(launch, encoding="utf-8") as fh:
    src = fh.read()


def cap_for(letter):
    """Ask launch.sh's own sector_cap rather than parsing the case statement.

    Parsing the text cannot see a range pattern like [A-I], and would report "no
    cap" for every sector the moment the branches are collapsed -- a failure about
    the checker wearing the costume of a failure about the caps. Running the
    function also covers branch ordering, which no regex can.
    """
    r = subprocess.run(
        ["bash", "-c",
         'eval "$(sed -n "/^sector_cap()/,/^}/p" "$0")"; sector_cap "$1"', launch, letter],
        capture_output=True, text=True, timeout=15)
    return int(r.stdout.strip() or 0)


letters = [L for L, _ in SECTORS]
caps = {L: cap_for(L) for L in letters}
m = re.search(r'MAX_TOTAL="\$\{QA_MAX_BROWSERS:-(\d+)\}"', src)
total = int(m.group(1)) if m else 0

# Positive control: the function must be reachable at all, or every check below
# passes on a uniform zero and says nothing.
check("sector_cap is callable and answers", all(v > 0 for v in caps.values()), str(caps))
check("every sector may hold four browsers", all(v == 4 for v in caps.values()), str(caps))
check("a letter the map does not define gets the free-lane cap, not a sector's",
      cap_for("Z") == 3 and cap_for("J") == 3, "Z=%d J=%d" % (cap_for("Z"), cap_for("J")))

# Three sessions run at once, so the binding number is the worst three, never the
# sum across nine. That is what lets every sector hold four.
worst3 = sum(sorted(caps.values(), reverse=True)[:3])
check("any three sectors at once fit under MAX_TOTAL (%d <= %d)" % (worst3, total),
      worst3 <= total)
check("...with room for the free lane too (%d + 3 <= %d)" % (worst3, total),
      worst3 + 3 <= total)

# The map is where a person reads what a sector may have; the script is what
# enforces it. Compare them rather than hardcoding the number in a third place --
# a constant here would just be one more thing to forget to update.
with open(os.path.join(REPO, "SECTORS.md"), encoding="utf-8") as fh:
    map_src = fh.read()
map_caps = {L: int(v) for L, v in re.findall(
    r"^\|\s*\*\*([A-I])\*\*[^|]*\|[^|]*\|[^|]*\|\s*(\d+)\s*\|", map_src, re.M)}
check("the map states a browser count for all nine sectors",
      sorted(map_caps) == letters, str(sorted(map_caps)))
check("...and launch.sh hands out exactly what the map promises",
      map_caps == caps, "map=%s script=%s" % (map_caps, caps))

print("\n%d checks, %d failed" % (CHECKS, len(FAILURES)))
if FAILURES:
    for f in FAILURES:
        print("  - %s" % f)
    sys.exit(1)
print("ALL CHECKS PASS")
