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

## 2026-08-30 · Two ALK tickets contradict each other on the call recording-consent gate

**What is being asked** · Someone with product authority should decide which of two tickets is live.
I am not filing or commenting on either — that needs your say-so.

**The contradiction** · Both were found by lane A while deduping a recording-consent finding.

- **ALK-1888** *[Bug / TESTING — i.e. closed]* "Remove the recording/transcription consent checkbox
  that gates joining a call". Verbatim: *"Expected: Do not require the recording/transcription
  acknowledgement checkbox to join a call. Fix location: CallDeepLinkLobby.tsx (stop passing
  actionNotice + stop gating canJoin)."*
- **ALK-1847** *[Bug / BLOCKED]* carries as acceptance criteria *"Consent требуется только когда
  recording enabled"* — i.e. it repairs the very gate ALK-1888 had removed.

So one closed ticket took the gate out, and one blocked ticket is specified to fix it. A developer
picking up ALK-1847 would re-introduce what ALK-1888 deliberately deleted.

**Why it needs you** · It is a product decision about which behaviour is wanted, and acting on it
means writing to Jira, which I never do unasked.

**What it already cost** · Lane A had a High written up — a call being recorded with no notice on
either pre-join surface, three instruments each with a positive control — and was one step from
publishing. ALK-1888 makes that measured state *specified*, so publishing would have sent a
developer to re-add a deliberately removed control. They suppressed correctly and logged it in full
with the key, per the rule.

**Options** · (1) Leave it; the contradiction sits in the backlog and whoever picks up ALK-1847
discovers it. (2) You decide which is live and I draft a comment for your approval before anything
is posted. (3) Ask the team.

**Recommendation** · Option 2. The cost of leaving it is that ALK-1847 is a trap for whoever takes
it, and the finding it blocks is real work someone will redo. But nothing goes to Jira without you.

**Where the change would go** · Jira only. No repo change either way.

---

## 2026-08-30 · Proposed CLAUDE.md line: grep all ticket statuses before writing up

**What is being asked** · Your explicit yes or no to adding one line to `CLAUDE.md`. Queued rather
than applied because it is a rule about the reporting process, and the standing rule is that nothing
constraining what future sessions do enters that file without you.

**The gap it closes** · `CLAUDE.md` already requires the check — *"Before calling a measured state a
defect, check whether some ticket **specifies** it"* — but the only tool it names for dedup,
`jira_cache.py list --open-bugs`, structurally cannot perform it. Measured today: that list shows
**188** Bugs and hides **1466** (TESTING 1259, BLOCKED 194, REVIEW 13). It surfaces 11% of the Bug
population, and the excluded statuses are exactly where a *specified* state lives.

**Exact wording proposed** (in the Reporting section, after the existing dedup bullets):

> - **`list --open-bugs` is the dedup scope, not the whole mirror — it hides the statuses where a
>   *specified* state lives.** TESTING is closed and BLOCKED is outside the rule, so neither appears,
>   and both are where a ticket that makes your measured state deliberate will be. Before writing a
>   finding up, also run `jira_cache.py grep '<the noun of your finding>'`, which searches summaries
>   and descriptions across every status. Reading the open list is not this step.

**What it already cost** · The near-miss above. Lane A read all 188 open rows, matched nothing —
correctly — and the two tickets that owned the finding were invisible to that command. One keyword
grep found both in seconds.

**Already applied without waiting** (tooling, reversible, no rule change): `jira_cache.py list
--open-bugs` now prints to stderr how many Bugs sit outside the scope and by which status, that a
ticket outside it can still *specify* the measured state, and the grep to run. Negative-controlled —
silent without the flag, and no row added or lost. That delivers most of the benefit at the point of
failure, which is why this line is a genuine choice rather than urgent.

**Options** · (1) Add the line as worded. (2) Reword it. (3) Decline — the tool warning stands alone
and `CLAUDE.md` is unchanged.

**Recommendation** · Option 1, but weakly. The tool warning is the better mechanism because it fires
where the mistake happens; the `CLAUDE.md` line matters mainly for a session that deduped some other
way. Declining costs little.

**Where the change would go** · `CLAUDE.md`, Reporting section. Nothing else.

## 2026-08-30 · The global browser cap is set beyond what this machine can serve, and it corrupted measurements

**What is being asked** · Whether to lower the global rig cap (`QA_MAX_BROWSERS`, currently 20), and
if so to what. Not changed mid-run: refusing launches five sessions are counting on would disrupt
work in flight, and it reallocates capacity across sectors, which is yours to decide.

**The measurement** · At **16** windows up — inside the cap — taken 2026-08-30 13:38 +05:

    load averages: 81.40 82.01 63.73      on 8 cores (~10x oversubscribed)
    vm.swapusage: used = 1890M / 3072M
    top process: WindowServer  82.2% CPU   <- above any individual Chrome renderer
    then Chrome renderers 33.8, 28.0, 17.9, 15.9, 15.1 ...
    coreaudiod 18.3%

The dominant cost is **compositing, not computation** — 16 maximized windows each painting live video
grids. That is why the machine sits at load 81 while the browsers look idle.

**What it already cost** · Lane C's `waitForTimeout(300)` poller degraded to **one sample per 10.6 s**
— `samples: 6` over `durMs: 63640`, overrunning its own deadline by 40%. Transient prompts in that
sector live 2–9 s, so a window that size can miss one entirely and return a confident empty result.
**The false finding it produces is an absence** ("the participant is never prompted"), which is the
direction nobody re-checks, and it is indistinguishable from the real thing. Lane C caught it,
discarded the affected measurement and re-ran. All five lanes have been told the arithmetic check
(`samples * interval ≈ durMs`), which is free and needs no new tooling.

**Why the obvious remedies do not work** · Shrinking, minimising or occluding windows reduces
compositing but an occluded rig window reports `document.visibilityState: hidden`, and the app
suppresses live UI when hidden — trading a slow poller for a client that never renders the thing,
with `document.hasFocus()` staying `true` so nothing warns you. Maximised windows are also your
standing preference. So the only real lever is **how many windows run at once**.

**Context** · The cap was raised 16 → 20 in `3cdb0e9` on the reasoning that a Calls day would
otherwise refuse a browser mid-run. That reasoning was about *sector need*; nothing measured whether
the hardware could serve it. At 16 the machine is already 10x oversubscribed, so 20 is well past the
point where measurements stop meaning anything.

**Options**

1. **Lower the global cap to 12** and let the per-sector caps arbitrate. Measurements stay
   trustworthy; a five-lane Calls day with a four-party call in one sector would sometimes have to
   queue. Sectors would need to hand windows back between checks rather than holding them.
2. **Lower to 14–16.** Closer to today's behaviour, still oversubscribed; buys less.
3. **Leave 20 and rely on the arithmetic check.** No disruption, and every session must verify
   sample counts on every timing result forever — a discipline that works until someone forgets, and
   the failure is silent.
4. **Fewer concurrent sessions** rather than fewer windows — four lanes instead of five on Calls days.
   Addresses the root cause most directly and costs a sector's worth of coverage per day.

**Recommendation** · Option 1 for the next run, not this one. Twelve keeps the machine near 8 cores'
worth of real work, and the per-sector caps already encode who needs the most. Option 3 alone is the
weakest: it makes correctness depend on nobody forgetting a check, and today it was caught by luck —
one session happened to inspect its own sample count.

**Where the change would go** · `scripts/callrig/launch.sh`, `MAX_TOTAL` default (currently 20). If
you pick option 4 it is not a code change at all, just how many sessions you start.
