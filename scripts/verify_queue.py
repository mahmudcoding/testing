#!/usr/bin/env python3
"""Build a human-verification queue from a QA report.

Parses a published report, kills findings that should never reach a human,
groups the survivors by the setup they share, and prints a run order.

Usage:  scripts/verify_queue.py reports/<file>.html [--json out.json]

Judgment stays human. This only removes setup and ordering work.
"""
import sys, re, json, html, subprocess, os
from collections import defaultdict

SECTIONS = ["Проблема", "Как воспроизвести", "Фактический результат",
            "Подтверждённая причина", "Ожидаемый результат", "Проверка"]

def strip(t):
    t = re.sub(r'<br\s*/?>', ' ', t)
    t = re.sub(r'<[^>]+>', '', t)
    return html.unescape(re.sub(r'\s+', ' ', t)).strip()

def parse(path):
    s = open(path, encoding='utf-8').read()
    # Severities live in the summary table. The table drops the [TAG][MODULE]
    # prefix and its wording drifts from the h2, so match on a normalised prefix
    # of the untagged title rather than on the full string or on position.
    rows = []
    for row in re.findall(r'<tr>(.*?)</tr>', s, re.S):
        cells = [strip(c) for c in re.findall(r'<t[dh][^>]*>(.*?)</t[dh]>', row, re.S)]
        if len(cells) >= 2 and cells[1] in ("High", "Medium", "Low", "Critical"):
            rows.append((cells[0], cells[1]))
    out = []
    parts = re.split(r'(?=<h2)', s)
    for p in parts:
        m = re.search(r'<h2[^>]*>(.*?)</h2>', p, re.S)
        if not m: continue
        title = strip(m.group(1))
        untagged = re.sub(r'^(\[[^\]]+\])+\s*', '', title)
        # Reports differ: some summary tables keep the [TAG][MODULE] prefix and
        # some drop it, so try both forms before giving up.
        sev, drift = "?", None
        for rt, rs in rows:
            for cand in (untagged, title):
                k = min(45, len(rt), len(cand))
                if k > 20 and rt[:k].lower() == cand[:k].lower():
                    sev = rs
                    if rt.strip() != cand.strip(): drift = rt
                    break
            if sev != "?": break
        f = {"title": title, "untagged": untagged, "severity": sev,
             "table_drift": drift, "steps": []}
        tm = re.match(r'\[([A-Z-]+)\]\[([A-Z0-9 -]+)\]', title)
        f["area"] = tm.group(2) if tm else "?"
        for blk in re.findall(r'<div class="block">(.*?)</div>', p, re.S):
            h = re.search(r'<h3[^>]*>(.*?)</h3>', blk, re.S)
            if not h: continue
            name = strip(h.group(1))
            if name == "Как воспроизвести":
                f["steps"] = [strip(li) for li in re.findall(r'<li>(.*?)</li>', blk, re.S)]
            elif name in SECTIONS:
                body = re.sub(r'<h3[^>]*>.*?</h3>', '', blk, flags=re.S)
                # Keep prose and measurement apart: <p> is what a person reads,
                # <pre> is the proof. Flattening both into one blob is what made
                # the bench show a wall of КОНТРОЛЬ lines instead of a sentence.
                pres = re.findall(r'<pre[^>]*>(.*?)</pre>', body, re.S)
                prose = re.sub(r'<pre[^>]*>.*?</pre>', '', body, flags=re.S)
                f[name] = strip(prose)
                if pres:
                    f[name + "_measure"] = "\n\n".join(
                        html.unescape(re.sub(r'<[^>]+>', '', x)).strip() for x in pres)
        out.append(f)
    return out

# ---- role inference: reports are scrubbed of account names, so infer from phrasing
ROLES = [
    (r'владельц\w*\s+компании|company owner',            'company owner'),
    (r'администратор\w*\s+компании|company admin',        'company admin'),
    (r'владельц\w*\s+воркспейса|workspace owner',         'workspace owner'),
    (r'гост\w+|guest',                                     'guest'),
    (r'без административных прав|обычн\w+ участник\w*|плоск\w+ участник', 'plain member'),
    (r'участник\w*\s+не\s+в\s+канале|not in (?:the )?channel', 'member in no channel'),
    (r'вне воркспейса|не в воркспейсе|outsider',          'outside the workspace'),
    (r'втор\w+ (?:аккаунт|участник|профил)|second account|другим участником', 'second account'),
    (r'приглашённ\w+|invitee',                             'invitee'),
]
def roles_needed(f):
    text = " ".join(f["steps"]) + " " + f.get("Проблема", "")
    found = []
    for pat, name in ROLES:
        if re.search(pat, text, re.I) and name not in found:
            found.append(name)
    if re.search(r'отдельн\w+ профил|второй браузер|separate browser', text, re.I):
        if len(found) < 2: found.append('second browser')
    return found or ['any signed-in account']

SURFACES = [
    (r'Settings\s*→\s*Admin|/settings/admin', 'Admin settings'),
    (r'Settings\s*→\s*Roles|Workspace roles|Company roles', 'Roles'),
    (r'Settings\s*→', 'Settings'),
    (r'Directories|People|Channels\b', 'Directories'),
    (r'календар|Calendar|встреч', 'Calendar'),
    (r'Files|файл', 'Files'),
    (r'звонк|call|Call', 'Calls'),
    (r'тред|thread|канал\w*|channel|сообщени', 'Chat'),
]
def surface(f):
    text = f["title"] + " " + " ".join(f["steps"])
    for pat, name in SURFACES:
        if re.search(pat, text, re.I): return name
    return f["area"]

def preflight(findings, repo):
    """Kill or flag findings a human should not have to judge."""
    notes = defaultdict(list)
    # 1. withdrawn / false-positive mentions anywhere in the logs
    try:
        hits = subprocess.run(["grep", "-ril", "-e", "ложн", "-e", "отозв", "-e", "false positive"],
                              cwd=repo, capture_output=True, text=True, timeout=30)
        wd = hits.stdout
    except Exception:
        wd = ""
    for f in findings:
        key = f["title"][:34]
        # 2. rests on seeded data that is never indexed
        if re.search(r'глобальн\w+ поиск|global search', f["title"], re.I):
            notes[key].append("FIXTURE RISK: seeded channels/accounts never reach the search index "
                              "— confirm against a UI-created object first")
        # 3. guest permissions cannot be tested on the fixture guest
        if re.search(r'гост', f["title"], re.I):
            notes[key].append("FIXTURE RISK: qa.*.guest holds workspace Member rights too "
                              "(seed_qa_fixtures.py:139)")
    return notes

def main():
    if len(sys.argv) < 2:
        print(__doc__); sys.exit(2)
    path = sys.argv[1]
    repo = os.path.dirname(os.path.dirname(os.path.abspath(path)))
    findings = parse(path)
    notes = preflight(findings, repo)

    groups = defaultdict(list)
    for f in findings:
        f["roles"] = roles_needed(f)
        f["surface"] = surface(f)
        groups[(f["surface"], tuple(f["roles"]))].append(f)

    order = sorted(groups.items(), key=lambda kv: (-len(kv[1]), kv[0][0]))
    total = len(findings)
    print(f"\n  {os.path.basename(path)} — {total} findings, {len(order)} setups\n")
    n = 0
    for (surf, roles), items in order:
        print(f"  ── setup: {surf}  ·  {' + '.join(roles)}  ({len(items)} finding"
              f"{'s' if len(items)>1 else ''})")
        for f in items:
            n += 1
            print(f"     {n:2}. [{f['severity']}] {f['title'][:88]}")
            for w in notes.get(f["title"][:34], []):
                print(f"         ⚠ {w}")
            if f.get("table_drift"):
                print(f"         ⚠ TABLE/TITLE DRIFT — row: {f['table_drift'][:66]}")
        print()
    print(f"  {total} findings → {len(order)} browser setups "
          f"({total/max(len(order),1):.1f} findings per setup)\n")

    if "--json" in sys.argv:
        out = sys.argv[sys.argv.index("--json")+1]
        json.dump([{**f, "notes": notes.get(f["title"][:34], [])} for f in findings],
                  open(out, "w", encoding="utf-8"), ensure_ascii=False, indent=1)
        print(f"  queue written to {out}\n")

if __name__ == "__main__":
    main()
