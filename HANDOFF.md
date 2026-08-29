# Handoff

What one session leaves for another. Three parts:

- **Part 1 · Fixture state** — lane state a later session inherits. Read before testing on
  those lanes.
- **Part 2 · Standing guidance and verified baselines** — still-true knowledge: what is already
  published (do not re-file), what is checked and clean (do not go looking), how to handle the
  fixtures, and the baselines that make a null result mean something. Read at session start, and
  grep it again before writing up anything that smells familiar.
- **Part 3 · Archive** — settled investigations and dated ticket-state snapshots, kept verbatim
  for their measurements. Nothing there needs action.

Append into the matching part; never rewrite what is there. Start an entry with
`date · from-sector · to-sector` where a handoff has a specific owner; an entry is as long as its
content needs. (The original "one line per item" contract did not survive contact with real
handoffs and was retired when the file was restructured on 2026-08-29, with Mahmud's approval;
the pre-restructure state is the parent of the commit that landed this.)

# Part 1 · Fixture state — read before testing on these lanes

**All lanes · 2026-08-27 · state the reverification pass left behind.** The rc-6 pass ran
88 repro snippets across every lane, and handover snippets deliberately leave the app in the
state being judged. Nothing here breaks a fixture — `seed/seed.sh --lanes <letter>` repairs
structure — but a later session should expect it rather than measure it as a defect:

- Lane D · one **pending direct invite** to `qa.d.outsider` (the state one finding needs), and
  the **company logo** replaced with a test image. There is no way to remove it in the product
  — `DELETE /companies/<co>/avatar` answers 405 — and `seed.sh` does not touch `avatar_url`,
  so only a direct DB write clears it.
- Lane E · alice's status is `Vacation` and her Department/Job title are set; several
  `e-arch-*` archived channels, `e-preview-*.png`, `e-shared-*.txt` and a number of `E …`
  meetings exist. All disposable.
- Lane C · `#qa-private` left unmuted.
- Any lane · an account may be left in a **non-English interface** and a meeting may be left
  **active**. Both are cleared by `snip/_reset.mjs`, which the bench runs before every
  reproduce; run it yourself if you drive snippets by hand.


**Lane E · a second workspace exists.** `QA E Second` (`W4OWJSPNXQJYZ5R`), owned by lane
E's alice, containing `second-ws-channel`. Created deliberately on 2026-08-26 to unblock
the multi-workspace path — every fixture account is otherwise in exactly one workspace,
which made the workspace switcher, `Current` marking, per-workspace channel isolation and
cross-workspace notification click-through untestable. There is precedent: `QA Second`
(`W4OV431T9GS61M5`) exists on lane A for the same reason. Invisible from inside
`QA Workspace E`. **Leave it** unless you want that path untestable again.
`seed.sh --verify --lanes E` passes with it present.

**Lane E · the calendar is heavily loaded.** 112 scheduled events, against 27 / 3 / 1 / 0
on lanes A / B / C / D. 90 of them are one daily recurring series
(`RR4OWN1ECNWD8M8Q`, 2026-08-27 → 2026-11-24). Creating one "Every day" meeting
materialises the whole horizon at once as individual events with their own ids — a rule
is not stored and evaluated lazily. **Week and Month views will look crowded.** Deleting
the series is the fix if it is in your way; it is also the only recurring data on the
lane, so it is what makes per-occurrence edit and delete testable.

**Lane D · the audit log is now long.** 92 extra rows from a deliberate volume probe on
2026-08-26 — 45 `role.assigned` + 45 `role.revoked` plus the create and delete of a
throwaway role, all named "QA D2 volume probe". The role is deleted; audit rows are
append-only so they cannot be. If you measure audit-log volume on lane D, that is why it is
long. It also makes lane D the one lane where the timestamp-precision paging trap is
reproducible, since it now has same-second groups of 19-25 rows.

**Lane C · leftover probe channel.** Public channel `qa-c2-guest-probe`
(`C4OWMLIQOY3NDZ2`), created 2026-08-26 by the lane C guest account during a
guest-permission probe. Disposable, safe to delete.

# Part 2 · Standing guidance and verified baselines

## Surfaces that changed state

**Channel notifications became testable on 2026-08-26.** They never worked on fixtures:
`notification_db` keeps its own `channel_members` replica and the seed populated only
`org_db` and `messaging_db`, so a channel message notified nobody on any lane. Fixed in
`seed_notification`; parity verified on every fixture channel. **Rows exist, but nobody has
yet watched a notification actually arrive** — establish a positive control (a plain
`@handle` mention, or an ordinary message) before measuring anything that depends on it.
Sector E has taken the surface and **closed it out end to end** — a plain message to
`#qa-general` produced `category "messaging" / event_type "channel_message"` for a recipient
parked elsewhere, the panel row rendered, click-through navigated to
`/c/<channelId>?m=<messageId>` with the target message visible, and the bell decremented
4 → 3. Verified independently by three sectors.

**Two things that fell out of it, both worth inheriting:**

- **The bell updates live; the sidebar unread badge does not.** The bell read "4 unread"
  without navigating or reloading, while the same channel's sidebar row never changed across
  ~333 samples at 300ms with `GET /workspaces/{ws}/unread` returning `unread=1` — only a
  reload surfaced it. Two counters on one screen, fed by the same event, behaving
  oppositely. For whoever fixes the badge: the live path exists and works a few pixels away.
- **The notification actor-name finding is narrower than reported.** `category "messaging"`
  carries `actor_name "QA Alice"` (display name, correct) while `category "calendar"` carries
  `actor_name "qa_e_alice"` (username). So it is the calendar producer, not a shared
  formatter. Nobody could have known before the seed fix, because no messaging notification
  existed to compare against.

**The surface is now fully exercised and clean.** Every branch, all of it newly possible
after the seed fix: notification row, bell updating live, panel row content, **toast**,
click-through to `/c/<channelId>?m=<messageId>` with the target visible and the badge
decrementing, deep-link highlight, mute, unmute. **No defects found on any of it** — worth
saying plainly, since the surface looked risky only because the fixture was broken.

Mute was verified in both directions on purpose: muted produced nothing across 45s of
polling, and the identical post after `DELETE …/mute` produced a `messaging/channel_message`
immediately. The zero only means "mute works" because the same action after unmuting
produced a one.

**Proven working:** a personal `@mention` into a seeded
channel now creates a `mention` notification for a channel member (lane D, rc.5, verified
by sector D against the exact case that had produced their false finding). **Still
unestablished:** plain non-mention channel messages, `@all`/`@here`, the ALK-2559 mute
override, and the realtime toast in a live tab. Details in `CHANGES-APPLIED.md`.

### `/join/<invalid token>` offers no route out — ALREADY PUBLISHED by sector B

**Do not re-file.** Sector B has this published as a Medium; sector D independently reproduced it
while enumerating routes, which is itself a signal about how reachable the surface is. Sector D's
sibling-route control was the half sector B lacked and is now in the published finding's measurement
block, with sector B's own re-measured numbers.

**RESOLVED — and it changes which routes belong in the comparison.**

`/invite?token=<dead>`: 5 vs 3 is a definition difference on the same page — 3 buttons + 2 inputs;
one enumeration counted every interactive node, the other only nodes with visible text.

`/workspace/invite/accept`: 1 vs 3 is a **different page**, because the URL differs:

    /workspace/invite/accept                   stays put, dead-link page, 1 control
    /workspace/invite/accept?token=<dead>      REDIRECTS to /login?next=… — sign-in form
    /workspace/invite/accept?token=<dead>&x=1  no redirect, dead-link page, 1 control

The source specifies it: the redirect fires only when there is **exactly one** search param and it
looks like an invite token (`Object.keys(searchParams).length === 1 && isWorkspaceInviteToken(...)`).
The `&x=1` row isolates the param count as the trigger.

**So a token-bearing URL on that route measures `/login`, not dead-token handling** — and
`/invite?token=<dead>` redirects to `/login` too. Both drop out of the sibling set.

**The clean comparison, pages that actually render a dead link:**

    /magic-link/verify?token=<dead>        3   incl. "Request a new link", "Back to sign in"
    /workspace/invite/accept  (no token)   1   "Back to sign in"
    /join/<dead>                           0

Two comparators instead of three, both genuinely the same class of screen — **the contrast is
tighter, not weaker**: among pages that render a dead link, only `/join` offers no route out.


Measured in a fresh `browser.newContext()`, on both a tokenless and a malformed-token URL:

    whole document text: 52 chars — "Join as a guest  This invite link is no longer valid."
    interactive elements, wide enumeration (button, a[href], input, select, textarea,
      summary, details, [role=*], [onclick], [tabindex]):        0
    scroll containers: 0 — nothing below the fold

    same failure on sibling routes:
      /magic-link/verify?token=<bad>   3 controls — Language, "Request a new link", "Back to sign in"
      /invite?token=<bad>              5 controls — the full sign-in form
      /workspace/invite/accept         1 control  — "Back to sign in"

**Dedup done: `ALK-1727 [Task/TESTING]` covers this surface and its criteria say
«мёртвая ссылка fail-fast без формы» — no form on a dead link is specified and implemented
correctly.** So "zero interactive elements" as a framing is the ticket working.

**The finding survives in a narrower form**, by the acceptance-criteria rule: ALK-1727 owns the
states its criteria enumerate — *no form* — and says nothing about a sign-in link, a "request a new
link" action, or the language switcher every other pre-auth page carries. **The ticket required
suppressing the join form; the implementation suppressed every route out.** A recipient of a stale
guest link has to edit the URL by hand. The three sibling routes are the control that this is not
house style.

**To re-measure, use a fresh context with no session** — the sibling comparisons above were taken that way, and a signed-in context changes `/invite?token=<bad>` materially. Snippet `scripts/callrig/snip/d2-joindead.mjs` (needs no rig — three page loads). Write-up in
`logs/AIRION-QA-2026-08-26-D-org-2.md` under "Для сектора B: /join/<токен>".

## For whoever consolidates the reports

**Call rating — an extension to the published lane-A finding, deliberately not duplicated.**
That finding says the rating is sent on the first click and cannot afterwards be seen or
changed. Sector B measured a piece it does not have: **the server computes an aggregate and
hands it to the owner**, and nothing renders it.

    API to the host (owner):  "rating":{"average":3,"count":2,"my_rating":4,"owner_only":false}
    API to the participant:   "rating":{"my_rating":2,"owner_only":true}

    ended-call detail page, whole document searched:
      rating-related testids: []
      /rat(e|ing)/ matches:   ["QA rating flow"]   <- the call's own name, nothing else

So it is not "you cannot see your own rating afterwards" — **nobody can see the result at
all, including the one person the backend deliberately exposes it to.** Users are asked to
rate every call and the output has no destination.

Sector B kept this out of their own report on purpose, to avoid the merge friction that the
duplicated unread-counter finding caused between C and E. **Decision needed at
consolidation:** fold the aggregate detail into the lane-A finding, or file fresh. Dedup
already done — no ALK ticket covers it; not in ALK-3405…3413 from that run, and the only
rating hits among open bugs are ALK-3051 (different) and ALK-2051 (rating not being *sent*,
closed).

## Fixture handling every session needs

### Restoring an account's language: match the language *names*, not the string "English"

The language control's own label is the **current language written in the current
language** — `English` in English, `Русский` in Russian, `Oʻzbekcha` in Uzbek — and the
menu options are localised too (`Английский`, `Inglizcha`). So a restore step that clicks
the control matching text `English` works from English and silently does nothing from any
other locale. It fails without an error, and the account stays in the wrong language for
whoever tests it next.

Cost sector D two failed restores before they noticed.

Match the button whose text is **any of the four language names in any of the four
languages**, then assert `document.documentElement.lang` afterwards rather than trusting
the click. Setting the language is one of the few state changes here that outlives the
session and hits the next one, so it is worth the assert.


**Reading a notification destroys it — "mark as read" is a DELETE, not an UPDATE.**
`notification_repository/mark_as_read.go` is `DELETE FROM notifications … RETURNING id`
plus a delete of the matching `notification_deliveries`, in one transaction, with the intent
stated above it: *«MarkAsRead удаляет прочитанные уведомления безвозвратно (историю не
храним…)»*. Measured from outside first:

    POST /notifications/read {"notification_ids":[id]} -> 200 {"marked_count":1}
    GET  /notifications?limit=50 -> row gone, total drops, still gone after a full reload
    "Mark all as read" -> {"marked_count":15}, panel: "All caught up | No notifications yet."
    six query variants (read=true, status=read, filter=all, include_read=true,
      unread_only=false, bare) all return 0

**So: clicking a notification, or clicking "Mark all as read", destroys it permanently. You
cannot restore notification state by re-reading — an experiment that needs a notification
must produce a fresh one.** One session lost 15 it was using as fixtures to a single
"Mark all as read".

Deliberate, documented at the handler, and **not reported**. The drafted counter-example —
the same mention produces a Mentions row that survives being read (`All (1) Unread (0)`,
persists across reload) while the notification vanishes, so the read-but-retained pattern
exists one screen away — is a design observation, not a defect.

**By-product, API shape only:** the `read` field can never be true. `list_by_user.go` filters
`read = false` only when `UnreadOnly` is set (verified), and the count is
`COUNT(*), COUNT(*) FILTER (WHERE read = false)` — so schema, filter and counter all describe
a state the delete makes unreachable, and `total` always equals `unread_count`. Out of scope
to report; it will confuse the next person reading that response.

## Baselines worth having

**The browser console is clean during calls.** A `console` + `pageerror` listener on a
participant's window across 60 seconds of a live three-person call recorded **zero errors and
zero warnings**. So console noise during a call is a deviation from the normal state, not
background — worth knowing before anyone treats it as ambient.

**ALK-3119 context** (history tab filters only cover loaded pages): the empty-state copy
admits it out loud. An account with five group calls and no 1-to-1s sees, on the 1-to-1 tab,
`"No 1-to-1 calls in loaded history."` The behaviour is deliberate enough to have its own
string — but "loaded history" means nothing to a user, and the ticket asks for auto-loading
rather than a caveat.

## Withdrawn after measurement — the reasoning, so nobody re-derives it

**The company audit-log cursor is lossy, and it is out of scope.** Verified: `next_before`
equals the last row's `created_at` at second precision, page 2 starts strictly before it,
`overlapIds: 0`, and walking to exhaustion reaches 78/152 at `limit=5`, 128/152 at
`limit=25`, 152/152 at `limit=100`. Real, measured, reproducible on lane D.

**But no screen calls it.** Across six admin routes the only audit call any screen issues is
to the *workspace* endpoint, whose client synthesises an overlapping cursor — sending
`before` one second **above** the last row received — and deduplicates by id. That path is
safe by construction at any limit. Per `CLAUDE.md`, an endpoint no screen reaches is the
developers' job, so the finding was withdrawn rather than filed.

**Keep it for ALK-3535.** That ticket's subject is precisely that company-scope events never
reach the screen. A fix pointing the page at the company endpoint inherits its lossy cursor
and makes this user-reachable on day one — so this is a ready-made regression case, and lane
D still has the same-second groups (19-25 rows) needed to reproduce it.

## Resolved: `workspace.delete` is not a UI oversight

The permission matrix flagged `workspace.delete` as declared in the backend catalogue but
never offered in the Create-role UI, and left open whether that was a missing checkbox.
**It is not.** `POST …/roles` carrying it returns
`400 ORG_PERMISSION_UNKNOWN_RESOURCE` — *«неизвестное действие для слоя»*. The layer does
not accept the action at all, so the absent checkbox is correct and nobody should go looking
for it. This also supports the separately-reported workspace-ownership dead end: there is no
grantable permission behind the missing delete.

## Checked and clean — do not go looking here

### Saved Messages has no Unsave — distinct from ALK-3507, which is about Unpin

Removing an item from Saved Messages has no control anywhere — not on the row, not under More
actions. The only route is **Delete**, whose confirmation reads *"Delete permanently? This will
permanently delete this message. It cannot be recovered."*

**Distinct from ALK-3507**, which covers **Unpin** in the same space — that one exists and works end
to end. Two similar-sounding actions on one surface, one present and one absent, and only the
measurement separates them. Do not dedup one against the other on the title.


### Reconnection triggers a refetch on chat and nowhere else — Calendar AND Files

Two clean reproductions each, same shape:

    Calendar   meeting created during the outage   33/34 chips before, during and after reconnect
    Files      file shared during the outage       7/8 items before, during and after reconnect
               (Shared with me tab, [data-testid="virtuoso-item-list"] > *)

    control, connected    the same item reaches the open view in ~5 s (calendar) / ~20 s (files)
    control, chat         a message sent during the same outage arrives on reconnect

**Every component works** — events publish, the screens render them live, an on-demand refetch is
instant, and the same page asks the server successfully at the same moment. **The single missing
link is that reconnection is wired to a refetch on chat and nowhere else.** Medium: any navigation
heals it.

Probe notes for anyone re-measuring: the file list is **virtualised** (`virtuoso`), so row selectors
over `tbody tr` never match; and the observing account's default tab is `My files`, where a file
shared into a channel correctly never appears — use `Shared with me`.

### A seven-hour session is stable — with the control that makes the null result mean something

One tab, **416 minutes**, no reload or navigation at any point:

    five readings   heap flat at 71–72 MB
                    DOM node count byte-identical every time

    then, from the other account:
                    message rendered on the parked page 4 s later
                    35 → 36 messages, +43 nodes, +4 MB

**Realtime, auth and render all survive a seven-hour session.** The movement on the last reading is
what makes the four flat ones worth anything — they are flat because nothing accumulated, not
because the probe had stopped measuring.

### Realtime reconnection works — verified, and `setOffline` cannot test it

    socket closed from inside the page   "Reconnecting…" within 1 s, replacement socket,
                                         banner cleared by 2 s

The app's behaviour is correct. Note the instrument: `page.context().setOffline(true)` flips
`navigator.onLine` but leaves an already-open WebSocket open — measured over 20 s with the
constructor instrumented, `open 1, closed 0`, and no banner, correctly, because nothing had
disconnected.

Also: `page.routeWebSocket` did not fire alongside an `addInitScript` constructor wrapper — the two
appear mutually exclusive, so pick one per run.

### No memory leak in a running call — and the observer was the cause

A heap that appeared to be growing through a long call was tracking the polling session's own
`getStats()` calls. The control is the swap, not the idle reading:

    alice, untouched              240 -> 242 MB   across 4 h 19 m
    dave, 3-minute polling        110 -> 152 MB   same window

**Swapping which tab was polled swapped which heap grew.** There is no leak in a running call — the
measurement was generating the signal it measured.

Worth keeping as an instrument lesson as much as a result — the measurement was generating the
thing it measured.

### Live removal (kick) is handled cleanly — verified on the deployed build

    workspace kick   auth/me stays 200 (still in the company); the open tab redirects to the
                     user's personal workspace, not a broken screen and not the login form
    company kick     users/me/companies -> {"companies":[]}; the user lands in a personal
                     workspace that is created on demand

Reversible for testing: `seed/seed.sh --lanes <letter>` restores both memberships (verified in
`org_db`). Avatars are not — `avatar_url` on companies and workspaces is absent from the seeder's
upserts.


**Keyboard reachability on org and settings screens (2026-08-26, rc.5).** ALK-3369 shows
keyboard-unreachable controls are a filed class in this project, so five screens were tabbed
through and compared against a full enumeration of visible controls:

    settings/roles            not reached: "Workspace roles" (tablist), "Assign role" (disabled)
    settings/admin/members    not reached: none
    settings/admin/invites    not reached: "Create invite link", "Send direct invites" (both disabled)
    settings/notifications    not reached: none
    settings/privacy          not reached: "Block" (disabled), "Request export" (disabled)
    controls focused without a visible focus ring, any page: none

**Every miss is a control that is `disabled` at load** — the invite submits until a role and
recipient are chosen, `Block` until a participant is picked, `Request export` because the
feature is off — and disabled controls are correctly not focusable. The one non-disabled
miss is the scope **tablist**, which is right: Tab enters it once, arrow keys move within.

**Methodological caveat from the session that ran it, which must travel with the table:**
the "reached" counts are deduplicated by label, so a page with six buttons all reading
`Delete` contributes one. **Only the "not reached" column means anything** — do not quote
this as "N of M controls are reachable", because that is not what it measures.

### Three tickets deliberately not tested, and why — ALK-3426 / ALK-3117 / ALK-2784

All three need a profile save, and **the server locks profile updates for a week** after one. Testing
them on a fixture account would:

- break the cross-lane display-name invariant for seven days, and
- mutate the department/position state that a **published finding already depends on** — a later
  verifier would see fixture drift and read it as a false positive.

**Safe route for whoever picks them up:** one disposable account settles all three, because the 429
path only appears on the *second* save. Do not use a `qa.*` fixture.

This is a skip with a reason and a route, not an untested gap.

**Settled sagas live in Part 3** — verdicts here, full measurements there, verbatim:

- **Ghost guests** · a guest whose browser dies *while inside a Side Room* leaves a permanent
  phantom participant row that consumes a seat for the life of the call; the breakout sweeper
  runs and does its job — the meeting-level row is what never closes. CLOSED, ticket-ready,
  awaiting report consolidation.
- **Lingering 1:1 meetings** · a 1:1 can stay `active` for minutes after both parties leave
  (worst case ~4 min, both `left_at` written late by a sweep; a plain tab close has its own
  ~45 s signature), bouncing every navigation back to the call meanwhile. Intermittent; lane,
  channel and entry path all excluded.
- **Guest permissions** · `is_guest` is a disclosure flag, not an authorization input — by
  design, verified in source. The three «guest can do X» observations are not defects; do not
  file them without a product decision saying guests should be capped.

# Part 3 · Archive — settled investigations and dated ticket-state snapshots

Nothing here needs action. The investigations are settled and kept verbatim for their
measurements; the ticket-state rows were true on the build they name and drift with every
release — verify against the current build before relying on one.

## Settled investigations

### PARTICIPANT LIMIT — measured by sector A, owned by sector B, one part unresolved

Ghost guests inflate the server's headcount and block the host from setting a participant limit.

    PATCH /api/v1/meeting/{id} {"max_participants":5} -> 400 REALTIME_MEETING_LIMIT_BELOW_CURRENT
    threshold pinned: limit 5 -> 400, limit 6 -> 200        the server counts six
    GET /meeting/{id}/participants -> 6 rows: 4 real + 2 type:"guest" whose contexts died 25 and
                                     40 min earlier; payload has no `left_at` and no `status`
    visible participants panel      correct at 4 — only the API is inflated

Not ALK-1835 (that one breaks LiveKit negotiation *before* `participant_joined`; these joined
fully, were admitted, entered a side room, then vanished).

**RESOLVED — the save is NOT silent. Drop that half of the finding.** Sector B scanned the whole
document *before* the attempt as well as after:

    before   0 matches — the sentence is not in the document at all
    after    one visible element:
             <p role="alert" data-testid="meeting-settings-server-error" class="… text-red">
             "The limit cannot be lower than the number of people already in the call."

Delivered, translated, rendered, visible. It was never static helper text. Both earlier readings
were wrong, including the "error hidden behind identical text" hypothesis — there was nothing there
to be identical to. The lesson is the existing one: **scan before the action, not after** — an
after-only visible-text set cannot separate the two cases; a before-scan separates them for free.

**The limit does gate admission, and that is what makes the ghost rows matter.** Sector B measured
the join path with the limit at the current headcount:

    "Call is full | This call has reached its participant limit. Try again in a moment. |
     Back to workspace"

That screen trusts the same count. **If dead guest rows persist, real people are refused entry to a
call with free seats** — a functional lockout, not a wrong number in an API. Not yet demonstrated:
sector B's call has no ghosts, and manufacturing them means reproducing sector A's path wholesale.
Sector A's soak is now the load-bearing measurement; report due 08:00.

`errorPresentation.ts:646-651` records this panel as already fixed once — it "reported *Try again*…
because it enumerated two error kinds by hand and never consulted the catalogue".

**The matrix is closed — three controls, one leaking cell.** All in the same call:

    member, context destroyed     row gone in <= 20 s
    guest,  clicked Leave call    row gone         ("You left the meeting…")
    guest,  context destroyed     row alive >= 104 min, still counted toward the limit

**Exactly one cell leaks: guest + disconnect-without-leave.** Neither "that is how disconnects
work" nor "that is how guests work" survives. The member used had **never been in that call
before** — created, admitted and destroyed exactly once, like the guests — so his row cannot have
been cleaned up as a leftover from an earlier cycle.

**CONFIRMED — the branch is the SIDE ROOM, not guest-disconnect.** Sector B spotted this in a run
they had written off as a no-result and pushed back on the three-cell version; sector A supplied the
clock and reproduced it on demand. Both cells run back to back in the same call, same teardown:

    GUEST, NO SIDE ROOM      joined by link, admitted, visible in roster, never entered a room
                             context destroyed 00:09:56
                             00:10:05 (+9 s) -> n=6, row absent; five more samples to 00:16:23, absent

    GUEST, IN A SIDE ROOM    same path, then joined "Repro Room"
                             context destroyed ~00:18:2x
                             00:18:41 / 00:19:51 / 00:21:02 / 00:22:12 -> row present at every sample
                             alongside the two 18:04 / 18:08 ghosts, same shape

**The matrix, after sector A removed a cell that proved nothing:**

    guest,  NO room, abrupt         clears <= 9 s
    guest,  IN room, abrupt         never clears — three cases, oldest >= 3 h
    member, no room, abrupt         clears <= 20 s   (control: rules out "that is how disconnects work")

Two cells differing in one variable, plus a control. The dropped cell — guest, no room, clean Leave
— was a *real* leave (dialog confirmed, post-leave screen rendered) but uninformative: that guest
never entered a room, so the row was going to clear regardless. Valid and decorative.

**The exit from a room is two-step, not absent — state it that way.** Two sectors enumerated the
controls available inside a Side Room (23 and 34 respectively) and neither found a `Leave call`;
that part holds. But `Leave room` → confirmation → confirm returns you to the main call, where
`Leave call` reappears. **A user is not trapped**, and writing it as "trapped" would be refutable in
one click and would take the rest of the finding with it.

**What strengthens the funnel argument instead:** a page reload puts you back in the side room, still
with no `Leave call`. The state survives a refresh — which is exactly what someone does when they
cannot find the exit.

**So the leaking path is the one the UI leaves open.** Someone sitting in a room who wants to go
looks for "leave the call", does not find it, and closes the tab — which is exactly the abrupt
teardown that leaks the seat. This is not an edge case a user stumbles into; it is the default
behaviour when the obvious exit is missing.

**Both halves belong in one ticket.** The missing exit on its own is a two-step exit rather than a
defect; its weight comes entirely from the leak it feeds.

**A guest closing their laptop is not enough — they have to close it from inside a Side Room.** That
is why this is not tripped over in ordinary use, and it is a far smaller place for a developer to
look than "guest disconnect handling".

**Supporting control — member vs guest, identical teardown:**

    while alive       panel "Participants 5 in call"   /participants: 7 rows
    +20 s after kill  panel "Participants 4 in call"   /participants: 6 rows  ← member row gone
    same response     the two guests still present, ~104 and ~101 minutes old

Cleanup after an abrupt disconnect **works for users** and fails for guests. That one measurement
does three jobs: it narrows the fix to the **guest branch** rather than disconnect handling
generally; it kills the "it is how you killed the window" objection, since the same kill is cleaned
up correctly for a member in the same call; and it keeps ALK-1835 separate (that one breaks
negotiation *before* `participant_joined`).

**Source lead for the mechanism (sector A — a lead, not a confirmed cause).** Read-only; every
symbol verified on both `dev` and `origin/main`.

Entering a Side Room is a separate LiveKit room, so LiveKit fires `participant_left` on the MAIN
room. The service deliberately does not treat that as leaving the meeting —
`BreakoutParticipantRepository.IsActiveInBreakout` says so in its own comment. Losing the connection
to the room goes through `MarkDisconnected`, which sets `disconnected_at` and holds the placement
open for a return window; `CloseExpiredBreakoutDisconnects` → `CloseExpiredDisconnects(grace)` closes
it, `defaultBreakoutReconnectGrace = 60s`.

**The discriminating measurement — "job not running" vs "job fixes the wrong level":**

    01:18:53, ~1 h after Repro Guest's connection died
      GET /breakout-rooms   "Repro Room"  status=waiting  n=0   ← placement CLOSED, room emptied
      GET /participants     Repro Guest still present            ← meeting-level row survives

**The sweeper runs and does its job.** What never closes is the meeting-level row: the original
main-room `participant_left` was suppressed because the participant was in a breakout, and when the
placement later expires nothing re-processes that suppressed leave. Accounts for the matrix exactly.

**Suggested shape for a fix:** when a breakout placement expires without a return, re-evaluate the
participant at the meeting level, not only at the room level.

**A negative that narrows the trigger further (sector B):** closing a guest's tab is **not**
sufficient. Four guests fully joined one call from one cookie jar; all four tabs closed
programmatically; five seconds later the host showed `tiles 1` and the roster was back to one.
Clean disconnects, no residue. So the ghost is not "the page went away" — if a plain tab close
produced them, every session today would be full of them. A crashed browser and a closed tab are
not the same event to LiveKit, and only the first appears to leave the row.

**Practical shape:** every guest whose browser crashes or whose laptop closes permanently consumes a
seat. A call with a guest link and a participant limit loses **one seat per crashed guest**, with no
way for the host to see or reclaim it — the visible roster never shows them.

**CLOSED — ghosts do not expire. Final reading 07:53 +05 / 02:53 UTC:**

    GET /meeting/{id}/participants -> 8 rows: 4 live participants + 4 ghosts
      Night Guest      joined 18:04:42 UTC   listed 8 h 49 m
      Night Guest      joined 18:08:06 UTC   listed 8 h 45 m
      Repro Guest      joined 19:17:41 UTC   listed 7 h 36 m
      RoomLeave Guest  joined 20:29:08 UTC   listed 6 h 24 m

Each disconnect came one to three minutes after its join, so the ghosts are those minutes younger —
it does not change the answer. **The documented return window is
`defaultBreakoutReconnectGrace = 60 * time.Second`; these rows are in their ninth hour.** The rooms
those guests were in closed hours ago and are back to `waiting`, so the breakout-level sweeper ran
and did its job — it is the meeting-level row that never closes.

**A seat consumed this way is lost for the life of the call.**

**Bounding negative — the call itself is fine.** Over the same nine hours: four participants, four
tiles, every active PeerConnection `connected`, `Excellent` on all four clients, timer matching wall
clock, DOM node counts flat within ±3, build stamp unmoved. The only thing that accumulated was
closed `RTCPeerConnection` objects from side-room entries, and the heap did not follow them. So the
defect is the roster, not the call.

**Superseded detail —** four rows, oldest `18:04:42`, counted at **06:52 — twelve hours and forty-eight minutes.** Final reading at 08:00, but the answer to permanence is settled barring a surprise: a seat lost this way is lost for the life of the call. **Four rows now — 18:04, 18:08, 19:17, 20:29.** The fourth arrived **unintentionally**, from the run that failed to find `Leave call` inside a room: ordinary testing activity created a ghost without anyone trying to. That is worth putting in the ticket — the trigger is not merely reachable, it was hit by accident by someone who knew about it. If they survive a full night the leak has no
expiry and the seat is gone for the life of the call.

**2026-08-26 · from C · to B · a 1:1 meeting stays active after everyone leaves, and
blocks navigation while it does.** Measured: both participants left at 10:47:39.3Z and
10:47:46.2Z; `GET /meetings/current` kept returning it as `status: active` for both
accounts, and every navigation bounced the tab back to `/w/<ws>/call/<id>`. It closed on
its own at 10:51:50Z — 4m04s after the last participant left (one timed measurement, the
same shape seen on two other calls). `POST /meeting/<id>/cancel` returns
`409 REALTIME_CALL_NOT_RINGING`; `POST /meeting/<id>/end` returns 200 and clears it.
The knock-on — a 13.5s call written into the conversation as "Duration 4:17" — is already
filed by C. Full measurement in `logs/AIRION-QA-2026-08-26-C-chat-2.md`.

**B could not reproduce it, and the database settles why. Both were partly right.**

B ran two calls from Directories → person row → `Call`: the first `Leave call` ended the
1:1 instantly for both parties, `meetings/current` returned `{}`, and navigation did not
bounce. Their proposed cause — that C's call was really a two-person *group* call — is
**refuted**: `C4OVEWOTJW1AA86` is `type=dm`, `name=dm:U4QCALICE000001:U4QCCAROL000001`.
It was a genuine 1:1.

Measured in `realtime_db` for C's meeting `V4OWLQC8NM55XK8`:

    started_at  10:47:32
    ended_at    10:51:50      end_reason NULL
    participants: alice left_at 10:51:20 · carol left_at 10:51:20   (identical)

C observed the two Leave clicks at 10:47:39.3 and 10:47:46.2 — but `left_at` for **both**
is 10:51:20, four minutes later and to the same second, thirty seconds before the room
closed. Lane B's meetings show the normal shape for comparison: `left_at` equal to
`ended_at` (12:37:11 / 12:37:11).

**Inferred, not measured:** the UI leave never registered server-side on C's path, and a
sweep marked both participants left at 10:51:20, the room closing 30s later — consistent
with the `departure_timeout: 30` B found in the raw meeting payload.

**Then B tested the DM path on their own lane and it worked, so the entry route is out
too.** The full picture, every DM-channel meeting on both lanes today, gap between the last
recorded leave and the room closing:

    lane B  05:59:13 / 11:33:02 / 12:36:01 / 12:37:11 / 12:41:45      gap 0s on all five
    lane C, all three on the SAME channel C4OVEWOTJW1AA86, same pair:
      10:43:31 -> 10:46:13   lefts 10:45:23, 10:45:43   gap 30s
      10:47:32 -> 10:51:50   lefts 10:51:20, 10:51:20   gap 30s   <- the disputed call
      10:52:59 -> 10:56:12   lefts 10:56:12, 10:56:12   gap  0s

Two of three on one channel lingered and the third did not, so **lane, channel and entry
path are all excluded. It is intermittent.** C's is the worst instance — both `left_at`
identical and four minutes after the observed clicks, which nothing else in either lane
shows. The 30s matches `departure_timeout: 30` in the raw meeting payload.

**Tab-close measured by B, which gives the family three distinct signatures:**

    explicit Leave call       other side sees "Call ended" at  0s   (measured twice)
    tab close, no leave       other side sees "Call ended" at 45s   (one run, 2s sampling,
                                                                     true value 43-45s)
    C's worst case            both left_at identical, ~4 minutes late

So the no-leave case has its own signature and it is 45s — neither 30s nor four minutes.
Candidate 3 is therefore **excluded as the explanation for C's worst case**, while
confirming the family: when no leave is processed a sweep writes `left_at` and the room
closes after it. The open question narrows to why that sweep took roughly five times longer
on one call than the one B can produce deliberately.

Worth knowing separately, not filed: a participant who closes their laptop stays visible to
everyone else for up to ~45 seconds. Any "the tile disappeared cleanly" observation taken
after that window — including B's own earlier one — was measured past the interesting part.

**A wrong turn recorded so nobody repeats it:** C reported that the Directories path
creates a new channel instead of reusing the DM. It does not — their run called **admin,
not carol**. `C4OWPTXDA90XOMV` is `dm:U4QCADMIN000001:U4QCALICE000001`, a pair with no
prior DM, and there is exactly one DM channel for alice+carol. That also explains their
"carol never showed an incoming surface": she was not in the call. Not a finding.

**Timezone:** the database is UTC, the team runs +05. C's 10:47Z is 15:47 local; B's
"17:41" run is the 12:41 UTC row above.

**2026-08-26 · from C · to D · a guest can create channels.** Measured: the guest sees
"Add channel", the create form opens in full, and
`POST /channels {"name":"qa-c2-guest-probe","type":"public"}` returns 200 with
`created_by` set to the guest. Confirmed independently in `org_db`.

**Resolved by D, and it is not a bug.** The guest holds a role that permits it. Verified
in the seed and in the backend: `WORKSPACE_MEMBERS = [k for k in UID if k != "qa_outsider"]`
includes `qa_guest`, so the guest gets the workspace `Member` role, which carries
`workspace.{ws}.channel.create`. The `is_guest` Guest role adds only
`company.{co}.member.view` — it grants nothing and, more to the point, **restricts
nothing**. Nothing in `platform/pkg/permissions` references guest status at all (verified
with a control grep, not an empty one), so `is_guest` is a flag on a role, not a modifier
on permission resolution.

That also explains why channel creation was the only action breaking C's pattern:
everything else they listed is gated by **channel-layer** permissions the guest does not
hold, while `channel.create` is a **workspace-layer** action their member role does carry.

**Now measured, not inferred — and it makes the two cases one question.** D originally
argued that `is_guest` restricts nothing from the absence of any guest reference in
`platform/pkg/permissions/permissions.go`. That established "the catalogue does not mention
guests", which is a weaker claim than "guest status is not consulted at resolution time".
They then tested it directly: a role carrying **only** `workspace.{ws}.audit.view`,
assigned to the guest account:

    ADMIN nav gains "Audit log"   (was: Company dashboard, Members)
    the page renders the full table, with Export CSV / Export JSON
    GET /api/v1/workspaces/{ws}/admin/audit-log?limit=100  ->  200

**A guest handed an administrative permission exercises it exactly like anyone else, down
to exporting the audit log.** The guest flag is a label on a role, not a ceiling on what its
holder can do.

**Three instances now, found independently by three sectors** — which is what makes this one
product question rather than three oddities:

    C  a guest can create channels                     (workspace-layer member role)
    D  a guest granted audit.view opens the audit log  (and exports CSV/JSON)
    B  a guest can create a call and is its full host  ("QA Guest (you) | Leave call |
                                                        End for everyone")

**ANSWERED, with source, and the answer is that none of the three is a defect.**
`is_guest` is a **disclosure flag, not an authorization input — by design, not omission.**

Verified independently in the backend clone:

    RoleRepository.UserHasPermission(ctx, userID, scopeType, scopeID, action string)
    RoleRepository.UserHasExactPermission(ctx, userID, scopeType, scopeID, action string)
      -> no guest parameter anywhere in the chain, so there is no point at which
         being a guest could suppress a grant

    every non-test IsGuest / is_guest reference in Go is serialization or display
      (domain/member.go, domain/message.go, authors_helper.go, role/converter,
       list_* transports, create_company_role.go — the last is field-copying in
       request/response conversion, not a check)

    api-gateway/internal/core/domain/member.go:36  "поэтому вывести его из ролей
    нельзя (ALK-1086)" — guest-ness is carried as a separate boolean **because it
    cannot be expressed through roles**. It exists to DISCLOSE an external
    participant, not to restrict one.

So the guest holds a role carrying the permission, and being a guest changes nothing because
nothing consults it. **The system is doing what it was built to do.**

**Deliberately not filed, and worth pushing back on if someone tries.** Whether "guest"
*ought* to imply a ceiling is a product decision, and CLAUDE.md is explicit that expected
behaviour is not derived from source. Three independent sightings make it a good question;
they do not make it a defect. Filing it would put a design choice in front of a developer as
a bug.

**The residue that IS ours is an expectation gap:** an admin inviting someone as a guest may
reasonably read that as a limit, and nothing in the UI says otherwise. Worth someone checking
what the invite and role screens imply about guests — a copy-and-expectation question, not
authz.

**If the product answer comes back "guest should restrict", the enforcement point does not
exist yet, and these three are the ready-made regression suite** — all currently passing in
the opposite direction:

    a guest holding workspace.audit.view is refused at the API, not merely hidden from the nav
    a guest holding the workspace Member role cannot create a channel
    a guest cannot hold host controls in a call they created

Not a finding and not filed: an administrator must grant the permission deliberately, so
nothing escalates on its own. Fixture restored — role deleted, guest back to company
Member + company Guest + workspace Member, `seed.sh --verify --lanes D` clean.

What remains is a product question, not a defect: should an `is_guest` role suppress
workspace-layer grants its holder gets from an ordinary member role? Two honest fixes if
so — stop giving guests the workspace Member role (seed/provisioning, and it would apply
to any real deployment doing the same), or make `is_guest` mask workspace-layer actions
during resolution (a product rule that does not exist today). Same shape as D's BUG-7 in
the opposite direction: layers resolved independently, with no cross-layer notion of
"this person is limited". Measurements in `logs/AIRION-QA-2026-08-26-C-chat-2.md` (UI)
and the sector D log (role chain).

## Ticket-state snapshots — measured on v0.61.0-rc.5, 2026-08-26/27

**Also re-verified on rc.5 by sector B, all still reproducing:** ALK-3529 (guest
waiting-for-approval screen, `interactiveCount: 0` across the whole document — independently
confirmed by sector A in the same session, two sectors, two runs), ALK-3530
(see `DECISIONS-PENDING.md` — its framing is misleading), ALK-3531 (raw
`GET /meeting/<id>/events` carries no knock, deny or admit event types at all, confirming
the corrected "absent, not anonymised" framing).

## Filed tickets re-verified on v0.61.0-rc.5

### Partial fixes wearing a finished ticket — two confirmed, same shape

Both were found by checking a ticket's *premise* against the live build rather than its status.

- ~~**ALK-2357** — role targets rendering `role:R4OW…`~~ **Withdrawn: this is specified
  behaviour, not a gap.** ALK-3307 states it directly: *«Пусто — профиля нет в реплике или
  таргет не пользователь; тогда откатывайтесь на показ идентификатора.»* A role target is not a
  user, so the identifier fallback is the contract being followed. Verified at line 134 of the
  ticket. Left here rather than deleted so nobody re-derives it.
- **ALK-1951** (permission catalogue advertises `workspace.delete` with no API) — the catalogue
  no longer advertises it (9 items; granting returns `400 ORG_PERMISSION_UNKNOWN_RESOURCE`), but
  the delete API is still missing. Half the premise fixed, half live.

The tell in both: the ticket's stated cause no longer matches the build, in a way that makes the
remaining work smaller and differently-owned than the ticket says. Worth checking the premise of
any ticket you are about to dedup against, not just its status.


The morning sector-D report ran on rc-3 and was verified on rc-4, so none of it had been
checked against the deployed build until now:

    ALK-3535  audit log omits company-scope events          reproduces
    ALK-3536  raw key `audit.view` in the permission list    FIXED — see DECISIONS-PENDING
    ALK-3537  Workspace identity subtitle promises absent fields   reproduces
    (owner cannot leave the workspace — dead end)            reproduces

## Positives that bound an open ticket

**ALK-3521** (a blocked user still shows active Call and Message actions, Backlog) — the
button being there is the defect, but **pressing it fails safely and says why**, which
bounds the impact. Measured: `POST /api/v1/messaging/dm` returns `400 DM_USER_BLOCKED`
("cannot create DM: user is blocked"), no outgoing surface appears, no meeting is created,
and the user is told plainly that one of them has blocked the other. Useful for triage:
this is a stale-affordance defect, not a blocking-bypass one.

## Open tickets confirmed still live on v0.61.0-rc.5

- **ALK-3528** — an invitee sees the host's private Side Room under "YOUR PRIVATE ROOMS /
  Only you can see this room".
- **ALK-3412** — `Request access` fires `POST …/breakout-rooms/{id}/join` → 200 and puts you
  straight in; no request is ever sent.

## Closed tickets confirmed genuinely fixed on v0.61.0-rc.5

Both in TESTING, both verified working live with no reload, in case anyone is deciding
whether to trust the closure:

- **ALK-3405** (reactions) — host disables reactions, `reactions_enabled:false`, and the
  participant's `call-controls-live-reaction` button disappears from their toolbar live.
- **ALK-3407** (in-call chat) — host disables chat, `chat_enabled:false`, and the
  participant's composer and Send go `disabled:true` with `Chat is disabled for this call`
  in the panel, live.

**Design note for ALK-3453** (also queued in `DECISIONS-PENDING.md` item 10) (mic/camera blocked by settings goes dark with no explanation,
still open): the product already ships two working patterns for "this control is
unavailable" in the same toolbar — chat keeps the button and explains itself in the panel,
reactions remove the button entirely. Only mic does a third thing: stays, greys to
`opacity:0.4`, `cursor:not-allowed`, keeps its normal tooltip, and says nothing. The fix
does not need inventing.
