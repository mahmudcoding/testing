# AIRION QA — 2026-08-26 — lane E — verification pass over `aloqa-workspace-qa-2026-08-26-E.html`

Target report: `reports/aloqa-workspace-qa-2026-08-26-E.html`
Artifact: https://claude.ai/code/artifact/2c75f8a0-ae97-4de8-b054-2c4048af9ca0
Original session log: `logs/AIRION-QA-2026-08-26-E-workspace.md` (present — full provenance available)

Report build: `v0-61-0-rc-3-15da3ead76e1` (tag `v0.61.0-rc.3`, FE commit `15da3ead76e1`)
Verify build: `v0-61-0-rc-4-b117816aa788` (tag `v0.61.0-rc.4`, FE commit `b117816aa788`)
Range: **7 frontend commits**. Backend: no commits touching search or notifications since 2026-08-24.

Lane E (lane A is held by a parallel verify pass). Browsers: alice :9262, bob :9263.
Started 11:56 +05.

## Current state

**Pass complete.** All five findings challenged, **all five reproduced, none removed.**
Two corrections made to the report, one of them substantive:

- **BUG-2 relabeled `[FE-WEB][CALENDAR]`/frontend -> `[BE][CALENDAR]`/backend**, and its
  cause block rewritten. The original measurement probed for a response field named
  `participants`; the field that exists is `attendees`, and it is sent to the organizer and
  withheld from the invitee. The frontend was never at fault.
- **BUG-1's reproduction path was unusable as published** — it said `Cmd+K` in a channel
  opens Global search. In a channel the composer holds focus and `Cmd+K` opens its
  `Insert link` dialog. Rewritten to the sidebar search button.
- BUG-3 refined (tokenises on hyphens/dots, ranking is fine, recall is the problem),
  BUG-4 refined (the title is not translated either, despite having a key),
  BUG-5 strengthened (visibility note ruling out background throttling).

Report corrected in place and republished to the same artifact URL.

## Build range — what could plausibly have fixed any finding

```
b117816aa chore(staging): admit v0.61.0-rc.4 from develop
3d54dcafb docs(calls): record why a pin cannot raise video quality (#2797)
4e6684042 chore(tooling): stop format:check reading built Storybook (ALK-3496) (#2799)
5fae0c222 fix(release): reset staging and its host before a new train's rc.1 (ALK-3201) (#2784)
95a7026d2 fix(calls): keep side-room occupants in the main call and badge them by focus (ALK-3479) (#2783)
7cd290506 perf(web): publish the current normalized baseline (ALK-3421) (#2794)
4fc8e7c39 refactor(ui): give empty, error and notice states two primitives (ALK-3464)
```

Per-area: `search` 0 commits, `files` 0, `settings` 0, `admin` 0.
`calendar` and `chat` are touched only by `4fc8e7c39`, and only in `CalendarErrorBanner.tsx`
and `chat/ui-web/ErrorState.tsx` — a presentation refactor onto two new ui-kit primitives
(`StateBanner`, `StatePanel`), no participant-list and no unread-badge logic.
So **no fix in range for any of the five findings**: every non-reproduction here would be a
genuine challenge to the original measurement, not a fix explaining it away.

## Findings under verification

| # | severity | area | claim | verdict |
|---|---|---|---|---|
| BUG-1 | High | backend | Global search never returns people or channels — People/Channels tabs always 0 | **CONFIRMED** (repro steps corrected) |
| BUG-2 | High | frontend -> **backend** | Meeting participant list shown only to the organizer, and only when there are invitees | **CONFIRMED, area label wrong, cause rewritten** |
| BUG-3 | Medium | backend | File search matches on any single word of the query, returns unrelated files | **CONFIRMED** (refined) |
| BUG-4 | Medium | backend | Meeting-invite notification is a raw English string with a token URL; actor is a username | **CONFIRMED** (refined) |
| BUG-5 | High | frontend | Sidebar unread badge does not update without a page reload | **CONFIRMED** (evidence strengthened) |

Challenged 5 · survived 5 · removed 0 · relabeled 1 · descriptions corrected 4.

---

## BUG-1 [High] [backend] Global search never returns people or channels — **CONFIRMED**

Reproduced on `v0-61-0-rc-4-b117816aa788`, both at API level and through the UI, from a
freshly loaded page. Lane E, signed in as alice (`U4QEALICE000001`).

API — every query returns `users=0 chans=0`, including exact display names, exact usernames
and the exact name of a channel the searcher is a member of:

```
GET /api/v1/search?q=<term>&company_id=O4QEF1XTURESO01&workspace_id=W4QEF1XTURESO01
QA Bob         200  msgs=2 files=2 users=0 chans=0
Bob            200  msgs=2 files=0 users=0 chans=0
bob            200  msgs=2 files=0 users=0 chans=0
qa_e_bob       200  msgs=0 files=0 users=0 chans=0   <- exact username
QA Alice       200  msgs=0 files=2 users=0 chans=0
Alice          200  msgs=0 files=0 users=0 chans=0
qa-general     200  msgs=0 files=2 users=0 chans=0   <- exact channel name, searcher is a member
general        200  msgs=0 files=0 users=0 chans=0
qa-private     200  msgs=0 files=2 users=0 chans=0
Carol          200  msgs=0 files=0 users=0 chans=0
Owner          200  msgs=0 files=0 users=0 chans=0
```

Response shape carries the fields, they are just always zero:
`messages, files, users, channels, total_messages, total_files, total_users, total_channels`.

Index is live — messages match on the same call (`Bob` -> msgs=2).

UI (button `Search QA Workspace E` -> Global search dialog):

```
q="QA Bob"      All 4 | Messages 2 | Channels 0 | People 0 | Files 2
q="qa-general"  All 2 | Messages 0 | Channels 0 | People 0 | Files 2
```

The message hit is itself authored by "QA Bob" — the person is on screen as an author while
the People tab says 0.

**Extra probe the original session did not run — typed filters.** The dialog advertises
`Use typed filters like :in #general or :@ Alex`, so people search might have been gated
behind that syntax. It is not:

```
:@ QA Bob        All 2 | Messages 2 | Channels 0 | People 0 | Files 0
:@ Bob           All 2 | Messages 2 | Channels 0 | People 0 | Files 0
:@Bob            All 2 | Messages 2 | Channels 0 | People 0 | Files 0
:in #qa-general  All 4 | Messages 2 | Channels 0 | People 0 | Files 2
#qa-general      All 2 | Messages 0 | Channels 0 | People 0 | Files 2
@QA Bob          All 4 | Messages 2 | Channels 0 | People 0 | Files 2
```

Control — Directories finds both, on the same strings:

```
/w/{ws}/directories?tab=people   filter "QA Bob"     -> "OTHER 1  QB  QA Bob  Call  Message"
/w/{ws}/directories?tab=channels filter "qa-general" -> "qa-general PUBLIC No topic Open"
```

No commit in the build range touches `packages/features/search`, and the backend has no
search commit since 2026-08-24. Verdict stands as filed, severity High and `[backend]` label
both correct (server returns the zeros; the UI renders them faithfully).

---

## BUG-3 [Medium] [backend] File search matches any single word of the query — **CONFIRMED**

Reproduced on the current build. Workspace holds exactly two files, `qa-e-note.txt` and
`qa-e-image.png` (`GET /api/v1/users/me/files?workspace_id=…`).

```
GET /api/v1/search?q=<term>&company_id=…&workspace_id=…
qa-e-image             200 files=2  [qa-e-note.txt, qa-e-image.png]
qa-e-note              200 files=2  [qa-e-note.txt, qa-e-image.png]
qa-e-general           200 files=2  [qa-e-note.txt, qa-e-image.png]
qa-e-zzzz              200 files=2  [qa-e-note.txt, qa-e-image.png]
qa-e-image.png         200 files=2  [qa-e-image.png, qa-e-note.txt]
image                  200 files=1  [qa-e-image.png]
note                   200 files=1  [qa-e-note.txt]
zzzz                   200 files=0  []
nonexistent word here  200 files=0  []
```

Single-token queries behave correctly (`image` -> the image only, `note` -> the note only,
`zzzz` -> nothing). It is the multi-token query that goes wrong: any one token matching is
enough to return the file. `qa-e-zzzz` matches no filename yet returns both files, because
the tokens `qa` and `e` match both.

**Refinement to the report's description.** The report says the query "splits into words";
the split is on hyphens and dots as well as spaces — `qa-e-image.png` is tokenised, which is
why the exact full filename still drags in the unrelated file. Relevance ordering does put
the exact match first (`qa-e-image.png` returns the image before the note), so ranking works;
it is the recall filter that is too loose. Worth saying in the report because it changes where
a developer looks — the tokenizer, not the word-splitter.

UI shows the same: dialog query `qa-general` -> `Files 2`.

`[backend]` and Medium both correct.

---

## BUG-2 [High] Meeting participant list — **CONFIRMED as a defect, but the area label is WRONG**

The behaviour reproduces exactly as described, both halves of it. The *cause* the report
assigns is wrong, and so is the `[FE-WEB][CALENDAR]` / `[frontend]` label. **It is backend.**

### The behaviour (reproduces)

Invitee (bob) opening either meeting he is invited to, via the real click path
(`/w/{ws}/calendar` -> `button[data-testid="calendar-event-chip"]` -> scrollIntoViewIfNeeded -> click):

```
chip "QA-E Sync 1 renamed 15:00-15:30 Scheduled by QA Alice"
  [data-testid="event-attendees-hidden"]     -> "Participant list unavailable"
  [data-testid="event-attendees-empty"]      -> null
  [data-testid="event-participants-list"]    -> absent
  [data-testid="event-attendee-row"]         -> 0 rows
  panel: "… Scheduled by QA Alice | Participant list unavailable | Your response Yes No | Start meeting"
chip "QA-E Sync 3 17:00-17:30"  -> identical
both underlying loads 200:  GET /workspaces/{ws}/members , GET /calendar/meetings/{id}
```

Organizer (alice) on a meeting she created with **no invitees** (`QA-E Solo Check`, created
fresh during this pass to test the second half of the claim):

```
panel: "QA-E Solo Check … Scheduled by You | Participant list unavailable | Your response Yes No | Invite by email | Start meeting"
  event-attendees-hidden -> "Participant list unavailable"
  event-attendees-empty  -> null
```

### The cause — the report looked for the wrong field

The report's measurement block says the response carries no participant list **for either
side** (`participants: поле отсутствует`, "одинаково для обеих сторон") and concludes the
frontend must be at fault. That measurement probed for a key named `participants`, which this
endpoint never returns. The key that exists is **`attendees`, at the top level of the
response**, and it is **not** the same for both sides:

```
GET /api/v1/calendar/meetings/{id}         (2 passes each, identical both times)
alice, organizer, has invitee   -> topKeys ["meeting","attendees"]   attendees [{user_id …BOB}]
alice, organizer, no invitees   -> topKeys ["meeting"]               attendees ABSENT
bob,   invitee,   has invitee   -> topKeys ["meeting"]               attendees ABSENT
```

So the rule the server actually implements is: **the `attendees` array is sent only to the
meeting's organizer, and only when it is non-empty.** Everyone else — and the empty case —
gets the key omitted altogether.

The frontend then behaves correctly. `useEventParticipantsList` distinguishes three states:
`attendees === null` -> `hidden` ("Participant list unavailable"), `attendees.length === 0`
-> `empty` (`web.calendar.detail.noAttendees`), otherwise rows. An omitted key arrives as
null, so the UI honestly reports "I was not given a list". The dedicated empty state exists
in the code and is **unreachable**, because the server never sends `attendees: []` — which is
exactly why the no-invitee meeting is announced as unavailable rather than empty.

**Verdict: CONFIRMED, relabel `[BE][CALENDAR]` / `[backend]`, and rewrite the cause block.**
Severity High is right — an invitee genuinely cannot see who else is invited. Left in the
report with the label, the measurement block and the expected-result text corrected; a
frontend developer sent to `EventParticipantsList` would have found nothing wrong there.

### BUG-2 root cause, named

`realtime-service/internal/features/v1/calendar/service/get.go` — `GetScheduledEvent`, and its
own header comment states the rule outright:

```
// GetScheduledEvent — карточка встречи. attendees заполняется только если
// requesterID — создатель (бизнес-правило 10: список участников видит
// только creator); иначе возвращается nil-слайс без ошибки.
	if m.CreatedBy != requesterID {
		return m, nil, nil
	}
```

Two separate things are therefore going on, and the report merges them:

1. **Withholding the list from a non-creator is deliberate** — "business rule 10", present
   since the original `add calendar` commit (`f785cee4`), not a regression in range. What is
   defective is not that the server withholds it but that the UI announces a policy decision
   as a failure: the invitee is asked to RSVP and told the list is *unavailable*, as though
   something broke.
2. **The organizer's own empty meeting is a plain bug.** `attendees` is
   `json:"attendees,omitempty"` (`shared/pkg/proto/calendar/v1/calendar.pb.go:2003`), so an
   empty slice is dropped from the JSON entirely and reaches the client as null — indistinguishable
   from "withheld". The frontend's dedicated empty state (`event-attendees-empty` /
   `web.calendar.detail.noAttendees`) is dead code for that reason.

Both are backend-side. Neither is fixable in `EventParticipantsList`, which already
distinguishes all three states correctly.

---

## BUG-4 [Medium] [backend] Meeting-invite notification is a raw English string — **CONFIRMED**

Verified on a **freshly created** invitation on the current build (meeting created during this
pass, `created_at 2026-08-26T07:06:18Z`), not on the report session's leftover notification.

```
GET /api/v1/notifications?limit=3        (invitee)
fields: id, user_id, type, title_key, title, body, read, created_at,
        workspace_id, actor_id, actor_name, category, event_type, resource_id

event_type   : "meeting_invite"
title_key    : "NOTIF_TITLE_MEETING_INVITE"
title        : "Meeting invitation"
'body_key' in n : false                       <- no localization key for the body
actor_name   : "qa_e_alice"                   <- username; display name is "QA Alice"
body         : "You've been invited to \"QA-E Verify Invite\" — Aug 26, 2026 8:00 PM
                (Asia/Tashkent). Join: https://<host>/calendar/join/df30be14776d9a49
                2496ba7722cef90fb0f671be2798ed849a2eb9a245556466"
```

Rendered in the bell panel verbatim, token URL and all:

```
bell aria-label: "Notifications, 2 unread"
panel row: "QA  Meeting invitation  qa_e_alice · Workspace  You've been invited to
            \"QA-E Verify Invite\" — Aug 26, 2026 8:00 PM (Asia/Tashkent).
            Join: https://<host>/calendar/join/df30be14…556466   Aug 26, 12:06 PM"
```

All three sub-claims hold: token URL printed in the body text, `actor_name` is the username,
and the body carries no localization key while the title does. `[backend]` and Medium correct.

---

## BUG-5 [High] [frontend] Sidebar unread badge does not update without a reload — **CONFIRMED**

**First attempt was a rig error on my side and is recorded here so it is not mistaken for
evidence.** My poller parsed the unread response as `channels`/`unread`/`items`; the actual
key is `unread_counts`, so `find()` missed and the probe reported a constant server-side 0.
Raw shape:

```
GET /api/v1/workspaces/{ws}/unread  200
{"unread_counts":[{"channel_id":"C4QEGENERAL0001","unread_count":1,
                   "last_message_seq":5,"last_read_seq":4}, …]}
```

Re-run with the correct key. Receiver on `/w/{ws}/directories` (a non-channel route), channel
read first so the baseline is 0, poller installed **before** the message was sent, ~300 ms,
uncapped, page never reloaded during the window:

```
baseline: srv 0 | aria-label "qa-general" | children svg,SPAN | visibilityState visible
sender posts to the channel -> POST /api/v1/messaging/messages 200

27 samples over 12.9 s
  server unread_count : 0 x3 (852-2844ms), 1 x24 (3845-12934ms)
  row aria-label      : "qa-general" x27                    <- never changes
  row children        : svg,SPAN x27                        <- 2 nodes, no badge node
  visibilityState     : hidden x7, visible x20
  samples visible AND server=1 : 20
  badge ever appeared : false
then reload, nothing else changed:
  aria-label "qa-general, 1 unread messages" | children svg,SPAN,SPAN | text "qa-general 1"
```

Twenty samples with the window **visible** and the server already reporting 1 rule out
hidden-tab throttling. The badge is correct on load and never updates live.

Second half of the claim — a badge already on screen freezes rather than growing. Poller
installed with the badge showing 1, second message sent, then re-measured with the window
visible throughout:

```
34 samples, all visibilityState=visible
  server unread_count : 2 x34
  row aria-label      : "qa-general, 1 unread messages" x34
  row children        : svg,SPAN,SPAN x34
  samples visible AND server=2 AND label says 1 : 34/34
```

Server 2, sidebar 1, for the whole observation. Both halves confirmed. `[frontend]` correct —
the server's number is right and current; only the client fails to re-render. High correct.

The report's Low side-note also reproduces verbatim: the badge reads **"1 unread messages"**,
number and word disagreeing.

### BUG-4 refinement — the title is not localized either

The report says the body has no localization key "у заголовка ключ локализации есть, у текста
нет", which reads as: the title is handled correctly, only the body is broken. Measured
directly by switching the recipient's UI language to Russian (Settings -> Account -> Language)
and reloading:

```
bell aria-label : "Уведомления, непрочитано: 2"        <- chrome fully translated
panel chrome    : "Уведомления", "Отметить все как прочитанные", "Рабочее пространство"
notification    : "Meeting invitation"                  <- title STILL English
                  "You've been invited to \"…\" — Aug 26, 2026 8:00 PM (Asia/Tashkent).
                   Join: https://<host>/calendar/join/df30be14…"   <- body STILL English
                  actor "qa_e_alice"
/Meeting invitation/ present: true   /приглашени/i present: false
```

So `title_key` exists in the payload but the client renders the server's pre-composed English
`title` string instead of resolving the key — neither half of the row is translated. Corrected
in the report; it changes the fix from "add a body key" to "add a body key **and** actually
resolve the title key".

Recipient's language restored to English afterwards. Note for future sessions: once the UI is
Russian the language options are themselves localized — English is listed as **«Английский»**,
so a `hasText: /English/` locator matches nothing and the picker looks broken. Four attempts
were lost to that before enumerating the focused option's text revealed it.

---

## Observation not in the report — `Cmd+K` is shadowed inside a channel

Found while trying to follow BUG-1's published reproduction steps. Measured on both routes,
fresh load each time:

```
/w/{ws}/directories        Cmd+K -> dialog "Global search Search across channels, direct
                                    messages, people, and files…"   activeElement =
                                    "Search messages, channels, people, files…"
/w/{ws}/c/{channelId}      Cmd+K -> dialog "Insert link  Cancel  Insert"
                                    activeElement = "Insert link"
```

Inside a channel the message composer holds focus and takes `Cmd+K` for its own insert-link
command, so the documented global shortcut does not reach Global search on the screen where
a user is most likely to press it. This is a plausible finding in its own right, but it is a
**new** one rather than a verdict on an existing entry, so it is recorded here only and not
added to the report. Worth picking up in a future chat/chrome sector session.

## Leftovers on lane E from this pass

Meetings created while testing BUG-2 and BUG-4: `QA-E Solo Check` (19:00, no invitees — made
to test the empty-list half) and `QA-E Verify Invite` (20:00, bob invited — made to generate a
fresh notification). Three probe messages in `#qa-general` (`verify-unread-…`). The invitee's
interface language was switched to Russian to test the localization claim and **restored to
English** afterwards. Harmless on disposable fixtures.

Snippets written this pass are all `e-v*.mjs`, chosen so they cannot collide with the
`e-*.mjs` set the original sector-E session left behind.
