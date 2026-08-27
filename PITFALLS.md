# Pitfalls — how findings die

Every entry here is a real finding that was written up or nearly written up, and the
check that killed it. All of them come from sessions that were measuring carefully.

**The one sentence, arrived at independently by three sectors in one day:** *a probe that
finds nothing is a claim about your instrument before it is a claim about the app.* Before
writing "X is absent / missing / broken / does nothing", say what would have had to be true
for your probe to see X, and check that instead.

Read this at session start. It is short on purpose.

## Your evidence was truncated

- **`snip/api.mjs` slices the response body before you see it, and defaults to 400
  characters.** A session checked whether an account was still in the workspace member list
  after setting `Profile visibility = Nobody`, found no match for its user id, and read that
  as the privacy setting working — the account had vanished from the roster. Re-read with
  `n=6000`: 7 members, the account present and unchanged, simply past the 400th character.
  **This one fails in the direction of a positive finding**, which makes it far more
  attractive than the usual false absence and much less likely to get a second look. The
  helper now appends `…[TRUNCATED: showing N of M chars]` when it cuts, so it cannot be
  silent — but `n` is a display limit, not a fetch limit, and no search over a slice
  establishes an absence.
- **Annotating a truncation does not stop the mistake.** A second session printed
  `len: 637` directly beside `slice(0, 520)`, looked at the slice, and concluded a field
  was absent — 117 characters unexamined, in the response carrying a High finding's cause.
  The number was right there and went unused. **A slice plus a length is a truncation you
  have merely annotated.** For an absence claim the evidence must be the whole body or an
  enumeration of its keys — `api.mjs` now takes `{"keys":true}` and `{"find":"regex"}`,
  both computed over the entire response regardless of `n`.

  **Tell: you are about to write "the response has no X" while looking at output that ends
  in an ellipsis, a `…`, or a suspiciously round number of characters.**
- A tile marker list sliced to 10; the marker was 11th. Filed as "status not shown".
- A dialog dumped at 180 characters; the missing participant was at character 190.
- A name sliced to 28 characters ate `" PM"` off `06:00 PM`, twice, in two different
  sectors — once nearly filed as a 12-hour-clock bug.
- A word-level text diff ate the word "for" because "for" appeared elsewhere on the page.

**Check:** never slice the thing you are about to make a claim about. Slice for logging,
measure on the full value. A copy claim must be read off the element, never off a
transformed dump.

## Your scope was narrower than your claim

- A poller scoped to `main` saw nothing for an incoming call. **A call surface, an incoming
  banner, a toast and the bell all live outside `main`** — two sectors nearly filed
  "invitations are not delivered" against working code.
- "The Members tab offers no way to add anyone" — the add path is on the header's
  "N members" button, outside the panel being enumerated.
- Enumerating notifications only by `[role=status]`, `[role=alert]`, `[data-sonner-toast]`
  misses plain inline error text with no role. A rejected input then measures as a silent
  failure: "Enter 64 characters or fewer." was on screen the whole time.
- "Viewer checkboxes have no labels" — no `aria-label`, but every one is wrapped in a
  `<label>` and has a matching `label[for]`. Absence of one labelling mechanism is not
  absence of labelling.

**Check:** enumerate what is interactive across the whole document, not what you expected
the markup to be, and not only the container you are looking at.

## You widened a finding after deduping it

**Widening a finding is not editing it — each added instance is a new claim needing its own
dedup.** A finding cleared at two instances does not stay cleared as it grows.

- A session deduped a finding at two instances, widened it to three, then to five, and never
  re-deduped the additions. One of them turned out to be **ALK-3537, open in Backlog, filed
  off that same session's own morning pass eight hours earlier.** Nothing about the
  measurement was wrong; only the assumption that a finding stays deduped while it changes
  shape. It would have been a duplicate of their own ticket, in their own report, on the
  same day.

**Check:** dedup per instance, not per finding. The existing rule — re-read withdrawn
findings when you reach the screen — does not cover this, because nothing was withdrawn and
each new screen was genuinely new. The failure mode is specifically **growing** a finding
after it has been cleared.

## Your comparison key was not unique

**A comparison key that is not unique is the same class of error as a probe that cannot see
the thing** — it produces a confident answer from a real measurement, and the direction of
the error is arbitrary.

- Checking whether company-scope audit events reach the screen, a session matched them
  against the rendered page **by action name** and concluded they were present. They were
  not. The session's own probe roles had produced `role.created`/`role.assigned`/
  `role.deleted` at *workspace* scope too, so the action name could not distinguish the two
  scopes. Re-done by **entry id**, the answer inverted completely.

**Check:** before comparing two sets, ask what makes a member unique and whether your key
actually carries it. Ids over names, always, where an id exists. And be especially careful
when your own test activity has populated the same namespace you are matching against —
that is how a key stops being unique halfway through a run.

## Your own selector or regex is what returned nothing

- A history row filter of `(Outbound|Inbound) ·` found nothing. The app writes `Incoming`.
- Filtering the toolbar by the substring `shar` missed the button because it was reading
  `Requesting…`.
- `getByRole('More actions').first()` always opens the *first row's* menu no matter which
  row you hovered — made a state-dependent menu look state-blind.
- **Enumerating one `role` is the same mistake as enumerating one tag type, in a newer
  costume.** A session judged the channel-header `Mute notifications` button dead: no
  request, no toast, `aria-pressed` stayed `"false"`, Enter and Space did nothing — and they
  had *proved the click landed* (`elementFromPoint` returned the button's own svg,
  `activeElement` was the button afterwards). It is a **menu trigger**: its state is
  `aria-expanded`, not `aria-pressed`, and its items do not carry `role="menuitem"`. A walk
  of the whole tree with no role filter found `For 1 hour / For 4 hours / For 1 day / Until
  turned off`, all visible with real rects. **Two filters chose the answer** — the role
  filter hid the menu, and the wrong state attribute made "the click did nothing" look
  confirmed rather than caught.
- `filter({hasText:/^Unpin$/})` matches zero: icon-only controls carry `aria-label` and
  empty `textContent`. Same for `Save changes`, `Cancel editing`, `Send as file`.
- `page.locator('input').first()` matches the hidden `input[type=file]` on chat screens.
- `page.locator('[role=dialog]')` resolves differently from
  `document.querySelectorAll('[role=dialog]')`; `getByRole(..., {exact:true})` works.

**Check:** before concluding the control is missing, prove your selector matches something
you can see. A `hasText` filter that returns zero is a claim about your filter.

## You sampled once, or too late, or too early

- A "Password updated." toast had come and gone before a single post-action sample —
  nearly filed as a silent password change.
- Recording only a notice's *first* sighting caught it mid-fade-in at `opacity: 0` and
  would have called a real notice invisible.
- "The 30 oldest messages are unreachable" — the second page arrives a few seconds after
  load. Re-measured on a clean load with a longer settle: all 130 rendered.
- "An answered call leaves no event message" — the event is written when the server closes
  the meeting, minutes after everyone leaves.

- A deep-linked message was recorded as "not highlighted". It is — an accent-tinted flash
  that fades over about two seconds, read once from the DOM after it had gone. **A single
  sample is not a measurement of a transient**, which is the time axis of "my probe could
  not have seen it": the probe was pointed at the right element and was simply late.
- The channel-message toast was believed absent for the same reason. Polled at 400ms across
  a 75-second window it appears at t+24.4s and is gone by t+29.6s — **alive for about 5.2
  seconds out of 75.** Any after-the-fact read finds an empty list and concludes there is no
  toast. **The notifications surface carries at least two transients in the 2-5s range**, so
  on that surface specifically, a single sample measures nothing.

**Check:** poll from **before** the trigger, keep the **maximum** opacity over each
notice's lifetime, and key notices on text plus rounded size — one toast matches both
`[data-sonner-toast]` and `[role=alert]`. Separate a real notice from an `sr-only`
companion by **size, not the hit test**: a 1×1 `sr-only` node passes `elementFromPoint`
at its own centre.

## The click never landed, or landed somewhere else

- `page.mouse.click(x, y)` takes viewport coordinates and does not scroll. A control at
  y=1157 in a 1062px viewport got a click into nowhere, and `aria-expanded` stayed false —
  indistinguishable from a dead control.
- A naive text match on an `<LI><BUTTON>` row clicks the `LI`. The handler never fires, and
  nothing errors.

- **`Control+A` does not select-all in a macOS Chrome composer** — it is the emacs binding
  "move to beginning of line". So the common clear idiom (`click` → `Control+A` →
  `Backspace`) moves the caret to the start and deletes one character, leaving the composer
  populated, and the next `type()` inserts **in front of the leftover**. The results read
  exactly like product defects: `@qa_c_bob QA-S2-MANUAL-1@da` looks like the composer
  reordering input, `QA-S2-VIDQA-S2-WAV` like a draft-merge bug, and
  `/me QA-S2-ME5 nodse QA-S2-ME4 jumps` like a slash-command parser mangling text. Use
  `Meta+A` then `Delete`, **and verify emptiness in a loop** — Lexical restores drafts
  asynchronously after a reload, so one pass is not enough. Return whether it succeeded and
  discard the measurement when it did not, rather than reading your own artifact.
- **Identifying a row by walking N parents up from a control is unreliable, and it fails
  silently.** A session walked five parents up from a `Call` button and matched the name in
  that subtree's text; the container spanned several rows, so "QA Carol" matched while the
  button belonged to **admin**. The call went to the wrong person, every subsequent
  observation was correct-but-about-someone-else, and nothing in the result looked wrong —
  it produced a confident "the Directories path creates a new channel" that was pure
  artifact. The same walk on the channel directory returned a row whose text contained
  three channel names.

- **The same walk flips the wrong switch.** Three toggles with **no `aria-label`**, so the
  label has to come from the DOM neighbourhood: walking a fixed number of ancestors matched
  a container holding *all three* and operated the wrong one. It was caught only because the
  request body read `{"hide_presence":true}` instead of the expected profile write. The rule
  that works is **nearest ancestor containing exactly one `[role=switch]`**, then read that
  container's text. This is CLAUDE.md's "sibling controls share vocabulary" trap in a form
  the aria-label advice does not cover — there is no aria-label to match against.

**Check:** identify a row by something the row itself owns — its `href`, its id, its
`data-testid` — or by the nearest common ancestor of the control and the name. **And read
the request you caused**: it names which control you actually operated, which no amount of
DOM reasoning can confirm. Where you
must search, take the **smallest** element containing both the name and the control, by
sorting candidates on `innerText` length; `SELECTORS.md` uses exactly that for in-call
participant rows. And when a scenario involves a specific person, assert who you actually
reached before trusting anything downstream — one `auth/me` or one channel name settles it.

**Check:** `safeClick()` in `snip/lib.mjs` scrolls, **re-reads the box**, and proves the
element is topmost. It reports `off-viewport` (your scroll did not take — a rig problem)
separately from `covered` (something is on top — possibly a real finding). Collapsing
those two is how the wrong bug gets filed. And a control that exposes no pressed or
selected state cannot distinguish "clicked and nothing happened" from "never clicked" —
record that as inconclusive.

## Your reproduction repeated the actions but not the setup

- Re-running "three `Leave call` → `Join` cycles" to check whether leaves are recorded, a
  session used a `Wait for admission` call instead of an open one. Each rejoin put the
  person back in the **waiting queue**, so the cycles never happened — the clicks were
  silent no-ops and the resulting counts meant nothing, while briefly looking like they
  contradicted the original run. Caught by reading state rather than trusting the click
  sequence: `BOB inCall: False`, and on the host `WAITING (1) | Admit | Deny`.

**Check:** a reproduction has to reproduce the **setup**, not just the actions. Assert the
precondition between steps — in-call, admitted, tile count — rather than assuming a click
did what it usually does.

## A rerun that disagrees IS the result

**When a rerun changes the numbers rather than repeating them, that is the finding.** The
behaviour is timing-dependent and the first run's absolute-looking result was an artefact of
one sample. `CLAUDE.md` warns that intermittent defects read as absolute on a single run;
what it does not say is that **the second run is where you find out**, so a disagreeing
rerun must not be treated as a failed reproduction to retry until it agrees.

- Three identical `Leave call` cycles on an open call: the first run recorded **0 of 3** as
  `participant.left`, the verified rerun recorded **1 of 3**, with the other two collapsing
  into `participant.reconnected`. Same actions, same build. No rule could be stated for when
  it happens, so "a deliberate leave leaves no trace" — clean, filable, and fitting a real
  audit-log complaint — became "recorded inconsistently", which is a ticket nobody can
  confirm. It stayed in the log with both runs rather than being filed.

**Check:** if run 2 disagrees with run 1, stop and record both. Do not run it a third time
hoping for a majority — you already have your answer, and it is that the behaviour varies.

## You compared against a number you estimated

- "The recording lost two thirds of its content" — a 0:24 file against a run *believed* to
  be ~78s. Re-run pinned to the call duration badge: recorded 115–122s, file 1:57,
  `video.duration` 119.2s. Correct all along.

**Check:** both sides of a comparison must be read, not remembered.

## One client was warm and the other was cold

**In any multi-client test, whether each client already had the thing rendered is a
variable — and it is invisible from inside a single run.** Two accounts side by side look
like a controlled comparison; if one had the message on screen before the change and the
other loads it fresh, they are running different code paths and the difference will be
attributed to whatever else differs between them, such as their role.

- A filed ticket says that after the owner deletes a shared file, the **sender** sees an
  explicit `Unavailable file` placeholder while the **recipient** gets an empty rectangle,
  and pins the cause on "the recipient's session". Four measurements reconcile it
  differently: a client that had the message rendered before the delete keeps drawing
  `<img alt="<filename>">` from stale local state — the filename is no longer in the
  payload at all — and the image 404s, so its opacity never rises and you get an
  unexplained blank. A client loading fresh sees `"files":[{"id":"F…","status":"deleted"}]`,
  has no filename, and renders the correct placeholder. **Sender and recipient each show
  either behaviour depending only on what their client already holds.** The role is not the
  variable. Whoever wrote the ticket happened to have one client warm and one cold.

**Check:** decide deliberately, per client, whether it should be warm or cold, and say
which in the write-up. If a difference between two accounts is the finding, run it again
with their cache states swapped before believing the role explains it. A corrected cause
that covers every case — *a cached message is never re-evaluated against the deleted
status* — is worth far more than one that covers a quarter of them and points at
role-dependent rendering that does not exist.

## The two things you compared were not in the same state

- "The host gets no pin-screen buttons while everyone else does" — those buttons are
  Spotlight-only and she was in Grid.
- "The sidebar does not persist across reload" — `/files` and `/calendar` open collapsed by
  route default. A route-specific default reproduces a persistence result perfectly.

**Check:** before calling a difference between two clients a defect, prove they are in the
same view mode, the same route, and the same permission set.

## It was the environment, not the app

- **An external kill looks exactly like a tab crash.** `Page crashed`, `ECONNREFUSED` and
  `Target page, context or browser has been closed` all read like product defects. Two
  sessions came within one step of filing a Critical. **The tell: windows you were *not*
  driving died too, including ones running nothing.** Check
  `~/.cache/aloqa-callrig/rig-events.log`.
- **Memory pressure discards background tabs.** A discarded tab reloads with a fresh
  one-entry history and looks like a participant dropping or state resetting.
- **A long-lived tab manufactures findings — see its own section below.** This was the
  single largest source of near-misses in one sector's run: four, all the same mechanism.
- **An occluded window reports `visibilityState: hidden`** and the app suppresses the
  typing indicator when not visible. `document.hasFocus()` stayed `true` in both states and
  is worthless here. **Any cross-window live-UI measurement must record `visibilityState`
  per sample.**
- **A service that "did not react" may not be able to see the row.** This app keeps
  per-service replicas of user and membership data. `notification_db` has its own
  `channel_members`, and the seed wrote membership only to `org_db` and `messaging_db` — so
  no fixture channel could notify anyone, on any lane, and it looked exactly like a broken
  notification path. DMs worked throughout, because the app creates those channels at
  runtime and populates the replica itself. **On seeded data the fixture is as much a
  suspect as the code**, and `CLAUDE.md` naming the five databases that hold *user* rows is
  the same trap one level up; membership is the level below it.
- **Staging drift makes shipped features look broken.** The deployed frontend calls
  `PUT /meeting/{id}/breakout-rooms/focus`; staging's older backend answers 404, and the
  visible result is someone permanently labelled "In a Side Room". Bracket the backend by
  probing two routes with known landing dates before blaming the product.

## Your negative result had no working positive control

**A negative is worth exactly as much as its positive control on the same surface.** If
the control produces nothing either, you have not measured the product — you have measured
your setup, and the negative is empty.

- A session reported that `@all`/`@here` reach nobody "neither in Mentions nor in
  notifications". The Mentions half had a working control on the same page — four ordinary
  `@handle` mentions present, zero `@all`, and a measured difference in the server response
  (`mention_ids` present for one, absent for the other). The notification half had a
  control that silently produced nothing: the plain mention raised no notification either.
  That was written down as an aside rather than treated as a broken control. One half of
  the finding was solid, the other was measuring a seed gap, and both were reported with
  the same confidence.
- Another session ran five clean negative cases against channel notifications — literal
  handle, real composer chip with `mention_user_ids` sent correctly, mute on, mute off,
  recipient's browser closed — and ruled out mute, membership, online-suppression and
  storage. Every measurement was right. No positive control existed anywhere in the run,
  and the whole thing was one step from a Critical against working code.

**Check:** before writing up "X does not happen", make X's ordinary sibling happen on the
same surface, in the same run. **The giveaway in both cases above was free and available:
the control produced nothing either, and nobody stopped.**

**And the control has to live inside the measurement, not beside it — because the
environment can change underneath a published finding.** A fixture repair invalidates every
finding whose evidence is an absence, unless the same measurement also shows something
present. One High finding survived today's seed fix only because the very response that
proved the absence — `GET /api/v1/notifications` with nothing about the subject — also
carried unrelated notifications that had arrived, in the same array, for the same account.
That made "the transport works, the event is missing" a fact rather than an assumption. Had
the array simply been empty, there would be no way after the repair to tell a product
defect from a fixture gap, and the honest move would be to re-run rather than defend it.
**Ask of any absence finding: does the measurement show anything arriving alongside the
thing that did not?** Anchors are not equal, and it is worth reaching for a stronger one
while the scenario is still warm:

    weakest    "nothing appeared"                       — dies to any environment change
    better     a known-good action of the SAME CLASS fired in the same window, on the
               same screen, found by the same full-document search
    stronger   the string that should have appeared is present in the served bundle —
               so the claim is "the code shipped and did not render", not "nothing exists"
    strongest  the event arrived ON THE WIRE and nothing rendered it

The strongest form is worth the setup cost. One session put a `WebSocket` interceptor on
the receiving page via an init script, before the app's own socket opened, and captured
`{"type":"return_to_main_requested", …}` arriving while the screen stayed blank — with a
control frame in the same log. That converts "the host's action does not reach the
participant" into "it reaches them and no handler exists", which is a different ticket for
a different developer, and which no fixture repair or transport change can undermine.

## Your negative result had no proven starting state

**A negative result needs a proven starting state.** `changed:false` about an element
that was never there reads identically to `changed:false` about a state that never
resolves — and the second is usually the finding you set out to prove, so the reflex
is to accept it.

- A five-minute watch returned `changed:false, stableForMs:300477, samples:300` —
  a textbook never-resolves measurement, against a row that was never on screen. The
  snippet had failed to open the dialog first, so the predicate returned its own
  not-found sentinel three hundred times. The state under test genuinely *was* stuck,
  confirmed separately, so the finding would have been true and its evidence worthless.

**The asymmetry is what makes it dangerous:** a false positive result is loud — the
timeline is visibly nonsense and you look twice. A false *negative* is silent and looks
exactly like what you went looking for.

**Check:** assert the starting state before measuring. `waitForChange` takes
`requireInitial` (string, regex or function) and refuses to watch when the baseline does
not match; it also puts the baseline in the note and sets `suspectBaseline` when the
starting value was empty, null or a not-found sentinel. The same discipline applies to
any absence measurement you write by hand: prove the thing was there before you prove it
did not change.

## Your paged read had a hole in it

- **The cursor has lower precision than the data it addresses**, so *your own* paged walk
  can miss half a collection — though the product itself works around it, which is a
  distinction worth keeping straight. `created_at` is serialised to whole seconds while the database stores
  microseconds, so a page boundary landing anywhere inside a same-*second* group discards
  the rest of that group. No exact tie is required. Verified in `org_db`:

      rows                                          152
      distinct created_at in the DB (microseconds)  150     <- only 2 exact ties
      distinct created_at as the API serialises it   63     <- whole seconds
      largest same-second groups            25, 24, 23, 19

      walking with the API's OWN next_before / next_before_id:
        limit=5     16 pages    reached  78 of 152
        limit=25     6 pages    reached 128 of 152
        limit=100    2 pages    reached 152 of 152
      no duplicates, no errors, terminates by itself every time

  **At `limit=5`, half the audit log is unreachable** — and the walk looks perfectly
  healthy while doing it. `before_id`, the documented remedy, changes nothing; an invalid
  one is accepted silently with a 200. The two endpoints are not even symmetric: the
  company one returns `{entries, next_before, next_before_id}`, the workspace one a bare
  array with no cursor at all.

  **The client does not use that cursor, and this is the part that took three rounds to
  establish.** Captured off the wire, the export issues `?limit=100` (100 rows, last at
  13:08:13) then `?before=13:08:14&limit=100` — **one second *above* the last row received,
  not equal to it.** It deliberately re-reads the whole of that second and deduplicates by
  id: 100 + 56 = 156 returned, 141 unique, 15 duplicates dropped. So the UI is **safe by
  construction**, not by lucky alignment, and cannot lose a row at any limit or boundary. An
  earlier "99 + 30 = 129, nothing lost" reading was the same mechanism working and was
  misread as a fortunate boundary.

  **So the trap is ours, not the product's.** A session walking the endpoint with the
  cursor *the API hands back* loses rows silently. Fetch once with the largest allowed
  `limit`, or use `{"keys":true}` / `{"find":"regex"}`.

**Check:** do not conclude "event X was not written" from a paged read. Fetch once with the
largest allowed `limit` and count. **Any collection paged on a serialised timestamp is a
candidate**, not just the audit log — only the audit endpoints have been checked.

## You put the system into the state you are now measuring

- `Start a call` failed three times running with "Something went wrong. Please try
  again." The network capture showed `POST /meeting` 200 → `PATCH /settings` 200 →
  `POST /end` 200 — creating a call and ending it a second later, every request a
  success, a generic error on screen. That reads exactly like "call creation is
  broken", and it was one step from a Critical. The cause was the session's own
  earlier API poking, which had left the account active in another meeting; a
  `409 REALTIME_ALREADY_IN_ANOTHER_MEETING` was in a response the whole time,
  invisible behind the toast. Four consecutive UI creations succeeded once the
  leftover meeting was ended and `GET /meetings/current` returned `{}`.

**Check:** anything that pokes the API directly — creating fixtures, ending calls,
granting access — can leave the account in a state the UI then reports honestly.
Before filing, restore the account to a state you did not manufacture and try again.
And read the network, not the toast: the real status code is often sitting in a
response while the screen shows something generic.

## Your measurement was accurate about the wrong actor

**A finding of the form "X can see or do something X should not" is a claim about a role —
and a role is mutable state that your own earlier tests change.** Freshness does not help:
the role is genuinely current, it is simply not the role you believe.

- Participants "who had never been invited" could see every private Side Room — name,
  creator, occupant count, and via the API the identity of who was inside — while the UI
  labelled them *"Only you can see this room / Hidden · invite-only"*. It passed every check
  available: freshly reloaded clients, a brand-new room created with `invitee_user_ids: []`,
  two different accounts, reproduced after reload. A **closed ticket** (ALK-2967) even
  documents that a non-invitee should receive `{"rooms":[]}`, so it framed cleanly as a
  regression of documented behaviour.

  Both accounts were **meeting admins** — `role: admin`,
  `can_manage_breakout_rooms: true` — granted co-host by the session itself an hour and a
  half and about fifteen measurements earlier, for something unrelated. Demoting one and
  waiting for `role: participant` gave the correct answer immediately: only public rooms
  returned, the private section absent entirely. Visibility is bound to
  `can_manage_breakout_rooms`, which is sensible, and the closed ticket still holds.

**Check:** before any access or visibility conclusion, read the acting account's permissions
**at that moment** — `my-permissions` or the equivalent — and quote it in the finding. Never
rely on what the fixture table says the account is, or on what you set it to earlier.

**Why this is not the stale-tab rule.** That rule says re-measure on a fresh client. This
session did, and the fresh client confirmed the wrong thing, because the failure was not
staleness — the measurement was accurate about an actor other than the intended one. A
session that has learned only the stale-tab rule walks straight into this.

**And note what made it worse:** a closed ticket appeared to corroborate it. Corroboration
from a ticket is not verification — it tells you what someone else concluded, not what your
own actor was.

**Practical, for authz testing on a long-running shared call: any test that grants a role
must record what it granted and to whom**, because a later test in the same session silently
inherits it.

## The tab had been in the call for an hour

**A browser tab that has been in a live call for an hour or more drifts, and any finding of
the shape "the UI shows the wrong state" measured on it is untrustworthy.** Four near-misses
in one run, every one looking like a real defect and dying the same way:

- *"The Recording badge stays up ~20s after the host stops"* — measured +22.1s and +20.1s
  across two runs. On a freshly loaded client it clears in **0.6s**, and participants receive
  "Recording stopped" and "Recording ready" text that had also been missed. This one was
  already in a report draft.
- *"Pin for everyone never reaches participants"* — the pinned tile at 1528×798 for the host
  only. Fresh clients: lands on every viewer in **1.5–2.5s**.
- *"After a ban inside a Side Room and an unban, the participant is locked out"* — three
  attempts bounced to `/directories` while the server still listed them as a participant and
  not banned. From clean state: normal lobby, no bounce.
- *"After stopping a recording, the stopper's own button flips back to Stop recording"* —
  observed once. A clean cycle is `Stop recording` → disabled → `Record` disabled ~20s →
  `Record` enabled. Correct throughout.

**The tell is not the symptom, it is the tab:** dozens of state transitions — bans, unbans,
room entries and exits, recording cycles, screen shares, injected hooks — over one to two
hours.

**Check:** before writing "shows the wrong state", re-measure on a freshly reloaded client.
Reproduces there → real. Does not → it was the tab.

**This is the same rule as the positive-control one, not a second rule.** In that run the
correlation was perfect: **every finding that survived had a positive control inside the same
observation window** — another realtime event arriving on time in the same panel — and **none
of the four withdrawn ones did.**

**And the control must be taken with the same instrument.** Same client and same window are
not enough: a control read with a different selector, or from a different surface, does not
license the absence, because it does not exercise the code path that produced the absence.

- Testing whether typing inside a Side Room leaks an indicator to the main call: nothing
  appeared. The control — someone in the main call typing, watched by another main-call
  participant — **also showed nothing.** The instrument was wrong, not the product. The
  watcher inspected only **leaf** nodes (`if (e.childElementCount) continue`), and
  "QA Alice is typing…" is assembled from nested elements, so no leaf contains "typing". A
  whole-panel `innerText` watcher caught it at 2011 ms, clearing by 7236 ms — and the room
  test then correctly showed no leak. Typing *is* properly separated; it would otherwise
  have been recorded as verified on evidence that proved nothing.

**Three instruments for "what appeared on screen", each with its own blind spot, and each
produced a false negative in one run:**

    toast-container watcher (role=status|alert, toast/banner classes)
        misses prompts drawn on the call stage
    full-DOM LEAF text watcher
        misses text assembled from nested elements
    whole-panel innerText watcher
        catches both, but only inside one panel

**And watch the boundary when you filter by size.** One session used `rect.width < 1` as the
reject condition; `sr-only` regions are **1px** boxes, and 1 is not < 1, so they passed — an
invisible live region announcing "Chat filters are ready." was counted as a visible notice.
A floor near 24×12 px filters them. `notices()` uses `w > 2 && h > 2`, which does reject 1px
boxes, but the off-by-one is the same 1px-box class arriving through a different rule.

`window.__qa.notices()` in `lib.mjs` is the first kind — selector-scoped, reading full
subtree text — so it sees nested assembly but not a stage prompt carrying none of its
selectors. Pick the instrument for the surface, and say which one you used.

**The heuristic that falls out of it: if your control comes back empty, suspect the
instrument before the product.** A control is supposed to be the thing that works.

## It was deliberate, and documented at the handler

- "Mark all as read destroys the user's notification history" — bell 4→0, `total:0`, and
  zero rows left in the `notifications` table. The handler's own comment says the deletion
  is irreversible and history is deliberately not kept.
- "Saved Messages leaks channel chrome" — a known `ChatChromeTransition` artifact, already
  withdrawn twice by earlier sessions. `innerText` returns nodes nobody can see.

**Check:** when a destructive-looking behaviour is that consistent and that complete, read
the handler before writing it up. And run the withdrawn-findings sweep —
`grep -il 'ложн\|false positive\|отозв' logs/*.md reports/README.md` — it has caught a
third re-discovery.

## The state you are reading is not stored where you can read it

- **Channel mute is stored only in the browser.** `localStorage.aloqa.channel.mute` holds
  it; the server accepts `POST`/`DELETE …/notifications/channels/<ch>/mute` but answers
  **405 on GET**, and the channel object in `GET /workspaces/<ws>/channels` carries no mute
  field. Measured on two browsers signed into the *same account*: device 2 displayed
  `Mute notifications` — i.e. not muted — while a plain message produced no notification for
  28s, because the server-side mute was still live. Control taken both ways.

**And the server honours it.** Measured in a single browser: with mute ON a plain channel
message produced no notification, while a mention still broke through — the documented
behaviour, working. So this is not an inert client-side flag. **The behaviour is real, the
displayed state is a default, and nothing on screen explains the gap** — which is the worst
of the three combinations for a user. The contrast is sharp because the four *per-user*
notification settings (`in_app_enabled`, `mute_all_channels`, `mute_unknown_dm_users`,
`do_not_disturb_enabled`) are server-held and read back correctly via
`GET /users/me/notification-settings`. Two settings surfaces that look like one area are
stored in different places.

**Check:** when a setting looks wrong on one client, ask where it is actually stored before
calling it a sync defect. A client that cannot read a setting back will confidently display
the default, and two devices on one account will disagree with each other while the server
agrees with neither.

## Two controls of the same shape failed at once

**Two controls of the same kind failing on one screen is usually the harness, not the
product.** One is a finding; two should trigger a re-measure before either is written down.

- A sweep reported a second stuck control next to `Message layout`. Re-tested by element
  index, all six switches on that screen flipped and stored correctly — the first picker had
  matched a different element. The genuine single failure survived; the phantom second one
  was the selector.

**Check:** when a sweep returns more than one failure of the same shape, suspect the sweep.
Re-measure each hit by a different handle — index, testid, the stored value — before
believing any of them. A real defect rarely arrives in matched pairs on one screen; a
mis-targeted selector almost always does.

## Your baseline came from a control that misreports itself

**A control that misreports its own state will also corrupt any before/after built on it.**
The baseline is usually established by reading the control — which is exactly the thing
under suspicion.

- Testing whether `Message layout` has any visual effect, a session set a baseline by
  trusting the radio, which displayed `Standard`. The stored value was already `compact`.
  So the comparison was `compact` against `compact`, and "no visual effect" was read off a
  test that could not have shown one. The control misreporting itself was the *other* half
  of the same defect.

**Check:** when the control's own correctness is in question, establish the baseline from
the stored value — localStorage, the API, the DOM effect — not from what the control
displays. And note the corollary: two defects in one control (does not apply, does not
restore) will hide each other if you use either one to test the other.

## Nobody re-measures a citation

**A citation is a claim, and it is the one claim in a report nobody re-measures.** Findings
get re-verified — often several times. The file-and-line beside them does not, because it
looks like metadata rather than a measurement. It survives into the ticket, and it is what
the developer acts on first.

- An open ticket's «Подтверждённая причина» cited
  `packages/features/settings/ui-web/SessionCard.tsx`. That path does not exist at the
  deployed sha; the file is at `apps/web/src/features/settings/SessionCard.tsx`. A developer
  greps, finds nothing, and doubts the finding rather than the citation.
- **An hour after raising that**, the session that raised it ran the same check against its
  own published report and found one of nine citations failing identically — directories
  paths written as bare fragments without the `apps/web/src/` prefix every other finding
  carried. Rewritten with full paths, all nine verified, republished.

**Check:** one line per path before publishing —

    git cat-file -e "<deployed-sha>:<path>" && echo EXISTS || echo ABSENT

Write full paths rather than fragments relative to a base stated once elsewhere: it reads
better and it leaves something that cannot be pasted into `git show`.

**But that check is only half a check, and it is the half a script can do.**

    the existence check answers:  does this file exist at this sha
    it does not answer:           does this line demonstrate the behaviour

- The session that *wrote* the existence rule, hours after writing it, published a citation
  that passed it. The finding was "unmapped notification keys fall back to English"; the
  citation pointed at the key **list**, 45 lines above the code that does the falling back.
  Path real, line range real, EXISTS green — and a developer opening exactly those lines
  sees sixteen string literals and no defect. They had made the same judgement correctly for
  eight of nine citations, and missed the ninth because they wrote the filename from memory
  of its *list* rather than of its *logic*.

So after the path check, open each cited range and ask the only question that matters:
**would a developer reading exactly this see the thing I claimed?** A column of green EXISTS
reads like verification and is not — it proves the reader will arrive somewhere, not that
what they find there is the finding.

## Your measurement block can contradict itself, and you will not notice

**You check evidence against reality and forget to check it against the other evidence
standing next to it.** They are different acts, and the second one is free.

- A finding reported "backend 25, frontend 16" and then listed **eight** unmapped keys.
  25 − 16 = 9. The arithmetic in its own evidence block did not close, and it was published
  twice before anyone noticed — including by the author, who had verified the list of eight
  against the product and never held it up against the two numbers directly above it. The
  ninth was a test sentinel the backend grep had swept in.

**Check:** before publishing, read your own block as an adversary who has not seen the
product — do the counts reconcile, does the response quoted actually contain the field
named in the prose, do the steps produce everything the block shows? Every one of those is
answerable without touching the app.

**Every number in the block needs a zero point inside the same block.** A stamp measured
from the start of observation reads as a latency, and silently contradicts prose that
describes it as a delay. One report printed "delay ~41.7 s" beside a stamp of 46687 ms —
correct, because the action happened ~5 s into the observation, which the block never said.
Another wrote an estimate as if measured (`t ≈ 19 c`) next to a hit at 40529 ms. Either
state the origin, or stop claiming the precision.

**Counts drift when you edit, and editing is exactly when nobody re-checks them.** A sector
ran the reconciliation pass over a published report and everything closed — but every count
in it had been edited at least once that day. The pass is cheapest on work you have already
revised, not on a first draft.

**And the failure mode may not be arithmetic at all — it may be provenance.** A sector ran
the pass and every number reconciled; what was wrong was a *string*. Their block quoted a
message marker belonging to a different test run, introduced while scrubbing the report for
account names. The tell was available without leaving the block: that message had been sent
via the API, so it was stored unescaped and could not have produced the escaping the finding
was about. Internally impossible, and it survived two publishes.

**Scrubbing is editing the evidence.** It is the one moment a report acquires text nobody
measured, and the substituted text looks exactly like the real thing because it came from a
real run — just not this one. Re-read every block you touched against the run it came from.

**Two truncated request lines can stand in for two different endpoints.** The same sector
showed `POST …/messages/<id>` twice, once meaning the reaction call and once the pin call,
with no bodies. Both true, both useless: the reader cannot tell them apart. If two lines in
a block look identical, they need the part that differs — `…/reactions {"emoji":"🚀"}` and
`…/pin {"pin":true}`.

## The adversarial pass fires hardest on comparative and exhaustiveness claims

**"X but not Y" and "all N of them" both need evidence for the half a reader would not think
to doubt — and that is exactly the half people leave out.** A plain "this returned 403" is
self-supporting. "This returned 403 while the other path returns 200" is two measurements and
usually ships as one.

A sector ran the pass over nine findings and it caught three, none of them wrong findings —
all three were evidence that did not show what the prose claimed:

- *Comparative, half missing.* "Expiry is not handled, decline is" — the block had 299 samples
  over 301 s for the timeout side and **nothing at all** for the contrast. Re-measured rather
  than reconstructed from the log.
- *Exhaustiveness, trimmed evidence.* "All 26 response fields are listed — there is no queue
  field." The block showed the response trimmed to four fields. A trimmed response can never
  support a claim about exhaustiveness, whatever it contains.
- *A number from a different run.* "Nothing changed in 75 seconds of observation" — real, from
  run 1; the block showed run 2, whose interval was 1 min 37 s. A reader finds neither number.

So audit comparatives and "all N" claims first. They are the ones whose evidence is
structurally likely to be half-present.

## Verifying a citation pays off through its side effect

**The check makes you re-read the file around the citation, and the neighbourhood is where
the error usually is.** Two sectors got the same result from it on the same day, neither in
the citation itself.

- One audited five mechanism citations; all five held. What the audit caught was a
  **negative claim standing next to one**: "this setting has no consumers, it does nothing".
  Reading the generated contract beside the cited line disproved it — the backend honours the
  setting exactly, and omits the field entirely when it is off. The finding survived; the
  instruction changed completely, from "the setting does nothing" (which sends a developer to
  the backend) to "exactly one side needs changing, and the privacy half already works".
- The other found their citation pointed at a key list rather than the code that mishandles
  it — see the citation entry above.

So audit citations even when you are confident they are right. The stated purpose is to
protect the reader; the reliable payoff is that you re-read your own evidence.

## A technique that finds an owner instead of a finding has still worked

**Establishing that a whole category is already owned is a better outcome than a fifteenth
Low.** A sector ran the enum diff against audit-log actions, found all of them rendering raw,
and then found the open Task that *defines* the display contract — including that unknown
values are meant to render raw by design, which is what tells you the known ones are supposed
to be mapped. Filing "the actions render raw" against the ticket specifying how they render
would have been filing it twice.

The scoping is the deliverable. One grep established the category, one ticket read established
it had an owner, and the sector moved on.

## A field in the response is not evidence the state is reachable

**A `read`, `status` or `state` field existing in a payload tells you the schema has a
column, not that the value is ever produced.** The two come apart when something deletes
rather than transitions.

- Notifications carry a `read` boolean, and the list endpoint filters on `read = false`, and
  the response reports `total` and `unread_count` separately. All three describe a
  read-but-retained state that **cannot exist**, because marking as read deletes the row.
  A session spent a while trying query parameters — `read=true`, `status=read`, `filter=all`,
  `include_read=true`, `unread_only=false` — to surface read notifications, on the strength
  of the field being there. Six variants, all returning 0. **The field is real; the state is
  not.** `total` always equals `unread_count`.

**Check:** before hunting for the parameter that surfaces a state, establish that the state
is producible at all — write one and read it back. Schema, filters and counters are written
by people who expected a design that may have changed underneath them.

## An absent attribute is not absent behaviour

- **`element.disabled === false` is not "enabled".** `Custom RRULE` in the meeting form:
  `disabled` property false, `data-state` never changes, clicking changes nothing (13 inputs
  before, 13 after). It reads as an inert control someone forgot — the more convincingly
  because two neighbouring unbuilt features *do* label themselves "not available yet". The
  full dump plus a hover:

      attributes : type="button" aria-disabled="true" data-state="closed"
      computed   : cursor: not-allowed  opacity: 1  pointer-events: auto
      on hover   : tooltip -> "Not available yet"

  Correctly disabled, correctly labelled, with the explanation in a tooltip. **Enumerating
  attributes without hovering produced a confident wrong reading.**

- **No `maxlength` or `required` is not "no validation".** Meeting title: no maxlength,
  `required` false, `checkValidity()` true, submit never disabled, accepts 500 characters
  and whitespace-only. On submit **no POST is made**, the dialog stays open, and it says
  "Title is required" / "Title must be at most 128 characters". The validation is in JS with
  specific messages.

**Check:** read `aria-disabled` as well as `disabled`, hover before concluding a control is
unexplained, and drive the action before concluding an input is unvalidated. Inferring
behaviour from absent HTML attributes is the absence-with-an-unexamined-cause error wearing
markup.

## The confirmation was on the control, not in a toast

- *"Copy link gives no feedback"* — polled `[role=alert]`, `[role=status]` and
  `[data-sonner-toast]` for 3.5 s and saw nothing. Re-run watching the **button's own label**:

      t=140 ms   "Copy link"
      t=1083 ms  "Link copied"
      t=3125 ms  "Copy link"

  A toast-only poll cannot see an inline label change, and inline is the *common* pattern for
  copy actions.

**Check:** this is a fourth instrument to add to the three above — **the acting control
itself**. When the action is one whose feedback is conventionally inline (copy, save,
follow), watch the control's own text before concluding there was no confirmation.

## A name is not a fact — yours or the product's

**Four instances in one day, in two shapes.** The common thread is that something *named* for a state was read as evidence of that state.

*Shape one — your variable is named for a conclusion its expression does not support:*


- `out.barGone = innerText.includes('unsaved change')` — **true when the bar is present.**
  Every later reading of `barGone: true` was taken as "the bar disappeared", and the
  conclusion drawn was that a failed save was being presented as success. The measurement was
  correct throughout; every use of it was inverted. Cost a full re-run.

- `offersSeries = dialogText.includes('series')` — **true because the dialog says "The rest of
  the series stays in the calendar"**, which is the exact opposite of offering a series delete.
  The buttons were Cancel and Delete meeting; there was no series option at all.

**Three separate sectors hit this on one day, which makes it a pattern rather than an anecdote,
and in every case the regex was right and the name was wrong.**

*Shape two — the product's control is named for an action it will not perform:*

- A recipient's file menu lists `Delete file`, and the first write-up said the recipient is
  offered deletion of someone else's file. Re-enumerating the same controls **with their
  `disabled` attribute**: `Delete file / disabled=TRUE` in both the context menu and the details
  panel, no request on click, and a raw `DELETE` as the recipient returns `403 FILE_ACCESS_DENIED`
  with the file intact. Correctly disabled, no authz hole, nothing to report. Presence and
  availability are different facts.

**Check:** name a variable for **what its expression matches**, not for the conclusion you hope
to draw from it. Enumerate controls **with `disabled`/`aria-disabled`**, and confirm a click fires
a request before calling a control offered. `mentionsSeries` would have been honest; `offersSeries` was an argument wearing
a variable name. A conclusion-named boolean silently inverts every downstream reading — including
in the log a later session reads, where nobody can see the expression that produced it. The tell
is that the name contains a verb about the product's behaviour (`offers`, `gone`, `works`,
`allows`) while the expression only does string matching.

## The control looked inert because you read the wrong property

- `Display settings → Font scale` does not change `documentElement.fontSize` — that stays
  16px at every setting. It drives `--text-body` (XS 13.66px → M 17.08px), and real text
  follows. Density likewise moves `--density-row` (32px → 28px), not anything on the root.
  A session had font scale lined up as a dead control until it measured an actual text node.

**Check:** before writing up a control as having no effect, find what it *does* drive.
CSS custom properties, a class on a wrapper, a stored preference — an inert-looking control
is often driving a variable you did not read.

## A sweep that yields its own controls beats targeted probes

**When the negatives only mean something against positives, sweeping the whole set is
cheaper than sampling it — because the sweep generates its own control group.** Targeted
probes give you the same number of measurements and no baseline.

- Testing whether each permission does what its label says, a session sampled six of ten
  company actions, found two Highs, and assumed the rest were fine. Sweeping the remaining
  four found a third High. **And the sweep produced the controls that make all three
  meaningful:** `workspace.create` adds the Workspaces nav item, `role.get` opens the page,
  `member.view` renders the roster read-only, `member.kick` adds exactly eight Remove
  buttons. Five of seven behave as labelled — which is what turns "these two are broken"
  from a suspicion about the harness into a finding.

**Check:** where you are testing a set — permissions, roles, settings, entry points — sweep
it rather than sampling, and report the working ones alongside the broken ones. A reader who
sees five positives believes the two negatives.

**The general form, which paid off four separate times in one run: for any finding of the
shape "the app fails to do X", go and find somewhere the same app does X correctly.** It
costs one measurement and removes the reviewer's best objection. Each of these was found
*after* the finding was already written, and each strengthened it:

    audit.view granted at WORKSPACE layer opens the section fully; the same action at
      company layer does not  -> rules out "section broken", "wildcard ignored" and
      "your role was wrong" simultaneously
    Status message DOES reach the profile card, via its own endpoint
      -> the card can render a profile field; the other seven never arrive
    a duplicate role name produces "A role with this name already exists here."
      -> the client DOES map specific server error keys to specific copy, and simply
         has none for ORG_KICK_COMPANY_OWNER, falling through to "Try again"
    five permissions behaving exactly as labelled
      -> makes the two that do not into findings rather than a suspicion about the harness

## Your control count was a function of the page's data

**A control count is a function of the page's data, not only of its permissions.** A count
reproduced several times is not thereby independent of the state you kept reproducing.

- "All eight controls on the page are disabled" was measured three separate times — always
  on an **empty invite list**, without noticing that emptiness was a precondition of the
  count. With invites present the same page carries two **enabled** buttons, and one of them
  (`Revoke invite`) fires no request, leaves the invite `pending`, and shows *"You need
  permission to view roles before assigning them."* — a message about assigning roles, for a
  revoke. The finding was not wrong; its scope was narrower than stated.

**Check:** before quoting a count, name the data state it was taken in — empty list, one
item, many — and take it again in a different one. Repetition is not independence when the
setup is identical each time.

## You measured the defect and inferred the victim

**Before rating an API defect by user impact, capture which screen issues the call.** A
client may synthesise its own cursor, retry, dedupe, or not call the endpoint at all — none
of which is visible from the endpoint's behaviour.

- A session measured a genuinely lossy cursor on the company audit-log endpoint —
  78/152 rows at `limit=5`, 128/152 at `limit=25`, `overlapIds: 0` — and rated it as an
  administrator getting a short compliance export. Then checked which screen issues that
  call: **none does.** Across six admin routes the only audit call any screen makes is to
  the *workspace* endpoint, with the overlapping, deduplicating cursor. The finding was
  withdrawn — per `CLAUDE.md`, an endpoint no screen reaches is the developers' job, not
  this one. The absence of any company-endpoint call is itself the subject of a separate
  open ticket.

**Check:** the endpoint being broken and the user being harmed are two measurements, not
one. Take the second before assigning severity — and keep the first in the log, because a
lossy endpoint nobody calls today becomes user-reachable the moment someone wires a screen
to it.

## The rule you are applying was written for different elements

Most entries here are rules. This is the check on the rules themselves, and three separate
cases produced it today: **a measurement rule is usually true of the elements its author had
in mind and false of the ones they did not.**

- `scrollWidth > clientWidth` is a sound clipping test for content, and fires on **every**
  screen-reader-only label, because those are 1px boxes holding real text and satisfy it by
  construction. Applied as written it reported clipping on all four screens tested.
- A cursor paging on a serialised timestamp is fine on a quiet fixture with almost no
  same-second activity, and loses half the collection on a busy one.
- A 400-character display slice is invisible while responses are short.
- The offscreen test `left >= innerWidth` is valid **because** it carries a companion
  condition (`documentElement.scrollWidth === innerWidth` — the page is not supposed to be
  wider than the viewport). Extended to `top >= innerHeight` it has no such companion, since
  a page *is* supposed to be taller than the viewport, and it flags every row below the
  fold. **A rule can be invalidated by dropping the condition that made it sound**, not only
  by meeting an element it was not written for.

Each was true where it was written and false a step outside. **Check:** when a rule fires
everywhere or nowhere, suspect the rule before the product — and when you write one down for
others, say which elements you had in mind, so the next person can see the edge you did not.

## The app already told you

- "Enter stops sending after you click any formatting button" — reproduced across 8 of 9
  toolbar buttons, survived a fresh load, focus and selection provably intact. The hint
  line under the composer visibly flips to "Cmd/Ctrl+Enter to send · Enter for new line"
  when markdown mode turns on.

**Check:** before calling a keyboard gesture or a control broken, read the text the app
prints next to it.
