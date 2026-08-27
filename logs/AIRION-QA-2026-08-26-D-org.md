# AIRION QA — 2026-08-26 — lane D — sector D (Org, identity & settings)

- **Sector D on lane D** (prompt `/run-until +1h D` → sector D, lane D).
- **Staging build (frontend):** `data-dpl-id="v0-61-0-rc-3-15da3ead76e1"` → tag `v0.61.0-rc.3`, commit `15da3ead76e1`.
- Lane D workspace `W4QDF1XTURESO01`, company `O4QDF1XTURESO01`.
- Browsers: owner 9256, bob 9253, outsider 9259.
- Timebox: 10:44 → 11:44 +05.

## Current state
Superseded — see **Current state (final)** at the end of this log.

---

### BUG-1 [High] [frontend] Audit log shows only workspace events — role and permission changes never appear, though the page claims to cover the company

**Where:** Settings → Admin → Audit log (`/w/{ws}/settings/admin/audit-log`), as company owner.
Page subtitle: `A record of the administrative actions taken in this company.`

**Repro:** as company owner (a) Settings → Roles → Company roles → create a role, then delete it; (b) Settings → Admin → Invites → create an invite link and let someone use it, then remove that member. Open Settings → Admin → Audit log.

**Measured.** The page loads only the workspace log; the company log fetched separately shows what is missing:
```
GET /api/v1/workspaces/{ws}/admin/audit-log?limit=100   200  4 entries   <- what the page requests and renders
GET /api/v1/companies/{co}/admin/audit-log?limit=100    200  6 entries   <- fetched by hand; the page never asks for it
```
company log (6):   workspace.member_removed [workspace], workspace.member_joined [workspace],
                   invite.accepted [workspace], invite.created [workspace],
                   role.deleted [company], role.created [company]
workspace log (4): the four [workspace] ones only
rendered rows (4): workspace.member_removed / workspace.member_joined / invite.accepted / invite.created

`inCompanyButNotWorkspace` = **role.created, role.deleted** — the two `scope_type: company` events. Neither reaches the screen.

So every company-scope event — who created, edited, deleted a role, and who was granted or stripped of permissions — is recorded by the backend and never shown, because the page requests only the workspace-scoped log. The screen presents a partial log as if it were the company record. Where the company has had *only* company-scope activity the page reads `No audit entries found.` outright, which is how this was first spotted.

**Как должно быть:** журнал показывает и события уровня компании (роли и права), раз страница объявлена журналом компании.

**Correction to an earlier reading in this session:** first measurement suggested the page rendered nothing at all and discarded the company payload. That was the empty state: at that point only company-scope events existed. Once workspace-scope events existed the table rendered normally (with `Export CSV` / `Export JSON`). The defect is the missing company scope, not a dead page.

**Dedup:** ALK-3307 is a *Task* (Backlog) specifying exactly this page against the company endpoint — outside the Bug dedup filter, and its own context section states the motivation was that "владелец компании не мог узнать, кто кому и когда выдал полномочия". That is still true on this build. ALK-2997 (Backlog) is a different defect — a workspace admin cannot open the page at all. ALK-2242 (BLOCKED) is about member removal not being written to a workspace log.

### BUG-2 [Medium] [frontend] Workspace owner can never leave — the hint demands an ownership transfer that does not exist

**Where:** Settings → Workspace → Danger zone, as workspace owner.

**Actual:** `Leave workspace` is disabled; helper text reads `Transfer workspace ownership before leaving.`

**Absence proven by enumeration**, not by reading page text — all visible `button`/`a`/`[role=button]`/`select` nodes in `main`:
- Settings → Workspace, **General** tab (21 controls): sidebar nav ×17, `General`, `Roles`, `Upload image`, `Leave workspace` (disabled). No transfer action.
- Settings → Workspace, **Roles** tab: role rows with `Create role` / `Edit` / `Delete` / `Remove <role> from <member>` only.
- Settings → Admin → Workspaces (21 controls): `Create workspace`, `Open …`, `Edit …`, `Show storage`. No transfer action.
- API contract `apps/web/src/generated/openapi.json`: zero paths matching `transfer` or `owner`.

**Как должно быть:** подсказка называет действие, которое пользователь может выполнить.

**Dedup:** this is exactly ALK-2806, which is in **TESTING** — closed in this project's workflow, therefore not a duplicate to dedup against. It reproduces on v0.61.0-rc.3, i.e. it was closed without the text being changed. Report it and say so.

---

### BUG-3 [Low] [frontend] One permission in the role editor is shown as its internal key `audit.view`

**Where:** Settings → Roles → *Company roles* and *Workspace roles* → Create role → Permissions.

**Measured** — labels enumerated from the permission list, company scope:
```
Create workspaces in the company / View company roles / Create company roles and assign or revoke them for members /
Edit company roles / Delete company roles / View company members / Remove members from the company /
Bypass member privacy restrictions (DMs and invitations) / Manage your own privacy restrictions (DMs and invitations) /
audit.view          <-- raw key
All company permissions
```
workspace scope: same, `audit.view` sits between `Manage workspace roles and assign them to members` and `All workspace permissions`.

**Как должно быть:** право названо так же понятно, как соседние.

**Dedup:** not ALK-3111 — that one is the channel `AUTOMATIC ROLE` preview block (`useChannelDefaultRoleSettings.ts`), and it explicitly cites the *Create role* list as the correct one. This is a missing label in that correct list, on the company/workspace roles page. New permission, added with the company audit log (ALK-3307), never given a label.

---

### BUG-4 [Low] [frontend] Section subtitle promises URL and default-channel fields that are not on the page

**Where:** Settings → Workspace → Workspace identity.
**Actual:** subtitle `Name, URL, and default channel for this workspace.`; the section renders an avatar uploader and a single `Workspace name` input. No URL field, no default-channel field (input enumeration: `Filter settings` sidebar input + one text input holding the workspace name).
**Как должно быть:** подзаголовок описывает те поля, которые есть.

---

## Verified working (not reported)

- **Admin route gating for a plain member.** `settings/admin/members` → "You can view company members, but you cannot remove them" and the Remove column disappears; `admin/audit-log`, `admin/invites`, `settings/roles?scope=company` → specific, correctly-worded "Admin access required" panels. No 403 body leaked, no console errors.
- **Owner self-removal blocked.** Members table: 8 rows, 7 enabled `Remove`, the owner's own row disabled with "You cannot remove yourself from the company."
- **Company identity locked for non-owners.** Company name input `disabled=true` + "Only the company owner or a system administrator can edit the company identity."
- **Sign out other sessions.** With 2 live sessions: `DELETE /api/v1/security/sessions/{id}` → 200, list collapses to `Current session`, toast "Other sessions signed out."; the other browser's next `GET /api/v1/auth/me` → **401** and it is redirected to `/login`. Genuinely invalidated server-side.
- **Login error handling / no user enumeration.** Wrong password and a non-existent address both return the identical `Invalid email or password.`; a malformed address is caught inline with `Enter a valid email address.`
- **Workspace rename** `PATCH /api/v1/workspaces/{ws}` → 200, Save/Discard pair appears only after an edit; fixture name restored to `QA Workspace D` and confirmed via API.

## Observations not written up (below the reporting bar)

- Sessions page shows `Unknown device` for every session — already open as ALK-3005.
- With only one session, the Sessions page renders no `Sign out` control at all; the controls appear once a second session exists. Not pursued — signing out is reachable from the profile menu.
- "Sign out other sessions" takes effect with no confirmation step for a destructive action.
- No accessible name on the role-permission checkboxes, nor on the toggles in Notifications/Appearance/About (a11y).
- The login failure message is not inside a live region, so it is not announced.
- The two audit endpoints disagree in shape: company returns `{"entries":[…]}`, workspace returns a bare `[]`.
- `qa.d.outsider@` (company-only, in no workspace) lands on `/w/W4OWAY1Z8JFMM58/directories` after login — a workspace outside this lane. Not investigated; flagged for a later session.

## Cleanup
Probe role `QA temp audit probe` created and deleted (confirmed gone). Workspace name restored. Bob's second session was signed out by the test itself.

---

### Additional observation — invite link joins the workspace on load, with no confirmation

Owner created a shareable invite link (`POST /api/v1/workspaces/invites` → 200; role Member, **Unlimited** uses, expires in 7 days). A company member who was not in the workspace opened that URL once: the screen rendered `Joining workspace`, and membership was granted immediately — no Join button, no confirmation, no preview of which workspace. Verified in `org_db`:
```
select u.username from workspace_members wm join users u on u.id=wm.user_id
 where wm.workspace_id='W4QDF1XTURESO01';     -> qa_d_outsider present
```
Audit log confirms the pair `invite.accepted` then `workspace.member_joined`.

Loading the same still-valid, unlimited-use link a second time as the now-joined user showed `This invite is invalid, expired, or already used.` with a single `Back to sign in` control.

**Not reported.** The second half is ALK-3006 (Backlog, open) — an existing member being told the invite link is invalid — so it is a duplicate. The first half (no confirmation step before joining) may well be the intended one-click behaviour; there is no evidence it is unintended, so it is logged here rather than filed.

### Verified working — kick

`POST /api/v1/workspaces/kick {workspace_id, user_id}` as owner → 200 `{"kicked_at":"2026-08-26T06:02:44Z"}`; `GET /workspaces/{ws}/members` drops from 8 to 7; `workspace.member_removed` is written to both audit logs with the correct actor and target. Used to repair the fixture; `seed.sh --verify --lanes D` then reported `workspace_members: 7/7` and "All fixtures present and correct."

### Verified working — account Danger zone
Settings → Account → Danger zone states `Account deactivation and deletion are not available yet.` and both `Deactivate` and `Delete` are `disabled`. Honest disabled state, correctly explained — not a finding.

### Verified working — invites
Role picker populates (5 options: No role, Member · Workspace role, Member · Company role, Admin · Company role, Guest · Company role) — ALK-2815 (empty role list) does not reproduce here. `Create invite link` is correctly disabled until a role is chosen; `Send direct invites` stays disabled until a recipient is ticked. Direct invites correctly offer only company members who are not yet in the workspace.

## Published report
`reports/aloqa-org-qa-2026-08-26-D.html` → https://claude.ai/code/artifact/e06bbce5-9055-4a33-bda9-d59c46022e07
(pass that URL back as `url` to update in place; publishing without it creates a second artifact.)
Row appended to `reports/README.md`.

---

## Second stretch (11:05 → 11:25) — personal settings, auth, i18n

### Re-verification of the published findings
All three "absence"/label findings re-checked on freshly loaded pages, after navigating away and back and after a hard reload:
- **BUG-2** — 21 visible controls in the workspace settings content area, `transferControls` = `[]`. Danger-zone text unchanged. Holds.
- **BUG-3** — raw-key filter over the permission labels returns `["audit.view"]` in both company and workspace scope. Holds — but see the correction below: my label counts (16 / 14) were wrong, the real permission counts are 11 and 9.
- **BUG-4** — subtitle `Name, URL, and default channel for this workspace.` with exactly two visible inputs: the sidebar `Filter settings` search and the unlabelled workspace-name text field. Holds.

### Verified working — forgot password, no account enumeration
`/forgot-password`: a known address and `definitely-not-a-user-9x7@aloqa.test` both land on the identical screen — `Check your email — If an account exists for that email, we have sent a link to reset your password.` with only `Back to sign in`. No difference in wording, controls or timing between the two.

### Verified working — 2FA setup flow
Settings → Security → `Enable` → `POST /api/v1/security/2fa/enable` → 200, and an inline confirm step appears: a code field (placeholder `123456`), `Resend code`, `Cancel`, and `Confirm` disabled until a code is entered. Copy states the second factor arrives by email. Navigating away and reloading discards the pending setup — the page reads `Two-factor authentication is off.` again, so a half-finished enable does not strand the account.

### Verified working — Russian localisation of the settings area
Switched the interface to Russian and swept seven pages (account, privacy, security, sessions, notifications, about, workspace). No leftover English sentences anywhere (`leftovers` empty on all seven). Remaining Latin characters are data, not copy: user-agent strings on Sessions (64), the version string, the workspace name. The language menu itself localises too (`Английский / Русский / Узбекский / Узбекский (кириллица)`). Restored to English afterwards and confirmed (0 Cyrillic characters on the account page).

### Not defects — honestly disabled features
- Settings → Account → Danger zone: `Account deactivation and deletion are not available yet.`, both buttons `disabled`.
- Settings → Privacy → `Request export`: `disabled`, description `This feature is not available yet.`
- Settings → Privacy → `Block`: `disabled` until a participant is picked in the adjacent search field. Correct gating.

### Observation, logged not reported — visibility preferences save but have no effect
Settings → Privacy → **Visibility** states: `These preferences are saved, but they do not change what others can see yet.` The three controls under it (`Profile visibility`, `Online status`, `Last seen`) are nevertheless **enabled** and persist a chosen value, unlike the other unfinished features on the same screen, which are disabled. A user who sets `Profile visibility` and does not read the section subtitle will believe they have restricted it.

Not written up: the behaviour is disclosed in the section's own subtitle, which is the same standard applied to `Request export` and the account Danger zone above. Flagging it here as a judgement call for the user to overturn — the difference from those two is that these controls look and behave as though they work.

### Rig artifacts — not product defects
- `[role="option"]` matched nothing on the language picker, which first read as "no Russian option". The menu does open (256×190, `English / Russian / Uzbek / Uzbek (Cyrillic)`); its items simply are not `role="option"`. Selector artifact.
- First load of the invite landing page appeared to render a directory listing; that was the app shell behind the invite card, and the join had in fact already happened.

## Current state (final)
Sector D pass complete for the box. Report published and re-verified. Lane D fixtures verified clean at the end of the run (`workspace_members: 7/7`, bob back on English, 2FA off, probe role deleted, workspace name restored).

**Not covered in this box** — magic-link sign-in, reset-password link redemption, signup and onboarding (name/company), email verification, invite-accept for a brand-new user, blocked users list behaviour, notification settings behaviour (only the page was swept), company avatar upload, `Create workspace`, audit-log CSV/JSON export and its filters.

### BUG-1 strengthened — no filter reaches the company events, and the workspace source cannot serve them
Re-ran with a third company-scope event (`role.created` for a probe role, deleted afterwards):
```
company log   6 -> 7 entries
workspace log 4 -> 4 entries
rendered rows          4  (unchanged: member_removed / member_joined / invite.accepted / invite.created)
```
Controls enumerated on the audit-log page: `Export CSV`, `Export JSON`, `Previous`, `Next` — **no filters at all**, so nothing in the UI reaches company-scope events. And the workspace source cannot serve them even if asked:
```
GET /api/v1/workspaces/{ws}/admin/audit-log?scope_type=company   400
GET /api/v1/companies/{co}/admin/audit-log?scope_type=company    200   3 entries
```
Added to the published report; republished to the same artifact URL. Probe role cleaned up.

### Verified working — magic link request, no account enumeration
`/magic-link`: `qa.d.carol@aloqa.test` and `nobody-here-4k2@aloqa.test` both land on the identical screen — `Check your email — If an account exists for that address, a sign-in link is on its way. Open it on this device to continue.` Same wording, same single control. Redemption of the link itself was not tested (no mailbox access); ALK-2930 covers what happens after redemption.

### Report trimmed to the house length guidance
`CLAUDE.md:91` sets ~120–180 words of prose per finding, measurement blocks excluded. Measured and trimmed:
```
finding 1 (audit log)            295 -> 167 words
finding 2 (workspace ownership)  125     unchanged
finding 3 (audit.view)            78     unchanged
finding 4 (identity subtitle)     87     unchanged
```
Cut from finding 1: the restatement of why an audit log matters, the speculation about what the owner concludes, and a sentence repeating numbers already present in the code block. Measurement blocks untouched. Republished to the same artifact URL.

---

### WITHDRAWN — "Notification toggles are not saved" (was briefly BUG-5 in the report)

**Claimed:** all three toggles on `Settings → Notifications` flip but never persist — no non-GET request, no Save button, everything reverts on reload. It was written up and published, then withdrawn ~10 minutes later.

**What killed it.** The same finding was already withdrawn as a false positive by the 25.08 recheck session (`logs/AIRION-QA-2026-08-25-C-challenge.md`, "BUG-1 — FALSE POSITIVE"): a `Discard` / `Save preferences` panel exists, but only once the form is dirty. Re-measured here, enumerating buttons **while dirty** rather than after a reload:
```
buttons, clean form:  … Search (nav only) — no save/discard
click "In-app notifications"
buttons, dirty form:  … Discard | Save preferences
page text:            "1 unsaved change  Discard  Save preferences"
click Save preferences -> PATCH /api/v1/notifications/settings
```
My error was procedural, not observational: the button enumeration in `d-notif2.mjs` ran **after** `page.reload()`, i.e. against a clean form where the panel correctly does not exist. The toggles reverting was simply an unsaved form being discarded. Both prior measurements were accurate and the conclusion drawn from them was wrong.

Cost: one bad finding published for ~10 minutes. Caught because the recheck report's summary line in `reports/README.md` named "BUG-1 настройки уведомлений" among its false positives — reading that line before publishing would have caught it sooner.

**Loose end — RESOLVED in this session, no defect.** Re-measured cleanly, toggling a single switch and capturing the PATCH payload and response:
```
apiBefore                {"in_app_enabled":true,"mute_all_channels":false,"mute_unknown_dm_users":false,"do_not_disturb_enabled":false}
toggle "Mute channel notifications", Save preferences
request   PATCH /api/v1/notifications/settings   {"mute_all_channels":true}
response  200                                    {... "mute_all_channels":true ...}
apiAfterSave                                     mute_all_channels = true
reload -> apiAfterReload                         mute_all_channels = true
          uiAfterReload                          true / true / false
```
Notification settings save and persist correctly end to end. The earlier "PATCH fired but the value read back unchanged" was my own restore click in the same snippet — it toggled the switch back and saved again before the reload, so the value legitimately returned to its original. Nothing to file. Owner's `mute_all_channels` restored to `false` and verified.

Two lessons, both procedural rather than about the product: enumerate controls in the **state the claim is about** (dirty form, not post-reload), and read `reports/README.md` for prior false positives in the area before writing a finding up — the line naming this exact one was already there.

### Report restructured to the standing finding shape (CLAUDE.md:90)
All four findings rebuilt to: `[FE-WEB][MODULE]` title → **Проблема** → **Как воспроизвести** → **Фактический результат** (measurement block under it) → **Ожидаемый результат** → **Проверка**. Articles rebuilt wholesale rather than patched, so the shape is uniform. Prose 164 / 104 / 49 / 61 words. Tag balance and the leak grep re-run after editing; republished to the same artifact URL.

`Проверка` lines are what a developer runs to confirm a fix, not what I ran to find the bug — main regression, a boundary or empty state, and a related scenario that must not regress.

### Verified working — company dashboard counts
`Settings → Admin → Company dashboard` shows `Workspaces 1 / Members 8 / Your role Owner`. Correct: 8 is the **company** member count (the workspace itself has 7 — one company member is deliberately not in it), and there is one workspace. The dashboard is company-scoped, so the numbers agree with the API rather than contradicting the members page.

### Verified working — Profile settings page
`Settings → Profile` loads with no failed `/api/v1/` requests and no console errors. Contact fields, a bio field (`maxlength=100`) and six status presets (In a meeting / Commuting / Sick / Vacation / Working remotely / Lunch break). Several inputs and icon buttons carry no accessible name — same a11y pattern already noted for Notifications, Appearance and the role checkboxes, logged not reported.

### Appearance — theme and density both working; two rig artifacts caught on the way

**Theme.** Re-tested asserting the click landed before reading anything:
```
before        Light=false Dark=false System=true    documentElement[data-theme]=light
click "Dark"  Light=false Dark=true  System=false   data-theme=dark      <- click provably landed
save/discard panel: none          non-GET requests: none
reload        Light=false Dark=true  System=false   data-theme=dark      <- persists
restore System                                       data-theme=light
```
Working. Theme applies instantly and survives a reload with no explicit save and no server call — a different but valid pattern from Notifications, which uses a `Save preferences` panel. The absence of a save panel here is not a defect.

**Density.** Two false alarms in a row on this one, both mine:

1. The first attempt clicked `Teal` and concluded nothing happened. The accent swatches don't match `main button` filtered by that text, so the guarded `if (await accent.count())` skipped — **the click never fired**. Nothing was tested.
2. The second attempt appeared to show a real bug: clicking `Compact` cleared the whole Density group (`Cozy` true → false, `Compact` still false), and the empty state survived a reload. It is not a bug. **Two radios are labelled `Compact`** — one under `Density`, one under `Message layout` — and the probe built a dict keyed by button text, so the Message-layout `Compact` (unchecked) overwrote the Density one in the results. Disambiguated by reading `document.activeElement` right after the click:
```
targetInfo        Compact [group Density]          checked=false
                  Compact [group Message layout]   checked=false     <- collides on the text key
activeAfterClick  text=Compact  role=radio  aria-checked=true        <- selection did work
```
Density selection works correctly. This is the failure mode `CLAUDE.md` already warns about for `aria-label` — sibling controls share vocabulary — and it applies to text keys in a results dict just as much as to selectors.

**Control shapes on this page**, for whoever tests it next: Theme uses `aria-pressed`; Density, Accent color, Message layout and Sidebar position use `role="radio"` + `aria-checked`, so a probe reading only `aria-pressed` sees none of them. Six switches under `Advanced appearance` / `Extras` have no accessible name at all — same a11y pattern noted elsewhere, logged not reported.

**Still untested:** the accent swatches themselves and the six unnamed switches.

### Invite link — REVOKED; the "unclickable Revoke button" was a collapsed row, not a defect
The shareable invite link created during the invite test has been revoked:
```
POST /api/v1/workspaces/invites/{inviteId}/revoke   200   {"invite_id":"…","success":true}
list after: 1 invite, status "revoked"
page after: "Invite links … Unavailable | Member | Revoked | Unlimited | Sep 2, 2026"
```

Getting there produced one more non-finding worth recording. Clicking `Revoke invite` in the UI failed: the button is in the DOM but `boundingBox()` is `null`, `scrollIntoViewIfNeeded` times out, and `click({force:true})` reports "Element is not visible". The ancestor chain explains it — `div(grid) → dl(grid) → li(list-item) → ul(grid)`, **every one 0×0**, `visibility:visible`, `overflow:visible`, opacity product 1. That is a **collapsed disclosure row** (the list has a `›` expander per invite that my locator did not match), not an unreachable control. Not written up.

An earlier guess at the API path, `DELETE /api/v1/workspaces/invites/{id}`, returned 404 — wrong method and path, not evidence of anything. The real path is `POST …/invites/{invite_id}/revoke`, from `apps/web/src/generated/openapi.json`.

### Verified working — Company dashboard Quick actions
All four navigate to the right destination:
```
Edit company profile  -> /settings/admin/company?tab=manage   (Company dashboard, Manage tab)
Create workspace      -> /settings/admin/workspaces           (Workspaces)
Invite members        -> /settings/admin/invites              (Invites)
Manage roles          -> /settings/roles?scope=company        (Roles)
```
Nuance, not a defect: `Create workspace` and `Edit company profile` take the user to the surface where the action lives rather than opening the dialog or the editor directly — a second click is still needed. Consistent between the two, so it reads as the intended "take me where I can do that" pattern.

### Role assignment pickers — BOTH WORK; the "member picker does not open" lead was a fifth rig artifact

Briefly recorded as an open lead ("`aria-expanded` stays false, no popup anywhere, two runs"). **It was wrong.** Re-run clicking the trigger structurally — by `[role="combobox"]` index rather than by button text — from a fresh page load:

```
triggers found:  [0] "Select a member"  role=combobox  aria-haspopup=listbox  aria-expanded=false
                 [1] "Select a role"    role=combobox  aria-haspopup=listbox  aria-expanded=false
click trigger[0]
  aria-expanded -> true
  popup 487x285: "QA Admin QA Alice QA Bob QA Carol QA Dave QA Guest QA Outsider"   (all 7 members)
```
The member picker opens and lists every assignable member. Nothing to report. Both pickers on this page work, and ALK-2815 does not reproduce here.

Root cause of the false lead: the text-filtered locator matched the button, but the click did not open it — most likely landing on the label rather than the combobox trigger. The structural locator works every time. Same failure mode as the other four: **an absence inferred from a probe that was not exercising the control properly.** Five for five today, which is itself the finding worth carrying forward.

### Verified working — workspace-scope Roles tab
```
Member           R4QDWSMEMBER001  Create channels in the workspace, View and join public workspace channels
Workspace owner  R4QDWSOWNER0001  All workspace permissions              State: System   (no Edit/Delete)
members listed:  7, all "Member"  — matches workspace membership after the kick test
```
The system role is correctly marked `System` and, unlike the custom company roles, offers no `Edit` / `Delete` actions. Both comboboxes present with `aria-expanded=false` at rest.

Nuance checked, not a defect: `QA Owner` appears in the assignment table as `Member`, not as `Workspace owner`. That table lists *assigned* roles, and workspace ownership is carried separately on the workspace record (`owner_id`), which the API confirms — so this is consistent rather than wrong.

### Candidate for the next pass (Low, not published) — Sessions page offers no control when there is only one session
Reproduced on two accounts. With exactly one active session, the page renders **zero buttons** in the content area:
```
subtitle:  "Active sessions — Every device signed in to this account, and how to sign one out."
row:       "Unknown device  <user agent> · <ip>  21 minutes ago  Current session"
visible buttons in main: []          (both accounts, fresh loads)
```
With a second session present, `Sign out` and `Sign out other sessions` both appear and work (verified earlier this session).

So the copy promises a way to sign out and, in the single-session case, none is offered. **Not published**: Low at most, signing out is reachable from the profile menu, and it was found with minutes left in the box — adding it would have meant a republish for a copy mismatch. Worth a line in the next sector D pass, where it can be judged alongside ALK-3005 (`Unknown device` on the same screen).

### Verified working — company identity edit permission, both sides
```
non-owner:  Company name input  disabled=true   + "Only the company owner or a system administrator can edit the company identity."
owner:      Company name input  disabled=false  editable
```
Typing into the owner's field produced **no** Save/Discard panel (unlike the workspace name field, which does surface one), so the edit stays local form state; a reload discards it. Confirmed the fixture was untouched — `GET /api/v1/companies/{companyId}` → 200, `name: "QA Fixtures D"`.

**Save affordance question, resolved in the same box.** The first probe suggested the company identity form had no save control at all. It does — enumerating **every** button on the page while the form is dirty (rather than scoping to `main` on a clean form):
```
clean form:  … Search / "QA Fixtures D" / Upload image
type into the company name field
dirty form:  … + Discard + Save changes        <- appear only when dirty
field value: "QA Fixtures D edited"
reload without saving -> GET /api/v1/companies/{companyId}  name: "QA Fixtures D"   (unchanged)
```
Identical pattern to the workspace identity form. **No defect** — and this is the sixth would-be finding of the day killed by the same check, this time applied before writing anything down rather than after publishing.

### Verified working — About page
Shows `Version v0.61.0-rc.3`, which matches the `data-dpl-id` build stamp recorded at session start. One diagnostics switch, `Send crash reports`, **on by default** (`aria-checked=true`), disclosed by the section copy ("Help us improve Aloqa by sharing anonymous diagnostics") and by its own description ("Automatically send anonymized crash data…"). A defensible default and clearly labelled — not a finding, but worth a deliberate look in a privacy-focused pass since it is opt-out rather than opt-in. The switch carries a description but no `aria-label`, same a11y pattern as elsewhere.

### BUG-2 strengthened — the member copy is correct, only the owner gets the impossible instruction
Same screen, two roles:
```
plain member:  "Leave this workspace — Remove yourself from this workspace and clear its
                local workspace state."          Leave workspace  enabled
owner:         "Leave this workspace — Transfer workspace ownership before leaving."
                                                 Leave workspace  disabled
```
So the app already has plain, actionable copy for this control and swaps in an instruction naming a non-existent operation for the owner specifically. That is the shape of the fix too: the owner branch needs copy describing something reachable. Directly validates the report's `Проверка` line "Обычный участник workspace по-прежнему может выполнить Leave workspace" — confirmed enabled, not clicked (the member stays in the workspace).

### Verified working — workspace-authz negative case, and the session's first open thread resolved
```
company-only account -> GET /api/v1/workspaces/{laneWorkspace}/members   403
their workspace list -> only {"type":"personal","owner_id":<themselves>}
```
Correct after the invite/kick sequence: the account is a company member with no access to the workspace, which is what this fixture exists to exercise.

This also closes the thread opened at the top of this log — that account landing on `/w/W4OWAY1Z8JFMM58/directories` after login. That id is their **own auto-created Personal workspace** (`type: personal`, `owner_id` themselves), not a stray or leaked workspace. Routing a workspace-less user to their personal workspace is correct behaviour, not a defect.

### BUG-1 re-confirmed at session close on a wider dataset
```
company audit log:   9 entries
workspace audit log: 5 entries
rendered on screen:  the workspace 5
```
Gap of 4 = the company-scope `role.created` / `role.deleted` events accumulated across the run. The finding holds on more data than it was written from, and the gap grows with every company-scope action — so on a real company the omission compounds rather than staying a fixed handful.

## Session summary
**Reported (4, all frontend):** 1 High — audit log hides company-scope events; 1 Medium — workspace owner dead end (regression of the closed ALK-2806); 2 Low — `audit.view` raw key, `Workspace identity` subtitle.

**Withdrawn (1):** Notifications toggles "not saving" — false positive, already known from 25.08; save works and persists.

**Not filed as duplicates:** invite link declared invalid to an existing member (ALK-3006); `Unknown device` on Sessions (ALK-3005).

**Verified working:** admin route gating for a plain member, owner self-removal block, company identity lock for non-owners, sign-out-other-sessions (with genuine server-side invalidation), kick, login/forgot-password/magic-link with no account enumeration, 2FA setup flow, Russian localisation across seven settings pages, invite creation and role gating, invite revoke, both role-assignment pickers, workspace-scope roles tab, company identity permissions (both sides), About page, company dashboard counts and its four Quick actions, Profile page.

**Also verified working:** Appearance theme and Density (instant apply, persist across reload, no save step).

**Rig artifacts caught before they became findings (6):** notification toggles "not saving" (button enumeration ran after a reload, so the dirty-form Save panel was invisible — this one reached the report and was withdrawn); the `Teal` accent click that never fired because a guarded locator silently skipped; the Density group that looked cleared because two radios share the label `Compact` and collided on a text key; the `Revoke invite` button with a null bounding box, which was a collapsed disclosure row; and `Select a member` on the Roles page "not opening", which opens correctly when the combobox trigger is clicked structurally rather than by text. and the company identity form "having no save control", which has `Discard`/`Save changes` once dirty. Five of the six share one shape — an absence inferred from a probe that was not measuring the right thing.

**Fixtures:** verified clean at end of run — `company_members 8/8`, `workspace_members 7/7`, "All fixtures present and correct". Everything touched was put back and re-read from the app:
```
probe roles                deleted (create/delete of 3 probe roles, all removed)
workspace name             "QA Workspace D"
workspace membership       outsider removed via POST /workspaces/kick after the invite test
2FA                        off (pending setup discarded on navigation)
interface language         English
appearance                 theme System (light), Density Cozy, Message layout Standard, Sidebar Left
notification settings      in_app_enabled=true, mute_all_channels=false, mute_unknown_dm_users=false
invite link                revoked (POST …/invites/{id}/revoke -> 200, status "revoked")
```

---

## CORRECTION from the verification pass (build v0.61.0-rc.4)

A verification session re-ran all four findings on `v0.61.0-rc.4`. **All four reproduced; none withdrawn, none fixed in the interim.** Two of my measurements were wrong and have been corrected in the published report and above in this log:

1. **Finding 1 mechanism — my error, and it was self-inflicted.** I claimed the page requests *both* audit logs and renders only one. It does not: **the page never requests the company log.** The two requests in my original measurement were made by my own probe. In `snip/d-audit-final.mjs` I attached `page.on('response', …)` before `page.goto`, then fetched both endpoints inside `page.evaluate` to compare counts, and read the captured array *after* that evaluate — so my own `fetch` calls were recorded as if the page had issued them.

   The finding itself is unaffected: company-scope events are recorded, are not shown, and no filter in the UI reaches them. Only the mechanism sentence was wrong — and it was the sentence that made the defect sound like a one-line render fix rather than a missing request.

2. **Finding 3 counts — my error, same instrument problem.** I reported 16 permissions in company scope and 14 in workspace scope. The real counts are **11 and 9**. My selector in `snip/d-perms.mjs` was `label, [role="checkbox"], input[type=checkbox]`, which swept up `Filter settings`, `Role name`, `Description`, `MEMBER` and `ROLE` alongside the actual permission labels. The `audit.view` finding itself is unaffected — the raw key is really there, in both scopes.

**This is the seventh probe error of the session and the only one of its kind.** The other six were probes that failed to *observe* something real. This one **manufactured evidence** and reported it: a listener left attached across an in-page `fetch` cannot distinguish the application's requests from the probe's own. That is not a matter of care, it is a property of the instrument.

**Rule for the next session:** when using `page.on('request'|'response')` to establish what a *page* does, snapshot the captured array **before** running any `page.evaluate` that itself calls `fetch`, or filter captured entries by initiator. Never read the listener's array at return time if the snippet fetched anything in between.

### What the verification pass added that I had missed
Worth reading their log (`logs/AIRION-QA-2026-08-26-D-verify.md`) rather than this one for finding 1:
- **Root cause named:** `useAdminAuditLog(wsId)` with `routes.auditLog = /workspaces/:wsId/admin/audit-log` — the panel is wired to `wsId` only. `Export CSV` / `Export JSON` are workspace-scoped too (`fetchAllAdminAuditLog(client, wsId)`), so the export is not a workaround either. Pagination ruled out: `Next` is inactive.
- **Triage note on finding 2** that I did not have: the backend gate is real (`ORG_WORKSPACE_LEAVE_OWNER`), and its own code comment says the client should offer to **delete** the workspace rather than transfer ownership — but deletion does not exist either; the workspace resource exposes only `get` and `patch`. That makes the fix a product decision, not a copy change.

### Note on my own follow-up edit
After reading the correction I tried to patch `reports/README.md` with blind string replacements, without reading the row first — the verification session had already rewritten it, far more thoroughly than I would have. The replacements happened not to match (`git diff`: 56 insertions, **0 deletions**, so nothing of theirs was lost), but that was luck, not care. Read a shared file before editing it, especially one another session is known to be writing.
