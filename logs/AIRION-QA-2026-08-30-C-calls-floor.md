# AIRION QA — 2026-08-30 — lane C — sector M (Calls: people, moderation & side rooms)

Sector **M** on lane **C** (Calls map, `SECTORS-CALLS.md`). `QA_LANE=C QA_SECTOR=M`.

- Deployed frontend build: `data-dpl-id="v0-61-0-rc-7-10a407a46be1"` → tag `v0.61.0-rc.7`, frontend commit `10a407a46be1`.
- Backend: no deploy stamp.
- Fixtures: `seed/seed.sh --verify --lanes C` → all present and correct.
- Browsers up: owner 9246, alice 9242, bob 9243, carol 9244.
- Session start 12:46 +05, timebox to 18:00 +05.

## Current state

- Setup done. Reading prior coverage, choosing targets.

## Prior coverage (dedup targets)

`reports/aloqa-calls-inside-qa-2026-08-26-A.html` (sector-M-adjacent findings):
- BE: meeting-admin assignment grants unselected "Manage meeting settings", not removable
- FE: banned list not synced to second moderator
- FE: mic selection in call
- FE SIDE ROOMS: "Ask to return to main room" does nothing / guest 403
- FE: host can invite someone they banned
- FE: screen-share revoke has no visible message to the sharer
- FE SIDE ROOMS: freshly created empty Side Room not offered as a "Move to Side Room" destination
- FE SIDE ROOMS: guest moving into Side Room not delivered to host as an event
- FE SIDE ROOMS: reaction sent inside a Side Room shown to everyone in the main call

`reports/aloqa-incall-qa-2026-08-26-A.html`: private Side Room of someone else shown to invitee as their own.

`reports/aloqa-calls-qa-2026-08-25.html` (older, sector-M-adjacent): banned person cannot be returned; closing tab in Side Room keeps you a participant forever; Side Room transitions announced as call join/leave; remove-participant dialog mentions a call block that does not exist.


---

## Session state @13:10

Call **QA-M-1** `V4P254PE9AE0LTC`, host qa.c.owner, participants alice/bob/carol.
Approval was ON by default on a hub-created call (`requires_approval:true`); disabled by
`PATCH /meeting/<id> {"requires_approval":false}` for setup only.

### Verified working (not findings)

- **Host mute of one participant.** `POST /meeting/<id>/participants/<alice>/mute {"device":"mic"}` → 204.
  Alice's control flips `Mute`→`Unmute` (`aria-pressed` false→true) at t+5177 ms and a visible notice
  **"A host muted your microphone"** runs t+5177 → t+14043 ms (30 of 132 samples, 300 ms interval).
  Alice can unmute herself again immediately (mic_mode `allowed_all`).
- **Participants panel markers.** After the mute the host's row for Alice carries `Muted` alongside
  `Camera off`; the other three rows carry `Camera off` only.
- **Per-participant device permission — screen sharing Allow lifts `on_request`.**
  meeting `screen_share_mode: "on_request"`; Alice's control reads `Request to share`.
  Host → row menu → Device permissions… → Screen sharing → Allow → Save:
  `PUT /meeting/<id>/participants/<alice>/permissions {"screen_share":true}` → 200,
  `effective {"mic":true,"camera":true,"screen_share":true}`.
  Alice's control becomes `Share screen`, **351 ms** after the Save click
  (poller t0epoch 1788077142054; save 1788077152655; transition 1788077153006; 300 ms interval,
  previous sample still `Request to share`). Dialog reopened reads `Screen sharing Currently Allowed`.
  → **`SELECTORS.md`'s claim that per-participant Allow does not lift `on_request` is wrong on rc.7.**
  Reported to the supervisor with the measurement; they are making the edit.
- **Ban.** `POST …/participants/<carol>/ban` → 204. Carol: notice **"A host banned you from the call"**
  t+7077 → t+15947 ms, routed to `/w/<ws>/calls` at t+7077 ms. Host panel: `BLOCKED (1)` with
  name + email + `Unban <name>`. Rejoin by URL is refused with
  *"You cannot rejoin this call — A host removed you from this call and blocked you from rejoining it.
  Ask them to invite you again."* + `Back to workspace`.
- **Unban.** `DELETE …/participants/<carol>/ban` → 204, `BLOCKED (0)`; Carol rejoins normally
  (`meetings/current` non-empty, back on `/call/<id>`).
- **ALK-3492 fixed on rc.7.** The rc.5 finding "host can invite someone they banned" does not
  reproduce: after the ban the Add-to-call row reads `Cannot be invited` and the checkbox is
  `disabled`. Clicking it leaves `Invite (0)` disabled; clicking an un-banned account gives
  `Invite (1)` enabled (positive control in the same modal, same open).

### Duplicate — logged, not reported

- **Per-participant mic Block mutes silently, with no reason anywhere.** Host → Device permissions →
  Microphone → Block: `PUT …/permissions {"mic":false}` → 200 `effective {"mic":false,…}`.
  Alice: control flips to `Unmute` at t+8244 ms, becomes `disabled`, `cursor: not-allowed`,
  `opacity: 0.4`, `title="Toggle mute (⌘D)"` — still advertising the shortcut. **Zero** lines appeared
  anywhere on her screen in 35 s / 115 samples, against the plain-mute run above which produced a
  toast on the same client with the same instrument.
  → Duplicate of **BUG-15** in `reports/aloqa-calls-qa-2026-08-25.html`
  ("При запрете микрофона настройкой звонка кнопка у участника молча гаснет…"), which measured the
  same defect down to the same numbers (their notice 5.2→14.6 s, mine 5.177→14.043 s) via the
  **meeting-wide** `Meeting settings → MICROPHONE → Blocked` path. My path (per-participant Device
  permissions) is not in their repro, but it is the same mechanism, the same "как должно быть", and
  one fix covers both. What my version adds: the per-participant path, and `effective.mic:false`
  from the permissions response.

### Candidate findings

- **CAND-1 [Medium] [frontend] A banned participant is told to ask for an invite; the host's invite
  list refuses to invite them.** Measured above. The only remedy is Unban, which no screen names.
- **CAND-2 [Low] [frontend] `BLOCKED (0)` renders a guest-specific paragraph on every call.**
  With zero bans and zero guests the participants panel's top 121 px is
  `BLOCKED (0)` + "Banning a guest revokes the link they used, so guests are not listed here…".
  Measured visible: SECTION rect 335×121 at (1573,139), opacity product 1, `vis()` and `boxVis()` true.

### Notes / leads
- `GET /meeting/<id>/participants` carries `focus: "main"` per participant (side-room location) and
  no role or mute state; role comes from `GET /meeting/<id>/my-permissions`.
- Host `my-permissions`: `role: "owner"`, all 13 capabilities true.
- Toolbar `Leave call` carries `title="End call (⌘L)"` — label and title disagree.
- Supervisor leads for the guest half: the guest device-request control was withdrawn (ALK-3028) and
  restored in this build; guest effective permissions have no REST fallback (member-only route).

---

## Session state @14:45

Call **QA-M-1** `V4P254PE9AE0LTC`. Rooms: **SR Alpha** `BR4P2600CH6XV3X0` (public, Alice inside),
**SR Gamma** `BR4P27DDK9B8SMEC` (private, owner + Carol). SR Beta closed.
Roles granted this session, in order: Bob co-host → demoted → co-host → demoted (currently
`role: participant`, confirmed by `my-permissions`). Alice/Carol/Bob all `can_manage_breakout_rooms:false`
at the moment of every visibility measurement below.

**Environment warning — the machine is overloaded and it silently corrupts polling.**
13:30 +05: `load averages 87.29 77.23 47.69`, `vm.swapusage used 1906M`, 190 Chrome processes /
12.4 GB RSS, 16 rig windows. 14:05: load still 70–84. Two of my pollers degraded from a 300 ms
nominal interval to **10.6 s** and **640 ms** effective, and two `connectOverCDP` calls timed out
against a browser that was alive (`/json/version` answered, `/json/list` showed a live page target,
`rig-events.log` shows no lane-C closures). **Every polling result below carries its
`samples / expectedSamples` and a `healthy` flag; anything with `healthy:false` was re-run, not kept.**
Supervisor confirmed independently that `WindowServer` is the top consumer at 82% — the load is
compositing 16 maximised windows, not computation.

### New candidate findings

#### CAND-3 [Medium] [frontend] The host's row menu has no `Mute` for a co-host, though the server allows it and the stronger control is offered

Same host, same panel, same call, four reads:

    target                     mic state   menu entry
    QA Alice   participant     unmuted     "Mute QA Alice"                 present
    QA Alice   participant     muted       "Ask QA Alice to unmute"        present
    QA Bob     CO-HOST         unmuted     (no mic entry at all)
    QA Bob     CO-HOST         muted       "Ask QA Bob to unmute"          present

Full menu over the unmuted co-host — note `Ban` and `Remove from call` are offered:
`['Pin for me','Pin QA Bob for everyone','Stop watching','Admin permissions…','Device permissions…','Remove co-host','Remove from call','Ban','Ask QA Bob to turn on camera']`

**The variable is co-host status, isolated:** demoting Bob (`POST …/admins/<bob>` → 204 removal,
`my-permissions` → `role:"participant"`) and re-reading the menu with his mic state unchanged
(still unmuted) gives `Mute QA Bob` back:
`[…,'Make co-host','Admin permissions…','Device permissions…','Remove from call','Ban','Mute QA Bob','Ask QA Bob to turn on camera']`

**It is not a server rule.** As the host, against the co-host:
`POST /api/v1/meeting/<id>/participants/<bob>/mute {"device":"mic"}` → **204**, and Bob's own control
flips `Mute` → `Unmute` (`aria-pressed` true). The host can also silence a co-host permanently
through the menu entry that *is* offered — Device permissions → Microphone → Block:
`PUT …/participants/<bob>/permissions {"mic":false}` → 200, `effective {"mic":false,…}`, Bob's
`Unmute` becomes `disabled`. Bob's role at that moment: `my-permissions` → `role:"admin"`, all 13 true.

So the host may ban a co-host, remove them, and block their microphone indefinitely, but cannot
mute them for a moment.

#### CAND-4 [Medium] [frontend] `Request access` on a private Side Room you were invited to does not request anything — it joins you immediately

Carol, `role:"participant"`, `can_manage_breakout_rooms:false`, invited to the private room by the
host (`POST /meeting/breakout-rooms/<gamma>/invite {"participant_user_id":"<carol>"}` → 204).
Read on a **freshly reloaded** client:

    GET /api/v1/meeting/<id>/breakout-rooms  (as Carol)
      {"name":"SR Alpha","visibility":"public","entry_mode":"direct","participant_count":1}
      {"name":"SR Gamma","visibility":"private","entry_mode":"direct","participant_count":1}
    panel buttons: ['Close Side Rooms panel','New Side Room','Join','Request access']
      SR Alpha  public   entry_mode direct  ->  "Join"
      SR Gamma  private  entry_mode direct  ->  "Request access"

Same `entry_mode` on both rows, same client, same response — the public row is the positive control.
Pressing `Request access`:

    POST /api/v1/meeting/breakout-rooms/<gamma>/join -> 200
    PUT  /api/v1/meeting/<id>/breakout-rooms/focus {"focus":"main"->"side_room"} -> 200
         {"in_breakout":true,"breakout_room_id":"<gamma>","focus":"side_room"}
    panel after: "SR Gamma Private QC QO 2 · Hidden · invite-only Joined", toolbar "Leave room"

No request endpoint is called, nobody approves anything, and she is in the room. The label promises
a request that never happens.

**Non-invited control:** Bob, same permissions, not invited — `breakout-rooms` returns SR Alpha only
(`find` over the whole body: no `SR Gamma`, one `visibility":"public"`), and his panel shows one room.
So a private room is only ever visible to someone who may already enter it, and this label appears to
have no state in which it is accurate.

### Verified working (not findings)

- **Chat isolation between a side room and the main call, both directions.** Host in SR Alpha sends
  `SRA-131617`; Alice (in the room) sees it; Bob and Carol (main) both show
  `"Call chat Saved to #QA-M-1 No messages yet"`. Bob then sends `MAIN-131645` in the main call;
  Carol sees it (positive control, plus a live `QA Bob is typing…`); Alice and the host in the room
  still show only `SRA-131617`. Room panel header states the contract: *"Chat · SR Alpha — Only
  visible to participants of this room"*.
- **Main-call audio in a side room is a designed feature, not a leak.** Two live unmuted inbound audio
  tracks from the main call keep playing for someone inside a room, on `<audio>` elements at
  `volume 0.3` while the room's own track plays at `volume 1`. The header carries
  `[data-testid="main-audio-trigger"]` reading *"Main call audio, 30%"*, whose popover says
  *"You can still hear the main call while in a Side Room. Other Side Rooms remain muted."*
  `main-audio-mute` works: the two main-call elements go to `volume 0`, the room element stays at 1,
  the trigger reads *"Main call audio, 0%"*. **I nearly filed this as an audio-isolation leak from the
  transport measurement alone** (PC 0 inbound rose 1 → 2 ssrc as a second main-call publisher unmuted);
  the app says so on screen.
- **Side-room invite prompt.** `POST …/invite` → 204 at epoch 1788080953506; `Accept`/`Decline` visible
  at 1788080954069 (**563 ms**) and gone at 1788080984310 (**30.2 s** later), never returning in the
  remaining 110 s. Poller 120 samples / 150.8 s, healthy.

### Duplicates re-confirmed on rc.7 — logged, not reported

- **A reaction sent inside a Side Room is shown to everyone in the main call.** Host (in SR Alpha)
  sends 🎉; Bob's overlay shows `🎉` for 9 samples and Carol's for 10, on watchers started before the
  action. → `reports/aloqa-calls-inside-qa-2026-08-26-A.html`.
- **"Ask to return to main room" does nothing for a logged-in participant.**
  `POST /meeting/<id>/breakout-rooms/return-request` → 204. Alice, **freshly reloaded**, in SR Alpha:
  **86 / 86 samples over 60.6 s, healthy, `appeared: []`** — nothing at all.
  **Positive control on the same client, same instrument, 15 minutes later:** the host invites her to
  SR Gamma and the prompt lands at t+9.9 s and stays 29.3 s (64 / 64 samples, healthy), along with the
  whole private-room row. Her client applies realtime side-room events; this one event produces
  nothing. → `reports/aloqa-calls-inside-qa-2026-08-26-A.html`.
- **A private room created by someone else is shown to the invitee under "YOUR PRIVATE ROOMS / Only you
  can see this room".** Seen for both Carol and Alice. → `reports/aloqa-incall-qa-2026-08-26-A.html`.

### Jira dedup for CAND-1 (statuses searched: ALL, via `jira_cache.py grep`)

`grep 'Cannot be invited'` → ALK-1645 (TESTING, unrelated), **ALK-3387** (TESTING, the Add-to-call
rejected-targets work). `grep 'заблокирован'` → 67 hits read; the relevant ones:

- **ALK-3448** *(Bug/TESTING — closed here)* quotes my exact participant-facing string as observed
  behaviour: *"You cannot rejoin this call — A host removed you from this call and blocked you from
  rejoining it. Ask them to invite you again."* Its acceptance criteria are the banned list + Unban,
  403 rendered as a permission error, and *"повторное приглашение забаненного либо блокируется явной
  ошибкой на этапе POST /invite, либо становится рабочим после unban"* — **nothing about correcting
  the participant's copy.** The list and Unban now exist (measured), and the invite is now blocked in
  the UI. So this ticket is the fix that *created* my divergence, not a ticket that owns it.
- **ALK-3492** *(Bug/REVIEW)* is the **backend** half and is still open: it asks `POST /invite` to
  reject a banned target with a key instead of answering 204. **This corrects what I told the
  supervisor earlier** — what I verified fixed on rc.7 is the *frontend* half (ALK-3448 / PR 2796),
  which excludes banned people from the invite list. I did not test the raw endpoint, and ALK-3492's
  own text says the client already handles partial rejection via `rejectedUserIds` (ALK-3387).
  REVIEW is outside the dedup rule's statuses, and it is a different surface from mine.

CAND-1 therefore stands, and its strongest form is the causal one: the screen the fix landed on now
contradicts the screen it did not touch.

### Notes

- Host row menu over a side-room occupant (host focused on main): adds `Ask to return to main room`,
  `Invite to my room`, and `MOVE TO SIDE ROOM → Move to SR Alpha / Move to SR Gamma`. **`Move to
  SR Alpha` is offered for Alice, who is already in SR Alpha.**
- A host **inside** a side room sees `Participants 1 of 4 in call` listing only room occupants, so no
  main-call moderation is reachable from there. From the main call the panel shows everyone, with an
  `IN SIDE ROOMS` section naming each person's room. Asymmetric; possibly deliberate.
- `header-tab-main-activate` switches focus to the main call while staying a room member:
  `PUT …/breakout-rooms/focus {"focus":"main"}` → `{"in_breakout":true,"breakout_room_id":"<gamma>","focus":"main"}`.
- Creating a room auto-joins the creator and sets focus to `side_room`. `Close room` is
  `[data-testid="side-room-close"]`, **icon-only with `aria-label`** — a text match finds nothing.
- New Side Room dialog: `Create room` is enabled with an empty ROOM NAME (untested what it creates).
