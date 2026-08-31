#!/usr/bin/env python3
"""Walk a report's findings in setup order, with browsers already positioned.

  scripts/verify_run.py reports/runs/<run>.md <lane>        # e.g. D
  scripts/verify_run.py reports/runs/<run>.md D --group 3   # one setup only
  scripts/verify_run.py reports/runs/<run>.md D --dry       # show plan, launch nothing
  scripts/verify_run.py reports/runs/<run>.md D --anyway    # walk a run that is short

You perform the trigger and you judge. This only removes setup and ordering.
Verdicts are written to verifications/verification-<lane>-<date>.md as a signed record.
"""
import sys, os, json, subprocess, datetime, re
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from findings import SourceError, load_run, notes_for, publish_blockers
from collections import defaultdict

REPO = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

ROUTE = {
    'Admin settings': '/settings/admin/members',
    'Roles':          '/settings/roles',
    'Settings':       '/settings/account',
    'Directories':    '/directories?tab=people',
    'Calendar':       '/calendar',
    'Files':          '/files',
    'Calls':          '/calls',
    'Chat':           '',
}

def sh(cmd, **kw):
    return subprocess.run(cmd, cwd=REPO, text=True, capture_output=True, **kw)

def accounts_for(accts):
    """Dedupe, preserving order. Accounts are stated per finding now.

    This used to map inferred role names through a prose->account table, because
    the accounts were guessed from the report's Russian text. The table is gone
    with the guessing.
    """
    seen, out = set(), []
    for a in accts or ['alice']:
        if a not in seen:
            seen.add(a); out.append(a)
    return out

def main():
    if len(sys.argv) < 3:
        print(__doc__); sys.exit(2)
    path, lane = sys.argv[1], sys.argv[2].upper()
    only  = int(sys.argv[sys.argv.index('--group')+1]) if '--group' in sys.argv else None
    dry   = '--dry' in sys.argv

    try:
        run = load_run(os.path.abspath(path))
    except (SourceError, OSError) as e:
        # The other four tools all catch this and print a line. Without it a typo
        # in the run name came out as a traceback, through an exit code this
        # commit had just made meaningful.
        print("\n  %s\n" % e)
        return 2
    # The fourth consumer of publish_blockers, and the last to ask. Walking a run
    # that lists an unpublished finding wrote a signed human verification record
    # for a walk that silently skipped it -- the renderer's "publish short" bug,
    # living in the record instead of the HTML.
    blockers = publish_blockers(run)
    anyway = "--anyway" in sys.argv
    if blockers:
        verb = "WALKING SHORT" if anyway else "REFUSING"
        for why in blockers:
            print("  %s %s: %s" % (verb, os.path.basename(path), why))
        if not anyway:
            print("\n  A verification record must cover the run it names. Fix the "
                  "`findings:` list, or pass --anyway to walk what remains.")
            return 1
        print("  The record will say the walk was short.\n")
    findings = run["items"]
    notes = {f["id"]: notes_for(f) for f in findings}
    # Group by the setup a finding actually needs. Both halves of the key used to
    # be guessed -- the surface by matching regexes against the title, the
    # accounts by grepping Russian morphological stems -- and both are stated
    # fields now, so two findings land in one group because they say so.
    groups = defaultdict(list)
    for f in findings:
        groups[(f['surface'], tuple(f['accounts']))].append(f)
    # order by account set first, so groups sharing browsers run back to back
    order = sorted(groups.items(),
                   key=lambda kv: (kv[0][1], -len(kv[1]), kv[0][0]))

    date = datetime.date.today().isoformat()
    outd = os.path.join(REPO, "verifications")
    os.makedirs(outd, exist_ok=True)
    outp = os.path.join(outd, f"verification-{lane}-{date}.md")
    # The file appends one session block per run — but only once there is a
    # verdict to record. Opening it eagerly littered the record with empty
    # started/ended headers from runs that quit immediately.
    logf = None
    def rec(text):
        nonlocal logf
        if logf is None:
            logf = open(outp, 'a', encoding='utf-8')
            logf.write(f"\n# Human verification — {os.path.basename(path)}, lane {lane}\n"
                       f"_started {datetime.datetime.now():%Y-%m-%d %H:%M}_\n\n")
            # An incomplete walk must say so IN the record. The console line
            # warning about it is not kept, and the header is otherwise
            # byte-identical to a complete walk's.
            if blockers:
                logf.write("> **Incomplete:** walked with `--anyway`. This run "
                           + "; ".join(blockers) + ".\n\n")
        logf.write(text)
        logf.flush()

    print(f"\n  {len(findings)} findings · {len(order)} setups · lane {lane}")
    print(f"  verdicts → {os.path.basename(outp)}\n")

    n, prev_accts = 0, None
    for gi, ((surf, accounts), items) in enumerate(order, 1):
        accts = accounts_for(accounts)
        if only and gi != only:
            n += len(items); continue
        print(f"  ══ setup {gi}/{len(order)}: {surf} · {' + '.join(accts)} · {len(items)} finding(s)")
        if dry:
            print(f"     would run: ./scripts/callrig/ensure.sh {lane.lower()} {' '.join(accts)}")
            print(f"     would open: {ROUTE.get(surf,'(workspace home)')}\n")
            n += len(items); continue

        if accts == prev_accts:
            print(f"     same browsers as the last setup — just navigate")
            print(f"     open in each: {ROUTE.get(surf,'(workspace home)')}\n")
            r = None
        else:
            r = sh(["./scripts/callrig/ensure.sh", lane.lower(), *accts], timeout=600)
        prev_accts = accts
        if r is not None and r.returncode != 0:
            print(f"     ensure.sh failed — {r.stderr.strip()[:200]}")
            print("     fix the rig and re-run with --group %d\n" % gi); continue
        if r is not None:
            print(f"     browsers ready: {', '.join(accts)}")
            route = ROUTE.get(surf, '')
            if route: print(f"     open in each: {route}")
            print()

        for f in items:
            n += 1
            print(f"  ── {n}. [{f['sev']}] {f['title']}")
            for w in notes.get(f['id'], []):       print(f"     ⚠ {w}")
            # f['actual'], not f['Фактический результат'] — the Russian heading is
            # a key of f['sections'], never a top-level field. Reading the old
            # shape printed an empty claim for every finding, so the person
            # judging saw the steps with nothing to judge them against.
            print(f"\n     Claim: {f['actual'][:400]}\n")
            print("     Steps:")
            for i, s in enumerate(f['steps'], 1):     print(f"       {i}. {s}")
            print()
            v = input("     real bug? [y/n/s=skip/q=quit]  ").strip().lower()
            if v == 'q': break
            note = input("     note (enter to skip): ").strip() if v in ('y','n') else ''
            verdict = {'y':'CONFIRMED','n':'NOT A BUG','s':'skipped'}.get(v, v)
            rec(f"## {n}. {f['title']}\n\n"
                f"- severity as reported: **{f['sev']}**\n"
                f"- verdict: **{verdict}**\n"
                + (f"- note: {note}\n" if note else "") + "\n")
            print()
        else:
            continue
        break

    if logf is not None:
        logf.write(f"\n_ended {datetime.datetime.now():%Y-%m-%d %H:%M}_\n")
        logf.close()
        print(f"\n  record written to {outp}\n")
    else:
        print("\n  no verdicts recorded — nothing written\n")

if __name__ == '__main__':
    sys.exit(main() or 0)
