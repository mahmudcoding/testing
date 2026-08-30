# AIRION QA — 2026-08-30 — lane B — sector L (Calls: media & controls)

- **Sector**: L · Calls — media & controls (16.4% of Calls), Calls map (`SECTORS-CALLS.md`)
- **Lane**: B — company `O4QBF1XTURESO01`, workspace `W4QBF1XTURESO01`
- **Deployed frontend build**: `data-dpl-id="v0-61-0-rc-7-10a407a46be1"` → tag `v0.61.0-rc.7`, frontend commit `10a407a46be1`
- **Timebox**: until 18:00 +05. Session start 12:46 +05.
- **Browsers**: alice 9232, bob 9233, carol 9234, dave 9235 (all signed in, verified by `ensure.sh`)

## Current state

**Session ended early — the timebox was cancelled by the user at ~14:40 +05, mid-run.**
Everything below is measured and logged. No report has been published yet.

Findings ready to report: BUG-1 (Low), BUG-2 (Low), BUG-4 (Medium).
BUG-3 measured in full but deliberately **not** for the report — no reproducible trigger.

**Left in flight when the session stopped:**
- Guest client. An anonymous guest ("Guest Lane B") joined via
  `https://airion-cargo.store/guest/c/<token>` (which redirects to `/join/<token>`) in a **second
  browser context inside dave's rig browser** (`browser.newContext()` works over CDP, giving a
  clean cookie jar without another window). It is still in call `V4P254XBZ5W3KPN` and will show as
  a 5th participant until dave's browser is restarted. First read of the guest surface was
  captured: guest toolbar carries `mic-control-pair`, `cam-control-pair`,
  `call-controls-screen-share`, `call-controls-live-reaction`, `call-controls-people-toggle`,
  `call-controls-chat-toggle`, `call-controls-breakout-rooms`, `call-controls-leave` — i.e. no
  view toggle, no minimize/PiP, no fullscreen, no meeting settings, no add-to-call; its own tile
  carries `participant-tile-guest-badge`; 1 outbound audio, 3 inbound audio + 3 inbound video
  (`framesDecoded` ~170 each), 3 `<video>` at 480x270 and 3 `<audio>`. **Not analysed** — whether
  the missing PiP/fullscreen/view-toggle controls are deliberate for guests is unanswered, and
  that is the obvious next question.
- The call `L media 074933` (`V4P254XBZ5W3KPN`) is still active with alice, bob, carol, dave and
  the guest. `max_video_height` restored to 1080; carol's call volume restored to 100; alice's
  Push to talk off; dave's `aloqa.calls.nerd-stats` left **on** (localStorage, per-device).

**Untested inside sector L when the session stopped:** grid pagination and the filmstrip beyond
what the spotlight layout showed (needs more than 4 bodies); device hot-plug; the `Fit to tile`
tile action; `Will be right back`; the guest's own device handling and error banners; the
`CallConnectionRecoveryBanner` / lifecycle-error path.

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

### Verified working — fullscreen and its auto-hiding toolbar

`Enter fullscreen` sets `document.fullscreenElement` to `HTML`, flips the label to `Exit fullscreen`
and `aria-pressed` false→true; the button toggles back correctly. In fullscreen the toolbar
auto-hides: idle → `[data-testid="call-toolbar"]` slides from y=984 to y=1062 with effective
opacity 0 (own `opacity` stays 1, `display:flex` — it is translated off, not unmounted); a pointer
move brings it back to y=984, opacity 1, 23 visible buttons including `Mute` and `Leave call`; it
hides again ≤1.5 s after the pointer stops.
**Keyboard users are not locked out:** with the pointer still and the toolbar hidden, `Tab` reveals
it on the first press (opacity 0→1) and focus walks into it — all 17 toolbar buttons are
`tabIndex=0`, and by tab 9-11 `document.activeElement` was `Mute`, `Select microphone`,
`Turn camera off`.
**Rig note:** `page.keyboard.press('Escape')` does NOT leave fullscreen — that is a browser-level
UA action Playwright cannot send. `document.exitFullscreen()` works. Not a product defect.

### Verified working — "Stop watching" / "Resume watching"

bob → carol's tile → `Stop watching`: the tile's `<video>` is removed, `participant-placeholder`
replaces it and the tile reads **"You stopped watching QA Carol"**; held across 6 samples / 15 s.
The menu correctly re-reads `Resume watching`, and picking it re-subscribes:
`totalVideoFrames` 48 → 98 → 148 → 198 → 248 → 299 → 349 → 399 over 8 samples at 2.5 s (≈20 fps).

### Verified working — Call volume slider (audio mix), including for late joiners

`[data-testid="audio-mix-slider-main"]`, native `input[type=range]` 0-100. Setting 25 puts both
remote `<audio>` elements at `.volume = 0.25`; five `ArrowLeft` presses (the control takes focus)
take it to 20 / `0.2`; restoring 100 gives `1`. The popover label tracks it ("Call volume 25%").
**Applies to someone who joins afterwards:** with carol at 30, dave left (2-step leave:
`call-controls-leave` then `call-leave-confirm-submit`) and rejoined; carol's audio element count
went 2 → 1 → 2 and the new element came up at `0.3`, not `1`.

### Verified working — camera that cannot be opened

With `navigator.mediaDevices.getUserMedia({video:true})` rejecting `NotAllowedError` (positive
control: a direct call from the page returned `NotAllowedError` at the same moment), pressing
`Turn camera on`:
```
t+946 ms  toast: "Call media issue — Camera or microphone is unavailable.
                  Check browser permissions and selected devices.  Dismiss"
          camera button STAYS "Turn camera on"   (state not falsely flipped)
          senders: audio:true, video:false        (audio unaffected)
t+9.5 s   toast gone
```
Polled at 500 ms from before the click, 32 samples. The two identical notice entries are one toast
matched by both `[data-sonner-toast]` and `[role=alert]`, not a duplicate toast.

**Rig trap worth recording:** CDP `Browser.setPermission {name:'camera', setting:'denied'}` reports
`navigator.permissions.query({name:'camera'}).state === 'denied'` **but gUM still succeeds** —
`--use-fake-ui-for-media-stream` grants it regardless. Without a direct-gUM positive control this
reads exactly like "the app ignores a revoked camera permission", which would have been a false
High. Permission denial is not testable on this rig; simulate at the gUM boundary instead.

### BUG-4 [Medium] [frontend] Меню устройств не отмечает используемое устройство, пока его не сменишь вручную

In-call `Select microphone` popover (mic + speaker lists) and `Select camera` popover.

**Measured on three clients, same build, same call:**
```
dave  — has never opened a device picker in this session
  live tracks   audio: "Fake Default Audio Input"      video: "fake_device_0"
  audio elements sinkId: "(default)"  x2
  microphone rows  Fake Default Audio Input / System default device   NOT marked
                   Fake Audio Input 1                                 NOT marked
                   Fake Audio Input 2                                 NOT marked
  speaker rows     Fake Default Audio Output / System default device  NOT marked
                   Fake Audio Output 1 / Fake Audio Output 2          NOT marked
  camera rows      fake_device_0                                      NOT marked
```
So every list contains the device that is live, and marks none of them.

**Positive control inside the same popover** — carol, at one instant, after picking a speaker
earlier in the session and never picking a mic or camera:
```
  speaker  Fake Audio Output 2   MARKED   background oklab(0.501154 -0.0199705 -0.207887 / 0.1)
                                          color rgb(36, 84, 216)
           (audio elements sinkId b662491f9d35 == that row's "Device ID b662...6cc8")
  mic      Fake Default Audio Input (live) NOT marked   background rgba(0, 0, 0, 0)
                                                        color rgb(17, 20, 26)
  camera   fake_device_0 (live)            NOT marked   background rgba(0, 0, 0, 0)
```
Three lists, one popover, identical markup — the one the user picked is marked, the two that are
merely *in use* are not. So the picker can mark a row; it simply never marks the starting device.

Reproduced on bob independently: all six audio rows unmarked at first open; picking
`Fake Audio Input 1` marked that row immediately.

**Consequence:** to find out which microphone or camera the call is using, the only move available
is to select one — which changes it.

**Second defect in the same markup, kept as a note not a separate finding:** the mark is carried
only by background and text colour. Every row has `role=null`, `aria-checked=null`,
`aria-selected=null`, `data-state=null` and contains no icon (`svgCount 0`), so the selection is
conveyed by colour alone and not exposed to assistive technology at all.

**Dedup:** the published sibling `reports/aloqa-calls-inside-qa-2026-08-26-A.html` carries
"Выбор микрофона в звонке не переключает микрофон… а в списке отмеченным остаётся прежний" — that
is about a *picked* microphone not taking effect. **I re-measured that and it still holds on rc.7:**
bob's sender track label stayed `Fake Default Audio Input` after picking `Fake Audio Input 1`
(before and after both `['Fake Default Audio Input']`), while the picked row became marked. That
finding is theirs and stays theirs. Mine is the disjoint case — *nothing* picked, *nothing* marked,
in all three lists including camera and speaker, which that finding does not reach. Nothing in
`--open-bugs` matches; `jira_cache.py grep` over `microphone`, `camera`, `device` returned no ticket
about the initial marking.

### Verified working — speaker selection and Maximum video quality

- **Speaker:** picking `Fake Audio Output 1` set every `<audio>` element's `sinkId` to
  `16fc45a52982d404`, matching that row's "Device ID 16fc...3c51"; picking Output 2 moved it to
  `b662491f9d35a136`. So the speaker half of the picker genuinely switches output.
- **Maximum video quality** (Meeting settings → `meeting-settings-video-quality-slider`, values
  180p / 360p / 720p / 1080p): set to `Minimal — 180p`, `GET /meeting/<id>/settings` returned
  `max_video_height: 180`, and within 5 s **all three** publishing clients went 480x270 → 320x180
  and held there for 40 s / 8 samples. Restored to 1080p, `max_video_height: 1080`.

### ALK-3369 is FIXED on rc.7 — keyboard on the Maximum video quality slider

The ticket (TESTING) says the slider "reacts only to the first arrow press, then focus leaves it".
Measured now: `ArrowRight, ArrowRight, ArrowRight, ArrowLeft` moved the value 0→1→2→3→2 with
`document.activeElement === slider` **true after every press**, and the slider is reachable by Tab
in 5 presses from the top of the panel (`meeting-settings-entry-open` → name → password → max
participants → guest-link visibility → slider). No regression.
