# AIRION QA — 2026-08-26 — lane D — verification pass over `aloqa-org-qa-2026-08-26-D.html`

Target report: `reports/aloqa-org-qa-2026-08-26-D.html`
Artifact: https://claude.ai/code/artifact/e06bbce5-9055-4a33-bda9-d59c46022e07
Original session log: `logs/AIRION-QA-2026-08-26-D-org.md` (present and detailed — full provenance available)

Report build: `v0-61-0-rc-3-15da3ead76e1` (tag `v0.61.0-rc.3`, FE commit `15da3ead76e1`)
Verify build: `v0-61-0-rc-4-b117816aa788` (tag `v0.61.0-rc.4`, FE commit `b117816aa788`)

Lane D. Browsers: owner 9256 (all four findings are owner-side), bob 9253 if the member branch is needed.

## Phase 2 — build comparison

Range `15da3ead76e1..b117816aa788` = **7 commits**:
```
b117816aa chore(staging): admit v0.61.0-rc.4 from develop
3d54dcafb docs(calls): record why a pin cannot raise video quality (#2797)
4e6684042 chore(tooling): stop format:check reading built Storybook (ALK-3496)
5fae0c222 fix(release): reset staging and its host before a new train's rc.1 (ALK-3201)
95a7026d2 fix(calls): keep side-room occupants in the main call and badge them by focus (ALK-3479)
7cd290506 perf(web): publish the current normalized baseline (ALK-3421)
4fc8e7c39 refactor(ui): give empty, error and notice states two primitives (ALK-3464)
```

**Nothing in range fixes any of the four findings.** Only one commit touches the settings tree at all
(`4fc8e7c39`), and its settings-side change is cosmetic:
```
apps/web/src/features/settings/SettingsPageStateMessage.tsx
apps/web/src/features/settings/admin/company-roles/CompanyRolesAccessNotice.tsx   Text -> StateBanner
packages/core/src/i18n/dictionaries/{en,ru,uz,uz-cyrl}.ts
```
The i18n diff in range adds exactly one key, `api.error.calls.notInSideRoom` — nothing for permissions.
`grep audit.view packages/core/src/i18n/dictionaries/en.ts` → **no match** on the current build, so the
missing label of finding 3 is still missing in source. No audit-log component and no workspace-settings
component changed in range.

Consequence for this pass: **a failure to reproduce is a challenge to the original measurement, not a fix.**
There is no commit to explain one away.

## Current state (final)

Pass complete. 4 findings challenged, 4 confirmed, 0 removed. Report corrected and republished to the
same artifact URL (`e06bbce5-…`); `reports/README.md` row updated in place, not appended.
Prose after editing: 177 / 108 / 49 / 63 words. Leak grep clean. HTML tag balance checked.
Fixtures: probe role created and deleted, nothing else written.

## Findings under verification

| # | severity | area | claim | verdict |
|---|---|---|---|---|
| 1 | High | frontend | Audit log renders only workspace-scope events; company-scope `role.created`/`role.deleted` never shown | **CONFIRMED** — mechanism corrected (page never fetches the company log) |
| 2 | Medium | frontend | Workspace owner: `Leave workspace` disabled, hint demands an ownership transfer that exists nowhere in UI or API | **CONFIRMED** — unchanged, triage pointer added |
| 3 | Low | frontend | Role editor lists one permission as the raw key `audit.view` | **CONFIRMED** — label counts corrected 16/14 → 11/9 |
| 4 | Low | frontend | `Workspace identity` subtitle promises URL + default channel fields that are not rendered | **CONFIRMED** — exact match, no correction |

---

## Phase 3–4 — verdicts

Owner browser 9256 (`qa.d.owner@`, `visibilityState: visible`, unthrottled), bob 9253 for the member branch.
Every finding run at least twice, the second time from a different entry point.

### Finding 1 — CONFIRMED as a defect, **mechanism in the report is wrong**

**The defect reproduces.** Report's own repro, run through the UI: created a company role
(`POST /api/v1/companies/{co}/roles` 200), deleted it via the row's `Delete` → `Delete role?` confirm.
```
company audit log    9 -> 11 entries   (fresh role.created + role.deleted at the TOP of the list)
workspace audit log  5  -> 5
rendered on screen   5 rows            invite.revoked / workspace.member_removed /
                                       workspace.member_joined / invite.accepted / invite.created
role.* events on screen: 0
```
Pagination ruled out: `Next` is `disabled` — one page only — and the two newest company events sit
first in the company log, so they would head page 1 if that log were the source. Page controls:
`Export CSV`, `Export JSON`, `Previous`, `Next` — no filters.

Endpoint behaviour re-measured:
```
GET /workspaces/{ws}/admin/audit-log?limit=100                    200  5   scopes: [workspace]
GET /workspaces/{ws}/admin/audit-log?limit=100&scope_type=company 400      COMMON_INVALID_INPUT
                                                                           invalid query parameter "scope_type"
GET /companies/{co}/admin/audit-log?limit=100                     200  11  scopes: [company, workspace]
GET /companies/{co}/admin/audit-log?limit=100&scope_type=company  200  6   scopes: [company]
```

**What the report gets wrong.** It states the page fetches both logs and renders only one:
*«сервер эти события пишет, и страница их уже загружает — при открытии она делает оба запроса,
но выводит результат только одного»*, with a measurement block marking the workspace GET `<- выводится`
next to a company GET. **The page never requests the company log.** Clean capture — listener attached
before navigation and detached *before* any probe of my own — twice, identical:
```
API requests on a cold load of the audit-log page (22 total), audit ones:
  GET /api/v1/workspaces/W…/admin/audit-log?limit=100      <- the only audit request
companyAuditRequested:   false
workspaceAuditRequested: true
```
The original "both requests" observation is a **probe artifact**: the snippet called both endpoints
itself with `fetch` from inside the page while its own `response` listener was still attached, so its
two probe calls were recorded as page traffic. My first run of this pass reproduced the same artifact
before I caught it.

Source confirms the clean reading:
```
packages/core/src/api/routes.ts:172        auditLog: '/workspaces/:wsId/admin/audit-log'   (the only audit route)
packages/core/src/state/queries/admin.ts   useAdminAuditLog(workspaceId) -> listAdminAuditLog(client, workspaceId)
apps/web/src/features/settings/admin/AdminAuditLogSettingsPanel.tsx    wired by { wsId } only
```
The company endpoint exists in the generated client (`packages/core/src/api/generated/_generated.ts:1024`)
and has no route constant and no caller on this screen.

**Also worth adding, not in the report:** `Export CSV` / `Export JSON` are workspace-scoped too —
`useAdminAuditLogSettingsPanel` calls `fetchAllAdminAuditLog(client, wsId)`, walking every page of the
*workspace* log. So exporting does not recover the company events either; there is no workaround.

**Verdict: keep, High, frontend — rewrite the Фактический результат block.** The fix is not "render the
payload you already have" but "call the company endpoint (or give the workspace one a company scope)".
Publishing the wrong mechanism would send a developer looking for a discarded response that does not exist.

### Finding 2 — CONFIRMED, unchanged; root-cause pointer added

```
owner:  Leave workspace  disabled=true   hint "Transfer workspace ownership before leaving."
member: Leave workspace  disabled=false  hint "Remove yourself from this workspace and clear its local workspace state."
```
Absence re-proven by enumeration on three surfaces, second run reached by clicking the settings nav
rather than by URL:
```
Settings → Workspace, General      21 controls  (17 nav + General + Roles + Upload image + Leave workspace[disabled])
Settings → Workspace, Roles        32 controls  (Create role / Edit / Delete / Assign role / Remove … from …)
Settings → Admin → Workspaces      21 controls  (Create workspace / Open … / Edit … / Show storage)
matches for transfer|ownership|delete workspace: []  on all three
```
The report's control counts (21 and 21) match mine exactly.

API: 235 paths in the generated contract, **zero** matching `transfer` or `owner`.
`/api/v1/workspaces/{workspace_id}` exposes `get` and `patch` only — no `delete`.

**New, worth putting in the ticket.** The backend gate is real and deliberate:
`platform/pkg/apperror/keys.go:326` — `OrgWorkspaceLeaveOwner` … *«владелец не может выйти из своего
workspace: workspace остался бы без управляющего. **FE предлагает удалить workspace.**»* So the
backend's own contract says the frontend is meant to offer **deleting** the workspace as the way out,
not transferring ownership. The UI offers neither, and no delete endpoint exists. The only ownership
transfer in the backend is automatic, inside the company-kick path
(`kick_repository/kick_company.go:209 transferOwnedWorkspaces`, audit action `workspace.owner_transferred`) —
never reachable by the owner.

**Verdict: keep, Medium, frontend.** Conclusion and every published measurement hold.

### Finding 3 — CONFIRMED, **counts in the measurement block are wrong**

`audit.view` is present in both scopes, in exactly the positions the report gives:
```
company   … Bypass member privacy restrictions (DMs and invitations) /
            Manage your own privacy restrictions (DMs and invitations) /
            audit.view / All company permissions
workspace … View workspace roles / Manage workspace roles and assign them to members /
            audit.view / All workspace permissions
raw-key filter over the labels: ["audit.view"] in both
```
The report says **16** company labels and **14** workspace labels. The real permission counts are
**11** and **9** — verified three ways (checkbox nodes 11/9, `input[type=checkbox]` indices 3–13 = 11,
and the text of the `Permissions` section itself). The 16/14 come from counting `label` elements, which
on this page also include five non-permissions:
```
label nodes, company (16) = 11 permissions + Filter settings, Role name, Description, MEMBER, ROLE
label nodes, workspace (14) =  9 permissions + the same five
```
The original session log contains both numbers — its first block enumerates exactly 11 permissions, and
a later re-verification records "16 labels". The wrong one reached the report.

`grep audit.view packages/core/src/i18n/dictionaries/en.ts` → no match: the key has no label in source
on the current build either.

**Verdict: keep, Low, frontend — correct 16/14 to 11/9.**

### Finding 4 — CONFIRMED, no correction

```
subtitle: "Name, URL, and default channel for this workspace."
block:    avatar (QW) + Upload image + one "Workspace name" field
visible inputs in the content area: search "Filter settings" (sidebar) + text field value "QA Workspace D"
no URL field, no default-channel control
```
Reproduced on the owner (twice, second time via nav click) and independently on a plain member, who
sees the same subtitle. Matches the report exactly.

**Verdict: keep, Low, frontend.**

## Result

4 findings challenged, **4 confirmed, 0 removed**. No finding was a false positive and none was fixed
in range — consistent with the build comparison, which found no commit touching these surfaces.

Two corrections to make in the report, both "right conclusion, wrong detail":
1. Finding 1's mechanism — the page does **not** fetch the company log; the "both requests" line and its
   measurement block are a probe artifact and must be replaced.
2. Finding 3's label counts — 11/9, not 16/14.
Plus two optional strengtheners: the export is workspace-scoped too (finding 1), and the backend's own
error-key comment says the FE should offer workspace deletion (finding 2).

## Cleanup
Probe role `QA verify probe D` created and deleted through the UI; company roles back to
`Member / Admin / Guest`. Nothing else written.
