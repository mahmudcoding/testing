# AIRION QA — 2026-08-30 — lane A — sector K (Calls: getting in)

**Sector K on lane A** (Calls map, `SECTORS-CALLS.md`). Timebox: 12:46 → 18:00 +05.
Build: `data-dpl-id="v0-61-0-rc-7-10a407a46be1"` → tag `v0.61.0-rc.7`, frontend commit `10a407a46be1`.
Fixtures: `seed.sh --verify --lanes A` → all present and correct.
Browsers: alice 9222, bob 9223, carol 9224.

## Current state

- Setup done. Deployed build is **rc.7**; the last full calls pass
  (`logs/AIRION-QA-2026-08-26-B-calls-around.md`, report `aloqa-calls-around-qa-2026-08-26-B.html`)
  ran on **rc.5 `c4b5386b4a3a`** — 105 commits behind. That report is my closest dedup target
  and it covers a lot of sector K already (password gate, participant limit, call waiting,
  waiting-room rejoin, guest dead link, no-answer ringing).
**ПРОГОН ЗАВЕРШЁН** — отчёт опубликован, см. «Итог прогона» в конце файла.

- Plan: go where rc.5 could not have looked, then where the rc.5 pass was thin.
  1. **Entry gates changed by this deploy** — `ALK-3490` "Who can join" (new
     `MeetingWhoCanJoinControl.tsx`, commit `8baa0166f`) and `ALK-3489` invite re-entry fence
     (commit `73b673045`, new `useActiveCallPresenceMark.ts`). Panel is sector N's; the **effect
     at the door is mine**.
  2. **Lobby / device check / lobby settings / recording-consent notice** — the rc.5 log has
     almost nothing on the lobby itself.
  3. Waiting room + approval states not covered by rc.5.
  4. Guest arrival and guest limits.

## Findings

### Verified working — валидация пустого пароля в диалоге создания звонка

`Start now` → диалог `calls-start-dialog-body`. «Who can join» = **Password**, поле пароля пустое,
кнопка `Start call` остаётся enabled. Нажатие: **ни одного запроса не ушло**, появилась надпись
`Enter a password for password entry.`, диалог остался открыт. Звонок с режимом «пароль» и без
пароля создать нельзя. Замер: `snip/a-k30-pw-empty.mjs` → `api: []`, `dlgOpen: true`.

**Форма создания:** `Call name` (optional), `Meeting access` = Public/Private,
`Who can join` = **Wait for admission / Password / Open** (по умолчанию — Wait for admission),
`Who can see the guest link` = Host only / Everyone.
На проводе три режима сводятся к двум полям: `POST /api/v1/meeting` шлёт `password` и
`requires_approval`, поля `entry_mode` нет.

### Verified working — парольный барьер, неверный пароль

Звонок `QA K30 pwgate` `V4P256SVJ6M0XXC`: `POST /api/v1/meeting` →
`{"workspace_id":"…","name":"QA K30 pwgate","is_private":false,"password":"…","max_participants":0,"requires_approval":false}`
→ 200, `password_protected: true`.

**Порядок дверей:** приглашённый сначала попадает в **лобби** (`lobby-page`, device check),
и только после `Join` — в парольный барьер (`call-password-gate`).

Неверный пароль: `POST /api/v1/meeting/<id>/join {"password":"WrongPass1"}` → **400**
`{"code":400,"key":"REALTIME_PASSWORD_INVALID","message":"meeting password is invalid","trace_id":"…"}`.
На экране через **442 мс**: `Incorrect password. Try again.` Поле не очищается, кнопка снова
активна. Опрос 39 мс → 8994 мс, состояние стабильно. Барьер работает.

**Дедуп-заметка:** отчёт rc.5 содержит «ведущий убрал пароль — стоящий у барьера остаётся
перед ним». Это другое поведение, не пересекается.

### BUG-1 — СНЯТА С ПУБЛИКАЦИИ (дедуп + специфицированное поведение). Измерения ниже верны и остаются

**Что сделано.** Alice создала звонок `QA K30 pwgate` и включила запись:
`POST /api/v1/meeting/<id>/recording/start {"access_scope":"all"}` → **201**
`{"id":"RC…","meeting_id":"V4P…","status":"recording","started_by":"U4QAALICE000001","started_at":"2026-08-30T07:54:29Z",…}`.
Carol (в звонке не состоит) открывает ссылку на звонок и попадает в **лобби**.

**Замер лобби — три независимых инструмента, у каждого положительный контроль.**
`snip/a-k30-lobby-recheck.mjs`, аккаунт Carol, `screen: "lobby"`:

```
byText   (все видимые элементы, чей textContent матчит /record/i, от меньшего к большему):
         [ {tag:"BODY", len:340461}, {tag:"HTML", len:358971} ]   ← только корневые узлы,
         ни одного отрисованного элемента; совпадение даёт текст скриптов в разметке
byAttr   (data-testid | aria-label | title матчит /record|consent/i):  []
docText  document.body.innerText, 382 символа целиком:
         docHasRecord: false,  docHasConsent: false
checkboxes: []

положительный контроль тех же трёх инструментов:
         controlByText ("Ready to join"): 11 элементов
         controlDocHas ("Ready to join"): true
```

**Тот же byAttr на экране звонка находит индикатор** — `call-recording-badge`,
`<span … role="status">` 105×26 в точке (169,14), `innerText: "Recording"`. Инструмент рабочий.

**Полный обход двери с опросом ~300 мс, начиная ДО первого клика** (`snip/a-k30-joinwatch.mjs`):

```
t=    0 мс  screen=lobby     rec=[]                              mic data-state="on"
t=  393 мс  screen=password  rec=[]
t= 4159 мс  screen=other     rec=[]
t= 4463 мс  screen=in-call   rec=["This call is being recorded"]  ← первое упоминание
t=13647 мс  screen=in-call   rec=[]   (сообщение ушло; постоянный бейдж остаётся)
```

Первое упоминание записи приходит **в той же выборке, где экран стал `in-call`** — то есть
только после входа. В лобби микрофон по умолчанию включён (`data-state="on"`), так что человек
входит в записываемый звонок с живым микрофоном.

**Вторая предварительная поверхность тоже молчит.** Карточка `Live now` в хабе
(`snip/a-k30-hub-live.mjs`): `Live now / 1 / LIVE / running 7 min / QA K30 pwgate /
2 participants · hosted by QA Alice / QA QB / Join`. Поиск /record/i по всем видимым
текстам хаба — `[]`.

**Граница (измеренная).** Лобби **запрашивает** настройки встречи и получает отказ:

```
Carol, стоя в лобби:   GET /api/v1/meeting/V4P256SVJ6M0XXC/settings
  → 403 {"code":403,"key":"REALTIME_ACCESS_DENIED","message":"access denied","trace_id":"…"}

Bob, уже в звонке:     GET /api/v1/meeting/V4P256SVJ6M0XXC/settings
  → 200 {"meeting_id":"V4P…","mic_mode":"allowed_all",…,"recording_enabled":true,…}
```

То есть значение существует и отдаётся участнику, но недоступно ровно тому, кому оно нужно —
человеку у двери. Отдельно: `GET /api/v1/meeting/<id>` лобби получает **200**, и в его теле
`"recording_enabled":true` уже есть.

**Не механизм, а факт из исходника (проверяемый одной командой).** На развёрнутом sha компонент
уведомления существует, но не используется нигде, кроме собственного файла:
`git grep -n "CallLobbyRecordingConsentNotice" 10a407a46be1 -- apps packages` → только
`apps/web/src/features/calls/CallLobbyRecordingConsentNotice.tsx`. Положительный контроль того же
grep: `LobbyPage` находится в `CallDeepLinkLobby.tsx`. Значит починка одного 403 экрана не изменит —
это важно сказать разработчику, иначе он поправит доступ и не увидит разницы.

**Осторожность про поле.** `recording_enabled` — флаг «запись разрешена», а не «идёт сейчас»:
он был `true` в ответе на создание звонка (07:51:01), за три минуты до старта записи (07:54:29).
Поэтому находка сформулирована как «до входа не показано ничего», а не как «поле не прочитано».

**Дедуп.** В отчёте rc.5 (`aloqa-calls-around-qa-2026-08-26-B.html`, 12 находок) записи касаются
две — «Остановка записи никогда не отмечается в журнале звонка» и «приватная запись не видна
рядовому участнику». Ни одна не про предварительное уведомление. Проверить по открытым ALK-багам.

**Инструментальный урок (в PITFALLS-кандидаты).** Первый замер лобби перечислял только
**листовые** узлы (`children.length === 0`) — а внутрикольцевой бейдж это
`<span><svg/>Recording</span>`, у которого есть ребёнок. Такой же бейдж в лобби мой первый
инструмент бы не увидел. Перемерено тремя инструментами без этого ограничения.

### Verified working — очередь на одобрение целиком: стук, отказ, повторная заявка, впуск

Звонок `QA K30 admit` `V4P25N4Q2AV1V5U`, создан с `Wait for admission`:
`POST /api/v1/meeting {…,"max_participants":0,"requires_approval":true}` → 200,
`requires_approval: true`, `password_protected: false`.

**Стук.** Bob: лобби → `Join` → `POST /meeting/<id>/join` → **202**
`{"status":"waiting","participant_id":"N4P25NRA1V6N9B3"}`. Экран
`call-deep-link-waiting-room`: «Waiting for host approval / You can join after a host admits you
from the waiting room», кнопки `Cancel request` и `Back to workspace`.

**Ведущему.** Тост `QA Bob is waiting to join. [Review]` + счётчик
`call-controls-waiting-count`. `GET /meeting/<id>/waiting` → 200
`{"participants":[{"participant_id":"N4P25NRA1V6N9B3","user_id":"U4QABOB00000001","name":"QA Bob",…,"waited_since":"2026-08-30T08:04:12Z","participant_type":"user"}]}`.
`Review` открывает `waiting-room-list` со строкой `QA Bob` и кнопками
`aria-label="Admit QA Bob"` / `aria-label="Deny QA Bob"`.

**Тост не дублируется.** Уведомление матчится и `[data-sonner-toast]`, и `[role=status]` — это
один элемент: ключ «текст + округлённый размер» даёт **одну** запись
`QA Bob is waiting to join.\n\nReview|352x77@782,825`. Ловушка CLAUDE.md подтверждена как ловушка,
не как находка. (Актуально после `ALK-3674` в этой сборке — схлопывание повторных тостов.)

**Отказ** (`snip/a-k30-deny-watch.mjs`, опрос с ДО нажатия, 42 выборки):
```
t=   0 мс  screen=waiting  «Waiting for host approval»               [Cancel request, Back to workspace]
t= 517 мс  screen=waiting  + тост «Admission denied — The host declined your request to join this call.» (352x101)
t=3425 мс  screen=other    «Request declined …»                      [Request to join again, Back to workspace, Dismiss]
t=9191 мс  screen=other    тост ушёл, страница осталась              [Request to join again, Back to workspace]
```
Отказанному **участнику** дают и объяснение, и выход, и повтор — заметный контраст с находкой
rc.5 «гостю по нерабочей ссылке не дают ни одной кнопки».

**Повторная заявка работает.** `Request to join again` → `POST /meeting/<id>/join` → **202**
`{"status":"waiting","participant_id":"N4P25QW87UR46K9"}` (новый id), экран возвращается в
`waiting` за **381 мс**.

**Впуск.** `Admit QA Bob` → Bob в звонке через **813 мс** (`screen: in-call`, полный тулбар).

**Наблюдение, не находка:** один клик `Request to join again` отправляет `POST …/join` **три раза**
подряд; ответы идентичны и `participant_id` один и тот же, то есть запрос идемпотентен и для
пользователя ничего не меняется. Первый стук из лобби шлёт его дважды. Не выношу — нет видимого
следствия.

### Verified working — проверка устройств в лобби: индикатор уровня, выбор микрофона, Test audio

Поверхность до сих пор почти не проверялась (в логе rc.5 по лобби ничего). Разобрана целиком.

**Индикатор уровня микрофона живой.** `lobby-audio-meter` — полоса 112×6, внутренний элемент
меняет класс ширины. 60 выборок за 20.5 с: `w-0, w-[10%], w-[40%], w-[50%], w-[60%], w-[80%]`
(0 → 89.6 px). Положительный контроль — независимый `AnalyserNode` на том же устройстве в тот же
момент: `energy.max = 0.0283` за 206 выборок. Сигнал есть, индикатор его показывает.

**Выбор микрофона в лобби доезжает до звонка.** Carol выбирает `Fake Audio Input 2` →
`getUserMedia({audio:{deviceId:{exact:"8ea3979…"}}})` в лобби → `Join` → в звонке
`RTCRtpSender.track.label = "Fake Audio Input 2"` (`pcCount: 1`, `state: "live"`).
**Заметно рядом с соседним отчётом:** `aloqa-calls-inside-qa-2026-08-26-A.html` содержит находку
«выбор микрофона **в звонке** не переключает микрофон». Путь через лобби работает; сломан
внутрикольцевой. Это сектор L — передаю как контраст, сам не выношу.

**Test audio работает и уважает выбранный динамик.** Кнопка в строке `Speakers`:
проигрывается `…/sounds/test-tone.wav`, `duration 0.52`, кнопка на время становится
`Playing…` и `disabled`, затем возвращается. После выбора `Fake Audio Output 2` в лобби
у `<audio>` `sinkId = "a2303671b0576cce…"`, что совпадает с deviceId этого устройства
(`enumerateDevices` → `Fake Audio Output 2` = `a2303671b0…`). Гипотеза «тест играет всегда
в устройство по умолчанию» **опровергнута замером**.

**Ограничение стенда:** ровно один `videoinput` (`fake_device_0`), поэтому переключение камеры
на стенде непроверяемо; аудиовходов и выходов по три. (Спасибо полосе B за замер.)

### BUG-2 [Medium] [frontend] Проверка устройств в лобби не называет ни микрофон, ни динамик, которые она проверяет

Лобби существует ради одного вопроса — «то ли устройство я сейчас включу». Оно показывает живой
индикатор уровня и даёт `Test audio`, но **не сообщает, какое устройство при этом используется**:
оба списка показывают placeholder.

**Замер — аккаунт, который выбор ни разу не делал (Bob):**
```
lobby-device-bar → Microphone: aria-label="Microphone on", data-state="on"   (микрофон включён)
getUserMedia лобби:  {"audio":true}                                          (устройство по умолчанию)
combobox aria-label="Select microphone"  показывает:  "Select microphone"
combobox aria-label="Select speaker"     показывает:  "Select speaker"
combobox aria-label="Select camera"      показывает:  "Select camera"
список микрофонов:  Fake Default Audio Input  aria-selected="false"
                    Fake Audio Input 1        aria-selected="false"
                    Fake Audio Input 2        aria-selected="false"
```
Отмеченного пункта нет ни одного, хотя микрофон работает и индикатор уровня в это время движется.

**Положительный контроль — тот же список, тот же экран, аккаунт, который выбор сделал (Carol):**
```
getUserMedia лобби:  {"audio":{"deviceId":{"exact":"8ea3979…"}}}
combobox "Select microphone" показывает:  "Fake Audio Input 2"
список микрофонов:  Fake Default Audio Input  aria-selected="false"
                    Fake Audio Input 1        aria-selected="false"
                    Fake Audio Input 2        aria-selected="true"
```
Значение переживает перезагрузку страницы. То есть компонент **умеет** показать имя устройства и
отметить пункт — он этого не делает ровно в том состоянии, в котором находится каждый новый
пользователь. Динамик у Carol при этом всё ещё «Select speaker», хотя `Test audio` звук выдаёт.

**У продукта есть и нужная формулировка:** внутрикольцевой список устройств подписывает устройство
по умолчанию как `System default device` (текст меню: `MICROPHONE / Fake Default Audio Input /
System default device / Fake Audio Input 1 / Device ID 17fd…e873 / …`). В лобби вместо неё
placeholder.

**Следствие:** человек с гарнитурой и встроенным микрофоном узнаёт из этого экрана, что работает
*что-то*, но не что работает нужное. Обойти можно только выбрав устройство вручную — то есть
перезаписав то, что хотел проверить.

### Почему BUG-1 не идёт в отчёт — разбор дедупа (важно: измерения верны, вывод был неверен)

Все замеры выше воспроизводятся и остаются в силе. В отчёт находка **не идёт**, и причин две,
разного рода. Нашлись поиском по зеркалу ALK на слово `consent` — по списку открытых багов
(188 штук, прочитан весь) они **не видны**, потому что обе в статусах вне правила дедупа.

**1. Отсутствие чекбокса согласия — специфицированное поведение, а не дефект.**
`ALK-1888` [Bug/**TESTING**] «Remove the recording/transcription consent checkbox that gates
joining a call». Дословно из тикета:

> Expected: **Do not require the recording/transcription acknowledgement checkbox to join a call.**
> Fix location: `CallDeepLinkLobby.tsx` (stop passing actionNotice + stop gating canJoin) and
> `useRecordingConsent.ts`.

Тикет описывает и ровно тот механизм, который я измерил:

> `canJoin` requires the acknowledgement checkbox when recording status is `'required'` or
> `'unavailable'`. Status is `'unavailable'` whenever `recording_enabled` is absent pre-join —
> **which is always for members without settings access** — so the checkbox is effectively always
> required (fail-closed).

То есть моё наблюдение «`CallLobbyRecordingConsentNotice` не отрисовывается нигде» — это **и есть
реализация ALK-1888**, а не мёртвый код. Если бы я вынес это как причину, разработчик пошёл бы
возвращать сознательно удалённый чекбокс. Ровно тот случай, о котором предупреждает CLAUDE.md:
выполненное требование неотличимо от поломки.

**2. Механизм «до входа статус записи недоступен» уже заведён.**
`ALK-1847` [Bug/**BLOCKED**] «Recording status недоступен до join, поэтому lobby всегда требует
аварийное acknowledgement». Его Confirmed Root Cause — дословно мой замер:

> Meeting item/list response не содержит `recording_enabled`. Единственный источник —
> `GET /meeting/{id}/settings`. Этот endpoint требует `HasJoined`, поэтому pre-join lobby
> принципиально не может получить status.

Мой замер 403/200 подтверждает это **на rc.7** спустя время: `GET /meeting/<id>/settings` →
403 `REALTIME_ACCESS_DENIED` стоящему в лобби, 200 с `recording_enabled: true` участнику.

**Что у меня есть сверх обоих тикетов** (на случай, если кто-то возьмётся):
- Воспроизведение на **rc.7 `10a407a46be1`** с полными телами ответов; `ALK-1847` заведён по
  локальному стенду (`aloqa-backend dev`, Firefox, localhost).
- **Гостевая посадочная страница `/join/<token>` — её не называет ни один из двух тикетов.**
  `ALK-1847` целиком про lobby участника-члена и про `settings`-эндпоинт; `ALK-1888` про чекбокс.
  Замер: гость на записываемом звонке видит страницу в **98 символов** — «You are invited to
  “QA K30 open” / Enter the name other participants will see. / Your name / Join call»,
  `docHasRecord: false`, `byAttr: []`, `checkboxes: 0`, положительные контроли
  `ctrlByText: 6` и `ctrlDocHas: true` на слово «invited». Входит на `t=450 мс`, и **в той же
  выборке** появляются `call-recording-badge` и «This call is being recorded».
  Внешний человек — тот, у кого меньше всего оснований знать о записи, — узнаёт о ней после входа.
- **Два тикета противоречат друг другу.** `ALK-1888` (TESTING) снимает гейт согласия;
  `ALK-1847` (BLOCKED) в Acceptance Criteria требует «Consent требуется только когда recording
  enabled», то есть чинит гейт, которого больше нет. Кто-то должен решить, какой из двух живой.

**Правило соблюдено, но не расширено.** Правило дедупа CLAUDE.md называет
`issuetype = Bug` и `status IN (Backlog, Ready, In Progress)`. `TESTING` = закрыт, `BLOCKED` — вне
списка. Я **не** подавляю по BLOCKED-тикету как по дубликату: подавление здесь из-за `ALK-1888`,
который делает поведение специфицированным. `ALK-1847` записан как смежный открытый пункт.

**Смежное, тоже не моё:** `ALK-2957` [TESTING] — участник не получает предупреждения о записи
при `access_scope: private`. Другая поверхность (в звонке), другая причина.

### Проверка собственных опросов на голодание (машина под нагрузкой ~81 на 8 ядрах)

Все мои временные утверждения — «первое упоминание пришло в той же выборке, что и вход» — держатся
на плотности опроса. Проверка `samples × interval ≈ durMs`:

| снипет | выборок | интервал | ожидаемо | фактически | вывод |
|---|---|---|---|---|---|
| `a-k30-guestrec` | 40 | 400 мс | 16 000 мс | `finalSample.t = 16100` | норма |
| `a-k30-joinwatch` | 58 | 300 мс | ~17 100 мс | соседние выборки 4159 → 4463 мс (Δ 304) | норма |
| `a-k30-deny-watch` | 42 | 350 мс | ~14 300 мс | переходы 0 / 517 / 3425 / 9191 | норма |
| `a-k30-meter` | 60 | 330 мс | ~19 800 мс | `durationMs = 20527` | норма |

Ни один опрос не деградировал; в самом плотном месте (вход в звонок) шаг был 304 мс при
номинале 300. Утверждения о времени остаются в силе.

### BUG-3 [High] [frontend] Гостю по ссылке-приглашению сообщают имя звонка, пароль и одобрение — но не то, что звонок записывается

Гостевая посадочная страница `/join/<token>` — единственный экран, который внешний человек видит
до входа. Она **управляется данными** и показывает ровно те условия входа, которые приходят ей в
предпросмотре. Запись в этот предпросмотр не входит, поэтому о ней на странице нет ничего.

**Ответ предпросмотра целиком** (`POST /api/guest/preview`, без авторизации,
`{"token":"<token>"}`), три звонка разной конфигурации:

```
QA K30 gpw   (public, пароль, запись НЕ идёт)
  {"status":"valid","meetingName":"QA K30 gpw","passwordProtected":true,"requiresApproval":false}

QA K30 grec  (public, одобрение, запись ИДЁТ — RC4P26ZKVJB4GDJT, started_at 08:41:23,
              status "recording" на 08:47:56)
  {"status":"valid","meetingName":"QA K30 grec","passwordProtected":false,"requiresApproval":true}

QA K30 gopen (public, открытый, запись ИДЁТ)
  {"status":"valid","meetingName":"QA K30 gopen","passwordProtected":false,"requiresApproval":false}
```
Ключей ровно четыре: `status`, `meetingName`, `passwordProtected`, `requiresApproval`.

**Про `omitempty`.** Отсутствие ключа доказано на выборке, которая **содержит** случай, при котором
он был бы заполнен: два из трёх звонков записывались в момент замера. Ключа нет и там.

**Положительный контроль — страница отрисовывает каждое поле, которое ей дают.** Один и тот же
экран, три конфигурации, полный текст:

```
passwordProtected:true   → «You are invited to “QA K30 gpw”  / Enter the name other participants
                            will see. / Your name / Meeting password (private meetings only) /
                            Join call»                         + поле type=password
requiresApproval:true    → «You are invited to “QA K30 grec” / Enter the name hosts will see
                            before they admit you. / Your name / The host will need to approve
                            your entry. / Ask to join»         ← поменялись подсказка, строка И
                                                                 надпись на кнопке
оба false                → «You are invited to “QA K30 gopen” / Enter the name other participants
                            will see. / Your name / Join call»   (99 символов целиком)
```
То есть экран меняет заголовок, подсказку, дополнительную строку и текст кнопки под содержимое
предпросмотра. Единственное, чего он не может сказать, — что идёт запись, потому что этого поля в
ответе нет.

**Замер отсутствия на посадочной странице:** `mentionsRecording: false`,
`byAttrRecordOrConsent: 0` (data-testid + aria-label), `checkboxes: 0`.
Положительный контроль тех же инструментов: `ctrl_invited: true`.

**Узнаёт после входа.** Чистый прогон (`a-k30-guestrec`, 40 выборок за 16100 мс при номинале
400 мс — плотность в норме): `enteredAt = 450 мс`, и **в той же выборке** появляются
`call-recording-badge` и «This call is being recorded». Повторный прогон подтвердил содержание,
но его опрос голодал (41 выборка за 127905 мс), поэтому время беру только из первого.

**Граница (измеренная).** Гостевой предпросмотр — это `apps/web/app/api/guest/preview/route.ts`
(маршрут Next.js в самом веб-приложении, не `/api/v1/...`; путь проверен:
`git cat-file -e 10a407a46be1:apps/web/app/api/guest/preview/route.ts`). Он **не** ходит в
`GET /api/v1/meeting/{id}/settings` и не требует участия в звонке.

**Почему это НЕ дубликат — по критериям приёмки, а не по заголовкам:**
- `ALK-1847` [BLOCKED] — «Единственный источник — `GET /meeting/{id}/settings`, требует `HasJoined`,
  поэтому pre-join lobby принципиально не может получить status». Все три критерия приёмки про
  **lobby участника-члена**. К гостю это рассуждение неприменимо: у гостевого пути **уже есть**
  безопасная неавторизованная проекция — ровно то, что `ALK-1847` предлагает только создать.
- `ALK-1888` [TESTING] — «Do not require the acknowledgement checkbox to join a call», fix location
  назван как `CallDeepLinkLobby.tsx`. Это снятие **блокирующего** чекбокса на **другом** экране.
  Здесь речь не о гейте: строка текста ничего не блокирует. Находка **не просит вернуть чекбокс**.
- `ALK-2957` [TESTING] — про участника в звонке при `access_scope: private`. Другая поверхность.
- Открытые баги (188) прочитаны целиком — совпадений нет.

**Как должно быть.** Гость видит до входа, что звонок записывается, тем же способом, каким ему уже
сообщают про пароль и одобрение — строкой на той же странице.

### Перепроверка находки отчёта rc.5 — экран нерабочей гостевой ссылки: половина починена

Опубликованная находка rc.5 (`aloqa-calls-around-qa-2026-08-26-B.html`, BUG-2) утверждала два
факта. На rc.7 они разошлись.

Звонок `QA K30 gopen` завершён (`status: "ended"`, `ended_at 09:03:04`), его гостевая ссылка:
`POST /api/guest/preview` → 200 `{"status":"invalid"}`.

```
docText целиком: "Join as a guest
                  This invite link is no longer valid.
                  Ask the host for a new invite link.
                  Go to sign in"

перечисление по каждому селектору отдельно (не объединением):
  button            []
  a[href]           [ {A, href:"/login", "Go to sign in", 370x24} ]
  input             []
  [role=button]     []
  [tabindex]        [ {DIV, 420x189} ]   ← контейнер, не орган управления
  focusable всего   1
```

- **«Не дают ни одной кнопки» — больше не воспроизводится.** Есть одна ссылка `/login`.
- **«Говорят, что дело в ссылке, а не в том, что звонок кончился» — воспроизводится дословно.**
  Звонок завершился штатно, а гостю сообщают `This invite link is no longer valid` и советуют
  попросить новую ссылку — новая ссылка не поможет, звонка больше нет.

Отдельно стоит отметить (не выношу как находку, это территория опубликованной): единственный
выход ведёт на `/login`, а у гостя по определению может не быть учётной записи.

**Причина сбоя моего собственного прогона — мой снипет, не продукт.** `a-k30-ring.mjs` начинается
с «чистого листа», который завершает все активные встречи воркспейса, и он погасил звонок,
который я в этот момент использовал. Отсюда же `input[type=text]` → 0 на гостевой странице.

### BUG-3 — уточнение причины: сравнение фронтового маршрута и бэкендового эндпоинта

Гостевой лендинг зовёт `POST /api/guest/preview` (маршрут Next.js в самом веб-приложении,
`apps/web/app/api/guest/preview/route.ts`), который проксирует бэкендовый
`POST /api/v1/meeting/guest/preview`. Оба вызваны **без авторизации** (`auth/me` → 401)
из чистого контекста, один и тот же токен, подряд:

```
POST /api/v1/meeting/guest/preview   200
  {"valid":true,"meeting_name":"QA device check","password_protected":false,"requires_approval":false}

POST /api/guest/preview              200
  {"status":"valid","meetingName":"QA device check","passwordProtected":false,"requiresApproval":false}
```

Соответствие **один в один**, только переименование в camelCase. **Фронт ничего не теряет** —
поля о записи нет уже в проекции бэкенда. Это и есть узкая граница: не «клиент не отрисовал»,
а «значения не существует в том, что клиенту отдают». Поэтому находка помечена `[backend]`,
хотя чинить придётся обе половины (поле в проекции + строка на экране).

**Проекция не заморожена — её уже расширяли.** `ALK-1727` [Task/TESTING], тикет, которым этот
эндпоинт создавали, специфицирует ответ как:

> Response (всегда 200 при валидном JSON): `{ "valid": true, "meeting_name": "Weekly Sync" }`
> или `{ "valid": false }`. `meeting_name` только при `valid:true`.

То есть изначально было **два** поля. Сейчас их четыре: `password_protected` и
`requires_approval` добавлены после. Условия входа в эту проекцию добавляют по мере надобности;
запись в их число не попала.

**Критерии готовности `ALK-1727`** — «лендинг делает preview на входе; мёртвая ссылка fail-fast
без формы; валидная показывает имя встречи; токен только в теле; тесты». Про запись — ничего.
Разработчик, закрывающий этот тикет по его чек-листу, моей находки не коснулся бы.

### Дедуп BUG-2 по всем статусам (не только открытым)

- `ALK-1433` [Bug/**TESTING**] «Device Settings Modal Contains Incorrect Labeling and
  Non-Functional Device Selectors in Meeting Pre-Join Screen». Его Expected result: «modal should
  display correct field labels: Microphone, Speaker, and Camera», «clicking each selector should
  open a dropdown or device list», «user should be able to select and apply preferred devices».
  **Все три выполнены на rc.7** — заголовки секций `MICROPHONE / SPEAKER / CAMERA` есть, списки
  открываются, выбор применяется и переживает перезагрузку (мой замер выше). Ни один критерий не
  про то, **какое устройство показано как текущее**. Не дубликат.
- `ALK-817` [Task/TESTING] «Device settings v2… pre-join picker». Критерий: «Lobby lets you choose
  all three devices before joining (persisted)» — выполнен. Про состояние по умолчанию ничего.
- `ALK-3445` [TESTING] — кнопка проверки динамиков навсегда застревает на `Playing…`. **На rc.7 не
  воспроизводится**: у меня кнопка возвращается из `Playing…` в `Test audio` (замер выше).
- `ALK-3706` [Backlog] — длинные названия устройств обрезаются без многоточия в **дропдауне**.
  Другое: там значение есть и обрезано, у меня значения нет вовсе.
- 188 открытых багов прочитаны; `REVIEW` (55 записей) просмотрен отдельно — совпадений нет.


## Итог прогона

**Опубликовано:** https://claude.ai/code/artifact/7216bbe7-baf9-44f0-924d-eb9bffcdfe60
Файл: `reports/aloqa-calls-entry-qa-2026-08-30-A.html`. Строка в `reports/README.md` дописана.

**2 находки** — 1 High (backend), 1 Medium (frontend). Сборка одна на весь прогон:
`v0-61-0-rc-7-10a407a46be1`.

**Проверки перед публикацией:**
- `scripts/verify_report.py` → `ALL CHECKS PASS` (заголовки, соответствие строк таблицы статьям,
  секции, важности, утечки, баланс тегов; объём прозы 170 и 164 слова при бюджете 120–180).
- `scripts/check_repro.py` → `2/2 findings have a block`.
- `scripts/verify_snippets.py A` → **`2/2 reach their screen`**, оба `ready=true`,
  `steps` совпадает с числом `progress()`.
- Цитата одна, проверена: `git cat-file -e 10a407a46be1:apps/web/app/api/guest/preview/route.ts`
  → EXISTS. Бэкендовых цитат нет намеренно (у бэкенда нет стампа сборки).
- Строки «не сломать» в разделах **Проверка** — обе проверены на живой сборке **сегодня**, а не
  написаны из ожидания: поле пароля и строка одобрения на гостевом экране; сохранение явного
  выбора устройства, индикатор уровня и `Test audio` в выбранный динамик.

**Главное методическое за прогон.** Собственная находка снята перед публикацией: «до входа
нигде не сказано, что идёт запись» для участника-члена оказалась **специфицированным** поведением
(`ALK-1888`, TESTING) поверх уже заведённого механизма (`ALK-1847`, BLOCKED). Оба невидимы для
`jira_cache.py list --open-bugs` — 188 открытых багов прочитаны целиком и не дали совпадений,
а один `grep 'consent'` по всему зеркалу нашёл оба за секунду. Моё наблюдение «компонент
уведомления не отрисовывается нигде» было не мёртвым кодом, а **реализацией** удаления.
Гостевая половина при этом выжила и усилилась: критерии приёмки обоих тикетов называют только
lobby участника и чекбокс, `/join/<token>` не называет ни один, а у гостевого пути **своя**
неавторизованная проекция, что снимает аргумент «pre-join принципиально не может знать».

**Стенд на выходе:** alice 9222, bob 9223, carol 9224 — все подписаны своими аккаунтами
(`ensure.sh A alice bob carol` → ready), активных встреч нет. Фикстуры лейна A не трогались.
Гостевые контексты создавались через `browser.newContext()` и умирают вместе с CDP-соединением —
следов не оставляют.

**Не пройдено, с причиной:**
- Переключение камеры между устройствами — на стенде один `videoinput` (`fake_device_0`).
- Лайфцикл дозвона 1-to-1 (исходящий/входящий/decline/no answer): контрол вызова в заголовке DM
  не нашёлся, инструмент не доведён. Не «сломано» — **не проверено**. В rc.5 этот путь пройден
  целиком и признан рабочим.
- Лимит участников у двери и запуск запланированной встречи — покрыты проходом rc.5, сюда не
  дублировал.

