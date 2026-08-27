#!/usr/bin/env python3
"""UserPromptSubmit hook: expand a bare sector letter into its actual scope.

`/run-until 14:00 A` carries one character of meaning. This reads SECTORS.md and
puts that sector's section straight into the session's context, so the scope does
not depend on CLAUDE.md being loaded, read and correctly decoded.

Silent unless the prompt actually names a sector. Fails open, always.
"""
import json
import os
import re
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
SECTORS = os.path.normpath(os.path.join(HERE, "..", "..", "SECTORS.md"))

# Only an actual invocation counts, same reasoning as the run-until hook: match
# the expanded command body or an explicit "sector X", never loose prose.
ARM_TOKEN = re.compile(r"^\s*RUNUNTIL\s*=\s*(.*)$", re.M)
ARM_SLASH = re.compile(r"^\s*(?:/[\w-]+\s+)?/run[-_]?until\b[ \t]*(.*)$", re.I)
# Anchored to the start of the prompt, where a real invocation appears. Unanchored,
# this fired on a relayed peer message that merely mentioned another sector — which
# would hand a running session the wrong scope mid-run.
SECTOR_WORD = re.compile(r"^\s*(?:/[\w-]+\s+)?(?:QA\s+)?sector\s+([A-Za-z])\b", re.I)
# Relayed peer messages are quoted verbatim and can contain anything, RUNUNTIL= included.
RELAY = re.compile(r"<cross-session-message", re.I)
LANE_WORD = re.compile(r"\blane\s+([A-Za-z])\b", re.I)
TRAILING_LETTER = re.compile(r"\b([A-Za-z])\s*$")


def emit(obj):
    print(json.dumps(obj))
    sys.exit(0)


def find_invocation(prompt):
    if RELAY.search(prompt):
        return None
    m = ARM_TOKEN.search(prompt)
    if m:
        return m.group(1).strip()
    m = ARM_SLASH.match(prompt)
    if m:
        return m.group(1).strip()
    if SECTOR_WORD.match(prompt):
        return prompt.strip()
    return None


def sectors_available():
    """Letters that actually have a section, e.g. "A-E" or "A, C, E"."""
    if not os.path.exists(SECTORS):
        return ""
    with open(SECTORS, encoding="utf-8") as fh:
        found = sorted(set(re.findall(r"^## Sector ([A-Za-z])\b", fh.read(), re.M)))
    if not found:
        return ""
    contiguous = all(ord(b) - ord(a) == 1 for a, b in zip(found, found[1:]))
    return "%s-%s" % (found[0], found[-1]) if contiguous and len(found) > 2 else ", ".join(found)


def read_files_row(letter):
    """The sector's row from the "Files each session writes" table, if there is one.

    Lives in a shared section, so injecting the sector's own section alone leaves a
    session to invent its own filename — which is exactly what the table exists to stop.
    """
    if not os.path.exists(SECTORS):
        return None
    with open(SECTORS, encoding="utf-8") as fh:
        text = fh.read()
    m = re.search(r"^\|\s*%s\s*\|([^|]+)\|([^|]+)\|" % re.escape(letter), text, re.M)
    if not m:
        return None
    return m.group(1).strip(), m.group(2).strip()


def read_sector(letter):
    if not os.path.exists(SECTORS):
        return None
    with open(SECTORS, encoding="utf-8") as fh:
        text = fh.read()
    pat = re.compile(r"^## Sector %s\b.*?(?=^## |\Z)" % re.escape(letter), re.M | re.S)
    m = pat.search(text)
    return m.group(0).rstrip() if m else None


def main():
    data = json.load(sys.stdin)
    prompt = data.get("prompt") or ""

    value = find_invocation(prompt)
    if value is None:
        emit({})

    m = re.search(r"\bsector\s+([A-Za-z])\b", value, re.I)
    if m:
        sector = m.group(1).upper()
    else:
        m2 = TRAILING_LETTER.search(value)
        if not m2:
            emit({})
        sector = m2.group(1).upper()

    lm = LANE_WORD.search(value)
    lane = lm.group(1).upper() if lm else sector

    body = read_sector(sector)
    if not body:
        # Lanes run past the sectors: only some letters have a scope assigned, the rest
        # are free lanes for other work. Say so plainly instead of reading like an error.
        emit({"systemMessage":
              "lane %s has no sector assigned (SECTORS.md defines %s). "
              "Fine for non-sector work; check the letter if you meant a QA sector."
              % (sector, sectors_available() or "none")})

    framing = (
        "**The bullets below are the sector's territory, not a list of things to test.** They "
        "mark where your sector ends and another begins. They are not exhaustive and not a "
        "regression checklist: anything a user can reach inside that territory is yours, "
        "including surfaces not named. Working down the list is the wrong shape of pass — pick "
        "targets the way SECTORS.md describes under \"Choosing what to hit inside your sector\", "
        "and go where coverage is thin.")

    header = "Read as **sector %s on lane %s**." % (sector, lane)
    if lane != sector:
        header += (" These differ, which is deliberate: test sector %s's scope while running on "
                   "lane %s's fixtures and ports." % (sector, lane))
    files = read_files_row(sector)
    files_note = ""
    if files:
        log, report = files
        files_note = ("\n\n**Write your files under these exact names** — they are fixed per sector so "
                      "parallel sessions never collide or drift apart:\n"
                      "- session log: %s\n- report source: %s\n"
                      "with `<date>` today and `<lane>` = %s." % (log, report, lane))

    note = ("\n\nThis is the sector's own section of SECTORS.md. Read the rest of that file for the "
            "shared parts — how to choose targets within the sector, and what to do if it runs dry.")

    emit({
        "hookSpecificOutput": {
            "hookEventName": "UserPromptSubmit",
            "additionalContext": header + "\n\n" + framing + "\n\n" + body + files_note + note,
        },
        "systemMessage": "sector %s on lane %s — scope loaded from SECTORS.md" % (sector, lane),
    })


if __name__ == "__main__":
    try:
        main()
    except Exception as exc:
        # A broken hook must never wedge a session.
        print(json.dumps({"systemMessage": "sector-context hook error: %s" % exc}))
    sys.exit(0)
