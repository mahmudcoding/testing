# Decisions pending — for Mahmud

Things that need Mahmud, queued because he may be away. **Nothing is dropped from here
until he has answered it.** Everything else — tooling, helpers, wrong facts in docs,
handoffs, fixture notes — is applied without asking and recorded in the session log
instead.

Append new items at the bottom with the date, what is being asked, why it needs him
rather than being decided here, and the options with a recommendation. Remove an item
only when it has been answered, and say what the answer was.

---

_Queue cleared 2026-08-30 at Mahmud's request. The previous 24 open items and 3 resolved
ones are in git history: `git show 3cdb0e9:DECISIONS-PENDING.md`._

## 2026-08-30 · Camera *switching* is not testable on the rig, and the fix reaches outside the workspace

**What is being asked** · Whether to leave camera-device switching as a permanent blind spot, or set
up a virtual camera on the host so it can be tested.

**Why it needs you rather than being decided here** · Every option that actually fixes it installs or
configures something on your machine outside this repo. That is outside what I apply without asking.

**The measurement** · Lane B enumerated the rig's fake devices: three `audioinput`, three
`audiooutput`, and exactly **one** `videoinput` (`fake_device_0`). `launch.sh` passes
`--use-fake-device-for-media-stream`, which supplies that single fake camera; Chrome has no flag that
creates a second one. `--use-file-for-fake-video-capture` replaces the feed of the one device, it
does not add another. So mic and speaker switching are exercisable and **camera switching is not** —
there is nothing to switch to.

**What it has already cost** · It came within one measurement of a false finding. Lane B caught it
before writing anything up. Lane A was heading for the same picker from the other side (the lobby
device check) and would have read "the camera selector offers no alternative" as a product defect.
The trap is recorded in `SELECTORS.md`, so the false-finding risk is handled either way — what is
unresolved is the coverage gap, in a sector that is 16.4% of Calls.

**Options**

1. **Accept the blind spot.** Zero cost, already documented. Camera switching never gets tested on
   the rig; a regression there would reach users. Mic/speaker switching still covered.
2. **Virtual camera on the host** (OBS virtual cam or similar), so a second `videoinput` exists.
   Makes it fully testable, costs a one-off setup, and installs software on your machine — and every
   rig browser would then see it, which is a behaviour change for all five lanes.
3. **Test it by hand outside the rig**, occasionally, on a machine with a real second camera. No
   install; not repeatable and not automatable.

**Recommendation** · Option 1 for now, revisited only if a camera-switching bug is ever reported from
the field. The gap is narrow (switching between cameras, not camera on/off, not device permissions,
not the picker rendering), it is now documented where someone will hit it, and options 2 and 3 both
cost more than the risk currently justifies. Worth your explicit yes or no rather than my silence,
because it is a decision to leave part of a sector untested.

**Where the change would go** · `scripts/callrig/launch.sh` (flags) if option 2; nothing if option 1.
