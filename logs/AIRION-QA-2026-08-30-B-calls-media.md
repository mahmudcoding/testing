# AIRION QA — 2026-08-30 — lane B — sector L (Calls: media & controls)

- **Sector**: L · Calls — media & controls (16.4% of Calls), Calls map (`SECTORS-CALLS.md`)
- **Lane**: B — company `O4QBF1XTURESO01`, workspace `W4QBF1XTURESO01`
- **Deployed frontend build**: `data-dpl-id="v0-61-0-rc-7-10a407a46be1"` → tag `v0.61.0-rc.7`, frontend commit `10a407a46be1`
- **Timebox**: until 18:00 +05. Session start 12:46 +05.
- **Browsers**: alice 9232, bob 9233, carol 9234, dave 9235 (all signed in, verified by `ensure.sh`)

## Current state

Setup done: fixtures verified (8/8 users, 7/7 workspace members, 4 channels), build stamp recorded,
Jira mirror synced (3771 issues), four browsers up.

Next: locate/clear any leftover active meeting on lane B, then start a 4-party call and work the
priority order — mic/camera + devices → grid/tiles/pagination → quality → PiP/fullscreen/pinning →
network + error banners → personal call settings → guest.

## Dedup targets identified at start

From `reports/` (closer than Jira):
- `aloqa-calls-inside-qa-2026-08-26-A.html` — **"Выбор микрофона в звонке не переключает микрофон:
  звук уходит на системный по умолчанию, а в списке отмеченным остаётся прежний"** — directly in
  sector L (device menu / mic switching). Treat mic-device-selection findings as already owned.
- `aloqa-calls-around-qa-2026-08-26-B.html` — mostly entry/lifecycle (sector K/O), one tile-adjacent:
  "На странице идущего звонка все участники показаны как пробывшие в нём 0:00" (that is the call
  details page, sector O).
- `aloqa-incall-qa-2026-08-26-A.html`, `aloqa-calls-qa-2026-08-26-B.html` — side rooms / entry, out of L.

## Findings

(none yet)

## Rig notes (not product findings)

- `page.evaluate(RTC_STATS)` returns `undefined` — `RTC_STATS` is a *string of a function
  expression*, so it must be invoked: `page.evaluate(\`(${RTC_STATS})()\`)`. Two existing
  snippets in `snip/` use the broken form (`a-v60-media.mjs`), i.e. they measured nothing and
  the `undefined` is silent. Worth knowing before trusting an old snippet's numbers.
- Lane B meeting default is `requires_approval: true` — a joiner lands in the lobby, presses
  `Join` (`[data-testid="lobby-join"]`) and then sits on a screen whose only controls are
  `Cancel request` / `Back to workspace`. `PATCH /api/v1/meeting/<id> {"requires_approval":false}`
  makes joins direct; there is no `entry_mode` field on that endpoint.

## Baseline established

Call `L media 074933` (4 participants: alice host, bob, carol, dave), open entry, 2x2 grid,
tiles 789x444 each.

### Verified working — mic mute (alice)

`Mute` → label becomes `Unmute`, `aria-pressed` false→true, local audio sender
`track.enabled` true→false. Outbound audio packets fall from ~50/s to ~4.6/s (9089→9103 over
3.0 s), so the mute reaches the wire, not just the UI.

### Verified working — camera on (alice)

`Turn camera on` → label becomes `Turn camera off`, video sender appears
(`fake_device_0`, enabled, live), outbound video 960x540 @14-20 fps, `framesEncoded` 97→204
over 3.0 s.

### Observation — aria-pressed on both media toggles tracks "media is OFF"

mic unmuted → `Mute` / pressed=false; mic muted → `Unmute` / pressed=true.
camera off → `Turn camera on` / pressed=true; camera on → `Turn camera off` / pressed=false.
Both controls are self-consistent (pressed = the media is off) but a screen reader announces
"Turn camera on, toggle button, pressed", which contradicts the action in the name.
Cosmetic/a11y only, and consistent between the two controls — parked, not written up.

### Verified working — Push to talk (audio popover)

Enabling `Push to talk` auto-mutes the mic (`track.enabled` true→false); holding `Space` sets it
back to `true` and the label to `Mute` for the duration of the hold; releasing re-mutes. Sampled
at ~300 ms across the hold, 8 samples, all `en:true`, `hasFocus:true`, `visibilityState:visible`.
While PTT is on the toolbar Mute/Unmute button is correctly `disabled`, `cursor:not-allowed`,
`opacity:0.4`, `title="Push to talk is on — hold Space to talk"`.

**False negative I nearly wrote up:** the first PTT run showed Space doing nothing. The key events
demonstrably reached window (capture) and document (bubble) — so "the key never landed" was ruled
out — but `document.activeElement` was the `Select microphone` BUTTON, and the app ignores Space
there (Space activates a focused button). Blurring first makes PTT work every time. Probe, not
product.

### Verified working — PiP (minimize, drag, own controls)

- `Minimize to picture-in-picture` → route becomes `/w/<ws>/calls`, `[data-testid="draggable-pip"]`
  appears 280x261 at bottom-right, containing `pip-mini-call` + `pip-participant-grid`, the call
  name, a live clock and all four participant names.
- Media keeps flowing while minimized: outbound video 19.2 MB → 21.2 MB, `framesEncoded`
  3928 → 4277 across the minimize.
- In-app navigation (left nav → Chat) keeps the PiP alive and the media flowing.
- Drag clamps to the viewport in both directions: dragged to (-800,-800) it lands at (16,16);
  dragged to (3000,2000) it lands at (1624,782) in a 1920x1062 viewport. Never leaves the screen.
- PiP `Toggle microphone` / `Toggle camera` both act: sender `track.enabled` follows each click in
  both directions, `aria-pressed` follows the media state.

**Note:** a hard `page.goto('/w/<ws>/settings/calls')` while in the call redirects to
`/w/<ws>/call/<id>` and re-expands the surface. In-app navigation does not. So personal call
settings have to be reached from a browser that is not in a call.

### Candidate (Low, a11y) — the two media toggles report `aria-pressed` inverted

Toolbar, same instant, same account:
- mic unmuted → name `Mute`, `aria-pressed="false"`; mic muted → name `Unmute`, `aria-pressed="true"`
- camera off → name `Turn camera on`, `aria-pressed="true"`; camera on → name `Turn camera off`,
  `aria-pressed="false"`

So the name is the *action* and `aria-pressed` is the *negated state*: a screen reader announces
"Turn camera on, toggle button, pressed" while the camera is off. The PiP's own buttons get it
right (constant name `Toggle camera`, `aria-pressed` = camera is on), so the app contains the
correct pattern one component away. Low; holding pending stronger material.

### Verified working — pinning (for me / for everyone / global pin badge)

- `Pin for me` on a tile: target goes to 1888x798, everyone else to a 160x90 filmstrip; the view
  toggle flips to `Grid view`. **Local only** — measured simultaneously on bob and carol, both
  still 4x 789x444 grid. Menu correctly re-reads `Unpin for me` afterwards.
- `Pin <name> for everyone`: propagates to all four clients; every client shows the target at
  1888x798 with `[data-testid="participant-pinned-for-everyone"]` on that tile, others at 160x90.
- The badge is icon-only but carries `aria-label="Pinned for everyone by the host"`, `role="img"`,
  28x28 — accessible.
- While a global pin is active `[data-testid="call-view-toggle"]` is **disabled and renamed to
  "The host pinned QA Bob for everyone"** on every client, host included. So the product explains
  why the control is unavailable instead of removing it.

**Near-miss:** a filter of `/ view$/i` over button names reported the view toggle *absent* on all
four clients under the global pin, which looked like "the control is removed for participants".
A full enumeration of every visible `button|a[href]|[role=button]` (15 of 76 visible) found it
present under its new name. Filter, not product.

## Quality / network — could not provoke; recorded so nobody repeats it

Media on this staging call is **plain UDP host↔prflx**, not relayed:
`candidate-pair succeeded, local prflx/udp, remote host/udp, currentRoundTripTime 0.004-0.006`.
So CDP `Network.emulateNetworkConditions` cannot reach it, exactly as CLAUDE.md says.

- **CPU throttling does not create encoder pressure here.** `Emulation.setCPUThrottlingRate` at
  1 / 4 / 10 / 20, six 4-second samples each: `qualityLimitationReason` stayed `none`,
  `framesPerSecond` 20-21, resolution 1920x1080 throughout, and bob's decode kept pace
  (`totalVideoFrames` +80 per 4 s at every rate). The fake device is trivial to encode and the
  encoder is off the throttled thread.
- **HTTP/WS shaping alone (900 ms latency, 60/30 KB/s, 88 s) changes nothing**: `framesEncoded`
  +240 per 4 s unbroken, pair RTT 0.003-0.008, `call-network-indicator` "Excellent · 4ms" on the
  sender and `aria-label="Excellent connection"` on bob's tile of her, start to finish.

So **the adaptive quality surface (`call-quality-prompt`, `call-quality-applied`,
`call-quality-signal-meter`) has no reachable precondition from this rig** — I cannot distinguish
"it never fires" from "I never met its trigger", so nothing about it is written up.
`useAdaptiveCallQuality` classifies on RTT / loss / jitter / concealment / freeze ratio and on
encoder pressure, none of which CDP can move while the media is on UDP.

**One unexplained single observation, NOT written up:** an earlier run applying CPU 20x *and*
network shaping together froze alice's outbound video completely at t=44 s — `bytesSent` stuck at
26 552 863 and `framesEncoded` stuck at 5976 across 10 consecutive samples over 27 s, with
`frameWidth`/`frameHeight`/`framesPerSecond` all absent (no frames encoded in the window), while
the toolbar still read `Turn camera off` and the indicator still read "Excellent · 4ms". It did
not reproduce with either lever alone. One run, no mechanism, and the rig is a suspect — recorded
here so a later session with a real degradation lever can go at it, not filed.

## Findings

### BUG-1 [Low] [frontend] Диагностическая панель звонка показывает неподставленный плейсхолдер `__ALOQA_CALL_DEBUG_MARKER__` вместо версии сборки

**Path:** Settings → Calls and audio → Diagnostics → `Show call diagnostics (nerd info)` ON →
in call, toolbar button `Call diagnostics` → panel header.

**Measured** (dave, lane B, in call, rc.7):
```
[data-testid="call-debug-panel-header"] innerText:
  "Stream monitor __ALOQA_CALL_DEBUG_MARKER__ · staging · main Copy snapshot
   The snapshot includes participant names and IDs."

leaf carrying it — exactly one node matched:
  <p class="text-fg-subtle font-mono text-nano">__ALOQA_CALL_DEBUG_MARKER__ · staging · main</p>
  textContent === innerText === "__ALOQA_CALL_DEBUG_MARKER__ · staging · main"
  boxVis true, hit test true, effective opacity 1, 239x23 at (1477,167),
  font-size 9.76px, color rgba(255,255,255,0.56), text-transform none
```
So it is genuinely painted, not an `innerText` artifact of a hidden layer.

**Built-in positive control, same line:** `staging` and `main` beside it resolve correctly, so the
line is not an unrendered template — one of its three values fails to substitute.

**Second positive control, same app:** `Settings → About` renders `Version v0.61.0-rc.7`, i.e. the
real deployed build (`data-dpl-id="v0-61-0-rc-7-10a407a46be1"`). The app has the version and shows
it correctly one screen away.

**No workaround inside the panel:** `Copy snapshot` produces 41 400 chars of JSON whose top-level
keys are `capturedAt engineState events identities qualityByParticipant clientInfo
codecCapabilities runtimeEnvironment scope stats`. Grepping it for `ver|build|sha|commit|release`
yields only `runtimeEnvironment: "staging"` — **no build identifier at all**, and the marker string
is absent from the snapshot. So the broken header line is the only place this panel offers a build.

### BUG-2 [Low] [frontend] Настройка диагностики отправляет пользователя к кнопке «Nerd Stats», которой в интерфейсе нет

Settings row copy, verbatim off the element:
```
"Show call diagnostics (nerd info)
 Adds an in-call panel with live WebRTC stats. Open it from the Nerd Stats button
 in the call toolbar."
```
The control it names does not exist under that name. The toolbar button that opens the panel is
`[data-testid="call-nerd-stats-toggle"]` with `aria-label="Call diagnostics"` and
`title="Call diagnostics"` (icon-only: `innerText` and `textContent` both empty), and the panel it
opens is headed `Stream monitor`. So the feature carries three visible names and the instruction
names a fourth. Enumerated every visible button in the call toolbar with the switch ON — 16
controls — and no name contains "Nerd".

**Verified working alongside it:** the switch itself works. Flipping it writes
`localStorage["aloqa.calls.nerd-stats"]="true"` and the toolbar gains the control; pressing it sets
`aria-pressed=true` and mounts the panel (`call-debug-panel-header`,
`call-debug-panel-scroll-region`, `throughput-sent-path`, `throughput-received-path`,
`call-debug-streams-outbound/inbound`, `call-debug-details-transport/codecs/client/engine/events`)
with live figures (`SENDING 1 … 24 kbps opus Loss 0.00% RTT 10 ms`, `RECEIVING 5 … VP9 480x270
Jitter 2.0 ms Dropped 279 Freezes 2`).

**Near-miss:** my first scan for the panel filtered testids on `/nerd|diag/` and found nothing,
which read as "the toggle does nothing". The panel's testids are all `call-debug-*`. Filter again.

### Verified working — the /settings/calls camera preview does not leak into the call

dave's camera was OFF in the call while `/settings/calls` rendered `<video aria-label="Camera
preview">` 640x480, playing, on a `fake_device_0` track. At the same instant dave's senders were
`[{audio, enabled:true}]` only, `outbound-rtp[kind=video]` was an empty list, and alice's tile of
dave showed `participant-video-placeholder` visible and `video-muted-icon` visible, no `<video>`.
Held across two samples 5 s apart.

### BUG-3 [Medium] [frontend] Подсказка качества «Your connection can't carry video right now» не убирается сама и показывает при этом полную шкалу сигнала

**Status: measured on hour-old tabs; re-verification on freshly reloaded clients IN PROGRESS.**

Measured on alice, 40 samples over 275 s (poller nominal 240 s — 15% stretch under machine load;
the claim is per-sample DOM state, not a rate, so the stretch does not touch it):

```
call-quality-prompt visible          40 / 40 samples
prompt text (identical in all 40)    "Your connection can't carry video right now.
                                      Not now  Turn off my camera"
call-quality-suggestion              data-action="audio_only"  role="status"
call-quality-signal-meter            data-remaining-bars="4"  in 39 / 40 samples  (one at "2")
                                     aria-label="Connection strength"
   all four bars computed style      background rgb(245,158,11), opacity 1, heights 4/8/12/16 px
                                     -> none drawn hollow
call-network-indicator               Excellent x30, Good x9, Poor x1
   4 bars AND "Excellent" together   29 / 40 samples
outbound-rtp video, same samples     framesEncoded 15163 -> 20389  (+5226 over 275 s)
                                     framesPerSecond 13-21, 480x270
                                     qualityLimitationReason "none" in 40 / 40
call-quality-applied rows            none, ever
```

Simultaneously on the other clients: alice, bob and carol (all publishing video) each showed the
identical prompt with `data-remaining-bars="4"`; dave, whose camera is off, showed no prompt —
so the prompt is gated on publishing video, and it is not one client's artifact.

`Not now` works and is the only way out: on bob it cleared the prompt within 1.2 s and it stayed
absent for 161 s / 28 samples.

**Cause (citations at deployed sha 10a407a46be1, all four paths verified with `git cat-file -e`):**
`packages/features/calls/ui-web/hooks/useCallQualityPrompt.ts` maps severity to the meter —
`remainingBarsBySeverity = { unknown: 0, healthy: 4, degraded: 2, severe: 1 }` — and returns
`remainingBars: remainingBarsBySeverity[severity]`. So a four-bar meter is the component stating
the current sample is `healthy`. In `packages/features/calls/model/hooks/useAdaptiveCallQuality.ts`
`severity` is rewritten on every sample (`QUALITY_SAMPLE_INTERVAL_MS = 2000`) while `suggestion` is
cleared only on accept or dismiss. The two therefore drift apart the moment the link recovers.
`CallQualitySignalMeter.tsx`'s own comment says the lost bars are "drawn hollow — the shape itself
carries how bad it is"; here it carries "nothing is wrong", inside a card saying video is impossible.

**Dedup:**
- ALK-1071 (TESTING) is this feature's spec. Its acceptance criteria are "On sustained poor network
  a prompt offers audio-only / lower resolution, applied on accept" — it specifies the prompt
  appearing, nothing about withdrawal or about the meter. Not a specified state.
- ALK-3229 (TESTING) is about the **top-bar** indicator being calibrated almost entirely on RTT.
  Different component and different classifier (`model/utils/networkQuality.ts` vs
  `model/utils/adaptiveQuality.ts::classifyQualitySample`). My claim does not rest on the top bar
  being right — it rests on the prompt disagreeing with its own meter.
- ALK-3051 (Backlog) is Undo after *accepting* a reduce-resolution suggestion. Different action,
  different half of the flow.
- Nothing in `--open-bugs` (188 rows read) matches.

**Adjacent open ticket, logged not reported:** ALK-3494 (Backlog, Bug)
"A local pin in grid view changes neither the tile size nor the video quality" — my pin measurement
flipped the view to Spotlight, so it is a different state; worth a targeted check.

#### BUG-3 — DOWNGRADED TO LOG-ONLY (no reproducible trigger). NOT in the report.

The measurement above stands: three clients, 40 samples, 275 s, prompt up with a full meter while
video flowed. What I could not do is make the state happen again.

Re-verification after reloading all four clients (they rejoined the same call automatically, tiles
4/4, camera states preserved):
- **Fresh client, 80 samples over 529 s** (stats-timestamp span 529 s, so the poller did not stall):
  prompt visible in **0 of 80**, even though the top-bar indicator read `Good` 13 times and `Poor`
  once in that window. `applied` empty in all 80.
- **Forced attempt**, `Emulation.setCPUThrottlingRate` 50 for 66 s then released for 75 s,
  47 samples: prompt visible in **0 of 47** in both phases.
- Earlier attempts also failed to trigger it: CPU 1/4/10/20 (24 samples) and HTTP/WS shaping at
  900 ms / 60-30 KB/s (88 s) — both recorded above.

So the state I measured was entered by tabs that had been in one call for over an hour, and I have
no click path that reaches it. A finding is finished when someone else can arrive at the proof, and
nobody can arrive at this one, so it does not go in the report. Kept here in full with the source
citations so a session with a real degradation lever (a shaped SFU path, a genuinely weak machine)
can pick it up rather than rediscover it.

**Side observation from the same reload:** a freshly reloaded client resumes publishing at
**320x180** and the hour-old client had been at 480x270 (and 1920x1080 before that), so the publish
ladder starts low after a rejoin and ramps. Recorded, not investigated.
