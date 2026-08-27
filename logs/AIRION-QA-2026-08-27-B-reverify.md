# AIRION QA — 2026-08-27 — lane B — re-verification of `reports/aloqa-calls-around-qa-2026-08-26-B.html`

Сборка на staging: `data-dpl-id="v0-61-0-rc-6-5be489db0ca6"` → tag `v0.61.0-rc.6`, frontend commit `5be489db0ca6`.
Отчёт писался на `v0.61.0-rc.5`. Хост после редиректа: `https://staging.airion-cargo.store`.
Лейн B, окна: alice 9232, bob 9233, carol 9234.

## Current state — ЗАКОНЧЕНО

- [x] Setup: фикстуры проверены, сборка записана, окна лейна B подняты и залогинены.
- [x] Все 12 находок перепроверены на `v0.61.0-rc.6` / FE `5be489db0ca6`.
- **11 из 12 воспроизводятся полностью**, 12-я (B:7) — наполовину: причина по-прежнему неверная,
  но пустой экран уже исправлен (ALK-3477, `86fbb51fc`, ключа нет в rc.5).
- Репро-сниппет написан и дважды прогнан для **всех 12** находок; блок `Воспроизведение`
  добавлен в отчёт после каждого `<h2>`.
- Самопроверка: `bench.load()` видит **12** находок лейна B (все со сниппетом на диске).
- `scripts/verify_report.py` даёт те же две ошибки, что и на закоммиченной версии отчёта
  (`NEAR-DUPLICATE TITLE PREFIXES`, `TITLE/ROW TEXT MISMATCH at [1,5,12]`) — они были до меня;
  мой диф: 72 вставки, 0 удалений, ровно 12 блоков.

### Что стоит поправить в отчёте (сам не правлю — задача была про сниппеты)

1. **B:7** — блок измерения (`interactiveCount: 0`, `interactive: []`, `/join/<мёртвый токен> 0`),
   фраза «нет ни одной кнопки» в «Проблеме» и пункт «На этом экране есть работающий элемент
   управления» в «Проверке» устарели: экран теперь даёт «Ask the host for a new invite link.»
   и ссылку **Go to sign in** → `/login`.
2. **B:0** — «Подтверждённая причина» говорит «сигнал не создаётся на сервере». На rc.6
   `GET /meeting/<id>/waiting` отвечает вышедшему ведущему **200** и отдаёт заявку.
   Причину надо сузить до «ни один экран ведущего вне звонка этих данных не запрашивает».
3. **B:10** — событие процитировано как `"actor_user_id":null`; на rc.6 ключа в объекте нет вовсе.
4. **B:8** — «кнопка не делает ничего»: запросов она правда не шлёт и звонка не создаёт,
   но на rc.6 разворачивает уже идущий звонок (адрес меняется на `/call/<id>`), а не остаётся
   на `/w/<ws>/calls`.

### Новые общие помощники этого прогона

`scripts/callrig/snip/b-second.mjs` (новый файл, лейн B, ничего общего не редактировал):
`second(lane, account)` — поднять и вести второе окно из сниппета; `signOut(ctx, page)` —
сделать окно анонимным (bench подписывает даже `guest`, а гостевой экран ведёт себя как гостевой
только без входа); `tile(...)` и `placeHalf(..., 'left'|'right')` — расстановка окон, когда
находку нельзя судить, видя только одно окно.

### Стендовые заметки, полезные следующему прогону

- Окно, сидящее в звонке, не может ни открыть `/w/<ws>/calls/<id>` (маршрут подменяется на
  `/call/<id>`), ни начать второй звонок (хаб не смонтирован, повторный вход зафенсен).
  Второе решается сворачиванием в PiP (`[data-testid="call-surface-minimize"]`),
  первое — **второй вкладкой того же окна**: там страница идущего звонка открывается нормально.
- `drive.mjs` ведёт ровно один браузер, а bench поднимает те аккаунты, которые выводит из текста
  находки (`verify_queue.roles_needed`), а не из `data-accounts`. Драйвер в блоке `Воспроизведение`
  обязан совпадать с тем, что поднимет bench, иначе `./d b:<кто-то>` упрётся в мёртвый порт.
  Для этого отчёта соответствие такое: B:0/B:4/B:8/B:11 → alice, B:2/B:9/B:10 → carol,
  B:3/B:6 → bob, B:1/B:5/B:7 → guest.

| # | id | finding | reproduced? | snippet |
|---|----|---------|-------------|---------|
| 1 | B:0 | ведущий вышел, стучащегося некому впустить | ДА | `b-host-left-knock.mjs` |
| 2 | B:1 | гость из side room занимает место навсегда | ДА | `b-guest-sideroom-seat.mjs` |
| 3 | B:2 | ожидающий перезагрузил → Admit никуда не приводит | ДА | `b-admit-after-reload.mjs` |
| 4 | B:3 | строка навсегда «Ringing…» после недозвона | ДА | `b-ringing-stuck.mjs` |
| 5 | B:4 | снятие пароля не убирает барьер | ДА | `b-password-barrier.mjs` |
| 6 | B:5 | «private meetings only» на гостевом экране | ДА | `b-guest-pw.mjs` |
| 7 | B:6 | история приглашённого одинакова для всех исходов | ДА | `b-invitee-history.mjs` |
| 8 | B:7 | мёртвая гостевая ссылка | ЧАСТИЧНО (0 кнопок — исправлено, ALK-3477) | `b-guest-deadlink.mjs` |
| 9 | B:8 | запущенная встреча остаётся с «Start call» | ДА | `b-sched-start.mjs` |
| 10 | B:9 | 0:00 in call у идущего звонка | ДА | `b-live-duration.mjs` |
| 11 | B:10 | «Meeting ended for everyone» без завершения | ДА | `b-endlog.mjs` |
| 12 | B:11 | журнал не отмечает остановку записи | ДА | `b-rec-log.mjs` |

## Ход работы

### #9 · B:8 — запущенная встреча остаётся в списке запланированных с `Start call` — **ПОДТВЕРЖДЕНО** на rc.6

Шаги пройдены как в отчёте: `Schedule meeting` → на карточке `Start call` → возврат в хаб
без перезагрузки (сворачивание звонка в PiP, `[data-testid="call-surface-minimize"]`).

```
хаб без перезагрузки, наименьшие карточки, содержащие название встречи:
  Live now         "LIVE running 0 min QA sched 130936 1 participant · hosted by QA Alice QA Join"
  Scheduled today  "01:11 PM 30 min QA sched 130936 0 participants · Hosted by QA Alice Start call"
  meetings/active  ровно одна встреча, id совпадает с запущенной

клик по Start call на карточке Scheduled today (кнопка доказанно topmost в своём центре:
document.elementFromPoint -> BUTTON "Start call", карточка = "01:30 PM 30 min <название> … Start call")
  запросов к /api/v1/ кроме GET — ни одного:      nonGet: []
  meetings/active до и после — тот же единственный id
  карточка Scheduled today через 45 с без перезагрузки — без изменений (t0 == t45)
```

**Уточнение против отчёта.** В отчёте сказано, что единственный видимый эффект — переход
на `/w/<ws>/calls`. На rc.6 клик, наоборот, разворачивает уже идущий звонок: адрес становится
`/w/<ws>/call/<id>`. Суть находки не меняется (запросов нет, звонок не создаётся, дубль карточки
остаётся), но формулировка «ничего не делает» на rc.6 неточна — кнопка уводит в уже идущий звонок.
Правку прозы не вношу: задача — репро-сниппет.

Сниппет: `scripts/callrig/snip/b-sched-start.mjs`, два прогона подряд `ready:true`, `stepsDone:3`.
Преflight сам закрывает свою же встречу от прошлого прогона (`^QA sched `), чужой звонок не трогает.

### #12 · B:11 — журнал не отмечает остановку записи — **ПОДТВЕРЖДЕНО** на rc.6

Прогон по шагам отчёта: звонок → `Record` → `Start recording` → `Stop recording` → завершение →
страница звонка → вкладка `Logs`.

```
вкладка Logs завершённого звонка, часть про запись, сверху вниз
  01:12:27 PM   Recording activity | By QA Alice
  01:12:27 PM   Recording activity
  01:12:27 PM   Recording activity
  01:12:15 PM   Recording activity
  01:12:10 PM   Recording started automatically
  01:12:09 PM   Recording activity
строки "Recording stopped" на странице нет ни одной

GET /api/v1/meeting/<id>/events?limit=100   200   (12 событий)
  recording.started 1, recording.egress_started 1, recording.egress_updated 2,
  recording.stop_requested 1, recording.egress_ended 1
```

Совпадает с отчётом дословно, включая набор типов событий. Кнопка остановки — `Stop recording`
(`data-testid="call-controls-record"`), подтверждения нет, действует сразу.

Сниппет: `scripts/callrig/snip/b-rec-log.mjs`, два прогона `ready:true`, `stepsDone:3`.
Запись поднимается через egress не мгновенно — сниппет ждёт появления `Stop recording` до 40 с.

### #11 · B:10 — «Meeting ended for everyone» без завершения — **ПОДТВЕРЖДЕНО** на rc.6

Групповой звонок, carol вошла, alice вышла через `Leave call` (+ подтверждение `Leave`),
затем carol вышла тем же путём — звонок закрылся сам.

```
вкладка Logs завершённого звонка (кнопку End for everyone никто не нажимал)
  01:21:05 PM   QA Carol left the call
  01:21:05 PM   Meeting ended for everyone
  01:20:52 PM   QA Alice left the call
  01:20:41 PM   QA Carol joined the call
  01:20:26 PM   Meeting started

GET /api/v1/meeting/<id>/events?limit=100    200
{"event_type":"meeting.ended","source":"livekit","visibility":"participant",
 "payload":{"event":"room_finished","room":{…},"id":"EV_…","created_at":…}}

контроль: у оставшегося участника кнопки End for everyone действительно нет
  hasEndForEveryone: false, hasLeaveCall: true
```

**Уточнение против отчёта.** В отчёте событие процитировано как `"actor_user_id":null`.
На rc.6 ключа `actor_user_id` в объекте события **нет вовсе** (`hasOwnProperty` → `false`),
а не приходит как `null`. Вывод («различить два случая клиенту нечем») не меняется.

Сниппет: `scripts/callrig/snip/b-endlog.mjs`, два прогона `ready:true`, `stepsDone:3`.
Второе окно (carol) сниппет поднимает сам через новый helper `snip/b-second.mjs`.

### #10 · B:9 — «0:00 in call» на странице идущего звонка — **ПОДТВЕРЖДЕНО** на rc.6

```
звонок идёт 158 с, в нём двое; счётчик внутри звонка у ведущего: 2:28
страница /w/<ws>/calls/<id> → View all
  "QA Alice | Current | Joined 01:36 PM · left — | 0:00 in call"
  "QA Carol | Current | Joined 01:36 PM · left — | 0:00 in call"

положительный контроль — то же поле у завершённого звонка (0:40 длиной)
  "QA Alice | Left | Left early | Joined 01:20 PM · left 01:20 PM | 0:26 in call"
  "QA Carol | Left |            | Joined 01:20 PM · left 01:21 PM | 0:24 in call"
```

Замерено дважды на двух разных звонках. Диапазон rc.5→rc.6 содержит
`df91f41d7 perf(calls): synchronize call surface clocks (ALK-3573)` и
`e02a35a15 test(calls): verify call duration isolation` — на эту поверхность они не подействовали.

**Стендовая заметка (важна для сниппета).** Страницу идущего звонка нельзя открыть из окна,
которое само сидит в этом звонке: маршрут `/w/<ws>/calls/<id>` подменяется на `/w/<ws>/call/<id>`,
и открывается сам звонок. Наблюдатель обязан быть третьим окном — поэтому драйвер сниппета `bob`,
а alice и carol он поднимает сам.

**Ловушка при замере.** Счётчик длительности нельзя читать из `document.body.innerText`:
регулярка `\b\d{1,2}:[0-5]\d\b` первым делом ловит время суток из списка запланированных
встреч («01:07»), и это читается как длительность звонка. Читать нужно из оверлея звонка
(`[data-testid="call-overlay-expanded"]`) строкой после названия звонка.

Сниппет: `scripts/callrig/snip/b-live-duration.mjs`, два прогона `ready:true`, `stepsDone:2`
(шаг 3 «нажать View all» — человеку).

### #6 · B:5 — «Meeting password (private meetings only)» на гостевом экране — **ПОДТВЕРЖДЕНО** на rc.6

```
звонок: GET /api/v1/meeting/<id> -> {"is_private": false, "password_protected": true, "status":"active"}

гостевой экран (браузер без входа, GET /api/v1/auth/me -> 401):
  "You are invited to “<звонок>” Enter the name other participants will see.
   Your name | Meeting password (private meetings only) | Join call"

  имя ""        пароль ""   ->  "Join call" disabled = true
  имя "Guest QA" пароль ""  ->  "Join call" disabled = true
  имя "Guest QA" пароль "x" ->  "Join call" disabled = false
  подпись поля во всех трёх замерах: "Meeting password (private meetings only)"
  input.required = false
```

Совпадает с отчётом полностью, включая `input.required = false`.

Сниппет: `scripts/callrig/snip/b-guest-pw.mjs`, драйвер — окно `guest`, два прогона `ready:true`,
`stepsDone:3`. **Важно:** bench поднимает роль `guest` через `ensure.sh`, то есть подписывает этот
браузер, а гостевой экран ведёт себя как гостевой только без входа. Сниппет сам разлогинивает окно
(`signOut` в новом `snip/b-second.mjs`) и печатает это в `signedOut`. Второй прогон сделан
специально из залогиненного состояния: `{"was":"qa.b.<lane>.guest@…","now":null}` — предохранитель
проверен в сработавшем виде, а не только в проходящем.

### #8 · B:7 — мёртвая гостевая ссылка — **ПОДТВЕРЖДЕНО ЧАСТИЧНО**; половина находки исправлена на rc.6

Находка состоит из двух утверждений. На rc.6 первое держится, второе — нет.

```
гость (браузер без входа), ссылка на только что завершённый звонок
  bodyText:  "Join as a guest | This invite link is no longer valid.
              Ask the host for a new invite link. | Go to sign in"
  интерактивных элементов во всём документе: 1
  [{"tag":"A","text":"Go to sign in","href":"/login","visible":true}]

участник рабочего пространства, тот же самый завершённый звонок
  bodyText:  "Call has ended | This call has already ended.
              You can start a new one from the workspace home. | Back to workspace"
  интерактивных элементов: 25
```

- **Держится:** гостю по-прежнему называют неверную причину — «ссылка недействительна»,
  хотя ссылка живая, а звонок просто закончился. Контраст с экраном участника рабочего
  пространства («Call has ended») тот же, что в отчёте.
- **Исправлено:** экран больше не тупик. Появились строка «Ask the host for a new invite link.»
  и рабочая ссылка **Go to sign in** → `/login`.

Что именно это закрыло, проверено на исходниках по задеплоенному sha:

```
git log 5be489db0ca6 -S "calls.guest.blocked.signIn" -- packages/core/src/i18n/dictionaries/en.ts
  86fbb51fc fix(guest-entry): give stranded invite visitors a safe exit (ALK-3477) (#2815)

git show v0.61.0-rc.5:packages/core/src/i18n/dictionaries/en.ts | grep -c "calls.guest.blocked.signIn"   -> 0
положительный контроль на том же файле и той же метке:            grep -c "calls.guest"  -> 79
```

То есть ключа в rc.5 не было вовсе, а пустой grep не является артефактом инструмента.
Строка `'calls.guest.blocked.signIn': 'Go to sign in'` есть на задеплоенном sha
(`packages/core/src/i18n/dictionaries/en.ts:2776`), и на неё есть тесты
(`apps/web/app/join/[token]/__tests__/page.test.tsx:57`).

**Что нужно поправить в отчёте (не правлю — задача про сниппеты):** в блоке
«Фактический результат» строки `interactiveCount: 0  interactive: []  links: []` и `/join/<мёртвый
токен> 0` устарели; строка «На всей странице при этом нет ни одной кнопки» в «Проблеме» и пункт
«На этом экране есть работающий элемент управления» в «Проверке» — тоже. Формулировка причины
(«говорят, что дело в ссылке») остаётся верной, находку целиком снимать нельзя.

Сниппет: `scripts/callrig/snip/b-guest-deadlink.mjs`, два прогона `ready:true`, `stepsDone:3`.
Предохранитель проверяет только ту половину, которая держится; `asserted` и `leftToDo` показывают
человеку текущий, а не отчётный, набор элементов и прямо предупреждают об устаревшем измерении.

### #2 · B:1 — гость из side room навсегда занимает место — **ПОДТВЕРЖДЕНО** на rc.6

Гость вошёл по ссылке-приглашению, принял приглашение в side room, вкладку убили через
CDP `/json/close/<targetId>` (обычного выхода `Leave call` не было).

```
вкладка гостя убита в 09:17:03Z

  +21 с  GET /api/v1/meeting/<id>/participants
         {"name":"<гость>","type":"guest","left_at":null,"in_breakout":true}
         в звонке (по left_at): 2      meetings/active participant_count: 2
  +41 с  то же
  +61 с  то же
  +81 с  {"name":"<гость>","type":"guest","left_at":null}   ← in_breakout уже не приходит,
         строка на месте:  2 / 2                              строка остаётся

реально в звонке один человек — ведущий

последствие — ведущий не может выставить лимит по факту
PATCH /api/v1/meeting/<id> {"max_participants":1}      400
{"code":400,"key":"REALTIME_MEETING_LIMIT_BELOW_CURRENT",
 "message":"participant limit is below the current number of participants: лимит 1 при 2 участниках в звонке",
 "trace_id":"<id>"}
PATCH /api/v1/meeting/<id> {"max_participants":2}      200   ← лимит 2 принят при одном человеке

контроль: тот же гость, тот же аварийный обрыв, но БЕЗ side room
  вкладка убита в 09:11:26Z
  +5 с   participants: [{"QA Alice"}]  в звонке 1, participant_count 1  ← строка гостя исчезла
  +25/+45/+65/+85 с — то же
```

Контроль важен вдвойне: он доказывает, что способ обрыва (убийство вкладки через CDP) сам по себе
освобождает место, то есть разница именно в side room, а не в том, как я рвал связь.

Сниппет: `scripts/callrig/snip/b-guest-sideroom-seat.mjs`, драйвер — окно `guest`, два прогона
`ready:true`, `stepsDone:4` (шаг 5 — лимит — человеку, окно ведущего выводится наверх).
Гость входит во **второй вкладке** окна `guest`: убивают именно её, вкладка-драйвер переживает обрыв.
Вход в комнату идёт через приглашение (`Accept`), появляется оно не мгновенно — сниппет ждёт до 40 с
и печатает, каким путём гость попал в комнату (`guestEnteredRoomVia`).

### #1 · B:0 — ведущий вне звонка не узнаёт о стучащемся — **ПОДТВЕРЖДЕНО** на rc.6

Звонок `Wait for admission`, carol впущена, alice вышла через `Leave call` и осталась в рабочем
пространстве, третий человек (рабочий аккаунт, `participant_type: "user"`) нажал `Join`.

```
стучащийся: "ALREADY IN ROOM · 1 | Waiting for host approval
             You can join after a host admits you from the waiting room."

экран ведущего, 20 замеров подряд за 60 с — ровно одно состояние (distinctStates: 1)
  notifications  total 7 / unread 7 — не изменились
  поиск /wait|pending|queue|knock|lobby|admission|request/ по всему телу
      GET /api/v1/notifications?limit=50 -> 0 совпадений
  колокольчик   "Notifications, 7 unread" — не изменился
  карточка живого звонка, все её кнопки:  ["Join"]
  meetings/active, ключи про очередь:     []       (18 ключей верхнего уровня, ни одного об очереди)
  тосты: []      documentVisibility: "visible"

при этом заявка жива и доступна ТОМУ ЖЕ ведущему через API:
GET /api/v1/meeting/<id>/waiting     200
{"participants":[{"participant_id":"<pid>","user_id":"<uid>","name":"<имя>",
  "username":"<логин>","avatar_url":null,"waited_since":"2026-08-27T09:30:20Z",
  "participant_type":"user","guest_id":""}]}

оставшийся в звонке участник перенять впуск не может:
GET /api/v1/meeting/<id>/waiting     403  {"key":"REALTIME_ACCESS_DENIED"}
кнопок Admit/Deny в его панели участников: 0
```

Отличие от отчёта в лучшую сторону: **сервер отдаёт очередь и вышедшему ведущему** (200, не 403).
То есть данные у клиента ведущего есть откуда взять — не показывает их именно интерфейс.
Отчёт формулирует причину как «сигнал не создаётся на сервере»; на rc.6 это не так —
`/waiting` вне звонка отвечает 200 с заявкой. Формулировку «Подтверждённой причины» стоит сузить
до «ни один экран ведущего вне звонка этих данных не запрашивает и не показывает».
Само наблюдение (ведущему нигде не сообщают) держится полностью.

Сниппет: `scripts/callrig/snip/b-host-left-knock.mjs`, два прогона `ready:true`, `stepsDone:4`
(шаг 5 — смотреть экран ведущего — человеку; в `leftToDo` названо и продолжение: нажать `Join`
на карточке и увидеть, что заявка жива).

**Ловушка, стоившая прогона.** Проверка «встал ли человек в очередь» по `innerText.slice(0,200)`
всегда ложна: первые 200 символов — боковая панель, а «Waiting for host approval» лежит дальше.
Обрезанный дамп читается ровно как «в очередь не встал». Проверка перенесена внутрь страницы.

### #3 · B:2 — Admit после перезагрузки ожидающего никуда не приводит — **ПОДТВЕРЖДЕНО** на rc.6

```
пока человек действительно ждёт
GET /api/v1/meeting/<id>/waiting     200
{"participants":[{"participant_id":"<pid>","user_id":"<uid>","name":"<имя>",
  "username":"<логин>","avatar_url":null,"waited_since":"2026-08-27T09:37:19Z",
  "participant_type":"user","guest_id":""}]}

после того как он перезагрузил страницу — у него на экране "READY TO JOIN?"
  showsReadyToJoin: true   showsWaiting: false   notices: []   (ни одного сообщения)
  кнопки внизу экрана: [... "Test audio", "Join", "Cancel"]
GET /api/v1/meeting/<id>/waiting     200
  та же запись, тот же "waited_since":"2026-08-27T09:37:19Z"

ведущий жмёт Admit ("Admit QA Carol" в панели участников)
GET /api/v1/meeting/<id>/waiting     200   {"participants":[]}
   у ведущего в звонке "1 in call";  у второго по-прежнему "READY TO JOIN?", уведомлений нет
```

Совпадает с отчётом. Заметка на будущее (в отчёт не выношу — вне рамок находки): после такого
`Admit` в `GET /meeting/<id>/participants` появляется строка впущенного с `left_at: null`,
хотя счётчик в интерфейсе показывает «1 in call» — то есть остаётся ещё и фантомная строка,
как в находке B:1 про side room. Проверять отдельно.

Сниппет: `scripts/callrig/snip/b-admit-after-reload.mjs`, драйвер — carol, два прогона `ready:true`,
`stepsDone:3` (шаг 4 — нажать `Admit` — человеку). Панель участников у ведущего сниппет открывает
сам и выводит это окно наверх, а точное имя кнопки печатает в `leftToDo`.

### #5 · B:4 — снятие пароля не убирает барьер — **ПОДТВЕРЖДЕНО** на rc.6

```
экран стоящего у барьера до снятия пароля
  "This call is password-protected | Enter the call password to join. | Join call | Back to workspace"
  поле пароля: ""      Join call disabled = true

ведущий выключает Password protection в Meeting settings и жмёт Save
GET /api/v1/meeting/<id>   ->  "password_protected": false   (09:42:33Z)

экран стоящего у барьера, непрерывный опрос 26 замеров за 75 с (3 с шаг)
  distinctStates: 1  — за все 75 с не изменилось ничего
  barrier: true      поле пароля: ""      Join call disabled = true
  notices: ""        documentVisibility: "visible"

контроль — барьер держится только устаревшим состоянием клиента:
  ввод в то же поле произвольной строки ("totally-wrong-<ts>") разблокирует Join call,
  и человек немедленно оказывается в звонке (в тексте появляется Leave call)
```

**Ловушка, стоившая одного прогона.** Первый замер 75 с был бессмысленным: сниппет, открывающий
Meeting settings, жмёт `call-controls-settings-toggle` безусловно, а панель уже была открыта —
клик её закрыл, `meeting-settings-password-toggle` не нашёлся (`"before":"not-found"`,
`"saved":false`), пароль остался включён. Экран, разумеется, «не изменился» — но измерял он не то.
Действие теперь проверяется по `aria-pressed` тумблера и по ответу сервера, а не по факту клика.

Сниппет: `scripts/callrig/snip/b-password-barrier.mjs`, драйвер — alice, два прогона `ready:true`,
`stepsDone:2` (шаги 3-4 — снять пароль и смотреть чужой экран — человеку). Оба окна расставляются
половинами экрана новым помощником `placeHalf` в `snip/b-second.mjs`: находку вида «одно окно
меняется, другое нет» нельзя судить, если видно только одно окно.

### #4 · B:3 — строка навсегда «Ringing…» после недозвона — **ПОДТВЕРЖДЕНО** на rc.6

```
строка приглашаемого ДО приглашения (Add to call)
  "QB QA Bob"            checkboxDisabled = false

приглашение отправлено кнопкой "Invite (1)"
экран приглашённого  +11 с   "QA Alice is calling…  Accept | Decline"
                     +27 с   "Missed call from QA Alice"     (не отвечал)

список у ведущего, страница НЕ перезагружалась, диалог закрыт и открыт заново
  "QB QA Bob Ringing…"   checkboxDisabled = true
  ещё раз через 45 с     "QB QA Bob Ringing…"   checkboxDisabled = true

соседние строки того же диалога в тот же момент
  "QC QA Carol"          checkboxDisabled = false
  "QD QA Dave"           checkboxDisabled = false
```

Положительный контроль встроен в замер двояко: строка того же человека была свободна до
приглашения, а соседние строки свободны и после — то есть диалог живой, залипает именно исход
недозвона. Приглашение доказанно дошло (баннер `is calling…` с Accept/Decline), так что
«строка застряла» отделено от «приглашение не пришло».

Сниппет: `scripts/callrig/snip/b-ringing-stuck.mjs`, драйвер — bob (он получает вызов и молчит),
два прогона `ready:true`, `stepsDone:3`. Диалог сниппет заглядывает и снова закрывает: шаг 4
находки — «снова открыть Add to call» — остаётся человеку, окно ведущего выводится наверх.

### #7 · B:6 — история приглашённого одинакова для всех исходов — **ПОДТВЕРЖДЕНО** на rc.6

Два групповых звонка подряд, оба длились по 72 с, приглашённый ни в один не входил.

```
история приглашённого — два разных исхода, одна и та же подпись
  "QA hist 150300  Incoming · Ended · Aug 27, 03:03 PM · 1m"   вызов пришёл, не ответил (истёк)
  "QA hist 150433  Incoming · Ended · Aug 27, 03:04 PM · 1m"   вызов пришёл, нажал Decline

поля, по которым клиент выбирает подпись, GET /api/v1/meetings/history?limit=100
  missed_for_viewer   не приходит ни в одной из 88 строк
  end_reason          групповые звонки — 0 строк из 62
                      личные звонки    — 10 строк из 26 (cancelled, timed_out, declined)

приложение знает правду: GET /api/v1/meeting/<id>/participants обоих звонков
  участники: ["QA Alice"]      приглашённого среди них нет ни в одном
```

Разделение «групповой / личный» в ответе истории идёт по `channel_id`: у личных он непустой
(и `name` пустое), у групповых пуст. Все 10 строк с `end_reason` — личные.

Сниппет: `scripts/callrig/snip/b-invitee-history.mjs`, драйвер — bob, два прогона `ready:true`,
`stepsDone:4` (шаг 5 — открыть раздел Calls — человеку, окно уводится на Directories).
Оба звонка сниппет держит не меньше 70 с перед завершением: иначе длительность округляется
до «0m» и утверждение «показана длительность всего звонка, а не участия» ничего не показывает.

