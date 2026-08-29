# Decisions pending — for Mahmud

> **Provenance.** The original was destroyed by a bad edit on 2026-08-26 (a write-before-read
> truncation of an untracked 1050-line file) and reconstructed from the session transcript the
> same evening; nothing is known lost. **Groomed on 2026-08-29 with Mahmud's approval:** superseded
> revisions collapsed to their final state, blocks that belong to and already exist in
> `PITFALLS.md` / `HANDOFF.md` / `SECTORS.md` / `snip/watch.mjs` removed, resolved items moved to
> the tail, and the 2026-08-27 section renumbered 26–29 to undo a numbering collision with items
> 23–25. Every removed byte is in git history (pre-groom state: the parent of the commit that
> landed this).

Things that need Mahmud, queued because he may be away. **Nothing is dropped from here
until he has answered it.** Everything else — tooling, helpers, wrong facts in docs,
handoffs, fixture notes — is applied without asking and recorded in the session log
instead.

Append new items at the bottom with the date, what is being asked, why it needs him
rather than being decided here, and the options with a recommendation. Remove an item
only when it has been answered, and say what the answer was.

## Index — the walkthrough

**Needs you** (file order):

1. Peer messaging between sessions — advisory-only, or may a finding be dropped on a peer's word?
2. `/debrief` cadence — recommendation: once mid-run, once near the end.
3. Sector re-weighting beyond the named D/E halves — recommendation: wait for run evidence.
4. Two Jira comments: ALK-2559 (re-test first) and ALK-3530 (one-line framing fix).
5. Group audit of tickets closed against broken fixtures; comment on ALK-2559 with the four-case matrix.
6. ALK-3536 is fixed on the deployed build and its ticket does not know — comment?
7. ALK-3016 — comment with the corrected cause (client cache state, not the recipient's session)?
8. ALK-2876 — comment with the wider trigger and the second component?
9. ALK-3425 — comment with the three instances outside its title?
10. ALK-3107 / ALK-3453 — comment that the product already ships the answer?
11. ALK-3005 — comment with the correct source path?
12. Seven TESTING tickets closed with the behaviour absent — raise the pattern, comment on the seven?
13. Dedup filter — final recommendation: widen what you *read* (BLOCKED/REVIEW/Tasks), never let a
    status decide a withdrawal; board ~44% stale on a 34-ticket sample. Comment on ALK-1966/2131?
14. Review the accumulated CLAUDE.md method-line diff (now committed — reviewable via git history);
    decide the PITFALLS consolidation / move-checks-into-tooling option.
15. Where knowledge lives — prefer symptom-triggered rules with a mechanical discriminator shipped
    alongside; what, if anything, to build.
18. Chat backlog verified: 8 close candidates, 10 confirmed with fix-changing detail — act on Jira?
19. ALK-3538 — withdraw or amend (fixture cause); seeder change vs documented caveat. People half
    needs an app-registered account (see 24). Companion: the fixture guest is not a guest.
20. Sector C's drafted self-suppressing-UI rule — accept into CLAUDE.md or reject.
21. A family of drafted-but-not-written rules (ten sub-entries through the file) — accept/reject each.
22. Two rig-technique diffs routed for approval: `setOffline` does not close an open WebSocket;
    `setBlockedURLs` is per-CDP-session and does not close open connections.
23. Two calendar findings that must be fixed together, or the second reads as a regression.
24. Settling People-search needs an account registered through the app — your say-so, nobody else's.
26. Twelve findings right about the bug, wrong in a detail — correct in place (republish five) or at filing time.
27. Lane D's published report disagrees with itself in one row — fix and republish, or carry it.
28. Should Review's re-ratings and rewritten «Ожидаемый результат» fold back into published reports?
29. Real 80% zoom for the rig browsers — wants a snippet re-verification pass behind it.

**Resolved while you were away** (kept at the tail for review, then deletion): 16 — the shared
files are committed now; 17 — the Artifact cap was a daily quota and reset; 25 — the README table
is mended.

---

## 1 · Should sessions message each other directly? (raised 2026-08-26)

Today every cross-session exchange went through me. Sessions could instead message each
other for questions about a neighbouring sector.

**Why it needs him:** it changes how the sessions are allowed to operate, and the risk is
not obvious — I am currently the only verifier in the loop, and I caught three wrong
claims today, including two sessions blaming the wrong file for the same real bug.

**The specific question:** should a cross-session answer stay purely advisory — "here is
what I saw, verify it yourself" — or may a session drop a finding on a peer's say-so? The
dangerous case is suppression: *"is this a known non-bug?"* → *"yes, we withdrew that"* →
a real regression is dropped and nobody ever knows.

**Recommendation:** allow peer questions freely, require the answer to be treated as data.
A finding may only be dropped against the log or the running build, never on a peer's
word alone. Handoffs already go to `HANDOFF.md` and need no messaging.

---

## 2 · Should `/debrief` run on a schedule? (raised 2026-08-26)

The standing channel is open, so incidents arrive on their own. The structured questions
still have to be pulled, and they reach things nobody volunteers — what you hand-rolled,
what you would improve given an hour.

**Why it needs him:** it costs session time on a cadence he is paying for, and only he
knows how long runs usually are.

**Options:** end of each run (fresh, but too late to act on) · every few hours during a
long run (actionable, interrupts more) · manual only (today's behaviour).

**Recommendation:** once mid-run and once near the end. Mid-run is the one that can still
change the run.

---

## 3 · Sector re-cut beyond named halves (raised 2026-08-26, partially answered)

He ruled out adding a sixth sector on machine resources, and asked me to reconsider D and
E instead — done, both now have named halves. The deeper imbalance is untouched: A is
15.7% while D is 23.3%, so a full pass over D is half again the work of a pass over A.

**Why it needs him:** re-weighting sectors changes what gets covered per run.

**Recommendation:** leave it until the halves have been used for a run or two, then decide
with evidence rather than by share arithmetic.

## Act, or queue — do not sit on it

The user is often away while sessions run, and a proposal that waits blocks work that
could already be done. **Apply anything that does not genuinely need him.** Queue the rest
in `DECISIONS-PENDING.md` and present every item when he returns — nothing is dropped from
that file until he has answered it.

**Act now, no approval:** rig tooling and helpers; bugs in tools you built; wrong or stale
facts in the docs (a route list that is out of date, a scope line naming a feature that
does not exist); handoffs and fixture notes; anything reversible and contained to the QA
workspace. Then do both of these, every time:

- **Append it to `CHANGES-APPLIED.md`** — what changed, why, who reported it, how it was
  verified, and whether it was later reverted. He asked to be able to review what happened
  rather than discover it. Record the things you tried and backed out too: an unexplained
  reversal is worse than the change.
- **Tell the sessions**, naming whose report drove it.

When he returns, print **both** files: everything applied from `CHANGES-APPLIED.md`, then
the whole queue from `DECISIONS-PENDING.md`, oldest first. Miss nothing — a queue that
quietly loses an item is worse than one that never existed, because he stops trusting that
asking was captured, and an unrecorded change is one he has to find out about the hard
way.

**Queue for him:** anything that changes how work is allocated or weighted; a trade-off
that spends his resources; anything touching a published artifact; anything reaching
outside the workspace; anything hard to undo.

**Two standing rules survive this delegation and are never auto-applied.** No ALK ticket
or comment without being asked. And nothing that could limit what future sessions may test
enters `CLAUDE.md` without an explicit yes — quote the exact wording and queue it.

For each queued item write: what is being asked, why it needs him rather than being
decided here, the options, and a recommendation. Per item also record what it already cost
— concrete, a lost measurement, a near-Critical — and where the change would go.

Flag separately anything unverified, and anything that is cleanup of damage the
coordinator itself caused — the user should not have to work that out from the list.

When he returns, walk the whole queue, oldest first. A queue that quietly loses an item is
worse than one that never existed, because he stops trusting that asking was captured.

---

## 4 · Two Jira items, neither actioned (raised 2026-08-26)

Standing rule is that I never create or comment on ALK tickets without being asked, so both
of these are recorded rather than done.

**a) ALK-2559 may have been closed against a fixture that could not test it.**
`[BE][NOTIFICATIONS] Упоминания @mention, @all и @here не доставляются пользователям с
muted Channel` is in **TESTING (closed)**. It was verified on QA fixtures whose
notification-side channel membership did not exist — the seed never populated
`notification_db.channel_members` — so on those fixtures *no* channel notification could
fire, muted or not, and any verification would have seen the expected absence for the wrong
reason. The seed is now fixed and mention notifications demonstrably work, so the ticket is
newly re-testable.

**Options:** re-test it first and comment only if it reproduces · comment now noting the
verification environment was compromised · leave it. **Recommendation:** re-test first —
sector C or D can run the mute-override case cheaply now, and a comment carries more weight
with a result attached than with a doubt.

**b) ALK-3530's framing sends a developer to the wrong half.**
`[FE-WEB][CALLS][MEETING SETTINGS] Ведущий не может посмотреть пароль звонка` is in
Backlog. It reproduces on rc.5, but `GET /api/v1/meeting/<id>` carries **no password field
at all**, so the client has nothing to display. Read as "the field is not being populated",
a developer will go looking for a populate step that cannot exist. Sector B was careful not
to claim this makes it a backend ticket — not returning a password in a GET is ordinarily
correct, and the fix may well be frontend (drop the reveal affordance, or stop showing a
write-only field) or a dedicated reveal endpoint.

**Options:** add one line to the ticket ("the meeting response carries no password field")
· leave it and let triage discover it · re-scope the ticket. **Recommendation:** the single
line. It costs nothing and removes the wrong turn, without asserting which half owns the
fix.

---

## 5 · Tickets closed against this fixture set deserve a group audit (raised 2026-08-26)

The seed never populated `notification_db.channel_members`, so **no channel notification
could fire on any QA fixture, for as long as those fixtures have existed.** Any ticket
about channel notifications, @mention delivery or notification settings that was verified
and closed on this fixture set was measuring the seed, and would have seen the expected
absence for the wrong reason. ALK-2559 is the one we found by accident; there is no reason
to think it is the only one.

Sector C makes the wider point from their own day: a published finding from 25.08 that does
not reproduce, and another that was never a defect at all. Their framing — *tickets closed
against this fixture set before today deserve suspicion as a group, not one at a time.*

**Why it needs you:** it is a question about the team's Jira history and how much
re-verification is worth paying for, not a testing decision. It could be anything from
"check three tickets" to "re-open a batch".

**Options:** audit only notification-related closures (small, targeted — the mirror can be
grepped for them) · audit everything closed via QA on these fixtures (large) · do nothing
and let it surface naturally. **Recommendation:** the targeted one. The gap has a known
blast radius — channel notifications and anything downstream of them — so the candidate
list is short and can be produced from the local mirror without a single Jira call.

**Re-tested — and it now carries a positive result rather than a doubt.** Sector D ran all
four cases on `v0.61.0-rc.5` against the repaired fixture, same channel and recipient
throughout:

    mention (chip, mention_user_ids)  -> 3 -> 4   {"title":"You were mentioned","type":"mention"}
    plain message, mute OFF           -> 4 -> 5   {"title":"New channel message","type":"channel_message"}
    plain message, mute ON            -> stayed 5   correctly suppressed
    mention,       mute ON            -> 5 -> 6   {"title":"You were mentioned","type":"mention"}

The full contract behaves, including the mention-overrides-mute case that is ALK-2559's
actual subject. **Caveat:** this is the notification row, not the realtime toast — a live
visible tab showed no banner in the earlier negative runs and has not been re-checked since
the fix. ALK-1016 (notifications vs toasts, REVIEW) may be the relevant home for that half.

**Options:** comment with the four results · leave it closed silently · leave it and let
the next verification run pick it up. **Recommendation:** comment with the results. It is a
much easier thing for the owner to act on than a doubt, it needs no re-test from them, and
it costs one comment. Still not done — Jira needs your say-so.

**But sector C draws the distinction that matters, and it is the reason item 5 exists:**
the ticket's *conclusion* looks right today; its *verification* was still worthless. It was
signed off against a fixture that could not deliver a channel notification at all, so the
sign-off had no evidence behind it either way — it would have "passed" whether the product
worked or not. Those are two different problems, and **only the second one generalises.**

**The argument is sharper than "some closures might be wrong".** A verification run on
these fixtures would have reported "no notification, as expected" whether the product
worked or not — the test could not fail. So the problem is not that some conclusions were
wrong; it is that **none of the conclusions had evidence, and there is no way from the
outside to tell which ones happened to be right.** ALK-2559 turns out to be correct on
today's build. That is luck, not validation, and it says nothing about the others.

---

## 6 · ALK-3536 is fixed and its ticket does not know (raised 2026-08-26)

`[FE-WEB][ADMIN] В списке прав роли одно право подписано внутренним ключом audit.view` is
in **Backlog** — open, and someone could pick it up. It no longer reproduces on the
deployed `v0.61.0-rc.5`:

    company scope:   11 checkboxes, raw keys found: []  label "View the company audit log"
    workspace scope:  9 checkboxes, raw keys found: []  label "View the workspace audit log"

Enumerated structurally — each `input[type=checkbox]` walked up to its own label, which is
the method that yields 11 and 9 rather than the 16 and 14 a `label` sweep produces.

It was filed off rc-3 and verified on rc-4, so nobody had checked it against what is
actually deployed. **The cost of leaving it is a developer starting work that is already
done.**

Three others from the same report were re-verified at the same time and **all still
reproduce**, so they need nothing: ALK-3535 (company-scope audit events never reach the
screen — company log has 3 `scope_type "company"` entries, 0 of those ids in the workspace
log, and the page renders the workspace log), ALK-3537 (subtitle still promises URL and
default channel; 1 visible text input in that section), and the owner-cannot-leave dead end
(Leave workspace disabled, "Transfer workspace ownership before leaving", and no
transfer/ownership control anywhere on that page).

**Options:** comment on ALK-3536 with the rc.5 result · move it to TESTING · leave it.
**Recommendation:** comment with the measurement. Moving a ticket is a workflow decision
that belongs to whoever owns the board, but the evidence that it is fixed should be on the
ticket either way — that is what stops the wasted pickup.

---

## 7 · ALK-3016's stated cause is wrong (raised 2026-08-26)

`[FE-WEB][FILES] После удаления файла у получателя вложение выглядит пустым` is in
**Backlog**. The defect is real and reproduces, but the «Подтверждённая причина» blames
"в сессии получателя" — the recipient's session — and that is not the variable.

Sector E reconciled four measurements: a client that had the message **rendered before the
delete** keeps drawing `<img alt="<filename>">` from stale local state and the image 404s,
leaving an unexplained blank; a client loading **fresh** sees
`"files":[{"id":"F…","status":"deleted"}]`, has no filename, and renders the correct
placeholder. Sender and recipient each show either behaviour depending only on their own
cache. Server payload is identical for every viewer in every case.

**The corrected cause is also broader:** *a cached message is never re-evaluated against
the deleted status.* One sentence covering sender, recipient, DM and channel — where "the
recipient's session" covers a quarter of the cases and sends a developer looking for
role-dependent rendering that does not exist.

**Also worth attaching:** the ticket's repro step "выбрать коллегу в PEOPLE" cannot be
followed on fresh fixtures. The share dialog only offers people you already have a chat
with — searching a colleague returns "No chats match your search" until a DM exists. Not a
defect (it matches the product's model), but it makes the ticket unreproducible from a
clean lane, which is how a real bug gets closed as cannot-reproduce.

**Options:** comment with the corrected cause and the repro caveat · leave it · re-file.
**Recommendation:** comment. Not re-file — it is the same defect and sector E deliberately
did not duplicate it. The comment is cheap and it stops a developer investigating the wrong
half.

---

## 8 · ALK-2876's scope is narrower than the defect (raised 2026-08-26)

`[FE-WEB][FILES] HEIC File не отображается в preview-зоне File Details` is in **Backlog**.
Its root cause is precise and correct — no `onError` fallback in `FilePreviewPanel.tsx`, so
a failed image load leaves an empty preview zone. It is narrower than the defect in two
ways:

**The trigger is not HEIC-specific.** Any image whose bytes fail to decode does it. A plain
text file renamed `fake.png` is classified `image/png` from the extension, fails to decode,
and produces the same empty preview. Practically this matters: **reproducing the ticket as
written requires obtaining a HEIC; a renamed text file does it in ten seconds.**

**The gap is in two components and the ticket names one.**

    File Details preview (FilePreviewPanel — the ticket's component)
      img nat0x0  rendered 299x196  vis=true  op=1   a visible, empty 299x196 area
      no error text; still offers "Open full-size image"

    the lightbox / viewer (not named in the ticket)
      img nat0x0  rendered  84x24   vis=false op=0   an invisible box
      no error text either

A fix confined to `FilePreviewPanel.tsx` leaves the viewer silent.

**Options:** comment with the wider trigger and the second component · leave it · re-file.
**Recommendation:** comment. Not re-file — same defect class, open ticket. The ten-second
repro is worth as much as the scope note.

---

## Pattern behind items 4b, 6, 7, 8, 9 and 11

Four open Backlog tickets were found today to be misleading in a way that costs whoever
picks them up, and none was found by looking for them — each surfaced while a session was
testing something adjacent:

    ALK-3536  already fixed on the deployed build; nobody knows
    ALK-3530  framing sends a developer to the wrong half (no password field in the response)
    ALK-3016  stated cause is wrong (client cache state, not the recipient's session)
    ALK-2876  scope narrower than the defect (not HEIC-specific; two components, one named)
    ALK-3425  systemic across at least four paths; titled as one component
    ALK-3005  cites a source path that does not exist at the deployed sha

**The decision is not really four comments; it is whether ticket accuracy is worth a pass
of its own.** Every one of these was filed by this QA process, so the same conditions that
produced them are still in place. A short, deliberate audit of recently-filed FE-WEB bugs
against the deployed build would likely find more, and would be cheaper than four
developers each discovering their ticket is wrong.

---

## 9 · ALK-3425 is systemic, and its title will get it scoped narrowly (raised 2026-08-26)

`[FE-WEB][CALLS][SIDE ROOMS] При закрытии Side Room пользователь видит дублирующее
уведомление` is in **Backlog**. The same shape was hit three more times today, in three
unrelated paths, none of them Side Rooms — every time one **specific** message and one
**generic** one, for the same event, at the same moment:

    participant limit reached
      full-screen  "The call is full | This call has reached its participant limit…"
      plus toast   "This meeting has reached its participant limit."

    banned, trying to rejoin
      full-screen  "You cannot rejoin this call | A host removed you…"
      plus toast   "You cannot join because you were removed from this meeting."

    calling someone who has blocked you
      notice 1     "This call cannot be started because one of you has blocked the other."
      notice 2     "This is unavailable because a user is blocked."

Three refusal paths sharing nothing except whatever emits user-facing notices. **A fix
scoped to the Side Room component leaves the other three.**

Not filed as a separate finding — it is polish, and duplicating an open ticket carries the
merge cost we have already paid once today.

**Options:** comment with the three instances · leave it · re-title the ticket.
**Recommendation:** comment. The title is what will drive the scoping, and three instances
outside it is the cheapest possible way to widen it before someone starts.

---

## 10 · Two open tickets where the product already ships the answer (raised 2026-08-26)

Neither is misleading — both are simply missing a pointer that would remove the design work
from the fix. Both **Backlog**.

**ALK-3107** — joining a second call from Live now fails with a generic error. Reproduces:

    already in a call, press Join on a different live call
      pre-join screen appears with NO warning that you are already in a call
      press Join -> "Could not join the call | Something went wrong while joining…"

    same user, same state, pressing Start call instead:
      POST /api/v1/meeting -> 409 {"key":"REALTIME_ALREADY_IN_ANOTHER_MEETING"}
      UI: "Leave your current meeting before joining another one."

**Creating a second call names the reason; joining one does not** — and a matching backend
key and shipped string already exist on the sibling path. Whoever takes the ticket needs to
invent neither copy nor mechanism. Two caveats recorded: no failing API request was captured
on the join path at all (so it is not a mishandled 4xx the way the create path's 409 is, and
the mechanism is unpinned), and the pre-join screen being reachable at all is arguably the
earlier place to catch it than the error at the end.

**ALK-3453** — mic/camera blocked by settings goes dark with no explanation. The product
already ships **two** working patterns for "this control is unavailable" in the same
toolbar: chat keeps the button and explains itself in the panel; reactions remove the button
entirely. Only mic does a third thing — stays, greys to `opacity: 0.4`, `cursor:
not-allowed`, keeps its normal tooltip, and says nothing.

**Options:** comment on both with the existing precedent · leave them. **Recommendation:**
comment. These are the cheapest of all the Jira items — no correction, no argument, just
"the answer is already in the product, here". A developer who has to invent an error string
will invent a different one, and the inconsistency becomes the next ticket.

---

## 11 · ALK-3005 cites a path that does not exist (raised 2026-08-26)

`[FE-WEB][SECURITY] На экране Sessions каждая сессия названа Unknown device` is in
**Backlog**. Its «Подтверждённая причина» cites
`packages/features/settings/ui-web/SessionCard.tsx`. **That path does not exist at the
deployed sha.** Verified — the only `SessionCard.tsx` in the tree is
`apps/web/src/features/settings/SessionCard.tsx:36`.

A developer following the ticket finds nothing at the cited location. This is very likely
the stale-clone problem reaching a filed ticket: a citation taken from whatever branch the
shared checkout happened to be on. The read-at-the-deployed-sha rule now in `CLAUDE.md`
exists to stop new ones; this is an existing one.

**Options:** comment with the correct path · leave it. **Recommendation:** comment. It is a
one-line fix to a ticket that is otherwise sound, and the cost of not doing it is a
developer concluding the ticket is stale and moving on.

---

## 12 · `TESTING` does not mean the behaviour is present (raised 2026-08-26)

**The most consequential item in this queue, and the one with the widest blast radius.**
Seven tickets verified against the deployed build today, from one sector alone, are closed
while the behaviour they describe is absent. All statuses confirmed in the local mirror:

    ALK-2965  Bug/TESTING       invite-permission page usable    — all controls still disabled
    ALK-2806  Bug/TESTING       Leave hint offers transfer       — hint unchanged, no transfer
    ALK-1805  Story/TESTING     Delete workspace in Company Admin— absent on all 6 surfaces
    ALK-2801  Bug/TESTING       Local time in profile            — still missing, same repro
    ALK-2288  Bug/TESTING       Show timezone (backend)          — same
    ALK-618   Task/TESTING      profile popup spec: avatar, status, full name, email,
                                role/job title, common channels, local time + tz
                                — today: name, status, buttons, shared channels. Nothing else.
    ALK-1663  Sub-task/TESTING  workspace-invite inbox + accept/decline
                                — closed while ALK-1713, its own stated dependency, is
                                  still Backlog. Closed ahead of the capability it claims.

**The consequence for everyone: a closed ticket is not evidence the behaviour exists.**
`CLAUDE.md` already says `TESTING` means closed and is not a queue awaiting QA, so it is
safe as a **dedup exclusion**. It is not safe as a **fact about the product** — and it has
been used that way, including by us, to skip verifying things a closed ticket described.

This compounds item 5. That one is about closures verified against fixtures that could not
test the behaviour; this is about closures where the behaviour is simply not there. Same
direction, two mechanisms, and together they mean **the closed-ticket history is not a
reliable picture of what the product does.**

**Why it needs you:** it is a question about the team's process and about how much of the
Jira history to trust, not a testing decision. It also implicates whoever moves tickets to
`TESTING`, which is a conversation rather than a fix.

**Options:** comment on the seven with the measurements · raise the pattern with whoever
owns the board · treat `TESTING` as unverified from now on and re-check anything we rely on
· nothing. **Recommendation:** raise the pattern, and separately comment on the seven —
seven re-verified negatives is evidence rather than an opinion, and the comments cost
nothing beyond your say-so. Nothing has been filed or commented.

## 13 · The dedup filter misses 184 open bugs — should BLOCKED join it?

**This is the largest process finding of the day and it affects every report published so far.**

CLAUDE.md prescribes deduping against `issuetype = Bug` with
`status IN ("Backlog","Ready","In Progress")`, and `jira_cache.py list --open-bugs` implements
exactly that. Measured against the mirror:

    prescribed filter (Backlog 174 + Ready 3 + In Progress 11)    188 bugs
    BLOCKED                                                       184 bugs

**Every dedup run by every sector today checked a little over half the open bugs.**

**The proof case.** Sector D published a calendar-notification i18n finding, deduped correctly
against the prescribed filter, and found nothing. The owning ticket is
`ALK-2131 [Bug/BLOCKED] [BE] Calendar notifications всегда приходят на русском языке…`, whose
root-cause section names `platform/pkg/notifkeys/keys.go` — the exact file. Its backend half has
since been fixed, deliberately, with a code comment citing the ticket by number
(`calendar/service/notify.go`). The frontend was never taught the new keys, so the symptom
flipped from always-Russian to always-English rather than disappearing.

**The decision.** Widening the filter changes what gets reported, so it is yours, not mine.

- **Add BLOCKED to the standing dedup filter** — if BLOCKED means open-but-waiting. ALK-2131
  argues it does: the behaviour is live and the code cites it as an active concern.
- **Leave it out** — if BLOCKED is a parked state closer to TESTING in this workflow, where a
  ticket is effectively out of play.

I could not settle this from the mirror alone; it is a question about how your team uses the
status. **Sector D has been asked for a read**, since they found the thread.

**What I did in the meantime:** told all five sectors to read
`jira_cache.py list --status BLOCKED --type Bug` before publishing anything else. That is more
information, not less, so it needs no decision.

**Related, and it sharpens item 12.** Sector E has now observed three of the four
status-versus-reality quadrants in one day: ALK-2357 closed with a fix present but scoped
narrower than the ticket; ALK-3536 open while the behaviour is fixed; ALK-2131 open, partially
fixed, symptom inverted. Item 12 was "TESTING does not mean present". With these it becomes a
description of how the board drifts in both directions — which is a more useful thing to hand
whoever owns it than seven closed-but-broken tickets.

### 13 (continued) · Measured in full, and the counter-argument is now concrete

**The gap, exactly.** Sector D re-ran the distribution and I confirmed it:

    TESTING      1210   closed per CLAUDE.md
    Backlog       174   ┐
    In Progress    11   ├ 188 covered by the prescribed dedup
    Ready           3   ┘
    BLOCKED       184   ┐ 193 invisible
    REVIEW          9   ┘
    ------------------
    non-TESTING bugs 381 — the dedup sees 188 of them

`REVIEW` is excluded too. Smaller, same hole.

**BLOCKED is open work — three independent lines, the third decisive.** ALK-2131's behaviour is
live and was measured today. The backend cites that ticket in a code comment while implementing
half of it. And **ALK-1966, BLOCKED since 2026-07-23 and untouched since 2026-08-03, describes
behaviour sector D reproduced from scratch this evening without knowing it existed.** A status
holding tickets whose defects still reproduce months later is a queue, not a closure.

**Also outside the filter: issue type.** The rule says `issuetype = Bug`. Backlog holds 174 Bugs
and **426 Tasks**. `ALK-3081 [Task/Backlog]` describes a sector A finding verbatim — including
the generic-error consequence — and references the backend PR that created the contract. Plainly
the same work item, entirely outside the prescribed dedup.

**The counter-argument, from sector A, and it is strong.** Every widening suppresses findings,
and suppression is invisible later — a finding killed as a duplicate of a Task nobody converts is
a finding nobody sees. They logged theirs in full with the key so it is recoverable.

**Sector D made it concrete.** Their finding 6 matches `ALK-1966` exactly. That ticket is **100
bytes — a title and nothing else** (a comparable ticket runs 7618). Their version has steps, a
measurement, a verification section, and a half the title does not cover: reminders still arrive
at fixed 30 and 10 minutes *including for a meeting created with `No reminder`*, so there is no
way to turn them off. Suppressing it as a duplicate would replace measured work with a summary.

**They kept it in the report and flagged the overlap in the log — which was the right call**, and
they said why: the rule names its statuses, BLOCKED is not among them, and deleting their own
measured work mid-run on a peer's framing is not theirs to decide. That is the correct instinct
and I want it on the record, because I was the peer applying the pressure.

**Applied meanwhile (safe in both directions):** when a finding is suppressed as a duplicate, log
it in full with the ticket key and what your version has that the ticket lacks; and don't suppress
where the rule doesn't reach.

**Still yours:**
1. Does BLOCKED (and REVIEW) join the standing dedup filter?
2. Does the filter extend past `issuetype = Bug` to Tasks?
3. For ALK-1966 and ALK-2131 specifically: comment with the measured detail rather than file new?

**One more thread for whoever owns it.** The username-in-display_name defect has three BLOCKED
relatives across three services — ALK-1848 (incoming calls), ALK-1838 (call participant/chat
APIs), ALK-1878 (Channel Members). One defect class, three services, all parked, all invisible to
the prescribed dedup.

### 13 (final) · What the two checks actually cost, and why BLOCKED should probably NOT be an auto-suppress

**Outcome across all five sectors, within about an hour of being told:**

    sector D   BUG-13 calendar i18n          withdrawn — sibling duplicate      13 → 12
    sector C   BUG-27 forward attachments    withdrawn — ALK-1982 [BLOCKED]     26 → 25   ← a High
    sector E   #11 workspace ownership       withdrawn — sibling duplicate      15 → 14
    sector A   call.access_revoked candidate not published — ALK-3081 [Task]    (pre-publication)

**Three published findings withdrawn, one of them a High, plus one suppressed before publishing.**
Every one of those dedups had been run correctly against the filter CLAUDE.md prescribes.

**But the sectors also found the argument against auto-suppressing on BLOCKED.** Sector E
re-deduped all fourteen findings against the 184 and reported three whose behaviour is now
**correct**:

    ALK-1954  role.manage shown as a raw key      fixed today
    ALK-2141  Security offers Enable AND Disable  fixed today — only Enable is shown
    ALK-2241  Deactivate enabled for a stub       fixed today — disabled, "Not available yet"

Sector A adds ALK-1917 (disabled call chat left composer active) — also BLOCKED, also fixed.

So **BLOCKED is unreliable in both directions, exactly like TESTING**: it holds live defects
(ALK-1966, reproduced from scratch months after it was parked; ALK-2131, measured today) *and*
behaviour that has since been fixed. Adding it to the filter as an auto-suppress would kill real
findings against tickets that no longer describe anything.

**My recommendation, for what it is worth:** make BLOCKED and REVIEW part of what you *read*
during dedup, not part of what automatically suppresses. That is what I told the sectors to do
as an interim, and it produced three correct withdrawals without costing anything — because each
sector compared claims rather than statuses.

**Two ticket root causes are now stale**, both discovered by comparing against the live build:
- **ALK-1982** says the backend omits attachments from the forward snapshot. On today's build the
  data *is* on the wire — `forwarded_from.files[]` complete with `preview_url` — and Saved
  Messages, the pinned panel and the thread parent all render it. Only the forward card in a
  channel or DM does not. Backend half fixed; remainder is frontend. Changes owner and size.
- **ALK-1951** says the permission catalogue advertises `workspace.delete` with no API. The
  catalogue no longer does — 9 items, and granting it returns `400 ORG_PERMISSION_UNKNOWN_RESOURCE`.
  Catalogue cleaned, delete API still missing. Second instance of ALK-2357's partial-fix shape.

**Sector E's line is the one to keep for the sibling check:** *the collision is most likely with
the report you are least able to see* — a sibling published earlier the same day shares your
scope, your fixtures and your instincts, and is the least likely to be indexed, because the index
is appended at end-of-run by design.

### 13 · Attribution correction, and the finding that makes the recommendation stronger

**Correction.** I had two sectors swapped for part of this thread. `testing-7d` is **sector E**;
`testing-7f` is **sector D**. The four BLOCKED-but-fixed tickets (ALK-1954, ALK-2141, ALK-2241)
were reported by **sector D**, not sector E — they are admin/security/settings surfaces, which is
sector D's ground. Sector E's re-dedup found exactly one overlap, ALK-1966, and said so. Sector E
caught the error themselves. The evidence and the recommendation are unaffected; the credit was
wrong and is now fixed here and in CHANGES-APPLIED.md.

**And sector C has now closed the argument in the strongest possible way: every status carries
stale entries, in both directions.**

    TESTING    closed   — 7 verified absent           (sector D, item 12)
    BLOCKED    open     — ALK-1966, ALK-2131 live; ALK-1954/2141/2241/1917 fixed
    Backlog    open     — ALK-2905 does not reproduce (sector C, measured tonight)

ALK-2905 is Backlog, not BLOCKED, and its behaviour is correct on today's build — measured with
the badge polled at 1.5 s and the API agreeing (`unread_count: 1`, `last_read_seq: 172`). So the
staleness is not a property of the unusual statuses. **No status is evidence about behaviour.**

That makes the recommendation simpler than "add BLOCKED to the filter" or "leave it out":
**widen what you read, and never let a status decide a withdrawal — only a measurement does.**
Sector C's BUG-27 withdrawal rested on the behaviour reproducing, and they say they would have
withdrawn identically had the ticket been Backlog. That is the right test regardless of which
statuses the filter names.

**A third place staleness hides: the title.** ALK-3088 reads "Shared Voice Message link shows as
an empty message" — it is no longer empty; the card shows channel, author, time and filename. But
its Actual Result still reproduces exactly: no audio player, no duration, no waveform, and the
filename is the raw internal one (`voice-…weba`). **Read by title it looks fixed; read by its
Actual Result it reproduces.** So a ticket can be stale in its status, its cause, or its title,
and only its Actual Result compared against the live build is reliable.

**One consequence worth having for the fix side.** Sector C found the three escaping surfaces are
not one finding: the Mentions page was fixed by `2ab70fd07` (ALK-3435) while the thread-reply
quote and the new-message announcement kept printing the stored body. The product already ran the
experiment — **a fix on one surface demonstrably does not carry.** They kept two findings and put
the cross-reference in each Проверка. The risk there was never a duplicate; it was a fix verified
on one surface and assumed for the others.

## 14 · Review the whole CLAUDE.md diff — 159 lines added today across sessions

**Raised by sector E, and it is a fair flag.** CLAUDE.md's maintenance rule says nothing that
could limit future testing goes in without your explicit approval — propose the diff, wait for a
yes. Several rules landed there today from several sessions, mine included, and **no one has seen
the accumulated set**. `git diff --stat CLAUDE.md` is +159 / −28. Any individual line looked
small; the total does not.

Sector E routed their own proposal here as a diff awaiting a yes rather than writing it. That was
the more careful call than mine, and it is why this item exists.

**What I added in this session, and my own read on each:**

*Widen or add a check — I judged these outside the approval rule:*
1. Enum diff: backend enum vs frontend map is an unchecked contract (Upstream section)
2. Its sink caveat: extract by emission function, not string shape; same-line greps miss struct fields
3. Citation check sharpened: the existence check proves the reader arrives somewhere, not that the
   cited lines show the defect
4. Scrubbing is editing the evidence — re-read every block you touched against its run
5. Log any suppressed duplicate in full with the ticket key and what your version has that it lacks
6. Don't suppress where the rule doesn't reach — an out-of-filter ticket is a log entry, not licence
   to delete measured work mid-run
7. Enumerate fully, filter by meaning, never by position (slicing truncates; portalled controls sit
   where the portal put them)

*Borderline — this one does change what gets reported, and you may want it reverted:*
8. **A report already published for your sector is a dedup target, closer than Jira.** It adds a
   check, but the check exists to suppress. It produced three correct withdrawals today, so I
   believe it earns its place — but by your own "if in doubt, treat it as limiting" I should have
   queued it rather than applied it. Flagging it now rather than leaving you to find it.

**Earlier today, before this session** (from the same accumulated diff, not all mine): read source
at the deployed sha rather than `git pull`; check drift in both directions; zsh `${S}:path` quoting;
the empty-`sed`-range trap; clipping needs a ~24px width guard and an ellipsis check; the offscreen
test has no valid vertical analogue; record `visibilityState` in every sample; verify every citation
exists; the word budget is a structural check, not a style check.

**What I would like from you:** read the diff (`git diff CLAUDE.md`) and say which lines stay. I am
not asking you to re-derive them — every one has a worked example behind it in `PITFALLS.md` or a
session log. The question is only whether the file should carry them, and whether item 8 in
particular should come back out.

**Related size problem, still open from earlier:** `PITFALLS.md` is now 933 lines / 52 KB and
sessions are told to read it at start. I have been folding new entries into existing ones rather
than appending sections, but it is still growing. A consolidation pass around its two organising
principles would likely halve it. Say the word and I will do it.

### 13 (resolved by measurement) · The status was never a signal — full tally

**Sector E settled it by re-running every BLOCKED ticket on their own surfaces against the live
build.** Six of the 184 touch their sector:

    ALK-1967  recurring event shown as non-recurring in details    FIXED
    ALK-2009  organiser cannot delete from the details popover     FIXED
    ALK-1961  Favorites filter labels its scope "My files"         FIXED
    ALK-3069  no way to delete a whole series in one action        REPRODUCES
    ALK-1966  Calendar Reminder preset silently not sent           REPRODUCES
    ALK-1972  Search conversation misses DM messages               REPRODUCES

**Three each way, inside a single sector, with nothing in the ticket distinguishing them.**

**Whole-day tally across every status anyone checked:**

    TESTING   closed   wrong 7 times   behaviour absent despite the fix being "done"
    BLOCKED   open     wrong 3 of 6    sector E, measured; plus 4 more found by sector D
    Backlog   open     wrong once      ALK-2905 does not reproduce

**So the question I originally queued — which statuses belong in the dedup filter — has no good
answer, because the status was never carrying information.** The recommendation is:

1. **Read widely.** BLOCKED, REVIEW and Tasks are all outside the prescribed filter and all
   contain live work. 193 bugs and 426 Backlog Tasks are currently invisible.
2. **Never let a status decide a withdrawal.** Re-run the ticket's Actual Result against the build.
   Every correct withdrawal today rested on the behaviour reproducing, not on the status.
3. **Check the ticket's premise too, not just its behaviour** — staleness hides in the status, the
   stated cause (3 found today) and the title (ALK-3088).

**Bonus: ALK-1972 now has a confirmed cause it did not have.** `Search conversation` in a DM sends
the conversation id as `channel_ids`, while the endpoint declares a separate `dm_ids` parameter:

    &channel_ids=<dmConvId>   total_messages 0     what the client sends
    &dm_ids=<dmConvId>        total_messages 1     is_dm true
    unscoped                  finds it             so it is indexed

Same query, same second, same account. The UI says "No results" purely because the id travels
under the wrong parameter name. Sector E put it in their log rather than their report, since they
enriched an open ticket rather than finding the defect — correct by the existing rule, and it is
the kind of thing worth attaching if ALK-1972 is ever picked up.

### 13 · A fourth stale premise, and the enum diff has a better direction

**ALK-1999** — "API does not support explicitly clearing a meeting password" — **premise no longer
holds.** Sector B's own password evidence shows `GET /meeting/<id>` returning
`password_protected: false` immediately after the host clears it. Fourth stale premise today, after
ALK-1982, ALK-2357 and ALK-1951.

**ALK-2248 reproduces on rc.5** and was measured while checking whether it owned a sector B
finding: admitting a waiter whose page had reloaded put them in `GET /meeting/<id>/participants`
with a `joined_at` and pushed `participant_count` 1→2 while that person still sat on
"READY TO JOIN?". That is its own Фактический результат, on this build.

**The enum diff has a more reliable direction than the one I propagated, and sector B found it.**

I sent it out as "diff what the backend emits against what the frontend maps, and look for unmapped
keys". That direction has a false-positive mode: where a product **deliberately** degrades to a
category label, an unmapped key is the design, not a defect. ALK-2128 documents exactly that for
the post-call Logs tab — "Meeting activity / Participant activity / Recording activity" is what a
healthy tab looks like — so two of sector B's three diff results were correctly **not reported**.

The reverse direction has no such mode. A **frontend branch with no backend producer** is a
shipped, translated string that can never render on any build in any language:

    frontend mapper branches on   "recording.stopped"
    backend emits                 recording.started, recording.stop_requested,
                                  recording.egress_started/ended/updated
    grep -rn 'recording\.stopped' --include='*.go'  ->  0 occurrences

Verified independently. A recorded call's log can never say the recording stopped. Reported Low.

**CLAUDE.md updated** to name both directions and say the reverse one is the reliable signal.

**Also added, from the same message:** an adjacent ticket owns the states its **acceptance criteria**
enumerate, not the whole mechanism — read its Проверка rather than its Проблема. Sector B kept a
finding alive against ALK-2248 that way: same code path, disjoint criteria, so a developer closing
ALK-2248 to its own checklist would never touch theirs. It decides in about a minute and errs
toward keeping the finding.

**Control worth noting:** the diff also pointed at the two lines already covered by ALK-2826, open
since before today. The technique aiming at a known open ticket is a decent sign it aims true.

### 12 · A clean closure, which is what makes the pattern about drift rather than distrust

**ALK-3000 `[FE-WEB][Company] Permission to remove company members cannot be used` — TESTING,
closed, fix present and correct.** Sector D confirmed on the build that `member.kick` alone now
opens Members with its Remove buttons.

That matters for how item 12 should be read. Seven closed-but-absent tickets on their own read as
"the board cannot be trusted". One verified clean closure alongside them makes it a **drift**
pattern: some closures hold, some do not, and the status does not tell you which — which is the
same conclusion item 13 reached from the other end.

**Four states of closure now observed in one day:**

    closed, fix absent         7 tickets (item 12)
    closed, fix present        ALK-3000
    open, behaviour fixed      ALK-3536, ALK-1954, ALK-2141, ALK-2241, ALK-1917, ALK-2905
    open, half fixed           ALK-2131, ALK-1951, ALK-1982

**And ALK-3000 makes sector D's BUG-17 considerably stronger.** `capabilities.ts:105-110`, verified
at the deployed sha:

    // `member.kick` opens the section too (ALK-3000). Its holder was granted a
    // company-member management right that has nowhere else to be used, and
    // hiding the only surface that hosts it left the grant silently inert.

Three lines below, `hasRolesSection` gates on `role.get` alone with no second operand, and
`role.manage` appears nowhere in the file. So the finding is not "two gates are inconsistent" — it
is that **this exact defect was reported, accepted, fixed, and the reasoning written into the file
for the neighbouring permission, and the same treatment stops three lines short.** The team's own
sentence about `member.kick` describes `role.manage` today.

### A thirteenth finding, from verifying a ticket that was fixed

Sector E found this while confirming ALK-2648 is genuinely fixed. The Files card now correctly
reads `Shared by <author>` — and one line below states the file is shared with nobody:

    recipient   shared_with: []                                       context_id: "<channelId>"
    author      shared_with: [{"type":"channel","target_name":"<ch>"}]

Same response carries both the empty list and the channel id. The recipient is looking at that card
*because* the file was shared into a channel.

The positive control is the elegant part: `Shared by` **is** populated for her, which rules out
"the list is scoped to your own shares" — the card describes the file, not the viewer's
relationship to it. Deduped across all four layers; nothing covers it.

**Worth noting as a pattern for the queue:** two of today's findings were discovered while
*verifying that a ticket was fixed* — this one and sector D's BUG-17 via ALK-3000's comment.
Re-verifying closed work is finding new defects at a decent rate, which is an argument for doing it
deliberately rather than incidentally.

### The re-verification argument is better than I framed it

I queued this as "re-verifying *closed* work is finding new defects". Sector E's correction: eleven
of their fifteen were fixed, so the yield has nothing to do with closure state. **Re-verifying any
old ticket puts you on a screen with fresh eyes and a specific claim to test** — which is a far
better prompt than "go test files". The ticket does not need to be closed to do that work.

Two of today's new findings arrived exactly that way: sector E's Files-card defect out of ALK-2648,
sector D's BUG-17 out of the ALK-3000 comment. Neither was being looked for.

If you want one concrete thing out of today's process work, this is my candidate: **give each
session a handful of old tickets on its surfaces to re-verify, regardless of status.** It costs
little, it produced two findings and fifteen status corrections today by accident, and it fixes the
board as a side effect.

### ALK-3104 · reproduces, with a consequence its own text does not state

Sector B found `Call again` after initially concluding it did not exist — it lives on the
call-ended summary overlay, which appears once and is gone.

Having found it, the ticket reproduces, and carries a detail that would change its priority:
**Call again keeps the name and resets everything else.**

    is_private        true  -> false
    requires_approval true  -> false
    mute_on_join      true  -> false
    mic_mode  blocked_all   -> allowed_all

So repeating a private, approval-gated call gives you a public, open one **wearing the same name**.
The ticket lists access among the lost parameters but does not say that out loud, and it is the
part a triager would price the ticket on.

**Also cleared tonight, all measured on this build:**

    ALK-3445  reproduces      Test audio sticks at "Playing…", disabled, stuck at 10 s
    ALK-3375  half-fixed      "1 participant" and single-avatar gone; "Team meeting" as a direct
                              call's title and Join offered to someone already in the call remain
    ALK-2952  does not repro  pre-join screen does not count you
    ALK-3324  does not repro  count drops back within 3 s of leaving and stays there

The only phantom participant count reproducible on this build comes from the ALK-2248 trigger.

### ALK-2972 and ALK-3109 · both reproduce, both with a boundary the ticket lacks

**ALK-2972** reproduces, and the measurement confirms its `[FE-WEB]` label rather than assuming it:

    POST  "description":"<probe text>"     sent
    GET   "description":"<probe text>"     stored and returned
    event card                             never renders it

The response carries the field, so nothing server-side dropped it. That is the narrow-responsible-
boundary form of a confirmed cause — it puts the defect on the frontend without claiming to know
why.

**ALK-3109 (In Progress)** reproduces with a mechanism worth handing to whoever is on it: switching
**All day** on removes the end fields but **keeps `event-start-time` at the clock time the dialog
opened**, and that stale time is what fails "Start time must be in the future". So the bug is
specific to today's date, and **the fix is not the validation rule** — an all-day event should not
be validated against a time-of-day at all.

**Sector E's verification tally across statuses, seventeen tickets on their surfaces:**

    BLOCKED               11 fixed · 3 reproduce · 1 premise-gone
    Backlog + In Progress  2 reproduce

**Fixture leftovers to note:** three `QA-E desc probe` meetings, two with empty descriptions from
the failed attempts. In their inventory.

### 14 · A better destination for some of these lessons than a document

Sector D noticed something about `scripts/permission_matrix.py` that bears on the PITFALLS size
question. Its header warns against reading the gate from the working tree, because the frontend
clone sits on a feature branch, and calls that failure *"a confidently wrong answer (a pre-fix line
that reads exactly like a root cause)"*.

That is one of today's hardest-won lessons — the one that cost a sector an hour this morning —
**encoded as a guardrail inside a tool that applies it automatically**, rather than as prose in a
file someone has to re-read at session start and remember at the right moment.

**That is the better destination for a decent share of `PITFALLS.md`.** A rule in a document is
applied only if the reader recalls it while making the mistake; a rule in a script is applied every
time the script runs. Several of today's entries are mechanically checkable:

    citation verification         a script can check every path and read every cited line
    measurement-block arithmetic  a script can reconcile stated counts against listed items
    sibling-report dedup          a script can list same-sector reports and their finding titles
    visibility / drivability      already in lib.mjs — the gap was documentation, not code
    enumerate with disabled       a helper could return state alongside presence by default

**So a third option on the PITFALLS question**, alongside "consolidate" and "leave it": move what
is mechanically checkable into `scripts/` and `snip/lib.mjs`, and keep the file for the judgement
calls that cannot be automated — which is most of the genuinely valuable half anyway.

I have not done any of this. It is a real design decision about where this project keeps its
knowledge, and it is worth your call rather than mine.

### The permission matrix corroborated all three of sector D's Highs

Run at the deployed sha, a static contract-vs-gate diff independently reproduced all three findings
that a behavioural one-permission-at-a-time sweep had produced:

    [gate-narrower] company.audit.view   -> AuditLog  gate: workspace.audit.view   = BUG-2
    [gate-silent]   company.role.manage  -> Roles     gate: company.role.get       = BUG-17
    [coupled]       Invites gated at workspace, reads company                      = BUG-1

Two independent methods agreeing on three findings is about as strong as corroboration gets, and it
was the matrix's *fourth* row that produced the control described above.

### 14 · Caveat on the tooling option, from the sector whose example argued for it

Sector D added the qualifier that decides whether the third option works:

> The guardrail in `permission_matrix.py` works because it sits in the tool you **must** run to get
> the answer. A check in a script nobody runs is worse than a line in a document, because it reads
> as covered.

So the option is not "move checkable rules into `scripts/`". It is **move them into the path of
work already being done** — into `lib.mjs` helpers that every snippet imports, into the scripts a
session must run anyway, into `jira_cache.py` and `seed.sh` rather than into a new
`check_citations.py` nobody remembers exists.

That materially narrows what can move, and it is the difference between the option working and
making things quietly worse.

### BUG-17's control, corrected — and I had it wrong

I suggested to sector D that the read-only tab returning `GET /workspaces/{ws}/roles → 200`
alongside the full table showed "the data path is fine on both tabs, so the difference is only the
gate". **That is wrong and they caught it before it went anywhere.** The data paths differ:

    holder of workspace.role.get    GET /workspaces/{ws}/roles -> 200 (3 roles)
    holder of company.role.manage   GET /companies/{co}/roles  -> 403

The 403 is *correct* — listing roles is `role.get`, which a `role.manage`-only holder lacks. A
developer could have disproved my version in one request, and it would have taken the finding with
it.

**Their comparison is the apples-to-apples one**: the same grant on two layers, `role.manage`
alone, no read permission, **403 in both cases**:

    workspace.role.manage → "You cannot view roles here — Managing roles in this workspace
      requires the “View workspace roles” permission. Ask a workspace or company administrator."
    company.role.manage   → "Admin access required — You do not have permission to view company
      roles. A company owner or an administrator can grant this access."

Same permission shape, same 403 underneath, and one tab answers what the user was trying to do and
names the missing permission by the label it carries in the role editor. Nothing about the data
path differs between those two, which closes the alternative explanation properly.

The finding now rests on two comparisons: the graceful read-only state showing the section *can*
render degraded, and this one showing the message *can* name the missing grant.

### 13 · FINAL · Twenty verdicts, and the number to carry

Sector E closed their verification pass at twenty tickets across three statuses:

    FIXED (12)        ALK-1967 ALK-2009 ALK-1961 ALK-2143 ALK-2013 ALK-2648
                      ALK-2016 ALK-1962 ALK-2020 ALK-2088 ALK-1591 ALK-3007
    REPRODUCES (7)    ALK-3069 ALK-1966 ALK-1972 ALK-3109 ALK-2972 ALK-3521 ALK-2931
    PREMISE GONE (1)  ALK-1965
    SKIPPED (1)       ALK-2978 — setup, not product; diagnosis recorded

**Their framing, which is better than mine and is the version to use:**

> Not "BLOCKED is stale" but **"the board is 60% stale on a twenty-ticket sample, in every status we
> checked, and the ticket never tells you which"**.

The spread across BLOCKED, Backlog *and* In Progress is what makes it a board-maintenance
observation rather than a complaint about one status — and it means the dedup-filter question I
originally queued was the wrong question throughout.

**The more valuable half: five of the seven live tickets now carry something their ticket does
not.**

    ALK-1972  confirmed cause      the DM id travels as `channel_ids`; `dm_ids` returns the message
    ALK-3109  mechanism            All-day keeps a stale `event-start-time`, and that fails the
                                   future check — so the fix is not the validator
    ALK-2972  narrow boundary      POST sends it, GET returns it, the card never renders it —
                                   `[FE-WEB]` established by measurement rather than assumption
    ALK-3521  precondition proven  blocked state confirmed from `/messaging/users/blocked` in the
    ALK-2931                       same run, because "nothing changed" and "the block never
                                   happened" are otherwise the same observation

That is twenty status corrections and five enriched tickets from a pass nobody scheduled, which is
the concrete argument for the re-verification recommendation above.

### 13 · CLOSED · Twenty-three verdicts, none outstanding

Sector E closed their skip and finished the pass:

    FIXED (13)        REPRODUCES (9)        PREMISE GONE (1)

Thirteen of twenty-three no longer describe the product, across BLOCKED, Backlog and In Progress.
The 60% figure holds at the larger sample.

**Two late enrichments, both of which change what the fix is:**

**ALK-3517** — a blocked account is offered in the meeting picker with `disabled=false` and no
`aria-disabled`, and ends up an attendee with a pending invitation. Blocked state asserted from
`/messaging/users/blocked` in the same run, so "the block never happened" is ruled out.

**ALK-3009** — polled at 200 ms, clicking a share target produces **three toasts simultaneously**:
*"Sharing a profile card is not supported yet. Nothing was sent."* **twice**, plus *"Could not share
the profile. Try again."* At six seconds the misleading one is the only one left. So the feature is
**deliberately unimplemented**, and the remaining work is to remove an error path and a duplicate
toast — not to make sharing work. The ticket describes only the second message.

That one is the polling rule paying for itself: a single sample after the action would have caught
the "Could not share" toast alone and produced a completely different, wrong ticket.

**Their self-audit against the leftover-state rule is the part worth imitating.** Three failed
probes had left state — an RSVP changed pending→accepted, two meetings with empty descriptions,
month-view switches. All recorded rather than inherited. The RSVP one sat **beneath a published
finding**, so they re-ran that finding rather than assume the leftover was harmless. It held from
either RSVP state, which strengthened it: the dead buttons are the missing `my_status`, not "you
already answered".

**Also filed as sector knowledge** (`scripts/callrig/SELECTORS.md`, new calendar section): week view
uses `calendar-event-chip`, month view uses `calendar-month-event-chip`. The wrong one returns zero
elements rather than an error, which reads as "the month grid renders no chips at all" — a silent
zero that cost this sector a skip.

### Twice today the product stated two incompatible things about one state

Worth one line to whoever triages both, because they are the same defect shape in two areas and a
fix for either would probably not find the other.

**ALK-3009** (profile share) — polled at 200 ms, one click produces **three** toasts at once:
*"Sharing a profile card is not supported yet. Nothing was sent."* twice, plus *"Could not share the
profile. Try again."* At six seconds the misleading one is the only survivor.

**ALK-3002** (`Shared with me`) — a genuinely empty scope, measured on visible leaves only, shows
**"No files here"** *and* **"Nothing matches this filter yet."** simultaneously, with no filter
applied. Control: the same scope with one file in it shows neither.

In both cases the screen asserts two states that cannot both be true, and in both the *wrong* one is
the more prominent or the more durable. A user reading either would take an action that does not
help — retry a share that is not implemented, or clear a filter that is not set.

Not proposing anything; it is two open tickets with a common shape, and whoever picks up one should
know the other exists.

**A third candidate was checked and killed, which is why the pair is trustworthy.** Sector E had
recorded an archived channel showing the onboarding copy beside its archived banner, and had begun
treating it as a third instance. Re-measured on visible leaves:

    "Start this channel" / "Add teammates before…"     opacity 0.00   NOT visible
    "This channel is archived" / "Unarchive to send…"  opacity 1      visible
    main.innerText contains both sets                  true

Same faded layer as Saved Messages, different screen. **The app handles the archived case
correctly**, and the note was a second instance of that sector's own `innerText` artifact, made
before the instrument was distrusted. Their reason for flagging it: a pattern with one bad member
invites a reader to discount the good ones, and this would have been the easiest to check and the
first to fall.

So the pattern is **exactly two**, both measured on visible elements with controls.

Not proposing anything; it is two open tickets with a common shape, and whoever picks up one should
know the other exists.

## 15 · Where knowledge has to live — two experiments that ran themselves tonight

These two arrived independently, hours apart, from different sectors. Together they are the clearest
evidence this project has produced about `PITFALLS.md`, CLAUDE.md and the tooling question.

**The positive case (sector D).** `scripts/permission_matrix.py` carries a header warning against
reading the gate from the working tree, because the frontend clone sits on a feature branch — *"a
confidently wrong answer (a pre-fix line that reads exactly like a root cause)"*. That is a
hard-won lesson **sitting inside the tool you must run to get the answer**. It worked. The sector
that would otherwise have hit that trap did not.

**The control (sector E).** They found that one of their findings' repro steps did not produce
everything its measurement block showed — a real gap, fixed. The rule against exactly that has been
in **`CLAUDE.md:135` all along**, with a worked example naming **`custom_status.text`** — the same
field their gap involved:

> Everything visible in the measurement block must be produced by the steps above it… One report's
> block showed a `custom_status.text` value its own repro steps never told the reader to set.

The gap still shipped through **two full re-verifications, a coherence check and a prose review**,
and was caught only when that sector independently reinvented the check. A rule in prose, with a
near-identical example, in a file read at session start, did not fire at the moment it was needed.

**So the two options are not equivalent.** Prose documents what we learned; a check in the path of
work applies it. Everything mechanically checkable that stays in prose is being stored, not used.

That is the argument for the tooling option in item 14, with sector D's qualifier attached: it must
go **into the path of work already being done**, never into a new script nobody runs.

**What I would build, if you want it** — each into something a session already runs, not a new tool:
- `Проверка` guard verification and repro-step completeness: a checklist the report template itself
  carries, since the report is written every time.
- Citation verification and measurement-block arithmetic: one pass over the report HTML, invoked by
  whatever a session runs before publishing.
- Sibling-report dedup: a line in the same pass — `ls reports/aloqa-*qa-<date>-*.html`.

Not built. Your call, and it is the one decision from today that would change how future sessions
work rather than what they know.

**The control (sector E) — WITHDRAWN. I could not establish the premise and the sector caught it.**

I claimed the repro-completeness rule at `CLAUDE.md:135` was "unchanged since before tonight" and
had been in the file that sector read at session start. **I cannot show that.** What is checkable:

    in HEAD                                   no — the whole reporting section is uncommitted
    recorded in CHANGES-APPLIED.md            no entry by anyone
    added by me in the current context window no — my edits this window are all other rules
    present at that sector's 14:40 start      UNKNOWN

Most likely I added it myself earlier today, before this context window. If so the case is not "a
documented rule failed to fire" — it is two sessions deriving the same rule hours apart, which is
mild evidence that such rules are *discoverable*, and arguably points the opposite way.

The sector raised it against their own interest: the withdrawn version flattered their pass by
making them the discoverer of something new. Their words — *"I would rather this be right than be
flattering to my own pass."*

Left in with its original wording struck rather than deleted, so nobody reconstructs it:

**THE CONTROL IS RESTORED, on much better evidence — supplied by the sector that demolished the
first version.**

Their Display settings probe reported "panel did not open" on every route and key combination. The
cause: the panel is an `<aside>`, not `[role=dialog]`. **That fact was already in their own log, at
17:50, as withdrawal #5 of the same pass, in those words.** They re-made the identical mistake on
the identical control four hours after recording it themselves.

Unlike the CLAUDE.md case I withdrew, nothing here is unverifiable: the record is dated, it is
theirs, it is in the same document they were working from, and it did not protect them.

**And they immediately narrowed it, before I could over-claim on their behalf.** What it strictly
establishes is that *one* session did not re-read *its own* log before writing a probe — one
control, one lapse. It does **not** establish that documentation-in-a-file generally fails to fire.

**The honest reading is about retrieval timing, not about whether writing things down works** — and
the distinction decides what gets built. If the problem is retrieval timing, the fix is making the
relevant three lines reachable at probe-writing time. If the problem were "prose does not work", the
fix would be something much larger, and this case does not support that.

**The negative case sits right beside the positive one and belongs here for symmetry.** The
`<aside>` fact in that log is exactly what let them recover: their probe reported "panel did not
open on any route", they grepped their own log, found withdrawal #5, and had the answer in one
command. **The file failed to prevent the error and succeeded at ending it inside two minutes.**

Their fair statement, which is the one to act on:

> A pitfall file read at session start and appended to all day will not stop you re-making a
> recorded mistake, but it will cut the recovery from an investigation to a grep — which is most of
> the value, and is an argument for making it **searchable at the point of use** rather than for
> replacing it.

**With that restored, what survives:** Sector D's positive case
stands on its own: a guardrail inside a tool that must be run did prevent a known trap. There is no
matching negative, so the honest claim is "a check in the path of work demonstrably worked once",
not "prose demonstrably fails".

### My opening ticket analysis was overstated — correction for the record

At the start of this session I gave a table splitting seven TESTING tickets by whether a fix commit
existed in the deployed build, and read **"0 commits" as "no fix was made"**. That inference does
not hold.

Sector E verified four more tickets on today's build: **none of the four has a commit referencing it
in deployed history, and two of the four no longer reproduce.** So a commit grep establishes whether
a ticket is *referenced*, not whether it is *fixed* — fixes land under other ticket ids, inside
refactors, or as side effects.

**The failure has two independent halves and only one is the branch problem** (sector E's tightening):

1. `git log --all --grep=` searched a tree without the deployed build, so those empties were not
   answering the question at all. Fixed by searching from the sha.
2. **Even from the correct tree, "no commit references ALK-N" does not mean ALK-N is unfixed.** Two
   verified non-reproducers have zero referencing commits in *deployed* history.

My 400-of-400 calibration is strong evidence that work carries an ALK id — which is exactly why the
inference is tempting — but it licenses **"referenced ⇒ worked on"**, not **"unreferenced ⇒
untouched"**. Fixes ride along in commits titled for another ticket, and some tickets were never
reproducible as written.

**What still stands from that table:** ALK-2965 and ALK-1663 have fix commits *in* the deployed
build and their behaviour is absent — that direction is unaffected, because the commit is evidence
of presence rather than of absence. ALK-618 having a commit that landed after the deployed build
also stands.

**What does not:** ALK-2806, ALK-1805 and ALK-2801 were described as "no fix commit exists →
moved to TESTING without a corresponding change". The correct statement is that no commit
*references* them, which says nothing about whether they were fixed. Their behaviour was verified
absent independently, so the findings hold; only the causal story does not.

**Consequence for anyone building a staleness metric:** it cannot rest on commit greps in either
direction. The 60%-stale figure in item 13 is safe — it comes from re-running behaviour, not from
commit archaeology.

### ALK-2850 is a design task sitting in the bug count

*"заменить … согласно приложенному reference image"* — verifying it can only ever confirm that
unbuilt UI is unbuilt. Worth retyping as a Story rather than leaving it to inflate the bug count and
any staleness measure taken over it.

### 13 · Revised staleness figure — ~44% on the larger sample, not 60%

Sector E's dataset closed at **34 tickets**: 15 no longer reproduce, 16 reproduce, 2 premise
gone/moved, 1 measured-passing. That is **~44%**, not the 60% I reported earlier from their
twenty-ticket sample. Use the lower figure.

Their own caveats, which belong with it: it is one sector's reach in one night, and **ALK-2850 sits
in the "reproduces" column while being a design task** ("заменить … согласно приложенному reference
image") — verifying it can only ever confirm that unbuilt UI is unbuilt.

The qualitative conclusion is unchanged and is what matters: the staleness is spread across every
status checked, and nothing in a ticket distinguishes the stale from the live.

### ALK-3316 is closable; the question it asks has migrated to ALK-3242

The ticket asks whether a 0.05 margin over AA is intended. Both tokens have since moved —
`--c-fg-muted` darkened `#666d7c`→`#525a6a`, `--c-bg-subtle` lightened `#eef0f4`→`#f2f4f7`:

                           ticket said        today            floor
    ALK-3316 neutral badge  4.552 / 4.788     6.291 / 6.788    4.5
    ALK-3498 success tint   2.896 / 4.526     2.896 / 4.526    3.0
    ALK-3242 fg-subtle      —                 4.713 / 4.799    4.5

Measured live off `documentElement` with alpha composited **and** cross-checked against `theme.css`
at the deploy sha; both routes agree exactly. Margin is now 1.79/2.29, so **ALK-3316 is closable on
these numbers**.

But `#666d7c` — the exact value ALK-3316 names as the old fg-muted — is now `--c-fg-subtle` at
4.713, so **the thin-margin question is real and belongs to ALK-3242**, which ALK-3316 itself names
as "the same question for `--c-fg-subtle`". ALK-3498 matches to three decimals and is untouched.

**Worth knowing for the guard-verification thread:** ALK-3316's guard test recomputes from
`theme.css` rather than pinning numbers, so nothing failed when the values moved. The guard worked
exactly as designed — and that is precisely why the ticket text went stale silently. **A guard test
keeps the code honest, not the prose.**

### 14 · One rule a sector deliberately did not write, and why you should see it separately

Sector C measured that **browser-offline and failed-request are different code paths** in this app,
found their own published repro step ("оборвать сеть") sends a reader down the wrong one, and then
**declined to edit CLAUDE.md themselves** — citing that there is no user at the keyboard, that I am
actively editing the file tonight, and that a method line is worth a human's yes. They proposed it
in their end-of-run summary instead and left it as mine to take.

**I took it**, because it is the same category as the ~15 method lines already added tonight and it
prevents a demonstrated failure (a ticket returned as not-reproducible because the reader broke the
network the other way). But their instinct is the one this file's own maintenance rule describes,
and I have added ~15 lines tonight on a standing authorisation while they stopped at one.

Flagging it here rather than burying it in the list, so you can see the contrast when you review the
diff. If you tighten anything about how CLAUDE.md gets edited, their judgement is the model, not
mine.

The rule itself:

    context.setOffline(true)                     browser KNOWS it is offline
      → "Waiting for network…", send queues and delivers on reconnect

    page.route('**/…', r => r.abort('failed'))   browser still believes it is online
      → "Network error. Check your connection." / "Could not send the message. Try again."
        / "The server rejected this file"

Same action, same channel, same account, opposite branches.

### A finding that exists only because a run crossed midnight

**`Day` view opens on the UTC date rather than the user's.** At 00:38 local (Asia/Tashkent), local
date 2026-08-27, UTC still 2026-08-26:

    cold load -> Day     "WEDNESDAY 26 August 2026"    yesterday
    click Today          "THURSDAY 27 August 2026"     correct
    three cold loads, same result

**Demonstrated rather than correlated** — CDP timezone override at the same instant:

    Asia/Tashkent     local 08-27  UTC 08-26   Day -> 26 Aug   diverges
    Europe/London     local 08-26  UTC 08-26   Day -> 26 Aug   agrees
    America/New_York  local 08-26  UTC 08-26   Day -> 26 Aug   agrees

**Control:** on the same load the rest of the calendar is right — week marks the Thursday column,
`New meeting` defaults to `2026-08-27`. So it is the Day view specifically, not "the app runs in UTC".

**Cause, verified at the deploy sha:** `apps/web/app/w/[wsId]/calendar/page.tsx:24` is
`const initialFocusDate = toLocalDateString(new Date())`, in a file whose line 15 comment reads
*"page is a thin async server shell"*; `packages/features/calendar/date.ts:3-8` builds the string
from `getFullYear`/`getMonth`/`getDate` — the executing runtime's zone, UTC on the server. Every
element of that citation checked.

**The team already tests the adjacent case:** `CalendarView.test.tsx` has *"hydrates the server week
when the browser store starts on the next local day"*, clock at `2026-08-09T23:30:00.000Z` with
`TZ=Asia/Tashkent`. The divergence is understood and covered — for the view that cannot show it.

Rated **Medium**: wrong data, but the wrong date is labelled plainly and `Today` fixes it in one click.

**The transferable half, now in CLAUDE.md:** this class is systematically under-found because the
team runs on +05, so local and UTC dates disagree only between local midnight and 05:00. A daytime
timebox never crosses it. The mitigation is not to wait for the hour but to override the zone —
`Emulation.setTimezoneOverride` — and to compare zones that agree against one that diverges at the
same instant.

**Note on the artifact:** that sector is publish-capped (`429 frame_daily_push_cap_reached`), so
their published report is still the 13-finding version and this is the 14th. Retry after 05:00; they
will say explicitly if it fails rather than let the link look current.

### 14 · Most of tonight's rules have never been watched fail

Sector E gave `scripts/verify_report.py` a negative control — reconstructed the bug that had
destroyed one of their findings, ran it, and confirmed three independent checks fire. Their
statement of the principle:

> **A guard nobody has watched fail is a guard nobody has tested.**

That is the finding-5 problem applied to a tool: a checker that has only ever passed cannot
distinguish its hypothesis from the opposite.

**Applied honestly to my own night: I added roughly twenty rules to CLAUDE.md and tested almost
none of them against the failure it exists for.** They are each derived from a real failure that a
sector measured, which is better than invention — but "derived from a real failure" and "verified to
catch that failure" are different claims, and only the first is true of nearly all of them.

The exceptions, which were tested: `verify_report.py` (theirs, negative-controlled), and the
citation path check, which sectors ran against their own reports and which found real defects.

I am not proposing to go back and test twenty rules at this hour. But when you review the diff in
item 14, that is the honest status: **evidence-derived, not failure-tested.** If any of them are
worth hardening, the ones that would repay it are the ones a script could carry — which is item 15's
question, and `verify_report.py` is now the worked example of what that looks like.

## 18 · Chat backlog verified on the deployed build — 8 close candidates, 10 confirmed

Sector C spent the quiet hours re-verifying the chat backlog on `v0-61-0-rc-5-c4b5386b4a3a`, by
measurement rather than by reading the ticket.

**Do not reproduce — close candidates:**

    ALK-3495  scroll-to-bottom button hides correctly by both routes
    ALK-3001  duplicate channel name IS flagged — red border, aria-invalid="true", explicit message
    ALK-2995  last member gets a specific message, not a generic one
    ALK-3507  Unpin in Saved Messages exists and works end to end, survives reload
    ALK-3580  thread-reply notification DOES open the thread — URL gains ?thread=<parent>
    ALK-2848  channel keeps its sidebar position after its last unread is read
    ALK-2994  long channel name does not push out header controls (desktop width only)
    ALK-3088  the shared-voice-link half does not reproduce — working player, not an empty message

**Confirmed, with detail that changes the fix:**

    ALK-3021  the status node's text literally begins with a slash: " / Status: Online"
    ALK-2807  named entities decode on render; the numeric one survives ONLY because the client
              escapes the '#'. A fix aimed at the visible case leaves the other kind live.
    ALK-2936  no "open profile" on a saved copy of someone else's message — the button DOES exist
              on your own, which is the contrast that makes it a finding
    ALK-3018  archived channel still offers Add selected (enabled); toast says only "Could not add
              selected members" while the server already returns ORG_CHANNEL_ARCHIVED
    ALK-3019  forwarded card shows @username — same resolver as their Copy-text finding, one fix
    ALK-3534  preview card repeats the domain — caveat: measured with example.com, which serves no
              OG tags, so "adds nothing" is proven only for that case
    ALK-2772  confirmed including its stated cause — the archived-channels response carries no
              activity/archive fields at all (keys filtered, empty)
    ALK-2843  the waveform is NEVER drawn, not merely "before playback" — nothing wider than 60px
              at 0/1.5/3/5 s. Fixing to the ticket's wording would mean drawing something earlier;
              there is nothing to draw. A working current/total timer is shown instead.

Three of those change what the fix is rather than confirming the ticket, which is the more valuable
half: ALK-2807 (two kinds, not one), ALK-2843 (the ticket's wording points at the wrong fix), and
ALK-3534's caveat, which stops a reviewer killing the finding on a case it never claimed.

## 19 · ALK-3538 is in doubt, and the same symptom has been closed three times before

**`ALK-3538 [BE][SEARCH] Глобальный поиск не находит людей и каналы`** was filed from this morning's
pass. Its premise — «обе вкладки всегда показывают ноль» — **is false on this build.**

**The cause is our own fixtures.** `seed_qa_fixtures.py` writes straight to Postgres. The OpenSearch
indices are fed by Kafka from the services (`search-service/internal/infrastructure/kafka/consumer.go`,
`channel_upserted` → `IndexChannel`) and there is **no CDC on that path** — I verified the seeder
contains zero kafka/opensearch references. Nothing seeded is ever indexed.

**The tell that settles it:** querying `qa-arch` returns a channel that does **not** contain that
string (app-created, therefore indexed) and misses the one that contains it exactly (seeded).
Channels are returned and rendered end to end when they exist in the index.

**The same symptom has been filed and closed three times before — ALK-421, ALK-1401, ALK-1592.**
That is the part worth acting on: this is a recurring false positive with a fixture cause, and it
will be filed a fifth time unless the cause is recorded where a tester will see it. It is now in
CLAUDE.md's fixtures section.

**Half of it is unsettled.** Sector E left a permanent control in lane E — channel
`e-search-control`, created through the UI — so the Channels bucket is testable. **The People bucket
has no control at all**, because every fixture account is seeded. Settling whether people search
works needs a user registered through the app, which is the signup carve-out.

**Your decisions:** whether ALK-3538 should be withdrawn or amended, and whether the fixture
limitation is worth a seeder change (posting the Kafka events, or creating fixtures through the API)
rather than a documented caveat.

### An invitee cannot RSVP at all — unfiled, and it will look like a client bug

`POST /calendar/meetings/<id>/respond` returns **`404 REALTIME_SCHEDULED_ATTENDEE_NOT_FOUND`** while
the meetings list reports that same user as `my_status: "pending"`. The attendee row **is** present
in `realtime_db.scheduled_event_attendees`, so it is not a fixture gap.

Flagged because anyone testing calendar invitations will read it as a frontend defect and it is not
one. Nothing filed — that is your call.

## 20 · A rule a sector drafted and deliberately did not write — theirs to propose, yours to accept

Sector C measured that the sidebar channel list *does* reorder by activity, having earlier reported
that it does not — they had been sending from the same browser they were watching, and a channel
does not raise itself for your own message.

**They drafted the rule and declined to add it**, asking explicitly that I not add it on their
behalf either. Their reasoning, which is the correct reading of this file's own maintenance section:

> A CLAUDE.md change needs the user's explicit approval — show the diff, wait for a yes — and a peer
> session's agreement is not that approval, however obviously right the line is. **A line that five
> of us silently agreed on has no owner and no record of who decided it.**

They also noted the line is a *measurement method*, not a constraint on what may be tested, so the
rule they are following is deliberately stricter than the risk requires.

**Their draft, for you to accept or reject:**

> You cannot observe a self-suppressing UI's response to your own action from the acting client.
> Actor and observer must be different accounts in different browsers, with the observer parked
> where it should not be looking.

**The method claim stands alone and the example is deliberately not in it.** The behaviour
underneath turned out to be two-sided: a channel does not raise itself for your own *message*, but a
file you share into a chat **does** raise it, by design — `af01859a5 fix(files): move a chat up the
sidebar when a file is shared into it (ALK-3017)`, verified as an ancestor of the deployed sha.
Quoting only the first half is what produced the over-broad retraction in the first place, so the
rule quotes neither. Positive control for the method, if one is wanted: incoming activity from
another account raises both channels and DMs live in 13–15 s.

**And the honest comparison, which belongs with item 14.** Sector C has now twice declined to write
a method line — this one and the network-mechanism rule earlier. **I have added roughly twenty-five
tonight on a standing authorisation.** Their reading is stricter and better defended than mine. If
you tighten anything about how this file is edited, theirs is the model; if you do not, item 14's
diff is the accumulated result of mine.

**Their own narrowing, offered unprompted, and it is better than either of our formulations:**

> The test is not whether a line is a constraint, it is **whether the file will show who decided
> it.** That is cheap to satisfy when you are drafting anyway, and it is the part that does not
> depend on how much time is left.

They also declined the credit I gave them: both lines were drafted after their sector was closed and
published, with hours left and nothing riding on them. *"Declining costs nothing when there is time
to route it properly. Fifteen already in and a deadline in front of you is a different decision."*
That is fair and it is the honest version of the comparison in item 14.

I have not written their line, and I am not writing it.

## 21 · Two rules drafted tonight, neither written — following sector C's standard

Both are measurement methods rather than constraints, and both came from a sector's own withdrawal.
Queued rather than written, credited, for you to accept or reject.

**From sector D, withdrawing their own twentieth finding:**

> **A matrix proves which conditions are required, not that requiring them is wrong.** Five states
> measured cleanly, with the reverse direction, establish that a section needs both `privacy.manage`
> and `role.get` — and say nothing about whether needing them is a defect. A restriction that is
> role-based by definition needs role names to render; a company-scope right over whether staff may
> wall themselves off from colleagues is a policy. The rigour of the enumeration is not evidence
> about the proposition.

**I reinforced the wrong finding rather than catching it.** I praised the five-state matrix as
"what makes it a strong finding" and singled out the `catalog.go` comment as the ALK-3000 shape —
the team's own words describing what the code does not do. It is not: *«свои ограничения»* describes
*whose* restrictions they are, not who may grant them, and the code matches. The sector withdrew it
against my argument, not with it.

**From the same withdrawal, and it is the fourth instance tonight:**

> **Grep your own log for the screen's name before publishing a finding about it.**

They went bottom-up from the permission catalogue to the screen; the same screen was already in
their log at line 561, recorded top-down, with the identical matrix and the **opposite** conclusion
— plus two halves this hour's pass never re-ran (the restriction working end to end, and
`privacy.bypass` letting a granted account through). `grep -n 'Messaging' logs/*.md` would have cost
one call.

**Four instances of one shape tonight**, which is the strongest evidence in the file for item 15:

    sector E   rediscovered their own search finding hours after logging it
    sector E   re-made a documented `<aside>` mistake four hours after recording it
    sector D   published a finding contradicting their own earlier verified-working note
    me         carried a sector's published count forward through two messages while it changed

**All four are the same failure: correct earlier work, not consulted.** Not one was caught by a
rule, a checker, or a re-run. Three were caught by accident and one by a peer.

## 22 · A CLAUDE.md diff a sector wrote and deliberately did not apply — it is a limiting line

Sector E drafted this and routed it here rather than writing it, on the grounds that **it tells a
future session a technique does not work**, which is exactly what the file's hard rule covers.

    -   `page.context().setOffline(true)` fails every request; … WebSocket behaviour under
    -   `setOffline` is unverified.
    +   `page.context().setOffline(true)` fails every request and flips `navigator.onLine`, but does
    +   **not** close an already-open WebSocket — measured over 20 s with the constructor instrumented.
    +   A realtime connection therefore survives it, so this cannot be used to test connection status.

**Their own reasoning for routing it, which is the careful part:** it *completes* a sentence already
in the file — "WebSocket behaviour under `setOffline` is unverified" — so it is arguably filling a
documented gap rather than adding a constraint. **But it still says a method does not work**, so
they did not write it. That distinction between *unverified* and *does not work* is the right one.

**The measurement, if it helps you decide.** With the `WebSocket` constructor instrumented before
app load:

    setOffline(true), 20 s   socket stayed open the whole time — open 1, closed 0
                             navigator.onLine went false
                             no banner appeared — correctly, nothing had disconnected

    socket closed from inside the page instead
                             "Reconnecting…" within 1 s, a replacement socket,
                             banner cleared by 2 s

**So the app's reconnection behaviour is good and the technique is what is broken.** That half is a
verified-working result and is in HANDOFF; only the "cannot be used" clause needs your yes.

**Caveat that travels with it:** `page.routeWebSocket` never fired for them, most likely because
their own `addInitScript` wrapper and Playwright's interception both instrument the constructor —
apparently mutually exclusive, pick one per run. They stopped after three attempts rather than
grinding, which is the documented practice.

**This is the fifth rule routed to you rather than written tonight** (items 20, 21 ×2, and this).
Three sectors have now independently applied a stricter reading of the maintenance rule than I was
using for the first twenty-five.

### 19 (companion) · The fixture guest is not a guest, and it is the same shape as the search gap

`seed_qa_fixtures.py:139` — `WORKSPACE_MEMBERS = [k for k in UID if k != "qa_outsider"]` — puts
**everyone except the outsider** into workspace membership, `qa_guest` included. So that account
carries workspace Member permissions on top of `is_guest = true`: it holds
`workspace.<ws>.channel.create` and can create channels.

**Guest restrictions cannot be tested on it**, and a permissions finding against it measures our own
fixture. One sector nearly filed exactly that before checking the seeder. Verified at line 139.

**I wrote the limiting half into CLAUDE.md and have taken it back out.** Sector E pointed out —
politely, while routing their own diff here — that if my edit added the guest fact, it was mine to
own. They were right: *"guest restrictions do not reproduce on that account"* is a "not testable"
line scoped to an account, and the file's own rule says treat borderline as limiting.

**What is in CLAUDE.md now is the fixture fact only**: `qa.*.guest` holds workspace Member
membership as well as `is_guest = true`, per line 139. **What is queued is the consequence** — that
guest restrictions cannot be tested on it, and that a permissions finding against it measures the
fixture. Same split I applied to sector E's `setOffline` diff and had not applied to my own.

Recorded here alongside the search-indexing gap, because it is the same shape: **a fixture property that produces defect-shaped behaviour with no defect behind it.**

**Your decision, same as item 19's:** whether the seeder should be changed — a guest that is a
workspace member but *not* a Member-role holder — or whether this stays a documented caveat. The
two gaps together suggest the fixtures were built to make accounts *work* rather than to make their
*limits* observable, which is a design question rather than a bug.

### 21 (third) · A check tuned for one failure mode stopped covering its neighbour

From sector C, after `verify_report.py` found six defects their own checker could not:

> I compared the first 34 characters of row and title — deliberately, to catch rows falling out of
> order after an insertion, which it does catch. **But a prefix comparison is blind to drift past
> the prefix, which is precisely where wording rot accumulates.** A check tuned to catch one failure
> mode quietly stopped covering the neighbouring one.

The six: lost guillemets in one row, «ответы недостижимы» against «ответы становятся недостижимы» in
another, and two rows simply shorter than their titles. Nothing misleading, and nothing with a
reason to differ. Full-string comparison is the correct one; all six now word-for-word.

Queued rather than written, with the others.

### 15 (sharpened) · The claim about `verify_report.py`, corrected by the sector I over-credited

I wrote that the checker "caught six defects in another sector's report". Sector C corrected the
credit, and their version is narrower and much harder to argue with:

> It is the only artifact from tonight that was **corrected on evidence from outside its author**,
> **verified afterwards that the correction cost nothing**, and **then found real defects in a file
> its author had never seen.**

**The sequence is what matters, and most of it was not theirs.** Before sector E made it
layout-agnostic, the same checker reported `rows=0` and thirty tag mismatches on that same file —
sector C says they would have been entitled to ignore it, which is precisely how a checker dies.
What turned it into a tool: a false-positive report from outside, a fix that **skips with a stated
reason instead of failing**, and a self-test re-run proving 11/11 steps still catch their own
failure.

Sector C supplied one failure case. Sector E did the work.

**That is the shape to look for if you approve the tooling option** — not "someone wrote a script",
but a script that survived contact with a file its author had never seen, and whose author proved
the accommodation cost nothing.

### 21 (fourth) · The operational form of both fixture gaps

Sector C's, narrower than my framing and more usable:

> **Any finding about what a user should NOT be able to do gets checked against the seed, not only
> against the product.**

That covers both gaps found this morning — the guest carrying Member permissions, and seeded records
never reaching the search index — and it is the rule that would have caught either before a report.
Two sectors nearly filed against the stand on unrelated surfaces within hours.

They also narrowed the prefix-comparison lesson: **a maintenance failure, not a design failure, and
the sort that survives review because the check keeps passing.**

Queued rather than written, with the others.

### 21 (fifth) · The mirror: a near-miss false NEGATIVE, and the direction that matters

From sector C, re-verifying a published Medium. Their first run said it **no longer reproduces** —
composer intact, text preserved, nothing lost. They had pressed Escape to clear the suggestion list;
Escape moves focus out of the composer, so the Enter went nowhere. Without Escape it reproduces
exactly: Enter one replaces the composer with the emoticon and the text is gone, Enter two sends
only the emoticon.

**CORRECTED — the single-clause version is dangerous and I recorded it first.** I wrote this as
"suspect the check, not the fix", which is exactly the half-rule that would start a session
dismissing real inert-control defects. The correct statement is a pair:

> **Prove the input landed. Only then does absence of effect mean anything — and then it means it in
> both directions.**

**The mirror case arrived within two hours**, from the same sector: in an archived channel the
message menu still offers Edit, and choosing it does nothing — no edit mode, no Save changes, no
toast. **Click instrumented, click landed, nothing happened. That is a published defect and it
reproduces.**

    same symptom, three times in two hours
      Escape blurred the composer            input never landed  → broken check
      text locator missed an icon-only button input never landed  → broken check
      Edit in an archived channel            input LANDED        → real defect

**What separates them is not judgement or suspicion. It is one fact: whether the input was proven to
land.** With proof, absence of effect is product behaviour. Without it, it is your probe. Both of
that sector's Highs are inert-control findings and would have been lost to the half-version.

**It is the inert-control work run backwards.** There, no request meant the product was broken.
Here, no request meant the test was broken. What separates them is whether the action was supposed
to produce anything at all — and the only way to tell is to have proved the input landed, which is
the discipline this group applied to clicks all night and nobody applied to a keypress.

**Their point about direction is the reason it matters more than its siblings:**

> A false positive gets caught at triage by a developer who cannot reproduce it. **A false negative
> silently deletes a real finding from a report, and nobody ever looks for it again.**

Every other rule tonight guards the first direction. This is the only one that guards the second.

**It fired again within the hour, on a different finding with a different cause — and that changes
what it is.** Re-verifying the Dismiss-preview finding, the first run reported nothing at all: card
still there, no request, no change. Under the old habit that is "does not reproduce" and a live
Medium quietly leaves the report. Instead they applied the rule, instrumented the click, and found
the locator had never matched — they searched by text and the button's name exists only in
`aria-label`. With the click proven to land, the finding reproduces exactly.

    instance 1   Escape blurred the composer             keypress never landed
    instance 2   text locator missed an icon-only button click never landed
                 → identical symptom, different causes

**So it is not a caution, it is a cheap routine check.** Their reframing:

> When a re-verification comes back negative, look first at whether anything happened at all, before
> looking at the product.

**The symptom is diagnostic on its own without knowing why.** One glance, and it has saved two
published findings in an hour.

### 15 (final) · The strongest instance, and it defeats the obvious fix

**The fact that would have prevented it was already filed, in the right place, by the sector that
then hit it.** `scripts/callrig/SELECTORS.md:90`:

> **`Escape` on the mention suggestion blurs the composer** — the next `Enter` sends nothing. Type a
> space instead, which is what the product's own flow does.

They measured it on mentions earlier tonight, reported it to me, I filed it in the shared lookup
file — and hours later they hit the identical behaviour on slash commands and read it as a fix.

**That is the fifth instance of one shape tonight and by far the most complete**, because the
obvious remedies were all already in place: it was measured, it was written down, it was written
down *in the file designed for exactly this lookup*, and it was written down **by the person who
needed it**. None of that put it in front of them at the moment a probe was being written.

    sector E   rediscovered their own search finding hours after logging it
    sector E   re-made a documented `<aside>` mistake four hours after recording it
    sector D   published a finding contradicting their own earlier verified-working note
    me         carried a published count forward through two messages while it changed
    sector C   hit a trap they had measured, reported, and had filed in SELECTORS.md

**This is the case to weigh item 15 on.** "Write it down better" is already exhausted here.
.

### 15 (the answer, possibly) · A symptom-triggered rule beats a lookup-triggered one

Sector C on why `SELECTORS.md:90` did not save them, and it is worse than I described:

> I did not just write that line, I wrote it **after being caught by the same behaviour, specifically
> so it would be there next time.** It was there. I did not read it, because I was not looking
> anything up — I was writing a probe and reached for Escape as an obvious way to clear a suggestion
> list.

> **Documentation only helps at the moment you go looking, and nothing about writing a probe makes
> you go looking.**

**And then the conclusion that is actually actionable**, which is better than the tooling answer I
had been building toward:

> Which is why the general symptom rule beats another entry in the lookup file: **it does not
> require me to have suspected anything in advance.**

That reframes item 15. The question is not only *where* knowledge lives — a file, a script, a
helper — but **what triggers it**. A lookup entry fires when you think to look something up, which
is exactly when you already suspect the problem. A symptom rule fires on something you will observe
anyway: *the re-verification came back negative and nothing happened at all.* No suspicion required.

**Both of tonight's saves came from a symptom rule, not from a lookup entry** — and the lookup entry
for the first one existed, in the right file, written by the person it failed.

**So the shape worth preferring, if you act on item 15 at all:** rules keyed to symptoms a session
will encounter regardless of what they suspect, over facts a session must know to go looking for.
`verify_report.py` is the same shape in tool form — it fires because you run it before publishing,
not because you suspected a substitution.

### 15 (refinement) · A symptom rule needs its discriminator shipped with it

Sector C's addition, which sharpens the triggering answer rather than replacing it:

> A symptom rule fires on something you will see anyway — but **a symptom with two opposite readings
> is worse than no rule at all unless the discriminator ships with it.**

"Nothing happened" is exactly such a symptom: it read as a broken check twice and a real defect once
in the same two hours. The rule is only usable because the discriminator — *was the input proven to
land* — travels with it and is mechanical.

**`verify_report.py` has the same property**, and it is why it works rather than merely fires: every
check it makes is one where the discriminator is mechanical. Duplicate titles, row-versus-article
correspondence, counts, bare citation paths — none of them requires a judgement about whether the
result means something.

**So the shape for item 15 is now three-part**, not two:

    trigger        keyed to a symptom a session encounters anyway, not a topic they must look up
    discriminator  mechanical, and shipped with the rule — a symptom with two readings needs it
    direction      states what it means in BOTH directions, or it will be applied as half a rule

**And the operational test for the middle one, from the sector that supplied the whole thing:**

> Every check that saved me tonight had a mechanical discriminator sitting next to it — a
> capture-phase listener, a request log, an opacity product up the ancestor chain. **The ones that
> cost me time were the ones where I was the discriminator.**

That is applicable in advance, which the rest of this item is not. Before relying on a check, ask
whether the thing separating its two readings is a mechanism or a person.

## 23 · Two findings in two reports that must be fixed together, or the second reads as a regression

Found by sector E deduping their 22 against the morning pass's five. **No duplicates — but two
findings interact in a way neither report can see, because each is correct in isolation.**

    morning report, finding 2   GET /calendar/meetings/{id} omits `attendees` for an invitee
                                → "Participant list unavailable"

    sector E, finding 2         the same response also omits `my_status`, so the client falls to a
                                legacy branch and looks the user up in `attendees` — the field the
                                other finding documents as absent
                                → both RSVP buttons disabled

**Fix the morning one alone** and sector E's looks half-fixed while the user still cannot RSVP: the
buttons come alive, and `POST /respond` still returns 404. **The symptom moves from "buttons are
dead" to "buttons throw an error", which reads like a regression rather than a partial fix** — and
the person who fixed it will reasonably believe they broke something.

Two defects, two fixes, and they need to land together or in the right order. Neither report can
state this, because each finding is complete and correct on its own.

**Worth carrying into whichever ticket gets filed first.** Both are in sector E's session log with
the measurements; nothing was merged into either report, since dedup adjacencies belong in the log
and the report stays bugs-only.

### 19 (companion) · The morning report needs the same caveat

`reports/aloqa-workspace-qa-2026-08-26-E.html` finding 1 —
*"[BE][SEARCH] Глобальный поиск не находит людей и каналы"* — **states as product behaviour
something that is at least partly our seeder.** The Channels half is contradicted by one
measurement: a UI-created channel *is* returned; a seeded one is not.

**If that report reaches you alongside the current five, this caveat should travel with it.** Same
root cause as ALK-3538, already queued as item 19.

**The People half remains unsettled and cannot be settled from that sector**: it needs an account
registered through the app, and signup belongs to sector D — whose box closes at 09:00. Worth
knowing that the carve-out exists in CLAUDE.md (signup testing may create an account, marked and
logged under Cleanup), so this is answerable by whoever picks it up next rather than blocked.

## 24 · A task that needs you, not a carve-out — settling the People half of the search question

The morning report's search finding cannot be settled without **an account registered through the
app**, because every fixture account is seeded and seeded accounts never reach the index.

I pointed sector D at CLAUDE.md's signup carve-out. **They declined, and their reasoning is right:**

> Creating an account and typing a password into a form are things I don't do — that has held all
> run. **A carve-out in CLAUDE.md doesn't move that line, and a peer pointing at a carve-out isn't
> the authorization that would.**

That is the correct boundary and I should not have offered it as though it settled anything. The
carve-out is your instruction, written down — but a peer citing it at another session is not the
same as you asking for it, and the conservative reading is theirs.

**So this is an open item for you rather than an unfinished task.** Settling whether people search
works needs either a human to create the account, or you to tell a session to. It is the last
unanswered piece of items 19 and 23.

**The same boundary explains three other gaps in their run**, all held consistently: they skipped
the guest census rather than sign in, and finding 15's recipient half and finding 17's steps 3–4 are
marked as measured earlier rather than re-run.

**Both sectors declined, on the same grounds, and sector E named what I was doing:**

> Asking a peer to do something I won't is the same act with an extra step, and the project
> permitting them doesn't change what it would make me. **If it turns out they can't or won't
> either, the right answer is that it stays in the handover — not that we keep passing it around
> until someone accepts it.**

I had offered it to sector D on my own initiative before either of them raised the constraint. The
outcome was right and the principle was not mine — **passing a task between peers until one accepts
it is laundering by rotation**, and it looks like diligence while it is happening.

Sector E also corrected their own reason: CLAUDE.md line 265 *does* carry the carve-out, so the
project is not what stops them. The actual reason sits outside the repo and does not bend for a
project file. **That correction changes nothing about the outcome and matters anyway** — otherwise
someone goes off to amend a project rule that would achieve nothing.

**So: this needs you. It is not blocked on anyone's diligence.**

### 21 (sixth) · An audit tool that parses the artifact manufactures the error class it hunts

Sector D's citation audit came back clean — 13 of 13 frontend paths resolve at the deployed sha, all
11 line-numbered citations read verbatim, backend confirmed on `origin/main`. **The near-miss on the
way is the contribution, and it inverts every other instrument failure tonight.**

Mid-audit, their extraction reported that finding 14 cites
`apps/web/src/features/settings/admin/hooks/useAdminDirectInviteRow.ts:107`, and that no such file
exists at the sha. **True — no such file exists.** They had the edit half-written.

What the report actually cites is `apps/web/src/features/admin/hooks/useAdminDirectInviteRow.ts:107`
— correct, and line 107 is exactly the claimed ternary. A few lines away sits a legitimate
`apps/web/src/features/settings/admin/hooks/useAdminMembersSettingsPanel.ts`, which really does live
under `settings/`. **A greedy regex had welded the two into a path that never existed.**

    every other instrument failure tonight   a wrong claim about real data
    this one                                 a wrong FIX to correct data,
                                             reached through a genuine-looking verification

> **An audit tool that reads the artifact through a regex is itself a source of the error class it
> hunts.**

**The remedy is one command**: grep the literal string in the report file before acting on what an
extraction says the report contains.

**Time-relevant when it arrived**: every sector was running extraction scripts over their own reports
at that hour. Their own count — *the fifth false result from my own instrumentation tonight, and the
first that would have damaged correct data rather than just wasted time.*

Queued rather than written, with the others.

### 21 (seventh) · The baseline row is the discriminator, and a false negative feels like good news

From sector E's final finding, where **both rig errors on the way pointed the friendly direction**:

    Network.setBlockedURLs is per-CDP-session and evaporated when drive.mjs detached
      → the client was never offline → "catches up perfectly", measuring nothing

    the other account's create beat the observer's page load, so the meeting arrived in the
    initial HTTP fetch
      → "visible while blocked" → reads as NO DEFECT

> **A false negative feels like good news and nothing about it feels wrong.**

**Only the baseline row caught either one** — a value that should have been absent and was not.
That is the sharpest statement anyone reached tonight of why the pre-action scan matters: it is not
context, it is **the discriminator**, and without it both of those runs read as clean passes.

### 21 (eighth) · The shape all five of one sector's self-corrections shared

> True of what I measured, written as though true in general.

Their fifth was four minutes after publishing: they wrote *"stays stale until you reload"* having
measured a reload healing it and nothing cheaper. **A view switch heals it too.** The corrected
version is stronger — the refetch path exists and works, so the defect is precisely that
reconnection is not wired to it.

Five self-corrections in one run, all the same shape. Worth stating because it is not a carelessness
failure: every one was a true sentence about a real measurement, generalised one step further than
the measurement licensed.

### A planning note: a parked browser is a resource that returns

Their 23rd finding was only reachable because the 416-minute long-session test ended at 07:46,
freeing the one browser without a WebSocket wrapper of its own. **The last untested item in their
handover became testable with an hour to go.** Worth knowing when planning a long box — a browser
committed to a soak is not gone, it is scheduled.

### 22 (companion) · A second rig fact routed rather than written, same sector

`Network.setBlockedURLs` is **per-CDP-session** and evaporates when `drive.mjs` detaches. A block set
in one drive call is not in force during the next, and the client is simply online — which produced
a "catches up perfectly" result measuring nothing.

Routed rather than written for the same reason as item 22's `setOffline` diff: it tells a future
session that a technique does not hold across calls.

### 21 (ninth) · An inconclusive verdict with time on the clock is a task, not a conclusion

Sector E logged a Files probe as inconclusive at 08:16 — **correctly**, and nearly stopped there.
Fixing the probe took eight minutes and **turned a single-surface finding into a systemic one.**

Their probe had two defects, both ordinary: the file list is a virtualised `virtuoso` list so a
`tbody tr` selector could never match, and the observing account's default tab is `My files`, where
a file shared into a channel correctly never appears.

> The lesson is not "don't log things as inconclusive". It is that **an inconclusive verdict with
> time still on the clock is a task, not a conclusion.**

### 21 (tenth) · The state indicator belongs in the same row as the measurement

Three invalid setups before one valid Files run, **all failing differently and all producing
confident, result-shaped output:**

    the block died with the CDP session          → client never offline
    the second account acted before the baseline → data arrived in the initial fetch
    the block was applied AFTER the socket opened → setBlockedURLs does not close an open
                                                    connection, it only blocks new ones

**All three were caught by the connection indicator sampled in the same row as the measurement.
None was caught by the measurement itself.** That is the baseline lesson at its sharpest: the state
you are assuming has to be recorded *beside* the number, not established once beforehand.

### 22 (companion, second) · `setBlockedURLs` does not close an open connection

It blocks new connections only. A block applied after the socket is open leaves the client fully
connected while every indicator you would think to check says the block is in force. Routed rather
than written, with the `setOffline` diff and the per-CDP-session note.

---

## 2026-08-27 — from the verification tooling

### 26 · Twelve findings are right about a real bug and wrong in a detail

The reverify pass flagged twelve where the defect holds but something beside it does not: a count, a
quoted string, a title claiming more than the measurement shows. They are listed in the lane logs. None
is filed, so nothing has reached a developer — but the detail is what a developer acts on first, and a
wrong count beside a real finding is how the finding stops being believed.

**Decision:** correct them in place before any of the twelve is filed, or leave them and correct at
filing time. Correcting in place means re-publishing five reports.

### 27 · Lane D's report disagrees with itself in one row

`scripts/verify_report.py` reports a TITLE/ROW MISMATCH on `aloqa-org-qa-2026-08-26-D-2.html`, and lane
D separately flagged one of its own counts as wrong (says 0 interactive elements where 2 were
measured). Pre-existing, not a substitution — but both are in a published report.

**Decision:** fix and republish D, or carry the mismatch.

### 28 · What happens to a priority you change in Review

Re-rating a finding writes to `~/.cache/aloqa-qa/reproducer-state.json` and shows up in
`verifications/verification-<date>.md`. It does **not** touch the report HTML, so a report published
today keeps the old severity for anyone reading it.

**Decision:** whether a judging pass should fold its re-ratings and rewritten «Ожидаемый результат»
back into the reports afterwards. It is a mechanical edit and I can do it, but it rewrites published
documents, so it is yours to say.

### 29 · Real 80% zoom in the rig browsers

The rig page at 100% in a 1440px window shows less than it could. CSS zoom cannot do it — viewport
units do not rescale, so the app paints at 80% inside a full-size window and leaves a band. Real browser
zoom would work and is a Chrome launch flag (`--force-device-scale-factor`), because CDP Emulation
overrides are dropped when the session detaches.

**Decision:** whether to take it. It changes the device scale factor for **every** rig browser, and all
88 snippets were verified at the default, so it wants a re-verification pass behind it.

---

# Resolved while you were away — review, then delete

Queued items that were overtaken by events after being raised. Bodies are verbatim; the answer
sits in the groom note at each head. Per this file's contract these leave the file only once
**you** have seen them — deleting this section after the walkthrough is the intended end state.

> _Groom note (2026-08-29): **resolved by events.** CLAUDE.md, PITFALLS.md, HANDOFF.md, this file,
> CHANGES-APPLIED.md and the `snip/` helpers are all tracked and committed now (first landed in
> `3a1412e` «Add the session knowledge base and rewrite CLAUDE.md around it», 2026-08-27; stray
> session snippets followed on 2026-08-29). Provenance is datable from here forward, which is what
> the item asked for. Bodies below kept verbatim._

## 16 · Nobody can cite CLAUDE.md's provenance, because it is uncommitted

This came out of the argument above and is worth more than the argument was. It is about the repo's
state, not about anyone's reasoning.

    git diff --stat CLAUDE.md    +197 / −28, uncommitted
    several sessions editing it live, all evening

**So "it says X" is checkable and "it said X when you started" is not — for anyone here.** Lines a
session is certain it read at 14:40 are absent from HEAD, and lines added at 22:00 are equally
absent. HEAD cannot distinguish them, and neither can any session.

Consequences beyond tonight's disagreement:

- A session cannot tell whether a rule it is following was in its own briefing or was added by a
  peer mid-run — which matters, because a rule added mid-run may contradict work already done under
  the old wording.
- No finding, ticket or report can honestly cite when a convention took effect.
- The **announce-before-it-lands** convention for shared helpers has no equivalent for CLAUDE.md,
  and CLAUDE.md changed far more today than any helper did.

**The fix is to commit it**, which is yours — this repo's convention is that I commit only when
asked, and I have not. A commit now would date everything from here forward, which is most of the
value; it would not recover today's provenance.

Until then the honest rule is: **cite CLAUDE.md's contents, never its history.**

Worth noting `PITFALLS.md` (958 lines), `HANDOFF.md`, `DECISIONS-PENDING.md` and
`CHANGES-APPLIED.md` are in the same state.

**Precision, at that sector's insistence:** they did not establish that I was wrong, only that git
cannot settle it — a weaker result. Absence from HEAD proves nothing about the working copy, since
lines they are certain they read at 14:40 are also absent from HEAD. The claim is **unverifiable**,
not refuted. If those lines are ever dated, it may be recoverable.

### 16 · A worked example — a session tested the wrong screen because the doc changed under it

Sector E reported that `/settings/profile` and `/settings/calls` are missing from CLAUDE.md's route
list. I grepped the current file, found both present, and nearly told them they were wrong.

    HEAD:     settings/{account|privacy|sessions|appearance|notifications|about}
    current:  settings/{…|profile|calls|security|company|workspace|roles}

**The list was extended today.** The copy that sector started with almost certainly lacked both, so
their first attempt tested `/settings/account` and would have answered ALK-3522 wrongly. Neither of
us can date the change.

That is item 16 in concrete form: it has now cost a wrong route, a wrong test, and very nearly a
wrong correction from me on top. Committing the file would not recover today's history but would
stop this from here.

### 16 · Untracked shared files cannot be audited after the fact

Sector E's observation, from tonight's helper-edit disclosure, and it is a property of the repo
rather than of anyone's diligence:

`snip/lib.mjs` is tracked, so `git diff --stat` settled the question in one command — 238
insertions, 0 deletions, nothing existing could behave differently. **`snip/api.mjs` is untracked,
so the same question has no answer.** The best available evidence is my own inspection of a file I
edited, which is exactly the evidence nobody should have to accept.

The rest of `snip/` is in the same state, as are `PITFALLS.md`, `HANDOFF.md`,
`DECISIONS-PENDING.md` and `CHANGES-APPLIED.md`.

**This is the same fix as the item-16 provenance problem, for a different reason**: committing makes
the shared surface auditable, both for "what changed" and "when". It would not recover today's
history either way.

**The stronger argument for the announce rule, also theirs:** they were unaffected because zero of
their 554 snippets import the shared helpers — but they wrote their own fragments on day one for
unrelated reasons. *"I was isolated by luck, not by design."* A session that had sensibly used the
shared helpers would now hold measurements straddling an unannounced change, **with the mtime as the
only signal, and only if they thought to look.**

> _Groom note (2026-08-29): **resolved on 2026-08-27** — the cap was a daily quota and reset
> (sector B's publish went through at 06:43; the item's final block below records it). Current
> artifact state per report is whatever `reports/README.md` records; the per-report URL list below
> is still the way to update one in place._

## 17 · The Artifact publish cap is holding back three sectors' reports

`Artifact` is returning `429 frame_daily_push_cap_reached`. Confirmed across three sectors, each of
whose **published artifact now lags their local report**:

    sector B   published 11   local 12   the seat leak is the unpublished one
    sector C   published 26   local 25   includes a finding they WITHDREW
    sector D   published 17   local 18   plus four local-only additions
    sector E   published 13   local 15

**Four sectors, not three** — I told sector D theirs was the only current artifact and was wrong;
they hit the same cap after three attempts and the tool told them to stop.

Sector D's gap in detail, since theirs is the largest: finding #18 (unsaved changes in settings
forms discarded on navigation *and* reload, no warning, while the product itself shows "1 unsaved
change" and no `beforeunload` handler is registered) exists only on disk. Four smaller additions are
also local-only — a triage note on #2 pre-empting "the company audit page isn't built yet, that's
ALK-3307", cross-references to another sector on #6 and #8, a note on #14 that the misleading string
is identical in all four dictionaries so the fix is eight strings rather than one, and a footer
correction understating 2FA coverage.

**None of it changes a measurement, a cause or a repro path** — the published subsets are complete
and correct as published. It is the headline counts that differ, which is the kind of mismatch that
makes a reader distrust the whole set.

**Their suggestion, which is the efficient one:** whoever gets a working publish first should
publish their own file at the same `url` and say so, rather than five sectors independently
re-testing whether the cap has lifted.

**Sector C's is the one that matters**: their artifact currently shows a withdrawn finding as live.
That is the failure direction that costs someone — a developer could pick up a High that its author
has already retracted.

All three are handling it correctly: noted prominently in their logs, retrying after 05:00, and each
said they will state explicitly if the retry fails rather than let a link look current.

**Nothing is lost** — the local report sources under `reports/` are correct and current. This is a
publishing-quota problem, not a data problem.

**Nothing needed from you unless you want a different route.** The options if the cap persists past
their boxes closing: leave the artifacts stale with the local files as the record, or have one
session publish a consolidated report once quota returns. I have not chosen — it depends whether
anyone reads the artifacts before you do.

### 17 · Everything you need to publish these yourself, in one action each

The local report sources are all current. Three of five have their artifact URL recorded, so
updating them in place is one `Artifact` call each with `url` set:

    reports/aloqa-chat-qa-2026-08-26-C-2.html        25   .../artifact/881e4cdc-5484-4cc9-b172-273dbf0e6392
    reports/aloqa-org-qa-2026-08-26-D-2.html         18   .../artifact/064c01ce-baeb-4af1-b456-a0c8c71efa7f
    reports/aloqa-calls-inside-qa-2026-08-26-A.html   9   .../artifact/7b7b4e84-6001-403f-a293-62c7799aa46a
    reports/aloqa-calls-around-qa-2026-08-26-B.html  12   no URL row yet — publishes as new
    reports/aloqa-workspace-qa-2026-08-26-E-2.html   15   no URL row yet — publishes as new

**The chat one is the one to do first if you do only one.** Its published artifact currently shows a
**withdrawn High** as live — a backend finding that does not reproduce, with nothing on the page
saying so. Sector C's framing, which is the right tiebreak: *the other sectors' artifacts are
behind; mine is wrong.*

They have mitigated it everywhere a reader might land — the `reports/README.md` row now flags the
withdrawal in its first sentence, before the historical text, and their log's `## Current state`
block leads with it.

**Why nobody is retrying.** Sector C's Artifact tool has escalated past a plain 429: after the
fourth attempt it refused with an instruction to stop sending the same call and surface the failure
rather than retry. That is the tool working correctly, and it means blind probing is off the table
for at least that sector. Their plan is the disciplined one — if another sector reports a *success*,
that is new information rather than a blind retry, and they will make exactly one attempt on the
back of it.

I have not attempted a publish on anyone's behalf. The tool has signalled to stop and surface, and
these are their artifacts.

### 17 · RESOLVED — the cap was a daily quota and has reset

Sector B retried at **06:43**, after three consecutive `429 frame_daily_push_cap_reached` between
00:26 and 01:47, and it went through on the first attempt. Their report is now complete at the
published URL: 12 findings, 2 High / 7 Medium / 3 Low, seat leak included, no local-only delta.

**So it was a rolling daily quota, not a failure.** All four remaining sectors told immediately,
each with their own current gap:

    sector C   26 published / 30 local   — and the published one still shows a WITHDRAWN High
    sector D   17 published / 19 local   — hard deadline 09:00
    sector E   13 published / 21 local   — the largest gap
    sector A   9 local, publish state unknown — never reported a gap

**Nothing needed from you on this** unless a sector's box closes before it publishes; the local
sources under `reports/` are correct either way and item 17 above still lists the URLs for
one-call publishing.

**The infrastructure note worth keeping**, in sector B's framing: five sectors hit the same cap
within hours of each other on a day when everyone published repeatedly, and it cleared on its own.
It is a daily quota and the mitigation is to retry later — **the tool's error text does not say
so**, which is why three sectors treated it as terminal and one escalated to a hard refusal. That
is the only actionable part: the error is accurate but not informative.

> _Groom note (2026-08-29): **both fixes applied during grooming** — the blank line splitting the
> table is gone and line 15's stray `|` (in `role=status\|alert`) is escaped; the table renders as
> one again. The item's own text said «safe to fix once the boxes close», which they long since
> have. Kept for the pipe-counting lesson._

## 25 · Two housekeeping items in `reports/README.md`, safe to fix once the boxes close

**Line 19 is a stray blank line inside the reports table**, splitting it in two — verified. Rows
20–23, which are today's second-pass reports, therefore do not render as a table. A one-line
deletion fixes it.

**Nobody has fixed it mid-run and that is correct**: sessions are still appending rows, and a
concurrent write to a shared file is worse than a cosmetic defect. Sector E flagged it rather than
reformatting under other sessions' feet, and added their row to the second block for consistency.
Safe to fix after 09:00.

**Line 15 has a live instance of the same trap** — verified, and it is the only other row in the
table with a wrong pipe count:

    line 15   5 pipes, should be 4
              `aloqa-incall-qa-2026-08-26-A.html`  (sector A, an earlier hourly session)
              stray pipe inside:  `role=status|alert`

That row renders with a phantom column from `alert` onward. **A raw `|` splits a Markdown cell even
inside backticks.** Count pipes before appending — four for a three-column row. Any row quoting a
regex or an alternation is exposed; a sector caught `department|position` in their own draft the
same way.

**Nobody fixed line 15 either, and the sector who found it said why explicitly:**

> It's someone else's row, sessions are still appending, and a concurrent write is a worse outcome
> than a cosmetic rendering defect. That's the identical reasoning I gave for leaving the line-19
> blank alone. **Making an exception for the defect I happened to find myself would have been the
> same decision reached two different ways — and that's the kind of inconsistency that's invisible
> from inside.**

Both are one-line fixes, both safe after 09:00.
