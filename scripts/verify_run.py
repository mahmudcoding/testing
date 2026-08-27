#!/usr/bin/env python3
"""Walk a report's findings in setup order, with browsers already positioned.

  scripts/verify_run.py reports/<file>.html <lane>          # e.g. D
  scripts/verify_run.py reports/<file>.html D --group 3     # one setup only
  scripts/verify_run.py reports/<file>.html D --dry         # show plan, launch nothing

You perform the trigger and you judge. This only removes setup and ordering.
Verdicts are written to verification-<lane>-<date>.md as a signed record.
"""
import sys, os, json, subprocess, datetime, re
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from verify_queue import parse, roles_needed, surface, preflight
from collections import defaultdict

REPO = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

# roles inferred from scrubbed report prose -> fixture accounts
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

def accounts_for(roles):
    seen, out = set(), []
    for r in roles:
        a = ACCOUNT.get(r, 'alice')
        if a not in seen:
            seen.add(a); out.append(a)
    return out

def main():
    if len(sys.argv) < 3:
        print(__doc__); sys.exit(2)
    path, lane = sys.argv[1], sys.argv[2].upper()
    only  = int(sys.argv[sys.argv.index('--group')+1]) if '--group' in sys.argv else None
    dry   = '--dry' in sys.argv

    findings = parse(path)
    notes = preflight(findings, REPO)
    groups = defaultdict(list)
    for f in findings:
        f['roles'] = roles_needed(f); f['surface'] = surface(f)
        groups[(f['surface'], tuple(f['roles']))].append(f)
    # order by account set first, so groups sharing browsers run back to back
    order = sorted(groups.items(),
                   key=lambda kv: (tuple(accounts_for(kv[0][1])), -len(kv[1]), kv[0][0]))

    date = datetime.date.today().isoformat()
    outp = os.path.join(REPO, f"verification-{lane}-{date}.md")
    log  = open(outp, 'a', encoding='utf-8')
    log.write(f"\n# Human verification — {os.path.basename(path)}, lane {lane}\n"
              f"_started {datetime.datetime.now():%Y-%m-%d %H:%M}_\n\n")

    print(f"\n  {len(findings)} findings · {len(order)} setups · lane {lane}")
    print(f"  verdicts → {os.path.basename(outp)}\n")

    n, prev_accts = 0, None
    for gi, ((surf, roles), items) in enumerate(order, 1):
        accts = accounts_for(roles)
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
            print(f"  ── {n}. [{f['severity']}] {f['title']}")
            for w in notes.get(f['title'][:34], []):  print(f"     ⚠ {w}")
            if f.get('table_drift'):                  print(f"     ⚠ summary row wording differs from this title")
            print(f"\n     Claim: {f.get('Фактический результат','')[:400]}\n")
            print("     Steps:")
            for i, s in enumerate(f['steps'], 1):     print(f"       {i}. {s}")
            print()
            v = input("     real bug? [y/n/s=skip/q=quit]  ").strip().lower()
            if v == 'q': break
            note = input("     note (enter to skip): ").strip() if v in ('y','n') else ''
            verdict = {'y':'CONFIRMED','n':'NOT A BUG','s':'skipped'}.get(v, v)
            log.write(f"## {n}. {f['title']}\n\n"
                      f"- severity as reported: **{f['severity']}**\n"
                      f"- verdict: **{verdict}**\n"
                      + (f"- note: {note}\n" if note else "") + "\n")
            log.flush()
            print()
        else:
            continue
        break

    log.write(f"\n_ended {datetime.datetime.now():%Y-%m-%d %H:%M}_\n")
    log.close()
    print(f"\n  record written to {outp}\n")

if __name__ == '__main__':
    main()
