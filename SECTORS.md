# Test sectors

Scope allocation for parallel QA sessions — **which part of the product a session
covers**. Weights come from `reports/aloqa-module-scope-census.html`
(published: https://claude.ai/code/artifact/9cba3e8e-ffda-4623-9821-14cf0cf9b3f3).

**A sector is not a lane.** A *lane* (`QA_LANE`, `seed.sh --lanes`, `rigmap`) is the
isolated fixture set and browser port block a session runs on. A *sector* is what that
session tests. Sector letters are aligned to lane letters — sector A is meant to run on
lane A — but they are separate things, and a prompt may pair them differently.

**Browsers are capped per lane.** `launch.sh` refuses past the cap and prints the override —
each window costs real memory, and one session taking more than it needs starves the others.
The setup line in each sector below is what that sector actually needs.

**Read your sector's "Owned by other sectors" line before you start, not just its in-scope
list.** One session lost about an hour to Sessions and notification settings before checking
it and finding another sector had already covered all of it that day. The boundary line is
the cheaper half of the section: the in-scope list tells you where to go, the boundary line
tells you where someone else already is.

**There are more lanes than sectors.** Sectors A–E below cover the product for QA passes;
lanes beyond E carry no sector and are free for other work — bugfixes, one-off
investigations, anything needing its own fixtures and browsers. A lane letter with no
sector is not a mistake. Add lanes with `seed/seed.sh --lanes <letters>` and read their
ports with `node scripts/callrig/rigmap.mjs table <letter>`.

Start a session with just the letter:

```bash
/run-until 14:00 A
```

That is the whole instruction — **sector A on lane A**. A hook
(`scripts/hooks/sector_context.py`) reads the letter off the prompt and injects that sector's
section below straight into the session, so the scope never has to be pasted or re-derived;
`CLAUDE.md` says the same thing as a fallback if the hook is not running. Name sector and lane
separately only when they differ:

```bash
/run-until 14:00 sector A on lane C
```

The session then follows **Start of a session** in `CLAUDE.md` (export `QA_LANE`,
verify fixtures, record the build stamp, sync the Jira mirror, open the session log)
and reads its own section below.

**"Owned by sector X" means another session is covering it today**, so you can hand it
off instead of duplicating work — not that the area is untestable. If you find a defect
there while passing through, log it and say which sector it belongs to.

## Choosing what to hit inside your sector

The lists below are boundaries, not checklists. They say where your sector ends, not what
counts as done — and they are **not exhaustive**: a surface that is not named but sits inside
your sector's territory is still yours to test. Nothing here asks for a regression sweep of
the listed features. Pick targets instead:

- **Diff the component map.** `packages/features/<area>/ui-web/` and `apps/web/src/features/<area>/`
  name the real surfaces. Compare against previous passes in `logs/` and go where the coverage
  is thin — that is how the highest-yield session so far chose its scope.
- **Diff the deploy.** The build stamp is a frontend commit, so `git log <deployed>..HEAD`
  over your sector's paths names what changed recently and which ALK ids are waiting.
- **Follow the state, not the screen.** Most of this app's surface is states inside a few
  routes; a surface you have "already tested" in one state is usually untested in another.

If the box is short, the priority order inside each sector is given with its scope below —
it follows measured share, so covering in that order leaves the least behind.

---

## Sector A · Calls — inside the call · 15.7%

Everything that happens once you are in a call. Runs on lane A.

**In scope**
- Media and controls — mic, camera, device switching, quality, tiles, grid, filmstrip, pinning, fullscreen, PiP
- Participants panel and host powers — mute others, make host, remove, permission requests
- In-call chat, threads in call chat, reactions
- Screen share and recording (start/stop/consent, in-call behaviour)
- Side rooms and breakout — create, move, join, return, visibility

**Seam with B** — the in-call **Add to call** dialog is A's (the trigger is `call-controls-add-to-call` in the in-call toolbar), but the *ringing* it causes is B's. A finding that crosses it belongs to whoever found it; note the border in your log.

**Owned by other sectors** — creating or joining a call, the lobby, ringing, the end-of-call
screen, hub and history (sector B); meeting settings and guest links (sector B).

**Border with sector B** — recording is split by moment: starting, stopping and consent *during*
the call are yours; the recording as it appears afterwards on the call detail page is sector B's.

**Setup** — the full rig, 3–4 browsers. One call per account:
`scripts/callrig/launch.sh A alice`, then `bob`, `carol`, `dave`.
Prove media with `getStats()`, not from the tiles.

**Priority if short** — media & controls (5.5%) → participants & host powers (3.6%) → in-call chat/share/recording (3.5%) → side rooms (3.1%)

**Entry** — `/w/{ws}/call/{id}`

---

## Sector B · Calls — around the call · 17.2%

Every way into and out of a call, and everything the call leaves behind. Runs on lane B.

**In scope**
- Create a call — direct, from a channel, from a DM, scheduled start
- Lobby, waiting room and approval, password gate, ringing, incoming/outgoing, decline, no-answer, call waiting
- End, recovery, takeover, peer disconnect, call waiting and switching between calls (there is **no hold** in this product — a second incoming call raises a surface saying "Accepting leaves your current call", and accepting does exactly that)
- Hub, history, filters and tabs; post-call detail page — recording, chat and log tabs, ratings
- Meeting settings — name, password, approval mode, reactions, chat, device modes
- Guest access — guest links, guest join, guest limits

**Owned by other sectors** — anything after you are connected and the call is running (sector A);
scheduled meeting creation in the calendar UI (sector E, which hands the meeting to this sector to start).

**Setup** — 2 browsers plus a separate guest window. Guest sessions share a cookie jar
and occupy 3 slots — one window per participant, never tabs.

**Priority if short** — entry & lifecycle (7.2%) → hub, history & detail (5.7%) → guest access (2.4%) → meeting settings (1.9%)

**Entry** — `/w/{ws}/calls`, `/w/{ws}/calls/{id}`

---

## Sector C · Chat · 18.8%

The whole chat module, kept in one sector. Runs on lane C.

**In scope**
- Composer and sending — formatting, attachments, link previews, typing, drafts, long messages
- Message actions — edit, delete, reactions, pin, forward, save, copy link, receipts
- Channels — create, join, leave, archive/unarchive, members, info panel, mute, header
- DMs — start, block/unblock, privacy gates, clear history, requests
- Threads and replies; mentions and unread; saved messages; files and media inside chat
- Call event messages in the channel

**Seam with B** — call event messages in a channel are C's, but the numbers inside them (duration, participants) are produced by call lifecycle, which is B's. A wrong duration in a channel message sits exactly on this line.

**Owned by other sectors** — global search (sector E); the files page and the viewer opened from it
(sector E); channel-level permissions and roles (sector D).

**Border with sector E** — an attachment *in a message* is yours, including the lightbox opened by
clicking it. The same file reached from `/w/{ws}/files` is sector E's. If the two disagree about
the same file, that is a finding — log it and say so.

**Setup** — 2–3 browsers. Alice owns `#qa-private` but not `#qa-general`, which is what
exercises the permission difference on her own messages.

**Priority if short** — message actions (5.1%) → composer & sending (4.6%) → channel management (4.2%) → mentions, threads, DMs (2.7% together)

**Entry** — `/w/{ws}/c/{channelId}`, `/w/{ws}/d/{dmId}`, `/w/{ws}/chat/saved`, `/w/{ws}/chat/mentions`

---

## Sector D · Org, identity & settings · 23.3%

Who you are, and what you are allowed to do. Runs on lane D.

**In scope**
- Admin and org — company and workspace settings, members, roles and permissions, direct
  invites, workspace invites, kick, audit log, system settings, search reindex
- Personal settings — account, privacy, notifications, appearance, security and 2FA,
  sessions and "sign out other sessions", blocked users, about, language
- Auth and onboarding — login, signup, email verification, magic link, forgot/reset password,
  invite accept, name and company onboarding

**Owned by other sectors** — the notification *panel* and bell (sector E); guest join links (sector B).

**Setup** — needs the negative-case accounts: `qa.outsider@` (in company, not in workspace),
`qa.dave@` (in workspace, in no channel), `qa.guest@`. Signing out other sessions logs out
every browser on that account — expect to re-login. **This sector also needs one window kept
deliberately signed out**, for `/signup`, email verification, magic link and reset-password
as an anonymous visitor. That window is working as intended: do not "repair" it, and do not
point `ensure.sh` at it — `ensure.sh` will sign it back in.

**Too wide for one box — take a named half.** At 23.3% this cannot be covered in a single
run, and leaving the choice implicit means admin eats the box. Take one half, say which in
your session log's `## Current state`, and the next session takes the other:
- **D1 · Admin & org** (12.2%) — company and workspace settings, members, roles and permissions, invites, kick, audit log, system settings
- **D2 · Identity** (11.1%) — personal settings, plus auth and onboarding

**Priority within a half** — this ordering is by measured *share*, not by expected yield;
a small area can hold the best finding of the run, so do not read it as "least valuable last".

**Entry** — `/w/{ws}/settings/{section}`, `/w/{ws}/settings/admin/*`, `/login`

---

## Sector E · Workspace content & chrome · 22.8%

What is in the workspace, and how you find it. Runs on lane E.

**In scope**
- Shell and navigation — sidebar, channel list, workspace switcher, rail, unread and badges,
  notifications panel and bell, presence, connection status, reminders
- Directories — people and channels tabs, filters, profile popups
- Calendar — month/week views, event chips, create and edit meetings, invite responses,
  scheduled meetings, reminders, join landing
- Files — files browser, scopes and filters, upload, download, file viewer, lightbox
- Search — global search, filters, tabs, sort, scope chips, in-channel search, recent searches

**Owned by other sectors** — starting a scheduled meeting and everything after (sector B);
files sent inside a conversation (sector C); notification *settings* (sector D).

**Setup** — mostly a single browser; a second one for presence and cross-user directory checks.
Calendar chips below the fold need `scrollIntoViewIfNeeded()` before clicking.

**Too wide for one box — take a named half.** At 22.8% this is five unrelated products, and
whoever runs it otherwise chooses between breadth and depth on every surface. Take one half,
say which in your session log's `## Current state`, and the next session takes the other:
- **E1 · Shell, directories & search** (10.8%)
- **E2 · Calendar & files** (12.0%)

**Priority within a half** — shell & directories (8.7%) → calendar (6.4%) → files (5.6%) →
search (2.1%). This ordering is by measured *share*, not by expected yield: search is last at
2.1% and produced a High, while files at 5.6% produced nothing new. Do not read it as
"least valuable last".

**Internal seams worth crossing deliberately** — the best findings here sit between E's own
areas, not inside them: notification → calendar (an invitation notification leading to a
calendar card), and notification → files. If two surfaces disagree about the same object,
that is a finding; log it and say so.

**Entry** — `/w/{ws}/directories`, `/w/{ws}/calendar`, `/w/{ws}/files`

---

## Files each session writes

`<area>` is fixed per sector so parallel sessions never collide or drift apart. `<date>` is
today, `<lane>` the fixture lane letter (see `CLAUDE.md` for the full conventions).

**A second run of the same sector on the same lane and date** appends `-2`, `-3` and so on
to both the log and the report basename. Check whether a report already exists for your
sector today before you start — if one does, read it: a same-day predecessor has usually
already settled a chunk of your surface, and two findings have shared a root cause across
such a pair.

| sector | session log | report source |
|---|---|---|
| A | `logs/AIRION-QA-<date>-<lane>-calls-inside.md` | `reports/aloqa-calls-inside-qa-<date>-<lane>.html` |
| B | `logs/AIRION-QA-<date>-<lane>-calls-around.md` | `reports/aloqa-calls-around-qa-<date>-<lane>.html` |
| C | `logs/AIRION-QA-<date>-<lane>-chat.md` | `reports/aloqa-chat-qa-<date>-<lane>.html` |
| D | `logs/AIRION-QA-<date>-<lane>-org.md` | `reports/aloqa-org-qa-<date>-<lane>.html` |
| E | `logs/AIRION-QA-<date>-<lane>-workspace.md` | `reports/aloqa-workspace-qa-<date>-<lane>.html` |

Driver snippets go to `scripts/callrig/snip/<lane>-<name>.mjs` — the lane letter, not the
sector, because that is what keeps two browsers apart. Append your row to `reports/README.md`
once, at the end of the run.

## If the sector runs dry before the deadline

The timebox will not release you, and padding with repeat passes over what already works is
the lowest-value thing available. In rough order of what has paid off:

1. **Go deeper on state, not wider on surface** — the same screen after a reload, as a
   different role, in a channel with history, on a slow network, with the window narrow.
2. **Re-verify your own findings.** Run each one again from a fresh page before it reaches the
   report; roughly a quarter of findings from a long unattended pass have not survived this.
3. **Re-verify the previous session's report for your sector** — `/verify-bugs` does this as
   its own pass: reproduce each finding on today's build, and where it does not reproduce,
   check `git log` for a fix before calling it a false positive.

## Not allocated

- **Calls debug surfaces** (~2.1%) — developer instrumentation.
- **AI, Telephony, Marketplace** — design mock-ups reading from a static fixture module,
  no API calls behind them. Re-check whether they have been wired up before writing them off
  in a later session.
- **Mobile and desktop apps** — the web app is what these sectors cover.
