# AIRION QA — 2026-08-26 — lane E — sector E (Workspace content & chrome)

- **Sector E on lane E** (prompt was `+1h E`).
- Timebox: 10:44 → 11:44 +05 (60 min).
- Staging build: `data-dpl-id="v0-61-0-rc-3-15da3ead76e1"` → tag `v0.61.0-rc.3`, frontend commit `15da3ead76e1`.
- Workspace `W4QEF1XTURESO01`, company `O4QEF1XTURESO01`.
- Browsers: alice :9262, bob :9263.

## Current state

**Run complete.** 5 reportable findings — 3 High, 2 Medium; 3 backend, 2 frontend.
2 duplicates measured and not filed (ALK-3002, ALK-2522). 6 candidates withdrawn after
measurement — rig artifacts, render-timing reads, a wrong inference from a partial element
enumeration, and selectors matching the wrong element; none were product defects. Four of the
six were name-based selectors failing, which is worth internalising: in this app a control is
often labelled with its current *value*, not its purpose. The fifth ("the meeting Edit form has no
date/time fields") was written up as an unverified candidate, then measured properly and
killed before the box ended. A wide set of areas verified working.

The report was reworked twice mid-run at the request of a parallel session, both times
against guidance that session had just added to CLAUDE.md: first tightened to the
~120–180-words-per-finding budget (CLAUDE.md:91), then converted to the standing ticket
format (CLAUDE.md:90). Final prose is 47/46/40/53 words per finding, every measurement
block kept, with «Для триажа» blocks on the two findings where the dedup pass had something
a filer needs.

Report: `reports/aloqa-workspace-qa-2026-08-26-E.html`
→ https://claude.ai/code/artifact/2c75f8a0-ae97-4de8-b054-2c4048af9ca0
(pass this back as `url` to update in place).

Nothing filed in Jira — filing is the user's call.

**Covered:** directories (People/Channels tabs, search filter on both tabs, membership
affordances, presence); calendar (creation with and without invitees, invitations, RSVP,
meeting card from both roles, public visibility, Day/Week/Month views, navigation,
month overflow); files (upload with review queue, download and byte-fidelity, viewer,
scopes, type filters, sort, empty states); search (global dialog, message indexing,
in-channel scoped search, empty states, API-level probing of every result type);
notifications (bell badge, panel, click-through, mark-as-read).
**Also covered late in the box:** meeting edit (form opens, pre-filled, date/time controls
present as buttons), meeting deletion (confirmation copy, `POST /cancel` 200, grid and API
agree), file favourites (toggle persists, filter agrees, survives reload), the Directories
`OTHER` grouping question (resolved), and sidebar unread badges — which turned into BUG-5 in
the last ten minutes of the box, measured over two runs and added to the report.

**Not reached:** the lightbox opened from a message (sector C's), and File Details for a file *sent into a channel* rather than uploaded directly, the multi-workspace path of the workspace switcher (see below),
and the live path of a meeting rename (see below). Reminder *delivery* (setting one and confirming it fires) — the picker itself is verified.
Recent searches were checked and do not exist on this build (see below). Left as the obvious
start for the next sector-E session, in roughly that order.

**Open leftovers on lane E:** meetings `QA-E Sync 1` (15:00) and `QA-E Sync 3` (17:00) on
2026-08-26, both with bob invited and Pending (`Sync 2` was deleted as part of the deletion
test); two files uploaded by alice, one of them favourited; two probe messages in
`#qa-general` carrying the token `zarplex…`. Harmless on disposable fixtures, but they will
show up in that day's calendar, the files library and message search.

## Findings

### BUG-1 [High] [frontend] Список участников встречи показывается только организатору и только при наличии приглашённых — всем остальным «Participant list unavailable»

Meeting `S4OWB577EO9O4DE` "QA-E Sync 3", Wed Aug 26 17:00–17:30, organiser alice, invitee bob (optional, Pending).

**Organiser (alice), same meeting card:**
```
QA-E Sync 3 | Wednesday, August 26, 17:00–17:30 | 30 min
Scheduled by You
QA Bob / optional / Pending
Your response: Yes / No | Invite by email | Start meeting
```
Stable — re-sampled at +0s and +6s, identical.

**Invitee (bob), same meeting card:**
```
QA-E Sync 3 | Wednesday, August 26, 17:00–17:30 | 30 min
Scheduled by QA Alice | Participant list unavailable | Your response: Yes / No | Start meeting
```

**Persistence** — polled the open card 20×600 ms = 12 s on a freshly loaded page; every
sample carried "Participant list unavailable" (trace `UUUUUUUUUUUUUUUUUUUU`). Not a
background-refetch flicker.

**Both underlying requests succeed for bob (200):**
- `GET /api/v1/workspaces/{ws}/members` → 200, full member directory in the body
- `GET /api/v1/calendar/meetings/S4OWB577EO9O4DE` → 200

So the data the list needs is present and the requests are not failing — only the
rendering withholds it, and only for the non-organiser.

**Supporting API measurement** — `GET /api/v1/calendar/meetings/{id}` as *both* accounts:
```
as qa.e.alice  status 200  participants ABSENT  participant_count 0  is_private false
as qa.e.bob    status 200  participants ABSENT  participant_count 0  is_private false
```
The meeting-detail payload carries no `participants` array at all and reports
`participant_count: 0` for a meeting that has one invited participant (bob received the
invitation notification, and alice's own card renders "QA Bob / optional / Pending").
The organiser's list is therefore assembled client-side from the workspace member
directory; the invitee's render path does not do so.

**Not ALK-3197.** That ticket is the *organizer* slot ("Организатор недоступен") flickering
for the duration of a background refetch, gated on `fetchStatus`. This is the *participant
list*, a different string, persistent rather than transient, and conditioned on the viewer's
role rather than on request timing.

**Как должно быть.** Приглашённый на встречу видит в её карточке список участников —
тот же, что видит организатор.

### BUG-2 [High] [backend] Global search никогда не находит людей и каналы — `users` и `channels` всегда пустые

`GET /api/v1/search?q=&company_id=&workspace_id=` returns 200 with the full envelope
`messages,files,users,channels,total_messages,total_files,total_users,total_channels`,
but `users` and `channels` are empty for every query, including ones that match
unambiguously:

```
q=bob          200  messages 0  files 0  users 0  channels 0
q=alice        200  messages 0  files 0  users 0  channels 0
q=general      200  messages 0  files 0  users 0  channels 0
q=qa-general   200  messages 0  files 2  users 0  channels 0
q=qa           200  messages 0  files 2  users 0  channels 0
```

Those entities exist and are visible to the searching account: QA Bob and QA Alice are
workspace members (Directories → People finds "bob" in one keystroke), and `qa-general`
is a channel alice is a member of (Directories → Channels finds "qa-gen").

**The UI faithfully reflects the API** — the Global search dialog shows tabs
`All 0 / Messages 0 / Channels 0 / People 0 / Files 0` and the line
`No results for "alice". Try other words or clear the filters.` The dialog's own copy
promises the opposite: "Search across channels, direct messages, people, and files."
So the defect is in the endpoint, not the rendering.

**Not staging index drift.** Posted a message with a unique token and searched for it:
```
POST /api/v1/messaging/messages {channel_id: <#qa-general>, body:"search index probe zarplexmt9oq1kn"}
  -> 200  id M4OWBH17Y3NG5L5

GET /api/v1/search?q=zarplexmt9oq1kn   +2s  -> 200  total_messages 1
                                       +6s  -> 200  total_messages 1
                                      +12s  -> 200  total_messages 1

GET /api/v1/search?q=probe             -> 200  total_messages 2  total_users 0  total_channels 0
```
Message indexing is live and near-instant on the same deployment, on the same call that
returns zero users and zero channels. The index is healthy; users and channels are simply
never populated.

**Как должно быть.** Поиск по workspace находит людей по имени и username и каналы по
названию — ровно те, что уже находит справочник Directories, — и показывает их на
вкладках People и Channels.

### BUG-3 [Medium] [backend] Поиск файлов сопоставляет запрос по любому слову, поэтому точное имя файла возвращает посторонние файлы

Two files in the workspace: `qa-e-note.txt` and `qa-e-image.png`.

```
q=qa-e-image   200  files 2   <- returns qa-e-note.txt as well
q=qa-general   200  files 2   <- matches neither file's name
q=qa           200  files 2
q=general      200  files 0
q=bob          200  files 0
```

`qa-general` matches no file name, yet returns both files; `general` on its own returns
none. The query is split on `-` and any single token is enough to match, so the leading
`qa` pulls in every file. Searching for an exact filename therefore returns unrelated
files, and a query about a channel returns files that have nothing to do with it.

Visible in the UI as well — typing `qa-e-image` in Global search lists both files and
prints `Showing 2 results for "qa-e-image". 2 total: 0 messages, 0 channels, 2 files, 0 people`.

**Как должно быть.** Файл находится по своему имени; запрос, состоящий из нескольких
слов, сужает выдачу, а не расширяет её.


### BUG-4 [Medium] [backend] Уведомление о приглашении на встречу приходит одной сырой английской строкой с ссылкой-токеном, а отправитель подписан username вместо имени

`GET /api/v1/notifications?limit=5` — notification payload for a meeting invitation:

```
keys: id,user_id,type,title_key,title,body,read,created_at,workspace_id,
      actor_id,actor_name,category,event_type,resource_id

title_key : "NOTIF_TITLE_MEETING_INVITE"
title     : "Meeting invitation"
actor_name: "qa_e_alice"
body      : "You've been invited to \"QA-E Sync 1\" — Aug 26, 2026 3:00 PM (Asia/Tashkent).
             Join: https://airion-cargo.store/calendar/join/17a0df82a7cda53e3110778ff
                   8b80a201435c260e83c9e08cfdc0b5ffa7108b6"
```

Three things wrong in one payload, all composed server-side:

1. **The join link is printed raw into the body text.** 64 hex characters of token
   rendered as plain text inside the notification row. The row itself is already a
   working link (clicking it navigates to the meeting — verified below), so the URL adds
   nothing but noise and pushes the meeting name and time out of view.
2. **`actor_name` carries the username, not the display name.** The panel renders
   `qa_e_alice · Workspace` while the same person is "QA Alice" everywhere else in the
   product, including the avatar initials shown on that very row.
3. **The body is not localizable.** `title` has a companion `title_key`
   (`NOTIF_TITLE_MEETING_INVITE`); `body` has no key and arrives as a finished English
   sentence, so it stays English whatever the interface language is. (Related to but
   distinct from ALK-3003, which is about the *date format* in this panel.)

Panel text as the user sees it:
```
Notifications | Mark all as read
QA | Meeting invitation | qa_e_alice · Workspace
You've been invited to "QA-E Sync 3" — Aug 26, 2026 5:00 PM (Asia/Tashkent).
Join: https://airion-cargo.store/calendar/join/28f4dbab1e032e19fdf5b127278a9f73…
Aug 26, 10:51 AM
```

**Как должно быть.** В уведомлении о приглашении видно название встречи, время и от кого
оно — под отображаемым именем человека. Ссылка на присоединение — это действие строки
(или отдельная кнопка), а не строка текста с токеном. Текст уведомления собирается по
ключу и переводится вместе с интерфейсом.


---

## Duplicates — measured, not filed

**Files: пустой раздел My files объясняет пустоту фильтром.** `/w/{ws}/files` with no files
shows "No files here / Nothing matches this filter yet." while scope = **My files**,
FILE TYPE = All files and the search box is empty — no filter is applied.
Storage panel agrees: `0% · 0 B of 10 GB used · 0 files`.
**Dup of ALK-3200… no — of ALK-3002**, whose confirmed root cause is stated generally:
"Библиотека использует одно и то же сообщение о фильтре для любого пустого результата."
ALK-3002 reports it on *Shared with me*; My files is the same defect on another tab.
Not filed — added here so a later session does not re-discover it.

## Withdrawn

**"Meeting dialog stays open after a successful create."** First run appeared to show the
Schedule-meeting dialog still open 4.5 s after submit with 0 chips, while the meeting had
in fact been created. **Rig artifact, not product behaviour.** That run used a loose
`button:has-text("Schedule meeting")` locator, which also matches the dialog heading text.
Re-ran twice with the strict `button[type=submit]:has-text("Schedule meeting")`:
- without invitee: dialog trace `1000000000000000000000000` — closed on the first
  300 ms sample; chips went 2→3; `POST /calendar/meetings` → 200
- with invitee QA Bob ("Selected (1)"): dialog trace `100000000000000000000000000`;
  chips `233333…`; `POST /calendar/meetings` → 200
Dialog closes immediately and the chip appears in both cases. No defect.

## Verified working

- **Directories — search filter, both tabs.** `Search people or channels` filters within the
  active tab and never leaks across it: People/`bob` → 1 result (QA Bob);
  People/`qa-gen` → "No people match your search."; Channels/`qa-gen` → qa-general;
  Channels/`bob` → "No channels match your search."; both tabs on `zzzznope` → correct
  empty state.
- **Directories — People tab** lists all 7 workspace members; the viewer's own row correctly
  offers no Call/Message action.
- **Directories — Channels tab** shows public channels with the correct affordance per
  membership: `qa-empty` → Join (not a member), `qa-general` → Open (member).
  The archived channel is not listed.
- **Calendar — meeting creation** via New meeting: fields, duration presets, access modes,
  member picker; `POST /calendar/meetings` → 200; chip appears immediately in week view.
- **Calendar — invitations.** Invitee received `Meeting invitation` notifications for exactly
  the two meetings they were invited to (Sync 1, Sync 3) and none for the one they were not
  (Sync 2); bodies carried the correct titles and local times (3:00 PM / 5:00 PM).
- **Calendar — RSVP controls** (Yes / No) are present on the invitee's meeting card.
- **Calendar — public meeting visibility.** A public meeting the user was not invited to is
  visible in the workspace calendar grid, consistent with "Anyone in the workspace can join".

## Low — logged, not reported (cosmetic, trimmed at triage)

- Calendar week grid: the hour axis is zero-padded 24h (`00:00`…`23:00`) but the
  corresponding cell buttons are named unpadded (`Create event Monday at 0:00`).

## Additional verified working (second half of the box)

- **Files — upload.** `Upload` opens an upload dialog with a review queue before sending:
  two files staged as `2 uploads, 7.7 KB` with per-file `Waiting to upload` and a
  `Remove from queue` control each. `Upload 2 files` → two `POST /api/upload/api/v1/files/upload`
  → both 200, queue rows go to `Uploaded / 100%`, list, storage panel
  (`7.9 KB of 10 GB used · 2 files`) and the FILE TYPE counters (`Images 1`, `Documents 1`)
  all update without a reload.
- **Files — download/content.** `GET /api/v1/files/{id}/content` → 200 for both, correct
  `content-type`, and `content-disposition` correctly differentiated
  (`inline` for the image, `attachment` for the text file). The `.txt` round-trips
  byte-exact (47 B in, 47 B out).
- **Files — viewer.** Clicking a file name opens the viewer with the image at natural size
  (64×64 natural, 64×64 rendered) and controls `Download`, `Open original`, `Close`.
- **Search — messages.** Index is live and near-instant (see BUG-2 measurement).
- **Search — empty state** is correct and distinguishes itself from the filtered case:
  `No results for "zzqqxx99". Try other words or clear the filters.`
- **Search — dialog affordances** present: date filters (Last 7 days / Last 30 days /
  All time), sort (Relevance), tabs (All / Messages / Channels / People / Files),
  typed-filter hint (`:in #general`, `:@ Alex`), keyboard legend, `Open full search`.

## Measured, not reported — needs product intent

- **PNG uploads are re-encoded server-side.** Source file 7858 B,
  `sha256 0785a2c4…`; the same file downloaded back is 8071 B (+213),
  `sha256 7626423d…`, still a valid PNG (`89 50 4e 47 0d 0a 1a 0a`).
  The `.txt` uploaded alongside it round-trips byte-exact, so this is specific to images.
  Plausibly a deliberate image pipeline (EXIF strip / re-compress), so not written up —
  but a user does not get back the file they uploaded, and nothing on screen says so.
  Worth a product answer before anyone files it.
- **Files page copy leaks an implementation detail.** The FILE TYPE counters read
  `2 loaded` / `1 loaded` and the CHATS filter reads `No chats in loaded files` —
  "loaded" is about client-side pagination, not about the user's library.

## Late-session notes

- **Notifications bell — verified working.** Badge is accurate and live:
  `aria-label="Notifications, 2 unread"` with badge text `2`, matching the two
  invitations in `GET /api/v1/notifications`. Panel lists both with sender, scope and
  timestamp, and offers `Mark all as read`.
- **Notification click-through — verified working, and ALK-2834 does not reproduce here.**
  Clicking a `Meeting invitation` row navigated
  `/w/{ws}/c/{channelId}` → `/w/{ws}/calendar/{meetingId}`, opened the meeting card, and
  dropped the badge to `Notifications, 1 unread`. ALK-2834 ("Клик по Calendar notification
  не открывает соответствующее событие") therefore does not reproduce for the
  meeting-invitation notification type on `v0.61.0-rc.3`. Not re-filed and not claimed
  fixed — the ticket may concern a different calendar notification type.
- **Calendar Day view summary says `participants 0`** for a day holding three meetings,
  one of which has an invited participant plus its organiser. Consistent with the
  `participant_count: 0` measured in BUG-1. **Not filed — dup of ALK-2522**, which a
  previous session already recorded as the home for `participant_count = 0`
  (see `reports/README.md`, row for `aloqa-v060-qa-2026-08-25-A.html`).

## Withdrawn (2)

**"Scoped in-channel search loses the tab counters and renders empty section headings."**
Read off an `innerText` snapshot taken 2.6 s after typing, which showed
`All | Messages | Channels | People | Files` with no numbers, followed by bare
`CHANNELS / PEOPLE / FILES` headings. Re-measured by enumerating the tab elements
themselves in both modes:

```
scoped   (chip "in #qa-general"):  All=2  Messages=2  Channels=0  People=0  Files=0
unscoped (no chip):                All=2  Messages=2  Channels=0  People=0  Files=0
```
Counters are present and identical in both. The first read was a render-timing artifact of
the text snapshot. The empty-section-heading part could not be confirmed either — the
heading selector matched nothing in either mode, which is absence of evidence, not
evidence of absence, so it is not reported.

## Also verified working (late)

- **In-channel search.** `Search in channel` opens the global search dialog pre-scoped with
  an `in #qa-general` chip; searching found both messages in that channel, and the
  no-match case gave the correct empty state. Scoped and unscoped agree on counts.
- **Presence.** With exactly two browsers signed in, `GET /workspaces/{ws}/presence` and
  `GET /workspaces/{ws}/members` both report exactly those two accounts `online: true`
  and the other five `false`. No drift between the two endpoints.

## Withdrawn (3) and (4) — calendar views

**"The Day button does not switch to Day view."** First pass clicked Day and read back the
header `24–30 August 2026` with 3 chips — identical to Week. Re-measured with a settle and
a stricter locator (`filter({hasText:/^Day$/})`): header `Wednesday, August 26`,
`calendar-day-header-stat-meetings` present, 3 × `calendar-event-chip`, 3 title hits.
Day view works; the first read was taken before the view had re-rendered.

**"Month view silently drops an event — it shows 2 of 3 meetings."** Month view does render
only 2 × `calendar-month-event-chip` for a day holding 3 meetings, but the cell also carries
an overflow control, so nothing is hidden without saying so:
```
cell 26: "26 | 15:00 | QA-E Sync 1 … | 16:00 | QA-E Sync 2 … | +1 more"
cell buttons: calendar-month-day-number "Wednesday, August 26"
              calendar-month-event-chip "QA-E Sync 1"
              calendar-month-event-chip "QA-E Sync 2"
              (no testid)               "+1 more"
```

**And the follow-on candidate, "the +1 more control is disabled and the third meeting is
unreachable", is also withdrawn — it was a rig artifact.** Playwright reported
`element is not enabled` for 30 s, which looked like an unreachable control (High by our own
scale). Measuring the element itself, twice, on two fresh loads:
```
trace over 10 s (e = enabled):   eeeeeeeeeeeeeeeeeeee     (both runs)
disabled: false   aria-disabled: null   pointer-events: auto   opacity: 1
aria-haspopup: dialog   aria-expanded: false   data-state: closed
rect: 237×28 at top 850   elementFromPoint(centre) -> BUTTON   (the button itself)
```
A direct `.click()` opens the popover with **all three** meetings:
```
"Events for Wednesday, August 26 | 15:00 | QA-E Sync 1 … | 16:00 | QA-E Sync 2 …
 | 17:00 | QA-E Sync 3 …"
aria-expanded -> "true"   data-state -> "open"
```
The button sits at `top: 850`, below the fold — the same class of trap CLAUDE.md already
warns about for event chips. `scrollIntoViewIfNeeded()` plus Playwright's actionability
check produced the false "not enabled"; the control is fine.

**Month view — verified working.** Two chips plus an accurate `+1 more`, and the overflow
popover lists every meeting for the day.
**Calendar navigation — verified working.** `Next` → September 2026, `Previous` → August 2026,
`Today` → August 2026; Day / Week / Month headers each render their own range
(`Wednesday, August 26` / `24–30 August 2026` / `August 2026`).
**Files — scopes, type filters and sort verified working.** `Images` → only the PNG;
`Documents` → only the txt; `Videos` and `Shared with me` → empty; sort by `Name` →
image, note; by `Size` → 7.9 KB, 47 B; by `Date` → upload order. Every filter agrees with
the underlying file list.

## Resolved: the Directories "OTHER" grouping

Earlier noted as an open question. Measured rather than left hanging:

```
People tab, unfiltered:  a single section heading "OTHER" with count 7,
                         containing every workspace member
grouping controls in main (group/sort/filter/role/team/department): none
```
(The "QA"/"QB"/"QC" strings that look like headings are avatar initials, not section
labels — an artifact of the first uppercase-text sweep.)

So the People directory always renders one section, always labelled `OTHER`, with no
control to change or explain the grouping. Most likely `OTHER` is the fallback bucket for
members with no team or department set, which is true of every fixture account — in which
case the label is technically correct and the only oddity is showing a group header at all
when there is exactly one group, named for the absence of a value.

**Not reported.** Low, and plausibly correct fallback behaviour rather than a defect;
it would need a workspace where some members *do* have the grouping field set to tell the
two apart, which lane E does not have. Recorded here so it is not re-opened as a mystery.

## Meeting edit — verified working

**Edit opens and pre-fills — verified working.** The organiser's meeting card carries
`Close, Yes, No, Invite by email, Start meeting, Edit, Delete`; `Edit` (a 44×44 icon
button, `visibility: visible`, opacity 1) opens a second dialog `Edit meeting` over the
card. Confirmed on two consecutive fresh loads — visible input count went 0 → 8 within
500 ms both times — and the form is correctly pre-filled:
```
title  : value "QA-E Sync 2"   (aria-label "Add title")
access : radio "public" checked, "private" unchecked   <- matches the meeting
footer : "Added participants receive an invitation; removed ones are notified."
         Cancel | Save
```
Three earlier attempts to click `Edit` failed (`locator.click` timeout, then
`clickTargetCount: 0`) — all rig artifacts of locator timing, not product behaviour. A
coordinate click taken from a fresh `getBoundingClientRect()` works every time.

**Withdrawn (5) — "the Edit form has no date or time fields."** The input enumeration is
accurate but the inference from it was wrong:
```
ed.querySelectorAll('input[type=time], input[type=date], input[type=datetime-local]').length  ->  0
visible inputs: text[Add title] | checkbox | radio | radio | checkbox | checkbox
                | textarea("Add description") | search("Search members")
```
Enumerating the form's **buttons** as well — which is what CLAUDE.md asks for and what the
first pass skipped — shows the date and time controls are there, rendered as buttons rather
than native inputs:
```
visible buttons: Close
                 "Date and time: Aug 26, 04:00 PM"
                 "End date and time: Aug 26, 04:30 PM"
                 15 min | 30 min | 45 min | 1 hr | 1.5 hr | 2 hr
                 Aloqa Meet | Meeting settings | External link | In person | Room
                 QA Admin | QA Bob | QA Carol | QA Dave | QA Guest | QA Owner
                 Cancel | Save
form text:       "Edit meeting | Aug 26, 04:00 PM | Aug 26, 04:30 PM | All day | Duration | …"
```
Identical on two consecutive fresh loads. Both controls carry the meeting's current time,
so a scheduled meeting can be rescheduled from its own Edit form. **Meeting edit — verified
working**, including date/time.

This is the exact failure the "prove absence by enumerating elements" rule exists to stop:
the create dialog uses native `input[type=time]`, the edit dialog uses button-based
pickers, and counting inputs alone made a working form look broken. It was written up as an
unverified candidate rather than a finding, then measured properly and withdrawn — the box
had room for the second run after all.

## Meeting deletion — verified working

Confirmation is explicit and names the meeting and the consequence:
```
"Delete meeting? | This permanently removes \"QA-E Sync 2\" for everyone.
 Participants will no longer see it. | Cancel | Delete meeting"
```
Confirming:
```
POST /api/v1/calendar/meetings/S4OWB4FP4CVMHON/cancel   -> 200
dialog trace: 20000000000000000   (both dialogs close on the first 500 ms sample)
chip trace:   32222222222222222   (grid drops 3 -> 2 immediately)
GET /calendar/meetings (same day) -> ["QA-E Sync 1", "QA-E Sync 3"]
```
No stale chip, no reload needed, API and grid agree.

Worth a note rather than a finding: the control is labelled **Delete** and the copy promises
permanent removal, but the endpoint is `/cancel`. The user-visible outcome matches the
promise — the meeting leaves the list — so nothing is wrong on screen. Whether an invitee
should be able to tell a cancelled meeting from a deleted one is a product question, and
the adjacent case is already open as ALK-3014 ("Ссылка на удалённую встречу открывает
карточку без сообщения об отмене"). Not filed.


## Files — favourites verified working

Per-row controls on the files list: `Select <filename>`, `Favorite`, `More actions`.

```
click Favorite on the image row
  -> PATCH /api/v1/files/F4OWBD79HC09BRJ   200

GET /users/me/files?scope=own   ->  qa-e-note.txt  fav false
                                    qa-e-image.png fav true
Favorites filter               ->  "qa-e-image.png | 7.9 KB · Today"   (only that file)
after full page reload         ->  qa-e-note.txt  fav false
                                    qa-e-image.png fav true
```
Toggle persists to the server, the filter agrees with it, and it survives a reload.

Note on the empty state: with the `Favorites` filter active and nothing favourited, the
list correctly reads "No files here / Nothing matches this filter yet." — here a filter
genuinely *is* applied, which is exactly the case ALK-3002 says should keep that wording.
The defect logged above is the same string appearing on unfiltered `My files`.


### BUG-5 [High] [frontend] Бейдж непрочитанных в сайдбаре не обновляется без перезагрузки — он показывает значение на момент загрузки страницы

Sequential two-account check (bob posts, then alice observes — not a race). Alice parked on
`/directories` throughout so `#qa-general` accrues unread; her page is never reloaded during
an observation window.

**Run 1 — page loaded at 0 unread, badge never appears.**
```
bob: POST /messaging/messages -> 200
GET /workspaces/{ws}/unread   ->  1,1,1,1,1,1,1,1,1,1   (10 samples / 10 s)
sidebar aria-label            ->  "qa-general"          (unchanged in all 10)
row children                  ->  svg, SPAN             (2 — no badge node)
```
The unread row was byte-identical to a read one — same font-weight 400, same colour
`rgba(94,105,123,0.973)`, same class string, same two children.

**Fresh load proves the badge itself works.**
```
aria-label   "qa-general, 1 unread messages"
innerText    "qa-general 1"
children     svg, SPAN, SPAN        (3 — badge node present)
qa-private   "qa-private"           (no badge, correctly)
```

**Run 2 — page loaded at 1 unread, badge freezes at 1.**
```
bob: POST /messaging/messages -> 200   (second message)
GET /workspaces/{ws}/unread   ->  2,2,2,2,2,2,2,2,2,2,2,2   (12 samples / 12 s)
sidebar aria-label            ->  "qa-general, 1 unread messages"   (all 12 samples)
```
The server says 2, the sidebar says 1, for the full observation window.

Both runs agree: the badge is computed at page load and never updated afterwards. A person
sitting in the app does not see new messages arrive — the only way to learn about them is to
reload or to open the channel.

**Как должно быть.** Счётчик непрочитанных в сайдбаре меняется при получении сообщения, без
перезагрузки страницы.

**Для триажа.** ALK-2905 описывает тот же симптом, но **для приглушённого канала**;
`#qa-general` не приглушён. Вероятно, это один и тот же корень, и ALK-2905 — частный случай.
Проверять и заводить как одну проблему, а не как две.

**Побочно, Low, не заводится отдельно:** строка бейджа не согласует число и слово —
`"qa-general, 1 unread messages"` вместо `1 unread message`.


## Recent searches — feature not present (not a defect)

SECTORS.md lists "recent searches" as an in-scope surface. It does not exist on this build,
on either search surface, so there is nothing to test rather than something broken.

```
Global search dialog, empty query, BEFORE any search:
  "Search messages, channels, people, and files. Cmd+K to open."
  buttons: Last 7 days | Last 30 days | All time | Relevance
           All | Messages | Channels | People | Files | Open full search

Same dialog, AFTER running a search and reopening it:
  byte-identical text and the same button list — no recents section, no recent chips
```
Also checked the full search page (`Open full search` → `/w/{ws}/c/{channelId}/search`):
same empty state, same nine controls, one input. No recents there either.

**Not written up** — an unbuilt feature is not a defect. Recorded so the next sector-E
session does not spend its box looking for it.

**Low, logged not reported:** the full search page is headed `Search messages` while its own
subtitle and tabs promise `messages, channels, people, and files`. Given BUG-2 the heading is
currently the more honest of the two, which is its own comment on the state of that endpoint.


## Workspace switcher — verified working (single-workspace case)

```
click "Open workspace menu"
  -> "WORKSPACES | QW  QA Workspace E  Current | Create workspace"
  items: "QA Workspace E", "Create workspace"
```
The account's one workspace is listed and correctly marked `Current`, with `Create
workspace` as the only other action. Correct for an account in a single workspace.

**Caveat on coverage:** this does not exercise the switcher's actual job. Every lane-E
fixture account belongs to exactly one workspace, so there is nothing to switch *to* —
the multi-workspace path (list ordering, switching, unread carried across workspaces,
which workspace loads on next sign-in) is untested and cannot be tested on these fixtures
without creating a second workspace. A previous session created a second workspace
`QA Second` on lane A for exactly this kind of case (see `reports/README.md`); doing the
same on lane E would unblock it.


## Calendar join landing page — checked, one Low logged not reported

Opened an invitee's own invitation link for a meeting that has not started. Landing page
only; joining is sector B's scope and was not exercised.

```
GET /calendar/join/<token>   (as the invited user)

"The meeting has not started yet | QA-E Sync 1 | Start: Wed, Aug 26, 15:00
 | You can join from 14:30 | Leave"

visible buttons/links:  ["Leave"]   — the only control on the page
```

**Verified working:** the page states plainly that the meeting has not started, names it,
gives the start time, and tells the user the exact time from which joining is possible
(14:30 for a 15:00 meeting — a 30-minute window). That is a good dead-end page compared with
ALK-3477, which reports a stale invite link rendering as one line of text with no controls
at all.

**Low, logged not reported:** the sole control is labelled `Leave`. The user has not joined
anything — they followed an invitation link to a meeting that has not begun — so `Leave`
describes an action they are not in a position to take. `Back to workspace` or `Close` is
what the page needs. Trimmed under the standing rule that copy trivia gets filtered at
triage rather than filed; recorded here with the measurement so it is not re-discovered.


## Meeting edit — saving verified working

Closed the last gap in the edit path: not just opening the form, but saving it.

```
open the organiser's meeting card -> Edit -> change the title -> Save

PATCH /api/v1/calendar/meetings/S4OWB38X0FRCCS3   -> 200

GET /calendar/meetings (same day) -> ["QA-E Sync 1 renamed", "QA-E Sync 3"]
grid chips                        -> "QA-E Sync 1 renamed 15:00-15:30", "QA-E Sync 3 17:00-17:30"
```
The new title persists to the server and the calendar chip updates immediately, without a
reload. Edit is therefore verified end to end: opens, pre-fills, saves, and the grid reflects
it.

**Cross-user half — verified working on a fresh load.** The invitee's calendar shows the new
title in both the API and the grid:
```
GET /calendar/meetings (as the invitee) -> ["QA-E Sync 1 renamed", "QA-E Sync 3"]
grid chips                              -> "QA-E Sync 1 renamed 15:00-15:30", "QA-E Sync 3 …"
```
So the calendar does **not** reproduce the shape of ALK-2899 / ALK-3454 (meeting name not
reaching other participants) — at least not on a fresh load.

The invitee's existing notification still reads `You've been invited to "QA-E Sync 1"` with
the old title. That is correct, not a defect: a notification records what happened at the
time it was sent, and rewriting history to match a later rename would be worse.

**Still not checked:** the live path — whether an already-open invitee calendar updates the
title without a reload. Given BUG-5, live propagation in this app deserves its own check
rather than an assumption either way. Next session: rename from the organiser, then read the
invitee's already-open calendar without reloading.


## Reminders — verified working (and withdrawal 6)

Retried inside the box with the coordinate-click method and it works:

```
control: <button aria-haspopup="listbox" aria-expanded="false">  text "No reminder"
coordinate click from a fresh getBoundingClientRect()

aria-expanded trace (8 × 500 ms):  true,true,true,true,true,true,true,true
visible [role=option] count:       6,6,6,6,6,6,6,6
options: "No reminder" | "5 minutes before" | "10 minutes before"
         | "15 minutes before" | "30 minutes before" | "1 hour before"
```

**Withdrawn (6) — "the Reminder control opens no menu."** Same root cause as three earlier
withdrawals: my locator was wrong, not the product. `button:has-text("Reminder")` matched a
**label**, while the actual trigger is a listbox button labelled with its current *value*
(`No reminder`) — the word "Reminder" is not in it. A control named for its state rather
than its purpose is invisible to a name-based selector.

Not exercised: selecting an option and confirming the reminder actually fires at the chosen
offset. That needs a meeting scheduled minutes ahead and a wait, which the box had no room
for.


## File row actions and File Details — verified working

```
"More actions" on a file row (coordinate click) opens:
  Share… | View details | Download | Remove favorite | Delete file
```
`Remove favorite` correctly reflects that this file *is* favourited (set earlier this
session), so the menu reads live state rather than a fixed label.

**Not a finding, and not verified either way:** my selector counted 2 visible menu
containers and listed the five items twice. Almost certainly one menu matched by both
`[role=menu]` and its `[data-radix-popper-content-wrapper]` parent — i.e. nesting, not
duplication, and my own query's fault. Recorded rather than reported: after six selector-
caused false alarms today, an unverified counting artifact does not get promoted to a
finding at the buzzer.

**File Details panel — opened and verified working.** `View details` opens an inline side
panel (not a dialog):
```
Details | qa-e-image.png | 7.9 KB | Share
Uploaded by  You        Date added  Today
File type    PNG        Size        7.9 KB
SHARED WITH  "Not shared with anyone yet."
actions: Close preview | Open full-size image | Share | Download
         Share with more | Copy link | Remove from favorites | Delete file
```
Every field matches the uploaded file, and `Remove from favorites` again reflects live state.
No channel row appears — correct here, since this file was uploaded directly rather than sent
in a conversation, which is also why ALK-3200 (channel name in File Details not opening the
channel) could not be exercised on it. Testing that needs a file sent into a channel — a
sector C artefact reached from the sector E surface, and the cleanest way to test the
border the two sectors share.


## File isolation between accounts — verified working

Final check of the box. Alice has two files, neither shared with anyone
(`SHARED WITH: "Not shared with anyone yet."`). From the second account, in the same
workspace:

```
GET /users/me/files?workspace_id=…&scope=own          ->  total 0, []
GET /users/me/files?workspace_id=…&scope=accessible   ->  total 0, []
UI: "No files here | Nothing matches this filter yet."
```
No leak in either scope — an unshared file is invisible to another workspace member, and
the UI agrees with the API.

Side note confirming the ALK-3002 duplicate on a second account: this empty `My files` also
says "Nothing matches this filter yet." with no filter applied, exactly as observed on the
first account. Same defect, same wording, two accounts — still not filed, still ALK-3002.


## Archived channels — partial, at the buzzer

```
GET /workspaces/{ws}/channels  ->  ["qa-general", "qa-private"]
```
The archived channel is correctly absent from the active channel list even though this
account is a member of it, matching what the sidebar and the Channels directory showed
earlier in the session.

`GET /users/me/channels/archived` first returned `400 COMMON_INVALID_INPUT — invalid query
parameter "workspace_id"` because I omitted the parameter. That was my call, not a defect.
Re-run correctly in the final seconds of the box:
```
GET /users/me/channels/archived?workspace_id=…   ->  200   ["qa-archived"]
```
**Archived channels — verified working.** The account is a member of the archived channel;
it appears in the archived list and is correctly absent from the active channel list. Both
endpoints agree with each other and with the sidebar.


## Not reached in the box

The file details panel; sidebar unread and badge behaviour under
live traffic; workspace switcher; saving an edit (the form opens and is pre-filled; `Save` was not exercised); reminders; the calendar join landing page; recent searches; the
Directories `OTHER` grouping question above.

## Report format

Restructured at the end of the box to the standing finding format (CLAUDE.md:90), after a
request from a parallel session: bracket-tagged titles (`[BE][SEARCH]`,
`[FE-WEB][CALENDAR]`, `[BE][SEARCH]`, `[BE][NOTIFICATIONS]`), then
Проблема / Как воспроизвести / Фактический результат / Ожидаемый результат / Проверка.
Проблема runs 47/46/40/53 words; the measurement blocks moved under Фактический результат
unchanged. Tag balance checked programmatically and the leak grep re-run clean before
republishing to the same URL.

The «Проверка» lines are drawn from boundaries actually probed this session — the live
index check, the no-invitees meeting, the single-word-vs-multi-word file queries, and the
bell-count decrement on click-through — not written as generalities.

## End-of-run housekeeping

- Report render verified by serving the HTML locally (`python3 -m http.server`) and viewing
  it: header, lede, summary table with bracket tags, and the severity/area chips all render
  correctly in dark mode. Scrolling further was abandoned — the Claude Browser pane went
  `hidden` and the call timed out; not re-run, per the "don't re-run a tool that returned
  nothing useful" rule. Tag balance was already verified programmatically, so the render
  check was confirmation, not the primary evidence. Local server stopped and the temp folder
  removed.
- **Shared rig helpers untouched** (`lib.mjs`, `api.mjs`, `login.mjs` clean in `git status`).
  Every snippet this session created is `e-`-prefixed — 51 of them — so nothing collides with
  a parallel lane.
- `scripts/callrig/drive.mjs` and `launch.sh` show as modified, but neither was touched here:
  both were already modified at session start, and `launch.sh` was changed mid-run by a
  parallel session adding per-lane browser caps (4 per lane, 20 total). Lane E stayed at 2
  browsers throughout.
- **Left on lane E:** meetings `QA-E Sync 1` (15:00, bob invited, Pending) and `QA-E Sync 3`
  (17:00, bob invited, Pending) on 2026-08-26; `QA-E Sync 2` was deleted as part of the
  deletion test. Two files uploaded by alice (`qa-e-note.txt` 47 B, `qa-e-image.png`), and
  two probe messages in `#qa-general` containing the token `zarplex…`. All harmless on
  disposable fixtures, but they will show up in that day's calendar, the files library and
  message search.
- **Not filed in Jira** — no ALK issues created and no comments posted, per the standing rule
  that filing is the user's decision.

## Cross-session check before publishing

Ran the withdrawn-findings sweep over previous sessions
(`grep -il 'ложн|false positive|отозв' logs/*.md reports/README.md`) and read every hit
touching search, calendar participants, notifications, files and directories. Nothing this
session reports was previously killed as a false positive.

One hit is directly relevant and strengthens BUG-1 rather than duplicating it. The 25.08
lane-A session recorded, as an aside supporting a different finding about
"Did not take place" copy, this invitee-side calendar card:

```
QA-A-SCHED3 | Tuesday, August 25, 11:19–11:34 | 15 min | Scheduled by QA Alice
Participant list unavailable | Your response: Yes / No | Start meeting [disabled]
```

Same string, same surface, an invitee, a different lane and an earlier build. It was never
diagnosed or filed — it sat in that log as scenery for another finding. So the defect is at
least a day old and survives across builds, and this session is the first to isolate it,
establish the condition and prove persistence. Noted in the report's «Для триажа» block so
whoever files it knows it is not new.

Two «Для триажа» blocks added (CLAUDE.md's optional section, used only where the dedup pass
had something to say): BUG-1 — not new, and must not be merged with ALK-3197 (different
string, different mechanism, transient not persistent) or ALK-2522; BUG-4 — ALK-3003 is the
same screen and likely the same fix site, and ALK-2834 does not reproduce on this build.
