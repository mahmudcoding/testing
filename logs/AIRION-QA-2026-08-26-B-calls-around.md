# AIRION QA — 2026-08-26/27 — lane B — sector B (Calls: around the call)

- Build (frontend): `data-dpl-id="v0-61-0-rc-5-c4b5386b4a3a"` → tag `v0.61.0-rc.5` @ commit `c4b5386b4a3a`
- Reading of the prompt `9:00 B`: **sector B on lane B**.
- Lane B: company `O4QBF1XTURESO01`, workspace `W4QBF1XTURESO01`
- Browsers: alice 9232, bob 9233, guest 9238 (signed out — anonymous guest window)
- Timebox: 14:40 26.08 → 09:00 27.08 +05 (~18 ч)

## Current state

Setup выполнен: фикстуры полосы B целы, билд записан, зеркало Jira синхронизировано.

**Уже покрыто часовым проходом сектора B сегодня утром** (`logs/AIRION-QA-2026-08-26-B-calls.md`,
отчёт https://claude.ai/code/artifact/c1dca9c9-546c-442a-b3f9-07e128a28126, сборка `v0.61.0-rc.3`):
лобби и одобрение, гостевая ссылка, гостевой вход, `End for everyone`, страница завершённого звонка,
классификация вкладок хаба, парольный барьер, вход из канала, смена настроек на ходу, запуск
запланированной встречи, отклонение личного звонка, `Call again`, панель уведомлений.
Три находки в отчёте — **не переоткрывать**: экран ожидания одобрения без элементов управления;
пароль звонка не показывается хосту; журнал звонка не пишет допуск/отказ.

**Куда идти — тонкие места** (из «не пройдено за бокс» утреннего прохода + диффа деплоя rc.3→rc.5):
takeover, held calls, пагинация истории, лимит гостевых слотов, обрыв связи участника, рейтинг звонка,
вкладка Recording, device modes в настройках встречи, ringing/no-answer, и свежие коммиты rc.4→rc.5:
ALK-3444 (имя звонящего при повторном приглашении), ALK-3363 (строки о выпавших участниках в журнале),
ALK-3409 (сворачивание звонка с его собственного маршрута), ALK-3448 (бан/разбан → повторный вход).

## Findings

### Verified working — takeover (второе устройство того же аккаунта), ALK-3373

Звонок `QA takeover test` (public, open entry), хост — Alice в окне 9232, участник — Bob 9233.
Вторая сессия того же аккаунта Alice поднята в окне 9234 (`login.mjs`, полоса та же, guard не мешает).

Поллер на окне 9232 (300 мс, запущен **до** триггера) — переход зафиксирован на 9.3 с:

```
--- 0.0 s  /call/V4OWJHFZ37P4RN7?returnTo=/w/<WS>/calls
    ids: call-surface, call-surface-minimize, call-surface-fullscreen
--- 9.3 s  /w/<WS>/calls
    ids: call-ended-overlay-backdrop, call-ended-overlay, call-taken-over
    dialog: "You joined from another device | The call is continuing on your other device.
             This device disconnected so you are not in the call twice. | Done"
```

Формулировка точная (не «Call ended», как было в ALK-3373), единственная кнопка — `Done`.
Звонок у Bob при этом **не прервался**: та же сессия, счётчик длительности продолжил идти
(1:50 → 2:59 без разрыва), состав `QA Alice` + `QA Bob (you)` сохранился. Не находка.

### Verified working — сворачивание звонка с его собственного маршрута (ALK-3409)

Bob на `/w/<WS>/call/<id>?returnTo=/w/<WS>/calls`, жмёт `Minimize to picture-in-picture`:
URL становится `/w/<WS>/calls`, появляются `draggable-pip` + `pip-mini-call`, звонок продолжается.
Рабочее пространство возвращается — то, что чинил ALK-3409. Не находка.

### Наблюдение (в отчёт не пойдёт) — карточка `Live now` предлагает `Join` звонок, в котором ты уже находишься

Bob свёрнут в PiP того же звонка (`pip-mini-call` в DOM). Карточка в `Live now`:

```
LIVE | running 2 min | QA takeover test | 2 participants · hosted by QA Alice | QB | QA | Join
controls: [{t: "Join"}]          pipPresent: true
```

Единственный элемент управления — `Join`. Нажатие **не** создаёт вторую сессию и не выбивает
из звонка: оверлей просто разворачивается, счётчик длительности идёт непрерывно (2:59).
То есть дефект чисто в подписи кнопки; аватар `QB` в карточке всё же говорит, что ты внутри.
Косметика, на триаже такое срезают — оставляю наблюдением.

### Verified working — обрыв связи участника (реальный, не эмуляция)

Сначала попробовал CDP `Network.emulateNetworkConditions {offline:true}` на окне Bob на 35 с.
**Ничего не изменилось ни у Bob, ни у Alice** — оба поллера (350 мс, с запуском до триггера)
за 110 с не дали ни одного изменения состояния, звонок шёл. Это ровно то ограничение стенда,
о котором предупреждает CLAUDE.md: offline режет HTTP страницы, но не WebRTC-медиа.
**Тест признан неинформативным**, вывода о живучести из него не делаю.

Настоящий обрыв — закрытие вкладки со звонком (`page.close()` после открытия запасной):
у Alice участник исчезает чисто, залипшей плитки нет.

```
Alice до:    tiles: 2 | "QA takeover test | QA Alice (you) | QA Bob ..."
Alice после: tiles: 1 | "QA takeover test | 7:03 | Excellent · 6ms | QA | QA Alice (you) | Leave call"
             banners: []   (баннера восстановления/переподключения нет — его и не должно быть у наблюдателя)
```

В журнале звонка обрыв записан как `QA Bob left the call` — тем же текстом, что и осознанный выход.
ALK-3363 (rc.5) чинил как раз появление строк о выпавших участниках; строка есть.
Отдельного статуса «отвалился» нет, но это уже вопрос формулировки, а не потери события.

### Verified working — последний участник выходит → звонок закрывается

`QA host leave test`: после выхода всех троих `GET /api/v1/meeting/<id>` → `"status":"ended"`,
`GET /api/v1/workspace/<WS>/meetings/active` → `{"meetings":[]}`, хаб `Live now 0`. Хвостов нет.

### Дедуп — воспроизводится на rc.5, уже заведено, повторно не заводим

- **ALK-3475** — диалог выхода последнего участника: Carol осталась в звонке одна, но диалог
  всё равно обещает `The call continues for everyone else, and you can rejoin while it is still
  running.` После подтверждения звонок немедленно завершился. Воспроизводится дословно.
- **ALK-3145** — «Уже находящийся в звонке пользователь видит Join вместо Return to call».
  Это ровно моё наблюдение по карточке `Live now` выше. В отчёт не идёт.

### BUG-1 [High] [frontend] Ведущий вышел из звонка с `Wait for admission` — стучащегося в лобби больше некому впустить, и ведущему об этом нигде не сообщают

Прогон 1, звонок `QA lobby orphan test` (`public` + `Wait for admission`), участники: Alice (host),
Bob (впущен), Carol (стучится после ухода Alice).

Шаги: Alice создаёт звонок с `Wait for admission` → Bob стучится, Alice впускает → **Alice выходит
через `Leave call`** (обычный выход, диалог сам обещает `The call continues for everyone else`) →
Carol открывает ссылку звонка и жмёт `Join`.

Что измерено:

```
CAROL (стучится):
  "Waiting for host approval | You can join after a host admits you from the waiting room."
  видимые кнопки: ['Cancel request', 'Back to workspace']

BOB (единственный участник в звонке, не host) — поллер 350 мс, 100 с, начат ДО стука Carol:
  changes: 2  (обе — только счётчик длительности и ping)
  surf: "QA lobby orphan test | 1:05 | ... | QB | QA Bob (you) | Leave call"
  toasts: ['QA Alice left the call']      ← ни одного тоста про ожидающего
  панель Participants, открыта вручную:
  "Participants | 1 in call | QB | QA Bob | (you)"     ← секции WAITING нет вовсе

ALICE (host, вне звонка, на /w/<WS>/calls):
  GET /api/v1/notifications?limit=15 → 200
  {"notifications":[],"total":0,"unread_count":0}
  панель колокольчика: "Notifications | Mark all as read | All caught up | No notifications yet."
  карточка в Live now: "LIVE | running 2 min | QA lobby orphan test | 1 participant · hosted by
                        QA Alice | QB | Join"
  интерактив в карточке: [{t: "Join"}]      ← ни бейджа, ни счётчика ожидающих
```

Заявка при этом **не теряется**: как только Alice снова вошла в звонок, панель немедленно показала
`WAITING (1)` с `Admit QA Carol` / `Deny QA Carol`. То есть сервер держит запрос, а до ведущего
о нём просто не доходит ни одного сигнала.

**Граница ответственности:** заявка жива на сервере (видна сразу после возвращения ведущего),
значит теряется не она, а оповещение. Ведущему в звонке тост о стуке приходит (проверено утренним
проходом) — нет именно внешнего канала: ни записи в `/api/v1/notifications`, ни бейджа на карточке.

**Смежное, но другое:** ALK-3250 — «для участников звонка Waiting Lobby показывает 0» — покрывает
ровно ту часть, что Bob не видит ожидающих. В отчёт эту часть не выношу, пишу только про ведущего.
ALK-2871 — гость висит на Waiting for approval после завершения звонка — другой случай (см. ниже,
у залогиненного участника этот случай отработан правильно).

### Verified working — завершение звонка, пока человек ждёт в лобби

Alice завершила звонок через `End for everyone`, пока Carol стояла в очереди на вход.
Carol немедленно получила корректный экран:

```
"Call has ended | This call has already ended. You can start a new one from the workspace home."
кнопки: ['Back to workspace']   testids: call-deeplink-shell, call-deep-link-loader
```

Для залогиненного участника случай отработан. (ALK-2871 описывает то же для **гостя** —
это другой путь, отдельно проверю в блоке про гостей.)

### Verified working — замена гостевой ссылки аннулирует старую

Звонок `QA guest link test` (`public` + `open` + guest link `everyone`).
`Add to call` → `Invite link` со ссылкой вида `/join/<64 hex>` и кнопками `Copy` / `Create new link`.

1. Ссылка A открыта в **анонимном** окне (9238, не залогинено): экран `You are invited to
   “QA guest link test” | Enter the name other participants will see.`, поле имени, `Join call`
   (disabled, пока имя пустое). Ввёл имя → вошёл: `/guest/meeting/<id>`, плитка `Visitor One (you) | GUEST`.
2. Хост нажал `Create new link` → в поле новая ссылка (другие 64 hex).
3. **Уже вошедшего гостя не выбивает** — `Visitor One` остался в звонке (`inCall: true`).
4. Свежий анонимный посетитель (тот же браузер после `ctx.clearCookies()`) по **старой** ссылке A:

```
url:  /join/582c…f2e0
text: "Join as a guest | This invite link is no longer valid."
```

Старая ссылка аннулирована — это правильно и есть главное в проверке.

### BUG-2 [Low] [frontend] Экран «этой ссылки больше нет» — тупик: на всей странице ноль интерактивных элементов

Тот же экран из пункта 4 выше. Замер по **всей** странице, не по `main`, включая ссылки и
элементы с `tabindex`:

```
url:               /join/582c…f2e0
bodyText:          "Join as a guest | This invite link is no longer valid."
interactiveCount:  0
interactive:       []
links:             []
```

Человеку, которому переслали устаревшую ссылку, дальше идти некуда: ни кнопки, ни ссылки на
приложение, ни подсказки попросить у ведущего новую. Сообщение при этом честное — дефект только
в отсутствии выхода. Родственный, но **другой** экран: ALK-3529 — гость в очереди на одобрение
(переходное состояние); здесь состояние терминальное.

### Наблюдение (сектор A, не мой) — у гостя одновременно кнопка `Share screen` и баннер «нельзя»

Гостевая плитка: `Screen sharing is not allowed for you in this call.`, а в тулбаре при этом
активная кнопка `Share screen`. Смежно с ALK-2740 и ALK-3326 — передаю сектору A, в отчёт не беру.

### BUG-3 [Medium] [frontend] После неотвеченного приглашения в идущий звонок строка участника навсегда застревает на «Ringing…» — пригласить его повторно нельзя без перезагрузки

Звонок `QA reinvite test` (`public` + `open`), хост Alice, приглашаются Bob и Carol, оба вне звонка.
`Add to call` → чекбокс участника → `Invite (1)`.

Сторона приглашённого (Carol, поллер по **всему документу** 300 мс, запущен до приглашения):

```
приглашение отправлено 15:28:33
+10.2 s  fixed-оверлей: "QA QA reinvite test | QA Alice is calling… | Accept | Decline"
         testids: incoming-call-toast-avatar, incoming-call-toast-channel-icon
+40.1 s  fixed-оверлей: "Missed call from QA Alice"
+45.3 s  оверлей исчез
```

Звонящий назван правильно («QA Alice») — это то, что чинил ALK-3444 в rc.5, работает.

Сторона хоста, тот же `Add to call`, страница **не перезагружалась**:

```
15:30:32   QA Bob      disabled=True   row='QB QA Bob Ringing…'     (приглашён 15:25:15 → 5 мин 17 с)
15:30:32   QA Carol    disabled=True   row='QC QA Carol Ringing…'   (уже получила «Missed call»)
```

После `page.reload()` того же экрана хоста:

```
15:30:58   QA Bob      disabled=False  row='QB QA Bob'
15:30:58   QA Carol    disabled=False  row='QC QA Carol'
```

**Граница ответственности:** свежая загрузка той же страницы отдаёт строки чистыми, то есть на
сервере вызов давно закрыт; зависает только состояние в уже открытом клиенте. Чекбокс при этом
`disabled`, поэтому позвать человека ещё раз в этом звонке нельзя вообще — ни кнопки `Ring again`,
ни другого пути в диалоге нет (перечислены все интерактивные элементы диалога).

**Дедуп:** ALK-2278 (статус TESTING, т.е. закрыт) — это и есть та правка, которая делает уже
приглашённого недоступным для повторного выбора; в её «Проверке» прямо сказано, что recipient
сразу становится недоступным. Но снятия этого состояния по истечении вызова там нет. ALK-2007
(Task, Backlog) описывает серверный таймаут недозвона и терминальные исходы `declined / cancelled /
timed_out / missed` — фронтовой обработки `timed_out` в открытом диалоге не видно. Открытого бага
на это нет: `list --open-bugs` прочитан целиком, `grep` по «Ringing|Invite to the call|дозвон» —
только закрытые.

### Verified working — входящее приглашение в идущий звонок (ALK-3444)

Всплывающее окно у приглашённого: аватар, название звонка, **`QA Alice is calling…`**, кнопки
`Accept` / `Decline`. Имя звонящего подставлено верно. Уведомление в колокольчике приходит тоже:

```
GET /api/v1/notifications?limit=15 → 200
{"notifications":[{"title_key":"NOTIF_TITLE_CALL_INCOMING_WORKSPACE","title":"Call in workspace",
  "payload":"{\"meeting_id\":\"<id>\",\"caller_id\":\"<uid>\",\"caller_name\":\"QA Alice\",
             \"is_direct\":false,\"scope\":\"workspace\"}",
  "actor_name":"QA Alice","category":"call","event_type":"incoming_call"}],"total":1,"unread_count":1}
```

Панель колокольчика: `Call in workspace | QA Alice · Workspace | Aug 26, 03:25 PM`.

**Методическая заметка (чуть не стоила ложной находки):** первый поллер читал только `main` и
показал ноль изменений за 90 с — я едва не записал «приглашение не доставляется». Всплывающее
окно входящего звонка — это fixed-оверлей **вне `main`**, а колокольчик живёт в шапке. Поллер по
всему документу увидел и то, и другое. Ровно та же ошибка, что дала ложную находку соседней
сессии по Side Rooms.

### Наблюдение — тост «Invited 1 people to the call»

Множественное число при единице. Родственно `1 stars` у оценки звонка, которую уже отбраковали
на триаже (08-25-A BUG-2), поэтому в отчёт не выношу.

### BUG-3 — чистое воспроизведение на одном экземпляре страницы (без перезагрузки между случаями)

Звонок `QA ring state test`, страница хоста загружена в 15:34:57 и **ни разу не перезагружалась**.

```
15:35:30  приглашён QA Bob
15:35:5x  Bob нажал Decline (его оверлей: "QA ring state test | QA Alice is calling… | Accept | Decline")
15:35:55  строки у хоста:  QA Bob   disabled=False  row='QB QA Bob'          ← отпустило сразу
15:35:5x  приглашена QA Carol, она не отвечает
15:36:04  строки у хоста:  QA Carol disabled=True   row='QC QA Carol Ringing…'
15:37:57  строки у хоста:  QA Bob   disabled=False  row='QB QA Bob'
                           QA Carol disabled=True   row='QC QA Carol Ringing…'   ← 2 мин спустя
```

Итог: исход **`declined` клиент обрабатывает** (строка освобождается мгновенно), исход
**недозвона — нет** (строка висит `Ringing…` и `disabled` неограниченно). Ранее на другом
экземпляре страницы Bob провисел так 5 мин 17 с, и только `page.reload()` вернул строки в норму.

### BUG-4 [Low] [frontend] Журнал звонка пишет «Meeting ended for everyone», хотя звонок никто не завершал — он закрылся сам, когда вышел последний участник

Звонок `QA host leave test`: хост Alice вышла через `Leave call` в 02:55:52 PM, Bob вышел в
03:01:58 PM, Carol — последняя — в 03:02:22 PM. Кнопки `End for everyone` у Bob и Carol **не было**
(перечислены все кнопки тулбара: только `Leave call`), хост в этот момент был вне звонка.
Тем не менее вкладка **Logs** показывает:

```
03:02:22 PM | Meeting ended for everyone
03:02:22 PM | QA Carol left the call
```

Сырое событие за этой строкой — `GET /api/v1/meeting/<id>/events?limit=100`:

```json
{"event_type":"meeting.ended","source":"livekit","actor_user_id":null,
 "visibility":"participant","occurred_at":"2026-08-26T10:02:22Z",
 "payload":{"event":"room_finished","room":{"empty_timeout":30,"departure_timeout":30}}}
```

Для сравнения — звонок `QA takeover test`, который хост **действительно** завершил кнопкой
`End for everyone`:

```json
{"event_type":"meeting.ended","source":"livekit","actor_user_id":null,
 "visibility":"participant","occurred_at":"2026-08-26T09:51:55Z",
 "payload":{"event":"room_finished"}}
```

**Подтверждённая граница:** оба случая приходят одним и тем же событием — `actor_user_id: null`,
`source: livekit`, `payload.event: room_finished`. В ответе нет ничего, по чему клиент мог бы
отличить «ведущий завершил» от «комната закрылась, когда осталась пустой», а формулировку
«ended for everyone» — дословно совпадающую с названием кнопки в интерфейсе — добавляет именно
клиент. Читатель журнала сопоставит строку с действием, которого не было.

Смежное: ALK-2826 — журнал называет ручную запись автоматической (та же семья: журнал приписывает
событию неверную причину). Другое событие, но на триаже могут объединить.

### Инструментарий — сырой журнал звонка

`GET /api/v1/meeting/<id>/events?limit=100` → `{"events":[…]}`. Типы, которые встретились:
`meeting.started`, `meeting.ended`, `participant.joined`, `participant.left`,
`track.published`, `track.unpublished`. У `participant.*` есть `actor_user_id`, у `meeting.ended` — нет.
Соседние пути (`/logs`, `/audit`, `/audit-events`, `/activity`) отдают 404.

### Verified working — пагинация истории звонков (`Load more`)

История Alice перевалила за размер страницы (`RECENTS_PAGE_SIZE = 20`).

```
GET /api/v1/meetings/history?limit=20 → 20 записей, next_cursor: "MjAyNi0wOC0yNlQwNTo1ODowMy44MDY4Mzha"

до нажатия:   вкладки [All · 20, Group meetings · 18, 1-to-1 · 2], строк 20, кнопка "Load more" (enabled)
              самая старая строка: "QB QA Bob Outbound · Ended · Aug 26, 10:58 AM · 1m"
после:        вкладки [All · 21, Group meetings · 19, 1-to-1 · 2], строк 21, "Load more" исчезла
              самая старая строка: "QA QA admit test Outbound · Ended · Aug 26, 10:46 AM · 7m"
```

Кнопка догружает следующую страницу и корректно пропадает на последней. Счётчики вкладок при этом
считают **загруженные** строки, а не всю историю (`All · 20` при фактическом 21) — это тот же
клиентский подсчёт по загруженным страницам, что описан в **ALK-3119**; отдельной находкой не выношу.

### Verified working — запуск запланированной встречи виден приглашённому без перезагрузки

Встреча `QA sched entry test` создана на 15:50 (`POST /api/v1/calendar/meetings`, attendees Bob и Carol).

```
до старта, хаб Bob:   "Scheduled today | 1 | 03:50 PM | 30 min | QA sched entry test |
                       0 participants · Hosted by QA Alice | Not started yet"   элементов управления: []
до старта, хаб Alice: то же, но элемент управления: ["Start call"]
```

Alice нажала `Start call` в 15:43:46. Хаб Bob **без перезагрузки** в 15:44:01:

```
Live now:        "LIVE | running 0 min | QA sched entry test | 1 participant · hosted by QA Alice | Join"
Scheduled today: "03:50 PM | 30 min | QA sched entry test | 1 participant · Hosted by QA Alice | Join"
```

Обе секции обновились сами. У приглашённого до старта элементов управления нет вовсе — но звонка
ещё не существует, входить некуда, поэтому дефектом не считаю.

Идущая встреча при этом показана в хабе **дважды** — и в `Live now`, и в `Scheduled today`.
Это же наблюдение зафиксировал утренний проход сектора B и не стал выносить в отчёт; согласен.

## Current state (обновлено 15:45)

Найдено и залогировано: **BUG-1 (High)** — ведущий вышел, стучащегося некому впустить и ведущему
не сообщают; **BUG-2 (Low)** — экран «invite link no longer valid» без единого элемента управления;
**BUG-3 (Medium)** — строка участника навсегда застревает на `Ringing…` после недозвона;
**BUG-4 (Low)** — журнал пишет «Meeting ended for everyone», когда звонок закрылся сам.

Проверено и работает: takeover (ALK-3373), сворачивание с собственного маршрута (ALK-3409),
обрыв связи участника, закрытие звонка последним участником, завершение звонка пока человек ждёт
в лобби, замена гостевой ссылки аннулирует старую, входящее приглашение и имя звонящего (ALK-3444),
пагинация истории, запуск запланированной встречи и его live-доставка приглашённому.

Дедуп-подтверждения на rc.5: ALK-3475, ALK-3145, ALK-3119, ALK-3250 (смежно), ALK-2278 (закрыт,
но его состояние не снимается — это и есть BUG-3).

Стенд: 4 браузера полосы B (alice 9232, bob 9233, carol 9234, guest 9238 — не залогинен).
За сессию соседняя сессия пять раз закрывала все браузеры рига, правя `launch.sh`/`drive.mjs`;
одна 170-секундная проба недозвона потеряна, всё остальное переснято. Снипеты — префикс `b2-`.

Дальше: отмена исходящего 1-to-1 звонка (что видит вызываемый), приватная встреча и вход
неприглашённого, парольный барьер с неверным паролем, вкладки Chat/Recording на странице
завершённого звонка.

### Verified working — отмена неотвеченного исходящего 1-to-1 звонка

Alice звонит Bob из `Directories` → строка `QA Bob` → `Call`. Экран звонящего — `outgoing-call-surface`
/ `outgoing-call-stage` / `outgoing-call-ringing-status`, ровно три элемента управления:
`Mute`, `Turn camera on`, `Leave call` (`call-controls-leave`). Отдельной кнопки `Cancel` нет.

Сторона вызываемого (поллер по всему документу, запущен до звонка):

```
15:46:40  звонок начат
+11.5 s   testids: incoming-call-banner, -avatar, -status, -decline, -accept
          баннер: "QA QA Alice Incoming call";  колокольчик 2 → 3 unread
15:47:07  Alice нажала Leave call (диалога подтверждения нет — и правильно, звонок не состоялся)
+38.0 s   баннер исчез;  колокольчик 3 → 2 unread
```

Баннер снимается сразу, **и уведомление тоже убирается** — фантомного «пропущенного» не остаётся.

В истории у обеих сторон запись полная:

```
Alice: "QB QA Bob        Outbound · Canceled · Aug 26, 03:46 PM · 0m"
Bob:   "QA QA Alice      Incoming · Canceled · Aug 26, 03:46 PM · 0m"
```

**ALK-3177** («Отменённый Direct Call отображается без времени и информации об участнике»)
на rc.5 в таком виде **не воспроизводится**: и имя собеседника, и время, и длительность на месте
у обеих сторон. В отчёт не выношу (чужой тикет), но для перепроверки это полезный факт.

Заметка по словарю: строки истории у получателя подписаны `Incoming`, у инициатора `Outbound` —
пара несогласована (Incoming/Outgoing либо Inbound/Outbound). Плюс групповые звонки, в которые
человек вошёл сам из хаба, тоже подписаны `Incoming`. Это семья **ALK-3473**, отдельно не выношу.

**Методическая заметка:** сначала я отбирал строки истории регуляркой `(Outbound|Inbound)\s*·`
и у Bob не нашёл ничего — чуть не записал «у получателя записи нет». Приложение пишет
`Incoming`, а не `Inbound`. Полное перечисление кнопок секции сразу показало строку на месте.
Правило «перечисляй элементы, а не подтверждай гипотезу» работает и против собственной регулярки.

### Verified working — парольный барьер

Звонок `QA password test 2`, создан с `calls-hub-entry=password` и паролем `Sekret-42`
(в диалоге создания появляется поле `type=password`, placeholder `Set a password`).

Порядок экранов у входящего: сначала pre-join проверка устройств (`Join` / `Cancel`), и **только
после неё** — парольный барьер `This call is password-protected | Enter the call password to join.`
с полем `call-password-input` (`aria-label="Call password"`).

```
неверный пароль → тост "Incorrect password. Try again."
                  остаётся на барьере, поле на месте, inCall: false
верный пароль   → inCall: true, URL получает ?returnTo=...
```

Формулировка ошибки конкретная, не «что-то пошло не так». Работает.

### Verified working — гостю отказали во входе

Звонок `QA guest deny test` (`public` + `Wait for admission` + guest link `everyone`).
Гость (анонимное окно) по ссылке `/join/<token>`:

```
экран ввода имени: "You are invited to “QA guest deny test” | Enter the name hosts will see
                   before they admit you. | The host will need to approve your entry. | Ask to join"
```

Хост видит в панели: `WAITING (1) | VD | Visitor Deny(Guest) | Admit | Deny`. После `Deny`:

```
GUEST body: "Request declined | A host declined your request to join.
             Contact them if you think this is a mistake. | Request to join again"
interactiveCount: 1   interactive: ['Request to join again']
```

Отказ отработан правильно: понятная причина и путь дальше.

### Дедуп — ALK-3529 воспроизводится на rc.5 дословно, плюс полезный контраст

Экран гостя **в ожидании** одобрения, замер по всей странице:

```
body: "Waiting for approval | A host must approve your request. Keep this page open.
       You will join automatically after approval."
interactiveCount: 0    interactive: []
```

Ноль элементов управления — ровно то, что заведено в ALK-3529 (находка утреннего прохода).
**Контраст, полезный для исправления:** на соседнем экране того же гостевого пути — «Request
declined» — кнопка есть (`Request to join again`), а у залогиненного участника на этапе ожидания
есть `Cancel request` и `Back to workspace`. То есть шаблон для кнопки уже существует в обоих
соседних состояниях; пустой только экран ожидания у гостя.

Мелочь по копирайту (в отчёт не выношу): в списке ожидающих имя гостя выводится как
`Visitor Deny(Guest)` — без пробела перед скобкой.

### Наблюдение (в отчёт не выношу) — незапущенная запланированная встреча молча исчезает из хаба

Создана встреча `QA never started` (15:55:21 → 15:57:21, приглашён Bob), запускать её никто не стал.

```
15:56:57  Scheduled today · 2 :  "03:50 PM | 30 min | QA sched entry test | Meeting ended"
                                 "03:55 PM | 2 min  | QA never started  | Start call"
15:58:01  Scheduled today · 1 :  "03:50 PM | 30 min | QA sched entry test | Meeting ended"
          → карточка `QA never started` пропала; элементов управления: []
```

Несостоявшаяся встреча исчезает в момент `ends_at` без всякого следа — нет ни «не состоялась»,
ни «пропущена». При этом **завершённая** встреча из секции не исчезает и продолжает висеть с
подписью `Meeting ended`. Т.е. секция хранит завершённые, но выбрасывает несостоявшиеся.
Данные не теряются — встреча остаётся в календаре (сектор E), — поэтому дефектом не считаю,
но несогласованность зафиксирую.

### Verified working — вкладка Chat на странице завершённого звонка

Звонок `QA chat tab test`: Alice отправила `alice says hello`, Bob — `bob replies here`
(композитор в звонке — `textarea[placeholder="Message everyone"]`, не contenteditable).
После `End for everyone` страница `/w/<WS>/calls/<id>`:

```
вкладки: [Recording 0, Chat 2, Logs 10]
Chat:    "CHANNEL | In-call chat | 2 participants | DIRECT MESSAGES | No direct messages during
          this call | In-call chat | 2 participants · QA chat tab test |
          QA | QA Alice | 04:00 PM | alice says hello |
          QB | QA Bob   | 04:00 PM | bob replies here"
```

Счётчик совпадает с числом сообщений, авторы, время и текст на месте, пустое состояние для DM
сформулировано корректно. (ALK-3083 — про несчёт сообщений из тредов — здесь не проверялся:
тредов в этом звонке не было.)

### Verified working — вход в звонок, где исчерпан лимит участников

`QA limit entry test`, `PARTICIPANT LIMIT = 2` выставлен в Meeting settings на ходу
(`GET /api/v1/meeting/<id>` → `"max_participants":2`). В звонке Alice и Bob.

Третий участник (Carol) жмёт `Join`:

```
main: "The call is full | This call has reached its participant limit. Try again in a moment.
       | Try again | Back to workspace"
```

Сообщение конкретное, не «что-то пошло не так». Когда Bob вышел (16:06:49), автоматически Carol
**не** впустило — она осталась на том же экране; кнопка `Try again` сработала и завела её в звонок
(`inCall: true`, `QA limit entry test | 6:16 | QA Alice | QA Carol (you)`).

Замечание: кнопка `Try again` появляется на экране не сразу — при первом замере сразу после отказа
на экране были только `Back to workspace` и `Dismiss`. Момент её появления я не засёк.

### Наблюдение (кандидат Low, скорее всего сольют с ALK-3425) — одно и то же сообщение о лимите показывается и экраном, и тостами, и тост возвращается сам

Та же попытка входа. Помимо полноэкранного «The call is full …» приложение показывает тосты
с тем же текстом:

```
сразу после Join:   [data-sonner-toast] × 3, все "This meeting has reached its participant limit."
                    (стопкой, y = 953 / 941 / 929)
```

Дальше, **без единого действия пользователя**, на том же экране (замер 60 с, шаг 250 мс):

```
t=0     тостов 2
t=6.4   тостов 1
t=9.2   тостов 0
t=28.8  тостов 1     ← появился сам
t=38.1  тостов 0
```

Количество одновременных тостов от прогона к прогону разное (3 / 2 / 1) — то есть это не «ровно
три», а повторяющиеся всплытия одного и того же текста поверх экрана, который уже это говорит.
Семья ALK-3425 (дублирующееся уведомление при закрытии Side Room). Отдельно заводить не стал.

### Verified working — звонок во время звонка (call waiting) и переключение между звонками

`QA call A` (Alice + Bob) идёт; Carol создаёт `QA call B` и приглашает Bob.
Поллер по всему документу на окне Bob, запущен до приглашения:

```
приглашение 16:10:18
+9.0 s   testids: incoming-call-priority-layer, call-waiting-surface, call-waiting-switch-note,
                  call-waiting-accept-switch, call-waiting-decline
         текст:  "Incoming call | You are already in a call. Accept and switch, or decline.
                  Accepting leaves your current call"
+53.6 s  поверхность ещё на месте
16:11:42 (≈84 с) поверхность исчезла сама; Bob при этом **остался в звонке A**
         (`QA call A | 2:37 | QA Alice | QA Bob (you)`)
```

Отдельная поверхность именно для «звонок во время звонка», формулировка честно предупреждает,
что текущий звонок будет покинут. Истечение вызова текущий звонок не задевает.

Приняли переключение (второе приглашение, кнопка `call-waiting-accept-switch`):

```
Bob   → "QA call B | 2:53 | QC QA Carol | QB QA Bob (you) | Leave call"
Alice → "QA call A | 3:47 | QA QA Alice (you) | Leave call | End for everyone"   tiles: 1
```

Bob действительно вышел из A и вошёл в B — ровно то, что обещает надпись. **Держания
(hold) в продукте нет** — это переключение, и интерфейс это прямо говорит.

### BUG-3 — третье и четвёртое подтверждение, на другом хосте и другом типе вызова

Здесь приглашающий — Carol (не Alice), вызов ушёл в состояние call-waiting и истёк сам:

```
16:11:42  строка у Carol:  QA Bob  disabled=True   row='QB QA Bob Ringing…'   (≈84 с после вызова,
                           поверхность у Bob к этому моменту уже исчезла)
после page.reload() у Carol: QA Bob  disabled=False  row='QB QA Bob'
```

То есть дефект не завязан ни на конкретного хоста, ни на путь вызова: любой неотвеченный
`Add to call` оставляет строку заблокированной до перезагрузки страницы.

### Verified working — хаб с двумя одновременными живыми звонками

```
Live now | 2 | LIVE | running 4 min | QA call B | 2 participants · hosted by QA Carol | QC | QB | Join
             | LIVE | running 4 min | QA call A | 1 participant · hosted by QA Alice | QA      | Join
GET /api/v1/workspace/<WS>/meetings/active → QA call B: participant_count 2
```

Оба звонка перечислены, счётчики и ведущие верные, единственное и множественное число согласовано
(`1 participant` / `2 participants`). Обе карточки кликабельны.

### Verified working — приватный звонок закрыт для постороннего

`QA private detail` создан с `calls-hub-access=private` (`"is_private":true`), завершён.
Bob в нём не был и не был приглашён:

```
UI:  "Call unavailable | You do not have access to this call."   (единственная ссылка — Calls)
API: GET /api/v1/meeting/<id>/events?limit=100 → 403
```

Для сравнения, страница **публичного** завершённого звонка (`QA guest link test`) тому же Bob,
который в нём тоже не участвовал, открывается полностью — название, ведущий, состав, вкладки
Recording/Chat/Logs. Для публичного звонка это согласуется с тем, что он и так виден всем в хабе.

### Дедуп — ALK-2988 на rc.5 не воспроизводится

«Guest не помечается в Participants после завершения Call». Диалог `View all` на странице
завершённого `QA guest link test`:

```
Participants | Historical participant activity for this call.
QA | QA Alice     | Left | Left early | Joined 03:20 PM · left 03:23 PM | 3:23 in call
VO | Visitor One  | Guest | Left | Left early | Joined 03:21 PM · left 03:22 PM | 0:50 in call
```

Метка `Guest` на месте. Похоже, починено; полезно для перепроверки чужого тикета.

### Verified working — снятие требования одобрения впускает ожидающего автоматически

`QA mode switch test` создан с `Wait for admission`. Bob постучался (16:17:39) и ждёт.
Хост переключает `WHO CAN JOIN` на `Anyone` (radio `meeting-settings-entry-open`) в 16:18:05:

```
GET /api/v1/meeting/<id>   до переключения: "requires_approval":true
                           после (через 5 с): "requires_approval":false
```

Поллер по всему документу на окне Bob (запущен до переключения):

```
t=0      testids: call-deep-link-waiting-room, call-deep-link-waiting-status
         "Waiting for host approval. You can join after a host admits you from the waiting room."
t=16.7 s комната ожидания исчезла, Bob в звонке: "QA mode switch test | 0:46 | — | Leave call"
t=17.0 s "QA mode switch test | 0:46 | QA QA Alice | QB QA Bob (you) | Leave call"
```

Ожидающего впустило само, без действий хоста и без перезагрузки. Комбинация состояний отработана.

Побочно подтверждает **ALK-3490**: переключатель `WHO CAN JOIN` применяется мгновенно,
кнопки `Save`/`Cancel` к нему не относятся (в панели они стоят ниже, в блоке MEETING).

### Verified working — приватная запись не видна рядовому участнику

`QA recording test`: Alice (автор и владелец встречи) начала запись, в диалоге `Recording access`
выбран вариант **Private** — «The recording author, meeting owner, and selected viewers can view
the recording». Bob в звонке был, но он не автор и не владелец.

```
ALICE, вкладки страницы завершённого звонка:
  [Recording 1, Chat 0, Logs 16, Share, Download, "Manage recording access: Private", "Play recording"]
  "Recording | 0:24 · MP4 | REC | Meeting recording.mp4 | 1920 × 1080"

BOB, та же страница:
  [Recording 0, Chat 0, Logs 16]
  "Recording | No recordings yet"
```

Ограничение доступа соблюдено. Bob при этом во время звонка видел бейдж `Recording` и тост
`This call is being recorded` — то есть о факте записи его предупредили, а содержимое не отдали.

### Проверено — длительность записи считается верно (моя первая оценка была ошибочной)

В первом прогоне файл оказался 0:24 при записи, которая, как мне казалось, шла ~78 с, и я собирался
писать находку. Переснял с привязкой к часам звонка:

```
старт записи   ≈ отметка звонка 0:30 (wall 11:24:26Z, часы звонка 0:37 сразу после старта)
стоп записи    = отметка звонка 2:32 (wall 11:26:21Z)  → записывали ≈ 115–122 с
файл:          "Recording | 1:57 · MP4",  video.duration = 119.23 с
```

Совпадает. Значит в первом прогоне я неверно определил момент старта (перепутал часы звонка
с длительностью записи), а не приложение потеряло данные. **Находки нет.**

### Дедуп — воспроизводится на rc.5, уже заведено

- **ALK-3113** (плеер всегда подписывает файл как 1920 × 1080). Подтверждено дважды, с замером:
  карточка пишет `1920 × 1080`, а у самого элемента `video` — `videoWidth × videoHeight = 1280 × 720`.
- **ALK-2798** (заголовок и плеер показывают разную длительность). Тоже дважды:
  `0:24` в карточке против `0:25` в плеере; `1:57` в карточке против `1:59` в плеере
  (`video.duration = 119.23`). Карточка, похоже, округляет вниз, плеер — вверх.

### Verified working — управление доступом к записи (Private + выбранные зрители, выдача и отзыв)

Страница завершённого `QA recording test`, запись сделана с видимостью **Private**.
Кнопка `Manage recording access: Private` открывает диалог: три уровня видимости
(`Everyone in the meeting` / `People who joined the call` / `Private`) и список **Viewers**
с чекбоксами по участникам workspace.

```
исходно      BOB:  [Recording 0, Chat 0, Logs 16]         "Recording | No recordings yet"
выдали Bob   → тост "Recording access updated"
после выдачи BOB:  [Recording 1, ..., Share, Download, "Play recording"]
                   "Recording | 0:24 · MP4 | Meeting recording.mp4 | 1920 × 1080"
                   кнопки "Manage recording access" у него НЕТ (он не автор и не владелец) — верно
отозвали Bob → тост "Recording access updated"
после отзыва BOB:  [Recording 0, Chat 0, Logs 16]         "Recording | No recordings yet"
```

Выдача и отзыв работают в обе стороны и сразу. Управление доступом доступно только автору/владельцу.

Попутно проверено и **дефектом не является**: чекбоксы зрителей выглядят без подписи, но каждый
обёрнут в `<label>` и имеет парный `label[for=id]` с именем участника — то есть подпись есть.

### Verified working — личный звонок 1-to-1 целиком: вызов → приём → разговор → завершение

Alice звонит Bob из `Directories`. У Bob появляется **баннер** (не тост, как у группового
приглашения): testids `incoming-call-banner`, `-avatar`, `-status`, `-decline`, `-accept`;
кнопки в баннере без текста, только testid — по тексту `Accept` их не найти.

```
16:32:39  вызов
+9.2 s    Bob нажал incoming-call-banner-accept
Bob:   "Call with QA Alice | 0:09 | QA QA Alice | QB QA Bob (you) | Leave call"
Alice: "Call with QA Bob   | 0:18 | QB QA Bob   | QA QA Alice (you) | Leave call"   tiles: 2
```

Название звонка у каждой стороны — имя собеседника. У Alice в личном звонке нет
`End for everyone`, только `Leave call` — логично.

После выхода Alice у Bob сразу итоги звонка, **оба участника перечислены**:

```
"Call ended | · Call with QA Alice · 29s | Duration 29s | Recording Unavailable |
 PARTICIPANTS | QB | QA Bob   | Left | Joined 04:32 PM · left 04:33 PM | 0:29 in call
             | QA | QA Alice | Left | Joined 04:32 PM · left 04:33 PM | 0:29 in call
 | AI SUMMARY Coming soon | RATE QUALITY ..."
```

(Сначала я прочитал только первые 180 символов и решил, что собеседник в итогах отсутствует —
это была моя обрезка, а не дефект. Полный текст диалога показывает обоих.)

История у звонящего различает исходы:

```
"QB QA Bob Outbound · Ended     · Aug 26, 04:32 PM · 0m"   ← ответили
"QB QA Bob Outbound · No answer · Aug 26, 04:31 PM · 1m"   ← не ответили
```

**Это важно для BUG-3:** приложение прекрасно знает, что вызов остался без ответа — в истории
стоит явный статус `No answer`. Не обрабатывается только состояние строки в уже открытом
диалоге `Add to call`.

### Verified working — бан участника, отказ во входе и разбан (ALK-3448, свежее в rc.5)

Меню участника у хоста содержит `Remove from call` и **`Ban`** отдельными пунктами.
`Ban` → диалог `Ban from this meeting? | QA Bob will be removed and cannot rejoin this meeting.`

```
после бана, панель хоста:
  "Participants | 1 in call | BLOCKED (1) | QB | QA Bob | qa.b.bob@aloqa.test | Unban |
   QA | QA Alice | (you) | HOST"

Bob пытается войти снова:
  "You cannot rejoin this call | A host removed you from this call and blocked you from
   rejoining it. Ask them to invite you again. | Back to workspace"

после `Unban` секция BLOCKED исчезла у хоста сразу;
Bob нажал Join → inCall: true, "QA ban test | 2:43 | QA Alice | QA Bob (you)"
```

Весь цикл отрабатывает. **ALK-3097** («Заблокированный участник не видит причину отказа при
повторном входе») на rc.5 **не воспроизводится** — причина названа явно и по делу.

Мелочи (в отчёт не выношу):
- В списке `BLOCKED` рядом с именем показан **email** участника (`qa.b.bob@aloqa.test`),
  тогда как в остальных списках звонка — только отображаемое имя. Несогласованно, но в рамках
  одного workspace email и так виден в профиле.
- Тот же паттерн дублирования, что и с лимитом участников: полноэкранное сообщение об отказе
  плюс тост с тем же смыслом («You cannot join because you were removed from this meeting.»).

## Перепроверка находок перед отчётом (свежие страницы, другие звонки)

**BUG-2 — подтверждена.** Другой звонок (`QA ban test`), новая пара ссылок:
хост заменил ссылку A на B, анонимное окно после `ctx.clearCookies()` открыло A:

```
bodyText:          'Join as a guest | This invite link is no longer valid.'
interactiveCount:  0        links: []
```

**BUG-3 — подтверждена, и уточнилась.** Приглашение Carol в 16:37:53, она не отвечает.
В 16:39:59 (2 мин 6 с) на той же, не перезагружавшейся странице:

```
QA Bob     disabled=True   row='QB QA Bob In call'      ← строка обновилась, он вошёл
QA Carol   disabled=True   row='QC QA Carol Ringing…'   ← не отпустило
```

Важное уточнение: строка **живая** — состояние `In call` до неё доходит. Не доходит именно
завершение вызова по недозвону. Это сужает причину: дело не в том, что список не обновляется.

**BUG-4 — подтверждена.** `QA ban test`: Alice вышла 04:40:36 PM, Bob (последний) 04:40:44 PM,
кнопки `End for everyone` у Bob не было. Журнал:

```
04:40:45 PM | Meeting ended for everyone
04:40:44 PM | QA Bob left the call
04:40:36 PM | QA Alice left the call
```

Сырое событие то же самое: `{"event_type":"meeting.ended","source":"livekit","actor_user_id":null,
"payload":{"event":"room_finished"}}`.

Побочно в том же журнале видно, что **бан и разбан записаны как `Participant activity | QA Alice
→ QA Bob`** — без указания, что именно произошло. Это усиливает **ALK-3531** (журнал не пишет
допуск/отказ) вторым типом события: журнал фиксирует, что между двумя людьми что-то было, но не что.
Отдельной находкой не выношу — тот же тикет.

**BUG-1 — подтверждена ранее двумя прогонами**, второй с непрерывным 150-секундным поллером
уведомлений хоста (ноль изменений за всё время). Третий прогон не потребовался.

## Отчёт

Опубликован: https://claude.ai/code/artifact/5fc9fa61-e210-4f73-aa31-58ae1e0125e9
Файл: `reports/aloqa-calls-around-qa-2026-08-26-B.html` (стиль скопирован из отчёта сектора B
за это же число через `</style>`, как требует CLAUDE.md).

Четыре находки: **BUG-1 High backend**, **BUG-3 Medium frontend**, **BUG-4 Low frontend**,
**BUG-2 Low frontend** (в отчёте в этом порядке — по важности).

Перед публикацией:
- прогнан grep по отчёту на следы стенда (имена аккаунтов, `qa.*@aloqa.test`, id встреч/воркспейса,
  порты рига, имена тестовых звонков, хост стенда) — **совпадений ноль**;
- проверена вёрстка (баланс тегов, наличие всех трёх тем-блоков, `background:var(--ground)`);
- проза каждой находки уложена в бюджет 120–180 слов: 179 / 180 / 171 / 153.

**Проверка цитат на исходники.** Соседняя сессия сообщила, что клон `aloqa-frontend` стоит на
ветке `bugfix/ALK-3389-early-guest-landing` и отстаёт от задеплоенного `c4b5386b4a3a` на 33 коммита.
На мои находки это не влияет: **ни одна «Подтверждённая причина» не ссылается на исходники** —
все опираются на ответы API и замеры DOM живой сборки. Две ссылки на исходники в этом логе
(размер страницы истории и условие показа секций модерации) перепроверены на задеплоенном sha
и совпадают:

```
c4b5386b4a3a:packages/features/calls/model/hooks.ts:103      export const RECENTS_PAGE_SIZE = 20
c4b5386b4a3a:packages/features/calls/ui-web/CallSurface.tsx:1604  hasModerationSections={externalSession === null}
```

## Настройки встречи — влияние на участника (блок после публикации отчёта)

### Verified working — `Mute participants on entry`

Переключатель `meeting-settings-mute-on-join` меняет `mute_on_join` с `false` на `true`
(`GET /api/v1/meeting/<id>/settings`). Вошедший после этого участник действительно приходит
приглушённым: кнопка микрофона у него `aria-label="Unmute"`, `aria-pressed="true"`.

### Verified working — отключение чата в звонке объясняет себя

`meeting-settings-chat` → `chat_enabled: false`. У участника:

```
панель:    "Call chat | Saved to #<название> | No messages yet |
            Chat is disabled for this call | To | Everyone | Message everyone | Send"
testid:    in-call-chat-disabled   (виден)
textarea:  vis=true  disabled=true
Send:      disabled=true
```

Кнопка `Call chat` из тулбара не исчезает — и правильно, описание настройки прямо говорит,
что читать историю можно. Поле ввода и `Send` заблокированы, причина написана на панели.

### Дедуп — ALK-3453 воспроизводится на rc.5, с замером, и рядом видно, как надо

`meeting-settings-mic-mode-blocked_all` → `mic_mode: blocked_all`. У участника:

```
кнопка микрофона: aria-label="Unmute"  disabled=true
                  opacity: 0.4   cursor: not-allowed
                  title: "Toggle mute (⌘D)"        ← подсказка как у рабочей кнопки
пояснений на странице: []      (искал по всему документу: blocked / not allowed /
                                disabled by / host has / cannot use / turned off by)
слово "microphone" в тексте страницы: нет вовсе
```

Кнопка просто гаснет, ничего не объясняя — ровно то, что заведено в **ALK-3453**.
**Полезно для исправления:** нужный шаблон уже есть в этом же продукте и в этой же панели
настроек — отключение чата рисует явную строку `Chat is disabled for this call`. Микрофону,
камере и демонстрации экрана не хватает такой же.

### Verified working — понижение лимита участников ниже текущего числа (закрывает пробел утреннего прохода)

Утренний проход отметил, что сценарий «лимит ниже текущего числа участников» не проверялся
(нужен звонок с несколькими людьми). Проверил: в звонке 2 участника.

```
шаг 1  ввести 5, Save  → поле 5, "max_participants":5, тост "Meeting settings saved"
шаг 2  ввести 1, Save  → поле возвращается к 5, "max_participants":5
                         тост: "The limit cannot be lower than the number of people
                                already in the call."
поле перед сохранением: value="1"  checkValidity()=true  min="0"  max=""  (Save активна)
```

Отказ объяснён конкретной причиной, **прежнее значение восстанавливается**, ничего не теряется.
Это ровно сценарий **ALK-3371** («вместо причины ошибки — Could not save meeting settings.
Try again.»), статус TESTING — **подтверждаю, что на rc.5 починено**.

Осторожность, которая понадобилась: первый замер я делал на звонке, где лимит и так был `0`,
и увидел «поле сбросилось в 0» — что выглядело как потеря настройки. Отличить «сбросило в 0»
от «вернуло прежнее значение» можно только на звонке, где лимит был ненулевым. Второй прогон
это и показал: возвращается прежнее, а не ноль.

### Verified working — анонимный посетитель по внутренней ссылке на звонок

Частая ошибка: вместо гостевой ссылки пересылают адрес звонка из приложения. Незалогиненное окно
на `/w/<ws>/call/<id>`:

```
url:  /login?next=%2Fw%2F<ws>%2Fcall%2F<id>
body: "Sign in to Aloqa | Email | Password | Forgot password? | Sign in |
       Sign in with a magic link instead | No account yet? Sign up."
```

Редирект на вход сохраняет назначение в `next`, так что после входа человек попадёт в звонок.

### Verified working — пароль, добавленный к идущему звонку

`meeting-settings-password-toggle` + поле пароля → `"password_protected":true`,
тост `Meeting settings saved`.

- Участник, который **уже в звонке**, остаётся в нём (`inCall: true`) — не выбрасывает.
- Новый входящий получает барьер `call-password-input` — «This call is password-protected».

### BUG-5 [Medium] [frontend] Ведущий убрал пароль — стоящий у парольного барьера остаётся перед ним, и кнопка входа заблокирована

Обратная операция отработана хуже прямой. Человек стоит на парольном барьере, ведущий снимает
пароль — экран у стоящего не обновляется никогда.

Прогон 1: пароль снят в 16:55:32, поллер по всему документу на его окне 75 с — **ни одного
изменения** (`changes: 1`, только стартовый замер).

Прогон 2 (чистый, другой заход на барьер):

```
16:58:11  вошёл на барьер:   "This call is password-protected | Enter the call password to join."
                             поле пусто, кнопка "Join call" disabled=true
16:58:26  ведущий снял пароль → GET /api/v1/meeting/<id> → "password_protected":false
17:00:03  (1 мин 37 с спустя) экран тот же:
          "This call is password-protected | Enter the call password to join. |
           Join call | Back to workspace"
          поле пусто, "Join call" disabled=true, клик по нему ничего не делает
          других элементов управления, кроме "Back to workspace", нет
```

**Подтверждённая граница:** сервер уже отдаёт `password_protected: false` и пускает по
**любой** строке — в первом прогоне ввод `anything-at-all` немедленно завёл человека в звонок
(`inCall: true`). Значит барьер держится только устаревшим состоянием клиента.

**Пользовательский эффект:** пароля у звонка больше нет, вводить нечего, а кнопка входа
разблокируется только при непустом поле. Человек, не знающий, что пароль сняли, не догадается
набрать произвольный текст и решит, что войти нельзя. Обходной путь есть и он на экране —
`Back to workspace` и зайти заново.

**Асимметрия, которая делает это дефектом, а не задумкой:** соседний барьер того же звонка ведёт
себя правильно. Когда ведущий снимает **требование одобрения**, ожидающего впускает автоматически
за ~17 с (замерено выше). Пароль такого обновления не получает.

## Current state (обновлено 17:05)

Отчёт опубликован и **обновлён на том же URL** с пятой находкой:
https://claude.ai/code/artifact/5fc9fa61-e210-4f73-aa31-58ae1e0125e9

- **BUG-1 High backend** — ведущий вышел из звонка с одобрением входа: впустить стучащегося
  некому, ведущему нигде не сообщают (проверено: ни `/notifications`, ни `meetings/active`
  не содержат ничего об очереди).
- **BUG-3 Medium frontend** — строка участника навсегда `Ringing…` после недозвона.
- **BUG-5 Medium frontend** — сняли пароль, а стоящий у барьера остаётся перед ним, `Join call`
  заблокирована при пустом поле.
- **BUG-4 Low frontend** — журнал пишет «Meeting ended for everyone» у звонка, который закрылся сам.
- **BUG-2 Low frontend** — экран «invite link no longer valid» без единого элемента управления.

Все пять перепроверены на свежих страницах, у BUG-3 четыре независимых подтверждения.
Дедуп: прочитан весь список `list --open-bugs`, плюс точечный grep по зеркалу под каждую находку.

Дальше по плану: гостевая ссылка + пароль (перепроверка закрытой ALK-1890), звонок из канала
целиком, гость и лимит участников, ответ на приглашение к запланированной встрече.

### BUG-6 [Medium] [frontend] На гостевом экране поле пароля подписано «private meetings only», хотя звонок публичный и без пароля туда не пустят

Звонок создан как **public** с паролем (`calls-hub-access=public`, `calls-hub-entry=password`),
гостевая ссылка видна всем. Гостевой экран по ссылке `/join/<token>`:

```
"You are invited to “<название>” | Enter the name other participants will see. | Your name |
 Meeting password (private meetings only) | Join call"
```

Проверка API по этому же звонку: `"is_private":false`, `"password_protected":true`.
То есть встреча **не приватная**, а пароль обязателен.

Замер A/B на свежем анонимном заходе (`ctx.clearCookies()`):

```
поле имени пусто, пароль пуст   → "Join call" disabled=true
имя "Label Probe", пароль пуст   → "Join call" disabled=true      ← имя введено, кнопка не ожила
имя "Label Probe", пароль "x"    → "Join call" disabled=false
подпись поля во всех трёх замерах: "Meeting password (private meetings only)"
input.required = false
```

Дальше поведение корректное: неверный пароль → `Incorrect password. Try again.` прямо на экране,
верный (`GuestGate-5`) → гость входит на `/guest/meeting/<id>`.

**Эффект:** гость, поверивший скобке, оставит поле пустым и получит навсегда неактивную кнопку
`Join call` без единого слова о том, чего не хватает. Пароль и приватность — независимые оси
(в диалоге создания это два разных блока: `Meeting access` public/private и `Who can join`
password), так что скобка неверна не только в этом случае, а по сути.

**Дедуп:** в `list --open-bugs` ничего про эту подпись; grep по зеркалу
(`private meetings only|Meeting password`) даёт только закрытые тикеты про другие аспекты пароля
(ALK-1994, ALK-1999, ALK-2731, ALK-2832). Новая.

### Дедуп — ALK-1890 на rc.5 не воспроизводится

«Anonymous guest-link join bypasses call password (no guest password gate)», статус TESTING.
Гостевой барьер на месте и работает: без пароля кнопка входа не активируется, неверный пароль
отклоняется с текстом, верный пропускает. Обхода нет.

### Verified working — звонок из канала: старт, вход, сворачивание, страница завершённого

Точка входа в шапке канала — кнопки `Start call` и `Start or schedule call` (только `aria-label`,
без видимого текста).

```
старт из канала  → pre-join "READY TO JOIN? | #qa-general | ... | ALREADY IN ROOM"
                   URL: /w/<ws>/call/<id>?returnTo=%2Fw%2F<ws>%2Fc%2F<channel>
в звонке         → заголовок звонка = имя канала: "#qa-general | 0:28 | QA Alice (you)"
API              → {"id":"<id>","name":"","channel_id":"C4Q…GENERAL0001","participant_count":2}
                   имя пустое, заголовок берётся из канала

Minimize to PiP  → возвращает на /w/<ws>/c/<channel> (не в хаб) + draggable-pip / pip-mini-call
                   с обоими участниками — returnTo канала соблюдается
второй участник  → в канале появляется кнопка `Join call` (тоже только aria-label), ведёт
                   на тот же pre-join, вход срабатывает
страница звонка  → "#qa-general | group | Ended | ... | Hosted by ... | 2 participants |
                   Recording 0 | Chat 0 | Logs 13"
```

Весь путь из канала отрабатывает, включая возврат по `returnTo` на канал, а не на `/calls`.

### Наблюдения не моего сектора (передаю сектору C, в отчёт не беру)

На странице канала `#qa-general` в шапке одновременно:

```
"qa-general | No topic yet | Members | 6 | Pinned message | : (no message text) | View all (0) |
 Start this channel | Add teammates before starting the conversation. | Add users |
 YESTERDAY | QA Alice | Yesterday 10:43 | QA-B-1 plain hello E-RUN1 | edited | ..."
```

1. Блок закреплённого сообщения показывает пустой текст и `View all (0)` — то есть закреплённых
   нет, а блок всё равно отрисован.
2. Пустое состояние «Start this channel | Add teammates before starting the conversation»
   показано в канале, где 6 участников и есть переписка со вчерашнего дня.

Оба — чат/канал, сектор C.

### Стенд — закрыл окно carol

Новый лимит браузеров на сектор B — 3, у меня было 4. Закрыл `./stop.sh B carol` (порт 9234)
в 17:09: трёхсторонние сценарии уже пройдены, дальше нужны только alice, bob и анонимное
гостевое окно. Закрытие записано в `~/.cache/aloqa-callrig/rig-events.log`, это не падение.

### Зацепка, НЕ подтвердившаяся — «Start call» три раза подряд упал с «Something went wrong»

Пишу подробно, потому что перехваченная последовательность выглядит как дефект, а при проверке
им не оказалась — чтобы следующая сессия не завела это заново.

Что наблюдалось: диалог `Start a call` три раза подряд показал `Something went wrong. Please try
again.` (`data-testid="calls-start-submit-error"`), звонок не открывался. Перехват сети на клике:

```
200 POST  /api/v1/meeting                      {"workspace_id":…,"requires_approval":true,…}
200 PATCH /api/v1/meeting/<id>/settings        {"who_can_see_guest_link":"everyone"}
200 POST  /api/v1/meeting/<id>/end             ← клиент сам завершил только что созданный звонок
UI: "Something went wrong. Please try again."
```

Все три запроса `200`, а встреча получила `ended_at` в ту же секунду, что и `started_at`.

Что оказалось на самом деле:

1. Первый отказ случился сразу после звонка, который «завершился за 0 с» — у Alice на экране
   висел остаточный оверлей итогов от предыдущего прогона (утренний проход сектора B описывал
   ровно такой же артефакт стенда).
2. Следующие отказы дали уже **конкретное** сообщение, и перехват показал причину:
   `409 REALTIME_ALREADY_IN_ANOTHER_MEETING` → UI: `Leave your current meeting before joining
   another one.` — то есть Alice числилась в звонке, созданном мной через API.
3. После `POST /api/v1/meeting/<id>/end` и `GET /api/v1/meetings/current` → `{}`
   создание заработало: **4 попытки подряд из UI — 4 успеха** (чередуя `who_can_see_guest_link`
   `everyone`/`host_only`), 22 запроса за клик, ни одного `>=400`.

**Вывод: продуктового дефекта здесь нет**, это состояние клиента после моего же вмешательства
через API. Что осталось незакрытым и что стоит проверить тому, кто возьмётся за создание звонка:
сообщение `Something went wrong. Please try again.` появилось при том, что **все** запросы вернули
`200` — значит откат (create → patch → end) вызывается чем-то вне `/api/` (вероятно, соединение
с медиасервером), и в этом случае пользователю показывают самый общий текст. Воспроизвести это
намеренно я не смог.

### Методическая заметка — `changed:false` бесполезен без доказанного стартового значения

Первый прогон нового хелпера `waitForChange` по строке участника вернул то, что выглядит как
идеальное подтверждение находки:

```
changed: False   stableForMs: 300477   samples: 300
note: "unchanged across 300 samples over 300s"
value: "ROW-NOT-FOUND"        ← вот это
```

Пять минут ровного `changed:false` — и всё это время предикат не находил строку вообще: мой
снипет не сумел открыть диалог `Add to call` перед началом наблюдения. То есть измерено было
отсутствие элемента, а не «состояние не меняется».

Строка при этом действительно висела: проверка тем же путём, что открывает диалог штатно,
показала в 17:23:40 (почти 6 минут после приглашения в 17:17:46)

```
QA Bob   disabled=False  row='QB QA Bob'
QA Dave  disabled=True   row='QD QA Dave Ringing…'
```

**Правило:** прежде чем считать `changed:false` измерением, надо доказать, что стартовое значение
— это то состояние, которое ты собрался наблюдать. Во втором прогоне снипет сначала проверяет,
что строка на экране, и **прерывается**, если её нет, а начальное значение возвращает в ответе
(`startedFrom`). Ложное «ничего не менялось» опаснее ложного «менялось»: оно выглядит ровно как
та находка, которую ищешь.

### BUG-3 — сильнейшее измерение: 299 замеров подряд, состояние не изменилось ни разу

Прогон с гарантированным стартовым состоянием (снипет сначала доказывает, что строка на экране,
и прерывается, если нет). Приглашение ушло в **17:17:46** аккаунту, под которым **никто не залогинен**,
то есть отвечать заведомо некому. Наблюдение 17:23:5x → 17:29:00:

```
startedFrom: "QD QA Dave Ringing… | disabled=true"
changed:     false
stableForMs: 300618      samples: 299
value:       "QD QA Dave Ringing… | disabled=true"
note:        "unchanged across 299 samples over 301s"
```

Итого строка провисела **более 11 минут** (17:17:46 → 17:29:00), из них последние 5 минут —
299 последовательных замеров без единого изменения, страница всё это время не перезагружалась.
Соседняя строка в том же диалоге при этом жила: `QA Bob disabled=False row='QB QA Bob'`.

Это измерение заменяет прежние ручные проверки на 2 и 5 минутах — оно строже и одним куском.

### Поправка к самопроверке отчёта — счётчик слов считал и блок измерений

Мой скрипт подсчёта прозы брал всё внутри секции «Фактический результат», включая `<pre>`.
CLAUDE.md прямо говорит, что блок измерений в бюджет 120–180 слов **не входит**. После исключения
`<pre>` реальные цифры по шести находкам:

```
1. 152  (Проблема 82, Фактический 34, Ожидаемый 36)   лобби без ведущего
2. 131  (76 / 36 / 19)                                строка застряла на Ringing…
3. 114  (68 / 24 / 22)                                сняли пароль, барьер остался
4. 129  (74 / 25 / 30)                                «private meetings only» на публичном звонке
5. 125  (73 / 26 / 26)                                журнал «ended for everyone»
6. 131  (81 / 19 / 31)                                тупик недействительной ссылки
```

Все в бюджете. Из-за завышенного счётчика я дважды подрезал текст там, где этого не требовалось —
вреда нет, формулировки не пострадали, но обратно раздувать не стал.

### Verified working — гость и лимит участников

Звонок с гостевой ссылкой, `PARTICIPANT LIMIT = 1`, внутри только ведущий. Гость по ссылке:

```
экран ввода имени → Join call →
"The call is full | This call has reached its participant limit. Try again in a moment. | Try again"
interactiveCount: 1   interactive: ['Try again']
```

У гостя, в отличие от участника workspace, нет `Back to workspace` — и правильно, возвращаться
ему некуда. После снятия лимита (`max_participants: 0`) кнопка `Try again` завела гостя в звонок
(`/guest/meeting/<id>`, плитка `Limit Visitor (you) | GUEST`).

### Verified working — бан гостя, и почему у него нет разбана

Меню участника-гостя у ведущего **не содержит** `Make co-host` и `Admin permissions…`
(только `Pin for me`, `Pin … for everyone`, `Stop watching`, `Device permissions…`,
`Remove from call`, `Ban`, `Mute …`, `Ask … to turn on camera`). То есть **ALK-2621**
(In Progress) и **ALK-3326** (Backlog) на rc.5 уже не воспроизводятся.

Диалог бана для гостя написан иначе, чем для участника:

```
"Ban from this meeting? | <имя> will be removed and this guest link will no longer grant
 access to the meeting. | Cancel | Ban"
```

После бана панель ведущего (панель открыта, проверено): `Participants | 1 in call | QA Alice
(you) | HOST` — **секции `BLOCKED` нет**, кнопки `Unban` нет. Для забаненного участника
workspace она была. Дефектом не считаю: у гостя нет учётной записи, которую можно разбанить,
и диалог прямо говорит, что отзывается сама ссылка, а вернуть человека можно новой ссылкой.

### Второй экземпляр той же проблемы, что BUG-2 — забаненный гость тоже в тупике

```
GUEST body: "You were removed from the meeting | The host removed you from this meeting.
             Use a new invite link if you were invited again."
interactiveCount: 0     interactive: []
```

Текст честный и объясняет, что делать, но кнопок снова ноль. Это уже **третий** терминальный
гостевой экран без единого элемента управления (недействительная ссылка — BUG-2, ожидание
одобрения — ALK-3529, удаление из встречи — этот). Отдельной находкой не выношу: чинить надо
шаблон, а не экран, поэтому добавляю проверку в BUG-2.

### Хендофф сектора C — «1:1 звонок остаётся активным ~4 минуты после выхода всех и блокирует навигацию»: **у меня не воспроизвёлся**

Сектор C передал через координатора: 1:1 звонок после выхода обоих продолжал возвращаться в
`GET /api/v1/meetings/current` как `active`, любой `page.goto` на канал отбрасывал обратно на
`/call/<id>`, закрылся сам через 4 мин 04 с. Их таймлайн: старт 10:47:29.7Z, приём 10:47:32.6Z,
**alice вышла 10:47:39.3Z, carol вышла 10:47:46.2Z** — то есть у них второй участник оставался
в звонке ещё 7 секунд после выхода первого.

Два прогона на моём стенде, звонок создан из `Directories` → строка человека → `Call`:

```
прогон 1 — первым выходит ЗВОНЯЩИЙ
17:35:44  вызов        17:35:5x  принят
17:36:04  Alice: Leave call → Leave
          Bob сразу же: "Call ended | · Call with … · 23s | PARTICIPANTS …"  (inCall true, tiles 0)

прогон 2 — первым выходит ВЫЗЫВАЕМЫЙ
17:37:00  вызов        17:37:0x  принят
17:37:14  Bob: Leave call → Leave
          Alice сразу же: "Call ended | · Call with … · 17s | …"

обе стороны, сразу после (17:36:11 и 17:37:21):
  GET /api/v1/meetings/current → 200 {}         (пусто у обоих)
  page.goto на /w/<ws>/c/<channel> → урл остался /c/<channel>,  bouncedBack: false
```

**Ключевое расхождение:** у меня выход **первого** участника немедленно завершает 1:1 для обоих —
второй получает экран итогов. У сектора C второй участник пережил выход первого на 7 секунд,
то есть их звонок на выход повёл себя не как 1:1. Значит либо он был создан не через прямой
вызов из Directories, либо кто-то из двоих вышел не кнопкой `Leave call` (закрытие вкладки,
уход по ссылке), либо это состояние стенда.

Пишу это как **не воспроизведено на моём пути**, а не как «дефекта нет»: их измерения выглядят
аккуратно, и разница в поведении на выход первого участника — конкретная зацепка, куда смотреть.
Отчётной находки отсюда не делаю.

### Продолжение хендоффа C — путь входа не объясняет: и DM-звонок на полосе B выходит корректно

Координатор поднял БД и уточнил: у сектора C канал был **DM** (`type=dm`), то есть настоящий 1:1,
а не двухсторонний групповой, как я предположил. При этом `left_at` у обоих участников оказался
одинаковым и на 4 минуты позже их кликов `Leave` — уход не зарегистрировался, обоих пометили
вышедшими сметающим проходом, комната закрылась через 30 с (`departure_timeout: 30`).

Мой кандидат №1 снят. Проверил кандидат «дело в точке входа» — **тоже не подтвердился**.

Звонок начат **из самой переписки DM** (`/w/<ws>/d/<dmId>`, кнопка `Start call` в шапке):

```
17:41:2x  вызов из DM, экран звонящего "QA Bob | Ringing… | Leave call", URL остаётся /d/<dmId>
17:41:30  собеседник принял (incoming-call-banner-accept), обе стороны в звонке
17:41:48  Alice: Leave call → Leave
          Bob немедленно: "Call ended | · Call with … · 25s | … Joined 05:41 PM · left 05:41 PM"
обе стороны сразу после:
          GET /api/v1/meetings/current → {}  (пусто)
          page.goto на /c/<channel> → остался на канале, bouncedBack: false
```

Итого на полосе B корректно выходят **три** пути: 1:1 из `Directories`, 1:1 из переписки **DM**,
и групповой звонок на двоих (там первый выход не завершает звонок — нормальная семантика
группового; при выходе последнего `meetings/current` пустеет **мгновенно**, замерено
`clearedAtSecAfterLeave: 0`).

Значит различие не в том, откуда начат звонок. Не проверено: полоса/фикстуры, конкретный
DM-канал, уход не кнопкой (закрытие вкладки). Отчётной находки у меня отсюда нет.

### Verified working — видимость гостевой ссылки и переключатель реакций доходят до участника вживую

Звонок с `who_can_see_guest_link: host_only`, участник — не ведущий:

```
тулбар участника: [screen-share, live-reaction, people-toggle, chat-toggle,
                   breakout-rooms, leave]           ← кнопки add-to-call НЕТ
```

Ведущий переключает на `everyone` (`who_can_see_guest_link: everyone`), **без перезагрузки**:

```
тулбар участника: [screen-share, live-reaction, people-toggle, chat-toggle,
                   add-to-call, breakout-rooms, leave]    ← появилась
диалог у участника: ссылка видна, подпись
                   "Share this link to invite people. Only the host can create or replace it."
```

Ведущий выключает реакции (`reactions_enabled: false`), тоже вживую:

```
тулбар участника: [screen-share, people-toggle, chat-toggle, add-to-call,
                   breakout-rooms, leave]           ← live-reaction ИСЧЕЗЛА
```

Обе настройки доезжают до участника сами. Заодно видно **три разных способа** показать,
что возможность отключена:

```
чат       — кнопка остаётся, поле и Send заблокированы, на панели строка "Chat is disabled for this call"
реакции   — кнопка исчезает из тулбара совсем
микрофон  — кнопка остаётся, disabled, opacity 0.4, cursor not-allowed, и НИ СЛОВА почему (ALK-3453)
```

Для ALK-3453 это готовый аргумент: в одном и том же тулбаре уже есть два рабочих шаблона.

### Наблюдение — ссылка на несуществующий звонок сообщает, что звонок «завершился»

```
/w/<ws>/call/V4OWZZZZZZZZZZZ  (такого id нет)  → "Call has ended | This call is no longer
                                                  available. | Back to workspace"
/w/<ws>/call/not-an-id        (не тот формат)  → тот же экран
элементов управления: 1 — 'Back to workspace'
```

Подзаголовок точный, а заголовок утверждает то, чего не было: звонок не завершался, его не
существовало. Человек с опечаткой в ссылке будет ждать нового приглашения вместо того, чтобы
проверить ссылку. Кнопка выхода есть, так что это не тупик. Родственно BUG-4 (журнал сообщает
о действии, которого не было). В отчёт не выношу — край, и подзаголовок спасает.

### Замер для хендоффа C (кандидат 3) — уход без кнопки: собеседник узнаёт через 45 с, а не сразу

1:1 звонок, оба внутри. Вызываемый **закрывает вкладку** (никакого `Leave call`).
Наблюдение на стороне звонящего с шагом 2 с:

```
17:48:36  вкладка закрыта
t=0.1 … t=44   meetings/current не пуст, inCall: true, экрана итогов нет
t=45           экран итогов появился, meetings/current → {}
clearedAtSec: 45   endedOverlayAtSec: 45   всего 23 замера
```

Для сравнения, **явный выход кнопкой** в том же 1:1 (два прогона, 17:36:04 и 17:41:48):
собеседник получает `Call ended` **немедленно**, `meetings/current` пуст сразу.

Итого: `Leave call` → 0 с, закрытая вкладка → ~45 с. То есть когда явного ухода не приходит,
человека списывает серверная зачистка, и это ощутимо не мгновенно. У сектора C задержка была
**4 минуты** и `left_at` у обоих одинаковый — то есть их случай не объясняется обычным таймером
(45 с), но семейство механизма то же: ушедшего помечает зачистка, а не его собственный уход.

Побочно это уточняет мой более ранний замер «обрыв связи участника»: там я проверял состояние
не сразу, поэтому увидел чистое исчезновение плитки. На самом деле выпавший участник остаётся
на экране у остальных **до ~45 с**. Отдельной находкой не выношу — отличить обрыв от короткой
потери сети мгновенно нельзя, и значение таймаута это продуктовое решение, а не дефект.

### Перепроверка ALK-3530 на rc.5 — воспроизводится, плюс уточнение по причине

Звонок создан с паролем `VisiblePw-3` (`"password_protected": true`). Ведущий открывает
`Meeting settings`:

```
поле пароля:  type="password"  value=""  placeholder="Enter a password"
жмём "Show password" → type становится "text",  value по-прежнné ""
GET /api/v1/meeting/<id> → "password_protected":true, поля "password" в ответе НЕТ вовсе
```

Дефект воспроизводится дословно. **Уточнение, которого нет в тикете:** пароля нет и в ответе
API — клиенту нечего показывать. То есть «Show password» обещает раскрыть то, чего у клиента
никогда не было. Это не обязательно означает, что чинить надо на бэкенде: не возвращать пароль
в ответе — нормальная практика, и правильным исправлением может быть убрать саму кнопку/поле
либо сделать отдельную ручку раскрытия. Но текущая метка `[FE-WEB]` без этого контекста
уводит разработчика к «почему поле не заполняется», а заполнять его нечем.

### Перепроверка ALK-3531 на rc.5 — воспроизводится

Звонок с `Wait for admission`. Сделаны **один отказ и один допуск** (`Deny QA Bob`, затем
повторный стук и `Admit QA Bob`), после чего звонок завершён. Журнал:

```
типы событий в сыром логе (GET /api/v1/meeting/<id>/events, всего 10):
  meeting.started, participant.joined, participant.left,
  track.published, track.unpublished, meeting.ended

вкладка Logs:
  05:52:45 PM  Meeting ended for everyone
  05:52:45 PM  QA Bob left the call
  05:52:45 PM  QA Alice left the call
  05:52:30 PM  Media activity | By QA Bob
  05:52:29 PM  QA Bob joined the call
  05:51:43 PM  QA Alice joined the call
  05:51:42 PM  Meeting started
```

Ни запроса на вход, ни отказа, ни допуска — **событий такого рода нет вообще**, ни обезличенных,
ни каких-либо. Подтверждает уточнённую формулировку тикета.

### Итог перепроверки утреннего отчёта сектора B на rc.5

Все три находки утреннего прохода (сборка rc.3) на **rc.5** воспроизводятся:

- **ALK-3529** — экран ожидания у гостя, `interactiveCount: 0` (замерено по всей странице).
- **ALK-3530** — поле пароля пусто, `Show password` показывает пустоту; вдобавок пароля нет
  и в ответе API.
- **ALK-3531** — допуск/отказ в журнале отсутствуют как класс событий.

### Проверка BUG-1 против починки фикстур `notification_db`

Координатор сообщил: в `notification_db` своя реплика членства в каналах, и сид её не заполнял —
поэтому уведомления **о сообщениях в каналах** на фикстурах не работали вовсе. Проверил, не
подрывает ли это мою BUG-1 (ведущему не приходит уведомление о стуке в лобби).

Не подрывает, и это видно прямо в моих же замерах: в том же самом ответе
`GET /api/v1/notifications` у того же аккаунта в том же workspace **лежат другие уведомления**
и они доставлены:

```
{"notifications":[
  {"title_key":"NOTIF_TITLE_MEETING_REMINDER","title":"Meeting starting soon",
   "category":"calendar","event_type":"meeting_reminder_10m", …},  … ],"total":2,"unread_count":2}
```

а у второго аккаунта в этом же прогоне приходило и call-уведомление:

```
{"title_key":"NOTIF_TITLE_CALL_INCOMING_WORKSPACE","title":"Call in workspace",
 "category":"call","event_type":"incoming_call","actor_name":"<имя>", …}
```

То есть канал доставки уведомлений для этих аккаунтов живой, и пустота по стуку — это отсутствие
самого события, а не сломанная реплика членства. В отчёте эта мысль уже стоит в «Подтверждённой
причине» («механизм уведомлений рабочий: напоминания о встречах в том же ответе приходят»),
менять формулировку не требуется.

### Оценка звонка — собирается, считается на сервере и нигде не показывается (расширение находки 08-25-A BUG-1, в мой отчёт не выношу)

Звонок на двоих. Ведущий поставил **4**, участник — **2**, обоим показано `Rating saved`.

```
API у ведущего (владельца):   "rating":{"average":3,"count":2,"my_rating":4,"owner_only":false}
API у участника:              "rating":{"my_rating":2,"owner_only":true}
```

Арифметика верная: (4+2)/2 = 3, count 2. Сервер считает агрегат и **отдаёт его владельцу**.

Страница завершённого звонка у владельца, поиск по всему тексту и по testid:

```
ratingTestids: []          ← ни одного элемента с rating/star в testid
совпадения по /rat(e|ing)/: ["QA rating flow"]   ← это название самого звонка, больше ничего
testids страницы: call-detail-outcome, call-detail-metadata-row, call-detail-host-row,
                  call-detail-participant-row, call-detail-tab-count,
                  call-detail-scroll-viewport, call-detail-content-column,
                  call-detail-recording-content
```

То есть после закрытия итогов звонка оценку не видит **никто, включая владельца**, которому
сервер её специально агрегирует. Пользователей просят оценивать каждый звонок, и результат
не появляется ни на одной поверхности.

**Почему не выношу в свой отчёт:** это та же проблема, что уже опубликована как 08-25-A BUG-1
(«оценку отправляет первый клик, и после закрытия итогов её нельзя ни увидеть, ни исправить»),
тикета в ALK по ней нет (проверено: в ALK-3405…3413 её нет, в открытых багах по слову
rating/оценка — только ALK-3051 про другое; ALK-2051 про неотправку закрыт). Дублировать чужую
опубликованную находку в своём отчёте не стоит — вместо этого передаю координатору измерение
про агрегат, которого в исходной находке не было.

### Дедуп-бонус — ALK-3405 и ALK-3407 на rc.5 починены

Оба закрыты (TESTING) и оба про то, что смена настройки не доходит до тех, кто уже в звонке:
реакции (ALK-3405) и in-call chat (ALK-3407). Мои сегодняшние замеры показывают обратное —
**доходит вживую, без перезагрузки**: выключение реакций убирает кнопку из тулбара участника,
выключение чата блокирует поле и рисует строку `Chat is disabled for this call`. Подтверждаю
как исправленные.

## Current state (обновлено 17:58)

Отчёт опубликован и трижды обновлён на том же URL — **6 находок**:
https://claude.ai/code/artifact/5fc9fa61-e210-4f73-aa31-58ae1e0125e9
BUG-1 High backend · BUG-3 / BUG-5 / BUG-6 Medium frontend · BUG-4 / BUG-2 Low frontend.

После публикации продолжено тестирование; новых отчётных находок не добавилось, зато закрыты
пробелы и проверены чужие тикеты. Покрытие сектора B на сейчас:

- **вход**: прямой звонок, из канала, из DM, запуск запланированной встречи, вход по внутренней
  ссылке анонимом, вход по несуществующему id — всё проверено
- **лобби/одобрение/пароль**: одобрение, отказ, снятие требования одобрения на ходу, пароль
  (верный/неверный/добавленный на ходу/снятый на ходу), гостевой парольный барьер
- **вызовы**: входящий баннер (1:1) и тост (групповое приглашение), приём, отклонение, отмена,
  недозвон, звонок во время звонка и переключение
- **завершение**: выход последнего, takeover, обрыв связи (0 с кнопкой / ~45 с без неё),
  бан и разбан, лимит участников
- **хаб/история/страница звонка**: пагинация, вкладки, два живых звонка, Chat/Logs/Recording,
  доступ к записи, участники, рейтинг
- **настройки встречи**: mute on join, chat, reactions, mic mode, лимит, пароль, видимость
  гостевой ссылки — все доезжают до участника вживую, кроме случаев из ALK-3453
- **гости**: ссылка, замена ссылки, вход, отказ, лимит, бан, видимость ссылки

Проверены чужие тикеты: ALK-3529/3530/3531 воспроизводятся на rc.5; ALK-2988, ALK-3097, ALK-3177,
ALK-1890, ALK-2621, ALK-3326, ALK-3371, ALK-3405, ALK-3407 — **не воспроизводятся** (похоже
починены); ALK-3475, ALK-3145, ALK-3119, ALK-3250, ALK-3113, ALK-2798, ALK-3453 — воспроизводятся.

Осталось непокрытым: баннер восстановления связи (`CallConnectionRecoveryBanner`) — вызвать
его не удалось ни offline-эмуляцией, ни закрытием вкладки; пробую троттлинг сети.

### Не удалось проверить — баннер восстановления связи (`CallConnectionRecoveryBanner`)

Три попытки вызвать его на этом стенде, все безрезультатны:

1. `Network.emulateNetworkConditions {offline:true}` на 35 с — ни у выпадающего, ни у собеседника
   ничего не изменилось за 110 с наблюдения (ровно ограничение из CLAUDE.md: offline режет HTTP
   страницы, но не WebRTC).
2. Закрытие вкладки — это не потеря связи, а исчезновение участника: собеседник получает итоги
   звонка через ~45 с, никакого баннера восстановления.
3. Жёсткий троттлинг (`latency: 3000 мс`, `1 КБ/с` вверх и вниз) на 50 с:

```
t=31.7  индикатор сети: "Excellent · 6ms"    inCall: true
t=33.2  индикатор сети: "Excellent · 57ms"   inCall: true
testids: только call-network-indicator / call-network-bar / participant-network-indicator
```

Троттлинг CDP до медиапотока тоже не доходит — индикатор показывает «Excellent» всё время.

**Записываю как непроверенное имеющимся инструментарием**, а не как «работает» или «сломано».
Чтобы это проверить, нужна возможность рвать транспорт WebRTC (правила на уровне ОС/файрвола
или отключение сетевого интерфейса), которой у рига нет.

### Проверено — лимит участников срабатывает раньше очереди на одобрение

Звонок `Wait for admission` + `PARTICIPANT LIMIT = 2`, внутри ведущий и участник (2 из 2).
Гость по ссылке вводит имя и жмёт `Ask to join`:

```
"The call is full | This call has reached its participant limit. Try again in a moment. | Try again"
interactiveCount: 1
```

В очередь он **не попадает вовсе** — у ведущего секции `WAITING` не появляется. То есть
впустить кого-то сверх лимита через одобрение нельзя: порядок проверок правильный,
сначала лимит, потом очередь.

### Проверено — замена гостевой ссылки не отзывает уже поданные заявки на вход

Лимит снят, гость по `Try again` дошёл до очереди: у ведущего `WAITING (1) | Limit Knocker(Guest)
| Admit | Deny`. Ведущий нажимает `Create new link` (18:03:37) — старая ссылка после этого
недействительна, это проверено отдельно.

```
гость сразу после замены:  "Waiting for approval | A host must approve your request…"
                           interactiveCount: 0   (тот же экран, ALK-3529)
ведущий:                   WAITING (1) | Limit Knocker(Guest) | Admit | Deny   ← заявка на месте
после Admit:               гость в звонке — "Limit Knocker (you) | GUEST | QA Alice | QA Bob"
```

**Дефектом не считаю:** войти человек может только по явному, поимённому решению ведущего,
и рядом есть `Deny`. Но ожидание «заменил ссылку — отрезал доступ» здесь не выполняется
полностью: заявки, поданные по старой ссылке, продолжают жить в очереди. Фиксирую как
поведение, о котором стоит знать, а не как ошибку.

### Самопроверка опубликованного отчёта — две собственные несостыковки, обе исправлены

Перечитал отчёт целиком глазами разработчика и нашёл два места, где текст расходится
с собственным блоком измерений.

1. **BUG-1.** Проза говорит «за все 150 секунд не появилось ничего», а блок под ней показывает
   ответ с `"total":2,"unread_count":2`. Читатель справедливо спросит: так появилось же два.
   Это два **календарных напоминания**, лежавшие там до начала наблюдения и не связанные со
   стуком, — но рядом с «не появилось ничего» это выглядит как противоречие. Блок дополнен
   явной пометкой, что эти две записи были там до начала и что ни состав, ни счётчик за
   150 с не менялись.

2. **BUG-3.** Проза говорила «в замерах до пяти минут», а блок — «более 11 минут». Пять минут —
   это окно непрерывной выборки (299 замеров), одиннадцать — полное время в состоянии.
   Проза приведена к измерению.

Обе правки опубликованы на том же URL. Ни одна не меняет сути находок — но ровно такие
расхождения соседняя сессия ловила у утреннего прохода, и они дороже, чем кажутся: если
блок измерений противоречит прозе, читатель перестаёт верить обоим.

### BUG-2 переписана и усилена — нашёлся более частый и более показательный случай

Проверял отдельный сценарий: гость открывает присланную ссылку **после того, как звонок
завершился**. Оказалось, это тот же пустой экран, но с неверной причиной, и сравнение с
участником рабочего пространства делает дефект гораздо нагляднее.

Один и тот же завершённый звонок, две стороны:

```
ГОСТЬ по ссылке-приглашению
  bodyText:          "Join as a guest | This invite link is no longer valid."
  interactiveCount:  0     interactive: []     links: []

УЧАСТНИК рабочего пространства, тот же звонок
  bodyText:          "Call has ended | This call has already ended.
                      You can start a new one from the workspace home. | Back to workspace"
  interactiveCount:  19
```

То есть в **одинаковой** ситуации участник получает верную причину, совет и рабочую кнопку,
а гость — неверную причину («дело в ссылке», хотя дело в том, что встреча прошла) и ноль
кнопок. Гость, поверивший тексту, попросит новую ссылку и получит ещё одну на тот же
завершённый звонок.

Находка переписана вокруг этого случая (он куда более частый, чем замена ссылки ведущим),
**важность поднята Low → Medium**: неверный диагноз плюс тупик, и страдает именно внешний
участник, которому труднее всех разобраться. Прежний случай (замена ссылки) остался в
измерениях третьим блоком и в «Проверке».

Итого в отчёте: **1 High / 4 Medium / 1 Low**, 1 backend / 5 frontend.

### Вне моей области — гостевая ссылка на запланированную встречу

Эндпоинт есть и работает: `POST /api/v1/calendar/meetings/<sid>/guest-link` → `200
{"token":"<64 hex>"}` (на `GET` отвечает `405 COMMON_METHOD_NOT_ALLOWED`). Но **пути к нему
из интерфейса я не нашёл**: на карточке запланированной встречи в хабе у ведущего только
`Start call`, а на странице календаря среди 198 интерактивных элементов ничего про ссылку
или приглашение гостя нет (единственное совпадение по слову «link» — название моей же
тестовой встречи).

По правилу области из CLAUDE.md поверхность без UI — не моя, поэтому дальше не проверял.

**Наблюдение сектору E, непроверенное:** клик по чипу встречи в календаре
(`QA sched guest link 18:20-18:50 Scheduled by You`) не открыл ни диалога, ни панели —
после клика на странице по-прежнему сетка календаря. Я **не доказал, что клик долетел**
(у чипа нет собственного состояния, по которому это видно), поэтому подаю как зацепку,
а не как находку: возможно, чип открывается иначе.

### BUG-7 [Medium] [frontend] Групповой звонок, на который тебя позвали и ты не ответил, попадает в твою историю как обычный посещённый — с длительностью всего звонка

Найдено при проверке пустого состояния хаба у аккаунта без звонков.

**Экземпляр 1** — приглашённый вообще не был в сети (никто не был залогинен под этим аккаунтом
в момент вызова, 17:17:46; вызов истёк сам):

```
история приглашённого:  "QR QA ring watch  Incoming · Ended · Aug 26, 05:17 PM · 12m"
```

**Экземпляр 2** — приглашённый **в сети**, входящий получил, не ответил, вызов истёк (18:12:55):

```
история приглашённого:  "QU QA unanswered history  Incoming · Ended · Aug 26, 06:12 PM · 2m"
```

Оба раза строка неотличима от звонка, в котором человек участвовал: то же `Incoming · Ended`,
и длительность — **всего звонка**, а не его участия (которого не было).

**Приложение при этом знает правду.** Страница того же завершённого звонка у него же:

```
экземпляр 1: "QA ring watch | group | Ended | · 12:49 | Hosted by QA Alice | 1 participants"
             View all → "QA Alice | Joined 05:17 PM · left 05:30 PM | 12:49 in call"   ← только хост
экземпляр 2: "QA unanswered history | group | Ended | · 2:02 | 1 participants"
             View all → "QA Alice | Joined 06:12 PM · left 06:14 PM | 2:02 in call"    ← только хост
```

**Список действительно персональный, а не «все звонки воркспейса»:** участник, которого в этот
звонок не звали и который в нём не был, в своей истории его **не видит** (проверено: 20 строк
истории, `QA ring watch` среди них нет).

**И статус для этого случая в продукте есть** — но только у личных звонков: неотвеченный 1-to-1
у звонящего пишется как `Outbound · No answer · 0m`. У группового приглашения такого статуса нет.

**Дедуп:** в открытых багах ничего про это. Ближайшие — ALK-3176 / ALK-3177 / ALK-3178 / ALK-3391 —
все про **личные** (direct) звонки: пропущенный direct как «New direct message», отменённый direct
без времени, пропущенные direct в фильтре 1-to-1, «Missed call» звонящему. Ни один не про то,
что неотвеченное групповое приглашение выглядит как посещённый звонок.

Мелочь рядом: на странице звонка написано `1 participants` (единица с множественным числом),
как и `Invited 1 people` в тосте. В отчёт не выношу.

### BUG-7 усилена — у группового приглашения не различается ни один исход

Проверил соседний случай: приглашённый **отклонил** приглашение (нажал `Decline` в тосте
через 12 с после вызова), звонок затем завершён.

```
история приглашённого:
  'QD QA declined history   Incoming · Ended · Aug 26, 06:16 PM · 0m'   ← отклонил
  'QU QA unanswered history Incoming · Ended · Aug 26, 06:12 PM · 2m'   ← не ответил
  'QR QA ring watch         Incoming · Ended · Aug 26, 05:17 PM · 12m'  ← не был в сети
```

Все три подписаны одинаково — `Incoming · Ended` — и так же выглядит звонок, в котором человек
действительно участвовал. То есть **для группового приглашения исход не различается вообще**:
пришёл, отклонил, не ответил — одна и та же строка.

Для сравнения, у личных звонков исходы различаются: в истории встречались
`Outbound · Canceled`, `Incoming · Canceled`, `Outbound · No answer`, `Incoming · Declined`,
`Outbound/Incoming · Ended`.

Находка в отчёте переформулирована под это: дело не только в недозвоне.

### Дедуп — ALK-3372 (длинное название звонка) на rc.5 **починен**, поведение изменилось

Тикет (статус TESTING) описывал: «при нажатии Start call окно просто закрывается: звонок
не создаётся, ошибку не показывают». На rc.5 это уже не так. Вставил название в 360 символов:

```
диалог после клика Start call:  остался открыт
сетевых запросов на клик:       0   (клиент не отправляет, а не сервер отклоняет)
поле названия:                  maxLength = -1 (ограничения на ввод по-прежнему нет)
                                aria-invalid = "true"
                                aria-describedby = "calls-hub-call-name-error"
сообщение под меткой поля:      "Enter 128 characters or fewer."
фокус:                          на самом поле названия
```

Оба требования тикета выполнены: окно не закрывается, ошибка показана и стоит прямо у поля.

Осталась мелочь: кнопка `Start call` при этом **не заблокирована** (`disabled: false`,
`opacity: 1`, `cursor: pointer`), и клик по ней не делает ровно ничего — состояние диалога
до и после клика побайтово одинаковое. Но поле помечено невалидным, сообщение рядом и фокус
уже там, так что без информации человек не остаётся. Отдельной находкой не выношу.

### Verified working — спецсимволы и разные алфавиты в названии звонка

Название: `Звонок «тест» 🎉 <b>&amp;</b> "кавычки" \ / | 日本語`

```
в звонке:        Звонок «тест» 🎉 <b>&amp;</b> "кавычки" \ / | 日本語
API:             "name":"Звонок «тест» 🎉 <b>&amp;</b> \"кавычки\" \\ / | 日本語"
страница звонка: Звонок «тест» 🎉 <b>&amp;</b> "кавычки" \ / | 日本語
```

Везде одинаково и буквально: `<b>` выводится текстом, а не превращается в разметку,
кавычки и обратные слэши экранированы в JSON корректно, эмодзи и японский на месте.
Инъекции нет, потерь нет.

### Verified working — второй звонок в том же канале не создаётся

В канале идёт звонок (ведущий внутри). Второй участник открывает тот же канал:

```
шапка канала: [aria-label "Start call", aria-label "Join call"]   ← обе кнопки
жмёт "Start call" → pre-join "READY TO JOIN? | #qa-general | ... | ALREADY IN ROOM"
после входа:  тот же звонок — "#qa-general | 0:57 | QA Alice | QA Bob (you)"
GET /workspace/<ws>/meetings/active → [{"id":"V4OW…ENV","ch":"C4Q…GENERAL0001","n":2}]
```

Второй звонок **не создаётся**: id тот же, активная встреча одна, счётчик участников 2.
Поведение правильное — у канала один звонок.

Наблюдение (в отчёт не выношу): в шапке при этом одновременно висят `Start call` и `Join call`,
и `Start call` ничего не начинает, а присоединяет к идущему. Две кнопки с одним исходом, у одной
подпись не о том. Семья ALK-3145 («Join вместо Return to call»), эффект тот же — подпись,
а не поведение.

### Verified working — пагинация истории на четырёх страницах (73 записи)

К этому моменту у ведущего в истории 73 звонка (`GET /meetings/history?limit=100` → 73,
`next_cursor: null`). Четыре нажатия `Load more` подряд:

```
старт   строк 20   [All · 20, Group meetings · 15, 1-to-1 · 5]    Load more активна
клик 1  строк 40   [All · 40, Group meetings · 33, 1-to-1 · 7]    Load more активна
клик 2  строк 60   [All · 60, Group meetings · 52, 1-to-1 · 8]    Load more активна
клик 3  строк 73   [All · 73, Group meetings · 63, 1-to-1 · 10]   Load more исчезла
клик 4  кнопки нет — нечего нажимать
```

Страницы ровно по 20, сумма вкладок на каждом шаге сходится (15+5=20, 33+7=40, 52+8=60,
63+10=73), дубликатов нет — итог совпадает с числом из API, кнопка пропадает на последней
странице. Пагинация корректна.

Побочно это наглядно показывает **ALK-3119**: при первой загрузке вкладка `1-to-1` пишет 5,
а на самом деле их 10 — счётчик и фильтр считают только загруженные страницы. Тикет открыт,
отдельно не выношу.

### Verified working — участник, не состоящий ни в одном канале, может создать звонок

Фикстурный аккаунт `dave` (в workspace, но **ни в одном канале**) создаёт звонок из хаба:

```
meetingId: V4OWRDMUO21WX2M   chosen: public / open / host_only
его экран: "QA channelless start | 0:07 | QD | QA Dave (you) | Leave call | End for everyone"
```

Создание проходит, он полноправный ведущий. Звонок виден остальным в `Live now` (он public):

```
"Live now | 2 | LIVE | running 0 min | QA channelless start | 1 participant · hosted by QA Dave | QD | Join
          | LIVE | running 2 min | QA long duration   | 2 participants · hosted by QA Alice | QA | QB | Join"
```

Оба живых звонка перечислены с верными ведущими и счётчиками.

## Current state (обновлено 18:26)

Отчёт — **7 находок** (1 High / 5 Medium / 1 Low), опубликован и обновлён на том же URL:
https://claude.ai/code/artifact/5fc9fa61-e210-4f73-aa31-58ae1e0125e9

Седьмая добавлена после публикации: в истории приглашённого групповой звонок выглядит одинаково,
принял он приглашение, отклонил или не ответил. Найдена при проверке пустого состояния хаба.

Идёт **длинный звонок** `QA long duration` (начат 18:23:45, двое участников) — проверяю
периодически: состояние, счётчик длительности, качество связи. Это состояние (звонок длиной
в десятки минут) до сих пор в секторе не проверялось: все мои прошлые звонки жили минуты.

Стенд: alice 9232 и bob 9233 в длинном звонке, окно 9238 временно перелогинено на `dave`
(в workspace, ни в одном канале) — использую как третий аккаунт; вернуть его в разлогиненное
состояние перед гостевыми проверками.

### BUG-8 [Low] [frontend] На странице идущего звонка список участников показывает всем «0:00 in call», хотя звонок идёт уже минуты

Страница `/w/<ws>/calls/<id>` открыта для **живого** звонка (обычно её открывают у завершённого,
но она работает и у идущего). Звонок начат 18:23:45, оба участника вошли сразу.

```
18:24:0x  View all →  "QA Alice | Current | Joined 06:23 PM · left — | 0:00 in call"
                      "QA Bob   | Current | Joined 06:23 PM · left — | 0:00 in call"
18:27:13  View all →  то же самое: "0:00 in call" у обоих
          в это же время счётчик внутри звонка показывает  3:49
```

Замерено дважды на разной отметке (через ~20 с и через 3 мин 49 с) — оба раза `0:00`.
Статус `Current` и время входа при этом верные, «left —» тоже верно.

Для сравнения, у **завершённых** звонков то же поле считается правильно (замерено сегодня
на других звонках): `12:49 in call`, `0:29 in call`, `2:02 in call`.

**Граница:** приложение знает длительность — оно показывает её в самом звонке (`3:49`) и верно
считает это же поле после завершения. Ноль появляется только у тех, кто сейчас в звонке.

Остальное на этой странице у живого звонка корректно: нет метки `Ended`, нет длительности звонка,
вкладка `Logs` без счётчика (у завершённых он есть), состав участников верный.

**Дедуп:** в открытых багах ничего про это (прочитан список целиком, плюс grep по
`in call|длительность участия|participant duration` — только несвязанное).

### Verified working — страница **идущего** звонка (не только завершённого)

`/w/<ws>/calls/<id>` открывается и для живого звонка, и почти всё на ней верно:

```
шапка:        "QA long duration | group | Aug 26, 06:23 PM | Hosted by … | 2 participants"
              метки Ended нет, итоговой длительности нет — правильно, звонок идёт
Logs:         "ACTIVITY | All | 5 | People | 2 | Screen share | 0 | Files | 0 | Recording | 0 |
               Meeting | 3 | … 06:23:56 PM QA Bob joined the call | 06:23:39 PM QA Alice joined
               the call | 06:23:38 PM Meeting started"     ← события пишутся вживую
Chat:         после отправки сообщения в звонке вкладка стала "Chat 1", содержимое:
              "CHANNEL | In-call chat | 2 participants | DIRECT MESSAGES | No direct messages
               during this call | … QB | QA Bob | 06:29 PM | live chat probe"   ← подхватилось живьём
```

Мелочь (в отчёт не выношу): у **живого** звонка вкладка `Logs` идёт **без счётчика**, хотя
внутри панели счётчик есть (`All | 5`), а у завершённых звонков на вкладке он стоит (`Logs 10`).
`Chat` при этом счётчик показывает и у живого (`Chat 1`). Несогласованность только у Logs.

Единственная реальная ошибка на этом экране — нулевая длительность участия у тех, кто
сейчас в звонке (BUG-8 выше).

### BUG-9 [Low] [backend] Осознанный выход из звонка не попадает в журнал, если человек быстро вернулся

Проверял живучесть при повторных входах (область ALK-2591). Участник трижды подряд вышел
кнопкой `Leave call` → `Leave` и сразу вернулся через `Join`. Каждый раз возвращался чисто:
`inCall: true`, две плитки, счётчик звонка продолжает идти (6:54 → 7:14 → 7:34), у хоста
залипших плиток нет. **С этим всё в порядке.**

Но в журнале звонка от этих трёх выходов не осталось следа:

```
после трёх быстрых циклов (выход → сразу вход), GET /api/v1/meeting/<id>/events?limit=200
{"participant.reconnected": 3, "track.published": 5, "track.unpublished": 3,
 "participant.joined": 2, "meeting.started": 1}
                                    ↑ participant.left ОТСУТСТВУЕТ полностью
```

Затем тот же участник вышел и вернулся **через ~90 секунд**:

```
сразу после выхода:  {"participant.left": 1, …}          ← выход записан
после возврата:      {"participant.joined": 3, "participant.left": 1,
                      "participant.reconnected": 3, …}   ← запись сохранилась
```

То есть выход фиксируется, но при быстром возврате пара выход/вход схлопывается в
`participant.reconnected`, и **самого факта выхода в журнале не остаётся**.

В интерфейсе `participant.reconnected` отрисовывается как безымянная строка
`Participant activity | By <имя>` — читатель журнала не узнает ни что человек выходил,
ни что возвращался.

**Граница:** событие не создаётся вовсе (в ответе `/events` его нет), значит теряется на
стороне сервера, а не при отрисовке. Отдельно от этого клиент не умеет назвать
`participant.reconnected` человеческими словами.

**Дедуп:** открытая **ALK-2180** («Call detail Logs: duplicate "Left the call" entries») —
про тот же тип события, но противоположный симптом (дубликаты, а не пропажа). Ничего про
пропажу выходов при быстром возврате в открытых багах нет.

### Проверка BUG-1 против ловушки с обрезанным ответом — причина подтверждена на ПОЛНЫХ телах

Координатор предупредил, что общий хелпер `api.mjs` режет тело ответа по умолчанию на 400
символов, и «поля нет» могло означать «поля нет в первых 400 символах». Мои снипеты — свои,
не `api.mjs`, и регулярку я гонял по полному тексту. **Но читал я срез**: у `meetings/active`
было `len: 637`, а печатал я `slice(0, 520)` — 117 символов оставались непрочитанными, и вывод
«поля об очереди нет» я делал, глядя на срез.

Перепроверил заново, с живым ожидающим в лобби, **без единого среза** — перечислил все ключи
рекурсивно и прогнал поиск по всему телу:

```
GET /api/v1/workspace/<ws>/meetings/active     200, полная длина 642
все ключи (26):
  .meetings[].id .channel_id .created_by .status .started_at .name .is_private
  .password_protected .max_participants .requires_approval .creator_name
  .creator_username .creator_avatar_url .workspace_id .recording_enabled
  .mute_on_join .participant_count .top_participants
  .top_participants[].participant_id .type .user_id .name .username
  .avatar_url .livekit_identity
совпадения /wait|pending|queue|knock|lobby|admission|request/ во всём теле: ['waitfield']
                                    ↑ это часть названия моего же тестового звонка

GET /api/v1/notifications?limit=50             200, полная длина 1615
совпадения тех же слов во всём теле: []        ← при том, что человек в этот момент ждёт в лобби
```

Поля об очереди на вход нет ни в одном из ответов — вывод BUG-1 устоял.

**Ловушка тоньше, чем «хелпер режет»:** у меня тест шёл по полному тексту, а *доказательство,
на которое я смотрел*, было обрезано. Печатать длину рядом со срезом (я печатал) недостаточно —
надо либо печатать всё, либо перечислять ключи, как здесь.

### ПОПРАВКА к BUG-9 — переснял с проверкой каждого цикла, вывод был слишком сильным. В отчёт не идёт

Первая попытка переснять оказалась негодной: я взял звонок с `Wait for admission`, поэтому
«повторный вход» участника возвращал его **в очередь на одобрение**, а не в звонок. Проверка
состояния это и показала: `BOB inCall: False`, у хоста `WAITING (1) | QB | QA Bob | Admit | Deny`.
Циклов не было вовсе — счётчики, которые я получил, ни о чём не говорили.

Переснял на **открытом** звонке, подтверждая каждый цикл (`inCall: true`, `tiles: 2`):

```
базовое состояние:      {"participant.joined": 2, "track.published": 2, "meeting.started": 1}
после 3 циклов выход→вход:
                        {"participant.reconnected": 2, "participant.joined": 3,
                         "participant.left": 1, "track.published": 5,
                         "track.unpublished": 3, "meeting.started": 1}
```

То есть из **трёх одинаковых осознанных выходов** один записался как `participant.left`,
а два схлопнулись в `participant.reconnected`. В первом прогоне (тоже 3 цикла) было
0 × `left` и 3 × `reconnected`.

**Мой первоначальный вывод «выход не попадает в журнал» — слишком сильный.** Правильная
формулировка: одно и то же действие пользователя записывается **непоследовательно**, и от чего
это зависит, я не установил. Детерминированная часть здесь только одна: событие
`participant.reconnected` отрисовывается в журнале безымянной строкой
`Participant activity | By <имя>`, из которой читатель не узнает ни что человек выходил,
ни что вернулся.

**Решение: в отчёт не выношу.** Заявка, которую я не могу охарактеризовать правилом,
превращается в тикет, который никто не сможет подтвердить, — а CLAUDE.md прямо предупреждает,
что перемежающиеся дефекты читаются как безусловные по одному прогону. Остаётся в логе с обоими
прогонами: смежно с **ALK-2180** (там про дубликаты `Left the call`, тут про пропажу) и с моей
BUG-4 (журнал сообщает не то, что произошло).

Отдельно подтверждено и **дефектом не является**: сами повторные входы работают чисто —
три цикла подряд, каждый раз обратно в звонок, две плитки, счётчик звонка не сбрасывается,
у хоста залипших плиток нет (область ALK-2591).

## Current state (обновлено 18:42)

**Отчёт — 8 находок**, опубликован и обновлён на том же URL:
https://claude.ai/code/artifact/5fc9fa61-e210-4f73-aa31-58ae1e0125e9
1 High / 5 Medium / 2 Low · 1 backend / 7 frontend.

| # | важность | область | о чём |
|---|---|---|---|
| 1 | High | backend | ведущий вышел из звонка с одобрением — впустить некому, ведущему не сообщают |
| 2 | Medium | frontend | строка участника навсегда `Ringing…` после недозвона |
| 3 | Medium | frontend | сняли пароль — стоящий у барьера остаётся перед ним |
| 4 | Medium | frontend | «private meetings only» у поля пароля на публичном звонке |
| 5 | Medium | frontend | в истории приглашённого все исходы группового звонка выглядят одинаково |
| 6 | Low | frontend | на странице идущего звонка у всех `0:00 in call` |
| 7 | Low | frontend | журнал пишет «Meeting ended for everyone», когда звонок закрылся сам |
| 8 | Medium | frontend | гостю по нерабочей ссылке неверная причина и ноль кнопок |

Проверено после публикации и **не пошло в отчёт**: непоследовательная запись выходов в журнал
(не смог охарактеризовать правилом), гостевая ссылка на запланированную встречу (нет пути из UI),
рейтинг звонка (дублирует опубликованную находку сектора A от 25.08).

Причина BUG-1 перепроверена на **полных** телах ответов после предупреждения об обрезке.

Стенд чист: живых звонков нет. alice 9232, bob 9233 — свои аккаунты; окно 9238 сейчас
залогинено как `dave` (использовалось как третий аккаунт и как «пустой» аккаунт для истории).

### Verified working — приватный звонок не виден и не открывается постороннему

Звонок создан с `calls-hub-access=private`. Участник рабочего пространства, которого не звали:

```
хаб:                "Live now | 0 | No live calls right now."
GET /workspace/<ws>/meetings/active → []            ← в списке живых его нет вовсе
прямой заход по /w/<ws>/call/<id>:
  "You cannot join this call | You do not have access to this call.
   It may be limited to members or require a password. | Back to workspace"
  inCall: false, кнопка выхода есть
```

Приватность соблюдена на всех трёх уровнях: не виден в хабе, не отдаётся в API живых звонков,
по прямой ссылке не пускает. Вместе с ранее замеренным `403` на `/events` у **завершённого**
приватного звонка это закрывает вопрос по приватным звонкам.

**Дедуп:** формулировка отказа гадательная — «It may be limited to members **or** require a
password», хотя конкретная причина известна (звонок приватный, человека не приглашали).
Это **ALK-3126** («показывается общий 403 вместо причины запрета входа»), тикет открыт,
отдельно не выношу.

### Verified working — повторяющаяся встреча: запуск одного вхождения не задевает остальные

Утренний проход отметил `Repeat` / `Custom RRULE` как непройденное. Закрываю.

Повтор **доступен из интерфейса**: в диалоге `Schedule meeting` есть блок
`Repeat | Does not repeat | Custom RRULE`, то есть это пользовательский путь, а не только API.
Встречу создал через API (`recurrence: {frequency:'daily', interval_count:1, ends_at:+4 дня}`) —
это setup, тестировал сам **запуск**, который в моём секторе.

```
календарь, неделя 24–30 августа: 4 чипа "QA recurring daily 18:49-19:09"
                                 (сегодня + три следующих дня — верно для окончания через 4 дня)
хаб «Scheduled today»:           "06:49 PM | 20 min | QA recurring daily | Start call"
                                 показано только сегодняшнее вхождение, не все четыре
```

Запустил сегодняшнее вхождение из хаба (`Start call`) → звонок пошёл,
`Live now | 1 | QA recurring daily | 1 participant`. Завершил его.

```
после завершения:
  хаб «Scheduled today»:  "QA recurring daily | Meeting ended"   ← только сегодняшнее
  календарь:              все 4 чипа на месте
```

Запуск и завершение одного вхождения помечают **только его**; остальные остаются
запланированными. Материализация вхождений отдельными событиями работает как задумано.

**Дедуп:** у завершённого вхождения в карточке стоит `0 participants`, хотя участник был один —
это **ALK-2522** («Day view не показывает количество участников завершённого meeting»),
тикет открыт, отдельно не выношу.

**Наблюдение сектору E (не моё):** вариант повтора называется `Custom RRULE` — сырой термин
из стандарта iCalendar, который обычному пользователю ничего не говорит. В отчёт не беру,
это создание встречи в календаре.

### Сплошной обход поверхностей сектора — что осталось неопробованным и почему

**Хаб `/w/<ws>/calls`** — перечислены все видимые интерактивные элементы (25 различных, не считая
строк истории): `Start now`, `Schedule meeting`, `Team meeting`, `Webinar` (disabled),
вкладки `All / Group meetings / 1-to-1`, `Load more`, `Start call` на карточке запланированной,
`Join` на карточках `Live now`, строки истории (каждая — кнопка на страницу звонка).
**Все опробованы.** Отдельных действий у строки истории нет — ни меню, ни контекстных кнопок.

**Страница завершённого звонка** — все элементы: `Back to Calls`, вкладки `Recording N`,
`Chat N`, `Logs N`, `View all`, и в блоке записи `Play recording`, `Manage recording access: …`,
`Share`, `Download`. Опробованы все, **кроме двух**:

- **`Download`** — это скачивание файла. По правилам моей сессии скачивание требует явного
  разрешения человека, а прогон идёт без него, поэтому не нажимал.
- **`Share`** — это отправка/публикация содержимого (ссылки на запись) в чужую поверхность.
  По тем же правилам требует разрешения. Не нажимал.

Обе — честные пробелы покрытия с названной причиной, а не «не дошли руки». Смежный открытый
тикет по второй: **ALK-2631** («Ссылка Share logs отображается как resource unavailable
у получателя»).

### Наблюдение (в отчёт не выношу) — отказ в доступе показан как «Could not record the call»

Участник рабочего пространства, **не находящийся** в звонке, открывает страницу идущего
звонка, защищённого паролем. Экран:

```
"QA reverify 68 | group | Aug 26, 06:49 PM | Hosted by … | Recording | Chat | Logs |
 Recording | Could not record the call | Retry"
блока участников нет вовсе;  состояние сохраняется после перезагрузки
```

Что на самом деле произошло — три запроса с этой страницы под тем же аккаунтом:

```
GET /api/v1/meeting/<id>/recordings    403 {"key":"REALTIME_ACCESS_DENIED"}
GET /api/v1/meeting/<id>/participants  403 {"key":"REALTIME_NOT_ACTIVE_PARTICIPANT",
                                            "message":"requester is not an active participant"}
GET /api/v1/meeting/<id>               200
у ведущего те же три запроса: 200 / 200 / 200
```

То есть это **отказ в доступе**, а UI сообщает о **неудавшейся записи** и предлагает `Retry`,
который всегда будет упираться в тот же 403. Записи никто не запускал.

**Почему не выношу:** попасть на этот экран можно только по прямой ссылке на звонок, к которому
у тебя нет доступа (в истории его нет — она персональная, в хабе у живого звонка кнопка `Join`,
а не переход на страницу). Плюс панель уже покрыта двумя открытыми тикетами: **ALK-3070**
(лишняя кнопка `Retry`) и **ALK-2989** (не показывается сорванная запись). Мой случай от обоих
отличается — там успешная загрузка и настоящая failed-запись, здесь отказ в доступе, — но
чинится это в том же месте, и триажу полезнее как дополнение к ним, чем девятым пунктом отчёта.

## Итог перепроверки всех восьми находок

Каждая находка отчёта воспроизведена **не менее двух раз**, большинство — больше, на разных
звонках и разных экземплярах страницы.

| # | сколько раз | чем подтверждено дополнительно |
|---|---|---|
| 1 · лобби без ведущего | 3 | поллер уведомлений 150 с без изменений; полное перечисление ключей `meetings/active` и `notifications` |
| 2 · строка `Ringing…` | 5 | 299 замеров подряд за 301 с; контраст с `Decline` (отпускает мгновенно) и с `In call`; снимается `page.reload()` |
| 3 · пароль сняли, барьер остался | 2 | поллер 75 с без изменений; повтор через 1 мин 37 с; вход по произвольной строке |
| 4 · «private meetings only» | 2 | A/B на двух разных звонках: имя без пароля — кнопка неактивна, любой символ — активна |
| 5 · исходы в истории приглашённого | 3 | не в сети / в сети с истёкшим вызовом / явный `Decline` — одна и та же строка |
| 6 · `0:00 in call` у идущего звонка | 4 | два замера на первом звонке (0:20 и 3:49), два на втором (0:40 и 1:50), контраст со счётчиком звонка |
| 7 · «Meeting ended for everyone» | 2 | оба раза сырое событие `actor_user_id: null`, `room_finished`; сверено со звонком, завершённым кнопкой |
| 8 · тупик у гостя по нерабочей ссылке | 3 | завершённый звонок, заменённая ссылка, и удалённый из встречи гость — везде `interactiveCount: 0` |

Ни одна находка при перепроверке не отвалилась и ни одна не потребовала смены области
(`backend`/`frontend`). Две потребовали уточнения формулировки, и обе уже исправлены в отчёте:
у первой — блок измерений (соседние календарные уведомления выглядели как противоречие),
у второй — «до пяти минут» приведено к фактическим одиннадцати.

**Снято до отчёта, не опубликовано:** непоследовательная запись выходов в журнал (не удалось
сформулировать правило), отказ в доступе под видом «Could not record the call» (редкий путь,
смежен с двумя открытыми тикетами), рейтинг звонка (дублирует опубликованную находку lane A
за 25.08), гостевая ссылка на запланированную встречу (нет пути из UI).

### Verified working — звонок человеку, который тебя заблокировал, не начинается и объясняет почему

Второй аккаунт заблокировал первый (`POST /api/v1/messaging/users/block` → `200 {"ok":true}`).
Первый жмёт `Call` в `Directories`:

```
POST /api/v1/messaging/dm   400
{"code":400,"key":"DM_USER_BLOCKED","message":"cannot create DM: user is blocked"}

на экране: "This call cannot be started because one of you has blocked the other."
           "This is unavailable because a user is blocked."
outgoing-call-surface: отсутствует, звонок не создан
```

Отказ корректный, причина названа прямо. (Блокировку снял обратно — `unblock` → `200`.)

### Паттерн — одно действие показывает два уведомления об одном и том же (третий случай)

Собралось три независимых случая, все в моём секторе:

```
лимит участников  полноэкранное "The call is full | This call has reached its participant limit…"
                  + тост "This meeting has reached its participant limit."
бан участника     полноэкранное "You cannot rejoin this call | A host removed you…"
                  + тост "You cannot join because you were removed from this meeting."
блокировка        "This call cannot be started because one of you has blocked the other."
                  + "This is unavailable because a user is blocked."
```

Каждый раз пользователь получает конкретное сообщение **и** обобщённое, об одном и том же.
Это **ALK-3425** («При закрытии Side Room показывается дублирующееся уведомление вместо одного»),
но три случая из совершенно разных мест показывают, что дело не в Side Rooms, а в общем
механизме. Отдельной находкой не выношу — полезнее как дополнение к открытому тикету, что
он системный, а не локальный.

### Verified working — владелец рабочего пространства не получает власти в чужом звонке

Владелец workspace (`qa.b.owner`) вошёл в звонок, который создал обычный участник:

```
тулбар владельца: [screen-share, live-reaction, people-toggle, chat-toggle,
                   breakout-rooms, leave]
                  нет end-for-everyone, нет settings-toggle, нет add-to-call
меню действий по отношению к ведущему звонка: ['Pin for me', 'Stop watching']
                  ни Mute, ни Remove from call, ни Ban, ни Make co-host
панель: "QA Alice HOST" / "QA Owner (you)"  — метка HOST у создателя звонка
```

Модерация звонка строго у ведущего конкретного звонка; роль в рабочем пространстве её не даёт.
Ни лишних прав, ни обещанных интерфейсом действий, которые не работают.

## Current state (обновлено 19:02)

**Отчёт — 8 находок**, опубликован, самопроверен, все восемь перепроверены минимум дважды:
https://claude.ai/code/artifact/5fc9fa61-e210-4f73-aa31-58ae1e0125e9

Сектор покрыт полностью: закрыты все пробелы, перечисленные утренним проходом
(takeover, held calls — их в продукте нет, пагинация, лимиты, обрыв связи, Repeat/RRULE),
и пройдены обе главные поверхности сплошным перечислением элементов управления.

**Идёт длительный звонок `QA endurance`** (начат 19:00:53, три участника: alice, bob и
третье окно под `owner`). Проверяю на отметках ~30 и ~60 минут — длительность звонка в
десятки минут в секторе ни разу не проверялась.

Стенд: alice 9232, bob 9233 — свои аккаунты; окно 9238 за сессию побывало гостевым
(разлогиненным), `dave` и сейчас `owner` — все перелогины в пределах полосы B, что
lane guard разрешает и CLAUDE.md явно допускает.

### Verified working — консоль во время звонка чистая

Слушатель `console` и `pageerror` повешен на окно участника идущего звонка на троих, 60 секунд:

```
total: 0   distinct: 0   (уровни error и warning)
```

Ни ошибок, ни предупреждений за минуту живого звонка с тремя участниками. Полезно как фон:
если в другом сценарии консоль начнёт шуметь, это будет отличие, а не норма.

### Дедуп — ALK-3107 воспроизводится на rc.5, и нужная формулировка в продукте уже есть

Участник уже в звонке, сворачивает его в PiP, в `Live now` жмёт `Join` на **другом** живом звонке.

```
шаг 1: попадает на pre-join второго звонка — "READY TO JOIN? | QA endurance | DEVICE CHECK …"
       никакого предупреждения, что он уже в звонке, здесь нет
шаг 2: жмёт Join →
       "Could not join the call | Something went wrong while joining the call.
        You can try again or go back to the workspace. | Back to workspace"
       inCall: false
```

Это ровно **ALK-3107** («Вход во второй звонок из Live now завершается общей ошибкой вместо
подсказки выйти из текущего звонка»), тикет открыт.

**Полезное дополнение к тикету:** правильная формулировка в продукте уже существует, просто
на соседнем пути. Когда тот же пользователь в том же состоянии пытается **создать** звонок,
сервер отвечает `409 REALTIME_ALREADY_IN_ANOTHER_MEETING`, и интерфейс показывает конкретное
**«Leave your current meeting before joining another one.»** (замерено сегодня отдельно).
То есть на пути создания причина названа, а на пути входа — нет.

### Контрольные точки длительного звонка `QA endurance`

```
19:00:53  начат, трое участников
19:04:28  «Live now | 1 | running 2 min | QA endurance | 3 participants», события: 3 joined,
          3 track.published, 1 meeting.started — всё верно
19:05      третий участник вышел (использовал его окно для проверки ALK-3107)
19:18:36  двое в звонке, у обоих tiles 2, "17:49 / 17:50", качество "Excellent · 5ms"
          ничего не деградировало
```

### Заготовка проверки к BUG-7 — участник, вышедший рано из длинного звонка

Третий участник пробыл в `QA endurance` около четырёх минут (19:01→19:05) и вышел. Пока звонок
идёт, в его `Recent calls` этого звонка **нет вовсе** — история показывает только завершённые
(в `Live now` он при этом виден и снова доступен для входа). Это разумно.

Проверю, когда завершу звонок: BUG-7 утверждает, что строка истории показывает длительность
**всего звонка**, а не участия. Здесь контраст будет особенно наглядным — человек был внутри
~4 минуты, а звонок к тому моменту продлится под час. Если строка покажет длительность звонка,
это самая яркая иллюстрация к находке.

### Пустое состояние вкладки истории — формулировка честная, но выдаёт внутреннюю кухню

У аккаунта с пятью групповыми звонками и нулём личных вкладка `1-to-1 · 0`:

```
"Recent calls | All · 5 | Group meetings · 5 | 1-to-1 · 0 | No 1-to-1 calls in loaded history."
```

Приложение прямо признаётся, что фильтр смотрит только на **загруженные** страницы — это то
самое поведение из **ALK-3119**. С одной стороны честно, с другой — «loaded history» ничего не
говорит обычному человеку, и в тикете просят не подпись, а автодогрузку. Полезный контекст
к открытому тикету, отдельной находкой не выношу.

### Замер для сектора D — учётная запись с ролью guest создаёт звонок и становится его ведущим

```
аккаунт qa.b.guest (is_guest = true, участник workspace)
хаб: видит карточки Team meeting / Webinar, секцию Live now с чужим звонком и кнопкой Join,
     свою историю (5 звонков)
создание: Start now → звонок создан (meetingId получен), submit-ошибки нет
в звонке: "QA guest role start | QG | QA Guest (you) | Leave call | End for everyone"
          то есть полноправный ведущий
```

**Дефектом не называю:** каким должен быть объём прав у роли guest — решение продуктовое,
роли и права это сектор D, а выводить ожидаемое поведение из исходников CLAUDE.md запрещает.
Фиксирую как замер и передаю вопрос сектору D: предполагается ли, что гость может создавать
звонки в рабочем пространстве и распоряжаться ими.

### Кнопка «назад» в браузере во время звонка — проверено частично, часть не удалась

**Что удалось измерить чисто:** на странице с нетронутой историей (хаб → `Join` → экран
проверки устройств) нажатие «назад» с **pre-join** корректно возвращает на хаб:

```
история: 2 записи на хабе → 3 после перехода на pre-join
назад →  /w/<ws>/calls,  inCall: false
```

**Что измерить не удалось:** поведение «назад» **изнутри** звонка. На основном окне история была
испорчена моим же скриптом (десятки переходов на маршрут звонка), и «назад» просто ходил между
накопленными записями одного и того же звонка: URL менялся
(`/call/<id>` ↔ `/call/<id>?returnTo=…`), а `inCall` всё время оставался `true`, у хоста
три плитки — то есть из звонка не выбрасывало. Но это не поведение реального пользователя,
у которого таких записей одна-две.

Попытка переснять на чистой странице не удалась по другой причине: тот же аккаунт уже находился
в этом звонке в соседней вкладке, и вторая вкладка в звонок не вошла (`inCall: false`) — это
territory перехвата сессии, а не «назад».

Записываю как **частично проверенное**: pre-join отрабатывает верно, поведение изнутри звонка
осталось незакрытым. Чтобы закрыть, нужен отдельный аккаунт, ещё не находящийся в звонке,
и свежая вкладка — у меня на этом этапе не было свободного четвёртого окна в пределах лимита
сектора (3).

### Кнопка «назад» — закрыто: из звонка не выбрасывает и звонок не прячет

Переснял на **свежей вкладке с чистой историей** и аккаунтом, который в звонке не находился:

```
хаб (2 записи истории) → Join → inCall: true, /call/<id>?returnTo=/calls (3 записи)
нажатие «назад» →
  url:              /w/<ws>/calls
  call-surface:     в DOM и ВИДИМ (surfaceVisible: true)
  overlay:          call-overlay-expanded, call-overlay-backdrop
  PiP:              отсутствует (и не должен — звонок развёрнут, а не свёрнут)
  микрофон:         кнопка "Mute", aria-pressed="false"
```

То есть «назад» меняет адрес, но оверлей звонка остаётся развёрнутым поверх, со всеми
элементами управления. Пользователь видит звонок, а не хаб. **Дефекта нет.**

**Собственный промах, который чуть не стал находкой.** В первом заходе я посмотрел на
`pip: false` и на текст `main` («Calls | Start now | Schedule meeting | …») и уже формулировал
находку «после „назад“ человек остаётся в звонке с живым микрофоном и без единого признака
этого». Текст `main` — это хаб **за** оверлеем, ровно та же ловушка, о которой предупреждает
правило про `main`, только теперь в моём собственном измерении. Спасла проверка видимости
самого `call-surface`, а не факта его присутствия в DOM.

Тель: **`pip: false` не значит «индикатора нет»** — звонок может быть не свёрнут, а развёрнут.
Проверять надо видимость поверхности звонка, а не наличие PiP.

## Current state (обновлено 06:47, 27 августа)

**Отчёт закрыт и опубликован целиком: 12 находок** — 2 High, 7 Medium, 3 Low; 3 backend, 9 frontend.
https://claude.ai/code/artifact/5fc9fa61-e210-4f73-aa31-58ae1e0125e9
Строка в `reports/README.md` дописана. Сборка на стенде за всю сессию не менялась:
`v0-61-0-rc-5-c4b5386b4a3a` (проверено в 14:40, 22:14, 23:06, 04:56 и 06:42).

**Две High:**
1. Звонок с одобрением входа перестаёт принимать людей, когда ведущий выходит, и ему об этом
   нигде не сообщают; оставшимся очередь не отдают (`403 REALTIME_ACCESS_DENIED`).
2. Гость, оборвавшийся из Side Room, навсегда занимает место: ведущий не может выставить лимит
   по факту, а живого человека не пускают в звонок со свободным местом. Механизм нашёл сектор A,
   последствие и полную цепочку измерил я — три прогона на трёх звонках.

**Качество:** каждая находка воспроизведена 2–5 раз (обе High — 5 и 3); состязательная вычитка доказательств —
0 расхождений из 12; дедуп по трём наборам (открытые + 184 BLOCKED + соседние отчёты за день)
плюс повторная синхронизация зеркала; цитаты только на фронт и только через развёрнутый sha;
вёрстка проверена в настоящем браузере во всех четырёх состояниях темы.

**Тикеты:** разобрано 55 из 93 открытых по звонкам; остальные 38 — чужие секторы.
Отвечено на прямые вопросы ALK-3592 и ALK-3489.

**Стенд оставлен чистым:** фикстуры lane B проверены (`seed.sh --verify --lanes B` —
8/8 пользователей во всех пяти базах, каналы на месте), звонков нет, три браузера на своих
аккаунтах, временные файлы убраны, случайно созданный `~/Servers` удалён.


### ⚠ Главное для читателя

**Опубликованный отчёт содержит 11 находок, локальный файл — 12.**
Artifact трижды ответил `429 frame_daily_push_cap_reached`, суточная квота публикаций исчерпана,
дальше не пробую. Опубликовано: https://claude.ai/code/artifact/5fc9fa61-e210-4f73-aa31-58ae1e0125e9
Не опубликовано: **BUG-12** (гость, оборвавшийся из side room, навсегда занимает место)
и дополнительный замер 1:17:16 в блоке BUG-7. Файл готов, нужна только новая квота.

### Итог

**12 находок**: 2 High, 7 Medium, 3 Low; 3 backend, 9 frontend.
Сборка всю сессию одна: `v0-61-0-rc-5-c4b5386b4a3a`.

**BUG-12 — самая тяжёлая находка сессии.** Механизм нашёл соседний сектор, последствие
(лимит участников и вход) мой сектор; воспроизвёл цепочку целиком своими измерениями:
гость обрывается из side room → его строка живёт минимум 14 минут → ведущий не может
выставить лимит по реальному числу людей → настоящего человека не пускают в звонок,
где занято одно место из двух.

**Качество отчёта:** доказательства — 0 расхождений из 12; дедуп — открытые + 184 BLOCKED +
соседние отчёты за день + повторная синхронизация (0 тикетов заведено за сутки); цитаты —
только на фронт и только через развёрнутый sha, бэкендовых ссылок на строки нет намеренно.

**Разобрано тикетов — 28.** Длинные звонки: 1:03:18, 31 мин, 2:16:20 — деградации нет нигде.

**Хвост:** строка в `reports/README.md` (черновик готов в scratchpad, перечитать файл перед
записью); удалить пустой `~/Servers`; при возможности — опубликовать 12-ю находку.

Стенд: alice 9232, bob 9233, admin 9238 — все свободны, звонков нет.


### Проверено рабочим — восстановление и повторный вход (19:40–19:45)

**ALK-2543 «После Leave call и reload снова открывается Ready to join?» — не воспроизводится.**
Создал `QA leave reload` (open entry), вышел, перезагрузил страницу:

```
после Leave:   /w/<ws>/calls  — хаб
после reload:  /w/<ws>/calls  — хаб, "Live now | 1 | running 39 min | QA endurance"
```

Экрана входа нет ни разу. Заодно снова подтвердилось закрытие звонка последним участником:
в «Live now» остался только чужой звонок, мой исчез сразу после выхода.

**Перезагрузка вкладки прямо в звонке — восстановление корректное.**
Это отдельный от предыдущего сценарий: не выход и перезагрузка, а перезагрузка *внутри* звонка.

```
до reload:   inCall True | tiles 1 | /call/<id>?returnTo=%2Fw%2F<ws>%2Fcalls
после reload: inCall True | tiles 1 | /call/<id>?returnTo=%2Fw%2F<ws>%2Fcalls
поверхность:  QA reload incall | 0:23 | Excellent · 5ms | QA Admin (you) | Leave call | End for everyone
```

Возврат в звонок автоматический — ни экрана «Ready to join?», ни повторного запроса устройств
на этом пути; таймер продолжает общее время звонка, а не отсчитывает заново. Права ведущего
сохранены (кнопка `End for everyone` на месте).

### Проверено рабочим — длительный звонок (`QA endurance`, 19:00:53 → ~1 ч)

Состояние, которое в секторе раньше не проверялось: звонок, живущий около часа.
Контрольные точки 2 / 18 / 26 / 38 / 48 мин — на всех `tiles 2`, «Excellent · 5ms»,
таймер идёт непрерывно, ни одного переподключения между точками.

На 53-й минуте измерил не UI, а сам медиапоток (`getStats`, дельта за 5 секунд, обе стороны):

```
alice:  in-audio  bytes +30174  totalAudioEnergy +1.424      out-audio bytes +20483
bob:    in-audio  bytes +21114  totalAudioEnergy +0.932      out-audio bytes +28080
RTCPeerConnection: по одному на участника
```

Звук идёт в обе стороны: `totalAudioEnergy` растёт у обоих (то есть приходит не тишина),
а исходящие одного сходятся со входящими другого (alice in 30174 ≈ bob out 28080 —
расхождение в пределах смещения выборок). Один peer connection на участника за час,
то есть переустановки соединения не было.

Событий за час — 26, все объяснимы приходами и уходами третьих лиц:
`participant.joined 5, participant.left 3, participant.reconnected 3,
track.published 8, track.unpublished 6, meeting.started 1`. Деградации нет.

### Завершение `QA endurance` и иллюстрация к BUG-7 / BUG-8 (20:04–20:08)

`End for everyone` (`data-testid="call-end-confirm-submit"`) завершил звонок для всех.
У второго участника сразу появился экран `Call ended` с итогом — не зависшая поверхность.
Длительность 1:03:18, звонок 19:00:47 → 20:04:05.

**Рижная заметка:** вся поверхность звонка лежит внутри `[role="dialog"]`, поэтому селектор
«кнопка подтверждения внутри диалога» ловит и кнопку тулбара `call-controls-end-for-everyone`.
Подтверждать надо по `call-end-confirm-submit`, иначе диалог просто переоткрывается,
а звонок продолжается — что я и наблюдал с первой попытки.

**Страница завершённого звонка считает участие безупречно.** Сверил с сырыми событиями
`GET /api/v1/meeting/<id>/events` (поле `occurred_at`, `payload.participant.name`):

```
события (время +05)                          страница звонка, View all
19:00:47 joined alice                         Joined 07:00 PM · left 08:04 PM   1:03:18 in call
19:01:05 joined bob                           Joined 07:01 PM · left 08:04 PM   1:03:00 in call
19:01:17 joined owner  → 19:04:45 left        Joined 07:01 PM · left 07:04 PM      3:28 in call  [Left early]
19:22:23 joined admin  → 19:26:25 left        Joined 07:22 PM · left 07:28 PM      5:04 in call  [Left early]
19:27:06 joined admin  → 19:28:08 left        (два захода свёрнуты в один интервал)
```

Совпадение посекундное, включая суммирование **двух** заходов admin (4:02 + 1:02 = 5:04)
и метку `Left early`. То есть данные об участии у приложения есть и считаются верно.

**Это усиливает BUG-7 и уточняет BUG-8, но новой находкой не является.**
Строка истории у того же admin выглядит так:

```
"QA endurance | Incoming · Ended · Aug 26, 07:00 PM · 63m"
```

63m — длительность звонка, 07:00 PM — время начала звонка, тогда как admin вошёл в 19:22
и пробыл 5:04. Строка целиком описывает звонок, а не участие, и в этом внутренне
непротиворечива — поэтому отдельной находки здесь нет. Но именно поэтому строка и не может
отличить состоявшееся участие от отклонённого приглашения, о чём BUG-7 и говорит:
рядом, на странице того же звонка, участие посчитано до секунды.

BUG-8 (`0:00 in call` у идущего звонка) на этом контрасте выглядит точнее: то же поле
у завершённого звонка не просто «правильное», а суммирует разрозненные интервалы.

Отчёт не меняю: добавление четвёртого случая в BUG-7 — это тот же факт другими словами.

### BUG-9 [Medium] [backend] Перезагрузка ожидающего оставляет ведущему «призрак» в очереди: Admit никого не впускает

Звонок `QA lobby reload` (`V4OWUZNDMZ2RRN9`), вход `manual_admit`, ведущий alice, ожидающий bob.

**Контроль (без перезагрузки) — работает.** bob жмёт `Join` → `Waiting for host approval`;
alice жмёт `Admit` → `POST /participants/<pid>/admit` → 204 → bob **автоматически** оказывается
в звонке: `inCall True | tiles 2`, у alice `tiles 3 → 2 in call`. Ничего дополнительно нажимать
не нужно. Это ожидаемое поведение, и оно же — точка отсчёта для находки.

**Случай (ожидающий перезагрузил страницу) — не работает.** Прогнан дважды, результат одинаковый.

```
1) bob жмёт Join                     → "ALREADY IN ROOM · 1 | Waiting for host approval"
   GET /meeting/<id>/waiting  (alice)
   {"participants":[{"participant_id":"N4OWV6ED47752AO","user_id":"<bob>","name":"QA Bob",
     "username":"<bob>","avatar_url":null,"waited_since":"2026-08-26T15:11:55Z",
     "participant_type":"user","guest_id":""}]}

2) bob перезагружает вкладку         → "READY TO JOIN?"  кнопки: Test audio | Join | Cancel
   то есть он больше не ожидает — он на экране до входа

   GET /meeting/<id>/waiting  (alice)  — ТОТ ЖЕ ответ, тот же participant_id,
   {"participants":[{"participant_id":"N4OWV6ED47752AO", … "waited_since":"2026-08-26T15:11:55Z" …}]}

3) alice видит "WAITING (1) | QB | QA Bob | Admit | Deny" и жмёт Admit
   POST /meeting/<id>/participants/N4OWV6ED47752AO/admit  → 204
   GET  /meeting/<id>/waiting → {"participants":[]}
   у alice очередь пуста, при этом в звонке "1 in call", tiles 1 — никто не пришёл

4) у bob на экране по-прежнему "READY TO JOIN?", кнопка Join на месте. Ни сообщения,
   ни перехода, ни отметки, что его впустили.

5) если bob сам догадается нажать Join ещё раз:
   POST /meeting/<id>/join → 200, он входит СРАЗУ, без очереди
```

Первый прогон (participant_id `N4OWUZZ16PVQYTH`) дал то же самое.

**Что именно ломается для людей.** Ведущий видит запрос, впускает, очередь очищается — и он
вправе считать, что человек в звонке. Человек в это время смотрит на экран, который выглядит
так, будто он ещё не просился. Оба ждут друг друга. Разрешение при этом сохранено:
следующий `Join` проходит мимо очереди — то есть впуск состоялся, но об этом не сказали никому.

**Граница ответственности (проверено, без домыслов):** после того как сессия ожидающего исчезла,
`GET /meeting/<id>/waiting` продолжает отдавать ту же запись с исходным `waited_since` —
значит очередь у ведущего не устаревший кэш клиента, а ровно то, что вернул сервер;
`POST …/admit` по этой записи отвечает 204, а не ошибкой.
Какое исправление верное — снимать запись при потере сессии или доводить впуск до конца —
из измерений не следует, и я этого не утверждаю.

**Severity Medium:** обходной путь есть (нажать `Join` ещё раз, он срабатывает мгновенно),
но ни одна из сторон не получает никакого сигнала.

**BUG-9 — дедуп и публикация.** Прочитал открытые баги про очередь/лобби/впуск:
ALK-2871 (гость залипает на `Waiting for approval`, когда ведущий **завершает** звонок —
другой триггер и противоположный симптом), ALK-3250 (счётчик Waiting Lobby показывает 0
другим участникам — про счётчик, не про запись), ALK-3529, ALK-3531, ALK-3412, ALK-3140.
Прогнал `Admit|впуск|перезагруз` по описаниям всех 188 открытых багов — совпали только
ALK-3531 и ALK-3529, оба уже разобраны. Дубликатом не является.

Добавлен в отчёт девятой находкой (Medium, backend), опубликован по прежнему адресу.
Итог отчёта: **1 High, 6 Medium, 2 Low** — 2 backend, 7 frontend.

### Проверено рабочим — вызов 1-на-1 и перезагрузка во время звонка (20:20–20:28)

**Входящий вызов переживает перезагрузку страницы.** Непрерывный опрос всего документа
у вызываемого, начатый до вызова:

```
t= 0      ничего
t=16.0    incoming-call-banner + -accept + -decline, fixed-оверлей "<звонящий> Incoming call"
t=35.5    перезагрузка страницы — баннер исчез
t=35.8    баннер снова на месте, с теми же кнопками
```

0.3 секунды — то есть входящий восстанавливается после reload. Это прямая противоположность
BUG-9: заявка в очереди на вход перезагрузку не переживает, а входящий вызов переживает.

**Сторона звонящего тоже в порядке:** `outgoing-call-ringing-status`, фиксированный оверлей
`<кому> Ringing… | Leave call`, появляется в течение секунды после нажатия `Call`.

**Экран «звонок уже закончился» для залогиненного пользователя сделан правильно.**
Если звонок завершили, пока человек стоит на экране до входа, его `Join` даёт:

```
POST /api/v1/meeting/<id>/join    400
экран: "Call has ended | This call has already ended. You can start a new one from
        the workspace home. | Back to workspace"
```

Понятный текст и рабочая кнопка — в отличие от гостевого пути по нерабочей ссылке,
который остаётся в отчёте отдельной находкой.

**Не воспроизведено, находкой не считаю.** Один раз нажатие `Call` в Directories дало тост
`Could not start the call. Try again.` Повтор тут же прошёл штатно
(`POST /api/v1/meeting` → 200, `status: pending`), и ещё три вызова подряд тоже. Однократный
сбой без воспроизведения — не находка; записываю, чтобы следующая сессия знала, что это
видели, и обратила внимание, если повторится.

#### Методическая ошибка, из-за которой я чуть не написал две ложные находки

Дважды подряд заключил «баннера нет» и «у звонящего нет UI», потому что печатал
**срез** перечисленных кнопок (`[-6:]`, `[-9:]`). Перечисление было полным, а вывод — нет:
баннер входящего звонка портирован в fixed-оверлей и в DOM-порядке оказался в середине списка.
Правило из CLAUDE.md про «доказывай отсутствие перечислением, а не чтением текста»
я формально выполнил, а фактически нарушил — срез перечисления ничем не лучше среза текста.
Проверять надо было фильтром по смыслу (`accept|decline|ringing`) по всему списку,
а не хвостом. Подтвердилось непрерывным опросом: и баннер, и оверлей звонящего на месте.

### Зеркальный случай к BUG-9: перезагружается **ведущий** — всё работает (20:29–20:31)

Звонок `QA host reload`, `manual_admit`. bob попросился и **не** перезагружался; перезагрузилась alice.

```
alice перезагружает страницу  → возвращается в звонок: inCall True, tiles 1,
                                 счётчик ожидающих на кнопке People = 1
панель People после reload    → "WAITING (1) | QB | QA Bob | Admit | Deny"
alice жмёт Admit              → POST …/participants/<pid>/admit  204
bob                           → inCall True | tiles 2 | "QA host reload | 0:56"  — втянут автоматически
```

То есть перезагрузка сама по себе очередь не ломает. Ломает её именно исчезновение сессии
**ожидающего**: у ведущего запись остаётся, у ожидающего состояние ожидания не восстанавливается
(в отличие от входящего вызова, который восстанавливается за 0.3 с — см. выше).
Это сужает границу BUG-9 и заодно даёт третью строку в его «Проверку».

### Проверено рабочим — приём звонка с восстановленного баннера

После перезагрузки во время звонка баннер возвращается не декоративным:

```
20:28:15 перезагрузка вызываемого во время вызова
баннер вернулся: incoming-call-banner + -avatar + -status + -decline + -accept
нажатие incoming-call-banner-accept →
   /w/<ws>/call/<id> | "Call with <звонящий> | 0:07 | Excellent · 6ms" | Leave call
   у звонящего: inCall True | tiles 2 | "Call with <вызываемый> | 0:15 | Excellent · 5ms"
```

Обе стороны соединены, медиа-панель показывает качество. Дефекта нет.

### Граница BUG-9 сужена ещё раз: явная отмена заявки работает (20:36)

Звонок `QA cancel request`, `manual_admit`.

```
bob жмёт Join                 → "Waiting for host approval", кнопки: Cancel request | Back to workspace
GET /meeting/<id>/waiting     → {"participants":[{"participant_id":"<pid>","user_id":"<bob>", …}]}
bob жмёт Cancel request       → его возвращает на /w/<ws>/directories
GET /meeting/<id>/waiting     → {"participants":[]}
панель People у ведущего      → блока ожидающих нет
```

Итого граница BUG-9 такая:

| что происходит с заявкой | очередь у ведущего | результат |
|---|---|---|
| ожидающий жмёт `Cancel request` | очищается | верно |
| перезагружается **ведущий** | сохраняется, `Admit` впускает | верно |
| перезагружается **ожидающий** | сохраняется «призраком», `Admit` не впускает никого | **BUG-9** |

### Проверено рабочим — очередь на вход с двумя ожидающими (20:33–20:40)

Звонок `QA cancel request`, `manual_admit`, ведущий alice, в очереди bob и admin.

```
GET /meeting/<id>/waiting → два участника, разные participant_id и waited_since
панель People             → "WAITING (2) | Admit all | <A> | Admit | Deny | <B> | Admit | Deny"
счётчик на кнопке People  → 2   (совпадает с длиной очереди)
```

**Впуск одного из двух не задевает второго:**

```
Admit у первого  → POST …/participants/<pid-A>/admit   204
панель           → "WAITING (1) | <B> | Admit | Deny"        — второй на месте
GET /waiting     → остался только <B>, с прежним participant_id
первый           → inCall True     второй → "You can join after a host…"
кнопка Admit all → исчезла, когда в очереди остался один
```

**`Admit all` работает:**

```
в очереди снова двое
Admit all  →  POST /api/v1/meeting/<id>/participants/admit-all    200
GET /waiting → {"participants":[]}
оба ожидавших → inCall True, у ведущего "3 in call", tiles 6
```

Отдельного эндпоинта на массовый отказ в интерфейсе нет — только `Admit all`.
Это асимметрия, но не дефект: отказать по одному можно, и каждый `Deny` виден.

### Проверено рабочим — отказ во входе и повторная заявка (20:41–20:43)

```
Deny у одного из двух  → POST /api/v1/meeting/<id>/participants/<pid>/reject   204
                          (в интерфейсе кнопка называется Deny, эндпоинт — /reject)
панель                 → "WAITING (1) | <второй> | Admit | Deny"   — удалён именно тот, кого отказали
GET /waiting           → остался только второй

экран отказанного:
  "Request declined | The host declined your request to join this call."
  кнопки: "Request to join again" | "Back to workspace"
  плюс тост "Admission denied — The host declined your …"

"Request to join again" → снова "You can join after a host admits you from the waiting room",
                          в очереди у ведущего он появляется заново, с НОВЫМ participant_id
```

Экран отказа сделан хорошо: понятный текст, путь назад и путь повторить.
Это, кстати, контраст к находке про гостя по нерабочей ссылке — там кнопок нет вовсе.

### Снято как дубликат: счётчики на вкладках истории показывают «сколько загружено» (20:45–20:52)

Измерил и хотел писать находкой, но это **ALK-3119** (+ пересекается с **ALK-3178**).
В отчёт не идёт. Оставляю измерение здесь — оно количественно уточняет чужой тикет.

Число рядом с названием вкладки — не сколько всего звонков этого типа, а сколько сейчас
подгружено. Одна и та же история читается по-разному в зависимости от того, сколько раз
нажали `Load more`:

```
свежая загрузка хаба      All· 20    Group meetings· 13    1-to-1·  7
после Load more ×1        All· 40    Group meetings· 28    1-to-1· 12
после Load more ×2        All· 60    Group meetings· 46    1-to-1· 14
после Load more ×3        All· 80    Group meetings· 65    1-to-1· 15
после Load more ×4        All· 92    Group meetings· 75    1-to-1· 17   ← Load more исчезла

правда из API одним запросом:
GET /api/v1/meetings/history?limit=100  →  92 записи, next_cursor отсутствует
```

Сам фильтр при этом честен: на вкладке `1-to-1` ровно столько строк, сколько написано
на вкладке (7, потом 12). То есть список и счётчик согласованы между собой — оба показывают
загруженную часть. Расходится с реальностью пара «счётчик ↔ история»: 7 против 17 при открытии.

**ALK-3119** описывает ровно этот механизм («Фильтр фактически ограничивается только первой
загруженной страницей»), но через пустой список; **ALK-3178** прямо упоминает, что «счётчик
фильтра 1-to-1 показывает неверное количество звонков». Обе открыты. Дублировать не буду.

Замечание для себя: нашёл я это поиском по слову «счётчик», а нашёлся дубликат по чтению
ALK-3119, в заголовке которого счётчика нет вообще. Ровно тот случай, ради которого
в CLAUDE.md написано дедуплицировать чтением, а не grep-ом.

### Meeting settings → device modes: часть работает, часть — уже открытый ALK-3453 (20:42–20:47)

Панель настроек звонка содержит `meeting-settings-mute-on-join` (переключатель) и две радиогруппы
`meeting-settings-mic-mode-*` и `meeting-settings-camera-mode-*` со значениями
`allowed_all | on_request | blocked_all`.

**`Mute participants on entry` работает — проверено на уровне медиа, не только кнопки:**

```
переключатель у ведущего   aria-checked false → true
PATCH /api/v1/meeting/<id>/settings   200
   {"mic_mode":"allowed_all","camera_mode":"allowed_all","screen_share_mode":"on_request",
    "chat_enabled":true,"reactions_enabled":true,"recording_enabled":true,"mute_on_join":true, …}

вошедший после этого участник:
   кнопка микрофона  label "Unmute", aria-pressed="true"
   локальная дорожка audio: {enabled: false, muted: false, readyState: "live"}
```

То есть человек действительно входит выключенным, а не только «выглядит» выключенным.

**`mic_mode: blocked_all` тоже отрабатывает** — кнопка микрофона у участника становится
`disabled: true`, нажатие ничего не меняет; возврат в `allowed_all` кнопку оживляет.

**А вот сообщить об этом участнику никто не сообщает — это ALK-3453**, уже открытый
и подтверждённый мной сегодня. Добавляю к нему то, чего в тикете нет:

```
опрос всего документа у участника, 45 с, начат ДО того как ведущий нажал Blocked:
   changes: 1  (единственное состояние t=0, старый тост про другого участника)
   ни тоста, ни баннера, ни строки — в момент запрета не появилось ничего

состояние самой кнопки после запрета:
   disabled            true
   aria-label          "Unmute"
   title               "Toggle mute (⌘D)"     ← подсказка про горячую клавишу осталась
   aria-describedby    отсутствует
   текста рядом        нет
   по всей странице    ни слова про запрет или про ведущего
панель участников у него же: "2 participants · hosted by <ведущий>" — тоже ничего
```

Отдельно стоит того, чтобы попасть в тикет: подсказка `title` продолжает обещать
`Toggle mute (⌘D)` на кнопке, которая не работает, — то есть человек не просто не знает
причину, ему ещё и предлагают горячую клавишу вместо неё. Смежные тикеты про то же самое
с другой стороны: ALK-2797 (запрет камеры показывается как проблема разрешений браузера),
ALK-2862, ALK-3136.

В отчёт не идёт — дубликат.

### Ложная находка, которую я чуть не написал: «Require approval ничего не делает» (21:00–21:15)

Чуть не оформил как High: ведущий включает `Require approval to join`, переключатель встаёт в
`true`, а сервер остаётся с `requires_approval: false`, и следующий вошедший попадает в звонок
напрямую. Проверил даже реальным кликом мыши (не JS `.click()`), на свежем звонке, с перехватом
**всех** не-GET запросов к `/api/v1/` — ноль запросов.

**Дефекта нет. Я не нажимал `Save`.**

Панель настроек звонка состоит из секций двух разных типов, и это не видно, пока не перечислишь
её кнопки целиком:

```
секции с автосохранением (PATCH /meeting/<id>/settings сразу по клику):
   Mute participants on entry, In-call chat, Reactions,
   mic-mode / camera-mode / screen-share-mode
секция MEETING — с кнопками Cancel и Save (PATCH /meeting/<id> только по Save):
   MEETING NAME, Password protection, Require approval to join, PARTICIPANT LIMIT
```

Проверка с нажатием `Save`:

```
PATCH /api/v1/meeting/<id>    {"requires_approval":true}
GET   /api/v1/meeting/<id>  → "requires_approval":true
```

Работает штатно.

**Почему я ошибся.** Двумя часами раньше `mute_on_join` и `mic_mode` уходили на сервер
мгновенно по клику — и я перенёс это на всю панель. То есть проверил «действие не долетело»
ровно так, как предписывает CLAUDE.md, но вывод из этого сделал неверный: отсутствие запроса
означало не «кнопка сломана», а «я не довёл сценарий до конца».
Правило на будущее для себя: прежде чем писать «настройка не сохраняется», перечислить кнопки
самой панели — наличие `Save`/`Cancel` меняет весь сценарий.

Здесь же нашлось объяснение более раннему расхождению (переключатель `true` при сервере `false`,
которое пережило закрытие и открытие панели): это была моя несохранённая правка, а не рассинхрон
продукта. Отдельно проверяю ниже, что делает `Cancel`.

**Смежное:** в той же панели сверху есть секция `WHO CAN JOIN` с радиокнопками
`Host approval` / `Anyone` (`meeting-settings-entry-manual_admit` / `-open`) — то есть вход
регулируется и радиокнопкой, и отдельным переключателем `Require approval to join`.
Это уже открытый **ALK-3140** («WHO CAN JOIN противоречит включённому Require approval to join»).

### Проверено рабочим — секция MEETING в настройках звонка (21:15–21:22)

Довёл сценарий до конца, включая `Save` и `Cancel`, реальными кликами мыши:

```
Save:
   переключатель Require approval  false → true, затем Save
   PATCH /api/v1/meeting/<id>   {"requires_approval":true}
   GET   /api/v1/meeting/<id> → "requires_approval":true
   следующий вошедший           → "Waiting for host approval", очередь у ведущего: [<он>]

Cancel:
   переключатель true → false (не сохраняя), затем Cancel
   интерфейс возвращается в true, сервер остаётся true          — откат корректный

закрытие панели кнопкой тулбара, а не Cancel:
   переключатель true → false (не сохраняя), панель закрыта, открыта снова
   интерфейс показывает true, сервер true                        — черновик отброшен
```

То есть несохранённая правка не «залипает» ни при `Cancel`, ни при закрытии панели.
Раннее наблюдение обратного было следствием моего клика по **скрытому** элементу при закрытой
панели — состояние, в которое пользователь попасть не может. Дефекта нет ни на одном из путей.

### Проверено рабочим — device mode `on_request` (21:47 по обеим сторонам)

```
у участника кнопка микрофона превращается в "Request microphone access"
   (title совпадает с подписью — в отличие от blocked_all, где title остаётся "Toggle mute (⌘D)")
нажатие → POST /api/v1/meeting/<id>/permission-requests   200
   {"id":"<pr>","meeting_id":"<id>","user_id":"<кто>","device":"mic","status":"pending", …}
кнопка становится "Requesting…", disabled

у ведущего в панели участников появляется строка
   "<имя> | Microphone · 08:47 PM"  с кнопками
   aria-label="Approve Microphone for <имя>" и "Reject Microphone for <имя>"
```

Обе половины потока на месте. Заметка на будущее: у бейджа на кнопке Participants
(`call-controls-waiting-count`) при этом `aria-label="1 waiting"` — хотя в этом звонке
`requires_approval: false` и `GET /waiting` пуст, а «единица» относится к заявке на микрофон.
Видимая подпись кнопки и её tooltip — "Participants", то есть неверное слово живёт только
в доступном имени бейджа. Это косметика/a11y, в отчёт не несу.

### Проверено рабочим — лимит участников и переименование живого звонка (21:10–21:15)

Звонок на троих, поле `meeting-settings-max-participants-input`, сохранение через `Save`.

```
лимит 2 при трёх участниках:
   PATCH /api/v1/meeting/<id>  {"name":"…","max_participants":2}
   тост: "The limit cannot be lower than the number of people already in the call."
   сервер не изменился — ни лимит, ни имя

лимит 3 при трёх участниках (точная граница):
   PATCH /api/v1/meeting/<id>  {"name":"…","max_participants":3}
   тост: "Meeting settings saved"
   сервер: "max_participants":3
```

Граница включающая (`лимит >= текущего числа`), формулировка отказа понятная и точная.

Заодно: **переименование живого звонка доходит до участников сразу** — сменил имя у ведущего,
у второго участника заголовок в звонке обновился без перезагрузки.

Мелочь, дефектом не считаю: секция сохраняется целиком, поэтому корректное новое имя,
отправленное вместе с недопустимым лимитом, откатывается вместе с ним. Для формы с одной
кнопкой `Save` это обычное поведение.

**Ещё одна моя ошибка, пойманная сразу:** первый заход набрал значения поверх старых
(`Meta+A`/`Control+A` в этих полях не выделяют содержимое), из-за чего имя стало
`QA limit boundary2`, а лимит `20`. Это ровно то, о чём предупреждает CLAUDE.md про композер:
не очищенное поле читается как дефект ввода. Чинится записью через нативный сеттер
`value` + событие `input`.

### Гостевой вариант BUG-9: у гостя всё работает — и это усиливает находку (21:10–21:20)

Тот же сценарий, но ожидает **гость** по ссылке-приглашению. Звонок `QA guest reload`,
`manual_admit`, гостевая ссылка видна всем. Окно 9238 очищено от кук (`ctx.clearCookies()`),
то есть заходит настоящий гость, а не залогиненный админ.

```
экран по ссылке:  "You are invited to “<звонок>” | Enter the name hosts will see before they
                   admit you | Your name | The host will need to approve your entry | Ask to join"
                   кнопка Ask to join disabled, пока не введено имя  — корректно
после Ask to join: "Waiting for approval | A host must approve your request.
                    Keep this page open. You will join automatically after approval."
                   кнопок нет вовсе  — это ALK-3529, уже подтверждён

GET …/waiting (у ведущего) → [{"participant_id":"<pid>","participant_type":"guest","name":"<имя>"}]

гость перезагружает страницу:
   экран гостя  → снова "Waiting for approval"          — состояние ВОССТАНОВЛЕНО
   GET …/waiting → тот же "<pid>"                        — запись живая, не призрак
   панель ведущего → "WAITING (1) | <имя>(Guest) | Admit | Deny"
   Admit → POST …/participants/<pid>/admit  204
   гость → /guest/meeting/<id>, "<имя> (you) | GUEST | Leave call"   — ВОШЁЛ автоматически
   ведущий → "2 in call"
```

**Итоговая таблица по BUG-9 — расходятся ровно два соседних пути:**

| кто перезагружается, ожидая входа | состояние ожидания | запись у ведущего | Admit |
|---|---|---|---|
| гость по ссылке-приглашению | восстанавливается | живая, тот же id | впускает |
| залогиненный участник | теряется («Ready to join?») | остаётся призраком | не впускает никого |

Добавил этот контраст в отчёт: в блок измерений BUG-9 и одной фразой в «Подтверждённую причину».
Он ценен тем, что снимает возражение «так задумано» — нужное поведение в продукте уже есть,
просто не на том пути. Отчёт переопубликован по прежнему адресу.

Побочно подтвердилось: гостю в звонке пишут «Screen sharing is not allowed for you in this call.» —
то есть для гостя запрет устройства **объясняется**, в отличие от залогиненного участника
при `blocked_all` (ALK-3453, где кнопка просто гаснет). Ещё один случай «нужный текст в продукте есть».

### Повторная проверка BUG-1 (High) на свежем состоянии — воспроизводится (21:14–21:17)

Прогнал заново целиком: звонок `manual_admit`, второй участник впущен, ведущий вышел через
`Leave call`, третий постучался.

```
третий            → "ALREADY IN ROOM · 1 | Waiting for host approval | You can join after a host…"
оставшийся в звонке участник:
   GET /api/v1/meeting/<id>/waiting   403
   {"code":403,"key":"REALTIME_ACCESS_DENIED","message":"access denied","trace_id":"<id>"}
   его панель участников: блока ожидающих нет, кнопок Admit — 0
вышедший ведущий, непрерывный опрос всего документа 110 с:
   changes: 1  (единственное изменение — чужой тост "…left the call" от прошлого звонка)
   колокольчик как был "Notifications, 4 unread", так и остался
```

Находка держится. **403 добавил в блок измерений BUG-1** — он доказывает то, что в тексте
находки уже утверждалось: перенять впуск оставшимся в звонке нельзя, очередь им просто не отдают.
Отчёт переопубликован.

### Систематическая сверка открытых тикетов сектора B (с 21:18)

Из 93 открытых багов по звонкам 39 уже разобраны за сессию. Иду по остальным, беру те,
что относятся к «вокруг звонка», и проверяю их конкретные утверждения на rc.5.

**ALK-2724 — не дубликат BUG-9, но соседний тикет.** Он про то, что модерационные ручки
(`kick`, `ban`, `mute`, `device-requests`) отвечают 204 на идентификатор, которому никто
не соответствует. В BUG-9 запись существует и впуск реально сохраняется (следующий `Join`
проходит мимо очереди), то есть «промаха по идентификатору» там нет; `admit` в списке ручек
тикета тоже не значится. Классом дефекта — «тихий успех» — они соседствуют, и при разборе
BUG-9 на ALK-2724 стоит сослаться. **ALK-2952** (отменённый вход остаётся в списке участников)
— тоже не дубликат: другая поверхность и другой момент.

**ALK-3454 «Переименование идущего звонка доходит не до всех» — НЕ воспроизводится.**
**ALK-2899 «Meeting name update не синхронизируется в Calls без повторного входа» — НЕ воспроизводится.**

Проверил обе одним прогоном, с соблюдением предусловия ALK-3454 (страница участника открыта
**до** создания звонка, вход кнопкой `Join` с карточки Live now, без перезагрузки страницы):

```
до переименования                          после (10 с, без перезагрузок)
хаб наблюдателя, не входившего в звонок     "Rename Beta": true    →  "Rename Gamma": true
   (страница открыта до создания звонка)    "Rename Gamma": false     "Rename Beta": false
участник со «старой» сессией, в звонке      "Rename Beta | 2:02"   →  "Rename Gamma | 2:19"
ведущий                                     —                         "Rename Gamma | 2:19"
PATCH /api/v1/meeting/<id>  {"name":"Rename Gamma"}  →  сервер: "Rename Gamma"
```

Все три поверхности обновились сами. Похоже, обе починены.

**Заметка о методе:** первый заход по этой же проверке был неинформативен, потому что я читал
`bodyText`, который снippet отдаёт **срезом**. Пришлось переписать проверку на поиск по всему
`document.body.innerText`. Это третий раз за вечер, когда срез едва не превратился в вывод;
завёл `b2-hubfind2.mjs`, который ищет по полному тексту и возвращает только булевы флаги.

### ALK-3054 воспроизводится, ALK-3272 — нет (21:23–21:26)

Обе про кратковременные состояния при перезагрузке, поэтому мерил кадрами: `addInitScript`
ставит таймер **до** скриптов страницы и пишет снимок `document.body.innerText` каждые 100 мс,
после загрузки снимки читаются. Одинаковые подряд идущие состояния схлопываются.

**ALK-3054 «Во время reload активного Call кратко показывается empty-state вместо Live now» —
воспроизводится.** Два прогона, наблюдатель на `/calls`, звонок идёт:

```
прогон 1   t=  156 мс  "Bring everyone together"  есть      карточки LIVE ещё нет
           t=  500 мс  empty-state исчез                     карточки LIVE ещё нет
           t=  602 мс  карточка LIVE появилась
прогон 2   t=  224 мс  "Bring everyone together"  есть
           t=  315 мс  empty-state исчез
           t=  504 мс  карточка LIVE появилась
```

То есть пустое состояние с кнопками `Start now` / `Schedule meeting` держится примерно
90–350 мс, и ещё около 200–300 мс список стоит без карточки идущего звонка.

Осторожно с регуляркой: на хабе **постоянно** присутствует карточка `Team meeting` с подписью
`Bring the team together`. Первый заход ловил именно её и давал ложное «empty-state есть всегда».
Признак пустого состояния — строка `Bring everyone together`.

**ALK-3272 «При второй перезагрузке во время Call временно отображается Directories» —
не воспроизводится.** Участник внутри звонка, две перезагрузки подряд:

```
перезагрузка 1   t=100 мс "…Calls Calendar Files Loading…"   Directories: нет
                 t=304 мс "…Calls Calendar Files QB"          Directories: нет
перезагрузка 2   t=138 мс "…Calls Calendar Files Loading…"    Directories: нет
                 t=401 мс "…Calendar Files 14 QB"             Directories: нет
```

Промежуточное состояние — честное `Loading…`. Оговорка: шаг выборки 100 мс, вспышку короче
этого я бы не поймал; но раздел Directories не появился ни в одном кадре обеих перезагрузок.

### ALK-3104 — не проверяется на rc.5: кнопки `Call again` в интерфейсе нет (21:30–21:36)

Тикет описывает «открыть детали завершённого звонка и нажать `Call again`». Такой кнопки
на этой сборке я не нашёл нигде. Перечислял **все** интерактивные элементы целиком, без срезов:

```
страница завершённого группового звонка /w/<ws>/calls/<id>   23 элемента, Call again — нет
   (Back to Calls | View all | Recording 0 | Chat 0 | Logs 6)
страница завершённого личного звонка    /w/<ws>/calls/<id>   23 элемента, Call again — нет
хаб /w/<ws>/calls                                            46 элементов, Call again — нет
наведение на строку истории (1.8 с)                          ничего нового не появилось
диалог с собеседником /w/<ws>/d/<dm>                         73 элемента, Call again — нет
   (в шапке есть "Start call"; строки звонков — "Outgoing call Duration 1:09",
    "Call declined", "You canceled the call", "No answer")
```

Формулирую именно так: **не «не воспроизводится», а «не проверяется как написано»** — поведения,
о котором говорит тикет, не с чем сравнивать, пока элемента нет. Возможно, он ещё не сделан
или называется иначе; уточнять надо у автора тикета.

Побочно это ещё одно подтверждение к BUG-7: в диалоге исходы личных звонков различаются
(`Call declined`, `You canceled the call`, `No answer`, `Outgoing call Duration …`),
тогда как строка группового звонка в разделе Calls выглядит одинаково при любом исходе.

**ALK-3491 («In a meeting» не сбрасывается) — из моего сектора не проверить.** Статуса
`In a meeting` нет ни в `GET /workspaces/<ws>/presence` (там только `online`/`last_seen_at`),
ни в Directories при двух людях в живом звонке. Сам тикет воспроизводится «под Super Admin»,
то есть на поверхности, которой у меня нет. Оставляю за скобками, не помечая ни так, ни этак.

**ALK-2939 — это Side Rooms, то есть сектор A.** Не мой.

### Состязательная вычитка собственных доказательств — три расхождения, все исправлены (21:28–21:40)

Коллега из соседнего сектора прислал приём: читать свой блок измерений как противник, который
продукта не видел. Не «верна ли находка», а **«увидит ли читатель в приведённом блоке ровно
то, что утверждает текст»**. Прогнал по всем девяти находкам механически: числа из прозы против
чисел из блока, имена полей в `<code>` против пастнутых ответов, ссылки на исходники.

**Ссылок на исходники в отчёте нет ни одной** — все «Подтверждённые причины» построены на
измерениях («ответ приходит без поля», «сервер уже отдаёт false»), а не на цитатах файлов.
Ловушка коллеги (путь и строки существуют, но по ним ничего не видно) на этот отчёт не ложится.

Нашлось три расхождения:

1. **Находка про снятый пароль:** проза говорила «за 75 секунд наблюдения ничего не изменилось»,
   а блок показывал только второй прогон с интервалом 1 мин 37 с. Число было настоящим —
   из первого прогона, которого в блоке не было. Добавил первый прогон в блок.
2. **Находка про лобби без ведущего:** проза говорила «перечислены все 26 полей ответа»,
   а блок показывал ответ обрезанным. Вписал в блок весь список ключей (26) и результат поиска
   по всему телу — теперь «поля об очереди нет» читатель проверяет глазами, а не верит на слово.
3. **Находка про застрявшую строку `Ringing…`:** проза утверждала, что отказ клиент обрабатывает,
   а истечение вызова — нет; в блоке контраста с отказом не было. **Переснял его заново:**

```
тот же диалог, приглашённый нажал Decline, диалог у ведущего открыт и не перезагружался
   до отказа        "<имя> Ringing…"   disabled=true
   через 5 с        "<имя>"            disabled=false     ← строка освободилась
   +10 / +15 / +20 с   то же самое, человека снова можно выбрать
против 299 замеров за 301 с в состоянии "Ringing… | disabled=true" при истечении вызова
```

Заодно проза говорила `declined` (имя состояния в API), а блок показывает кнопку `Decline`.
Привёл прозу к тому, что видно на экране.

**Ирония в тему вечера:** первая версия моего же проверочного скрипта печатала
`sorted(set(nums))[:18]` и «нашла» несуществующее расхождение в находке про `0:00 in call` —
срез в инструменте проверки срезов. Это четвёртый случай за вечер.

После правок: расхождений — 0 из 9, бюджет прозы у всех 102–152 слова, утечек тестовой
обвязки нет. Отчёт переопубликован по прежнему адресу.

### Второй проход дедупа: 184 бага в статусе BLOCKED + сегодняшние соседние отчёты (21:45–22:00)

Коллега из соседнего сектора указал на две дыры, обе подтвердились.

**Дыра 1 — BLOCKED.** `jira_cache.py list --open-bugs` реализует ровно фильтр из CLAUDE.md
(`Backlog, Ready, In Progress`), и `BLOCKED` в него не входит. Это ещё **184** открытых бага,
которых мои дедупы сегодня не видели. Прогнал все девять находок по ним.
Важно: **по BLOCKED нельзя снимать автоматически** — там лежит и живое, и уже починенное,
как и в TESTING. Поэтому по каждому совпадению проверял поведение, а не статус.

| находка | ближайший BLOCKED | вердикт |
|---|---|---|
| 1 лобби без ведущего | — | совпадений по существу нет |
| 2 призрак в очереди | **ALK-2248** | соседний и **живой**, но не дубликат — см. ниже |
| 3 строка `Ringing…` | — | нет |
| 4 пароль сняли, барьер остался | **ALK-1999** | предпосылка тикета на rc.5 не держится — см. ниже |
| 5 «private meetings only» | — | нет |
| 6 исходы в истории | ALK-1997 (DM Call назван Team meeting) | другое |
| 7 `0:00 in call` | **ALK-2247** | другое: там ложная ненулевая длительность у никогда не входившего в **завершённом** звонке, у меня ноль у реально присутствующих в **идущем** |
| 8 «Meeting ended for everyone» | ALK-1937 (Kick/Ban возвращает success) | другое |
| 9 гость по нерабочей ссылке | — | нет |

**ALK-2248 воспроизводится на rc.5 — измерил заодно.** Тикет: «Admit считает waiting participant
live до LiveKit connection; absent participant появляется в live roster, count и attendance».
Мой сценарий с призраком даёт ровно это:

```
до впуска призрака   GET /meeting/<id>/participants → только ведущий
                     meetings/active → "participant_count":1
POST …/admit         204
после                GET /meeting/<id>/participants →
   {"participants":[{…"name":"<ведущий>"…},
                    {"participant_id":"<pid>","type":"user","user_id":"<он>",
                     "livekit_identity":"<он>","joined_at":"2026-08-26T16:43:…"}]}
                     meetings/active → "participant_count":2
при этом сам человек всё это время на экране "READY TO JOIN?" и никуда не подключался
```

Любопытная деталь: **интерфейс ведущего в этот момент показывает «1 in call», а API — 2.**
UI считает подключённых к LiveKit, API — строки в базе. Расхождение — это и есть ALK-2248,
поэтому в мой отчёт оно не идёт (в блоке BUG-9 стоит именно «1 in call» из UI, чужого
доказательства я не занимал).

**Почему BUG-9 всё же остаётся.** ALK-2248 описывает, что происходит **после** впуска
(фантом в roster/count/attendance, блокировка входа в другой звонок). BUG-9 — про то, что
происходит **до**: заявка переживает исчезновение сессии заявителя, и ведущий действует по
очереди, которая врёт. Ни «Ожидаемый результат», ни «Проверка» ALK-2248 этого не покрывают
(там про live presence и cleanup после admission). Плюс вторая половина BUG-9 — что ни одна
из сторон не получает сигнала — в ALK-2248 не упоминается вовсе. Связь помечаю здесь;
в отчёт ссылку не ставлю, потому что смежные тикеты по CLAUDE.md живут в логе, а не в отчёте.

**ALK-1999 «API не поддерживает явное удаление Meeting password» — предпосылка не держится.**
В измерении BUG-4 сервер после снятия пароля отдаёт `"password_protected": false`, то есть
удаление проходит. Значит либо тикет починен, либо он про другой путь. Моя находка от этого
только чище: она именно про то, что клиент у стоящего перед барьером не обновляется,
а не про то, что пароль нельзя снять.

**Дыра 2 — соседние отчёты за сегодня.** Проверял директорию, а не `reports/README.md`
(индекс дописывается в конце прогона и в середине дня заведомо неполон):

```
aloqa-calls-inside-qa-2026-08-26-A.html   8 находок — всё «внутри звонка»:
   права админа встречи, синхронизация бан-листа, Side Rooms ×4, приглашение
   заблокированного, отзыв демонстрации экрана          → пересечений с моими нет
aloqa-incall-qa-2026-08-26-A.html         1 находка, Side Rooms  → нет
aloqa-calls-qa-2026-08-26-B.html          3 находки моей же линии за утро:
   гость без кнопок (ALK-3529), ведущий не видит свой пароль (ALK-3530),
   журнал без записей о входе (ALK-3531) → все три уже в Jira, с моими не совпадают
```

Пересечений нет ни с одним. Но третья находка утреннего отчёта — **про тот же экран Logs**,
что и мой сегодняшний кандидат (см. следующий раздел), и это надо учесть.

### BUG-10 [Low] [frontend] Журнал звонка никогда не отмечает остановку записи

Найдено приёмом коллеги: **сдиффить перечисление, которое отдаёт бэкенд, против того,
которое разбирает фронт.** В моём секторе такое перечисление одно и оно видимое —
типы событий, которые рендерит вкладка `Logs` на странице завершённого звонка.

**Бэкенд отдаёт** (`meeting_audit_event.go`, плюс сбор по коду без `*_test.go`):
`meeting.started/ended`, `breakout.started/ended`, `participant.joined/left/
connection_aborted/reconnected`, `recording.started/stop_requested/egress_started/
egress_updated/egress_ended`, `track.published/unpublished`.

**Фронт разбирает** (`callDetailLogActionLabel.ts`): `breakout.started/ended`,
`participant.joined/left`, `screen_share.*` и `track.*` только когда это демонстрация экрана,
`file.*`, `recording.started`, **`recording.stopped`**, `meeting.started/ended`.
Всё остальное — `return undefined`, и строка получает общую подпись категории.

**Диff даёт три вещи:**

1. `recording.stopped` фронт разбирает, а бэкенд **не отправляет никогда** —
   `grep -rn 'recording\.stopped' --include='*.go'` по всему бэкенду даёт **0**.
   Ветка мертва, заготовленная строка `Recording stopped` не может появиться. → **BUG-10**
2. `participant.reconnected` и `participant.connection_aborted` не разобраны и показываются
   как «Participant activity». В часовом звонке таких было 3.
3. `recording.egress_*` не разобраны → «Recording activity» ×4.

**Проверено в интерфейсе, а не только в исходниках** — два звонка с записью:

```
09:49:21 PM  Recording activity | By <ведущий>     ← recording.stop_requested
09:49:21 PM  Recording activity                    ← recording.egress_ended
09:49:21 PM  Recording activity                    ← recording.egress_updated
09:48:57 PM  Recording activity                    ← recording.egress_updated
09:48:54 PM  Recording started automatically       ← recording.started
09:48:54 PM  Recording activity                    ← recording.egress_started
"Recording stopped" — ни разу, ни в одном из двух прогонов
```

**Дедуп.** «Recording started automatically» при ручном запуске — это **ALK-2826**, открытый,
я его пометил смежным ещё утром; в отчёт не несу. `ALK-2989` (Failed Recording не отображается)
— другое. По экрану Logs также открыты `ALK-3531` (утренний отчёт моей же линии: журнал не
пишет запросы на вход/впуск/отказ) и в BLOCKED `ALK-2130` (egress виден как обычный участник)
и `ALK-2128` (гостевое событие ломает вкладку целиком). Ни один не про отсутствие остановки
записи. Остаток — только пункт 1, его и пишу.

Пункты 2 и 3 в отчёт не пошли: ALK-2128 прямо описывает «Participant activity / Media activity /
Recording activity» как штатный вид журнала, то есть общая подпись категории — задуманный
запасной вариант, а не дефект сам по себе. Мёртвая ветка — другое дело.

**Цитаты проверены построчно** (предупреждение коллеги: путь и диапазон могут существовать
и при этом ничего не показывать):

```
FE  callDetailLogActionLabel.ts:102-107   ← обе ветки записи, включая проверку recording.stopped
FE  en.ts:4756-4757                       ← обе строки, включая "Recording started automatically"
BE  meeting_audit_event.go:46-50          ← пять реально отправляемых типов, recording.stopped нет
```

Фронтовые — на развёрнутой сборке (`git show <sha>:<путь>`), бэкенд — на текущем клоне,
поскольку у него стенд-стемпа нет.

Итог отчёта: **1 High, 6 Medium, 3 Low** — 2 backend, 8 frontend.

### ALK-3445 воспроизводится: кнопка «Test audio» в лобби навсегда застревает (21:56)

Экран `READY TO JOIN?`, блок `DEVICE CHECK`, строка `Speakers`:

```
до нажатия                BUTTON "Test audio"   disabled=false
+0.7 с / 1.5 / 3 / 6 / 10 BUTTON "Playing…"     disabled=true   — на всех пяти замерах
```

Сигнал короткий, но состояние не сбрасывается ни через десять секунд. Повторно проверить
динамики нельзя — кнопки для этого больше нет. Ровно то, что описано в тикете.

### Обратный enum-diff: перепроверил BUG-10 и заодно поймал ошибку в собственной проверке

Коллега предложил гонять диф в обе стороны и больше доверять обратной («ветка во фронте,
producer'а в бэкенде нет») — у неё нет ложноположительного режима с задуманным запасным
вариантом. Прогнал обратную сторону по всем веткам маппера:

```
screen_share.started        producers: 0   ветка мёртвая, но безвредная —
screen_share.stopped        producers: 0   тот же вывод даёт ветка track.* c источником
                                           screen share (callDetailLogPresentation.ts:112-119)
recording.stopped           producers: 0   ← BUG-10, мёртвая и вредная: строки нет вообще
recording.stop_requested    producers: 2   реальный
recording.started           producers: 2   реальный
file_shared                 producers: 9   но все в file-service (шина files.events),
                                           а не среди audit-типов встречи — оставляю как «может быть»
```

**Ошибка в моей же проверке.** Первый прогон этого цикла считал совпадения шаблоном
`"$t"\|$t` — BSD grep на macOS не понимает `\|` как альтернативу, и счётчик выдал для
`recording.stopped` единицу, то есть **противоречие с моей собственной находкой**.
Перепроверил `grep -rF` по фиксированной строке: 0 без тестов и 0 вместе с тестами.
BUG-10 подтверждён дважды разными способами.

Это третий раз за вечер, когда инструмент проверки врёт убедительнее, чем измеряемое:
срез в перечислении кнопок, срез в аудит-скрипте, теперь альтернатива в grep.
Общее у всех трёх — я смотрел на **вывод инструмента**, а не на то, что инструмент делает.

### ALK-3375 воспроизводится наполовину — счётчик починен, название и кнопка нет (22:02–22:07)

Живой личный звонок между двумя аккаунтами, карточка `Live now` у **обоих** участников
(идентично у каждого):

```
API   /workspace/<ws>/meetings/active → "participant_count":2, top_participants: 2, "name":""
DOM   "LIVE | running 1 min | Team meeting | 2 participants · hosted by <ведущий> | QB | QA | Join"
                                                                                     ^^^^^^^^^^^^^
                                                                                     два аватара
```

Три утверждения тикета порознь:

| утверждение ALK-3375 | на rc.5 |
|---|---|
| «показывает 1 participant и только один аватар» | **не воспроизводится** — 2 participants, оба аватара |
| «название показано как Team meeting» | **воспроизводится** — у личного звонка на карточке `Team meeting` |
| «кнопка предлагает войти в звонок, в котором человек уже находится» | **воспроизводится** — `Join` есть у обоих участников |

То есть тикет частично починен, и это стоит в нём отметить: половина про счётчик и аватары
закрыта, половина про подпись и кнопку — жива. Своей находки здесь нет, это его остаток.

**Ловушка пути, из-за которой я сначала «не нашёл карточку».** Пока ты в звонке, попасть на
хаб можно только кликом по `Calls` в сайдбаре: полная загрузка `/w/<ws>/calls` возвращает
обратно на `/call/<id>` — это то самое восстановление в звонок после reload, которое я
проверял раньше. При клике по сайдбару маршрут остаётся `/call/<id>`, но под поверхностью
звонка дорисовывается хаб (длина текста страницы выросла с 253 до 2045 символов), и карточка
`Live now` становится доступна. Дефектом это не считаю — но снимать карточку надо именно так.

### ПОПРАВКА к моему же выводу: ALK-3104 проверяется и **воспроизводится** (22:05–22:12)

Выше я записал, что ALK-3104 «не проверяется как написано, кнопки `Call again` в интерфейсе нет».
**Это неверно, и ошибка моя.** Кнопка есть — она живёт на оверлее итогов звонка
(`data-testid="call-ended-overlay"`), который показывается сразу после завершения, рядом
с оценкой качества и кнопкой `Done`. Я же перечислял элементы на страницах, которые сам себе
назначил: страница завершённого звонка, хаб, наведение на строку истории, диалог. Перечисление
каждый раз было полным — неполным был **список мест**.

Проверил как следует. Звонок с нарочито нестандартными настройками, затем `End for everyone`,
затем `Call again` с оверлея итогов:

```
исходный звонок                      новый звонок по Call again
name                "QA settings src2"     "QA settings src2"    ← единственное, что перенеслось
is_private          true                   false
requires_approval   true                   false
mute_on_join        true                   false
mic_mode            "blocked_all"          "allowed_all"
screen_share_mode   "on_request"           "on_request"          (совпало, но это и есть значение по умолчанию)
```

`Call again` действительно создаёт новый звонок (новый id) и заводит внутрь сразу, перенося
только название. **Стоит отметить в тикете:** среди потерянных настроек — `is_private` и
`requires_approval`, то есть приватный звонок с одобрением входа превращается в публичный
и открытый, сохраняя прежнее имя. Тикет перечисляет доступ среди теряемых параметров,
но не проговаривает это следствие.

Своей находки здесь нет — это подтверждение открытого ALK-3104 на rc.5.

**Урок, третий раз за вечер в новой форме.** Первые два раза я обрезал перечисление
(`buttons[-6:]`, `sorted(...)[:18]`), здесь перечисление было полным, а обрезан оказался
**набор поверхностей**. Правило, которое из этого следует и которое я применяю дальше:
прежде чем писать «элемента нет», ответить, где он **должен** был бы жить по логике продукта,
а не только где я его искал. Для действий, относящихся к завершённому звонку, это оверлей
итогов — он показывается ровно один раз и исчезает, поэтому в перечислениях «постфактум»
его никогда не видно.

### ALK-2640 — не проверяется как написано

Тикет про то, что в канале при идущем Audio call кнопка Video call остаётся активной.
На rc.5 разделения на Audio/Video в канале нет вовсе: в шапке канала два элемента —
`Start call` и `Start or schedule call`, второй раскрывается в `Start now` / `Schedule call`.
Перечислены все кнопки шапки. Сравнивать не с чем, пока разделения нет.

### ALK-2952 и ALK-3324 не воспроизводятся на обычном пути (22:08–22:12)

Учёт участников на пути «экран входа → вход → выход» верен:

```
только ведущий в звонке              participant_count 1   [ведущий]
второй открыл экран "READY TO JOIN?" participant_count 1   [ведущий]     ← на экране входа не считается
второй нажал Join                    participant_count 2   [ведущий, он]
второй нажал Leave call              +3 с  → 1   [ведущий]
                                     +8 с  → 1
                                     +15 с → 1                            ← и не возвращается
```

То есть ни «пользователь на экране входа уже показан участником» (ALK-2952), ни «счётчик
не уменьшается после выхода» (ALK-3324) на этом пути не наблюдается.

**Но фантом в счётчике на rc.5 есть — просто с другим триггером.** Он воспроизводится
на пути ALK-2248: если впустить ожидающего, чья вкладка уже перезагрузилась, счётчик уходит
с 1 на 2, а человек остаётся на экране входа (измерение выше). То есть тикеты про счётчик
стоит перечитать с этим триггером: описанные в них пути чистые, а фантом приходит из впуска
неподключённого участника.

### Проверено рабочим — оценка звонка на оверлее итогов (22:14)

```
клик по звезде сразу отправляет   POST /api/v1/meeting/<id>/rating  {"rating":4,"submitted_at":"…"}
                                  → "rating":{"average":4,"count":1,"my_rating":4}
повторный клик по другой звезде   POST … {"rating":2}  200
                                  → {"average":2,"count":1,"my_rating":2}
```

То есть оценка отправляется сразу по клику (кнопки `Done` и `Close call summary` к её сохранению
отношения не имеют — промахнуться мимо «сохранить» нельзя), исправляется повторным кликом,
и `count` при исправлении не растёт, а среднее пересчитывается. Всё верно.

Ранее записанное про оценку остаётся в силе: агрегат сервер считает и отдаёт владельцу,
но нигде не показывает — это расширение чужой находки (отчёт 08-25-A), в мой отчёт не идёт.

### Ответ на прямой вопрос ALK-3592 и ALK-3489: звонок на бэкенде **не завершается** (22:18–22:26)

Оба тикета просят QA посмотреть статус встречи после того, как участник идущего звонка
откроет собственную invite-ссылку во второй вкладке того же браузера под тем же аккаунтом.
Воспроизвёл: звонок на двоих, ссылка из `Add to call`, вторая вкладка того же окна.

```
до                 status "active"   participant_count 2   [ведущий, второй]
после self-join    status "active"   ended_at отсутствует  participant_count 1   [второй]
второй участник    остаётся в звонке: tiles 1, "QA selfjoin | 0:54 | Excellent · 15ms"
```

**Ответ: нет, встреча в ended не переходит.** Статус остаётся `active`, `ended_at` не появляется,
второй участник из звонка не выпадает и «Call ended» не видит. То есть главный симптом
ALK-3489 («звонок мгновенно завершается для ВСЕХ») на rc.5 **не воспроизводится** — что
согласуется с его статусом REVIEW.

**Что происходит вместо этого** (обе вкладки открывшего, после того как всё устоялось):

```
вкладка 1 (была в звонке)   экран "READY TO JOIN?"    peer connections: 0
                            то есть её просто вынесло из звонка, без сообщения
вкладка 2 (открыла ссылку)  поверхность звонка есть   peer connection: 1, состояние
                            tiles 0 — ни одного участника, даже себя
                            conn "closed" / ice "closed" / signaling "closed"
                            outBytes 0, inBytes 0 — медиа нет вообще
                            из управления — только "Leave call"
сервер                      открывшего в звонке не считает вовсе
```

То есть человек смотрит на экран звонка, в котором никого нет и ничего не идёт, а его прежняя
вкладка молча вернулась на экран входа.

**Новой находки не пишу — это остаток ALK-3489, и он внутри его же критериев приёмки.**
Тикет прямо перечисляет два допустимых исхода: «новая вкладка переиспользует существующую
сессию и просто переносит звонок в неё» либо «новая вкладка получает понятное сообщение вида
„Вы уже участвуете в этом звонке в другой вкладке“ с кнопкой перехода». Текущее поведение —
ни то, ни другое, и ревьюер обязан это увидеть по собственной «Проверке» тикета.
Ровно тот разграничитель, который я применял к ALK-2248: **тикет владеет теми состояниями,
которые перечислены в его критериях приёмки** — здесь они перечислены, значит владеет.

Заодно снята ошибка в описании: `could not createOffer with closed peer connection` — не
причина, а следствие; peer connection второй вкладки действительно `closed`, я это померил.
### ALK-3211 не воспроизводится — список в Invite to the call не перерисовывается (22:22–22:26)

Тикет про «заметное визуальное мерцание, список будто перезагружается каждые несколько секунд».
Мерил не глазами: повесил `MutationObserver` на контейнер списка (тот предок, который содержит
ровно все 7 чекбоксов участников), с `childList`, `subtree` и `attributes`.

```
наблюдение 20 с   batches 0   added 0   removed 0   attrs 0
наблюдение 35 с   batches 0   added 0   removed 0   attrs 0
```

Ни одной мутации: ни перестроения списка, ни смены атрибутов (класс и style тоже попали бы
в `attrs`). Перерисовки нет.

Оговорка честная: наблюдатель ловит изменения DOM. Мерцание чисто из CSS-анимации он бы
не увидел — но и React-перерендер, дающий идентичный DOM, мерцания не даёт. Так что ноль
мутаций — достаточное основание сказать, что описанное в тикете поведение не наблюдается.

### Проверено рабочим — оверлей итогов звонка целиком (22:28–22:33)

Поверхность, которую я недооценил: она показывается один раз сразу после завершения звонка
и исчезает, поэтому в перечислениях «постфактум» её не видно (именно из-за этого я раньше
неверно записал, что кнопки `Call again` в продукте нет).

Полное содержимое у обеих сторон, звонок с двумя сообщениями в чате:

```
Call ended · <название> · 3m 28s
Duration            3m 28s
Recording           Unavailable
Chat history        2 messages
PARTICIPANTS        <ведущий> Left | Joined 10:16 PM · left 10:20 PM | 3:28 in call
                    <второй>  Left | Joined 10:19 PM · left 10:20 PM | 1:00 in call
AI SUMMARY          Coming soon
CALL CHAT HISTORY · 2 MESSAGES (SHOW MESSAGES)
RATE QUALITY        звёзды 1..5
Done | Call again | Close call summary
```

Всё сходится: длительность звонка, участие каждого по отдельности (3:28 и 1:00 — второй вошёл
позже), счётчик сообщений. Раскрытие чата работает:

```
клик по SHOW MESSAGES   → "[22:19]QA Alice: ping one | [22:19]QA Bob: ping two"
клик ещё раз            → сообщения скрыты
```

Автор и время у каждого сообщения на месте, у обеих сторон оверлей одинаковый.

**Мелочь, находкой не считаю:** подпись переключателя остаётся `SHOW MESSAGES` и в раскрытом
состоянии — то есть когда сообщения уже показаны, кнопка всё равно предлагает их показать.
Работает при этом в обе стороны. Косметика, и возможно артефакт `<details>/<summary>`,
где видимая подпись рисуется иначе, чем читается из `innerText`. Пишу как наблюдение.

### Границы поля названия звонка — измерено, в отчёт не несу (22:26–22:32)

Поле `meeting-settings-name-input` в секции MEETING (сохраняется по `Save`).

```
длина 1     Save активна   PATCH /api/v1/meeting/<id> {"name":"A"} → 200, тост "Meeting settings saved"
длина 40    Save активна
длина 64    Save активна
длина 128   Save активна        ← верхняя принимаемая
длина 129   Save НЕАКТИВНА      ← граница
длина 150   Save неактивна
длина 200   Save неактивна, ни одного запроса не уходит, на сервере прежнее имя
```

Граница ровная: 128 символов. Но когда она превышена, **не сообщается ничего**:

```
у поля      maxlength         отсутствует — набрать/вставить можно сколько угодно
            aria-invalid      "false"      — поле не помечается ошибочным
            aria-describedby  отсутствует
рядом       текста про максимум/счётчика символов нет
по странице ни "too long", ни "maximum", ни счётчика оставшихся символов
```

То есть человек вставляет длинное название, жмёт `Save` — кнопка мертва и молчит.
Та же семья, что ALK-3453 (кнопка гаснет без объяснения), но другой элемент.

**Почему не в отчёт:** повод редкий (название длиннее 128 символов), тяжесть Low,
а в отчёте уже три Low. На триаже такое обычно срезают. Оставляю измерение здесь,
чтобы следующая сессия не выводила заново.

**Смежное, тоже не несу:** название длиной 1 символ принимается. Есть семья открытых тикетов
про то же на других поверхностях — ALK-2139 (Rename Company принимает односимвольное),
ALK-3012 (переименование Workspace). Для звонка односимвольное имя выглядит безобидно,
в отличие от компании; отмечаю только связь.

### Проверено рабочим — спецсимволы в названии звонка (22:26–22:30)

Звонок с названием `A-B *c* #d <e> "f"` — дефис (тот самый, из-за которого тела сообщений
хранятся markdown-экранированными), звёздочки, решётка, угловые скобки, кавычки.
Прошёл по всем поверхностям сектора:

```
заголовок в звонке     A-B *c* #d <e> "f"      дословно
карточка Live now      A-B *c* #d <e> "f"      дословно
оверлей итогов         A-B *c* #d <e> "f"      дословно
строка истории в хабе  A-B *c* #d <e> "f"      дословно
```

Ни экранирования (`A\-B`), ни HTML-сущностей (`&lt;e&gt;`, `&quot;`), ни интерпретации
разметки. Дефекта нет. Проверял именно потому, что в этом приложении такая семья дефектов
уже есть в чате (служебное экранирование markdown видно в цитатах тредов) — на названиях
звонков этого не происходит.

### Проверено рабочим — запуск личного звонка из самого диалога (22:32)

Путь, который я раньше не проходил отдельно: не Directories → Call, а кнопка `Start call`
в шапке диалога.

```
POST /api/v1/meeting → 200  {"id":"<id>","channel_id":"<dm>","status":"pending", …}
у звонящего маршрут не меняется (остаётся /w/<ws>/d/<dm>),
   появляется фиксированный оверлей: "<кому> | Ringing… | Leave call"
у вызываемого        incoming-call-banner с -accept и -decline
отмена звонящим      оверлей у него исчезает, баннер у вызываемого тоже
```

Поведение то же, что и при вызове из Directories. Отдельного дефекта на этом пути нет.

### Проверено рабочим — замена гостевой ссылки, пока гость ждёт одобрения (22:29–22:36)

Это то же семейство, что BUG-1 (ведущий вышел) и BUG-4 (сняли пароль): ведущий меняет условия,
пока человек стоит перед барьером. Здесь — заменяет гостевую ссылку.

```
гость вошёл по ссылке №1, стоит в очереди   participant_id N4OX0…, type "guest"
ведущий жмёт Create new link
   POST /api/v1/meeting/<id>/guest-links/  200  {"id":"GL4OX…","token":"f8a32ee1…"}
   ссылка в диалоге сменилась: …0b48746dcc04 → …615b456bdc79

непрерывный опрос экрана гостя, начатый ДО замены:
   t=0 … t=52   "Waiting for approval…" — на замене ссылки (≈t=10) не изменилось ничего
очередь у ведущего  тот же participant_id, кнопки Admit/Deny на месте
ведущий жмёт Admit  → POST …/participants/<pid>/admit  204
   t=52.1  экран ожидания закончился
   t=52.7  гость в звонке: /guest/meeting/<id>, "<имя> (you) | GUEST | Leave call"
   у ведущего "2 in call"
```

Замена ссылки закрывает вход **новым** гостям и не трогает того, кто уже ждёт: заявка живая,
впуск работает, гость попадает внутрь. Дефекта нет.

Ещё один контраст к BUG-9: это уже четвёртое изменение состояния «на лету», которое приложение
отрабатывает верно (снятие требования одобрения, перезагрузка ведущего, явная отмена заявки,
замена гостевой ссылки). Не отрабатывает ровно одно — исчезновение сессии самого ожидающего.

### BUG-11 [Medium] [frontend] Запущенная встреча остаётся в списке запланированных с мёртвой кнопкой Start call

Прогнан дважды, на двух разных встречах.

```
хаб сразу после запуска запланированной встречи, БЕЗ перезагрузки — две карточки одной встречи
  "LIVE | running 0 min | <название> | 1 participant · hosted by <ведущий>"   [Join]
  "11:00 PM | 30 min | <название> | 0 participants · Hosted by <ведущий>"     [Start call]

нажатие Start call на второй карточке (оба прогона одинаково)
  запросов к /api/v1/ — НИ ОДНОГО
  нового звонка нет: активная встреча по-прежнему одна
  единственный эффект — переход на /w/<ws>/calls

устойчивость: та же карточка через 30 / 60 / 90 с — по-прежнему [Start call]
после перезагрузки страницы — та же карточка показывает [Join]
```

Граница ответственности: перезагрузка приводит карточку в верное состояние, значит сервер
знает о запуске, расходится только открытый клиент. В отчёт — Medium, frontend.

**Дедуп:** прочитаны открытые и BLOCKED по словам scheduled/запланир/Live now/hub.
Ближайшие — ALK-2237 и ALK-1998 (Live now не обновляет participant count), но они про
счётчик на **живой** карточке, а не про то, что карточка запланированной встречи не узнаёт
о запуске; ALK-1711 (завершённый звонок остаётся в Live now) — обратный случай. Дубликата нет.

**Осознанно не вошло в находку:** на карточке запланированной встречи написано «0 participants»
и после перезагрузки, когда в звонке уже есть человек. Возможно, это число принявших
приглашение, а не участников звонка — утверждать не берусь, поэтому в отчёт не несу.

### ALK-2232 из моего сектора не проверить (23:02)

Тикет: ранний `Start` запланированной встречи (до разрешённого окна) возвращает 500
вместо типизированной ошибки. Чтобы попасть в этот путь из интерфейса, нужна карточка
встречи, назначенной сильно вперёд. Завёл такую на три дня вперёд — **на хабе Calls она
не показывается вовсе**, то есть кнопки `Start call` для неё в моём секторе нет.

Запуск за 22 минуты до назначенного времени, наоборот, проходит штатно:
`POST /api/v1/calendar/meetings/<id>/start` → **200**, звонок создаётся. Значит окно
запуска открыто заранее, и «ранний» в смысле тикета — это раньше этого окна.

Путь остаётся у календаря (сектор E) — тикет и помечен `[BE][CALENDAR]`.

### Гостевые слоты: страница приглашения слот не занимает (22:50)

Готовился проверить ALK-2721 (четвёртая гостевая сессия в одной куки-банке вытесняет первую,
и вытесненная вкладка сообщает неправду). Первый шаг дал полезный отрицательный результат:

```
одна куки-банка, куки очищены, ссылка открыта в 4 вкладках подряд
  после 1-й вкладки   куки aloqa_guest_s_* : []
  после 2-й                                  []
  после 3-й                                  []
  после 4-й                                  []
вкладка 1 как оставили      "You are invited to … | Your name | Join call"
вкладка 1 после reload      то же самое
```

То есть **сам по себе экран приглашения слот не занимает** — он выдаётся при фактическом входе,
как и написано в репро тикета («sequential guest joins»). Вытеснения в этом виде не происходит,
вкладка 1 остаётся рабочей.

Полную проверку вытеснения (4 реальных входа гостями) отложил, чтобы не менять состав
идущего длинного звонка; вернусь к ней, когда завершу его.

### Отчёт переупорядочен по важности (22:48)

Находки добавлялись по мере появления, и Low оказались вперемешку с Medium. Пересобрал порядок
и в сводной таблице, и в самих статьях: High → все Medium → все Low, внутри — прежний порядок.
Обе Low про журнал звонка теперь стоят рядом, что читается лучше.

Проверки после пересборки: `<article>` 11/11 открыто-закрыто, `<div>` 77/77, `<pre>` 11 пар,
у всех одиннадцати на месте все пять разделов, расхождений «число в прозе без числа в блоке» — 0,
утечек обвязки нет. Опубликовано по прежнему адресу.

### Сводная таблица перепроверки — дополнена вечерними находками (22:50)

Таблица выше составлялась до появления BUG-9, BUG-10 и BUG-11. Дополняю её и заодно указываю
порядок в опубликованном отчёте (после пересборки по важности).

| в отчёте | находка | сколько раз | чем подтверждено дополнительно |
|---|---|---|---|
| 1 High | лобби без ведущего | 4 | поллер уведомлений 150 с и повторно 110 с; полное перечисление 26 ключей `meetings/active`; `403 REALTIME_ACCESS_DENIED` у оставшегося в звонке |
| 2 Medium | призрак в очереди после перезагрузки ожидающего | 2 | контроль без перезагрузки (впускает сразу); зеркало с перезагрузкой ведущего; явная отмена заявки; гостевой путь — везде верно |
| 3 Medium | строка `Ringing…` | 5 | 299 замеров за 301 с; свежий контраст с `Decline` (освобождается за 5 с) |
| 4 Medium | пароль сняли, барьер остался | 2 | поллер 75 с (прогон 1) и 1 мин 37 с (прогон 2); вход по произвольной строке |
| 5 Medium | «private meetings only» | 2 | A/B на двух звонках |
| 6 Medium | исходы в истории приглашённого | 3 | три исхода — одна строка; контраст с диалогом, где исходы различаются |
| 7 Medium | тупик у гостя по нерабочей ссылке | 3 | три разных способа сделать ссылку нерабочей |
| 8 Medium | запущенная встреча с мёртвым `Start call` | 2 | две разные встречи; ноль запросов при нажатии; устойчиво 90 с; чинится перезагрузкой |
| 9 Low | `0:00 in call` у идущего звонка | 4 | два звонка по два замера; контраст с завершённым, где участие считается посекундно |
| 10 Low | «Meeting ended for everyone» | 2 | сырое событие `actor_user_id: null` оба раза |
| 11 Low | нет строки об остановке записи | 2 | два звонка с записью; в бэкенде `recording.stopped` — 0 совпадений двумя разными grep |

Ни одна находка при перепроверке не отвалилась. Область (`backend`/`frontend`) не менялась
ни у одной. Правки формулировок за вечер: три по итогам состязательной вычитки доказательств
(см. соответствующий раздел) и одна в «Проверке» BUG-9.

### Вычитка прозы двух свежих находок — три преувеличения убраны (22:55)

Перечитал BUG-10 и BUG-11 как читатель, не видевший продукта. Три места утверждали чуть
больше, чем я измерил:

1. BUG-11: «из двух кнопок работает только одна, причём какая — по виду не понять».
   Неправда: подписи разные (`Join` на живой карточке, `Start call` на запланированной),
   различить их можно. Нельзя понять другое — что `Start call` мёртвая. Стало:
   «кнопка на второй карточке выглядит обычной, но не делает ничего».
2. BUG-10: «не узнает, когда запись закончилась **и по чьему действию**». Тоже неправда:
   у строки `recording.stop_requested` актор показан («Recording activity | By <ведущий>»),
   не показано именно действие. Убрал «и по чьему действию».
3. BUG-10, «Ожидаемый результат» повторял ту же ошибку про актора — переписал на сравнение
   со строками о начале записи и о входах-выходах.

Все три — того же типа, что ловит состязательная вычитка: не выдумка, а формулировка чуть
шире измеренного. После правок бюджет прозы 102–152 слова, расхождений «число в прозе без
числа в блоке» — 0 из 11.

### У BUG-6 появилась настоящая подтверждённая причина (23:00–23:10)

Прогнал enum-diff по `end_reason` — единственному, кроме типов событий, перечислению в моём
секторе, которое видно на экране. И он вывел прямо на механизм моей же находки.

**Что разбирает клиент** (`apps/web/src/features/calls/utils/callOutcome.ts:39–50`,
проверено построчно на развёрнутой сборке):

```
resolveRecentCallOutcome:
   если звонок не завершён            → подписи нет
   если call.missed_for_viewer        → "No answer"
   иначе по call.end_reason           → all_left | cancelled | declined | failed |
                                         host_ended | missed | timed_out
   если end_reason пуст               → общее "Ended"
```

**Что реально приходит** (`GET /api/v1/meetings/history?limit=100`, история одного аккаунта):

```
всего строк                100
  групповые звонки          83   end_reason отсутствует во ВСЕХ 83
  личные звонки             17   cancelled ×2, timed_out ×7, отсутствует ×8
missed_for_viewer           не приходит НИ В ОДНОЙ из 100 строк
```

Бэкенд объявляет всего три значения (`realtime-service/internal/core/domain/meeting_events.go`:
`declined`, `cancelled`, `timed_out`) — и все три про личные звонки; фронт готов разобрать семь.

**Отсюда BUG-6 ровно и следует:** у группового звонка оба поля отсутствуют, поэтому строка
всегда падает в общее «Ended», что бы приглашённый ни сделал. Заменил прежнюю формулировку
причины (она была выводом из поведения) на этот механизм — с цитатой на строки и с подсчётом
в блоке измерений, чтобы читатель мог проверить «83 из 83» глазами.

**Осторожность, которая едва не стоила ошибки.** Первый замер я сделал на истории аккаунта,
где все звонки завершились штатно, — и увидел, что `end_reason` нет ни в одной строке.
Чуть не записал «поле в ответе не приходит вовсе». Но у поля в proto стоит `omitempty`,
и на другом аккаунте оно нашлось в 9 строках из 100. Правильное утверждение — не «поля нет»,
а «поля нет у групповых звонков», и оно требует разделения выборки по типу звонка.
Объединение ключей по выборке, в которой нужного случая просто нет, доказывает ровно ничего.

### ALK-2721 воспроизводится наполовину — худшая половина починена (23:05–23:12)

Четыре гостевых входа подряд в одной куки-банке, звонок с открытым входом:

```
вход 1   куки: [aloqa_guest_s_1]                          в звонке как "Guest 1 (you)"
вход 2   куки: [aloqa_guest_s_1, aloqa_guest_s_2]         "Guest 2 (you)"
вход 3   куки: [aloqa_guest_s_0, _1, _2]                  "Guest 3 (you)"   ← слоты заполнены
вход 4   куки: [aloqa_guest_s_0, _1, _2]                  "Guest 4 (you)"   ← слотов всё ещё три
```

Три слота, четвёртый вход вытесняет — ровно как описано в тикете и в CLAUDE.md.

**Первый симптом воспроизводится:**

```
вкладка 1, оставленная как есть:
   "Your guest session expired | Open the invite link again to rejoin the meeting."
```

Сессия не истекала — её слот занял четвёртый гость. Текст, как и сказано в тикете, неверный.

**Второй симптом — тот, который тикет называет худшим, — НЕ воспроизводится:**

```
та же вкладка 1 после перезагрузки:
   "QA guest slots | 1:35 | Excellent · 7ms | G4 | Guest 4 (you) | GUEST | … | Leave call"
```

Никакого «This meeting session has ended / The host ended this meeting». Вкладка подхватывает
актуальную гостевую сессию и показывает идущий звонок. То есть ложное «ведущий завершил
встречу», из-за которого гость уходил с уверенностью, что звонка больше нет, на rc.5 ушло.
Осталась только неточная формулировка про «истекшую сессию».

Стоит отметить в тикете: приоритет можно снижать — остаток косметический, а не вводящий
в заблуждение о судьбе встречи.

### Повторный дедуп перед закрытием прогона (23:10)

CLAUDE.md требует пересинхронизировать зеркало ещё раз перед отчётом — коллеги заводят тикеты
во время сессии. Сделал:

```
jira_cache.py sync  →  delta +3, всего 3604
тикетов СОЗДАНО сегодня (2026-08-26): 0
тикетов затронуто сегодня: 190 — все это смены статуса/полей у существующих
```

Новых тикетов, с которыми могли бы столкнуться мои одиннадцать находок, за сессию не появилось.

Отдельно сверил: **ни один из двадцати тикетов, которые я подтвердил как воспроизводящиеся,
не закрыт** (ни TESTING, ни Done, ни REVIEW). То есть противоречия между моими подтверждениями
и трекером нет.

Попутное наблюдение: сегодня в TESTING уехал большой пакет — в том числе про звонки
(ALK-3350, ALK-3351, ALK-3353, ALK-3356, ALK-3363, ALK-3408, ALK-3409, ALK-3411 и другие).
Развёрнутая сборка при этом всю сессию одна и та же, `v0-61-0-rc-5-c4b5386b4a3a`. Значит эти
исправления на стенде ещё не проверить, и следующей сессии стоит начать с чтения стемпа:
если он сменится, половину сегодняшних «воспроизводится» надо будет переснять.

### Цитаты на исходники проверены против ЧУЖОГО дерева — одну пришлось переделать (23:15)

Коллега предупреждал: путь и диапазон могут существовать и при этом ничего не показывать.
Есть более коварный вариант: **диапазон верен в моём дереве и указывает на другое в дереве
читателя.** Проверил оба клона.

```
aloqa-frontend   ветка bugfix/ALK-3389-early-guest-landing
                 HEAD c87e4506b7e6 — это 33 коммита ПОЗАДИ развёрнутого c4b5386b4a3a
                 (то есть "git log <deployed>..HEAD" даёт 0 — считать нечего)
aloqa-backend    ветка dev, HEAD 44c1b5c49d15 — 36 позади / 20 впереди origin/main
```

**Фронтовые цитаты в порядке:** я читал их через `git show <deployed-sha>:<путь>`, то есть
с развёрнутого коммита, а не из рабочего дерева. Проверено построчно.

**Бэкендовая цитата была негодной.** Я сослался на
`realtime-service/internal/core/domain/meeting_audit_event.go:46–50` из рабочего дерева
ветки `dev`. На `origin/main` по этим строкам лежит объявление структуры, а констант
`MeetingEventTypeRecording*` там **нет вообще** — они только в `dev`. Разработчик, открывший
main, увидел бы поля структуры и никакого дефекта.

Существо находки от этого не меняется: `recording.stopped` даёт **0 совпадений и на `dev`,
и на `origin/main`**, а какие типы приходят на самом деле, я измерил на живом звонке.
Поэтому переписал причину так, чтобы она держалась без бэкендовой цитаты: перечисление
реально пришедших типов теперь ссылается на блок измерений, а не на строки чужой ветки.
Заодно назвал функции по имени (`getCallDetailLogActionLabel`, `resolveRecentCallOutcome`) —
имя переживает дрейф номеров строк, номера оставил как подсказку с пометкой «на развёрнутой сборке».

**Правило, которое из этого следует:** у бэкенда стенд-стемпа нет, значит и надёжной точки
для цитаты нет — ссылаться на его строки нельзя, можно только на измеренное поведение
и на факт «строки X в исходниках нет». У фронта стемп есть, и цитировать надо через него,
а не через рабочее дерево, которое может стоять где угодно.

### Хозяйственная проверка следа сессии (23:14)

```
snip/: моих файлов 254, все с префиксом b2- — ни одного вне полосы
       (остальное сегодняшнее — соседние секторы: c-s2- 594, e-p2- 430, a-nb- 217, d2- …)
общие хелперы lib.mjs / api.mjs / login.mjs / watch.mjs / tabs.mjs — мной не тронуты
вне snip/ мной изменены только: logs/AIRION-QA-2026-08-26-B-calls-around.md,
       reports/aloqa-calls-around-qa-2026-08-26-B.html, scripts/callrig/b2-ensure.sh
```

`reports/README.md` сегодня уже правили другие сессии (последняя правка 23:10, девять строк
за сегодня, включая утренний проход моей же полосы). Свою строку добавлю **в конце прогона
и одной операцией**, перечитав файл непосредственно перед записью — иначе строка соседа,
дописанная в промежутке, потеряется. Формат таблицы: `| файл | artifact URL | описание сессии
с разбивкой по важности |`.

### BUG-11 — третий прогон, воспроизводится идентично (23:23)

Третья запланированная встреча, свежая перезагрузка страницы перед началом:

```
до запуска               [Start call]   "11:30 PM | 30 min | QA sched third | 0 participants"
после запуска, без reload
   [Join]        "LIVE | running 0 min | QA sched third | 1 participant · hosted by <ведущий>"
   [Start call]  "11:30 PM | 30 min | QA sched third | 0 participants · Hosted by <ведущий>"
```

Итого три прогона на трёх разных встречах — одинаково. В сводной таблице перепроверки
у BUG-11 теперь 3, а не 2.

### Проверено рабочим — оставшиеся настройки встречи: чат и реакции (23:36–23:44)

Проверял внутри идущего длинного звонка, не прерывая его: ведущий меняет настройку,
смотрим на второго участника. Обе настройки после проверки возвращены в исходное.

**`chat_enabled: false` — работает и, в отличие от микрофона, объясняет себя:**

```
до            кнопка "Call chat" активна; композер работает, Send активен, сообщение доходит
PATCH /meeting/<id>/settings  →  200, "chat_enabled":false
после         кнопка "Call chat" по-прежнему открывается (панель читать можно)
              textarea  disabled=true
              Send      disabled=true
              рядом с композером: "Chat is disabled for this call"
              отправка не проходит: сообщение не появляется
после возврата  Send активен, сообщение доходит
```

**`reactions_enabled: false` — работает иначе, но тоже внятно:**

```
до       кнопка "Send reaction" присутствует и активна
после    кнопки нет вовсе (present: false) — управление убрано, а не оставлено мёртвым
после возврата  кнопка снова на месте
```

**Это важный контраст к ALK-3453.** Три способа закрыть возможность в одном и том же продукте:

| настройка | что видит участник |
|---|---|
| `chat_enabled: false` | кнопка остаётся, поле недоступно, **написано «Chat is disabled for this call»** |
| `reactions_enabled: false` | кнопка **исчезает** — мёртвого управления не остаётся |
| `mic_mode: blocked_all` | кнопка остаётся, `disabled`, **без единого слова**, а подсказка ещё и обещает `Toggle mute (⌘D)` |

То есть нужное поведение в продукте есть, причём в двух разных исполнениях, и только
микрофон молчит. Это стоит написать в ALK-3453: не «добавьте сообщение», а «сделайте как
у чата или как у реакций».

Первый заход дал ложную тревогу: сразу после выключения чата кнопка `Call chat` у участника
осталась активной, и я чуть не записал «настройка не доезжает». Но кнопка открывает панель,
а не отправляет — а вот `Send` и сама textarea действительно недоступны. Проверять надо
возможность, а не наличие кнопки.

### Ответ на переданный из сектора A вопрос про PARTICIPANT LIMIT (23:38–23:44)

Коллеги из соседнего сектора сообщили, что сохранение лимита ниже текущего числа участников
у них выглядело «молчаливым», и просили перепроверить: та же самая фраза могла быть статической
подсказкой у поля, а не отрисованной ошибкой.

**Проверено: ошибка отрисовывается, молчания нет.** Искал строку по **всему** документу
до попытки и после:

```
до попытки сохранить лимит ниже текущего        совпадений: 0  (строки в документе НЕТ)
после                                            ровно один элемент:
   <p role="alert" data-testid="meeting-settings-server-error"
      class="text-body-secondary text-red">   visible: true
   "The limit cannot be lower than the number of people already in the call."
```

То есть это не подсказка у поля: до неудачной попытки строки не существует, после она
появляется в отдельном элементе с `role="alert"`, красным текстом и видима. Доставлена,
переведена и показана.

**Второй их вопрос — блокирует ли лимит вход — да, и внятно.** Поставил лимит равным текущему
числу (2 при двух участниках), третий попробовал войти:

```
PATCH /meeting/<id>  {"max_participants":2}  → "Meeting settings saved", сервер: 2
третий жмёт Join →
   "Call is full | This call has reached its participant limit. Try again in a moment.
    | Back to workspace"
```

**Отсюда следствие, которое стоит передать им:** экран «Call is full» доверяет тому же
счётчику, который у них раздут мёртвыми гостевыми строками. Значит их находка не косметическая:
если счётчик считает ушедших гостей, этот экран скажет живым людям, что мест нет, когда они есть.
Проверить это я не могу — у меня в звонке призраков нет, а построить их означало бы
воспроизводить их сценарий целиком.

Лимит вернул в 0 (без ограничения), длинный звонок не пострадал.

### Попытка воспроизвести «призрачную» гостевую строку — неинформативна, не повторяю (23:50–23:58)

Сектор A установил, что гостевая строка переживает **аварийное** исчезновение контекста
(в отличие от чистого выхода и в отличие от такого же исчезновения у участника-члена).
Мой более ранний тест закрывал вкладки штатно — и там строки убирались сразу, так что
я решил попробовать настоящий сбой рендерера через CDP `Page.crash`.

Прогон **завис и был снят по таймауту 6 мин 40 с** — ожидаемо: крах рендерера рвёт ту самую
CDP-сессию, через которую снippet и работает, поэтому вернуть результат он уже не может.
После снятия:

```
длинный звонок       не пострадал: tiles 2, 51:25, "Excellent · 5ms"
GET /meeting/<id>/participants   ровно две строки: оба реальных участника
meetings/active                  "participant_count":2
```

Призрачной строки нет — но **успел ли гость вообще войти до краха, я не знаю**: вывод снippet'а
до таймаута не дошёл. То есть это не отрицательный результат, а отсутствие результата.
Повторять не буду по трём причинам: инструмент рвёт сам себя, механизм уже полностью
закрыт тремя контролями соседнего сектора, и главное — намеренная поломка браузера посреди
звонка это стенд под timing-зависимое состояние, а не пользовательский путь.

**Что остаётся моей измеренной половиной** (и она не меняется): экран «Call is full»
принимает решение по серверному счётчику — показано тем, что при лимите, равном числу строк
в `/participants`, реальный третий получает отказ. Механизм утечки — за сектором A.

Аккаунт admin в окне 9238 перелогинен (куки очищались под гостя).

### Дополнение: гость + крах рендерера БЕЗ side room — строка убирается (00:00–00:08)

Разбирая последствия зависшего прогона, вытащил из него полезное. По CDP-целям окна видно,
что гость **успел войти**: одна из вкладок стояла на `https://…/guest/meeting/<id>` —
это внутренний маршрут гостя в звонке, а не экран приглашения. Проба этой вкладки не отвечает,
то есть `Page.crash` действительно сработал.

```
вкладка гостя           /guest/meeting/<id>   — значит вошёл
проба вкладки           не отвечает            — значит рендерер мёртв
GET /meeting/<id>/participants (≈25 мин спустя)
                        ровно две строки: оба реальных участника
meetings/active         "participant_count":2
```

**В моём сценарии не было side room.** У соседнего сектора утечка воспроизводится на пути
«гость вошёл → был впущен → зашёл в side room → контекст уничтожен», и их строки живут
больше 104 минут. У меня тот же класс события (гость + аварийная смерть вкладки, без чистого
`Leave`) строку не оставил.

Чего я **не** знаю и не утверждаю: точных отметок входа и краха (снippet умер, не вернув их)
и, следовательно, за сколько именно строка убралась. Утверждаю только конечное состояние:
через ~25 минут призрака нет.

Если это устоит, оно сужает поиск: ломается не «гость + обрыв», а именно ветка с side room.
Передал соседям — у них есть контроль на члена и на чистый выход, моя проба добавляет
четвёртую клетку: гость + обрыв **без** side room.

Мёртвая вкладка закрыта через CDP `/json/close/<id>` (Playwright её закрыть не мог — сессия
к странице мертва). Окно 9238 перелогинено, все три браузера на своих аккаунтах,
длинный звонок не пострадал: 55:44, tiles 2.

### Длинный звонок `QA overnight 2` — часовая отметка (00:05)

```
00:05:23   оба участника: tiles 2, таймер 59:11, "Excellent · 5ms" / "Excellent · 7ms"
           сборка на стенде та же: v0-61-0-rc-5-c4b5386b4a3a
```

Это третий длинный прогон за сессию (1:03:18 с измерением медиа, 31 мин, теперь ~1 ч).
Ни в одном не было ни деградации качества, ни переподключений. Замер медиа на двухчасовой
отметке стоит фоновой задачей.

### Перепроверка BUG-7 на длинном звонке — самый яркий случай (00:26)

Открыл страницу **идущего** звонка `QA overnight 2` в тот момент, когда он шёл 1 час 17 минут:

```
счётчик внутри звонка          1:17:16
страница звонка, View all →
   "<участник 1> | Current | Joined 11:06 PM · left — | 0:00 in call"
   "<участник 2> | Current | Joined 11:06 PM · left — | 0:00 in call"
```

Час семнадцать показаны как `0:00`. Это самая наглядная иллюстрация BUG-7 за сессию —
прежние замеры были на 3:49 и 2:11. Время входа («11:06 PM») и пометка `Current` при этом верные,
то есть ломается именно вычисление длительности у тех, кто в звонке сейчас.

Добавил этот случай в блок измерений BUG-7 в файле отчёта.

**⚠ Публикация не прошла:** Artifact вернул `429 frame_daily_push_cap_reached` — исчерпан
суточный лимит публикаций. Поэтому:

- **опубликованный отчёт по адресу
  https://claude.ai/code/artifact/5fc9fa61-e210-4f73-aa31-58ae1e0125e9
  полон и корректен** — в нём все 11 находок, порядок по важности, обновлённая причина BUG-6,
  переделанные цитаты, вычитанные формулировки. Последняя удачная публикация — `citations-branch-robust`;
- **в локальном файле на один замер больше**, чем в опубликованной версии: случай 1:17:16 в BUG-7.

Повторю публикацию позже в прогоне; если лимит не снимется до конца, разница ровно в этом
одном блоке измерений, и она зафиксирована здесь.

### BUG-10 — третий прогон, воспроизводится идентично (00:46)

Третий звонок с записью, отдельный аккаунт-ведущий:

```
события записи из API:  recording.started, recording.egress_started,
                        recording.egress_updated ×2, recording.stop_requested, recording.egress_ended
вкладка Logs:
  12:46:53 AM  Recording activity | By <ведущий>
  12:46:53 AM  Recording activity
  12:46:53 AM  Recording activity
  12:46:31 AM  Recording activity
  12:46:28 AM  Recording started automatically
строки "Recording stopped": нет
```

Пять из шести событий записи — одинаковая подпись, строки об остановке нет. Три прогона
из трёх. В сводной таблице у BUG-10 теперь 3.

### Длинный звонок — отметка 1 ч 52 мин, медиа измерено (00:57)

```
таймер                1:51:51
RTCPeerConnection     по одному на участника — за почти два часа соединение не переустанавливалось
дельта за 5 секунд:
   участник A   in-audio  23786 Б, totalAudioEnergy +1.285   out-audio  1291 Б
   участник B   in-audio  10072 Б, totalAudioEnergy +0.007   out-audio 26002 Б
```

Поток идёт в обе стороны. Асимметрия объёмов — это содержимое, а не связь: у одного
фейкового устройства есть звук (его исходящие 26 КБ и энергия +1.285 у собеседника),
у второго тишина, и DTX сжимает её до ~1,3 КБ за 5 с, отчего у собеседника энергия
почти не растёт (+0.007). Байты сходятся крест-накрест: A in ≈ B out.

Звонок оставляю идти дальше — к утру это будет самый длинный прогон за сессию.

### BUG-8 — третий случай, вариант «звонок закрылся за последним вышедшим» (01:00)

Точный сценарий находки (ведущий вышел, затем вышел оставшийся) требует двух браузеров,
а оба заняты длинным звонком. Прогнал **упрощённый вариант того же события**: единственный
участник он же ведущий нажимает `Leave call`, звонок закрывается сам.

```
00:59:58  вошёл
01:00:22  нажал Leave call
вкладка Logs завершённого звонка:
   01:00:22 AM   Meeting ended for everyone      ← кнопку End for everyone никто не нажимал
   01:00:22 AM   <ведущий> left the call
сырое событие за этой строкой:
   {"event_type":"meeting.ended","source":"livekit","payload":{"event":"room_finished"}}
   actor_user_id в ответе отсутствует
```

То же `room_finished` без актора, та же строка в журнале. Это слабее исходного случая
(там кнопки `End for everyone` у оставшегося вообще не было, а здесь ведущий её имел
и просто не нажимал), поэтому в отчёт как отдельное измерение не несу — но как третье
подтверждение самого механизма годится: строку рисует клиент по событию, у которого
инициатора нет.

### Двухчасовая отметка длинного звонка — плановый замер (01:04)

```
таймер                 1:57:46 / 1:57:47 у обоих
качество               "Excellent · 7ms" / "Excellent · 5ms"
RTCPeerConnection      по одному на участника — за два часа ни одной переустановки
дельта за 5 секунд:
   участник A   in-audio 29427 Б, энергия +1.325   out-audio 30250 Б
   участник B   in-audio 24014 Б, энергия +0.006   out-audio 28537 Б
сборка на стенде       v0-61-0-rc-5-c4b5386b4a3a — не менялась
```

Байты сходятся в обе стороны (A in ≈ B out и наоборот). Разница в энергии по-прежнему
про содержимое: у одного фейкового устройства есть звук, у второго тишина.
Это уточняет мой более ранний ручной замер, где исходящие у A были всего 1,3 КБ —
там просто попал тихий участок; на плановом замере они 30 КБ.

Итого по длительным звонкам за сессию: 1:03:18, 31 мин, и текущий, идущий уже два часа.
Ни в одном не было деградации качества, потери медиа или переустановки соединения.

### BUG-12 [High] [backend] Гость, оборвавшийся из side room, навсегда занимает место в звонке (01:25–01:48)

Соседний сектор нашёл механизм (гостевая строка переживает аварийный обрыв, если гость был
в side room) и передал последствие мне — лимит участников и вход это мой сектор.
**Воспроизвёл цепочку целиком сам**, каждый шаг своим измерением.

```
01:22  гость входит по ссылке-приглашению, ведущий создаёт side room и зовёт его туда
01:24  гость принимает приглашение: "Leak Room", в комнате он и ведущий
01:25:24  рендерер вкладки гостя убит через CDP Page.crash — чистого выхода не было

  +25 с      GET /meeting/<id>/participants → строка гостя на месте
  +1.5 мин   на месте
  +3.5 мин   на месте
  +14 мин    на месте: {"name":"<гость>","type":"guest","in_breakout":true}
             плитка гостя с бейджем GUEST по-прежнему на экране у ведущего
             панель ведущего "2 in call" при ОДНОМ реальном участнике
             meetings/active "participant_count":2
```

**Последствие 1 — ведущий не может выставить лимит по факту.** В звонке двое реальных:

```
PATCH /api/v1/meeting/<id> {"max_participants":2}
<p role="alert" data-testid="meeting-settings-server-error"> видим, красный:
   "The limit cannot be lower than the number of people already in the call."
сервер: max_participants не изменился
```

**Последствие 2 — живого человека не пускают в звонок со свободным местом.** Один реальный
участник, лимит 2 (сервер насчитал 2: живой + призрак):

```
второй реальный жмёт Join →
   "The call is full | This call has reached its participant limit. Try again in a moment."
```

**Контроль** (мой же, отдельным прогоном): тот же гость, тот же аварийный обрыв, но **без**
side room — строка из `/participants` исчезает. Латентность не мерил, утверждаю только исход.

**Дедуп.** Ближайший — **ALK-1835** (BLOCKED): «LiveKit participant_connection_aborted оставляет
ghost guest в joined». Не дубликат: там гость **не подключился** (`livekit_sid=NULL`, negotiation
сломана до `participant_joined`), и критерии приёмки говорят именно про «неуспешно подключившегося».
У меня гость подключился полностью, был виден, был в комнате и жил минутами. Разные причины,
разные исправления. Прочитаны также ALK-1622, ALK-2123, ALK-1841, ALK-2130, ALK-2952, ALK-2871 —
все про другое.

**Чего в находку не вписал, потому что не смог измерить:** может ли ведущий сам убрать призрака.
У него есть пункт «Participant actions for <гость>», но содержимое меню моими перечислениями
не читается. Поэтому в тексте находки нет ни слова о том, что исправить это нельзя.

**Оговорка про выход из side room:** прямой кнопки `Leave call` внутри комнаты нет — перечислил
все 34 контрола участника в комнате, среди них только `Leave Side Room` и `Leave room`.
Но выход существует и работает: `Leave room` → подтверждение → возврат в главный звонок,
где `Leave call` снова появляется. То есть это выход в два шага, а не тупик; в находке
формулирую именно так.

**Рижный урок:** программный `element.click()` по `Leave Side Room` и `Leave room` не срабатывает —
три попытки подряд не сдвинули состояние, и я чуть не записал «из комнаты нельзя выйти».
Настоящий клик мышью (`page.mouse.click` по координатам) отработал с первого раза.
Плюс у `Leave room` тоже двухшаговое подтверждение, как у `Leave call`.

### ⚠ Публикация отчёта заблокирована на сутки

Artifact трижды ответил `429 frame_daily_push_cap_reached`. Больше не пробую.

- **Опубликовано по адресу
  https://claude.ai/code/artifact/5fc9fa61-e210-4f73-aa31-58ae1e0125e9 — 11 находок**
  (последняя удачная публикация `citations-branch-robust`).
- **В локальном файле `reports/aloqa-calls-around-qa-2026-08-26-B.html` — 12 находок:**
  добавлены BUG-12 (этот раздел) и лишний замер 1:17:16 в блоке BUG-7.

Разница ровно в этом. Файл готов к публикации, нужна только новая суточная квота.

### Побочные наблюдения из прогона BUG-12 (01:45–01:50)

**Перезагрузка возвращает участника обратно в side room.** Проверил на ведущем: после
`page.reload()` он снова оказался в комнате, и перечисление всех контролов снова не содержит
`Leave call` — только `Leave Side Room`, `Leave room`, а у хозяина комнаты ещё `Close room`.
То есть состояние «в комнате и без прямого выхода из звонка» переживает перезагрузку.
Это делает закрытие вкладки ещё более вероятным способом уйти — что и есть путь, который течёт.

**Чего я НЕ утверждаю:** что звонок остаётся открытым на одном призраке. Встреча действительно
оставалась `active` после того, как я увёл единственного живого участника через
`POST /meeting/<id>/leave` (204), — но его клиент при следующей загрузке страницы **сам
переподключался** в звонок, поэтому живой участник там снова появлялся. Разделить «держит
призрак» и «держит вернувшийся клиент» я на этом прогоне не могу и в находку это не пишу.

**Уборка.** Программные клики по `Leave room` / `Leave call` у ведущего не срабатывали
(та же история, что и у второго участника). Завершил встречу через `POST /meeting/<id>/end`
→ 200, `status: ended`, активных встреч в рабочем пространстве не осталось.
Мёртвая вкладка гостя закрыта через CDP, окно 9238 перелогинено.

### BUG-12 — второй прогон, воспроизводится полностью (01:49–01:56)

Отдельный звонок, отдельная комната, гость на этот раз вошёл в комнату **сам** через панель
Side Rooms (публичная комната), а не по приглашению — то есть путь тоже другой.

```
01:49:11  рендерер вкладки гостя убит, чистого выхода не было
  +30 с    GET /meeting/<id>/participants → ['<ведущий>', '<гость>']
  +90 с    то же самое  ← это уже больше окна переподключения
  +180 с   то же самое

последствие: в звонке реально один человек, API считает 2
  PATCH /api/v1/meeting/<id> {"max_participants":1}
  <p role="alert" data-testid="meeting-settings-server-error"> видим:
     "The limit cannot be lower than the number of people already in the call."
  сервер: max_participants не изменился
```

Два прогона из двух, на разных звонках, разными способами попадания в комнату
(по приглашению и самостоятельно). В сводной таблице у BUG-12 — 2.

Уборка: встреча завершена через API, мёртвая вкладка закрыта, окно 9238 перелогинено.

### Сводная таблица перепроверки — финальная (01:57, 27 августа)

| в отчёте | находка | прогонов | чем подтверждено дополнительно |
|---|---|---|---|
| 1 High | лобби без ведущего | 4 | поллеры 150 с и 110 с; 26 ключей `meetings/active`; `403 REALTIME_ACCESS_DENIED` у оставшегося |
| 2 High | место, занятое оборвавшимся гостем | 2 | два звонка, два способа попасть в комнату; оба последствия измерены в каждом; контроль без side room |
| 3 Medium | призрак в очереди после перезагрузки | 2 | контроль без перезагрузки; зеркало с перезагрузкой ведущего; отмена заявки; гостевой путь |
| 4 Medium | строка `Ringing…` | 5 | 299 замеров за 301 с; контраст с `Decline` (5 с) |
| 5 Medium | пароль сняли, барьер остался | 2 | поллер 75 с; повтор через 1 мин 37 с; вход по произвольной строке |
| 6 Medium | «private meetings only» | 2 | A/B на двух звонках |
| 7 Medium | исходы в истории приглашённого | 3 | три исхода — одна строка; механизм в `callOutcome.ts` + подсчёт 83/83 |
| 8 Medium | тупик у гостя по нерабочей ссылке | 3 | три способа сделать ссылку нерабочей |
| 9 Medium | запущенная встреча с мёртвым `Start call` | 3 | три встречи; ноль запросов; устойчиво 90 с; чинится перезагрузкой |
| 10 Low | `0:00 in call` у идущего звонка | 5 | три звонка; самый яркий — 1:17:16 показан как `0:00` |
| 11 Low | «Meeting ended for everyone» | 3 | сырое событие без актора во всех трёх |
| 12 Low | нет строки об остановке записи | 3 | три звонка с записью; `recording.stopped` — 0 совпадений двумя grep'ами |

Ни одна находка при перепроверке не отвалилась, ни у одной не менялась область.
Всего за сессию снято до отчёта или отдано чужим тикетам — семь кандидатов
(счётчики вкладок истории, молчаливая кнопка микрофона, «Recording started automatically»,
две развилки входа, бейдж «1 waiting», подпись `SHOW MESSAGES`, граница 128 символов у названия).

### Проверка чужой правки общих хелперов (02:25)

Соседняя сессия сообщила, что правила `snip/lib.mjs` и `snip/api.mjs` внутри моего окна
(19:14 и 18:38) — вопреки правилу CLAUDE.md про неизменяемые общие хелперы. Проверил сам,
а не поверил на слово.

```
мои снippet'ы, импортирующие общее: b2-mediaflow, b2-tabmedia, b2-ringwatch, b2-ringwatch2
git diff --numstat lib.mjs        238  0        ← 238 добавлений, НОЛЬ удалений
строк, начинающихся с "-"          0             ← ни одна существующая строка не менялась
HOOK в диффе                       только в добавленном комментарии
```

`HOOK` — единственное, чем я пользуюсь из `lib.mjs` (сбор `window.__pcs` для замеров медиа), —
не тронут. Правка чисто аддитивная, поведение существующих экспортов не менялось,
перемерять нечего.

Отдельно: все мои замеры медиа (53-я минута первого длинного звонка, 1:51 и 1:57 второго)
сделаны **после** 19:14, то есть даже при изменении они были бы однородны между собой.

`api.mjs` не отслеживается git'ом, поэтому у меня нет способа это доказать — но я им не пользуюсь
ни в одном снippet'е, так что вопрос не мой.

### План финальной записи в reports/README.md (03:00)

Файл общий, его правят соседние сессии (последняя правка была в 23:10). Поэтому запись —
**одной операцией и с перечитыванием файла непосредственно перед ней**.

```
структура: строка 3-4 — заголовок таблицы, дальше строки "| `aloqa-…html` | URL | описание |"
           строка 19 пустая (таблица фактически разбита на два блока)
           последняя строка таблицы сейчас 22, дальше с 24 идёт проза про параллельные сессии
вставка:   сразу после ПОСЛЕДНЕЙ строки, совпадающей с ^\| `aloqa  — не по номеру строки,
           а по шаблону, чтобы чужая строка, дописанная в промежутке, не потерялась
```

Черновик строки лежит в scratchpad (`readme-row.md`): файл, artifact URL, разбивка
1 High / 7 Medium / 3 Low → сейчас **2 High / 7 Medium / 3 Low**, сборка, три набора дедупа,
перечень разобранных тикетов и что снято как дубликаты. Перед записью пересчитаю числа
по фактическому файлу отчёта, а не по черновику.

### ALK-3474 — в этом прогоне не наблюдается, но условие тикета я мог и не поймать (03:30)

Тикет: гость, вошедший раньше, чем разрешится actor poll, объявляется как
«Unknown joined the call», и поправка потом не приходит.

Непрерывный опрос экрана ведущего, начатый до входа гостя:

```
t=0      только ведущий
t=20.3   тост: "Leak Guest joined the call"      ← имя настоящее, не Unknown
         тост: "Leak Guest unmuted"
         плитка: "LG | Leak Guest | GUEST"
далее    только повторы "… unmuted", никакого исправления имени не требовалось
```

**Формулирую осторожно: «не наблюдается», а не «починено».** Условие тикета — что поль опроса
не успел разрешиться *в момент, когда гостя впервые увидели*, — это узкое временное окно.
У меня от загрузки страницы гостя до входа проходило около девяти секунд, поль успевал.
Специально сужать окно не стал: подгонка тайминга это ровно то, что CLAUDE.md запрещает
как «стенд под timing-зависимое состояние».

Уборка: встреча завершена, вкладка гостя закрыта, 9238 перелогинено.

### Покрытие тикетов: 55 из 93, остаток — чужие сектора (03:33)

Прошёл по всем 93 открытым багам, помеченным как «звонки/встречи». Разобрано 55.
Оставшиеся 38 разложились так — и почти ни один не мой:

```
Side Rooms (сектор A)      3528 3481 3257 3074 2993 2734 2643
чат в звонке (A / чат)     3578 3577 3560 3471 3027
календарь (сектор E)       3539 3517 3110 3026 3014 2981 2978 2972
медиа и UI внутри звонка   3494 3295 3101 3099 3067 3063 2635 2606 2634 2875
модерация внутри звонка    3413 3144 2903 2991
инфраструктура / код       3259 3134
```

Единственный пограничный — **ALK-3186** (канал не поднимается в сайдбаре после завершения
звонка в нём). Не проверил: в лейне всего два канала, и `qa-general` и так стоит первым,
поэтому «поднялся ли канал» тут не наблюдаемо. Чтобы проверить, нужен третий канал —
а это правка фикстур через `seed_qa_fixtures.py`, что я в одиночку делать не стал.

Это подтверждает, что сектор B по тикетам пройден: всё, что осталось, живёт за его границей.

### Соседний сектор нашёл на моей поверхности то, что у меня уже есть — но усилил (03:45)

Сектор D перечислил маршруты из исходников и заметил, что `/join/<мёртвый токен>` не даёт
ни одного элемента управления. **Это моя уже опубликованная находка** («Гостю по нерабочей
ссылке… не дают ни одной кнопки»). Но их контраст с соседними доавторизационными экранами
я у себя не мерил — померил сам, свежий контекст, широкое перечисление:

```
/join/<мёртвый>                  53 символа текста, элементов управления 0
/magic-link/verify?token=<мёртвый>  141 символ, 3: Language, Request a new link, Back to sign in
/invite?token=<мёртвый>             200 символов, 3: Language, Show password, Sign in
/workspace/invite/accept?token=<…>  200 символов, 3: то же самое
```

Гостевой маршрут — единственный экран отказа до авторизации, с которого некуда пойти.
Три соседних дают минимум переключатель языка и путь ко входу. Это положительный контроль:
дело не в стиле продукта. Добавил в блок измерений находки.

Мои числа отличаются от их (у них было 5 и 1 на двух маршрутах, у меня 3 и 3) — считал сам,
в отчёт кладу свои.

**Важное уточнение по дедупу, которое они принесли:** `ALK-1727 [Task/TESTING]` требует
на мёртвой ссылке «fail-fast без формы» — то есть отсутствие **формы** это выполненное
требование, а не дефект. Мою находку это не убивает, потому что тикет владеет только тем
состоянием, которое перечислено в его критериях: форму убрать. Про ссылку на вход,
про «запросить новую» и про переключатель языка там нет ничего — а реализация вынесла
вместе с формой вообще всё. Это ровно тот разграничитель, которым я пользовался для ALK-2248
и ALK-1835, и здесь он работает в пользу находки, а не против.

### ПОПРАВКА к контролю на соседних маршрутах — две строки мерили не то (04:05)

Сектор D разобрал расхождение между нашими числами, и вторая половина оказалась важной.
Перепроверил сам, шесть маршрутов, свежий контекст:

```
маршрут                                   куда попал                  узлов / с текстом
/join/<мёртвый>                           остаётся на /join           0 / 0
/magic-link/verify?token=<мёртвый>        остаётся                    3 / 3
/workspace/invite/accept  (БЕЗ токена)    остаётся                    1 / 1
/workspace/invite/accept?token=<мёртвый>  ПЕРЕХОД на /login           5 / 3
/workspace/invite/accept?token=…&x=1      остаётся                    1 / 1
/invite?token=<мёртвый>                   ПЕРЕХОД на /login           5 / 3
```

**Две строки моего контроля мерили форму входа, а не экран мёртвой ссылки.** Разница
«5 узлов / 3 с текстом» объясняет и первое расхождение с их числами: они считали все
интерактивные узлы, я — только те, у которых есть текст, а текстовые поля текста не несут.
Строка с `&x=1` — подтверждающий случай: переход срабатывает только когда параметр ровно один.

Исправил блок: в сравнении остались только страницы того же класса —

```
/magic-link/verify?token=<мёртвый>     3: Language, Request a new link, Back to sign in
/workspace/invite/accept (без токена)  1: Back to sign in
/join/<мёртвый>                        0
```

Контраст стал уже (два сравнения вместо трёх), но честнее: сравниваются экраны одного вида.
Прежняя версия оставляла разработчику очевидное возражение «это несравнимые маршруты» —
а такое возражение уносит весь блок, а не одну строку.

**Мои числа были верны для того, что реально загрузилось; неверна была подпись строки.**
Это третий раз за сессию, когда измерение правильное, а описание измеряемого — нет
(до этого: срез перечисления, срез набора поверхностей).

### Проверка того, как отчёт реально отрисовывается (04:30)

Публикация закрыта квотой, но проверить вёрстку можно локально: обернул файл в
`<!doctype html>…<body>`, поднял `python3 -m http.server` и загрузил настоящим браузером.
Раньше за сессию я это ни разу не делал.

```
title                     "Лобби без ведущего"
статей                    12, все видимы
h2                        12          строк сводной таблицы  12      ← совпадает
горизонтальной прокрутки страницы   нет
блоков <pre>              12, у всех overflow-x: auto        ← широкие измерения скроллятся внутри себя
обрезанных листовых узлов 0
```

Четыре состояния темы (CLAUDE.md/artifact-design требуют работоспособности всех трёх,
плюс переключатель поверх системной):

```
системная светлая                       фон rgb(246,248,247)  текст rgb(22,32,31)
системная тёмная (без штампа)           фон rgb(14,20,19)     текст rgb(228,235,233)
data-theme="light" ПРИ системной тёмной фон rgb(246,248,247)  текст rgb(22,32,31)   ← переключатель побеждает
data-theme="dark"                       фон rgb(14,20,19)     текст rgb(228,235,233)
```

Третья строка — существенная: она проверяет, что охранное условие
`:root:not([data-theme="light"])` внутри `prefers-color-scheme: dark` работает,
то есть явный светлый выбор не перекрывается тёмной системой. Все четыре состояния дают
полную контрастную палитру, ни один цвет не остался определённым только внутри media-блока.

Временную папку рендера удаляю.

### Публикация прошла — все 12 находок опубликованы (06:44)

Суточная квота Artifact обновилась, повторная попытка удалась.
**https://claude.ai/code/artifact/5fc9fa61-e210-4f73-aa31-58ae1e0125e9 — все 12 находок**,
включая BUG-12 (место, занятое оборвавшимся гостем) и контроль на соседних маршрутах
у находки про гостя по нерабочей ссылке. Расхождения между локальным файлом и опубликованным
больше нет.

Строку в `reports/README.md` дописал до этого — из неё убрана оговорка про «11 из 12».

**Итог отчёта: 12 находок — 2 High, 7 Medium, 3 Low; 3 backend, 9 frontend.**

### Финальная перепроверка BUG-1 перед сдачей — держится (06:45–06:50)

Пятый прогон, полностью свежее состояние, в конце сессии:

```
звонок manual_admit, второй участник впущен, ведущий вышел через Leave call (с подтверждением)
третий стучится        → "ALREADY IN ROOM · 1 | Waiting for host approval | You can join after a host…"
оставшийся участник    → GET /meeting/<id>/waiting  403 REALTIME_ACCESS_DENIED
                          кнопок Admit в его панели: 0
вышедший ведущий, непрерывный опрос всего документа 90 с:
   changes: 1 — единственное изменение это чужой тост "…left the call" от прошлого звонка
   колокольчик как был "Notifications, 4 unread", так и остался
```

Пять прогонов из пяти. Находка сдаётся в том виде, в каком опубликована.

### BUG-12 — третий прогон (07:32–07:38)

Третий звонок, третья комната; гость снова вошёл в неё сам через панель Side Rooms.

```
07:32:50  рендерер вкладки гостя убит
  +40 с   /participants → ['<ведущий>', '<гость>']
  +100 с  то же
  +220 с  то же
проба вкладки гостя — не отвечает, то есть крах действительно произошёл
последствие: PATCH {"max_participants":1} при одном реальном участнике →
   "The limit cannot be lower than the number of people already in the call.", сервер не изменился
```

Три прогона из трёх, на трёх звонках. В отчёте поправил «на двух» → «на трёх».
Уборка: встреча завершена, мёртвая вкладка закрыта, 9238 перелогинено.


---

## Итог прогона (08:20, 27 августа)

Бокс: 14:40 26 августа → 09:00 27 августа, сектор B (Calls — вокруг звонка), полоса B.
Сборка на стенде не менялась ни разу: `v0.61.0-rc.5` (`c4b5386b4a3a`), проверено пять раз.

**Отчёт: 12 находок** — 2 High, 7 Medium, 3 Low; 3 backend, 9 frontend.
https://claude.ai/code/artifact/5fc9fa61-e210-4f73-aa31-58ae1e0125e9

Две High:
1. Звонок с одобрением входа перестаёт принимать людей в момент выхода ведущего, и ему
   об этом нигде не сообщают; оставшимся очередь не отдают (`403 REALTIME_ACCESS_DENIED`).
   Пять прогонов.
2. Гость, оборвавшийся из Side Room, навсегда занимает место: ведущий не может выставить
   лимит по факту, а живого человека не пускают в звонок со свободным местом. Три прогона.
   Механизм нашёл сектор A, последствие и полную цепочку измерил я.

**Что сделано, кроме находок:**
- разобрано 55 из 93 открытых багов по звонкам; остальные 38 — чужие секторы;
- отвечено на прямые вопросы ALK-3592 и «Проверки» ALK-3489 (звонок на бэкенде **не**
  завершается при повторном входе по своей invite-ссылке);
- дедуп по трём наборам, включая **184 бага в статусе BLOCKED**, которых штатный фильтр
  CLAUDE.md не видит;
- состязательная вычитка доказательств: три расхождения найдены и исправлены, итог 0 из 12;
- вёрстка отчёта проверена в настоящем браузере во всех четырёх состояниях темы.

**Стенд сдаётся чистым:** фикстуры полосы B проверены (8/8 пользователей во всех пяти базах),
активных звонков нет, три браузера на своих аккаунтах, временные файлы и случайный `~/Servers`
удалены, все 254 снippet'а под префиксом `b2-`, общие хелперы не тронуты.

**Что осталось открытым и кому:**
- истечение «призрачных» гостевых строк — за сектором A, у них шёл соак с отсчётом в 08:00;
- ALK-3186 (канал не поднимается в сайдбаре) — нужен третий канал в фикстурах;
- ALK-2232 (ранний Start запланированной встречи) — из моего сектора не достать, путь у календаря;
- заводить ли что-то из 12 находок в ALK — решение пользователя, я ничего не создавал.

**Финальная проверка фикстур (08:34):** `seed/seed.sh --verify --lanes B` → `All fixtures present
and correct` — 8/8 пользователей в auth/org/messaging/notification/realtime, company_members 8/8,
workspace_members 7/7, все четыре канала в исходном виде. Полоса B сдаётся нетронутой.
