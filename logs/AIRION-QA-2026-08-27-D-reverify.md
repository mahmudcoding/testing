# AIRION QA — 2026-08-27 — lane D — re-verify (sector: Org · identity)

Build: `data-dpl-id="v0-61-0-rc-6-5be489db0ca6"` → tag v0.61.0-rc.6, frontend commit `5be489db0ca6`
Report under re-verification: `reports/aloqa-org-qa-2026-08-26-D-2.html` (20 findings)
Inventory: scratchpad `lane-D-findings.md`
Lane D workspace `W4QDF1XTURESO01`, company `O4QDF1XTURESO01`.

## Current state
- Fixtures verified OK. Browser: d-alice (9252) signed in as qa.d.alice@aloqa.test.
- Lane D workspace = `W4QDF1XTURESO01`. Note alice also owns a personal workspace `W4OWMGU872O1OZJ`
  ("QA Alice's workspace", created 2026-08-26 by the previous session) and the app lands there by
  default — every snippet must navigate to `W4QDF1XTURESO01` explicitly.
- **Run complete.** 19 of the 20 findings reproduce on v0.61.0-rc.6 and carry a repro snippet
  (each written from the finding's own steps and run twice, printing `"ready": true`).
- **D:12 (settings contrast, A11Y) no longer reproduces** — see its section below. No repro block.
- `python3 -c "…bench.load()…"` → 19 lane-D findings runnable.
- State left behind: none of mine. `snip/d-cleanup.mjs` removed every `QA repro D — *` role
  (company roles back to Member/Admin/Guest, workspace to Member/workspace_owner_*), the recipient
  holds only the fixture Member roles again, and `snip/d-restore-presence.mjs` put carol's
  Online status back to `Workspace members` (`online_visibility: "workspace"`).
  Two things deliberately left: one **pending direct invite** to qa.d.outsider (that is the state
  D:14 needs) and the **company logo** replaced during the D:8 measurement — the product offers no
  way to remove it (`DELETE /companies/{co}/avatar → 405`), and it was already a test image from
  the previous session.

### Environment notes worth keeping
- **The scratchpad root is shared between the five lane sessions.** A helper written there as
  `addrepro.py` was overwritten by another lane mid-run (it came back pointing at lane A's
  report). Lane-scoped path used instead: `scratchpad/D/d-addrepro.py`. Same rule as `snip/`.
- No live "my permissions" endpoint: `/users/me/permissions`, `/users/me/my-permissions`,
  `/companies/{co}/my-permissions`, `/workspaces/{ws}/my-permissions` all 404, `/users/me/roles`
  400. The readable source of an account's live permissions is
  `GET /api/v1/companies/{co}/members` and `GET /api/v1/workspaces/{ws}/members` — each member
  row carries `roles[]` with the permission strings. Snippets assert from there.
- Company **owner** holds only `Member:company.<CO>.member.view` as a *role*; the power comes from
  being `owner_id` on the company. The dashboard shows "Your role: Owner".
- Starting state of lane D today: alice and bob and carol are plain Members at both layers
  (company `member.view`, workspace `channel.create`+`channels.view`). No leftover probe roles.

## Progress table

| # | id | title (short) | reproduced? | snippet |
|---|----|---------------|-------------|---------|
| 7 | D:6 | Sidebar position Right | YES | d-sidebar-right.mjs |
| 8 | D:7 | 5 Appearance settings revert on reload | YES | d-appear-revert.mjs |
| 6 | D:5 | 7 profile fields invisible to colleagues | YES | d-profile-fields.mjs |
| 10 | D:9 | Audit log raw keys + raw JSON | YES | d-audit-raw.mjs |
| 11 | D:10 | "My storage" vs "shared by everyone" | YES | d-storage-label.mjs |
| 12 | D:11 | Unsaved settings edits lost silently | YES | d-unsaved-lost.mjs |
| 19 | D:18 | Four subtitles promise absent content | YES | d-admin-subtitles.mjs |
| 16 | D:15 | Notifications refusal names a non-existent condition | YES | d-notif-message.mjs |
| 20 | D:19 | Uzbek month renders as M08 | YES | d-uz-month.mjs |
| 9 | D:8 | Company logo replaced on file choice | YES | d-company-logo.mjs |
| 14 | D:13 | Invite without a role shows "Role unavailable" | YES | d-invite-norole.mjs |
| 15 | D:14 | Caption promises in-app accept; no action exists | YES | d-invite-inbox.mjs |
| 5 | D:4 | Two presence controls disagree | YES | d-presence-split.mjs |
| 17 | D:16 | Sessions screen offers nothing with one session | YES | d-sessions-single.mjs |
| 18 | D:17 | /company/create has no way off it | YES | d-company-create-exit.mjs |
| 13 | D:12 | Settings secondary text below AA | **NO — fixed on rc.6** | — |
| 1 | D:0 | Invite permission, every control disabled | YES | d-invite-perm.mjs |
| 2 | D:1 | Company audit.view does not open the log | YES | d-audit-perm.mjs |
| 3 | D:2 | role.manage does not open the Roles screen | YES | d-roles-perm.mjs |
| 4 | D:3 | Remove offered on the company owner | YES | d-kick-owner.mjs |

## Findings

### D:6 — Sidebar position → Right (CONFIRMED on v0.61.0-rc.6)
Set Right on Settings → Appearance. Radio `Right aria-checked=true`, `localStorage aloqa.appearance
.sidebarSide = "right"`, cookie `aloqa.sidebar=right`. Channel page `/w/W4QDF1XTURESO01/c/C4QDGENERAL0001`
at innerWidth 1920:
```
nav   x=0   right=72    w=72
aside x=72  right=372   w=300
main  x=372 right=1920  w=1548
```
Identical to the report's Left geometry. Snippet: `d-sidebar-right.mjs`.

### D:7 — five Appearance settings revert on reload (CONFIRMED)
Message layout Standard→Compact, Show member roles on→off; Density→Compact as the control.
After reload the two revert on screen while `aloqa.appearance` keeps `msgLayout:"compact"`,
`showRoles:false`; Density stays Compact.

Extra detail found while building the snippet, worth knowing (not a new finding — it is the same
desync seen from the other side): because the screen renders from the store and the store
short-circuits on an equal value, a control whose stored value already equals the value you click
does **not** move on screen. After a reload that left `msgLayout:"compact"` with `Standard` shown,
clicking `Compact` is a visible no-op; you must click `Standard` first. The snippet converges
through the other option for exactly this reason.

### D:9 — audit log raw keys (CONFIRMED)
Owner, Settings → Admin → Audit log: 99 rows, 10 distinct ACTION values, all raw dotted keys —
`role.deleted role.revoked role.assigned role.created role.updated invite.created invite.revoked
invite.accepted workspace.member_joined workspace.member_removed`. 96 of 99 METADATA cells are raw
JSON. Headers ACTION/ACTOR/TARGET/CREATED/METADATA and the CREATED column are formatted.

### D:10 — storage block label (CONFIRMED)
Settings → Admin → Workspaces → Show storage, one block, lines in order:
```
My storage in this workspace
0 B of 10 GB used
Call recordings storage
0 B of 30 GB used · 30 GB free
Storage is shared by everyone in this workspace.
```
`GET /api/v1/workspaces/W4QDF1XTURESO01/storage -> 200 {"quota_bytes":10737418240,"used_bytes":0,…}`

### D:18 — four subtitles (CONFIRMED, all four)
```
admin/workspaces          "Every workspace in this company, and who may open it."
admin/company (Overview)  "One view of this company's people, workspaces and recent activity."
about                     "Version, licences and where to get help."       (0 links in content area)
security                  "Your password, two-factor authentication and encryption keys."
```
Page bodies unchanged from the report; About now reads `Version v0.61.0-rc.6`.

### D:5 — seven profile fields invisible (CONFIRMED)
Alice saved jobTitle/department/pronouns/showTimezone via `PUT /auth/me/settings` and
phone/linkedin/github/website; all read back after reload. Her card opened by the owner
(Directories → People → click "QA Alice"):
```
QA Alice / QA / QA Alice / QA control status / Message Call Block Share / SHARED CHANNELS · 2
buttons: Close profile, Message, Call, Block, Share, qa-general, qa-private
```
Name + Status message only. No local time despite showTimezone=true.

### D:11 — unsaved settings edits lost (CONFIRMED)
Display name "QA Alice" → "QA Alice EDITED", `1 unsaved change` + Discard / Save profile on screen.
Click Appearance in the settings nav: `[role=dialog]` 0, no browser confirmation, panel gone.
Back on Profile: field reads "QA Alice", no save panel. A cancelable `beforeunload` dispatched by
hand is not cancelled by anyone, so no handler is registered either.

### D:15 — Notifications refusal text (CONFIRMED)
Alice, In-app notifications off + Save preferences. Inline, persistent (polled 300 ms for 12 s,
present in every sample):
```
In-app notifications cannot be turned off while no other delivery method is enabled.
Keep them on and try again.
```
Exactly three switches on the page: In-app notifications · Mute channel notifications ·
Mute direct messages from unknown people. Server keeps in_app_enabled=true, save panel stays.

### D:19 — Uzbek month code (CONFIRMED)
Owner, language Uzbek, Settings → Admin → Audit log: `htmlLang="uz"`, headers translated
(AMAL / BAJARUVCHI / NISHON / YARATILGAN / METAMAʼLUMOT), **99 of 99** CREATED dates render as
`2026 M08 27 07:38`. In-browser: `Intl.DateTimeFormat('uz',{month:'long'})` → `M08`,
`uz-Latn` → `M08`, `uz-Cyrl` → `август`, `ru` → `август`.
Snippet note: the language picker's own aria-label and the four option labels are localized
("Til", "Inglizcha", "Oʻzbekcha"), so a second run cannot match them by English text. The snippet
takes `main button[aria-haspopup="dialog"]`, asserts the dialog lists exactly four options and
picks by position, then verifies `<html lang>`. `snip/d-lang-en.mjs` puts a browser back on English.

### D:8 — company logo (CONFIRMED)
Owner, Settings → Company, `input[type=file]` set with a 1-byte PNG, state polled every 200 ms from
before the choice for 6 s: `[role=dialog]` max 0, no Save/Discard/Apply button ever, and
`GET /companies/O4QDF1XTURESO01` avatar_url went `/public/501d9332-…` → `/public/c64a7029-…`.
No remove control: "remove"/"delete" absent from the page text, `DELETE /companies/{co}/avatar → 405
COMMON_METHOD_NOT_ALLOWED`.
One qualification on the report's wording: my poller counted 2 `[role=status]`/`[role=alert]` nodes,
which are the sr-only live regions — no visible toast, so the finding stands, but "уведомлений: нет"
is a claim about *visible* notices, not about role-carrying nodes.

### D:13 — invite without a role (CONFIRMED)
Owner, Settings → Admin → Invites, recipient + "Invite without a role" → Send. New history row:
```
QA Outsider (@qa_d_outsider)  Pending  Role unavailable  Sep 3, 2026, 1:19 PM  Resend invite Revoke invite
```
Control row already in the same table: `… Revoked  Member  Sep 2, 2026, 4:34 PM`.
`GET /workspaces/{ws}/invites/direct` row keys: id, workspace_id, workspace_name, company_id,
company_name, invited_by_name, recipient_user_id, invited_by, status, expires_at, created_at —
no `role_ids` at all. The same "Role unavailable" string also fills the ROLES column of the
Invite links table above it.

### D:14 — in-app invite has no action (CONFIRMED)
Sender caption, verbatim: `Email delivery may be delayed. The invitation also appears in the
recipient's in-app inbox.` Recipient (qa.d.outsider), button aria-label
`Open workspace menu. Pending workspace invites: 1`; the PENDING INVITES `SECTION`:
```
PENDING INVITES / QA Workspace D / QA Fixtures D / Invited by QA Owner
Expires Sep 3, 2026, 1:19 PM / Use the invite link from your email to accept or decline.
```
interactive descendants (button, a, input, select, textarea, role=button|link|menuitem|checkbox|
switch|option|tab, onclick, tabIndex>=0, cursor:pointer): **0**.
Selector trap worth recording: the round workspace button at the top-left of the rail carries
`aria-label="Personal workspace"` and is a *different* control that never opens anything
(`data-state` stays "closed" through Playwright click and real mouse events). The menu is a second
button at almost the same coordinates, `aria-label="Open workspace menu. Pending workspace invites: N"`.
Three attempts were lost to that before enumerating everything in the top-left corner by geometry.

### Housekeeping
`snip/d-revoke-pending.mjs` clicked six enabled "Revoke invite" buttons and the pending count stayed
1 — there is probably a confirmation step it does not answer. Left as is: one pending direct invite
to qa.d.outsider is exactly the state D:14 needs.

### D:16 — Sessions with one session (CONFIRMED, after fixing the precondition)
qa.d.carol arrived with **2** sessions — exactly the trap CLAUDE.md warns about, and with two the
screen legitimately shows two buttons. Reduced to one via "Sign out other sessions", then:
```
GET /api/v1/security/sessions -> 200, 1 record
title "Active sessions"
subtitle "Every device signed in to this account, and how to sign one out."
interactive elements in the content area: 0
row: Unknown device | Mozilla/5.0 (Macintosh…) · <IP> | 1 minute ago | Current session
```
The snippet reduces to one session itself and refuses to report ready otherwise.

### D:4 — two presence controls disagree (CONFIRMED)
carol, Settings → Privacy & security → Visibility. Section caption unchanged:
`These preferences are saved, but they do not change what others can see yet.`
Five controls in the section: 3 comboboxes (Profile visibility / Online status / Last seen) and
2 switches (Read receipts / Show online status).
Online status → Nobody: `auth/me` `settings.privacy.online_visibility = "nobody"`, while the
`Show online status` switch stays `aria-checked="true"` and `GET /users/me/presence-settings`
stays `{"hide_presence": false}`. Observer side, from the owner's session at the same moment:
`GET /api/v1/workspaces/W4QDF1XTURESO01/presence` → `{"user_id":"U4QDCAROL000001","online":true}`.

### D:17 — /company/create has no way off (CONFIRMED)
Reached through the UI: Settings → Company → "Switch company" → "Create a company".
Whole document (no landmark to scope to): 2 interactive elements —
`INPUT[text] placeholder 'e.g. "Aloqa Inc"'` and `BUTTON[submit] "Create" DISABLED`.
headings 0; `main:0 nav:0 header:0 footer:0 [role=main]:0`.
Page text: `Create a company | Name | Use 2 to 128 characters. | Create`.

### D:12 — settings contrast — **NO LONGER REPRODUCES on v0.61.0-rc.6**
The report's own triage predicted this: commit 30bda8c24 (ALK-3579) existed in develop but had not
reached staging. It has now shipped. `--color-text3` measured on the running build:
```
light  #666d7c            (was #8a95a3)
dark   #ffffff8f  α 0.56  (was rgba(255,255,255,0.36))
```
Settings navigation group headings, Settings → Admin → Members, 14.03px:
```
light  rgb(102,109,124) on rgb(247,248,250)   4.89:1   (threshold 4.5)
dark   rgba(255,255,255,0.56) on rgb(34,39,49) 5.71:1
```
Swept 8 settings routes in both themes, 1522 visible leaf text nodes each:
**light 0 nodes below AA, dark 7** — and none of the 7 is the secondary-text token: 5 are
`rgb(36,84,216)` (the accent) and 2 white on a coloured ground. The report's claim was 91 nodes of
the secondary colour in each theme; that is gone.
Positive control for the instrument: the same measurer *does* report failures (the 7 in dark), so a
zero in light is a measurement, not a broken probe. Instrument kept as
`snip/d-contrast-measure.mjs`; the residual 7 belong to other open tickets the report names
(ALK-3498 for text-success, etc.) and are not this finding.

### D:0 — invite permission, all controls disabled (CONFIRMED)
carol holding only `workspace.<WS>.invite` (plus the fixture Member role), Settings → Admin → Invites:
```
BUTTON[combobox] "Role"                    disabled=true
INPUT[number]    "Unlimited"               disabled=true
BUTTON[submit]   "Create invite link"      disabled=true
INPUT[search]    "Search company members"  disabled=true
INPUT[checkbox]  (recipient)               disabled=true
INPUT[checkbox]  (Invite without a role)   disabled=true
INPUT[number]    "7"                       disabled=true
BUTTON[submit]   "Send direct invites"     disabled=true
BUTTON "Resend invite"  disabled=false
BUTTON "Revoke invite"  disabled=false
on screen: "You need permission to view roles before assigning them."
```
Same session: `POST /api/v1/workspaces/invites {"workspace_id":"<WS>"} -> 200` with a real token.

### D:1 — company audit.view does not open the log (CONFIRMED)
carol holding only `company.<CO>.audit.view`. ADMIN group of the settings nav contains
`Company dashboard, Members` — no Audit log. `/settings/admin/audit-log` opened directly:
0 interactive elements in the content area and
`Admin access required — You do not have permission to view the audit log. A workspace owner or an
administrator can grant this access.` Same session, two requests diverging:
```
GET /api/v1/companies/<CO>/admin/audit-log?limit=3   -> 200  {"entries":[…]}
GET /api/v1/workspaces/<WS>/admin/audit-log?limit=3  -> 403  COMMON_PERMISSION_DENIED
```

### D:2 — role.manage does not open the Roles screen (CONFIRMED, one count corrected)
carol holding only `company.<CO>.role.manage`, Settings → Roles ?scope=company:
`Admin access required — You do not have permission to view company roles. A company owner or an
administrator can grant this access.` Same session:
```
GET    /api/v1/companies/<CO>/roles        -> 403 COMMON_PERMISSION_DENIED
POST   /api/v1/companies/<CO>/roles        -> 200  role created
DELETE /api/v1/companies/roles/<newId>     -> 403 COMMON_PERMISSION_DENIED
```
**Correction to the report's wording:** it says «интерактивных элементов в области содержимого: 0».
Measured now there are **2** — the two scope tabs, `A "Company roles"` and `A "Workspace roles"`.
They are the page's own tab strip, so the substance (no role list, no create form, nothing to act
with) is unchanged; the number as written is wrong unless the reader knows the tabs were excluded.
Worth a one-word fix if the finding is ever edited: "0 apart from the two scope tabs".

### D:3 — Remove offered on the company owner (CONFIRMED)
carol holding only `company.<CO>.member.kick`, Settings → Admin → Members: 8 Remove buttons,
0 disabled, including the owner's row
`QO | QA Owner | qa_d_owner | Member | Aug 25, 2026, 8:20 PM | Remove`.
Dialog: `Remove member | Remove QA Owner from the company? They lose access to every workspace in
this company. | Cancel | Remove member`. After confirming:
```
POST /api/v1/companies/kick -> 400
{"code":400,"key":"ORG_KICK_COMPANY_OWNER",
 "message":"company owner cannot be kicked from the company","trace_id":"<TRACE>"}
on screen: "Could not remove the member. Try again."
company members after: 8 (unchanged)
```

### Report file
`reports/aloqa-org-qa-2026-08-26-D-2.html` — 19 repro blocks added, **114 insertions, 0 deletions**
(`git diff --stat`), 20 articles intact.
`scripts/verify_report.py` reports one failure, `TITLE/ROW TEXT MISMATCH at [1, 2, 4, 5, 14]`.
**It is pre-existing** — the same failure comes out of `git show HEAD:<report>` — and it is
cosmetic: those five summary-table rows carry a longer wording than their `<h2>`
(row 1 «…неактивны все восемь элементов управления» vs h2 «…неактивны все элементы управления»).
Position, severity and area agree for all 20 ("row/article chips: agree for all 20"), so it is not a
substitution or an ordering error. Left alone: editing article text was not part of this pass.

### Snippet inventory (all lane-D prefixed, all in `scripts/callrig/snip/`)
Repro: `d-invite-perm d-audit-perm d-roles-perm d-kick-owner d-presence-split d-profile-fields
d-sidebar-right d-appear-revert d-company-logo d-audit-raw d-storage-label d-unsaved-lost
d-invite-norole d-invite-inbox d-notif-message d-sessions-single d-company-create-exit
d-admin-subtitles d-uz-month`.
Support (not repro): `d-rolekit.mjs` (role create/assign/cleanup + live-permission read, imported by
the four permission snippets), `d-cleanup.mjs`, `d-restore-presence.mjs`, `d-lang-en.mjs`,
`d-revoke-pending.mjs`, `d-contrast-measure.mjs`.
No shared helper (`lib.mjs`, `api.mjs`, `login.mjs`, `drive.mjs`) was touched.
