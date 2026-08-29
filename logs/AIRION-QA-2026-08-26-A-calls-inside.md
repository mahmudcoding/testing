# AIRION QA — 2026-08-26 — lane A — sector A (Calls: inside the call)

Build: `data-dpl-id="v0-61-0-rc-5-c4b5386b4a3a"` → tag `v0.61.0-rc.5`, frontend commit
`c4b5386b4a3a`, cut 2026-08-26 13:05:20 +05 (fresh — 1.5 h before session start).
Box: started 14:40 +05, deadline 2026-08-27 09:00 +05 (~18 h).
Lane A, workspace `W4QAF1XTURESO01`. Browsers: alice 9222, bob 9223, carol 9224, dave 9225.

## Current state

**Отчёт опубликован:** https://claude.ai/code/artifact/7b7b4e84-6001-403f-a293-62c7799aa46a
(исходник `reports/aloqa-calls-inside-qa-2026-08-26-A.html`; чтобы обновить — публиковать тот
же путь файла либо передавать этот URL как `url`). Строка в `reports/README.md` дописывается
**один раз в конце прогона** — на момент этой записи ещё не дописана.
Сборка стенда всё это время `v0.61.0-rc.5-c4b5386b4a3a` (стамп перечитывался несколько раз,
последний — 22:46).

**Находки — 9. Все воспроизведены минимум дважды; восемь перепроверены повторно вечером
на другом звонке.**

| # | важность | область | суть |
|---|---|---|---|
| BUG-4 | High | backend | `Admin permissions` сам включает `can_manage_meeting_settings` и не даёт снять |
| BUG-2 | High | frontend | список `BLOCKED` не сходится между модераторами; причина — ключ `participantBans` инвалидируется только в мутациях |
| BUG-10 | High | frontend | выбор именованного микрофона в звонке не срабатывает: дорожка уходит на `default`, отметка и хранилище не меняются |
| BUG-6 | Medium | frontend | `Ask to return to main room` не работает ни для кого |
| BUG-1 | Medium | frontend | приглашение заблокированного: 204 и «Invited 1 people», `Accept` → 403 |
| BUG-3 | Medium | frontend | `Revoke screen sharing` без видимого сообщения; кнопка ещё и становится disabled |
| BUG-7 | Medium | frontend | пустая комната недоступна как назначение перевода |
| BUG-8 | Medium | frontend | размещение гостя в Side Room не приходит ведущему событием |
| BUG-9 | Medium | frontend | живая реакция изнутри Side Room видна всем в главном звонке (реакции на сообщения изолированы правильно) |

**Ночная находка, отданная сектору B (у меня нет её видимого симптома):** гость, который
в момент обрыва связи находился **в Side Room**, навсегда остаётся строкой в
`GET /meeting/{id}/participants` и продолжает считаться в лимите участников. Видимая панель при этом честно показывает
меньшее число. Матрица контролей (всё в одном звонке): участник без комнаты + обрыв → исчезает за ≤20 с;
гость без комнаты + `Leave call` → исчезает; гость без комнаты + обрыв → исчезает за ≤9 с;
**гость В КОМНАТЕ + обрыв → не исчезает** (два случая ≥2 ч, третий воспроизведён по
требованию). Четвёртую клетку подсказал сектор B; тайминги и воспроизведение — мои. Последствия
на поверхностях сектора B: `PARTICIPANT LIMIT` отказывается сохранять значение, которое
экран считает допустимым, и экран `Call is full` не пускает живых людей в звонок со
свободными местами (второе измерено сектором B). Ряд наблюдений за ночь — в разделе
«Ночной блок».

**Итог ночного соака (звонок 9 часов, 4 участника):** призрачные строки **не истекают** —
на 07:53 их четыре, старшей 8 ч 49 мин; место в лимите, съеденное таким гостем, потеряно
на всё время звонка. Сам звонок за девять часов здоров: состав, плитки, соединения,
качество и таймер без замечаний, узлы DOM не растут, утечки памяти нет (доказано подменой
опрашиваемого окна: растёт heap ровно того окна, к которому ходит инструмент). Сборка
стенда всю ночь `v0.61.0-rc.5-c4b5386b4a3a`. Фикстуры лейна A на выходе проверены —
`All fixtures present and correct`.

**Что измерено и НЕ пошло в отчёт (дедуп или снято):**
- **корневая причина открытого ALK-3454** — участник, впущенный из зала ожидания, не получает
  room-scoped события звонка: клиент дважды шлёт `subscribe`, шлюз отвечает `1008`, третьей
  попытки нет. Полная трасса и исходники — в разделе «Вечерний блок»;
- **ALK-3081** — удаление из канала во время звонка канала (`call.access_revoked` не обработан);
- дефект «звонок остаётся без модератора, когда ведущий вышел» — он же в отчёте сектора B;
- подтверждены на rc.5 открытые **ALK-3027**, **ALK-2993**, **ALK-3295**, **ALK-3481**,
  **ALK-3412**, **ALK-3528**, **ALK-3529**; выглядят починенными **ALK-1849/1923**, **ALK-1917**,
  **ALK-3097**, **ALK-2956**, **ALK-1829**, **ALK-3409**, **ALK-3385**;
- 8 гипотез снято собственной перепроверкой (плашка Recording, `Pin for everyone`,
  «Delivered, но не доставлено» в чате комнаты, инертная вкладка `Main call`,
  «плейсхолдер композера противоречит адресату», `Call diagnostics` у одного окна и др.).

**НЕ дефект, но важно:** бэкенд стенда старше фронта, `PUT …/breakout-rooms/focus` → 404,
из-за чего Side Rooms ведут себя как до ALK-3479 (нет «retained main»: вкладка `Main call`
предлагает полный возврат, изнутри комнаты не видно участников главного звонка).

**Методические выводы прогона:**
1. Вкладка, провисевшая в звонке час-два, сама порождает ложные находки.
2. Отрицательный результат достоверен только с положительным контролем в том же окне и тем же
   инструментом; инструмент, не смотрящий на модальные окна, даёт уверенное «ничего не произошло».
3. Каждое число в измерительном блоке должно иметь точку отсчёта в том же блоке.
4. Перечислять надо окрестность целиком, а не то место, где ждёшь элемент (счётчик непрочитанных
   оказался **соседом** кнопки, а не потомком).
5. Дедуп — не только по открытым багам: соседний отчёт того же дня и статус `BLOCKED` дают
   совпадения, которых прописанный фильтр не видит; сверять надо утверждения, а не заголовки.

**Покрытие сектора:** все пункты области закрыты — медиа и контролы (устройства, качество,
плитки, сетка, филмстрип, пин, полноэкранный режим, PiP), панель участников и host powers,
чат звонка с тредами/личными сообщениями/реакциями/счётчиком непрочитанных, демонстрация
экрана и запись, Side Rooms целиком, горячие клавиши, push-to-talk, микс громкости.

## Scope choice — why these targets

Previous sector-A pass today (`logs/AIRION-QA-2026-08-26-A-incall.md`) ran on `v0.61.0-rc.3`.
Staging moved to `rc.5` at 13:05. `git log v0.61.0-rc.3..v0.61.0-rc.5 -- packages/features/calls`
names what is new inside this sector and therefore untested by anyone:

- `01073efab feat(calls): let hosts unban meeting participants (ALK-3448)` +
  `23576db51 fix(calls): restore release gates for participant unban (ALK-3448)`
  — **brand-new host power**, no open ALK bug against it. Primary target.
- `95a7026d2 fix(calls): keep side-room occupants in the main call and badge them by focus (ALK-3479)`
  — reworks side-room membership semantics. Secondary target.
- `d64b537d4 fix(calls): tell the presenter when a host stops their screen share (ALK-3411)`
  — new notification path in screen share.
- `992bcc2ff ALK-3409: give the workspace back when a call is minimised from its own route`
  — the prior pass recorded ALK-3409 still reproducing on rc.3; rc.5 claims the fix.
- `5fc8e9e18 fix(a11y)` / `4fc8e7c39 refactor(ui)` — restyle empty/error/notice states call-wide.

Gaps the prior pass left explicitly unfinished (its own list): filmstrip paging (needs >4
participants), PiP, host moving a participant between side rooms, camera device switching.
Its unresolved observations: participant statuses (Raise hand / Will be right back) render on
the tile only and not in the participants panel — untested on a call big enough to page tiles.

Plan: new ban/unban feature first, then side rooms under ALK-3479, then screen-share and the
4-participant surfaces (filmstrip, panel-vs-tile status), then PiP.

## Findings

### Verified working — Ban / Unban (новый host power, ALK-3448, rc.5)

Пройден полный цикл, дефектов в самом цикле не найдено:

- Меню участника у хоста содержит `Ban` отдельно от `Remove from call`.
  Диалог подтверждения: «Ban from this meeting? QA Bob will be removed and cannot rejoin
  this meeting.» — кнопки `Cancel` / `Ban` (`ban-participant-confirm-submit`).
- После бана панель участников у **хоста** показывает секцию `BLOCKED (1)` со строкой
  `QA Bob  qa.bob@aloqa.test  Unban`. Счётчик «in call» уменьшается корректно.
- **Не-хосты секцию `BLOCKED` не видят вообще** — проверено у Carol и Dave: панель
  показывает только `Participants 3 in call`. Полномочия модерации разграничены верно.
- Забаненный при прямом входе получает понятный экран:
  «You cannot rejoin this call — A host removed you from this call and blocked you from
  rejoining it. Ask them to invite you again.» + тост «You cannot join because you were
  removed from this meeting.»
- `Unban` → `DELETE /api/v1/meeting/{id}/participants/{userId}/ban` → **204**, секция
  `BLOCKED` исчезает сразу, без перезагрузки. Подтверждения не спрашивает (действие
  разрешающее — это нормально).
- После unban участник снова проходит в звонок: `Join` → «Waiting for host approval»
  → хост жмёт `Admit QA Bob` → участник в звонке. Цикл замкнулся.

**Заодно закрывается ALK-3097** (Backlog, «Заблокированный участник не видит причину
отказа при повторном входе») — на rc.5 причина показывается явным текстом, см. выше.
Проверить и закрыть — не моё решение, но тикет стоит перепроверить.

**И вторая половина ALK-3448 тоже сделана**: приём приглашения забаненным больше не даёт
generic-ошибку. `POST /api/v1/meeting/{id}/join` → 403
`{"code":403,"key":"REALTIME_MEETING_BANNED","message":"user is banned from this meeting"}`,
UI показывает «Could not join the call — You cannot join because you were removed from this
meeting.» с единственной кнопкой `Dismiss` (бесполезной кнопки `Try again` больше нет).

### Наблюдение (не отчёт): ложные тосты «X left the call» у выброшенного участника

Воспроизведено дважды, двумя разными действиями и на разных людях:

- Хост банит QA Bob → **Bob** видит `A host banned you from the call` (верно) и одновременно
  `QA Carol left the call` + `QA Dave left the call` (неверно — они никуда не выходили).
- Хост делает `Remove from call` для QA Dave → **Dave** видит `A host removed you from the call`
  (верно) и `QA Bob left the call` + `QA Carol left the call` (неверно).

То есть при выбросе участника его клиент рисует по одному тосту «ушёл» на каждого
**оставшегося** участника. Механизм тот же, что в **ALK-3484 (REVIEW)** — «End for everyone
показывает по тосту `[Имя] left the call` на каждого присутствовавшего»; там в разделе
«Проверка» прямо предполагается общий корень со сравнением состава до/после realtime-события.
**В отчёт не выношу** — тикет уже в REVIEW, это тот же дефект с другим триггером.
Тому, кто чинит ALK-3484, стоит проверить заодно ban и remove: тест на «End for everyone»
эту ветку не покроет.

### BUG-1 [Medium] [frontend] Ведущий может пригласить забаненного участника: приглашение уходит, звонит и всегда падает с 403

Хост банит участника → в панели `Participants` появляется секция `BLOCKED` с кнопкой `Unban`.
Но диалог `Add to call` из той же панели по-прежнему предлагает этого человека как обычного
приглашаемого — без какой-либо пометки, что он заблокирован. Приглашение уходит, хост видит
успех, приглашённому звонит, `Accept` всегда падает.

Хуже того, экран самого забаненного советует ровно этот путь:
«A host removed you from this call and blocked you from rejoining it. **Ask them to invite you
again.**» — то есть продукт подсказывает пользователю попросить о действии, которое не работает.

**Шаги (звонок `V4OWK8S5CXMIR95`, хост Alice, забанен Bob):**
1. Хост: `Participants` → `Participant actions` на участнике → `Ban` → подтвердить.
2. Хост: `Add to call` → отметить забаненного → `Invite`.
3. Забаненный жмёт `Accept` на входящем приглашении.

**Измерения.**

Список в диалоге `Add to call` у хоста (забанен Bob) — у Bob нет никакой пометки,
тогда как у присутствующих стоит `In call`:
```
QA QA Alice   In call
QB QA Bob                 <- забанен, помечен только отсутствием "In call"
QC QA Carol   In call
QD QA Dave    In call
```

Хост, отправка приглашения:
```
POST /api/v1/meeting/V4OWK8S5CXMIR95/invite
{"user_ids":["U4QABOB00000001"]}
-> 204
toast: "Invited 1 people to the call"
```
Одновременно та же панель показывает: `BLOCKED (1)  QB QA Bob  <email>  Unban`.

Приглашённый, нажатие `Accept`:
```
POST /api/v1/meeting/V4OWK8S5CXMIR95/join
{}
-> 403
{"code":403,"key":"REALTIME_MEETING_BANNED",
 "message":"user is banned from this meeting","trace_id":"<trace>"}
```
UI приглашённого: «Could not join the call — You cannot join because you were removed from
this meeting.» (единственная кнопка `Dismiss`).

Хосту при этом **не приходит ничего**: за 30 с после отправки в диалоге и в тостах не
появилось ни одного сообщения о неудаче — строка приглашённого какое-то время показывает
`Ringing…`, и на этом всё.

**Повторный прогон на чистом звонке `V4OWOUFTV44KVVI` — воспроизводится полностью:**
```
хост банит:  BLOCKED (1) QB QA Bob <email> Unban
диалог Add to call у хоста:
   QA QA Alice  In call
   QB QA Bob                <- забанен, никакой пометки
   QC QA Carol  In call
   QD QA Dave   In call
POST /api/v1/meeting/V4OWOUFTV44KVVI/invite {"user_ids":["U4QABOB00000001"]} -> 204
тост хоста +302 мс: "Invited 1 people to the call"
приглашённому в 6675 мс звонит: "QA Alice is calling… Accept / Decline"
Accept -> POST /join -> 403 {"code":403,"key":"REALTIME_MEETING_BANNED", …}
экран приглашённого: "Could not join the call — You cannot join because you were removed
                     from this meeting." (единственная кнопка Dismiss)
```

**Ожидаемо:** либо `Add to call` помечает забаненного как заблокированного и не даёт его
выбрать (рядом же есть `Unban`), либо `POST /invite` отвечает явной ошибкой, а хост видит
не «Invited 1 people», а причину отказа.

**Дедуп.** ALK-3448 (`TESTING`, то есть закрыт) описывал этот путь до появления Unban; в rc.5
приехали две его части — Unban и внятная ошибка вместо generic-403 — а третья («повторное
приглашение забаненного либо блокируется явной ошибкой, либо становится рабочим») не
приехала. Среди открытых багов (`list --open-bugs`) совпадений нет; ALK-3144 — про другое
(подсказка про invite link после Remove), ALK-3097 — про причину отказа, которая теперь
показывается.

**Граница секторов:** ringing/приглашения формально ближе к сектору B, но дефект — про то,
что состояние модерации (`BLOCKED`) не доезжает до соседнего контрола в той же панели
звонка, поэтому пишу здесь.

### BUG-2 [High] [frontend] Список BLOCKED не сходится между модераторами: бан и разбан видит только тот, кто их сделал

В звонке с хостом и co-host изменение бан-листа применяется только на клиенте того, кто его
сделал. У второго модератора панель `Participants` остаётся со старой копией — наблюдалось
по 45 с с шагом 500 мс, состояние не менялось ни разу; сходится только `reload` страницы.
Проверено в обе стороны, оба раза на **свежезагруженном** клиенте второго модератора, звонок
`V4OWKLH5WUTLRT2` (хост Alice, co-host Carol).

**(а) Бан не доезжает.** Хост банит QA Dave.
Панель хоста сразу: `BLOCKED (1) QD QA Dave <email> Unban`.
Панель co-host за 45 с — два состояния и всё:
```
    0 ms | Participants 4 in call  QA QA Alice HOST  QC QA Carol (you) CO-HOST  QB QA Bob  QD QA Dave
 7522 ms | Participants 3 in call  QA QA Alice HOST  QC QA Carol (you) CO-HOST  QB QA Bob
```
То есть **realtime-событие о составе доехало** (Dave исчез из списка на 7,5 с), а секция
`BLOCKED` не появилась вообще. Это и есть контроль, снимающий возражение «у клиента просто
отвалилось соединение»: в том же окне, в том же окне наблюдения другое realtime-событие
пришло вовремя. После `reload` появляется:
`BLOCKED (1) QD QA Dave <email> Unban`. Сервер знает — расходится клиент.

**(б) Разбан не доезжает.** Хост снимает бан с того же участника:
```
DELETE /api/v1/meeting/V4OWKLH5WUTLRT2/participants/U4QADAVE0000001/ban -> 204
```
Панель co-host за 45 с — **ни одного изменения**, всё это время висит
`BLOCKED (1) QD QA Dave <email> Unban`.

**Как это выглядит для человека.** Разбаненный входит заново, хост его впускает — и панель
co-host показывает его одновременно заблокированным и участником звонка:
```
Participants 4 in call
BLOCKED (1)
  QD QA Dave  <email>  Unban
QA QA Alice HOST
QC QA Carol (you) CO-HOST
QB QA Bob
QD QA Dave
```

**Решающий прогон (чистый звонок `V4OWOUFTV44KVVI`, свежий клиент co-host, широкая сеть —
ищется не только текст панели, но и любые видимые `aria-label`/текст со словами
blocked/unban).** Внутри одного окна наблюдения есть два контроля, доказывающих, что
realtime у этого клиента живой:

```
    1 ms  wide=[aria:Blocked (1), txt:Blocked (1), aria:Unban QA Dave, txt:Unban]
          panel= 3 in call | BLOCKED (1) QD QA Dave <email> Unban
          (хост уже снял бан ~на 5-й секунде: DELETE …/ban -> 204)

19319 ms  panel= 3 in call | WAITING (1) QD QA Dave Admit Deny | BLOCKED (1) …
          <- КОНТРОЛЬ 1: заявка разбаненного на вход доехала

26964 ms  panel= 3 in call | BLOCKED (1) QD QA Dave <email> Unban

28180 ms  panel= 4 in call | QD QA Dave В СПИСКЕ УЧАСТНИКОВ | BLOCKED (1) QD QA Dave <email> Unban
          <- КОНТРОЛЬ 2: впуск и рост состава доехали
```
Итоговое состояние экрана co-host: **один и тот же человек одновременно числится участником
звонка и заблокированным, с кнопкой `Unban` рядом.** Секция `BLOCKED` за всё окно не
изменилась ни разу, хотя два других realtime-события в том же окне пришли вовремя.

**Направление роли значения не имеет** — та же картина, когда бан/разбан делает co-host, а
устаревшая панель у хоста (первый прогон, звонок `V4OWK8S5CXMIR95`): co-host разбанил Bob,
у хоста `BLOCKED` провисел 40 с и ушёл только после `reload`.

**Ожидаемо:** бан-лист обновляется у всех, у кого он показан, тем же порядком, что и состав
участников — он уже доезжает по realtime. Что доставка в принципе работает, показано
отдельно: состав участников обновляется за 7,5 с, назначение co-host — в том же окне
наблюдения, снятие co-host снимает контролы у разжалованного за 6 с. Молчит только бан-лист.

**Дедуп:** среди `list --open-bugs` совпадений нет; функция приехала в rc.5 (ALK-3448),
открытых багов на неё ещё не заводили.

### НЕ БАГ — дрейф стенда: бэкенд на staging старше фронта, из-за этого Side Rooms ведут себя как до ALK-3479

**Что видно в интерфейсе.** Участник заходит в Side Room, потом возвращается на вкладку
`Main call` (не выходя из комнаты — продукт это прямо предлагает, у него две вкладки:
`Main call: <название>` и `Side Room <название>`). У него самого стенд главного звонка,
все плитки на месте, кнопка комнаты меняется на `Return`. **А у всех остальных он остаётся
в секции `IN SIDE ROOMS`** — наблюдалось 45 с с шагом 500 мс, ни одного изменения; после
`reload` строка остаётся, только имя комнаты сменяется на общее `In a Side Room`.

**Почему это не дефект продукта.** Фронт честно сообщает о переключении:
```
PUT /api/v1/meeting/V4OWKYNPU19BSM9/breakout-rooms/focus
{"focus":"main"}
-> 404
{"code":404,"key":"COMMON_NOT_FOUND","message":"endpoint not found","trace_id":"<trace>"}
```
(то же самое с `{"focus":"side_room"}` при входе в комнату).

Эндпоинт **есть** в бэкенде: `58f9f433` от 2026-08-25 17:08, «фокус участника отделён от
размещения в side room», он же добавляет `breakout_room_participants.focused_on_main` и
`PUT /api/v1/meeting/{id}/breakout-rooms/focus`. Коммит — предок текущего `dev`.

**Возраст задеплоенного бэкенда, замер:**

| маршрут | появился в бэкенде | ответ staging |
|---|---|---|
| `GET /api/v1/companies/{id}/admin/audit-log` | `f27b2c72`, 2026-08-21 10:59 | **403** `COMMON_PERMISSION_DENIED` — маршрут есть |
| `GET /api/v1/workspaces/{id}/admin/audit-log` | `f27b2c72`, 2026-08-21 10:59 | **403** — маршрут есть |
| `PUT /api/v1/meeting/{id}/breakout-rooms/focus` | `58f9f433`, 2026-08-25 17:08 | **404** `COMMON_NOT_FOUND` — маршрута нет |

То есть бэкенд на стенде — между 2026-08-21 и 2026-08-25 17:08, а фронт — `v0.61.0-rc.5`
от 2026-08-26 13:05. Фронт уехал вперёд бэкенда на 4+ дня.

Фронтовый коммит ALK-3479 (`95a7026d2`) это прямо предусматривает: «focus … absent falls
back to PLACEMENT, never to main, because the frontend ships ahead of aloqa-backend PR 914».
То есть поведение, которое я вижу, — это документированный fallback, работающий ровно так,
как задумано, когда бэкенд ещё не приехал.

**Вывод: в отчёт не идёт.** Это дрейф стенда, а не дефект кода (CLAUDE.md: «Check whether
staging is broken before blaming the product»). Чинится деплоем бэкенда, а не правкой.

**Важно для соседних сессий:** любой, кто сегодня трогает Side Rooms на этом стенде, увидит
«участник вернулся в главный звонок, а числится в комнате» и с высокой вероятностью заведёт
на это баг. Это ложное срабатывание — здесь измерение, которое его закрывает.

**Что из Side Rooms всё-таки проверяемо на этом стенде** (не зависит от focus):
создание комнаты, видимость public/private, приглашение, вход/выход, закрытие комнаты,
`Add people`, badge по размещению (он как раз работает: пока участник реально в комнате,
остальные видят `IN SIDE ROOMS <имя> <комната>`).

### Verified working — Side Rooms по размещению

- Создание публичной комнаты: `POST /api/v1/meeting/{id}/breakout-rooms`
  `{"visibility":"public","name":"Room A","invitee_user_ids":[]}` → **201**, создатель
  автоматически входит (`POST /api/v1/meeting/breakout-rooms/{room}/join` → 200).
- Пока участник реально в комнате, остальные видят его в панели участников в секции
  `IN SIDE ROOMS` с именем комнаты — это новая часть ALK-3479 («retained-main-full-side»),
  и она работает: плитка участника **остаётся в главной сетке**, он не пропадает.
  Проверено у Bob и Carol: 4 плитки на месте, при этом Alice помечена комнатой.
- Вкладки внутри звонка: `Main call: <название>` (с индикатором `Main call audio, 30%`)
  и `Side Room <название>` — то есть звук главного звонка сохраняется в комнате.

### Rig, не продукт: «Page crashed» при клике по вкладке Main call

В 15:3x клик по `Main call: QA-A-NIGHT-3` вернул `DRIVE-ERROR: page.waitForTimeout: Page
crashed`. Проверка сразу после: **все четыре порта лейна (9222–9225) не слушают, процессов
Chrome for Testing — ноль**, свободной памяти ~8 ГБ. То есть упал не рендерер от клика, а
браузеры были закрыты извне (соседняя сессия пересобирала риг). После пересборки тот же
клик выполняется штатно и отдаёт `PUT …/focus 404`. **Не дефект продукта.**

### BUG-3 [Medium] [frontend] `Revoke screen sharing`: показывавшему не показывают ничего видимого — хотя строка для этого в сборке есть

Хост обрывает демонстрацию экрана участника (`Participant actions` → `Revoke screen sharing`
→ подтвердить). Показ прекращается, плитка исчезает у всех, кнопка возвращается в
`Share screen` — и **видимого сообщения показывавшему не появляется**. Для микрофона и камеры
такие же действия хоста сопровождаются видимым сообщением; молчит ровно тот случай, где
догадаться нельзя: пропавший экран выглядит как падение приложения.

**Шаги:** участник показывает экран → хост: `Participant actions` → `Revoke screen sharing`
→ подтвердить → смотреть на экран показывавшего.

**Измерение.** Контроль и проверяемое действие в одном окне наблюдения 45 с, поиск ведётся
**по всему видимому DOM** (а не по контейнерам тостов — промпты в этом продукте рисуются и на
сцене звонка), шаг 400 мс:
```
t≈4 c   хост: "Turn off QA Dave's camera"
  4831 ms  на экране участника: "A host turned off your camera"        <- контроль прошёл

t≈24 c  хост: "Revoke screen sharing" -> подтверждение
  за оставшееся время НИ ОДНОГО видимого сообщения не появилось
```

**То, что всё-таки появляется, сообщением не является.** Через ~13 с после отзыва в DOM
возникает текст `Screen sharing is not allowed for you in this call.` — но это:
```
  title  "Screen sharing is not allowed for you in this call."  видимый элемент 44x44
  text   "Screen sharing is not allowed for you in this call."  элемент 1x1
```
то есть **всплывающая подсказка на самой кнопке** (её надо навести) и **sr-only узел 1x1**.
Ни то, ни другое пользователь при обрыве показа не увидит. Текст к тому же постоянный —
он всё ещё на месте спустя минуты, то есть это подпись состояния отключённой кнопки, а не
уведомление о событии.

Действие точно доехало: кнопка сменилась `Stop sharing` → `Share screen`, плитка
`QA <имя>'s screen` исчезла со стенда у всех, исходящее видео показа прекратилось.
Воспроизведено трижды, на трёх разных звонках.

**Подтверждённая причина — не в деплое.** Фикс ALK-3411 (`d64b537d4`, «tell the presenter
when a host stops their screen share») — предок задеплоенного коммита `c4b5386b4a3a`
(`git merge-base --is-ancestor` → YES). Строка есть **в исходнике на самом задеплоенном
коммите** (читается по sha, не из рабочего дерева):
```
git grep -n "screenShareStoppedByHost" c4b5386b4a3a -- packages/core/src/i18n/dictionaries/en.ts
c4b5386b4a3a:packages/core/src/i18n/dictionaries/en.ts:3331:
  'calls.moderation.screenShareStoppedByHost': 'A host stopped your screen sharing',
```
и она же лежит в отданном браузеру бандле:
```
grep по всем 55 загруженным чанкам сборки ?dpl=v0-61-0-rc-5-c4b538:
  "A host stopped your screen sharing" -> 224o200xo3zzl.js
  "A host turned off your camera"      -> 224o200xo3zzl.js
  "A host muted your microphone"       -> 224o200xo3zzl.js
  ключ "screenShareStoppedByHost"      -> 224o200xo3zzl.js, 0qp8pgax96s11.js
```
То есть новая строка приехала тем же чанком, что и две работающие, но на экране не
появляется. Кадр, на который фикс опирается (`participant.force_muted` с полем `device`),
в бэкенде существует давно — последняя правка
`realtime-service/.../meeting/service/moderation.go` от 2026-08-17, раньше задеплоенного
бэкенда (он ≥ 2026-08-21, см. раздел про дрейф). Это не тот же случай, что Side Rooms:
ветка кода на стенде есть, кадр к ней приходит, сообщение не показывается.

**Ожидаемо:** показывавшему показывается «A host stopped your screen sharing» тем же
способом, что «A host muted your microphone» и «A host turned off your camera».

**Дедуп.** ALK-3411 существует и находится в статусе **REVIEW** — вне фильтра открытых
багов (`Backlog/Ready/In Progress`), формального дублирования нет. Это **результат
перепроверки на rc.5**: фикс на стенде, дефект воспроизводится. Ровно это нужно ревьюеру
PR #2793.

### СНЯТО — наблюдение прошлой сессии «статусы участника видны только на плитке»

Прошлый прогон (`AIRION-QA-2026-08-26-A-incall.md`, наблюдение №1) предположил, что
`Raise hand` и `Will be right back` рисуются только на плитке и никак не отражаются в панели
участников. **Это не так** — оба статуса есть и там, и там. Полное перечисление потомков
плитки и строки панели (не срезанное по количеству), звонок `V4OWLOQ55W7PFIY`:

```
Will be right back:
  TILE  span participant-tile-away-label / "Will be right back"
        span participant-away          / "Will be right back"
  ROW   svg                            / "Will be right back"

Raise hand (поверх предыдущего):
  TILE  span participant-hand-raised   / "Hand raised"
  ROW   svg                            / "Hand raised"
```

Моё собственное первое измерение показало «на плитке пусто» — потому что список маркеров
плитки был срезан `slice(0,10)`, а away-маркеры стоят в конце. Классическая ошибка из
CLAUDE.md («Prove absence by enumerating elements»): срезанное перечисление — не
доказательство отсутствия. Нить закрыта, переоткрывать не нужно.

### BUG-4 [High] [backend] `Admin permissions` выдаёт право «Manage meeting settings», которого хост не давал, и не даёт его снять

Хост открывает `Participant actions` → `Admin permissions…`, отмечает **одно** право
(`Mute participants`), остальные двенадцать оставляет выключенными, жмёт `Assign as admin`.
Сервер отвечает 204. При повторном открытии того же диалога отмечено **два** права:
`Mute participants` и `Manage meeting settings`. Второе хост не включал.

Снять его нельзя: снимаешь галочку, отправляешь — запрос уходит с `false`, сервер отвечает
204, право остаётся включённым.

**Шаги (звонок `V4OWLOQ55W7PFIY`, хост Alice, цель Bob):**
1. `Participants` → `Participant actions` на участнике → `Admin permissions…`.
2. Отметить только `Mute participants`, остальное оставить выключенным → `Assign as admin`.
3. Снова открыть `Admin permissions…` у того же участника.
4. Снять `Manage meeting settings` → `Assign as admin`. Снова открыть.

**Измерения.**

Состояние чекбоксов в момент отправки (шаг 4, снято с самого диалога):
```
Manage chat=false            Pin video for everyone=false   Manage Side Rooms=false
Manage microphones=false     Manage reactions=false         Manage recording=false
Manage cameras=false         Approve requests=false         Manage meeting settings=false
Manage screen sharing=false  Remove participants=false
                             Mute participants=true
```

Запрос, который при этом уходит:
```
POST /api/v1/meeting/V4OWLOQ55W7PFIY/admins/U4QABOB00000001
{"can_manage_chat":false,"can_manage_microphone":false,"can_manage_camera":false,
 "can_manage_screen_share":false,"can_manage_breakout_rooms":false,"can_pin_video":false,
 "can_assign_admins":false,"can_manage_reactions":false,"can_approve_requests":false,
 "can_kick_participants":false,"can_mute_participants":true,"can_manage_recording":false,
 "can_manage_meeting_settings":false}
-> 204
```

Что сервер отдаёт назначенному участнику сразу после этого:
```
GET /api/v1/meeting/V4OWLOQ55W7PFIY/my-permissions
-> 200
{"role":"admin","permissions":{ ... "can_manage_meeting_settings":true,
                                    "can_mute_participants":true, ...остальные false }}
```

**Подтверждённая причина — узкая ответственная граница.** Клиент отправляет
`can_manage_meeting_settings:false` в теле запроса (тело снято целиком, выше), сервер
отвечает 204 и продолжает отдавать `true`. Значит поле теряется или переопределяется на
стороне сервера — в клиенте его никто не выкидывал.

**Остальная часть диалога работает верно** (проверено): выданное право применяется точно —
у участника с одним `Mute participants` меню над другим участником состоит ровно из
`Pin for me`, `Stop watching`, `Mute <имя>`; ни `Remove from call`, ни `Ban`, ни
`Pin for everyone` не появляется. Секцию `BLOCKED`/`Unban` он тоже не видит.
Диалог корректно показывает сохранённое состояние остальных двенадцати галочек.

**Граница секторов:** сам диалог — host powers, это сектор A. Последствие (участник может
менять Meeting settings) проявляется на поверхности сектора B.

**Дедуп.** Среди открытых багов (`Backlog/Ready/In Progress`) совпадений нет. Ближе всего
два закрытых (`TESTING`):
- **ALK-1829** «Limited meeting admin получает полный Co-host UI и может оборвать собственную
  сессию через End for everyone» — тот же сценарий (админ с единственным `can_manage_chat`),
  но симптом другой и он **починен**: у такого участника в тулбаре есть `Leave call` и нет
  `End for everyone` (перечислены все видимые кнопки). А `Meeting settings` есть — это моя
  находка, и её причина (сервер сам включает `can_manage_meeting_settings`) в ALK-1829 не
  называется.
- **ALK-2956** «Диалог Admin permissions всегда открывается пустым…» — тоже починено: диалог
  корректно показывает сохранённое состояние (у Bob при повторном открытии стояла именно
  выданная галочка).

**Чистое воспроизведение на втором аккаунте** (звонок `V4OWLWWDCWQU0DJ`, цель — Carol,
администратором никогда не была, диалог при открытии полностью пустой):
```
запрос:  {"can_manage_chat":true, ...все остальные false...,
          "can_manage_meeting_settings":false}          -> 204
сервер:  GET /api/v1/meeting/{id}/my-permissions -> 200
         role=admin, true: can_manage_chat, can_manage_meeting_settings
```
То есть право включается само при любом назначении администратора, а не тянется из
прошлого состояния.

**Видимое последствие — участник действительно управляет звонком.** У Carol, которой выдали
только `Manage chat`, панель `Meeting settings` полностью рабочая: `WHO CAN JOIN`
(`Host approval` / `Anyone`), поле `MEETING NAME`, `Password protection`,
`Require approval to join`, `PARTICIPANT LIMIT`, видимость guest-ссылки
(`Host only` / `Everyone in the call`), кнопки `Cancel` / `Save`. Изменение сохраняется:
```
PATCH /api/v1/meeting/V4OWLWWDCWQU0DJ
{"name":"CHAT-ADMIN-RENAMED-THIS"}
-> 200
{"meeting":{"id":"V4OWLWWDCWQU0DJ", ... "name":"CHAT-ADMIN-RENAMED-THIS", ...}}
```
Заголовок звонка после сохранения — `Calls CHAT-ADMIN-RENAMED-THIS`. То есть человек,
которому дали право только на чат, может переименовать звонок, поставить пароль, сменить
режим входа и открыть guest-ссылку всем.

### Verified working — Picture-in-Picture (пробел прошлой сессии)

Звонок `V4OWLWWDCWQU0DJ`, хост Alice.

- `Minimize to picture-in-picture` (`call-surface-minimize`) сворачивает звонок: оверлей
  `call-overlay-expanded` исчезает, маршрут становится `/w/{ws}/calls`, появляется мини-панель
  с кнопками `Toggle microphone`, `Toggle camera`, `Leave`, `Expand`.
  (Это не браузерный PiP: `document.pictureInPictureElement` и `documentPictureInPicture`
  оба пустые — мини-плеер внутри страницы.)
- **Медиа в свёрнутом состоянии не рвётся:** `getStats()` у свёрнутого участника —
  исходящее аудио растёт (`bytesSent` 1 008 666), три входящих аудиопотока живые
  (`audioLevel` 0.054 / 0.016 / 0.303).
- `Toggle microphone` из мини-панели реально мутит и доезжает до других: у наблюдателя
  в строке участника появляется маркер `Muted`, на плитке — `Microphone muted`.
- `Expand` возвращает полный оверлей, все четыре плитки на месте.
- Заодно подтверждается фикс **ALK-3409** (`992bcc2ff`, «give the workspace back when a call
  is minimised from its own route»): сворачивание с маршрута звонка отдаёт рабочее
  пространство — пользователь оказывается на `/w/{ws}/calls`, а не в пустоте.
  Прошлая сессия фиксировала, что на rc.3 ALK-3409 ещё воспроизводился.

### BUG-5 — СНЯТА как ложное срабатывание [была Medium] [frontend] «после остановки записи плашка Recording висит у участников ещё ~20 секунд»

**Снята собственной перепроверкой. В отчёт не идёт.**

Исходное измерение опиралось на мой селектор уведомлений (`role="status"|"alert"` + классы
`toast|banner`) и давало «плашка гаснет через +22,1 с и +20,1 с после клика хоста, у самого
хоста — через 1,2 с». Перепроверка с прицельным отслеживанием **самого элемента плашки**
(`span[data-testid="call-recording-badge"]`, 105x26) даёт совсем другое:

```
хост жмёт Stop recording в момент T
  хост,  свой индикатор гаснет ..................... +1,2 с
  QA Dave (главный звонок): badge=True  на -1,2 с
                            badge=False на +0,6 с   <- гаснет меньше чем за секунду
```
и участники **получают текстовые сообщения**, которых я раньше не видел, тоже на +0,6 с:
`Recording stopped` и `Recording ready`. То есть исходная находка неверна дважды: и по
времени, и по утверждению «об окончании записи не сообщают вообще».

**Почему первое измерение соврало.** Тот прогон шёл на окнах, которые провисели в звонке
больше часа через несколько циклов записи, демонстраций экрана и входов в комнаты — то же
состояние, что дало ложное срабатывание с `Pin for everyone`. Плюс узкий селектор скрыл
сообщения `Recording stopped` / `Recording ready`. Прицельный замер по testid на свежих
клиентах не воспроизводит ни задержку, ни молчание.

**Тем, кто увидит это снова:** мерить надо `[data-testid="call-recording-badge"]`, а не
«элемент, чей текст равен Recording», и отсчитывать от `Date.now()` в обработчике клика
хоста, а не от начала наблюдения.

### Verified working — остановка записи объявляется участникам почти мгновенно

```
хост жмёт Stop recording в момент T
  +0,6 с  у участника в главном звонке: плашка Recording исчезла,
          на экране появились "Recording stopped" и "Recording ready"
  +1,2 с  у хоста индикатор в шапке погас
```

### ЗАКРЫТО (было «наблюдение»): участник внутри Side Room видит СВОЙ индикатор записи, и он точнее общего

В том же прогоне участница, находившаяся в `Room L`, **не имела плашки
`call-recording-badge` вообще** — ни во время записи (badge=False на -5,8 с и -1,2 с),
ни после. При этом текстовые сообщения `This call is being recorded` и `Recording stopped`
она получала наравне со всеми.

**Доведено позже — дефекта нет, наоборот.** Я искал элемент `call-recording-badge` и текст,
начинающийся с `Recording`, и не нашёл. У участника комнаты индикатор **другой** и он
информативнее общего:
```
у участника ГЛАВНОГО звонка:  badge "Recording"                                105x26
                              (data-testid="call-recording-badge")

у участника ВНУТРИ Side Room: "Main room recording · this room is not recorded" 363x26
   title:                     "The main room is being recorded. This side room is not recorded."
```
То есть продукт прямо сообщает человеку в комнате, что пишется главный зал, а его комната —
нет. Это заодно эмпирически отвечает на вопрос из **ALK-1860** («decide recording and consent
for dual-room participants»): side room не записывается, и участнику об этом сказано.

Ещё замечено: co-host, находясь внутри комнаты, имеет кнопку `Stop main-room recording`
(44x44) — то есть управлять записью главного зала из комнаты можно.

**Очередная ловушка инструмента:** отсутствие `call-recording-badge` не означает отсутствие
индикации — у другого контекста другой элемент и другой текст.

### Verified working — запись (старт, оповещение, права)

- Диалог `Recording access` перед стартом: «Who can view this recording?» с вариантами
  `Everyone in the meeting` / `People who joined the call` / …, кнопки `Cancel` / `Start recording`.
- Все трое участников получают тост `This call is being recorded` и постоянную плашку
  `Recording` — за 1,8–2,1 с (замер выше).
- Управление записью только у хоста: у обычного участника (Dave) и у администратора звонка
  с правом только `Manage chat` (Carol) в тулбаре **нет** ни `Record`, ни `Stop recording` —
  перечислены все видимые кнопки.
- У хоста кнопка корректно меняется `Record` ⇄ `Stop recording`.

### Verified working — чат внутри Side Room (изоляция, история, возврат)

Звонок `QA-A-NIGHT-REC`, комната `Room B` (public), участники: Alice + Bob в комнате,
Carol + Dave в главном звонке.

- Панель чата внутри комнаты подписана иначе и честно: **`Chat · Room B — Only visible to
  participants of this room`**; в главном звонке — `Call chat — Saved to #<канал>`.
- **Изоляция соблюдается.** Alice пишет `SIDEROOM-ONLY-PROBE-2` из комнаты:
  - Bob (в комнате) видит сообщение;
  - Carol и Dave (в главном звонке) видят только `MAIN-CHAT-PROBE-1` из главного чата,
    сообщения из комнаты у них нет.
- **Поздний вход в комнату отдаёт историю:** Carol заходит в `Room B` уже после отправки и
  видит `SIDEROOM-ONLY-PROBE-2`. Подпись панели («видно только участникам комнаты») этому
  не противоречит — она теперь участница.
- **Выход из комнаты возвращает контекст:** `Leave Side Room` → диалог «Leave Room B? You
  will return to <звонок>, and your audio will switch to the main room. Room B will remain
  available.» → после подтверждения панель чата снова `Call chat — Saved to #<канал>`,
  на стенде снова четыре плитки.
- Плитки участников, ушедших в комнату, **остаются в главной сетке** у тех, кто остался —
  это работающая часть ALK-3479 (retained-main), в отличие от focus-части (см. раздел про дрейф).

### Verified working — две одновременные демонстрации экрана

Хост Alice и участник Bob (после `Request to share` → `Approve`) показывают экран
одновременно. Вторая демонстрация первую **не вытесняет**:

- На стенде у всех появляются обе плитки — `QA Alice's screen` и `QA Bob's screen`.
- Приём подтверждён `getStats()` на принимающей стороне, два входящих видеопотока, оба
  растут (два замера с интервалом 8 с):
```
QA Carol  video fdec=147 -> 226   video fdec=83  -> 162
QA Dave   video fdec=77  -> 151   video fdec=156 -> 221
```
- В Spotlight-режиме участникам предлагается `Pin QA Alice's screen` и `Pin QA Bob's screen`.

**Проверено и снято как не-дефект:** сначала показалось, что у хоста нет кнопок `Pin …'s
screen`, хотя у остальных есть. Причина — режим просмотра: кнопки закрепления экрана есть в
Spotlight и отсутствуют в Grid, а хост была в Grid. Переключение хоста в Grid/Spotlight
воспроизводит обе картины. Не дефект.

**Ещё одно снятое ложное срабатывание:** в первом прогоне показалось, что у одного участника
вообще пропала кнопка демонстрации, пока показывает другой. На деле кнопка была на месте
в состоянии `Requesting…` — мой фильтр искал подстроку `shar` и это состояние не ловил.
Перечислять надо весь тулбар, а не отфильтрованный кусок.

### СНЯТА гипотеза «Pin for everyone не доходит до участников» — не воспроизводится, вероятно артефакт рига

Сначала выглядело как крупный дефект. Хост нажимает `Pin <имя> for everyone`, запрос уходит
успешно:
```
POST /api/v1/meeting/V4OWM42ODEANGCS/pin
{"target_type":"participant","target_user_id":"U4QACAROL000001","breakout_room_id":""}
-> 200
{"meeting_id":"...","target_user_id":"U4QACAROL000001","pinned_by":"U4QAALICE000001",
 "pinned_at":"2026-08-26T11:16:58Z"}
```
а измеренная геометрия плиток (ширина окна 1920 у всех) показывала, что закрепление
применилось **только у хоста**:
```
Alice (хост) : QA Carol 1528x798, остальные 160x90, бейдж participant-pinned-for-everyone
Carol        : все четыре плитки 760x428, бейджа нет
Dave         : самая большая — QA Bob 1525x796 (не тот человек), бейджа нет
Bob          : самая большая — QA Dave 1527x797 (не тот человек), бейджа нет
```

**Но под контролем это не воспроизводится.** После `reload` всех четырёх окон закрепление
доезжает живьём и правильно — наблюдение геометрии каждые 500 мс:
```
Carol: 0 ms  big=QA Carol (you)  pinBadge=False  toggle='Spotlight view'
       7525 ms big=QA Bob        pinBadge=True   toggle='The host pinned QA Bob for everyone'
Dave : 0 ms  big=QA Bob          pinBadge=False  toggle='Grid view'
       7530 ms big=QA Bob        pinBadge=True   toggle='The host pinned QA Bob for everyone'
```
(запрос уходит примерно на 5-й секунде наблюдения, то есть задержка ~2,5 с). Отдельно
проверено на свежезагруженном клиенте: закрепление третьего участника доехало за ~1,5 с.

**Почему считаю это артефактом рига, а не дефектом.** Окна, на которых закрепление не
доехало, к тому моменту провисели в звонке ~17 минут через несколько циклов записи,
демонстраций экрана и входов в Side Room, и индикатор качества на них показывал
`Lost · 591ms` / `Poor · 433ms`. Доказательства, что их realtime-соединение в тот момент было
живым, у меня нет — а без такого контроля «событие не пришло» ничего не значит
(CLAUDE.md: «Suspect the rig before the app»). **В отчёт не идёт.**

Если кто-то увидит это снова — контроль, который решает вопрос: убедиться, что на том же
клиенте в том же окне доезжает какое-нибудь другое realtime-событие (например, изменение
состава участников). Именно этот контроль есть у BUG-2 и именно поэтому BUG-2 остаётся.

**Заодно проверено и работает:** `POST /api/v1/meeting/{id}/pin` отвечает 200 и возвращает
`pinned_by`/`pinned_at`; у хоста появляется бейдж `participant-pinned-for-everyone` на плитке
и пояснение в `aria-label` переключателя вида («The host pinned <имя> for everyone»);
у остальных на свежем клиенте — то же самое. Закрепление второго человека поверх первого
переносит spotlight корректно.

**Мелочь, не оформляю дефектом:** сам закреплённый участник у себя spotlight и бейдж не
получает — после `reload` у него по-прежнему ровная сетка 760x428 без пометки, то есть он
единственный, кто не знает, что его закрепили для всех.

### Пробел прошлой сессии «filmstrip с постраничной прокруткой» — НЕ достижим на 5-6 участниках

Прошлый прогон записал в непройденное «filmstrip с постраничной прокруткой (нужно >4
участников)». Оценка сильно занижена, и следующей сессии не нужно вокруг неё планировать.

`useParticipantGridPageSize.ts:13` **на задеплоенном коммите** (`git grep …
c4b5386b4a3a -- packages/features/calls`):
```
export const PARTICIPANT_GRID_PAGE_SIZES = { large: 25, medium: 9, small: 4 } as const
```
Тестируем на десктопных ширинах — значит страница сетки вмещает **25** плиток, и чтобы
получить вторую страницу, нужно **26** участников. Ни 5, ни 6 окон этого не дают.

Проверено и в интерфейсе: в Spotlight-режиме на 4 участниках среди всех видимых контролов
нет ни одной кнопки постраничной прокрутки (перечислен весь тулбар, не отфильтрованный кусок).

Полоса рига (4 окна на лейн) на это не влияла: я упёрся в неё один раз (`launch.sh A owner`
→ `refusing: lane A already has 4 browsers up (cap 4)`), но отказался от теста не из-за
полосы, а потому что он недостижим при любом реалистичном числе окон.

### Verified working — выход из звонка изнутри Side Room доезжает до комнаты мгновенно

Коммит ALK-3479 оставляет в описании оговорку: «LeaveMeeting takes somebody out of their
side room through the repository, not the service method that emits the frame, so leaving
the meeting from inside a room publishes nothing to it», и ради этого «60-second roster
backstop is deliberately kept». Проверил, видно ли это пользователю.

**Сначала выяснилось, что изнутри комнаты `Leave call` в тулбаре вообще нет** — перечислены
все видимые кнопки участника, находящегося в комнате: `Leave Side Room`, `Leave room`,
`Main call: <звонок>`, `Side Room <комната>` и обычные медиа-контролы. Кнопки завершения
звонка нет. То есть штатный путь — сначала выйти из комнаты, потом из звонка.

Достижимый путь всё же есть: свернуть звонок в PiP прямо из комнаты и нажать `Leave`
в мини-панели. Так и проверял.

**Результат — призрака нет.** Наблюдение у второго участника комнаты каждые 500 мс,
отсчёт от момента клика (снят на странице уходящего):
```
-10.4s  плитки: ['QA Bob', 'QA Carol (you)']   панель: Room L Public  2 · …  Joined
 +0.1s  плитки: ['QA Carol (you)']              панель: Room L Public  1 · …  Joined
```
Состав комнаты обновился за 0,1 с — и плитки, и счётчик в панели Side Rooms.
60-секундный backstop до пользователя не доходит. Дефекта нет.

### Verified working — назначение и снятие co-host доезжает живьём

- `Make co-host` третьему участнику: у стороннего наблюдателя (Bob) в панели появляется
  `QD QA Dave CO-HOST` — доехало в том же окне наблюдения (шаг 500 мс).
- `Remove co-host` **существует** в меню участника (ALK-2289 «отсутствует явное действие
  Remove co-host» выглядит починенным), диалог: «Remove co-host? Remove co-host permissions
  from QA Dave?».
- Снятие роли доезжает до самого разжалованного и **снимает контролы**, наблюдение его
  тулбара каждые 500 мс:
```
   0 ms  key=['Call diagnostics','Meeting settings','Participant actions','Record','Resize call diagnostics']
         roles=… QD QA Dave (you) CO-HOST …
6047 ms  key=['Call diagnostics','Participant actions','Resize call diagnostics']
         roles=… QD QA Dave (you) …          <- Record и Meeting settings исчезли, бейдж снят
```
- Заодно зафиксировано: полноценный co-host (через `Make co-host`) получает `Record` и
  `Meeting settings`; обычный участник — только `Call diagnostics`.

**Это важный контраст для BUG-2:** роли и состав участников доезжают по realtime за секунды,
а бан-лист — нет вообще. То есть в BUG-2 дело не в «сломанной доставке событий вообще».

### Verified working — политика Reactions из Meeting settings применяется в обе стороны

```
PATCH /api/v1/meeting/V4OWM42ODEANGCS/settings {"reactions_enabled":false} -> 200
   ответ: {... "reactions_enabled":false ...}
```
После этого у обоих обычных участников (в главном звонке и в Side Room) кнопка
`Send reaction` из тулбара **исчезает** — перечислены все видимые контролы, не отфильтрованный
кусок. Обратное переключение возвращает её.

**Не оформляю дефектом, но записываю:** смена политики участникам никак не объявляется —
за 30 с наблюдения (шаг 300 мс) ни одного видимого уведомления, кнопка просто появляется
или пропадает. Это тот же класс, что открытый **ALK-3453** («При запрете микрофона/камеры
настройкой звонка кнопка у участника молча гаснет без объяснений»), только для реакций —
расширение открытого тикета, а не отдельная находка.

### Verified working — `MAXIMUM VIDEO QUALITY` реально ограничивает поток

Настройка обещает «An upper limit for everyone in this meeting». Проверено измерением
`getStats()` с обеих сторон, звонок `V4OWM42ODEANGCS`, у участника включена камера.

```
до:    slider = "Maximum — 1080p"
       отправитель  outbound-rtp video  480x270  fps 21
       получатель   inbound-rtp  video  480x270

после: slider = "Minimal — 180p"
       PATCH /api/v1/meeting/V4OWM42ODEANGCS/settings {"max_video_height":180} -> 200
       отправитель  outbound-rtp video  320x180  fps 15  framesEncoded 1666
       получатель   inbound-rtp  video  320x180  framesDecoded 465 (растёт)
```
Ограничение применяется на отправителе, а не только на приёме, и доезжает без перезагрузки.
Каждое положение ползунка шлёт отдельный `PATCH` с `max_video_height` (720 → 360 → 180),
то есть настройка мгновенная и не подчиняется кнопке `Save` — как и переключатели в блоке
`MEMBER PERMISSIONS`. Это ровно то поведение, на которое заведён открытый **ALK-3490**
(«Переключатель Who can join применяется мгновенно и не подчиняется Save/Cancel, в отличие
от остальных полей той же панели») — тот же класс, ещё два контрола. Не выношу отдельно.

### Verified working — политика `In-call chat` из Meeting settings (и здесь запрет объяснён)

```
PATCH /api/v1/meeting/V4OWM42ODEANGCS/settings {"chat_enabled":false} -> 200
```
У обычного участника после этого:
- в панели чата появляется плашка **«Chat is disabled for this call»**;
- история остаётся читаемой — все три ранее отправленных сообщения на месте
  (обещание настройки «members can read the history but cannot send messages» выполняется);
- поле ввода и кнопка отправки реально выключены: `textarea disabled=true`,
  кнопка `Send` `disabled=true`;
- попытка всё же отправить (`CHATPOLICY-AFTER-2`) ничего не создаёт — у хоста в чате
  остаётся только `CHATPOLICY-BEFORE-1`, отправленное тем же участником до запрета.

**Это важный контраст.** Здесь продукт делает ровно то, чего не хватает в открытом
**ALK-3453**: запрет не просто гасит контрол, а объясняется словами на том же экране.
То есть правильный образец лежит внутри той же панели Meeting settings — рядом с
микрофоном, камерой и реакциями, которые гаснут молча. Тому, кто будет чинить ALK-3453,
достаточно повторить этот паттерн.

### Осторожно со ссылками на исходник: рабочее дерево фронта НЕ равно задеплоенному коммиту

Клон `~/Projects/aloqa-src/aloqa-frontend` стоит на ветке
`bugfix/ALK-3389-early-guest-landing` (`c87e4506b7e6`), а на стенде `c4b5386b4a3a`.
Между ними 33 коммита, которых в рабочем дереве нет, и `git pull` это не чинит — upstream
ветки указывает на саму bugfix-ветку. То есть любой `git grep` без указания sha читает не тот
код, что крутится на стенде. Соседняя сессия чуть не сослалась на строку, которая на
задеплоенном коммите выглядит иначе и уже содержит фикс.

**Правильный способ:** читать по sha, без переключения веток —
```
git grep -n "<symbol>" c4b5386b4a3a -- packages
git show c4b5386b4a3a:<path>
```

**Все ссылки на исходник в этом логе перепроверены на `c4b5386b4a3a`:**
- `PARTICIPANT_GRID_PAGE_SIZES = { large: 25, medium: 9, small: 4 }` —
  `useParticipantGridPageSize.ts:13` ✓
- `'calls.moderation.screenShareStoppedByHost': 'A host stopped your screen sharing'` —
  `packages/core/src/i18n/dictionaries/en.ts:3331` ✓

Бэкенд-клон в порядке: ветка `dev`, upstream `origin/dev`, и коммит `58f9f433` (эндпоинт
focus) — предок HEAD. Но выводы по бэкенду в этом логе всё равно опираются не на дерево,
а на живые пробы стенда (403 против 404), так что состояние клона на них не влияет.

### Verified working — режим микрофона `On request`: полный цикл и реальное отключение звука

```
PATCH /api/v1/meeting/V4OWM42ODEANGCS/settings {"mic_mode":"on_request"} -> 200
```
- У обычного участника кнопка микрофона превращается в **`Request microphone access`** —
  тот же паттерн, что у демонстрации экрана (`Request to share`). То есть запрет объявлен
  осмысленно, а не молча погашенной кнопкой.
- **Звук действительно отключается, и это не «просто иконка»:** исходящее аудио у участника
  замерло на одном значении на 7-секундном интервале, тогда как исходящее видео в тот же
  интервал продолжало расти — то есть соединение живое, отрезан именно микрофон:
```
   t0:  audio bytesSent = 6 259 674   video bytesSent = 53 014 240
   t+7: audio bytesSent = 6 259 674   video bytesSent = 53 136 879
```
- Запрос доезжает до хоста: в панели участников `REQUESTS (1) QD QA Dave Microphone · 04:44 PM`
  с кнопками `Approve Microphone for QA Dave` / `Reject …`.
- После `Approve` кнопка у участника становится `Unmute` (то есть доступ вернули, но
  включает он сам). После `Unmute` аудио пошло по новому треку и растёт:
  `audio bytesSent 28 903 → 58 765`, старый замерший трек остаётся на 6 259 674.

**Мелочь, не выношу:** об одобрении запроса участнику отдельно не сообщают — сигналом служит
только смена кнопки. Тот же класс, что молчаливые запреты (ALK-3453).

### BUG-6 [Medium] [frontend] `Ask to return to main room` не доходит до участника: хосту показывают успех, человеку — ничего

Хост открывает меню участника, который находится в Side Room, и жмёт
`Ask to return to main room`. Хосту сразу показывают подтверждение
«Asked QA Dave to return to the main room». **Участник не получает ничего** и остаётся
в комнате. Хост при этом уверен, что просьбу доставили.

**Шаги (звонок `V4OWM42ODEANGCS`, комната `Room L`):**
1. Участник находится в Side Room.
2. Хост: `Participants` → `Participant actions` на нём → `Ask to return to main room`.
3. Смотреть на экран участника.

**Измерение.** В одном окне наблюдения 42 с (полнотекстовый поиск по всему видимому DOM,
шаг 400 мс) сначала выполняется заведомо рабочее действие того же класса, потом проверяемое:

```
t≈4 c   хост: "Ask QA Dave to turn on camera"
  4831 ms  у участника появляется: "QA Alice asked you to turn on your Camera"   <- контроль прошёл

t≈16 c  хост: "Ask to return to main room"
        POST /api/v1/meeting/V4OWM42ODEANGCS/breakout-rooms/return-request
        {"user_id":"U4QADAVE0000001"}
        -> 204
  за оставшиеся ~26 с на экране участника не появилось ничего:
  единственный найденный текст — всё тот же camera-промпт
```

Тост у хоста, снятый на его же странице непрерывным опросом с шагом 300 мс:
```
  +303 ms  "Asked QA Dave to return to the main room"
  +5437 ms (исчез)
```

**Контроль, снимающий обычные возражения.** Промпт про камеру пришёл этому же участнику,
в этой же комнате, в этом же окне наблюдения — значит realtime у него живой и запреты на
доставку промптов людям внутри Side Room нет. Искал не по контейнерам тостов, а по всему
видимому DOM (промпты в этом продукте рисуются на сцене звонка, а не тостом). Стоящий на
экране предыдущий промпт перед прогоном снимался кнопкой `Not now`, чтобы он не перекрывал
новый. Воспроизведено трижды.

**Интерфейс для этой просьбы в сборке есть.** На задеплоенном коммите
`c4b5386b4a3a` в словаре лежат все строки, которых участник так и не увидел:
```
git grep -n "returnRequest" c4b5386b4a3a -- packages/core/src/i18n/dictionaries/en.ts
:3540  'calls.breakout.returnRequest.title': 'You were asked to return to the main room.'
:3541  'calls.breakout.returnRequest.stay': 'Stay'
:3542  'calls.breakout.returnRequest.return': 'Return'
:3562  'calls.breakout.toast.returnRequestSent': 'Asked {name} to return to the main room'
```
То есть диалог с кнопками `Stay` / `Return` предусмотрен и должен был показаться.

**Это не дрейф стенда.** Событие `return_to_main_requested` и сам маршрут
`POST …/breakout-rooms/return-request` живут в бэкенде с июня (первое появление
`notifReturnToMainRequested` — 2026-06-23, последняя правка — `8e7a325a` от 2026-08-04),
то есть заведомо внутри окна задеплоенного бэкенда (он между 2026-08-21 и 2026-08-25).
Коммит `58f9f433`, который на стенд не приехал, строк про `returnToMain` не трогает вовсе.

**Ожидаемо:** участнику показывается предусмотренный диалог «You were asked to return to the
main room.» с кнопками `Stay` / `Return`. Либо, если доставить не удалось, хост не получает
подтверждение «Asked …».

**Дедуп:** по запросам `return to main` / `Ask to return` в зеркале ALK — **0 совпадений**;
среди открытых багов про Side Rooms (ALK-3528, 3481, 3425, 3412, 3257, 3345, 3074, 2993,
2939, 2734) этого сценария нет.

### Методическая заметка: мой селектор уведомлений был слишком узким

Промпты хоста (`Ask to unmute`, `Ask to turn on camera`, запросы доступа) в этом продукте
рисуются **на сцене звонка**, а не в контейнере тоста. Мой поллер отбирал уведомления по
`role="status"|"alert"` и классам `toast|banner|notice` — и на «Ask to unmute» показал
пусто, из чего я чуть не сделал вывод, что промпты не доходят до людей в Side Room.
На самом деле текст был на экране, просто вне моего селектора.

Лечится полнотекстовым поиском по всему видимому DOM (`a-nb-promptwatch.mjs`).
**Тосты и промпты в этом приложении — разные поверхности; проверять надо обе.**

### Наблюдение (не доведено, скорее сектор B): звонок остался `active`, но войти в него нельзя

После длинной серии модерационных действий (баны, разбаны, выходы, перезагрузки) звонок
`V4OWM42ODEANGCS` опустел, и все четыре клиента оказались вне оверлея звонка.
`GET /api/v1/meetings/current` при этом продолжал отдавать его как живой:
```
{"meeting":{"id":"V4OWM42ODEANGCS","status":"active","created_by":"U4QAALICE000001",
            "name":"QA-A-NIGHT-REC","started_at":"2026-08-26T10:58:10Z", …}}
```
а попытка войти давала общий экран «Could not join the call — Something went wrong while
joining the call.» с единственной кнопкой `Back to workspace`.

**Не оформляю дефектом:** воспроизвести с чистого состояния не пробовал, последовательность
действий была длинной и нетипичной, и происхождение (жизненный цикл звонка, вход) — это
сектор B, а не мой. Записываю, чтобы сектор B мог проверить целенаправленно: интересен
именно случай «последний участник вышел, meeting остаётся active, вход отдаёт generic-ошибку».

### Проверка (не отчёт): `Device permissions` → `Camera: Block` теперь молчит полностью

```
PUT /api/v1/meeting/V4OWOUFTV44KVVI/participants/U4QADAVE0000001/permissions
{"camera":false} -> 200
{"override":{... "camera":false, "granted_by":"<host>", ...},"effective":{"mic":true,"camera":…}}
```
У участника камера гаснет (кнопка становится `Turn camera on`, `aria-pressed=true`), но:
- за 40 с наблюдения по всему видимому DOM **ни одного объясняющего текста**;
- кнопка **не отключена** и не переименована; её `title` — обычное `Toggle camera (⌘E)`,
  никакой подсказки про запрет (в отличие от демонстрации экрана, где `title` кнопки
  становится `Screen sharing is not allowed for you in this call.`);
- **попытка включить камеру не даёт ничего**: клик по `Turn camera on` не меняет состояние
  и не выводит никакого сообщения (наблюдение 25 с по всему DOM — пусто).

**Не выношу в отчёт — семейство уже описано двумя тикетами:**
- **ALK-2896** (`TESTING`, закрыт) — ровно этот путь (`Device permissions` → `Block`), где
  участнику показывали **ложный** баннер «Check browser permissions». Ложного баннера больше
  нет — это починено. Но на его место не пришло ничего.
- **ALK-3453** (`Backlog`, открыт) — путь через `Meeting settings`, симптом «кнопка молча
  гаснет без объяснений», и в самом тикете написано, что случай камеры надо проверить в его
  же рамках.

То есть моё измерение — полезное дополнение к открытому ALK-3453 (подтверждает, что и
индивидуальный путь молчит, и что попытка включить устройство тоже ничего не сообщает),
а не отдельная находка.

### Verified working — `Close room` возвращает участников и объясняет это

```
хост: Side Rooms -> Close room -> подтверждение
  участник в комнате, 9240 мс: "The Side Room was closed. You are back in the main call."
  он оказывается в главном звонке (на сцене снова все участники)
  панель у хоста: "Side Rooms 0 open in this call … No open side rooms yet."
```
(Про ALK-3425 «дублирующееся уведомление при закрытии» ничего не утверждаю: мой сборщик
схлопывает одинаковые строки через `Set`, так что дубль он бы и не показал.)

**Это важно для BUG-6.** В интерфейсе **нет** контрола «вернуть всех» — в панели Side Rooms
у хоста только `New Side Room`, `Close room`, `Add people`, `Join`/`Joined`
(перечислены все контролы панели). Эндпоинт `return-request-all` в контракте есть, но ни
одна кнопка его не вызывает, то есть с точки зрения пользователя единственные способы
вернуть человека из комнаты — сломанный `Ask to return to main room` и полное закрытие
комнаты. Обходной путь существует (закрыть комнату), поэтому BUG-6 остаётся Medium, а не High.

### BUG-7 [Medium] [frontend] В `Move to Side Room` не попадают пустые комнаты — только что созданную комнату нельзя выбрать как назначение

Хост создаёт Side Room, чтобы **развести туда людей**, открывает меню участника — и этой
комнаты в списке `MOVE TO SIDE ROOM` нет. В список попадают только комнаты, **в которых уже
кто-то сидит**. Получается замкнутый круг: чтобы перевести человека в комнату, в ней уже
должен кто-то быть, а посадить туда первого через меню нельзя — он должен зайти сам.

**Шаги (звонок `V4OWOUFTV44KVVI`):**
1. Хост: `Side Rooms` → `New Side Room` → создать комнату (создатель сразу оказывается
   внутри) → `Leave Side Room`, чтобы комната осталась пустой.
2. Хост: `Participants` → `Participant actions` на любом участнике.
3. Посмотреть раздел `MOVE TO SIDE ROOM`.

**Измерение.** Состояние комнат читается прямо из API, меню перечисляется целиком
(все текстовые узлы, не отфильтрованный кусок):

```
GET /api/v1/meeting/V4OWOUFTV44KVVI/breakout-rooms
   Room Two   status=active   participant_count=2
   Room Three status=waiting  participant_count=0

меню участника (он в Room Two):
   Ask to return to main room | Make co-host | Admin permissions… | Device permissions… |
   Remove from call | Ban | Ask QA Dave to unmute | Ask QA Dave to turn on camera |
   MOVE TO SIDE ROOM | Move to Room Two
                       ^ предлагается только комната, где он уже сидит;
                         пустой Room Three в списке нет вовсе
```

**Что комната становится доступной ровно в момент появления в ней人 — показано прямо:**
```
Room Two  status=waiting, count=0  -> в меню раздела MOVE TO SIDE ROOM НЕТ ВООБЩЕ
(участник заходит в Room Two сам)
Room Two  status=active,  count=1  -> в меню появляется "Move to Room Two", и перевод
                                       второго участника туда срабатывает
```

**Проверено, что это не устаревший клиент:** после `reload` хоста, когда открыта была одна
пустая комната, раздел `MOVE TO SIDE ROOM` в меню отсутствовал так же. И это не обрезанное
меню: `scrollHeight == clientHeight` (467 == 467), `overflow: visible`, перечислены все
текстовые узлы контейнера.

**Ожидаемо:** только что созданная комната доступна как назначение перевода — это основной
сценарий работы с breakout-комнатами (хост создаёт комнаты и распределяет людей).

**Обходной путь есть** (кто-то заходит в комнату сам, после чего остальных можно переводить),
поэтому Medium, а не High.

**Дедуп и связь с открытыми тикетами.** Это та же строка кода, что в **ALK-2734**
(`In Progress`) — там в «Подтверждённой причине» прямо написано: «Список вариантов строится
из **всех активных** Side Rooms без исключения текущей комнаты участника», и в «Проверке»
стоит пункт «Другие активные комнаты доступны». То есть ALK-2734 и его повторное
подтверждение **ALK-3481** (`Backlog`) описывают только одну половину — что в списке лишняя
текущая комната. Вторая половина — что **пустые (`waiting`) комнаты в список не попадают
вообще** — не описана ни там, ни в одном другом открытом баге. Обе половины видны
одновременно в измерении выше. Скорее всего чинятся одним изменением; если триаж решит
слить с ALK-2734, критерий приёмки этого тикета стоит дополнить: «только что созданная
пустая комната доступна как назначение».

### Verified working — `Add people` в уже созданную Side Room (открытый ALK-2939 выглядит починенным)

Открытый баг **ALK-2939** (`Backlog`) утверждает: «Нельзя пригласить дополнительных
участников в уже созданный Side Room». На rc.5 это работает:

- Пустое состояние объяснено: когда добавлять некого, диалог пишет «Everyone in the call is
  already in this room», кнопка `Invite` выключена.
- Как только в главном звонке появляется кто-то, кого в комнате нет, он появляется в списке:
  «Add people to Room Two — INVITE FROM THIS CALL — Select all — QB QA Bob — Only people
  already in the call can be invited.»
- Приглашение уходит и доезжает:
```
POST /api/v1/meeting/breakout-rooms/BR4OWP8J3QPHH1XC/invite
{"participant_user_id":"U4QABOB00000001"} -> 204

у приглашённого через 4022 мс: "QA Alice invited you to join Room Two"  [Decline] [Accept]
```
- Приём приглашения **не проверял**: к моменту клика полоса уже истекла (время жизни
  такой полосы ~30 с), и кнопки `Accept` на экране не было. Проверена доставка приглашения,
  не его приём.

Стоит перепроверить ALK-2939 и, если подтвердится, закрыть — но это решение не моё.

### Verified working — живые реакции

Палитра: `👏 👍 ❤️ 😂 🎉 😮`. Хост отправляет 🎉 — у другого участника реакция появляется
на 4421 мс и исчезает к 7234 мс (наблюдение по всему видимому DOM, шаг 400 мс).

### Подтверждённые причины BUG-2 и BUG-6 — сняты с провода и из исходника на задеплоенном коммите

Поставил на страницу наблюдателя перехватчик `WebSocket` (init-script до загрузки, чтобы
поймать сокет приложения) и записал кадры.

**BUG-6 — кадр ДОХОДИТ, обработчика для него нет у залогиненного участника.**
Кадр, полученный участником в Side Room в момент, когда хост нажал `Ask to return to main room`:
```
in {"breakout_room_id":"BR…","event_id":"43132e99…","meeting_id":"V4OW…",
    "participant_id":"N4OW…","requested_by":"U4QA…","type":"return_to_main_requested"}
```
Контрольный кадр в том же окне — `participant.device.requested` (просьба включить камеру) —
пришёл и **был показан** на экране. То есть доставка работает, показ — нет.

Причина читается в исходнике **на задеплоенном коммите** `c4b5386b4a3a`:
```
packages/core/src/realtime/events.ts:210
   BreakoutReturnToMainRequested: 'return_to_main_requested'

единственная подписка на эту константу:
apps/web/src/features/guest-meeting/hooks/useGuestBreakoutRealtime.ts:723

единственное место, где читаются строки диалога:
apps/web/src/features/guest-meeting/hooks/useGuestBreakoutReturnPrompt.ts:44-46
   t('calls.breakout.returnRequest.title' | '.stay' | '.return')
```
Обе точки — внутри фичи **guest-meeting**. У обычного (залогиненного) участника звонка
подписки на этот кадр нет вовсе, поэтому просьба до него и не доходит визуально.
Метка `[frontend]` подтверждена.

**BUG-2 — кадра про бан не существует, а бан-лист инвалидируется только у того, кто нажал.**
Единственный текстовый кадр, который получает второй модератор в момент бана:
```
in {"channel_id":"","meeting_id":"V4OW…","workspace_id":"W4QA…",
    "type":"workspace.call.live.participants_changed"}
```
Ничего про бан в нём нет — это и есть тот сигнал, по которому у него обновляется состав
участников (и обновляется, я это измерял), но не бан-лист.

В исходнике на `c4b5386b4a3a`:
```
бан-лист — отдельный запрос:
   packages/core/src/api/routes.ts:366        participantBans: '/meeting/:meetingId/bans'
   packages/core/src/state/queries/callsKeys.ts:203   callsKeys.participantBans(wsId, callId)

инвалидируется РОВНО в двух местах, обоих — внутри мутаций ban/unban:
   packages/features/calls/model/mutations.ts:3854
   packages/features/calls/model/mutations.ts:3884
```
То есть перезапрос `GET /meeting/{id}/bans` делает только тот клиент, который сам выполнил
действие. Ни один realtime-обработчик этот ключ не инвалидирует. Собственный
`packages/features/calls/CONTRACT.md:112` на том же коммите прямо говорит, что
пер-участниковых WS-кадров у звонка нет и что через `participants_changed` сверяются только
счётчики. Метка `[frontend]` подтверждена.

### BUG-8 [Medium] [frontend] Переход гостя в Side Room доходит до ведущего только через ~40 секунд, тогда как переход обычного участника — мгновенно

Гость (вошедший по гостевой ссылке) заходит в Side Room. Его собственный экран сразу
показывает комнату, участники комнаты видят его сразу — а панель `Participants` у ведущего
ещё около сорока секунд показывает гостя так, будто он в главном звонке. Всё это время
ведущий действует по неверным данным: в меню гостя ему предлагается `Move to <комната, в
которой гость уже сидит>` и **не предлагается** `Ask to return to main room`.

**Шаги:**
1. Пустить в звонок гостя по гостевой ссылке и впустить его.
2. Создать Side Room, в которой уже кто-то есть (пустая недоступна как назначение — BUG-7).
3. Гость заходит в эту комнату сам.
4. Смотреть панель `Participants` у ведущего.

**Измерение — A/B, по одной переменной в каждом прогоне, оба с только что перезагруженного
клиента ведущего, наблюдение 75 с с шагом 500 мс. Переход происходит на ~5-й секунде:**

```
(A) переходит ГОСТЬ
       0 ms  … HOST | GT Guest Tester GUEST | QD <участник> | IN SIDE ROOMS: QC <co-host> Room Two
   46687 ms  … HOST | QD <участник> | IN SIDE ROOMS: QC <co-host> Room Two, GT Guest Tester GUEST Room Two
   -> задержка ~41,7 с

(B) переходит ОБЫЧНЫЙ УЧАСТНИК (контроль)
       0 ms  … HOST | GT Guest Tester GUEST | QD <участник> | IN SIDE ROOMS: QC <co-host> Room Two
    5516 ms  … HOST | GT Guest Tester GUEST | IN SIDE ROOMS: QC <co-host> Room Two, QD <участник> Room Two
   -> задержка ~0,5 с
```
Прогон (A) повторён дважды: 46638 мс и 46687 мс — то есть ~41-42 с от момента перехода.

**Уточнение после третьего прогона: это периодическое обновление, а не фиксированная
задержка.** Отдельно наблюдал панель ведущего 120 с, когда гость уже сидел в комнате
(зашёл более минуты назад) и больше ничего не происходило: панель оставалась неверной и
исправилась на 36618 мс наблюдения. То есть размещение гостя не приходит событием, а
подхватывается очередным периодическим перечитыванием состава — отсюда и разброс.
Формулировать надо как «до минуты», а не «ровно 42 с». Контраст с обычным участником
(~0,5 с) от этого не меняется.

**Сопутствующее измерение, показывающее последствие.** Пока панель устаревшая, меню ведущего
для гостя выглядит так (перечислены все текстовые узлы меню):
```
Pin for me | Pin Guest Tester for everyone | Stop watching | Device permissions… |
Remove from call | Ban | Ask Guest Tester to unmute | Ask Guest Tester to turn on camera |
MOVE TO SIDE ROOM | Move to Room Two
```
— то есть предлагается перевести гостя в комнату, где он уже находится, а действия
`Ask to return to main room` нет. После `reload` ведущего панель сразу верная, значит сервер
знает правильное размещение.

**Вероятная связь (не утверждаю как причину):** фронтовый коммит ALK-3479 упоминает
«60-second roster backstop», который «deliberately kept». Наблюдаемые ~41 с укладываются в
периодический опрос состава, а не в realtime-событие. То есть у гостя, похоже, нет
realtime-события о смене размещения, которое есть у обычного участника. Проверять это я не
стал — граница и так измерена.

**Дедуп:** среди открытых багов совпадений нет. Проверены все открытые с тегом GUEST
(ALK-3577, 3560, 3489, 3570, 3529, 3474, 3326, 3136, 2991, 2988) и все про Side Rooms —
про размещение гостя нет ничего. ALK-3481 — про лишний пункт «текущая комната» вообще
(это BUG-7), не про задержку у гостя.

### Попутно на госте — не отчёт

- **ALK-3529 (открыт) воспроизводится:** экран гостя «Waiting for approval — A host must
  approve your request. Keep this page open.» содержит **ноль** интерактивных элементов
  (перечислены все). Это находка сектора B, подтверждаю на rc.5.
- **ALK-3326 (открыт) выглядит починенным:** в меню ведущего над гостем нет ни
  `Make co-host`, ни `Admin permissions…` — перечислены все пункты меню (см. выше).
  Стоит перепроверить и, возможно, закрыть.
- **ALK-2740 (In Progress) — рядом:** у гостя кнопка называется `Share screen`, хотя режим
  звонка `on_request`, и одновременно на его же экране лежит текст «Screen sharing is not
  allowed for you in this call.» Не углублялся, тикет в работе.
- У гостя в тулбаре **нет** `Minimize to picture-in-picture`, тогда как у залогиненных есть.
  Не оформляю: не установлено, намеренно ли это.

### Дополнение к BUG-6: для гостя та же кнопка падает с 403 — то есть действие не работает ни для кого

Проверял, получит ли **гость** промпт возврата (по коду обработчик лежит именно в фиче
`guest-meeting`, так что предполагал, что у гостя всё сработает). Оказалось иначе.

Гость вошёл по гостевой ссылке, маршрут `/guest/meeting/{meetingId}`, сидит в Side Room.
Хост жмёт `Ask to return to main room`:

```
POST /api/v1/meeting/{meetingId}/breakout-rooms/return-request
{"user_id":"N4OWQ4P5M0G0Q88"}          <- в поле user_id уехал PARTICIPANT id гостя
-> 403
{"code":403,"key":"REALTIME_ACCESS_DENIED","message":"access denied","trace_id":"<trace>"}

тост у хоста: "Could not send the request"
```

На стороне гостя — ничего, и это согласуется: перехватчик WebSocket на его странице за весь
сеанс записал 2260 кадров типов
`participant_admitted, participant_joined, subscribe, subscribed, participant_joined_breakout,
ping, pong` — **кадра `return_to_main_requested` среди них нет вообще**, и после запроса
тоже не появилось.

**Итого действие `Ask to return to main room` не работает ни для одного класса участников,
но по разным причинам:**

| участник | запрос | кадр до участника | что видит хост |
|---|---|---|---|
| залогиненный | `{"user_id":"<user id>"}` → **204** | **приходит** | «Asked … to return to the main room» (ложный успех) |
| гость | `{"user_id":"<participant id>"}` → **403** `REALTIME_ACCESS_DENIED` | не приходит | «Could not send the request» (честная ошибка) |

Для гостя обработка ошибки на стороне хоста как раз корректная. Похоже, клиент кладёт в поле
`user_id` идентификатор участника (`N4OW…`), которого у гостя нет как user id — а бэкенд по
контракту рассылает гостю в `notif:{participant_id}` (описание эндпоинта в
`apps/web/src/generated/openapi.json` на задеплоенном коммите). Утверждать это причиной не
буду: измерена граница (запрос с participant id в поле user_id → 403), механизм внутри
сервера не проверял.

**Вывод для отчёта:** BUG-6 переписан так, чтобы покрывать кнопку целиком — оба класса
участников, — потому что чинить их будут в одном месте.

### Verified working — изоляция чата Side Room для гостя (закрытый ALK-1991 держится)

**ALK-1991** (`TESTING`) — «Guest в Side Room продолжает читать и отправлять сообщения из
Main room». На rc.5 не воспроизводится, проверено в обе стороны. Гость вошёл по гостевой
ссылке (маршрут `/guest/meeting/{id}`) и сидит в Side Room вместе с двумя участниками:

```
чтение:  хост пишет "MAIN-ONLY-GUESTCHECK-31" в чат ГЛАВНОГО звонка
         у гостя панель: "Chat · Room Two — Only visible to participants of this room —
                          No messages yet"      -> сообщения главного чата не видно

запись:  гость пишет "GUEST-ROOM-ONLY-32" в чате комнаты
         участница в той же комнате: сообщение видит
         хост в главном звонке: у него только своё "MAIN-ONLY-GUESTCHECK-31",
                                сообщения гостя нет  -> утечки в главный чат нет
```

### Verified working — политика Reactions распространяется и на гостя

Коммит `d627a8441` («fix(calls): enforce live reaction policy for guests») приехал в rc.5.
Проверено: у гостя в тулбаре есть `Send reaction`; хост выключает Reactions в Meeting settings
(`PATCH …/settings {"reactions_enabled":false}` → 200) — у гостя кнопка **исчезает**
(перечислен весь тулбар). Обратное переключение её возвращает.

### Verified working — бан участника, находящегося внутри Side Room

Непроверенная ранее комбинация. Хост банит человека, который сидит в Side Room:

```
панель хоста до:    4 in call | IN SIDE ROOMS: co-host Room, гость Room, участник Room
панель хоста после: "Participants 3 of 4 in call" | BLOCKED (2) …участник… Unban, …Unban
                    забаненный убран из группы IN SIDE ROOMS

у соседки по комнате: плитка забаненного исчезает на 9029 мс
у забаненного:        на 9104 мс он на /w/{ws}/directories с "A host banned you from the call"
```
Всё корректно. Заодно видно, что счётчик в шапке панели умеет формат `3 of 4 in call`.

**Третий триггер того же ложного тоста:** у забаненного рядом с верным сообщением снова
появилось `QA Alice left the call` — хост никуда не выходил. Это ALK-3484 (REVIEW), теперь
подтверждено на трёх разных триггерах: `Ban`, `Remove from call` и `Ban` изнутри Side Room,
плюс перевод в комнату. Тому, кто чинит ALK-3484, стоит покрыть их все, а не только
`End for everyone`.

### Не дефект (и ловушка измерения): после нескольких входов/выходов в Side Room `getStats()` показывает шесть исходящих аудиопотоков

Пять циклов «зайти в комнату → выйти» подряд. После них участница остаётся в главном звонке
в нормальном состоянии, но `getStats()` на её странице показывает **шесть** строк
`outbound-rtp` вида `audio`, и у всех `active: true`. Выглядит как утечка публикаций.

**Утечки нет.** Настоящий источник правды — `getSenders()`:
```
pc.state = connected
senders = 1, sendersLive = 1          <- живой отправитель ровно один

шесть строк outbound-rtp, два замера с интервалом 8 с:
  ssrc 2849994895 mid 11   32109 байт / 381 пакет   ->  32109 / 381    (заморожена)
  ssrc 2988556646 mid 10   26610 / 383              ->  26610 / 383    (заморожена)
  ssrc  318003182 mid  7    2194 / 23               ->   2194 / 23     (заморожена)
  ssrc 3527618507 mid  8   33792 / 388              ->  33792 / 388    (заморожена)
  ssrc 3915328489 mid 12  135579 / 1548             -> 172343 / 1965   <- РАСТЁТ только эта
  ssrc  576341503 …                                                     (заморожена)
```
То есть браузер хранит статистику по ранее использованным трансиверам, и поле `active: true`
у них ничего не значит. Пять циклов не оставили ни одной лишней публикации; медиа в порядке.

**Для следующих сессий:** число строк `outbound-rtp` — не число публикуемых потоков.
Считать надо `getSenders().filter(t => t.track && t.track.readyState === 'live')`, а «поток
живой» доказывать ростом байтов у **конкретного ssrc** между двумя замерами. Общий помощник
`RTC_STATS` печатает все строки подряд, и на длинном звонке это легко прочитать как дефект.

### Verified working — `Raise hand` изнутри Side Room доходит до ведущего

Участница, находясь в Side Room, поднимает руку. У ведущего в панели и на плитке появляется
и то, и другое:
```
строка панели: QC QA Carol CO-HOST Room Two
  маркеры: participant-row-breakout-badge | svg "Hand raised" | svg "Camera off" | svg "Muted"
плитка:  маркеры: participant-hand-raised | participant-tile-side-room-dot | …
```

**Заодно ловушка:** мой наблюдатель панели читает `innerText`, а «Hand raised» — это
`aria-label` у `svg`, текста у него нет. По тексту панели изменение не видно вообще, и
поспешный вывод был бы «статус из комнаты не доходит». Маркеры надо перечислять по
атрибутам, а не по тексту.

### Усиление BUG-7: сам участник в пустую комнату зайти может — не может только ведущий перевести

Нашёл контрол, которого раньше не видел: на карточке **другой** комнаты у участника,
находящегося в комнате, есть кнопка `Switch` (`data-testid="side-room-action"`, у карточки
своей комнаты та же кнопка называется `Joined`, а из главного звонка — `Join`).

```
до:  Room Two   status=active   participant_count=2   (участница здесь)
     Room Three status=waiting  participant_count=0   (пустая — ведущему НЕ предлагается
                                                        в MOVE TO SIDE ROOM, см. BUG-7)

участница жмёт Switch на карточке Room Three:
     диалог "Switch to this room? You'll leave Room Two and move to the selected side room."
     -> Switch room

после: Room Two   status=active  participant_count=1
       Room Three status=active  participant_count=1   <- она внутри, стенд показывает "Room Three"
```

**То есть пустая комната полностью рабочая — в неё просто нельзя перевести человека
действием ведущего.** Два контрола лежат в одной и той же панели звонка: карточка комнаты
пускает участника внутрь, а меню участника у ведущего эту же комнату не предлагает.
Это и есть самая наглядная формулировка BUG-7; добавляю её в отчёт.

### СНЯТА гипотеза «после бана внутри Side Room и разбана участник не может вернуться в звонок»

Выглядело серьёзно. Участник, которого забанили, пока он был в Side Room, а потом разбанили,
при переходе на маршрут звонка **отбрасывался** на `/w/{ws}/directories`, и так три раза
подряд. При этом сервер считал его участником:
```
GET /api/v1/meeting/{id}/participants  -> в списке он есть
GET /api/v1/meeting/{id}/bans          -> его там нет (разбанен)
GET /api/v1/meetings/current           -> отдаёт ему этот же звонок

при переходе на маршрут звонка его клиент делал
POST /api/v1/meeting/{id}/breakout-rooms/leave -> 200
и уходил на /directories
```

**Не воспроизводится с чистого состояния.** Провёл ровно тот же сценарий на другом аккаунте:
вход в звонок → вход в Side Room → бан (изнутри комнаты) → разбан → переход на маршрут
звонка. Клиент **нормально** показывает лобби `READY TO JOIN?`. Никакого отбрасывания.

Застрявшего участника вылечил обычный сброс: переход на `/directories` → `reload` →
переход на маршрут звонка → лобби на месте. То есть это было устаревшее состояние клиента
на вкладке, которая к тому моменту пережила два бана, один `Remove from call`, несколько
входов и выходов из комнат и внедрённый перехватчик WebSocket. **Дефектом не оформляю.**

**Побочно замечено при чистом прогоне** (не отдельная находка, тот же корень, что BUG-2):
сразу после бана участника, находившегося в комнате, панель ведущего показывает его
**одновременно** в `BLOCKED (1)` и в группе `IN SIDE ROOMS … Room Two`.

### Приватные Side Rooms на rc.5: два открытых тикета воспроизводятся, третья часть работает верно

**Работает верно — от НЕприглашённого приватная комната скрыта полностью.** Хост создал
приватную комнату, не пригласив никого:
```
у хоста:            "Side Rooms 3 open in this call … YOUR PRIVATE ROOMS
                     Only you can see this room | Private Room | Private | Hidden · invite-only
                     | Add people | Open"
у неприглашённого:  "Side Rooms 2 open in this call … Room Two Public … Room Three Public …"
                     приватной комнаты нет, и она даже не посчитана в «open in this call»
```

**ALK-3528 (открыт) воспроизводится.** Хост приглашает участника в свою приватную комнату
(`POST /api/v1/meeting/breakout-rooms/{room}/invite {"participant_user_id":"<id>"}` → 204).
У приглашённого чужая комната появляется под заголовком:
```
YOUR PRIVATE ROOMS
Only you can see this room
Private Room | Private | Hidden · invite-only | Request access
```
То есть комната хоста подписана приглашённому как его собственная и «видна только вам».
Это ровно находка прошлой сессии, заведённая как ALK-3528 — подтверждаю на rc.5.

**ALK-3412 (открыт) воспроизводится.** Кнопка `Request access` заявку не отправляет, а сразу
заводит внутрь:
```
клик по "Request access" ->
POST /api/v1/meeting/breakout-rooms/{room}/join -> 200
{"room":{"id":"BR…","name":"Private Room","status":"active","visibility":"private", …}}
```
Никакого запроса на доступ не отправляется — вызывается обычный join. (Рядом, как обычно на
этом стенде, `PUT …/breakout-rooms/focus → 404` — это дрейф, см. соответствующий раздел.)

Обе находки уже заведены, в отчёт не выношу — записываю подтверждение на текущей сборке.

### Verified working — треды в чате звонка (в том числе между разными участниками)

- У сообщения в чате звонка при наведении есть ровно два действия: `Thread` и `React`.
  Ни `Edit`, ни `Delete`, ни `Copy link` нет — в отличие от чата канала. Не оформляю
  дефектом: похоже на осознанное решение, а не на поломку; отмечаю как наблюдение, потому
  что панель подписана «Saved to #<канал>», то есть сообщения где-то сохраняются, а
  исправить или убрать своё сообщение из звонка нельзя.
- `Thread` открывает панель «Message thread — Replies sent during this call.» с полем
  `Reply to message` и кнопкой `Send reply`.
- Ответ уходит и виден другому участнику: второй участник, открыв тот же тред, видит
  `QA Alice THREADREPLY-42`, добавляет свой — в панели становится
  `QA Alice THREADREPLY-42 | QA Owner THREADREPLY-43-FROM-OTHER`.
- Ответы из треда в основной список чата не попадают — это ровно то, на что заведён
  открытый **ALK-3027** («Ответ в Call chat thread не отображается за пределами треда»),
  и счётчика ответов у родительского сообщения тоже нет (**ALK-3083** про счётчик в Call
  details). Обе уже заведены.

### Verified working — строка участника выдерживает все маркеры сразу

Нагрузил одного участника максимумом состояний: co-host + в Side Room + поднятая рука +
`Will be right back` + камера выключена + замучен хостом. Строка панели держит всё:
```
текст строки: "QC QA Carol CO-HOST Room Three"      <- имя целое, не схлопнуто
маркеры: participant-row-breakout-badge | "Hand raised" | "Will be right back" |
         "Camera off" | "Muted" | "Participant actions"
геометрия: 335x66, scrollWidth - clientWidth = 0, обрезанных листьев нет
```
Обрезку считал по исправленному правилу (лист шире 24 px, без `sr-only`), а не по наивному
`scrollWidth > clientWidth`, который срабатывает на каждом sr-only узле.
**ALK-3398** («Имя участника в панели схлопывается до 1–3 символов», `TESTING`) на этой
сборке не воспроизводится.

### Verified working (одно наблюдение) — `Mute participants on entry`

```
PATCH /api/v1/meeting/{id}/settings {"mute_on_join":true} -> 200
```
Участник заходит в звонок после этого: его кнопка микрофона — `Unmute` с
`aria-pressed="true"`, то есть он пришёл замученным. В лобби перед входом у него было
`Microphone on`, значит замутил именно вход, а не его собственная настройка.

**Одно наблюдение, не два.** Вторая попытка подтвердить на другом аккаунте оказалась
негодной: панель Meeting settings была закрыта, переключатель не нашёлся, настройка не
изменилась — и участник ожидаемо вошёл незамученным. Это не опровержение, а неудачный
прогон; записываю как есть. Сама настройка относится к Meeting settings (сектор B),
проверял только её эффект внутри звонка.

### Verified working — демонстрация экрана внутри Side Room изолирована от главного звонка

Участница показывает экран, находясь в Side Room (режим звонка `screen_share_mode:
allowed_all`, чтобы не мешало подтверждение):

```
она сама:                     плитка "QA Carol's screen" есть
главный звонок (двое):        плиток с экраном НЕТ вообще
кто-то заходит в её комнату:  сразу видит "QA Carol's screen",
                              inbound video 1920x1080, framesDecoded 198
главный звонок после этого:   по-прежнему без плиток экрана
```

То есть показ доезжает до участников комнаты и не утекает в главный звонок — так же, как
чат комнаты.

### BUG-9 [Medium] [frontend] Реакция, отправленная внутри Side Room, показывается всем в главном звонке

Чат Side Room подписан «Only visible to participants of this room», и он действительно
изолирован — как и демонстрация экрана (обе проверки выше). **Живые реакции — нет:**
реакция, отправленная изнутри комнаты, всплывает на плитке отправителя в главном звонке
и видна тем, кто в комнату не входил. В обратную сторону изоляция при этом соблюдается.

**Полная матрица, один и тот же инструмент (поиск эмодзи по всему видимому DOM, шаг 300 мс),
в одной сессии, с положительным контролем:**

```
отправитель В ГЛАВНОМ ЗВОНКЕ (🎉)
   наблюдатель в главном звонке ...... видит на 6991 мс   <- КОНТРОЛЬ: реакции работают
   наблюдатель внутри Side Room ...... не видит            <- изоляция соблюдается

отправитель ВНУТРИ Side Room (👍)
   наблюдатель в главном звонке ...... видит на 7861 мс
   второй наблюдатель в главном ...... видит на 7867 мс
   (те же прогоны раньше: 👏 на 6841 мс, ❤️ на 7254 мс, 👏 на 7571 мс — всего пять)

отправитель ВНУТРИ Side Room, наблюдатель В ДРУГОЙ Side Room (👏)
   не видит                                                <- в другие комнаты не уходит
```

Где именно рисуется у постороннего — снято по цепочке `data-testid`:
```
элемент 72x56, цепочка: participant-reaction-burst -> participant-tile -> live-stats-tile
у второго наблюдателя 32x32: participant-reaction-burst -> participant-tile ->
                             live-stats-tile -> spotlight-slider-tile -> spotlight-slider
```
То есть это штатный «всплеск реакции» на плитке участника в главной сетке.

**ПРИЧИНА НАЙДЕНА — снята с провода.** Реакции ходят бинарными кадрами по сигнальному
сокету LiveKit (`wss://…/rtc/v1?access_token=…`), а не по WS приложения и не по
`RTCDataChannel` (обе попытки перехвата описаны ниже отдельно). Поставил перехватчик
WebSocket, который рендерит бинарные кадры как печатаемый ASCII и **нумерует сокеты**.

Отправитель, находясь в Side Room, держит два сокета LiveKit:
```
sock 1  chat  (WS приложения)
sock 2  rtc   token …JCTA2Ozw-4P_AnX28FAwYAAA   <- ГЛАВНЫЙ звонок (открыт первым)
sock 3  rtc   token …-O3BfwEEbfSxMGAAAA%3D%3D   <- SIDE ROOM (открыт при входе в комнату)
```

Он нажимает реакцию **изнутри комнаты**, и кадр уходит так:
```
dir out  sock 2 (ГЛАВНЫЙ)  len 76   '…U4QAOWNER000001…reaction…:58ec0923-…'
dir in   sock 2 (ГЛАВНЫЙ)  len 155  (возврат/рассылка)
dir in   sock 2 (ГЛАВНЫЙ)  len 81
на sock 3 (комната) про reaction нет ничего
```
Сокет комнаты при этом живой (in 40 / out 27 кадров за то же время) — просто реакция в него
не публикуется.

**То есть клиент публикует реакцию в главную комнату независимо от того, в какой комнате
находится пользователь.** Это объясняет всю матрицу разом: в главном звонке её видят
(туда и опубликовали), в другой комнате — нет (туда не публиковали), а соседи по своей
комнате видят её через своё **главное** соединение, которое они держат по retained-main.
Метка `[frontend]` подтверждена.

**Перепроверено на полностью свежих клиентах** (все четыре окна прошли жёсткий сброс —
переход на другую страницу, `reload`, возврат в звонок), чтобы исключить ровно ту ловушку,
на которой сорвались четыре снятые гипотезы:
```
контроль: отправитель в главном звонке
   наблюдатель в главном ...... видит на 6954 мс
   наблюдатель в комнате ...... не видит
тест:     отправитель в комнате
   наблюдатель в главном ...... видит на 6944 мс   (participant-reaction-burst -> participant-tile)
   второй в главном ........... видит на 6959 мс   (то же самое)
```

**Перепроверено ещё раз — с наблюдателем, у которого роль снята измерением прямо перед
прогоном** (после того, как соседняя гипотеза сорвалась именно на роли наблюдателя):
```
наблюдатель: GET /api/v1/meeting/{id}/my-permissions
             role: participant, can_manage_breakout_rooms: false   <- обычный участник
контроль: отправитель в главном звонке -> наблюдатель видит на 7273 мс
тест:     отправитель внутри Side Room  -> наблюдатель видит на 6950 мс
          (participant-reaction-burst -> participant-tile)
```
То есть утечка не связана с правами наблюдателя.

**Дедуп:** открытых багов про реакции нет вообще; ALK-2442 (`TESTING`) — про то, что
*настройка* reactions игнорировалась чатом основного зала, это другое.

### Verified working — звук Side Room не утекает в главный звонок

Самый чувствительный канал проверен отдельно, с положительным контролем.

Состояние: в главном звонке **один** участник (наблюдатель), двое других — в разных
Side Rooms, у всех живые фейковые микрофоны.

```
наблюдатель, пока все остальные по комнатам:
   receivers = 4, inbound-rtp audio rows = []      <- входящего звука НЕТ вообще

один из них выходит из комнаты в главный звонок (КОНТРОЛЬ):
   inbound-rtp audio: ssrc 3158118510
      bytes 46180 -> 81137, packets 536 -> 924
      audioLevel есть, totalAudioEnergy 1.63 -> 2.83 (растёт)
```
То есть проба рабочая, и пустой результат в первом замере — настоящее отсутствие звука,
а не сломанный инструмент.

**Итог по изоляции Side Room:** чат — изолирован, демонстрация экрана — изолирована,
звук — изолирован, **реакции — нет** (BUG-9). Это и делает реакции аномалией, а не
осознанным исключением.

### Verified working — видео с камеры внутри Side Room тоже не утекает

Участница, находясь в Side Room, включает камеру:
```
она сама (в комнате):  outbound video 960x540 + 1920x1080, framesEncoded растёт (3027 / 3002)
наблюдатель в главном звонке: inbound video — НЕТ ни одного потока, ни до, ни после
```
**Положительный контроль тем же инструментом** (добавлен позже, потому что без него
отрицательный результат ничего не стоит): участник **главного звонка** включает камеру —
у того же наблюдателя сразу появляется `inbound video 1920x1080, framesDecoded 292`.
Значит приём видео у него работает, и пустой результат в тесте — настоящее отсутствие.

**Полная матрица изоляции Side Room по итогам всех проверок:**

| канал | изолирован от главного звонка |
|---|---|
| чат комнаты | да |
| демонстрация экрана | да |
| звук | да (с положительным контролем) |
| видео с камеры | да |
| **живые реакции** | **нет — всплывают у всех в главном звонке (BUG-9)** |

Реакции — единственное исключение из четырёх проверенных каналов, и это главный аргумент,
что BUG-9 не осознанное решение, а недосмотр.

### Verified working — запись co-host'ом, и закрытый ALK-3385 действительно починен

**Co-host может записывать.** Полноценный co-host (через `Make co-host`) получает в тулбаре
`Record`, `Meeting settings`, `Call diagnostics`, `Add to call`, управление комнатами.
Запуск записи им работает и оповещает всех:
```
co-host жмёт Start recording -> его собственный индикатор +1,0 с
хост:                    8047 мс  "This call is being recorded" + "Recording started"
участница в Side Room:   8038 мс  то же самое
```

**ALK-3385** (`TESTING`, «после остановки записи кнопка ещё ~20 секунд выглядит активной,
а нажатие запускает новую запись») — на rc.5 починено. Наблюдение кнопки каждые 500 мс
на свежем клиенте:
```
     0 ms  "Stop recording"  enabled
  5027 ms  "Stop recording"  disabled      <- клик по Stop
  5530 ms  "Record"          disabled
 25151 ms  "Record"          enabled       <- ~20 с недоступна, нажать нельзя
```
Попытка нажать в этом окне отклоняется (`disabled`), новая запись не стартует.
`POST /api/v1/meeting/{id}/recording/stop -> 204`.

### СНЯТА гипотеза «после остановки записи кнопка у остановившего перескакивает обратно в Stop recording»

Один раз наблюдал расхождение: у co-host'а, который остановил запись, кнопка через ~15 с
сменилась с `Record (disabled)` на `Stop recording (enabled)`, тогда как у хоста в тот же
момент было `Record` и плашки записи не было ни у кого (только sr-only «Recording stopped»
1×1). Выглядело как «остановившему показывают, что запись идёт».

**Не воспроизводится.** На свежезагруженном клиенте полный цикл (старт → 18 с → стоп →
наблюдение 60 с) даёт ровно правильную последовательность, приведённую выше, без всякого
возврата в `Stop recording`. Перезагрузка застрявшего клиента сразу привела его в согласие
с хостом. Та же категория, что снятые BUG-5 и Pin-for-everyone: вкладка, провисевшая в
звонке пару часов через десятки состояний. **Дефектом не оформляю.**

### Методический вывод прогона: долгоживущая вкладка в звонке сама порождает ложные находки

За прогон я снял **четыре** гипотезы, и все четыре — один и тот же механизм:

| снятая гипотеза | что показалось | чем оказалось |
|---|---|---|
| «плашка Recording висит ~20 с после остановки» (BUG-5) | у участников не гаснет | гаснет за 0,6 с на свежем клиенте |
| «Pin for everyone не доходит до участников» | закрепление видно только хосту | доходит за 1,5–2,5 с на свежем клиенте |
| «после бана в Side Room и разбана нельзя вернуться» | клиента отбрасывает на /directories | с чистого состояния не воспроизводится |
| «после остановки записи кнопка возвращается в Stop recording» | остановившему показывают, что запись идёт | на свежем клиенте правильная последовательность |

Общее: измерение делалось на вкладке, которая к тому моменту провисела в звонке от одного
до двух часов и прошла через десятки смен состояния (баны, разбаны, входы и выходы из
комнат, старты и остановки записи, демонстрации экрана, внедрённые перехватчики). Такая
вкладка накапливает рассогласование, и **любая находка вида «интерфейс показывает не то»
на ней недостоверна**.

**Правило, которое я в итоге применял ко всему:** прежде чем писать «показывает неверное
состояние», повторить замер на **свежезагруженном** клиенте. Если на свежем воспроизводится
— находка настоящая (так устояли BUG-2, BUG-7, BUG-8, BUG-9). Если нет — это вкладка.

Отличать от честных находок помогает второй признак: у настоящих у меня есть **положительный
контроль в том же окне наблюдения** (другое realtime-событие пришло вовремя). У всех
четырёх снятых такого контроля не было.

### Verified working — запрет устройства достаёт участника внутри Side Room

Хост ставит `Device permissions` → `Microphone: Block` участнице, которая в этот момент
сидит в Side Room:
```
PUT /api/v1/meeting/{id}/participants/{userId}/permissions {"mic":false} -> 200
```
Она жмёт `Unmute` у себя в комнате — кнопка остаётся `Unmute` (`aria-pressed="true"`),
включить микрофон не удаётся. Исходящее аудио не идёт ни по одному из её соединений:
```
соединение 1: senders 0, аудио-строка заморожена на 548 байт (два замера с интервалом 8 с)
соединение 2: senders 1 live 1, аудио-строк нет вообще
```
То есть запрет пересекает границу комнаты и применяется к обоим соединениям
(главному и комнатному).

### Verified working — индикатор «печатает» разделён по комнатам (ALK-3309 держится)

**Контроль (без него результат ничего не стоит):** участник главного звонка печатает в
чате звонка — у другого участника главного звонка в панели появляется
`QA Alice is typing…` на 2011 мс и исчезает к 7236 мс.

**Тест:** участница печатает в чате Side Room — у обоих наблюдателей в главном звонке
индикатор **не появляется** ни разу за 22 с.

Значит `typing` разделён по комнатам, как и обещает закрытый **ALK-3309**.

**Ловушка инструмента, из-за которой я чуть не записал это неверно.** Сначала оба замера
(и тест, и контроль) дали «ничего», потому что мой полнотекстовый наблюдатель
(`a-nb-promptwatch.mjs`) смотрит только **листовые** узлы: `if (e.childElementCount) continue`.
Строка `«<имя> is typing…»` собрана из вложенных элементов, и листа с подстрокой `typing`
в ней нет. Ловится наблюдателем по тексту всей панели (`a-nb-panelwatch.mjs`).

То есть у меня теперь **три** разных инструмента для «что появилось на экране», и они ловят
разное:
- `a-nb-poll.mjs` — контейнеры тостов (`role=status|alert`, классы toast/banner). Промпты на
  сцене звонка не видит.
- `a-nb-promptwatch.mjs` — все **листовые** узлы по всему DOM. Видит промпты на сцене, но не
  видит текст, собранный из вложенных элементов.
- `a-nb-panelwatch.mjs` — `innerText` конкретной панели целиком. Видит и то, и другое, но
  только внутри панели.

**Вывод: отрицательный результат достоверен только вместе с положительным контролем,
снятым тем же инструментом.** Здесь контроль и спас: он тоже показал «ничего», и это сразу
указало на инструмент, а не на продукт.

### Verified working — `Stop watching` / `Resume watching` реально отписывают от потока

Не «прячет плитку», а действительно прекращает приём:
```
до Stop watching:      inbound video 1920x1080, framesDecoded 2978
после Stop watching:   входящего видео НЕТ вообще (два замера с интервалом 8 с)
меню при этом меняет пункт на "Resume watching"
после Resume watching: inbound video 1920x1080, framesDecoded 288 (счётчик с нуля,
                       то есть новая подписка)
```
Экономия трафика настоящая.

### СНЯТА находка прошлой сессии BUG-3 (Low) «хосту не сообщают, что просьбу включить камеру отклонили»

Прошлый прогон сектора A записал это как Low и не выносил в отчёт. **На rc.5 не
воспроизводится — хосту сообщают.**

```
хост: "Ask <имя> to turn on camera"
   у участника появляется "QA Alice asked you to turn on your Camera" [Not now] [Turn on]
участник жмёт "Not now"
   у хоста на 4420 мс появляется: "Camera request declined"
```

**Почему прошлый прогон этого не увидел** — почти наверняка тот же селектор: сообщение
ловится наблюдателем по всем листовым узлам DOM и **не** ловится наблюдателем по панели
(панель хоста за все 25 с не изменилась ни разу). То есть это не тост в контейнере тостов,
а сообщение на сцене звонка — ровно тот класс, который узкий селектор пропускает.

Стоит считать эту находку закрытой; в отчёт она и не попадала.

### Проверка вёрстки отчёта (обе темы)

Опубликованный артефакт требует логина, поэтому смотрел локально: обернул файл в
`<!doctype html><html><head>…</head><body>` во временной папке в scratchpad и отдал
`python3 -m http.server 8899`, затем снял в браузере рига.

```
светлая тема: body bg rgb(246,248,247), текст rgb(22,32,31)
тёмная тема (data-theme="dark"):
   body bg rgb(14,20,19)   текст rgb(228,235,233)
   article rgb(22,31,30)   pre bg rgb(28,39,38), текст rgb(228,235,233)
   чип severity: фон rgb(42,32,21), текст rgb(223,169,78)
структура: 8 article, 8 строк сводной таблицы, 8 блоков pre
горизонтальной прокрутки страницы нет: documentElement.scrollWidth == innerWidth == 1920
ни один pre не переполняется: widest scrollWidth 756 при clientWidth 756
```
Скриншоты обеих тем и одной находки целиком просмотрены — заголовки, чипы, нумерованные
шаги и моноширинный блок измерений отрисованы как задумано, тёмная тема читаемая.

**Хвост для уборки в конце прогона:** локальный `python3 -m http.server 8899` и папка
`scratchpad/preview` — оба в scratchpad, снести в самом конце (по CLAUDE.md убийство
процессов откладывается на конец прогона).

### СНЯТА гипотеза «приватные Side Rooms видны всем участникам звонка» — это была роль наблюдателя, а не дефект

Едва не написал как **High/privacy**. Выглядело так: участники, которых **не приглашали**
ни в одну приватную комнату, видели в панели все три:
```
YOUR PRIVATE ROOMS
Only you can see this room
Private Room  Private  Hidden · invite-only  Add people  Request access
Secret Room   Private  Hidden · invite-only  Add people  Request access
Hidden Test   Private  Hidden · invite-only  Add people  Request access
```
и сервер подтверждал это им же:
```
GET /api/v1/meeting/{id}/breakout-rooms   (от лица неприглашённого)
{"name":"Hidden Test","visibility":"private","participant_count":1,
 "created_by":"<id хоста>",
 "participant_preview":[{"user_id":"<id>","username":"<username>","name":"<имя>"}]}
```
то есть имя комнаты, кто её создал, сколько внутри и **кто именно** внутри. Воспроизводилось
на свежезагруженных клиентах, на только что созданной комнате с `invitee_user_ids: []`,
у двух разных аккаунтов. По всем моим же правилам — настоящая находка.

**И всё равно неверная.** Оба «неприглашённых» к тому моменту были **администраторами
встречи**:
```
GET /api/v1/meeting/{id}/my-permissions
   role: admin, can_manage_breakout_rooms: true
```
Я сам выдал им co-host раньше по ходу прогона — для перепроверки BUG-2 — и забыл об этом.

**Решающая проверка.** Снял с одной из них роль (`Remove co-host`), дождался
`role: participant, can_manage_breakout_rooms: false`, и:
```
сервер ей же: [('Room Two','public'), ('Room Three','public')]   — приватных нет вовсе
панель:       "Side Rooms 2 open in this call" — секции YOUR PRIVATE ROOMS нет
второй, оставшийся администратором, приватные комнаты по-прежнему видит
```
То есть видимость приватных комнат привязана к праву `can_manage_breakout_rooms` — это
осмысленное поведение для того, кто комнатами управляет, и оно совпадает с тем, что
записано в закрытом **ALK-2967**: «во время звонка у неприглашённого панель показывала
0 open in this call, а `GET …/breakout-rooms` отвечал `{"rooms":[]}`». Так и есть.

**Новый тип ловушки, отдельный от «долгоживущей вкладки».** Утверждение вида «X видит то,
чего видеть не должен» — это утверждение о **роли**, и роль надо снимать измерением
непосредственно перед выводом, а не помнить. Аккаунт, которому я выдал права полтора часа
назад ради другого теста, перестал быть «обычным участником», а в панели он выглядит так же.

**Правило:** перед любым выводом про доступ — прочитать `my-permissions` действующего лица
в тот же момент. Роль в фикстурах ничего не значит: она меняется по ходу прогона.

**Заодно verified working:**
- приватная комната скрыта от обычного участника полностью — её нет ни в панели, ни в
  ответе API, и она не считается в «N open in this call»;
- у администратора встречи она видна с именем, создателем и составом — это его инструмент;
- кнопка `Request access` у того, кто комнату видит, но не приглашён, **не делает ничего**:
  реальный клик (кнопка топовая по hit-test, `disabled=false`) не порождает ни одного
  запроса и не меняет состояние. Отдельным дефектом не оформляю — это состояние достижимо
  только для администратора встречи, которому и так доступен обычный вход.

### Аудит всех находок на «ловушку роли» — пройден

После того как пятая гипотеза сорвалась из-за роли наблюдателя, перепроверил, не стоит ли
то же под остальными восемью.

- **BUG-9** — перепроверен заново с наблюдателем, у которого `role: participant,
  can_manage_breakout_rooms: false` прочитано прямо перед прогоном. Утечка воспроизводится
  (контроль 7273 мс, тест 6950 мс). Роль ни при чём.
- **BUG-7** — перепроверен с целью, у которой `role: participant` прочитано перед прогоном:
```
комнаты: Room Two  public  active  1
         Room Three public waiting 0
         + три приватные, все waiting 0
меню хоста над обычным участником: MOVE TO SIDE ROOM | Move to Room Two
```
  То есть пустая **публичная** комната по-прежнему не предлагается, и ни одна из четырёх
  пустых комнат (включая приватные, созданные самим хостом) тоже. Формулировка находки
  «в список попадают только комнаты, в которых уже кто-то сидит» подтверждается шире, чем
  я её измерял изначально.
- **BUG-2** — роли (host и co-host) там и есть предмет находки, и я их измерял по ходу.
- **BUG-4** — измерение и есть чтение `my-permissions`.
- **BUG-1, BUG-3, BUG-6, BUG-8** — утверждения не про доступ: приглашение забаненного,
  отсутствие сообщения показывавшему, недоставленный промпт (кадр снят с провода) и
  задержка размещения гостя. Роль наблюдателя ни в одном не участвует, а в BUG-3 и BUG-6
  положительный контроль снят на том же клиенте.

Аудит закончен: ни одна из восьми находок на этой ловушке не стоит.

### Попытка довести причину BUG-9 до кода — не вышло, механизм не пойман

Хотел дать разработчику точную границу для BUG-9 (реакция из Side Room видна в главном
звонке) и попробовал поймать транспорт.

1. **WebSocket** — перехватчик на странице наблюдателя за всё окно записал типы кадров
   `subscribe / subscribed / participant_admitted / participant_joined /
   participant_joined_breakout / workspace.call.live.participants_changed / device.state /
   ping / pong`. **Ни одного кадра со словом reaction.** Значит реакции ходят не по WS.
2. **RTCDataChannel** — написал init-script, оборачивающий `RTCPeerConnection` и
   перехватывающий `createDataChannel` и событие `datachannel`. Наблюдатель зашёл в звонок
   с этим хуком:
```
каналы, которые он увидел: pc1 _lossy (local), pc1 _reliable (local), pc1 _data_track (local)
реакция из комнаты пришла ВИЗУАЛЬНО на 6340 мс
сообщений на data-каналах за это время: 0
всего записей в логе хука: 3 (только события открытия каналов)
```

**Почему, скорее всего, не поймалось.** Хук видит **один** `RTCPeerConnection` (`pcs: [1]`)
и только локально созданные каналы, без единого события `datachannel`. У LiveKit обычно
两 соединения (publisher и subscriber), и входящие данные приходят на subscriber. То есть
SDK, похоже, захватывает `RTCPeerConnection` при загрузке модуля — ровно та же ловушка,
что CLAUDE.md описывает для `fetch` («приложение захватывает fetch на этапе загрузки
модуля»). Чтобы поймать, init-script должен отработать раньше SDK, а он и так стоит до
`domcontentloaded` — значит нужен другой подход (например, перехват на уровне
`RTCPeerConnection.prototype.createDataChannel`, а не конструктора).

**Вывод:** причину BUG-9 оставляю неустановленной — по CLAUDE.md лучше опустить раздел, чем
угадать. В отчёте у этой находки раздела «Подтверждённая причина» нет; вместо него измеренная
граница: утечка идёт только «комната → главный звонок», а «главный → комната» и
«комната → другая комната» отфильтрованы, то есть фильтрация есть и она односторонняя.

**Для следующей сессии:** если понадобится ловить data-канал LiveKit, патчить
`RTCPeerConnection.prototype.createDataChannel` и `prototype.addEventListener`, а не
подменять конструктор — конструктор к моменту загрузки SDK уже скопирован.


---

## Вечерний блок (19:40 → …), звонки `QA-A-EVE-1` / `QA-A-EVE-2` / `QA-A-OPEN-1`

### КОРНЕВАЯ ПРИЧИНА ALK-3454 — установлена по проводу и по исходнику. В отчёт НЕ идёт (дедуп)

**Симптом, с которого начал:** `Pin <имя> for everyone` у хоста отрабатывает (`POST /pin` → 200,
у хоста появляется бейдж `participant-pinned-for-everyone` и подпись переключателя вида
«The host pinned <имя> for everyone»), а у участников не меняется ничего. Прошлая часть этой же
сессии сняла ровно такую гипотезу как «артефакт рига» — и была неправа: контроль тогда был
недостаточный. Здесь контроль полный.

**Механизм — целиком снят с провода.** Клиент подписывается на комнату встречи кадром
`{"type":"subscribe","meeting_id":...}` по app-WebSocket. Пока пользователь ждёт в лобби, он ещё
не участник, и шлюз отвечает отказом. Второй попытки после впуска нет — клиент считает себя
подписанным до конца звонка.

Трасса участника, вошедшего через зал ожидания (перехват `WebSocket` с момента загрузки страницы):
```
 6 s  out {"type":"subscribe","meeting_id":"<meeting>"}
 6 s  in  {"code":"1008","message":"нет доступа к встрече","type":"error"}
 6 s  out {"type":"unsubscribe","meeting_id":"<meeting>"}
 6 s  out {"type":"subscribe","meeting_id":"<meeting>"}
 6 s  in  {"code":"1008","message":"нет доступа к встрече","type":"error"}
26 s  in  {"channel_id":"","meeting_id":"<meeting>","type":"workspace.call.live.participants_changed",…}
          ^ хост нажал Admit — больше подписаться клиент не пробует ни разу
```
Для сравнения — тот же клиент в звонке **без** зала ожидания (Require approval to join выключен):
```
 6 s  out {"type":"subscribe",…}
 6 s  in  {"code":"1008","message":"нет доступа к встрече","type":"error"}   <- ещё не вошёл
 6 s  out {"type":"unsubscribe",…}
 6 s  out {"type":"subscribe",…}
 6 s  in  {"meeting_id":"<meeting>","type":"subscribed"}                     <- уже вошёл, ОК
```
То есть спасает ровно вторая попытка (remount компонента). При лобби обе попытки успевают
пройти за одну секунду, задолго до решения хоста, и обе получают отказ.

**Оба конца читаются в исходнике на задеплоенном коммите:**
- `ws-gateway/internal/ws/client.go:243` — `handle()` на `subscribe` с `meeting_id` зовёт
  `CheckMeetingAccess`, и при отказе шлёт `{"type":"error","code":"1008"}` **вместо**
  `subscribed`; подписки не создаётся.
- `realtime-service/.../service/room_access.go:98` — `UserRoomAccess`, то есть строка участника
  с `HasJoined`. Ждущий в лобби её не имеет.
- `packages/core/src/realtime/client.ts` `retainChannel()` — кадр `subscribe` уходит один раз и
  безусловно кладётся в `roomRefs`; ответ не проверяется. Единственный повтор — реплей всех
  удержанных подписок при **реконнекте сокета** (~строки 461–464). Обработчика кадра `error`
  во фронте нет вообще (`git grep 1008` по `packages`/`apps` — ни одного попадания).

**Положительный контроль, тот же звонок, тот же момент, то же действие хоста.**
Bob вошёл в звонок без лобби (подписка есть), Carol впущена из лобби (подписки нет).
Хост жмёт `Pin QA Bob for everyone` через меню участника:
```
alice (хост)             big=QA Bob [PINNED]  переключатель='The host pinned QA Bob for everyone'
bob   (подписан)         big=QA Bob (you) [PINNED] переключатель='The host pinned QA Bob for everyone'
carol (впущена из лобби) big=QA Alice          переключатель='Grid view'   pin-кадров: 0
```
И на том же соединении Carol **исправно получает** личные и не-room-scoped события — то есть
сокет живой, а нет именно room-подписки:
```
у Carol/Bob без подписки приходят:  participant.force_muted, participant.device.requested,
                                    meeting_chat_message, workspace.call.live.participants_changed
не приходят:                        room.video.pinned, room.video.unpinned,
                                    room.settings.updated, room.chat.enabled/disabled
```
(перехват через CDP `Network.webSocketFrameReceived` на уже открытых сокетах — reload не нужен,
так что состояние «сломанного» клиента не разрушается измерением.)

**Второй симптом того же механизма — это и есть ALK-3454.** Хост переименовывает идущий звонок
(`PATCH /api/v1/meeting/{id}` `{"name":"…"}` → 200):
```
alice (хост)             шапка: QA-A-RENAMED-1
bob   (подписан)         шапка: QA-A-RENAMED-1
carol (впущена из лобби) шапка: QA-A-OPEN-1     <- старое имя, не меняется
```
ALK-3454 описывает именно это, с предусловием «страница открыта до создания звонка, вход
кнопкой Join без перезагрузки» и с разделом **Подтверждённая причина: не установлена**. Его
раздел «Проверка» просит ровно то, что здесь измерено: проверить другие meeting-level изменения
и проверить, помогает ли обновление подписки при входе. Ответ: да — и предусловие шире, чем
там записано: **достаточно войти через зал ожидания, а он включён по умолчанию**
(`requires_approval:true` у звонка, созданного из хаба со значениями по умолчанию).

**Дедуп — почему в отчёт не идёт.** ALK-3454 — открытый `Bug` в `Backlog`, и это тот же дефект.
Правило проекта: не сообщать повторно то, что уже открыто. Смежное: **ALK-2567** (открытая
`Task`, не Bug) — «Обработать отказ подписки на встречу: забаненный не получает ни room.synced,
ни причины». Она разбирает тот же кадр `1008` и тот же `retainChannel`, но требование в ней
**обратное моему случаю**: «освобождать room-ref встречи при отказе подписки, чтобы реплей на
реконнекте не слал subscribe в комнату, которая всегда ответит отказом». Если её выполнить
буквально, участнику из лобби станет хуже: ref освободят, повторной подписки не будет уже
никогда, а ждущему в лобби ещё и покажут «доступ закрыт». Кто будет чинить — должен различать
«отказ, потому что забанен» (терминальный) и «отказ, потому что ещё не впущен» (временный,
повторить после впуска). Это стоит сказать в обоих тикетах.

**Что стоит предложить пользователю:** комментарий в ALK-3454 с этой трассой и ссылками на
файлы, и заметка в ALK-2567 про различение двух видов отказа. Ни того, ни другого не делаю —
файлить и комментировать без явной просьбы нельзя.

### Verified working — статусы участника видны и в панели, и на плитке (снимает открытое наблюдение прошлой сессии)

Прошлая сессия оставила незакрытым: «статусы Raise hand / Will be right back рисуются только
на плитке, в панели участников их нет». На rc.5 с четырьмя участниками — **есть**, в виде
иконок с `aria-label` (текстом они не подписаны, поэтому чтением `innerText` панели их и не
видно):
```
до:      'QB QA Bob'  marks=['QA Bob','Camera off','Participant actions','svg']
рука:    'QB QA Bob'  marks=['QA Bob','Hand raised','Camera off','Participant actions','svg']
+отошёл: 'QB QA Bob'  marks=['QA Bob','Hand raised','Will be right back','Camera off','Muted',…]
```
На плитке те же состояния — `participant-hand-raised`, `participant-away`,
`participant-tile-away-label` (единственное, что подписано словами: `WILL BE RIGHT BACK`).
Не дефект.

### Verified working — Spotlight/Grid и локальное закрепление

- Grid при четырёх участниках: 2×2, плитки равные (760×428 при окне 1920 с открытой панелью).
- Spotlight: активный говорящий 1528×798, остальные в `spotlight-slider` по 160×90; нижние
  слои simulcast честно понижаются (480×270 у мелких против 1920×1080 у крупной).
- `Pin for me` действительно переносит spotlight на выбранного и удерживает его, пока говорит
  другой; `Unpin for me` возвращает слежение за говорящим. Меню корректно меняет пункт на
  `Unpin for me`.
- Глобальное закрепление у **хоста** отображается полноценно: бейдж `participant-pinned-for-everyone`
  на плитке, переключатель вида заменён подписью «The host pinned <имя> for everyone»
  (то есть при активном глобальном пине хост не может переключиться в Grid — по-видимому, задумано).

### Наблюдение (не оформляю) — у локального пина нет ни бейджа, ни объяснения в Spotlight

Плитка, закреплённая `Pin for me`, в Spotlight не несёт ни одной пометки:
```
узлы плитки: participant-video, participant-name, participant-network-indicator,
             participant-tile-card-trigger  — и всё
```
Строка в панели участников — тоже без пометки. Единственный след — пункт меню `Unpin for me`.
Пользователь, забывший про свой пин, видит «spotlight перестал следить за говорящим» без
объяснения. **Не оформляю: пересекается с открытым ALK-3494** («A local pin in grid view changes
neither the tile size nor the video quality»), где сказано, что в Grid бейдж как раз рисуется —
значит вопрос про местную индикацию пина уже на столе у команды.

### Наблюдение — у хоста нет действия «опустить чужую руку»

Меню участника с поднятой рукой: `Pin for me | Pin <имя> for everyone | Stop watching |
Make co-host | Admin permissions… | Device permissions… | Remove from call | Ban |
Ask <имя> to unmute | Ask <имя> to turn on camera`. Пункта «Lower hand» нет, и о поднятой руке
меню вообще не упоминает. Это отсутствие фичи, а не дефект — фиксирую как наблюдение.

### Verified working — запись объявляется даже клиенту без room-подписки

Проверял отдельно, потому что это опровергает соблазнительное «раз нет подписки, значит не
доходит ничего»:
```
хост жмёт Start recording в момент T
  подписанный клиент   badge Recording +0,8 с
  клиент БЕЗ подписки  badge Recording +2,0 с
```
Значит уведомление о записи идёт не room-relay'ем. Так же доходят `participant.force_muted`
(хост выключил микрофон) и `participant.device.requested` (просьба включить микрофон) — они
адресные, `recipientScopedEvents` в `ws-gateway/internal/ws/meeting_consumer.go`.

### Verified working — состояние `In-call chat` подтягивается при открытии панели

Хост выключает `In-call chat` в Meeting settings (`PATCH /meeting/{id}/settings`
`{"chat_enabled":false}` → 200). Кадр `room.chat.disabled` получает только подписанный клиент,
но **оба** при открытии панели чата видят «Chat is disabled for this call» и не могут отправить
сообщение. То есть панель перечитывает настройки запросом, и пропущенный кадр здесь не
проявляется. Это и объясняет, почему дефект подписки виден именно на пине: у пина нет
состояния, которое можно перечитать, — только живое событие.

### Повторная независимая проверка двух High на свежем звонке (`QA-A-RENAMED-1`, 21:0x)

Обе находки воспроизводятся на другом звонке, другими участниками, спустя часы — на той же
сборке `v0.61.0-rc.5-c4b5386b4a3a` (стамп перечитан).

**BUG-4** — Carol никогда не была администратором, диалог открылся пустым, отмечен один
`Manage chat`:
```
запрос:  {"can_manage_chat":true, …все прочие false…, "can_manage_meeting_settings":false}
сервер:  GET /meeting/{id}/my-permissions -> role=admin, true: can_manage_chat,
                                             can_manage_meeting_settings
```
и панель `Meeting settings` у неё полностью рабочая (Host approval / Anyone / Password /
Require approval / Public / Private / Guest link + Save).

**Заодно — подтверждение к BUG-4, которое стоит знать:** после выдачи одной галочки меню
участника у хоста показывает для Carol пункт **`Remove co-host`** вместо `Make co-host`, то есть
«гранулярный админ» и «co-host» — одна и та же роль. Снятие работает корректно:
`DELETE /meeting/{id}/admins/{user}` → 204, `my-permissions` возвращает `role=participant`,
пустой список. (Само подтверждение снятия — отдельный диалог «Remove co-host?»; первый клик
только открывает его. Сначала принял это за «действие ничего не делает» — не подтвердилось.)

**BUG-2** — два модератора, у обоих панель участников открыта всё время:
```
до:      alice  'Participants 4 in call … QO QA Owner CO-HOST QB QA Bob QC QA Carol'
         owner  'Participants 4 in call … QO QA Owner (you) CO-HOST QB QA Bob QC QA Carol'
alice банит Bob: POST /meeting/{id}/participants/{bob}/ban -> 204
+8 с:    alice  'Participants 3 in call BLOCKED (1) QB QA Bob <e-mail> Unban …'
         owner  'Participants 3 in call QA QA Alice HOST QO QA Owner (you) CO-HOST QC QA Carol'
+28 с:   без изменений
```
Встроенный положительный контроль: счётчик у обоих поменялся 4 → 3, то есть событие о выходе
участника до второго модератора дошло — не дошла именно секция `BLOCKED`.
Разбан (`DELETE …/ban` → 204) чистит секцию у alice; у второго модератора её и не было.

### Verified working — приватные сообщения в чате звонка

Композер чата звонка умеет адресата: `To` → `Everyone | QA Bob (member) | QA Carol (member) |
QA Owner (member)`. Отправка лично Bob:
```
alice (автор)   'QA Alice HOST  Private to QA Bob  QA Bob · 20:49  Read  Thread  dm-…'
bob  (адресат)  'QA Alice HOST  Private to QA Bob  QA Bob · 20:49  Thread  dm-…'
carol           сообщения нет
owner           сообщения нет
```
Тред на приватном сообщении тоже приватен: Bob ответил в тред — у carol и owner в списке чата
по-прежнему ничего. Действия над сообщением в чате звонка: только `Thread` и `React`
(ни edit, ни delete, ни copy) — одинаково у автора и у читателя.

**Проверено и снято:** показалось, что при выбранном личном адресате плейсхолдер композера
всё равно говорит «Message everyone». Не подтвердилось: видимый плейсхолдер —
`Private message to QA Bob` (атрибут `placeholder` поля ввода), а узел с текстом
`Message everyone` имеет размер **1×1 px** — это скрытая подпись Lexical, а не то, что видит
пользователь. Замер: перебор листовых узлов с точным текстом + цепочка `opacity` +
`elementFromPoint` в центре узла.

### Verified working — реакции

Панель реакций: `👏 👍 ❤️ 😂 🎉 😮`, 278×58, без переполнения (`scrollWidth == clientWidth`).
Все шесть, отправленные одним участником, доезжают до двух других за ~1,5 с и рисуются
на плитке автора (`participant-reaction-burst` внутри `participant-tile`), в том числе на
её копии в `spotlight-slider`.

### Verified working — Fullscreen

`Enter fullscreen` → `document.fullscreenElement` = `html`, кнопка переименовывается в
`Exit fullscreen`, все контролы тулбара на месте, плитки на месте, панель участников
открывается и работает внутри полноэкранного режима. Выход по кнопке работает.
(Проверял и `Escape` — синтетическое нажатие из Playwright полноэкранный режим не снимает,
это ограничение рига, а не поведение продукта: выход по Escape делает сам браузер.)

### Заметка про перечисление кнопок на экране звонка

`vis()` (rect + opacity + display/visibility) на маршруте `/call/{id}` возвращает и все кнопки
**хаба звонков под оверлеем** — `Start now`, `Schedule meeting`, весь список истории, `Load more`.
Они не невидимы, они перекрыты непрозрачным `call-overlay-expanded`. Кто будет считать
«что видно в звонке» — фильтровать по принадлежности к оверлею, иначе список раздувается
двумя десятками посторонних имён.

### Повторная проверка BUG-3 с корректным контролем — находка держится, отчёт усилен

Тот же клиент, одно окно наблюдения, размеры элементов записаны:
```
t ≈ 5 c   контроль — ведущий выключает участнику микрофон:
  10569 ms   250x26   <p>      "A host muted your microphone"      <- настоящее сообщение
t ≈ 19 c  проверяемое действие:
  PUT /meeting/{id}/participants/{user}/permissions {"screen_share":false} -> 200
  40529 ms   1x1      <span>   "Screen sharing is not allowed for you in this call."
  строки "A host stopped your screen sharing" не появилось ни разу
```
**Новая деталь, которой в первом замере не было:** после отзыва кнопка показа не просто
возвращается в `Share screen`, она становится **disabled** (`<button disabled … title="Screen
sharing is not allowed for you in this call.">`), то есть участник не может даже повторно
запросить показ. Восстанавливается только действием ведущего
(`Device permissions… → Screen sharing → Allow` → `PUT …/permissions {"screen_share":true}`).
Это в отчёт добавлено, и измерительный блок заменён на этот, более наглядный (в нём видны
размеры обоих элементов).

**Дедуп ещё раз, по соседям:** открытый **ALK-3453** — про микрофон/камеру, запрещённые
через **Meeting settings** (общая настройка на всех), и он сам отделяет себя от **ALK-2896**
(индивидуальные `Device permissions` с ложным баннером). Мой случай — третий путь: `Revoke
screen sharing` из меню участника, и диагноз другой: строка `screenShareStoppedByHost`
существует и приехала в бандл, но не показывается. Не дубль.

### Verified working — Make co-host / Remove co-host доезжают до самого участника вживую

Наблюдение тулбара цели каждые 500 мс:
```
   0 мс  key=['Participant actions']                                   роль: без бейджа
  16 с   key=['Meeting settings','Participant actions','Record']       роль: CO-HOST
  54 с   key=['Participant actions']                                   роль: без бейджа
```
(16 и 54 с — это моменты кликов, а не задержка доставки.) `End for everyone` co-host'у
не выдаётся — соответствует закрытому ALK-1829.

### Verified working — заявка на демонстрацию экрана и её одобрение co-host'ом

Режим устройства «по запросу»: у участника кнопка называется `Request to share`, после клика
`Requesting…`. Заявка появляется в панели участников **у ведущего и у co-host** секцией
`REQUESTS (1)` с кнопками `Approve Screen share for <имя>` / `Reject …`; у обычного участника
её нет. Одобрение co-host'ом работает, и строка заявки исчезает у ведущего тоже.
После одобрения показ идёт: `gdm=1`, исходящее видео 1920x1080 + 960x540 (simulcast).

### Verified working — демонстрация экрана на приёмной стороне

У зрителей на сцене `screen-share-track` 1528x798 с `screen-share-video` 1920x1080 и подписью
`QA <имя>'s screen`; плитки участников уходят в филмстрип 160x90. Тот же трек рисуется вторым
элементом-миниатюрой 158x88 в филмстрипе (тоже 1920x1080 на декодере).

### Verified working — локальный пин переживает демонстрацию экрана

Пока идёт показ, `Pin for me` на участнике не меняет сцену (экран остаётся крупным) и бейджа
не рисует — но состояние сохраняется: как только показ остановлен, закреплённый участник
занимает сцену (1528x798), а меню показывает `Unpin for me`. То есть пин отложен, а не потерян.
(Отсутствие видимой пометки у локального пина — пересекается с открытым ALK-3494, не оформляю.)

### Наблюдение — меню на плитке беднее меню в панели

Для одного и того же ведущего и одной и той же цели:
```
плитка (participant-tile-card-trigger): Pin for me | Pin <имя> for everyone | Stop watching | Mute <имя>
панель (Participant actions):           то же + Make co-host | Admin permissions… | Device permissions… |
                                        Remove from call | Ban | Ask <имя> to turn on camera
```
Похоже на осознанный «быстрый» набор — всё недостающее достижимо из панели, поэтому дефектом
не считаю. У обычного участника на плитке `Pin for me | Stop watching` — корректно.

### Повторная проверка BUG-6, BUG-7, BUG-9 на звонке `QA-A-RENAMED-1` — все три держатся

**BUG-7 — воспроизведён вместе с A/B, снимающим «может, клиент устарел».** Ведущий создаёт
Side Room (создатель попадает внутрь), выходит из неё — комната остаётся открытой и пустой:
```
GET /meeting/{id}/breakout-rooms -> [{name:"<комната>", status:"waiting", participant_count:0}]
меню участника у ведущего (все текстовые узлы, меню не обрезано:
   scrollHeight==clientHeight 347==347, overflow: visible):
   Pin for me | Pin <имя> for everyone | Stop watching | Make co-host | Admin permissions… |
   Device permissions… | Remove from call | Ban | Ask <имя> to unmute
   -> раздела MOVE TO SIDE ROOM НЕТ ВООБЩЕ

затем другой участник заходит в эту комнату сам: POST /meeting/breakout-rooms/{room}/join -> 200
GET /meeting/{id}/breakout-rooms -> [{status:"active", participant_count:1}]
меню участника у ведущего:
   … | Move to Side Room | Move to <комната>        <- раздел появился
```

**BUG-6 — кадр снят заново, на другом звонке.** У участника внутри Side Room перехват кадров
уже открытого сокета (CDP `Network.webSocketFrameReceived`, без reload):
```
хост: Ask to return to main room
  POST /meeting/{id}/breakout-rooms/return-request -> 204
  +9,6 c  in  sock 3  len 218
  {"breakout_room_id":"<room>","event_id":"<id>","meeting_id":"<meeting>",
   "participant_id":"<participant>","requested_by":"<user>","type":"return_to_main_requested"}
```
и при этом полнотекстовое наблюдение экрана участника 70 с (набор видимых текстов
пересобирается каждые 350 мс, записываются все изменения набора) не показало **ни одного**
изменения: диалога `Stay` / `Return` не появилось. Совпадает с опубликованной причиной —
обработчик кадра есть только в фиче guest-meeting.

**BUG-9 — воспроизведён на другой комнате.** Участник внутри Side Room отправляет `🎉`;
все три участника **главного звонка** видят её через ~1 с на его плитке в филмстрипе:
```
alice  +6046 мс  🎉 32x32  [participant-reaction-burst, participant-tile, spotlight-slider-tile]
carol  +6353 мс  🎉 32x32  [то же]
owner  +6350 мс  🎉 32x32  [то же]
```
(наблюдение начато за 5 с до отправки, отсюда смещение ~1 с относительно клика).

**Заодно подтверждено на rc.5:** открытый **ALK-3481** — меню ведущего над участником,
сидящим в комнате, по-прежнему предлагает `Move to <комната, в которой он уже сидит>`;
и `PUT /meeting/{id}/breakout-rooms/focus` по-прежнему отвечает **404**, то есть дрейф стенда
никуда не делся.

**Инструментальная заметка.** Наблюдатель, дедуплицирующий найденные тексты за весь прогон,
скрывает повторное появление того же сообщения — контроль тогда выглядит «сработавшим на
0 мс». Правильная форма — записывать *набор* видимых текстов и фиксировать каждое его
изменение (`a-nb-promptwatch3.mjs`). Отдельно выяснилось, что промпт
«<имя> asked you to turn on your Camera» **не гаснет сам** — он висит, пока на него не
ответят, поэтому «экран чистый» перед прогоном надо обеспечивать кнопкой, а не ожиданием.

### Приём от соседней сессии: диффить перечисления бэкенда против карт фронта — результат по моему сектору

Сосед (testing-73) прислал приём: везде, где бэкенд шлёт enum, а фронт его отображает, два
списка — это контракт, который никто не проверяет; извлечь оба, отсортировать, `comm`.
Применил к realtime-событиям звонка на задеплоенном коммите `c4b5386b4a3a`.

**Что диффил.** Строки событий бэкенда (`realtime-service/internal`, `ws-gateway/internal`,
без `_test.go`) против констант фронта в `packages/core/src/realtime/events.ts`, а затем —
для каждой константы фронта — число нетестовых файлов, которые на неё ссылаются.

**Результат — один в один подтверждает уже опубликованную BUG-6 и ничего нового не даёт:**
```
константы фронта, у которых подписчик только в фиче guest-meeting:  1
   BreakoutReturnToMainRequested  <- apps/web/src/features/guest-meeting/hooks/useGuestBreakoutRealtime.ts
константы фронта без единой нетестовой ссылки:  16
   CallReactionAdded  CallTypingStarted  CallQualityAdapted
   CallCancelled  CallDeclined  CallTimedOut
   Signal{Offer,Answer,Candidate,ParticipantJoined,ParticipantLeft,TrackPublished,TrackUnpublished}
   UserCalendar{Created,Updated,Deleted}
```

**Чем это полезно, кроме подтверждения.**
- `CallReactionAdded: 'call.reaction.added'` не используется нигде — и это **сходится с
  причиной BUG-9**: реакции ходят не по app-WebSocket, а бинарными кадрами по сигнальному
  сокету LiveKit. Константа мёртвая. То же с `CallTypingStarted` — индикатор набора работает,
  значит идёт другим путём.
- `Signal*` — сигналинг WebRTC, его разбирает SDK LiveKit, не фронтовый слой. Не дефект.
- **Лид для сектора B (не мой):** `CallDeclined`, `CallCancelled`, `CallTimedOut` не имеют ни
  одной нетестовой ссылки во фронте. Рядом лежат открытые **ALK-3391** («звонящему показывают
  Missed call»), **ALK-3177** («отменённый Direct Call без времени и информации») и
  **ALK-3176**. Возможна общая причина. Осторожно: в бэкенде эти три помечены
  `recipientScopedEvents` и доставляются notification-service адресно, так что фронт может
  узнавать о них уведомлением, а не этим кадром. Проверять — тому, кто ведёт сектор B.

**Ловушка, в которую едва не попал.** Первые кандидаты из общего диффа —
`participant.unbanned`, `participant.track_force_muted`, `participant.access_revoked`,
`guest_link.revoked` — во фронте не встречаются вообще. Но они не WS-события: все четыре
пишутся через `recordBackendAuditEvent`, то есть это типы записей **журнала звонка**.
Их отображение — вкладка logs на странице деталей звонка, а это сектор B, не мой. Отдельно
стоит `call.access_revoked` (`revoke_channel_access.go:19`) — он адресное уведомление, и
комментарий в бэкенде прямо утверждает «фронт показывает другой текст — вас удалили из
канала», хотя ссылок на эту строку во фронте ноль. Это единственный кандидат из списка,
последствие которого видно внутри звонка.

### Аудит опубликованного отчёта по двум подсказкам соседа — четыре блока исправлены

Сосед прислал две проверки: (1) цитата должна показывать **механизм**, а не таблицу, в которой
живёт ключ; (2) читать собственный измерительный блок как противник, у которого нет продукта —
сходится ли арифметика, есть ли в приведённом ответе поле, которое называет проза.
Прогнал обе по всем восьми находкам.

**Цитаты — все три секции причин выдержали, я открыл каждый диапазон на задеплоенном
коммите и прочитал.**
```
BUG-6  events.ts:210                       -> BreakoutReturnToMainRequested: 'return_to_main_requested',
       useGuestBreakoutRealtime.ts:722-723 -> client.subscribe<unknown>(WS.BreakoutReturnToMainRequested, …
       useGuestBreakoutReturnPrompt.ts:44-46 -> title/stayLabel/returnLabel из calls.breakout.returnRequest.*
BUG-2  routes.ts:366                       -> participantBans: '/meeting/:meetingId/bans',
       callsKeys.ts:203                    -> participantBans: (wsId, callId) => [...,'participant-bans']
       mutations.ts:3854 и :3884           -> оба invalidateQueries по этому ключу, оба внутри onSuccess мутаций
BUG-3  en.ts:3331                          -> 'calls.moderation.screenShareStoppedByHost': 'A host stopped your screen sharing'
```
Единственная «табличная» цитата — `events.ts:210`, но рядом стоит строка подписки, то есть
механизм читателю показан. Полный `git grep participantBans` даёт 8 нетестовых вхождений,
из них ровно два — инвалидации, обе в мутациях; вдобавок комментарий в самом коде говорит то
же самое своими словами: «the ban list is a REST read with no realtime frame behind it, so the
row it removes only disappears when the list is re-read».

**Противниковое чтение блоков нашло четыре дефекта в моей же подаче — все исправлены:**
1. **BUG-2, блок (а) не совпадал ни с одним записанным прогоном** (`1 ms / 9654 ms`,
   «3 in call → 2 in call», 50 с/400 мс — таких чисел в логе нет). Заменил на записанный
   прогон `0 ms / 7522 ms`, «4 in call → 3 in call», 45 с/500 мс. Это и сильнее: в нём
   контроль виден прямо в цифрах.
2. **BUG-2, блок (б) начинался с `BLOCKED (1)`, хотя проза утверждает, что co-host секцию не
   видит.** Противоречия нет — прогон шёл на свежезагруженном клиенте, — но в отчёте это
   сказано не было. Добавил строку про это и момент разбана (~5-я секунда).
3. **BUG-8: «задержка ~41,7 с» при отметке `46687 ms`** — арифметика не сходилась, потому что
   в блоке не было сказано, что переход выполняется на ~5-й секунде наблюдения. Добавил.
   То же в BUG-9: отметки ~7000 мс — это время от начала наблюдения, а не задержка доставки.
4. **BUG-3: отметки `t ≈ 5 c` / `t ≈ 19 c` были моей оценкой, а не замером**, при том что
   найденный элемент появился на 40529 мс — противнику это читается как «а точно от этого?».
   Заменил на «фаза 1 / фаза 2» без выдуманной точности и заодно написал, какой шаблон поиска
   использовался — иначе неясно, искал ли я вообще ожидаемую строку.

**Правило, которое стоит запомнить (в CLAUDE.md не несу — это метод, а не среда):** каждое
число в измерительном блоке должно либо иметь в том же блоке точку отсчёта, либо не
претендовать на точность. Отметка от начала наблюдения без указания момента действия
выглядит как задержка и не сходится с прозой.

### Дедуп-проход, которого раньше не было: соседний отчёт того же сектора + статус BLOCKED

Сосед предупредил о двух дырах в моём дедупе, обе подтвердились как реальные.

**(1) Сегодня каждый сектор опубликовал по два отчёта — соседний отчёт по моему сектору
тоже цель дедупа, и более близкая, чем Jira.** Проверял по каталогу `reports/`, а не по
`README.md`: индекс дописывается один раз в конце прогона, поэтому во время работы он
заведомо неполон и «нет соседнего отчёта» читается ложно-успокаивающе.
```
A  aloqa-incall-qa-2026-08-26-A.html          1 находка
B  aloqa-calls-qa-2026-08-26-B.html           3 находки
B  aloqa-calls-around-qa-2026-08-26-B.html    9 находок
```
Сверял **утверждения**, а не формулировки, по каждой из своих восьми. Совпадений нет.
Ближе всего:
- сосед по сектору A: «Чужая приватная Side Room показана приглашённому как его
  собственная» — это ALK-3528, у меня в логе он уже отмечен как воспроизводящийся; моей
  находки с таким утверждением нет;
- сектор B, «После неотвеченного приглашения строка участника навсегда остаётся Ringing…» —
  прочитал целиком: это про **неотвеченное** приглашение и застрявшую строку в диалоге.
  Моя BUG-1 — про приглашение **заблокированного**: оно уходит, звонит и всегда падает 403.
  Разные утверждения, разные починки. Не дубль.

**(2) Прописанный фильтр дедупа (`Backlog/Ready/In Progress`) не включает `BLOCKED`, а там
ещё 184 открытых бага.** Прогнал все восемь находок по ним. Совпадений тоже нет, но список
близких стоит записать:
```
ALK-1933 [BE] Side Room chat и reactions игнорируют room settings
         — про то, что запрет chat/reactions не применяется к комнате (энфорсмент прав).
           Моя BUG-9 — про маршрутизацию: реакция из комнаты видна всем в главном звонке.
ALK-1943 ListAdmins не проверяет requester;  ALK-1946 админом можно назначить не-участника
         — обе про назначение админа, но ни одна не про то, что сервер сам добавляет
           can_manage_meeting_settings (BUG-4).
ALK-1849 / ALK-1923  удалённому участнику показывают ложный тост «You left the call»
ALK-1937 Kick/Ban отвечает success, хотя участник остался в LiveKit
ALK-2079 Kick/Ban владельца от delegated admin отдаёт 500
         — все три про сам бан/кик, ни одна не про расхождение списка BLOCKED между
           модераторами (BUG-2).
ALK-1837 Host move в Private breakout room не добавляет participant в allowed list
         — рядом с BUG-7, но утверждение другое.
```
**Заодно: ALK-1917 (BLOCKED) «Отключённый call chat оставляет активными composer и Send»
выглядит починенным** — сегодня при выключенном `In-call chat` панель показывает
«Chat is disabled for this call», и отправить не даёт (проверял на двух аккаунтах).

### Измерено и НЕ пойдёт в отчёт: удаление из канала во время звонка этого канала — уже открыт ALK-3081

Единственный кандидат из энум-диффа, последствие которого видно внутри звонка:
`call.access_revoked` уходит адресным фреймом (`revoke_channel_access.go:166-172`,
`notifyUser`), а во фронте на задеплоенном коммите **ноль ссылок** на этот тип.

**Измерение (звонок канала `#qa-general`, участник внутри звонка, владелец удаляет его из
канала; повторено на двух разных участниках — результат идентичный):**
```
POST /api/v1/channels/members/remove -> 200
на проводе у удаляемого (перехват уже открытого сокета через CDP):
  6254 in  {"channel_id":"<ch>","type":"member_left","user_id":"<user>"}
  6256 out {"type":"unsubscribe","channel_id":"<ch>"}
  6275 in  {"…","type":"workspace.call.live.participants_changed"}
  6374 in  {"channel_id":"<ch>","meeting_id":"<meeting>",
            "reason":"channel_membership_revoked","type":"call.access_revoked"}
на экране у него же (+6,4 с):
  "Call disconnected"                                                     500x26
  "The media session ended. Leave and rejoin if the call is still active." 500x24
  "You no longer have access to this channel."                            250x51  <- про КАНАЛ
через ~9 с сообщение про канал исчезает, остаётся только общая ошибка про media session
```
Строка про media session — общий фолбэк `en.ts:3222`; строк вида «доступ к звонку отозван»
в словаре нет вообще (есть `chat.access.revoked`, `workspace.access.revoked`,
`web.fileViewer.accessRevoked` — про звонок нет).

**Совет, который приложение даёт, выполнить нельзя:** «Leave and rejoin if the call is still
active» — переход на маршрут звонка перекидывает удалённого на `/directories`, без кнопки
`Join` и **без единого сообщения о причине**.

**Дедуп — уже открыт: ALK-3081 `[Task/Backlog]` «Обработать call.access_revoked — закрывать
звонок при удалении из канала».** Он описывает ровно это, включая последствие: «пользователя
всё равно выкинет — но по обрыву LiveKit-соединения, то есть с generic-ошибкой». Формально
это `Task`, а не `Bug`, то есть вне прописанного фильтра дедупа, но по сути — та же работа,
и второй тикет на одну починку не нужен. **В отчёт не идёт.**

Что моё измерение добавляет к ALK-3081 (если кто-то решит дописать туда комментарий —
я этого не делаю без просьбы):
1. подтверждение на стенде с задеплоенной сборкой: фрейм приходит, обработчика нет,
   точные строки, которые видит пользователь;
2. детали, которой в тикете нет: общий текст **активно советует** «Leave and rejoin»,
   а повторный вход даёт молчаливый редирект на `/directories` — то есть совет не просто
   бесполезен, он ведёт в тупик без объяснения.

**Фикстуры восстановлены** — `seed/seed.sh --lanes A`: `#qa-general` снова 6 участников.

### BUG-10 [High] [frontend] Выбор микрофона в звонке не переключает микрофон: звук уходит на системный по умолчанию, а в списке остаётся отмеченным прежний

Всплывающая панель `Select microphone` в тулбаре звонка содержит два раздела — `MICROPHONE`
и `SPEAKER`. Выбор конкретного микрофона в ней не срабатывает: живая дорожка уезжает на
системное устройство по умолчанию, а отметка выбранного устройства в списке остаётся на
прежнем. Раздел `SPEAKER` в той же панели переключается корректно — это встроенный контроль.

**Шаги:** нужны минимум два устройства ввода. В звонке: `Select microphone` → выбрать
именованный микрофон (не «системное по умолчанию») → снова открыть панель.

**Измерение.** Отметка — атрибут `data-selected` на строке устройства; дорожка читается
у отправителя через `RTCRtpSender.track.getSettings()`.
```
(1) ИСХОДНОЕ СОСТОЯНИЕ (два аккаунта из трёх были на именованном микрофоне)
    дорожка: label="Fake Audio Input 2"  deviceId=2ad64de5a1
    список : data-selected=true на строке "Fake Audio Input 2"

(2) ВЫБИРАЮ "Fake Audio Input 1"  (клик по строке подтверждён:
    txt="Fake Audio Input 1 Device ID 58fd...a8f8", data-selected на ней было false)
    дорожка: label="Fake Default Audio Input"  deviceId=default   <- уехала на ДЕФОЛТ
    список : data-selected=true всё ещё на "Fake Audio Input 2"

(3) СОСТОЯНИЕ УСТОЙЧИВО — опрос дорожки каждые 2 с в течение 24 с:
    +2…+24 с   "Fake Default Audio Input / default"   без изменений

(4) ПОВТОР ИЗ ЧИСТОГО СОСТОЯНИЯ (отметка и дорожка обе на дефолте), два раза подряд:
    выбираю "Fake Audio Input 1" -> дорожка default, отметка на дефолте (не сдвинулась)
    выбираю "Fake Audio Input 2" -> дорожка default, отметка на дефолте (не сдвинулась)

(5) КОНТРОЛЬ A — та же панель, раздел SPEAKER, тот же инструмент:
    выбираю "Fake Audio Output 1"
    отметка: "Fake Audio Output 2" -> "Fake Audio Output 1"      <- переключается

(6) КОНТРОЛЬ B — та же панель, строка «системное по умолчанию» в разделе MICROPHONE:
    выбираю "Fake Default Audio Input"
    отметка: "Fake Audio Input 2" -> "Fake Default Audio Input"  <- переключается

(7) КОНТРОЛЬ C — умеет ли вообще браузер выдать конкретное устройство на этой машине:
    for each audioinput: getUserMedia({audio:{deviceId:{exact:<id>}}})
      просил "Fake Default Audio Input" -> получил "Fake Default Audio Input" / default
      просил "Fake Audio Input 1"       -> получил "Fake Audio Input 1"       / 58fdbba292
      просил "Fake Audio Input 2"       -> получил "Fake Audio Input 2"       / 2ad64de5a1
    то есть ограничение по deviceId браузером соблюдается для всех трёх устройств
```
Воспроизведено на трёх аккаунтах (alice, owner, carol) в одном звонке.

**Граница ответственности (это и есть подтверждённая причина).** Контроль C снимает браузер и
медиастек: точное `deviceId` для этих же устройств выдаётся корректно. Контроли A и B снимают
саму панель и её механизм отметки: и колонка динамиков, и строка «по умолчанию» в колонке
микрофонов отмечаются как надо. Не работает ровно один путь — выбор **именованного** микрофона
внутри звонка, и он же оставляет на дорожке псевдоустройство `default` вместо конкретного id.

**Дедуп.** Среди открытых багов (`Backlog/Ready/In Progress`) и среди 184 в `BLOCKED`
совпадений нет. Рядом два **закрытых** (`TESTING`):
- **ALK-2222** `[Task/TESTING]` «pin a concrete input device instead of Chromium's `default`
  alias» — та же болезнь, но починка описана для **входа в звонок** («lobby capture went from
  {audio:true} to exact concrete built-in mic ids»). Внутризвонковое переключение приводит
  дорожку ровно к тому `default`, который там убирали.
- **ALK-2904** `[Bug/TESTING]` «после reload звонок переключается на системный микрофон» —
  другой триггер (перезагрузка), и он закрыт. Но его собственный раздел «Проверка» содержит
  пункт **«Mute state и ручное переключение микрофона продолжают работать»** — то есть ручное
  переключение там объявлено рабочим. Сегодня оно не работает.

**Ожидаемо:** выбранный микрофон становится активным, его строка отмечается выбранной, и на
дорожку уходит конкретный `deviceId`, а не псевдоустройство `default`.

**Ограничение замера:** устройства — фейковые (`--use-fake-device-for-media-stream`), поэтому
контроль C и включён в блок: он показывает, что дело не в них.

### Verified working — перевод участника хостом из одной Side Room в другую

Две комнаты, в каждой по участнику. Хост: меню участника → `Move to <вторая комната>`:
```
POST /api/v1/meeting/{id}/breakout-rooms/move -> 200 (в ответе новый livekit_token)
у переводимого +9,5 с: "You were moved to a Side Room"  249x51
он оказывается во второй комнате (в шапке — её название)
GET /meeting/{id}/breakout-rooms: комната A active/1 -> waiting/0, комната B active/1 -> active/2
у участника второй комнаты счётчик 1 -> 2
```
**Мелочь, не оформляю:** сообщение говорит «a Side Room», не называя комнату, — при двух
открытых комнатах имя было бы полезнее.

### Обратный энум-дифф (подсказка соседа): строки фронта, которые бэкенд не отправляет

Извлёк **значения** всех констант из `packages/core/src/realtime/events.ts` (117 строк) и по
каждой проверил, встречается ли она в бэкенде хоть где-нибудь (весь репозиторий, без
`_test.go`). Без продюсера — 24 строки, из них к звонкам относятся десять:
```
call.featured_share.updated   call.message.created      call.message.deleted
call.participant.hand_raised  call.participant.hand_lowered
call.quality.adapted          call.reaction.added
call.share_request.created    call.share_request.resolved
call.typing.started
```
(остальные 14 — `signal.*` (их разбирает SDK LiveKit), `calendar.*`, `message.*`,
`notification.read` — вне сектора.)

**Вывод: ни одной находки, и обратное направление НЕ свободно от ложных срабатываний.**
Все десять функций сегодня работают и мной проверены: поднятие руки, сообщения чата звонка,
реакции, индикатор набора, заявка на демонстрацию экрана и её одобрение. Значит события
доезжают другим транспортом (LiveKit), а эти константы — легаси-имена. «Ветка фронта без
продюсера» здесь означает мёртвый код, а не строку, которую пользователь никогда не увидит.
Соседу это отправил: правило «у обратного направления нет режима ложных срабатываний»
в моём секторе не выполняется.

**Что из этого всё-таки полезно — лид к открытому ALK-3295** («Статус Raise hand исчезает
после обновления страницы»). Если состояние руки живёт только в эфемерных метаданных
LiveKit, оно должно теряться при перезаходе. Проверил:
```
поднял руку участник X
  наблюдатель Y видит 'Hand raised' в строке X
  наблюдатель Y перезагружается -> по-прежнему видит 'Hand raised'   <- состояние восстанавливается
  сам X перезагружается           -> у X кнопки Lower hand больше нет,
                                     и у Y отметка 'Hand raised' пропала тоже
```
То есть теряется не «отображение у того, кто перезагрузился», а **само состояние**, и потеря
расходится на всех. ALK-3295 открыт, воспроизводится на rc.5 — в отчёт не идёт, но
уточнение стоит того, чтобы его кто-нибудь дописал в тикет.

### Verified working — Push to talk

Переключатель `Push to talk` живёт в той же панели, что и выбор устройств
(`role="switch"`, подпись «Hold Space to talk.»).
```
включаю Push to talk -> дорожка микрофона enabled=false, кнопка в тулбаре стала "Unmute"
удерживаю Space      -> enabled=true во всех пяти замерах за 2,5 с
отпускаю Space       -> enabled=false во всех четырёх замерах за 2 с
выключаю Push to talk -> дорожка enabled=true, кнопка "Mute"
```
**И отдельно проверено то, что обычно ломают:** при включённом Push to talk фокус в поле
ввода чата звонка не отдаёт пробел микрофону. Печатал `ptt space test one two` посимвольно,
на каждом пробеле снимал состояние дорожки:
```
фокус: textarea, document.activeElement === поле ввода
на четырёх пробелах подряд: enabled=false, enabled=false, enabled=false, enabled=false
итоговый текст в поле: "ptt space test one two"  — пробелы не проглочены
```

### Verified working — микс громкости у участника внутри Side Room

У того, кто внутри комнаты, в панели устройств появляется раздел `VOLUME` с двумя ползунками
(`Main call` и `Side room`); у участника главного звонка — один `Call volume`. Проверено, что
ползунки действительно управляют громкостью и правильно разделены по источникам: у Bob'а три
элемента `audio[data-testid="remote-audio-sink"]` — сосед по комнате и двое из главного звонка.
```
ползунок Main call:   30 -> громкости [1, 0.3, 0.3]     (сосед по комнате не тронут)
                     100 -> [1, 1, 1]
                       0 -> [1, 0, 0]
                      30 -> [1, 0.3, 0.3]
ползунок Side room:  100 -> [1, 0.3, 0.3]
                       0 -> [0, 0.3, 0.3]                (главный звонок не тронут)
                     100 -> [1, 0.3, 0.3]
```
Управлял клавиатурой (`End` / `Home` / `ArrowRight`) с фокусом на ползунке, то есть так,
как это доступно пользователю.

### Verified working — горячие клавиши звонка

В подсказках трёх кнопок объявлены сочетания. Проверены все три (фокус на поверхности звонка):
```
⌘D  "Toggle mute (⌘D)"    дорожка audio true -> false, кнопка Mute -> Unmute
⌘E  "Toggle camera (⌘E)"  публикуется video-дорожка, кнопка -> Turn camera off
⌘L  "End call (⌘L)"       открывается подтверждение "Leave this call? You will be
                          disconnected. The call continues for everyone else…"
```
`⌘L` **не** завершает звонок для всех — ни у обычного участника, ни у ведущего: у ведущего,
у которого рядом есть отдельная кнопка `End for everyone`, сочетание открывает то же
подтверждение выхода. Это правильно и это важно было проверить.

**Мелочь, не оформляю:** подсказка на кнопке `Leave call` гласит **«End call (⌘L)»** —
в приложении, где рядом есть `End for everyone`, «end» и «leave» не синонимы. Диалог
подтверждения формулирует всё верно, поэтому до ошибки не доводит.

### Verified working — счётчик непрочитанных в чате звонка (у участника-члена рабочего пространства)

```
панель чата закрыта, ведущий шлёт 3 сообщения
  -> span[data-testid="call-controls-chat-unread-count"] = "3", 20x20, виден
участник открывает панель  -> счётчик исчезает
закрывает панель           -> не возвращается
```
**Инструментальная заметка (едва не написал ложную находку):** сначала перечислил узлы
**внутри** кнопки `call-controls-chat-toggle` — там только `svg`, и вывод напрашивался
«счётчика нет вообще». Счётчик оказался **соседним** элементом, а не потомком кнопки.
Ровно та ошибка, о которой предупреждает CLAUDE.md: перечислять надо не то, где ожидаешь,
а окрестность целиком.

Заодно это отделяет открытый **ALK-3577** («у гостя не отображается счётчик непрочитанных»):
у члена рабочего пространства счётчик есть и работает, то есть тикет действительно про гостя.

### Подтверждён на rc.5 открытый ALK-3027 — ответ в треде не виден за пределами треда

Ведущий отвечает в тред на своё же сообщение, у участника панель чата закрыта:
```
счётчик непрочитанных у участника: null (не появился вовсе)
```
ALK-3027 перечисляет это прямо в разделе «Проверка» («reply count или new-message
indicator»). Дубль, в отчёт не идёт.

### Проверено и СНЯТО: «личное сообщение участнику внутри Side Room помечается Delivered, но не приходит»

Выглядело как хорошая находка и ею не оказалось. Записываю целиком, потому что путь к «нет»
здесь и есть ценность.

**Что видно.** Список адресатов в композере чата звонка **несимметричен**:
```
ведущий в главном звонке:  Everyone | QA Carol (member) | QA Bob (member) | QA Owner (member)
                            (Carol и Bob в этот момент внутри Side Room — и всё равно предлагаются)
участник внутри Side Room: Everyone | QA Carol (member)
                            (только сосед по комнате; главного звонка в списке нет)
```
Ведущий выбирает адресатом того, кто сидит в комнате, и отправляет:
```
у ведущего: "Private to QA Bob | QA Bob · 22:08 | Delivered"
у адресата (он в комнате): "Chat · Eve Room B — Only visible to participants of this room.
                            No messages yet"
у соседа по комнате и у участника главного звонка: ничего (и правильно)
```

**Почему это НЕ дефект.** Сообщение доставлено — оно лежит в чате **главного звонка**
адресата. Как только он вышел из комнаты, оно там и оказалось:
```
'…Saved to #<канал звонка> … QA Alice HOST | Private to QA Bob | QA Bob · 22:08 | Thread xroom-dm-…'
```
Прочитать его, не выходя из комнаты, мешает **дрейф стенда**, а не продукт: у участника
комнаты в шапке есть вкладка `Main call: <название>`, и на исправном бэкенде она переключает
контекст локально. Здесь `canActivateMainLocally` ложно, поэтому клик по этой вкладке — это
«запросить полный возврат», и он открывает подтверждение выхода из комнаты. Код на
задеплоенном коммите говорит ровно это:
```
packages/features/calls/ui-web/CallHeaderTabs.tsx:108
  const handleActivateMain = canActivateMainLocally ? activateMain : handleLeave
packages/features/calls/ui-web/hooks/useCallHeaderTabs.ts:44-46
  canActivateMainLocally = isSideRoomTopologyActive(state.sideRoomJoinPhase)
  activateMain = () => setActiveContext(MAIN_ACTIVE_CONTEXT)   // локально, без запроса
```
То есть на стенде без ALK-3479 поведение вкладки — задуманный «cold resume», а не поломка.

**Две ошибки, которые я сделал по дороге, обе стоили бы ложной находки.**
1. Сначала снял «клик по вкладке `Main call` не делает ничего: `aria-pressed` не меняется,
   сетевого запроса нет, сообщений нет». Всё это правда — и вывод всё равно был бы неверен:
   я просто **не искал диалог**. Он там был: «Leave Eve Room B? You will return to …».
   Инструмент, который перечисляет `aria-pressed`, тексты и запросы, но не модальные окна,
   даёт уверенное «ничего не произошло».
2. Затем едва не оформил «Delivered, но не доставлено», не проверив, где сообщение окажется
   после выхода из комнаты. Проверка заняла минуту и перевернула вывод.

**Что здесь всё-таки может быть настоящим — и почему не оформляю.** Список адресатов
у ведущего включает тех, кто в комнате, а у сидящего в комнате список сужен до комнаты.
На исправном стенде это, вероятно, и задумано (адресат прочитает во вкладке главного звонка).
Проверить это можно только там, где `PUT …/breakout-rooms/focus` не отвечает 404.
**Тому, кто вернётся к этому на свежем бэкенде:** отправить личное сообщение человеку внутри
комнаты и проверить, доходит ли оно, пока он остаётся в комнате, — и получает ли он о нём
хоть какой-то сигнал (счётчик непрочитанных у вкладки `Main call`).

### Verified working — заглушенный ведущим участник может включить микрофон сам

```
ведущий: Mute <имя>  ->  POST /meeting/{id}/participants/{user}/mute -> 204
у участника кнопка стала "Unmute"
участник жмёт Unmute -> кнопка снова "Mute", в панели ведущего пометки Muted у него больше нет
```
Это штатное поведение: «заглушить» — не то же самое, что «запретить микрофон». Запрет —
отдельный путь (`Device permissions… → Microphone → Block`), он проверен раньше и работает.
Фиксирую как проверенное, потому что «хост заглушил, а человек тут же включился обратно»
легко принять за дефект.

### Verified working — вошедший в идущую запись сразу видит индикатор

```
ведущий включает запись -> у участника badge Recording = true, сообщение "Recording started"
участник выходит из звонка и заходит заново (через зал ожидания, ведущий впускает)
  сразу после впуска: badge Recording = true
  через 15 с:        badge Recording = true
```
То есть состояние записи не теряется при перезаходе. Отдельного согласия/уведомления
«звонок записывается» при входе не показывают — есть только постоянный индикатор.

### Измерено, НЕ оформляю — тот же дефект уже в соседнем отчёте сектора B: ведущий вышел, звонка без модератора

Ведущий (создатель) выходит кнопкой `Leave call` (не `End for everyone`). Звонок продолжается,
и в нём **не остаётся никого с правами**:
```
панель у оставшегося: "Participants 2 in call | QA Owner (you) | IN SIDE ROOMS: QA Carol …"
                       -> бейджа HOST нет ни у кого, CO-HOST тоже нет
его тулбар целиком: Grid view | Minimize to picture-in-picture | Enter fullscreen |
                    Participant actions … | Mute | Select microphone | Turn camera on |
                    Select camera | Request to share | Raise hand | Will be right back |
                    Send reaction | Participants | Call chat | Call diagnostics |
                    Side Rooms | Leave call
                       -> нет Record, нет Meeting settings, нет Add to call, нет End for everyone
его меню на другом участнике: только "Pin for me"
```
То есть некому впустить из зала ожидания, заглушить, одобрить демонстрацию экрана (а режим
как раз `on_request` — у оставшегося кнопка называется `Request to share`), включить запись,
поменять настройки и завершить звонок.

**Почему не в отчёт.** Соседний отчёт сектора B (`reports/aloqa-calls-around-qa-2026-08-26-B.html`)
содержит находку **«[BE][CALLS] Ведущий вышел из звонка с одобрением входа — впустить
стучащегося больше некому, и ведущему нигде об этом не сообщают»**. Это тот же дефект,
взятый со стороны зала ожидания; починка одна. Мой ракурс шире (пропадает вся модерация,
а не только допуск), но заводить второй тикет на одну починку нельзя.
**Если кто-то будет дополнять тот тикет** — стоит добавить перечень выше: отсутствие
преемника лишает звонок не только допуска, но и записи, настроек, одобрения демонстрации
экрана и возможности завершить звонок.

### Verified working — возвращение создателя возвращает ему HOST

Продолжение предыдущего пункта: создатель, вышедший из звонка, заходит обратно —
```
панель: "Participants 4 in call | QA Alice (you) HOST | …"
тулбар: … Record | Participants | Call chat | Meeting settings | Add to call | Side Rooms |
        More | Leave call | End for everyone
```
То есть звонок остаётся без модератора только пока создателя нет; его возврат восстанавливает
права полностью. Это уточнение к находке сектора B — стоит того, чтобы попасть в их тикет.

### Verified working — выключение Reactions в Meeting settings

```
до:  у обоих участников кнопка Send reaction есть
хост: Meeting settings -> Reactions выкл
     PATCH /meeting/{id}/settings {"reactions_enabled":false} -> 200
+6 с: кнопка Send reaction исчезла у обоих участников главного звонка
      и у участницы, находящейся ВНУТРИ Side Room, — тоже
```
**Проверен и «злой» вариант:** участник заранее открывает панель реакций, и уже потом хост
выключает реакции. Панель **закрывается сама** — при попытке нажать эмодзи её в DOM уже нет
(`popover gone`), запроса не уходит, у наблюдателя за 25 с ни одной реакции не появилось.

**Нюанс к открытому ALK-1933** («Side Room chat и reactions игнорируют room settings»,
BLOCKED): на уровне **интерфейса** запрет до комнаты доезжает — кнопка у участницы внутри
комнаты исчезает вместе со всеми. Тикет говорит про приём запроса на стороне API; UI-путь
закрыт. Полезно знать тому, кто будет его чинить или закрывать.

### BUG-10 — причина сужена ещё на шаг: выбор не доходит до собственного хранилища клиента

Клиент держит настройки устройств в `localStorage`, ключ `aloqa-call-device-prefs`:
```
{"state":{"preferredMicDeviceId":…,"preferredCameraDeviceId":…,
          "preferredSpeakerDeviceId":…,"isPushToTalkEnabled":…},"version":2}
```
A/B внутри одного хранилища, один аккаунт, один звонок:
```
исходно                      preferredMicDeviceId = null
выбираю ИМЕНОВАННЫЙ микрофон preferredMicDeviceId = null        <- не записалось
                             дорожка default, строка не отмечена
выбираю строку «по умолчанию» preferredMicDeviceId = "default"  <- записалось, строка отмечена
в том же объекте             preferredSpeakerDeviceId = <конкретный id>
                             (мой более ранний выбор динамика записался конкретным устройством)
```
И третий аккаунт показывает, что конкретный id туда в принципе попадает — у него
`preferredMicDeviceId = "5749a2133a…"`, и публикуемая дорожка ровно этого устройства
(`Fake Audio Input 2 / 5749a2133a`). Он был выставлен не в звонке, а раньше — то есть путь
записи существует, но внутризвонковый выбор именованного микрофона в него не попадает.
Добавлено в отчёт как «Контроль 4».

### Проверено и снято — `Call diagnostics` есть не у всех: это флаг в localStorage, а не разница продукта

В тулбаре кнопка `Call diagnostics` была видна только на одном из четырёх окон. Похоже на
несогласованный интерфейс — но нет: у этого профиля в `localStorage` лежит ключ
`aloqa.calls.nerd-stats`, которого нет у остальных. Отладочный переключатель, включённый
кем-то раньше на этом профиле. Артефакт рига.

### BUG-10 — последнее сужение: список камер работает, значит сломан ровно именованный микрофон

```
alice, preferredCameraDeviceId = null
выбираю единственную камеру в списке "Select camera"
  строка: data-selected false -> true
  хранилище: preferredCameraDeviceId = "d4a636dfb2ad77e4…"   <- конкретный id записан
```
Итого из четырёх списков панели устройств — микрофоны, динамики, камеры и строка «системное
по умолчанию» — не работает **ровно один**: выбор именованного микрофона. Добавлено в отчёт
как «Контроль 5»; теперь формулировка «не работает ровно один путь» не утверждение, а замер.

### Verified working — камера и демонстрация экрана от одного человека одновременно

```
у показывающего исходящие дорожки: audio | video 1920x1080 (камера) |
                                   video 1920x1080 (экран, fenc 6661) | video 960x540
у зрителя: сцена — screen-share-track 1528x798 с screen-share-video 1920x1080,
           подпись "QA <имя>'s screen";
           в филмстрипе его же камера отдельным элементом participant-video 480x270
           и миниатюра экрана 158x88
после Stop sharing: сцена возвращается к плитке участника 1528x798 с видео 1920x1080
```

### Тот же дефект, что ALK-3295, но для статуса «Will be right back» — в отчёт не идёт

ALK-3295 (открыт) описывает потерю статуса `Raise hand` после перезагрузки, включая
пропадание у других участников. Ровно то же происходит со статусом «отошёл»:
```
участник ставит Will be right back  -> у наблюдателя в строке метка "Will be right back"
участник перезагружает страницу     -> у него в тулбаре снова действие "Will be right back"
                                       (то есть статус снят), у наблюдателя метка пропала
```
Один механизм и одна починка, поэтому отдельного тикета не нужно — но в ALK-3295 стоит
дописать, что теряется не только поднятая рука.

### BUG-10 — воспроизведено с нуля, на очищенном хранилище настроек

Последнее возражение, которое можно было предъявить находке: «у профиля накопилось состояние».
Снято:
```
localStorage.removeItem('aloqa-call-device-prefs'); reload
после перезагрузки ключа нет вовсе (raw = "")
выбираю "Fake Audio Input 2"
  дорожка: Fake Default Audio Input / default   (не изменилась)
  отметка: нет ни на одной строке   (ни до, ни после)
  хранилище: preferredMicDeviceId = None        (не записалось)
```
То есть у пользователя, который в этом браузере ни разу устройств не выбирал, поведение
такое же. Добавлено в измерительный блок отчёта.

### Verified working — демонстрация экрана перекрывает Grid view

Зритель находится в Grid (переключатель предлагает `Spotlight view`), кто-то начинает показ:
сцену занимает `screen-share-video` 1526x796, все четыре плитки уходят в филмстрип 160x90.
То есть показ имеет приоритет над выбранным режимом сетки — разумно.
**Мелочь:** переключатель при этом продолжает предлагать `Spotlight view`, хотя на экране уже
не сетка. Не оформляю.

### Уточнение границы BUG-9 — реакции на сообщения в чате комнаты изолированы правильно

В чате Side Room у сообщения есть действие `React` (полноценный эмодзи-пикер, не панель из
шести). Проверено, что оно НЕ течёт наружу:
```
участник комнаты ставит 😀 на сообщение соседа
  у обоих в комнате: "…roomthread-… 😀 1"
  у двоих в главном звонке: за 32 с наблюдения ни одного эмодзи
```
То есть из комнаты утекает ровно **живая реакция кнопкой `Send reaction`** (всплеск на
плитке), а не всё подряд. Уточнение добавлено в измерительный блок отчёта — оно сужает
область починки.

### Наблюдение — в чате Side Room нет тредов

Одно и то же сообщение, одинаковый инструмент, один момент:
```
чат Side Room:   действия сообщения = React
чат главного звонка: действия сообщения = Thread | React
```
Тредов внутри комнаты нет вовсе. Может быть задумано (комната — короткоживущее
пространство), спецификации у меня нет, поэтому дефектом не оформляю. Записываю, потому что
пользователь, привыкший к тредам в чате звонка, внутри комнаты их не найдёт и объяснения
не получит.

Заодно: `React` у сообщения исчезает, когда ведущий выключает `Reactions` в Meeting settings —
и в комнате тоже. Это ещё один UI-путь, который запрет соблюдает (см. заметку к ALK-1933).

### Наблюдение — панель участников внутри Side Room показывает только комнату

```
изнутри комнаты:  "Participants 2 of 4 in call | QA Bob (you) | QA Carol"
из главного звонка: "Participants 4 in call | QA Owner (you) |
                     IN SIDE ROOMS QA Alice HOST Eve Room A | QA Bob Eve Room B | QA Carol Eve Room B"
```
То есть из главного звонка видно всех и с действиями, а изнутри комнаты — только соседей.
Подпись «N of 4 in call» честная: она сообщает, что в звонке четверо. Ведущий, зашедший
в комнату, теряет доступ к модерации главного звонка до выхода из неё.
**Смежное:** открытый **ALK-3332** описывает сценарий «находясь в Side Room, хост жмёт
Pin for everyone на том, кто остался в Main». На этом стенде такой сценарий из панели
недостижим — участников главного звонка изнутри комнаты не видно. Скорее всего, это опять
дрейф (группировка из ALK-3308/3479). Тому, кто будет проверять ALK-3332, стоит начать
с того, видит ли он вообще main-участников изнутри комнаты.

### Тулбар ведущего внутри Side Room

```
Main call: <название> | Main call audio, 30% | Side Room <название> | Leave Side Room |
Spotlight view | Minimize to picture-in-picture | Enter fullscreen | Participants |
Call chat | Meeting settings | Add to call | Side Rooms | More | Leave room | Close room
```
Пропадают `Record` и `End for everyone`; вместо `Leave call` — `Leave room` / `Close room`.
То есть запись изнутри комнаты не запускается, звонок изнутри комнаты не завершается.

### Подтверждён на rc.5 открытый ALK-2993 — участнику комнаты сообщают о записи, которой его не пишут

```
хост (в главном звонке) включает запись
  участник главного звонка: badge Recording = true, сообщение "Recording started"
  участник ВНУТРИ Side Room: badge Recording = FALSE, но сообщение "Recording started" есть
```
Ровно то, что описывает ALK-2993: уведомление приходит, постоянного индикатора нет, потому
что комната считается приватной. Дубль, в отчёт не идёт.

### `Remove from call` — ALK-1849 / ALK-1923 (оба BLOCKED) выглядят починенными

Тикеты утверждают, что удалённому участнику показывают ложный тост `You left the call`.
На rc.5 этого нет — показывают правильное:
```
хост: Participant actions -> Remove from call -> подтверждение
      "Remove participant? Remove <имя> from the call? They can rejoin unless the call is locked."
      POST /meeting/{id}/participants/{user}/kick -> 204
у удаляемого (полнотекстовое наблюдение экрана, размеры элементов записаны):
  +16,2 с  "Call disconnected"  500x26
           "The media session ended. Leave and rejoin if the call is still active."  500x24
  +16,6 с  "A host removed you from the call"  250x51      <- правильное сообщение
  +25,4 с  сообщения погасли, пользователь оказывается на /directories
```
Оба критерия приёмки ALK-1923 («Voluntary Leave → You left the call», «Remove/Kick/Ban →
отдельное понятное moderation сообщение») выполнены. Стоит перепроверить и закрыть.

### Наблюдение (не оформляю) — удалённому заодно сообщают, что «вышли» остальные

В обоих прогонах вместе с правильным сообщением у удаляемого появляются тосты про других:
```
прогон 1: "A host removed you from the call" 250x51 | "QA Alice left the call" 238x24
прогон 2: "A host removed you from the call" 250x51 | "QA Alice left the call" 225x23
                                                    | "QA Owner left the call" 238x24
```
Ни Alice, ни Owner из звонка не выходили — это клиент удаляемого при разрыве соединения
рисует по тосту на каждого оставшегося. Живёт ~5 секунд, гаснет вместе с остальными, на
`/directories` ничего не остаётся, и рядом всё это время висит правильное сообщение.
**Почему не в отчёт:** транзиентный шум разрыва, Low, рядом стоит правда. Критериями
приёмки ALK-1923 не покрыт (там только собственное сообщение удалённого), так что если
кто-то будет чинить тот тикет — вот дополнительный случай из того же кода.

### Verified working — вошедший видит уже идущую демонстрацию экрана

Участник выходит из звонка и заходит заново, пока кто-то показывает экран:
```
сразу после впуска: screen-share-video 1920x1080, отрисован 1886x796,
                    подпись "QA <имя>'s screen", плюс миниатюра 158x88
```

### Verified working — `End for everyone` доходит до тех, кто внутри Side Room

```
участник внутри комнаты, ведущий жмёт End for everyone -> подтверждение
  +9,2 с  "Call ended"  (заголовок 574x26 и 250x26)
 +10,6 с  появляется итоговый экран: "AI summary", "Rate quality"
итог: диалог "Call ended · <название> · 1h 9m 17s | Duration | Recording Available | Chat …"
```
То есть завершение звонка не теряется для тех, кто в комнате.

### Verified working — удалённого из звонка действительно пускают обратно

Диалог подтверждения обещает «They can rejoin unless the call is locked». Проверено:
`POST /meeting/{id}/join` от только что удалённого -> **200**. Обещание выполняется.

### Заметка про риг — вкладка, пережившая kick + несколько перезаходов, залипает

Одна из вкладок после удаления из звонка и нескольких повторных входов встала в состояние
`Offline | Call disconnected | The media session ended.` при том, что `POST /join` отвечает
200, а хост её в списке не видит. Это состояние вкладки, а не продукт: на других аккаунтах
те же действия проходят нормально. Лечится перезапуском браузера; в рамках прогона просто
перенёс сценарий на другой аккаунт. Записываю, чтобы следующий не принял это за дефект.

### Подтверждён на rc.5 открытый ALK-3413 — `More → Make co-host…` не открывает выбор участника

Меню `More` у ведущего содержит ровно один пункт — `Make co-host…` (это `[role="dialog"]`,
не `[role="menu"]`, что стоит знать при автоматизации).
```
панель участников закрыта: клик по пункту -> панель участников ОТКРЫВАЕТСЯ,
                           диалога выбора участника не появляется
панель участников открыта: клик по пункту -> не меняется ничего
                           (диалогов 0, меню 0, текст панели тот же)
```
Совпадает с описанием ALK-3413. Дубль, в отчёт не идёт. Уточнение для тикета: при закрытой
панели пункт всё-таки что-то делает — открывает панель участников; «ничего не делает»
относится только к случаю, когда панель уже открыта.

### Verified working — приглашение в Side Room (`Add people`)

Диалог: «Add people to `<комната>` — INVITE FROM THIS CALL — Select all — `<список>` —
Only people already in the call can be invited. Cancel / Invite».
```
хост жмёт Invite:  POST /meeting/breakout-rooms/{room}/invite {"participant_user_id":"<user>"} -> 204
у приглашённого через ~5 с: баннер 1703x26
  "QA <имя> invited you to join <комната>"   с кнопками [Decline] [Accept]
баннер живёт ~30 с и исчезает сам (8,9 с -> 39,0 с наблюдения)
Accept: POST /meeting/breakout-rooms/{room}/join -> 200, участник в комнате,
        participant_count 1 -> 2
```
Пропущенное приглашение в **публичную** комнату ничего не стоит: комната и так видна в панели
`Side Rooms` с кнопкой `Join`.

### Наблюдение (не оформляю) — `Decline` у приглашения в комнату никому ничего не сообщает

```
приглашённый жмёт Decline -> баннер закрывается, сетевых запросов НОЛЬ
у пригласившего за 45 с наблюдения — ни одного сообщения об отказе
```
То есть `Decline` — это локальное «скрыть баннер». Хост, позвавший человека в комнату,
об отказе не узнаёт и может ждать. Low: серверного состояния приглашения, судя по всему,
нет вовсе (`GET …/breakout-rooms/invites` → 404 `endpoint not found`), у хоста есть счётчик
участников комнаты, а кнопка `Join` для публичной комнаты остаётся доступной. В отчёт
не несу; смежное — открытый **ALK-3074** про то, что приглашение остаётся активным при
самостоятельном входе.

### BUG-8 всё-таки перепроверена — гостя удалось получить без пятого браузера

**Как:** `browser.newContext()` на CDP-подключении к уже запущенному Chrome даёт чистый
контекст без сессии Aloqa — гостевая ссылка в нём открывается именно как гостевая
(«You are invited to “…” — Enter the name hosts will see before they admit you»).
Открытие той же ссылки в обычной вкладке залогиненного окна заводит внутрь под его учёткой,
гостя так не получить. **Важное ограничение:** такой контекст живёт только до конца прогона
`drive.mjs`, поэтому весь сценарий гостя должен уместиться в один снippet, а в конце
нужен `waitForTimeout`, чтобы окно не закрылось, пока смотришь на панель ведущего.

**Прогон (ведущий — в главном звонке, комната уже непустая):**
```
гость: "asked to join" +7,6 с -> admitted +16,7 с (/guest/meeting/…)
       -> сам заходит в Night Room 1 на +25,8 с
панель ведущего (наблюдение начато сразу после впуска):
      1 мс  "Participants 4 in call | HOST | NG Night Guest GUEST | QO Owner |
             IN SIDE ROOMS QB Bob Night Room 1"      <- гость числится в ГЛАВНОМ звонке
  22582 мс  "… | IN SIDE ROOMS NG Night Guest GUEST Night Room 1 | QB Bob Night Room 1"
```
То есть переход гостя снова доехал не событием, а очередным перечитыванием состава —
в этом прогоне примерно через 15 с после его входа в комнату (точка отсчёта здесь
восстановлена по меткам гостя, а не измерена напрямую). Исходный замер давал ~42 с, третий
прогон — 36,6 с. Разброс подтверждает формулировку отчёта «до минуты», а не фиксированную
задержку; контраст с обычным участником (~0,5 с) сохраняется.

**Заодно:** когда ведущий сам находится в той же комнате, приход гостя в неё виден ему за
~1,5 с. То есть проблема именно в отображении «кто где» для того, кто смотрит из главного
звонка.

### BUG-4 — вторая половина утверждения («снять нельзя») перепроверена отдельно

Раньше в этом прогоне я перепроверил только выдачу. Теперь снятие:
```
диалог до:      ничего не отмечено
выдаю одну галочку Manage chat -> 204
сервер:         role=admin, on=[can_manage_chat, can_manage_meeting_settings]
диалог при повторном открытии: отмечено ДВЕ — Manage chat и Manage meeting settings
снимаю Manage meeting settings, состояние на момент отправки:
                Manage chat=true, Manage meeting settings=false
запрос уходит с полным телом из 13 полей -> 204
сервер после:   role=admin, on=[can_manage_chat, can_manage_meeting_settings]  <- вернулось
```
То есть оба утверждения находки («выдаётся само» и «снять нельзя») подтверждены на третьем
аккаунте, спустя часы, на той же сборке.

### Проверка цитат по веткам (после предупреждения соседа)

Клоны стоят не на том, что увидит читатель:
```
aloqa-backend   ветка dev   36 впереди / 20 позади origin/main
aloqa-frontend  ветка bugfix/ALK-3389-early-guest-landing   0 / 33 относительно задеплоенного коммита
```
**В опубликованном отчёте бэкендных цитат нет вообще** (`grep '\.go'` находит только
`fonts.googleapis.com`), а все фронтовые цитаты берутся как `git show "<deployed-sha>:path"`,
то есть от ветки клона не зависят. Ничего править не пришлось.

**Бэкендные ссылки в этом логе** (они пойдут в комментарии к ALK-3454 / ALK-3081, если их
попросят) проверены на **обеих** ветках и совпадают вплоть до номеров строк:
```
                                                         dev              origin/main
ws-gateway/internal/ws/client.go:243  «нет доступа к встрече»  есть            есть, та же строка
realtime-service/.../service/room_access.go:98  UserRoomAccess есть            есть, та же строка
realtime-service/.../revoke_channel_access.go:19,168  call.access_revoked есть есть, те же строки
CheckMeetingAccess / notifyRevoked                    11 / 3 файлов   11 / 3 файлов
```
**И отрицательный результат обратного энум-диффа тоже перепроверен на origin/main:** все
десять «call.*»-строк фронта, у которых не нашлось продюсера на `dev`, не находятся и на
`origin/main` — по нулю файлов на каждую. То есть вывод «это легаси-имена, а не мёртвые
ветки интерфейса» не зависит от ветки клона.

## Ночной блок: соак живого звонка

Сектор покрыт, находки перепроверены. Оставшееся окно использую под то, чего короткий прогон
не даёт: **держу живой звонок на четырёх участниках и периодически снимаю его состояние** —
таймер, состав, индикатор качества, состояния PeerConnection и счётчики пакетов. Ищу дрейф:
рассинхрон таймера, исчезновение участников из списка, деградацию медиа, зависшие соединения.

Инструмент — `snip/a-nb-health.mjs` (одна выборка: шапка, панель участников, `aria-label`
индикатора качества, число плиток, `connectionState/iceConnectionState` каждого PC и
`packetsReceived/packetsSent` по аудио).

```
БАЗА  23:16:39   звонок QA-A-NIGHT-1, таймер 22:04, "Excellent · 4ms"
                 Participants 4 in call: HOST | CO-HOST | 2 участника; плиток 4
                 PC: connected/connected + closed/closed (второй — остаток сессии Side Room)
                 аудио in: 1176 / 3654 / 46860   out: 5496 / 23799
```

### Проверка «свёрнутая вкладка / фоновая вкладка» — ИНКОНКЛЮЗИВНА, не считаю проверенной

Хотел проверить реалистичный сценарий: человек во время звонка переключается на другую
вкладку или сворачивает окно. Ни одним доступным мне способом не удалось получить у страницы
звонка `document.visibilityState = 'hidden'`:
```
открыл вторую вкладку и вывел её вперёд (bringToFront):  vis остался "visible"
свернул окно через CDP Browser.setWindowBounds {windowState:'minimized'}: vis остался "visible"
```
Медиа в обоих случаях шло без перерыва (счётчик входящих аудиопакетов рос монотонно), но
**это ничего не доказывает**: условие, которое я хотел создать, создано не было. Записываю
как непроверенное, а не как «работает».

**Как проверить правильно тому, кто вернётся:** нужен способ реально перевести вкладку в
скрытое состояние — например, прогон в окружении, где вкладку можно свернуть средствами ОС,
или ручная проверка человеком. Полезная деталь из CLAUDE.md: панель Claude Browser как раз
обычно `visibilityState: hidden` с троттлингом таймеров до 1/с — там условие получается
само, но тогда надо помнить про троттлинг при измерении времени.

Окно после эксперимента возвращено в maximized.

**Соак дополнен памятью.** `a-nb-health.mjs` теперь снимает ещё `performance.memory`
(used/total JS heap), число узлов DOM и число живых `RTCPeerConnection`. Утечка за длинный
звонок — это класс дефектов, который короткий прогон вообще не может увидеть, а окно у меня
есть.

```
БАЗА ПАМЯТИ  23:22:30
  alice (ведущий, окно рулит всем прогоном)  heap 196/218 MB  nodes 850  pcs 2
  bob                                        heap  52/59  MB  nodes 497  pcs 2
  carol                                      heap  42/47  MB  nodes 485  pcs 1
  dave (owner)                               heap 106/131 MB  nodes 525  pcs 1
таймер звонка идёт ровно: 22:04 в 23:16:39 -> 27:37 в 23:22:11 (333 с против 332 с настенных)
```
Смотрю на монотонный рост heap и nodes при неизменном составе звонка. `pcs 2` у двоих —
закрытое соединение от сессии Side Room, ждёт сборки мусора; если оно не исчезнет за часы,
это само по себе наблюдение.

### Verified working — длинные сообщения в чате звонка, и как я едва не написал находку про свой же инструмент

**Что сначала выглядело находкой.** Отправил в чат звонка сообщение на 647 символов —
в хранилище легло ровно 500, обрезанное посередине слова, никакого предупреждения. Похоже
на «молча режет длинное сообщение».

**Проверка убила находку.** Набрал те же 600 символов **клавиатурой**, без программной
подстановки значения:
```
набрано:        600 символов
в поле ввода:   500  (больше просто не принимается)
рядом подпись:  "500/500"   <- счётчик есть и он виден
кнопка Send:    активна
после отправки: сообщений об ошибке нет — и не нужно, лишнего не набралось
```
То есть лимит в 500 символов **энфорсится на вводе и показан пользователю**. Обрезание
в первом прогоне сделал я сам: заполнял `textarea` присваиванием `value`, минуя
контролируемый ввод React, — приложение о лишних символах не знало и отправило то, что
осталось после его собственной нормализации.

**Правило, которое из этого следует** (для лога, не для CLAUDE.md): если поле ввода
заполняется не клавиатурой, любой вывод про длину, валидацию и обрезание — про инструмент,
а не про продукт. Проверять такие вещи только набором.

**Заодно проверено и работает:** перенос длинных строк в сообщениях чата звонка. Ни в одном
из трёх случаев нет горизонтального переполнения (`scrollWidth == clientWidth` у всех
листовых узлов сообщения, ширина панели 360, ширина пузыря 327):
```
647 символов обычного текста           -> 327x249, переполнения нет
220 символов "X" без единого пробела   -> 327x149, переполнения нет
длинный URL с query-строкой            -> 327x129, переполнения нет
```

### Verified working — быстрое переключение микрофона не рассинхронизирует состояние

10 кликов по кнопке микрофона с интервалом 180 мс:
```
подпись после каждого клика: Unmute, Mute, Unmute, Mute, Unmute, Mute, Unmute, Mute, Unmute, Mute
через 6 с после последнего: подпись "Mute", track.enabled = true  (совпадает с чётным числом кликов)
у ведущего в панели пометки Muted у этого участника нет
```

### Verified working — строка участника со всеми состояниями сразу не ломается

Один и тот же участник: co-host + поднятая рука + «отошёл» + выключенная камера +
заглушённый микрофон, затем ещё и внутри Side Room с длинным названием.
```
без комнаты:  строка 335x44, переполнения нет, обрезанных листьев нет, за экран не уезжает
              метки: QA <имя> | Hand raised | Will be right back | Camera off | Muted | Participant actions
              бейдж CO-HOST на месте
в комнате:    строка 335x66, переполнения строки нет
              единственный «обрезанный» лист — название комнаты: span 244 > 171
```
Обрезание названия комнаты — **не дефект**: у элемента `overflow:hidden`,
`text-overflow:ellipsis`, `white-space:nowrap`, то есть многоточие показывается штатно.
Именно тот случай, когда эвристика «scrollWidth > clientWidth» ловит намеренный `truncate`;
проверять надо вычисленный стиль, а не только числа.
**Мелочь, не оформляю:** у обрезанного названия нет атрибута `title`, поэтому полное имя
комнаты не посмотреть наведением.

### Найдено, но НЕ моё по сектору: призрачные гости раздувают счёт участников, и `PARTICIPANT LIMIT` отказывает молча

**Симптом (экран Meeting settings — это сектор B).** Ведущий видит в панели
`4 participants · hosted by <имя>`, ставит лимит участников 5 — и получает отказ с текстом,
который противоречит тому же экрану: «лимит не может быть меньше числа людей, уже
находящихся в звонке».
```
PATCH /api/v1/meeting/{id} {"max_participants":5} -> 400
{"code":400,"key":"REALTIME_MEETING_LIMIT_BELOW_CURRENT",
 "message":"participant limit is below the current number of participants: лимит 5 при 6 участниках в звонке"}
```
**ИСПРАВЛЕНО ПОСЛЕ ПЕРЕПРОВЕРКИ.** Сначала я записал сюда «сообщения об ошибке не
появляется» — это неверно, и ошибка была моя, инструментальная. Соседняя сессия указала,
что «набор видимых текстов побайтово тот же» не различает «ошибки нет» и «ошибка попала
в слот, где та же фраза уже стояла». Проверка от чистого состояния:
```
ставлю валидный лимит 8 -> 200, узлов с фразой на экране: []   (панель чиста)
ставлю невалидный 3     -> 400
  +700 мс: <p role="alert" class="text-body-secondary text-red"> 327x48, видим,
           текст «The limit cannot be lower than the number of people already in the call.»
```
То есть **ошибка показывается — сразу, красным, с `role="alert"`**, и строка эта не
подсказка поля: в словаре она существует ровно один раз, как
`api.error.calls.meetingLimitBelowCurrent` (`en.ts:187-188`), и подключена к ключу
`REALTIME_MEETING_LIMIT_BELOW_CURRENT` через каталог (`errorPresentation.ts:511-514`,
обе цитаты — по задеплоенному коммиту).
**Почему я этого не увидел:** в первом прогоне наблюдатель печатал только первые шесть
элементов набора (`x['shown'][:6]`), а фраза в отсортированном наборе стояла дальше.
Третий случай за ночь из одного семейства — «смотрел не туда / смотрел не всё».

Порог найден точно: **лимит 5 → 400, лимит 6 → 200.** То есть сервер считает шесть.

**Причина — призраки в списке участников (это уже в моём секторе, но невидимо в интерфейсе).**
`GET /api/v1/meeting/{id}/participants` возвращает **6** строк: три пользователя, Carol и
**две строки `type:"guest"`, `name:"Night Guest"`** — это гости из моих сценариев, чьи окна
были уничтожены (контекст браузера закрыт) 25 и ~40 минут назад. Поля `left_at`/`status`
в ответе нет вовсе — эндпоинт отдаёт «активных», и мёртвые гости в них остаются.
Видимая панель участников при этом честно показывает 4.

**Смежное, но не то же самое:** **ALK-1835** (BLOCKED) «LiveKit
`participant_connection_aborted` оставляет ghost guest в joined» — там гость обрывается
**до** `participant_joined`. У меня гости полностью вошли, были впущены, побывали в Side Room,
и только потом их окно исчезло. Триггер другой, семейство то же.

**Почему не оформляю сам:** `PARTICIPANT LIMIT` живёт в `Meeting settings`, а это по
`SECTORS.md` сектор B. В обоих сегодняшних отчётах сектора B этой находки нет (проверил
заголовки всех двенадцати). Оставляю здесь целиком, чтобы её можно было забрать:
у неё есть точный порог, точный ключ ошибки и причина.
**Что стоит доизмерить тому, кто возьмёт:** мешает ли раздутый счёт впуску новых участников
при выставленном лимите (у меня замкнулось — лимит нельзя выставить, потому что счёт
раздут), и через сколько призраки исчезают сами (в моём соаке проверю ещё раз через часы).

**Заодно:** сообщение сервера двуязычное — `"participant limit is below the current number
of participants: лимит 5 при 6 участниках в звонке"`. До пользователя оно не доходит
(клиент показывает свою английскую подсказку), поэтому как i18n-дефект не считаю.

**Дедуп BUG-10 достроен по `BLOCKED`.** Среди 184 заблокированных багов устройств касаются
семь; ни один не про то, что выбор именованного микрофона в звонке не срабатывает:
ALK-1916 (кнопка `Settings` в лобби ничего не делает), ALK-1931 (контролы устройств не
восстанавливаются после удалённой смены прав), ALK-1934 (force mute держится на best-effort
WS), ALK-2129, ALK-2241, ALK-2005, ALK-1936. Совпадений нет.

### Соак получил главную задачу: живут ли призрачные гости часами

Сектор B независимо перепроверил половину про сообщение и пришёл к тому же, к чему пришёл я:
**ошибка показывается**, узел `<p role="alert" data-testid="meeting-settings-server-error">`,
и до неудачного сохранения такого узла в документе нет вовсе. Моё «сохранение молчит»
снято — см. исправление выше. Методический вывод у них и у меня один: **набор видимых
текстов надо снимать до действия, а не только после**; после — не отличает «ошибки нет»
от «ошибка неотличима от того, что уже стояло».

**Зато вторая половина стала серьёзнее.** Сектор B измерил, что лимит **действительно
закрывает вход**, отдельным экраном:
```
"Call is full | This call has reached its participant limit. Try again in a moment. | Back to workspace"
```
Этот экран доверяет тому же счёту, который у меня раздут мёртвыми гостями. То есть если
призрачные строки живут долго, **живых людей не пускают в звонок, где есть свободные места**.
Продемонстрировать это они не могут — у них в звонке призраков нет.

**Поэтому ключевой замер теперь мой.** Веду ряд:
```
23:39:40  /participants -> 6 строк: 4 пользователя + 2 гостя
          guest joined_at 18:04:42 и 18:08:06 (окна уничтожены ~18:06 и ~18:12 UTC)
          то есть призракам на этот момент ~95 и ~92 минуты
```
Дальше снимаю тот же запрос в каждом раунде соака. Если к 08:00 строки на месте, пара
находок складывается в блокировку входа с доказанным механизмом.

### Ответ на открытый вопрос ALK-3453 про камеру — измерено с контролем, в отчёт не идёт (тикет открыт)

ALK-3453 («При запрете микрофона/камеры настройкой звонка кнопка у участника молча гаснет»)
в разделе «Проверка» прямо просит: *«Проверить аналогичное поведение для CAMERA: Blocked
в Meeting settings — тишина, как для микрофона, или ложный banner, как в ALK-2896»*.
Проверил. **Тишина — и хуже, чем предполагает тикет: кнопка даже не гаснет.**

```
ведущий: Meeting settings -> CAMERA -> Blocked
         PATCH /meeting/{id}/settings {"camera_mode":"blocked_all"} -> 200
у участника камера была включена -> выключилась (кнопка стала "Turn camera on")

состояние кнопки камеры у участника при ЗАПРЕТЕ:
  aria-label "Turn camera on" | disabled=false | title "Toggle camera (⌘E)" | aria-pressed "true"
состояние той же кнопки при РАЗРЕШЕНИИ (камера выключена):
  aria-label "Turn camera on" | disabled=false | title "Toggle camera (⌘E)" | aria-pressed "true"
                              ^^^ различий нет вообще
участник нажимает кнопку при запрете (наблюдение 8 с, шаг 1 с):
  сетевых запросов: 0 | состояние кнопки не изменилось | видео-сендер не появился
  новых [role="alert"] / [role="status"] не появилось
ПОЛОЖИТЕЛЬНЫЙ КОНТРОЛЬ — тот же клик после возврата camera_mode=allowed_all:
  +1 с: "Turn camera off", aria-pressed false, видео-сендер fake_device_0:true
```

То есть: запрет камеры собранием делает контрол **мёртвым, но неотличимым от рабочего** —
та же подпись, та же подсказка «Toggle camera (⌘E)», не disabled, и ни звука в ответ на
нажатие. Клик при этом ничего не ломает и ничего не отправляет — энфорсмент на клиенте
соблюдается, не хватает только объяснения.

**Уточнение к тикету:** его «Ожидаемый результат» построен на предположении, что кнопка
становится неактивной («молча гаснет»). Для камеры это не так — она остаётся активной.
Значит и починка должна не только поправить подсказку, но и привести контрол в состояние,
по которому видно, что действие недоступно.

**`aria-pressed="true"` при подписи «Turn camera on»** — противоречие, но оно есть и в
разрешённом состоянии, то есть к запрету отношения не имеет; отдельной находкой не считаю.

### Аудит полноты: перечислены все интерактивные контролы поверхности звонка

Не «что я вспомнил проверить», а «что вообще есть на экране». Перебор всех видимых
`button / [role=switch] / [role=tab] / input / select / [role=slider] / a` внутри
`call-overlay-expanded`.

**У ведущего — 46 контролов.** Все, кроме перечисленных ниже, покрыты этим прогоном:
view toggle, PiP, fullscreen, Mute, Select microphone, Turn camera, Select camera,
Share screen, Raise hand, Will be right back, Send reaction, Record, Participants,
Call chat, Meeting settings, Add to call, Side Rooms, More, и внутри Meeting settings —
имя звонка, `Require approval`, лимит участников, качество видео, mute-on-join,
`In-call chat`, `Reactions`, режимы микрофона, камеры и демонстрации экрана, `Save`.
**Не покрыто и почему:** `Who can join → Anyone`, `Password protection`, `Meeting access
Public/Private` (панель сама пишет «cannot be changed during a call yet») и
`Who can see the guest link` — всё это по `SECTORS.md` сектор B (meeting settings,
guest links), не мой.

**У обычного участника — 18 контролов, покрыты все:** view toggle, PiP, fullscreen,
действия на плитке, панель участников, действия над участником, Mute, Select microphone
(это BUG-10), Turn camera, Select camera, `Request to share`, Raise hand,
Will be right back, Send reaction, Participants, Call chat, Side Rooms, Leave call.

Итог: **внутри звонка непроверенных контролов моего сектора не осталось.**

### Призраки — ТОЛЬКО гости: у обычного участника тот же обрыв убирается за секунды

Проверил очевидное возражение «может, так со всеми, и это вообще не про гостей».
Взял фикстурного **участника рабочего пространства** (`qa.dave`, в звонке не участвовал),
поднял ему сессию в свежем контексте браузера, впустил его в звонок, дал побыть внутри,
после чего контекст уничтожался вместе с процессом — **тот же самый обрыв**, что породил
призрачных гостей.

```
пока участник жив:
   панель ведущего:  "Participants 5 in call | HOST | CO-HOST | Bob | Carol | QD QA Dave"
   /participants:    7 строк (5 пользователей + 2 старых гостя-призрака)
контекст уничтожен, +20 с:
   панель ведущего:  "Participants 4 in call | HOST | CO-HOST | Bob | Carol"
   /participants:    6 строк (4 пользователя + те же 2 гостя)
                     строки QA Dave НЕТ — убралась сама
для сравнения, гости в том же ответе: joined_at 18:04:42 и 18:08:06,
   на момент замера (23:48) им ~104 и ~101 минуты, и они на месте
```

**Вывод, который стоит передать вместе с находкой:** уборка после обрыва работает —
но только для пользователей. Гостевая строка тот же обрыв переживает и продолжает
учитываться в лимите участников. Это сужает область починки до гостевой ветки
и снимает подозрение, что дело в моём способе убивать окно.

### Матрица призраков закрыта: течёт ровно одна клетка

Добавил четвёртый прогон — **гость, который вышел по-человечески**, кнопкой `Leave call`
с подтверждением:
```
гость вошёл, был впущен, побыл в звонке ("CG Clean Guest (you) GUEST" в составе)
жмёт Leave call -> подтверждение -> "You left the meeting. You can close this tab
                                     or use a new invite link to join again."
+15 с: /participants -> 6 строк, строки Clean Guest НЕТ
       (остались только два старых гостя-призрака)
```
Итоговая матрица, всё в одном звонке, одним и тем же способом обрыва:
```
                      способ ухода            строка в /participants
участник (member)     контекст уничтожен      исчезает за ≤20 с
гость                 нажал Leave call        исчезает
гость                 контекст уничтожен      живёт ≥104 минут и считается в лимите
```
Течёт ровно одна клетка: **гость + обрыв без выхода**. Ни «так со всеми», ни «так со всеми
гостями» не подтверждается.

**Деталь, которую стоит сказать заранее, чтобы её не изобрели как возражение:** участник,
на котором делался контроль (`qa.dave`), **в этом звонке до того не был ни разу** — то есть
его строку не могли «убрать заодно» как уже созданную и уничтоженную ранее. Он был создан,
впущен и уничтожен один раз, как и гости.

### Verified working — комнату может создать и обычный участник, а закрыть её может ведущий

```
обычный участник: панель Side Rooms -> New Side Room -> создать
  POST /meeting/{id}/breakout-rooms -> 201, затем автоматический join -> 200
  у него в панели: "<комната> Public 1 · Your room | Add people | Joined"
ведущий видит ту же комнату как "<комната> Public 1 · QA Carol’s room | Add people | Join"
и может её закрыть: подтверждение "Close <комната>? The room will close for everyone
inside, and they will return to the main call." -> POST …/close -> 204
создавший возвращается в главный звонок (в шапке снова главный звонок, без комнаты)
```
**Наблюдение, не дефект:** политики «кто может открывать комнаты» в панели `Meeting settings`
нет вовсе (перечислены все 46 контролов ведущего), то есть ограничить это ведущему нечем.
В бэкенде такая политика существует — на неё ссылаются открытые **ALK-2012**
(`who_can_open_rooms` теряется у запланированных встреч) и семейство ALK-1944/1845/1877
(`who_can_add_guests` не хранится). Поверхности у неё нет, а значит по правилу scope
из CLAUDE.md это не мой предмет: тестировать нечего.

**Соак переходит в «тихую» фазу с 23:55.** До этого момента звонок активно использовался
(комнаты, показы экрана, чат, переключения устройств), поэтому рост heap до 23:55
объясняется работой, а не утечкой. Дальше по звонку не кликаю; всё, что вырастет
при неизменном составе и без действий, — это уже поведение самого приложения.
```
на входе в тихую фазу (23:53:22):
  alice heap 216/242MB nodes 791 pcs 3 (1 connected + 2 closed)
  bob   heap  57/64 MB nodes 499 pcs 3 (1 connected + 2 closed)
  carol heap  48/54 MB nodes 500 pcs 2 (1 connected + 1 closed)
  dave  heap 109/118MB nodes 527 pcs 1
```
Отдельно смотрю на закрытые `RTCPeerConnection`: их число растёт с каждым входом в Side Room
и обратно. Если за ночь они не собираются сборщиком, это само по себе наблюдение.

### Матрица уточнена и воспроизводится по требованию: течёт «гость **в Side Room**», а не «гость»

Сектор B вытащил из зависшего прогона четвёртую клетку — гость, полностью вошедший в
**главный** звонок, убитый крашем рендерера, строки не оставил. У них не было таймингов,
у меня есть. Проверил обе клетки заново, подряд, в одном звонке.

```
(1) ГОСТЬ БЕЗ КОМНАТЫ. Вошёл по ссылке, впущен, в составе виден
    ("Participants 5 in call | … | NG NoRoom Guest GUEST | …"), в комнату НЕ заходил.
    Контекст уничтожен в 00:09:56.
      00:10:05 (+9 с)  /participants -> n=6, строки NoRoom Guest НЕТ
      далее 5 замеров до 00:16:23 — её нет
    -> убирается практически мгновенно

(2) ГОСТЬ В КОМНАТЕ. Тот же путь + вошёл в Side Room (в шапке "Repro Room 1:08").
    Контекст уничтожен около 00:18:2x.
      00:18:41  n=7, есть 'Repro Guest@19:17:41'
      00:19:51  есть
      00:21:02  есть
      00:22:12  есть
    -> строка живёт; два старых призрака того же вида в том же ответе живут с 18:04 и 18:08
```

**Итоговая матрица (всё в одном звонке, один способ обрыва):**
```
                                     строка в /participants
участник, без комнаты, обрыв         исчезает за ≤20 с
гость,    без комнаты, Leave call    исчезает
гость,    без комнаты, обрыв         исчезает за ≤9 с
гость,    В КОМНАТЕ,   обрыв         НЕ исчезает (два случая ≥2 ч, третий воспроизведён)
```
**Формулировка находки меняется:** течёт не «гость при обрыве», а **«гость, находившийся
в Side Room в момент обрыва»**. Это заметно уже область починки — и это объясняет, почему
на такое не натыкаются в обычной работе: чтобы получить призрака, гостю мало закрыть ноутбук,
надо закрыть его **из комнаты**.

Заслуга наблюдения — сектора B; у меня были тайминги и возможность воспроизвести.

### Лид к механизму призраков: уборка комнаты работает, а строка встречи не закрывается

Читал исходник (только чтение, приложение не трогал) — и нашёл, где именно расходятся
два уровня. Все имена проверены **и на `dev`, и на `origin/main`**, значения совпадают.

**Как это устроено по коду:**
- вход в Side Room — это отдельная LiveKit-комната, поэтому LiveKit шлёт
  `participant_left` **по главной комнате**. Сервис специально не считает это выходом из
  встречи: `BreakoutParticipantRepository.IsActiveInBreakout` — комментарий в коде прямо
  говорит, что переход в breakout «сам по себе вызывает отключение от main room и этот
  вебхук, что не означает выход из встречи»;
- обрыв соединения **с комнатой** обрабатывает `MarkDisconnected`: ставит `disconnected_at`
  и **намеренно не закрывает** строку размещения, пока не истечёт окно возврата;
- окно закрывает джоба `CloseExpiredBreakoutDisconnects` → `CloseExpiredDisconnects(grace)`;
  дефолт `defaultBreakoutReconnectGrace = 60 * time.Second` (одинаково в `config/env` и
  в сервисе, на обеих ветках).

**Измерение, которое различает две версии («джоба не работает» против «джоба работает, но
чинит не тот уровень»):**
```
01:18:53, спустя ~час после обрыва Repro Guest:
  GET /breakout-rooms -> "Repro Room" status=waiting  n=0   <- размещение ЗАКРЫТО,
                                                               комната опустела и переведена
                                                               в waiting — ровно то, что
                                                               описано у CloseExpiredBreakoutDisconnects
  GET /participants    -> Repro Guest ВСЁ ЕЩЁ ЕСТЬ
```
То есть джоба на стенде работает и своё дело делает. Не закрывается **строка уровня
встречи**: исходный `participant_left` по главной комнате был подавлен (участник был
в breakout), а когда размещение позже истекло, повторно обработать тот подавленный выход
уже нечем.

**Это лид, а не подтверждённая причина.** Я не читал `MarkParticipantLeft` целиком и не
проверял, есть ли у джобы второй шаг для уровня встречи. Но лид объясняет ровно то, что
показывает матрица: без комнаты выход по главной комнате обрабатывается и строка исчезает
за секунды; с комнатой он подавлен — и больше не возвращается.

### Поправка к матрице призраков: клетка «чистый выход» была confounded, и вот почему это неважно

Соседняя сессия предупредила, что `Leave call` — двухшаговое действие (кнопка, потом диалог),
и что клик по одной кнопке звонок не покидает. Проверил свою клетку: в ней подтверждение
нажималось (`call-leave-confirm-submit`), и экран после этого показывал
«You left the meeting…», то есть выход состоялся. **Но клетка всё равно ничего не
доказывала:** тот гость **не заходил в комнату**, и его строка обязана была исчезнуть и
без всякого выхода — ровно это показывает клетка «гость без комнаты + обрыв» (≤9 с).
Убираю её из доказательной части.

**Матрица держится на двух клетках, различающихся ровно одним:**
```
гость, БЕЗ комнаты, обрыв   -> строка исчезает за ≤9 с
гость, В КОМНАТЕ,  обрыв   -> строка не исчезает (три случая, старшему ≥3 ч)
```
плюс контроль «участник без комнаты + обрыв → ≤20 с», снимающий «так со всеми».

**Клетку «чистый выход из комнаты» построить не удалось — и причина сама по себе факт:
изнутри Side Room выйти из звонка нечем.** Перечислены все 23 контрола участника,
находящегося в комнате:
```
Main call: <звонок> | Main call audio, 30% | Side Room <комната> | Leave Side Room |
Spotlight view | Minimize to picture-in-picture | Enter fullscreen | Participants |
Call chat | Side Rooms | New Side Room | Joined | Mute | Select microphone |
Turn camera | Select camera | Request to share | Raise hand | Will be right back |
Send reaction | Participant actions | Close Side Rooms panel | Leave room
```
`Leave call` среди них **нет** — есть только `Leave Side Room` / `Leave room`. У того же
участника в главном звонке `Leave call` есть. То есть выход из встречи из комнаты
двухшаговый: сначала вернись в главный звонок, потом выйди.

**Почему это стоит приложить к находке про призраков:** человек, сидящий в комнате и
желающий уйти, не находит «выйти из звонка» — и закрывает вкладку. Это ровно тот путь,
который оставляет призрака и съедает место в лимите. Отсутствие прямого выхода делает
дефектный путь **более вероятным**, чем кажется.

**Четвёртый призрак — непреднамеренный и потому особенно чистый.** Прогон, в котором я
пытался построить клетку «чистый выход из комнаты», провалился ровно потому, что `Leave call`
изнутри комнаты нет: кнопка не нашлась (`leaveBtn: 0`), гость остался в комнате, а контекст
затем был уничтожен. Итог — ещё одна строка-призрак (`joined_at 20:29:08`), появившаяся
без всякого умысла и по тому же пути. На 01:41 в `/participants` восемь строк: четыре
живых участника и четыре гостя-призрака (18:04:42, 18:08:06, 19:17:41, 20:29:08).

### Соак: утечки памяти не видно, а рост у одного окна объясняется моими же опросами

Сравнение за 2 ч 14 мин «тихой» фазы (23:53 → 02:07), звонок всё это время идёт,
состав не меняется:
```
             23:53      02:07     дельта
alice        216 MB     240 MB    +24    <- окно, которое я всё это время опрашивал
bob           57 MB      61 MB     +4
carol         48 MB      50 MB     +2
dave         109 MB     110 MB     +1    <- окно, которого я не трогал вовсе
nodes у всех четверых                    без изменений (±2)
tiles=4, все PC connected, качество Excellent — стабильно у всех
```
Единственное окно с заметным ростом — то, к которому я каждые ~3 минуты хожу снимать
`getStats()` и обходить DOM. Окно, которое просто стоит в звонке, за два с лишним часа
выросло на мегабайт. **Вывод: утечки в идущем звонке не видно; рост у alice — цена
измерения, а не поведение продукта.**

Чтобы это не осталось рассуждением, дальше опрашиваю **dave**, а alice не трогаю вовсе —
если её heap перестанет расти, гипотеза подтверждена измерением, а не аргументом.

### Общие хелперы правились по ходу прогона — проверил, мои измерения не затронуты

Соседняя сессия сообщила, что редактировала `snip/lib.mjs` и `snip/api.mjs` внутри моего окна
(mtime 19:14 и 18:38), хотя CLAUDE.md называет их read-only на время сессии. Проверил сам,
не полагаясь на описание:
```
git diff --stat scripts/callrig/snip/lib.mjs -> 238 insertions(+), 0 deletions
тела трёх экспортов, от которых зависят мои замеры, сверены с HEAD побайтово:
  HOOK       identical  (874 байта)   <- это window.__pcs, на нём держатся все RTC-замеры
  RTC_STATS  identical  (939 байт)    <- outbound/inbound, framesEncoded и т.п.
  UI_STATE   тело не изменилось; «разница» — комментарий, дописанный ПОСЛЕ константы
             (мой срез до следующего `export const` захватывал новый блок комментариев)
```
Из моих снippet'ов `UI_STATE` использует только `a-in-join.mjs`, и только чтобы напечатать
список кнопок после входа — доказательной нагрузки на нём нет. `api.mjs` мои сниппеты
не импортируют вовсе.

**Вывод: переделывать нечего.** Записываю не ради результата, а ради практики: если общий
файл менялся во время прогона, проверять надо не «обещали, что аддитивно», а конкретно те
экспорты, на которых стоят твои выводы, — и сверять с гитом, а не глазами.

### Утечки нет — подтверждено переносом опроса на другое окно

Гипотезу «рост heap — это цена моих замеров, а не поведение приложения» проверил, поменяв
местами роли: с 02:07 опрашиваю `dave` каждые ~3 минуты, `alice` не трогаю (кроме двух
общих раундов).
```
                     02:07      03:00      за 53 минуты
alice (не трогаю)    240 MB     242 MB     +2      <- при этом её опросили дважды
dave  (опрашиваю)    110 MB     119 MB     +9
```
Роли поменялись — и вместе с ними поменялось, чей heap растёт. Это ровно тот результат,
который отличает «продукт течёт» от «инструмент создаёт сигнал, который измеряет».
**Через 2 ч 36 мин картина только чётче:**
```
                     02:07      04:43      за 2 ч 36 мин
alice (не трогаю)    240 MB     241 MB     +1
dave  (опрашиваю)    110 MB     136 MB     +26
```
То есть окно, стоящее в звонке без вмешательства, за два с половиной часа не выросло вовсе.

**Вывод:** за 4 часа непрерывного звонка на четырёх участниках утечки памяти не видно;
число узлов DOM не растёт (850 / 514 / 515 / 528 — ±2 за всю ночь), все PeerConnection
остаются `connected`, качество `Excellent`, состав не меняется, таймер идёт ровно.
Единственное, что накапливается, — закрытые `RTCPeerConnection` от входов в Side Room
(у alice 4, у bob 4, у carol 2, у dave 1); heap при этом стоит, то есть они дёшевы.

**Заодно это закрывает возражение, которого никто не выдвигал, но которое напрашивалось:**
призрачные строки — не симптом общей деградации длинного звонка. Звонок здоров;
течёт именно гостевая ветка.

**Соак, промежуточный итог на 04:43.** Звонок идёт 5 ч 49 мин без единого сбоя: состав
4 участника, плиток 4, все PeerConnection `connected`, качество `Excellent`, таймер
совпадает с настенным временем. Сборка стенда всё это время `v0.61.0-rc.5-c4b5386b4a3a`
(проверяется в каждом общем раунде). Призрачных строк по-прежнему четыре: 18:04:42,
18:08:06, 19:17:41, 20:29:08 — старшей на этот момент **10 ч 38 мин**.

## Итог соака (07:53, звонок идёт 8 ч 59 мин)

**Главный ответ: призрачные строки не истекают.** Замер `GET /meeting/{id}/participants`
на 07:53 (+05) / 02:53 UTC:
```
всего строк 8:  4 живых участника + 4 гостя-призрака
  Night Guest      joined 18:04:42 UTC   в списке 8 ч 49 мин
  Night Guest      joined 18:08:06 UTC   в списке 8 ч 45 мин
  Repro Guest      joined 19:17:41 UTC   в списке 7 ч 36 мин
  RoomLeave Guest  joined 20:29:08 UTC   в списке 6 ч 24 мин
```
(обрывы происходили через 1-3 минуты после входа, так что возраст самих призраков меньше
на эти минуты — на существо ответа это не влияет.)

Окно возврата в коде — `defaultBreakoutReconnectGrace = 60 * time.Second`, размещения
в комнатах давно закрыты (комнаты пусты и переведены в `waiting`), а строки уровня встречи
живут девятый час. **Место в лимите, съеденное таким гостем, не возвращается — оно потеряно
на всё время звонка.**

**Здоровье звонка за 9 часов — без единого замечания:**
```
состав 4 участника, плиток 4, все активные PeerConnection connected,
качество Excellent у всех четверых, таймер совпадает с настенным временем,
узлов DOM без роста (850 / 512 / 513 / 525, ±3 за девять часов),
сборка стенда неизменна: v0.61.0-rc.5-c4b5386b4a3a (проверялась каждый раунд)
```
Утечки памяти нет — доказано подменой роли опрашиваемого окна:
```
alice, не трогаю          240 -> 242 MB   за 4 ч 19 мин
dave,  опрос каждые 3 мин 110 -> 167 MB   за 5 ч 46 мин
```
Растёт heap ровно того окна, к которому ходит инструмент; поменял окна — поменялось, чей
heap растёт. Это сильнее, чем «у простаивающего не растёт»: простой сам по себе совместим
с утечкой, которой нужна активность, а подмена ролей такую версию исключает.

## Уборка и состояние на выходе (07:57)

- Локальный сервер предпросмотра отчёта (`python3 -m http.server 8899`) остановлен,
  каталог `scratchpad/preview` удалён. Больше ничего постороннего сессия не поднимала.
- Фикстуры лейна A проверены после всех экспериментов: `seed/seed.sh --verify --lanes A`
  → **All fixtures present and correct** (в том числе `#qa-general` снова 6 участников —
  двоих я временно удалял, проверяя `call.access_revoked`).
- Звонок `QA-A-NIGHT-1` намеренно **оставлен живым** вместе с четырьмя браузерами лейна A:
  в нём висят четыре призрачные строки гостей, и это единственное место, где их сейчас
  можно посмотреть живьём. Если они больше не нужны — звонок завершается кнопкой
  `End for everyone` у ведущего.
- Что осталось на стенде из моего: четыре закрытые Side Room в этом звонке
  (`Night Room 1`, `Night Room With A Deliberately Long Name`, `Carol Room`, `Repro Room`,
  последняя в `waiting`), сообщения в чате звонка и несколько завершённых звонков
  `QA-A-EVE-*` / `QA-A-NIGHT-*` в истории. Всё внутри одноразового QA-воркспейса.
- Файлы сессии: лог `logs/AIRION-QA-2026-08-26-A-calls-inside.md`, отчёт
  `reports/aloqa-calls-inside-qa-2026-08-26-A.html` (опубликован, строка в
  `reports/README.md` дописана и расширена ночным блоком), снippet'ы `scripts/callrig/snip/a-nb-*.mjs`
  (241 файл, все с префиксом лейна, чужих не трогал). `CLAUDE.md` я не менял.

---

## Post-run note — 2026-08-28 12:14 +05: опубликованный артефакт разошёлся с файлом

Пришло уведомление `artifact-changed` по адресу отчёта — версия `1787890205-1808`.
Перечитал артефакт и сравнил с файлом на диске (`reports/aloqa-calls-inside-qa-2026-08-26-A.html`,
рабочее дерево = HEAD, `git status` чистый).

Результат сравнения (тело от `<title>` до `</body>`):

```
локально  49368 симв.  sha1 98e71b416835   6 блоков class="block repro"
артефакт  48037 симв.  sha1 ade0787e9628   0 блоков class="block repro"
```

- Все девять `<h2>` совпадают **позиционно и посимвольно** — подмены статьи не было.
- Единственное расхождение: из опубликованной версии удалены все шесть блоков
  «Воспроизведение» (`a-blocked-costale`, `a-mic-select`, `a-side-askreturn`,
  `a-revoke-share`, `a-side-emptyroom`, `a-side-reaction`). Остальной текст,
  измерения и таблица идентичны.
- Блоки добавил не я: в моей ревизии `5612ef2d` их 0, их принёс более поздний прогон
  `d66db08` («Lanes A and B: reverify 21 findings on rc-6, 18 repro snippets»),
  затем `e1a4266` поправил строки сводной таблицы. Публикация сделана поверх
  текущего файла с вырезанными блоками.
- Практическое следствие: Review/`bench.py` читают **локальный** файл, поэтому они
  не затронуты — `check_repro.py` по-прежнему даёт 6/9 для этого отчёта. Теряет
  только человек, открывающий ссылку: у него нет имени сниппета.
- Ничего не переопубликовывал: чужая версия свежее моей копии, и перезапись
  затёрла бы её. Восстановление — решение пользователя.

## Заведено в Jira — 2026-08-28 12:2x +05

**ALK-3756** — https://ttbrm.atlassian.net/browse/ALK-3756
`[FE-WEB][CALLS] Список заблокированных участников не обновляется у второго модератора: бан и разбан видит только тот, кто их сделал`
Bug / Backlog / Priority **High** / label `frontend`. Соответствует BUG-2 в отчёте.
Заведено по прямой просьбе пользователя; остальные восемь находок не заводились.

Дедуп перед заведением (`jira_cache.py sync` → +28 тикетов, 184 открытых бага прочитано):
- **ALK-3710** (Backlog, Low) «Пустой блок BLOCKED (0)» — та же секция панели. В его
  «Проверке» есть строка «обновление в реальном времени при block / unblock — секция
  появляется / исчезает без reload», но весь тикет про вёрстку и порядок секций, и его
  критерии нигде не упоминают **второго** наблюдателя. Разработчик, закрывающий 3710 по
  своему чеклисту, проверит собственный клиент (где всё работает) и не тронет
  инвалидацию ключа. По правилу «adjacent ticket owns the states its acceptance criteria
  enumerate» — не дубль.
- **ALK-3721** (Backlog) «Пересчёт прав и ban-статуса» — backend, про 403 и залипшие
  override. Здесь backend отвечает `204` корректно, reload чинит экран: дефект
  фронтовый. Не дубль.
- **ALK-3712** (Backlog, Low) — логи в Call Details, другая поверхность.
- Все четыре тикета, где в теле встречается `/bans` (ALK-1485, 2453, 3448, 3493), — в
  статусе `TESTING`, то есть закрыты.

Причина перепроверена на **текущей** сборке перед заведением: staging уехал на
`v0-61-0-rc-7-10a407a46be1` (находка измерена на rc.5 `c4b5386b4a3a`). Полное перечисление
`git grep -n participantBans 10a407a46be1 -- packages apps` на rc.7 даёт те же две
инвалидации внутри мутаций (`mutations.ts:3855`, `:3885`, сдвиг на строку), единственное
чтение `hooks.ts:1982`, и ни одного realtime-обработчика. В тикете процитирован rc.7 —
разработчик проверяет по нему, а не по сборке, на которой измеряли.

**ALK-3759** — https://ttbrm.atlassian.net/browse/ALK-3759
`[FE-WEB][CALLS][SIDE ROOMS] Только что созданная пустая Side Room недоступна как назначение в «Move to Side Room»`
Bug / Backlog / Priority **Medium** (как в отчёте) / label `frontend`. Соответствует BUG-7.

Дедуп: две открытые соседние задачи прочитаны целиком, обе — не дубли.
- **ALK-2939** (In Progress) «Нельзя пригласить дополнительных участников в уже созданный
  Side Room»: предусловие — комната **населена**, ведущий **внутри** неё, отсутствует
  действие `Invite to Side Room`; его root cause — фильтрация списка участников в
  `useParticipantsListPanel.ts:326-357`. У меня комната **пустая**, ведущий в главной
  комнате, отсутствует пункт `Move to Room X`. Другое предусловие, другой экран, другой
  контрол.
- **ALK-3481 / ALK-2734** (In Progress) — обратный случай (комната, где участник уже есть,
  остаётся в списке). Виден в моём же измерении, но чинится там. Третью строку «Проверки»
  из отчёта в тикет не переносил, чтобы не присваивать их работу; заменил на
  non-regression по кнопке Switch.

Причина доведена до **подтверждённой** уже при заведении (в отчёте её не было):
`useParticipantsListPanel.ts:510-516` строит список назначений как
`.filter((room) => room.status === 'active')`, а свежесозданная пустая комната приходит
`status=waiting`. Тот же массив гейтит и заголовок раздела —
`useParticipantRowMenu.ts:227-228` (`activeBreakoutRooms.length > 0`), чем объясняется
второе наблюдение: пропадает не пункт, а весь блок MOVE TO SIDE ROOM. Рендер —
`ParticipantRow.tsx:435`. Все три пути проверены на задеплоенном `10a407a46be1`.

**ALK-3760** — https://ttbrm.atlassian.net/browse/ALK-3760
`[FE-WEB][CALLS][SIDE ROOMS] Реакция, отправленная внутри Side Room, показывается всем в главном звонке`
Bug / Backlog / Priority **Medium** (как в отчёте) / label `frontend`. Соответствует BUG-9.

Дедуп: среди открытых багов реакций нет вообще — все Bug'и по реакциям в `TESTING`
(3405, 3213, 2719, 2698, 2553, 2938, 2457, 2516, 2442), то есть закрыты.

Найдено соседнее **ALK-3327** (Task, Backlog) «Live-реакции вернуть на WS-шлюз». Это не
дубль по правилу дедупа (правило про issuetype = Bug), но по существу он планово чинит
именно этот баг: в его сравнительной таблице строка «комната» после переноса на шлюз
читается «сервер сам берёт из размещения; реакция из side room уходит только в неё».
Заведено всё равно и с явной ссылкой на него — дефект наблюдаем на текущей сборке,
а тикет несёт матрицу по всем направлениям и точку утечки, которых в ALK-3327 нет.

**Расхождение с ALK-3327, вынесено в тикет отдельной строкой.** Он описывает текущий
путь как «data-канал LiveKit» со «scope в поле у клиента». Мой перехват показывает не
неверный scope, а публикацию в **чужой сокет**: отправитель внутри комнаты держит
sock 2 (главный звонок) и sock 3 (комната), и кадр с `reaction` уходит на sock 2,
пока sock 3 живой (40 in / 27 out за то же окно). Формулировку в тикете держал на том,
что измерено — «публикует в сокет главного звонка», — не утверждая, какой это транспорт
в терминах LiveKit.

Скраб при переносе в тикет: фрагменты LiveKit-токенов в блоке замера заменены на
`<token главного звонка>` / `<token side room>`, uuid реакции — на `<reaction id>`.
Смысл блока не изменился: он доказывает, что сокета два и что они разные.
