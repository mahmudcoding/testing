# AIRION QA — 2026-08-26 — lane B — verification pass over `aloqa-calls-qa-2026-08-26-B.html`

Target report: `reports/aloqa-calls-qa-2026-08-26-B.html`
Artifact: https://claude.ai/code/artifact/c1dca9c9-546c-442a-b3f9-07e128a28126
Original session log: `logs/AIRION-QA-2026-08-26-B-calls.md` (present, full provenance)

Report build: `v0-61-0-rc-3-15da3ead76e1` (tag `v0.61.0-rc.3`, FE commit `15da3ead76e1`)
Verify build: `v0-61-0-rc-4-b117816aa788` (tag `v0.61.0-rc.4`, FE commit `b117816aa788`)

## Build range — 7 commits (`15da3ead76e1..b117816aa788`)

```
b117816aa chore(staging): admit v0.61.0-rc.4 from develop
3d54dcafb docs(calls): record why a pin cannot raise video quality (#2797)
4e6684042 chore(tooling): stop format:check reading built Storybook (ALK-3496) (#2799)
5fae0c222 fix(release): reset staging and its host before a new train's rc.1 (ALK-3201) (#2784)
95a7026d2 fix(calls): keep side-room occupants in the main call and badge them by focus (ALK-3479) (#2783)
7cd290506 perf(web): publish the current normalized baseline (ALK-3421) (#2794)
4fc8e7c39 refactor(ui): give empty, error and notice states two primitives (ALK-3464)
```

Only one commit touches a surface any of the three findings live on:
`4fc8e7c39` rewrites `apps/web/src/features/guest-entry/GuestApprovalNotice.tsx` — the guest
"waiting to be let in" notice of BUG-1. The diff is **purely presentational**: hand-built
`<Text as="p" className="…border…bg-info-bg…">` replaced by the new `<StateBanner tone="info">`
primitive. No control added, no handler, no props beyond `title`/`tone`. So it cannot close BUG-1.

Nothing in the range touches meeting settings / password (BUG-2) or the call activity log (BUG-3).
`95a7026d2` is side rooms only (sector A's area).

**Backend:** no build stamp is exposed for the backend, so its revision cannot be pinned. Relevant
to BUG-3, whose event labels may originate server-side — noted in that finding's verdict.

## Current state

All three findings re-tested on `v0.61.0-rc.4`. Verdicts below. Report corrected and republished
to the original URL.

## Findings under verification

| # | severity | area | claim | verdict |
|---|---|---|---|---|
| BUG-1 | Medium | frontend | Guest on "Waiting for approval" has 0 interactive elements; signed-in member on the same screen gets `Cancel request` + `Back to workspace` | **CONFIRMED** |
| BUG-2 | Medium | frontend | Host cannot see the call password they set — field empty, `Show password` reveals nothing (password itself not lost) | **CONFIRMED**, one detail corrected |
| BUG-3 | Low | frontend | Call `Logs` labels admit/deny as `Participant activity` and the knock as `Other call activity` | **CONFIRMED, wrong cause** — admit/deny are not logged **at all**; relabelled `[backend]`, severity raised to Medium |

Browsers: alice 9232 (host), bob 9233 (signed-in joiner), guest 9238 (anonymous, `auth/me` → 401).
dave 9235 was launched and left signed out — not needed in the end, see BUG-2.

Two calls were used: `QA verify admit` (BUG-1, BUG-2, first log read) and `QA verify log`
(clean controlled log reproduction for BUG-3). Both ended.

---

## BUG-1 — CONFIRMED

Reproduced twice on `v0.61.0-rc.4`, on two different entry paths of the same call.

**Run 1 — public call, `Wait for admission`, no password.** Anonymous browser (`GET /api/v1/auth/me`
→ **401**) opens the host's invite link, types a name, presses `Ask to join`. Polled at 300 ms from
**before** the click, uncapped, 83 frames over 25 s. Enumeration selector was
`button, a, [role=button], [role=link], input, select, summary, textarea, [tabindex]:not([tabindex="-1"])`,
with visibility taken over the whole ancestor chain (`display`, `visibility`, cumulative `opacity`):

```
screen                                   total   visible                    hidden
name entry                                 2     [name input, Ask to join]   []
"Joining…" (transient, 0.0 s)              2     [name input, Joining…]      []
"Waiting for approval"  (0.3 s → 25.0 s)   0     []                          []
```

`total: 0` is the count of matching nodes in the whole document, not a filtered subset — there is
nothing hidden behind an `opacity:0` wrapper either.

**Run 2 — same call after the host added a password, `Require approval to join` still on.** Guest
re-entered through `Request to join again`, typed name + password, `Ask to join`:

```
"Waiting for approval"   total: 0   visible: []   hidden: []
```

**Comparison with a signed-in member, same call, same waiting state** (Bob, `qa.b.bob`):

```
"Waiting for host approval — You can join after a host admits you from the waiting room."
total: 26   visible includes: Cancel request, Back to workspace
            (plus the whole workspace chrome: Chat, Calls, Calendar, Files, Search, sidebar channels)
```

**Neighbouring guest states still have controls**, so the empty screen is an omission rather than a
policy of giving guests no controls:

```
name entry            2  [name input, Ask to join]
name + password       3  [name input, password input, Ask to join]
wrong password        3  same, plus visible "Incorrect password" text
request declined      1  [Request to join again]
waiting for approval  0  []
```

**Host side confirms the request is still queued** while the guest has no way to withdraw it:
`WAITING (2)` with `Admit VerifyGuest1` / `Deny VerifyGuest1` / `Admit QA Bob` / `Deny QA Bob`.

`4fc8e7c39` (in range) rewrites this very component, `GuestApprovalNotice.tsx`, but only swaps a
hand-built `<Text as="p" className="…">` for `<StateBanner title tone="info">`. Presentation only —
consistent with the finding still reproducing.

Report description is accurate. One wording nit fixed in Phase 5: the state table's first row said
the name screen offers `Continue`; on a call without a password the button reads `Ask to join`, and
`Continue` only appears in the two-step (password) variant.

## BUG-2 — CONFIRMED, one supporting detail corrected

**Setup.** Host in the call → `Meeting settings` → `Password protection` on → typed `Verify456`
(9 chars, confirmed `len: 9` in the field before saving) → `Save`.
`GET /api/v1/meetings/current` → `password_protected: true`.

**Measurement, twice, each on a freshly loaded page** (full `page.goto` of the call URL, then open
`Meeting settings`) — identical both times:

```
Password protection switch : aria-checked = "true"
password field             : type="password"  value=""  length 0  placeholder "Enter a password"
button next to it          : "Show password"
after pressing it          : type="text"      value=""  length 0   button becomes "Hide password"
GET /api/v1/meetings/current  ->  only key matching /pass/i is  password_protected: true
```

The password is never sent to the client, so there is nothing for `Show password` to reveal.

**The password is genuinely in force — the defect is display-only.** Proven with someone who had
never entered it: the anonymous guest, re-requesting entry after the password was added, was shown
`Meeting password (private meetings only)`, refused with `WrongPass1` (`Incorrect password`), and
accepted with `Verify456` (advanced to the waiting screen). So the host cannot read a password that
is demonstrably still gating the call.

**Correction to the original write-up.** The report said "`Save` with the field empty does not clear
the password". That describes an action the UI does not allow — `Save` is disabled whenever the
password field is empty:

```
field untouched (empty)        Save disabled = true
type "ZZZ"        (len 3)      Save disabled = false
backspace to empty (len 0)     Save disabled = true
toggling an unrelated switch ("Mute participants on entry") does not enable it either
```

So an empty field can never be submitted; that is *why* the stored password survives, not a
property of pressing `Save`. Same conclusion, accurate mechanism. Both the Фактический результат
sentence and Проверка item 2 (which asked a developer to press a button that is disabled) were
rewritten.

## BUG-3 — CONFIRMED as a user-visible fact, but the described cause is wrong

The headline claim reproduces: **the call log does not say who was admitted or who was refused.**
The mechanism in the report does not.

**Call 1 (`QA verify admit`)** — the shape the original session saw. UI `Logs 25`, filters
`All 25 / People 9 / Meeting 16` (self-consistent). `GET /api/v1/meeting/{id}/events?limit=100`
returns exactly the same 25 rows the tab renders, with a machine-readable `event_type` on each:

```
event_type               n    rendered in the Logs tab as
participant.joined       3    "<name> joined the call"            <- named
participant.left         3    "<name> left the call"              <- named
meeting.started          1    "Meeting started"                   <- named
meeting.ended            1    "Meeting ended for everyone"        <- named
track.published          6    "Media activity"                    <- generic
track.unpublished        6    "Media activity"                    <- generic
participant.reconnected  3    "Participant activity  By QA Alice" <- generic
guest.waiting            2    "Other call activity  By <guest>"   <- generic
```

The report read the three `Participant activity By <host>` rows as the host's admit and deny
decisions. **They are not.** They are `participant.reconnected` — and they line up exactly with the
three times I reloaded the host's page during that call (07:04:45, 07:05:57, 07:09:05 UTC = the
three `page.goto` calls in this session). The host's three real decisions in that call — one deny,
two admits — produced no event of any type.

**Call 2 (`QA verify log`) — clean controlled reproduction, no page reloads at all.** One signed-in
joiner, whose full journey was: knock → **denied by host** → knock again → **admitted by host** →
joined → left. The entire log:

```
API GET /api/v1/meeting/V4OWE208I6GA6OU/events?limit=100   ->  10 events
07:12:38  meeting.started        -
07:12:38  participant.joined     <host>
07:12:38  track.published        <host>
07:13:48  participant.joined     <joiner>      <- his admitted entry, nothing before it
07:13:49  track.published        <joiner>
07:13:59  participant.left       <joiner>
07:13:59  participant.left       <host>
07:13:59  track.unpublished      <joiner>
07:13:59  track.unpublished      <host>
07:13:59  meeting.ended          -

UI Logs tab: All 10 / People 4 / Meeting 6 — the same 10 rows, none generic beyond "Media activity"
page text contains "request": false   "admit": false   "deny": false   "waiting": false
```

Two join requests, one refusal and one admission left **zero** trace. So the defect is not generic
wording for admissions — admissions are not recorded at all. Only a *guest's* knock produces an
event (`guest.waiting`), and that one does get a generic label.

**Consequences for the write-up**, all applied in Phase 5:

- Cause rewritten: the admission workflow is absent from the log, and separately `guest.waiting`
  renders under a generic label.
- The measurement block was misattributed (`Participant activity … <- впуск гостя`) and has been
  replaced with the clean call-2 measurement, which needs no interpretation.
- Area label `[frontend]` → **`[backend]`**: the events are never emitted. The generic rendering of
  `guest.waiting` is a secondary frontend copy gap and is now stated as such inside the finding.
- Severity `Low` → **Medium**: `Low` was chosen when this looked like a copy problem. Missing
  records in a surface titled "Activity recorded during this call" is not cosmetic.

## Method notes — rig artifacts caught before they became verdicts

- **A stale modal made the password field untouchable.** The first BUG-2 attempt failed with
  "backdrop intercepts pointer events". The cause was mine: the `Add to call` invite dialog from the
  BUG-1 setup was still open, so the `Meeting settings` panel underneath had an
  `aria-hidden="true"` ancestor and `document.elementFromPoint()` at the field's centre returned
  `div.aloqa-modal-backdrop`, not the input. Reloading the page cleared it. Had I read that as
  "the password field cannot be focused", it would have been a fabricated finding.
- **`Meeting settings` is a toggle.** Clicking it while the panel is open closes it; a follow-up
  measurement then reports "no password input", which looks like a missing control.
- The `End for everyone` confirmation must be driven through
  `[data-testid="call-end-confirm-submit"]` — a text match on `/end/i` hits the settings panel,
  which also contains the word.

## Not verified

- `dave` (9235) was launched for a second fresh password-checker and was left signed out. The
  anonymous guest already served that role for BUG-2, so it was not needed. No finding depends on it.
- Backend revision could not be pinned — staging exposes no backend build stamp. BUG-3 is now
  labelled `[backend]` on the basis of the events API returning no admission event, not on a
  source-revision comparison.

## Phase 5/6 — what changed in the report

Nothing removed; all three findings stayed. Numbering unchanged.

- **Header** — added a re-verification paragraph naming `v0.61.0-rc.4`, that all three reproduced,
  and the two corrections (BUG-3's cause/label/severity, BUG-2's `Save` detail).
- **Summary table** — third row retitled and re-chipped `Medium` / `backend`.
- **BUG-1** — state table split into "name only" (`Ask to join`) and "name + password" (`Continue`);
  the old single row claimed `Continue` for both.
- **BUG-2** — Фактический результат now says an empty field cannot be saved (`Save` disabled) rather
  than "Save with an empty field does not clear it"; Проверка item 2 rewritten for the same reason.
- **BUG-3** — rewritten: `[BE][CALLS]` title, `Medium`/`backend`, new Проблема (admission events are
  not recorded), new measurement block from the clean call, new Ожидаемый результат and Проверка,
  and a «Для триажа» block warning that `Participant activity` is `participant.reconnected` and not
  an admission record — the exact trap the original write-up fell into.

Leak grep before publishing (`qa\.*@ | U4Q | C4Q | W4Q | O4Q | V4O | G4O | GL4 | N4O | 92xx |
airion-cargo | fake-device | account display names | channel names | the two passwords`) → **no hits**.
Structure check: 3 `<article>`, divs and `<pre>` balanced.

Republished to the original URL `https://claude.ai/code/artifact/c1dca9c9-546c-442a-b3f9-07e128a28126`
(fetched the live version first — it matched the pre-edit local file, so no other session's changes
were overwritten). `reports/README.md` row updated in place, not appended.

**No ALK tickets created and no comments posted.**
