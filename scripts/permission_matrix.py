#!/usr/bin/env python3
"""Worklist of single-permission probes for sector D, ordered by disagreement.

Not a permissions x screens grid: most cells there are empty or obvious. The yield
is in the cells where the two sides disagree, so this emits one row per
disagreement, each with the probe spelled out.

Two inputs, both read at the DEPLOYED sha — the frontend clone routinely sits on a
feature branch, and reading the gate from the working tree produces a confidently
wrong answer (a pre-fix line that reads exactly like a root cause):

  1. backend requirement -- apps/web/src/generated/openapi.json  (operation descriptions)
  2. frontend gate       -- packages/features/admin/model/capabilities.ts
  3. catalogue           -- platform/pkg/permissions/permissions.go  (backend clone, clean)

  ./scripts/permission_matrix.py              # resolves the deployed sha itself
  ./scripts/permission_matrix.py c4b5386b4a3a
"""
import json, re, subprocess, sys, urllib.request

FE = "~/Projects/aloqa-src/aloqa-frontend"
BE = "~/Projects/aloqa-src/aloqa-backend"
OPENAPI = "apps/web/src/generated/openapi.json"
GATE = "packages/features/admin/model/capabilities.ts"
CATALOGUE = "platform/pkg/permissions/permissions.go"

# Permission strings appear both backticked and bare in the descriptions — anchoring
# on backticks silently drops the invites endpoint, which is the one that matters most.
PERM = re.compile(r"\b((?:company|workspace|channel))\.\{[a-z_]+\}\.([a-z_.]+|\*)")
# company.{cid}.workspace.{wid}.* is a nested scope, not a company action called
# "workspace." — the naive capture produces a malformed action string.
NESTED = re.compile(r"company\.\{[a-z_]+\}\.workspace\.\{[a-z_]+\}")


def sh(cmd):
    return subprocess.run(cmd, shell=True, capture_output=True, text=True).stdout


def show(repo, sha, path):
    # Quote the ref: unquoted, zsh reads the char after the colon as a history
    # modifier and mangles the sha (apps/ -> :a, tests/ -> :t, src/ -> error).
    return sh(f"git -C {repo} show '{sha}:{path}'")


def deployed_sha():
    html = urllib.request.urlopen("https://airion-cargo.store/", timeout=10).read().decode("utf8", "replace")
    m = re.search(r'data-dpl-id="([^"]*)"', html)
    if not m:
        sys.exit("could not read data-dpl-id from the live site; pass a sha explicitly")
    return m.group(1)[-12:]


def backend_requirements(sha):
    """endpoint -> {(scopeType, action)} as documented in the operation description."""
    raw = show(FE, sha, OPENAPI)
    if not raw.strip():
        sys.exit(f"openapi.json is empty at {sha} — check the sha and the quoting")
    spec = json.loads(raw)
    out, total = {}, 0
    for path, methods in spec.get("paths", {}).items():
        for method, op in methods.items():
            if not isinstance(op, dict):
                continue
            total += 1
            text = (op.get("description") or "") + " " + (op.get("summary") or "")
            text = NESTED.sub("company-workspace-management", text)
            perms = {(s, a.rstrip(".")) for s, a in PERM.findall(text) if a.rstrip(".")}
            if perms:
                out[f"{method.upper()} {path}"] = perms
    return out, total


def frontend_gates(sha):
    """section -> {(scopeType, action)} the gate actually asks about."""
    src = show(FE, sha, GATE)
    if not src.strip():
        sys.exit(f"capabilities.ts is empty at {sha}")
    gates, special = {}, {}
    for m in re.finditer(r"const has(\w+?)Section\s*=\s*(.*?)(?=\n\s{4}const |\n\s{4}return)", src, re.S):
        name, body = m.group(1), m.group(2)
        asks = set()
        for h in re.finditer(r"hasPermission\(\{\s*action:\s*'([^']+)',\s*scopeId:\s*(\w+),\s*scopeType:\s*'(\w+)'", body):
            asks.add((h.group(3), h.group(1)))
        gates[name] = asks
        flags = []
        if "isSuperAdmin" in body:
            flags.append("isSuperAdmin")
        if "hasElevatedAuthority" in body:
            flags.append("elevated")
        for fn in re.findall(r"(grants\w+)\(", body):
            flags.append(fn + "()")
        special[name] = flags
    return gates, special


def catalogue():
    src = sh(f"git -C {BE} show HEAD:{CATALOGUE}")
    acts = re.findall(r'^\s+Action[A-Za-z]+\s+=\s+"([^"]+)"', src, re.M)
    return sorted(set(acts))


# Which admin section hosts which endpoint. Kept explicit: a heuristic that guesses
# wrong here invents disagreements that do not exist.
SECTION_OF = [
    ("admin/audit-log", "AuditLog"),
    ("/roles", "Roles"),
    ("/invites", "Invites"),
    ("/members", "Members"),
    ("/workspaces", "Workspaces"),
]
SCREEN = {
    "AuditLog": "/w/{ws}/settings/admin/audit-log",
    "Roles": "/w/{ws}/settings/admin/company-roles",
    "Invites": "/w/{ws}/settings/admin/invites",
    "Members": "/w/{ws}/settings/admin/members",
    "Workspaces": "/w/{ws}/settings/admin/workspaces",
}


# The admin area is company- and workspace-scoped. Channel roles are managed in
# channel settings, not here, so joining a channel-scope permission to an admin
# screen invents a disagreement that does not exist — the screen was never meant
# to honour it. Those are reported separately as having no admin surface.
ADMIN_SCOPES = {"company", "workspace"}


def section_for(endpoint, scope):
    if scope not in ADMIN_SCOPES:
        return None
    for frag, sec in SECTION_OF:
        if frag in endpoint:
            return sec
    return None


PANEL_HOOK = "apps/web/src/features/admin/hooks/useAdmin{sec}Panel.ts"
HOOK_READ = re.compile(r"use[A-Z][A-Za-z]*\((companyId|workspaceId)")
FOREIGN_DISABLE = re.compile(r"isDisabled=\{([^}]*(?:AccessDenied|Error|Loading)[^}]*)\}")


def coupled(sha, gates):
    """Sections gated at one layer whose contents are read from another.

    Not a verdict — a source-only reading cannot tell you whether the coupling
    actually disables anything on this build. It says where to look, and the
    answer has to come from opening the page with only the gating permission.
    """
    out = []
    for sec, asks in gates.items():
        gate_layers = {scope for scope, _ in asks}
        if not gate_layers:
            continue
        hook_src = show(FE, sha, PANEL_HOOK.format(sec=sec))
        if not hook_src.strip():
            continue
        read_layers = {("company" if m == "companyId" else "workspace")
                       for m in HOOK_READ.findall(hook_src)}
        foreign = read_layers - gate_layers
        if not foreign:
            continue
        reads = sorted(set(re.findall(r"(use[A-Z][A-Za-z]*)\((?:companyId|workspaceId)", hook_src)))
        # The blunter signal: a disabled-state expression naming a flag that
        # belongs to a different resource than the panel itself.
        flags = []
        for f in sh(f"git -C {FE} ls-tree -r --name-only {sha}").splitlines():
            if "/features/admin/" in f and f.endswith("Panel.tsx"):
                for m in FOREIGN_DISABLE.finditer(show(FE, sha, f)):
                    flags.append(f"{f.split('/')[-1]}: isDisabled={{{m.group(1).strip()}}}")
        out.append({"section": sec, "gate_layers": sorted(gate_layers),
                    "read_layers": sorted(foreign), "reads": reads, "flags": flags})
    return out


def probe(scope, action, screen):
    return (f"Create role at {scope} scope, tick ONLY '{action}', assign to a plain member, "
            f"sign in as them, open {screen}")


def main():
    sha = sys.argv[1] if len(sys.argv) > 1 else deployed_sha()
    reqs, total_ops = backend_requirements(sha)
    gates, special = frontend_gates(sha)
    cat = catalogue()

    rows, reachable, no_surface = [], set(), []
    for endpoint, perms in sorted(reqs.items()):
        for scope, action in sorted(perms):
            if action == "*":
                continue
            sec = section_for(endpoint, scope)
            if sec is None:
                no_surface.append(f"{scope}.{{id}}.{action}  ({endpoint})")
                continue
            asks = gates.get(sec, set())
            screen = SCREEN.get(sec, "(no screen mapped)")
            reachable.add(action)
            if (scope, action) in asks:
                continue
            same_action_other_scope = any(a == action for _, a in asks)
            verdict = "gate-narrower" if same_action_other_scope else "gate-silent"
            rows.append({
                "verdict": verdict, "permission": f"{scope}.{{id}}.{action}", "section": sec,
                "screen": screen, "backend": endpoint,
                "gate": ", ".join(f"{s}.{a}" for s, a in sorted(asks)) or "(asks nothing)",
                "flags": ", ".join(special.get(sec, [])) or "-",
                "probe": probe(scope, action, screen),
            })

    unreachable = [a for a in cat if a not in reachable and not a.startswith("*")]

    be_head = sh(f"git -C {BE} rev-parse --short=12 HEAD").strip()
    be_branch = sh(f"git -C {BE} rev-parse --abbrev-ref HEAD").strip()
    print(f"# Permission probe worklist")
    print(f"#   frontend read at : {sha}   (the deployed sha — NOT the working tree)")
    print(f"#   backend read at  : {be_head} on {be_branch}   (working tree; verify it is the release)")
    print(f"#   coverage bound   : only {len(reqs)} of {total_ops} operations document a permission at all,")
    print(f"#                      so this is a starting worklist, not a coverage claim.")
    print(f"#   {len(rows)} disagreements; {len(cat)} actions in the backend catalogue\n")
    order = {"gate-narrower": 0, "gate-silent": 1}
    for r in sorted(rows, key=lambda r: (order.get(r["verdict"], 9), r["permission"])):
        print(f"[{r['verdict']}] {r['permission']}  ->  {r['section']}")
        print(f"    backend requires : {r['backend']}")
        print(f"    frontend gate    : {r['gate']}   (also: {r['flags']})")
        print(f"    probe            : {r['probe']}")
        print(f"    pass criterion   : the section is reachable and its controls act; "
              f"a 4xx behind a working control is a separate finding\n")
    if no_surface:
        print(f"[no-admin-surface] documented at a scope the admin area does not host "
              f"({len(no_surface)}) — verify in that scope's own settings, not here:")
        for n in sorted(set(no_surface)):
            print("    " + n)
        print()
    print(f"[no-documented-endpoint] in the backend catalogue, but no operation description "
          f"names them ({len(unreachable)}). NOT the same as unreachable — most are offered")
    print(f"    in the Create-role UI and simply undocumented in openapi.json. Genuine")
    print(f"    'declared but no UI offers it' cases (workspace.delete is the known one) have")
    print(f"    to be established against the product, by enumerating the Create-role")
    print(f"    checkboxes at each scope — walk each input[type=checkbox] up to its own label,")
    print(f"    since sweeping label nodes also collects 'Filter settings', 'Role name' and 'MEMBER'.")
    print("    " + ", ".join(unreachable))
    cp = coupled(sha, gates)
    print(f"\n[coupled] a section gated on one layer whose contents are read from another "
          f"({len(cp)}).")
    print("    Source cannot tell you whether the coupling actually disables anything on this")
    print("    build — open the section holding ONLY its gating permission and enumerate")
    print("    control disabled state. A panel that no longer shows load errors is not")
    print("    evidence it was fixed.")
    for c in cp:
        print(f"    {c['section']}: gated at {', '.join(c['gate_layers'])} but reads "
              f"{', '.join(c['read_layers'])} via {', '.join(c['reads'])}")
        for fl in c["flags"]:
            print(f"        foreign disable flag -> {fl}")


if __name__ == "__main__":
    main()
