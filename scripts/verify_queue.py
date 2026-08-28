#!/usr/bin/env python3
"""Build a human-verification queue from a QA report.

Parses a published report, kills findings that should never reach a human,
groups the survivors by the setup they share, and prints a run order.

Usage:  scripts/verify_queue.py reports/<file>.html [--json out.json]

Judgment stays human. This only removes setup and ordering work.
"""
import sys, re, json, html, subprocess, os, difflib
from collections import defaultdict

SECTIONS = ["Проблема", "Как воспроизвести", "Фактический результат",
            "Подтверждённая причина", "Ожидаемый результат", "Проверка"]

# roles inferred from scrubbed report prose -> fixture accounts. One copy for
# every consumer (bench.py, verify_run.py) — two drifting copies is how the
# bench and the CLI walk end up launching different browsers for one finding.
ACCOUNT = {
    'company owner':          'owner',
    'workspace owner':        'owner',
    'company admin':          'admin',
    'plain member':           'bob',
    'second account':         'carol',
    'second browser':         'carol',
    'guest':                  'guest',
    'member in no channel':   'dave',
    'outside the workspace':  'outsider',
    'invitee':                'bob',
    'any signed-in account':  'alice',
}

def strip(t):
    t = re.sub(r'<br\s*/?>', ' ', t)
    t = re.sub(r'<[^>]+>', '', t)
    return html.unescape(re.sub(r'\s+', ' ', t)).strip()

def _norm(t):
    """Fold away what summary rows habitually change: «» and other quoting,
    dashes, brackets, case. Prefix comparison over the raw strings lost the
    severity of two High findings to a dropped «» pair."""
    t = re.sub(r'[«»"“”\'’`()\[\]{}—–…:;,.!?]', ' ', t.lower())
    return re.sub(r'\s+', ' ', t).strip()

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
        # some drop it, so try both forms before giving up. Comparison runs on
        # normalised text (see _norm), because rows reword titles and a raw
        # prefix compare silently drops the severity — the app then showed two
        # High findings as Medium.
        sev, drift = "?", None
        for rt, rs in rows:
            n_rt = _norm(rt)
            for cand in (untagged, title):
                n_c = _norm(cand)
                k = min(45, len(n_rt), len(n_c))
                if k > 20 and n_rt[:k] == n_c[:k]:
                    sev = rs
                    if rt.strip() not in (untagged.strip(), title.strip()): drift = rt
                    break
            if sev != "?": break
        # Fuzzy fallback for rows that drop or reorder words mid-prefix. The
        # margin over the runner-up is what keeps a near-duplicate pair of
        # rows from attaching the wrong severity; an ambiguous best stays "?"
        # and the app shows that honestly instead of guessing.
        if sev == "?" and rows:
            n_u = _norm(untagged)
            scored = sorted(
                ((difflib.SequenceMatcher(None, _norm(rt), n_u).ratio(), i)
                 for i, (rt, _) in enumerate(rows)), reverse=True)
            best, runner = scored[0], (scored[1] if len(scored) > 1 else (0.0, -1))
            if best[0] >= 0.60 and best[0] - runner[0] >= 0.05:
                rt, rs = rows[best[1]]
                sev, drift = rs, rt
        f = {"title": title, "untagged": untagged, "severity": sev,
             "table_drift": drift, "steps": []}
        tm = re.match(r'\[([A-Z-]+)\]\[([A-Z0-9 -]+)\]', title)
        f["area"] = tm.group(2) if tm else "?"
        # class="block expect" / "block repro" / "block triage" — reports carry
        # modifier classes, and matching only the bare class made every section
        # in one invisible. Whole reports came through with no Проблема, no
        # Фактический результат and no Ожидаемый результат at all.
        for blk in re.findall(r'<div class="block[^"]*"[^>]*>(.*?)</div>', p, re.S):
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
    """Flag findings a human should double-check before judging.

    Notes are keyed by the finding's full title — a 34-char prefix key merged
    the notes of findings that shared an opening."""
    notes = defaultdict(list)
    # 1. withdrawn / false-positive mentions: find the session logs that talk
    #    about withdrawals, then check whether this finding's own title appears
    #    in one of them. A hit is a reason to open that log, not a verdict.
    #    Scoped to logs/ and the report index — the repo root holds thousands
    #    of snippets and snapshots that can never carry a withdrawal.
    texts = []
    try:
        hits = subprocess.run(
            ["grep", "-ril", "-e", "ложн", "-e", "отозв", "-e", "false positive",
             "--include=*.md", "logs", "reports/README.md"],
            cwd=repo, capture_output=True, text=True, timeout=15)
        for rel in hits.stdout.splitlines():
            rel = rel.strip()
            if not rel:
                continue
            try:
                with open(os.path.join(repo, rel), encoding="utf-8", errors="ignore") as fh:
                    texts.append((rel, fh.read().lower()))
            except OSError:
                pass
    except Exception:
        texts = []
    for f in findings:
        key = f["title"]
        frag = re.sub(r'\s+', ' ', f["untagged"]).strip().lower()[:32]
        if len(frag) >= 20:
            where = [rel for rel, tx in texts if frag in tx]
            if where:
                notes[key].append(
                    "WITHDRAWN? this finding is quoted in a log that also mentions "
                    "withdrawn/false-positive findings — read "
                    + ", ".join(where[:3]) + " before judging")
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
            for w in notes.get(f["title"], []):
                print(f"         ⚠ {w}")
            if f.get("table_drift"):
                print(f"         ⚠ TABLE/TITLE DRIFT — row: {f['table_drift'][:66]}")
        print()
    print(f"  {total} findings → {len(order)} browser setups "
          f"({total/max(len(order),1):.1f} findings per setup)\n")

    if "--json" in sys.argv:
        out = sys.argv[sys.argv.index("--json")+1]
        json.dump([{**f, "notes": notes.get(f["title"], [])} for f in findings],
                  open(out, "w", encoding="utf-8"), ensure_ascii=False, indent=1)
        print(f"  queue written to {out}\n")

if __name__ == "__main__":
    main()
