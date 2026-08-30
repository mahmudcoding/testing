# Rig selector notes

Lookup data that drifts with the product, kept out of CLAUDE.md deliberately —
that file is for things that break loudly when wrong, and a testid list goes
stale quietly. Verify before trusting a line here; correct it when you find it
wrong.

Everything below was measured by clicking it, not read out of the source.

## In-call confirmation dialogs

| testid | reached from |
|---|---|
| `ban-participant-confirm-submit` | Participant actions → Ban |
| `remove-participant-confirm-submit` | Participant actions → Remove from call |
| `revoke-screen-share-confirm-submit` | Participant actions → Revoke screen sharing |
| `make-host-confirm-submit` | Participant actions → Make co-host |
| `admin-permissions-submit` | Participant actions → Admin permissions… (button reads "Assign as admin") |
| `side-room-confirm-submit` | Side Rooms → Leave room **and** Close room (same testid, two dialogs) |
| `side-room-create-name` | New Side Room → room-name input |
| `calls-start-submit` | hub "Start a call" dialog |
| `calls-hub-start-now` | hub "Start now" |

No testid, match by exact visible text: **Start recording**, **Stop recording**
(Recording access dialog), and **Invite (N)** in Add to call — the count is in
the label, so match `/^Invite \(/` rather than equality.

**Two controls have no confirmation dialog at all**: `Unban` fires its DELETE
straight from the row button ("Unban <name>"), and `Stop recording` acts
immediately. A helper that waits for a dialog hangs on both.

**Do not select a dialog as the last `[role=dialog]`.** The in-call overlay is
itself `role=dialog` (`data-testid="call-overlay-expanded"`) and its innerText
contains the panel button labels, so matching a dialog by its text picks the
overlay. Match by a child the dialog owns, or by "visible dialogs with ≤ 8
buttons".

## Hover and action menus do not survive between drives

Each `drive.mjs` call is a fresh CDP connection and the menu closes with it, so
anything menu-driven must be ONE snippet doing open + click (+ confirm).
Dialogs *do* survive, so open+click in one snippet and confirm in a second is
fine. The shape that works in-call:

1. Open the people panel via `[data-testid="call-controls-people-toggle"]`,
   checking its `aria-pressed` rather than assuming.
2. Find the participant row as the **smallest visible element** containing both
   the display name and a button whose `aria-label` matches `/Participant
   actions/` — sort candidates by innerText length. Matching on the name alone
   picks the whole list container.
3. Click it, wait ~2s, then take the menu as the last visible
   `[role=menu],[data-radix-menu-content],[role=listbox],[role=dialog]` with
   ≤ 14 items.

## Controls with an aria-label and empty textContent

`filter({hasText:/^…$/})` silently matches zero on these, and the run reads as a
dead control: **Unpin**, **Save changes**, **Cancel editing**, **Send as file**,
**Send as photo**, and icon-only row actions such as **Edit** on a meeting card
(44×44). `window.__qa.clickDeepest()` in `snip/lib.mjs` matches aria-label as
well as text, which is the general fix.

## Notification entries are BUTTONs with a spoken aria-label

Each entry in the notifications panel is a `BUTTON` whose `aria-label` reads
`"<who>, <channel>: <type>. <text>"`. A text-based locator clicks a node *near* the entry rather
than the entry itself, which produces a plausible wrong result — and in one case the wrong result
happened to match the ticket being verified, which is the dangerous direction.

## Icon-only controls text locators never find

    button[aria-label="Save changes"]     confirms a message edit; disabled until the text differs
    button[aria-label="Send"]             NOT "Send message"
    button[aria-label="Send as file"] / "Send as photo"    attachment toggle; the label flips

`Save changes` is the worst of these: with a text locator the edit silently never submits, so
"offline edits are dropped" and "edits do not apply" both look true — **online and offline alike**.
When a control is equally broken in both conditions, suspect the measurement.

## More containers that are not `[role="dialog"]`

- The **pinned-messages panel** is an `aside`. Scoping to `[role="dialog"]` finds nothing.
- The **`Reply here` quote preview** lives *outside* the contenteditable, so reading the composer's
  `innerText` returns empty and reads as "no quote".
- **Channel details**: a visible container mentioning About/Members also contains the header trigger
  button, so `panel.contains(document.activeElement)` is true and a real focus bug reads as fixed.
  Filter to containers that do **not** contain `button[aria-label="Channel details"]`.
- The **emoji picker** (`[frimousse-emoji]`) is empty at 1.8 s and has 72 visible nodes at 2.8 s.
  At the short wait, "the picker is empty offline" looks like a finding.
- **`Escape` on the mention suggestion blurs the composer** — the next `Enter` sends nothing. Type a
  space instead, which is what the product's own flow does.

## Endpoints that answer misleadingly rather than 404

    POST /messaging/messages {parent_message_id}   200, field SILENTLY IGNORED
                             {thread_parent_id}    the real thread reply
    PATCH /api/v1/channels/<id>                    requires `name` ALWAYS; {description} alone
                                                   returns 400 "name (required)", which reads as
                                                   "no length validation"
    /messaging/messages/<id>/{pin,reactions}       404 — the real ones are channel-scoped:
                             /messaging/channels/<ch>/messages/<id>/{pin,reactions}
    /users/me/saved-messages                       404 — Saved Messages is a channel:
                             GET /workspaces/<ws>/saved-messages -> {channel_id}
    POST /messaging/dm                             needs user_id_1 AND user_id_2; the DM list is
                                                   under key "dms"

The `parent_message_id` case is the same family as the pagination-cursor names in CLAUDE.md: an
unknown field is accepted and dropped, so 140 "thread replies" became 140 ordinary channel messages
with `reply_count` still 0 — indistinguishable from a broken threads feature.

    PATCH /meeting/<id>/settings {entry_mode}      200, field SILENTLY IGNORED. `entry_mode` is not
                                                   a meeting-entry field at all -- in the deployed
                                                   contract it is `breakout_room_item.entry_mode`
                                                   (enum direct|request|none), a per-caller SIDE
                                                   ROOM capability. The settings body accepts only:
                                                   camera_mode chat_enabled max_rooms
                                                   max_video_height mic_mode mute_on_join
                                                   reactions_enabled recording_enabled
                                                   screen_share_mode who_can_open_rooms
                                                   who_can_see_guest_link
    entry policy is NOT on /settings               PATCH /meeting/<id> {requires_approval:false}
                                                   is the one that takes; GET /meeting/<id> then
                                                   reads it back false.

## There is no `Leave call` inside a Side Room

A participant in a Side Room has no `Leave call` — two sectors enumerated 23 and 34 controls and
neither found one. The same participant in the main call has it. **The exit is two-step, not
absent**: `Leave room` → confirmation → confirm returns you to the main call, where `Leave call`
reappears. A page reload puts you back in the room, still without it.

Do not read its absence as a broken enumeration; it is not there.

**These three controls ignore programmatic `element.click()`** — `Leave Side Room`, `Leave room`,
`Leave call`. Three consecutive attempts left the state completely unchanged, which nearly produced
"a participant cannot leave a side room". A real `page.mouse.click` at the element's centre works
first time. `Leave room` has its own confirmation dialog as well.

## Leaving a call takes two clicks, and the kit has three behaviours

`Leave call` opens **"Leave this call? … Cancel | Leave"**. Clicking only the first leaves you in
the call — no error, no visible change, `stillInCall: true`.

    snip/c-leave-poll.mjs      clicks Leave call, waits 1.5 s, clicks Leave in the dialog  → leaves
    snip/c-dmcall.mjs          QA_HANGUP=1 clicks Leave call, then only READS the dialog   → stays
    snip/leave-call.mjs        leaves AND ends the meeting

Assert the state afterwards: the URL must no longer match `/call/`.

**Navigating away does not leave a call** — the router returns you to `/call/<id>`. Only the
confirmed dialog leaves.

## The callee's incoming-call prompt needs a fresh page load

A browser that has been sitting in the DM may never render an Accept control — three attempts, no
prompt. `about:blank`, then navigate back, and it appears within a second. Check this before
concluding an invitation was not delivered.

## Containers that are not `[role=dialog]`

`<aside>` carries the **Display settings** panel, the **Files details** panel and the **channel
details** panel. A `[role=dialog]` probe misses all three and reports "the panel did not open" —
on every route and every key combination, with no error.

## Controls with no text node

Icon buttons — `Edit`, `Close profile`, `Unblock` — have empty text. Address them by `aria-label`;
a text-based filter drops them silently.

## Labels that carry counts

Tab labels render as `Files0`, `People 0`, `All 8`, so `^Files$` matches nothing. Match on prefix
or strip trailing digits before comparing.

## Names that carry a person's name

`nameOf` (`snip/lib.mjs:117`) joins `aria-label`, `textContent`, `labelFor` and `labelledBy` with
spaces, so a control labelled for one person carries the name **and** its own text:

    waiting-room admit BUTTON   aria-label="Admit QA Bob" + text "Admit"
                                nameOf -> "Admit QA Bob Admit"

An anchored `clickDeepest(/^Admit$/i)` therefore matches nothing and returns
`{ok:false, why:"no match", seen:0}` against a plainly visible button -- the same signature as the
control being absent. Match unanchored (`/^Admit\b/i`) or on the testid. Assume the same shape for
`Deny` and for any control whose label names a participant.

## Blocked-users picker

`INPUT[role=combobox]`, placeholder `Search by name or username`. Not a button, so a button
enumeration will not find it.

## Calendar: week and month views use different chip testids

The two views do not share a testid, and using the wrong one returns **zero elements rather than an
error** — which reads exactly like "the grid renders no chips at all".

    week view    [data-testid="calendar-event-chip"]
    month view   [data-testid="calendar-month-event-chip"]

Also in the month view: `calendar-month-view`, `calendar-month-cell`,
`month-day-num-YYYY-MM-DD`.

Related trap already in CLAUDE.md: chips for later-in-the-day meetings sit below the fold, so the
locator finds them but the click never lands — `scrollIntoViewIfNeeded()` first.

## Other measurement traps

- `page.locator('input').first()` matches the hidden `input[type=file]` present
  on chat screens — scope with `input:visible`.
- `setInputFiles` caps at 50 MB, but the app's limits are 100 MB per file and
  500 MB per message (`packages/features/chat/model/utils/attachmentValidation.ts`,
  `model/constants/messageLimits.ts`), so the too-large path cannot be reached
  that way. Inject a synthetic `DataTransfer` in-page instead — same path as
  drag-and-drop.
- A probe that materialises `[...document.querySelectorAll('*')]` and maps every
  node crashed a tab on `/directories` and took the whole browser with it.
  Reading only `[aria-label]` nodes on the same page is fine.
- Radix popper items are not `[role=option]`/`[role=menuitem]`; they are plain
  nodes under `[data-radix-popper-content-wrapper]`. `window.__qa.popperPick()`
  handles the walk-up.

- **The rig's fake-device set has exactly one videoinput** (`fake_device_0`), against three
  audioinputs and three audiooutputs. So "the camera picker offers nothing to switch to" is the
  launch flags, not the product -- camera *switching* is not exercisable on the rig as
  `launch.sh` starts Chrome. Mic and speaker switching are (3 each).

## Calls — state that gates a control

- **A meeting is created with `screen_share_mode: "on_request"`**, so a
  participant's control reads `Request to share`, not `Share screen`, and a
  snippet matching the latter finds nothing and reports the participant never
  shared. **The per-participant device permission DOES lift it** (corrected
  2026-08-30 on `v0.61.0-rc.7`; this bullet previously said it did not).
  Host → row menu → `Device permissions` → Screen sharing → `Allow` → save:
  `PUT /meeting/<id>/participants/<uid>/permissions {"screen_share":true}` → 200
  `effective {"mic":true,"camera":true,"screen_share":true}`, and the
  participant's button flips `Request to share` → `Share screen` with no reload,
  **measured 351 ms** (poller at 300 ms started before the host acted, epoch
  stamps both sides, so bounded above by one interval).
  **Still poll rather than sampling once.** 351 ms is a screen-share *grant*; an
  earlier build recorded a camera *revoke* taking ~13 s to reach the toolbar —
  different field, different direction, not measured on rc.7. At t+1s "the
  permission did not apply" and "it has not arrived yet" are the same
  observation and only one is a finding; `waitForChange` (`snip/watch.mjs`)
  returns `{changed:false, stableForMs, samples}` rather than throwing.
  Note also that **a member refreshes effective permissions over REST while a
  guest receives them only on realtime frames** (the effective-permissions route
  is member-only), so a timing result on one does not transfer to the other —
  say which you measured.
  To set the meeting's own mode instead:
  `PATCH /api/v1/meeting/<id>/settings {"screen_share_mode":"allowed_all"}`.
  The full settings object also carries `mic_mode`, `camera_mode`,
  `who_can_open_rooms`, `who_can_see_guest_link`, `max_rooms`, `max_video_height`
  — none of them on `GET /meeting/<id>`, which is a different shape.
- **A co-host cannot be moderated.** Over a co-host the host's row menu drops
  `Revoke screen sharing`, `Mute`, and the rest, so the menu comes back empty or
  short. That reads exactly like a stale client and has cost half an hour twice.
  Remove co-host first, or check `Remove co-host` is in the items before
  concluding a control is missing.
- **Ending a meeting needs `POST /api/v1/meeting/<id>/end`.** `cancel` answers
  409 once a meeting has started. A meeting left `active` blocks the next call
  from starting at all — the route stays on `/w/<ws>/calls` and never reaches
  `/call/<id>` — and the window that left it looks perfectly clean, so this is
  invisible from the client. `GET /api/v1/workspace/<ws>/meetings/active` lists
  them.
- **A rig window narrower than about 960 px drops the call header and toolbar
  entirely.** "Is he in a side room" and "is the button there" then both answer
  no for a window that is merely small.
- **An open side panel covers the call toolbar, so the button under it is
  present but not clickable — and the helper that would click it returns
  quietly.** `hasParticipantsBtn: true` with `aria-pressed="false"` and no
  panel is the signature. It bites hardest on a host that made a side room:
  `createRoom` / `leaveRoom` leave the Side Rooms panel open, and the row menu
  read afterwards comes back empty for a reason that has nothing to do with
  what is being measured. Enumerate the *visible* named buttons before
  believing an empty menu — two entries (`Close Side Rooms panel`, `Close
  room`) says the panel is what you are looking at, not the call.

- **A call started from the hub "Start now" dialog defaults to `requires_approval: true`**, so every
  joiner lands on "Waiting for host approval" and a snippet that joins a second participant by URL
  reports them stuck outside. That is the default, not a defect. Clear it with
  `PATCH /meeting/<id> {"requires_approval":false}`.
- **Three "Who can join" options collapse onto two independent fields.** The dialog offers
  `calls-start-entry-manual-admit` / `-password` / `-open`, but `POST /meeting` carries no
  `entry_mode`: the wire body has `password` and `requires_approval` only. A password-protected call
  is created with `requires_approval:false`.
- Door order is **lobby first, gate second**: a joiner gets the full lobby (`lobby-page`, device
  check, `Test audio`, `lobby-join`) and only meets `call-password-gate` after pressing Join. A repro
  that assumes the gate is the landing screen will not reproduce.

## Settings

- The **language picker's own options are localized**, so they cannot be matched
  by an English string on a second run. The dialog lists exactly four in a fixed
  order — English, Russian, Uzbek, Uzbek (Cyrillic) — so pick by position and
  verify against `document.documentElement.lang`.
- Font-size buttons read `XS S M L XL` on screen and
  `Extra small … Extra large` to the accessibility tree. Matching only the
  accessible name silently misses; match either.
