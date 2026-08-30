
## Baseline (control) — lane E had no calls at all before this session

```
GET /api/v1/meetings/history?limit=5                       -> {"meetings":[]}
GET /api/v1/workspace/W4QEF1XTURESO01/meetings/active      -> {"meetings":[]}
hub: "Recent calls  All · 0  Group meetings · 0  1-to-1 · 0   No recent calls yet."
```
Every hub/history/detail record measured today was produced by this session. Empty state renders
correctly. Confirmed with the supervisor that no other sector needs lane E history untouched.

## Call 1 — `V4P254SGPHJ16Y5` "E rec probe 1" (hub-started, manual admit, recorded)

Timeline from `GET /api/v1/meeting/V4P254SGPHJ16Y5/events?limit=200` (all times UTC, local = +05):

```
07:49:28  meeting.started ; participant.joined  alice
07:50:16  participant.waiting  bob
07:51:37  participant.admitted bob   (by alice)
07:51:38  participant.joined   bob      <- bob segment 1 starts
07:52:01  recording.started  actor=alice  source=backend
07:54:37  participant.left     bob      <- bob segment 1 ends   (2:59)
07:58:11  recording.stop_requested actor=alice
07:58:41  participant.waiting  bob
07:58:57  participant.admitted bob ; participant.joined bob   <- segment 2 starts
07:59:24  participant.left alice ; participant.left bob ; meeting.ended
                                        <- bob segment 2 ends   (0:27)
```

Bob's real time in the call = 2:59 + 0:27 = **3:26**. Alice = 9:56.

### BUG-1 [High] [frontend] Итоговый экран звонка засчитывает вышедшему и вернувшемуся участнику всё время между первым входом и последним выходом, включая то, когда его в звонке не было

Экран `Call ended` (оверлей `call-ended-overlay`), который видят **оба** участника:

```
"Call ended · E rec probe 1 · 9m 57s | Duration 9m 57s | Recording Available | Chat history 2 messages
 PARTICIPANTS
   QA Alice  Left  Joined 12:49 PM · left 12:59 PM   9:57 in call
   QA Bob    Left  Joined 12:51 PM · left 12:59 PM   7:47 in call"
```

Через один клик, на странице завершённого звонка `/w/<ws>/calls/<id>` → `View all`
(диалог «Participants — Historical participant activity for this call»):

```
"QA Alice  Left  Joined 12:49 PM · left 12:59 PM   9:56 in call
 QA Bob    Left  Joined 12:51 PM · left 12:59 PM   3:26 in call"
```

3:26 — верно (2:59 + 0:27 по событиям выше). 7:47 = 07:59:24 − 07:51:37, то есть
последний выход минус первый вход: промежуток, когда Bob был вне звонка (4:20), засчитан ему.

Источник 7:47 виден напрямую — `GET /api/v1/meeting/<id>/participants` отдаёт **одну** строку на
пользователя:

```
{"participants":[
  {"user_id":"<alice>","joined_at":"2026-08-30T07:49:27Z","left_at":"2026-08-30T07:59:24Z"},
  {"user_id":"<bob>",  "joined_at":"2026-08-30T07:51:37Z","left_at":"2026-08-30T07:59:24Z"}]}
```

Итоговый экран считает `left_at − joined_at` по этой строке; диалог на странице звонка считает
по сегментам. Позитивный контроль встроен: одно и то же приложение на соседнем экране показывает
правильное число из тех же данных.

**Нужен второй прогон** (call 2) прежде чем описывать как безусловное.

### Adjacent / dedup notes (call 1)

- `0:00 in call` для участника **идущего** звонка (диалог `View all` на `/calls/<id>` пока звонок
  активен) — воспроизводится на rc.7, то есть ALK-3573 (`perf(calls): synchronize call surface
  clocks`) этого не чинит. Это опубликованная находка сектора B от 26.08
  (`reports/aloqa-calls-around-qa-2026-08-26-B.html`), не моя — только подтверждение на новом билде.
- В том же диалоге на **идущем** звонке Bob, который уже вышел, вообще отсутствует: показан только
  Alice («Current»), хотя заголовок диалога — «Historical participant activity for this call».
  После завершения звонка Bob появляется. Кандидат, требует отдельной проверки.
- Meeting log: `recording.started` (actor = alice, source = backend) выводится как
  «Recording started automatically» — **ALK-2826**, уже заведено.
- Meeting log: 7 из 13 строк — обобщённые ярлыки без события: «Media activity By QA Bob»
  (`track.published` / `track.unpublished`), «Participant activity By QA Bob»
  (`participant.reconnected`), «Recording activity» (`recording.egress_started` /
  `egress_updated`). Смежно с **ALK-3712** (то же обобщение для событий блокировки); критерии
  приёмки ALK-3712 перечисляют модераторские действия, guest, локализацию — медиа-события в них
  не входят, но семейство одно. В отчёт не выношу.
- Фильтр активности с нулевым счётчиком (`Screen share 0`, `Files 0`) выдаёт полностью пустую
  область без empty-state; появляется кнопка `Clear`. Кандидат низкого приоритета.
- Alice видит `Logs 27`, Bob — `Logs 23`: события с `visibility:"admin"`
  (`participant.waiting`, `participant.admitted`) отдаются только ведущему. Похоже на замысел.
- Оценка звонка: Bob нажал `4 stars` → надпись «Rating saved», `GET /meeting/<id>` у Bob даёт
  `{"my_rating":4,"owner_only":true}`, у Alice — `{"average":4,"count":1,"owner_only":false}`.
  Где владелец видит средний балл в интерфейсе — **не найдено**, проверяю отдельно.
- Кнопка `Leave call` у ведущего и у участника открывает один и тот же диалог с текстом
  «The call continues for everyone else…» — это **ALK-3475**, уже заведено.

## Dedup — the all-statuses grep (`jira_cache.py grep`), and what it changed

`list --open-bugs` shows 188 of 1654 Bugs; the closed/blocked statuses are where a *specified*
state lives. Both results below came from `grep`, not from the open-bugs list.

**Killed: «оценка звонка нигде не показывается».** Измерено верно — полное перечисление всех
поверхностей владельца (страница звонка, 3 вкладки, хаб, диалог участников; полный `innerText`,
не срез) не содержит ни среднего балла, ни счётчика:

```
bob   POST rating 4 -> «Rating saved»
bob   GET /api/v1/meeting/<id> -> "rating":{"my_rating":4,"owner_only":true}
alice GET /api/v1/meeting/<id> -> "rating":{"average":4,"count":1,"owner_only":false}
```

**ALK-2203 [Task/TESTING]** описывает ровно это как принятое решение: «no user sees any rating but
their own — not the average, not the rater count, and not the organiser either», `owner_only`
намеренно выведен из употребления, а тест фиксирует ключи хука, чтобы агрегат не вернулся молча.
Замер верный, вывод — нет. **Находки нет.**

**Заострено: ALK-2809 [Bug/TESTING]** «Повторный вход завышает N in call в истории звонка» —
дословное совпадение с BUG-1, включая подтверждённую причину («экран использует сводную пару
joined_at/left_at вместо суммирования интервалов»). Его шаги заканчиваются словами «Завершить
звонок и открыть раздел PARTICIPANTS», то есть страницей завершённого звонка — **и она на rc.7
считает верно** (3:26, 1:23). Старый расчёт остался на **итоговом экране звонка**, экраном раньше.
TESTING в этом проекте = закрыт, дедупу не подлежит; находку сохраняю и сужаю до оверлея.

Смежные, в отчёт не идут:
- **ALK-1996** [BLOCKED] — ended summary participant count различается у разных клиентов
  (`endCallLocally.ts` считает из локального кэша). Другое поле; у меня оба клиента показали
  одно и то же число, то есть механизм другой.
- **ALK-1927** [BLOCKED] — «ended call summary показывает вымышленные данные». Все три критерия
  приёмки на rc.7 выполняются: Recording показан как `Available`, участники перечислены,
  quality не выводится вовсе.
- **ALK-2977** [Backlog] — рисовать `participant.reconnected` как «Переподключение…», а не парой
  «вышел/вошёл». Родственно моей заметке про журнал.
- **ALK-2247** [BLOCKED] / **ALK-2359** [TESTING] — ложная длительность у недопущенного из лобби.
- **ALK-2238** [TESTING] — гость дублируется в Call Details и завышает participant count.
- **ALK-3475** — текст диалога выхода у последнего участника. Воспроизведён дословно на rc.7.
- **ALK-3145** — «Join» вместо «Return to call» у того, кто уже в звонке. Воспроизведён.
- **ALK-3473** — групповой звонок описан словарём личного вызова («Incoming call» в карточке канала).
- **ALK-2826** — «Recording started automatically» для ручной записи. Воспроизведён.
- **ALK-3712** — обобщённое «Participant activity» в журнале.

## Verified working (rc.7)

- **Восстановление после перезагрузки страницы в звонке.** Bob перезагрузил вкладку дважды —
  возврат в звонок за ~1.1 с, без лобби и без повторного одобрения, часы звонка продолжились
  (1:47). События: `participant.reconnected`, **не** пара left/joined — то есть перезагрузка не
  запускает дефект BUG-1. Опрос шёл с запрошенным интервалом 300 мс, фактически ~950 мс
  (машина нагружена); утверждение опирается на выборки на 127 / 444 / 759 / 1073 мс.
- **Минимальная длительность записи.** Кнопка остановки в течение 15 с подписана
  «You can stop in 0:09» и `disabled` — запись короче `min_duration_sec` через интерфейс создать
  нельзя. Ровно то поведение, которое заявлено в `recordings`.
- **Завершение звонка во время записи.** `End for everyone` при идущей записи даёт полный артефакт
  (`status:"completed"`, `duration_sec:23`, `file_size:496465`), он появляется на вкладке Recording.
- **Экспорт журнала звонка.** `Export` отдаёт `call-<id>-log.csv`, содержимое — полный журнал
  видимости этого пользователя (23 строки), колонки `occurred_at,event_type,actor,target,note`.
- **Скачивание записи.** `Download` → `GET /api/v1/meeting/recordings/<id>/content` → файл
  `recording_<id>.mp4`.
- **Управление несколькими записями одного звонка.** Три записи, вкладка `Recording 3`, выбор
  строки переключает плеер и заголовок.
- **Диалог участников после завершения звонка** считает время присутствия по сегментам верно
  (см. BUG-1), помечает вышедшего раньше чипом `Left early`.
- **Пагинация фильтров журнала.** `All 13 = People 4 + Screen share 0 + Files 0 + Recording 3 +
  Meeting 6`; после завершения `All 23 = 7 + 0 + 0 + 6 + 10`. Суммы сходятся в обоих случаях.

## BUG-1 подтверждён — четыре прогона

| звонок | реальные интервалы участника | итоговый экран | диалог `View all` |
|---|---|---|---|
| `V4P254SGPHJ16Y5` | 2:59 + 0:27 | **7:47** | 3:26 |
| `V4P25LAGD7FGC0K` | 0:25 + 0:21 + 0:37 | **6:17** | 1:23 |
| `V4P270UK921IPD7` | 2:36 + 1:20 | **20:23** | 3:56 |
| `V4P281C5UQND7N2` (снипет) | 0:46 + 1:23 | **3:33** | 2:09 |

Контроль без выхода-возврата (`V4P25XEBSCJUREB`): оверлей и диалог совпадают (2:45 / 2:35).
Оба клиента (host и участник), **оба со свежей перезагрузки**, показали одно и то же неверное
число (20:23) — то есть это не клиентский снимок (ср. ALK-1996) и не возраст вкладки.
Источник числа виден прямо: `GET /api/v1/meeting/<id>/participants` отдаёт **одну** строку на
пользователя, `left_at − joined_at` = ровно то, что печатает оверлей.

Перезагрузка страницы в звонке даёт `participant.reconnected`, **не** пару left/joined, поэтому
дефект ею не запускается — нужен явный выход через подтверждение и повторный вход.

Снипет: `snip/e-rejoin-summary.mjs` (драйвер alice, подключается к браузеру bob по CDP).

## BUG-2 — гостю на итоговом экране не дают ни одного элемента управления

Звонок `V4P28CQR1UTPNSL`. Опрос гостевого документа **с момента до** завершения, 189 выборок за
60.3 с, фактический интервал **319 мс** (94% от запрошенных 300 мс — деградации нет):

```
ms    видимых button|a[href]|[role=button]|input
6     15   Spotlight view, Enter fullscreen, Participant actions…, Mute, …, Leave call
5628  (хост нажал End for everyone)
5935   0   "This meeting session has ended | The host ended this meeting. Use a new invite link
            when another meeting starts. | E guest end probe 2  Ended | PARTICIPANTS
            QA Alice 1:25 in call | O Guest Two 0:16 in call"
…до 60256 мс больше ни одного изменения состояния — ничего так и не появилось
```

Отдельное перечисление по селекторам на этом экране (второй прогон, звонок `V4P288QKU0X0FHF`):

```
button 0 | a[href] 0 | [role=button] 0 | input 0 | [aria-label*=star] 0
[tabindex] 1 — нулевого размера (sr-only live region), вне порядка обхода
```

**Позитивный контроль — тот же звонок, тот же момент, участник вместо гостя:**

```
ALICE: "Call ended · E guest end probe 2 · 1m 25s … RATE QUALITY  Done  Call again"
кнопки: 1 stars, 2 stars, 3 stars, 4 stars, 5 stars, Done, Call again, Close call summary  (8)
GUEST: 0
```

Дедуп: **ALK-3733** [Bug/Backlog] описывает этот же экран, но его критерии приёмки — только
показ названия встречи; у меня название показано («E guest end probe 2 Ended»), то есть его
первый критерий на rc.7 выполняется. Пересечения с моей находкой нет.
**ALK-2203** [Task/TESTING] в критериях приёмки как поставленное содержит «A guest can rate and
sees their own score back» — на этом экране формы оценки нет вовсе.
**ALK-3057** [TESTING] — «гость видит экран сессия завершена при каждой перезагрузке» — другое.

## BUG-3 — «Saved to #…» называет каналом то, что каналом не является

```
standalone-звонок (Start now, "E rec probe 1"):
  <p>Saved to #E rec probe 1</p>        vis:true, opacity 1, не ссылка
  GET /api/v1/workspaces/<ws>/channels -> 4 канала (полное тело, 994 симв.):
     qa-general, qa-private, e-dirprobe, e-arch-oiw3 — канала «E rec probe 1» нет
  GET /api/v1/meeting/V4P254SGPHJ16Y5 -> "channel_id":""

звонок из канала #qa-general:
  <p>Saved to ##qa-general</p>          ← две решётки
  GET /api/v1/meeting/V4P25LAGD7FGC0K -> "channel_id":"C4QEGENERAL0001",
                                         "channel_name":"qa-general", "name":""
```

Дедуп: **ALK-2769** [Bug/**TESTING**] «Call chat показывает несуществующий канал как место
сохранения» — та же находка, с подтверждённой причиной («панель передаёт title звонка как
channelName и безусловно форматирует Saved to #{channelName}»). TESTING в этом проекте = закрыт,
дедупу не подлежит. **Оба его критерия приёмки на rc.7 не выполняются**: standalone по-прежнему
показывает ложный `#канал`, а звонок канала показывает имя канала с удвоенной решёткой —
второго симптома в тикете нет вовсе.
