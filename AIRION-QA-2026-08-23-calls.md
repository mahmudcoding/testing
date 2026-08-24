# AIRION QA — Calls focus — 2026-08-23

Session: 11:07 Asia/Tashkent → 14:00 Asia/Tashkent.
Scope: Calls (audio/video), call UI, /calls page, call-from-channel, call-from-DM,
side rooms, participants, screenshare controls, calendar meeting → call, call API.

Fixtures verified: `seed/seed.sh --verify` → all 8 users, 4 channels OK (11:08).

---

## Findings

## Тестовый стенд (rig)

Реальное audio/video проверялось не «на глаз», а через `RTCPeerConnection.getStats()`.
`scripts/callrig/` поднимает N экземпляров Chrome for Testing 151 с синтетическими,
но настоящими WebRTC-устройствами (`--use-fake-device-for-media-stream`,
`--use-fake-ui-for-media-stream`, `--auto-select-desktop-capture-source`) и CDP-портом;
`drive.mjs` подключается по CDP и выполняет сниппет. Профили: alice:9222, bob:9223,
carol:9224, dave:9225, outsider:9226.

Замечание по окружению (не баг приложения): в Chromium, который поднимает Playwright MCP,
`getUserMedia` висит бесконечно — macOS TCC не выдал доступ к микрофону/камере.
Поэтому весь media-путь тестировался в rig-браузерах.

---

### BUG-1 [Low] [frontend] Неверное склонение: «CALL CHAT HISTORY · 1 MESSAGES»

Экран `Call ended` (post-call summary) при одном сообщении в чате звонка выводит
`CALL CHAT HISTORY · 1 MESSAGES` — множественное число при count = 1.

Измерение (DOM, звонок `V4OS2FBRHQKDHV8`, 1 сообщение в call chat):
```
CALL CHAT HISTORY · 1 MESSAGES(SHOW MESSAGES) | [11:41]QA Alice: QA-CHAT-1 from Alice
```
Ожидается `1 MESSAGE`. Локаль — English.

---

### BUG-2 [Low] [frontend] Панель чата звонка обещает «Saved to #<call name>», но такого канала нет

Заголовок in-call chat panel (`[data-testid="in-call-chat-panel"]`) показывает
`Saved to #QA-MEDIA-1`. Префикс `#` читается как канал workspace, но такого канала
не существует ни во время звонка, ни после него.

Измерение:
```
GET /api/v1/workspaces/W4QAF1XTURESO01/channels -> 200
{"channels":[{"id":"C4QAGENERAL0001","name":"qa-general",...},
             {"id":"C4QAPRIVATE0001","name":"qa-private",...}]}     # канала QA-MEDIA-1 нет
GET /api/v1/meetings/history?limit=5 -> 200
{"meetings":[{"id":"V4OS2FBRHQKDHV8", ..., "channel_id":"", ...}]}  # channel_id пустой
```
Фактически история чата хранится при встрече и доступна в post-call summary
(`CALL CHAT HISTORY … (SHOW MESSAGES)`), а не в канале. Копия вводит в заблуждение:
пользователь ожидает кликабельный `#канал`.

---

## Verified working (звонки)

Проверено измерением, дефектов не найдено:

- **Двусторонний звук и видео.** Alice ↔ Bob, `getStats()` на стороне Alice:
  out audio 452046 B / 5024 pkt, out video 6325721 B / 6206 pkt @ 1920x1080x20fps,
  framesEncoded 1468; in audio 178061 B (audioLevel 0.0156, totalAudioEnergy 6.98),
  in video 2438293 B, framesDecoded 395.
- **Демонстрация экрана.** Alice `Share screen` → у Bob появляются
  `Pin QA Alice's screen` и `Actions for QA Alice's screen`, стрим виден.
  Alice публикует simulcast-слои 960x540@15 и 1920x1080@15 + камеру.
- **Mute propagation.** Alice `Mute` → на плитке Alice у Bob появляется
  `img[aria-label="Microphone muted"]`.
- **Raise hand.** Bob `Raise hand` → у Bob кнопка становится `Lower hand`,
  у Alice на плитке Bob появляется `Hand raised`.
- **In-call chat.** Сообщение Alice доставлено Bob; есть адресация `To: Everyone`,
  `Thread`, реакции на сообщение.
- **Запись + уведомление участников.** `POST /meeting/{id}/recording/start` → 201,
  `access_scope: "participants"`, `min_duration_sec: 15`. У Bob — тост
  `This call is being recorded`, `Recording started` и постоянный бейдж
  `call-recording-badge`. Стоп → `status: "completed"`, `file_size: 23607360`,
  `duration_sec: 241`.
- **Права на запись (authz).** Dave (в workspace, но в звонке не был):
  `GET /meeting/{id}/recordings` → 200 `{"recordings":[]}`,
  `GET /meeting/recordings/{rid}` → 403 `REALTIME_ACCESS_DENIED`.
  Bob (был в звонке) — запись видит. Scope `participants` соблюдается.
- **Side Rooms (breakout).** Создание (`POST /meeting/{id}/breakout-rooms` → 201),
  вход обоих, двусторонняя медиа внутри комнаты (за 6 с: out audio 10058 B,
  out video 173106 B, in audio 28306 B, in video 1127669 B, audioLevel 0.248),
  закрытие с подтверждением `Close QA Side Room 1?`.
  Главная комната при этом корректно затихает: на её PeerConnection дельты 0/0.
- **Звук главной комнаты в side room — это фича, а не баг.** Проверено:
  `button#main-audio-trigger[aria-label="Main call audio, 30%"]`,
  `audio[data-testid="remote-audio-sink"].volume === 0.3`.
  Баннер `Main room recording · this room is not` корректно исчезает после стопа записи.
- **Кнопка `More` у участника скрыта намеренно** — `display: none` (адаптивное меню),
  а не «недостижимый контрол».
- **Authz участника (не хоста).** Bob: `PATCH /meeting/{id}/settings` → 403,
  `POST /meeting/{id}/recording/start` → 403, `POST /meeting/{id}/end` → 403.
  `my-permissions` для него — все `false`, роль `participant`.
- **Authz вне workspace.** qa.outsider: `GET /workspace/{ws}/meetings/active` → 403,
  `GET /meeting/{id}` → 403, `GET /meeting/{id}/participants` → 403
  `REALTIME_NOT_ACTIVE_PARTICIPANT`, `POST /meeting/{id}/join` → 403.
- **Post-call summary.** Duration, Recording `Available`, Transcript `AI ready`,
  список участников с временем входа/выхода, история чата, оценка качества:
  `POST /meeting/{id}/rating` → 200 `{"average":4,"count":1,"my_rating":4}`.

---

## Дедуп по Jira (project ALK, issuetype = Bug, status IN Backlog/Ready/In Progress)

Выгружено 250 открытых багов (`scripts/alk_open_bugs.py`, 3 страницы, 27.9 с).

- **Снято с отчёта:** «Активный звонок одновременно в Live now и Recent calls» —
  уже заведено как **ALK-3299** `[FE-WEB][CALLS] Активный звонок одновременно
  отображается в Live now и Recent calls`. Воспроизведено, но не репортим.
- **ALK-3107** `[FE-WEB][CALLS] Вход во второй звонок из Live now завершается общей
  ошибкой вместо подсказки выйти из текущего звонка` — смежный, но **другой** сценарий:
  там *вход* в чужой звонок из Live now и показывается общая ошибка. В BUG-4 ниже —
  *создание* нового звонка через диалог `Start a call`, при котором запрос вообще не
  уходит и не показывается ничего.
- По BUG-1, BUG-2, BUG-5 совпадений в открытых ALK не найдено.

---

### BUG-4 [Medium] [frontend] `Start call` во время активного звонка — молчаливый no-op

Если пользователь уже находится в звонке, то `Calls` → `Start now` → заполнить имя →
`Start call` просто закрывает диалог: **HTTP-запрос не отправляется вовсе**, тост,
инлайн-ошибка и console-error отсутствуют. Пользователь не понимает, что произошло.

Шаги:
1. Alice (`qa.alice@aloqa.test`) создаёт звонок и остаётся в нём.
2. Свернуть оверлей звонка (`[data-testid="call-surface-minimize"]`).
3. `[data-testid="calls-hub-start-now"]` → `#calls-hub-call-name` = `QA-SECOND-CALL`
   → `[data-testid="calls-start-submit"]`.

Измерение (перехват `page.on('response')` на всё `/api/v1/meeting` + POST):
```
net:          []            # ни одного POST /api/v1/meeting
consoleErrs:  []
after: { dialogOpen: false, toasts: [], errorText: [] }
```
Пользователь при этом остаётся в старом звонке — подтверждено:
```
GET /api/v1/meetings/current -> 200
{"meeting":{"id":"V4OS32HUC12U51Y","name":"QA-PWCALL","status":"active",...}}
```
Что бэкенд умеет отвечать осмысленно — видно, когда запрос всё-таки уходит:
```
POST /api/v1/meeting {"name":"QA-PW-WEAK1","workspace_id":"W4QAF1XTURESO01",...} -> 409
{"code":409,"key":"REALTIME_ALREADY_IN_ANOTHER_MEETING",
 "message":"user is already active in another meeting"}
```
Т.е. клиент глушит сценарий у себя и не показывает ни этот текст, ни свой.
Ожидается: подсказка «вы уже в звонке, выйдите из него» (как просит и ALK-3107),
либо предложение завершить текущий звонок.

---

### BUG-5 [Medium] [backend] Нет rate limiting на подбор пароля звонка

`POST /api/v1/meeting/{id}/join` с полем `password` не ограничивает число неудачных
попыток: ни задержки, ни блокировки, ни капчи, ни 429. Время ответа постоянное,
поэтому подбор идёт с полной скоростью сети.

Звонок: `QA-PWCALL` `V4OS32HUC12U51Y`, создан с `Who can join = Password`,
пароль `Secret123!`, `password_protected: true`.

Измерение 1 — 10 неверных подряд, затем верный (аккаунт `qa.bob@aloqa.test`):
```
 1. pw="wrong1"     -> 400 (147ms) {"code":400,"key":"REALTIME_PASSWORD_INVALID",...}
 ...
10. pw="wrong10"    -> 400 (138ms) {"code":400,"key":"REALTIME_PASSWORD_INVALID",...}
11. pw="Secret123!" -> 200 (160ms) {"meeting":{"id":"V4OS32HUC12U51Y",...}}
```
Верный пароль принят сразу после 10 неудач — счётчика/локаута нет.

Измерение 2 — 40 попыток подряд с другого аккаунта (`qa.carol@aloqa.test`):
```
{"attempts":40, "totalMs":5828, "statusCounts":{"400":40},
 "firstMs":[141,153,153,146,157], "lastMs":[146,134,144,195,150], "avgMs":146}
```
40 попыток за 5.8 с, время ответа не растёт (первые ~148 мс, последние ~154 мс),
ни одного 429. Экстраполяция: ~7 попыток/с на один поток.

Влияние ограничено участниками workspace (для qa.outsider `POST /join` → 403), но
пароль звонка — это именно тот барьер, который защищает приватную встречу от
любопытного коллеги, и сейчас он подбирается перебором.

---

## Verified working — дополнение (вторая половина сессии)

- **Lobby (`Wait for admission`).** `POST /join` → `202 {"status":"waiting"}`,
  у входящего экран `Waiting for host approval`; у хоста — бейдж
  `call-controls-waiting-count` и в панели Participants секция `WAITING (1)`
  с `Admit`/`Deny`. Admit → `POST /participants/{pid}/admit` → 204, участник входит.
  Deny → `POST /participants/{pid}/reject` → 204, у отклонённого экран
  `Request declined` + `Request to join again` / `Back to workspace`.
- **Повторные запросы на вход идемпотентны.** 8 подряд `POST /join` от отклонённого
  пользователя → 8 × 202 с **одним и тем же** `participant_id` (`N4OS31OBYWN1VQF`),
  в `GET /waiting` у хоста ровно одна запись. Флуда waiting room нет.
- **Приватный звонок.** `is_private: true`, Carol (не приглашена):
  `GET /workspace/{ws}/meetings/active` → `{"meetings":[]}` (звонка не видно),
  `GET /meeting/{id}` → 403, `GET /meeting/{id}/participants` → 403,
  `POST /meeting/{id}/join` → 403.
- **Guest link.** Токен 64 hex. `Create new link` (`PUT /meeting/{id}/guest-links/{glid}`)
  **ротирует токен и гасит старый**: старая ссылка в чистом браузере без сессии даёт
  `This invite link is no longer valid.` Новая ссылка открывает
  `You are invited to "QA-PRIVATE-CALL"` с полем имени.
- **Гость в звонке.** Вошёл как `QA Guest Visitor`, бейдж `GUEST`,
  баннер `Screen sharing is not allowed for you in this call.`, кнопка
  `Share screen` действительно `disabled: true` (opacity 0.4) — контрол не «мнимо
  доступный». Медиа гостя доходит до хоста: за 6 с у Alice
  in audio 34158 B (audioLevel 0.052), in video 659307 B.
- **Звонок из канала.** `Start call` в шапке `#qa-general` создаёт встречу со
  скоупом канала: `POST /api/v1/meeting` → 200
  `{"channel_id":"C4QAGENERAL0001","channel_name":"qa-general",...}`.
  Дропдаун `Start or schedule call` даёт выбор участников и `Start now` / `Schedule call`.
- **Смена звонка.** Создание нового звонка, когда пользователь числится в другом,
  корректно выводит его из первого: после `POST /meeting` у Bob
  `meetings/current` = новый звонок, а в участниках старого его уже нет.

---

### BUG-6 [Medium] [frontend] Слайдер «Maximum video quality» теряет фокус после первого шага — с клавиатуры не настраивается

В `Meeting settings` → `MAXIMUM VIDEO QUALITY` (`input[type=range]`,
`data-testid="meeting-settings-video-quality-slider"`, min 0 / max 3 / step 1) после
**первого** нажатия стрелки фокус уходит с самого слайдера на контейнер оверлея, и
все последующие нажатия стрелок теряются. Клавиатурный пользователь может изменить
значение только на один шаг за раз, каждый раз заново дотабливаясь до контрола
через весь оверлей звонка.

Измерение (`document.activeElement` + `value` после каждого нажатия ArrowLeft):
```
after focus     value=2  active=INPUT|meeting-settings-video-quality-slider
press#1 +200ms  value=1  active=DIV|call-overlay-expanded      <-- фокус потерян
press#1 +2000ms value=1  active=DIV|call-overlay-expanded
press#2 +200ms  value=1  active=DIV|call-overlay-expanded      <-- нажатие потеряно
press#2 +2000ms value=1  active=DIV|call-overlay-expanded
press#3 …       value=1  active=DIV|call-overlay-expanded
press#4 …       value=1  active=DIV|call-overlay-expanded
```
8 нажатий ArrowLeft подряд в первом прогоне сдвинули значение только с 3 на 2.
Мышью значение меняется нормально. WCAG 2.1.1 (Keyboard).

Само ограничение при этом работает: после установки 360p
`GET /meeting/{id}/settings` → `"max_video_height":360`, и входящее видео у всех
участников падает с 960x540 до `640x360@20` (проверено `getStats()`).

---

### BUG-7 [Medium] [frontend] Ошибка «лимит участников ниже текущего» заменяется на бесполезное «Try again»

Хост в активном звонке (4 участника) ставит `PARTICIPANT LIMIT = 2` и жмёт `Save`.
Бэкенд отвечает точной причиной, но UI показывает общий текст с предложением
повторить — хотя повтор не поможет никогда.

Измерение:
```
PATCH /api/v1/meeting/V4OS3ECSEJTVAUZ -> 400
{"code":400,"key":"REALTIME_MEETING_LIMIT_BELOW_CURRENT",
 "message":"participant limit is below the current number of participants:
            лимит 2 при 4 участниках в звонке"}

UI (панель + тост):  "Could not save meeting settings. Try again."
```
Ожидается сообщение вида «Лимит меньше текущего числа участников (4)».

Побочно — **BUG-8 [Low] [backend] locale**: в этом же ответе API `message` смешивает
языки: английская часть `participant limit is below the current number of
participants:` и захардкоженная русская `лимит 2 при 4 участниках в звонке`.
Локаль аккаунта и интерфейса — English. Строка приходит на русском независимо от
языка клиента.

---

### BUG-9 [Low] [frontend] В карточке «Live now» у 1-to-1 звонка занижено число участников и стоит фолбэк-название

Direct call Alice → Bob (принят, оба в звонке). Карточка «Live now» у Bob показывает
`1 participant` и один аватар (его собственный), теряя хоста, хотя тут же пишет
`hosted by QA Alice`. Название звонка выводится как `Team meeting`, а кнопка
предлагает `Join` звонок, в котором пользователь уже находится.

Измерение (одновременно, у Bob):
```
API  GET /api/v1/workspace/W4QAF1XTURESO01/meetings/active
     [{ id:"V4OS3QQVVXKD7ND", name:"", channel_id:"C4OS3QRHTP93TJV",
        status:"active", participant_count:2, top:["QA Bob","QA Alice"] }]

DOM  Live now | 1 | LIVE | running 2 min | Team meeting |
     1 participant · hosted by QA Alice | QB | Join
     avatars: ["LIVE","QA Bob","QA Bob"]
```
Состояние стабильное: те же `1 participant` через 2+ минуты.
Для групповых звонков счётчик корректен (`QA-PWCALL` показывал
`2 participants · hosted by QA Alice | QA | QB`), а после завершения тот же direct
call в Recent calls подписан правильно — `QA Alice · Incoming · Ended · 2m`
в фильтре `1-to-1 · 1`. То есть дефект локализован в live-карточке DM-звонка.

Смежное, но другое: **ALK-3324** — там счётчик в Live now *не уменьшается* после
выхода участника; здесь он *занижен* при двух активных участниках.

---

### BUG-10 [Medium] [backend] После выхода владельца звонок остаётся без хоста — запросы на демонстрацию некому одобрить, звонок некому завершить

Владелец (`role: owner`) нажимает `Leave call` → `Leave` (не `End for everyone`).
Звонок корректно продолжается, участник из списка убирается корректно, но **роль
хоста никому не передаётся**: в `admins` остаётся только ушедший владелец, а у всех
оставшихся `role: participant` со всеми `permissions: false`.

Последствие: пока владелец не вернётся, в звонке нельзя одобрить запрос на
демонстрацию экрана (`screen_share_mode: on_request`), нельзя начать/остановить
запись, изменить настройки встречи, впустить кого-то из lobby и завершить звонок
для всех. Звонок заканчивается только когда каждый выйдет сам.

Измерение (звонок `QA-PERM` `V4OS3XGC6AFOI26`, Alice — owner, вышла; в звонке Bob и Carol):
```
GET  /meeting/{id}                -> 200  "status":"active"                 # звонок жив
GET  /meeting/{id}/participants   -> 200  ["QA Bob","QA Carol"]             # Alice убрана корректно
GET  /meeting/{id}/admins         -> 200  [{"user_id":"U4QAALICE000001","role":"owner"}]   # хост — ушедший
GET  /meeting/{id}/my-permissions -> 200  (Bob) {"role":"participant", ...все false}

# Carol просит демонстрацию экрана — заявка создаётся и висит:
POST /meeting/{id}/permission-requests {"device":"screen_share"} -> 200
     {"id":"PR4OS47CMYYRGI9E","status":"pending","resolved_by":""}

# оставшийся участник даже не может увидеть очередь заявок, не то что одобрить:
GET  /meeting/{id}/permission-requests -> 403 REALTIME_ACCESS_DENIED   (Bob)
POST /meeting/{id}/end                 -> 403 REALTIME_ACCESS_DENIED   (Bob)
```
Обходной путь — владелец возвращается; права возвращаются к нему:
```
POST /meeting/{id}/join            -> 200        (Alice)
GET  /meeting/{id}/my-permissions  -> 200  {"role":"owner", ...все true}
GET  /meeting/{id}/permission-requests -> 200  заявка PR4OS47CMYYRGI9E всё ещё pending
```
Ожидается: либо автопередача роли хоста оставшемуся участнику, либо предупреждение
владельцу при выходе («вы единственный хост, назначьте co-host»). Сейчас диалог
`Leave this call?` говорит только «The call continues for everyone else».

В открытых ALK по «хост вышел / передача роли» совпадений не найдено
(есть только тикеты про co-host у Guest: ALK-2621, ALK-2991, ALK-3326, ALK-3218, ALK-3137).

---

### BUG-11 [Low] [frontend] При включённом Push to talk кнопка микрофона заблокирована, но по-прежнему обещает «Toggle mute (⌘D)» и не объясняет причину

`Настройки` → `Calls and audio` → `Behavior` → `Push to talk` (Hold Space to talk).
После включения в звонке кнопка микрофона становится `disabled`, но её `title`
остаётся `Toggle mute (⌘D)`. Ни tooltip, ни соседний текст не сообщают, что
управление микрофоном переведено на пробел.

Измерение (Dave, звонок `QA-PERM`, PTT включён):
```
кнопка микрофона: {disabled: true, title: "Toggle mute (⌘D)", aria-pressed: "true"}
нажатие ⌘D  -> состояние не меняется ("Unmute", disabled)   # шорткат тоже не работает
повторное ⌘D -> без изменений
```
Для сравнения, в аналогичной ситуации приложение умеет объяснять причину: у гостя
рядом с заблокированной кнопкой демонстрации выводится
`Screen sharing is not allowed for you in this call.`
Ожидается такой же хинт, например `Push to talk включён — удерживайте Space`.

Сам Push to talk при этом работает корректно (см. Verified working).

---

## Verified working — дополнение (третья часть сессии)

- **4-way звонок с реальной медиа.** Alice + Bob + Carol + Dave, сетка 2x2.
  У Alice `getStats()`: OUT 1 audio + 1 video `960x540@19`; IN 3 audio
  (audioLevel 0.0012 / 0.0184 / 0.0002) + 3 video `960x540@20`. Разрешение
  адаптивно снижено с 1080p под сетку из четырёх — ожидаемое поведение SFU.
- **Ограничение качества видео работает.** `max_video_height: 360` →
  всё входящее видео падает с `960x540` до `640x360@20` (замер `getStats()`).
- **Force-mute участника.** `POST /meeting/{id}/participants/{uid}/mute` → 204,
  у Bob кнопка становится `Unmute`; при `mic_mode: allowed_all` он может размьютиться
  сам — это корректно для данного режима.
- **Mute on join.** `mute_on_join: true` → присоединившийся Bob сразу в состоянии
  `Unmute` (то есть заглушён).
- **Запрос демонстрации экрана.** Bob (`screen_share_mode: on_request`) жмёт
  `Request to share` → `POST /permission-requests` → у хоста в панели Participants
  секция `REQUESTS (1)` с `Approve`/`Reject`. После
  `POST /permission-requests/{id}/approve` → 200 кнопка у Bob меняется на
  `Share screen`, и демонстрация действительно запускается.
- **In-call chat отключается корректно.** `chat_enabled: false` →
  `POST /meeting/{id}/messages` → 400 `REALTIME_CHAT_DISABLED`, а в UI composer
  реально заблокирован: `textarea.disabled === true`, кнопка `Send` `disabled === true`
  (fill и click падают по таймауту), показан баннер `Chat is disabled for this call`.
- **Co-host.** `Make co-host` → у Bob `role: "admin"`, все 13 permissions `true`,
  в панели бейдж `CO-HOST`, в тулбаре появляются `Record`, `Meeting settings`,
  `Add to call`. `End for everyone` остаётся только у владельца.
- **Remove from call.** Диалог `Remove participant?` («They can rejoin unless the call
  is locked») → участник выкинут в хаб, список участников уменьшается, повторный вход
  разрешён — соответствует тексту диалога.
- **Ban.** Диалог `Ban from this meeting?` → `POST /meeting/{id}/join` → 403
  `REALTIME_MEETING_BANNED`; в UI забаненный получает понятный локализованный экран:
  «Вернуться в этот звонок нельзя. Организатор удалил вас из звонка и запретил
  возвращаться. Попросите его пригласить вас снова.»
- **Push to talk.** Замер исходящего аудио у Dave (фокус на call surface):
  простой — 48 B / 5 с; удержание Space — **24 283 B / 5 с**, лейбл кнопки
  переключается `Unmute` → `Mute` → `Unmute`. Гейт работает.
- **Call diagnostics (nerd stats).** Тумблер в `Calls and audio` добавляет в тулбар
  `Call diagnostics` (`call-nerd-stats-toggle`).
- **Устойчивость к обрыву сети.** `context.setOffline(true)` на 40 с: тост
  `Waiting for network…`, все 4 плитки на месте, после восстановления —
  `Call reconnected / Media is back online`, никто не выпал.
  Индикатор `Excellent` в шапке при этом **не врал**: замер у Alice показал, что
  входящая медиа от «отключённого» Bob продолжала идти (3 аудиопотока, video),
  то есть setOffline рвёт HTTP/WebSocket, но не установленный WebRTC-транспорт.
  Настоящая потеря медиа-пути этим способом не воспроизводится.
- **Русская локаль в звонке.** Prejoin и весь in-call UI переведены
  (`ГОТОВЫ ПРИСОЕДИНИТЬСЯ?`, `ПРОВЕРКА УСТРОЙСТВ`, `Покинуть звонок`,
  `Отличная · 5ms`); латиницей остаются только имена пользователей и названия каналов.
  Непереведённых строк в call surface не найдено.
- **Direct call (1-to-1).** `Call` в Directories/профиле → `POST /messaging/dm`
  создаёт DM-канал, `POST /meeting` создаёт встречу со `status: "pending"` и
  `channel_id` этого DM; у вызываемого — баннер `Incoming call` с `Accept`/`Decline`;
  `POST /meeting/{id}/accept` → 200, статус `active`, оба в звонке.
  Завершённый звонок корректно попадает в фильтр `1-to-1` и подписан именем
  собеседника (`QA Alice · Incoming · Ended · 2m`).
- **Звонок из канала.** `POST /api/v1/meeting` → `channel_id: "C4QAGENERAL0001"`,
  `channel_name: "qa-general"`.
- **Leave ≠ End.** `Leave call` показывает подтверждение `Leave this call?`;
  после подтверждения участник корректно исчезает из `GET /participants`,
  звонок остаётся `active` для остальных (но см. BUG-10 про отсутствие хоста).

## Проверено и отклонено (не баги)

Ниже — гипотезы, которые выглядели дефектами, но при замере не подтвердились.
Записаны, чтобы их не проверяли заново.

- **«Звук главной комнаты слышен в side room»** — это фича:
  `button#main-audio-trigger[aria-label="Main call audio, 30%"]`,
  `audio[data-testid="remote-audio-sink"].volume === 0.3`.
- **«Хост не может остановить запись из side room»** — кнопка есть, просто
  переименована в `Stop main-room recording` (`call-controls-record`).
- **«Кнопка More недоступна участнику»** — `display: none` (адаптивное меню).
- **«Тумблеры в Calls and audio без доступного имени»** — имя есть через
  `<label for>`; accessible name резолвится в `Push to talk` и
  `Show call diagnostics (nerd info)`.
- **«Имя участника обрезается в русской локали»** — не про локаль: обрезка на 2–4 px
  есть и в английской (`QA Bob (you)` sw 94 / cw 92) — это штатный
  `text-overflow: ellipsis` в узкой плитке filmstrip.
- **«Участник остаётся в списке после выхода»** — артефакт автоматизации: диалог
  `Leave this call?` не был подтверждён, пользователь фактически не выходил.
  При настоящем выходе список обновляется корректно.
- **«Кнопка New Side Room ничего не делает»** — модалка открывалась, но рендерится
  в портале вне `call-overlay-expanded`, куда смотрел замер.

---

### BUG-12 [Low] [frontend] RU-локаль: у кнопки допуска из лобби видимый текст и accessible name — разные глаголы

В панели `Участники` → секция `ОЖИДАЮТ (1)` кнопка подписана **«Допустить»**,
а её `aria-label` — **«Впустить QA Bob»**. Пользователь скринридера слышит один
глагол, зрячий видит другой. Соседняя кнопка отказа согласована
(«Отклонить» / «Отклонить QA Bob»), в английской локали расхождения нет
(`Admit` / `Admit QA Bob`).

Измерение (Carol, локаль ru, звонок `QA Scheduled Call`):
```json
[
  {"visibleText":"Допустить","ariaLabel":"Впустить QA Bob","testid":null},
  {"visibleText":"Отклонить","ariaLabel":"Отклонить QA Bob","testid":null}
]
```
Нужно привести к одному термину.

---

## Verified working — четвёртая часть

- **Запланированная встреча.** `Schedule meeting` → `POST /api/v1/calendar/meetings`
  → 200, встреча `S4OS4KNVA247WHK` видна всем участникам workspace в секции
  `Scheduled today` со статусом `Not started yet`.
  Запуск: `POST /calendar/meetings/{sid}/start` → 200, создаётся живая встреча
  `V4OS4MHTJOJQBKR`, организатор автоматически входит.
  У запланированной встречи есть свой guest-link (`guest_join_url`,
  `/calendar/join/<64 hex>`) и `live_meeting_available_from` = за 30 минут до начала.
- **Лимит участников соблюдается.** При `max_participants: 2` и двух участниках
  третий попадает в лобби (`POST /join` → `202 waiting`), а попытка его допустить
  отклоняется: `POST /participants/{pid}/admit` → 400
  `{"key":"REALTIME_MEETING_FULL","message":"meeting is full"}`; список участников
  остаётся из двух.
  **Здесь UI ведёт себя правильно** — показывает конкретный тост
  «Достигнут лимит участников встречи.». Это усиливает BUG-7: в том же приложении
  один экран умеет объяснить причину отказа, а экран `Meeting settings` подменяет
  её на «Could not save meeting settings. Try again.».

> Примечание по локали: аккаунт `qa.carol@aloqa.test` временно переключался на
> русский, чтобы проверить локализацию звонков (см. Verified working, BUG-12).
> После проверки возвращён на English. На конец сессии все аккаунты —
> alice / bob / carol / dave / outsider — на English (`document.documentElement.lang === "en"`).

---

### BUG-13 [Low] [frontend] Accessible name поля приватного сообщения в звонке говорит «Message everyone»

В чате звонка можно адресовать сообщение одному участнику (`To` → `QA Bob`).
Визуально всё верно: плейсхолдер меняется на `Private message to QA Bob`, над полем
чип `PRIVATE TO QA BOB`. Но `<label for>` этого поля остаётся статическим
`Message everyone` — а именно label, а не placeholder, формирует accessible name.
Пользователь скринридера при фокусе слышит «Message everyone» ровно в тот момент,
когда собирается отправить приватное сообщение.

Измерение (Alice, `To = QA Bob`):
```
textareaId:  "_r_1l_"
placeholder: "Private message to QA Bob"
labelText:   "Message everyone"          # <label for="_r_1l_">, sr-only, clip-path: inset(50%)
recipient:   ["QA Bob"]

Playwright ariaSnapshot:
  - textbox "Message everyone":
    - /placeholder: Private message to QA Bob
```
Label не обновляется при смене получателя. Ожидается, что accessible name следует
за адресатом, как это уже делает placeholder.

Само разграничение приватных сообщений при этом работает — см. Verified working.
Открытые A11Y-тикеты ALK (3242, 3243, 3249, 3316) — все про контраст, совпадений нет.

---

## Verified working — пятая часть

- **Приватные сообщения в чате звонка изолированы.**
  `POST /meeting/{id}/messages {"body":"…","recipient_id":"U4QABOB00000001"}`;
  `GET /meeting/{id}/messages` возвращает это сообщение получателю (Bob) и **не**
  возвращает третьему участнику звонка (Carol). Разграничение на бэкенде соблюдается.
- **Реакции.** Пикер `👏 👍 ❤️ 😂 🎉 😮`; отправка идёт по data-channel LiveKit
  (REST-запроса нет). У отправителя реакция видна ~2.5 с, у получателя ~3 с.
- **Will be right back.** У обоих на плитке появляется `Will be right back`,
  микрофон автоматически глушится (`Microphone muted`), кнопка становится `I'm back`.
- **Pin for everyone.** `POST /meeting/{id}/pin` → 200
  `{"target_type":"participant","target_user_id":"U4QABOB00000001","pinned_by":…}`,
  порядок плиток меняется у обоих участников.
- **Push-to-talk и nerd stats включаются из `Settings → Calls and audio`** и
  сразу отражаются в звонке (кнопка `Call diagnostics` появляется в тулбаре).

---

### BUG-14 [High] [frontend] Смена микрофона в звонке не применяется — собеседники продолжают слышать прежнее устройство

В тулбаре звонка `Select microphone` → выбрать другой микрофон. Приложение
действительно запрашивает новое устройство через `getUserMedia`, но **не заменяет
трек у `RTCRtpSender`**: наружу продолжает идти звук с исходного микрофона.
Обходного пути в звонке нет — состояние не чинится ни mute/unmute, ни ожиданием.
Выпадающее меню при этом вообще не показывает, какое устройство выбрано сейчас.

Измерение (Alice, звонок `QA-UX`, три фейковых аудиовхода):
```
до выбора:
  sender track: {label:"Fake Default Audio Input", id:"516f2886", deviceId:"default", ready:"live"}

выбираем "Fake Audio Input 2" (deviceId 2ff8495…889a):
  window.__gumCalls = [
    {"video":false,"audio":{"deviceId":{"ideal":"default"},…}},            # первичный
    {"audio":{"deviceId":"2ff849542124591029c2ebfc4d69fe977826ee1095662939cba617f84114889a",…}}  # новый — получен
  ]

после выбора (t+0 и t+6 c — стабильно):
  sender track: {label:"Fake Default Audio Input", id:"516f2886", deviceId:"default"}   # НЕ изменился

после Mute → Unmute (перепубликация):
  sender track: {label:"Fake Default Audio Input", id:"516f2886", deviceId:"default"}   # тот же трек, новых gUM нет
```
То есть новый поток открыт (устройство занято), но в звонок не подан.

Дополнительно: пункты меню не имеют состояния выбора —
`aria-checked` и `data-state` у всех трёх микрофонов `null`, поэтому пользователь
не видит ни текущего устройства, ни того, что переключение не сработало.

**Границы дефекта.** Переключение *динамика* в том же меню работает корректно:
после выбора `Fake Audio Output 2` у `audio[data-testid="remote-audio-sink"]`
`sinkId` меняется с `""` на `96e52b9338551c`. Проблема только в микрофоне.

Влияние: пользователь, переключившийся на гарнитуру, продолжает вещать с
микрофона ноутбука и никак об этом не узнаёт.

В открытых ALK совпадений нет: по «микрофон / microphone / mic» — 0 тикетов,
в device-тематике (ALK-3340, 3142, 3136, 2797, 2862 и др.) речь о правах и
разрешениях, а не о смене устройства захвата.

**BUG-14 — уточнение границ (важно для локализации дефекта):**

Проверены все три пути выбора микрофона.

| путь | состояние выбора в UI | применяется к треку |
|---|---|---|
| `Settings → Calls and audio → Microphone` (до входа) | да, `aria-selected="true"` | **да** |
| Тулбар звонка → `Select microphone` (в звонке) | нет, `aria-checked`/`data-state` = `null` | **нет** |
| Тулбар звонка → выбор динамика (то же меню) | — | **да** (`sinkId` меняется) |

Доказательство рабочего пути (Dave, глобальная настройка выставлена в
`Fake Audio Input 2`, затем вход в звонок):
```
gum:     {"video":false,"audio":{"deviceId":{"exact":"2ad64de5a154ea5a…643ea4"},…}}
sender:  audio | Fake Audio Input 2 | dev 2ad64de5a154
```
То есть механизм выбора устройства в продукте есть и работает — сломан именно
сценарий смены микрофона **во время** звонка. Разработчику имеет смысл смотреть
обработчик пункта меню в тулбаре: новый `MediaStreamTrack` создаётся, но
`RTCRtpSender.replaceTrack()` (или эквивалент LiveKit `switchActiveDevice`) не
вызывается.

## Verified working — шестая часть (side rooms, права)

- **`who_can_open_rooms: host_only` соблюдается на обоих слоях.**
  У участника `POST /meeting/{id}/breakout-rooms` → 403
  `REALTIME_BREAKOUT_OPEN_NOT_ALLOWED` («opening breakout rooms is restricted to
  the host»), и в UI кнопка `New Side Room` из панели пропадает — остаётся только
  закрыть панель. Скрытый, но кликабельный контрол не остаётся.
- **`max_rooms` соблюдается.** При `max_rooms: 1` вторая комната →
  409 `REALTIME_BREAKOUT_ROOM_LIMIT_REACHED`, в списке остаётся одна.
- **Приватная side room не видна посторонним.** Комната с `visibility: "private"`
  и без приглашений не появляется в `GET /meeting/{id}/breakout-rooms` ни у Bob,
  ни у Carol — они видят только публичную. Прямой вход по известному id
  `POST /meeting/breakout-rooms/{rid}/join` → 403 `REALTIME_ACCESS_DENIED` у обоих.
- **Выпадающие меню выбора устройства в звонке не показывают текущий выбор** —
  и для микрофона, и для камеры (`aria-checked`, `aria-selected`, `data-state`
  у всех пунктов `null`). В глобальных настройках (`Settings → Calls and audio`)
  выбор помечается корректно (`aria-selected="true"`). Часть BUG-14.

## Verified working — седьмая часть (гость в лобби, режимы устройств, диагностика)

- **Guest link уважает лобби.** При `requires_approval: true` кнопка на странице
  приглашения меняется с `Join call` на **`Ask to join`**, копия — «The host will
  need to approve your entry.» После запроса гость видит «Waiting for approval.
  A host must approve your request…», а у хоста в очереди появляется запись с
  `participant_type: "guest"` и `guest_id`:
  ```
  GET /meeting/{id}/waiting -> 200
  {"participants":[{"participant_id":"N4OS5GM1HUI6LJQ","user_id":"","name":"QA Lobby Guest",
                    "participant_type":"guest","guest_id":"G4OS5GM1HX6YJO1"}]}
  ```
  После `POST /participants/{pid}/admit` → 204 гость входит в звонок на пять
  участников. Обойти лобби по гостевой ссылке не удалось.
- **`camera_mode: on_request` соблюдается.** У участника
  `GET /participants/{uid}/permissions` → `{"mic":true,"camera":false,"screen_share":false}`,
  кнопка камеры превращается в `Request camera access`
  (`call-controls-camera-request`). Допустимые значения `camera_mode`, судя по
  ответам валидатора, — `allowed_all` и `on_request`; `host_only`, `disabled`,
  `moderated`, `allowed_none` отклоняются с
  `400 COMMON_INVALID_INPUT: camera_mode (invalid value)`.
- **Панель диагностики (nerd stats) работает.** Тумблер в тулбаре
  (`call-nerd-stats-toggle`) добавляет в DOM 17 новых узлов —
  `call-debug-panel-header`, `call-debug-streams-inbound` / `-outbound`,
  `call-debug-details-transport` / `-codecs` / `-engine` / `-events`,
  `codec-group-send-audio` / `-video`, `throughput-sent-path` / `-received-path` —
  с живыми значениями: `RTT`, `97 kbps`, `48 kbps`, `Packet loss`, `Jitter`,
  `Available bitrate (receive)`. При выключенном тумблере этих узлов нет.

**BUG-14 — независимое воспроизведение (второй аккаунт, другое целевое устройство):**

Carol, свежая вкладка, вход в тот же звонок, выбор `Fake Audio Input 1`:
```
после входа:      senders = ["Fake Default Audio Input | id bab200ff"], gumCalls = 1
выбираем "Fake Audio Input 1" (Device ID 5b07…0240)
через 6 c:        senders = ["Fake Default Audio Input | id ce24d0ae"], gumCalls = 2
```
Здесь трек **был** заменён (id сменился `bab200ff` → `ce24d0ae`), но заново
захвачено снова **устройство по умолчанию**, а не выбранное. У Alice в первом
прогоне трек не менялся вовсе (id `516f2886` до и после).

То есть механика отличается от прогона к прогону, но пользовательский результат
стабилен и воспроизводится на двух аккаунтах и двух разных целевых микрофонах:
**в звонок никогда не попадает выбранное устройство**. Разработчику стоит смотреть
на то, какой `deviceId` уходит в повторный `getUserMedia` при смене устройства
из тулбара — по логам он корректный (`{"deviceId":"2ff8495…"}`), а публикуется
всё равно default.

## Verified working — восьмая часть (режимы микрофона)

- **`mic_mode: on_request` не только меняет UI, но и реально отключает уже
  вещающего участника.** После смены режима хостом у Bob:
  ```
  GET /participants/U4QABOB00000001/permissions -> 200
  {"override":{"camera":true,"granted_by":"U4QAALICE000001"},
   "effective":{"mic":false,"camera":true,"screen_share":false}}

  getStats() за 6 с у Bob:  d_outAudio = 0        # микрофон обрезан
                            d_outVideo = 1 832 507 # камера (явно выданная) продолжает идти
  ```
  Кнопка микрофона превращается в `Request microphone access`
  (`call-controls-mic-request`), а `Select microphone` — в `Audio settings`.
  Ранее выданный явный override на камеру переживает смену режима — корректно.
- **Допустимые значения `mic_mode` / `camera_mode`** — `allowed_all` и `on_request`
  (остальные пробы отклонены `400 COMMON_INVALID_INPUT`).
- **«Ask to unmute» (nudge от хоста) работает целиком.**
  `POST /meeting/{id}/participants/{uid}/device-requests` → 200; у получателя
  появляется диалог `device-request-prompt`: «QA Alice asked you to turn on your
  Microphone | Not now | Turn on». После `Turn on` кнопка микрофона становится
  `Mute`, исходящее аудио возобновляется (18 885 B за 6 с).
  (Замечание: контраст этого компонента уже заведён как ALK-3249.)
- **Отклонённый direct call.** `POST /meeting/{id}/decline` → 200 `{"call_ended":true}`;
  встреча получает `status: "ended"`, `end_reason: "declined"`, у звонящего экран
  «Ringing…» гаснет. В Recent calls запись отображается корректно с обеих сторон,
  с направлением, именем собеседника и временем, и попадает в фильтр `1-to-1`:
  ```
  Alice: QB | QA Bob   | Outbound · Declined · Aug 23, 01:08 PM · 0m | 1-to-1
  Bob:   QA | QA Alice | Incoming · Declined · Aug 23, 01:08 PM · 0m | 1-to-1
  ```
  (Отличается от ALK-3177, где речь про *отменённый* Direct Call.)

---

---

### BUG-15 [Medium] [backend] Журнал событий публичного звонка отдаётся целиком тем, кто в звонке не был

`GET /api/v1/meeting/{id}/events` для **публичного** звонка возвращает полный лог
участнику workspace, который в этом звонке никогда не был, — байт в байт тот же,
что видит хост. При этом каждое событие само помечено `"visibility":"participant"`,
то есть модель видимости в данных есть, но при выдаче не применяется.

Измерение (звонок `QA-MEDIA-1` `V4OS2FBRHQKDHV8`; Alice была хостом,
Dave в этом звонке не был ни разу):
```
Alice: GET /meeting/{id}/events?limit=50 -> 200  count = 44
Dave : GET /meeting/{id}/events?limit=50 -> 200  count = 44      # идентично

types (одинаковые у обоих):
  participant.joined, participant.left, track.published, track.unpublished,
  recording.started, recording.stop_requested, recording.egress_started,
  recording.egress_updated, recording.egress_ended, breakout.started,
  breakout.ended, meeting.ended
visibilities: ["participant"]
actors:       ["U4QABOB00000001","U4QAALICE000001"]
```
По этому логу посторонний восстанавливает: кто присутствовал, когда именно вошёл
и вышел, когда включал и выключал камеру и микрофон, что звонок записывали и что
в нём открывали side rooms.

**Границы (проверено):**

| запрос | Dave (в workspace, в звонке не был) | qa.outsider (вне workspace) |
|---|---|---|
| `events` публичного звонка | **200, весь лог** | 403 |
| `events` приватного звонка | 403 | 403 |
| `recordings/{rid}` и `/content` | 403 | 403 |
| `participants` публичного звонка | 200 | 403 |

То есть медиа и приватные звонки закрыты корректно — не закрыт именно журнал
поведения участников публичного звонка. Список участников публичного звонка,
вероятно, открыт намеренно (как состав публичного канала), но события с
`visibility: "participant"` по своей же разметке не должны уходить не-участнику.

Дедуп: в открытых ALK по логам звонка есть ALK-2180 (дубли «Left the call») и
ALK-2826 (лог называет ручную запись автоматической) — обе про содержимое, не про
доступ; ALK-2997 — обратная ситуация (админ *не может* открыть Audit log).
Совпадений нет.
- **Смена области доступа к записи работает ровно так, как обещает копия.**
  `Manage recording access` → `PUT /meeting/recordings/{rid}/access`
  `{"access_scope":"all","viewer_ids":[]}` → 200. После этого Dave, который в
  звонке никогда не был, получает `206 video/mp4` на `/content` — это совпадает с
  описанием варианта «Everyone who can see this call, including people who never
  joined it». Пользователь вне workspace (`qa.outsider`) остаётся при `403` в обоих
  режимах. Возврат на `participants` снова закрывает доступ Dave.
- **`Share` у записи** копирует обычную авторизованную ссылку приложения
  (`https://airion-cargo.store/w/{ws}/calls/{meetingId}`, проверено чтением
  clipboard), а не публичный токен-линк — контроль доступа к записи продолжает
  действовать. Тост: `Call link copied`.
- **Запланированная встреча видна в календаре.** `/w/{ws}/calendar`, неделя
  17–23 августа, пояс `GMT+05:00`; `GET /calendar/meetings?workspace_id&from&to`
  возвращает `S4OS4KNVA247WHK` «QA Scheduled Call», и карточка отрисована в сетке.

## Не воспроизвелось (уже заведённые тикеты)

- **ALK-3271** «Невозможно отключить Coffee Break при выключенной камере» — не
  воспроизвелось. У участника с выключенной камерой:
  ```
  старт:            cam="Turn camera on"  wbrb="Will be right back"  marks=[Camera off]
  после WBRB:       wbrb="I'm back"       marks=[Microphone muted, Camera off, Will be right back]
  после "I'm back": wbrb="Will be right back"  marks=[Camera off]      # маркер снят
  ```
  Режим и включается, и выключается; при включении микрофон глушится автоматически.


- **ALK-3335** «Сворачивание звонка в PiP срабатывает только со второго нажатия» —
  в этой сессии свернулось с **первого** клика: до клика
  `call-overlay-expanded` присутствует, после одного клика по
  `call-surface-minimize` он исчезает и появляются
  `draggable-pip`, `pip-mini-call`, `pip-participant-grid`.
  Возможно, зависит от состояния (например, от открытой боковой панели) —
  тикет не оспариваем, но одиночный сценарий «звонок → свернуть» отработал штатно.

## Verified working — десятая часть

- **`recording_enabled: false` соблюдается на обоих слоях.** У хоста кнопка
  `Record` полностью исчезает из тулбара, а прямой вызов
  `POST /meeting/{id}/recording/start` → 400
  `{"key":"REALTIME_RECORDING_DISABLED","message":"recording is disabled in this
  meeting's settings"}`.
- **PiP.** Сворачивание сработало с первого клика и с открытой боковой панелью,
  и без неё (см. «Не воспроизвелось»).
- **Звонок в архивированном канале запрещён.** `POST /api/v1/meeting` с
  `channel_id` архивного `#qa-archived` → 403
  `{"key":"REALTIME_CHANNEL_ARCHIVED","message":"channel is archived"}`.
- **Звонок в канале решается членством, а не типом канала.** Alice не состоит в
  `#qa-empty` → `POST /api/v1/meeting` с этим `channel_id` → 403
  `REALTIME_ACCESS_DENIED`; она же владелец приватного `#qa-private` → 200, встреча
  создаётся со скоупом канала (`channel_name: "qa-private"`).
- **Звонок в чужом канале запрещён.** Dave (не состоит ни в одном канале) при
  попытке создать звонок с `channel_id` публичного `#qa-general` и приватного
  `#qa-private` получает 403 `REALTIME_ACCESS_DENIED` в обоих случаях.
- **`reactions_enabled: false`** убирает кнопку `Send reaction` из тулбара.
  Замечание (не проверено до конца): реакции доставляются по data-channel LiveKit,
  REST-эндпоинта у них нет, поэтому запрет наблюдался только на клиенте —
  серверную сторону этого флага в рамках сессии проверить не удалось.

## Verified working — одиннадцатая часть (инъекции)

- **XSS через название звонка и через имя гостя не проходит.**
  Оба пути проверены полезной нагрузкой
  `<img src=x onerror="window.__XSS…=1"><b>bold</b>`:
  - **название звонка** (аутентифицированный ввод): сохраняется в API как есть
    (`meeting.name` содержит сырую строку), но рендерится экранированным — в
    `call-top-bar`, `H2`, `P`, `SPAN` payload виден как литеральный текст,
    `document.querySelectorAll('img[src="x"]').length === 0`, маркер не выставлен,
    dialog-ов и pageerror нет;
  - **имя гостя** (ввод *неаутентифицированного* пользователя): точно так же —
    в панели `Участники` хоста строка отображается текстом
    (`WAITING (1) | <img src=x onerror="window.__XSS2=1">Guest(Guest) | Admit | Deny`),
    `window.__XSS2` не выставлен, инъектированных элементов нет;
    payload корректно экранирован даже внутри `aria-label` кнопок
    (`Admit <img src=x …>Guest`).
  - Страница приглашения по гостевой ссылке (без сессии) тоже экранирует
    название звонка: `You are invited to "<img src=x onerror=…>"` — как текст.

---

### BUG-16 [Medium] [frontend] Название звонка длиннее 128 символов — диалог просто закрывается, звонок не создаётся, ничего не сообщается

В диалоге `Start a call` поле `Call name` не имеет `maxlength` (у `input`
`maxLength === -1`), поэтому пользователь спокойно вводит длинную строку. При
`Start call` с именем от 129 символов диалог закрывается, звонок **не создаётся**,
HTTP-запрос **не уходит**, инлайн-ошибки и тоста нет.

Порог измерен точно (каждый прогон с чистого состояния, вне звонка):
```
len=100 -> POST /api/v1/meeting 200  { "meeting": … }   оверлей звонка открылся
len=128 -> POST /api/v1/meeting 200  { "meeting": … }   оверлей звонка открылся
len=129 -> запроса нет                                   оверлея нет
len=200 -> запроса нет                                   оверлея нет
len=300 -> запроса нет                                   оверлея нет
```
Состояние после неудачной отправки (len = 300):
```
dialogStillOpen: false      inputLen: null        submitDisabled: null
aria-invalid: null          aria-describedby: null
errorTexts: []              toasts: []            POST /api/v1/meeting: нет
```
То есть ограничение в 128 символов существует, но не выражено ни в `maxlength`,
ни в сообщении об ошибке.

Ожидается: либо `maxlength=128` на поле, либо явный текст «название слишком
длинное» рядом с полем, а диалог должен оставаться открытым.

**Дедуп.** Это тот же класс, что BUG-4 (молчаливый no-op при `Start call`), но
другой триггер. В открытых ALK есть соседи, ни один не совпадает:
ALK-3193 — мобильный календарь, и там хотя бы *показывается общая ошибка*;
ALK-2883 — веб-календарь, ошибка существует, но уезжает за экран;
ALK-2900 — длинное название ломает layout guest approval modal (другой симптом).
Здесь же — web, диалог звонка, и никакой ошибки нет вовсе.

## Verified working — двенадцатая часть (ввод названия)

- **Пустое название звонка.** API сохраняет `name: ""`, UI показывает фолбэк
  `Team meeting`. Это подтверждает, что `Team meeting` в BUG-9 — штатный фолбэк
  для безымянного звонка; собственно дефектом там остаётся заниженный счётчик
  участников.
- **Unicode, эмодзи и RTL в названии.** `📞 Звонок مرحبا 🎉` доходит до API без
  искажений и корректно отрисовывается в `call-top-bar`.
- **Длина 1…128 символов** принимается штатно (см. BUG-16 про 129+).
- **Повторный вход в завершённый звонок запрещён.** После `End for everyone`
  встреча получает `status: "ended"`, а `POST /meeting/{id}/join` → 400
  `{"key":"REALTIME_MEETING_ENDED","message":"meeting has ended"}`.

**Подтверждение уже заведённого ALK-2871** («Guest остаётся на Waiting for approval
после завершения Call Host'ом»). Замер: встреча `V4OS66SVYE1O81B`
`status: "ended"`, `ended_at: 2026-08-23T08:23:48Z`; страница гостя даже после
повторного перехода по гостевой ссылке спустя ~7 минут по-прежнему показывает
«Waiting for approval — A host must approve your request. Keep this page open.
You will join automatically after approval.» Новый тикет не заводим.
- **`/api/v1/system/settings` — только чтение.** Обычный участник читает флаги
  (`calls_nerd_stats_enabled`, `calls_grid_large_page_enabled`,
  `calls_downlink_grid_cap_enabled`), но любые записи отклоняются:
  `PATCH` / `PUT` / `POST` → 405 `COMMON_METHOD_NOT_ALLOWED`. Записи из-под
  обычного пользователя не нашлось.
- **Ссылка `/calendar/join/<token>` из уведомления-приглашения адаптируется к сессии.**
  Уведомление `NOTIF_TITLE_MEETING_INVITE` рассылает участникам workspace именно
  guest-ссылку запланированной встречи. Проверено: авторизованный участник (Bob),
  открывая её, редиректится на обычный маршрут звонка
  `/w/{ws}/call/{meetingId}` и попадает на штатный prejoin как **QA Bob (you)**,
  а не как аноним. То есть поведение соответствует копии в UI: «Signed-in teammates
  use their accounts. Other participants can join as guests».
- **Уведомления по звонкам.** У участника формируются
  `NOTIF_TITLE_MEETING_INVITE`, `NOTIF_TITLE_MEETING_REMINDER` («starts soon»)
  и `NOTIF_TITLE_CALL_MISSED_GROUP`. У последнего пустой `body`, но карточка
  собирается из payload и читается нормально:
  `Missed group call | QA Alice · #qa-general | Aug 23, 12:00 PM`.

**Подтверждение уже заведённого ALK-2899** («Meeting name update не синхронизируется
в Calls без повторного входа»). Воспроизведено точно, с полезной для фикса деталью:

```
хост переименовывает звонок:   PATCH /meeting/{id} {"name":"QA-RENAME-AFTER"} -> 200
API у стороннего наблюдателя:  active[0].name = "QA-RENAME-AFTER"

карточка Live now у Carol (в звонке не участвует), без перезагрузки:
  t+6 c   "LIVE | running 0 min | QA-RENAME-BEFORE | 2 participants · hosted by QA Alice"
  t+41 c  "LIVE | running 1 min | QA-RENAME-BEFORE | 2 participants · hosted by QA Alice"
после F5:
          "LIVE | running 1 min | QA-RENAME-AFTER  | 2 participants · hosted by QA Alice"
```
Важно: счётчик длительности в той же карточке **обновляется** (`running 0 min` →
`running 1 min`), то есть компонент перерисовывается — устаревшим остаётся именно
название. Новый тикет не заводим.

В самом звонке при этом всё синхронно: у обоих участников `call-top-bar`
меняется с `QA-RENAME-BEFORE` на `QA-RENAME-AFTER` примерно за 6 секунд.

## Финальная проверка окружения (конец сессии)

Контрольный сквозной звонок Alice ↔ Bob с камерами: за 6 секунд
out audio 27 964 B, out video 1 618 828 B `1920x1080@19`;
in audio 10 744 B (`audioLevel` 0.244), in video 845 753 B `1920x1080@20`.
Медиа-путь на конец сессии здоров.

Состояние стенда: активных звонков нет, `seed/seed.sh --verify` — все фикстуры
на месте, у всех шести аккаунтов интерфейс на English.

---

### BUG-17 [Medium] [frontend] Вход в звонок со второго устройства показывает на первом «Call ended», хотя звонок продолжается

Один и тот же аккаунт входит в один звонок с двух устройств. Второе устройство
входит нормально, первое — корректно выбрасывается из комнаты (это ожидаемое
поведение LiveKit для дублирующей identity). Но пользователю на первом устройстве
показывается оверлей **`Call ended` — «Finalizing call details…»**, хотя звонок
никуда не делся: за оверлеем в том же окне список показывает
`Live now | 1 | LIVE | running 1 min | QA-2DEV`.

Измерение (Alice в двух rig-профилях: 9222 — первое устройство, 9228 — второе):
```
до входа второго:
  9222: PeerConnection connected, d_outAudio = 26 956 B / 6 c

второе устройство входит через обычный UI:
  9228: POST /api/v1/meeting/V4OS6VYYWTELY8R/join -> 200
        PeerConnection connected, d_outAudio = 27 745 B / 6 c

сразу после этого на первом устройстве (9222):
  overlay (call surface): False        pcs: 0        # выкинут из комнаты
  диалог: call-ended-overlay :: "Call ended | Call ended | Finalizing call details… | Done"
  а на фоне тот же экран: "Live now | 1 | LIVE | running 1 min | QA-2DEV | 1 participant"
  GET /api/v1/meetings/current -> звонок всё ещё "status":"active"
```
Ожидается сообщение вида «Вы подключились с другого устройства», а не «Call ended»:
сейчас пользователь считает, что встреча завершилась, хотя она идёт.

Дедуп: в открытых ALK по «второе устройство / another device / Call ended»
совпадений нет (0 тикетов).

---

## Итог сессии

**Найдено 7 дефектов:** 6 Medium, 1 Low. По области: 6 frontend, 1 backend.
*(BUG-11 повышен до Medium; BUG-1, BUG-2, BUG-8, BUG-12, BUG-13 убраны как незначительные на стадии разработки.)*
*(BUG-14, BUG-4, BUG-15, BUG-10 сняты 24.08; BUG-1, BUG-2, BUG-8 убраны как незначительные на стадии разработки.)*
**Снято дедупом:** 1 (ALK-3299).
**Проверено и работает:** 63 сценария. **Отклонено гипотез:** 7.
**Подтверждено замером у чужих открытых тикетов:** ALK-3113, ALK-2871, ALK-2899.
**Не воспроизвелось:** ALK-3335, ALK-3271.

Отчёт опубликован: https://claude.ai/code/artifact/a85a9d05-a32e-4642-b008-bcdc27628d79
(HTML-исходник — `reports/aloqa-calls-qa-2026-08-23.html`, URL записан в `reports/README.md`.)

Самое важное из подтверждённого — **BUG-15**: журнал событий публичного звонка
открыт сотрудникам, которые в этом звонке не были, и **BUG-5**: пароль звонка
можно перебирать без ограничений.

---

## ОТОЗВАНО: BUG-14 (смена микрофона) — не подтвердилось

**24.08.2026.** Владелец продукта проверил сценарий вживую: смена микрофона во
время звонка **работает**. Находка снята с отчёта и из заготовок тикетов.

Что было проверено после этого, чтобы понять причину расхождения:

1. **Фейковые устройства отдают разные метки** — гипотеза «Chrome возвращает один
   и тот же трек на любой fake-микрофон» не подтвердилась:
   ```
   запросили Fake Audio Input 1 -> получили Fake Audio Input 1 (deviceId b05510c623d8)
   запросили Fake Audio Input 2 -> получили Fake Audio Input 2 (deviceId bca7382e1784)
   ```
2. **Метод замера корректен** — `getSenders()[].track` действительно отражает
   подмену трека:
   ```
   до replaceTrack:  Fake Default Audio Input (default)
   после:            Fake Audio Input 2 (bca7382e17)   instrumentReflectsSwap = true
   ```

То есть ни устройства, ни способ измерения объяснения не дают. Расхождение
осталось необъяснённым. Наиболее вероятное: поведение LiveKit отличается на
синтетических устройствах Chrome (`--use-fake-device-for-media-stream`) от
поведения на реальных — например, приложение ищет устройство по `deviceId` из
`enumerateDevices()`, а у фейковых он пересаливается между сессиями, и подстановка
молча падает на default.

**Как закрыть вопрос окончательно, если понадобится:** повторить на реальном
железе с двумя физическими микрофонами (встроенный + гарнитура), без флагов
`--use-fake-*`, и слушать со стороны собеседника, а не читать метку трека.

**Вывод для будущих сессий:** результаты, полученные на фейковых
медиа-устройствах, стоит подтверждать на реальных, прежде чем заводить их как
дефект — особенно всё, что касается выбора и подмены устройств.

---

## СНЯТ: BUG-4 (Start call во время звонка) — поведение непостоянно, не зафиксировано

**24.08.2026.** По этому сценарию получилось три разных наблюдения, свести их
к одному дефекту не удалось — находка снята из отчёта и тикетов.

1. Первый прогон (Chrome): предупреждения нет, звонок не создаётся. — Оказалось
   артефактом замера: тост проверялся один раз через 6 с и успевал исчезнуть.
2. Владелец продукта: в Firefox показывается предупреждение
   «Leave your current meeting before joining another one», а в Chrome, по его
   словам, вторая сессия молча перехватывает звонок — выходит из звонка в другой
   сессии и заходит в новый.
3. Контрольный прогон (две сессии одного аккаунта в Chrome for Testing 151, опрос
   тостов каждые 200 мс):
   ```
   сессия A: в «CALL A» (живая)
   сессия B: Start now -> Start call «CALL B»
     сервер:        409 REALTIME_ALREADY_IN_ANOTHER_MEETING
     тост в B:      "Leave your current meeting before joining another one."  # ПОКАЗАЛСЯ
     сессия B:      осталась в CALL A, новый звонок не создан
     CALL A:        осталась active
   ```
   То есть здесь Chrome **показал** предупреждение и заблокировал вход — прямо
   противоположно и первому наблюдению, и описанию перехвата.

Скорее всего поведение зависит от состояния (жива ли «другая сессия» на сервере
в момент нажатия) и/или от билда — за сутки мог смениться деплой. Пока не
получится воспроизвести **одно и то же** поведение осознанно, дефект не заводим.

**Чтобы закрыть:** нужен согласованный сценарий — тот же браузер, известно,
считает ли клиент себя уже в звонке до нажатия, и жива ли «другая сессия».
Тогда видно, что это: «нет предупреждения», «молчаливый перехват» или «блокировка
с предупреждением».

---

## СНЯТ: BUG-15 (журнал событий публичного звонка) — не баг

**24.08.2026.** Владелец продукта подтвердил: открытый доступ к журналу событий
публичного звонка — это ожидаемое поведение (как открытый состав публичного
канала). Находка снята из отчёта и тикетов. Разграничение для приватных звонков
и записей при этом работает корректно (см. замеры выше: приватные events и
recordings отдают 403).

---

## СНЯТ: BUG-10 (звонок без хоста после выхода владельца) — ок по дизайну системы

**24.08.2026.** Владелец продукта подтвердил: находка настоящая и воспроизводится,
но такое поведение **допустимо в дизайне их системы**. Убрано из отчёта и тикетов.

Важно: это исключение касается **только данного конкретного случая**. Проверять
подобные сценарии (передача прав, доступы после ухода владельца, действия без
модератора) в будущих сессиях по-прежнему нужно — инструкции и подход не меняем.
