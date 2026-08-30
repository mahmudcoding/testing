> **RETIRED 2026-08-30 — superseded by `SECTORS.md`.**
>
> This was the second of two sector maps: five sectors K-O covering Calls only, run on
> lanes A-E. Both maps were replaced by the single nine-sector map in `SECTORS.md`, where
> Calls gets sectors **A, B and C** and the sector letter is always the lane letter.
>
> Nothing here is current. It is kept because `logs/AIRION-QA-2026-08-30-*` and
> `reports/aloqa-calls-{entry,media,floor,collab,record}-qa-*` are indexed by its letters,
> and a later session reading those files needs to know what K-O meant. `SECTORS.md`
> carries an old-to-new mapping table for exactly that.

# Test sectors — Calls only

**This file is the second sector map, and it replaces `SECTORS.md` for the day rather than
adding to it.** `SECTORS.md` sectors A–E sweep the whole product and give Calls two of five
boxes. Sectors **K–O** below give Calls all five, for the days when the goal is to exhaust the
module rather than cover the product. The two maps both run on lanes A–E, so **only one map runs
on a given day** — a calls-map session and a normal-map session cannot share a lane.

Weights come from `reports/aloqa-module-scope-census.html`
(published: https://claude.ai/code/artifact/9cba3e8e-ffda-4623-9821-14cf0cf9b3f3), from its
"Inside Calls" table, with entry & lifecycle split into its inbound and outbound halves and
guest access distributed by moment. Shares below are **of Calls**, not of the app; Calls is 35%
of the app, so multiply by 0.35 to compare against `SECTORS.md`.

**A sector is not a lane.** A *lane* (`QA_LANE`, `seed.sh --lanes`, `rigmap`) is the isolated
fixture set and browser port block a session runs on. A *sector* is what that session tests.
Here the letters deliberately do **not** match: sectors are K–O, lanes are A–E, paired in order.

| sector | lane | of Calls | browsers |
|---|---|---|---|
| K · Getting in | A | 16.0% | 3 |
| L · Media & controls | B | 16.4% | 4 |
| M · People, moderation & side rooms | C | 20.1% | 4 |
| N · Collaboration & meeting policy | D | 16.6% | 2 |
| O · Leaving & the record | E | 24.8% | 2 |

**There are no lanes K–O.** Only A–E are seeded, and `launch.sh` counts live browsers over ports
9220–9319 (lanes A–J) — a browser on a lane past that escapes the global cap entirely. A bare
`/run-until 14:00 K` therefore means **sector K on lane A**, and the hook supplies that pairing.

**Export the sector, not just the lane.** `launch.sh` reads the sector off the *lane letter*
unless `QA_SECTOR` says otherwise, so a calls-map session that exports only `QA_LANE` is handed
the normal map's cap for that letter. Start every session here with both:

```bash
export QA_LANE=A QA_SECTOR=K
```

**Browsers are the binding constraint of this map, and that is what shaped it.** `launch.sh`
caps at 16 windows across all lanes at ~470–590 MB each; 20 windows put the machine into 4.6 GB
of swap, where macOS discards background tabs and **a discarded tab in a live call is
indistinguishable from a participant dropping**. In `SECTORS.md` only two of five sectors want
the call rig. Here all five do, so the per-sector budgets (3/4/4/2/2) sum to 15 with one spare,
and the setup line in each section below is what that sector actually gets. Going past one is
deliberate — `launch.sh` prints the `QA_MAX_PER_LANE` override when it refuses.

**Scope is not effort, and this map leans on that.** The census puts in-call work at roughly
1.45× per unit of scope — three or four browsers, real media, multi-participant state,
timing-sensitive checks. So the cheap-rig sectors here carry visibly more scope on purpose:
sector O's 24.8% on two browsers sits level with sector L's 16.4% on four. Weighted that way the
five land at 20.0 / 23.8 / 29.1 / 22.4 / 24.8 effort-points. **M is the heaviest**, which is why
its section carries an explicit priority order.

**Read your sector's "Owned by other sectors" line before you start, not just its in-scope
list.** With five sessions inside one module the borders are much closer together than they are
in `SECTORS.md`, and the boundary line is the cheaper half of the section: the in-scope list
tells you where to go, the boundary line tells you where someone else already is.

Start a session with just the letter:

```bash
/run-until 14:00 K
```

That is the whole instruction — **sector K on lane A**. A hook
(`scripts/hooks/sector_context.py`) reads the letter off the prompt and injects that sector's
section below straight into the session, so the scope never has to be pasted or re-derived.
Name sector and lane separately only when they differ:

```bash
/run-until 14:00 sector M on lane A
```

The session then follows **Start of a session** in `CLAUDE.md` (export `QA_LANE` *and*
`QA_SECTOR`, verify fixtures, record the build stamp, sync the Jira mirror, open the session
log) and reads its own section below.

**"Owned by sector X" means another session is covering it today**, so you can hand it off
instead of duplicating work — not that the area is untestable. If you find a defect there while
passing through, log it and say which sector it belongs to.

## Choosing what to hit inside your sector

The lists below are boundaries, not checklists. They say where your sector ends, not what counts
as done — and they are **not exhaustive**: a surface that is not named but sits inside your
sector's territory is still yours to test. Nothing here asks for a regression sweep of the
listed features. Pick targets instead:

- **Diff the component map.** Each section names the source directories that back it. Compare
  against previous passes in `logs/` and go where the coverage is thin.
- **Diff the deploy.** The build stamp is a frontend commit, so `git log <deployed>..HEAD` over
  your sector's paths names what changed recently and which ALK ids are waiting.
- **Follow the state, not the screen.** Calls occupies 6 of the app's 51 routes and 35% of its
  functionality — nearly all of it states inside a single in-call route. A surface you have
  "already tested" in one state is usually untested in another. On this map that is not a tip,
  it is the whole method: five sessions inside six routes only pays off if each goes at states.
- **Read the two calls reports from the normal map first.** `reports/aloqa-calls-inside-qa-*.html`
  and `reports/aloqa-calls-around-qa-*.html` are the closest dedup targets you have, much closer
  than Jira — and their session logs record which questions were answered, not just which
  controls were exercised.

## The guest client, and why it has no sector of its own

`apps/web/src/features/guest-meeting/` is a second implementation of the call experience — its
own chat panel, breakout return prompt, ended summary, session banner, engine boundary and
remote config, 21 components. The census scores it at 6.7% of Calls, too thin for a sector, so
**it is split by moment**: the link, the arrival and guest limits are K's; a guest already in
the call belongs to whichever sector owns that surface.

The known cost of splitting it is that guest work gets done last in every box and so gets done
nowhere. Each section below names its guest obligation explicitly for that reason. Treat it as
part of the sector, not as an extension to reach if there is time.

---

## Sector K · Calls — getting in · 16.0% of Calls

Every path that ends with you connected, and every gate on the way. Runs on lane A.

**In scope**
- Create a call — direct, from a channel, from a DM, starting a scheduled meeting
- Lobby — device check, camera/mic preview, device bar, lobby settings, recording-consent notices
- Ringing — outgoing stage, incoming banner and toast, decline, no answer, cancel
- Waiting room and approval, the approval modal, rejoin after approval
- Password gate, entry mode, participant limit at the door
- Call waiting — a second incoming call while in one, and switching between calls (there is **no
  hold** in this product — the surface says "Accepting leaves your current call", and accepting
  does exactly that)
- **Guest:** the guest link, guest arrival, guest limits, and the guest's own resume/session states

**Owned by other sectors** — anything after you are connected (L, M, N); the Meeting settings
*panel* itself (N), though the effect of password, approval mode and participant limit at the
door is yours; leaving, recovery and the hub (O).

**Border with N** — a setting is N's, its effect at the door is yours. If a password set in N's
panel does the wrong thing at the gate, that is your finding.

**Setup** — 3 browsers: caller, callee, and a third for the waiting room, call waiting or a
guest window. Guest sessions share a browser's cookie jar and occupy 3 slots
(`GUEST_COOKIE_MAX_LIVE`) — one window per participant, never tabs.

**Priority if short** — ringing & entry lifecycle → waiting room and approval → lobby and device
check → password/limit gates → guest arrival

**Entry** — `/w/{ws}/calls`, `/w/{ws}/call/{id}`, the guest join link

**Source** — `packages/features/calls/ui-web/{Lobby*,IncomingCall*,OutgoingCall*,Create*,WaitingRoomList}`;
`apps/web/src/widgets/CallBridges/{Incoming*,Outgoing*,CallWaiting*,SecondCallConflict*,WaitingRoomApproval*,WaitingRoomRejoiner}`;
`apps/web/src/features/calls/CallPasswordGate.tsx`, `CallLobbyRecordingConsent*`;
`apps/web/src/features/guest-meeting/ui/{GuestLinkManager*,GuestMeetingResuming,GuestSessionBanner,GuestMeetingTerminal}`

---

## Sector L · Calls — media & controls · 16.4% of Calls

What you see and hear, and the controls that change it. Runs on lane B.

**In scope**
- Mic and camera — toggle, state, permission denial, hot-plug, device switching mid-call
- Device menu and the audio popover; personal call settings at `/w/{ws}/settings/calls`
- Quality — the quality prompt, applied-quality row, maximum video quality, the signal meter
- Tiles and layout — participant grid, grid pagination, filmstrip, view toggle, pinning
  (including pin for everyone), global pin badge
- Fullscreen, minimize, Picture-in-Picture and the draggable PiP
- Network badge and indicator, media error banners, lifecycle error banner, audio mix
- **Guest:** the guest's own tiles, controls and device handling

**Owned by other sectors** — screen share and its tiles (N); the participants *panel* and
anything done *to* another person (M); the call duration badge as it appears afterwards (O).

**Border with M** — muting *yourself* is yours; muting *someone else* is M's. The same control
vocabulary appears on both sides, so match `aria-label` exactly.

**Setup** — 4 browsers. Grid pagination and filmstrip need bodies in the call, and simulcast
means you cannot read media off the tiles: prove it with `getStats()` (`bytesSent`,
`framesDecoded`, `audioLevel`), and confirm from the **receiving** side — `RTC_STATS` collapses
simulcast layers and can report 0 outbound video for a participant streaming fine on a lower layer.

**Priority if short** — mic/camera and devices → grid, tiles and pagination → quality → PiP,
fullscreen and pinning → network and error banners

**Entry** — `/w/{ws}/call/{id}`, `/w/{ws}/settings/calls`

**Source** — `packages/features/calls/ui-web/{CallControls,CallDeviceMenu,MainAudioPopover,ParticipantGrid*,ParticipantTile*,CallFilmstrip,CallQuality*,CallNetwork*,CallViewToggle,CallFullscreenButton,CallSurfaceMinimizeButton,DraggablePip,PipMiniCall,PipCallDuration,MediaStreamVideo,RemoteVideoTrackView,LocalMediaPreview,CallMediaErrorBanner,CallLifecycleErrorBanner,ParticipantGlobalPinBadge}`;
`apps/web/src/features/calls/{audioMix,diagnostics}`; `apps/web/src/features/settings/calls`;
`apps/web/src/widgets/CallBridges/{MediaDevicesBridge,RemoteAudioElement,RemoteMediaSink,WebRTCBridge}`

---

## Sector M · Calls — people, moderation & side rooms · 20.1% of Calls

Everything you do *to* another participant, and everywhere you can put them. Runs on lane C.

**In scope**
- Participants panel and rows — markers, states, ordering, search
- Host powers — mute others, mute on entry, remove, ban and unban, end for everyone
- Co-host — make host, promote, demote, remove co-host, and what a co-host may do
- Permission requests — raise hand, the request list, approve/deny; per-participant device
  permissions (`Allow`/`Ask`/`Block` for camera, mic, screen share)
- The admin-permissions dialog — what it grants, what it can revoke
- Side rooms and breakout — create, add people, move, join, return, ask to return, close,
  chat/audio/video/share isolation between a room and the main call, private rooms
- **Guest:** moderating a guest, and a guest inside a side room

**Owned by other sectors** — your own mic and camera (L); in-call chat and reactions as features
(N), though their **isolation between a side room and the main call** is yours; the call log
that records these actions afterwards (O).

**Border with N** — a reaction is N's feature; a reaction *leaking out of a side room* is yours.
Same for chat, audio, video and screen share: the feature is N's or L's, the isolation is yours.

**Setup** — 4 browsers, the most of any sector here: a host and three targets, because a side
room split is not meaningful with fewer. **Reset between findings** — a promoted co-host, a live
call or a ban survives into the next snippet and produces defects that are not there;
`snip/_reset.mjs` puts one browser back to neutral, and it has to be run over *every* account a
finding names.

**Priority if short** — this sector is the heaviest on the map by effort (29.1 points against
20.0 for K), so the ordering matters: participants panel & host powers → side room lifecycle
(create, move, join, return, close) → device permissions & requests → isolation checks →
private side rooms last.

**Entry** — `/w/{ws}/call/{id}`

**Source** — `packages/features/calls/ui-web/{ParticipantsListPanel,ParticipantRow,BanParticipantDialog,RemoveCoHostDialog,ParticipantPermissions*,PermissionRequest*,MeetingAdminPermissions*,DeviceRequestPrompt,SideRoomConfirmDialog,BreakoutInvitePrompt,AddToCallModal,WorkspaceMemberPicker}`;
`packages/features/calls/model/breakout`; `apps/web/src/features/calls/breakout`;
`apps/web/src/features/guest-meeting/ui/GuestBreakoutReturnPrompt.tsx`

---

## Sector N · Calls — collaboration & meeting policy · 16.6% of Calls

What you do *together* inside the call, and the panel that decides whether you may. Runs on lane D.

**In scope**
- In-call chat — sending, history, threads, the chat panel and its error states, system rows
- Reactions — the picker, live reactions, the reaction row
- Screen share — start, stop, two at once, revoke, the share thumbnail tile, what the sharer sees
- Recording **while the call is running** — start, stop, consent, the badge, who may record,
  what participants are told
- Meeting settings panel — name, password, approval mode, entry mode, reactions, chat, device
  modes, video quality, participant limit, guest link visibility, admin-permission availability
- **Guest:** the guest chat panel and the guest's reactions

**Owned by other sectors** — the *effect* of a setting at the door: password, approval mode and
participant limit are exercised by K, which owns the gate; the recording as an artifact
afterwards — the detail page, download and access control — is O's; chat/reaction **isolation**
between a side room and the main call is M's.

**Border with O — recording splits by moment.** Starting, stopping and consent during the call
are yours. The recording as it appears afterwards is O's. This is the same rule the normal map's
A/B border uses, and it is the one most often crossed by accident.

**Why the settings panel sits here** — pairing the policy with the surfaces it governs is
deliberate. The 08-26 pass found its useful things exactly on that seam: the Reactions policy
applying in both directions, the In-call chat policy explaining its own refusal, device modes.
Testing the toggle without the surface, or the surface without the toggle, is what leaves those
findings on the floor.

**Setup** — 2 browsers is the budget: one acting, one observing, which covers chat, threads,
share, recording and every policy toggle. Two simultaneous screen shares needs a third — take
the map's spare slot for that one check and give it back.

**Priority if short** — recording during the call → screen share → in-call chat and threads →
the settings panel toggle by toggle → reactions

**Entry** — `/w/{ws}/call/{id}`, the Meeting settings panel inside it

**Source** — `packages/features/calls/ui-web/{InCallChat*,ChatMessageRow,ChatMessageThreadAction,ChatSystemRow,CallReaction*,LiveReactionPicker,ScreenShareTrack,ShareThumbnailTile,CallRecordButton,CallRecordingBadge,MeetingSettings*,MeetingAccessSettingsSection,MeetingGuestLinkVisibilitySection,MeetingSettingToggle}`;
`apps/web/src/features/calls/recording`; `apps/web/src/features/guest-meeting/ui/GuestChatPanel.tsx`

---

## Sector O · Calls — leaving & the record · 24.8% of Calls

Every way a call ends, and everything it leaves behind. Runs on lane E.

**In scope**
- Leaving — leave, the leave confirmation, end for everyone, last participant leaves
- Failure exits — connection loss and recovery, the recovery banner, refresh recovery, takeover
  from a second device of the same account, peer disconnect
- The ended surface — summary, actions, rating, chat history on it, close
- Hub — `Live now` cards, All/Group/1-to-1 tabs and filters, history, `Load more` pagination
- Post-call detail page — recording tab (playback, download, access control, failure states),
  chat tab, logs tab with its filters and chips, participants dialog, host summary, DM shortcuts
- Call event messages in a channel, and the numbers inside them
- **Guest:** the guest ended summary

**Owned by other sectors** — anything before you are connected (K); the call while it is running
(L, M, N); recording *during* the call (N); the chat rendering around a call event message
belongs to Chat, but the numbers inside it are yours.

**Border with N — recording splits by moment**, see N's section. Yours is the artifact.

**Setup** — 2 browsers: one to produce calls to inspect, one to inspect from a second account.
Most of this sector reads records rather than driving live media, which is why it carries the
map's largest share on its smallest budget.

**A trap specific to this sector** — leaving a call is **two** steps: `Leave call` opens a
confirmation, and clicking only the first leaves you in the call. Assert the state, not the
click: after the leave, the URL must no longer match `/call/`. A published High was withdrawn
over exactly this — inflated call durations that were correct readings of a meeting nobody had
left. `snip/leave-call.mjs` leaves *and* ends the meeting; leaving alone keeps it `active` and
every later navigation bounces back to `/call/<id>`.

**Priority if short** — leaving and end-for-everyone → post-call detail page → hub and history →
recovery, takeover and peer disconnect → ratings

**Entry** — `/w/{ws}/calls`, `/w/{ws}/calls/{id}`

**Source** — `packages/features/calls/ui-web/{CallEnded*,CallLeave*,CallConnectionRecoveryBanner,CallsHomePage,CallsHomeHeader,CallCard,RecentCallRow*,RecentsLoadMore,CallRecordingItem,CallRecordingsSection,CallDurationBadge,CallEndForEveryoneDialog}`;
`apps/web/src/features/calls/{ended,hub,takeover,peer-disconnect,CallDetail}`;
`apps/web/src/features/guest-meeting/ui/GuestEnded*`

---

## Files each session writes

`<area>` is fixed per sector so parallel sessions never collide or drift apart, and so that
nothing this map writes can ever collide with a file from `SECTORS.md`. `<date>` is today,
`<lane>` the fixture lane letter — **A–E, not K–O** (see the pairing table at the top).

**A second run of the same sector on the same lane and date** appends `-2`, `-3` and so on to
both the log and the report basename. Check whether a report already exists for your sector
today before you start — if one does, read it.

| sector | session log | report source |
|---|---|---|
| K | `logs/AIRION-QA-<date>-<lane>-calls-entry.md` | `reports/aloqa-calls-entry-qa-<date>-<lane>.html` |
| L | `logs/AIRION-QA-<date>-<lane>-calls-media.md` | `reports/aloqa-calls-media-qa-<date>-<lane>.html` |
| M | `logs/AIRION-QA-<date>-<lane>-calls-floor.md` | `reports/aloqa-calls-floor-qa-<date>-<lane>.html` |
| N | `logs/AIRION-QA-<date>-<lane>-calls-collab.md` | `reports/aloqa-calls-collab-qa-<date>-<lane>.html` |
| O | `logs/AIRION-QA-<date>-<lane>-calls-record.md` | `reports/aloqa-calls-record-qa-<date>-<lane>.html` |

Driver snippets go to `scripts/callrig/snip/<lane>-<name>.mjs` — the **lane** letter, not the
sector, because that is what keeps two browsers apart. Append your row to `reports/README.md`
once, at the end of the run.

## If the sector runs dry before the deadline

The timebox will not release you, and padding with repeat passes over what already works is the
lowest-value thing available. In rough order of what has paid off:

1. **Go deeper on state, not wider on surface** — the same screen after a reload, as a different
   role, as a guest, in a call with history, on a slow network, after a recovery.
2. **Re-verify your own findings.** Run each one again from a fresh page before it reaches the
   report; roughly a quarter of findings from a long unattended pass have not survived this.
3. **Take the guest client seriously** — it is the surface this map most reliably under-tests,
   because it is split across all five sectors and comes last in each.
4. **Re-verify the normal map's calls reports for your surfaces** — `/verify-bugs` does this as
   its own pass: reproduce each finding on today's build, and where it does not reproduce, check
   `git log` for a fix before calling it a false positive.

## Not allocated

- **Calls debug surfaces** (6.0% of Calls) — developer instrumentation
  (`packages/features/calls/debug`, `apps/web/src/lib/callDebug`, `widgets/CallDebugMount`).
  Out of scope here for the same reason as in `SECTORS.md`. Worth one check per pass that they
  are not reachable by an ordinary user, which *is* in scope — a debug panel a user can open is
  a finding.
- **Mobile and desktop clients** — `ui-mobile` and `ui-desktop` exist in the calls package; the
  web app is what these sectors cover.
