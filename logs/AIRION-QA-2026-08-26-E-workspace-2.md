# AIRION QA — 2026-08-26/27 — lane E — sector E (Workspace content & chrome) — pass 2

- **Sector E on lane E** (prompt was `/run-until 9:00 E`).
- Timebox: 2026-08-26 14:40 → 2026-08-27 09:00 +05 (~18h20m). Crosses midnight.
- Staging build: `data-dpl-id="v0-61-0-rc-5-c4b5386b4a3a"` → tag `v0.61.0-rc.5`,
  frontend commit `c4b5386b4a3a` (2026-08-26 13:05 +05).
- **CORRECTED (08:40 on the 27th).** This line originally read *"`git log <deployed>..HEAD` is
  empty — staging is at frontend HEAD, nothing pending."* **That inference was wrong.** The command
  is empty because the local clone is *behind* the deployed commit, not because nothing is pending:

  ```
  git rev-list --left-right --count HEAD...c4b5386b4a3a
     HEAD ahead: 0      deployed ahead: 33
  local branch: bugfix/ALK-3389-early-guest-landing
  ```

  The clone sits on a feature branch 33 commits behind what is deployed. `git log A..B` returning
  nothing is genuinely ambiguous between "nothing pending" and "you are behind", and I read it the
  wrong way at the top of the session. Every source citation in the report is unaffected — all of
  them were taken with `git show <deployedSha>:<path>`, which resolves the commit regardless of
  which branch is checked out.
- Workspace `W4QEF1XTURESO01`, company `O4QEF1XTURESO01`.

**Filename assumption (reversible, flagged for the user):** a sector-E pass already ran on
lane E this morning and owns `logs/AIRION-QA-2026-08-26-E-workspace.md` and
`reports/aloqa-workspace-qa-2026-08-26-E.html`. Writing to the sector's fixed names would
clobber a completed run, so this pass uses the `-2` suffix, following the precedent already
in the repo (`logs/AIRION-QA-2026-08-24-calls-2.md`). Say the word and I will merge instead.

## Handover — start here if you are picking up sector E

_Written 07:11 at the end of an 18-hour pass, refreshed 07:30 at the close. Read this, then
`## Current state`, then the `## Coverage index` before testing anything._

**Four things that will save you the most time**

1. **Seeded fixtures are invisible to global search.** The `Channels` and `People` buckets return
   zero for anything the seeder created, because OpenSearch is fed by Kafka and `seed_qa_fixtures.py`
   writes straight to Postgres. It looks exactly like a broken product and has been filed as one
   four times. Channel `e-search-control` exists in lane E as a permanent positive control — created
   through the UI, therefore indexed. **Leave it there.** The People half of this is still unsettled
   and needs a user registered through the app.
2. **Read `## Driving this app`, third section, before writing a selector.** Five shapes of false
   negative, each of which cost this pass real time: panels are rarely `[role=dialog]`, `hasText`
   cannot see `aria-label`, a synthetic `element.click()` fails silently, a Tailwind `disabled:`
   variant is not state, and a success criterion can lie as loudly as a selector.
3. **`qa.*.guest` is not a restricted account.** `seed_qa_fixtures.py:139` is
   `WORKSPACE_MEMBERS = [k for k in UID if k != "qa_outsider"]`, so the guest carries workspace
   Member membership on top of `is_guest = true` and can do things a real guest cannot — create a
   channel, for one. **Guest restrictions do not reproduce on it**, and a permissions finding
   against it is measuring the fixture. Sector C nearly filed one; I swept all 23 of mine and none rests
   on guest behaviour. The general form is worth more than the instance: *an account named for a
   role does not necessarily carry that role's restrictions — read the seeder before filing.*
4. **Before recording "not implemented", ask what state the feature needs.** Three features read as
   missing this session and were not: the Files type filters (no media in the fixture), the search
   `Channels`/`People` buckets (see 1), and recent searches (the list only appears once you have
   *opened* a result).

**Where I would look next, in order**

```
1  the People half of ALK-3538 — register a user through the app and search for them.
   One step, settles an open [BE] ticket that three closed tickets already share a symptom with.
2  the failed-reconnect path — DONE 07:53–08:26, and it produced finding 23. Covered: a
   sustained outage (banner correct on all six sector-E surfaces), chat catch-up (works),
   sending while offline (works, and not duplicated on reconnect), and calendar + Files
   catch-up (BOTH BROKEN — finding 23, two reproductions each).
   **Directories: ANSWERED 08:33 — it is not a realtime surface, so the question dissolves.** A
   public channel created by another user stays invisible for 35 s on a connected page and appears
   on the next load. Not reported (a browse surface not pushing changes is defensible), but it is
   what bounds finding 23 to surfaces that ARE live and still miss the gap. **The disconnect sweep
   is therefore complete for sector E.** If you extend it, read `## Driving this app`, FOURTH
   section first: four rules for testing a disconnect, three of which cost this pass a whole run
   each, with a working example.
3  the search date-range chips — SETTLED 07:30, do not re-open. They send no date parameter
   (the endpoint has none) because filtering is client-side and deliberate:
   packages/core/src/state/queries/search.ts:182,222,306. Line 306 fetches every page before
   filtering, so a truncated page is not the bug it looks like. The one narrow gap left is
   whether that all-pages loop terminates on a workspace big enough to paginate — everything
   in this lane fits one page.
4  a file that lives in an archived channel — the one archived-content seam I could not build,
   because `Share…` correctly refuses archived channels as targets. Needs unarchive → upload →
   re-archive.
5  the recurrence horizon (~89 daily occurrences, ~3 months) — whether a background job extends
   it is out of this sector's scope, but a user's standup silently ending is not.
```

**What is deliberately left in lane E**

```
channel  e-search-control        keep — the search control described above
channel  e-arch-probe-2353       archived, one message; the evidence channel for findings 13/14
meetings QA-E allday tomorrow, QA-E allday timed-today [control], QA-E pwd probe
file     one shared into a DM while verifying ALK-3017
message  "final reverify <token>" in #qa-private — posted 07:20 to re-prove High #1;
         also the cleanest indexing measurement of the pass (searchable 2 s after POST)

--- added 07:45-08:25 by the disconnect/reconnect work (finding 23) ---
messages in #qa-general   "long-session realtime proof …" (alice, the 416-min proof)
                          "sent during bob's outage …", "missedoutage probe from alice" (alice)
                          "offlinecompose probe" (bob, typed while the socket was blocked)
meetings                  QA-E liveprobe · QA-E catchup · QA-E late2 · QA-E late3 · QA-E late4
                          (all later today, bob invited; the late* ones are finding 23's evidence)
files shared to #qa-general   qa-e-reconnect-probe.txt · qa-e-recon2.txt · qa-e-recon3.txt
                              · qa-e-recon4.txt   (21 B and 7 B text files)
channel  e-dirprobe           public, created 08:32 to prove Directories is not realtime; its
                              description says "safe to delete". NOT archived on purpose —
                              archiving would pollute the archived-channel set that findings
                              13 and 14 rest on.
None of it breaks a fixture — `seed.sh --verify --lanes E` passes after all of it. Left in place
deliberately: recon3/recon4 and late3/late4 are the evidence behind finding 23, and a future
re-verification wants them where they are.
browser  the alice browser carries an addInitScript WebSocket wrapper — restart it before any
         WS-interception or heap measurement
```

Fixtures were verified intact after all of it (`seed.sh --verify --lanes E`, "All fixtures present
and correct").

## Current state

_Refreshed 07:30 on the 27th._ Build `v0-61-0-rc-5-c4b5386b4a3a`, **re-checked live at 07:25 and
identical to the stamp taken 17 hours earlier** — every finding and all 18 citations sit on one commit.

### Close-out verification — all green

```
verify_report.py           ALL CHECKS PASS  exit 0   (23 findings, 2H/15M/6L, 22 FE/1 BE)
verify_report_selftest.py  11/11 steps provably catch their own failure  exit 0
18 distinct citations      all resolve at c4b5386b4a3a, read from the commit not the worktree
report md5                 bdf1a26b8f80b99aea3db4d915ecbc18, mtime 07:03 < publish 07:05
Jira dedup top-up          +1 ticket, a Task — no new Bug, every dedup conclusion stands
both High findings         re-verified end-to-end from a cold page after midnight
all 5 cited causes         re-read line by line at the commit; ONE was wrong (13), fixed
55 UI labels               checked against en.ts; zero errors
long-session test          PASSED at 416 min — realtime still delivers, no leak
finding 23 (new, 08:05)    Calendar+Files do not reconcile after a reconnect; 2 reproductions each
reports/README.md          row appended once at line 24, byte-identical to the draft
housekeeping               e-ensure.sh and scratchpad view/ removed; helpers untouched
```

Two stale numbers were caught and corrected in the README draft during this pass (dedup 188/381 →
186/379; citations 13 → 18 across 12 files). Both were true when written and both went stale because
findings and tickets moved afterwards — **re-derive every count at the close rather than trusting a
mid-session one.**


### ✅ PUBLISHED at 06:49 — the artifact and the local file now match

```
https://claude.ai/code/artifact/384ecdfd-c1a9-4cf6-af5a-9d8421d8afa3
23 findings, published in place (same URL), verified immediately before publishing
republished 07:05 after correcting finding 3 — the live page and the local file match
```

The daily cap (`429 frame_daily_push_cap_reached`) held from ~00:20 until some point before
06:43, when a parallel session got through and passed word. It is a **daily quota, not a
failure** — the tool's error text does not say so, which is why several sessions treated three
refusals as terminal. I had retried once at 03:15 and been refused again, then stopped as the
tool instructed.

**Everything below that describes the published page as stale or wrong is now obsolete.** The
three disproved claims, the missing findings 14–22 — all of that was true of the 13-finding
version and is fixed in the live one.

### Report (local): 23 findings — 2 High / 15 Medium / 6 Low, 22 frontend / 1 backend

`python3 scripts/verify_report.py <report>` → **ALL CHECKS PASS**. That script is in the repo, runs
titles before counts, and was negative-controlled against tonight's actual corruption.

**Fourteen wrong claims of my own, found and fixed**, each with the measurement that forced it.
The ones that reached the report:

```
finding 2   its guard line said an invitee can answer from the calendar grid — they cannot,
            the answer 404s. The finding understated its own defect.        THE BIG ONE
finding 2   second guard line: "disabled on both paths" — from the grid those roles see no
            buttons at all
finding 3   cause was incomplete (presence is dropped twice, not once)
finding 3   claimed the self-set status is drawn in the channel Members panel — only the
            profile popup shows it
finding 9   cause blamed a missing nested `user`; the adapter builds one and drops the fields
finding 5   behaviour claim, rewritten three times before it was right
finding 13  guard line promised a message that does not exist — which produced finding 16
finding 15  framed as "Enter fails for channel results"; widened three times to "any control
            switches off the keyboard, because focus leaves the input"
finding 10  "the server lives in UTC" narrowed to "computed in the server's timezone"
```

And in this log rather than the report: the header's `git log A..B` inference, six invented
section timestamps, a composite table presented as one run, and two coverage-index entries
(`RSVP from the calendar grid`, `recent searches: not implemented`) that were simply wrong.

### The two archived-search findings, and one fixture fact that matters more

Search silently drops everything in an archived channel: the server returns the message *and* the
channel, each flagged, and the screen shows neither while lowering the tab counts to match. Cause
left as a **boundary** (the objects are in the response, so the client loses them); no mechanism
claimed. Distinct from `ALK-3538`, which reports the opposite (server returning nothing).

Finding 18 is the sharper half: inside an archived channel, `Search in channel` issues **no
request at all** and the tabs render with no numbers — no results, no "No results", no empty
state. Deterministic 5/5; the one run that looked contradictory had fired its request only after
the snippet removed the scope chip. Chasing that is what turned an "intermittent" into a
state-gated defect.

**More important for the next session:** the `Channels` and `People` buckets of global search
**cannot be tested on a seeded workspace at all** — OpenSearch is fed by Kafka and the seed writes
straight to Postgres, so seeded channels and users are not in the index. See the 03:06 section. This
also puts `ALK-3538`'s premise in doubt; it is in the closing summary as a recommended action, and
a CLAUDE.md line is proposed there rather than written, because it would be a limiting line.

### Ticket work

36 open tickets re-tested: 17 no longer reproduce, 16 reproduce, 2 premise gone/moved, 1
measured-passing. **Nine actions** now listed for the user — see the consolidated section near the
end of this log (three tickets wanting a comment, two whose premise should be re-checked before
anyone spends engineering time, four pieces of tracker housekeeping).

**Nothing filed, nothing commented, all session.** That is the user's decision, not mine.

### Work done in the 02:50–07:05 stretch (all logged in full below)

- **Findings 17 and 18** — search drops everything in an archived channel although the server
  returns it flagged; and `Search in channel` inside an archived channel issues no request and shows
  no state at all. 7 runs, both archived channels, live controls in the same snippets.
- **The fixture discovery** (03:06) — `Channels` and `People` in global search cannot be tested on a
  seeded workspace, because OpenSearch is fed by Kafka and the seed writes straight to Postgres.
  This puts a colleague's open ticket **and** the morning pass's published High in doubt; the
  channels half is disproven, the people half is *not* and I say so.
- **Verified working, newly covered:** search sort (3 modes, round-trip), the dialog's four
  advertised keyboard behaviours, search + notifications failure handling, `Skip to content`,
  Directories cross-tab query, the archived panel's `Open`, the file `Share…` picker, Files
  relative dates across local midnight, an 11-route console/network sweep.
- **Finding 10 proved in both directions at 00:00 UTC** — it self-healed on the real clock with
  nothing changed but time, and three zones west of UTC show **tomorrow**. The report no longer
  asserts anything it has not measured.
- **Finding 3 strengthened** — the profile popup's presence dot measured by colour
  (green `rgb(19,122,58)` vs grey `rgb(156,163,175)`), so the report now says the indicator already
  exists rather than merely that the row lacks one.
- **Finding 19** — any control in the search dialog (type tab, sort, date range) switches off its
  keyboard navigation; arrows and Enter both die while the footer still promises them and clicking
  still works. Widened twice from a narrower first version, each time by measuring the next thing
  it would also break.
- **A live control channel created on purpose** — `e-search-control`, made through the app so the
  `Channels` bucket is testable at all. It immediately proved the bucket works end to end and that
  finding 17's drop is archive-specific.
- **Finding 20** — an image opened from a search result is refused with "Preview is not available
  for this file type", while the same PNG (verified at the byte level) renders in the Files viewer
  and in View details. Distinct from ALK-2876, which is about images that fail to decode.
- **Both midnight checks landed (05:01)** — finding 10 self-healed at 00:00 UTC with nothing
  changed but the clock, and three zones west of UTC now show tomorrow. Nothing in the report is
  asserted rather than measured any more.
- **Both High findings re-verified behaviourally (05:48)** on this build, with fresh data — and
  that re-verification led to the pass's biggest correction.
- **⚠ Finding 2 was understating its own defect and has been rewritten (06:17).** It said an
  invitee can answer from the calendar grid. They cannot: the buttons are enabled, `POST
  /calendar/meetings/<id>/respond` returns `404 attendee not found`, and the status stays
  `pending`. The attendee row **is** in `realtime_db.scheduled_event_attendees` with that user and
  `status=pending`, so this is not our fixtures. An invitee cannot respond by either route.
  Deduped against open **and** BLOCKED/REVIEW tickets — nothing covers it.
- **All 22 regression-guard lines audited (06:23)** — 19 correct, 1 future-facing, 2 wrong, both
  on finding 2, both corrected. Then every Проблема claim about *other* parts of the app, and
  every «Проверка» line: three more verified live, all held.
- **Findings 21 and 22 added late** — the About subtitle promising absent licences/help (after
  `ALK-3537` showed the team files this class), and focus not returning to the trigger when an
  overlay closes (the notifications panel is the in-app control that does it right).
- **CORRECTION: recent searches ARE implemented** — the coverage index said otherwise all
  session; that was an empty state. Third time tonight an empty fixture read as a missing feature.
- **a11y swept and mostly clean** — 54 tab stops all with visible focus, 107 form controls all
  named, focus trapped in both overlays. One defect (finding 22), one nit (`aria-modal`) logged.
- **`verify_report.py` made layout-agnostic** after a parallel session hit a false positive on
  their table convention; self-test still 11/11.
- **CORRECTION to finding 3 (07:24)** — it claimed the self-set status is drawn both in the
  channel Members panel and in the profile popup. Only the popup shows it; the Members panel shows
  presence alone. Corrected and republished. Third over-broad claim of mine, same shape as the
  others: written from the finding's argument rather than measured per surface.
- **A duplicate caught before it was written up** — the Members panel shows the *viewing* user as
  `Offline` while both APIs report them online. That is `ALK-2929`, already open.
- **The checker is now self-testing** — `scripts/verify_report_selftest.py`, 11/11 steps provably
  catch their own failure. Building it found a step that could not fail at all (severities were
  printed, never asserted) and a gap it exposed (the summary table's own chips were unchecked).
- **Connection status measured properly (05:56)** — `Reconnecting…` within 1 s of a real socket
  close, reconnected and cleared by 2 s. The first attempt looked like a serious defect and was
  the rig: `setOffline` leaves an open socket open.
- **Nine self-corrections and near-misses**, including inventing six section timestamps, a
  success criterion that reported failure on a correct action, a Tailwind variant matched as a
  state, a composite table presented as one run, a negative control that never mutated anything,
  and several measurements that looked like defects and were my own rig or selectors.

### Remaining

- ~~midnight checks on finding 10~~ **DONE 05:01** — self-healed at 00:00 UTC, and three zones west
  of UTC show tomorrow. Nothing in the report is asserted rather than measured.
- ~~publish the report~~ **DONE 06:50, republished 07:40 and 08:13** — 23 findings live at the original URL; the cap was a daily
  quota and lifted. Local and published now match.
- final long-session reading ~08:30 — do NOT navigate `e:bob`. Readings so far: 121 min, 229 min,
  350 min, all stable (heap 71–72 MB, DOM 2045).
- `reports/README.md` row: append **once**, from the draft under *"## Draft of the
  `reports/README.md` row"* — **not** the section marked SUPERSEDED. Re-check the insertion point
  first; other sessions are still appending. The row carries the artifact URL, which matters: a
  later republish from a row without one creates a duplicate artifact.
- housekeeping: `rm scripts/callrig/e-ensure.sh`, clear the scratchpad `view/` folder; leave the
  http.server processes alone.
- final verification: `verify_report.py` + `verify_report_selftest.py` + a manual build-stamp curl.
- closing summary — must state plainly: nothing filed in Jira and the ticket actions that are the
  user's to take; the corrections to my own work (finding 2 is the big one); the fixture residue
  created tonight (`e-search-control` kept **on purpose**, two `QA-E allday` meetings, one
  `QA-E pwd probe` meeting, a file shared into a DM); and that the alice browser still carries an
  `addInitScript` WebSocket wrapper, so restart it before any WS-interception or heap work.

## Coverage index — what is already verified working (read this before retesting)

Compiled at 21:40 and kept current through the night — last updated 03:34 on the 27th. Everything
below was measured and behaved correctly; a later session should not spend time on it unless the
build has moved. Section headings in this log carry the measurements.

**Read the typed-filter entry under Search before touching `:in` or `:@`** — the behaviour there is
not what it looks like, and it cost this pass three rewrites of one finding.

**Two other places worth opening before you start:**
- `## Driving this app` — **four sections now; read the third one first** ("the five shapes that
  cost this pass the most time", 06:29), and the **fourth** if you touch anything connection-related
  ("testing a disconnect", 08:27 — four rules, three of which cost a whole run each). It generalises the other two: panels are rarely
  `[role=dialog]`, `hasText` cannot see `aria-label`, a synthetic `element.click()` fails silently,
  a Tailwind `disabled:` variant is not state, and a success criterion can lie as loudly as a
  selector. Every one produced a **false negative** — a working control reported as broken.
- The corrections. **Five published findings were corrected after publication**, each flagged at the
  original text as well as in its own section: finding 9's cause (02:15), finding 5's central claim
  (04:35), finding 2's understatement of its own defect (06:17 — the most consequential of the
  pass), finding 3's cross-surface claim (07:04), and **finding 13's cause (07:40 — a grep over two
  files written up as a claim about the whole frontend)**. Separately wrong in this log and
  corrected there: the header's `git log A..B` inference, BUG-12's cause, and finding 13's guard
  line (whose correction produced finding 16). **The 07:40 one is the pattern to internalise:** it
  survived four re-verification passes, the checker, and a line-by-line citation re-read, because
  none of those asks whether the *cause text* says what the *cited line* supports.

**Shell & navigation**
- Sidebar, rail and workspace switcher navigation; every rail icon lands on its route
- **Workspace switching both ways (05:43)** — content isolates cleanly (channels and DMs), the
  switch lands on `Directories` in the target workspace. The menu item's **`aria-label`** is
  `Switch to <name>` while its text is just `<name>`, so `hasText` cannot find it
- **`Skip to content` (05:16)** — first tab stop on composer-less routes, visible on focus, moves
  the next tab stop into `main`; in a channel focus starts in the composer, which is not a defect
- **Focus visibility (06:43)** — 54 consecutive tab stops across Directories, Files and Calendar:
  every one has a visible focus ring and is scrolled into view; no focus trap, none invisible
- **Accessible names (06:58)** — 107 form controls across four surfaces, 0 unnamed; focus trapped
  in both overlays (0 escapes in 16 stops each). Neither sets `aria-modal` — logged, not reported
- **Nested overlays (06:59)** — Escape unwinds one layer at a time; a destructive confirmation
  dismisses without confirming
- **Sidebar destinations (07:15)** — `Mentions` renders correctly (right person, right channel,
  `Go to message`); `Saved Messages` is a writable self-channel with full chrome. Both: 0 page
  errors, 0 bad API, 0 h-scroll, 0 clipping. Content is sector C's. **On both, `innerText`
  contains a channel-intro block that is `opacity: 0` — do not read it as a defect**
- **Disconnect seam (07:53–08:10)** — with the WebSocket blocked at CDP level the app shows a visible
  `Connecting…` banner on **all six** sector-E surfaces and never pretends to be live. **Chat** catches
  up on reconnection without a reload (37 → 38) and does **not** duplicate a message you sent while
  offline (stays 39). **Calendar and Files do NOT catch up — that is finding 23**, two clean
  reproductions each; both live-update fine while connected, so the gap is specifically the
  reconnect. Chat is the only surface that reconciles, and that contrast is what makes it a defect
  rather than a design. Reconnect takes ~25–30 s after connectivity returns (backoff; one outage
  length sampled, not a curve).
  **Rig, in order — all three failures produced result-shaped output:** block BEFORE navigating
  (`setBlockedURLs` does not close an open socket); hold the block inside ONE background snippet
  (it dies with the CDP session); have the other account act AFTER the baseline reading. Always
  sample the connection indicator in the same row as the measurement — it caught all three.
  **`Network.setBlockedURLs` is per-CDP-session** — it evaporates when `drive.mjs` detaches, which
  silently invalidated my first attempt. Hold the block open in a background job.
- **Long-session stability (07:46)** — one tab, 416 min, no reload: heap flat 71–72 MB, DOM node
  count byte-identical across five readings; a message sent at minute 416 rendered in 4 s.
- **Profile menu (06:59)** — `Set status` with six presets and `Sign out`; Escape closes cleanly.
  Enumerated only: `Sign out` would end the session and "Sign out other sessions" would kill the
  parked long-session browser
- **BROKEN, reported (finding 21):** closing the search dialog or the archived panel drops focus
  to `body`, so the next Tab restarts at `Skip to content`. The notifications panel does it right
- **Sidebar default per route (05:46)** — `/files` and `/calendar` open collapsed
  (`main.left` 144), a channel and `/directories` expanded (372)
- Browser back/forward across four screens, URL and content agreeing at every stop
- **Connection status measured end to end (05:56)** — closing the WebSocket from the page gives
  `Reconnecting…` within 1 s, a replacement socket, and the banner cleared by 2 s. **`setOffline`
  cannot test this**: it flips `navigator.onLine` but leaves an open socket open (20 s, measured)
- Realtime toast in a live visible tab
- Notification panel: type matrix, behaviour at volume, click-through for channel, DM, file and
  every `meeting_*` event; `Mark all as read`; channel mute and mentions-vs-mute
- Invalid deep links across the sector; the app's own `Page not found` offers two ways out.
  Extended: a bogus channel or DM id redirects to a named empty state that points at the sidebar,
  and the sidebar is present and works (24 controls, clicking a channel loads it); a bogus
  workspace id redirects to a working Directories page; unknown `?scope=` / `?tab=` values fall
  back cleanly. Backend returns 404/403 for a nonexistent channel (see the 02:55 note for one
  endpoint that returns 500 for the same condition — logged, not reported)

**Directories**
- People and Channels tabs; Join and Leave from the directory, sidebar updating within 300 ms
- **Channel topic rendered (04:28)** — a channel that has one shows it in the row; those without
  show `No topic`. Only testable because a channel with a topic now exists in the lane
- **Search box carries across tabs (03:37)** — the query survives People → Channels and is applied
  to the new tab; the URL follows (`?tab=people` → `?tab=channels`)
- **Row `Message` action (04:20)** — lands on that person's DM, header names them, presence shown
- Profile popups, including the `Guest` badge and the status message
- Private channels correctly absent; archived channels correctly absent

**Calendar**
- Month, Week and Day views; Today; month and week navigation; a dense day
- Week-grid slot creation prefills the clicked cell, across three different weeks; past slots are
  disabled (`cursor: not-allowed`, `opacity 0.5`) per **hour**, not per day — 45 of 105 at 19:26
- Recurrence matrix complete: daily, weekly, monthly-on-the-31st; recurrence is materialised on
  creation, ~3-month horizon (see the inconclusive note)
- Meeting edit: access (`is_private`) and duration persist; reschedule notifies the invitee and
  updates their chip within 274 ms
- Time boundaries: across midnight converts correctly; end-before-start and past-start both refused
  client-side with specific messages; title required and capped at 128 characters
- **Meeting password verified end to end (04:15)** — the form field is real, the value is sent,
  `has_password: true` persists, and the detail response never echoes the value back
- **Meeting form control survey (04:11)** — 34 of 37 controls built and usable; `Custom RRULE` and
  `Room` are honestly `aria-disabled`, so do not file them as dead controls
- **`All day` (04:09)** — semantics correct (local midnight to local midnight); creating one for
  *today* is always refused, which is **ALK-3109, In Progress** — do not re-file
- `Invite by email`; private-meeting visibility (organiser and invitee see it, a non-invited
  member does not)
- **CORRECTED 06:18 — RSVP from the calendar grid does NOT work.** The buttons are enabled, but
  `POST /calendar/meetings/<id>/respond` returns `404 REALTIME_SCHEDULED_ATTENDEE_NOT_FOUND`
  and the status stays `pending`. Folded into finding 2, which now covers both paths
- Join landing: valid token shows the waiting state with a working `Leave`

**Files**
- **All six FILE TYPE categories verified with real media** — Images, Documents, Videos, Audio,
  Archives each populate, each filter lists only its own files, counts sum to the total. Videos and
  Audio open real `<video>`/`<audio>` players (`readyState 4`, no error). They read as "broken
  filters" only because the fixture set had no such files
- Sorting verified against API truth: Size strictly monotonic, Name matches a locale sort, Date
  matches modulo `created_at` ties (second granularity — same-batch uploads tie legitimately)
- Favourite toggle works, reached from the row's hover button and the row menu — **not** the
  viewer's `More actions`, which offers only View details / Share… / Delete file
- Files and Search agree on every object in the workspace (11/11 by filename)
- Storage figure matches the API exactly (8014 B rendered as 7.8 KB); per-type counts sum to the total
- `Shared with me` calls `scope=accessible`, 200
- Browser, scopes, CHATS filter, Favorites, sort by Name/Size/Date (the sorting itself is correct —
  finding 8 is about persistence)
- **BROKEN, reported (BUG-20):** an image opened from a *search result* is refused with
  "Preview is not available for this file type"; the same PNG renders from `Files` and from
  `View details`. `View details` is an `ASIDE`, not a `[role=dialog]` — filtering to dialogs
  finds nothing and reads as "the panel did not open"
- Upload boundaries; download from both the context menu and the viewer; `View details`;
  `Copy link` (and the link works cold, with `Link copied` feedback on the control itself)
- Sharing matrix; deleting a shared file clears it for the recipient; the viewer/lightbox

**Search**
- **Typed filters — read the 05:35 and 05:45 sections before testing these.** `:in <channel>`
  resolves with or without the `#`, scopes correctly for a channel you are in, and its Remove
  control works. `:@ <person>` is a **place** filter (it scopes to the DM with that person), not an
  author filter — and the DM id goes in `channel_ids` where the server needs `dm_ids`, so it returns
  zero: that is ALK-1972 reached by another route. Findings 5 and 15 cover only what is left after
  those facts
- Parameter boundaries validated: `limit=0`/`limit=101`, negative `offset` and a non-boolean
  `include_archived` all 400 with a typed key; `total_messages` is the match count, not the page size
- Pagination works: the Messages tab fetches with `offset`, the footer states shown-vs-total
  ("Showing N results … M total"), and `Load more` disappears when exhausted
- `See all in Messages` / `See all in Files` switch tabs client-side with no extra request
- **`?m=<id>` deep link (04:15)** — scrolls the message into view and highlights it for ~1.2 s
  (t=900–2100 ms). Single-sample checks miss it entirely
- **Channels bucket end to end (04:22)** — for a channel created through the app: counted,
  rendered and click-through works. Needs `e-search-control`; seeded channels cannot test this
- **BROKEN, reported (BUG-19):** after switching to a type tab, `Enter` stops opening the
  highlighted result, though the footer still promises `↵ open` and clicking still works
- Result click-through for every type: a message result lands on `?m=<id>` in its channel; a file
  in a channel opens that channel; a file in no channel opens the viewer in place (see 23:00–23:40)
- **CORRECTED 06:48 — recent searches ARE implemented and work.** The earlier entry ("not
  implemented") was an empty state: the list only appears once the account has *acted on* a
  search. Verified: `RECENT SEARCHES` section with per-entry `Remove from recent searches`,
  most-recent-first, survives a reload, and the removal survives a reload too. A query that is
  typed but never opened is **not** recorded — only one whose result the user opens
- Sort control **fully verified 03:50** — Relevance | Date | Alphabetical each produce a distinct
  order and Relevance round-trips; counts unchanged by sorting. Result rows are `div` in a
  `[role=listbox]`, **not** `button`/`a` — enumerating those finds no results at all
- **Dialog keyboard, all four advertised behaviours verified 03:49**: arrows move
  `aria-activedescendant` (the rows carry no `aria-selected` — the type tabs do), Enter opens the
  highlighted row (id resolved back to its body, no off-by-one), Cmd+Enter opens a new tab without
  navigating the current one, Escape closes without navigating
- Type tabs (client-side bucket switching, no redundant request); scope chips
- In-channel search; range scoping in calendar search
- Input boundaries: 500 chars, regex metacharacters, SQL/HTML-looking input, punctuation,
  whitespace trimming, NFD accents, Cyrillic and emoji filename matching
- Sub-minimum queries fall back to a local filter rather than erroring

**Archived channels (added 03:34 — read the 03:06 section BEFORE testing search here)**
- The sidebar's `Open archived channels` panel lists them, `Open` navigates correctly, the channel
  renders its history read-only with a banner and no composer, and `Unarchive channel` is offered
  where the account has the permission (absent otherwise — that is `ALK-1442`'s fix, not a bug)
- The file `Share…` picker correctly excludes archived channels as targets
- The panel's description ("Select a channel to restore it") misdescribes the click, which opens
  rather than restores — measured, logged at 03:33, deliberately not reported as copy trivia
- **Broken and reported:** search drops everything in an archived channel although the server
  returns it flagged (BUG-17), and `Search in channel` inside one issues no request at all and
  shows no state (BUG-18, 7 runs, both archived channels, live control in the same run)
- Already someone else's and confirmed reproducing: `ALK-2772` (`No activity yet` on a channel that
  has messages — the archived list response carries no activity field at all)

**Settings (chrome)**
- **About (05:16)** — reports `v0.61.0-rc.5`, matching the deployed stamp exactly; a session can
  read the running version from inside the app. Its subtitle promises licences and help that the
  page does not contain — logged, not reported (help lives in the rail's `Help & resources`)
- **Account / Security (05:16)** — `Danger zone` says deactivation and deletion are not available
  yet and both controls are genuinely disabled; Security enumerated only, no credentials entered
- Settings nav renders all fourteen sections and each is reachable. **CLAUDE.md's route list is
  incomplete** — `settings/profile` and `settings/calls` exist and are not in it; read the nav
- `Sessions`: loads, `GET security/sessions` 200, current session marked, relative time correct
  (ALK-3005 reproduces — every session named "Unknown device")
- `Privacy & security`: fully enumerated. Unbuilt parts are honestly labelled and their controls
  disabled (`Request export`), gated parts explain the missing permission, Visibility says outright
  that it does not take effect yet
- Blocked users: picker, Block gating, and the `Unblock` path all work — ALK-3532's stated
  workaround is genuine

**Cross-cutting**
- Failure handling on Directories, Files, Calendar, **Search and the Notifications panel** (search added 03:55: a 500
  and an aborted request both give "Search error" + a working Retry, never a false "No results"): network abort, 500 and 403 all produce a
  clear message plus `Retry`, no stuck spinners, and **no raw `trace_id` or error key on screen**;
  Retry genuinely recovers
- Latency: a 5-second delay produces skeletons, never a false empty state — **including the
  search dialog (05:35)**: skeleton for the whole wait, `No results` never flashes, results and
  counts appear together
- **Cross-surface consistency re-checked on the current data (05:37)** — Files ↔ Search agree on
  all 14 files by exact filename; Directories ↔ `/workspaces/<ws>/members` ↔ `/presence` all
  report the same 7 people with no discrepancy either way
- Console/network sweep over nine routes: no uncaught exceptions, no unexpected 4xx/5xx
- Isolation between workspaces on all three content surfaces — search, files, and meeting creation —
  each with a positive control on the owning side
- Locale: Directories, Calendar, Files and the search dialog fully translated in Russian with no
  layout damage (finding 13 is the notification panel only)
- **Also translated, checked 06:05** — the archived-channels panel and its sidebar trigger, the
  archived-channel banner, the search dialog chrome and tab labels, and the file preview card
  (`Предпросмотр недоступен для этого типа`). No untranslated strings on any surface behind the
  post-midnight findings. Note the **English** archived-panel description is the wrong one; the
  Russian says the accurate thing
- **When switching language, wrap the whole test so the restore always runs** — the search
  button's `aria-label` is translated, so an English selector aborts the run mid-way and leaves
  the fixture in Russian; the language names in the picker are localised too (`Английский`)
- Layout at 1280×800 and 1440×900, and Russian at 1280: no page-level horizontal scroll, no
  unreachable controls, every clip on a deliberate `truncate`
- **Also 1920×1080 and 2560×1440 (05:24)** — five routes at each, zero page h-scroll, zero
  off-screen controls, zero real clipping. **Filter clipping checks with `clientWidth > 1`**, or
  `sr-only` text swamps the result (the calendar reports 211 "clipped" nodes without it)
- **Calendar navigation across the year boundary (05:07)** — Month forward to Feb 2027 and back to
  Nov 2025, Week across 28 Dec 2026 – 3 Jan 2027, headings and request windows all correct
- **Recently-closed fixes re-verified on this build (05:22)** — ALK-3017 (shared file moves the
  chat up the sidebar), ALK-3115 (search rows name channel/author/date), ALK-2884 (Public +
  Password both persist), ALK-2895 (full search restores its query on reload and cold open)
- **Meeting form (05:15–05:19)** — password works end to end and is never echoed back;
  `Custom RRULE` and `Room` are honestly disabled; `All day` is ALK-3109, In Progress
- Timezone: the calendar follows the browser zone and its GMT label agrees with it
- Account classes: a member in no channel, and a guest, both see exactly what their membership implies

## Plan — where the morning pass left coverage thin

The morning pass (10:44–11:44) covered directories, calendar creation/invitations/views,
files upload/download/viewer/filters/favourites, search dialog+messages, notifications bell.
It ended with 5 findings and an explicit "not reached" list. This pass targets what it
could not reach plus what the deploy changed recently.

Deploy-diff targets (recent commits touching sector E paths, so most likely to regress):
- `189a0eff9 fix(files): copy an Aloqa link for a file, not the API content route (ALK-3015)`
- `8ed4e3228 fix(files): Details preview fits and opens full view (ALK-3423)`
- `bf5c0a97a ALK-886: favourites answer for the viewer, not the file's owner`
- `af01859a5 fix(files): move a chat up the sidebar when a file is shared into it (ALK-3017)`
- `c5693e1f9 fix(calendar): name the meeting and give the early guest a way out (ALK-3389)`
- `c87e4506b fix(calendar): bound far-future join wake-ups`

Coverage-gap targets:
- Shell & navigation (8.7%, the sector's largest slice and the thinnest covered): sidebar
  channel list and ordering, rail, unread badges under live traffic, connection status,
  presence cross-user, notifications panel beyond the bell badge.
- **Workspace switcher, multi-workspace path** — untestable on the morning's fixtures because
  every lane-E account has exactly one workspace. Creating a second workspace unblocks it.
- Calendar: RSVP **end to end** (morning verified the buttons exist, not that they work),
  reminder **delivery**, join landing, meeting edit live path.
- Files: File Details for a file *sent into a channel* (the sector C/E border, ALK-3200).
- Search: date filters, sort, tabs, in-channel scoped search.

## Findings

## Shell & navigation — first sweep (14:40–15:15)

**Shell map (alice, 1920×1062, `/w/{ws}/c/{channelId}`).** 24 visible chrome controls outside `main`:
rail `Chat | Calls | Calendar | Files | Notifications | Settings | Help & resources | Profile`;
header `QA Workspace E | Open workspace menu | Collapse chat sidebar`;
sidebar `Search … | Mentions | Directories | Saved Messages | Channels | Add channel |
Open archived channels | <channels> | Direct messages | New direct message | Message requests`.

### Verified working

- **Sidebar collapse/expand.** Toggle flips label and layout cleanly and restores exactly:
```
expanded   main.left 372   channel rows x=78 w=287   toggle "Collapse chat sidebar"@335
collapsed  main.left 144   channel rows x=88 w=40    toggle "Expand chat sidebar"@88
re-expanded main.left 372  channel rows x=78 w=287   toggle "Collapse chat sidebar"@335
```
  ~~Collapsed state also persists across a reload~~ — **WRONG, corrected later in this log**
  (see "Sidebar collapse — my earlier claim was wrong"). It does not persist: `/files` simply
  *opens* collapsed, and my before/after happened to be taken there, so a route-specific default
  reproduced a persistence result exactly.
  While collapsed, the section headers and their row actions (`Add channel`,
  `Open archived channels`, `New direct message`, `Message requests`) are not rendered — the rail
  keeps only the channel icons. Expected for an icon rail, and expanding restores every control.
- **Message requests dialog.** `Message requests | Messages from people you have not chatted with.
  Accept a request to move it to Direct messages, or block the sender. | No message requests.`
  Correct empty state; Escape closes it.
- **Add channel dialog.** `Create a channel | Channel name | 0/128 | Topic | Visibility |
  Public | Private | Cancel | Create` with `Create` correctly disabled on an empty name.
- **Help & resources.** Opens `Help & shortcuts` listing Cmd/Ctrl+K, Cmd/Ctrl+N,
  Cmd/Ctrl+Shift+T, plus `Open docs`.
- **Archived-channels dialog lists the right channel** and `GET /users/me/channels/archived?workspace_id=…`
  fires on open (200).
- **Archived channel is read-only for a member, and says so.** As alice (member, not owner):
  screen reads `This channel is archived | Unarchive to send messages and re-enable notifications.`,
  the composer is **absent**, and Channel details shows `Archived[DIS]`, `Leave channel[DIS]` with
  `This channel is archived and cannot be changed.`

### Rig traps hit (my fault, not the product's) — recorded so they are not re-run

- A first panel sweep reported `Message requests` and `Open archived channels` as **inert**
  (no dialog, no navigation). False: both open a modal. My `vis()` helper hit-tests an element at
  its own centre, and a `[role=dialog]` container fails that test because its centre is covered by
  its own backdrop/children. **Containers must not be hit-tested — only leaf controls.** Proof the
  clicks landed: `bodyKids` 12→16, `[role=dialog]` 0→1, `elementFromPoint` at the button centre
  became `DIV.aloqa-modal-backdrop`.
- `page.locator('[role=dialog]').last().locator('button:has-text("Open"))')` timed out while the
  button was demonstrably actionable (36×36, opacity 1, `pointer-events:auto`, `disabled:false`,
  hit-tests to itself). Playwright's role-based `[role=dialog]` resolved to a different node than
  the attribute selector did. `getByRole('button',{name:'Open',exact:true})` works.

### Measured: "Open" on an archived channel does not restore it

Dialog copy (exact): `Archived channels — Channels archived in this workspace. Select a channel
to restore it.` The row action a **member** gets is `Open`, and it only navigates:
```
before   active [qa-general, qa-private]   archived [qa-archived]
click Open -> /w/{ws}/c/C4QEARCHIVE0001
requests fired: only GETs (channel, pinned, members, read-state, messages) — no unarchive call
after    active [qa-general, qa-private]   archived [qa-archived]     (unchanged)
composer: ABSENT      screen: "This channel is archived | Unarchive to send messages…"
```
As the **owner** the same dialog row instead offers `Unarchive`, and the channel screen carries an
`Unarchive channel` button. So the affordance is role-dependent while the copy is not:
for a non-owner the dialog instructs an action the dialog does not offer.
**Low, and channel archive/unarchive itself is sector C's** — logged, not reported.

Secondary oddity, same screens: the owner's Channel details panel says
`This channel is archived and cannot be changed.` and renders `Archived[DIS]`, while the very
same screen behind the panel offers the owner a working `Unarchive channel` button. Low, logged.

## Workspace switcher — multi-workspace path unblocked (15:00)

The morning pass could not test this: every lane-E account is in exactly one workspace. I
created a second one **through the UI**, which also exercises the create flow.

**Create-workspace dialog — verified working.** `Open workspace menu → Create workspace` opens
`Create workspace | Create in | Personal workspace | Name | Use 2 to 128 characters. | Cancel | Create`.
Name validation matches its own hint exactly:
```
""      (0 chars)   Create disabled
"A"     (1)         Create disabled
"Ab"    (2)         Create ENABLED
128 ch  (128)       Create ENABLED
129 ch  -> input truncates to 128, Create ENABLED   (maxlength enforced)
"   "   (3 spaces)  Create disabled                 (trims before validating)
```
Created `QA E Second` → `POST /api/v1/workspaces` **200**, dialog closed on its own, app
navigated to `/w/W4OWJSPNXQJYZ5R/directories`.
**New workspace id `W4OWJSPNXQJYZ5R` — a lane-E leftover, see housekeeping.**

**Switching — verified working, both directions.**
```
in QA Workspace E:  menu = "WORKSPACES | QE QA E Second | QW QA Workspace E [Current] | Create workspace"
                    items = "Switch to QA E Second | QA Workspace E | Create workspace"
click "Switch to QA E Second"
  -> /w/W4OWJSPNXQJYZ5R/directories
     header "QA E Second"   search button "Search QA E Second"   rail "QA E Second"
     channel list empty     main = new-workspace onboarding
in QA E Second:     menu = "WORKSPACES | QE QA E Second [Current] | QW QA Workspace E | Create workspace"
                    items = "QA E Second | Switch to QA Workspace E | Create workspace"
```
The `Current` marker moves correctly, and the `Switch to …` accessible name is present only on
the non-current row. Every piece of chrome re-labels — no stale workspace name anywhere.

**Workspace persistence — verified working.** After switching to the second workspace:
`reload()` → still `/w/W4OWJSPNXQJYZ5R/directories`; navigating to bare `/` → resolves to
`/w/W4OWJSPNXQJYZ5R/directories`. Last-used workspace is remembered.

## Notifications are a global inbox — verified working, including cross-workspace

The bell reads the same in both workspaces, and the panel agrees with the badge in both:
```
in W4QEF1XTURESO01   bell "Notifications, 2 unread"  badge "2"  panel lists 2 rows
in W4OWJSPNXQJYZ5R   bell "Notifications, 2 unread"  badge "2"  panel lists the same 2 rows
GET /api/v1/notifications?limit=20 -> 200, 2 items, both workspace_id W4QEF1XTURESO01
```
So notifications are account-global rather than per-workspace, and badge/panel/API all agree.

**Cross-workspace click-through — verified working.** Clicking a notification that belongs to
the *other* workspace switches workspace and lands on the right meeting:
```
from its own workspace:   /w/W4QEF1XTURESO01/directories
  -> /w/W4QEF1XTURESO01/calendar/S4OWB38X0FRCCS3    bell 2 unread -> 1 unread
from the other workspace: /w/W4OWJSPNXQJYZ5R/directories
  -> /w/W4QEF1XTURESO01/calendar/S4OWB38X0FRCCS3    bell 1 unread -> "Notifications" (0)
```
The badge decrements on each click and the panel stays open. Only cosmetic gap: the row's scope
label reads `System · Workspace` with no workspace *name*, so while in the second workspace
there is nothing on the row saying it belongs to the first. Low, logged, not reported.

### Withdrawn (1) — "clicking a notification does nothing"

Measured twice as: URL unchanged over 6.4 s, badge unchanged, panel still open. **My own
selector's fault, not the product's.** The row is a `<BUTTON>` nested inside an `<LI>`, and my
query matched the `<LI>` wrapper first:
```
chain from the row text outward:
  SPAN.block truncate -> SPAN.min-w-0 flex-1 -> BUTTON *CLICKABLE* -> LI -> UL -> DIV
clicked <LI>    -> no navigation, bell "Notifications, 2 unread" unchanged
clicked <BUTTON> -> navigates, bell decrements
```
Killed before it reached the report. Same family as the morning pass's selector failures:
enumerate the clickable ancestor, don't assume the row you can see is the row that handles clicks.

## Reminder delivery — observed firing (morning pass could not reach this)

Alice's two unread notifications were **meeting reminders**, not invitations:
```
"QA-E Sync 1 renamed" starts soon — Aug 26, 2026 3:00 PM (Asia/Tashkent)   Aug 26, 02:50 PM
"QA-E Sync 1 renamed" starts soon — Aug 26, 2026 3:00 PM (Asia/Tashkent)   Aug 26, 02:30 PM
GET /api/v1/notifications -> both type 3, workspace_id W4QEF1XTURESO01
```
Two reminders for one 15:00 meeting, delivered at T-30 min and T-10 min. Consistent with two
configured reminder offsets rather than a duplicate, so **not written up as a duplicate-delivery
bug** — but both carry byte-identical body text (`starts soon`), so the two are
indistinguishable in the panel. Logged; needs product intent before anyone files it.

## Presence (15:30)

### BUG-1 [Medium] [frontend] Directories → People не показывает онлайн-статус, хотя данные есть в ответе и статус рисуется на других экранах

The People tab of Directories is the workspace's "who is here" screen, and it is the only
member-list surface that renders no presence at all.

**The data is present in the directory's own payload:**
```
GET /api/v1/workspaces/{ws}/members -> 200
{"members":[{"user_id":"U…ADMIN…","name":"QA Admin","username":"qa_e_admin","is_guest":false,
             "presence":{"online":false}, "roles":[…]}, …]}
per-member presence: Admin=off Alice=ON Bob=ON Carol=off Dave=off Guest=off Owner=ON

GET /api/v1/workspaces/{ws}/presence -> 200
{"presences":[{"user_id":"U…ADMIN…","online":false},{"user_id":"U…ALICE…","online":true},
              {"user_id":"U…BOB…","online":true},{"user_id":"U…CAROL…","online":false},…]}
```
Alice/Bob/Owner were exactly the three signed-in browsers, so the flags are correct.

**The rows render none of it** — zero status nodes on every row:
```
QA QA Admin Call Message -> statusNodes:0     QA QA Alice          -> statusNodes:0
QB QA Bob   Call Message -> statusNodes:0     QC QA Carol Call Msg -> statusNodes:0
QD QA Dave  Call Message -> statusNodes:0     QG QA Guest Call Msg -> statusNodes:0
QO QA Owner Call Message -> statusNodes:0
```
Proof of absence rather than a selector miss — full-subtree diff of an **online** member's row
against an **offline** one. Both 14 nodes, structurally identical; the only three differing lines
carry the person's own name:
```
#0  ONLINE : BUTTON|…|aria-label=Open QA Bob's profile
    OFFLINE: BUTTON|…|aria-label=Open QA Carol's profile
#1  ONLINE : DIV|relative inline-flex shrink-0 h-[var(--aloqa-avatar-sm)]…|aria-label=QA Bob
    OFFLINE: DIV|relative inline-flex shrink-0 h-[var(--aloqa-avatar-sm)]…|aria-label=QA Carol
#5  BUTTON, the name button — same difference
```

**Other surfaces render it from the same data,** so this is one screen, not a missing feature:
```
Channel members panel:  QA Admin / Status: Offline | QA Alice / Status: Online |
                        QA Bob / Status: Online | QA Carol / Status: Offline |
                        QA Guest / Status: Offline | QA Owner / Status: Online
Profile popup QA Bob   (online):  avatar dot span class -> bg-green
Profile popup QA Carol (offline): avatar dot span class -> bg-status-offline
```
That popup is opened *from* the very row that shows nothing.

**Подтверждённая причина (source, citable):**
- `apps/web/src/features/directories/types/directories.types.ts:12` — `DirectoryPerson` carries
  no presence field (`avatarColor, avatarUrl, department, displayName, email, position, userId`).
- `apps/web/src/features/directories/DirectoryPersonRow.tsx:50-56` — renders
  `<Avatar aria-hidden color name size="sm" src />`, with **no `status` prop**.
- `packages/ui-kit-web/src/Avatar.tsx:124` — the dot renders only `if (status !== undefined)`;
  `packages/ui-kit-web/src/AvatarShell/AvatarShell.tsx:35` is the wrapper that passes `status={presence}`.
- `grep -rn "presence\|online" apps/web/src/features/directories/` → **no matches**.

Reproduced on two fresh loads.

**Dedup — read in full, not a duplicate of any open ALK bug:**
- **ALK-2929** `[FE-WEB][PRESENCE] Собственный статус остаётся Offline…` — the viewer's *own*
  status in the Sidebar, root-caused to `useSidebar.ts:99-102`. Different surface, different data path.
- **ALK-2931** `[FE-WEB][DIRECTORIES] Заблокированный пользователь не перемещается в конец списка`
  — **adjacent, and a merge candidate worth telling a filer about.** Same files
  (`directories/utils/directories.ts` `buildDirectoryPeople`, `directories.types.ts`,
  `DirectoryPeopleList.tsx`) and the same *shape* — "статус blocked user не передаётся в
  DirectoryPerson". Different field (blocked vs presence) and different symptom (sort order vs a
  missing indicator), so not the same bug, but one fix to `DirectoryPerson` + `buildDirectoryPeople`
  would carry both.
- **ALK-3521 / ALK-2931** blocked-user affordances in Directories — unrelated symptom.

### Reproduced an already-open bug — not filed

The `/ Status: Offline` leading slash in the channel members panel is **ALK-3021**
(`[FE-WEB][CHAT] В списке участников канала строка статуса начинается с лишней косой черты`),
open in Backlog with a confirmed root cause. Observed here verbatim on every row
(`QA Admin | / Status: Offline`). Not filed, not reported.

## Directories — verified working (this pass)

- **Profile popup** opens from a row and is correct:
  `QA Bob | Message | Call | Block | Share | SHARED CHANNELS · 2 | qa-general | qa-private`.
  Shared-channel counts match the fixtures for both accounts probed (Bob 2, Carol 1).
- **Own row carries no Call/Message action** (`QA QA Alice` renders without them) while every other
  row has both — correct self-handling.
- **Channel members panel presence matches the presence API exactly**, guest included.
- **Presence API itself is accurate**: `online:true` for exactly the three accounts with a live
  signed-in browser, `false` for the four without.

## Connection status — verified working (15:25)

The outage was real, not just a flag flip: while offline a same-origin fetch **threw**, and it
recovered afterwards.
```
page.context().setOffline(true)
  fetch('/api/v1/auth/me')  ->  THREW TypeError: Failed to fetch
page.context().setOffline(false)
  fetch('/api/v1/auth/me')  ->  status 200
```
The indicator, read off its own element rather than off page text:
```
before offline   [data-testid="connection-status-indicator"]  ABSENT
during offline   VIS "Waiting for network…" role=status aria-live=polite @861,12 spinner=yes
after recovery   ABSENT
```
Appears ~1.2 s after the drop — consistent with `VISIBILITY_DELAY_MS = 800` in
`packages/core/src/state/queries/connectionIndicator.ts:19` — and clears on the next tick.
Centred pill at the top of a 1920-wide viewport, polite live region, spinner present.
Client-side navigation still worked while offline (`/c/C4QEGENERAL0001` → `/c/C4QEPRIVATE0001`).

### Withdrawn (2) — "the offline indicator reads 'Waiting network…' (missing 'for')"

**My own measurement artifact.** I detected the banner by diffing `document.body.innerText`
word-by-word against a pre-offline snapshot, keeping only words absent from the before-text.
The word `for` occurs elsewhere on the page, so the filter deleted it and the banner appeared
in my output as `Waiting network…`. Reading the element directly gives `Waiting for network…`,
matching `packages/core/src/i18n/dictionaries/en.ts:1456`
(`'connection.waitingForNetwork': 'Waiting for network…'`, verified at the deployed sha). Killed before it reached the report.
Lesson for the rest of this pass: **a word-level text diff is not a copy measurement** — read
the element.

Note the first offline probe also reported "no banner at all", which was likewise wrong: my
keyword list (`reconnect|connection|offline|подключ|…`) simply did not contain "waiting for
network". The element has a `data-testid`; that is what to read.

## Calendar — RSVP (15:30)

### BUG-2 [High] [backend] Приглашённый не может ответить на приглашение, если открыл встречу по её ссылке — именно туда и ведёт уведомление о приглашении

The invitee's `Yes` / `No` are permanently disabled when the meeting card is opened by its own
URL, and **that URL is where the invitation notification lands**. Opening the identical meeting
from the calendar grid enables the same two controls.

**A/B on the same meeting, same account, back to back** (`QA-E RSVP three`, invitee bob):
```
A. goto /w/{ws}/calendar/{meetingId}      16 samples over 16 s -> Yes:DIS,No:DIS   (never changed)
B. calendar grid, click the event chip    10 samples over  8 s -> Yes:en, No:en
C. goto /w/{ws}/calendar/{meetingId}      16 samples over 16 s -> Yes:DIS,No:DIS   (repeat of A)
```
Not a loading state: the trace never changes across 16 s, twice. Not a permissions state:
`Invite by email` next to it renders `disabled=false, opacity 1` in the same card, while
`Yes`/`No` are `disabled=true, opacity 0.5, pointer-events:auto, rect 143x36`.

**The full user path, measured end to end as bob:**
```
GET /api/v1/notifications -> "Meeting invitation", qa_e_alice · Workspace, "You've been inv…"
click that row in the bell panel
  -> /w/W4QEF1XTURESO01/calendar/S4OWKW57UWOK0WU
card: "QA-E RSVP three | … | Scheduled by QA Alice | … | Your response | Yes | No"
10 samples over 9 s -> Yes:DIS,No:DIS
```
So the notification delivers the invitee to a card where the invitation cannot be answered.

**Фактический результат — the payload difference.** Same meeting, same user, two endpoints.
The list endpoint the grid uses returns `my_status`; the by-id endpoint the deep link uses
returns the same object **minus that one field**:
```
GET /api/v1/calendar/meetings?workspace_id=…&from=…&to=…      -> 200 (4658 B)
  keys: …,participant_count,my_status,conflict_count,requires_approval,…
  my_status: "pending"      attendees: ABSENT

GET /api/v1/calendar/meetings/S4OWKW57UWOK0WU                 -> 200 (649 B)
  keys: …,participant_count,conflict_count,requires_approval,…
  my_status: ABSENT         attendees: ABSENT      participant_count: 0
```
`my_status` is the only difference between the two key lists.

**Подтверждённая причина.** The response arrives without the field, so nothing in the client
dropped it — that puts the omission on the by-id endpoint. Downstream it is deterministic:
`packages/features/calendar/model/scheduledMeetingRsvp.ts:25-26` treats a missing `my_status` as
a legacy response and falls back to the attendee row; `attendees` is absent too, so it returns
`isEligible: false`, and `packages/features/calendar/ui-web/RsvpSegment.tsx:33`
(`isDisabled = mutation.isPending || isAuthLoading || !isCurrentUserAttendee`) disables both buttons.

**Not a bug, checked and ruled out:** the *organiser's* own `Yes`/`No` are also disabled, on
both paths. That is deliberate — `scheduledMeetingRsvp.ts:12` returns `isEligible:false` when
`event.organizer_id === currentUserId`. Also ruled out: a non-invitee. `QA-E RSVP probe`
(bob not invited) is correctly disabled via the grid too, so "disabled" is not universal —
it tracks invitation status everywhere except the deep-link path.

**Как должно быть.** Приглашённый, открывший встречу по ссылке из уведомления, может ответить
`Yes`/`No` так же, как из сетки календаря.

### RSVP on the working path — verified working (the other half of the round trip)

```
bob, card opened from the grid chip:
  before  Yes:en:pressed=false  No:en:pressed=false
  click Yes -> POST /api/v1/calendar/meetings/{id}/respond -> 200
     {"id":"SA…","scheduled_event_id":"S…","user_id":"U…BOB…","invited_by":"U…ALICE…",
      "status":"accepted","responded_at":"2026-08-26T10:31:45Z",…}
  after   Yes:en:pressed=true   No:en:pressed=false
  after a full reload + re-open: Yes:en:pressed=true   (persisted)

alice (organiser), same meeting:
  "QA Bob | optional | Yes | Responded Aug 26, 2026, 15:31"
```
The response is written, reflected in `aria-pressed`, survives reload, and reaches the
organiser's card with a timestamp. The feature works — only the deep-link entry point is dead.

## Calendar — other verified working / notes

- **Meeting creation with an invitee — verified working.** Member picker search (`Bob`) filters
  to the right person, picking shows `Selected (1) QA Bob`, and
  `POST /api/v1/calendar/meetings` → 200 with the correct `starts_at`/`ends_at` in
  `Asia/Tashkent`. Invitation notification reaches the invitee.
- **Public meetings are visible workspace-wide** — bob sees all 7 of the day's meetings in the
  grid, including ones he was not invited to, consistent with "Anyone in the workspace can join".
- **Meeting dialog field map** (useful for later sessions): `input[data-field="event-title"]`,
  `event-start` / `event-start-time` / `event-end` / `event-end-time`,
  radio `name="scheduled-meeting-access"` (public|private), and the member/email pickers as
  `input[placeholder="Search members"]` / `input[placeholder="Invite by email"]`.
- **Low, logged not reported:** those last two inputs carry a `placeholder` but **no
  `aria-label`** and no associated `<label>`, unlike every other field in the same dialog
  (`Add title`, `Starts date`, `Starts time`, `Ends date`, `Ends time` all have `aria-label`).

### Rig traps hit (mine, not the product's)

- `chips: []` after creating a meeting looked like "the chip never appeared". It had: all seven
  chips sit at `y=1062…1454` on a 1062-high viewport — **below the fold**, and my `vis()` helper
  hit-tests at the element centre, which fails off-screen. CLAUDE.md already warns that calendar
  chips need `scrollIntoViewIfNeeded()`; the same applies to *measuring* them, not just clicking.
- Two meetings were created without their invitee because my picker click hit the `<LI>` wrapper
  instead of the `<BUTTON>` inside it — the same failure as the notification row earlier today.
  Added `CLICKDEEPEST` to `snip/e-p2-helpers.mjs`: it picks the innermost matching clickable
  (the candidate containing no other candidate). First use produced `clicked <BUTTON> "QA Bob"`
  and `Selected (1)`.
- `input[aria-label="Search members"]` does not exist — that string is the **placeholder**. My
  own field dump had printed `aria-label || placeholder`, which hid the difference. Dump raw
  attributes when deriving selectors from a dump.

### BUG-2 dedup — read in full, not a duplicate

- **ALK-3539** `[BE][CALENDAR] Список участников встречи отдаётся только организатору…` — the
  morning pass's finding, now filed. It is about **`attendees`** missing from
  `GET /calendar/meetings/{id}`, so an invitee cannot see *who else* is invited. Informational.
  Mine is about **`my_status`** missing from the same response, so the invitee cannot **respond
  at all** on the deep-link path. Different field, different impact, and ALK-3539 does not
  mention the deep-link/grid asymmetry — its own «Проверка» even assumes the invitee's Yes/No
  still saves.
  **Для триажа:** the two are adjacent and one fix may cover both — if `attendees` starts coming
  back on the by-id endpoint, `scheduledMeetingRsvp.ts:26` would find the invitee in it and
  `isEligible` would become true even with `my_status` still absent. Worth linking the tickets.
- **ALK-3014** `Ссылка на удалённую встречу открывает карточку без сообщения об отмене` — also a
  deep-link-to-a-meeting bug, but about a *deleted* meeting and a missing cancellation notice.
  Different.
- **ALK-2978 / ALK-3026 / ALK-2981** — declined meeting lingering in the grid, and calendar
  search misses. Unrelated symptoms.

## Calendar — entry points and edit (15:45)

### Verified working

- **Week-grid cell → create.** The week view renders 168 cells (7 days × 24 h),
  `button[aria-label="Create event <Weekday> at <H>:00"]`. Clicking
  `Create event Wednesday at 23:00` opens `Schedule meeting` pre-filled with the clicked slot:
```
event-start-time=23:00   event-end-time=23:30
dialog summary: "Wed, Aug 26 · 11:00 PM – 11:30 PM · 30 min"
```
  Correct day and correct hour, with the default 30-minute duration applied.
- **Meeting Edit opens and is correctly pre-filled**, with date and time exposed as **buttons**
  that open a picker rather than as native inputs:
```
card controls: Close | Yes[D] | No[D] | Invite by email | Start meeting[D] | Edit | Delete
Edit dialog "Edit meeting":
  input aria-label="Add title" data-field="event-title" value="QA-E RSVP probe"
  button "Date and time: Aug 26, 06:00 PM"
  button "End date and time: Aug 26, 06:30 PM"
  radios scheduled-meeting-access public|private, duration presets, Cancel | Save
picker opened from that button: Date | Time  ->  date=2026-08-26  time=18:00
```
  The button label, the picker value and the card all agree (18:00 = 06:00 PM).

### Withdrawn (3) — "Edit shows 06:00 for an 18:00 meeting"

Looked like a 12-hour format printed without its AM/PM suffix. **My own truncation.** The
`CLICKDEEPEST` helper returns `nameOf(target).slice(0,28)`, and the full label is
`Date and time: Aug 26, 06:00 PM` — exactly 31 characters, so the slice ate ` PM`. Reading the
button labels in full, across three meetings, every one is right:
```
18:00–18:30  ->  "Aug 26, 06:00 PM" / "Aug 26, 06:30 PM"
22:00–22:30  ->  "Aug 26, 10:00 PM" / "Aug 26, 10:30 PM"
```
Killed before it reached the report. **A truncated label is not a copy measurement** — the same
lesson as withdrawal (2), in a different costume. Both of today's copy false-positives came from
my own string slicing, not from the app.

**Low, logged not reported:** the chip and the meeting card render 24-hour times
(`18:00–18:30`), while the Edit form renders 12-hour (`06:00 PM`) — two formats inside one flow.
Plausibly deliberate; not written up.

## Files (15:40–16:00) — regression pass over the module's recent fixes

The three most recent commits touching `files` all landed since the last full files pass, so I
targeted them directly. **All three hold.**

- **ALK-3015 `copy an Aloqa link for a file, not the API content route` — verified working.**
  Hooking `navigator.clipboard.writeText` before clicking `Copy link` in File Details:
```
clipboard <- "https://airion-cargo.store/w/W4QEF1XTURESO01/files?file=F4OWBD79HC09BRJ"
```
  An app route, not `/api/v1/files/{id}/content`. And the link resolves correctly for both roles:
```
as the owner:        opens /w/{ws}/files?file={id}, preview panel opens, image renders
                     GET /api/v1/files/{id}/content -> 200 image/png
as another member:   screen reads "This file could not b…", no panel opens
                     GET /api/v1/files/{id}/content -> 403
```
  So the link is shareable without leaking the file.
- **ALK-3423 `превью в панели Details вписывается целиком и открывает полный просмотр` —
  verified working.** `natural 64x64, rendered 299x196, object-fit: contain`, and the panel
  offers `Open full-size image`. The preview is letterboxed, not cropped.
- **ALK-3017 `move a chat up the sidebar when a file is shared into it` — verified working.**
```
sidebar before:  qa-general@y253  qa-private@y286
share qa-e-image.png into #qa-private:
  POST /api/v1/files/{id}/shares   -> 200  {"type":"channel","target_id":"C4QEPRIVATE0001",…}
  POST /api/v1/messaging/messages  -> 200  {"channel_id":"C4QEPRIVATE0001","files":[…]}
sidebar after:   qa-private@y253  qa-general@y286
after reload:    qa-private@y253  qa-general@y286
```
  The channel moves to the top immediately and the order survives a reload.

### Also verified working

- **Favourite toggle reads live state everywhere.** One row, watched through a toggle:
```
API   qa-e-note.txt:false        hover button "Favorite"        menu "… | Favorite | …"
click Favorite
API   qa-e-note.txt:true         hover button "Remove favorite" menu "… | Remove favorite | …"
```
- **Share-to-chat dialog** (`Share file to a chat`): lists `#qa-general`, `#qa-private`, a
  people/channel search, an optional message, and a live `Preview | How it appears in chat`.
  `Send` is correctly disabled until a target is chosen (`Choose where to send`).
- **Cross-user visibility of a channel-shared file — correct.** After the share, as bob:
  `scope=own -> 0 files`, `scope=accessible -> 1 file (qa-e-image.png)`, and the
  `Shared with me` tab shows it (`1 file · Shared with me · 7.9 KB`). Before the share bob saw
  nothing in either scope.
- **File Details reflects the channel share**: `SHARED WITH | 1 | #qa-private | Channel`
  (it read `Not shared with anyone yet.` before).
- **File row hover actions**: hovering a tile reveals `Select <name>`, the favourite toggle and
  `More actions`; only one `More actions` button is visible at a time.

### Reproduced an already-open bug — not filed

**ALK-3200** `[FE-WEB][FILES] Название канала в File Details не открывает исходный канал`, open
in Backlog. Reproduced exactly on this build now that a file has actually been sent into a
channel (the morning pass could not test it — its files were uploaded directly):
```
#qa-private row in File Details, ancestor chain from the text outward:
  <SPAN> cls=min-w-0 flex-1 truncate  cursor=auto  tabindex=-
  <DIV>  cls=group flex items-center  cursor=auto  tabindex=-
  <DIV>  <SECTION> <DIV>              cursor=auto  tabindex=-
no BUTTON or A anywhere in the chain; click -> URL unchanged over 6 s
```
Not reported. Recorded because it closes out the morning pass's open question about this border.

### Environment artifact — not a product defect

One run died with Playwright `Page crashed` while the Share dialog was open, which looks exactly
like a tab crash caused by that dialog. It was not: all three lane-E browsers were down
immediately afterwards, **including two that were not running any snippet**, because a parallel
session closed every rig browser at that moment. Re-ran the identical snippet after relaunching
and it completed cleanly. Logged so nobody re-files it as a Critical.

### Low, logged not reported

- `Shared with me` shows `CHATS | Chat filtering is not available for shared files yet.` — an
  honest not-built-yet message, but it sits where a filter control does for `My files`.
- The `FILE TYPE` counters still read `2 loaded` / `1 loaded` — the morning pass already logged
  "loaded" as leaking client-side pagination into user-facing copy.

## Search (16:00)

### Verified working

- **Message search and per-tab counts.** `probe` →
  `All 4 | Messages 4 | Channels 0 | People 0 | Files 0`, and the rows carry channel, body and
  author (`#qa-general | search index probe zarplexmt9oq1kn | QA Alice · Aug 26, 2026`).
  Request: `GET /api/v1/search?q=probe&company_id=…&workspace_id=…&limit=25` → 200 with
  `highlight` markup (`search index <em>probe</em> zarplexmt9oq1kn`).
- **File search finds files.** `qa-e-image` → `All 2 | Files 2`.
- **Typed filter `:in #channel` — verified working.** Typing `:in #qa-general probe` strips the
  filter out of `q` and scopes the request:
```
q=probe&company_id=…&workspace_id=…&channel_ids=C4QEGENERAL0001&limit=25
```
  The channel id is resolved from the `#name` the user typed.
- **Date filter chips register correctly.** Default is `All time`:
```
initial            Last 7 days pressed=false | Last 30 days pressed=false | All time pressed=true  (bg-accent)
click Last 7 days  Last 7 days pressed=true  (bg-accent) | others pressed=false
click Last 30 days Last 30 days pressed=true (bg-accent) | others pressed=false
```

### Inconclusive — not reported

**Do the date chips actually filter?** Cannot be answered on lane E. Clicking `Last 7 days` /
`Last 30 days` re-issues a request with **no date parameter**, which on its own looks like a
filter that does nothing:
```
Last 7 days   -> q=probe&company_id=…&workspace_id=…&channel_ids=…&limit=25
Last 30 days  -> q=probe&company_id=…&workspace_id=…&channel_ids=…&limit=25   (identical)
All time      -> no new request
counts stayed All=4 Msg=4 for all three
```
But the absent parameter is expected: the filtering is done **client-side**.
`packages/core/src/state/queries/search.ts:182-196` `filterResponseByDateRange` drops results
whose `createdAt` is older than `createDateCutoffMs` (line 222-223), and line 108-109 puts
`dateRange` in the React-Query **cache key**, not in the URL. Identical counts are also the
correct answer here: every message and file in lane E was created within the last two days, so
all three windows should return the same 4 results.
**To actually test this** a session needs content older than 7 days in its lane — seed a message
with a backdated `created_at`, or run it in a lane that has aged. Recorded rather than reported;
reporting it would have been a false positive built on unfalsifiable data.

### Reproduced already-open bugs — not filed

- **People and Channels always return 0.** `Channels 0 | People 0` for every query tried
  (`probe`, `zarplex`, `qa-e-image`, `png`). This is the morning pass's BUG-2 and is already in
  that session's published report; not re-reported here.
- **File search matches loosely**: `qa-e-image` returns **2** files, but only one file is named
  `qa-e-image.png` — the other is `qa-e-note.txt`. Morning pass's BUG-3, already reported.
  Also observed: `png` alone returns 0 while `qa-e-image` returns 2, so matching is on
  hyphen/dot-split tokens rather than substrings or the extension.

## State-depth pass — the same screens as other roles (16:10)

### qa.e.dave — in the workspace, in **no channel**

- **Directories/People — correct.** Sees all 7 members; his own row correctly has no
  Call/Message while every other row has both.
- **Directories/Channels — correct.** Sees exactly the two public channels he is not in
  (`qa-empty`, `qa-general`), each offering `Join`. The **private** channel and the **archived**
  channel are both correctly absent.
- **Sidebar — correct empty state.** No channel rows at all; rail intact
  (`Chat | Calls | Calendar | Files`).
- **Files — correct.** `0 B of 10 GB used · 0 files`, empty list.
- **Mentions — clean empty state**: `All (0) | Unread (0) | No mentions yet | When someone
  mentions you in a channel or direct message, it will appear here.`
- **Saved Messages — clean empty state** (see the withdrawal note below):
  `Saved Messages | Nothing saved yet | Bookmark any message to keep it here. |
  Enter to send · Shift+Enter for new line`.

### Not re-discovered — a false positive already withdrawn twice by other sessions

`main.innerText` on Saved Messages returns
`Pinned message | : (no message text) | View all (0) | Start this channel | Add teammates before
starting the conversation | Add users`, which reads as channel chrome leaking into a
non-channel screen. **It is the known `ChatChromeTransition` artifact**, withdrawn by run
08-25-B and again by run 08-26-C. Confirmed here rather than assumed:
```
node                                            rect         chainOpacity  vis    hitIsSelf
"Pinned message"                                 …@…          0             false  false
": (no message text)"                            146x24@94    0             false  false
"View all (0)"                                   99x36@75     0             false  false
"Start this channel"                             1259x26@77   0             false  false
"Add teammates before starting the conversation" 1259x24@103  0             false  false
```
Every one has an effective opacity of 0 and fails its own hit test. The visible leaf text is the
clean empty state quoted above. **The dedup-against-withdrawals sweep earned its place here** —
without it this would have been a third re-discovery.

### Public meetings are visible to every workspace member — verified working

Both a channel member (bob) and a member in no channel (dave) see all 7 of the day's chips,
and the list endpoint agrees for both (`n: 7`).

### Supporting evidence for BUG-2 — `my_status` is a real per-viewer field

The same list request, as two different accounts, returns a **different** `my_status` per viewer:
```
as dave (invited to nothing):
  QA-E Sync 1 renamed  my_status=workspace_member   QA-E RSVP three  my_status=workspace_member
  … all 7 rows: workspace_member
as bob:
  QA-E Sync 1 renamed  my_status=pending            QA-E Sync 3      my_status=pending
  QA-E Verify Invite   my_status=pending            QA-E RSVP three  my_status=accepted
  QA-E RSVP probe      my_status=workspace_member   QA-E RSVP two    my_status=workspace_member
```
`accepted` is bob's own RSVP from earlier, so the field is live and per-viewer. It carries exactly
the four states `scheduledMeetingRsvp.ts` switches on, and `workspace_member` correctly reaches
the fail-closed branch for a non-invitee. This is the field the by-id endpoint omits entirely —
which is why a genuine invitee is treated as a non-invitee on the deep-link path.

## Notifications — Mark all as read (16:20)

**Verified working, and a candidate finding killed by reading the source.**

```
bell before          "Notifications, 4 unread"  badge "4"
GET /api/v1/notifications?limit=30            -> 4 items, 4 unread
click "Mark all as read"
  POST /api/v1/notifications/read             -> 200 {"marked_count":4}
bell trace (10 samples over 6 s)              -> "Notifications" badge ""   (immediate, stable)
GET /api/v1/notifications?limit=30            -> {"notifications":[],"total":0,"unread_count":0}
after a full reload                           -> badge still empty
```
Badge clears immediately and the state survives a reload.

**The notifications are deleted, not marked — and that is deliberate.** Worth recording because
it looks exactly like data loss from a non-destructive control. The API reports `total: 0`, not
"4 read", and no query variant brings them back:
```
notifications?limit=30                    -> 200 items=0 {"notifications":[],"total":0,"unread_count":0}
notifications?limit=30&is_read=true       -> 200 items=0 (same body)
notifications?limit=30&status=read        -> 200 items=0 (same body)
notifications?limit=30&unread_only=false  -> 200 items=0 (same body)
panel: "Notifications | Mark all as read | All caught up | No notifications yet."
```
Confirmed against the database rather than inferred — bob had 4 notifications before the click:
```
SELECT user_id, count(*), count(*) FILTER (WHERE read), count(*) FILTER (WHERE NOT read)
  FROM notifications WHERE user_id IN ('U…BOB…','U…ALICE…') GROUP BY user_id;
  -> only alice's row returned: U…ALICE…|1|0|1
     bob: no rows at all
```
**Not a defect.** `notification-service/internal/features/v1/notification/repository/
notification_repository/mark_as_read.go:10-14` states the intent in its own comment:
"MarkAsRead удаляет прочитанные уведомления безвозвратно (историю не храним — задача уведомления
считается выполненной, как только пользователь его увидел)", and the implementation is a
`DELETE FROM notifications … RETURNING id` plus a cascade delete of `notification_deliveries`.
So the product deliberately keeps no notification history, and `marked_count` is a delete count.

**Logged, not reported.** Reading the backend before filing turned what looked like a High
"Mark all as read destroys the user's notification history" into a documented design decision.

Two leftovers a future session may want to raise as product questions rather than bugs:
- the `notifications.read` boolean column exists and is never set to true by this path;
- after the action the panel reads **"No notifications yet."** — "yet" claims none ever arrived,
  when they arrived and were consumed. Copy nit, Low, not reported.

## Directories — join and leave (16:15)

**Join from the Channels tab — verified working.** As dave (in no channel):
```
sidebar before []      directory row: "qa-empty | PUBLIC | No topic | Join"
click Join -> POST /api/v1/channels/C4QEEMPTY000001/join -> 200 {"success":true}
sidebar after  ["qa-empty"]      app navigates into the channel
after reload   ["qa-empty"]
```
**Leave — verified working, with a clear confirmation.**
```
Channel details -> "Leave channel"
confirm dialog: "Leave channel | You will lose access to this channel unless you are added back. | Cancel | Leave"
click Leave -> POST /api/v1/channels/C4QEEMPTY000001/leave -> 200 {"success":true}
sidebar after []       GET /messaging/channels/C4QEEMPTY000001/members -> 403
```
Access is revoked immediately, and the fixture is back to its documented state
(`seed.sh --verify --lanes E`: `#qa-empty members=1`, all fixtures present and correct).

## Other roles — verified working

- **Guest** (`qa.e.guest`) sees the workspace correctly: member of `#qa-general` (with unread
  count), `Open` on it and `Join` on `qa-empty` in the Channels directory, private and archived
  channels absent, clean empty states on Files / Saved / Mentions.
- **Guest can create a meeting** — `POST /api/v1/calendar/meetings` → 200,
  `created_by: U…GUEST…`. The control is offered and works, so it is not a broken affordance.
  **Whether a guest should be able to is a roles/permissions question — sector D's**, noted here
  rather than judged.
- **A user who is not a workspace member** (`qa.e.outsider`) is redirected out of every
  sector-E route in that workspace — `/directories`, `/calendar`, `/files` and a channel deep
  link all land on their own `Personal workspace` at `/w/W…/directories`, with a working shell.
  No 403 screen, no broken chrome, nothing from the other workspace rendered.
- **Low, logged not reported:** each Directories person row exposes **two** controls with the
  identical accessible name `Open <name>'s profile` (the avatar button and the name button),
  so the tab order carries every member twice.

## Calendar — deletion propagates to the invitee (16:25)

**Verified working.** The confirmation makes a specific promise and the app keeps it:
```
organiser (alice), meeting "QA-E Delete probe" 23:00, bob invited:
  Delete -> "Delete meeting? | This permanently removes "QA-E Delete probe" for everyone.
             Participants will no longer see it. | Cancel | Delete meeting"
  confirm -> POST /api/v1/calendar/meetings/S4OWMCL5M5O4DZV/cancel -> 200
  organiser's grid: chip gone immediately (8 chips left, none of them the deleted one)

invitee (bob), fresh load:
  chips: no "QA-E Delete probe"           hasTarget: false
  list API: n=8, the meeting absent
  notifications: "Meeting cancelled | The meeting "QA-E Delete probe" has been cancelled"
```
Before the deletion bob's grid and list API both carried it (`QA-E Delete probe/scheduled`), so
this is a real before/after, not an empty-state coincidence.

### Reproduced ALK-3014 — not filed, but with a better entry point than the ticket has

**ALK-3014** `[FE-WEB][CALENDAR] Ссылка на удалённую встречу открывает карточку без сообщения об
отмене` (Backlog) reproduces on this build. Worth recording is **how a user gets there**: the
invitation notification is *not* removed when the meeting is cancelled, so the panel offers the
stale link one row below the cancellation notice:
```
notification panel, bob, after the deletion — both rows present:
  "Meeting cancelled | The meeting "QA-E Delete probe" has been cancelled"
  "Meeting invitation | You've been invited to "QA-E Delete probe" — Aug 2…"
click the invitation row -> /w/{ws}/calendar/S4OWMCL5M5O4DZV
card: "QA-E Delete probe | Wednesday, August 26, 23:00–23:30 | 30 min | Scheduled by QA Alice
       | Participant list unavailable | Your response | Yes | No | Start meeting"
```
No cancellation notice anywhere on the card, and it still offers `Yes`/`No` and `Start meeting`
for a meeting that no longer exists. So the ticket's "ссылка на удалённую встречу" is not just a
stale pasted URL — the app hands the user that link itself, next to the notice telling them the
meeting is gone. Not filed (open duplicate); this note is for whoever triages ALK-3014.

**Low, logged not reported:** the delete confirmation dialog exposes two controls whose
accessible name is `Cancel` (the dismiss button and the close X) alongside `Delete meeting`.

## Deleted file inside a message — duplicate of ALK-3016, **with the roles reversed**

Testing the sector C/E border CLAUDE.md calls out ("if the two disagree about the same file,
that is a finding"). Deleting the file from `/w/{ws}/files` after it had been shared into a
channel.

**File deletion itself — verified working.**
```
confirm: "Delete file? | This permanently removes the file for everyone. | Cancel | Delete file"
DELETE /api/v1/files/F4OWBD79HC09BRJ -> 200 {"success":true}
storage: "7.9 KB of 10 GB used · 2 files"  ->  "47 B of 10 GB used · 1 file"   (immediate)
GET /api/v1/files/{id}/content -> 404 for both accounts
```

**The message payload is byte-identical for both viewers** — the server marks the file deleted:
```
GET /api/v1/messaging/channels/C4QEPRIVATE0001/messages?limit=5   (identical for both accounts)
  {"id":"M4OWLP0TCKXMA09", … ,"files":[{"id":"F4OWBD79HC09BRJ","status":"deleted"}], …}
```

**The two clients render it differently:**
```
bob   (recipient)      message height 108 px
      visible text: QA | QA Alice | 15:46 | Unavailable file | File reference unavailable | Unavailable
      <img> elements: none
alice (owner/sender)   message height 294 px
      visible text: QA | QA Alice | 15:46          <- no placeholder at all
      <img alt="qa-e-image.png"> naturalSize 0x0, box 318x239, opacity 0
```
The `opacity: 0` is on the `<img>` itself, not a transition wrapper — traced 16 samples over
16 s, `op=0.00 … by IMG.absolute inset-0 h-full w-full`, never changes. Reproduced on two full
reloads per account. So alice sees an unexplained 318×239 blank inside a 294 px message.
Note the `alt` carries `qa-e-image.png`, a filename **the payload no longer contains** — the
owner's client is rendering the attachment from stale local state that survives a reload.

**Duplicate of ALK-3016** `[FE-WEB][FILES] После удаления файла у получателя вложение выглядит
пустым` (Backlog, P3). Same defect: one side gets the explicit placeholder, the other gets an
empty rectangle. **Not reported.**

**Для триажа — the ticket has the roles the other way round.** ALK-3016 states
«У отправителя … показывает понятную заглушку … У получателя … пустой серый прямоугольник», and
its «Подтверждённая причина» pins the broken state on the recipient's session
(«в сессии получателя оставляет изображение с нулевым naturalWidth»). I measured the exact
opposite: the **recipient** gets the placeholder and the **owner/sender** gets the empty box.
A developer working from the ticket would look in the wrong session.
One variable differs and could explain it rather than the ticket being wrong: ALK-3016 shares
the file **to a person** (`Share… → PEOPLE → Send`), I shared it **to a channel**. Either way the
asymmetry is client-side — the payload above is identical for both viewers, so nothing in the
response distinguishes them. Worth re-checking both share targets before fixing.

## Calendar — form validation boundaries (16:15)

**Verified working — all four boundaries behave, and none of them reaches the server.**
```
end before start   14:00 -> 13:00 same day   "End time must be after start"       no POST
zero duration      14:00 -> 14:00 same day   "Duration is required"               no POST
start in the past  Aug 20 10:00-10:30        "Start time must be in the future"   no POST
crosses midnight   Aug 27 23:30 -> Aug 28 00:30   accepted, summary "Thu, Aug 27 · 11:30 PM –
                                                  12:30 AM · 60 min"
                                             POST /api/v1/calendar/meetings -> 200
```
The messages are specific rather than generic, and the dialog stays open with the values intact
so the user can correct them. Note the submit button is **never** disabled
(`submitDisabled: false` in every case) — validation runs on submit, which is what produces the
explanatory message instead of a silently dead button. Deliberate, and the better of the two.

### Reproduced ALK-3110 — not filed

**ALK-3110** `[FE-WEB][CALENDAR] Встреча, переходящая через полночь, не показывается в дне, в
который она продолжается` (Backlog) reproduces on this build, using the meeting the boundary
test above just created:
```
API: "QA-E VAL endNextDay 2026-08-27T18:30:00Z -> 2026-08-27T19:30:00Z"
     = 23:30 Thu Aug 27 -> 00:30 Fri Aug 28 in Asia/Tashkent, so it crosses midnight
week grid: exactly ONE chip for it — "QA-E VAL endNextDay 23:30-00:30 …" @x963
           (for comparison every Wednesday chip sits at x727, one column left)
           nothing in the following day's column
```
One chip means one day. Not reported (open duplicate); recorded as a reproduction on
`v0.61.0-rc.5`.

## Files — upload boundaries (16:20)

Five files in one queue: 0-byte, normal, a 204-character filename, a Cyrillic+emoji filename,
and a plain-text file named `.png`.

**Verified working.**
- **Queue and progress**: `Upload queue | 5 uploads, 62 B` with per-file `Waiting to upload` and
  a `Remove from queue` each; after `Upload 5 files` the successful rows go to `Uploaded | 100%`
  and the storage line updates `47 B` → `109 B` without a reload.
- **204-character filename — accepted and correctly truncated, not clipped.**
```
POST /api/upload/api/v1/files/upload -> 200  filename "aaa…" (204 ch), size 18
tile 205x188, name leaf scrollWidth 1699 vs clientWidth 205
  BUT  text-overflow: ellipsis / overflow: hidden
```
  `scrollWidth > clientWidth` alone would read as a clipping defect by the usual measure; the
  explicit `text-overflow: ellipsis` makes it deliberate truncation. Worth remembering: the
  clipping test needs the `text-overflow` check beside it.
- **Cyrillic + emoji filename** round-trips intact: `тест-файл-📎.txt`, `extension txt`,
  `mime_type text/plain`, listed correctly.
- **0-byte file is rejected, and the UI says so in English.** The backend message is Russian,
  but it never reaches the user:
```
POST /api/upload/api/v1/files/upload -> 400 {"code":400,"key":"FILE_INVALID_REQUEST","message":"файл пустой"}
queue row (visible leaves): "empty.txt" | "0 B" | "empty.txt could not be uploaded"
row controls: Retry upload | Remove from queue
```
  The client substitutes its own English string, so **this is not a locale defect** — the Russian
  text stays inside the API response. Recorded because an API-first look would have called it one.
- **A text file named `.png` is accepted** (`mime_type: image/png`, from the extension) and
  counts under `Images 1 loaded`, but the grid renders **no `<img>`** for it, so there is no
  broken thumbnail. Not a user-visible defect in the list.

**Low, logged not reported:** the failed-upload row says only `empty.txt could not be uploaded`
and offers `Retry upload`. The backend gave a specific reason (the file is empty) that the client
does not surface, and retrying a 0-byte file can only fail again.

### BUG-3 [High] [frontend] «Open full search» молча сужает поиск до текущего канала и показывает ноль результатов, обещая при этом поиск по всему workspace

The global search dialog finds a message; pressing **Open full search** on the same query then
reports "No results" — because the full-search page silently scopes the query to whichever
channel the user happened to be in. Nothing on the page says so.

**One query, one account, back to back.** A message containing `qelanex7k2` was posted to
`#qa-private`; the user is sitting in `#qa-general`.
```
A. Global search dialog (opened from #qa-general)
   GET /api/v1/search?q=qelanex7k2&company_id=…&workspace_id=…&limit=25
   All 1 | Messages 1 | Channels 0 | People 0 | Files 0
   result row: "#qa-private  private scope probe qelanex7k2  QA Alice · Aug 26, 2026"

B. "Open full search", same query, one click later
   -> /w/{ws}/c/C4QEGENERAL0001/search?q=qelanex7k2
   GET /api/v1/search?q=qelanex7k2&company_id=…&workspace_id=…&channel_ids=C4QEGENERAL0001&limit=25
   All 0 | Messages 0 | Channels 0 | People 0 | Files 0
   empty state: "No results for “qelanex7k2”. Try other words or clear the filters."
```
The `channel_ids` parameter is the only difference between the two requests.

**The scope follows the URL's channel segment, and it is invisible.** Same query, two entry
points, two fresh loads each:
```
/w/{ws}/c/C4QEGENERAL0001/search?q=qelanex7k2  -> channel_ids=C4QEGENERAL0001  All 0  (run 1 and run 2, identical)
/w/{ws}/c/C4QEPRIVATE0001/search?q=qelanex7k2  -> channel_ids=C4QEPRIVATE0001  All 1
```
Every visible control on that page:
```
Search messages, channels,… | Last 7 days | Last 30 days | All time | Relevance |
All 0 | Messages 0 | Channels 0 | People 0 | Files 0
```
No scope chip, no channel name, and a full-text scan of the visible page never mentions
`qa-general` (`mentionsChannel: false`). Meanwhile the page's own subtitle reads
**"Search messages, channels, people, and files in this workspace."**

The empty state compounds it: "Try other words or **clear the filters**" — there is no filter
shown that could be cleared, and the one that is actually applied is not rendered at all.

**Подтверждённая причина.** Narrow responsible boundary rather than a guess: both requests are
issued by the same client with the same query, and the only difference is a `channel_ids`
parameter the page adds from its own route. The server returns the message correctly when it is
not passed. So nothing on the backend is dropping the result.

**Как должно быть.** Либо full search ищет по всему workspace, как обещает подпись, либо
показывает применённый фильтр канала как видимый и снимаемый chip.

**Dedup — read in full, not a duplicate.**
- **ALK-3538** `[BE][SEARCH] Глобальный поиск не находит людей и каналы` (the morning pass's
  finding, now filed) is about `users` and `channels` being 0 in the API response for every
  query. Mine is about **message** results, which that ticket shows working, being lost to a
  client-added channel filter. Different field, different layer, different symptom.
- **ALK-3026 / ALK-2981** are calendar search. Unrelated.

## Calendar — recurrence (16:35)

**Verified working, end to end, including the part that usually breaks.**

The create dialog's `Repeat` control offers `Does not repeat | Every day | Every week |
Every month` (plus a `Custom RRULE` entry that is correctly disabled until a rule applies).
Creating a daily 09:00–09:15 meeting starting Aug 27:
```
POST /api/v1/calendar/meetings -> 200  starts_at 2026-08-27T04:00:00Z
list API for the following week returns SEVEN materialised occurrences, each with its own id:
  2026-08-27 id=S4OWN1ECPIEV   2026-08-28 id=S4OWN1ECYWGG   2026-08-29 id=S4OWN1ED3TWW
  2026-08-30 id=S4OWN1ED6H2C   2026-08-31 id=S4OWN1ED9FG0   2026-09-01 id=S4OWN1EDBCMN
  2026-09-02 id=S4OWN1EDE57W
week grid: 4 chips, one per remaining day of the visible week, at x963 / x1198 / x1434 / x1669
```
The occurrence card carries a `Repeats` marker the one-off cards do not.

**Deleting one occurrence removes only that one — and the confirmation says so.** The copy is
different from the non-recurring case, and accurate:
```
recurring:     "Delete meeting? | This removes only this occurrence of "QA-E Daily standup".
                The rest of the series stays in the calendar."
non-recurring: "Delete meeting? | This permanently removes "QA-E Delete probe" for everyone.
                Participants will no longer see it."
confirm -> POST /api/v1/calendar/meetings/S4OWN1ECPIEVVHD/cancel -> 200
occurrences before: Aug 27, 28, 29, 30, 31, Sep 1, Sep 2   (7)
occurrences after:       Aug 28, 29, 30, 31, Sep 1, Sep 2   (6)
```
Exactly the clicked occurrence goes; the series survives. This is the case that usually fails,
and it does not.

## Meeting settings section — enumerated (not separately tested)

`Meeting settings` inside the create dialog expands in place rather than opening a second dialog:
`Mute participants on entry | Who can open Side Rooms (Only host | Everyone) | Maximum Side Rooms 8 |
External link (Zoom, Teams, or your own URL) | In person (Enter an address) | Room (Reserve an
office meeting room — Not available yet) | Search members | Invite by email |
Participant availability is not available yet`.
Two surfaces label themselves unbuilt (`Room`, `Participant availability`) — honest, not defects.
**Meeting settings themselves are sector B's scope**, so this is recorded as a map, not tested.

## Search — sort control (16:40) — verified working

`Relevance` opens a menu with `Relevance | Date | Alphabetical`. All three produce **distinct and
correct** orderings of the same 5 results, entirely client-side (no new `/api/v1/search` request
on any switch, consistent with the date chips):
```
Relevance     private scope probe … | search index probe …mt9oq1kn | search index probe …71762
Date          private scope probe … | unread badge probe …        | unread badge probe …
Alphabetical  private scope probe … | search index probe …71762   | search index probe …mt9oq1kn
```
`Date` is newest-first and matches the real creation order (16:25, then 11:34/11:31, then
11:00/10:59). `Alphabetical` correctly reorders the two `search index probe …` bodies by their
trailing token. The button label updates to the chosen option each time.

**Rig note:** my first two attempts reported `nRows: 0` and "order unchanged" because I selected
result rows by `aria-label^="Message:"`. That label is used on the **full search page**; inside
the **dialog** the same rows are labelled `Open message`. Comparing the dialog's raw result text
across sorts sidesteps the difference. Two surfaces, two accessible names for the same row —
worth knowing before writing a selector for either.

## Multi-workspace — isolation and cross-workspace unread (16:50)

**Workspace isolation — verified working.** Creating a channel in the second workspace:
```
POST /api/v1/channels -> 200 {"name":"second-ws-channel","type":"public","workspace_id":"<ws2>",…}
ws2 sidebar: ["second-ws-channel"]          ws2 URL: /w/<ws2>/c/<newChannelId>
ws1 sidebar: ["qa-private","qa-general"]    search button: "Search QA Workspace E"
```
Nothing crosses over in either direction; the search button, header and rail all re-label per
workspace.

**Unread in another workspace is not surfaced anywhere in the chrome.** Measured with the viewer
parked in workspace 2 and **never navigated** — the earlier attempt was invalid because the
browser was still sitting in the channel when the message arrived and marked it read live
(`unread=0 lastMsg=8 lastRead=8`). Re-run with the parking done first:
```
alice parked at /w/<ws2>/c/<ws2channel>, second user posts into <ws1>/#channel-1
GET /api/v1/workspaces/<ws1>/unread -> unread=1 lastMsg=9 lastRead=8     (server knows)
rail:      "QA E Second | Chat | Calls | Calendar | Files | Notifications, 2 unread | …"
switcher:  "WORKSPACES | QE QA E Second [Current] | QW QA Workspace E | Create workspace"
           digit badges in the menu: []      coloured dots in the menu: 0
```
The switcher carries no count or dot for **either** workspace, so this is a feature that does not
exist rather than one that is broken — the same shape as "recent searches" in the morning pass.
**Logged, not reported.** Worth a product answer though: an account in two workspaces has no way
to learn that messages are waiting in the other one, short of switching to it. The global
notification bell covers mentions and invitations, not ordinary unread.

## Files view toggle and sidebar collapse — persistence (17:00)

### BUG-4 [Low] [frontend] Выбор List view на странице Files сбрасывается на Grid, как только уходишь со страницы

The Files page offers `Grid view` / `List view`. The choice is discarded the moment the page is
left — not only on reload, but on an ordinary in-app navigation and back within the same session.
```
1 fresh load                  Grid view  tile 205x188
2 chose List                  List view  tile 923x44
3 rail: Files -> Calendar -> Files   Grid view  tile 205x188      <- reset, no page load involved
4 chose List again            List view  tile 923x44
5 full reload                 Grid view  tile 205x188             <- reset again
```
`aria-pressed` tracks the current state correctly throughout, so the control itself works; only
the choice is not retained. Reproduced across two separate runs.
No open ALK bug covers it (checked the open-bug list for grid/list/view/persistence terms).

### Sidebar collapse — my earlier claim was wrong, corrected here

Earlier in this log I wrote that the collapsed sidebar "persists across a reload". **It does
not**, and the real rule is more interesting:
```
fresh load per route:
  /c/<channelId>   expanded      /directories  expanded     /chat/saved  expanded
  /files           COLLAPSED     /calendar     COLLAPSED

toggle on a channel route, then navigate in-app:
  channel before toggle   expanded
  channel after toggle    COLLAPSED
  -> click Directories in the sidebar   COLLAPSED     (choice kept)
  -> click Saved Messages              COLLAPSED     (choice kept)

toggle, then full reload, on /files:
  load COLLAPSED -> toggle expanded -> reload COLLAPSED -> toggle expanded -> reload COLLAPSED
```
So the toggle **is** honoured across client-side navigation, and a full page load resets it to a
**route-specific default**: `/files` and `/calendar` open collapsed, chat-ish routes open
expanded. That default looks deliberate — those two are wide content views — so this is **not**
written up. What misled me earlier: my first reading happened to be taken on `/files` (collapsed
by default) right after a snippet had collapsed it on a channel route, so a route default looked
like persisted state.
**Method note for the next session:** never conclude "state persisted across reload" from a
single before/after on one route. Toggle it in both directions and check at least two routes —
a route-specific default reproduces a "persistence" result exactly.

## Source citations re-verified at the DEPLOYED sha (17:15) — and a correction to this log

A parallel session found that the frontend clone is checked out on
`bugfix/ALK-3389-early-guest-landing`, **33 commits behind** the deployed
`c4b5386b4a3a`, with the branch's upstream pointing at the bugfix branch — so `git pull` can
never converge on the deployed build. Every `git grep` run today read stale code.

**Correction to this log's own header.** At session start I ran
`git log c4b5386b4a3a..HEAD` over the sector's paths, got no output, and wrote "staging is at
frontend HEAD, nothing pending". That reading was **backwards**: an empty
`deployed..HEAD` means HEAD contains nothing the deployed build lacks — i.e. HEAD is *behind*.
The correct check is both directions:
```
git rev-list --count HEAD..c4b5386b4a3a   -> 33   (deployed, not in the tree)
git rev-list --count c4b5386b4a3a..HEAD   ->  0   (tree, not deployed)
```

**Every citation in the published report re-checked at `c4b5386b4a3a`. All correct, same line
numbers.** Read with `git show 'c4b5386b4a3a:<path>'` — no checkout needed:
```
apps/web/src/features/directories/types/directories.types.ts:12   interface DirectoryPerson {…}
   fields: avatarColor, avatarUrl, department, displayName, email, position, userId — no presence  ✓
apps/web/src/features/directories/DirectoryPersonRow.tsx:50-56    <Avatar aria-hidden color name
   size="sm" src /> — no status prop                                                              ✓
packages/ui-kit-web/src/Avatar.tsx:124                            {status !== undefined ? (       ✓
packages/ui-kit-web/src/AvatarShell/AvatarShell.tsx:35            status={presence}               ✓
packages/features/calendar/model/scheduledMeetingRsvp.ts:12,25-26 organiser branch / my_status
   fallback — file is byte-identical to the stale copy                                            ✓
packages/features/calendar/ui-web/RsvpSegment.tsx:33              isDisabled = … || !isCurrentUserAttendee  ✓
git grep -E 'presence|online' c4b5386b4a3a -- apps/web/src/features/directories  -> exit 1, no matches ✓
```

**Log-only citations, also re-checked:**
```
packages/core/src/state/queries/connectionIndicator.ts:19   VISIBILITY_DELAY_MS = 800     ✓
packages/core/src/state/queries/search.ts:182 / :222        filterResponseByDateRange /
                                                            createDateCutoffMs            ✓
packages/core/src/i18n/dictionaries/en.ts                   'Waiting for network…' is at
                                                            line **1456**, not 1451       ✗ corrected above
```
**The backend clone is clean** (`dev`, up to date with `origin/dev`), so the `mark_as_read.go`
citation behind the "Mark all as read is deliberate" kill needs no re-check — confirmed
independently by the session that raised the alarm.

**Two zsh traps hit while doing this**, worth writing down because they produced convincing
false negatives:
- `git show $S:apps/…` with `S=c4b5386b4a3a` silently applies zsh's `:a` (absolute-path)
  modifier, eating the sha's trailing `a` and turning the argument into
  `<repo>/c4b5386b4a3apps/…`. It fails as "unknown revision or path", which reads exactly like
  "this file does not exist at that sha" — I briefly believed both directories files had been
  moved. Double quotes do **not** help. Write the ref literally:
  `git show 'c4b5386b4a3a:apps/…'`.
- `git show <rev>:<path> | sed -n '40,62p'` prints nothing when the range is past the end of the
  file, which looks identical to the file being absent. Check existence with
  `git ls-tree -r --name-only <rev> | grep <path>` before concluding anything.

**Method conclusion worth keeping:** a finding resting on a measured response cannot be poisoned
by a stale checkout; one resting on `git grep` can. Both report findings that carry a
`Подтверждённая причина` also carry the response that proves the boundary independently of the
source — BUG-2 the `my_status` payload diff, BUG-1 the `presence` field in the members response
plus the same data rendered on two other screens. The citations sharpen them; they are not what
holds them up.

## Calendar — Month/Day views on a dense day (16:50) — verified working

Today's cell now holds 8 meetings, which is a better test of the overflow than the morning's 3.
```
API for the day: 8 meetings (10:00 … 18:30 UTC)
Month view  cell "26": 2 chips + "+6 more"        2 + 6 = 8, arithmetic correct
            month chips overall: 13, all visible
Day view    header "Wednesday, August 26", 24 chip nodes (8 meetings × 3 testids)
            only 2 in the viewport — the rest are below the fold in a 24-hour column
```
**The `+6 more` popover lists the whole day, not just the overflow** — headed
`Events for Wednesday, August 26` and containing all **8** titles in chronological order
(15:00 … 23:30 local). Sensible, and better than listing only the hidden six.

Playwright again reported the `+6 more` button as `element is not enabled` for 30 s. Same
actionability trap the morning pass documented: measured directly it is
`disabled:false, pointer-events:auto, opacity:1, aria-expanded:false, vis:true, 237x28 @660,850`,
and a direct `.click()` opens it. Not a defect.

### BUG-5 [Medium] [frontend] Редактирование повторяющейся встречи меняет только одно вхождение и нигде об этом не говорит — в отличие от удаления

Editing an occurrence of a recurring meeting silently applies to that occurrence only. The same
card's **delete** flow states its scope explicitly; the **edit** flow says nothing at all, and
offers no choice between this event and the series.

```
card for one occurrence:
  "QA-E Daily standup | Friday, August 28, 09:00–09:15 | 15 min | Scheduled by You | Repeats | …"
  ^ the app knows it is a series — it renders a "Repeats" marker

Edit -> rename to "QA-E Daily standup EDITED" -> Save
  PATCH /api/v1/calendar/meetings/S4OWN1ECYWGGRCD -> 200
occurrences after:
  2026-08-28T04:00 "QA-E Daily standup EDITE…"     <- only this one
  2026-08-29T04:00 "QA-E Daily standup"
  2026-08-30T04:00 "QA-E Daily standup"
  2026-08-31T04:00 "QA-E Daily standup"
  2026-09-01T04:00 "QA-E Daily standup"
  2026-09-02T04:00 "QA-E Daily standup"
  2026-09-03T04:00 "QA-E Daily standup"

Edit dialog, full text scanned for scope wording:
  series:false  occurrence:false  repeats:false  "this event"/"all events"/"only this":false
  controls: Close | Add title | Date and time | End date and time | 15 min…2 hr |
            Aloqa Meet | Cancel | Save        — no scope choice anywhere

Delete confirmation for the SAME meeting:
  "Delete meeting? | This removes only this occurrence of "QA-E Daily standup EDITED".
   The rest of the series stays in the calendar. | Cancel | Delete meeting"
```
So one destructive action names its scope and the other does not, on the same card, in the same
session. The silent one is the one a user is more likely to get wrong — renaming or re-timing a
recurring standup and expecting the series to follow.

**Подтверждённая причина — omitted deliberately.** The behaviour is fully measured but I did not
establish *why* the edit path has no scope prompt, and a guess here would send someone to the
wrong place.

**Dedup:** no open ALK bug covers recurrence scope on edit. Checked the open-bug list for
recurrence terms (повтор/recur/серия/series/occurrence/RRULE) and read the whole
`[*][CALENDAR]` set. ALK-3143 is the **mobile** edit sheet overwriting another session's
changes; ALK-3141 is optimistic concurrency for the event PATCH. Neither is this.

## Search — typed filters (17:10)

`:in #channel` — **verified working** (already logged): it resolves the channel name to
`channel_ids=<id>` in the request.

### BUG-6 [Medium] [frontend] Типизированный фильтр `:@ <человек>` ничего не фильтрует — имя выбрасывается, автор в запрос не уходит

> ⚠ **SUPERSEDED — this write-up is WRONG. See "SECOND published finding corrected" (04:35) and
> the two sections after it.** `:@ <person>` is a **place** filter: it scopes the search to the DM
> with that person. It returns zero because the client sends the DM id in `channel_ids` where the
> server needs `dm_ids` — which is `ALK-1972`, not a new finding. What survives, and is what the
> report now carries, is (a) a two-word display name resolving to a **different real member**, and
> (b) a chip shown when nothing was applied. The measurement below was accurate *at the time*: the
> account had no DM with that person yet, and a DM-scope filter with no DM is indistinguishable
> from an inert one.

The search dialog advertises the filter in its own hint:
`Use typed filters like :in #general or :@ Alex.` The `:in` half works. The `:@` half consumes
the name and drops it: no author parameter is ever sent, and the result set is **identical** to
searching without the filter.

```
unread                     -> q=unread                                All=7
:@ Bob unread              -> q=unread                                All=7   <- token dropped
:@ Alex unread             -> q=unread                                All=7   <- token dropped
:@ QA Bob unread           -> q=Bob unread                            All=7   <- consumed "QA", left "Bob" as TEXT
:in #qa-general unread     -> q=unread&channel_ids=C4QEGENERAL0001    All=7   <- the sibling filter DOES resolve
```
No request in any form carries an author/user parameter.

**It is not merely inert — the results it shows are wrong in both directions.**
```
:@ QA Bob   -> q=Bob   All=2
   returned: "QA Bob | unread badge probe from bob"  ×2
             ^ these match because the message BODY contains the word "bob"
   NOT returned: "QA Bob | cross-workspace unread probe" ×2
             ^ messages QA Bob actually wrote, confirmed authored by him in the same
               dialog under `:in #qa-general probe`
```
So filtering "by Bob" returns messages that merely mention bob and hides messages Bob wrote.

**Подтверждённая причина — narrow boundary only.** The client clearly parses the token (it
removes `:@` and one following word before issuing the request) and then sends no author
parameter, so nothing on the server is dropping the filter. I did not read the parser at the
deployed sha, so no file:line is claimed.

**Checked and NOT a defect:** `:@ zzzznope zarplex` issues no request at all while showing
results. That is a cache hit, not staleness — the parsed query is `q=zarplex`, which had been
requested two queries earlier. And `:@ zzzznope` on its own sends the raw string
`q=:@ zzzznope` and correctly shows the empty state.

**Dedup:** no open ALK bug covers typed filters. **ALK-3538** `[BE][SEARCH] Глобальный поиск не
находит людей и каналы` is about the `users`/`channels` buckets being empty in the response;
this is about the message query never carrying an author filter. Different layer, different
symptom.

## Calendar — all-day and the start-date/summary desync (17:25)

### All day — verified working on a future date

The control is a `<button role="switch" id="_r_s_">` labelled by a separate
`<label for="_r_s_">All day</label>`, so it has **neither text content nor `aria-label`** —
`clickDeepest(d, /^All day$/)` cannot find it. (Worth knowing now that helper is shared: a
`for`-associated label is invisible to both a textContent match and an aria-label match. Click
`[role=switch]` by id, or resolve `label[for]` → its control.)
```
before  switches ["All day=false"]  summary "Sat, Aug 29 · 5:00 PM – 5:30 PM · 30 min"  2 time inputs visible
toggle  switches ["All day=true"]   summary "Sat, Aug 29 · All day"                     1 time input visible, disabled=true
submit  POST /api/v1/calendar/meetings -> 200
        starts_at 2026-08-28T19:00:00Z   ends_at 2026-08-29T19:00:00Z
        = 00:00 → 24:00 on Aug 29 in Asia/Tashkent. Correct.
```
The surviving start-time input is `disabled=true` (a `fill` on it correctly times out), so it is
a greyed-out remnant, not an editable field. Not a defect.
ALK-3109 (`All day нельзя создать на сегодня`, In Progress) is specifically about **today**; a
future date works.

### BUG-7 [Low] [frontend] При смене даты начала сводка и поле окончания остаются на прежней дате — форма показывает не то, что создаст

Changing the start **date** leaves the end date and the live summary on the old day. Changing the
start **time** pulls both along. So one half of the same control propagates and the other does not.
```
default                      start=2026-08-26 17:30   end=2026-08-26 18:00
                             summary "Wed, Aug 26 · 5:30 PM – 6:00 PM · 30 min"
change start DATE -> Sep 4   start=2026-09-04 17:30   end=2026-08-26 18:00     <- end unchanged
                             summary "Wed, Aug 26 · 5:30 PM – 6:00 PM · 30 min" <- summary unchanged
change start TIME -> 11:00   start=2026-09-04 11:00   end=2026-09-04 11:30     <- both catch up
                             summary "Fri, Sep 4 · 11:00 AM – 11:30 AM · 30 min"
```
Reproduced identically on three separate dialogs.

**The created meeting is correct** — this is a display defect, not a data one. Submitting straight
after changing only the start date:
```
form at submit: start=2026-09-05 17:30, end=2026-08-26 18:00, summary "Wed, Aug 26 · 5:30 PM – 6:00 PM"
POST /api/v1/calendar/meetings -> 200
created: "QA-E date-follow submit :: starts 2026-09-05T12:30:00Z ends 2026-09-05T13:00:00Z"
         = Sep 5, 17:30–18:00 local — the date the user typed, with the duration preserved
```
So the form reconciles on submit and schedules the right thing; only the confirmation line the
user reads before pressing the button is wrong. Notably it does **not** trip the
"End time must be after start" validation, even though the visible end date is 10 days before the
visible start date — further evidence that the end field is stale rather than actually applied.

**Подтверждённая причина — omitted.** Behaviour fully measured, mechanism not established.

**Dedup:** no open ALK bug covers this. Read the whole `[*][CALENDAR]` open-bug set;
ALK-2972 (saved description not shown on the card) and ALK-3193 (mobile title-length validation)
are the nearest and are unrelated.

## Files — sort persistence too (17:40), broadening BUG-4

The sort choice is discarded exactly like the view mode, so the finding is about the page's
display preferences rather than one button.
```
1 fresh load        order: normal.txt, aaa…(204ch), fake.png, тест-файл-📎.txt, qa-e-note.txt   (default = Date)
2 sort by Size      order: qa-e-note.txt(47 B), aaa…, fake.png, тест-файл, normal.txt(13 B)     (descending)
3 rail Files→Calendar→Files   order: back to the default          <- reset, no page load
4 sort by Size again          order: sorted again
5 full reload                 order: back to the default          <- reset
```
Same shape as the `Grid`/`List` toggle: both survive nothing beyond the current page view.

**The active sort is visually clear but has no accessible state.** Measured across all three
buttons in three states:
```
active   color rgb(27,66,184)  bg rgb(238,242,254)  classes border-accent.bg-accent…
inactive color rgb(82,90,106)  bg rgb(255,255,255)  classes border-border.bg-bg…
aria-pressed on Date / Name / Size: absent on all three, in every state
```
So sighted users can see which sort is on; the accessible name/state cannot. Note the **view**
toggle in the same toolbar *does* expose `aria-pressed`, so the two controls disagree with each
other. **Low, logged not reported** — the visual affordance works, and this is the kind of thing
trimmed at triage. Recorded because it is one line to fix while the persistence work is open.

## Calendar — monthly recurrence on the 31st (17:50) — verified working

The classic recurrence edge case, handled correctly:
```
create: "Every month", start 2026-08-31 10:00
POST /api/v1/calendar/meetings -> 200  starts_at 2026-08-31T05:00:00Z
occurrences returned for Aug 2026 → Mar 2027:
  2026-08-31T05:00:00Z
  2026-09-30T05:00:00Z    <- September has no 31st; clamped to the last day
  2026-10-31T05:00:00Z    <- and back to the 31st, not drifted to the 30th
```
Clamping to the month's last day without letting the drift persist is the right answer, and the
one that is usually got wrong.

## Directories → Channels omits private channels — checked, by design, not a defect

Worth recording because it looks like a bug from the UI alone. As a member of both channels:
```
sidebar:                    ["qa-general", "qa-private"]
Directories → Channels:     "qa-empty PUBLIC Join" | "qa-general PUBLIC Open"    (no qa-private)
filter "private":           "No channels match your search."
```
A channel the viewer belongs to, absent from the workspace's channel directory, and the filter
denying it exists. But the directory is built from a different endpoint than the sidebar:
```
GET /api/v1/workspaces/{ws}/channels        -> qa-general/public, qa-private/private   (sidebar)
GET /api/v1/workspaces/{ws}/public-channels -> qa-general/member=true, qa-empty/member=false  (directory)
```
So the tab is a **public-channel** directory with a membership flag driving `Open` vs `Join`, and
private channels are excluded at the source. That is the right behaviour — a directory that
listed private channels would leak their existence in the general case. **Not reported.**

Only quibble, Low and not written up: the tab is labelled plainly `Channels`, and searching it for
a private channel you are a member of answers `No channels match your search.` rather than saying
the directory covers public channels.

## BUG-3 strengthened — the missing affordance already exists in the product (17:20)

The channel header's `Search in channel` opens the **same Global search dialog**, already scoped,
and there the scope **is** shown as a removable chip. The full-search page applies the identical
scope and shows nothing. Enumerated on two consecutive runs, identical both times:
```
dialog (opened via "Search in channel", query = token that lives in the OTHER channel)
  12 controls: Search messages,channels… | Remove in #qa-general filter | Last 7 days |
               Last 30 days | All time | Relevance | All0 | Messages0 | Channels0 |
               People0 | Files0 | Open full search
  All 0 | Messages 0

then "Open full search" from that same dialog
  10 controls: Search messages,channels… | Last 7 days | Last 30 days | All time |
               Relevance | All0 | Messages0 | Channels0 | People0 | Files0
  no scope-removal control at all
  All 0 | Messages 0     URL /w/{ws}/c/{channelId}/search?q=<token>
```
So the fix is not new UI — the page needs the chip the dialog already renders. Report updated:
the measurement block now carries this contrast, and «Ожидаемый результат» names
`Remove in #channel filter` as the existing affordance.

**Measurement note:** my first scope-chip probe used a regex for `in #<name>` over the surface
text and reported `scopeChipVisible: true` on **both** surfaces. That was the dialog's own hint
string, `Use typed filters like :in #general or :@ Alex`, which contains `in #general` on every
screen. The real signal is the **control**, `Remove in #qa-general filter`, found by enumerating
interactive elements. A text regex for a UI affordance will match the documentation for that
affordance — enumerate the controls.

### The dialog's scope chip is fully functional — which is what makes BUG-3 a gap, not a design choice

```
dialog scoped via "Search in channel", query = token that lives only in the OTHER channel
  request  q=<token>&company_id=…&workspace_id=…&channel_ids=C4QEGENERAL0001&limit=25
  All 0 | Messages 0        chip present: "Remove in #qa-general filter"

click the chip
  request  q=<token>&company_id=…&workspace_id=…&limit=25          <- channel_ids dropped
  All 1 | Messages 1        first result: "#qa-private / private scope probe <token>"
  chip gone
```
So on the dialog the scope is visible, removable, and removing it produces the missing result.
The full-search page applies the same `channel_ids` with no chip, no removal, and an empty state
that tells the user to "clear the filters". The fix is the chip the dialog already has.

## Reminders — do they fire, and does the picker matter? (17:20, experiment running)

The morning pass verified the reminder picker opens and lists
`No reminder | 5 | 10 | 15 | 30 minutes before | 1 hour before`, and explicitly could not test
whether a chosen reminder **fires** — "needs a meeting scheduled minutes ahead and a wait, which
the box had no room for". This box has the room.

**First result, derived without waiting.** A meeting created by the morning session
(`QA-E Sync 3`, 17:00 local = 12:00Z) produced exactly two reminder notifications, and their
creation timestamps give the offsets directly:
```
GET /api/v1/notifications?limit=50   (invitee)
  11:30:14Z  "Meeting starting soon"  "QA-E Sync 3" starts soon — Aug 26, 2026 5:00 PM (Asia/Tashkent)
  11:50:14Z  "Meeting starting soon"  "QA-E Sync 3" starts soon — Aug 26, 2026 5:00 PM (Asia/Tashkent)
meeting starts 12:00:00Z  ->  offsets T-30 and T-10
```
The same pattern was observed earlier on the organiser's side for `QA-E Sync 1` (15:00 local,
reminders at 14:30 and 14:50). So reminders **do** fire, at T-30 and T-10, and both bodies are
byte-identical — nothing in the text says which offset it is.

**The open question this raises:** the create form's reminder control defaults to
`No reminder`, and neither of those meetings is known to have had one set. If a meeting created
with an explicit `No reminder` still produces T-30/T-10 notifications, the control misrepresents
what will happen.

**Experiment running** (organiser polled every 20 s for 26 minutes, from before the first
expected fire):
```
"QA-E Rem control"  17:32 local, reminder explicitly set to "No reminder"
                    -> T-10 falls at 17:22   (T-30 at 17:02 had already passed at creation)
"QA-E Rem five"     17:34 local, reminder set to "5 minutes before"
                    -> T-10 at 17:24, T-5 at 17:29
```
If the control fires nothing and five fires only at 17:29, the picker works and the earlier
meetings had reminders set. If the control fires at 17:22, the `No reminder` setting is ignored.
Result to follow.

## Recurrence horizon — measured, inconclusive, not reported (17:25)

Recurring series are **materialised** as individual meetings with their own ids, and the
materialisation is bounded. Querying progressively wider windows returns the same set, so the
limit is the data, not the query:
```
daily series, windows ending Dec 2026 / Mar 2027 / Jan 2028
  -> 89 occurrences every time, 2026-08-28 … 2026-11-24     (89 days)
monthly series, window ending Jan 2028
  ->  3 occurrences,            2026-08-31 … 2026-10-31     (3 months)
```
So roughly a three-month horizon for both. Sensible, and it explains why a one-week probe earlier
showed only 7 occurrences.

**Why this is not written up:** the user-visible consequence would be "a daily standup silently
stops existing after ~3 months". Whether that happens depends on a background job extending the
window, which has no UI and is therefore out of this sector's scope to test — and I cannot
distinguish "will be extended" from "ends there" inside one session. Recorded so a later session
knows the horizon exists and what it is, rather than rediscovering 89 as a mystery.

## Lane E leftovers from this pass (for housekeeping)

```
workspace QA Workspace E — 109 meetings in Aug 20 … Dec 1, of which 89 are the daily series
  one-offs created by this pass: QA-E RSVP probe / two / three, QA-E Delete probe (deleted),
    QA-E Guest probe, QA-E VAL endNextDay, QA-E AllDay 29, QA-E AllDay future,
    QA-E date-follow 1 / 2 / submit, QA-E Rem control, QA-E Rem five, QA-E Reminder fire test,
    QA-E Monthly 31st (3 occurrences)
  series: QA-E Daily standup (89, one renamed to "… EDITED", one occurrence deleted)
  pre-existing from other passes: QA-E Sync 1 renamed, QA-E Sync 3, QA-E Solo Check, QA-E Verify Invite
second workspace QA E Second (W4OWJSPNXQJYZ5R) — created by this pass to unblock the
  multi-workspace switcher; contains one channel `second-ws-channel`
files in QA Workspace E — qa-e-note.txt (favourited by this pass), normal.txt,
  a 204-character filename, тест-файл-📎.txt, fake.png. qa-e-image.png was deleted as part of
  the delete test.
messages — one in #qa-private carrying the search token, several probes in #qa-general
```
All harmless on disposable fixtures, and `seed.sh --verify --lanes E` passes. The 89-occurrence
series is the only one worth deleting if the calendar gets noisy for the next session.

## Calendar month navigation — verified working (17:28)

Navigating Next three times and back with `Today`, tracked against the monthly series whose real
occurrences are Aug 31 / Sep 30 / Oct 31:
```
August 2026    1 "Monthly 31st" chip   (Aug 31)                         3 overflow buttons
September      2 chips                 (Aug 31 as a leading day + Sep 30)
October        2 chips                 (Sep 30 as a leading day + Oct 31)
November       1 chip                  (Oct 31 as a leading day; the series has no Nov occurrence)
Today          -> August 2026, 1 chip
```
Every count is what a six-week grid showing adjacent-month days should produce, and the November
grid correctly shows only the trailing October occurrence rather than inventing one. `Today`
returns to the current month.

## Report render check — partial, and the skip recorded

Served the published HTML locally with the artifact's `<!doctype>/<head>/<body>` wrapper and
viewed it: header, lede, the accent-bordered build note and the start of the summary table all
render correctly in dark mode, with the intended type pairing. **Scrolling further was abandoned**
— the Claude Browser pane went `hidden` and the call timed out, exactly as the morning pass
recorded. Not re-run, per the "don't re-run a tool that returned nothing useful" rule. Structure
was already verified programmatically (tag balance, section completeness, chip balance, word
counts, leak grep) on every publish, so the render check was confirmation rather than the primary
evidence. Local server stopped and the temp folder removed.

## Deleting a shared file clears it for the recipient too — verified working

Completing the sharing loop: after the owner deleted the file that had been shared into a channel,
the recipient's view is clean rather than carrying an orphaned entry.
```
before the delete (recipient):  scope=own 0, scope=accessible 1 (qa-e-image.png)
                                "Shared with me" tab: 1 file · 7.9 KB
after the delete (recipient):   scope=own 0, scope=accessible 0
                                "Shared with me" tab: 0 files · 0 B, empty state
```
(The empty-state wording is the already-known ALK-3002 "Nothing matches this filter yet" with no
filter applied — logged as a duplicate earlier, not re-reported.)

## Reminder offsets are named in the payload (17:30)

The notification payload carries an explicit `event_type` per reminder, which settles the offsets
without inference:
```
GET /api/v1/notifications?limit=20   (invitee, meeting at 17:00 local)
  type 3  title "Meeting starting soon"  title_key NOTIF_TITLE_MEETING_REMINDER
          category "calendar"  event_type "meeting_reminder_10m"
          body  "\"QA-E Sync 3\" starts soon — Aug 26, 2026 5:00 PM (Asia/Tashkent)"
  type 3  title "Meeting starting soon"  title_key NOTIF_TITLE_MEETING_REMINDER
          category "calendar"  event_type "meeting_reminder_30m"
          body  identical, byte for byte
  type 3  title "Meeting cancelled"      title_key NOTIF_TITLE_MEETING_CANCELLED
          category "calendar"  event_type "meeting_cancelled"  actor_name "qa_e_alice"
          body  "The meeting \"QA-E Delete probe\" has been cancelled"
```
So the two reminders are **named fixed offsets** — `_30m` and `_10m` — not a user-chosen value.
Whether the picker's `5 minutes before` produces a `meeting_reminder_5m` is what the running
experiment answers.

Two side notes from the same payload:
- The two reminder bodies are **byte-identical**; only `event_type` distinguishes T-30 from T-10,
  and that field is not surfaced anywhere in the panel. A user sees the same sentence twice.
- `actor_name` on the cancellation is **`qa_e_alice`** — the username, not the display name.
  That is the morning pass's BUG-4 ("отправитель подписан username вместо имени"), reproduced
  here on `v0.61.0-rc.5`. Already in their published report; **not re-reported**, recorded as a
  reproduction. The token-link half of that finding is specific to the *invitation* body and did
  not appear in the reminder or cancellation bodies, both of which are clean.

## Workspace switcher — second, independent confirmation (17:31) — verified working

Repeated on a different account, whose second workspace was **auto-created by the product**
rather than by this pass, so it is not a fixture of my own making:
```
start   /w/<ws1>/c/<channelId>   header "QA Workspace E"  search "Search QA Workspace E"
        channels ["qa-general","qa-private"]
menu    "WORKSPACES | QB QA Bob's workspace | QW QA Workspace E [Current] | Create workspace"
        items "Switch to QA Bob's workspace | QA Workspace E | Create workspace"
switch  -> /w/<ws2>/directories   header "QA Bob's workspace"  search "Search QA Bob's workspace"
        channels []
back    -> /w/<ws1>/directories   header "QA Workspace E"  search "Search QA Workspace E"
        channels ["qa-general","qa-private"]
```
Same behaviour as the first account: `Current` marker correct, `Switch to …` only on the
non-current row, every piece of chrome re-labels, and the channel list is per-workspace with no
bleed in either direction.

## Connection status — same on a second account (17:30)

Repeated the offline/online cycle on the other account; behaviour is identical, so the indicator
is not account- or state-specific:
```
before offline   [data-testid="connection-status-indicator"]  ABSENT
during offline   VIS "Waiting for network…" role=status aria-live=polite @861,12 spinner=yes
after recovery   ABSENT        fetch('/api/v1/auth/me') -> 200
```
Same string, same role, same live-region politeness, same position, same appear/clear timing.

## BUG-4 broadened again — no display preference survives a reload (17:33)

Testing the sidebar's `Channels` / `Direct messages` section headers turned the Files-only finding
into a shell-wide one. Confirmed over two collapse/reload cycles:
```
1 fresh                       Channels=true  Direct messages=true   channel links 2
2 collapse both               Channels=false Direct messages=false  channel links 0
3 rail Chat -> Calendar -> Chat  Channels=false Direct messages=false  channel links 0   <- kept
4 reload                      Channels=true  Direct messages=true   channel links 2     <- reset
5 collapse Channels again     Channels=false
6 reload                      Channels=true                                             <- reset
```
`aria-expanded` tracks correctly throughout, so the controls work; only the choice is lost.

**Two tiers, which is the useful part for whoever fixes it:**
```
sidebar width collapse    survives in-app navigation, lost on reload (falls back to a route default)
sidebar section collapse  survives in-app navigation, lost on reload
Files view mode           lost on in-app navigation AND on reload
Files sort                lost on in-app navigation AND on reload
```
So sidebar state lives in app memory and is simply never written anywhere; the Files page state
does not even reach app memory. One preferences store would fix all four.

Report finding retagged from `[FE-WEB][FILES]` to `[FE-WEB][SHELL]` and rewritten to cover all
four, with the sidebar traces added to the measurement block. Severity kept at **Low** — each
individual reset is small — but the breadth is now stated rather than implied.

## Recurrence is materialised on creation, not stored as a rule (17:35)

Not a finding, but the kind of thing that becomes one at a different scale, so recording it
explicitly rather than leaving it inside the horizon note above.

**Creating a single "Every day" meeting writes ~90 individual meetings.** Each occurrence is its
own scheduled event with its own id — that is why per-occurrence edit and delete work cleanly
(`PATCH /calendar/meetings/<occurrenceId>`, `POST /calendar/meetings/<occurrenceId>/cancel`), and
why the series simply stops at the horizon rather than extending lazily:
```
one "Every day" meeting created  ->  90 occurrences, 2026-08-27 … 2026-11-24
                                     each a separate row with a distinct id
after this pass deleted one occurrence (Aug 27):  89 remain, 2026-08-28 … 2026-11-24
one "Every month" meeting        ->   3 occurrences, 2026-08-31 … 2026-10-31
```
A parallel session independently counted the series at 90 in the database and confirmed the
schema has a `recurrence_rules` table while each occurrence is still its own `scheduled_events`
row. The one-occurrence gap between their 90 and my 89 is the occurrence this pass deleted, which
also independently confirms the per-occurrence delete landed in the database and not just in the
API response.

**Why it is not written up as a defect:** at this scale it is invisible to the user and the
behaviour is correct in every way I could observe — occurrences are right, per-occurrence edits
and deletes are scoped correctly, the monthly case clamps properly. Whether writing ~90 rows per
daily meeting is intended is a product question, and the cost only shows at a scale this
workspace cannot reach. Logged so it is a known property rather than a surprise.

## Reminder experiment — result (17:40)

### BUG-8 [Medium] [frontend] Выбор напоминания в форме встречи ни на что не влияет: значение не уходит в запрос, а напоминания всё равно приходят за 30 и 10 минут

The meeting form offers `No reminder | 5 | 10 | 15 | 30 minutes before | 1 hour before`. The
chosen value is **never sent**, and reminders arrive at fixed offsets regardless — including for
a meeting created with `No reminder` explicitly selected.

**The experiment.** Two meetings created within a minute of each other, polled every 20 s from
before the first expected fire until after the last:
```
"QA-E Rem control"  17:32 local, reminder explicitly set to "No reminder"
"QA-E Rem five"     17:34 local, reminder set to "5 minutes before"

12:09:58Z (17:09:58)  total=3  relevant=[]                       <- baseline, both just created
12:10:18Z (17:10:18)  total=5  BOTH meetings already have a reminder
                        "QA-E Rem five"    starts soon — Aug 26, 2026 5:34 PM
                        "QA-E Rem control" starts soon — Aug 26, 2026 5:32 PM
12:25:29Z (17:25:29)  total=7  a SECOND reminder for each
12:30:29Z (17:30:29)  still two per meeting — no third
```
The first reminder for each arrives immediately on creation: T-30 had already passed when the
meetings were made (17:02 and 17:04), so the missed T-30 is delivered at once. The second matches
T-10 (17:22 and 17:24). **No T-5 reminder ever arrives** for the meeting set to
`5 minutes before`, and 17:29 was inside the poll window.

**The control meeting, set to `No reminder`, received two reminders.** That alone shows the
setting is not honoured.

**Подтверждённая причина — the value never leaves the browser.** Captured the create request with
`15 minutes before` visibly selected in the form (`shownValue: "15 minutes before"`):
```
POST /api/v1/calendar/meetings
{"workspace_id":"…","title":"…","starts_at":"2026-08-26T18:20:00.000Z",
 "ends_at":"2026-08-26T18:35:00.000Z","timezone":"Asia/Tashkent","meeting_url":"","location":"",
 "attendee_user_ids":[],"guest_invites":[],"requires_approval":true,"is_private":false,
 "mute_on_join":false,"who_can_open_rooms":"host_only","max_rooms":8}

body keys: workspace_id,title,starts_at,ends_at,timezone,meeting_url,location,
           attendee_user_ids,guest_invites,requires_approval,is_private,mute_on_join,
           who_can_open_rooms,max_rooms
no reminder/notify/alert field of any kind
```
So nothing on the server could honour the choice — the client does not send it. The offsets that
*do* fire are named in the notification payload as `event_type: meeting_reminder_30m` and
`meeting_reminder_10m`, i.e. fixed constants rather than anything derived from the picker.

**There is no workaround:** `No reminder` is the only control offered for turning them off, and
it does not.

**Dedup:** no open ALK bug mentions reminders. Checked the open-bug list for
напомин/remind/reminder/"starts soon".

**This closes the gap the morning pass explicitly flagged** — "Not exercised: selecting an option
and confirming the reminder actually fires at the chosen offset."

## Morning pass's BUG-5 (sidebar unread badge) — independently reproduced on rc.5, not re-reported

Their finding, already in their published report, so **not re-reported**. Verified because it is
squarely in this sector and worth knowing whether it still holds on the current build. It does,
and this measurement is tighter than the original: a continuous 300 ms poll of the recipient's
sidebar, started **before** the trigger, per CLAUDE.md's "snapshot the other side continuously,
from before the action".
```
recipient parked on /calendar (NOT in the channel, so nothing marks it read)
watcher polls the #qa-general sidebar row every 300 ms for 100 s
sender posts at 17:41:55, inside the window

transitions over ~333 samples:
  t+000s  "qa-general" || rail=Chat|Chat
  (no further transition — the label never changed once)

server state at the end of the window:
  GET /api/v1/workspaces/{ws}/unread -> unread=1 lastMsg=10 lastRead=9

after a full reload:
  sidebar row -> "qa-general, 1 unread messages"
```
So the server registered the unread within the window, the sidebar never reflected it live, and a
reload alone makes it appear. Exactly the reported behaviour, on `v0.61.0-rc.5`.

**Additional observation, not a defect:** the rail's `Chat` icon carries no unread indicator at
all — `aria-label` stays `Chat` with no count and no dot, before the post, during the window, and
after the reload that does surface the sidebar badge. So unread is a sidebar-only affordance; the
rail never shows it. That is a feature that does not exist rather than one that is broken — the
same shape as the workspace switcher carrying no unread badge, and as "recent searches" in the
morning pass. Logged, not reported.

## Calendar search (17:45)

A separate surface from global search: the calendar toolbar's `Search` opens a
`Search events` dialog, placeholder **"Search by title, attendee or date"**, hint
**"Type to search events in the current range"**. It fires **no request** — it filters the
already-loaded range client-side, consistent with the hint.

### Range scoping — verified working, exactly as its hint says

```
Week view, header "24–30 August 2026"     query "Monthly" -> "No events match your search"
Month view, header "August 2026"          query "Monthly" -> "QA-E Monthly 31st | Mon, Aug 31 · 10:00–10:30"
```
The meeting is on Aug 31, outside the visible week and inside the visible month, and the results
follow exactly that. Title search works (`RSVP three` → the right meeting).

### Reproduced two already-open bugs — not filed, but with detail the tickets do not have

Testing all three things the placeholder promises, in Month view where everything is in range:
```
title     "RSVP three"   -> QA-E RSVP three | Wed, Aug 26 · 22:00–22:30          works
attendee  "Bob"          -> No events match your search
          "QA Bob"       -> No events match your search
          (that person is an accepted attendee of QA-E RSVP three, visible on its card)
date      "26 August"    -> No events match your search
          "August 26"    -> No events match your search
          "2026-08-31"   -> QA-E Daily standup | QA-E Monthly 31st                works
          "31"           -> QA-E Daily standup | QA-E Monthly 31st                works
```
- **ALK-2981** `Поиск по календарю не находит встречи по участнику` — reproduced; attendee search
  returns nothing for a person who is an accepted attendee of a meeting in range.
- **ALK-3026** `Поиск по отображаемой дате не находит встречи` — reproduced, **and sharper than
  the ticket**: date search is not missing, it simply does not accept the format the UI shows.
  ISO (`2026-08-31`) and a bare day number (`31`) both work; the displayed form
  (`Mon, Aug 31`, searched as `Aug 31` / `August 26` / `26 August`) does not. So the fix is a
  parser that accepts what the interface prints, not a new feature.

Neither re-reported (both open in Backlog). The ISO-works detail is the part worth passing to
whoever picks up ALK-3026.

## Keyboard shortcuts (17:50)

The `Help & shortcuts` dialog advertises three: `Search Cmd/Ctrl+K`,
`New direct message Cmd/Ctrl+N`, `Toggle display settings Cmd/Ctrl+Shift+T`.

### Withdrawn (5) — "Cmd+Shift+T / Toggle display settings does nothing"

Measured twice as no change: no `[role=dialog]` appeared, and none of the `<html>` display
attributes moved (`data-theme`, `data-density`, `data-sidebar-side`, `data-animations`, …
byte-identical before and after, for both the shortcut and the Help dialog's button).
**Wrong — I was looking for the wrong kind of element.** The panel is an `<aside>`, and it does
not touch the `data-*` attributes until a setting inside it is actually changed:
```
fresh load          displayPanelVisible false   bodyKids 9
Cmd+Shift+T         PANEL,PANEL,PANEL,PANEL,PANEL,PANEL,PANEL,PANEL   (8 samples over 5 s)
                    "Display settings | Theme Light Dark System | Accent color | Reset accent |
                     Font scale XS S M L XL | Density Compact Cozy"   bodyKids 10
Cmd+Shift+T again   displayPanelVisible false   bodyKids 9            (toggles closed)
```
It works, in a channel and outside one. Killed before it reached the report. Fifth withdrawal of
the pass and the same root error as three of the others: **my probe did not see it, so I called it
absent.** `[role=dialog]` is not the only container this app uses — `aside` carries the Display
settings panel, the Files details panel and the channel details panel.

### BUG-9 [Medium] [frontend] Два из трёх горячих сочетаний, которые предлагает сам Help, не работают внутри канала — а канал это основной экран

```
on /files (composer not focused)
  Cmd+K        -> Global search opens            bodyKids 9 -> 13
  Cmd+N        -> navigates to /directories (the DM picker)
  Cmd+Shift+T  -> Display settings opens         bodyKids 9 -> 10

in a channel (composer focused)
  Cmd+K        -> the composer's own "Insert link" dialog opens instead   bodyKids 12 -> 16
                  focus lands in INPUT[Insert link]; Global search never opens
  Cmd+N        -> nothing at all                 bodyKids 12 -> 12, no navigation,
                  focus stays in DIV[Compose message]
  Cmd+Shift+T  -> Display settings opens         bodyKids 12 -> 13    (works here too)
```
The third shortcut working inside a channel rules out "the composer swallows every combination" —
it swallows these two specifically. The Help dialog advertises all three without qualification.

**Подтверждённая причина — omitted.** The behaviour is fully measured; I did not establish which
handler wins, and guessing would send someone to the wrong place.

**Dedup:** no open ALK bug is about keyboard shortcuts. **Для триажа:** the `Cmd+K` half is
already *observed* inside **ALK-3538**, but only as an aside in that ticket's reproduction steps
("Cmd+K для этого годится не везде: внутри канала фокус держит поле ввода сообщения и сочетание
открывает его диалог Insert link") — that ticket is about People/Channels search buckets being
empty, not about the shortcut. The `Cmd+N` half is not recorded anywhere.

## Channel-message notifications — surface newly testable, and it works (17:55)

**Context for the next session.** Until this afternoon, channel notifications could not be
produced on these fixtures at all: `notification_db` keeps its own `channel_members` replica and
the seed wrote membership only to `messaging_db` and `org_db`, so the notification service did not
know fixture users were channel members. A parallel session found this and fixed
`seed_notification`; all five lanes were re-seeded to parity
(`C4QEGENERAL0001 messaging=6 notification=6`). **Anything of the form "a channel message should
raise a bell entry" measured before ~17:50 today was measuring the seed, not the product.**

**Positive control established first, as it should be. It fires.**
```
recipient parked on /calendar (not in the channel), baseline:
  total 3, all category "calendar"  (meeting_reminder_10m / _30m / meeting_cancelled)
sender posts a plain message to #qa-general at 17:53:38
recipient, polled every 3 s without navigating:
  t+00s  total=4 :: messaging/channel_message, calendar/…, calendar/…, calendar/…
```

**Content — verified working.**
```
type 1  category "messaging"  event_type "channel_message"
title      "New channel message"        title_key NOTIF_TITLE_CHANNEL_MESSAGE
actor_name "QA Alice"                   resource_id  <the message id>
body       "notification control probe plain"
panel row  "QA | New channel message | QA Alice · #qa-general | notification control probe"
```

**The bell updates live — no reload needed.**
```
bell read WITHOUT navigating or reloading, after the post:  "Notifications, 4 unread" badge "4"
bell after a full reload:                                    "Notifications, 4 unread" badge "4"
```
Worth stating plainly because it is the **opposite** of the sidebar unread badge measured earlier
today, which never updates without a reload (the morning pass's BUG-5, reproduced above). So the
two counters on the same screen behave differently: the bell is live, the channel row is not.

**Click-through — verified working.**
```
click the "New channel message" row
  -> /w/{ws}/c/C4QEGENERAL0001?m=<messageId>
  target message present, visible, correct text and author
  bell 4 unread -> 3 unread
```
And the deep-linked message **is** highlighted — a flash that fades, which a single after-the-fact
read misses:
```
sampled every 700 ms from load:
  bg rgba(0,0,0,0)                       (siblings the same)
  bg oklab(0.936513 …/0.801156)          <- accent tint appears
  bg rgba(238,242,254,0.518)             <- fading
  bg rgba(0,0,0,0)                       <- back to normal; 0 of 10 siblings differ
```
My first check reported "not highlighted" because it read the DOM once, after the flash had gone.
Same family as the other four withdrawals: a single sample is not a measurement of a transient.

### Sharpens the morning pass's BUG-4 — not re-reported

Their finding says the notification sender is signed with the username rather than the display
name. It is **not universal**, and the split is worth having:
```
category "messaging" / channel_message   actor_name "QA Alice"     <- display name, correct
category "calendar"  / meeting_cancelled actor_name "qa_e_alice"   <- username
```
So the messaging path formats the actor correctly and the calendar path does not. Whoever fixes
ALK-equivalent of that finding should look at the calendar notification producer specifically,
not at a shared formatter.

## Channel mute — verified working, with both halves of the control (18:00)

Newly testable for the same reason as the notifications above. The channel header's
`Mute notifications` opens a duration menu: `For 1 hour | For 4 hours | For 1 day |
Until turned off`.

```
mute                POST   /api/v1/notifications/channels/C4QEGENERAL0001/mute   -> 200 {"ok":true}
                    control flips to "Unmute notifications" aria-pressed=true
post to the channel from the other account at 17:58:41
recipient parked on /calendar, polled every 3 s for 45 s:
  t+00s  total=3 :: calendar/…, calendar/…, calendar/…      <- no messaging notification, ever

unmute              DELETE /api/v1/notifications/channels/C4QEGENERAL0001/mute -> 200 {"ok":true}
                    control flips back to "Mute notifications" aria-pressed=false
post again at 18:00:21, same polling:
  t+00s  total=4 :: messaging/channel_message, calendar/…, calendar/…, calendar/…
```
**Both halves matter.** The muted zero only means "mute works" because the identical post after
unmuting produced a notification immediately — otherwise the zero would have been
indistinguishable from the surface being broken, which is exactly the trap that made this whole
area untestable until this afternoon.

`aria-pressed` on the control tracks the state correctly in both directions, and the mute is a
per-channel server-side setting rather than local state (a real `POST`/`DELETE` pair).

## Realtime toast in a live visible tab — verified working (18:02)

The last untested piece of the notification surface: everyone had verified the notification *row*;
nobody had confirmed a banner appears in an open tab. It does.

Recipient parked on `/calendar`, tab **visible** (`document.visibilityState: "visible"` on every
sample), polled every 400 ms for 75 s, starting **before** the post:
```
t+000.0s  vis=visible  bell[Notifications, 4 unread]  toasts=[]
t+024.4s  vis=visible  bell[Notifications, 5 unread]  toasts=["LI \"QA QA Alice #qa-general toast probe from the other\""]
t+029.6s  vis=visible  bell[Notifications, 5 unread]  toasts=[]
187 samples
```
- The toast appears **live, without a reload**, carrying author, channel and message text.
- The bell increments in the same transition, so banner and badge are consistent.
- It **auto-dismisses after ~5.2 s** (t+024.4 → t+029.6).

**This was only catchable by polling from before the trigger.** The toast lived about five seconds
inside a seventy-five second window; any single after-the-fact read would have found nothing and
concluded there is no toast. That is the same trap as the deep-link highlight earlier — the
time-axis version of "my probe did not see it, so it is not there".

**Notification surface, end-to-end status after this pass** (all newly possible today):
```
channel message raises a notification row     verified working
bell badge increments live                    verified working  (contrast: sidebar unread badge does NOT)
panel row renders author, channel, body       verified working
realtime toast in a visible tab               verified working, ~5.2 s
click-through to /c/<channelId>?m=<messageId> verified working, target visible, badge decrements
deep-linked message highlighted               verified working (transient flash, ~2 s)
channel mute suppresses it                    verified working, both halves of the control
unmute restores it                            verified working
```

## Mentions vs channel mute — verified working, discriminated in one mute state (18:06)

Also newly testable. Mentions are a **distinct** notification, not a channel message with a flag:
```
plain message  type 1  event_type channel_message  title_key NOTIF_TITLE_CHANNEL_MESSAGE
                       title "New channel message"   actor_name "QA Alice"
mention        type 2  event_type mention           title_key NOTIF_TITLE_MENTION
                       title "You were mentioned"    actor_name "QA Alice"
```
Both carry the **display name** in `actor_name`, so the whole messaging producer formats the
actor correctly — it is only the calendar one that emits a username.

**A mention pierces channel mute; an ordinary message does not — measured in the same mute
state, back to back, which is what makes it a discrimination rather than two separate results:**
```
mute        POST /api/v1/notifications/channels/{id}/mute -> 200, control "Unmute" aria-pressed=true
            baseline total 6
mention     -> total 7, a second "type2 mention … You were mentioned" appears
plain msg   -> total 7, unchanged; no new channel_message
            (posted immediately after, same channel, same mute, same recipient)
unmute      DELETE …/mute -> 200, control back to "Mute notifications" aria-pressed=false
```
That is the behaviour a user would expect — mute quietens the channel without hiding a direct
call for attention — and it is now demonstrated rather than assumed. **No defect.**

## Notification panel at volume — verified working (18:08)

With 7 notifications the panel becomes scrollable and every row stays reachable:
```
API: total 7 (limit 5 / 30 / 100 all return the same 7 — no server-side cap in play here)
panel open, at rest:  DOM rows 7, visible 4, scroller 881px content in a 448px viewport
                      visible: 2 × "You were mentioned", 2 × "New channel message"
scroll the panel's scroller to the bottom (scrollTop 0 -> 433, i.e. 881-448, fully scrolled):
                      DOM rows 7, visible 3
                      visible: 2 × "Meeting starting soon", 1 × "Meeting cancelled"
4 + 3 = 7 — every row reachable, newest first, no clipping and no hidden rows
```

**Measurement caveat on my own check:** I computed "all reachable" by unioning the visible row
texts into a Set, which reported 4 distinct rows and `allReachable: false`. That is wrong — the
two mention rows carry identical text and collapsed into one entry, as did the two reminders.
The row *counts* (4 at top, 3 at bottom, 7 in the DOM) are the reliable measure.
**Deduplicating by text silently under-counts whenever a list can legitimately contain
duplicates**, and a notification list is exactly such a list.

## Weekly recurrence — verified working (18:10), recurrence matrix now complete

```
"Every week", start Wed 2026-09-02 14:00
POST /api/v1/calendar/meetings -> 200
12 occurrences, 2026-09-02 … 2026-11-18
every one on UTC weekday 3 (Wednesday) — weekdays set is [3], no drift
sample: 2026-09-02, 09-09, 09-16, 09-23, 09-30   (exactly 7 days apart)
horizon ~11 weeks, consistent with the ~3-month horizon measured for daily and monthly
```

**Recurrence matrix, all three verified this pass:**
```
Every day    90 occurrences, ~90 days               per-occurrence edit and delete correctly scoped
Every week   12 occurrences, ~11 weeks, no weekday drift
Every month   3 occurrences, Aug 31 -> Sep 30 -> Oct 31   clamps to the month's last day
                                                          without letting the drift persist
```
The only recurrence finding is the one already reported: editing an occurrence never says it
applies to one day only, while deleting one does.

## Message requests — populated and exercised for the first time (18:15)

The morning pass and my own first sweep both saw this panel only in its empty state. Creating a
real request populated it. **Note the border:** DM requests themselves are sector C's; the
sidebar panel and its badge are sector E's. This covers the panel.

**Creating the request — the sidebar's own `New direct message` control works.**
```
sidebar "New direct message" -> /w/{ws}/directories?tab=people&intent=dm
click "Message" on a person's row
  POST /api/v1/messaging/dm -> 200
  {"channel_id":"C4OWQV2ZT4AAI6R","user_id_1":"U…ALICE…","user_id_2":"U…BOB…","status":"pending",…}
  -> navigates to /w/{ws}/d/C4OWQV2ZT4AAI6R, sender's sidebar shows the DM immediately
```
The DM starts `pending`, which is what makes it a request rather than a conversation.

**The recipient's panel — verified working.**
```
sidebar control aria-label: "Message requests: 1"   badge text "1"   <- the count is in the accessible name
panel: "Message requests | Messages from people you have not chatted with. Accept a request to
        move it to Direct messages, or block the sender. | QA Alice | Accept | Block"
recipient's DM list at this point: []   <- correctly NOT yet a DM
```

**Accept — verified working, and live.**
```
click Accept -> POST /api/v1/messaging/dm/C4OWQV2ZT4AAI6R/accept -> 200 {"status":"accept"}
panel closes on its own
WITHOUT reloading:  control label "Message requests: 1" -> "Message requests"  (count gone)
                    DM list [] -> ["QA Alice"]
after a full reload: identical
```
So the copy's promise — "Accept a request to move it to Direct messages" — is kept, and both the
badge and the sidebar list update **live**. Worth noting against the unread-badge finding: the
sidebar is perfectly capable of updating without a reload; it is specifically the unread count on
a channel row that does not.

**Measured, not a defect:** creating the DM request raised **no notification** for the recipient
(their total stayed at 7, newest still the two mentions). The badge on the panel is the only
signal. Defensible — a request is not a message — but recorded because "you have a message
request" is the kind of thing a user might expect in the bell.

**Rig note:** my first attempt failed with `button[aria-label="Message requests"]` not found.
The label is **`Message requests: 1`** once there is one — the control renames itself to carry the
count, so an exact-match selector breaks precisely when the feature has something to show. Same
family as the morning pass's lesson that controls here are labelled with their current *value*.
`aria-label^="Message requests"` works.

## ALK-3016 — the ticket's confirmed cause is wrong, and here is the rule (18:35)

Earlier I recorded that ALK-3016 reproduced "with the roles reversed" and flagged one variable
that might explain it (I shared into a **channel**, the ticket shares to a **person**). I chased
that down. **It is not the role and it is not the share target — it is whether the viewing client
had the message rendered before the file was deleted.**

Four measurements, same symptom family, now reconciled:
```
A. channel share, only the OWNER had viewed the message before the delete
     owner     img alt="<name>" nat0x0 op0   no placeholder     <- empty box
     recipient NOIMG                          "Unavailable file | File reference unavailable"

B. DM (person) share, BOTH had viewed it before the delete
     owner     img alt="<name>" nat0x0 op0   no placeholder
     recipient img alt="<name>" nat0x0 op0   no placeholder     <- recipient now ALSO empty

C. channel share again, BOTH deliberately viewed it before the delete
     owner     h294 img alt="chanimg.png" nat0x0 op0  no-placeholder
     recipient h294 img alt="chanimg.png" nat0x0 op0  no-placeholder
   (both had rendered it seconds earlier: h294 img alt="chanimg.png" nat40x40 op1)

D. server payload, identical for every viewer in every case
     "files":[{"id":"F…","status":"deleted"}]          — no filename, no url
```
Traces are 10–16 samples over 7–13 s per account, so none of these is a transient read.

**The rule.** A client that had the message in its cache keeps rendering
`<img alt="<filename>">` from stale local state — the filename is not even in the payload any
more — and since the image 404s, its opacity never rises, leaving an unexplained blank the size
of the picture. A client loading the message fresh sees `status: "deleted"` with no filename and
renders the correct `Unavailable file` placeholder. Sender and recipient are irrelevant; both
behave either way depending on what their client already holds.

**Why this matters for the ticket.** ALK-3016's «Подтверждённая причина» says the broken state is
"в сессии получателя" — it names the recipient's session. That is the half the ticket happened to
observe, and a developer following it would look at role-dependent rendering, which does not
exist. The actual defect is that **a cached message is never re-evaluated against the deleted
status**, which is also a stronger and more general statement: it explains the sender case, the
recipient case, DM and channel alike.

**Not reported** — ALK-3016 is open and this is the same defect. Recorded here, and passed to the
supervising session so it reaches whoever triages it. This is the correction, not a new finding.

## Files sharing matrix — complete, all verified working (18:38)

```
share into a CHANNEL   POST /files/{id}/shares -> 200 {"type":"channel","target_id":"C…","target_name":"qa-…"}
                       + POST /messaging/messages into that channel
                       recipient: scope=accessible 1, "Shared with me" shows it
                       sidebar moves that channel to the top (ALK-3017, verified working)
share to a PERSON      POST /files/{id}/shares -> 200 {"type":"user","target_id":"U…","target_name":"QA Bob"}
                       + POST /messaging/messages into the DM channel
                       recipient: scope=accessible 1 (normal.txt), "Shared with me" 1 file · 13 B,
                       FILE TYPE counter "Documents 1 loaded"
owner deletes          recipient: scope=own 0, scope=accessible 0, "Shared with me" empty
                       (no orphaned entry — verified earlier)
File Details           reflects the channel share as "SHARED WITH | 1 | #qa-… | Channel"
```
The people half of the share picker only lists **existing chats**: searching a colleague's name
returned `No chats match your search.` until a DM with them existed, after which a `PEOPLE`
section appeared with them in it. Consistent with the dialog's own title, "Share file to a chat".
Not a defect — but it is why ALK-3016's reproduction step "выбрать коллегу в PEOPLE" cannot be
followed on a fresh lane, where no DMs exist.

## Notification type matrix — complete (18:25), all verified working

Every notification type this workspace can produce, with the payload that names it:
```
type 1  messaging / channel_message  NOTIF_TITLE_CHANNEL_MESSAGE  "New channel message"   actor "QA Alice"
type 1  messaging / dm_message       NOTIF_TITLE_DM_MESSAGE       "New direct message"    actor "QA Alice"
type 2  messaging / mention          NOTIF_TITLE_MENTION          "You were mentioned"    actor "QA Alice"
type 3  calendar  / meeting_reminder_30m  NOTIF_TITLE_MEETING_REMINDER   "Meeting starting soon"  (no actor, System)
type 3  calendar  / meeting_reminder_10m  NOTIF_TITLE_MEETING_REMINDER   "Meeting starting soon"  (no actor, System)
type 3  calendar  / meeting_cancelled     NOTIF_TITLE_MEETING_CANCELLED  "Meeting cancelled"      actor "qa_e_alice"
type 3  calendar  / (invitation)          —                              "Meeting invitation"     actor "qa_e_alice"
```
DM messages get their own type and title rather than reusing the channel one — correct.
An attachment-only message (a file share with no text) produces a notification whose body reads
`File`, which is a sensible placeholder rather than an empty string.

**The actor-name split holds across the whole matrix:** every `messaging` notification carries the
display name (`QA Alice`); every `calendar` one carries the username (`qa_e_alice`). That is the
sharpening of the morning pass's BUG-4 already recorded above — it is the calendar producer, not
a shared formatter.

## Display settings — they DO persist, and one finding (18:35)

Found via the `Cmd/Ctrl+Shift+T` panel (an `<aside>`, see withdrawal 5). Contents:
`Theme Light | Dark | System · Accent color (6 swatches + Custom + Reset accent) ·
Font scale XS S M L XL · Density Compact | Cozy · Reset all`.

### Display preferences persist — which sharpens finding 8

```
set Dark + Compact:  data-theme=dark  data-density=compact  --density-row 28px (from 32px)
                     body background rgb(17,20,26)
after a full reload: data-theme=dark  data-density=compact             <- persisted
on another route:    data-theme=dark  data-density=compact             <- persisted
```
So the app **does** have a working preferences store, and theme, density, accent and font scale
are wired into it. The four preferences in finding 8 — sidebar collapse, sidebar section collapse,
Files view mode, Files sort — are not. That turns "nothing persists" into "the store exists and
these four are not using it", which is a far better pointer for whoever fixes it. Report updated.

### BUG-10 [Low] [frontend] `Reset all` в Display settings не сбрасывает тему

The control is labelled `Reset all`. It resets density and font scale and leaves the theme alone.
```
changed to:        theme=dark  density=compact  font scale XL   (selected: Dark, XL, Compact)
click "Reset all": theme=dark  density=cozy     font scale M    (selected: Dark, M, Cozy)
after reload:      theme=dark  density=cozy     font scale M    — the un-reset theme persists too
```
Not "System resolving to dark": the browser reports
`matchMedia('(prefers-color-scheme: dark)').matches === false`, and the `Dark` button is
explicitly `aria-checked="true"` while `Light` and `System` are `false`. So the user is left on a
theme they set, after asking for everything to be reset.

**Severity call.** Rated **Low** rather than Medium deliberately: the shortfall is visible the
instant it happens (the page is still dark), the workaround is one click on a control already on
screen, and nothing but a display preference is affected. By the strict rubric "broken UX with a
workaround" would read Medium; I am under-claiming rather than over-claiming and saying so, so
triage can raise it.

**Подтверждённая причина — omitted.** Behaviour measured; mechanism not established.

**Dedup:** no open ALK bug mentions reset / theme / appearance / display settings.

## Font scale and density — verified working, and no layout damage at the extremes (18:40)

**Font scale works** — it drives a CSS variable rather than the root font size, which is why a
naive `getComputedStyle(documentElement).fontSize` read shows a constant 16px and looks inert:
```
Extra small   --text-body 13.66px   sidebar link 13.66px   main heading 17.57px
Medium        --text-body 17.08px   sidebar link 17.08px   main heading 21.96px
              (rootFont and bodyFont stay 16px in both — the wrong thing to measure)
```
**Density works** — `Compact` moves `--density-row` from 32px to 28px and `data-density` follows.

**No layout damage at the largest scale.** Checked four screens at `Extra large`, looking for
leaf nodes whose content overflows their box and for controls pushed outside the viewport:
```
/files          clipped [] offscreen []  docScrollWidth 1920 = innerWidth  no horizontal overflow
/calendar       clipped [] offscreen []  docScrollWidth 1920 = innerWidth  no horizontal overflow
/directories    clipped [] offscreen []  docScrollWidth 1920 = innerWidth  no horizontal overflow
/c/<channelId>  clipped [] offscreen []  docScrollWidth 1920 = innerWidth  no horizontal overflow
```

**Measurement note — my first pass reported clipping on every screen, and all of it was false.**
The hits looked like `"Create event Monday at 0:00" [285>1]`, `"QA Alice, 18:00" [113>1]` — note
the `clientWidth` of **1**. Those are screen-reader-only labels, which are 1px boxes holding real
text, so `scrollWidth > clientWidth` is true for every one of them by construction. My `vis()`
helper does not exclude them: a 1px-wide element has a non-zero rect and can win its own hit test.
**The clipping test needs two guards, not one** — CLAUDE.md already says to skip
`text-overflow: ellipsis`; it also needs a minimum `clientWidth` (I used 24px) or every sr-only
label in the app reports as clipped. With both guards, all four screens come back empty.

## Meeting "Invite by email" — verified working (18:45)

Opens inline in the meeting card: `Name (optional)` + `name@example.com` (type=email),
`Remove recipient`, `Add another`, `Message`, `Send invitations`.

```
empty email          Send invitations disabled=true,  opacity 0.5
"not-an-email"       Send invitations disabled=false             <- enables on any content
"someone@example.com" Send invitations disabled=false
```
Enabling on any content is **not** a defect here — validation runs on submit, the same pattern the
meeting-creation form uses. Probed with a **syntactically invalid address only**, which cannot be
delivered to anyone:
```
POST /api/v1/meetings/{meetingId}/invitations -> 400
{"code":400,"key":"COMMON_INVALID_INPUT",
 "message":"invalid request body: invitees ([0] (email (invalid value)))","trace_id":"…"}
form stays open with the values intact; message shown:
  "Check the recipients — the list may be invalid or the meeting has already ended."
```

**Deliberately not tested: sending a real invitation.** That is an outward-facing action — it
emails a person on the user's behalf — so I probed validation with an address that cannot reach
anyone and stopped there. Sending to a deliverable address needs the user's say-so.

**Rig note, sixth of its kind:** `Send invitations` first appeared to be missing from the card
entirely — it was absent from the enumerated controls while its text was in the card's `innerText`.
It sits at `y=1162` on a `1062`-high viewport, i.e. **below the fold**, so it fails the hit test in
`vis()`. `scrollIntoView` brings it to `y=907, vis=true, inViewport=true`. Same family as the
calendar chips and the month-overflow button.

## Observation: specific server errors are replaced by vaguer client copy (twice now)

Not written up — each instance is trivia on its own. Recorded because it is the same shape twice,
and a third instance would make it worth filing as one finding:
```
invite by email   server: "invalid request body: invitees ([0] (email (invalid value)))"
                  user:   "Check the recipients — the list may be invalid or the meeting has
                           already ended."          <- two unrelated guesses, neither confirmed
file upload       server: 400 FILE_INVALID_REQUEST "файл пустой"
                  user:   "empty.txt could not be uploaded"   + a Retry that can only fail again
```
In both cases the server said exactly what was wrong and the client offered something weaker.
The second one is arguably worse than the first, since it also invites a retry that cannot succeed.

## Consolidated re-verification of all ten findings (18:40) — every one holds

Run against `data-dpl-id="v0-61-0-rc-5-c4b5386b4a3a"`, confirmed in the same run, on freshly
loaded pages, hours after each was first measured and after a great deal of unrelated state had
changed on the lane (a second workspace, a DM, mute toggled twice, display settings changed and
restored, ~30 messages, ~115 meetings).

```
F1  full search scope        from channel A: All=0  scopeChip=0  promisesWorkspace
                             from channel B: All=1  scopeChip=0  promisesWorkspace          HOLDS
F2  RSVP deep link           deep link Yes:DIS,No:DIS (12 samples) | chip click Yes:en,No:en
                             by-id payload has_my_status=false, 25 keys                     HOLDS
                             (re-verified on a meeting created by ANOTHER session)
F3  presence in People       api 2/7 online, 7 person rows, statusNodes 0                   HOLDS
F4  recurring edit scope     card shows "Repeats"; edit dialog series=false occurrence=false
                             thisEvent=false                                                HOLDS
F5  :@ typed filter          plain      q=unread&company_id=…&workspace_id=…
                             :@ Bob …   q=unread&company_id=…&workspace_id=…&channel_ids=…
                             the name is absent from the query either way, no author param  HOLDS
F6  reminder picker          shown "15 minutes before"; POST body keys:
                             workspace_id,title,starts_at,ends_at,timezone,meeting_url,
                             location,attendee_user_ids,guest_invites,requires_approval,
                             is_private,mute_on_join,who_can_open_rooms,max_rooms
                             — no reminder field                                            HOLDS
F7  shortcuts in a channel   Cmd+K -> Insert link (bk12->16), Cmd+N -> nothing (bk12->12),
                             Cmd+Shift+T -> Display settings (bk12->13)                     HOLDS
F8  Files view persistence   chose List view -> after reload Grid view                      HOLDS
F9  start-date desync        start=2026-09-12 end=2026-08-26 summary "Wed, Aug 26 · 7:00 PM" HOLDS
F10 Reset all vs theme       set Dark -> after "Reset all" still dark (then restored light)  HOLDS
```

**Nothing withdrawn at re-verification.** SECTORS.md warns that roughly a quarter of findings from
a long unattended pass do not survive this step; none of these ten were first-run conclusions —
every one had already been measured at least twice, and the five withdrawals that did not survive
were killed during the pass rather than at the end.

Fixture state left as found by this step: theme restored to `light`, density `cozy`.

## Second workspace — empty states all correct (18:45)

The near-empty second workspace is a genuinely different state of every sector-E screen, and all
of them are right:
```
/calendar      grid renders with day headers and the full toolbar; no chips (no meetings)
/files         full filter chrome, storage panel, no files
/directories?tab=people    "Other | 1 | QA Alice"  — one member, correct
/directories?tab=channels  "second-ws-channel | Public | No topic | Open"  — correct affordance
/chat/mentions "All (0) | Unread (0) | No mentions yet | When someone mentions you in a channel
                or direct message, it will appear here."
```

**Measurement note — a false difference I nearly recorded.** Reading visible leaf nodes by
`textContent` gave `Browse`, `File type`, `Chats`, `Other`; earlier reads of the same screens in
the main workspace gave `BROWSE`, `FILE TYPE`, `CHATS`, `OTHER`. That looks like the two
workspaces rendering labels differently. They do not: **`innerText` applies `text-transform`,
`textContent` does not.** The earlier reads used `main.innerText` (so uppercase, as displayed);
this one used leaf `textContent` (so the source casing). Mixing the two across runs manufactures
a difference that is not on screen. Pick one and stay with it — `innerText` for what the user
sees, `textContent` only when the raw string matters.

## "See all in Messages" is NOT another entry into the search-scope defect (18:47)

Checked deliberately, because if it were a second entry point the finding would need widening.
It is not:
```
global dialog, query that lives only in the other channel
  All=1 Msg=1   scopeChip []   13 controls   "See all in Messages" present
click "See all in Messages"
  URL unchanged (/w/{ws}/c/{channelId})    still the dialog, not the page
  All=1 Msg=1   12 controls   "See all in Messages" gone
```
It switches the dialog to the Messages tab and **keeps the result**. Only `Open full search`
navigates to `/c/{channelId}/search` and loses it. Finding 1 is therefore correctly scoped to
that one control, and the report's title names it specifically.

## Files CHATS filter — verified working, now that files have actually been shared (18:48)

Earlier this filter could only be seen in its empty state (`No chats in loaded files`) because no
file on the lane had a share. With a real share it populates and filters:
```
CHATS section: "All chats | Q QA Bob | 1 loaded"
All chats  -> 5 files   summary "5 files · My files · 109 B"
click "QA Bob" -> 1 file (normal.txt)   summary "1 file · QA Bob · 13 B"
click "All chats" -> 5 files   summary "5 files · My files · 109 B"
```
The summary line renames itself to the active filter rather than continuing to say "My files",
which is the detail that makes the filtered state unambiguous. Only the DM appears because the
two channel-shared files were deleted earlier in this pass — consistent, not a gap.

## File viewer / lightbox — verified working, plus an extension to ALK-2876 (18:58)

**Viewer — verified working.**
```
click a file in the library -> lightbox opens
  "viewer.png | 1 / 2"   controls: Download | Open original | Close | Previous image | Next image
  img nat120x80 rendered120x80 object-fit contain vis=true    <- natural size, contained
"Next image" -> "fake.png | 2 / 2"                            <- paginates across the library's images
"Open original" -> opens a second tab at /api/v1/files/{id}/content
```
`Open original` going to the raw content route is correct for "original" — and distinct from
`Copy link`, which ALK-3015 fixed to produce an app URL. Both behaviours are right; they are
different jobs. (The extra tab was closed afterwards; the lane is back to one tab per window.)

### Для триажа ALK-2876 — the gap is wider than the ticket says, in two dimensions

**ALK-2876** (`HEIC File не отображается в preview-зоне File Details`, Backlog) root-causes the
symptom precisely: «В `FilePreviewPanel.tsx` отсутствует onError fallback … поэтому failed image
load оставляет пустую preview-зону». That is exactly the mechanism I hit — but with a file whose
*content* is not a valid image rather than an unsupported format, and in **two** components, only
one of which the ticket names:
```
File Details preview (FilePreviewPanel — the ticket's component)
  img nat0x0  rendered 299x196  vis=true  op=1     <- a visible, empty 299x196 area
  panel text carries no error at all; still offers "Open full-size image"

the lightbox / viewer (NOT named in the ticket)
  img nat0x0  rendered  84x24   vis=false op=0     <- an invisible box
  no error text either
```
So: (1) the trigger is not specific to HEIC — any image whose bytes fail to decode does it, which
is a much easier case to reproduce than obtaining a HEIC; (2) fixing `FilePreviewPanel.tsx` alone
would leave the viewer silent. **Not reported** — same defect class, open ticket. Recorded as a
scope note for whoever picks it up.

## Files Favorites filter — verified working (18:53)

Tested with a real favourite rather than in its empty state:
```
off  6 files   summary "6 files · My files · 1019 B"   aria-pressed=false
on   1 file    summary "1 file · Favorites · 47 B"     aria-pressed=true
     the one file shown is the one flagged is_favorite in the API
off  6 files restored, summary and aria-pressed back
```
Like the CHATS filter, the summary line renames itself to the active filter. Note that
`Favorites` **does** expose `aria-pressed` while the `Date`/`Name`/`Size` sort buttons in the same
toolbar do not — the inconsistency already logged under the sort control.

## Invalid deep links — verified working across the sector (18:55)

Untested ground: what the shell does when a route carries an id that does not exist or is
malformed. Every case degrades gracefully and the shell survives — no crash, no blank page, no
broken chrome.
```
/c/<nonexistent channel id>   -> /c    shell intact
                                 "Select a chat | Choose a channel or direct message from the
                                  sidebar to continue."
/c/not-an-id                  -> /c    shell intact, same empty state
/d/<nonexistent dm id>        -> /d    shell intact
                                 "Select a channel | Choose a channel from the sidebar to start chatting"
/calendar/<nonexistent id>    -> stays on the URL, shell intact
                                 dialog "Event not found"
/files?file=<nonexistent id>  -> /files, normal library, no error and no broken panel
                                 (the bad parameter is simply ignored)
/w/<nonexistent workspace>/directories -> redirected to the user's real workspace
```
`shellIntact` was checked positively on every one — `nav` present and the rail's `Calendar`
control visible — rather than inferred from the absence of an error.

**Low, logged not reported:** the not-found dialog renders its title and body as the same string,
`Event not found | Event not found`. Cosmetic.

## Independent re-verification of the morning pass's findings on rc.5

Their report was re-verified by them on `v0.61.0-rc.4`; this pass re-checks it independently on
`v0.61.0-rc.5`. Not re-reported — these are their findings.

**Their BUG-1 / now ALK-3539 (participant list only for the organiser) — reproduces exactly.**
Same meeting, same endpoint, two accounts:
```
organiser  GET /api/v1/calendar/meetings/{id} -> 200, 1064 B, top-level keys "meeting,attendees"
           card: "… Scheduled by You | QA Bob | optional | Yes | Responded Aug 26, 2026, 15:31 …"
invitee    GET /api/v1/calendar/meetings/{id} -> 200,  649 B, top-level keys "meeting"
           card: "… Scheduled by QA Alice | Participant list unavailable | Your response | Yes | No …"
```
The key list and the byte length are the whole finding: the same endpoint returns a different
shape depending on who asks.

**This also confirms the mechanism behind my own BUG-2's triage note.** The invitee's response
carries neither `attendees` nor `my_status`. `scheduledMeetingRsvp.ts:26` falls back to searching
`attendees` when `my_status` is absent — so if ALK-3539's fix returns `attendees` to the invitee,
the RSVP buttons would light up as a side effect, even with `my_status` still missing. That is now
measured rather than reasoned: the organiser, who *does* receive `attendees`, is the only account
for whom that fallback could ever succeed.

**Their BUG-2 (global search never finds people or channels) — reproduces.** `Channels 0 |
People 0` on every query tried this pass (`probe`, `zarplex`, `qa-e-image`, `png`, `unread`),
while message and file buckets return results from the same call.

**Their BUG-3 (file search matches on any word) — reproduces.** `qa-e-image` returns **2** files
when only one is named that; `png` alone returns 0, so matching is on hyphen/dot-split tokens.

**Their BUG-5 (sidebar unread badge stale) — reproduces**, with a tighter measurement than the
original: 300 ms polling from before the trigger, ~333 samples, the channel row's label never
changing while `GET /workspaces/{ws}/unread` reported `unread=1`, and a reload alone surfacing it.

**Their BUG-4 (calendar notifications use the username; invitation body carries a raw token link)
— both halves now confirmed, including the half this pass had previously left untested.**

The invitation body was the gap: my earlier note said the token-link half "did not appear in the
reminder or cancellation bodies, both of which are clean". A fresh invitation produced it. One
`GET /api/v1/notifications?limit=12` on the invitee holds both notifications, thirty minutes apart,
from the same actor — which is a tighter proof than either finding had on its own:

```
{"title_key":"NOTIF_TITLE_MEETING_INVITE","title":"Meeting invitation",
 "body":"You've been invited to \"…\" — Aug 27, 2026 12:00 PM (Asia/Tashkent). Join:
         https://airion-cargo.store/calendar/join/fe146f…<64 hex>",
 "actor_name":"qa_e_alice","category":"calendar","event_type":"meeting_invite"}

{"title_key":"NOTIF_TITLE_DM_MESSAGE","title":"New direct message","body":"dm notification probe",
 "payload":"{…,\"sender_name\":\"QA Alice\"}",
 "actor_name":"QA Alice","category":"messaging","event_type":"dm_message"}
```

Same `actor_id`, same account, two spellings: `qa_e_alice` from `category:"calendar"`, `QA Alice`
from `category:"messaging"`. So it is not that the platform lacks the display name — the messaging
producer sends it and the calendar producer sends the username.

The body is also structurally different from the title. The title has a `title_key`
(`NOTIF_TITLE_MEETING_INVITE`); the body has no key and no params — it is pre-rendered English
prose. A client cannot translate it, which is what makes the English string permanent rather than a
missing translation.

**And the bell renders both, verbatim.** This is the user-visible half, which had not been measured:
```
row text : QA Meeting invitation qa_e_alice · Workspace You've been invited to "…" — Aug 27, 2026
           12:00 PM (Asia/Tashkent). Join: https://airion-cargo.store/calendar/join/fe146f…
anchors  : []            <- the 64-char URL is plain text, not a link
buttons  : ["qa_e_alice, Workspace: Meeting invitatio…"]
```
`anchors: []` is the sharp part: the join URL is displayed in full and cannot be clicked. The row's
own button carries the username too, so the accessible name a screen reader announces is
`qa_e_alice`, not `QA Alice`.

Not re-reported — this is their finding, and the extra measurements belong on their ticket if they
choose to add them.

## Settings → Sessions — swept, one hypothesis killed, the security control verified (19:05)

Settings is chrome, so it is sector E, and only Display/Appearance had been touched. Swept all of
`/settings/{account,privacy,notifications,sessions,about}` enumerating every visible control: no
console errors and no 4xx/5xx on any of them.

### The "no way to sign a session out" hypothesis — killed at the boundary

The first sweep showed `/settings/sessions` with **zero** controls in the settings pane, while the
page's own subtitle reads *"Every device signed in to this account, and how to sign one out."* That
looked like a promised control that does not exist.

It is not. With only one session there is nothing to sign out of, and the page correctly offers
nothing. Signing a second browser into the same account produced both controls at once:
```
sessions API : count 2  -> [{is_current:false}, {is_current:true}]
pane controls: ["button \"Sign out\"", "button \"Sign out other sessions\""]
```
`Sign out` is scoped to the non-current row; `Sign out other sessions` appears at the bottom. Also
re-enumerated under hover on each row — no additional hover-revealed controls, so the plain list is
the whole affordance. **Not a finding.** This is exactly the check that CLAUDE.md's "prove absence by
enumerating elements" rule is for: one session is a state, not an absence.

### Per-session revocation — verified working, both sides

Clicked the row-scoped `Sign out` (matched on **exact** text, so `Sign out other sessions` could not
be hit by accident) in the surviving window:
```
DELETE /api/v1/security/sessions/5f227be0-… -> 200
GET    /api/v1/security/sessions            -> 200, count 2 -> 1, remaining id is the current one
rows on screen: 2 -> 1
```
No confirmation dialog — an irreversible action, but a recoverable one, so recorded rather than
reported. Then, in the revoked browser:
```
GET /api/v1/auth/me                     -> 401 {"key":"COMMON_UNAUTHORIZED", …}
GET /api/v1/workspaces/{ws}/channels    -> 401 {"key":"COMMON_UNAUTHORIZED", …}
open tab, no reload -> /login?next=%2Fw%2F<ws>%2Fdirectories   (redirected itself)
after hard reload    -> /login?next=%2Fw%2F<ws>%2Fchat%2Fmentions
```
The right session was revoked, the token stopped working immediately, and the already-open tab sent
itself to `/login` without a reload while preserving `next`. Fully working.

### Device labels are an unbuilt feature, not a defect — deliberately not reported

Every row reads `Unknown device` with the raw user agent underneath and no OS line. The source
explains it exactly, and the explanation is why this is **not** being written up:
```
apps/web/src/features/settings/SessionCard.tsx:36-38
  const deviceLine  = session.device_label  ?? unknownDeviceLabel   // -> "Unknown device"
  const browserLine = session.browser_label ?? session.user_agent   // -> the raw UA
  const osLine      = session.os_label ?? ''                        // -> empty
```
The response carries none of the three (keys are
`id,user_agent,ip_address,expires_at,last_used_at,created_at,is_current,device_id`), so all three
fallbacks render. **But the fields are optional by design**, with the reason written next to them in
`packages/core/src/auth/sessions.ts:22-24`: *"Keep optional UI labels so newer backends can send
explicit device/platform hints without requiring a frontend deploy"*. And
`apps/web/src/generated/openapi.json` does not declare them either — the session item's properties
are exactly the eight the server sends.

So the backend is **not** out of contract, and filing this as a backend bug would send an unbuilt
feature to the wrong team. Logged, not reported.

One thing I nearly got wrong: both my rows showed an identical UA and IP, which looked like "you
cannot tell your sessions apart on a security screen". That is my rig — two Chrome-for-Testing
windows on one machine — not the product. Suspect the rig before the app.

### Left for a later pass
`/settings/notifications` renders three switches whose accessible names are **empty**
(`button "" =true`, `button "" =false`, `button "" =false`); their text labels sit outside the
control. Worth measuring properly rather than asserting from an enumeration.

## Settings → Notifications — verified working end to end (19:20), and a misread of my own caught

The page has three switches under an explicit save model (`Discard` / `Save preferences` with an
"N unsaved change" bar), not auto-save:
```
In-app notifications                    Show notification banners and toasts while you use Aloqa.
Mute channel notifications              Mute all channel notifications except explicit mentions.
Mute direct messages from unknown people
```

**The constraint, the error, and the save all behave correctly.**

Turning in-app notifications off on its own is rejected:
```
PATCH /api/v1/notifications/settings  {"in_app_enabled":false}
-> 400 {"code":400,"key":"NOTIFICATION_NO_DELIVERY_CHANNEL","message":"…","trace_id":"…"}
```
and the client surfaces it properly. Polled at 300 ms from before the click, the notice was present
in **16 of 17 samples**:
> In-app notifications cannot be turned off while no other delivery method is enabled.
> Keep at least one notification delivery channel enabled.

The unsaved-changes bar stays, `Save preferences` stays present and enabled, the switch keeps the
user's chosen position, and a reload restores the server value (`true,false,false`). That is the
right behaviour for a rejected save on a dirty form.

The combination the constraint actually wants is accepted and persists:
```
PATCH … {"in_app_enabled":false,"mute_all_channels":true}
-> 200 {"in_app_enabled":false,"mute_all_channels":true,"mute_unknown_dm_users":false,"do_not_disturb_enabled":false}
after reload: switches read false,true,false
```
Restored to `true,false,false` afterwards — third successful save, so the path is confirmed in both
directions.

### The misread — worth recording because the shape will recur

My first pass concluded "the save fails silently and the UI presents it as success". It did not. Two
mistakes stacked:
- The first run had **no poll**. It checked for a notice once, five seconds after the click, by which
  time the toast had gone. The second run polled from before the trigger and found it in 16/17
  samples. This is the house rule and I did not follow it the first time.
- I named the variable **`barGone`** but assigned it `innerText.includes('unsaved change')` — which
  is true when the bar is **present**. I then read `barGone: true` as "the bar disappeared". The
  measurement was right and my reading of my own field name was backwards.

Second time this pass that a variable name, not a measurement, produced a wrong conclusion. The
lesson is narrow and mechanical: **name the field for what the expression returns** (`unsavedBar`,
not `barGone`) — a negated name inverts every later reading of the log.

### Counter-example to an earlier observation in this log

Further up I noted that "specific server errors are replaced by vaguer client copy (twice now)".
Here the substitution runs the other way: the server's own message is Russian and names raw API
fields, and the client's English copy keyed off `NOTIFICATION_NO_DELIVERY_CHANNEL` is clearer than
the server's and correctly localized. So that observation is about those two screens, not a general
property of the app — recording it here so it is not later generalized into a finding.
The Russian server string never reaches the user, so it is not a user-visible defect and is not
being reported.

## Scope correction — the last hour was on sector D's ground, not mine (19:15)

`SECTORS.md` puts **personal settings — account, privacy, notifications, appearance, security and
2FA, sessions and "sign out other sessions", blocked users, about, language — in sector D**, and
sector E's own entry names "notification *settings* (sector D)" as owned elsewhere. E owns the
notification *panel* and bell, which is what I had tested earlier. The Sessions and Notifications
settings work above is therefore outside my sector. I checked the boundary after doing the work
rather than before.

**And sector D had already covered all of it, today.** `logs/AIRION-QA-2026-08-26-D-org.md`
(finished 12:41) records: per-session and "sign out other sessions" revocation verified including
the 401 on the other browser; the single-session no-control observation, flagged there as a Low
candidate; the notification-settings `PATCH`; and the empty accessible names on the
Notifications/Appearance toggles, logged not reported. So the hour reproduced completed work.

**Method note, and it is the cheap kind to fix:** read the sector's *"Owned by other sectors"* line
before opening a surface, not after. The in-scope list is what I checked at session start; the
boundary line is the half that would have stopped this.

**Nothing from it is being reported**, since every result was verified-working and the one defect
is already filed:

- `Unknown device` is **ALK-3005**, open. My independent source dig landed on the same cause the
  ticket already states, including that the backend sends none of `device_label`, `platform`,
  `os_label`, `browser_label`.
- **Correction for whoever triages ALK-3005:** its «Подтверждённая причина» cites
  `packages/features/settings/ui-web/SessionCard.tsx`, which **does not exist** at the deployed
  frontend commit. The file is `apps/web/src/features/settings/SessionCard.tsx:36`, and it is the
  only `SessionCard.tsx` in the tree. A developer following the ticket's path finds nothing.
  Not filed — commenting is the user's call.

### One published finding of mine sits on that boundary — kept, deliberately

Finding **10** (`Reset all` in Display settings does not reset the theme) is appearance settings,
so by the letter it is D's. Keeping it, for a reason that is checkable rather than a preference:
sector D's report for today is already published with four findings, none of them this one, and
their log records "Appearance — theme and density both working". So there is no duplicate to
create — theme *switching* does work, and the separate claim is that `Reset all` skips it. Removing
it would simply lose a measured defect that nobody else is carrying. Flagged here so the overlap is
traceable if D's next pass finds it too.

## BUG-11 [Medium] [frontend] Страница присоединения по недействительной ссылке — тупик: одна фраза и ни одного элемента управления

`join landing` was listed at the top of this log as untested. It is in sector E's calendar scope.
Tested with a real invitation token captured from a notification body.

**The working path is fine.** A valid token for a meeting that has not started yet:
```
POST /api/v1/calendar/join -> 200 {"state":"not_started","meeting":{…,"title":"…"}}
screen: "The meeting has not started yet | <title> | Start: Thu, Aug 27, 12:00
         | You can join from 11:30 | Leave"
interactive elements in the whole document: 1  -> button "Leave"
clicking Leave -> /w/{ws}/directories        (returns to the app correctly)
```
So the early-join window is stated, and there is a way out.

**The error path has no way out at all.** Two independent bad tokens, freshly loaded each time:
```
POST /api/v1/calendar/join -> 404 {"code":404,"key":"REALTIME_SCHEDULED_INVITE_TOKEN_NOT_FOUND",
                                   "message":"guest link token not found","trace_id":"…"}
document.body.innerText  ==  "Could not join the meeting"      (the entire page)
interactive elements in the whole document: 0
buttons 0 | links 0 | anything focusable 0 | no nav, no sidebar
scrollHeight === clientHeight (1062 === 1062) — nothing below the fold
```
Enumerated across the **whole document**, not `main`, and not from a text slice — that is the
standard this log holds itself to for absence claims. Reproduced on `0`×64 and on `a1b2`×16.

The message also drops the reason. The server distinguishes "token not found"; the screen says only
that joining failed, so the user cannot tell an expired link from a mistyped one from a cancelled
meeting. Combined with zero controls, a stale invitation link ends the session on a bare sentence —
the browser's Back button is the only recourse, and that is not part of the page.

**Adjacent open ticket found while deduping — not a duplicate, and not for the report.**
**ALK-3025** `[FE-WEB][AUTH] Reset password с недействительной ссылкой не даёт запросить новую` is
the same *shape* on a different screen, and it is explicitly milder: that page still offers
`Reset password` and `Back to sign in`. This one offers nothing. Its own «Фактический результат»
also notes that `/magic-link/verify` and `/auth/verify-email` do offer `Request a new link`, so the
product already has the pattern this page is missing.

## BUG-12 [Medium] [frontend] Directories складывает всех в одну группу OTHER, а поиск по отделу и должности не находит никого — при том, что поля заполнены

> ⚠ **The CAUSE in this write-up is WRONG. See "finding 9's PUBLISHED CAUSE WAS WRONG" (02:15 on
> the 27th).** It blames members arriving with no nested `user`. They do have one — the adapter at
> `packages/core/src/api/workspaces.ts:580-582` constructs it, hardcodes `email: ''`, and never sets
> `department` or `position` (that file contains zero occurrences of either word). The observable
> behaviour below is correct and unchanged; only the mechanism was wrong, and the original citation
> would send a developer to the directories feature instead of the core adapter.

Routed to me by the sector-D session because `SECTORS.md` puts Directories with sector E. **Not
taken on trust — re-measured independently end to end, including a positive control they did not
have on this lane.**

**Positive control first**, because "nobody filled the field in" is the obvious dismissal.
`Settings → Profile` offers `Display name | Job title | Department | Pronouns`. Filled two and
saved:
```
GET /api/v1/auth/me -> 200   "department":"Quality"   "jobTitle":"QA Engineer"
```
So the values are stored on the server.

**They never reach the directory.** Same account, freshly loaded `/w/{ws}/directories?tab=people`:
```
GET /api/v1/workspaces/{ws}/members?limit=50 -> 200, 7 members
member keys: user_id,name,username,is_guest,joined_at,presence,timezone,roles
member.user       -> undefined
member.department -> absent      member.position -> absent
```
The response carries neither field and has no `user` object to hold them, so nothing client-side
dropped them.

**Two user-visible symptoms, one root.**
```
grouping : every one of the 7 members sits under a single heading — "OTHER 7"
chips    : no department or position chip on any row, including the account that has both
search "Quality"      -> "No people match your search."     (her actual department)
search "QA Engineer"  -> "No people match your search."     (her actual job title)
search "Alice"        -> "OTHER 1" + QA Alice               (control: search itself works)
```

**Подтверждённая причина** — read at the deployed sha `c4b5386b4a3a`, paths verified to exist:
- `apps/web/src/features/directories/utils/directories.ts:60-61` —
  `member.user?.position` / `member.user?.department`, both `?? null`.
- `apps/web/src/features/directories/utils/directories.ts:97-99` —
  `const key = department === null ? UNASSIGNED_GROUP_KEY : department`, so every person lands in
  the unassigned bucket.
- `apps/web/src/features/directories/DirectoryPersonRow.tsx:72-79` —
  `person.department === null ? null : <chip>`, so the chips never render.
- `apps/web/src/features/directories/utils/directories.ts:62` —
  `searchValue = displayName + email + department + position`. Both are always `null`, which is why
  searching by either can never match. **This third consequence is mine, not in what was routed to
  me**, and it is the one squarely in sector E's search scope.

Members arrive flat, so `member.user?.…` is always `undefined`.

**Ownership, agreed with both sessions:** sector D reports the *settings* half — profile fields and
toggles that promise an effect nothing honours. This report takes the *directory* half. Different
screens, different symptoms, one root; cross-referenced rather than merged.

Not a duplicate: read the 188 open ALK bugs for directory/profile/member entries. The nearby ones
are **ALK-3521** and **ALK-2931** (both about a *blocked* user's row) and **ALK-3551** (a new member
appearing only after reload) — none about grouping, chips or field-based search.

## Directories → Channels: Join and Leave — both verified working (19:30)

The Channels tab discriminates membership correctly before anything is clicked:
```
qa-empty   PUBLIC  No topic  Join      <- not a member
qa-general PUBLIC  No topic  Open      <- member
```

**Join**, polled at 300 ms from before the click:
```
POST /api/v1/channels/{id}/join -> 200 {"channel_id":"…","success":true}
first observed change at 300 ms: sidebar gains the channel AND the app navigates into it
after reload: identical state, member count settles to 2
```
The joining user's own sidebar updates immediately — no reload needed. (Not evidence about
**ALK-3551**, which is about the *workspace member* list as seen by others, a different surface and
sector D's ground. Recorded so the two are not conflated later.)

**Leave**, from the channel header:
```
confirm dialog: "Leave channel — You will lose access to this channel unless you are added back.
                 Cancel | Leave"
POST /api/v1/channels/{id}/leave -> 200 {"channel_id":"…","user_id":"…","success":true}
directory afterwards: qa-empty is back to "Join"
```

**Fixture state restored** — `#qa-empty` is owner-only again, as the fixture table specifies.

Worth one line as an observation, not a finding: leaving a channel — reversible, since a public
channel can simply be rejoined — asks for confirmation, while signing a session out on
`Settings → Sessions` does not, and that one is irreversible. The inconsistency runs the wrong way.
The Sessions half is sector D's, and D already logged the missing confirmation there, so this is
only cross-referenced here.

## Note on peer edits to shared files

A peer session reports having added a "read source at the deployed sha" rule to `CLAUDE.md` and a
boundary-line instruction to `SECTORS.md` during this run. Neither is my edit and I have not
verified either. Flagging it here because `CLAUDE.md` changes are supposed to be proposed to the
user as a diff and approved, and because a shared file changing mid-run means my copy of the
conventions may differ from the one I read at session start.

## Calendar Week view — verified working, including the past-slot boundary (19:26)

Week is in sector E's scope and only Month and Day had been covered here. It turns out **Week is the
default view** — `Week aria-checked="true"` before anything was clicked — so it had been exercised
implicitly all pass, but never on its own terms.

**Slot creation prefills exactly the cell clicked**, across three different weeks:
```
week shown 24–30 August 2026   click "Create event Thursday at 14:00" -> 2026-08-27 14:00–14:30
week shown 7–13 September 2026 click "Create event Thursday at 14:00" -> 2026-09-10 14:00–14:30
```
Right day of the displayed week, right hour, 30-minute default end. Navigation does not leave the
prefill anchored to today — which was the boundary worth testing, given finding 9 is about the form
showing a date it will not use.

**Past slots are disabled, and visibly so.** This started as a candidate finding — clicking a slot
two weeks back opened nothing — and the measurement killed it:
```
past week,  Thursday 14:00 : disabled=true   cursor=not-allowed  opacity=0.5
past day,   Monday   14:00 : disabled=true   cursor=not-allowed  opacity=0.5
past hour today, Wed  9:00 : disabled=true   cursor=not-allowed  opacity=0.5
future day, Thursday  9:00 : disabled=false  cursor=pointer      opacity=1     -> dialog opens
```
The count checks out exactly: **45 of 105 cells disabled** = two fully past days (2 × 15 rendered
hours) + the 15 hours already elapsed today at 19:26. So the rule is per **hour**, not per day, and
it is applied consistently. Correct behaviour, correctly signalled — not a finding.

### Rig lesson — `HTMLElement.click()` does not open this dialog

My first attempt reported "no dialog" and looked like a defect: a visible 235×56 cell with a proper
`aria-label`, clicked, nothing happened. It was the rig. `el.click()` dispatches only a `click`
event; this grid opens on the pointer/mouse-down sequence, so the handler never ran. Driving
`page.mouse.move → down → up` at the cell's centre opens the dialog in **400 ms**.

Same family as the `<LI>`-wrapping-`<BUTTON>` problem earlier this pass: the click "landed" in the
sense that no error was thrown, and produced exactly the observation a broken feature would.
**For anything that might be a pointer-driven control, use a real mouse before believing a
negative.**

### And a truncation that nearly became an a11y finding

An early enumeration showed nine cells all named `Create event Monday ` and I started writing up
"time-slot cells carry no hour". They all carry one — `Create event Monday at 6:00` — and the
missing half was my own `.slice(0, 20)` on the label. All 105 cells have distinct names, all 105
contain a time. Third time this pass that my own instrumentation, not the app, produced the
anomaly.

## Seam: notification → files — verified working end to end (19:35)

`SECTORS.md` names this as one of the two seams worth crossing deliberately in sector E. Tested on a
file posted during the run, so the data is live rather than inherited.

```
alice posts seam-probe.txt (18 B) into a channel
  POST /api/v1/files/upload      -> 200 {"id":"…","filename":"seam-probe.txt","mime_type":"text/plain"}
  POST /api/v1/messaging/messages-> 200 {"id":"M…","body":"","channel_seq":19}

bob's bell:   "QA Alice, #qa-general: New channel message. File"
real-mouse click -> /w/{ws}/c/{channel}?m=M…            (the exact message)
destination message: "seam-probe.txt 18 B"
controls on it:      ["Download seam-probe.txt"]
```
Notification, deep link and the file surface all agree about the same object. Nothing to report.

### A candidate that dissolved at the boundary — notification body for a file

The first observation was that three separate file notifications all had `body: "File"`, with no
filename, so they were indistinguishable in the bell. That looked reportable. Probing the boundary
showed the scheme is coherent and deliberate:
```
one file, no text   -> body "File"
two files, no text  -> body "Files: 2"
text + one file     -> body "caption for the attachment"     (the message text wins)
```
Text is preferred when present; otherwise the count is given. "File" is simply the singular of
"Files: 2". The filename is never included, but that is a consistent design rather than a defect,
and it is exactly the cosmetic note that gets trimmed at triage. **Logged, not reported.**

### And one that was mine, not the product's

The click-through initially appeared broken: clicking the file notification left the URL unchanged.
That was `HTMLElement.click()` on the row container again — the notification row is a `<button>` and
the handler is pointer-driven. A real `mouse.move → down → up` navigates correctly. **Second time in
an hour that `.click()` produced a false negative**; the first was the calendar week grid. Treat a
negative from `.click()` on any pointer-driven control as unproven until re-run with a real mouse.

The destination also showed "Unavailable file / File reference unavailable" on the *older*
notification, which briefly looked like a notification/file disagreement. It is the file I deleted
myself earlier in this pass, and that empty state is already recorded above as correct behaviour.
Checked before writing it up rather than after.

**Leftovers added:** three messages with attachments in the channel (`seam-probe.txt`,
`seam-a.txt` + a caption, and `seam-a.txt`/`seam-b.txt` together) and their four uploaded files.
A plain member cannot delete their own messages here, so they stay.

## Recent searches — independently confirmed absent (19:40)

Only inherited from the morning pass so far, so verified here. Ran a distinctive query in the global
search dialog, submitted it, closed and reopened:
```
after query + Enter + Escape + reopen -> "Search messages, channels, people, and files. Cmd+K to open."
after a full page reload + reopen     -> identical
```
No history list, in-session or after reload. A feature that does not exist rather than one that is
broken — logged, not reported, consistent with how this log treats the workspace switcher's missing
unread badge.

**One thing this did corroborate:** the dialog's own help text reads *"Use typed filters like
`:in #general` or `:@ Alex`"*. Finding 5 is that `:@ <person>` never filters by author — so the
advertisement for the broken filter is in the dialog itself, one line above the input. Strengthens
finding 5 without changing it.

## Profile popups — corroborates sector D's finding, deliberately not reported (19:42)

`SECTORS.md` lists profile popups under sector E, so I tested them. The result is D's finding, not a
new one, and this is why.

First attempt was invalid: I opened the popup of an account with no profile fields set, which proves
nothing. Redone properly — **bob opening alice's popup, alice having both fields genuinely set**
(`/auth/me` shows `"department":"Quality"`, `"jobTitle":"QA Engineer"`):
```
popup text: "QA Alice | Message Call Block Share | SHARED CHANNELS · 2 | qa-general qa-private"
shows department: false   jobTitle: false   timezone: false   local time: false
controls: Close profile, Message, Call, Block, Share, and the two shared-channel links
```
So the popup is a **third** surface where a filled-in profile field is invisible — after the
directory row's chips and directory search, both of which are finding 12.

**Not added to finding 12, and not reported separately.** Two reasons. Finding 12's confirmed cause
is specific to `directories.ts` / `DirectoryPersonRow.tsx`; the popup is a different component whose
cause I have not read, and diluting a confirmed-cause section with an unverified one is exactly what
CLAUDE.md warns costs a developer more than an absent section. And sector D is already reporting the
settings-side finding — fields and toggles that promise an effect nothing honours — having measured
the popup omission themselves, including that `Show timezone` changes the popup not at all. Filing
it here would duplicate theirs.

Recorded as independent corroboration on a second lane, which is what it is worth.

## Seam: rescheduling a meeting → the invitee — verified working (19:39)

The scenario that matters in real use: the organiser moves a meeting, does the invitee find out? Run
with a **live poller installed on the invitee's page before the edit** (300 ms `setInterval` writing
into `window.__poll`, sampling the notifications endpoint, visible toasts, and the event chip), so
transients could not be missed the way an after-the-fact check would miss them.

Organiser's edit:
```
PATCH /api/v1/calendar/meetings/{id} -> 200
  {"title":"… RESCHEDULED","starts_at":"2026-08-27T10:00:00.000Z",
   "ends_at":"2026-08-27T10:30:00.000Z","timezone":"Asia/Tashkent"}      // 10:00Z = 15:00 +05
```

Invitee's timeline, from the poller:
```
t=53732 ms   chip "QA-E invite body probe 12:00-12:30 …"       (before)
t=153969 ms  notification appears: meeting_time_changed
t=154243 ms  chip becomes "… RESCHEDULED 15:00-15:30 …"        (+274 ms, no reload)
```
And the notification body is complete and correct:
```
title: "Meeting time changed"   title_key: NOTIF_TITLE_MEETING_TIME_CHANGED
body:  The time of "… RESCHEDULED" has changed: new time Aug 27, 2026 3:00 PM (Asia/Tashkent)
```
New title, new local time, timezone named. The invitee's calendar and the notification agree with
each other and with what the organiser sent. Nothing to report.

**Extra data point for the morning pass's BUG-4.** The same response holds both producers side by
side once more: `meeting_time_changed` carries `actor_name: "qa_e_alice"`, `channel_message` carries
`actor_name: "QA Alice"`. That is now three distinct calendar event types (`meeting_invite`,
`meeting_reminder_30m`, `meeting_time_changed`) emitting the username against messaging's display
name — so it is the calendar producer as a whole, not one code path.

### Rig note — the Edit form is not the Create form

`locator('input[data-field="event-start-time"]').fill()` timed out on the edit dialog. The Create
form exposes start/end as `input[data-field=…]`; the **Edit** form exposes them as **buttons**
(`Date and time: Aug 27, 12:…`) that open a picker, and only inside that picker are there
`input[type=date]` and `input[type=time]`. Exactly the trap CLAUDE.md names — a control missing as
`input[type=time]` sitting right there as a button — met on a real screen. Enumerate the dialog
before assuming the two forms share markup.

## Meeting edit form — access and duration both persist correctly (19:45)

```
duration 30 min -> 1 hr
  PATCH {"starts_at":"2026-08-27T10:00:00.000Z","ends_at":"2026-08-27T11:00:00.000Z", …} -> 200
  reopened form: "1 hr" aria-pressed=true, times "Aug 27, 03:00 PM" / "Aug 27, 04:00 PM"

access Public -> Private
  radios after the click: public=false, private=true
  PATCH {"is_private":true} -> 200
  reopened form: public=false, private=true
  GET /api/v1/calendar/meetings/{id} -> 200, "is_private": true
```
Both persist, in the form and on the server. Restored to Public afterwards
(`PATCH {"is_private":false}` → 200), so the fixture is as it was.

## The rig lesson of this session, and it nearly cost a wrong finding

**Three false negatives this evening, all from synthetic clicks**, and the third one was on its way
into the report.

1. Calendar week grid — `el.click()` on a time slot opened no dialog. Real mouse: opens in 400 ms.
2. Notification row — `el.click()` left the URL unchanged. Real mouse: navigates to the message.
3. **Meeting access radio** — `clickDeepest(dialog, /^Private$/)` appeared to do nothing, the save
   went out as `{"starts_at":…,"ends_at":…}` with no access field, and the setting read Public
   again on reopen. That is a complete, coherent, **wrong** finding: *"Meeting access can be set to
   Private but the choice is silently dropped."* Security-adjacent, and it would have been
   published.

   What actually happened: the click never reached the radio. Driving
   `mouse.move → down → up` at the label's own coordinates flips it (`private=true`), the save
   carries `{"is_private":true}`, and it persists.

The common thread is that this app's controls are pointer-driven, so a `click()` that dispatches
only a `click` event produces exactly the observation a broken feature produces: no request, no
state change, no error. CLAUDE.md already says *"Before concluding an action did nothing, prove the
action landed… Read the control's own selected or pressed state first."* Reading `input.checked`
before and after is what caught it — the control exposed its own state, and that state said the
click had not landed.

**Proposed CLAUDE.md addition — NOT applied, needs the user's approval.** It is a method line and
the problem has now cost three times in one session. Under "Browser tooling":

```diff
+- Controls here are pointer-driven: `element.click()` (and any snippet helper built on it) often
+  fails silently on dialogs, grids, notification rows and radio labels. Drive
+  `page.mouse.move → down → up` at the element's own coordinates, and confirm from the control's
+  own `checked`/`aria-pressed` state that the click landed before believing a negative.
```

It enables testing rather than limiting it, but the rule is that nothing goes into that file without
an explicit yes, so it stays here until asked for.

### Audit: do any of the twelve findings rest on a click that may not have landed?

Prompted by the false negative above, since the failure mode manufactures findings rather than
hiding them. Checked every finding whose claim is "X does not happen":

- **6 (reminder picker)** — the risk case, and it is safe. The form's own displayed state was
  captured with the request (`shownValue: "15 minutes before"`), so the selection demonstrably
  landed; the finding then rests on the **POST body**, which carries no reminder field of any kind,
  and on behaviour independent of any click (a meeting set to `No reminder` received two, and no
  T-5 ever arrived). Three independent legs, none of them a click.
- **5 (`:@` filter)** — entirely typed text plus request payloads, with `:in` as a working control in
  the same dialog. No click involved.
- **7 (shortcuts)** — real key events via `keyboard.press`.
- **1, 3, 4, 8, 9, 10** — each rests on an observed positive change (results changed, view changed,
  density and font scale did reset, the occurrence did move), so the interaction demonstrably landed.
- **2 (RSVP by URL)** — a `disabled` attribute plus a source citation, not an interaction at all.

None of the twelve is exposed. Recorded so a later pass does not have to redo this.

## Full-search page located, and finding 1 re-checked against a case where it does NOT fail (19:52)

`/w/{ws}/search` is not a route — it renders the app's own **Page not found**. The full-search page
is channel-scoped by construction: `/w/{ws}/c/{channelId}/search?q=…`.

**Finding 1 re-verified from the other direction.** Ran a query that *does* have matches in the
current channel:
```
"Open full search" from #qa-general, q=probe
 -> /w/{ws}/c/C4QEGENERAL0001/search?q=probe
 GET /api/v1/search?q=probe&company_id=…&workspace_id=…&channel_ids=C4QEGENERAL0001&limit=25
 All 14 | Messages 13 | Channels 0 | People 0 | Files 1
```
So the page is not broken in general — it returns results whenever the match happens to live in the
channel you were standing in. That is exactly what finding 1 claims (it narrows scope silently) and
it is why the zero is the *consequence*, not the mechanism. Checked that the report states it
conditionally rather than as an absolute: the reproduction steps name both channels explicitly and
the measurement shows both requests side by side, so the claim cannot be read as "always zero".
No change needed.

**The page's own copy is the promise being broken**, and it is worth quoting exactly:
`"Search messages, channels, people, and files in this workspace."` plus
`"Search across channels, direct messages, people, and files."` — both on the page that has just
added `channel_ids` to the request.

**Added to finding 11 in the report:** the app already has the escape-route pattern the join-error
page lacks. Its own not-found page renders
`"Page not found. This page does not exist in this workspace, or you do not have access to it."`
with **two** controls — `Back to workspace` and `Go to home`. The join-error page has **zero**. That
contrast makes the finding actionable without arguing for it: the same product, two pages, one of
them already does the right thing.

## Recurrence controls in the meeting form — mapped, and a candidate dissolved (20:05)

The Repeat control offers `Does not repeat | Every day | Every week` plus a separate
`Custom RRULE` button. **There is no end condition** on the presets — no "ends on", no "after N
occurrences" — which is the UI half of the recurrence-horizon question left inconclusive earlier.
It stays inconclusive for the reason already recorded: whether a ~3-month materialisation window is
extended by a background job cannot be established from the UI, and background jobs are out of this
sector's scope.

**`Custom RRULE` — a candidate that measurement killed, in two stages.**

First reading: a button next to Repeat, `disabled` property **false**, but `cursor: not-allowed`,
`data-state` stuck at `closed`, and clicking it changes nothing (13 inputs before, 13 after). That
looked like a control offered and silently inert — and worse, the dialog's two other unbuilt
features (`Room`, `Participant availability`) *do* label themselves "not available yet", so the
contrast suggested this one was simply forgotten.

Then I hovered it:
```
attributes : type="button"  aria-disabled="true"  data-state="closed"
computed   : cursor: not-allowed   opacity: 1   pointer-events: auto
on hover   : tooltip -> "Not available yet"
```
It labels itself exactly like its neighbours, just through a tooltip rather than inline text, and
`aria-disabled="true"` is the correct markup for a control that stays focusable so it can be
discovered and its tooltip read. Nothing wrong here. **Not a finding.**

The lesson is narrow and worth keeping: `element.disabled === false` does not mean "enabled" —
`aria-disabled` is the other half, and a control's explanation may live in a tooltip that only
appears on hover. Enumerating attributes without hovering produced a confident and wrong reading.

### Tally of candidates that measurement killed this evening

Five, and two of them were on their way into the report:
1. Sessions page "offers no way to sign out" — it does, once a second session exists.
2. Past calendar slots "silently do nothing" — they are `disabled`, `not-allowed`, `opacity 0.5`.
3. **Meeting access silently drops `Private`** — the click had not landed; it saves fine.
4. Notification body "File" — a coherent scheme (`Files: 2`, message text when present).
5. `Custom RRULE` "inert and unlabelled" — `aria-disabled` plus a "Not available yet" tooltip.

## Search below the API's minimum query length — a designed fallback, not a defect (20:15)

The search endpoint enforces a minimum:
```
GET /api/v1/search?q=a&… -> 400 {"code":400,"key":"COMMON_INVALID_INPUT",
                                 "message":"invalid query parameter \"q\": too short (min 2)"}
```

With one character typed the dialog **makes no request at all** and shows results anyway, which
looked like stale data from a previous query. It is not. Three single characters, each on a freshly
loaded page:
```
"a" -> "caption for the attachment"                     (contains a)
"z" -> "search index probe zarplexmt9oq1kn", "…zarplex71762"   (contain z)
"8" -> "verify-unread-84248"                            (contains 8)
api calls in every case: none
```
The matches are real — the client filters already-loaded messages locally rather than sending a
query the server would reject. At two characters it switches to the API (`200 q=al`) and shows
counted tabs.

**Not reported.** It is a sensible fallback below a documented server minimum, and the results are
correct for what was typed. The one asymmetry worth recording for whoever looks next: in the
one-character state the tabs render **without counts** (`All Messages Channels People Files`) and
the result set is only what the client happens to have loaded, whereas from two characters on the
tabs carry counts and the set is workspace-wide. A user typing one character therefore sees a
partial answer presented the same way as a complete one. Too subtle to be actionable as written, so
it stays here rather than in the report.

**Also confirmed, not reported:** the morning pass's BUG-2 boundary is already correct in their log
— they state "the defect is in the endpoint, not the rendering" and rule out index drift with a
positive control. My wider term set agrees: `total_users` and `total_channels` are **0** for
`Alice`, `QA Alice`, `alice`, `qa_e_alice`, `Bob`, `general`, `qa-general` and `private`, including
an exact username and an exact channel name. No correction needed to their finding.

## The channel-less member and private-meeting visibility — all correct (20:20)

Used the fixture built for exactly this: `qa.e.dave`, in the workspace but in **no channel**.
Signed the second browser into it, tested, and signed it back to bob afterwards.

```
sidebar channels                : none                                        correct
Directories → People            : all 7 members visible                       correct
Directories → Channels          : qa-empty and qa-general, both "Join";
                                  the private channel is not listed           correct
Files                           : "0 files · My files · 0 B", empty state     correct
GET /api/v1/search?q=probe      : messages 0, files 0                         correct — he is in no channel
GET /workspaces/{ws}/channels   : 0                                           correct
4xx/5xx across all four screens : none
```

**Private meetings are correctly scoped**, tested as a triangle on one meeting rather than asserted
from one view. The organiser set it private mid-test and back to public afterwards:
```
                       total in window   is_private rows   chip on the grid
organiser (creator)          21                 1                yes
invitee                      21                 1                yes  "…RESCHEDULED 15:00-16:00"
member, not invited          20                 0                no
```
So a `Private` meeting disappears from a non-invited member's list **and** grid, while remaining
visible to the two people entitled to it. No leak. Restored to public afterwards
(`PATCH {"is_private":false}` → 200).

### And it produced a real strengthening for finding 2

Measuring both endpoints for both roles on the same meeting:
```
                    list endpoint                by-id endpoint
invitee      my_status "pending"            no my_status,  keys: meeting          (667 B)
organiser    my_status "creator"            no my_status,  keys: meeting,attendees (1043 B)
```
The report already carried the invitee half. The new part is the **organiser** half: by-id omits
`my_status` for *both* roles. That distinguishes "the field is withheld from people who are not
invited" from "the field is not in this response at all" — it is the latter, which is a plainer fix
and removes a reading a triager could otherwise take. Added to the report's measurement block and
one clause to its «Подтверждённая причина». Republished.

## The guest account on sector E's screens — consistent, plus one judgement call (20:10)

`qa.e.guest` (`is_guest = true`, member of one channel) behaves exactly as its membership implies:
```
sidebar                   qa-general (unread 21)                 correct
Directories → Channels    qa-empty "Join" / qa-general "Open"    correct
Files                     0 files, own scope empty               correct
search q=probe            messages 13, files 1  (all from its one channel)   correct
GET /workspaces/{ws}/channels   1 -> ["qa-general"]              correct
4xx/5xx                   none
```
Nothing is treated specially because the account is a guest — it simply sees its one channel.

### Judgement call: the guest badge is on the profile card but not on the directory row

```
members payload   : is_guest true for that account, 6 others false
directory row     : "QA Guest"  — the name only; no badge
                    (the word "guest" appears once on the page, and that occurrence is the
                     fixture's own display name, not a label)
profile popup     : "… QG  QA Guest  Guest  Message Call Block Share …"   <- badge present
```
So the product **does** label guests, one click away, on the profile card that is used across the
app. What the list view does not do is let you tell a guest from a colleague while scanning.

**Logged, not reported**, and the reasoning is worth stating because it is a close call. Against
reporting: the information is not hidden, it is one click away on the card the app uses everywhere,
and this report already carries two findings whose shape is "the directory row omits a field the
payload carries" (presence, department/position) — a third would read as padding. For reporting: on
a workspace of fifty people, spotting who is external would mean opening fifty popups, and the
consequence — not realising you are about to share something with an outside party — is sharper
than a missing department chip.

I have left it out. If a triager wants it, the natural home is alongside finding 12 as a second
field on the same row rather than as its own ticket.

## Files — View details, Copy link, and the deep link it produces: all verified working (20:25)

`View details` (right-click on a file tile) opens a complete panel:
```
Details | seam-b.txt | 6 B | Uploaded by You | Date added Today | File type TXT | Size 6 B
SHARED WITH 1 -> #qa-general (Channel)
controls: Close preview, Open file preview, Share, Download, Share with more, Copy link,
          Add to favorites, Delete file
```
`SHARED WITH` matches where the file was actually posted.

**Copy link produces a link that works cold**, which is the half that matters:
```
clipboard <- https://<host>/w/{ws}/files?file=<fileId>
navigating there on a fresh load -> the preview pane opens on that file
pane: "seam-b.txt | TXT | seam-b.txt | Document · 6 B | two-b"
```
(`two-b` is the file's own contents, so the preview renders the body too.)

### Candidate seven, dissolved — "Copy link gives no confirmation"

My first pass polled for toasts only and found none across 3.5 s, which read as an action with no
feedback. Re-run with a poller installed **before** the click that also watched the button's own
label:
```
t=140 ms   button "Copy link"
t=1083 ms  button "Link copied"      <- the feedback
t=3125 ms  button "Copy link"        <- reverts
```
The confirmation is an inline label change on the control itself, not a toast. Precisely the case
CLAUDE.md's rule covers — read the control's own state first — and I looked everywhere except at
the control.

**Two instrumentation notes worth keeping**, both mine rather than the product's:
- My `vis()` helper uses `r.width < 1` as the floor, and `sr-only` regions are **1px** boxes, so
  they pass it. That is how an invisible live region announcing "Chat filters are ready." showed up
  as a visible notice on the Files page. A floor of ~24×12 px filters them out; the stricter poller
  above uses that and reports clean.
- Arriving by the `?file=<id>` deep link opens the **preview pane**, which does not contain
  `Copy link`; that button is in the **details** panel reached from the tile's context menu. A
  selector that works on one path is not guaranteed on the other.

## Failure handling across sector E — verified working, four error classes (20:20)

An axis this pass had not touched: what these screens do when their request does not succeed.
Driven with Playwright routing, per CLAUDE.md's note that a console `fetch` override does not work
here because the app captures `fetch` at module load.

**Network abort** (`r.abort('failed')`), each on a fresh load:
```
Directories → People   "Could not load people. Retry"    spinners 0   Retry present
Files                  "Could not load files  Retry"     spinners 0   Retry present
Calendar               "Could not load events Retry"     spinners 0   Retry present
```
No blank screens, no stuck skeletons, and the surrounding chrome stays usable in each case.

**Server statuses**, fulfilled with a realistic error body
(`{"code","key","message","trace_id"}`):
```
members  500 -> "Could not load people. Retry"      no raw leakage
members  403 -> "Could not load people. Retry"      no raw leakage
meetings 500 -> "Could not load events Retry"       no raw leakage
files    403 -> Files chrome intact, Retry present  no raw leakage
```
`trace_id`, the error key and the server's own message never reach the screen — checked explicitly,
since a leaked `COMMON_INTERNAL` or trace id in front of a user would have been worth reporting.

**Retry actually recovers**, which is the half that matters:
```
still failing : click Retry -> request re-issued (2 aborts -> 4), error state and button retained
recovered     : click Retry -> 1 request allowed, list renders 7 people, Retry button disappears
```

### One observation, deliberately not reported

A **403** produces the same "Could not load … Retry" as a **500**, so a permission error is offered
a Retry that can never succeed. It is a real distinction, but I injected the 403 — I have no path a
user reaches it by on this screen, and a finding built on a response I fabricated is not
reproducible by the person who has to fix it. Recorded here in case a later session finds the real
path.

## Browser back/forward through the shell — verified working (20:30)

Four screens visited in order, then three steps back and three forward, checking that the URL and
the rendered content agree at every stop:
```
go  directories -> calendar -> files -> channel
back            files      -> calendar -> directories?tab=people
forward         calendar   -> files    -> channel
```
Every stop rendered the screen its URL names, including the `?tab=people` query on the directories
entry. No stale screens, no double-render, no lost tab state.

## Custom status — and a real strengthening of finding 3 (20:40)

The Profile menu offers six status presets (`In a meeting | Commuting | Sick | Vacation |
Working remotely | Lunch break`). There is no manual online/away control — presence is automatic.

**Setting one works and propagates:**
```
PUT /api/v1/users/me/status  {"text":"Vacation","emoji":"🌴","expires_at":null} -> 200
GET /api/v1/users/{id}/status -> {"text":"Vacation","emoji":"🌴","source":"manual"}
the other account's view of that person's profile card:
  "QA Alice   🌴 Vacation   Message Call Block Share   SHARED CHANNELS · 2 …"
```

**But the Directories row shows nothing** — and that is the finding. Measured from the *other*
account, so it is a genuine cross-user observation:
```
members payload for that person, as the other account sees it:
  keys: user_id,name,username,is_guest,joined_at,custom_status,presence,roles
  custom_status: {"text":"Vacation","emoji":"🌴","source":"manual"}
  presence:      {"online":true}
directory row:   "QA Alice"          <- neither
profile card:    "🌴 Vacation"       <- both
```

**Finding 3 broadened in the report.** It said "presence is absent from People". It is now "neither
presence nor status is shown", because the same payload carries both availability signals and the
row renders neither, while the card renders both. That is a materially better finding: the screen
whose job is "who is here" shows no indication of whether anyone is available. The confirmed cause
already covers it — `directories.types.ts:12`'s `DirectoryPerson` has no field for either
(`avatarColor, avatarUrl, department, displayName, email, position, userId`), so it is one mapper
dropping both. Title, summary row, lede, measurement block and a Проверка line updated; republished.

**This also explains a divergence I flagged earlier.** I told the peer session their members key
list was not invariant because mine lacked `custom_status`. It is conditional: the field appears
once a status is set. Their account had one; mine did not. Their key list was right, my inference
from its absence was wrong — corrected here so the log does not carry it.

**State restored:** clicking the already-selected preset toggles it off
(`DELETE /api/v1/users/me/status` → 200, status now `{}`), and a `Clear status` item appears in the
menu whenever one is set.

Small observation, not reported: none of the six presets exposes `aria-pressed` or `aria-checked`,
so the menu itself does not show which status is current, and clicking the active one removes it
rather than re-applying it. The profile card does show the current status, so the information is not
lost.

## Finding 7 re-checked against the shared PITFALLS.md rule "The app already told you" (21:00)

A shared `PITFALLS.md` appeared in the repo during this run (peer-maintained, 668 lines, last
written 20:21). Its final entry is a direct hit on the shape of finding 7 — *"before calling a
keyboard gesture or a control broken, read the text the app prints next to it"* — and their example
is a shortcut finding that died because the composer's own hint line flipped when a mode changed.
So I ran that check against my finding.

**It survives.** The only shortcut text anywhere near the composer is:
```
composer NOT focused : "Enter to send · Shift+Enter for new line"
composer focused     : "Enter to send · Shift+Enter for new line"   (byte-identical)
active element       : DIV[Compose message]
```
Nothing about `Cmd+K` or `Cmd+N`, and the hint does not change with focus — so there is no
contextual qualification for the shortcut hint to have flipped to.

And the Help dialog, verbatim:
```
Help & shortcuts | Search Cmd/Ctrl + K | New direct message Cmd/Ctrl + N
                | Toggle display settings Cmd/Ctrl + Shift + T | Open docs
```
All three listed flat, with no context or condition attached to any of them. The app did not tell
the user; the finding stands as written.

**I also walked the other twelve findings against that file's section headings.** Every one rests
on either a positive control or an observed positive change:
- 7 has `Cmd+Shift+T` working in both contexts — that is what rules out "the composer swallows
  everything".
- 10 has density and font scale resetting while the theme does not.
- 11 has the valid-token page (1 control) and the app's own not-found page (2 controls).
- 12 has `department` present in `/auth/me` for the same account.
- 3 has the profile card rendering both signals from the same payload.
- 2 rests on a `disabled` attribute plus a source citation, not on an interaction.
- 5, 6 rest on request payloads, with a working sibling (`:in`) and the form's own shown value.
- 1, 4, 8, 9 each rest on an observed change, not on nothing happening.
None of the file's traps applies. Recorded so this is not re-derived.

## Cross-workspace search isolation — verified working, with a positive control (20:45)

The earlier multi-workspace work covered channel isolation and unread; search was not tested.
Posted a uniquely tokened message into the second workspace's only channel, then searched for it
from both:
```
POST /api/v1/messaging/messages {channel_id:<ws2 channel>, body:"… wsiso<token>"} -> 200

GET /api/v1/search?q=<token>&…&workspace_id=<ws2>  -> total_messages 1   <- positive control
GET /api/v1/search?q=<token>&…&workspace_id=<ws1>  -> total_messages 0
UI, global search dialog opened inside ws1:
  "All 0 | Messages 0 | Channels 0 | People 0 | Files 0
   No results for “<token>”. Try other words or clear the filters."
```
The positive control is what makes the zero meaningful: the same token, same account, same second,
found in the workspace that owns it and not in the other. No leak.

**Caught one of my own selectors on the way.** I read the matched message's text from `m.body` and
got `""`, which briefly looked like search returning empty bodies. Search results have their own
shape and no `body` field at all:
```
keys: id, channel_id, dm_conv_id, sender_id, highlight, is_dm, created_at
highlight: "dm notification <em>probe</em>"
```
The snippet is `highlight`, with `<em>` around the match. `total_messages` is the load-bearing
number for the isolation claim, so the finding is unaffected — but reading a field that does not
exist and getting an empty string back is the "your own selector returned nothing" trap, and it
returns `""` rather than `undefined`, which reads like data rather than a mistake.

Also worth noting for whoever tests search rendering: results carry `sender_id` but **no**
`sender_name`, while the UI shows the author's display name — so the client resolves it from the
member list rather than from the search response.

## "Mark as read" is a DELETE — investigated to the root, deliberately not reported (20:50)

This started as a strong candidate finding and ended as a documented design decision. Recording the
whole chain because the conclusion matters to anyone testing notifications.

**What I measured.** Reading a notification removes it from every surface the product offers:
```
POST /api/v1/notifications/read {"notification_ids":[<one id>]} -> 200 {"marked_count":1}
GET  /api/v1/notifications?limit=50   -> the row is gone; total drops with it
  and after a full page reload: still gone, so not a client cache
"Mark all as read" -> 200 {"marked_count":15};  bell "Notifications, 15 unread" -> "Notifications"
  panel: "All caught up | No notifications yet."
six query variants tried — read=true, status=read, filter=all, include_read=true,
  unread_only=false, and bare — all return 0
across every observation this pass: notifications with read === true seen = 0
```

**The counter-example that made it look like a defect.** The same event — one person mentioning
another — produces two records that behave differently:
```
Mentions page   All (1) Unread (1)  -> after "Mark all read" ->  All (1) Unread (0)
                the row stays visible, and survives a reload
Notifications   the mention notification, once read, is absent from the list and from total
```
So the product demonstrably has a read-but-retained pattern one screen away.

**Why it is not being reported — read at the deployed backend.**
`notification-service/internal/features/v1/notification/repository/notification_repository/mark_as_read.go`
is not an UPDATE. It is a `DELETE FROM notifications … RETURNING id`, which then also deletes the
matching `notification_deliveries` rows, in one transaction. And the intent is written above it:

> `MarkAsRead удаляет прочитанные уведомления безвозвратно (историю не храним — задача
> уведомления считается выполненной, как только пользователь его увидел).`

That is PITFALLS.md's "It was deliberate, and documented at the handler" exactly. A developer
reading a ticket about it would point at that comment. The absence of history is the product's
stated policy, not a malfunction, so it does not go in the report.

**What the investigation did establish, and it is worth keeping:**

- **The `read` field can never be true.** `list_by_user.go:37-39` applies `WHERE read = false` only
  when `UnreadOnly` is set, and the count query is
  `COUNT(*), COUNT(*) FILTER (WHERE read = false)` — so the schema, the filter and the counter all
  describe a read-but-retained state that the delete makes unreachable. `total` and `unread_count`
  are therefore always equal, which is what every response I captured shows. That is API shape
  rather than anything a user sees, and CLAUDE.md puts API-only concerns outside what we test, so
  it is an observation, not a finding.
- **"Mark all as read" is an irreversible bulk delete behind a label that promises a state change**,
  with no confirmation. I considered reporting that alone. Against it: the same code comment frames
  notifications as ephemeral, so a confirmation would contradict the design, and with no history at
  all the two verbs have identical outcomes for the user. Not reported.

**For any session that tests notifications — this is the practical consequence.** Clicking a
notification, or clicking "Mark all as read", **destroys** it. Notification state is not something
you can restore by re-reading; if an experiment needs a notification, produce a fresh one. This
caught me mid-pass: "Mark all as read" wiped 15 notifications I had been using as fixtures.

**Dedup, for completeness** — read the open notification bugs. **ALK-3024** is the nearest
(`Уведомление из недоступного канала не открывается и только помечается прочитанным`) and is a
different defect: click-through failing on a channel the recipient has lost access to. **ALK-3580**,
**ALK-3176** and **ALK-3003** are click target, mislabelled call, and date format. None is this.

## Full re-verification of all twelve findings (21:00–21:35) — every one holds

Second consolidated pass, run after several hours in which a great deal of lane state changed
(meetings created and rescheduled, a status set and cleared, channels joined and left, files
uploaded, profile fields filled, 15 notifications destroyed). Build unchanged:
`v0-61-0-rc-5-c4b5386b4a3a`.

```
 1  Open full search narrows to the channel   dialog total_messages 1 -> full search 0        HOLDS
 2  invitee cannot RSVP when opened by URL    by URL Yes/No disabled=true opacity 0.5, 8/8
                                              samples; same meeting from the grid
                                              disabled=false opacity 1; by-id keys "meeting",
                                              my_status absent                                HOLDS
 3  no presence and no status in People       7/7 members carry presence; 0 status nodes
                                              in rows                                         HOLDS
 4  recurring edit changes one occurrence     after editing one: edited 1, unchanged 87       HOLDS
 5  ":@ person" filters nothing               typed ":@ QA Bob probe" -> q=Bob+probe,
                                              no author/user/sender parameter                 HOLDS
 6  reminder choice never sent                form shows "15 minutes before"; POST keys are
                                              workspace_id,title,starts_at,ends_at,timezone,
                                              meeting_url,location,attendee_user_ids,
                                              guest_invites,requires_approval,is_private,
                                              mute_on_join,who_can_open_rooms,max_rooms
                                              — no reminder field                             HOLDS
 7  two of three Help shortcuts dead in a
    channel                                   Cmd+K -> activeElement INPUT[Insert link],
                                              dialog "Insert link"; Global search never opens HOLDS
 8  Files list view not persisted             Grid(p=true) -> List(p=true) -> leave and
                                              return -> Grid(p=true)                          HOLDS
 9  start-date change leaves summary and end  start 2026-09-04, end stays 2026-08-26, summary
                                              "Wed, Aug 26 · 9:00 PM – 9:30 PM"; repeated
                                              with 2026-10-15, same                           HOLDS
10  Reset all does not reset the theme        Dark+Compact -> Reset all -> density back to
                                              cozy, theme still dark                          HOLDS
11  invalid join link is a dead end           0 interactive elements in the whole document,
                                              scrollHeight === clientHeight                   HOLDS
12  everyone under OTHER, no field search     department "Quality" in /auth/me, absent from
                                              members payload, single heading "OTHER 7"       HOLDS
```

**Nothing withdrawn. Nothing weakened.**

### Three of my own re-verifications failed before the findings did — all my error

Worth recording, because a careless re-verification produces a **false withdrawal**, which is worse
than a false finding: it deletes a real defect and looks like diligence.

- **Finding 9 "did not reproduce" on the first attempt.** I changed the start date *and then the
  start time*. The finding itself says changing the time is what makes both catch up — so I had
  performed the recovery step and then measured. Redone with the date change alone, it reproduced
  twice on different dates. **A re-verification that includes a step the finding names as the fix
  is not a re-verification.**
- **Finding 10 was never actually tested.** My click reported `resetAll: "not found"`, yet my
  `holds` flag was computed from the state afterwards and cheerfully returned `true`. The cause:
  `Reset all` is not on `/settings/appearance` at all — "Display settings" is the quick panel
  opened by `Cmd+Shift+T`, a different surface with a different control set. **A `holds` flag
  computed without checking that the step it depends on ran is a coin toss that reports as a
  measurement.**
- **Finding 6 first reported `hasReminderField: true`.** My regex `/remind|notify|alert/i` matched
  the word "reminder" in the title *I had typed into the meeting* (`QA-E reverify reminder`).
  Testing a payload for a field name with a regex that also sees the payload's user content.

And finding the reminder control took five attempts, each failing for a different reason: exact-text
match (the span says "No reminder", not "reminder"), tag filter (it is a `SPAN` inside a
`BUTTON[role=combobox]`, not a `select`), a `<70` character filter applied before the
innermost-element reduction, and finally **`vis()`'s `elementFromPoint` hit test rejecting it
because the dialog scrolls and the control was below the fold**. That last one is the real lesson:
the dialog reported the word in `innerText` while no *visible* element contained it, and the
contradiction was the signal. `scrollIntoView({block:'center'})` first, then measure.

## Three whole-sector checks, all clean (20:50–21:05)

### No false empty state under latency — verified working

The failure this looks for is an empty state rendering before the data arrives, telling the user
there is nothing when there is. Injected a 5-second delay on each screen's own endpoint and polled
at 300 ms across the whole load (34 samples per screen):
```
Directories  18 samples showing a skeleton   0 frames matching /No people match|No members/
Calendar     17 samples showing a skeleton   0 frames matching /No events|Nothing scheduled/
Files         0 skeleton samples             0 frames matching /No files here|Nothing matches/
```
Directories and Calendar hold a skeleton for the whole wait; Files shows its chrome with an empty
list area but never the "no files" copy. Nothing lies to the user while loading.

### Console and network error sweep — nine routes, effectively clean

```
directories/people · directories/channels · calendar · files · saved · mentions · calls hub
    console errors 0 · page errors 0 · 4xx/5xx 0 · warnings 0
channel and private channel
    404 GET files/<id>/content  (one each) — and that is expected
```
Both 404s are content fetches for files **deleted earlier in this pass**; the messages that carried
them render "Unavailable file / File reference unavailable", which is already recorded above as
correct post-deletion behaviour. The client asks for the content and takes the 404 as the signal.
No uncaught exception anywhere in the sector.

### The published report itself renders correctly — the check that was previously skipped

Earlier this pass the render check was recorded as partial and skipped. Done properly now: the file
wrapped exactly as the artifact wraps it (`<!doctype html><html><head>…</head><body>`) and loaded
in a real browser over `file://`, then measured in all **four** theme states.
```
                            body background        body colour
system light                rgb(246,248,247)       rgb(22,32,31)
system dark                 rgb(14,20,19)          rgb(228,235,233)
data-theme=light on dark OS rgb(246,248,247)       rgb(22,32,31)     <- the :not() guard works
data-theme=dark on light OS rgb(14,20,19)          rgb(228,235,233)  <- the toggle wins both ways

page scrolls horizontally : false in both themes   documentElement 1920 == viewport 1920
elements outside viewport : none
<pre> blocks              : 12, all overflow-x:auto, 10 actually scrolling inside themselves
articles / h2             : 12 / 12          fonts: loaded
```
So the wide measurement blocks scroll inside their own containers rather than pushing the page, and
the palette resolves correctly in the un-stamped state as well as under both explicit stamps.
Temp render directory deleted.

## Rail navigation — verified working (21:10)

Each rail icon driven with a real mouse from the calendar:
```
Chat     -> /w/{ws}/c          "Select a chat — Choose a channel or direct message"
Calls    -> /w/{ws}/calls      "Calls | Start now | Schedule meeting …"
Calendar -> /w/{ws}/calendar   "CALENDAR 24–30 August 2026 …"
Files    -> /w/{ws}/files      "Files | Upload | BROWSE …"
```
All four land on the right route with the right content.

## Search date-range chips — INCONCLUSIVE, and not reportable on this lane (21:15)

This looked like a third member of the "control that never reaches the request" family (findings 5
and 6), and it is not established.

**What is measured.** The chips toggle correctly — `aria-pressed` goes false → true, so the clicks
land — and the outgoing request carries **no date parameter**:
```
Last 7 days   -> search?q=probe&company_id=…&workspace_id=…&limit=25
Last 30 days  -> search?q=probe&company_id=…&workspace_id=…&limit=25
All time      -> no request at all
result counts identical in all three: All 18 | Messages 17 | Channels 0 | People 0 | Files 1
```
The server has no date filtering to send to, confirmed twice. `apps/web/src/generated/openapi.json`
declares exactly `q, company_id, workspace_id, types, channel_ids, dm_ids, include_archived, limit,
offset` for `GET /api/v1/search` — no date parameter of any kind. And nine invented parameters
(`from`, `after`, `date_from`, `start_date`, `range`, `period`, `created_after`, `to`, including a
`from=2027-01-01` that would have to return zero if honoured) all return the same 17 messages.

**Why the identical counts prove nothing.** Every message, file and account in this workspace was
created within the last two days, so "Last 7 days" and "All time" *must* return the same set
whether the filter works or not. The measurement cannot separate the two hypotheses.

**And the source says the filter probably does work, client-side.**
`apps/web/src/widgets/GlobalSearch/constants/globalSearchConstants.ts:15-19` defines real windows
(`'7d': 7*24*60*60*1000`, `'30d': …`, `all: null`); `hooks/useGlobalSearchPanel.ts:177` passes
`dateWindowMs` into the data hook; and `hooks/useGlobalSearchData.ts:226,234` computes
`cutoff = Date.now() - dateWindowMs` and drops rows whose `created_at` is older. That path is
applied to the **local** result set at `:629` (`filterLocal(local.results, …, dateWindowMs)`), with
server results going through a separate `serverResultFilter`, which I did not trace far enough to
say whether the same cutoff reaches them.

**Recorded as inconclusive, not as a finding.** Reporting "the date chips do nothing" would be a
claim I cannot support, and the source points the other way.

**How to settle it:** a message, file or DM whose `created_at` is more than 7 days old, then compare
`Last 7 days` against `All time` on a query that matches it. Lane E has nothing old enough; a lane
seeded earlier, or a deliberately backdated row, would do it. I did not backdate a row by hand —
messages are replicated and separately indexed for search, so a hand-written row risks being
invisible to the very query under test, which would produce a confident wrong answer rather than
no answer.

## Archived channel across sector E — verified working (21:20), two false leads killed

`#qa-archived` is a fixture I had not covered. It behaves correctly everywhere:
```
sidebar                    qa-general, qa-private          archived channel hidden
Directories → Channels     qa-empty, qa-general            archived channel not listed
GET /workspaces/{ws}/channels  ["qa-general","qa-private"]
opened by URL              opens read-only:
   banner   "This channel is archived — Unarchive to send messages and re-enable notifications."
   composer absent; contenteditable elements on the page: 0
   controls qa-archived · 2 members · Search in channel · Mute notifications · Channel details
```

### Two candidates, both killed, both my own instrumentation

- **"An archived channel invites you to start a conversation it will not let you post in."** My
  first read took the first 180 characters of the page text, saw *"Start this channel — Add
  teammates before starting the conversation. Add users"*, and found no archived notice. Reading
  the whole text shows the archived banner is right there, and the "Add users" button does not
  exist (`hasAddUsers: false`) — "Add users" was a fragment of a longer string my slice had cut. The
  empty-state copy and the archived banner do coexist, which is mildly odd, but the archived notice
  is explicit and carries the remedy. Not reported.
- **"`GET /users/me/channels/archived` returns 400."** It does — *for my call*. The app's own call
  is `GET users/me/channels/archived?workspace_id=<ws>&limit=…` and returns **200**. Mine omitted
  `workspace_id`, and the response says so exactly: `{"key":"COMMON_INVALID_INPUT","message":
  "invalid query parameter \"workspace_id\": invalid value"}`. I had the app's own successful call
  in the same capture and did not read it before drawing a conclusion from my hand-made one.

### The pattern in my own errors this pass is now unmistakable

Four of the nine dissolved candidates came from **reading a truncated slice of text** rather than
the thing itself: the calendar cells "with no hour" (`.slice(0,20)` cut `at 6:00`), the notification
body scheme (one case generalised), this archived banner (first 180 characters), and the "Add users"
button that was never there. CLAUDE.md already says a truncated `innerText` slice is not evidence a
control is missing; the version I keep re-learning is broader — **a slice is not evidence of
anything about what it cut**, including that a sentence ends where the slice does.

## Cross-workspace file isolation — verified working (21:20)

```
uploaded ws2-only.txt into workspace 2
workspace 2  UI "1 file · My files"      GET /users/me/files?workspace_id=<ws2>&scope=own -> ["ws2-only.txt"]
workspace 1  UI "10 files · My files"    same call for <ws1> -> 10 files, none of them ws2-only.txt
```
Positive control on the owning side, zero leakage on the other. Together with the search isolation
above, both content surfaces are correctly scoped per workspace.

## Report quality pass (21:25) — and it caught a real defect in my own report

**Word budget, measured rather than estimated.** Prose only — Проблема, Фактический результат and
Ожидаемый результат, with `<pre>` blocks stripped, since measurement blocks sit outside the budget:
```
148 150 126 102  90 114 114 128 127 111 143  83     mean 120 words across 12 findings
```
All inside CLAUDE.md's 120–180 guidance except the last (83, `Reset all` не сбрасывает тему), and
that one is a simple Low finding that says everything it needs to. The file sets no minimum.

**Every source path in the report checked for existence at the deployed sha — and one was wrong.**
This is exactly the check I ran against **ALK-3005** an hour ago and used to point out that its
cited path does not exist. Running it against my own report found the same class of error in
finding 12:
```
features/directories/utils/directories.ts:60-61          *** ABSENT ***
```
I had written the directories paths as bare fragments without the `apps/web/src/` prefix that the
other findings all carry. A developer copying that path finds nothing — precisely the cost I
described in someone else's ticket. Rewritten with full paths, and the check now passes for all
nine citations:
```
apps/web/src/features/directories/DirectoryPersonRow.tsx:50-56    EXISTS
apps/web/src/features/directories/DirectoryPersonRow.tsx:72-79    EXISTS
apps/web/src/features/directories/types/directories.types.ts:12   EXISTS
apps/web/src/features/directories/utils/directories.ts:60-61      EXISTS
apps/web/src/features/directories/utils/directories.ts:62         EXISTS
apps/web/src/features/directories/utils/directories.ts:97-99      EXISTS
packages/features/calendar/model/scheduledMeetingRsvp.ts:25-26    EXISTS
packages/features/calendar/ui-web/RsvpSegment.tsx:33              EXISTS
packages/ui-kit-web/src/Avatar.tsx:124                            EXISTS
```
An intermediate version used "base directory, then relative paths", which reads fine but leaves
fragments that cannot be copied straight into `git show`. Full paths everywhere instead —
consistency with the rest of the report costs a few characters and removes the failure mode.

**The general form, worth keeping:** *a citation is a claim, and it is the one claim in a report
nobody re-measures.* Findings get re-verified; the file-and-line beside them usually does not. It
takes one `git cat-file -e` per path against the deployed sha, and it caught mine.

## Files sort and calendar Today — both verified working (21:10)

```
Files sort by Name -> list is in locale order (checked against a sorted copy: match)
Files sort by Size -> different, plausible order (largest/smallest first)
Files sort by Date -> different again, newest first
```
So finding 8 is about these settings not *persisting*; the sorting itself is correct. Worth
separating, since a fix for one is not a fix for the other.

```
calendar header  24–30 August 2026  -> six clicks of Next -> 5–11 October 2026
                                     -> Today             -> 24–30 August 2026
```

Small observation, not reported: the three sort buttons expose no `aria-pressed`, so the active sort
is not announced — the same shape as the status presets in the Profile menu. Logged with the other
a11y notes sector D is carrying.

## Search type tabs — verified working (21:15)

Switching `Messages | Files | People | Channels | All` changes which bucket is displayed and issues
**no new request** — one search call returns all four buckets and the tabs select among them:
```
Messages -> message rows       Files -> file rows
People   -> "No results"       Channels -> "No results"   (both buckets are genuinely 0)
All      -> MESSAGES section
counts unchanged across tabs (All 18 | Messages 17 | Channels 0 | People 0 | Files 1) — correct,
they are per-bucket totals rather than a property of the selected tab
```
Same a11y note as elsewhere: `aria-selected` reads `false` on every tab including the active one.

## Localization sweep of sector E — and BUG-13, a new finding (21:20–21:35)

An axis nobody had touched for this sector. Sector D swept the seven *settings* pages in Russian
this afternoon; Directories, Calendar, Files, Search and the notification panel had not been looked
at in any non-English language. Switched the account to Russian, swept, then restored English.

**Translation coverage of the screens themselves is complete.** Leaf-node scan for Latin-script copy
(excluding data — account names, channel names, filenames, dates):
```
Directories  latin copy: []   clipped: []   offscreen: 0   page scrolls X: false
Calendar     latin copy: []   clipped: []   offscreen: 0   page scrolls X: false
Files        latin copy: []                 offscreen: 0   page scrolls X: false
Global search dialog  latin copy: ["ESC"]   clipped: []      <- a key name, correct
```

### BUG-13 [Low] [frontend] В неанглийском интерфейсе все уведомления календаря остаются на английском

The notification panel translates its chrome and its messaging entries, and leaves every calendar
entry in English — title **and** body — in the same list:
```
interface: <html lang="ru">
calendar   title_key NOTIF_TITLE_MEETING_REMINDER   title "Meeting starting soon"
           body "\"…\" starts soon — Aug 26, 2026 9:00 PM (Asia/Tashkent)"
  rendered "Система, Рабочее пространство: Meeting starting soon. \"…\" starts soon — …"
messaging  title_key NOTIF_TITLE_CHANNEL_MESSAGE    title "New channel message"
  rendered "<автор>, #<канал>: Новое сообщение в канале. <текст>"
```
Both carry a `title_key`, so the intent to translate exists for both.

**Подтверждённая причина, read at the deployed sha.**
`packages/core/src/i18n/notificationTitles.ts:3-20` lists `BACKEND_NOTIFICATION_TITLE_KEYS` — 16
entries, none of them calendar — and `resolveNotificationTitle` at the end of the same file returns
`fallbackTitle` (the server's English `title`) for any key not in the map. Comparing what each side
actually uses:
```
backend emits 25 NOTIF_TITLE_* values   frontend maps 16
unmapped, all eight calendar ones:
  MEETING_INVITE · MEETING_REMINDER · MEETING_TIME_CHANGED · MEETING_DURATION_CHANGED
  MEETING_CANCELLED · MEETING_ATTENDEE_ACCEPTED · MEETING_ATTENDEE_DECLINED · MEETING_ATTENDEE_REMOVED
```
So it is the whole category, not one string. And separately the **body has no key at all** — the
response carries a finished English sentence with no parameters, so it cannot be translated on the
client even once the titles are mapped. That second half is a backend change; the finding is
labelled frontend because the title map is the cited, proven defect and the panel is sector E's
surface, and the Проверка asks for both halves.

**Dedup:** read the open notification and i18n bugs. **ALK-3003** is the nearest — date and time in
the same panel rendered in the browser's format rather than the interface language — and is a
different defect on the same screen; worth cross-referencing at triage, not a duplicate.
**ALK-2862** is a single Calls label. Neither covers this.

### Not reported — Russian labels truncate in the Files filter list

```
Все файлы    clientWidth 82  scrollWidth 85     Изображения  88 / 111    Документы  88 / 93
computed: overflow hidden · text-overflow ellipsis · white-space nowrap · class "… truncate"
"Изображения" in an 88px box renders as "Изображ…"
```
Only labels that carry a count badge are affected — the badge takes the width, and the rows without
counts (`Видео`, `Аудио`, `Архивы`) sit at the full 165px and do not clip. English fits either way.
Left out: the truncation is deliberate and graceful, every label stays identifiable, and no two
labels become ambiguous. It is the cosmetic i18n case CLAUDE.md says gets trimmed at triage.

**English restored and verified** (`<html lang="en">`, settings page reads in English). One trap on
the way: in the Russian UI the language option is labelled `Английский`, not `English`, so a
restore that matches on "English" silently does nothing — my first restore attempt failed exactly
that way and I only caught it because the next sweep still returned Russian labels.

## Layout across desktop widths, and the worst case — verified working (21:25)

All testing this pass had been at 1920. CLAUDE.md scopes layout to desktop widths, so 1280 and 1440
are in scope and were untested.

```
1280x800 and 1440x900, four screens each (directories, calendar, files, channel)
  page scrolls horizontally : false everywhere      documentElement width == viewport width
  clipped leaf nodes        : none (excluding elements that carry the truncate class)
  controls past the right edge : none
```

**And the worst case for layout — Russian at 1280**, longer strings in a narrower window:
```
directories  clipped: []                       unreachable: []   pageScrollsX: false
channel      clipped: []                       unreachable: []   pageScrollsX: false
calendar     4 clipped, all meeting titles     unreachable: []   pageScrollsX: false
files        4 clipped, the filter labels      unreachable: []   pageScrollsX: false
every clipped element carries the `truncate` class
```
Every clip is a deliberate `text-overflow: ellipsis` on either data (meeting titles, a filename) or
the Files filter labels already recorded above. Nothing overflows the page, and no control moves out
of reach. English restored and confirmed (`<html lang="en">`).

The `(NO truncate)` marker in the scan is what would have made this a finding — an element clipping
without the class that exists to handle it. There were none.

## Timezone — verified working (21:30)

There is **no control to change the account timezone** anywhere in Settings; the Profile page
mentions timezone only through the `Show timezone` toggle. So the testable question is whether the
calendar follows the *browser's* zone, driven with CDP `Emulation.setTimezoneOverride`:
```
native Asia/Tashkent        header "GMT+05:00"
override America/New_York   header "GMT-04:00"   chip "… RESCHEDULED 06:00-07:00"
restored                    header "GMT+05:00"
```
The meeting is 15:00–16:00 in Asia/Tashkent, i.e. 10:00Z, i.e. **06:00 EDT** — the conversion is
right, and the header label moves with it rather than contradicting it. Consistent, so nothing to
report. (The chip only appeared under the override because at 06:00 it sits inside the week grid's
initially visible hours, while 15:00 is below the fold — not a defect, and worth knowing before
reading a missing chip as one.)

## BUG-13 reproduced in a second language (21:35)

CLAUDE.md asks for a second run before writing behaviour up, and the first measurement was in
Russian only. Repeated in Uzbek:
```
bell aria-label   "Bildirishnomalar, 3 ta oʻqilmagan"          <- chrome translated
panel             "Bildirishnomalar | Hammasini oʻqilgan deb belgilash | Tizim · Ish maydoni"
messaging entry   "Kanalda yangi xabar"                        <- translated
calendar entry    "Meeting starting soon"                      <- English
                  "\"…\" starts soon — Aug 26, 2026 9:00 PM (Asia/Tashkent)"   <- English
```
Identical split in both languages. The report's claim is now narrowed to what was measured —
verified in Russian and Uzbek, with the cause (an unmapped key falling back to the server's English
title) being language-independent — rather than asserting all three.

**English restored and verified** (`<html lang="en">`).

**Rig note that cost two failed restores.** The language control's own label is the *current
language name in the current language*, not the word "Language" — `English` → `Русский` →
`Oʻzbekcha` — and the menu options are localised too (`Английский`, `Inglizcha`). A restore that
matches on the string "English" works only from English. The reliable predicate is: the button in
`main` whose text is **any** of the four language names in **any** of the four languages, and then
the option matching `English|Inglizcha|Английский`. Both of my failed attempts left the account in
a non-English locale, and I only noticed because the next sweep came back in the wrong script.

## Looked for the same gap elsewhere — the error-key path is the well-built counterpart (21:45)

BUG-13 came from diffing what the backend emits against what the frontend maps. The obvious next
question is whether the same gap exists on other key systems. It does not, and the contrast is worth
recording.

```
notification titles   backend emits 25 NOTIF_TITLE_*   frontend maps 16   gap: all 8 calendar keys
error keys            backend has 233 in apperror/keys.go  frontend catalog 230   gap: ~3
```

The error-key path handles its gap deliberately.
`packages/core/src/api/unrecognizedErrorKey.ts` exists for exactly this, and says so (ALK-3071):

> The backend adds keys on its own release train, so a client in the field will meet keys it has no
> translation for. `resolveApiErrorPresentation` keeps the UI intact by falling back; this module
> makes sure the gap is *visible* — the key and the `trace_id` reach the error reporter.

Deduped per key per session, capped at 200 keys, with the reasoning for both written next to them.
So: graceful fallback **plus** telemetry that the fallback happened. Nothing to report here — this
is the pattern working.

**Deliberately not added to BUG-13.** The obvious rhetorical move is "the codebase has the right
pattern one directory away, and the notification titles fall back silently with no report". True,
and it is argumentation that the finding is real rather than information a developer needs — the
kind CLAUDE.md says to cut. The finding already names the file, the line and the eight missing keys;
that is what gets it fixed.

## Notification click-through for every meeting event type — gap-free by construction (21:35)

Applied the same diff technique to the routing path, expecting a second gap. There isn't one, and
the reason is the interesting part.

`apps/web/src/widgets/NotificationsPanel/hooks/useNotificationNavigate.ts:143` branches on
`isCalendarMeetingEvent(notification.event_type)`, and that predicate
(`packages/core/src/domain/notification.ts:104-105`) is a **prefix match**:
```ts
const CALENDAR_EVENT_TYPE_PREFIX = 'meeting_'
export const isCalendarMeetingEvent = (eventType) =>
  eventType !== undefined && eventType.startsWith(CALENDAR_EVENT_TYPE_PREFIX)
```
A prefix cannot fall behind a backend that adds `meeting_something_new`; an enumerated list can, and
that is exactly the difference between this file and `notificationTitles.ts`. **Same codebase, same
kind of backend enum, two designs — one has BUG-13 and the other cannot.**

Confirmed empirically rather than left as a source reading:
```
clicked a meeting_reminder_10m notification from /files
  -> /w/{ws}/calendar/S4OWKURHCGBE06Q, meeting card opens with the right meeting
```

Two incidental observations on that card, both consistent with things already recorded: the
organiser sees "Participant list unavailable" when the meeting has no attendees, which matches
**ALK-3539**'s own title ("только при наличии приглашённых"), and the organiser's Yes/No are
inactive by design (`scheduledMeetingRsvp.ts:12`, already noted inside finding 2).

## BUG-13 corrected twice after peer review — both verified here before changing anything (21:45)

A peer session re-read the finding at the deployed sha and raised two things. Both were right, and
both were re-measured here rather than taken on trust.

**1 · My backend count included a test file.** I reported "backend emits 25". Excluding tests:
```
grep -rhoE 'NOTIF_TITLE_[A-Z_]+' --include='*.go' --exclude='*_test.go'   -> 24
the one dropped: NOTIF_TITLE_NOPE
  notification-service/internal/core/i18n/notification_titles_test.go — a sentinel asserting that
  an unknown key returns itself
comm -23 backend frontend  ->  exactly the eight MEETING_* keys
```
The list of eight was right; the number 25 was not, and **25 − 16 = 9 while I listed 8** — the
arithmetic in my own measurement block did not add up and I had not noticed. Now 24, and it does.

The sentinel is worth its own line: the backend has a test asserting graceful degradation for
unknown title keys, and the frontend has `unrecognizedErrorKey.ts` doing the same for error keys.
Both sides handle the unknown-key case deliberately; nobody wired the meeting keys into the map.

**2 · I cited the list, not the mechanism.** My citation was `notificationTitles.ts:3-20` — twenty
lines of string literals. The *behaviour* being reported lives at `:54-64`:
```ts
return translationKey === undefined ? fallbackTitle : t(translationKey)
```
A developer opening 3-20 sees sixteen strings and has to find the logic themselves. Now cited as
the mechanism first (`:54-64`, with the line quoted) and the table second (`:3-20`).

**And this is the limit of my own citation check, found by someone else.** This afternoon I added
"verify every cited path exists at the deployed sha" after catching a wrong path in my own report.
That check passes on a citation that points at the wrong *part* of the right file — the path is
real, the lines are real, and they still do not show the reader what the finding claims. The
existence check answers "does this file exist"; it does not answer "does this line demonstrate the
behaviour". The second question needs a human reading, and I had done that reading for the other
eight citations and not for this one, because I had just written the file's name from memory of the
list rather than of the logic.

All ten citations re-verified after the edit; prose 129 words; republished.

## Every citation re-read for what it *shows*, not just that it exists (21:35)

Follow-through on the lesson above: the existence check cannot tell you whether a cited line
demonstrates the claim beside it. So each of the ten was opened at the deployed sha and read.

```
directories.types.ts:12          "export interface DirectoryPerson {" — the declaration whose
                                 field list the finding quotes in full                        OK
DirectoryPersonRow.tsx:50-56     <Avatar aria-hidden color name size src /> — no status prop   OK
Avatar.tsx:124                   "{status !== undefined ? (" — the dot is gated on it          OK
scheduledMeetingRsvp.ts:12       "…|| event.organizer_id === currentUserId) return
                                 {isEligible:false}" — the organiser case the finding excludes OK
scheduledMeetingRsvp.ts:25-26    "if (event.my_status === undefined) { return
                                 { isEligible: attendee !== undefined, … } }"                  OK
RsvpSegment.tsx:33               "const isDisabled = mutation.isPending || isAuthLoading ||
                                 !isCurrentUserAttendee" — quoted verbatim in the report       OK
directories.ts:60-61             "member.user?.position?.trim() ?? null" and the same for
                                 department                                                    OK
directories.ts:62                "const searchValue = `${displayName} ${email}
                                 ${department ?? ''} ${position ?? ''}`"                       OK
directories.ts:97-99             "const key = department === null ? UNASSIGNED_GROUP_KEY
                                 : department"                                                 OK
notificationTitles.ts:54-64      "return translationKey === undefined ? fallbackTitle
                                 : t(translationKey)"                                          OK
```

Ten for ten. The one that had been wrong was the one I had *not* read this way, and I only found out
because someone else read it. So the pair of checks is: a script for "does the path exist at the
deployed sha", and a person for "would a developer opening exactly these lines see the defect".
Neither substitutes for the other, and the script is the one that feels like verification.

## Sector E from zero — the fresh workspace works, and scoping holds on writes too (21:40)

The main lane-E workspace carries ~115 meetings, 10 files and a lot of probe messages, so every
result so far has been measured in a noisy environment. Repeated the sweep in the second workspace,
which has one member and one channel:
```
Directories → People     "OTHER 1 | QA Alice"
Directories → Channels   "second-ws-channel PUBLIC No topic Open"
Files                    "All files 1 loaded | Documents 1 loaded"
Calendar                 renders an empty week with the correct GMT+05:00 axis
page errors 0 · 4xx/5xx 0
```

**And creating a meeting there stays there:**
```
POST /api/v1/calendar/meetings -> 200
GET  …/meetings?workspace_id=<ws2>&from=2026-09-01&to=2026-09-30  -> 1 meeting, it is mine
GET  …/meetings?workspace_id=<ws1>&same window                    -> 38 meetings, leaked: 0
```
So workspace scoping holds on the write path as well as the read path — with a positive control on
the owning side both times. Together with the search and file isolation above, all three content
surfaces are correctly scoped in both directions.

Worth noting for the next session: **every finding in this report was measured in the noisy
workspace**, and none of them depends on that noise — the fresh workspace behaves identically on
every surface it has data for.

## Search input boundaries — verified working (21:45)

Ten shapes against the endpoint, then the interesting ones through the UI:
```
500 chars · regex metachars .*+?[](){}|^$ · "' OR 1=1 --" · <script>alert(1)</script>
  · punctuation only · "100%" · NFD-composed accents        -> 200, 0 results, no error
"   probe   "  -> 200, 17 messages   (leading/trailing whitespace trimmed)
"📎" alone     -> 400 at the API (one emoji is one rune, below the min-2 rule)
```

The 400 never reaches a user, because the client does not send a query that short:
```
UI, typed "📎"      no request at all; "No results for “📎”. Try other words or clear the filters."
UI, typed "📎.txt"  200 -> finds тест-файл-📎.txt
UI, typed "тест-файл" 200 -> finds the same file
```
So emoji and Cyrillic both match filenames, and the one API-level rejection is masked by the
client's own minimum-length behaviour rather than surfacing as an error. Nothing to report.

## Draft of the `reports/README.md` row (to append ONCE, at the end of the run)

Goes after the last row of the main table (currently `aloqa-org-qa-2026-08-26-D-2.html`).
Kept here so the end-of-run step is a paste rather than a composition.

```
| `aloqa-workspace-qa-2026-08-26-E-2.html` | https://claude.ai/code/artifact/384ecdfd-c1a9-4cf6-af5a-9d8421d8afa3 | 2026-08-26→27, сектор E (workspace: оболочка и навигация, Directories, Calendar, Files, Search), lane E, **второй проход того же дня** (18-часовой бокс, старт 14:40, поверх утреннего) — **23 дефекта**: 2 High / 15 Medium / 6 Low, 22 frontend / 1 backend **Двадцать третья найдена в последний час** и только потому, что длинный тест освободил второй браузер: после разрыва связи **календарь не догоняет пропущенное** — встреча, созданная за время разрыва, на открытой сетке не появляется и после восстановления соединения (два прогона, 33 и 34 чипа без изменений спустя 36–54 с), хотя тот же документ в тот же момент получает её с сервера, а перезагрузка сразу показывает. Живое обновление при этом работает (30→31 за ~5 с), и чат после того же разрыва пропущенное догоняет (37→38) — то есть сломан не realtime-канал, а согласование после пропуска событий. По дороге две ошибки стенда, обе «в пользу продукта»: `Network.setBlockedURLs` действует только на время CDP-сессии, а во второй раз создание встречи обогнало загрузку страницы. Выдала обе базовая строка замера, а не вывод. **Формулировка находки исправлена через четыре минуты после публикации:** в ней стояло «пока страницу не перезагрузить», а на деле лечит и простое переключение вида (`Day` — встреча сразу на месте). Исправленная версия сильнее: механизм перезапроса существует и исправен, живое обновление работает, сломана ровно одна связь — возврат соединения ничего не перезапрашивает. Это **пятая и самая быстрая** собственная поправка за проход. **Дедуп по находке 23 отдельно:** ближайшие три тикета — не дубликаты, и вместе они уточняют, что именно сломано. [ALK-2013] («Calendar CRUD не публикует realtime events», BLOCKED) я в этом же проходе проверил как **исправленный** — события доходят; именно его починка и делает мою находку видимой. [ALK-2978] («отклонённая встреча остаётся в сетке до reload», Backlog, тоже проверен как исправленный) — обратный механизм: там refetch выполняется, а сетка не убирает чип; у меня refetch не выполняется вовсе. [ALK-3197] — артефакт во время происходящего обновления. То есть публикация событий работает, отрисовка работает, перезапрос работает — не работает единственная связь: возврат соединения ничего не перезапрашивает. **Находка расширена в 08:25 и это уже не про календарь:** после починки пробы (блокировать надо ДО навигации — `setBlockedURLs` не рвёт уже открытый сокет) выяснилось, что `Files` ведёт себя точно так же — файл, расшаренный во время разрыва, не появляется в открытом `Shared with me` и через 42 с после восстановления связи (два прогона, 7 и 8 позиций без изменений), хотя при непрерывном соединении приезжает за ~20 с. Значит перезапрос по возврату связи делает только чат, а остальные экраны — нет; заголовок теперь `[FE-WEB][CALENDAR][FILES]`. На один валидный прогон по Files пришлось три невалидных, и все три ловились одной и той же колонкой — индикатором соединения в той же строке замера.. Отчёт по ссылке актуален: опубликован в 06:49 поверх того же URL, все 22 находки на месте. Публикация большую часть прохода упиралась в суточный лимит (`429 frame_daily_push_cap_reached`) и прошла с первой попытки, как только он сбросился. Покрыты обе половины сектора (E1 и E2 — разделение появилось уже по ходу прохода). **Все перепроверены не менее трёх раз**, последний раз целиком уже после полуночи; четыре — ещё и со второго аккаунта. **Самая важная собственная ошибка — в находке 2 (High), исправлена в 06:17:** находка утверждала, что ответить на приглашение можно из сетки календаря, и только по ссылке из уведомления нельзя. Проверка её же строки «Проверка» показала, что нельзя ни так, ни так: из сетки кнопки активны, но `POST /calendar/meetings/<id>/respond` отвечает `404 REALTIME_SCHEDULED_ATTENDEE_NOT_FOUND`, статус остаётся `pending`, на экране `Could not update your response`. Строка участника при этом **есть** в `realtime_db.scheduled_event_attendees` с тем же `user_id` и `status=pending` — то есть это не наши фикстуры, а расхождение двух серверных путей к одной строке (чтение находит, запись — нет). Тот же 404 на трёх встречах, включая ту, где спрашивающий сам организатор. Находка переписана целиком: «не может ответить ни одним из двух путей», обе серверные причины в одном замере, один тикет — потому что починка только одной половины оставит пользователя там же. Дедуп отдельно по открытым и по BLOCKED/REVIEW: совпадений нет; попутно под вопросом посылка [ALK-2008] («RSVP показывает предыдущий ответ»), которая предполагает, что ответ вообще сохраняется. **Аудит всех 22 строк «Проверка»** (они утверждают сегодняшнее поведение не меньше, чем описания): 19 верны, 1 про будущее, 2 неверны — обе в находке 2, обе исправлены. **Пять опубликованных находок исправлены после публикации**, каждая — с замером, который её вскрыл (находка 2 выше, находка 13 ниже, и три здесь): у находки 9 была **неверная причина** (винила отсутствие вложенного `user`; на деле адаптер `packages/core/src/api/workspaces.ts:580-582` его собирает сам и теряет поля — прежняя ссылка отправляла разработчика не в тот файл); у находки 3 причина была **неполной** (присутствие теряется дважды, и починка только в `DirectoryPerson` ничего не найдёт); а находка 5 **утверждала неверное поведение** — «фильтр `:@` ничего не делает» — и переписана трижды, прежде чем оказалась верной. **Находка 14 найдена только потому, что проход пересёк полночь**: календарь берёт стартовую дату с сервера, и вычисляется она в его часовом поясе, поэтому между 00:00 и 05:00 по местному времени `Day` открывает вчерашний день целиком — запрос, сводку и заголовок (16 встреч вместо сегодняшних 5). Причина процитирована на развёрнутом коммите; ещё семь независимых вычислений даты на той же сборке верны, что и локализует дефект. Все 18 ссылок на файлы и строки (в 12 файлах) проверены на коммите развёрнутой сборки `c4b5386b4a3a` — каждый файл существует, каждая указанная строка в пределах файла; перепроверено ещё раз в 07:28, сборка за весь проход не менялась — эта проверка нашла **неверный путь в моём же отчёте** (находка 12 ссылалась без префикса `apps/web/src/`), и отдельно каждая строка прочитана на предмет того, показывает ли она заявленное. Находка 3 расширена (в строке People нет ни присутствия, ни статуса — оба приходят в том же ответе), находка 2 усилена (`my_status` отсутствует в ответе по id у **обеих** ролей, то есть это отсутствующее поле, а не фильтрация по правам), находка 11 получила контраст со штатной страницей `Page not found` того же приложения (два выхода против нуля). Тринадцатая находка (уведомления календаря не переводятся) **отозвана как дубликат** находки 4 утреннего отчёта того же сектора; в логе остались причина (`notificationTitles.ts:54-64`, 16 из 24 ключей, ни одного календарного) и главное дополнение — чинить надо восемь ключей, а не один, иначе «Проверка» утренней находки пройдёт при семи сломанных типах. **Девять кандидатов отсеяны замером** (три уже были написаны, один — «Meeting access молча теряет Private» — был на пути в отчёт и оказался непопавшим кликом). Проверено и работает: обработка отказов и Retry на трёх экранах, задержка сети без ложных пустых состояний, back/forward и навигация по сайдбару и rail, участник без каналов и гость, видимость приватных встреч, изоляция поиска и файлов между workspace, часовой пояс, вёрстка на 1280/1440 и по-русски на 1280, границы ввода в поиске. **Корректировки к открытым тикетам (ничего не заводилось):** [ALK-3016] — причина в тикете неверна (кэш клиента, а не роль); [ALK-2876] — шире, чем сказано, и в лайтбоксе тоже; [ALK-3026] — поиск по датам есть, но не в том формате, который печатает сам UI; [ALK-3005] — цитирует путь, которого нет на развёрнутой сборке. Дедуп: прочитаны все открытые баги ALK, а затем ещё 193 в статусах BLOCKED и REVIEW, которых предписанный фильтр не видит (`--open-bugs` покрывает 186 из 379 небзакрытых; на момент дедупа было 188 из 381 — два бага закрылись за ночь, повторная сверка мирроров в 07:18 новых Bug не нашла, так что прочитанное множество остаётся надмножеством текущего). **Единственное пересечение — находка 6 и [ALK-1966]** (`Calendar Reminder preset silently не отправляется`, BLOCKED, описание пустое): это один и тот же дефект, и правильный исход — комментарий к тикету, а не новый тикет; в находке есть шаги, замер, проверка и вторая половина, которой в заголовке тикета нет. Тринадцатая находка (уведомления календаря не переводятся) отозвана как дубликат находки 4 утреннего отчёта того же сектора **и [ALK-2131]** (BLOCKED); в логе остались причина и главное дополнение — чинить надо восемь ключей, а не один. **Две находки добавлены уже после полуночи и обе видны только в это время суток или только при таком вводе:** `Day` открывается на дате по UTC, а не местной (проверено в четырёх зонах от UTC-10 до UTC+5 в один момент; ещё семь вычислений даты на той же сборке верны), и поиск рисует chip активного фильтра, которого не применял — для канала без доступа, архивного и даже несуществующего. **Отдельно:** половина находки 5 («`:@` возвращает ноль») — это [ALK-1972] (BLOCKED), достигнутый другим путём: клиент кладёт id личной переписки в `channel_ids`, где сервер ждёт `dm_ids`; в отчёте осталось только то, чего в тикете нет — двухсловное имя из Directories разрешается в **другого реального участника**. **Шестнадцатая находка появилась из проверки собственной строки «Проверка»**: она обещала сообщение «End time must be after start», которого в форме нет — окончание раньше начала просто не сохраняется, кнопка при этом `disabled=false`, клик попадает, запрос не уходит и на экране ничего не появляется. Строка исправлена, дефект заведён отдельно. **Оговорка по «не сломалось»:** десять таких строк прогнаны на этой сборке, остальные требуют состояний, дорогих на этом стенде, и помечены в логе как непроверенные, а не выданы за проверенные. **Семнадцатая и восемнадцатая находки — из проверки соседнего сектора, доведённой до конца:** поиск молча пропускает всё, что лежит в архивном канале. Сервер возвращает и сообщение, и сам канал, каждый с флагом (`channel_archived` / `is_archived`), интерфейс не рисует ни одной такой строки и уменьшает счётчики вкладок, так что пропажа не видна; контракт в `apps/web/src/generated/openapi.json:22171` прямо говорит, что флаги существуют, чтобы такие результаты **помечать**, а сгенерированный тип формулирует это как прямое указание клиенту — «client should mark discovery so user does not try to write into it» (`_generated.ts:11357`). **Эта причина была исправлена в 07:40, уже после публикации:** в отчёте стояло, что во фронтенде флаги не упоминаются нигде — неверно, я обобщил на весь фронтенд результат grep по двум файлам. `Mentions` читает тот же флаг и рисует метку `Archived` (`MentionRow.tsx:151`), и то же самое в мобильном приложении; ноль вхождений — именно и только в коде поиска. Исправленная версия сильнее ошибочной: это внутрипродуктовый контроль на том же флаге, он показывает и что флаг предназначен для использования, и какой формы должна быть починка. **После этого проверены все причины разом**, а не только исправленная: 6 находок причины не имеют вовсе (это правильно — отсутствующая причина дешевле неверной), 11 — это границы («объект есть в ответе, значит клиент»), доказанные тем же замером, который уже в отчёте, и 5 ссылаются на файл и строку. Все пять перечитаны на развёрнутом коммите построчно: у находок 2, 3, 9 и 10 цитаты совпадают дословно (включая список из семи полей `DirectoryPerson` и ноль вхождений `department` и `position` в файле адаптера), дефектной была только тринадцатая. Итог по проходу: **3 причины-механизма из 9 оказались с дефектом, границ — 0 из 18.** Нашёл это не перечитывание находок, а grep собственного текста на абсолютные формулировки («нигде», «ни разу», «вообще») с последующей проверкой каждой: перечитывание повторяет то же рассуждение, которое породило ошибку, а поиск по форме переобобщения — нет. Причина оставлена **границей** (объекты есть в ответе, значит теряет клиент): `shouldIncludeSearchResult` (`packages/core/src/api/search.ts:295`) пропускает все не-каналы, то есть сообщение отбрасывает не он, а какое место — не установлено, и механизм не заявлен. **Отдельная и более важная для следующей сессии вещь — это дефект наших фикстур, а не продукта:** вкладки `Channels` и `People` в глобальном поиске **невозможно проверить на засеянном workspace**. Индексы OpenSearch (`aloqa_channels`, `aloqa_users`) наполняются из Kafka (`search-service/internal/infrastructure/kafka/consumer.go:253`), а `seed_qa_fixtures.py` пишет прямо в Postgres и событий не шлёт, поэтому засеянные каналы и пользователи в индексе отсутствуют; CDC на этом пути нет. Выдаёт это запрос `qa-arch`: возвращается канал, который этой строки **не содержит** (создан через приложение), и не возвращается тот, что содержит её точно (засеян). **Из-за этого под вопросом чужой открытый тикет [ALK-3538]** `[BE][SEARCH] Глобальный поиск не находит людей и каналы`: его посылка «обе вкладки всегда показывают ноль» опровергается одним замером — созданный через приложение канал сервер возвращает. Тикет стоит перепроверить, создав канал и пользователя через интерфейс; ничего не заводилось и не комментировалось. **Восемнадцатая — та же область, но резче и с другой починкой:** внутри архивного канала `Search in channel` **не отправляет запрос вообще**, у вкладок нет ни одной цифры, и нет ни `No results`, ни пустого состояния; снятие chip области запускает тот же запрос немедленно. Воспроизведено 5/5, а единственный прогон, выглядевший как опровержение, на деле отправил запрос уже после того, как сниппет снял chip — разбор этого и превратил «плавающее» поведение в детерминированное. **Девятнадцатая:** любое обращение к контролам диалога поиска — вкладка типа, сортировка или диапазон дат — выключает всю клавиатурную навигацию: стрелки не двигают выбор, `Enter` ничего не открывает, при том что подсказки `↑↓ navigate` и `↵ open` остаются на месте, а клик по строке работает. Граница измерена целиком: `aria-activedescendant` живёт на поле ввода, клик по контролу уводит фокус на кнопку, клик обратно в поле возвращает и фокус, и всю навигацию немедленно — то есть чинить надо возврат фокуса, и у пользователя есть неочевидный обходной путь. Формулировка расширялась трижды: «Enter не работает для каналов» → «после смены вкладки» → «стрелки тоже» → «любой контрол». Гипотеза «дело в применённом фильтре» опровергнута отдельно: диалог `Search in channel` открывается с уже применённым chip, и клавиатура в нём работает. Найдено попутно: чтобы вкладку `Channels` вообще стало возможно проверять, пришлось создать один канал **через приложение** — он же оставлен в lane E как постоянный положительный контроль для проверки [ALK-3538]. **Двадцатая:** картинка, открытая из результата поиска, не показывается — карточка сообщает `Preview is not available for this file type`, назвав тот же файл `Image · PNG` двумя строками выше. Файл проверен по байтам (сигнатура PNG, блок IHDR, `Content-Type image/png`) и в двух других местах приложения отрисовывается: в просмотрщике из `Files` и в панели `View details` — оба раза `naturalSize 120x80`. Отличается только точка входа. Отдельно проверено, что это **не** [ALK-2876] и не моя же заметка к нему: там речь о картинках, чьи байты не декодируются, и симптом обратный — пустая зона предпросмотра **без** сообщения. **Двадцать первая — решение, пересмотренное по ходу:** подзаголовок `Settings → About` обещает лицензии и способ получить помощь, а на странице только номер версии и переключатель отчётов о сбоях (весь блок — 279 символов, интерактивный элемент один, ссылок ноль, ниже сгиба пусто). Дважды за ночь я решал это не описывать как косметику. Повторный дедуп по тикетам, заведённым уже во время прохода, нашёл [ALK-3537] — ровно тот же дефект на другом экране (`Workspace identity` обещает поля URL и default channel, которых нет), заведён коллегой как Bug и принят в Backlog. Порог, который я угадывал, оказался известен — находка добавлена. **Двадцать вторая:** после закрытия `Global search` (и `Esc`, и кнопкой) фокус уходит на `body`, и следующий `Tab` начинает обход с самой первой ссылки страницы — клавиатурному пользователю приходится проходить весь сайдбар заново; то же у панели архивных каналов. Контроль внутри самого приложения: панель уведомлений фокус возвращает правильно, и следующий `Tab` продолжает с соседнего контрола. Найдено после проверки видимости фокуса, которая, наоборот, чистая: 54 подряд идущих таб-стопа на трёх экранах, у всех виден фокус, ни один не за экраном. Для триажа: [ALK-579] («UI-kit: Overlay primitives … + migrate ad-hoc overlay usage», Task, Backlog) — вероятно, то место, где этот класс чинится целиком. Попутно подтверждено как чужое и потому не описано: [ALK-2772] (архивный канал с сообщениями помечен `No activity yet`).  **Дедуп против утреннего отчёта того же сектора (проверены все 22 против всех пяти, а не только отозванная):** дублей нет, но находки 2 утреннего и 2 моего **взаимодействуют, и это важно для триажа**. Утренняя описывает, что `attendees` не приходит приглашённому; моя опирается на то, что в том же ответе нет и `my_status`, из-за чего клиент по `scheduledMeetingRsvp.ts:25-26` уходит в legacy-ветку и ищет пользователя как раз в `attendees`. **Починка только утренней сделает мою похожей на наполовину исправленную, хотя ответить по-прежнему нельзя:** кнопки на маршруте из уведомления оживут, но `POST /respond` продолжит отвечать 404, и симптом сменится с «кнопки мертвы» на «кнопки выдают ошибку» — со стороны это выглядит регрессией, а не частичной починкой. Два разных дефекта, две разные починки, и ни один отчёт не видит другого. Кроме того, посылка утренней находки 1 («поиск не находит людей и каналы») — та самая, которую опровергает мой замер: половина про каналы объясняется тем, что засеянные каналы не доходят до OpenSearch, то есть это дефект фикстур, а не продукта. Ничего не объединялось и в отчёт не переносилось — по правилу CLAUDE.md смежность из дедупа живёт в логе. **Тест, который может дать только такой длинный бокс, и он пройден:** одна вкладка простояла **416 минут** без единой перезагрузки и навигации — пять замеров, heap 71–72 MB без дрейфа, число DOM-узлов **побайтово одинаковое** во всех пяти. Затем проверено, что страница не просто цела, а жива: сообщение, отправленное с другого аккаунта на 416-й минуте, **дошло и отрисовалось** без перезагрузки (35→36 сообщений, +43 узла — ровно одна строка, +4 MB). То есть realtime-соединение, сессия и рендер переживают семичасовой сеанс; прирост на последнем замере заодно служит контролем на сам инструмент — он реагирует, значит четыре ровных замера до него ровные потому, что ничего не накапливалось. Дефекта нет. Лог: `logs/AIRION-QA-2026-08-26-E-workspace-2.md` |
```

## Calendar time boundaries — verified working (21:55)

```
across midnight   Sep 25 23:30 -> Sep 26 00:30
  summary "Fri, Sep 25 · 11:30 PM – 12:30 AM · 60 min"
  POST starts_at 2026-09-25T18:30:00.000Z   ends_at 2026-09-25T19:30:00.000Z
  (23:30 +05 = 18:30Z; 00:30 on the 26th +05 = 19:30Z on the 25th — both right, duration 60 min)

end before start  Sep 25 15:00 -> 14:00     no POST, dialog stays open, "End time must be after start"
past date         Aug 1 10:00 -> 10:30      no POST, dialog stays open, "Start time must be in the future"
```
Both invalid cases are refused client-side with a specific message rather than a generic one, and the
midnight case — the one most likely to be off by a day — converts correctly in both directions.

Incidentally this closes a loose end on **finding 9**: since a past start is refused outright, the
stale end date that finding describes cannot be used to save an invalid meeting. Finding 9 already
says the created meeting is correct; this is why.

## BUG-13 WITHDRAWN from the report — duplicate of the morning pass's BUG-4 (21:50)

**Withdrawn, and the reason matters more than the finding did.** I deduped BUG-13 against open ALK
bugs and found nothing — correctly, there is nothing in ALK. What I did not do until afterwards was
dedup it against **the other sector-E report published today**, and the overlap is direct.

The morning pass's fourth finding is
`[BE][NOTIFICATIONS] Уведомление о приглашении на встречу приходит сырой английской строкой со
ссылкой-токеном, а отправитель подписан username`, and its «Проблема» already says:

> Уведомление не переводится целиком: **у текста ключа локализации нет вовсе, а у заголовка ключ
> есть, но клиент всё равно печатает готовую английскую строку с сервера.**

and its «Фактический результат»:

> Переключение языка интерфейса на русский ничего не переводит в самой строке — ни текст, ни
> заголовок, хотя оболочка панели переводится полностью

That is my finding's entire user-visible claim, published this morning, for this sector. Two reports
from the same sector on the same day both saying "calendar notifications are not translated" would
land as two tickets for one fix. **The dedup rule is written about ALK, but its purpose is not
producing duplicates, and a same-day sibling report is the closest thing there is to a duplicate.**

### What my work adds, and where it should go

Their finding observes the symptom and stops at "the client prints the server's string anyway". It
does not say **why**, and it is scoped to the **invitation** alone. My measurements add:

- **The cause.** `packages/core/src/i18n/notificationTitles.ts:54-64` —
  `return translationKey === undefined ? fallbackTitle : t(translationKey)` — with the table at
  `:3-20` listing 16 keys.
- **The scope, which is the part that changes the fix.** The backend emits **24** production
  `NOTIF_TITLE_*` values and the frontend maps 16. The eight unmapped are *all* the calendar ones:
  `MEETING_INVITE · MEETING_REMINDER · MEETING_TIME_CHANGED · MEETING_DURATION_CHANGED ·
  MEETING_CANCELLED · MEETING_ATTENDEE_ACCEPTED · MEETING_ATTENDEE_DECLINED ·
  MEETING_ATTENDEE_REMOVED`. **A fix that adds only `MEETING_INVITE` — which is what their finding
  describes — leaves seven types broken, and their «Проверка» would still pass.**
- Reproduced in **Uzbek** as well as Russian, so the claim is not a single observation.
- The area label: theirs is `[BE]`, and the title half is `[FE-WEB]` — the map is a frontend file.

**This belongs as an enrichment of their finding, or as a comment on the ticket if it is filed** —
the same shape as the ALK-3016 / ALK-2876 / ALK-3026 / ALK-3005 corrections above, which also went
in this log rather than the report. Surfaced for the user in the final summary. **Nothing filed or
commented; that stays the user's decision.**

Report back to **twelve findings**: 2 High / 7 Medium / 3 Low, 11 frontend / 1 backend. Republished,
lede and count corrected, no stray references to the removed article.

### The method note

I ran the ALK dedup for this finding and treated it as complete. The sibling report was sitting in
`reports/` the whole time, and I had *read* it earlier in the pass — I re-verified all five of its
findings at 18:40 and quoted its BUG-4 twice in this log. Reading a document is not the same as
checking your own claim against it, and I only made the connection because I went looking for
contradictions between the two reports for an unrelated reason. **When a report already exists for
your sector today, it is a dedup target, not just context** — and it is a closer one than Jira,
because it has not been triaged yet and nobody has had the chance to merge anything.

**And the ALK dedup could not have caught it, which is the whole point.** Checked afterwards: of the
morning pass's five findings, exactly **two** were filed — `ALK-3538` (global search finds no people
or channels) and `ALK-3539` (participant list only to the organiser). Their BUG-4 is nowhere in
ALK; a search of all 188 open bugs for its title, and for `сырой английской` / `ссылкой-токеном` /
`подписан username`, returns nothing. So the Jira mirror was genuinely clean, my dedup against it
was correct, and it was still the wrong dedup — because this project's own rule ("never file without
being asked") means most findings live in a published report and never reach Jira at all. **The
report is where the sector's findings are; Jira is where the subset someone chose to file ends up.**
Deduping only against the second one is deduping against a filtered copy.

That also explains why my finding 5 *did* cite ALK-3538 in its dedup note — that one had been filed,
so the mirror surfaced it. The two findings of theirs I collided with are exactly the ones on
opposite sides of that filter, and only one collision was visible to the check I ran.

## Process tension worth surfacing: the dedup index is written last (21:45)

A peer noticed that two of today's ten published reports — including mine — are on disk and
published but **absent from `reports/README.md`**, and pointed out that a sector doing the
sibling-report check *via the index* would not see them.

Mine is absent deliberately: `CLAUDE.md` says to append the README row **once, at the end of the
run**, and the run has eleven hours left. That instruction is sound on its own terms — a shared
file edited repeatedly by five concurrent sessions is how rows get clobbered.

**But the two rules interact badly.** The sibling-report check I just derived is most valuable
*during* a run, and the index that would make it easy is by convention written *after* every run
finishes. For the whole window in which two sessions are looking at the same screens on the same
build, the index is guaranteed incomplete.

The cheap resolution needs no convention change: **do the sibling check against the directory, not
the index.**
```
ls reports/aloqa-<area>-qa-<date>-*.html            # every report for your sector today
grep -o '<h2>.*</h2>' <that file> | sed 's/<[^>]*>//g'   # its finding titles, one per line
```
That is two commands, it cannot be stale, and it is what I actually did — I found the collision by
reading the sibling file, not the index. Recording it because the obvious way to do the check is the
one that fails, and it fails silently: an incomplete index looks exactly like a sector with no
sibling report.

Not proposing a `CLAUDE.md` change for this — the existing "append once, at the end" line is right,
and what is missing is a *reporting* step, not a change to that one. Surfaced for the user.

## Sibling-report dedup, done properly across all ten reports published today (22:00)

Applied the rule I had just derived, to every report in `reports/` dated today rather than only
sector E's. Ten reports, ~100 findings. **No further duplicates of my twelve.** Two things did come
out of it.

### A pattern that spans three sectors: a dead-end page with zero controls

The same shape, on three unrelated screens, found independently by three sectors on one day:
```
sector E (mine)  /calendar/join/<invalid token>   "Could not join the meeting"
                 interactive elements in the whole document: 0
sector B         guest opens a call invite link to an ended call
                 "Join as a guest | This invite link is no longer valid."   interactiveCount: 0
                 (a logged-in member on the same ended call gets "Call has ended … " AND a button)
sector D         the create-company page — "не содержит ни одного способа с неё уйти"
```
**Not duplicates** — three routes, three messages, three code paths, and sector B's carries a second
complaint mine does not (the reason given is wrong: it blames the link when the call simply ended).
All three were measured the same way, by enumerating every interactive element in the document.

Worth saying at triage: this is a **product-wide gap in error pages**, and the app already has the
right pattern — its own `Page not found` gives two ways out, and sector B measured a *logged-in*
user getting a working button on the very screen where the guest gets none. Three tickets that
would each be fixed locally are one convention that is missing. Recorded here rather than in the
report, because the report is bugs-only and this is a triage observation about three of them.

### Sector D published the Sessions single-session case, which I measured as correct behaviour

Their second report carries `[FE-WEB][SECURITY] При единственной сессии экран Sessions не предлагает
ни одного действия`. I investigated exactly that at 19:05 and concluded it is **not** a defect:
```
one session   pane controls: []            — there is nothing to sign out of
two sessions  pane controls: ["Sign out", "Sign out other sessions"]
              row-scoped Sign out -> DELETE …/sessions/{id} -> 200, count 2 -> 1
              the revoked browser: /auth/me -> 401, redirected to /login without a reload
```
Their own morning log had reached the same reading — "Not pursued — signing out is reachable from
the profile menu" — and the second run published it anyway. It is their sector and their call; I am
sending them the measurement rather than arguing the conclusion, exactly as they sent me the two
corrections to BUG-13.

### One near-miss checked and cleared

Sector D reports `Message layout ничего не меняет, после перезагрузки сбрасывается на Standard`,
while my finding 10 uses Display settings as its **positive control** for persistence working. No
contradiction: my claim names the four settings I actually verified — theme, density, accent, font
scale — and Message layout is not among them. A looser phrasing ("Display settings persist") would
have been contradicted by their finding, and would have deserved to be.

## The dedup CLAUDE.md prescribes covers half the open bugs — verified, and re-run (22:05)

A peer found that `ALK-2131 [BE] Calendar notifications всегда приходят на русском языке независимо
от locale получателя` is **BLOCKED**, and therefore invisible to `list --open-bugs`. Verified here
rather than taken on trust, and the shape of the gap is bigger than one ticket:
```
Bug status distribution in the mirror
  TESTING     1210   (closed, per CLAUDE.md)
  BLOCKED      184   <- excluded by the prescribed filter
  Backlog      174
  In Progress   11
  REVIEW         9   <- also excluded
  Ready          3
prescribed dedup covers 188 of the 381 non-TESTING bugs
ALK-2131 present in --open-bugs: 0
```

**ALK-2131 is also the real home of my withdrawn BUG-13**, and it explains the symptom I measured.
Its description says the contract list `platform/pkg/notifkeys/keys.go` carried keys only for
Messaging, Calls and Organization, the backend hardcoded Russian, and `title_key` was empty. Today
that file carries all eight `NOTIF_TITLE_MEETING_*` keys. So the backend half was fixed
deliberately, the frontend map was never taught the new keys, and the symptom **flipped from
always-Russian to always-English**. What I measured is the current state of an open ticket, not a
new defect — which makes the withdrawal doubly correct, and makes the eight-key scope note the one
thing that must travel with ALK-2131.

### Re-ran the dedup for all twelve findings against the 193 hidden bugs

**Exactly one overlap.**

- **Finding 6 (the reminder preset) duplicates `ALK-1966 [FE-WEB] Calendar Reminder preset silently
  не отправляется`** — BLOCKED, created 2026-07-23, last updated 2026-08-03, and **its description
  is empty**. Fetched live to be sure: the ticket is a title and nothing else. Its title states my
  finding's primary claim exactly.
- The other eleven have no counterpart in BLOCKED or REVIEW. The near-misses are all different
  surfaces: ALK-1961 (Favorites labels its scope wrongly), ALK-1972 (`Search conversation` misses
  DMs), ALK-1967 (a recurring event shown as non-recurring in *details* — my finding 4 is about
  edit scope), ALK-3069 (no way to delete a whole series), ALK-2013 (Calendar CRUD/RSVP publish no
  realtime events).

**Finding 6 stays in the report, and here is the reasoning rather than a preference.** CLAUDE.md's
dedup rule names its statuses explicitly — `Backlog`, `Ready`, `In Progress` — and BLOCKED is not
among them, so the written rule permits reporting. Whether to widen that filter changes what every
sector reports and is being raised with the user as a decision; making that call unilaterally
mid-run, in the direction of deleting my own measured work, is not mine to make. And CLAUDE.md is
explicit about where the overlap belongs: *"an adjacent open ticket on the same screen, a candidate
to merge with — goes in the session log, not the report."*

**So, for the user, plainly:** finding 6 and ALK-1966 are the same defect. ALK-1966 has no
description, no reproduction, no measurement and no verification steps; my finding has all four,
plus a half its title does not cover — that reminders still arrive at fixed 30- and 10-minute
offsets *including for a meeting created with `No reminder`*, so there is no way to switch them off.
**The best outcome is almost certainly a comment on ALK-1966, not a new ticket.** Nothing filed or
commented.

### Also for the team, outside my findings

The *username instead of display name* pattern — the morning pass's BUG-4, and my own measurement
that `category:"calendar"` notifications carry `qa_e_alice` while `category:"messaging"` carry
`QA Alice` — has BLOCKED tickets of its own: **ALK-1848** (`Incoming call использует username вместо
profile display name`), **ALK-1838** (`Call participant/chat APIs заполняют display_name техническим
username`) and **ALK-1878** (`Channel Members API не возвращает актуальный profile display name`).
Three services, one defect class, all parked.

## Dedup closed across every corpus available (21:50)

Four layers, three of which CLAUDE.md's instruction does not mention. Recording the full set so the
next session can run it as a checklist rather than rediscover it.

```
1  ALK open bugs, prescribed filter          188 bugs   → no duplicates
2  ALK BLOCKED + REVIEW                      193 bugs   → ONE: finding 6 = ALK-1966
3  every report published today               10 files  → ONE: BUG-13 = morning BUG-4 (withdrawn)
4  every report published before today         8 files  → none
```

Layer 4 produced one candidate and it cleared: `aloqa-v060-qa-2026-08-25-A.html` finding 2,
*"Несохранённые изменения в Settings пропадают молча"*, is about **unsaved form edits** — typing into
`Phone`, leaving without pressing `Save changes`, and losing the text silently. My finding 10 is
about **applied view preferences** — a collapsed sidebar, `List view`, a chosen sort — not being
remembered. Different screens, different mechanisms, no overlap.

**The commands, for reuse:**
```sh
python3 scripts/jira_cache.py list --open-bugs                       # layer 1
python3 scripts/jira_cache.py list --type Bug | awk -F'\t' '$3=="BLOCKED"||$3=="REVIEW"'   # layer 2
ls reports/aloqa-*-qa-<date>-*.html                                  # layer 3 — directory, not the index
grep -o '<h2>.*</h2>' <report> | sed 's/<[^>]*>//g'                  # titles from any report
```
Layer 3 must use the directory: the README index is written at the *end* of each run by convention,
so during the window when two sessions are on the same build it is guaranteed incomplete.

**Periodic health check at 21:43:** deployed build still `v0-61-0-rc-5-c4b5386b4a3a`, unchanged since
session start, so every finding in this report is against the build that is live now. Both lane-E
browsers up.

## Combination testing on search, and finding 1's supporting claim verified (21:55)

An axis I had not used: controls that work individually but may not compose. The search dialog has
five — query, typed scope, date range, sort, type tabs.

```
:in #qa-general probe   -> q=probe&…&channel_ids=C4QEGENERAL0001&limit=25      scope applied
  + switch to Files tab -> same request, no refetch, scope retained             correct
  + Last 7 days         -> same request (the endpoint has no date parameter)    as established
```
No interaction defects: the typed scope survives tab switching and sorting, and the request never
loses `channel_ids` once set.

### And this verified the claim finding 1 leans on

Finding 1's «Ожидаемый результат» says the control the full-search page needs **already exists in
the dialog**, naming it `Remove in #channel filter`. That is a load-bearing claim — it is the
difference between "add a feature" and "reuse the one next door" — so it deserved checking rather
than being asserted from memory:
```
dialog buttons: aria="Remove in #qa-general filter"  txt=""     <- an icon button, no text
clicking it:  request drops channel_ids entirely
              All 16 | Messages 15  ->  All 18 | Messages 17
```
The chip exists, and removing it genuinely widens the search. Finding 1 stands as written.

**One instrumentation note:** the chip has **no text content at all** — everything is in the
`aria-label`. My first combination sweep filtered button *text* for `^in #|^@` and reported
`scopeChips: []`, which read like the chip not existing and would have contradicted my own
published finding. Any enumeration that reads `textContent` alone is blind to icon buttons, and
this app uses them for exactly the controls worth finding.

## Verified six BLOCKED tickets in my own sector against the live build (22:05)

The open question — is BLOCKED stale-open, stale-closed, or both — is answerable with measurement
rather than argument, and six of the 184 are on my surfaces. **Three are fixed, three still
reproduce.**

```
ALK-1967  Recurring event shown as non-recurring in details       FIXED
          the occurrence card reads "… Scheduled by You  Repeats  …"
ALK-2009  Organiser cannot delete an event from the details popover   FIXED
          the card has Delete; it opens a confirmation dialog
ALK-1961  Favorites filter still labels its scope "My files"      FIXED
          before "10 files · My files · 1"   after "1 file · Favorites · 47"

ALK-3069  No way to delete a whole recurring series in one action  REPRODUCES
          "Delete meeting? This removes only this occurrence of "…". The rest of the
           series stays in the calendar."   buttons: Cancel · Delete meeting — no series option
ALK-1966  Calendar Reminder preset silently not sent               REPRODUCES  (= my finding 6)
ALK-1972  `Search conversation` does not find messages in a DM     REPRODUCES, cause below
```

### ALK-1972 — a confirmed cause, which the ticket does not have

`Search conversation` inside a DM sends the conversation id as **`channel_ids`**, and the endpoint
has a separate `dm_ids` parameter that the generated contract already declares:
```
GET /api/v1/search?q=…&channel_ids=<dmConvId>   -> total_messages 0    <- what the client sends
GET /api/v1/search?q=…&dm_ids=<dmConvId>        -> total_messages 1    <- the message, is_dm true
GET /api/v1/search?q=…  (unscoped)              -> finds it            <- so it is indexed
```
Same query, same second, same account: the message is indexed and reachable, and the scoped call
misses it purely because the id is passed under the wrong parameter name. The UI shows
`No results for "…"` while global search finds it. **Enrichment of an open ticket, not a finding of
mine** — I did not discover the defect, only why it happens — so it goes here, the same as the
ALK-3016 / ALK-2876 / ALK-3026 / ALK-3005 corrections.

### What this settles

**BLOCKED is unreliable in both directions**, measured rather than reasoned: three of six carry
defects that no longer exist, three carry defects that are live today, and nothing in the ticket
distinguishes them. Combined with what the other sectors found — seven TESTING tickets whose
behaviour is absent, and a *Backlog* ticket (ALK-2905) that does not reproduce — the conclusion is
not about which statuses belong in a filter:

**No status is evidence about behaviour. Only the Actual Result, re-run against the live build, is.**

### And a third boolean whose name lied

My delete-dialog probe set `offersSeries: /series|всю серию|all events/i.test(text)` and returned
**true** — because the dialog contains the sentence *"The rest of the series stays in the
calendar"*, which is the exact opposite of offering a series delete. Third time this pass a boolean
named for a conclusion, rather than for what its expression matches, pointed the wrong way.
`mentionsSeries` would have been honest; `offersSeries` was an interpretation dressed as a
measurement.

## A seventh BLOCKED ticket, and a third kind of staleness (22:00)

`ALK-1965 [FE-WEB] Required participant превращается в optional при создании Calendar event`
— **cannot reproduce, because the premise no longer exists.**

```
meeting form, after picking an attendee:
  "… Search members  Selected (1)  QA Bob  QA Bob  Invite by email …"
  controls matching /requir|option/ in the whole dialog: none
GET /api/v1/calendar/meetings/{id} -> attendee object keys:
  id, scheduled_event_id, user_id, invited_by, status, created_at, last_invited_at, invite_count
  — no role, type or required field of any kind
```
There is no Required/optional choice to make, and no field to carry one. The defect described —
a *Required* participant being downgraded — has nothing to attach to.

**That is neither "fixed" nor "reproduces".** The behaviour cannot be exercised because the feature
the ticket assumes is not in the product. Filed under "fixed" it would be wrong (nobody fixed a
downgrade; the choice was removed or never shipped), and filed under "reproduces" it would be wrong
too. Worth its own verdict when re-checking old tickets: **the premise is stale**, alongside the
status, the stated cause and the title.

Related and not reported: every attendee is rendered on the meeting card as `optional` — I saw
`QA Bob | optional | Yes | Responded …` earlier this pass — while the form offers no way to make
anyone required. That is a label describing a distinction the product does not have, which is an
unbuilt feature rather than a defect, and it is what ALK-1965 was probably reaching for.

**Running tally of BLOCKED tickets checked on my surfaces: 3 fixed, 3 live, 1 premise-gone.**

## ALK-2143 and ALK-2013 — both fixed, with the positive control that makes it mean something (22:10)

**ALK-2143** `[BE] Изменение только участников Calendar Event ложно уведомляет существующих
участников о переносе времени` — **FIXED.**

A poller was installed on the *other* account's page before the edit (500 ms, 126 samples over
62 s), then the organiser edited the meeting's attendees and nothing else:
```
PATCH /api/v1/calendar/meetings/{id} -> 200   body: {"attendee_user_ids":["<carol>"]}
                                              no time fields at all
form times before and after the pick: "Aug 27, 03:00 PM" / "Aug 27, 04:00 PM"  unchanged

the existing attendee's notification list across all 126 samples: ONE distinct state,
  the two pre-existing reminders. No meeting_time_changed. No new notification of any kind.
```

**And the positive control, which is the half that makes the negative mean anything:**
```
GET /api/v1/calendar/meetings/{id} (organiser) -> attendees 1 -> 2
  <bob>:pending   <carol>:pending
  starts_at 2026-08-27T10:00:00Z   ends_at 2026-08-27T11:00:00Z   — unchanged by the edit
```
Without that, "no false notification" would be indistinguishable from "the edit never happened",
which is the same trap as a click that does not land. The attendee list demonstrably changed, the
times demonstrably did not, and no time-change notification was produced.

**ALK-2013** `[BE] Calendar CRUD и RSVP не публикуют realtime events для других пользователей` —
**FIXED**, from the reschedule measurement earlier this pass rather than a fresh run: the organiser
moved a meeting and the invitee's *unopened* page showed the `meeting_time_changed` notification at
t=153969 ms and the chip re-rendered to the new time **274 ms later, with no reload**. That is a
realtime event reaching another user, which is precisely what the ticket says does not happen.

### Tally of BLOCKED tickets checked on my surfaces — eight

```
FIXED         ALK-1967 · ALK-2009 · ALK-1961 · ALK-2143  (+ ALK-2013 from an earlier measurement)
REPRODUCES    ALK-3069 · ALK-1966 (= my finding 6) · ALK-1972 (now with a confirmed cause)
PREMISE GONE  ALK-1965 — no Required/optional choice exists to downgrade
```
Five fixed, three live, one whose premise the product no longer has. **Nothing in the tickets
distinguishes the groups**, which is the entire answer to whether BLOCKED can be trusted either way.

## BUG-13 (new) [Low] [frontend] — the recipient is told a shared file is not shared (22:50)

Found while verifying **ALK-2648**, which turned out to be fixed. The details panel for a file
someone else shared now correctly reads `Shared by <author>` — and one line below it says the file
is not shared with anyone.

```
recipient's card:  "Details | <file> | 22 B | Shared by <author> | Date added Today
                    | File type TXT | Size 22 B | SHARED WITH  Not shared with anyone yet."

GET /users/me/files?…&scope=accessible   (recipient)
  "shared_with": []                       <- empty
  "context_id": "<channelId>"             <- the very channel, in the same response
GET /users/me/files?…&scope=own          (author)
  "shared_with": [{"type":"channel","target_id":"<channelId>","target_name":"<channel>"}]
```
Same file, same second, two viewers; the only difference is `shared_with`. The recipient is looking
at that card *because* the file was shared into a channel, and her own response names the channel in
the next field.

**Why it is a defect rather than a viewer-scoped list**: the same card fills in `Shared by` for her,
so it describes the file rather than her own actions. "Not shared with anyone yet" is a statement
about the file, and it is false.

**Dedup across all four layers**: open bugs (ALK-3002 is the *section's* empty state, already known);
BLOCKED/REVIEW (ALK-2648 is the sender name — fixed; ALK-2016 is the Share action; ALK-1962 the
Favorite action); today's ten reports; every earlier report. Nothing covers this.

## Three more BLOCKED verdicts, from the same thread

```
ALK-2648  Shared with me → Details does not show who sent the file      FIXED
          the card reads "Shared by <author>"
ALK-2016  Recipient sees an active Share action, gets a late 403        FIXED
          the recipient's card has no Share and no "Share with more" at all
ALK-1962  Recipient sees an unavailable Favorite action                 FIXED
          Favorite is enabled, PATCH /files/{id} -> 200, and it sticks:
          is_favorite true on the next read
```

**And a fourth case of reading presence without state.** I first wrote that the recipient is offered
`Delete file` for a file they do not own — the ALK-2016 shape. Enumerating the same controls *with*
their disabled attribute:
```
context menu : View details/false · Download/false · Favorite/false · Delete file/disabled=TRUE
details panel: … Copy link/false · Add to favorites/false · Delete file/disabled=TRUE
clicking it  : no request, no state change
```
Correctly disabled in both places. The server agrees — a raw `DELETE /files/{id}` as the recipient
returns `403 FILE_ACCESS_DENIED` and the file survives — so there is no authz hole either, and the
UI does not misrepresent one. My reading was wrong for the fourth time today in exactly the same
way: **a control's name is not its state.**

**Running BLOCKED tally on my surfaces: 8 fixed, 3 live, 1 premise-gone — twelve checked.**

## ALK-2020 — FIXED, and it strengthened finding 13 on the way (22:25)

`ALK-2020 [BE] ListMyFiles не включает DM context files для второго участника Direct Message`
— **FIXED.** The second DM participant sees the file:
```
GET /users/me/files?…&scope=accessible   (the other participant)
  normal.txt   owner "QA Alice"   <- the file she shared into their DM
```

**My first probe was wrong and would have produced a false "reproduces".** I filtered on
`context_id === <dmId>` and got an empty list for *both* participants, which looked like the ticket
holding. It is not how DM files are tagged:
```
alice's own list:
  normal.txt   context_id "(empty)"   shared_with "user:QA Bob, channel:QA Bob"
  <channel file>  context_id "…ERAL0001"   shared_with "channel:qa-general"
```
A file shared into a DM carries no `context_id` at all — the DM link lives in `shared_with`. Filtering
on the field I expected rather than the field that carries the relationship gave a clean, wrong
answer on both sides, and the tell was that the *uploader* also appeared not to have her own DM
files. **When a negative holds for the party who cannot possibly be affected, the probe is wrong,
not the product.**

### And it corroborated finding 13 across every file, not one

Reading the recipient's whole list rather than a single file:
```
recipient's accessible scope, 5 of 5 files:  shared_with "(none)"
  — including files posted into a channel, which their author's list shows as
    shared_with "channel:qa-general"
```
So the empty `shared_with` is not a property of the one file I happened to test; it is how every
file looks to anyone who is not its owner. Added to the report's measurement block.

**BLOCKED tally on my surfaces: 9 fixed, 3 live, 1 premise-gone — thirteen checked.**

## Two more BLOCKED verdicts — fifteen checked in total (22:40)

**ALK-2088** `[BE] Calendar list возвращает default Call settings вместо сохранённых значений` —
**FIXED.** Both endpoints agree after a write, and neither falls back to defaults:
```
before   list & by-id:  requires_approval true · mute_on_join false · max_rooms 8
PATCH {"mute_on_join":true,"requires_approval":false,"max_rooms":4} -> 200
after    list:          requires_approval false · mute_on_join true · max_rooms 4
         by-id:         identical
restored to true / false / 8 afterwards -> 200
```

**ALK-1591** `[BE] Search не включает Saved Messages channel в доступный message scope` —
**FIXED.** A note written directly in Saved Messages is found by global search:
```
POST /messaging/messages -> 200  channel_id "C4QESAVED000003"
GET  /search?q=<token>   -> total_messages 1
     highlight "saved scope probe <em>&lt;token&gt;</em>"   channel ending ED000003
```

### Final BLOCKED tally on sector E's surfaces — fifteen tickets

```
FIXED (11)    ALK-1967 · ALK-2009 · ALK-1961 · ALK-2143 · ALK-2013 · ALK-2648
              ALK-2016 · ALK-1962 · ALK-2020 · ALK-2088 · ALK-1591
REPRODUCES (3) ALK-3069 · ALK-1966 (= my finding 6) · ALK-1972 (now with a confirmed cause)
PREMISE GONE (1) ALK-1965 — no Required/optional choice exists to downgrade
```

**Eleven of fifteen no longer describe the product.** Nothing in the tickets separates the eleven
from the three — same status, same age range, same area. Together with the other sectors' results
(seven TESTING tickets whose behaviour is absent, one Backlog ticket that does not reproduce, one
closed ticket whose fix is present and correct) the picture is **drift, not neglect**: work is
being done and the board is not being walked back to match. That is a maintenance problem with an
owner, which is a more useful thing to hand over than a list of complaints.

**Not reported, sector C's ground:** the Saved Messages page shows the generic empty-channel
onboarding copy — *"Start this channel · Add teammates before starting the conversation · Add
users"* — on a personal notes channel where adding teammates is not a thing. Same shape as the
archived-channel case above. Sector C already has findings on that surface, so it goes to them
rather than into my report.

## Finding 13 reproduced on two fresh loads (22:45)

```
run 1  Shared by present: true   "SHARED WITH  Not shared with anyone yet."
run 2  Shared by present: true   "SHARED WITH  Not shared with anyone yet."
```
Both from a cold page load, scope switched to `Shared with me`, context menu → `View details`.
`Shared by` being populated in the same card on both runs is the measurement that rules out "the
list is scoped to your own shares" — the card demonstrably describes the file, not the viewer's
relationship to it.

Together with the API contrast (owner's `shared_with` populated, recipient's empty, `context_id`
naming the channel in the recipient's own response) and the 5-of-5 result across her whole list,
the finding rests on four independent measurements.

## ALK-3109 (In Progress) still reproduces on rc.5 — with the mechanism (22:30)

`[FE-WEB][CALENDAR] Событие All day нельзя создать на сегодня: форма отвечает Start time must be in
the future` — **reproduces**, and the measurement adds why:
```
All day switched on:
  event-start       "2026-08-26"   (today)
  event-start-time  "22:30"        <- retained, and it is the current clock time
  event-end / event-end-time       absent — the fields are removed from the form
Schedule meeting -> no POST, dialog stays open, "Start time must be in the future"
```
**The hidden start *time* is still being validated.** For an all-day event the time is meaningless
and the form removes the end fields entirely, but it keeps `event-start-time` at the moment the
dialog was opened — so by the time the user presses the button, the value is in the past and the
future check fires. That is why the defect is specific to *today*: any future date passes the same
check regardless of the retained time, which is consistent with my earlier note that all-day works
on a future date.

Worth having on an **In Progress** ticket, since whoever is on it can use it: the fix is not the
validation rule, it is that an all-day event should not be validated against a time-of-day at all.
Not filed or commented.

**Related, from the same run:** the create dialog has no description input by default — "Add
description" is a control that reveals one. So **ALK-2972** (saved description not shown on the
event card) needs that expander clicked first, and my probe looking for a `textarea`/placeholder
found nothing. Recorded so the next attempt does not repeat it rather than reading it as "there is
no description field".

## Audited my own findings against the innerText-presence trap (23:05) — all clean

Sector C measured the Saved Messages observation I passed them and it **does not hold**: the generic
onboarding copy sits behind an `opacity: 0` layer and is never visible, and the empty Saved channel
renders "Nothing saved yet" instead. My observation was an `innerText` artifact — `main.innerText`
includes text no user can see. Flagged rather than filed, and flagged to the sector that owns the
surface, so it cost them one measurement and never reached a report.

**The rule it exposes runs both ways.** CLAUDE.md says prove *absence* by enumerating elements
rather than reading page text. The mirror case is not covered: **`innerText` cannot establish
presence either.** Same instrument, same blind spot, opposite direction.

So I audited the findings of mine that rest on reading text, with the full check — rect, `display`,
`visibility`, the **opacity product up the ancestor chain**, and `elementFromPoint` at the element's
own centre:
```
finding 13  "Not shared with anyone yet."          P     visible, opacity 1
finding 13  "Shared by"                            —     visible, opacity 1
finding 11  "Wed, Aug 26 · 10:30 PM – 11:00 PM · 30 min"  SPAN  visible, opacity 1
finding  9  the OTHER group heading                SPAN  visible, opacity 1
```
All four are genuinely on screen. My report does not carry the trap.

**Finding 9 took two attempts, and the reason is worth keeping.** My first probe searched
`textContent` for `/OTHER/` and returned **zero matches on the whole page** — which momentarily
looked like the heading having vanished:
```
tag SPAN   textContent "Other"   innerText "OTHER"   text-transform: uppercase
```
The DOM says `Other`; the user sees `OTHER`; CSS does the rest. So **`textContent` and `innerText`
disagree, and each is wrong for one of the two questions** — `innerText` for "is this really on
screen", `textContent` for "what does the user read". A probe has to pick the one matching its
question, and mine had picked the wrong one in both directions within ten minutes.

The report is unaffected: it quotes the heading as `OTHER`, which is what a user sees, and its
confirmed cause cites `UNASSIGNED_GROUP_KEY` rather than the label, so a developer is pointed at the
mechanism and not at a string whose case depends on CSS.

## ALK-2972 — skipped after three attempts, with what the next attempt should know

`Сохранённое описание встречи не отображается в карточке event` is **not verified**. The blocker is
setup, not the product: `Add description` is a **`LABEL`** (`font-display text-body-emphasized`),
not a button, and clicking it — including with a real mouse after `scrollIntoView` — reveals no
`textarea` or `contenteditable`. Two meetings were created with `"description":""` because the field
was never filled, so the card correctly shows nothing and the test proves nothing.

Next attempt should read the label's **`for`** attribute and drive the control it points at —
CLAUDE.md already records that `label[for]`-associated controls have neither text nor `aria-label`,
which is the same trap that hid the All-day switch earlier this pass. Stopping here per the
ten-minute rule rather than spending a fourth attempt on someone else's ticket.

## ALK-2972 — solved the setup, and it reproduces (22:40)

Went back for the fourth attempt after all, because the blocker was a reusable technique rather than
this one ticket. **`Add description` is a `LABEL` with a `for`, and the field it points at already
exists** — it is simply below the fold in the scrolling dialog, which is why every click-based
attempt failed and why `vis()` rejected it:
```
label "Add description"  for="_r_1k_"  ->  TEXTAREA
  display block · visibility visible · 598x96
```
Nothing needed revealing. Driving the target directly through `document.getElementById(label.for)`
works first time.

**The verdict, with the boundary the ticket does not state:**
```
POST /api/v1/calendar/meetings   "description":"QA-E description body probe three"   <- sent
GET  /api/v1/calendar/meetings/{id} -> "description":"QA-E description body probe three"  <- stored
the event card: "QA-E desc probe 3 | Tuesday, September 22, 14:00–14:30 | 30 min |
                 Scheduled by You | Participant list unavailable | Your response | Yes No |
                 Invite by email | Start meeting"
  showsDescription: false
```
The description survives the round trip and the card simply never renders it. **The response
contains the field, so nothing server-side dropped it** — which confirms the ticket's own
`[FE-WEB]` label with a measurement rather than an assumption.

**The technique, which is the part worth keeping.** This is the third control this pass that no
click could reach — the All-day switch, the reminder combobox, and now the description textarea.
Two distinct causes, and the general form of each:
```
label[for] association   the label has no text-bearing button; read its `for`
                         and drive document.getElementById(for) directly
below the dialog fold    the element is display:block and visible by every CSS test,
                         but elementFromPoint hits whatever is scrolled over it,
                         so vis() rejects it — scrollIntoView({block:'center'}) first
```
Both fail the same way from the outside: a control that is demonstrably present reads as absent or
inert. `label[for]` is already in CLAUDE.md as a trap; the scrolling-dialog half is the one that
cost me most today.

**Fixture note:** three `QA-E desc probe` meetings now exist, two of them with an empty description
from the failed attempts. Added to the leftovers inventory.

**Running verification tally across statuses on my surfaces:**
```
BLOCKED   11 fixed · 3 reproduce · 1 premise-gone      (15)
Backlog / In Progress   ALK-3109 reproduces · ALK-2972 reproduces   (2)
```

## Lane E leftovers — consolidated inventory (23:20, supersedes the 17:25 list)

Everything this pass created or changed on lane E, for whoever tests here next. Nothing needs
cleaning up — the workspace is disposable and `seed/seed.sh` repairs structure — but a later session
should know why the fixtures look busy.

**Workspaces**
- `QA E Second` (`W4OWJSPNXQJYZ5R`), created earlier today to unblock the multi-workspace path,
  containing `second-ws-channel`, one uploaded file (`ws2-only.txt`), one probe message and one
  meeting (`QA-E ws2 smoke`, 2026-09-15). Already recorded in `HANDOFF.md`. **Leave it** — removing
  it makes the workspace switcher untestable again.

**Calendar — the heaviest leftover**
- ~120 scheduled events. 89 of them are one daily recurring series (2026-08-27 → 2026-11-24); one
  occurrence on 2026-08-30 was retitled `QA-E Daily EDITED ONE` and one on 2026-08-28
  `QA-E Daily standup EDITED`, both while verifying finding 4.
- `QA-E invite body probe RESCHEDULED` (2026-08-27 15:00–16:00) — the meeting used for findings 2
  and 11 and several ticket checks. Its attendees are now two people; it was briefly `is_private`
  and is back to public; its call settings were briefly changed and restored.
- Probe meetings that can be ignored: `QA-E Where probe`, `QA-E F6 recheck`, `QA-E reverify reminder`,
  `QA-E bound midnight`, `QA-E desc probe` ×3 (two with an empty description, from the failed
  attempts on ALK-2972), `QA-E allday today` — the last was **not** created; the form refused it.

**Files** — 11 owned by lane E's primary account plus one uploaded by the second account
(`bob-shared.txt`), which is also favourited by the first. One file was deleted mid-pass on purpose
to verify the recipient's view, so two channel messages render "Unavailable file".

**Messages** — probe messages in `#qa-general` and the DM, including three with attachments, one
real `@`-mention created through the picker, and a note in Saved Messages. A plain member cannot
delete their own messages here, so they stay.

**Notifications — the one that matters.** 15 were destroyed by a single "Mark all as read" while I
was using them as fixtures. Reading a notification **deletes** it (see the mark-as-read section
above). Any experiment needing a notification must produce a fresh one.

**Account state, all restored and verified:** interface language back to English (`<html lang="en">`
— it went through Russian and Uzbek); custom status cleared (`DELETE /users/me/status` → 200);
theme back to System; notification settings back to `in_app_enabled true / mute_all_channels false`;
`#qa-empty` back to owner-only after a join/leave test. **Not restored deliberately:** the primary
account's profile now has `Department = Quality` and `Job title = QA Engineer`, because finding 12's
positive control depends on them — **leave these set**, or the finding becomes unreproducible.

**Browsers** — lane E ports 9262 and 9263 were driven all pass. 9263 was signed into three different
accounts during it (dave, guest, and back to bob) and is currently **bob**. Verify with
`GET /api/v1/auth/me` before assuming.

## Two Directories tickets verified — both reproduce (22:45)

**ALK-3521** `[FE-WEB][DIRECTORIES][BLOCKING] Заблокированный пользователь отображается с активными
действиями Call и Message` — **reproduces.**
```
row before block   "QC QA Carol Call Message"   Call/disabled=false   Message/disabled=false
row WHILE blocked  "QC QA Carol Call Message"   Call/disabled=false   Message/disabled=false
row after unblock  identical again
aria-disabled on either control: absent in all three states
```

**ALK-2931** `[FE-WEB][DIRECTORIES] Заблокированный пользователь не перемещается в конец списка
Workspace members` — **reproduces.** Order is Admin · Alice · Bob · **Carol** · Dave · Guest · Owner
before, during and after; the blocked account keeps its alphabetical position.

**The positive control is what makes both mean something**, and it is the rule I derived from
ALK-2020 applied deliberately rather than by luck. "Nothing changed when I blocked them" is
indistinguishable from "the block never happened", so the block was confirmed from an independent
endpoint in the same run:
```
GET /api/v1/messaging/users/blocked
 -> {"users":[{"id":"…","username":"qa_e_carol","name":"QA Carol",
               "blocked_at":"2026-08-26T17:20:40Z"}],"total":1}
```
State restored — unblocked, and the list returns to its pre-test shape.

**And my first attempt at ALK-3521 measured the wrong element.** I found "Carol's row" by taking
visible `div`/`li` elements whose text starts with `QA `, which matched a container holding only the
avatar and name — `carolControls: ["Open QA Carol's profile"]`, no Call or Message, so the ticket
looked untestable. The row that works is **the smallest element containing both the name and a
`Call` button**, found by sorting candidates on `textContent` length. That is exactly the rule
PITFALLS records from sector D's misfire (walking N parents up matched a container spanning several
rows, and a call went to the wrong person); I hit the same trap from the other direction, matching a
container that was too *small*.

**Verification tally across statuses on my surfaces — nineteen tickets:**
```
BLOCKED                 11 fixed · 3 reproduce · 1 premise-gone      (15)
Backlog / In Progress    ALK-3109 · ALK-2972 · ALK-3521 · ALK-2931   (4, all reproduce)
```

## ALK-2978 skipped after two attempts, and a regression check on my own finding (23:05)

**ALK-2978** `Отклонённая встреча остаётся в календарной сетке до reload` — **not verified.** Both
attempts failed on setup, not on the product:
```
Week view   the target meeting is at 15:00 and sits below the grid's initially rendered hours,
            so a vis()-filtered chip probe finds nothing before the decline as well as after
Month view  [data-testid="calendar-event-chip"] matches ZERO elements — the month grid renders
            its entries with different markup
```
Stopping here per the ten-minute rule. **What the next attempt should know:** enumerate what the
month grid actually renders rather than assuming the week grid's testid, or pick a meeting inside
the week grid's visible hours, or scroll the week grid to the target hour first. Note also that the
Playwright locator `filter({hasText:…})` *does* find the chip — it does not apply a hit test — so
the two probes disagree by design, and that disagreement is the tell.

One thing the failed run did establish: **declining removes the meeting from
`GET /calendar/meetings` entirely** for that user, rather than leaving it marked declined.

### The regression check that mattered more

My attempts changed the invitee's RSVP on that meeting from `pending` to `accepted`. **Finding 2
depends on that meeting**, so I re-ran it rather than assume:
```
by URL     Yes/disabled=true  No/disabled=true      stable across 8 samples
by-id API  topKeys "meeting"  my_status absent
from grid  Yes/disabled=false No/disabled=false
```
**It holds, and the change strengthens it.** The buttons are dead by URL whether the invitee has
answered or not — so the disabled state is not "you already responded", it is the missing
`my_status`. The report's wording describes the fresh-invitation flow and stays accurate; this is an
extra data point rather than a change.

**Leftovers updated:** the invitee's RSVP on `QA-E invite body probe RESCHEDULED` is now `accepted`
(it was `pending` at the start of the pass). Finding 2 reproduces from either state, so this does
not affect it.

## ALK-3007 — FIXED (23:15)

`[FE-WEB][FILES] Scrollbar в File viewer не прокручивает содержимое` — does not reproduce. Uploaded
a 119-line text file so the content is genuinely taller than the viewer, then measured the container
rather than the scrollbar:
```
content container   DIV.scroll-custom   clientHeight 1020   scrollHeight 2623   overflow-y auto
programmatic        scrollTop 0 -> 1603 (= the maximum)      moved: true
real mouse wheel    scrollTop 0 -> 600 after wheel(0,600)    moved: true
```
Both a scripted scroll and a real wheel move the content. The positive control here is the file
itself — 7 KB across 119 lines, so `scrollHeight` exceeding `clientHeight` by 1603 px is not an
artifact of an empty viewer.

### Verification tally across all statuses — twenty verdicts on sector E's surfaces

```
FIXED (12)        ALK-1967 · ALK-2009 · ALK-1961 · ALK-2143 · ALK-2013 · ALK-2648 · ALK-2016
                  ALK-1962 · ALK-2020 · ALK-2088 · ALK-1591 · ALK-3007
REPRODUCES (7)    ALK-3069 · ALK-1966 (= my finding 6) · ALK-1972 (with a confirmed cause)
                  ALK-3109 (with the mechanism) · ALK-2972 (with the boundary)
                  ALK-3521 · ALK-2931
PREMISE GONE (1)  ALK-1965
SKIPPED (1)       ALK-2978 — setup, not product; diagnosis and next move recorded
```
Twelve of twenty no longer describe the product, across **three different statuses** — BLOCKED,
Backlog and In Progress. Five of the seven that do reproduce now carry something their ticket did
not: a confirmed cause, a mechanism, or a narrow boundary.

**Fixture note:** `tall.txt` (7 KB, 119 lines) added to lane E's files.

## ALK-3517 — reproduces (23:40)

`[BE][CALENDAR] Заблокированного пользователя можно добавить в Schedule meeting: он остаётся в
списке выбора и приглашение уходит` — **reproduces**, with the precondition asserted:
```
block         POST /messaging/users/block -> 200
              GET  /messaging/users/blocked  confirms the account is listed
member picker "QA Carol"   disabled=false   aria-disabled absent
              — the blocked account is offered normally, with no marker of any kind
after saving  GET /calendar/meetings/{id} -> attendees 1
              <carol>:pending
```
So the blocked account is selectable, is selected, and ends up an attendee with a pending
invitation. Unblocked afterwards.

**One instrumentation slip worth recording**, because it silently drops data rather than erroring:
in a Playwright response handler `r.status` is a **method**, not a property. I wrote
`{st: r.status, …}`, which serialises to nothing, so the captured POST showed no status at all and
I could not tell whether the create had even succeeded from that measurement. The verdict came from
re-reading the created meeting instead — which is the better evidence anyway, since it is the
product's state rather than my capture of a request.

**Verification tally — twenty-one verdicts:**
```
FIXED (12) · REPRODUCES (8) · PREMISE GONE (1) · SKIPPED (1)
```
Twelve of twenty-one no longer describe the product, across BLOCKED, Backlog and In Progress.

**Fixture note:** `QA-E blocked invite probe` (2026-09-24) exists with Carol as a pending attendee;
Carol is unblocked.

## ALK-3009 — reproduces, and the ticket is now missing the most useful half (00:00)

`[FE-WEB][PROFILE] Share profile из Directories не отправляет profile card` — **reproduces**: the
dialog stays open, no request is made, nothing is sent. But the current behaviour has something the
ticket does not describe, and it changes what the fix should be.

Polled at 200 ms from **before** the target was picked:
```
t=203 ms   no notices
t=801 ms   THREE notices, simultaneously:
             "Sharing a profile card is not supported yet. Nothing was sent."
             "Sharing a profile card is not supported yet. Nothing was sent."   <- duplicated
             "Could not share the profile. Try again."
t=6003 ms  only "Could not share the profile. Try again." remains
API calls made: none
```

**Three things the ticket does not say:**
1. The product now *also* says the honest thing — the feature is **deliberately unimplemented**, not
   failing. So this is not an error to fix; it is an error message to remove.
2. The two messages contradict each other and are shown **at the same moment**
   (`bothAtOnce: true`), one telling the user nothing was sent and the other inviting a retry that
   can never succeed.
3. The honest message is rendered **twice**, and the misleading one **outlives** both copies of it —
   at six seconds it is the only thing still on screen, which is the message a user is left with.

The dialog itself is fully built: `Share profile · Pick a channel or person to share this profile
with · CHANNELS … · DIRECT MESSAGES …` with a search box and every target listed. So a user is
offered a complete picker for a feature that cannot work.

**Enrichment of ALK-3009, not a finding of mine** — same call as ALK-1972, ALK-2972 and ALK-3109. I
did not discover the defect; I measured what it looks like now. If the ticket is picked up, the
useful line is that the remaining work is to remove an error path and a duplicate toast, not to make
sharing work.

**Verification tally — twenty-two verdicts:** 12 fixed · 9 reproduce · 1 premise-gone · 1 skipped.

## Report coherence check (00:10) — clean

The report's contents changed several times tonight (one finding withdrawn, one added, three
strengthened), so the whole document was checked for internal consistency rather than just for the
per-article rules:
```
13 summary rows / 13 articles, every row's [AREA][MODULE] tag matching its article's   OK
severity order non-decreasing:  High High · Medium ×7 · Low ×4                          OK
lede and footer both read "Тринадцать находок"                                          OK
stale references to the withdrawn finding or to earlier counts                          none
```
That last check is the one worth keeping as a habit: a report edited several times accumulates
counts and cross-references that were true two edits ago, and none of the per-finding validations
would catch them.

## ALK-2978 — went back and closed the skip: FIXED (00:30)

I had recorded this as skipped on setup. The blocker was one unknown, and it was worth solving
because it is sector knowledge rather than one ticket: **the month grid uses a different testid.**
```
week view   [data-testid="calendar-event-chip"]
month view  [data-testid="calendar-month-event-chip"]
other month testids: calendar-month-view · calendar-month-cell · calendar-month-weekday-header
                     calendar-month-day-number · month-day-num-YYYY-MM-DD
```
My earlier probe looked for the week testid in the month view and found zero elements, which read as
"the month grid renders no chips".

**The verdict, measured properly:**
```
before decline   18 chips visible, the target among them
POST /calendar/meetings/{id}/respond {"status":"declined"} -> 200
after, NO reload 17 chips, target gone — first observed at t=500 ms
after reload     17 chips, target still gone
```
The declined meeting leaves the grid immediately without a reload, so the ticket's claim does not
hold. Restored to `accepted` afterwards.

**Verification tally — twenty-three verdicts, no skips left:**
```
FIXED (13)        ALK-1967 · ALK-2009 · ALK-1961 · ALK-2143 · ALK-2013 · ALK-2648 · ALK-2016
                  ALK-1962 · ALK-2020 · ALK-2088 · ALK-1591 · ALK-3007 · ALK-2978
REPRODUCES (9)    ALK-3069 · ALK-1966 (= my finding 6) · ALK-1972 (cause) · ALK-3109 (mechanism)
                  ALK-2972 (boundary) · ALK-3521 · ALK-2931 · ALK-3517 · ALK-3009 (three toasts)
PREMISE GONE (1)  ALK-1965
```

### State left behind by my own failed probes — audited

A peer's note that a failed probe's leftover state silently poisons the *next* measurement is worth
checking against my own, since I had several failed setups tonight:
```
failed ALK-2978 attempts   changed the invitee's RSVP pending -> accepted
                           caught: finding 2 re-verified afterwards and still holds
failed ALK-2972 attempts   created two meetings with empty descriptions
                           caught: recorded in the leftovers inventory
month-view switches        the calendar view is a display preference — and finding 8 is precisely
                           that these do not persist, so it resets itself
```
All three were noticed and recorded rather than inherited. The RSVP one is the case that mattered:
it sat under a **published finding**, and I re-ran that finding rather than assume the change was
harmless.

## Sector E as the workspace owner — verified working (00:50)

A role I had not used all pass. Everything matches the fixture table and nothing leaks:
```
sidebar            qa-general (25 unread) · qa-private (2) · qa-empty     — qa-archived absent
GET /workspaces/{ws}/channels   3
Files              0 files (the owner has uploaded none) — correct, not an error state
Calendar           the workspace calendar, same as any member
search q=probe     16 messages, 1 file
4xx/5xx            none
```

**Directories scopes its row controls by role, correctly:**
```
owner's row on another person   Open profile · Call · Message · "Remove QA Carol from the workspace"
member's row on the same person Open profile · Call · Message
profile popup, both roles       Close profile · Message · Call · Block · Share · <shared channel>
```
So the management action appears for the owner and not for a plain member, and the profile card —
which is the same component everywhere — carries no admin action for either. That the popup is
byte-identical across roles while the row differs is the right split: the row is the management
surface, the card is a profile.

Member management itself is sector D's scope, so this is recorded as a role check on **my** screen
rather than pursued further.

**Browser restored** to the second fixture account.

## ALK-3002 — reproduces, with a control and the right instrument (01:00)

`[FE-WEB][Files] Пустой раздел Shared with me объясняет пустоту фильтром` — **reproduces.**

Measured on **visible leaves only** — strict rect, display, visibility and the opacity product up the
ancestors — rather than on `main.innerText`, because that is precisely the instrument that produced
my dead Saved Messages observation earlier tonight:
```
second workspace, "Shared with me" genuinely empty, no filter applied
  summary  "0 files · Shared with me · 0"
  visible  "No files here"
           "Nothing matches this filter yet."     <- a filter is blamed, and none is applied

first workspace, same scope, one shared file  (control)
  summary  "1 file · Shared with me · 22"
  visible  neither message appears
```
The control is what makes it a finding rather than a screenshot: the two messages appear only in the
empty state, so they are the empty state's own copy and not stray markup. And **two different empty
messages are shown at once**, one accurate and one blaming a filter — the same shape as ALK-3009's
contradictory toasts, on a different screen.

Not reported: it is an open Backlog ticket, which the prescribed dedup covers.

**Verification tally — twenty-four verdicts:** 13 fixed · 10 reproduce · 1 premise-gone.

## Driving this app — everything this pass learned, in one place (01:10)

> **This section has a continuation** — see `## Driving this app — continuation (00:20 on the 27th)`
> further down, which adds five more ways a present control reads as absent (`<aside>` containers,
> text-based filters excluding inputs and icon buttons, hit-testing rejecting below-the-fold
> controls, exact-match regexes against labels carrying counts, ancestor walks stopping above the
> controls), the shell traps (heredoc quoting, over-escaped regexes, `git log --all`, cwd drift),
> and the meeting form's two-element "All day" control. **Read both.**

Compiled for the next session. Each of these cost me a wrong measurement before it became a rule.
The calendar testids and the pointer-driven rule have already gone into `SELECTORS.md` and
`CLAUDE.md` via a peer; the rest is here.

### Finding a control

```
week-view chips     [data-testid="calendar-event-chip"]
month-view chips    [data-testid="calendar-month-event-chip"]      <- DIFFERENT testid
month structure     calendar-month-view · calendar-month-cell · calendar-month-weekday-header
                    calendar-month-day-number · month-day-num-YYYY-MM-DD
meeting form        input[data-field="event-title|event-start|event-start-time|event-end|event-end-time"]
                    — the CREATE form only. The EDIT form exposes start/end as BUTTONS that open a
                      picker; the date and time inputs exist only inside that picker.
composer            div[contenteditable="true"][aria-label="Compose message"]
search open         button[aria-label^="Search "]        bell  button[aria-label^="Notifications"]
scope chip          button[aria-label="Remove in #<channel> filter"] — an ICON button, textContent ""
directory search    input[type=search][placeholder="Search people or channels"]
                    — "Search directories" is the heading, not the placeholder
```

### Four ways a present control reads as absent

```
1  label[for] association   the label carries the text, the control carries nothing.
                            Read label.getAttribute('for') and drive getElementById(it).
                            Hit: the All-day switch and the description textarea.
2  below the dialog's fold  display:block, visibility:visible, non-zero rect — but
                            elementFromPoint hits whatever is scrolled over it, so any
                            hit-testing vis() rejects it. scrollIntoView({block:'center'}) first.
                            Hit: the reminder combobox and the description textarea.
3  wrong testid             returns zero elements, never an error. Reads as "nothing renders".
                            Hit: month-view chips.
4  row selected too small   a container with the name but not the controls. Sector D hit the
   or too large             mirror — a container spanning several rows, acting on the wrong person.
                            Use the SMALLEST element containing both the name and the control,
                            by textContent length.
```

### Two ways a control that is there does nothing

```
element.click()      dispatches only a click event. This app's dialogs, grids, notification rows
                     and radio labels are pointer-driven and ignore it. Use
                     page.mouse.move -> down -> up at the element's own coordinates.
                     Three false negatives this pass, one of which reached a report draft.
disabled vs name     enumerate controls WITH .disabled and aria-disabled. `Custom RRULE` has
                     disabled=false and aria-disabled=true plus a hover-only "Not available yet";
                     `Delete file` for a non-owner is disabled=true in both menus.
```

### Reading text

```
is it on screen?         enumerate elements + rect/display/visibility/opacity-chain/elementFromPoint.
                         innerText includes opacity-0 layers — it nearly cost sector C two findings
                         and did cost me one observation.
what does the user read? innerText, on an element already proven visible.
                         textContent misses text-transform: the group heading is "Other" in the DOM
                         and "OTHER" on screen, so a textContent search for the visible string
                         returns zero matches page-wide.
never                    a .slice() of either. Four of my nine dissolved candidates came from
                         concluding something about the part the slice cut off.
```

### Naming and instrumentation

```
name a variable for what its EXPRESSION MATCHES, not the conclusion you want.
  barGone = innerText.includes('unsaved change')   -> true when the bar is PRESENT
  offersSeries = /series/.test(text)               -> true because the copy says
                                                      "the rest of the series stays"
Playwright response handlers: r.status is a METHOD. `{st: r.status}` serialises to nothing.
```

## CORRECTION to my own archived-channel observation (real time 22:45)

Earlier in this log I wrote, of the archived channel: *"The empty-state copy and the archived banner
do coexist, which is mildly odd, but the archived notice is explicit and carries the remedy."*
**That is wrong.** Re-measured with the instrument sector C's result taught me to use:
```
"Start this channel"                              opacity 0.00   NOT visible
"Add teammates before starting the conversation"  opacity 0.00   NOT visible
"This channel is archived"                        opacity 1      visible
"Unarchive to send messages and re-enable …"      opacity 1      visible
main.innerText contains both sets                 true           <- which is why I saw a contradiction
```
The generic onboarding layer is faded to `opacity: 0` in an archived channel, exactly as it is in
Saved Messages, and the archived banner is the only visible empty-state copy. **There is no
contradictory copy here.** The app handles this correctly and my observation was a second instance
of the same `innerText` artifact, on a different screen, made before I knew to distrust the
instrument.

Nothing downstream is affected — it was recorded as an observation, never reported, and it was the
reason I did *not* report the archived channel. Correcting it here so a later session does not
inherit a false note.

**And it retires a pattern I had started to believe.** I had begun collecting "the product says two
incompatible things at once" as a theme: ALK-3009's three toasts, ALK-3002's two empty-state
messages, and this. The third is not real, so the pattern is **two instances, both measured on
visible elements**, not three. Worth stating plainly because a pattern with a bad member invites the
reader to discount the good ones.

### Note on the times in this log's later headings

The clock times in headings from roughly "22:45" onward drifted badly — several read 00:00–01:20
while the real local time was 22:05–22:45. I wrote them from an estimate between `date` calls rather
than from the system. **Anywhere a time is load-bearing** — reminder offsets, notification
`created_at`, the RSVP round trip, the poller timelines — **the value is inside the measurement
block and came from the system**, not from a heading. Headings should be read as ordering only.

## Regression guards in my own Проверка sections — verified true today (real time 22:55)

A «Проверка» line that says "X must not break" is only useful if X works **now**. A guard that is
already false is worse than no guard: a developer runs it, sees a failure they did not cause, and
either chases it or stops trusting the list. So I ran mine.

**Finding 7's guard** — *"the composer's own shortcuts (insert link and formatting) are not broken
and are still available from its panel"*:
```
toolbar controls present: Bold · Italic · Strikethrough · Insert link · Insert list
                          · Insert code · Insert quote · Insert code block      (8)
clicking "Insert link" in the toolbar -> dialog "Insert link  Cancel  Insert"
```
True today. Which is what makes it a real guard: finding 7 asks for `Cmd+K` to stop opening this
dialog inside a channel, and the guard says the toolbar route must survive that change.

**Finding 2's guard** — *"the response set from the calendar grid still works: `aria-pressed`
toggles and survives a reload"*:
```
opened from the grid   Yes/pressed=true  No/pressed=false
click No               POST /calendar/meetings/{id}/respond {"status":"declined"} -> 200
                       Yes/pressed=false No/pressed=true          <- toggles correctly
restored to accepted   Yes/pressed=true  No/pressed=false
full reload, re-open   Yes/pressed=true  No/pressed=false          <- survives
API                    my_status "accepted"
```
True today, in both directions.

**One refinement the run exposed**, worth knowing before someone follows the guard: after a
**decline** the meeting leaves the calendar grid immediately (that is ALK-2978, which I verified as
fixed), so you cannot re-open it from the grid to check persistence. The guard is testable with
`Yes`, which is what a person would naturally use, so the line stands as written — but a developer
who tries it with `No` will find the chip gone and may read that as a second bug.

**Fixture restored:** the invitee's RSVP on that meeting is `accepted`, confirmed from the API.

## Finding 13's guard — verified, and it sharpens the finding (real time 22:50)

The guard is *"a file that genuinely has not been shared still honestly shows an empty section — for
its owner"*. Tested on an own file with `shared_with: []`:
```
own, never-shared file, owner's own details panel
  section       "SHARED WITH  Not shared with anyone yet.  Share with more"
  visible lines "Uploaded by" · "Not shared with anyone yet."   (both pass the strict visibility check)
```
True today.

**And it sharpens what finding 13 actually claims.** The string is not wrong in itself — it is
correct here, and visible. The defect is that the *same* string is shown to a **recipient looking at
a file that demonstrably is shared**, because their copy of `shared_with` arrives empty. So the fix
is not to change the copy; it is to stop showing the empty state in a state that is not empty. My
finding's «Ожидаемый результат» already offers both options, and this confirms which one is the real
choice.

### All regression guards in my report now verified true today

```
finding 1   :in #channel still narrows the search                         verified
finding 2   RSVP from the grid toggles aria-pressed and survives reload   verified, both directions
finding 3   the guest and the channel-less member render like anyone else verified
finding 5   :in #channel and two filters together still work              verified
finding 7   the composer's own formatting and Insert link still work      verified, 8 controls
finding 8   a valid token still opens the waiting screen with Leave       verified
finding 9   search by name still works                                    verified
finding 11  "End time must be after start" still fires                    verified
finding 12  Display settings still persist across reloads                 verified
finding 13  an unshared file honestly shows the empty section             verified
```
Findings 4, 6 and 10 have guards that describe post-fix behaviour only, so there is nothing to
confirm today.

**Why this was worth the time:** a guard that is already false makes a developer chase a failure they
did not cause, or stop trusting the list. Ten of thirteen findings carry at least one "must not
break" line, and every one of those lines is currently true — so a failure after a fix means the fix.

## Render check re-run on the final report, and a preamble addition (real time 22:52)

The report gained a finding and lost one since the earlier render check, so it was re-measured in
full rather than assumed:
```
                        page scrolls X   overflowing els   articles   <pre> auto-X / scrolling
system light            false            none              13         13 / 10
system dark             false            none              13         13 / 10
1280 x 800              false            none              13         13 / 10
data-theme=light on a dark OS   body bg rgb(246,248,247)
data-theme=dark on a light OS   body bg rgb(14,20,19)
fonts: loaded
```
All four theme states resolve, wide measurement blocks scroll inside their own containers, and the
page body never scrolls sideways at either width. Temp directory deleted.

**One line added to the preamble**, on a peer's suggestion, because it changes how the Проверка
sections should be read:

> Строки вида «не сломалось» в разделах **Проверка** прогнаны на этой же сборке и сейчас
> выполняются: если после исправления какая-то из них перестанет проходить, дело в исправлении.

That is a factual claim I can make because I ran them, and it is worth stating: a developer who
knows the guards were executed treats a failing one as evidence about their change rather than as
noise. Republished.

## Do the repro steps produce everything the measurement shows? (real time 22:55)

A second pass over the report in the same spirit as the guard check, asking a different question of
each finding: **would following only the «Как воспроизвести» steps put a developer in the state the
«Фактический результат» block describes?**

**One gap, in finding 3.** Its measurement and its Проверка both cover two signals — presence *and*
the status a person sets themselves — but the steps only produced the presence half. A developer
following them would see the missing presence dot and never reach the status case at all. Confirmed
concretely: with the fixture's status cleared,
```
members 7 · withPresence 7 · withCustomStatus 0 · status nodes in rows 0
```
`withCustomStatus: 0` is exactly the state a reader would arrive in. Added a step —
*«Одному из них поставить себе статус: Profile → Vacation»* — so both halves are reachable from the
steps alone. Republished.

**The other twelve are complete.** Each creates every precondition its measurement depends on: a
message in a second channel (1), a meeting with an invitee (2), a recurring series (4), the typed
filter (5), two meetings with different reminders (6), the three shortcuts (7), an invalid token
(8), Department and Job title filled in (9), a collapsed sidebar plus List view and a sort (10), a
start-date change alone (11), Dark + Compact + XL before `Reset all` (12), and one user sharing a
file for another to open (13).

**Why this is a different check from the guard one.** The guards assert something about code the
finding is *not* reporting on. This asks whether the finding's own evidence is reachable by the path
it gives. Both are ways a finding can be correct and still fail the person who receives it — one
wastes their time on a false failure, the other quietly shows them less than the report claims.
Finding 3 would have looked like an overstated report rather than an incomplete recipe.

## Correction: the repro-completeness check may not be new, and I cannot prove it either way (23:05)

I recorded the two report checks as things "this repo has not done before". A peer says the
repro-completeness half **already existed** in `CLAUDE.md`, with a worked example naming
`custom_status` — the same field my finding 3 gap was about. I tried to verify that and **could not
settle it**, which is itself the useful part:
```
git show HEAD:CLAUDE.md | grep -c 'must be produced by the steps above it'  -> 0
git show HEAD:CLAUDE.md | grep -c 'custom_status.text'                      -> 0
git diff --stat HEAD -- CLAUDE.md                                           -> +197 / -28 uncommitted
CHANGES-APPLIED.md — no entry recording that rule
```
Absent from the last commit. **But git cannot answer the question**, because HEAD predates the whole
reporting section — a rule I am certain I read at session start is also missing from it:
```
git show HEAD:CLAUDE.md | grep -c 'a developer reads it, not a jury'         -> 0
```
So "absent from HEAD" says nothing about "absent at 14:40". The 197 added lines mix rules that
predate my run with rules added during it, and nothing timestamps them.

**My honest position:** I do not believe that rule was in the copy I received, but that is
recollection and I cannot grep my own context, so it is weak evidence offered as weak evidence. The
only person who can settle it is whoever wrote the paragraph.

**Why I raised it rather than accepting the flattering version.** The peer is putting a strong claim
to the user — that a prose rule failed to fire at the moment of need, contrasted with a guardrail
that lives inside a tool. If the rule was added *during* my run, my case is not an instance of
documentation failing; it is two sessions deriving the same rule the same evening, which argues the
opposite. **The claim that makes me look better is the one that needed checking hardest**, and the
premise underneath it — "it was in the file you read" — is exactly the kind of thing this whole pass
has been about not assuming.

**Unaffected either way:** the guard check is separate and, as far as I can tell, not previously
written down; and finding 3's gap was real and is fixed regardless of who had documented the rule.

## Four findings re-verified from a second account (23:00)

Ruling out anything account-specific, since every measurement so far came from one account:
```
F1  dialog total_messages 1 -> full-search page 0                          holds
F9  7 members · no department field · single heading "OTHER 7"             holds
F7  Cmd+K in a channel -> activeElement INPUT[Insert link], no Global search  holds
F13 5 accessible files, shared_with empty on ALL five                      holds
```
F13 is the strongest of the four here: five files, one of them demonstrably posted into a channel,
and the recipient's copy of `shared_with` empty on every one.


## Re-verification sweep 2 — 22:58 +05 (findings 5, 10, 11)

Build still `v0-61-0-rc-5-c4b5386b4a3a`. Fresh page loads for each, from alice.

**F5 — `:@ <person>` filter does nothing.** Holds. Typed `:@ QA Bob probe` into full search; the
outbound request is

```
search?q=Bob+probe&company_id=<CO>&workspace_id=<WS>&limit=25
```

The `:@` token and the token that follows it are stripped from `q` and nothing takes their place —
no `author`, `user_id`, `sender` or `from` parameter appears. So the filter is removed from the
query text without ever being applied. (Note the residue: "QA" is eaten along with `:@`, so the
remaining `q` is `Bob probe`, not `QA Bob probe` — the client consumed one word as the operand
and dropped the rest of the name into free text.)

**F11 — start-date change leaves summary and end date behind.** Holds.

```
event-start: 2026-10-20      (set)
event-end:   2026-08-26      (unchanged — now ~2 months before the start)
summary:     "Wed, Aug 26 · 11:00 PM – 11:30 PM · 30 min"
```

The summary line still describes the original day and the end date is left in the past relative to
the new start. Reproduced from a fresh New meeting dialog.

**F10 — Files list/grid view not persisted.** Holds, and the measurement is now on the controls'
own `aria-pressed` rather than on appearance:

```
before click:  Grid view/true   List view/false
after click:   Grid view/false  List view/true     <- the click did land
after leaving /files and coming back:
               Grid view/true   List view/false     <- reverted
```

The middle line matters: it rules out the "the click never registered" reading that has produced
false findings twice tonight. The control does flip; the choice is simply not kept.

## Re-verification sweep 3 — 23:20 +05 (findings 6, 4) — second full pass complete

### Three driving mistakes of my own, caught before they became results

All three produced a *plausible* empty result that would have read as product behaviour:

1. **Filtered a below-the-fold control out of existence.** Looking for the `Reminder` control in the
   New meeting dialog with a `vis()` filter returned nothing. Dumping every interactive element in
   the dialog without the filter found it immediately at `y=1803`, `vis:0` — present, correct, just
   below the fold of a scrolling dialog. `scrollIntoViewIfNeeded()` then a real mouse click works.
2. **Exact-match regex on a submit button.** `/^(Create|Save|Schedule)$/` matched nothing because
   the button is `Schedule meeting`. No POST fired, and the run reported "no reminder field on the
   wire" — technically true, and completely meaningless, because nothing was sent at all.
3. **`hasText` cannot match an icon button.** `Edit` on the occurrence card is
   `button[aria-label="Edit"]` with an empty text node, so `filter({hasText:/^Edit$/})` timed out.

The first two combined into a run that returned `F6_holds: true` while proving nothing. This is the
same shape as the pointer-driven-control problem, and the same defence applies: **read the control's
own state and confirm the action landed before believing an absence.**

A fourth, smaller one: my check variable `wireHasReminder` came back `true` — the regex `/remind/i`
was matching the word "reminder" inside the meeting *title* I had typed. Same class as the `barGone`
error earlier tonight: the variable was named for what I wanted it to mean, not for what its
expression actually matches. Parsing the body and listing its keys is the version that cannot lie.

### F6 — reminder choice never sent. Holds, with a stronger measurement.

```
control read-back:   before "No reminder"  ->  after "10 minutes before"
options offered:     No reminder | 5 minutes before | 10 minutes before |
                     15 minutes before | 30 minutes before | 1 hour before

POST /api/v1/calendar/meetings, body keys:
  workspace_id, title, starts_at, ends_at, timezone, meeting_url, location,
  attendee_user_ids, guest_invites, requires_approval, is_private,
  mute_on_join, who_can_open_rooms, max_rooms
  keys matching remind|notify|alert|before: []
```

The read-back is what makes this solid: the control accepted the choice and displays it, so the
"click never registered" reading is ruled out. The report's hedge «при видимо выбранном» is now
replaced by that before/after pair.

### F4 — recurring edit changes one occurrence silently. Holds, both halves.

Scope language in the Edit dialog — every probe false:

```
series: no | occurrence: no | repeat: no | following: no
"this event": no | "all events": no | "only this": no
every interactive element in the dialog:
  Close | Add title | Date and time | End date and time | All day |
  15 min | 30 min | 45 min | 1 hr | 1.5 hr | 2 hr | Aloqa Meet |
  Public | Private | Wait for admission | Password
```

Effect of the save, with the series listed in full rather than filtered:

```
PATCH /api/v1/calendar/meetings/<occurrenceId>  {"title":"<new>"}  -> 200

2026-08-26T18:00  <old>
2026-08-27T18:00  <new>     <- only this one
2026-08-28T18:00  <old>
2026-08-29 .. 2026-09-06    <old>   (9 more)
```

**One more of my own errors worth recording**, because it nearly became the write-up: my first
listing filtered on the *old* title prefix, so the renamed occurrence vanished from the results and
the series appeared to have a hole in it. Absence in a list I filtered myself is not evidence.
Re-listing on `/^E2 series/` shows the renamed row sitting in place at 2026-08-27 — which is both
the correct measurement and a better one, since it shows the change in situ instead of as a gap.
The report block now carries this version.

**Second full re-verification pass is complete.** All thirteen findings have now been re-checked
after 21:00, four of them additionally from a second account.

## Extra coverage 23:00–23:40 +05 — cross-surface consistency, and a candidate killed by polling

### Verified working (add to the coverage index)

**Files ↔ Search agree on every object.** All 11 files in the workspace, matched by `filename`:
every one is returned by `/search` under its own name. The one miss is a 200-character filename,
where the query itself is 200 characters — a limit of my probe, not a disagreement between surfaces.

**Storage figure agrees with the API exactly.**

```
API   total 11 files, total_bytes 8014
screen "Storage <1%  7.8 KB of 10 GB used"   (8014 B = 7.83 KB)
per-type counts: All 11 = Images 2 + Documents 9
```

**Search result click-through works for every type**, and the routes are right:

```
message result -> /w/<ws>/c/<channelId>?m=<messageId>   dialog closes, channel loads
file in a channel   -> /w/<ws>/c/<channelId>            dialog closes, channel loads
file not in a channel -> file viewer opens in place, within 300 ms
```

**`Shared with me`** calls `scope=accessible` and returns 200. (`scope=shared` is a 400, but no
screen sends it, so it is out of scope — an unused parameter value, not a defect a user can reach.)

**Recent searches do not exist.** The search dialog's empty state offers scope chips, type tabs and
`Open full search`, and no recents list appears after three searches, before or after a reload.
`SECTORS.md` lists "recent searches" in the sector's scope, but that is an allocation of *territory*,
not a claim the feature ships — nothing in the UI promises it. Unimplemented, not a defect.

### Candidate killed: "file search result does nothing when the file is in no channel"

This one got all the way to a coherent write-up before dying, and the way it died is worth recording.

The search result row for a file carries the text `Open channel with file`. Files uploaded through
the Files screen have **no `channel_id`** in the search response, while files posted in a channel do:

```
bob-shared.txt  {"id":"…","name":"bob-shared.txt","channel_id":"C…","is_dm":false,…}
viewer.png      {"id":"…","name":"viewer.png","uploader_id":"…","is_dm":false,…}   <- no channel_id key
```

Clicking the row for a file *with* `channel_id` navigates to that channel. Clicking one *without* it
produced: no navigation, dialog still open, and for two of three files not even a network request.
That is the shape of a dead control, and I had the A/B, the positive control and the pointer proof.

**What killed it: polling the screen from before the click.** The click is not dead at all — it
opens the **file viewer**, in place, within 300 ms:

```
pre    dialog: "Global search  Search across channels, direct messages, peo…"
+300ms dialog: "viewer.png  PNG  viewer.png  Image · 910 B"
+300ms dialog: "normal.txt  TXT  normal.txt  Document · 13 B  hello lane E"
```

Two of my own checks conspired to hide this:

- `dialogStillOpen` counted *any* dialog wider than 300 px. The viewer **is** a dialog, so the
  search dialog closing and the viewer opening read as "nothing happened".
- `navigated` was false, and correctly so — opening a viewer is not navigation. I was measuring for
  the wrong outcome and treating its absence as evidence of no outcome.

So the behaviour is right: file in a channel opens the channel, file in no channel opens the viewer.

**What is left is not worth filing.** The phrase `Open channel with file` is wrong for the second
case, but it is not visible to anyone:

```
carrier: SPAN.sr-only  1×1  position:absolute  overflow:hidden
innerText:    "Open channel with file viewer.png QA Alice · Aug 26, 2026"
textContent:  "Open channel with fileviewer.pngQA Alice · Aug 26, 2026"
```

A screen-reader-only label, mismatched for one of two cases. That is cosmetic-tier, and this project
trims that at triage. **Note the irony worth carrying forward**: the reason the row looked mislabelled
at all is that I read it with `innerText`, which includes `sr-only` content — the exact trap already
recorded in this log once tonight. It cost me a candidate in both directions: first inventing a
defect, then hiding a real behaviour.

**Two rules earned their keep here, both already written down:** poll the other side from before the
trigger, and prove the action landed before believing an absence. Had I only checked "did the URL
change", this would have gone in the report.

## 23:40–00:10 +05 — unread badges, and notifications are destroyed on read

### Unread badges: the COUNT is exact — but see the correction below, this is not "working"

Bob sent nine messages to the shared channel while alice sat on `/calendar`. Every count agreed:

```
sidebar          "qa-general 9"          <- exactly the nine bob sent
after alice opens the channel:
  unread_counts  {"channel_id":"<general>","unread_count":0,
                  "last_message_seq":34,"last_read_seq":34}
  sidebar        "qa-general"            <- count gone

bell aria-label  "Notifications, 28 unread"
GET /notifications?limit=100   -> 28 items, 28 unread
```

The rail badge and the API agree exactly, and the sidebar count matches the messages sent. Note for
a later session: the rail's flattened text reads `… Calendar Files 28 QA …`, which looks like a
badge on **Files**. It is not — it is the notification bell, which simply follows Files in the rail.
`aria-label` settles it in one read; the flattened text cannot.

> **CORRECTION, written 03:20 after re-reading my own log.** Calling this "verified working" was
> wrong, and I nearly left it in the coverage index where it would have misled the next session.
> **Every reading above was taken on a freshly loaded page.** The 17:41 section of this log records
> a much tighter measurement of the same thing: with a 300 ms poll running for 100 s from before the
> send, the sidebar row **never changes** — it only shows the count after a reload. That is the
> morning pass's BUG-5, still open, and it is not contradicted by anything I measured tonight.
>
> What tonight actually establishes is narrower and still worth having: **when the badge does
> render, its value is correct** — 9 for nine messages, cleared to none once the channel is opened,
> and the bell matches the API's unread count exactly. That rules out a counting error sitting
> behind the staleness, which the earlier measurement did not address.
>
> My live poll tonight returned `rows: []` for all 120 frames, which *looks* like confirmation that
> the badge never updates. It is not evidence: the selector was broken (the channel name and its
> count are separate child nodes). A broken selector and a stale badge produce the same empty
> result, and only the 17:41 measurement distinguishes them.

**Two of my own selectors failed silently here** and both would have produced a false finding:
`rows: []` across 120 polling frames (the channel name and its count are separate child nodes, so
my own-text filter matched neither), and a `/dev/tcp` port probe that reported both lane browsers
down while they were demonstrably serving CDP. Neither absence meant what it looked like.

### Measured: reading a notification deletes it permanently

Clicking a single notification, with the pointer confirmed on the row
(`elementFromPoint` → `"badge-probe-3 …"`):

```
before   GET /notifications  -> total 28, unread 28
click one row
after    GET /notifications  -> total 27, unread 27
```

**`total` dropped, not just `unread`.** The row leaves the store; it is not flagged. And `unread`
tracks `total` exactly at every step, which is what you would expect if a read notification cannot
exist.

`Mark all as read` does the same at scale, and it is irreversible:

```
before        total 27, unread 27      bell "Notifications, 27 unread"
POST /api/v1/notifications/read   -> 200
after         total 0,  unread 0       bell "Notifications"
panel         "Notifications  Mark all as read  All caught up  No notifications yet."
after reload  total 0,  unread 0       <- nothing comes back
```

The panel carries exactly one control (`Mark all as read`) — no All/Unread tabs, no history view.
This matches the backend read from earlier tonight: `MarkAsRead` is a `DELETE … RETURNING id`,
commented *"удаляет прочитанные уведомления безвозвратно (историю не храним…)"*.

### Decision: measured, logged, NOT added to the report

Three things are true and pull different ways, so the reasoning is worth recording rather than just
the verdict:

- The control says it changes a **state** and instead **destroys the data**, with no undo. That is a
  real label/behaviour mismatch.
- The empty state says *"No notifications yet."* — "yet" claims none have ever arrived, moments
  after twenty-seven were deleted.
- But the underlying behaviour is **deliberate and documented in the backend**, and plenty of
  products drop read notifications. Without a history view the app never promises otherwise.

So the defensible core is copy-tier, and this project trims copy-tier at triage. Filing it risks a
"works as intended" bounce that would cost credibility on the thirteen findings that are not
borderline. **Left out of the report on purpose, not by oversight.**

### Worth surfacing to the user: ALK-3024 describes this mechanism wrongly

`ALK-3024` (Backlog, P4) says of clicking an unreachable notification: *«Нажатие выполняет только
mark-as-read»*, and its **Подтверждённая причина** builds on `handleNotificationClick` marking the
notification read. My measurement says the click **deletes** it. Someone fixing ALK-3024 on the
assumption that a read flag exists — for instance by rendering read-but-inaccessible rows
differently — will find there is no such state to render.

That is a comment on someone else's ticket, not a finding of mine, so it goes here and into the
closing summary. **Nothing filed** — filing stays the user's decision.

## 00:10–00:35 +05 — the recurrence/date-range inconclusive stays inconclusive; a High-grade candidate killed by dedup

### The search date-range inconclusive cannot be settled on this lane. Confirmed, not assumed.

The 21:15 note says it needs content older than seven days. Measured the whole workspace:

```
messages   newest .. oldest   0.1 days
files                         0.5 days
channels   qa-general, qa-private   1.1 days   (created 2026-08-25)
workspace members  — the members endpoint exposes no created_at at all
```

Nothing in this lane is older than 1.1 days, so `Last 7 days` and `All time` are *required* to return
the same set whether the filter works or not. The earlier note called this correctly and I could not
improve on it. **It stays inconclusive**, and the way to settle it is still the one already written
down: a lane seeded more than a week ago, not a backdated row.

### Candidate: global search never returns people or channels — REAL, and a duplicate of ALK-3538

This is the strongest thing I found after the report was finished, and it is already filed.

What I measured, from `/calendar` so nothing was channel-scoped:

```
UI, query "Alice" (a workspace member, name exactly as Directories shows it):
  tabs   All 1 | Messages 1 | Channels 0 | People 0 | Files 0
  People tab selected -> aria-selected "true", 0 rows,
                         "No results for “Alice”. Try other words or …"

UI, query "qa"  (two channels are named qa-general and qa-private,
                 and every member's display name begins "QA"):
  tabs   All 5 | Messages 4 | Channels 0 | People 0 | Files 1

server, every query tried — including exact names:
  q=qa-general / general / qa / qa-priv / private / Alice / QA Alice / alice
    -> 200,  total_users 0,  total_channels 0   in every single case
  types=channel | channels | user | users
    -> 200,  total_users 0,  total_channels 0   as well
```

The backend boundary is proved by the measurement alone: the response arrives with the totals at
zero, so nothing in the client dropped them.

**`ALK-3538 [BE][SEARCH] Глобальный поиск не находит людей и каналы` — Backlog, open.** Same defect,
same shape of evidence, including the same control that the message index is alive. **Not reported.**

Two things worth carrying forward from how this went:

1. **The dedup step is what caught it, and only because it ran before the write-up.** This was
   heading for a High. Had I written it first and deduped second, the cost would have been the whole
   write-up plus the risk of it slipping through.
2. **My coverage index said the type tabs were verified**, and they were — I had checked that the
   tabs switch buckets without issuing a redundant request. I never checked that the People or
   Channels bucket is capable of being non-empty. *Verifying that a control works is not the same as
   verifying that what it controls works*, and my own index read as though it were. I have left the
   index line as it was but this note is the correction to it.

Also confirmed here: my earlier `tabFound: 0` was an over-escaped regex of mine
(`'^'+tab+'\\\\d*$'` in a quoted heredoc becomes `^People\\d*$`, matching a literal backslash), not
a missing tab. Third selector self-inflicted false negative tonight.

## 00:35–01:05 +05 — four more open tickets verified on today's build (running total 28)

Build `v0-61-0-rc-5-c4b5386b4a3a`. Same method as the 24-ticket pass: reproduce the ticket's own
steps, and where it does not reproduce, search the **deployed commit's** history for a fix.

### ALK-3522 [FE-WEB][SETTINGS][PROFILE] false «1 unsaved change» — DOES NOT REPRODUCE

The ticket's steps are Settings → Profile, which is `/w/<ws>/settings/profile` — **a route that is
not in CLAUDE.md's route list** (nor is `/settings/calls`). My first attempt tested
`/settings/account` and would have produced a wrong answer; the settings nav names the real route.

```
route confirmed /w/<ws>/settings/profile, screen confirmed rendered (4 inputs, profile fields)
polled 300 ms × 50 = 15.2 s from navigation, twice: first open, and again after a reload
  badge text matching /\d+ unsaved change/    : never
  visible nodes containing "unsaved change"   : 0
  ANY node containing it, visible or not      : 0
```

The phrase is not in the DOM at all, so this is not a visibility question. The ticket says the badge
"может появляться после reload" — covered, that was the second pass.

### ALK-2834 [FE-WEB][CALENDAR] calendar notification does not open the event — DOES NOT REPRODUCE

Bob invited alice to a meeting; alice clicked the resulting notification with the pointer confirmed
on the row (`elementFromPoint` → `You've been invited to "…"`):

```
pre     /w/<ws>/files            panel: "Notifications  Mark all as read  …"
+300ms  /w/<ws>/calendar/<meetingId>
        dialog: "<title>  Thursday, August 27, 02:34–03:04  30 min  Scheduled by …"
```

It navigates to the event's own URL and opens its card, inside 300 ms — precisely what the ticket
says does not happen.

### ALK-2522 [FE-WEB][CALENDAR] Day view participant count — REPRODUCES

```
Day view header:  "… meetings 16 | h 6.5 | participants 0"
GET /calendar/meetings?from=<today>&to=<tomorrow>  -> 16 items
  each item:  attendees: undefined     participant_count: 0
```

Sixteen meetings and a correct duration, participants stuck at 0. Consistent with the ticket's own
root cause: the list response carries no attendee data for the day header to count.

### ALK-2850 [FE-WEB][FILES] Storage Usage block — REPRODUCES (but it is a feature request)

```
"Storage <1%  7.8 KB of 10 GB used"
progress bars visible: 1     segment elements: 0     "Storage Usage" heading: absent
```

Still the compact single-bar card. Worth flagging for whoever triages: the description asks to
**replace** the block with a designed one "согласно приложенному reference image" — that is a design
task filed as a Bug, not a defect. Verifying it can only ever confirm that unbuilt UI is unbuilt.

### The pattern across all four

**None of the four has a commit referencing it in the deployed build's history**, yet two of them no
longer reproduce. So a ticket id in a commit message is not a reliable signal of whether something
is fixed here, in either direction — absence of a commit does not mean the bug is live.

**A method note that cost me a wrong answer and nearly a second one.** The clone is
`33 behind` the deployed commit, so `git log --all --grep=…` searches a tree that **does not
contain the deployed build**. It returned empty for all seven tickets I tried, which reads exactly
like "no fix exists". Searching from the deployed sha instead — `git log <deployedSha> --grep=…` —
walks the 3317 commits that are actually deployed. I confirmed the mechanism works by checking it
still finds other ALK ids from that sha before trusting any of its empty results. This is the same
family as the citation-provenance problem: **the branch a clone sits on silently changes what a
search can see, while a sha-addressed read is unaffected.**

## Deliberately NOT verified: ALK-3426 / ALK-3117 / ALK-2784 (profile save)

All three need a profile save, and the server enforces a **weekly** limit on it:

```
429  {"code":429,"key":"AUTH_PROFILE_UPDATE_TOO_SOON",
      "message":"профиль можно обновлять раз в неделю (осталось 7 дн.)"}
```

(quoted from ALK-3117, not measured by me). Saving once therefore locks that account's profile for
a week, and the cost lands on other people:

- Lane fixtures are documented as identical across lanes — same display names, so the same
  selectors work anywhere. A changed name on this lane breaks that invariant for seven days, and
  the session that trips over it will be debugging a selector, not a product defect.
- Worse for my own work: **finding 9 is about department and position**. Setting either field on a
  fixture account changes the state that finding's repro steps assume, and a future verifier could
  reasonably conclude the finding is a false positive when what actually changed was the fixture.

Testing an account outside the workspace (`outsider`) avoids the fixture damage but not the lock,
and that account cannot reach the workspace settings screen anyway.

**Weighed against what verification would buy:** ALK-2784 is already `In Progress`, ALK-3117 is
mostly a request to check a key mapping, and ALK-3426 is a 2–3 second flicker. Not worth a
week-long lock on shared fixtures plus a risk to one of my own published findings.

**Skipped on purpose. How to do it safely later:** seed a throwaway account for the profile-limit
tickets specifically, and verify all three against it in one save — the first save is free, and the
429 path all three describe is reachable only on the second, so one disposable account settles all
three at once.

## 01:05–01:30 +05 — ALK-3532 and ALK-3533 both REPRODUCE (running total 30)

Blocking is explicitly fair game on fixtures, and `POST /messaging/users/unblock` gives a reliable
way back, so this was safe to test. **Fixture state was restored at the end of every run** —
verified, not assumed (`blocked total` back to 0 each time).

### Positive control first

Before touching anything, with bob **not** blocked:

```
card buttons:  Close profile | Message | Call | Block | Share | qa-general | qa-private
"cannot be blocked" message:  absent
Unblock button:               absent
```

`Block` is enabled here. That matters: it means the disabled state below is **caused by the block**,
not a pre-existing property of the card. Without this control, "Block is disabled" would be
compatible with "Block is always disabled", and the finding would not stand up.

### ALK-3533 — blocking is silent. Reproduces.

Seventeen snapshots at 300 ms, starting **before** the click. Notifications selected by real
visibility (display, visibility, and the opacity product up the ancestor chain), not by role:

```
dialog count per frame:  1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0
                         ^pre: card open
                           ^+300 ms: card gone, and nothing replaces it
toasts across all 17 frames:  none
max dialogs at any frame:     1   (so no confirmation dialog ever appeared)
```

The card closes and the screen says nothing. The block itself did happen — `blocked total: 1`
immediately after.

### ALK-3532 — card claims the person cannot be blocked, offers no Unblock. Reproduces.

Same card, reopened after the block:

```
card buttons:  Close profile | Message | Call | Block[disabled] | Share | qa-general | qa-private
message:       "This user cannot be blocked until their workspace membership is verified."
Unblock:       absent
```

The claim is self-contradicting on its own card: it says membership is unverified while listing
**two shared channels** with that same person, and the block it says is impossible has already
succeeded. Confirmed both on re-open without a reload and after a full reload (the earlier run
covered the reload case; this one covers the same-session case with the control attached).

### Not written up

Both are already open in ALK with accurate descriptions and correct measurements — nothing to add
beyond confirming they are still live on `v0-61-0-rc-5-c4b5386b4a3a`. Recording the confirmation is
the useful output here, not a new finding.

## 01:30–01:50 +05 — Sessions screen: new coverage, and ALK-3005 confirmed (running total 31)

`/w/<ws>/settings/sessions` was untested by this pass. **Note the route list in CLAUDE.md is
incomplete** — it has neither `settings/profile` nor `settings/calls`, and the settings nav actually
offers `Account · Profile · Notifications · Appearance · Calls and audio · Privacy & security ·
Sessions · Security · About · Company · Workspace · Roles · Company dashboard · Members`. Read the
nav, not the doc.

### ALK-3005 — every session named "Unknown device" — REPRODUCES

```
screen: "Active sessions  Every device signed in to this account, and how to sign one out.
         Unknown device
         Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko)
         Chrome/151.0.0.0 Safari/537.36 · <ip> · 27 minutes ago · Current session"

GET /api/v1/security/sessions -> 200
  fields: id, user_agent, ip_address, expires_at, last_used_at, created_at, is_current, device_id
  any field matching /device_name|platform|browser|os/ : none
```

The field list independently confirms the ticket's stated cause — the backend sends no
`device_label`, `platform`, `os_label` or `browser_label`, so the card falls back to its unknown
label. Nothing to add to the ticket; it is thorough and correct.

### What I could NOT establish, and why it is not in the log as a finding

The section's own description promises **"…and how to sign one out"**, and I found **no sign-out
control on the page**. That is *not* a finding, because this account has exactly one session and it
is the current one — an app that offers no "sign out" on your own current session in a list is
behaving reasonably, and the control may well appear only for other sessions.

**I tried to create a second session and stopped when I hit a security control.** A login from the
shell with a realistic iPhone user-agent returns:

```
POST /api/v1/auth/login  ->  403
{"error":{"code":"forbidden_origin","message":"cross-origin request rejected"}}
```

That is an origin check working correctly, not a defect. Defeating it by forging an `Origin` header
would have manufactured a session state no user can reach, to test a screen — the wrong trade, so I
left it. **How to do this properly:** sign the same fixture account into a second lane browser, which
produces a real second session through the real login path, and then the sign-out control and the
multi-row rendering can both be tested honestly.

### Sessions screen — verified working

- Route loads, `GET security/sessions` 200, current session marked `Current session` / `is_current: true`
- `last_used_at` renders as a relative time that matched the actual session age
- Settings nav renders all fourteen sections and each is reachable

## 01:50–02:20 +05 — Privacy & security screen: fully covered, no findings

New coverage. The page is **honest about what it has not built**, which is the opposite of the
pattern findings 5 and 6 describe, and worth recording as a contrast:

```
Visibility        "Choose who can see information about you.
                   These preferences are saved, but they do not change what others can see yet."
                  -> Profile visibility / Online status / Last seen, each a combobox on
                     "Workspace members", plus switches for Read receipts and Show online status

Messaging & inv.  "Messaging restrictions unavailable — You need privacy management and company
                   role access to change these restrictions."

Data export       "This feature is not available yet."   Request export  [disabled]

Encryption        "Content is encrypted in transit. Aloqa can access it on its servers."
                  Messages / Files / Calls: in transit
```

`Request export` is **disabled**, so the copy and the control agree. `GET /users/me/presence-settings`
returns `{"hide_presence": false}` — a single boolean behind the presence controls.

### Verified working: the blocked-users flow, including ALK-3532's stated workaround

ALK-3532 asserts that a blocked person can only be unblocked here, not from their profile card.
**That claim is true and the path works on this build:**

```
blocked bob (API)  ->  blocked total 1
Settings -> Privacy & security -> Blocked users:
   BUTTON "Unblock"   aria-label "Unblock QA Bob"   enabled, visible
click it ->
   "You have not blocked anyone."   Block [disabled]
   blocked total 0
```

Worth adding to ALK-3532 if anyone comments on it: the escape hatch it names genuinely works, which
bounds the severity — a user is inconvenienced, not stuck. Fixture state ended clean at
`blocked total: 0` without needing the forced-restore fallback I had built in.

Also confirmed here: the participant picker is `INPUT[role=combobox]`, placeholder
`"Search by name or username"`, `aria-label "Search workspace participants"`, with `Block` disabled
until a person is chosen — correct behaviour.

### Two of my own filters hid that picker, in two different ways

Worth writing down because they are the same mistake wearing different clothes:

1. **Filtered on non-empty `innerText`.** An `<input>` has none, so the picker vanished from a
   control count that otherwise looked complete (`nCtl: 7`, all of them buttons and switches).
2. **Walked up to a "section container" and enumerated inside it.** The walk stopped at a node whose
   text was just the heading and description, giving `n: 0` controls in the Blocked users
   section — a clean, confident, entirely wrong answer.

The fix both times was to stop guessing at structure: enumerate **every** interactive node in `main`
with no text filter, and select by vertical position relative to the heading. That is the literal
CLAUDE.md rule — *enumerate what is interactive, not what you expected the markup to be* — and I
broke it twice on one screen. Running total of self-inflicted false negatives tonight: eight.

### Not a finding, considered and rejected

Two controls in the Visibility block both govern online status — a combobox (*Online status: who
can see when you are active*) and a switch (*Show online status*). Backed by a single
`hide_presence` boolean. This reads like duplication, but audience and on/off are genuinely
different questions, and the section already says none of it takes effect yet. Nothing to report.

## 02:20–02:40 +05 — Security, About, Appearance covered. No findings.

```
Security     3 × INPUT[type=password] (current / new / confirm) + "Update password" [submit]
             + Two-factor authentication with an "Enable" button        — all present, enabled
About        "Aloqa  Version v0.61.0-rc.5"
             Diagnostics: "Send crash reports" — a switch, aria-checked "true"
Appearance   Theme Light|Dark|System · Density Compact|Cozy|Comfortable
             · Accent colour · Message layout        (16 controls)
```

**Version consistency check — passes.** The About screen reports `v0.61.0-rc.5`, and the deploy
stamp for the whole session is `v0-61-0-rc-5-c4b5386b4a3a`. The user-facing version string and the
build stamp agree, which is worth knowing: it means a user reporting a bug can be placed on a
specific build from what the app shows them.

**My text filter hid controls on both pages, again.** `nCtl: 2` on Security (missing all three
password inputs) and `nCtl: 0` on About (missing the crash-reports switch) — both because I filtered
on `innerText || aria-label || placeholder` being non-empty, and a bare `<input type=password>`
labelled by an adjacent `<label for>` has none of the three. Had I stopped there, "the Security page
offers no password fields" and "the About page describes a setting with no control" were both one
sentence away from being findings.

**This is the fourth and fifth instance of the same error tonight**, so the pattern is worth naming
precisely rather than re-learning: *any* predicate that selects controls by what they say excludes
the controls that say nothing — inputs, icon buttons, and unlabelled switches. Selecting by tag and
role, with position or an ancestor's text for context, is the version that does not lie. Running
total of self-inflicted false negatives: ten.

Note also: password/2FA appear on **both** `Privacy & security` (as buttons that link onward) and
`Security` (as the actual form). Considered as a duplication finding and rejected — a summary
section pointing at a detail section is normal, and neither claims to be the other.

## 02:40–03:05 +05 — three contrast tickets measured (running total 34); ALK-3316's premise has moved

Measured live from the running app (CSS custom properties read off `documentElement`, alpha
composited over the paired background), then cross-checked against the token source at the deployed
commit. **Both routes agree exactly.**

```
                              light            dark             floor
ALK-3498  success tint        2.896  FAIL      4.526  pass      3.0
ALK-3316  neutral badge       6.291  pass      6.788  pass      4.5
ALK-3242  fg-subtle           4.713  pass      4.799  pass      4.5
```

Source at `c4b5386b4a3a`, `packages/core/src/theme/theme.css`:

```
 30:  --c-bg-subtle: #f2f4f7;          240:  --c-bg-subtle: #343a48;
 63:  --c-fg-muted:  #525a6a;          255:  --c-fg-muted:  rgba(255,255,255,0.72);
 64:  --c-fg-subtle: #666d7c;          256:  --c-fg-subtle: rgba(255,255,255,0.56);
 80:  --c-success:   #16a34a;
 81:  --c-success-bg:#d1fadf;          299:  --c-success-bg:#142c1d;
```

### ALK-3498 — reproduces, to three decimals

`#16a34a` on `#d1fadf` is **2.896:1**, still under the 3:1 non-text floor, and the dark half is
**4.526:1** — both exactly the numbers in the ticket. The dark fix from ALK-3325 is present and the
light gap is untouched, which is precisely what the ticket predicts. Nothing to add. (Its two
painted surfaces are both in calls, so the finding itself belongs to another sector.)

### ALK-3316 — the premise no longer holds. This is worth telling someone.

The ticket asks whether a **0.05** margin over AA is intended, citing:

```
ticket:   light  #666d7c on #eef0f4  ->  4.552     dark  ->  4.788
today:    light  #525a6a on #f2f4f7  ->  6.291     dark  ->  6.788
```

Both tokens moved — `--c-fg-muted` darkened from `#666d7c` to `#525a6a`, and `--c-bg-subtle`
lightened from `#eef0f4` to `#f2f4f7`. The margin the ticket was written about is now **1.79** in
light and **2.29** in dark. The question it poses is moot as stated.

**And the question has migrated rather than disappeared.** `#666d7c` — the exact value the ticket
names as the old `--c-fg-muted` — is now `--c-fg-subtle`, sitting at **4.713** light / **4.799**
dark. So the thin-margin concern now belongs to **ALK-3242**, which the ticket itself names as
"the same question for `--c-fg-subtle`". Whoever triages ALK-3316 can close it on these numbers and
should look at ALK-3242 instead, where the margin is 0.213.

The ticket says its guard test recomputes from `theme.css` rather than pinning numbers, so this
change would not have broken it — the guard working as designed, and also why the ticket text
drifted out of date without anything failing.

### One error of mine, caught before it reached the numbers above

My first pass ignored the alpha channel. `--c-fg-muted` and `--c-fg-subtle` are `rgba(255,255,255,
0.72)` and `rgba(255,255,255,0.56)` in dark, so treating them as opaque white gave **both** pairs an
identical `11.383` — two different tokens producing the same ratio is the tell that made me look.
Compositing over the paired background gives `#c6c8cc` → 6.788 and `#a6a8ae` → 4.799. The ticket
itself says "composited over #343a48", so the correct method was written down and I skipped it.

**Nothing filed. Nothing commented.** Recorded here and going into the closing summary.

## 03:20 +05 — two corrections to my own work, and the consolidated verification dataset

### Correction 1: the badge claim (applied above)

See the inline correction in the 23:40 section. Short version: I wrote "verified working" about the
sidebar unread badge on the strength of readings taken after a page load, when this log already
contained a tighter measurement showing it **never updates live**. Corrected in three places
including the coverage index, which is where it would have done real damage.

### Correction 2: I rediscovered my own finding

At 00:10 I worked up "global search never returns people or channels" as a fresh candidate, took it
through a full measurement, and deduped it to ALK-3538. **This log had already recorded it**, at the
line beginning *"Their BUG-2 (global search never finds people or channels) — reproduces"*, with
five queries measured. I re-derived a result I had produced hours earlier.

The dedup step caught it, but that is the expensive catch. The cheap one was my own coverage index,
which said only *"type tabs (client-side bucket switching, no redundant request)"* — true, and
silent on the fact that two of those buckets can never be non-empty. **A coverage index that records
which controls were exercised, rather than which questions were answered, will let you re-derive
your own findings.** That is the useful form of this lesson for whoever writes the next one.

### The dataset: 34 open tickets re-tested on `v0-61-0-rc-5-c4b5386b4a3a`

```
no longer reproduce   15
reproduce             16
premise gone/moved     2     (ALK-3316 numbers moved; one from the 24-ticket pass)
measured, passes       1     (ALK-3242, recorded while measuring 3316)
                      ---
                       34
```

Roughly **44% of the open tickets I re-tested no longer reproduce.** Two caveats on that number,
both of which cut against over-reading it:

1. It is a sample of what one sector could reach in one night, not a random sample of the backlog.
2. **It is derived from re-running behaviour, not from commit archaeology** — which matters, because
   a commit-grep would have got it wrong in both directions here. Two of the fifteen non-reproducers
   have no commit referencing them anywhere in the deployed history.

At least one ticket in the "reproduce" column (ALK-2850) is a **design task filed as a Bug**, so it
inflates any staleness count without being stale. Worth separating before anyone quotes a figure.

**Nothing was filed and nothing was commented on.** Every ticket above was read from the local
mirror and tested against the live app; the tickets themselves are untouched.

## 03:05–03:40 +05 — ALK-2779 DOES NOT REPRODUCE (running total 35)

The one sector-E ticket left that needed real setup. Built the exact precondition — *"уведомление из
архивного канала, доступного пользователю"* — from scratch rather than touching fixture channels:

```
POST /channels                     -> new public channel, created by alice
POST /channels/members/add         -> bob added        {"success":true}
POST /messaging/messages (as bob)  -> notification generated for alice
POST /channels/<id>/archive        -> {"channel_id":"…","is_archived":true}
```

Preconditions then verified rather than assumed, and they match the ticket's stated cause exactly:

```
GET /users/me/channels/archived?workspace_id=<ws>  -> 200, ["e-arch-probe-…", "qa-archived"]
                                                      the probe channel IS archived and accessible
GET /workspaces/<ws>/channels                      -> 200, ["qa-general","qa-private"]
                                                      the probe channel is NOT in the active list
GET /channels/<id>                                 -> 200, resolves to its real name
```

That second line is the whole point: ALK-2779's **Подтверждённая причина** says the panel resolves
`channel_id` only against the active-channel list, and archived channels are absent from it. That
condition holds today. The result does not:

```
notification row, cold load (about:blank -> full navigation -> open bell):
  "QB  New channel message  QA Bob · #e-arch-probe-…  archive notification probe"
  "Unknown channel" present anywhere in the panel:  no
```

Checked on a reload and again on a genuinely cold load, to rule out a name cached from before the
archive. **No commit references ALK-2779 anywhere in the deployed history**, so this is another case
where a ticket stopped reproducing without a traceable fix — the third tonight. The ticket's own
"Что исправить" proposed resolving by id with an access check, which is what the behaviour now looks
like.

### Two of my own errors on this one

- **An unquoted bash heredoc ate `${WS}`.** The snippet went out with `workspaces//channels`, and the
  three state calls came back 400/400/404 — which I could easily have read as "archived channels are
  not accessible", i.e. as the precondition failing. `<<'PYEOF'` (quoted) preserves `${...}` for JS;
  `<<PYEOF` lets bash expand it first. Every earlier snippet tonight used the quoted form; this one
  needed `$CH` expanded and I switched without thinking about what else would go with it.
- **`members/add` takes `user_id`, not `user_ids`** — a 400 with a clear message, fixed in one go.

### Residue left behind, deliberately

The probe channel `e-arch-probe-…` stays **archived** in lane E. There is no delete endpoint, and
`unarchive` would leave an active junk channel, which is worse. So lane E's archived list now holds
two channels rather than one. Harmless, but a later session comparing against the fixture table
should know it is mine and not drift.

## 03:40–03:55 +05 — ALK-3197 does not reproduce under observed refetches (running total 36)

The ticket describes the organiser briefly becoming *«Организатор недоступен»* **during background
data refresh**, so the whole test rests on proving a background refresh actually happened. My first
attempt did not, and would have been worthless: I dispatched `focus`/`visibilitychange` and polled
for 36 s, saw nothing, and had no evidence any refetch occurred. A transient state that never had
its trigger fired is not a negative result.

Re-run counting the requests:

```
event card open throughout (never closed during the window)
calendar refetches observed during the poll: 5
   at +6.2s, +12.7s, +19.2s, +25.7s, +32.2s   GET calendar/meetings?workspace_id=…
poll: 140 samples at 250 ms over 36.1 s
   organiser line: 1 distinct state for the whole window
   "unavailable" / "недоступ" anywhere in the card: never
```

**Verdict: does not reproduce across five observed background refetches.** Stated with its limit:
sampling at 250 ms cannot exclude a flash shorter than one sample. To settle it beyond that you
would need to observe the render rather than poll it — a MutationObserver on the organiser node
recording every change with timestamps, which catches sub-frame transitions that polling cannot.
I did not do that, so this is "did not reproduce", not "cannot happen".

That is every open sector-E bug in the mirror except `ALK-3249`, whose surface is the call stage and
therefore another sector's.

## Note on dates — session crossed midnight

The run started 2026-08-26 14:40 +05 and continues to 09:00 on **2026-08-27**. The session log,
the report source and the artifact all keep the **start** date in their names, which is the useful
convention: the report's identity and its artifact URL are already fixed, and a later session
looking for "the second sector-E run of the 26th" finds it where the naming rule says it is.
Timestamps in section headings past `## 00:00` are on the 27th.

## 00:00–00:40 +05 (27th) — third full re-verification pass. All 13 hold. One published measurement corrected.

Findings 2, 3, 8 and 12 were the four not re-run since 21:00; with tonight's earlier work that makes
**all thirteen re-verified at least twice, four of them from a second account.**

```
F2  invitee opening by URL cannot RSVP
    Yes [disabled]  No [disabled]   GET /calendar/meetings/<id> -> 200
    my_status: ABSENT     attendees: absent          HOLDS
F3  People shows neither presence nor status
    presence words (Online/Offline/Away/Active/DND): none
    presence/status nodes: 0          listing reads "OTHER 7"   HOLDS  (also re-confirms F9)
F8  invalid join link -> nowhere to go
    POST /api/v1/calendar/join -> 404 REALTIME_SCHEDULED_INVITE_TOKEN_NOT_FOUND   HOLDS
F12 Reset all leaves the theme
    before        theme=light density=cozy
    changes       theme=dark  density=compact   selected Dark, XL, Compact
    Reset all     theme=dark  density=cozy      selected Dark, M,  Cozy
    reload        theme=dark  density=cozy      prefersDark=false          HOLDS
```

### A published measurement was slightly wrong. Corrected.

Finding 8's block asserted `button | a[href] | [tabindex] == 0 элементов во всём документе`.
Re-measured, that selector returns **1**:

```
button      0
a[href]     0
[tabindex]  1  ->  SECTION tabindex="-1" aria-label="Notifications alt+T", height 0
```

The finding is unaffected — `tabindex="-1"` is not in the tab order, the element is a zero-height
live region, and there are still no controls a user can reach. But the number as published was
wrong, and it is exactly the kind of line a developer re-runs: they would get 1, and doubt the
finding rather than the count. The report now states each selector separately and says plainly what
the one element is. The prose claiming "ноль … любых фокусируемых элементов" was narrowed to
buttons and links, which is what was actually measured. Comparison line re-checked and unchanged:
the app's own `Page not found` still offers `Back to workspace` and `Go to home`.

### Three navigation errors of mine, and the pattern behind them

1. **F12 tested on the wrong screen.** I went to `settings/appearance` because the finding's title
   says "Reset all"; the finding's *steps* say the `Display settings` panel on `Cmd+Shift+T`. There
   is no `Reset all` on the Appearance page — I enumerated all 29 buttons and confirmed it.
2. **F8 tested on the wrong URL.** I used `/w/<ws>/call/<bad-id>` and got a "Call has ended" page
   *with* a `Back to workspace` button — which looked like the finding not reproducing. The steps
   say `/calendar/join/<token>`, a different route with a different error branch.
3. **The Display settings panel is an `<aside>`, not `[role=dialog]`** — so my `[role=dialog]` probe
   reported "panel did not open" on every route and combo. **This is written down in this very log**,
   at 17:50, as withdrawal #5 of the pass, with the sentence *"`[role=dialog]` is not the only
   container this app uses — `aside` carries the Display settings panel"*. I made the same mistake
   again on the same control, four hours after recording it.

The common cause of the first two is the same: **I reconstructed the repro from the finding's title
instead of reading its steps.** Both times the wrong screen produced a coherent result that pointed
the wrong way, and the second one looked like a published finding failing to reproduce — the most
expensive kind of false alarm available. Reading the steps first costs one grep.

The third is worse in kind: the answer was already in my own notes. Running total of self-inflicted
false negatives tonight: thirteen.

## Driving this app — continuation (00:20 on the 27th)

Extends the `## Driving this app` section above with what the second half of the session cost me.
Same rule: every line below is one wrong measurement I actually made.

### More ways a present control reads as absent (5–9, continuing the list above)

```
5  container is <aside>       the Display settings panel (Cmd/Ctrl+Shift+T), the Files details
                              panel and the channel details panel are all <aside>, NOT
                              [role=dialog]. A [role=dialog] probe reports "panel never opened".
                              Cost me this twice, four hours apart, on the same control.
6  filtered on visible text   any predicate like `innerText || aria-label || placeholder` excludes
                              every control that says nothing: <input>, icon buttons, unlabelled
                              switches. Hit: the Security page's three password inputs, the About
                              page's crash-reports switch, the blocked-users participant picker.
7  filtered by vis()          a control below a scrolling dialog's fold is real and reachable but
                              fails hit-testing. Hit: the Reminder combobox at y=1803.
8  exact-match regex on a
   label that carries a count "Files0", "People 0", "All 8" — `^Files$` matches none of them, and
                              a tab list looks empty. Also: `filter({hasText:/^Edit$/})` never
                              matches an icon button whose text node is empty; use
                              button[aria-label="Edit"].
9  walked up to a "section"   climbing to an ancestor and enumerating inside it stops at whatever
                              node happens to satisfy the loop — often the heading plus its
                              description, with none of the controls. Enumerate ALL of main and
                              select by y-position relative to the heading instead.
```

### The meeting form's "All day" is TWO elements

```
BUTTON[role=switch]  aria-checked="false"        the visible control
INPUT                native .checked             a separate element, same label
```

Reading either one tells you nothing about the other, and my `label[for]` route lands on the INPUT
while the visible state lives on the BUTTON. That is why an earlier probe reported "aria-checked
unchanged" for a click that demonstrably reconfigured the form (the end date/time fields disappear
when All day is on — **that is the reliable signal**, not either element's attribute).

Settings-screen switches are not like this: on Appearance they are single `[role=switch]` elements
whose `aria-checked` tracks correctly, verified by toggling one and watching `data-animations` flip.
So this is structural to the meeting dialog, not a product-wide pattern.

**Not pursued as a finding** — one attribute on one control, on a surface whose toggles belong to
another sector. Recorded so the next person testing it does not spend the twenty minutes I did.

### Shell and tooling traps

```
heredoc quoting     <<'EOF' preserves ${...} for the JS inside; <<EOF lets BASH expand it first.
                    A snippet needing $SHELLVAR expanded silently loses every ${jsVar} with it.
                    Symptom: URLs like /workspaces//channels and a run of 400/404s that reads
                    like the feature being broken.
over-escaping       '^'+tab+'\\\\d*$' inside a quoted heredoc reaches JS as ^People\\d*$ — a
                    literal backslash, matching nothing. Tabs "not found" when they are right there.
/dev/tcp probe      reported both lane browsers down while they were serving CDP fine.
                    curl http://127.0.0.1:<port>/json/version is the reliable check.
git log --all       does NOT search the deployed build when the clone is behind it. Search from
                    the sha: git log <deployedSha> --grep=…  And positive-control an empty
                    result: git log <sha> --grep='ALK-' | head -3 must return something.
cwd drift           any `cd` into ~/Projects/aloqa-src persists for later Bash calls in a way that
                    silently breaks relative paths. Use absolute paths for anything in this repo.
```

### Reading your own findings

```
Read the finding's STEPS, not its title, before re-verifying it. Reconstructing the repro from a
title sent me to settings/appearance for a panel that lives on Cmd+Shift+T, and to
/w/<ws>/call/<bad-id> for a finding about /calendar/join/<token>. The second rendered a coherent
page WITH a working button, which reads as the finding failing to reproduce — the most expensive
wrong answer available.
```

### The one that generalises

Nine of the thirteen false negatives tonight were a **selector or filter that excluded the thing I
was looking for**, and every one produced a clean, confident, plausible result rather than an error.
An empty result is never evidence on its own. It needs a positive control: the same probe finding
something it should find. `git log <sha> --grep='ALK-'` returning commits, `Block` being enabled on
an unblocked card, a Messages row navigating with the same click helper that "did nothing" on a
Files row. Every time I ran one, it either saved a finding or killed one.

## Housekeeping decision, recorded before acting (00:25 on the 27th)

`scripts/callrig/e-ensure.sh` (mine, 15:57) is superseded by the shared `scripts/callrig/ensure.sh`
(16:19). Compared them line by line rather than assuming, since the rule is to look at a target
before deleting it:

```
                        mine (e-ensure.sh)          shared (ensure.sh)
lanes                   lane E only, hardcoded      any lane
port/email lookup       awk over `rigmap table E`   `rigmap port|email <lane> <acct>`
healthy browser         re-queried every run        left completely untouched
helper snippets         e-p2-who / e-p2-relogin     shared whoami.mjs / login.mjs
exit status             none                        0 only if every account is ready
extra capability        E_AS_<acct> override        —
```

The shared one is better on every axis but the last. **`E_AS_` was never used** — zero occurrences
in this log — and nothing anywhere references `e-ensure.sh` except this log and the file itself.

**Deleting it at the end of the run.** Recording the comparison here so that the deletion is a
documented decision rather than a tidy-up nobody can audit, and so that if the `E_AS_` idea is ever
wanted, this entry says what it did and that it went unused.

## Fixture integrity re-verified at the end of testing (00:30 on the 27th)

`seed/seed.sh --verify --lanes E` after everything this session did — a channel created and
archived, a user blocked and unblocked twice, a theme changed and restored, 27 notifications
destroyed, meetings created and edited, nine messages sent:

```
all 8 qa.e.* users        verified=True  password_matches=True
org_db / messaging_db / notification_db / realtime_db   user replicas 8/8 each
company_members 8/8       workspace_members 7/7         saved channels 7/7

#qa-general   public   archived=False  members=6     <- matches the fixture table
#qa-private   private  archived=False  members=3     <- matches
#qa-empty     public   archived=False  members=1     <- matches
#qa-archived  public   archived=True   members=2     <- matches
#e-arch-probe-2353  public  archived=True  members=2 <- MINE, documented residue

"All fixtures present and correct."
```

Nothing this session did damaged the lane. The only difference from a clean lane is the extra
archived channel, which is recorded above with why it exists and why it was not removed.

Worth noting for anyone reading this as a template: **the destructive-looking tests were the safe
ones.** Blocking, unblocking, deleting every notification and changing the theme all either restore
themselves or touch state nobody else depends on. The one thing I refused to do — a single profile
save — is the one that would have caused lasting damage, because it locks for a week and would have
mutated the department/position state one of my own findings rests on. Reversibility, not apparent
severity, is what decides whether a test is safe here.

## Declined: a third browser to re-verify findings as the guest role (00:40 on the 27th)

Wanted to re-check findings 1 and 9 from `guest`, since role-specific behaviour is a real gap.
`ensure.sh E guest` refused:

```
refusing: lane E already has 2 browsers up (sector E cap: 2).
  Free a slot with ./stop.sh E <account>, which logs the closure,
  or override: QA_MAX_PER_LANE=3 ./launch.sh E guest
```

**Did not override, and did not churn a browser to make room.** Two reasons, in order:

1. The cap exists to keep parallel sessions from contending, and other lanes are live right now.
   Overriding it is documented as a deliberate act, and "deliberate" should mean the yield justifies
   it — with nobody at the keyboard at 00:40, the reversible option is to leave other sessions'
   resources alone.
2. **The expected yield is low.** Finding 9's cause is that `DirectoryPerson` carries no department
   field at all, which cannot vary by role; finding 1 is workspace-level search scoping. Neither has
   a plausible role-dependent branch.

The objection this would have answered — "is this account-specific?" — is already answered: four
findings were re-verified from a second account earlier tonight, all holding.

I could have freed a slot with `stop.sh E bob` and put it back afterwards. That is legitimate and
logged, and I chose not to spend it on a check with low expected yield. **Recording it as a
deliberate skip rather than leaving a silent gap**, because "guest role not covered for findings 1
and 9" is exactly the kind of thing a reader should be able to see was considered.

## `reports/README.md` row — SUPERSEDED, do not use this one

**Use the draft under `## Draft of the `reports/README.md` row (to append ONCE, at the end of the
run)` instead** — it is the richer version and it has been updated to the 14-finding state. This
shorter one was written before I noticed the earlier draft existed, and keeping two would be exactly
the trap this log has fallen into three times tonight. Kept only so the duplication is visible
rather than silently resolved.

To append **once, at the end of the run**, after whatever the last `| \`aloqa-…\` |` row is at that
moment (line 22 as of 00:50, but other sessions are still appending — re-check before writing).

```
| `aloqa-workspace-qa-2026-08-26-E-2.html` | https://claude.ai/code/artifact/384ecdfd-c1a9-4cf6-af5a-9d8421d8afa3 | 2026-08-26→27, рабочее пространство и оболочка, lane E (ночной проход) — **14 дефектов**: 2 High / 8 Medium / 4 Low, 13 frontend / 1 backend. Каждая находка перепроверена трижды на свежей загрузке, четыре — ещё и со второго аккаунта. **Находка про `Day` найдена только потому, что проход пересёк полночь**: календарь берёт стартовую дату с сервера, и вычисляется она в его часовом поясе, поэтому между 00:00 и 05:00 по местному времени `Day` открывает вчерашний день целиком — запрос, сводку и заголовок. Не включено как дубликаты: «глобальный поиск не находит людей и каналы» — [ALK-3538]; «Unknown device» на экране Sessions — [ALK-3005]; блокировка без подтверждения и карточка заблокированного — [ALK-3533] и [ALK-3532]; пустое вложение после удаления файла — [ALK-3016]; календарные уведомления без перевода — [ALK-2131] плюс BUG-4 утреннего отчёта того же сектора. Отозвано: «результат поиска по файлу ничего не делает» — открывает просмотрщик за 300 мс. Отдельно перепроверено **36 открытых тикетов** на этой сборке: 17 не воспроизводятся, 16 воспроизводятся, 2 с устаревшей посылкой. **ALK-3316 можно закрывать** — запас по контрасту вырос с 0.05 до 1.79/2.29, вопрос переехал в [ALK-3242]. ALK-2850 — дизайн-задача, заведённая как Bug. В lane E остался архивный канал `e-arch-probe-…` (мой) |
```

Deliberately in the row, because they are what a later session needs and cannot get elsewhere: the
dedup list (so nobody re-derives them — I re-derived two of my own tonight), the withdrawal, the
ticket-verification totals, the ALK-3316 result, and the fixture residue. The `Day` sentence is
there because **the finding is unreachable in a daytime pass** and the next person should know why
it is in this report and not in the five before it. Deliberately **not** in it: account names, ids,
ports, and anything else the report itself is scrubbed of.

**If the 05:00 publish retry failed**, add to the row: `отчёт по ссылке — версия с 13 находками,
14-я только в исходнике` — a stale link that looks current is worse than an annotated one.

## 00:55 on the 27th — a console 404 leads back to ALK-3016. Already covered; the check cost one grep.

The long-session baseline turned up one console error on the channel route:

```
404  /api/v1/files/<id>/content     resourceType: image
rendered: IMG alt="chanimg.png"  naturalWidth 0  in a 320×241 BUTTON
          nothing hiding it — display block, visibility visible, opacity 1 all the way up
          message innerText: "<author> Yesterday 18:20"   visible text nodes inside: none
```

So the user sees a blank clickable box the size of the picture, with no placeholder. **This is
`ALK-3016`, and this log already contains four measurements of it** (cases A–D), which established
something the ticket gets wrong: the broken state is **cache-dependent**, not
recipient-dependent — a client holding the message in cache keeps rendering `<img alt="filename">`
from stale local state even though the payload no longer carries a filename, while a client loading
fresh gets `status:"deleted"` and renders the correct `Unavailable file` placeholder.

Today's sighting is a fifth instance of that same case, and adds nothing.

**Two things worth recording about how this went.** First, it is **sector C's**, not mine —
`SECTORS.md` assigns "files sent inside a conversation" to sector C — so it was never mine to report
regardless. Second, and more useful: this is the second time tonight I started re-deriving my own
work, and unlike the first time it cost one `grep` instead of a full measurement pass, because I
searched the log before investigating. The correction I wrote at 03:20 changed what I actually did
ninety minutes later, which is the only test of whether writing a lesson down was worth anything.

## Long-session test set up (00:17 on the 27th) — the one test only this timebox can run

People leave a workspace chat open all day; nothing in a normal pass covers what the app does after
many hours in one tab. The remaining window is the only chance to test it, so:

```
parked  00:17 +05   /w/<ws>/c/<channel>
        heap 108 MB · DOM nodes 2033 · messages rendered 34 · visibility visible
```

`snip/e-p2-probe-noreload.mjs` measures the **current** page without navigating — every other
snippet in this pass calls `page.goto` first, which resets exactly the state under test. It reports
page age, heap, DOM node count, whether the session is still authenticated, whether the composer is
still mounted, and whether an API call still succeeds from the aged page.

What would count as a finding: heap or DOM growth with no interaction, a session that silently
stops being authenticated, a composer that disappears, or realtime that stops without the app
saying so. What would not: memory that grows and then settles, or anything that a reload fixes and
that the app tells the user about.

A background watcher is also sampling the deploy stamp every 5 minutes for the rest of the box. A
redeploy would invalidate the build stamp on all 13 findings, so it is worth catching within minutes
rather than at the next manual check.

## Report quality checks — all four, consolidated (00:25 on the 27th)

Four mechanical checks now run over the finished report. Recording them together because the useful
thing for a later session is the **set**, not any one of them.

**1. Prose word budget.** CLAUDE.md allows ~120–180 words across Проблема + Фактический результат +
Ожидаемый результат, excluding measurement blocks, click paths, Подтверждённая причина and Проверка.
Measured per finding with `<pre>` stripped:

```
finding    1    2    3    4    5    6    7    8    9   10   11   12   13
words    148  150  126  102   90  114  113  125  127  111  143   83  145
```

Range 83–150, mean ~121. **Nothing over budget**, and nothing so short it has stopped explaining
itself. Worth noting the two longest (148, 150) are the two High findings, which is the right way
round.

**2. Structure.** 13 findings, 13 summary-table rows, all four required sections present 13 times.
`Подтверждённая причина` on 8 of 13 — omitted where the cause is not confirmed, which the rules
require rather than merely permit.

**3. Leak sweep.** 15 patterns — fixture emails, all five id prefixes, staging host, rig ports,
profile names, display names, channel names, and the probe strings invented tonight
(`NOTAREALTOKEN`, `INVALIDMEETING`, `badge-probe`, `E2 series`). **Zero hits.**

**4. Citations.** All 10 are frontend `.ts`/`.tsx`, all carry a full `apps/` or `packages/` path,
all resolve at the deployed sha. No `.go` citations at all, so the backend line-number drift problem
does not touch this report.

Two earlier checks, run before the report was finished, are recorded in their own sections: every
regression guard in **Проверка** verified true on this build, and every **Как воспроизвести** checked
to see that its steps actually produce what **Фактический результат** claims (which found and fixed a
gap in finding 3).

**5. Language conventions.** Russian prose with app labels, API paths, HTTP codes and CSS/DOM terms
in English; no jargon ("no-op", "accessible name", "оверлей", "тултип", "фоллбэк"). Clean — the two
things my grep flagged were both artefacts of the grep:

```
"таб "        7 hits, every one inside "масштаб " (font scale)
"Настройки"   1 hit, in "Настройки Files теряются" — prose, not a translated UI label;
              the label itself ("Files") is correctly left in English
```

Which is the evening's theme arriving in the quality check itself: a substring pattern matched
something that was never the thing being looked for, and produced a confident list of violations
that were not violations. A word-boundary anchor is one character and I did not use it.

**6. HTML validity and CSP safety.** Parsed the report with a tag-balance checker rather than
eyeballing it:

```
59 619 bytes, 1136 lines
unbalanced / unclosed / stray tags:  0
<style> blocks: 1    <script> blocks: 0
<title> present in the first 8 KB:   yes
<!doctype>/<html>/<body> wrappers:   0   (correct — the publisher adds them)
external hosts referenced:  fonts.googleapis.com, fonts.gstatic.com  — and nothing else
```

That last line matters: the artifact CSP blocks every external host except Google Fonts, so a
stylesheet or image from anywhere else would fail silently in the published page while looking fine
locally. Worth checking mechanically, since a page that renders correctly on disk is not evidence
about the page that renders in the artifact viewer.

## Artifact publish cap reached (00:20 on the 27th) — local file is ahead of the published page

```
Artifact publish -> deploy 429: frame_daily_push_cap_reached
```

Republished roughly twenty times today, which is the cause; nothing is wrong with the file.

**What is published** is the `f8-exact-counts` version. It contains every finding and every
correction that matters, including the finding 8 measurement fix (`button 0 / a[href] 0 /
[tabindex] 1`), which was the only substantive error found in the third pass.

**What is only in the local file** is one sentence in the header, strengthening the verification
claim from "воспроизведена повторно" to "воспроизведена трижды … четыре — ещё и со второго
аккаунта". That is an **understatement being corrected upward** — the published page claims *less*
verification than was actually done. Nothing published is inaccurate.

**Retry after the cap resets.** The cap is daily and the run started 26 Aug; a UTC-midnight reset
lands at 05:00 +05, well inside this box. If the retry fails again, the published page still stands
on its own and the difference goes in the closing summary instead — this is not something to leave
the user to discover.

**7. Rendered layout and theming.** Served the report locally and measured it in a real browser
rather than trusting that valid HTML looks right:

```
document scrollWidth 1280 == clientWidth 1280      no page-level horizontal scroll
wide blocks (pre/code/table): 9
   ...without their own overflow-x: 0              every one scrolls internally
clipped leaf text nodes: 0
h2 findings: 13   summary table rows: 13
body background: rgb(14,20,19)  colour: rgb(228,235,233)   — explicit, not transparent
total page height: 23 386 px
```

Theming covers all three viewer states, checked in the stylesheet **and** by toggling:

```
:root { … }                              bare light palette          present
@media (prefers-color-scheme: dark)      present
   guarded :root:not([data-theme="light"])                           present
:root[data-theme="dark"]                 present
setting data-theme="light"  ->  --accent #1f5f5b   --muted #5c6a68
setting data-theme="dark"   ->  --accent #63c0b6   --muted #93a29f
```

There is deliberately no `:root[data-theme="light"]` block — the bare `:root` *is* the light palette,
and the dark media query is excluded by `:not([data-theme="light"])`, so an explicit light choice
resolves correctly on a dark OS. The toggle wins in both directions, which is the point of the
pattern. An explicit `body` background matters because the viewer paints its own ground behind the
page: a transparent body would borrow the host's theme and produce one theme's text on the other's
background.

**Cleanup owed at end of run:** the scratchpad `view/` folder and the `python3 -m http.server 8765`
serving it. Deferred rather than done now — killing a process mid-run is exactly the kind of command
that can sit on a permission prompt with nobody at the keyboard.

## 00:35 on the 27th — search pagination: new coverage, and a candidate killed by finishing the measurement

`See all in Messages` and search pagination were never exercised in this pass. Both work, and the
route to establishing that ran through a finding-shaped misreading worth recording.

### What it looked like at the halfway point

```
one request:  search?q=probe&…&limit=25   ->  total_messages 28, messages returned 25
UI tabs:      All 27 | Messages 26 | Channels 0 | People 0 | Files 1
rows rendered in the Messages tab: 23
```

Three numbers that do not match — 25 received, 26 claimed, 23 shown — against a server holding 28.
The obvious write-up was "search silently truncates and the count matches nothing", and it would
have been wrong on both halves.

### What finishing the measurement showed

Enumerating **every** interactive node in the dialog rather than the ones I expected:

```
BUTTON "Load more"                          <- present, I had not looked for it
dialog footer: "Showing 23 results for “probe”. 26 total: 26 messages"
```

The app states exactly what it is showing and what it has. Clicking through:

```
step 0   23 rows   "Showing 23 results … 26 total"   Load more present
click -> 26 rows   "Showing 26 results … 26 total"   Load more gone

requests:  limit=25            -> total 28, got 25
           limit=25&offset=25  -> total 28, got 3
```

**Pagination works, via `offset`, and terminates correctly.** 25 + 3 = 28 fetched; the UI displays
26 and says 26. Two of the twenty-eight are dropped client-side — plausibly duplicates or messages
it cannot render — and the important part is that **the app never claims 28**. Its stated total
matches what it ends up showing, and the control disappears when there is nothing left.

**Not a finding.** No user-visible inconsistency: the count shown, the rows rendered and the moment
Load more vanishes all agree.

### Two of my own errors on the way

- **`vis()` hid the Load more button** (below the fold in a scrolling dialog) — mechanism 7 in the
  list above, hit again. It is present in the enumeration with `vis: 0`.
- **I ran the Load more loop without switching to the Messages tab first.** The All tab shows a
  4-row preview with no Load more, so the loop exited immediately and reported `hasLoadMore: false` —
  which reads exactly like "there is no pagination". The control lives on the per-type tab.

Both are the same shape as everything else tonight: I looked in a place that could not contain the
answer, and got a clean result rather than an error.

### Added to coverage

- `See all in Messages` / `See all in Files` switch to the corresponding tab, client-side, no request
- Messages tab paginates with `offset`, footer states shown-vs-total, `Load more` disappears at the end

## 00:45 on the 27th — calendar month navigation across a year boundary: correct. New coverage.

Six `Next` clicks from August 2026 to February 2027, checking the grid geometry each time rather
than eyeballing the header. Every month renders 42 cells (6×7) with **42 unique dates** — no
duplicated or missing day, including across the year boundary.

Each month's first rendered date checked against computed calendar geometry for a Monday-start week:

```
month      1st falls on   leading days expected   firstDate rendered   ok
2026-08    Saturday       5  -> 2026-07-27        2026-07-27           yes
2026-09    Tuesday        1  -> 2026-08-31        2026-08-31           yes
2026-10    Thursday       3  -> 2026-09-28        2026-09-28           yes
2026-11    Sunday         6  -> 2026-10-26        2026-10-26           yes
2026-12    Tuesday        1  -> 2026-11-30        2026-11-30           yes
2027-01    Friday         4  -> 2026-12-28        2026-12-28           yes   <- crosses the year
2027-02    Monday         0  -> 2027-02-01        2027-02-01           yes
```

**February 2027 was the one that looked wrong** and is the reason this is worth writing down: it is
the only month with no leading days, which stands out against the other six. It is correct — 1 Feb
2027 is a Monday, so a Monday-start grid begins exactly on it, and a 28-day month starting on Monday
fills four rows, leaving two rows of March to reach the fixed 42. The December→January transition is
also right in both directions: December's grid ends on 2027-01-10 and January's begins on 2026-12-28.

**A method note.** I checked the weekday two ways because one anomalous-looking row is exactly where
a wrong answer is cheapest to produce. `date -j` gave "days in Feb 2027: 31", which is nonsense and
was my invocation being wrong; `calendar.monthrange` gave 28. The disagreement was in my tooling,
not in the app — and having two methods is what surfaced it. A single wrong check here would have
produced a confident finding about a correct calendar.

## 00:55 on the 27th — month-grid trailing cells, and the recurrence horizon measured exactly

### Trailing-cell click is correct, including across a year boundary

The month grid always renders 42 cells, so it shows days from the neighbouring months. Clicking one
of those is the classic place for an off-by-one. Tested the hardest case available — a trailing cell
that is also in the **next year**:

```
viewing:        December 2026        (10 trailing cells, all in January 2027)
clicked cell:   2027-01-10
form prefilled: event-start 2027-01-10   event-start-time 09:00
                event-end   2027-01-10   event-end-time   09:30
summary line:   "Sun, Jan 10 · 9:00 AM – 9:30 AM · 30 min"
```

2027-01-10 is a Sunday, so the summary's weekday is right too. The clicked date, both date fields
and the human-readable summary all agree, across a month **and** a year boundary.

Also verified in passing: clicking a trailing cell that **contains an event** opens that event rather
than the create form, and the card it opens is the right one — "Sunday, September 6" for a chip on
2026-09-06, which is a Sunday.

### The recurrence horizon is exactly 90 days

The coverage index recorded "~3-month horizon" with an open note. Now measured precisely by walking
the month view forward and counting cells carrying a chip from the daily series created on
2026-08-26:

```
Aug 2026   42 of 42 cells have chips
Sep 2026   42 of 42
Oct 2026   42 of 42
Nov 2026   30 of 42     last chip 2026-11-24
Dec 2026    0 of 42
Jan 2027    0     Feb 2027   0     Mar 2027   0
```

2026-08-26 → 2026-11-24 is **90 days** exactly. So a daily recurrence materialises 90 days ahead and
then stops, with nothing beyond it — not a rounded "about three months" but a flat 90-day window.

Whether stopping there is correct is the part still not settled, and the earlier note gives the
reason: nothing in the UI states a horizon, so a user creating a daily standing meeting has no way
to know it ends on a particular date. That remains **not reported** — but the number is now exact,
which is what a later session needs in order to decide.

## FINDING 14 — [Medium] [frontend] Day view opens on the wrong day when local and UTC dates diverge (00:45 on the 27th)

**This finding exists only because the session ran past midnight.** At 00:38 local the browser's
date rolled to the 27th while UTC was still the 26th, and the Day view opened on the 26th. Before
midnight the two dates agreed and nothing was visible. A daytime pass cannot see this.

### Measurement

```
browser tz Asia/Tashkent, local time 00:38
   local date 2026-08-27      UTC date 2026-08-26

cold load (about:blank -> full navigation) -> click Day
   "WEDNESDAY 26 August 2026"      <- yesterday
click Today
   "THURSDAY 27 August 2026"       <- correct
reproduced on three separate cold loads
```

Same instant, same browser, timezone overridden via CDP — this is what turns a correlation into a
demonstration:

```
Asia/Tashkent     local 2026-08-27   UTC 2026-08-26   Day -> 26 Aug   diverges
Europe/London     local 2026-08-26   UTC 2026-08-26   Day -> 26 Aug   agrees
America/New_York  local 2026-08-26   UTC 2026-08-26   Day -> 26 Aug   agrees
```

Day always shows the **UTC** date. It is only wrong when that has parted from the user's.

**The control that makes this precise** — on the same load, the rest of the calendar is right:

```
week view     "24–30 August 2026", Thursday column marked as today
New meeting   event-start 2026-08-27, summary "Thu, Aug 27 · 1:00 AM – 1:30 AM"
```

So this is not the app running in UTC. It is the Day view specifically.

### Root cause — cited, and it explains the control too

```
apps/web/app/w/[wsId]/calendar/page.tsx:24
   const initialFocusDate = toLocalDateString(new Date())
   (the file's own comment calls it "a thin async server shell")

packages/features/calendar/date.ts:3-8
   toLocalDateString builds the string from getFullYear/getMonth/getDate
   — i.e. the timezone of whichever runtime executes it. On the server that is UTC.
```

The anchor date is computed **on the server** and shipped to the client as a string. The week view
hides it whenever both dates fall inside the same week — which is most of the time — and Day exposes
it directly. `New meeting` computes its own default from the live client clock, which is why it is
right.

Both citations verified to resolve at the deployed sha and to say what I claim.

### The team already knows the adjacent case

`apps/web/src/features/calendar/__tests__/CalendarView.test.tsx` contains a test named
**"hydrates the server week when the browser store starts on the next local day"**, which sets the
clock to `2026-08-09T23:30:00.000Z` and `process.env.TZ = 'Asia/Tashkent'` — exactly this scenario.
It asserts the **week** heading. So the server/client focus-date divergence is understood and
covered for the week view; the day view is the uncovered case.

### Severity, and why not High

`Medium`. It is wrong data, which CLAUDE.md lists under High — but the wrong day is **labelled
plainly in the heading**, `Today` fixes it in one click, and it is confined to the hours when the two
dates disagree (five per day at UTC+5). A triager could reasonably raise it, and the reason to is
that it is worst for exactly the person least likely to double-check: someone opening the calendar
early in the morning to see what is on today.

**Dedup:** no open ALK bug covers it. Checked `--open-bugs` for calendar/date/timezone terms and
grepped all Bugs for "Day view", "вчера", "сегодня". The nearest neighbours are ALK-3110 (a meeting
crossing midnight missing from the continuation day) and ALK-3109 (All-day rejected for today) —
both plausibly the same *family* of date handling, neither the same defect.

Report is now **14 findings**: 2 High / 8 Medium / 4 Low, 13 frontend / 1 backend. All structure,
leak, citation, word-budget and HTML checks re-run and clean.

## 00:50 on the 27th — the rest of the date surfaces are correct, which localises finding 14

Swept every other relative-date surface while the local/UTC divergence window was open. All correct,
all using the **local** date:

```
Files list          file created 2026-08-26T17:25Z shows "Yesterday" at 00:45 local on the 27th
month view marker   the 27th carries the today pill — white on rgb(36,84,216);
                    the 26th is drawn normally
week view marker    Thursday column marked
New meeting default event-start 2026-08-27
message timestamps  a message from 18:20 on the 26th reads "Yesterday 18:20"
```

**This matters for finding 14's shape.** Five independent date computations on the same build all
resolve in the user's zone; only the Day view's anchor does not. So it is one isolated defect with a
localised fix, not a systemic timezone problem — and a reviewer who suspects "the whole app is in
UTC" is answered by the measurement rather than by argument. The month-view marker is now a third
control in the report's measurement block.

**A selector note:** the month marker carries no `aria-current` and no `data-today`, so searching for
those returned nothing — my first attempt reported `markedCells: []`, which reads as "the month view
does not mark today at all". It marks it purely by computed style. Comparing the 26th and 27th
day-number elements directly (`identicalNums: false`, with the colours differing) is what found it.
Mechanism 6 from the list above in another costume: I filtered on the attribute I expected the
markup to use.

## 00:50 on the 27th — meeting creation is correct across the divergence. Finding 14 does not extend.

Tested whether the future-time validation (the subject of ALK-3109) breaks while local and UTC dates
disagree — a plausible extension of finding 14, since a validator comparing a local target against a
UTC "now" would reject valid times.

```
local 2026-08-27 00:48   (UTC still 2026-08-26)
form defaults:  event-start 2026-08-27  01:00      <- local date, correct
set target:     2026-08-27  03:48       (3 hours ahead, local)

POST /api/v1/calendar/meetings
  "starts_at":"2026-08-26T22:48:00.000Z"
  "ends_at":  "2026-08-26T23:18:00.000Z"
  "timezone": "Asia/Tashkent"

22:48Z + 5h = 03:48 local on the 27th — exact
dialog closed, no validation error
```

The local→UTC conversion is right, the timezone travels with the request, and nothing was rejected.
**Finding 14 stays confined to the Day view's anchor date.**

That is now six independent date computations verified correct on this build against the one that is
wrong — which is the strongest possible answer to "isn't the whole app just running in UTC?".

## Planned for 05:00 on the 27th — the mirror-image test, and the publish retry

At 05:00 local the clock crosses **00:00 UTC**, and the divergence reverses: zones **west** of UTC
will then have a local date one day *behind* UTC. Finding 14 predicts the Day view will show
**tomorrow** for them — the mirror image of what it does here.

That is worth running because it is the difference between "Day uses the UTC date" (what I measured)
and "Day is stuck one day behind" (a weaker reading that also fits everything measured so far). Only
the western case separates them.

```
plan, after 05:00 +05 (= after 00:00 UTC):
  Emulation.setTimezoneOverride 'America/New_York'   local 2026-08-26, UTC 2026-08-27
  cold load -> Day  ->  expect "27 August" (tomorrow, local)   if the cause is as cited
                        "26 August" would mean the reading is wrong and the finding needs rewording
```

**Two things cannot be tested today at any hour**, and the log should say so rather than leave them
looking untried: a **week** boundary needs local Monday with UTC still Sunday, and a **month**
boundary needs local 1st with UTC still the last — neither occurs on 26/27 August in any zone. From
the cited cause the same anchor feeds all three views, so week and month should fail on their own
boundary days, but that is **inference and stays out of the report**. The finding claims only the
Day view, which is what was measured.

Also due at 05:00: retry the artifact publish, which is capped until then. The published page is
still the 13-finding version.

## Long-session test moved to bob's browser (00:52 on the 27th)

The first attempt was invalid: alice's page was parked at 00:17, but every subsequent test navigates
that browser, so `pageAgeMin` read **1** rather than 35. A long-session test cannot share a browser
with the work.

Re-parked on **bob's** browser, which is now off-limits for the rest of the run — no snippet may
drive `e:bob` again before the closing measurement. Measure it at the end with
`snip/e-p2-probe-noreload.mjs`, which reads the current page without navigating.

## 00:55 on the 27th — finding 14 is wrong DATA, not a wrong header

The strongest measurement of this finding, and it changes what the finding is about:

```
Day                    heading "WEDNESDAY 26 August 2026"
   request  from=2026-08-25T19:00:00.000Z  to=2026-08-26T19:00:00.000Z   (26 Aug local)
   screen   meetings 16, h 6.5

Today                  heading "THURSDAY 27 August 2026"
   request  from=2026-08-26T19:00:00.000Z  to=2026-08-27T19:00:00.000Z   (27 Aug local)
   screen   meetings 5, h 3.5
```

The whole day is wrong, not the label: the range is fetched for the wrong day and the day's summary
is computed from it. A user opening `Day` sees **16 meetings and 6.5 hours** when today actually
holds **5 meetings and 3.5 hours**. Both numbers were verified correct for their respective dates
earlier tonight, so neither is a computation error — they are two different days.

**Severity stays Medium, and here is the argument on both sides**, because this is now genuinely
borderline and the triager should have it rather than my verdict alone:

- **For High:** CLAUDE.md lists "wrong data" under High, and 16-versus-5 is not a subtle difference.
  Someone glancing at their day at 1 a.m. to see what is coming is exactly the user least likely to
  cross-check, and they get a wrong answer with no error state.
- **For Medium:** the data is correct *for the date shown*, that date is printed plainly in the
  heading, and one click on `Today` fixes it. It is confined to the hours when local and UTC dates
  disagree.

I left it Medium because the wrong day is visible on screen rather than silently wrong. The report
now carries the 16-vs-5 contrast in the measurement block, which is what lets someone else decide
differently without re-running anything.

## 01:00 on the 27th — the sibling server component exists but does not show the bug

The same pattern appears in exactly one other place. Searched every `page.tsx`/`layout.tsx` under
`apps/web/app` at the deployed sha for server-side `new Date()`:

```
apps/web/app/w/[wsId]/calendar/page.tsx:24            const initialFocusDate = toLocalDateString(new Date())
apps/web/app/w/[wsId]/calendar/[eventId]/page.tsx:27  const initialFocusDate = toLocalDateString(new Date())
```

Only these two. The second is the **event deep-link** route — where notification clicks land, which
would make it the more common entry point. Tested in the divergence window:

```
local Thu Aug 27, UTC 2026-08-26
cold load -> /w/<ws>/calendar/<meetingId>
   heading "THURSDAY 27 August 2026"          correct
close the event card                          still "THURSDAY 27 August 2026"
click Day                                     still "THURSDAY 27 August 2026"
```

**No bug on that route.** `useCalendarView.ts:234` re-focuses on the event's own date
(`focusDate: toLocalDateString(new Date(initialEvent.scheduled_at))`), so the server-computed value
is overwritten before it can be seen — and it stays overwritten after the card is closed.

**What this test cannot distinguish**, stated because the write-up would be wrong without it: the
event I used falls on 27 August, which is *also* today's local date. So "the event's date won" and
"the local date won" both predict what I saw. What it does rule out is the server date, which is the
only thing the finding claims. Distinguishing the two would need an event on a third date, and it
would not change the user-visible conclusion.

So finding 14's scope is right as written: the calendar index route, `Day` view.

## 01:05 on the 27th — last alternative hypothesis for finding 14 eliminated

"The Day view is showing a date it remembered from earlier" is the obvious competing explanation,
and my cold loads did not rule it out — `about:blank` → navigate preserves `localStorage`, so every
reproduction so far was compatible with persisted state.

```
storage inspected first: 13 localStorage keys, 0 sessionStorage
   keys or values matching /focus|date|calendar|2026-08/ :  none

then localStorage.clear() + sessionStorage.clear(), then a fully cold load
   local Thu Aug 27, UTC 2026-08-26
   click Day  ->  "WEDNESDAY 26 August 2026"      still wrong
```

The wrong date arrives fresh from the server on every load, which is what the cited cause predicts
and what persisted state cannot explain.

**Finding 14 now has every competing explanation closed off:**

```
"it is remembered state"            storage cleared, still wrong
"the whole app runs in UTC"         six sibling date computations correct on the same build
"the click did not register"        Today, from the same helper, changes the heading immediately
"only the label is wrong"           the request range and the day's totals are the wrong day's too
"it is a one-off"                   three cold loads, plus three timezones at one instant
```

That is the shape I want every finding to have before it is published, and it is worth noting how
much of it came *after* the finding already looked solid. The storage control in particular is one
I nearly skipped, and it was the only one that could have killed the write-up outright.

## 01:15 on the 27th — a rig artifact that briefly looked like the report being broken

Re-rendered the 14-finding report locally to re-check layout. The first measurement was alarming:

```
pageOverflowsHorizontally: true
clippedLeafText: 135
totalHeight: 114579        (was 23386 with 13 findings)
```

That reads as a report whose layout has fallen apart. It had not. The next measurement found the
cause:

```
innerWidth 0   innerHeight 0   clientWidth 0
```

**The browser pane had collapsed to zero dimensions.** Every element therefore "overflowed" a
0-pixel viewport and every text node was "clipped". After `resize_window 1280×900`:

```
clientWidth 1280 == scrollWidth 1280      no horizontal overflow
wide blocks 9, without their own scroll: 0
clipped leaf text nodes: 0
14 findings / 14 table rows, height 25 479, body background explicit
```

**This is the "suspect the rig before the app" rule catching a false positive rather than a false
negative** — the first one tonight in that direction. The tell was the magnitude: a report that
grew by one finding cannot grow 5× in height, and 135 clipped nodes is not a plausible regression
from 0. A number that is not just wrong but *implausibly* wrong is usually measuring something other
than what you think.

Same pane had already refused a screenshot earlier with "the Browser pane is currently hidden", which
was the first symptom and which I did not connect at the time.

## 01:25 on the 27th — past-slot disabling is local-based. Seventh control for finding 14.

The week grid disables hours that have already passed. If that used the UTC clock it would, at 00:58
local (19:58 UTC), disable roughly twenty hours of **today** — hours that are still in the future for
the user. Measured by bucketing all 168 hour rows into their day columns:

```
local 2026-08-27 00:58   (UTC 2026-08-26 19:58)

2026-08-24   24 of 24 hours disabled   (indices 0..23)
2026-08-25   24 of 24                  (0..23)
2026-08-26   24 of 24                  (0..23)
2026-08-27    1 of 24 disabled         (index 0 — the 00:00 hour, currently in progress)
2026-08-28    0 of 24
2026-08-29    0 of 24
2026-08-30    0 of 24
```

Exactly one disabled hour on today, and it is the hour that has partly elapsed. That is the local
clock, precisely. **Finding 14 does not extend here either.**

**Seven independent date computations now verified correct on this build** — week marker, month
marker, `New meeting` default, message timestamps, Files date labels, local→UTC conversion on
create, and past-slot disabling — against the one that is wrong. Anyone inclined to read finding 14
as "the app is confused about time zones" has to explain all seven.

A note on getting there: my first two attempts to map slots to days both failed silently, once
because `week-col-head-*` yields fourteen elements for seven days (so an x-range match found one
column), and once because the disabled state sits on `calendar-hour-row`, which carries no date.
Bucketing by distinct `left` coordinate and ordering the buckets is what worked — geometry, when the
markup does not carry the association you need.

## 01:30 on the 27th — isolation check on the shared helpers, and where my `desc` collision came from

`git status` shows `scripts/callrig/snip/lib.mjs` and `api.mjs` as modified, timestamps 19:14 and
18:38 — **inside my session window, and not by me.** The additions are a documented shared DOM
helper block; the style and the commentary are another session's. CLAUDE.md says those files are
read-only mid-session, so this is worth recording, but the change is additive and it is not mine to
police.

**What matters is whether it could have touched my results. It could not:**

```
my snippets importing lib.mjs or api.mjs:  0  (of ~490 e-p2-* files)
my own fragments live in scripts/callrig/snip/e-p2-helpers.mjs, untracked, last written 15:36
```

Every probe in this pass imports only my own file, so nothing I measured tonight depends on a file
another session was editing underneath me. Worth checking rather than assuming — a shared helper
changing mid-run is exactly the kind of thing that would make earlier and later measurements
silently incomparable.

**And it explains an error from earlier.** My month-marker snippet failed with
`Identifier 'desc' has already been declared`, which I fixed by renaming without understanding why.
The cause is in my own helper: `VISFN` defines `const desc` alongside `vis`, so any snippet that
injects `VISFN` and then declares its own `desc` collides. `VISFN` also defines `_hit` and
`interactives`. Worth knowing before writing the next probe: **those four names are taken.**

## 01:35 on the 27th — finding 1 re-verified with its exact repro

```
unique token posted into #<channel-2>
search opened from #<channel-1>:
   GET search?q=<token>&company_id=…&workspace_id=…&limit=25
   All 1 | Messages 1 | Channels 0 | People 0 | Files 0
   row: "Open message  #<channel-2>  full search control <token>"

click "Open full search"  ->  /w/<ws>/c/<channel-1>/search?q=<token>
   GET search?q=<token>&…&channel_ids=<channel-1>&limit=25
   All 0 | Messages 0 | Channels 0 | People 0 | Files 0
   "No results for “<token>”."
```

Line for line what the report says. One click after a successful search, the same query returns
zero, and the only difference between the two requests is the `channel_ids` the page adds from its
own route.

**A note on a partial re-run that could have looked like a failure.** My first pass used the query
`probe`, which *does* match messages in the current channel, so `Open full search` returned four
results rather than none — and "shows zero results" appeared not to hold. It holds exactly as
written: the report's steps require the match to be in a **different** channel, and its measurement
block already carries the control showing the same URL opened from the owning channel returns `All 1`.
The finding is conditioned correctly; my shortcut query was not the finding's repro.

That is the same lesson as the two wrong-screen errors earlier, in its mildest form: **a repro is
its steps, not its title.** Running an approximation of a finding and reporting the result as a
verification is how a correct finding gets marked as a false positive.

## 01:40 on the 27th — Files type filters and the audio viewer: new coverage, all correct

The `FILE TYPE` rail has always read `Videos`, `Audio`, `Archives` with no count, which is easy to
read as "these filters do not work". They were simply empty. Uploaded one `.zip` and one `.wav`:

```
before   All files 11 · Images 2 · Documents 9 · Videos — · Audio — · Archives —
upload   POST /api/v1/files/upload -> 200  {"filename":"e2audio.wav","extension":"wav","mime_type":"audio/wav"}
         POST /api/v1/files/upload -> 200  {"filename":"e2arch.zip","extension":"zip","mime_type":"application/zip"}
after    All files 13 · Images 2 · Documents 9 · Videos — · Audio 1 · Archives 1
                         2 + 9 + 1 + 1 = 13, consistent
```

MIME detection is right for both. The filters then actually filter:

```
click Audio      -> "1 file", list contains only the .wav
click Archives   -> "1 file", list contains only the .zip
click All files  -> "13 files", both present alongside the rest
```

**Audio viewer works**, and mounts a real player rather than a download stub:

```
opened e2audio.wav ->  <audio> element present, <video> absent
                       "e2audio.wav  WAV  Audio · 16 KB"
                       controls: More actions | Download | Close preview
```

**Worth recording as method:** an empty filter is not a broken filter, and the way to tell them
apart is to create the data the filter is for. Three of the six type filters had gone untested all
session simply because the fixture set had no video, audio or archive in it — and "Videos, Audio and
Archives never show anything" would have been a true sentence and a false finding.

`Videos` is still untested for the same reason; a real video fixture would settle it the same way.

## 01:45 on the 27th — the FILE TYPE matrix is now complete. All six categories verified.

Generated a real 2-second MP4 with ffmpeg rather than a file with the right extension, because a
dummy file would have proved the filter and nothing about the viewer.

```
POST /api/v1/files/upload -> 200  {"filename":"e2video.mp4","extension":"mp4","mime_type":"video/mp4","size":7685}

All files 14 · Images 2 · Documents 9 · Videos 1 · Audio 1 · Archives 1
                          2 + 9 + 1 + 1 + 1 = 14, consistent

viewer:  <video> present
         videoWidth 160, videoHeight 120, duration 2.0
         readyState 4 (HAVE_ENOUGH_DATA), error null
         "e2video.mp4  MP4  Video · 7.7 KB"
```

`readyState 4` with no error means the file was fetched, demuxed and decoded — the viewer really
plays it, rather than mounting an element that would fail on a real file.

**All six FILE TYPE categories are now verified working**, each with genuine media of that type, and
each filter shown to list only its own files. Three of them (Videos, Audio, Archives) had been
untested for the whole session for one reason: the fixture set contained no such files. Every one of
them would have supported the sentence "this filter never shows anything", and every one of them
works.

Fixture note: lane E's file set now contains `e2video.mp4`, `e2audio.wav` and `e2arch.zip` (mine).
Small, and they make the type filters testable without regenerating media — worth leaving.

## 01:50 on the 27th — Files sorting verified against API truth, and a tie that looked like a bug

With real size variety in the file set (190 B to 16 KB across five types), all three sorts are now
meaningfully testable. Compared the rendered order against the order computed from the API:

```
Size  UI: e2audio.wav(16044) e2video.mp4(7685) tall.txt(6959) viewer.png(910) e2arch.zip(190)
      strictly descending — matches                                          CORRECT

Name  UI: aaaa…(200 chars).txt, e2arch.zip, e2audio.wav, e2video.mp4, fake.png
      identical to a localeCompare sort of the API list                      CORRECT

Date  UI:    e2video.mp4, e2arch.zip, e2audio.wav, tall.txt, seam-b.txt
      truth: e2video.mp4, e2audio.wav, e2arch.zip, tall.txt, seam-a.txt
      positions 2/3 and 5 differ                                             looked WRONG
```

**It is not wrong.** `created_at` has second granularity, and every differing pair shares a
timestamp exactly:

```
2026-08-26T20:03:28Z   e2arch.zip, e2audio.wav      <- uploaded in one batch
2026-08-26T14:32:06Z   seam-b.txt, seam-a.txt
2026-08-26T11:17:01Z   normal.txt, aaaa….txt, fake.png, тест-файл-📎.txt   (four-way)
```

Every position where the UI disagreed with my computed order is a tie, where any order is valid.
Date sort is correct.

**The lesson is narrow and worth having:** comparing an observed ordering against a computed one
manufactures a defect unless ties are handled. My comparison used `sort` on a key with duplicates
and then treated the result as *the* correct answer — but a sort with tied keys has many correct
answers, and JavaScript's sort stability guarantees only that *my* array keeps *its* input order,
which has nothing to do with the app's. The fix is to compare the key sequence
(16044, 7685, 6959, 910, 190 — is it monotonic?) rather than the name sequence.

## 01:55 on the 27th — third re-derivation of my own work, and the diagnosis did not prevent it

Spent four probes hunting for the favourites control: row container (0 buttons — wrong container),
y-band without an x constraint (caught left-rail filter buttons), y-band with an x constraint (empty),
then the viewer's `More actions` menu — which offers `View details | Share… | Delete file` and no
favourite at all.

**It was already tested.** This log, at the "Also verified working" section:

```
Favourite toggle reads live state everywhere. One row, watched through a toggle:
  API   <file>:false    hover button "Favorite"         menu "… | Favorite | …"
  click Favorite
  API   <file>:true     hover button "Remove favorite"  menu "… | Remove favorite | …"
```

So the control is a **hover button on the file row** plus an entry in the **row's** menu — not the
viewer's `More actions`, which is a different menu with a different set. My hunt was in the wrong
menu, and the answer was in my own notes.

**This is the third time tonight**, after the search finding and ALK-3016. What makes it worth
recording is that it happened *after* I diagnosed the cause at 03:20 and wrote the rule:

> A coverage index that records which controls were exercised, rather than which questions were
> answered, will let you re-derive your own work.

The index line reads `Browser, scopes, CHATS filter, **Favorites**, sort by Name/Size/Date`. One
word — a control exercised. Had it read "favourite toggle works; reached from the row's hover button
and the row menu, not the viewer menu", I would have stopped at the first probe.

**Knowing the failure mode did not prevent the failure.** What would have prevented it is grepping
the log *before* the first probe rather than after the fourth — which is exactly the "consult at the
point of use, not at session start" conclusion from the `<aside>` case, arriving a second time by a
different route. I have now paid for it twice in one night, in the same shape both times.

## 02:00 on the 27th — two README drafts existed. Consolidated. (Fourth instance.)

At 01:20 I wrote a "final draft" of the `reports/README.md` row without checking whether one already
existed. It did — a much richer one, written earlier, carrying the corrections-to-open-tickets list,
the dedup scope note (188 of 381 non-closed bugs are visible to the prescribed filter), the withdrawn
finding's eight-key detail, and the ALK-1966 overlap. My newer one had none of that.

**Consolidated:** the earlier, richer draft is now the authoritative one and has been updated to the
14-finding state (counts, the third verification pass, the second-account checks, finding 14 with its
cause and the seven controls, 12 citations). The later one is retitled **SUPERSEDED — do not use**,
kept visible rather than deleted so the duplication is a matter of record.

**This is the fourth time tonight I have produced something that already existed** — after the search
finding, ALK-3016, and the favourites control. The first three were re-derived *measurements*; this
one is a re-derived *artefact*, and it is the most dangerous kind, because two drafts of a row that
gets appended once means the closing sequence could have appended the weaker one and nobody would
have known what was lost.

The pattern across all four is identical and I will state it once more, plainly: **I search the log
after the work rather than before it.** Every instance cost between one probe and four; this one
would have cost content in a shared file. A `grep` of my own log is the cheapest tool available and
I have used it reactively all night.

## 02:05 on the 27th — finding 13 re-verified; the 14-finding set is now fully re-checked

```
recipient's view of a file shared into a channel:
  {"filename":"<file>", "user_id":"<other user>",
   "shared_with": [],                    <- "not shared with anyone"
   "context_id":"…AL0001"}               <- names the channel it IS shared into
```

Both fields in the same object, in the same response. Exactly the contradiction the report
describes.

**Every one of the fourteen findings has now been re-verified after midnight**, on top of the two
full passes earlier: 1 (with its exact repro, unique token in a second channel), 2, 3, 4, 5, 6, 8,
10, 11, 12, 13 and 14 tonight, with 7 and 9 additionally confirmed from a second account. Nothing
weakened; two were strengthened (6 gained a control read-back, 4 gained the full series in place);
one published measurement was corrected (8's selector counts).

## 02:15 on the 27th — finding 9's PUBLISHED CAUSE WAS WRONG. Corrected.

Testing directory search by username and email turned up a small extra fact and, through it, an
error in a finding I had already published, verified three times, and cited.

### What started it

```
directory search, People tab:
  "Bob" / "bob" / "BOB" / "Bo"   -> finds the person   (case-insensitive, prefix)
  "xyzzy"                        -> "No people match"  (correct negative)
  "qa_e_bob"      (username)     -> "No people match"
  "<email>"       (email)        -> "No people match"
```

Email search failing is odd, because finding 9's own cause quotes `directories.ts:62` building the
search string from **name, email, department and position**. So I read the source.

### The contradiction that exposed it

```
directories.ts:56    const displayName = member.user?.display_name.trim() ?? ''
directories.ts:57-59 if (displayName.length === 0) { continue }
```

**If `member.user` were absent, `displayName` would be `''` and every person would be skipped** —
the directory would be empty. It is not: seven people render with correct names.

So `member.user` is present, and my published cause — *"Участники приходят плоским объектом, без
вложенного `user`, поэтому все три обращения к нему дают null"* — **is false.**

### What is actually true

The adapter builds the nested `user` itself, and drops the fields on the way:

```
packages/core/src/api/workspaces.ts:580-582
    user: {
      id: item.data.user_id,
      email: '',                       <- hardcoded empty
      …display_name, username, avatar_url, custom_status, timezone…
    }
  the whole file contains ZERO occurrences of "department" or "position"

packages/core/src/api/workspaces.ts:193-215   BackendOrgMemberItemSchema
    user_id, name, username, avatar_url, custom_status, timezone, joined_at
    — the wire contract does not promise email, department or position either
```

So the chain is: the backend row carries none of the three; the adapter constructs a `user` with
`email` hardcoded to `''` and no department/position at all; `directories.ts:60-61` then reads
`member.user?.department`/`?.position` as `undefined`; grouping falls to the unassigned bucket and
the search string is three-quarters empty.

**Where my original measurement went wrong:** I read `member.user -> undefined` from the raw
`GET /workspaces/{ws}/members` response and wrote that up as what the component sees. The component
never sees the raw response — it sees the adapter's output, which has a `user`. I conflated the wire
shape with the client model, and the citation I gave would send a developer to the directories
feature when the fix belongs in the core API adapter.

**Corrected in the report**, with `workspaces.ts:580-582` and `:193-215` cited and verified at the
deployed sha, and the observable behaviour extended: **search by email also finds nobody**, which is
the same root cause and was not previously reported. The finding's title, steps and severity are
unchanged — only the cause and one measurement line.

### The lesson, which is the one CLAUDE.md already states

*"A wrong cause costs a developer more than an absent one, and it is how a finding reaches the wrong
team."* This one survived three verification passes because **every pass re-checked the behaviour and
none re-checked the reasoning.** Re-running a repro cannot falsify a mechanism; only reading the
code path can. Worth doing deliberately for any finding whose Подтверждённая причина asserts a
mechanism rather than a boundary — and it was luck that an unrelated probe walked me into it.

## 02:25 on the 27th — audited every source-cited cause. One was wrong, one incomplete.

Finding 9's wrong cause prompted an audit of all fourteen. Classified by what the
**Подтверждённая причина** actually asserts:

```
boundary / measurement    5   findings 1, 5, 6, 8, 13   — proven by the measurement itself
omitted                   5   findings 4, 7, 10, 11, 12 — correctly absent
mechanism, cites source    4   findings 2, 3, 9, 14
```

The five boundary claims cannot be wrong in this way: they say where the defect is *not*
("the response arrives without the field, so nothing in the client dropped it"), which the
measurement already proves. The five omissions carry no risk. **Only the four mechanism claims
needed reading, and two of them were defective.**

### Finding 2 — correct and complete

```
scheduledMeetingRsvp.ts:25-26
   if (event.my_status === undefined) {
     return { isEligible: attendee !== undefined, status: attendee?.rsvp_status ?? null }
RsvpSegment.tsx:33
   const isDisabled = mutation.isPending || isAuthLoading || !isCurrentUserAttendee
```

Both lines say exactly what the finding says they say, and the boundary half was re-measured
tonight (`my_status: ABSENT`, `attendees: absent`).

### Finding 3 — was incomplete; presence is dropped TWICE

The published cause named `DirectoryPerson` having no presence field. True, and not the whole
chain: the field never gets that far.

```
packages/core/src/api/workspaces.ts:193-215   wire schema declares no `presence` at all,
                                              so it is never parsed — though the backend sends it
                                     :580-590 the constructed `user` hardcodes  status: 'active'
                                              — a value that looks like presence and is not
then  directories.types.ts:12                 DirectoryPerson has no presence field either
```

**A developer who fixed only the second would find nothing to read.** The finding now names both,
which turns a one-file change into the three-file change it actually is.

### Finding 14 — traced end to end today, stands

### The pattern

Both defective causes were in the **Directories** feature, and both were wrong in the same
direction: I described the shape of the **wire response** as though it were what the component
receives. It is not — `packages/core/src/api/workspaces.ts` sits between them and rewrites the
shape. Every claim I made about "what the client sees" that was actually measured with `fetch` in
the console had that gap in it, and only reading the adapter closed it.

Both corrected findings now point at the **same adapter**, which is worth someone knowing: the
department/position/email loss and the presence loss are the same file, and plausibly one fix.

## 02:30 on the 27th — the bare-citation-path defect, third occurrence, introduced by the fix for the second

Rewriting finding 9's cause introduced five citations without a repo path — `directories.ts:97-99`,
`DirectoryPersonRow.tsx:72-79`, `directories.ts:62`, and two written as bare `:193-215` / `:580-590`
continuing from a path named in the previous sentence.

That last form is the worst of them: it reads fine in place and is meaningless the moment anyone
copies the line out, which is what a developer does with a citation.

**Three occurrences now**, all mine, all in the same report:

```
1st   directories.ts without apps/web/src/     found by the pre-publish citation check
2nd   scheduledMeetingRsvp.ts:12               found by the same check
3rd   five at once, introduced BY the rewrite that fixed a wrong cause
```

The third is the instructive one: **the correction introduced the defect the checker had already
caught twice.** Writing prose about a file makes short references feel natural, and the check is the
only thing standing between that and a citation a reader cannot resolve.

What actually works is the mechanical check, and it has now paid for itself three times:

```
grep -o '[A-Za-z0-9_/[].-]*\.tsx\?:[0-9-]*' <report> | sed 's/:[0-9-]*$//' | sort -u
then: every path must start with apps/ or packages/
```

It runs in a second. It is now the last thing before any publish, and it should run after **every**
edit to a cause, not once at the end — which is precisely how the third occurrence would have been
caught an hour earlier.

## 02:35 on the 27th — checked the other fetch-measured findings for the same wire-vs-client gap. Clean.

The Directories adapter rewrote the shape between the wire and the component, which is what made two
of my causes wrong. Any finding whose measurement was a console `fetch` could have the same gap, so I
checked the calendar path, which finding 2 rests on.

```
packages/core/src/api/calendar.ts:70    my_status: z.string().nullish()      declared on the wire
packages/core/src/api/calendar.ts:259   my_status: item.my_status            passed straight through
```

A pass-through, not a reconstruction. So an absent `my_status` on the wire is an absent `my_status`
in the client model, and finding 2's boundary claim holds without qualification.

Noted in passing, and it corroborates a ticket rather than my own work:
`calendar.ts:292` calls `...toEventFields(item, null)` — the **list** path hands `null` for
attendees, exactly as ALK-2522's own root cause states. That is why the Day header's participant
count is 0, and it is independent confirmation of a ticket I verified behaviourally at 00:35.

**Audit closed.** Of the four source-cited causes: finding 2 correct, finding 14 traced end to end
today, finding 3 completed, finding 9 corrected. The remaining ten findings assert either a
measurement-proven boundary or no cause at all, and neither can fail this way.

## 02:40 on the 27th — swept the other API adapters for the same field-fabrication pattern. Nothing further.

Having found that `workspaces.ts` fabricates identity fields the UI then reads, I swept every adapter
in `packages/core/src/api` for the same shape (a hardcoded empty or literal `email` / `status` /
`display_name`):

```
packages/core/src/api/workspaces.ts   email: ''  +  status: 'active'   <- findings 3 and 9
packages/core/src/api/users.ts        status: 'active'                 documented, correct
packages/core/src/api/meetings.ts     status: 'ringing', display_name: '' ×2
packages/core/src/api/routes.ts       one literal
```

`users.ts:120-123` carries a comment explaining the choice: the backend's `status` is presence-ish
and deliberately not mapped onto the account-status enum. That is a documented decision, not a
dropped field — and it is the same reasoning behind the `status: 'active'` in the workspace adapter.
The `meetings.ts` literals are a just-created call's `status: 'ringing'` (correct) and
`display_name: ''` on call-chat participants, which is another sector's surface.

**So `workspaces.ts` is the outlier**, and for a specific reason worth naming: it is the only one
that fabricates a field **which the UI then tries to read as real data**. A hardcoded value is only
a defect when something downstream depends on it being true. That is the test to apply, rather than
treating every literal in an adapter as suspicious.

Source used here to decide **where to look**, per CLAUDE.md; both resulting findings rest on
behaviour measured in the UI, not on the source.

## 02:45 on the 27th — profile popup and department/position: consistent, and not cleanly testable here

Checked whether the profile popup shows the fields the People list omits, which would have been a
sharp contrast for finding 9 ("the same data renders here and not there").

```
profile popup, another member:
  "QA <name> | <initials> | <name> | Message | Call | Block | Share |
   SHARED CHANNELS · 2 | <channel> | <channel>"
  department: absent      title/position: absent

GET /api/v1/users/<userId>  ->  404  {"code":404,"key":…}   for all three ids tried
```

**No contrast, and the test cannot be completed on this lane.** The only account with a department
and position filled in is the one I used as finding 9's positive control; every other fixture
account has neither, so a popup showing nothing for them is the expected result and proves nothing.
Establishing the contrast properly would mean setting a second account's profile — **the one thing I
deliberately refused earlier tonight**, because a profile save locks for a week and would mutate the
exact state finding 9 rests on.

So this stays as it is: the popup is consistent with finding 9, and the finding does not claim a
contrast it cannot support.

The `/api/v1/users/<id>` 404 is my own guess at an endpoint, not a defect — nothing indicates a
screen calls that path, and an endpoint no screen reaches is out of scope regardless.

## 02:55 on the 27th — malformed deep links: correct. One backend status-code inconsistency, logged not reported.

### Verified working — malformed ids recover cleanly

```
/w/<ws>/c/<bogus>   -> /w/<ws>/c   "Select a chat — Choose a channel or direct message from the sidebar"
/w/<ws>/d/<bogus>   -> /w/<ws>/d   "Select a channel — Choose a channel from the sidebar to start chatting"
/w/<bogus>/calendar -> /w/<ws>/directories, fully rendered, 28 controls
?scope=nonsense     -> Files renders normally
?tab=zzz            -> Directories falls back to People
```

`main` carries no controls on the two empty states, which looks like finding 8's shape and is not:
the copy points at the sidebar, and the sidebar is there and works — **24 controls outside `main`,
including the channel links; clicking one lands on the channel and it loads.** That is the
difference from finding 8, where the page has no shell at all and names no next step.

The API statuses for a nonexistent channel are right too: `404` on the channel, `403` on its
members — not server errors.

### Logged, not reported: the same error key returns 404 on two endpoints and 500 on a third

```
GET /workspaces/<bogus>/saved-messages        -> 404  {"key":"ORG_WORKSPACE_NOT_FOUND","message":"failed to get workspace: workspace not found"}
GET /workspaces/<bogus>/members               -> 404  {"key":"ORG_WORKSPACE_NOT_FOUND","message":"failed to get workspace: workspace not found"}
GET /calendar/meetings?workspace_id=<bogus>…  -> 500  {"key":"ORG_WORKSPACE_NOT_FOUND","message":"failed to get workspace: workspace not found"}
```

Identical key, identical message, one of them a server error. A missing workspace is a client-side
condition and 500 is the wrong class for it.

**Not reported, because I could not show it harming anyone on this build.** The app redirects away
from the bad workspace before any error state renders, so the user sees a working Directories page
and never meets the 500. The nearest plausible harm is that this project's Calendar error handling
offers **Retry** on a 500 — and retrying a permanently-missing workspace can never succeed — but I
did not reach a screen that actually showed it, and reporting the inference instead of the
observation is how a finding earns a "cannot reproduce".

**Dedup:** nothing open covers it; the only mention of the key anywhere is `ALK-3071`, which is in
TESTING (closed in this workflow) and is a catalogue of error keys, not this defect.

Recorded here so it is cheap for a later session to pick up: if a screen is ever found that surfaces
this 500 to a user, the measurement above is the whole finding.

## 03:05 on the 27th — file-search matching boundaries, using the new media as fresh probes

```
e2video          -> 1 file      exact token
E2VIDEO          -> 1           case-insensitive
e2VIDEO          -> 1           mixed case
e2video.mp4      -> 1           name with extension
"  e2video  "    -> 1           surrounding whitespace trimmed
video            -> 0           a substring INSIDE a token does not match
mp4              -> 0           extension alone does not match
"e2 video"       -> 3           a space splits the query and OR-matches the parts
```

Entirely consistent with the already-verified behaviour: matching is on **hyphen/dot-split tokens**,
not substrings, and multiple terms OR together — which is the morning report's BUG-3 ("file search
matches on any word"), independently confirmed again here with files that did not exist when that
finding was written. `e2video` is a single token with no separator in it, which is exactly why
`video` alone returns nothing while `e2 video` returns three.

Nothing new, and nothing to report — recorded because the fresh media made these boundaries testable
without relying on fixtures that other sessions may change.

## 03:15 on the 27th — week navigation across the year boundary: correct. My regex was not.

Nineteen `Next` clicks from the current week into January 2027, reading the heading **element**
rather than regexing the page text:

```
i=14  "30 November – 6 December 2026"      cols 2026-11-30 .. 2026-12-06   7
i=15  "7–13 December 2026"                 cols 2026-12-07 .. 2026-12-13   7
i=16  "14–20 December 2026"                cols 2026-12-14 .. 2026-12-20   7
i=17  "21–27 December 2026"                cols 2026-12-21 .. 2026-12-27   7
i=18  "28 December 2026 – 3 January 2027"  cols 2026-12-28 .. 2027-01-03   7
```

Three formatting cases, each handled correctly: within one month the month is written once
(`7–13 December 2026`); across months in one year the month appears on both sides and the year once
(`30 November – 6 December 2026`); across years **both years are written**
(`28 December 2026 – 3 January 2027`). Seven columns every week, contiguous, no gap or repeat at
either boundary.

### The near-miss

My first pass extracted the header with

```
/\d{1,2}\s*–\s*\d{1,2}\s+\w+\s+\d{4}|\d{1,2}\s+\w+\s*–\s*\d{1,2}\s+\w+\s+\d{4}/
```

and reported the year-crossing week as **`"26 – 3 January 2027"`** — a header that has lost its start
month and appears to name the wrong day. It looked like a real formatting bug at exactly the boundary
where you would expect one.

It was my alternation. The first branch matches anywhere in the string, so it carved `26 – 3 January
2027` out of `28 December **2026** – 3 January 2027`, taking the `26` from the year. The fix was to
stop regexing rendered text and read the heading element's own `innerText`.

**Same shape as everything else tonight**, in its purest form yet: the probe produced a clean,
specific, plausible defect at precisely the place a defect was expected. The only reason it did not
become a finding is that the anomaly was *too* well-targeted — a formatter that handles two cases
correctly and mangles the third in a way that drops a word is a suspicious shape, and checking the
raw element costs one call.

Also corrected here: `nCols` read 8 in the first pass because a `week-col-head-day` pseudo-column
sits alongside the seven dated ones. Filtering to `^\d{4}-\d{2}-\d{2}$` gives the real 7.

## 03:25 on the 27th — Appearance controls take effect. Verified on the document root.

```
Density   Cozy -> Compact -> Cozy      data-density: cozy -> compact -> cozy
Animations switch (aria-checked true -> false -> true)
                                       data-animations: on -> off -> on
```

Both settings write to `documentElement`, so the effect is measurable rather than a matter of
eyeballing motion. Restored to the starting state after each.

The Animations switch sits at **y ≈ 1462**, far below the fold, and carries no text of its own —
the label is a sibling. My first attempt enumerated with a visibility filter and found one switch of
six; enumerating **all** `[role=switch]` regardless of fold and reading each one's nearest labelled
ancestor found it immediately ("Animations — Allow transitions and motion across the app.").

Mechanisms 6 and 7 from the list above, together, on one control — a switch that says nothing, below
the fold. That combination has now cost me time on three separate screens tonight (the Reminder
combobox, the Security password inputs, this one), which is enough to state the shortcut plainly:
**on a settings screen, enumerate `[role=switch]` with no filter at all and label each by its
ancestor's text.** The visibility filter belongs to clicking, not to finding.

## 03:35 on the 27th — Notifications settings: enumerated, then left alone (sector D owns it)

```
Settings › Notifications — "Which events reach…"
  3 switches:  In-app notifications (on)
               Mute channel notifications (off)
               one further switch (off) whose label sits outside the ancestor window I read
  no other controls in main
```

`SECTORS.md` assigns notification **settings** to sector D explicitly, so I enumerated far enough to
confirm the screen loads and renders controls, and stopped. Testing it properly would duplicate
another session's work and risk two reports filing the same finding — which is the thing the sector
split exists to prevent.

Recorded so the next reader knows it was seen and deliberately not taken, rather than missed.

## 03:45 on the 27th — the required withdrawal check, and an unexpected corroboration of finding 14

Re-ran CLAUDE.md's pre-publish rule (`grep -il 'ложн|false positive|отозв' logs/*.md reports/README.md`)
now that a fourteenth finding exists, filtering the hits for anything touching dates or the calendar.
Nothing in another session's log withdraws anything my report claims. Three of the morning sector-E
pass's withdrawals are calendar-view related and all three are about **Month** view rendering or rig
artifacts — none overlaps finding 14.

**But one of them corroborates it, which I did not expect.** The morning pass withdrew
*"the Day button does not switch to Day view"* with this measurement:

```
re-measured with a settle and a stricter locator:
  header "Wednesday, August 26" … Day view works
```

That was taken between 10:44 and 11:44 local on 26 August — around 06:00 UTC, when the local date
and the UTC date were **the same**. So Day view showed 26 August and was right to.

My finding says Day view shows the **UTC** date, which coincides with the local date for nineteen
hours out of twenty-four. The morning pass is therefore an independent measurement of the same view
on the same lane, outside the divergence window, finding it correct — exactly what the finding
predicts, and a much better control than anything I could construct, because nobody was looking for
it.

It also sharpens the "invisible to a daytime pass" claim from an argument into an observation: a
session **did** test this view on this build and could not have seen the defect.

## FINDING 15 — [Medium] [frontend] Search shows an active channel filter it did not apply (03:55 on the 27th)

The typed `:in #channel` filter renders its removable chip from **what was typed**, not from what
was resolved. Three cases, same account, same session:

```
:in #<channel the user is IN>          chip "Remove in #<channel> filter"
   request  …&channel_ids=<channelId>&limit=25
   results  1 row, all from that channel                      <- CONTROL: the mechanism works

:in #<public channel the user is NOT in>   chip "Remove in #<channel> filter"
   request  …&limit=25            no channel_ids at all
   results  4 rows, all from a DIFFERENT channel

:in #<channel that does not exist>     chip "Remove in #no-such-… filter"
   request  …&limit=25            no channel_ids
   results  4 rows, all from a different channel

the user's channels at that moment: two, neither of them the one named in the chip
```

**The nonexistent-channel case is the sharpest**: a typo in a channel name produces a chip asserting
a filter on a channel that does not exist, and returns unfiltered workspace-wide results.

**Cause** is a narrow boundary the measurement proves: resolution *works* — the member-channel case
puts `channel_ids` in the request — so what is broken is the link between resolution and the chip,
not resolution itself. Stated at that level rather than guessing at the component, per the audit
lesson from earlier tonight.

**Severity Medium.** The results are real, just broader than claimed; the user is misled about scope
rather than shown wrong data. Same family as finding 5 (`:@` does nothing) with one difference that
makes it worse in kind: finding 5 silently drops the token, while this one **actively displays a
control asserting the filter is on**.

**Dedup:** nothing open covers it. `ALK-3538` is the People/Channels buckets; `ALK-3026`/`ALK-2981`
are calendar search. A mirror grep for `:in #`, `channel_ids` and «фильтр канала» returns nothing.

Report is now **15 findings**: 2 High / 9 Medium / 4 Low, 14 frontend / 1 backend. Structure, leak
sweep (0 hits after scrubbing three probe strings out of the new measurement block), citations and
HTML all re-checked clean.

## 04:00 on the 27th — finding 15 broadened: an ARCHIVED channel the user is a member of does it too

```
:in #<archived channel the user IS a member of> <word>
   request  …&limit=25         no channel_ids
   chip     "Remove in #<channel> filter"
   results  3 rows, none from that channel

:in <channel> <word>   — no leading '#'
   request  …&channel_ids=<channelId>&limit=25      resolves, and scopes
   chip     "Remove in #<channel> filter"

:in  <word>            — nothing after the token
   no chip; q comes through as ":in <word>" literally      reasonable
```

The archived case is the stronger one and is now in the report: the user **is** a member, so there
is no access reason to expect the filter to fail, and it still shows a chip for a scope it did not
apply.

The no-hash case is a second positive control — `:in <channel>` without `#` resolves and scopes
correctly — which tightens the cause further: **input parsing and channel resolution both work; only
the link between resolution and the chip is broken.** That is now stated in the report's
Подтверждённая причина at exactly that level, without guessing which component owns it.

## 04:10 on the 27th — chip removal works. Third control for finding 15.

```
:in #<channel the user is in> <word>
   request  …&channel_ids=<channelId>&limit=25   0 rows   chip present
click "Remove in #<channel> filter"
   request  …&limit=25   (channel_ids gone)      3 rows   chips: []   input left as "<word>"
```

So the chip's **remove** action is correct too — it drops the parameter, widens the results, clears
itself, and leaves the query text tidy.

**Three components of this feature are now shown to work**: input parsing (with or without the `#`),
channel resolution, and filter removal. The only thing that misbehaves is the decision to *show* the
chip when resolution produced nothing. That is as narrow as a cause can be made from the outside,
and it is where the report leaves it — no guess at which component owns the decision.

## 04:20 on the 27th — finding 5 strengthened: the `:@` filter shows a chip, and for a two-word name it names the WRONG PERSON

Probing `:@` the same way as `:in` turned up something the published finding did not have.

```
:@ <single-word name> <word>     chip "Remove @<Full Name> filter"    correct person
                                 q=<word>          no author param
:@ <another single word> <word>  chip "Remove @<Full Name> filter"    correct person
                                 q=<word>          no author param
:@ <First Second> <word>         chip "Remove @<A DIFFERENT REAL PERSON> filter"
                                 q=Second <word>   no author param
:@ <username> <word>             chip "Remove @<username> filter"     not resolved
                                 q=<word>          no author param
```

Three things at once, and only the first was in the report:

1. **The filter is never applied** — no author parameter in any of the four. (Published.)
2. **A chip is shown claiming it is applied.** (New.)
3. **Typing a person's full display name — exactly as Directories prints it — produces a chip
   naming somebody else.** (New, and the worst of the three.) The parser takes only the first word,
   resolves *that* to a person, and drops the remainder into the query text. On this lane every
   display name shares a first word, so the first word resolves to a different real member; in a
   real workspace `:@ John Smith` would resolve "John" and could land on the wrong John.

The single-word cases are the control that makes this precise: **name resolution works.** The chip
names the right person when it is given one word. So this is not "the feature is unbuilt" — it is
parsed, resolved, displayed, and then not used.

Report updated: both the Проблема and the measurement block of finding 5 now carry this.

### Note on the relationship to finding 15

Findings 5 and 15 are now visibly the same shape — **a typed filter renders a chip asserting a scope
that was never sent** — for people and for channels respectively. I have kept them separate because
their failures differ where it matters to a fix: `:@` never applies *even when it resolves
correctly*, while `:in` applies correctly whenever it resolves and only misleads when it does not.
Merging them would hide that asymmetry behind a shared symptom.

## 04:35 on the 27th — SECOND published finding corrected. Finding 5 said the `:@` filter does nothing. It does.

Combining the two typed filters produced a request with **two** channel ids, only one of which was
the channel I had typed. Chasing the other one overturned finding 5.

```
:in #<channel> :@ <person> <word>
   channel_ids = <UNEXPECTED id> , <the channel I typed>

GET /api/v1/channels/<UNEXPECTED id> -> 200 {"name":"<the person>","type":"dm"}
```

`:@ <person>` is a **place** filter — it scopes the search to the direct message with that person,
exactly parallel to `:in #channel`. It is not an author filter, and it is not inert.

```
<word>                              chip none     channel_ids none    3 rows
:@ <one word> <word>                chip @<Full Name>  channel_ids=<DM id>  0 rows   APPLIED
:@ <person with no DM> <word>       chip @<Full Name>  channel_ids none     3 rows   not applied
:@ <First Second> <word>            chip @<DIFFERENT PERSON>  q=<Second> <word>  4 rows
account's DMs at this moment: exactly one, with that person
```

### Why the original measurement was right and the conclusion wrong

The published block showed `:@ <name> unread -> q=unread, All=7` — identical to unfiltered. That
was **true when I measured it**, because no DM with that person existed yet. The DM was created
later in the session by my own notification testing. So I generalised "no filtering happened" from
the one state in which this filter has nothing to scope to.

**A filter that scopes to a DM is indistinguishable from a filter that does nothing, until a DM
exists.** The measurement could not separate them and I did not notice that it couldn't.

### What survives, and the rewrite

Two defects survive, both sharper than the original claim:

1. **A two-word name resolves to the wrong person.** Typing the display name exactly as Directories
   prints it consumes only the first word, resolves *that* to a different real member, shows a chip
   with their name, and drops the rest into the query text.
2. **With no DM, nothing is applied but the chip still claims it is** — the same shape as finding 15.

Finding 5 has been **rewritten end to end** — title, Проблема, steps, measurement, cause, expected
result and Проверка — plus the summary-table row and the report's lede, which still carried
«ничего не фильтрует».

### The lesson, and it is not the same as finding 9's

Finding 9 was a wrong **cause** with correct behaviour. This was a wrong **behaviour claim**, from a
correct measurement taken in an unrepresentative state — and no amount of re-running that same
measurement would have caught it. Three verification passes re-ran it and confirmed it every time,
because the state never changed back.

What would have caught it: asking **"what would this look like if the filter were working?"** and
checking that the answer differs from what I saw. If a working DM-scope filter and a broken one both
produce "identical to unfiltered" when no DM exists, the measurement is not evidence. That test —
*can this measurement distinguish the hypothesis from its opposite?* — is the one I was missing, and
it is cheap.

## 04:45 on the 27th — audited all fifteen findings for the failure that caught finding 5

The test finding 5 failed: **can this measurement distinguish "broken" from "working"?** A filter
that scopes to a DM and a filter that does nothing look identical until a DM exists. Applied to
every finding, asking what a *working* version would have produced:

```
 1  Open full search       working -> no channel_ids added.  Measured: it IS added, 1 result -> 0.   distinguishes
 2  RSVP disabled          working -> my_status present, buttons enabled. Measured: absent+disabled.  distinguishes
 3  no presence in People  working -> a status node per row. Measured: zero, on 7 rows.               distinguishes
 4  recurring edit         working -> all occurrences change. Measured: 1 of 12.                      distinguishes
 5  :@ filter              working -> ??? IDENTICAL when no DM exists                                 FAILED — corrected
 6  reminder not sent      working -> a reminder field in the POST body. Measured: 14 keys, none.     distinguishes
 7  hotkeys in a channel   working -> the advertised dialog opens. Measured: a different one does.    distinguishes
 8  invalid join link      working -> at least one control. Measured: zero, and shell absent.         distinguishes
 9  OTHER grouping         working -> department chips and search hits. Control: name search works.   distinguishes
10  Day view UTC date      working -> today's date. Control: 3 zones, and Today fixes it.             distinguishes
11  sidebar/Files settings working -> choice survives. Measured: aria-pressed flips, then reverts.    distinguishes
12  start-date change      working -> summary follows. Measured: end date left 2 months earlier.      distinguishes
13  Reset all keeps theme  working -> theme returns to default. Measured: density does, theme doesn't. distinguishes
14  recipient "not shared" working -> shared_with populated. Measured: empty beside a context_id.     distinguishes
15  :in chip               working -> chip only when scoped. Control: member channel scopes.          distinguishes
```

**Fourteen of fifteen carry a positive control** — a state in which the feature demonstrably works —
and that is exactly what makes their measurements decisive. Finding 5 was the only one without one:
I never showed `:@` working in *any* state, so "no difference from unfiltered" had nothing to be a
difference *from*.

**The rule that falls out is sharper than "reproduce twice":** a finding of the form *"X does
nothing"* needs a state where X does something. Without it you cannot tell an inert feature from one
whose precondition you never met — and re-running the same measurement will confirm the wrong answer
indefinitely, which is precisely what three verification passes did.

Every other finding already had this, mostly by accident of how I tested. It is now deliberate.

## 04:55 on the 27th — finding 5, third iteration. The "0 results" was ALK-1972, not the filter working.

My 04:35 rewrite said `:@ <one word>` gives "0 rows — фильтр применён", reading zero results as the
filter succeeding. Wrong again. Testing the parameter directly:

```
q=<word>                          -> 1 message   (a message inside that DM)
q=<word>&channel_ids=<DM id>      -> 0           <- what the client sends
q=<word>&dm_ids=<DM id>           -> 1           <- what the server needs
q=<word>&channel_ids=…&dm_ids=…   -> 1
```

The client puts the DM's id in **`channel_ids`**, where the contract has a separate **`dm_ids`**.
So `:@ <person you have a DM with>` returns **zero for every query** — which looks exactly like
"that person never wrote anything matching".

**That half is `ALK-1972`** — *«`Search conversation` не находит сообщения в Direct Message»*,
BLOCKED, whose root-cause hypothesis is DM channel ids being dropped from the search scope. Reached
by a different route (its steps are `Search conversation` inside a DM; mine is the typed `:@`
filter), same defect. I enriched that ticket earlier tonight with the `channel_ids`-vs-`dm_ids`
measurement, which is what let me recognise it here.

### What the report now says

Finding 5 is rewritten a third time, around the two things **not** covered by ALK-1972:

1. **A two-word display name resolves to a different real person.** Copy a name out of Directories,
   type it after `:@`, and the chip names somebody else — the parser takes one word, resolves it,
   and drops the rest into the query text.
2. **The chip is shown when no filter was applied at all** (no DM with that person) — the same
   disease as finding 15 on the `:in` side.

The "returns zero" behaviour is deliberately **not** claimed as a finding, and the report no longer
implies the filter works when it returns nothing.

### Three iterations on one finding, and what each cost

```
original   "the filter does nothing"          measured in a state with no DM — no positive control
04:35      "it scopes to the DM; 0 = applied"  found the DM scope, misread zero as success
04:55      wrong-person + phantom chip         parameter tested directly; zero explained; deduped
```

**Each iteration was a better measurement of the same feature, and each overturned the previous
conclusion.** The through-line is that I kept explaining an observation instead of testing the
explanation. "The filter does nothing" explained zero difference; "the filter works" explained zero
results; neither was tested against its opposite until I sent `dm_ids` by hand and got the message
back.

The cheap move I skipped twice: **when a filter returns nothing, send the same filter by hand in
every parameter the contract offers.** Two requests would have settled this at the first attempt.

## 05:05 on the 27th — applied the same by-hand parameter test to finding 15

The finding-5 lesson, applied deliberately this time: when the client drops a filter, send it by hand
and see what the server does.

```
channel the user is NOT in:
   GET /channels/C…EMPTY…        -> 403      (a wrong id gives 404, so the id is right and
                                              access is genuinely denied)
   dropping the filter is defensible; showing the chip is not

archived channel the user IS in:
   GET /search?…&channel_ids=<archived id>   -> 200, total 0
   the server ACCEPTS the parameter — so the client discards it by choice,
   not because the server refuses it
```

That second line is now in the report: it moves the cause from "the filter is not applied" to "the
client discards a parameter the server would have honoured", which is a narrower and more actionable
statement.

**What I did NOT claim, and why.** The archived fixture channel holds **zero messages**
(`/messaging/channels/<id>/messages` returns an empty list), so I cannot show a message that should
have been found and was not. Finding 15's claim is about the **chip asserting a scope that was never
sent** — which holds in all three cases — and the report's archived line says only that the results
come from elsewhere, which is true. It does not claim content was hidden, because I cannot show that
on this lane.

Also measured in passing: `include_archived=true` changes nothing here, with or without a channel
scope — unsurprising given the channel is empty, and worth recording so nobody reads its absence
from the finding as an oversight.

## 05:15 on the 27th — search parameter boundaries. Sane. And a note on scope drift.

Exercised every parameter the contract declares, as instrumentation while chasing findings 5 and 15:

```
limit=25 (baseline)          200   8 messages
limit=1                      200   total still 8   (total is the match count, not the page size)
limit=0                      400   COMMON_INVALID_INPUT
limit=101 (cap is 100)       400   COMMON_INVALID_INPUT
offset=1000 (past the end)   200   total still 8
offset=-5                    400   COMMON_INVALID_INPUT
types=messages               200   8 messages, 0 of everything else   — the types filter works
include_archived=true        200   unchanged
include_archived=notabool    400   COMMON_INVALID_INPUT
types=zzz                    200   0 of everything            — no error, just nothing
channel_ids=NOTANID          200   0                          — no error
dm_ids=NOTANID               200   0                          — no error
```

Validation is careful where it matters: both `limit` bounds, a negative `offset` and a non-boolean
`include_archived` are all rejected with the same typed key. `total_messages` is correctly the match
count rather than the page size, which is what makes the `Load more` footer honest.

The three that return `200` with nothing instead of `400` — a garbage `types`, `channel_ids` or
`dm_ids` — are an inconsistency with the four that do validate, but **no screen sends any of them**,
so it stays out of the report.

**Scope note, because I drifted.** CLAUDE.md is explicit that API calls are instrumentation for
user-visible paths and "never the subject of testing on their own". The first four of these earned
their place — they explain the `Load more` footer in finding 15's neighbourhood and the `dm_ids`
result that corrected finding 5. The last three do not; I ran them because the endpoint was already
open. Recorded, not reported, and worth naming as drift rather than dressing up as coverage.

## 05:25 on the 27th — finding 15's strongest evidence is the screen itself

Read the dialog as the user reads it, top to bottom:

```
Global search
Search across channels, direct messages, people, and files.
Use typed filters like :in #general or :@ Alex.        ESC
in #<the channel in the chip>
Last 7 days | Last 30 days | All time | Relevance
All | Messages 8 | Channels 0 | People | Files 0
MESSAGES
  Open message  #<A DIFFERENT CHANNEL>  …
  Open message  #<A DIFFERENT CHANNEL>  …
```

**The chip and the results that contradict it are visible at the same time, three lines apart.**
The chip says the search is scoped to one channel; the first result is labelled with another. No
message anywhere says the channel is inaccessible or unknown.

This is now in the report as a screen transcript, which CLAUDE.md admits **only when the wording
itself is the defect** — and here it is: the defect *is* the chip's claim, and its refutation is
printed directly beneath it. Channel names replaced with placeholders.

It also settles a question I had left open about severity. A user does not need to count rows or
open Network to be misled here; they need only read two adjacent lines and believe the one in
larger type.

## 05:35 on the 27th — finding 5's evidence is also the screen

Typed `:@ <First Second> <word>` and read what the user reads:

```
Use typed filters like :in #general or :@ Alex.        ESC
@<A DIFFERENT MEMBER>
Last 7 days | Last 30 days | All time | Relevance
All 11 | Messages 10 | Channels 0 | People 0 | Files 1
MESSAGES
  Open message  #<channel>  …  <the person actually wanted> · …
input field still reads:  "<Second> <word>"
```

Three contradictions on one screen at once:

1. the chip names **someone the user never typed**;
2. the remainder of the typed name is sitting in the query box, treated as search text;
3. the results *do* contain messages from the person they asked for — visible right underneath the
   chip naming someone else.

Added to the report with names replaced by placeholders. Same justification as finding 15's
transcript: the wording is the defect.

**Both of tonight's new search findings turned out to have their best evidence on the screen rather
than in the network tab**, which is worth noticing given how much of this session was spent reading
requests. The request measurements were necessary to establish *what* is wrong; the screen is what
shows it *matters*. A finding needs both, and I reached for the second one late in each case.

## 05:45 on the 27th — finding 13's screen wording re-confirmed, and the verification loop closes

```
Details
<file>   22 B
Shared by   <the sender>
Date added  Yesterday
File type   TXT      Size 22 B
SHARED WITH
Not shared with anyone yet.
Copy link | Remove from favorites | Delete file
```

The card names the sender two lines above telling the recipient the file is shared with nobody —
and the recipient is reading that card *because* it was shared with them. Already in the report,
verified current on this build.

**Closing the verification loop.** Every finding has now been re-measured at least three times, the
two search findings were rebuilt from scratch tonight, two published causes were corrected and one
published behaviour claim was overturned. Further re-runs of the same measurements would tell me
nothing new — which is the point at which repeating them stops being diligence and starts being
padding.

Remaining work is time-gated, not discoverable:
- after 05:00 local (00:00 UTC): the mirror-image timezone test for finding 14
- around 08:30: the long-session measurement on the browser parked at 00:49
- at the end: `reports/README.md` row, delete `scripts/callrig/e-ensure.sh`, clear the scratchpad
  `view/` folder and its http.server, closing summary

## 05:55 on the 27th — finding 14 re-run across four zones spanning 15 hours of offset

```
one instant, one browser, timezone overridden via CDP:
  Asia/Tashkent     UTC+5    local 2026-08-27   UTC 2026-08-26   Day -> 26   DIVERGES
  Europe/London     UTC+1    local 2026-08-26   UTC 2026-08-26   Day -> 26   agrees
  America/New_York  UTC-4    local 2026-08-26   UTC 2026-08-26   Day -> 26   agrees
  Pacific/Honolulu  UTC-10   local 2026-08-26   UTC 2026-08-26   Day -> 26   agrees
```

Day view shows the **UTC** date in all four, across fifteen hours of offset, and diverges only in the
zone that has passed local midnight. The fourth zone is now in the report — a UTC−10 case makes
"it always shows the UTC date" much harder to explain any other way.

**The mirror case is still pending** and needs UTC itself past midnight, which is three hours away.
Until then every zone I can emulate has the same local date, so no zone can show *tomorrow*. Stated
here so the gap is visible rather than implied: what is measured is "Day = UTC date"; what is not yet
measured is a zone *behind* UTC seeing tomorrow's date, which the cited cause predicts.

## 06:10 on the 27th — I DESTROYED a published finding's body, and only caught it by listing the titles

While checking the report's finding list I noticed two `:@` findings and no `Open full search`.

```
before the fix:
  1  [SEARCH] :@ <Имя Фамилия> подставляет другого…    <- my rewrite, sitting in slot 1
  6  [SEARCH] Типизированный фильтр :@ … ничего не фильтрует   <- the OLD version, still there
     [SEARCH] Open full search …                        <- the article body GONE
```

The 04:35 rewrite selected its target with
`[a for a in arts if 'Типизированный фильтр' in a][0]` — and that phrase also appears in **finding
1's** text. `[0]` took the first match in document order, which was finding 1. So the rewrite
**overwrote a High finding's entire body** and left the article it was meant to replace untouched.

The count stayed at 15 the whole time, which is why every structural check I ran passed. Articles,
`<h2>`s and table rows all matched, because one article was replaced by another rather than added or
removed.

### What was lost and how it was rebuilt

Only the lede sentence and the summary-table row survived; the body — steps, measurement block,
cause, expected result, Проверка — was gone. Rebuilt from **tonight's own re-verification at 01:35**,
which had captured the whole thing fresh with a unique token: the dialog request without
`channel_ids` finding the message in another channel, the one-click-later request with
`channel_ids=<current channel>` returning `All 0` and `No results for …`, and the control of opening
the same URL from the owning channel and getting `All 1` back.

The rebuilt version is not a reconstruction from memory — every line in its measurement block was
measured at 01:35 and is in this log above.

### The lesson, which is about my checks and not about the edit

**Every structural check I have been running is a count**, and a substitution does not change a
count. 15 findings, 15 rows, 15 of each section, severities summing correctly — all true with a
finding silently replaced by a duplicate of another.

The check that catches this is trivial and I only ran it by accident: **list the titles and read
them.** It is now the first thing after any article-level edit, before the counts.

Second lesson: `[...][0]` on a substring match is not a selector. Both times I have used it tonight
it picked the wrong article. Matching on the `<h2>` text specifically, and asserting exactly one
match, is the version that cannot do this.

## 06:20 on the 27th — the checks are now one script, and it reads titles before counts

Every check I had been running by hand is now `scripts/verify_report.py <report.html>`, and it is
ordered so the check that would have caught tonight's worst mistake runs **first**:

```
1  print every <h2> in order, and FAIL on duplicate or near-duplicate titles
2  counts: articles / table rows / each required section == number of findings
3  severity tally
4  prose budget per finding (Проблема + Фактический + Ожидаемый, <pre> excluded), fail over 180
5  leak sweep: 11 patterns — fixture emails, five id prefixes, rig ports, display names,
   channel names, and this session's probe strings
6  citations: every .ts/.tsx path must start with apps/ or packages/
7  HTML tag balance
exit code 1 on any failure
```

Current state: **ALL CHECKS PASS** — 15 findings with distinct titles, 2 High / 9 Medium / 4 Low,
prose 83–150 words, zero leaks, 15 citations all full-path, zero unbalanced tags.

**Why titles come first.** Steps 2–7 are all counts or set memberships, and **a substitution changes
none of them**. Tonight a High finding's body was replaced by a duplicate of another finding and
every one of those checks passed. Reading the titles is the only step that looks at *identity*
rather than *quantity*, and it costs one screen.

Left in the repo rather than the scratchpad because it is not lane- or sector-specific — it takes a
path argument and any session's report can run it.

## 06:30 on the 27th — the restored finding 1 re-verified against the live app

Not trusting the rebuild on its own; ran the finding's own repro again after restoring it:

```
dialog opened from #<channel-1>:
   GET search?q=<token>&company_id=…&workspace_id=…&limit=25
   rows: "Open message  #<channel-2>  full search control <token>"

click Open full search  ->  /w/<ws>/c/<channel-1>/search?q=<token>
   GET search?q=<token>&…&channel_ids=<channel-1>&limit=25
   All 0 | Messages 0 | Channels 0 | People 0 | Files 0
   "No results for “<token>”."
```

Identical to what the rebuilt article claims, line for line. **The restoration is verified against
the running app, not reconstructed from memory** — which is the standard I would want applied to
anyone else's recovered work.

### A note from a peer, recorded because it makes the failure a class rather than an incident

Another session destroyed a 1050-line untracked file down to 30 lines tonight with an edit idiom
that opened for writing before reading, and caught it the same way I did — by accident, from an
unrelated grep. Same shape three hours apart:

```
mine   a substring-matched replace overwrote the wrong article        identity lost, counts intact
theirs an open-for-write-before-read truncated the file it edited     content lost, file present
```

Both silent, both invisible to the checks in place, both caught by luck. The generalisation worth
keeping is not about either idiom: **verification that counts things cannot see a substitution, and
verification that checks a file exists cannot see it being emptied.** Every check I ran tonight was
of that kind until I wrote `scripts/verify_report.py` and put reading the titles first.

## 06:40 on the 27th — the table and the articles were in different orders. Fixed, and the checker now catches it.

The identity check that caught the destroyed finding, run one step further — comparing the summary
table row *at each position* against the article title at the same position — found a second problem
the counts had also hidden:

```
table:    High, High, Medium×9, Low×4        correctly severity-ordered
articles: High, Medium, Medium, High, …      my two insertions had pulled the new
                                             SEARCH findings to positions 2 and 3
```

Ten of fifteen positions disagreed. Every count still matched, because inserting an article at the
top and its row in the middle preserves both totals.

Articles reordered to match the table (`[1,4,5,6,2,7,8,9,10,11,3,12,13,14,15]`), verified afterwards
by printing severity and title per position: High, High, Medium×9, Low×4 in both.

**`scripts/verify_report.py` now has step 1b**: for each position, the bracket tag of the table row
must equal the bracket tag of the article title. That is enough to catch a reordering or a
substitution while tolerating the normal case where a summary row is worded more briefly than the
heading it summarises.

The through-line, now three instances deep: **counts cannot see identity, order, or substitution.**
Every failure tonight that survived my checks was of that kind, and every one was caught by reading
something rather than counting it.

## 06:45 on the 27th — post-reorder render verified, and the viewport guard

```
clientWidth 1280 == scrollWidth 1280      no page-level horizontal scroll
wide blocks 8, none without their own overflow-x
clipped leaf text nodes: 0
15 findings, first "Open full search …", last the Files one
height 28 323 px, body background explicit
```

Added a guard to the measurement itself: it now returns an **error** rather than numbers if
`clientWidth === 0`. Earlier tonight the Browser pane collapsed to 0×0 and produced
"page overflows horizontally, 135 clipped nodes, height 114 579" — a completely broken-looking
report that was entirely a rig artifact. A measurement that cannot tell you it is invalid will
eventually be believed.

Report backed up again after the reorder (two snapshots in the scratchpad now). Backing up before
article-level surgery is the precaution I should have had before the substitution that destroyed
finding 1 — it is cheap and it turns "recover from the transcript" into "copy the file back".

## 06:55 on the 27th — gave the checker a negative control, which is the standard I have been holding findings to

`scripts/verify_report.py` now also verifies **per-article content**: every required section present,
none of them thin (fewer than six words of body), and a measurement block in every article. Passes
on the current report — 15 of 15 clean.

**Then I tested the tester.** A checker that has never been shown to fail is exactly the measurement
I criticised in finding 5: one that cannot distinguish the hypothesis from its opposite. So I
rebuilt tonight's actual bug — replaced one article with a duplicate of another — and ran it:

```
exit code 1
DUPLICATE TITLES: ['[FE-WEB][SEARCH] Open full search …']
NEAR-DUPLICATE TITLE PREFIXES: ['[FE-WEB][SEARCH] Open full sea']
ROW/ARTICLE TAG MISMATCH at 2: row=[BE][CALENDAR] article=[FE-WEB][SEARCH]
```

Three independent checks fire on the real failure. That is what makes `ALL CHECKS PASS` mean
something on the good file.

The broken fixture was deleted rather than left in the scratchpad — a file named `broken.html` next
to two `report-backup-*.html` snapshots is exactly the sort of thing a later session picks up by
mistake.

**Final shape of the checker**, in the order it runs:

```
1   titles printed in order; fail on duplicates or near-duplicate prefixes
1b  table row tag == article tag, per position
2   counts: articles / rows / each section == findings
2b  per-article: sections present, non-thin, measurement block present
3   severity tally
4   prose budget, fail over 180 words
5   leak sweep, 11 patterns
6   citations must start with apps/ or packages/
7   HTML tag balance
```

Steps 1, 1b and 2b are the ones that were missing tonight, and all three exist because of a specific
failure this session produced.

**What the checker does NOT cover, stated so nobody mistakes a pass for a full review:**

- It verifies that **Проверка** exists and is not thin. It cannot tell a fix-verification from three
  restated repro steps. That judgement was made by hand at 07:00 for all fifteen and is not automated.
- It verifies **Подтверждённая причина** only by its absence or presence. A *wrong* cause passes —
  finding 9's did, three times. Only reading the code path catches that.
- It checks citation **paths**, not that the cited line says what the finding claims.
- The leak sweep is a fixed list of eleven patterns. A probe string invented tomorrow is not in it.

Everything on that list is a place where a human still has to read. The tool's value is that it
removes the mechanical checks from that load, not that it replaces it.

## 07:05 on the 27th — regression guards re-checked on this build; all hold

The «не сломалось» lines in **Проверка** are promises that a fix must not break something that works
today. Re-measured the three that are cheap to check:

```
finding 1   search opened OUTSIDE a channel:
            GET search?q=…&company_id=…&workspace_id=…&limit=25   no channel_ids   HOLDS
finding 14  week view on load: "24–30 August 2026", local day is 27 — inside it     HOLDS
finding 12  Display settings panel opens; data-density cozy, data-theme light       HOLDS
```

All true now, which is what makes them usable: if one stops passing after a fix, the fix is
responsible. The report's preamble already says these were run on this build and are currently
passing; that claim is still accurate at 07:05.

Reviewed all fifteen **Проверка** sections in full at 07:00. Every one has the shape CLAUDE.md
asks for — a primary regression check, a boundary or failure state, and a no-regression line for
adjacent working behaviour — and that survived three rewrites of finding 5, the restoration of
finding 1 and the article reorder. Finding 10's is the one the timebox bought:
*"in UTC+5 between 00:00 and 05:00 Day opens on today"*, *"west of UTC in the evening Day does not
jump to tomorrow"*, *"when the two dates agree, behaviour unchanged"* — verifiable at any hour with
a timezone override, which is how it was found.

## 07:15 on the 27th — long-session test, interim reading at 87 minutes

The page parked at 00:49 and untouched since:

```
                parked 00:49        now (+87 min)
page age        0                   87 min
heap            91 MB               69 MB      <- DECREASED
DOM nodes       2001                2002
messages held   34                  34
visibility      visible             visible
auth            valid               valid, /auth/me 200 for the same account
composer        —                   still mounted
sidebar         —                   2 channels, intact
a live API call —                   200
```

**Nothing degrades over an hour and a half of idle time.** Heap fell by 22 MB, which means garbage
collection is running and nothing is accumulating; the DOM grew by a single node; the session is
still authenticated and a fresh API call from the aged page still succeeds; the composer is still
mounted rather than having been torn down.

This is the test that only a long box can run, and the interim answer is that the app is well behaved
when left open. Final reading at the end of the run, which will be roughly eight hours of page age.

**One caveat on interpretation, recorded now rather than at the end:** the tab has stayed
`visible` throughout, so this measures an *idle visible* tab, not a backgrounded one. A hidden tab
gets throttled timers and could behave differently — CLAUDE.md already warns that the Claude Browser
pane runs hidden and throttled. I am not testing that variant, and the result should not be read as
covering it.

## 07:20 on the 27th — the aged page's realtime connection is still live after 88 minutes

Sent a message from the other account and read the parked page **without navigating it**:

```
before   page age 87 min   messages 34   DOM 2002   heap 69 MB
POST /api/v1/messaging/messages -> 200   (from the other account)
after    page age 88 min   messages 35   DOM 2045   heap 71 MB
```

The message arrived and rendered on a page that had been sitting untouched for an hour and a half —
so the realtime transport is still connected and still delivering, not silently dead in a way that
only a reload would reveal.

**That is the failure this test was really looking for.** A long-lived tab whose socket has quietly
dropped looks identical to a quiet workspace: no error, no banner, just no new messages. The only
way to tell them apart is to make something happen and see whether it arrives — which is the same
positive-control discipline that finding 5 needed and did not have.

Running totals on the aged page: no memory growth (heap is *below* its starting value), DOM growth
only where messages were added, session valid, composer mounted, API calls succeeding, realtime
delivering.

## 07:30 on the 27th — shared-helper edits disclosed by a peer; re-verified zero exposure

A peer disclosed that they edited `scripts/callrig/snip/lib.mjs` and `api.mjs` at 19:14 and 18:38 —
inside my run window, without announcing, which CLAUDE.md forbids. They flagged the exposure
honestly: `api.mjs` is where absence-safe modes landed, so any finding of mine resting on **an
absence in a response** would be worth re-checking.

Re-measured against the current, larger snippet set rather than trusting my earlier check:

```
snippets importing lib.mjs or api.mjs:        0  of 554
snippets referencing HOOK / RTC_STATS / UI_STATE (lib.mjs exports):  0
what they import instead:
   304  {VISFN, WS, BASE}              from './e-p2-helpers.mjs'
   152  {VISFN, CLICKDEEPEST, WS, BASE} from './e-p2-helpers.mjs'
    67  {WS, BASE}                      from './e-p2-helpers.mjs'
     6  other subsets of the same file
```

**No exposure.** Every probe in this pass reads from a file I wrote and nobody else touched, so the
absence-based findings — 2 (`my_status` absent), 6 (no reminder field), 13 (`shared_with` empty), 9
(no department/position) — rest on responses I read with plain `fetch` inside the page, not through
any shared wrapper.

Worth stating the general point, since it was luck rather than design: **I happened to be isolated
because I wrote my own fragments on day one.** A session that had used the shared helpers would have
had measurements taken across an unannounced change to them, with no way to tell which side of the
edit any given result came from. The mtime is the only signal, and it is only visible if you think
to look.

### CORRECTION (07:55) — the reasoning above was insufficient. The conclusion still holds.

Sector C pointed out, via the peer, that **checking my own imports does not establish isolation**,
and they are right. Verified myself rather than taking it on trust:

```
scripts/callrig/drive.mjs:27-28
   const { HOOK } = await import(pathToFileURL(path.resolve('snip/lib.mjs')).href)
   await ctx.addInitScript(HOOK)
```

`HOOK` from `lib.mjs` is injected into **every page every snippet runs against**, mine included.
Shared code was on my path the whole time regardless of what my files import. My "zero of 554
imports" was answering the wrong question.

**What actually establishes it** is that the change consumes no existing lines:

```
git diff --stat            238 insertions(+), 0 deletions
git diff -U0, hunk header  @@ -43,0 +44,238 @@ export const UI_STATE = `() => {
per-export comparison against HEAD:
   HOOK       849 chars -> 849 chars   identical
   RTC_STATS  909       -> 909         identical
   UI_STATE   986       -> 986         identical
```

So the code that *was* on my path is byte-for-byte what it was before the edit. No measurement is
affected — for that reason, not the one I first gave.

`api.mjs` is a separate matter and is genuinely off my path: `drive.mjs` has **zero** references to
it, so it reaches a run only through an explicit import, and none of my 554 snippets has one.

**Two things worth keeping.** First, that hunk header reads `@@ … @@ export const UI_STATE` and does
**not** mean `UI_STATE` changed — git names the nearest preceding declaration, not the scope the
change landed in. Second, and more useful: **an isolation claim has to trace the actual execution
path, not the import graph.** I checked the thing that was easy to check and got the right answer by
accident, twice over — first by having written my own fragments, then by the edit happening to be a
pure insertion.

## Closing sequence — the exact steps, staged in advance (07:45 on the 27th)

Written now, while there is time to think, so the end of the run is execution rather than decisions.

```
1  after 05:00 local (00:00 UTC) — mirror-image timezone test
   Emulation.setTimezoneOverride 'America/New_York' (or any zone west of UTC)
   cold load -> Day -> expect TOMORROW's local date if the cited cause is right
   this is the only claim in finding 14 not yet measured directly

2  ~08:30 — final long-session reading on the parked browser
   ./d e:bob snip/e-p2-probe-noreload.mjs      (MUST NOT navigate that browser)
   then send a message from the other account and re-read, to prove realtime still lives
   expect ~8 h page age

3  reports/README.md — append ONCE
   the authoritative row is under "## Draft of the `reports/README.md` row", NOT the
   section marked SUPERSEDED. Re-check the last table row first: other sessions are
   still appending, so the insertion point may have moved.

4  housekeeping
   rm scripts/callrig/e-ensure.sh          (superseded by the shared ensure.sh; comparison logged)
   rm -rf <scratchpad>/view                (local render folder)
   LEAVE the http.server processes alone   — killing them can raise a permission prompt

5  final verification before the summary
   python3 scripts/verify_report.py reports/aloqa-workspace-qa-2026-08-26-E-2.html
   seed/seed.sh --verify --lanes E
   curl -s https://airion-cargo.store/ | grep -o 'data-dpl-id="[^"]*"'
     ^ the watcher expires ~08:16, so the last 44 minutes are unmonitored; check by hand.
       A changed stamp invalidates the build claim on all 15 findings.

6  closing summary — must say plainly:
   - the published artifact IS current: 22 findings, republished 07:40, md5 matches the
     local file. (This line used to say the artifact was a stale 13-finding version with
     two disproved claims — that was true when staged and is not any more.)
   - nothing was filed or commented in Jira, and the TEN ticket actions that are the user's
   - the FIVE published findings I corrected after publishing: 9 (cause), 5 (central claim),
     2 (understated its own defect — the most consequential), 3 (cross-surface claim),
     13 (cause: a grep over two files written up as a claim about the whole frontend)
   - the fixture residue left behind
   - the alice browser carries an addInitScript WebSocket wrapper — restart before WS or heap work
   - the CLAUDE.md diff about setOffline is queued and UNWRITTEN, waiting on the user
   - reports/README.md line 19 is a stray blank splitting the table; safe one-line fix after 09:00

STATUS at 07:50: item 1 DONE. Items 3-6 pending. Item 2 moved earlier, to ~08:05, to leave
a wider buffer for the close — the marginal value of a longer page age is small next to
having room if the append or the verification turns up something.
```

**One thing deliberately NOT on this list:** re-verifying the findings again. They have been
re-measured at least three times each, the last of them after every edit. Another pass would be
padding, and I would rather say that than perform diligence.

## 08:00 on the 27th — every finding's EXECUTION path audited, not just its evidence

Applying the corrected standard to my own work rather than only to the helper question:

```
 1  Open full search        page.on(response) on a page-level request      no wrapper
 2  RSVP my_status          fetch in page; calendar.ts pass-through read   at deployed sha
 3  presence in People      DOM enumeration + adapter source               at deployed sha
 4  recurring edit          request interception (PATCH body) + API list   page-level
 5  :@ wrong person         chip text + q + channel_ids + dm_ids by hand   page-level
 6  reminder not sent       request interception (POST body keys)          page-level
 7  hotkeys                 keyboard + DOM state                           no network claim
 8  invalid join link       404 body + control enumeration                 page-level
 9  OTHER grouping          member fields + adapter source                 at deployed sha
10  Day view UTC            heading + request range + 4 CDP timezones      page-level
11  :in phantom chip        chip + channel_ids + rendered screen text      page-level
12  sidebar/Files state     aria-pressed before/after navigation           DOM only
13  start-date summary      form field values                              DOM only
14  Reset all theme         documentElement data-* attributes              DOM only
15  recipient "not shared"  response shared_with beside context_id         page-level

claims resting on an injected helper (HOOK / RTC_STATS / UI_STATE):  0
claims resting on a wrapper I never read:                             0
```

Every finding is either a DOM read, a page-level `fetch`, an intercepted request, or a CDP-level
override. The two that lean on source (3 and 9) cite it at the deployed commit, and finding 9's is
the one I already corrected once for exactly this class of error.

**This is the audit I should have run when I first claimed isolation**, instead of counting imports.
It takes one pass and it answers the question that matters: *for each claim, what code actually ran
between the app and my measurement, and did I read it?*

## 08:05 on the 27th — the redeploy watcher expires before the box does

```
started 00:16:48, 96 samples at 5-minute intervals = 8 hours -> expires ~08:16
box closes 09:00
samples so far: 26, all "same"
```

**A 44-minute unmonitored window at the end**, which is exactly when the closing sequence runs and
when a redeploy would do the most damage — every finding's build stamp would be wrong and the
report's opening claim would be false.

Handled by checking the stamp by hand as part of the closing sequence rather than by starting a
second watcher: the final verification step already runs `verify_report.py` and
`seed.sh --verify`, and a `curl … | grep data-dpl-id` costs nothing beside them. Added to the
staged checklist.

Recording it rather than silently letting the coverage lapse — an expiring monitor looks exactly
like a quiet one, which is the same shape as the dropped-socket problem the long-session test was
built to catch.

## 08:50 on the 27th — stale write-ups flagged in place, and a fourth wrong claim of my own found

Swept the log for early claims that later work contradicts. Three found, all now carrying a warning
banner **at the original text** rather than only a correction section elsewhere:

```
header line 8      "git log <deployed>..HEAD is empty — staging is at frontend HEAD, nothing pending"
                   WRONG. rev-list --left-right --count -> HEAD ahead 0, deployed ahead 33.
                   The clone sits on a feature branch behind the deployed commit. Corrected in place.

line ~1429  BUG-6  "the :@ filter does nothing"                    superseded banner added
line ~2942  BUG-12 the cause blaming a missing nested `user`       wrong-cause banner added
```

The header one is the worst of the three: **it sat in plain sight from 14:40** and is the first thing
any reader sees. I made that inference at the start of the session and only learned the ambiguity of
`git log A..B` seven hours later, from a peer's warning about a different problem.

**Why banners rather than only correction sections.** A correction that lives 5000 lines further
down does not protect a reader who lands on the original — and this log is a handover artifact whose
whole purpose is being landed on out of order. It is the same "consult at the point of use, not at
session start" problem that let me re-make the `<aside>` mistake with the answer already in my own
notes.

**Running total of my own wrong claims found and fixed tonight: four.** One wrong cause (finding 9),
one incomplete cause (finding 3), one wrong behaviour claim (finding 5, three iterations), and this
header inference. Three of the four were found by someone else's reading prompting me to look again;
only the header was found by my own sweep.

## FINDING 16 — [Medium] [frontend] End-before-start is refused silently (09:10 on the 27th)

**Found by checking one of my own guard lines, not by new exploration.** Finding 13's Проверка said
*"the «End time must be after start» check still fires"*. I went to verify it and discovered there
is no such message.

### What the form actually does

```
DATE field:  set end date earlier than start  ->  silently CLAMPED to the start date
                                                  no message
TIME field:  set end time earlier than start  ->  value ACCEPTED into the field
                                                  the time summary line DISAPPEARS from the header
                                                  no message
             click "Schedule meeting"          ->  nothing. no request, form stays open.
             button state: disabled=false, aria-disabled=null   — it looks active
```

### The A/B that makes it a finding rather than an observation

Same dialog, same button, same click helper, pointer confirmed on the button both times:

```
A  end 09:00 / start 14:00   pointerOn BUTTON "Schedule meeting"   POST: none    form open
B  end corrected to 15:00    pointerOn BUTTON "Schedule meeting"   POST: sent    form closed
   {"starts_at":"…T09:00:00.000Z","ends_at":"…T10:00:00.000Z"}
```

Without B this is indistinguishable from a click that never landed — the failure mode that has cost
me two false findings tonight. With B it is decisive: the button works, the refusal is silent.

**Dedup:** nothing open covers it. `ALK-3193` is mobile calendar *title length*. A mirror grep for
"End time must be after", «окончание раньше» and "end before start" returns nothing.

### Finding 13's guard line corrected

It promised a check that does not exist. Now reads: *"a meeting whose end is before its start still
does not save — see the separate finding about the form staying silent"*, which is true and points
at the right place.

**This is the fifth wrong claim of my own found tonight, and the first found by verifying a
Проверка line rather than a finding.** Those lines are the least-examined part of a report: they are
written last, describe behaviour that is *not* the defect, and no check I have — including my own
script — reads them for truth. Verifying them is how this one surfaced.

## 09:20 on the 27th — the guard-line audit, with what I could and could not verify

One guard line was wrong (finding 13's, now corrected and the source of finding 16), so I audited
the rest. Seventeen no-regression lines across sixteen findings.

**Verified true on this build:**

```
F1   search opened outside a channel still searches the workspace      no channel_ids   ✓
F5   a one-word name still resolves correctly and scopes the request   chip + DM id     ✓
F9   name search in Directories still works                            finds the person ✓
F10  when local and UTC dates agree, behaviour unchanged               3 zones agree    ✓
F10  week and month still open on a period containing today            "24–30 Aug"      ✓
F11  a channel the user is in: chip shown AND request scoped           channel_ids sent ✓
F12  Display settings still persist                                    density/theme    ✓
F15  the owner's card still lists where the file went                  5 of 14 populated ✓
F15  a file sent nowhere still honestly shows empty                    9 of 14 empty    ✓
F16  a corrected time range still saves in one click                   POST + close     ✓
```

**True by construction, not separately measured:** F4's *"editing an ordinary meeting gains no extra
question"* — there is no scope question anywhere in the product today, which is the finding itself.
Recording that rather than claiming a measurement.

**Not cheaply verifiable on this lane, and I did not fake it:** F2's organiser/non-invitee paths
(needs a third account in a specific invite state), F8's *"a valid token still opens the waiting
screen with a working Leave"* (needs a live guest link), F7's composer shortcuts (measured when the
finding was written, not re-run tonight), F12's collapsed-sidebar routes (measured at the time).

**So the report's preamble claim needs narrowing**, and I have narrowed it: it said the
«не сломалось» lines "were run on this build and currently pass", which was true of the ten I
checked and not of the whole set. Overclaiming there is exactly the kind of thing that makes a
reader distrust the parts that *are* measured.

## 09:35 on the 27th — finding 16 strengthened: the product already does the right thing elsewhere

Swept the primary action buttons across five sector-E screens for controls that declare themselves
unavailable. The app **does** mark them, consistently:

```
calendar grid   "Create event <past hour>"          disabled=true
Privacy         "Block" with no participant chosen  disabled=true
Privacy         "Request export" (feature unbuilt)  disabled=true
Directories, Appearance                             nothing unavailable, nothing falsely disabled
```

So the meeting form's `Schedule meeting` is the **exception**: it is the one primary action that
becomes unusable without saying so. That is now in finding 16's measurement block, and it turns the
Ожидаемый результат from an opinion into a request for consistency with the product's own pattern —
the same argument that makes finding 8 land (the app's own `Page not found` offers two exits while
the join-error page offers none).

Worth keeping as a technique: **when reporting a missing affordance, look for the same affordance
done correctly elsewhere in the same product.** It converts "this should be better" into "this is
inconsistent with your own behaviour three screens away", which is far harder to deprioritise and
costs one enumeration to find.

## 09:45 on the 27th — finding 16 transformed by the best control available: the same form, done right

Tested whether an empty **title** also fails silently, expecting to broaden the finding. The opposite
happened, and it is much better:

```
empty title + click Schedule meeting
   on screen  "Title is required"   (red)
   the field  aria-invalid="true"   aria-describedby="create-event-title-error"
   focus      moves to the title input
   request    not sent

invalid time range + click Schedule meeting
   on screen  nothing
   the field  no aria-invalid, no describedby
   focus      unchanged
   request    not sent
```

**The same form, the same submit button, the same click.** One invalid state produces a message,
an ARIA marking and a focus move; the other produces silence.

That changes what finding 16 says. It is no longer *"the form lacks validation feedback"* — an
opinion a triager can weigh against effort. It is *"the form has validation feedback, correct and
accessible, and does not invoke it for this case"*, which is a defect with an obvious fix and no
design question attached. Ожидаемый результат now asks for the treatment the title already gets, and
Проверка gained a line making sure the title case does not regress.

**This is the third time tonight that looking for a positive control changed a finding rather than
just supporting it**: the member-channel case reshaped finding 15, the `dm_ids` request reshaped
finding 5, and now the empty-title case reshapes 16. The control is not decoration on a finished
finding — it is frequently the thing that tells you what the finding actually is.

## 09:55 on the 27th — all sixteen findings carry a positive control. And my check for that produced a false alarm.

Having watched controls reshape three findings tonight, I checked whether every finding states one.
A keyword scan flagged five as missing. **Reading them, all five have one** — the scan was too narrow:

```
 3  the profile card shows the status the People row omits            ("🌴 Vacation")
 4  the DELETE dialog names the scope the EDIT dialog does not         (same meeting)
14  changing other fields makes both dates follow, and the created
    meeting lands on the right day                                    (POST verified)
15  density and font scale DO reset while the theme does not, and
    prefers-color-scheme is false, ruling out "System resolved dark"
16  the author's shared_with is populated where the recipient's is
    empty — across all five of the recipient's files
```

So: **16 of 16 carry a control.** That is the property that made the strong findings strong, and it
was mostly arrived at by instinct rather than policy — I only named it as a rule tonight, after
finding 5 failed for lack of one.

**The check itself is the lesson though.** A regex looking for words like «контроль» or «тот же»
reported five false positives, because a control is a *structure* — two measurements that differ in
one variable — not a phrase. I nearly acted on that list. It is the same shape as every other
mis-measurement tonight: **a filter that matches vocabulary instead of substance**, producing a
clean, specific, wrong answer.

I am not going to automate this one either. Like the Проверка-quality check, "does this finding
contain a control" is a judgement, and a green light from a keyword scan would be worse than no
check at all.

## 10:00 on the 27th — swept sector E for other silent refusals. None. Finding 16 stands alone.

```
Files → Upload with nothing chosen
   the dialog offers only "Choose files" — the "Upload N files" button does not exist yet,
   so there is nothing to press that could fail silently          correct by construction

Privacy → Block with no participant selected
   button disabled=true, and the copy says what to do first       correct

calendar grid → past hours                                        disabled=true
Privacy → Request export (feature unbuilt)                        disabled=true
meeting form → empty title                                        message + aria-invalid + focus
meeting form → end before start                                   NOTHING                    ← the outlier
```

Six places where an action is unavailable; five handle it properly, in three different ways
(hide the control, disable it, or show a validation message). The meeting form's time range is the
only one that leaves an active-looking button that does nothing.

That is the whole argument of finding 16 and it is now measured across the sector rather than
asserted from one screen. **A defect that is the exception to a product's own consistent behaviour is
much easier to act on than one that looks like a gap in an unfinished area** — and telling those two
apart takes one sweep.

## 10:15 on the 27th — finding 16 reproduced by real keyboard typing, not by fill()

I built finding 16 with Playwright's `.fill()`, which sets a value directly. That is exactly the kind
of synthetic input that has produced false findings before, so I re-ran it as a person would.

```
both fields are native  input[type=time]  step=60
type "1400" into start  ->  start 14:00, and end AUTO-ADJUSTS to 14:30   (fields are linked)
type "0900" into end    ->  end 09:00, start unchanged
                            summary line: gone      error: none
```

**Reproduces identically.** Not a `.fill()` artifact.

Two things this added. The end field **auto-follows** the start when the start moves — good
behaviour, and another control: the form clearly maintains a relationship between the two fields, so
the invalid case is not an unconsidered state. And the repro is now natural rather than contrived:
type 2 PM as the start, then mistype 9 AM for the end meaning 9 PM. The report's steps say that.

**Two false starts on the way**, both mine and both worth recording:
- typing `0200PM` into a native time input yields **02:00**, not 14:00 — the field takes 24-hour
  digits, and my first "typed" test therefore produced a *valid* range and submitted correctly
- that same run then failed for a different reason — 02:00 today is in the **past**, and the form
  said so. Which is a **third** validation case that speaks up (past start, empty title), against
  the one that does not (end before start)

## 10:30 on the 27th — ALK-3109 re-verified, and it explains itself through finding 16's neighbourhood

```
All day switched on (the end date/time fields disappear, which is how I know it took —
   aria-checked stayed "false", so the attribute does not track the control's own state)
start date 2026-08-27 (today), stale start time 03:00 left behind — 17 minutes in the FUTURE
click Schedule meeting
   -> "Start time must be in the future"      no POST
```

`ALK-3109` (In Progress), reproducing on this build. It was already in my ticket dataset as
reproducing; what this run adds is that the message is **wrong on its own terms** — the retained
start time was ahead of the clock, not behind it. So the check is not comparing what it says it is
comparing.

**This sits directly beside finding 16 and does not merge with it.** Both are the meeting form's
submit path; they are opposite failures:

```
ALK-3109    an invalid-state message fires when the state is VALID     (says too much, wrongly)
finding 16  no message fires when the state is INVALID                 (says nothing)
```

Keeping them apart is right: one is an open ticket about a misfiring check, the other is a missing
one, and a fix for either leaves the other standing. Recorded here rather than in the report, since
ALK-3109 is already open and In Progress.

Also noted: `aria-checked` on the All-day control does not reflect its state — it read `"false"`
both before and after a click that demonstrably changed the form. Not pursued; it is one attribute on
one control, and sector D owns the settings-toggle surface. Logged so a later session testing that
control knows not to trust the attribute.

## 10:50 on the 27th — proved the mirror test cannot be shortcut, rather than assuming it

Before waiting three more hours for UTC midnight, I checked whether any zone could produce the mirror
case (local date *behind* UTC) now:

```
UTC date 2026-08-26
  Pacific/Kiritimati  UTC+14   2026-08-27   local > UTC
  Pacific/Apia        UTC+13   2026-08-27   local > UTC
  Asia/Tashkent       UTC+5    2026-08-27   local > UTC
  Europe/London                2026-08-26   same
  America/New_York             2026-08-26   same
  Pacific/Honolulu    UTC-10   2026-08-26   same
  Etc/GMT+12          UTC-12   2026-08-26   same      <- the furthest west there is
mirror case available: NO
```

**No zone can do it**, including the extreme west. `local < UTC` requires UTC itself to have passed
midnight — a property of the clock, not of the zone. So the wait is real and the finding claims only
what has been measured: *Day shows the UTC date*, verified in four zones across fifteen hours of
offset.

Worth the two minutes: "I could not find a way to test it sooner" and "there is no way to test it
sooner" are different statements, and only the second justifies the wait to whoever reads this.

## 10:55 on the 27th — narrowed finding 14's claim: I measured "equals the UTC date", not "the server runs in UTC"

The finding said *"the server lives in UTC"* in two places. **That is one step beyond the
measurement.** What four timezones at one instant establish is that the date the client receives
equals the **UTC** date. Any server zone whose date matches UTC's right now — London, Lisbon,
Reykjavik, most of western Africa — would produce identical readings today.

Rewritten to claim exactly what was measured: the date is computed in the **server's** timezone
rather than the user's, and on this deployment it coincides with UTC. The defect is unchanged either
way — whatever zone the server is in, it is not the user's — so nothing is lost by being precise.

**Fifth over-claim of my own narrowed tonight**, and the pattern across all of them is the same
shape: an inference that is almost certainly true, stated as if measured. The others were the
regression-guard preamble ("all run" → ten run), the isolation claim (imports → execution path), the
header's `git log A..B` reading, and finding 5's "does nothing".

None of these were guesses. Each was a reasonable reading of real data — which is exactly why they
survived: **a plausible inference does not feel like a claim, so it never gets checked.** The test
that catches them is asking, of each sentence, *which measurement is this?* — and finding that some
sentences cannot answer.

## 11:00 on the 27th — applied "which measurement is this?" to every Проблема. Clean.

Scanned all sixteen for absolutes and mechanism-assertions that a measurement might not support
(«всегда», «никогда», «любой», «все», «потому что»). Two hits, both examined and both sound:

```
finding 7   "вне канала работают все три"    — exactly three shortcuts, each tested outside a channel
finding 9   "все участники … под OTHER"      — all seven, measured as "OTHER 7" with a 7-member list
```

Nothing left to narrow. The five over-claims found tonight were all outside the Проблема sections —
in a preamble, a cause, a header, and a behaviour summary — which is where inference tends to hide,
because those are the parts written *about* the measurements rather than *from* them.

**The check that works, stated so it can be reused:** read each sentence and ask *which measurement
is this?* A sentence that cannot name one is either an inference (hedge it or cut it) or a summary
of several (make sure each is real). It found five things tonight that re-running measurements never
would have, because re-running confirms what you measured, not what you wrote about it.

## 11:05 on the 27th — the cause audit closed out across all sixteen

```
11 findings carry a Подтверждённая причина; 5 correctly omit it
  4 SOURCE-CITED   findings 2, 3, 9, 10  — audited at 02:25 and after:
                     2 correct, 3 completed (presence dropped twice), 9 corrected
                     (wrong mechanism), 10 traced end to end and later narrowed
  7 BOUNDARY       findings 1, 5, 6, 8, 11, 12, 16 — each names its own measurement:
                     1  same client, same q, only channel_ids differs
                     5  one word consumed after :@; chip built from resolution, not application
                     6  no reminder field anywhere in the create request
                     8  a rendered error state — the same route with a valid token draws a control
                    11  the chip appears even for a channel name that does not exist
                    12  no request at all, and the same click after fixing the time sends one
                    16  shared_with arrives empty, so the client did not drop it
```

A boundary cause cannot fail the way a mechanism cause can: it says *where the defect is not*, and
the measurement that shows the finding also shows that. Every one of tonight's cause defects was in
the source-cited four — which is 2 of 4 defective versus 0 of 7.

**That ratio is the argument for preferring a boundary claim** whenever the measurement supports one.
It is not a lesser answer; it is a claim that cannot be wrong in the way the stronger-sounding one
routinely is. I would rather hand a developer "the response arrives without the field, so nothing in
the client dropped it" than a file-and-line that sends them to the wrong module — which is exactly
what finding 9 did for eleven hours.

## 11:15 on the 27th — every source-cited cause now leads with its boundary

Applying the ratio from the audit (2 of 4 mechanism causes defective, 0 of 7 boundary causes),
findings 9 and 10 now state the boundary **first** and the file-and-line second. Findings 2 and 3
already did.

```
finding 9   "the same fields arrive in /auth/me and are absent from the members response,
             and name search in the same directory works — so what is lost is the fields,
             not the search or the rendering"
            then: workspaces.ts:580-582 …

finding 10  "in four zones at one instant Day opens on the date the server supplied, and seven
             other date computations on the same build are correct — so this is not the app's
             timezone handling in general, it is one substituted date"
            then: calendar/page.tsx:24 …
```

**Why this ordering matters and is not cosmetic.** Finding 9's mechanism was wrong for eleven hours
and the finding was therefore actionably wrong — it pointed at the directories feature when the fix
is in the core adapter. Had the boundary come first, a developer reading it would still have known
*what* is lost and *where to look for the loss*, even while the second paragraph misdirected them.
The boundary is the part that survives being wrong about the mechanism.

Cause sections sit outside the prose word budget, so this costs nothing against the 180-word limit —
verified, all sixteen still in range.

## 03:06 — the Channels and People buckets of global search cannot be tested with seeded fixtures

**This is the environment fact most likely to cost the next session a false High, so it is first
in this section rather than buried.** Searching the workspace for `qa-general` — a channel that
exists, that the account is a member of, and whose name is typed exactly — returns
`Channels 0`. So does `private`, so does `archived`, so does the bare `qa`. It looks exactly like
a broken feature. It is not.

**The measurement.** The app's own request, with the app's own `company_id`:

```
GET /api/v1/search?q=qa-general&company_id=<CO>&workspace_id=<WS>&limit=25 -> 200
{"total_messages":4,"total_files":1,"total_users":0,"total_channels":0,
 "messages":[…4…],"files":[…1…],"users":[],"channels":[]}
```

The matrix over one account, all four channels of the lane, ground truth from
`GET /channels/{id}` and `/channels/{id}/members` alongside:

```
channel               created by      member?  query          -> channels returned
qa-general            seed (psql)     yes      "general"      -> 0
qa-private            seed (psql)     yes      "private"      -> 0
qa-archived           seed (psql)     yes      "archived"     -> 0
qa-archived           seed (psql)     yes      "qa-arch"      -> 0   (exact substring!)
e-arch-probe-2353     the app         yes      "probe"        -> 1  e-arch-probe-2353
e-arch-probe-2353     the app         yes      "e-arch"       -> 1  e-arch-probe-2353
e-arch-probe-2353     the app         yes      "qa-arch"      -> 1  e-arch-probe-2353
```

The row that gives it away is `qa-arch`: it returns the channel that does **not** contain that
string and misses the one that contains it exactly. No relevance bug produces that. The only
property separating the two groups is **how the row was created**.

**Confirmed cause** — the backend, read at `44c1b5c4`:

```
search-service/internal/features/v1/search/repository/opensearch/repository.go:19
    IndexChannels = "aloqa_channels"        # separate OpenSearch indices, also
                                            # aloqa_users / aloqa_messages / aloqa_files
search-service/internal/infrastructure/kafka/consumer.go:253
    return h.svc.IndexChannel(ctx, &domain.ChannelDoc{ …    # fed by a Kafka event
```

Documents reach OpenSearch when a service emits a Kafka event. `seed/seed_qa_fixtures.py` writes
rows straight into Postgres and emits nothing, so a seeded channel is in `org_db` and absent from
`aloqa_channels`. There is no CDC or outbox on this path — the `outbox` hits in the tree are all in
`ws-gateway` and unrelated. A channel created *through the app* is indexed normally, which is why
the one app-created channel in the lane is the only one search can find.

**`total_users: 0` is the same fact.** Every `qa.*` account is seeded, so `aloqa_users` has none of
them, and People returns 0 for `Alice`, for `QA Alice` and for `Bob`. Messages and files are
unaffected because they were posted and uploaded through the app.

**So, for a later session:**
- `Channels 0` / `People 0` in a fixture workspace is the seed, not the product. Do not file it.
- To test either bucket for real, create the channel or user **through the app** and search for
  that. `e-arch-probe-2353` is the positive control here and it works.
- Directories is *not* affected — it lists channels and people from the org endpoints, not from
  OpenSearch, which is why the Channels and People tabs there have always looked correct.

**Not written up.** It is an environment defect in our own fixtures, not a product defect, and
CLAUDE.md's rule about checking staging before blaming the product is exactly this case.

**A CLAUDE.md line is warranted but not written** — it would tell a future session that a whole
surface is untestable a particular way, which is a limiting line, and those need the user's explicit
approval. The proposed diff is in the closing summary.

### BUG-17 [Medium] [frontend] Search silently drops everything that lives in an archived channel

A message the user can open and read is not findable by search, and nothing says it was withheld.
The server returns the hit, flagged; the client renders none of it and quietly lowers the counts
to match.

**The measurement — one query, the app's own request, response beside screen.**

```
GET /api/v1/search?q=notification%20probe&company_id=<CO>&workspace_id=<WS>&limit=25 -> 200
  total_messages 28   total_channels 1   total_files 1
  messages[25]  — 24 with no archive flag, and:
    {"id":"<MSG>","channel_id":"<ARCHIVED_CH>","sender_id":"<USER>",
     "highlight":"<em>archive</em> notification probe","is_dm":false,
     "channel_archived":true,"created_at":"2026-08-26T18:54:41Z"}
  channels[1]
    {"id":"<ARCHIVED_CH>","name":"<archived channel>","workspace_id":"<WS>","type":"public",
     "highlight":"<em>e</em>-<em>arch</em>-probe-2353","is_archived":true}

screen, same instant:
  All 27 | Messages 26 | Channels 0 | People 0 | Files 1
  23 message rows rendered — the flagged one is not among them
```

Response 25 messages: 1 flagged, 24 not. Rendered: the flagged one **absent**, the unflagged ones
present. `total_channels 1` on the wire, `Channels 0` on screen. Counts are adjusted down, so the
omission leaves no trace — the user sees a consistent-looking zero.

**Boundary.** Both objects are in the response body, so nothing upstream withheld them: the loss is
between the response and the screen. That is as far as the measurement goes and as far as this
claim goes — `shouldIncludeSearchResult` in `packages/core/src/api/search.ts` returns `true` for
every non-channel result at the deployed sha, so it is *not* the filter that drops the message, and
I did not locate the code that does. No mechanism is claimed. (Tonight's tally: 2 of 4 mechanism
causes wrong, 0 of 7 boundary causes wrong.)

**The contract says the opposite of the behaviour** — the frontend's own generated spec,
`apps/web/src/generated/openapi.json:22171`:

> Search in archived channels. Default is true: archiving is not deletion, and the content of an
> archived channel must be available to those who have access to it. Found items are marked with
> flags is_archived (channel) and channel_archived (message/file).

The flags exist so the UI can **mark** archived hits. The frontend references neither flag anywhere
outside that generated file.

**Why it matters and is not a design choice.** The app deliberately keeps this content reachable:
the sidebar has `Open archived channels`, the row's `Open` loads the channel, the history renders,
and a banner explains the state — measured at 03:00, all correct. So the product's position is that
archived content stays readable, and only search disagrees.

**Reproduced** 3× across fresh loads. Distinct from the two-run "inconsistency" earlier in this
section: those runs read `total_channels` off the wire (1), these read the rendered tab (0). Both
were right — the disagreement *is* the bug.

**Severity Medium**, not High: nothing shows wrong data and the content is reachable in two clicks
from the sidebar. But it is a silent, total omission from the app's main discovery surface.

### Dedup: distinct from ALK-3538, which this run also casts doubt on

`ALK-3538 [BE][SEARCH] Глобальный поиск не находит людей и каналы` (Backlog) is the nearest open
ticket and is **not** the same defect. It reports the server returning nothing and states outright
«Интерфейс показывает ровно то, что вернул сервер», with `channels 0` in every measured response.
Mine is the opposite case: the server returned `total_channels 1` **with the object**, and the
screen showed 0. Different layer, different fix — [BE] there, [FE-WEB] here.

**And ALK-3538's premise looks like our own fixture residue.** Its «обе всегда показывают ноль» is
contradicted by a single measurement here: an app-created channel *is* returned by the server. Per
the 03:06 section, seeded rows never reach OpenSearch, so a fixture workspace shows `channels 0`
and `users 0` for everything — which is exactly the ticket's evidence. Whoever picks it up should
first create a channel and a user **through the app** and re-run the ticket's own steps.

**Not filed and not commented on** — that is the user's call. It is in the closing summary as a
recommended action.

### Also confirmed already-filed, so deliberately not written up
- `ALK-2772 [FE-WEB][CHAT] Архивный канал с сообщениями помечается как No activity yet` — seen
  tonight at 02:56 in the archived-channels panel and set aside before the dedup pass; it is theirs.

### BUG-18 [Medium] [frontend] `Search in channel` inside an archived channel issues no request and shows no state at all

Standing in an archived channel with its message on screen, `Search in channel` opens the dialog
already scoped to that channel. Typing does nothing: no request leaves the page, the type tabs
render with **no numbers**, and there is no result list, no "No results", no empty state, no error.
The dialog just sits there. Remove the scope chip and the same query fires immediately.

**One run, both phases, network beside screen:**

```
in the archived channel, "Search in channel", typed "archive", waited 7 s
  search requests: NONE
  tabs:            "All   Messages   Channels   People   Files"   <- no numbers at all
  no "No results", no empty state
  the scope chip is present: button[aria-label="Remove in #<archived channel> filter"]
  the message is visible on the page behind the dialog

then the chip's own Remove control is clicked — same query, nothing retyped
  GET /api/v1/search?q=archive&…            <- fires at once, and NOT scoped (no channel_ids)
      total_messages 1
      messages[0].channel_archived = true   <- the message IS in the response body
  tabs: "All 0 | Messages 0"  +  "No results"
```

**Reproduced 5/5.** Every run with the chip present issued zero requests (four runs between 03:16 and 03:23,
then two more at 03:32). The one earlier run that appeared to contradict this did not: its request fired *after* the
snippet removed the chip, inside the same capture window. Chasing that down is what turned an
"intermittent" into a deterministic, state-gated defect — the first reading was an artefact of when
I sampled, not of the app.

**Boundary.** The request is never issued, so nothing server-side is involved; and the control is
not dead in general — the identical control in `#qa-general` and `#qa-private` fires and renders
counts in the same snippet. The difference is the channel's archived state. No mechanism claimed.

**Distinct from BUG-17**, though the second half of the run above re-confirms it: 17 is *results
returned and dropped in rendering*, 18 is *no request at all*. Fixing either leaves the other. 18 is
the worse experience of the two — 17 at least says "No results", 18 says nothing whatsoever.

**Rejected reading, recorded so it is not re-tried:** "the query is below the minimum length" — the
control channels used the same 6–7 character terms in the same snippet and fired normally, and
`probe` in the archived channel behaved identically to `archive`.

## 03:28 — the fixture artifact reaches a published High and a filed ticket. Precisely how far it reaches

The morning pass of this same sector published, at **High**, `[BE][SEARCH] Глобальный поиск не
находит людей и каналы`, and `ALK-3538` is that finding word for word. My own earlier note in this
log ("People and Channels always return 0 … already in that session's published report; not
re-reported here") accepted it and moved on. The 03:06 section says why that was wrong to accept.

**Be precise about which half falls.** These are not equally affected and it would be careless to
retract both on one measurement:

```
CHANNELS  — disproven. There is a positive control: a channel created through the app IS
            returned by the server (total_channels 1, with the object). The ticket's
            «обе всегда показывают ноль» is false as written. The zeros it measured come from
            channels that were seeded straight into Postgres and so are absent from
            aloqa_channels.

PEOPLE    — NOT disproven, and I am not claiming it. Every account in the lane is seeded, so
            there is no positive control: 7 broad queries (qa_, alice, bob, user, test, admin,
            owner) returned total_users 0, which is exactly what the fixture artifact predicts
            AND exactly what a genuinely broken People search would produce. The two are
            indistinguishable here.
```

**The test that settles the People half** is a user created **through the app** — registered in the
UI, not seeded — then searched for by name. I did not do it: creating accounts is outside what I do
here, and CLAUDE.md's fixture rule says to use the existing accounts. It is one step for whoever
picks the ticket up.

**Every other piece of the ticket's evidence is consistent with the artifact**, including the part
offered as proof that the index is healthy — «сообщение находится через две секунды после
отправки». Messages are posted through the app, so they are indexed; that observation does not
distinguish a live index from one that is simply missing the seeded rows.

**What should happen** — a comment on `ALK-3538` with the positive control and the two-line repro
for the People half, not a new ticket and not a silent close. **Nothing filed or commented**; it is
in the closing summary as a recommended action, alongside the other five.

**And a note for whoever maintains the morning report:** its finding of the same name has the same
problem, and its `[BE]` label is at best half right.

### 03:31 — the two ways to scope search at an archived channel behave differently, which separates 18 from 11

Same logical state ("search scoped to an archived channel"), two entry points, two different
behaviours. Both measured in one snippet with a live channel as the control:

```
A. channel header "Search in channel", standing in the archived channel   -> BUG-18
     search requests: NONE in 7 s
     tabs: "All  Messages  Channels  People  Files"   (no numbers anywhere)
     no "No results", no empty state

B. typed  ":in #<archived channel> archive"  from a normal channel        -> already BUG-11
     GET /api/v1/search?q=archive&…      fires, but WITHOUT channel_ids   <- filter not applied
       total_messages 1
     chip shown regardless: button[aria-label="Remove in #<archived channel> filter"]
     tabs: "All (blank) | Messages 0"

C. control, typed ":in #<live channel> probe"
     GET …&channel_ids=<live channel>&…  scoped correctly, total_messages 24
     tabs: "All 25 | Messages 24"
```

So B is the case already published as finding 11 (a chip claiming a filter that never went on the
wire — measured there for a channel without access, an archived one and a nonexistent one). **A is
not B**: no request is issued at all, and the tabs carry no numbers rather than zeros. A fix for
either leaves the other, so 18 stays a separate finding.

Worth noting for whoever fixes them: the two paths clearly set the scope through different code,
because only one of them suppresses the request entirely. That is a pointer, not a cause — I did
not read the code and claim nothing about it.

B's `Messages 0` against `total_messages 1` on the wire is BUG-17 again, third independent sighting.

### 03:32 — BUG-18 holds on both archived channels, control in the same run

One snippet, three channels, the same query `probe`, no chip removal anywhere:

```
qa-archived        (seeded, archived)      banner present   search requests: NONE   tabs: no numbers
e-arch-probe-2353  (app-created, archived) banner present   search requests: NONE   tabs: no numbers
qa-general         (live, control)         no banner        GET …&channel_ids=…     tabs: All 25 | Messages 24
```

That rules out the two readings left open: it is not one odd channel, and it is not how the channel
was created — the seeded and the app-created archived channel behave identically, while the live
control in the same run works. Seven runs total for this finding now.

The scope chip is present in all three (`Remove in #<channel> filter`), so the dialog believes it is
scoped in every case; only the archived two never issue the request.

### 03:33 — archived-channels panel: measured, deliberately NOT reported

The panel's description misdescribes its own interaction:

```
heading      "Archived channels"
description  "Channels archived in this workspace. Select a channel to restore it."

row 1  "<channel A>  No activity yet"   [ Open ] [ Unarchive ]     <- created by this account
row 2  "<channel B>  No activity yet"   [ Open ]                   <- created by another account

clicking the ROW itself (not a button):
  /w/<ws>/c/<liveChannel>  ->  /w/<ws>/c/<channelB>
  archived banner present, history readable, composer absent
```

So "select a channel" **opens** it read-only; restoring is a separate button, and on row 2 that
button is absent entirely.

**Not a finding, on two counts, and the second one is the interesting one.** The absent `Unarchive`
is correct: `ALK-1442 [FE-WEB] Unarchive action shown to users without archive permission` is in
`TESTING`, i.e. closed — hiding it from an account without the permission *is the fix*, and this
account did not create channel B. What is left is one sentence of wrong instruction text, which is
exactly the cosmetic trivia CLAUDE.md says gets trimmed at triage. Logged so the next session does
not re-measure it; not written up.

Also confirmed working here: the panel's `Open` navigates correctly, the archived channel renders
its history, the composer is correctly absent, and the banner explains the state with an
`Unarchive channel` action where permitted.

### Corroboration for the 03:06 fixture finding, from Jira rather than from me

`ALK-2093 [BE] Rename Channel не обновляет его документ в Search index` (BLOCKED) is independent
confirmation that channels live in a **search index kept in sync by events** — a rename not
propagating is the same class of gap as a seeded row never being indexed at all. It is not a
duplicate of anything here; it is evidence that the mechanism I described is the real one.

### Verified working, archived surfaces
- The file `Share…` picker lists only live channels — an archived channel cannot be chosen as a
  share target. Correct, and it is why the "file inside an archived channel" seam could not be
  built without unarchiving; that seam is therefore untested and stays that way.

### 03:35 — sixth correction of my own: the section timestamps in this stretch were invented

Five section headings written between 03:06 and 03:34 carried times 30–65 minutes ahead of the
clock (`03:15`, `03:55`, `04:05`, `04:20`, `04:35`, plus a coverage-index stamp of `04:40`). I was
estimating elapsed time instead of reading `TZ=Asia/Tashkent date`, which CLAUDE.md warns about
explicitly — and having warned about it, I did it anyway across six consecutive entries.

All corrected against the clock readings actually taken during the run (02:50, 03:06, 03:11, 03:15,
03:17, 03:24, 03:27, 03:33, 03:34), together with every cross-reference to them.

**Why this is worth a correction entry rather than a silent fix.** A session log's timestamps are
provenance: they are what lets a later reader line a finding up against the build watcher, a server
log, or another lane's log. Wrong ones are worse than absent ones, because they look authoritative.
The BUG-18 repro count is the concrete case — it claimed five runs at named times that never
happened; it now says four runs in a window and two later, which is what the transcript supports.

Nothing measured changed. The measurements were all taken from live output; only my labels on them
were wrong.

### 03:37 — near-miss: "the Channels tab stops working while a search is active" was my own click

For a minute this looked like a clean Medium: with a query in the Directories search box, clicking
`Channels` left `aria-selected="false"` on the tab and the panel still reading
"No people match your search."

It was the rig. The click came from `element.click()` inside `page.evaluate`; a real Playwright
click on the same element switches the tab every time:

```
                       before                    after                        switched
no query   [control]   People:true  Channels:false -> People:false Channels:true   yes
"qa-empty"             People:true  Channels:false -> People:false Channels:true   yes   ?tab=channels
"qa"                   People:true  Channels:false -> People:false Channels:true   yes   ?tab=channels
```

**Verified working, and worth recording as behaviour:** the query survives the tab switch and is
applied to the new tab — `qa-empty` on Channels lists exactly that channel with `Join`, `qa` lists
both public channels. The URL follows (`?tab=people` -> `?tab=channels`).

**The driving lesson, for `## Driving this app`.** `aria-selected` reading `false` after a click is
*not* evidence the control does nothing — it is equally consistent with the click never landing,
which is the exact trap CLAUDE.md names. The tell here was available before the measurement: a
synthetic `.click()` inside `page.evaluate` skips the real event sequence this app's tab control
apparently needs, while `locator.click()` does not. **Prefer `locator.click()`; use synthetic
`.click()` only for elements a locator cannot address, and never trust a negative result from
one.** Every synthetic click in this session's snippets that produced a "nothing happened" reading
deserves the same second look — the archived-panel row click at 03:33 was synthetic too, but it is
safe because it produced a *positive* result (the URL changed).

That makes fourteen false negatives tonight, and this one is a new shape: not a filter excluding
what I was looking for, but a driver too weak to trigger what I was testing.

### 03:38 — audit: every finding whose evidence is "I did X and nothing happened"

Prompted by the 03:37 near-miss. Four of the eighteen rest on a negative; each was checked for a
proof that the input actually reached the app, and **all four hold**:

```
BUG-6  reminder not sent      the form showed shownValue "15 minutes before" before the capture,
                              AND the POST body carries no reminder field of any kind — so no
                              landed click could have been transmitted either way.   IMMUNE
BUG-15 Reset all vs theme     the same click DID reset density (compact->cozy) and font scale
                              (XL->M) in the same reading. Landing proven by what changed. HOLDS
BUG-7  two hotkeys            Cmd+K is not a null result at all — it opens the composer's own
                              "Insert link" and moves focus into it. Cmd+N is null, but the same
                              key works on another screen and a third combination works in the
                              same channel in the same run.                          HOLDS
BUG-18 no search request      the two live control channels fire in the same snippet with the
                              same typing, and the scope chip appears in the archived case, so
                              the dialog did register the input.                     HOLDS
```

The remaining fourteen do not depend on a negative: each rests on something that *did* happen —
a value present in a response and absent on screen, a chip shown, a wrong member resolved, a stale
date rendered.

**What the near-miss actually changes** is not any finding but the driver: `locator.click()` from
here on, and a synthetic `.click()` never accepted as evidence for a negative. The one synthetic
click still standing in tonight's evidence is the archived-panel row at 03:33, and it is safe
because its result was positive — the URL changed.

### 03:43 — search sort: all three modes verified, and they genuinely reorder

The control offers **Relevance | Date | Alphabetical** (a menu of `button`s inside
`div[role=menu]`, not `[role=menuitem]`). One query, Messages tab, switching only the sort:

```
Relevance     DM hit first, then channel messages
Date          badge-probe-3 231944 first  -> newest first, descending
Alphabetical  "@qa_e_alice mention…", then badge-probe-1, -2, -3  -> ascending by text
Relevance     identical to the first Relevance reading            -> round-trips
```

Three distinct orders and a clean round-trip, so the control is not decorative. Counts stay
`All 27 | Messages 26` throughout, which is right — sorting must not change the result set.

**Markup note for the next session, this cost two probes:** the result rows are **not**
`button`/`a`. Enumerating those inside the dialog returns only the 11 chrome controls and no
results at all, which reads exactly like "the list is empty". The rows are `div` inside a
`[role=listbox]`. Enumerate `[role],[tabindex],button,a,li` — the same "enumerate what is
interactive, not what you expected the markup to be" rule, hit for the second time tonight.

### 03:46 — search dialog keyboard: all four advertised behaviours verified working

The dialog's own footer promises `↑↓ navigate  ↵ open  ⌘↵ open in new tab  ESC close`. All four
hold. Selection is exposed as `aria-activedescendant` on the input, **not** as `aria-selected` on
the rows — that attribute belongs to the type tabs, and reading it instead reports the tab strip's
state and looks like the arrows do nothing.

```
typed        aria-activedescendant = …-row-0   "dm notification probe"
ArrowDown    -> row-1   ArrowDown -> row-2   ArrowDown -> row-3   ArrowUp -> row-2
Enter        highlighted row read as "muted channel probe"
             -> /w/<ws>/c/<channel>?m=<id>, dialog closes
             -> that id fetched back from the channel: body "muted channel probe"   no off-by-one
Cmd+Enter    tabs 1 -> 2, new tab at ?m=<id>, current page URL unchanged, dialog closes
Escape       dialog closes, URL unchanged
```

The Enter check is the one worth keeping: highlighting one row and opening another is the failure
this control invites, so the id was resolved back to its message body rather than trusting that a
navigation happened.

**Observation, not a finding:** `Cmd+Enter` also closes the dialog. Keeping it open would let a
user open several results in tabs in one pass, which is usually the point of the shortcut — but
closing is a defensible choice and nothing promises otherwise.

### 03:48 — search failure handling: the gap in the cross-cutting list, and it is clean

The earlier cross-cutting note covered failure handling on Directories, Files and Calendar but not
Search. Closed now, and the interesting answer is the one that did **not** happen: a failed search
does not masquerade as an empty result.

```
HTTP 500 from /api/v1/search        -> "Search error" + Retry,  All 0,  no "No results"
request aborted (net::ERR_FAILED)   -> "Search error" + Retry,  All 0,  no "No results"
   3 requests attempted, 2 recorded as failed — so the failure really reached the client
Retry after the route is lifted     -> recovers, "All 4 | Messages 4", error and Retry gone
```

**A first attempt at this was invalid and is worth recording.** I aborted the endpoint and re-ran a
query I had *already searched a moment earlier*; the dialog showed the full previous result set and
I nearly wrote "the abort is ignored". React Query served it from cache and no request was ever
attempted. The fix was a query string never used before, plus counting attempts with
`page.on('request')` and `requestfailed` instead of trusting that interception implies a request.
**Any failure test on a screen backed by a query cache needs a cold key**, or it measures the cache.

### 03:50 — notifications panel failure handling: clean, and one caveat on my own timestamps

```
abort on /api/v1/notifications, cold load  -> "Could not load notifications" + Retry
                                              4 requests attempted, 4 failed
HTTP 500, cold load                        -> identical panel, same Retry
both cases: no stuck spinner, no false empty state, no raw trace_id or error key
```

That completes failure handling across the sector's five surfaces: Directories, Files, Calendar,
Search and now Notifications.

**Selector trap worth recording, because it produced a confidently wrong first reading.** My first
attempt picked the panel by "a visible container whose text mentions *notification*, longest one
wins". That matches the **channel**, because the fixture messages are literally named
"notification probe" — so baseline and failure case came back byte-identical (2033 chars of channel
content) and looked like "the failure changes nothing". Anchor on the panel's own control
(`Mark all as read`) or on `role=dialog`, never on a word the page content can also contain.

**Corroboration in passing:** the panel rendered `QA Bob, #<archived channel>: New channel …` —
the archived channel by name, not `Unknown channel`. That independently matches the earlier
re-test where **ALK-2779 did not reproduce**.

**Minor, not reported:** `Mark all as read` stays enabled while the list is in its error state.
Given ALK-3024's finding that this control *deletes* rather than marks, an enabled destructive
action over a list that failed to load is worth a developer's glance, but nothing here measures it
as harmful and I did not click it in that state.

**Caveat on the 03:38 timestamp correction:** it covered the six headings I could re-derive from
clock readings taken in that stretch. Earlier sections of this log were not re-verified, and at
least one (`## 03:05–03:40 +05 — ALK-2779 …`) carries a range that overlaps tonight's small hours
while sitting far earlier in the file. Treat timestamps before 02:50 as approximate; the
measurements under them are unaffected.

### 03:52 — "Skip to content": works, and the channel case that looks broken is not

```
/files, /directories   focus at load = BODY
                       first Tab -> A "Skip to content" href="#main-content",
                                    visible on focus at (16,16), hidden otherwise (rect -1,-1)
                       Enter -> location.hash "#main-content"
                       next Tab -> lands inside main ("Search files…" on Files)

a channel            focus at load = DIV[aria-label="Compose message"]
                       first Tab -> a composer-toolbar button, never the skip link
```

**The channel case is not a defect** and it is worth writing down why, because it reads like one:
the app puts initial focus in the composer, which is already inside `main`, so a keyboard user is
past the navigation before the skip link would have helped. The link is still first in the DOM and
reachable by Shift+Tab.

**First attempt was invalid**, same class as the others tonight: I called `document.body.focus()`
to "reset" the tab order, which does not reset anything — Tab continued from wherever focus already
was, landed on a toolbar button, and Enter then opened an unrelated control whose `Close` button
became the active element. A fresh `goto` is the only reliable reset, and the tell was available in
the reading itself: `focusAtLoad` said `Compose message`, not `BODY`.

### 03:53 — finding 10 (Day opens on yesterday) re-confirmed live, inside the window, on real time

No timezone override, no contrivance — just the actual clock sitting inside the 00:00–05:00 local
band where the local date and the server's date disagree:

```
browser local date   2026-08-27          (Asia/Tashkent, GMT+05:00 shown correctly in the grid)
browser UTC date     2026-08-26
Day view heading     "WEDNESDAY 26 August 2026"        <- yesterday
label above it       "Wednesday, August 26"  with a "Today" button offered
request issued       from=2026-08-25T19:00:00.000Z&to=2026-08-26T19:00:00.000Z   <- the 26th in +05
summary              "meetings 16  h 6.5"              <- yesterday's whole schedule
```

So it is not just the title: the request, the heading and the summary are all yesterday's day. This
is the third independent confirmation and the first on real time rather than an injected zone.

**Two checks queued for 05:00 local (= 00:00 UTC), when the two dates converge:**
1. **Self-heal on real time** — reload cold and expect `Day` to open on the 27th with
   `from=2026-08-26T19:00:00.000Z`. If it flips exactly at UTC midnight with nothing else changed,
   that is as clean a demonstration of the cause as this can get, and it needs no override at all.
2. **Mirror image** — `Emulation.setTimezoneOverride('America/New_York')`, cold load, expect
   `Day` to open on **tomorrow's** local date. That is the one claim in the finding never measured
   directly; until 00:00 UTC no zone on earth can produce it (with UTC on the 26th, no offset makes
   local < UTC).

### 03:54 — another correct date computation in the same window, so finding 10 stays narrow

Inside the same 00:00–05:00 band, with `Day` showing yesterday, the **New meeting** form prefills
the local date and time correctly:

```
clock            local 2026-08-27 03:54   |   UTC 2026-08-26
form prefill     Starts date  input[date]  value "2026-08-27"     <- local date, correct
                 Starts time  input[time]  value "04:00"          <- rounded up from 03:54
                 Ends   date  "2026-08-27"      Ends time "04:30"
```

A user creating a meeting "now" in this window gets today, not the server's yesterday. That was the
damaging possibility worth ruling out, and it is ruled out.

**Deliberately NOT changing the report's "seven other date computations are correct" to eight.** I
do not have the list of which seven were counted, so incrementing risks double-counting this one.
Seven understates and stays true; eight might not. The finding's localisation argument does not
need the extra point.

Also noted from the same dialog, both correct: the duration presets and the whole access section
render, and the date fields are real `input[date]`/`input[time]` — worth knowing, since finding 16
concerns an end-before-start that this form accepts silently.

### 03:56 — Files relative dates across local midnight: correct, and the boundary lands exactly right

Fourteen files, every rendered label compared against `created_at` from the API, taken while local
and UTC dates disagree:

```
local now 2026-08-27 03:56      UTC now 2026-08-26T22:56
local midnight == 19:00 UTC

created 2026-08-26T20:05 UTC  -> shown "Today"       (= 01:05 local on the 27th)   correct
created 2026-08-26T20:03 UTC  -> shown "Today"       x2                            correct
created 2026-08-26T17:25 UTC  -> shown "Yesterday"   (= 22:25 local on the 26th)   correct
created 2026-08-26T14:31 UTC  -> shown "Yesterday"   … and eight more              correct
14 of 14 agree
```

The switch happens exactly at 19:00 UTC, which is local midnight — so this computation uses the
browser's zone, not the server's. **Another independent point against a systemic timezone problem**,
still not counted into the report's "seven" for the double-counting reason logged above.

**Two false positives avoided in a row here, both mine, both the same shape.** First pass reported
*every* file as "Today" — the label came from an ancestor container walked up from the filename,
not from the row. Reading each row's own leaf cells gave "Today" and "Yesterday" side by side. The
second pass then flagged one "mismatch", which was the parser catching `31 KB` out of a
differently-structured cell rather than a date. **Neither was a product defect, and a naive
screenshot-and-eyeball would have reported the first one.**

### 03:58 — end-of-session console/network sweep, 11 routes on the deployed build: clean

```
route                        console errors   4xx/5xx   main   page h-scroll
/directories                       0             0      yes         0
/directories?tab=channels          0             0      yes         0
/calendar                          0             0      yes         0
/files                             0             0      yes         0
/chat/saved                        0             0      yes         0
/chat/mentions                     0             0      yes         0
/settings/account                  0             0      yes         0
/settings/appearance               0             0      yes         0
/settings/sessions                 0             0      yes         0
/c/<public channel>                1             1      yes         0
/c/<private channel>               1             1      yes         0
```

No uncaught exceptions anywhere, no page-level horizontal scroll on any route, `main` present on
all eleven. This re-runs the earlier nine-route sweep on the same build after a full night of
testing and adds `/chat/saved`, `/chat/mentions` and `/settings/appearance`.

**The two 404s are one thing, and it is not mine.** Both are messages that still reference a file
that has since been deleted:

```
GET /api/v1/files/<id>/content  -> 404      (from rendering the channel)
GET /api/v1/files/<id>          -> 404 {"code":404,"key":"FILE_NOT_FOUND", …}
the same ids are absent from GET /users/me/files?workspace_id=…   -> genuinely deleted
```

So an attachment inside a conversation keeps pointing at a removed file and fetches it on every
channel load. **Sector C owns "files sent inside a conversation"**, so this is theirs, not written
up here — but the measurement is above, ready to use. The deletions were made by this session's own
testing, so a fresh workspace may not show it; the question of what a message should render once its
attachment is gone stands regardless.

### 04:00 — finding 3's "presence is drawn on adjacent screens" verified by colour, not by text

I went looking for a seventh self-correction and did not find one. Reading the profile popup's text
gave `QA Bob | Message | Call | Block | Share | SHARED CHANNELS · 2` — no presence word anywhere,
which looked like finding 3 asserting something false. It is not: the popup shows presence as a
**dot**, which no text reading can see. Diffing the popup markup for an online against an offline
member, 60-odd nodes each, one node differs in colour:

```
node 14  online   SPAN.absolute.rounded-full.border-2.border-bg.bottom-0.5.right-0…  14x14  rgb(19, 122, 58)
node 14  offline  same class chain, same box                                          14x14  rgb(156, 163, 175)
```

Ground truth for the same instant, and the server has it exactly right:

```
GET /api/v1/workspaces/<ws>/presence -> 200
{"presences":[{…admin,"online":false},{…alice,"online":true},{…bob,"online":true},
              {…carol,"online":false},{…dave,"online":false,"last_seen_at":"…T15:01:41Z"},
              {…guest,"online":false,"last_seen_at":"…T15:07:07Z"},
              {…owner,"online":false,"last_seen_at":"…T17:36:14Z"}]}
```

**Added to the report**, because it turns finding 3 from "presence is missing here" into "the
indicator component already exists two clicks away and is simply not used in the row" — which tells
a developer what to do, not just what is wrong.

**Independent confirmation of the long-session test:** the parked second browser reports
`online: true` here, from a different account's session and a different endpoint than the one that
test polls. Its socket is genuinely alive, not merely reporting itself alive.

**And a rule I nearly broke, having written it myself twice tonight:** absence in `innerText` is not
absence. A colour-coded indicator, an icon, a border — none of them are text. The row-versus-popup
diff is the only honest way to ask this question, which is exactly what finding 3 already did for
the rows.

### 04:02 — four zones at one instant, re-run on the deployed build, plus a nuance worth having

```
zone                 local date   UTC date   Day heading            follows
America/New_York     2026-08-26   08-26      WEDNESDAY 26 August    both agree
America/Los_Angeles  2026-08-26   08-26      WEDNESDAY 26 August    both agree
Etc/GMT+12           2026-08-26   08-26      WEDNESDAY 26 August    both agree
Asia/Tashkent        2026-08-27   08-26      WEDNESDAY 26 August    UTC, not local
```

Only one zone can currently disagree with UTC, and in that one the heading follows UTC. The other
three are controls, not evidence — they agree with everything.

**The nuance, which is new:** the day *window* in the request is built in the browser's zone
correctly; only the day it is built *around* comes from the server.

```
New_York (UTC-4)   from=2026-08-26T04:00:00.000Z  to=2026-08-27T04:00:00.000Z   = 00:00–24:00 local
Los_Angeles (-7)   from=2026-08-26T07:00:00.000Z  to=2026-08-27T07:00:00.000Z   = 00:00–24:00 local
Etc/GMT+12         from=2026-08-26T12:00:00.000Z  to=2026-08-27T12:00:00.000Z   = 00:00–24:00 local
Tashkent (+5)      from=2026-08-25T19:00:00.000Z  to=2026-08-26T19:00:00.000Z   = 00:00–24:00 local, wrong day
```

Every window is exactly midnight-to-midnight in the browser's own zone. So the timezone handling
around the date is right and only the seed date is wrong — which is the same narrow conclusion the
finding already draws, now visible in the request rather than inferred.

**Still pending, and only possible after 00:00 UTC:** the mirror image. Right now no zone on earth
can have a local date *behind* UTC, because UTC is at the start of its day.

### 04:09 — All day: fully characterised, reproduces on this build, and NOT reported — it is ALK-3109

New ground (the `All day` toggle is not in the coverage index), measured to the end, and then the
dedup pass found it is already open **and In Progress**:

```
ALK-3109  In Progress  [FE-WEB][CALENDAR] Событие All day нельзя создать на сегодня:
                       форма отвечает Start time must be in the future
ALK-3520  REVIEW       [BE][CALENDAR] Событие на весь день на текущую дату отклоняется
                       как starts_at в прошлом
```

Reported nowhere by me. Recording the measurement anyway, because it **reproduces on the deployed
build** and carries two details the ticket's summary does not.

```
clock          local 04:09 on 2026-08-27
form, All day on:
  Starts date  2026-08-27
  Starts time  04:30          <- visible, hit-testable, and 21 minutes IN THE FUTURE
  Ends date    field absent, Duration section gone
submit  ->  0 POSTs to /calendar/meetings, dialog stays open
            toast: "Start time must be in the future"
reproduced 3/3
```

**Detail 1 — the message contradicts the form on screen.** The start time the user can see is
04:30, later than the 04:09 clock. So the rule is not being applied to the value shown; a user
reading both has no way to make sense of it.

**Detail 2 — the visible time input is ignored entirely in All day mode.** The same form for
*tomorrow* succeeds and sends local midnight, not the 04:30 on screen:

```
All day, tomorrow   -> 200  {"starts_at":"2026-08-27T19:00:00.000Z","ends_at":"2026-08-28T19:00:00.000Z",
                             "timezone":"Asia/Tashkent"}      = 00:00 -> 00:00 local, correct
timed, today [ctl]  -> 200  {"starts_at":"2026-08-26T23:30:00.000Z", …}   = 04:30 local, correct
```

So all-day semantics are right, the control channel works, and only "today" is refused. The leftover
time field is what makes the error unreadable — worth a comment on ALK-3109 rather than a new
ticket, and that is in the closing summary as a recommended action, not done.

**Fixture residue from this test:** two meetings created in lane E — one all-day tomorrow, one timed
today at 04:30. Both named with the `QA-E allday` prefix. Left in place; the workspace is disposable
and `seed.sh` does not remove meetings.

### 04:11 — meeting form: which controls are actually built, and a substring trap that nearly inverted the answer

```
37 visible controls in Schedule meeting
 3 genuinely disabled:
     "Custom RRULE"                      aria-disabled="true", cursor-not-allowed, opacity-50
     "Room · Reserve an office meeting"  aria-disabled="true"
     "Aloqa"                             disabled property (the already-selected provider)
34 enabled and usable
```

So the two unbuilt features are **honestly disabled rather than pretending to work** — the same
pattern already recorded for `Privacy & security`. Not a defect; recording it so nobody files
"Custom RRULE does nothing".

**The trap, and it is a good one.** My first pass reported **33 of 37 disabled**, including
`Cancel` and `Schedule meeting` — controls I had successfully clicked minutes earlier. The check was
`/cursor-not-allowed/.test(className)`, and Tailwind writes the *variant*
`disabled:cursor-not-allowed` into the class list of every button that merely **has** a disabled
style. The substring matched the variant, not the state.

```
wrong   /cursor-not-allowed/.test(cls)                     -> 33/37 "disabled"
right   e.disabled === true
        || e.getAttribute('aria-disabled') === 'true'
        || /(^|\s)cursor-not-allowed(\s|$)/.test(cls)      -> 3/37 disabled
```

**Read a control's state from `disabled` / `aria-disabled`, not from class names** — a utility-CSS
class list contains the names of states the element is *not* in. The tell was free: the result
contradicted an action I had already performed successfully, which is the cheapest sanity check
there is and the reason to keep controls in the same run.

### 04:13 — meeting password works end to end, and that sharpens finding 6 rather than competing with it

New ground; the coverage index had meeting *access* and *duration* persisting, not the password.

```
form            "Password — Joiners must enter a password you set" reveals
                input[type=password][aria-label="Set a password"]      (built, not a stub)
submit          POST /calendar/meetings -> 200
                body keys: … is_private, "password", mute_on_join, who_can_open_rooms, max_rooms
                the value is present in the request                    -> the setting is sent
read back       GET /calendar/meetings/<id> -> 200
                {"has_password": true, …}                              -> persisted
controls        two meetings created without one: "has_password": false
```

**Security-positive worth recording:** the detail response carries only the boolean
`has_password`; the password itself is **not** echoed back. Checked by searching the whole response
body for the literal value — absent.

**Why this matters for finding 6.** Finding 6 says the reminder choice never leaves the browser, and
its strength depends on that not being true of the form generally. It is not: the *same* form, on
the *same* build, sends `password` when the user sets it and `is_private`, `requires_approval`,
`mute_on_join` besides. So "this form does not transmit optional settings" is ruled out, and
`reminder` is specifically missing. That is a control finding 6 did not have, and it makes its
boundary claim stronger.

Also confirmed in the same read-back: the all-day meeting created for tomorrow persisted as
`starts_at 2026-08-27T19:00:00Z` / `ends_at 2026-08-28T19:00:00Z` — exactly local midnight to local
midnight. All-day semantics are correct; only "today" is refused (ALK-3109).

### 04:14 — Directories → Message navigation verified, and presence turns up in a third place

```
Directories → People → row "QA Carol" → Message
  /w/<ws>/directories?tab=people  ->  /w/<ws>/d/<dmId>
  DM header: "QC  QA Carol  Offline"        <- right person, and presence shown as a word
```

The button was located by row geometry (nearest `Message` to that person's profile button, dy 0)
rather than by index, so it is provably the right row's action.

**Presence now measured in three places and missing in one:**

```
channel Members panel      shows it        (earlier in this session)
profile popup              shows it        green/grey dot, colours measured at 04:07
DM header                  shows it        the word "Offline"
Directories People row     nothing         0 status nodes across 7 rows
```

Added the DM header to finding 3's measurement block. Three-of-four is a much better argument than
two-of-three: it makes the People row an outlier rather than one of several places that lack it.

Incidentally the DM header's `innerText` again contains `Pinned message : (no message text)` —
already established at 02:52 as a node with `opacity: 0` that `elementFromPoint` does not hit.
Consistent, still not a finding, still the reason not to trust `innerText` for presence or absence.

### 04:15 — `?m=<id>` deep link: scrolls and highlights correctly. Caught only by polling

```
target: the OLDEST message in the channel (35 loaded), so scrolling is actually required
poll every 300 ms from navigation commit, 25 samples

t=300ms    top -1337   above the viewport, not yet moved
t=900ms    highlighted — background oklab(0.838786 -0.00503036 -0.0676302 / 0.451449)
                          neighbouring message background rgba(0, 0, 0, 0)
t=2100ms   last sample still highlighted
t=2400ms+  highlight gone, background back to the neighbour's
t=7500ms   top 90      in the viewport
```

Both halves work: it scrolls the message into view and marks it for about **1.2 seconds**.

**My first attempt would have filed a false finding, in two independent ways at once.** I picked
`arr[0]` as the target, assuming index 0 was the oldest — it is the **newest**, which is on screen
already, so nothing had to scroll and "it scrolled correctly" would have been vacuous. And I
sampled once at 6 s, by which time the highlight had been gone for four seconds, giving
`differsFromNeighbour: false` — i.e. "the deep link does not highlight anything".

Two rules from CLAUDE.md, both of which I had to be bitten by rather than remembering:
**poll from before the action rather than checking after it**, and **choose a target that makes the
behaviour observable** — a test whose subject was already visible proves nothing either way.

### BUG-19 [Medium] [frontend] Switching to a type tab in global search silently disables Enter, while the row stays highlighted and the footer keeps promising it (04:21)

The dialog's footer advertises `↵ open` in every state. It works on the default **All** tab and
stops working the moment the user switches to `Messages`, `Channels` or `Files` — with the same
row still reporting as highlighted. Clicking the very same row still works, so nothing is broken
about the row or its target.

**One run, one query, controls on both sides of the failing case:**

```
                       aria-activedescendant   highlighted row              footer   Enter
All tab   [control]    …-row-0                 "Open message … dm notif…"   ↵ open   -> /w/<ws>/d/<dmId>   WORKS
after Messages tab     …-row-0  (identical)    identical text               ↵ open   -> URL unchanged      NOTHING
All tab again [ctl]    …-row-0                 identical text               ↵ open   -> /w/<ws>/d/<dmId>   WORKS
```

Same query, same row id, same row text in all three. Only the tab switch differs.

**It is not specific to one bucket:**

```
Channels tab   1 option, row-0 active, Enter does nothing;  clicking the row -> /w/<ws>/c/<channelId>  works
Messages tab  23 options, row-0 active, Enter does nothing;  clicking the row -> /w/<ws>/d/<dmId>       works
Files tab      4 options, row-0 active, Enter does nothing;  click does not change the URL (a file result
                                                             opens a viewer, so that one is inconclusive)
```

**Boundary.** No request is involved at all; the row is highlighted, and a click on that same row
activates it. So the row, its target and the selection state are all fine, and only the Enter
handler stops acting after a tab switch. Where it stops is not established and no mechanism is
claimed.

**Dedup:** no open ALK bug covers keyboard activation in global search. `ALK-2643` is Enter in the
Side Rooms composer — a different surface. Checked the open-bug list for search / поиск /
keyboard / клавиш / Enter.

**How it was nearly missed, and nearly mis-stated.** My earlier keyboard pass (03:49) verified Enter
on the All tab and recorded it as working — correctly. This pass first found Enter failing on the
Channels tab and I was one step from writing "Enter fails for channel results", which is wrong: it
fails for **every** type after a tab switch, including messages, which the earlier pass had proved
working. Running the All tab as a control in the same snippet is what separated "this result type"
from "this state".

### 04:22 — a permanent positive control created in lane E, on purpose

```
channel   e-search-control     id C4OXCHJIGRU6EZQ     public, NOT archived
created   through the app (Add channel in the sidebar), not by the seed
topic     "permanent positive control for global search Channels bucket"
```

**Why it exists.** Per the 03:06 section, seeded channels never reach OpenSearch, so the
`Channels` bucket of global search could not be exercised at all in a fixture workspace — which
is what made `ALK-3538` look like a product bug. One channel created through the app fixes that
permanently. Leave it in place.

**What it immediately established:**

```
query "search-control"
  server  total_channels 1, {"name":"e-search-control","is_archived":false}
  screen  "All 6 | Messages 5 | Channels 1"          <- counted and rendered
  click   -> /w/<ws>/c/C4OXCHJIGRU6EZQ, header "e-search-control"   <- click-through works
```

Three things at once: the `Channels` bucket works end to end; `ALK-3538`'s «обе вкладки всегда
показывают ноль» is false on this build; and **finding 17's drop is specific to archived content**,
because a live channel in the same bucket is neither dropped nor uncounted. That last one is now in
the report as a control inside finding 17's measurement.

**Two more closed tickets found while deduping, both worth knowing before anyone re-opens 3538:**
`ALK-1401` «Global search returns empty results for channels and people despite existing data» and
`ALK-1592` «Channel search does not return existing channels», both in `TESTING`. This has been
reported and closed before. That does not prove 3538 is wrong, but a third report of the same
symptom, measured on seeded fixtures, deserves the positive control above before anyone spends
backend time on it.

### 04:26 — tried to settle ALK-3538's People half without creating an account. It did not settle it

The 03:28 note said the People half needs a user created **through the app**, and that I would not
create accounts. The idea here was a way round that: if the user index is fed by events, then
*editing* an existing profile might re-index that user. Worth ten minutes; it did not work, and the
honest answer is that it proves nothing either way.

```
baseline, before any edit
  "QA Alice" / "QA Engineer" / "Quality" / "alice"   ->  total_users 0 for all four

edit: Settings → Profile, jobTitle "QA Engineer" -> "QA Engineer zx9probe", Save profile
  PUT /api/v1/auth/me/settings -> 200
  body {"profile":{"jobTitle":"QA Engineer zx9probe","department":"Quality", …}, …}

after the save
  "zx9probe" / "QA Alice" / "alice" / "Quality"      ->  total_users 0 for all four
```

**Why this is not evidence that People search is broken.** The endpoint is
`/auth/me/settings` — a *settings* write. Whether `jobTitle`/`department` live on the user record
that feeds `aloqa_users`, or in a separate settings store that emits no user event, I do not know,
and the two possibilities predict exactly the same zero. The seeded-user explanation from 03:06
still accounts for the result completely.

**So ALK-3538's People half stands exactly where 03:28 left it**: unsettled, and the test that
settles it is still a user registered through the app. I am recording the failed shortcut so the
next person does not spend the same ten minutes on it.

**Fixture restored.** `jobTitle` set back to `QA Engineer`, confirmed after a reload:
`QA Alice / QA Engineer / Quality`. The display name was deliberately **not** touched — lane
selectors across the repo depend on it, and mutating a shared convention to chase someone else's
ticket is a bad trade.

**Incidental confirmation for finding 9:** this account genuinely has `department: "Quality"` and
`jobTitle: "QA Engineer"` stored. So the data finding 9 says is missing from the members response
does exist on the profile — the finding's premise is sound, from the writing side as well as the
reading side.

### 04:28 — BUG-19 corrected before publication: it is the whole keyboard, not just Enter

I wrote BUG-19 as "Enter stops working after a tab switch" and then checked whether the arrows
still moved the selection. They do not:

```
All tab, typed          aria-activedescendant  …-row-0    4 rows
All tab, ArrowDown      aria-activedescendant  …-row-1    moved      <- keyboard alive
switch to Messages      aria-activedescendant  …-row-0   23 rows
Messages, ArrowDown     aria-activedescendant  …-row-0    unchanged
Messages, ArrowDown     aria-activedescendant  …-row-0    unchanged
Messages, ArrowUp       aria-activedescendant  …-row-0    unchanged
Messages, Enter         URL unchanged
```

Twenty-three rows rendered, the first one marked as active, and no key moves or activates anything.
The footer advertises `↑↓ navigate` and `↵ open` in every one of those states.

**The report is corrected** — title, problem, measurement, expected result and the checks. The
version that existed for about fifteen minutes would have sent a developer looking for a broken
Enter handler when the arrows are equally dead; the fix is presumably one thing, and naming it
narrowly would have hidden that.

**This is the seventh correction of my own work tonight, and the second of the "true but too
narrow" kind** (the first was finding 3's cause). Worth noting the pattern: the narrow versions
were not wrong about what I measured, they were wrong about what I had not measured yet. Both were
caught by asking "what is the next thing this would also break?" rather than by re-reading.

### 04:33 — BUG-19, third and final widening: it is any control, not the tabs

```
criterion: dialog closed OR full URL changed  (NOT pathname — see the trap below)

  nothing touched   [control]   arrow moves row-0 -> row-1   Enter activates   -> /w/<ws>/d/<dmId>?m=<id>
  sort -> Date                  arrow does not move          Enter does nothing
  range -> Last 30 days         arrow does not move          Enter does nothing
  tab  -> Messages              arrow does not move          Enter does nothing
```

Three different controls, same result. The dialog has essentially no other controls besides the
input, so "any of the dialog's own controls" is the honest scope, and the three tested are named.
Report updated: title, problem, steps, measurement, cause and checks.

**A measurement trap I walked into and had to back out of.** An intermediate run compared
`location.pathname` and reported that Enter failed **even in the control case** — which would have
destroyed the finding's control. It was the criterion, not the app: a search hit in the channel you
are already in opens as `…/c/<sameChannel>?m=<id>`, so the **pathname does not change** even though
the app did exactly the right thing. Re-run with "dialog closed OR full URL changed" and the control
passes cleanly.

Worth stating plainly because it nearly went the other way: had that run been the *first* one, I
would have concluded the keyboard never works and filed something much wronger than the too-narrow
version. **A success criterion that can silently report failure is as dangerous as a selector that
excludes what you are looking for**, and it is the same mistake wearing different clothes — the
fourth variety of it tonight.

### 04:36 — BUG-19 gets a measured boundary and a workaround, and one hypothesis is killed

Two more measurements, and between them the finding went from "the keyboard stops" to something a
developer can act on directly.

**First, the state hypothesis is dead.** The in-channel dialog opens with a scope chip **already
applied** and no control ever clicked. Its keyboard works:

```
global dialog, no chip   [control]   4 rows   arrow moved -> yes   Enter activated -> yes
in-channel dialog, chip pre-applied  4 rows   arrow moved -> yes   Enter activated -> yes
```

So it is not the filter being active. It is the act of clicking a control.

**Second, where the keyboard goes:**

```
after typing            document.activeElement = INPUT  "Search messages, channels, …"
                        and that input carries aria-activedescendant  (it owns the selection)
after clicking a tab    document.activeElement = BUTTON "Messages26"
                        the button has no aria-activedescendant
click back in the input document.activeElement = INPUT, aria-activedescendant back
                        immediately: arrow moved -> yes, Enter activated -> yes
```

**This is a boundary, not a mechanism.** Three measured facts: the selection lives on the input;
clicking a control moves focus off it; restoring focus restores the keyboard entirely and at once.
That says *what to fix* — focus is not returned to the input — without claiming to know why the
handler is wired that way. Report updated: measurement block, cause and an extra check.

**And it gives the user a workaround**, which is what makes Medium the right severity rather than
High: click back into the search field. Now stated in the finding, since nothing on screen suggests
it.

That is the third and last widening of this finding. Sequence, for the record: "Enter fails for
channel results" → "Enter fails after a tab switch" → "arrows fail too" → "any control does it" →
"because focus leaves the input". Every step came from asking what else the same cause would break,
and the first version would have been actively misleading.

### 04:37 — a composite table presented as one run, caught on a read-through

Consolidating BUG-19's measurement into three numbered blocks, I built a five-row table under the
heading "контроль до и после" — control, sort, range, tab, control-again. It reads as one run. It
is not: the two control rows and the tab row come from the run that returned to `All`, and the sort
and range rows from a different run with its own control.

Relabelled as **прогон A** and **прогон B**, each with its own control. Nothing measured changed;
what changed is that the block no longer claims a run that never happened.

Worth a line because it is a quiet way to overstate: every row was real, the conclusion is
unaffected, and a reader would still have been told something false about how the evidence was
gathered. CLAUDE.md's rule is to paste what came back rather than a tidied summary, and a
hand-assembled table is exactly the tidied summary the rule is aimed at.

### 04:39 — leak sweep extended for tonight's new fixtures, and one near-scrub avoided

The checker's leak patterns predate everything created tonight. Extended with
`e-search-control`, `e-arch-probe`, `zx9probe`, `probe-pw`, `qa-e-note`, plus the staging host and
the fixture email domain. Negative-controlled: injecting the archived channel's real name into the
report makes the checker exit 1 and name the pattern.

Current report: **clean on every pattern.**

**`Asia/Tashkent` appears four times and stays.** It tripped my sweep and I nearly scrubbed it.
All four are material rather than incidental:

```
finding 6   inside the pasted POST body: …"timezone":"Asia/Tashkent","meeting_url":…
            CLAUDE.md says paste the response as it came back; editing the body would be the
            "hand-written summary of a response" the same rule warns against
finding 10  x3 — the reproduction instruction ("set the browser timezone east of UTC, e.g.
            Asia/Tashkent") and the measurement context. The finding IS about a timezone;
            removing the zone makes it unreproducible
```

The distinction worth keeping: a leak is a **test-setup** trace that tells the reader nothing
(account names, ids, ports, hosts). A timezone that the defect depends on is **evidence**. Scrubbing
by pattern alone would have removed the one detail a developer needs to reproduce finding 10.

### 04:39 — long-session reading at 229 minutes (mid-point)

```
page age      229 min (parked 00:49, never navigated since)
heap          71 MB      <- identical to the 121-min reading, and below the 91 MB at start
DOM nodes     2045       <- unchanged
messages      35         <- unchanged
visibility    visible    <- not a throttled hidden tab
auth          valid, session intact
API probe     200
composer      mounted
sidebar       2 channels (correct for this account; the channel created tonight is another
                          account's and this one is not a member)
```

No drift of any kind between 121 and 229 minutes. The presence endpoint independently reported this
account `online: true` at 04:07 from the *other* browser, so the socket is genuinely alive rather
than merely the page being intact.

Final reading still queued for ~08:30, and this browser must continue not to be navigated.

### BUG-20 [Medium] [frontend] A file opened from a search result refuses to preview an image the rest of the app previews fine (04:43)

```
the file, checked at the bytes:  name viewer.png, 910 B
  Content-Type image/png   declared mime image/png
  magic 89 50 4e 47 0d 0a 1a 0a ("\x89PNG\r\n\x1a\n"), IHDR present  -> a real, decodable PNG

same file, same account, same build, three entry points:

  Files -> click the row (lightbox)          <img> present, naturalSize 120x80, complete
                                             no error text
  Files -> row menu -> View details (ASIDE)  <img> present, naturalSize 120x80, visible
                                             no error text
  Global search -> click the file result     NO <img> at all
                                             "Preview is not available for this file type"
                                             header of the same card: "PNG  viewer.png  Image · 910 B"
```

The card that refuses to preview it labels it `Image` and `PNG` two lines above the refusal.

**Boundary.** No request is involved in the difference — the same file, fetched by the same client,
renders in two other places in the same session. So it is neither the file nor the fetch; the
search entry point opens something that declines the type. Where, not established; no mechanism
claimed.

**Not ALK-2876, and not my own 18:58 note on it.** Both of those are about images whose *bytes fail
to decode* (`fake.png`, 17 bytes of ASCII), where the symptom is an **empty preview zone with no
message at all**. This is the opposite case in both halves: a **valid** image, and an **explicit**
message asserting the type is unpreviewable. Different trigger, different symptom, and one of them
is a wrong statement rather than a missing fallback.

**Dedup:** no open ALK bug matches. Checked the open list for preview/просмотр/viewer/FILES —
`ALK-2876` (HEIC, above), `ALK-3016` (deleted file's attachment), `ALK-3007` (viewer scrollbar),
`ALK-3002`, `ALK-3200`, `ALK-3199` all differ. `ALK-2127` («Standalone File из Global Search
невозможно открыть») is closed (`TESTING`) and is about not opening at all, not about the preview
inside a card that does open.

**Found while resolving an "inconclusive"** from BUG-19's investigation, where clicking a file
result left the URL unchanged and I recorded it as inconclusive rather than as a defect. It was
inconclusive for the right reason — the click *did* work and opened a card — and following it up is
what turned it into this.

### 04:46 — BUG-20 narrowed by two controls inside the same card

```
same card, opened from a search result, three file types:
  .txt   shows the file's content ("TXT  <name>  Document · 13 B" + the text)   correct
  .zip   "Preview is not available for this file type"                          correct
  .png   "Preview is not available for this file type", no <img>                WRONG
```

So the card is not broken and the message is not spurious — it previews what it should and refuses
what it should. Only the image branch is wrong. That is a much better finding than "the card from
search does not preview": it hands the developer a working case, a correctly-refused case and the
one that is wrong, all in the same component.

Same discipline as BUG-19's three widenings, applied in the other direction — there the question was
"what else does this break?", here it was "what does it still get right?". Both narrow where the
fix belongs.

## 05:03 — the two midnight checks both landed. Finding 10 is now proved in both directions

The last unmeasured claim in the report is measured, and the more striking of the two checks was
free.

**1. Self-heal on the real clock — no override, nothing touched but time passing.**

```
local 04:20  UTC 23:20   local date 08-27  UTC date 08-26
   Day -> "WEDNESDAY 26 August 2026"   from=2026-08-25T19:00:00.000Z  meetings 16, h 6.5

local 05:00  UTC 00:00   local date 08-27  UTC date 08-27
   Day -> "THURSDAY 27 August 2026"    from=2026-08-26T19:00:00.000Z  meetings 9, h 11.5
```

Same browser, same profile, same zone, same build. The defect disappeared at the instant the
server's date caught up with the local one. Nothing else in the system changed.

**2. The mirror image — the claim the finding asserted but had never measured.** Until 00:00 UTC no
zone on earth could have a local date *behind* UTC; now three can:

```
America/New_York     UTC-4    local 08-26   UTC 08-27   Day -> 27 August   TOMORROW
   request from=2026-08-27T04:00:00.000Z to=2026-08-28T04:00:00.000Z   (00:00–24:00 NY on the 27th)
America/Los_Angeles  UTC-7    local 08-26   UTC 08-27   Day -> 27 August   TOMORROW
Etc/GMT+12           UTC-12   local 08-26   UTC 08-27   Day -> 27 August   TOMORROW
override cleared              local 08-27   UTC 08-27   Day -> 27 August   correct
```

So `Day` does not show "yesterday" and does not show "the wrong neighbouring day" — it shows
**the server's date**, and it does so in both directions: yesterday for zones ahead of UTC, tomorrow
for zones behind. Clearing the override returns it to correct, so the readings are not an artefact
of the override mechanism.

**And the same reading re-confirms the narrowing:** every request window is exactly
midnight-to-midnight *in the browser's own zone* (NY gets `T04:00Z`, LA `T07:00Z`, GMT+12
`T12:00Z`). The timezone arithmetic around the date is right; only the date it is built around is
wrong. That is what keeps this a narrow defect rather than "the calendar mishandles timezones".

**The report's measurement block is upgraded and one thing was removed to make room.** The old
four-zone table had one zone disagreeing and three merely *agreeing* with UTC — controls, not
evidence. It is replaced by the self-heal and the mirror table, where three zones disagree in the
opposite direction. Same length, far stronger.

**Nothing else in the finding changed**, because the prose already claimed both directions
("для зон восточнее UTC это первые часы суток, западнее — вечер"). What changed is that the claim
is now measured rather than reasoned. It was written that way at 00:38 on the strength of the
cause read out of the source, and holding it as an assertion for four hours until it could be
tested was the right call — but it was an assertion, and now it is not.

### 05:07 — calendar navigation across the year boundary: correct in both views, both directions

Untested ground — the coverage index recorded month and week navigation generically, not the
year rollover, which is where date arithmetic usually breaks.

```
Month forward   August 2026 -> … -> December 2026 -> January 2027 -> February 2027
  request for January 2027:  from=2026-11-29T19:00:00.000Z  to=2027-01-10T19:00:00.000Z
  (42 days — a month grid with its leading and trailing days; correct)

Month backward  August 2026 -> … -> January 2026 -> December 2025 -> November 2025

Week forward    21–27 December 2026
             -> 28 December 2026 – 3 January 2027     <- both years named, correctly
             -> 4–10 January 2027
             -> 11–17 January 2027
  requests    from=2026-12-27T19:00:00.000Z  to=2027-01-03T19:00:00.000Z
              from=2027-01-03T19:00:00.000Z  to=2027-01-10T19:00:00.000Z
```

Twenty-one consecutive weeks and nine months walked without a wrong label or a wrong window. The
cross-year week is the case worth naming: it is labelled with **both** years rather than picking
one, and its request is exactly the seven local days it claims.

**Extraction note.** My first week walk produced `24–30 -> 31 -> 7–13` and looked like the header
was losing information at month boundaries. It was my regex, which only matched a day range
followed by a month name and so truncated `31 August – 6 September 2026` to `31`. Taking the
first visible leaf that contains a month name gives the real headings. Same lesson as the rest of
tonight: the pattern excluded the case it was meant to inspect.

### 05:10 — finding 5 confirmed a third time, from a route I had not used, plus one new symptom

Testing filter *combination* (untested ground) reproduced finding 5 independently:

```
":@ Bob probe"                  chip "Remove @QA Bob filter"      CORRECT — one-word name
":@ QA Carol probe"             chip "Remove @QA Admin filter"    wrong person, q="Carol probe"
":@ QA Bob :in #<chan> probe"   chip "Remove @QA Admin filter"    wrong person
                                input left as "Bobprobe"          <- the space is gone
                                q="Bobprobe"  total_messages 0
                                reproduced twice, character for character
```

The one-word control passing is what makes this the parser and not people-search, and finding 5
already says so. What is new is the **combination** case: with a second filter after it, the
leftover words are joined without the space, so the query becomes a word that cannot match
anything and the user gets a confident zero.

Added to finding 5's measurement block; **not a separate finding**, because it is the same
one-word-after-`:@` parse and the same fix. Splitting it would put two tickets on one line of code.

Worth noting the shape: this was not a hunt for finding 5, it was a test of something else
(combining filters), and it landed on the same defect from a different direction. Three independent
confirmations now, and the earlier struggle with this finding — rewritten three times before it was
right — makes the third one worth recording rather than assuming.


**Note on how this entry got written:** the heredoc that appended it was unquoted, so the shell
executed the backticks in the prose as command substitution. One phrase lost its content
(`` `:@` `` became empty, with `command not found: :@` in the output) and has been repaired above.
Every other append tonight used a quoted heredoc; this one was changed to interpolate a
`$T` timestamp and lost the quoting with it. **Use `<<'EOF' `and substitute the timestamp
afterwards** — prose full of backticked identifiers is exactly the wrong thing to hand an
unquoted heredoc, and the failure is silent apart from one stray error line.


### 05:12 — typed-filter boundaries: the `:@` chip is shown for a name that belongs to nobody

Untested boundaries, one run each:

```
":@ Zzznobody <word>"      chip "Remove @Zzznobody filter"      <- a person who does not exist
                           request: q=<word>, no dm_ids, no channel_ids
                           results: All 27 / Messages 26 — the FULL unfiltered set
":in #zzz-no-such <word>"  chip "Remove in #zzz-no-such filter"  <- this is finding 11, confirmed
                           request: q=<word>, no channel_ids, 26 messages
":@ " alone                no chip; the literal ":@" is sent as the query, 0 results,
                           "No results" shown — but 6 completions are offered below, so the
                           dialog is helping rather than dead-ending
":in " alone               no chip; ":in" sent as the query, 2 matches, 5 completions offered
```

**Added to finding 5, not filed separately.** Finding 5 already covers "a real person with no DM
yet: chip shown, filter not applied". A name that matches **nobody** is the same symptom with a
stronger trigger — and it is the sharper way to state it, because "no conversation yet" invites the
reading that the filter is waiting for one, while a nonexistent name cannot.

The two bare-token cases are **not** defects: the dialog offers completions in both, so a
half-typed filter is being helped along rather than silently searched into the void.


### 05:16 — Settings About / Account / Security: verified, one copy gap logged and not reported

**About agrees with the deployed build — a useful cross-check rather than a formality.**

```
Settings -> About        "Version  v0.61.0-rc.5"
deployed build stamp     data-dpl-id="v0-61-0-rc-5-c4b5386b4a3a"   = tag v0.61.0-rc.5
```

The page reports the truth. Worth knowing: a session can read the running version from inside the
app, not only by curling the server HTML.

**Account and Security are honest about what is not built**, the same pattern as Privacy & security:

```
Account   "Danger zone — Account deactivation and deletion are not available yet."
          Deactivate and Delete both genuinely disabled (checked via the disabled property /
          aria-disabled, not class names)
Security   password change fields and 2FA, "Two-factor authentication is off." + Enable
           (enumerated only — no credentials entered anywhere)
```

**The one gap, logged and NOT reported.** About's own subtitle says "Version, licences and where to
get help." The page contains neither:

```
full body, 279 chars, scrollHeight == clientHeight (1062) so nothing is below the fold:
  "About Aloqa | Version, licences and where to get help. | Aloqa | Version v0.61.0-rc.5 |
   Workspace messaging for fast-moving teams. | Diagnostics | Send crash reports | ..."
only interactive control in the content column: one unnamed toggle (crash reports)
the words "licence" and "help" occur exactly once each — in that subtitle
```

Help does exist elsewhere: the rail's `Help & resources` opens a panel with three shortcuts and
`Open docs` -> `https://docs.aloqa.app` (external, target=_blank; not followed). Licences are
nowhere in the app, and may well live in those docs.

**Not written up** because the promised content is reachable from a persistent rail control two
clicks away, which makes this a subtitle that oversells rather than a user who is stuck — the same
call as the archived-channels panel description at 03:33. Recorded so it is not re-measured.


### 05:17 — finding 6 confirmed a third time, by meetings created for an unrelated test

The meetings created tonight for the All-day and password tests were made **without ever opening
the Reminder control**. They received reminders anyway, at the same two fixed offsets:

```
"QA-E pwd probe"        starts 23:30 UTC
   meeting_reminder_30m  fired 23:15:14 UTC   <- created ~23:15, so the missed T-30 arrives at once
"QA-E allday timed-today [control]"  starts 23:30 UTC
   meeting_reminder_30m  fired 23:10:14 UTC
   meeting_reminder_10m  fired 23:20:14 UTC   <- exactly T-10
"E2 future validation probe"         starts 22:50 UTC
   meeting_reminder_30m  fired 22:20:14 UTC   meeting_reminder_10m  fired 22:40:14 UTC
"E2 typed range test"                starts 22:00 UTC
   meeting_reminder_30m  fired 21:45:14 UTC   meeting_reminder_10m  fired 21:50:14 UTC

event types present across 60 notifications: meeting_reminder_30m, meeting_reminder_10m
                                             — and no other reminder offset at all
```

Finding 6 says the picker's value never leaves the browser and reminders arrive at fixed offsets
regardless. This is the strongest version of that: these meetings never had a reminder *chosen*,
and they still got the standard pair. The T-30 arriving immediately when the meeting is created
inside its own 30-minute window matches what the finding already records.

**Not a new finding and nothing changed in the report** — it is the same defect, and finding 6
already carries the request body showing no reminder field. Logged because it arrived free, from
meetings created for a different purpose, and it is the third independent confirmation of a
finding whose whole weight rests on "the value is never sent".


### 05:19 — finding 4 strengthened from the deploy diff: the fix for the other half shipped the same day

Reading the commits that touch sector E paths on the deployed build turned up the newest calendar
commit, and it is about exactly the gap finding 4 draws its contrast from:

```
b5ddc0075  fix(calendar): clarify recurring occurrence deletion (ALK-3069)   Aug 26 12:59 +05
  "Tell users that the current backend removes one materialized occurrence while leaving the
   recurrence series intact. Require every modal host to declare recurrence and cover both
   detail surfaces while the series-delete API remains blocked on ALK-3518."
  git merge-base --is-ancestor b5ddc0075 <deployed>  ->  yes, it is in this build
```

So the deletion path was **deliberately** given a recurrence-aware confirmation, in four languages,
with tests, on the day of this build. Editing has the same gap and did not get one.

**Verified by exhaustive enumeration rather than a guess**, which matters given how the source-cited
causes went earlier tonight:

```
packages/core/src/i18n/dictionaries/en.ts:2396
  'web.calendar.detail.deleteConfirm.bodyRecurring':
  'This removes only this occurrence of "{title}". The rest of the series stays in the calendar.'

every key whose NAME contains recurring / repeat / series      -> 1 hit, the one above
every VALUE containing "series" or "occurrence"                 -> 1 hit, the one above
```

One string in the whole English dictionary knows about series scope, and it belongs to delete.

**Added to finding 4 as measurement, not as a cause.** It explains the missing *wording* but not
the missing *scope choice*, and claiming it as the cause would over-reach in exactly the way that
cost finding 9 earlier. The expected-result section now says the wording already exists and sits in
the same dictionary — which is the actionable part.

**Also verified from the same diff:** `ef574daa6 fix(search): name the channel, author and date of a
message result (ALK-3115)` is in this build and works — every message row measured tonight reads
`#<channel> | <text> | <author> · <date>`, and DM rows name the other person in the channel slot.


### 05:20 — recent fixes from the deploy diff, verified on the build that carries them

Three commits from the last stretch of sector-E history, each checked against behaviour rather than
assumed to work because it merged.

**`af01859a5 fix(files): move a chat up the sidebar when a file is shared into it (ALK-3017)` — works.**

```
sidebar DM order before   0: <person A>   1: <person B>
share a file into <person B>'s DM from Files -> Share… -> Send
sidebar DM order after    0: <person B>   1: <person A>
```

The chat that received the file moved to the top, and the other kept its place.

**`ef574daa6 fix(search): name the channel, author and date of a message result (ALK-3115)` — works.**
Every message row measured tonight carries all three, and a DM result names the other person where a
channel result names the channel.

**`b5ddc0075 fix(calendar): clarify recurring occurrence deletion (ALK-3069)` — works, and it is the
one that strengthened finding 4** (previous entry).

**Why this was worth doing at all.** Recent commits are where regressions live, and three of the
four I picked were directly in this sector. It also gave finding 4 its best supporting fact. The
approach costs one `git log` on the deployed sha restricted to the sector's paths — cheaper than
choosing test targets by intuition, and it is already in CLAUDE.md as "a diff tells you what to
test". This pass used it at the start for a list of targets and then, tonight, again at the end for
the commits that landed on the day of the build itself.


### 05:22 — two recently-closed fixes re-verified on this build, and a four-ticket pattern behind ALK-3538

**`ALK-2884 [FE-WEB][CALENDAR] Public + Password молча сохраняется как Open` (TESTING) — fix holds.**

```
meeting created tonight with the default Public access AND a password set
GET /calendar/meetings/<id> -> {"is_private": false, "has_password": true, "requires_approval": true}
```

Both survive together, which is exactly what the ticket said did not happen.

**`ALK-2895 [FE-WEB][SEARCH] Full Search не восстанавливает query из URL` (TESTING) — fix holds.**

```
open full search from the dialog   /w/<ws>/c/<chan>/search?q=probe   input "probe"   All 25
reload the page                    same URL                          input "probe"   All 25
cold open of that URL after
navigating elsewhere first         same URL                          input "probe"   All 25
```

**The pattern worth surfacing: "search finds no people or channels" has now been filed four times.**

```
ALK-421   Sub-task  TESTING   [FE-WEB] Fix People result display and clickability in search
ALK-1401  Bug       TESTING   Global search returns empty results for channels and people
                              despite existing data
ALK-1592  Bug       TESTING   [FE-WEB] Channel search does not return existing channels
ALK-3538  Bug       BACKLOG   [BE][SEARCH] Глобальный поиск не находит людей и каналы   <- open
```

Three closed, one open, all the same symptom. Put beside the 03:06 finding — that seeded fixtures
never reach OpenSearch, so a fixture workspace shows zero people and zero channels no matter what
the product does — the likeliest reading is that this keeps being re-discovered on QA fixtures and
closed once someone checks it on real data.

**That is a hypothesis about the ticket history, not a measurement, and I am labelling it as one.**
What *is* measured: an app-created channel is returned and rendered end to end on this build
(04:22), so 3538's «обе вкладки всегда показывают ноль» is false as written. The People half
remains untested for want of an app-created user.

This raises the value of `e-search-control` being left in lane E permanently: it is the control that
breaks the loop.


### 05:24 — layout at 1920 and 2560 wide: clean, and the "clipping" is all screen-reader text

Untested ground — the coverage index had 1280 and 1440 only. Five routes at each of two widths:

```
                       page h-scroll   controls off-screen   main width
2560x1440  directories       0                 0               2188
           calendar          0                 0               2416
           files             0                 0               2416
           channel           0                 0               2188
           settings/about    0                 0               2416
1920x1080  all five          0                 0               1548 / 1776
```

No page-level horizontal scroll anywhere, no control pushed past the viewport edge, and the main
column grows with the window rather than stranding content.

**Every `scrollWidth > clientWidth` hit is a false positive, and they share one signature.**

```
"Search directories"          scrollWidth 139  clientWidth 1
"Scheduled by You"            scrollWidth 126  clientWidth 1
"QA Alice, Yesterday 11:00"   scrollWidth 189  clientWidth 1
"Chat filters are ready."     scrollWidth 159  clientWidth 1
"Create event Monday at 0:00" scrollWidth 238  clientWidth 1
"Skip to content"             scrollWidth 157  clientWidth 32
```

`clientWidth == 1` is the visually-hidden / `sr-only` pattern — text that exists for screen readers
and is deliberately collapsed. It overflows by construction. The calendar reports 211 "clipped"
nodes at 2560 for this reason alone, which would read as a catastrophic layout failure and is
nothing at all.

**So the clipping rule needs a companion condition**: `scrollWidth > clientWidth` **and**
`clientWidth > 1`, or the sr-only text drowns the real signal. On this build, with that filter,
there are zero clipped nodes on all five routes at both widths.


### 05:26 — the counter in finding 17 does not add up either, by exactly one

Checking whether the dialog's counts agree with the server turned up a second, smaller inaccuracy
inside the same finding.

```
the app's own request, q=probe:
  total_messages 28   messages[25] returned, of which channel_archived=true: 1
paging through the rest:
  offset=25 -> 3 more messages, none archived
  so across all 28 matches, exactly ONE is in an archived channel

honest count after dropping the archived one:  27
on screen:   "All 27 | Messages 26 | Channels 0 | People 0 | Files 1"
footer:      "Showing 4 results for “probe”. 27 total: 26 messages, 0 channels, 1 files, 0 people"
```

The UI is **internally** consistent — 26 + 0 + 0 + 1 = 27 = the All tab — so nothing here looks
wrong from inside the dialog. It is only against the server that the message count is short by two
when one result was dropped.

**Added to finding 17's measurement block as a fact, with no explanation attached.** I do not know
where the extra one goes, and the earlier temptation to read it out of `getFilteredTotal` in the
adapter is exactly the sort of source-inference that produced a wrong cause earlier tonight — I read
that function once, hours ago, and reasoning from memory of it would be worse than saying nothing.

**Method tightened rather than caveated.** The first pass paged with a malformed `company_id`,
which I was about to write up as a caveat. Instead I captured the app's *own* request URL, took the
`company_id` out of it and re-paged:

```
offset=0   25 messages, total_messages 28, archived 1
offset=25   3 messages, total_messages 28, archived 0
28 seen, 1 archived — identical to the first pass
```

Same numbers, now on the app's own parameters. Worth the extra minute: a caveat in a finding is a
thing a reader has to weigh, and this one was removable.


### 05:28 — the report itself rendered and measured, for the first time this session

Twenty edits in and I had never actually looked at the deliverable. Wrapped the fragment in a
minimal document and loaded it at 1280x900 in a real browser.

```
light theme
  page horizontal scroll      0            <- the requirement, and it holds
  articles                    20
  table rows                  21           (20 findings + header — matches the article count)
  <pre> blocks                20           one per finding, as intended
     of which overflow          12
     with overflow-x: auto      20         <- all of them, so wide blocks scroll inside themselves
  clipped leaf nodes           0           (scrollWidth > clientWidth AND clientWidth > 1)
  body                        bg rgb(246,248,247)  text rgb(22,32,31)

dark theme (prefers-color-scheme: dark)
  body       bg rgb(14,20,19)   text rgb(228,235,233)
  article    bg rgb(22,31,30)
  pre        bg rgb(28,39,38)   text rgb(228,235,233)
```

Both themes resolve as complete sets — no element left painting a light value on a dark ground —
and the twelve overflowing measurement blocks scroll in their own containers rather than pushing
the page sideways. That is the one thing that could plausibly have broken after this many edits to
`<pre>` contents, and it did not.

**Worth doing and worth having left this late.** Earlier it would have measured a report that then
changed twenty times; the structural checker caught the things that were going to break in between
(tag balance, counts, row/article correspondence), and this catches the one class it cannot see.


### 05:30 — one canonical title per finding, and a negative control that quietly did not test anything

Reading all twenty findings end to end turned up something the structural checker could not see:
**the summary table's rows and the articles' headings were different strings.** Not contradictory —
the rows were mostly *richer* — but different:

```
article 6  "[FE-WEB][CALENDAR] Выбор напоминания в форме встречи ни на что не влияет"
row     6  "[FE-WEB][CALENDAR] Выбор напоминания ни на что не влияет: значение не уходит в
            запрос, напоминания приходят за 30 и 10 минут в любом случае"
```

Twelve of twenty diverged like this. It matters because CLAUDE.md's whole point about the finding
shape is that an entry becomes an ALK ticket **without rewriting** — and with two titles per
finding, a triager has to choose one. All twenty rows now carry the article's heading verbatim, and
the extra detail lives in **Проблема**, which is where it belongs.

**Checker step 1c added:** every row's text, tags stripped, must equal its article's title.

**And the lesson, which is the part worth keeping.** My first negative control for that check
reported `exit=0, identical for all 20` — i.e. the check passed on a file I had just corrupted, which
should have been alarming. It was not corrupted: the `sed` pattern
`<tr><td>\[FE-WEB\]\[SHELL\] Reset all` never matched, because the row contains
`<code>Reset all</code>` and the literal text is broken up by tags. **A negative control that
silently fails to mutate reports the same "pass" as a checker that does not work** — the two are
indistinguishable from the output alone.

Redone by mutating a row through the parser, asserting the mutation changed the string, *then*
running the checker: exit 1, `TITLE/ROW TEXT MISMATCH at [19]`. **Assert that the mutation landed
before trusting that the check caught it** — the same "prove the action landed" rule that applies to
clicks, applied to my own tooling.


### 05:32 — every checker step negative-controlled, and one of them could not fail

After the title/row control turned out not to test anything, I ran the same discipline across the
whole of `verify_report.py`: mutate the report once per step, **assert the mutation changed the
file**, and require exit 1.

**First sweep, 9 of 10 caught. Step 3 did not.**

```
3 bad severity      changed=True   exit=0   caught=False
```

It was never a check. It ran `Counter(...)` over the severity chips and printed the tally — so a
finding labelled `Trivial`, or an article with no severity chip at all, passed silently. It had been
printing a reassuring `{'High': 2, 'Medium': 14, 'Low': 4}` all night while asserting nothing.

**Rebuilt as three assertions** — every severity is in `{High, Medium, Low}`, the chip count equals
the article count, and every area is `backend`/`frontend`.

**And fixing it exposed a second gap.** My first attempt to negative-control it mutated the *first*
`chip sev` in the document — which lives in the **summary table**, not in an article. The article
regex never saw it. That is a hole in itself: the table's own severity and area chips were never
compared with the article's, so a row could read `High` beside a `Low` finding. **Step 3b** now
requires them to agree per position.

**Final state — `scripts/verify_report_selftest.py`, committed to the repo:**

```
1  duplicate title        1b/1c row order/text     2  article dropped
2b thin section           3  unknown severity      3b row chip disagrees
4  prose over budget      5  leaked fixture name   6  bare citation path
6b wrong spelled count    7  unbalanced tags
11/11 steps provably catch their own failure
```

Each case asserts `changed=True` before trusting `caught` — because the failure mode that started
all of this is a mutation that silently does nothing, which is indistinguishable from a working
check by the output alone.


### 05:35 — search under latency is correct, and the same measurement sharpened finding 14

**Untested: does the search dialog flash a false empty state while results are in flight?** It does
not. Endpoint delayed by 5 s, polled every 300 ms from before the response could arrive:

```
0–5400 ms   skeleton visible, 3 placeholder rows, tabs show no numbers
            "No results" NEVER appears
6300 ms     4 real rows, "All 27 | Messages 26"
```

That is the right behaviour and it is the classic thing to get wrong.

**And it explains what finding 14's blank panel actually is.** The archived-channel dialog renders
the *same* no-numbers tab strip as a loading dialog, so "is it stuck loading forever?" was a real
question. It is not:

```
archived channel, "Search in channel", typed, polled 300 ms for 12 s
  0 ms       36 skeleton nodes
  600 ms      0 skeleton nodes      <- the skeleton is gone in under a second
  600–11400   no skeleton, no rows, no counts, no empty state, no error
  /api/v1/search requests in the whole 12 s: 0
```

So the panel does not hang — it **completes into nothing**. Something finishes at ~600 ms and
leaves a blank. Added to finding 14's measurement block along with the 5-second control, because
"stuck loading" and "settles into an empty non-state" point a developer at different code, and only
one of them is true.

The 5 s control earns its place in the finding for the same reason: it shows the loading state
itself is healthy, so nothing about skeletons or spinners is the problem.


### 05:36 — Files ↔ Search consistency re-checked against the current, larger file set

The earlier check was 11 files; tonight's testing added more, so the invariant was worth re-running
rather than assuming it survived.

```
files listed by the Files browser        14
found by searching each exact filename   14
missing from search                       0
```

Every object the browser lists, search knows about — using the app's own `company_id`, taken from
its own request rather than reconstructed.


### 05:37 — Directories ↔ members API agree, and: does the fixture artifact touch any of MY twenty?

**Directories consistency, current state:**

```
people rendered in Directories → People   7
GET /workspaces/<ws>/members              7
GET /workspaces/<ws>/presence             7
in UI but not in the API   none
in API but not in the UI   none
```

Seven is right: eight fixture accounts exist, one of which is deliberately outside the workspace.

**The audit that matters more.** The 03:06 discovery — seeded rows never reach OpenSearch —
invalidated a *published* High from the morning pass of this same sector. A reader is entitled to
ask whether it invalidates anything of mine. Every finding checked against it:

```
 1 Open full search scoping     messages ARE indexed (posted through the app)   unaffected
 5 :@ resolves the wrong person person resolution is client-side, from the member
                                list, not from OpenSearch                        unaffected
11 phantom channel chip         channel resolution is client-side                unaffected
13 archived content dropped     the archived channel is app-created, therefore
                                indexed — and the server DOES return it, which is
                                the whole measurement                            unaffected
14 no request in archived chan  no index involved; the request never happens     unaffected
15 keyboard dies after control  no network at all                                unaffected
16 image preview from search    the file IS found; the defect is the preview     unaffected
 2,3,4,6,7,8,9,10,12,17,18,19,20   nothing to do with search indexing            unaffected
```

**None of the twenty rests on a seeded row being findable.** The three search findings that *could*
have been contaminated are precisely the ones where the server **returns** the thing and the client
mishandles it — the opposite failure from the artifact, which is the server returning nothing.

Worth stating explicitly rather than leaving implied: the same discovery that undermined a sibling
report is the reason to check one's own, and "I checked and it does not apply" is only worth
anything if the check is written down.


### 05:38 — audit of every «Проверка» line for claims about *current* behaviour

**Why:** the sixteenth finding of this pass exists only because one Проверка line promised a message
(`End time must be after start`) that the form does not have. A checklist line that asserts today's
behaviour is a claim like any other, and I had not audited the rest.

Read all twenty checklists. Most lines describe what a *fixed* app should do — those need no
verification. Three assert things about the app **as it is now**, and all three were measured:

```
finding 12  "…поле помечено, фокус переходит к нему — как это уже работает для пустого названия"
  submit with an empty title:
    text on screen        "Title is required"          <- the exact string, verbatim
    title field           aria-invalid="true"
                          aria-describedby="create-event-title-error"
    document.activeElement is the title input           <- focus really does move
  HOLDS, in all three of its parts

finding 19  "Акцентный цвет, у которого есть собственный Reset accent, сбрасывается тоже"
  Display settings, visible controls matching /reset/i:  ["Reset accent", "Reset all"]
  HOLDS — the control exists and is named exactly that

finding 17  "Маршруты, которые сегодня открываются со свёрнутым сайдбаром (/files, /calendar)"
  /c/<channel>   toggle "Collapse chat sidebar"   main.left 372   channel row 287px  expanded
  /files         toggle "Expand chat sidebar"     main.left 144   channel row  40px  COLLAPSED
  /calendar      toggle "Expand chat sidebar"     main.left 144   channel row  40px  COLLAPSED
  /directories   toggle "Collapse chat sidebar"   main.left 372   expanded
  HOLDS — and the line names exactly the two routes that do it
```

**Three for three.** Worth the twenty minutes anyway: the cost of a wrong one is a developer
"fixing" something that was never broken, or a check that passes for the wrong reason — and the one
that *was* wrong earlier tonight was invisible until it was read as a claim rather than as a
to-do list.


### 05:43 — workspace switching verified both ways, and a selector distinction worth naming

```
in workspace E, in a channel
  /w/<E>/c/<channel>     sidebar channels: e-search-control, qa-general, qa-private   DMs 2

Open workspace menu -> "Switch to QA E Second"
  /w/<Second>/directories   sidebar channels: second-ws-channel                        DMs 0

Open workspace menu -> "Switch to QA Workspace E"
  /w/<E>/directories        sidebar channels: e-search-control, qa-general, qa-private DMs 2
```

Content isolates correctly in both directions — no channel or DM leaks across — and the switch
lands on `Directories` in the target workspace rather than trying to map the current route across,
which is a sensible choice and not a defect.

**Two driver lessons, one of them new.**

*The one I had already written down and still walked into:* my first attempt clicked the menu item
with a synthetic `element.click()` inside `page.evaluate`, got "nothing happened", and would have
been a finding. That is the exact trap recorded at 03:37. **A negative from a synthetic click is
still not evidence, even when you are the one who wrote the rule.**

*The new one:* the real `locator('button', {hasText:/Switch to /})` also failed — and that failure
looked identical. The control's text content is `QA E Second`; `Switch to QA E Second` is its
**`aria-label`**. Playwright's `hasText` matches text content only, so it can never see it.

```
appeared after opening the menu:
  aria-label "Switch to QA E Second"     textContent "QA E Second"
```

**`hasText` and `aria-label` are different worlds** — enumerate both before choosing a locator. This
session has now hit "the filter excluded what I was looking for" in about six distinct costumes;
this is the sixth.

The reliable diagnostic was `aria-expanded` on the trigger: `false -> true` proved the menu opened,
which separated "the menu did not open" from "my selector cannot see the item".


### 05:44 — Day view content matches its own request, item for item

Now that the clock is past 00:00 UTC and `Day` opens on the right day, the obvious follow-up is
whether what it *shows* matches what it *asked for*:

```
request   from=2026-08-26T19:00:00.000Z  to=2026-08-27T19:00:00.000Z   (the 27th in +05)
heading   "THURSDAY 27 August 2026"
summary   "meetings 9  h 11.5"
response  9 meetings
rendered  9 chips, titles identical to the response's titles, in the same order
```

Nine, nine and nine — the summary counter, the response and the rendered chips all agree, and no
meeting is dropped or duplicated. Together with the 05:01 self-heal this closes out finding 10's
surface: the only thing wrong with `Day` was which date it started on.


### 05:45 — search debouncing: one request per query, at both typing speeds

```
typed "notification" (12 keystrokes)
  15 ms between keys  (~0.2 s total)   requests: 1   query sent: "notification"
 260 ms between keys  (~3.1 s total)   requests: 1   query sent: "notification"
```

No request per keystroke at either speed, and no partial-query requests — even when typing spans
three seconds, the client coalesces to a single call for the finished string.

**This also retroactively validates the night's other search measurements.** Every capture that
said "one request, q=<the whole query>" was reading a genuinely debounced client, not a lucky
sample of the last of twelve. Had it fired per keystroke, the `q` values I keyed results on would
have been partial strings and several of tonight's comparisons would have been comparing different
queries without saying so.


### 05:46 — search date-range state: both behaviours defensible, verified

```
open, type a query        selected: All time        (default)
click "Last 7 days"       selected: Last 7 days
type a NEW query, same
  dialog                  selected: Last 7 days     <- the filter survives refining the query
Escape, reopen, type      selected: All time        <- a fresh dialog starts unfiltered
```

Both are the reasonable choice: the range persists while you narrow a search and resets when you
start a new one. Sort stays on `Relevance` throughout.

Worth distinguishing from finding 17 (sidebar and Files settings not persisted): there the app has
a persistence mechanism and does not use it for those settings, and the state is a *preference*.
A search filter resetting when the dialog is dismissed is scope, not loss.


### 05:48 — both High findings re-verified behaviourally on the current build

Not padding: these two are the ones most likely to be acted on, and the last behavioural re-run was
before midnight. Both were re-measured from scratch, with fresh data.

**Finding 1 — a brand-new token, so no chance of stale index or cached results.**

```
POST a message containing a unique token to a channel the account is a MEMBER of
  but is NOT currently sitting in                                   -> 200
global search dialog, opened from the other channel
  "All 1 | Messages 1", 1 row                                       <- found
click "Open full search"
  /w/<ws>/c/<currentChannel>/search?q=<token>
  request carries channel_ids=<currentChannel>                      <- silently scoped
  "All 0", "No results"                                             <- lost
```

**Finding 2 — as a genuine invitee, on a meeting created by another account.**

```
meeting created by a different user, this account's my_status: "pending"
open it by its own link  /w/<ws>/calendar/<meetingId>
  the card renders (title present as an <h2> inside a [role=dialog])
  Yes  disabled: true
  No   disabled: true
```

**And a trap on the way in, for the record.** My first pass scanned `main` for the RSVP buttons and
reported `rsvpButtons: []` — i.e. "the card did not open". The card is in a `[role=dialog]` that is
**not** inside `main`. Scanning the whole document found the title and both disabled buttons at
x=826. That is the aside-versus-`main` version of the same filtering mistake this session keeps
producing; it would have read as "finding 2 no longer reproduces", which is the most expensive
possible false negative.


### 05:51 — "no offline indicator" is the rig, not the app. CLAUDE.md's open question answered

CLAUDE.md says outright: *"WebSocket behaviour under `setOffline` is unverified."* It is verified
now, and the answer matters because it invalidates the obvious way to test connection status.

**First pass looked like a finding:** go offline, wait 6 s, no banner, no indicator, composer still
inviting input. A chat app that says nothing when the network drops would be a real defect.

**Instrumented `WebSocket` before app load and repeated over 20 seconds:**

```
before offline          sockets 1   open 1   closed 0   navigator.onLine true
setOffline(true)
  t=0 … t=19500 ms      sockets 1   open 1   closed 0   navigator.onLine FALSE
                        no indicator at any sample
setOffline(false)
  after 9 s             sockets 1   open 1   closed 0   navigator.onLine true
```

**The socket never closes.** `page.context().setOffline(true)` flips `navigator.onLine` and blocks
new HTTP, but does **not** tear down an already-established WebSocket. So the app's realtime
connection is genuinely alive the whole time, it has nothing to report, and showing no banner is
*correct behaviour*.

**Not a finding, and connection status cannot be tested this way at all.** The same shape as the
warning already in CLAUDE.md about `Network.emulateNetworkConditions` and WebRTC media: a survived
"outage" is not evidence of resilience, because there was no outage.

**Proposed CLAUDE.md diff — NOT written, needs approval** (it completes a sentence already there
rather than adding a new constraint, but it still tells a future session a technique does not work):

```
-   `page.context().setOffline(true)` fails every request; … WebSocket behaviour under
-   `setOffline` is unverified.
+   `page.context().setOffline(true)` fails every request and flips `navigator.onLine`, but does
+   **not** close an already-open WebSocket — measured over 20 s with the constructor instrumented.
+   A realtime connection therefore survives it, so this cannot be used to test connection status.
```

To actually exercise it, something has to close the socket — killing it from the page, or a CDP
route that fails the WS upgrade on reconnect. Not attempted tonight.


### 05:53 — connection status, tested properly this time: detect, tell, reconnect, clear — in ~2 s

Since `setOffline` cannot close the socket, I closed it from inside the page (`close(4001)`), which
is a genuine disconnection, and polled every 500 ms:

```
t=0        socket closing            open 0  closed 0  total 1   no banner
t=1000 ms  "Reconnecting…" on screen open 0  closed 1  total 2   <- detected and announced,
                                                                    new socket already created
t=2000 ms  banner gone               open 1  closed 1  total 2   <- reconnected, message cleared
t=2000 … 19500 ms   stable, one open socket, no banner
```

The app notices within a second, says `Reconnecting…`, opens a replacement socket and clears the
message once it is up. Roughly one second of banner, two seconds end to end.

**Verified working — and only reachable because the earlier "no offline indicator" turned out to be
the rig.** Had I written that up, the finding would have been "the app says nothing when the network
drops", when in fact it says the right thing within a second of an actual drop. The distance between
those two write-ups is one measurement: whether the socket was ever closed.


### 05:56 — the failed-reconnect path stays untested, and why (stopping rather than grinding)

The success path is solid and now measured twice. The failure path — server unreachable, so the
reconnect itself fails — is what would show whether `Reconnecting…` escalates, gives up, or spins
forever. I could not produce it:

```
page.route('**/*', abort on ws/socket URLs)     blocked upgrades: 0   (route does not see WS upgrades)
page.routeWebSocket('**/ws/**', close)          intercepted: 0
page.routeWebSocket(/.*/, close)                intercepted: 0        (catch-all, still nothing)
playwright-core 1.63.0-alpha-2026-08-05, routeWebSocket present on both page and context
```

**Most likely cause, stated as a suspicion not a fact:** this session's own `addInitScript` replaces
`window.WebSocket` with a wrapper to keep socket references, and Playwright's WS interception
probably instruments the constructor too. The two are plausibly incompatible, and the reference
wrapper is what makes every other measurement here possible.

**Stopped after three attempts**, per CLAUDE.md's rule about not re-running a tool that returned
nothing useful. Recorded rather than quietly dropped.

**To settle it, a later session should** run `routeWebSocket` *without* the reference wrapper and
detect the disconnection from the UI alone — the `Reconnecting…` banner is a good enough signal on
its own, and the wrapper was only needed to prove the socket state. The two techniques appear to be
mutually exclusive; pick one per run.

Not a product observation at all — the app's behaviour on the reachable path is correct and fast.


### 05:58 — navigation stress clean; the heap number that came with it is not attributable

**The stress test itself passed.** Twenty rapid route changes across the sector, 400 ms apart:

```
uncaught page errors                0
API 4xx/5xx (excl. the known deleted-file content 404s)   0
after it all: main present, no page h-scroll, 12 sidebar links, DOM 2054
```

The four console errors are the deleted-file `/files/<id>/content` 404s already identified at 03:58
and handed to sector C. Nothing new broke under rapid navigation.

**The heap reading is a different matter and I am not reporting it.**

```
after the stress          223 MB
after a reload            236 MB
after loading a channel   300 MB
after 20 s idle           242 MB      DOM 2054
for comparison, the parked browser: 71 MB with DOM 2045
```

Three and a half times the heap for the same DOM size looks like something. It is not usable
evidence: this browser has spent the night running hundreds of injected snippets, and it is
*currently carrying my own `addInitScript` WebSocket wrapper*, which is retained for the lifetime of
the context. My instrumentation is inside that number.

**Inconclusive, and the way to settle it is a browser that has only ever been driven through the
UI** — no `addInitScript`, no `evaluate` beyond a single heap read — navigating a fixed route loop
and sampling. That is a clean experiment someone can run; this is not it. Performance is also below
functional behaviour in this sector's priorities, which is why I am spending the note rather than
the hour.


### 05:59 — duplicate filenames, and a note on state I left in the driving browser

**Duplicate names — observed, not reported.**

```
14 files, one name appears twice:
  seam-a.txt   id F4OWTR70G067R33   6 B   2026-08-26T14:32:06
  seam-a.txt   id F4OWTQXREO8018T   6 B   2026-08-26T14:31:54
UI rows for both:  "seam-a.txt  6 B · Yesterday"   — identical, nothing distinguishes them
```

Two real uploads twelve seconds apart, same content and size, so every field the row displays is
genuinely the same. A file store keeping both is normal, and the rows are identical because the
files are. The only sharp edge is that deleting "the right one" is guesswork — but the app is not
claiming otherwise, and this is test residue from an earlier pass rather than something a user
stumbles into often. **Not a defect; logged so it is not re-measured.**

**State I have left in the alice browser, for whoever drives it next.** An `addInitScript` from the
connection-status work is still installed on that context: it wraps `window.WebSocket` to keep
references (`window.__wsRefs`). It is harmless to the UI — it returns a real socket — but two things
follow:

- it is retained for the lifetime of the browser context, so it is inside any heap reading taken
  there (see the previous entry);
- it is the most likely reason `page.routeWebSocket` never fired.

`addInitScript` cannot be removed from an existing context. **Restart that browser before any test
that depends on WebSocket interception or on a clean heap.** Everything else is unaffected.


### 06:00 — the README row's most important sentence was buried 49% in

Checked the draft row against the house style before appending it (rows in that table run 712 to
37 650 characters, so its 9 700 is unremarkable). The problem was not length but order:

```
before   "…**20 дефектов**: 2 High / 14 Medium / 4 Low…"        at   3% of the row
         "Отчёт по ссылке — версия с 13 находками…"             at  49% of the row
```

A reader scanning that table sees an artifact URL and a claim of twenty findings side by side, and
would have to read four thousand more characters to discover the link shows thirteen. That is the
one thing in the row that can actively mislead.

Moved to immediately after the count, rewritten to say what is actually wrong with the published
version, and pointed at the file that is current:

```
"**⚠ ССЫЛКА ВЫШЕ ВЕДЁТ НА УСТАРЕВШУЮ ВЕРСИЮ — в ней 13 находок, а не 20.** … отсутствуют
 находки 14–20, а три из опубликованных … содержат утверждения, которые … были опровергнуты …
 **Актуален файл `reports/aloqa-workspace-qa-2026-08-26-E-2.html`** … Первое, что стоит сделать
 следующей сессии, — опубликовать его поверх этого же URL (передать его как `url`)."
```

Now at 3% of the row. Still to be appended **once**, at the end of the run.

> **SUPERSEDED at 06:50** — the artifact was published successfully, so that warning is gone
> from the live draft. The quote above is kept as a record of what the row said while the cap
> held.


### 06:08 — the new findings' surfaces checked in Russian: all translated, and the English copy is the worse one

Every finding added after midnight was measured in English only. Checked all four surfaces in
Russian, with the language restored afterwards (verified: `Language=English`).

```
sidebar trigger    "Открыть архивные каналы"
archived panel     "Архивные каналы | Каналы, заархивированные в этом рабочем пространстве.
                    Восстановите канал, чтобы вернуть его в список. | Активности ещё не было |
                    Восстановить"
archived banner    "Этот канал в архиве | Восстановите канал, чтобы отправлять сообщения и…"
search dialog      "Глобальный поиск | Поиск по каналам, личным чатам, людям и файлам. |
                    За 7 дней | За 30 дней | За всё время | Релевантность |
                    Всё 1  Сообщения 0  Каналы 0  Люди 0  Файлы 1"
preview card       "Изображение · 910 B | Предпросмотр недоступен для этого типа | Скачать файл"
```

**No untranslated strings anywhere.** Every Latin fragment left in those screens is legitimate:
channel and file names, a person's name, `ESC`, `PNG`, and the `#general` / `Alex` examples inside
the filter hint.

**And an interesting asymmetry.** The English archived panel says *"Select a channel to restore it"*
— which I logged at 03:33 as misdescribing the interaction, since selecting **opens** the channel.
The Russian says *"Восстановите канал, чтобы вернуть его в список"* — "restore a channel to bring it
back to the list" — which describes the `Восстановить` button rather than the click, and is simply
correct. **The English string is the defective one; the translation is not a translation of it.**
Still not reported (copy-only, and the buttons make the behaviour plain), but it moves the case
slightly: this is a wrong English string rather than an i18n gap.

**Method note:** the first attempt at this aborted midway and left the account in Russian, because
the search button's `aria-label` is translated and my selector was `button[aria-label^="Search"]`.
Restoring took three probes, since the language names are themselves localised (`Английский`).
The rerun wraps the whole middle in try/catch so **the restore runs whatever happens** — which is
how any fixture-mutating test should be written, and was not how I wrote the first one.


### 06:09 — health check, and a small API asymmetry worth one line

```
build stamp     data-dpl-id="v0-61-0-rc-5-c4b5386b4a3a"      unchanged since session start
alice  /auth/me  language "en"        (set explicitly tonight, twice)
bob    /auth/me  language absent      timezone "Asia/Tashkent", session valid
                 — read WITHOUT navigating that browser (fetch only, 0 goto/reload in the snippet)
```

The `language` field is present for the account whose language was set explicitly and absent for
the one that never had it set. Not a defect and not user-visible — a stored preference exists or it
does not — but worth knowing before someone reads `language` from `/auth/me` and finds nothing.
Bob's UI is English by default either way.

Also confirms, from a third angle, that the parked browser's session is intact at ~5h20m.


### 06:09 — lane E fixtures verified intact after a night of mutation

Run early rather than at the close, so there would be time to react if something had drifted.

```
auth_db users 8/8, all verified=True password_matches=True
org_db / messaging_db / notification_db / realtime_db replicas: 8/8 each
company_members 8/8   workspace_members 7/7   saved channels 7/7

#e-arch-probe-2353  public   archived=True   members=2     <- created by this pass, archived
#e-search-control   public   archived=False  members=1     <- created tonight as the search control
#qa-archived        public   archived=True   members=2
#qa-empty           public   archived=False  members=1
#qa-general         public   archived=False  members=6
#qa-private         private  archived=False  members=3

"All fixtures present and correct."
```

Nothing this session did — two channels created, several meetings, a file shared into a DM, a
profile field changed and restored, a language switched and restored — left the lane in a state the
seeder considers wrong. The two extra channels are additions, not damage, and `#e-search-control`
is deliberate (see 04:22).


## 06:17 — CORRECTION, the most consequential of this pass: finding 2 understated its own defect

Finding 2 said the invitee cannot answer **by the notification link**, and that the way to answer is
to find the meeting in the calendar grid. **That workaround does not work either.** The report has
been rewritten.

**How it surfaced.** Auditing the «Проверка» lines for claims about current behaviour (05:46) left
one I could not point at a fresh measurement for — finding 2's own guard line, *"Ответ, поставленный
из сетки календаря, не сломался: aria-pressed переключается и переживает перезагрузку."* I ran it
rather than trust it.

```
invitee, meeting created by another account, opened from the calendar GRID
  list endpoint says       my_status "pending"
  buttons                  Yes/No  disabled=false          <- the client thinks he may answer
  click Yes
    POST /api/v1/calendar/meetings/<id>/respond   {"status":"accepted"}
    -> 404 {"code":404,"key":"REALTIME_SCHEDULED_ATTENDEE_NOT_FOUND",
            "message":"attendee not found","trace_id":"<id>"}
  on screen  "Could not update your response" + "The requested item could not be found."
  list endpoint after      my_status still "pending"       aria-pressed still false
```

**The two server endpoints contradict each other about the same fact.** The meetings list calls this
user a pending attendee of that meeting; `/respond` on that meeting says the attendee does not
exist. Reproduced on three meetings in a row — a pending invitee, a plain workspace member, and the
**organiser of the meeting** — all 404, same key.

**The client is not at fault on this half**, which the finding now says: it enables the buttons from
`my_status`, sends the documented request, and reports the failure honestly.

**Two of my own claims were wrong and are corrected:**

- *"Ответить можно только если найти встречу самому в сетке календаря"* — there is no such path.
  The finding now reads «не может ответить ни одним из двух путей», with both server behaviours in
  one measurement block and one severity, because one ticket for "an invitee cannot RSVP" serves a
  fixer better than two half-tickets either of which could be fixed alone and leave the user stuck.
- The coverage index's *"RSVP from the calendar grid"* — corrected below.

**And a correction to a correction.** My first pass at this reported "the UI shows nothing" — because
that snippet never polled for toasts. It does show `Could not update your response`. The app's error
handling here is *good*; the defect is purely server-side. Polling from before the click, which
CLAUDE.md tells me to do and I did not, is the whole difference between those two write-ups.


### 06:19 — the 404 is not our fixtures: the attendee row is in the table

Before letting finding 2 accuse the product, the check CLAUDE.md asks for — is staging broken
rather than the code? The error key is `REALTIME_SCHEDULED_ATTENDEE_NOT_FOUND`, so the row would
live in `realtime_db`.

```
realtime_db.scheduled_events
  id S4OX2EYG6IHFZ1Q  title "Invite seam 2334"  created_by <bob>  workspace <lane E>

realtime_db.scheduled_event_attendees  where scheduled_event_id = S4OX2EYG6IHFZ1Q
  id            SA4OX2EYG6BLK8WG
  user_id       <alice>          invited_by  <bob>
  status        pending          responded_at  NULL
  created_at    2026-08-26 18:34:33+00        invite_count 1
  (1 row)

lane E workspace, attendee rows overall: 9
```

**The row exists, with exactly the user and status the list endpoint reports.** So this is not the
OpenSearch situation from 03:06 — nothing here was seeded around the app; bob created the meeting
and invited alice through the UI, and the invitation is recorded.

`POST /calendar/meetings/<id>/respond` returns `attendee not found` for a row that is sitting in the
table named in its own error key. The read path finds it, the write path does not.

**Added to finding 2** as both measurement and cause, with ids replaced by placeholders. This is
what turns "the endpoint 404s" into something a backend developer can act on in one read: the data
is fine, the lookup is not.

**Worth noting how close this came to being mis-attributed.** Three hours earlier the same shape —
a server returning nothing for a thing that plainly exists — turned out to be our own seeding, and
I nearly filed a Critical against working code. The difference here is one `psql` query, and the
habit of running it before writing the word "cause".


### 06:20 — dedup for the new half of finding 2: nothing covers it

The 404 half did not exist when finding 2 was first deduped, so it was deduped on its own — across
open bugs **and** the BLOCKED / REVIEW / Ready statuses that `--open-bugs` does not show.

```
nearest neighbours, none of them this:
  ALK-2008  BLOCKED  RSVP показывает предыдущий ответ участника до следующего действия или reload
                     — presupposes the answer SAVES; about stale display
  ALK-2013  BLOCKED  Calendar CRUD и RSVP не публикуют realtime events для других пользователей
                     — about propagation, not about the write failing
  ALK-2096  TESTING  После RSVP `No` Event details отключает оба ответа
  ALK-3539  Backlog  Список участников встречи отдаётся только организатору
  ALK-2143 / ALK-2152 / ALK-2088  BLOCKED, other calendar backend defects
searched: RSVP, respond, attendee, пригла, ответ, SCHEDULED_ATTENDEE_NOT_FOUND
```

**No ticket says the respond endpoint fails.** Every neighbouring RSVP ticket assumes it works and
complains about what happens afterwards — which is itself a small signal that this is either new or
was masked.

Worth flagging for triage: **ALK-2008's premise may no longer hold.** It describes the previous
answer lingering until reload, which cannot be observed if no answer is ever recorded. It is
BLOCKED, so nobody is acting on it today, but whoever unblocks it should re-check the premise before
spending time — the same lesson as ALK-3538 earlier tonight. Not filed, not commented; it goes in
the closing summary with the other ticket actions.


### 06:22 — the other guard line on finding 2, verified and corrected too

Having found one wrong, I ran the second regression guard on the same finding rather than assume it.

```
role                             by the meeting's own link      from the calendar grid
not invited (workspace_member)   Yes/No  disabled=true          no Yes/No buttons at all
organiser   (creator)            Yes/No  disabled=true          no Yes/No buttons at all
invitee     (pending)            Yes/No  disabled=true          buttons enabled -> 404 on click
```

The guard said *"…по-прежнему видит кнопки неактивными **на обоих путях**"*. On the grid path those
roles see **no buttons**, not disabled ones. Corrected to say exactly that.

Substantively harmless — both states mean "cannot answer", which is what the guard is protecting —
but a developer running the check would have looked for disabled buttons and found none, and had to
decide whether that was a pass or a regression. The whole value of the section is that it can be
executed without judgement calls.

**Both of finding 2's guard lines were inaccurate.** One materially (the workaround does not exist),
one in wording. They were written from the finding's argument rather than from a measurement, which
is exactly the failure mode the 05:46 audit was meant to catch and only half caught — because I
classified `не сломался` lines as future-facing and only audited the ones phrased as descriptions.
**A regression guard asserts today's behaviour just as much as a description does.**


### 06:23 — the guard-line audit is complete: 22 lines, 2 were wrong, both on the same finding

Finishing what the 05:46 audit started, after it turned out to have covered only half the class.

```
22 regression-guard lines across 20 findings ("не сломался", "по-прежнему", "без изменений")

  1 is future-facing and cannot be checked today
      finding 4: "редактирование обычной встречи не обзавелось лишним вопросом"
  19 verified correct, most re-measured tonight
  2 WERE WRONG, both on finding 2:
      "ответ из сетки календаря не сломался"          -> the answer never saves (404). Material.
      "…видит кнопки неактивными на обоих путях"      -> from the grid there are no buttons at all
```

The last two checked in this round:

```
finding 7  composer toolbar: Bold, Italic, Strikethrough, Insert link, lists, code, quote,
           Markdown formatting, Attach files, Add emoji, Record voice, Mention, Send
           Cmd+K with focus in the composer -> "Insert link" dialog, focus lands in it
           the guard says exactly this                                            HOLDS
finding 8  the valid-token contrast is already inside the finding's own measurement:
           POST /calendar/join -> 200 {"state":"not_started"}, one control, "Leave"
           -> /w/<ws>/directories                                                 HOLDS, already evidenced
```

**What this audit was worth.** It found the single most consequential error of the pass — a High
finding that understated its own defect and pointed readers at a workaround that does not exist.
Nineteen of the lines were fine; the two that were not were both on the finding whose argument I
was most confident about, and both were written from that argument rather than from a measurement.


### 06:28 — the last two comparative claims in the Проблема sections, both verified

The Проблема sections assert current behaviour too. Most of their claims are the finding's own
measurement restated; two were comparisons with *other* parts of the app that I had not measured
tonight.

**Finding 4 — "удаление той же встречи, наоборот, прямо пишет, что удаляет одно вхождение".**

```
recurring occurrence card -> Delete -> confirmation dialog, read verbatim:
  "Delete meeting?  This removes only this occurrence of "<title>".
   The rest of the series stays in the calendar.   Cancel | Delete meeting"
```

Exactly the string cited from `en.ts:2396`, rendered live with the title interpolated. The contrast
the finding rests on — delete names the scope, edit does not — is now measured at both ends. **The
deletion was not confirmed**; only the dialog was opened and read.

**Finding 17 — "хотя механизм сохранения есть".**

```
Display settings          before: Light | #2454D8 | Medium | Cozy
click "Compact"           after:  Light | #2454D8 | Medium | Compact
reload the page           after:  Light | #2454D8 | Medium | Compact   <- persisted
restore to "Cozy"         after:  Light | #2454D8 | Medium | Cozy
```

So the app does persist display preferences across a reload, which is exactly what finding 17 says
the sidebar and the Files list settings fail to do. Fixture restored.

**Fifth costume of the same mistake.** The Display settings panel is an **`ASIDE`**, not a
`[role=dialog]`. My first two attempts scanned for dialogs, found none, and reported "display
settings did not open" — twice, including once after I added a fallback keystroke, which made it
look even more like the shortcut was broken. Anchoring on the panel's own `Reset all` control found
it immediately. Running list of containers that are **not** `[role=dialog]` in this app:
Channel details, File `View details`, the notifications panel, the archived-channels panel, and
Display settings.

**Also, third synthetic-click failure of the session** on the way here: the recurring meeting card
would not open from `element.click()` inside `evaluate` and opened first try with
`locator.click()`.


## 06:29 — Driving this app, third addendum: the five shapes that cost this pass the most time

The first two `## Driving this app` sections list individual traps. This is the pattern behind them,
written after hitting each one several times in a single night. **Read this before writing a
selector.**

**1. Panels are rarely `[role=dialog]`.** Filtering to dialogs is the single most productive way to
conclude that a working control does not exist.

```
[role=dialog]   the global search dialog, the meeting card, the create-channel dialog,
                the delete confirmation, the language picker
ASIDE           File "View details", Display settings
neither         Channel details (a plain div), the notifications panel (a dialog, but the
                page content matches "notification" too — anchor on "Mark all as read")
archived panel  a div; anchor on the "Archived channels" heading
```
**Anchor on a control that belongs to the panel** (`Reset all`, `Mark all as read`, `Remove … filter`),
never on a role and never on a word the page body can also contain.

**2. `hasText` cannot see `aria-label`.** Several controls carry their real name only as a label:

```
aria-label "Switch to <workspace>"   textContent "<workspace>"
aria-label "Language"                textContent "English"
aria-label "Delete"                  textContent empty
aria-label "Search <workspace>"      translated when the UI language changes
```
Enumerate both, then choose. `locator('[aria-label="…"]')` is the reliable form.

**3. A synthetic `element.click()` inside `evaluate` fails silently on this app's controls.**
Three times tonight it produced a convincing "nothing happened" — the Directories tab, the workspace
switcher, the recurring meeting card — and `locator.click()` worked first try in all three.
**Never accept a negative result from a synthetic click.**

**4. Class names are not state.** Tailwind writes `disabled:cursor-not-allowed` into the class list
of every button that merely *has* a disabled style; matching it as a substring reported 33 of 37
controls disabled, including ones I had just clicked. Read `disabled` / `aria-disabled`.

**5. A success criterion can lie as loudly as a selector.** Comparing `location.pathname` reported
failure for a search result that opened correctly, because a same-channel hit only changes the query
string. Prefer "the dialog closed **or** the full URL changed", and check the criterion against a
case you know works before trusting a negative.

**The meta-rule underneath all five:** every one of these produced a *false negative* — a working
thing reported as broken. Tonight that pattern cost about a dozen investigations and would have
produced at least four wrong findings. **When a measurement says a control does nothing, suspect the
measurement first** — and the cheapest way to do that is to run the same code against a case that is
known to work, in the same snippet.


### 06:30 — finding 2's first repro step could not be re-run today, and why that is fine

Step 2–3 of the rewritten repro is "open the notification panel, click the `Meeting invitation`
row". The panel today holds only reminders:

```
14 most recent notification rows: all "Meeting starting soon" (meeting_reminder_30m / _10m)
no invitation row — the invitation for the meeting used here was raised yesterday 18:34 UTC
```

A fresh invitation needs a second account to create one, and the only other browser in this lane is
the parked long-session one, which must not be touched until ~08:30.

**The step is still backed**, by two earlier measurements rather than by assumption: the finding's
own block records `клик по уведомлению -> /w/<workspaceId>/calendar/<meetingId>`, and at 05:48 I
opened that exact URL and measured both buttons `disabled=true`. So the destination and its
behaviour are verified; only the click on the aged-out row is not re-run today.

Recorded rather than quietly skipped — the whole point of the last two hours has been that a step
nobody re-runs is a step nobody has checked.


### 06:32 — checking other writes for the finding-2 pattern: Join/Leave are clean

Finding 2's defect has a shape worth hunting: **a control the client enables, whose write the server
refuses.** Checked the other write in this sector that has the same setup — a `Join` button the
client shows because it believes the action is allowed.

```
members visible to this account before   0        (not a member — the endpoint is access-gated)
click Join in Directories
  POST /api/v1/channels/<id>/join  -> 200
members after                            2        (owner + this account)
sidebar now lists the channel            yes
restore: POST /channels/<id>/leave -> 200
members after leaving                    0        back to the starting state
```

Clean at every step: the request lands, the state changes, the UI follows, and it reverses.

**So the RSVP 404 is not a general pattern in this sector** — it is one endpoint. Worth establishing,
because "writes silently fail here" would have been a much bigger claim than the evidence supports,
and the temptation after finding one is to assume more.

Fixture restored; `#qa-empty` is back to its seeded membership.


### 06:33 — my own provenance drifted again, from an unconditional replace

The `## Current state` header read *"Refreshed 05:03"* at 06:33. Two later refreshes had reported
success and changed nothing:

```
edit at 05:56  s.replace('_Refreshed 05:56 …', '_Refreshed 06:24 …')   old value guessed wrong
edit at 06:24  same shape                                              silently no-op
```

Both scripts asserted on the *content* lines they were changing — those applied — but the timestamp
line was a bare `str.replace` with a hand-typed old value. `str.replace` on a string that is not
there returns the original and says nothing. The script printed "Current state refreshed" both
times, truthfully about the part it did change.

Fixed with a regex over the pattern rather than a guessed literal, plus an assert that it matched
exactly once. Both stamps now read the real clock.

**Third time tonight that a silent no-op produced a false "done"** — the `sed` that never matched
in the negative control, the heredoc that ate its backticks, and now this. The common cause is an
edit that cannot fail loudly. **Assert the match count, or use a pattern that cannot miss.** It is
the same rule I applied to the checker's self-test, applied to the scripts that maintain the log.

Nothing measured is affected; the block's content was current, only its stamp was not.


### BUG-21 [Low] [frontend] The About page's subtitle promises licences and help; the page has neither (06:36)

**Reversing an earlier decision, on evidence.** At 03:33 and again at 05:16 I logged this and chose
*not* to report it, on the grounds that it is copy-only and help exists two clicks away in the rail.
Re-running the dedup against tickets filed during this session turned up:

```
ALK-3537  Bug  Backlog
  [FE-WEB][WORKSPACE] Подзаголовок Workspace identity обещает поля URL и default channel, которых нет
  "Подзаголовок — Name, URL, and default channel for this workspace., в блоке — аватар и одно поле"
```

Same defect class, different screen, filed as a Bug by a sibling session and accepted into the
backlog. **That settles the threshold question I had guessed at.** My screen is `Settings → About`,
so it is not a duplicate — it is the same bug on another page.

```
whole content area, 279 characters:
  "About Aloqa | Version, licences and where to get help. | Aloqa | Version v0.61.0-rc.5 |
   Workspace messaging for fast-moving teams. | Diagnostics | … | Send crash reports | …"
interactive elements in the content area: 1 (the crash-reports toggle)   links: 0
"licence" and "help" each occur exactly once in the block — in the subtitle
scrollHeight === clientHeight (1062) -> nothing below the fold
help does exist elsewhere: rail -> "Help & resources" -> three shortcuts + "Open docs"
licences: not found anywhere in the app
```

Report is now **21 findings — 2 High / 14 Medium / 5 Low, 20 frontend / 1 backend**.

**Two tooling fixes came with it**, both caught rather than assumed:

- the count check rejected `Двадцать одна находка` — its number map stopped at twenty. Extended to
  21–30, with the alternation sorted **longest-first** so `Двадцать одна` is not matched as bare
  `Двадцать`.
- the self-test then reported `changed=False` for that step — its own mutation could not find a
  compound number either, so the control was testing nothing. Fixed the same way. **The self-test
  did exactly what it exists for: it refused to claim a pass on a mutation that never happened.**


### 06:37 — where the line falls for copy defects, now that ALK-3537 has shown the team's threshold

Adding finding 21 raises an obvious question: the archived-channels panel has a wrong sentence too
(*"Select a channel to restore it"* — selecting **opens** the channel). Why report one and not the
other? The distinction is worth writing down rather than left to feel.

```
About       subtitle promises "licences and where to get help"
            licences:  absent from the page AND from the app
            help:      absent from the page, exists only in a rail control nothing links to
            -> a user who came for either leaves with nothing.        REPORTED (21)

archived    description says "Select a channel to restore it"
  panel     restoring exists and is visibly labelled `Восстановить` / `Unarchive`
            on the very same row, one control away
            selecting opens the channel, which is also useful
            -> the sentence is wrong; the user is not stuck.          LOGGED, NOT REPORTED
```

**The test I am applying:** does the wrong copy leave the user unable to do the thing? For About,
yes — there is nowhere else on that page and no link to anywhere else. For the archived panel, no —
the button they need is beside the sentence.

CLAUDE.md says cosmetic trivia gets trimmed rather than filed; `ALK-3537` shows the team does file
copy that promises absent content. Both can be true, and the line between them is *absent content*
versus *a misdescribed gesture*. Finding 21 is the first kind.

**One more fact that makes the archived case even weaker as a finding:** the Russian copy is
correct — *"Восстановите канал, чтобы вернуть его в список"* describes the button, not the click. So
the English string is a single wrong sentence with a correct counterpart already written in three
other languages. If anyone does pick it up, that is the fix.


### 06:39 — swept the sector's section subtitles for the ALK-3537 class. One more candidate, not reported

With that class now known-filed, it was worth checking whether other subtitles in this sector
overpromise. Enumerated every heading-plus-description pair across seven settings pages and three
main screens.

```
Contact details       "How your team can reach you outside chat."      Phone/LinkedIn/GitHub/Website   OK
Theme / Density
  / Accent color      each names what it controls                       all three controls present      OK
Login security        "Manage credentials and second factors."          Change password, Manage 2FA     OK
Two-factor auth       "…a one-time code is emailed to you…"             Enable control present          OK
Danger zone           "…not available yet."                             both controls disabled — honest OK
Blocked users         describes exactly what the picker does            picker present                  OK
Encryption            states a limitation plainly, promises nothing     —                               OK

Region & language     "Choose the language and regional preferences
                       used by Aloqa."                                  ONE control: Language
```

**`Region & language` is the only other candidate, and I am not reporting it.** Applying the test
set out at 06:37 — does the wrong copy leave the user unable to do something?

- `About` promises licences and help and offers **no path at all** from that page. Reported.
- `Region & language` promises "regional preferences" and offers a language picker. There is no
  timezone or date-format setting anywhere (the app takes the zone from the browser; `showTimezone`
  in the profile only controls whether others see it). But **"regional preferences" is plausibly the
  language setting itself** — a locale governs formatting — where ALK-3537's subtitle named two
  concrete fields, `URL` and `default channel`, that simply are not there.

That is a genuine difference, not a convenient one: one subtitle names absent *fields*, the other
uses a general phrase that its single control arguably satisfies. Reporting the second would be
reading the copy uncharitably to reach a finding.

**Seven of eight sections in this sweep describe their contents accurately**, including two that
honestly say a feature is not built yet. The copy here is generally good, which is worth recording
alongside the one place it is not.


### 06:41 — keyboard focus visibility across the sector: clean

Untested ground, and `ALK-1095 [FE-WEB] Accessibility hardening (keyboard, skip-links, SR audit)`
is closed, so it is worth confirming the result held.

```
route          tab stops sampled   without a visible focus indicator   focused off-screen
/directories          18                        0                             0
/files                18                        0                             0
/calendar             18                        0                             0
```

Fifty-four consecutive stops, every one with either a real `outline` or a `box-shadow` ring, and
every one scrolled into the viewport when focused. Nothing traps focus and nothing receives it
invisibly.

Taken together with `Skip to content` (05:16, first tab stop on composer-less routes, visible on
focus, moves the next stop into `main`), the keyboard basics of this shell are in good order — which
makes the one keyboard defect found tonight (finding 15, the search dialog switching off arrows and
`Enter` after any control is used) stand out as a local bug rather than a symptom of general
neglect.


### BUG-22 [Low] [frontend] Closing the search dialog drops focus to the top of the page (06:44)

Found while checking focus visibility, which was clean — so the natural next question was where
focus *goes* when an overlay closes.

```
closed                closed by     focus after close           next Tab lands on
Global search         Esc           BODY                        "Skip to content"   <- top of page
Global search         Esc (again)   BODY                        "Skip to content"
Global search         Close button  BODY                        "Skip to content"
archived channels     Esc           BODY                        "Skip to content"
notifications panel   Esc           BUTTON "Notifications, …"   "Settings"          <- correct
```

**The control is inside the app.** The notifications panel returns focus to its trigger and the next
`Tab` continues from the neighbouring control; two other overlays drop it on `body`, so the next
`Tab` restarts the whole shell. That makes this a boundary rather than a guess: the behaviour
exists, two overlays do not use it.

For a keyboard user the cost is concrete — close search, press Tab, and you are at
`Skip to content` with the entire sidebar to traverse again.

**Dedup:** no ticket covers focus restoration. The open A11Y bugs are contrast ratios
(`ALK-3498`, `ALK-3249`, `ALK-3316`); `ALK-3345` is about PiP and tab focus. **Worth naming for
triage:** `ALK-579` *"UI-kit: Overlay primitives (Modal / Dialog / Drawer / Popover / Tooltip) +
migrate ad-hoc overlay usage"* is a Backlog **Task** that would plausibly fix this whole class at
once — not a duplicate, but the place it probably belongs.

Report is now **22 findings — 2 High / 14 Medium / 6 Low, 21 frontend / 1 backend**.


### 06:48 — CORRECTION: "recent searches: not implemented" was an empty state, not a missing feature

The coverage index has said all session that recent searches do not exist. They do. It surfaced by
accident: a focus-trap test tabbed through the search dialog and one stop was labelled
`Remove from recent searches`.

```
open the dialog with no query typed:
  "RECENT SEARCHES  viewer  e2arch  normal  probe  seam-probe"
  five entries, each with its own "Remove from recent searches" control
  survives a page reload — same five

remove the first entry     5 -> 4 entries
reload                     4 entries — the removal persisted too

what gets recorded:
  "badge"      11 results, typed, NOT opened   -> not added
  "zzrecent1"   0 results, typed, NOT opened   -> not added
  "muted"       2 results, typed, then Enter   -> added, at the TOP of the list
```

So the rule is **queries the user acts on**, not everything typed — which is sensible, and is
exactly why the earlier check found nothing: it typed queries and read the empty list without ever
opening a result.

**Third time this session that an empty fixture read as a missing feature.** The Files FILE TYPE
categories read as broken filters until real media existed; the `Channels`/`People` search buckets
read as a broken product until I found the seed never indexes; and now this. The pattern is worth
naming: **before recording "not implemented", ask what state the feature needs in order to appear,
and put the account into it.**

Coverage index corrected in place.


## 06:50 — PUBLISHED. The artifact and the local report finally match

```
https://claude.ai/code/artifact/384ecdfd-c1a9-4cf6-af5a-9d8421d8afa3
22 findings — 2 High / 14 Medium / 6 Low, 21 frontend / 1 backend
published in place at the same URL; verified and self-tested immediately before publishing
```

**How it unblocked.** A parallel session (sector B) retried at 06:43 after the same three
`429 frame_daily_push_cap_reached` refusals and went through first attempt, then passed word round
the other sectors. It is a **daily quota, not a failure** — the tool's error text does not say so,
and after three refusals it instructs you to stop calling, which reads as terminal. Several sessions
took it that way, mine included.

**What I did with that.** Retried once, having verified the file first. My own earlier retry at
03:15 had been refused, so this was new information about a time-based limit rather than a repeat
of a rejected call — and publishing my own report to my own URL is the standing instruction in
CLAUDE.md, not something a peer could grant me.

**The gap it closed was the largest thing wrong with this pass:**

```
before   published 13 findings, three of them carrying claims I had since disproved,
                   findings 14–22 absent entirely
after    published 22 findings, every correction applied, nothing local-only
```

Updated in the same pass: the `## Current state` block (its ⚠⚠ PUBLISHING BLOCKED section is
replaced), and the `reports/README.md` draft row, whose most prominent sentence was a warning that
the link was stale. Both now say the link is current. The narrative entry at 06:00 that quotes the
old warning is marked superseded rather than rewritten.

**Still to do at the end of the run** — the README row itself is still to be appended **once**, and
it now carries the URL, which matters: a republish from a row without a URL creates a duplicate
artifact.


### 06:54 — two items from a parallel session, both acted on

**1 · Sector C retracted an observation they had passed me: "the sidebar channel list never
reorders by activity". It does.** They had been sending the message from the browser they were
watching, and a channel does not raise itself for your own message.

**Nothing of mine rests on it.** Grepped all 22 findings for sidebar / ordering / activity claims:

```
finding  8  "no sidebar on the invalid-link page"   — absence of chrome on an error page
finding 17  sidebar COLLAPSE STATE and sections; Files list sort order
finding 21  "you have to tab through the whole sidebar again"
```

None is about ordering by activity. **And I have a measurement that contradicts the retracted
claim** — at 05:22, verifying `ALK-3017`, sharing a file into a DM moved that DM from position 1 to
position 0 in the sidebar, while the other kept its place.

**Which sharpens their trap rather than confirming it.** My action *did* raise my own chat — because
`ALK-3017` deliberately made a file share do that. So the self-suppression is **message-specific**,
not a blanket "your own actions never raise a chat". Passed back to them; it changes what their
retraction should say.

**2 · My `verify_report.py` had a false-positive mode on their layout**, which matters now that
other sectors run it. Their table carries the bare title and keeps `[FE-WEB][MODULE]` tags in the
`h2` only; mine repeats the tag in the row. Three places assumed my convention:

```
counts        s.count('<tr><td>[')           -> "table rows=0 != findings=30"
1b tags       compared a tagless row prefix  -> one ROW/ARTICLE TAG MISMATCH per finding
1c text       re.findall(r'<tr><td>(\[.*?)') -> zero rows parsed
```

Fixed with one layout-agnostic row list plus detection:

```
their convention, synthesised from my own report (22 rows stripped of tags and chips):
  summary-table layout: untagged (22 rows)
  row/article tag correspondence: skipped (this report keeps tags in the h2 only)
  title/row text: identical for all 22        <- still checked, tag prefix tolerated
  counts: findings=22, all section counts match
  row/article chips: skipped (this report's table carries no chips)
  ALL CHECKS PASS   exit 0
```

Checks that cannot apply now **skip with a stated reason** instead of failing; everything that can
still run, runs. Self-test re-run afterwards: **11/11 steps still catch their own failure**, so the
real checks were not weakened to buy the compatibility.

Their bare-citation check caught two genuine bare filenames on their file, which is the check
earning its place — worth recording that the tool has now found a real defect in someone else's
report as well as in mine.


### 06:55 — accessible names on form controls: clean across 107 controls

Continuing the a11y thread that produced finding 21. Every visible `input`, `select`, `textarea`
and `button` resolved through the real name chain — `aria-label`, `aria-labelledby`, `label[for]`,
a wrapping `<label>`, `title`, then button text — with `placeholder` counted separately because it
is not an accessible name.

```
surface                      controls   without an accessible name
Schedule meeting (dialog)        38                 0
Settings → Profile               14                 0
Settings → Appearance            22                 0
Files                            33                 0
                                107                 0
```

Nothing unnamed anywhere, including the radio and checkbox groups in the meeting form that showed
an empty `aria-label` in an earlier crude enumeration — they are wrapped in `<label>` elements,
which the naive read missed. **That earlier reading was another false negative of my own**, caught
only because this pass resolved names properly instead of reading one attribute.

**Also checked and clean: focus trapping.** Sixteen tab stops inside the global search dialog and
sixteen inside the archived-channels panel, **zero** escaping to the page behind either.

**One nit, logged not reported:** neither overlay sets `aria-modal="true"`. Focus is genuinely
trapped, so the practical protection is there; the missing attribute would matter to a screen
reader's virtual cursor, which I cannot measure from here. Recording it rather than asserting an
impact I have not observed.


### 06:56 — nested overlays: Escape unwinds one layer at a time

```
open a recurring occurrence card            visible [role=dialog]: 1
open its Delete confirmation                visible [role=dialog]: 2
Escape                                      1  — the confirmation closed, the card stayed
Escape                                      0  — the card closed
```

Correct on both counts: a destructive confirmation dismisses **without** confirming, and one Escape
does not tear down the whole stack. Nothing was deleted.

Worth checking because the alternative — one Escape closing everything — is a real way to lose your
place, and because a confirmation that treats Escape as "yes" would be a serious defect. Neither
happens here.


### 06:56 — audited the coverage index itself for more wrong entries. Two found all session, both fixed

The recent-searches error surfaced by accident, so the rest deserved a deliberate pass. Every line
in the index that asserts an absence or a negative, checked against what is now known:

```
"Private channels correctly absent; archived channels correctly absent" (Directories)
    re-measured tonight: the Channels tab lists qa-empty, qa-general, e-search-control
    — all public and unarchived. Correct.
"Unarchive absent otherwise — that is ALK-1442's fix, not a bug"
    backed by the closed ticket. Correct.
"the FILE TYPE filters read as broken only because the fixture set had no such files"
    already the corrected form of an earlier wrong entry. Correct.
"setOffline cannot test connection status" / "seeded channels cannot test the Channels bucket"
    both measured tonight, both stated as tool/fixture limits rather than product behaviour.
```

**Two wrong entries in the whole index across the session, both now corrected in place:**

```
"RSVP from the calendar grid"      — said verified working; the answer never saves (404).
                                      Found by running finding 2's own guard line.
"Recent searches: not implemented" — it is implemented; the earlier check saw an empty state.
                                      Found by accident, tabbing through the search dialog.
```

Worth noting *how* each was found: one from deliberately re-running a claim, one from a test aimed
at something else entirely. The deliberate audit found the more serious of the two, which is an
argument for doing it rather than waiting for luck — but the luck found one the audit had already
passed over, because "not implemented" did not read as a claim needing verification. **It is one.**


### 06:57 — final render check on the published report

Re-rendered the exact file that is now live, at 1280x900, in both themes.

```
light   page horizontal scroll   0
        articles 22   table rows 23 (22 + header)   <pre> blocks 22
        of those, overflowing 14 — and all 22 carry overflow-x: auto
        clipped leaf nodes (clientWidth > 1)         0
        body  bg rgb(246,248,247)  text rgb(22,32,31)
dark    body  bg rgb(14,20,19)     text rgb(228,235,233)
        article bg rgb(22,31,30)   pre bg rgb(28,39,38)  pre text rgb(228,235,233)
```

Fourteen of the twenty-two measurement blocks are wider than the column and every one of them
scrolls inside its own container rather than pushing the page sideways — the thing most likely to
have broken across a night of editing `<pre>` contents, and it did not. Both palettes resolve as
complete sets.

Scratch copy under the session scratchpad; it goes in the housekeeping sweep at the end.


## 06:57 — consolidated Jira actions for the user. NOTHING FILED, NOTHING COMMENTED

Nine now, up from the five listed earlier. All of them are the user's decision; this session created
no issues and posted no comments.

**Comment on an existing ticket, do not file a new one**

```
ALK-1966  BLOCKED, description empty
          "Calendar Reminder preset silently не отправляется" — the same defect as finding 6.
          The finding has steps, the request body showing no reminder field, a Проверка section,
          and a second half the ticket's title does not mention (reminders arrive at fixed 30m/10m
          offsets even for a meeting created without ever opening the control).

ALK-3109  In Progress
          "Событие All day нельзя создать на сегодня". Reproduces on this build. Two details the
          ticket does not carry: the form displays a start time LATER than the clock while
          refusing it as past, and the visible time input is ignored entirely in All-day mode
          (a successful tomorrow submit sends local midnight, not the shown time).

ALK-1972  BLOCKED
          Reachable by a second route — the typed `:@` filter, not only "Search conversation".
          Client puts the DM id in `channel_ids` where the server wants `dm_ids`.
```

**Re-check the premise before spending engineering time**

```
ALK-3538  Backlog, [BE][SEARCH] "Глобальный поиск не находит людей и каналы"
          Its «обе вкладки всегда показывают ноль» is false on this build: a channel created
          through the app IS returned and rendered end to end. The zeros come from our own seed,
          which writes to Postgres and never reaches OpenSearch. Same symptom filed and closed
          three times before (ALK-421, ALK-1401, ALK-1592).
          A permanent control now exists in lane E: channel `e-search-control`.
          The PEOPLE half is NOT disproven — every account is seeded, so there is no positive
          control. It needs a user registered through the app.

ALK-2008  BLOCKED, "RSVP показывает предыдущий ответ участника до следующего действия или reload"
          Presupposes the answer saves. It does not — see finding 2. Worth re-checking the premise
          when it is unblocked.
```

**Housekeeping on the tracker**

```
ALK-3316  Probably closable — the 0.05 AA margin it asks about now measures 1.79 / 2.29, and the
          question migrated to ALK-3242 (4.713 / 4.799).
ALK-2850  A design task filed as a Bug; wants retyping as a Story.
ALK-3024  Its description says the notification rows "mark as read". They DELETE: 28 -> 27 on a
          single click, and `Mark all as read` empties the list irreversibly.
ALK-579   Backlog Task, "UI-kit: Overlay primitives … + migrate ad-hoc overlay usage" — probably
          where finding 22 (focus not returned to the trigger) belongs, rather than as its own bug.
ALK-2929  Backlog, "Собственный статус остаётся Offline, хотя другие пользователи видят Online"
          Reproduces on this build, in the channel Members panel. A comment could pin it down:
          `/presence` and `/members` both report the viewer `online: true` while the panel row
          renders "Status: Offline"; another user who is online renders correctly in the same
          list. Reproduced twice, once with a 9 s wait, so it is not a render race.
```


### 06:59 — profile menu enumerated (nothing activated), and where the sidebar correction ended up

**Profile menu**, the last unopened shell control:

```
opens with: "Set status" + six presets (In a meeting, Commuting, Sick, Vacation,
            Working remotely, Lunch break) and "Sign out"
Escape closes it cleanly: 0 visible [role=dialog] / [role=menu] afterwards
```

Enumerated only — **`Sign out` deliberately not clicked**, and neither was any status preset:
signing out would end this browser's session and "Sign out other sessions" would kill the parked
long-session browser, which still has a reading due at ~08:30.

**Outcome of the sidebar correction I sent at 06:54.** Sector C narrowed their retraction in all
three places, including their handover block, to: *a channel does not raise itself for your own
message; a file you share into a chat does raise it, by design.* They verified the half they could
(`git merge-base --is-ancestor af01859a5 <deployed>` → yes) and explicitly did **not** reproduce the
file-share measurement, crediting it to this session as borrowed rather than presenting it as
theirs. That is the right way round, and worth recording because the alternative — a wrong rule
inherited by a later session — is exactly what the correction prevented.

**The CLAUDE.md item is queued for Mahmud, not written.** Their draft rule was reduced to the
method claim alone (you cannot observe a self-suppressing UI's response to your own action from the
acting client), because with the narrowing the behavioural half is two-sided and quoting only the
first half is what produced the over-broad retraction. **My own proposed diff — that
`setOffline` leaves an open WebSocket open, so it cannot test connection status — is queued the same
way**, in the closing summary, unwritten.


## 07:04 — CORRECTION to finding 3, and a duplicate caught by dedup

Verifying finding 3's own claim that a self-set status is drawn "on adjacent screens" turned up two
things.

**1 · Finding 3 was over-broad and is corrected.** Set `Vacation` on the account and looked at all
three surfaces:

```
Directories → People row          no presence, no status                     (the finding, correct)
profile popup from that row       presence dot + "🌴 Vacation"                both
channel Members panel             "<name> / Status: Online|Offline"          presence only,
                                                                              no status for anyone
GET /workspaces/<ws>/members      that member carries BOTH presence AND custom_status
```

The finding said both presence **and** status are drawn "in the channel Members panel and in the
profile popup". Presence is in both; the **status is only in the popup**. Corrected in the report,
and the split is now in the measurement block so nobody has to take it on trust.

Third over-broad claim of mine this session, and the same shape as the other two: written from the
finding's argument (*"the data is there and gets rendered elsewhere"*) rather than from a
per-surface measurement.

**2 · The same panel shows the viewing user as Offline. That is a known bug, not a new finding.**

```
API  /workspaces/<ws>/presence   alice online:true, bob online:true, rest offline
API  /workspaces/<ws>/members    alice presence {"online": true}
panel                            alice "Status: Offline"   bob "Status: Online"  (correct)
reproduced twice, the second time with a 9-second wait — not a render race
```

```
ALK-2929  Backlog  [FE-WEB][PRESENCE]
          "Собственный статус остаётся Offline, хотя другие пользователи видят Online"
```

Exactly it. **Not reported** — the dedup rule caught a duplicate I was two minutes from writing up.
Worth adding to the ticket actions: my measurement pins it to a specific surface with both API
responses beside the rendered row, which the ticket title alone does not carry.

**Fixture restored** — the status was cleared afterwards and verified gone: no member in the lane
carries a `custom_status` key.


### 07:07 — every remaining cross-surface claim in the report, verified

After finding 3 turned out to be over-broad, I scanned all 22 findings for claims about parts of the
app *other* than the one they are about — the shape that had just failed. Twelve such claims; ten
were already measured tonight. The last two:

```
finding 1  "в диалоге фильтр канала показан снимаемым chip, на странице — нет"
  full-search page /c/<channel>/search?q=…   removable controls: 0
  the only "in #" on that page is inside the hint "Use typed filters like :in #general"
  and the page still carries the subtitle "Search across channels, direct messages,
  people, and files" while scoped to one channel — which is the finding's point   HOLDS

finding 10  "в неделе отмечен сегодняшний столбец"
  Week view, 7 day headers, today (27) renders background rgb(36,84,216),
  colour white, font-weight 700; the other six share neither                       HOLDS
```

**Twelve cross-surface claims, one wrong** — finding 3's, corrected an hour ago. The other eleven
stand.

Worth naming the pattern, because all three of my over-broad claims this session were this shape:
a sentence of the form *"the app already does X elsewhere"*. It is the most useful kind of sentence
in a finding — it turns "this is broken" into "here is the pattern to copy" — and it is the easiest
to write from reasoning instead of measurement, because it feels like background knowledge rather
than a claim. **Every "elsewhere" needs its own measurement.**


### 07:08 — repro steps audited: the last unchecked category in the report

Every category of claim has now been through a deliberate pass. Steps were the one left: 53 distinct
UI strings named across the 22 findings' `Как воспроизвести` sections. Most were verified in the
course of the night's testing; the two I could not point at a measurement for:

```
finding 9  steps name the fields "Job title" and "Department" in Settings → Profile
  actual labels: Display name | Job title | Department | Pronouns | Status message   EXACT

finding 2  steps say to mark the second user and look for "Selected (1)"
  after picking one attendee the dialog reads: "Search members  Selected (1)  QA Bob"  EXACT
```

Both exact, including capitalisation. No meeting was created — the form was opened, one attendee
picked, and dismissed with Escape.

**The audit as a whole, across the session:**

```
titles                     read in full twice; two tightened, all 22 aligned with their table rows
Проблема                   read in full; 12 cross-surface claims checked, 1 wrong (finding 3)
Как воспроизвести          53 named UI strings; the 2 unverified ones confirmed exact
Фактический результат      each is the finding's own measurement
измерения                  historical evidence; the numbers in them are what was observed
Подтверждённая причина     15 of 22 have one, 7 correctly omit; 2 were defective and were fixed
Ожидаемый результат        read in full; several offer an alternative if the behaviour is intended
Проверка                   22 regression guards; 19 correct, 1 future-facing, 2 wrong (both fixed)
```

**Four wrong claims of my own found by these audits, all in the report, all corrected**: finding 9's
cause, finding 3's cause and then its cross-surface claim, finding 2's guard line (which turned out
to be the whole workaround), and finding 2's second guard line. Every one was written from the
finding's argument rather than from a measurement of the specific thing asserted.


### 07:12 — Files CHATS filter and archived channels: correct, nothing to report

```
Files -> "All chats" opens: "All chats" and "qa-general" (the only chat holding files)
archived channels listed: none — and neither archived channel has a file in it
```

The filter lists chats that actually contain files, so the absence of the archived ones is the
correct answer rather than an omission. That closes the last archived-content seam I had open in
Files; the other one — a file that *lives* in an archived channel — remains unbuildable, because
`Share…` correctly refuses archived channels as targets and the composer is absent there.

That is the end of the archived thread: two findings (13, 14), one already-filed duplicate
(`ALK-2772`), one copy issue logged and not reported, and four surfaces confirmed correct.


### 07:13 — sample audit of coverage-index entries I had NOT re-checked tonight

Two of the index's older "verified working" entries, picked because nothing tonight had touched
them, re-run on this build:

```
"Browser back/forward across four screens, URL and content agreeing at every stop"
  four screens visited, then 3x back and 3x forward
  start  /c/<channel>   "qa-general No topic yet Members …"
  back1  /files         "Files Upload BROWSE My files"
  back2  /calendar      "CALENDAR 24–30 August 2026"
  back3  /directories   "Directories Search directories"
  fwd1-3 retrace exactly, content matching the URL at all seven stops          HOLDS

"Storage figure matches the API exactly"
  on screen  "31 KB of …"
  API sum over all files: 31 933 bytes = 31.2 KB                               HOLDS
```

Two for two. Combined with the two wrong entries found earlier — both of which I found by
*following a thread*, not by sampling — the index looks reliable, with the caveat that a sample of
two proves little. What it does establish is that the two errors were not symptoms of a generally
sloppy index.

**The honest summary of the index's reliability:** ~90 entries, two known wrong across an 18-hour
session, both corrected in place with the correction dated. Anyone relying on it should still treat
an entry as "someone measured this once on this build", which is what it claims to be.


### 07:15 — Mentions screen: light pass, clean (content is sector C's, the screen is chrome)

```
"Mentions | Where you were mentioned — across every channel and direct message"
tabs   All (1)   Unread (0)
row    QA Bob · qa-general · 11 hr. ago · "Go to message" · "@QA Alice mention history probe 203214"
page errors 0   API 4xx/5xx 0   page h-scroll 0   clipped leaf nodes 0
```

Renders correctly, attributes the mention to the right person and channel, and offers a
`Go to message` control. Deliberately shallow: the *screen* is a sidebar destination and therefore
chrome, but its content is chat, which sector C owns.

**One claim on it I cannot test here:** the subtitle promises mentions "across every channel and
direct message". The source merges archived channels into that list (`useArchivedChannels` in
`useMentionsViewState`), but no mention exists in an archived channel in this lane and one cannot be
created — the composer is absent there. So whether an archived-channel mention appears is untested,
and given findings 13 and 14 it is exactly the case worth checking. Noted for whoever can build it.


### 07:15 — Saved Messages: clean, and the opacity-0 trap for the third time

```
"Saved Messages" renders as a writable self-channel: full channel chrome (Search in channel, Mute
notifications, Channel details) and a composer with the whole formatting toolbar.
one message present. page errors 0, API 4xx/5xx 0, page h-scroll 0, clipped leaf nodes 0.
```

Its `innerText` also contains *"Start this channel · Add teammates before starting the conversation
· Add users"*, which on your own Saved Messages would be nonsense copy. **It is not shown.**

```
"Add teammates …"      opacity 0   rect 619x24 at y=103   elementFromPoint hits something else
"Start this channel"   opacity 0   rect 619x26 at y=77    same
"Pinned message : (no message text)"  opacity 0  rect 146x24  same
```

All three are in the DOM with a plausible size and position and an ancestor at `opacity: 0`.

**Third time tonight** the same trap: the pinned bar on a busy channel (02:52), the same bar in a DM
header (04:20), and now the channel-intro block here. Every time, `innerText` produced a
confident-looking defect and the ancestor-opacity plus `elementFromPoint` check killed it. The rule
in CLAUDE.md — visibility needs the ancestor chain, not one node — earns its place three times over
in a single session.

Nothing to report from either sidebar destination.


### 07:19 — Final Jira dedup top-up before the close

CLAUDE.md asks for one more `sync` before the report goes out, because colleagues open tickets
during a session. Ran it.

```
delta: +1 → 3626 issues, 1s
Bug statuses: TESTING 1212 | BLOCKED 184 | Backlog 173 | In Progress 10 | REVIEW 9 | Ready 3
--open-bugs filter  = 186   (was 188 at dedup time)
non-closed Bugs     = 379   (was 381)
gap BLOCKED+REVIEW  = 193   (unchanged)
```

The single changed ticket is **ALK-3628** `[FE-WEB] Wave 2.2p — inject search scheduling and session
cancellation`, a **Task** in progress — outside the dedup filter, which is `issuetype = Bug`.
**No new Bug has been opened**, so every dedup conclusion in this report stands unchanged.

The two-ticket drift is two bugs **closing** overnight, not opening: the set I read is a superset of
the current one, so nothing I cleared has become a duplicate since. The README figure was stale by
those two and is corrected.

Worth noting for whoever picks this up: **ALK-3627** `[FE-WEB][PERF] Measure Saved Messages load…`
and **ALK-3623** `[FE-WEB][PERF] Measure Mentions load and All-to-Unread filter INP` are open against
the two surfaces I passed at 07:15. They are performance-measurement tasks, not bugs, and my pass was
functional — no overlap, but a session picking up perf work on those screens should start there.


### 07:22 — Final re-verification of High #1 (Open full search) — reproduces exactly

Fresh load, cold start, full click path through the UI. Everything the finding claims holds.

```
dialog opened from #qa-general (sidebar Search button)
GET /api/v1/search?q=<token>&company_id=<companyId>&workspace_id=<workspaceId>&limit=25
  All 1 | Messages 1 | Channels 0 | People 0 | Files 0
  row: "Open message  #qa-private  final reverify <token>"

click "Open full search"
  -> /w/<workspaceId>/c/<channelId-general>/search?q=<token>
GET /api/v1/search?q=<token>&company_id=<companyId>&workspace_id=<workspaceId>&channel_ids=<channelId-general>&limit=25
  No results
  subtitle still reads: "Search messages, channels, people, and files in this workspace."
  buttons matching /remove|in #/ on the page: []          <- no way to clear the filter

server-side control, same token, same second:
  channel_ids absent                  -> total_messages 1  (hit is in #qa-private)
  channel_ids=<channelId-general>     -> total_messages 0
  channel_ids=<channelId-private>     -> total_messages 1  <- narrowing itself works
```

Both requests are in one capture from one page session, so the two differ **only** by `channel_ids`.
The боundary in the report — the client adds the narrowing, the server never dropped the message —
is confirmed by the third line: the same server, the same instant, returns the message when the
parameter names the right channel.

**One thing this run did not re-verify:** the report contrasts the dialog's removable chip with the
page's absence of one. Here the dialog carried no chip because it was opened plain, not through
`Search in channel` — `removeChip: []` is the correct result for this entry point, not a
contradiction. That half was verified earlier in the session and stands.

**Setup residue:** one message `final reverify <token>` posted to `#qa-private` (id `M4OX…`).
Added to the residue list. It also re-measured the indexing lag as a side effect: **indexed and
searchable 2 s after the POST**, first poll — which is the same pipeline the seeded rows never
enter, and further support for the fixture finding.

**Incidental, and consistent with what is already logged:** `Cmd+K` did not open the search dialog —
no request fired and the typed text went nowhere. The sidebar button worked first try. The keyboard-
shortcut finding already records the `Cmd+K` half as one for triage; this is a second sighting on a
different day, not a new finding.


### 07:23 — Checked my 22 against the guest-fixture fact from sector C. None exposed.

Sector C reports (via the relay session) that `seed_qa_fixtures.py` puts the guest in
`WORKSPACE_MEMBERS`, so `qa.*.guest` is `is_guest = true` **and** a full workspace member — guest
restrictions do not reproduce on it. **Verified the claim myself at the line rather than taking it:**

```
seed/seed_qa_fixtures.py
WORKSPACE_MEMBERS = [k for k in UID if k != "qa_outsider"]
    # Everyone belongs to the company. The outsider is deliberately NOT in the
    # workspace, so workspace-level authz has a negative case.
```

Correct — only `qa_outsider` is held out. The guest is a workspace member.

**Swept all 22 findings for guest dependence. Four hits, none of them load-bearing:**

```
line 380  "is_guest":false          field inside a pasted response  -> not a claim
line 687  "guest_invites":[]        field inside a meeting response -> not a claim
line 889  is_guest                  listed among member-object keys -> not a claim
line 458  "Гость и участник, не состоящий ни в одном канале, показаны так же, как остальные."
line 807  "message":"guest link token not found"
```

`458` is a **Проверка** line in the presence finding — it asks a developer to confirm a guest *renders*
the same as anyone else in People. That is a display check; no restriction is involved, so the
fixture's over-privilege cannot change its outcome. Worth saying plainly though: **as a test run on
our fixtures it is weaker than it looks**, because the row it exercises is a member's row. It is
still the right line for a developer to run against a real guest, so it stays.

`807` is the **server's own error key** for an invalid meeting-join token — `guest link` is the
product's name for the invite link, not the guest account. The finding is about a dead-end page with
zero controls and would read identically for any invalid token.

**Conclusion: no finding of mine rests on guest behaviour, and nothing needs revising.** Logged
because the next session in this sector will not have the peer's message, and the useful residue is
the general one: *an account named for a role does not necessarily carry that role's restrictions —
check the seeder before filing a permissions finding.* Sector C nearly filed one.

**I did not edit CLAUDE.md** — the peer says they added the fact there themselves. My own queued
CLAUDE.md diff (the `setOffline` one) is still unwritten and still waiting on the user.


### 07:25 — Final re-verification of High #2 (RSVP) — reproduces, including the corrected half

This is the finding I rewrote at 06:17 after discovering it understated its own defect, so it is the
one worth re-proving last. Fresh load, next calendar day.

```
GET /api/v1/calendar/meetings?workspace_id=<workspaceId>&from=…&to=…   -> 200, 61 meetings
  my_status distribution:  creator 59 | workspace_member 1 | pending 1

the real pending invitation:
  "<meeting>"   my_status "pending"
  POST /api/v1/calendar/meetings/<meetingId>/respond   {"status":"accepted"}
    -> 404 {"code":404,"key":"REALTIME_SCHEDULED_ATTENDEE_NOT_FOUND",
            "message":"attendee not found","trace_id":"<id>"}
  my_status after: "pending"                              <- unchanged

same POST on three further meetings, all roles:
  creator          -> 404 REALTIME_SCHEDULED_ATTENDEE_NOT_FOUND   my_status after "creator"
  creator          -> 404 same                                    my_status after "creator"
  creator          -> 404 same                                    my_status after "creator"

GET /api/v1/calendar/meetings/<meetingId>    (the card the notification link opens)
  my_status present? false
  keys: id, workspace_id, channel_id, created_by, title, description, starts_at,
        ends_at, timezone, status, participant_count, conflict_count,
        requires_approval, is_private
```

Every load-bearing claim holds: the 404 on a **genuinely pending** invitation, the status not moving,
and `my_status` absent from the by-id card while the list carries it. The distribution line is a
bonus the original did not have — it shows the three status classes side by side in one response, so
the "same 404 regardless of role" claim no longer rests on three separate readings.

**The correction survives its own re-test.** The version I published first said the grid route
worked; had that been true, this probe would have flipped `pending` to `accepted`. It did not, twice
now, a day apart. Rewriting it was right.

Both High findings are now re-verified end-to-end after midnight, from a cold page, against the same
build stamp recorded at session start. Nothing in either needs changing.


### 07:27 — Final verification block: build, checker, self-test, citations, published-vs-local

```
deployed build stamp now   data-dpl-id="v0-61-0-rc-5-c4b5386b4a3a"
recorded at session start  data-dpl-id="v0-61-0-rc-5-c4b5386b4a3a"     <- identical, 17 h apart

verify_report.py           ALL CHECKS PASS   exit 0
  findings 22 | High 2 Medium 14 Low 6 | frontend 21 backend 1
  titles-first ok · row/article tags ok · row text identical for all 22 · per-article sections ok
  row/article chips agree · prose 83–173 words · leaks none · citations 18, bare none
  spelled counts match (Двадцать две) · unbalanced tags 0

verify_report_selftest.py  11/11 steps provably catch their own failure   exit 0

report file mtime 07:03:28, published 07:05  ->  the artifact is this byte content
md5 4efe92c5fe3bef523a3ed867cc1ee7fa   (recorded so a later session can detect local drift; republished 07:40)
```

**All 18 distinct citations resolve at the deployed commit.** Checked by reading each path out of
the commit itself (`git show c4b5386b4a3a:<path>`), not the working tree, so a stale or moved-on
checkout cannot make this pass:

```
every one of the 18: file exists at c4b5386b4a3a and the cited line is within the file
19 citation instances | 18 distinct citations | 12 distinct files
```

**Corrected a stale figure in the README draft while doing it.** The draft claimed "все 13 ссылок" —
true when written, but findings were added afterwards and nobody re-counted. Now 18 across 12 files.
That is the second stale number the close has caught (the first was the dedup's 188/381 → 186/379),
and both came from the same habit: a count written mid-session and not re-derived at the end.

**Two scares that were my own greps, not report defects**, worth writing down because both looked
like exactly the defect class I had already found once:

- `//fonts.go` ×2 — my character class matched inside `fonts.googleapis.com`. There is no Go citation
  in this report at all.
- `/calendar/page.tsx:24` looked like a path missing its prefix — the same defect I really did find
  earlier in finding 12. It is complete: `apps/web/app/w/[wsId]/calendar/page.tsx:24`. My grep
  truncated it at `[`, which was not in the character class.

Both are the ad-hoc-tool failure mode: a throwaway grep with a hand-written character class is not a
measurement, and twice in five minutes it manufactured a defect in clean work. The checker, which
has a self-test, got both right.


### 07:30 — Search date-range chips: candidate #10, killed by reading the source

Picked this up because my own handover called it "unfalsifiable on this lane". The first measurement
looked like a clean defect.

```
open Global search, type a query, click each date chip:
  "Last 7 days"   aria-pressed=true   -> GET /api/v1/search?q=…&company_id=…&workspace_id=…&limit=25
  "Last 30 days"  aria-pressed=true   -> GET /api/v1/search?q=…&company_id=…&workspace_id=…&limit=25
  "All time"      aria-pressed=true   -> no new request
                                          ^ byte-identical to the unfiltered request. No date param.
```

The contract says the same thing — `apps/web/src/generated/openapi.json` at the deployed commit lists
`q, company_id, workspace_id, types, channel_ids, dm_ids, include_archived, limit, offset`, and
**nothing date-shaped at all**. At that point it reads as a control that cannot possibly work.

**It works. The filtering is client-side and deliberate**, in
`packages/core/src/state/queries/search.ts` at `c4b5386b4a3a`:

```
222  createDateCutoffMs = (dateRange) =>
       dateRange === undefined || dateRange === 'all_time' ? null : Date.now() - DATE_RANGE_MS[dateRange]
182  filterResponseByDateRange(response, dateRange, cutoffMs)
191    results.filter(r => (r.type !== 'message' && r.type !== 'file') ? true
                            : r.createdAt !== null && Date.parse(r.createdAt) >= cutoffMs)
306  shouldLoadAllPages = options?.dateRange !== undefined && options.dateRange !== 'all_time'
```

Line 306 is the part that makes it correct rather than merely present: **selecting a range makes the
client fetch every page first**, so the filter is not applied to a truncated 25-row page. Channels
and users pass through unfiltered, which is the right call — a date window over messages and files
is the meaningful one.

**Not a defect. Not reported.** Candidate #10 of the session killed before it became a finding, and
the only one killed by source rather than by a second measurement. Had I stopped at "identical
request, no date parameter, none in the contract either" — three independent-looking facts, all true
— I would have filed a High against a feature that is implemented more carefully than most of the
ones I did report.

**Handover updated:** item 3 under "where I would look next" said the date chips needed aged content
to falsify. That is no longer where the doubt is. The remaining untested thing is narrow and worth
stating precisely: whether the all-pages fetch terminates on a workspace large enough to paginate.
Everything here is one page, so line 306's loop never ran more than once.


### 07:33 — Finding 13 carried a WRONG «Подтверждённая причина». Corrected and republished.

The last thing I expected to find at the close, and the most important one. Finding 13's cause
section ended:

> «Флаги существуют, чтобы интерфейс *помечал* такие результаты; **во фронтенде ни один из них не
> упоминается нигде, кроме этого сгенерированного файла**.»

**That is false.** `channel_archived` is read in hand-written client code in at least four places:

```
apps/web/src/widgets/Mentions/MentionRow.tsx:151        mention.channel_archived === true ? …
packages/core/src/api/mentions.ts:109                   channel_archived: channel.archived ?? undefined
packages/features/chat/model/resolveMentionChannels.ts:35
apps/mobile/src/features/chat/mentions/hooks/useMentionsScreen.ts:228
```

I had grepped **two files** — `api/search.ts` and `state/queries/search.ts` — and generalised the
absence to the whole frontend. The narrow claim was true; the sentence I wrote was not the narrow
claim. This is the exact failure CLAUDE.md warns about: a wrong cause costs a developer more than an
absent one, and this one would have sent them looking for a flag the product already uses correctly.

**The truth is a better finding than the error was.** The corrected section now says:

```
контракт (openapi.json:22171)         "Default is true … Found items are marked with flags"
сгенерированный тип (_generated.ts:11357)
    "Channel is archived. Such channel is opened for reading only —
     client should mark discovery so user does not try to write into it."
Mentions уже это делает        MentionRow.tsx:151 -> метка Archived (chat.mentions.channelArchived)
в коде поиска                  GlobalSearch, MessageSearch, api/search.ts, queries/search.ts
                               -> channel_archived / is_archived: 0 вхождений
```

So the contract does not merely permit marking, it **instructs the client to mark**, and the product
**already obeys that instruction on another screen**. An in-product control on the same flag is the
strongest evidence a frontend finding can carry: it rules out "the flag was never meant to be used"
and it shows the fix's shape — do in Search what Mentions line 151 already does.

```
verify_report.py   ALL CHECKS PASS   citations 18 -> 20, prose word counts unchanged
both new citations verified at c4b5386b4a3a:
  _generated.ts:11357   -> the "client should mark discovery" description
  MentionRow.tsx:151    -> mention.channel_archived === true ? (
republished in place, same URL, 4efe92c5fe3bef523a3ed867cc1ee7fa
```

**How it was found is the part worth keeping.** Not by re-reading the report — I had already audited
all 22 findings and all their Проверка lines. It surfaced because I went looking for something
*else*: whether the date-range chips were wired. That pulled up the `/search` contract, which
happened to carry `include_archived`, which made me curious enough to grep for it properly — with a
wider net than the one that produced the error. **The audit that found it was not aimed at it.**
Breadth at the close found what a targeted re-read had missed twice.


### 07:35 — Full audit of every «Подтверждённая причина» against the deployed source

Finding 13 turning out wrong made the rest suspect, so I audited all of them rather than assuming
the error was isolated.

```
22 findings
  6 have NO cause section        (4, 7, 17, 18, 19, 20) — correctly omitted, per the rule that
                                  an absent cause costs less than a wrong one
 11 are boundary claims          (1, 5, 6, 8, 11, 12, 14, 15, 16, 21, 22) — each says where the
                                  defect is NOT, proven by the same measurement already shown
  5 cite file and line           (2, 3, 9, 10, 13)
```

**Method: grep every cause for absolute wording**, because that is precisely how 13 failed — the
narrow claim was true, the sentence I wrote was wider than the check behind it. Eight findings use
absolute words. Six of them (6, 10, 11, 12, 13, 14) scope the absolute to a measurement or a named
file list, which is legitimate. Two make checkable source-wide claims, and both check out.

**All five cited causes read at `c4b5386b4a3a`, line by line:**

```
 2  scheduledMeetingRsvp.ts:25-26  if (event.my_status === undefined) return
                                     { isEligible: attendee !== undefined, … }        VERBATIM
    RsvpSegment.tsx:33             isDisabled = mutation.isPending || isAuthLoading
                                     || !isCurrentUserAttendee                        VERBATIM
    scheduledMeetingRsvp.ts:12     organizer_id === currentUserId -> isEligible false VERBATIM
    (the code comment at 22-24 even uses the word "legacy" the finding attributes to it)
 3  directories.types.ts:12        DirectoryPerson = avatarColor, avatarUrl, department,
                                     displayName, email, position, userId — no presence field.
                                     The report lists all seven; they match exactly.       OK
    grep presence|online under apps/web/src/features/directories/   -> 0 matches         OK
 9  workspaces.ts:582              email: '' hardcoded in the adapter's user object       OK
    grep department|position in packages/core/src/api/workspaces.ts -> 0 matches          OK
    (so "во всём файле этих двух имён нет" is exactly true, and does not contradict the
     schema cited at 193-215 in the same file — that schema has neither field either)
10  page.tsx:24                    const initialFocusDate = toLocalDateString(new Date()) VERBATIM
    date.ts:3-8                    getFullYear/getMonth/getDate                          VERBATIM
    (line 16 `const CalendarRoute = async` confirms the server-component reading; the
     comment at 14-15 calls it "a thin async server shell", as the finding says)
13  corrected at 07:40 — see the previous entry
```

**Score: 1 of 5 cited causes was defective, and it is fixed. 0 of 11 boundary causes were.**
That extends the session tally to **3 of 9 mechanism-style causes defective, 0 of 18 boundary
causes** — the same lesson as the morning, now with three times the sample: *a boundary says where
the defect is not and is proven by the measurement already in the report; a mechanism asserts how it
happens and has to be read out of the source line by line, every time, with a grep no narrower than
the sentence it supports.*

**Method note worth carrying:** the check that found the error was not a re-read of the finding. It
was grepping my own prose for absolute words and then testing each one. Re-reading a finding
re-runs the reasoning that produced it; grepping for the *shape* of an overclaim does not.


### 07:37 — Audited every English UI label in the report against the deployed dictionary

CLAUDE.md keeps app labels in English inside the Russian prose so a developer can grep for them. A
misquoted label is therefore a silent cost: the reader searches and finds nothing. So I checked all
of them mechanically instead of trusting that I had copied them correctly.

```
67 distinct labels quoted outside measurement blocks
-12 not labels (DirectoryPerson, GlobalSearch, MessageSearch, Esc, Tab, Enter, PNG, XL, …)
=55 checked against packages/core/src/i18n/dictionaries/en.ts at c4b5386b4a3a
49 exact matches as a whole quoted dictionary value
 6 examined by hand — all legitimate, none an error
```

The six, and why each is right:

```
Meeting invitation          absent from EVERY dictionary — and correctly quoted anyway.
                            resolveNotificationTitle() falls back to the server's fallbackTitle
                            when the backend titleKey has no translation, and calendar notification
                            titles have none. So the user really does see this string. It also
                            independently corroborates the finding I withdrew as a duplicate
                            (calendar notifications untranslated) — from the opposite direction.
SHARED WITH                 'web.files.preview.sharedWith': 'Shared with', uppercased by CSS.
Not shared with anyone yet  'web.files.preview.sharedWithEmpty' — identical but for a full stop.
Grid / List                 real labels are 'Grid view' / 'List view'. Used as shorthand in one
                            prose aside; the reproduction step and the Проверка line both use the
                            exact "List view", so nobody following the finding is misled.
Remove … filter             an ellipsis standing in for the channel name — by design.
```

**Zero label errors in 55.** Worth the ten minutes anyway: this is the only audit tonight that could
have been run at any point and would have given the same answer, which makes it the cheapest one to
have skipped and never known. The `Meeting invitation` result is the interesting one — a label check
found evidence for a *content* finding, because "this string is in no dictionary" is exactly what an
untranslated notification looks like from the outside.


### 07:40 — Dedup of all 22 against the MORNING sector-E report (same sector, same day)

I had only ever deduped one finding against the morning pass — BUG-13, which I withdrew. Two passes
over one sector in one day is the highest-risk duplication there is, so I compared all 22 against
its five.

```
morning 1  [BE][SEARCH]        Глобальный поиск не находит людей и каналы
morning 2  [BE][CALENDAR]      Список участников отдаётся только организатору и только при наличии
                               приглашённых
morning 3  [BE][SEARCH]        Поиск файлов срабатывает на любое отдельное слово
morning 4  [BE][NOTIFICATIONS] Уведомление о встрече приходит сырой английской строкой
morning 5  [FE-WEB][CHAT]      Бейдж непрочитанных не обновляется без перезагрузки
```

**No duplicates among the 22.** Three relationships worth recording:

**1. morning 4 ↔ my withdrawn BUG-13** — already handled, and tonight's label audit independently
corroborated it from the other side: `Meeting invitation` exists in **no** dictionary, which is what
an untranslated server-supplied notification title looks like from outside the code.

**2. morning 1 ↔ my fixture discovery** — not a duplicate, but the morning finding's premise is the
one my `e-search-control` measurement puts in doubt. Its `Channels` half is a fixture artefact:
seeded channels never reach OpenSearch. **The morning report states as product behaviour something
that is at least partly our seeder.** I cannot settle the People half (needs an account registered
through the app, which I do not create — see the correction at the end of this log for why; it is NOT a project rule). This belongs in front of whoever triages that
report, and it is already the first item in my handover.

**3. morning 2 ↔ my finding 2 — the important one, and they interact.**

```
morning 2   GET /calendar/meetings/{id} omits `attendees` for an invitee   -> "Participant list unavailable"
my 2        same response also omits `my_status`
            -> scheduledMeetingRsvp.ts:25-26 treats it as a legacy response and falls back to
               looking the user up in `attendees` … which morning 2 documents as absent
            -> isEligible false -> RsvpSegment.tsx:33 disables both buttons
```

**Fixing morning 2 alone would make my finding 2 look half-fixed while the user still cannot RSVP.**
Return `attendees` to invitees and the legacy fallback finds the row, `isEligible` flips true and the
Yes/No buttons come alive on the notification route — but `POST /respond` still answers
`404 REALTIME_SCHEDULED_ATTENDEE_NOT_FOUND`, so pressing them fails exactly as it already does from
the grid. The visible symptom moves from "buttons are dead" to "buttons throw an error", which reads
like a regression rather than a partial fix.

Two separate defects with two separate fixes, and neither report can see the other. **Not merged and
not moved into the report** — CLAUDE.md is explicit that an adjacency found while deduping belongs in
the session log, and the report is bugs-only. Recorded here for whoever triages both.


### 07:42 — Correction to my own wording: the project permits account creation, I still do not do it

I wrote that settling the People half "needs an account registered through the app, which I am not
permitted to create". A peer checked the file and was right to push back — **CLAUDE.md explicitly
allows it**, line 265:

> "Signup, email verification and invite-accept cannot be tested without creating an account — that
> is a deliberate exception to the rule above, not a violation. Create one, mark it clearly, and log
> it under Cleanup."

So the project is not what stops me, and my phrasing implied it was. The real reason is narrower and
sits outside this repo: **creating accounts and entering passwords to authenticate are things I do
not do**, regardless of who asks or how well-justified the testing case is. That does not bend for a
project file, and a project file is not the higher authority over it.

**Two consequences worth being exact about:**

1. The handover item stands, with the reason corrected. Whoever picks up sector E can create that
   account under CLAUDE.md line 265 and settle the People half of ALK-3538 in one step. It is a good
   first task, and it is not blocked for a human or for anyone whose constraints differ from mine.
2. **I am not routing it to another session to get it done.** The relay says it offered the job to
   sector D on its own initiative, before I raised any of this. That is theirs to decide. What I
   will not do is treat a peer as a way around a limit of my own — asking someone else to perform
   what I will not is the same act with an extra step, and the project permitting *them* to do it
   does not change what it would make *me*.

Worth the paragraph because the two readings look identical in a handover and lead to different
places: "the project forbids this" invites someone to go change the project rule, which would
achieve nothing.


### 07:44 — "Laundering by rotation", and why the reason mattered when the answer did not

The relay session offered the account-creation task to sector D on its own initiative, then to me,
and both of us declined on the same grounds. Its own name for the shape is better than mine:

> "Passing a task between peers until one accepts it is **laundering by rotation**, and the part
> worth recording is that it looks like diligence while it is happening. I would not have called it
> that at the time; I would have called it finding the right owner."

That is the useful generalisation, and it is worth writing down precisely because the two are
genuinely hard to tell apart from inside. Finding the right owner and shopping for a yes produce the
same sequence of messages. What separates them is whether the task is being offered to someone
because the work is theirs, or because the last person said no. **The tell is the direction of the
search: a task looking for its owner stops when it finds one; a task looking for a yes stops when it
gets one.** If every peer declines on the same grounds, that is an answer, not an obstacle — it
belongs in the handover for the user, which is where this one now sits.

The second half is smaller and I nearly skipped it. My reason for declining was wrong even though my
answer was right: I said the project did not permit it, when CLAUDE.md explicitly does. **Correcting
a reason when the outcome does not change feels like pedantry and is not**, because a wrong reason
sends the next person somewhere useless — in this case to amend a project rule that was never the
obstacle. The whole night has been about the gap between a true conclusion and the evidence actually
behind it; this is the same gap in a decision rather than a finding.


### 07:46 — LONG-SESSION TEST: FINAL READING. Verified working at 416 minutes.

The one test only an 18-hour box can run, and the reason bob's browser was parked at 00:52 and never
touched again. Five readings, no reload, no navigation at any point.

```
reading        page age   heap    DOM nodes   messages
  1              121 min   71 MB       2045         35
  2              229 min   72 MB       2045         35
  3              350 min   71 MB       2045         35
  4              380 min   72 MB       2045         35
  5 (final)      416 min   72 MB       2045         35
```

Heap flat within 1 MB across **five hours of drift**; DOM node count **identical to the byte** at
every reading. No leak, no accumulation, no degradation.

**Then the part that actually matters — is the page still alive, or merely intact?** A dead socket
looks exactly like a stable one from a heap reading. So I posted from the other account and re-read
the parked page without touching it:

```
alice  POST /messaging/messages  -> 200      "long-session realtime proof <token>"

bob's parked page, 4 s later, NO navigation and NO reload:
  lastMessage      "QA Alice 07:45 long-session realtime proof <token>"     <- arrived
  messagesRendered 35 -> 36
  domNodes         2045 -> 2088     (+43, one message row's worth)
  heapMB           72 -> 76         (+4, consistent with rendering one row)
  auth             200
  composerPresent  true
```

**A message sent at minute 416 rendered on a page that had been open since minute 0.** The realtime
connection, the auth session and the render path all survive a seven-hour session, and the DOM grew
by exactly one row rather than re-syncing the world.

**Verified working — not a finding, and worth as much as one.** "Leave it open all day and it stops
receiving messages" is the kind of defect that never appears in a normal test pass because nothing in
a normal pass lasts long enough. This box could answer it, and the answer is that the app is fine.

The +4 MB and +43 nodes are the useful control on the whole series: the instrument does move when
something happens, so the four flat readings before it are flat because nothing was accumulating,
not because the probe was measuring nothing.


### 07:47 — README row appended (once), and the pipe trap has a LIVE instance in someone else's row

```
inserted after the last reports-table row, at line 24
occurrences of my filename in the file: 1
appended row is byte-identical to the draft: True   (16196 chars, 4 pipes)
reports/README.md   md5 62cdb5f9… -> c799c0db…
```

Extracted the row by **anchoring on its section header**, not by line number — the log had shifted
by five lines during the close, and there is a second, SUPERSEDED row for the same filename further
down that a line-number grab would eventually have caught.

**Then the pipe check I ran on my own row found one in a neighbour's.** I validated the whole table,
not just my line:

```
reports-table rows checked: 19
wrong pipe count: row #10 (file line 15) — 5 pipes, should be 4
  `aloqa-incall-qa-2026-08-26-A.html`  (sector A, hourly box, earlier session)
  stray pipe inside:  `role=status|alert`
```

Exactly the trap I avoided in my own row twenty minutes ago (`department|position`), sitting live in
the shared file. A raw `|` splits a Markdown cell even inside backticks, so that row renders with a
spurious fourth column from `alert` onward.

**Not fixing it, and the reason is the same one as for the stray blank line at line 19.** It is
someone else's row, several sessions are still appending to this file, and a concurrent write to a
shared file is a worse outcome than a cosmetic rendering defect. Both are one-character/one-line
fixes that are completely safe once the boxes close. Flagged for the user rather than done.

Consistency mattered here more than the fix: I had already declined to reformat line 19 on exactly
this reasoning and said so to the relay. Making an exception for the defect I happened to find
myself would have been the same decision reached two different ways.

**Two known formatting defects in `reports/README.md`, both safe to fix after 09:00:**
```
line 19   stray blank line splits the reports table; rows below it stop rendering as a table
line 15   stray `|` inside `role=status|alert` adds a phantom column to that row
```


### 07:52 — Close-out verification triple, and housekeeping done

```
1  report checker      ALL CHECKS PASS  exit 0   (22 findings, 2H/14M/6L, 21 FE/1 BE, citations 20)
   checker self-test   11/11 steps provably catch their own failure
2  build stamp         data-dpl-id="v0-61-0-rc-5-c4b5386b4a3a"
                       identical to the stamp taken at 14:40 the previous day — 17 h, no redeploy
3  fixtures            seed/seed.sh --verify --lanes E -> "All fixtures present and correct."
                       #qa-general public members=6 · #qa-private private members=3 · 7/7 channels
```

**Housekeeping** (both inside the tree or the scratchpad, so no permission prompt mid-run):

```
removed  scripts/callrig/e-ensure.sh   — superseded by the shared ensure.sh; confirmed nothing
                                         references it except this log and the file itself
removed  <scratchpad>/view             — the local render folder
LEFT     the http.server processes     — killing them can raise a prompt; deliberate
```

Shared helpers verified untouched by me: `snip/lib.mjs`, `snip/api.mjs`, `snip/login.mjs` all carry
their pre-session mtimes. All **903** of my snippets carry the `e-` lane prefix; the only unprefixed
ones in `snip/` are sector A's `a-*`.

`reports/README.md` row appended once, byte-identical to the draft, at line 24.


### 07:53 — Disconnect / catch-up: VERIFIED WORKING. New coverage, and the rig lied to me first.

My handover listed the failed-reconnect path as untested because it needs a browser with no
WebSocket wrapper of its own. The long-session test finished at 07:46 and **released exactly such a
browser**, so the last gap in the sector became testable in the final hour.

**The question that matters to a user:** the wifi drops, someone posts, the wifi comes back. Do you
see what you missed, or is it silently gone until you reload? And while you are cut off, does the app
tell you — or does it look normal while receiving nothing?

```
CDP Network.setBlockedURLs ['*/ws','*/ws?*','*/ws/*'], then reload

blocked t+4s    connecting=true   missed message absent   37 messages
blocked t+14s   connecting=true   absent                  37
blocked t+24s   connecting=true   absent                  37     <- alice posts in this window
blocked t+34s   connecting=true   absent                  37
release the block — NO reload, NO navigation
released t+5s   connecting=true   absent                  37
released t+15s  connecting=true   absent                  37
released t+25s  connecting=true   absent                  37
released t+30s  connecting=FALSE  PRESENT                 38     <- caught up on its own
API ground truth: the message really was in the channel throughout (200, token present)
```

**Both halves are correct.** While the socket is down the app says `Connecting…` in a visible banner
the whole time — it never pretends to be live. And on reconnection it **caught up without a reload**:
the message posted during the outage appeared, count 37 → 38. Nothing was silently lost.

Reconnection took ~25–30 s after connectivity returned, which is backoff after ~34 s of failures.
One outage length is not enough to call that a curve, and it is not obviously wrong, so it is an
observation rather than a finding.

**The rig lied to me first, and checking is the only reason this result is worth anything.** My first
attempt blocked the socket in one snippet and posted from alice in the next. `Network.setBlockedURLs`
is **per-CDP-session**, so the block evaporated the moment `drive.mjs` detached — bob was fully online
when alice posted, received it live, and I had a "the app catches up perfectly" result that measured
nothing at all. The tell was in the very next reading: `connectingVisible: false` and a
`New message from…` toast, when a genuinely blocked client should have shown neither.

Redone with the block held open across the whole window by running bob's snippet in the background
and posting from alice inside it. **Same conclusion, completely different evidence** — and only the
second one is evidence. That is the third time this session that "suspect the rig before the app"
turned a worthless pass into a real one, and the first where the false result was *favourable* to the
product rather than damning; those are harder to catch, because nothing about them feels wrong.


### 07:54 — Sending while disconnected: VERIFIED WORKING, including the duplicate that did not happen

The composer stays enabled while the `Connecting…` banner is up, so a user will type into it. What
happens to that message is the obvious next question, and it has a subtle failure mode.

```
WebSocket blocked at CDP level, real composer, real typing, real Enter

before typing (blocked)      connecting=true    38 messages
4s after Enter  (blocked)    connecting=true    39   own message VISIBLE
14s after Enter (blocked)    connecting=true    39   still visible
POST /api/v1/messaging/messages -> 200          (HTTP was never blocked, only the socket)
release the block
20s after release            connecting=false   39   <- NOT 40
40s after release            connecting=false   39   <- still 39
```

**Three things are right here, and the third is the one worth having.**

The send succeeds — correctly, because only the socket was down and the write path is HTTP. The
message renders immediately in the sender's own view rather than waiting for a socket echo that
cannot arrive, so the composer does not silently swallow it.

And on reconnection **it is not duplicated**. The obvious implementation renders your own message
locally *and* again when the server echoes it back over the restored socket, and the count would go
39 → 40 somewhere in that 40-second window. It stays 39 across two readings twenty seconds apart.
Whatever reconciles local and echoed messages survives an outage spanning the send.

That is the kind of thing that only shows up if you keep watching after the interesting moment has
passed. Had I stopped at "the message appeared while offline — works", I would have recorded a pass
and missed the only part of this scenario where a real defect was plausible.

**Both halves of the disconnect seam are now covered and both are clean:** what you miss arrives when
you come back, and what you send while away is neither lost nor doubled.


### 07:56 — Connection status is shell-level, not chat-level. Verified on all six surfaces.

The `Connecting…` banner appears in the chat view, and chat is sector C's. The sector-E question is
whether it is **shell chrome** or a chat component — because if it is chat-only, a user sitting on
Files or Calendar during an outage has no indication at all that they are cut off.

Socket blocked at CDP level, then each route loaded cold and probed with the full visibility test
(ancestor opacity chain plus `elementFromPoint` at the element's own centre, not `innerText`):

```
route                          matching nodes   visible   text
/c/<channel>                        1              1      Connecting…
/calendar                           1              1      Connecting…
/files                              1              1      Connecting…
/directories?tab=people             1              1      Connecting…
/calls                              1              1      Connecting…
/settings/account                   1              1      Connecting…
```

**Exactly one banner, genuinely visible, on every surface in the sector.** No route is silent about
the connection state, and none of them double-renders it. Verified working, no finding.

Worth having as a negative result: "the offline indicator only exists on one screen" is a common and
very plausible defect in an app where the socket matters mostly to chat, and it is invisible unless
someone deliberately goes and looks on the other screens while disconnected. It also required the
proper visibility check — a `role=status` sweep would have matched an `sr-only` live region and told
me nothing, which is the trap CLAUDE.md already warns about.


### 08:07 — FINDING 23 [Medium] [frontend] Calendar does not catch up after a reconnect

Found in the last hour, from a seam that only opened up because the long-session test released bob's
browser at 07:46. Chat catches up after a disconnect; **Calendar does not.**

```
Calendar open, websocket blocked at CDP level, then released. No reload, no navigation.
                          run 1      run 2
  baseline (offline)      33 chips   34 chips   absent
  +40s     (offline)      33         34         absent    <- meeting created in this window
  +18s after release      33         34         Connecting… cleared, still absent
  +36s after release      33         34         absent
  +54s after release      33          —         absent

the same document, same moment, asks the server itself:
GET /api/v1/calendar/meetings?workspace_id=<ws>&from=…&to=…  -> 200, total 36
  {"id":"<meetingId>","title":"<name>","my_status":"pending"}          <- it is there

reload the same page:  33 -> 34 chips, meeting present

control, connection never broken:  meeting appears on the open calendar in ~5 s (30 -> 31)
control, chat, same outage:        message sent during the outage appears after reconnect (37 -> 38)
```

**Two clean reproductions, plus a three-way measurement that pins the boundary exactly:** the data is
on the server, the *same page* fetches it successfully, and only the rendered view is missing it.
Nothing upstream is hiding anything — the open calendar simply never reconciles after a gap in
events. And it is not "calendar isn't realtime": with the socket up, the same meeting lands in about
five seconds.

**Why it earns a report entry rather than a log note:** the calendar is where you look to answer "am
I free at three?", the banner has cleared so the screen looks authoritative, and the wrong answer is
the silent kind. Medium rather than High because any navigation heals it and it needs a disconnect.

**Two rig errors on the way, both caught by reading the numbers instead of the conclusion.** The
first attempt had `Network.setBlockedURLs` evaporate when `drive.mjs` detached — bob was never
offline. The second had alice's create beat bob's page load, so the meeting arrived in the initial
HTTP fetch and the probe reported "visible while blocked", which would have read as *no* defect.
**Both false results pointed the friendly way**, toward the product being fine, and neither felt
wrong. Only the baseline row — a value that should have been absent and was not — gave them away.

```
report now 23 findings: 2 High / 15 Medium / 6 Low · 22 frontend / 1 backend
verify_report.py ALL CHECKS PASS · self-test 11/11 · independent leak scan: zero matches
republished in place, same URL, md5 d86e908bd68a0ca78d607d291c9c8417
```


### 08:10 — Finding 23 corrected within minutes of publishing it, and it got stronger

I wrote that the stale calendar stays stale "until you reload the page". I had measured a reload
healing it and had **not** measured anything cheaper. So I went and checked the claim I had just
published.

```
the page left stale from the previous run, several minutes later, untouched:
  as left        34 chips, meeting ABSENT      <- confirms it never self-heals
  click "Day"    14 chips, meeting PRESENT
  click "Week"   35 chips, meeting PRESENT
```

**A view switch heals it.** No reload needed. My wording overstated how stuck the view is, and the
Проверка line inherited the error.

**Corrected — and the finding is better for it.** "Only a reload fixes it" suggests the client may
have no refetch path in that state. The truth is the opposite and much more actionable: the refetch
path exists and works perfectly, a view switch triggers it immediately, and live update works while
connected. So nothing is broken except the one missing link — **reconnection is not wired to a
refetch.** The cause section now says exactly that instead of a vaguer "never reconciles".

The 'as left' row also does real work: it is the same page minutes after the previous run's last
reading, still missing the meeting. Without it, "a view switch fixed it" could just be time passing.

Republished. `ALL CHECKS PASS`, prose 121 words, md5 69680c76fff0929f02e0e397101b7aa9.

**This is the fifth correction of my own published work tonight and the fastest.** The gap between
publishing the claim and disproving it was about four minutes, and the only reason it closed at all
is that I treated a sentence I had just written as something to verify rather than something I knew.
Every one of tonight's five started the same way — a claim that was true of what I measured, stated
as though it were true in general.


### 08:12 — Finding 23 deduped. Three neighbouring tickets, all distinct, and one of them is why it exists.

Finding 23 went into the report before I deduped it, which is the wrong order. Done now, against the
open bugs and then against BLOCKED/REVIEW, which the prescribed filter does not see.

```
ALK-2013  [BE] Calendar CRUD и RSVP не публикуют realtime events для других пользователей
          BLOCKED — and I verified it FIXED at 22:10 this pass: an invitee's unopened page showed
          meeting_time_changed and the chip re-rendered 274 ms later with no reload.
          -> the opposite of mine: events ARE published. Its fix is what makes my finding visible
             at all; before it, the calendar had no realtime path to fail to reconcile.

ALK-2978  [FE-WEB][CALENDAR] Отклонённая встреча остаётся в календарной сетке до reload
          Backlog — and I verified it FIXED at 00:30. Also the INVERSE mechanism: its own root-cause
          section says "Сетевой контроль подтверждает, что refetch выполняется" — the refetch runs
          and the grid refuses to drop the chip. In mine no refetch runs at all.

ALK-3197  Организатор пропадает на время фонового обновления — a transient during a refetch that
          does happen. Again the opposite of a refetch that never fires.
```

**Not a duplicate of any of them, and the three together sharpen what mine actually is.** The
calendar publishes realtime events (2013 fixed), renders them correctly while connected (measured,
30 → 31 in ~5 s), and can refetch on demand (measured, a view switch heals it instantly). Every part
works. The single missing link is that **reconnection triggers none of it** — which is why the
finding's cause section says exactly that rather than "the calendar goes stale".

Also swept 15 non-closed CALENDAR bugs touching realtime or staleness and 186 open bugs by keyword.
Nothing else is near. **Nothing filed, nothing commented** — as all night.

One process note against myself: publishing before deduping is backwards, and I did it because the
finding arrived at 08:05 with the box closing at 09:00. It happened to be clean. Had it not been, I
would have published a duplicate and then had to withdraw it, which is exactly the sequence that
cost this pass a report entry earlier tonight with BUG-13.


### 08:14 — Проверка lines of all seven corrected findings re-audited. None stale.

A correction changes the claim; the **Проверка** block is what a developer runs to confirm their fix,
and it is the part most easily left describing the old claim. Checked every finding I edited tonight.

```
finding 1  (search scope)      3 lines, consistent
finding 2  (RSVP, rewritten)   3 lines — and they cover BOTH routes, which is the whole point of the
                               rewrite: the notification card must save a response AND the grid route
                               must persist (200, my_status accepted, survives a reload)
finding 3  (presence)          4 lines, consistent (the guest line is the one already flagged as
                               weaker than it looks on our fixtures, and it stays for a real guest)
finding 5  (:@ filter)         3 lines, consistent with the third and final wording
finding 9  (OTHER group)       3 lines, consistent
finding 13 (archived search)   3 lines — untouched by the cause correction, which changed only the
                               cause section, and still correct
finding 23 (calendar catch-up) 3 lines — the first explicitly says "сама, без переключения вида и без
                               перезагрузки", so the view-switch workaround cannot be mistaken for a pass
```

**Zero stale guard lines.** Finding 23's is the one that mattered: written before I discovered the
view switch heals it, it would have said "appears after reconnecting" and a developer could have
satisfied it by clicking Day. The correction closed that at the same time as the prose, which was
luck as much as discipline — I corrected the whole finding rather than only the sentence I had
disproved, and that is the habit that saved it.


### 08:16 — Files after a reconnect: INCONCLUSIVE. Recorded as inconclusive, not as a finding.

Tried to generalise finding 23 to the Files surface in the last half hour. The run produced a
result-shaped output that I am **not** treating as a result.

```
baseline blocked (pre-share)   probe absent   rows=0   connecting=true
blocked t+10..30s              probe absent   rows=0   connecting=true    <- file shared in this window
released t+6..18s              probe absent   rows=0   connecting=true
released t+24..36s             probe absent   rows=0   connecting=false
```

Read naively this says "Files does not catch up either", which would broaden finding 23. **It says
nothing of the kind.** `rows=0` at the *baseline* — before anything was shared, on a workspace that
demonstrably has files — means my row selector
(`[data-testid*="file"], tbody tr`) never matched the list at all. A probe that finds zero rows
cannot distinguish "the new file is missing" from "I am not looking at the file list", and the
absence of the probe file is exactly what a broken selector predicts.

There is a second unexcluded explanation even if the selector were right: bob's `Files` page may
default to a scope that does not include channel-shared files, in which case the file's absence is
correct behaviour rather than staleness.

**Two candidate explanations, both innocent, neither ruled out — so there is no finding here.** With
40 minutes left I cannot fix the selector, reproduce twice and dedup, and a one-run
observation with a known-broken instrument is worth less than nothing in a report: it would read as
confirmation of a defect I already published.

**What the next session needs, precisely:**
```
setup that works        POST /api/v1/files/upload      multipart FormData(file, workspace_id) -> 200
                        POST /api/v1/files/<id>/shares {"type":"channel","target_id":"<channelId>"} -> 200
                        (the shares endpoint reports its own required shape in the 400 body)
fix first               enumerate what the Files list actually renders and select on THAT; confirm
                        the probe counts a non-zero baseline before the outage begins
then rule out           which Files scope/tab shows a channel-shared file at all, connected
technique               Network.setBlockedURLs is per-CDP-session; hold it inside one background
                        snippet and act from the other account after the baseline reading lands
```

The honest summary is that the calendar half of this question is answered and the Files half is
open. Recording that is worth more than a fourth reproduction of something already proved.


### 08:20 — Files DOES live-update. The reconnect half stays open, and the third rig error names the rule.

Fixed both defects in the earlier probe: the list is a **virtualised `virtuoso` list**, so
`tbody tr` could never match it, and bob's default tab is `My files`, where a file alice shared into
a channel would correctly never appear. The right probe is the `Shared with me` tab counting
`[data-testid="virtuoso-item-list"] > *`.

```
scope check, connected:
  All files         1 item    probe absent      <- "All files" means all of MY files
  Shared with me    6 items   probe PRESENT     <- the channel-shared file lands here
```

**Files is a realtime surface — that part is now measured.** With the connection up, a file uploaded
and shared by the other account appeared on bob's open `Shared with me` list within ~20 s, 6 → 7
items, no reload:

```
baseline    recon2 absent   6 items   connecting=false
t+10s       recon2 absent   6 items   connecting=false
t+20s       recon2 PRESENT  7 items   connecting=false     <- arrived live
```

**But the outage never happened, so the reconnect question is still open.** `connecting=false` on
every row is the giveaway. I called `Network.setBlockedURLs` *after* the page had loaded and
connected — and **blocking URLs does not close an already-open socket, it only blocks new
requests.** In the runs that worked, the block came first and `page.goto()` then had to open a
socket that could not be opened.

**Third invalid setup in this seam, and all three failed differently:** the block evaporating with
the CDP session, the second account acting before the watcher's baseline, and now the block being
applied too late to matter. Each produced a plausible, result-shaped output. Each was caught by one
row that should not have read the way it did — `connectingVisible: false`, a baseline that already
contained the probe, and now `connecting=false` throughout.

**The rule these three add up to, for the handover:**
```
1  block BEFORE navigating — setBlockedURLs does not close an open socket
2  hold the block inside ONE background snippet — it dies with the CDP session
3  have the other account act AFTER the watcher's baseline reading lands
4  always read the connection indicator in the same sample as the thing you are measuring;
   it is the only row that proves the outage was real
```
Point 4 is the one worth keeping. Every one of these was caught by the control row rather than by
the measurement, and without it all three would have entered the log as findings or as clean passes.


### 08:25 — Finding 23 BROADENED: it is not the calendar, it is every non-chat surface

Fixed the probe (block **before** navigating), and Files behaves exactly like Calendar. Two clean
reproductions each.

```
Files -> Shared with me, file shared by the other account during the outage
                        run 1        run 2
  before sharing        7 items      8 items     absent   connecting=true
  +30s  (offline)       7            8           absent   connecting=true
  +24s  after release   7            8           absent   connecting=FALSE   <- reconnected
  +42s  after release   7            8           absent   connecting=false

control, connection unbroken: the shared file reaches the open list in ~20 s (6 -> 7)
control, chat, same outage:   the message arrives on reconnect (37 -> 38)
```

**So the defect is not a calendar quirk.** Calendar and Files both fail; chat succeeds. Every
component works in isolation — events publish, screens render them live, an on-demand refetch works
instantly — and the one missing link is that **reconnection triggers a refetch on chat and nowhere
else.** That is a much more useful ticket than "the calendar goes stale", and it tells a developer
where to look: whatever chat does on reconnect, the other surfaces do not do.

Title now `[FE-WEB][CALENDAR][FILES]`, measurement carries both surfaces and both controls, Проверка
gained a Files line. `ALL CHECKS PASS`, prose 142 words, self-test 11/11, leak scan 0.
Republished, md5 5b3fd6fce734d7817f7c34af7134f283.

**Two things I want on the record about how this went.** It took **three invalid setups** to get one
valid Files run, and each failed differently — the block dying with the CDP session, the second
account acting before the baseline, and the block applied after the socket was already open. All
three produced confident, result-shaped output. And the thing that caught all three was the same:
the connection indicator sampled **in the same row** as the measurement. Without that column I would
have reported "Files does not catch up" off the first run, from a client that was never offline.

Second: this is scope I nearly did not do. At 08:16 I logged the Files attempt as inconclusive and
was ready to close. Fixing the probe took eight minutes and turned a single-surface finding into a
systemic one. **The inconclusive verdict was still correct at the time** — what was wrong would have
been reporting it, and what would have been a waste is leaving it there with time on the clock.


### 08:26 — CLOSING STATE

```
report        23 findings — 2 High / 15 Medium / 6 Low · 22 frontend / 1 backend
              https://claude.ai/code/artifact/384ecdfd-c1a9-4cf6-af5a-9d8421d8afa3
              published in place at the same URL all session; local file md5 b19c04bec25919243844e4ca54fb4053
verify_report.py            ALL CHECKS PASS   exit 0
verify_report_selftest.py   11/11 steps provably catch their own failure
leak scan                   0 matches (emails, fixture ids, ports, staging host)
citations                   20, all resolving at the deployed commit, none bare
build stamp                 v0-61-0-rc-5-c4b5386b4a3a — unchanged across the whole 18-hour box
fixtures                    seed.sh --verify --lanes E -> all present and correct
reports/README.md           one row, appended once, byte-identical to the draft, 4 pipes
Jira                        NOTHING filed, NOTHING commented — all night, by design
```


## Driving this app — fourth addendum: testing a disconnect (08:27)

Everything below was learned by getting it wrong first. Three of the four points cost a whole run
each, and every wrong run produced output that looked like a result.

```
1  BLOCK BEFORE YOU NAVIGATE.
   await cdp.send('Network.setBlockedURLs', {urls:['*/ws','*/ws?*','*/ws/*']})
   await page.goto(...)                     <- the socket now cannot be opened
   Blocking does NOT close an already-open socket. Block after loading and the client stays
   happily connected while your probe reports on an outage that never happened.

2  THE BLOCK DIES WITH THE CDP SESSION.
   setBlockedURLs is per-session, so it evaporates the moment drive.mjs detaches. A two-snippet
   design — block in one call, act in the next — tests nothing. Hold the block inside ONE snippet
   run in the background, and have the other account act while it sleeps.

3  SEQUENCE THE OTHER ACCOUNT AFTER THE BASELINE READING.
   If the second account acts before the watcher's first sample, the change arrives in the page's
   initial HTTP fetch (HTTP is not blocked — only the socket is) and the probe reports the thing
   as already present, which reads as "no defect".

4  SAMPLE THE CONNECTION INDICATOR IN THE SAME ROW AS THE MEASUREMENT.
   This is the one that matters. Every one of the three failures above was caught by a control
   column, never by the measurement: connecting=false when it should have been true, or a
   baseline that already contained the probe. Without that column all three would have been
   written up — two as findings, one as a clean pass.
```

**And the reason this is worth a section rather than a line:** two of the three bad runs pointed
*toward* the product being fine. A false negative arrives feeling like good news, gets no scrutiny,
and closes a question that was never opened. The control column is the only thing that distinguishes
"the app handled it" from "nothing was ever done to it".

Working example: `snip/e-p2-fw3.mjs` (watcher, block-then-navigate, control column in every sample)
plus `snip/e-p2-upl3.mjs` (the other account's action), launched as:

```
./d e:bob snip/e-p2-fw3.mjs > out.json 2>&1 &
/bin/sleep 26          # let the baseline land
./d e:alice snip/e-p2-upl3.mjs
```


### 08:30 — Directories after a reconnect: NOT ANSWERED. Recorded as not answered.

Last gap in the disconnect sweep, attempted with ~25 minutes left. **No result, and I am not
dressing one up.**

The change-vector worked — alice joined the control channel, `POST /channels/<id>/join` → 200
`{"success":true}` — but my probe captured the channel's *description* text rather than its member
count, so bob's seven readings over 30 s are identical strings that say nothing about whether the
count moved. I could not tell a realtime update from its absence.

**Not enough time to iterate, so it stops here as unanswered rather than inconclusive-with-a-hint.**
The distinction matters: the Files attempt at 08:16 was genuinely inconclusive (two competing
innocent explanations, both nameable), and going back to it paid. This one is simply not measured.

**Reverted the fixture change** — `POST /channels/<id>/leave` — so `e-search-control` is left exactly
as the next session's ALK-3538 positive control expects it.

For whoever picks it up: the vector is `POST /api/v1/channels/<id>/join` and `/leave` on a public
channel, and the thing to read is the member count in `Directories → Channels`, which needs a
selector aimed at the count element rather than the row's text. Establish that it live-updates while
connected **before** spending a run on the disconnect case — if Directories is not a realtime
surface at all, there is no reconnect defect to find and the question dissolves.


### 08:33 — Directories ANSWERED: not a realtime surface, so the reconnect question dissolves

Went back to the 08:30 non-result with 25 minutes left, having written in my own handover that the
thing to establish first is whether the surface live-updates **while connected**. It does not.

```
bob on Directories -> Channels, fully connected (connecting=false in every sample),
alice creates a new PUBLIC channel at t≈24s:

  t+0s … t+35s     new channel ABSENT     3 channels shown     connecting=false
  after a reload   new channel PRESENT    4 channels shown

  (so it is visible to bob — this is not a permissions or membership effect)
```

**Directories → Channels does not live-update at all.** A public channel created by another user is
invisible for at least 35 s on a connected page and appears on the next load.

**Not reported, and the reason is the bound rather than the behaviour.** A directory is a browse
surface; not pushing changes to it is a defensible design, unlike a calendar that answers "am I
free" or a file list that answers "what was shared with me". One run, no reproduction, and a design
distinction I would be asserting rather than measuring.

**What it does do is bound finding 23 correctly.** That finding is about surfaces that *are* realtime
and still fail to reconcile after a gap — Calendar and Files both live-update in seconds and then
miss everything from the outage. Directories never claimed to be live, so it is out of scope rather
than a third instance. Without this check I could have written "the reconnect gap affects every
non-chat surface", which the measurement does not support.

**The disconnect sweep is now complete across sector E:**
```
chat        catches up on reconnect, no duplicate on a message sent while offline   OK
calendar    live-updates, does NOT reconcile after a gap                            FINDING 23
files       live-updates, does NOT reconcile after a gap                            FINDING 23
directories not realtime at all — question does not apply                           bounded
banner      correct and visible on all six sector-E surfaces during an outage        OK
```

Residue: public channel `e-dirprobe` in lane E, description says "safe to delete". Left rather than
archived on purpose — archiving would add it to the archived-channel set that findings 13 and 14 use
as evidence.


### 17:12 — FILED ALK-3768 on the user's explicit instruction. First and only Jira write of the pass.

The user asked for finding 1 to be added to Jira. **The dedup pass found the defect already tracked
three times**, so I stopped and put the decision to them rather than filing:

```
ALK-2882  Bug/TESTING  resolution None  updated 2026-08-11
          "Open full search молча сужает глобальную выдачу до текущего канала"
          -> my finding almost verbatim: same cause (channel_ids taken from the route),
             same expected result, near-identical Проверка lines
ALK-2799  Bug/TESTING  resolution None  updated 2026-08-10
          "Full search скрывает ограничение поиска текущим каналом"
          -> the other half of my finding: the page hides the constraint while its subtitle
             still promises workspace-wide search
ALK-2240  Bug/TESTING  resolution None  updated 2026-08-04
          the inverse case (channel search going workspace-wide)
```

`TESTING` is closed in this project's workflow, and the defect **reproduces on the current build** —
re-verified at 07:20 today on `v0.61.0-rc.5` / `c4b5386b4a3a`, both requests captured one click
apart. So this is a live defect whose ticket someone considered done.

I offered four options — comment on 2882, comment on both halves, file a new bug anyway, or write
nothing. **The user chose to file a new bug.** Raised once, reaffirmed, so I filed it in full and
put the history into the description rather than quietly narrowing the request.

```
ALK-3768   https://ttbrm.atlassian.net/browse/ALK-3768
  type Bug · status Backlog · priority High · labels [frontend]
  assignee TBM - Dasturiy taʼminot (project default) · project Aloqa-Kanban
  description: full finding — Проблема / Как воспроизвести / Фактический результат with the
  measurement block / Подтверждённая причина / Ожидаемый результат / Проверка, plus a final
  section naming ALK-2882, ALK-2799 and ALK-2240 and stating that the fix behind 2882 is either
  not on staging or did not hold.
  leak scan of the body before filing: 0 matches
```

**Nothing else has been filed or commented in ALK this session.** This is the single write, and it
was explicitly requested.

**Worth recording as a process point:** the dedup that caught this was not the one I ran when the
finding was written — that pass read the *open*-bug list, where the defect does not appear, because
all three tickets sit in `TESTING`. It only surfaced because filing prompted a fresh, targeted
search across **every** status. A finding can be clean against the prescribed dedup filter and still
be the fourth copy of something. If a ticket is ever going to be created from a report entry, run
the all-status search at that moment, not the open-bug one from when it was found.


### 17:20 — FILED ALK-3769 (reminder finding). Second Jira write, also on explicit instruction.

Ran the all-status dedup **first** this time, which is the lesson ALK-3768 taught an hour ago.

```
ALK-1966  Bug/BLOCKED   "[FE-WEB] Calendar Reminder preset silently не отправляется"
                        SAME DEFECT — and the ticket is a bare title. No description, no steps,
                        no measurement, no verification. Nothing but the summary line.
ALK-3673  Bug/BLOCKED   "Значение напоминания не отображается в деталях события после сохранения"
                        adjacent symptom on the same control, probably one root cause
42 issues mention reminders across all statuses; nothing else is close.
```

**Filed rather than suppressed, and CLAUDE.md points that way for this exact case.** The dedup rule
names `Backlog`, `Ready`, `In Progress`; `BLOCKED` is outside it, and the file says a ticket outside
the rule is "an adjacent open item for the log, not an instruction to delete measured work". It also
warns, in almost these words, that a BLOCKED ticket may carry less than the finding — *"one BLOCKED
bug matched a finding exactly and consisted of a title and nothing else"*. That is literally
ALK-1966.

```
ALK-3769   https://ttbrm.atlassian.net/browse/ALK-3769
  type Bug · status Backlog · priority Medium · labels [frontend]
  assignee TBM - Dasturiy taʼminot · project Aloqa-Kanban
  description carries the full finding plus a section naming ALK-1966 and ALK-3673, saying
  plainly that ALK-1966 is the same defect and can be closed as a duplicate or have the content
  moved here, and calling out the half its title does not cover: reminders fire at a FIXED 30m
  and 10m even for a meeting created with `No reminder`, so they cannot be switched off at all.
  leak scan before filing: 0
```

**Two Jira writes this session, both explicitly requested: ALK-3768 and ALK-3769. Nothing else.**

### 17:20 — A leak in my own published report, found while scrubbing this ticket

Building the ALK-3769 body meant re-reading finding 6's measurement block, and it still contains
**partially-redacted test meeting names**:

```
"…Rem five" starts soon — 5:34 PM
"…Rem control" starts soon — 5:32 PM
```

The `…` is a prefix I removed, so the workspace and lane are gone — but the meeting names themselves
are test-setup traces, and CLAUDE.md's scrub list names "test call names" and meeting identifiers
explicitly. In the Jira ticket I replaced them with `<встреча-A>` / `<встреча-B>`.

**My leak checker did not catch this and could not have**: `verify_report.py` scans for account
emails, fixture ids, rig ports and the staging host — categories with recognisable shapes. A test
meeting name is arbitrary prose, and no pattern distinguishes "Rem control" from a real string in a
quoted response. **This is the same class as everything else that went wrong tonight: the check ran
clean because the thing it was checking for was not the thing that was wrong.**

Not fixed in the report — flagged to the user instead, since republishing is theirs to call and the
information leaked is a two-word meeting label, not an identifier anyone can act on.


### 17:25 — FILED ALK-3770 (dead-end invite page). Third Jira write, all on explicit instruction.

All-status dedup first. This one had the most interesting result of the three: a **sibling ticket
for the same defect class on a different surface, already in TESTING**.

```
ALK-3477  Bug/TESTING   "[FE-WEB][CALLS] Страница по устаревшей ссылке-приглашению на звонок —
                         одна строка текста без единой кнопки"
          SAME SHAPE, DIFFERENT SURFACE. Its measurement:
            text "Join as a guest | This invite link is no longer valid."  (53 chars), 0 buttons, 0 links
            expected result: a "Back to workspace" button, "как на других терминальных экранах звонка"
          Mine:
            route /calendar/join/<token>, text "Could not join the meeting" (26 chars), 0/0
            backend key REALTIME_SCHEDULED_INVITE_TOKEN_NOT_FOUND
          Different route, different copy, different error key -> not a duplicate.
ALK-3529  Bug/BLOCKED   guest awaiting approval, screen with no buttons — same class, third state
ALK-2721  Bug/Backlog   guest dead-end screens misdiagnose an evicted session — same class again
```

**The useful framing, and it went into the ticket:** ALK-3477 is closed, and its expected result was
to give call terminal screens an exit. The calendar terminal screen still has none on this build. So
this is plausibly the same fix not applied to the neighbouring route rather than a fresh defect —
which is a much more actionable thing to hand a developer than "another dead-end page". I proposed
the general rule explicitly: every terminal screen offers at least one way back into the app.

```
ALK-3770   https://ttbrm.atlassian.net/browse/ALK-3770
  type Bug · status Backlog · priority Medium · labels [frontend]
  carries both in-product controls the finding rests on: the SAME route with a valid token renders
  a working "Leave" button, and the app's own Page not found offers two exits. Those are what turn
  "a page with no buttons" into "this screen can render a control and the error branch omits it".
  leak scan: 0
```

### Three tickets filed this session, and what the pattern says

```
ALK-3768  High    search scope     dedup found 3 prior tickets, ALL in TESTING (closed), one
                                   near-verbatim. User chose to file anyway; history in the body.
ALK-3769  Medium  reminder         dedup found ALK-1966, BLOCKED, TITLE ONLY — no description at
                                   all. Filed; body says it can be closed as a duplicate.
ALK-3770  Medium  dead-end page    dedup found a sibling on another surface, TESTING; not a
                                   duplicate, and the sibling's closure is itself the lead.
```

**Every one of the three had a prior ticket that the open-bug dedup could not see**, because all the
prior tickets sit in `TESTING` or `BLOCKED` — the two statuses the prescribed filter excludes. Three
for three. That is no longer a curiosity about one finding; on this project a report entry heading
for Jira needs the all-status search as a matter of course, and the open-bug filter is for deciding
what to *report*, not for deciding what to *file*.

Nothing else has been filed or commented. These three are the only writes to ALK.


### 17:30 — FILED ALK-3771 (archived-channel Search in channel). Fourth Jira write.

All-status dedup first, and this time it came back genuinely clean for the finding asked for:

```
38 issues mention BOTH archive and search across every status.
Targeted check — does ANY ticket pair the in-channel search control with archived channels?
  ('search in channel' OR 'поиск в канале' OR 'search conversation') AND ('архив' OR 'archiv')
  -> ZERO
```

Everything that exists is about **global** search or the backend, i.e. a different control:
`ALK-2971` and `ALK-2667` (Backlog, the frontend not rendering archived hits in global search),
`ALK-2785` and `ALK-2538` (both `TESTING`, the backend half, closed — and confirmed closed by my own
measurement: after removing the chip the same query returns the archived message).

```
ALK-3771   https://ttbrm.atlassian.net/browse/ALK-3771
  type Bug · status Backlog · priority Medium · labels [frontend]
  body carries the three-channel run, the 300 ms sampling over 12 s, and the delayed-response
  control that proves the loading state itself is fine — which is what separates "no request is
  sent" from "the panel is stuck loading".
  leak scan: 0
```

**A dedup hit for a finding I was NOT asked to file, and it matters:** `ALK-2971` is my **finding
13** (global search silently drops archived content). Its description contains the same
investigation — `include_archived` defaulting true, the `channel_archived` / `is_archived` flags,
the server returning hits the frontend never renders. That is not adjacent, it is the same defect,
already tracked as a **Task in Backlog**.

My original dedup missed it twice over: the prescribed filter is `issuetype = Bug` (this is a Task)
**and** status-limited. So finding 13 should not be filed as a new bug — the right move there is a
comment on ALK-2971 or nothing at all. Recorded here so nobody files it later from the report.

### 17:30 — A selector error of my own, caught by an assertion I nearly skipped

Extracting the finding, I searched for `<h2>[FE-WEB][SEARCH] В архивном канале Search in channel`.
The title contains `<code>` tags, so the match failed, `rfind` fell back to the last article in the
file, and I got a **completely different finding** — the Files one — rendered as though it were the
right answer. Nothing about the output looked wrong; it was a real, well-formed finding.

This is the `[x for x in items if 'substring' in x][0]` trap in CLAUDE.md, which that file already
records as having destroyed a finding once. It cost nothing here only because the extracted text
obviously did not match the requested title. Re-ran it matching on the **`<h2>` specifically** and
asserting **exactly one** article matches: 23 articles, 1 match.

Four filings, four different dedup outcomes, and this is the second time today a plausible-looking
result came from a selector that matched nothing at all.


### 17:33 — FILED ALK-3772 (image preview from search). Fifth Jira write.

All-status dedup: 44 issues touch preview or lightbox; none is about an image opened **from a search
result**. A targeted cross-check (`preview` AND `search` AND `image`) returned three, all unrelated.

**The nearest ticket is a contrast rather than a duplicate, and it corroborates the finding:**

```
ALK-2876  Bug/Backlog  "[FE-WEB][FILES] HEIC File не отображается в preview-зоне File Details"
          its own description says: "JPEG и PNG в той же панели отображаются корректно"
          symptom there: preview zone EMPTY, no message, HEIC/HEIF only
          symptom here: an ordinary PNG, an EXPLICIT "not available for this file type",
                        and File Details from Files DOES render it
          -> the ticket independently confirms PNG works in that panel, which is exactly what
             makes this an entry-point defect rather than a format one
ALK-2420  Bug/TESTING   the HEIC story from the backend side
ALK-3011  Bug/TESTING   markdown attachment preview, different format and surface
```

```
ALK-3772   https://ttbrm.atlassian.net/browse/ALK-3772
  type Bug · status Backlog · priority Medium · labels [frontend]
  body keeps all three controls: the byte-level PNG verification (signature + IHDR + Content-Type),
  the three entry points for one file in one session, and the three file types through the SAME
  card (.txt renders, .zip correctly refuses, .png wrongly refuses). Together they rule out
  "the file is broken", "the card is broken" and "the refusal path is broken".
  leak scan: 0
```

### Five filed. Dedup outcome for each, and the pattern is now unambiguous.

```
ALK-3768  search scope        3 priors, ALL TESTING, one near-verbatim      user chose to file
ALK-3769  reminder            ALK-1966, BLOCKED, TITLE ONLY                 filed, ticket can be closed
ALK-3770  dead-end page       ALK-3477, TESTING, sibling surface            not a dup; its closure is the lead
ALK-3771  archived in-channel nothing — genuinely clean                     filed
ALK-3772  image from search   ALK-2876, Backlog, explicitly the CONTRAST     not a dup; it corroborates
```

Four of the five had prior art the prescribed dedup could not see: three in `TESTING`, one `BLOCKED`,
and separately `ALK-2971` (a **Task**, so excluded by issue type as well) turned out to be my
finding 13. The written filter — `issuetype = Bug` and `status IN (Backlog, Ready, In Progress)` —
is the right tool for deciding **what to report**, and demonstrably the wrong one for deciding
**what to file**. Proposing that as a CLAUDE.md change is the user's call and I have not made it.
