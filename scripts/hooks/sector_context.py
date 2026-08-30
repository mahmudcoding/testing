#!/usr/bin/env python3
"""UserPromptSubmit hook: expand a bare sector letter into its actual scope.

`/run-until 14:00 A` carries one character of meaning. This reads the sector maps
and puts that sector's section straight into the session's context, so the scope
does not depend on CLAUDE.md being loaded, read and correctly decoded.

Two maps, and they are alternatives rather than layers:
  SECTORS.md        sectors A-E, the whole product, lane = sector
  SECTORS-CALLS.md  sectors K-O, Calls only, lanes A-E paired by position

Silent unless the prompt actually names a sector. Fails open, always.
"""
import json
import os
import re
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
REPO = os.path.normpath(os.path.join(HERE, "..", ".."))
SECTORS = os.path.join(REPO, "SECTORS.md")
SECTORS_CALLS = os.path.join(REPO, "SECTORS-CALLS.md")
# Order matters: the first map holding the letter answers. They use disjoint
# letters today, so this only decides behaviour if that ever stops being true.
MAPS = (SECTORS, SECTORS_CALLS)

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


def read_map(path):
    try:
        with open(path, encoding="utf-8") as fh:
            return fh.read()
    except (OSError, UnicodeDecodeError):
        # A map that cannot be read must not take the other one down with it.
        return None


def letters_in(path):
    """Sector letters a map defines, in the order they appear in the file."""
    text = read_map(path)
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
    """Every letter that has a section, named by the map it lives in."""
    parts = []
    for path in MAPS:
        found = letters_in(path)
        if not found:
            continue
        contiguous = all(ord(b) - ord(a) == 1 for a, b in zip(found, found[1:]))
        span = ("%s-%s" % (found[0], found[-1])) if contiguous and len(found) > 2 else ", ".join(found)
        parts.append("%s in %s" % (span, os.path.basename(path)))
    return "; ".join(parts)


def read_files_row(path, letter):
    """The sector's row from that map's "Files each session writes" table.

    Lives in a shared section, so injecting the sector's own section alone leaves a
    session to invent its own filename — which is exactly what the table exists to stop.
    """
    text = read_map(path)
    if not text:
        return None
    m = re.search(r"^\|\s*%s\s*\|([^|]+)\|([^|]+)\|" % re.escape(letter), text, re.M)
    if not m:
        return None
    return m.group(1).strip(), m.group(2).strip()


def read_sector(letter):
    """(section body, map path) for the first map defining this letter."""
    for path in MAPS:
        text = read_map(path)
        if not text:
            continue
        pat = re.compile(r"^## Sector %s\b.*?(?=^## |\Z)" % re.escape(letter), re.M | re.S)
        m = pat.search(text)
        if m:
            return m.group(0).rstrip(), path
    return None, None


def default_lane(path, letter):
    """Which lane this sector runs on when the prompt does not say.

    On SECTORS.md the letters are the lanes. On the Calls map they are not, and
    getting this wrong is the failure the pairing exists to prevent: there are no
    lanes K-O — they are unseeded, and their ports sit outside the 9220-9319 window
    launch.sh counts, so a browser there escapes the global cap entirely.

    Derived from position rather than a hardcoded table, so adding a sector to the
    map cannot leave this behind.
    """
    if path == SECTORS:
        return letter
    order = letters_in(path)
    if letter in order:
        i = order.index(letter)
        if i < 26:
            return chr(ord("A") + i)
    return None


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

    body, path = read_sector(sector)
    if not body:
        # Lanes run past the sectors: only some letters have a scope assigned, the rest
        # are free lanes for other work. Say so plainly instead of reading like an error.
        emit({"systemMessage":
              "%s has no sector assigned (%s). "
              "Fine for non-sector work; check the letter if you meant a QA sector."
              % (sector, sectors_available() or "no sector map readable")})

    lm = LANE_WORD.search(value)
    if lm:
        lane = lm.group(1).upper()
    else:
        lane = default_lane(path, sector)

    calls_map = path == SECTORS_CALLS
    warn = ""
    if lane is None:
        # Only reachable if the Calls map became unreadable between read_sector and
        # here. Refuse to guess a lane rather than silently pairing K with lane K.
        lane = "?"
        warn = ("\n\n**Could not resolve this sector's lane** — read the pairing table at the "
                "top of %s and set `QA_LANE` by hand before launching anything."
                % os.path.basename(SECTORS_CALLS))

    framing = (
        "**The bullets below are the sector's territory, not a list of things to test.** They "
        "mark where your sector ends and another begins. They are not exhaustive and not a "
        "regression checklist: anything a user can reach inside that territory is yours, "
        "including surfaces not named. Working down the list is the wrong shape of pass — pick "
        "targets the way %s describes under \"Choosing what to hit inside your sector\", "
        "and go where coverage is thin." % os.path.basename(path))

    header = "Read as **sector %s on lane %s**." % (sector, lane)
    if calls_map:
        header += (
            " This is the **Calls-only map** (`%s`), which replaces `SECTORS.md` for the day "
            "rather than adding to it — sector letters are K-O and lanes are A-E, so they are "
            "*meant* to differ. There are no lanes K-O: they are unseeded and sit outside the "
            "port range `launch.sh` counts for its global browser cap.\n\n"
            "**Export both** at the start of the session — `launch.sh` reads the sector off the "
            "lane letter unless you say otherwise, and would hand you the wrong browser cap:\n\n"
            "```bash\nexport QA_LANE=%s QA_SECTOR=%s\n```"
            % (os.path.basename(SECTORS_CALLS), lane, sector))
    elif lane != sector:
        header += (" These differ, which is deliberate: test sector %s's scope while running on "
                   "lane %s's fixtures and ports." % (sector, lane))

    files = read_files_row(path, sector)
    files_note = ""
    if files:
        log, report = files
        files_note = ("\n\n**Write your files under these exact names** — they are fixed per sector so "
                      "parallel sessions never collide or drift apart:\n"
                      "- session log: %s\n- report source: %s\n"
                      "with `<date>` today and `<lane>` = %s." % (log, report, lane))

    note = ("\n\nThis is the sector's own section of %s. Read the rest of that file for the "
            "shared parts — how to choose targets within the sector, and what to do if it runs "
            "dry." % os.path.basename(path))

    emit({
        "hookSpecificOutput": {
            "hookEventName": "UserPromptSubmit",
            "additionalContext": header + warn + "\n\n" + framing + "\n\n" + body + files_note + note,
        },
        "systemMessage": "sector %s on lane %s — scope loaded from %s"
                         % (sector, lane, os.path.basename(path)),
    })


if __name__ == "__main__":
    try:
        main()
    except Exception as exc:
        # A broken hook must never wedge a session.
        print(json.dumps({"systemMessage": "sector-context hook error: %s" % exc}))
    sys.exit(0)
