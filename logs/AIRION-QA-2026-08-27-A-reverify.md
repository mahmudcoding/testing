# AIRION QA — 2026-08-27 — lane A — re-verify (Calls · inside)

Build: frontend `v0-61-0-rc-6-5be489db0ca6` (staging redirects airion-cargo.store -> staging.airion-cargo.store)
Report under re-verification: `reports/aloqa-calls-inside-qa-2026-08-26-A.html` (9 findings)
Inventory: scratchpad `lane-A-findings.md`
Lane: A. QA_LANE=A exported in every shell.

## Current state
Run finished 2026-08-27 14:27 +05. All nine findings re-verified on `v0-61-0-rc-6-5be489db0ca6`.

- **Confirmed, snippet written (6):** A:1 BLOCKED list, A:2 microphone selection, A:3 Ask to return
  to main room (both halves), A:5 revoke screen sharing, A:6 empty Side Room, A:8 Side Room reaction.
- **No longer reproduces (3):** A:0 admin permissions, A:4 invite a banned participant, A:7 guest
  Side Room transition. No repro block added for any of them; the measurement that killed each is below.
- Report `reports/aloqa-calls-inside-qa-2026-08-26-A.html` now carries 6 `block repro` divs, one per
  confirmed finding, each the first block after its own `<h2>`. Diff against HEAD is insertions only.
  `scripts/verify_report.py` reports the same two failures before and after my edits (summary-table row
  wording, one bare citation path) — both pre-existing, neither touched here.
- `python3 -c "...bench.load()..."` prints **6** for lane A.
- Snippets live in `scripts/callrig/snip/` behind `a-callkit.mjs` (lane-A-only helper module, imported
  by all six). Every snippet ran green twice in sequence against the final kit, and then all six ran
  green **cold**, against a freshly created meeting after the working meeting was ended — so the
  `ensureCall` start path, room creation and the device-permission path are all exercised, not assumed.
- Browsers left up: alice 9222, bob 9223, carol 9224 (guest 9228 stopped). Live meeting
  `V4OXY6B0LCQGHQ8` with Room A / Room B open; the snippets reuse or rebuild it either way.
- Note: `https://airion-cargo.store/` 301-redirects to `https://staging.airion-cargo.store/`, so the
  build stamp needs `curl -sL`.

## Findings queue
| # | id | title (short) | outcome |
|---|----|---------------|---------|
| 1 | A:0 | admin perms grants Manage meeting settings | **fixed** |
| 2 | A:1 | BLOCKED list not live for co-host | confirmed — `a-blocked-costale.mjs` |
| 3 | A:2 | microphone selection no-op | confirmed — `a-mic-select.mjs` |
| 4 | A:3 | Ask to return to main room | confirmed — `a-side-askreturn.mjs` |
| 5 | A:4 | invite a banned participant | **fixed** |
| 6 | A:5 | revoke screen share — no notice | confirmed — `a-revoke-share.mjs` |
| 7 | A:6 | empty Side Room missing from Move to | confirmed — `a-side-emptyroom.mjs` |
| 8 | A:7 | guest side-room move not evented to host | **fixed** |
| 9 | A:8 | reaction from Side Room leaks to main | confirmed — `a-side-reaction.mjs` |

## Log

### 12:56–13:10 — setup
- Build stamp `v0-61-0-rc-6-5be489db0ca6` (curl follows 301 to `staging.airion-cargo.store`).
- Browsers up: alice 9222 (host), bob 9223, carol 9224. All signed in via `ensure.sh A alice bob carol`.
- Working call for this pass: meeting `V4OXV60LSMWLR7T` ("Team meeting"), host alice, started from the hub
  with the default "Wait for admission" dialog. bob + carol admitted.

### BUG-1 / A:0 — [BE][CALLS] Admin permissions grants Manage meeting settings — **NO LONGER REPRODUCES (fixed)**
Followed the finding's own steps on alice (host) against bob.

Step 1-2 — Participant actions on QA Bob -> Admin permissions… -> tick only **Manage chat** -> Assign as admin:
```
POST /api/v1/meeting/V4OXV60LSMWLR7T/admins/U4QABOB00000001
{"can_manage_chat":true,"can_manage_microphone":false,"can_manage_camera":false,
 "can_manage_screen_share":false,"can_manage_breakout_rooms":false,"can_pin_video":false,
 "can_assign_admins":false,"can_manage_reactions":false,"can_approve_requests":false,
 "can_kick_participants":false,"can_mute_participants":false,"can_manage_recording":false,
 "can_manage_meeting_settings":false}
-> 204
```
Step 3 — re-open Admin permissions… on the same participant: **checked = ['Manage chat'] only** (13 checkboxes total).
Bob's own view:
```
GET /api/v1/meeting/V4OXV60LSMWLR7T/my-permissions   (as qa.bob)
-> 200 {"role":"admin","permissions":{"can_manage_chat":true, ... all twelve others false,
                                       "can_manage_meeting_settings":false}}
```
Step 4 (the "cannot be removed" half) — positive control, granting then removing:
- tick **Manage meeting settings** too -> Assign -> `my-permissions` true set = `{can_manage_chat, can_manage_meeting_settings}`
- re-open, untick **Manage meeting settings** -> Assign (body carries `can_manage_meeting_settings:false`, 204)
  -> `my-permissions` true set = `{can_manage_chat}` — the permission is genuinely removed.

Both halves of the finding are dead on this build: the granted set equals the requested set, and the
checkbox is honoured in both directions. No repro block will be added for this finding.

### BUG-2 / A:1 — [FE-WEB][CALLS] BLOCKED list not live for the co-host — **CONFIRMED (both halves)**
alice = host, bob = co-host (via `Make co-host`, `make-host-confirm-submit`), carol = target.
Both runs on bob's client immediately after a reload, `visibilityState: visible` in every sample.

(a) BAN — alice's own panel goes to `BLOCKED (1) QC QA Carol qa.carol@aloqa.test Unban` at once.
bob's panel, 99 samples over 50 s at 500 ms, only two distinct states:
```
    1 ms  Participants 3 in call BLOCKED (0) ... QA Alice HOST | QA Bob (you) CO-HOST | QA Carol
 8611 ms  Participants 2 in call BLOCKED (0) ... QA Alice HOST | QA Bob (you) CO-HOST
 BLOCKED never left (0); the roster change arrived in 8.6 s
```
(b) UNBAN — bob reloaded first, so his panel correctly starts at `BLOCKED (1)`.
alice clicks Unban: `DELETE /api/v1/meeting/V4OXV60LSMWLR7T/participants/U4QACAROL000001/ban -> 204`,
then `GET /meeting/{id}/bans -> 200` **on alice's client only**; her panel becomes `BLOCKED (0)`.
bob's panel, 89 samples over 45 s:
```
     1 ms  2 in call  BLOCKED (1) QC QA Carol qa.carol@aloqa.test Unban
 23803 ms  2 in call  WAITING (1) QC QA Carol Admit Deny | BLOCKED (1) ... Unban
 36457 ms  2 in call  BLOCKED (1) ... Unban
 36962 ms  3 in call  ... QA Carol   <- back in the call AND still listed under BLOCKED
```
Two other realtime events landed in that same window (the join request, the roster growing),
so the socket is fine — only the bans list is never re-read. Matches the published finding exactly.

Repro snippet: `scripts/callrig/snip/a-blocked-costale.mjs` (driver alice, accounts alice,bob,carol).
Ran twice, `ready: true`, ~15 s each, asserted co-host sees `BLOCKED (0)` with QA Carol still in his roster.

### BUG-3 / A:2 — [FE-WEB][CALLS] Named microphone cannot be selected in a call — **CONFIRMED**
Rig Chrome exposes three audio inputs (`Fake Default Audio Input` = `deviceId "default"`,
`Fake Audio Input 1`, `Fake Audio Input 2`) and three outputs, so the finding's precondition holds.
alice in call `V4OXV60LSMWLR7T`, mic on (`Mute` button, i.e. not muted).

Selecting **Fake Audio Input 1** (a named mic), three snapshots — before / right after / +6 s:
```
rows            every row data-selected="false" in all three snapshots
sender track    label "Fake Default Audio Input"  deviceId "default"   (unchanged)
localStorage    aloqa-call-device-prefs  = null   (never written)
```
Repeated with **Fake Audio Input 2**: same, no tick, no track change, no store write.

CONTROL 1 — SPEAKER section of the same panel, `Fake Audio Output 1`:
```
data-selected  false -> true
prefs          preferredSpeakerDeviceId = "b3c849de…be95072"   (concrete id, written at once)
```
CONTROL 2 — the "System default device" row of the MICROPHONE list:
```
data-selected  false -> true
prefs          preferredMicDeviceId = "default"                (written at once)
```
So the click lands, the list can tick and the store can be written — only the named-microphone
path does none of the three. Matches the published finding.

Repro snippet: `scripts/callrig/snip/a-mic-select.mjs` (driver alice). Ran twice, `ready: true`.
It wipes `aloqa-call-device-prefs` and reloads first, so the control is real every run: it asserts
`tickedBeforeControl: []` -> `tickedAfterControl: ["Fake Default Audio Input System default device"]`.

### BUG-4 / A:3 — [FE-WEB][CALLS][SIDE ROOMS] "Ask to return to main room" — **CONFIRMED (logged-in half)**
alice host in the main call, bob inside side room `Room A` (`status=active, participant_count=1`),
bob's client freshly reloaded, `visibilityState: visible` in every sample.

Control, same menu, same session — `Ask QA Bob to turn on camera`:
```
bob's screen, 110 samples / 45 s, whole visible DOM:
  14365 ms  <P> 1670x26  "QA Alice asked you to turn on your Camera"
```
Second control — `Ask QA Bob to unmute`:
```
bob's screen, 79 samples / 32 s:
   6179 ms  <P> 710x26   "QA Alice asked you to turn on your Microphone"
```
The action under test — `Ask to return to main room`:
```
POST /api/v1/meeting/V4OXV60LSMWLR7T/breakout-rooms/return-request {"user_id":"U4QABOB00000001"} -> 204
host toast, +282 ms: "Asked QA Bob to return to the main room"
bob's screen, 110 samples / 45 s: nothing. Only match in the whole window was the
leftover camera line from the control above, already present at 3 ms.
```
Guest half (403) not re-measured yet — see BUG-8 work below.

Repro snippet: `scripts/callrig/snip/a-side-askreturn.mjs` (driver alice, accounts alice,bob).
Ran twice, `ready: true`. It picks whichever neighbouring "Ask …" item the menu offers as the control,
because the host's menu shows the camera item or the unmute item depending on the participant's
media state, and both were verified to put a line on his screen.

### BUG-7 / A:6 — [FE-WEB][CALLS][SIDE ROOMS] Empty side room missing from "Move to Side Room" — **CONFIRMED**
Measured while the meeting had exactly one room and it was empty:
```
GET /api/v1/meeting/V4OXV60LSMWLR7T/breakout-rooms
    Room A  status=waiting  participant_count=0        (host created it, then Leave room)
host menu on QA Bob (co-host, main call):
    Pin for me | Pin QA Bob for everyone | Stop watching | Admin permissions… |
    Device permissions… | Remove co-host | Remove from call | Ban | Ask QA Bob to turn on camera
host menu on QA Carol (plain participant, main call):
    Pin for me | Pin QA Carol for everyone | Stop watching | Make co-host | Admin permissions… |
    Device permissions… | Remove from call | Ban | Mute QA Carol | Ask QA Carol to turn on camera
    -> no MOVE TO SIDE ROOM section at all, on either menu
```
Transition, same room, nothing else changed — QA Bob joins it from its own card in the Side Rooms panel:
```
    Room A  status=active  participant_count=1
host menu on QA Carol now ends with:  … | Move to Side Room | Move to Room A
```
So the room is perfectly usable; only the move destination list ignores it while empty.
Matches the published finding.

Side note for the log, not a finding here: the menu over QA Bob, who was *inside* Room A, offered
both `Ask to return to main room` and `Move to Room A` — the room he is already in. The report's own
«Проверка» list already asks for that not to be offered.

Repro snippet: `scripts/callrig/snip/a-side-emptyroom.mjs` (driver alice, accounts alice,bob,carol).
Ran twice, `ready: true`, asserting `Room A status=active count=1` and `Room B status=waiting count=0`,
so the menu the human opens carries its own control: one room listed, the empty one missing.

### BUG-9 / A:8 — [FE-WEB][CALLS][SIDE ROOMS] Reaction from a Side Room shows in the main call — **CONFIRMED**
Three in the call: alice (host) and carol in the main call, bob inside `Room A` (`active`, 1).
Same instrument on every window — emoji search over every visible leaf node, 300 ms step, 98 samples / 30 s,
`visibilityState: visible` everywhere.

TEST — sender INSIDE the room (bob sends 🎉):
```
alice (main call) ... 5519 ms   72x56  participant-reaction-burst > participant-tile > live-stats-tile
carol (main call) ... 5515 ms   72x56  participant-reaction-burst > participant-tile > live-stats-tile
```
CONTROL — sender in the MAIN call (alice sends 👏):
```
carol (main call) ... 5882 ms   72x56  participant-reaction-burst > participant-tile > live-stats-tile
bob   (in Room A) ... not seen in 98 samples      <- isolation holds in this direction
```
So reactions do work generally, the room does not receive the main call's reactions, and the room's own
reaction still lands on the main-call grid. Matches the published finding.

Repro snippet: `scripts/callrig/snip/a-side-reaction.mjs` (driver **bob** — he is the one who presses the
reaction; accounts bob,alice,carol). Ran twice, `ready: true`.

Rig notes worth keeping (all cost a failed run here):
- Tiling three windows across 1920px leaves 640px each, and at that width the call header and the whole
  toolbar are gone. `Leave Side Room` and `Send reaction` both read as absent for a window that is simply
  small. Two tiles (960) is the limit; measure membership before tiling either way.
- The Side Rooms and Participants panels overlay the toolbar in a narrow window, so the toolbar buttons
  fail their own hit test. Close them before tiling.
- Matching a side-room card as "smallest element containing the room name AND a Join/Switch button"
  selects a container spanning several cards once this room's button reads `Joined` — the click then
  lands on the NEXT room's Join and moves the participant into the wrong room silently. It did exactly
  that once. Pick the card by name first, then require exactly one Join/Switch/Joined button inside it.

### BUG-5 / A:4 — [FE-WEB][CALLS] Host can invite a banned participant — **NO LONGER REPRODUCES (fixed)**
Followed the finding's steps. Step 1: alice bans QA Carol, her panel shows
`BLOCKED (1) QC QA Carol qa.carol@aloqa.test Unban`.
Step 2: `Add to call` -> the dialog now marks her and refuses the selection.

Every row of the picker, read as (row text, checkbox `disabled`, `checked`):
```
QA QA Admin              disabled=false checked=false
QA QA Alice   In call    disabled=true  checked=false
QB QA Bob     In call    disabled=true  checked=false
QC QA Carol   Cannot be invited   disabled=true  checked=false     <- the banned one
QG QA Guest              disabled=false checked=false
QO QA Owner              disabled=false checked=false
QD QA Dave               disabled=false checked=false
```
Clicking the banned row (a real mouse click at the checkbox's own centre):
`checked` stays false, button stays `Invite (0)` disabled.

CONTROL — same dialog, same session, the row two below: clicking `QD QA Dave`
gives `checked=true` and `Invite (1)` enabled. So the picker works and only the banned row is blocked.

This is exactly the report's own «Ожидаемый результат»: *Add to call помечает заблокированного и не даёт
его выбрать*. Step 3 (Accept -> 403) is now unreachable through the interface. No repro block added.
Cleanup: the Dave tick was removed and QA Carol unbanned.

### BUG-6 / A:5 — [FE-WEB][CALLS] Revoke screen sharing shows the sharer nothing — **CONFIRMED**
alice host, bob a plain participant (NOT co-host — see the rig note below), sharing his screen
(`Stop sharing` on his toolbar, `getDisplayMedia` called once).
One observation window on bob, 173 samples over 62 s at 350 ms, `visibilityState: visible` throughout,
searching every visible leaf node for `/A host|not allowed|stopped your|muted your|turned off your/`:
```
phase 1, control — the host mutes him:
  10413 ms   <P>    250x26   "A host muted your microphone"
phase 2, the action under test — Revoke screen sharing (confirmed via revoke-screen-share-confirm-submit):
  19023 ms   <SPAN>   1x1    "Screen sharing is not allowed for you in this call."
  "A host stopped your screen sharing" did not appear in any of the 173 samples
```
The 1x1 SPAN is a screen-reader companion, not a notice. The visible state afterwards:
```
button[data-testid="call-controls-screen-share"]  name "Share screen"  disabled true
  title="Screen sharing is not allowed for you in this call."   <- hover-only
```
Matches the published finding, including the 1x1 element and the tooltip.

Repro snippet: `scripts/callrig/snip/a-revoke-share.mjs` (driver alice, accounts alice,bob).
Ran twice, `ready: true`.

Rig notes:
- **A co-host cannot be moderated.** With QA Bob as co-host the host's menu over him has no
  `Revoke screen sharing`, no `Mute …` and no `Ask …` items at all — the snippet removes co-host first.
  Half an hour was spent reading that as a stale client.
- Screen sharing for a plain participant starts **Blocked** in a freshly started meeting: his toolbar
  reads `Request to share`. The snippet sets Device permissions -> Screen sharing -> Allow first.
- In the Device permissions dialog the footer reads "Cancel Save", so
  `clickDeepest(/^(Save|Cancel)$/)` takes document order and presses **Cancel** — the change is silently
  discarded while `Currently Blocked` still reads correctly. Press Save by exact text.

### BUG-4 / A:3 — guest half — **CONFIRMED**
Guest joined via the meeting's own invite link (`/join/<token>`, "Join as a guest" -> name -> Continue ->
"Waiting for approval"), admitted by the host, roster shows `GU Guest GUEST`. Guest inside `Room A`.
Host: Participant actions on the guest -> `Ask to return to main room`:
```
POST /api/v1/meeting/V4OXV60LSMWLR7T/breakout-rooms/return-request
{"user_id":"N4OXX08OPLWSAQQ"}          <- an N… participant id, not a U… user id
-> 403 {"code":403,"key":"REALTIME_ACCESS_DENIED","message":"access denied","trace_id":"<trace>"}
host toast, +278 ms: "Could not send the request"
guest screen: nothing in 98 samples over 40 s (visibilityState visible throughout)
```
Both halves of the finding therefore hold on this build, exactly as published.

### BUG-8 / A:7 — [FE-WEB][CALLS][SIDE ROOMS] Guest's move to a Side Room not evented to the host — **NO LONGER REPRODUCES (fixed)**
The report measured ~42 s twice (and a self-correction at 36.6 s in a third run). Measured now on a
freshly reloaded host client each time, panel sampled continuously, delay counted from the guest's own
click, `visibilityState: visible` in every sample:
```
(A) GUEST enters Room A
    run 1   panel corrected 0.2 s after the click     (158 samples / 80 s, 2 states)
    run 2   panel corrected 0.5 s after the click     (158 samples / 80 s, 2 states)
    run 3   panel corrected 0.4 s after the click     (149 samples / 60 s, single process)
(B) GUEST leaves Room A back to the main call
    panel corrected 0.52 s after the confirm          (149 samples / 60 s)
(C) control, LOGGED-IN participant enters Room A
    panel corrected 7.6 s into the watch, ~2.6 s after his click
```
So the guest's transition now arrives as fast as — in these runs faster than — a member's, in both
directions, and the panel never sat wrong long enough to need a periodic refresh.

The report's stated consequence is gone with it: with the guest inside the room, the host's menu over
him now reads
```
Ask to return to main room | Device permissions… | Remove from call | Ban |
Ask Guest to unmute | Ask Guest to turn on camera | MOVE TO SIDE ROOM | Move to Room A
```
i.e. it *does* offer `Ask to return to main room`, which the report recorded as missing.
(It still offers `Move to Room A` for someone already in Room A — the same thing the report's own
«Проверка» section asks for; noted, not filed, and it is not this finding.)

No repro block added for this finding.

Measurement trap worth keeping: sampling the host panel and awaiting the guest's action **in the same
loop** blanks the samples for the whole action (joinRoom waits ~8 s internally), and the first sample
afterwards then reads "0.5 s after the action" when the click was 8 s earlier. `a-rv-guestmove2.mjs`
fires the action without awaiting and stamps the click itself.

### Handover set
| file | driver | accounts | finding |
|---|---|---|---|
| `snip/a-callkit.mjs` | — | — | lane-A helper module imported by all six (attach, ensureCall, joinCall, admitAll, panel, row menus, side rooms, device permissions, window tiling) |
| `snip/a-blocked-costale.mjs` | alice | alice,bob,carol | A:1 |
| `snip/a-mic-select.mjs` | alice | alice | A:2 |
| `snip/a-side-askreturn.mjs` | alice | alice,bob | A:3 |
| `snip/a-revoke-share.mjs` | alice | alice,bob | A:5 |
| `snip/a-side-emptyroom.mjs` | alice | alice,bob,carol | A:6 |
| `snip/a-side-reaction.mjs` | **bob** | bob,alice,carol | A:8 |

Probe snippets from this run are the `snip/a-rv-*.mjs` set; they are working instruments, not handover
snippets, and nothing in the report names them. The two worth keeping are
`a-rv-watchpanel2.mjs` (panel sampler with absolute timestamps) and `a-rv-guestmove2.mjs`
(fires the action without awaiting it, so sampling is not blanked for the duration of the action).

### Cleanup / state left behind
- Meeting `V4OXV60LSMWLR7T` was ended deliberately to test the cold-start path; the live meeting is now
  `V4OXY6B0LCQGHQ8` (host alice, bob + carol in, Room A occupied, Room B empty).
- `Room C` was created by a probe and closed again (`status=closed`).
- QA Carol was banned twice during BUG-2 and BUG-5 and unbanned both times; `BLOCKED (0)` at the end.
- QA Bob's meeting-level Screen sharing permission is left **Allowed** (it starts Blocked in a fresh
  meeting); `a-revoke-share.mjs` sets it every run, so this is not load-bearing.
- One guest joined via the invite link and was admitted; that browser was stopped afterwards, which
  leaves a ghost row in the roster for a while. It cleared on its own.
- Nothing was committed. Nothing was filed in Jira.
