# AIRION QA — 2026-08-26 — lane A — verification pass over report `aloqa-incall-qa-2026-08-26-A.html`

Target report: `reports/aloqa-incall-qa-2026-08-26-A.html`
Artifact: https://claude.ai/code/artifact/966b8367-a166-4022-9b11-ddd6463ce37c
Original session log: `logs/AIRION-QA-2026-08-26-A-incall.md`

Report build: `v0-61-0-rc-3-15da3ead76e1` (tag `v0.61.0-rc.3`, FE commit `15da3ead76e1`)
Verify build: `v0-61-0-rc-4-b117816aa788` (tag `v0.61.0-rc.4`, FE commit `b117816aa788`)
Range: 7 commits. One touches side rooms: `95a7026d2 fix(calls): keep side-room occupants in the
main call and badge them by focus (ALK-3479)` — presence/placement/focus, plus one-line touches to
`SideRoomInviteModal.test.tsx` and `useSideRoomInviteCandidates.test.tsx`.

Lane A, browsers alice 9222 (host), bob 9223, carol 9224.

## Current state

Pass complete. BUG-1 removed as a FALSE POSITIVE (4 runs, invite delivered every time; invite-prompt
code byte-identical between the two builds, so no fix explains a non-reproduction). BUG-2 CONFIRMED
(reproduced live and on a fresh page load). Report corrected and republished to its own URL.

## Findings under verification

| # | severity | area | claim | verdict |
|---|---|---|---|---|
| BUG-1 | Medium | frontend | Invite ticked in `INVITE FROM THIS CALL` at Side Room creation is never delivered to the invitee | **FALSE POSITIVE** — removed |
| BUG-2 | Medium | frontend | Another person's private Side Room is shown to the invitee under `YOUR PRIVATE ROOMS` / `Only you can see this room` | **CONFIRMED** — kept |


---

## Verdicts

### BUG-1 — FALSE POSITIVE

**Claim:** a person ticked in `INVITE FROM THIS CALL` when a Side Room is created receives
nothing — no prompt, no notification.

**Not reproducible. Three runs on `v0.61.0-rc.4`, the invite arrived every time.**

The invite prompt is `[data-testid="app-breakout-invite-prompt"]` and it is **not** a
`[role="dialog"]` — it renders inside `call-overlay-expanded`. Every poll below ran at 300 ms,
uncapped, started **before** the room was created, and selected by visibility (rect + ancestor
opacity product + `document.elementFromPoint` at the element's own centre), not by role.

| run | invitee | room | poll | invite appeared | still up at |
|---|---|---|---|---|---|
| 1 | QA Bob | VROOM ALPHA (public) | 106 ticks, gap median 302 ms / max 303 ms, `visibilityState:visible` | t=8762 ms | t=31413 ms (poll ended) |
| 2 | QA Carol | VROOM BETA (public) | 106 ticks, gap median 302 ms / max 307 ms, `visible` | t=6054 ms | t=30249 ms (poll ended) |
| 3 | QA Bob, **with `device-request-prompt` open** | VROOM GAMMA (public) | 106 ticks, gap median 302 ms, `visible` | t=9668 ms | t=29610 ms |

Text and controls in every run:

    QA Alice invited you to join <room>   [Decline] [Accept]

The create request carries the invitee and is accepted:

    POST /api/v1/meeting/V4OWDDLWOZRQHAJ/breakout-rooms
      {"visibility":"public","name":"VROOM ALPHA","invitee_user_ids":["U4QABOB00000001"]}
    -> 201 {"room":{"id":"BR4OWDGEPGPUOMDE", ... ,"status":"waiting"}}

**There is no fix in the build range to explain the non-reproduction.** `rc.4` contains `rc.3`
(`git merge-base --is-ancestor` = yes), 7 commits. One touches side rooms — `95a7026d2
fix(calls): keep side-room occupants in the main call and badge them by focus (ALK-3479)` — and
it changes presence/placement/focus only; inside `breakout/sideRooms/` it touches two **test**
files and no component. The invite prompt itself is byte-identical between the two builds:

    git diff --stat 15da3ead76e1 b117816aa788 -- \
      packages/features/calls/ui-web/BreakoutInvitePrompt.tsx \
      packages/features/calls/ui-web/hooks/useBreakoutInvitePrompt.ts
    (empty)

Last commit touching either file is `ccfe6c399` (ALK-2642/ALK-2869), long before both builds.
So the code that delivers and renders this prompt was the same on the build the report was
written against.

**The confound the original log itself named does not suppress it.** BUG-1's own measurement
records that Bob had a leftover `device-request-prompt` open, and the log's `Add people` section
flags exactly that as an unresolved confound ("у Bob в этот момент было открыто модальное окно
треда, и я не исключил, что приглашение не отрисовалось именно из-за него"). Run 3 above put
that prompt back on Bob's screen deliberately: both rendered at once, `dialogs` in the poll
showing `['call-overlay-expanded','device-request-prompt']` while `app-breakout-invite-prompt`
carried Decline/Accept. An open device prompt does not block the invite.

**Independent cross-session corroboration.** The night session of 2026-08-24
(`logs/AIRION-QA-2026-08-24-calls-2.md:474-490`, BUG-7 → ALK-3412) measured the same element
two days earlier on an older build:

    +7.652s  появилось [data-testid="app-breakout-invite-prompt"]
             «QA Alice invited you to join QA Night Private Room | Decline | Accept»
    +37.685s исчезло  -> держалось 30.033 s

Same arrival latency, same controls. That session's whole BUG-7 depends on the invite being
delivered — its repro step 3 is "wait for the popup invite to disappear (30 seconds)".

**Why the original run missed it — not established.** The prompt has a 30 s life and the
original poll was 26 s started before creation, so a plain timeout does not explain it; neither
does the modal confound, ruled out above. The likeliest remaining explanation is the poll's
element selection (the prompt is not a `[role="dialog"]`, and the original run's sibling test
recorded "ни одного изменения состояния вообще" over 22 s on the same screen — impossible on a
live call screen, where the call timer alone changes every second). A stale realtime connection
in a browser that had been driven hard for an hour is the other possibility, and it is not
reproducible on demand. Either way the finding as published does not stand.

**Removed from the report.**

### BUG-1 — fourth run, element and lifetime pinned

Run 4 watched the element the 08-24 session named, rather than the screen, on a fifth room:

    selector           [data-testid="app-breakout-invite-prompt"]
    appeared           t=6786 ms      disappeared t=36956 ms
    lifetime           30170 ms
    rect               [0, 56, 1920, 62]   full-width banner, visibilityState: visible
    text               "QA Alice invited you to join VROOM EPSILON  Decline  Accept"

30170 ms against the 30033 ms measured on 2026-08-24 — the same 30-second prompt, two days and
several builds apart. The rect also shows why it is easy to miss with a dialog-shaped selector:
it is a 1920x62 banner strip under the call header, not a modal.

### BUG-2 — CONFIRMED

**Claim:** a person invited to someone else's private Side Room sees it under
`YOUR PRIVATE ROOMS` / `Only you can see this room`.

Reproduced on `v0.61.0-rc.4`. Alice created `VROOM DELTA`:

    POST /api/v1/meeting/V4OWDDLWOZRQHAJ/breakout-rooms
      {"visibility":"private","name":"VROOM DELTA","invitee_user_ids":["U4QACAROL000001"]}
    -> 201 {"room":{"id":"BR4OWDOTHWFFKHQR","created_by":"U4QAALICE000001", ...}}

Carol's `Side Rooms` panel, read in DOM order:

    Side Rooms | 4 open in this call | New Side Room
    OPEN NOW
      VROOM ALPHA   | Public | 0 · QA Alice's room | Join
      VROOM BETA    | Public | 0 · QA Alice's room | Join
      VROOM GAMMA   | Public | 0 · QA Alice's room | Join
    YOUR PRIVATE ROOMS
    Only you can see this room
      VROOM DELTA   | Private | 1 · Hidden · invite-only | Request access

Both statements are false for Carol: `created_by` is Alice, and the counter on the same row says
1 person is inside. Bob, not invited, has no such row at all — `3 open in this call` against
Carol's `4 open`, and his visible panel buttons are `Close Side Rooms panel`, `New Side Room`,
`Join`×3 with no fourth row.

**Re-checked on a freshly loaded page** (`page.reload()`, rejoin, reopen panel): byte-identical
output, so this is server-backed state, not stale client state.

Alice sees the same header over the same room, where it is truthful — her row reads
`VROOM DELTA | Private | 1 · Hidden · invite-only | Add people | Joined`. The header is one
static string with no ownership branch (`calls.sideRoom.panel.yourPrivate` /
`calls.sideRoom.panel.privateHint`, rendered unconditionally by
`SideRoomsPanelBody.tsx` whenever `privateRows` is non-empty), which matches the observation.
`[frontend]`, Medium — both stand.

**Not new.** The 2026-08-24 night session recorded the same thing as an aside to its BUG-7
(`logs/AIRION-QA-2026-08-24-calls-2.md:521-522`): "заголовок раздела `YOUR PRIVATE ROOMS` с
подписью «Only you can see this room» показывается и тем, кто комнату не создавал". It was never
filed. So the defect survives at least three builds. Added to «Для триажа», together with
ALK-3412, which is the `Request access` button on this same row.

**Dedup.** `jira_cache.py list --open-bugs` re-read after a mirror top-up (3517 issues). Nothing
open covers this: ALK-3412 is the `Request access` behaviour, ALK-3074 is an invite that stays
active after self-join, ALK-2939 is inviting into an already-created room, ALK-2734/ALK-3481 are
the participant menu offering the room someone is already in. Kept.

## Incidental observation (not a report finding)

`PUT /api/v1/meeting/{id}/breakout-rooms/focus {"focus":"side_room"}` returns
`404 COMMON_NOT_FOUND "endpoint not found"` on every side-room join. This is the new frontend
from ALK-3479 calling ahead of its backend: that commit says outright it "ships ahead of
aloqa-backend PR 914, which is still open", and PR 914 is merged upstream but not deployed here.
Deliberate, self-healing on the next backend deploy, and it is how you can tell the staging
backend predates `4c059ac7`. Not filed.

## Rig state at the end

Call `V4OWDDLWOZRQHAJ` "VERIFY-A-1" still active with five Side Rooms (ALPHA, BETA, GAMMA,
EPSILON public; DELTA private). Alice 9222 / Bob 9223 / Carol 9224 up and signed in. Bob has an
unanswered `device-request-prompt` for camera. Snippets written this pass are `a-v-*.mjs`, kept
separate from the original session's `a-in-*.mjs` so neither overwrites the other.
