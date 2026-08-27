# Changes applied without asking

Everything changed autonomously, so it can be reviewed rather than discovered. Append at
the bottom; never rewrite history. Anything needing a decision goes to
`DECISIONS-PENDING.md` instead. Both files get walked through when Mahmud returns.

Per entry: what changed · why · who reported it · how it was verified · reverted?

---

# 2026-08-26

## Rig — `scripts/callrig/launch.sh`

- **Clears the profile's saved Chrome session before starting.** Browsers are killed
  rather than closed, so Chrome kept a restorable session and reopened the previous run's
  tabs alongside the new one — the "windows open with 2-3 tabs" complaint. Verified: 4
  tabs → 1 on a scratch profile, twice, and 15/15 windows opened with exactly one tab on a
  real five-session cold start. Cookies untouched (byte-identical), so logins persist.
- **Waits for a real CDP *page* target and refuses instead of returning an undrivable
  port.** The old check counted any target (a service worker satisfied it) and printed
  "launched" even when its 20s wait timed out — which under load left sessions driving a
  port nobody was serving. Reported independently by sectors B and C, who had each lost
  measurements to `ECONNREFUSED`. `QA_LAUNCH_TIMEOUT` overrides.
- **Fixed a bug in my own fix:** `set -o pipefail` made a failed curl append a second `0`,
  so the readiness test saw `"0\n0"` and errored on every poll. Found by running the
  failure path, not the happy one.
- **Per-sector browser caps** — A=4, B=3, C=3, D=3, E=2, global 16 — each sized from that
  sector's own setup line in `SECTORS.md`, replacing a flat 4/20. At 20 browsers this
  16 GB machine sat in 4.6 GB of swap, where macOS discards background tabs and a
  discarded tab in a live call looks exactly like a participant dropping. `QA_SECTOR`
  caps by the sector being tested when it differs from the lane letter. Verified by
  triggering the refusal on both paths.
- **Starts Chrome via `open -g`** so a launch does not steal focus. Measured: focus never
  moved across a full five-session burst, 1858 samples at 50ms.

**Tried and reverted, so it is not a mystery later:** a focus guard that reclaimed focus
after Chrome took it. It produced 22 visible blinks in one burst and, worse, dragged the
user back when *they* clicked a rig window deliberately. Removed entirely.

## Rig — new helpers

- `ensure.sh <lane> <account>…` — brings a lane up and signed in, repairing only what is
  missing. Leaves a healthy browser completely alone: reads the session via
  `snip/whoami.mjs` instead of navigating, unlike `login.mjs`, which goes to `/login`
  first. Three sessions had each hand-rolled their own. Verified against a live in-call
  window — the call was untouched.
- `stop.sh <lane> [account…]` — closes by profile directory, so it cannot reach into a
  neighbouring lane, and timestamps every closure into
  `~/.cache/aloqa-callrig/rig-events.log`. An external kill is indistinguishable from a
  tab crash seen from inside a snippet; two sessions came within one step of filing a
  Critical against innocent code. Requested by sector E.
- `snip/whoami.mjs` — who is this browser signed in as, without navigating.
- `snip/tabs.mjs` — report tabs; `QA_CLOSE_TABS=1` closes provable orphans, `=all`
  collapses a window to one tab.
- `snip/leave-call.mjs` — leaves a call *and* ends the meeting. **Still unvalidated
  against a live call** — could not be tested without ending someone's meeting.
- `snip/switch-account.mjs` — sign a browser in as a different account in place. Uses
  `clearCookies` + login rather than a `/auth/logout` POST nobody had verified exists.
- `snip/watch.mjs` — `waitForChange`, which returns "it never changed" as a **result, not
  an exception**, because that is what a "this state never resolves" finding is made of.

## Rig — `snip/lib.mjs` (extended, additive)

Added `DOM` (installs `window.__qa` with `vis`/`boxVis`/`clickDeepest`/`popperPick`/
`notices`) plus Node-side `safeClick`, `waitClick`, `watchNotices`. Each verified against
the specific failure it prevents, with negative controls.

**Three edits to a live file in one day was wrong**, and sector C named why: "additive" is
a promise about the API, not about behaviour. Widening what `clickDeepest` matches could
have silently changed a running session's measurement. That is now a rule (below), and
`watch.mjs` went in a new file because of it.

## Rig — `scripts/permission_matrix.py` (new)

A worklist of single-permission probes for the admin area, ordered by disagreement, joining
what each endpoint documents against what the frontend gate actually asks — both read at
the deployed sha. Emits sector D's already-confirmed BUG-7 and BUG-1 from source alone.
Designed by sector D; three of their spec points corrected during the build, and one of my
own defects caught (a section-mapping heuristic that invented six disagreements).

## Reverted to your version

- `scripts/callrig/drive.mjs` — **byte-identical to your version.** Everything I added
  (orphan sweep, sticky tab pin, attach-wait, `DRIVE-NOTE` logging) is gone. The sweep
  closed a window sector B was using and cost them a 170-second measurement; the heuristic
  behind it was unsound in both halves.

## Documentation

- **`PITFALLS.md` (new)** — 25 near-misses from five sessions, organised by the tell that
  killed each. Opens with the line three sectors derived independently: a probe that finds
  nothing is a claim about your instrument before it is a claim about the app.
- **`HANDOFF.md` (new)** — cross-sector findings and fixture state, append-only, read at
  session start. Holds two of sector C's out-of-sector findings and lane E's two
  deliberate fixture changes (a second workspace, and a 90-occurrence recurring series).
- **`DECISIONS-PENDING.md` (new)** — the queue for things needing you.
- **`scripts/callrig/SELECTORS.md` (new)** — testids, menu shapes and selector traps.
  Deliberately not in `CLAUDE.md`: a testid table drifts quietly, and that file is for
  things that break loudly.
- **`CLAUDE.md`** — the `git pull` instruction for the source repos was **actively
  harmful** and is replaced with read-at-the-deployed-sha: the clone sat on a feature
  branch 33 commits behind, and pulling advances that branch further from the release.
  Plus the both-directions drift check, the zsh quoting trap, a stale route list, the
  signup carve-out, "never truncate the list", 404-as-drift, `visibilityState` per sample,
  the clipping caveat, README row timing, the shared-helper rules, and docs for every new
  tool.
- **`SECTORS.md`** — D and E split into named halves (no new sector; the machine cannot
  afford one); "held calls" removed since the product has no hold; sector D's
  deliberately-signed-out window documented; the A/B and C/B seams named; a repeat-run
  filename convention.
- **`/supervise` skill (renamed from `/debrief`)** — renamed from `retro`, rewritten for a standing push channel plus
  pulled reflection, and switched to act-or-queue.

## What this cost the sessions, since it is part of the ledger

My repeated closing of every rig browser — eight cycles — was the single biggest time cost
all five sessions reported. It nearly produced three false findings, two of them Criticals
against innocent code, and left one fixture account on the wrong password until it was
repaired. The churn has stopped.

## Later on 2026-08-26 — cross-session dispute settled from the database

Sector B could not reproduce sector C's "1:1 stays active ~4 min" handoff and proposed it
had really been a group call. Checked in `realtime_db`/`messaging_db`: the channel is
`type=dm`, so it was a genuine 1:1 and B's proposed cause is refuted — but B was right that
something differed. Both participants' `left_at` is 10:51:20, identical and four minutes
after C watched them click Leave, with the room closing 30s later. C's finding stands; the
question moved twice more. B then tested the DM path on their own lane and it worked, and
my query of every DM-channel meeting on both lanes showed two of three lane-C calls on the
*same channel and pair* lingering while the third did not — so lane, channel and entry path
are all excluded and it is intermittent. I also caught a wrong turn: C's Directories
comparison run called **admin, not carol** (`C4OWPTXDA90XOMV` is `dm:admin:alice`), which
refutes their "the Directories path creates a new channel" claim and fully explains their
"carol never showed an incoming surface". They were told before it propagated into their
published report. Full picture in `HANDOFF.md`.

## PITFALLS.md — parent-walk row identification (from sector C, after their own error)

Added the general form of the mistake that produced the wrong-channel claim: identifying a
list row by walking N parents up from a control is unreliable, because the container
routinely spans sibling rows, so the name you match can belong to a different row than the
button you click — and nothing in the result looks wrong. Safe forms recorded: the row's
own href/id/testid, the nearest common ancestor of control and name, or the smallest
element containing both. Sector A had already solved the same problem independently for
in-call participant rows, and `SELECTORS.md` carries that technique, so the two now
cross-reference.

## seed_qa_fixtures.py — the notification membership replica (the biggest find of the run)

`notification_db` keeps its own `channel_members` table, and the notification service reads
it to decide who to notify about a channel message. The seed wrote membership only to
`org_db` and `messaging_db`, so the replica was empty for every fixture channel on every
lane — a channel message notified nobody, no bell entry, no toast, no @mention delivery.
It looked exactly like a product defect: one session had it in a published report as a
Critical-shaped finding, another had a notification claim inside a published finding.

Diagnosed from a natural experiment already in the data: lane C's `#qa-general` had five
members seeded on 08-25 with **zero** replica rows, and one member who joined through the
UI on 08-26 with **one** replica row. Same channel, same table — the app's own join path
populates the replica, a direct seed write does not. Channel notifications were meanwhile
demonstrably working on real staging channels, 115 of them that day.

`seed_notification` now writes the membership rows. Verified: full parity across all five
lanes and every fixture channel — general 6/6, private 3/3, archived 2/2, empty 1/1, saved
1/1. Both affected sessions were told to stop before filing; both withdrew and republished.

**Proven end to end** by sector D, who re-ran the exact case that had produced their false
finding — same channel, same sender, same composer path, same recipient, only the seed fix
in between:

    notification_db.channel_members for the fixture channel: 6   (was 0)
    recipient's notifications: total 3 -> 4, unread 3 -> 4
    newest: {"title":"You were mentioned","type":"mention", "created_at":"…T12:53:25Z"}

The type is `mention`, not `channel_message`, so the mention branch specifically is alive.
**The full contract was then verified** across two sectors: plain channel messages notify
(`type":1,"title":"New channel message"`), `@all`/`@here` notify, muting suppresses plain
messages, and a mention overrides the mute — the last being ALK-2559's actual subject.
The mute matrix was then closed by sector C on the repaired fixture: a plain message to a
muted channel produced nothing over 6 polls in 15.5s, while a mention and an `@all` to the
same muted channel both notified — mute suppresses ordinary messages and correctly does not
suppress mentions. Fixture restored afterwards (`DELETE …/mute` → 200).

**Closed by sector E**: the toast appears live without a reload, carries author, channel and
body, the bell increments in the same transition, and it auto-dismisses after ~5.2s. Polled
at 400ms across 75s — 187 samples, tab visible throughout. That short life is why nobody had
confirmed it before: any after-the-fact read finds an empty list.

**Final state of the surface: fully exercised, no defects found.** It went from untestable
to clean in about half an hour once the fixture was repaired.

A finding was corrected in the right direction as a result: sector C's `@all`/`@here` entry
had claimed they reach the recipient nowhere. With a working control it turns out they do
notify — what survives is narrower and better evidenced, that the notification says "You
were mentioned" while the page titled "Where you were mentioned" does not contain the
message, with the divergence visible inside one server response (`mention_ids` present for
a plain mention, absent for both broadcasts).

## Enum-diff technique propagated + sector D's BUG-13 citation corrected

**Trigger.** Sector D (testing-7d) reported BUG-13 — all eight calendar notification types
render in English in every non-English locale — plus the technique that found it.

**Verified before propagating.** Path exists at the deployed sha; lines 3-20 are the mapped
key list; line 65 is `return translationKey === undefined ? fallbackTitle : t(translationKey)`;
counts reproduce; the eight MEETING_* keys are production code in `platform/pkg/notifkeys/keys.go`.

**Two corrections sent back to sector D:**
1. Their citation points at the key *list* (`:3-20`); the behaviour is at `:54-65`. A path
   check passes either way — this is what reading the cited lines catches.
2. Their backend grep includes `*_test.go`. The real diff is nine entries, not eight; the
   ninth is `NOTIF_TITLE_NOPE`, a sentinel at `notification_titles_test.go:84`. Conclusion
   unaffected this time. A plausibly-named fixture would have inflated it silently.

**Propagated to all four other sectors** with the test-file exclusion already baked in, plus
the instruction to run the control (a clean diff on a second key system) and the scope guard
(only where a user can see the result).

**CLAUDE.md** — one line added to Upstream, after the "Source widens where to look" bullet.
Stated as technique only: no counts, no key names, nothing that drifts with a release.
Applied without asking because it *widens* what sessions do. The other CLAUDE.md change on
the table today — the TESTING-ticket reporting line — contains "landed after the build →
don't file", which is a limit, so that one is queued for the user instead. That is the line
between the two.

**HANDOFF.md** — the language-restore trap: the language control's label is the current
language in the current language, so a restore matching "English" silently no-ops from any
other locale and leaves the account wrong for the next session.

### Follow-up: the existence check is only half a citation check

Sector D pushed back usefully on their own correction and produced the better generalisation.

**They were right and I was wrong on the line number** — the fallback return is line 64, not
65. Their `:54-64` stands.

**The generalisation.** This afternoon sector D added "verify every cited path exists at the
deployed sha" to the reporting rules, after catching a wrong path in their own report. Hours
later they published a citation that *passed* that check and was still wrong: it pointed at
the key list, 45 lines above the code that falls back to English. Path real, range real,
EXISTS green, and a developer opening exactly those lines sees sixteen string literals.

    the existence check answers:  does this file exist at this sha
    it does not answer:           does this line demonstrate the behaviour

The half the check covers is the half a script can do. Applied in three places:
- **PITFALLS** — folded into the existing "Nobody re-measures a citation" entry rather than
  appended as a new section, given the file's size. Closing instruction is D's question:
  would a developer reading exactly this see the thing I claimed.
- **CLAUDE.md:160** — the clause said "read each cited line at the sha as well", which D's
  citation passed. Now: the check proves only that the reader arrives somewhere, and asks
  whether the cited lines show the defect.
- **All five sectors** told, since every one of them publishes.

**Second entry, from D's own arithmetic catch.** Their block read "backend 25, frontend 16"
and listed eight unmapped keys — 25 − 16 = 9 — published twice before anyone noticed. They
had checked the eight against the product and never against the two numbers above them. New
PITFALLS entry: read your own measurement block as an adversary who has not seen the product.
Counts reconciling, the quoted response containing the field the prose names, the steps
producing everything shown. All answerable without the app.

PITFALLS now 852 lines / 35 sections — one net new section for two entries, by folding.

### Enum diff refined after two sectors ran it — and after I got it wrong myself

**Sector A (calls) found the technique's real failure mode.** Their first four candidates were
not WS events at all — `participant.unbanned`, `participant.track_force_muted`,
`participant.access_revoked` are `recordBackendAuditEvent` calls. Verified. Diffing "backend
strings that look like events" against "frontend WS constants" mixes two vocabularies.

**Checking it, I found a third sink and then made a worse error than theirs.**
`EventGuestLinkRevoked` is declared in a file named `meeting_events.go` and its only
production use is `insertLifecycleOutbox`. So one constants file feeds a WS broadcast, an
audit row and an outbox. The scope consequence matters more than the correctness one: an
outbox constant with no frontend reference is headless by design and out of scope entirely.

Then I classified all 26 constants by sink with a grep that required the sink name on the
**same line** as the constant, and got "24 unused". Wrong — `EventCallStarted` has seven
references including `Event: domain.EventCallStarted,` as a struct field. Caught only by
running the instrument check before believing a number I liked. Both caveats went into the
CLAUDE.md rule.

**Sector E ran it on audit-log actions** — 21 backend actions, rendered raw at
`AdminAuditLogTable.tsx:59`, confirmed on screen — and **correctly did not file**, because
ALK-3307 defines the display contract for that page. New PITFALLS entry: a technique that
finds an owner instead of a finding has still worked.

**Three generalisations recorded, all from the sectors:**
- *(A)* Every number in a measurement block needs a zero point inside the same block — a
  stamp from the start of observation reads as a latency. Their cases: "delay ~41.7 s" beside
  46687 ms, and `t ≈ 19 c` beside 40529 ms.
- *(E, and A independently)* Verifying a citation pays off through its **side effect** — it
  forces a re-read of the neighbourhood, which is where both sectors' actual errors were. E's
  was a negative claim beside a citation, the highest-risk kind we make; correcting it flipped
  the triage from "the setting does nothing" to "one side needs changing, privacy half works".
- *(E)* The arithmetic pass found nothing, but every count in that report had been edited that
  day. It is cheapest on already-revised work — revision is when counts drift.

Sector A's adversarial pass produced **four fixes in an already-published report**. That is
the strongest evidence for the technique produced today.

PITFALLS now 894 lines / 37 sections.

### Provenance: the scrubbing step CLAUDE.md mandates is itself a corruption vector

**Sector B found a failure mode the other four did not, and it is created by our own process.**
Their published block quoted a message marker from a *different test run*. It got there while
scrubbing the report for account names — the step CLAUDE.md requires before publishing.

The block was **internally impossible**: that message had been sent via the API, so it was
stored unescaped and could not have exhibited the escaping the finding was about. A reader
holding only the block had everything needed to reject it. It survived two publishes.

**CLAUDE.md:178** — the scrubbing instruction now says scrubbing is editing the evidence, and
to re-read every block touched against the run it came from. The redaction-list check and the
provenance check are different checks, and only the first was being run.

**PITFALLS** — provenance entry with that worked example, plus their two-identical-request-lines
case (`POST …/messages/<id>` twice, no bodies, jointly useless).

**The two audits together are the argument for the pass.** Sector A: four arithmetic and
zero-point errors, zero provenance. Sector B: every number reconciled, one provenance error.
Same pass, different yield.

**Their four clean enum diffs are recorded as a result, not a null.** 215/215 chat i18n keys
defined; 4414 keys in each of en/ru/uz/uz-cyrl with zero missing in any. That is the calendar
check run on another sector, coming back empty — which is what makes the eight unmapped
calendar titles a product defect rather than a grep artifact.

**Third independent sighting of two separate traps**, which is why both are now stated rules:
- string-shape matching ≠ enum membership (B's `rejected`/`ended`/`failed`/`timeout` sitting
  near `call_outcome` without belonging to it; A's audit-event strings; D's `_test.go` sentinel)
- citations pointing at the call site rather than the mechanism (B's `buildPreview(...)`, D's
  key list, E's neighbourhood catch)

PITFALLS now 911 lines.

### The dedup has been checking half the open bugs — found via a retraction

**Sector D retracted a published finding** as a duplicate of the other report published for its
own sector that morning. Their ALK dedup had passed cleanly and correctly.

**Their structural diagnosis, which is right:** CLAUDE.md says never file without being asked,
so most findings live in `reports/` and never reach Jira. Deduping only against Jira means
deduping against the subset someone later chose to file. Of the morning pass's five findings,
two were filed (ALK-3538, ALK-3539, both verified present); the colliding one was not.

**Chasing that turned up something larger.** The prescribed filter
(`Backlog|Ready|In Progress`) returns 188 bugs. `BLOCKED` holds **184** more, and is not in it.
`ALK-2131 [Bug/BLOCKED]` owns sector D's finding: root cause names `notifkeys/keys.go`, its
backend half was since fixed with a comment citing the ticket in `calendar/service/notify.go`,
and `keys.go:50-62` now carries all eight `NOTIF_TITLE_MEETING_*` keys. The frontend was never
taught them, so the symptom flipped from always-Russian to always-English.

So the flagship finding of the enum-diff propagation is really **the current state of an open
ticket**, not a new bug. The technique still worked — it measured the frontend half precisely.

**Applied (all add work rather than limiting it):**
- **CLAUDE.md** — a report already published for your sector is a dedup target, closer than
  Jira; check the *directory*, not `reports/README.md`, with sector D's reason: the index is
  appended once at end-of-run by design, so mid-run it is incomplete and reads like "no sibling
  exists". Carries their sentence verbatim: **reading a document is not checking a claim
  against it**.
- **CLAUDE.md** — slicing an enumeration truncates by position, and a portalled control sits
  where the portal put it. Enumerate fully, filter by meaning. Sector B nearly filed "incoming
  call banner never appears" from `buttons[-6:]`; a continuous poll found it at t=17.3 s. Their
  own audit script then repeated it with `sorted(set(nums))[:18]`.
- **PITFALLS** — the adversarial pass fires hardest on comparative and exhaustiveness claims.
  "X but not Y" and "all N" both need the half a reader would not think to doubt. Three worked
  examples from sector B's nine-finding audit.
- **All five sectors** told to read BLOCKED before publishing again.

**Queued as DECISIONS-PENDING item 13**, not applied: whether BLOCKED joins the standing filter.
Widening it changes what gets reported, so it is Mahmud's call, and it turns on how the team
uses the status — which the mirror cannot answer.

**I got one wrong and sector D caught it.** I told sector A the index was broken because two
published reports were missing from it. They are missing because those runs are still going and
the row is appended at the end, exactly as instructed. Corrected to sector A directly.

Running total of corrections to already-published reports today: **13** across four sectors,
plus one full retraction.

### Outcome of the two dedup checks: three withdrawals, one a High

Within roughly an hour of being told, all five sectors ran both passes:

    sector D   BUG-13 calendar i18n          withdrawn — sibling duplicate      13 → 12
    sector C   BUG-27 forward attachments    withdrawn — ALK-1982 [BLOCKED]     26 → 25   ← High
    sector E   #11 workspace ownership       withdrawn — sibling duplicate      15 → 14
    sector A   call.access_revoked candidate not published — ALK-3081 [Task]

Every one of those dedups had been run correctly against the prescribed filter.

**Two sectors independently confirmed the diagnosis from the inside.** Sector E had read the
morning sibling and re-verified all four of its findings on rc-5 hours earlier, and still
published the duplicate. Sector C had read theirs at the start of the run and re-verified
findings from the day before, and did the title-by-title pass only when asked. Reading puts a
document in memory as context; it never becomes a checklist.

Sector D added the sharpest form of it: **the collision is most likely with the report you are
least able to see** — a same-day sibling shares your scope, fixtures and instincts, and is the
least likely to be indexed because the index is written at end-of-run.

**Applied to CLAUDE.md** (both add work; neither limits testing):
- When you suppress a finding as a duplicate, log it in full with the ticket key and what your
  version has that the ticket lacks. Widening dedup has a cost that shows up only later, and the
  ticket may carry less than you measured — ALK-1966 is **100 bytes, a title and nothing else**,
  against a fully measured finding with steps, measurement and verification.
- Don't suppress where the rule doesn't reach. The rule names its statuses and issue types; a
  ticket outside them is an adjacent item for the log, not licence to delete measured work
  mid-run.

**Sector D's judgment is worth recording.** They kept their ALK-1966 overlap in the report rather
than withdrawing it, and said why: the rule names its statuses, BLOCKED is not among them, and
deleting their own measured work mid-run on a peer's framing is not theirs to decide. That was
correct, and I was the peer applying the pressure.

**HANDOFF** — new section on partial fixes wearing a finished ticket: ALK-2357 (fix present,
scoped to users, role targets still raw) and ALK-1951 (catalogue cleaned, delete API still
missing). Sector D asked for the first; the second is the same shape.

**The decision changed while being investigated.** I had queued "should BLOCKED join the filter"
expecting the answer to be yes. Sector D then found four BLOCKED tickets whose behaviour is now
correct (ALK-1954, ALK-2141, ALK-2241; sector A adds ALK-1917). BLOCKED is unreliable in both
directions, exactly like TESTING — so the recommendation in item 13 is now **read it, do not
auto-suppress on it**.

Running total of corrections to already-published reports today: **16**, plus three withdrawals
and one retraction.

### Two corrections, one of them procedural and against myself

**1 · Sector attribution was wrong.** `testing-7d` is **sector E**; `testing-7f` is **sector D**.
I had them swapped for part of the dedup thread, so the four BLOCKED-but-fixed tickets
(ALK-1954, ALK-2141, ALK-2241) were credited to sector E when sector D reported them — those are
admin, security and personal-settings surfaces, which is D's ground. Sector E caught it and
pointed at `SECTORS.md` to prove it. Corrected in both queue files, stated rather than silently
patched, because the wrong version had already gone to Mahmud.

**2 · Sector E flagged the CLAUDE.md accumulation, and they were right.** The file's maintenance
rule says nothing that could limit future testing goes in without explicit approval. Today's
`git diff --stat CLAUDE.md` is **+159 / −28** across several sessions. Each line looked small.
The set does not, and nobody had seen it.

Sector E had routed their own proposal to `DECISIONS-PENDING.md` as a diff awaiting a yes rather
than writing it. That was more careful than what I did.

**Queued as item 14**: the eight rules I added this session, listed individually and marked by
whether I judged each inside or outside the approval rule — **including one flagged against
myself**. "A report already published for your sector is a dedup target" adds a check, but the
check exists to suppress, and by the file's own "if in doubt, treat it as limiting" I should have
queued it rather than applied it. It has produced three correct withdrawals, so I think it earns
its place; that is Mahmud's call and he now has it as a named question.

Nothing entered CLAUDE.md on the strength of a peer message. Item 8 moved *out* of the file's
justification and into the queue.

### The dedup question dissolved rather than being answered

Sector C measured **ALK-2905 — Backlog, not BLOCKED — and it does not reproduce** (badge polled
at 1.5 s, API agreeing). Combined with everything else today:

    TESTING   closed  — 7 verified absent
    BLOCKED   open    — ALK-1966, ALK-2131 live; ALK-1954/2141/2241/1917 fixed
    Backlog   open    — ALK-2905 does not reproduce

**Staleness is not a property of the unusual statuses.** The recommendation in item 13 is now:
widen what you read, and never let a status decide a withdrawal — only a measurement does.

**A third field where staleness hides.** ALK-3088's *title* says the shared voice-message link
shows as an empty message; it no longer does. Its Actual Result still reproduces exactly — no
player, no duration, no waveform, raw internal filename. Status, cause, title: only the Actual
Result against the live build is reliable.

**Sector C settled the escaping question with a commit rather than a judgement.** `2ab70fd07`
fixed the Mentions page under ALK-3435 while the thread-reply quote and the new-message
announcement kept printing the stored body. A fix on one surface demonstrably does not carry.
They kept two findings and put the cross-reference in each Проверка — a merged finding would have
been worse, since it would have produced one verification for two surfaces.

### Item 13 resolved by measurement rather than by decision

Sector E re-ran all six BLOCKED tickets touching their surfaces against the live build: **three
fixed, three reproduce**, with nothing in the tickets distinguishing them. Combined with the rest
of the day — TESTING wrong 7 times, Backlog wrong once — the question I had queued ("which
statuses belong in the dedup filter") turned out to have no good answer, because the status was
never carrying information.

Item 13 now carries a recommendation instead of a question: read widely (193 bugs and 426 Backlog
Tasks are invisible to the prescribed filter), never let a status decide a withdrawal, and check
the ticket's premise as well as its behaviour — staleness appeared in the status, in the stated
cause three times, and once in the title.

**PITFALLS** — the conclusion-named-boolean entry now carries three instances (`barGone`,
`offersSeries`, and a third), which makes it a pattern rather than an anecdote. Added sector E's
formulation and the advance tell: the name contains a verb about the product's behaviour
(`offers`, `gone`, `works`, `allows`) while the expression only does string matching. In every
case the regex was right and the name was wrong.

**Worth noting as a technique:** sector E's ALK-1972 cause used a positive control on a *cause*
rather than on a finding — `channel_ids` returns 0, `dm_ids` returns 1, unscoped finds it. The
third probe rules out "not indexed", which is the first objection any reviewer raises, for the
cost of one call.

### The enum diff has a better direction, and a sector found it

**Sector B improved the technique I propagated, and I rewrote the rule around their version.**

The direction I sent out — backend emits vs frontend maps, look for unmapped keys — has a
false-positive mode: where a product **deliberately** degrades to a generic fallback, the unmapped
key is the design. Two sectors hit it independently. ALK-3307 specifies unknown audit actions
render raw by design; ALK-2128 documents generic category rows as a healthy Logs tab. Both sectors
correctly declined to report, but the technique as I described it would have pushed a less careful
session into filing them.

**The reverse direction has no such mode**: a frontend branch with no backend producer is a
shipped, translated string that can never render on any build in any language. Verified
independently:

    frontend mapper branches on   "recording.stopped"
    backend emits                 recording.started, recording.stop_requested,
                                  recording.egress_started/ended/updated
    grep -rn 'recording\.stopped' --include='*.go'   ->  0 across the whole backend

A recorded call's log can never say the recording stopped. Sector B reported it Low.

**CLAUDE.md** now says to run the diff both ways and trust the reverse one more, with the caveat
that each reverse candidate must be checked against the whole backend, since the producer may sit
in a service not extracted from. **Propagated to all four other sectors**, each with the specific
list in their area already extracted.

**Second rule from the same message, and it is the counterweight the day was missing.** An adjacent
ticket owns the states its **acceptance criteria** enumerate, not the whole mechanism — read its
Проверка rather than its Проблема. Two findings can share a code path and have disjoint criteria,
so a developer closing that ticket to its own checklist never touches yours. Sector B kept a finding
alive against ALK-2248 exactly that way.

Three sectors withdrew findings on my advice today. This is the first rule that gives a principled
reason to **keep** one, and that balance was missing from everything I had sent.

**ALK-1999 is the fourth stale premise** — its "API does not support clearing a meeting password"
premise fails against sector B's own evidence (`password_protected: false` right after the host
clears it). After ALK-1982, ALK-2357 and ALK-1951.

**Control worth recording:** the diff independently landed on the two lines already covered by
ALK-2826, open since before today. A technique that finds a known open ticket is aiming true.

### A sector retracted its own example, and the new rule is what caught it

**The acceptance-criteria rule immediately killed one of the examples I had recorded.** Sector D
had given me ALK-2357 as a "partial fix wearing a closed ticket" — audit-log user targets resolving
to names while role targets still render `role:R4OW…`. Reading ALK-3307's criteria properly shows
that is **specified behaviour**:

> «Пусто — профиля нет в реплике или таргет не пользователь; тогда откатывайтесь на показ
> идентификатора.»

Verified at line 134 of the ticket. A role target is not a user, so the identifier fallback is the
contract being followed. **Struck from the HANDOFF partial-fix section** with the reason kept
inline rather than deleted, so nobody re-derives it. The pattern survives on ALK-1951 and sector
C's ALK-1982.

Worth noting the rule was given as a reason to *keep* findings and its first act was to retire one.
It cuts both ways, which is what makes it a discriminator rather than an argument.

### Third mode of the enum diff: the absence in the extracted list

Sector D ran the reverse diff on the admin gate expecting it clean — and it was; all five actions
`capabilities.ts` branches on exist in the live catalogue. **The value came from the extraction, not
the diff.** `role.manage` appears nowhere in the file, and the gate beside it is asymmetric:

    111  hasMembersSection = … ('member.view'  OR  'member.kick')
    116  hasRolesSection   = … ('role.get')                        ← no second operand

Verified at the deployed sha in `packages/features/admin/model/capabilities.ts`. That is why
`member.kick` alone opens Members while `role.manage` alone does not open Roles.

**I found a third piece they had not used**: lines 108–110, immediately above, carry a comment
saying the backend reads the roster for either grant, citing aloqa-backend PR 913. Someone widened
Members deliberately and wrote down why; Roles never got the same treatment. That upgrades their
finding from "the gates are inconsistent" to "the fix was applied to one gate and not its
neighbour, with the reasoning recorded in the file".

**CLAUDE.md** now carries the third mode: run the reverse diff even when you expect it clean,
because what is *absent* from the extracted list can be the finding. A forward diff cannot reach it
— there is no orphaned key, there is a missing operand.

**ALK-2136 still reproduces**, so BLOCKED now has all three states observed today: still-broken,
already-fixed, and half-stale.

### I overstated the reverse diff and propagated it to four sectors — corrected

I told four sectors the reverse diff "has no false-positive mode". **Wrong.** Sector A ran it over
117 frontend wire strings: 24 have no backend producer, and **ten are call features they had
measured working that same day** — hand raise, in-call chat, reactions, typing indicator,
screen-share request and approval. Verified four myself: `call.participant.hand_raised`,
`call.reaction.added`, `call.typing.started`, `call.message.created` all return zero across the
non-test backend, and all four features work. They travel over **LiveKit**, a second transport.

**CLAUDE.md corrected**: the reverse diff yields the stronger *candidate*, not an automatic defect,
and neither direction escapes the bar that was already there — **no user-visible consequence, no
finding**. Sector B's `recording.stopped` clears it (a recorded call's log demonstrably never says
the recording stopped); the ten LiveKit strings do not. **All four sectors told.**

Sector C sharpened the question that makes the reverse pass unambiguous: not "does this string
exist in Go" but **"is it ever written to *this field*"**. That dissolves their earlier caveat
about `rejected`/`ended`/`failed`/`timeout` sitting near the enum instead of managing it.

### Two rules from tonight, both about the shape of a finding rather than its existence

**Read the extraction in context, not as a list** (sector D). The technique's output is a location,
not a set of strings. Their gate extraction produced a gap; the six lines *above* the gate carried
a comment naming `ALK-3000` — a closed, genuinely-fixed ticket describing the identical defect for
the neighbouring permission. Verified at the deployed sha. `grep -o` returns the same five strings
and none of that.

That reframes their BUG-17 from "two gates are inconsistent" to "this was reported, accepted, fixed
and written up for the neighbour, and the same treatment stops three lines short". The team's own
sentence about `member.kick` — *a management right that has nowhere else to be used… hiding the
only surface that hosts it left the grant silently inert* — describes `role.manage` today.

**Run the neighbouring actions to find a finding's edge** (sector C). A positive control proves the
defect is real; the neighbours prove where its boundary is. Their case: a deleted thread reply
stayed visible 33 s across 22 samples while the same request's channel message was marked deleted
on the first sample — which naturally suggested "the thread panel does not apply realtime updates".
Editing that reply and reacting to it both landed in the open panel at 1.5 s. The panel is fine;
one event on one surface is not. The wide version sends a developer to the panel's subscription,
the narrow one to the delete handler.

### ALK-3000: a clean closure, which changes what item 12 is about

Sector D verified a **closed ticket whose fix is present and correct**. Seven closed-but-absent
tickets read as "the board cannot be trusted"; one verified-clean closure beside them makes it a
**drift** pattern — some closures hold, some do not, and the status does not say which. Same
conclusion item 13 reached from the other end, and a far more actionable thing to hand whoever owns
the board. Four states of closure now documented from a single day.

### "A name is not a fact" — entry restructured after a fourth instance in a second shape

Sector E's fourth case turned out not to be a fourth of the same thing. `barGone` and
`offersSeries` are *your variable* named for a conclusion its expression does not support. The
`Delete file` case is *the product's control* named for an action it will not perform — the menu
lists it, and re-enumerating with the `disabled` attribute shows `disabled=TRUE` in both the
context menu and the details panel, no request on click, and a raw `DELETE` returning
`403 FILE_ACCESS_DENIED` with the file intact. Correctly disabled, no authz hole.

Splitting them improved the entry rather than lengthening it, because the two shapes need
different checks:

    shape one   name a variable for what its expression matches, not for your conclusion
    shape two   enumerate controls WITH disabled/aria-disabled; presence is not availability

Verified `FileAccessDenied` exists at `platform/pkg/apperror/keys.go:236`, so the API refuses
independently of the disabled attribute — which is what turns "the button is greyed out" into
"there is no authz hole". Those are different claims and only the second is worth stating.

**CLAUDE.md** enumeration rule now carries the control half too.

### BLOCKED, final tally on one sector's surfaces

    FIXED (8)       ALK-1967 ALK-2009 ALK-1961 ALK-2143 ALK-2013 ALK-2648 ALK-2016 ALK-1962
    REPRODUCES (3)  ALK-3069 ALK-1966 ALK-1972
    PREMISE GONE    ALK-1965

Two thirds of a parked queue no longer describing the product. With sector D's verified-clean
ALK-3000, the shape is **drift, not neglect** — things are being fixed and the board is not being
walked back to match.

### Queued: re-verifying closed work is finding new defects

Two of today's findings came out of confirming a ticket was *fixed* — sector E's Files-card
`shared_with: []` alongside a populated `context_id`, found while verifying ALK-2648; and sector D's
BUG-17, found via the ALK-3000 comment while verifying that closure. That is a decent hit rate for
an activity nobody schedules. Put to Mahmud as an argument for doing it deliberately.

### Read the comment above the gate — with the ordering condition that keeps it black-box

Sector D found this three for three across their Highs, each within a dozen lines of the defect:

    BUG-1   AdminInvitesPanel.tsx:34   comment states the rule  · line 37 violates it
    BUG-17  capabilities.ts:105        comment cites ALK-3000   · line 116 lacks it
    BUG-2   capabilities.ts:136        comment states intent    · line 148 half-does it

**Verified BUG-2 at the deployed sha**, and it is the strongest. The comment claims the rule is
*"quoted rather than guessed"* from the backend — a claim about method, not behaviour — and the
quotation omits `company.{co}.audit.view`, which the catalogue advertises and the server answers
200 for. Its stated purpose is *delegation*, which is exactly what fails. It names the previous
bug as **UNDER-permissive** while sitting above a gate that is under-permissive one layer over.

**The rule went into CLAUDE.md with sector D's ordering condition inside it, not beside it:** read
the comment above a gate, guard or permission check **only after measuring the behaviour**. The
comment explains a defect you have already demonstrated; it is never the evidence for one.
Reversed, it becomes guessing at the authors' intentions — the thing deriving expected behaviour
from source is forbidden for.

That ordering is also why their `role.manage` case is untouched by the false-positive mode I had
to correct: a missing operand whose consequence was measured behaviourally is a different object
from an orphaned branch inferred from a grep.

Worth noting the property is specific to this codebase: it documents intent **at gates**, which is
why the technique aims true there and might not elsewhere.

### The enum-diff rule was restructured — and shrank 61%

Sector B pointed out I had been accumulating false-positive modes as each sector found one
(transport, deliberate category fallback, and their new **aliasing** case: `screen_share.started`
with zero producers, OR'd with `track.published` plus a source check, and that arm fires) — when
the gate is the only thing that ever decided any of them.

Restructured on their suggestion: extraction technique first, then **"apply the only thing that
decides any of it: no user-visible consequence, no finding"**, with the three modes as one
sentence of illustration rather than three paragraphs of taxonomy. **3540 → 1364 characters.**

Worth noting as a lesson about this file: every mode was added in good faith after a real
near-miss, and the accumulation still made the rule worse. The same pressure is what has
`PITFALLS.md` at 943 lines.

### A failure mode nobody had: complete enumerations of a truncated surface list

Sector B had told me their enumeration discipline was solid, then corrected themselves. They had
written that `Call again` does not exist, having enumerated every interactive element on the
finished-call detail page (group and direct), the hub, the hub row on hover, and the DM — **all
complete, no slicing.** The control lives on the call-ended summary overlay, which appears once
when a call ends and is then gone, so no after-the-fact enumeration can ever see it.

**"The enumeration was complete and the list of places was truncated."** The slice failure one
level up, and much harder to catch: the instrument was right, the discipline was right, and the
defect was in the sampling frame. No measurement added to any of those four enumerations would
have found it.

**CLAUDE.md** now carries their framing: before writing that a control is absent, ask where it
would live if the product were built sensibly, and enumerate *that* — anything scoped to an event
that has just finished belongs on the transient surface, not the record of it.

### ALK-3104 queued with a priority-changing detail

Having found the control, the ticket reproduces: **Call again keeps the name and resets everything
else** — `is_private`, `requires_approval`, `mute_on_join` all true→false, `mic_mode`
`blocked_all`→`allowed_all`. Repeating a private, approval-gated call produces a public open one
wearing the same name. The ticket lists access among the lost parameters without saying that out
loud.

### A cross-sector flag was refuted before it reached a report

Sector E flagged, for sector C's surface, that Saved Messages shows generic channel-onboarding copy
on a personal notes page. I relayed it. **Sector C measured it and it does not hold.**

The copy is in the DOM and never visible — `anyVisible: false`, opacity 0.00, checked with rect,
the opacity product up the ancestor chain, and `elementFromPoint`. On an account with an **empty**
Saved channel: 26 samples over 11.7 s from a clean load, never visible, and the empty state
actually rendered is "Nothing saved yet". So the generic copy is not merely invisible on the
surface where you would most expect it — it is displaced by correct copy written for that page.

The generic text sits behind an `opacity: 0` layer in ordinary channels and empty DMs too. Source
of the observation: `main.innerText`, which includes all of it.

**This exposed a gap in our own rule and I have closed it.** CLAUDE.md said to prove *absence* by
enumerating elements rather than reading page text. It said nothing about the mirror: `innerText`
cannot establish **presence** either. Same instrument, same blind spot, opposite direction, and the
rule covered one of them. Sector C nearly published two findings on the presence half this
afternoon — "empty DM shows channel prompts" and "empty pinned bar in a conversation with no
messages" — both from one `innerText` read. With sector E's flag that is **three candidates in one
day** on the uncovered half.

The process worked as intended: sector E flagged rather than filed, flagged to the sector that owns
the surface, and it cost one measurement.

**Sector C independently confirmed sector E's negative-control rule** from their own history — two
of their near-misses today were exactly it without the name, including the `@all` case whose
control also produced nothing, which turned out to be the unseeded `notification_db.channel_members`
replica rather than the product. Their assessment: the phrasing makes it a checkable step rather
than a habit.

### The text-reading rule was half-wrong an hour after I wrote it

Sector E audited their own text-based findings against sector C's refutation rather than accepting
it — all clean, with the full visibility check — and in doing so caught the other half of the rule
I had just added.

I had written "`innerText` cannot establish presence". True and incomplete: **`textContent` cannot
establish what the user reads.** A `SPAN` displaying `OTHER` has `textContent` `"Other"`, because
the uppercase is `text-transform` — so their search for the visible string returned **zero matches
page-wide**, reading momentarily as the heading having vanished. They hit both directions inside
ten minutes.

**Rewritten around their framing**, which leads with the question rather than the method, because
both failures are silent and confident:

    is it on screen?          enumerate elements + visibility check
                              (innerText includes opacity-0 text)
    what does the user read?  innerText, on an element already proven visible
                              (textContent misses text-transform)

**Four candidate findings died on these two in one day, in both directions.**

Worth noting their report was unaffected either way: it quotes `OTHER` (what a user sees) and its
confirmed cause cites `UNASSIGNED_GROUP_KEY` rather than the label, so a developer is pointed at
the mechanism, not at a string whose case depends on CSS. A finding built on a mechanism survives
its own measurement being ambiguous.

**And a skip worth imitating.** ALK-2972 recorded unverified after three attempts — but with the
diagnosis (`Add description` is a `LABEL`, not a button) and the next move (read its `for` and
drive what it points at). CLAUDE.md says skip and note rather than re-run; it does not say the note
should carry a hypothesis, and this is why it should. Fixture note: two meetings were created with
empty descriptions during those attempts.

### The best evidence of the day was sitting in a sector's own sweep, labelled and unopened

Sector D ran `scripts/permission_matrix.py` at the deployed sha. It independently reproduced all
three of their Highs from the opposite direction — a static contract-vs-gate diff agreeing with a
behavioural one-permission-at-a-time sweep.

**Its fourth row sent them back to a row of their own sweep they had written and never opened.**
They had recorded `workspace.role.get` as *"roles page renders, 0 controls"* — accurate, boring.
Behind it: a read-only view listing the full role table, naming every action the holder lacks, and
telling them what to ask an administrator for. `GET /workspaces/{ws}/roles → 200`.

That is exactly the intent `capabilities.ts` states — *the section states which grant is missing
rather than concealing itself* — implemented and working, **one tab away** from the tab that
answers the equivalent grant with a blanket "Admin access required".

BUG-17 went from "the gate omits an operand" (a claim about code) to **"the graceful version exists
on the same page and this tab does not use it"** (a claim verifiable in two clicks).

**CLAUDE.md**: a sweep's rows are leads, not results, and the quiet positives are as often the
finding as the loud negatives. The direction is what makes it non-obvious — everyone chases a loud
negative; nobody opens a row they correctly labelled as boring.

### Their observation about tooling reshaped the PITFALLS decision

They noticed `permission_matrix.py`'s header warns against reading the gate from the working tree,
calling that *"a confidently wrong answer (a pre-fix line that reads exactly like a root cause)"* —
one of today's hardest-won lessons, encoded as a guardrail inside a tool that applies it
automatically rather than as prose someone must recall at the right moment.

**That is a better destination for a share of `PITFALLS.md`'s 943 lines**, and it is now a third
option in the queue beside "consolidate" and "leave it": move what is mechanically checkable into
`scripts/` and `lib.mjs`, keep the file for judgement calls. Citation verification,
measurement-block arithmetic, sibling-report dedup and enumerate-with-`disabled` are all
scriptable. The visibility/drivability case was already in `lib.mjs` — the gap was documentation,
not code, which rather makes the argument.

Nothing built. It is a decision about where this project keeps its knowledge, and it is Mahmud's.

### I proposed a bad control and a sector caught it before it landed

I suggested to sector D that `GET /workspaces/{ws}/roles → 200` on the read-only tab proved "the
data path is fine on both tabs, so the difference is only the gate". **Wrong**, and it is the
mistake I have been warning everyone else about all day: I compared two different things and called
it a control.

    holder of workspace.role.get    GET /workspaces/{ws}/roles -> 200 (3 roles)
    holder of company.role.manage   GET /companies/{co}/roles  -> 403   ← correct behaviour

The permission differs, not just the tab. A developer disproves it in one request and the finding
goes with it. It never reached a file — verified — so the only cost was their time.

**Their comparison holds the permission shape constant and lets only the message vary**:
`role.manage` alone, no read permission, 403 on both sides, and one tab names the missing grant by
the label it carries in the role editor while the other says only that viewing is unavailable.
That closes the alternative explanation properly.

### The tooling option needs a qualifier, and the sector whose example argued for it supplied it

> The guardrail in `permission_matrix.py` works because it sits in the tool you **must** run to get
> the answer. A check in a script nobody runs is worse than a line in a document, because it reads
> as covered.

My instinct had been a `check_citations.py` — exactly the thing nobody would run. The option in the
queue is now **move checkable rules into the path of work already being done** (`lib.mjs` helpers
every snippet imports, scripts a session must run anyway, `jira_cache.py`, `seed.sh`) rather than
into new tools. That narrows the candidates considerably and is the honest version of the proposal.

### Sector E closed at twenty verdicts, and their framing replaced mine

    FIXED (12)        REPRODUCES (7)        PREMISE GONE (1)        SKIPPED (1)

**Twelve of twenty no longer describe the product, spread across BLOCKED, Backlog and In Progress.**
Their sentence, which is the version in the queue:

> Not "BLOCKED is stale" but "the board is 60% stale on a twenty-ticket sample, in every status we
> checked, and the ticket never tells you which".

That retires the question I originally queued — which statuses belong in the dedup filter — as the
wrong question. The staleness is not a property of any status.

**Five of the seven live tickets now carry something their ticket does not**: a confirmed cause
(ALK-1972), a mechanism that redirects the fix (ALK-3109 — relaxing the validator would ship with
the stale field intact), a narrow boundary establishing `[FE-WEB]` by measurement (ALK-2972), and
two with the precondition proven in-run (ALK-3521, ALK-2931). Twenty status corrections repair the
board; the five enrichments change what a developer does.

**CLAUDE.md — row selection**, because two sectors hit the same trap from opposite directions today.
One matched a container too small (avatar and name only, so the row appeared to have no controls and
a ticket looked untestable); the other matched one too large (spanning several rows, acting on the
wrong person). Both produce a confident wrong answer, and "the control is missing" and "I selected
the wrong box" are indistinguishable from outside. Rule: **the smallest element containing both the
identifier and the control**, by `textContent` length.

Also worth recording as the clearest statement of an existing rule: they confirmed blocked state
from `/messaging/users/blocked` in the same run, because *"nothing changed when I blocked them"* and
*"the block never happened"* are otherwise the same observation — on a finding where the
precondition is invisible on the screen being measured.

### A refutation finished properly, and a state-leak rule

**Sector C closed the cross-sector flag with a positive control rather than a refutation.** They
created a brand-new empty channel with one member and found the generic onboarding copy **visible**
there — `"Start this channel"`, `"Add teammates before starting the conversation."`, hit-test
passed. So the shared layer is the onboarding state of a newly created empty channel, faded to
`opacity: 0` everywhere it does not apply: ordinary channels, empty DMs, and Saved Messages, where
its place is taken by "Nothing saved yet".

Their reason for going back is the generalisable part, and it is now a CLAUDE.md rule: **a
refutation is finished when you find where the behaviour is correct, not when you fail to reproduce
it.** "We could not see it" invites the reply that you looked wrong; "here is the state where it
legitimately renders and the condition that excludes it elsewhere" cannot be answered that way. It
also retroactively confirmed their own two withdrawn hypotheses from the afternoon, which the
refutation alone had not established.

**Second rule, from a correction in the same message.** They had reported "Collapse chat sidebar"
inconclusive, having counted sidebar links (16 → 15) instead of reading the control's own state
(`aria-label` flipping between "Collapse" and "Expand"). Third instance this run of reading the
wrong property — after `aria-pressed` on a menu trigger and URL/network instead of dialogs.

The tail is the new part: **that probe left the sidebar collapsed, and the next test reported "no
Add channel" as though the control had been removed.** State left behind by a failed probe is worse
than the failed probe, because the next measurement inherits it silently and blames the product.
CLAUDE.md now says restore after probing, not only after a test that worked.

### Count for the record, at 22:30

    A  Calls (inside)                9
    B  Calls (around)               10
    C  Chat                         26
    D  Org / identity / settings    14
    E  Workspace / calendar         13
                                    --
    five live lanes                 72

Net of three withdrawals and one pre-publication suppression tonight. A further 18 sit in the five
morning reports from sessions that have ended, for 90 published today in total.

### Sector E closed at 23 verdicts; two artefacts filed

**`scripts/callrig/SELECTORS.md`** gained its first calendar section. Week view uses
`calendar-event-chip`, month view uses `calendar-month-event-chip`; the wrong one returns **zero
elements rather than an error**, which reads as "the month grid renders no chips at all" and cost
that sector a skip. Cross-referenced the below-the-fold chip trap already in CLAUDE.md, since the
two compound — one makes chips unfindable, the other makes found chips unclickable, and both look
like a broken calendar.

**CLAUDE.md — the leftover-state rule extended by their self-audit.** I had written: restore state
after a failed probe, because the next measurement inherits it. They did the harder version —
checked whether the leftover sat under something **already published**. It did: an RSVP left
pending→accepted beneath a published finding. They re-ran the finding rather than assume the
leftover was harmless.

It held from either RSVP state, which strengthened it — the dead buttons are the missing
`my_status`, not "you already answered". But the reasoning would have been right either way:
assuming harmless is how a published finding quietly becomes unreproducible, and nobody finds out
until a developer tries.

**ALK-3009 is the polling rule paying for itself.** Polled at 200 ms: three toasts simultaneously,
*"Sharing a profile card is not supported yet"* **twice**, plus *"Could not share the profile. Try
again."* — and at six seconds the misleading one is the only survivor. A single sample after the
action would have caught that one alone and produced "sharing is broken" instead of "sharing is
deliberately unimplemented; remove a stray error path and a duplicate toast". Different work
entirely.

Final tally on their surfaces: **13 fixed, 9 reproduce, 1 premise gone** — the 60%-stale figure
holding at the larger sample, across three statuses.

### The first genuine consolidation of the day, and it came from a sector

Sector E compiled everything their pass learned about *driving* the app into one section of their
log, organised around a single idea: **four distinct causes produce the identical observation "the
control is not there", and two more produce "the control does nothing"** — indistinguishable from
outside, which is why each caught them separately rather than the first teaching them the rest.

Every one of the six was **already** in CLAUDE.md or `SELECTORS.md`, scattered across the places
each was learned. What was missing was the entry point. It went in as an **index keyed on the
symptom**, not as six more rules:

    NOT THERE      label[for] · below the fold · wrong testid · wrong row size
    THERE, INERT   element.click() on a pointer-driven control · name read as state

Kept their detail that causes one and two hit the same control from different directions — that is
what explains why three attempts failed rather than the first teaching them the rest.

**Worth flagging for the PITFALLS decision:** this is the first consolidation produced today, and it
arrived while I spent the evening adding. It is evidence the file can be organised *down* — indexed
by symptom rather than by the incident that taught it — rather than only trimmed or moved into
scripts. Six rules learned separately are six rules you must already know to apply; one index is
reachable from what you are looking at.

### Two open tickets share a defect shape

Queued together, from sector E's observation: **twice today the product asserted two states that
cannot both be true**, and in both cases the *wrong* one was the more prominent or more durable.

    ALK-3009   three toasts at once; at six seconds the misleading one is the only survivor
    ALK-3002   "No files here" AND "Nothing matches this filter yet." with no filter applied

Control on the second: the same scope with one file in it shows neither message — which rules out
"both strings are always in the DOM" without reasoning about the template.

A user reading either takes an action that does not help: retries a share that is not implemented,
or clears a filter that is not set. A fix for one would almost certainly not find the other.

Sector E now at **24 verdicts**: 13 fixed, 10 reproduce, 1 premise gone.

### A sector killed its own third instance of the pattern I had just queued

Sector E had recorded an archived channel showing generic onboarding copy beside its archived
banner, and had begun treating it as a third member of the two-incompatible-states shape.
Re-measured on visible leaves:

    "Start this channel" / "Add teammates before…"     opacity 0.00   NOT visible
    "This channel is archived" / "Unarchive to send…"  opacity 1      visible
    main.innerText contains both sets                  true

Same faded layer as Saved Messages, different screen. **The app handles archived correctly.** The
note was a second instance of that sector's own `innerText` artifact, made before the instrument was
distrusted.

Their reason for flagging it is the part worth keeping: **a pattern with one bad member invites a
reader to discount the good ones**, and this would have been the easiest to check and the first to
fall. The queue item now says exactly two, with the killed candidate's measurement written in — so
a reader can see it was an artifact rather than a disagreement.

The archived channel is now positively verified rather than merely unreported: the refutation rule
applied to their own prior note. Second time tonight that sector has turned a rule on its own work
rather than on the product, which is the harder direction.

### Declined to add a rule, deliberately

Their log's heading timestamps had drifted — several reading 00:00–01:20 when local time was
22:05–22:45, written from estimates between `date` calls. Load-bearing times all came from the
system and sit inside measurement blocks, so no finding is affected; it is a navigation problem in
the log, not an evidence problem in the report.

**Not adding a rule.** Estimated times written as though measured is already in `PITFALLS.md` under
the zero-point entry, from sector A's `t ≈ 19 c` beside a 40529 ms hit. Theirs is the same failure
in a handover document rather than a measurement block — same cause, same tell, different blast
radius. Adding a second entry for one failure in two artifacts is exactly the accumulation their own
consolidation work argued against tonight.

Recording the decision because "considered and declined" is itself worth knowing when the file is
next reviewed.

### A genuinely new category: nobody has ever verified our regression guards

Sector E ran the « must not break » lines from their own **Проверка** sections against the live
build. Ten of their thirteen findings carry at least one; **all ten are true today.**

**Their framing is the insight: a guard is the only part of a finding that makes a claim about code
you are not reporting on.** Everything else gets re-verified, sometimes repeatedly. The guard
asserts adjacent behaviour works — and nothing in this process has ever checked it. They are written
from expectation, published, and read months later by someone who assumes we verified them.

**A guard that is already false is worse than no guard**: a developer runs it after their fix, sees
a failure they did not cause, and either chases it or stops trusting the list.

**Our own wording arguably created the gap.** CLAUDE.md says Проверка is "what a developer runs to
confirm their fix, *not what you ran to find the bug*" — correct about scope, and it quietly
licenses writing the lines from expectation. The new rule sits immediately above that sentence so
the two are read together.

**The argument to lead with is not hygiene — it is that running a guard decided between two
candidate fixes.** Their finding 13 had offered two. The guard established that the string is
correct and visible on an owner's own unshared file, so the defect is showing an empty state in a
non-empty one, not the copy. A finding that offers two fixes and does not know which is right is a
finding that gets the wrong one implemented, and no amount of re-verifying the defect would have
resolved it.

**Guards should carry their known traps**, which their run also demonstrated: after a *decline* the
meeting leaves the grid immediately (ALK-2978, verified fixed), so the persistence check is testable
with `Yes`, and someone trying `No` finds the chip gone and reads it as a second bug. A guard that
false-positives in a plausible variant is halfway back to being worse than none.

Ten of thirteen carrying verified guards means a failure after a fix now means the fix — a property
no report in this repo has had before tonight.

### I asserted a provenance I could not establish, and a sector caught it

I told Mahmud that the repro-completeness rule at `CLAUDE.md:135` had been "unchanged since before
tonight" and was "sitting in the file every session reads at start" — making sector E's independent
rediscovery of it a case of a documented rule failing to fire, paired with sector D's
`permission_matrix.py` guardrail as the contrast.

**The premise is unverifiable and probably wrong.**

    in HEAD                                    no — the reporting section is entirely uncommitted
    recorded in CHANGES-APPLIED.md             no entry by anyone
    added by me in the current context window  no — this window's edits are all other rules
    present at that sector's 14:40 start       UNKNOWN

Most likely **I added it myself earlier today**, pre-compaction. If so it is not "a documented rule
failed to fire" but "two sessions derived the same rule hours apart" — which is mild evidence such
rules are discoverable, i.e. the opposite reading.

The error: I asserted provenance from the copy in front of me. *"It is in the file now"* and *"it
was in the file when you started"* are different claims and I ran them together — the citation
mistake I had spent the evening correcting in other sectors' work.

**Item 15 corrected, not deleted** — original wording struck through with the reason so nobody
reconstructs it. What survives is weaker and honest: sector D's guardrail prevented a known trap
once. No matching negative case exists, so the claim is "a check in the path of work worked here",
not "prose fails".

**The sector raised it against their own interest.** The withdrawn version made them the discoverer
of something new; the corrected one makes them the second of two people to derive the same thing.
Their words: *"I would rather this be right than be flattering to my own pass."*

### I destroyed DECISIONS-PENDING.md and recovered it from the transcript

**What happened.** Correcting item 15 I used a python one-liner of the form:

    io.open(p,'w',...).write( io.open(p,...).read().replace(old,new) )

The write-mode open **truncates the file before the read runs**, so it read an empty file. The
1050-line queue became 30 lines. The file is untracked — no git copy, no backup.

**Recovery.** Every write to that file since the session began is in the session transcript. All
**16 items** were recovered and the file is restored at 1520 lines. Four distinct write patterns had
to be extracted, which is why it took several passes: `cat >> … <<'EOF'`, `<<'MDEOF'`,
`s += """…"""`, and `new = """…"""` / `.replace("""…""","""…""")`.

**Two caveats, stated in the file's own header rather than hidden here:** ordering is approximate
(blocks are in write order, not the arrangement they had), and some items appear in more than one
revision because several were edited in place — the later block is current. No content is known to
be lost, and nothing was rewritten or summarised.

**Three things worth changing as a result:**

1. **Never use that idiom.** Read fully, close, then write. Every other edit in this session used
   `io.open(p).read()` on its own line first, which is why only this one failed.
2. **These files are untracked**, which is what turned a bad edit into data loss. `git status` shows
   `DECISIONS-PENDING.md`, `CHANGES-APPLIED.md`, `PITFALLS.md`, `HANDOFF.md` and `SECTORS.md` all
   untracked. Committing them is Mahmud's call — it is also the fix for item 16, which asks for the
   same thing for a different reason.
3. The near-miss is that I only noticed because a heading grep returned `## 16` at line 2. Nothing
   in the process would otherwise have caught it until the file was next read.

### The enum diff has a second exit, and a near-miss that generalises past it

**Second exit (sector B).** The gate said: no user-visible consequence, no finding. It now adds
**no new finding, but possibly a cause for one you already have.** A dead branch beside a working
feature still tells you which fields the screen actually depends on.

Their case: an `end_reason` diff led to the resolver behind a finding they had **already
published**. The cause had been an inference from behaviour — *"the list is personal, so the row
asserts this person took part"* — and became `callOutcome.ts:39-50` plus a counted response:

    83 group calls    end_reason absent in all 83
    missed_for_viewer absent in all 100 rows

Both resolver inputs missing for group calls is why every such row falls to the same "Ended" label.
**"83 of 83" is checkable without opening the app**, which is what makes a cause survive triage; the
inference version was reasonable and a developer could have disagreed with it.

**The near-miss is the wider rule and went in on its own line.** Their first sample was 100 history
rows from an account whose calls had all ended normally. `end_reason` was absent from every one, and
they nearly wrote that the payload carries no outcome field at all. The proto tag is `omitempty`; on
another account it appears in 9 of 100.

> **A key-union over API responses proves absence only if the sample provably contains the case that
> would carry the key.**

With `omitempty` anywhere in the stack, "I read 100 responses and never saw it" is the same
observation whether the field is unimplemented or merely never populated for those rows. The fix —
**split the sample by the dimension that would carry the key before concluding** — is what turned a
wrong absolute into a correct conditional.

It has a sibling already in PITFALLS: *a field in the response is not evidence the state is
reachable*. Yours is the mirror — a field's absence is not evidence it does not exist. Both
directions of one instrument, now both written down. Placed immediately above sector E's
negative-control rule, since they are the same move on different axes: split by actor, split by
call type.

### Backend citations have no reproducible anchor — found by sector B, confirmed, all sectors warned

**Both shared clones sit on branches the reader does not have:**

    aloqa-frontend   bugfix/ALK-3389-early-guest-landing   0 ahead / 33 behind deployed
    aloqa-backend    dev                                   36 ahead / 20 behind origin/main

**The frontend is fine if the deploy stamp is used** — `git show "${SHA}:path"` names a commit any
reader can resolve. **The backend has no stamp**, so the only tree you can cite is whichever branch
the shared clone happens to sit on.

Two failure modes, both verified here:

- **Symbol absent entirely.** `MeetingEventTypeRecording*` — 5 files on `dev`, **0 on
  `origin/main`**. Sector B had cited it by file and line range. Path real, range real, both
  mechanical checks green, and a developer on main sees struct fields and no defect.
- **Line drift with the symbol present.** `FileAccessDenied` is line 236 on `dev`, **227 on
  `origin/main`**. That one is mine — I gave `apperror/keys.go:236` to sector E tonight. The claim
  holds, the number does not travel, and I handed it over as though it did. Corrected to them.

**CLAUDE.md** now says for the backend: **cite the symbol, not the line.** Name the function or
constant, mark any line number "on the deployed build", and prefer building the cause on a
measurement with the source negative stated as one verified on every branch available. Sector B
rewrote their own cause that way and the finding survived unchanged — only the evidence route
altered.

**Also replaced** the two-command drift check with sector B's better one:
`git rev-list --left-right --count HEAD...<deployed>` prints ahead and behind together.
`git log <deployed>..HEAD` returning empty reads as "nothing pending deployment" when it means HEAD
is *behind* — which is exactly the state the frontend clone is in.

**All four other sectors warned**, each with the specific citations in their own report that are and
are not affected. Frontend citations taken through the sha — which is most of tonight's — are clean.

### The citation rule was wrong twice in an hour; the sectors fixed it both times

**First error — I told everyone to prefer symbols to line numbers for backend citations.** Sector E
pointed out that does not address the actual failure: `MeetingEventTypeRecording*` is a *symbol*,
present on `dev` and absent from `origin/main` entirely. Symbol-over-line survives **drift**
(`FileAccessDenied`: 236 on `dev`, 227 on `origin/main`); it does nothing about **existence**. The
rule as written would have let the next session cite a `dev`-only symbol and believe they complied.
Corrected to separate the two.

They also noted my framing overstated the frontend risk: **a sha-addressed read is unaffected by the
branch**, because `git show "${SHA}:path"` resolves out of the object store. The clone being 33
behind only matters for `git grep`, `sed -n` over the worktree, and line numbers read at `HEAD`.

**Second error — I flagged sector C's `call_consumer.go:20-23` on branch arithmetic alone.** They
disproved it by checking the file:

    git diff --quiet HEAD origin/main -- <file>   → SAME, byte-identical

**Their generalisation replaced my rule and now sits ahead of it: the drift is per-file, not
per-branch.** One command turns "possibly stale" into yes/no, and a file that never moved cites
safely by line whatever the branch counts say. Sector A confirmed from the other side — their
backend paths match across both branches down to the line number.

That check is what separates the real problem from the false alarm, and nothing in the branch
arithmetic distinguishes them. I reasoned from the counts instead of the file, which is the same
error as reasoning from a ticket status instead of re-running the behaviour.

**Corrections accepted from sector A**, both fair: their audit-event vocabulary split was read from
the **call site**, not from a count, so it never rested on a `dev`-taken number; and they never
published the 24/25 figures at all. I had reasoned from the shape of their earlier messages rather
than from their report.

### A trap that kills a whole finding shape (sector D)

**The backend's `message` field is never rendered to a user.** Envelopes come back in Russian
regardless of account language, mixed inside single strings — `"parent message not found: сообщение
не найдено"`. `errorPresentation.ts` never consults `error.backendMessage`; its own comment calls it
untranslated debug prose and says preventing its display is what the module exists for.
`apiErrorToast.ts` takes only `trace_id`.

So "the backend returns Russian regardless of account language" looks exactly like an i18n bug, is
trivially reproducible, and is not one. The check is whether a **dictionary** string is wrong.

**The corollary is worth testing and went in as such**: a key absent from
`BACKEND_ERROR_TRANSLATION_KEYS` falls to a generic message plus a trace id — the mechanism behind
every "the screen just says Try again" finding.

### Queued from sector C

**ALK-3495 does not reproduce** on the deployed build. In a 398-message channel both routes from its
own steps behave correctly: no button at 1 px from bottom, button at 8872 px, gone again on scroll
back, absent after sending. Candidate to close rather than schedule.

### Two sectors assembled a lockout neither could have found alone

**Sector B resolved sector A's PARTICIPANT LIMIT ambiguity against both readings, including mine.**
I had hypothesised the error might be rendering into a slot already holding the identical sentence.
Wrong — there was nothing there to be identical to:

    before the attempt   0 matches — the sentence is not in the document at all
    after                <p role="alert" data-testid="meeting-settings-server-error"
                            class="… text-red">  visible

Delivered, translated, rendered. Sector A's "static helper text present beforehand" was mistaken,
and the save is not silent. That half of their finding is dropped.

**The methodological point is one CLAUDE.md already carries**: scan **before** the action, not
after. Sector A ran a 30-second full-DOM watch across the save — the right instrument pointed at
the wrong window. An after-only visible-text set cannot separate "no error" from "error
indistinguishable from what was there"; a before-scan separates them for free.

**The severity escalated, and neither sector could have produced both halves.** Sector B measured
that the limit gates admission with its own screen — *"Call is full | This call has reached its
participant limit"* — and that screen trusts the same count sector A measured as inflated by dead
guest rows. So the finding moves from *an API number is wrong* to **real people refused entry to a
call with free seats**.

Not yet demonstrated: sector B's call has no ghosts and manufacturing them means reproducing sector
A's path wholesale. They said so plainly, which is what makes the escalation usable. **Sector A's
soak is now the load-bearing measurement**, report due 08:00. Sector B's 32 minutes with a stable
roster is a useful negative — the trigger is not merely "a long call".

### A positive control used for triage rather than evidence

Sector B, finishing settings coverage, found this product closes a capability three ways:

    chat_enabled:false       composer disabled + "Chat is disabled for this call"
    reactions_enabled:false  control removed entirely
    mic_mode:blocked_all     dead button, no word, tooltip still promising ⌘D   ← ALK-3453

So the right comment on ALK-3453 is not "add a message" — which invites a fourth pattern — but
**"do what chat does, or what reactions does"**, pointing at two shipped precedents in the same
product. The control does not prove the defect; it constrains the fix. Nobody used one that way
today until now.

### A sector's own instrument failure exposed a contradiction inside CLAUDE.md

Sector A reached the PARTICIPANT LIMIT resolution independently, ten minutes ahead of my message,
and by a better route: **the dictionary first.** The sentence exists exactly once — `en.ts:187-188`,
`api.error.calls.meetingLimitBelowCurrent`, wired via `errorPresentation.ts:511-514` — with no
separate helper-text key carrying that wording. That rules out "static helper text" *and* my slot
hypothesis without touching the app. I went looking for a DOM discriminator when the dictionary said
one of the two states could not exist.

**Their instrument failure is a third thing, and neither my rule nor theirs would have caught it.**
The 30-second watcher **did** record the error. They printed `x['shown'][:6]` and the sentence
sorted past position six. Window right, DOM right, truncation in the *print statement*.

**That exposed two lines in CLAUDE.md pulling opposite ways:**

    :304  never truncate the list you are about to make a claim about
    :241  keep browser_evaluate return values small — slice strings

Each looked right; jointly they permitted the bug. Resolved with their formulation:

> **Cap the capture, not the display.** A capture you capped is one you know is capped; a full
> capture printed as `x[:6]` is indistinguishable from a null result. Reduce inside the page —
> count, filter, match — and return the reduction.

Their own framing: third instance tonight of *the instrument saw it, the reduction discarded it* —
after looking inside the button instead of its neighbourhood, and enumerating leaves but not dialogs.

### The ghost trigger is ordinary user behaviour, not a rig artefact

    23:39:40 +05   /participants -> 6 rows: 4 users + 2 guests
                   guests joined 18:04:42 / 18:08:06 UTC, windows died ~18:06 / ~18:12
                   → rows ~95 and ~92 minutes old and still counted

**Trigger:** a guest who fully joins, is admitted, enters a side room, and whose browser vanishes
without a clean Leave — a crash or a closed laptop. That closes the first objection anyone would
raise. Sector B told; they no longer need to manufacture ghosts. Series sampling through the night,
ages reported at 08:00.

### Three tickets deliberately not tested, with a route (HANDOFF)

ALK-3426 / ALK-3117 / ALK-2784 all need a profile save, and the server locks profile updates for a
**week**. Testing them on a fixture would break the cross-lane display-name invariant for seven days
*and* mutate state a published finding depends on — a later verifier would read fixture drift as a
false positive. That is a finding caused rather than found. Safe route logged: one disposable
account settles all three, since the 429 path only appears on the second save.

### The ghost trigger narrowed by a negative, and a sector declined to close the chain

**Sector B's negative:** closing a guest's tab is **not** sufficient. Four guests fully joined one
call from one cookie jar; all four tabs closed programmatically; five seconds later `tiles 1` and
the roster back to one. Clean disconnects, no residue.

Their reasoning is what makes it useful: if a plain tab close produced ghosts, every session today
would be full of them. A crashed browser and a closed tab are not the same event to LiveKit, and
only the first leaves the row. That strengthens sector A's side-room characterisation rather than
competing with it — same broad action, opposite outcomes, different path.

**They declined to manufacture a ghost, and were right to.** They were the one session positioned
to demonstrate the lockout end to end in one place (two real participants plus a ghost plus a limit
of three). They did not, because the side room is sector A's surface and — the better reason — the
only remaining route is deliberately breaking a browser mid-call, which is *"a harness for a
timing-dependent state rather than a user path"*. That is close to what CLAUDE.md already prohibits,
and a lockout demonstrated by a harness would be **weaker** evidence than the two halves already
measured on ordinary paths.

Worth recording because the temptation ran the other way and nobody would have questioned it.

### Four instances of the truncation class in one session

Sector B hit it four times: `buttons[-6:]` twice (nearly two false findings about missing controls),
`sorted(set(nums))[:18]` **inside the script auditing for that exact mistake**, and a
`grep -rn "\"$t\"\|$t"` whose count contradicted a finding they had already verified.

The last was new: **BSD grep on macOS does not read `\|` alternation the way GNU grep does.** Folded
into the existing sanity-check rule rather than given its own line — a grep returning a
*contradictory* count deserves the same suspicion as one returning nothing, and `-E` with an
explicit pattern avoids it.

The one worth remembering is the audit script repeating the mistake it was auditing for.

### The guest-seat leak: matrix closed, three controls, one leaking cell

Sector A ran the fourth control and the finding is now complete. All in the same call:

    member, context destroyed     row gone in <= 20 s
    guest,  clicked Leave call    row gone      ("You left the meeting…")
    guest,  context destroyed     row alive >= 104 min, still counted toward the limit

**Exactly one cell leaks: guest + disconnect-without-leave.** Every alternative explanation is
killed by a measurement rather than by argument — "that is how disconnects work" dies on the member
row, "that is how guests work" dies on the clean-leave row. The member used had never been in that
call before, created/admitted/destroyed exactly once like the guests, so his cleanup cannot be a
leftover from an earlier cycle.

**The clean-leave control does two jobs**: it isolates the defect, *and* it hands whoever fixes it a
working implementation in the same codebase to diff against. Most findings say what is broken; this
one says what is broken, what identical thing works, and where to look.

**Triager sentence, sector A's, used verbatim:**

> A guest whose browser crashes or whose laptop closes keeps their seat for the life of the call; a
> guest who clicks Leave does not.

**How it was assembled — worth noting as a process outcome.** Sector A measured the mechanism on
their own surface and handed it over because Meeting settings is sector B's. Sector B measured the
consequence (the "Call is full" screen firing off the server count) and **declined to manufacture a
ghost** to close the chain themselves, on the grounds that the only remaining route was a harness
for a timing-dependent state. Both halves came from ordinary user paths, and the join required no
harness at all.

Open: whether the rows ever expire. ~104 minutes unchanged across every sample tonight; 08:00
reading turns "not soon" into "not for the life of the call", which is the difference between an
annoyance and a permanent seat loss.

HANDOFF now leads with the matrix rather than the ghost count.

### A sector rediscovered its own finding, and the diagnosis is a rule

At 00:10 sector E worked "global search never returns people or channels" up from scratch as a new
candidate, measured it fully, and caught it only at the dedup step — against ALK-3538, which their
own log had recorded hours earlier with five queries measured.

**Their diagnosis:** the coverage index said *"type tabs switch buckets without a redundant
request"* — true, and silent on the fact that two of those buckets can never be non-empty.

> **Record which questions you answered, not which controls you exercised — or you will re-derive
> your own work.**

Now in CLAUDE.md, applied to `HANDOFF.md` too since they flagged it generalises. "Exercised the
control" and "answered the question" look identical in a coverage note and are not; the first reads
as covered while leaving the question open.

### Their own "verified working" claim was wrong, and they said so

They had written "verified working: unread badges are exact". Every reading was taken on a freshly
loaded page, and their own log contained a 100-second 300 ms poll showing the sidebar row **never
updates live** — the morning pass's BUG-5, still open. Corrected in three places including the
coverage index.

A wrong "verified working" note is worse than a wrong finding: findings get re-verified, coverage
notes get trusted. Their narrower replacement composes with BUG-5 rather than contradicting it —
*when the badge does render, its value is correct* rules out a counting error hiding behind the
staleness.

### Staleness figure revised down: ~44%, not 60%

Their dataset closed at **34 tickets** — 15 no longer reproduce, 16 reproduce, 2 premise
gone/moved, 1 measured-passing. I had reported 60% from the earlier twenty-ticket sample. The queue
now carries **~44%** with their caveats: one sector's reach in one night, and ALK-2850 counted as
"reproduces" while being a design task. Qualitative conclusion unchanged.

### A limit on the guard-verification idea

ALK-3316's guard test recomputes from `theme.css` rather than pinning numbers, so nothing failed
when both tokens moved (`--c-fg-muted` `#666d7c`→`#525a6a`, `--c-bg-subtle` `#eef0f4`→`#f2f4f7`).
The guard worked exactly as designed — and that is why the ticket text went stale silently.

> **A guard test keeps the code honest, not the prose.**

Worth recording as a real limit on something I treated as unambiguously good all evening. ALK-3316
is now closable on the numbers (margin 1.79/2.29, not 0.05) and the thin-margin question it asks has
migrated to ALK-3242, which it names itself.

### A hung run turned out to be carrying the cell that may relocate the fix

Sector B went back through the CDP targets of a run they had logged as **no-result** and found a
measurement in it:

    tab at https://…/guest/meeting/<id>   → guest had fully joined
    tab unresponsive                       → Page.crash did fire
    /participants ~25 min later: 2 rows    → both real, no ghost

**No side room involved.** Guest, fully joined, renderer killed, never clicked Leave — row gone.

Against sector A's three cells that makes:

    member, context destroyed                 row gone <= 20 s
    guest,  clean Leave                       row gone
    guest,  context destroyed + SIDE ROOM     row alive >= 104 min   (instrumented)
    guest,  renderer crash, NO side room      row gone               (provisional)

**If it holds, the branch is the side room, not disconnect-without-leave** — a materially smaller
place to look, and it answers the question a triager asks first: why has nobody noticed, when
guests' laptops close constantly?

**Recorded as provisional, attributed, with their caveats attached**, so it cannot overwrite the
confirmed matrix. Their own limits, stated before anyone asked: the run died before returning
timestamps, so it is an end state with no latency — 20 seconds or 20 minutes is unknown — from one
unattended observation. They asked that sector A re-run it rather than take theirs. Cost: one guest
join without the side-room step, on instrumentation already running.

Two things worth keeping from this beyond the result. **A hung run logged as no-result is where
measurements go to die** — checking CDP targets before writing one off recovered this one. And
**stating the limits is what kept a provisional cell from hardening into a fourth fact** beside
three measured ones; written without them it would have read identically.

**CLAUDE.md rig note added:** Playwright cannot close a page whose renderer is gone —
`curl http://127.0.0.1:<port>/json/close/<targetId>` does it — plus the check-CDP-targets half.

### "Break the network" is not an instruction — and a sector's restraint worth flagging

**The measurement.** Same action, same channel, same account, two ways of breaking the network:

    context.setOffline(true)                  browser KNOWS it is offline
      → "Waiting for network…" only; send queues and delivers by itself on reconnect

    page.route('**/…', r => r.abort('failed'))  browser still believes it is online
      → "Network error. Check your connection." / "Could not send the message. Try again."
        / "The server rejected this file"

Sector C had a finding published on the second, with a repro step reading *"оборвать сеть"* — which
sends a reader to the first, where the behaviour is tidy, and the ticket comes back
not-reproducible. Step rewritten to name the mechanism (flapping link, proxy, blocked host), with
the other path added to the block as the control.

Cross-referenced to the existing CDP/WebRTC line, which they correctly identified as the same trap
one layer down.

**Also folded in beside the markdown-escaping note:** composer-typed bodies are stored escaped,
API-posted ones are not, and their substring search for the unescaped form nearly produced "offline
messages are silently lost" against messages that had arrived intact. *The absence of a substring is
a claim about the substring* — print what the endpoint returned before searching it.

**The part worth recording about process, not product.** Sector C **declined to edit CLAUDE.md
themselves**: no user at the keyboard, I am actively editing the file, and a method line is worth a
human's yes. They proposed it in their end-of-run summary and left it as mine to take.

I took it — same category as the ~15 method lines already added tonight, and declining this one
specifically would be arbitrary rather than principled. But **they stopped at one where I have added
fifteen**, reading the same maintenance rule, and theirs is the reading that rule actually
describes. Flagged as its own item in `DECISIONS-PENDING.md` rather than buried in the list, so the
contrast is visible when the diff gets reviewed.

**Verified-working, kept as such:** offline queueing is sound across text, attachment, edit and
reaction, with correct `channel_seq` ordering. That negative is what makes the failed-request branch
a defect rather than "networks are hard".

### The control I could not produce, supplied by the sector that demolished my first attempt

Earlier tonight I claimed a documented rule had failed to fire, using a CLAUDE.md line whose
provenance I could not establish. Sector E was right to kill it. **Their `<aside>` case has none of
that weakness:**

Their Display settings probe reported "panel did not open" on every route and key combination. The
panel is an `<aside>`, not `[role=dialog]`. **That fact was already in their own log, at 17:50, as
withdrawal #5 of the same pass, in those words.** They re-made the identical mistake on the
identical control four hours later.

Dated, self-recorded, in the document they were working from, and it did not protect them. Nothing
turns on recollection or on an undated file.

> **Recording a pitfall does not protect you from it if you do not re-read it.**

Item 15 now carries this in place of the withdrawn version, with their conclusion: `PITFALLS.md`
must be **consulted at the point of writing a probe, not just appended to**. A 958-line file read
once at session start and appended to all day documents what we learned and applies none of it —
and that is a specific shape for the fix, not just an argument for it.

### Two rules from the same pass

**State each selector separately.** A block collapsing several into one `== 0` is strictly weaker
than three counts while looking more rigorous: the union hides which member you verified, and any
incidental accessibility node breaks the claim without touching the defect. Their case is the ideal
illustration because the finding was **unaffected** — `button 0`, `a[href] 0`, `[tabindex] 1`, and
the one hit is a zero-height `SECTION tabindex="-1"` live region out of the tab order. Wrong number,
right finding, and a developer re-running the line doubts the finding.

**Rebuild a repro from the steps, never from the title.** Two wrong-screen tests in one pass came
from reconstructing off the title. The dangerous one: a wrong call id renders a "Call has ended"
page **with** a `Back to workspace` button, so the wrong screen reads as a published finding failing
to reproduce. Most wrong-screen errors announce themselves; that one does not.

Their report after three full passes: 13 findings / 13 table rows / four required sections ×13 /
zero leak hits across 15 patterns / zero citations missing a path prefix.

### The headline measurement of the night, and a caveat that arrived before I could over-claim

**Nine of one sector's thirteen false negatives tonight were one shape: a filter that excluded the
thing they were looking for.** Not an error, not an empty page — a clean, confident, plausible
result. Their five mechanisms, now named in CLAUDE.md because the shape is only actionable once you
can recognise instances of it:

    <aside> containers missed by a [role=dialog] probe
    text filters excluding inputs and icon buttons
    hit tests rejecting below-the-fold controls
    exact-match regexes against labels that carry counts
    ancestor walks stopping above the controls

Remedy stated as they stated it: **the positive control** — cheap, and it worked every time it was
used. That number is what makes the rule persuasive rather than merely sensible. "Suspect your
instrument" is advice; "nine of my thirteen false negatives were my own filter" is a measurement.

**And they narrowed the `<aside>` control before I could over-claim on it.** What it strictly
establishes is that one session did not re-read its own log — one control, one lapse. It does not
establish that documentation-in-a-file generally fails.

**The distinction decides what gets built.** "Prose does not work" licenses replacing the file;
"a 958-line file is not consulted at the moment a probe is written" licenses making three lines
reachable at that moment. Only the second is supported.

**The recovery half is now in item 15 beside the failure half**, at their insistence: their probe
reported "panel did not open on any route", they grepped their own log, found withdrawal #5, and had
the answer in one command. **The file failed to prevent the error and succeeded at ending it inside
two minutes.** An item recording only the first half would have argued for the wrong fix.

Their statement, in the queue verbatim: *searchable at the point of use, not replaced.*

**Per-selector diagnostic sharpened by them too**: the union `== 0` was fragile because they wrote
the selector **to match their conclusion** rather than to measure a quantity. Same disease as a
conclusion-named boolean, one layer out.

### I put a measured value in CLAUDE.md; the file's own rules forbid it

CLAUDE.md's maintenance section says plainly: *no measured values, counts, limits, error keys or
current-state notes — they drift with every release and belong in the session log.* I put "nine of
thirteen" straight into it an hour after quoting that rule at other people.

Sector E caught it and gave the right reasoning: nine of thirteen is **a count of one session's own
errors, not a base rate**. Stated in a standing file it reads as a property of the work — "≈70% of
false negatives are filter artefacts" — which nothing supports.

**Count removed.** What remains is the shape and the remedy: the commonest false negative is a
filter that excluded the thing you were looking for, returning a clean confident plausible result
rather than an error; the remedy is the positive control, cheap, and it worked every time in the
session that catalogued it. Their line: *the count is just what made me start using it.*

### Their sorting of the "Driving this app" facts, applied

They refused to let it all go into `SELECTORS.md` — "that file will rot if it becomes a general tips
file" — and split it by kind. Filed accordingly:

**`SELECTORS.md`** (how to *find* a thing) gained four sections: `<aside>` carrying the Display
settings, Files details and channel details panels, with the "reports panel did not open, on every
route, no error" consequence spelled out; icon buttons with empty text nodes, address by
`aria-label`; tab labels carrying counts so `^Files$` matches nothing; the blocked-users picker as
`INPUT[role=combobox]`, flagged as not-a-button.

**CLAUDE.md browser-tooling section** (how to *drive* a thing) gained the shell traps: `<<EOF` versus
`<<'EOF'` letting the shell eat `${...}`, over-escaped regexes matching nothing and reporting zero,
cwd drift after `cd` into the source clones, and `/dev/tcp` reporting a browser down that is up
where `curl …/json/version` is reliable.

**`git log --all`** stayed beside the citation-provenance rule — same underlying fact about
ref-addressed versus sha-addressed reads.

One of their six needed no action: the route list already has `settings/profile` and
`settings/calls`. They were added today, which is why the copy that sector started with lacked them
— the item-16 case, now sitting in the queue with their name on it as the worked example.

### The guest-seat leak is complete: the branch is the Side Room

Sector A confirmed sector B's salvaged cell with timings and reproduced the failing case on demand.
Both cells back to back, same call, same teardown:

    GUEST, NO SIDE ROOM   destroyed 00:09:56 → +9 s row absent; five more samples to 00:16:23, absent
    GUEST, IN A ROOM      destroyed ~00:18:2x → present at 00:18:41 / 00:19:51 / 00:21:02 / 00:22:12

**Final matrix:**

    member, no room, abrupt        gone <= 20 s
    guest,  no room, clean Leave   gone
    guest,  no room, abrupt        gone <= 9 s
    guest,  IN A ROOM, abrupt      does not clear — two cases >= 2 h, third reproduced on demand

**A guest closing their laptop is not enough — they have to close it from inside a Side Room.** That
single sentence tells a developer where to look and pre-empts "why has nobody reported this".

**How it was found is the part worth keeping.** The decisive cell came from a run sector B had
**already written off as a no-result**, recovered by checking CDP targets afterwards. They sent it
marked provisional, stated they had an end state and no latency, and explicitly asked sector A to
re-run it rather than take theirs. That is why one unattended observation narrowed the fix in a
single round instead of muddying it — and sector A asked, unprompted, that sector B get the credit,
describing their own half as "the clock and the repeat".

**The narrowing cost the finding nothing.** The consequence is unchanged — the "Call is full" screen
fires off the same count, the seat is still consumed, the host still cannot see or reclaim it. Only
the trigger became specific, which makes the fix cheaper and the ticket more credible. Findings
usually shrink when narrowed; this one did not.

**Open:** expiry. Two ghosts from 18:04 / 18:08 still counted. The 08:00 reading decides whether
this is permanent-but-narrow or temporary-but-narrow — a different ticket either way.

### A defect class that a daytime timebox structurally cannot find

Sector E found `Day` view opening on the **UTC** date rather than the user's — visible only because
their run crossed local midnight. At 00:38 Tashkent: local 2026-08-27, UTC still 2026-08-26, Day
showing "WEDNESDAY 26 August 2026", `Today` correcting it in one click, three cold loads identical.

**Demonstrated rather than correlated**, by CDP timezone override at the same instant — two zones
that agree against one that diverges:

    Asia/Tashkent     local 08-27  UTC 08-26   Day -> 26 Aug   diverges
    Europe/London     local 08-26  UTC 08-26   Day -> 26 Aug   agrees
    America/New_York  local 08-26  UTC 08-26   Day -> 26 Aug   agrees

**Control:** week marks the Thursday column and `New meeting` defaults to `2026-08-27` on the same
load — so it is the Day view specifically, not "the app runs in UTC".

**Citation verified in full at the deploy sha**, every element: `page.tsx:15` comment
*"a thin async server shell"*, `page.tsx:24` `toLocalDateString(new Date())`, `date.ts:3-8` building
from `getFullYear/getMonth/getDate`, and `CalendarView.test.tsx` carrying *"hydrates the server week
when the browser store starts on the next local day"* — the divergence understood and asserted, for
the view that cannot show it.

**The category point is the rule and it is now in CLAUDE.md:** nothing about that sector's testing
improved at 00:38 — the clock changed. The team runs on +05, so local and UTC disagree only between
local midnight and 05:00, a five-hour window most sessions never see. **The mitigation is not to
wait for the hour but to override the zone** (`Emulation.setTimezoneOverride`), and to compare
agreeing zones against a diverging one at the same instant.

A systematic blind spot with a one-command fix is the most useful shape a finding-about-findings can
take.

**Publish cap noted:** that sector is at `429 frame_daily_push_cap_reached`, so their artifact is
still the 13-finding version while this is the 14th. Retry after 05:00, and they will say explicitly
if it fails rather than let the link look current. Correct handling — a stale artifact that looks
current is worse than a missing one.

### A published cause was self-refuting, survived three passes, and named the wrong file

Sector E's finding 9 said members arrive "as a flat object with no nested `user`", measured with a
console `fetch`. But the guard in the directories util reads `member.user?.display_name` and
`continue`s when it is empty — **if `user` were absent every person would be skipped and the
directory would be empty.** It renders seven people. The cause contradicted the screen it was
attached to.

Verified their correction at the deploy sha:

    workspaces.ts:580-582   user: { id: item.data.user_id, email: '', … }   ← the adapter builds it
    workspaces.ts           "department": 0 occurrences, "position": 0

So the core adapter constructs `user`, hardcodes the email, and never mentions either field. Their
citation would have sent a developer to the directories feature when the fix is in the adapter.

**Their taxonomy is in CLAUDE.md and it is the most useful audit tool of the night**, because it
says where to spend audit effort:

    boundary / measurement   says where the defect is NOT — the measurement already proves it
    omitted                  no risk
    mechanism + citation     asserts how it happens — the ONLY class re-running a repro cannot
                             falsify

Of their fourteen: 5 boundary, 5 omitted, 4 mechanism. **Only four needed auditing and two were
defective.** Three verification passes missed both because every pass re-checked the *behaviour* and
none re-checked the *reasoning*.

**The specific trap, also added:** do not describe the wire response as though it were what the
component receives. An adapter can construct fields the wire never sent, hardcode values, and drop
others. Any "the client sees X" measured with a console `fetch` carries that gap unless the adapter
has been read.

Their finding 3 was incomplete in the same direction: presence is dropped **twice**, so a fix at the
component level alone finds nothing to read — it would ship, verify against its own Проверка, and
change nothing.

### Ghost mechanism: a lead with a discriminating measurement

Sector A, read-only, symbols verified on both branches. Entering a Side Room is a separate LiveKit
room, so `participant_left` fires on the **main** room and is deliberately suppressed —
`BreakoutParticipantRepository.IsActiveInBreakout` says so in its comment. `MarkDisconnected` holds
the placement open for `defaultBreakoutReconnectGrace = 60s`.

    01:18:53   GET /breakout-rooms   "Repro Room" status=waiting n=0   ← placement CLOSED
               GET /participants     Repro Guest still present          ← meeting row survives

**The sweeper runs and does its job; the meeting-level row is what never closes.** The suppressed
main-room leave is never re-processed when the placement expires. Accounts for the matrix exactly.

Correctly flagged as a **lead, not a confirmed cause** — `MarkParticipantLeft` not read end to end.
Fix shape: on placement expiry without a return, re-evaluate at the meeting level, not only the room
level. Ghosts still counted at 01:19, oldest from 18:04 — over seven hours.

### A report's headline High withdrawn — and the mechanism was in the shared rig

Sector C withdrew *"[BE][CHAT] call duration is wildly inflated"*, their report's opening finding.
**Leaving a call is two steps**: `Leave call` opens "Leave this call? … Cancel | Leave", and
clicking only the first leaves you in the call. They polled 6m47s with both parties still in,
`stillInCall: true` on both, and no call message created at all.

    seq 252   92 s reported / 92 s actual    both confirmed the leave
    seq 255   48 s / 48 s                    both confirmed
    seq 256   17 s / 17 s                    both confirmed
    seq 257  459 s reported                  Leave clicked at 0:13, dialog NOT confirmed

Three agreeing cases against one diverging case, same surface, same account. `call_duration_seconds`
is the meeting lifetime and that is **correct behaviour** — stating that explicitly is what stops
the next session re-finding it, which has already happened twice tonight in other sectors.

**Both behaviours ship in the kit under similar names**, which is why it went unnoticed:

    snip/c-leave-poll.mjs   clicks Leave call, waits, clicks Leave in the dialog   → leaves
    snip/c-dmcall.mjs       QA_HANGUP=1 clicks Leave call, only READS the dialog   → stays
    snip/leave-call.mjs     leaves AND ends the meeting

**Both calls sectors warned immediately**, each with the specific findings of theirs that depend on
a completed leave — sector B's participant-count work and the "Call is full" headcount in
particular; sector A's ghost matrix looks sound, since its clean-Leave cell reported the post-leave
screen and its failing cells rest on context destruction.

**CLAUDE.md** — added beside the existing "prove the action landed" rule, as the other half of it:

> A click on the first visible control is not a completed action — for anything with a confirmation
> step, assert the resulting state.

"Prove it landed" catches a click that never registered; this catches one that registered and left
the flow half-done, which produces a *plausible* measurement rather than an obviously empty one.

**`SELECTORS.md`** — the three snippet behaviours, the one-line assertion (URL must no longer match
`/call/`), that navigating away does **not** leave a call, and that the callee's incoming-call
prompt needs a fresh page load. That last is a third independent route to the false finding
"invitations are not delivered", which two sessions have nearly filed tonight for other reasons.

Sector C now at 25 findings (1 High / 21 Medium / 3 Low). Their artifact still shows the old 26 —
`deploy 429: frame_daily_push_cap_reached`, affecting at least two sectors.

### The ghost finding turned over: the UI funnels users into the leaking path

Sector A tried to build the one missing cell — a guest leaving *cleanly from inside a room* — and
could not. **The reason is the finding's most damaging fact: there is no way to leave a call from
inside a Side Room.** All 23 controls enumerated; no `Leave call`. The same participant in the main
call has it.

> The leaking path is the one the UI leaves open. Someone in a room who wants to go looks for "leave
> the call", does not find it, and closes the tab — which is exactly the abrupt teardown that leaks
> the seat.

Before this it was a bug about abrupt disconnection, which invites "crashes are crashes". Now it is
a bug about the interface steering people into the one exit that leaks. Sector B told, since it
changes the severity argument for their half.

**They also removed a cell after the two-step-leave warning, and the reason is the interesting
part.** The clean-leave guest *did* confirm the dialog — the leave was real — but that guest never
entered a room, so the row was always going to clear. **A valid measurement carrying no
information**, which is harder to catch than a bad one because nothing about it looks wrong.

    guest,  NO room, abrupt    clears <= 9 s
    guest,  IN room, abrupt    never clears — three cases, oldest >= 3 h
    member, no room, abrupt    clears <= 20 s   (control)

Two cells differing in one variable plus a control, which is stronger than four cells where one
varies nothing.

**Both halves in one ticket, their call and it is right:** the missing exit alone is a two-step exit
rather than a defect, and its weight comes entirely from the leak it feeds. Split, one gets closed
as working-as-designed and the other loses its best paragraph.

### Sector C's selector and endpoint sweep filed

`SELECTORS.md` gained three sections. Icon-only controls text locators miss (`Save changes`, `Send`
— not "Send message" — and the `Send as file`/`Send as photo` toggle whose label flips), with their
note that `Save changes` failing silently made "offline edits are dropped" and "edits do not apply"
both look true **online and offline alike** — when a control is equally broken in both conditions,
suspect the measurement.

More non-`[role="dialog"]` containers: the pinned panel is an `aside`; the `Reply here` quote lives
outside the contenteditable so the composer reads empty; the channel-details container also holds
its own header trigger so `contains(activeElement)` is true and a real focus bug reads as fixed; the
emoji picker is empty at 1.8 s and full at 2.8 s; `Escape` on the mention suggestion blurs the
composer so the next `Enter` sends nothing.

Endpoints that mislead rather than 404 — the worst being `POST /messaging/messages
{parent_message_id}` returning **200 with the field silently ignored**, so 140 "thread replies"
became 140 ordinary messages with `reply_count` 0, indistinguishable from a broken threads feature.
The real field is `thread_parent_id`. Same family as the pagination-cursor names already documented.

**CLAUDE.md** — extended the restore-state rule with their case: the leftover can be **disguised by
the very defect you were verifying.** They muted a channel while re-checking a mute finding, lost
three runs to "thread reply notifications never arrive", and the mute button read "Mute
notifications" throughout — which was the defect they had just confirmed.

### A correct measurement, a wrong conclusion, and a failure mode nothing else here catches

Sector E's second published finding to fall tonight, and it failed differently from the first.

Finding 5 said the `:@ <person>` search filter does nothing. **It is a place filter** — it scopes
the search to the DM with that person, parallel to `:in #channel`. Found by accident: combining two
typed filters produced a request with **two** `channel_ids`, only one of which had been typed;
resolving the other returned `{"name":"<the person>","type":"dm"}`.

    <word>                        chip none          channel_ids none      3 rows
    :@ <one word> <word>          chip @<Full Name>  channel_ids=<DM id>   0 rows   APPLIED
    :@ <no-DM person> <word>      chip @<Full Name>  channel_ids none      3 rows   not applied
    :@ <First Second> <word>      chip @<DIFFERENT PERSON>                          4 rows

**Their measurement was correct and their conclusion was wrong.** Results identical to unfiltered —
true at the time, because no DM with that person existed. Their own notification testing created it
later. **A filter that scopes to a DM and a filter that does nothing are indistinguishable until a
DM exists**, and three verification passes re-ran it and confirmed it every time *because the state
never changed back*. Reproducibility is usually evidence; here it was the trap.

**Nothing written tonight would have caught it.** Their finding 9 was a wrong *cause* with correct
behaviour — caught by reading the code path. This is a wrong *behaviour claim* from a correct
measurement in an unrepresentative state. Neither "read the adapter" nor "reproduce twice" touches
it.

**Added to CLAUDE.md as its own rule**, not folded into the existing positive-control line, because
it is a different kind of requirement — that one is evidential (removes the reviewer's objection),
this one is about correctness (without it the finding may simply be wrong):

> A finding of the form "X does nothing" needs a state where X demonstrably does something — without
> one you cannot separate an inert feature from one whose precondition you never met.

With their diagnostic as the operative question: **can this measurement distinguish the hypothesis
from its opposite — what would a working version have produced, and is that different from what I
saw?**

**Fourteen of their fifteen findings carry a positive control; the one that did not is the one that
was wrong.** A clean natural experiment across a single report.

The two surviving defects are sharper than the original: a two-word display name, copied exactly as
Directories prints it, resolves to a **different real member** and shows a chip with their name; and
with no DM, nothing is applied while the chip still claims it is. Their fifteenth finding is the
same disease on `:in`, including for a channel that does not exist.

### Count-based verification has a blind spot, and two of us hit it tonight

**Sector E overwrote a published High and did not notice for over an hour.** Their rewrite selected
its target with `[a for a in articles if 'Типизированный фильтр' in a][0]`. That phrase also appears
in **finding 1's** body, `[0]` took document order, and the rewrite replaced a High
(*"Open full search сужает поиск…"*) with a duplicate of another finding.

**Every structural check passed the entire time** — 15 articles, 15 table rows, 15 of each required
section, severities summing, zero leaks, all citations resolving, HTML balanced.

> They are all **counts**, and a substitution preserves quantity while destroying identity.

That is a blind spot in a whole class of verification, unnoticed because counts are what is easy to
check. Caught by accident, listing titles for an unrelated reason.

**The same thing happened to me three hours earlier**, in the file-level form: I truncated
`DECISIONS-PENDING.md` from 1050 lines to 30 with an idiom that opened the file for writing before
reading it, and caught it because a heading grep returned `## 16` at line 2. Both silent, both found
by accident. The CLAUDE.md rule names both forms.

**Two rules added:**

- **After any article-level edit to a report, list the titles and read them before running counts.**
  `scripts/verify_report.py <path>` — theirs, now in the repo — prints the `<h2>`s in order, flags
  duplicates and duplicate 30-character prefixes, *then* checks counts, sections, leaks and HTML
  balance, exiting non-zero on failure. Smoke-tested against their own report; recovery confirmed,
  `Open full search` back at position 1.
- **`[x for x in items if 'substring' in x][0]` is not a selector.** It picked the wrong article
  twice in one session. Match on the `<h2>` and assert exactly one match.

**Worth noting for item 15:** this is the first check tonight that lives **in the path of work
rather than in prose** — a script with a path argument, not lane- or sector-specific, that a session
runs to get the answer. That is precisely the shape sector D argued for hours ago and nobody had
built until now.

Their recovery was not a reconstruction from memory: the finding had been re-verified at 01:35 with
a unique token, so every line of the rebuilt measurement block was measured tonight and is in their
log.

### Counts are blind to a family, not a case — and my own rules fail the standard

**Ordering, not just substitution.** Pushing the identity check further, sector E compared each
summary-table row against the article at the *same position*: the table was correctly
severity-ordered (High, High, Medium×9, Low×4) while the articles were not, because two insertions
had pulled new findings to positions 2 and 3. **Ten of fifteen positions disagreed and every count
still matched** — inserting an article at the top and its row in the middle preserves both totals.

Two defects of the same family live in one report simultaneously, neither visible to seven passing
checks. The CLAUDE.md rule was widened rather than duplicated, and carries their framing of the
twin verbatim:

> Verification that counts cannot see a substitution; verification that a file exists cannot see it
> emptied. Both caught by reading something rather than counting it, and both by accident.

**They then gave the checker a negative control** — reconstructed the exact bug that had destroyed
one of their findings, ran it, and watched three independent checks trip. Their principle, now a
CLAUDE.md rule above the guard guidance:

> **A guard nobody has watched fail is a guard nobody has tested.**

**Turned on my own night, honestly: I added roughly twenty rules to CLAUDE.md tonight and tested
almost none against the failure it exists for.** Each is derived from a real failure a sector
measured — better than invention — but *derived from* and *verified to catch* are different claims,
and only the first holds. Written into item 14 as the status of the diff: **evidence-derived, not
failure-tested.** The exceptions are `verify_report.py` and the citation path check.

Their run order is titles → row-vs-article per position → counts → sections → severities → prose
budget → leaks → citation paths → HTML balance. Steps 1, 1b and 2b exist because of specific
failures this session produced — which is why they are first. A checker built from imagined failures
would have put counts first, because counts are what feels rigorous.

### I edited shared helpers mid-run three times without announcing it

Sector C noticed `snip/lib.mjs` and `snip/api.mjs` carrying today's mtimes — **19:14 and 18:38**,
inside the parallel-run window — and raised it as a stand-hygiene observation. **The edits were
mine.**

**What the diff proves.** `lib.mjs` is tracked:

    git diff --stat scripts/callrig/snip/lib.mjs   →   238 insertions(+), 0 deletions

Not one existing line changed, so no existing export's behaviour moved and no sector's measurement
is invalidated. `api.mjs` is untracked and cannot be diffed; by inspection it gained `keys` and
`find` modes with the default path untouched — **weaker evidence, and stated as weaker** in every
message rather than claimed as parity.

**The process failure stands regardless of the clean diff.** CLAUDE.md says announce a behaviour
change *before* it lands so a session can finish what it is holding, and says explicitly that
"additive" is a promise about the API and not about behaviour. Three edits, no announcement. That
they turned out clean is the additive discipline plus luck, not a process working.

**All five sectors told**, each with the diff so nobody takes my word for it, and each with the
specific exposure for their own work — for sector D, any finding resting on an *absence in a
response*, since `api.mjs` is where the absence-safe modes landed.

### Sector E's correction to how the tooling case is stated

I had credited `verify_report.py` as "a check that arrived from a sector rather than from me". Their
correction, which is a stronger argument:

> It exists because that sector produced the worst mistake of the night. **The check that lives in
> the path of work got built the moment prose demonstrably failed to prevent the damage** — not
> because someone reasoned that tooling beats prose.

Restated that way in item 15. "A sector built a tool" is an outcome; "a tool got built the moment a
documented discipline failed to stop real damage" is evidence.

**And their reframing of the item-14 review question**, now in the item:

> Not "is this rule true?" but **"what would this rule have made me do differently at the moment I
> went wrong?"**

With their honest answer for prose rules — *nothing, unless I happened to re-read it* — which is the
`<aside>` case, where the fact was in their own log.

### The helper-edit audit: four sectors checked, all clean, and the method improved twice

**Sector C found the flaw in how I framed it.** I asked sectors whether they had *imported* the
helpers — the wrong question. `drive.mjs:27-28` pulls `HOOK` from `lib.mjs` and injects it with
`addInitScript` before every snippet, so shared code is on everyone's path regardless of their own
imports. A session checking only its own imports reaches the wrong conclusion.

**Then the hunk header settled it more strongly than anyone had it:**

    old file:  HOOK line 1   RTC_STATS line 16   UI_STATE line 32
    the diff:  @@ -43,0 +44,238 @@ export const UI_STATE = `() => {

**`-43,0` consumes zero old lines** — a pure insertion after the end of `UI_STATE`. So all three
pre-existing exports are byte-identical, not just `HOOK`. Sector C's warning that their result might
not transfer to the calls sectors was well-founded and is resolved by this.

**A useful thing that misled them, worth keeping:** git's hunk context line names the nearest
*preceding* declaration, not the scope the change landed in. `@@ … export const UI_STATE` reads as
"this changed UI_STATE" and means "the declaration above the insertion point is UI_STATE". Their
export-range check remains the right method whenever lines *are* consumed.

**Results:** sector C clean (HOOK on path via drive.mjs, untouched); sector E 0 of 554 importing;
sector D 0 of 450+ importing `api.mjs`, 17 importing `lib.mjs` for HOOK-adjacent plumbing, and all
18 published findings re-verified tonight with helper-free snippets **checked by name rather than as
a class**.

**Two observations queued rather than closed.** Sector E: *"I was isolated by luck, not by design"* —
they wrote their own fragments on day one because they wanted a hit-testing `vis()`, not through
foresight; a session that had sensibly used the shared set would hold measurements straddling an
unannounced change with the mtime as the only signal. And: **untracked shared files cannot be
audited after the fact** — `lib.mjs` tracked settled it in one command, `api.mjs` untracked leaves
the question with no answer but my own inspection of a file I edited.

### Two environment facts into CLAUDE.md, from sector D

> `seed.sh` repairs `company_members` and `workspace_members`, so a kick is **reversible**. It does
> **not** touch `avatar_url` on companies or workspaces — absent from its upserts, so a test avatar
> is permanent.

The avatar half is the more useful: "the seeder repairs drift" is the standing assumption in that
section, and a column it silently does not cover is what a later session discovers by leaving a test
avatar and wondering why re-seeding did nothing. Knowing kick is reversible is also what makes that
surface testable at all — before tonight it looked like a one-way door on a fixture account.

**HANDOFF** gained their live-removal baseline under "checked and clean": `auth/me` stays 200 after
a workspace kick, the tab redirects to a personal workspace rather than a broken screen or the login
form, and a company kick returns `{"companies":[]}` with a personal workspace created on demand.

### The helper-edit thread produced three verification methods and one rule better than all of them

**The rule (sector E), now first in CLAUDE.md because it is the prior question:**

> An isolation claim has to trace the **execution path**, not the import graph.

"Zero of my 554 snippets import that file" answers the wrong question — `drive.mjs` imports `HOOK`
and injects it with `addInitScript` before every snippet, so shared code is on every run's path
regardless of imports. Injected init scripts, wrappers and anything a runner pulls in on your behalf
are invisible to import-graph reasoning. True of any harness, not just this one.

**Three methods converged on the same answer**, which is worth more than any one:

    hunk header      @@ -43,0 +44,238 @@   zero old lines consumed → pure insertion
    prefix test      new.startswith(old.rstrip('\n')) → True
    per-export bytes HOOK 849→849, RTC_STATS 909→909, UI_STATE 986→986

The third is the strongest — it measures the thing the claim is about rather than a property that
implies it.

**A false alarm in the safe direction, caught by its author before it spread.** Sector C's first
method sliced from each `export const` to the next; `UI_STATE` was last in HEAD so its slice ran to
EOF and now stops at the appended export, reporting CHANGED when nothing did. **Neighbour-delimited
slicing breaks precisely when a neighbour is appended.**

The direction is what makes it dangerous: "your UI_STATE measurements are suspect" reads as
diligence. Four sectors would have re-run clean work, nobody would have questioned it, and the cost
would have landed as a lost day rather than a wrong finding. **A conservative false alarm has no
natural check on it, because caution is what everyone expects.** Written into the rule that way
rather than as "slicing is fragile".

**And the trap underneath all three:** a hunk header names the nearest declaration *above* the
insertion point, not the scope the change landed in. `@@ … export const UI_STATE` reads as "this
changed UI_STATE" and means "UI_STATE is the last thing declared before this". It misled two of
three participants.

**Sector E's own summary, recorded because it is accurate rather than modest:** they got the right
answer twice by accident — once by having written their own fragments for unrelated reasons, once by
the edit happening to be a pure insertion. Neither was a check. Had a line inside `HOOK` been
replaced, their logged "no exposure" would have been confidently wrong with nothing to prompt a
second look, and a wrong claim in a handover artifact outlives the session that made it.

Twice tonight that sector's verification was weaker than the confidence attached to it, and both
times another sector's reading surfaced it. That is what the cross-checking is for, and it is the
only mechanism here that has caught this class at all.

### The principle underneath every truncation failure of the run

Sector D's formulation, now in CLAUDE.md as a principle rather than a seventh instance:

> **An enumeration over a bounded set is safe; a search over an unbounded one is only as good as
> the bound you did not state.**

Requests a screen makes, controls in a container, entries in a catalogue — bounded, and a claim
about them cannot be broken by where you stopped reading. Page text, response bodies, DOM matches —
unbounded unless you say where you cut.

The family has been hit at least six times tonight and each was written up separately:
`buttons[-6:]`, `sorted(set(nums))[:18]` **inside the script auditing for that mistake**,
`x['shown'][:6]`, a 400-character `api.mjs` slice, a truncated `innerText`, and a 420-character
slice that reported a string missing which is present verbatim further down. Their line says why
they are one thing, and it retroactively justifies the enumerate-don't-read-text rule, which until
now was an empirical observation with a pile of examples behind it.

### A failure direction nothing else here guards against

Also theirs, and added as its own rule:

> **Re-verify the precondition, not only the conclusion — otherwise your own earlier testing will
> report a false collapse.**

Their #15 says a screen offers no action when exactly one session exists. Re-run late it showed two
enabled buttons, which read as the finding failing — because an earlier session-expiry test had left
the account on two sessions. **At which point the buttons appearing is the finding's own control,
not a contradiction.** Reduced to one, zero controls, finding intact.

Every other rule written tonight guards against publishing something wrong. This one guards against
**withdrawing something correct**, which is timely given how much withdrawing has happened across
all five sectors today.

### Fixture note

Lane D carries a permanent company avatar. `DELETE` returns 405 and the contract is `POST`-only for
both company and workspace, so it is permanent by product design rather than by seeder omission
alone — `avatar_url` is also absent from the seeder's upserts. Only a direct `org_db` write clears
it; that sector correctly declined to make one, on the grounds that it is not the sanctioned tool
and the state is harmless once documented.

### The fourth ghost arrived by accident, which is the finding's best fact

Sector A's soak now shows **four ghost rows — 18:04, 18:08, 19:17, 20:29** — and the fourth came
from the run that *failed to find `Leave call` inside a room*.

Someone who knew about the bug, was actively looking for the exit, and could not find it, created a
ghost without meaning to. That is not "the trigger is reachable"; it is **"the trigger was hit by
accident by the person best equipped to avoid it"**, which is the sentence that answers a triager
asking how often this really happens. Recorded in HANDOFF as such.

### A clean negative, and the observer was the cause

The heap that had appeared to grow through a long call was tracking the polling session's own
`getStats()` calls. Moving the polling to a different client left the original tab completely idle:
**1 MB in two and a quarter hours. No leak in a running call.**

Recorded as an instrument lesson as well as a result — the same family as the truncation cases one
layer out: not "my filter hid the answer" but **"my probe created the signal"**. It also closes an
alternative explanation nobody had raised: a reviewer could have argued that long calls leak memory
and the ghost rows are a symptom of general degradation. They are not.

### Four sectors, four methods, one answer on the helper edit

Sector A is the fourth and last to verify independently, with per-export byte comparison against
HEAD — `HOOK` and `RTC_STATS` identical, which is what matters for a sector whose every RTC
measurement stands on `window.__pcs`.

**They are also the second sector to hit the slice-to-next-export artefact independently**, the same
way and caught the same way: the numbers disagreed with a claim, and they checked rather than
assumed. Two sessions, same naive method, same false positive, both in the conservative direction.
That independent duplication is what earns it a CLAUDE.md line rather than a footnote.

**Their practice statement is better than the rule I had written**, and I told them so: when a
shared file changed during a run, do not check whether the change was *described* as additive —
check the specific exports your conclusions stand on, against git. "Described as additive" is
precisely what I had offered them.

### The best synthesis of the night's instrument failures — and the audit closes at five for five

Sector B, the fifth and last sector to verify the helper edit, produced the line that generalises
every instrument failure of the run:

> **A verification result that agrees with your prior is the one you check least — and a broken
> instrument produces agreement as readily as disagreement.**

Three cases with that shape in one night: a text locator clicking the wrong node and returning a
result matching the ticket being verified; a `grep` whose `\|` was a literal string under BSD,
producing a count that appeared to refute a confirmed finding; and a truncated print agreeing with
"no error was shown". None announces itself, and all three survive "reproduce it twice".

**Their defence is the operative half**, kept as the instruction: the instrument must be checkable
independently of the claim — a grep you can re-run with `-F`, an enumeration you can print in full,
a scan taken before the action as well as after. *If the only way to test the instrument is to trust
the result, you have no instrument.*

Theirs is the harder variant of the three: sector C's locator agreed with a prior they were
*testing*; theirs agreed **against** a finding they had already verified, and was caught only
because they trusted the earlier measurement more. Had the grep been the first thing they ran, it
would have stood.

**Second rule from them, and the only answer available when a file is untracked:**

> When a shared dependency changed mid-run and parity cannot be proven, check whether the change
> split your series. Measurements taken entirely on one side of the edit are comparable to each
> other even if the behaviour did move.

All three of their media measurements fell after 19:14. That is a real answer to a question
`api.mjs` being untracked otherwise leaves open, and nobody else offered it.

**The audit is closed: five sectors, five distinct methods, one answer.** Hunk header; prefix test;
per-export byte comparison (twice, independently); numstat plus counting `-` lines plus locating
`HOOK` in the diff. **Two of the five produced a false positive on the way and caught it
themselves**, both in the conservative direction, both by noticing their numbers disagreed with a
claim and checking rather than assuming.

### A third variety of wrong finding: the measurement is right and the state is specified

Sector D's line, now in CLAUDE.md above the acceptance-criteria rule it explains:

> **A satisfied requirement looks identical to a break — the measurement being right is not the
> same as the finding being right.**

Two instances from that sector in one night, which is what makes it a pattern: they nearly filed
"unknown audit actions render raw" against `ALK-3307`, which specifies exactly that; and "the
dead-link page has zero controls" against `ALK-1727`, whose criteria read *fail-fast without the
form*. Both measurements correct, both describing a state the product was built to produce.

**It is distinct from the night's other two wrong-finding shapes**, and the difference is where the
defence lies:

    wrong cause, correct behaviour            caught by reading the code path
    correct measurement, wrong conclusion     unrepresentative state; caught by a positive control
    correct measurement, SPECIFIED state      no natural defence — everything about it is sound

**The rule deliberately does not stop at "check whether it is specified".** Both times, the ticket
owning the state left something uncovered: ALK-3307 specifies raw rendering for *unknown* actions
and is silent on the known ones being unmapped; ALK-1727 specifies no *form* and is silent on no
route out. A rule ending at "it's specified" would have killed both findings rather than narrowing
them.

### Re-measurement precondition filed with the routed finding

Their sibling comparisons were taken in a fresh context with no session, and a signed-in context
changes `/invite?token=<bad>` materially. That is now stated in HANDOFF as a **precondition** rather
than a note — without it, someone re-running the comparison gets different numbers, concludes the
contrast does not hold, and kills a live finding on a setup difference.

Same shape as their own Sessions near-withdrawal an hour earlier: a re-verification that does not
reproduce the setup reports a false collapse. They have now supplied that lesson from both ends —
once as their own near-miss, once as a guard for someone else's re-measurement.

### The acceptance-criteria rule proved it is a discriminator, not a rationalisation

Sector B's observation, now folded into the rule itself:

> The same test let one sector **keep** findings that two nearby tickets appeared to own
> (ALK-2248, ALK-1835), and **stopped** a third from being framed as a defect when the ticket's
> criteria specified exactly the state measured (ALK-1727). Same rule, opposite outcomes.

All three from the same sector, which is the cleanest demonstration available. A test that only ever
preserves findings is an argument dressed as a method.

### The routed finding was already published — and independently reproduced

Sector B has the `/join/<dead token>` defect published as a Medium. Sector D reproduced it
independently while enumerating routes from source for an unrelated coverage proof. **Two different
routes to the same defect is a useful answer to "how likely is a user to hit this"**, and worth a
line if it is ever filed.

Sector D's sibling-route control was the half sector B lacked; sector B re-measured it themselves
rather than accepting the numbers, and it is now in the published finding's block.

**That re-measurement surfaced an unresolved discrepancy**, flagged in HANDOFF rather than left
looking settled:

    route                            sector D   sector B
    /invite?token=<dead>             5          3
    /workspace/invite/accept?<dead>  1          3

Both fresh context, both wide enumeration, and the two gaps run in **opposite directions** — the
first is consistent with inputs being counted or not, the second is not, since sector B found more
than sector D did. Neither finding is at risk (the pattern holds under either set), but a developer
re-measuring could land on a third number and doubt the block. Sector D asked to look if time
allows before 09:00; sector B's numbers are the published ones either way.

### The enumeration discrepancy resolved — and it removed two rows from a control

**`/invite?token=<dead>`, 5 vs 3: a definition difference on the same page.** 3 buttons + 2 inputs;
one enumeration counted every interactive node, the other only nodes with visible text. Both
correct. Worth knowing that **"wide enumeration" turns out not to be one thing** — two sectors
comparing notes will hit this every time.

**`/workspace/invite/accept`, 1 vs 3: a different page, because the URL differs.**

    /workspace/invite/accept                   stays put, dead-link page, 1 control
    /workspace/invite/accept?token=<dead>      REDIRECTS to /login?next=… — sign-in form
    /workspace/invite/accept?token=<dead>&x=1  no redirect, dead-link page, 1 control

The source specifies it: the redirect fires only when there is **exactly one** search param and it
looks like an invite token. **The `&x=1` variant is what makes it airtight** — two rows would have
shown a redirect and left "why" open to argument; the third isolates the *param count* as the
trigger, and it matches the source. A behavioural measurement and a citation agreeing on a mechanism
neither would have established alone.

**The consequence removed two rows from sector B's sibling control**: a token-bearing URL on that
route measures `/login`, not dead-token handling, and `/invite?token=<dead>` redirects to `/login`
too. Left in, it invites "these routes are not comparable" — the objection that takes a block down
entirely rather than costing one row.

**The corrected set is tighter, not weaker:**

    /magic-link/verify?token=<dead>        3
    /workspace/invite/accept  (no token)   1
    /join/<dead>                           0

Two comparators instead of three, both genuinely the same class of screen. Among pages that actually
render a dead link, only `/join` offers no route out. **A control with three members where two are
the wrong kind of page is worth less than one with two of the right kind.**

Sent to sector B as time-sensitive; their report is final and the block would otherwise ship with
the rows a developer would pull on. HANDOFF carries the resolution and the corrected set.

### The unifying statement of a class I had recorded three times separately

Sector B, closing out their run:

> **A measurement can be correct while the description of what was measured is wrong — and no check
> on the measurement will catch it.**

Their three instances, all in one night, which I had filed as three unrelated entries:

    truncated enumeration      the capture was right, the print was not
    wrong set of surfaces      every enumeration clean, the LIST OF PLACES truncated
    mislabelled comparison row labelled /workspace/invite/accept?token=<dead>,
                               actually measuring /login, because that URL redirects

**All three pass every check you can run on the measurement itself, because the measurement is not
the broken part.** The rule now says to state what you believe you loaded and confirm it separately
— final URL, the surface's own identity, the bound of the set — before the number means anything.

That is a layer none of tonight's other rules addressed: they guard the measurement, and this one
guards the label on it.

**Block corrected** to pages of the same class only — magic-link 3, invite-accept without a token 1,
join 0 — with an explicit line stating that the two redirecting routes are excluded *because* they
land on `/login`. Stating the exclusion and its reason beats silently dropping the rows: a reader
who wonders about `/invite` gets an answer instead of assuming it was overlooked.

**Their reason for fixing it is the one worth keeping:** "those routes are not comparable" takes the
whole block down, not the row it applies to — a strictly worse outcome than having two comparators.

Sector B final at 12 local / 11 published. Sector D's `&x=1` case is what turned "that row looks
odd" into a mechanism anyone can re-derive, with the source condition matching it — the difference
between telling someone their row is wrong and showing them why.

### Publishing unblocked, and a fixture fact that could have invalidated findings

**The cap was a daily quota.** Sector B retried at 06:43 and went through first attempt; sector C
and sector E followed on their first attempts with no 429. Three confirmed publishes. Sector C
updated in place, so the stale artifact showing a **withdrawn High** is gone. Sector D is the last
with a gap, 17 published against 19 local, and has the 09:00 deadline.

    sector B   12 published   2 High / 7 Medium / 3 Low
    sector C   30 published   3 High / 24 Medium / 3 Low   46 tickets triaged
    sector E   22 published   2 High / 14 Medium / 6 Low

### Seeded fixtures are invisible to global search — verified, and now in CLAUDE.md

`seed_qa_fixtures.py` writes straight to Postgres. The OpenSearch indices are Kafka-fed from the
services (`search-service/internal/infrastructure/kafka/consumer.go`, `channel_upserted` →
`IndexChannel`) and there is **no CDC on that path** — confirmed: the seeder contains **zero**
kafka/opensearch/producer references.

**So a seeded channel or account is never indexed, and searching for one returns nothing.** Messages
and files are fine because they went through the app. Any "global search does not find X" finding
against seeded data is measuring the fixture pipeline.

**The tell:** querying `qa-arch` returns a channel that does *not* contain that string (app-created,
indexed) and misses the one that contains it exactly (seeded).

**This puts ALK-3538 in doubt** — its premise «обе вкладки всегда показывают ноль» is false on this
build — and the same symptom has been **filed and closed three times before** (ALK-421, ALK-1401,
ALK-1592). Queued as item 19 with the decisions: withdraw or amend the ticket, and whether the
seeder should emit the Kafka events rather than the limitation staying a documented caveat.

Sector E left a permanent control in lane E — channel `e-search-control`, created through the UI.
**The People bucket has no control**, because every fixture account is seeded; settling it needs a
user registered through the app.

### A retraction that arrived minutes after the affected sector published

Sector C had told sector E the sidebar channel list never reorders by activity. **It does** — they
had been sending from the same browser they were watching, and a channel does not raise itself for
your own message. Incoming activity raises both channels and DMs in 13–15 s.

They went back to correct it after their own sector was closed and published, for a thing affecting
only someone else's report. Relayed to sector E as urgent, since they had published 22 findings
minutes earlier.

**The trap generalises:** you cannot observe a self-suppressing UI's response to your own action from
the acting client. Same family as the visibility-state problem — the observer's identity changes
what renders. Correcting it also made ALK-2650 testable, which reproduces: the channel stays raised
after the last message is deleted, until reload.

### A false-positive mode in `verify_report.py`

It looks for the `[FE-WEB][…]` tag **inside the summary-table cell**. Sector C's table carries only
the finding title, with tags in the `h2` — so it reported `table rows=0 != findings=30` plus thirty
ROW/ARTICLE TAG MISMATCHes on a valid file. A convention difference, not a defect.

Raised with its author. The point put to them: **a tool that cries wolf on a good file is the tool
that stops being run** — which matters more than usual here, since it is the only artifact from
tonight that lives in the path of work.

Its **bare citation paths** check was a genuine catch on the same file — two bare filenames expanded
to full paths and re-verified at the deployed sha.

### Unfiled and flagged: an invitee cannot RSVP at all

`POST /calendar/meetings/<id>/respond` → **`404 REALTIME_SCHEDULED_ATTENDEE_NOT_FOUND`** while the
meetings list reports that same user as `my_status: "pending"`, with the attendee row present in
`realtime_db.scheduled_event_attendees`. Not a fixture gap. Anyone testing calendar invitations will
read it as a client bug. Nothing filed — queued as item 19.

### A rule I did not write, and why that is worth recording

Sector C drafted a method line, declined to add it to CLAUDE.md, and asked explicitly that I not add
it on their behalf. **I have not.** It is queued as item 20, verbatim and credited, for Mahmud to
accept or reject.

Their reasoning is the correct reading of the file's own maintenance section, and it is a governance
argument rather than a limits one:

> A CLAUDE.md change needs the user's explicit approval — and a peer session's agreement is not that
> approval, however obviously right the line is. **A line that five of us silently agreed on has no
> owner and no record of who decided it.**

They also noted the line is a measurement method, not a constraint on what may be tested — so the
rule they are following is deliberately stricter than the risk requires.

**The honest comparison, now in item 14 as well.** That sector has twice declined to write a method
line — this one and the network-mechanism rule earlier tonight. **I have added roughly twenty-five
on a standing authorisation.** I took their earlier one, reasoning that declining it specifically
would be arbitrary when fifteen were already in. That was defensible and I no longer think it was
right: *inside my remit* and *properly decided* are different things, and a file every session reads
deserves the second.

The only useful action available at this hour is to make the difference visible rather than argue
it, which item 14 now does.

### Sector A republished; all five current

They never hit the cap — publishing between 19:00 and 23:20 put them entirely on the other side of
it — and republished at 06:53 to confirm rather than assume the live version matches the local file.

**Two deliberate omissions from their report, both correct.** The seat-leak mechanism is not in it,
because the visible symptom is sector B's surface and publishing separately would have produced a
second ticket for one fix; it is in their log and README row so widening the ticket later costs a
read. The no-leak negative is not in it because a bugs-only report is not the place for "we looked
and found nothing"; it is in HANDOFF.

**Their swap control replaced my earlier note**, because it rules the alternative out rather than
failing to observe it:

    alice, untouched          240 -> 242 MB   across 4 h 19 m
    dave, 3-minute polling    110 -> 152 MB   same window

Swapping which tab was polled swapped which heap grew. An idle reading alone is consistent with a
leak that needs activity to trigger; the swap is not.

**Permanence is settled**: four ghost rows, oldest `18:04:42`, still counted at 06:52 — **twelve
hours and forty-eight minutes**. The 08:00 reading will confirm rather than decide it. A seat lost
this way is lost for the life of the call.

### I carried a stale number through two messages and asserted it twice

Sector D told me "published 17, local 18" — accurate when they said it. **I carried it forward
through two subsequent messages while they published five more times** (05:02, 05:19, 05:26, 06:01,
06:05, all 19 findings), and twice called them "the last sector with a gap" on that basis.

A measurement that was correct when taken, used as though it were current — sector E's finding-5
problem, one layer out. The cheap check was available the entire time and I did not run it before
asserting the artifact's state.

**Their tip is sharper than the one I gave them.** Their backend clone was on `dev`, and the
`privacy.go` lines they first grepped **did not exist on `origin/main`**; they re-pinned every
backend citation before publishing. That is upstream of any report checker — a citation that
resolves in your working tree passes every mechanical check anyone runs. The checker validates the
shape of the path, not the tree it resolves in.

### The narrower test, from the sector that declined to write a rule

> The test is not whether a line is a constraint, it is **whether the file will show who decided
> it.**

They also declined the credit: both lines were drafted after their sector was closed, with hours
left and nothing riding on them. *"Declining costs nothing when there is time to route it properly.
Fifteen already in and a deadline in front of you is a different decision."* That is the honest
version and item 20 now carries it.

### Current state, measured at 06:55

    A  calls-inside      9   (23:20)
    B  calls-around     12   (03:55)
    C  chat             30   (06:50)
    D  org / identity   20   (06:53)
    E  workspace        22   (06:44)
                        --
                        93

All five current at their published URLs. Sector D's twentieth: **Privacy & security →
"Messaging & invitations" opens only when an admin grants both company-scope `privacy.manage` and
`role.get`**, neither alone — five-state matrix each from a clean load, with revoke closing it
again, and the member's own privacy payload returning 200 throughout while only the company-roles
read 403s. Cited on `origin/main`; `catalog.go:55`'s own comment calls the right personal
(«свои ограничения») while it is grantable only at company level.

**They also closed the "granted permission opens nothing" class**: all 20 grantable permissions
mapped against the gate at the deployed commit, three workspace ones granted individually and
measured, all three opening real controls. The never-gated set is exactly `role.manage`/`role.update`
/`role.delete` plus company-scope `audit.view` — both already published. A negative result over a
complete enumeration, so nobody needs to re-run it.

### Sector D withdrew their twentieth — and my argument was part of what made it hard

**It was not a new finding.** It was their own "Verified working" note from line 561 of their own
log, rediscovered from the other direction — identical matrix, **opposite conclusion**, plus two
halves this hour's pass never re-ran (the restriction working end to end, and `privacy.bypass`
letting a granted account through). The earlier pass was strictly more complete.

**Their reasoning, and it is the rule worth keeping:**

> **A matrix proves which conditions are required, not that requiring them is wrong.**

Five states measured cleanly with the reverse direction establish that the section needs both
`privacy.manage` and `role.get` — and say nothing about whether needing them is a defect. A
restriction that is role-based by definition needs role names to render; a company-scope right over
whether staff may wall themselves off from colleagues is a policy. **The rigour of the enumeration
is not evidence about the proposition.**

**I reinforced it rather than catching it.** I praised the five-state matrix as what made it strong,
and singled out the `catalog.go` comment as the ALK-3000 shape — the team's own words describing
what the code does not do. It is not: *«свои ограничения»* describes *whose* restrictions they are,
not who may grant them, and the code matches. They withdrew it against my argument, not with it.

### Four instances of one failure tonight, and none caught by a rule

    sector E   rediscovered their own search finding hours after logging it
    sector E   re-made a documented `<aside>` mistake four hours after recording it
    sector D   published a finding contradicting their own earlier verified-working note
    me         carried a sector's published count forward through two messages while it changed

**All four: correct earlier work, not consulted.** Three caught by accident, one by a peer. Not one
caught by a rule, a checker or a re-run. Queued as item 21 with sector D's one-call remedy — grep
your own log for the screen's name before publishing a finding about it.

That is the strongest evidence in the queue for item 15's retrieval-timing problem.

### Item 20 narrowed at sector C's request

With sector E's correction, the behaviour underneath their method rule is two-sided — a channel does
not raise itself for your own *message*, but a file share **does**, by design (`af01859a5`, verified
as an ancestor of the deployed sha). Their note: quote both halves or neither, since the method
claim stands alone.

**The item now quotes neither**, with the two-sided behaviour explained beneath as the reason.

Sector C narrowed it in all three places it appeared in their log, including the handover block a
later session reads first, verified the merge-base themselves, and did **not** reproduce the
file-share measurement because Files → Share is another sector's surface — crediting it as borrowed.
*"I would rather the record show a borrowed measurement as borrowed than have it read as mine."*

**Total across five lanes: 92.**

### A limiting diff routed rather than written — and split at the right seam

Sector E drafted a CLAUDE.md change and queued it as item 22 instead of applying it, because **it
tells a future session a technique does not work**.

Their distinction is the careful part and it is sharper than either of sector C's: the file already
says "WebSocket behaviour under `setOffline` is unverified" — an invitation to measure. Their diff
says the method does not work — a closed door. **Those are different lines even though one completes
the other's sentence**, and noticing that while holding a measurement that plainly settles the
question is the harder call.

**I split it at that seam.** The verified-working half went into HANDOFF immediately, because it
constrains nothing: closing the socket from inside the page gives "Reconnecting…" within 1 s, a
replacement socket, and the banner cleared by 2 s. Only the "cannot be used to test connection
status" clause is queued.

**The measurement is the strongest form available**: with the `WebSocket` constructor instrumented
before app load, `setOffline(true)` for 20 s left the socket open (`open 1, closed 0`) while
`navigator.onLine` went false and no banner appeared — and then closing it from inside produced the
banner in 1 s. **The second half is what makes the first a statement about the instrument rather
than about the app**; without it, "no banner appeared" is equally consistent with a broken banner.

Caveat travelling with the item: `page.routeWebSocket` never fired alongside their own
`addInitScript` constructor wrapper — the two appear mutually exclusive, pick one per run. They
stopped after three attempts, which is the documented practice.

**Five rules routed to Mahmud rather than written tonight** — item 20 (sector C), two in item 21
(sector D and the pattern), and item 22 (sector E). **Three sectors have now independently applied a
stricter reading of the maintenance rule than I used for the first twenty-five**, which is the
comparison in item 14.

### The checker caught six real defects in another sector's report on its first run there

Sector C ran sector E's fixed `verify_report.py` against their real file. It handled the untagged
layout as designed — skipping the inapplicable checks with stated reasons — and **before passing,
found six defects their own verification could not**: summary-table row text drifted from the
article title. Lost guillemets, «ответы недостижимы» against «ответы становятся недостижимы», two
rows simply shorter than their titles. All six now word-for-word, republished.

**Their diagnosis of why their own check missed it is the general lesson**, and it is queued with
the other drafted rules:

> I compared the first 34 characters — deliberately, to catch rows falling out of order after an
> insertion, which it does catch. **But a prefix comparison is blind to drift past the prefix, which
> is precisely where wording rot accumulates. A check tuned to catch one failure mode quietly
> stopped covering the neighbouring one.**

Their 34-character prefix was a correct check for a real reason. What failed was that nobody
restated its coverage boundary when the neighbouring failure mode appeared.

**That checker is now the only artifact from tonight that has caught defects in work other than its
author's** — after being made layout-agnostic, with its self-test confirming 11/11 steps still catch
their own failure. That is the argument for item 15 in one sentence.

### A second fixture gap of the same shape as the search one

`seed_qa_fixtures.py:139` — `WORKSPACE_MEMBERS = [k for k in UID if k != "qa_outsider"]` — puts
`qa_guest` into workspace membership, so that account carries workspace Member permissions on top of
`is_guest = true` and holds `workspace.<ws>.channel.create`. **Guest restrictions do not reproduce
on it.** Verified at the line; in CLAUDE.md's fixtures section beside the search-indexing gap.

A sector nearly filed a permissions finding against it and checked the seeder first. The finding
would have been well-measured and completely wrong.

**Two gaps of one shape in a morning** — a fixture property producing defect-shaped behaviour with
no defect behind it. Queued as a design question rather than a bug: the fixtures appear built to
make accounts *work* rather than to make their *limits* observable.

### Sector C final

30 findings live, 3 High / 24 Medium / 3 Low, 25 frontend / 5 backend. 46 tickets triaged — 19
reproduce, 27 close candidates, no overlap. Eleven findings re-measured from scratch this morning,
none withdrawn. Four publishes on one URL. Fixtures verified clean, build unchanged the whole run.

Most re-verified report of the five, and the largest triage contribution by a distance.

### I wrote a limiting line into CLAUDE.md and took it back out

Sector E, while routing their own diff to the queue rather than writing it, observed: *"If your
CLAUDE.md edit added the guest fact, that's yours to own."*

They were right. I had written *"Guest restrictions do not reproduce on that account; a permissions
finding against it is measuring the fixture."* That is a **"not testable" line scoped to an
account**, and the file's own rule says treat borderline as limiting.

**I had applied the split-at-the-seam principle to their `setOffline` diff an hour earlier and not
to my own edit twenty minutes later.**

**Corrected.** CLAUDE.md now carries the fixture fact only — `qa.*.guest` holds workspace Member
membership as well as `is_guest = true`, per line 139. The consequence is queued with the other
routed rules.

That is the sixth item now waiting on Mahmud rather than written, and the first of them is mine.

### Sector E's guest sweep — the fourth hit is the useful one

Twenty-two findings swept for guest dependence. Three hits are the string `is_guest` appearing
inside a pasted response, one is the server's error key for an invite link rather than an account.
**The fourth is a Проверка line asking a developer to confirm a guest renders like anyone else in
People** — display, not restriction, so the over-privilege cannot change its outcome.

They kept it, and noted in their log that **as a test on our fixtures it is weaker than it looks**,
since the row it exercises is a member's row — while remaining the right line to run against a real
guest. That distinction would otherwise have been lost either by dropping the line or by keeping it
unqualified.

### Sector E closing state

22 findings published at `384ecdfd-…`, fixtures verified, ten ticket actions left as the user's
call. Remaining before their 09:00 box closes: a long-session stability reading at ~08:25, the
`reports/README.md` row, and the closing summary. Nothing outstanding from my side.

Nothing has been filed or commented in Jira from any sector tonight.

### The mirror: a near-miss false NEGATIVE, and the fact that would have caught it was already filed

Sector C, re-verifying a published Medium in the extra window. Their first run said it **no longer
reproduces** — composer intact, text preserved, nothing lost. They had pressed Escape to clear the
suggestion list; Escape moves focus out of the composer, so the Enter went nowhere. Without Escape
it reproduces exactly.

> **If a check says "does not reproduce" and NOTHING happened at all — no request, no state change,
> no error — suspect the check, not the fix. The signal is the absence of any effect, not the
> absence of the expected effect.**

**It is the inert-control work run backwards.** There, no request meant the product was broken;
here, no request meant the test was broken. What separates them is whether the action was supposed
to produce anything at all, and the only way to tell is to have proved the input landed — the
discipline this group applied to clicks all night and nobody applied to a keypress.

**It is also the only rule from tonight that guards the false-negative direction.** Every other one
— positive controls, citation checks, guard verification, the adversarial pass, the enumeration
rules — guards against publishing something wrong. Theirs guards against *un*-publishing something
right, and their argument for why that matters more is correct: a false positive gets caught at
triage by a developer who cannot reproduce it; **a false negative silently deletes a real finding
and nobody ever looks for it again.**

**And the fact that would have prevented it was already filed — by them.** `SELECTORS.md:90`
carries "`Escape` on the mention suggestion blurs the composer — the next `Enter` sends nothing".
They measured it on mentions earlier tonight, reported it, I filed it in the shared lookup file, and
hours later they hit the identical behaviour on slash commands and read it as a fix.

**Fifth instance of one shape tonight, and the most complete**, because every obvious remedy was
already in place: measured, written down, written down *in the file designed for that lookup*, and
written down **by the person who needed it**. None of it put the fact in front of them while a probe
was being written.

    sector E   rediscovered their own search finding hours after logging it
    sector E   re-made a documented `<aside>` mistake four hours after recording it
    sector D   published a finding contradicting their own earlier verified-working note
    me         carried a published count forward through two messages while it changed
    sector C   hit a trap they had measured, reported, and had filed in SELECTORS.md

Item 15 now says to weigh the decision on this case, because it defeats the answer everyone reaches
for first: **"write it down better" is exhausted here.**

### The false-negative rule fired again within the hour — and became a routine check

Sector C, re-verifying the Dismiss-preview finding. First run: nothing at all — card still there, no
request, no change. Under the old habit that is "does not reproduce" and a live Medium quietly
leaves the report. They applied the rule they had written an hour earlier, instrumented the click,
and found the locator had never matched — searched by text, and the button's name exists only in
`aria-label`. Click proven to land, finding reproduces exactly.

    instance 1   Escape blurred the composer              keypress never landed
    instance 2   text locator missed an icon-only button  click never landed
                 → identical symptom, different causes

**So it is not a caution about false negatives, it is a cheap routine check**: when a
re-verification comes back negative, look first at whether anything happened at all, before looking
at the product. **The symptom is diagnostic without knowing why**, which is what makes it runnable
every time. Two published findings saved in an hour.

### The answer to item 15, and it is upstream of the tooling argument

Sector C on why `SELECTORS.md:90` did not save them — and it is worse than I had it. They did not
merely write that line; they wrote it **after being caught by the same behaviour, specifically so it
would be there next time.** It was there. They did not read it, because they were not looking
anything up — they were writing a probe and reached for Escape to clear a suggestion list.

> **Documentation only helps at the moment you go looking, and nothing about writing a probe makes
> you go looking. Which is why the general symptom rule beats another entry in the lookup file: it
> does not require me to have suspected anything in advance.**

**That reframes the whole question.** I had been building toward "move what is checkable into
tooling" — sector D's argument, sector E's checker as the demonstration. This is upstream of it: the
question is not only *where* knowledge lives but **what triggers it**. A lookup entry fires when you
think to look something up, which is exactly when you already suspect the problem. A symptom rule
fires on something you will observe anyway.

**Both of tonight's saves came from a symptom rule.** The lookup entry for the first existed, in the
right file, written by the person it failed, specifically to prevent that recurrence.

Item 15 now states the shape: **prefer rules keyed to symptoms a session will encounter regardless
of what they suspect, over facts a session must know to go looking for.** `verify_report.py` is the
same shape in tool form — it fires because you run it before publishing, not because you suspected a
substitution.

### I recorded the dangerous half of the rule, and the mirror case arrived to prove it

I wrote sector C's false-negative rule into the queue as *"suspect the check, not the fix"*. **That
is the half-version that would start a session dismissing real inert-control defects** — and both of
that sector's Highs are inert-control findings.

**The mirror case arrived within two hours, from the same sector.** In an archived channel the
message menu still offers Edit; choosing it does nothing — no edit mode, no Save changes, no toast.
**Click instrumented, click landed, nothing happened. Published defect, reproduces.**

    same symptom, three times in two hours
      Escape blurred the composer              input never landed  → broken check
      text locator missed an icon-only button  input never landed  → broken check
      Edit in an archived channel              input LANDED        → real defect

**What separates them is not judgement or suspicion. It is one fact: whether the input was proven to
land.** With proof, absence of effect is product behaviour. Without it, it is your probe.

Corrected to their pair form, with the correction stated rather than the wording quietly swapped,
since the half-version had already reached the queue:

> **Prove the input landed. Only then does absence of effect mean anything — and then it means it in
> both directions.**

### Item 15 restructured: a symptom rule needs its discriminator shipped with it

Their addition, which makes the triggering answer *safe* rather than merely true:

> A symptom with two opposite readings is worse than no rule at all unless the discriminator ships
> with it.

That was the piece I was missing. "Fires on something you will see anyway" as the whole answer would
license symptom rules that fire reliably and mean nothing. **"Nothing happened" is exactly such a
symptom** — three occurrences, two opposite readings, in two hours.

**The shape in item 15 is now three-part:**

    trigger        keyed to a symptom a session encounters anyway, not a topic they must look up
    discriminator  mechanical, and shipped with the rule
    direction      states what it means in BOTH directions, or it gets applied as half

`verify_report.py` has all three, which is why it works rather than merely fires: duplicate titles,
row-versus-article correspondence, counts, bare citation paths — **every check it makes has a
mechanical discriminator**, and none requires a judgement about whether the result means something.

Fourteen re-measured, none withdrawn, two saved, and one real defect confirmed by the same check
that saved them — all from re-measuring already-published work rather than from new ground.

### The one part of item 15 applicable in advance

Sector C, on the middle of the three-part shape:

> Every check that saved me tonight had a mechanical discriminator sitting next to it — a
> capture-phase listener, a request log, an opacity product up the ancestor chain. **The ones that
> cost me time were the ones where I was the discriminator.**

**Everything else in item 15 describes what went wrong afterwards. This is a question you can ask
before relying on a check:** is the thing separating its two readings a mechanism or a person?

It also explains the whole night's instrument failures without anyone needing to recall five
separate near-misses. Every one recorded — the truncated print, the wrong row container, the
`[role=dialog]` probe, my own stale count — was a check where the person was the discriminator.

### A do-not-dedup pair, recorded because a title read would merge them

Saved Messages has **no Unsave** anywhere — not on the row, not under More actions. The only route
is Delete, whose confirmation reads *"Delete permanently? … It cannot be recovered."*

**ALK-3507 covers Unpin in the same space, and that one exists and works end to end.** Two
similar-sounding actions on one surface, one present and one absent. In HANDOFF with an explicit
do-not-dedup note, because triage by title will collapse them and only the measurement separates
them.

### Sector C closed

Fifteen findings re-measured, **none withdrawn**, two saved by the pair rule, one real defect
confirmed by it. 30 live at the same URL, 3 High / 24 Medium / 3 Low, 25 frontend / 5 backend,
artifact sha matching disk, `verify_report.py` clean, 46 tickets triaged with no overlap, fixtures
verified, build unchanged the whole run.

Recording a re-measurement where **nothing needed correcting** is worth noting as practice — fifteen
with nothing withdrawn is a stronger statement than any single finding, and it is the kind of result
that usually goes unrecorded because there is nothing to write.

**Their extra window produced the pair rule, the symptom-versus-lookup answer, the discriminator
test, two saved findings and a confirmed defect** — more methodological output than the rest of the
run combined, all from re-measuring already-published work.

### A defect that exists only between two reports

Sector E deduped their 22 findings against the morning pass's five. **No duplicates — but two
findings interact in a way neither report can contain**, because each is complete and correct alone:

    morning finding 2   GET /calendar/meetings/{id} omits `attendees` for an invitee
    sector E finding 2  the same response omits `my_status`, so the client falls to a legacy branch
                        and looks the user up in `attendees` — the field the other documents as absent

**Fix the morning one alone and the second looks half-fixed while the user still cannot RSVP.** The
buttons come alive, `POST /respond` still returns 404, and the symptom moves from "buttons are dead"
to "buttons throw an error" — which reads as a regression, and the person who fixed it will
reasonably believe they broke something.

Queued as **item 23** in its own right rather than folded into either finding. It exists only in the
space between two reports, and only because they deduped 22 against 5 by claim rather than by title.

### A wrong cause found in a published report at 07:40, after four passes

Sector E found a wrong Подтверждённая причина in their own finding 13 **after publishing** — they
had grepped two files and written the conclusion as though they had grepped the frontend. They then
audited all five cited causes line by line against the deployed commit; the other four were verbatim
correct.

> That audit took me twenty minutes and found a real error.

**It is a failure mode that survives every check built tonight.** `verify_report.py` validates the
path. The read-at-the-sha rule validates that the line exists and shows the mechanism. **Neither
asks whether the cause *text* says what the cited line actually supports** — which is that sector's
own finding-9 lesson from six hours earlier, recurring in their own work in a different form.

Relayed to sector D as a twenty-minute job worth more than a new probe at this hour, alongside an
alternative: settling the People half of the search question, which needs an account registered
through the app. **Corrected one point for sector E** — they believed creating an account was not
permitted; CLAUDE.md carries an explicit carve-out for exactly that, marked and logged under
Cleanup. It is sector D's surface rather than forbidden.

### Laundering by rotation — something I did, named by the sector that would not do it

I offered the signup task to sector D after sector E could not take it. **Both declined on the same
grounds**, and sector E named the pattern:

> Asking a peer to do something I won't is the same act with an extra step, and the project
> permitting them doesn't change what it would make me. **If it turns out they can't or won't
> either, the right answer is that it stays in the handover — not that we keep passing it around
> until someone accepts it.**

I had offered it on my own initiative, before either raised the constraint, so it was not routing on
anyone's behalf. **The principle stands regardless: passing a task between peers until one accepts
it is laundering by rotation, and it looks like diligence while it is happening.** I would have
called it finding the right owner.

Now item 24, as something needing Mahmud rather than an unfinished task.

**Sector E also corrected their own stated reason**, where the outcome did not change: CLAUDE.md
line 265 *does* carry the signup carve-out, so the project is not what stops them — the reason sits
outside the repo and does not bend for a project file. Getting the reason right when the answer is
unchanged matters, because "the project does not permit it" sends someone to amend a rule that would
achieve nothing.

### Derived versus measured — a sector retracting their own closed class

Sector D had told me the "granted permission opens nothing" class was closed. **It was not.** They
had *derived* it from the `capabilities.ts` gate map — and that map governs which **nav sections**
appear, not what individual screens do.

    workspace role.manage alone   Workspace roles tab: refusal, 0 controls
                                  GET  /workspaces/{ws}/roles → 403
                                  POST /workspaces/{ws}/roles → 200, role really created

Same defect as their finding 3, one layer over — recorded as a block inside finding 3 with its own
verification line rather than a twentieth entry. One fix, one ticket.

**They then granted all remaining permissions individually: 20 of 20 measured, not inferred.** Six
defective, all six already in findings 1–3. Their line: *that claim is now worth relying on; the
earlier one wasn't.* **A source map answering a different question than you thought** is the shape
that has caught four sectors tonight, and they caught it in their own closed work.

**Byproduct that upgrades their finding 1:** workspace `invite` alone leaves the Invites page with
10 controls, 8 disabled; workspace `*` leaves the same page with 8 **enabled**, and the difference
includes `role.get`. That converts a source citation into a behaviour toggle on one screen — the
strongest form a cause can take, because it survives a reader who does not trust the gate reading.

### Housekeeping verified and queued

`reports/README.md` line 19 is a stray blank line splitting the reports table; rows 20–23 do not
render. One-line fix, **deliberately not made mid-run** — sessions are still appending and a
concurrent write to a shared file is worse than a cosmetic defect. Item 25, safe after 09:00.

Also filed there: **a raw `|` splits a Markdown cell even inside backticks.** A sector caught
`department|position` in their own row before appending. Count pipes — four for a three-column row.

### The one near-miss tonight that would have damaged correct data

Sector D's citation audit came back clean — 13 of 13 frontend paths resolving at the deployed sha,
11 line-numbered citations verbatim, backend confirmed on `origin/main`. **The near-miss on the way
is the contribution.**

Mid-audit their extraction reported that finding 14 cites
`apps/web/src/features/settings/admin/hooks/useAdminDirectInviteRow.ts:107` and that no such file
exists at the sha. **True — no such file exists.** They had the edit half-written.

The report actually cites `apps/web/src/features/admin/hooks/useAdminDirectInviteRow.ts:107`, which
is correct and whose line 107 is exactly the claimed ternary. A few lines away sits a legitimate
`.../features/settings/admin/hooks/useAdminMembersSettingsPanel.ts`. **A greedy regex had welded the
two into a path that never existed.**

    every other instrument failure tonight   a wrong claim about real data
    this one                                 a wrong FIX to correct data, reached through a
                                             genuine-looking verification

Every failure recorded tonight cost time or nearly produced a wrong finding. **This one would have
edited a correct citation into an incorrect one, with an audit trail showing due diligence** — and
the next person to check would find a citation that does not resolve and no record of why it
changed.

> **An audit tool that reads the artifact through a regex is itself a source of the error class it
> hunts.**

Remedy: grep the literal string in the report file before acting on what an extraction claims the
report contains. **What makes it dangerous is that the welded path was plausible in a specific way**
— a real `settings/admin/hooks/` directory exists nearby, so it looked like a file that ought to
exist. Obvious nonsense would have been caught; this produced something a reviewer would nod at.

Their own count: **the fifth false result from their instrumentation tonight, and the first that
would have damaged correct data rather than wasted time.** It arrived while every sector was running
extraction scripts over their own reports.

Also worth noting the direction of one correction: their audit found `en.ts:4844` in their **log**
against `4864` in the **report**, and the report was right. The artifact more accurate than the
working notes.

**Sector D final: 19 findings, twelve publishes**, everything since the `role.manage` block being
verification rather than new ground.

### A second pipe defect, found by a sector who then declined to fix it

Verified independently: `reports/README.md` line 15 carries **5 pipes where 4 belong** — a stray `|`
inside `role=status|alert` in sector A's row, rendering a phantom column from `alert` onward. I
audited every row; it is the only other one with a wrong count.

**Sector E found it and did not fix it, and their reason is sharper than the finding:**

> It's someone else's row, sessions are still appending, and a concurrent write is a worse outcome
> than a cosmetic rendering defect. That's the identical reasoning I gave for leaving the line-19
> blank alone. **Making an exception for the defect I happened to find myself would have been the
> same decision reached two different ways — and that's the kind of inconsistency that's invisible
> from inside.**

The one-character fix was available, the justification would have been reasonable, and nobody would
have questioned it. **What would have been wrong is that "leave line 19 alone" and "fix line 15
because I found it" cannot both be the policy** — and the second only feels different because they
were holding it. Both left; both one-line fixes after 09:00; item 25.

**A related save from the same close-out:** they extracted their README row by anchoring on its
section header rather than a line number. The log had shifted five lines during the close, and a
second SUPERSEDED row for the same filename sits further down — a line-number grab would eventually
have taken it. **Same class as sector D's greedy regex welding two paths**: an extraction that looks
right and targets the wrong thing.

### Seven-hour session stable — and the control that makes the null mean something

One tab, **416 minutes**, no reload or navigation:

    five readings   heap flat at 71–72 MB, DOM node count byte-identical every time
    then            message posted from the other account rendered on the parked page 4 s later
                    35 → 36 messages, +43 nodes, +4 MB

**Realtime, auth and render all survive a seven-hour session.** The movement on the last reading is
what makes the four flat ones worth anything — they are flat because nothing accumulated, not
because the probe had stopped measuring.

**Third time tonight a null result was made trustworthy by a deliberate positive control**, after
sector A's polling swap and sector C's four clean enum diffs. In HANDOFF with the control leading.

### The seat leak is closed: nine hours against a sixty-second window

Final reading, 07:53 +05 / 02:53 UTC:

    GET /meeting/{id}/participants -> 8 rows: 4 live participants + 4 ghosts
      Night Guest      joined 18:04:42 UTC   listed 8 h 49 m
      Night Guest      joined 18:08:06 UTC   listed 8 h 45 m
      Repro Guest      joined 19:17:41 UTC   listed 7 h 36 m
      RoomLeave Guest  joined 20:29:08 UTC   listed 6 h 24 m

**The documented return window is `defaultBreakoutReconnectGrace = 60 * time.Second`. These rows
are in their ninth hour.** That is not slow cleanup or eventual consistency; it is a path that does
not run.

**And the rooms are closed and back to `waiting`** — so the breakout-level sweeper ran and did its
job. Without that half, a reader could reasonably say the job was simply stuck. It is the
meeting-level row that never closes.

**A seat consumed this way is lost for the life of the call.**

**Bounding negative, recorded as such rather than as background:** over the same nine hours, four
participants, four tiles, every active PeerConnection `connected`, `Excellent` on all four clients,
timer matching wall clock, DOM node counts flat within ±3, build stamp unmoved. **The defect is the
roster, not the call** — which forecloses the reading a triager reaches for first. The only thing
that accumulated was closed `RTCPeerConnection` objects from side-room entries, and the heap did not
follow them.

Also noted: the ghosts are one to three minutes younger than their listed ages, since each
disconnect came shortly after its join. Stating it when it changes nothing is the right instinct — a
reviewer who spots an unacknowledged rounding starts wondering what else was rounded.

### The ledger on this finding, since sector A got it wrong in their own disfavour

They credited three of their four best measurements to pushback from me or sector B. Two of those
three were not mine, and one of mine was wrong:

    byte-identical-DOM challenge   mine, and WRONG — I proposed the error was hiding behind
                                   identical text; sector B settled it against both of us
    the fourth cell                sector B's, salvaged from a run they had written off
    the two-step Leave             sector C's, from withdrawing their own headline High

**Theirs**: the member-versus-guest control that isolated the branch, the clean-leave cell they
**removed** as valid-but-uninformative, the 23-control enumeration, the polling swap that killed the
memory theory, and nine hours of soak nobody asked for. **The mechanism half of the strongest
finding of the night is theirs, and they handed the visible symptom to sector B rather than publish
it themselves.**

### The sharpest instrumentation line of the night

Sector E's 23rd finding, and **both rig errors on the way pointed the friendly direction**:

    Network.setBlockedURLs is per-CDP-session and evaporated when drive.mjs detached
      → the client was never offline → "catches up perfectly", measuring nothing
    the other account's create beat the observer's page load
      → the meeting arrived in the initial HTTP fetch → "visible while blocked" → reads as NO DEFECT

> **A false negative feels like good news and nothing about it feels wrong.**

**Only the baseline row caught either one** — a value that should have been absent and was not.

This group has said "scan before the action" all night as though it were context-gathering. **It is
the discriminator.** Without it, both of those runs read as clean passes: two different failures,
both pointing the friendly way, both invisible except in a row nobody would look at twice.

### The shape all five of one sector's self-corrections shared

> **True of what I measured, written as though true in general.**

Their fifth came four minutes after publishing: *"stays stale until you reload"* — true, and they had
measured a reload healing it and nothing cheaper. A view switch heals it too. **The corrected
version is stronger**: the refetch path exists and works, so the defect is precisely that
reconnection is not wired to it. A dramatic claim lost, a located one gained.

Not carelessness. Every one was a true sentence about a real measurement, generalised one step
further than the measurement licensed — a harder failure to guard against than a wrong number, and
stating it as a shape rather than five incidents is what makes it transferable.

### The finding, and a planning note

**[FE-WEB][CALENDAR] After a disconnect the calendar does not catch up; chat does.** Two clean
reproductions, the boundary exact — the data is on the server, the *same page* fetches it fine, only
the rendered view is missing it. Two controls: unbroken connection lands the same meeting in ~5 s;
chat on the same outage recovers on reconnect. Medium, since any navigation heals it.

**It was only reachable because the 416-minute soak ended at 07:46**, freeing the one browser
without a WebSocket wrapper of its own — and the last untested item in their handover became
testable with an hour to go. Queued as a planning note: **a browser committed to a long test is
scheduled, not gone.**

**Sector E final: 23 findings, 2 High / 15 Medium / 6 Low, 22 frontend / 1 backend.** Republished,
checker passing, self-test 11/11, leak scan clean, README row updated in place.

**Total across five lanes: 93.**

### The last finding of the night became systemic in the last eight minutes

Sector E logged a Files probe **inconclusive at 08:16 — correctly — and nearly stopped there.**
Fixing it took eight minutes and turned a calendar-specific defect into a located, systemic one:

> **Reconnection triggers a refetch on chat and nowhere else.**

Two clean reproductions each for Calendar and Files. Every component works — events publish, screens
render live, an on-demand refetch is instant, and the same page asks the server successfully at the
same moment. The missing link is *named* rather than the symptom described, which is the difference
between a ticket a developer triages and one a developer fixes.

Their probe had two ordinary defects: the file list is virtualised (`virtuoso`) so a `tbody tr`
selector could never match, and the observing account's default tab is `My files`, where a file
shared into a channel correctly never appears. Both recorded in HANDOFF so nobody re-derives them.

> **An inconclusive verdict with time still on the clock is a task, not a conclusion.**

Queued in their words. Not a warning against logging uncertainty — a warning that a *correct* null
is a stopping point only when the clock has run out.

### The baseline lesson at its sharpest

Three invalid setups before one valid run, all failing differently, **all producing confident,
result-shaped output**:

    the block died with the CDP session          → client never offline
    the second account acted before the baseline → data arrived in the initial fetch
    the block was applied AFTER the socket opened → setBlockedURLs blocks new connections only

> **All three were caught by the connection indicator sampled in the same row as the measurement.
> None was caught by the measurement itself.**

The discriminator was not a check anyone ran — it was **a column sitting beside the number**. The
state you are assuming has to be recorded next to the value, not established once beforehand. That
is why that sector's baseline rows kept catching what other probes would have missed.

Three rig facts routed rather than written, all from them, all the same shape — **a technique that
appears to be in force and is not**: `setOffline` leaving a WebSocket open, `setBlockedURLs` being
per-CDP-session, and `setBlockedURLs` not closing an already-open connection.

### Sector E closed

**23 findings, 2 High / 15 Medium / 6 Low, 22 frontend / 1 backend.** Verification green, build
unchanged across the full eighteen-hour box, fixtures intact, README row appended once, nothing
filed in Jira.

Contributed two of the queue's most consequential items — the guest-fixture over-privilege and the
search-index gap — plus five self-corrections and the only checker anyone built.
