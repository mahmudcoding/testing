# AIRION QA — 2026-08-27 — lane C — re-verification (chat)

Build: frontend `v0-61-0-rc-6-5be489db0ca6` (tag v0.61.0-rc.6, commit 5be489db0ca6), read via `curl -sL https://airion-cargo.store/`.
Note: `curl -s` without `-L` returns 301 + 169 bytes and no stamp — must follow the redirect.
Lane: C. Sector: Chat. Source report: `reports/aloqa-chat-qa-2026-08-26-C-2.html` (30 findings).
Task: re-verify each finding on the current build, write a handover snippet `scripts/callrig/snip/c-<name>.mjs`, add a repro block to the report.

Fixtures verified: `seed/seed.sh --verify --lanes C` → "All fixtures present and correct."
Rig: alice 9242, bob 9243, carol 9244 (lane C block 9240–9249).

## Current state

- **DONE.** All 30 findings re-verified on `v0.61.0-rc.6` / `5be489db0ca6`: **30 of 30 still reproduce**,
  none withdrawn. 30 handover snippets written, each run twice with `ready:true`; 30 repro blocks in
  `reports/aloqa-chat-qa-2026-08-26-C-2.html`; `python3 scripts/verify_report.py <report>` → ALL CHECKS PASS;
  `bench.load()` counts 30 for lane C.
- Two findings are right about a real bug but **stale in one detail** — see "Detail drift" below (#20, #30).
- Rig left as: alice 9242 up; bob/carol stopped; dave 9245 back on dave (it had been re-signed as alice
  for #23 and was restored with `QA_EMAIL=qa.c.dave@aloqa.test ./d c:dave snip/switch-account.mjs` —
  `ensure.sh` alone reported "login failed" because a session was already present).
- `#qa-private` left unmuted (`DELETE /notifications/channels/C4QCPRIVATE0001/mute` → 200, local key cleared).
- Browsers up: alice 9242, bob 9243, carol 9244.

## Verdicts

| # | finding | verdict | snippet |
|---|---|---|---|
| 1 | Неудавшееся удаление показано как выполненное | CONFIRMED | c-fail-delete.mjs |
| 2 | Кнопка Remove в списке участников не делает ничего | CONFIRMED | c-remove-member.mjs |
| 3 | Unmute notifications не снимает приглушение | CONFIRMED | c-unmute-dead.mjs |
| 4 | Jump to pinned message не доходит до цели | CONFIRMED | c-jump-pinned.mjs |
| 5 | В треде форматирование меняет жест отправки | CONFIRMED | c-thread-send-gesture.mjs |
| 6 | @all/@here не попадают на страницу Mentions | CONFIRMED | c-mention-all-missing.mjs |
| 7 | Удалённый родитель — ответы недостижимы + Retry | CONFIRMED | c-thread-orphan.mjs |
| 8 | Saved Messages: нет Unsave, только Delete | CONFIRMED | c-saved-no-unsave.mjs |
| 9 | Архивный канал не заморожен | CONFIRMED | c-archived-not-frozen.mjs |
| 10 | В архивном канале Edit ничего не делает | CONFIRMED | c-archived-edit-noop.mjs |
| 11 | Правка превращает «- …» в разметку | CONFIRMED | c-edit-markdown.mjs |
| 12 | Цитата в треде показывает экранирование | CONFIRMED | c-thread-quote-escape.mjs |
| 13 | Send as file ни на что не влияет | CONFIRMED | c-sendasfile-noop.mjs |
| 14 | Переименование не приводит имя к слагу | CONFIRMED | c-rename-no-slug.mjs |
| 15 | Удалённый ответ остаётся в панели треда | CONFIRMED | c-thread-del-stale.mjs |
| 16 | Ответивший в треде не получает уведомлений | CONFIRMED | c-thread-no-notify.mjs |
| 17 | Заметка в Saved Messages без Edit и Reply | CONFIRMED | c-saved-note-actions.mjs |
| 18 | Нет предела длины Name/Topic, ошибка не поясняет | CONFIRMED | c-details-length.mjs |
| 19 | Dismiss preview не сохраняется | CONFIRMED | c-dismiss-preview.mjs |
| 20 | /me из меню не применяется | CONFIRMED (деталь изменилась) | c-slash-me.mjs |
| 21 | /shrug по Enter стирает хвост | CONFIRMED | c-shrug-eats-tail.mjs |
| 22 | Напечатанное @имя не упоминание | CONFIRMED | c-typed-mention.mjs |
| 23 | Приглушение не отдаётся сервером | CONFIRMED | c-mute-not-synced.mjs |
| 24 | Channel details с клавиатуры недостижима | CONFIRMED | c-details-keyboard.mjs |
| 25 | «Сервер отклонил файл» при любой ошибке | CONFIRMED | c-upload-error-copy.mjs |
| 26 | Неудачная отправка стирает набранное | CONFIRMED | c-failed-send-clears.mjs |
| 27 | Композер предлагает файлы и их отвергает | CONFIRMED | c-accept-rejects.mjs |
| 28 | Copy text копирует username | CONFIRMED | c-copytext-username.mjs |
| 29 | Озвучка читает экранирование markdown | CONFIRMED | c-a11y-escape.mjs |
| 30 | Список ролей печатает id роли | CONFIRMED (деталь изменилась) | c-role-id-visible.mjs |

## Incidents

**Scratchpad collision with the lane-D session (13:05).** The session scratchpad
`/private/tmp/claude-501/-Users-mahmud-Projects-testing/3b2777d2-.../scratchpad/` is **shared with at
least the lane-D session** — it already contained `lane-A..E-findings.md`, a `D/` subdirectory and
`insert_repro.py`. I wrote a helper `addrepro.py` there; D overwrote it with its own `addrepro.py`
pointed at `reports/aloqa-org-qa-2026-08-26-D-2.html`. My next invocation therefore inserted a
lane-C repro block (`data-lane="D"`, `./d d:alice snip/c-remove-member.mjs`) into **lane D's report**,
after the `<h2>` of `[FE-WEB][ADMIN] Право создавать роли выдано…`.
Reverted byte-exactly (`git diff reports/aloqa-org-qa-2026-08-26-D-2.html` now shows only D's own two
blocks, `d-sidebar-right.mjs` and `d-appear-revert.mjs`). All my helpers moved to `scratchpad/C/`.
The failure was silent: the wrong script printed a plausible success line, and only the *format* of
that line gave it away. Same family as the shared-snippet-name trap in CLAUDE.md, one directory up.

## Findings detail

### 1 — CONFIRMED
Own channel (private, alice is owner). Message posted, `page.route` aborts the DELETE, browser still online.
```
deleteRequestsAborted: 1
author screen:  "QA QA Alice, 13:02 This message was deleted"
visible notices ([role=status]|[role=alert]|[data-sonner-toast]): none, 14 samples over 8.4 s
GET /messaging/channels/<ch>/messages?limit=10 -> body "QA-RV1-say7z delete-me" still present
second member's window on the same channel: message rendered
```
Snippet performs the delete itself: Playwright interception (`page.route`) and CDP
`Network.setBlockedURLs` both die with the connection — measured, see Notes.

### 2 — CONFIRMED
```
clickLanded (capture listener):  1
non-GET /api/v1 requests in 5 s: 0
dialogs after the click:         0 (only the details panel itself)
members on server:               3 -> 3
button: aria-label="Remove QA Bob"  disabled=false  36×36  opacityProduct=1
        pointer-events=auto  elementFromPoint at centre -> the button
```

## Notes for later sessions

- **Neither Playwright `page.route` nor CDP `Network.setBlockedURLs` survives the end of a `drive.mjs`
  run**, and neither does `ctx.addInitScript`. Measured all three: an init-script marker set in run 1
  reads `null` in run 2; a URL blocked in run 1 answers `200` in run 2. So a handover snippet for any
  "make the request fail" finding cannot leave the failure armed for the human — it must perform the
  failing action itself and hand over the finished contradiction (the `_repro-template.mjs` contract
  allows this: "or perform it and say what they should be looking at").
- `page.locator('[role="tab"],button').filter({hasText:/^Members/}).first()` picks a **button**, not the
  tab — the Members tab then reads `aria-selected="false"` and the panel never switches. Scope to
  `[role="tab"]` alone.
- `button[aria-label^="Remove "]` also matches **`Remove <emoji> reaction`** in the message list
  (`pointer-events: none`, 24×22, not topmost). Exclude `/reaction/i`.

### 3 — CONFIRMED
```
Mute notifications -> "For 1 hour"   header button flips to "Unmute notifications", aria-pressed=true
click "Unmute notifications"         click landed (capture listener) = 1
non-GET /api/v1 requests in 5 s:     0
header button after:                 "Unmute notifications", aria-pressed=true
```
Mute state is client-side: `localStorage["aloqa.channel.mute"] = {"state":{"mutedByChannel":{"<ch>":<expiryMs>}},"version":1}`.
A server-side `DELETE /notifications/channels/<ch>/mute` does **not** clear the header — the key has
to be removed too. That is why the snippet resets both before muting.

### 4 — CONFIRMED, and worse than reported
Pinned seq 1 of ~400 in a long channel, clean load, banner `button[aria-label="Jump to pinned message"]`.
```
before the click: target in DOM = false, messages loaded = 102
after the click, 25 samples over 30 s:
  messages loaded:  102 (never changed — the report saw 177 -> 266)
  target present:   never
  target in view:   never
  visible notices:  none
```

### 5 — CONFIRMED
```
window 1920x1062, both hints on y=1032
channel hint  x=392   "Enter to send · Shift+Enter for new line"   visibility:visible
thread hint   x=1491  "Enter to send · Shift+Enter for new line"   visibility:hidden, aria-hidden=true
after Bold in the thread field:
thread hint   x=1491  "Cmd/Ctrl+Enter to send · Enter for new line" visibility:hidden, aria-hidden=true
channel hint  unchanged and visible
Markdown formatting buttons: channel aria-pressed=false, thread aria-pressed=true
Enter -> messages 102 -> 102, no reply, thread composer height 24 -> 48
```

### 6 — CONFIRMED
Composer requests (measured, so an API post with the same flags is equivalent):
```
{"channel_id":"<ch>","body":"@all  <tag> ALL","mention_all":true}
{"channel_id":"<ch>","body":"@here  <tag> HERE","mention_here":true}
{"channel_id":"<ch>","body":"@qa_c_carol  <tag> DIRECT","mention_user_ids":["U4QCCAROL000001"]}
stored: @all mention_ids (absent) | @here (absent) | control ["U4QCCAROL000001"]
recipient GET /notifications: three "You were mentioned" — @all, @here and the control
recipient /chat/mentions: "All (3)" — three entries, all direct; neither broadcast listed
```

### 7 — CONFIRMED
```
before delete   GET /messaging/messages/<parent>/thread  200, replies 3
                channel view: "... parent   3 replies"
after delete    channel view: "This message was deleted" — the replies marker is GONE from the row,
                so the finding's "click the replies marker" path no longer exists; ?thread=<id> does
                GET /messaging/messages/<parent>/thread  404
                {"code":404,"key":"MESSAGING_PARENT_MESSAGE_NOT_FOUND","message":"parent message not found: сообщение не найдено"}
                stored parent: body "", reply_count 3
                panel: "Replies (3)" + "Could not load replies." + Retry, no reply text on the page
```

### 8-16 — all CONFIRMED
```
8   channel menu on someone else's message: Add reaction|Reply|Forward|Copy text|Unsave|Share
    saved-entry menu:  Add reaction|Forward|Copy text|Pin message|Delete|Share   (no Unsave)
    word "unsave" anywhere on the Saved page: absent
    Delete -> "Delete permanently? This will permanently delete this message. It cannot be recovered."
9   archived channel: composer 0, POST /messaging/messages -> 403 MESSAGING_CHANNEL_ARCHIVED
    POST .../messages/<id>/reactions -> 200, stored [{"emoji":"🚀","count":1,...}]
    Pin message via the menu -> pinned true, "Pinned message … View all (1)"
    (POST on the reactions route TOGGLES; DELETE there is 405)
10  archived channel, menu item Edit: disabled=false, pointer-events auto, opacity 1, topmost
    click -> menus 2->0, "Editing message" never, composers 0, toasts 0, /api/v1 requests 0
11  composer POST body "\- QA\-MD\-he01 list item"  rendered "- …"  ul/ol/li 0
    edit PATCH /messaging/channels/<ch>/messages/<id> {"body":"- QA-MD-he01 list itemZ"}
    stored unescaped, rendered "QA-MD-he01 list itemZ" with ul/li = 2, survives reload
12  reply stored "QAQhvk7 \*\*b\*\* \_i\_ x\-y"  rendered "QAQhvk7 **b** _i_ x-y"
    Reply here quote preview: "@QA Alice sent 13:39 QAQhvk7 \*\*b\*\* \_i\_ x\-y"
13  file mode   POST {"channel_id":"<ch>","file_ids":["F…"],"idempotency_key":"…"}
    photo mode  POST {"channel_id":"<ch>","file_ids":["F…"],"idempotency_key":"…"}
    both messages render 1 <img> with controls "Open <name> …" — identical
14  PATCH /channels/<ch> {"name":"Project Alpha Two","description":null} -> name "Project Alpha Two"
15  DELETE /messaging/channels/<ch>/messages {"message_ids":[<reply>,<channel msg>]} -> 200
    channel message "This message was deleted" on the first sample
    thread reply unchanged and "Replies (1)" unchanged for 30 s, visibilityState visible
    NOTE: deleting the reply from the panel's OWN menu updates optimistically and hides the defect —
    the snippet therefore issues the same combined request the finding measured.
16  B (replied in the thread) notifications 725 -> 725 over 30 s, 10 samples, all visible
    A (parent author) 10 -> 11, newest {"type":4,"title":"New thread reply"}
    thread panel controls matching subscribe/follow/notify: none
```

### 17-30 — all CONFIRMED
```
17  note in Saved Messages: Add reaction|Forward|Copy text|Pin message|Delete|Share
    saved copy of MY OWN channel message, same list, same account:
        Add reaction|Reply|Forward|Copy text|Pin message|Edit|Delete|Share
    (comparing against a saved copy of SOMEONE ELSE's message proves nothing — that one
     legitimately lacks Edit/Reply too. The snippet saves one of the actor's own messages first.)
18  Topic field took 300 chars, maxlength absent on both Name and Topic, no counter ("Name Topic Save")
    Save -> PATCH /channels/<ch> 400
      {"key":"COMMON_INVALID_INPUT","message":"invalid request body: description (too long (max 256))"}
    on screen: "Check the entered information and try again."   — no field, no number
19  links in the message 2 -> 1 on Dismiss preview; 0 non-GET requests; 0 localStorage keys
    switch to another channel and back -> links 1 -> 2, card and Dismiss button both back
20  see "Detail drift"
21  typed "/shrug LOSS1 please review"; Enter #1 -> composer "¯\_(ツ)_/¯", tail gone, 0 requests
    Enter #2 -> POST {"body":"¯\\\_\(ツ\)\_/¯"}, only the emoticon reaches the channel
22  picked  POST {"body":"@qa_c_carol  <tag> PICKED","mention_user_ids":["U4QCCAROL000001"]}
    typed   POST {"body":"@qa_c_carol <tag> MANUAL"}                      no mention field
    stored: picked mention_ids ["U4QCCAROL000001"] | typed (absent)
    both render "@QA Carol …" with mention-handle= and mention-user-id= attributes — indistinguishable
    recipient: "New channel message" for the typed one, "You were mentioned" for the control;
    /chat/mentions lists only the control
23  device 1 header "Unmute notifications" pressed=true
    device 2 = the same account in a second browser (own cookies + localStorage, verified signed in
      as the same email, local mute store null): header "Mute notifications" pressed=false
    GET /workspaces/<ws>/channels — keys matching /mute/i on that channel: none
    POST /notifications/channels/<ch>/mute {"duration_seconds":3600} -> 200 {"ok":true}
24  focus on "Channel details", Enter opens the panel, panel.contains(activeElement) = false
    first six Tab stops: Jump to pinned message -> View all (1) -> Messages ->
                         Open QA Alice's profile -> Add reaction -> Reply
    104 messages rendered in the list ahead of the panel
25  POST /api/upload/api/v1/files/upload forced to 413 {"key":"FILE_TOO_LARGE"} (1 interception)
    caption under the attachment: "The server rejected this file"
    toast at the same moment:     "This file is larger than the allowed limit."
    NOTE: the upload fires on Send, not on attach — attaching produces no request at all.
26  archived-channel thread panel: 1 composer, Send enabled, server answers the reply
      403 MESSAGING_CHANNEL_ARCHIVED
    Send -> composer "" (text lost), Cmd+Z does not restore it
    toasts: "Could not send the message. Try again." and "This channel is archived and cannot be changed."
27  file input accept="image/*,audio/*,text/*,.csv,.doc,.docx,.json,.pdf,.ppt,.pptx,.rtf,.xls,.xlsx,.zip"
    attaching qa-c-notes.md -> "qa-c-notes.md has an unsupported file type", Send disabled
28  on screen "@QA Carol <tag> check" | stored "@qa_c_carol  <tag> check" mention_ids ["U4QC…"]
    Copy text then paste -> "@qa_c_carol  <tag> check"
29  sender typed "<tag> dash-dash **bold** _it_"; stored "<tag> dash\-dash \*\*bold\*\* \_it\_"
    recipient live region (aria-live="polite", role=status, 1×1 px):
      "New message from QA Bob: <tag> dash\-dash \*\*bold\*\* \_it\_"
    same line in the feed: "<tag> dash-dash **bold** _it_"
30  Roles tab, owner's own channel: leaf node "R4QCCHOWNPRV001", 159×20 px, y=565 of 1062
```

## Detail drift — right about the bug, stale in one detail

Both still reproduce and both keep their repro block; the *measurement block in the report* no longer
matches the build in one particular.

- **#20 `/me`.** The report says picking `/me` from the command list leaves the literal `"/me"` in the
  composer and `"/me PS1 waves"` reaches the channel. On `v0.61.0-rc.6` picking it leaves **`"/"`** —
  the composer reads `"/ PS1 waves"` before Send. The command is still not applied and a literal slash
  still reaches the channel, and the control is unchanged: picking `/shrug` from the same list turns the
  composer into `¯\_(ツ)_/¯` in place. Measured three ways (mouse click on the option, `clickDeepest`,
  and Enter on the highlighted item); the snippet's header records the difference.
  Separately: typing `/me` in full and pressing Enter now **sends** a message whose body is `"/me"`.
- **#30 role id.** The report says the built-in channel role has no description, so the id line is the
  only thing under the name. The row now reads `Channel owner / R4QCCHOWNPRV001 / All channel permissions /
  System` — there *is* a description. The id line itself is unchanged and still printed, which is the
  finding; only the "it is the only thing there" sentence is stale.

## Notes for later sessions (continued)

- **`browser.newContext()` works over `connectOverCDP` but the context is disposed when the run ends** —
  measured: 2 contexts during the run, 1 in the next call. So an isolated second client cannot be handed
  to a human either. A "second device" hand-over needs a second *rig profile*, re-signed to the account
  under test (`switch-account.mjs`), and the snippet should say the window was left holding it.
- **`ensure.sh` cannot repair a browser signed in as the wrong account** — it prints
  `login failed for <account>` because a session already exists. `QA_EMAIL=… ./d <lane>:<acct>
  snip/switch-account.mjs` does it (it clears cookies first).
- **The attachment upload fires on Send, not on attach.** Attaching produces zero requests; the upload is
  `POST /api/upload/api/v1/files/upload` and it goes out with the send. A route armed before attaching and
  measured without pressing Send reports "0 interceptions" and looks like a wrong URL pattern.
- **POST on `/messaging/channels/<ch>/messages/<id>/reactions` toggles**; DELETE there is 405.
- **`GET /users/me/channels/archived` needs `?workspace_id=<ws>`** — without it, 400 COMMON_INVALID_INPUT,
  which parses as an empty channel list if you read it with `j.channels || []`.
- **A newly created channel cannot be posted to immediately** — three consecutive POSTs returned 400 right
  after `POST /channels`. Wait and retry before concluding anything about the channel.
- The slash-command list items read `"/ /me Send action message"` — the visible `/` badge is part of
  `innerText`, so `/^\/me\b/` matches nothing. Anchor on a word boundary inside the string instead.
