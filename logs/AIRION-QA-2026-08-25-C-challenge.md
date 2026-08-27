# AIRION QA — Challenge pass over the 13h night-run report — lane C — 2026-08-25

**Задача:** перепроверить каждый дефект отчёта `reports/aloqa-calls-qa-2026-08-25.html`
(27 находок: BUG-1…22 — ночной 13-часовой проход 24→25.08, BUG-23…27 — утренний проход 25.08)
и выделить **ложные срабатывания** — то, что дефектом не является.

**Lane:** C (`QA_LANE=C`), браузеры alice 9242 / bob 9243 / carol 9244 / dave 9245 / owner 9246.
**Фикстуры:** `seed/seed.sh --verify --lanes C` — всё на месте (8 юзеров, 4 канала, реплики в 5 БД).
**Старт:** 2026-08-25 19:02 +05.

## Билд: важное отличие от прогона, который проверяем

| | билд | frontend commit |
|---|---|---|
| ночной прогон (BUG-1…22) | `v0-60-0-rc-16-bf2e6621eeea` | `bf2e6621eeea` |
| **сейчас на стенде** | `v0-61-0-rc-2-95656efbf3c9` | `95656efbf3c9` |

Между ними **81 коммит**. Поэтому «не воспроизводится» ≠ «ложное срабатывание»:
для каждой невоспроизводимой находки проверяю `git log bf2e6621eeea..95656efbf3c9`
на фикс в этой области. Есть фикс → находка была настоящей. Нет фикса и не
воспроизводится → кандидат в ложные.

Классификация каждой находки:
- **CONFIRMED** — воспроизводится на текущем билде, дефект настоящий;
- **FIXED** — был настоящим, починен между билдами (есть коммит);
- **FALSE POSITIVE** — дефектом не является (ошибка замера, артефакт стенда, неверное ожидание, дубликат);
- **OVERSTATED** — явление есть, но описано шире/жёстче, чем оно есть.

## Current state — ПРОГОН ЗАВЕРШЁН

Проверены все 27 находок отчёта `reports/aloqa-calls-qa-2026-08-25.html`.

**Ложные срабатывания — 4:** BUG-1, BUG-2, BUG-6, BUG-13.
**Преувеличена — 1:** BUG-26 (само явление есть, «каждые пять минут» неверно).
**Подтверждены — 22:** BUG-3, 4, 5, 7, 8, 9, 10, 11, 12, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27.
**Уточнения к формулировкам — 5:** BUG-3 (первый цикл чистый), BUG-4 (хост экрана итогов не
видит), BUG-8 (экран согласия не отрисовывается нигде, а не «подключён к лобби»),
BUG-18 (звонок закрывается за 5–10 с, не мгновенно), BUG-2 (живая часть — только отсутствие
отметки текущего устройства).

Отчёт: `reports/aloqa-recheck-qa-2026-08-25-C.html`
→ https://claude.ai/code/artifact/2b62a567-e357-4983-b12a-2dc19ba66793

Живых звонков нет (все завершены через API), фикстуры lane C проверены — всё на месте.
Осталось в воркспейсе lane C: запланированная встреча `QA-C-SCHED-1` (окно уже прошло;
`DELETE /api/v1/calendar/meetings/{id}` отвечает 405, удалять нечем) и тестовые сообщения
в `#qa-general`. Забаненная в звонке `QA-C-BAN` — бан привязан к встрече, встреча завершена.

Замечено попутно и в отчёте отсутствует:
- уведомление «<имя> joined the call» приходит дважды подряд;
- aria-label звёзд оценки — «1 stars» (множественное при одном);
- «фантом» из BUG-10 не даёт человеку войти ни в один другой звонок
  («Leave your current meeting before joining another one»).

## Проверки

### BUG-1 — **FALSE POSITIVE**

Заявлено: «На странице три переключателя и больше ничего — ни кнопки сохранения…
на сервер не уходит ни одного запроса… после перезагрузки всё как было».

На странице **есть** кнопка сохранения. Панель `Discard` / `Save preferences`
появляется, как только форма становится «грязной» (до первого клика её нет —
именно поэтому её и не увидели):

```
кнопки до клика по переключателю:  save/discard — нет ни одной
клик по «In-app notifications»
кнопки после клика:                Discard | Save preferences   <- панель появилась
                                   текст: «1 unsaved change»
```

Строка `settings.notifications.save = 'Save preferences'` есть и в билде ночного
прогона `bf2e6621eeea`, т.е. панель была на месте и тогда.

Нажатие Save отправляет запрос — и страница сохраняет исправно. Соседний
переключатель из того же отчёта («Mute channel notifications»):

```
клик -> Save preferences
PATCH /api/v1/notifications/settings -> 200
   {"in_app_enabled":true,"mute_all_channels":true,...}
перезагрузка: переключатели ["true","true","false"]   <- пережило
обратный клик -> Save -> 200, mute_all_channels=false <- вернул как было
```

А то, что в отчёте выбрано главным примером — выключение `In-app notifications` —
сервер **осознанно запрещает**, и интерфейс это объясняет:

```
PATCH /api/v1/notifications/settings {"in_app_enabled":false}
 -> 400 {"key":"NOTIFICATION_NO_DELIVERY_CHANNEL",
         "message":"нужен хотя бы один канал доставки: включите in_app_enabled или mute_all_channels"}
на экране: «In-app notifications cannot be turned off while no other delivery
            method is enabled. Keep them on and try again.»
```

Итог: механизм сохранения есть, работает и пишет на сервер; конкретно выключение
in-app — намеренное ограничение с внятным сообщением. Дефекта нет. (Побочно:
формулировка ошибки странная — «включите in_app_enabled или mute_all_channels» —
но это не то, что описано в находке.)

### BUG-6 — **FALSE POSITIVE**

Заявлено: «Сверху в палитре ряд из восьми вкладок-категорий, и все восемь
показывают один и тот же символ 🙂, ни у одной нет подписи».

**Вкладок категорий в этой палитре нет вообще.** Компонент
`packages/ui-kit-web/src/EmojiPicker.tsx` (билд `95656efbf3c9`) — это
`frimousse`-пикер из трёх частей: поле поиска, необязательная секция RECENT
и виртуализированный список с «липкими» заголовками категорий
(`SMILEYS & EMOTION`, …). Никакого tablist в нём нет.

Восемь кнопок 🙂, которые попали в замер, — служебный ряд самой библиотеки,
которым она меряет размер ячейки. Пользователю он **не виден**:

```
кнопка 🙂 (любая из восьми):
  ancestorAriaHidden      = aria-hidden@DIV     <- предок помечен aria-hidden
  zeroHeightAncestor      = true                <- предок нулевой высоты, ряд склёпан
  hitIsSelf               = false
  elementFromPoint(центр) = DIV.sticky top-0 …  <- в этой точке заголовок категории
```

Проба точками по верхней части палитры (`elementFromPoint` через каждые 12 px)
находит только заголовок и настоящие эмодзи — 🙂-ряда там нет.
Скриншот открытой палитры: поле `Search emoji`, заголовок `SMILEYS & EMOTION`,
сетка 😀😃😄😁😆😅🤣😂 — ряда одинаковых 🙂 на экране нет.

Замер в отчёте перечислил `button` без проверки цепочки предков — ровно та
ошибка, про которую написано в CLAUDE.md («Visibility needs the ancestor chain,
not one node»). Дефекта нет.

### BUG-11 — **CONFIRMED** (воспроизводится на текущем билде)

alice блокирует QA Bob из карточки `Directories → People`:

```
GET /api/v1/messaging/users/blocked -> {"users":[{"id":"U4QCBOB00000001","name":"QA Bob",...}],"total":1}
карточка того же человека после перезагрузки страницы:
  «QA Bob | Message | Call | Block | Share |
   This user cannot be blocked until their workspace membership is verified. |
   SHARED CHANNELS · 2 | qa-general | qa-private»
  кнопки: Message | Call | Block(disabled=true) | Share    <- Unblock нет
```

Причина в коде именно та, что названа в отчёте: `canBlock` в
`useProfileBlockAction.ts` гаснет по `blockedListAuthority.isTargetBlocked`,
а `ProfileBlockFeedback.tsx` печатает при `!canBlock` единственную строку —
про непроверенное членство. Находка верная.

### BUG-13 — **FALSE POSITIVE (неверное ожидание)**

Заявлено: «Приглашённый не видит состав участников встречи… Как должно быть:
приглашённый должен видеть тот же состав участников и их ответы, что и организатор».

Это **намеренное правило продукта**, а не сбой. Бэкенд,
`calendar/service/get.go`:

```go
// GetScheduledEvent — карточка встречи. attendees заполняется только если
// requesterID — создатель (бизнес-правило 10: список участников видит
// только creator); иначе возвращается nil-слайс без ошибки.
if m.CreatedBy != requesterID { return m, nil, nil }
```

и тест `channel_visibility_test.go`: `assert.Nil(t, attendees, "список
участников по-прежнему видит только создатель")`. Фронт на `attendees === null`
показывает ровно то, что задумано (`kind: 'hidden'`).

Отсюда и «нет 403, оба запроса 200» из самого отчёта — это не признак поломки,
а признак того, что список скрыт намеренно. Требование отчёта прямо
противоречит правилу доступа.

Что остаётся правдой — только формулировка: `Participant list unavailable`
читается как «не удалось загрузить», хотя список скрыт намеренно. Это Low-копирайт,
а не Medium-дефект «приглашённый не видит состав».

### BUG-2 — **FALSE POSITIVE (артефакт стенда)**

Заявлено: «Выбор микрофона внутри звонка не переключает микрофон, а молча
сбрасывает его на системный по умолчанию».

Приложение просит **именно тот** микрофон, который выбрали. Перехват
`getUserMedia` у участника в звонке (`window.__gumCalls`):

```
выбрали «Fake Audio Input 1» -> gUM {"audio":{"deviceId":"a5c88b63…008c", …}}
выбрали «Fake Audio Input 2» -> gUM {"audio":{"deviceId":"369a97cd…ace4", …}}
выбрали «Fake Default…»      -> gUM {"audio":{"deviceId":"default", …}}
трек в sender при этом каждый раз новый (id c34fee73 -> 89a5ea12 -> de5f9568),
т.е. дорожка реально перезапускается
```

Но у полученного трека всегда `label: "Fake Default Audio Input"`,
`getSettings().deviceId = "default"` — и это делает **Chrome стенда**, а не продукт.
Контрольный опыт в том же браузере, прямой вызов `getUserMedia` мимо приложения:

```
asked «Fake Audio Input 1»  deviceId: id          -> got «Fake Default Audio Input» / default
asked «Fake Audio Input 1»  deviceId: {exact: id} -> got «Fake Audio Input 1»      / a5c88b63
asked «Fake Audio Input 2»  deviceId: id          -> got «Fake Default Audio Input» / default
asked «Fake Audio Input 2»  deviceId: {exact: id} -> got «Fake Audio Input 2»      / 369a97cd
```

То есть `--use-fake-device-for-media-stream` игнорирует **не-exact** (`ideal`)
deviceId и всегда отдаёт дефолтное фейковое устройство. На настоящем железе
Chrome `ideal`-deviceId соблюдает.

Отсюда же и «в лобби работает, а в звонке нет» — разные формы констрейнта,
а не разное качество кода:

```
лобби:  useLobbyPreview.ts:119   audio: {deviceId: {exact: deviceId}}   <- exact
в звонке: engine.ts:5484         room.switchActiveDevice(kind, id, false) <- LiveKit, ideal
```

Ровно то, про что в CLAUDE.md написано «Suspect the rig before the app».
Дефекта в продукте измерением не показано.

Что из находки уцелело: в меню внутри звонка действительно нечем понять, какое
устройство сейчас выбрано (у всех пунктов `aria-pressed="false"`,
`data-selected="false"`, галочек нет). Это отдельная мелкая претензия к меню,
а не High «микрофон молча уходит на умолчание».

### BUG-5 — **CONFIRMED** (воспроизводится)

Лобби `READY TO JOIN?`, `Speakers → Test audio`, замер каждые 400 мс:

```
+0,0 с  «Playing…»  audio paused=false t=0.00 ended=false
+0,4 с  «Playing…»  audio paused=false t=0.34 ended=false
+0,8 с  «Playing…»  audio paused=true  t=0.52 d=0.52 ended=true   <- звук кончился
+17,7 с «Playing…»  без изменений
кнопки лобби в конце: Microphone on | Camera off | Settings | Playing… | Join | Cancel
```

Корневая причина видна в коде (`useCallDeepLinkLobby.ts`): подписка на `ended`,
которая должна вернуть кнопку в `idle`, стоит в `useEffect` c пустым списком
зависимостей и читает `testAudioRef.current` на первом рендере, когда `<audio>`
ещё не смонтирован (страница в состоянии `loading`), — слушатель не вешается
никогда. Находка верная.

### BUG-3 — **CONFIRMED** (со второго цикла, как и написано в отчёте)

Цикл «пригласить QA Carol → она жмёт Decline → открыть Add to call заново»:

```
цикл 1: строка «QA Carol», чекбокс активен — состояние чистое (0 / 20 / 45 с)
цикл 2: строка «QA CarolRinging…», чекбокс disabled=true — и так на 0 / 20 / 45 с
        кнопка «Invite (0)», неактивна
        третья попытка пригласить: чекбокс не ставится, запрос не уходит вообще
```

Первый цикл отработал правильно — ровно то непостоянство, которое в отчёте и
описано. Находка верная. (Заведено как ALK-3444 — это про имя; на «залипание
Ringing…» отдельного тикета в открытых нет.)

### BUG-12 — **CONFIRMED**

```
приглашение 1: баннер «QA Alice is calling…»          (аватар «QA»)
приглашение 2: баннер «U4QCALICE000001 is calling…»   (аватар «U4»)
```

Оба раза кнопки Accept / Decline на месте. Совпадает с ALK-3444.

### BUG-7 — **CONFIRMED** (обе половины)

Вход. Опрос у QA Carol начат до перехода на страницу звонка; в звонке в этот
момент уже двадцать минут сидят QA Alice и QA Bob:

```
+21,4 с  Carol вошла в звонок  ->  всплывающее «QA Bob joined the call»
```

Выход. Опрос у QA Bob начат до нажатия `Leave call`; в звонке трое:

```
+1,6 с  диалог «Leave this call? …»
+3,1 с  Bob вышел  ->  всплывающее «QA Alice left the call»
        на самом деле в звонке остались QA Alice и QA Carol
```

Фикс `c1cfafc2a fix(calls): derive join and leave notifications from the roster
(ALK-3424)` в проверяемом билде уже есть — дефект он не закрыл.

Побочно (в отчёте нет): «QA Carol joined the call» приходит дважды подряд.

### BUG-15 — **CONFIRMED**

Опрос у участника каждые 300 мс, начат до действия хоста
(`Meeting settings → MICROPHONE → Blocked`, `PATCH … {"mic_mode":"blocked_all"}` → 200):

```
+0,0 с   кнопка «Mute»   disabled=false  title="Toggle mute (⌘D)"
+13,9 с  кнопка «Unmute» disabled=true   title="Toggle mute (⌘D)"
уведомлений за всё время: ни одного нового
текста со словами blocked / not allowed / disabled by / host has: нет
```

Совпадает с ALK-3453.

### BUG-14 — **CONFIRMED**

```
Meeting settings → Reactions (переключатель) -> PATCH /meeting/{id}/settings 200 сразу
                                                кнопки Save/Cancel остаются disabled
ввод названия -> Save и Cancel становятся активны
Cancel -> панель закрылась
переоткрытие: название вернулось к «QA-C-1» (откатилось)
              Reactions осталось в новом значении (не откатилось)
```

### BUG-19 — **CONFIRMED**

```
Settings → Calls and audio → Diagnostics:
  «Adds an in-call panel with live WebRTC stats. Open it from the Nerd Stats
   button in the call toolbar.»
тулбар звонка после включения настройки: aria-label = "Call diagnostics"
```

Строки в словаре билда: `settings.calls.diagnostics.nerdStats.desc` (…Nerd Stats…)
против `calls.controls.nerdStats: 'Call diagnostics'`.

### BUG-21 — **CONFIRMED**

```
Participants → QA Bob → Participant actions → Remove from call:
  «Remove participant? | Remove QA Bob from the call? They can rejoin unless the
   call is locked. | Cancel | Remove»
поиск по видимому тексту звонка со словом lock: ничего
в словаре билда нет ни одной строки про блокировку звонка
```

### BUG-8 — **CONFIRMED как наблюдение**

Звонок пишется (`recording/start` → 201, `status: recording`,
`recording_enabled: true`), человек, ни разу в этом звонке не бывавший, открывает лобби:

```
«READY TO JOIN? | QA-C-REC… | DEVICE CHECK | Microphone | Speakers | Test audio |
 Camera | Off | Network | Excellent | ALREADY IN ROOM · 3 | Join | Cancel»
флажков на экране: 0
строк со словами record / consent / transcript: 0
```

Уточнение к формулировке отчёта: экран согласия
(`CallLobbyRecordingConsentNotice`) в кодовой базе есть, но **не отрисовывается
нигде** — в лобби от него используется только `canJoin` на время проверки.
То есть «подключён к этому же лобби» — неточность; сам факт отсутствия
предупреждения верен.

### BUG-26 — **CONFIRMED по сути, но одно утверждение неверно (OVERSTATED)**

Верно: встреча, проведённая и завершённая **раньше назначенного времени**, всё
равно попадает в рассылку напоминаний. Механизм виден в бэкенде:
`scheduled_event_repo/start.go` — старт встречи «не меняет статус (остаётся
'scheduled', чтобы reminder-тикеры работали до Start)», а выборка
`ListDueReminders` берёт всё, что `status = 'scheduled'` и попадает в окно.

Неверно: «напоминание приходит на каждом проходе рассылки, с шагом в пять минут,
а не один раз». Порогов ровно **два**, они не пересекаются, и каждый
дедуплицируется таблицей `meeting_reminder_deliveries` по тройке
(встреча, получатель, порог):

```go
var reminderBuckets = []reminderBucket{
  {Minutes: 30, LowerMinutes: 10},   // окно 10–30 мин до начала
  {Minutes: 10, LowerMinutes: 0},    // окно 0–10 мин до начала
}
```

Два уведомления в отчёте — 11:09:20 (11 мин до 11:20 → 30-минутный порог) и
11:14:20 (6 мин до → 10-минутный порог) — это ровно два штатных порога, по
одному разу каждый, а не «каждые пять минут». Совпадение шага в 5 минут
случайно: столько прошло между двумя тиками, попавшими в разные окна.
Оба уведомления при этом подписаны одинаково («starts soon»), отчего и читаются
как дубли — это отдельная (и настоящая) претензия к тексту.

### BUG-4 — **CONFIRMED**

Звонок с идущей записью, хост жмёт `End for everyone`, не останавливая её.
Экран итогов у участника через ~14 с после завершения:

```
«Call ended | · QA-C-REC2 · 1m 38s | Duration | 1m 38s |
 Recording | Unavailable | Transcript | Unavailable | PARTICIPANTS | …»
сервер в ту же секунду: {"status":"completed","file_size":1699935,"duration_sec":83}
страница деталей звонка: «Recording | 1:23 · MP4 | Share | Download | 1920 × 1080»
```

Уточнение к пути повторения: **хост экрана итогов не видит вообще** — после
подтверждения `End for everyone` он оказывается на `/calls`. Экран `Call ended`
показывается участникам. На сам дефект это не влияет.

### BUG-24 — **CONFIRMED**

```
клик по звезде -> POST /api/v1/meeting/{id}/rating {"rating":4,…} -> 200 {"my_rating":4}
раздел: «RATE QUALITY | Rating saved»
перезагрузка -> «Call has ended. This call has already ended…», раздела оценки нет
открыть звонок по его адресу -> то же самое, оценки нет
страница деталей /calls/{id} -> Recording | Chat | Logs; элементов оценки: 0
сервер помнит: GET /api/v1/meeting/{id} -> "my_rating":4
```

### BUG-25 — **CONFIRMED**

Личный звонок, на который не ответили (звонок сам завершился по таймауту),
и отменённый через 4 секунды — оба в истории с длительностью:

```
Recent calls: QA Carol | Outbound · No answer · Aug 25, 07:49 PM · 1m   <- разговора не было
              QA Carol | Outbound · Canceled  · Aug 25, 07:48 PM · 0m
для сравнения: QA-C-1  | Outbound · Ended     · Aug 25, 07:15 PM · 22m
```

### BUG-27 — **CONFIRMED**

Экран исходящего личного звонка («QA Carol / Ringing…»): три кнопки — микрофон,
камера и красная **Leave call**. Нажатие:

```
POST /api/v1/meeting/V4OVEWP0ZEDNPSJ/cancel -> 204
в истории у звонившего: «Canceled · 0m»
```

### BUG-17 — **CONFIRMED** (обе половины)

Карточка звонка в канале `#qa-general` после завершения, три аккаунта:

```
начавший (QA Alice):    «Outgoing call | Duration 0:27»  значок lucide-phone-outgoing
зашедший (QA Bob):      «Incoming call | Duration 0:27»  значок lucide-phone-incoming
не заходивший (QA Carol):«Incoming call | Duration 0:27» значок lucide-phone-incoming
```

Список недавних звонков, один и тот же групповой звонок:

```
у создателя:  «QA-C-1 | Outbound · Ended · Aug 25, 07:15 PM · 22m»
у участника:  «QA-C-1 | Incoming · Ended · Aug 25, 07:15 PM»
```

`Incoming` / `Outbound` — не пара; в фильтрах телефонии рядом лежит правильная
пара `Incoming` / `Outgoing`.

### BUG-18 — **CONFIRMED**

Один человек в звонке, жмёт `Leave call`:

```
диалог: «Leave this call? | You will be disconnected. The call continues for
         everyone else, and you can rejoin while it is still running.»
участников на сервере в этот момент: 1 (он сам)
после подтверждения, опрос каждые 5 с:
  +0 с  "status":"active"  в /workspace/{ws}/meetings/active — есть
  +10 с "status":"ended"   "ended_at":"2026-08-25T14:51:14Z"   в active — нет
```

(Первая проверка через 5 с ещё показывала `active` — звонок закрывается
в интервале 5–10 с; на суть находки это не влияет.)

### BUG-23 — **CONFIRMED**

Встреча `QA-C-SCHED-1`, 14:42–14:57 UTC, организатор QA Bob, приглашена QA Carol.
Опрос обеих сторон раз в секунду:

```
время     приглашённая (Carol)      хост (Bob)
14:39:50  «Not started yet»         «Start call»
14:42:00  ← назначенное время начала
14:43:31  «Not started yet»         «Start call»     <- у Carol надпись не пересчиталась
перезагрузка страницы Carol в 14:45:20 (до конца окна ещё 12 минут):
14:45:20  «Did not take place», кнопок у карточки нет
14:45:40  «Did not take place»
```

Механизм подтверждается кодом: `getNextScheduledOccurrenceActionChangeMs`
возвращает `null`, если `viewerId !== creatorId`, поэтому у приглашённого
таймер пересчёта `nowMs` не заводится вовсе, а `resolveFallbackKey` выбирает
`startWindowPassed` по `isBeforeStart = nowMs < startMs`.

### BUG-16 — **CONFIRMED**

`dave` открыл `/calls` **до** создания звонка и вошёл кнопкой `Join` из блока
`Live now` без перезагрузки. Хост переименовывает звонок
(`PATCH /meeting/{id} {"name":"RENAMED-SR"}` → 200):

```
у хоста в шапке звонка:  «RENAMED-SR»
у dave  в шапке звонка:  «QA-C-SR»      <- старое
на сервере у обоих:       name = «RENAMED-SR»
```

### BUG-22 — **CONFIRMED** (по коду)

`GuestLinkInvalid.tsx` рендерит ровно `Heading` + `Text` и ничего больше —
ни кнопки, ни ссылки:

```tsx
<div className="…"><Heading …>{t('calls.guest.entry.title')}</Heading>
  <Text as="p" tone="muted">{t('calls.guest.entry.expired')}</Text></div>
```

`calls.guest.entry.expired = 'This invite link is no longer valid.'`
Совпадает с ALK-3477.

### BUG-20 — **CONFIRMED**

QA Carol сидит в Side Room `SR-1`; QA Dave — в звонке, в главной комнате.
Опрос уведомлений у Carol каждые 300 мс:

```
+17,3 с  Dave вошёл в комнату SR-1  ->  «QA Dave joined the call»
+28,2 с  Dave вышел из комнаты      ->  «QA Dave left the call»
```

Dave звонок при этом не покидал: его собственный диалог — «Leave SR-1? You will
return to RENAMED-SR, and your audio will switch to the main room. SR-1 will
remain available», после подтверждения `meetings/current` у него по-прежнему
отдаёт этот звонок.

### BUG-13 — воспроизведение в браузере (к вердикту FALSE POSITIVE выше)

Одна и та же встреча, открытая из Calendar:

```
организатор (QA Bob):  «… | Scheduled by You | QA Carol | optional | Pending | …»
приглашённая (Carol):  «… | Scheduled by QA Bob | Participant list unavailable | …»
```

И на уровне API — не ошибка, а отсутствие поля:

```
GET /api/v1/calendar/meetings/S4OVEKYFW7RD21T
  у организатора: 200, "attendees":[{…"user_id":"U4QCCAROL000001","status":"pending"…}]
  у приглашённой: 200, ключа "attendees" в ответе нет вообще
```

Это ровно то, что предписывает `calendar/service/get.go` (бизнес-правило 10).

### BUG-9 — **CONFIRMED**

```
хост: Participants → QA Carol → Ban
диалог: «Ban from this meeting? | QA Carol will be removed and cannot rejoin this meeting.»
POST /api/v1/meeting/{id}/participants/U4QCCAROL000001/ban -> 204

забаненная жмёт Join:
POST /api/v1/meeting/{id}/join -> 403 {"key":"REALTIME_MEETING_BANNED"}
экран: «You cannot rejoin this call | A host removed you from this call and blocked
        you from rejoining it. Ask them to invite you again. | Back to workspace»

хост следует этому совету — Add to call → QA Carol → Invite:
POST …/invite -> 204,  тост «Invited 1 people to the call»

забаненная жмёт Join ещё раз:
POST …/join -> 403 REALTIME_MEETING_BANNED, тот же экран
```

Кнопки снятия бана в интерфейсе звонка нет. Совпадает с ALK-3448.

### BUG-10 — **CONFIRMED**, причём с более чистым контролем, чем в отчёте

Один и тот же звонок, два одинаковых действия «закрыть вкладку», разница только
в том, где человек находился.

```
14:56:49  QA Carol закрывает вкладку, находясь В SIDE ROOM «SR-1»
14:57:10 → 14:59:40  опрос каждые 5 с:
          participants: ['QA Alice','QA Dave','QA Carol']   hub: 3
          ни одного изменения за 148 секунд

14:59:59  QA Dave закрывает вкладку ИЗ ГЛАВНОЙ КОМНАТЫ
15:00:05  participants: ['QA Alice','QA Carol']  hub: 2      <- Dave убран за ~6 секунд
```

QA Carol пропала из состава только тогда, когда я вручную вызвал
`POST /api/v1/meeting/{id}/leave` за неё.

Дополнительный (в отчёте отсутствующий) эффект: пока висит этот «фантом»,
человек **не может войти ни в какой другой звонок** — при попытке входа в другой
звонок экран «Could not join the call» и тост «Leave your current meeting before
joining another one».

### BUG-22 — **CONFIRMED** (воспроизведено в браузере)

`Add to call` → скопирована ссылка → `Create new link` → старая ссылка открыта
в браузере залогиненного члена рабочей области:

```
весь текст страницы: «Join as a guest | This invite link is no longer valid.» (54 символа)
кнопок: 0
ссылок: 0
```

