# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.
## What this repo is

A QA workspace for black-box testing **Aloqa**, the team-chat app at https://airion-cargo.store. There is no application source code here and no build/lint/test tooling — the "work" is driving the live app through browser tools, recording findings, and publishing a report. Nothing here is meant to be built.
**Scope: what a user can see and do.** Every test is something reachable through the interface — a click path a person could follow. API calls are instrumentation and proof for those paths (measuring the request behind a button, checking a boundary a user could hit), never the subject of testing on their own. Surfaces with no UI — background jobs and tickers, service-to-service gRPC, webhook handlers, endpoints no screen calls, migrations — are the developers' job, not this one. An endpoint no screen reaches is out of scope even when it is clearly untested.
Contents:
- `AIRION-QA-<date>.md` — the running bug log for a session (raw, one `### BUG-N [Severity] [backend|frontend] title` block per finding, plus "Verified working" sections).
- `.playwright-mcp/` — auto-generated Playwright MCP snapshots/screenshots/console logs. Disposable; don't read through it for context.
- `reports/` — HTML source of any published report. Write it here, publish with the Artifact tool, and record the resulting URL next to the file so a later session can pass it back as `url` and update in place; publishing without `url` creates a separate artifact. The tool can delete an artifact's *assets* but not the artifact itself — removing one is manual, via the claude.ai artifacts gallery.
- `seed/` — fixture seeder for staging (`seed.sh`, `seed_qa_fixtures.py`); see "QA fixtures".
- `scripts/` — helper scripts. `alk_open_bugs.py` dumps the open ALK bugs through `twg` for report dedup (see Reporting); `callrig/` drives real WebRTC calls (see "Call testing rig").
## Upstream: the product repos and the team's own QA process

Source for the app under test, both private and readable with the local `gh` login:
`AmirkhonMakhkamov/aloqa-frontend` (TypeScript pnpm monorepo) and `AmirkhonMakhkamov/aloqa-backend` (Go).
Cloned at `~/Projects/aloqa-src/{aloqa-frontend,aloqa-backend}` — outside this repo, so nothing here tracks them. `git -C ~/Projects/aloqa-src/aloqa-frontend pull` before relying on them.
- **Read `docs/qa/` in the frontend repo before inventing process here.** It already holds `p8-calls-qa-staging-checklist.md`, `staging-browser-evidence-runbook.md` and `2026-08-17-weekly-merged-pr-testing-progress.md`. The team's ship gate is **merged → QA green → Done**, so QA is expected to verify merged PRs rather than roam.
- Their acceptance rule: a finding counts as evidence only when recorded against the **staging release tag and the SHA the build was cut from**. Put both in the session log and in any ticket filed.
- Traces, videos, screenshots and `auth.*.json` are treated as raw sensitive artefacts — never attach them to Jira or GitHub; quote sanitized facts only.
- Verdicts in their harness are `reproduced` / `not_reproduced` / `inconclusive`, where **`inconclusive` always means a missing precondition, never a pass**. Useful discipline for findings here too: name the precondition instead of calling a state absolute.
- `packages/features/` — `admin calendar calls chat files search settings` — maps almost 1:1 to product areas, so a diff tells you what to test. Commit messages carry ALK ids (`fix(calls): … (ALK-3359)`), so `git log <lastTestedTag>..HEAD` names exactly which tickets are waiting on verification.
- Use the source to decide **where** to look and to add a root-cause pointer to a ticket (ALK tickets often carry a `Precise root cause` section naming files and lines). Don't derive expected behaviour from it — the testing itself stays black-box.
- Source widens *where to look in the UI*, not what counts as testable: it does not pull headless surfaces into scope (see **Scope** above).
- When a screen shows a 500 or a generic error, two files explain what it should have been: `platform/pkg/apperror/keys.go` (backend) lists every error key, and `apps/web/src/generated/openapi.json` (frontend) is the generated contract for the request behind the screen. Use them to root-cause what you saw, not as a list of things to go test.
- Clone with `--filter=blob:none` if disk matters — a full backend clone is 1.4 GB.
## QA fixtures — use these accounts, don't create new ones

`seed/seed.sh` seeds a permanent, isolated fixture set on staging. It is idempotent: re-run it any time the data looks wrong and it repairs drift rather than duplicating. `seed/seed.sh --verify` reports state without writing. You should never need to hand-create QA users again.
It auto-creates a venv at `~/.cache/aloqa-qa-venv` (psycopg + bcrypt); override with `QA_VENV=/path ./seed/seed.sh`.
To add a user or channel, edit the `USERS` / `CHANNELS` / `ROLES` lists at the top of `seed/seed_qa_fixtures.py` (fixed IDs, 15 chars: prefix + 14 base36) and re-run — existing rows are untouched. Pin IDs only for things referenced by name (users, channels, roles, company, workspace); let membership and permission rows take their table defaults — deriving those IDs by hand collides, and the `(scope, user)` unique keys already make them idempotent.
- Company **QA Fixtures** `O4QAF1XTURESO01`, workspace **QA Workspace** `W4QAF1XTURESO01` — an isolated clean room containing only `qa.*` accounts. Test here.
- **Password for every account: `QaPass123!`**, all `email_verified = true`, all timezone Asia/Tashkent.
| account | id | in workspace | purpose |
|---|---|---|---|
| `qa.owner@aloqa.test` | `U4QAOWNER000001` | yes | company + workspace owner; owns #qa-general/#qa-empty/#qa-archived |
| `qa.admin@aloqa.test` | `U4QAADMIN000001` | yes | company Admin role (`company.<CO>.*`) |
| `qa.alice@aloqa.test` | `U4QAALICE000001` | yes | primary actor; **owns #qa-private** |
| `qa.bob@aloqa.test` | `U4QABOB00000001` | yes | second actor for cross-user checks |
| `qa.carol@aloqa.test` | `U4QACAROL000001` | yes | third actor |
| `qa.dave@aloqa.test` | `U4QADAVE0000001` | yes | in workspace but in **no channel** — channel-authz negative case |
| `qa.outsider@aloqa.test` | `U4QAOUTSIDER001` | **no** | company-only — workspace-authz negative case |
| `qa.guest@aloqa.test` | `U4QAGUEST000001` | yes | guest role (`is_guest = true`) |

| channel | id | type | members |
|---|---|---|---|
| `#qa-general` | `C4QAGENERAL0001` | public | owner, admin, alice, bob, carol, guest |
| `#qa-private` | `C4QAPRIVATE0001` | private | alice (owner), owner, bob |
| `#qa-empty` | `C4QAEMPTY000001` | public | owner only — empty-state tests |
| `#qa-archived` | `C4QAARCHIVE0001` | public, archived | owner, alice |

Alice owning `#qa-private` but not `#qa-general` exercises channel-permission differences inside a single account: her own message shows Delete + Pin in the channel she owns and only "Hide for me" in the one she doesn't.
Staging also holds unrelated `qa.*` leftovers (`qa.probe.*`, `qa.livecall.*`) from older sessions — match fixtures by exact email or fixed id, never `LIKE 'qa.%'`.
## Start of a session

1. `seed/seed.sh --verify` — confirms staging is reachable and the fixtures are intact. Then `GET /api/v1/auth/me` in each browser to learn which account it holds (sessions persist between runs).
2. Record the deployed staging build — `curl -s https://airion-cargo.store/ | grep -o 'data-dpl-id="[^"]*"'`. It is in the server HTML only; the attribute is gone from the hydrated DOM, so read it with curl, not from the browser. Put it at the top of the session log. No equivalent stamp found for the backend.
3. Settings → Account → Language → English on every account you'll use.
4. `scripts/alk_open_bugs.py --out <path>` once, up front — caches the open ALK bugs **with their descriptions** for the whole session, so dedup costs no further Jira calls. Re-run with `--refresh` before writing the report or filing, to catch tickets opened during the session.
5. Create `AIRION-QA-<date>.md` and log as you go — one `### BUG-N [Severity] [backend|frontend] title` block per finding, with the request/response or DOM measurement that proves it.
6. Severity: **Critical** = a feature is unusable (500s); **High** = wrong data, security/privacy, or a control that can't be reached; **Medium** = broken UX with a workaround; **Low** = cosmetic, copy, i18n.
## Session conventions

### Reporting

- **Write the report in Russian**, keeping app labels, feature names, API paths, HTTP codes, CSS/DOM terms in English. Call out locale-specific bugs explicitly.
- **Label every finding `[backend]` or `[frontend]`** immediately after the severity in the heading — `### BUG-N [High] [backend] title` — based on where the defect lives (an API 500 is backend; a clipped label or unreachable control is frontend).
- The published report is bugs-only and written for developers who know nothing about the test setup — no account names, test call names, meeting/workspace/channel IDs, rig ports or fake-device labels. (The raw `AIRION-QA-<date>.md` log keeps full provenance, including verified-working notes.)
- Each finding carries a click-by-click reproduction path with UI labels in **English** (the app is used in English) inside the Russian prose, plus a "Как должно быть" expected-behaviour block. Plain human wording — not "no-op", "accessible name", "оверлей". Severity lives in Jira's Priority field, not in the description text.
- A finding that gets withdrawn stays in `AIRION-QA-<date>.md` with the reason and the measurement that killed it — otherwise a later session re-discovers it and files it again.
- The app is in active development — cosmetic trivia gets trimmed at triage rather than filed. This filters what gets **written up**, not what gets **tested**: keep probing everything and keep every finding in `AIRION-QA-<date>.md`, then decide which ones earn a place in the report or an ALK ticket.
- **Dedup against Jira before reporting.** Don't file or report anything already open in project **ALK** as `issuetype = Bug` with `status IN ("Backlog","Ready","In Progress")`.
- Dedup by reading, not searching: `alk_open_bugs.py --print` and read every summary, then `--show <KEY>` for the full description of anything even loosely related. Titles and descriptions diverge often enough that keyword and stem matching misses real duplicates; `--grep` is for spot-checks only. Both stages read the cached dump, so only the first call hits Jira.
- Jira reads trip a ~25-minute cooldown after very few queries — cache once, read locally. `twg doctor` reports "Token: valid" while throttled, and `twg --output-file` writes `{"ok":false,"error":{"code":"TWG_RATE_LIMITED"}}` into the file while still printing a normal `stdout=<path>` line; check the payload, not the exit path.
- Fallback when twg is throttled: Atlassian MCP `searchJiraIssuesUsingJql`, same JQL, cloudId `823c42fe-9add-4000-b9b6-0c64496759f8`, page via `nextPageToken`. Results over ~60k chars are written to a file instead of returned — parse it with python.
- ALK ticket summaries are written in Russian with bracket tags, e.g. `[FE-WEB][CALLS][SIDE ROOMS] …` — match that style if filing.
- Jira access: `getAccessibleAtlassianResources` under-reports — it lists only Confluence scopes for `ttbrm.atlassian.net`, yet Jira calls succeed. Probe with a real call (`getVisibleJiraProjects`), don't infer from scopes.
- `twg` (Atlassian Teamwork Graph CLI): `~/.local/bin/twg`, OAuth device-flow login for `ttbrm.atlassian.net`, token refreshed by a launchd job. `twg doctor` checks auth; `twg login` re-authenticates (Atlassian's docs say it needs a controlling terminal — the install ran in Terminal.app; not tried from a tool). Query shape: `twg -o json jira workitem query --jql '…' --first 100 [--after <pageInfo.nextCursor>]` — this shape does **not** return descriptions; for those use the REST path `twg api 'jira:/rest/api/3/search/jql' -X POST --input -` with `{"jql":…,"fields":["summary","description"]}` (same credentials, plain text, no MCP card); envelope and `--select`/`--output-file` handling live in `scripts/alk_open_bugs.py`. Calling `twg api` directly: a POST **must** have `--input -` or the body is dropped and Jira answers 415, and Jira's error shape (`{"status":415,"title":…}`) carries neither `ok:false` nor `errorMessages` — a success check looking only for those will pass on a failure. Skills bundle: `~/.claude/skills/twg`.
- **All Jira traffic goes through `scripts/jira.py`** (wraps `twg api`), not the Atlassian MCP: `jira.py search --jql '…' --out F`, `jira.py get KEY --out F`, `jira.py comment KEY --file body.md`, `jira.py create --summary '…' --file body.md --priority High --labels frontend`. Bodies are written in Markdown and converted to ADF (headings, paragraphs, fenced code with language, bullet/numbered lists, tables, `**bold**`, `` `code` ``). Reads write the payload to a file so it never enters context.
- The Atlassian MCP is a fallback for when `twg` is throttled. Prefer `jira.py`: every MCP create/comment echoes the whole issue back — your description verbatim plus reporter/assignee/project blocks with four avatar URLs each — and no flag trims it.
- Filing defaults: project `ALK`, issue type Bug, priority explicit (the project stamps **Medium** otherwise), area label `backend`/`frontend`. New issues auto-assign to "TBM - Dasturiy taʼminot"; pass an assignee to override.
### Accounts & access

- Use the `qa.*` fixtures above, in QA Workspace. Everyone there is a fixture account, so `@all`/`@here`, blocking, DMs and destructive tests are all fair game — nothing reaches a real person.
- Log in at `/login` (email + password form); sign out via Profile → Sign out. Probe the API with `fetch('/api/v1/…', {credentials:'include'})` from inside a logged-in tab.
- Cleanup is optional now that the workspace is disposable, but `seed/seed.sh` only repairs structure — it never deletes messages. If a channel gets too noisy, archive it and add a fresh one to the fixture. Note plain members can't delete their own messages (only channel owners can), so test messages tend to stay.
- "Sign out other sessions" on an account logs out every browser using it — expect to re-login elsewhere.
### Browser tooling

- Run **as many browsers as the scenario needs** — one per account is fine, and there are 8 fixture accounts. Each browser holds its own session, so a 3-way or 4-way test is just three or four logged-in tabs.
- Chrome DevTools MCP (`mcp__plugin_chrome-devtools-mcp_chrome-devtools__*`, from the `chrome-devtools-mcp` plugin; runs its own Chrome via `npx chrome-devtools-mcp` at the plugin's pinned version): `emulate` takes `networkConditions: Offline|Slow 3G|Fast 3G|Slow 4G|Fast 4G` and `cpuThrottlingRate`; `performance_start_trace`/`performance_analyze_insight`/`lighthouse_audit` for timing; `list_network_requests`/`get_network_request` return bodies; heap snapshots. CPU throttling also works via Playwright's own `ctx.newCDPSession(page)` + `Emulation.setCPUThrottlingRate`.
- Viewports: test at desktop widths. Mobile and narrower-than-desktop windows are out of scope, and layout findings that only appear below desktop width are not written up.
- Know each browser's throttling: Playwright MCP (`mcp__playwright__*`) has been visible and unthrottled; the Claude Browser pane (`mcp__Claude_Browser__*`) was usually `visibilityState: hidden` with timers throttled to 1/s. A "slow channel load" false positive came from timing in that hidden pane — `document.visibilityState` is worth checking before trusting any timing.
- Playwright selectors: prefer `button[aria-label="…"]` and `data-testid` (e.g. `call-end-confirm-submit`); `text=`/`has-text` selectors routinely match two elements (strict-mode error) or hit sidebar headers — scope to `main`.
- `browser_file_upload` accepts files only from inside this repo (allowed roots: this directory and `.playwright-mcp/`) and fires only after clicking "Browse"; targeting the hidden `<input type=file>` did not work.
- `browser_network_request` takes the 1-based `index` from `browser_network_requests`, not an id.
- Keep `browser_evaluate` return values small (slice strings, never return element lists) — large results get dumped to a file and truncated.
- Measure layout defects, don't eyeball them: clipping = `scrollWidth > clientWidth` on leaf nodes; unreachable controls = `getBoundingClientRect().left >= innerWidth` with `documentElement.scrollWidth === innerWidth`; thread/pinned counts via the API.
- The published artifact URL needs a claude.ai login (Playwright sees a 404). To eyeball the HTML, wrap it in `<!doctype html><html><body>…` in a temp folder and serve with `python3 -m http.server`; delete the folder after.
- Session clock: `TZ=Asia/Tashkent date '+%Y-%m-%d %H:%M:%S %Z'` — the app and the team run on +05.
### Call testing rig (`scripts/callrig/`)

- `scripts/callrig/launch.sh <profile> <cdp-port>` — one Chrome for Testing per account with `--use-fake-device/ui-for-media-stream`, started maximized, profile at `~/.cache/aloqa-callrig/<profile>`; drop `audio.wav` / `video.y4m` in that dir for per-user distinguishable media. The Chrome path is hardcoded to a Playwright cache build — update `CH` if that build is gone.
- **One window per participant, not tabs of one window.** Guest sessions share the browser's cookie jar and occupy 3 slots (`GUEST_COOKIE_MAX_LIVE`, see ALK-2721) — a 4th guest in the same window evicts the oldest, and the resulting reconnects look exactly like application defects. `launch.sh` gives each participant its own profile and window.
- `node scripts/callrig/drive.mjs <port> snip/<name>.mjs` connects over CDP and runs a snippet exporting `default async ({page, ctx, browser, pages})`; it prints the return value, so keep it JSON-serializable and small.
- `scripts/callrig/d <port> snip/<name>.mjs` — wrapper that cd's first; the Bash tool's working directory resets between calls, so bare `node drive.mjs` fails intermittently.
- `snip/lib.mjs` exports `HOOK` (auto-injected — `window.__pcs`, `__gumCalls`, `__gdmCalls`), `RTC_STATS`, `UI_STATE`; ready-made snippets sit in `snip/`.
- `RTC_STATS` collapses simulcast layers — it can report 0 outbound video for a participant who is streaming fine on a lower layer. Confirm from the *receiving* side (`framesDecoded` rising) before concluding media has stopped.
- Prove media actually flows with `RTCPeerConnection.getStats()` (`bytesSent`, `framesDecoded`, `audioLevel`, `totalAudioEnergy`) rather than from the tiles on screen.
## Staging infrastructure

Credentials for Postgres, Redis, MinIO, SigNoz and SSH live in **`seed/.env.local`** — gitignored, never committed (this repo's GitHub remote is public). `seed/seed.sh` sources it automatically; `cat seed/.env.local` when you need a value by hand. If it is missing, `.claude.local.md` documents the keys it must define.
- A user only works if it exists in **all five** databases that hold user rows. `auth_db` is the identity of record (`password_hash`, `email_verified`); `org_db` owns companies/workspaces/channels/roles/memberships; `messaging_db`, `notification_db` and `realtime_db` keep replicas. `file_db` and `gateway_db` have none.
- Passwords are **bcrypt `$2a$`, cost 10**. Go's bcrypt rejects `htpasswd`'s `$2y$` — mint hashes with python `bcrypt.gensalt(rounds=10, prefix=b'2a')`.
- System `pip3 install` is refused (PEP-668, externally-managed). Use a venv — `seed/seed.sh` already provisions one.
- IDs are `generate_slack_id(prefix)` = prefix + 14 base36 chars: `U` user, `O` company, `W` workspace/workspace_member, `C` channel, `R` role, `K` company_member, `P` channel_member & role_permission. Membership tables all have `(scope, user)` unique keys, which is what makes the seed idempotent.
- `psql`: source `seed/.env.local`, then **`export PGPASSWORD="$QA_PGPASS"`** — psql does not read `QA_PGPASS` and will sit on an interactive prompt without it. Then `psql "host=$QA_PGHOST port=$QA_PGPORT user=$QA_PGUSER dbname=<db> sslmode=require"` (**sslmode=require** is mandatory).
## How the app is addressed

- Routes: `/w/{ws}/c/{channelId}` channel, `/w/{ws}/d/{dmId}` DM, `/w/{ws}/chat/saved`, `/w/{ws}/chat/mentions`, `/w/{ws}/directories?tab=people|channels`, `/w/{ws}/calendar`, `/w/{ws}/calls`, `/w/{ws}/files`, `/w/{ws}/settings/{account|privacy|sessions|appearance|notifications|about}`. `?thread=<msgId>` opens a thread panel; `?m=<msgId>` deep-links a message.
- API base `/api/v1`; errors are `{"code","key","message","trace_id"}`. Frequently used: `POST /messaging/messages {channel_id, body}`, `GET /messaging/channels/{id}/messages?limit=≤100`, `GET /messaging/messages/{id}/thread?limit=≤100`, `GET /search?q&company_id&workspace_id`, `GET /workspaces/{ws}/presence|unread|channels`, `GET /users/me/files?workspace_id&scope=own`, `POST /calendar/meetings`, `POST /messaging/users/block|unblock`, `POST /channels/{id}/archive`, `GET /users/me/channels/archived`.
- Calls: `/w/{ws}/calls`; `PATCH /api/v1/meeting/{id}` (meeting settings), `GET /api/v1/meetings/active|current`.
- Messages are rendered from `[data-message-id]` elements; the composer is `div[contenteditable="true"][aria-label="Compose message"]` (Lexical). Bodies are stored markdown-escaped (`QA\-NET\-1`).
- To fail requests, use Playwright (`browser_run_code_unsafe`), not a console `window.fetch` override — the app captures `fetch` at module load. `page.context().setOffline(true)` fails every request; `page.route('**/api/v1/…', r => r.abort('failed'))` fails one endpoint (`page.unroute` to undo). WebSocket behaviour under `setOffline` is unverified.

## How we work

- **Measure, don't eyeball.** Every finding carries the request, response, or DOM measurement that proves it. Plausible-looking defects — slow loads, mispositioned elements, stray debug panels — have repeatedly evaporated under measurement.
- **Reproduce before writing up.** Run the same check at least twice and probe the boundary — different timing, entry point, settled vs fresh state — before describing behaviour as unconditional. Intermittent and state-gated defects read as absolute on a single run.
- **Functional bugs come before security bugs.** The question that earns time is whether a feature does the right thing for the person using it — wrong results, silent failures, state that contradicts what the user was told. Deliberate authz and leak hunting is lower priority; don't open a session with it. A security or privacy defect found while testing normally is still logged and rated on its merits.
- **Races are out of scope.** Don't construct scenarios where two actors act at the same instant, and don't build harnesses to provoke them — such findings are timing-dependent and land as tickets nobody can confirm. Sequential multi-account testing (A acts, then B observes) is not a race and stays in scope.
- **Check whether staging is broken before blaming the product.** A 500 on a path the code clearly handles is often environment drift, not a defect: compare `schema_migrations` against the repo's migrations, and the live columns against what the failing query inserts. Getting this wrong files a Critical against code that is fine.
- **Suspect the rig before the app.** A finding that depends on how the test was driven is not a finding: check window isolation, `document.visibilityState`, and whether a helper is hiding the truth (see `RTC_STATS`) before concluding the product is broken.
## Maintaining this file

Two kinds of line, and nothing else:

- **Environment** — fixtures, scripts, infrastructure, how to run things. Plain instructions, undated; they break loudly when wrong.
- **Method** — how we work. Written as a rule, but only once the same problem has cost us twice, or the conclusion follows from how the system is built rather than from one observation. A single surprise goes in the session log, never in here as a rule.
- No narrative. State the conclusion; evidence and reasoning live in `AIRION-QA-<date>.md`. If a line needs "because on <date> X happened", it belongs in the log.
- No measured values, counts, limits, error keys, or current-state notes — they drift with every release and belong in `AIRION-QA-<date>.md`. If a line states what the app *currently does*, it is in the wrong file.
- **Nothing that could limit future testing goes in without explicit approval** — no rule, constraint, prohibition, scope limit, "not testable", "don't", "never", "only" or "must", however well-evidenced. Propose the exact diff, wait for a yes, and only then write it. If in doubt whether a line limits testing, treat it as limiting.
