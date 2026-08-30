# AIRION QA — 2026-08-30 — lane D — sector N (Calls: collaboration & meeting policy)

Build (frontend): `v0-61-0-rc-7-10a407a46be1` → tag `v0.61.0-rc.7`, commit `10a407a46be1`
Lane D workspace `W4QDF1XTURESO01`, company `O4QDF1XTURESO01`.
Sector N on lane D (Calls map, `SECTORS-CALLS.md`).

## Current state
- Session start 12:47 +05. Deadline 18:00 +05.
- Browsers up: alice (9252), bob (9253).
- Dedup targets read: reports/aloqa-calls-{inside,around}-qa-2026-08-26-{A,B}.html,
  aloqa-calls-qa-2026-08-2{3,4,5}*.html, aloqa-incall-qa-2026-08-26-A.html. No sibling for today.
- Coverage read from logs/AIRION-QA-2026-08-26-A-calls-inside.md: in-call chat *policy*
  (chat_enabled=false) well covered; Side Room chat isolation covered (M's now).
  Thin: chat threads inside a call, chat history/paging, chat error states, system rows,
  reaction picker/row, screen-share start/stop/two-at-once, recording start/stop/consent live.

## Log

### Verified working — приватные сообщения в Call chat не утекают третьему участнику
Композер Call chat имеет селектор получателя (`button[aria-label="To"]` → `Everyone` / `QA Bob (member)`),
placeholder меняется на `Private message to QA Bob`, строка получает `data-testid="ic-message-private-badge"`.
Проверено с третьим участником (carol), который не отправитель и не получатель:
- **историю** (carol зашла ПОСЛЕ отправки приватного): в панели только 3 публичных сообщения, приватного нет;
- **live** (carol уже в звонке, alice шлёт приватное bob): в DOM carol приватного нет;
- **API** от имени carol: `GET /api/v1/meeting/<mid>/messages?limit=100` → 200, `messages.length = 3`,
  тела `DN-CHAT-A1`, `DN-CHAT-A2-typing-probe`, `DN-PRIV-TO-BOB-1` — все публичные.
  Положительный контроль внутри той же выдачи: три публичных сообщения присутствуют, т.е. запрос работает.
У отправителя приватная строка получает статус доставки `Delivered` → затем `Read`.

### Отклонено (не дефект) — «бейдж Recording держится ~20 с после остановки у одного участника»
Два прогона подряд: после клика Stop recording бейдж `call-recording-badge` у carol гас через ~0.5 с,
у bob — через ~20.6 с, и bob не получал тоста об остановке.
```
run 2:  клик Stop            1788076895109
        carol бейдж погас    1788076895617   (+508 мс, тост "Recording ready")
        bob   бейдж погас    1788076915712   (+20603 мс, тоста нет)
```
Причина — **не продукт, а долгоживущая вкладка**. После перезагрузки страницы bob и повторного входа
в звонок третий прогон даёт совпадение с carol до миллисекунд:
```
run 3:  клик Stop            1788077167092
        WS-кадр у bob        1788077167464   {"event":"recording_stopped","recording_id":"RC…","duration_sec":26,
                                              "file_size":542702,"status":"completed"}
        bob   бейдж погас    1788077167608   (+516 мс, тост "Recording ready")
        carol бейдж погас    1788077167608   (+516 мс)
```
Кадр приходит и обработчик его применяет за 144 мс. Кандидат снят.
(Инструмент: перехватчик `WebSocket` через `page.addInitScript` до открытия сокета приложения.)

### Verified working — запись: старт, уведомление участников, стоп
- Тулбар хоста: `Record` = `[data-testid="recording-start-access-trigger"]`; во время записи кнопка
  становится `[data-testid="call-controls-record"]` с `aria-label="Stop recording"`.
- Диалог `Recording access` с тремя радио: `Everyone in the meeting` (выбран по умолчанию) /
  `People who joined the call` / `Private`.
- Участники (member, не хост): видимый тост `This call is being recorded` (352×54, ~8.5 с) +
  постоянный бейдж `call-recording-badge` «Recording». Появление через ~0.7–1.5 с после старта.
- Обычный участник (bob, member): в тулбаре нет ни `Record`, ни `Meeting settings` — верно.
- **ALK/08-24 «после остановки кнопка ещё ~20 с выглядит как идёт запись» на rc.7 не воспроизводится**:
  подпись меняется `Stop recording` → `Record` за 438 мс. Внутри 20-секундного окна (когда testid ещё
  `call-controls-record`) нажатие `Record` открывает диалог `Recording access` как положено — подмены
  поведения нет, меняется только внутренний компонент.

### Кандидат (Low) — индикатор «X is typing…» держится ~4 с после того, как сообщение уже доставлено
Опрос у bob каждые 300 мс, отсчёт от момента до начала набора:
```
t+4682 мс   "QA Alice is typing…"      сообщений в списке: 1
t+5598 мс   "QA Alice is typing…"      сообщений в списке: 2   <- сообщение уже пришло
t+9629 мс   ""                                                  <- индикатор гаснет
```
Т.е. ~4.0 с экран утверждает, что человек печатает, хотя его сообщение уже видно. Похоже на таймаут
простоя вместо сброса по отправке. Не проверено, ведёт ли себя так же чат канала (сектор C).

### BUG-1 [Medium] [frontend] Диалог треда в Call chat нигде не показывает сообщение, к которому открыт
Кнопка `Thread` есть у каждой строки Call chat. Открывает модальный диалог, в котором **нет исходного
сообщения** — ни текста, ни автора, ни времени. Для двух разных родителей диалог отличается только
списком ответов; когда ответов нет, он идентичен посимвольно.

Полный перечень видимых листовых узлов диалога (не срез — весь диалог, `innerText` 89 и 96 символов):
```
открыт от строки  «QA Alice HOST · 12:50  DN-CHAT-A1»           (есть 1 ответ)
  leaves(6): "Message thread" | "Replies sent during this call." | "QA Bob" |
             "DN-THREAD-BOB-1" | "Reply to message" | "Send reply"

открыт от строки  «QA Alice HOST · 12:52  DN-PRIV-TO-BOB-1»     (ответов нет)
  leaves(5): "Message thread" | "Replies sent during this call." | "No replies yet." |
             "Reply to message" | "Send reply"
```
Ни `title`, ни `aria-describedby` в диалоге нет (`titles: []`).
Родитель у сервера есть: `GET /api/v1/meeting/<mid>/messages` возвращает `reply_count` у нужной строки.

### BUG-2 [Low] [frontend] При выключенном In-call chat композер треда молча гаснет — причина написана только в панели чата
Хост выключает `In-call chat` (`meeting-settings-chat`). У участника панель чата корректно показывает
«Chat is disabled for this call», `To` и `Send` становятся `disabled`. Но кнопки `Thread` остаются
активными (5 из 5), и в открывшемся диалоге `textarea` и `Send reply` тоже `disabled` — **без единого
слова о причине**:
```
panel:  … "Chat is disabled for this call"  To[disabled] Send[disabled]
dialog: leaves(6) = Message thread | Replies sent during this call. | QA Bob | DN-THREAD-BOB-1 |
                    Reply to message | Send reply
        textarea.disabled=true  aria-describedby=null  title=null
        "Send reply".disabled=true  aria-label=null  title=null
```
Положительный контроль на том же экране, в той же сессии, тем же аккаунтом: панель, из которой этот
диалог открыт, отказ объясняет. Т.е. текст у продукта есть и до диалога не доходит.

### Измерение для координации — скорость применения политики звонка
`PATCH /meeting/<id>/settings {"chat_enabled":false}` (через тумблер в панели у хоста):
```
клик у хоста                    1788077567776
композер у участника disabled   1788077568087   (+311 мс) + плашка "Chat is disabled for this call"
```
Опрос у участника 300 мс, начат до клика. Т.е. политика чата долетает так же быстро, как grant прав
(351 мс по замеру лейна C), длинного settle не нужно.

### Дедуп — ALK-3027 (Backlog, Bug) воспроизводится на rc.7, не репортим
`reply_count: 1` у родителя в API, но строка в Call chat не показывает ни счётчика ответов, ни
индикатора — у автора родителя (alice, она же хост) тоже. Полное перечисление строки:
`btns: [Thread, React]`, `tids: [ic-message-avatar, ic-message-react-trigger]`. Совпадает с тикетом.

### Verified working — тред на приватном сообщении не утекает третьему
bob отвечает в треде у приватного сообщения alice→bob (`DN-PRIV-TO-BOB-2`). У carol
(ни отправитель, ни получатель) ни в DOM, ни в `GET /meeting/<mid>/messages` ничего не появляется:
по-прежнему 3 публичных сообщения. Положительный контроль внутри той же выдачи —
`reply_count: 1` у публичного `DN-CHAT-A1`, чей тред carol видеть вправе.

### Verified working — панель Meeting settings, состав и стейджинг
Блок MEETING (`WHO CAN JOIN` = `Host approval`/`Anyone`, `MEETING NAME`, `Password protection`,
`PARTICIPANT LIMIT`) стейджится за `Cancel`/`Save`; остальные секции применяются сразу.
`ACCESS Public/Private` — оба радио `disabled` с честным пояснением
«Meeting access cannot be changed during a call yet.» (`meeting-settings-access-edit-unavailable`).
Пароль: включение тумблера + ввод → `password_protected: true`. Сохранение **другого** поля
(только имени) пароль не сбрасывает: `password_protected` остаётся `true`, тост «Meeting settings saved».

### BUG-3 [Low] [frontend] Панель Call chat в отдельном звонке ссылается на канал, которого нет — ALK-2769 закрыт, но воспроизводится на rc.7
Звонок создан через `Start now` (standalone, не канальный). Шапка панели Call chat читает
`Saved to #<название звонка>`, при этом у встречи нет канала, и канала с таким именем в воркспейсе нет.
```
шапка панели (перечислены видимые листовые узлы, не срез):
  ["Call chat", "Saved to #DN-NAME-1", "QA", "QA Alice"]

GET /api/v1/meeting/<mid>          -> "channel_id": "",  "name": "DN-NAME-1"
GET /api/v1/workspaces/<ws>/channels -> 200, ["qa-general", "qa-private"]   # #DN-NAME-1 отсутствует
```
Дословно совпадает с **ALK-2769** (Bug, статус **TESTING** = закрыт в этом процессе), включая
«Подтверждённая причина» — панель безусловно форматирует `Saved to #{channelName}` из title звонка.
Проверка тикета «Standalone Call не показывает ложный #канал» на текущем билде не выполняется.

### Отклонено (не дефект) — «участник, который сам не показывает, видит только первую из двух демонстраций»
Первый замер (клиент хоста, вкладка открыта ~50 минут): у хоста 2 трека и только `QA Bob's screen`,
у обоих демонстрирующих — 3 трека и обе подписи. Выглядело как потеря второй демонстрации у наблюдателя.
Причина та же, что у бейджа записи — **устаревшая долгоживущая вкладка**. После перезагрузки хоста и
повторного входа, последовательный прогон с проверкой состояния между шагами:
```
STEP0 baseline   alice tracks 0 []                 bob tracks 0 []                 carol tracks 0 []
STEP1 bob включает демонстрацию
STEP2            alice tracks 2 ["QA Bob's screen"] bob   tracks 2 [...]            carol tracks 2 [...]
STEP3 carol включает вторую, одновременную
STEP4            alice tracks 3 ["QA Carol's screen","QA Bob's screen"]
                 carol tracks 3 ["QA Bob's screen","QA Carol's screen"]
STEP5 (+15 с)    alice tracks 3 (обе)  bob tracks 3 (обе)  carol tracks 3 (обе)
```
Две одновременные демонстрации работают у всех троих, каждая подписана владельцем. Кандидат снят.
**Второй случай за прогон, когда старая вкладка произвела ложноположительный результат в измерении вида
«состояние должно смениться/исчезнуть».**

### Verified working — screen share: on_request, отказ, одобрение, старт
- Режим по умолчанию у новой встречи — `screen_share_mode: "on_request"`, у участника кнопка
  `Request to share`.
- Заявка попадает к хосту в панель Participants: секция `REQUESTS (1)`,
  `[data-testid="permission-request-row"]`, кнопки `Approve Screen share for <имя>` /
  `Reject Screen share for <имя>`. **На кнопке Participants есть счётчик**
  `[data-testid="call-controls-waiting-count"]` = «1», 20×20, в правом верхнем углу кнопки
  (проверено измерением: ближайшая кнопка тулбара — `call-controls-people-toggle`, расстояние 20 px).
  Первый заход через опрос только тостов/диалогов счётчика не увидел — это была узость инструмента.
- Отказ доходит до заявителя за 149 мс: кнопка `Requesting…` → `Request denied — try again`,
  плюс видимый тост 352×77 «Your request to share was declined» (жил ~8.7 с).
- Одобрение: кнопка становится `Share screen`, тост «You can now share your screen»,
  дальше `Stop sharing` и тайлы `screen-share-track` / `share-thumbnail` «QA Bob's screen» у всех.

### BUG-4 [Low] [frontend] Настройка «In-call chat» лежит в MEMBER PERMISSIONS и подписана «members», но отключает чат и самому ведущему
Секция `MEMBER PERMISSIONS` панели Meeting settings, дословно (перечислены видимые листовые узлы секции):
```
"MEMBER PERMISSIONS"
"In-call chat"   "When disabled, members can read the history but cannot send messages."
"Reactions"      "When off, no one can send live emoji reactions."
"MICROPHONE"     Allowed | On request | Blocked
"CAMERA"         Allowed | On request | Blocked
"SCREEN SHARE"   Allowed | On request | Blocked
```
Ведущий выключает `In-call chat` → у него самого:
```
textarea.disabled = true,  placeholder "Message everyone"
Send.disabled = true,  плашка "Chat is disabled for this call"
[data-testid="ic-message-react-trigger"] : 0
```
**Два положительных контроля на том же экране, в той же секции, в той же сессии:**
1. `MICROPHONE = Blocked` (`mic_mode: "blocked_all"` подтверждён ответом сервера) — у участника
   `Unmute` `disabled: true` и пропадает `Select microphone`, **у ведущего `Mute` и
   `Select microphone` остаются `disabled: false`**. То есть member-only тут работает как написано.
2. Соседний тумблер `Reactions` подписан «no one» — и действительно снимает контрол у всех, включая
   ведущего. Продукт различает две формулировки в одной секции намеренно.
Значит расходится именно `In-call chat`: подпись говорит «members», поведение задевает ведущего.

### Verified working — политика записи, гостевая ссылка, глубина истории чата, гость
- `recording_enabled: false` → у ведущего исчезает `[data-testid="recording-start-access-trigger"]`,
  а прямой `POST /meeting/<id>/recording/start` отвечает
  `400 {"key":"REALTIME_RECORDING_DISABLED","message":"recording is disabled in this meeting's settings"}`.
  Энфорсмент с обеих сторон. (Тумблера для этой настройки в панели нет — только при создании/по API.)
- `who_can_see_guest_link`: при `host_only` у участника **нет кнопки `Add to call` вовсе**; при
  `everyone` она появляется, и диалог содержит только гостевую ссылку
  (`guest-links-view-only`, без `add-to-call-members`/`workspace-member-picker`). Т.е. настройка
  прячет диалог, в котором участнику всё равно нечего было бы делать, — расхождения нет.
- Глубина истории Call chat: 128 сообщений в звонке (120 доставлены через API как setup),
  панель после холодной загрузки рендерит **127** строк у участника — ровно все, кроме одного
  приватного, адресованного гостю. Прокрутка вверх ничего не догружает, потому что всё уже есть.
  `GET /meeting/<id>/messages?limit=100` отдаёт 100 + `next_cursor`; UI дочитывает.
- Гость (по guest-ссылке, без аккаунта): панель Call chat есть, история до входа видна (только
  публичное), есть `Thread` и `React`, есть селектор получателя `To`, отправка работает — строка
  подписана `Guest Visitor D (Guest)`. Живые реакции: 6 эмодзи, отправляются.
- Приватное сообщение **ведущий → гость** видно ведущему («Private to …», статус `Read`) и гостю,
  и **не видно** второму участнику-члену. Список `To` у ведущего: `Everyone`,
  `Guest Visitor D (guest)`, `QA Bob (member)`.
- Политика `chat_enabled: false` доходит до **гостя** за 355 мс (опрос 300 мс, health 305 мс/сэмпл),
  и **сохраняется после перезагрузки** и у гостя, и у участника — fail-open при холодной загрузке
  нет ни на одном из двух путей.
- Живая реакция: `[data-testid="participant-reaction-burst"]` 72×56, у другого участника видна
  ~2.85 с (t+7145…t+9996 мс при опросе 250 мс), позиция стабильна.
- Лимит участников в панели: ввод меньше числа присутствующих отклоняется с текстом
  «The limit cannot be lower than the number of people already in the call.», сервер не меняется
  (`max_participants` остаётся 0), поле откатывается. Значение, равное числу присутствующих, сохраняется.
- Длина сообщения Call chat: жёсткий предел 500 символов со счётчиком «500/500»; попытка вставить
  4200 обрезается до 500, отправка проходит.

### Инструментальные ошибки этого прогона (для себя и для PITFALLS)
- Срез `String(i.value).slice(0,90)` при чтении гостевой ссылки обрезал URL ровно на 90 символах
  (реальная длина 104). Обрезанная ссылка открывает страницу **«This invite link is no longer valid»** —
  то есть выглядит как настоящий дефект гостевой ссылки. Читал бы дальше — написал бы ложный баг.
- Клик по радио `meeting-settings-mic-mode-blocked_all` по `boundingBox()` без
  `scrollIntoViewIfNeeded` не долетел: `aria-checked` не изменился, `mic_mode` на сервере остался
  `allowed_all`, а участник сохранил микрофон — читается как «настройка не применяется».
  Поймано только сверкой с `GET /meeting/<id>/settings`.
- Селектор `text=${target} (member)` в сниппете приватной отправки не находил гостя, который
  подписан `(guest)`; результат был `abort: recipient not set`, а не ложный вывод.

### BUG-5 (кандидат, Medium) [frontend] Вариант доступа к записи по умолчанию подписан «Everyone in the meeting», а по описанию — шире встречи
Диалог `Recording access`, открывается по `Record` до старта записи. Полный текст диалога (474 символа,
перечислены все видимые листовые узлы, срезов нет):
```
"Recording access"
"Who can view this recording?"
[выбран по умолчанию] "Everyone in the meeting"
                      "Everyone who can see this call, including people who never joined it."
                      "People who joined the call"
                      "Only those who actually entered the call, plus the recording author and the meeting owner."
                      "Private"
                      "The recording author, meeting owner, and selected viewers can view the recording."
[data-testid="recording-access-broad-audience-warning", видим]
                      "Choosing this option lets everyone who can see the call view its recording,
                       whether or not they joined."
"Cancel"  "Start recording"
```
Название первого варианта — «Everyone **in the meeting**» — описывает более узкую группу, чем то, что
он делает по собственному описанию и по собственному предупреждению: «including people who never
joined it» / «whether or not they joined». Группу «в встрече» на самом деле означает **второй**
вариант, «People who joined the call». Самый широкий вариант при этом выбран по умолчанию.
Положительный контроль в том же диалоге: два других варианта подписаны согласованно со своими
описаниями. Нужен дедуп-грep по `recording access` перед публикацией — не выполнен.

## Итог прогона (таймбокс снят досрочно)
Найдено: BUG-1 (Medium), BUG-2 (Low), BUG-3 (Low, ALK-2769 закрыт но воспроизводится),
BUG-4 (Low), BUG-5 (кандидат, дедуп не доделан). Плюс кандидат про «X is typing…» (~4 с после доставки).
Снято два ложных кандидата, оба из-за долгоживущей вкладки.
Отчёт `reports/aloqa-calls-collab-qa-2026-08-30-D.html` НЕ написан и НЕ опубликован.
Репро-сниппеты для findings НЕ оформлены по контракту `_repro-template.mjs`.
