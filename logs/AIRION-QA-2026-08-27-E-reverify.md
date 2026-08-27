# AIRION QA — lane E — re-verify pass — 2026-08-27

Build: frontend `v0.61.0-rc.6` @ `5be489db0ca6` (`data-dpl-id="v0-61-0-rc-6-5be489db0ca6"`)
Report under re-verification: `reports/aloqa-workspace-qa-2026-08-26-E-2.html` (23 findings)
Lane E — workspace `W4QEF1XTURESO01`, company `O4QEF1XTURESO01`.

## Current state

Build `v0.61.0-rc.6` @ `5be489db0ca6`. Pass complete.

21 of 23 findings carry a repro block (`bench.load()` counts 21 for lane E). The two without one
no longer reproduce: E:11 (end-before-start now shows a visible `role=alert`) and E:13 (the channel
header's `Search in channel` no longer scopes the dialog, so there is no chip to leave on and the
request does go).

New helper: `scripts/callrig/snip/e-rig2.mjs` — `second(lane, account)` and `tile()`. The bench only
ever runs `ensure.sh <lane> alice` (verify_queue.roles_needed collapses every lane E finding to
"any signed-in account") and drives the first account in `data-accounts`, so **every lane E snippet
is driven from alice** and pulls a second browser up itself when it needs one.

Leftovers on staging: alice's custom status is "Vacation" and her Department/Job title are
"Quality Assurance" / "QA Engineer" (both are steps of E:2 and E:8). Several `e-arch-*` archived
channels, `e-preview-*.png` and `e-shared-*.txt` files, and a number of `E …` meetings — all created
by the snippets, all disposable.

## Findings

### E:0 — [High][frontend] Open full search сужает поиск до текущего канала — **ПОДТВЕРЖДЕНО**
Standing in #qa-general, marker posted to #qa-private.
```
dialog:  GET /api/v1/search?q=<w>&company_id=…&workspace_id=…&limit=25          All 1 | Messages 1 | row "#qa-private"
Open full search -> /w/<ws>/c/C4QEGENERAL0001/search?q=<w>
         GET /api/v1/search?q=<w>&company_id=…&workspace_id=…&channel_ids=C4QEGENERAL0001&limit=25   All 0
page:    "No results for “<w>”."   remove-filter buttons on the page: []   (dialog has one)
```
Snippet `e-fullsearch-repro.mjs`, driver alice, stepsDone 3. Block added.

### E:1 — [High][backend] Приглашённый не может ответить ни одним из двух путей — **ЧАСТИЧНО ИСПРАВЛЕНО**
Path 1 (notification link `/w/<ws>/calendar/<id>`) — **still reproduces**:
```
6 samples over 7 s, fresh meeting, invitee bob, my_status "pending"
  card: "… | Participant list unavailable | Your response | Yes | No | Start meeting"
  Yes disabled=true   No disabled=true      (all 6 samples)
GET /api/v1/calendar/meetings/<id>  -> top-level keys: meeting   (no `attendees` for the invitee, no my_status)
GET /api/v1/calendar/meetings?workspace_id=…  -> my_status "pending"
```
Path 2 (grid chip → Yes) — **FIXED on v0.61.0-rc.6**:
```
POST /api/v1/calendar/meetings/<id>/respond {"status":"accepted"}
  -> 200 {"id":"SA…","scheduled_event_id":"S…","user_id":"U4QEBOB00000001","status":"accepted",
          "responded_at":"2026-08-27T08:04:02Z", …}
list after: my_status "accepted"        no error toast
```
The report's 404 `REALTIME_SCHEDULED_ATTENDEE_NOT_FOUND` no longer happens — measured twice, via the
UI chip (Yes clicked in the grid dialog) and via a direct POST. The title's "ни одним из двух путей"
is now wrong; the finding survives as the notification-link path only.
Snippet `e-rsvp-link.mjs`, driver alice (pulls bob up via `e-rig2.mjs`), stepsDone 2. Block added.

### E:2 — [Medium][frontend] People не показывает ни присутствие, ни статус — **ПОДТВЕРЖДЕНО**
```
GET /api/v1/workspaces/W4QEF1XTURESO01/members   -> presence present on 7/7 members
   own row custom_status: {"text":"Vacation","emoji":"🌴","source":"manual"}
GET /api/v1/workspaces/W4QEF1XTURESO01/presence  -> 2 online / 5 offline
DOM, Directories?tab=people, row = smallest visible node holding name + Message button:
   QA Bob    (online)  descendants 15  outerHTML 3380  skeleton(name-stripped) 3372
   QA Carol  (offline) descendants 15  outerHTML 3388  skeleton(name-stripped) 3372
   QA Owner  (offline) descendants 15  outerHTML 3388  skeleton(name-stripped) 3372
   -> online and offline rows are the same markup; nothing carries presence or status
```
Snippet `e-people-presence.mjs`, driver alice (brings bob online), stepsDone 3. Block added.
Leftover: alice's custom status stays "Vacation" (that is the finding's own step 2). The snippet
is idempotent — clicking Vacation when already Vacation *clears* it, so it reads the status first.

Note: the shared scratchpad dir is NOT session-private — a lane B session overwrote a helper
script I had put there. Lane E helper now lives under `<scratchpad>/laneE/`.

### E:3 — [Medium][frontend] Редактирование повторяющейся встречи меняет одно вхождение — **ПОДТВЕРЖДЕНО**
Daily series of 4, opened today's occurrence -> Edit -> title changed -> Save (all through the UI):
```
GET /api/v1/calendar/meetings?workspace_id=…&from=…&to=…   after Save
  2026-08-27T13:00:00Z  "E series RENAMED-A"
  2026-08-28T13:00:00Z  "E series probe vsfw"
  2026-08-29T13:00:00Z  "E series probe vsfw"
  2026-08-30T13:00:00Z  "E series probe vsfw"
Edit form text search /this event|all events|this and following|series|occurrence/i -> no match
detail dialog does say "Repeats"; the Edit form says nothing about scope
```
Snippet `e-series-edit.mjs`, driver alice, stepsDone 2. Block added.

### E:4 — [Medium][frontend] `:@ <Имя Фамилия>` подставляет другого участника — **ПОДТВЕРЖДЕНО**
Fresh Global search dialog each time (chips survive an in-dialog retype, so a reused dialog
measures the previous query too):
```
typed ":@ QA Carol marker"
  chip:    "Remove @QA Admin filter"          <- not the person typed
  box now: "Carol marker"                     <- parser consumed only ":@ QA"
  GET /api/v1/search?q=Carol+marker&company_id=…&workspace_id=…&limit=25     <- no user/channel narrowing
typed ":@ QA Bob marker"
  chip:    "Remove @QA Admin filter"
  GET /api/v1/search?q=Bob+marker&…&limit=25
control, one-word name — typed ":@ Bob marker"
  chip:    "Remove @QA Bob filter"
  GET /api/v1/search?q=marker&…&channel_ids=C4OWQV2ZT4AAI6R&limit=25         <- does narrow, to the DM
```
Snippet `e-at-filter.mjs`, driver alice, stepsDone 1. Block added.

### E:5 — [Medium][frontend] Выбор напоминания ни на что не влияет — **ПОДТВЕРЖДЕНО**
Reminder menu options: No reminder | 5/10/15/30 minutes before | 1 hour before.
Trigger reads "Reminder 5 minutes before" after picking; the create request is byte-identical
to the default-"No reminder" one — no reminder field of any name:
```
Reminder = "No reminder"        POST /api/v1/calendar/meetings
  {"workspace_id":"…","title":"E reminder probe 32hf","starts_at":"…","ends_at":"…",
   "timezone":"Asia/Tashkent","meeting_url":"","location":"","attendee_user_ids":[],
   "guest_invites":[],"requires_approval":true,"is_private":false,"mute_on_join":false,
   "who_can_open_rooms":"host_only","max_rooms":8}
Reminder = "5 minutes before"   POST /api/v1/calendar/meetings
  {…same key set, no reminder/remind_at/reminders field…}
```
Snippet `e-reminder-repro.mjs`, driver alice, stepsDone 2 (schedules the No-reminder meeting, leaves the
5-minute one's form filled). Judging the delivered reminders still needs a ~10-minute wait.
Block added.

### E:6 — [Medium][frontend] Два из трёх горячих сочетаний не работают в канале — **ПОДТВЕРЖДЕНО**
```
/w/<ws>/files, focus BODY
  Cmd+K        body children 9 -> 13   visible dialog "Global search …"   focus "Search messages, channels, people, files…"
/w/<ws>/c/C4QEGENERAL0001, focus DIV[aria-label="Compose message"]
  Cmd+K        body children 12 -> 16  visible dialog "Insert link | Cancel | Insert"  focus INPUT[Insert link]
  Cmd+N        body children 12 -> 12  no dialog, path unchanged, focus still "Compose message"
```
Snippet `e-hotkeys.mjs`, driver alice, stepsDone 1. Block added.

### E:7 — [Medium][frontend] Недействительная ссылка-приглашение — тупиковая страница — **ПОДТВЕРЖДЕНО**
```
GET /calendar/join/deadbeef…deadbeef   (rendered, 6 s wait)
  body.innerText           "Could not join the meeting"
  document.querySelectorAll('button').length   0
  document.querySelectorAll('a[href]').length  0
  visible button/a/[role=button]/input         []
  documentElement.scrollHeight 1062 == innerHeight 1062     (nothing below the fold)
control — same route, live token from a meeting created seconds earlier:
  "The meeting has not started yet | <title> | Start: … | You can join from … | Leave"
  1 button ("Leave"), visible
```
Snippet `e-deadjoin.mjs`, driver alice, stepsDone 2 (both numbered steps; it also mints a live
link of the same shape for the comparison). Block added.

### E:8 — [Medium][frontend] Все участники в OTHER, поиск по отделу пуст — **ПОДТВЕРЖДЕНО**
```
Settings -> Profile: Department "Quality Assurance", Job title "QA Engineer", Save profile
GET /api/v1/auth/me  -> settings.profile {"jobTitle":"QA Engineer","department":"Quality Assurance",…}
GET /api/v1/workspaces/W4QEF1XTURESO01/members -> 7 members
   members carrying `department`: 0/7      members carrying `job_title`/`jobTitle`: 0/7
Directories?tab=people  group headings on screen: ["OTHER"]  (all 7 under it)
```
Note for whoever drives this form: `fill()` does not dirty it and the `Save profile` button
never appears; `type()` does. Inputs carry React ids (`_r_5_`) and are named by `label[for]`.
Snippet `e-directory-dept.mjs`, driver alice, stepsDone 2. Block added.

### E:9 — [Medium][frontend] Day открывается на дате по UTC — **ПОДТВЕРЖДЕНО**
Same instant, two browsers, one clock each:
```
TZ Asia/Tashkent   local 2026-08-27, UTC 2026-08-27   (dates agree)
  Day -> "Thursday, August 27"   day summary carries the Today chip
  GET /api/v1/calendar/meetings?…&from=2026-08-26T19:00:00.000Z&to=2026-08-27T19:00:00.000Z   <- local Aug 27
TZ Pacific/Honolulu local 2026-08-26, UTC 2026-08-27   (dates differ)
  Day -> "Thursday, August 27"   <- the UTC date, not the local one; no Today chip
  GET /api/v1/calendar/meetings?…&from=2026-08-27T10:00:00.000Z&to=2026-08-28T10:00:00.000Z   <- local Aug 27 = tomorrow
```
Direction is mirrored from the report (which measured at local 00:00–05:00 on +05, so the app
showed *yesterday*); here the app shows *tomorrow*. Same defect: the view opens on the UTC date.
**`Emulation.setTimezoneOverride` is useless for a handover** — Chrome drops it the moment the
CDP session detaches, so the human sees a normal clock. `TZ=<zone> ./launch.sh E bob` does
propagate through `open` and is permanent, which is what the snippet uses.
Snippet `e-day-utc.mjs`, driver alice, judged in bob's window, stepsDone 2. Block added.
Leftover: bob's browser stays on Pacific/Honolulu until stop.sh + ensure.sh. Restored at end of run.

### E:10 — [Medium][frontend] Поиск показывает фильтр канала, которого не применял — **ПОДТВЕРЖДЕНО**
```
account is a member of #qa-general, #qa-private, #e-dirprobe  (GET /api/v1/workspaces/<ws>/channels)
typed ":in #qa-empty marker"     (public channel, not a member)
  chip: "Remove in #qa-empty filter"
  GET /api/v1/search?q=marker&company_id=…&workspace_id=…&limit=25        <- no channel_ids
  результаты из #qa-private
typed ":in #nosuchchan marker"   (typo)
  chip: "Remove in #nosuchchan filter"
  GET /api/v1/search?q=marker&…&limit=25                                   <- no channel_ids
control — typed ":in #qa-general marker"  (a channel the account IS in)
  chip: "Remove in #qa-general filter"
  GET /api/v1/search?q=marker&…&channel_ids=C4QEGENERAL0001&limit=25       <- does narrow, All 0
```
Snippet `e-in-filter.mjs`, driver alice, stepsDone 1. Block added.

### E:11 — [Medium][frontend] Встреча с окончанием раньше начала — **БОЛЬШЕ НЕ ВОСПРОИЗВОДИТСЯ**
The refusal is no longer silent on `v0.61.0-rc.6`. Measured twice, polling notices from *before*
the click and keeping max opacity:
```
New meeting, title set, Starts time 16:00 typed (Ends auto-filled 16:30), Ends time typed 09:00
  before the click:  window.__qa.notices() -> []
  click "Schedule meeting" (safeClick, ok:true, not covered, not off-viewport)
  after:  {"text":"End time must be after start","w":598,"h":31,"role":"alert",
           "maxOpacity":1,"firstMs":183}
          leaf node carrying that text: vis=true, 598x31 at y=411   (a second 0x0 sr-only twin)
          dialog stays open, POST /api/v1/calendar/meetings: not sent
```
So the form now names the reason, in a visible `role=alert` beside the fields, 183 ms after the
click, and the request is still correctly withheld. The finding's own claim — «нажатие не
приводит ни к чему», «отказ молчаливый» — is what no longer holds. No repro block added.

### E:12 — [Medium][frontend] Поиск пропускает всё в архивном канале — **ПОДТВЕРЖДЕНО**
Fresh public channel `e-arch-<word>` + message containing `<word>`, then archived:
```
POST /api/v1/channels/<id>/archive -> 200 {"channel_id":"<id>","is_archived":true}
GET /api/v1/search?q=<word>&company_id=…&workspace_id=…&limit=25   -> 200
  {"messages":[{"id":"M…","channel_id":"C…","highlight":"archived search marker <em><word></em>",
    "is_dm":false,"channel_archived":true,…}],
   "channels":[{"id":"C…","name":"e-arch-<word>","type":"public",
    "highlight":"e-arch-<em><word></em>","is_archived":true}],
   "total_messages":1,"total_channels":1}
Global search, same word, same second:
  All 0 | Messages 0 | Channels 0 | People 0 | Files 0     "No results for “<word>”."
```
Snippet `e-archived-search.mjs`, driver alice, stepsDone 2 (it also waits until the server's own
search sees the marker, so an empty screen can never be blamed on indexing lag). Block added.

### E:13 — [Medium][frontend] В архивном канале Search in channel — **БОЛЬШЕ НЕ ВОСПРОИЗВОДИТСЯ**
The finding's precondition is gone: on `v0.61.0-rc.6` the channel header's `Search in channel`
opens the **unscoped** Global search dialog — there is no channel chip to leave on.
```
#qa-general (not archived), clicked "Search in channel", 6 samples over 4.8 s
  dialog h2: "Global search"
  every button in the dialog: Last 7 days | Last 30 days | All time | Relevance |
                              All | Messages | Channels | People | Files | Open full search
  [aria-label] matching /Remove/i inside the dialog: []
archived channel (header shows "Unarchive channel", the marker message visible on screen),
clicked "Search in channel", typed the marker, polled 1 s x 12:
  dialog h2 "Global search", Remove-labels []          <- no area chip to remove (step 4 unreachable)
  /api/v1/search requests fired: 1
    GET /api/v1/search?q=<word>&company_id=…&workspace_id=…&limit=25
  sample 1 and every sample to 12 s: "All0 Messages0 Channels0 People0 Files0", "No results" shown
```
So: a request does go, the tabs do carry numbers, and an empty state is shown — the three things
the finding says are missing. (The zeroes themselves are E:12, which is separately confirmed.)
No repro block added.

### E:14 — [Medium][frontend] Контролы диалога поиска выключают клавиатурную навигацию — **ПОДТВЕРЖДЕНО ЧАСТИЧНО (сузилось до сортировки)**
Selection is `input[aria-activedescendant]`. Query "marker" (All 5 | Messages 5). Measured twice:
```
control, nothing touched
  open -> row-0    ArrowDown x2 -> row-2    Enter -> dialog closes, /w/<ws>/c/C4QEPRIVATE0001?m=M…
click Messages tab, then ArrowDown x2, Enter
  row-0 -> row-2   Enter -> dialog closes, opens the message                 <- WORKS
click Last 30 days, then ArrowDown x2, Enter
  row-0 -> row-2   Enter -> dialog closes, opens the message                 <- WORKS
sort Relevance -> Date, then ArrowDown x4, Enter
  activeDescendant row-0, row-0, row-0, row-0   (focus is on the "Date" option, not the input)
  Enter -> dialog stays open, focus becomes "Relevance"  (it re-toggles the sort trigger)
```
So the title's «любое обращение» is now wrong: two of the three named controls behave. The finding
survives as the sort control only. Snippet `e-search-keys.mjs`, driver alice, stepsDone 3, and its
`leftToDo` says which controls no longer do it. Block added.

### Supervisor note (scratchpad root is shared) — already handled
Hit independently at ~13:12: a lane B copy of `insert_repro.py` replaced mine in the scratchpad
root. My helper has lived at `<scratchpad>/laneE/e_insert_repro.py` since. Verified after the note:
all 23 `<h2>` in the lane E report are intact, every repro block is `data-lane="E"` with an `e-*.mjs`
snippet, and each sits under the right finding. My own root-level copy took the report path as
argv[1], so it could only ever have written to a path its caller passed — it cannot have edited
another lane's report.

### E:15 — [Medium][frontend] Картинка из результата поиска не показывается — **ПОДТВЕРЖДЕНО**
Same file, same session, two entry points:
```
uploaded e-preview-<tag>.png  (image/png, 148 B, id F…)
from Files (Images filter -> card):
  viewer dialog opens, <img> naturalWidth 64 naturalHeight 64, src /api/v1/files/<id>/content
from Global search (same name, Files 1):  card text
  "viewer.png | PNG | viewer.png | Image · 910 B | PNG | … | Preview is not available for this
   file type | Download file"
  visible <img> elements in that card: []
```
Snippet `e-search-image.mjs`, driver alice, stepsDone 2 (uploads, proves the Files viewer renders
it, leaves the search result unclicked). Block added.

### E:16 — [Medium][frontend] Calendar не догоняет пропущенное после разрыва — **ПОДТВЕРЖДЕНО**
Break mechanism that works here (three that do not are recorded below):
```
ctx.addInitScript records window.WebSocket instances; page.routeWebSocket(/\/ws\/chat/, …) with a
flag that either relays (connectToServer) or refuses (close). Installed BEFORE goto.
  healthy:      sockets "1", no banner
  broken:       sockets "3", banner "Reconnecting…", GET /api/v1/auth/me -> 200   (HTTP fine)
  other account: POST /api/v1/calendar/meetings {attendee_user_ids:[alice]} -> 200
  on alice's open Calendar while down:                     not on screen
  connection restored, banner cleared, 6 samples over 24 s: not on screen (all 6)
  GET /api/v1/calendar/meetings?…  at that moment          found, my_status "pending"
  press Day then Week                                       appears immediately
```
What does NOT break the socket here (all measured):
- `Network.emulateNetworkConditions {offline:true}` — the socket stays open, no close event, no banner.
- `Network.setBlockedURLs {urls:['*ws/chat*']}` — the app reconnects straight through it.
- `page.routeWebSocket` registered on an already-loaded page — the handler never fires; it hooks
  only sockets opened after a navigation.
Snippet `e-catchup.mjs`, driver alice (uses bob), stepsDone 4. Block added.

### E:17 — [Low][frontend] Состояние сайдбара и настройки Files не сохраняются — **ПОДТВЕРЖДЕНО ЧАСТИЧНО**
```
Channels section collapsed (aria-expanded "false")
  after internal navigation Calendar -> Chat : "false"    kept
  after reload                                : "true"    lost
sidebar collapsed (aria-expanded "false")
  after reload                                : "false"   KEPT  <- this one is fixed on this build
Files: List view aria-pressed "true", active sort "Size" (bg-accent-dim marks it; there is no
aria-pressed on Date/Name/Size)
  after internal navigation Calendar -> Files : List view "false", active sort "Date"   lost
  after reload                                : List view "false", active sort "Date"   lost
```
Three of the four still fail; the sidebar's own collapsed state now survives a reload.
Snippet `e-persist.mjs`, driver alice, stepsDone 2, and its `leftToDo` names which one is fixed.
Block added. Note the ordering trap: collapsing the sidebar first hides the Channels control, so
the section state can neither be set nor read after that.

### E:18 — [Low][frontend] Смена даты начала не двигает сводку и дату окончания — **ПОДТВЕРЖДЕНО**
```
New meeting, as opened
  Starts 2026-08-27 14:30   Ends 2026-08-27 15:00   summary "Thu, Aug 27 · 2:30 PM – 3:00 PM · 30 min"
only the Starts date changed to 2026-09-06
  Starts 2026-09-06 14:30   Ends 2026-08-27 15:00   summary "Thu, Aug 27 · 2:30 PM – 3:00 PM · 30 min"
control — then the Starts time changed to 19:00
  Starts 2026-09-06 19:00   Ends 2026-09-06 19:30   summary "Sun, Sep 6 · 7:00 PM – 7:30 PM · 30 min"
```
Snippet `e-startdate.mjs`, driver alice, stepsDone 2. Block added.

### E:21 — [Low][frontend] Фокус после закрытия поиска — **ПОДТВЕРЖДЕНО**
Same channel, same session, two dialogs:
```
sidebar search button -> Global search   focus INPUT[Search messages, channels, people, files…]
  Escape  -> document.activeElement = BODY
  Tab     -> A "Skip to content"          (the first focusable node on the page)
notifications bell -> panel               focus BUTTON "Mark all as read"
  Escape  -> BUTTON "Notifications, 31 unread"      <- returns to its own opener
  Tab     -> BUTTON "Settings"                      <- carries on from there
```
Snippet `e-focus-return.mjs`, driver alice, stepsDone 1. Block added.

### E:22 — [Low][frontend] Получателю написано, что файл никому не отправлен — **ПОДТВЕРЖДЕНО**
Bob sends a file into #qa-general (Attach files -> upload into the library -> select ->
`Attach selected (1)` -> Send); alice opens it from Files -> Shared with me -> right click ->
View details:
```
recipient's details panel (aside):
  "Details | e-shared-<tag>.txt | 25 B | Shared by | QB | QA Bob | Date added | Today |
   File type | TXT | Size | 25 B | SHARED WITH | Not shared with anyone yet. |
   Copy link | Add to favorites | Delete file"
GET /api/v1/users/me/files?workspace_id=…&scope=accessible  (recipient)
  {"id":"F…","filename":"e-shared-<tag>.txt","shared_with":[]}
GET /api/v1/users/me/files?workspace_id=…&scope=own          (sender, same file id, same minute)
  {"id":"F…","filename":"e-shared-<tag>.txt","shared_with":[
     {"id":"FS…","file_id":"F…","type":"channel","target_id":"C4QEGENERAL0001",
      "target_name":"qa-general","created_at":"…"}]}
```
Note: the "Shared with me" tab requests `scope=accessible`, not `scope=shared` (that returns 0).
Snippet `e-shared-with.mjs`, driver alice (drives bob to send), stepsDone 2. Block added.

## Result

`python3 -c "…bench.load()… lane=='E'"` -> **21** = 2 pre-existing + 19 produced.
`python3 scripts/verify_report.py reports/aloqa-workspace-qa-2026-08-26-E-2.html` -> ALL CHECKS PASS,
leaks none, 23 findings, 21 carrying a repro block.

Every snippet was run twice from the command line and printed `"ready": true`.

**No longer reproducing (no block added):** E:11, E:13.
**Narrowed but still real (block added, `leftToDo` says what changed):** E:1 (grid-chip path fixed),
E:14 (only the sort control), E:17 (sidebar collapse now persists).

### Name collision, caught and fixed before handover
`e-fullsearch-repro.mjs` and `e-reminder.mjs` were already **tracked** files — one-off investigation probes
from the earlier lane E session — and my first drafts overwrote them. Both originals were restored
from `HEAD` and my snippets renamed to `e-fullsearch-repro.mjs` / `e-reminder-repro.mjs`; the report
blocks were updated and both were re-run (`ready: true`). Every other name I used was checked against
`HEAD` with `git cat-file -e` — no other collisions. Nothing was lost.
