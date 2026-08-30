#!/usr/bin/env python3
"""UserPromptSubmit hook: expand a bare sector letter into its actual scope.

`/run-until 14:00 G` carries one character of meaning. This reads the sector map
and puts that sector's section straight into the session's context, so the scope
does not depend on CLAUDE.md being loaded, read and correctly decoded.

One map: SECTORS.md, sectors A-I, and the sector letter is the lane letter. Any
other letter reads as "no sector assigned" -- lanes run past the sectors, and a lane
carrying no scope is free for non-sector work rather than an error.

Silent unless the prompt actually names a sector. Fails open, always.
"""
import json
import os
import re
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
REPO = os.path.normpath(os.path.join(HERE, "..", ".."))
SECTORS = os.path.join(REPO, "SECTORS.md")

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
# The heading that opens the shared filename table. read_files_row scopes itself to
# what follows, because the map holds other tables keyed on a bare sector letter and
# an unscoped search matched the first of those instead -- silently handing a session
# a dedup list where it expected its own filenames.
FILES_HEADING = re.compile(r"^## Files each session writes\b", re.M)


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


def read_map():
    try:
        with open(SECTORS, encoding="utf-8") as fh:
            return fh.read()
    except (OSError, UnicodeDecodeError):
        return None


def letters_in(text=None):
    """Sector letters the map defines, in the order they appear in the file."""
    text = read_map() if text is None else text
    if not text:
        return []
    seen, out = set(), []
    for L in re.findall(r"^## Sector ([A-Za-z])\b", text, re.M):
        U = L.upper()
        if U not in seen:
            seen.add(U)
            out.append(U)
    return out


def sectors_available():
    """Every letter that has a section, as a span when they are contiguous."""
    found = letters_in()
    if not found:
        return ""
    contiguous = all(ord(b) - ord(a) == 1 for a, b in zip(found, found[1:]))
    span = ("%s-%s" % (found[0], found[-1])) if contiguous and len(found) > 2 \
        else ", ".join(found)
    return "%s in %s" % (span, os.path.basename(SECTORS))


def read_files_row(letter):
    """The sector's row from the "Files each session writes" table.

    Lives in a shared section, so injecting the sector's own section alone leaves a
    session to invent its own filename — which is exactly what the table exists to stop.

    Scoped to that section on purpose: other tables in the map are keyed on the same
    bare letter, and `[^|]` matches a newline, so an unscoped search will happily run a
    two-cell row into the row below it and return a plausible-looking wrong answer.
    """
    text = read_map()
    if not text:
        return None
    h = FILES_HEADING.search(text)
    if not h:
        return None
    section = text[h.end():]
    m = re.search(r"^\|\s*%s\s*\|([^|\n]+)\|([^|\n]+)\|" % re.escape(letter),
                  section, re.M)
    if not m:
        return None
    return m.group(1).strip(), m.group(2).strip()


def read_sector(letter):
    """The map section for this letter, or None."""
    text = read_map()
    if not text:
        return None
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

    body = read_sector(sector)
    if not body:
        # Lanes run past the sectors: only some letters have a scope assigned, the rest
        # are free lanes for other work. Say so plainly instead of reading like an error.
        emit({"systemMessage":
              "%s has no sector assigned (%s). "
              "Fine for non-sector work; check the letter if you meant a QA sector."
              % (sector, sectors_available() or "no sector map readable")})

    # The letters are the lanes on this map. A prompt may still pair them differently.
    lm = LANE_WORD.search(value)
    lane = lm.group(1).upper() if lm else sector

    framing = (
        "**The bullets below are the sector's territory, not a list of things to test.** They "
        "mark where your sector ends and another begins. They are not exhaustive and not a "
        "regression checklist: anything a user can reach inside that territory is yours, "
        "including surfaces not named. Working down the list is the wrong shape of pass — pick "
        "targets the way %s describes under \"Choosing what to hit inside your sector\", "
        "and go where coverage is thin." % os.path.basename(SECTORS))

    header = "Read as **sector %s on lane %s**." % (sector, lane)
    if lane != sector:
        header += (
            " These differ, which is not the default on this map: sector letters *are* lane "
            "letters here. Test sector %s's scope while running on lane %s's fixtures and "
            "ports, and export both so `launch.sh` gives you the right browser cap:\n\n"
            "```bash\nexport QA_LANE=%s QA_SECTOR=%s\n```" % (sector, lane, lane, sector))

    files = read_files_row(sector)
    files_note = ""
    if files:
        log, report = files
        files_note = ("\n\n**Write your files under these exact names** — they are fixed per sector so "
                      "parallel sessions never collide or drift apart:\n"
                      "- session log: %s\n- report source: %s\n"
                      "with `<date>` today and `<lane>` = %s." % (log, report, lane))

    note = ("\n\nThis is the sector's own section of %s. Read the rest of that file for the "
            "shared parts — how to dedup against what is already published, how to choose "
            "targets within the sector, and what to do if it runs dry."
            % os.path.basename(SECTORS))

    emit({
        "hookSpecificOutput": {
            "hookEventName": "UserPromptSubmit",
            "additionalContext": header + "\n\n" + framing + "\n\n" + body + files_note + note,
        },
        "systemMessage": "sector %s on lane %s — scope loaded from %s"
                         % (sector, lane, os.path.basename(SECTORS)),
    })


if __name__ == "__main__":
    try:
        main()
    except Exception as exc:
        # A broken hook must never wedge a session.
        print(json.dumps({"systemMessage": "sector-context hook error: %s" % exc}))
    sys.exit(0)
