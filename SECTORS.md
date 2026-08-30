# Test sectors

Scope allocation for parallel QA sessions — **which part of the product a session covers**.
Nine sectors, **A–I**: three for Calls, six for everything else. Weights come from
`reports/aloqa-module-scope-census.html`
(published: https://claude.ai/code/artifact/9cba3e8e-ffda-4623-9821-14cf0cf9b3f3).

**Three sessions run at once**, so the map is sized by where the product's seams are rather
than by what the rig can survive. Every sector may hold four browsers, so any three running
together want twelve against a global cap of twenty, and load is not the constraint on how the
work divides. Four is a ceiling, not a target — a sector's **Setup** line says what it actually
needs, and a browser you are not driving is one the machine is still compositing.

---

## A sector is not a lane — but here they always match

A *lane* (`QA_LANE`, `seed.sh --lanes`, `rigmap`) is the isolated fixture set and browser port
block a session runs on. A *sector* is what that session tests. On this map every sector has
its own lane and the letters are identical, so a bare letter is the whole instruction:

```bash
/run-until 14:00 G
```

means **sector G on lane G**. A hook (`scripts/hooks/sector_context.py`) reads the letter off
the prompt and injects that sector's section below straight into the session, so the scope
never has to be pasted or re-derived. Name them separately only when they genuinely differ:

```bash
/run-until 14:00 sector G on lane C
```

and then export both, because `launch.sh` reads the sector off the lane letter otherwise and
hands out the wrong browser cap:

```bash
export QA_LANE=C QA_SECTOR=G
```

**Nine lanes exist, A–I, one per sector.** Lane J (ports 9310–9319) carries no sector and is
free for bugfixes and one-off investigations; it is still inside the 9220–9319 window
`launch.sh` counts for its global cap, so a browser there is not invisible. Lanes past J are
outside that window and escape the cap entirely — do not use them.

The session then follows **Start of a session** in `CLAUDE.md` (export `QA_LANE`, verify
fixtures, record the build stamp, sync the Jira mirror, open the session log) and reads its
own section below.

**"Owned by sector X" means another session may be covering it today**, so you can hand it off
instead of duplicating work — not that the area is untestable. If you find a defect there
while passing through, log it and say which sector it belongs to.

**Read your sector's boundary line before you start, not just its in-scope list.** One session
lost about an hour to Sessions and notification settings before checking, and found another
sector had already covered all of it that day. The boundary line is the cheaper half of the
section: the in-scope list tells you where to go, the boundary line tells you where someone
else already is.

---

## The nine

Scope is percent of the whole app, from the census composite (i18n strings 25%, UI components
25%, frontend code 20%, API operations 15%, backend code 15%). Fresh component and line counts
taken at the deployed sha agree with it.

| sector | scope | lane | browsers | `<area>` |
|---|---:|---|---:|---|
| **A** · Calls — the door, the exit, the record | 12.1% | A | 4 | `calls-lifecycle` |
| **B** · Calls — the room | 10.0% | B | 4 | `calls-room` |
| **C** · Calls — the studio and the policy | 10.8% | C | 4 | `calls-studio` |
| **D** · Chat — messages | 11.2% | D | 4 | `chat-messages` |
| **E** · Chat — channels and DMs | 9.6% | E | 4 | `chat-spaces` |
| **F** · Admin and org | 12.2% | F | 4 | `admin-org` |
| **G** · Identity and access | 11.1% | G | 4 | `identity` |
| **H** · Shell, people and discovery | 8.8% | H | 4 | `shell` |
| **I** · Calendar and files | 12.0% | I | 4 | `calendar-files` |

Sum 97.8%, plus Calls debug surfaces at 2.1% which stay unallocated. Mean 10.9%, spread 8.8–12.2.

**Scope is not effort.** In-call work costs roughly 1.45× per unit of scope — three or four
browsers, real media, multi-participant state, timing-sensitive checks — and reading records
costs about 0.95×. Weighted that way the nine land at 13.3 · 15.0 · 14.6 · 11.2 · 10.6 · 12.8 ·
11.1 · ~10 · 11.4. **B and C are the heaviest**, which is why their sections carry an explicit
priority order. H's 8.8% understates it badly: eight of the surfaces it owns were counted by no
measurement in the census because nothing had ever tested them.

### Where the Calls cut falls, and why

The three-way is cut along **measured import edges** at the deployed sha, not by moment. The
facts that decided it:

- `CallSurface.tsx` is 1,798 lines and imports sixteen children plus thirty model files. Every
  in-call cluster meets there and nowhere else, so whichever sector owns it absorbs regressions
  from the other two. It is **B's**, which mounts the most of its children.
- **Hub, history and the post-call detail page have zero import edges into the `CallSurface`
  subtree** — different routes, different data plane. Cleanest seam in the module, and it is
  the A/B border.
- Grid, tiles, screen-share rendering and filmstrip are **one subtree of 42 files**
  (`ParticipantGrid` imports `ScreenShareTrack`, `ShareThumbnailTile`, `CallFilmstrip`,
  `ParticipantTile` directly). No sector line cuts through that parent-to-child edge.
- Grid and participants both project from `model/roster/`, and `useCallSurfaceModerationActions`
  acts on tiles *and* rows — pin-for-everyone is a moderation action whose effect is a layout
  change. They stay together.
- `activeContext` (side rooms) is read by the participants panel, the header tabs, PiP and
  minimize. Breakout is a cross-cutting dimension, not a leaf feature.
- Recording and meeting settings have **zero** edges between them, and recording is
  self-contained enough that "during the call" and "the artifact afterwards" could be split.
  They are not: C owns recording end to end, so no sector border runs through it.

### Where the non-Calls cut falls, and why

Chat is 18.8% against a 10.9% target, so it has to divide, and the census warns why that is
risky: the border between message actions and channel management is soft enough that each half
keeps wandering into the other. So the border is a **hard** one — **the message, versus the
container it lives in.** D never opens a channel's info panel; E never opens the composer.
Everything else follows the census's own module boundaries.

---

## Choosing what to hit inside your sector

The lists below are boundaries, not checklists. They say where your sector ends, not what
counts as done — and they are **not exhaustive**: a surface that is not named but sits inside
your sector's territory is still yours. Nothing here asks for a regression sweep. Pick targets:

- **Diff the component map.** Each section names the source directories that back it. Compare
  against previous passes in `logs/` and go where the coverage is thin.
- **Diff the deploy.** The build stamp is a frontend commit, so `git log <deployed>..HEAD` over
  your sector's paths names what changed recently and which ALK ids are waiting.
- **Follow the state, not the screen.** Most of this app is states inside a few routes; a
  surface you have "already tested" in one state is usually untested in another. Calls occupies
  six of the app's fifty-one routes and 35% of its functionality, nearly all of it states.
- **Read your dedup targets first** (see the section near the bottom). The closest prior work
  is almost never in Jira.

---

## Sector A · Calls — the door, the exit, the record · 12.1%

Everything outside the live call surface: every way in, every way out, and the record a call
leaves behind. Owns six of the eight call route shapes. Runs on lane A.

**In scope**
- Create a call — direct, from a channel, from a DM, starting a scheduled meeting
- Lobby — device check, camera/mic preview, device bar, lobby settings, network status
- Ringing — outgoing stage, incoming banner and toast, decline, no answer, cancel
- Waiting room and approval, the approval modal, rejoin after approval
- Password gate, entry mode, participant limit **at the door**
- Call waiting — a second incoming call while in one, and switching between calls (there is
  **no hold** in this product — the surface says "Accepting leaves your current call", and
  accepting does exactly that)
- Leaving, the leave confirmation, end for everyone, last participant leaves
- Failure exits — connection loss and recovery, the recovery banner, refresh recovery,
  takeover from a second device of the same account, peer disconnect
- The ended surface — summary, actions, rating, close
- Hub — Live now cards, All/Group/1-to-1 tabs and filters, history, `Load more` pagination
- Post-call detail page — **chat tab, logs tab and its filters, participants dialog, host
  summary, DM shortcuts** (the recording tab is C's)
- Call event messages in a channel, and the numbers inside them
- **The guest door, and it is mandatory, not an extension**: `/join/{token}`, the legacy
  `/guest/c/{token}` 301, link validity and TTL, guest limits, and `GuestEntryGate` with its
  fifteen terminal states — checking, anonymous join, user join, waiting, approval notice,
  auto-join pending, already in call, blocked, rejected, link invalid, meeting ended

**Owned by other sectors** — anything after you are connected (B, C); recording in **any**
form, during the call or afterwards (C); the meeting settings panel itself (C), though the
effect of password, approval mode and participant limit at the door is yours; the guest
in-call client (C).

**Border with C** — a setting is C's, its effect at the door is yours. If a password set in
C's panel does the wrong thing at the gate, that is your finding.

**Border with E** — E renders a call event message in a channel; the numbers inside it
(duration, participants) are produced by call lifecycle and are yours.

**Border with I** — I creates a scheduled meeting in the calendar; starting it and everything
after is yours.

**A trap specific to this sector** — leaving a call is **two** steps: `Leave call` opens a
confirmation, and clicking only the first leaves you in the call. Assert the state, not the
click: after the leave, the URL must no longer match `/call/`. A published High was withdrawn
over exactly this — inflated call durations that were correct readings of a meeting nobody had
left. `snip/leave-call.mjs` leaves *and* ends the meeting; leaving alone keeps it `active` and
every later navigation bounces back to `/call/<id>`.

**Setup** — 4 browsers: caller, callee, a third for the waiting room or call waiting, and a
guest window. Guest sessions share a browser's cookie jar and occupy 3 slots
(`GUEST_COOKIE_MAX_LIVE`) — one window per participant, never tabs.

**Priority if short** — ringing and entry lifecycle → leaving and end-for-everyone → the guest
door → hub, history and the detail page → waiting room and approval → password and limit gates
→ recovery, takeover and peer disconnect → lobby and device check → ratings

**Entry** — `/w/{ws}/calls`, `/w/{ws}/call/{id}`, `/w/{ws}/calls/{id}`, `/join/{token}`

**Source** — `packages/features/calls/ui-web/{Lobby*,IncomingCall*,OutgoingCall*,Create*,WaitingRoomList,CallEnded*,CallLeave*,CallConnectionRecoveryBanner,CallsHomePage,CallsHomeHeader,CallCard,RecentCallRow*,RecentsLoadMore,CallDurationBadge,CallEndForEveryoneDialog}`;
**`apps/web/app/w/[wsId]/call/[callId]/`** (21 files — the join state machine); `apps/web/src/widgets/CallBridges/`;
`apps/web/src/features/calls/{hub,ended,takeover,peer-disconnect,CallDetail,CallPasswordGate.tsx}`;
**`apps/web/src/features/guest-entry/`** (26 files, one of them a 2,177-line hook)

---

## Sector B · Calls — the room · 10.0%

Who is in the call, what you may do to them, where they can be put, and how the room is laid
out. Runs on lane B.

**In scope**
- Participants panel and rows — markers, states, ordering, search
- Host powers — mute others, mute on entry, remove, ban and unban, end for everyone
- Co-host — make host, promote, demote, remove co-host, and what a co-host may do
- Permission requests — raise hand, the request list, approve/deny; per-participant device
  permissions (`Allow`/`Ask`/`Block` for camera, mic, screen share)
- The admin-permissions dialog — what it grants, what it can revoke
- Side rooms and breakout — create, add people, move, join, return, ask to return, close,
  private rooms; and the **isolation** of chat, audio, video and screen share between a room
  and the main call
- Participant grid, grid pagination, filmstrip, tiles, pinning and pin for everyone, the
  global pin badge, view toggle, spotlight
- Fullscreen, minimize, **Picture-in-Picture and the draggable PiP**
- **How a screen share renders** — the share track in the grid, the share thumbnail tile, the
  featured share, the collapsed share filmstrip
- **The call surface shell** — `CallSurface`, `CallOverlay`, the toolbar, top bar, header
  actions, banners, side-panel presence and the 360px slot the four panels share

**Owned by other sectors** — your own mic and camera, and starting or stopping a share (C);
in-call chat and reactions as features (C), though their **isolation** between a side room and
the main call is yours; anything before you are connected or after you leave (A).

**Border with C** — muting *yourself* is C's; muting *someone else* is yours. Starting,
stopping and revoking a share is C's; how it renders in the grid is yours. The same control
vocabulary appears on both sides, so match `aria-label` exactly rather than by substring.

**PiP appears on every route.** `CallLayoutMode='pip'` means a live call surface is present on
chat, files, calendar and settings pages. You own the widget; the other sectors report PiP
interference to you rather than testing it themselves.

**Reset between findings** — a promoted co-host, a ban or a live call survives into the next
snippet and produces defects that are not there. `snip/_reset.mjs` puts one browser back to
neutral, and it has to be run over *every* account a finding names: ending a meeting strands
the other windows on "Call has ended".

**Setup** — 4 browsers: a host and three targets, because a side room split is not meaningful
with fewer and grid pagination needs bodies. Simulcast means you cannot read media off the
tiles — prove it with `getStats()` and confirm from the **receiving** side.

**Priority if short** — this is the heaviest sector on the map by effort, so the ordering
matters: participants panel and host powers → side room lifecycle (create, move, join, return,
close) → grid, tiles and pagination → device permissions and requests → isolation checks →
pinning, PiP and fullscreen → private side rooms last.

**Entry** — `/w/{ws}/call/{id}`

**Source** — `packages/features/calls/ui-web/{ParticipantsListPanel,ParticipantRow,BanParticipantDialog,RemoveCoHostDialog,ParticipantPermissions*,PermissionRequest*,MeetingAdminPermissions*,DeviceRequestPrompt,SideRoomConfirmDialog,BreakoutInvitePrompt,AddToCallModal,WorkspaceMemberPicker,ParticipantGrid*,ParticipantTile*,CallFilmstrip,CallViewToggle,CallFullscreenButton,CallSurfaceMinimizeButton,DraggablePip,PipMiniCall,PipCallDuration,ParticipantGlobalPinBadge,ScreenShareTrack,ShareThumbnailTile,CallSurface,CallSurface*,CallOverlay,CallTopBar}`;
`packages/features/calls/model/{breakout,roster}`;
`apps/web/src/features/calls/{breakout,breakout/sideRooms,moderation}`;
`apps/web/src/features/guest-meeting/ui/GuestBreakoutReturnPrompt.tsx` (a guest in a side room)

---

## Sector C · Calls — the studio and the policy · 10.8%

What you send, what you share, what you say, what gets kept, and the panel that decides whether
you may. Runs on lane C.

**In scope**
- Mic and camera — toggle, state, permission denial, hot-plug, device switching mid-call
- Device menu and the audio popover; personal call settings at `/w/{ws}/settings/calls`
- Quality — the quality prompt, applied-quality row, maximum video quality, the signal meter
- Network badge and indicator, media error banners, lifecycle error banner, audio mix,
  diagnostics
- In-call chat — sending, history, threads, the chat panel and its error states, system rows,
  and **message reactions inside the chat panel**
- **Live reactions** — the picker on the call controls and the reaction burst. Note these are
  two unrelated features with near-identical names: `LiveReactionPicker` hangs off
  `CallControls`, `CallReactionPicker` and `CallReactionRow` hang off `ChatMessageRow`
- Screen share — **start, stop, two at once, revoke, what the sharer sees**
- **Recording end to end** — start, stop, consent, the badge, who may record, what participants
  are told; and the artifact afterwards: the recording tab on the detail page, playback,
  download, access control, quotas, failure states
- Meeting settings panel — name, password, approval mode, entry mode, reactions, chat, device
  modes, video quality, participant limit, guest link visibility, admin-permission availability
- **The guest in-call client, and it is mandatory, not an extension** — the guest chat panel,
  session banner, resuming, engine boundary, remote config, the guest ended summary, guest
  reactions, and the guest's own tiles and device handling

**Owned by other sectors** — the *effect* of a setting at the door (A owns the gate: password,
approval mode, participant limit); how a share renders in the grid, and the participants panel
(B); chat and reaction **isolation** between a side room and the main call (B); the guest door
and the guest's arrival (A).

**Recording is not split by moment.** Starting it, the consent, the badge and the artifact
afterwards are one feature and one sector's: there are no import edges between recording and
meeting settings, and nothing in the recording code depends on the rest of the detail page,
which is A's.

**Setup** — 4 browsers: one acting, one observing, a third for two simultaneous screen shares
and a guest window for the guest client. Most checks here work at two.

**Priority if short** — recording end to end → screen share → in-call chat and threads → the
guest in-call client → mic, camera and devices → the settings panel toggle by toggle →
quality and network → reactions

**Entry** — `/w/{ws}/call/{id}`, the Meeting settings panel inside it, `/w/{ws}/settings/calls`,
`/w/{ws}/calls/{id}?tab=recording`, `/guest/meeting/{id}`

**Source** — `packages/features/calls/ui-web/{CallControls,CallDeviceMenu,MainAudioPopover,CallQuality*,CallNetwork*,MediaStreamVideo,RemoteVideoTrackView,LocalMediaPreview,CallMediaErrorBanner,CallLifecycleErrorBanner,InCallChat*,ChatMessageRow,ChatMessageThreadAction,ChatSystemRow,CallReaction*,LiveReactionPicker,CallRecordButton,CallRecordingBadge,CallRecordingItem,CallRecordingsSection,MeetingSettings*,MeetingAccessSettingsSection,MeetingGuestLinkVisibilitySection,MeetingSettingToggle}`;
`apps/web/src/features/calls/{audioMix,diagnostics,recording,CallLobbyRecordingConsent*}`;
`apps/web/src/features/settings/calls`;
`apps/web/src/widgets/CallBridges/{MediaDevicesBridge,RemoteAudioElement,RemoteMediaSink,WebRTCBridge}`;
**`apps/web/src/features/guest-meeting/`** (88 files)

---

## Sector D · Chat — messages · 11.2%

The message itself: writing it, sending it, and everything you can do to one afterwards.
Runs on lane D.

**In scope**
- Composer and sending — formatting, mentions in the composer, emoji picker, attachments,
  link previews (external and internal), typing indicator, drafts, long messages, the voice
  recorder, the link URL modal, the drop zone
- Message actions — edit, delete, reactions and the reactions modal, pin, forward, share,
  save, copy link, seen receipts and the viewers list
- Threads and replies, and the thread panel
- Saved messages — `/w/{ws}/chat/saved`. Note the route is live while its settings section is
  release-gated to a 404; that mismatch is worth testing explicitly
- Attachments **inside a message** — the file preview dialog and the lightbox opened by
  clicking one

**Owned by other sectors** — the channel or DM the message sits in, its info panel, members,
archive and mute (E); the pinned-messages bar and the all-pins modal (E — pinning *a message*
is yours, the surface that lists them is E's); unread and mention counts (E); the same file
reached from `/w/{ws}/files` (I); in-call chat (C).

**Border with E, and it is the whole point of the split** — the message is yours, the container
is E's. You never open a channel's info panel; E never opens the composer. If a defect needs
both, it belongs to whoever found it; note the border in your log.

**Border with I** — an attachment in a message is yours, including the lightbox. The same file
reached from the files page is I's. If the two disagree about the same file, that is a finding;
log it and say so.

**Setup** — 4 browsers: a sender, two receivers and a fourth seat for receipts and reactions.
Alice owns `#qa-private` but not `#qa-general`, which is what exercises
the permission difference on her own messages inside a single account: Delete and Pin in the
channel she owns, only "Hide for me" in the one she does not.

**Priority if short** — message actions → composer and sending → attachments and previews →
threads and replies → receipts → saved messages

**Entry** — `/w/{ws}/c/{channelId}`, `/w/{ws}/d/{dmId}`, `/w/{ws}/chat/saved`, `?thread=<msgId>`

**Source** — `packages/features/chat/ui-web/{MessageItem,MessageList,MessageActionsMenu,MessageEditModal,MessageDeleteConfirm,ForwardModal,ShareMessageModal,Reactions*,ReactionPicker,LazyEmojiPicker,SeenViewers*,ThreadPanel,TypingIndicator,ExternalLinkPreview,InternalMessageLinkPreview,MessageFilePreview*}`;
`packages/composer-web`; `apps/web/src/features/chat`;
`apps/web/src/widgets/{ThreadPanel,ComposerPreviewPanel,ConversationDropZone}`

---

## Sector E · Chat — channels and DMs · 9.6%

The container a conversation lives in, how you get to it, and how the app tells you there is
something new in it. Runs on lane E.

**In scope**
- Channels — create, join, leave, archive and unarchive, members and the members modal, the
  info panel and its About/Members/Files/Pinned tabs, mute, the header, the channel preview
  popover, the archived-channels modal, the channel onboarding banner
- Pinned messages — the bar and the all-pins modal
- DMs — start, block and unblock, privacy gates, clear history, DM requests
- **The unread and mention mechanism, whole** — sidebar badges and bold state,
  `GET /workspaces/{ws}/unread`, `/w/{ws}/chat/mentions`, and the read-state that clears them
- The sidebar's conversation navigation — channel list, channel sections, DM list, the channel
  card menu including its mute submenu and delete confirm, the channel creation modal, the
  new-DM picker
- Call event message **rendering** in a channel

**Owned by other sectors** — the composer and everything you do to a message (D); the sidebar's
own chrome — header, footer, resize, collapse, sections as a layout (H); global and in-channel
search (H); channel-level permissions and roles (F); the numbers inside a call event message (A).

**Unread has exactly one owner, and that is deliberate.** The unread counter was published
twice on 2026-08-26, independently by two sectors, and merged only in the consolidated report —
the defect sat precisely on the old border. Sidebar badge, bold state, the unread endpoint, the
mentions page and the read-state are all yours; H owns the list's chrome and nothing that
counts.

**Setup** — 4 browsers. `qa.dave@` is in the workspace and in **no channel** — the
channel-authz negative case — and `qa.outsider@` is in the company but not the workspace.

**Priority if short** — channel management and the info panel → unread and mentions → DMs,
requests, block and clear history → the sidebar conversation list → archive and unarchive →
pinned messages

**Entry** — `/w/{ws}/c/{channelId}`, `/w/{ws}/d/{dmId}`, `/w/{ws}/chat/mentions`

**Source** — `packages/features/chat/ui-web/{ChannelHeader,PinnedMessages*}`;
`apps/web/src/widgets/{ChannelInfoPanel,ChannelMembersModal,ChannelPreview,ArchivedChannelsModal,Mentions,ClearDmHistory}`;
`apps/web/src/widgets/AppShell/{ChannelList,ChannelRow,ChannelSectionHeader,DmList,DmRow,DmRequestsModal,DmRequestList,ChannelCreationModal,channelCardMenu,NewDmPickerPopover}`

---

## Sector F · Admin and org · 12.2%

What a company and a workspace are, who is in them, and what those people are allowed to do.
Runs on lane F.

**In scope**
- Company — settings, dashboard, overview, the company switcher, company members, kick,
  workspace access
- Workspace — settings, danger zone, leave, avatar, quotas, recording quotas
- Members — the admin members table and its virtualized rows, search, kick
- Roles and permissions — both scopes (company and workspace), role create/edit/assign, the
  permission checkbox groups, the channel default role confirmation
- Invites — workspace invites and direct invites, the invite panels
- Audit log and its table, filters and pagination
- System settings — the panel, the raw editor, feature flags, user flag overrides
- Search **reindex**, call ceilings

**Owned by other sectors** — personal settings of every kind (G), even though they live in the
same `features/settings/` tree; the notification panel (H); guest join links (A).

**Border with G** — the split is whose settings they are, not which route they are under.
`/w/{ws}/settings/admin/*` and `/w/{ws}/settings/roles` are yours; `/w/{ws}/settings/{account,
profile,privacy,notifications,appearance,security,sessions,about}` are G's. `company` and
`workspace` under plain settings are yours.

**Border with H** — triggering a search reindex is yours; whether search then finds anything
is H's.

**This is the most backend-heavy sector on the map** (census range 6.2–15.9%: heavy server,
thin UI), so the strongest findings here are usually a response that disagrees with the screen.
Note also that the org-administration screens physically live in `features/settings/`, not
`features/admin/` — a directory-based reading mis-assigns them.

**Setup** — 4 browsers: owner, admin, `qa.outsider@` (in the company, not the workspace) and
`qa.guest@`. `seed.sh` repairs `company_members` and `workspace_members`, so a kick is
reversible with one `seed/seed.sh --lanes F`.

**Priority if short** — roles and permissions → members and kick → invites → company and
workspace settings → audit log → system settings and flags → quotas and ceilings

**Entry** — `/w/{ws}/settings/admin/{company,members,invites,workspaces,audit-log,system-settings}`,
`/w/{ws}/settings/roles?scope=company|workspace`, `/w/{ws}/settings/{company,workspace}`

**Source** — `apps/web/src/features/admin`; `apps/web/src/features/settings/admin`;
`apps/web/src/features/settings/roles`; `apps/web/src/features/settings/{CompanySettings*,WorkspaceSettings*,CompanyMembersSection,CompanyKickConfirmModal,CompanyWorkspaceAccess,WorkspaceDangerSection,WorkspaceQuotaPanel,WorkspaceRecordingsQuotaPanel}`

---

## Sector G · Identity and access · 11.1%

Who you are, how you prove it, and everything the app keeps about you personally.
Runs on lane G.

**In scope**
- Account and profile — account settings, avatar and crop, profile, availability, quick status
  and the status grid, deactivate
- Privacy — encryption, data export, login privacy, messaging privacy, visibility, online status
- Notification **settings** — the panel, do-not-disturb schedule, keyword chips
- Appearance settings and the theme preview card
- Security — 2FA, change password, sessions and "sign out other sessions"
- Blocked users
- About
- **Language and locale end to end** — the switcher, the locale cookie, the server-rendered
  locale, the system fallback, and what four dictionaries (en, ru, uz, uz-cyrl) do to layout
  and string length across the app
- Auth — login, the 2FA challenge, reactivate prompt, invite login guidance, signup, email
  verification and resend, magic link request and verify, forgot password, reset password,
  Google sign-in button
- Invite accept, and its error, loading and invalid states
- Onboarding — the name onboarding modal and its gate, company create

**Owned by other sectors** — company, workspace, roles, members and invites *administration*
(F); the notification **panel** and bell (H); the Tweaks overlay (H); `/w/{ws}/settings/calls`
(C, despite the route).

**Border with H** — notification *settings* are yours, the notification *panel* is H's.
Appearance settings are yours; the Tweaks overlay reached with Cmd/Ctrl+Shift+T is H's, and
whether the two write the same store is H's question to answer.

**Setup** — 4 browsers, and **one of them kept deliberately signed out** for `/signup`, email
verification, magic link and reset password as an anonymous visitor. That window is working as
intended: do not "repair" it, and do not point `ensure.sh` at it. Signing out other sessions
logs out every browser on that account — expect to re-login.

Signup, email verification and invite-accept cannot be tested without creating an account —
a deliberate exception to the fixtures rule. Create one, mark it clearly, log it under Cleanup.

**Priority if short** — auth and the state machine behind it (2FA, magic link, reset, signup,
verification — the 08-26 pass reached none of these) → sessions and security → privacy →
account and profile → language and locale → notification settings → appearance → blocked users

**Entry** — `/login`, `/signup`, `/forgot-password`, `/reset-password`, `/magic-link`,
`/auth/verify-email`, `/invite?token=`, `/company/create`, `/w/{ws}/settings/{account,profile,
privacy,notifications,appearance,security,sessions,about}`

**Source** — `apps/web/src/features/settings` (root, `privacy`, `blocked-users`);
`apps/web/src/features/{login,signup,verify-email,magic-link,forgot-password,reset-password,
invite-accept,name-onboarding,company-onboarding}`;
`apps/web/src/providers/{I18nRoot,DocumentLocaleSync,SystemLocaleFallback,AuthenticatedLocaleSync}`;
`apps/web/src/i18n`

---

## Sector H · Shell, people and discovery · 8.8%

The frame around everything else, the people in it, and how you find anything. Runs on lane H.

**In scope**
- Rail and its buttons; sidebar chrome — header, footer, resize, collapse, tooltips, the
  search pill, main nav; the workspace layout shells
- Workspace switcher, create workspace, pending invites, workspace bootstrap and its error and
  loading states
- Notifications — the panel, the bell and popover, notification items, the permission banner,
  the new-message toast, **web push and the notification service worker**
- Presence, the presence dot, and how presence is displayed
- **The user profile popup** — header, actions, info, common channels, custom status line,
  the block action, and the profile share modal
- Directories — people and channels tabs, filters, person and channel rows, the remove modal,
  the directories onboarding
- **Search** — global search (Cmd/Ctrl+K), its input, filters, tabs, results, sort control,
  scope chips, date segment, recent searches; and in-channel message search
- **The Tweaks panel** (Cmd/Ctrl+Shift+T) — theme, accent, density, font scale — and whether
  it and Settings → Appearance are two front doors to one store
- The help popover and the three global chords (Cmd/Ctrl+K, Cmd/Ctrl+N, Cmd/Ctrl+Shift+T)
- Connection status, offline behaviour, the sync queue, cross-tab locks and replay
- **Failure screens** — the root error boundary and fallback, the segment error fallbacks, the
  eight per-section `error.tsx`, the root and workspace 404s, the workspace catch-all route
- `/docs`
- **Negative checks that belong to nobody else** — `/w/{ws}/ai`, `/w/{ws}/phone` and
  `/w/{ws}/apps` must 404 and must have no rail tab; the Calls debug surfaces must not be
  reachable as an ordinary user. A debug panel a user can open is a finding

**Owned by other sectors** — the channel list, DM list and everything that counts unread (E);
notification *settings* (G); appearance *settings* (G); the files page (I); triggering a
search reindex (F).

**Border with E** — you own the sidebar as a container: ordering, sections, resize, collapse,
drag. The conversation lists inside it and every badge on them are E's.

**Seeded fixtures are invisible to global search, and it looks exactly like a product bug.**
The seeder writes straight to Postgres; the OpenSearch indices are fed by Kafka from the
services and there is no CDC on that path, so a seeded channel or account is never indexed.
Messages and files are fine, because they were posted through the app. Get a positive control
by creating the thing through the UI first. Lane E carries a permanent one, channel
`e-search-control`; make one on lane H before writing any "search does not find X" finding.

**Setup** — 4 browsers: one to drive, a second for presence and cross-user directory checks,
a third when a profile popup has to be seen from two sides, and a spare.

**Priority if short** — search → the profile popup and custom status → notifications and the
bell → directories → the shell and sidebar chrome → connection status and offline → the Tweaks
panel and appearance's second front door → failure screens and 404s → the gated-route negative
checks

**Entry** — `/w/{ws}/directories?tab=people|channels`, `/w/{ws}/c/{id}/search`, `/docs`,
anywhere with Cmd/Ctrl+K

**Source** — `apps/web/src/widgets/AppShell` (rail, sidebar chrome, workspace switcher, layout
shells, shortcuts); `apps/web/src/widgets/{NotificationsPanel,NotificationPermissionBanner,NewMessageToast,ProfilePopup,GlobalSearch,MessageSearch,TweaksPanel,HelpPopover,DocsPage,ConnectionStatusIndicator}`;
`packages/features/search`; `apps/web/src/features/directories`;
`apps/web/src/providers/{SyncEngineProvider,GlobalSearchHotkey}`;
`apps/web/app/{not-found.tsx,global-error.tsx}` and the per-section `error.tsx`;
`apps/web/src/lib/unreleasedSections.ts`

---

## Sector I · Calendar and files · 12.0%

Two products that share a sector because each is half a box on its own, and neither belongs
anywhere else. Runs on lane I.

**In scope**
- Calendar — month, week and day views, the header, event chips, create and edit event modals,
  the participants section and field, repeat, reminders select, delete confirm, event detail
  panel and popover, event search, the month overflow popover, upcoming and scheduled-today
  lists, location section, skeletons
- Meeting invitations — the panel, form and trigger; RSVP; scheduled meeting access section;
  the meeting settings section as it appears in the calendar
- **Reminders end to end**, including the reminder toast and its queue
- The join landing — `/calendar/join`, `/calendar/join/{token}`, the guest form and password
  form on it
- Files — the browser, left rail, header, grid and list views, scopes and facets, sort, view
  modes, selection bar and actions, upload modal, dropzone and upload queue, share selection
  and the recipient picker, delete, the storage widget, the deep-link alert, the attach picker
- The file viewer — preview dialog, shell, toolbar, zoom, page nav, more menu, the image
  lightbox, and all seven renderers (pdf, docx, spreadsheet, markdown, text, video, audio)

**Owned by other sectors** — starting a scheduled meeting and everything after (A); an
attachment inside a message and the lightbox opened from one (D); the files tab of a channel's
info panel (E).

**Border with A** — creating and editing a scheduled meeting is yours; pressing Start, and
everything that follows, is A's.

**Border with D** — the same file, reached two ways. An attachment in a message is D's; the
same file on `/w/{ws}/files` is yours. If the two disagree about it, that is a finding.

**A trap specific to this sector** — calendar event chips for later in the day sit below the
fold: the locator finds them but the click never lands and no dialog opens. Call
`scrollIntoViewIfNeeded()` first. A chip that "does nothing" is usually off-screen, not broken.

**Some defects here are invisible unless local and UTC dates disagree.** The team runs on +05,
so that window is 00:00–05:00 local and a daytime box never crosses it. Do not wait for the
hour — CDP `Emulation.setTimezoneOverride` puts them on opposite sides of midnight at any time
of day, and comparing two zones that agree against one that diverges, at the same instant, is
what turns a suspicious reading into a demonstration.

**Setup** — 4 browsers: one to drive, a second to receive an invitation or a shared file, a
third when an RSVP has to be seen from a third seat, and a spare.

**Priority if short** — create and edit events → invitations and RSVP → the file viewer and its
renderers → upload and share → views and navigation → reminders → the join landing → facets
and sort

**Entry** — `/w/{ws}/calendar`, `/w/{ws}/calendar/{eventId}`, `/w/{ws}/files`, `/calendar/join`

**Source** — `packages/features/calendar/ui-web`; `apps/web/src/features/calendar` (including
`join/`); `apps/web/src/features/files`; `apps/web/src/features/file-viewer`;
`apps/web/src/widgets/ReminderToast`

---

## Dedup against `reports/` before Jira

**A report already published for your ground is a dedup target, and a closer one than Jira.**
We never file without being asked, so `reports/` is where findings actually live and ALK holds
only the subset someone later chose to file — an unfiled finding is invisible to a Jira dedup
permanently.

Check the **directory**, not `reports/README.md`: the index is appended once at the end of a
run by design, so mid-run it is guaranteed incomplete and reads exactly like "no sibling
exists". List the files, then read the titles:

```bash
ls reports/aloqa-*.html
grep -o '<h2>.*</h2>' <report> | sed 's/<[^>]*>//g'
```

**Match on the titles, never on the lane letter in a filename.** A report covers whatever its
`<area>` token says it covers, and a letter tells you which fixtures produced it, not what is
inside. Reading the titles costs one `grep` per file and is the only thing that answers the
question you are actually asking.

**Reading a document is not checking a claim against it.** A session that had read the sibling
report, re-verified all five of its findings and quoted the colliding one twice still published
the duplicate, because it sat in memory as context rather than as a dedup target. It needs its
own pass.

---

## Files each session writes

`<area>` is fixed per sector so parallel sessions never collide or drift apart. `<date>` is
today, `<lane>` the fixture lane letter — which on this map is the sector letter.

**A second run of the same sector on the same lane and date** appends `-2`, `-3` and so on to
both the log and the report basename. Check whether a report already exists for your sector
today before you start — if one does, read it: a same-day predecessor has usually already
settled a chunk of your surface, and two findings have shared a root cause across such a pair.

| sector | session log | report source |
|---|---|---|
| A | `logs/AIRION-QA-<date>-<lane>-calls-lifecycle.md` | `reports/aloqa-calls-lifecycle-qa-<date>-<lane>.html` |
| B | `logs/AIRION-QA-<date>-<lane>-calls-room.md` | `reports/aloqa-calls-room-qa-<date>-<lane>.html` |
| C | `logs/AIRION-QA-<date>-<lane>-calls-studio.md` | `reports/aloqa-calls-studio-qa-<date>-<lane>.html` |
| D | `logs/AIRION-QA-<date>-<lane>-chat-messages.md` | `reports/aloqa-chat-messages-qa-<date>-<lane>.html` |
| E | `logs/AIRION-QA-<date>-<lane>-chat-spaces.md` | `reports/aloqa-chat-spaces-qa-<date>-<lane>.html` |
| F | `logs/AIRION-QA-<date>-<lane>-admin-org.md` | `reports/aloqa-admin-org-qa-<date>-<lane>.html` |
| G | `logs/AIRION-QA-<date>-<lane>-identity.md` | `reports/aloqa-identity-qa-<date>-<lane>.html` |
| H | `logs/AIRION-QA-<date>-<lane>-shell.md` | `reports/aloqa-shell-qa-<date>-<lane>.html` |
| I | `logs/AIRION-QA-<date>-<lane>-calendar-files.md` | `reports/aloqa-calendar-files-qa-<date>-<lane>.html` |

Driver snippets go to `scripts/callrig/snip/<lane>-<name>.mjs` — the **lane** letter, not the
sector, because that is what keeps two browsers apart. Append your row to `reports/README.md`
once, at the end of the run.

## If the sector runs dry before the deadline

The timebox will not release you, and padding with repeat passes over what already works is
the lowest-value thing available. In rough order of what has paid off:

1. **Go deeper on state, not wider on surface** — the same screen after a reload, as a
   different role, as a guest, in a channel or call with history, on a slow network, after a
   recovery, in another language.
2. **Re-verify your own findings.** Run each one again from a fresh page before it reaches the
   report; roughly a quarter of findings from a long unattended pass have not survived this.
3. **Take the surfaces nobody counted seriously** — the guest client (A's door and C's client),
   the profile popup, the Tweaks panel, the failure screens, offline and cross-tab. They are
   under-tested because no measurement ever sized them, not because they are unimportant.
4. **Re-verify an earlier report covering your surfaces** — `/verify-bugs` does this as its own
   pass: reproduce each finding on today's build, and where it does not reproduce, check
   `git log` for a fix before calling it a false positive.

## Not allocated

- **Calls debug surfaces** (~2.1% of the app) — developer instrumentation
  (`packages/features/calls/debug`, `apps/web/src/lib/callDebug`, `widgets/CallDebugMount`).
  Sector H checks once per pass that they are not reachable by an ordinary user, which *is*
  in scope.
- **AI, Telephony, Marketplace** — fully built, and gated to a 404 at the deployed sha
  (`apps/web/src/lib/unreleasedSections.ts`), with no rail tab and no API calls behind them.
  Sector H owns the negative check. Re-check whether they have been wired up before writing
  them off in a later session.
- **Mobile and desktop clients** — `ui-mobile` and `ui-desktop` exist in the feature packages
  and `apps/mobile` has 353 components; the web app is what these sectors cover.
